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

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список правил, добавленных в блок-лист.

### `BlockList.isBlockList(value)`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное значение JavaScript
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

* `value` — данные в том же формате, что и `blockList.rules`

### `blockList.toJSON()`

> Стабильность: 1 — Экспериментальная

 <!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

* Возвращает: то же, что и `blockList.rules`

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
* `backlog` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий параметр функций [`server.listen()`][`server.listen()`]
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

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Доступные опции:
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, сокет автоматически завершит запись,
    когда закончится чтение. Подробнее см. [`net.createServer()`][`net.createServer()`] и событие [`'end'`][`'end'`]. **По умолчанию:**
    `false`.
  * `blockList` [`<net.BlockList>`](net.md) `blockList` можно использовать, чтобы запретить исходящий
    доступ к заданным IP-адресам, диапазонам или подсетям.
  * `fd` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если указан, оборачивает уже существующий сокет с
    данным файловым дескриптором, иначе создаётся новый сокет.
  * `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сразу после установления соединения включает keep-alive для
    сокета, аналогично [`socket.setKeepAlive()`][`socket.setKeepAlive()`]. **По умолчанию:** `false`.
  * `keepAliveInitialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задано положительное число, задаёт
    начальную задержку перед первой пробой keep-alive на простаивающем сокете. **По умолчанию:** `0`.
  * `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сразу после установления соединения отключает алгоритм Нейгла.
    **По умолчанию:** `false`.
  * `onread` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если указан, входящие данные складываются в один `buffer`
    и передаются в заданный `callback` по мере поступления данных в сокет.
    При этом потоковый режим не отдаёт данные через обычный механизм чтения.
    Сокет по-прежнему испускает события вроде `'error'`, `'end'` и `'close'`.
    Методы `pause()` и `resume()` ведут себя как ожидается.
    * `buffer` [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Переиспользуемый фрагмент памяти для
      входящих данных или функция, возвращающая такой фрагмент.
    * `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается для каждого фрагмента входящих
      данных. Передаются два аргумента: число записанных в `buffer` байт и ссылка на `buffer`. Верните `false`, чтобы
      неявно вызвать `pause()` у сокета. Функция выполняется в
      глобальном контексте.
  * `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Разрешить чтение с сокета при переданном `fd`,
    иначе игнорируется. **По умолчанию:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал прерывания, которым можно уничтожить
    сокет.
  * `typeOfService` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Начальное значение Type of Service (TOS).
  * `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Разрешить запись в сокет при переданном `fd`,
    иначе игнорируется. **По умолчанию:** `false`.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Создаёт новый объект сокета.

Новый сокет может быть TCP или потоковой [IPC][IPC]-конечной точкой в зависимости от того, к чему затем вызывается [`connect()`][`socket.connect()`].

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

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) IP-адрес, к которому сокет пытается подключиться.
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт, к которому сокет пытается подключиться.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство адреса: `6` для IPv6 или `4` для IPv4.

Генерируется при начале новой попытки соединения. Может повторяться,
если в [`socket.connect(options)`][`socket.connect(options)`] включён автоподбор семейства адреса.

### Событие: `'connectionAttemptFailed'`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) IP-адрес, к которому выполнялась попытка подключения.
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт, к которому выполнялась попытка подключения.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство адреса: `6` для IPv6 или `4` для IPv4.
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка, связанная с неудачей.

Генерируется при неудачной попытке соединения. Может повторяться,
если в [`socket.connect(options)`][`socket.connect(options)`] включён автоподбор семейства адреса.

### Событие: `'connectionAttemptTimeout'`

<!-- YAML
added:
  - v21.6.0
  - v20.12.0
-->

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) IP-адрес, к которому выполнялась попытка подключения.
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт, к которому выполнялась попытка подключения.
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство адреса: `6` для IPv6 или `4` для IPv4.

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

Возвращает привязанный `address`, имя семейства `family` и `port` сокета,
как сообщает ОС:
`{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`

### `socket.autoSelectFamilyAttemptedAddresses`

<!-- YAML
added:
 - v19.4.0
 - v18.18.0
