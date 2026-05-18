---
description: Жизненный цикл процесса Node.js — bootstrap, сигналы, graceful shutdown и коды выхода
---

# Жизненный цикл процесса Node.js: bootstrap, сигналы и завершение

Источник: [theNodeBook — Node.js Process Lifecycle](https://www.thenodebook.com/node-arch/node-process-lifecycle)

Жизненный цикл процесса Node.js начинается до запуска вашего entry‑файла. Исполняемый файл `node` разбирает флаги CLI, инициализирует V8, создаёт isolate и context, поднимает libuv, регистрирует нативные модули, выполняет внутренний bootstrap‑скрипт, загружает entry‑модуль и удерживает процесс живым, пока существуют referenced handles, requests, таймеры, сокеты, workers или дочерние процессы.

Старт, runtime и shutdown разделяют состояние через объект `process` и нативные handles под ним. Медленный путь `require()` откладывает готовность. Referenced‑таймер не даёт процессу завершиться. Отсутствие обработки `SIGTERM` приводит к тому, что Kubernetes или systemd убивают процесс после grace‑периода. Необработанное исключение делает состояние приложения недоверенным: обработчик должен залогировать ошибку, запустить shutdown и позволить процессу выйти.

Практический смысл запроса `node.js process lifecycle`: порядок bootstrap, стоимость загрузки модулей, обработка сигналов, graceful shutdown, очистка active handles, поведение памяти и exit codes.

## Последовательность запуска процесса Node.js

Команда `node my_app.js` запускает цепочку событий задолго до первой строки вашего JavaScript. Обычно кажется, что Node «просто стартует» — на деле это согласованная работа C++, V8 и внутреннего bootstrap‑скрипта. Медленный старт и странности окружения часто коренятся именно здесь.

Точка входа — не ваш `.js`, а C++‑код в исходниках Node.

Упрощённая последовательность в C++:

1.  **`main`.** Парсинг аргументов CLI (`--inspect`, `--max-old-space-size` и т.д.), базовые свойства процесса.
2.  **Инициализация V8.** Общие ресурсы (в т.ч. потоки для фоновых задач вроде GC). Выполняется один раз.
3.  **V8 Isolate.** Изолированный экземпляр движка со своим heap и GC. Тяжёлая операция; сразу резервируется значительный объём памяти под heap.
4.  **V8 Context** внутри isolate. Среда выполнения с `Object`, `Array`, `JSON`; здесь живёт `global`.
5.  **Инициализация libuv Event Loop.** Основа неблокирующего I/O. Цикл создаётся, но пока не крутится.
6.  **Настройка libuv Threadpool.** Пул потоков для операций, которые ОС может выполнять блокирующе (`fs`, DNS, часть `crypto`/`zlib`), не блокируя главный event loop.
7.  **`node::Environment`.** Связывает isolate, context и libuv loop.
8.  **Регистрация Native Modules.** Встроенные модули (`fs`, `http`, `crypto`) — C++‑компоненты; на этом этапе они регистрируются для последующего `require()`.
9.  **Bootstrap Script.** Первый запуск JavaScript — не вашего: `lib/internal/bootstrap/node.js` строит объект `process`, функцию `require` и JS‑оболочку API.
10. **Загрузка вашего кода.** Только после всего выше loader читает и выполняет `my_app.js`.

```text
CLI / main
    → V8 (platform)
        → Isolate → Context
            → libuv (loop + thread pool)
                → node::Environment
                    → register builtins
                        → bootstrap/node.js
                            → ваш entry module
```

Это не бесплатно: сотни миллисекунд, иногда секунды до первой строки приложения. В serverless cold start каждая миллисекунда на счету; снимки heap V8 и предкомпиляция могут сократить часть этих шагов.

## Инициализация V8 и нативных модулей

После C++‑каркаса задаётся профиль производительности и памяти всего приложения.

### Выделение heap и JIT

Создание isolate — запрос к V8 на большой непрерывный блок памяти под JavaScript heap. Размер настраивается (`--max-old-space-size`); дефолт заметный. Запрос памяти у ОС под нагрузкой может быть медленным.

Распространённое заблуждение: JIT «прогревается» при старте. Нет — JIT ленивый; оптимизированный машинный код появляется после «разогрева» функций на реальном трафике. При bootstrap V8 в основном интерпретирует внутренний скрипт.

!!!note ""

    V8 часто резервирует большой виртуальный диапазон под heap и применяет лимиты, но ОС может физически не коммитить всю память сразу. Поведение зависит от платформы и флагов (`--max-old-space-size`, `--initial-old-space-size`).

### Подключение нативных модулей

`fs`, `http`, `crypto` — мост между JS и ОС (обычно C++).

При bootstrap Node **не загружает** все встроенные модули сразу — только **регистрирует** их: карта имён (`'fs'`) → указатели на C++‑функции.

Первый `require('fs')`:

1.  `require` видит built-in.
2.  Поиск в внутренней карте.
3.  Вызов C++‑инициализации.
4.  Создание JS‑объекта модуля с обёртками (`readFileSync`, `createReadStream` и т.д.).
5.  Кэширование в `require.cache` и возврат.

Lazy load экономит старт: без `crypto` — без его полной инициализации. Но **первый** `require('crypto')` в hot path запроса может добавить 100+ ms (OpenSSL, контексты). Решение: `require('crypto')` на этапе bootstrap в `server.js` — предсказуемость важнее, чем +100 ms к cold start.

## Загрузка модулей при старте Node.js

`require()` кажется мгновенным — опасное допущение. Алгоритм разрешения и кэш сильно влияют на время старта и память.

Типичный инцидент: в production старт ~60 с, на ноутбуке — 3 с. Оркестратор убивает pod → crash loop.

Флаг `node --trace-sync-io` показывает синхронный I/O на главном потоке. Часто виновник — `fs.readFileSync` **внутри** `require()`.

`require()` — синхронная операция с файловой системой.

Для `'./utils'` или `'express'`:

-   core (`'fs'`) — быстро;
-   `./` / `../` — перебор `.js`, `.mjs`, `.json`, `.node`, `package.json` `"main"`, `index.js`;
-   bare name (`'express'`) — обход `node_modules` вверх по дереву; каждая проверка — sync FS.

Затем `require.cache`:

-   **hit** — возврат `exports` (lookup в hash map);
-   **miss** — новый `Module`, `fs.readFileSync`, компиляция и выполнение.

Обёртка модуля:

```javascript
(function (
    exports,
    require,
    module,
    __filename,
    __dirname
) {
    // код модуля
});
```

45‑секундный старт часто = огромное `node_modules` + сотни sync‑проверок на медленном NFS.

Исправления: bundler для production (Webpack/esbuild — только нужные части), аудит и уплощение зависимостей.

!!!warning ""

    Не бандлите весь сервер Node.js целиком без необходимости: ломаются dynamic import и native addons. Для точечных правок — `esbuild` только на критичных участках.

**«Бомба» `require.cache`.** Динамический `require` с уникальным путём:

```javascript
function renderReport(templateName) {
    // templateName = '/tmp/report-1662781800.js'
    const template = require(templateName); // НИКОГДА так не делайте
    return template.render();
}
```

Каждый путь — новый модуль в кэше навсегда → гигабайты RAM. Вместо этого — движки шаблонов с precompile и eviction, или `fs.readFile` + `vm` с короткоживущими контекстами.

!!!note ""

    Записи `require.cache` можно удалять (`delete require.cache[path]`), но `require` для пользовательского динамического кода небезопасен. Для шаблонов — `fs.readFile` + `vm` с явными лимитами кэша и мониторингом.

Каждый `require()` — потенциальный bottleneck и постоянный вклад в память процесса.

## ES‑модули при старте процесса

CommonJS (`require`) vs ESM (`import`/`export`) — разные жизненные циклы загрузки.

`import` не «синтаксис для require»: асинхронный, статический, с фазами. `require` — синхронный, динамический, смешивает поиск, загрузку и выполнение.

### Три фазы ESM

1.  **Construction (парсинг).** Node читает только `import`/`export`, строит граф зависимостей без выполнения логики. Ошибки видны до старта приложения.
2.  **Instantiation.** Выделение памяти под экспорты, «проводка» import → export (live bindings, не копии). Значений ещё нет.
3.  **Evaluation.** Выполнение кода снизу вверх по графу.

!!!note ""

    Динамический `import()`, условные импорты и loaders меняют граф в runtime — не всё известно на этапе Construction.

### Подводные камни CJS → ESM

`__filename` и `__dirname` в ESM — `ReferenceError`:

```javascript
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(join(__dirname, 'logs.txt'));
```

**Top-level `await`:**

```javascript
// CJS — обёртка async function main() { ... } main();

import { connectToDatabase } from './database.js';

console.log('Connecting to database...');
const db = await connectToDatabase();
console.log('Database connected!');

import { startServer } from './server.js';
startServer(db);
```

Процесс ждёт на этапе Evaluation, пока promise не разрешится.

### Практический эффект

-   Теоретически параллельная загрузка по графу (в отличие от «конга» sync `require`).
-   Статический анализ и tree shaking (Rollup/Webpack).
-   Module Map вместо публичного `require.cache` — стабильнее, без «хаков» перезагрузки.

Экосистема ещё в переходе: пакеты только под CJS — dynamic `import()`. Направление — ESM для крупных приложений.

## Паттерны bootstrap приложения

После внутреннего bootstrap Node передаёт управление вашему entry‑файлу: конфиг, БД, HTTP‑сервер.

Типичный, но проблемный паттерн:

```javascript
console.log('Process starting...');

const config = require('./config');
const database = require('./database');
const logger = require('./logger');

database
    .connect(config.db)
    .then(() => {
        console.log('Database connected.');
        const app = require('./app');
        const server = app.listen(config.port, () => {
            console.log(
                `Server listening on port ${config.port}`
            );
        });
    })
    .catch((err) => {
        console.error('Bootstrap failed.', err);
        process.exit(1);
    });
```

Проблемы:

-   Top-level `require()` блокируют старт.
-   Падение БД → `exit(1)` → Kubernetes `CrashLoopBackOff` и нагрузка на БД.
-   Порядок `require` создаёт гонки, если `./app` ожидает подключённую БД.

### Async initializer

```javascript
class Application {
    constructor() {
        this.config = null;
        this.db = null;
        this.server = null;
    }

    async start() {
        console.log('Starting application bootstrap...');

        try {
            this.config = require('./config');

            console.log('Connecting to database...');
            this.db = require('./database');
            await this.db.connect(this.config.db, {
                retries: 5,
                delay: 1000,
            });
            console.log('Database connected.');

            const app = require('./app')(this.db);
            this.server = app.listen(this.config.port);

            await new Promise((resolve) =>
                this.server.on('listening', resolve)
            );
            console.log(
                `Server is ready on port ${this.config.port}.`
            );
        } catch (error) {
            console.error(
                'FATAL: Application failed to start.',
                error
            );
            await this.stop();
            process.exit(1);
        }
    }

    async stop() {
        // shutdown
    }
}

const app = new Application();
app.start();
```

!!!warning ""

    Для retry используйте exponential backoff с jitter, библиотеки вроде `p-retry`, идемпотентность или блокировки, circuit breaker — не бесконечный цикл одинаковых попыток.

Плюсы: явный порядок, устойчивость к сбоям сети, dependency injection, сигнал «ready» по событию `listening`.

Bootstrap — не «запустить сервер», а запустить **предсказуемо, устойчиво и наблюдаемо**.

## Обработка сигналов в Node.js

Остановка идёт через **сигналы** ОС.

-   **`SIGINT`** — `Ctrl+C`.
-   **`SIGTERM`** — «завершитесь корректно»; основной сигнал Kubernetes. **Главный shutdown‑сигнал.**
-   **`SIGHUP`** — перезагрузка конфига у демонов.
-   **`SIGKILL`** — нельзя перехватить; мгновенное убийство после истечения grace.
-   **`SIGUSR1` / `SIGUSR2`** — пользовательские (heap dump и т.д.).

!!!warning ""

    Для кроссплатформенного shutdown обрабатывайте `SIGINT` и `SIGTERM`; `SIGUSR1` на Windows не поддерживается. Для Windows‑сервисов добавьте программный триггер (IPC).

```javascript
console.log(`My PID is: ${process.pid}`);

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Starting shutdown...');
    // graceful shutdown
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT.');
});

process.on('SIGUSR2', () => {
    console.log('Received SIGUSR2. Debug dump...');
});

setInterval(() => {}, 1000);
```

Тест: `kill -s SIGTERM <PID>`.

!!!note ""

    Если в обработчике сигнала не вызвать `process.exit()`, процесс может не завершиться по `SIGINT`/`SIGTERM`. `Ctrl+Z` отправляет `SIGTSTP` (приостановка).

### Проблемы обработки сигналов

Обработчик `SIGTERM` «не срабатывает» → через `terminationGracePeriodSeconds` приходит `SIGKILL`.

Причина может быть в библиотеке, которая делает `process.removeAllListeners('SIGTERM')` перед своим handler.

!!!note ""

    Без `removeAllListeners` каждый `process.on` **добавляет** обработчик; при сигнале выполняются все по порядку. Опасность — библиотека, которая **удаляет** чужие listeners.

В signal handler не делайте тяжёлую async‑работу — только флаг; shutdown выполняет основная логика:

```javascript
let isShuttingDown = false;

function gracefulShutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;
    console.log('Shutdown initiated. Draining requests...');

    server.close(async () => {
        console.log('Server closed.');
        await database.close();
        console.log('Database closed.');
        process.exitCode = 0;
        // дождаться опустошения loop или process.exit(0) в конце
    });

    setTimeout(() => {
        console.error(
            'Graceful shutdown timed out. Forcing exit.'
        );
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

Таймаут — страховка до `SIGKILL`.

!!!warning ""

    Один центральный shutdown manager / event bus вместо десятка `process.on` в модулях. Можно обернуть `process.on` и логировать удаление listeners.

## Graceful shutdown в Node.js

Контролируемое завершение: доделать работу, сохранить целостность данных, закрыть соединения. Обратный bootstrap — освобождение ресурсов.

Состояния: **Accepting Traffic → Draining → Closed**.

1.  **Прекратить приём новой работы.** Для HTTP — `server.close()` (новые соединения не принимаются; текущие дорабатывают).
2.  **Draining.** Дождаться in-flight запросов, транзакций, сообщений очереди. `server.close()` callback — закрытие TCP, не обязательно конец логики handler.
3.  **Очистка ресурсов.** Пулы БД, Redis, RabbitMQ, flush логов — **после** draining.
4.  **Выход с кодом 0** — успешное завершение.

```javascript
class ShutdownManager {
    constructor(server, db) {
        this.server = server;
        this.db = db;
        this.isShuttingDown = false;
        this.SHUTDOWN_TIMEOUT_MS = 15_000;

        process.on('SIGTERM', () =>
            this.gracefulShutdown('SIGTERM')
        );
        process.on('SIGINT', () =>
            this.gracefulShutdown('SIGINT')
        );
    }

    async gracefulShutdown(signal) {
        if (this.isShuttingDown) return;
        this.isShuttingDown = true;
        console.log(
            `Received ${signal}. Starting graceful shutdown.`
        );

        const timeout = setTimeout(() => {
            console.error(
                'Shutdown timed out. Forcing exit.'
            );
            process.exit(1);
        }, this.SHUTDOWN_TIMEOUT_MS);

        try {
            await new Promise((resolve, reject) => {
                this.server.close((err) => {
                    if (err) return reject(err);
                    console.log('HTTP server closed.');
                    resolve();
                });
            });

            // здесь — ожидание in-flight запросов

            if (this.db) {
                await this.db.close();
                console.log('Database pool closed.');
            }

            console.log('Graceful shutdown complete.');
            clearTimeout(timeout);
            process.exit(0);
        } catch (error) {
            console.error(
                'Error during graceful shutdown:',
                error
            );
            clearTimeout(timeout);
            process.exit(1);
        }
    }
}

// new ShutdownManager(server, db);
```

`process.exit()` — не «чистый» shutdown, а обрыв event loop и отмена pending async. Вызывать только в конце цепочки после очистки. Для статуса предпочтительнее `process.exitCode`.

## Active handles и управление ресурсами

Процесс «висит» после закрытия сервера — почти всегда утекающий **handle** (libuv): сервер, сокет, `setTimeout`/`setInterval`, child process.

По умолчанию handles **referenced** — event loop не завершится, пока они есть.

```javascript
// процесс не завершится
setInterval(() => {
    console.log('Still here...');
}, 1000);
```

`.unref()` — «можно выходить без меня»:

```javascript
const timer = setInterval(() => {
    console.log("You won't see me.");
}, 1000);

timer.unref();
```

`EMFILE: too many open files` часто от сокетов в `CLOSE_WAIT` после `SIGKILL` без корректного shutdown.

### Демонстрация «зависшего» shutdown

```javascript
const http = require('node:http');

const PORT = 8080;
const activeSockets = new Set();

const server = http.createServer((req, res) => {
    setTimeout(() => {
        res.writeHead(200, {
            'Content-Type': 'text/plain',
        });
        res.end('Hello from the slow server!\n');
    }, 20000);
});

server.on('connection', (socket) => {
    activeSockets.add(socket);
    socket.on('close', () => activeSockets.delete(socket));
});

server.listen(PORT, () => {
    console.log(
        `Server on port ${PORT}, PID: ${process.pid}`
    );
});

function shutdown() {
    console.log('SIGTERM: closing HTTP server...');

    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('All connections closed.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Force shutdown: destroying sockets');
        for (const socket of activeSockets) {
            socket.destroy();
        }
    }, 5000);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

