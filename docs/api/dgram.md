---
title: UDP/datagram sockets
description: Модуль node:dgram предоставляет реализацию сокетов дейтаграмм UDP
---

# Сокеты UDP/датаграмм

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/dgram.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:dgram`** предоставляет реализацию сокетов дейтаграмм UDP.

```mjs
import dgram from 'node:dgram';

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(
        `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
    );
});

server.on('listening', () => {
    const address = server.address();
    console.log(
        `server listening ${address.address}:${address.port}`
    );
});

server.bind(41234);
// Выводит: сервер прослушивает 0.0.0.0:41234
```

```cjs
const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(
        `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
    );
});

server.on('listening', () => {
    const address = server.address();
    console.log(
        `server listening ${address.address}:${address.port}`
    );
});

server.bind(41234);
// Выводит: сервер прослушивает 0.0.0.0:41234
```

## Класс: `dgram.Socket`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Инкапсулирует функциональность дейтаграммы.

Новые экземпляры `dgram.Socket` создаются с помощью [`dgram.createSocket()`](#dgramcreatesocketoptions-callback). Ключевое слово `new` не должно использоваться для создания экземпляров `dgram.Socket`.

### Событие: `'close'`

Событие `'close'` происходит после закрытия сокета с помощью [`close()`](#socketclosecallback). После его срабатывания на этом сокете не будет испускаться никаких новых событий `'message'`.

### Событие: `'connect'`

Событие `'connect'` происходит после того, как сокет связан с удаленным адресом в результате успешного вызова [`connect()`](#socketconnectport-address-callback).

### Событие: `ошибка`

-   `exception` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` генерируется всякий раз, когда возникает какая-либо ошибка. Функции-обработчику события передается единственный объект `Error`.

### Событие: `прослушивание`

Событие `'listening'` возникает, как только `dgram.Socket` становится адресуемым и может принимать данные. Это происходит либо явно с помощью `socket.bind()`, либо неявно при первой отправке данных с помощью `socket.send()`. Пока `dgram.Socket` не прослушивается, базовые системные ресурсы не существуют, и такие вызовы, как `socket.address()` и `socket.setTTL()` будут неудачными.

### Событие: `сообщение`

Событие `'message'` происходит, когда на сокете появляется новая датаграмма. Функции-обработчику события передаются два аргумента: `msg` и `rinfo`.

-   `msg` [`<Buffer>`](buffer.md#buffer) Сообщение.
-   `rinfo` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Информация об удаленном адресе.
    -   `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Адрес отправителя.
    -   `family` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство адресов (`IPv4` или `IPv6`).
    -   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт отправителя.
    -   `Size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер сообщения.

Если адрес источника входящего пакета является адресом IPv6 link-local, к `address` добавляется имя интерфейса. Например, пакет, полученный на интерфейсе `en0`, может иметь поле адреса, установленное в `'fe80::2618:1234:ab11:3b9c%en0'`, где `'%en0'` - имя интерфейса в виде суффикса идентификатора зоны.

### `socket.addMembership(multicastAddress[, multicastInterface])`

-   `multicastAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Указывает ядру присоединиться к многоадресной группе по заданным `multicastAddress` и `multicastInterface`, используя опцию сокета `IP_ADD_MEMBERSHIP`. Если аргумент `multicastInterface` не указан, операционная система выберет один интерфейс и добавит к нему членство. Чтобы добавить членство ко всем доступным интерфейсам, вызовите `addMembership` несколько раз, по одному разу для каждого интерфейса.

При вызове на несвязанном сокете этот метод неявно привязывается к случайному порту, прослушивая все интерфейсы.

При совместном использовании UDP сокета несколькими рабочими `cluster`, функция `socket.addMembership()` должна быть вызвана только один раз, иначе произойдет ошибка `EADDRINUSE`:

```mjs
import cluster from 'node:cluster';
import dgram from 'node:dgram';

if (cluster.isPrimary) {
    cluster.fork(); // Работает нормально.
    cluster.fork(); // Не работает с EADDRINUSE.
} else {
    const s = dgram.createSocket('udp4');
    s.bind(1234, () => {
        s.addMembership('224.0.0.114');
    });
}
```

```cjs
const cluster = require('node:cluster');
const dgram = require('node:dgram');

if (cluster.isPrimary) {
    cluster.fork(); // Работает нормально.
    cluster.fork(); // Не работает с EADDRINUSE.
} else {
    const s = dgram.createSocket('udp4');
    s.bind(1234, () => {
        s.addMembership('224.0.0.114');
    });
}
```

### `socket.addSourceSpecificMembership(sourceAddress, groupAddress[, multicastInterface])`

-   `sourceAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `groupAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Указывает ядру присоединиться к специфическому для источника многоадресному каналу по заданным `sourceAddress` и `groupAddress`, используя `multicastInterface` с опцией сокета `IP_ADD_SOURCE_MEMBERSHIP`. Если аргумент `multicastInterface` не указан, операционная система выберет один интерфейс и добавит членство в нем. Чтобы добавить членство в каждый доступный интерфейс, вызовите `socket.addSourceSpecificMembership()` несколько раз, по одному разу для каждого интерфейса.

При вызове на несвязанном сокете этот метод неявно привязывается к случайному порту, прослушивая все интерфейсы.

### `socket.address()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект, содержащий адресную информацию для сокета. Для UDP сокетов этот объект будет содержать свойства `address`, `family` и `port`.

Этот метод выбрасывает `EBADF`, если вызывается на несвязанном сокете.

### `socket.bind([port][, address][, callback])`

-   `порт` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `адрес` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) без параметров. Вызывается, когда привязка завершена.

