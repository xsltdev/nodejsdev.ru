---
description: Сигналы ОС SIGTERM, SIGINT, graceful shutdown, коды выхода и обработчики process в Node.js
---

# Сигналы Node.js: SIGTERM, SIGINT и коды выхода

Источник: [theNodeBook — Signals & Exit Codes](https://www.thenodebook.com/process-os/signals-exit-codes)

Сигналы — уведомления операционной системы, доставляемые процессу. В этой главе разбираются `SIGTERM`, `SIGINT`, коды выхода, дедлайны shutdown и события процесса. Node экспонирует выбранные сигналы как события `process`, чтобы JavaScript мог перестать принимать новую работу, завершить текущую, закрыть серверы и ресурсы, а затем выйти с осмысленным кодом.

## Сигналы и graceful shutdown в Node.js

Обработчики сигналов меняют поведение по умолчанию. Установка слушателя на `SIGTERM` означает, что процесс остаётся живым, пока код не вызовет выход или event loop не опустеет. `SIGKILL` перехватить нельзя. `beforeExit` срабатывает, когда у Node не осталось запланированной работы. `exit` выполняется на финальном этапе завершения и допускает только синхронные операции.

Каждый процесс в Unix может получать сигналы. Звучит очевидно, но механику стоит понимать глубже, чем «SIGTERM значит остановиться». Сигналы — способ ОС асинхронно «толкнуть» процесс: прервать текущую работу и потребовать реакции. От того, как Node отвечает на них, зависит, будут ли деплои чистыми или вы будете терять данные при каждом рестарте.

В [предыдущей подглаве](./process-object.md) разобраны `process.exit()`, `process.exitCode` и события `beforeExit`/`exit`. Здесь — сигналы, соглашение о кодах выхода и паттерны остановки работающего сервера без обрыва запросов.

## Что такое сигналы на самом деле

Сигнал — асинхронное уведомление, которое ядро доставляет процессу. «Асинхронно» значит: процесс его не запрашивает — ядро доставляет на границе планирования или когда процесс возвращается из системного вызова. Процесс не контролирует _момент_ прихода сигнала. Это ядро вмешивается в работающий процесс и говорит: «разберись с этим».

Концепция уходит корнями в ранний Unix. Сигналы старше сокетов, pipe и разделяемой памяти как механизма IPC. Это самый грубый IPC — просто число, без полезной нагрузки, без подтверждения.

У каждого сигнала есть номер и имя. Имена стандартизированы POSIX.

```text
SIGHUP    1    Отключение терминала (hangup)
SIGINT    2    Прерывание (Ctrl+C)
SIGKILL   9    Принудительное завершение
SIGUSR1  10    Пользовательский сигнал 1 (в Linux)
SIGUSR2  12    Пользовательский сигнал 2 (в Linux)
SIGTERM  15    Запрос на корректное завершение
```

Эти шесть постоянно встречаются в серверной работе. Есть и другие — SIGPIPE (13), SIGWINCH (28), SIGSTOP (19), SIGQUIT (3) — но перечисленные покрывают ~90% практики.

Сигналы могут приходить из разных источников. Ядро генерирует их (SIGSEGV при обращении к невалидной памяти, SIGPIPE при записи в разорванный pipe). Другие процессы шлют через syscall `kill`. Драйвер терминала — Ctrl+C даёт SIGINT, Ctrl+\\ — SIGQUIT. Процесс может послать сигнал самому себе.

На уровне ядра сигналы работают через битовую маску pending в task struct процесса. Когда ядро хочет доставить сигнал, оно выставляет соответствующий бит. Процесс проверяет маску при возврате из любого системного вызова и на границах переключения контекста. Если бит установлен и зарегистрирован обработчик — ядро запускает его. Если обработчика нет — применяется действие по умолчанию.

Из‑за битовой маски один и тот же сигнал может быть pending только один раз. Два SIGTERM до проверки маски — процесс увидит один SIGTERM. Второй теряется. На практике это редко мешает, но знать полезно: стандартные сигналы не ставятся в очередь. (Есть «real-time signals» SIGRTMIN…SIGRTMAX с очередью; Node их не использует.)

## Действия сигналов по умолчанию

У каждого сигнала есть поведение по умолчанию. Три категории:

**Завершение.** Процесс умирает. SIGTERM, SIGINT, SIGHUP, SIGUSR1, SIGUSR2 и SIGPIPE по умолчанию завершают процесс.

**Core dump.** Процесс умирает _и_ пишет core dump. SIGQUIT (3), SIGABRT (6), SIGSEGV (11) и SIGBUS (7).

**Игнорирование.** Сигнал тихо отбрасывается. SIGCHLD и SIGURG по умолчанию игнорируются.

Два сигнала вне этой схемы: SIGKILL (9) и SIGSTOP (19). Их обрабатывает ядро напрямую. Пользовательский код не может их перехватить, заблокировать или проигнорировать. При SIGKILL процесс исчезает. Ядро освобождает память, закрывает fd и уведомляет родителя. SIGSTOP приостанавливает процесс до SIGCONT. В ответ на них userspace не выполняется.

Node меняет часть дефолтов. По умолчанию для SIGINT установлен обработчик, вызывающий `process.exit()`. Для SIGUSR1 — обработчик, запускающий V8 inspector/debugger. Остальное остаётся дефолтом ОС, пока вы не зарегистрируете свой обработчик.

Исключение, важное для Node: **SIGPIPE**. В большинстве Unix‑программ SIGPIPE по умолчанию убивает процесс — запись в закрытый pipe, и процесс мёртв. Node при старте глобально подавляет SIGPIPE: обработчик `SIG_IGN`, запись в разорванный pipe даёт код ошибки EPIPE в вызове `write`, а не смерть процесса. Для сервера это правильно: один оборванный клиент не должен ронять всё.

## Перехват сигналов в Node

Регистрация обработчика — одна строка.

```javascript
process.on('SIGTERM', () => {
    console.log('Received SIGTERM');
    process.exit(0);
});
```

Колбэк выполняется на главном потоке, в обычном тике event loop. Преemption нет: если JavaScript в плотном синхронном `for`, обработчик не сработает, пока синхронная работа не закончится и управление не вернётся в цикл (разобрано в [главе 1](../node-arch/event-loop-intro.md)). C‑обработчики могут прервать выполнение почти в любой точке; JS‑обработчики Node ждут цикл.

Следствие реальное. Тяжёлая синхронная работа — большой JSON, плотные вычисления, длинная конкатенация строк — на это время процесс по сути «глух» к сигналам. Ядро уже доставило сигнал, но JavaScript увидит его только после текущей синхронной операции.

Можно зарегистрировать несколько обработчиков на один сигнал. Они складываются и вызываются в порядке добавления, как у EventEmitter.

```javascript
process.on('SIGTERM', () => console.log('handler 1'));
process.on('SIGTERM', () => console.log('handler 2'));
// Оба сработают на SIGTERM, по порядку
```

Удаление — стандартный API EventEmitter.

```javascript
const handler = () => {
    /* ... */
};
process.on('SIGTERM', handler);
// Позже:
process.removeListener('SIGTERM', handler);
```

Важно: после удаления всех слушателей для сигнала Node возвращается к поведению по умолчанию. Убрали все обработчики SIGTERM — следующий SIGTERM сразу завершит процесс (дефолт ОС).

## SIGINT и Ctrl+C

SIGINT заслуживает отдельного раздела: Node обрабатывает его иначе, чем многие другие сигналы. Ctrl+C в терминале — драйвер шлёт SIGINT группе foreground‑процессов. Дефолт Node — вызов `process.exit()`, событие `exit` и остановка.

Как только вы добавляете свой обработчик SIGINT, дефолтный исчезает.

```javascript
process.on('SIGINT', () => {
    console.log('Caught SIGINT');
    // Без process.exit() процесс продолжит работу
});
```

После регистрации Ctrl+C печатает «Caught SIGINT» и… ничего больше. Процесс жив. Вы полностью заменили «выйти по SIGINT». Чтобы выйти — вызовите `process.exit()` в обработчике.

Это регулярно ловит людей: добавили SIGINT для cleanup, забыли `process.exit()` — Ctrl+C больше не выходит. Остаётся SIGKILL или закрытие терминала.

!!!warning ""

    После своего обработчика `SIGINT` вызовите `process.exit()` явно — иначе процесс не завершится по Ctrl+C.

Типичный паттерн — cleanup, затем exit:

```javascript
process.on('SIGINT', () => {
    console.log('Cleaning up...');
    // сброс логов, закрытие соединений и т.д.
    process.exit(0);
});
```

У `readline` есть отдельный путь: при терминальном интерфейсе readline ставит свой SIGINT и эмитит `'SIGINT'` на интерфейсе. Это может конфликтовать с обработчиком на `process`. Для CLI с readline обычно обрабатывают SIGINT на интерфейсе readline; для сервера — на `process`.

Ещё нюанс SIGINT. Ctrl+C шлёт SIGINT всей foreground‑группе. Node и дочерние процессы в той же группе получают сигнал одновременно — путаница при совместном shutdown. Detached‑дочерние и процессы в других группах foreground‑сигналов не получают.

## SIGTERM и корректное завершение

SIGTERM — стандартный «пожалуйста, завершитесь». Менеджеры процессов (systemd, Docker, Kubernetes, PM2) шлют SIGTERM, когда хотят чистый выход. Соглашение: SIGTERM → grace period (обычно 10–30 с) → SIGKILL, если процесс ещё жив.

Дефолт Node для SIGTERM — дефолт ОС: немедленное завершение. Для любого сервера нужен свой обработчик.

```javascript
process.on('SIGTERM', () => {
    shutdown();
});
```

Вся реальная работа — в `shutdown()`; полный паттерн ниже.

## SIGHUP, SIGUSR1, SIGUSR2

**SIGHUP** (сигнал 1) изначально означал «терминал отвалился». Сейчас часто — «перечитай конфиг». Некоторые демоны на SIGHUP перечитывают конфиг. В Node по умолчанию — завершение. Для reload конфига — свой обработчик:

```javascript
process.on('SIGHUP', () => {
    reloadConfig();
});
```

На macOS и Linux SIGHUP также приходит при закрытии controlling terminal. Закрыли окно терминала с Node — SIGHUP. Обрыв SSH — SIGHUP всем процессам сессии. Поэтому используют `nohup`, `tmux`, `screen` или process manager: процесс отвязывают от терминала.

`nohup` игнорирует SIGHUP для дочернего процесса. `tmux`/`screen` дают виртуальный терминал после SSH. systemd не использует controlling terminal — «повесить телефонную трубку» не на что.

**SIGUSR1** (10) особенный в Node: runtime перехватывает его для встроенного debugger/inspector. `kill -USR1 <pid>` — Chrome DevTools Protocol на порту 9229. Отладка production без рестарта. Свой обработчик SIGUSR1 заменяет это — активация inspector пропадает.

**SIGUSR2** (12) в Node без встроенного смысла — полностью ваш. PM2 использует SIGUSR2 внутри. Под PM2 для graceful shutdown иногда берут SIGUSR2 вместо SIGTERM — зависит от конфигурации.

Общий паттерн: SIGUSR1/SIGUSR2 для прикладного поведения. Ядро не навязывает семантику. Node занял SIGUSR1 под debugger; SIGUSR2 остаётся свободным — ротация логов, дамп диагностики на stderr. Это соглашение, не enforcement.

## SIGPIPE, SIGQUIT и SIGWINCH

**SIGPIPE** (13) — запись в pipe/socket, у которого закрыт читающий конец. В C по умолчанию убивает процесс: клиент отключился, сервер пишет, SIGPIPE, сервер мёртв. Node игнорирует SIGPIPE глобально (`SIG_IGN` при старте) — EPIPE вместо смерти по сигналу. В Node SIGPIPE почти не обрабатывают вручную — так задумано.

**SIGQUIT** (3) — Ctrl+\\ в терминале. По умолчанию завершение _и_ core dump. Полезен для post-mortem. Node SIGQUIT по умолчанию не перехватывает — Ctrl+\\ убивает процесс и даёт core (если включено: `ulimit -c unlimited` на Linux). Некоторые команды вешают обработчик для heap snapshot или diagnostic report вместо краша:

```javascript
const fs = require('node:fs');

process.on('SIGQUIT', () => {
    const report = process.report.getReport();
    fs.writeFileSync(
        '/tmp/diag.json',
        JSON.stringify(report)
    );
});
```

Оператор получает диагностику без убийства процесса. Обработчик синхронный на главном потоке; `process.report.getReport()` — heap, active handles, метрики libuv, JS stack.

**SIGWINCH** (28) — изменение размера окна терминала. Node экспонирует его для TUI (прогресс-бары, курсор). Для headless‑серверов не нужен. В CLI с адаптивным терминалом — `process.on('SIGWINCH', ...)` и внутри `process.stdout.columns` / `process.stdout.rows`.

## Коды выхода подробно

При завершении процесс сообщает родителю числовой exit code. 0 — успех. Всё остальное — сбой того или иного рода.

Node определяет свои коды для внутренних ошибок:

| Код | Значение |
| --- | --- |
| 0 | Успех |
| 1 | Неперехваченное фатальное исключение |
| 2 | Не используется (зарезервирован Bash для misuse builtin) |
| 3 | Внутренняя ошибка разбора JavaScript |
| 4 | Внутний сбой evaluation JavaScript |
| 5 | Fatal Error (например, V8 out of memory) |
| 6 | Internal Exception Handler не функция |
| 7 | Сбой runtime internal exception handler |
| 8 | Не используется |
| 9 | Неверный аргумент (неизвестный CLI‑флаг с `-throw-deprecation`) |
| 10 | Внутний runtime‑сбой JavaScript |
| 12 | Неверный аргумент отладки |
| 13 | Незавершённый top-level await |

Код 1 — самый частый при сбое: uncaught exception, unhandled rejection (при `-unhandled-rejections=throw`, дефолт с Node 15), явный `process.exit(1)`.

Код 5 пугает: fatal V8 — неrecoverable состояние движка. OOM при GC, внутренний assert V8. Мониторинг должен отличать 5 от 1.

Код 9 — неверный флаг до загрузки кода: `node -invalid-flag app.js`, `-inspect=garbage`, конфликтующие флаги.

Код 12 — ошибка именно в аргументах debugger: `-inspect=not-a-port`, `-inspect-brk=abc`.

Код 13 относительно новый: ES‑модуль с top-level await, операция которого никогда не резолвится. Node обнаруживает, что граф модулей не может завершить evaluation, и выходит с 13.

Проверка кода из shell:

```javascript
// node -e "process.exit(5)"
// echo $?  # печатает 5
```

`$?` в bash — код последней команды. Так CI, менеджеры процессов и скрипты понимают исход. В CI код 1 у тестов — «тесты упали».

Exit code — один байт, 0…255. `process.exit(256)` → 0. `process.exit(-1)` → 255. Для своих кодов держитесь 0–127: 128+ зарезервировано под соглашение с сигналами.

Коды выше 128 — другое соглашение.

## Соглашение 128+N

Если процесс убит сигналом, shell часто показывает 128 + номер сигнала. POSIX‑соглашение для `bash`, `zsh`, `dash` и др. Ядро родителю отдаёт два факта: нормальный exit с кодом или смерть от сигнала (и какого). Shell сводит это в одно число.

```text
128 + 2  = 130  (убит SIGINT)
128 + 9  = 137  (убит SIGKILL)
128 + 15 = 143  (убит SIGTERM)
128 + 11 = 139  (убит SIGSEGV)
```

Мониторинг с кодом 137 — SIGKILL. OOM killer, Docker, Kubernetes или `kill -9`. Не «краш», а принудительное убийство.

139 (SIGSEGV) — часто native addon или сбой V8. 143 обычно означает, что процесс _сам_ вышел после SIGTERM (обработчик отработал). 137 — кого‑то _заставили_ убить.

Проверка сигнала у дочернего процесса в Node:

```javascript
const { spawn } = require('node:child_process');

const child = spawn('sleep', ['100']);
child.kill('SIGTERM');
child.on('exit', (code, signal) => {
    console.log(code); // null (убит сигналом, не exit)
    console.log(signal); // 'SIGTERM'
});
```

При убийстве сигналом `code` — `null`, `signal` — имя. Так устроен API Node. 128+N — то, что видит _shell_ в скриптах.

Путаница: обработали SIGTERM и вызвали `process.exit(0)` — код 0, добровольный выход. 128+N только если процесс _убит_ сигналом без обработки. 143 — graceful handler не сработал (или не вызвал `process.exit()`). 0 — handler отработал. Для мониторинга это критично.

## Полный паттерн graceful shutdown

Цель graceful shutdown: закончить начатое, затем остановиться. Ничего не бросить, не испортить данные, ресурсы в чистом состоянии. Идея введена в [главе 1](../node-arch/event-loop-intro.md); здесь — механика по шагам.

Разница между «задеплоили, никто не заметил» и «502 у двухсот пользователей» часто в shutdown при деплое.

Пять шагов.

**Шаг 1: перестать принимать новую работу.** `server.close()` — HTTP‑сервер не принимает новые TCP. Существующие соединения остаются, запросы в полёте доигрываются. Внутри `server.close()` вызывает `uv_close()` на listening handle, снимает сокет с I/O watcher event loop. Новые connect после этого — `ECONNREFUSED`.

**Шаг 2: таймаут принудительного выхода.** Cleanup может зависнуть — `setTimeout` с `unref()`, чтобы таймер сам не держал loop живым (`ref`/`unref` — в [главе 1](../node-arch/event-loop-intro.md)). Страховка: зависший cleanup всё равно завершит процесс.

**Шаг 3: дождаться запросов в полёте.** После `server.close()` событие `'close'` — когда все соединения закончились. Keep-alive HTTP/1.1 — главная задержка: клиент держит соединение между запросами, сервер ждёт. Некоторые трекают активные соединения и рвут idle при старте shutdown.

**Шаг 4: закрыть внешние ресурсы.** Пулы БД, Redis, consumers очередей, fd, write streams — явный `.close()` / `.end()` / `.disconnect()`. Последовательно или параллельно по зависимостям. Redis после flush транзакции в БД — закрывайте БД последней.

**Шаг 5: выход.** `process.exit(0)` или опустошение event loop. Если всё закрыто и ref'ов нет — естественный выход ([предыдущая подглава](./process-object.md)). Явный `process.exit(0)` в handler — норма.

Конкретная реализация:

```javascript
let shuttingDown = false;

function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    const forceExit = setTimeout(
        () => process.exit(1),
        10000
    );
    forceExit.unref();
    server.close(() => {
        db.end().then(() => process.exit(0));
    });
}
```

Флаг `shuttingDown` против двойного shutdown. Второй SIGTERM или SIGINT после первого без флага — перекрывающийся cleanup. `setTimeout` + `unref()` — если `server.close()` или `db.end()` зависли, через 10 с exit с кодом 1.

`unref()` важен: обычный `setTimeout` держит loop. `unref()` убирает handle из alive-count — если всё остальное закончилось раньше 10 с, процесс выйдет без ожидания таймера.

И SIGTERM, и SIGINT должны вызывать одну функцию:

```javascript
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

SIGHUP — по среде деплоя, при необходимости.

### Учёт активных соединений

Базовый паттерн ждёт `server.close()`, но keep-alive может тянуть долго. Агрессивнее — трек соединений и destroy при shutdown:

```javascript
const connections = new Set();

server.on('connection', (socket) => {
    connections.add(socket);
    socket.on('close', () => connections.delete(socket));
});
```

При shutdown:

```javascript
function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    server.close(() => cleanup());
    // Опасно: рвёт и активные запросы!
    for (const socket of connections) {
        socket.destroy();
    }
}
```

`socket.destroy()` немедленно закрывает TCP, обрывает запросы в полёте, клиент видит `ECONNRESET`. Не ждёт завершения активных запросов. Чтобы дождаться активных, нужно знать, какой socket обрабатывает HTTP‑запрос, и destroy только idle — сложно.

Вежливее заголовок `Connection: close` в ответе — клиент не переиспользует соединение, после ответа закрывает свой конец, у сервера срабатывает `socket.on('close')`. Дольше, но мягче.

Компромисс — idle tracking. В Node 18.2+ есть `server.closeAllConnections()` и `server.closeIdleConnections()`:

```javascript
server.close();
server.closeIdleConnections();
setTimeout(() => server.closeAllConnections(), 5000);
```

`closeIdleConnections()` — keep-alive без запроса в полёте. `closeAllConnections()` — всё. Вместе с задержкой — время активным запросам, затем принудительное закрытие.

### Опустошение очередей и фоновой работы

Не только HTTP: интервалы, consumers очередей, отложенные задачи.

```javascript
clearInterval(metricsInterval);
consumer.stop(); // Kafka/RabbitMQ и т.д.
await flushLogs();
```

Порядок: сначала стоп новой работы, потом завершение текущей, потом flush вывода. Flush логов до остановки consumers — можно не залогировать последнюю партию.

### Интеграция с health check

За load balancer с health checks при начале shutdown сразу отвечайте ошибкой на `/health` — балансировщик перестанет слать трафик _до_ `server.close()`.

```javascript
let isHealthy = true;

