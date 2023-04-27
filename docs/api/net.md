---
title: Net
description: Модуль net предоставляет асинхронный сетевой API для создания потоковых TCP или IPC серверов и клиентов
---

# Net

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/net.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:net`** предоставляет асинхронный сетевой API для создания потоковых TCP или [IPC](#ipc-support) серверов ([`net.createServer()`](#netcreateserveroptions-connectionlistener)) и клиентов ([`net.createConnection()`](#netcreateconnection)).

Доступ к нему можно получить с помощью:

<!-- 0001.part.md -->

```js
const net = require('node:net');
```

<!-- 0002.part.md -->

## Поддержка IPC

Модуль `node:net` поддерживает IPC с помощью именованных труб в Windows и доменных сокетов Unix в других операционных системах.

### Определение путей для IPC-соединений

[`net.connect()`](#netconnect), [`net.createConnection()`](#netcreateconnection), [`server.listen()`](#serverlisten) и [`socket.connect()`](#socketconnect) принимают параметр `path` для определения конечных точек IPC.

В Unix локальный домен также известен как домен Unix. Путь - это имя пути файловой системы. Он усекается до зависящей от ОС длины `sizeof(sockaddr_un.sun_path) - 1`. Типичные значения - 107 байт в Linux и 103 байта в macOS. Если абстракция API Node.js создает сокет домена Unix, она также развязывает сокет домена Unix. Например, [`net.createServer()`](#netcreateserveroptions-connectionlistener) может создать сокет домена Unix, а [`server.close()`](#serverclosecallback) отсоединит его. Но если пользователь создает сокет домена Unix вне этих абстракций, ему придется удалить его. То же самое относится к случаям, когда API Node.js создает сокет домена Unix, но затем программа аварийно завершается. Короче говоря, сокет домена Unix будет виден в файловой системе и будет существовать до тех пор, пока не будет удален.

В Windows локальный домен реализуется с помощью именованной трубы. Путь _должен_ ссылаться на запись в `\?\pipe\` или `\.\pipe\`. Допускаются любые символы, но последний может выполнять некоторую обработку имен труб, например, разрешать последовательности `...`. Несмотря на то, как это может выглядеть, пространство имен труб является плоским. Трубы _не сохраняются_. Они удаляются, когда закрывается последняя ссылка на них. В отличие от доменных сокетов Unix, Windows закроет и удалит трубу при завершении процесса-владельца.

Экранирование строк JavaScript требует указания путей с дополнительным экранированием обратной косой чертой, например:

<!-- 0003.part.md -->

```js
net.createServer().listen(
    path.join('\\\\?\\pipe', process.cwd(), 'myctl')
);
```

<!-- 0004.part.md -->

## Класс: `net.BlockList`.

Объект `BlockList` можно использовать с некоторыми сетевыми API для задания правил запрета входящего или исходящего доступа к определенным IP-адресам, диапазонам IP-адресов или IP-подсетям.

### `blockList.addAddress(address[, type])`.

-   `address` {string|net.SocketAddress} Адрес IPv4 или IPv6.
-   `type` {string} Либо `'ipv4'`, либо `'ipv6'`. **По умолчанию:** `'ipv4'`.

Добавляет правило для блокировки заданного IP-адреса.

### `blockList.addRange(start, end[, type])`.

-   `start` {string|net.SocketAddress} Начальный IPv4 или IPv6 адрес в диапазоне.
-   `end` {string|net.SocketAddress} Конечный IPv4 или IPv6 адрес в диапазоне.
-   `type` {string} Либо `'ipv4'`, либо `'ipv6'`. **По умолчанию:** `'ipv4'`.

Добавляет правило для блокирования диапазона IP-адресов от `start` (включительно) до `end` (включительно).

### `blockList.addSubnet(net, prefix[, type])`.

-   `net` {string|net.SocketAddress} IPv4 или IPv6 адрес сети.
-   `prefix` {number} Количество битов префикса CIDR. Для IPv4 это должно быть значение от `0` до `32`. Для IPv6 это значение должно быть от `0` до `128`.
-   `type` {string} Либо `IPv4`, либо `IPv6`. **По умолчанию:** `'ipv4'`.

Добавляет правило для блокирования диапазона IP-адресов, указанных в виде маски подсети.

### `blockList.check(address[, type])`.

-   `address` {string|net.SocketAddress} IP-адрес для проверки
-   `type` {string} Либо `'ipv4'`, либо `'ipv6'`. **По умолчанию:** `'ipv4'`.
-   Возвращает: {boolean}

Возвращает `true`, если данный IP-адрес соответствует любому из правил, добавленных в `BlockList`.

<!-- 0005.part.md -->

```js
const blockList = new net.BlockList();
blockList.addAddress('123.123.123.123');
blockList.addRange('10.0.0.1', '10.0.0.10');
blockList.addSubnet('8592:757c:efae:4e45::', 64, 'ipv6');

console.log(blockList.check('123.123.123.123')); // Prints: true
console.log(blockList.check('10.0.0.3')); // Prints: true
console.log(blockList.check('222.111.111.222')); // Prints: false