-->

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство есть только если в [`socket.connect(options)`][`socket.connect(options)`] включён алгоритм автоподбора семейства адреса;
значение — массив адресов, к которым уже были попытки подключения.

Каждый адрес — строка вида `$IP:$PORT`. Если соединение установлено,
последний элемент — адрес, к которому сокет подключён в итоге.

### `socket.bufferSize`

<!-- YAML
added: v0.3.8
deprecated:
  - v14.6.0
-->

> Стабильность: 0 — устарело: используйте [`writable.writableLength`][`writable.writableLength`].

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Показывает число символов, буферизованных для записи. Буфер
может содержать строки, длина которых после кодирования ещё неизвестна, поэтому число
лишь приближённо отражает объём байт в буфере.

У `net.Socket` такое свойство: `socket.write()` всегда выполняется без немедленной ошибки — это
упрощает старт. Но система не всегда успевает отправлять
весь объём данных в сокет. Сеть может быть слишком медленной. Node.js ставит записанные данные во внутреннюю очередь
и отправляет их по мере возможности.

Из-за такой буферизации может расти потребление памяти.
Если `bufferSize` большой или растёт, имеет смысл ограничить поток данных в программе с помощью
[`socket.pause()`][`socket.pause()`] и [`socket.resume()`][`socket.resume()`].

### `socket.bytesRead`

<!-- YAML
added: v0.5.3
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число полученных байт.

### `socket.bytesWritten`

<!-- YAML
added: v0.5.3
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число отправленных байт.

### `socket.connect()`

Инициирует соединение на данном сокете.

Возможные сигнатуры:

* [`socket.connect(options[, connectListener])`][`socket.connect(options)`]
* [`socket.connect(path[, connectListener])`][`socket.connect(path)`]
  для [IPC][IPC]-соединений.
* [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`]
  для TCP-соединений.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Функция асинхронна. Когда соединение установлено, испускается событие
[`'connect'`][`'connect'`]. При ошибке подключения вместо [`'connect'`][`'connect'`] испускается [`'error'`][`'error'`] с
ошибкой для слушателя [`'error'`][`'error'`].
Последний параметр `connectListener`, если он задан, добавляется как слушатель
события [`'connect'`][`'connect'`] **один раз**.

Использовать эту функцию следует только для повторного подключения сокета после
события `'close'`; иначе возможно неопределённое поведение.

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
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Общий параметр методов [`socket.connect()`][`socket.connect()`]:
  добавляется как однократный слушатель события [`'connect'`][`'connect'`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Инициирует соединение на данном сокете. Обычно этот метод не нужен:
сокет создают и открывают через [`net.createConnection()`][`net.createConnection()`]. Используйте
его при собственной реализации `Socket`.

Для TCP доступны такие `options`:

* `autoSelectFamily` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type): при `true` включается алгоритм автоподбора семейства адреса,
  в общих чертах соответствующий разделу 5 [RFC 8305][RFC 8305]. Для lookup задаётся
  `all: true`, сокет по очереди пытается подключиться ко всем полученным IPv6- и IPv4-адресам, пока не
  установится соединение. Сначала пробуется первый полученный AAAA, затем первый A, затем второй AAAA и
  так далее. Каждой попытке (кроме последней) отводится время
  `autoSelectFamilyAttemptTimeout` до таймаута и перехода к следующему адресу. Опция игнорируется, если `family` не `0` или задан
  `localAddress`. Ошибки отдельных попыток не испускаются, если хотя бы одно
  соединение удалось. Если все попытки неудачны, испускается один
  `AggregateError` со всеми ошибками. **По умолчанию:**
  [`net.getDefaultAutoSelectFamily()`][`net.getDefaultAutoSelectFamily()`].
* `autoSelectFamilyAttemptTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type): время в миллисекундах,
  сколько ждать завершения попытки подключения перед следующим адресом при
  использовании `autoSelectFamily`. Если передано целое меньше
  `10`, вместо него используется `10`. **По умолчанию:**
  [`net.getDefaultAutoSelectFamilyAttemptTimeout()`][`net.getDefaultAutoSelectFamilyAttemptTimeout()`].