Сценарий: `curl http://localhost:8080` (ждёт 20 с) → `kill <PID>` → через 5 с принудительный `socket.destroy()`.

!!!note ""

    В Node 18+ для keep-alive: `server.closeAllConnections()` / `server.closeIdleConnections()` плюс application-level draining.

### Отладка утечек handles

`process._getActiveHandles()` — только для отладки, API нестабилен; в production — пакеты вроде `wtfnode`.

```javascript
const net = require('node:net');

function printActiveHandles() {
    console.log('--- Active Handles ---');
    process._getActiveHandles().forEach((handle) => {
        console.log(`Type: ${handle.constructor.name}`);
    });
    console.log('----------------------');
}

const server = net.createServer(() => {}).listen(8080);
const timer = setInterval(() => {}, 5000);

server.close();
clearInterval(timer);
setTimeout(printActiveHandles, 100);
```

!!!note ""

    GC освобождает память, но не file descriptors и сокеты. Открыли — закройте. `createServer` → `.close()` в shutdown.

## Память: жизненный цикл и heap

RSS растёт при старте: инициализация V8 heap и рост `require.cache` (для крупных приложений 100–500 MB только кэш модулей).

```text
Memory (RSS)
  ^
  |      +-------------------------> фаза 2: плато
  |     /
  |    /  <-- рост require.cache
  |   /
  |  /   <-- init V8 heap
  +-------------------------------------> время
    ^
    старт процесса
```

