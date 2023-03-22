# Модуль http2

<!-- YAML
added: v8.4.0
changes:
  - version:
      - v15.3.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/36070
    description: It is possible to abort a request with an AbortSignal.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34664
    description: Requests with the `host` header (with or without
                 `:authority`) can now be sent/received.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22466
    description: HTTP/2 is now Stable. Previously, it had been Experimental.
-->

<!--introduced_in=v8.4.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/http2.js -->

В `http2` модуль обеспечивает реализацию [HTTP / 2](https://tools.ietf.org/html/rfc7540) протокол. Доступ к нему можно получить, используя:

```js
const http2 = require('http2');
```

## Core API

Core API предоставляет интерфейс низкого уровня, специально разработанный для поддержки функций протокола HTTP / 2. Это конкретно _нет_ разработан для совместимости с существующими [HTTP / 1](http.md) модуль API. Однако [Совместимость API](#compatibility-api) является.

В `http2` Core API гораздо более симметричен между клиентом и сервером, чем `http` API. Например, большинство мероприятий, таких как `'error'`, `'connect'` а также `'stream'`, может генерироваться либо кодом на стороне клиента, либо кодом на стороне сервера.

### Пример на стороне сервера

Ниже показан простой сервер HTTP / 2, использующий Core API. Поскольку нет известных браузеров, поддерживающих [незашифрованный HTTP / 2](https://http2.github.io/faq/#does-http2-require-encryption), использование [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler) необходим при общении с клиентами браузера.

```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem'),
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
  // stream is a Duplex
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  stream.end('<h1>Hello World</h1>');
});

server.listen(8443);
```

Чтобы сгенерировать сертификат и ключ для этого примера, запустите:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

### Пример на стороне клиента

Ниже показан клиент HTTP / 2:

```js
const http2 = require('http2');
const fs = require('fs');
const client = http2.connect('https://localhost:8443', {
  ca: fs.readFileSync('localhost-cert.pem'),
});
client.on('error', (err) => console.error(err));

const req = client.request({ ':path': '/' });

req.on('response', (headers, flags) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }
});

req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => {
  data += chunk;
});
req.on('end', () => {
  console.log(`\n${data}`);
  client.close();
});
req.end();
```

### Класс: `Http2Session`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {EventEmitter}

Экземпляры `http2.Http2Session` class представляют активный сеанс связи между клиентом HTTP / 2 и сервером. Экземпляры этого класса _нет_ предназначен для создания непосредственно пользовательским кодом.

Каждый `Http2Session` Экземпляр будет демонстрировать немного другое поведение в зависимости от того, работает он как сервер или как клиент. В `http2session.type` свойство может использоваться для определения режима, в котором `Http2Session` работает. На стороне сервера пользовательский код редко должен иметь возможность работать с `Http2Session` объект напрямую, при этом большинство действий обычно выполняется через взаимодействие с `Http2Server` или `Http2Stream` объекты.

Код пользователя не создаст `Http2Session` экземпляры напрямую. На стороне сервера `Http2Session` экземпляры создаются `Http2Server` экземпляр, когда получено новое соединение HTTP / 2. Сторона клиента `Http2Session` экземпляры создаются с использованием `http2.connect()` метод.

#### `Http2Session` и розетки

Каждый `Http2Session` экземпляр связан ровно с одним [`net.Socket`](net.md#class-netsocket) или [`tls.TLSSocket`](tls.md#class-tlstlssocket) когда он будет создан. Когда либо `Socket` или `Http2Session` уничтожены, оба будут уничтожены.

Из-за особых требований к сериализации и обработке, налагаемых протоколом HTTP / 2, пользовательскому коду не рекомендуется читать данные из или записывать данные в `Socket` экземпляр привязан к `Http2Session`. Это может перевести сеанс HTTP / 2 в неопределенное состояние, в результате чего сеанс и сокет станут непригодными для использования.

Когда `Socket` был привязан к `Http2Session`, пользовательский код должен полагаться исключительно на API `Http2Session`.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

В `'close'` событие генерируется после того, как `Http2Session` был разрушен. Его слушатель не ожидает никаких аргументов.

#### Событие: `'connect'`

<!-- YAML
added: v8.4.0
-->

- `session` {Http2Session}
- `socket` {net.Socket}

В `'connect'` событие генерируется после того, как `Http2Session` был успешно подключен к удаленному узлу, и связь может начаться.

Код пользователя обычно не отслеживает это событие напрямую.

#### Событие: `'error'`

<!-- YAML
added: v8.4.0
-->

- `error` {Ошибка}

В `'error'` событие генерируется, когда возникает ошибка во время обработки `Http2Session`.

#### Событие: `'frameError'`

<!-- YAML
added: v8.4.0
-->

- `type` {integer} Тип кадра.
- `code` {integer} Код ошибки.
- `id` {integer} Идентификатор потока (или `0` если кадр не связан с потоком).

В `'frameError'` Событие генерируется, когда возникает ошибка при попытке отправить кадр в сеансе. Если кадр, который не удалось отправить, связан с определенным `Http2Stream`, попытка испустить `'frameError'` событие на `Http2Stream` сделан.

Если `'frameError'` событие связано с потоком, поток будет закрыт и уничтожен сразу после `'frameError'` событие. Если событие не связано с потоком, `Http2Session` будет отключен сразу после `'frameError'` событие.

#### Событие: `'goaway'`

<!-- YAML
added: v8.4.0
-->

- `errorCode` {number} Код ошибки HTTP / 2, указанный в `GOAWAY` Рамка.
- `lastStreamID` {number} ID последнего потока, успешно обработанного удаленным узлом (или `0` если не указан ID).
- `opaqueData` {Buffer} Если в `GOAWAY` кадр, а `Buffer` будет передан экземпляр, содержащий эти данные.

В `'goaway'` событие генерируется, когда `GOAWAY` кадр получен.

В `Http2Session` экземпляр будет автоматически выключен, когда `'goaway'` событие испускается.

#### Событие: `'localSettings'`

<!-- YAML
added: v8.4.0
-->

- `settings` {HTTP / 2 Settings Object} Копия `SETTINGS` кадр получен.

В `'localSettings'` событие испускается, когда подтверждение `SETTINGS` кадр получен.

Когда используешь `http2session.settings()` для отправки новых настроек измененные настройки не вступят в силу до тех пор, пока `'localSettings'` событие испускается.

```js
session.settings({ enablePush: false });

session.on('localSettings', (settings) => {
  /* Use the new settings */
});
```

#### Событие: `'ping'`

<!-- YAML
added: v10.12.0
-->

- `payload` {Buffer} `PING` 8-байтовая полезная нагрузка кадра

В `'ping'` событие генерируется всякий раз, когда `PING` фрейм получен от подключенного однорангового узла.

#### Событие: `'remoteSettings'`

<!-- YAML
added: v8.4.0
-->

- `settings` {HTTP / 2 Settings Object} Копия `SETTINGS` кадр получен.

В `'remoteSettings'` событие испускается, когда новый `SETTINGS` фрейм получен от подключенного однорангового узла.

```js
session.on('remoteSettings', (settings) => {
  /* Use the new settings */
});
```

#### Событие: `'stream'`

<!-- YAML
added: v8.4.0
-->

- `stream` {Http2Stream} Ссылка на поток
- `headers` {HTTP / 2 Headers Object} Объект, описывающий заголовки.
- `flags` {number} Связанные числовые флаги
- `rawHeaders` {Array} Массив, содержащий необработанные имена заголовков, за которыми следуют их соответствующие значения.

В `'stream'` событие испускается, когда новый `Http2Stream` создано.

```js
const http2 = require('http2');
session.on('stream', (stream, headers, flags) => {
  const method = headers[':method'];
  const path = headers[':path'];
  // ...
  stream.respond({
    ':status': 200,
    'content-type': 'text/plain; charset=utf-8',
  });
  stream.write('hello ');
  stream.end('world');
});
```

На стороне сервера пользовательский код обычно не будет прослушивать это событие напрямую, а вместо этого будет регистрировать обработчик для `'stream'` событие, созданное `net.Server` или `tls.Server` экземпляры, возвращенные `http2.createServer()` а также `http2.createSecureServer()`соответственно, как в примере ниже:

```js
const http2 = require('http2');

// Create an unencrypted HTTP/2 server
const server = http2.createServer();

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  stream.on('error', (error) => console.error(error));
  stream.end('<h1>Hello World</h1>');
});

server.listen(80);
```

Несмотря на то, что потоки HTTP / 2 и сетевые сокеты не находятся в соответствии 1: 1, сетевая ошибка уничтожит каждый отдельный поток и должна обрабатываться на уровне потока, как показано выше.

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
-->

После `http2session.setTimeout()` используется для установки периода тайм-аута для этого `Http2Session`, то `'timeout'` событие генерируется, если на `Http2Session` после настроенного количества миллисекунд. Его слушатель не ожидает никаких аргументов.

```js
session.setTimeout(2000);
session.on('timeout', () => {
  /* .. */
});
```

#### `http2session.alpnProtocol`

<!-- YAML
added: v9.4.0
-->

- {строка | undefined}

Стоимость будет `undefined` если `Http2Session` еще не подключен к розетке, `h2c` если `Http2Session` не связан с `TLSSocket`, или вернет значение подключенного `TLSSocket`собственный `alpnProtocol` имущество.

#### `http2session.close([callback])`

<!-- YAML
added: v9.4.0
-->

- `callback` {Функция}

Изящно закрывает `Http2Session`, позволяя существующим потокам завершаться самостоятельно и предотвращая появление новых `Http2Stream` экземпляры из создаваемых. После закрытия `http2session.destroy()` _мог бы_ называться, если нет открытых `Http2Stream` экземпляры.

Если указано, `callback` функция зарегистрирована как обработчик для `'close'` событие.

#### `http2session.closed`

<!-- YAML
added: v9.4.0
-->

- {логический}

Будет `true` если это `Http2Session` экземпляр был закрыт, иначе `false`.

#### `http2session.connecting`

<!-- YAML
added: v10.0.0
-->

- {логический}

Будет `true` если это `Http2Session` экземпляр все еще подключается, будет установлено значение `false` перед испусканием `connect` событие и / или вызов `http2.connect` Перезвоните.

#### `http2session.destroy([error][, code])`

<!-- YAML
added: v8.4.0
-->

- `error` {Ошибка} `Error` возражать, если `Http2Session` уничтожается из-за ошибки.
- `code` {number} Код ошибки HTTP / 2 для отправки в окончательном `GOAWAY` Рамка. Если не указано, и `error` не является неопределенным, по умолчанию `INTERNAL_ERROR`, в противном случае по умолчанию `NO_ERROR`.

Немедленно прекращает `Http2Session` и связанные `net.Socket` или `tls.TLSSocket`.

После уничтожения `Http2Session` испустит `'close'` событие. Если `error` не является неопределенным, `'error'` событие будет сгенерировано непосредственно перед `'close'` событие.

Если есть еще открытые `Http2Streams` связанный с `Http2Session`, они также будут уничтожены.

#### `http2session.destroyed`

<!-- YAML
added: v8.4.0
-->

- {логический}

Будет `true` если это `Http2Session` экземпляр был уничтожен и больше не может использоваться, иначе `false`.

#### `http2session.encrypted`

<!-- YAML
added: v9.4.0
-->

- {логическое | неопределенное}

Ценность `undefined` если `Http2Session` сокет сеанса еще не подключен, `true` если `Http2Session` связан с `TLSSocket`, а также `false` если `Http2Session` подключен к любому другому сокету или потоку.

#### `http2session.goaway([code[, lastStreamID[, opaqueData]]])`

<!-- YAML
added: v9.4.0
-->

- `code` {number} Код ошибки HTTP / 2
- `lastStreamID` {number} Числовой идентификатор последнего обработанного `Http2Stream`
- `opaqueData` {Buffer | TypedArray | DataView} A `TypedArray` или `DataView` экземпляр, содержащий дополнительные данные, которые должны быть перенесены в `GOAWAY` Рамка.

Передает `GOAWAY` фрейм к подключенному узлу _без_ закрытие `Http2Session`.

#### `http2session.localSettings`

<!-- YAML
added: v8.4.0
-->

- {Объект настроек HTTP / 2}

Объект без прототипа, описывающий текущие локальные настройки этого `Http2Session`. Локальные настройки являются локальными для _это_ `Http2Session` пример.

#### `http2session.originSet`

<!-- YAML
added: v9.4.0
-->

- {строка \[] | undefined}

Если `Http2Session` подключен к `TLSSocket`, то `originSet` собственность вернет `Array` происхождения, для которых `Http2Session` можно считать авторитетным.

В `originSet` свойство доступно только при использовании безопасного TLS-соединения.

#### `http2session.pendingSettingsAck`

<!-- YAML
added: v8.4.0
-->

- {логический}

Указывает, есть ли `Http2Session` в настоящее время ожидает подтверждения отправки `SETTINGS` Рамка. Будет `true` после вызова `http2session.settings()` метод. Будет `false` однажды все отправлено `SETTINGS` кадры были подтверждены.

#### `http2session.ping([payload, ]callback)`

<!-- YAML
added: v8.9.3
-->

- `payload` {Buffer | TypedArray | DataView} Необязательные полезные данные проверки связи.
- `callback` {Функция}
- Возвращает: {логическое}

Отправляет `PING` фрейм к подключенному узлу HTTP / 2. А `callback` функция должна быть предоставлена. Метод вернет `true` если `PING` было послано, `false` иначе.

Максимальное количество незавершенных (неподтвержденных) эхо-запросов определяется `maxOutstandingPings` вариант конфигурации. Максимальное значение по умолчанию - 10.

Если предусмотрено, `payload` должен быть `Buffer`, `TypedArray`, или `DataView` содержащий 8 байтов данных, которые будут переданы с `PING` и вернулся с подтверждением ping.

Обратный вызов будет вызван с тремя аргументами: аргумент ошибки, который будет `null` если `PING` был успешно признан, `duration` аргумент, который сообщает количество миллисекунд, прошедших с момента отправки эхо-запроса и получения подтверждения, и `Buffer` содержащий 8-байтовый `PING` полезная нагрузка.

```js
session.ping(
  Buffer.from('abcdefgh'),
  (err, duration, payload) => {
    if (!err) {
      console.log(
        `Ping acknowledged in ${duration} milliseconds`
      );
      console.log(`With payload '${payload.toString()}'`);
    }
  }
);
```

Если `payload` аргумент не указан, полезной нагрузкой по умолчанию будет 64-битная временная метка (с прямым порядком байтов), обозначающая начало `PING` продолжительность.

#### `http2session.ref()`

<!-- YAML
added: v9.4.0
-->

Звонки [`ref()`](net.md#socketref) на этом `Http2Session` базовый экземпляр [`net.Socket`](net.md#class-netsocket).

#### `http2session.remoteSettings`

<!-- YAML
added: v8.4.0
-->

- {Объект настроек HTTP / 2}

Объект без прототипа, описывающий текущие удаленные настройки этого `Http2Session`. Удаленные настройки устанавливаются _связаны_ HTTP / 2 одноранговый узел.

#### `http2session.setLocalWindowSize(windowSize)`

<!-- YAML
added:
  - v15.3.0
  - v14.18.0
-->

- `windowSize` {количество}

Устанавливает размер окна локальной конечной точки. В `windowSize` - это общий размер окна, который нужно установить, а не дельта.

```js
const http2 = require('http2');

const server = http2.createServer();
const expectedWindowSize = 2 ** 20;
server.on('connect', (session) => {
  // Set local window size to be 2 ** 20
  session.setLocalWindowSize(expectedWindowSize);
});
```

#### `http2session.setTimeout(msecs, callback)`

<!-- YAML
added: v8.4.0
-->

- `msecs` {количество}
- `callback` {Функция}

Используется для установки функции обратного вызова, которая вызывается при отсутствии активности на `Http2Session` после `msecs` миллисекунды. Данный `callback` зарегистрирован как слушатель на `'timeout'` событие.

#### `http2session.socket`

<!-- YAML
added: v8.4.0
-->

- {net.Socket | tls.TLSSocket}

Возвращает `Proxy` объект, который действует как `net.Socket` (или `tls.TLSSocket`), но ограничивает доступные методы теми, которые безопасны для использования с HTTP / 2.

`destroy`, `emit`, `end`, `pause`, `read`, `resume`, а также `write` выдаст ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`. Видеть [`Http2Session` и розетки](#http2session-and-sockets) для дополнительной информации.

`setTimeout` метод будет вызываться на этом `Http2Session`.

Все остальные взаимодействия будут направляться непосредственно в сокет.

#### `http2session.state`

<!-- YAML
added: v8.4.0
-->

Предоставляет различную информацию о текущем состоянии `Http2Session`.

- {Объект}
  - `effectiveLocalWindowSize` {number} Текущий размер окна локального (принимаемого) управления потоком для `Http2Session`.
  - `effectiveRecvDataLength` {number} Текущее количество байтов, полученных с момента последнего управления потоком. `WINDOW_UPDATE`.
  - `nextStreamID` {number} Числовой идентификатор, который будет использоваться в следующий раз, когда новый `Http2Stream` создается этим `Http2Session`.
  - `localWindowSize` {number} Количество байтов, которое удаленный узел может отправить, не получив `WINDOW_UPDATE`.
  - `lastProcStreamID` {number} Числовой идентификатор `Http2Stream` для чего `HEADERS` или `DATA` кадр был получен совсем недавно.
  - `remoteWindowSize` {number} Количество байтов, которое `Http2Session` может отправить, не получив `WINDOW_UPDATE`.
  - `outboundQueueSize` {number} Количество кадров, находящихся на данный момент в исходящей очереди для этого `Http2Session`.
  - `deflateDynamicTableSize` {number} Текущий размер в байтах таблицы состояний сжатия исходящего заголовка.
  - `inflateDynamicTableSize` {number} Текущий размер в байтах таблицы состояний сжатия входящего заголовка.

Объект, описывающий текущий статус этого `Http2Session`.

#### `http2session.settings([settings][, callback])`

<!-- YAML
added: v8.4.0
-->

- `settings` {Объект настроек HTTP / 2}
- `callback` {Функция} Обратный вызов, который вызывается после подключения сеанса или сразу же, если сеанс уже подключен.
  - `err` {Ошибка | ноль}
  - `settings` {Объект настроек HTTP / 2} Обновленный `settings` объект.
  - `duration` {целое число}

Обновляет текущие локальные настройки для этого `Http2Session` и отправляет новый `SETTINGS` фрейм к подключенному узлу HTTP / 2.

После вызова `http2session.pendingSettingsAck` собственность будет `true` пока сеанс ожидает, пока удаленный узел подтвердит новые настройки.

Новые настройки не вступят в силу до тех пор, пока `SETTINGS` подтверждение получено, и `'localSettings'` событие испускается. Можно отправить несколько `SETTINGS` кадры, пока подтверждение еще не получено.

#### `http2session.type`

<!-- YAML
added: v8.4.0
-->

- {количество}

В `http2session.type` будет равно `http2.constants.NGHTTP2_SESSION_SERVER` если это `Http2Session` instance - это сервер, а `http2.constants.NGHTTP2_SESSION_CLIENT` если экземпляр является клиентом.

#### `http2session.unref()`

<!-- YAML
added: v9.4.0
-->

Звонки [`unref()`](net.md#socketunref) на этом `Http2Session` базовый экземпляр [`net.Socket`](net.md#class-netsocket).

### Класс: `ServerHttp2Session`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {Http2Session}

#### `serverhttp2session.altsvc(alt, originOrStream)`

<!-- YAML
added: v9.4.0
-->

- `alt` {строка} Описание альтернативной конфигурации службы, как определено [RFC 7838](https://tools.ietf.org/html/rfc7838).
- `originOrStream` {number | string | URL | Object} Либо строка URL, указывающая источник (или `Object` с `origin` свойство) или числовой идентификатор активного `Http2Stream` как дано `http2stream.id` имущество.

Представляет `ALTSVC` кадр (как определено [RFC 7838](https://tools.ietf.org/html/rfc7838)) подключенному клиенту.

```js
const http2 = require('http2');

const server = http2.createServer();
server.on('session', (session) => {
  // Set altsvc for origin https://example.org:80
  session.altsvc('h2=":8000"', 'https://example.org:80');
});

server.on('stream', (stream) => {
  // Set altsvc for a specific stream
  stream.session.altsvc('h2=":8000"', stream.id);
});
```

Отправка `ALTSVC` кадр с определенным идентификатором потока указывает, что альтернативная услуга связана с источником данного `Http2Stream`.

В `alt` и исходная строка _должен_ содержат только байты ASCII и строго интерпретируются как последовательность байтов ASCII. Особая ценность `'clear'` может быть передан для очистки любой ранее установленной альтернативной службы для данного домена.

Когда строка передается для `originOrStream` аргумент, он будет проанализирован как URL-адрес, и источник будет получен. Например, происхождение URL-адреса HTTP `'https://example.org/foo/bar'` это строка ASCII `'https://example.org'`. Будет выдана ошибка, если либо данная строка не может быть проанализирована как URL-адрес, либо если действительное происхождение не может быть получено.

А `URL` объект или любой объект с `origin` свойство, может быть передано как `originOrStream`, в этом случае значение `origin` собственность будет использоваться. Ценность `origin` имущество _должен_ быть правильно сериализованным источником ASCII.

#### Указание альтернативных услуг

Формат `alt` параметр строго определяется [RFC 7838](https://tools.ietf.org/html/rfc7838) в виде строки ASCII, содержащей разделенный запятыми список «альтернативных» протоколов, связанных с конкретным хостом и портом.

Например, значение `'h2="example.org:81"'` указывает, что протокол HTTP / 2 доступен на хосте `'example.org'` на порт TCP / IP 81. Хост и порт _должен_ содержаться в цитате (`"`) символы.

Могут быть указаны несколько альтернатив, например: `'h2="example.org:81", h2=":82"'`.

Идентификатор протокола (`'h2'` в примерах) может быть любым допустимым [Идентификатор протокола ALPN](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids).

Синтаксис этих значений не проверяется реализацией Node.js и передается, как указано пользователем или получено от однорангового узла.

#### `serverhttp2session.origin(...origins)`

<!-- YAML
added: v10.12.0
-->

- `origins` {строка | URL | Object} Одна или несколько строк URL, переданных как отдельные аргументы.

Представляет `ORIGIN` кадр (как определено [RFC 8336](https://tools.ietf.org/html/rfc8336)) подключенному клиенту, чтобы объявить набор источников, для которых сервер может предоставлять достоверные ответы.

```js
const http2 = require('http2');
const options = getSecureOptionsSomehow();
const server = http2.createSecureServer(options);
server.on('stream', (stream) => {
  stream.respond();
  stream.end('ok');
});
server.on('session', (session) => {
  session.origin(
    'https://example.com',
    'https://example.org'
  );
});
```

Когда строка передается как `origin`, он будет проанализирован как URL-адрес, и источник будет получен. Например, происхождение URL-адреса HTTP `'https://example.org/foo/bar'` это строка ASCII `'https://example.org'`. Будет выдана ошибка, если либо данная строка не может быть проанализирована как URL-адрес, либо если действительное происхождение не может быть получено.

А `URL` объект или любой объект с `origin` собственность, может быть передана как `origin`, в этом случае значение `origin` собственность будет использоваться. Ценность `origin` имущество _должен_ быть правильно сериализованным источником ASCII.

В качестве альтернативы `origins` параметр может использоваться при создании нового сервера HTTP / 2 с помощью `http2.createSecureServer()` метод:

```js
const http2 = require('http2');
const options = getSecureOptionsSomehow();
options.origins = [
  'https://example.com',
  'https://example.org',
];
const server = http2.createSecureServer(options);
server.on('stream', (stream) => {
  stream.respond();
  stream.end('ok');
});
```

### Класс: `ClientHttp2Session`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {Http2Session}

#### Событие: `'altsvc'`

<!-- YAML
added: v9.4.0
-->

- `alt` {нить}
- `origin` {нить}
- `streamId` {количество}

В `'altsvc'` событие генерируется всякий раз, когда `ALTSVC` кадр получен клиентом. Событие испускается с `ALTSVC` значение, источник и идентификатор потока. Если нет `origin` предоставляется в `ALTSVC` Рамка, `origin` будет пустой строкой.

```js
const http2 = require('http2');
const client = http2.connect('https://example.org');

client.on('altsvc', (alt, origin, streamId) => {
  console.log(alt);
  console.log(origin);
  console.log(streamId);
});
```

#### Событие: `'origin'`

<!-- YAML
added: v10.12.0
-->

- `origins` {нить\[]}

В `'origin'` событие генерируется всякий раз, когда `ORIGIN` кадр получен клиентом. Событие испускается с массивом `origin` струны. В `http2session.originSet` будет обновлено, чтобы включить полученные исходные данные.

```js
const http2 = require('http2');
const client = http2.connect('https://example.org');

client.on('origin', (origins) => {
  for (let n = 0; n < origins.length; n++)
    console.log(origins[n]);
});
```

В `'origin'` Событие генерируется только при использовании безопасного TLS-соединения.

#### `clienthttp2session.request(headers[, options])`

<!-- YAML
added: v8.4.0
-->

- `headers` {Объект заголовков HTTP / 2}

- `options` {Объект}

  - `endStream` {логический} `true` если `Http2Stream` _записываемый_ сторона должна быть изначально закрыта, например, при отправке `GET` запрос, который не должен ожидать тела полезной нагрузки.
  - `exclusive` {boolean} Когда `true` а также `parent` идентифицирует родительский поток, созданный поток становится единственной прямой зависимостью от родительского потока, а все другие существующие зависимые объекты становятся зависимыми от вновь созданного потока. **Дефолт:** `false`.
  - `parent` {number} Задает числовой идентификатор потока, от которого зависит вновь созданный поток.
  - `weight` {number} Определяет относительную зависимость потока по отношению к другим потокам с таким же `parent`. Значение - это число между `1` а также `256` (включительно).
  - `waitForTrailers` {boolean} Когда `true`, то `Http2Stream` испустит `'wantTrailers'` событие после финала `DATA` кадр был отправлен.
  - `signal` {AbortSignal} AbortSignal, который может использоваться для прерывания текущего запроса.

- Возвращает: {ClientHttp2Stream}

Для клиента HTTP / 2 `Http2Session` только экземпляры, `http2session.request()` создает и возвращает `Http2Stream` экземпляр, который можно использовать для отправки запроса HTTP / 2 на подключенный сервер.

Этот метод доступен, только если `http2session.type` равно `http2.constants.NGHTTP2_SESSION_CLIENT`.

```js
const http2 = require('http2');
const clientSession = http2.connect(
  'https://localhost:1234'
);
const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
} = http2.constants;

const req = clientSession.request({
  [HTTP2_HEADER_PATH]: '/',
});
req.on('response', (headers) => {
  console.log(headers[HTTP2_HEADER_STATUS]);
  req.on('data', (chunk) => {
    /* .. */
  });
  req.on('end', () => {
    /* .. */
  });
});
```

Когда `options.waitForTrailers` опция установлена, `'wantTrailers'` Событие генерируется сразу после постановки в очередь последнего блока данных полезной нагрузки для отправки. В `http2stream.sendTrailers()` затем можно вызвать метод для отправки конечных заголовков партнеру.

Когда `options.waitForTrailers` установлен, `Http2Stream` не закроется автоматически, когда последний `DATA` кадр передается. Код пользователя должен вызывать либо `http2stream.sendTrailers()` или `http2stream.close()` закрыть `Http2Stream`.

Когда `options.signal` установлен с `AbortSignal` а потом `abort` на соответствующем `AbortController` вызывается, запрос выдаст `'error'` событие с `AbortError` ошибка.

В `:method` а также `:path` псевдозаголовки не указаны в `headers`, они соответственно по умолчанию:

- `:method` знак равно `'GET'`
- `:path` знак равно `/`

### Класс: `Http2Stream`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {stream.Duplex}

Каждый экземпляр `Http2Stream` class представляет двунаправленный поток связи HTTP / 2 по `Http2Session` пример. Любой сингл `Http2Session` может быть до 2<sup>31 год</sup>-1 `Http2Stream` экземпляров за время его существования.

Пользовательский код не будет построен `Http2Stream` экземпляры напрямую. Скорее, они создаются, управляются и предоставляются пользовательскому коду через `Http2Session` пример. На сервере `Http2Stream` экземпляры создаются либо в ответ на входящий HTTP-запрос (и передаются пользовательскому коду через `'stream'` событие), или в ответ на вызов `http2stream.pushStream()` метод. На клиенте `Http2Stream` экземпляры создаются и возвращаются, когда либо `http2session.request()` вызывается метод, или в ответ на входящий `'push'` событие.

В `Http2Stream` класс является базой для [`ServerHttp2Stream`](#class-serverhttp2stream) а также [`ClientHttp2Stream`](#class-clienthttp2stream) классы, каждый из которых используется отдельно на стороне сервера или клиента соответственно.

Все `Http2Stream` экземпляры [`Duplex`](stream.md#class-streamduplex) потоки. В `Writable` сторона `Duplex` используется для отправки данных подключенному узлу, в то время как `Readable` Сторона используется для приема данных, отправленных подключенным одноранговым узлом.

Кодировка текстовых символов по умолчанию для всех `Http2Stream`s - это UTF-8. Рекомендуется, чтобы при использовании `Http2Stream` чтобы отправить текст, `'content-type'` заголовок должен быть установлен и должен идентифицировать используемую кодировку символов.

```js
stream.respond({
  'content-type': 'text/html; charset=utf-8',
  ':status': 200,
});
```

#### `Http2Stream` Жизненный цикл

##### Творчество

На стороне сервера экземпляры [`ServerHttp2Stream`](#class-serverhttp2stream) создаются либо когда:

- Новый HTTP / 2 `HEADERS` получен кадр с ранее неиспользованным идентификатором потока;
- В `http2stream.pushStream()` вызывается метод.

На стороне клиента экземпляры [`ClientHttp2Stream`](#class-clienthttp2stream) создаются, когда `http2session.request()` вызывается метод.

На клиенте `Http2Stream` экземпляр, возвращенный `http2session.request()` может быть не сразу готов к использованию, если родительский `Http2Session` еще полностью не установлено. В таких случаях операции вызывались `Http2Stream` будут буферизированы до тех пор, пока `'ready'` событие испускается. Код пользователя должен редко, если вообще когда-либо, обрабатывать `'ready'` событие напрямую. Готовый статус `Http2Stream` можно определить, проверив значение `http2stream.id`. Если значение равно `undefined`, поток еще не готов к использованию.

##### Разрушение

Все [`Http2Stream`](#class-http2stream) экземпляры уничтожаются либо когда:

- An `RST_STREAM` кадр для потока получен подключенным одноранговым узлом, и (только для клиентских потоков) ожидающие данные были прочитаны.
- В `http2stream.close()` вызывается метод, и (только для клиентских потоков) ожидающие данные были прочитаны.
- В `http2stream.destroy()` или `http2session.destroy()` методы называются.

Когда `Http2Stream` экземпляр уничтожен, будет предпринята попытка отправить `RST_STREAM` фрейм к подключенному узлу.

Когда `Http2Stream` экземпляр уничтожен, `'close'` событие будет выпущено. Потому что `Http2Stream` это пример `stream.Duplex`, то `'end'` событие также будет сгенерировано, если данные потока текут в данный момент. В `'error'` событие также может быть сгенерировано, если `http2stream.destroy()` был вызван с `Error` передается как первый аргумент.

После `Http2Stream` был уничтожен, `http2stream.destroyed` собственность будет `true` и `http2stream.rstCode` свойство будет указывать `RST_STREAM` код ошибки. В `Http2Stream` После уничтожения экземпляр больше не может использоваться.

#### Событие: `'aborted'`

<!-- YAML
added: v8.4.0
-->

В `'aborted'` событие генерируется всякий раз, когда `Http2Stream` Экземпляр ненормально прерывается во время обмена данными. Его слушатель не ожидает никаких аргументов.

В `'aborted'` событие будет сгенерировано только в том случае, если `Http2Stream` записываемая сторона не закончена.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

В `'close'` событие генерируется, когда `Http2Stream` уничтожен. Как только это событие генерируется, `Http2Stream` экземпляр больше не используется.

Код ошибки HTTP / 2, используемый при закрытии потока, можно получить с помощью `http2stream.rstCode` имущество. Если код имеет любое значение, кроме `NGHTTP2_NO_ERROR` (`0`), `'error'` событие также будет отправлено.

#### Событие: `'error'`

<!-- YAML
added: v8.4.0
-->

- `error` {Ошибка}

В `'error'` событие генерируется, когда возникает ошибка во время обработки `Http2Stream`.

#### Событие: `'frameError'`

<!-- YAML
added: v8.4.0
-->

- `type` {integer} Тип кадра.
- `code` {integer} Код ошибки.
- `id` {integer} Идентификатор потока (или `0` если кадр не связан с потоком).

В `'frameError'` Событие генерируется, когда возникает ошибка при попытке отправить фрейм. При вызове функция-обработчик получит целочисленный аргумент, определяющий тип кадра, и целочисленный аргумент, определяющий код ошибки. В `Http2Stream` экземпляр будет уничтожен сразу после `'frameError'` событие испускается.

#### Событие: `'ready'`

<!-- YAML
added: v8.4.0
-->

В `'ready'` событие генерируется, когда `Http2Stream` открыт, ему присвоен `id`, и может быть использован. Слушатель не ожидает никаких аргументов.

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
-->

В `'timeout'` событие генерируется после того, как для этого не было получено никаких действий `Http2Stream` в пределах количества миллисекунд, установленных с помощью `http2stream.setTimeout()`. Его слушатель не ожидает никаких аргументов.

#### Событие: `'trailers'`

<!-- YAML
added: v8.4.0
-->

- `headers` {HTTP / 2 Headers Object} Объект, описывающий заголовки.
- `flags` {number} Связанные числовые флаги

В `'trailers'` Событие генерируется при получении блока заголовков, связанных с завершающими полями заголовка. Обратный вызов слушателя передается [Объект заголовков HTTP / 2](#headers-object) и флаги, связанные с заголовками.

Это событие не может быть сгенерировано, если `http2stream.end()` вызывается до приема трейлеров, а входящие данные не читаются и не прослушиваются.

```js
stream.on('trailers', (headers, flags) => {
  console.log(headers);
});
```

#### Событие: `'wantTrailers'`

<!-- YAML
added: v10.0.0
-->

В `'wantTrailers'` событие генерируется, когда `Http2Stream` стоит в очереди на финал `DATA` кадр для отправки на кадре и `Http2Stream` готов к отправке конечных заголовков. При инициировании запроса или ответа `waitForTrailers` параметр должен быть установлен, чтобы это событие было испущено.

#### `http2stream.aborted`

<!-- YAML
added: v8.4.0
-->

- {логический}

Установлен в `true` если `Http2Stream` Экземпляр был аварийно прерван. Когда установлено, `'aborted'` событие будет отправлено.

#### `http2stream.bufferSize`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

- {количество}

Это свойство показывает количество символов, которые в настоящее время буферизированы для записи. Видеть [`net.Socket.bufferSize`](net.md#socketbuffersize) для подробностей.

#### `http2stream.close(code[, callback])`

<!-- YAML
added: v8.4.0
-->

- `code` {number} 32-битное целое число без знака, идентифицирующее код ошибки. **Дефолт:** `http2.constants.NGHTTP2_NO_ERROR` (`0x00`).
- `callback` {Function} Необязательная функция, зарегистрированная для прослушивания `'close'` событие.

Закрывает `Http2Stream` экземпляр, отправив `RST_STREAM` фрейм к подключенному узлу HTTP / 2.

#### `http2stream.closed`

<!-- YAML
added: v9.4.0
-->

- {логический}

Установлен в `true` если `Http2Stream` экземпляр был закрыт.

#### `http2stream.destroyed`

<!-- YAML
added: v8.4.0
-->

- {логический}

Установлен в `true` если `Http2Stream` Экземпляр был уничтожен и больше не может использоваться.

#### `http2stream.endAfterHeaders`

<!-- YAML
added: v10.11.0
-->

- {логический}

Установить `true` если `END_STREAM` в полученном кадре HEADERS запроса или ответа был установлен флаг, указывающий на то, что дополнительные данные не должны приниматься и читаемая сторона `Http2Stream` будет закрыто.

#### `http2stream.id`

<!-- YAML
added: v8.4.0
-->

- {number | undefined}

Числовой идентификатор потока этого `Http2Stream` пример. Установлен в `undefined` если идентификатор потока еще не назначен.

#### `http2stream.pending`

<!-- YAML
added: v9.4.0
-->

- {логический}

Установлен в `true` если `Http2Stream` экземпляру еще не присвоен числовой идентификатор потока.

#### `http2stream.priority(options)`

<!-- YAML
added: v8.4.0
-->

- `options` {Объект}
  - `exclusive` {boolean} Когда `true` а также `parent` идентифицирует родительский поток, этот поток становится единственной прямой зависимостью от родительского потока, а все другие существующие зависимые объекты становятся зависимыми от этого потока. **Дефолт:** `false`.
  - `parent` {number} Задает числовой идентификатор потока, от которого зависит этот поток.
  - `weight` {number} Определяет относительную зависимость потока по отношению к другим потокам с таким же `parent`. Значение - это число между `1` а также `256` (включительно).
  - `silent` {boolean} Когда `true`, меняет приоритет локально, не отправляя `PRIORITY` фрейм к подключенному узлу.

Обновляет приоритет для этого `Http2Stream` пример.

#### `http2stream.rstCode`

<!-- YAML
added: v8.4.0
-->

- {количество}

Установите на `RST_STREAM` [код ошибки](#error-codes-for-rst_stream-and-goaway) сообщил, когда `Http2Stream` уничтожается после получения `RST_STREAM` кадр от подключенного однорангового узла, вызывающий `http2stream.close()`, или `http2stream.destroy()`. Будет `undefined` если `Http2Stream` не был закрыт.

#### `http2stream.sentHeaders`

<!-- YAML
added: v9.5.0
-->

- {Объект заголовков HTTP / 2}

Объект, содержащий исходящие заголовки, отправленные для этого `Http2Stream`.

#### `http2stream.sentInfoHeaders`

<!-- YAML
added: v9.5.0
-->

- {Объект заголовков HTTP / 2 \[]}

Массив объектов, содержащих исходящие информационные (дополнительные) заголовки, отправленные для этого `Http2Stream`.

#### `http2stream.sentTrailers`

<!-- YAML
added: v9.5.0
-->

- {Объект заголовков HTTP / 2}

Объект, содержащий отправленные для этого исходящие трейлеры. `HttpStream`.

#### `http2stream.session`

<!-- YAML
added: v8.4.0
-->

- {Http2Session}

Ссылка на `Http2Session` экземпляр, которому принадлежит это `Http2Stream`. Стоимость будет `undefined` после `Http2Stream` экземпляр уничтожен.

#### `http2stream.setTimeout(msecs, callback)`

<!-- YAML
added: v8.4.0
-->

- `msecs` {количество}
- `callback` {Функция}

```js
const http2 = require('http2');
const client = http2.connect('http://example.org:8000');
const { NGHTTP2_CANCEL } = http2.constants;
const req = client.request({ ':path': '/' });

// Cancel the stream if there's no activity after 5 seconds
req.setTimeout(5000, () => req.close(NGHTTP2_CANCEL));
```

#### `http2stream.state`

<!-- YAML
added: v8.4.0
-->

Предоставляет различную информацию о текущем состоянии `Http2Stream`.

- {Объект}
  - `localWindowSize` {number} Количество байтов, которое подключенный одноранговый узел может отправить для этого `Http2Stream` не получив `WINDOW_UPDATE`.
  - `state` {number} Флаг, указывающий на низкоуровневое текущее состояние `Http2Stream` как определено `nghttp2`.
  - `localClose` {количество} `1` если это `Http2Stream` был закрыт на месте.
  - `remoteClose` {количество} `1` если это `Http2Stream` был закрыт удаленно.
  - `sumDependencyWeight` {number} Суммарный вес всех `Http2Stream` экземпляры, которые зависят от этого `Http2Stream` как указано с использованием `PRIORITY` кадры.
  - `weight` {number} Приоритетный вес этого `Http2Stream`.

Текущее состояние этого `Http2Stream`.

#### `http2stream.sendTrailers(headers)`

<!-- YAML
added: v10.0.0
-->

- `headers` {Объект заголовков HTTP / 2}

Отправляет завершающий `HEADERS` фрейм к подключенному узлу HTTP / 2. Этот метод вызовет `Http2Stream` должны быть немедленно закрыты и должны вызываться только после `'wantTrailers'` событие было отправлено. При отправке запроса или ответа `options.waitForTrailers` параметр должен быть установлен, чтобы сохранить `Http2Stream` откроется после финала `DATA` рама, чтобы можно было отправлять прицепы.

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond(undefined, { waitForTrailers: true });
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ xyz: 'abc' });
  });
  stream.end('Hello World');
});
```

Спецификация HTTP / 1 запрещает трейлерам содержать поля псевдозаголовка HTTP / 2 (например, `':method'`, `':path'`, так далее).

### Класс: `ClientHttp2Stream`

<!-- YAML
added: v8.4.0
-->

- Расширяет {Http2Stream}

В `ClientHttp2Stream` класс является расширением `Http2Stream` который используется исключительно на клиентах HTTP / 2. `Http2Stream` экземпляры на клиенте предоставляют такие события, как `'response'` а также `'push'` которые актуальны только для клиента.

#### Событие: `'continue'`

<!-- YAML
added: v8.5.0
-->

Излучается, когда сервер отправляет `100 Continue` статус, обычно потому, что запрос содержал `Expect: 100-continue`. Это инструкция о том, что клиент должен отправить тело запроса.

#### Событие: `'headers'`

<!-- YAML
added: v8.4.0
-->

В `'headers'` событие генерируется, когда для потока получен дополнительный блок заголовков, например, когда блок `1xx` получены информационные заголовки. Обратный вызов слушателя передается [Объект заголовков HTTP / 2](#headers-object) и флаги, связанные с заголовками.

```js
stream.on('headers', (headers, flags) => {
  console.log(headers);
});
```

#### Событие: `'push'`

<!-- YAML
added: v8.4.0
-->

В `'push'` Событие генерируется при получении заголовков ответа для потока Server Push. Обратный вызов слушателя передается [Объект заголовков HTTP / 2](#headers-object) и флаги, связанные с заголовками.

```js
stream.on('push', (headers, flags) => {
  console.log(headers);
});
```

#### Событие: `'response'`

<!-- YAML
added: v8.4.0
-->

В `'response'` событие генерируется, когда ответ `HEADERS` был получен кадр для этого потока от подключенного сервера HTTP / 2. Слушатель вызывается с двумя аргументами: `Object` содержащий полученные [Объект заголовков HTTP / 2](#headers-object), и флаги, связанные с заголовками.

```js
const http2 = require('http2');
const client = http2.connect('https://localhost');
const req = client.request({ ':path': '/' });
req.on('response', (headers, flags) => {
  console.log(headers[':status']);
});
```

### Класс: `ServerHttp2Stream`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {Http2Stream}

В `ServerHttp2Stream` класс является расширением [`Http2Stream`](#class-http2stream) который используется исключительно на серверах HTTP / 2. `Http2Stream` экземпляры на сервере предоставляют дополнительные методы, такие как `http2stream.pushStream()` а также `http2stream.respond()` которые актуальны только на сервере.

#### `http2stream.additionalHeaders(headers)`

<!-- YAML
added: v8.4.0
-->

- `headers` {Объект заголовков HTTP / 2}

Отправляет дополнительную информационную `HEADERS` фрейм к подключенному узлу HTTP / 2.

#### `http2stream.headersSent`

<!-- YAML
added: v8.4.0
-->

- {логический}

Истина, если заголовки были отправлены, в противном случае - ложь (только для чтения).

#### `http2stream.pushAllowed`

<!-- YAML
added: v8.4.0
-->

- {логический}

Свойство только для чтения, сопоставленное с `SETTINGS_ENABLE_PUSH` флаг самого последнего удаленного клиента `SETTINGS` Рамка. Будет `true` если удаленный узел принимает push-потоки, `false` иначе. Настройки одинаковы для всех `Http2Stream` В то же самое `Http2Session`.

#### `http2stream.pushStream(headers[, options], callback)`

<!-- YAML
added: v8.4.0
-->

- `headers` {Объект заголовков HTTP / 2}
- `options` {Объект}
  - `exclusive` {boolean} Когда `true` а также `parent` идентифицирует родительский поток, созданный поток становится единственной прямой зависимостью от родительского потока, а все другие существующие зависимые объекты становятся зависимыми от вновь созданного потока. **Дефолт:** `false`.
  - `parent` {number} Задает числовой идентификатор потока, от которого зависит вновь созданный поток.
- `callback` {Функция} Обратный вызов, который вызывается после инициирования потока push.
  - `err` {Ошибка}
  - `pushStream` {ServerHttp2Stream} Возвращенный `pushStream` объект.
  - `headers` {HTTP / 2 Headers Object} Заголовки - объект `pushStream` был инициирован с.

Инициирует push-поток. Обратный вызов вызывается с новым `Http2Stream` экземпляр, созданный для потока push, переданного в качестве второго аргумента, или `Error` передается как первый аргумент.

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond({ ':status': 200 });
  stream.pushStream(
    { ':path': '/' },
    (err, pushStream, headers) => {
      if (err) throw err;
      pushStream.respond({ ':status': 200 });
      pushStream.end('some pushed data');
    }
  );
  stream.end('some data');
});
```

Установка веса push-потока не допускается в `HEADERS` Рамка. Пройти `weight` ценность для `http2stream.priority` с `silent` опция установлена на `true` чтобы включить балансировку полосы пропускания на стороне сервера между параллельными потоками.

Вызов `http2stream.pushStream()` изнутри проталкиваемого потока не разрешено и вызовет ошибку.

#### `http2stream.respond([headers[, options]])`

<!-- YAML
added: v8.4.0
changes:
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33160
    description: Allow explicitly setting date headers.
-->

- `headers` {Объект заголовков HTTP / 2}
- `options` {Объект}
  - `endStream` {boolean} Установить на `true` чтобы указать, что ответ не будет включать данные полезной нагрузки.
  - `waitForTrailers` {boolean} Когда `true`, то `Http2Stream` испустит `'wantTrailers'` событие после финала `DATA` кадр был отправлен.

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond({ ':status': 200 });
  stream.end('some data');
});
```

Когда `options.waitForTrailers` опция установлена, `'wantTrailers'` Событие будет сгенерировано сразу после постановки в очередь последнего блока данных полезной нагрузки для отправки. В `http2stream.sendTrailers()` затем можно использовать для отправки конечных полей заголовка партнеру.

Когда `options.waitForTrailers` установлен, `Http2Stream` не закроется автоматически, когда последний `DATA` кадр передается. Код пользователя должен вызывать либо `http2stream.sendTrailers()` или `http2stream.close()` закрыть `Http2Stream`.

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respond(
    { ':status': 200 },
    { waitForTrailers: true }
  );
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ ABC: 'some value to send' });
  });
  stream.end('some data');
});
```

#### `http2stream.respondWithFD(fd[, headers[, options]])`

<!-- YAML
added: v8.4.0
changes:
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33160
    description: Allow explicitly setting date headers.
  - version: v12.12.0
    pr-url: https://github.com/nodejs/node/pull/29876
    description: The `fd` option may now be a `FileHandle`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18936
    description: Any readable file descriptor, not necessarily for a
                 regular file, is supported now.
-->

- `fd` {number | FileHandle} Читаемый дескриптор файла.
- `headers` {Объект заголовков HTTP / 2}
- `options` {Объект}
  - `statCheck` {Функция}
  - `waitForTrailers` {boolean} Когда `true`, то `Http2Stream` испустит `'wantTrailers'` событие после финала `DATA` кадр был отправлен.
  - `offset` {number} Позиция смещения, с которой следует начать чтение.
  - `length` {number} Объем данных из файлового дескриптора для отправки.

Инициирует ответ, данные которого считываются из указанного файлового дескриптора. Для данного файлового дескриптора проверка не выполняется. Если при попытке чтения данных с помощью дескриптора файла возникает ошибка, `Http2Stream` будет закрыто с использованием `RST_STREAM` рама с использованием стандарта `INTERNAL_ERROR` код.

При использовании `Http2Stream` объекты `Duplex` интерфейс будет закрыт автоматически.

```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createServer();
server.on('stream', (stream) => {
  const fd = fs.openSync('/some/file', 'r');

  const stat = fs.fstatSync(fd);
  const headers = {
    'content-length': stat.size,
    'last-modified': stat.mtime.toUTCString(),
    'content-type': 'text/plain; charset=utf-8',
  };
  stream.respondWithFD(fd, headers);
  stream.on('close', () => fs.closeSync(fd));
});
```

Необязательный `options.statCheck` функция может быть указана, чтобы дать пользовательскому коду возможность устанавливать дополнительные заголовки контента на основе `fs.Stat` детали данного фд. Если `statCheck` функция предусмотрена, `http2stream.respondWithFD()` метод выполнит `fs.fstat()` вызов для сбора сведений о предоставленном дескрипторе файла.

В `offset` а также `length` параметры могут использоваться, чтобы ограничить ответ конкретным подмножеством диапазона. Это можно использовать, например, для поддержки запросов диапазона HTTP.

Дескриптор файла или `FileHandle` не закрывается, когда поток закрыт, поэтому его нужно будет закрыть вручную, если он больше не нужен. Одновременное использование одного и того же файлового дескриптора для нескольких потоков не поддерживается и может привести к потере данных. Поддерживается повторное использование дескриптора файла после завершения потока.

Когда `options.waitForTrailers` опция установлена, `'wantTrailers'` Событие будет сгенерировано сразу после постановки в очередь последнего блока данных полезной нагрузки для отправки. В `http2stream.sendTrailers()` затем можно использовать для отправки конечных полей заголовка партнеру.

Когда `options.waitForTrailers` установлен, `Http2Stream` не закроется автоматически, когда последний `DATA` кадр передается. Код пользователя _должен_ позвони либо `http2stream.sendTrailers()` или `http2stream.close()` закрыть `Http2Stream`.

```js
const http2 = require('http2');
const fs = require('fs');

const server = http2.createServer();
server.on('stream', (stream) => {
  const fd = fs.openSync('/some/file', 'r');

  const stat = fs.fstatSync(fd);
  const headers = {
    'content-length': stat.size,
    'last-modified': stat.mtime.toUTCString(),
    'content-type': 'text/plain; charset=utf-8',
  };
  stream.respondWithFD(fd, headers, {
    waitForTrailers: true,
  });
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ ABC: 'some value to send' });
  });

  stream.on('close', () => fs.closeSync(fd));
});
```

#### `http2stream.respondWithFile(path[, headers[, options]])`

<!-- YAML
added: v8.4.0
changes:
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33160
    description: Allow explicitly setting date headers.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18936
    description: Any readable file, not necessarily a
                 regular file, is supported now.
-->

- `path` {строка | Буфер | URL}
- `headers` {Объект заголовков HTTP / 2}
- `options` {Объект}
  - `statCheck` {Функция}
  - `onError` {Функция} Функция обратного вызова, вызываемая в случае ошибки перед отправкой.
  - `waitForTrailers` {boolean} Когда `true`, то `Http2Stream` испустит `'wantTrailers'` событие после финала `DATA` кадр был отправлен.
  - `offset` {number} Позиция смещения, с которой следует начать чтение.
  - `length` {number} Объем данных из файлового дескриптора для отправки.

В качестве ответа отправляет обычный файл. В `path` необходимо указать обычный файл или `'error'` событие будет выпущено на `Http2Stream` объект.

При использовании `Http2Stream` объекты `Duplex` интерфейс будет закрыт автоматически.

Необязательный `options.statCheck` функция может быть указана, чтобы дать пользовательскому коду возможность устанавливать дополнительные заголовки контента на основе `fs.Stat` детали данного файла:

Если при попытке чтения данных файла возникает ошибка, `Http2Stream` будет закрыто с использованием `RST_STREAM` рама с использованием стандарта `INTERNAL_ERROR` код. Если `onError` callback определен, затем он будет вызван. В противном случае поток будет уничтожен.

Пример использования пути к файлу:

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  function statCheck(stat, headers) {
    headers['last-modified'] = stat.mtime.toUTCString();
  }

  function onError(err) {
    // stream.respond() can throw if the stream has been destroyed by
    // the other side.
    try {
      if (err.code === 'ENOENT') {
        stream.respond({ ':status': 404 });
      } else {
        stream.respond({ ':status': 500 });
      }
    } catch (err) {
      // Perform actual error handling.
      console.log(err);
    }
    stream.end();
  }

  stream.respondWithFile(
    '/some/file',
    { 'content-type': 'text/plain; charset=utf-8' },
    { statCheck, onError }
  );
});
```

В `options.statCheck` функция также может использоваться для отмены операции отправки путем возврата `false`. Например, условный запрос может проверять результаты статистики, чтобы определить, был ли файл изменен, чтобы вернуть соответствующий `304` отклик:

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  function statCheck(stat, headers) {
    // Check the stat here...
    stream.respond({ ':status': 304 });
    return false; // Cancel the send operation
  }
  stream.respondWithFile(
    '/some/file',
    { 'content-type': 'text/plain; charset=utf-8' },
    { statCheck }
  );
});
```

В `content-length` поле заголовка будет установлено автоматически.

В `offset` а также `length` параметры могут использоваться, чтобы ограничить ответ конкретным подмножеством диапазона. Это можно использовать, например, для поддержки запросов диапазона HTTP.

В `options.onError` Функция также может использоваться для обработки всех ошибок, которые могли произойти до начала доставки файла. По умолчанию поток уничтожается.

Когда `options.waitForTrailers` опция установлена, `'wantTrailers'` Событие будет сгенерировано сразу после постановки в очередь последнего блока данных полезной нагрузки для отправки. В `http2stream.sendTrailers()` затем можно использовать для отправки конечных полей заголовка партнеру.

Когда `options.waitForTrailers` установлен, `Http2Stream` не закроется автоматически, когда последний `DATA` кадр передается. Код пользователя должен вызывать либо `http2stream.sendTrailers()` или `http2stream.close()` закрыть `Http2Stream`.

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  stream.respondWithFile(
    '/some/file',
    { 'content-type': 'text/plain; charset=utf-8' },
    { waitForTrailers: true }
  );
  stream.on('wantTrailers', () => {
    stream.sendTrailers({ ABC: 'some value to send' });
  });
});
```

### Класс: `Http2Server`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {net.Server}

Экземпляры `Http2Server` создаются с использованием `http2.createServer()` функция. В `Http2Server` класс не экспортируется напрямую `http2` модуль.

#### Событие: `'checkContinue'`

<!-- YAML
added: v8.5.0
-->

- `request` {http2.Http2ServerRequest}
- `response` {http2.Http2ServerResponse}

Если [`'request'`](#event-request) слушатель зарегистрирован или [`http2.createServer()`](#http2createserveroptions-onrequesthandler) предоставляется функция обратного вызова, `'checkContinue'` событие генерируется каждый раз, когда запрос с HTTP `Expect: 100-continue` получен. Если это событие не прослушивается, сервер автоматически ответит статусом `100 Continue` по мере необходимости.

Обработка этого события включает вызов [`response.writeContinue()`](#responsewritecontinue) если клиент должен продолжать отправлять тело запроса, или генерировать соответствующий HTTP-ответ (например, 400 Bad Request), если клиент не должен продолжать отправлять тело запроса.

Когда это событие генерируется и обрабатывается, [`'request'`](#event-request) событие не будет отправлено.

#### Событие: `'connection'`

<!-- YAML
added: v8.4.0
-->

- `socket` {stream.Duplex}

Это событие генерируется, когда устанавливается новый поток TCP. `socket` обычно является объектом типа [`net.Socket`](net.md#class-netsocket). Обычно пользователи не хотят получать доступ к этому событию.

Это событие также может быть явно отправлено пользователями для вставки соединений в HTTP-сервер. В этом случае любой [`Duplex`](stream.md#class-streamduplex) поток можно пропустить.

#### Событие: `'request'`

<!-- YAML
added: v8.4.0
-->

- `request` {http2.Http2ServerRequest}
- `response` {http2.Http2ServerResponse}

Выдается каждый раз при запросе. За сеанс может быть несколько запросов. Увидеть [Совместимость API](#compatibility-api).

#### Событие: `'session'`

<!-- YAML
added: v8.4.0
-->

В `'session'` событие испускается, когда новый `Http2Session` создается `Http2Server`.

#### Событие: `'sessionError'`

<!-- YAML
added: v8.4.0
-->

В `'sessionError'` событие генерируется, когда `'error'` событие испускается `Http2Session` объект, связанный с `Http2Server`.

#### Событие: `'stream'`

<!-- YAML
added: v8.4.0
-->

- `stream` {Http2Stream} Ссылка на поток
- `headers` {HTTP / 2 Headers Object} Объект, описывающий заголовки.
- `flags` {number} Связанные числовые флаги
- `rawHeaders` {Array} Массив, содержащий необработанные имена заголовков, за которыми следуют их соответствующие значения.

В `'stream'` событие генерируется, когда `'stream'` событие было отправлено `Http2Session` связанный с сервером.

Смотрите также [`Http2Session`с `'stream'` событие](#event-stream).

```js
const http2 = require('http2');
const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE,
} = http2.constants;

const server = http2.createServer();
server.on('stream', (stream, headers, flags) => {
  const method = headers[HTTP2_HEADER_METHOD];
  const path = headers[HTTP2_HEADER_PATH];
  // ...
  stream.respond({
    [HTTP2_HEADER_STATUS]: 200,
    [HTTP2_HEADER_CONTENT_TYPE]:
      'text/plain; charset=utf-8',
  });
  stream.write('hello ');
  stream.end('world');
});
```

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

В `'timeout'` событие генерируется, когда на сервере нет активности в течение заданного количества миллисекунд, установленных с помощью `http2server.setTimeout()`. **Дефолт:** 0 (без тайм-аута)

#### `server.close([callback])`

<!-- YAML
added: v8.4.0
-->

- `callback` {Функция}

Запрещает серверу устанавливать новые сеансы. Это не препятствует созданию новых потоков запросов из-за постоянного характера сеансов HTTP / 2. Чтобы корректно выключить сервер, позвоните [`http2session.close()`](#http2sessionclosecallback) на всех активных сессиях.

Если `callback` предоставляется, он не вызывается до тех пор, пока все активные сеансы не будут закрыты, хотя сервер уже прекратил разрешать новые сеансы. Видеть [`net.Server.close()`](net.md#serverclosecallback) Больше подробностей.

#### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

- `msecs` {количество} **Дефолт:** 0 (без тайм-аута)
- `callback` {Функция}
- Возвращает: {Http2Server}

Используется для установки значения тайм-аута для запросов сервера http2 и устанавливает функцию обратного вызова, которая вызывается, когда на сервере нет активности. `Http2Server` после `msecs` миллисекунды.

Данный обратный вызов зарегистрирован как слушатель на `'timeout'` событие.

В случае если `callback` это не функция, а новый `ERR_INVALID_CALLBACK` будет выброшена ошибка.

#### `server.timeout`

<!-- YAML
added: v8.4.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

- {number} Тайм-аут в миллисекундах. **Дефолт:** 0 (без тайм-аута)

Количество миллисекунд бездействия до истечения тайм-аута сокета.

Ценность `0` отключит поведение тайм-аута для входящих подключений.

Логика тайм-аута сокета настраивается при подключении, поэтому изменение этого значения влияет только на новые подключения к серверу, но не на существующие подключения.

#### `server.updateSettings([settings])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

- `settings` {Объект настроек HTTP / 2}

Используется для обновления сервера с предоставленными настройками.

Броски `ERR_HTTP2_INVALID_SETTING_VALUE` для недействительных `settings` ценности.

Броски `ERR_INVALID_ARG_TYPE` для недействительных `settings` аргумент.

### Класс: `Http2SecureServer`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {tls.Server}

Экземпляры `Http2SecureServer` создаются с использованием `http2.createSecureServer()` функция. В `Http2SecureServer` класс не экспортируется напрямую `http2` модуль.

#### Событие: `'checkContinue'`

<!-- YAML
added: v8.5.0
-->

- `request` {http2.Http2ServerRequest}
- `response` {http2.Http2ServerResponse}

Если [`'request'`](#event-request) слушатель зарегистрирован или [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler) предоставляется функция обратного вызова, `'checkContinue'` событие генерируется каждый раз, когда запрос с HTTP `Expect: 100-continue` получен. Если это событие не прослушивается, сервер автоматически ответит статусом `100 Continue` по мере необходимости.

Обработка этого события включает вызов [`response.writeContinue()`](#responsewritecontinue) если клиент должен продолжать отправлять тело запроса, или генерировать соответствующий HTTP-ответ (например, 400 Bad Request), если клиент не должен продолжать отправлять тело запроса.

Когда это событие генерируется и обрабатывается, [`'request'`](#event-request) событие не будет отправлено.

#### Событие: `'connection'`

<!-- YAML
added: v8.4.0
-->

- `socket` {stream.Duplex}

Это событие генерируется, когда устанавливается новый поток TCP, до начала установления связи TLS. `socket` обычно является объектом типа [`net.Socket`](net.md#class-netsocket). Обычно пользователи не хотят получать доступ к этому событию.

Это событие также может быть явно отправлено пользователями для вставки соединений в HTTP-сервер. В этом случае любой [`Duplex`](stream.md#class-streamduplex) поток можно пропустить.

#### Событие: `'request'`

<!-- YAML
added: v8.4.0
-->

- `request` {http2.Http2ServerRequest}
- `response` {http2.Http2ServerResponse}

Выдается каждый раз при запросе. За сеанс может быть несколько запросов. Увидеть [Совместимость API](#compatibility-api).

#### Событие: `'session'`

<!-- YAML
added: v8.4.0
-->

В `'session'` событие испускается, когда новый `Http2Session` создается `Http2SecureServer`.

#### Событие: `'sessionError'`

<!-- YAML
added: v8.4.0
-->

В `'sessionError'` событие генерируется, когда `'error'` событие испускается `Http2Session` объект, связанный с `Http2SecureServer`.

#### Событие: `'stream'`

<!-- YAML
added: v8.4.0
-->

- `stream` {Http2Stream} Ссылка на поток
- `headers` {HTTP / 2 Headers Object} Объект, описывающий заголовки.
- `flags` {number} Связанные числовые флаги
- `rawHeaders` {Array} Массив, содержащий необработанные имена заголовков, за которыми следуют их соответствующие значения.

В `'stream'` событие генерируется, когда `'stream'` событие было отправлено `Http2Session` связанный с сервером.

Смотрите также [`Http2Session`с `'stream'` событие](#event-stream).

```js
const http2 = require('http2');
const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE,
} = http2.constants;

const options = getOptionsSomehow();

const server = http2.createSecureServer(options);
server.on('stream', (stream, headers, flags) => {
  const method = headers[HTTP2_HEADER_METHOD];
  const path = headers[HTTP2_HEADER_PATH];
  // ...
  stream.respond({
    [HTTP2_HEADER_STATUS]: 200,
    [HTTP2_HEADER_CONTENT_TYPE]:
      'text/plain; charset=utf-8',
  });
  stream.write('hello ');
  stream.end('world');
});
```

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
-->

В `'timeout'` событие генерируется, когда на сервере нет активности в течение заданного количества миллисекунд, установленных с помощью `http2secureServer.setTimeout()`. **Дефолт:** 2 минуты.

#### Событие: `'unknownProtocol'`

<!-- YAML
added: v8.4.0
-->

В `'unknownProtocol'` Событие генерируется, когда подключающийся клиент не может согласовать разрешенный протокол (например, HTTP / 2 или HTTP / 1.1). Обработчик событий получает сокет для обработки. Если для этого события не зарегистрирован прослушиватель, соединение разрывается. Тайм-аут можно указать с помощью `'unknownProtocolTimeout'` опция передана [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler). Увидеть [Совместимость API](#compatibility-api).

#### `server.close([callback])`

<!-- YAML
added: v8.4.0
-->

- `callback` {Функция}

Запрещает серверу устанавливать новые сеансы. Это не препятствует созданию новых потоков запросов из-за постоянного характера сеансов HTTP / 2. Чтобы корректно выключить сервер, позвоните [`http2session.close()`](#http2sessionclosecallback) на всех активных сессиях.

Если `callback` предоставляется, он не вызывается до тех пор, пока все активные сеансы не будут закрыты, хотя сервер уже прекратил разрешать новые сеансы. Видеть [`tls.Server.close()`](tls.md#serverclosecallback) Больше подробностей.

#### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v8.4.0
-->

- `msecs` {количество} **Дефолт:** `120000` (2 минуты)
- `callback` {Функция}
- Возвращает: {Http2SecureServer}

Используется для установки значения тайм-аута для запросов к защищенному серверу http2 и устанавливает функцию обратного вызова, которая вызывается, когда на сервере нет активности. `Http2SecureServer` после `msecs` миллисекунды.

Данный обратный вызов зарегистрирован как слушатель на `'timeout'` событие.

В случае если `callback` это не функция, а новый `ERR_INVALID_CALLBACK` будет выброшена ошибка.

#### `server.timeout`

<!-- YAML
added: v8.4.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

- {number} Тайм-аут в миллисекундах. **Дефолт:** 0 (без тайм-аута)

Количество миллисекунд бездействия до истечения тайм-аута сокета.

Ценность `0` отключит поведение тайм-аута для входящих подключений.

Логика тайм-аута сокета настраивается при подключении, поэтому изменение этого значения влияет только на новые подключения к серверу, но не на существующие подключения.

#### `server.updateSettings([settings])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

- `settings` {Объект настроек HTTP / 2}

Используется для обновления сервера с предоставленными настройками.

Броски `ERR_HTTP2_INVALID_SETTING_VALUE` для недействительных `settings` ценности.

Броски `ERR_INVALID_ARG_TYPE` для недействительных `settings` аргумент.

### `http2.createServer(options[, onRequestHandler])`

<!-- YAML
added: v8.4.0
changes:
  - version:
      - v15.10.0
      - v14.16.0
      - v12.21.0
      - v10.24.0
    pr-url: https://github.com/nodejs-private/node-private/pull/246
    description: Added `unknownProtocolTimeout` option with a default of 10000.
  - version:
     - v14.4.0
     - v12.18.0
     - v10.21.0
    commit: 3948830ce6408be620b09a70bf66158623022af0
    pr-url: https://github.com/nodejs-private/node-private/pull/204
    description: Added `maxSettings` option with a default of 32.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30534
    description: Added `maxSessionRejectedStreams` option with a default of 100.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30534
    description: Added `maxSessionInvalidFrames` option with a default of 1000.
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/29144
    description: The `PADDING_STRATEGY_CALLBACK` has been made equivalent to
                 providing `PADDING_STRATEGY_ALIGNED` and `selectPadding`
                 has been removed.
  - version: v12.4.0
    pr-url: https://github.com/nodejs/node/pull/27782
    description: The `options` parameter now supports `net.createServer()`
                 options.
  - version: v9.6.0
    pr-url: https://github.com/nodejs/node/pull/15752
    description: Added the `Http1IncomingMessage` and `Http1ServerResponse`
                 option.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/17105
    description: Added the `maxOutstandingPings` option with a default limit of
                 10.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/16676
    description: Added the `maxHeaderListPairs` option with a default limit of
                 128 header pairs.
-->

- `options` {Объект}
  - `maxDeflateDynamicTableSize` {number} Устанавливает максимальный размер динамической таблицы для дефлятирования полей заголовка. **Дефолт:** `4Kib`.
  - `maxSettings` {number} Задает максимальное количество записей настроек на `SETTINGS` Рамка. Минимальное допустимое значение: `1`. **Дефолт:** `32`.
  - `maxSessionMemory`{number} Устанавливает максимальный объем памяти, который `Http2Session` разрешено использовать. Значение выражается в количестве мегабайт, например `1` равняется 1 мегабайту. Минимальное допустимое значение: `1`. Это кредитный лимит, существующий `Http2Stream`s может привести к превышению этого лимита, но новые `Http2Stream` экземпляры будут отклонены, пока этот лимит превышен. Текущее количество `Http2Stream` сеансы, текущее использование памяти таблицами сжатия заголовков, текущие данные в очереди на отправку и неподтвержденные `PING` а также `SETTINGS` все кадры учитываются по текущему пределу. **Дефолт:** `10`.
  - `maxHeaderListPairs` {число} Устанавливает максимальное количество записей заголовка. Это похоже на [`http.Server#maxHeadersCount`](http.md#servermaxheaderscount) или [`http.ClientRequest#maxHeadersCount`](http.md#requestmaxheaderscount). Минимальное значение `4`. **Дефолт:** `128`.
  - `maxOutstandingPings` {number} Устанавливает максимальное количество незавершенных неподтвержденных запросов ping. **Дефолт:** `10`.
  - `maxSendHeaderBlockLength` {number} Устанавливает максимально допустимый размер для сериализованного сжатого блока заголовков. Попытки отправить заголовки, превышающие этот предел, приведут к `'frameError'` генерируется событие, а поток закрывается и уничтожается.
  - `paddingStrategy` {number} Стратегия, используемая для определения количества отступов, используемых для `HEADERS` а также `DATA` кадры. **Дефолт:** `http2.constants.PADDING_STRATEGY_NONE`. Значение может быть одним из:
    - `http2.constants.PADDING_STRATEGY_NONE`: Заполнение не применяется.
    - `http2.constants.PADDING_STRATEGY_MAX`: Применяется максимальное количество отступов, определяемое внутренней реализацией.
    - `http2.constants.PADDING_STRATEGY_ALIGNED`: Пытается применить достаточно заполнения, чтобы гарантировать, что общая длина кадра, включая 9-байтовый заголовок, кратна 8. Для каждого кадра существует максимально допустимое количество байтов заполнения, которое определяется текущим состоянием управления потоком и настройками. . Если этот максимум меньше рассчитанного количества, необходимого для обеспечения выравнивания, используется максимум, и общая длина кадра не обязательно выравнивается на уровне 8 байтов.
  - `peerMaxConcurrentStreams` {number} Устанавливает максимальное количество одновременных потоков для удаленного узла, как если бы `SETTINGS` кадр был получен. Будет отменено, если удаленный узел устанавливает собственное значение для `maxConcurrentStreams`. **Дефолт:** `100`.
  - `maxSessionInvalidFrames` {integer} Устанавливает максимальное количество недопустимых кадров, которое будет допущено до закрытия сеанса. **Дефолт:** `1000`.
  - `maxSessionRejectedStreams` {integer} Устанавливает максимальное количество потоков, отклоненных при создании, которое будет допущено до закрытия сеанса. Каждый отказ связан с `NGHTTP2_ENHANCE_YOUR_CALM` ошибка, которая должна сказать партнеру, чтобы он больше не открывал потоки, поэтому продолжение открытия потоков рассматривается как признак неправильного поведения однорангового узла. **Дефолт:** `100`.
  - `settings` {HTTP / 2 Settings Object} Начальные настройки для отправки удаленному узлу при подключении.
  - `Http1IncomingMessage` {http.IncomingMessage} Определяет `IncomingMessage` класс, используемый для отката HTTP / 1. Полезно для расширения оригинала `http.IncomingMessage`. **Дефолт:** `http.IncomingMessage`.
  - `Http1ServerResponse` {http.ServerResponse} Определяет `ServerResponse` класс, используемый для отката HTTP / 1. Полезно для расширения оригинала `http.ServerResponse`. **Дефолт:** `http.ServerResponse`.
  - `Http2ServerRequest` {http2.Http2ServerRequest} Определяет `Http2ServerRequest` класс для использования. Полезно для расширения оригинала `Http2ServerRequest`. **Дефолт:** `Http2ServerRequest`.
  - `Http2ServerResponse` {http2.Http2ServerResponse} Определяет `Http2ServerResponse` класс для использования. Полезно для расширения оригинала `Http2ServerResponse`. **Дефолт:** `Http2ServerResponse`.
  - `unknownProtocolTimeout` {number} Определяет тайм-аут в миллисекундах, в течение которого сервер должен ждать, когда [`'unknownProtocol'`](#event-unknownprotocol) испускается. Если к этому времени сокет не был уничтожен, сервер уничтожит его. **Дефолт:** `10000`.
  - ...: Любой [`net.createServer()`](net.md#netcreateserveroptions-connectionlistener) вариант может быть предоставлен.
- `onRequestHandler` {Function} См. [Совместимость API](#compatibility-api)
- Возвращает: {Http2Server}

Возвращает `net.Server` экземпляр, который создает и управляет `Http2Session` экземпляры.

Поскольку нет известных браузеров, поддерживающих [незашифрованный HTTP / 2](https://http2.github.io/faq/#does-http2-require-encryption), использование [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler) необходим при общении с клиентами браузера.

```js
const http2 = require('http2');

// Create an unencrypted HTTP/2 server.
// Since there are no browsers known that support
// unencrypted HTTP/2, the use of `http2.createSecureServer()`
// is necessary when communicating with browser clients.
const server = http2.createServer();

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  stream.end('<h1>Hello World</h1>');
});

server.listen(80);
```

### `http2.createSecureServer(options[, onRequestHandler])`

<!-- YAML
added: v8.4.0
changes:
  - version:
      - v15.10.0
      - v14.16.0
      - v12.21.0
      - v10.24.0
    pr-url: https://github.com/nodejs-private/node-private/pull/246
    description: Added `unknownProtocolTimeout` option with a default of 10000.
  - version:
     - v14.4.0
     - v12.18.0
     - v10.21.0
    commit: 3948830ce6408be620b09a70bf66158623022af0
    pr-url: https://github.com/nodejs-private/node-private/pull/204
    description: Added `maxSettings` option with a default of 32.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30534
    description: Added `maxSessionRejectedStreams` option with a default of 100.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30534
    description: Added `maxSessionInvalidFrames` option with a default of 1000.
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/29144
    description: The `PADDING_STRATEGY_CALLBACK` has been made equivalent to
                 providing `PADDING_STRATEGY_ALIGNED` and `selectPadding`
                 has been removed.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/22956
    description: Added the `origins` option to automatically send an `ORIGIN`
                 frame on `Http2Session` startup.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/17105
    description: Added the `maxOutstandingPings` option with a default limit of
                 10.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/16676
    description: Added the `maxHeaderListPairs` option with a default limit of
                 128 header pairs.
-->

- `options` {Объект}
  - `allowHTTP1` {boolean} Входящие клиентские подключения, не поддерживающие HTTP / 2, будут переведены на HTTP / 1.x, если для него установлено значение `true`. Увидеть [`'unknownProtocol'`](#event-unknownprotocol) событие. Видеть [Согласование ALPN](#alpn-negotiation). **Дефолт:** `false`.
  - `maxDeflateDynamicTableSize` {number} Устанавливает максимальный размер динамической таблицы для дефлятирования полей заголовка. **Дефолт:** `4Kib`.
  - `maxSettings` {number} Задает максимальное количество записей настроек на `SETTINGS` Рамка. Минимальное допустимое значение: `1`. **Дефолт:** `32`.
  - `maxSessionMemory`{number} Устанавливает максимальный объем памяти, который `Http2Session` разрешено использовать. Значение выражается в количестве мегабайт, например `1` равняется 1 мегабайту. Минимальное допустимое значение: `1`. Это кредитный лимит, существующий `Http2Stream`s может привести к превышению этого лимита, но новые `Http2Stream` экземпляры будут отклонены, пока этот лимит превышен. Текущее количество `Http2Stream` сеансы, текущее использование памяти таблицами сжатия заголовков, текущие данные в очереди на отправку и неподтвержденные `PING` а также `SETTINGS` все кадры учитываются по текущему пределу. **Дефолт:** `10`.
  - `maxHeaderListPairs` {число} Устанавливает максимальное количество записей заголовка. Это похоже на [`http.Server#maxHeadersCount`](http.md#servermaxheaderscount) или [`http.ClientRequest#maxHeadersCount`](http.md#requestmaxheaderscount). Минимальное значение `4`. **Дефолт:** `128`.
  - `maxOutstandingPings` {number} Устанавливает максимальное количество незавершенных неподтвержденных запросов ping. **Дефолт:** `10`.
  - `maxSendHeaderBlockLength` {number} Устанавливает максимально допустимый размер для сериализованного сжатого блока заголовков. Попытки отправить заголовки, превышающие этот предел, приведут к `'frameError'` генерируется событие, а поток закрывается и уничтожается.
  - `paddingStrategy` {number} Стратегия, используемая для определения количества отступов, используемых для `HEADERS` а также `DATA` кадры. **Дефолт:** `http2.constants.PADDING_STRATEGY_NONE`. Значение может быть одним из:
    - `http2.constants.PADDING_STRATEGY_NONE`: Заполнение не применяется.
    - `http2.constants.PADDING_STRATEGY_MAX`: Применяется максимальное количество отступов, определяемое внутренней реализацией.
    - `http2.constants.PADDING_STRATEGY_ALIGNED`: Пытается применить достаточно заполнения, чтобы гарантировать, что общая длина кадра, включая 9-байтовый заголовок, кратна 8. Для каждого кадра существует максимально допустимое количество байтов заполнения, которое определяется текущим состоянием управления потоком и настройками. . Если этот максимум меньше рассчитанного количества, необходимого для обеспечения выравнивания, используется максимум, и общая длина кадра не обязательно выравнивается на уровне 8 байтов.
  - `peerMaxConcurrentStreams` {number} Устанавливает максимальное количество одновременных потоков для удаленного узла, как если бы `SETTINGS` кадр был получен. Будет отменено, если удаленный узел устанавливает собственное значение для `maxConcurrentStreams`. **Дефолт:** `100`.
  - `maxSessionInvalidFrames` {integer} Устанавливает максимальное количество недопустимых кадров, которое будет допущено до закрытия сеанса. **Дефолт:** `1000`.
  - `maxSessionRejectedStreams` {integer} Устанавливает максимальное количество потоков, отклоненных при создании, которое будет допущено до закрытия сеанса. Каждый отказ связан с `NGHTTP2_ENHANCE_YOUR_CALM` ошибка, которая должна сказать партнеру, чтобы он больше не открывал потоки, поэтому продолжение открытия потоков рассматривается как признак неправильного поведения однорангового узла. **Дефолт:** `100`.
  - `settings` {HTTP / 2 Settings Object} Начальные настройки для отправки удаленному узлу при подключении.
  - ...: Любой [`tls.createServer()`](tls.md#tlscreateserveroptions-secureconnectionlistener) варианты могут быть предоставлены. Для серверов параметры идентификации (`pfx` или `key`/`cert`) обычно требуются.
  - `origins` {string \[]} Массив исходных строк для отправки в `ORIGIN` кадр сразу после создания нового сервера `Http2Session`.
  - `unknownProtocolTimeout` {number} Определяет тайм-аут в миллисекундах, в течение которого сервер должен ждать, когда [`'unknownProtocol'`](#event-unknownprotocol) событие испускается. Если к этому времени сокет не был уничтожен, сервер уничтожит его. **Дефолт:** `10000`.
- `onRequestHandler` {Function} См. [Совместимость API](#compatibility-api)
- Возвращает: {Http2SecureServer}

Возвращает `tls.Server` экземпляр, который создает и управляет `Http2Session` экземпляры.

```js
const http2 = require('http2');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
};

// Create a secure HTTP/2 server
const server = http2.createSecureServer(options);

server.on('stream', (stream, headers) => {
  stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
  });
  stream.end('<h1>Hello World</h1>');
});

server.listen(80);
```

### `http2.connect(authority[, options][, listener])`

<!-- YAML
added: v8.4.0
changes:
  - version:
      - v15.10.0
      - v14.16.0
      - v12.21.0
      - v10.24.0
    pr-url: https://github.com/nodejs-private/node-private/pull/246
    description: Added `unknownProtocolTimeout` option with a default of 10000.
  - version:
     - v14.4.0
     - v12.18.0
     - v10.21.0
    commit: 3948830ce6408be620b09a70bf66158623022af0
    pr-url: https://github.com/nodejs-private/node-private/pull/204
    description: Added `maxSettings` option with a default of 32.
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/29144
    description: The `PADDING_STRATEGY_CALLBACK` has been made equivalent to
                 providing `PADDING_STRATEGY_ALIGNED` and `selectPadding`
                 has been removed.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/17105
    description: Added the `maxOutstandingPings` option with a default limit of
                 10.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/16676
    description: Added the `maxHeaderListPairs` option with a default limit of
                 128 header pairs.
-->

- `authority` {string | URL} Удаленный сервер HTTP / 2 для подключения. Это должен быть минимальный действительный URL-адрес с `http://` или `https://` префикс, имя хоста и IP-порт (если используется порт, отличный от порта по умолчанию). Информация о пользователе (идентификатор пользователя и пароль), путь, строка запроса и сведения о фрагменте в URL-адресе будут проигнорированы.
- `options` {Объект}
  - `maxDeflateDynamicTableSize` {number} Устанавливает максимальный размер динамической таблицы для дефлятирования полей заголовка. **Дефолт:** `4Kib`.
  - `maxSettings` {number} Задает максимальное количество записей настроек на `SETTINGS` Рамка. Минимальное допустимое значение: `1`. **Дефолт:** `32`.
  - `maxSessionMemory`{number} Устанавливает максимальный объем памяти, который `Http2Session` разрешено использовать. Значение выражается в количестве мегабайт, например `1` равняется 1 мегабайту. Минимальное допустимое значение: `1`. Это кредитный лимит, существующий `Http2Stream`s может привести к превышению этого лимита, но новые `Http2Stream` экземпляры будут отклонены, пока этот лимит превышен. Текущее количество `Http2Stream` сеансы, текущее использование памяти таблицами сжатия заголовков, текущие данные в очереди на отправку и неподтвержденные `PING` а также `SETTINGS` все кадры учитываются по текущему пределу. **Дефолт:** `10`.
  - `maxHeaderListPairs` {число} Устанавливает максимальное количество записей заголовка. Это похоже на [`http.Server#maxHeadersCount`](http.md#servermaxheaderscount) или [`http.ClientRequest#maxHeadersCount`](http.md#requestmaxheaderscount). Минимальное значение `1`. **Дефолт:** `128`.
  - `maxOutstandingPings` {number} Устанавливает максимальное количество незавершенных неподтвержденных запросов ping. **Дефолт:** `10`.
  - `maxReservedRemoteStreams` {number} Устанавливает максимальное количество зарезервированных push-потоков, которые клиент будет принимать в любой момент времени. Как только текущее количество зарезервированных push-потоков превысит этот предел, новые push-потоки, отправленные сервером, будут автоматически отклонены. Минимальное допустимое значение - 0. Максимально допустимое значение - 2.<sup>32</sup>-1. Отрицательное значение устанавливает для этого параметра максимально допустимое значение. **Дефолт:** `200`.
  - `maxSendHeaderBlockLength` {number} Устанавливает максимально допустимый размер для сериализованного сжатого блока заголовков. Попытки отправить заголовки, превышающие этот предел, приведут к `'frameError'` генерируется событие, а поток закрывается и уничтожается.
  - `paddingStrategy` {number} Стратегия, используемая для определения количества отступов, используемых для `HEADERS` а также `DATA` кадры. **Дефолт:** `http2.constants.PADDING_STRATEGY_NONE`. Значение может быть одним из:
    - `http2.constants.PADDING_STRATEGY_NONE`: Заполнение не применяется.
    - `http2.constants.PADDING_STRATEGY_MAX`: Применяется максимальное количество отступов, определяемое внутренней реализацией.
    - `http2.constants.PADDING_STRATEGY_ALIGNED`: Пытается применить достаточно заполнения, чтобы гарантировать, что общая длина кадра, включая 9-байтовый заголовок, кратна 8. Для каждого кадра существует максимально допустимое количество байтов заполнения, которое определяется текущим состоянием управления потоком и настройками. . Если этот максимум меньше рассчитанного количества, необходимого для обеспечения выравнивания, используется максимум, и общая длина кадра не обязательно выравнивается на уровне 8 байтов.
  - `peerMaxConcurrentStreams` {number} Устанавливает максимальное количество одновременных потоков для удаленного узла, как если бы `SETTINGS` кадр был получен. Будет отменено, если удаленный узел устанавливает собственное значение для `maxConcurrentStreams`. **Дефолт:** `100`.
  - `protocol` {строка} Протокол для подключения, если он не установлен в `authority`. Значение может быть либо `'http:'` или `'https:'`. **Дефолт:** `'https:'`
  - `settings` {HTTP / 2 Settings Object} Начальные настройки для отправки удаленному узлу при подключении.
  - `createConnection` {Function} Необязательный обратный вызов, который получает `URL` экземпляр передан `connect` и `options` объект и возвращает любой [`Duplex`](stream.md#class-streamduplex) поток, который будет использоваться в качестве соединения для этого сеанса.
  - ...: Любой [`net.connect()`](net.md#netconnect) или [`tls.connect()`](tls.md#tlsconnectoptions-callback) варианты могут быть предоставлены.
  - `unknownProtocolTimeout` {number} Определяет тайм-аут в миллисекундах, в течение которого сервер должен ждать, когда [`'unknownProtocol'`](#event-unknownprotocol) событие испускается. Если к этому времени сокет не был уничтожен, сервер уничтожит его. **Дефолт:** `10000`.
- `listener` {Function} Будет зарегистрирован как разовый слушатель [`'connect'`](#event-connect) событие.
- Возвращает: {ClientHttp2Session}

Возвращает `ClientHttp2Session` пример.

```js
const http2 = require('http2');
const client = http2.connect('https://localhost:1234');

/* Use the client */

client.close();
```

### `http2.constants`

<!-- YAML
added: v8.4.0
-->

#### Коды ошибок для `RST_STREAM` а также `GOAWAY`

| Значение | Имя | Постоянный | | -------- | --------------------- | ------------------ ----------------------------- | | `0x00` | Нет ошибок | `http2.constants.NGHTTP2_NO_ERROR` | | `0x01` | Ошибка протокола | `http2.constants.NGHTTP2_PROTOCOL_ERROR` | | `0x02` | Внутренняя ошибка | `http2.constants.NGHTTP2_INTERNAL_ERROR` | | `0x03` | Ошибка управления потоком | `http2.constants.NGHTTP2_FLOW_CONTROL_ERROR` | | `0x04` | Настройки Тайм-аут | `http2.constants.NGHTTP2_SETTINGS_TIMEOUT` | | `0x05` | Поток закрыт | `http2.constants.NGHTTP2_STREAM_CLOSED` | | `0x06` | Ошибка размера кадра | `http2.constants.NGHTTP2_FRAME_SIZE_ERROR` | | `0x07` | Отказ от потока | `http2.constants.NGHTTP2_REFUSED_STREAM` | | `0x08` | Отмена | `http2.constants.NGHTTP2_CANCEL` | | `0x09` | Ошибка сжатия | `http2.constants.NGHTTP2_COMPRESSION_ERROR` | | `0x0a` | Ошибка подключения | `http2.constants.NGHTTP2_CONNECT_ERROR` | | `0x0b` | Укрепите свое спокойствие | `http2.constants.NGHTTP2_ENHANCE_YOUR_CALM` | | `0x0c` | Неадекватная безопасность | `http2.constants.NGHTTP2_INADEQUATE_SECURITY` | | `0x0d` | HTTP / 1.1 Требуется | `http2.constants.NGHTTP2_HTTP_1_1_REQUIRED` |

В `'timeout'` событие генерируется, когда на сервере нет активности в течение заданного количества миллисекунд, установленных с помощью `http2server.setTimeout()`.

### `http2.getDefaultSettings()`

<!-- YAML
added: v8.4.0
-->

- Возвращает: {объект настроек HTTP / 2}.

Возвращает объект, содержащий настройки по умолчанию для `Http2Session` пример. Этот метод возвращает новый экземпляр объекта каждый раз, когда он вызывается, поэтому возвращенные экземпляры могут быть безопасно изменены для использования.

### `http2.getPackedSettings([settings])`

<!-- YAML
added: v8.4.0
-->

- `settings` {Объект настроек HTTP / 2}
- Возвращает: {Buffer}

Возвращает `Buffer` экземпляр, содержащий сериализованное представление заданных параметров HTTP / 2, как указано в [HTTP / 2](https://tools.ietf.org/html/rfc7540) Технические характеристики. Это предназначено для использования с `HTTP2-Settings` поле заголовка.

```js
const http2 = require('http2');

const packed = http2.getPackedSettings({
  enablePush: false,
});

console.log(packed.toString('base64'));
// Prints: AAIAAAAA
```

### `http2.getUnpackedSettings(buf)`

<!-- YAML
added: v8.4.0
-->

- `buf` {Buffer | TypedArray} Упакованные настройки.
- Возвращает: {объект настроек HTTP / 2}.

Возвращает [Объект настроек HTTP / 2](#settings-object) содержащие десериализованные настройки из заданного `Buffer` как создано `http2.getPackedSettings()`.

### `http2.sensitiveHeaders`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

- {условное обозначение}

Этот символ может быть установлен как свойство объекта заголовков HTTP / 2 со значением массива, чтобы предоставить список заголовков, считающихся конфиденциальными. Видеть [Конфиденциальные заголовки](#sensitive-headers) Больше подробностей.

### Объект заголовков

Заголовки представлены как собственные свойства в объектах JavaScript. Ключи свойств будут преобразованы в нижний регистр. Значения свойств должны быть строками (в противном случае они будут преобразованы в строки) или `Array` строк (для отправки более одного значения в поле заголовка).

```js
const headers = {
  ':status': '200',
  'content-type': 'text-plain',
  ABC: ['has', 'more', 'than', 'one', 'value'],
};

stream.respond(headers);
```

Объекты заголовка, передаваемые функциям обратного вызова, будут иметь `null` прототип. Это означает, что обычные методы объекта JavaScript, такие как `Object.prototype.toString()` а также `Object.prototype.hasOwnProperty()` не будет работать.

Для входящих заголовков:

- В `:status` заголовок конвертируется в `number`.
- Дубликаты `:status`, `:method`, `:authority`, `:scheme`, `:path`, `:protocol`, `age`, `authorization`, `access-control-allow-credentials`, `access-control-max-age`, `access-control-request-method`, `content-encoding`, `content-language`, `content-length`, `content-location`, `content-md5`, `content-range`, `content-type`, `date`, `dnt`, `etag`, `expires`, `from`, `host`, `if-match`, `if-modified-since`, `if-none-match`, `if-range`, `if-unmodified-since`, `last-modified`, `location`, `max-forwards`, `proxy-authorization`, `range`, `referer`,`retry-after`, `tk`, `upgrade-insecure-requests`, `user-agent` или `x-content-type-options` отбрасываются.
- `set-cookie` всегда массив. В массив добавляются дубликаты.
- Для дубликата `cookie` заголовки, значения объединяются вместе с помощью '; '.
- Для всех остальных заголовков значения объединяются вместе с помощью ','.

```js
const http2 = require('http2');
const server = http2.createServer();
server.on('stream', (stream, headers) => {
  console.log(headers[':path']);
  console.log(headers.ABC);
});
```

#### Конфиденциальные заголовки

Заголовки HTTP2 могут быть помечены как конфиденциальные, что означает, что алгоритм сжатия заголовков HTTP / 2 никогда не будет их индексировать. Это может иметь смысл для значений заголовков с низкой энтропией и может считаться ценным для злоумышленника, например `Cookie` или `Authorization`. Для этого добавьте название заголовка в `[http2.sensitiveHeaders]` свойство как массив:

```js
const headers = {
  ':status': '200',
  'content-type': 'text-plain',
  cookie: 'some-cookie',
  'other-sensitive-header': 'very secret data',
  [http2.sensitiveHeaders]: [
    'cookie',
    'other-sensitive-header',
  ],
};

stream.respond(headers);
```

Для некоторых заголовков, например `Authorization` и коротко `Cookie` заголовки этот флаг устанавливается автоматически.

Это свойство также устанавливается для полученных заголовков. Он будет содержать имена всех заголовков, помеченных как конфиденциальные, в том числе помеченных таким образом автоматически.

### Объект настроек

<!-- YAML
added: v8.4.0
changes:
  - version: v12.12.0
    pr-url: https://github.com/nodejs/node/pull/29833
    description: The `maxConcurrentStreams` setting is stricter.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/16676
    description: The `maxHeaderListSize` setting is now strictly enforced.
-->

В `http2.getDefaultSettings()`, `http2.getPackedSettings()`, `http2.createServer()`, `http2.createSecureServer()`, `http2session.settings()`, `http2session.localSettings`, а также `http2session.remoteSettings` API либо возвращают, либо получают в качестве входных данных объект, который определяет параметры конфигурации для `Http2Session` объект. Эти объекты являются обычными объектами JavaScript, содержащими следующие свойства.

- `headerTableSize` {число} Задает максимальное количество байтов, используемых для сжатия заголовка. Минимальное допустимое значение - 0. Максимально допустимое значение - 2.<sup>32</sup>-1. **Дефолт:** `4096`.
- `enablePush` {boolean} Определяет `true` если потоки HTTP / 2 Push будут разрешены на `Http2Session` экземпляры. **Дефолт:** `true`.
- `initialWindowSize` {number} Определяет _отправитель_ начальный размер окна в байтах для управления потоком на уровне потока. Минимальное допустимое значение - 0. Максимально допустимое значение - 2.<sup>32</sup>-1. **Дефолт:** `65535`.
- `maxFrameSize` {число} Определяет размер в байтах полезной нагрузки самого большого кадра. Минимально допустимое значение - 16 384. Максимально допустимое значение - 2<sup>24</sup>-1. **Дефолт:** `16384`.
- `maxConcurrentStreams` {number} Определяет максимальное количество одновременных потоков, разрешенных на `Http2Session`. Не существует значения по умолчанию, которое подразумевает, по крайней мере теоретически, 2<sup>32</sup>-1 поток может быть открыт одновременно в любой момент времени в `Http2Session`. Минимальное значение - 0. Максимально допустимое значение - 2.<sup>32</sup>-1. **Дефолт:** `4294967295`.
- `maxHeaderListSize` {число} Задает максимальный размер (несжатые октеты) списка заголовков, который будет принят. Минимальное допустимое значение - 0. Максимально допустимое значение - 2.<sup>32</sup>-1. **Дефолт:** `65535`.
- `maxHeaderSize` {number} Псевдоним для `maxHeaderListSize`.
- `enableConnectProtocol`{boolean} Определяет `true` если «Протокол расширенного подключения», определенный [RFC 8441](https://tools.ietf.org/html/rfc8441) должен быть включен. Этот параметр имеет смысл только в том случае, если он отправлен сервером. Однажды `enableConnectProtocol` настройка была включена для данного `Http2Session`, его нельзя отключить. **Дефолт:** `false`.

Все дополнительные свойства объекта настроек игнорируются.

### Обработка ошибок

Есть несколько типов ошибок, которые могут возникнуть при использовании `http2` модуль:

Ошибки проверки возникают, когда передается неверный аргумент, параметр или значение параметра. Об этом всегда будет сообщать синхронный `throw`.

Ошибки состояния возникают, когда действие предпринимается в неправильное время (например, при попытке отправить данные в потоке после его закрытия). Об этом будет сообщено с использованием синхронного `throw` или через `'error'` событие на `Http2Stream`, `Http2Session` или объекты HTTP / 2 Server, в зависимости от того, где и когда возникает ошибка.

Внутренние ошибки возникают при неожиданном сбое сеанса HTTP / 2. Об этом будет сообщено через `'error'` событие на `Http2Session` или объекты HTTP / 2 Server.

Ошибки протокола возникают при нарушении различных ограничений протокола HTTP / 2. Об этом будет сообщено с использованием синхронного `throw` или через `'error'` событие на `Http2Stream`, `Http2Session` или объекты HTTP / 2 Server, в зависимости от того, где и когда возникает ошибка.

### Недопустимая обработка символов в именах и значениях заголовков

Реализация HTTP / 2 применяет более строгую обработку недопустимых символов в именах и значениях заголовков HTTP, чем реализация HTTP / 1.

Имена полей заголовка _без учета регистра_ и передаются по сети строго как строчные строки. API, предоставляемый Node.js, позволяет задавать имена заголовков как строки со смешанным регистром (например, `Content-Type`), но преобразует их в нижний регистр (например, `content-type`) при передаче.

Имена полей заголовка _должен только_ содержат один или несколько из следующих символов ASCII: `a`-`z`, `A`-`Z`, `0`-`9`, `!`, `#`, `$`, `%`, `&`, `'`, `*`, `+`, `-`, `.`, `^`, `_`, `` ` `` (обратная кавычка), `|`, а также `~`.

Использование недопустимых символов в имени поля заголовка HTTP приведет к закрытию потока с сообщением об ошибке протокола.

Значения поля заголовка обрабатываются более мягко, но _должен_ не содержать символов новой строки или возврата каретки и _должен_ ограничиваться символами US-ASCII в соответствии с требованиями спецификации HTTP.

### Пуш-потоки на клиенте

Чтобы получать проталкиваемые потоки на клиенте, установите прослушиватель для `'stream'` событие на `ClientHttp2Session`:

```js
const http2 = require('http2');

const client = http2.connect('http://localhost');

client.on('stream', (pushedStream, requestHeaders) => {
  pushedStream.on('push', (responseHeaders) => {
    // Process response headers
  });
  pushedStream.on('data', (chunk) => {
    /* handle pushed data */
  });
});

const req = client.request({ ':path': '/' });
```

### Поддерживая `CONNECT` метод

В `CONNECT` используется, чтобы разрешить использование сервера HTTP / 2 в качестве прокси для соединений TCP / IP.

Простой TCP-сервер:

```js
const net = require('net');

const server = net.createServer((socket) => {
  let name = '';
  socket.setEncoding('utf8');
  socket.on('data', (chunk) => (name += chunk));
  socket.on('end', () => socket.end(`hello ${name}`));
});

server.listen(8000);
```

Прокси-сервер HTTP / 2 CONNECT:

```js
const http2 = require('http2');
const { NGHTTP2_REFUSED_STREAM } = http2.constants;
const net = require('net');

const proxy = http2.createServer();
proxy.on('stream', (stream, headers) => {
  if (headers[':method'] !== 'CONNECT') {
    // Only accept CONNECT requests
    stream.close(NGHTTP2_REFUSED_STREAM);
    return;
  }
  const auth = new URL(`tcp://${headers[':authority']}`);
  // It's a very good idea to verify that hostname and port are
  // things this proxy should be connecting to.
  const socket = net.connect(
    auth.port,
    auth.hostname,
    () => {
      stream.respond();
      socket.pipe(stream);
      stream.pipe(socket);
    }
  );
  socket.on('error', (error) => {
    stream.close(http2.constants.NGHTTP2_CONNECT_ERROR);
  });
});

proxy.listen(8001);
```

Клиент HTTP / 2 CONNECT:

```js
const http2 = require('http2');

const client = http2.connect('http://localhost:8001');

// Must not specify the ':path' and ':scheme' headers
// for CONNECT requests or an error will be thrown.
const req = client.request({
  ':method': 'CONNECT',
  ':authority': `localhost:${port}`,
});

req.on('response', (headers) => {
  console.log(headers[http2.constants.HTTP2_HEADER_STATUS]);
});
let data = '';
req.setEncoding('utf8');
req.on('data', (chunk) => (data += chunk));
req.on('end', () => {
  console.log(`The server says: ${data}`);
  client.close();
});
req.end('Jane');
```

### Расширенный `CONNECT` протокол

[RFC 8441](https://tools.ietf.org/html/rfc8441) определяет расширение «Extended CONNECT Protocol» для HTTP / 2, которое может использоваться для начальной загрузки использования `Http2Stream` с помощью `CONNECT` как туннель для других протоколов связи (например, WebSockets).

Использование расширенного протокола CONNECT разрешено серверами HTTP / 2 с помощью `enableConnectProtocol` параметр:

```js
const http2 = require('http2');
const settings = { enableConnectProtocol: true };
const server = http2.createServer({ settings });
```

Как только клиент получит `SETTINGS` кадр с сервера, указывающий, что можно использовать расширенное соединение CONNECT, он может отправить `CONNECT` запросы, использующие `':protocol'` Псевдо-заголовок HTTP / 2:

```js
const http2 = require('http2');
const client = http2.connect('http://localhost:8080');
client.on('remoteSettings', (settings) => {
  if (settings.enableConnectProtocol) {
    const req = client.request({
      ':method': 'CONNECT',
      ':protocol': 'foo',
    });
    // ...
  }
});
```

## Совместимость API

API совместимости имеет целью предоставить разработчикам аналогичные возможности HTTP / 1 при использовании HTTP / 2, что позволяет разрабатывать приложения, поддерживающие оба [HTTP / 1](http.md) и HTTP / 2. Этот API нацелен только на **общедоступный API** принадлежащий [HTTP / 1](http.md). Однако многие модули используют внутренние методы или состояние, а те _не поддерживаются_ поскольку это совершенно другая реализация.

В следующем примере создается сервер HTTP / 2 с использованием API совместимости:

```js
const http2 = require('http2');
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('ok');
});
```

Чтобы создать смешанный [HTTPS](https.md) и сервер HTTP / 2 см. [Согласование ALPN](#alpn-negotiation) раздел. Обновление с серверов HTTP / 1, отличных от tls, не поддерживается.

API совместимости HTTP / 2 состоит из [`Http2ServerRequest`](#class-http2http2serverrequest) а также [`Http2ServerResponse`](#class-http2http2serverresponse). Они нацелены на совместимость API с HTTP / 1, но не скрывают различия между протоколами. Например, сообщение о состоянии для кодов HTTP игнорируется.

### Согласование ALPN

Согласование ALPN позволяет поддерживать оба [HTTPS](https.md) и HTTP / 2 через тот же сокет. В `req` а также `res` объекты могут быть HTTP / 1 или HTTP / 2, а приложение **должен** ограничить себя общедоступным API [HTTP / 1](http.md)и определите, можно ли использовать более продвинутые функции HTTP / 2.

В следующем примере создается сервер, поддерживающий оба протокола:

```js
const { createSecureServer } = require('http2');
const { readFileSync } = require('fs');

const cert = readFileSync('./cert.pem');
const key = readFileSync('./key.pem');

const server = createSecureServer(
  { cert, key, allowHTTP1: true },
  onRequest
).listen(4443);

function onRequest(req, res) {
  // Detects if it is a HTTPS request or HTTP/2
  const {
    socket: { alpnProtocol },
  } = req.httpVersion === '2.0' ? req.stream.session : req;
  res.writeHead(200, {
    'content-type': 'application/json',
  });
  res.end(
    JSON.stringify({
      alpnProtocol,
      httpVersion: req.httpVersion,
    })
  );
}
```

В `'request'` событие работает одинаково на обоих [HTTPS](https.md) и HTTP / 2.

### Класс: `http2.Http2ServerRequest`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {stream.Readable}

А `Http2ServerRequest` объект создан [`http2.Server`](#class-http2server) или [`http2.SecureServer`](#class-http2secureserver) и передается в качестве первого аргумента в [`'request'`](#event-request) событие. Его можно использовать для доступа к статусу запроса, заголовкам и данным.

#### Событие: `'aborted'`

<!-- YAML
added: v8.4.0
-->

В `'aborted'` событие генерируется всякий раз, когда `Http2ServerRequest` Экземпляр ненормально прерывается во время обмена данными.

В `'aborted'` событие будет сгенерировано только в том случае, если `Http2ServerRequest` записываемая сторона не закончена.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

Указывает, что основной [`Http2Stream`](#class-http2stream) был закрыт. Как `'end'`, это событие происходит только один раз за ответ.

#### `request.aborted`

<!-- YAML
added: v10.1.0
-->

- {логический}

В `request.aborted` собственность будет `true` если запрос был прерван.

#### `request.authority`

<!-- YAML
added: v8.4.0
-->

- {нить}

Поле псевдозаголовка центра запроса. Поскольку HTTP / 2 позволяет запросам устанавливать либо `:authority` или `host`, это значение получено из `req.headers[':authority']` если представить. В противном случае он получается из `req.headers['host']`.

#### `request.complete`

<!-- YAML
added: v12.10.0
-->

- {логический}

В `request.complete` собственность будет `true` если запрос был завершен, прерван или уничтожен.

#### `request.connection`

<!-- YAML
added: v8.4.0
deprecated: v13.0.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`request.socket`](#requestsocket).

- {net.Socket | tls.TLSSocket}

Видеть [`request.socket`](#requestsocket).

#### `request.destroy([error])`

<!-- YAML
added: v8.4.0
-->

- `error` {Ошибка}

Звонки `destroy()` на [`Http2Stream`](#class-http2stream) который получил [`Http2ServerRequest`](#class-http2http2serverrequest). Если `error` предоставляется, `'error'` событие испускается и `error` передается в качестве аргумента всем слушателям события.

Он ничего не делает, если поток уже был уничтожен.

#### `request.headers`

<!-- YAML
added: v8.4.0
-->

- {Объект}

Объект заголовков запроса / ответа.

Пары "ключ-значение", состоящие из имен и значений заголовков. Имена заголовков в нижнем регистре.

```js
// Prints something like:
//
// { 'user-agent': 'curl/7.22.0',
//   host: '127.0.0.1:8000',
//   accept: '*/*' }
console.log(request.headers);
```

Видеть [Объект заголовков HTTP / 2](#headers-object).

В HTTP / 2 путь запроса, имя хоста, протокол и метод представлены в виде специальных заголовков с префиксом `:` персонаж (например, `':path'`). Эти специальные заголовки будут включены в `request.headers` объект. Следует проявлять осторожность, чтобы случайно не изменить эти специальные заголовки, иначе могут возникнуть ошибки. Например, удаление всех заголовков из запроса приведет к возникновению ошибок:

```js
removeAllHeaders(request.headers);
assert(request.url); // Fails because the :path header has been removed
```

#### `request.httpVersion`

<!-- YAML
added: v8.4.0
-->

- {нить}

В случае запроса сервера - версия HTTP, отправленная клиентом. В случае ответа клиента - версия HTTP подключенного сервера. Возврат `'2.0'`.

Также `message.httpVersionMajor` - первое целое число и `message.httpVersionMinor` это второй.

#### `request.method`

<!-- YAML
added: v8.4.0
-->

- {нить}

Метод запроса в виде строки. Только для чтения. Примеры: `'GET'`, `'DELETE'`.

#### `request.rawHeaders`

<!-- YAML
added: v8.4.0
-->

- {нить\[]}

Необработанные заголовки запроса / ответа перечислены в том виде, в котором они были получены.

Ключи и значения находятся в одном списке. это _нет_ список кортежей. Таким образом, смещения с четными номерами являются ключевыми значениями, а смещения с нечетными номерами - соответствующими значениями.

Имена заголовков не в нижнем регистре, и дубликаты не объединяются.

```js
// Prints something like:
//
// [ 'user-agent',
//   'this is invalid because there can be only one',
//   'User-Agent',
//   'curl/7.22.0',
//   'Host',
//   '127.0.0.1:8000',
//   'ACCEPT',
//   '*/*' ]
console.log(request.rawHeaders);
```

#### `request.rawTrailers`

<!-- YAML
added: v8.4.0
-->

- {нить\[]}

Необработанные ключи и значения трейлера запроса / ответа в том виде, в котором они были получены. Заселены только в `'end'` событие.

#### `request.scheme`

<!-- YAML
added: v8.4.0
-->

- {нить}

Поле псевдозаголовка схемы запроса, указывающее часть схемы целевого URL.

#### `request.setTimeout(msecs, callback)`

<!-- YAML
added: v8.4.0
-->

- `msecs` {количество}
- `callback` {Функция}
- Возвращает: {http2.Http2ServerRequest}

Устанавливает [`Http2Stream`](#class-http2stream)значение тайм-аута до `msecs`. Если предоставляется обратный вызов, он добавляется в качестве слушателя на `'timeout'` событие в объекте ответа.

Если нет `'timeout'` слушатель добавляется к запросу, ответу или серверу, затем [`Http2Stream`](#class-http2stream)s уничтожаются по истечении времени ожидания. Если на запрос назначен обработчик, ответ или серверный `'timeout'` события, сокеты с истекшим временем ожидания должны обрабатываться явно.

#### `request.socket`

<!-- YAML
added: v8.4.0
-->

- {net.Socket | tls.TLSSocket}

Возвращает `Proxy` объект, который действует как `net.Socket` (или `tls.TLSSocket`), но применяет геттеры, сеттеры и методы на основе логики HTTP / 2.

`destroyed`, `readable`, а также `writable` свойства будут извлечены и установлены на `request.stream`.

`destroy`, `emit`, `end`, `on` а также `once` методы будут вызываться `request.stream`.

`setTimeout` метод будет вызван `request.stream.session`.

`pause`, `read`, `resume`, а также `write` выдаст ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`. Видеть [`Http2Session` и розетки](#http2session-and-sockets) для дополнительной информации.

Все остальные взаимодействия будут направляться непосредственно в сокет. С поддержкой TLS используйте [`request.socket.getPeerCertificate()`](tls.md#tlssocketgetpeercertificatedetailed) чтобы получить данные аутентификации клиента.

#### `request.stream`

<!-- YAML
added: v8.4.0
-->

- {Http2Stream}

В [`Http2Stream`](#class-http2stream) объект, поддерживающий запрос.

#### `request.trailers`

<!-- YAML
added: v8.4.0
-->

- {Объект}

Объект трейлеров запроса / ответа. Заселены только в `'end'` событие.

#### `request.url`

<!-- YAML
added: v8.4.0
-->

- {нить}

Строка URL-адреса запроса. Он содержит только URL-адрес, который присутствует в фактическом HTTP-запросе. Если запрос:

```http
GET /status?name=ryan HTTP/1.1
Accept: text/plain
```

потом `request.url` будет:

<!-- eslint-disable semi -->

```js
'/status?name=ryan';

```

Чтобы разобрать URL-адрес на части, `new URL()` может быть использован:

```console
$ node
> new URL('/status?name=ryan', 'http://example.com')
URL {
  href: 'http://example.com/status?name=ryan',
  origin: 'http://example.com',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'example.com',
  hostname: 'example.com',
  port: '',
  pathname: '/status',
  search: '?name=ryan',
  searchParams: URLSearchParams { 'name' => 'ryan' },
  hash: ''
}
```

### Класс: `http2.Http2ServerResponse`

<!-- YAML
added: v8.4.0
-->

- Расширяется: {Stream}

Этот объект создается внутри HTTP-сервером, а не пользователем. Он передается вторым параметром в [`'request'`](#event-request) событие.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

Указывает, что основной [`Http2Stream`](#class-http2stream) был прекращен до [`response.end()`](#responseenddata-encoding-callback) был вызван или смог промыть.

#### Событие: `'finish'`

<!-- YAML
added: v8.4.0
-->

Выдается после отправки ответа. В частности, это событие генерируется, когда последний сегмент заголовков и тела ответа был передан мультиплексору HTTP / 2 для передачи по сети. Это не означает, что клиент еще что-то получил.

После этого события в объекте ответа больше не будет событий.

#### `response.addTrailers(headers)`

<!-- YAML
added: v8.4.0
-->

- `headers` {Объект}

Этот метод добавляет к ответу завершающие заголовки HTTP (заголовок, но в конце сообщения).

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

#### `response.connection`

<!-- YAML
added: v8.4.0
deprecated: v13.0.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`response.socket`](#responsesocket).

- {net.Socket | tls.TLSSocket}

Видеть [`response.socket`](#responsesocket).

#### `response.createPushResponse(headers, callback)`

<!-- YAML
added: v8.4.0
-->

- `headers` {HTTP / 2 Headers Object} Объект, описывающий заголовки.
- `callback` {Function} Вызывается один раз `http2stream.pushStream()` завершено, либо когда попытка создать отправленный `Http2Stream` не удалось или был отклонен, или состояние `Http2ServerRequest` закрывается до вызова `http2stream.pushStream()` метод
  - `err` {Ошибка}
  - `res` {http2.Http2ServerResponse} Недавно созданный `Http2ServerResponse` объект

Вызов [`http2stream.pushStream()`](#http2streampushstreamheaders-options-callback) с заданными заголовками и оберните данный [`Http2Stream`](#class-http2stream) на вновь созданном `Http2ServerResponse` в качестве параметра обратного вызова в случае успеха. Когда `Http2ServerRequest` закрывается, обратный вызов вызывается с ошибкой `ERR_HTTP2_INVALID_STREAM`.

#### `response.end([data[, encoding]][, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18780
    description: This method now returns a reference to `ServerResponse`.
-->

- `data` {строка | Буфер | Uint8Array}
- `encoding` {нить}
- `callback` {Функция}
- Возвращает: {this}

Этот метод сигнализирует серверу, что все заголовки и тело ответа отправлены; этот сервер должен считать это сообщение завершенным. Метод, `response.end()`, ДОЛЖЕН вызываться при каждом ответе.

Если `data` указано, это эквивалентно вызову [`response.write(data, encoding)`](http.md#responsewritechunk-encoding-callback) с последующим `response.end(callback)`.

Если `callback` указан, он будет вызываться по завершении потока ответа.

#### `response.finished`

<!-- YAML
added: v8.4.0
deprecated:
 - v13.4.0
 - v12.16.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`response.writableEnded`](#responsewritableended).

- {логический}

Логическое значение, указывающее, завершен ли ответ. Начинается как `false`. После [`response.end()`](#responseenddata-encoding-callback) выполняется, значение будет `true`.

#### `response.getHeader(name)`

<!-- YAML
added: v8.4.0
-->

- `name` {нить}
- Возвращает: {строка}

Считывает заголовок, который уже был поставлен в очередь, но не отправлен клиенту. Имя не чувствительно к регистру.

```js
const contentType = response.getHeader('content-type');
```

#### `response.getHeaderNames()`

<!-- YAML
added: v8.4.0
-->

- Возвращает: {строка \[]}

Возвращает массив, содержащий уникальные имена текущих исходящих заголовков. Все имена заголовков в нижнем регистре.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = response.getHeaderNames();
// headerNames === ['foo', 'set-cookie']
```

#### `response.getHeaders()`

<!-- YAML
added: v8.4.0
-->

- Возвращает: {Object}

Возвращает частичную копию текущих исходящих заголовков. Поскольку используется неглубокая копия, значения массива можно изменять без дополнительных вызовов различных методов HTTP-модуля, связанных с заголовками. Ключи возвращаемого объекта - это имена заголовков, а значения - соответствующие значения заголовков. Все имена заголовков в нижнем регистре.

Объект, возвращаемый `response.getHeaders()` метод _не_ прототипно унаследовать от JavaScript `Object`. Это означает, что типичный `Object` такие методы как `obj.toString()`, `obj.hasOwnProperty()`, а другие не определены и _не будет работать_.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headers = response.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```

#### `response.hasHeader(name)`

<!-- YAML
added: v8.4.0
-->

- `name` {нить}
- Возвращает: {логическое}

Возврат `true` если заголовок идентифицирован `name` в настоящее время устанавливается в исходящих заголовках. При сопоставлении имени заголовка регистр не учитывается.

```js
const hasContentType = response.hasHeader('content-type');
```

#### `response.headersSent`

<!-- YAML
added: v8.4.0
-->

- {логический}

Истина, если заголовки были отправлены, в противном случае - ложь (только для чтения).

#### `response.removeHeader(name)`

<!-- YAML
added: v8.4.0
-->

- `name` {нить}

Удаляет заголовок, который был поставлен в очередь для неявной отправки.

```js
response.removeHeader('Content-Encoding');
```

### `response.req`

<!-- YAML
added: v15.7.0
-->

- {http2.Http2ServerRequest}

Ссылка на оригинальный HTTP2 `request` объект.

#### `response.sendDate`

<!-- YAML
added: v8.4.0
-->

- {логический}

Если установлено значение true, заголовок Date будет автоматически сгенерирован и отправлен в ответе, если он еще не присутствует в заголовках. По умолчанию true.

Это следует отключать только для тестирования; HTTP требует заголовка Date в ответах.

#### `response.setHeader(name, value)`

<!-- YAML
added: v8.4.0
-->

- `name` {нить}
- `value` {строка | строка \[]}

Устанавливает одно значение заголовка для неявных заголовков. Если этот заголовок уже существует в заголовках для отправки, его значение будет заменено. Используйте здесь массив строк, чтобы отправить несколько заголовков с одним и тем же именем.

```js
response.setHeader(
  'Content-Type',
  'text/html; charset=utf-8'
);
```

или

```js
response.setHeader('Set-Cookie', [
  'type=ninja',
  'language=javascript',
]);
```

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

Когда заголовки были установлены с [`response.setHeader()`](#responsesetheadername-value), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), с заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) учитывая приоритет.

```js
// Returns content-type = text/plain
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('ok');
});
```

#### `response.setTimeout(msecs[, callback])`

<!-- YAML
added: v8.4.0
-->

- `msecs` {количество}
- `callback` {Функция}
- Возвращает: {http2.Http2ServerResponse}.

Устанавливает [`Http2Stream`](#class-http2stream)значение тайм-аута до `msecs`. Если предоставляется обратный вызов, он добавляется в качестве слушателя на `'timeout'` событие в объекте ответа.

Если нет `'timeout'` слушатель добавляется к запросу, ответу или серверу, затем [`Http2Stream`](#class-http2stream)s уничтожаются по истечении времени ожидания. Если на запрос назначен обработчик, ответ или серверный `'timeout'` события, сокеты с истекшим временем ожидания должны обрабатываться явно.

#### `response.socket`

<!-- YAML
added: v8.4.0
-->

- {net.Socket | tls.TLSSocket}

Возвращает `Proxy` объект, который действует как `net.Socket` (или `tls.TLSSocket`), но применяет геттеры, сеттеры и методы на основе логики HTTP / 2.

`destroyed`, `readable`, а также `writable` свойства будут извлечены и установлены на `response.stream`.

`destroy`, `emit`, `end`, `on` а также `once` методы будут вызываться `response.stream`.

`setTimeout` метод будет вызван `response.stream.session`.

`pause`, `read`, `resume`, а также `write` выдаст ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`. Видеть [`Http2Session` и розетки](#http2session-and-sockets) для дополнительной информации.

Все остальные взаимодействия будут направляться непосредственно в сокет.

```js
const http2 = require('http2');
const server = http2
  .createServer((req, res) => {
    const ip = req.socket.remoteAddress;
    const port = req.socket.remotePort;
    res.end(
      `Your IP address is ${ip} and your source port is ${port}.`
    );
  })
  .listen(3000);
```

#### `response.statusCode`

<!-- YAML
added: v8.4.0
-->

- {количество}

При использовании неявных заголовков (не вызывающих [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) явно), это свойство управляет кодом состояния, который будет отправлен клиенту при сбросе заголовков.

```js
response.statusCode = 404;
```

После того, как заголовок ответа был отправлен клиенту, это свойство указывает код состояния, который был отправлен.

#### `response.statusMessage`

<!-- YAML
added: v8.4.0
-->

- {нить}

Сообщение о состоянии не поддерживается HTTP / 2 (RFC 7540 8.1.2.4). Возвращает пустую строку.

#### `response.stream`

<!-- YAML
added: v8.4.0
-->

- {Http2Stream}

В [`Http2Stream`](#class-http2stream) объект, подтверждающий ответ.

#### `response.writableEnded`

<!-- YAML
added: v12.9.0
-->

- {логический}

Является `true` после [`response.end()`](#responseenddata-encoding-callback) был вызван. Это свойство не указывает, были ли данные сброшены, для этого использования. [`writable.writableFinished`](stream.md#writablewritablefinished) вместо.

#### `response.write(chunk[, encoding][, callback])`

<!-- YAML
added: v8.4.0
-->

- `chunk` {строка | Буфер | Uint8Array}
- `encoding` {нить}
- `callback` {Функция}
- Возвращает: {логическое}

Если этот метод вызван и [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) не был вызван, он переключится в режим неявного заголовка и сбрасывает неявные заголовки.

Это отправляет кусок тела ответа. Этот метод может вызываться несколько раз для получения последовательных частей тела.

в `http` модуль, тело ответа опускается, если запрос является запросом HEAD. Аналогичным образом `204` а также `304` ответы _не должен_ включить тело сообщения.

`chunk` может быть строкой или буфером. Если `chunk` является строкой, второй параметр указывает, как ее кодировать в поток байтов. По умолчанию `encoding` является `'utf8'`. `callback` будет вызываться, когда этот фрагмент данных будет сброшен.

Это необработанное тело HTTP и не имеет ничего общего с кодировками, состоящими из нескольких частей, которые могут быть использованы.

Первый раз [`response.write()`](#responsewritechunk-encoding-callback) вызывается, он отправит клиенту буферизованную информацию заголовка и первый фрагмент тела. Второй раз [`response.write()`](#responsewritechunk-encoding-callback) вызывается, Node.js предполагает, что данные будут передаваться в потоковом режиме, и отправляет новые данные отдельно. То есть ответ буферизируется до первого фрагмента тела.

Возврат `true` если все данные были успешно сброшены в буфер ядра. Возврат `false` если все или часть данных были помещены в очередь в пользовательской памяти. `'drain'` будет выдан, когда буфер снова освободится.

#### `response.writeContinue()`

<!-- YAML
added: v8.4.0
-->

Отправляет статус `100 Continue` клиенту, указывая, что тело запроса должно быть отправлено. Увидеть [`'checkContinue'`](#event-checkcontinue) событие на `Http2Server` а также `Http2SecureServer`.

#### `response.writeHead(statusCode[, statusMessage][, headers])`

<!-- YAML
added: v8.4.0
changes:
  - version:
     - v11.10.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/25974
    description: Return `this` from `writeHead()` to allow chaining with
                 `end()`.
-->

- `statusCode` {количество}
- `statusMessage` {нить}
- `headers` {Объект}
- Возвращает: {http2.Http2ServerResponse}.

Отправляет заголовок ответа на запрос. Код состояния представляет собой трехзначный код состояния HTTP, например `404`. Последний аргумент, `headers`, являются заголовками ответа.

Возвращает ссылку на `Http2ServerResponse`, так что вызовы можно связывать.

Для совместимости с [HTTP / 1](http.md), удобочитаемый `statusMessage` может быть передан как второй аргумент. Однако, поскольку `statusMessage` не имеет значения в HTTP / 2, аргумент не будет иметь никакого эффекта, и будет выдано предупреждение процесса.

```js
const body = 'hello world';
response.writeHead(200, {
  'Content-Length': Buffer.byteLength(body),
  'Content-Type': 'text/plain; charset=utf-8',
});
```

`Content-Length` дается в байтах, а не в символах. В `Buffer.byteLength()` API может использоваться для определения количества байтов в данной кодировке. В исходящих сообщениях Node.js не проверяет, равны ли Content-Length и длина передаваемого тела. Однако при получении сообщений Node.js автоматически отклоняет сообщения, когда `Content-Length` не соответствует фактическому размеру полезной нагрузки.

Этот метод может быть вызван не более одного раза в сообщении перед [`response.end()`](#responseenddata-encoding-callback) называется.

Если [`response.write()`](#responsewritechunk-encoding-callback) или [`response.end()`](#responseenddata-encoding-callback) вызываются перед вызовом этого, неявные / изменяемые заголовки будут вычислены и вызовут эту функцию.

Когда заголовки были установлены с [`response.setHeader()`](#responsesetheadername-value), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), с заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) учитывая приоритет.

```js
// Returns content-type = text/plain
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
  });
  res.end('ok');
});
```

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

## Сбор метрик производительности HTTP / 2

В [Наблюдатель за производительностью](perf_hooks.md) API можно использовать для сбора основных показателей производительности для каждого `Http2Session` а также `Http2Stream` пример.

```js
const { PerformanceObserver } = require('perf_hooks');

const obs = new PerformanceObserver((items) => {
  const entry = items.getEntries()[0];
  console.log(entry.entryType); // prints 'http2'
  if (entry.name === 'Http2Session') {
    // Entry contains statistics about the Http2Session
  } else if (entry.name === 'Http2Stream') {
    // Entry contains statistics about the Http2Stream
  }
});
obs.observe({ entryTypes: ['http2'] });
```

В `entryType` собственность `PerformanceEntry` будет равно `'http2'`.

В `name` собственность `PerformanceEntry` будет равно либо `'Http2Stream'` или `'Http2Session'`.

Если `name` равно `Http2Stream`, то `PerformanceEntry` будет содержать следующие дополнительные свойства:

- `bytesRead` {number} Количество `DATA` фрейм байтов, полученных для этого `Http2Stream`.
- `bytesWritten` {number} Количество `DATA` байтов кадра, отправленных для этого `Http2Stream`.
- `id` {number} идентификатор связанного `Http2Stream`
- `timeToFirstByte` {number} количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и прием первого `DATA` Рамка.
- `timeToFirstByteSent` {number} количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и отправка первого `DATA` Рамка.
- `timeToFirstHeader` {number} количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и прием первого заголовка.

Если `name` равно `Http2Session`, то `PerformanceEntry` будет содержать следующие дополнительные свойства:

- `bytesRead` {number} Количество байтов, полученных для этого `Http2Session`.
- `bytesWritten` {number} Количество байтов, отправленных для этого `Http2Session`.
- `framesReceived` {number} Количество кадров HTTP / 2, полученных `Http2Session`.
- `framesSent` {number} Количество кадров HTTP / 2, отправленных `Http2Session`.
- `maxConcurrentStreams` {number} Максимальное количество потоков, одновременно открытых в течение времени существования `Http2Session`.
- `pingRTT` {number} Количество миллисекунд, прошедших с момента передачи `PING` кадр и прием его подтверждения. Присутствует только в том случае, если `PING` кадр был отправлен на `Http2Session`.
- `streamAverageDuration` {number} Средняя продолжительность (в миллисекундах) для всех `Http2Stream` экземпляры.
- `streamCount` {number} Количество `Http2Stream` экземпляры, обработанные `Http2Session`.
- `type` {строка} Либо `'server'` или `'client'` определить тип `Http2Session`.

## Обратите внимание на `:authority` а также `host`

HTTP / 2 требует, чтобы запросы имели либо `:authority` псевдо-заголовок или `host` заголовок. Предпочитать `:authority` при построении запроса HTTP / 2 напрямую, и `host` при конвертации из HTTP / 1 (например, в прокси).

API совместимости возвращается к `host` если `:authority` нет. Видеть [`request.authority`](#requestauthority) для дополнительной информации. Однако, если вы не используете API совместимости (или используете `req.headers` напрямую), вам необходимо самостоятельно реализовать любое откатное поведение.
