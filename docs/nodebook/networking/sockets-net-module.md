---
description: Модуль node:net — TCP-серверы и клиенты, listen, connect, запись, shutdown, таймауты и локальные IPC
---

# Сокеты и модуль net в Node.js

Источник: [theNodeBook — Sockets and net](https://www.thenodebook.com/networking/sockets-net-module)

Модуль `net` в Node.js открывает сырые потоко-ориентированные сокеты. Ниже — `net.Server`, `net.Socket`, TCP-серверы и клиенты, запись, завершение, таймауты и локальные IPC endpoint'ы. `net.createServer()` создаёт объект сервера в JavaScript. `server.listen()` просит ОС привязаться и слушать. Принятые соединения становятся объектами `net.Socket` на handles libuv.

## Модуль net в Node.js

Чтение приходит как данные stream. Запись попадает в локальные буферы и движется через libuv и сокетный слой ядра. `end()` запускает упорядоченное завершение с локальной стороны. `destroy()` срывает локальное состояние stream. Закрытие сервера прекращает приём новых соединений; у уже принятых сокетов свой жизненный цикл.

`net.createServer()` даёт объект сервера в JavaScript до захвата порта. Порт принадлежит ОС после успешного `listen()`. Это разделение — откуда берётся смысл большей части поведения `node:net`: один объект в JavaScript, один сокет ниже.

```js
import net from 'node:net';

const server = net.createServer((socket) => {
    socket.end(socket.remoteAddress + '\n');
});

server.listen(3000, '127.0.0.1');
```

`net.createServer()` создаёт `net.Server`. Сохраняет колбэк соединения. Настраивает EventEmitter. Готовит внутренние поля для нативного состояния. Порт ещё не занят. Таблица сокетов ядра не меняется.

`server.listen()` переносит операцию ниже JavaScript. Node создаёт нативное TCP-состояние, отдаёт libuv, просит ОС о TCP-сокете, привязывает к `127.0.0.1:3000` и переводит в listening. После успеха процесс владеет слушающим endpoint.

Маленький API. Много состояния.

Трасса объектов:

```
net.Server
  -> TCPWrap
  -> libuv TCP handle
  -> слушающий сокет ОС
```

Имена важны: каждый слой владеет своей частью. `net.Server` — API JavaScript. TCPWrap — нативная обёртка Node вокруг TCP handle. Handle libuv связывает нативный объект с готовностью event loop. ОС владеет состоянием сокета, дескриптором или platform handle, привязанным адресом, listen и accept.

Сокет — endpoint процесса для сетевого или локального IPC-разговора. Здесь чаще TCP-сокет: семейство адресов, состояние протокола, буферы ядра, локальные и удалённые endpoint-данные. Node оборачивает нижний объект в JavaScript: события, streams, методы вместо syscalls.

Полезное разделение:

```
слушающий сокет
  -> принимает новые TCP-соединения

подключённый сокет
  -> читает и пишет байты одному пиру
```

`net.Server` оборачивает слушающий сокет. `net.Socket` обычно — подключённый. Сервер принимает новых пиров. Сокет говорит с одним пиром.

Это объясняет большинство багов `node:net`.

## `node:net` владеет сырыми потоками

`node:net` — встроенный модуль Node для потоковых TCP и локальных сокетных endpoint'ов: TCP-серверы и клиенты, UNIX domain sockets на Unix-подобных системах, именованные pipe в Windows. Ниже HTTP, TLS, WebSocket, клиентов БД, Redis и большинства бинарных протоколов.

Используйте, когда нужны байты. Сырые чтения и записи. Подключённые потоки байтов и события жизненного цикла сокета. Парсер, заголовки и кадрирование сообщений — ваш код выше.

```js
import net from 'node:net';

const server = net.createServer((socket) => {
    socket.write('hello\n');
    socket.end();
});
```

Колбэк получает `net.Socket`. Это Duplex stream — словарь из [основ потоков](../streams/foundation-of-streams.md). Readable отдаёт данные пира. Writable принимает байты к пиру. Backpressure есть и в очередях Node, и ниже в буферах ядра и TCP flow control.

`net.Socket` также EventEmitter — словарь из [EventEmitter](../async-patterns/eventemitter-internals.md). `connect`, `data`, `end`, `error`, `timeout`, `close` — события поверх нативных переходов.

Нижнее состояние держите в голове.

```
JavaScript net.Socket
  -> нативный TCPWrap или PipeWrap
  -> libuv handle
  -> сокет или pipe endpoint ОС
```

Для TCP handle libuv — `uv_tcp_t`: состояние TCP и регистрация в event loop. На Unix — привязка к file descriptor. На Windows — socket handle и Windows I/O. Публичный API Node выровнен на обеих платформах.

TCPWrap — внутренний binding Node. Реализация может сдвигаться между версиями Node; роль стабильна для отладки: нативный объект между `net.Socket`/`net.Server` и TCP handle libuv. JavaScript вызывает методы → libuv → колбэки → события и колбэки пользователя.

Для локальных IPC Node использует pipe-ориентированные handles вместо TCP. API по-прежнему `net.Server` и `net.Socket` для многих операций. Меняется формат endpoint и нижний примитив ОС. Контракт stream знаком.

Два частых пути создания:

```js
const server = net.createServer(onConnection);
const client = net.createConnection(3000, '127.0.0.1');
```

`net.createConnection()` и `net.connect()` — синонимы для клиента. Создают `net.Socket` и вызывают `socket.connect()`. Сервер обычно с `net.createServer()`. Клиент — с `net.connect()`, когда host и port известны.

## Путь нативного handle

Глубина — между вызовом метода JavaScript и событием, пришедшим позже.

`net.Server` и `net.Socket` — объекты JavaScript с видимым состоянием, слушателями, stream-механикой и ссылкой на нативный handle. Нативный handle — место, где Node покидает JavaScript и идёт в libuv. Для TCP — libuv TCP handle. Для локальных pipe — pipe handle.

TCP handle — объект event loop для TCP. В терминах libuv: инициализация, bind, connect, read, write, stop, close и жизненный цикл: initialized, active, closing, closed. У объекта JavaScript свои флаги stream — два слоя состояния нужно согласовать.

Здесь живут странные баги.

При `server.listen()` Node просит libuv bind и listen. libuv делает платформенную работу. На Unix нижний сокет — descriptor и polling backend (epoll на Linux через libuv, kqueue на macOS/BSD, IOCP на Windows). Событие JavaScript остаётся `connection` на всех платформах.

Polling backend сообщает готовность к accept. Node выполняет нативный accept. Принятый сокет получает свой handle. Node создаёт новый `net.Socket` и связывает с handle.

Владение:

```
server JS object
  -> один нативный listen handle

accepted socket JS object
  -> один нативный connected handle
```

Handle сервера и принятого сокета разделены. `server.close()` и `socket.end()` делают разную работу.

Чтение: готовность connected сокета → libuv → read в память через allocation callbacks → Buffer → readable сторона `net.Socket` → `data`.

Запись: чанк в writable → нативные write requests → libuv → ОС → позже completion, колбэки, `drain`.

Write request живёт своей жизнью: может пережить вызов `socket.write()`, завершиться после return стека, упасть после reset пира, быть отброшенным локальным `destroy()`.

Закрытие в два слоя. `socket.end()` — упорядоченное завершение writable. `socket.destroy()` — destroyed в JS и teardown handle. Колбэки close libuv после закрытия нижнего handle → `close` в JavaScript.

Поэтому close иногда «запаздывает»: JS уже destroyed, handle ещё закрывается; `close` — позднее наблюдение завершения teardown с точки зрения Node.

`TCPWrap` — ориентир отладки, не публичный API. Логика приложения — на `net.Server`, `net.Socket`, событиях, stream-методах и документированных опциях.

Нюанс: `net.Socket` может существовать до полезного handle. `new net.Socket()` — stream-состояние сразу; connect после `connect()`. Accept сервера — уже connected. `net.connect()` — создание и connect одним вызовом. Один класс, разные точки входа в жизненный цикл.

Практическая модель состояний `net.Socket`:

```
created
connecting
connected
ending
closed
destroyed
```

Имена — чтение для отладки, не гарантия внутренних полей. Публично: `connecting`, `pending`, `destroyed`, `closed`, `readyState`, `connect`, `end`, `close`.

`readyState` — `opening`, `open`, `readOnly`, `writeOnly`, `closed`. Для диагностики; в приложении чище явное состояние протокола.

Ошибка сокета может прийти после операции, которая её вызвала. Запись в JS → submit write → позже сбой в ядре → completion в libuv → `error`. Функция давно вернулась — нормальный async I/O; на сокетах видно, потому что пир меняет состояние в любой момент.

Одно правило: `net.Socket` — фасад stream вокруг handle, состояние которого независимо от стека вызовов JavaScript.

## До и после `listen()`

`net.Server` — объект сервера JavaScript: слушатели соединений, состояние close, адрес после bind, нативный handle после появления нижнего сокета.

```js
const server = net.createServer((socket) => {
    socket.end('ok\n');
});

console.log(server.address());
server.listen(0, '127.0.0.1');
```

До завершения bind `server.address()` возвращает `null`. После listening — `AddressInfo` для TCP-серверов.

```js
server.on('listening', () => {
    console.log(server.address());
});
```

`AddressInfo` — `{ address, family, port }`. Для IPv4 loopback, например `{ address: '127.0.0.1', family: 'IPv4', port: 41891 }`. Порт `0` — ОС выбирает порт; `server.address().port` нужен клиенту.

`server.listen()` привязывает endpoint и начинает accept. Для TCP — порт и опциональный host или объект опций. Вызов может быть асинхронным: Node уходит в нативный код, ОС может отклонить bind.

```js
const server = net.createServer();

server.on('error', (err) => console.error(err.code));
server.listen({ host: '127.0.0.1', port: 3000 });
```

Ошибки bind — событие `error` сервера. `EADDRINUSE` — конфликт локального endpoint. `EADDRNOTAVAIL` — адрес недоступен в namespace хоста/сети. Ошибки прав — привилегированные порты и политика платформы.

Успех — событие `listening`.

```js
server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    console.log(address.port);
});
```

Колбэк listen — разовый слушатель `listening`. Слушающий сокет есть ниже JavaScript. ОС заняла endpoint. Входящие handshake могут завершаться и ждать accept в Node.

Слушающий сокет — состояние ОС, принимающее новые попытки соединения на локальный endpoint: протокол, семейство, адрес, порт, listen, очереди ядра до accept в user space. Backlog — в [опциях сокетов и backlog](./socket-options-backlog.md); разделение здесь: объект сервера — JS, слушающий сокет — ОС.

Путь listen примерно:

```
server.listen()
  -> create TCPWrap
  -> create libuv TCP handle
  -> create OS socket
  -> bind local address
  -> mark socket as listening
```

Syscalls скрыты одним методом. Границы просачиваются через ошибки, поля адреса и тайминг.

Перегрузки `server.listen()` сходятся к одной нижней операции. Числовая форма:

```js
server.listen(3000, '127.0.0.1');
```

Объектная — удобнее расширять:

```js
server.listen({
    port: 3000,
    host: '127.0.0.1',
});
```

Путь для локальных endpoint:

```js
server.listen('/tmp/nodebook.sock');
```

TCP даёт `AddressInfo` после bind. Путь — строку из `server.address()`. Ветвите код по типу endpoint при публикации адреса.

```js
const address = server.address();

if (typeof address === 'string') console.log(address);
else console.log(`${address.address}:${address.port}`);
```

В библиотеках с TCP и IPC трактовать `server.address()` всегда с `.port` ломает UNIX domain.

Колбэк listen привязан к успешному setup, не к здоровью будущих соединений. Сервер может час работать и принимать сокеты, которые сразу reset. Колбэк значит только: listening endpoint создан.

`error` до `listening` — обычно провал старта; процесс должен упасть быстро или явно сообщить об ошибке старта.

```js
server.once('error', (err) => {
    console.error('listen failed', err.code);
});
```

После listening `error` на сервере — сбои уровня сервера. Сбои соединения — на каждом `net.Socket`. Ошибка: ждать, что `server.on('error')` поймает все сбои сокетов.

```js
net.createServer((socket) => {
    socket.on('error', (err) => console.error(err.code));
}).on('error', (err) => {
    console.error('server', err.code);
});
```

Два обработчика — два emitter'а. Сервер — listen и handle сервера. Сокет — одно соединение.

Привязка к host меняет, какие локальные адреса принимают трафик:

```js
server.listen(3000, '127.0.0.1');
```

IPv4 loopback. Клиенты на той же машине — `127.0.0.1:3000`. Удалённые машины нуждаются в не-loopback адресе хоста.

```js
server.listen(3000, '0.0.0.0');
```

Все подходящие IPv4 адреса namespace. У принятого сокета `socket.localAddress` — конкретный адрес, до которого дошёл клиент. `server.address()` может показывать wildcard bind.

Без host Node и ОС выбирают умолчание; возможно поведение IPv6 wildcard. При отладке указывайте host явно. Числовые адреса убирают DNS из эксперимента.

## Путь accept

Клиент подключается. Ядро делает TCP handshake. Слушающий сокет готов к accept. libuv видит готовность. Node accept и создаёт JavaScript-сокет.

```
incoming TCP handshake
  -> OS accepted connected socket
  -> libuv accept callback
  -> new TCPWrap
  -> new net.Socket
  -> server emits connection
```

Событие `connection` — входящий пир принят и обёрнут в `net.Socket`. Колбэк `net.createServer()` — слушатель этого события.

```js
const server = net.createServer();

server.on('connection', (socket) => {
    console.log(socket.remoteAddress, socket.remotePort);
});
```

К моменту listener подключённый сокет существует. TCP established. Есть локальный и удалённый endpoint. Node создал обёртку и stream-состояние.

Подключённый сокет — сокет с peer endpoint. Для TCP — одно established-соединение с полями адресов, readable/writable, буферами ядра и TCP-состоянием ниже Node.

Один слушающий сервер — много подключённых сокетов:

```js
const sockets = new Set();

net.createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
}).listen(3000);
```

Set отслеживает обёртки JS. Ядро — состояние каждого сокета. Каждый accept — свой handle; на Unix ещё один file descriptor. Busy-сервер может исчерпать дескрипторы при одном `net.Server`.

Принятый сокет несёт endpoint:

```js
net.createServer((socket) => {
    console.log(socket.localAddress, socket.localPort);
    console.log(socket.remoteAddress, socket.remotePort);
}).listen(3000, '0.0.0.0');
```

`local*` — ваша сторона. `remote*` — пир по TCP. Прокси/NAT описывают immediate TCP peer; идентичность выше — в других главах.

Данные — чанки stream:

```js
net.createServer((socket) => {
    socket.on('data', (chunk) => {
        socket.write(chunk);
    });
}).listen(3000);
```

Echo-сервер. Чанк `data` — байты из приёмного пути сокета. TCP держит порядок; границы сообщений — выше. Одна запись клиента — несколько `data` или наоборот. Поведение потока байтов — в [TCP: поток и сбои](./tcp-flow-failure.md); `node:net` отдаёт его напрямую.

Сырым TCP нужно кадрирование поверх `net.Socket`: где кончается одно логическое сообщение. Префиксы длины, разделители, фиксированные записи, state machine парсера. Сокет даёт байты; протокол — границы.

Минимальный парсер по разделителю:

```js
let pending = '';

socket.on('data', (chunk) => {
    pending += chunk;
    const lines = pending.split('\n');
    pending = lines.pop();
});
```

Неполон: границы кодировки и неограниченный рост памяти. Механизм: хвост между `data`, потому что границы чанков ≠ границы протокола.

Для бинарных протоколов чаще безопаснее Buffer:

```js
let pending = Buffer.alloc(0);

socket.on('data', (chunk) => {
    pending = Buffer.concat([pending, chunk]);
});
```

`Buffer.concat()` копирует. Высокая пропускная способность — список чанков и смещения; копия только для целого кадра. См. [Buffer](../buffers/what-is-buffer.md); на горячем пути `node:net` это заметно.

`socket.pause()` — поведение stream с сетевым следствием. Readable в JS перестаёт течь. Данные могут оставаться в буферах Node и receive buffer ядра. Долгая пауза при продолжающейся отправке пира — TCP flow control через receive window.

```js
socket.pause();

setTimeout(() => socket.resume(), 1000);
```

Пауза меняет только локальное чтение. Пир видит замедление или блокировку записей через TCP, не кастомное сообщение.

`pause()` — когда локальному парсеру или downstream нужно время. Сообщения протокола — когда пиру нужна семантическая обратная связь.

Принятый сокет может читать сразу. Если перед чтением нужен setup — вешайте обработчики рано и пауза осознанно.

```js
const server = net.createServer((socket) => {
    socket.pause();
    setup(socket).then(
        () => socket.resume(),
        (err) => socket.destroy(err)
    );
});
```

Сокет есть, пока идёт setup. Пир уже может слать байты. Пауза не эмитирует flowing `data` до готовности; нижние буферы конечны. Долгий setup — таймауты или ранний отказ.

Принятые сокеты могут жить дольше слушающего сокета сервера.

```js
const server = net.createServer((socket) => {
    socket.write('connected\n');
});

server.listen(3000);
```

После `server.close()` принятые сокеты могут читать и писать до `end`, `error` или `destroy()`. Жизненный цикл сервера и соединения разделены — разные нижние сокеты.

## Клиентские сокеты

Клиент начинается с `net.Socket` до привязки к удалённому пиру. `socket.connect()` — исходящая попытка.

```js
import net from 'node:net';

const socket = new net.Socket();

socket.connect(3000, '127.0.0.1');
```

`socket.connect()` просит Node подключить сокет к удалённому endpoint. Для TCP — разрешение host при необходимости, TCP handle, connect в ОС, `connect` после established.

Чаще `net.connect()`:

```js
const socket = net.connect(3000, '127.0.0.1', () => {
    socket.write('ping\n');
});
```

Колбэк — разовый `connect`. Записи до connect ставятся в очередь Node и сбрасываются после успеха, с учётом ошибок и writable.

Форма опций — когда важен выбор адреса:

```js
const socket = net.connect({
    host: 'example.com',
    port: 80,
    localAddress: '192.0.2.10',
});
```

`host`/`port` — удалённый запрос. `localAddress` ограничивает источник. ОС проверяет адрес по интерфейсам и маршрутам. DNS — в [разрешении DNS](./dns-resolution.md); hostname должен стать адресом до TCP connect.

Также `family` и `lookup`:

```js
const socket = net.connect({
    host: 'localhost',
    port: 3000,
    family: 4,
});
```

Запрос IPv4. Полезно, когда `localhost` даёт и IPv6, и IPv4, а сервер слушает одно семейство.

Кастомный `lookup` — острый инструмент:

```js
net.connect({
    host: 'service.local',
    port: 9000,
    lookup: dns.lookup,
});
```

Пример явно передаёт стандартный lookup. Реальные функции добавляют кэш, метрики, overrides, service discovery. Контракт жёсткий: connect ждёт адрес и family для TCP.

Node может пробовать кандидатов по логике lookup и connect. Гонки и полный путь клиента — в [пути запроса от клиента](./request-path-client-process.md). На уровне `net.Socket` — `connect` или `error`.

```js
socket.on('connect', () => {
    console.log(socket.localAddress, socket.localPort);
    console.log(socket.remoteAddress, socket.remotePort);
});
```

После `connect` поля endpoint заполнены. Локальный порт часто эфемерный. Локальный адрес — из маршрутизации, если не задан. Удалённый — часто числовой адрес после resolve, не исходная строка host.

Сбои connect — ошибки:

```js
socket.on('error', (err) => {
    console.error(err.code, err.address, err.port);
});
```

`ECONNREFUSED` — отказ на транспорте. `ETIMEDOUT` — таймаут нижней сети. `ENOTFOUND` — DNS до TCP. Один канал `error` несёт слои — логируйте `code` и поля endpoint.

Запись до connect легальна — Node ставит в очередь:

```js
const socket = net.connect(3000, '127.0.0.1');

socket.write('hello before connect\n');
```

Удобно для маленьких клиентов. Скрывает ошибки порядка. При провале connect очередь некуда деть — ошибка сокета. Для протоколов с setup-state ждите `connect`.

```js
socket.once('connect', () => {
    socket.write('HELLO\n');
});
```

Протокол после транспорта. Пир может сразу закрыться, но локальная последовательность ясна.

Для багов connect полезны `readyState` и `pending`:

```js
console.log(socket.pending, socket.readyState);
```

`pending` — ждёт ли connect. `readyState` — readable/writable на слое stream. Для логов и assert; состояние протокола — в своём автомате.

Клиент эмитирует `close` после закрытия. Аргумент `close` может быть boolean «был ли error до close».

```js
socket.on('close', (hadError) => {
    console.log({ hadError });
});
```

`error` и `close` разные. `error` — сбой. `close` — сокет закрыт. Cleanup, который должен всегда выполниться — в `close`; диагностика — в `error`.

## Запись — локальное обязательство

`socket.write()` принимает байты в writable-путь. Строка, `Buffer`, `TypedArray`, `DataView`. Строки кодируются перед нижним путём.

```js
socket.write('hello\n');
socket.write(Buffer.from([0x6f, 0x6b, 0x0a]));
```

Возвращаемое значение — сигнал backpressure stream. `true` — ниже порога. `false` — буферизовано достаточно; ждите `drain`.

```js
if (!socket.write(chunk)) {
    socket.once('drain', sendMore);
}
```

Сигнал локального stream, близко к сокету, но всё же локальный. `true` — чанк принят в writable-путь Node. Колбэк записи — чанк ушёл из очереди записи Node в нижний слой. Ноль байтов обработано приложением пира.

Цепочка удержания:

```
JavaScript call
  -> Node writable queue
  -> libuv write request
  -> kernel send buffer
  -> TCP transmission
```

Send buffer ядра ниже Node. TCP может ждать окно пира, congestion, ретрансмиссию, маршрут. `socket.write()` — локальный сигнал; сеть продолжается дальше.

Для протокола это важно.

```js
socket.write('DONE\n', () => {
    socket.end();
});
```

Колбэк упорядочивает локальные операции: end после прохождения очереди Node. Это прогресс локальной очереди, не ACK пира. Нужен ответ протокола — читайте байты обратно.

Node может батчить чанки перед libuv. Публичный контракт прост: вы пишете чанки, stream решает staging для нативных writes.

`cork()` / `uncork()` Writable работают и здесь:

```js
socket.cork();
socket.write('A');
socket.write('B');
socket.uncork();
```

Батч в слое stream до `uncork()`. Ниже — socket options и ядро. Nagle и `TCP_NODELAY` — в [опциях сокетов](./socket-options-backlog.md). Узкое утверждение: cork меняет буферизацию Node writable до ухода ниже.

Порядок колбэков записи следует порядку чанков в stream. Полезно освобождать память на чанк или двигать локальную send-очередь.

```js
socket.write(payload, (err) => {
    if (err) return onWriteFailure(err);
    release(payload);
});
```

Между enqueue и completion сокет может упасть — обрабатывайте `err` в колбэке.

Большие записи: `socket.write()` на 100 MiB Buffer принимает аллокацию в stream-путь. Backpressure после вызова не отменяет уже сделанную аллокацию. Стримите чанками.

```js
source.on('data', (chunk) => {
    if (!socket.write(chunk)) source.pause();
});
socket.on('drain', () => source.resume());
```

Старый паттерн. `stream.pipeline()` чище при двух stream, но сырые TCP-протоколы часто требуют парсера между read и write.

`socket.write()` может синхронно упасть на неверных аргументах или локальном состоянии. Сетевые сбои — `error` или колбэки после изменения нижнего состояния.

```js
socket.on('error', (err) => {
    if (err.code === 'EPIPE')
        console.error('write after close');
});
```

`EPIPE` — запись после закрытия пути записи. `ECONNRESET` — reset. Тайминг решает, где увидите сбой. Пир reset — следующая запись может его обнаружить.

Backpressure на `net.Socket` — и stream, и сеть. Игнорирование `false` раздувает память в user space. Пир не читает — сжимается receive window, локальная отправка встаёт. Producer в JS может обогнать и очередь Node, и сеть.

Loopback в тестах быстрый, буферы щедрые — давление не видно. Тот же код падает на медленном клиенте или congested пути.

Безопасная форма — обычный stream-код:

```js
function send(socket, chunks) {
    const queue = Array.from(chunks);
    const pump = () => {
        while (
            queue.length &&
            socket.write(queue.shift())
        ) {}
        if (queue.length) socket.once('drain', pump);
        else socket.end();
    };
    pump();
}
```

Упрощённый пример: стоп при `false`, resume на `drain`. Очередь в closure, потому что `drain` вызывает `pump` без аргументов. В продакшене — cleanup, ошибки, состояние протокола.

## `end()` передаёт намерение

`socket.end()` завершает writable-сторону. Можно передать финальный чанк.

```js
socket.end('bye\n');
```

Для TCP — путь FIN из [TCP: поток и сбои](./tcp-flow-failure.md). Node ставит опциональные данные в очередь и закрывает запись. Пир может ещё слать. При `allowHalfOpen: false` по умолчанию Node обычно закрывает запись после конца readable — привычное полное закрытие.

Readable и writable — разные события:

```js
socket.on('end', () => {
    console.log('peer ended writes');
});

socket.on('close', () => {
    console.log('socket closed');
});
```

`end` — пир закончил отправку вам. `close` — handle закрыт. Между ними могут быть pending данные.

Для простых request-response часто достаточно `end()`:

```js
socket.write('result\n');
socket.end();
```

Отправить байты и завершить нашу сторону записи. Очередь сохраняется через stream. TCP получает шанс на упорядоченное закрытие.

Half-open — где `node:net` показывает TCP. Сервер с `allowHalfOpen: true` оставляет writable открытым после `end` пира.

```js
const server = net.createServer(
    { allowHalfOpen: true },
    (socket) => {
        socket.on('end', () => socket.end('ack\n'));
    }
);
```

`end` — пир прислал FIN. С `allowHalfOpen: true` вы сами шлёте FIN через `socket.end()`. Half-open как TCP-состояние — в [TCP: поток и сбои](./tcp-flow-failure.md); здесь — опция Node.

Держите half-open только с причиной в протоколе. Иначе дескрипторы, таймеры и состояние живут дольше, чем нужно.

`finish` — writable stream закончил и сбросил данные из реализации stream.

```js
socket.end('done\n');
socket.on('finish', () => console.log('write side ended'));
```

`finish` — локальное завершение записи. `end` — конец чтения с пира. `close` — закрытие handle. Имена легко перепутать рядом с shutdown.

Простой сервер часто слушает все три:

```js
socket.on('end', onPeerEnded);
socket.on('finish', onLocalEnded);
socket.on('close', onClosed);
```

Разные рёбра. В баг-репорте «сокет ended» уточняйте, какое событие.

## `destroy()` срывает локальное состояние

`socket.destroy()` немедленно закрывает сокет с точки зрения Node: stream, handle, отбрасывает queued writes в Node.

```js
socket.destroy();
```

Сбои, нарушения протокола, жёсткий shutdown, cleanup после таймаута.

С ошибкой:

```js
socket.destroy(new Error('bad frame'));
```

Ошибка уходит в teardown сокета, затем `close`. Парсер нашёл невалидный ввод — downstream получает причину.

`destroy()` и TCP RST связаны на границе API; пакеты решает ОС по состоянию, unread data, pending writes, платформе, опциям. Практически: queued userland writes могут пропасть, handle закрывается, read/write прекращаются.

Не для нормального завершения протокола:

```js
socket.write('ok\n');
socket.destroy();
```

Запись может остаться в очереди Node при `destroy()`. Пир может ничего не получить, часть байтов или данные и reset — по таймингу. Нужна доставка через локальный путь — `end()` или колбэк записи до teardown.

Пути сбоя:

```js
socket.on('data', (chunk) => {
    if (chunk.length > 1024) socket.destroy();
});
```

Резкий отказ: прекращает read/write для пира, освобождает ресурсы после `close`.

Повторный `destroy()` безвреден. После destroyed дополнительные вызовы — no-op. Флаг `destroyed`.

```js
if (!socket.destroyed) {
    socket.destroy();
}
```

`closed` и `destroyed` для lifecycle-багов; чище смотреть порядок событий: `error`, `end`, `timeout`, `close`.

Есть `destroySoon()` — legacy: end writable после drain очереди, затем destroy. Новый код читает яснее с явным `end()` и `destroy()`.

`resetAndDestroy()` для TCP — reset, когда возможно, затем destroy stream.

```js
if (typeof socket.resetAndDestroy === 'function') {
    socket.resetAndDestroy();
}
```

Только когда reset — желаемое поведение протокола. Сильнее обычного `destroy()`. На pipe — `ERR_INVALID_HANDLE_TYPE`. Для TCP — connecting/connected; закрытый TCP — `ERR_SOCKET_CLOSED` и destroy. Обычным серверам редко нужен.

## Шкала событий

Счастливый путь сервера:

```
server.listen()
  -> listening
  -> connection
  -> socket data
  -> socket end
  -> socket close
```

Реальность ветвится: reset клиента, destroy парсера, timeout, broken pipe на write, `server.close()` при живых соединениях.

Клиент:

```
socket.connect()
  -> connect
  -> data
  -> end
  -> close
```

Ошибки до/после `connect`, на write, read, close. Один `error` handler на сокет. Необработанный `error` на EventEmitter всё ещё валит процесс.

```js
socket.on('error', (err) => {
    console.error(err.code);
});
```

После ошибки сокета обычно следует `close`. Release logic — в `close`. Диагностика — в `error`.

`data` — один режим чтения. Есть stream-методы, `pipe()`, async iteration.

```js
for await (const chunk of socket) {
    console.log(chunk.length);
}
```

Цикл до конца readable или ошибки. Async iteration из [async-итераторов](../async-patterns/async-iterators.md). Тот же нижний приёмный путь.

События сервера:

```js
server.on('listening', () => console.log('ready'));
server.on('close', () => console.log('closed'));
server.on('error', (err) => console.error(err.code));
```

`listening` — слушающий сокет активен. `close` — handle сервера закрыт. `error` — сбой уровня сервера, часто bind/listen.

События — наблюдения JS, переведённые из нижнего состояния. При странном тайминге смотрите оба: логи сокета и таблицу сокетов ОС.

## Таймауты сообщают о неактивности

Таймаут сокета в `node:net` — таймер неактивности: за интервал не было активности сокета.

```js
socket.setTimeout(30_000);

socket.on('timeout', () => {
    socket.destroy();
});
```

`timeout` — уведомление. Node сокет не закрывает. Серверы часто уничтожают idle raw-сокеты: память, handle, состояние протокола.

Таймер сбрасывается при активности. Read и write считаются. Точный учёт — в реализации stream/socket Node; трактуйте как детектор idle, не дедлайн протокола.

```js
const server = net.createServer((socket) => {
    socket.setTimeout(10_000);
    socket.on('timeout', () => socket.end('idle\n'));
});
```

Финальное сообщение и graceful end. Может зависнуть, если пир не читает и последняя запись не продвигается. Жёсткая политика idle — `destroy()` после timeout. Вежливый протокол — `end()` и второй таймер на destroy.

Таймауты исходящего connect — отдельный дизайн. `setTimeout()` может ловить idle при connecting, но retry, AbortController и дедлайны запросов — в других главах. Для raw `net.Socket`: событие `timeout` приходит; политику закрытия пишете вы.

Типичный баг — handler только логирует:

```js
socket.setTimeout(60_000);
socket.on('timeout', () => console.warn('idle socket'));
```

Idle записан, дескриптор открыт. Под нагрузкой сокеты копятся. Нужен cleanup в handler.

## Локальные socket endpoint'ы

`node:net` поддерживает локальные endpoint'ы. Unix — UNIX domain sockets. Windows — named pipes.

UNIX domain socket — локальный IPC по пути в ФС. Socket API и stream-семантика, трафик на том же хосте. Адрес — путь, не IP:port.

```js
import net from 'node:net';

const path = '/tmp/nodebook.sock';

net.createServer((socket) => {
    socket.end('local\n');
}).listen(path);
```

Для UNIX server `server.address()` — строка пути. `AddressInfo` — форма TCP; путь возвращается напрямую.

Клиент:

```js
const socket = net.connect('/tmp/nodebook.sock');

socket.on('data', (chunk) => {
    process.stdout.write(chunk);
});
```

Тот же Duplex stream. Ниже — локальный IPC. Частые сбои: права, cleanup пути, лимиты ОС.

После падения сервера файл пути может остаться — следующий `listen(path)` падает.

```js
import fs from 'node:fs';

try {
    fs.unlinkSync('/tmp/nodebook.sock');
} catch {}
server.listen('/tmp/nodebook.sock');
```

В примерах часто; в продакшене не unlink'айте путь, которым владеет другой живой процесс. Безопаснее проверить, слушает ли кто-то endpoint, перед удалением stale state.

Windows named pipe — имя pipe вместо пути:

```js
const pipe = '\\\\.\\pipe\\nodebook';

net.createServer((socket) => {
    socket.end('pipe\n');
}).listen(pipe);
```

Именованный локальный IPC endpoint. Те же `net.Server`/`net.Socket` где возможно. Правила имён и безопасность — специфичны для Windows.

Локальные endpoint'ы — same-host сервисы, sidecar, тестовые фикстуры, supervisor-managed демоны. Без TCP-портов и удалённой экспозиции. Нужны lifecycle, права и timeout policy.

TCP — когда endpoint достижим по IP и порту. Локальный сокет или pipe — оба пира на хосте и нужен OS-local endpoint. Передача handle IPC — отдельная тема (в nodebook — позже).

## Закрытие сервера

`server.close()` прекращает accept новых соединений. Принятые сокеты живут своим циклом.

```js
const server = net.createServer((socket) => {
    socket.write('still alive\n');
});

server.listen(3000, () => {
    server.close();
});
```

После `server.close()` слушающий сокет закрывается или закрывается. Новые клиенты через этот сервер не подключаются. Уже принятые продолжают до end/error/destroy.

Колбэк close:

```js
server.close((err) => {
    if (err) console.error(err.code);
    else console.log('server closed');
});
```

Если сервер не был открыт — ошибка в колбэке. Событие `close` без аргумента ошибки. Колбэк — когда нужно отличить нормальное закрытие от «close при уже закрытом/не стартовавшем».

Учёт сокетов — ваша задача, если shutdown требует cleanup соединений:

```js
const sockets = new Set();

const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
});
```

Set — способ вызвать `end()`/`destroy()` на принятых после закрытия listener.

```js
server.close(() => console.log('listener closed'));

for (const socket of sockets) {
    socket.end();
}
```

Эскиз локального shutdown. Продакшен draining — дедлайны, readiness, контракты supervisor, семантика HTTP, деплой (в nodebook — отдельные главы). Факт `node:net`: close сервера ≠ close соединений.

Владение соединением в raw `net`-сервере должно быть явным. Фреймворки прячут lifecycle запроса. `node:net` отдаёт сокет и уходит.

Правило: кто принял сокет, тот вешает terminal handlers.

```js
const server = net.createServer((socket) => {
    socket.on('error', logSocketError);
    socket.on('close', () => sockets.delete(socket));
    sockets.add(socket);
});
```

`error` сразу — сокет может упасть до конца setup. `close` сразу — любой путь должен снять tracking.

Per-socket state рядом с сокетом:

```js
const state = { bytes: 0 };

socket.on('data', (chunk) => {
    state.bytes += chunk.length;
});
```

Состояние умирает с сокетом. Общая map — удаляйте в `close`. Таймер — `clear` в `close`. Парсерные буферы — отпустите в `close`. Handle уже нет — приложение не должно держать память пира.

Таймеры легко утекают:

```js
const timer = setInterval(() => socket.write('.'), 1000);

socket.on('close', () => clearInterval(timer));
```

Интервал держит ссылку на сокет через колбэк. Без cleanup в `close` — попытки писать в мёртвый сокет и удержание state.

Backpressure state тоже нужен terminal path. Producer на паузе из-за `false` при ошибке сокета должен resume или destroy источник — иначе вечное ожидание `drain`.

```js
socket.on('error', (err) => {
    source.destroy(err);
});
```

Паттерн приложенческий, идея общая: связывайте lifecycle сокета с тем, что его кормит и потребляет. В raw TCP меньше абстракций — утечки Buffer, дескрипторов, застрявших producer и процесс, живой из-за сокетов.

Наблюдение:

```js
const server = net.createServer((socket) => {
    server.close();
    socket.write('connected after close call\n');
});
```

Принятый сокет ещё пишет — connected handle отдельно от закрываемого listener.

Повторные close могут давать ошибки по таймингу. Close — переход состояния; флаг, если shutdown запрашивают из нескольких мест.

```js
let closing = false;

function stop() {
    if (closing) return;
    closing = true;
    server.close();
}
```

Меньше шума в логах shutdown. Документирует владение: один путь из accepting в closing.

## Один локальный trace

Компактный сервер и клиент показывают путь объектов без DNS и удалённой маршрутизации.

```js
const server = net.createServer((socket) => {
    socket.end('pong\n');
});

server.listen(0, '127.0.0.1');
```

Создан объект сервера, привязан TCP listener на IPv4 loopback с портом от ОС. Порт неизвестен до завершения listen.

```js
server.on('listening', () => {
    const { port } = server.address();
    const client = net.connect(port, '127.0.0.1');
});
```

Connect клиента после `listening` на точный порт ОС. Числовой адрес убирает DNS из пути.

Обычный порядок событий:

```
server listening
client connect starts
server connection
client connect
client data
client end
client close
```

Точное чередование `connection` и client `connect` зависит от планировщика. Оба означают: состояние уже прошло ниже JavaScript. Сервер accept connected socket. Клиент установил свой connected socket.

Логи для нижних идентичностей:

```js
server.on('connection', (socket) => {
    console.log('server local', socket.localPort);
    console.log('server remote', socket.remotePort);
});
```

У принятого сокета local port равен listening port. remote port — эфемерный порт клиента.

Зеркало на клиенте:

```js
client.on('connect', () => {
    console.log('client local', client.localPort);
    console.log('client remote', client.remotePort);
});
```

Local клиента — эфемерный. Remote — listening port сервера. Одно TCP-соединение, разные локальные представления.

Cleanup:

```js
client.on('close', () => {
    server.close();
});
```

Клиент закрылся после `pong\n` и FIN пира. Затем сервер закрывает listener. Принятый сокет уже прошёл свой close. `server.close()` закрывает только listener.

Три сокетных объекта на разных слоях:

```
server listening socket
server accepted socket
client connected socket
```

В JS — один `net.Server` и два `net.Socket`. В ОС — один listening socket и одно TCP-соединение с двух сторон на loopback. Форма та же, что у удалённого соединения; путь локальный.

Почему в raw TCP-тестах порт `0`: ОС выбирает свободный порт, тест читает после `listening`, клиент бьёт в это значение. Параллельные прогоны не делят один глобальный порт.

Версия с видимым сбоем connect:

```js
const client = net.connect(9, '127.0.0.1');

client.on('error', (err) => {
    console.error(err.code);
});
```

Порт `9` обычно закрыт локально — вероятен `ECONNREFUSED`. Ошибка этапа установления. Accept не было. `data` от этой попытки не последует.

Смените только семейство адресов — результат может измениться:

```js
net.connect(3000, '::1').on('error', (err) =>
    console.error(err.code)
);
```

Сервер на `127.0.0.1`, клиент на IPv6 loopback — сбой при «здоровом» IPv4 listener. Порт совпал, адрес сокета — нет. Семейство — часть endpoint.

Тот же trace для UNIX domain с другой формой endpoint:

```js
const path = '/tmp/nodebook-trace.sock';

const server = net.createServer((socket) =>
    socket.end('pong\n')
);
server.listen(path);
```

`server.address()` — строка пути. Объект всё ещё `net.Socket`. Ниже — pipe/socket endpoint вместо TCP. Код, которому нужны только stream read/write, почти не меняется. Логи endpoint должны учитывать другую форму адреса.

## Отладка границы объектов

Быстрее всего логировать переход, который сменил владение.

Сервер — результат bind и endpoint принятого сокета:

```js
server.on('listening', () => console.log(server.address()));
server.on('connection', (socket) => {
    console.log(socket.localAddress, socket.remoteAddress);
});
```

Клиент — connect и ошибки:

```js
socket.on('connect', () => console.log(socket.address()));
socket.on('error', (err) => console.error(err.code));
socket.on('close', (hadError) => console.log({ hadError }));
```

`socket.address()` для TCP — локальный `AddressInfo`, пара `server.address()`. Удалённые поля — `remoteAddress`, `remotePort`, `remoteFamily`.

Нет `connection` — сначала listener: семейство адреса клиента, bind на loopback при клиенте вне namespace, `error` на `listen()`, порт в таблице сокетов хоста.

Нет `connect` у клиента — разделите lookup, маршрут и TCP setup. Числовой адрес убирает DNS. Логируйте `err.code`, `err.address`, `err.port`. Сервер слушает то же семейство и адрес?

«Записи исчезают» — смотрите close path. `write` + `destroy()` может отбросить очередь. Колбэк записи — прогресс локальной очереди, не обработка пиром. Подтверждение протокола — байты, прочитанные от пира.

Копятся idle-сокеты — handlers таймаута. `setTimeout()` эмитирует событие; политику закрытия пишете вы. Handler только с логом — утечка под стабильным трафиком.

Код `node:net` маленький, потому что Node уже сделал обёртку. Сложность — помнить, какой объект чем владеет. `net.Server` — accept. `net.Socket` — один разговор. TCPWrap и libuv — мост к event loop. ОС — реальное состояние сокета. Когда разделение ясно, API перестаёт казаться магией и становится проверяемым.

## Связанное чтение

-   Предыдущая: [TCP в Node.js: поток данных и сбои](./tcp-flow-failure.md)
-   Далее: [UDP и модуль dgram](./udp-dgram.md)