Логируйте `process.memoryUsage()` до и после массовых `require`.

В runtime — «пила»: `heapUsed` растёт на запросах, GC опускает. Утечка — когда **минимумы** пилы со временем растут.

**External memory** (`Buffer` вне V8 heap): RSS может быть огромным при «нормальном» heap — OOM при смотрении только на heap snapshots.

## Коды выхода и состояния процесса

`0` — успех; иначе — ошибка. По умолчанию необработанное исключение → `1`.

-   **`process.exit(code)`** — немедленное завершение; для серверов избегать.
-   **`process.exitCode = code`** — код при естественном выходе после закрытия handles.

```javascript
async function gracefulShutdown(error) {
    // cleanup ...

    if (error) {
        console.error(
            'Shutting down because of an error:',
            error
        );
        process.exitCode = 1;
    } else {
        console.log('Shutdown completed successfully.');
        process.exitCode = 0;
    }
}
```

### Зачем коды выхода в production

Kubernetes смотрит exit code: non-zero → restart (по `restartPolicy`).

Собственные коды упрощают алерты:

-   `70` — БД недоступна при старте;
-   `71` — невалидный конфиг;
-   `72` — порт занят.

!!!note ""

    Выход с `0` при падении подключения к БД обманывает оркестратор — тихие сбои до жалоб пользователей.