app.get('/health', (req, res) => {
    // Нативный Node: res.writeHead(isHealthy ? 200 : 503).end();
    // Express:
    res.status(isHealthy ? 200 : 503).end();
});
```

В `shutdown`: `isHealthy = false`, затем `server.close()`. Без этого — окно, когда LB ещё шлёт запросы на сокет, который скоро закроется → `ECONNREFUSED`.

Интервал health check у LB задаёт задержку. Проверка раз в 5 с — иногда ждут 5–10 с после 503:

```javascript
function shutdown() {
    isHealthy = false;
    setTimeout(() => {
        server.close(() => cleanup());
    }, 5000);
}
```

+5 с к shutdown — укладывайтесь в grace period оркестратора.

### Проблема PID 1 в контейнерах

В Docker Node часто PID 1. В Linux необработанные сигналы PID 1 не получают дефолтное действие «terminate» — сигнал игнорируется.

`node server.js` как ENTRYPOINT без SIGTERM handler: `docker stop` шлёт SIGTERM, процесс игнорирует (PID 1, нет handler), Docker ждёт 10 с, SIGKILL. Cleanup не было.

Два исправления: всегда регистрировать SIGTERM в коде; или `dumb-init` / `tini` как entrypoint — они PID 1 и форвардят сигналы, Node становится обычным PID.

!!!warning ""

    В контейнере без обработчика `SIGTERM` и без `tini`/`dumb-init` `docker stop` почти всегда заканчивается `SIGKILL` без cleanup.

```dockerfile
ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
```

`tini` — PID 1, Node — PID 2, SIGTERM приходит нормально.

## Отправка сигналов из Node

`process.kill()` шлёт сигнал любому процессу по PID.

```javascript
process.kill(childPid, 'SIGTERM');
```

Имя обманчиво: не обязательно «убить» — любой сигнал. `process.kill(pid, 'SIGUSR2')` шлёт SIGUSR2; цель может обработать и не завершиться.

Сигнал 0 — проверка существования:

```javascript
try {
    process.kill(pid, 0);
    console.log('Process exists');
} catch (e) {
    console.log('Process is gone');
}
```

Сигнал 0 ничего не доставляет — ядро проверяет права и наличие. Успех — процесс есть и можно сигналить. Иначе `ESRCH`. Стандартный Unix‑идиом в Node.

Права: сигналить чужим UID нельзя (кроме root). `process.kill(1, 'SIGTERM')` без root → `EPERM`. В контейнере вы можете быть PID 1 — тогда этот PID ваш.

Сигнал самому себе:

```javascript
process.kill(process.pid, 'SIGUSR2');
```

Обходной путь вызвать свои handlers: через ядро обратно в процесс, асинхронно — handler на следующем тике, не inline.

## Отличия Windows

У Windows нет POSIX‑сигналов. Другое ядро IPC. Node эмулирует часть сигналов на Windows ограниченно.

**SIGINT** работает — Ctrl+C в консоли, handler Node срабатывает.

**SIGTERM** «как бы». `process.kill(pid, 'SIGTERM')` на Windows безусловно завершает цель. Цель не обрабатывает — ближе к SIGKILL.

**SIGHUP** при закрытии окна консоли. `process.kill(pid, 'SIGHUP')` с другого процесса — безусловное завершение, как SIGTERM.

**SIGKILL** всегда безусловный — как в Unix.

SIGUSR1/SIGUSR2 на уровне ОС Windows нет. Node эмулирует SIGUSR1 для debugger внутри того же Node‑процесса; внешний Windows‑процесс не пошлёт.

**SIGBREAK** (Ctrl+Break) — Windows‑специфика, Node поддерживает.

Итог для кроссплатформы: SIGINT и SIGTERM; помнить, что SIGTERM на Windows безусловен. В Linux‑контейнерах SIGTERM как ожидается. Windows‑сервисы — пакеты вроде `windows-service` и Service Control Manager, не сигналы.

Практический паттерн:

```javascript
const isWindows = process.platform === 'win32';

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
if (isWindows) process.on('SIGBREAK', shutdown);
```

SIGBREAK — Ctrl+Break, ближайший аналог «остановитесь корректно». Некоторые Windows process managers шлют SIGBREAK вместо SIGTERM.

`CTRL_CLOSE_EVENT` при закрытии консоли Node мапит в SIGHUP. `process.kill(pid, 'SIGHUP')` с другого процесса на Windows — снова безусловное завершение; полезно только для «закрыли консоль» на принимающей стороне.

## Как Node регистрирует обработчики сигналов в libuv

JavaScript не обрабатывает сигналы напрямую. V8 — один поток на main thread; сигналы приходят асинхронно, возможно во время syscall или `epoll_wait()`. Между ОС и `process.on('SIGTERM', ...)` — прослойка.

Первый `process.on('SIGTERM', ...)` в C++ вызывает `uv_signal_init()` и `uv_signal_start()`. `uv_signal_init()` — handle `uv_signal_t` и привязка к loop. `uv_signal_start()` — C‑обработчик через `sigaction()` на Unix и ожидание номера сигнала.

C‑обработчик libuv крошечный: в signal handler POSIX разрешён узкий набор async-signal-safe функций. Нельзя malloc, `printf`, locks. Минимум: запись одного байта в pipe.

Self-pipe trick. При инициализации libuv создаёт внутренний pipe (или `eventfd` на Linux). Write end — из signal handler. Read end — в poll loop (epoll/kqueue). Запись в pipe будит event loop.

Поток:

1.  Ядро доставляет SIGTERM.
2.  C‑handler libuv пишет байт в self-pipe с номером сигнала. `write()` — async-signal-safe.
3.  Poll (`uv__io_poll`) в `epoll_wait()`/`kevent()` — pipe будит ожидание.
4.  libuv читает pipe: «был SIGTERM».
5.  Callback `uv_signal_start()` — C++ Node планирует JS handlers.
6.  На следующем тике цикла — ваш `process.on('SIGTERM', ...)`.

Self-pipe — классика Unix 1990‑х: `select`/`poll`/`epoll_wait` блокируются; сигнал прерывает syscall с `EINTR`, а не структурированно отдаётся приложению. Запись в pipe из handler превращает сигнал в обычное I/O‑событие для loop.

На Linux часто `eventfd` вместо pipe — легче, счётчик вместо буфера. Семантика та же.

Следствие: JS handler — на следующем тике после poll и чтения pipe. Синхронная работа 500 ms задерживает handler на 500 ms. Сигнал pending, C handler уже записал в pipe — JS ждёт разворота стека. Плотный синхронный цикл — процесс глух к сигналам; пробивает только SIGKILL.

Внутри libuv — красно-чёрное дерево watchers по номеру сигнала. Несколько `uv_signal_start()` на один сигнал — несколько callbacks. В Node — несколько `process.on('SIGTERM')` подряд.

`uv_signal_start()` с `SA_RESTART` снятым — сигнал может прервать blocking syscall с `EINTR`. libuv в I/O ретраит `EINTR`; native addons без обработки `EINTR` могут ломаться при доставке сигналов.

`uv_signal_t` по умолчанию ref'ится — держит loop. Сервер ждёт SIGTERM — loop крутится. `uv_unref()` на handle — в JS API ref/unref на внутреннем handle; для signal watchers Node не экспонирует напрямую.

Производительность: каждый watcher — `uv_signal_t` и `sigaction()` при setup. 2–3 handler'а — пренебрежимо. Регистрация в цикле — syscall на каждый раз (не делайте так).

## Двойной сигнал и принудительное убийство

В production процесс живёт после первого SIGTERM: зависла БД, DNS, баг в cleanup. Снаружи:

1.  SIGTERM.
2.  Ждать 10–30 с.
3.  SIGKILL.

Так делает Docker: `docker stop` → SIGTERM → stop timeout (10 с по умолчанию) → SIGKILL. Kubernetes — `terminationGracePeriodSeconds` (30 с). systemd — SIGTERM → `TimeoutStopSec` (~90 с) → SIGKILL. PM2 — настраиваемый сигнал (часто SIGINT), `kill_timeout` (по умолчанию 1600 ms) → SIGKILL.

Дефолты разные. Внутренний таймаут должен быть **короче** внешнего grace. PM2 1.6 с — cleanup быстрый или увеличьте `kill_timeout`.

Изнутри `setTimeout(...).unref()` зеркалит это: свой grace, иначе force-exit.

Второй SIGTERM/SIGINT как принудительный выход:

```javascript
let termCount = 0;

