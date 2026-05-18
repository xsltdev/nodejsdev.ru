---
description: UDP в Node.js — dgram, datagram, broadcast и multicast
---

# UDP и модуль dgram в Node.js

Источник: [theNodeBook — UDP & dgram](https://www.thenodebook.com/networking/udp-dgram)

Поддержка UDP в Node.js живёт в модуле `node:dgram`. Здесь разбираются границы датаграмм, привязка сокета, `send()`, событие `message`, broadcast, multicast, connected UDP и типичные пути ошибок. UDP‑сокет отправляет и принимает датаграммы: каждое сообщение сохраняет свою границу и не сливается в байтовый поток.

## UDP и dgram в Node.js

Успешная локальная отправка означает, что ядро приняло датаграмму к передаче. Доставка, порядок, дубликаты и обработка на удалённой стороне за пределами этого результата. Протоколы поверх UDP сами решают вопросы потерь, повторов, упорядочивания и таймаутов, если им это нужно.

UDP начинается с границ сообщений. Каждое событие приёма несёт полезную нагрузку одной датаграммы. У TCP чтение из потока следует отдельному контракту байтового потока.

Одна отправка — одна датаграмма. Если ядро доставило её сокету, Node эмитит одно событие `message` с этой нагрузкой и метаданными отправителя.

```js
import dgram from 'node:dgram';

const socket = dgram.createSocket('udp4');

socket.on('message', (msg, rinfo) => {
    console.log(msg.toString(), rinfo.address, rinfo.port);
});

socket.bind(41234, '127.0.0.1');
```

Запустите процесс и отправьте одну датаграмму:

```js
import dgram from 'node:dgram';

const socket = dgram.createSocket('udp4');
socket.send('ping', 41234, '127.0.0.1', (err) => {
    if (err) throw err;
    socket.close();
});
```

Приёмник увидит один `Buffer` с `ping`, адрес и порт отправителя в `rinfo`. API ориентирован на сообщения: событие `message` соответствует одной датаграмме, которую ядро передало сокету.

Вся тема сводится к этой форме «одно сообщение — одно событие».

UDP — транспортный протокол для отдельных датаграмм. Каждая несёт полезную нагрузку приложения и поля заголовка UDP: порты источника и назначения, длина, контрольная сумма. IP переносит датаграмму в пакете, используя адресацию и маршрутизацию из [раздела о TCP/IP и сетевом стеке](./tcpip-os-networking.md). Модуль `node:dgram` выставляет датаграммы настолько прямо, что транспортный контракт влияет на дизайн приложения.

TCP даёт Node подключённый байтовый поток. UDP даёт отдельные сообщения. Одна отправка создаёт одну UDP‑нагрузку. Одно чтение доставляет одну UDP‑нагрузку после прохождения фильтрации в ядре. В протоколе нет состояния соединения, упорядочивания, ACK и повторной передачи. Нужные свойства строят поверх UDP или берут готовый протокол.

Эта рамка важна: у UDP свой транспортный контракт, уже на границе сообщения, а не потока.

## Семантика датаграмм

Граница UDP‑сообщения — край вокруг одной полезной нагрузки. Если процесс отправил 12 байт одним `socket.send()`, приёмник получит эти 12 байт одним сообщением. Два вызова по 6 байт дадут два сообщения. Прибытие может задержаться, порядок может отличаться от порядка отправки, часть датаграмм может исчезнуть, дубликат может прийти повторно.

Граница сообщения сохраняется API UDP‑сокета. Это главное отличие от TCP, где границы записи и чтения в приложении не совпадают.

```js
socket.send('one', 41234, '127.0.0.1');
socket.send('two', 41234, '127.0.0.1');
```

Это две UDP‑датаграммы. Приёмник может увидеть `one` и `two`, `two` и `one`, только одну из них или ту же нагрузку дважды при дублировании в сети. На loopback обычно приходят обе по порядку — свойство тестового пути, а не контракт UDP.

**Потеря пакетов** — датаграмма не дошла до приложения‑приёмника: сброс на отправителе, локальный firewall, маршрутизатор, удалённый firewall, переполнение буфера приёма. UDP не восстанавливает пропуск на уровне протокола.

**Переупорядочивание** — датаграммы приходят не в порядке отправки из‑за маршрутизации, планирования, очередей интерфейсов. В UDP нет поля последовательности для сообщений приложения; переупорядочивание видно только если оно заложено в полезную нагрузку.

**Дублирование** — приёмник получает больше одной копии. Реже потерь, но часть контракта. Подавления дубликатов на транспорте нет; нужны идентификатор в нагрузке и окно «уже обработано».

Три слова задают тон любому UDP‑сервису: потеря, переупорядочивание, дублирование.

```js
const seen = new Set();

socket.on('message', (msg) => {
    const id = msg.subarray(0, 8).toString('hex');
    if (seen.has(id)) return;
    seen.add(id);
});
```

Фрагмент лишь иллюстрирует одно решение по дубликатам. Приёмнику нужны данные приложения для детекции; транспорт даёт датаграмму и адрес отправителя.

Заголовок UDP компактен: порты, длина, checksum. Длина покрывает заголовок и payload. Checksum позволяет отбросить повреждённые данные, когда проверка включена. В IPv4 checksum UDP может быть нулевым; в IPv6 для обычного UDP он обязателен. Node не показывает checksum в `message`: отклонённые датаграммы не доходят до JavaScript.

Невидимый сброс важен при отладке: обработчик видит только то, что ядро приняло для сокета. Захват пакетов может показывать трафик на интерфейсе, а Node молчит из‑за фильтрации, checksum, адреса или давления на буфер приёма.

Поле порта источника тоже локально значимо. Многие протоколы фиксируют порт сервера и берут эфемерный порт клиента. Сервер отвечает на адрес и порт из `rinfo`. Если клиент отправил одну датаграмму и сразу закрыл сокет, поздний ответ некуда доставить в этом процессе.

```js
socket.on('message', (msg, rinfo) => {
    console.log(
        `${rinfo.address}:${rinfo.port}`,
        msg.length
    );
});
```

Удалённый tuple — метаданные принятой датаграммы, не сессия. Новый порт источника — другой tuple. NAT переписывает порт — в `rinfo` будет то, что дошло до хоста.

Протоколы часто кладут тип сообщения в начало payload:

```js
socket.on('message', (msg) => {
    if (msg.length < 1) return;
    if (msg[0] === 1) handleHeartbeat(msg);
    if (msg[0] === 2) handleMeasurement(msg);
});
```

Сначала проверка длины. UDP легко принимает короткие, пустые или чужие по протоколу датаграммы на том же порту. Ядро проверяет транспорт; кадрирование приложения — ваша задача.

Размер — часть границы. Практический размер ограничен MTU пути (см. [TCP/IP и сетевой стек](./tcpip-os-networking.md)). Теоретический максимум может требовать фрагментации IP; потеря фрагмента — потеря всей UDP‑нагрузки с точки зрения приёмника.

Для обычного IPv4 UDP максимум payload — 65 507 байт (65 535 минус 20 байт IPv4 и 8 байт UDP). У IPv6 другая арифметика. Реальные приложения берут гораздо меньше из‑за Ethernet, туннелей, VPN и облачных оверлеев.

Node позволит попробовать большой send; ОС может отклонить:

```js
const payload = Buffer.alloc(70_000);

socket.send(payload, 41234, '127.0.0.1', (err) => {
    console.error(err?.code);
    socket.close();
});
```

На многих системах будет `EMSGSIZE`. Точный код зависит от семейства адресов, платформы, интерфейса и маршрута. Callback send сообщает о локальном завершении или локальной ошибке, не о приёме на удалённой стороне.

Локальные тесты обманывают: loopback терпит крупные датаграммы. Реальный путь может фрагментировать или отбрасывать. При UDP потеря одного фрагмента — потеря всего сообщения.

Многие production‑протоколы держат payload около 1 200 байт для неизвестных Internet‑путей — ориентир протокола, не правило Node. На LAN с известным MTU выбор другой. Правило Node проще: `socket.send()` принимает байты, путь решает, уместны ли они одной датаграммой.

## Поверхность `node:dgram`

`node:dgram` — встроенный UDP‑модуль Node: создание сокетов, отправка и приём, multicast и небольшой набор опций. API ниже уровня `node:http` и уже, чем `node:net`, потому что контракт UDP меньше.

```js
import dgram from 'node:dgram';

const udp4 = dgram.createSocket('udp4');
const udp6 = dgram.createSocket('udp6');
```

Тип задаёт семейство адресов: разбор адресов, wildcard‑bind, multicast, адрес по умолчанию для connected UDP.

`dgram.Socket` — объект JavaScript для UDP‑сокета. Наследует `EventEmitter` (`message`, `listening`, `error`, `close`; см. [EventEmitter](../async-patterns/eventemitter-internals.md)). Оборачивает нативное состояние: порт, очереди, фильтры, членство в multicast.

`dgram.createSocket()` принимает строку типа или объект опций:

```js
const socket = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true,
});
```

`reuseAddr` запрашивает повторное использование адреса — важно для multicast и некоторых сценариев перезапуска. Детали — в [главе об опциях сокетов](./socket-options-backlog.md); кратко: включайте осознанно, поведение платформы имеет краевые случаи.

В объекте опций также размеры буферов приёма/отправки и `ipv6Only` для `udp6`. Значения проходят через политику ОС: clamp, отказ, округление.

```js
const socket = dgram.createSocket({
    type: 'udp6',
    ipv6Only: true,
});
```

`ipv6Only` — граница семейства: IPv6‑сокет без dual‑stack может не принимать IPv4‑mapped адреса. При отладке UDP делайте семейство явным и используйте числовые адреса.

Датаграммный сокет сохраняет границы сообщений при чтении и записи. Один локальный порт может принимать от многих удалённых peers и отправлять на разные адреса. `bind()` выбирает локальный адрес и порт; `send()` — удалённый, если нет connected UDP.

Типичный жизненный цикл:

```
create socket
  -> bind local address and port
  -> receive message events
  -> send datagrams
  -> close
```

Нет `accept`. Один сокет принимает датаграммы от peers, прошедших фильтрацию ядра. Node сообщает peer через `rinfo`.

```js
socket.on('message', (msg, rinfo) => {
    console.log(rinfo);
});
```

`rinfo` — адрес, порт, семейство, размер. Порт источника часто эфемерный — адрес для ответа в echo‑протоколах.

`ref()` и `unref()` как у других handle: активный сокет может удерживать процесс. `unref()` позволяет выйти, если UDP — единственный активный handle. Удобно для телеметрии и discovery; на серверах легко выйти, пока сокет ещё привязан.

```js
const socket = dgram.createSocket('udp4');

socket.unref();
socket.bind(41234);
```

Событие `close` — handle закрыт. Объект в JS остаётся, нативный сокет ушёл; повторные send/bind падают проверками dgram. Новый срок жизни — новый сокет.

## Привязка и приём

`socket.bind()` привязывает сокет к локальному порту и, опционально, адресу. Привязанный сокет принимает датаграммы на этот локальный адрес. Это таблица сокетов ядра из [сетевого стека](./tcpip-os-networking.md), но состояние UDP, не TCP listen.

```js
const socket = dgram.createSocket('udp4');

socket.on('listening', () => {
    console.log(socket.address());
});

socket.bind(41234, '0.0.0.0');
```

`listening` — bind завершён; для UDP «слушать» значит готовность к приёму. Очереди accept и TCP‑handshake здесь нет.

Без адреса ОС привязывает wildcard для семейства. Без порта или с `0` — эфемерный порт.

```js
socket.bind(0, '127.0.0.1', () => {
    console.log(socket.address().port);
});
```

Удобно в тестах: стабильный локальный сокет без жёсткого порта. Порт занят процессом до `close()`.

Bind может упасть: `EADDRINUSE`, `EADDRNOTAVAIL`, `EACCES`. Асинхронные ошибки — событие `error`; неверные аргументы могут бросить синхронно.

Привязка к конкретному адресу сужает приём: `127.0.0.1` — только loopback; LAN‑адрес — этот интерфейс; `0.0.0.0` — подходящие локальные IPv4.

```js
socket.bind({ port: 41234, address: '127.0.0.1' });
```

Объектная форма читабельнее с `exclusive` и т.п. В обычном UDP позиционная и объектная формы ведут к одному bind; в cluster/shared handle — отдельная тема.

Один сокет — много peers без per‑peer setup:

```js
const peers = new Map();

socket.on('message', (msg, rinfo) => {
    const key = `${rinfo.address}:${rinfo.port}`;
    peers.set(key, Date.now());
});
```

Карта — состояние приложения. Ядро не создаёт сокет на peer. Тишина peer — не `close` от UDP; срок жизни записи решает код.

`rinfo.size` — размер в байтах; для парсинга предпочтительнее `msg.length`.

```js
socket.on('error', (err) => {
    console.error(err.code);
    socket.close();
});
```

Слушатель `error` — до bind в примерах и утилитах. Необработанный `error` может завершить процесс как у любого EventEmitter.

Главное событие приёма:

```js
socket.on('message', (msg, rinfo) => {
    socket.send(msg, rinfo.port, rinfo.address);
});
```

UDP echo: ответ на адрес и порт из входящей датаграммы. Новая датаграмма, не per‑client сокет.

`msg` — `Buffer` одной датаграммы. Текст — decode; бинарный протокол — parse. См. [буферы](../buffers/what-is-buffer.md): граница буфера — граница протокола.

```js
socket.on('message', (msg) => {
    const type = msg.readUInt8(0);
    const value = msg.readUInt32BE(1);
    console.log(type, value);
});
```

Доверяйте границе одной датаграммы, но проверяйте длину до чтения полей.

`socket.close()` закрывает сокет; callback — на `close`. In‑flight датаграммы могут ещё быть в сети или очередях, но закрытый сокет не эмитит новые `message`.

Парсинг: невалидный UTF‑8, короткий payload, чужой протокол на том же порту. Транспорт не ведёт переговоров о формате.

```js
socket.on('message', (msg) => {
    if (msg.length !== 6) return;
    const type = msg.readUInt16BE(0);
    const value = msg.readUInt32BE(2);
    handle(type, value);
});
```

Без проверки длины `readUInt32BE(2)` бросит в обработчике приёма.

Для текста после проверки типа и длины:

```js
socket.on('message', (msg) => {
    if (msg[0] !== 1) return;
    const name = msg.subarray(1).toString('utf8');
    handleName(name);
});
```

`subarray()` — view на ту же память. Для долгоживущего кэша — копия или распарсенные значения.

Пустые датаграммы допустимы:

```js
socket.on('message', (msg) => {
    if (msg.length === 0) handleEmptyProbe();
});
```

Discovery иногда шлёт пустые probe: сигнал в адресе/порте.

Валидация источника — логика приложения. `rinfo` — откуда пришло по пакету, не идентичность. NAT и spoofing решают доверие.

Один сокет — несколько peers, но обработчик на потоке JS. Медленный парсер задерживает всех. Очередь ядра не знает «важного» peer и дропает при переполнении.

Держите обработчик простым: длина, заголовок, тяжёлое — вне события. Считайте принятые/отклонённые/битые сообщения.

Поле версии окупается быстро:

```js
socket.on('message', (msg) => {
    if (msg.length < 2) return;
    if (msg[0] !== 1) return;
    dispatch(msg[1], msg.subarray(2));
});
```

UDP не даёт схему; несколько байт заголовка упрощают логи и совместимость при rolling deploy.

## Путь через Node и libuv

Ниже JavaScript‑объекта — нативный слой.

`dgram.createSocket('udp4')` создаёт `dgram.Socket`, EventEmitter, семейство и нативное состояние. В v24: JS → нативный UDP‑binding → `uv_udp_t` libuv → сокет ОС.

Handle libuv смотрит на event loop. Для UDP — `uv_udp_t` и `uv_udp_send_t` на отправку. V8 не принимает пакеты; колбэк в JS после libuv и ядра.

Bind:

```
dgram.Socket.bind()
  -> Node UDP binding
  -> libuv UDP handle
  -> OS UDP socket
  -> bind local address and port
```

После bind libuv регистрирует готовность к чтению (epoll, kqueue, IOCP — платформа разная, контракт Node один: есть данные → `message`).

Приём message‑oriented: ядро кладёт датаграммы в очередь с payload и адресом peer. Node копирует в `Buffer`, эмитит `message` с `rinfo`.

Backpressure потоков не действует: `dgram.Socket` — EventEmitter, не Readable. Долгий CPU в JS останавливает drain колбэков; очередь приёма переполняется — дроп без сигнала отправителю.

`getRecvBufferSize()` / `setRecvBufferSize()` — ниже Node, с лимитами ОС (подробнее в [опциях сокетов](./socket-options-backlog.md)): больший буфер сглаживает всплеск, не делает UDP надёжным.

Отправка:

```
socket.send(Buffer)
  -> validate target or connected peer
  -> optional DNS lookup for hostnames
  -> libuv UDP send request
  -> OS send path
  -> callback or error
```

Имя хоста — DNS ([раздел DNS](./dns-resolution.md)), задержка и ошибки lookup. Числовой адрес — быстрее.

Callback send — локальный запрос завершён; для переиспользуемых буферов не мутируйте payload до callback.

```js
const buf = Buffer.from('stats');

socket.send(buf, 41234, '127.0.0.1', (err) => {
    if (err) console.error(err.code);
});
```

Ошибки: DNS, семейство, размер, закрытый сокет. Не говорят, что peer обработал сообщение.

Буферизация отправки не как у TCP: нет окна приёма peer и `drain`. `getSendQueueSize()` / `getSendQueueCount()` в v24 — только локальная очередь send в Node/libuv.

Event loop связывает приём (`message`), завершение send (callback) и ошибки (`error`, throw). ICMP иногда приходит позже, особенно на connected UDP.

## Отправка датаграмм

`socket.send()` — одна UDP‑нагрузка. На неподключённом сокете: сообщение, порт, адрес.

```js
const socket = dgram.createSocket('udp4');

socket.send('hello', 41234, '127.0.0.1', (err) => {
    if (err) console.error(err.code);
    socket.close();
});
```

Сообщение: string, `Buffer`, `TypedArray`, `DataView` или массив chunks. Строки — UTF‑8; для лимитов размера удобнее бинарный `Buffer`.

Срез буфера:

```js
const buf = Buffer.from('xxpayloadxx');

socket.send(buf, 2, 7, 41234, '127.0.0.1', (err) => {
    if (err) console.error(err.code);
});
```

Отправится `payload`. offset/length — в байтах.

Не привязанный сокет может отправить: Node неявно bind на wildcard и эфемерный порт.

```js
const socket = dgram.createSocket('udp4');

socket.send('probe', 41234, '127.0.0.1', () => {
    console.log(socket.address());
    socket.close();
});
```

Удалённый peer увидит этот source port в `rinfo`. Для request‑response держите сокет открытым до ответа.

```js
const socket = dgram.createSocket('udp4');

socket.on('message', (msg) => {
    console.log('reply:', msg.toString());
    socket.close();
});

socket.send('hello', 41234, '127.0.0.1');
```

Соединения нет — просто живой локальный порт для ответа.

Имена хостов:

```js
socket.send('hello', 41234, 'localhost', (err) => {
    if (err) console.error(err.code);
});
```

`localhost` может резолвиться в IPv4/IPv6; `udp4` нужен IPv4‑адрес. Для отладки — числовые адреса.

Один локальный endpoint — много удалённых:

```js
for (const port of [41234, 41235, 41236]) {
    socket.send('tick', port, '127.0.0.1');
}
```

Каждый вызов — отдельная датаграмма. Корреляция запрос‑ответ — в payload или состоянии приложения.

Send атомарен на границе UDP API: одна нагрузка или ничего; Node не режет одно сообщение на два `message`. Фрагментация IP — ниже; при неудачной сборке датаграммы нет.

Массив буферов — один datagram:

```js
const header = Buffer.alloc(3);
header[0] = 2;
header.writeUInt16BE(payload.length, 1);

socket.send([header, payload], 41234, '127.0.0.1');
```

Считайте байты после кодирования:

```js
const text = 'snowman: \u2603';
const bytes = Buffer.byteLength(text);

socket.send(text, 41234, '127.0.0.1');
console.log(bytes);
```

Размер send — байты UTF‑8, не число code units.

Callback лучше не пропускать в инструментах и тестах:

```js
socket.send(payload, port, host, (err) => {
    if (err) console.error('udp send failed', err.code);
});
```

«Локально принято» ≠ «доставлено peer».

Быстрая отправка заполняет локальные очереди. `getSendQueueCount()` / `getSendQueueSize()` — pacing на стороне runtime.

Неявный bind скрывает локальный порт; для предсказуемых ответов — явный `bind()` и `listening` до send.

```js
socket.bind(0, '0.0.0.0', () => {
    socket.send('hello', 41234, '192.0.2.20');
});
```

## Connected UDP

Connected UDP хранит удалённый адрес и порт в ядре и фильтрует входящие датаграммы с других peers.

```js
const socket = dgram.createSocket('udp4');

socket.connect(41234, '127.0.0.1', () => {
    socket.send('ping');
});
```

Это не TCP‑handshake из [главы о TCP](./tcp-flow-failure.md): нет SYN и accept на другой стороне. Ядро запоминает удалённый endpoint; событие `connect` или callback.

После `connect()` `send()` без адреса; `remoteAddress()` — связанный peer.

```js
socket.on('connect', () => {
    console.log(socket.remoteAddress());
});
```

Удобно для одного peer: меньше аргументов, чужие датаграммы не доходят до JS (фильтр ядра, не аутентификация).

```js
socket.on('message', (msg, rinfo) => {
    console.log('from connected peer:', rinfo.port);
});
```

`disconnect()` снимает ассоциацию; после этого снова нужны явные target в `send()`:

```js
socket.disconnect();
socket.send('next', 41235, '127.0.0.1');
```

Повторный `disconnect()` на уже отключённом сокете — ошибка Node.

Connected UDP меняет видимость некоторых ошибок. ICMP Port Unreachable — advisory: хост получил трафик на закрытый UDP‑порт. Это не ответ UDP. На connected сокете Linux часто даёт `ECONNREFUSED`; за firewall — тишина. Callback send может завершиться до ICMP: успех send не означает «порт открыт», только «локальный send request завершён».

Оба send подряд на один peer без повторения адреса:

```js
socket.connect(41234, '127.0.0.1', () => {
    socket.send(Buffer.from([1]));
    socket.send(Buffer.from([2]));
});
```

```js
socket.bind(0, '127.0.0.1', () => {
    socket.connect(41234, '127.0.0.1');
});
```

Для смены peer — `disconnect()` или новый сокет.

## Unicast, broadcast и multicast

Unicast — один адрес назначения. Broadcast в IPv4 — `setBroadcast(true)` перед отправкой на broadcast‑адрес.

```js
const socket = dgram.createSocket('udp4');

socket.setBroadcast(true);
socket.send('who is there?', 41234, '255.255.255.255');
```

`255.255.255.255` — limited broadcast; directed broadcast зависит от префикса сети. Маршрутизаторы часто блокируют broadcast. `setBroadcast()` — поведение IPv4; у `udp6` multicast вместо broadcast.

Приём broadcast — обычный bind:

```js
const socket = dgram.createSocket('udp4');

socket.on('message', (msg, rinfo) => {
    console.log(msg.toString(), rinfo.address);
});

socket.bind(41234, '0.0.0.0');
```

Multicast — группа; приём через `addMembership`:

```js
const socket = dgram.createSocket({
    type: 'udp4',
    reuseAddr: true,
});

socket.on('message', (msg) => {
    console.log(msg.toString());
});

socket.bind(41234, () => {
    socket.addMembership('239.255.0.1');
});
```

`239.255.0.1` — administratively scoped IPv4. С интерфейсом:

```js
socket.bind(41234, () => {
    socket.addMembership('239.255.0.1', '192.168.1.25');
});
```

`dropMembership` и `setMulticastTTL(1)` ограничивают охват. `setMulticastLoopback(false)` — не получать свои multicast на том же хосте.

`reuseAddr` часто нужен, когда несколько процессов слушают один multicast‑порт ([опции сокетов](./socket-options-backlog.md)).

Группа и порт bind — разные измерения:

```js
socket.bind(9999, () => {
    socket.addMembership('239.255.0.1');
});
```

Это приём на порт `9999` для группы `239.255.0.1`. Отправитель на `41234` — другой UDP socket address.

Broadcast и multicast — механизмы локальной сети, не Internet. Контейнеры, VPC, Wi‑Fi isolation и VPN меняют доставку. Node выставляет опции; сеть решает reachability.

## Формы сбоев

Сбои UDP часто бесшумны.

Попытка TCP‑соединения может упасть на установке. Запись в TCP позже может упасть из‑за смены состояния. У UDP нет установки соединения. Неподключённый send на правдоподобный адрес может локально завершиться, пока датаграмма исчезает до любого приёмника.

Первое разделение при отладке — локальный сбой против удалённого отсутствия.

Локальные сбои возникают, пока Node или ОС обрабатывают операцию сокета. Неверные аргументы бросают исключение. Конфликт bind даёт ошибку. DNS может упасть до send. Слишком большая датаграмма — `EMSGSIZE`. Send после `close` — ошибка состояния dgram. Эти случаи видны, потому что происходят на локальном пути.

Удалённое отсутствие другое. Процесс слушает не тот порт. Firewall дропает UDP. NAT не держит mapping. Приёмник переполняет буфер. Промежуточное устройство теряет фрагмент. Callback send при этом может сообщить успех: ядро приняло датаграмму к передаче.

Третья категория — локальный успех с удалённой обратной связью ICMP. Port Unreachable говорит, что на UDP‑порт никто не слушает. Сообщение отдельно от исходной датаграммы, может прийти поздно, может отфильтроваться. Connected UDP даёт ядру более ясную ассоциацию сокета — ошибка чаще доходит до Node.

Классификация по месту появления упрощает логи:

```
argument or state error
  -> Node throws or calls back with error
bind/send kernel error
  -> error event or callback error
remote/path drop
  -> no Node event
ICMP feedback
  -> platform-dependent socket error
```

Отсутствие события — данные только после проверки локального пути. До этого тишина может означать bind не на тот адрес, другое семейство, иной DNS‑результат, превышение локального размера или завершённый процесс приёмника.

Минимальный локальный тест:

```js
socket.on('message', (msg, rinfo) => {
    console.log(msg.length, rinfo.address, rinfo.port);
});

socket.bind(41234, '127.0.0.1');
```

Loopback убирает маршрутизацию интерфейса, Wi‑Fi‑политику и удалённый firewall, но проверяет Node, libuv, bind и `message`. Затем реальный адрес интерфейса или wildcard и второй процесс на том же хосте, затем другой хост в сети.

Два процесса лучше одного «сервер+клиент» в одном event loop: общие переменные, ранний exit и скрытый порядок колбэков маскируют reply path.

Приёмник:

```js
const socket = dgram.createSocket('udp4');

socket.on('message', (msg, rinfo) => {
    console.log(msg.toString(), rinfo);
});

socket.bind(41234, '127.0.0.1');
```

Отправитель:

```js
const socket = dgram.createSocket('udp4');

socket.send('probe', 41234, '127.0.0.1', (err) => {
    if (err) console.error(err.code);
    socket.close();
});
```

Меняйте по одному параметру: только bind, только target host. Имя хоста смешивает DNS ([раздел DNS](./dns-resolution.md)); `127.0.0.1` и `::1` — разные семейства.

Второе разделение — приём против отправки.

Для приёма: `socket.address()`, конфликт порта (`ss -lunp` на Linux), capture на интерфейсе. Логируйте из `listening`, не предполагайте bind:

```js
socket.on('listening', () => {
    const { address, port, family } = socket.address();
    console.log({ address, port, family });
});
```

`127.0.0.1` не примет трафик на LAN‑адрес. IPv6‑сервер и IPv4‑клиент — несовместимы без dual‑stack.

Для send: destination, порт, локальный адрес после bind, ошибка callback. Крупные сообщения — сначала один байт:

```js
socket.send('x', 41234, '192.0.2.10', (err) => {
    console.error(err?.code ?? 'sent locally');
});
```

`sent locally` — локальный запрос завершён, не обработка на peer.

Для протокола — версия и тип в заголовке:

```js
const msg = Buffer.from([1, 3, 0, 0]);

socket.send(msg, 41234, '127.0.0.1');
```

Переполнение буфера приёма выглядит несправедливо: bind есть, малые тесты проходят, под burst сообщения исчезают. Очередь ядра заполнилась, пока JS был занят. UDP дропает лишнее без события в Node.

```js
socket.on('message', (msg) => {
    while (expensiveWork(msg)) break;
});
```

Тяжёлую работу — вне `message`. Больший `SO_RCVBUF` покупает время, не надёжность.

Давление на GC: объекты и JSON на каждый пакет отстают от сети; счётчики приложения занижают попытки. Сравнивайте счётчики отправителя, приёмника и UDP drop на хосте.

Старт и остановка: send до завершения bind; `close` освобождает порт, пока отправители ещё шлют. Нет handshake закрытия.

ICMP на unconnected UDP часто не связывается с конкретной операцией; на connected — чаще `ECONNREFUSED` после Port Unreachable на Linux:

```js
const socket = dgram.createSocket('udp4');

socket.on('error', (err) => console.error(err.code));
socket.connect(9, '127.0.0.1', () => {
    socket.send('test');
});
```

Broadcast требует `setBroadcast(true)`. Multicast — membership и интерфейс, часто `reuseAddr`. Docker, VM и облако режут broadcast/multicast при корректном коде.

Не трактуйте UDP как поток: несколько датаграмм на одну логическую запись требуют sequence, сборки и обработки дубликатов. Для метрик и discovery допустимы пропуски; для денег, инвентаря и ACL — нужны сильнее семантики, чем голый UDP.

Практический цикл:

```
verify bind address and port
  -> verify tiny numeric-address send
  -> verify local receive event
  -> verify interface and route
  -> verify firewall and network policy
```

`node:dgram` — чистая обёртка над датаграммными сокетами. Сложно помнить, как мало доказывает успешный UDP send.

## Связанное чтение

-   Предыдущая: [Сокеты и модуль `net` в Node.js](./sockets-net-module.md)
-   Далее: [Опции сокетов и backlog в Node.js](./socket-options-backlog.md)