Для UDP сокетов заставляет `dgram.Socket` прослушивать сообщения дейтаграмм на указанном `порте` и необязательном `адресе`. Если `port` не указан или равен `0`, операционная система попытается привязаться к произвольному порту. Если `адрес` не указан, операционная система будет пытаться прослушивать все адреса. Когда привязка завершена, выдается событие `'listening'` и вызывается необязательная функция `callback`.

Указание как слушателя события `прослушивание`, так и передачи `обратного вызова` методу `socket.bind()`` не вредно, но не очень полезно.

Привязанный дейтаграммный сокет поддерживает процесс Node.js для получения дейтаграммных сообщений.

Если привязка не удается, генерируется событие `ошибка`. В редких случаях (например, при попытке привязки с закрытым сокетом) может быть выброшена ошибка [`Error`](errors.md#class-error).

Пример UDP-сервера, слушающего порт 41234:

```mjs
import dgram from 'node:dgram';

const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(
        `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
    );
});

server.on('listening', () => {
    const address = server.address();
    console.log(
        `server listening ${address.address}:${address.port}`
    );
});

server.bind(41234);
// Выводит: сервер прослушивает 0.0.0.0:41234
```

```cjs
const dgram = require('node:dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
    console.error(`server error:\n${err.stack}`);
    server.close();
});

server.on('message', (msg, rinfo) => {
    console.log(
        `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
    );
});

server.on('listening', () => {
    const address = server.address();
    console.log(
        `server listening ${address.address}:${address.port}`
    );
});

