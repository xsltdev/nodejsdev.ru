---
title: Сеть (net)
description: TCP, IPC, сокеты, BlockList, Server и Socket — асинхронный сетевой API Node.js
---

# Сеть (net)

<!--introduced_in=v0.10.0-->

<!--lint disable maximum-line-length-->

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/net.js -->

Модуль `node:net` предоставляет асинхронный сетевой API для потоковых
TCP- или [IPC][IPC]-серверов ([`net.createServer()`][`net.createServer()`]) и клиентов
([`net.createConnection()`][`net.createConnection()`]).

Подключение:

=== "MJS"

    ```js
    import net from 'node:net';
    ```

=== "CJS"

    ```js
    const net = require('node:net');
    ```

## Поддержка IPC

<!-- YAML
changes:
  - version: v20.8.0
    pr-url: https://github.com/nodejs/node/pull/49667
    description: Support binding to abstract Unix domain socket path like `\0abstract`.
                 We can bind '\0' for Node.js `< v20.4.0`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.8.0 | Поддержка привязки к абстрактному пути сокета домена Unix, например `\0abstract`. Мы можем связать '\0' для Node.js `< v20.4.0`. |

Модуль `node:net` поддерживает IPC через именованные каналы в Windows и Unix domain sockets
в остальных ОС.

### Пути для IPC-соединений

[`net.connect()`][`net.connect()`], [`net.createConnection()`][`net.createConnection()`], [`server.listen()`][`server.listen()`] и
[`socket.connect()`][`socket.connect()`] принимают параметр `path` для указания конечных точек IPC.

В Unix локальный домен — это Unix domain. Путь — это путь в файловой системе.
Возникнет ошибка, если длина пути больше `sizeof(sockaddr_un.sun_path)`. Обычно это
107 байт в Linux и 103 в macOS. Если абстракция Node.js создаёт Unix domain socket,
она же удаляет файл сокета. Например, [`net.createServer()`][`net.createServer()`] может создать сокет, а
[`server.close()`][`server.close()`] — удалить узел. Если пользователь создал сокет вне этих API,
узел нужно удалить вручную. То же, если API Node.js создало сокет, а процесс
завершился аварийно. Кратко: Unix domain socket виден в ФС и существует, пока не будет unlink.
В Linux можно использовать абстрактный Unix socket, добавив `\0` в начало пути, например `\0abstract`.
Путь абстрактного сокета в ФС не виден; он исчезает, когда закрыты все ссылки на него.

В Windows локальный домен реализован именованным каналом. Путь _должен_
указывать на элемент в `\\?\pipe\` или `\\.\pipe\`. Допустимы любые символы,
но второй вариант может обрабатывать имена (например, разрешать `..`).
Несмотря на вид, пространство имён каналов плоское. Каналы _не сохраняются_ на диске:
удаляются при закрытии последней ссылки. В отличие от Unix, Windows закрывает и убирает канал при
выходе процесса-владельца.

В строках JavaScript пути с обратными слешами нужно экранировать, например:

```js
net.createServer().listen(
  path.join('\\\\?\\pipe', process.cwd(), 'myctl'));
