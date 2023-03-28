# Сеть

<!--introduced_in=v0.10.0-->

<!--lint disable maximum-line-length-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/net.js -->

В `net` модуль предоставляет асинхронный сетевой API для создания потокового TCP или [МПК](#ipc-support) серверы ([`net.createServer()`](#netcreateserveroptions-connectionlistener)) и клиентов ([`net.createConnection()`](#netcreateconnection)).

Доступ к нему можно получить, используя:

```js
const net = require('net');
```

## Поддержка IPC

В `net` модуль поддерживает IPC с именованными каналами в Windows и сокеты домена Unix в других операционных системах.

### Определение путей для IPC-соединений

[`net.connect()`](#netconnect), [`net.createConnection()`](#netcreateconnection), [`server.listen()`](#serverlisten) а также [`socket.connect()`](#socketconnect) взять `path` параметр для идентификации конечных точек IPC.

В Unix локальный домен также известен как домен Unix. Путь - это путь к файловой системе. Он усекается до зависящей от ОС длины `sizeof(sockaddr_un.sun_path) - 1`. Типичные значения - 107 байтов в Linux и 103 байта в macOS. Если абстракция API Node.js создает сокет домена Unix, она также разъединяет сокет домена Unix. Например, [`net.createServer()`](#netcreateserveroptions-connectionlistener) может создать сокет домена Unix и [`server.close()`](#serverclosecallback) отключит его. Но если пользователь создает сокет домена Unix вне этих абстракций, ему нужно будет удалить его. То же самое происходит, когда API Node.js создает сокет домена Unix, но затем программа дает сбой. Короче говоря, сокет домена Unix будет виден в файловой системе и будет существовать до тех пор, пока не будет отсоединен.

В Windows локальный домен реализован с помощью именованного канала. Путь _должен_ обратитесь к записи в `\\?\pipe\` или `\\.\pipe\`. Разрешены любые символы, но последний может выполнять некоторую обработку имен каналов, например, разрешение `..` последовательности. Несмотря на то, как это может выглядеть, пространство имен pipe плоское. Трубы будут _не настаивать_. Они удаляются, когда закрывается последняя ссылка на них. В отличие от сокетов домена Unix, Windows закроет и удалит канал при выходе из процесса владения.

Экранирование строк в JavaScript требует, чтобы пути были указаны с дополнительным экранированием обратной косой черты, например:

```js
net
  .createServer()
  .listen(path.join('\\\\?\\pipe', process.cwd(), 'myctl'));
```

## Класс: `net.BlockList`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

В `BlockList` Объект может использоваться с некоторыми сетевыми API-интерфейсами для определения правил отключения входящего или исходящего доступа к определенным IP-адресам, диапазонам IP-адресов или IP-подсетям.

### `blockList.addAddress(address[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

- `address` {string | net.SocketAddress} Адрес IPv4 или IPv6.
- `type` {строка} Либо `'ipv4'` или `'ipv6'`. **Дефолт:** `'ipv4'`.

Добавляет правило для блокировки данного IP-адреса.

### `blockList.addRange(start, end[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

- `start` {string | net.SocketAddress} Начальный адрес IPv4 или IPv6 в диапазоне.
- `end` {string | net.SocketAddress} Конечный адрес IPv4 или IPv6 в диапазоне.
- `type` {строка} Либо `'ipv4'` или `'ipv6'`. **Дефолт:** `'ipv4'`.

Добавляет правило для блокировки диапазона IP-адресов из `start` (включительно) в `end` (включительно).

### `blockList.addSubnet(net, prefix[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

- `net` {string | net.SocketAddress} Сетевой адрес IPv4 или IPv6.
- `prefix` {number} Число битов префикса CIDR. Для IPv4 это должно быть значение между `0` а также `32`. Для IPv6 это должно быть между `0` а также `128`.
- `type` {строка} Либо `'ipv4'` или `'ipv6'`. **Дефолт:** `'ipv4'`.

Добавляет правило для блокировки диапазона IP-адресов, указанных в качестве маски подсети.

### `blockList.check(address[, type])`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

- `address` {string | net.SocketAddress} IP-адрес для проверки
- `type` {строка} Либо `'ipv4'` или `'ipv6'`. **Дефолт:** `'ipv4'`.
- Возвращает: {логическое}

Возврат `true` если данный IP-адрес соответствует любому из правил, добавленных в `BlockList`.

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

### `blockList.rules`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

- Тип: {строка \[]}

Список правил добавлен в черный список.

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

- `options` {Объект}
  - `address` {строка} Сетевой адрес в виде строки IPv4 или IPv6. **Дефолт**: `'127.0.0.1'` если `family` является `'ipv4'`; `'::'` если `family` является `'ipv6'`.
  - `family` {string} Одно из `'ipv4'` или 'ipv6'`. **Default**: `'ipv4' '.
  - `flowlabel` {number} Метка потока IPv6 используется, только если `family` является `'ipv6'`.
  - `port` {number} IP-порт.

### `socketaddress.address`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

- Введите {строка}

### `socketaddress.family`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

- Введите {строка} Либо `'ipv4'` или `'ipv6'`.

### `socketaddress.flowlabel`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

- Введите {номер}

### `socketaddress.port`

<!-- YAML
added:
  - v15.14.0
  - v14.18.0
-->

- Введите {номер}

## Класс: `net.Server`

<!-- YAML
added: v0.1.90
-->

- Расширяется: {EventEmitter}

Этот класс используется для создания TCP или [МПК](#ipc-support) сервер.

### `new net.Server([options][, connectionListener])`

- `options` {Object} См. [`net.createServer([options][, connectionListener])`](#netcreateserveroptions-connectionlistener).
- `connectionListener` {Function} Автоматически устанавливается в качестве слушателя для [`'connection'`](#event-connection) событие.
- Возвращает: {net.Server}

`net.Server` является [`EventEmitter`](events.md#class-eventemitter) со следующими событиями:

### Событие: `'close'`

<!-- YAML
added: v0.5.0
-->

Выдается при закрытии сервера. Если соединения существуют, это событие не генерируется, пока не будут завершены все соединения.

### Событие: `'connection'`

<!-- YAML
added: v0.1.90
-->

- {net.Socket} Объект подключения

Выдается при установке нового соединения. `socket` это пример `net.Socket`.

### Событие: `'error'`

<!-- YAML
added: v0.1.90
-->

- {Ошибка}

Выдается при возникновении ошибки. В отличие от [`net.Socket`](#class-netsocket), то [`'close'`](#event-close) событие будет **нет** испускаться сразу после этого события, если только [`server.close()`](#serverclosecallback) вызывается вручную. См. Пример при обсуждении [`server.listen()`](#serverlisten).

### Событие: `'listening'`

<!-- YAML
added: v0.1.90
-->

Выдается, когда сервер был привязан после вызова [`server.listen()`](#serverlisten).

### `server.address()`

<!-- YAML
added: v0.1.90
-->

- Возвращает: {Object | string | null}

Возвращает границу `address`, адрес `family` имя и `port` сервера, как сообщает операционная система при прослушивании IP-сокета (полезно для определения того, какой порт был назначен при получении адреса, назначенного ОС): `{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`.

Для сервера, прослушивающего канал или сокет домена Unix, имя возвращается в виде строки.

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

`server.address()` возвращается `null` перед `'listening'` событие было сгенерировано или после вызова `server.close()`.

### `server.close([callback])`

<!-- YAML
added: v0.1.90
-->

- `callback` {Функция} Вызывается, когда сервер закрыт.
- Возвращает: {net.Server}

Останавливает сервер от приема новых подключений и сохраняет существующие подключения. Эта функция является асинхронной, сервер, наконец, закрывается, когда все соединения завершены, и сервер выдает сигнал [`'close'`](#event-close) событие. Необязательный `callback` будет называться после того, как `'close'` событие происходит. В отличие от этого события, оно будет вызываться с `Error` как его единственный аргумент, если сервер не был открыт, когда он был закрыт.

### `server.getConnections(callback)`

<!-- YAML
added: v0.9.7
-->

- `callback` {Функция}
- Возвращает: {net.Server}

Асинхронно получить количество одновременных подключений на сервере. Работает, когда розетки были отправлены на вилки.

Обратный вызов должен принимать два аргумента `err` а также `count`.

### `server.listen()`

Запустите сервер, ожидающий подключений. А `net.Server` может быть TCP или [МПК](#ipc-support) сервер в зависимости от того, что он слушает.

Возможные подписи:

<!--lint disable no-undefined-references-->

- [`server.listen(handle[, backlog][, callback])`](#serverlistenhandle-backlog-callback)
- [`server.listen(options[, callback])`](#serverlistenoptions-callback)
- [`server.listen(path[, backlog][, callback])`](#serverlistenpath-backlog-callback) для [МПК](#ipc-support) серверы
- <a href="#serverlistenport-host-backlog-callback">
  <code>server.listen([port[, host[, backlog]]][, callback])</code></a>
  for TCP servers

<!--lint enable no-undefined-references-->

Эта функция асинхронная. Когда сервер начинает прослушивание, [`'listening'`](#event-listening) событие будет выпущено. Последний параметр `callback` будет добавлен как слушатель для [`'listening'`](#event-listening) событие.

Все `listen()` методы могут принять `backlog` параметр, чтобы указать максимальную длину очереди ожидающих подключений. Фактическая длина будет определяться ОС через настройки sysctl, такие как `tcp_max_syn_backlog` а также `somaxconn` в Linux. Значение этого параметра по умолчанию - 511 (а не 512).

Все [`net.Socket`](#class-netsocket) установлены на `SO_REUSEADDR` (видеть [`socket(7)`](https://man7.org/linux/man-pages/man7/socket.7.html) для подробностей).

В `server.listen()` метод может быть вызван снова тогда и только тогда, когда во время первого `server.listen()` позвонить или `server.close()` был вызван. В противном случае `ERR_SERVER_ALREADY_LISTEN` будет выброшена ошибка.

Одна из наиболее частых ошибок, возникающих при прослушивании, - это `EADDRINUSE`. Это происходит, когда другой сервер уже прослушивает запрошенный `port`/`path`/`handle`. Один из способов справиться с этим - повторить попытку через определенное время:

```js
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
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

- `handle` {Объект}
- `backlog` {number} Общий параметр [`server.listen()`](#serverlisten) функции
- `callback` {Функция}
- Возвращает: {net.Server}

Запустить сервер, прослушивающий подключения на заданном `handle` который уже был привязан к порту, сокету домена Unix или именованному каналу Windows.

В `handle` объект может быть либо сервером, либо сокетом (что угодно с лежащим в основе `_handle` член) или объект с `fd` член, который является допустимым дескриптором файла.

Прослушивание файлового дескриптора не поддерживается в Windows.

#### `server.listen(options[, callback])`

<!-- YAML
added: v0.11.14
changes:
  - version: v15.6.0
    pr-url: https://github.com/nodejs/node/pull/36623
    description: AbortSignal support was added.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/23798
    description: The `ipv6Only` option is supported.
-->

- `options` {Object} Обязательный. Поддерживает следующие свойства:
  - `port` {количество}
  - `host` {нить}
  - `path` {строка} будет проигнорировано, если `port` указан. Видеть [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
  - `backlog` {number} Общий параметр [`server.listen()`](#serverlisten) функции.
  - `exclusive` {логический} **Дефолт:** `false`
  - `readableAll` {boolean} Для серверов IPC делает канал доступным для чтения всем пользователям. **Дефолт:** `false`.
  - `writableAll` {boolean} Для серверов IPC делает канал доступным для записи для всех пользователей. **Дефолт:** `false`.
  - `ipv6Only` {boolean} Для TCP-серверов настройка `ipv6Only` к `true` отключит поддержку двойного стека, т.е. привязку к хосту `::` не сделаю `0.0.0.0` связывать. **Дефолт:** `false`.
  - `signal` {AbortSignal} AbortSignal, который может использоваться для закрытия слушающего сервера.
- `callback` {Функция} функции.
- Возвращает: {net.Server}

<!--lint disable no-undefined-references-->

Если `port` указан, он ведет себя так же, как <a href="#serverlistenport-host-backlog-callback"> <code>server.listen (\[порт \[, хост \[, отставание]]] \[, обратный вызов])</code></a>. В противном случае, если `path` указан, он ведет себя так же, как [`server.listen(path[, backlog][, callback])`](#serverlistenpath-backlog-callback). Если ни один из них не указан, будет выдана ошибка.

<!--lint enable no-undefined-references-->

Если `exclusive` является `false` (по умолчанию), тогда работники кластера будут использовать один и тот же базовый дескриптор, позволяя разделять обязанности по обработке соединения. Когда `exclusive` является `true`, дескриптор не используется совместно, и попытка совместного использования порта приводит к ошибке. Пример прослушивания эксклюзивного порта показан ниже.

```js
server.listen({
  host: 'localhost',
  port: 80,
  exclusive: true,
});
```

Запуск IPC-сервера с правами root может сделать путь к серверу недоступным для непривилегированных пользователей. С использованием `readableAll` а также `writableAll` сделает сервер доступным для всех пользователей.

Если `signal` опция включена, звонок `.abort()` на соответствующем `AbortController` похоже на вызов `.close()` на сервере:

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

#### `server.listen(path[, backlog][, callback])`

<!-- YAML
added: v0.1.90
-->

- `path` {строка} Путь, который сервер должен слушать. Видеть [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
- `backlog` {number} Общий параметр [`server.listen()`](#serverlisten) функции.
- `callback` {Функция}.
- Возвращает: {net.Server}

Начать [МПК](#ipc-support) сервер прослушивает соединения на данном `path`.

#### `server.listen([port[, host[, backlog]]][, callback])`

<!-- YAML
added: v0.1.90
-->

- `port` {количество}
- `host` {нить}
- `backlog` {number} Общий параметр [`server.listen()`](#serverlisten) функции.
- `callback` {Функция}.
- Возвращает: {net.Server}

Запустите TCP-сервер, прослушивающий подключения на заданном `port` а также `host`.

Если `port` опущен или равен 0, операционная система назначит произвольный неиспользуемый порт, который можно получить с помощью `server.address().port` после [`'listening'`](#event-listening) событие было отправлено.

Если `host` опущено, сервер будет принимать соединения на [неуказанный IPv6-адрес](https://en.wikipedia.org/wiki/IPv6_address#Unspecified_address) (`::`), когда доступен IPv6, или [неуказанный IPv4-адрес](https://en.wikipedia.org/wiki/0.0.0.0) (`0.0.0.0`) иначе.

В большинстве операционных систем прослушивание [неуказанный IPv6-адрес](https://en.wikipedia.org/wiki/IPv6_address#Unspecified_address) (`::`) может вызвать `net.Server` также послушать [неуказанный IPv4-адрес](https://en.wikipedia.org/wiki/0.0.0.0) (`0.0.0.0`).

### `server.listening`

<!-- YAML
added: v5.7.0
-->

- {boolean} Указывает, прослушивает ли сервер соединения.

### `server.maxConnections`

<!-- YAML
added: v0.2.0
-->

- {целое число}

Установите это свойство, чтобы отклонять соединения, когда число соединений сервера становится высоким.

Не рекомендуется использовать эту опцию, если сокет был отправлен дочернему элементу с [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options).

### `server.ref()`

<!-- YAML
added: v0.9.1
-->

- Возвращает: {net.Server}

Противоположность `unref()`, звоню `ref()` на ранее `unref`ed сервер будет _нет_ позвольте программе выйти, если это единственный оставшийся сервер (поведение по умолчанию). Если сервер `ref`Эд звонит `ref()` снова не будет иметь никакого эффекта.

### `server.unref()`

<!-- YAML
added: v0.9.1
-->

- Возвращает: {net.Server}

Вызов `unref()` на сервере позволит программе завершить работу, если это единственный активный сервер в системе событий. Если сервер уже `unref`Эд звонит `unref()` снова не будет иметь никакого эффекта.

## Класс: `net.Socket`

<!-- YAML
added: v0.3.4
-->

- Расширяется: {stream.Duplex}

Этот класс является абстракцией TCP-сокета или потокового [МПК](#ipc-support) конечная точка (использует именованные каналы в Windows и сокеты домена Unix в противном случае). Это также [`EventEmitter`](events.md#class-eventemitter).

А `net.Socket` могут быть созданы пользователем и использоваться непосредственно для взаимодействия с сервером. Например, его возвращает [`net.createConnection()`](#netcreateconnection), поэтому пользователь может использовать его для разговора с сервером.

Он также может быть создан Node.js и передан пользователю при получении соединения. Например, он передается слушателям [`'connection'`](#event-connection) событие, выпущенное на [`net.Server`](#class-netserver), поэтому пользователь может использовать его для взаимодействия с клиентом.

### `new net.Socket([options])`

<!-- YAML
added: v0.3.4
changes:
  - version: v15.14.0
    pr-url: https://github.com/nodejs/node/pull/37735
    description: AbortSignal support was added.
-->

- `options` {Object} Доступные варианты:
  - `fd` {number} Если указано, обернуть существующий сокет заданным файловым дескриптором, в противном случае будет создан новый сокет.
  - `allowHalfOpen` {boolean} Если установлено значение `false`, то сокет автоматически закроет доступную для записи сторону, когда закончится доступная для чтения сторона. Видеть [`net.createServer()`](#netcreateserveroptions-connectionlistener) и [`'end'`](#event-end) событие для подробностей. **Дефолт:** `false`.
  - `readable` {boolean} Разрешить чтение из сокета, когда `fd` передается, в противном случае игнорируется. **Дефолт:** `false`.
  - `writable` {boolean} Разрешить запись в сокет, когда `fd` передается, в противном случае игнорируется. **Дефолт:** `false`.
  - `signal` {AbortSignal} Сигнал прерывания, который может использоваться для уничтожения сокета.
- Возвращает: {net.Socket}

Создает новый объект сокета.

Вновь созданный сокет может быть либо TCP-сокетом, либо потоковым [МПК](#ipc-support) конечная точка, в зависимости от того, что это [`connect()`](#socketconnect) к.

### Событие: `'close'`

<!-- YAML
added: v0.1.90
-->

- `hadError` {логический} `true` если в сокете произошла ошибка передачи.

Выдается после полного закрытия сокета. Аргумент `hadError` - логическое значение, которое сообщает, был ли сокет закрыт из-за ошибки передачи.

### Событие: `'connect'`

<!-- YAML
added: v0.1.90
-->

Выдается, когда соединение через сокет успешно установлено. Видеть [`net.createConnection()`](#netcreateconnection).

### Событие: `'data'`

<!-- YAML
added: v0.1.90
-->

- {Буфер | строка}

Выдается при получении данных. Аргумент `data` будет `Buffer` или `String`. Кодировка данных устанавливается [`socket.setEncoding()`](#socketsetencodingencoding).

Данные будут потеряны, если нет слушателя, когда `Socket` испускает `'data'` событие.

### Событие: `'drain'`

<!-- YAML
added: v0.1.90
-->

Выдается, когда буфер записи становится пустым. Может использоваться для ограничения загрузки.

См. Также: возвращаемые значения `socket.write()`.

### Событие: `'end'`

<!-- YAML
added: v0.1.90
-->

Излучается, когда другой конец сокета сигнализирует об окончании передачи, тем самым закрывая доступную для чтения сторону сокета.

По умолчанию (`allowHalfOpen` является `false`) сокет отправит обратно пакет об окончании передачи и уничтожит свой файловый дескриптор после того, как он выпишет свою ожидающую очередь записи. Однако если `allowHalfOpen` установлен на `true`, сокет не будет автоматически [`end()`](#socketenddata-encoding-callback) его сторона с возможностью записи, позволяющая пользователю записывать произвольные объемы данных. Пользователь должен позвонить [`end()`](#socketenddata-encoding-callback) явно закрыть соединение (т.е. отправить обратно пакет FIN).

### Событие: `'error'`

<!-- YAML
added: v0.1.90
-->

- {Ошибка}

Выдается при возникновении ошибки. В `'close'` событие будет вызываться сразу после этого события.

### Событие: `'lookup'`

<!-- YAML
added: v0.11.3
changes:
  - version: v5.10.0
    pr-url: https://github.com/nodejs/node/pull/5598
    description: The `host` parameter is supported now.
-->

Выдается после разрешения имени хоста, но до подключения. Не применимо к сокетам Unix.

- `err` {Error | null} Объект ошибки. Видеть [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
- `address` {строка} IP-адрес.
- `family` {string | null} Тип адреса. Видеть [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
- `host` {строка} Имя хоста.

### Событие: `'ready'`

<!-- YAML
added: v9.11.0
-->

Выдается, когда сокет готов к использованию.

Срабатывает сразу после `'connect'`.

### Событие: `'timeout'`

<!-- YAML
added: v0.1.90
-->

Выдается, если сокет неактивен по тайм-ауту. Это только для уведомления о том, что сокет бездействует. Пользователь должен вручную закрыть соединение.

Смотрите также: [`socket.setTimeout()`](#socketsettimeouttimeout-callback).

### `socket.address()`

<!-- YAML
added: v0.1.90
-->

- Возвращает: {Object}

Возвращает границу `address`, адрес `family` имя и `port` сокета, как сообщает операционная система: `{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`

### `socket.bufferSize`

<!-- YAML
added: v0.3.8
deprecated:
  - v14.6.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`writable.writableLength`](stream.md#writablewritablelength) вместо.

- {целое число}

Это свойство показывает количество символов, буферизованных для записи. Буфер может содержать строки, длина которых после кодирования еще не известна. Таким образом, это число является приблизительным количеством байтов в буфере.

`net.Socket` имеет свойство, что `socket.write()` всегда работает. Это помогает пользователям быстро приступить к работе. Компьютер не всегда может справляться с объемом данных, записываемых в сокет. Сетевое соединение может быть слишком медленным. Node.js будет помещать в очередь данные, записанные в сокет, и отправлять их по сети, когда это возможно.

Следствием этой внутренней буферизации является увеличение объема памяти. Пользователи, которые сталкиваются с большими или растущими `bufferSize` должны попытаться "дросселировать" потоки данных в своей программе с помощью [`socket.pause()`](#socketpause) а также [`socket.resume()`](#socketresume).

### `socket.bytesRead`

<!-- YAML
added: v0.5.3
-->

- {целое число}

Количество полученных байтов.

### `socket.bytesWritten`

<!-- YAML
added: v0.5.3
-->

- {целое число}

Количество отправленных байтов.

### `socket.connect()`

Инициируйте соединение с данным сокетом.

Возможные подписи:

- [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener)
- [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener) для [МПК](#ipc-support) соединения.
- [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener) для TCP-соединений.
- Возвращает: {net.Socket} Сам сокет.

Эта функция асинхронная. Когда соединение установлено, [`'connect'`](#event-connect) событие будет выпущено. Если есть проблема с подключением, вместо [`'connect'`](#event-connect) событие, [`'error'`](#event-error_1) событие будет сгенерировано с ошибкой, переданной в [`'error'`](#event-error_1) слушатель. Последний параметр `connectListener`, если указан, будет добавлен как слушатель для [`'connect'`](#event-connect) событие **однажды**.

Эту функцию следует использовать только для повторного подключения сокета после `'close'` был испущен, иначе это может привести к неопределенному поведению.

#### `socket.connect(options[, connectListener])`

<!-- YAML
added: v0.1.90
changes:
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/25436
    description: Added `onread` option.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/6021
    description: The `hints` option defaults to `0` in all cases now.
                 Previously, in the absence of the `family` option it would
                 default to `dns.ADDRCONFIG | dns.V4MAPPED`.
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/6000
    description: The `hints` option is supported now.
-->

- `options` {Объект}
- `connectListener` {Function} Общий параметр [`socket.connect()`](#socketconnect) методы. Будет добавлен как слушатель для [`'connect'`](#event-connect) событие один раз.
- Возвращает: {net.Socket} Сам сокет.

Инициируйте соединение с данным сокетом. Обычно этот метод не нужен, сокет должен быть создан и открыт с помощью [`net.createConnection()`](#netcreateconnection). Используйте это только при реализации собственного Socket.

Для TCP-соединений доступно `options` находятся:

- `port` {номер} Обязательно. Порт, к которому должен подключаться сокет.
- `host` {строка} Хост, к которому должен подключиться сокет. **Дефолт:** `'localhost'`.
- `localAddress` {строка} Локальный адрес, с которого должен подключаться сокет.
- `localPort` {number} Локальный порт, к которому должен подключаться сокет.
- `family` {number}: версия IP-стека. Должно быть `4`, `6`, или `0`. Значение `0` указывает, что разрешены адреса как IPv4, так и IPv6. **Дефолт:** `0`.
- `hints` {number} Необязательно [`dns.lookup()` подсказки](dns.md#supported-getaddrinfo-flags).
- `lookup` {Функция} Пользовательская функция поиска. **Дефолт:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).

Для [МПК](#ipc-support) соединения, доступные `options` находятся:

- `path` {строка} Обязательно. Путь, к которому должен подключиться клиент. Видеть [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections). Если указано, указанные выше параметры TCP игнорируются.

Для обоих типов доступны `options` включают:

- `onread` {Object} Если указано, входящие данные хранятся в одном `buffer` и перешла к поставленному `callback` когда данные поступают в сокет. Это приведет к тому, что функция потоковой передачи не предоставит никаких данных. Сокет будет генерировать такие события, как `'error'`, `'end'`, а также `'close'` как обычно. Такие методы, как `pause()` а также `resume()` также будет вести себя так, как ожидалось.
  - `buffer` {Buffer | Uint8Array | Function} Либо многократно используемый фрагмент памяти для хранения входящих данных, либо функция, которая их возвращает.
  - `callback` {Функция} Эта функция вызывается для каждого блока входящих данных. Ему передаются два аргумента: количество байтов, записанных в `buffer` и ссылка на `buffer`. Возвращение `false` из этой функции неявно `pause()` розетка. Эта функция будет выполняться в глобальном контексте.

Ниже приведен пример клиента, использующего `onread` вариант:

```js
const net = require('net');
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

#### `socket.connect(path[, connectListener])`

- `path` {строка} Путь, к которому должен подключиться клиент. Видеть [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
- `connectListener` {Function} Общий параметр [`socket.connect()`](#socketconnect) методы. Будет добавлен как слушатель для [`'connect'`](#event-connect) событие один раз.
- Возвращает: {net.Socket} Сам сокет.

Инициировать [МПК](#ipc-support) подключение к данной розетке.

Псевдоним [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) позвонил с `{ path: path }` в качестве `options`.

#### `socket.connect(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

- `port` {number} Порт, к которому должен подключиться клиент.
- `host` {строка} Хост, к которому должен подключиться клиент.
- `connectListener` {Function} Общий параметр [`socket.connect()`](#socketconnect) методы. Будет добавлен как слушатель для [`'connect'`](#event-connect) событие один раз.
- Возвращает: {net.Socket} Сам сокет.

Инициируйте TCP-соединение с данным сокетом.

Псевдоним [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) позвонил с `{port: port, host: host}` в качестве `options`.

### `socket.connecting`

<!-- YAML
added: v6.1.0
-->

- {логический}

Если `true`, [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) был вызван и еще не закончен. Это останется `true` до тех пор, пока сокет не будет подключен, тогда он будет установлен на `false` и `'connect'` событие испускается. Обратите внимание, что [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) обратный вызов является слушателем для `'connect'` событие.

### `socket.destroy([error])`

<!-- YAML
added: v0.1.90
-->

- `error` {Объект}
- Возвращает: {net.Socket}

Гарантирует, что в этом сокете больше не происходит операций ввода-вывода. Уничтожает поток и закрывает соединение.

Видеть [`writable.destroy()`](stream.md#writabledestroyerror) для получения дополнительной информации.

### `socket.destroyed`

- {boolean} Указывает, разорвано соединение или нет. После разрыва соединения никакие дальнейшие данные не могут быть переданы с его помощью.

Видеть [`writable.destroyed`](stream.md#writabledestroyed) для получения дополнительной информации.

### `socket.end([data[, encoding]][, callback])`

<!-- YAML
added: v0.1.90
-->

- `data` {строка | Буфер | Uint8Array}
- `encoding` {строка} Используется только когда данные `string`. **Дефолт:** `'utf8'`.
- `callback` {Функция} Необязательный обратный вызов, когда сокет завершен.
- Возвращает: {net.Socket} Сам сокет.

Наполовину закрывает розетку. то есть он отправляет пакет FIN. Возможно, сервер по-прежнему будет отправлять некоторые данные.

Видеть [`writable.end()`](stream.md#writableendchunk-encoding-callback) для получения дополнительной информации.

### `socket.localAddress`

<!-- YAML
added: v0.9.6
-->

- {нить}

Строковое представление локального IP-адреса, к которому подключается удаленный клиент. Например, на сервере, прослушивающем `'0.0.0.0'`, если клиент подключается к `'192.168.1.1'`, значение `socket.localAddress` было бы `'192.168.1.1'`.

### `socket.localPort`

<!-- YAML
added: v0.9.6
-->

- {целое число}

Числовое представление локального порта. Например, `80` или `21`.

### `socket.pause()`

- Возвращает: {net.Socket} Сам сокет.

Приостанавливает чтение данных. То есть, [`'data'`](#event-data) события не будут отправляться. Полезно для замедления загрузки.

### `socket.pending`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

- {логический}

Это `true` если сокет еще не подключен, либо потому, что `.connect()` еще не был вызван или потому что он все еще находится в процессе подключения (см. [`socket.connecting`](#socketconnecting)).

### `socket.ref()`

<!-- YAML
added: v0.9.1
-->

- Возвращает: {net.Socket} Сам сокет.

Противоположность `unref()`, звоню `ref()` на ранее `unref`Эд сокет будет _нет_ позвольте программе выйти, если это единственный оставшийся сокет (поведение по умолчанию). Если розетка `ref`Эд звонит `ref` снова не будет иметь никакого эффекта.

### `socket.remoteAddress`

<!-- YAML
added: v0.5.10
-->

- {нить}

Строковое представление удаленного IP-адреса. Например, `'74.125.127.100'` или `'2001:4860:a005::68'`. Стоимость может быть `undefined` если сокет разрушен (например, если клиент отключился).

### `socket.remoteFamily`

<!-- YAML
added: v0.11.14
-->

- {нить}

Строковое представление семейства удаленных IP-адресов. `'IPv4'` или `'IPv6'`.

### `socket.remotePort`

<!-- YAML
added: v0.5.10
-->

- {целое число}

Числовое представление удаленного порта. Например, `80` или `21`.

### `socket.resume()`

- Возвращает: {net.Socket} Сам сокет.

Возобновляет чтение после звонка [`socket.pause()`](#socketpause).

### `socket.setEncoding([encoding])`

<!-- YAML
added: v0.1.90
-->

- `encoding` {нить}
- Возвращает: {net.Socket} Сам сокет.

Установите кодировку для сокета как [Читаемый поток](stream.md#class-streamreadable). Видеть [`readable.setEncoding()`](stream.md#readablesetencodingencoding) для дополнительной информации.

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

- `enable` {логический} **Дефолт:** `false`
- `initialDelay` {количество} **Дефолт:** `0`
- Возвращает: {net.Socket} Сам сокет.

Включите / отключите функцию проверки активности и, при необходимости, установите начальную задержку перед отправкой первого зонда проверки активности на незанятый сокет.

Установленный `initialDelay` (в миллисекундах), чтобы установить задержку между последним полученным пакетом данных и первой проверкой активности. Параметр `0` для `initialDelay` оставит значение неизменным по сравнению с настройкой по умолчанию (или предыдущей).

Включение функции проверки активности установит следующие параметры сокета:

- `SO_KEEPALIVE=1`
- `TCP_KEEPIDLE=initialDelay`
- `TCP_KEEPCNT=10`
- `TCP_KEEPINTVL=1`

### `socket.setNoDelay([noDelay])`

<!-- YAML
added: v0.1.90
-->

- `noDelay` {логический} **Дефолт:** `true`
- Возвращает: {net.Socket} Сам сокет.

Включение / отключение использования алгоритма Нэгла.

Когда создается TCP-соединение, в нем будет включен алгоритм Нэгла.

Алгоритм Нагла задерживает данные перед их отправкой по сети. Он пытается оптимизировать пропускную способность за счет задержки.

Проходящий `true` для `noDelay` или отсутствие аргумента отключит алгоритм Нэгла для сокета. Проходящий `false` для `noDelay` включит алгоритм Нэгла.

### `socket.setTimeout(timeout[, callback])`

<!-- YAML
added: v0.1.90
-->

- `timeout` {количество}
- `callback` {Функция}
- Возвращает: {net.Socket} Сам сокет.

Устанавливает сокет на тайм-аут после `timeout` миллисекунды бездействия сокета. По умолчанию `net.Socket` нет тайм-аута.

При срабатывании тайм-аута простоя сокет получит сообщение [`'timeout'`](#event-timeout) событие, но соединение не будет разорвано. Пользователь должен вручную позвонить [`socket.end()`](#socketenddata-encoding-callback) или [`socket.destroy()`](#socketdestroyerror) чтобы завершить соединение.

```js
socket.setTimeout(3000);
socket.on('timeout', () => {
  console.log('socket timeout');
  socket.end();
});
```

Если `timeout` равно 0, то существующий тайм-аут простоя отключен.

Необязательный `callback` будет добавлен как одноразовый слушатель для [`'timeout'`](#event-timeout) событие.

### `socket.timeout`

<!-- YAML
added: v10.7.0
-->

- {number | undefined}

Тайм-аут сокета в миллисекундах, установленный [`socket.setTimeout()`](#socketsettimeouttimeout-callback). это `undefined` если тайм-аут не установлен.

### `socket.unref()`

<!-- YAML
added: v0.9.1
-->

- Возвращает: {net.Socket} Сам сокет.

Вызов `unref()` на сокете позволит программе выйти, если это единственный активный сокет в системе событий. Если розетка уже `unref`Эд звонит `unref()` снова не будет иметь никакого эффекта.

### `socket.write(data[, encoding][, callback])`

<!-- YAML
added: v0.1.90
-->

- `data` {строка | Буфер | Uint8Array}
- `encoding` {строка} Используется только когда данные `string`. **Дефолт:** `utf8`.
- `callback` {Функция}
- Возвращает: {логическое}

Отправляет данные в сокет. Второй параметр указывает кодировку в случае строки. По умолчанию используется кодировка UTF8.

Возврат `true` если все данные были успешно сброшены в буфер ядра. Возврат `false` если все или часть данных были помещены в очередь в пользовательской памяти. [`'drain'`](#event-drain) будет выдан, когда буфер снова станет свободным.

Необязательный `callback` Параметр будет выполнен, когда данные будут окончательно записаны, что может произойти не сразу.

Видеть `Writable` транслировать [`write()`](stream.md#writablewritechunk-encoding-callback) метод для получения дополнительной информации.

### `socket.readyState`

<!-- YAML
added: v0.5.0
-->

- {нить}

Это свойство представляет состояние подключения в виде строки.

- Если поток подключается `socket.readyState` является `opening`.
- Если поток доступен для чтения и записи, он `open`.
- Если поток доступен для чтения, но не для записи, он `readOnly`.
- Если поток недоступен для чтения и записи, он `writeOnly`.

## `net.connect()`

Псевдонимы [`net.createConnection()`](#netcreateconnection).

Возможные подписи:

- [`net.connect(options[, connectListener])`](#netconnectoptions-connectlistener)
- [`net.connect(path[, connectListener])`](#netconnectpath-connectlistener) для [МПК](#ipc-support) соединения.
- [`net.connect(port[, host][, connectListener])`](#netconnectport-host-connectlistener) для TCP-соединений.

### `net.connect(options[, connectListener])`

<!-- YAML
added: v0.7.0
-->

- `options` {Объект}
- `connectListener` {Функция}
- Возвращает: {net.Socket}

Псевдоним [`net.createConnection(options[, connectListener])`](#netcreateconnectionoptions-connectlistener).

### `net.connect(path[, connectListener])`

<!-- YAML
added: v0.1.90
-->

- `path` {нить}
- `connectListener` {Функция}
- Возвращает: {net.Socket}

Псевдоним [`net.createConnection(path[, connectListener])`](#netcreateconnectionpath-connectlistener).

### `net.connect(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

- `port` {количество}
- `host` {нить}
- `connectListener` {Функция}
- Возвращает: {net.Socket}

Псевдоним [`net.createConnection(port[, host][, connectListener])`](#netcreateconnectionport-host-connectlistener).

## `net.createConnection()`

Заводская функция, которая создает новый [`net.Socket`](#class-netsocket), немедленно инициирует соединение с [`socket.connect()`](#socketconnect), затем возвращает `net.Socket` что запускает соединение.

Когда соединение установлено, [`'connect'`](#event-connect) событие будет испущено на возвращенном сокете. Последний параметр `connectListener`, если указан, будет добавлен как слушатель для [`'connect'`](#event-connect) событие **однажды**.

Возможные подписи:

- [`net.createConnection(options[, connectListener])`](#netcreateconnectionoptions-connectlistener)
- [`net.createConnection(path[, connectListener])`](#netcreateconnectionpath-connectlistener) для [МПК](#ipc-support) соединения.
- [`net.createConnection(port[, host][, connectListener])`](#netcreateconnectionport-host-connectlistener) для TCP-соединений.

В [`net.connect()`](#netconnect) функция - это псевдоним этой функции.

### `net.createConnection(options[, connectListener])`

<!-- YAML
added: v0.1.90
-->

- `options` {Object} Обязательный. Будет передано как [`new net.Socket([options])`](#new-netsocketoptions) звонок и [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener) метод.
- `connectListener` {Function} Общий параметр [`net.createConnection()`](#netcreateconnection) функции. Если указан, будет добавлен как слушатель для [`'connect'`](#event-connect) событие на возвращенном сокете один раз.
- Возвращает: {net.Socket} Вновь созданный сокет, используемый для запуска соединения.

Доступные варианты см. [`new net.Socket([options])`](#new-netsocketoptions) а также [`socket.connect(options[, connectListener])`](#socketconnectoptions-connectlistener).

Дополнительные опции:

- `timeout` {number} Если установлено, будет использоваться для звонка [`socket.setTimeout(timeout)`](#socketsettimeouttimeout-callback) после создания сокета, но до того, как он запустит соединение.

Ниже приведен пример клиента эхо-сервера, описанного в [`net.createServer()`](#netcreateserveroptions-connectionlistener) раздел:

```js
const net = require('net');
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

Для подключения к розетке `/tmp/echo.sock`:

```js
const client = net.createConnection({
  path: '/tmp/echo.sock',
});
```

### `net.createConnection(path[, connectListener])`

<!-- YAML
added: v0.1.90
-->

- `path` {строка} Путь, к которому должен подключиться сокет. Будет передано [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener). Видеть [Определение путей для IPC-соединений](#identifying-paths-for-ipc-connections).
- `connectListener` {Function} Общий параметр [`net.createConnection()`](#netcreateconnection) функции, "один раз" слушатель для `'connect'` событие на инициирующем сокете. Будет передано [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener).
- Возвращает: {net.Socket} Вновь созданный сокет, используемый для запуска соединения.

Инициирует [МПК](#ipc-support) связь.

Эта функция создает новый [`net.Socket`](#class-netsocket) со всеми параметрами, установленными по умолчанию, немедленно инициирует соединение с [`socket.connect(path[, connectListener])`](#socketconnectpath-connectlistener), затем возвращает `net.Socket` что запускает соединение.

### `net.createConnection(port[, host][, connectListener])`

<!-- YAML
added: v0.1.90
-->

- `port` {number} Порт, к которому должен подключаться сокет. Будет передано [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener).
- `host` {строка} Хост, к которому должен подключиться сокет. Будет передано [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener). **Дефолт:** `'localhost'`.
- `connectListener` {Function} Общий параметр [`net.createConnection()`](#netcreateconnection) функции, "один раз" слушатель для `'connect'` событие на инициирующем сокете. Будет передано [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener).
- Возвращает: {net.Socket} Вновь созданный сокет, используемый для запуска соединения.

Инициирует TCP-соединение.

Эта функция создает новый [`net.Socket`](#class-netsocket) со всеми параметрами, установленными по умолчанию, немедленно инициирует соединение с [`socket.connect(port[, host][, connectListener])`](#socketconnectport-host-connectlistener), затем возвращает `net.Socket` что запускает соединение.

## `net.createServer([options][, connectionListener])`

<!-- YAML
added: v0.5.0
-->

- `options` {Объект}
  - `allowHalfOpen` {boolean} Если установлено значение `false`, то сокет автоматически закроет доступную для записи сторону, когда закончится доступная для чтения сторона. **Дефолт:** `false`.
  - `pauseOnConnect` {boolean} Указывает, следует ли приостанавливать работу сокета при входящих подключениях. **Дефолт:** `false`.
- `connectionListener` {Function} Автоматически устанавливается в качестве слушателя для [`'connection'`](#event-connection) событие.
- Возвращает: {net.Server}

Создает новый TCP или [МПК](#ipc-support) сервер.

Если `allowHalfOpen` установлен на `true`, когда другой конец сокета сигнализирует об окончании передачи, сервер отправит обратно конец передачи только тогда, когда [`socket.end()`](#socketenddata-encoding-callback) явно называется. Например, в контексте TCP, когда получен упакованный FIN, упакованный FIN отправляется обратно только тогда, когда [`socket.end()`](#socketenddata-encoding-callback) явно называется. До тех пор соединение полузакрыто (не читается, но все еще доступно для записи). Видеть [`'end'`](#event-end) событие и [RFC 1122](https://tools.ietf.org/html/rfc1122) (раздел 4.2.2.13) для получения дополнительной информации.

Если `pauseOnConnect` установлен на `true`, то сокет, связанный с каждым входящим соединением, будет приостановлен, и данные из его дескриптора не будут считаны. Это позволяет передавать соединения между процессами без чтения каких-либо данных исходным процессом. Чтобы начать чтение данных из приостановленного сокета, вызовите [`socket.resume()`](#socketresume).

Сервер может быть TCP-сервером или [МПК](#ipc-support) сервер, смотря какой он [`listen()`](#serverlisten) к.

Вот пример эхо-сервера TCP, который прослушивает соединения на порту 8124:

```js
const net = require('net');
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

Проверьте это, используя `telnet`:

```console
$ telnet localhost 8124
```

Слушать в розетке `/tmp/echo.sock`:

```js
server.listen('/tmp/echo.sock', () => {
  console.log('server bound');
});
```

Использовать `nc` для подключения к серверу сокетов домена Unix:

```console
$ nc -U /tmp/echo.sock
```

## `net.isIP(input)`

<!-- YAML
added: v0.3.0
-->

- `input` {нить}
- Возвращает: {целое число}

Проверяет, является ли ввод IP-адресом. Возврат `0` для недопустимых строк возвращает `4` для IP-адресов версии 4 и возвращает `6` для IP-адресов версии 6.

## `net.isIPv4(input)`

<!-- YAML
added: v0.3.0
-->

- `input` {нить}
- Возвращает: {логическое}

Возврат `true` если ввод - это IP-адрес версии 4, в противном случае возвращается `false`.

## `net.isIPv6(input)`

<!-- YAML
added: v0.3.0
-->

- `input` {нить}
- Возвращает: {логическое}

Возврат `true` если ввод - это IP-адрес версии 6, в противном случае возвращается `false`.
