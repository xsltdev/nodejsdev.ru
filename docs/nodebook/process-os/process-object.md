---
description: Объект process в Node.js — env, argv, память, версии, IPC и нативная реализация
---

# Объект process в Node.js: env, argv, память и IPC

Источник: [theNodeBook — process Object](https://www.thenodebook.com/process-os/process-object)

Глобальный `process` в Node.js — JavaScript‑поверхность над текущим процессом ОС. Через него доступны аргументы командной строки, переменные окружения, идентификаторы процесса, рабочий каталог, коды выхода, счётчики памяти, версии компонентов, IPC‑каналы и хуки runtime. `process.argv` отражает аргументы программы. `process.execArgv` — флаги самого Node. `process.env` — переменные окружения.

Большинство свойств — представления нативного состояния, захваченного или открытого при bootstrap. Часть — снимки на момент старта, часть — «живые» мосты в состояние процесса. Изменения process‑wide данных меняют текущий процесс целиком; библиотекам стоит относиться к таким записям осторожно.

## Объект process в Node.js

У каждой программы Node.js есть один глобальный `process`. Вы уже пользовались им: `process.env.NODE_ENV`, `process.exit(1)`, возможно `process.argv` для CLI‑флага. Чаще всего его воспринимают как «мешок конфигурации», не заглядывая в механику. На деле глобал делает гораздо больше, чем хранит строки.

Глобал `process` (разобран в [Главе 1 — архитектура Node.js](../node-arch/what-is-nodejs.md)) — экземпляр `EventEmitter`, под капотом C++‑объект с состоянием процесса ОС. Каждое чтение свойства и каждый вызов метода пересекают границу V8 → нативные биндинги; часть переходов дороже, чем кажется. Одни свойства — снимки при старте и «заморожены». Другие при каждом обращении снова спрашивают ОС. Различать типы важно и для производительности, и для корректности.

## process.env

Многих удивляет: `process.env` выглядит как обычный JavaScript‑объект — чтение, запись, `delete`, `Object.keys()`. Но это ловушка — буквально trap: на уровне C++ перехват операций со свойствами, каждая операция в JS превращается в системный вызов.

```javascript
console.log(process.env.HOME);
process.env.MY_VAR = 'hello';
delete process.env.MY_VAR;
console.log(Object.keys(process.env).length);
```

Каждая строка идёт в свой C++‑колбэк. Чтение `process.env.HOME` — через `uv_os_getenv()` libuv, а не кэшированный lookup в куче V8. На POSIX libuv читает копию массива `environ` процесса — списка `KEY=VALUE`, который ядро передаёт новому процессу при старте.

Запись вызывает `uv_os_setenv()`. Удаление — `uv_os_unsetenv()`. `Object.keys(process.env)` обходит весь `environ`, конвертируя каждую запись в JS‑строку — **каждый раз заново**. Кэша нет. Ленивой инициализации нет. Каждый доступ — round trip в C.

### Ловушка приведения к строке

Ограничение жёсткое: **всё — строка**. Без исключений.

```javascript
process.env.PORT = 3000;
console.log(typeof process.env.PORT);
console.log(process.env.PORT === 3000);
```

В лог попадёт `"string"` и `false`. Вы присвоили число `3000`, но C++‑setter вызывает у V8 `ToString()` перед записью в окружение. На уровне ОС окружение — плоская map «строка → строка»; тип JavaScript не сохраняется.

То же с булевыми: `process.env.VERBOSE = true` → `"true"`. `process.env.COUNT = undefined` → `"undefined"`. `process.env.VALUE = null` → `"null"`. Любое значение проходит `ToString()` до C‑setter.

Классическая ошибка в конфигурации:

```javascript
if (process.env.ENABLE_CACHE) {
    // Выполнится даже при ENABLE_CACHE === "false"
    // потому что "false" — непустая строка, truthy
}
```

Нужно явное сравнение:

```javascript
const cacheEnabled = process.env.ENABLE_CACHE === 'true';
const port = parseInt(process.env.PORT, 10) || 3000;
const maxRetries = Number(process.env.MAX_RETRIES) || 3;
```

Отсутствующая переменная: `process.env.NONEXISTENT` → `undefined`, как у обычного свойства. C++‑getter вызывает `getenv()`, получает NULL и возвращает `undefined` в V8. Ключа `NONEXISTENT` в блоке окружения нет.

Значит `'NONEXISTENT' in process.env` → `false`, и `Object.keys(process.env)` её не включает. Поведение корректное, но путь в коде другой, чем у обычного объекта.

### Наследование и изоляция

Переменные окружения наследуются от родительского процесса. `node app.js` копирует окружение оболочки целиком при `fork()`/`exec()`. Это **копия**: правки `process.env` в Node не затрагивают родительский shell и соседние процессы. Поток информации один — от родителя к ребёнку в момент spawn.

Порождение дочернего процесса (подробно в **Главе 15 — дочерние процессы**) по умолчанию передаёт текущий `process.env` ребёнку — снова как копию. Переопределение — опцией `env` у `child_process.spawn()`:

```javascript
const { spawn } = require('node:child_process');
spawn('node', ['worker.js'], {
    env: { ...process.env, WORKER_ID: '3' },
});
```

Spread строит plain object из `process.env` — для каждого ключа срабатывает enumerator, для каждого значения getter: сотни нативных вызовов при большом окружении. Потом добавляется ключ. Потом `spawn()` сериализует всё обратно в C‑блок `environ` для ребёнка. По коду кажется просто; по факту работы много.

### Распространённые соглашения об окружении

`NODE_ENV` — development/production во многих библиотеках: Express меняет вывод ошибок, webpack — оптимизацию, ORM — логирование запросов. `PORT` — стандарт для порта слушания (Heroku, Railway и др. подставляют сами). `DEBUG` — фильтрованный вывод модуля `debug`.

Это **соглашения**, не правила Node. Сам runtime `NODE_ENV` не интерпретирует. Библиотеки по‑разному проверяют значения: `'production'`, `'prod'`, иногда `!== 'development'` — опечатка `'producton'` тихо оставляет «продакшен‑режим».

Паттерн `dotenv`: чтение `.env`, разбор строк `KEY=VALUE`, цикл `process.env[key] = value`. Без магии — каждое присваивание в C++‑setter и `setenv()` в C runtime. Библиотека — парсер файла, вызывающий `setenv()` в цикле.

### Кэшируйте чтения окружения

Каждый доступ к `process.env` — нативный вызов. В горячем цикле повторное чтение той же переменной медленнее локальной переменной: на системе с сотнями переменных `getenv()` делает линейный проход по `environ`.

```javascript
const nodeEnv = process.env.NODE_ENV;
const dbUrl = process.env.DATABASE_URL;
```

Один раз при старте — в конфиг‑модуль. В продакшене встречается `process.env.DATABASE_URL` внутри обработчика запроса, тысячи раз в секунду. URL между запросами не меняется; вы платите за нативный вызов и линейный поиск на каждый запрос.

Грубый ориентир: ~100 переменных, 10 млн чтений `process.env.PATH` — порядка 3–4 с; 10 млн чтений локальной переменной — ~15 мс. На сервере с тысячами RPS это заметно в p99.

!!!warning ""

    Не используйте `if (process.env.FLAG)` для булевых флагов. Непустая строка `"false"` — truthy. Сравнивайте явно: `=== 'true'`.

## process.argv

`process.argv` — обычный JavaScript‑массив. Без C++‑ловушек и специальных accessor'ов. Заполняется один раз при bootstrap и не меняется самим Node (технически можно `push`/`splice` — но это странно).

Структура всегда одна и та же:

```javascript
// Запуск: node app.js -port 8080 -verbose
console.log(process.argv[0]); // '/usr/local/bin/node'
console.log(process.argv[1]); // '/home/user/app.js'
console.log(process.argv[2]); // '-port'
console.log(process.argv[3]); // '8080'
console.log(process.argv[4]); // '-verbose'
```

Индекс 0 — абсолютный путь к бинарнику Node (как `process.execPath`). Индекс 1 — абсолютный путь к исполняемому скрипту. С индекса 2 — аргументы пользователя после имени скрипта, разбитые по пробелам.

Частый приём — отбросить первые два элемента:

```javascript
const args = process.argv.slice(2);
```

Дальше всё равно нужен разбор: `-port` — флаг со значением? `8080` — значение `-port` или позиционный аргумент? `-p 8080`? `-port=8080`?

### Разбор через util.parseArgs()

Ручной цикл над флагами быстро надоедает. С Node v18.3.0 есть встроенный `util.parseArgs()`:

```javascript
const { parseArgs } = require('node:util');
const { values, positionals } = parseArgs({
    options: {
        port: { type: 'string', short: 'p' },
        verbose: { type: 'boolean', short: 'v' },
    },
});
```

При `-port 8080 -verbose` или `-p 8080 -v` в `values` будет `{ port: '8080', verbose: true }`. `positionals` — позиционные аргументы (не начинающиеся с `-`).

По умолчанию строгий режим: неизвестный флаг → `TypeError`. `strict: false` — неизвестные флаги тихо попадают в `values` как boolean, а не в `positionals`. Для подкоманд, валидации и help — `commander`, `yargs`. `parseArgs()` закрывает типичные 80%: «несколько флагов, разобрать».

Граничный случай: `-` останавливает разбор флагов. Всё после `-` — позиционные, даже если начинается с `-`. При конфигурации `options` позиционные по умолчанию выключены — нужен `allowPositionals: true`, иначе `TypeError`. С ним `node app.js -verbose - -port 8080` даёт `verbose: true` и `positionals: ['-port', '8080']`. Разделитель `-` — POSIX‑соглашение, которое следуют большинство парсеров.

### argv0 и execPath

Два связанных свойства. `process.argv0` — исходный `argv[0]` от ОС до разрешения symlink и правок Node. `process.execPath` — разрешённый абсолютный путь к бинарнику Node. Чаще совпадают; расходятся при запуске через symlink.

Если `/usr/local/bin/node` → symlink на `/usr/local/lib/node/v24/bin/node`, то `argv0` может быть просто `node` (как нашёл shell через `PATH`), а `execPath` — полный путь. Для spawn дочерних процессов обычно нужен `execPath` — тот же бинарник Node.

## process.exit(), exitCode и события выхода

Коды выхода (в [Главе 1 — жизненный цикл процесса](../node-arch/node-process-lifecycle.md)) сообщают родителю об успехе или сбое. Два пути: дождаться естественного опустошения event loop или вызвать `process.exit()` явно. Разница существеннее, чем кажется.

### Естественный выход (опустошение event loop)

Когда в [event loop](../node-arch/event-loop-intro.md) не остаётся работы — нет таймеров, открытых сокетов, active handles, очереди I/O — Node завершается сам. Чисто: отработали колбэки, сбросились потоки, где это возможно. Код по умолчанию `0` или значение `process.exitCode`.

```javascript
process.exitCode = 1;
// ... асинхронная работа продолжается ...
// Когда цикл опустеет, код выхода будет 1
```

`process.exitCode` — предпочтительный способ сигнализировать об ошибке без обрыва выполнения. Процесс дорабатывает async‑задачи, закрывает соединения, сбрасывает буферы записи — и выходит с заданным кодом.

Можно передать код напрямую:

```javascript
process.exit(1);
```

Поведение другое.

### process.exit() и жёсткая остановка

`process.exit()` — почти сразу: срабатывает `'exit'`, выполняются синхронные обработчики. Но pending I/O, `setTimeout`, сетевые запросы в полёте — брошены. Данные в буферах Writable, не сброшенные в ядро? Потеряны. TLS‑рукопожатие на полпути? Обрыв. Неразрешённые промисы? Не разрешатся.

Типичный баг: запись в файл и сразу `process.exit()`. Файл пустой или обрезан — колбэк `fs.writeFile()` ещё не вызван, запись в thread pool libuv, цикл разобран до колбэка.

```javascript
const fs = require('node:fs');
fs.writeFile('results.json', data, (err) => {
    if (err) console.error(err);
    process.exit(0); // exit ВНУТРИ колбэка
});
// process.exit(0) здесь = данные могут не записаться
```

Правка: `process.exit()` внутри колбэка или лучше не вызывать вовсе — пусть цикл опустеет сам.

!!!warning ""

    `process.exit()` на сервере — не shutdown. Для HTTP‑сервисов: stop accept → drain → закрыть ресурсы. Подробнее — в главе о жизненном цикле и сигналах.

### Событие 'exit'

`'exit'` — процесс вот‑вот завершится, любой способ:

```javascript
process.on('exit', (code) => {
    console.log('Exiting with code:', code);
});
```

В обработчике — **только синхронный** код. `setTimeout`, сеть, `fs.readFile()` — не выполнятся: event loop гасится. После возврата всех обработчиков `'exit'` процесс завершается.

Параметр `code` — код, который вернётся. Внутри обработчика можно изменить: `process.exitCode = 2`. Предотвратить выход нельзя.

### Событие 'beforeExit'

`'beforeExit'` срабатывает, когда цикл опустел, но процесс **ещё не** получил явную команду на выход. Отличие от `'exit'`: в `'beforeExit'` можно запланировать async‑работу — цикл снова крутится, событие придёт снова, когда новая работа закончится.

```javascript
let runs = 0;
process.on('beforeExit', (code) => {
    runs++;
    if (runs < 3) {
        setTimeout(() => console.log(`run ${runs}`), 100);
    }
});
```

Обработчик сработает три раза; на последнем раз новая работа не планируется — затем `'exit'`.

`'beforeExit'` **не** срабатывает при `process.exit()`. При `SIGINT`/`SIGTERM` по умолчанию (см. [главу о сигналах](../node-arch/node-process-lifecycle.md)) — ещё резче: без своего обработчика ОС может убить процесс без `'exit'`. С кастомным handler'ом сигнала завершение отменяется по умолчанию; `'beforeExit'`/`'exit'` не придут, пока сами не вызовете `process.exit()`.

Сценарий: последний шанс сбросить пул БД, буфер логгера, отчёт тест‑раннера после неожиданного опустошения цикла.

### Последовательность выхода

Для аккуратного CLI:

1.  Выполнить работу
2.  При ошибке выставить `process.exitCode`
3.  Дать event loop опустеть
4.  Сработает `'beforeExit'` (при необходимости — последняя async‑работа)
5.  Цикл снова опустеет
6.  Сработает `'exit'` (только sync‑очистка)
7.  Процесс завершится с `process.exitCode`

`process.exit(1)` перескакивает с текущего места на шаг 6. Шаги 3–5 не выполняются. Используйте `process.exit()` при жёстком bail out; для обычных ошибок — `process.exitCode`.

## process.cwd() и process.chdir()

`process.cwd()` — каталог, из которого запустили Node (рабочий каталог shell на момент `node app.js`). Обычно корень проекта, но не обязательно. Живой вызов `uv_cwd()` → на POSIX `getcwd()`. Учитывает последующий `process.chdir()`.

```javascript
console.log(process.cwd());
```

Все относительные пути — `fs.readFile('./config.json')`, `require('./lib/util')`, `path.resolve('data')` — относительно этого каталога. Запуск `cd /tmp && node /home/user/my-project/app.js` даёт разрешение от `/tmp` — конфиг «пропадает». Частый источник багов в деплое.

`process.chdir()` меняет рабочий каталог:

```javascript
process.chdir('/var/log');
console.log(process.cwd()); // '/var/log'
```

Используйте редко. Смена cwd влияет на **все** последующие относительные пути в процессе, включая код сторонних модулей. Глобальная мутация; у worker threads (отдельная тема) общий cwd — смена в одном потоке меняет для всех.

Несуществующий путь → `ENOENT`. Нет прав → `EACCES`. Синхронно и блокирующе — прямой `chdir()`, без thread pool.

В продакшене cwd задают при старте или деплой‑инструментом и не трогают. Для путей от фиксированной базы безопаснее `path.resolve('/some/base', relativeFile)`.

## pid и ppid

`process.pid` — PID текущего процесса Node. Целое число от ядра при старте; уникален среди **запущенных** процессов (после выхода ID переиспользуют).

```javascript
console.log(`PID: ${process.pid}`);
console.log(`Parent PID: ${process.ppid}`);
```

`process.ppid` — PID родителя. `node app.js` из bash → ppid = shell. Fork через `child_process.fork()` → ppid родительского Node.

Оба значения статичны с момента создания процесса. Нюанс `ppid`: если родитель умер, сироту перепривязывает ОС (на Linux часто PID 1; есть subreaper через `PR_SET_CHILD_SUBREAPER`). `process.ppid` может отразить смену — зависит от реализации (кэш или `getppid()` на каждый доступ).

Паттерн: записать `process.pid` в `.pid` для мониторинга и скриптов перезапуска. `ppid` подсказывает интерактивный запуск (shell) или process manager (pm2, systemd).

```javascript
const fs = require('node:fs');
fs.writeFileSync('/var/run/myapp.pid', String(process.pid));
```

Удаляйте pid‑файл в обработчике `'exit'`. Иначе после рестарта с другим PID — путаница.

## Время работы и uptime

`process.uptime()` — секунды (float) с момента старта Node. Внутри `uv_hrtime()` — монотонные часы; откат при подстройке NTP не влияет.

```javascript
console.log(`Running for ${process.uptime().toFixed(2)}s`);
```

Высокое разрешение — `process.hrtime.bigint()` — наносекунды как `BigInt`:

```javascript
const start = process.hrtime.bigint();
doSomething();
const end = process.hrtime.bigint();
console.log(`Took ${end - start} nanoseconds`);
```

Старый `process.hrtime()` без `.bigint()` возвращал кортеж `[seconds, nanoseconds]` — неудобная арифметика с переносом наносекунд. BigInt — одно число, прямое вычитание.

Оба опираются на `uv_hrtime()`: Linux `clock_gettime(CLOCK_MONOTONIC)`, macOS `mach_absolute_time()`, Windows `QueryPerformanceCounter()`. Разрешение платформенное, на современном железе обычно наносекундное.

`Date.now()` — wall clock: NTP, ручная смена времени, leap seconds — скачки вперёд/назад. Монотонные часы только вперёд. Бенчмарки и latency между двумя точками — монотонные; метки в логах и БД — wall clock.

`performance.now()` (Web Performance API) в Node — миллисекунды float с монотонного источника; глобально с v16. Выбор: `hrtime.bigint()` — наносекунды BigInt; `performance.now()` — миллисекунды number; `Date.now()` — миллисекунды wall clock integer.

## process.memoryUsage()

`process.memoryUsage()` — объект из пяти полей в байтах:

```javascript
console.log(process.memoryUsage());
// {
//   rss: 36_798_464,
//   heapTotal: 6_066_176,
//   heapUsed: 4_230_016,
//   external: 1_036_017,
//   arrayBuffers: 10_515
// }
```

**RSS** (resident set size, см. [Главу 1 — жизненный цикл](../node-arch/node-process-lifecycle.md)) — память процесса в RAM: код, стек, heap, всё. `heapTotal` — heap, выделенный V8 у ОС. `heapUsed` — занято живыми JS‑объектами. `external` — память C++‑объектов, привязанных к JS (например `Buffer.alloc()` из [Главы 2 — буферы](../buffers/what-is-buffer.md)). `arrayBuffers` — `ArrayBuffer`/`SharedArrayBuffer`; подмножество `external`.

Разрыв `heapTotal` − `heapUsed` — резерв V8. Heap растёт чанками; после GC `heapUsed` падает, но V8 не всегда сразу отдаёт память ОС.

`process.memoryUsage.rss()` — быстрее, если нужен только RSS. Полный `memoryUsage()` тянет `v8::HeapStatistics` с обходом heap spaces. Для health check с высокой частотой — только `.rss()` (на Linux `/proc/self/statm`, на macOS `mach_task_basic_info`).

RSS включает разделяемые страницы (библиотеки). После `fork()` copy-on-write — одни физические страницы в RSS обоих процессов. Сумма RSS воркеров завышает реальное потребление; на Linux смотрите `Private_Dirty`/`Private_Clean` в `/proc/self/smaps`.

Периодический мониторинг:

```javascript
setInterval(() => {
    const {
        rss,
        heapUsed,
        heapTotal,
    } = process.memoryUsage();
    const mb = (n) => (n / 1024 / 1024).toFixed(1);
    console.log(
        `RSS ${mb(rss)}MB heap ${mb(heapUsed)}/${mb(
            heapTotal
        )}MB`
    );
}, 30_000);
```

`process.memoryUsage()` синхронный и не бесплатный. На heap 1–2 ГБ статистика может занимать несколько миллисекунд. Не вызывайте на каждый HTTP‑запрос.

!!!note ""

    Большой RSS при «нормальном» heap часто связан с external memory (`Buffer`). Смотрите и heap snapshots, и RSS/external вместе — см. главу о буферах и жизненном цикле.

## versions, arch и platform

`process.versions` — замороженный объект версий встроенных компонентов:

```javascript
console.log(process.versions.node); // '24.0.0'
console.log(process.versions.v8); // '12.4...'
console.log(process.versions.uv); // '1.48...'
```

Поле `modules` — ABI нативных модулей Node; меняется на каждом major — после апгрейда Node нужна пересборка C++‑аддонов. Сообщение «compiled against a different Node.js version» — несовпадение ABI.

`process.arch` — архитектура CPU: `'x64'`, `'arm64'`, `'arm'`, `'ia32'`. Как скомпилирован бинарник Node. `process.platform` — ОС: `'linux'`, `'darwin'`, `'win32'` (идентификатор платформы, исторически так назван и для 64‑бит Windows). Определяются при сборке.

```javascript
if (process.platform === 'win32') {
    // Windows-специфичные пути, API и т.д.
}
```

`process.config` — реже используемый замороженный объект опций `./configure` при сборке Node: флаги компилятора, пути зависимостей. Для отладки расхождений между средами и для `node-gyp`.

## process.execPath и process.execArgv

`process.execPath` — абсолютный путь к бинарнику Node. При установке через nvm что‑то вроде `/home/user/.nvm/versions/node/v24.0.0/bin/node`. Для spawn дочерних процессов с той же версией:

```javascript
const { spawn } = require('node:child_process');
spawn(process.execPath, ['worker.js']);
```

Строка `'node'` в PATH может найти другую версию. `execPath` гарантирует тот же бинарник.

`process.execArgv` — флаги **уровня Node** до имени скрипта:

```javascript
// Запуск: node --max-old-space-size=4096 --inspect app.js
console.log(process.execArgv);
// ['--max-old-space-size=4096', '--inspect']
```

Это настройки runtime — V8, inspector, разрешение модулей. Они не попадают в `process.argv`, потому что потребляет их Node, а не ваш скрипт. При `child_process.fork()` `execArgv` наследуются по умолчанию — дочерний процесс получает те же флаги V8.

## Как на самом деле устроен process.env

Здесь — слой C++. Почему `process.env` медленный, всё строки и изменения изолированы по процессу — в bootstrap и interceptor API V8.

При старте в `src/node_env_var.cc` создаётся `process.env` как `ObjectTemplate` с named property interceptors через `SetHandler()`. Конфигурация `NamedPropertyHandlerConfiguration` (раньше `GenericNamedPropertyHandlerConfiguration`) принимает шесть колбэков:

1.  **Getter** — чтение `process.env.FOO`
2.  **Setter** — запись `process.env.FOO = 'bar'`
3.  **Query** — `'FOO' in process.env`
4.  **Deleter** — `delete process.env.FOO`
5.  **Enumerator** — `Object.keys(process.env)`
6.  **Definer** — `Object.defineProperty(process.env, ...)`

Каждая операция уходит в C++ вместо обычного хранения свойств в куче V8. Данных окружения в heap V8 нет — фасад.

Getter (`EnvGetter`) получает имя свойства, конвертирует в нативную строку (UTF‑8 на POSIX, UTF‑16 на Windows), вызывает `uv_os_getenv()`. На POSIX — обёртка над `getenv()`, линейный проход по `environ`. Хеш‑таблицы нет — worst case 50 или 500 сравнений имён на lookup.

Setter (`EnvSetter`) — `ToString()` в V8, затем `uv_os_setenv()` → `setenv()`. Возможна реаллокация `environ`; в glibc — внутренний lock на модификации `environ`. На musl (Alpine) гарантии потокобезопасности другие.

Deleter → `unsetenv()`. Enumerator при `Object.keys(process.env)` обходит весь `environ`, режет по первому `=`, строит JS‑массив имён — **с нуля каждый раз**, без кэша.

На Windows — `GetEnvironmentVariableW` / `SetEnvironmentVariableW`, UTF‑16 ↔ UTF‑8 на границе. Имена без учёта регистра: `process.env.Path` и `process.env.PATH` совпадают. На POSIX регистр важен.

Следствие: `process.env` привязан к реальному блоку окружения ОС. Изменения видны нативным аддонам, дочерним процессам при spawn и всему, кто читает `environ`. `process.env.TZ` меняет timezone для `localtime()` в libc — Node может вызвать `tzset()` после смены TZ.

Bootstrap самого `process` — рано, в `src/node.cc` и `src/node_process_object.cc`. Класс `Environment` создаёт объект process, вешает `env` с interceptors, заполняет `argv`, `execPath`, `version`, `versions`, `arch`, `platform` и статические поля. Методы `exit`, `cwd`, `chdir`, `memoryUsage`, `hrtime` — C++‑функции через `FunctionTemplate`, тонкие обёртки над libuv и syscalls.

К моменту первого обращения к глобалу `process` вся эта настройка уже выполнена. Вы работаете с JS‑оболочкой над машиной, говорящей с ядром ОС. Самая необычная часть — `env`: выглядит как объект, ведёт себя как живое окно в per-process environment ОС.

## process.release и сведения о сборке

`process.release` — метаданные релиза Node.js:

```javascript
console.log(process.release.name); // 'node'
console.log(process.release.lts); // 'Jod' или undefined
```

`name` — `'node'` (исторически отличали от io.js). `lts` — кодовое имя LTS (`'Iron'` для v20, `'Jod'` для v22) или `undefined` для Current. `sourceUrl` и `headersUrl` — tarball исходников и C++‑заголовков для `node-gyp`.

## process.title

Можно изменить отображение в `ps`:

```javascript
process.title = 'my-worker-3';
```

На Linux `ps aux` покажет `my-worker-3` вместо `node /path/to/script.js`. Реализация — `uv_set_process_title()`, перезапись области argv в памяти. Длина нового title не больше исходных argv‑строк. На Linux обычно работает; на Windows — заголовок консоли; на macOS `ps` и Activity Monitor часто игнорируют — ненадёжно для диагностики.

Полезно в пулах воркеров: ID воркера или порт в title — сразу видно в мониторинге.

## process.channel и IPC

Если процесс порождён с IPC‑каналом (`child_process.fork()`), `process.channel` ссылается на объект канала. Иначе `undefined`.

```javascript
if (process.channel) {
    process.send({ status: 'ready' });
}
```

IPC — обмен сообщениями между родителем и дочерним Node (**Глава 15 — дочерние процессы**). Наличие `process.channel` говорит, что fork был с включённым IPC.

`process.connected` — `true`, пока канал открыт. При отключении родителя или обрыве — `false`. `process.disconnect()` закрывает канал со стороны ребёнка; канал — ещё один handle, удерживающий event loop — disconnect может запустить естественный выход, если больше нечего держать цикл.

## Статические и «живые» свойства

У `process` два класса свойств; путаница ведёт к багам.

**Статические** (один раз при старте, не меняются): `argv`, `argv0`, `execPath`, `execArgv`, `versions`, `version`, `arch`, `platform`, `config`, `release`, `pid`

**Живые** (запрос к ОС при каждом обращении): `env` (каждое чтение/запись), `cwd()`, `memoryUsage()`, `uptime()`, `hrtime.bigint()`, `cpuUsage()`, `ppid` (на некоторых системах)

В горячем пути — handler запроса, tight loop, transform в [потоке](../streams/foundation-of-streams.md) — кэшируйте живые значения. Статические — обычный property lookup в V8, повторный доступ дешёвый. Живые каждый раз пересекают границу в нативный код.

## Связанное чтение

-   Предыдущая: [Права доступа и метаданные файлов в Node.js](../file-system/permissions-metadata-edge-cases.md)
-   Далее: [Сигналы и коды выхода в Node.js](./signals-exit-codes.md)