```

## Класс: `net.BlockList`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

Объект `BlockList` используется в части сетевых API для правил запрета входящего или исходящего
доступа к заданным IPv4/IPv6-адресам, диапазонам или подсетям.

### `blockList.addAddress(address[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<net.SocketAddress>`](net.md) IPv4- или IPv6-адрес.
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'ipv4'` или `'ipv6'`. **По умолчанию:** `'ipv4'`.

Добавляет правило блокировки для указанного IP-адреса.

### `blockList.addRange(start, end[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

* `start` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<net.SocketAddress>`](net.md) Начало диапазона IPv4 или IPv6.
* `end` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<net.SocketAddress>`](net.md) Конец диапазона IPv4 или IPv6.
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'ipv4'` или `'ipv6'`. **По умолчанию:** `'ipv4'`.

Добавляет правило блокировки диапазона адресов от `start` (включительно) до
`end` (включительно).

### `blockList.addSubnet(net, prefix[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

* `net` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<net.SocketAddress>`](net.md) IPv4- или IPv6-адрес сети.
* `prefix` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число бит префикса CIDR. Для IPv4 — от `0` до `32`, для IPv6 —
  от `0` до `128`.
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'ipv4'` или `'ipv6'`. **По умолчанию:** `'ipv4'`.

Добавляет правило блокировки диапазона адресов, заданного маской подсети.

### `blockList.check(address[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<net.SocketAddress>`](net.md) Проверяемый IP-адрес
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'ipv4'` или `'ipv6'`. **По умолчанию:** `'ipv4'`.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если указанный IP попадает под любое из правил в `BlockList`.

```js
const blockList = new net.BlockList();
blockList.addAddress('123.123.123.123');
blockList.addRange('10.0.0.1', '10.0.0.10');
blockList.addSubnet('8592:757c:efae:4e45::', 64, 'ipv6');

console.log(blockList.check('123.123.123.123'));  // Prints: true
console.log(blockList.check('10.0.0.3'));  // Prints: true
console.log(blockList.check('222.111.111.222'));  // Prints: false

// IPv6 notation for IPv4 addresses works:
console.log(blockList.check('::ffff:7b7b:7b7b', 'ipv6')); // Prints: true
console.log(blockList.check('::ffff:123.123.123.123', 'ipv6')); // Prints: true
```

### `blockList.rules`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

* Тип: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список правил, добавленных в блок-лист.

### `BlockList.isBlockList(value)`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

* `value` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное значение JavaScript
* Возвращает `true`, если `value` — экземпляр `net.BlockList`.

### `blockList.fromJSON(value)`

> Стабильность: 1 — Экспериментальная

 <!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

```js
const blockList = new net.BlockList();
const data = [
  'Subnet: IPv4 192.168.1.0/24',
  'Address: IPv4 10.0.0.5',
  'Range: IPv4 192.168.2.1-192.168.2.10',
  'Range: IPv4 10.0.0.1-10.0.0.10',
];
blockList.fromJSON(data);
blockList.fromJSON(JSON.stringify(data));
```

* `value` Blocklist.rules

### `blockList.toJSON()`

> Стабильность: 1 — Экспериментальная

 <!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

* Returns Blocklist.rules

## Класс: `net.SocketAddress`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

### `new net.SocketAddress([options])`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сетевой адрес в виде строки IPv4 или IPv6.
    **По умолчанию:** `'127.0.0.1'`, если `family` — `'ipv4'`; `'::'`, если `family` —
    `'ipv6'`.
  * `family` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'ipv4'` или `'ipv6'`.
    **По умолчанию:** `'ipv4'`.
  * `flowlabel` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Метка потока IPv6, только при `family` — `'ipv6'`.
  * `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт.

### `socketaddress.address`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### `socketaddress.family`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'ipv4'` или `'ipv6'`.

### `socketaddress.flowlabel`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

### `socketaddress.port`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

### `SocketAddress.parse(input)`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка с IP-адресом и при необходимости портом,
  например `123.1.2.3:1234` или `[1::1]:1234`.
* Возвращает: [`<net.SocketAddress>`](net.md) Экземпляр `SocketAddress` при успешном разборе,
  иначе `undefined`.

## Класс: `net.Server`

<!-- YAML
added: v0.1.90
-->

* Расширяет: [EventEmitter](events.md#class-eventemitter)

Класс для создания TCP- или [IPC][IPC]-сервера.

### `new net.Server([options][, connectionListener])`

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См.
  [`net.createServer([options][, connectionListener])`][`net.createServer()`].
* `connectionListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Автоматически устанавливается слушателем события
  [`'connection'`][`'connection'`].
* Возвращает: [`<net.Server>`](net.md#class-netserver)

`net.Server` — это [`EventEmitter`][`EventEmitter`] со следующими событиями:

### Событие: `'close'`

<!-- YAML
added: v0.5.0
-->

Генерируется при закрытии сервера. Если есть активные соединения, событие
не генерируется, пока все соединения не завершены.

### Событие: `'connection'`

<!-- YAML
added: v0.1.90
-->

* Тип: [`<net.Socket>`](net.md#class-netsocket) Объект соединения

Генерируется при новом соединении. `socket` — экземпляр
`net.Socket`.

### Событие: `'error'`

<!-- YAML
added: v0.1.90
-->

* Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке. В отличие от [`net.Socket`][`net.Socket`], событие [`'close'`][`'close'`]
**не** следует сразу за этим, пока явно не вызван
[`server.close()`][`server.close()`]. См. пример в описании
[`server.listen()`][`server.listen()`].

### Событие: `'listening'`

<!-- YAML
added: v0.1.90
-->

Генерируется после привязки сервера вызовом [`server.listen()`][`server.listen()`].

### Событие: `'drop'`

<!-- YAML
added:
  - v18.6.0
  - v16.17.0
-->

Когда число соединений достигает порога `server.maxConnections`, сервер отбрасывает
новые подключения и вместо этого испускает `'drop'`. Для TCP-сервера аргумент
описан ниже, иначе аргумент — `undefined`.

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Аргумент, передаваемый слушателю события.
  * `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный адрес.
  * `localPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Локальный порт.
  * `localFamily` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальное семейство адресов.
  * `remoteAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Удалённый адрес.
  * `remotePort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Удалённый порт.
  * `remoteFamily` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство удалённого IP: `'IPv4'` или `'IPv6'`.

### `server.address()`

<!-- YAML
added: v0.1.90
changes:
  - version: v18.4.0
    pr-url: https://github.com/nodejs/node/pull/43054
    description: The `family` property now returns a string instead of a number.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41431
    description: The `family` property now returns a number instead of a string.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.4.0 | Свойство Family теперь возвращает строку вместо числа. |
    | v18.0.0 | Свойство Family теперь возвращает число вместо строки. |

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Возвращает привязанный `address`, имя `family` и `port` сервера, как сообщает ОС,
если прослушивается IP-сокет (удобно узнать назначенный порт при выборе порта ОС):
`{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`.

Для сервера на pipe или Unix domain socket имя возвращается строкой.

```js
const server = net.createServer((socket) => {
  socket.end('goodbye\n');
}).on('error', (err) => {
  // Handle errors here.
  throw err;
});

// Grab an arbitrary unused port.
server.listen(() => {
  console.log('opened server on', server.address());
});
```

`server.address()` возвращает `null` до события `'listening'` или после вызова
`server.close()`.

### `server.close([callback])`

<!-- YAML
added: v0.1.90
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при закрытии сервера.
* Возвращает: [`<net.Server>`](net.md#class-netserver)

Останавливает приём новых соединений, сохраняя существующие. Функция асинхронна:
сервер окончательно закрывается, когда все соединения завершены и испущено
событие [`'close'`][`'close'`]. Необязательный `callback` вызывается при `'close'`. В отличие
от события, он получит `Error` единственным аргументом, если сервер не был открыт
в момент закрытия.

### `server[Symbol.asyncDispose]()`

<!-- YAML
added:
 - v20.5.0
 - v18.18.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Вызывает [`server.close()`][`server.close()`] и возвращает промис, который выполняется после
закрытия сервера.

### `server.getConnections(callback)`

<!-- YAML
added: v0.9.7
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Server>`](net.md#class-netserver)

Асинхронно возвращает число одновременных соединений на сервере. Работает, если
сокеты передавались в форки.

Обратный вызов принимает два аргумента: `err` и `count`.

### `server.listen()`

Запускает сервер, принимающий соединения. `net.Server` может быть TCP- или
[IPC][IPC]-сервером в зависимости от того, что прослушивается.

Возможные сигнатуры:

* [`server.listen(handle[, backlog][, callback])`][`server.listen(handle)`]
* [`server.listen(options[, callback])`][`server.listen(options)`]
* [`server.listen(path[, backlog][, callback])`][`server.listen(path)`]
  для [IPC][IPC]-серверов
* [`server.listen([port[, host[, backlog]]][, callback])`][`server.listen(port)`]
  для TCP-серверов

Функция асинхронна: когда сервер начинает прослушивание, испускается событие
[`'listening'`][`'listening'`]. Последний параметр `callback` добавляется как слушатель
[`'listening'`][`'listening'`].

У всех вариантов `listen()` может быть параметр `backlog` — максимальная длина
очереди ожидающих соединений. Фактическое значение задаётся ОС (например
`tcp_max_syn_backlog` и `somaxconn` в Linux). По умолчанию `511` (не `512`).

Для всех [`net.Socket`][`net.Socket`] установлен `SO_REUSEADDR` (см. [`socket(7)`][`socket(7)`]).

`server.listen()` можно вызвать снова только если при первом вызове была ошибка
или был вызван `server.close()`. Иначе — `ERR_SERVER_ALREADY_LISTEN`.

Частая ошибка при прослушивании — `EADDRINUSE`: другой сервер уже занял
`port`/`path`/`handle`. Один из вариантов — повторить попытку через некоторое
время:

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

#### `server.listen(handle[, backlog][, callback])`

<!-- YAML
added: v0.5.10
-->

* `handle` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `backlog` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Common parameter of [`server.listen()`][`server.listen()`] functions
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Server>`](net.md#class-netserver)

Запускает сервер на уже привязанном `handle` (порт, Unix domain socket или
именованная труба Windows).

`handle` может быть сервером, сокетом (с полем `_handle`) или объектом с
полем `fd` — действительным файловым дескриптором.

Прослушивание по дескриптору файла в Windows не поддерживается.

#### `server.listen(options[, callback])`

<!-- YAML
added: v0.11.14
changes:
  - version:
    - v23.1.0
    - v22.12.0
    pr-url: https://github.com/nodejs/node/pull/55408
    description: The `reusePort` option is supported.
  - version: v15.6.0
    pr-url: https://github.com/nodejs/node/pull/36623
    description: AbortSignal support was added.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/23798
    description: The `ipv6Only` option is supported.
-->

Добавлено в: v0.11.14

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.1.0, v22.12.0 | Поддерживается опция `reusePort`. |
    | v15.6.0 | Добавлена ​​поддержка AbortSignal. |
    | v11.4.0 | Поддерживается опция `ipv6Only`. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Обязателен. Поддерживаемые свойства:
  * `backlog` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий параметр функций [`server.listen()`][`server.listen()`].
  * `exclusive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
  * `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `ipv6Only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Для TCP: при `true` отключается dual-stack: привязка к
    `::` не привязывает `0.0.0.0`. **По умолчанию:** `false`.
  * `reusePort` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Для TCP: при `true` несколько сокетов на одном хосте
    могут слушать один порт; ОС распределяет входящие соединения. Доступно не на
    всех платформах (Linux 3.9+, DragonFlyBSD 3.6+, FreeBSD 12.0+, Solaris 11.4,
    AIX 7.2.5+ и т.д.). На неподдерживаемых платформах — ошибка. **По умолчанию:** `false`.
  * `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Игнорируется, если задан `port`. См.
    [Пути для IPC-соединений][Identifying paths for IPC connections].
  * `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `readableAll` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Для IPC делает трубу читаемой для всех пользователей.
    **По умолчанию:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Можно использовать для закрытия прослушивающего сервера.
  * `writableAll` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Для IPC делает трубу доступной для записи всем.
    **По умолчанию:** `false`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Server>`](net.md#class-netserver)

Если указан `port`, поведение как у
[`server.listen([port[, host[, backlog]]][, callback])`][`server.listen(port)`].
Если указан `path` — как у
[`server.listen(path[, backlog][, callback])`][`server.listen(path)`].
Если ни то ни другое — будет ошибка.

При `exclusive` равном `false` (по умолчанию) воркеры кластера разделяют один
базовый handle. При `exclusive` равном `true` handle не разделяется, попытка
разделить порт даёт ошибку. Пример эксклюзивного порта ниже.

```js
server.listen({
  host: 'localhost',
  port: 80,
  exclusive: true,
});
```

Если `exclusive` равен `true`, а базовый handle общий, разные воркеры могут
передать разный `backlog`; тогда используется первый `backlog`, переданный
главному процессу.

Запуск IPC-сервера от root может сделать путь недоступным непривилегированным
пользователям; `readableAll` и `writableAll` открывают доступ всем.

Если задана опция `signal`, вызов `.abort()` у соответствующего `AbortController`
аналогичен `.close()` у сервера:

```js
const controller = new AbortController();
server.listen({
  host: 'localhost',
  port: 80,
  signal: controller.signal,
});
// Позже, когда нужно закрыть сервер:
controller.abort();
```

#### `server.listen(path[, backlog][, callback])`

<!-- YAML
added: v0.1.90
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь, который должен прослушивать сервер. См.
  [Пути для IPC-соединений][Identifying paths for IPC connections].
* `backlog` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий параметр функций [`server.listen()`][`server.listen()`].
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function).
* Возвращает: [`<net.Server>`](net.md#class-netserver)

Запускает [IPC][IPC]-сервер на указанном `path`.

#### `server.listen([port[, host[, backlog]]][, callback])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `backlog` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий параметр функций [`server.listen()`][`server.listen()`].
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function).
* Возвращает: [`<net.Server>`](net.md#class-netserver)

Запускает TCP-сервер на указанных `port` и `host`.

Если `port` опущен или равен `0`, ОС назначит свободный порт; его можно взять из
`server.address().port` после события [`'listening'`][`'listening'`].

Если `host` опущен, сервер принимает соединения на [неуказанный IPv6-адрес][unspecified IPv6 address]
(`::`), если доступен IPv6, иначе на [неуказанный IPv4-адрес][unspecified IPv4 address] (`0.0.0.0`).

В большинстве ОС прослушивание [неуказанного IPv6][unspecified IPv6 address] (`::`) может заставить
`net.Server` также слушать [неуказанный IPv4][unspecified IPv4 address] (`0.0.0.0`).

### `server.listening`

<!-- YAML
added: v5.7.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Прослушивает ли сервер соединения.

### `server.maxConnections`

<!-- YAML
added: v0.2.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/48276
    description: Setting `maxConnections` to `0` drops all the incoming
                 connections. Previously, it was interpreted as `Infinity`.
-->

Добавлено в: v0.2.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Установка для maxConnections значения «0» отключает все входящие соединения. Раньше его трактовали как «Бесконечность». |

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Когда число соединений достигает порога `server.maxConnections`:

1. Вне режима кластера Node.js закрывает соединение.

2. В режиме кластера по умолчанию соединение перенаправляется другому воркеру.
   Чтобы закрывать соединение, задайте [`server.dropMaxConnection`][`server.dropMaxConnection`] в `true`.

Не рекомендуется полагаться на эту опцию после передачи сокета дочернему процессу
через [`child_process.fork()`][`child_process.fork()`].

### `server.dropMaxConnection`

<!-- YAML
added:
  - v23.1.0
  - v22.12.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При `true` при достижении [`server.maxConnections`][`server.maxConnections`] начинается закрытие
соединений. Имеет смысл только в режиме кластера.

### `server.ref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<net.Server>`](net.md#class-netserver)

Противоположность `unref()`: `ref()` у ранее `unref`-сервера снова удерживает
процесс, если это единственный сервер. Повторный `ref()` на уже `ref`-сервере
ничего не меняет.

### `server.unref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<net.Server>`](net.md#class-netserver)

`unref()` позволяет процессу завершиться, если это единственный активный сервер.
Повторный `unref()` на уже отвязанном сервере не действует.

## Класс: `net.Socket`

<!-- YAML
added: v0.3.4
-->

* Расширяет: [stream.Duplex](stream.md#class-streamduplex)

Класс представляет TCP-сокет или потоковую [IPC][IPC]-конечную точку (в Windows —
именованные трубы, иначе Unix domain sockets). Также является [`EventEmitter`][`EventEmitter`].

`net.Socket` можно создать вручную для общения с сервером — например его возвращает
[`net.createConnection()`][`net.createConnection()`].

Его же создаёт Node.js и передаёт при входящем соединении — слушателям события
[`'connection'`][`'connection'`] на [`net.Server`][`net.Server`], чтобы работать с клиентом.

### `new net.Socket([options])`

<!-- YAML
added: v0.3.4
changes:
  - version: v25.6.0
    pr-url: https://github.com/nodejs/node/pull/61503
    description: Added `typeOfService` option.
  - version: v15.14.0
    pr-url: https://github.com/nodejs/node/pull/37735
    description: AbortSignal support was added.
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/25436
    description: Added `onread` option.
-->

Добавлено в: v0.3.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.6.0 | Добавлена ​​опция typeOfService. |
    | v15.14.0 | Добавлена ​​поддержка AbortSignal. |
    | v12.10.0 | Добавлена ​​опция onread. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Available options are:
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `false`, then the socket will
    automatically end the writable side when the readable side ends. See
    [`net.createServer()`][`net.createServer()`] and the [`'end'`][`'end'`] event for details. **Default:**
    `false`.
  * `blockList` [`<net.BlockList>`](net.md) `blockList` can be used for disabling outbound
    access to specific IP addresses, IP ranges, or IP subnets.
  * `fd` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If specified, wrap around an existing socket with
    the given file descriptor, otherwise a new socket will be created.
  * `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `true`, it enables keep-alive functionality on
    the socket immediately after the connection is established, similarly on what
    is done in [`socket.setKeepAlive()`][`socket.setKeepAlive()`]. **Default:** `false`.
  * `keepAliveInitialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If set to a positive number, it sets the
    initial delay before the first keepalive probe is sent on an idle socket. **Default:** `0`.
  * `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `true`, it disables the use of Nagle's algorithm
    immediately after the socket is established. **Default:** `false`.
  * `onread` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) If specified, incoming data is stored in a single `buffer`
    and passed to the supplied `callback` when data arrives on the socket.
    This will cause the streaming functionality to not provide any data.
    The socket will emit events like `'error'`, `'end'`, and `'close'`
    as usual. Methods like `pause()` and `resume()` will also behave as
    expected.
    * `buffer` [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Either a reusable chunk of memory to
      use for storing incoming data or a function that returns such.
    * `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) This function is called for every chunk of incoming
      data. Two arguments are passed to it: the number of bytes written to
      `buffer` and a reference to `buffer`. Return `false` from this function to
      implicitly `pause()` the socket. This function will be executed in the
      global context.
  * `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Allow reads on the socket when an `fd` is passed,
    otherwise ignored. **Default:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) An Abort signal that may be used to destroy the
    socket.
  * `typeOfService` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The initial Type of Service (TOS) value.
  * `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Allow writes on the socket when an `fd` is passed,
    otherwise ignored. **Default:** `false`.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Creates a new socket object.

The newly created socket can be either a TCP socket or a streaming [IPC][IPC]
endpoint, depending on what it [`connect()`][`socket.connect()`] to.

### Событие: `'close'`

<!-- YAML
added: v0.1.90
-->

* `hadError` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если на сокете была ошибка передачи.

Генерируется после полного закрытия сокета. `hadError` — булево значение:
закрытие из‑за ошибки передачи.

### Событие: `'connect'`

<!-- YAML
added: v0.1.90
-->

Генерируется при успешном установлении соединения.
См. [`net.createConnection()`][`net.createConnection()`].

### Событие: `'connectionAttempt'`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The IP which the socket is attempting to connect to.
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The port which the socket is attempting to connect to.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The family of the IP. It can be `6` for IPv6 or `4` for IPv4.

Генерируется при начале новой попытки соединения. Может повторяться,
если в [`socket.connect(options)`][`socket.connect(options)`] включён автоподбор семейства адреса.

### Событие: `'connectionAttemptFailed'`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The IP which the socket attempted to connect to.
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The port which the socket attempted to connect to.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The family of the IP. It can be `6` for IPv6 or `4` for IPv4.
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) The error associated with the failure.

Генерируется при неудачной попытке соединения. Может повторяться,
если в [`socket.connect(options)`][`socket.connect(options)`] включён автоподбор семейства адреса.

### Событие: `'connectionAttemptTimeout'`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The IP which the socket attempted to connect to.
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The port which the socket attempted to connect to.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The family of the IP. It can be `6` for IPv6 or `4` for IPv4.

Генерируется при таймауте попытки соединения. Только (и может повторяться)
при включённом автоподборе семейства в
[`socket.connect(options)`][`socket.connect(options)`].

### Событие: `'data'`

<!-- YAML
added: v0.1.90
-->

* Тип: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерируется при получении данных. Аргумент `data` — `Buffer` или
`String`. Кодировка задаётся [`socket.setEncoding()`][`socket.setEncoding()`].

Данные теряются, если нет слушателя события `'data'` у `Socket`.

### Событие: `'drain'`

<!-- YAML
added: v0.1.90
-->

Генерируется, когда буфер записи опустел. Можно использовать для ограничения скорости отправки.

См. также возвращаемые значения `socket.write()`.

### Событие: `'end'`

<!-- YAML
added: v0.1.90
-->

Генерируется, когда удалённая сторона сигнализирует о конце передачи и
закрывается читаемая сторона сокета.

По умолчанию (`allowHalfOpen` — `false`) сокет отправляет ответный пакет
окончания передачи и уничтожает дескриптор после вывода очереди записи.
Если `allowHalfOpen` — `true`, запись не завершается автоматически через [`end()`][`socket.end()`],
можно продолжать писать данные. Закрыть соединение нужно явно вызовом [`end()`][`socket.end()`]
(отправка FIN).

### Событие: `'error'`

<!-- YAML
added: v0.1.90
-->

* Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке. Сразу после него вызывается событие `'close'`.

### Событие: `'lookup'`

<!-- YAML
added: v0.11.3
changes:
  - version: v5.10.0
    pr-url: https://github.com/nodejs/node/pull/5598
    description: The `host` parameter is supported now.
-->

Добавлено в: v0.11.3

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v5.10.0 | Параметр `host` теперь поддерживается. |

Генерируется после разрешения имени хоста, до подключения.
Не применяется к Unix-сокетам.

* `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null Объект ошибки. См. [`dns.lookup()`][`dns.lookup()`].
* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) IP-адрес.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null Тип адреса. См. [`dns.lookup()`][`dns.lookup()`].
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста.

### Событие: `'ready'`

<!-- YAML
added: v9.11.0
-->

Генерируется, когда сокет готов к использованию.

Сразу после `'connect'`.

### Событие: `'timeout'`

<!-- YAML
added: v0.1.90
-->

Генерируется при таймауте сокета из‑за неактивности. Только уведомление о простое;
соединение нужно закрыть вручную.

См. также [`socket.setTimeout()`][`socket.setTimeout()`].

### `socket.address()`

<!-- YAML
added: v0.1.90
changes:
  - version: v18.4.0
    pr-url: https://github.com/nodejs/node/pull/43054
    description: The `family` property now returns a string instead of a number.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41431
    description: The `family` property now returns a number instead of a string.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.4.0 | Свойство Family теперь возвращает строку вместо числа. |
    | v18.0.0 | Свойство Family теперь возвращает число вместо строки. |

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Returns the bound `address`, the address `family` name and `port` of the
socket as reported by the operating system:
`{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`

### `socket.autoSelectFamilyAttemptedAddresses`

<!-- YAML
added:
 - v19.4.0
 - v18.18.0
-->

* Тип: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

This property is only present if the family autoselection algorithm is enabled in
[`socket.connect(options)`][`socket.connect(options)`] and it is an array of the addresses that have been attempted.

Each address is a string in the form of `$IP:$PORT`. If the connection was successful,
then the last address is the one that the socket is currently connected to.

### `socket.bufferSize`

<!-- YAML
added: v0.3.8
deprecated:
  - v14.6.0
-->

> Stability: 0 - Deprecated: Use [`writable.writableLength`][`writable.writableLength`] instead.

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

This property shows the number of characters buffered for writing. The buffer
may contain strings whose length after encoding is not yet known. So this number
is only an approximation of the number of bytes in the buffer.

`net.Socket` has the property that `socket.write()` always works. This is to
help users get up and running quickly. The computer cannot always keep up
with the amount of data that is written to a socket. The network connection
simply might be too slow. Node.js will internally queue up the data written to a
socket and send it out over the wire when it is possible.

The consequence of this internal buffering is that memory may grow.
Users who experience large or growing `bufferSize` should attempt to
"throttle" the data flows in their program with
[`socket.pause()`][`socket.pause()`] and [`socket.resume()`][`socket.resume()`].

### `socket.bytesRead`

<!-- YAML
added: v0.5.3
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The amount of received bytes.

### `socket.bytesWritten`

<!-- YAML
added: v0.5.3
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The amount of bytes sent.

### `socket.connect()`

Initiate a connection on a given socket.

Possible signatures:

* [`socket.connect(options[, connectListener])`][`socket.connect(options)`]
* [`socket.connect(path[, connectListener])`][`socket.connect(path)`]
  for [IPC][IPC] connections.
* [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`]
  for TCP connections.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

This function is asynchronous. When the connection is established, the
[`'connect'`][`'connect'`] event will be emitted. If there is a problem connecting,
instead of a [`'connect'`][`'connect'`] event, an [`'error'`][`'error'`] event will be emitted with
the error passed to the [`'error'`][`'error'`] listener.
The last parameter `connectListener`, if supplied, will be added as a listener
for the [`'connect'`][`'connect'`] event **once**.

This function should only be used for reconnecting a socket after
`'close'` has been emitted or otherwise it may lead to undefined
behavior.

#### `socket.connect(options[, connectListener])`

<!-- YAML
added: v0.1.90
changes:
  - version:
      - v20.0.0
      - v18.18.0
    pr-url: https://github.com/nodejs/node/pull/46790
    description: The default value for the autoSelectFamily option is now true.
                 The `--enable-network-family-autoselection` CLI flag has been renamed
                 to `--network-family-autoselection`. The old name is now an
                 alias but it is discouraged.
  - version: v19.4.0
    pr-url: https://github.com/nodejs/node/pull/45777
    description: The default value for autoSelectFamily option can be changed
                 at runtime using `setDefaultAutoSelectFamily` or via the
                 command line option `--enable-network-family-autoselection`.
  - version:
      - v19.3.0
      - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/44731
    description: Added the `autoSelectFamily` option.
  - version:
    - v17.7.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41310
    description: The `noDelay`, `keepAlive`, and `keepAliveInitialDelay`
                 options are supported now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/6021
    description: The `hints` option defaults to `0` in all cases now.
                 Previously, in the absence of the `family` option it would
                 default to `dns.ADDRCONFIG | dns.V4MAPPED`.
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/6000
    description: The `hints` option is supported now.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v18.18.0 | Значение по умолчанию для параметра autoSelectFamily теперь равно true. Флаг CLI `--enable-network-family-autoselection` был переименован в `--network-family-autoselection`. Старое имя теперь является псевдонимом, но оно не рекомендуется. |
    | v19.4.0 | Значение по умолчанию для параметра autoSelectFamily можно изменить во время выполнения с помощью setDefaultAutoSelectFamily или с помощью параметра командной строки --enable-network-family-autoselection. |
    | v19.3.0, v18.13.0 | Добавлена ​​опция autoSelectFamily. |
    | v17.7.0, v16.15.0 | Параметры noDelay, KeepAlive и KeepAliveInitialDelay теперь поддерживаются. |
    | v6.0.0 | Опция «подсказки» теперь во всех случаях по умолчанию равна «0». Раньше, при отсутствии опции «family», по умолчанию использовалось значение «dns.ADDRCONFIG \| dns.V4MAPPED`. |
    | v5.11.0 | Опция `подсказки` теперь поддерживается. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Common parameter of [`socket.connect()`][`socket.connect()`]
  methods. Will be added as a listener for the [`'connect'`][`'connect'`] event once.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Initiate a connection on a given socket. Normally this method is not needed,
the socket should be created and opened with [`net.createConnection()`][`net.createConnection()`]. Use
this only when implementing a custom Socket.

For TCP connections, available `options` are:

* `autoSelectFamily` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type): If set to `true`, it enables a family
  autodetection algorithm that loosely implements section 5 of [RFC 8305][RFC 8305]. The
  `all` option passed to lookup is set to `true` and the sockets attempts to
  connect to all obtained IPv6 and IPv4 addresses, in sequence, until a
  connection is established. The first returned AAAA address is tried first,
  then the first returned A address, then the second returned AAAA address and
  so on. Each connection attempt (but the last one) is given the amount of time
  specified by the `autoSelectFamilyAttemptTimeout` option before timing out and
  trying the next address. Ignored if the `family` option is not `0` or if
  `localAddress` is set. Connection errors are not emitted if at least one
  connection succeeds. If all connections attempts fails, a single
  `AggregateError` with all failed attempts is emitted. **Default:**
  [`net.getDefaultAutoSelectFamily()`][`net.getDefaultAutoSelectFamily()`].
* `autoSelectFamilyAttemptTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type): The amount of time in milliseconds
  to wait for a connection attempt to finish before trying the next address when
  using the `autoSelectFamily` option. If set to a positive integer less than
  `10`, then the value `10` will be used instead. **Default:**
  [`net.getDefaultAutoSelectFamilyAttemptTimeout()`][`net.getDefaultAutoSelectFamilyAttemptTimeout()`].
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type): Version of IP stack. Must be `4`, `6`, or `0`. The value
  `0` indicates that both IPv4 and IPv6 addresses are allowed. **Default:** `0`.
* `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optional [`dns.lookup()` hints][`dns.lookup()` hints].
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Host the socket should connect to. **Default:** `'localhost'`.
* `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Local address the socket should connect from.
* `localPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Local port the socket should connect from.
* `lookup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Custom lookup function. **Default:** [`dns.lookup()`][`dns.lookup()`].
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Required. Port the socket should connect to.

For [IPC][IPC] connections, available `options` are:

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Required. Path the client should connect to.
  See [Identifying paths for IPC connections][Identifying paths for IPC connections]. If provided, the TCP-specific
  options above are ignored.

#### `socket.connect(path[, connectListener])`

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Path the client should connect to. See
  [Identifying paths for IPC connections][Identifying paths for IPC connections].
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Common parameter of [`socket.connect()`][`socket.connect()`]
  methods. Will be added as a listener for the [`'connect'`][`'connect'`] event once.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Initiate an [IPC][IPC] connection on the given socket.

Alias to
[`socket.connect(options[, connectListener])`][`socket.connect(options)`]
called with `{ path: path }` as `options`.

#### `socket.connect(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Port the client should connect to.
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Host the client should connect to.
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Common parameter of [`socket.connect()`][`socket.connect()`]
  methods. Will be added as a listener for the [`'connect'`][`'connect'`] event once.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Initiate a TCP connection on the given socket.

Alias to
[`socket.connect(options[, connectListener])`][`socket.connect(options)`]
called with `{port: port, host: host}` as `options`.

### `socket.connecting`

<!-- YAML
added: v6.1.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

If `true`,
[`socket.connect(options[, connectListener])`][`socket.connect(options)`] was
called and has not yet finished. It will stay `true` until the socket becomes
connected, then it is set to `false` and the `'connect'` event is emitted. Note
that the
[`socket.connect(options[, connectListener])`][`socket.connect(options)`]
callback is a listener for the `'connect'` event.

### `socket.destroy([error])`

<!-- YAML
added: v0.1.90
-->

* `error` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Ensures that no more I/O activity happens on this socket.
Destroys the stream and closes the connection.

See [`writable.destroy()`][`writable.destroy()`] for further details.

### `socket.destroyed`

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates if the connection is destroyed or not. Once a
  connection is destroyed no further data can be transferred using it.

See [`writable.destroyed`][`writable.destroyed`] for further details.

### `socket.destroySoon()`

<!-- YAML
added: v0.3.4
-->

Destroys the socket after all data is written. If the `'finish'` event was
already emitted the socket is destroyed immediately. If the socket is still
writable it implicitly calls `socket.end()`.

### `socket.end([data[, encoding]][, callback])`

<!-- YAML
added: v0.1.90
-->

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Only used when data is `string`. **Default:** `'utf8'`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Optional callback for when the socket is finished.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Half-closes the socket. i.e., it sends a FIN packet. It is possible the
server will still send some data.

See [`writable.end()`][`writable.end()`] for further details.

### `socket.localAddress`

<!-- YAML
added: v0.9.6
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The string representation of the local IP address the remote client is
connecting on. For example, in a server listening on `'0.0.0.0'`, if a client
connects on `'192.168.1.1'`, the value of `socket.localAddress` would be
`'192.168.1.1'`.

### `socket.localPort`

<!-- YAML
added: v0.9.6
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The numeric representation of the local port. For example, `80` or `21`.

### `socket.localFamily`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The string representation of the local IP family. `'IPv4'` or `'IPv6'`.

### `socket.pause()`

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Pauses the reading of data. That is, [`'data'`][`'data'`] events will not be emitted.
Useful to throttle back an upload.

### `socket.pending`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

This is `true` if the socket is not connected yet, either because `.connect()`
has not yet been called or because it is still in the process of connecting
(see [`socket.connecting`][`socket.connecting`]).

### `socket.ref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Opposite of `unref()`, calling `ref()` on a previously `unref`ed socket will
_not_ let the program exit if it's the only socket left (the default behavior).
If the socket is `ref`ed calling `ref` again will have no effect.

### `socket.remoteAddress`

<!-- YAML
added: v0.5.10
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The string representation of the remote IP address. For example,
`'74.125.127.100'` or `'2001:4860:a005::68'`. Value may be `undefined` if
the socket is destroyed (for example, if the client disconnected).

### `socket.remoteFamily`

<!-- YAML
added: v0.11.14
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The string representation of the remote IP family. `'IPv4'` or `'IPv6'`. Value may be `undefined` if
the socket is destroyed (for example, if the client disconnected).

### `socket.remotePort`

<!-- YAML
added: v0.5.10
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The numeric representation of the remote port. For example, `80` or `21`. Value may be `undefined` if
the socket is destroyed (for example, if the client disconnected).

### `socket.resetAndDestroy()`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Close the TCP connection by sending an RST packet and destroy the stream.
If this TCP socket is in connecting status, it will send an RST packet and destroy this TCP socket once it is connected.
Otherwise, it will call `socket.destroy` with an `ERR_SOCKET_CLOSED` Error.
If this is not a TCP socket (for example, a pipe), calling this method will immediately throw an `ERR_INVALID_HANDLE_TYPE` Error.

### `socket.resume()`

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Resumes reading after a call to [`socket.pause()`][`socket.pause()`].

### `socket.setEncoding([encoding])`

<!-- YAML
added: v0.1.90
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Set the encoding for the socket as a [Readable Stream][Readable Stream]. See
[`readable.setEncoding()`][`readable.setEncoding()`] for more information.

### `socket.setKeepAlive([enable][, initialDelay])`

<!-- YAML
added: v0.1.92
changes:
  - version:
    - v13.12.0
    - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32204
    description: New defaults for `TCP_KEEPCNT` and `TCP_KEEPINTVL` socket options were added.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.12.0, v12.17.0 | Были добавлены новые значения по умолчанию для параметров сокетов TCP_KEEPCNT и TCP_KEEPINTVL. |

* `enable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **Default:** `false`
* `initialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **Default:** `0`
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Enable/disable keep-alive functionality, and optionally set the initial
delay before the first keepalive probe is sent on an idle socket.

Set `initialDelay` (in milliseconds) to set the delay between the last
data packet received and the first keepalive probe. Setting `0` for
`initialDelay` will leave the value unchanged from the default
(or previous) setting.

Enabling the keep-alive functionality will set the following socket options:

* `SO_KEEPALIVE=1`
* `TCP_KEEPIDLE=initialDelay`
* `TCP_KEEPCNT=10`
* `TCP_KEEPINTVL=1`

### `socket.setNoDelay([noDelay])`

<!-- YAML
added: v0.1.90
-->

* `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **Default:** `true`
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Enable/disable the use of Nagle's algorithm.

When a TCP connection is created, it will have Nagle's algorithm enabled.

Nagle's algorithm delays data before it is sent via the network. It attempts
to optimize throughput at the expense of latency.

Passing `true` for `noDelay` or not passing an argument will disable Nagle's
algorithm for the socket. Passing `false` for `noDelay` will enable Nagle's
algorithm.

### `socket.setTimeout(timeout[, callback])`

<!-- YAML
added: v0.1.90
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Sets the socket to timeout after `timeout` milliseconds of inactivity on
the socket. By default `net.Socket` do not have a timeout.

When an idle timeout is triggered the socket will receive a [`'timeout'`][`'timeout'`]
event but the connection will not be severed. The user must manually call
[`socket.end()`][`socket.end()`] or [`socket.destroy()`][`socket.destroy()`] to end the connection.

```js
socket.setTimeout(3000);
socket.on('timeout', () => {
  console.log('socket timeout');
  socket.end();
});
```

If `timeout` is 0, then the existing idle timeout is disabled.

The optional `callback` parameter will be added as a one-time listener for the
[`'timeout'`][`'timeout'`] event.

### `socket.getTypeOfService()`

<!-- YAML
added: v25.6.0
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The current TOS value.

Returns the current Type of Service (TOS) field for IPv4 packets or Traffic
Class for IPv6 packets for this socket.

`setTypeOfService()` may be called before the socket is connected; the value
will be cached and applied when the socket establishes a connection.
`getTypeOfService()` will return the currently set value even before connection.

On some platforms (e.g., Linux), certain TOS/ECN bits may be masked or ignored,
and behavior can differ between IPv4 and IPv6 or dual-stack sockets. Callers
should verify platform-specific semantics.

### `socket.setTypeOfService(tos)`

<!-- YAML
added: v25.6.0
-->

* `tos` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The TOS value to set (0-255).
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Sets the Type of Service (TOS) field for IPv4 packets or Traffic Class for IPv6
Packets sent from this socket. This can be used to prioritize network traffic.

`setTypeOfService()` may be called before the socket is connected; the value
will be cached and applied when the socket establishes a connection.
`getTypeOfService()` will return the currently set value even before connection.

On some platforms (e.g., Linux), certain TOS/ECN bits may be masked or ignored,
and behavior can differ between IPv4 and IPv6 or dual-stack sockets. Callers
should verify platform-specific semantics.

### `socket.timeout`

<!-- YAML
added: v10.7.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

The socket timeout in milliseconds as set by [`socket.setTimeout()`][`socket.setTimeout()`].
It is `undefined` if a timeout has not been set.

### `socket.unref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The socket itself.

Calling `unref()` on a socket will allow the program to exit if this is the only
active socket in the event system. If the socket is already `unref`ed calling
`unref()` again will have no effect.

### `socket.write(data[, encoding][, callback])`

<!-- YAML
added: v0.1.90
-->

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Only used when data is `string`. **Default:** `utf8`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Sends data on the socket. The second parameter specifies the encoding in the
case of a string. It defaults to UTF8 encoding.

Returns `true` if the entire data was flushed successfully to the kernel
buffer. Returns `false` if all or part of the data was queued in user memory.
[`'drain'`][`'drain'`] will be emitted when the buffer is again free.

The optional `callback` parameter will be executed when the data is finally
written out, which may not be immediately.

See `Writable` stream [`write()`][stream_writable_write] method for more
information.

### `socket.readyState`

<!-- YAML
added: v0.5.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

This property represents the state of the connection as a string.

* If the stream is connecting `socket.readyState` is `opening`.
* If the stream is readable and writable, it is `open`.
* If the stream is readable and not writable, it is `readOnly`.
* If the stream is not readable and writable, it is `writeOnly`.

## `net.connect()`

Aliases to
[`net.createConnection()`][`net.createConnection()`].

Possible signatures:

* [`net.connect(options[, connectListener])`][`net.connect(options)`]
* [`net.connect(path[, connectListener])`][`net.connect(path)`] for [IPC][IPC]
  connections.
* [`net.connect(port[, host][, connectListener])`][`net.connect(port, host)`]
  for TCP connections.

### `net.connect(options[, connectListener])`

<!-- YAML
added: v0.7.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Alias to
[`net.createConnection(options[, connectListener])`][`net.createConnection(options)`].

### `net.connect(path[, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Alias to
[`net.createConnection(path[, connectListener])`][`net.createConnection(path)`].

### `net.connect(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Alias to
[`net.createConnection(port[, host][, connectListener])`][`net.createConnection(port, host)`].

## `net.createConnection()`

A factory function, which creates a new [`net.Socket`][`net.Socket`],
immediately initiates connection with [`socket.connect()`][`socket.connect()`],
then returns the `net.Socket` that starts the connection.

When the connection is established, a [`'connect'`][`'connect'`] event will be emitted
on the returned socket. The last parameter `connectListener`, if supplied,
will be added as a listener for the [`'connect'`][`'connect'`] event **once**.

Possible signatures:

* [`net.createConnection(options[, connectListener])`][`net.createConnection(options)`]
* [`net.createConnection(path[, connectListener])`][`net.createConnection(path)`]
  for [IPC][IPC] connections.
* [`net.createConnection(port[, host][, connectListener])`][`net.createConnection(port, host)`]
  for TCP connections.

The [`net.connect()`][`net.connect()`] function is an alias to this function.

### `net.createConnection(options[, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Required. Will be passed to both the
  [`new net.Socket([options])`][`new net.Socket(options)`] call and the
  [`socket.connect(options[, connectListener])`][`socket.connect(options)`]
  method.
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Common parameter of the
  [`net.createConnection()`][`net.createConnection()`] functions. If supplied, will be added as
  a listener for the [`'connect'`][`'connect'`] event on the returned socket once.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The newly created socket used to start the connection.

For available options, see
[`new net.Socket([options])`][`new net.Socket(options)`]
and [`socket.connect(options[, connectListener])`][`socket.connect(options)`].

Additional options:

* `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If set, will be used to call
  [`socket.setTimeout(timeout)`][`socket.setTimeout(timeout)`] after the socket is created, but before
  it starts the connection.

Following is an example of a client of the echo server described
in the [`net.createServer()`][`net.createServer()`] section:

=== "MJS"

    ```js
    import net from 'node:net';
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

=== "CJS"

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

To connect on the socket `/tmp/echo.sock`:

```js
const client = net.createConnection({ path: '/tmp/echo.sock' });
```

Following is an example of a client using the `port` and `onread`
option. In this case, the `onread` option will be only used to call
`new net.Socket([options])` and the `port` option will be used to
call `socket.connect(options[, connectListener])`.

=== "MJS"

    ```js
    import net from 'node:net';
    import { Buffer } from 'node:buffer';
    net.createConnection({
      port: 8124,
      onread: {
        // Reuses a 4KiB Buffer for every read from the socket.
        buffer: Buffer.alloc(4 * 1024),
        callback: function(nread, buf) {
          // Received data is available in `buf` from 0 to `nread`.
          console.log(buf.toString('utf8', 0, nread));
        },
      },
    });
    ```

=== "CJS"

    ```js
    const net = require('node:net');
    net.createConnection({
      port: 8124,
      onread: {
        // Reuses a 4KiB Buffer for every read from the socket.
        buffer: Buffer.alloc(4 * 1024),
        callback: function(nread, buf) {
          // Received data is available in `buf` from 0 to `nread`.
          console.log(buf.toString('utf8', 0, nread));
        },
      },
    });
    ```

### `net.createConnection(path[, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Path the socket should connect to. Will be passed to
  [`socket.connect(path[, connectListener])`][`socket.connect(path)`].
  See [Identifying paths for IPC connections][Identifying paths for IPC connections].
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Common parameter of the
  [`net.createConnection()`][`net.createConnection()`] functions, an "once" listener for the
  `'connect'` event on the initiating socket. Will be passed to
  [`socket.connect(path[, connectListener])`][`socket.connect(path)`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The newly created socket used to start the connection.

Initiates an [IPC][IPC] connection.

This function creates a new [`net.Socket`][`net.Socket`] with all options set to default,
immediately initiates connection with
[`socket.connect(path[, connectListener])`][`socket.connect(path)`],
then returns the `net.Socket` that starts the connection.

### `net.createConnection(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Port the socket should connect to. Will be passed to
  [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`].
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Host the socket should connect to. Will be passed to
  [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`].
  **Default:** `'localhost'`.
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Common parameter of the
  [`net.createConnection()`][`net.createConnection()`] functions, an "once" listener for the
  `'connect'` event on the initiating socket. Will be passed to
  [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) The newly created socket used to start the connection.

Initiates a TCP connection.

This function creates a new [`net.Socket`][`net.Socket`] with all options set to default,
immediately initiates connection with
[`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`],
then returns the `net.Socket` that starts the connection.

## `net.createServer([options][, connectionListener])`

<!-- YAML
added: v0.5.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47405
    description: The `highWaterMark` option is supported now.
  - version:
    - v17.7.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41310
    description: The `noDelay`, `keepAlive`, and `keepAliveInitialDelay`
                 options are supported now.
-->

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Опция highWaterMark теперь поддерживается. |
    | v17.7.0, v16.15.0 | Параметры noDelay, KeepAlive и KeepAliveInitialDelay теперь поддерживаются. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `false`, then the socket will
    automatically end the writable side when the readable side ends.
    **Default:** `false`.
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optionally overrides all [`net.Socket`][`net.Socket`]s'
    `readableHighWaterMark` and `writableHighWaterMark`.
    **Default:** See [`stream.getDefaultHighWaterMark()`][`stream.getDefaultHighWaterMark()`].
  * `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `true`, it enables keep-alive functionality
    on the socket immediately after a new incoming connection is received,
    similarly on what is done in [`socket.setKeepAlive()`][`socket.setKeepAlive()`]. **Default:**
    `false`.
  * `keepAliveInitialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If set to a positive number, it sets the
    initial delay before the first keepalive probe is sent on an idle socket.
    **Default:** `0`.
  * `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `true`, it disables the use of Nagle's
    algorithm immediately after a new incoming connection is received.
    **Default:** `false`.
  * `pauseOnConnect` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether the socket should be
    paused on incoming connections. **Default:** `false`.
  * `blockList` [`<net.BlockList>`](net.md) `blockList` can be used for disabling inbound
    access to specific IP addresses, IP ranges, or IP subnets. This does not
    work if the server is behind a reverse proxy, NAT, etc. because the address
    checked against the block list is the address of the proxy, or the one
    specified by the NAT.

* `connectionListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Automatically set as a listener for the
  [`'connection'`][`'connection'`] event.

* Возвращает: [`<net.Server>`](net.md#class-netserver)

Creates a new TCP or [IPC][IPC] server.

If `allowHalfOpen` is set to `true`, when the other end of the socket
signals the end of transmission, the server will only send back the end of
transmission when [`socket.end()`][`socket.end()`] is explicitly called. For example, in the
context of TCP, when a FIN packed is received, a FIN packed is sent
back only when [`socket.end()`][`socket.end()`] is explicitly called. Until then the
connection is half-closed (non-readable but still writable). See [`'end'`][`'end'`]
event and [RFC 1122][half-closed] (section 4.2.2.13) for more information.

If `pauseOnConnect` is set to `true`, then the socket associated with each
incoming connection will be paused, and no data will be read from its handle.
This allows connections to be passed between processes without any data being
read by the original process. To begin reading data from a paused socket, call
[`socket.resume()`][`socket.resume()`].

The server can be a TCP server or an [IPC][IPC] server, depending on what it
[`listen()`][`server.listen()`] to.

Here is an example of a TCP echo server which listens for connections
on port 8124:

=== "MJS"

    ```js
    import net from 'node:net';
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

=== "CJS"

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

Test this by using `telnet`:

```bash
telnet localhost 8124
```

To listen on the socket `/tmp/echo.sock`:

```js
server.listen('/tmp/echo.sock', () => {
  console.log('server bound');
});
```

Use `nc` to connect to a Unix domain socket server:

```bash
nc -U /tmp/echo.sock
```

## `net.getDefaultAutoSelectFamily()`

<!-- YAML
added: v19.4.0
-->

Gets the current default value of the `autoSelectFamily` option of [`socket.connect(options)`][`socket.connect(options)`].
The initial default value is `true`, unless the command line option
`--no-network-family-autoselection` is provided.

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) The current default value of the `autoSelectFamily` option.

## `net.setDefaultAutoSelectFamily(value)`

<!-- YAML
added: v19.4.0
-->

Sets the default value of the `autoSelectFamily` option of [`socket.connect(options)`][`socket.connect(options)`].

* `value` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) The new default value.
  The initial default value is `true`, unless the command line option
  `--no-network-family-autoselection` is provided.

## `net.getDefaultAutoSelectFamilyAttemptTimeout()`

<!-- YAML
added:
 - v19.8.0
 - v18.18.0
-->

Gets the current default value of the `autoSelectFamilyAttemptTimeout` option of [`socket.connect(options)`][`socket.connect(options)`].
The initial default value is `500` or the value specified via the command line
option `--network-family-autoselection-attempt-timeout`.

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The current default value of the `autoSelectFamilyAttemptTimeout` option.

## `net.setDefaultAutoSelectFamilyAttemptTimeout(value)`

<!-- YAML
added:
 - v19.8.0
 - v18.18.0
-->

Sets the default value of the `autoSelectFamilyAttemptTimeout` option of [`socket.connect(options)`][`socket.connect(options)`].

* `value` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The new default value, which must be a positive number. If the number is less than `10`,
  the value `10` is used instead. The initial default value is `250` or the value specified via the command line
  option `--network-family-autoselection-attempt-timeout`.

## `net.isIP(input)`

<!-- YAML
added: v0.3.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Returns `6` if `input` is an IPv6 address. Returns `4` if `input` is an IPv4
address in [dot-decimal notation][dot-decimal notation] with no leading zeroes. Otherwise, returns
`0`.

```js
net.isIP('::1'); // returns 6
net.isIP('127.0.0.1'); // returns 4
net.isIP('127.000.000.001'); // returns 0
net.isIP('127.0.0.1/24'); // returns 0
net.isIP('fhqwhgads'); // returns 0
```

## `net.isIPv4(input)`

<!-- YAML
added: v0.3.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if `input` is an IPv4 address in [dot-decimal notation][dot-decimal notation] with no
leading zeroes. Otherwise, returns `false`.

```js
net.isIPv4('127.0.0.1'); // returns true
net.isIPv4('127.000.000.001'); // returns false
net.isIPv4('127.0.0.1/24'); // returns false
net.isIPv4('fhqwhgads'); // returns false
```

## `net.isIPv6(input)`

<!-- YAML
added: v0.3.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if `input` is an IPv6 address. Otherwise, returns `false`.

```js
net.isIPv6('::1'); // returns true
net.isIPv6('fhqwhgads'); // returns false
```

[IPC]: #ipc-support
[Identifying paths for IPC connections]: #identifying-paths-for-ipc-connections
[RFC 8305]: https://www.rfc-editor.org/rfc/rfc8305.txt
[Readable Stream]: stream.md#class-streamreadable
[`'close'`]: #event-close
[`'connect'`]: #event-connect
[`'connection'`]: #event-connection
[`'data'`]: #event-data
[`'drain'`]: #event-drain
[`'end'`]: #event-end
[`'error'`]: #event-error_1
[`'listening'`]: #event-listening
[`'timeout'`]: #event-timeout
[`EventEmitter`]: events.md#class-eventemitter
[`child_process.fork()`]: child_process.md#child_processforkmodulepath-args-options
[`dns.lookup()`]: dns.md#dnslookuphostname-options-callback
[`dns.lookup()` hints]: dns.md#supported-getaddrinfo-flags
[`net.Server`]: #class-netserver
[`net.Socket`]: #class-netsocket
[`net.connect()`]: #netconnect
[`net.connect(options)`]: #netconnectoptions-connectlistener
[`net.connect(path)`]: #netconnectpath-connectlistener
[`net.connect(port, host)`]: #netconnectport-host-connectlistener
[`net.createConnection()`]: #netcreateconnection
[`net.createConnection(options)`]: #netcreateconnectionoptions-connectlistener
[`net.createConnection(path)`]: #netcreateconnectionpath-connectlistener
[`net.createConnection(port, host)`]: #netcreateconnectionport-host-connectlistener
[`net.createServer()`]: #netcreateserveroptions-connectionlistener
[`net.getDefaultAutoSelectFamily()`]: #netgetdefaultautoselectfamily
[`net.getDefaultAutoSelectFamilyAttemptTimeout()`]: #netgetdefaultautoselectfamilyattempttimeout
[`new net.Socket(options)`]: #new-netsocketoptions
[`readable.setEncoding()`]: stream.md#readablesetencodingencoding
[`server.close()`]: #serverclosecallback
[`server.dropMaxConnection`]: #serverdropmaxconnection
[`server.listen()`]: #serverlisten
[`server.listen(handle)`]: #serverlistenhandle-backlog-callback
[`server.listen(options)`]: #serverlistenoptions-callback
[`server.listen(path)`]: #serverlistenpath-backlog-callback
[`server.listen(port)`]: #serverlistenport-host-backlog-callback
[`server.maxConnections`]: #servermaxconnections
[`socket(7)`]: https://man7.org/linux/man-pages/man7/socket.7.html
[`socket.connect()`]: #socketconnect
[`socket.connect(options)`]: #socketconnectoptions-connectlistener
[`socket.connect(path)`]: #socketconnectpath-connectlistener
[`socket.connect(port)`]: #socketconnectport-host-connectlistener
[`socket.connecting`]: #socketconnecting
[`socket.destroy()`]: #socketdestroyerror
[`socket.end()`]: #socketenddata-encoding-callback
[`socket.pause()`]: #socketpause
[`socket.resume()`]: #socketresume
[`socket.setEncoding()`]: #socketsetencodingencoding
[`socket.setKeepAlive()`]: #socketsetkeepaliveenable-initialdelay
[`socket.setTimeout()`]: #socketsettimeouttimeout-callback
[`socket.setTimeout(timeout)`]: #socketsettimeouttimeout-callback
[`stream.getDefaultHighWaterMark()`]: stream.md#streamgetdefaulthighwatermarkobjectmode
[`writable.destroy()`]: stream.md#writabledestroyerror
[`writable.destroyed`]: stream.md#writabledestroyed
[`writable.end()`]: stream.md#writableendchunk-encoding-callback
[`writable.writableLength`]: stream.md#writablewritablelength
[dot-decimal notation]: https://en.wikipedia.org/wiki/Dot-decimal_notation
[half-closed]: https://tools.ietf.org/html/rfc1122
[stream_writable_write]: stream.md#writablewritechunk-encoding-callback
[unspecified IPv4 address]: https://en.wikipedia.org/wiki/0.0.0.0
[unspecified IPv6 address]: https://en.wikipedia.org/wiki/IPv6_address#Unspecified_address