process.on('SIGTERM', () => {
    termCount++;
    if (termCount > 1) process.exit(1);
    shutdown();
});
```

Первый SIGTERM — graceful. Второй — немедленный exit. Для CLI: первый Ctrl+C — «слышу, завершаюсь», второй — «сейчас».

Флаг `isShuttingDown` — идемпотентный shutdown на SIGTERM. Счётчик — явный force на второй SIGINT.

## Собираем всё вместе

Production handler несложен, но должен покрыть double-signal, timeout, соединения, порядок ресурсов.

```javascript
let isShuttingDown = false;

async function gracefulShutdown(signal) {
    if (isShuttingDown) return process.exit(1);
    isShuttingDown = true;
    const killer = setTimeout(() => process.exit(1), 15000);
    killer.unref();
    if (server.closeIdleConnections)
        server.closeIdleConnections();
    await new Promise((resolve) => server.close(resolve));
    await Promise.all([db.end(), redis.quit()]);
    process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

`isShuttingDown` на уровне модуля.

15 с — короче grace Kubernetes (30 с по умолчанию): приложение завершает cleanup до SIGKILL оркестратора. При `terminationGracePeriodSeconds: 30` внутренний таймаут 20–25 с.

`server.close()` оборачивают в Promise — иначе БД закроется до завершения HTTP в полёте.

Повторный сигнал при shutdown → `process.exit(1)` — ручной force.

`closeIdleConnections()` (Node 18.2+) снимает idle keep-alive. `Promise.all` для независимых ресурсов — параллельно.

Код 0 — чистый shutdown, 1 — timeout/force. Мониторинг может различать.

## Типичные ошибки

**Не обрабатывать `'error'` на `server.close()`.** Сервер не слушал (не забиндился) — `close()` может бросить:

```javascript
server.close((err) => {
    if (err && err.code !== 'ERR_SERVER_NOT_RUNNING') {
        console.error('Server close error:', err);
    }
    cleanup();
});
```

**`process.exit()` в async cleanup без await.** `process.exit()` синхронный и немедленный — pending promises обрываются. Всегда `await` cleanup перед exit.

!!!warning ""

    `process.exit()` не ждёт pending promises и не вызывает `beforeExit` — cleanup в signal handler делайте явно и с `await`.

**`process.exit()` пропускает `beforeExit`.** Cleanup только в `beforeExit`, а из SIGTERM handler вызываете `process.exit()` — `beforeExit` не сработает. `exit` сработает. Вызывайте cleanup явно из signal handler.

**Внутренний таймаут длиннее grace оркестратора.** K8s 30 с, ваш таймаут 45 с — на 30‑й секунде SIGKILL, ваш таймаут не успеет. Внутренний всегда короче внешнего.

!!!note ""

    Внутренний force-exit таймаут держите короче `terminationGracePeriodSeconds` / `TimeoutStopSec` оркестратора — оставьте запас до внешнего SIGKILL.

**Handlers внутри request handler или условно.** Регистрируйте один раз при старте, до `listen()`.

## Сигналы через границы процессов

При spawn дочерних процессов (подробно в отдельной главе о `child_process`) сигналы сложнее. По умолчанию дети в той же process group — Ctrl+C бьёт всю группу.

Для своего порядка shutdown — `detached: true`, отдельная группа; сигналы детям шлёте явно.

```javascript
const { spawn } = require('node:child_process');

const child = spawn('node', ['worker.js'], {
    detached: true,
    stdio: 'ignore',
});
child.unref();
```

Detached не получит SIGINT от Ctrl+C терминала. Родитель шлёт `child.kill('SIGTERM')` в своём shutdown. Больше кода, полный контроль порядка.

В [модуле `cluster`](../node-arch/event-loop-intro.md#модуль-cluster) primary получает SIGTERM от оркестратора и координирует workers; у каждого worker свои handlers, но SIGTERM с платформы обычно на primary.

Принцип: кто получил сигнал — тот раздаёт shutdown детям. Ядро не сделает это за вас, кроме foreground‑группы и сигнала от терминала.

## Отладка проблем с сигналами

Обычно одно из четырёх: сигнал не пришёл, handler не сработал, cleanup завис, выход раньше cleanup.

**Сигнал не пришёл.** Shell form в Docker: `CMD node server.js` → `/bin/sh -c "node server.js"`, SIGTERM на sh (PID 1), не на Node. Fix: exec form `CMD ["node", "server.js"]`.

**Handler не сработал.** Сигнал доставлен, JS молчит — заблокирован event loop синхронной работой. Handlers только на тиках цикла.

**Cleanup завис.** `server.close()` или `db.end()` не завершаются. Keep-alive для `close()`, зависшие запросы для БД. Force timeout спасает, но 10 с зависшего shutdown — 10 с деплоя.

**Ранний выход.** `process.exit(0)` до await. Или unhandled rejection в cleanup → `process.exit(1)`. try/catch, await всего async.

Тайминги в handler:

```javascript
async function shutdown(signal) {
    const start = Date.now();
    console.log(`${signal}: starting shutdown`);
    server.close();
    console.log(
        `${signal}: server closed (${Date.now() - start}ms)`
    );
    await db.end();
    console.log(
        `${signal}: db closed (${Date.now() - start}ms)`
    );
    process.exit(0);
}
```

В production — метрики длительности shutdown в логах. Один инстанс 8 с, остальные 200 ms — копать этот инстанс.

`process.on('exit', ...)` — последняя синхронная диагностика:

```javascript
process.on('exit', (code) => {
    console.log(`Process exiting with code ${code}`);
    if (code !== 0 && !isShuttingDown) {
        console.log(
            'Unexpected exit - not from shutdown handler'
        );
    }
});
```

`exit` — только sync. Без async, таймеров, I/O. Async тихо отбрасывается.

## Связанное чтение

-   Предыдущая: [Объект `process` в Node.js: env, argv, exit, память и нативные привязки](./process-object.md)
-   Далее: [Модуль `os` в Node.js: CPU, память, сетевые интерфейсы и данные платформы](./os-module.md)
