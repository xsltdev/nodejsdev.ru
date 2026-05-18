---
description: Опции сокетов Node.js — SO_REUSEADDR, backlog, keep-alive и dual-stack
---

# Опции сокетов и backlog в Node.js

Источник: [theNodeBook — Socket Options & Backlog](https://www.thenodebook.com/networking/socket-options-backlog)

Опции сокетов в Node.js задают, как операционная система обрабатывает сокет: keep-alive‑пробы, Nagle через `setNoDelay()`, размеры буферов send/receive, `SO_REUSEADDR`, привязка IPv4/IPv6 и backlog при `listen`. Вызовы в JavaScript короткие, состояние живёт в таблицах сокетов ядра и настройках протокола.

## Опции сокетов и backlog

Опции действуют в конкретные моменты жизненного цикла. Часть нужно выставить до `bind` или `listen`. Часть — на уже подключённом TCP‑сокете. Давление на backlog, лимиты accept‑очереди, SYN‑очередь и дефолты платформы влияют на поведение под нагрузкой.

`EADDRINUSE` при перезапуске обычно значит, что ядро отклонило bind. Node мог создать объект сервера и дойти до libuv, но локальный адрес всё равно принадлежит таблице сокетов ОС.

```js
import net from 'node:net';

const server = net.createServer((socket) => {
    socket.end('ok\n');
});

server.listen({ host: '127.0.0.1', port: 3000 });
```

Второй экземпляр, пока первый слушает, запрашивает тот же локальный адрес. Таблица ядра уже держит listening endpoint для `127.0.0.1:3000` — Node эмитит ошибку с `code: 'EADDRINUSE'`.

Ошибка с пути bind. Опции на сокете решают, можно ли переиспользовать адрес, покрывает ли IPv6 wildcard также IPv4, идут ли idle‑пробы TCP, как батчатся мелкие записи и сколько завершённых соединений ждут до accept в JavaScript.

Опция сокета — настройка на OS socket. Часть применяется до `bind()`, часть до `listen()`, часть после установки TCP‑соединения. Момент важен: ядро читает разные поля на разных переходах.

В JavaScript — методы и поля `listen()`:

```js
server.listen({
    host: '::',
    port: 3000,
    backlog: 1024,
    ipv6Only: true,
});
```

В ОС — семейство, тип, локальный адрес, порт, лимиты очередей и биты опций. Node экспонирует подмножество: остальное платформенно или слишком низкоуровнево для стабильного JS API, но экспонированное реально меняет сеть.

Для TCP‑серверов `server.listen()` принимает `host`, `port`, `backlog`, `ipv6Only`, а в Node v24 — `reusePort` где поддерживается. У принятых и исходящих TCP‑сокетов — `setKeepAlive()`, `setNoDelay()`, `setTimeout()`. У UDP в `dgram.createSocket()` — `reuseAddr`, `reusePort`, `ipv6Only`, `recvBufferSize`, `sendBufferSize` и сеттеры после bind.

`socket.setTimeout()` — уведомление Node о неактивности. TCP keep-alive — пробы на транспорте. HTTP keep-alive — повторное использование соединения на уровне HTTP. Имена похожи, владельцы разные. HTTP‑пулы и connection reuse — отдельные главы; здесь — опции ОС и прямые обёртки Node.

## Где крепятся опции

Опции — состояние объекта сокета в ядре. Node доходит через нативный код и libuv, обычно аналогом `setsockopt()`. Имя `setsockopt` в публичном API редко: у платформ свои handle, константы и правила времени.

Важна последовательность:

```
create socket
  -> set pre-bind options
  -> bind local address
  -> set pre-listen options
  -> listen or connect
  -> set connected-socket options
```

Опции владения адресом — до `bind()`: `reuseAddr`, `reusePort`, `ipv6Only`. Если bind уже упал без опции, поздняя установка не отменит решение — нужен новый сокет или корректная последовательность API.

`backlog` относится к `listen()`: очередь появляется, когда сокет становится listening. ОС ограничивает запрошенное значение.

`SO_KEEPALIVE` и `TCP_NODELAY` — для установленного TCP. На сервере их обычно ставят в `connection`, когда есть `net.Socket`. Клиент может вызвать сразу после `connect()`:

```js
const socket = net.connect(3000, '127.0.0.1');

socket.setNoDelay(true);
socket.setKeepAlive(true, 60_000);
```

Handle уже есть до события `connect`; ошибки — через сокет.

Дефолты на `net.createServer()`:

```js
const server = net.createServer(
    {
        noDelay: true,
        keepAlive: true,
        keepAliveInitialDelay: 60_000,
    },
    (socket) => attachProtocol(socket)
);
```

Node применяет их к принятому сокету до колбэка `connection`.

У UDP проще жизненный цикл; `setRecvBufferSize()` / `setSendBufferSize()` в публичном API требуют bound socket — контракт Node, не универсальный закон ОС.

Стабильная модель — владение, не имена методов. Bind — кто владеет endpoint. Listen — очереди pending. Connected TCP — поведение пакетов и idle probe. Буферы — память ядра на сокете.

Многие опции намеренно не экспонированы: congestion control, corking, marks, bind к интерфейсу — host policy, native addons, sysctl.

Унаследованные сокеты (systemd activation, cluster primary, родитель) могут уже иметь зафиксированные опции. `server.listen(handle)` стартует с чужой историей ядра — тот же JS‑объект, другой путь создания снизу.

Путь listen в сжатом виде:

```
net.createServer()
  -> JavaScript server object
  -> server.listen(options)
  -> native TCP handle
  -> socket()
  -> setsockopt()
  -> bind()
  -> listen()
```

Pre-bind: `ipv6Only`, `reusePort`, дефолтный `SO_REUSEADDR` TCP в Node. `bind()` закрепляет endpoint. `listen()` создаёт listening state и backlog. `'listening'` — нижний listener есть; первый клиент ещё не обязан подключиться; reachability — routing и firewall.

Accept позже:

```
listening descriptor ready
  -> accept()
  -> connected descriptor
  -> net.Socket wrapper
  -> connection listener
```

У каждого accepted descriptor свои опции. Часть наследуется от listener по поведению ОС; для критичных `setNoDelay` и `setKeepAlive` не полагайтесь на неявное наследование — задавайте на accepted `net.Socket`. Опции bind listener'а и опции пакетов connected socket — разные объекты.

`'listening'` означает, что нижний listener существует. Это не «первый клиент уже подключился» и не «endpoint достижим с другого хоста» — только то, что локальный OS bind+listen прошёл.

## Повторное использование при bind

`EADDRINUSE` — конфликт адреса. Для TCP‑сервера другой listening socket уже владеет локальным адресом и портом в том же семействе, или wildcard уже покрывает запрошенный адрес.

```js
const a = net.createServer();
const b = net.createServer();

a.listen(3000, '127.0.0.1');
b.listen(3000, '127.0.0.1');
```

Второй сервер падает даже в одном процессе: ядро сравнивает с активным состоянием, не с планом деплоя.

`EADDRNOTAVAIL` — адрес недоступен на хосте (нет на интерфейсах, неверное семейство, документационный адрес):

```js
net.createServer().listen({
    host: '192.0.2.44',
    port: 3000,
});
```

Перезапуск путает из‑за `TIME_WAIT` у TCP ([глава о TCP](./tcp-flow-failure.md)): listener закрыт, teardown недавних соединений остаётся. `SO_REUSEADDR` разрешает часть повторных bind по правилам ОС. Два активных listener на одном порту — по-прежнему нельзя: это plumbing перезапуска, не балансировка.

На Linux `SO_REUSEADDR` и `SO_REUSEPORT` решают разное: первый смягчает проверки reuse, второй позволяет нескольким сокетам bind один endpoint с распределением входящих соединений/датаграмм ОС.

```js
server.listen({
    host: '0.0.0.0',
    port: 3000,
    reusePort: true,
});
```

Без поддержки платформы Node бросит ошибку. Это не то же самое, что shared handle в cluster ([UDP и reuse](./udp-dgram.md)): отдельные listening socket vs один общий.

UDP:

```js
import dgram from 'node:dgram';

const socket = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true,
});

socket.bind(41234);
```

В v24 `reuseAddr` ослабляет bind при уже занятом адресе, но одну датаграмму получает один сокет; `reusePort` — распределение между сокетами где поддерживается. Multicast часто требует `reuseAddr` на общем порту.

Wildcard `0.0.0.0:3000` может конфликтовать с `127.0.0.1:3000` — правила зависят от ОС и опций, особенно у dual-stack IPv6.

Логируйте точный bind:

```js
server.on('listening', () => {
    console.log(server.address());
});

server.on('error', (err) => {
    console.error(err.code, err.message);
});
```

На Linux `ss -ltnp` / `ss -lunp` — вид ядра.

Поля решения:

```
protocol: TCP or UDP
family: IPv4 or IPv6
local address: concrete or wildcard
local port: requested or ephemeral
reuse option: default, reuseAddr, or reusePort
```

Для TCP перезапуска `TIME_WAIT` обычно относится к accepted соединениям, не к listening descriptor. Старый listener закрыт, teardown недавних TCP может оставаться. `SO_REUSEADDR` помогает новому listener bind в типичных restart‑кейсах. Активный listener с открытым descriptor — другой случай: он принимает новые попытки соединения.

Для UDP нет per-peer connected socket по умолчанию — bound datagram socket сам принимает сообщения, поэтому reuse заметнее: два UDP‑сокета под reuse settings, но ОС всё равно выбирает правило доставки каждой датаграммы.

Обработчик старта должен различать кейсы:

```js
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') process.exitCode = 1;
    else throw err;
});
```

Слепой retry при конфликте с чужим сервисом превращает misconfiguration в медленный boot loop. Retry имеет смысл при controlled restart, пока предыдущий процесс закрывается. Policy process manager — отдельная глава; на уровне сокета `EADDRINUSE` значит «запрос локального endpoint проиграл».

`EADDRNOTAVAIL` retry тем же адресом редко помогает, пока интерфейсы не поднялись. Смотрите список адресов в namespace процесса; в контейнере — внутри контейнера, не на хосте.

## Keep-alive‑пробы

TCP keep-alive — liveness на транспорте для idle‑соединения: ОС шлёт TCP‑пакеты после тишины; peer отвечает ACK; после серии без ответа — ошибка/close.

`socket.setKeepAlive(true, initialDelay)` включает `SO_KEEPALIVE`:

```js
server.on('connection', (socket) => {
    socket.setKeepAlive(true, 30_000);
});
```

Второй аргумент — задержка до первой пробы в мс; `0` оставляет дефолт ОС. Probe не несёт запрос приложения и не проверяет БД — только отклик TCP‑стека peer.

При «тихой» потере пути (NAT, firewall, обрыв питания) локальный сокет может оставаться открытым, пока не отправят данные, не придёт ошибка или не сработает keep-alive.

Дефолты ОС часто ждут часы; `initialDelay` в Node меняет первую задержку, остальная последовательность — sysctl.

`socket.setTimeout()` — таймер неактивности в Node; keep-alive — пробы в ядре. Их можно комбинировать, вопросы разные:

```js
socket.setTimeout(45_000);
socket.on('timeout', () => {
    socket.destroy();
});
```

`timeout` не закрывает сокет сам — политика в обработчике.

HTTP keep-alive выше TCP: агенты решают reuse. Типичный баг — proxy рвёт idle раньше, чем TCP probes; клиент пишет в «мёртвый» путь из пула.

Keep-alive стоит денег на сотнях тысяч idle‑сокетов. Используйте для stale path; здоровье приложения — heartbeats протокола.

Ошибка часто видна в конце, не на каждой пробе:

```js
socket.on('error', (err) => {
    console.error(err.code);
});

socket.on('close', (hadError) => {
    console.log({ hadError });
});
```

Коды вроде `ETIMEDOUT`, `ECONNRESET` — transport liveness failure. `close` может прийти с малым количеством деталей. Treat как transport liveness failure и переподключайтесь по политике протокола.

Между последним успешным байтом и финальной ошибкой — окно: idle, первая probe, drop на middlebox, повторные probes по счётчику ОС. JavaScript видит конец, не каждую probe.

Исходящим клиентам keep-alive часто нужнее, чем серверу: сервер примет нового клиента позже; клиент с long-lived TCP к брокеру может писать в мёртвый путь после долгой тишины.

На listening server `setKeepAlive` бессмысленен — нужен accepted `net.Socket`:

```js
const server = net.createServer(
    {
        keepAlive: true,
        keepAliveInitialDelay: 120_000,
    },
    (socket) => attachProtocol(socket)
);
```

## Nagle и мелкие записи

Мелкие записи показывают компромисс throughput/latency:

```js
socket.write('A');
socket.write('B');
socket.write('C');
```

JavaScript сделал три write. TCP передаёт байтовый поток. Ядро может объединить, задержать или разделить по состоянию TCP, буферов и опций. Peer может получить один `data`, несколько или границы, не совпадающие с вашими write.

Nagle батчит мелкие отправки, пока предыдущие малые данные не подтверждены ACK. `TCP_NODELAY` отключает Nagle; в Node — `setNoDelay(true)`:

```js
server.on('connection', (socket) => {
    socket.setNoDelay(true);
});
```

Имя инвертировано: `setNoDelay(true)` выключает Nagle. Без аргумента в Node — `true`.

Delayed ACK на стороне приёма может задержать ACK; вместе с Nagle — паузы десятки–сотни мс при живой сети.

Лечение — `setNoDelay(true)` и/или батчинг в приложении:

```js
socket.write(
    'AUTH user\r\n' + 'PASS secret\r\n' + 'PING\r\n'
);
```

Нет универсально «самого быстрого»: отключение Nagle помогает latency; включение — меньше пакетов при chatty мелких `write`.

Backpressure отдельно: `setNoDelay` не расширяет буфер peer.

`cork()` / `uncork()` — батчинг writable stream в Node, не Nagle:

```js
socket.cork();
socket.write('header\r\n');
socket.write('body\r\n');
socket.uncork();
```

Плохой паттерн — байт за байтом в цикле; `setNoDelay` не спасает от лишних вызовов JS/stream:

```js
for (const byte of payload) {
    socket.write(Buffer.of(byte));
}
```

Даже без Nagle остаются лишние вызовы, stream operations, переходы в native и возможные крошечные сегменты. Соберите буфер или строку единицы протокола, затем один `write`.

Решайте `TCP_NODELAY` при установке соединения и измеряйте на реальном паттерне сообщений. Переключение в середине жизни сокета легально, но усложняет reasoning о пакетах.

## Backlog и давление на accept

```js
server.listen({
    host: '0.0.0.0',
    port: 3000,
    backlog: 1024,
});
```

`backlog` просит лимит pending соединений; ОС clamp'ит (`somaxconn`, `tcp_max_syn_backlog` на Linux). Дефолт Node — 511.

Две очереди на типичном стеке:

```
client SYN
  -> SYN backlog
  -> handshake completes
  -> accept queue
  -> libuv accept
  -> Node connection event
```

SYN backlog — half-open: SYN пришёл, SYN-ACK ушёл, финальный ACK ещё не завершил handshake (точное представление зависит от SYN cookies и защиты от flood, роль одна — отслеживать handshake до completed connection).

Accept queue — завершённые TCP, которые приложение ещё не accept'ило. Handshake готов, kernel может выдать connected socket, JavaScript ещё не получил `connection`.

Node после обеих очередей: libuv на listening socket → accept → `net.Socket` → `'connection'`.

Полезная трассировка одного accepted connection:

```
SYN received
SYN-ACK sent
ACK received
connected socket queued
accept returns descriptor
net.Socket created
connection event emitted
```

Событие `connection` близко к концу пути. Всё до `accept returns descriptor` — состояние ОС.

Соединение может быть установлено до `connection` в JS. При spike очереди поглощают разницу во времени; overflow — timeout/reset на клиенте, тишина в логах, начинающихся с `connection`.

Каждый accept — descriptor; backlog не поднимает `ulimit -n`.

`server.maxConnections` — лимит Node после accept; событие `drop` в новых версиях.

Блокировка event loop в обработчике `connection` задерживает drain accept queue:

```js
net.createServer((socket) => {
    JSON.parse(expensiveConfigBlob);
    socket.end('ready\n');
});
```

Вынесите тяжёлую инициализацию из пути accept.

Backlog — лимит очереди на одной границе, не «ёмкость сервера». Сервер может держать тысячи соединений и быть медленным; большой backlog не спасёт, если первыми падают descriptors, CPU, память или upstream policy.

Поведение overflow зависит от платформы: timeout, reset, медленный handshake, успех после retransmit. Сервер может не увидеть отброшенные попытки — метрики только по `connection` пропускают нижние очереди.

Бенчмарк‑ловушка: генератор открывает много соединений сразу; burst `connection` позже не значит мгновенный accept в момент connect на клиенте — часть handshake завершилась и ждала в accept queue, пока JS был занят.

Косвенная видимость очереди:

```js
server.on('connection', (socket) => {
    console.log(Date.now(), socket.remotePort);
});
```

Timestamp — момент accept в JavaScript, не завершение handshake. Сравнивайте с client connect timing при spike.

Load balancer может ретраить другой backend или держать свой pool — политики позже; у каждого backend свой listener backlog и лимит descriptors.

Практический выбор backlog скромнее marketing tuning guides: для обычных сервисов дефолт Node часто достаточен; для burst коротких соединений больший backlog снижает отказы, пока процесс кратко занят — host limits всё равно cap'ят запрос.

## Размеры буферов

`SO_SNDBUF` / `SO_RCVBUF` — лимиты буферов ядра; ОС может округлять и autotune.

UDP в Node:

```js
const socket = dgram.createSocket({
    type: 'udp4',
    recvBufferSize: 1 << 20,
    sendBufferSize: 1 << 20,
});
```

Сеттеры после bind:

```js
socket.bind(41234, () => {
    socket.setRecvBufferSize(1 << 20);
    socket.setSendBufferSize(1 << 20);
});
```

До bind — ошибка socket-buffer-size.

У `net.Socket` нет общих `setRecvBufferSize`/`setSendBufferSize` в стабильном API — давление через stream и инструменты ОС.

Больший receive buffer сглаживает burst (особенно UDP); растёт память на сокет. Больший send buffer откладывает backpressure.

```js
const ok = socket.write(Buffer.alloc(64 * 1024));

if (!ok) {
  socket.once("drain", resumeWork);
});
```

`false` от `write` — давление stream; ядро, окно TCP и congestion — отдельные слои.

Полный UDP receive buffer — дроп без `message`. Полный TCP receive — shrink window и замедление peer.

Увеличивайте буферы после измерений, не по умолчанию.

Полезная отладка — найти очередь: буфер stream в Node, receive/send buffer ядра, sender state TCP, потери UDP. Тогда изменение опции целенаправленно, а не наугад.

UDP sequence check — только на уровне приложения:

```js
socket.on('message', (msg) => {
    const seq = msg.readUInt32BE(0);
    checkSequence(seq);
});
```

UDP не эмитит «пропущено сообщение». Больший `SO_RCVBUF` уменьшает один локальный источник drop, не добавляет учёт доставки.

Большой send buffer может скрыть медленного peer: producer выглядит здоровым, данные ждут в ядре, latency растёт вне heap profiler. У TCP помогает `drain`; у UDP callback send — про локальное завершение, не receipt.

Память: ОС может удваивать запрошенный размер под metadata; TCP autotuning растёт буферы по пути; лимиты контейнера считают kernel socket memory иначе, чем dashboard по heap. Вывод: буферы тратят память ради burst absorption или in-flight на высокой RTT; цена ниже V8.

Для request-response меньшие управляемые очереди иногда дают более ранний отказ и ограниченную tail latency; для streaming — наоборот.

## IPv4, IPv6 и dual-stack

```js
net.createServer().listen(3000, '::');
net.createServer().listen(3000, '0.0.0.0');
```

На многих системах первый listener на `::` покрывает и IPv4 wildcard — второй bind даёт `EADDRINUSE`. С `ipv6Only: true` слушатели могут сосуществовать.

Dual-stack — IPv6‑сокет принимает IPv4 через mapped addresses при bind на `::`, если не включён IPv6-only.

```js
server.listen({
    host: '::',
    port: 3000,
    ipv6Only: true,
});
```

Тогда `::` не bind'ит `0.0.0.0`; отдельный IPv4 listener на том же порту возможен, если ОС разрешает.

Без `host` Node слушает `::` при наличии IPv6, иначе `0.0.0.0` — сюрприз для кода, ожидающего только IPv4.

`127.0.0.1:3000` и `::1:3000` — разные endpoints.

UDP:

```js
const socket = dgram.createSocket({
    type: 'udp6',
    ipv6Only: true,
});

socket.bind(41234, '::');
```

Для отладки конфликтов семейства — числовые адреса, не `localhost`.

`EADDRNOTAVAIL` при отключённом IPv6 на хосте или в namespace контейнера.

Явный production bind:

```js
server.listen({
    host: process.env.HOST ?? '0.0.0.0',
    port: Number(process.env.PORT ?? 3000),
});
```

Для IPv6‑сервиса — явный `::` и осознанный `ipv6Only`.

На accepted socket логируйте `remoteAddress` и `remoteFamily` — строковое сравнение адресов ломается на mapped forms и zone ID.

Политика безопасности: `::` с dual-stack может принять и IPv4; `0.0.0.0` — все подходящие IPv4 интерфейсы. Firewall всё равно фильтрует, но bind должен отражать намерение.

## Выбор опций в Node

Сырой TCP‑сервер на старте: точный `host`, `port`, `backlog` при burst accept, `reusePort` только при намеренном OS‑распределении между процессами. Обычные перезапуски — дефолтный `SO_REUSEADDR` Node.

```js
const server = net.createServer(
    {
        noDelay: true,
        keepAlive: true,
        keepAliveInitialDelay: 60_000,
    },
    (socket) => attachProtocol(socket)
);

server.listen({ host: '0.0.0.0', port: 3000 });
```

Политика от peer — в `connection`:

```js
const server = net.createServer((socket) => {
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 60_000);
});
```

Для разработки — порт `0`:

```js
server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    console.log(port);
});
```

UDP multicast / несколько локальных consumers — осознанно `reuseAddr` vs `reusePort`:

```js
const socket = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true,
});
```

Latency‑чувствительный TCP — батчинг + `setNoDelay(true)`; измеряйте на реальном RTT.

Долгоживущие idle TCP — keep-alive, `setTimeout`, heartbeats протокола — три разных таймера.

Backlog повышайте с проверкой `somaxconn` на хосте.

Буферы — после профиля; UDP burst drops могут лечиться `SO_RCVBUF` ([UDP](./udp-dgram.md)).

`EADDRINUSE` / `EADDRNOTAVAIL` — до любого удалённого клиента. Успешный bind ≠ reachability извне.

Перезапуск: закрыть listener, учесть accepted sockets, policy process manager.

Типичный инициализатор соединения:

```js
function configureSocket(socket) {
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 60_000);
    socket.setTimeout(120_000);
}

const server = net.createServer((socket) => {
    configureSocket(socket);
    attachProtocol(socket);
});
```

При ревью разделяйте: `host`, `port`, `ipv6Only`, `reusePort`, `backlog` — listener; `setNoDelay`, `setKeepAlive`, `setTimeout` — connected socket; `recvBufferSize`/`sendBufferSize` — UDP storage.

Схема в голове:

```
bind options decide who can own an address
keep-alive decides idle TCP probing
Nagle decides small-write batching
backlog decides pending accept capacity
buffer sizes decide kernel byte storage
ipv6Only decides wildcard family coverage
```

Node даёт переключатель; ядро применяет; результат зависит от платформы, состояния сокета и пакетов, пока процесс занят.

## Связанное чтение

-   Предыдущая: [UDP и модуль dgram в Node.js](./udp-dgram.md)
-   Далее: [Путь запроса и клиентский процесс в Node.js](./request-path-client-process.md)