server.bind(41234);
// Выводит: сервер прослушивает 0.0.0.0:41234
```

### `socket.bind(options[, callback])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Требуется. Поддерживает следующие свойства:
    -   `port` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `адрес` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `exclusive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Для UDP сокетов заставляет `dgram.Socket` прослушивать сообщения дейтаграмм на названном `порте` и необязательном `адресе`, которые передаются как свойства объекта `options`, переданного в качестве первого аргумента. Если `port` не указан или равен `0`, операционная система попытается привязаться к случайному порту. Если `address` не указан, операционная система будет пытаться прослушивать все адреса. Когда привязка завершена, выдается событие `прослушивание` и вызывается необязательная функция `обратный вызов`.

Объект `options` может содержать свойство `fd`. Если задано `fd` больше `0`, оно будет обернуто вокруг существующего сокета с заданным файловым дескриптором. В этом случае свойства `port` и `address` будут проигнорированы.

Указание как слушателя событий `'listening'`, так и передача `callback` методу `socket.bind()` не вредно, но не очень полезно.

Объект `options` может содержать дополнительное свойство `exclusive`, которое используется при использовании объектов `dgram.Socket` с модулем [`cluster`](cluster.md). Если `exclusive` установлено в `false` (по умолчанию), рабочие кластера будут использовать один и тот же базовый хэндл сокета, что позволит разделить обязанности по обработке соединений. Однако, когда `exclusive` имеет значение `true`, хэндл не разделяется, и попытка разделения портов приводит к ошибке.

Привязанный дейтаграммный сокет поддерживает процесс Node.js для получения дейтаграммных сообщений.

Если привязка не удается, генерируется событие `ошибка`. В редких случаях (например, при попытке привязки с закрытым сокетом) может возникнуть событие [`Error`](errors.md#class-error).

Пример сокета, прослушивающего эксклюзивный порт, показан ниже.

```js
socket.bind({
    адрес: 'localhost',
    порт: 8000,
    эксклюзивный: true,
});
```

### `socket.close([callback])`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, когда сокет был закрыт.

Закрывает базовый сокет и прекращает прослушивание данных на нем. Если указан обратный вызов, он добавляется в качестве слушателя для события [`'close'`](#event-close).

### `socket.connect(port[, address][, callback])`

-   `порт` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `адрес` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при завершении соединения или при ошибке.

Связывает `dgram.Socket` с удаленным адресом и портом. Каждое сообщение, отправленное этим хэндлом, автоматически отправляется по этому адресу. Кроме того, сокет будет получать сообщения только от этого удаленного пира. Попытка вызвать `connect()` на уже подключенном сокете приведет к исключению [`ERR_SOCKET_DGRAM_IS_CONNECTED`](errors.md#err_socket_dgram_is_connected). Если `address` не указан, по умолчанию будет использоваться `'127.0.0.1'` (для `udp4` сокетов) или `'::1'` (для `udp6` сокетов). Как только соединение будет завершено, произойдет событие `'connect'` и будет вызвана необязательная функция `callback`. В случае неудачи вызывается `callback` или, в противном случае, выдается событие `'error'`.

### `socket.disconnect()`

Синхронная функция, которая отсоединяет подключенный `dgram.Socket` от его удаленного адреса. Попытка вызвать `disconnect()` на несвязанном или уже отсоединенном сокете приведет к исключению [`ERR_SOCKET_DGRAM_NOT_CONNECTED`](errors.md#err_socket_dgram_not_connected).

### `socket.dropMembership(multicastAddress[, multicastInterface])`

-   `multicastAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Инструктирует ядро покинуть многоадресную группу по адресу `multicastAddress`, используя опцию сокета `IP_DROP_MEMBERSHIP`. Этот метод автоматически вызывается ядром при закрытии сокета или завершении процесса, поэтому большинство приложений никогда не будут иметь причин для его вызова.

Если `multicastInterface` не указан, операционная система попытается сбросить членство на всех действительных интерфейсах.

### `socket.dropSourceSpecificMembership(sourceAddress, groupAddress[, multicastInterface])`

-   `sourceAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `groupAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Инструктирует ядро покинуть многоадресный канал, специфичный для источника, по заданным `sourceAddress` и `groupAddress`, используя опцию сокета `IP_DROP_SOURCE_MEMBERSHIP`. Этот метод автоматически вызывается ядром при закрытии сокета или завершении процесса, поэтому большинство приложений никогда не будут иметь причин для его вызова.

Если `multicastInterface` не указан, операционная система попытается сбросить членство на всех действительных интерфейсах.

### `socket.getRecvBufferSize()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер буфера приема сокета `SO_RCVBUF` в байтах.

Этот метод бросает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size), если вызывается на несвязанном сокете.

### `socket.getSendBufferSize()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер буфера отправки сокета `SO_SNDBUF` в байтах.