* `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type): версия стека IP. Должно быть `4`, `6` или `0`. Значение
  `0` допускает и IPv4, и IPv6. **По умолчанию:** `0`.
* `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательные [`подсказки для dns.lookup()`][`dns.lookup()` hints].
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост для подключения. **По умолчанию:** `'localhost'`.
* `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный адрес, с которого подключаться.
* `localPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Локальный порт, с которого подключаться.
* `lookup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция разрешения имён. **По умолчанию:** [`dns.lookup()`][`dns.lookup()`].
* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен. Порт для подключения.

Для [IPC][IPC] доступны такие `options`:

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Обязателен. Путь, к которому подключается клиент.
  См. [Пути для IPC-соединений][Identifying paths for IPC connections]. Если задан `path`, перечисленные выше TCP-опции
  игнорируются.

#### `socket.connect(path[, connectListener])`

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь для подключения клиента. См.
  [Пути для IPC-соединений][Identifying paths for IPC connections].
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Общий параметр методов [`socket.connect()`][`socket.connect()`]:
  добавляется как однократный слушатель события [`'connect'`][`'connect'`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Инициирует [IPC][IPC]-соединение на данном сокете.

Синоним вызова
[`socket.connect(options[, connectListener])`][`socket.connect(options)`]
с `options` вида `{ path: path }`.

#### `socket.connect(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт, к которому подключается клиент.
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост, к которому подключается клиент.
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Общий параметр методов [`socket.connect()`][`socket.connect()`]:
  добавляется как однократный слушатель события [`'connect'`][`'connect'`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Инициирует TCP-соединение на данном сокете.

Синоним вызова
[`socket.connect(options[, connectListener])`][`socket.connect(options)`]
с `options` вида `{ port: port, host: host }`.

### `socket.connecting`

<!-- YAML
added: v6.1.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если был вызван
[`socket.connect(options[, connectListener])`][`socket.connect(options)`], который ещё не завершился. Остаётся `true`, пока сокет не станет
подключённым, затем сбрасывается в `false` и испускается `'connect'`. Обратите внимание:
обратный вызов
[`socket.connect(options[, connectListener])`][`socket.connect(options)`]
является слушателем события `'connect'`.

### `socket.destroy([error])`

<!-- YAML
added: v0.1.90
-->

* `error` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Гарантирует отсутствие дальнейшего ввода-вывода на этом сокете.
Уничтожает поток и закрывает соединение.

Подробнее см. [`writable.destroy()`][`writable.destroy()`].

### `socket.destroyed`

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Показывает, уничтожено ли соединение. После уничтожения
  передавать данные через сокет нельзя.

См. [`writable.destroyed`][`writable.destroyed`].

### `socket.destroySoon()`

<!-- YAML
added: v0.3.4
-->

Уничтожает сокет после записи всех данных. Если событие `'finish'` уже было
испущено, сокет уничтожается сразу. Если сокет ещё доступен для записи,
неявно вызывается `socket.end()`.

### `socket.end([data[, encoding]][, callback])`

<!-- YAML
added: v0.1.90
-->

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используется только если `data` — строка. **По умолчанию:** `'utf8'`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательный обратный вызов по завершении сокета.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Полузакрывает сокет: отправляется пакет FIN. Удалённый сервер всё ещё может
отправить данные.

См. [`writable.end()`][`writable.end()`].

### `socket.localAddress`

<!-- YAML
added: v0.9.6
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление локального IP, на котором удалённый клиент
установил соединение. Например, если сервер слушает `'0.0.0.0'`, а клиент
подключился к `'192.168.1.1'`, то `socket.localAddress` будет
`'192.168.1.1'`.

### `socket.localPort`

<!-- YAML
added: v0.9.6
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Числовое представление локального порта. Например, `80` или `21`.

### `socket.localFamily`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление локального семейства IP: `'IPv4'` или `'IPv6'`.

### `socket.pause()`

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Приостанавливает чтение: события [`'data'`][`'data'`] не испускаются.
Удобно для ограничения скорости отправки (например, загрузки).

### `socket.pending`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если сокет ещё не подключён: либо `.connect()` ещё не вызывали, либо подключение ещё идёт
(см. [`socket.connecting`][`socket.connecting`]).

### `socket.ref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Противоположность `unref()`: вызов `ref()` у ранее отвязанного (`unref`) сокета снова
удержит процесс, если это единственный оставшийся сокет (поведение по умолчанию).
Если сокет уже `ref`, повторный `ref()` не действует.

### `socket.remoteAddress`

<!-- YAML
added: v0.5.10
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление удалённого IP. Например,
`'74.125.127.100'` или `'2001:4860:a005::68'`. Может быть `undefined`, если
сокет уничтожен (например, клиент отключился).

### `socket.remoteFamily`

<!-- YAML
added: v0.11.14
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление семейства удалённого IP: `'IPv4'` или `'IPv6'`. Может быть `undefined`, если
сокет уничтожен (например, клиент отключился).

### `socket.remotePort`

<!-- YAML
added: v0.5.10
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Числовое представление удалённого порта. Например, `80` или `21`. Может быть `undefined`, если
сокет уничтожен (например, клиент отключился).

### `socket.resetAndDestroy()`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Закрывает TCP-соединение пакетом RST и уничтожает поток.
Если TCP-сокет ещё в состоянии подключения, RST будет отправлен и сокет уничтожен после установления соединения.
Иначе будет вызван `socket.destroy` с ошибкой `ERR_SOCKET_CLOSED`.
Если это не TCP-сокет (например, pipe), метод сразу выбросит `ERR_INVALID_HANDLE_TYPE`.

### `socket.resume()`

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Возобновляет чтение после [`socket.pause()`][`socket.pause()`].

### `socket.setEncoding([encoding])`

<!-- YAML
added: v0.1.90
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Задаёт кодировку сокета как [читаемого потока][Readable Stream]. См.
[`readable.setEncoding()`][`readable.setEncoding()`].

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

* `enable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
* `initialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Включает или отключает keep-alive и при необходимости задаёт начальную
задержку перед первой пробой keep-alive на простаивающем сокете.

`initialDelay` (в миллисекундах) — интервал между последним
полученным пакетом данных и первой пробой keep-alive. Значение `0` для
`initialDelay` оставляет параметр без изменения относительно значения по умолчанию
(или предыдущей настройки).

При включении keep-alive задаются следующие параметры сокета:

* `SO_KEEPALIVE=1`
* `TCP_KEEPIDLE=initialDelay`
* `TCP_KEEPCNT=10`
* `TCP_KEEPINTVL=1`

### `socket.setNoDelay([noDelay])`

<!-- YAML
added: v0.1.90
-->

* `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Включает или отключает алгоритм Нейгла.

При создании TCP-соединения алгоритм Нейгла включён.

Алгоритм Нейгла откладывает отправку данных по сети, стремясь
повысить пропускную способность в ущерб задержке.

Передать `true` в `noDelay` или не передавать аргумент — отключить алгоритм Нейгла
для сокета. Передать `false` — включить алгоритм Нейгла.

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
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Устанавливает таймаут сокета после `timeout` миллисекунд неактивности.
По умолчанию у `net.Socket` таймаута нет.

При срабатывании таймаута простоя сокет получает событие [`'timeout'`][`'timeout'`],
но соединение не разрывается — нужно явно вызвать
[`socket.end()`][`socket.end()`] или [`socket.destroy()`][`socket.destroy()`].

```js
socket.setTimeout(3000);
socket.on('timeout', () => {
  console.log('socket timeout');
  socket.end();
});
```

Если `timeout` равен `0`, текущий таймаут простоя отключается.

Необязательный `callback` добавляется как однократный слушатель события
[`'timeout'`][`'timeout'`].

### `socket.getTypeOfService()`

<!-- YAML
added: v25.6.0
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Текущее значение TOS.

Возвращает текущее поле Type of Service (TOS) для IPv4-пакетов или Traffic
Class для IPv6-пакетов этого сокета.

`setTypeOfService()` можно вызвать до подключения; значение
кэшируется и применяется при установлении соединения.
`getTypeOfService()` возвращает установленное значение и до подключения.

На некоторых платформах (например, Linux) отдельные биты TOS/ECN могут маскироваться или игнорироваться,
поведение может различаться для IPv4, IPv6 и dual-stack. Вызывающему коду
стоит сверяться с особенностями платформы.

### `socket.setTypeOfService(tos)`

<!-- YAML
added: v25.6.0
-->

* `tos` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение TOS (0–255).
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Задаёт поле Type of Service (TOS) для IPv4-пакетов или Traffic Class для IPv6-
пакетов, отправляемых с этого сокета. Можно использовать для приоритизации трафика.

`setTypeOfService()` можно вызвать до подключения; значение
кэшируется и применяется при установлении соединения.
`getTypeOfService()` возвращает установленное значение и до подключения.

На некоторых платформах (например, Linux) отдельные биты TOS/ECN могут маскироваться или игнорироваться,
поведение может различаться для IPv4, IPv6 и dual-stack. Вызывающему коду
стоит сверяться с особенностями платформы.

### `socket.timeout`

<!-- YAML
added: v10.7.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

Таймаут сокета в миллисекундах, заданный [`socket.setTimeout()`][`socket.setTimeout()`].
`undefined`, если таймаут не устанавливали.

### `socket.unref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Тот же экземпляр сокета.

Вызов `unref()` позволяет процессу завершиться, если это единственный
активный сокет в системе событий. Если сокет уже отвязан (`unref`), повторный
`unref()` не действует.

### `socket.write(data[, encoding][, callback])`

<!-- YAML
added: v0.1.90
-->

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используется только если `data` — строка. **По умолчанию:** `utf8`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отправляет данные через сокет. Второй аргумент задаёт кодировку для
строки. По умолчанию — UTF-8.

Возвращает `true`, если все данные успешно сброшены в буфер ядра.
Возвращает `false`, если данные полностью или частично поставлены в пользовательскую очередь.
Событие [`'drain'`][`'drain'`] придёт, когда буфер снова освободится.

Необязательный `callback` вызывается, когда данные фактически
отправлены — это может произойти не сразу.

См. метод потока `Writable` [`write()`][stream_writable_write].

### `socket.readyState`

<!-- YAML
added: v0.5.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление состояния соединения.

* Если поток подключается — `socket.readyState` равен `opening`.
* Если поток читаем и записываем — `open`.
* Если читаем, но не записываем — `readOnly`.
* Если не читаем и не записываем — `writeOnly`.

## `net.connect()`

Синоним
[`net.createConnection()`][`net.createConnection()`].

Возможные сигнатуры:

* [`net.connect(options[, connectListener])`][`net.connect(options)`]
* [`net.connect(path[, connectListener])`][`net.connect(path)`] для [IPC][IPC]-
  соединений.
* [`net.connect(port[, host][, connectListener])`][`net.connect(port, host)`]
  для TCP-соединений.

### `net.connect(options[, connectListener])`

<!-- YAML
added: v0.7.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Синоним
[`net.createConnection(options[, connectListener])`][`net.createConnection(options)`].

### `net.connect(path[, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Синоним
[`net.createConnection(path[, connectListener])`][`net.createConnection(path)`].

### `net.connect(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<net.Socket>`](net.md#class-netsocket)

Синоним
[`net.createConnection(port[, host][, connectListener])`][`net.createConnection(port, host)`].

## `net.createConnection()`

Фабричная функция: создаёт новый [`net.Socket`][`net.Socket`],
сразу инициирует соединение через [`socket.connect()`][`socket.connect()`]
и возвращает этот `net.Socket`.

Когда соединение установлено, на возвращённом сокете испускается [`'connect'`][`'connect'`]. Последний параметр `connectListener`, если задан,
добавляется как однократный слушатель [`'connect'`][`'connect'`].

Возможные сигнатуры:

* [`net.createConnection(options[, connectListener])`][`net.createConnection(options)`]
* [`net.createConnection(path[, connectListener])`][`net.createConnection(path)`]
  для [IPC][IPC]-соединений.
* [`net.createConnection(port[, host][, connectListener])`][`net.createConnection(port, host)`]
  для TCP-соединений.

Функция [`net.connect()`][`net.connect()`] — синоним этой функции.

### `net.createConnection(options[, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Обязателен. Передаётся и в вызов
  [`new net.Socket([options])`][`new net.Socket(options)`], и в
  [`socket.connect(options[, connectListener])`][`socket.connect(options)`].
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Общий параметр функций
  [`net.createConnection()`][`net.createConnection()`]. Если задан, добавляется как однократный слушатель
  [`'connect'`][`'connect'`] на возвращённом сокете.
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Новый сокет, с которого начато соединение.

Список опций см. в
[`new net.Socket([options])`][`new net.Socket(options)`]
и [`socket.connect(options[, connectListener])`][`socket.connect(options)`].

Дополнительные опции:

* `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задан, после создания сокета, но до
  начала соединения, будет вызван
  [`socket.setTimeout(timeout)`][`socket.setTimeout(timeout)`].

Ниже — пример клиента echo-сервера из раздела [`net.createServer()`][`net.createServer()`]:

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

Подключение к сокету `/tmp/echo.sock`:

```js
const client = net.createConnection({ path: '/tmp/echo.sock' });
```

Пример клиента с опциями `port` и `onread`.
Здесь `onread` используется только при вызове
`new net.Socket([options])`, а `port` — при вызове
`socket.connect(options[, connectListener])`.

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

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь для подключения сокета. Передаётся в
  [`socket.connect(path[, connectListener])`][`socket.connect(path)`].
  См. [Пути для IPC-соединений][Identifying paths for IPC connections].
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Общий параметр функций
  [`net.createConnection()`][`net.createConnection()`]: однократный слушатель события
  `'connect'` на инициирующем сокете. Передаётся в
  [`socket.connect(path[, connectListener])`][`socket.connect(path)`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Новый сокет, с которого начато соединение.

Инициирует [IPC][IPC]-соединение.

Создаёт новый [`net.Socket`][`net.Socket`] с опциями по умолчанию,
сразу вызывает
[`socket.connect(path[, connectListener])`][`socket.connect(path)`]
и возвращает этот `net.Socket`.

### `net.createConnection(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт для подключения. Передаётся в
  [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`].
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост для подключения. Передаётся в
  [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`].
  **По умолчанию:** `'localhost'`.
* `connectListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Общий параметр функций
  [`net.createConnection()`][`net.createConnection()`]: однократный слушатель события
  `'connect'` на инициирующем сокете. Передаётся в
  [`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`].
* Возвращает: [`<net.Socket>`](net.md#class-netsocket) Новый сокет, с которого начато соединение.

Инициирует TCP-соединение.

Создаёт новый [`net.Socket`][`net.Socket`] с опциями по умолчанию,
сразу вызывает
[`socket.connect(port[, host][, connectListener])`][`socket.connect(port)`]
и возвращает этот `net.Socket`.

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
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, сокет автоматически завершит запись,
    когда закончится чтение.
    **По умолчанию:** `false`.
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательно переопределяет для всех [`net.Socket`][`net.Socket`]
    `readableHighWaterMark` и `writableHighWaterMark`.
    **По умолчанию:** см. [`stream.getDefaultHighWaterMark()`][`stream.getDefaultHighWaterMark()`].
  * `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сразу после приёма нового входящего соединения включает keep-alive для
    сокета, аналогично [`socket.setKeepAlive()`][`socket.setKeepAlive()`]. **По умолчанию:**
    `false`.
  * `keepAliveInitialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задано положительное число, задаёт
    начальную задержку перед первой пробой keep-alive на простаивающем сокете.
    **По умолчанию:** `0`.
  * `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сразу после приёма нового входящего соединения отключает алгоритм Нейгла.
    **По умолчанию:** `false`.
  * `pauseOnConnect` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Приостанавливать ли сокет при каждом входящем соединении. **По умолчанию:** `false`.
  * `blockList` [`<net.BlockList>`](net.md) `blockList` можно использовать, чтобы запретить входящий
    доступ с заданных IP-адресов, диапазонов или подсетей. Это не
    сработает, если сервер за обратным прокси, NAT и т.п.: проверяется адрес
    прокси или адрес, указанный NAT.

* `connectionListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Автоматически устанавливается слушателем события
  [`'connection'`][`'connection'`].

* Возвращает: [`<net.Server>`](net.md#class-netserver)

Создаёт новый TCP- или [IPC][IPC]-сервер.

Если `allowHalfOpen` равен `true`, когда другая сторона сокета
сигнализирует о конце передачи, сервер отправит ответный конец передачи
только при явном вызове [`socket.end()`][`socket.end()`]. Например, в TCP при получении FIN пакет FIN
отправляется обратно только при явном вызове [`socket.end()`][`socket.end()`]. До этого соединение
полузакрыто (чтение недоступно, запись ещё возможна). См. событие [`'end'`][`'end'`]
и [RFC 1122][half-closed] (раздел 4.2.2.13).

Если `pauseOnConnect` равен `true`, сокет каждого входящего соединения
ставится на паузу, данные из его дескриптора не читаются.
Так можно передавать соединения между процессами, не прочитав данные в исходном процессе. Чтобы снова читать с приостановленного сокета, вызовите
[`socket.resume()`][`socket.resume()`].

Сервер может быть TCP или [IPC][IPC] в зависимости от аргументов
[`listen()`][`server.listen()`].

Пример TCP echo-сервера, принимающего соединения на порту 8124:

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

Проверка через `telnet`:

```bash
telnet localhost 8124
```

Прослушивание сокета `/tmp/echo.sock`:

```js
server.listen('/tmp/echo.sock', () => {
  console.log('server bound');
});
```

Подключение к серверу на Unix domain socket с помощью `nc`:

```bash
nc -U /tmp/echo.sock
```

## `net.getDefaultAutoSelectFamily()`

<!-- YAML
added: v19.4.0
-->

Возвращает текущее значение по умолчанию для опции `autoSelectFamily` в [`socket.connect(options)`][`socket.connect(options)`].
Изначально по умолчанию — `true`, если не передан флаг командной строки
`--no-network-family-autoselection`.

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Текущее значение по умолчанию для опции `autoSelectFamily`.

## `net.setDefaultAutoSelectFamily(value)`

<!-- YAML
added: v19.4.0
-->

Задаёт значение по умолчанию для опции `autoSelectFamily` в [`socket.connect(options)`][`socket.connect(options)`].

* `value` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Новое значение по умолчанию.
  Изначально по умолчанию — `true`, если не передан флаг командной строки
  `--no-network-family-autoselection`.

## `net.getDefaultAutoSelectFamilyAttemptTimeout()`

<!-- YAML
added:
 - v19.8.0
 - v18.18.0
-->

Возвращает текущее значение по умолчанию для опции `autoSelectFamilyAttemptTimeout` в [`socket.connect(options)`][`socket.connect(options)`].
Изначально по умолчанию — `500` или значение из командной строки
`--network-family-autoselection-attempt-timeout`.

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Текущее значение по умолчанию для опции `autoSelectFamilyAttemptTimeout`.

## `net.setDefaultAutoSelectFamilyAttemptTimeout(value)`

<!-- YAML
added:
 - v19.8.0
 - v18.18.0
-->

Задаёт значение по умолчанию для опции `autoSelectFamilyAttemptTimeout` в [`socket.connect(options)`][`socket.connect(options)`].

* `value` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Новое значение по умолчанию; должно быть положительным числом. Если число меньше `10`,
  вместо него используется `10`. Изначально по умолчанию — `250` или значение из командной строки
  `--network-family-autoselection-attempt-timeout`.

## `net.isIP(input)`

<!-- YAML
added: v0.3.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает `6`, если `input` — IPv6-адрес. Возвращает `4`, если `input` — IPv4-
адрес в [десятичной записи с точками][dot-decimal notation] без ведущих нулей. Иначе возвращает
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

Возвращает `true`, если `input` — IPv4-адрес в [десятичной записи с точками][dot-decimal notation] без
ведущих нулей. Иначе возвращает `false`.

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

Возвращает `true`, если `input` — IPv6-адрес. Иначе возвращает `false`.

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