## Дочерние процессы и cluster

!!!note ""

    Подробно `child_process`, `worker_threads` и `cluster` — в отдельных главах. Здесь — границы ответственности родителя.

**`cluster`:** master получает `SIGTERM`, вызывает `worker.disconnect()`, workers делают свой graceful shutdown; master выходит после `exit` всех workers — без «thundering herd».

**`child_process`:** дочерние процессы **не умирают** при гибели родителя без явной очистки — становятся сиротами у PID 1.

```javascript
const { spawn } = require('node:child_process');
const children = [];

const child = spawn('node', ['worker.js']);
children.push(child);

process.on('SIGTERM', () => {
    children.forEach((c) => c.kill('SIGTERM'));

    Promise.all(
        children.map(
            (c) =>
                new Promise((resolve) =>
                    c.on('close', resolve)
                )
        )
    ).then(() => {
        console.log('All children exited. Parent exiting.');
        process.exit(0);
    });
});
```

!!!warning ""

    Завершайте дочерние процессы при shutdown родителя — это не edge case, а обязанность.

## Отладка проблем жизненного цикла

| Проблема | Инструмент |
| --- | --- |
| Медленный старт | `node --cpu-prof --cpu-prof-name=startup.cpuprofile server.js` → Chrome DevTools Performance |
| Блокирующий I/O при старте | `node --trace-sync-io server.js` |
| Рост памяти | Heap snapshots (`node:v8`), сравнение в DevTools Memory |
| Процесс не выходит | `process._getActiveHandles()`, `lsof -p <PID>` |
| Внезапная смерть | `uncaughtException`, `unhandledRejection` → лог и shutdown, **не** продолжать работу |