// IPv6 notation for IPv4 addresses works:
console.log(blockList.check('::ffff:7b7b:7b7b', 'ipv6')); // Prints: true
console.log(
    blockList.check('::ffff:123.123.123.123', 'ipv6')
); // Prints: true
```

<!-- 0006.part.md -->

### `blockList.rules`

-   Тип: {string\[\]}

Список правил, добавленных в блок-лист.

## Класс: `net.SocketAddress`

### `new net.SocketAddress([options])`

-   `options` {Object}
    -   `address` {string} Сетевой адрес в виде строки IPv4 или IPv6. **По умолчанию**: `'127.0.0.1'`, если `family` - `'ipv4'`; `'::'`, если `family` - `'ipv6'`.
    -   `family` {string} Одно из `'ipv4'` или `'ipv6'`. **По умолчанию**: `'ipv4'`.
    -   `flowlabel` {number} Метка потока IPv6, используемая только если `family` - `'ipv6'`.
    -   `port` {number} IP-порт.

### `socketaddress.address`.

-   Тип {строка}

### `socketaddress.family`.

-   Тип {строка} Либо `IPv4`, либо `IPv6`.

### `socketaddress.flowlabel`.

-   Тип {число}

### `socketaddress.port`.

-   Тип {число}

## Класс: `net.Server`

-   Расширяет: {EventEmitter}

Этот класс используется для создания TCP или [IPC](#ipc-support) сервера.

### `new net.Server([options][, connectionListener])`.

-   `options` {Object} См. [`net.createServer([options][, connectionListener])`](#netcreateserveroptions-connectionlistener).
-   `connectionListener` {Функция} Автоматически устанавливается в качестве слушателя для события [`'соединение'`](#event-connection).
-   Возвращает: {net.Server}

`net.Server` является [`EventEmitter`](events.md#class-eventemitter) со следующими событиями:

### Событие: `закрытие`.

Выдается при закрытии сервера. Если существуют соединения, то это событие не испускается, пока все соединения не будут завершены.

### Событие: `'connection'`

-   {net.Socket} Объект соединения

Выдается, когда создается новое соединение. `socket` является экземпляром `net.Socket`.

### Событие: `ошибка`.

-   {Error}

Выдается при возникновении ошибки. В отличие от [`net.Socket`](#class-netsocket), событие [`'close'`](#event-close) **не** будет испущено непосредственно после этого события, если только [`server.close()`](#serverclosecallback) не будет вызван вручную. См. пример обсуждения [`server.listen()`](#serverlisten).

### Событие: `прослушивание`.

Выдается, когда сервер был связан после вызова [`server.listen()`](#serverlisten).

### Событие: `'drop'`.

Когда количество соединений достигает порогового значения `server.maxConnections, сервер прекращает новые соединения и вместо этого выдает событие `'drop'`. Если это TCP-сервер, то аргумент имеет следующий вид, в противном случае аргумент `не определен`.

-   `data` {Object} Аргумент, передаваемый слушателю события.
    -   `localAddress` {string} Локальный адрес.
    -   `localPort` {number} Локальный порт.
    -   `localFamily` {string} Локальное семейство.
    -   `remoteAddress` {строка} Удаленный адрес.
    -   `remotePort` {number} Удаленный порт.
    -   `remoteFamily` {string} Семейство удаленных IP-адресов. `IPv4` или `IPv6`.

### `server.address()`.

-   Возвращает: {Object|string|null}

Возвращает связанный `адрес`, имя `семейства адресов` и `порт` сервера, как сообщает операционная система, если он прослушивает IP-сокет (полезно, чтобы узнать, какой порт был назначен при получении адреса, назначенного ОС): `{ port: 12346, семейство: 'IPv4', адрес: '127.0.

<!-- 0007.part.md -->

Для сервера, слушающего на сокете pipe или Unix domain, имя возвращается в виде строки.

<!-- 0008.part.md -->

```js
const server = net
    .createServer((socket) => {
        socket.end('goodbye\n');
    })
    .on('error', (err) => {
        // Handle errors here.
        throw err;
    });

// Grab an arbitrary unused port.
server.listen(() => {
    console.log('opened server on', server.address());
});
```

<!-- 0009.part.md -->

`server.address()` возвращает `null` до возникновения события `'listening'` или после вызова `server.close()`.

### `server.close([callback])`.

-   `callback` {Функция} Вызывается при закрытии сервера.
-   Возвращает: {net.Server}

Останавливает сервер от приема новых соединений и сохраняет существующие соединения. Эта функция асинхронна, сервер окончательно закрывается, когда все соединения завершены и сервер испускает событие [`'close'`](#event-close). Необязательный `callback` будет вызван, как только произойдет событие `'close'`. В отличие от этого события, он будет вызван с `Error` в качестве единственного аргумента, если сервер не был открыт в момент закрытия.

### `server.getConnections(callback)`.

-   `callback` {Функция}
-   Возвращает: {net.Server}

Асинхронно получает количество одновременных соединений на сервере. Работает, если сокеты были отправлены на форки.

Callback должен принимать два аргумента `err` и `count`.

### `server.listen()`.

Запуск сервера, прослушивающего соединения. Сервер `net.Server` может быть TCP или [IPC](#ipc-support) сервером, в зависимости от того, что он слушает.

Возможные сигнатуры:

-   [`server.listen(handle[, backlog][, callback])`](#serverlistenhandle-backlog-callback)
-   [`server.listen(options[, callback])`](#serverlistenoptions-callback)
-   [`server.listen(path[, backlog][, callback])`](#serverlistenpath-backlog-callback) для серверов [IPC](#ipc-support)
-   [`server.listen([port[, host[, backlog]]][, callback])`](#serverlistenport-host-backlog-callback) для TCP серверов

Эта функция является асинхронной. Когда сервер начинает прослушивать, будет выдано событие [`'listening'`](#event-listening). Последний параметр `callback` будет добавлен в качестве слушателя для события [`'listening'`](#event-listening).

Все методы `listen()` могут принимать параметр `backlog` для указания максимальной длины очереди ожидающих соединений. Фактическая длина будет определяться ОС через настройки sysctl, такие как `tcp_max_syn_backlog` и `somaxconn` в Linux. По умолчанию значение этого параметра равно 511 (не 512).

Для всех [`net.Socket`](#class-netsocket) установлено значение `SO_REUSEADDR` (подробности см. в [`socket(7)`](https://man7.org/linux/man-pages/man7/socket.7.html)).

Метод `server.listen()` может быть вызван повторно тогда и только тогда, когда во время первого вызова `server.listen()` произошла ошибка или был вызван `server.close()`. В противном случае будет выдана ошибка `ERR_SERVER_ALREADY_LISTEN`.

Одна из наиболее распространенных ошибок, возникающих при прослушивании, - `EADDRINUSE`. Это происходит, когда другой сервер уже прослушивает запрошенный `port`/`path`/`handle`. Одним из способов решения этой проблемы может быть повторная попытка через определенное время:

<!-- 0010.part.md -->

```js
server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(PORT, HOST);
        }, 1000);
    }
});
```

<!-- 0011.part.md -->

#### `server.listen(handle[, backlog][, callback])`.

-   `handle` {Object}
-   `backlog` {число} Общий параметр функций [`server.listen()`](#serverlisten)
-   `callback` {Функция}
-   Возвращает: {net.Server}

Запускает сервер, прослушивающий соединения на заданном `handle`, который уже был привязан к порту, доменному сокету Unix или именованной трубе Windows.

Объект `handle` может быть либо сервером, либо сокетом (все, что имеет член `_handle`), либо объектом с членом `fd`, который является действительным файловым дескриптором.

Прослушивание файлового дескриптора не поддерживается в Windows.

#### `server.listen(options[, callback])`.

-   `options` {Object} Требуется. Поддерживает следующие свойства:
    -   `port` {number}
    -   `host` {string}
    -   `path` {строка} Будет игнорироваться, если указан `port`. Смотрите [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
    -   `backlog` {number} Общий параметр функций [`server.listen()`](#serverlisten).
    -   `exclusive` {boolean} **По умолчанию:** `false`.
    -   `readableAll` {boolean} Для IPC-серверов делает трубу доступной для чтения всем пользователям. **По умолчанию:** `false`.
    -   `writableAll` {boolean} Для IPC-серверов делает трубу доступной для записи для всех пользователей. **По умолчанию:** `false`.
    -   `ipv6Only` {boolean} Для TCP-серверов установка `ipv6Only` в `true` отключает поддержку двойного стека, т.е. привязка к хосту `::` не позволит привязать `0.0.0.0`. **По умолчанию:** `false`.
    -   `signal` {AbortSignal} AbortSignal, который может быть использован для закрытия прослушивающего сервера.
-   `callback` {Function} Функции.
-   Возвращает: {net.Server}

Если указан `port`, он ведет себя так же, как [`server.listen([port[, host[, backlog]]][, callback])`](#serverlistenport-host-backlog-callback). В противном случае, если указан `path`, поведение будет таким же, как [`server.listen(path[, backlog][, callback])`](#serverlistenpath-backlog-callback). Если ни один из них не указан, будет выдана ошибка.

Если `exclusive` имеет значение `false` (по умолчанию), то рабочие кластера будут использовать один и тот же базовый хэндл, что позволит разделить обязанности по обработке соединений. Когда `exclusive` имеет значение `true`, хэндл не разделяется, и попытка разделения портов приводит к ошибке. Ниже показан пример, который прослушивает эксклюзивный порт.

<!-- 0012.part.md -->

```js
server.listen({
    host: 'localhost',
    port: 80,
    exclusive: true,
});
```

<!-- 0013.part.md -->

Когда `exclusive` имеет значение `true` и базовый хэндл является общим, возможно, что несколько рабочих запрашивают хэндл с разными бэклогами. В этом случае будет использоваться первый `backlog`, переданный главному процессу.

Запуск IPC-сервера от имени root может привести к тому, что путь к серверу будет недоступен для непривилегированных пользователей. Использование `readableAll` и `writableAll` сделает сервер доступным для всех пользователей.

Если включена опция `signal, вызов `.abort()`на соответствующем`AbortController`аналогичен вызову`.close()` на сервере:

