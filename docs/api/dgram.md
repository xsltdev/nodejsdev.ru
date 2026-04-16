---
title: Сокеты UDP/датаграмм
description: Модуль node:dgram предоставляет реализацию сокетов UDP-датаграмм
---

# Сокеты UDP/датаграмм

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/dgram.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- name=dgram -->

<!-- source_link=lib/dgram.js -->

Модуль `node:dgram` реализует сокеты UDP-датаграмм.

=== "MJS"

    ```js
    import dgram from 'node:dgram';

    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.error(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });

    server.on('listening', () => {
      const address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(41234);
    // Выводит: server listening 0.0.0.0:41234
    ```

=== "CJS"

    ```js
    const dgram = require('node:dgram');
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.error(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });

    server.on('listening', () => {
      const address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(41234);
    // Выводит: server listening 0.0.0.0:41234
    ```

## Класс: `dgram.Socket`

<!-- YAML
added: v0.1.99
-->

* Наследует: [`<EventEmitter>`](events.md#class-eventemitter)

Инкапсулирует работу с датаграммами.

Новые экземпляры `dgram.Socket` создаются через [`dgram.createSocket()`](#dgramcreatesocketoptions-callback).
Ключевое слово `new` не используется для создания экземпляров `dgram.Socket`.

### Событие: `'close'`

<!-- YAML
added: v0.1.99
-->

Событие `'close'` испускается после закрытия сокета вызовом [`close()`](#socketclosecallback).
После этого на сокете больше не будут испускаться события `'message`.

### Событие: `'connect'`

<!-- YAML
added: v12.0.0
-->

Событие `'connect'` испускается после того, как сокет связан с удалённым
адресом в результате успешного вызова [`connect()`](#socketconnectport-address-callback).

### Событие: `'error'`

<!-- YAML
added: v0.1.99
-->

* `exception` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` испускается при любой ошибке. Обработчику передаётся один объект `Error`.

### Событие: `'listening'`

<!-- YAML
added: v0.1.99
-->

Событие `'listening'` испускается, когда `dgram.Socket` получает адрес и может
принимать данные. Это происходит явно при `socket.bind()` или неявно при первой
отправке данных через `socket.send()`.
Пока `dgram.Socket` не слушает, низкоуровневые ресурсы не созданы, и вызовы
вроде `socket.address()` и `socket.setTTL()` завершатся ошибкой.

### Событие: `'message'`

<!-- YAML
added: v0.1.99
changes:
  - version: v18.4.0
    pr-url: https://github.com/nodejs/node/pull/43054
    description: The `family` property now returns a string instead of a number.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41431
    description: The `family` property now returns a number instead of a string.
-->

Добавлено в: v0.1.99

Событие `'message'` испускается, когда на сокете доступна новая датаграмма.
Обработчику передаются два аргумента: `msg` и `rinfo`.

* `msg` [`<Buffer>`](buffer.md#buffer) Сообщение.
* `rinfo` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Сведения об удалённом адресе.
  * `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Адрес отправителя.
  * `family` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство адресов (`'IPv4'` или `'IPv6'`).
  * `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт отправителя.
  * `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер сообщения.

Если исходный адрес входящего пакета — IPv6 link-local,
к имени интерфейса добавляется к полю `address`. Например,
пакет, принятый на интерфейсе `en0`, может иметь поле адреса
`'fe80::2618:1234:ab11:3b9c%en0'`, где `'%en0'` — имя интерфейса как суффикс zone ID.

### `socket.addMembership(multicastAddress[, multicastInterface])`

<!-- YAML
added: v0.6.9
-->

* `multicastAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Указывает ядру присоединиться к multicast-группе по заданным `multicastAddress` и
`multicastInterface` с опцией сокета `IP_ADD_MEMBERSHIP`. Если аргумент
`multicastInterface` не указан, ОС выберет один интерфейс и добавит членство на нём.
Чтобы добавить членство на каждом доступном интерфейсе, вызывайте `addMembership` несколько раз — по разу на интерфейс.

При вызове на несвязанном сокете метод неявно привязывается к случайному порту
на всех интерфейсах.

При совместном использовании UDP-сокета несколькими воркерами `cluster`
`socket.addMembership()` нужно вызывать только один раз, иначе возникнет ошибка
`EADDRINUSE`:

=== "MJS"

    ```js
    import cluster from 'node:cluster';
    import dgram from 'node:dgram';

    if (cluster.isPrimary) {
      cluster.fork(); // Ок.
      cluster.fork(); // Ошибка EADDRINUSE.
    } else {
      const s = dgram.createSocket('udp4');
      s.bind(1234, () => {
        s.addMembership('224.0.0.114');
      });
    }
    ```

=== "CJS"

    ```js
    const cluster = require('node:cluster');
    const dgram = require('node:dgram');

    if (cluster.isPrimary) {
      cluster.fork(); // Ок.
      cluster.fork(); // Ошибка EADDRINUSE.
    } else {
      const s = dgram.createSocket('udp4');
      s.bind(1234, () => {
        s.addMembership('224.0.0.114');
      });
    }
    ```

### `socket.addSourceSpecificMembership(sourceAddress, groupAddress[, multicastInterface])`

<!-- YAML
added:
 - v13.1.0
 - v12.16.0
-->

* `sourceAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `groupAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Указывает ядру присоединиться к source-specific multicast-каналу по заданным
`sourceAddress` и `groupAddress`, используя `multicastInterface` и опцию сокета
`IP_ADD_SOURCE_MEMBERSHIP`. Если аргумент `multicastInterface` не указан, ОС выберет
интерфейс и добавит членство на нём. Чтобы добавить членство на каждом интерфейсе,
вызывайте `socket.addSourceSpecificMembership()` несколько раз — по разу на интерфейс.

При вызове на несвязанном сокете метод неявно привязывается к случайному порту
на всех интерфейсах.

### `socket.address()`

<!-- YAML
added: v0.1.99
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект с адресной информацией сокета.
Для UDP-сокета в объекте будут свойства `address`, `family` и `port`.

Метод выбрасывает `EBADF`, если вызван на несвязанном сокете.

### `socket.bind([port][, address][, callback])`

<!-- YAML
added: v0.1.99
changes:
  - version: v0.9.1
    commit: 332fea5ac1816e498030109c4211bca24a7fa667
    description: The method was changed to an asynchronous execution model.
                 Legacy code would need to be changed to pass a callback
                 function to the method call.
-->

Добавлено в: v0.1.99

* `port` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) без параметров. Вызывается по завершении привязки.

Для UDP-сокета заставляет `dgram.Socket` принимать датаграммы
на указанном `port` и необязательном `address`. Если `port` не
задан или равен `0`, ОС попытается привязаться к случайному порту.
Если `address` не задан, ОС попытается слушать на всех адресах. После
успешной привязки испускается событие `'listening'` и вызывается
необязательный `callback`.

Одновременно задать обработчик `'listening'` и передать
`callback` в `socket.bind()` не вредно, но мало что даёт.

Привязанный датаграммный сокет удерживает процесс Node.js запущенным для приёма
датаграмм.

При ошибке привязки генерируется событие `'error'`. В редких случаях (например
привязка закрытого сокета) может быть выброшен [`Error`](errors.md#class-error).

Пример UDP-сервера на порту 41234:

=== "MJS"

    ```js
    import dgram from 'node:dgram';

    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.error(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });

    server.on('listening', () => {
      const address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(41234);
    // Выводит: server listening 0.0.0.0:41234
    ```

=== "CJS"

    ```js
    const dgram = require('node:dgram');
    const server = dgram.createSocket('udp4');

    server.on('error', (err) => {
      console.error(`server error:\n${err.stack}`);
      server.close();
    });

    server.on('message', (msg, rinfo) => {
      console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
    });

    server.on('listening', () => {
      const address = server.address();
      console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(41234);
    // Выводит: server listening 0.0.0.0:41234
    ```

### `socket.bind(options[, callback])`

<!-- YAML
added: v0.11.14
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Обязателен. Поддерживает свойства:
  * `port` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `exclusive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Для UDP-сокета заставляет `dgram.Socket` принимать датаграммы
на указанном `port` и необязательном `address`, переданных как свойства
объекта `options` первым аргументом. Если `port` не задан или равен `0`, ОС
попытается привязаться к случайному порту. Если `address` не задан, ОС
попытается слушать на всех адресах. После привязки испускается `'listening'` и
вызывается необязательный `callback`.

Объект `options` может содержать свойство `fd`. Если задан `fd` больше
`0`, оборачивается существующий сокет с данным файловым дескриптором. В этом
случае свойства `port` и `address` игнорируются.

Одновременно задать обработчик `'listening'` и `callback` для `socket.bind()`
не вредно, но мало что даёт.

Объект `options` может содержать дополнительное свойство `exclusive`, используемое
с модулем [`cluster`](cluster.md). При `exclusive` равном `false` (по умолчанию) воркеры
`cluster` используют один нижележащий дескриптор сокета и могут совместно
обрабатывать соединения. При `exclusive` равном `true` дескриптор не разделяется,
и попытка разделить порт приводит к ошибке. Создание `dgram.Socket` с опцией
`reusePort: true` делает `exclusive` всегда `true` при вызове `socket.bind()`.

Привязанный датаграммный сокет удерживает процесс Node.js для приёма датаграмм.

При ошибке привязки генерируется `'error'`. В редких случаях может быть выброшен [`Error`](errors.md#class-error).

Ниже пример сокета с эксклюзивным портом.

```js
socket.bind({
  address: 'localhost',
  port: 8000,
  exclusive: true,
});
```

### `socket.close([callback])`

<!-- YAML
added: v0.1.99
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после закрытия сокета.

Закрывает нижележащий сокет и прекращает приём данных. Если передан `callback`,
он добавляется как обработчик события [`'close'`](#event-close).

### `socket[Symbol.asyncDispose]()`

<!-- YAML
added:
 - v20.5.0
 - v18.18.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

Вызывает [`socket.close()`](#socketclosecallback) и возвращает промис, который выполняется после
закрытия сокета.

### `socket.connect(port[, address][, callback])`

<!-- YAML
added: v12.0.0
-->

* `port` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при успешном соединении или при ошибке.

Связывает `dgram.Socket` с удалённым адресом и портом. Каждое сообщение,
отправляемое этим дескриптором, уходит на этот адрес. Сокет принимает сообщения
только от этого удалённого узла.
Повторный вызов `connect()` на уже подключённом сокете приводит к исключению
[`ERR_SOCKET_DGRAM_IS_CONNECTED`](errors.md#err_socket_dgram_is_connected). Если `address` не задан, по умолчанию
используется `'127.0.0.1'` (для `udp4`) или `'::1'` (для `udp6`).
После установления соединения испускается `'connect'` и вызывается необязательный
`callback`. При ошибке вызывается `callback` или, если это невозможно, испускается `'error'`.

### `socket.disconnect()`

<!-- YAML
added: v12.0.0
-->

Синхронная функция, отсоединяющая подключённый `dgram.Socket` от
удалённого адреса. Вызов `disconnect()` на несвязанном или уже отсоединённом
сокете даёт исключение [`ERR_SOCKET_DGRAM_NOT_CONNECTED`](errors.md#err_socket_dgram_not_connected).

### `socket.dropMembership(multicastAddress[, multicastInterface])`

<!-- YAML
added: v0.6.9
-->

* `multicastAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Указывает ядру покинуть multicast-группу по `multicastAddress` с опцией сокета
`IP_DROP_MEMBERSHIP`. Ядро вызывает это автоматически при закрытии сокета или
завершении процесса, поэтому приложениям редко нужно вызывать метод вручную.

Если `multicastInterface` не указан, ОС попытается снять членство на всех подходящих интерфейсах.

### `socket.dropSourceSpecificMembership(sourceAddress, groupAddress[, multicastInterface])`

<!-- YAML
added:
 - v13.1.0
 - v12.16.0
-->

* `sourceAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `groupAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Указывает ядру покинуть source-specific multicast-канал по заданным
`sourceAddress` и `groupAddress` с опцией `IP_DROP_SOURCE_MEMBERSHIP`.
Ядро вызывает это автоматически при закрытии сокета или завершении процесса.

Если `multicastInterface` не указан, ОС попытается снять членство на всех подходящих интерфейсах.

### `socket.getRecvBufferSize()`

<!-- YAML
added: v8.7.0
-->

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер буфера приёма сокета `SO_RCVBUF` в байтах.

Метод выбрасывает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size) на несвязанном сокете.

### `socket.getSendBufferSize()`

<!-- YAML
added: v8.7.0
-->

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер буфера отправки сокета `SO_SNDBUF` в байтах.

Метод выбрасывает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size) на несвязанном сокете.

### `socket.getSendQueueSize()`

<!-- YAML
added:
  - v18.8.0
  - v16.19.0
-->

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт в очереди на отправку.

### `socket.getSendQueueCount()`

<!-- YAML
added:
  - v18.8.0
  - v16.19.0
-->

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число запросов на отправку в очереди, ожидающих обработки.

### `socket.ref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<dgram.Socket>`](dgram.md#class-dgramsocket)

По умолчанию привязка сокета удерживает процесс Node.js от завершения, пока сокет открыт.
`socket.unref()` исключает сокет из подсчёта ссылок, удерживающего процесс.
`socket.ref()` снова включает сокет в подсчёт и восстанавливает поведение по умолчанию.

Повторные вызовы `socket.ref()` не меняют поведение дополнительно.

`socket.ref()` возвращает ссылку на сокет для цепочки вызовов.

### `socket.remoteAddress()`

<!-- YAML
added: v12.0.0
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект с `address`, `family` и `port` удалённого узла.
Если сокет не подключён, выбрасывается [`ERR_SOCKET_DGRAM_NOT_CONNECTED`](errors.md#err_socket_dgram_not_connected).

### `socket.send(msg[, offset, length][, port][, address][, callback])`

<!-- YAML
added: v0.1.99
changes:
  - version: v17.0.0
    pr-url: https://github.com/nodejs/node/pull/39190
    description: The `address` parameter now only accepts a `string`, `null`
                 or `undefined`.
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/22413
    description: The `msg` parameter can now be any `TypedArray` or `DataView`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26871
    description: Added support for sending data on connected sockets.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11985
    description: The `msg` parameter can be an `Uint8Array` now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10473
    description: The `address` parameter is always optional now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5929
    description: On success, `callback` will now be called with an `error`
                 argument of `null` rather than `0`.
  - version: v5.7.0
    pr-url: https://github.com/nodejs/node/pull/4374
    description: The `msg` parameter can be an array now. Also, the `offset`
                 and `length` parameters are optional now.
-->

Добавлено в: v0.1.99

* `msg` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Отправляемое сообщение.
* `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в буфере, с которого начинается сообщение.
* `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт в сообщении.
* `port` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт назначения.
* `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста или IP-адрес назначения.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после отправки сообщения.

Отправляет датаграмму через сокет.
Для сокетов без соединения нужно указать `port` и `address` назначения.
Подключённые сокеты используют связанный удалённый узел, аргументы `port` и `address` задавать нельзя.

Аргумент `msg` — отправляемое сообщение.
Поведение зависит от типа. Если `msg` — `Buffer`,
`TypedArray` или `DataView`,
`offset` и `length` задают смещение в буфере и число байт сообщения.
Если `msg` — строка, она преобразуется в `Buffer` с кодировкой `'utf8'`.
Для символов в нескольких байтах `offset` и `length` считаются по [byte length][byte length], а не по позиции символа.
Если `msg` — массив, `offset` и `length` указывать нельзя.

Аргумент `address` — строка. Если это имя хоста, для разрешения используется DNS.
Если `address` не задан или равен `null`/`undefined`, по умолчанию берутся `'127.0.0.1'` (`udp4`) или `'::1'` (`udp6`).

Если сокет ещё не был привязан вызовом `bind`, ему назначается случайный порт и адрес «все интерфейсы»
(`'0.0.0.0'` для `udp4`, `'::0'` для `udp6`).

Необязательный `callback` можно использовать для сообщения об ошибках DNS
или чтобы узнать, когда безопасно повторно использовать объект буфера.
Поиск в DNS откладывает отправку минимум на один тик цикла событий Node.js.

Надёжно убедиться, что датаграмма отправлена, можно только через `callback`.
При ошибке и наличии `callback` ошибка передаётся первым аргументом в `callback`.
Без `callback` ошибка испускается как событие `'error'` на сокете.

`offset` и `length` необязательны, но если используется один из них, нужны оба.
Они поддерживаются только если первый аргумент — `Buffer`, `TypedArray` или `DataView`.

На несвязанном сокете метод выбрасывает [`ERR_SOCKET_BAD_PORT`](errors.md#err_socket_bad_port).

Пример отправки UDP-пакета на порт на `localhost`:

=== "MJS"

    ```js
    import dgram from 'node:dgram';
    import { Buffer } from 'node:buffer';

    const message = Buffer.from('Some bytes');
    const client = dgram.createSocket('udp4');
    client.send(message, 41234, 'localhost', (err) => {
      client.close();
    });
    ```

=== "CJS"

    ```js
    const dgram = require('node:dgram');
    const { Buffer } = require('node:buffer');

    const message = Buffer.from('Some bytes');
    const client = dgram.createSocket('udp4');
    client.send(message, 41234, 'localhost', (err) => {
      client.close();
    });
    ```

Пример отправки UDP-пакета из нескольких буферов на порт на `127.0.0.1`:

=== "MJS"

    ```js
    import dgram from 'node:dgram';
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from('Some ');
    const buf2 = Buffer.from('bytes');
    const client = dgram.createSocket('udp4');
    client.send([buf1, buf2], 41234, (err) => {
      client.close();
    });
    ```

=== "CJS"

    ```js
    const dgram = require('node:dgram');
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from('Some ');
    const buf2 = Buffer.from('bytes');
    const client = dgram.createSocket('udp4');
    client.send([buf1, buf2], 41234, (err) => {
      client.close();
    });
    ```

Отправка нескольких буферов может быть быстрее или медленнее в зависимости от
приложения и ОС. Сравнивайте на бенчмарках для вашего случая. Обычно
отправка нескольких буферов быстрее.

Пример отправки UDP-пакета через подключённый к порту на `localhost` сокет:

=== "MJS"

    ```js
    import dgram from 'node:dgram';
    import { Buffer } from 'node:buffer';

    const message = Buffer.from('Some bytes');
    const client = dgram.createSocket('udp4');
    client.connect(41234, 'localhost', (err) => {
      client.send(message, (err) => {
        client.close();
      });
    });
    ```

=== "CJS"

    ```js
    const dgram = require('node:dgram');
    const { Buffer } = require('node:buffer');

    const message = Buffer.from('Some bytes');
    const client = dgram.createSocket('udp4');
    client.connect(41234, 'localhost', (err) => {
      client.send(message, (err) => {
        client.close();
      });
    });
    ```

#### Замечание о размере UDP-датаграммы

Максимальный размер датаграммы IPv4/v6 зависит от `MTU`
(максимальная единица передачи) и размера поля `Payload Length`.

* Поле `Payload Length` имеет ширину 16 бит, поэтому обычная полезная нагрузка
  не может превышать 64K октетов вместе с заголовками интернета и данными
  (65 507 байт = 65 535 − 8 байт UDP − 20 байт IP);
  это обычно для петлевого интерфейса, но такие длинные датаграммы непрактичны для большинства хостов и сетей.

* `MTU` — максимальный размер, который поддерживает технология канального уровня
  для датаграмм. Для любого канала IPv4 требует минимум `MTU` 68 октетов,
  рекомендуемый `MTU` для IPv4 — 576 (часто для коммутируемого доступа), целиком или фрагментами.

  Для IPv6 минимальный `MTU` — 1280 октетов. Обязательный минимальный размер буфера
  сборки фрагментов — 1500 октетов. 68 октетов мало: у большинства сетей, например Ethernet-сетей,
  `MTU` не меньше 1500.

Заранее невозможно узнать `MTU` всех участков пути пакета. Если датаграмма больше `MTU` получателя,
она не дойдёт: пакет отбрасывается без уведомления источника.

### `socket.setBroadcast(flag)`

<!-- YAML
added: v0.6.9
-->

* `flag` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Устанавливает или сбрасывает опцию сокета `SO_BROADCAST`. При `true` UDP-пакеты
можно отправлять на широковещательный адрес локального интерфейса.

На несвязанном сокете метод выбрасывает `EBADF`.

### `socket.setMulticastInterface(multicastInterface)`

<!-- YAML
added: v8.6.0
-->

* `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

_Все упоминания scope здесь относятся к [IPv6 Zone Indexes][IPv6 Zone Indexes], определённым в [RFC 4007][RFC 4007].
В строковой форме IP с индексом области записывается как `'IP%scope'`, где scope — имя интерфейса или его номер._

Задаёт интерфейс исходящего multicast по умолчанию или возвращает выбор системе.
`multicastInterface` должен быть корректной строковой записью IP из семейства сокета.

Для IPv4 это обычно IP нужного физического интерфейса. Все multicast-пакеты с этого сокета
идут через интерфейс, заданный последним успешным вызовом.

Для IPv6 в `multicastInterface` нужна область (scope), как в примерах ниже. Отдельные вызовы `send`
могут указывать scope в адресе; на последний успешный вызов влияют только пакеты к multicast без явной области.

На несвязанном сокете метод выбрасывает `EBADF`.

#### Пример: исходящий multicast-интерфейс IPv6

В большинстве систем формат scope — имя интерфейса:

```js
const socket = dgram.createSocket('udp6');

socket.bind(1234, () => {
  socket.setMulticastInterface('::%eth1');
});
```

В Windows в формате scope используется номер интерфейса:

```js
const socket = dgram.createSocket('udp6');

socket.bind(1234, () => {
  socket.setMulticastInterface('::%2');
});
```

#### Пример: исходящий multicast-интерфейс IPv4

На всех системах — IP хоста на нужном физическом интерфейсе:

```js
const socket = dgram.createSocket('udp4');

socket.bind(1234, () => {
  socket.setMulticastInterface('10.0.0.2');
});
```

#### Результат вызова

Вызов на сокете, не готовом к отправке или уже закрытом, может выбросить ошибку _Not running_ [`Error`](errors.md#class-error).

Если `multicastInterface` нельзя разобрать как IP, выбрасывается _EINVAL_ [системная ошибка](errors.md#class-systemerror).

В IPv4 при корректном, но не совпадающем с интерфейсом адресе или несовпадении семейства —
[системная ошибка](errors.md#class-systemerror), например `EADDRNOTAVAIL` или `EPROTONOSUP`.

В IPv6 при ошибках указания или пропуска scope сокет часто продолжает использовать выбор интерфейса по умолчанию.

Адрес ANY семейства сокета (IPv4 `'0.0.0.0'` или IPv6 `'::'`) можно использовать, чтобы вернуть выбор
исходящего интерфейса для multicast системе.

### `socket.setMulticastLoopback(flag)`

<!-- YAML
added: v0.3.8
-->

* `flag` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Устанавливает или сбрасывает опцию `IP_MULTICAST_LOOP`. При `true` multicast-пакеты
также принимаются на локальном интерфейсе.

На несвязанном сокете метод выбрасывает `EBADF`.

### `socket.setMulticastTTL(ttl)`

<!-- YAML
added: v0.3.8
-->

* `ttl` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт опцию `IP_MULTICAST_TTL`. Хотя TTL обычно расшифровывают как «Time to Live»,
здесь это число IP-прыжков для multicast-трафика. Каждый маршрутизатор уменьшает TTL;
при достижении 0 пакет не пересылается.

Аргумент `ttl` от 0 до 255. На большинстве систем по умолчанию `1`.

На несвязанном сокете метод выбрасывает `EBADF`.

### `socket.setRecvBufferSize(size)`

<!-- YAML
added: v8.7.0
-->

* `size` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт опцию `SO_RCVBUF` — максимальный буфер приёма сокета в байтах.

На несвязанном сокете метод выбрасывает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size).

### `socket.setSendBufferSize(size)`

<!-- YAML
added: v8.7.0
-->

* `size` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт опцию `SO_SNDBUF` — максимальный буфер отправки сокета в байтах.

На несвязанном сокете метод выбрасывает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size).

### `socket.setTTL(ttl)`

<!-- YAML
added: v0.1.101
-->

* `ttl` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт опцию `IP_TTL`. Здесь это число IP-прыжков для пакета; маршрутизаторы уменьшают TTL;
 при 0 пакет не пересылается. Изменение TTL обычно используют для зондов или multicast.

Аргумент `ttl` от 1 до 255. На большинстве систем по умолчанию 64.

На несвязанном сокете метод выбрасывает `EBADF`.

### `socket.unref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<dgram.Socket>`](dgram.md#class-dgramsocket)

По умолчанию привязка сокета удерживает процесс Node.js от завершения, пока сокет открыт.
`socket.unref()` исключает сокет из подсчёта ссылок, и процесс может завершиться, даже если сокет ещё слушает.

Повторные вызовы `socket.unref()` не дают дополнительного эффекта.

`socket.unref()` возвращает ссылку на сокет для цепочки вызовов.

## Функции модуля `node:dgram`

### `dgram.createSocket(options[, callback])`

<!-- YAML
added: v0.11.13
changes:
  - version:
    - v23.1.0
    - v22.12.0
    pr-url: https://github.com/nodejs/node/pull/55403
    description: The `reusePort` option is supported.
  - version: v15.8.0
    pr-url: https://github.com/nodejs/node/pull/37026
    description: AbortSignal support was added.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/23798
    description: The `ipv6Only` option is supported.
  - version: v8.7.0
    pr-url: https://github.com/nodejs/node/pull/13623
    description: The `recvBufferSize` and `sendBufferSize` options are
                 supported now.
  - version: v8.6.0
    pr-url: https://github.com/nodejs/node/pull/14560
    description: The `lookup` option is supported.
-->

Добавлено в: v0.11.13

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Доступные опции:
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство сокета: `'udp4'` или `'udp6'`.
    Обязательно.
  * `reuseAddr` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` [`socket.bind()`](#socketbindport-address-callback) переиспользует
    адрес, даже если другой процесс уже привязал сокет, но
    данные получит только один сокет.
    **По умолчанию:** `false`.
  * `reusePort` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` [`socket.bind()`](#socketbindport-address-callback) переиспользует
    порт, даже если другой процесс уже привязал сокет. Входящие
    датаграммы распределяются между слушающими сокетами. Опция доступна
    только на части платформ: Linux 3.9+, DragonFlyBSD 3.6+, FreeBSD 12.0+,
    Solaris 11.4, AIX 7.2.5+. На неподдерживаемых платформах при привязке возникает ошибка.
    **По умолчанию:** `false`.
  * `ipv6Only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `ipv6Only: true` отключается dual-stack,
    т.е. привязка к `::` не привязывает `0.0.0.0`. **По умолчанию:** `false`.
  * `recvBufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение `SO_RCVBUF`.
  * `sendBufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение `SO_SNDBUF`.
  * `lookup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция поиска. **По умолчанию:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал для закрытия сокета.
  * `receiveBlockList` [`<net.BlockList>`](net.md) Отбрасывает входящие датаграммы с заданных IP, диапазонов или подсетей. Не
    работает за обратным прокси, NAT и т.п.: проверяется адрес прокси или NAT, а не клиента.
  * `sendBlockList` [`<net.BlockList>`](net.md) Блокирует исходящую отправку на заданные IP, диапазоны или подсети.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обработчик событий `'message'`. Необязательно.
* Возвращает: [`<dgram.Socket>`](dgram.md#class-dgramsocket)

Создаёт объект `dgram.Socket`. После создания вызов [`socket.bind()`](#socketbindport-address-callback) запускает приём датаграмм.
Если в [`socket.bind()`](#socketbindport-address-callback) не переданы `address` и `port`, сокет привязывается к адресу «все интерфейсы»
на случайном порту (корректно для `udp4` и `udp6`). Привязанный адрес и порт можно получить через
[`socket.address().address`](#socketaddress) и [`socket.address().port`](#socketaddress).

Если задана опция `signal`, вызов `.abort()` у соответствующего
`AbortController` аналогичен `.close()` у сокета:

```js
const controller = new AbortController();
const { signal } = controller;
const server = dgram.createSocket({ type: 'udp4', signal });
server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});
// Позже, когда нужно закрыть сервер.
controller.abort();
```

### `dgram.createSocket(type[, callback])`

<!-- YAML
added: v0.1.99
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'udp4'` или `'udp6'`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обработчик событий `'message'`.
* Возвращает: [`<dgram.Socket>`](dgram.md#class-dgramsocket)

Создаёт `dgram.Socket` указанного `type`.

После создания [`socket.bind()`](#socketbindport-address-callback) запускает приём датаграмм. Без `address` и `port` в [`socket.bind()`](#socketbindport-address-callback)
сокет привязывается к «все интерфейсы» на случайном порту (для `udp4` и `udp6`). Адрес и порт —
[`socket.address().address`](#socketaddress) и [`socket.address().port`](#socketaddress).

[IPv6 Zone Indexes]: https://en.wikipedia.org/wiki/IPv6_address#Scoped_literal_IPv6_addresses
[RFC 4007]: https://tools.ietf.org/html/rfc4007
[`'close'`]: #event-close
[`ERR_SOCKET_BAD_PORT`]: errors.md#err_socket_bad_port
[`ERR_SOCKET_BUFFER_SIZE`]: errors.md#err_socket_buffer_size
[`ERR_SOCKET_DGRAM_IS_CONNECTED`]: errors.md#err_socket_dgram_is_connected
[`ERR_SOCKET_DGRAM_NOT_CONNECTED`]: errors.md#err_socket_dgram_not_connected
[`Error`]: errors.md#class-error
[системная ошибка]: errors.md#class-systemerror
[`close()`]: #socketclosecallback
[`cluster`]: cluster.md
[`connect()`]: #socketconnectport-address-callback
[`dgram.createSocket()`]: #dgramcreatesocketoptions-callback
[`dns.lookup()`]: dns.md#dnslookuphostname-options-callback
[`socket.address().address`]: #socketaddress
[`socket.address().port`]: #socketaddress
[`socket.bind()`]: #socketbindport-address-callback
[`socket.close()`]: #socketclosecallback
[byte length]: buffer.md#static-method-bufferbytelengthstring-encoding