Этот метод бросает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size), если вызывается на несвязанном сокете.

### `socket.getSendQueueSize()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт в очереди на отправку.

### `socket.getSendQueueCount()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество запросов на отправку, находящихся в очереди и ожидающих обработки.

### `socket.ref()`

-   Возвращает: {dgram.Socket}

По умолчанию связывание сокета приводит к блокированию выхода процесса Node.js до тех пор, пока сокет открыт. Метод `socket.unref()` можно использовать для исключения сокета из подсчета ссылок, который поддерживает процесс Node.js активным. Метод `socket.ref()` добавляет сокет обратно в подсчет ссылок и восстанавливает поведение по умолчанию.

Многократный вызов `socket.ref()` не даст дополнительного эффекта.

Метод `socket.ref()` возвращает ссылку на сокет, чтобы вызовы можно было соединять в цепочку.

### `socket.remoteAddress()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект, содержащий `адрес`, `семейство` и `порт` удаленной конечной точки. Этот метод выбрасывает исключение [`ERR_SOCKET_DGRAM_NOT_CONNECTED`](errors.md#err_socket_dgram_not_connected), если сокет не подключен.

### `socket.send(msg[, offset, length][, port][, address][, callback])`

-   `msg` {Buffer|TypedArray|DataView|string|Array} Сообщение, которое будет отправлено.
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в буфере, с которого начинается сообщение.
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт в сообщении.
-   `port` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт назначения.
-   `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста назначения или IP-адрес.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, когда сообщение было отправлено.

Передает дейтаграмму на сокет. Для сокетов без соединения необходимо указать `порт` и `адрес` назначения. Подключенные сокеты, с другой стороны, будут использовать связанную с ними удаленную конечную точку, поэтому аргументы `порт` и `адрес` не должны быть заданы.

Аргумент `msg` содержит сообщение, которое должно быть отправлено. В зависимости от его типа, может применяться различное поведение. Если `msg` является `Buffer`, любым `TypedArray` или `DataView`, то `offset` и `length` указывают смещение в `Buffer`, с которого начинается сообщение, и количество байт в сообщении, соответственно. Если `msg` является `String`, то оно автоматически преобразуется в `Buffer` с кодировкой `'utf8'`. Для сообщений, содержащих многобайтовые символы, `offset` и `length` будут вычислены относительно [длины байта](buffer.md#static-method-bufferbytelengthstring-encoding), а не позиции символа. Если `msg` является массивом, `offset` и `length` не должны быть указаны.

Аргумент `address` является строкой. Если значение `address` является именем хоста, то для определения адреса хоста будет использоваться DNS. Если значение `address` не указано или равно nullish, по умолчанию будет использоваться `'127.0.0.1'` (для сокетов `udp4`) или `'::1'` (для сокетов `udp6`).

Если сокет не был ранее привязан вызовом `bind`, ему присваивается случайный номер порта и он привязывается к адресу "все интерфейсы" (`0.0.0.0.0` для сокетов `udp4`, `::0` для сокетов `udp6`).

Необязательная функция `callback` может быть указана в качестве способа сообщения об ошибках DNS или для определения того, когда безопасно повторно использовать объект `buf`. Поиск DNS задерживает время отправки по крайней мере на один такт цикла событий Node.js.

Единственный способ узнать наверняка, что датаграмма была отправлена, - это использовать `callback`. Если произошла ошибка и указан `callback`, ошибка будет передана в качестве первого аргумента `callback`. Если `callback` не указан, ошибка будет передана как событие `'error'` на объекте `socket`.

Смещение и длина необязательны, но оба _должны_ быть установлены, если используются. Они поддерживаются только тогда, когда первый аргумент является `Buffer`, `TypedArray` или `DataView`.

Этот метод бросает [`ERR_SOCKET_BAD_PORT`](errors.md#err_socket_bad_port), если вызывается на несвязанном сокете.

Пример отправки UDP-пакета на порт на `localhost`;

```mjs
import dgram from 'node:dgram';
import { Buffer } from 'node:buffer';