<!-- 0014.part.md -->

```js
const controller = new AbortController();
server.listen({
    host: 'localhost',
    port: 80,
    signal: controller.signal,
});
// Later, when you want to close the server.
controller.abort();
```

<!-- 0015.part.md -->

#### `server.listen(path[, backlog][, callback])`.

-   `path` {string} Путь, который должен прослушивать сервер. См. [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
-   `backlog` {number} Общий параметр функций [`server.listen()`](#serverlisten).
-   `callback` {функция}.
-   Возвращает: {net.Server}.

Запускает [IPC](#ipc-support) сервер, прослушивающий соединения по заданному `пути`.

#### `server.listen([port[, host[, backlog]]][, callback])`.

-   `порт` {число}
-   `host` {строка}
-   `backlog` {число} Общий параметр функций [`server.listen()`](#serverlisten).
-   `callback` {Функция}.
-   Возвращает: {net.Server}.

Запускает TCP-сервер, прослушивающий соединения на заданных `port` и `host`.

Если `port` опущен или равен 0, операционная система назначит произвольный неиспользуемый порт, который можно получить с помощью `server.address().port` после возникновения события [`'listening'`](#event-listening).

Если `host` опущен, сервер будет принимать соединения по [неуказанному IPv6 адресу](https://en.wikipedia.org/wiki/IPv6_address#Unspecified_address) (`::`), если IPv6 доступен, или по [неуказанному IPv4 адресу](https://en.wikipedia.org/wiki/0.0.0.0) (`0.0.0.0`) в противном случае.

В большинстве операционных систем прослушивание [неуказанного адреса IPv6](https://en.wikipedia.org/wiki/IPv6_address#Unspecified_address) (`::`) может заставить `net.Server` также прослушивать [неуказанный адрес IPv4](https://en.wikipedia.org/wiki/0.0.0.0) (`0.0.0.0`).

### `server.listening`

-   {boolean} Указывает, прослушивает ли сервер соединения.

### `server.maxConnections`

-   {integer}

Установите это свойство, чтобы отклонять соединения, когда количество соединений на сервере становится большим.

Не рекомендуется использовать эту опцию после того, как сокет был отправлен дочернему процессу с помощью [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options).

### `server.ref()`.

-   Возвращает: {net.Server}.

Противоположность `unref()`, вызов `ref()` на ранее `unref`ed сервере _не_ позволит программе выйти, если это единственный оставшийся сервер (поведение по умолчанию). Если сервер `ref`отрефлектирован`` , повторный вызов `ref() `` не будет иметь никакого эффекта.

### `server.unref()`

-   Возвращает: {net.Server}.

Вызов `unref()` на сервере позволит программе выйти, если это единственный активный сервер в системе событий. Если сервер уже `unref`, то повторный вызов `unref()` не будет иметь никакого эффекта.

## Класс: `net.Socket`.

-   Расширяет: {stream.Duplex}

Этот класс является абстракцией TCP сокета или конечной точки потокового [IPC](#ipc-support) (использует именованные трубы в Windows, и доменные сокеты Unix в противном случае). Он также является [`EventEmitter`](events.md#class-eventemitter).

Сокет `net.Socket` может быть создан пользователем и использоваться непосредственно для взаимодействия с сервером. Например, его возвращает [`net.createConnection()`](#netcreateconnection), поэтому пользователь может использовать его для общения с сервером.

Он также может быть создан Node.js и передан пользователю, когда соединение r

<!-- 0016.part.md -->

### `new net.Socket([options])`.

-   `options` {Object} Доступные опции:
    -   `fd` {число} Если указано, обернуть вокруг существующего сокета с заданным дескриптором файла, иначе будет создан новый сокет.
    -   `allowHalfOpen` {boolean} Если установлено значение `false`, то сокет будет автоматически завершать доступную для записи сторону при завершении доступной для чтения стороны. Подробности смотрите в [`net.createServer()`](#netcreateserveroptions-connectionlistener) и в событии [`'end'`](#event-end). **По умолчанию:** `false`.
    -   `readable` {boolean} Разрешить чтение на сокете, если передан `fd`, в противном случае игнорируется. **По умолчанию:** `false`.
    -   `writable` {boolean} Разрешить запись на сокет при передаче `fd`, в противном случае игнорируется. **По умолчанию:** `false`.
    -   `signal` {AbortSignal} Сигнал прерывания, который может быть использован для уничтожения сокета.
-   Возвращает: {net.Socket}

Создает новый объект сокета.

Созданный сокет может быть либо TCP сокетом, либо потоковой [IPC](#ipc-support) конечной точкой, в зависимости от того, к чему он [`connect()`](#socketconnect).

### Событие: `закрытие`

-   `hadError` {boolean} `true`, если в сокете произошла ошибка передачи.

Выдается после полного закрытия сокета. Аргумент `hadError` - это булево значение, которое говорит, был ли сокет закрыт из-за ошибки передачи.

### Событие: `'connect``.

Выдается при успешном установлении сокетного соединения. См. [`net.createConnection()`](#netcreateconnection).

### Событие: `'data'`

-   {Buffer|string}

Выдается при получении данных. Аргументом `data` будет `буфер` или `строка`. Кодировка данных задается [`socket.setEncoding()`](#socketsetencodingencoding).

Данные будут потеряны, если нет слушателя, когда `Socket` испускает событие `'data'`.

### Событие: `'drain'``.

Испускается, когда буфер записи становится пустым. Может использоваться для дросселирования загрузки.

См. также: возвращаемые значения `socket.write()`.

### Событие: `конец`.

Вызывается, когда другой конец сокета сигнализирует об окончании передачи данных, тем самым завершая доступную для чтения сторону сокета.

По умолчанию (`allowHalfOpen` - `false`) сокет посылает обратно пакет об окончании передачи и уничтожает свой файловый дескриптор после того, как выпишет очередь ожидающих записи. Однако, если `allowHalfOpen` установлен в `true`, сокет не будет автоматически [`end()`](#socketenddata-encoding-callback) свою записываемую сторону, позволяя пользователю записывать произвольные объемы данных. Пользователь должен явно вызвать [`end()`](#socketenddata-encoding-callback), чтобы закрыть соединение (т.е. отправить обратно FIN-пакет).

### Событие: `ошибка`.

-   {Error}

Выдается при возникновении ошибки. Событие `'close'` будет вызвано непосредственно после этого события.

### Событие: `'lookup'`

Вызывается после разрешения имени хоста, но перед подключением. Не применимо к сокетам Unix.

-   `err` {Error|null} Объект ошибки. См. [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
-   `address` {string} IP-адрес.
-   `family` {number|null} Тип адреса. См. [`dns.lookup()`](dns.md#dnslookuphostname-optio

<!-- 0017.part.md -->

-   `host` {string} Имя хоста.

### Событие: `готово`.

Возникает, когда сокет готов к использованию.

Срабатывает сразу после `'connect'`.

### Событие: `'timeout'`.

Испускается, если сокет завершает работу от бездействия. Это только уведомление о том, что сокет простаивал. Пользователь должен вручную закрыть соединение.

См. также: [`socket.setTimeout()`](#socketsettimeouttimeout-callback).

### `socket.address()`.

-   Возвращает: {Object}

Возвращает связанный `адрес`, имя `семейства` адресов и `порт` сокета, как сообщает операционная система: `{ port: 12346, семейство: 'IPv4', адрес: '127.0.0.1' }`

### `socket.autoSelectFamilyAttemptedAddresses

-   {string\[\]}

Это свойство присутствует, только если алгоритм автовыбора семьи включен в [`socket.connect(options)`](#socketconnectoptions-connectlistener) и представляет собой массив адресов, которые были опробованы.

Каждый адрес представляет собой строку в виде `$IP:$PORT`. Если соединение было успешным, то последним адресом будет тот, к которому в данный момент подключен сокет.

### `socket.bufferSize`.

> Стабильность: 0 - Утратил силу: Вместо этого используйте [`writable.writableLength`](stream.md#writablewritablelength).

-   {integer}

Это свойство показывает количество символов, буферизованных для записи. Буфер может содержать строки, длина которых после кодирования еще не известна. Поэтому это число является лишь приблизительным значением количества байт в буфере.

У `net.Socket` есть свойство, что `socket.write()` всегда работает. Это сделано для того, чтобы помочь пользователям быстро приступить к работе. Компьютер не всегда успевает за объемом данных, которые записываются в сокет. Просто сетевое соединение может быть слишком медленным. Node.js будет внутренне буферизировать данные, записанные в сокет, и отправлять их по проводу, когда это будет возможно.

Следствием этой внутренней буферизации является то, что память может увеличиваться. Пользователи, которые сталкиваются с большим или растущим `bufferSize`, должны попытаться "дросселировать" потоки данных в своей программе с помощью [`socket.pause()`](#socketpause) и [`socket.resume()`](#socketresume).

### `socket.bytesRead`

-   {целое число}

Количество полученных байтов.

### `socket.bytesWritten`.

-   {integer}

Количество отправленных байтов.

### `socket.connect()`.

Инициирует соединение на заданном сокете.

Возможные сигнатуры:

-   [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener)
-   [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener) для [IPC](#ipc-support) соединений.
-   [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener) для TCP-соединений.
-   Возвращает: {net.Socket} Сам сокет.

Эта функция является асинхронной. Когда соединение установлено, будет выдано событие [`'connect'`](#event-connect). При возникновении проблем с подключением вместо события [`'connect'`](#event-connect) будет выдано событие [`'error'`](#event-error_1) с передачей ошибки слушателю [`'error'`](#event-error_1). Последний параметр `conn

<!-- 0018.part.md -->

Эта функция должна использоваться только для повторного подключения сокета после того, как было выполнено `закрытие`, иначе это может привести к неопределенному поведению.

#### `socket.connect(options[, connectListener])`.

-   `options` {Object}
-   `connectListener` {Функция} Общий параметр методов [`socket.connect()`](#socketconnect). Будет добавлен в качестве слушателя для события [`'connect'`](#event-connect) один раз.
-   Возвращает: {net.Socket} Сам сокет.

Инициирует соединение на заданном сокете. Обычно этот метод не нужен, сокет должен быть создан и открыт с помощью [`net.createConnection()`](#netcreateconnection). Используйте этот метод только при реализации пользовательского Socket.

Для TCP-соединений доступны следующие `опции`:

-   `port` {number} Требуется. Порт, к которому должен подключиться сокет.
-   `host` {string} Хост, к которому должен подключаться сокет. **По умолчанию:** `'localhost'`.
-   `localAddress` {string} Локальный адрес, с которого должен подключаться сокет.
-   `localPort` {number} Локальный порт, с которого должен подключаться сокет.
-   `family` {число}: Версия стека IP. Должна быть `4`, `6` или `0`. Значение `0` указывает, что разрешены как IPv4, так и IPv6 адреса. **По умолчанию:** `0`.
-   `hints` {number} Необязательные [`dns.lookup()` hints](dns.md#supported-getaddrinfo-flags).
-   `lookup` {Функция} Пользовательская функция поиска. **По умолчанию:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
-   `noDelay` {boolean} Если установлено значение `true`, это отключает использование алгоритма Нагла сразу после установления сокета. **По умолчанию:** `false`.
-   `keepAlive` {boolean} Если установлено значение `true`, это включает функцию keep-alive на сокете сразу после установления соединения, аналогично тому, как это делается в [`socket.setKeepAlive([enable][, initialDelay])`](#socketsetkeepaliveenable-initialdelay). **По умолчанию:** `false`.
-   `keepAliveInitialDelay` {number} Если задано положительное число, оно устанавливает начальную задержку перед отправкой первого зонда keepalive на незанятый сокет.**Умолчанию:** `0`.
-   `autoSelectFamily` {boolean}: Если установлено значение `true`, это включает алгоритм автоматического определения семейства, который слабо реализует секцию 5 из [RFC 8305] (https://www.rfc-editor.org/rfc/rfc8305.txt). Опция `all`, передаваемая в lookup, имеет значение `true`, и сокеты пытаются соединиться со всеми полученными адресами IPv6 и IPv4, последовательно, пока не будет установлено соединение. Первым пробует подключиться первый полученный AAAA-адрес, затем первый полученный A-адрес, затем второй полученный AAAA-адрес и так далее. Каждой попытке соединения дается время, заданное параметром `autoSelectFamilyAttemptTimeout`, прежде чем произойдет тайминг и попытка установить соединение со следующим адресом. Игнорируется, если опция `family` не равна `0` или если установлен `localAddress`. Ошибки соединения не выдаются, если хотя бы одно соединение успешно. **По умолчанию:** изначально `false`, но может быть изменен во время выполнения с помощью [`net.setDefaultAutoSelectFamily(value)`](#netsetdefaultautoselectfamilyvalue) или с помощью опции командной строки `--enable-network-family-autoselection`.
-   `auto

<!-- 0019.part.md -->

Для [IPC](#ipc-support) соединений, доступными `опциями` являются:

-   `path` {строка} Требуется. Путь, к которому должен подключиться клиент. См. раздел [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections). Если указано, то вышеприведенные опции, специфичные для TCP, игнорируются.

Для обоих типов доступные `опции` включают:

-   `onread` {Object} Если указано, входящие данные хранятся в одном `буфере` и передаются в указанный `обратный вызов`, когда данные поступают на сокет. Это приведет к тому, что функциональность потоковой передачи не будет предоставлять никаких данных. Сокет будет выдавать события типа `ошибка`, `конец` и `закрытие` как обычно. Такие методы, как `pause()` и `resume()`, также будут вести себя так, как ожидается.
    -   `buffer` {Buffer|Uint8Array|Function} Либо многократно используемый кусок памяти для хранения входящих данных, либо функция, которая их возвращает.
    -   `callback` {Function} Эта функция вызывается для каждого куска входящих данных. Ей передаются два аргумента: количество байт, записанных в `buffer`, и ссылка на `buffer`. Возврат `false` из этой функции позволяет неявно `pause()` сокета. Эта функция будет выполняться в глобальном контексте.

Ниже приведен пример клиента, использующего опцию `onread`:

<!-- 0020.part.md -->

```js
const net = require('node:net');
net.connect({
    port: 80,
    onread: {
        // Reuses a 4KiB Buffer for every read from the socket.
        buffer: Buffer.alloc(4 * 1024),
        callback: function (nread, buf) {
            // Received data is available in `buf` from 0 to `nread`.
            console.log(buf.toString('utf8', 0, nread));
        },
    },
});
```

<!-- 0021.part.md -->

#### `socket.connect(path[, connectListener])`.

-   `path` {string} Путь, к которому должен подключиться клиент. См. [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
-   `connectListener` {Функция} Общий параметр методов [`socket.connect()`](#socketconnect). Будет добавлен в качестве слушателя для события [`'connect'`](#event-connect) один раз.
-   Возвращает: {net.Socket} Сам сокет.

Инициирует [IPC](#ipc-support) соединение на данном сокете.

Псевдоним для [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener), вызываемого с `{путь: path }` в качестве `options`.

#### `socket.connect(port[, host][, connectListener])`.

-   `port` {number} Порт, к которому должен подключиться клиент.
-   `host` {string} Хост, к которому должен подключиться клиент.
-   `connectListener` {функция} Общий параметр методов [`socket.connect()`](#socketconnect). Будет добавлен в качестве слушателя для события [`'connect'`](#event-connect) один раз.
-   Возвращает: {net.Socket} Сам сокет.

Инициирует TCP-соединение на указанном сокете.

Псевдоним для [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener), вызываемого с `{port: port, host: host}` в качестве `options`.

### `socket.connecting`

-   {boolean}

Если `true`, то [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) был вызван и еще не завершился. Это значение будет оставаться `true` до тех пор, пока сокет не станет подключенным, затем оно будет установлено в `false` и будет вызвано событие `'connect'`. Обратите внимание, что обратный вызов [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) является слушателем события `'connect'`.

### `socket.destroy([error])`.

-   `error` {Object}
-   Возвращает: {net.Socket}

Убеждается, что на этом сокете больше не происходит никаких операций ввода-вывода. Уничтожает поток и закрывает соединение.

Подробности смотрите в [`writable.destroy()`](stream.md#writabledestroyerror).

### `socket.destroyed`

-   {boolean} Указывает, уничтожено ли соединение или нет. После уничтожения соединения никакие данные больше не могут быть переданы с его помощью.

Подробности смотрите в [`writable.destroyed`](stream.md#writabledestroyed).

### `socket.destroySoon()`.

Уничтожает сокет после записи всех данных. Если событие `'finish'' уже было вызвано, сокет уничтожается немедленно. Если сокет все еще доступен для записи, то неявно вызывается `socket.end()`.

### `socket.end([data[, encoding]][, callback])`.

-   `data` {string|Buffer|Uint8Array}
-   `encoding` {string} Используется только когда данные являются `string`. **По умолчанию:** `'utf8'`.
-   `callback` {Функция} Необязательный обратный вызов для завершения работы сокета.
-   Возвращает: {net.Socket} Сам сокет.

Наполовину закрывает сокет, т.е. посылает пакет FIN. Возможно, сервер все еще будет посылать некоторые данные.

Подробности см. в [`writable.end()`](stream.md#writableendchunk-encoding-callback).

### `socket.localAddress`.

-   {строка}

Строковое представление локального IP-адреса, по которому подключается удаленный клиент. Для

<!-- 0022.part.md -->

### `socket.localPort`

-   {целое число}

Числовое представление локального порта. Например, `80` или `21`.

### `socket.localFamily`

-   {строка}

Строковое представление семейства локальных IP-адресов. `IPv4` или `IPv6`.

### `socket.pause()`.

-   Возвращает: {net.Socket} Сам сокет.

Приостанавливает чтение данных. То есть, события [`'data'`](#event-data) не будут испускаться. Полезно для замедления загрузки.

### `socket.pending`

-   {boolean}

Это `true`, если сокет еще не подключен, либо потому что `.connect()` еще не был вызван, либо потому что он все еще находится в процессе подключения (см. [`socket.connecting`](#socketconnecting)).

### `socket.ref()`.

-   Возвращает: {net.Socket} Сам сокет.

В отличие от `unref()`, вызов `ref()` на ранее `unref`ированном сокете _не_ позволит программе завершиться, если это единственный оставшийся сокет (поведение по умолчанию). Если сокет `ref`отрефлектирован, повторный вызов `ref` не будет иметь никакого эффекта.

### `socket.remoteAddress`

-   {строка}

Строковое представление удаленного IP-адреса. Например, `74.125.127.100` или `2001:4860:a005::68`. Значение может быть `неопределенным`, если сокет уничтожен (например, если клиент отключился).

### `socket.remoteFamily`

-   {строка}

Строковое представление семейства удаленных IP-адресов. `IPv4` или `IPv6`.

### `socket.remotePort`

-   {целое число}

Числовое представление удаленного порта. Например, `80` или `21`.

### `socket.resetAndDestroy()`.

-   Возвращает: {net.Socket}

Закрывает TCP-соединение, посылая пакет RST, и уничтожает поток. Если этот TCP-сокет находится в состоянии соединения, то после соединения он пошлет RST-пакет и уничтожит этот TCP-сокет. В противном случае будет вызван `socket.destroy` с ошибкой `ERR_SOCKET_CLOSED`. Если это не TCP-сокет (например, труба), вызов этого метода немедленно приведет к ошибке `ERR_INVALID_HANDLE_TYPE`.

### `socket.resume()`.

-   Возвращает: {net.Socket} Сам сокет.

Возобновляет чтение после вызова [`socket.pause()`](#socketpause).

### `socket.setEncoding([encoding])`

-   `encoding` {строка}
-   Возвращает: {net.Socket} Сам сокет.

Устанавливает кодировку для сокета как [Readable Stream](stream.md#class-streamreadable). Смотрите [`readable.setEncoding()`](stream.md#readablesetencodingencoding) для получения дополнительной информации.

### `socket.setKeepAlive([enable][, initialDelay])`.

-   `enable` {boolean} **По умолчанию:** `false`.
-   `initialDelay` {число} **По умолчанию:** `0`
-   Возвращает: {net.Socket} Сам сокет.

Включает/выключает функцию keep-alive, а также опционально устанавливает начальную задержку перед отправкой первого зонда keepalive на незанятом сокете.

Задайте `initialDelay` (в миллисекундах), чтобы установить задержку между последним полученным пакетом данных и первым запросом keepalive. Установка `0` для `initialDelay` оставит значение неизменным по сравнению со значением по умолчанию (или предыдущим).

Включение функции keep-alive установит следующие параметры сокета:

-   `SO_KEEPALIVE=1`
-   `TCP_KEEPIDLE=initialDelay`.

<!-- 0023.part.md -->

-   `TCP_KEEPINTVL=1`

### `socket.setNoDelay([noDelay])`

-   `noDelay` {boolean} **По умолчанию:** `true`.
-   Возвращает: {net.Socket} Сам сокет.

Включить/выключить использование алгоритма Нагла.

Когда создается TCP-соединение, в нем будет включен алгоритм Нагла.

Алгоритм Нагла задерживает данные перед отправкой по сети. Он пытается оптимизировать пропускную способность за счет задержки.

Если передать `true` для `noDelay` или не передать аргумент, алгоритм Нагла будет отключен для сокета. Передача `false` для `noDelay` включит алгоритм Нагла.

### `socket.setTimeout(timeout[, callback])`.

-   `timeout` {number}
-   `callback` {функция}
-   Возвращает: {net.Socket} Сам сокет.

Устанавливает таймаут сокета после `timeout` миллисекунд бездействия сокета. По умолчанию `net.Socket` не имеет тайм-аута.

При срабатывании тайм-аута сокет получит событие [`'timeout'`](#event-timeout), но соединение не будет разорвано. Пользователь должен вручную вызвать [`socket.end()`](#socketenddata-encoding-callback) или [`socket.destroy()`](#socketdestroyerror) для завершения соединения.

<!-- 0024.part.md -->

```js
socket.setTimeout(3000);
socket.on('timeout', () => {
    console.log('socket timeout');
    socket.end();
});
```

<!-- 0025.part.md -->

Если `timeout` равен 0, то существующий таймаут простоя отключается.

Необязательный параметр `callback` будет добавлен в качестве одноразового слушателя для события [`'timeout'`](#event-timeout).

### `socket.timeout`

-   {number|undefined}

Таймаут сокета в миллисекундах, установленный [`socket.setTimeout()`](#socketsettimeouttimeout-callback). Это `undefined`, если таймаут не был установлен.

### `socket.unref()`.

-   Возвращает: {net.Socket} Сам сокет.

Вызов `unref()` на сокете позволит программе завершить работу, если это единственный активный сокет в системе событий. Если сокет уже `unref`, то повторный вызов `unref()` не будет иметь никакого эффекта.

### `socket.write(data[, encoding][, callback])`.

-   `data` {string|Buffer|Uint8Array}
-   `encoding` {string} Используется только когда данные являются `string`. **По умолчанию:** `utf8`.
-   `callback` {Функция}
-   Возвращает: {boolean}

Отправляет данные по сокету. Второй параметр задает кодировку в случае строки. По умолчанию используется кодировка UTF8.

Возвращает `true`, если все данные были успешно переданы в буфер ядра. Возвращает `false`, если все данные или их часть были помещены в пользовательскую память. [`'drain'`](#event-drain) будет выдан, когда буфер снова освободится.

Необязательный параметр `callback` будет выполнен, когда данные будут окончательно записаны, что может произойти не сразу.

Для получения дополнительной информации смотрите метод `Writable` stream [`write()`](stream.md#writablewritechunk-encoding-callback).

### `socket.readyState`

-   {string}

Это свойство представляет состояние соединения в виде строки.

-   Если поток соединяется, `socket.readyState` будет `opening`.
-   Если поток доступен для чтения и записи, то `open`.
-   Если поток доступен для чтения и не доступен для записи, то это `readOnly`.
-   Если поток не доступен для чтения и записи, то это `writeOnly`.

## `net.connect()`.

Псевдоним [`net.createConnection()`](#netcreateconnection).

Возможные сигнатуры:

-   [`net.connect(options[, connectListener])`](#netconnectoptions-connectlistener)
-   [`net.connect(path[, connectListener])`](#netconnectpath-connectlistener) для [IPC](#ipc-support) соединений.
-   [`net.connect(port[, host][, connectListener])`](#netconnectport-host-connectlistener) для TCP-соединений.

### `net.connect(options[, connectListener])`.

-   `options` {Object}
-   `connectListener` {Функция}
-   Возвращает: {net.Socket}

Псевдоним для [`net.createConnection(options[, connectListener])`](#netcreateconnectionoptions-connectlistener).

### `net.connect(path[, connectListener])`.

-   `path` {string}
-   `connectListener` {функция}
-   Возвращает: {net.Socket}

Псевдоним для [`net.createConnection(path[, connectListener])`](#netcreateconnectionpath-connectlistener).

### `net.connect(port[, host][, connectListener])`.

-   `port` {number}
-   `host` {string}
-   `connectListener` {функция}
-   Возвращает: {net.Socket}

Псевдоним для [`net.createConnection(port[, host][, connectListener])`] (#netcreateconnectionport-host-connectlistener).

## `net.createConnection()`.

Фабрика

<!-- 0026.part.md -->

Когда соединение будет установлено, на возвращенном сокете произойдет событие [`'connect'`](#event-connect). Последний параметр `connectListener`, если он указан, будет добавлен в качестве слушателя для события [`'connect'`](#event-connect) **once**.

Возможные сигнатуры:

-   [`net.createConnection(options[, connectListener])`](#netcreateconnectionoptions-connectlistener)
-   [`net.createConnection(path[, connectListener])`](#netcreateconnectionpath-connectlistener) для [IPC](#ipc-support) соединений.
-   [`net.createConnection(port[, host][, connectListener])`](#netcreateconnectionport-host-connectlistener) для TCP-соединений.

Функция [`net.connect()`](#netconnect) является псевдонимом этой функции.

### `net.createConnection(options[, connectListener])`.

-   `options` {Object} Требуется. Передается как в вызов [`new net.Socket([options])`](#new-netsocketoptions), так и в метод [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener).
-   `connectListener` {Функция} Общий параметр функций [`net.createConnection()`](#netcreateconnection). Если задан, то будет добавлен в качестве слушателя для события [`'connect'`](#event-connect) на возвращаемом сокете один раз.
-   Возвращает: {net.Socket} Вновь созданный сокет, используемый для начала соединения.

Доступные опции см. в [`new net.Socket([options])`](#new-netsocketoptions) и [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener).

Дополнительные параметры:

-   `timeout` {number} Если установлен, то будет использоваться для вызова [`socket.setTimeout(timeout)`](#socketsettimeouttimeout-callback) после создания сокета, но до начала соединения.

Ниже приведен пример клиента эхо-сервера, описанного в разделе [`net.createServer()`](#netcreateserveroptions-connectionlistener):

<!-- 0027.part.md -->

```js
const net = require('node:net');
const client = net.createConnection({ port: 8124 }, () => {
    // 'connect' listener.
    console.log('connected to server!');
    client.write('world!\r\n');
});
client.on('data', (data) => {
    console.log(data.toString());
    client.end();
});
client.on('end', () => {
    console.log('disconnected from server');
});
```

<!-- 0028.part.md -->

Для подключения к сокету `/tmp/echo.sock`:

<!-- 0029.part.md -->

```js
const client = net.createConnection({
    path: '/tmp/echo.sock',
});
```

<!-- 0030.part.md -->

### `net.createConnection(path[, connectListener])`.

-   `path` {string} Путь, к которому должен подключиться сокет. Будет передан в [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener). См. раздел [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
-   `connectListener` {Функция} Общий параметр функций [`net.createConnection()`](#netcreateconnection), "одноразовый" слушатель события `'connect'` на инициирующем сокете. Будет передан в [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener).
-   Возвращает: {net.Socket} Вновь созданный сокет, используемый для запуска соединения.

Инициирует [IPC](#ipc-support) соединение.

Эта функция создает новый [`net.Socket`](#class-netsocket) со всеми опциями, установленными по умолчанию, немедленно инициирует соединение с помощью [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener), затем возвращает `net.Socket`, который запускает соединение.

### `net.createConnection(port[, host][, connectListener])`.

-   `port` {число} Порт, к которому должен подключиться сокет. Будет передан в [`socket.connect(port[, host][, connectListener])`] (#socketconnectport-host-connectlistener).
-   `host` {string} Хост, к которому должен подключиться сокет. Будет передаваться в [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener). **По умолчанию:** `'localhost'`.
-   `connectListener` {Функция} Общий параметр функций [`net.createConnection()`](#netcreateconnection), "одноразовый" слушатель события `'connect'` на инициирующем сокете. Будет передан в [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener).
-   Возвращает: {net.Socket} Вновь созданный сокет, используемый для запуска соединения.

Инициирует TCP-соединение.

Эта функция создает новый [`net.Socket`](#class-netsocket) со всеми опциями, установленными по умолчанию, немедленно инициирует соединение с помощью [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener), затем возвращает `net.Socket`, который запускает соединение.

## `net.createServer([options][, connectionListener])`.

-   `options` {Object}

    -   `allowHalfOpen` {boolean} Если установлено значение `false`, то сокет будет автоматически завершать доступную для записи сторону, когда заканчивается доступная для чтения сторона. **По умолчанию:** `false`.
    -   `pauseOnConnect` {boolean} Указывает, должен ли сокет приостанавливаться при входящих соединениях. **По умолчанию:** `false`.
    -   `noDelay` {boolean} Если установлено значение `true`, то отключает использование алгоритма Нагла сразу после получения нового входящего соединения. **По умолчанию:** `false`.
    -   `keepAlive` {boolean} Если установлено значение `true`, это включает функцию keep-alive на сокете сразу после получения нового входящего соединения, аналогично тому, как это делается в [`socket.setKeepAlive([enable][, initialDelay])`](#socketsetkeepaliveenable-initialdelay). **По умолчанию:** `false`.
    -   `keepAliveInitialDelay` {number} Если установлено положительное число

<!-- 0031.part.md -->

-   `connectionListener` {Функция} Автоматически устанавливается в качестве слушателя для события [`'соединение'`](#event-connection).

-   Возвращает: {net.Server}

Создает новый TCP или [IPC](#ipc-support) сервер.

Если `allowHalfOpen` установлено в `true`, когда другой конец сокета сигнализирует об окончании передачи, сервер будет отправлять ответное сообщение об окончании передачи только при явном вызове [`socket.end()`](#socketenddata-encoding-callback). Например, в контексте TCP, при получении FIN-пакета, FIN-пакет отправляется обратно только при явном вызове [`socket.end()`](#socketenddata-encoding-callback). До этого момента соединение является полузакрытым (не читаемым, но все еще доступным для записи). Дополнительную информацию см. в [`'end'`](#event-end) event и [RFC 1122](https://tools.ietf.org/html/rfc1122) (раздел 4.2.2.13).

Если `pauseOnConnect` имеет значение `true`, то сокет, связанный с каждым входящим соединением, будет приостановлен, и данные с его хэндла не будут считываться. Это позволяет передавать соединения между процессами без чтения данных исходным процессом. Чтобы начать чтение данных из приостановленного сокета, вызовите [`socket.resume()`](#socketresume).

Сервер может быть TCP-сервером или [IPC](#ipc-support) сервером, в зависимости от того, что он [`listen()`](#serverlisten) слушает.

Вот пример эхо-сервера TCP, который прослушивает соединения на порту 8124:

<!-- 0032.part.md -->

```js
const net = require('node:net');
const server = net.createServer((c) => {
    // 'connection' listener.
    console.log('client connected');
    c.on('end', () => {
        console.log('client disconnected');
    });
    c.write('hello\r\n');
    c.pipe(c);
});
server.on('error', (err) => {
    throw err;
});
server.listen(8124, () => {
    console.log('server bound');
});
```

<!-- 0033.part.md -->

Проверьте это с помощью `telnet`:

<!-- 0034.part.md -->

```console
$ telnet localhost 8124
```

<!-- 0035.part.md -->

Для прослушивания сокета `/tmp/echo.sock`:

<!-- 0036.part.md -->

```js
server.listen('/tmp/echo.sock', () => {
    console.log('server bound');
});
```

<!-- 0037.part.md -->

Используйте `nc` для подключения к серверу сокетов домена Unix:

<!-- 0038.part.md -->

```console
$ nc -U /tmp/echo.sock
```

<!-- 0039.part.md -->

## `net.getDefaultAutoSelectFamily()`.

Получает текущее значение по умолчанию опции `autoSelectFamily` опции [`socket.connect(options)`](#socketconnectoptions-connectlistener).

-   Возвращает: {boolean} Текущее значение по умолчанию опции `autoSelectFamily`.

## `net.setDefaultAutoSelectFamily(value)`.

Устанавливает значение по умолчанию опции `autoSelectFamily` в [`socket.connect(options)`](#socketconnectoptions-connectlistener).

-   `value` {boolean} Новое значение по умолчанию. Первоначальное значение по умолчанию - `false`.

## `net.getDefaultAutoSelectFamilyAttemptTimeout()`.

Получает текущее значение по умолчанию опции `autoSelectFamilyAttemptTimeout` параметра [`socket.connect(options)`](#socketconnectoptions-connectlistener).

-   Возвращает: {число} Текущее значение по умолчанию опции `autoSelectFamilyAttemptTimeout`.

## `net.setDefaultAutoSelectFamilyAttemptTimeout(value)`.

Устанавливает значение по умолчанию опции `autoSelectFamilyAttemptTimeout` параметра [`socket.connect(options)`](#socketconnectoptions-connectlistener).

-   `value` {number} Новое значение по умолчанию, которое должно быть положительным числом. Если число меньше `10`, вместо него используется значение `10`. Начальное значение по умолчанию равно `250`.

## `net.isIP(input)`

-   `input` {string}
-   Возвращает: {целое}

Возвращает `6`, если `input` является IPv6-адресом. Возвращает `4`, если `input` - это IPv4-адрес в [точечно-десятичной нотации](https://en.wikipedia.org/wiki/Dot-decimal_notation) без ведущих нулей. В противном случае возвращается `0`.

<!-- 0040.part.md -->

```js
net.isIP('::1'); // returns 6
net.isIP('127.0.0.1'); // returns 4
net.isIP('127.000.000.001'); // returns 0
net.isIP('127.0.0.1/24'); // returns 0
net.isIP('fhqwhgads'); // returns 0
```

<!-- 0041.part.md -->

## `net.isIPv4(input)`

-   `ввод` {строка}
-   Возвращает: {boolean}

Возвращает `true`, если `input` является IPv4-адресом в [точечно-десятичной нотации](https://en.wikipedia.org/wiki/Dot-decimal_notation) без ведущих нулей. В противном случае возвращается `false`.

<!-- 0042.part.md -->

```js
net.isIPv4('127.0.0.1'); // returns true
net.isIPv4('127.000.000.001'); // returns false
net.isIPv4('127.0.0.1/24'); // returns false
net.isIPv4('fhqwhgads'); // returns false
```

<!-- 0043.part.md -->

## `net.isIPv6(input)`

-   `ввод` {строка}
-   Возвращает: {boolean}

Возвращает `true`, если `input` является адресом IPv6. В противном случае возвращает `false`.

<!-- 0044.part.md -->

```js
net.isIPv6('::1'); // returns true
net.isIPv6('fhqwhgads'); // returns false
```

<!-- 0045.part.md -->

<!-- 0046.part.md -->