```javascript
const v8 = require('node:v8');

process.on('SIGUSR2', () => {
    const filename = v8.writeHeapSnapshot();
    console.log(`Heap snapshot: ${filename}`);
});
```

### Делайте

-   Профилируйте старт (`--cpu-prof`).
-   Lazy load редких зависимостей внутри handler, не top-level.
-   Реальный graceful shutdown: `SIGTERM` → stop accept → drain → cleanup.
-   Каждый `createServer`/`connect` — парный `close`/`disconnect` в shutdown.
-   Осмысленные exit codes.
-   Завершайте child processes.

### Не делайте

-   Sync I/O и тяжёлый CPU на top-level при старте.
-   `process.exit()` как «shutdown» для серверов.
-   Динамический `require(variable)`.
-   Игнорировать `SIGTERM`.
-   Слепо доверять библиотекам с signal handlers.
-   Продолжать после `uncaughtException`.

### Чеклист production

-   Измерен ли startup time?
-   Стратегия модулей (bundle / lazy-load)?
-   Обработчики `SIGTERM` и `SIGINT`?
-   Все ресурсы закрываются при shutdown?
-   Корректные exit codes для разных сбоев?
-   Очистка children при spawn?

Процесс — граница runtime, которую платформа стартует, наблюдает, сигналит и завершает. Node даёт hooks на каждом этапе; production‑код должен использовать их осознанно.

## Связанное чтение

-   Предыдущая: [Event loop Node.js: фазы, микрозадачи и libuv](./event-loop-intro.md)
-   Далее: [Что такое Buffer в Node.js](../buffers/what-is-buffer.md)