const message = Buffer.from('Some bytes');
const client = dgram.createSocket('udp4');
client.send(message, 41234, 'localhost', (err) => {
    client.close();
});
```

```cjs
const dgram = require('node:dgram');
const { Buffer } = require('node:buffer');

const message = Buffer.from('Some bytes');
const client = dgram.createSocket('udp4');
client.send(message, 41234, 'localhost', (err) => {
    client.close();
});
```

Пример отправки UDP пакета, состоящего из нескольких буферов, на порт на `127.0.0.1`;

```mjs
import dgram from 'node:dgram';
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from('Some ');
const buf2 = Buffer.from('bytes');
const client = dgram.createSocket('udp4');
client.send([buf1, buf2], 41234, (err) => {
    client.close();
});
```

```cjs
const dgram = require('node:dgram');
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from('Some ');
const buf2 = Buffer.from('bytes');
const client = dgram.createSocket('udp4');
client.send([buf1, buf2], 41234, (err) => {
    client.close();
});
```

Отправка нескольких буферов может быть быстрее или медленнее в зависимости от приложения и операционной системы. Проведите сравнительные тесты, чтобы определить оптимальную стратегию в каждом конкретном случае. В целом, однако, отправка нескольких буферов быстрее.

Пример отправки UDP-пакета с помощью сокета, подключенного к порту на `localhost`:

```mjs
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

```cjs
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

#### Примечание о размере дейтаграммы UDP

Максимальный размер дейтаграммы IPv4/v6 зависит от `MTU` (Maximum Transmission Unit) и размера поля `Payload Length`.

-   Поле `Payload Length` имеет ширину 16 бит, что означает, что обычная полезная нагрузка не может превышать 64K октетов, включая интернет-заголовок и данные (65,507 байт = 65,535 - 8 байт UDP-заголовок - 20 байт IP-заголовок); это обычно справедливо для loopback-интерфейсов, но такие длинные дейтаграммы непрактичны для большинства узлов и сетей.

-   MTU" - это наибольший размер, который может поддерживать данная технология канального уровня для дейтаграммных сообщений. Для любого канала IPv4 требует минимальный `MTU` в 68 октетов, а рекомендуемый `MTU` для IPv4 составляет 576 (обычно рекомендуемый `MTU` для приложений типа dial-up), независимо от того, приходят ли они целиком или фрагментами.

    Для IPv6 минимальный `MTU` составляет 1280 октетов. Однако обязательный минимальный размер буфера для сборки фрагментов составляет 1500 октетов. Значение 68 октетов очень мало, поскольку большинство современных технологий канального уровня, например Ethernet, имеют минимальный `MTU` равный 1500.

Невозможно заранее узнать MTU каждого канала, через который может проходить пакет. Отправка дейтаграммы, превышающей `MTU` приемника, не сработает, поскольку пакет будет молча отброшен без уведомления источника о том, что данные не достигли адресата.

### `socket.setBroadcast(flag)`

-   `flag` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Устанавливает или снимает опцию сокета `SO_BROADCAST`. Если флаг установлен в `true`, UDP-пакеты могут быть отправлены на широковещательный адрес локального интерфейса.

Этот метод выбрасывает `EBADF`, если вызывается на несвязанном сокете.

### `socket.setMulticastInterface(multicastInterface)`

-   `multicastInterface` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

_Все ссылки на scope в этом разделе относятся к [индексам зон IPv6](https://en.wikipedia.org/wiki/IPv6_address#Scoped_literal_IPv6_addresses), которые определены в [RFC 4007](https://tools.ietf.org/html/rfc4007). В строковой форме IP с индексом зоны записывается как `'IP%scope'`, где scope - это имя интерфейса или номер интерфейса._

Устанавливает исходящий многоадресный интерфейс сокета по умолчанию на выбранный интерфейс или обратно на выбор системного интерфейса. Значение `multicastInterface` должно быть правильным строковым представлением IP из семейства сокетов.

Для сокетов IPv4 это должен быть IP, настроенный для желаемого физического интерфейса. Все пакеты, отправляемые в многоадресную рассылку на сокете, будут отправляться на интерфейс, определенный последним успешным использованием этого вызова.

Для сокетов IPv6 `multicastInterface` должен включать область видимости для указания интерфейса, как в следующих примерах. В IPv6 отдельные вызовы `send` могут также использовать явную область видимости в адресах, поэтому только пакеты, отправленные на многоадресный адрес без указания явной области видимости, будут затронуты последним успешным использованием этого вызова.

Этот метод бросает `EBADF`, если вызывается на несвязанном сокете.

#### Пример: Интерфейс исходящей многоадресной рассылки IPv6

В большинстве систем в формате scope используется имя интерфейса:

```js
const socket = dgram.createSocket('udp6');

socket.bind(1234, () => {
    socket.setMulticastInterface('::%eth1');
});
```

В Windows, где формат scope использует номер интерфейса:

```js
const socket = dgram.createSocket('udp6');

socket.bind(1234, () => {
    socket.setMulticastInterface('::%2');
});
```

#### Пример: Интерфейс исходящей многоадресной рассылки IPv4

Все системы используют IP хоста на нужном физическом интерфейсе:

```js
const socket = dgram.createSocket('udp4');

socket.bind(1234, () => {
    socket.setMulticastInterface('10.0.0.2');
});
```

#### Результаты вызовов

Вызов на сокет, который не готов к отправке или больше не открыт, может вызвать ошибку _Not running_ [`Error`](errors.md#class-error).

Если `multicastInterface` не может быть разобран на IP, то выдается _EINVAL_ [`System Error`](errors.md#class-systemerror).

В IPv4, если `multicastInterface` является действительным адресом, но не соответствует ни одному интерфейсу, или если адрес не соответствует семейству, то возникает ошибка [`System Error`](errors.md#class-systemerror), такая как `EADDRNOTAVAIL` или `EPROTONOSUP`.

В IPv6 большинство ошибок с указанием или опущением области видимости приведет к тому, что сокет продолжит использовать (или вернется к) выбор интерфейса по умолчанию в системе.

ANY-адрес семейства адресов сокета (IPv4 `'0.0.0.0'` или IPv6 `'::'`) может быть использован для возврата управления исходящим интерфейсом сокета по умолчанию системе для будущих многоадресных пакетов.

### `socket.setMulticastLoopback(flag)`

-   `flag` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Устанавливает или снимает опцию сокета `IP_MULTICAST_LOOP`. Если установлено значение `true`, многоадресные пакеты будут приниматься и на локальном интерфейсе.

Этот метод выбрасывает `EBADF`, если вызывается на несвязанном сокете.

### `socket.setMulticastTTL(ttl)`

-   `ttl` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Устанавливает опцию сокета `IP_MULTICAST_TTL`. Хотя TTL обычно означает "Time to Live", в данном контексте он определяет количество IP-переходов, через которые должен пройти пакет, особенно для многоадресного трафика. Каждый маршрутизатор или шлюз, пересылающий пакет, уменьшает TTL. Если TTL уменьшается маршрутизатором до 0, пакет не будет пересылаться.

Аргумент `ttl` может быть в диапазоне от 0 до 255. По умолчанию в большинстве систем используется значение `1`.

Этот метод бросает `EBADF`, если вызывается на несвязанном сокете.

### `socket.setRecvBufferSize(size)`

-   `size` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Устанавливает опцию сокета `SO_RCVBUF`. Устанавливает максимальный буфер приема сокета в байтах.

Этот метод бросает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size), если вызывается на несвязанном сокете.

### `socket.setSendBufferSize(size)`

-   `size` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Устанавливает опцию сокета `SO_SNDBUF`. Устанавливает максимальный размер буфера отправки сокета в байтах.

Этот метод бросает [`ERR_SOCKET_BUFFER_SIZE`](errors.md#err_socket_buffer_size), если вызывается на несвязанном сокете.

### `socket.setTTL(ttl)`

-   `ttl` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Устанавливает параметр сокета `IP_TTL`. Хотя TTL обычно означает "Time to Live", в данном контексте он определяет количество IP-переходов, через которые должен пройти пакет. Каждый маршрутизатор или шлюз, пересылающий пакет, уменьшает TTL. Если TTL уменьшается маршрутизатором до 0, пакет не будет пересылаться. Изменение значения TTL обычно выполняется для сетевых зондов или при многоадресной рассылке.

Аргумент `ttl` может иметь значение от 1 до 255. По умолчанию в большинстве систем используется значение 64.

Этот метод выбрасывает `EBADF`, если вызывается на несвязанном сокете.

### `socket.unref()`

-   Возвращает: {dgram.Socket}

По умолчанию связывание сокета приводит к блокированию выхода процесса Node.js до тех пор, пока сокет открыт. Метод `socket.unref()` может быть использован для исключения сокета из подсчета ссылок, который поддерживает процесс Node.js активным, позволяя процессу выйти, даже если сокет все еще прослушивается.

Вызов `socket.unref()` несколько раз не будет иметь дополнительного эффекта.

Метод `socket.unref()` возвращает ссылку на сокет, так что вызовы могут быть объединены в цепочку.

## `node:dgram` функции модуля

### `dgram.createSocket(options[, callback])`.

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Доступные опции:
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Семейство сокетов. Должно быть либо `'udp4'`, либо `'udp6'`. Требуется.
    -   `reuseAddr` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Когда `true` [`socket.bind()`](#socketbindport-address-callback) будет повторно использовать адрес, даже если другой процесс уже связал с ним сокет. **По умолчанию:** `false`.
    -   `ipv6Only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Установка `ipv6Only` в `true` отключает поддержку двойного стека, т.е. привязка к адресу `::` не заставит привязать `0.0.0.0`. **По умолчанию:** `false`.
    -   `recvBufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает значение `SO_RCVBUF` сокета.
    -   `sendBufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает значение сокета `SO_SNDBUF`.
    -   `lookup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция поиска. **По умолчанию:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал прерывания, который может быть использован для закрытия сокета.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Прикрепляется в качестве слушателя для событий `'message'`. Необязательно.
-   Возвращает: {dgram.Socket}

Создает объект `dgram.Socket`. После создания сокета вызов [`socket.bind()`](#socketbindport-address-callback) даст указание сокету начать прослушивание дейтаграммных сообщений. Если `address` и `port` не переданы в [`socket.bind()`](#socketbindport-address-callback), метод привяжет сокет к адресу "все интерфейсы" на случайном порту (это правильно для сокетов `udp4` и `udp6`). Привязанные адрес и порт можно получить с помощью [`socket.address().address`](#socketaddress) и [`socket.address().port`](#socketaddress).

Если опция `signal` включена, вызов `.abort()` на соответствующем `AbortController` аналогичен вызову `.close()` на сокете:

```js
const controller = new AbortController();
const { signal } = controller;
const server = dgram.createSocket({ type: 'udp4', signal });
server.on('message', (msg, rinfo) => {
    console.log(
        `server got: ${msg} from ${rinfo.address}:${rinfo.port}`
    );
});
// Позже, когда вы захотите закрыть сервер.
controller.abort();
```

### `dgram.createSocket(type[, callback])`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Либо `'udp4'`, либо `'udp6'`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Прикрепляется в качестве слушателя событий `'message'`.
-   Возвращает: {dgram.Socket}

Создает объект `dgram.Socket` указанного `типа`.

После создания сокета вызов [`socket.bind()`](#socketbindport-address-callback) даст команду сокету начать прослушивание дейтаграммных сообщений. Если `address` и `port` не переданы в [`socket.bind()`](#socketbindport-address-callback), метод привяжет сокет к адресу "все интерфейсы" на случайном порту (это правильно для сокетов `udp4` и `udp6`). Привязанные адрес и порт можно получить с помощью [`socket.address().address`](#socketaddress) и [`socket.address().port`](#socketaddress).

