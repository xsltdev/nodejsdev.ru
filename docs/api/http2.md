---
title: HTTP/2
description: Модуль node:http2 — протокол HTTP/2, Core API и API совместимости с HTTP/1
---

# HTTP/2

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/http2.html)

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

Добавлено в: v8.4.0

<!--introduced_in=v8.4.0-->

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/http2.js -->

Модуль `node:http2` реализует протокол [HTTP/2][HTTP/2]. Подключение:

```js
const http2 = require('node:http2');
```

## Проверка отсутствия поддержки криптографии

Node.js может быть собран без модуля `node:crypto`. Тогда `import` из `node:http2`
или `require('node:http2')` приведут к выбросу ошибки.

В CommonJS ошибку можно перехватить через try/catch:

=== "CJS"

    ```js
    let http2;
    try {
      http2 = require('node:http2');
    } catch (err) {
      console.error('http2 support is disabled!');
    }
    ```

При лексическом `import` в ESM ошибку можно перехватить только если обработчик
`process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль
(например через preload).

Если код ESM может выполняться на сборке без криптографии, используйте динамический
[`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) вместо лексического `import`:

=== "MJS"

    ```js
    let http2;
    try {
      http2 = await import('node:http2');
    } catch (err) {
      console.error('http2 support is disabled!');
    }
    ```

## Основной API (Core API)

Core API — низкоуровневый интерфейс вокруг возможностей HTTP/2. Он _не_ рассчитан
на совместимость с модулем [HTTP/1][HTTP/1], зато есть [API совместимости][Compatibility API].

Core API `http2` симметричнее для клиента и сервера, чем `http`: события вроде
`'error'`, `'connect'` и `'stream'` могут испускаться и на клиенте, и на сервере.

### Пример сервера

Ниже простой HTTP/2-сервер на Core API. Известных браузеров с поддержкой
[незашифрованного HTTP/2][HTTP/2 Unencrypted] нет, поэтому для работы с браузерами
нужен [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler).

=== "MJS"

    ```js
    import { createSecureServer } from 'node:http2';
    import { readFileSync } from 'node:fs';
    
    const server = createSecureServer({
      key: readFileSync('localhost-privkey.pem'),
      cert: readFileSync('localhost-cert.pem'),
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

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const fs = require('node:fs');
    
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

Чтобы сгенерировать сертификат и ключ для примера, выполните:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

### Пример клиента

Пример HTTP/2-клиента:

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    import { readFileSync } from 'node:fs';
    
    const client = connect('https://localhost:8443', {
      ca: readFileSync('localhost-cert.pem'),
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
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      console.log(`\n${data}`);
      client.close();
    });
    req.end();
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const fs = require('node:fs');
    
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
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      console.log(`\n${data}`);
      client.close();
    });
    req.end();
    ```

### Класс: `Http2Session` {#class-http2session}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<EventEmitter>`](events.md#class-eventemitter)

Экземпляры класса `http2.Http2Session` представляют активную сессию обмена
данными между HTTP/2-клиентом и сервером. Экземпляры этого класса _не_
предназначены для прямого создания из прикладного кода.

Поведение каждого экземпляра `Http2Session` немного различается в зависимости от того,
работает ли он как сервер или как клиент. Свойство `http2session.type` позволяет
определить режим работы `Http2Session`. На стороне сервера прикладному коду редко
приходится работать с объектом `Http2Session` напрямую: обычно действия выполняются
через `Http2Server` или объекты `Http2Stream`.

Прикладной код не создаёт экземпляры `Http2Session` напрямую. На сервере они
создаются экземпляром `Http2Server` при приёме нового соединения HTTP/2. На клиенте
экземпляры `Http2Session` создаются вызовом `http2.connect()`.

#### `Http2Session` и сокеты {#http2session-and-sockets}

Каждый экземпляр `Http2Session` при создании связан ровно с одним [`net.Socket`](net.md#class-netsocket) или
[`tls.TLSSocket`](tls.md#class-tlstlssocket). При уничтожении `Socket` или `Http2Session` уничтожаются оба.

Из-за особых требований к сериализации и обработке, которые накладывает протокол HTTP/2,
прикладному коду не рекомендуется читать данные из `Socket` или записывать в него,
если сокет привязан к `Http2Session`. Это может перевести сессию HTTP/2 в
неопределённое состояние и сделать сессию и сокет непригодными к использованию.

После привязки `Socket` к `Http2Session` прикладной код должен опираться
только на API `Http2Session`.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

Событие `'close'` генерируется после уничтожения `Http2Session`. У обработчика нет
аргументов.

#### Событие: `'connect'`

<!-- YAML
added: v8.4.0
-->

* `session` [`<Http2Session>`](http2.md)
* `socket` [`<net.Socket>`](net.md#class-netsocket)

Событие `'connect'` генерируется после успешного подключения `Http2Session` к
удалённой стороне; можно начинать обмен.

Прикладной код обычно не подписывается на это событие напрямую.

#### Событие: `'error'`

<!-- YAML
added: v8.4.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` генерируется при ошибке обработки `Http2Session`.

#### Событие: `'frameError'`

<!-- YAML
added: v8.4.0
-->

* `type` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тип кадра.
* `code` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код ошибки.
* `id` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор потока (или `0`, если кадр не связан с потоком).

Событие `'frameError'` генерируется при ошибке отправки кадра в сессии. Если кадр,
который не удалось отправить, относится к конкретному `Http2Stream`, делается
попытка сгенерировать `'frameError'` на этом `Http2Stream`.

Если `'frameError'` связан с потоком, поток сразу после него закрывается и
уничтожается. Если событие не связано с потоком, `Http2Session` завершается сразу
после `'frameError'`.

#### Событие: `'goaway'`

<!-- YAML
added: v8.4.0
-->

* `errorCode` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код ошибки HTTP/2 из кадра `GOAWAY`.
* `lastStreamID` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор последнего потока, успешно обработанного
  удалённой стороной (или `0`, если не указан).
* `opaqueData` [`<Buffer>`](buffer.md#buffer) Если в кадре `GOAWAY` были дополнительные непрозрачные
  данные, передаётся `Buffer` с ними.

Событие `'goaway'` генерируется при получении кадра `GOAWAY`.

Экземпляр `Http2Session` автоматически завершается при генерации `'goaway'`.

#### Событие: `'localSettings'`

<!-- YAML
added: v8.4.0
-->

* `settings` [`<HTTP/2 Settings Object>`](#settings-object) Копия полученного кадра `SETTINGS`.

Событие `'localSettings'` генерируется при получении подтверждающего кадра
`SETTINGS`.

При вызове `http2session.settings()` новые параметры вступают в силу только после
события `'localSettings'`.

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

* `payload` [`<Buffer>`](buffer.md#buffer) 8-байтовая полезная нагрузка кадра `PING`

Событие `'ping'` генерируется при каждом получении кадра `PING` от подключённого пира.

#### Событие: `'remoteSettings'`

<!-- YAML
added: v8.4.0
-->

* `settings` [`<HTTP/2 Settings Object>`](#settings-object) Копия полученного кадра `SETTINGS`.

Событие `'remoteSettings'` генерируется при получении нового кадра `SETTINGS` от пира.

```js
session.on('remoteSettings', (settings) => {
  /* Use the new settings */
});
```

#### Событие: `'stream'`

<!-- YAML
added: v8.4.0
-->

* `stream` [`<Http2Stream>`](#class-http2stream) Ссылка на поток
* `headers` [`<HTTP/2 Headers Object>`](#headers-object) Объект заголовков
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Связанные числовые флаги
* `rawHeaders` [`<HTTP/2 Raw Headers>`](#raw-headers) Массив сырых заголовков

Событие `'stream'` генерируется при создании нового `Http2Stream`.

```js
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

На сервере обычно не подписываются на это событие напрямую, а обрабатывают
`'stream'` у `net.Server` или `tls.Server` из `http2.createServer()` и
`http2.createSecureServer()`, как в примере:

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    
    // Create an unencrypted HTTP/2 server
    const server = createServer();
    
    server.on('stream', (stream, headers) => {
      stream.respond({
        'content-type': 'text/html; charset=utf-8',
        ':status': 200,
      });
      stream.on('error', (error) => console.error(error));
      stream.end('<h1>Hello World</h1>');
    });
    
    server.listen(8000);
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
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
    
    server.listen(8000);
    ```

Потоки HTTP/2 и сетевые сокеты не соответствуют друг другу 1:1; сетевая ошибка
уничтожает каждый поток отдельно — обрабатывайте на уровне потока, как выше.

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
-->

После `http2session.setTimeout()` событие `'timeout'` генерируется при отсутствии
активности на `Http2Session` в течение заданных миллисекунд. У обработчика нет
аргументов.

```js
session.setTimeout(2000);
session.on('timeout', () => { /* .. */ });
```

#### `http2session.alpnProtocol`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Значение `undefined`, если `Http2Session` ещё не подключена к сокету; `h2c`, если
не используется `TLSSocket`; иначе — значение `alpnProtocol` подключённого `TLSSocket`.

#### `http2session.close([callback])`

<!-- YAML
added: v9.4.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Корректно закрывает `Http2Session`: текущие потоки завершаются сами, новые
`Http2Stream` не создаются. После закрытия `http2session.destroy()` _может_ быть
вызвана, если нет открытых `Http2Stream`.

Если указан `callback`, он регистрируется как обработчик `'close'`.

#### `http2session.closed`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если сессия закрыта, иначе `false`.

#### `http2session.connecting`

<!-- YAML
added: v10.0.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, пока сессия ещё подключается; перед событием `connect` и/или вызовом
колбэка `http2.connect` станет `false`.

#### `http2session.destroy([error][, code])`

<!-- YAML
added: v8.4.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка, если уничтожение из-за ошибки.
* `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код ошибки HTTP/2 для финального кадра `GOAWAY`. Если не задан
  и `error` не `undefined`, по умолчанию `INTERNAL_ERROR`, иначе `NO_ERROR`.

Немедленно завершает `Http2Session` и связанный `net.Socket` или `tls.TLSSocket`.

После уничтожения — событие `'close'`. Если `error` не `undefined`, перед `'close'`
сгенерируется `'error'`.

Оставшиеся открытые `Http2Stream` этой сессии тоже уничтожаются.

#### `http2session.destroyed`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если сессия уничтожена и больше не должна использоваться.

#### `http2session.encrypted`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined

`undefined`, если сокет сессии ещё не подключён; `true` при `TLSSocket`;
`false` для других типов сокета или потока.

#### `http2session.goaway([code[, lastStreamID[, opaqueData]]])`

<!-- YAML
added: v9.4.0
-->

* `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код ошибки HTTP/2
* `lastStreamID` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Числовой ID последнего обработанного `Http2Stream`
* `opaqueData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Дополнительные данные в кадре `GOAWAY`

Отправляет кадр `GOAWAY` пиру _без_ закрытия `Http2Session`.

#### `http2session.localSettings`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<HTTP/2 Settings Object>`](#settings-object)

Объект без прототипа с текущими локальными настройками этой `Http2Session`.

#### `http2session.originSet`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

При подключении к `TLSSocket` возвращает массив origin, для которых сессия
может считаться авторитетной. Только при TLS.

#### `http2session.pendingSettingsAck`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Ожидает ли сессия подтверждения отправленного `SETTINGS`. `true` после
`http2session.settings()`; `false`, когда все `SETTINGS` подтверждены.

#### `http2session.ping([payload, ]callback)`

<!-- YAML
added: v8.9.3
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.9.3

* `payload` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательная полезная нагрузка пинга.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отправляет кадр `PING` HTTP/2-пиру. `callback` обязателен. Возвращает `true`, если
`PING` отправлен, иначе `false`.

Максимум неподтверждённых пингов задаётся `maxOutstandingPings` (по умолчанию 10).

`payload` — ровно 8 байт в `Buffer`, `TypedArray` или `DataView`; возвращается с
подтверждением пинга.

Колбэк: `(err, duration, payload)` — `err` равен `null` при успехе, `duration` —
миллисекунды от отправки до подтверждения, `payload` — 8 байт ответа.

```js
session.ping(Buffer.from('abcdefgh'), (err, duration, payload) => {
  if (!err) {
    console.log(`Ping acknowledged in ${duration} milliseconds`);
    console.log(`With payload '${payload.toString()}'`);
  }
});
```

Без `payload` по умолчанию — 64-битная метка времени (little endian) начала измерения `PING`.

#### `http2session.ref()`

<!-- YAML
added: v9.4.0
-->

Вызывает [`ref()`](net.md#socketref) для базового [`net.Socket`](net.md#class-netsocket).

#### `http2session.remoteSettings`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<HTTP/2 Settings Object>`](#settings-object)

Объект без прототипа с удалёнными настройками; их задаёт подключённый пир HTTP/2.

#### `http2session.setLocalWindowSize(windowSize)`

<!-- YAML
added:
  - v15.3.0
  - v14.18.0
-->

* `windowSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт размер окна локальной конечной точки. `windowSize` — полный размер окна, не дельта.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    
    const server = createServer();
    const expectedWindowSize = 2 ** 20;
    server.on('session', (session) => {
    
      // Set local window size to be 2 ** 20
      session.setLocalWindowSize(expectedWindowSize);
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
    const server = http2.createServer();
    const expectedWindowSize = 2 ** 20;
    server.on('session', (session) => {
    
      // Set local window size to be 2 ** 20
      session.setLocalWindowSize(expectedWindowSize);
    });
    ```

Для клиентов HTTP/2 подходят события `'connect'` или `'remoteSettings'`.

#### `http2session.setTimeout(msecs, callback)`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Задаёт колбэк при отсутствии активности на `Http2Session` дольше `msecs` мс;
регистрируется как слушатель `'timeout'`.

#### `http2session.socket`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<net.Socket>`](net.md#class-netsocket) | [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

Возвращает объект `Proxy`, ведущий себя как `net.Socket` (или `tls.TLSSocket`),
но ограничивает методы безопасными для HTTP/2.

`destroy`, `emit`, `end`, `pause`, `read`, `resume`, `write` дают ошибку
`ERR_HTTP2_NO_SOCKET_MANIPULATION`. См. [`Http2Session` и сокеты](#http2session-and-sockets).

`setTimeout` вызывается на этой `Http2Session`.

Остальное проксируется на сокет.

#### `http2session.state`

<!-- YAML
added: v8.4.0
-->

Разная информация о состоянии `Http2Session`.

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `effectiveLocalWindowSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Текущий локальный размер окна приёма.
  * `effectiveRecvDataLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Байт получено с последнего `WINDOW_UPDATE`.
  * `nextStreamID` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Следующий ID для нового `Http2Stream`.
  * `localWindowSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт удалённый пир может отправить без `WINDOW_UPDATE`.
  * `lastProcStreamID` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID потока, для которого последним пришёл `HEADERS` или `DATA`.
  * `remoteWindowSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт может отправить эта сессия без `WINDOW_UPDATE`.
  * `outboundQueueSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Кадров в исходящей очереди.
  * `deflateDynamicTableSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер исходящей динамической таблицы сжатия заголовков.
  * `inflateDynamicTableSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер входящей динамической таблицы.

Объект с текущим состоянием сессии.

#### `http2session.settings([settings][, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `settings` [`<HTTP/2 Settings Object>`](#settings-object)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после подключения сессии или сразу, если уже подключена.
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null
  * `settings` [`<HTTP/2 Settings Object>`](#settings-object) Обновлённый объект настроек.
  * `duration` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Обновляет локальные настройки и отправляет `SETTINGS` пиру.

После вызова `http2session.pendingSettingsAck` будет `true`, пока пир не подтвердит.

Новые настройки вступают в силу после подтверждения `SETTINGS` и события `'localSettings'`.
Можно отправить несколько `SETTINGS` подряд.

#### `http2session.type`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

`http2session.type` равен `http2.constants.NGHTTP2_SESSION_SERVER` для сервера и
`http2.constants.NGHTTP2_SESSION_CLIENT` для клиента.

#### `http2session.unref()`

<!-- YAML
added: v9.4.0
-->

Вызывает [`unref()`](net.md#socketunref) для базового [`net.Socket`](net.md#class-netsocket).

### Класс: `ServerHttp2Session` {#class-serverhttp2session}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<Http2Session>`](http2.md)

#### `serverhttp2session.altsvc(alt, originOrStream)`

<!-- YAML
added: v9.4.0
-->

* `alt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Описание альтернативной службы по [RFC 7838][RFC 7838].
* `originOrStream` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) origin URL (или объект с `origin`)
  либо числовой ID активного `Http2Stream` (`http2stream.id`).

Отправляет клиенту кадр `ALTSVC` ([RFC 7838][RFC 7838]).

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    
    const server = createServer();
    server.on('session', (session) => {
      // Set altsvc for origin https://example.org:80
      session.altsvc('h2=":8000"', 'https://example.org:80');
    });
    
    server.on('stream', (stream) => {
      // Set altsvc for a specific stream
      stream.session.altsvc('h2=":8000"', stream.id);
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
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

Отправка кадра `ALTSVC` с конкретным идентификатором потока означает, что альтернативная
служба связана с origin данного `Http2Stream`.

Строки `alt` и origin _должны_ содержать только байты ASCII и интерпретируются строго
как последовательность байтов ASCII. Специальное значение `'clear'` можно передать,
чтобы сбросить ранее заданную альтернативную службу для домена.

Если в аргумент `originOrStream` передана строка, она разбирается как URL и из неё
извлекается значение `origin`. Например, для URL HTTP `'https://example.org/foo/bar'`
значение `origin` — ASCII-строка `'https://example.org'`. Будет выброшена ошибка,
если строку нельзя разобрать как URL или из неё нельзя получить корректный `origin`.

В качестве `originOrStream` можно передать объект `URL` или любой объект со свойством
`origin`; тогда используется значение свойства `origin`. Значение свойства `origin`
_должно_ быть корректно сериализованным ASCII origin.

#### Указание альтернативных служб {#specifying-alternative-services}

Формат параметра `alt` строго задан [RFC 7838][RFC 7838]: это ASCII-строка со списком
«альтернативных» протоколов через запятую, связанных с конкретным хостом и портом.

Например, значение `'h2="example.org:81"'` означает, что протокол HTTP/2 доступен на
хосте `'example.org'` на TCP/IP-порту 81. Хост и порт _должны_ быть внутри кавычек (`"`).

Можно указать несколько альтернатив, например: `'h2="example.org:81",
h2=":82"'`.

Идентификатор протокола (`'h2'` в примерах) может быть любым допустимым
[ALPN Protocol ID][ALPN Protocol ID].

Синтаксис этих значений реализацией Node.js не проверяется: они передаются как есть —
от пользователя или от пира.

#### `serverhttp2session.origin(...origins)`

<!-- YAML
added: v10.12.0
-->

* `origins` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Одна или несколько строк URL, переданных отдельными
  аргументами.

Отправляет подключённому клиенту кадр `ORIGIN` (по [RFC 8336][RFC 8336]), чтобы объявить
набор origin, для которых сервер может выдавать авторитетные ответы.

=== "MJS"

    ```js
    import { createSecureServer } from 'node:http2';
    const options = getSecureOptionsSomehow();
    const server = createSecureServer(options);
    server.on('stream', (stream) => {
      stream.respond();
      stream.end('ok');
    });
    server.on('session', (session) => {
      session.origin('https://example.com', 'https://example.org');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const options = getSecureOptionsSomehow();
    const server = http2.createSecureServer(options);
    server.on('stream', (stream) => {
      stream.respond();
      stream.end('ok');
    });
    server.on('session', (session) => {
      session.origin('https://example.com', 'https://example.org');
    });
    ```

Если в качестве `origin` передана строка, она разбирается как URL и из неё извлекается
значение `origin`. Например, для URL HTTP `'https://example.org/foo/bar'` значение
`origin` — ASCII-строка `'https://example.org'`. Будет выброшена ошибка, если строку
нельзя разобрать как URL или из неё нельзя получить корректный `origin`.

В качестве `origin` можно передать объект `URL` или любой объект со свойством
`origin`; тогда используется значение свойства `origin`. Значение свойства `origin`
_должно_ быть корректно сериализованным ASCII origin.

Также можно использовать опцию `origins` при создании нового HTTP/2-сервера через
`http2.createSecureServer()`:

=== "MJS"

    ```js
    import { createSecureServer } from 'node:http2';
    const options = getSecureOptionsSomehow();
    options.origins = ['https://example.com', 'https://example.org'];
    const server = createSecureServer(options);
    server.on('stream', (stream) => {
      stream.respond();
      stream.end('ok');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const options = getSecureOptionsSomehow();
    options.origins = ['https://example.com', 'https://example.org'];
    const server = http2.createSecureServer(options);
    server.on('stream', (stream) => {
      stream.respond();
      stream.end('ok');
    });
    ```

### Класс: `ClientHttp2Session` {#class-clienthttp2session}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<Http2Session>`](http2.md)

#### Событие: `'altsvc'`

<!-- YAML
added: v9.4.0
-->

* `alt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `origin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `streamId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'altsvc'` генерируется при каждом получении клиентом кадра `ALTSVC`.
В обработчик передаются значение из `ALTSVC`, origin и идентификатор потока.
Если в кадре `ALTSVC` нет `origin`, в аргументе будет пустая строка.

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    const client = connect('https://example.org');
    
    client.on('altsvc', (alt, origin, streamId) => {
      console.log(alt);
      console.log(origin);
      console.log(streamId);
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
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

* `origins` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Событие `'origin'` генерируется при каждом получении клиентом кадра `ORIGIN`.
В обработчик передаётся массив строк `origin`. Свойство `http2session.originSet`
обновляется так, чтобы включить полученные origin.

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    const client = connect('https://example.org');
    
    client.on('origin', (origins) => {
      for (let n = 0; n < origins.length; n++)
        console.log(origins[n]);
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const client = http2.connect('https://example.org');
    
    client.on('origin', (origins) => {
      for (let n = 0; n < origins.length; n++)
        console.log(origins[n]);
    });
    ```

Событие `'origin'` генерируется только при использовании защищённого TLS-соединения.

#### `clienthttp2session.request(headers[, options])`

<!-- YAML
added: v8.4.0
changes:
  - version: v24.2.0
    pr-url: https://github.com/nodejs/node/pull/58293
    description: The `weight` option is now ignored, setting it will trigger a
                 runtime warning.
  - version:
      - v24.2.0
      - v22.17.0
      - v20.19.6
    pr-url: https://github.com/nodejs/node/pull/58313
    description: Following the deprecation of priority signaling as of RFC 9113,
                 `weight` option is deprecated.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57917
    description: Allow passing headers in raw array format.
-->

Добавлено в: v8.4.0

* `headers` [`<HTTP/2 Headers Object>`](#headers-object) | [`<HTTP/2 Raw Headers>`](#raw-headers)

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `endStream` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если сторону `Http2Stream` для _записи_ нужно
    сразу закрыть, например при отправке запроса `GET` без тела.
  * `exclusive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true` и `parent` указывает на родительский поток,
    создаваемый поток становится единственной прямой зависимостью родителя, а все
    остальные существующие зависимые потоки становятся зависимыми от нового потока.
    **По умолчанию:** `false`.
  * `parent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Числовой идентификатор потока, от которого зависит новый поток.
  * `waitForTrailers` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, после отправки последнего кадра `DATA`
    `Http2Stream` сгенерирует событие `'wantTrailers'`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) `AbortSignal` для прерывания текущего запроса.

* Возвращает: [`<ClientHttp2Stream>`](#class-clienthttp2stream)

Только для клиентских экземпляров `Http2Session`: `http2session.request()`
создаёт и возвращает экземпляр `Http2Stream` для отправки HTTP/2-запроса на подключённый сервер.

При первом создании `ClientHttp2Session` сокет может быть ещё не подключён. Если в этот
момент вызвать `clienthttp2session.request()`, фактический запрос откладывается до
готовности сокета. Если `session` закроется до выполнения запроса, будет выброшено
`ERR_HTTP2_GOAWAY_SESSION`.

Метод доступен только при `http2session.type` равном
`http2.constants.NGHTTP2_SESSION_CLIENT`.

=== "MJS"

    ```js
    import { connect, constants } from 'node:http2';
    const clientSession = connect('https://localhost:1234');
    const {
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS,
    } = constants;
    
    const req = clientSession.request({ [HTTP2_HEADER_PATH]: '/' });
    req.on('response', (headers) => {
      console.log(headers[HTTP2_HEADER_STATUS]);
      req.on('data', (chunk) => { /* .. */ });
      req.on('end', () => { /* .. */ });
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const clientSession = http2.connect('https://localhost:1234');
    const {
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS,
    } = http2.constants;
    
    const req = clientSession.request({ [HTTP2_HEADER_PATH]: '/' });
    req.on('response', (headers) => {
      console.log(headers[HTTP2_HEADER_STATUS]);
      req.on('data', (chunk) => { /* .. */ });
      req.on('end', () => { /* .. */ });
    });
    ```

Если задана опция `options.waitForTrailers`, событие `'wantTrailers'` генерируется
сразу после постановки в очередь последнего фрагмента полезной нагрузки.
Тогда можно вызвать `http2stream.sendTrailers()`, чтобы отправить завершающие заголовки пиру.

При установленном `options.waitForTrailers` `Http2Stream` не закроется автоматически
после отправки последнего кадра `DATA`. Прикладной код должен вызвать либо
`http2stream.sendTrailers()`, либо `http2stream.close()`, чтобы закрыть
`Http2Stream`.

Если задан `options.signal` с `AbortSignal` и вызывается `abort` у соответствующего
`AbortController`, у запроса будет событие `'error'` с ошибкой `AbortError`.

Псевдозаголовки `:method` и `:path` в `headers` не задаются — по умолчанию используются:

* `:method` = `'GET'`
* `:path` = `/`

### Класс: `Http2Stream` {#class-http2stream}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<stream.Duplex>`](stream.md#class-streamduplex)

Каждый экземпляр класса `Http2Stream` — это двунаправленный поток обмена HTTP/2 поверх
`Http2Session`. За время жизни одной `Http2Session` может существовать до 2<sup>31</sup>−1
экземпляров `Http2Stream`.

Прикладной код не создаёт `Http2Stream` напрямую: они создаются и передаются через
`Http2Session`. На сервере `Http2Stream` появляется при входящем HTTP-запросе (и
передаётся в обработчик события `'stream'`) или при вызове `http2stream.pushStream()`.
На клиенте экземпляры создаются и возвращаются при вызове `http2session.request()` или
при входящем событии `'push'`.

Класс `Http2Stream` — основа для [`ServerHttp2Stream`](#class-serverhttp2stream) и
[`ClientHttp2Stream`](#class-clienthttp2stream), которые используются соответственно на сервере и на клиенте.

Все экземпляры `Http2Stream` — потоки [`Duplex`](stream.md#class-streamduplex): сторона `Writable` отправляет данные
пиру, сторона `Readable` принимает данные от пира.

Кодировка текста по умолчанию для `Http2Stream` — UTF-8. При отправке текста задайте
кодировку заголовком `'content-type'`.

```js
stream.respond({
  'content-type': 'text/html; charset=utf-8',
  ':status': 200,
});
```

#### Жизненный цикл `Http2Stream`

##### Создание

На сервере экземпляры [`ServerHttp2Stream`](#class-serverhttp2stream) создаются, когда:

* получен новый кадр HTTP/2 `HEADERS` с ранее неиспользованным идентификатором потока;
* вызван метод `http2stream.pushStream()`.

На клиенте экземпляры [`ClientHttp2Stream`](#class-clienthttp2stream) создаются при вызове
`http2session.request()`.

На клиенте экземпляр `Http2Stream`, возвращённый `http2session.request()`, может быть
ещё не готов к использованию, если родительская `Http2Session` ещё не установлена полностью.
Тогда операции над `Http2Stream` буферизуются до события `'ready'`. Прикладному коду редко
нужно обрабатывать `'ready'` напрямую. Готовность `Http2Stream` можно проверить по
`http2stream.id`: если значение `undefined`, поток ещё не готов.

##### Уничтожение

Все экземпляры [`Http2Stream`](#class-http2stream) уничтожаются, когда:

* от подключённого пира получен кадр `RST_STREAM` для потока и (только для клиентских потоков)
  прочитаны отложенные данные;
* вызван `http2stream.close()` и (только для клиентских потоков) прочитаны отложенные данные;
* вызваны `http2stream.destroy()` или `http2session.destroy()`.

При уничтожении `Http2Stream` делается попытка отправить пиру кадр `RST_STREAM`.

После уничтожения `Http2Stream` генерируется `'close'`. Поскольку `Http2Stream` —
экземпляр `stream.Duplex`, при текущем потоке данных также будет `'end'`.
Событие `'error'` возможно, если `http2stream.destroy()` вызван с `Error` первым аргументом.

После уничтожения `http2stream.destroyed` будет `true`, а `http2stream.rstCode` задаёт
код ошибки `RST_STREAM`. Уничтоженный `Http2Stream` использовать нельзя.

#### Событие: `'aborted'`

<!-- YAML
added: v8.4.0
-->

Событие `'aborted'` генерируется при аварийном прерывании `Http2Stream` в процессе обмена.
У обработчика нет аргументов.

Событие `'aborted'` генерируется только если сторона записи `Http2Stream` ещё не завершена.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

Событие `'close'` генерируется при уничтожении `Http2Stream`. После него экземпляр
использовать нельзя.

Код ошибки HTTP/2 при закрытии потока можно получить из `http2stream.rstCode`. Если код
не равен `NGHTTP2_NO_ERROR` (`0`), также будет событие `'error`.

#### Событие: `'error'`

<!-- YAML
added: v8.4.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` генерируется при ошибке обработки `Http2Stream`.

#### Событие: `'frameError'`

<!-- YAML
added: v8.4.0
-->

* `type` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тип кадра.
* `code` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код ошибки.
* `id` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор потока (или `0`, если кадр не связан с потоком).

Событие `'frameError'` генерируется при ошибке отправки кадра. Обработчик получает целое
число — тип кадра, и целое число — код ошибки. Экземпляр `Http2Stream` уничтожается сразу
после `'frameError'`.

#### Событие: `'ready'`

<!-- YAML
added: v8.4.0
-->

Событие `'ready'` генерируется, когда `Http2Stream` открыт, ему назначен `id`, и им можно
пользоваться. У обработчика нет аргументов.

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
-->

Событие `'timeout'` генерируется при отсутствии активности на `Http2Stream` в течение
числа миллисекунд, заданного `http2stream.setTimeout()`.
У обработчика нет аргументов.

#### Событие: `'trailers'`

<!-- YAML
added: v8.4.0
-->

* `headers` [`<HTTP/2 Headers Object>`](#headers-object) Объект с заголовками
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Связанные числовые флаги

Событие `'trailers'` генерируется при получении блока заголовков завершающих полей.
В колбэк передаются [объект заголовков HTTP/2][HTTP/2 Headers Object] и флаги.

Событие может не произойти, если `http2stream.end()` вызван до получения трейлеров и
входящие данные не читаются и на них не подписываются.

```js
stream.on('trailers', (headers, flags) => {
  console.log(headers);
});
```

#### Событие: `'wantTrailers'`

<!-- YAML
added: v10.0.0
-->

Событие `'wantTrailers'` генерируется, когда в очередь поставлен последний кадр `DATA` для
отправки и `Http2Stream` готов отправить завершающие заголовки. Чтобы оно возникло, при
инициации запроса или ответа нужно задать опцию `waitForTrailers`.

#### `http2stream.aborted`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если экземпляр `Http2Stream` был аварийно прерван. В этом случае уже было
событие `'aborted'`.

#### `http2stream.bufferSize`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число символов, буферизованных для записи. Подробнее см. [`net.Socket.bufferSize`](net.md#socketbuffersize).

#### `http2stream.close(code[, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Беззнаковое 32-битное целое — код ошибки.
  **По умолчанию:** `http2.constants.NGHTTP2_NO_ERROR` (`0x00`).
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция — слушатель события
  `'close'`.

Закрывает экземпляр `Http2Stream`, отправляя пиру HTTP/2 кадр `RST_STREAM`.

#### `http2stream.closed`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если экземпляр `Http2Stream` закрыт.

#### `http2stream.destroyed`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если экземпляр `Http2Stream` уничтожен и больше не может использоваться.

#### `http2stream.endAfterHeaders`

<!-- YAML
added: v10.11.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если во входящем кадре HEADERS запроса или ответа установлен флаг `END_STREAM`,
то есть дополнительных данных ждать не следует и читаемая сторона `Http2Stream` будет закрыта.

#### `http2stream.id`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

Числовой идентификатор потока для этого `Http2Stream`. `undefined`, если идентификатор
ещё не назначен.

#### `http2stream.pending`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если экземпляру `Http2Stream` ещё не назначен числовой идентификатор потока.

#### `http2stream.priority(options)`

<!-- YAML
added: v8.4.0
deprecated:
 - v24.2.0
 - v22.17.0
 - v20.19.6
changes:
  - version: v24.2.0
    pr-url: https://github.com/nodejs/node/pull/58293
    description: This method no longer sets the priority of the stream. Using it
                 now triggers a runtime warning.
-->

Добавлено в: v8.4.0

!!!warning "Стабильность: 0 - Устарело"

    Поддержка сигнализации приоритета объявлена устаревшей в [RFC 9113][RFC 9113]
    и больше не поддерживается в Node.js.

Пустой метод, оставлен для обратной совместимости.

#### `http2stream.rstCode`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Содержит [код ошибки][error code] `RST_STREAM`, сообщённый при уничтожении `Http2Stream`
после получения кадра `RST_STREAM` от пира, вызова `http2stream.close()` или
`http2stream.destroy()`. Будет `undefined`, если `Http2Stream` ещё не закрыт.

#### `http2stream.sentHeaders`

<!-- YAML
added: v9.5.0
-->

* Тип: [`<HTTP/2 Headers Object>`](#headers-object)

Объект с исходящими заголовками, отправленными для этого `Http2Stream`.

#### `http2stream.sentInfoHeaders`

<!-- YAML
added: v9.5.0
-->

* Тип: [`<HTTP/2 Headers Object[]>`](#headers-object)

Массив объектов с исходящими информационными (дополнительными) заголовками для этого
`Http2Stream`.

#### `http2stream.sentTrailers`

<!-- YAML
added: v9.5.0
-->

* Тип: [`<HTTP/2 Headers Object>`](#headers-object)

Объект с исходящими трейлерами, отправленными для этого `Http2Stream`.

#### `http2stream.session`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<Http2Session>`](http2.md)

Ссылка на `Http2Session`, которой принадлежит этот `Http2Stream`. После уничтожения
`Http2Stream` значение будет `undefined`.

#### `http2stream.setTimeout(msecs, callback)`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

=== "MJS"

    ```js
    import { connect, constants } from 'node:http2';
    const client = connect('http://example.org:8000');
    const { NGHTTP2_CANCEL } = constants;
    const req = client.request({ ':path': '/' });
    
    // Cancel the stream if there's no activity after 5 seconds
    req.setTimeout(5000, () => req.close(NGHTTP2_CANCEL));
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const client = http2.connect('http://example.org:8000');
    const { NGHTTP2_CANCEL } = http2.constants;
    const req = client.request({ ':path': '/' });
    
    // Cancel the stream if there's no activity after 5 seconds
    req.setTimeout(5000, () => req.close(NGHTTP2_CANCEL));
    ```

#### `http2stream.state`

<!-- YAML
added: v8.4.0
changes:
  - version: v24.2.0
    pr-url: https://github.com/nodejs/node/pull/58293
    description: The `state.weight` property is now always set to 16 and
                 `sumDependencyWeight` is always set to 0.
  - version:
      - v24.2.0
      - v22.17.0
      - v20.19.6
    pr-url: https://github.com/nodejs/node/pull/58313
    description: Following the deprecation of priority signaling as of RFC 9113,
                 `weight` and `sumDependencyWeight` options are deprecated.
-->

Добавлено в: v8.4.0

Разная информация о текущем состоянии `Http2Stream`.

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `localWindowSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт подключённый пир может отправить по этому
    `Http2Stream` без `WINDOW_UPDATE`.
  * `state` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Флаг низкоуровневого состояния `Http2Stream` по данным `nghttp2`.
  * `localClose` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `1`, если этот `Http2Stream` закрыт локально.
  * `remoteClose` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `1`, если этот `Http2Stream` закрыт
    удалённо.
  * `sumDependencyWeight` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устаревшее свойство, всегда `0`.
  * `weight` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устаревшее свойство, всегда `16`.

Текущее состояние этого `Http2Stream`.

#### `http2stream.sendTrailers(headers)`

<!-- YAML
added: v10.0.0
-->

* `headers` [`<HTTP/2 Headers Object>`](#headers-object)

Отправляет завершающий кадр `HEADERS` пиру HTTP/2. Метод сразу закрывает `Http2Stream` и
должен вызываться только после события `'wantTrailers'`. При отправке запроса или ответа
нужно задать `options.waitForTrailers`, чтобы `Http2Stream` оставался открытым после
последнего кадра `DATA` и можно было отправить трейлеры.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream) => {
      stream.respond(undefined, { waitForTrailers: true });
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ xyz: 'abc' });
      });
      stream.end('Hello World');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream) => {
      stream.respond(undefined, { waitForTrailers: true });
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ xyz: 'abc' });
      });
      stream.end('Hello World');
    });
    ```

По спецификации HTTP/1 в трейлерах не допускаются псевдозаголовки HTTP/2 (например
`':method'`, `':path'` и т.д.).

### Класс: `ClientHttp2Stream` {#class-clienthttp2stream}

<!-- YAML
added: v8.4.0
-->

* Наследует [`<Http2Stream>`](#class-http2stream)

Класс `ClientHttp2Stream` расширяет `Http2Stream` и используется только на HTTP/2-клиенте.
На клиенте экземпляры `Http2Stream` дают события вроде `'response'` и `'push'`, актуальные
только для клиента.

#### Событие: `'continue'`

<!-- YAML
added: v8.5.0
-->

Генерируется, когда сервер отправляет статус `100 Continue`, обычно из-за заголовка
`Expect: 100-continue` в запросе — сигнал клиенту отправить тело запроса.

#### Событие: `'headers'`

<!-- YAML
added: v8.4.0
-->

* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `rawHeaders` [`<HTTP/2 Raw Headers>`](#raw-headers)

Событие `'headers'` генерируется при получении дополнительного блока заголовков для потока,
например информационных `1xx`. В колбэк передаются [объект заголовков HTTP/2][HTTP/2 Headers Object], флаги
и сырые заголовки (см. [сырые заголовки HTTP/2][HTTP/2 Raw Headers]).

```js
stream.on('headers', (headers, flags) => {
  console.log(headers);
});
```

#### Событие: `'push'`

<!-- YAML
added: v8.4.0
-->

* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'push'` генерируется при получении заголовков ответа для потока Server Push.
В колбэк передаются [объект заголовков HTTP/2][HTTP/2 Headers Object] и связанные флаги.

```js
stream.on('push', (headers, flags) => {
  console.log(headers);
});
```

#### Событие: `'response'`

<!-- YAML
added: v8.4.0
-->

* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `rawHeaders` [`<HTTP/2 Raw Headers>`](#raw-headers)

Событие `'response'` генерируется при получении от подключённого HTTP/2-сервера кадра ответа
`HEADERS` для этого потока. Обработчик вызывается с тремя аргументами: объект с
[объект заголовков HTTP/2][HTTP/2 Headers Object], флаги и сырые заголовки (см. [сырые заголовки HTTP/2][HTTP/2 Raw Headers]).

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    const client = connect('https://localhost');
    const req = client.request({ ':path': '/' });
    req.on('response', (headers, flags) => {
      console.log(headers[':status']);
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const client = http2.connect('https://localhost');
    const req = client.request({ ':path': '/' });
    req.on('response', (headers, flags) => {
      console.log(headers[':status']);
    });
    ```

### Класс: `ServerHttp2Stream` {#class-serverhttp2stream}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<Http2Stream>`](#class-http2stream)

Класс `ServerHttp2Stream` расширяет [`Http2Stream`](#class-http2stream) и используется только на HTTP/2-сервере.
На сервере у экземпляров есть дополнительные методы вроде `http2stream.pushStream()` и
`http2stream.respond()`.

#### `http2stream.additionalHeaders(headers)`

<!-- YAML
added: v8.4.0
-->

* `headers` [`<HTTP/2 Headers Object>`](#headers-object)

Отправляет дополнительный информационный кадр `HEADERS` пиру HTTP/2.

#### `http2stream.headersSent`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если заголовки уже отправлены, иначе `false` (только для чтения).

#### `http2stream.pushAllowed`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство только для чтения, связанное с флагом `SETTINGS_ENABLE_PUSH` в
последнем кадре `SETTINGS`, полученном от удалённого клиента. Будет `true`, если удалённая сторона
принимает push-потоки, и `false` в противном случае. Настройки одинаковы для каждого
`Http2Stream` в одной и той же `Http2Session`.

#### `http2stream.pushStream(headers[, options], callback)`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `exclusive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true` и `parent` указывает на родительский поток,
    создаваемый поток становится единственной прямой зависимостью родителя, а все
    остальные существующие зависимые потоки становятся зависимыми от нового потока.
    **По умолчанию:** `false`.
  * `parent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Числовой идентификатор потока, от которого зависит новый поток.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после инициации push-потока.
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `pushStream` [`<ServerHttp2Stream>`](#class-serverhttp2stream) Возвращённый объект `pushStream`.
  * `headers` [`<HTTP/2 Headers Object>`](#headers-object) Объект заголовков, с которым был инициирован `pushStream`.

Инициирует push-поток. Колбэк получает новый экземпляр `Http2Stream` для push вторым
аргументом или `Error` первым аргументом.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream) => {
      stream.respond({ ':status': 200 });
      stream.pushStream({ ':path': '/' }, (err, pushStream, headers) => {
        if (err) throw err;
        pushStream.respond({ ':status': 200 });
        pushStream.end('some pushed data');
      });
      stream.end('some data');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream) => {
      stream.respond({ ':status': 200 });
      stream.pushStream({ ':path': '/' }, (err, pushStream, headers) => {
        if (err) throw err;
        pushStream.respond({ ':status': 200 });
        pushStream.end('some pushed data');
      });
      stream.end('some data');
    });
    ```

Задать вес push-потока в кадре `HEADERS` нельзя. Передайте значение `weight` в
`http2stream.priority` с опцией `silent: true`, чтобы на сервере балансировать полосу
между параллельными потоками.

Вызов `http2stream.pushStream()` изнутри уже push-потока запрещён и приведёт к ошибке.

#### `http2stream.respond([headers[, options]])`

<!-- YAML
added: v8.4.0
changes:
  - version:
    - v24.7.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59455
    description: Allow passing headers in raw array format.
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33160
    description: Allow explicitly setting date headers.
-->

Добавлено в: v8.4.0

* `headers` [`<HTTP/2 Headers Object>`](#headers-object) | [`<HTTP/2 Raw Headers>`](#raw-headers)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `endStream` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если ответ не будет содержать тело.
  * `waitForTrailers` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, после отправки последнего кадра `DATA`
    `Http2Stream` сгенерирует событие `'wantTrailers'`.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream) => {
      stream.respond({ ':status': 200 });
      stream.end('some data');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream) => {
      stream.respond({ ':status': 200 });
      stream.end('some data');
    });
    ```

Инициирует ответ. Если задана `options.waitForTrailers`, событие `'wantTrailers'`
генерируется сразу после постановки в очередь последнего фрагмента полезной нагрузки.
Тогда можно вызвать `http2stream.sendTrailers()`, чтобы отправить завершающие заголовки пиру.

При установленном `options.waitForTrailers` `Http2Stream` не закроется автоматически после
последнего кадра `DATA`. Прикладной код должен вызвать `http2stream.sendTrailers()` или
`http2stream.close()`, чтобы закрыть `Http2Stream`.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream) => {
      stream.respond({ ':status': 200 }, { waitForTrailers: true });
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ ABC: 'some value to send' });
      });
      stream.end('some data');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream) => {
      stream.respond({ ':status': 200 }, { waitForTrailers: true });
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

Добавлено в: v8.4.0

* `fd` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<FileHandle>`](#filehandle) Дескриптор файла для чтения.
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `statCheck` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `waitForTrailers` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, после отправки последнего кадра `DATA`
    `Http2Stream` сгенерирует событие `'wantTrailers'`.
  * `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение начала чтения.
  * `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт из fd отправить.

Инициирует ответ, читая данные из указанного дескриптора файла. Сам дескриптор не
проверяется. При ошибке чтения `Http2Stream` закрывается кадром `RST_STREAM` с кодом
`INTERNAL_ERROR`.

При использовании интерфейс `Duplex` у `Http2Stream` закрывается автоматически.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    import { openSync, fstatSync, closeSync } from 'node:fs';
    
    const server = createServer();
    server.on('stream', (stream) => {
      const fd = openSync('/some/file', 'r');
    
      const stat = fstatSync(fd);
      const headers = {
        'content-length': stat.size,
        'last-modified': stat.mtime.toUTCString(),
        'content-type': 'text/plain; charset=utf-8',
      };
      stream.respondWithFD(fd, headers);
      stream.on('close', () => closeSync(fd));
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const fs = require('node:fs');
    
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

Необязательная функция `options.statCheck` позволяет прикладному коду добавить заголовки
содержимого по данным `fs.Stat` для fd. Если `statCheck` задан, `http2stream.respondWithFD()`
вызовет `fs.fstat()` для этого дескриптора.

Опции `offset` и `length` ограничивают ответ диапазоном байт, например для HTTP Range.

Дескриптор файла или `FileHandle` при закрытии потока не закрывается — его нужно закрыть
вручную, когда он больше не нужен. Один и тот же дескриптор одновременно для нескольких
потоков использовать нельзя — возможна потеря данных. Повторное использование дескриптора
после завершения потока допускается.

Если задана `options.waitForTrailers`, событие `'wantTrailers'` генерируется сразу после
постановки в очередь последнего фрагмента полезной нагрузки. Затем можно вызвать
`http2stream.sendTrailers()` для завершающих заголовков.

При установленном `options.waitForTrailers` `Http2Stream` не закроется автоматически после
последнего кадра `DATA`. Прикладной код _обязан_ вызвать `http2stream.sendTrailers()` или
`http2stream.close()`, чтобы закрыть `Http2Stream`.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    import { openSync, fstatSync, closeSync } from 'node:fs';
    
    const server = createServer();
    server.on('stream', (stream) => {
      const fd = openSync('/some/file', 'r');
    
      const stat = fstatSync(fd);
      const headers = {
        'content-length': stat.size,
        'last-modified': stat.mtime.toUTCString(),
        'content-type': 'text/plain; charset=utf-8',
      };
      stream.respondWithFD(fd, headers, { waitForTrailers: true });
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ ABC: 'some value to send' });
      });
    
      stream.on('close', () => closeSync(fd));
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const fs = require('node:fs');
    
    const server = http2.createServer();
    server.on('stream', (stream) => {
      const fd = fs.openSync('/some/file', 'r');
    
      const stat = fs.fstatSync(fd);
      const headers = {
        'content-length': stat.size,
        'last-modified': stat.mtime.toUTCString(),
        'content-type': 'text/plain; charset=utf-8',
      };
      stream.respondWithFD(fd, headers, { waitForTrailers: true });
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

Добавлено в: v8.4.0

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `statCheck` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `onError` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Колбэк при ошибке до начала отправки.
  * `waitForTrailers` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, после последнего кадра `DATA`
    `Http2Stream` сгенерирует `'wantTrailers'`.
  * `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение начала чтения.
  * `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт отправить.

Отправляет обычный файл как ответ. В `path` должен быть обычный файл, иначе на объекте
`Http2Stream` будет событие `'error'`.

При использовании интерфейс `Duplex` у `Http2Stream` закрывается автоматически.

Необязательная `options.statCheck` позволяет добавить заголовки содержимого по `fs.Stat`
файла:

При ошибке чтения файла `Http2Stream` закрывается кадром `RST_STREAM` с `INTERNAL_ERROR`.
Если задан `onError`, он будет вызван; иначе поток уничтожается.

Пример с путём к файлу:

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
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
          console.error(err);
        }
        stream.end();
      }
    
      stream.respondWithFile('/some/file',
                             { 'content-type': 'text/plain; charset=utf-8' },
                             { statCheck, onError });
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
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
          console.error(err);
        }
        stream.end();
      }
    
      stream.respondWithFile('/some/file',
                             { 'content-type': 'text/plain; charset=utf-8' },
                             { statCheck, onError });
    });
    ```

Функция `options.statCheck` может отменить отправку, вернув `false`. Например, при
условном запросе по результатам `stat` можно вернуть ответ `304`:

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream) => {
      function statCheck(stat, headers) {
        // Check the stat here...
        stream.respond({ ':status': 304 });
        return false; // Cancel the send operation
      }
      stream.respondWithFile('/some/file',
                             { 'content-type': 'text/plain; charset=utf-8' },
                             { statCheck });
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream) => {
      function statCheck(stat, headers) {
        // Check the stat here...
        stream.respond({ ':status': 304 });
        return false; // Cancel the send operation
      }
      stream.respondWithFile('/some/file',
                             { 'content-type': 'text/plain; charset=utf-8' },
                             { statCheck });
    });
    ```

Заголовок `content-length` задаётся автоматически.

Опции `offset` и `length` ограничивают ответ диапазоном, например для HTTP Range.

`options.onError` обрабатывает ошибки до начала передачи файла. По умолчанию поток
уничтожается.

Если задана `options.waitForTrailers`, событие `'wantTrailers'` генерируется сразу после
постановки в очередь последнего фрагмента полезной нагрузки; затем можно вызвать
`http2stream.sendTrailers()` для завершающих заголовков.

При установленном `options.waitForTrailers` `Http2Stream` не закроется автоматически после
последнего кадра `DATA`. Нужно вызвать `http2stream.sendTrailers()` или `http2stream.close()`.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream) => {
      stream.respondWithFile('/some/file',
                             { 'content-type': 'text/plain; charset=utf-8' },
                             { waitForTrailers: true });
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ ABC: 'some value to send' });
      });
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream) => {
      stream.respondWithFile('/some/file',
                             { 'content-type': 'text/plain; charset=utf-8' },
                             { waitForTrailers: true });
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ ABC: 'some value to send' });
      });
    });
    ```

### Класс: `Http2Server` {#class-http2server}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<net.Server>`](net.md#class-netserver)

Экземпляры `Http2Server` создаются функцией `http2.createServer()`. Класс `Http2Server`
не экспортируется модулем `node:http2` напрямую.

#### Событие: `'checkContinue'`

<!-- YAML
added: v8.5.0
-->

* `request` [`<http2.Http2ServerRequest>`](http2.md)
* `response` [`<http2.Http2ServerResponse>`](http2.md)

Если зарегистрирован обработчик [`'request'`](#event-request) или в [`http2.createServer()`](#http2createserveroptions-onrequesthandler)
передан колбэк, событие `'checkContinue'` генерируется при каждом запросе с HTTP-заголовком
`Expect: 100-continue`. Если на событие не подписываются, сервер сам отвечает статусом
`100 Continue`, когда нужно.

Обработка: вызов [`response.writeContinue()`](#responsewritecontinue), если клиенту нужно продолжить тело,
или подходящий HTTP-ответ (например 400), если тело отправлять не следует.

Если событие обработано, [`'request'`](#event-request) для этого запроса не генерируется.

#### Событие: `'connection'`

<!-- YAML
added: v8.4.0
-->

* `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Генерируется при установке нового TCP-потока. `socket` обычно имеет тип [`net.Socket`](net.md#class-netsocket).
Обычно это событие не используют.

Его также можно явно сгенерировать, чтобы подставить соединение в HTTP-сервер; тогда
можно передать любой поток [`Duplex`](stream.md#class-streamduplex).

#### Событие: `'request'`

<!-- YAML
added: v8.4.0
-->

* `request` [`<http2.Http2ServerRequest>`](http2.md)
* `response` [`<http2.Http2ServerResponse>`](http2.md)

Генерируется при каждом запросе. В одной сессии может быть несколько запросов. См. [API совместимости][Compatibility API].

#### Событие: `'session'`

<!-- YAML
added: v8.4.0
-->

* `session` [`<ServerHttp2Session>`](http2.md)

Событие `'session'` генерируется при создании новой `Http2Session` объектом `Http2Server`.

#### Событие: `'sessionError'`

<!-- YAML
added: v8.4.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
* `session` [`<ServerHttp2Session>`](http2.md)

Событие `'sessionError'` генерируется при событии `'error'` у `Http2Session`, связанной с `Http2Server`.

#### Событие: `'stream'`

<!-- YAML
added: v8.4.0
-->

* `stream` [`<Http2Stream>`](#class-http2stream) Ссылка на поток
* `headers` [`<HTTP/2 Headers Object>`](#headers-object) Объект заголовков
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Связанные числовые флаги
* `rawHeaders` [`<HTTP/2 Raw Headers>`](#raw-headers) Массив сырых заголовков

Событие `'stream'` генерируется, когда оно же пришло от `Http2Session`, связанной с сервером.

См. также [событие `'stream'` у `Http2Session`][`Http2Session`'s `'stream'` event].

=== "MJS"

    ```js
    import { createServer, constants } from 'node:http2';
    const {
      HTTP2_HEADER_METHOD,
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS,
      HTTP2_HEADER_CONTENT_TYPE,
    } = constants;
    
    const server = createServer();
    server.on('stream', (stream, headers, flags) => {
      const method = headers[HTTP2_HEADER_METHOD];
      const path = headers[HTTP2_HEADER_PATH];
      // ...
      stream.respond({
        [HTTP2_HEADER_STATUS]: 200,
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8',
      });
      stream.write('hello ');
      stream.end('world');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
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
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8',
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

Добавлено в: v8.4.0

Событие `'timeout'` генерируется при отсутствии активности на сервере в течение числа
миллисекунд, заданного `http2server.setTimeout()`.
**По умолчанию:** 0 (таймаут отключён)

#### `server.close([callback])`

<!-- YAML
added: v8.4.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Останавливает приём новых сессий. Из-за долгоживущих сессий HTTP/2 это не мешает создавать
новые потоки запросов в уже открытых сессиях. Для корректного завершения вызовите
[`http2session.close()`](#http2sessionclosecallback) у всех активных сессий.

Если передан `callback`, он вызывается только после закрытия всех активных сессий, хотя
новые сессии сервер уже не принимает. Подробнее см. [`net.Server.close()`](net.md#serverclosecallback).

#### `server[Symbol.asyncDispose]()`

<!-- YAML
added: v20.4.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

Добавлено в: v20.4.0

Вызывает [`server.close()`](#serverclosecallback) и возвращает промис, который выполняется после закрытия сервера.

#### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

Добавлено в: v8.4.0

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** 0 (без таймаута)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<Http2Server>`](http2.md)

Задаёт таймаут для запросов HTTP/2-сервера и колбэк при отсутствии активности на
`Http2Server` дольше `msecs` мс.

Колбэк регистрируется как слушатель `'timeout'`.

Если `callback` не функция, выбрасывается `ERR_INVALID_ARG_TYPE`.

#### `server.timeout`

<!-- YAML
added: v8.4.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

Добавлено в: v8.4.0

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** 0 (без таймаута)

Количество миллисекунд бездействия, после которых считается, что у сокета истёк таймаут.

Значение `0` отключает поведение таймаута для входящих соединений.

Логика таймаута сокета настраивается при установке соединения, поэтому изменение
значения влияет только на новые подключения, не на уже существующие.

#### `server.updateSettings([settings])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

* `settings` [`<HTTP/2 Settings Object>`](#settings-object)

Обновляет сервер переданными настройками.

Выбрасывает `ERR_HTTP2_INVALID_SETTING_VALUE` при недопустимых значениях `settings`.

Выбрасывает `ERR_INVALID_ARG_TYPE` при недопустимом аргументе `settings`.

### Класс: `Http2SecureServer` {#class-http2secureserver}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<tls.Server>`](#class-tlsserver)

Экземпляры `Http2SecureServer` создаются функцией `http2.createSecureServer()`. Класс
`Http2SecureServer` не экспортируется модулем `node:http2` напрямую.

#### Событие: `'checkContinue'`

<!-- YAML
added: v8.5.0
-->

* `request` [`<http2.Http2ServerRequest>`](http2.md)
* `response` [`<http2.Http2ServerResponse>`](http2.md)

Если зарегистрирован обработчик [`'request'`](#event-request) или в [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler)
передан колбэк, событие `'checkContinue'` генерируется при каждом запросе с `Expect: 100-continue`.
Если на событие не подписываются, сервер сам отвечает `100 Continue`, когда нужно.

Обработка: [`response.writeContinue()`](#responsewritecontinue) или подходящий ответ (например 400).

Если событие обработано, [`'request'`](#event-request) для этого запроса не генерируется.

#### Событие: `'connection'`

<!-- YAML
added: v8.4.0
-->

* `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Генерируется при установке нового TCP-потока до начала TLS handshake. `socket` обычно
[`net.Socket`](net.md#class-netsocket). Обычно обращаются к событию редко.

Его можно явно сгенерировать для подстановки соединения; допускается любой [`Duplex`](stream.md#class-streamduplex).

#### Событие: `'request'`

<!-- YAML
added: v8.4.0
-->

* `request` [`<http2.Http2ServerRequest>`](http2.md)
* `response` [`<http2.Http2ServerResponse>`](http2.md)

Генерируется при каждом запросе. В сессии может быть несколько запросов. См. [API совместимости][Compatibility API].

#### Событие: `'session'`

<!-- YAML
added: v8.4.0
-->

* `session` [`<ServerHttp2Session>`](http2.md)

Событие `'session'` при создании новой `Http2Session` объектом `Http2SecureServer`.

#### Событие: `'sessionError'`

<!-- YAML
added: v8.4.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
* `session` [`<ServerHttp2Session>`](http2.md)

Событие `'sessionError'` при `'error'` у `Http2Session`, связанной с `Http2SecureServer`.

#### Событие: `'stream'`

<!-- YAML
added: v8.4.0
-->

* `stream` [`<Http2Stream>`](#class-http2stream) Ссылка на поток
* `headers` [`<HTTP/2 Headers Object>`](#headers-object) Объект заголовков
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Связанные числовые флаги
* `rawHeaders` [`<HTTP/2 Raw Headers>`](#raw-headers) Массив сырых заголовков

Событие `'stream'` при `'stream'` от `Http2Session`, связанной с сервером.

См. также [событие `'stream'` у `Http2Session`][`Http2Session`'s `'stream'` event].

=== "MJS"

    ```js
    import { createSecureServer, constants } from 'node:http2';
    const {
      HTTP2_HEADER_METHOD,
      HTTP2_HEADER_PATH,
      HTTP2_HEADER_STATUS,
      HTTP2_HEADER_CONTENT_TYPE,
    } = constants;
    
    const options = getOptionsSomehow();
    
    const server = createSecureServer(options);
    server.on('stream', (stream, headers, flags) => {
      const method = headers[HTTP2_HEADER_METHOD];
      const path = headers[HTTP2_HEADER_PATH];
      // ...
      stream.respond({
        [HTTP2_HEADER_STATUS]: 200,
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8',
      });
      stream.write('hello ');
      stream.end('world');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
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
        [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8',
      });
      stream.write('hello ');
      stream.end('world');
    });
    ```

#### Событие: `'timeout'`

<!-- YAML
added: v8.4.0
-->

Событие `'timeout'` генерируется при отсутствии активности на сервере в течение числа
миллисекунд, заданного `http2secureServer.setTimeout()`.
**По умолчанию:** 2 минуты.

#### Событие: `'unknownProtocol'`

<!-- YAML
added: v8.4.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44031
    description: This event will only be emitted if the client did not transmit
                 an ALPN extension during the TLS handshake.
-->

Добавлено в: v8.4.0

* `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Событие `'unknownProtocol'` генерируется, если подключающийся клиент не согласовал
допустимый протокол (HTTP/2 или HTTP/1.1). Обработчик получает сокет. Если слушателя нет,
соединение разрывается. Таймаут задаётся опцией `'unknownProtocolTimeout'` в [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler).

В старых версиях Node.js событие возникало при `allowHTTP1` равном `false`, если при TLS
клиент не отправлял расширение ALPN или отправлял ALPN без HTTP/2 (`h2`). В новых версиях
оно генерируется только при `allowHTTP1` равном `false` и отсутствии расширения ALPN. Если
клиент отправляет ALPN без HTTP/2 (или без HTTP/1.1 при `allowHTTP1` равном `true`), TLS
handshake завершается ошибкой, защищённое соединение не устанавливается.

См. [API совместимости][Compatibility API].

#### `server.close([callback])`

<!-- YAML
added: v8.4.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Останавливает приём новых сессий; см. описание для `Http2Server`. Для корректного завершения
закройте активные сессии через [`http2session.close()`](#http2sessionclosecallback).

Если передан `callback`, он вызывается после закрытия всех активных сессий. Подробнее
[`tls.Server.close()`](tls.md#serverclosecallback).

#### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `120000` (2 minutes)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<Http2SecureServer>`](http2.md)

Задаёт таймаут для запросов защищённого HTTP/2-сервера и колбэк при отсутствии активности на
`Http2SecureServer` дольше `msecs` мс.

Колбэк регистрируется как слушатель `'timeout'`.

Если `callback` не функция, выбрасывается `ERR_INVALID_ARG_TYPE`.

#### `server.timeout`

<!-- YAML
added: v8.4.0
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

Добавлено в: v8.4.0

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** 0 (без таймаута)

Количество миллисекунд бездействия, после которых считается, что у сокета истёк таймаут.

Значение `0` отключает поведение таймаута для входящих соединений.

Логика таймаута сокета настраивается при подключении, изменение влияет только на новые соединения.

#### `server.updateSettings([settings])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
-->

* `settings` [`<HTTP/2 Settings Object>`](#settings-object)

Обновляет сервер переданными настройками.

Выбрасывает `ERR_HTTP2_INVALID_SETTING_VALUE` при недопустимых значениях `settings`.

Выбрасывает `ERR_INVALID_ARG_TYPE` при недопустимом аргументе `settings`.

### `http2.createServer([options][, onRequestHandler])`

<!-- YAML
added: v8.4.0
changes:
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/59917
    description: Added the `strictSingleValueFields` option.
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/61713
    description: Added `http1Options` option. The `Http1IncomingMessage`
                 and `Http1ServerResponse` options are now deprecated.
  - version:
      - v23.0.0
      - v22.10.0
    pr-url: https://github.com/nodejs/node/pull/54875
    description: Added `streamResetBurst` and `streamResetRate`.
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

Добавлено в: v8.4.0

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `maxDeflateDynamicTableSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер динамической таблицы для
    сжатия заголовков. **По умолчанию:** `4Kib`.
  * `maxSettings` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум записей настроек в одном кадре
    `SETTINGS`. Минимум `1`. **По умолчанию:** `32`.
  * `maxSessionMemory`[`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум памяти для `Http2Session` в мегабайтах
    (`1` — 1 МБ). Минимум `1`. Лимит кредитный: существующие `Http2Stream` могут его превысить,
    новые при превышении отклоняются. Учитываются число потоков, память таблиц сжатия заголовков,
    данные в очереди на отправку и неподтверждённые `PING` и `SETTINGS`. **По умолчанию:** `10`.
  * `maxHeaderListPairs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум пар заголовков. Аналогично
    [`server.maxHeadersCount`](http.md#servermaxheaderscount) или [`request.maxHeadersCount`](http.md#requestmaxheaderscount) в `node:http`. Минимум
    `4`. **По умолчанию:** `128`.
  * `maxOutstandingPings` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум неподтверждённых пингов. **По умолчанию:** `10`.
  * `maxSendHeaderBlockLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер сериализованного сжатого блока
    заголовков. Превышение — событие `'frameError'` и закрытие потока.
    На весь блок действует этот лимит; у `nghttp2` на каждую распакованную пару ключ/значение — не более `65536`.
  * `paddingStrategy` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Стратегия дополнения для кадров `HEADERS` и `DATA`. **По умолчанию:**
    `http2.constants.PADDING_STRATEGY_NONE`. Возможные значения:
    * `http2.constants.PADDING_STRATEGY_NONE`: без дополнения.
    * `http2.constants.PADDING_STRATEGY_MAX`: максимально допустимое дополнение по реализации.
    * `http2.constants.PADDING_STRATEGY_ALIGNED`: подобрать дополнение так, чтобы длина кадра с 9-байтовым заголовком была кратна 8. Для каждого кадра есть максимум байт дополнения по состоянию flow control и настройкам; если он меньше расчётного для выравнивания, используется максимум, итоговая длина может быть не кратна 8.
  * `peerMaxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум одновременных потоков удалённого пира, как
    после кадра `SETTINGS`. Переопределяется, если пир задаёт свой `maxConcurrentStreams`. **По умолчанию:** `100`.
  * `maxSessionInvalidFrames` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько неверных кадров терпеть до закрытия сессии.
    **По умолчанию:** `1000`.
  * `maxSessionRejectedStreams` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько отклонённых при создании потоков терпеть до закрытия сессии.
    Каждое отклонение с `NGHTTP2_ENHANCE_YOUR_CALM` — сигнал пиру не открывать новые потоки; продолжение считается некорректным поведением.
    **По умолчанию:** `100`.
  * `settings` [`<HTTP/2 Settings Object>`](#settings-object) Начальные настройки для отправки пиру при соединении.
  * `streamResetBurst` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) и `streamResetRate` [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ограничение частоты
    сбросов входящих потоков (кадр RST\_STREAM). Оба параметра нужны; по умолчанию 1000 и 33.
  * `remoteCustomSettings` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив целых — типы настроек в свойстве `CustomSettings`
    у принимаемых `remoteSettings`. Подробнее см. `CustomSettings` у объекта `Http2Settings`.
  * `Http1IncomingMessage` [`<http.IncomingMessage>`](#httpincomingmessage) Класс `IncomingMessage` для отката на HTTP/1. Для расширения базового
    `http.IncomingMessage`. **По умолчанию:** `http.IncomingMessage`.
    **Устарело.** Используйте `http1Options.IncomingMessage`. См. [DEP0202][DEP0202].
  * `Http1ServerResponse` [`<http.ServerResponse>`](#httpserverresponse) Класс `ServerResponse` для отката на HTTP/1.
    **По умолчанию:** `http.ServerResponse`.
    **Устарело.** Используйте `http1Options.ServerResponse`. См. [DEP0202][DEP0202].
  * `http1Options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Опции отката на HTTP/1 при `allowHTTP1` равном `true`; передаются
    нижележащему HTTP/1-серверу. См. [`http.createServer()`](http.md#httpcreateserveroptions-requestlistener). В том числе:
    * `IncomingMessage` [`<http.IncomingMessage>`](#httpincomingmessage) Класс `IncomingMessage` для отката.
      **По умолчанию:** `http.IncomingMessage`.
    * `ServerResponse` [`<http.ServerResponse>`](#httpserverresponse) Класс `ServerResponse` для отката.
      **По умолчанию:** `http.ServerResponse`.
    * `keepAliveTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды простоя без входящих данных после отправки
      последнего ответа до уничтожения сокета.
      **По умолчанию:** `5000`.
  * `Http2ServerRequest` [`<http2.Http2ServerRequest>`](http2.md) Класс `Http2ServerRequest` для использования.
    Для расширения базового `Http2ServerRequest`.
    **По умолчанию:** `Http2ServerRequest`.
  * `Http2ServerResponse` [`<http2.Http2ServerResponse>`](http2.md) Класс `Http2ServerResponse` для использования.
    **По умолчанию:** `Http2ServerResponse`.
  * `unknownProtocolTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в мс ожидания после события [`'unknownProtocol'`](#event-unknownprotocol);
    если сокет к этому моменту не уничтожен, сервер уничтожит его.
    **По умолчанию:** `10000`.
  * `strictFieldWhitespaceValidation` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` — строгая проверка пробелов в начале и конце
    имён и значений полей заголовков HTTP/2 по [RFC-9113](https://www.rfc-editor.org/rfc/rfc9113.html#section-8.2.1).
    **По умолчанию:** `true`.
  * `strictSingleValueFields` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` — строгая проверка заголовков и трейлеров,
    которые по определению однозначны; при нескольких значениях — ошибка.
    **По умолчанию:** `true`.
  * `...options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любые опции [`net.createServer()`](net.md#netcreateserveroptions-connectionlistener).
* `onRequestHandler` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) См. [API совместимости][Compatibility API]
* Возвращает: [`<Http2Server>`](http2.md)

Возвращает экземпляр `net.Server`, который создаёт и управляет `Http2Session`.

Известных браузеров с поддержкой [незашифрованного HTTP/2][HTTP/2 Unencrypted] нет, поэтому для
обмена с браузерами нужен [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler).

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    
    // Create an unencrypted HTTP/2 server.
    // Since there are no browsers known that support
    // unencrypted HTTP/2, the use of `createSecureServer()`
    // is necessary when communicating with browser clients.
    const server = createServer();
    
    server.on('stream', (stream, headers) => {
      stream.respond({
        'content-type': 'text/html; charset=utf-8',
        ':status': 200,
      });
      stream.end('<h1>Hello World</h1>');
    });
    
    server.listen(8000);
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
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
    
    server.listen(8000);
    ```

### `http2.createSecureServer(options[, onRequestHandler])`

<!-- YAML
added: v8.4.0
changes:
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/59917
    description: Added the `strictSingleValueFields` option.
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/61713
    description: Added `http1Options` option.
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

Добавлено в: v8.4.0

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `allowHTTP1` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Входящие клиенты без HTTP/2 переводятся на HTTP/1.x при `true`.
    См. [`'unknownProtocol'`](#event-unknownprotocol) и [согласование ALPN][ALPN negotiation].
    **По умолчанию:** `false`.
  * `maxDeflateDynamicTableSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. описание у `http2.createServer()`. **По умолчанию:** `4Kib`.
  * `maxSettings` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `32`.
  * `maxSessionMemory`[`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `10`.
  * `maxHeaderListPairs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `128`.
  * `maxOutstandingPings` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `10`.
  * `maxSendHeaderBlockLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
  * `paddingStrategy` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:**
    `http2.constants.PADDING_STRATEGY_NONE`. Варианты:
    * `http2.constants.PADDING_STRATEGY_NONE`: без дополнения.
    * `http2.constants.PADDING_STRATEGY_MAX`: максимум дополнения по реализации.
    * `http2.constants.PADDING_STRATEGY_ALIGNED`: выравнивание длины кадра (см. `http2.createServer()`).
  * `peerMaxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `100`.
  * `maxSessionInvalidFrames` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
    **По умолчанию:** `1000`.
  * `maxSessionRejectedStreams` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
    **По умолчанию:** `100`.
  * `settings` [`<HTTP/2 Settings Object>`](#settings-object) Начальные настройки пиру при соединении.
  * `streamResetBurst` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) и `streamResetRate` [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
  * `remoteCustomSettings` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) См. `http2.createServer()`.
  * `...options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любые опции [`tls.createServer()`](tls.md#tlscreateserveroptions-secureconnectionlistener); для сервера обычно нужны `pfx` или `key`/`cert`.
  * `origins` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив origin для кадра `ORIGIN` сразу после создания серверной `Http2Session`.
  * `unknownProtocolTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
    **По умолчанию:** `10000`.
  * `strictFieldWhitespaceValidation` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) См. `http2.createServer()`.
    **По умолчанию:** `true`.
  * `strictSingleValueFields` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) См. `http2.createServer()`.
    **По умолчанию:** `true`.
  * `http1Options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. `http2.createServer()`.
    * `IncomingMessage` [`<http.IncomingMessage>`](#httpincomingmessage) Класс для отката HTTP/1.
      **По умолчанию:** `http.IncomingMessage`.
    * `ServerResponse` [`<http.ServerResponse>`](#httpserverresponse) Класс для отката HTTP/1.
      **По умолчанию:** `http.ServerResponse`.
    * `keepAliveTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
      **По умолчанию:** `5000`.
* `onRequestHandler` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) См. [API совместимости][Compatibility API]
* Возвращает: [`<Http2SecureServer>`](http2.md)

Возвращает экземпляр `tls.Server`, который создаёт и управляет `Http2Session`.

=== "MJS"

    ```js
    import { createSecureServer } from 'node:http2';
    import { readFileSync } from 'node:fs';
    
    const options = {
      key: readFileSync('server-key.pem'),
      cert: readFileSync('server-cert.pem'),
    };
    
    // Create a secure HTTP/2 server
    const server = createSecureServer(options);
    
    server.on('stream', (stream, headers) => {
      stream.respond({
        'content-type': 'text/html; charset=utf-8',
        ':status': 200,
      });
      stream.end('<h1>Hello World</h1>');
    });
    
    server.listen(8443);
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const fs = require('node:fs');
    
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
    
    server.listen(8443);
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

Добавлено в: v8.4.0

* `authority` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Удалённый HTTP/2-сервер: минимальный корректный URL с префиксом
  `http://` или `https://`, хостом и портом (если не стандартный). Части userinfo, path, query и fragment
  игнорируются.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `maxDeflateDynamicTableSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `4Kib`.
  * `maxSettings` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `32`.
  * `maxSessionMemory`[`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `10`.
  * `maxHeaderListPairs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`; минимум `1`. **По умолчанию:** `128`.
  * `maxOutstandingPings` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `10`.
  * `maxReservedRemoteStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум зарезервированных push-потоков, которые клиент примет одновременно.
    При превышении новые push от сервера отклоняются. Минимум 0, максимум 2<sup>32</sup>−1; отрицательное значение — как максимум.
    **По умолчанию:** `200`.
  * `maxSendHeaderBlockLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
  * `paddingStrategy` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:**
    `http2.constants.PADDING_STRATEGY_NONE`. Варианты:
    * `http2.constants.PADDING_STRATEGY_NONE`: без дополнения.
    * `http2.constants.PADDING_STRATEGY_MAX`: максимум дополнения.
    * `http2.constants.PADDING_STRATEGY_ALIGNED`: выравнивание длины кадра (см. `http2.createServer()`).
  * `peerMaxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`. **По умолчанию:** `100`.
  * `protocol` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Протокол подключения, если не задан в `authority`: `'http:'` или `'https:'`. **По умолчанию:**
    `'https:'`
  * `settings` [`<HTTP/2 Settings Object>`](#settings-object) Начальные настройки пиру при соединении.
  * `remoteCustomSettings` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) См. `http2.createServer()`.
  * `createConnection` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательный колбэк: получает `URL` из `connect` и `options`, возвращает
    [`Duplex`](stream.md#class-streamduplex) для соединения этой сессии.
  * `...options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любые опции [`net.connect()`](net.md#netconnect) или [`tls.connect()`](tls.md#tlsconnectoptions-callback).
  * `unknownProtocolTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) См. `http2.createServer()`.
    **По умолчанию:** `10000`.
  * `strictFieldWhitespaceValidation` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) См. `http2.createServer()`.
    **По умолчанию:** `true`.
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Однократный слушатель события [`'connect'`](#event-connect).
* Возвращает: [`<ClientHttp2Session>`](http2.md)

Возвращает экземпляр `ClientHttp2Session`.

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    const client = connect('https://localhost:1234');
    
    /* Use the client */
    
    client.close();
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const client = http2.connect('https://localhost:1234');
    
    /* Use the client */
    
    client.close();
    ```

### `http2.constants`

<!-- YAML
added: v8.4.0
-->

#### Коды ошибок для `RST_STREAM` и `GOAWAY`

| Значение | Имя                         | Константа                                     |
| -------- | --------------------------- | --------------------------------------------- |
| `0x00`   | Нет ошибки                  | `http2.constants.NGHTTP2_NO_ERROR`            |
| `0x01`   | Ошибка протокола            | `http2.constants.NGHTTP2_PROTOCOL_ERROR`      |
| `0x02`   | Внутренняя ошибка           | `http2.constants.NGHTTP2_INTERNAL_ERROR`      |
| `0x03`   | Ошибка управления потоком   | `http2.constants.NGHTTP2_FLOW_CONTROL_ERROR`  |
| `0x04`   | Тайм-аут настроек           | `http2.constants.NGHTTP2_SETTINGS_TIMEOUT`    |
| `0x05`   | Поток закрыт                | `http2.constants.NGHTTP2_STREAM_CLOSED`       |
| `0x06`   | Ошибка размера кадра        | `http2.constants.NGHTTP2_FRAME_SIZE_ERROR`    |
| `0x07`   | Поток отклонён              | `http2.constants.NGHTTP2_REFUSED_STREAM`      |
| `0x08`   | Отмена                      | `http2.constants.NGHTTP2_CANCEL`              |
| `0x09`   | Ошибка сжатия               | `http2.constants.NGHTTP2_COMPRESSION_ERROR`   |
| `0x0a`   | Ошибка CONNECT              | `http2.constants.NGHTTP2_CONNECT_ERROR`       |
| `0x0b`   | Не нагнетайте               | `http2.constants.NGHTTP2_ENHANCE_YOUR_CALM`   |
| `0x0c`   | Недостаточная безопасность  | `http2.constants.NGHTTP2_INADEQUATE_SECURITY` |
| `0x0d`   | Требуется HTTP/1.1          | `http2.constants.NGHTTP2_HTTP_1_1_REQUIRED`   |

### `http2.getDefaultSettings()`

<!-- YAML
added: v8.4.0
-->

* Возвращает: [`<HTTP/2 Settings Object>`](#settings-object)

Возвращает объект с настройками по умолчанию для `Http2Session`. При каждом вызове
создаётся новый объект, его можно безопасно изменять.

### `http2.getPackedSettings([settings])`

<!-- YAML
added: v8.4.0
-->

* `settings` [`<HTTP/2 Settings Object>`](#settings-object)
* Возвращает: [`<Buffer>`](buffer.md#buffer)

Возвращает `Buffer` с сериализованным представлением переданных настроек HTTP/2 по
[спецификации HTTP/2][HTTP/2]. Предназначено для поля заголовка `HTTP2-Settings`.

=== "MJS"

    ```js
    import { getPackedSettings } from 'node:http2';
    
    const packed = getPackedSettings({ enablePush: false });
    
    console.log(packed.toString('base64'));
    // Prints: AAIAAAAA
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
    const packed = http2.getPackedSettings({ enablePush: false });
    
    console.log(packed.toString('base64'));
    // Prints: AAIAAAAA
    ```

### `http2.getUnpackedSettings(buf)`

<!-- YAML
added: v8.4.0
-->

* `buf` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) Упакованные настройки.
* Возвращает: [`<HTTP/2 Settings Object>`](#settings-object)

Возвращает [объект настроек HTTP/2][HTTP/2 Settings Object] с разобранными настройками из `Buffer`,
как у `http2.getPackedSettings()`.

### `http2.performServerHandshake(socket[, options])`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любые опции [`http2.createServer()`](#http2createserveroptions-onrequesthandler).
* Возвращает: [`<ServerHttp2Session>`](http2.md)

Создаёт серверную сессию HTTP/2 из уже имеющегося сокета.

### `http2.sensitiveHeaders`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

* Тип: [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)

Этот символ можно задать свойством объекта заголовков HTTP/2 со значением-массивом —
список имён заголовков, считающихся чувствительными.
Подробнее см. [чувствительные заголовки][Sensitive headers].

### Объект заголовков {#headers-object}

Заголовки задаются собственными свойствами объектов JavaScript. Ключи при сериализации
приводятся к нижнему регистру. Значения — строки (иначе приводятся к строкам) или массив
строк (несколько значений одного поля).

```js
const headers = {
  ':status': '200',
  'content-type': 'text-plain',
  'ABC': ['has', 'more', 'than', 'one', 'value'],
};

stream.respond(headers);
```

Объекты заголовков, передаваемые в колбэки, имеют прототип `null`, поэтому обычные методы
вроде `Object.prototype.toString()` и `Object.prototype.hasOwnProperty()` недоступны.

Для входящих заголовков:

* `:status` приводится к числу (`number`).
* Дубликаты `:status`, `:method`, `:authority`, `:scheme`, `:path`,
  `:protocol`, `age`, `authorization`, `access-control-allow-credentials`,
  `access-control-max-age`, `access-control-request-method`, `content-encoding`,
  `content-language`, `content-length`, `content-location`, `content-md5`,
  `content-range`, `content-type`, `date`, `dnt`, `etag`, `expires`, `from`,
  `host`, `if-match`, `if-modified-since`, `if-none-match`, `if-range`,
  `if-unmodified-since`, `last-modified`, `location`, `max-forwards`,
  `proxy-authorization`, `range`, `referer`,`retry-after`, `tk`,
  `upgrade-insecure-requests`, `user-agent` и `x-content-type-options` отбрасываются.
* `set-cookie` всегда массив; дубликаты добавляются в массив.
* При нескольких `cookie` значения объединяются через `'; '`.
* Для остальных заголовков значения объединяются через `', '`.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer();
    server.on('stream', (stream, headers) => {
      console.log(headers[':path']);
      console.log(headers.ABC);
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer();
    server.on('stream', (stream, headers) => {
      console.log(headers[':path']);
      console.log(headers.ABC);
    });
    ```

#### Сырые заголовки {#raw-headers}

В некоторых API заголовки можно передавать или получать плоским массивом, сохраняя порядок
и дубликаты ключей, как в сырой передаче.

Ключи и значения идут в одном списке, это _не_ список пар: чётные индексы — ключи,
нечётные — значения. Дубликаты не сливаются, каждая пара ключ–значение отдельно.

Удобно для прокси с точной пересылкой заголовков или при оптимизации, если заголовки уже в сыром виде.

```js
const rawHeaders = [
  ':status',
  '404',
  'content-type',
  'text/plain',
];

stream.respond(rawHeaders);
```

#### Чувствительные заголовки {#sensitive-headers}

Заголовки HTTP/2 можно пометить как чувствительные: тогда алгоритм сжатия заголовков никогда
не индексирует их. Так поступают для значений с низкой энтропией, которые ценны для атакующего,
например `Cookie` или `Authorization`. Добавьте имена заголовков в свойство `[http2.sensitiveHeaders]`
как массив:

```js
const headers = {
  ':status': '200',
  'content-type': 'text-plain',
  'cookie': 'some-cookie',
  'other-sensitive-header': 'very secret data',
  [http2.sensitiveHeaders]: ['cookie', 'other-sensitive-header'],
};

stream.respond(headers);
```

Для некоторых заголовков, например `Authorization` и коротких `Cookie`, флаг
выставляется автоматически.

У принимаемых заголовков свойство тоже задаётся: в нём имена всех заголовков,
помеченных как чувствительные, в том числе автоматически.

Для сырых заголовков свойство задаётся на массиве, например
`rawHeadersArray[http2.sensitiveHeaders] = ['cookie']`, а не отдельной парой ключ–значение
внутри массива.

### Объект настроек {#settings-object}

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

Добавлено в: v8.4.0

API `http2.getDefaultSettings()`, `http2.getPackedSettings()`,
`http2.createServer()`, `http2.createSecureServer()`,
`http2session.settings()`, `http2session.localSettings` и
`http2session.remoteSettings` возвращают или принимают объект настроек для `Http2Session`.
Это обычные объекты JavaScript со следующими свойствами.

* `headerTableSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт для сжатия заголовков. Минимум 0, максимум
  2<sup>32</sup>−1. **По умолчанию:** `4096`.
* `enablePush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если на `Http2Session` разрешены push-потоки HTTP/2.
  **По умолчанию:** `true`.
* `initialWindowSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Начальный размер окна _отправителя_ в байтах для
  потокового управления потоком. Минимум 0, максимум 2<sup>32</sup>−1. **По умолчанию:** `65535`.
* `maxFrameSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер полезной нагрузки кадра в байтах. Минимум
  16384, максимум 2<sup>24</sup>−1. **По умолчанию:** `16384`.
* `maxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум одновременных потоков на `Http2Session`.
  Значения по умолчанию нет в смысле «не задано»; теоретически до 2<sup>32</sup>−1 потоков.
  Минимум 0, максимум 2<sup>32</sup>−1. **По умолчанию:**
  `4294967295`.
* `maxHeaderListSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер списка заголовков (несжатые октеты).
  Минимум 0, максимум 2<sup>32</sup>−1. **По умолчанию:** `65535`.
* `maxHeaderSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Синоним `maxHeaderListSize`.
* `enableConnectProtocol`[`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если включается «Extended Connect Protocol» по
  [RFC 8441][RFC 8441]. Имеет смысл только от сервера. После включения `enableConnectProtocol`
  для `Http2Session` отключить его нельзя.
  **По умолчанию:** `false`.
* `customSettings` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные типы настроек, пока не реализованные в Node и
  нижележащих библиотеках. Ключ — числовой тип настройки из реестра «HTTP/2 SETTINGS»
  ([RFC 7540]), значение — число настройки.
  Тип должен быть целым от 1 до 2^16−1, лучше больше 6 (уже заняты нативные типы), но
  ошибкой это не считается.
  Значения — беззнаковые целые от 0 до 2^32−1. Поддерживается не более 10 пользовательских
  настроек.
  Работает при отправке `SETTINGS` или при приёме типов из `remoteCustomSettings` у сервера
  или клиента. Не смешивайте `customSettings` для id с нативными настройками, если в будущей
  версии Node этот тип начнёт обрабатываться нативно.

Любые прочие свойства объекта настроек игнорируются.

### Обработка ошибок

При использовании `node:http2` возможны разные ошибки:

Ошибки проверки — при неверном аргументе, опции или значении настройки. Всегда
синхронный `throw`.

Ошибки состояния — действие в неподходящий момент (например отправка данных после закрытия
потока). Сообщаются синхронным `throw` или событием `'error'` на `Http2Stream`, `Http2Session`
или HTTP/2-сервере в зависимости от места и момента.

Внутренние ошибки — неожиданный сбой сессии HTTP/2. Сообщаются событием `'error'` на
`Http2Session` или HTTP/2-сервере.

Ошибки протокола — нарушение ограничений HTTP/2. Сообщаются `throw` или `'error'` на
`Http2Stream`, `Http2Session` или HTTP/2-сервере.

### Обработка недопустимых символов в именах и значениях заголовков

Реализация HTTP/2 строже относится к недопустимым символам в именах и значениях заголовков,
чем HTTP/1.

Имена полей _без учёта регистра_; по сети передаются в нижнем регистре. В API Node.js можно
задать смешанный регистр (`Content-Type`), при передаче будет `content-type`.

В имени поля _допускаются только_ символы ASCII: `a`–`z`, `A`–`Z`, `0`–`9`, `!`, `#`, `$`,
`%`, `&`, `'`, `*`, `+`, `-`, `.`, `^`, `_`, `` ` ``, `|`, `~`.

Недопустимые символы в имени приводят к закрытию потока с ошибкой протокола.

Значения допускают больше свободы, но _не должны_ содержать перевод строки или возврат каретки
и _должны_ укладываться в US-ASCII по требованиям HTTP.

### Push-потоки на клиенте

Чтобы принимать push-потоки на клиенте, подпишитесь на событие `'stream'` у `ClientHttp2Session`:

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    
    const client = connect('http://localhost');
    
    client.on('stream', (pushedStream, requestHeaders) => {
      pushedStream.on('push', (responseHeaders) => {
        // Process response headers
      });
      pushedStream.on('data', (chunk) => { /* handle pushed data */ });
    });
    
    const req = client.request({ ':path': '/' });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
    const client = http2.connect('http://localhost');
    
    client.on('stream', (pushedStream, requestHeaders) => {
      pushedStream.on('push', (responseHeaders) => {
        // Process response headers
      });
      pushedStream.on('data', (chunk) => { /* handle pushed data */ });
    });
    
    const req = client.request({ ':path': '/' });
    ```

### Поддержка метода `CONNECT` {#supporting-the-connect-method}

Метод `CONNECT` позволяет использовать HTTP/2-сервер как прокси для TCP/IP-соединений.

Простой TCP-сервер:

=== "MJS"

    ```js
    import { createServer } from 'node:net';
    
    const server = createServer((socket) => {
      let name = '';
      socket.setEncoding('utf8');
      socket.on('data', (chunk) => name += chunk);
      socket.on('end', () => socket.end(`hello ${name}`));
    });
    
    server.listen(8000);
    ```

=== "CJS"

    ```js
    const net = require('node:net');
    
    const server = net.createServer((socket) => {
      let name = '';
      socket.setEncoding('utf8');
      socket.on('data', (chunk) => name += chunk);
      socket.on('end', () => socket.end(`hello ${name}`));
    });
    
    server.listen(8000);
    ```

HTTP/2 CONNECT-прокси:

=== "MJS"

    ```js
    import { createServer, constants } from 'node:http2';
    const { NGHTTP2_REFUSED_STREAM, NGHTTP2_CONNECT_ERROR } = constants;
    import { connect } from 'node:net';
    
    const proxy = createServer();
    proxy.on('stream', (stream, headers) => {
      if (headers[':method'] !== 'CONNECT') {
        // Only accept CONNECT requests
        stream.close(NGHTTP2_REFUSED_STREAM);
        return;
      }
      const auth = new URL(`tcp://${headers[':authority']}`);
      // It's a very good idea to verify that hostname and port are
      // things this proxy should be connecting to.
      const socket = connect(auth.port, auth.hostname, () => {
        stream.respond();
        socket.pipe(stream);
        stream.pipe(socket);
      });
      socket.on('error', (error) => {
        stream.close(NGHTTP2_CONNECT_ERROR);
      });
    });
    
    proxy.listen(8001);
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const { NGHTTP2_REFUSED_STREAM } = http2.constants;
    const net = require('node:net');
    
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
      const socket = net.connect(auth.port, auth.hostname, () => {
        stream.respond();
        socket.pipe(stream);
        stream.pipe(socket);
      });
      socket.on('error', (error) => {
        stream.close(http2.constants.NGHTTP2_CONNECT_ERROR);
      });
    });
    
    proxy.listen(8001);
    ```

HTTP/2 CONNECT-клиент:

=== "MJS"

    ```js
    import { connect, constants } from 'node:http2';
    
    const client = connect('http://localhost:8001');
    
    // Must not specify the ':path' and ':scheme' headers
    // for CONNECT requests or an error will be thrown.
    const req = client.request({
      ':method': 'CONNECT',
      ':authority': 'localhost:8000',
    });
    
    req.on('response', (headers) => {
      console.log(headers[constants.HTTP2_HEADER_STATUS]);
    });
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => data += chunk);
    req.on('end', () => {
      console.log(`The server says: ${data}`);
      client.close();
    });
    req.end('Jane');
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    
    const client = http2.connect('http://localhost:8001');
    
    // Must not specify the ':path' and ':scheme' headers
    // for CONNECT requests or an error will be thrown.
    const req = client.request({
      ':method': 'CONNECT',
      ':authority': 'localhost:8000',
    });
    
    req.on('response', (headers) => {
      console.log(headers[http2.constants.HTTP2_HEADER_STATUS]);
    });
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => data += chunk);
    req.on('end', () => {
      console.log(`The server says: ${data}`);
      client.close();
    });
    req.end('Jane');
    ```

### Расширенный протокол `CONNECT` {#the-extended-connect-protocol}

[RFC 8441][RFC 8441] описывает расширение «Extended CONNECT Protocol» для HTTP/2: туннель
через `Http2Stream` с методом `CONNECT` для других протоколов (например WebSocket).

HTTP/2-серверы включают Extended CONNECT настройкой `enableConnectProtocol`:

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const settings = { enableConnectProtocol: true };
    const server = createServer({ settings });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const settings = { enableConnectProtocol: true };
    const server = http2.createServer({ settings });
    ```

Когда клиент получает от сервера кадр `SETTINGS` с разрешением extended CONNECT, можно
отправлять запросы `CONNECT` с псевдозаголовком `':protocol'`:

=== "MJS"

    ```js
    import { connect } from 'node:http2';
    const client = connect('http://localhost:8080');
    client.on('remoteSettings', (settings) => {
      if (settings.enableConnectProtocol) {
        const req = client.request({ ':method': 'CONNECT', ':protocol': 'foo' });
        // ...
      }
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const client = http2.connect('http://localhost:8080');
    client.on('remoteSettings', (settings) => {
      if (settings.enableConnectProtocol) {
        const req = client.request({ ':method': 'CONNECT', ':protocol': 'foo' });
        // ...
      }
    });
    ```

## API совместимости {#compatibility-api}

API совместимости даёт опыт, близкий к HTTP/1, при работе с HTTP/2, чтобы писать приложения
и для [HTTP/1][HTTP/1], и для HTTP/2. Охватывается только **публичный API** [HTTP/1][HTTP/1].
Внутренние методы и состояние многих модулей _не поддерживаются_ — реализация другая.

Пример HTTP/2-сервера через API совместимости:

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer((req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Foo', 'bar');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ok');
    });
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer((req, res) => {
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('X-Foo', 'bar');
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('ok');
    });
    ```

О смешанном сервере [HTTPS][HTTPS] и HTTP/2 см. в разделе [согласование ALPN][ALPN negotiation].
Обновление с не-TLS HTTP/1 не поддерживается.

API совместимости состоит из [`Http2ServerRequest`](#class-http2http2serverrequest) и
[`Http2ServerResponse`](#class-http2http2serverresponse). Совместимость с HTTP/1 не скрывает различий протоколов;
например текстовое пояснение к коду статуса игнорируется.

### Согласование ALPN {#alpn-negotiation}

ALPN позволяет обслуживать и [HTTPS][HTTPS], и HTTP/2 на одном сокете. Объекты `req` и `res`
могут быть HTTP/1 или HTTP/2; приложение **должно** опираться только на публичный API
[HTTP/1][HTTP/1] и само определять, когда доступны возможности HTTP/2.

Пример сервера с обоими протоколами:

=== "MJS"

    ```js
    import { createSecureServer } from 'node:http2';
    import { readFileSync } from 'node:fs';
    
    const cert = readFileSync('./cert.pem');
    const key = readFileSync('./key.pem');
    
    const server = createSecureServer(
      { cert, key, allowHTTP1: true },
      onRequest,
    ).listen(8000);
    
    function onRequest(req, res) {
      // Detects if it is a HTTPS request or HTTP/2
      const { socket: { alpnProtocol } } = req.httpVersion === '2.0' ?
        req.stream.session : req;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        alpnProtocol,
        httpVersion: req.httpVersion,
      }));
    }
    ```

=== "CJS"

    ```js
    const { createSecureServer } = require('node:http2');
    const { readFileSync } = require('node:fs');
    
    const cert = readFileSync('./cert.pem');
    const key = readFileSync('./key.pem');
    
    const server = createSecureServer(
      { cert, key, allowHTTP1: true },
      onRequest,
    ).listen(4443);
    
    function onRequest(req, res) {
      // Detects if it is a HTTPS request or HTTP/2
      const { socket: { alpnProtocol } } = req.httpVersion === '2.0' ?
        req.stream.session : req;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({
        alpnProtocol,
        httpVersion: req.httpVersion,
      }));
    }
    ```

Событие `'request'` ведёт себя одинаково и для [HTTPS][HTTPS], и для HTTP/2.

### Класс: `http2.Http2ServerRequest` {#class-http2http2serverrequest}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<stream.Readable>`](stream.md#streamreadable)

Объект `Http2ServerRequest` создаётся [`http2.Server`](#class-http2server) или
[`http2.SecureServer`](#class-http2secureserver) и передаётся первым аргументом в
[`'request'`](#event-request). Даёт доступ к состоянию запроса, заголовкам и данным.

#### Событие: `'aborted'`

<!-- YAML
added: v8.4.0
-->

Событие `'aborted'` при аварийном прерывании `Http2ServerRequest` в процессе обмена.

Генерируется только если сторона записи `Http2ServerRequest` ещё не завершена.

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

Указывает, что базовый [`Http2Stream`](#class-http2stream) закрыт.
Как и `'end'`, не более одного раза на ответ.

#### `request.aborted`

<!-- YAML
added: v10.1.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`request.aborted` равен `true`, если запрос прерван.

#### `request.authority`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Псевдозаголовок authority. В HTTP/2 можно задать `:authority` или `host`; значение берётся из
`req.headers[':authority']`, иначе из `req.headers['host']`.

#### `request.complete`

<!-- YAML
added: v12.10.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`request.complete` равен `true`, если запрос завершён, прерван или уничтожен.

#### `request.connection`

<!-- YAML
added: v8.4.0
deprecated: v13.0.0
-->

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`request.socket`](#requestsocket).

* Тип: [`<net.Socket>`](net.md#class-netsocket) | [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

См. [`request.socket`](#requestsocket).

#### `request.destroy([error])`

<!-- YAML
added: v8.4.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Вызывает `destroy()` у [`Http2Stream`](#class-http2stream), получившего
[`Http2ServerRequest`](#class-http2http2serverrequest). Если передан `error`, генерируется `'error'` с этим
аргументом у слушателей.

Если поток уже уничтожен, ничего не делает.

#### `request.headers`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект заголовков запроса/ответа.

Пары имя–значение; имена заголовков в нижнем регистре.

```js
// Prints something like:
//
// { 'user-agent': 'curl/7.22.0',
//   host: '127.0.0.1:8000',
//   accept: '*/*' }
console.log(request.headers);
```

См. [объект заголовков HTTP/2][HTTP/2 Headers Object].

В HTTP/2 путь, хост, протокол и метод задаются особыми заголовками с префиксом `:`
(например `':path'`). Они попадают в `request.headers`; их нельзя менять бездумно — возможны
ошибки. Например, если удалить все заголовки:

```js
removeAllHeaders(request.headers);
assert(request.url);   // Fails because the :path header has been removed
```

#### `request.httpVersion`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Для серверного запроса — версия HTTP, присланная клиентом; для клиентского ответа —
версия HTTP сервера. Возвращает `'2.0'`.

`message.httpVersionMajor` — первая цифра, `message.httpVersionMinor` — вторая.

#### `request.method`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод запроса строкой. Только чтение. Примеры: `'GET'`, `'DELETE'`.

#### `request.rawHeaders`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<HTTP/2 Raw Headers>`](#raw-headers)

Сырой список заголовков запроса/ответа в том виде, как получен.

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

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Сырые ключи и значения трейлеров запроса/ответа. Заполняется только к событию `'end'`.

#### `request.scheme`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Псевдозаголовок схемы — часть целевого URL.

#### `request.setTimeout(msecs, callback)`

<!-- YAML
added: v8.4.0
-->

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<http2.Http2ServerRequest>`](http2.md)

Задаёт таймаут [`Http2Stream`](#class-http2stream) равным `msecs` мс. Если передан колбэк, он
добавляется как слушатель `'timeout'` на объекте ответа.

Если ни на запрос, ни на ответ, ни на сервер не подписаны на `'timeout'`, по истечении
таймаута [`Http2Stream`](#class-http2stream) уничтожаются. Если обработчик есть, таймауты нужно обрабатывать
явно.

#### `request.socket`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<net.Socket>`](net.md#class-netsocket) | [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

Возвращает объект `Proxy`, ведущий себя как `net.Socket` (или `tls.TLSSocket`), с
логикой HTTP/2.

Свойства `destroyed`, `readable` и `writable` читаются и задаются через `request.stream`.

Методы `destroy`, `emit`, `end`, `on` и `once` вызываются на `request.stream`.

`setTimeout` вызывается на `request.stream.session`.

`pause`, `read`, `resume` и `write` дают ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`.
См. [`Http2Session` и сокеты][`Http2Session` and Sockets].

Остальное идёт на сокет напрямую. При TLS для данных клиентского сертификата используйте
[`request.socket.getPeerCertificate()`](tls.md#tlssocketgetpeercertificatedetailed).

#### `request.stream`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<Http2Stream>`](#class-http2stream)

[`Http2Stream`](#class-http2stream), связанный с запросом.

#### `request.trailers`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект трейлеров запроса/ответа. Заполняется к событию `'end'`.

#### `request.url`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строка URL запроса — только та часть, что присутствует в HTTP-запросе. Например:

```http
GET /status?name=ryan HTTP/1.1
Accept: text/plain
```

Тогда `request.url` будет таким:

<!-- eslint-disable @stylistic/js/semi -->

```js
'/status?name=ryan'
```

Разобрать URL на части можно через `new URL()`:

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

### Класс: `http2.Http2ServerResponse` {#class-http2http2serverresponse}

<!-- YAML
added: v8.4.0
-->

* Наследует: [`<Stream>`](stream.md#stream)

Создаётся HTTP-сервером внутри, не пользователем. Передаётся вторым аргументом в
[`'request'`](#event-request).

#### Событие: `'close'`

<!-- YAML
added: v8.4.0
-->

Базовый [`Http2Stream`](#class-http2stream) завершён до вызова [`response.end()`](#responseenddata-encoding-callback) или до сброса буфера.

#### Событие: `'finish'`

<!-- YAML
added: v8.4.0
-->

Генерируется, когда ответ отправлен: последний фрагмент заголовков и тела передан мультиплексору
HTTP/2 для передачи по сети. Не означает, что клиент уже что-то получил.

После этого на объекте ответа больше не будет событий.

#### `response.addTrailers(headers)`

<!-- YAML
added: v8.4.0
-->

* `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Добавляет HTTP-трейлеры (заголовки в конце сообщения) к ответу.

Недопустимые символы в имени или значении заголовка приводят к [`TypeError`](errors.md#class-typeerror).

#### `response.appendHeader(name, value)`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Добавляет одно значение к заголовку.

Если `value` — массив, это эквивалентно нескольким вызовам метода.

Если раньше значений не было, эквивалентно [`response.setHeader()`](#responsesetheadername-value).

Недопустимые символы в имени или значении — [`TypeError`](errors.md#class-typeerror).

```js
// Returns headers including "set-cookie: a" and "set-cookie: b"
const server = http2.createServer((req, res) => {
  res.setHeader('set-cookie', 'a');
  res.appendHeader('set-cookie', 'b');
  res.writeHead(200);
  res.end('ok');
});
```

#### `response.connection`

<!-- YAML
added: v8.4.0
deprecated: v13.0.0
-->

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`response.socket`](#responsesocket).

* Тип: [`<net.Socket>`](net.md#class-netsocket) | [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

См. [`response.socket`](#responsesocket).

#### `response.createPushResponse(headers, callback)`

<!-- YAML
added: v8.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.4.0

* `headers` [`<HTTP/2 Headers Object>`](#headers-object) Объект заголовков
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после завершения `http2stream.pushStream()`,
  при ошибке или отклонении создания push `Http2Stream`, либо если `Http2ServerRequest`
  закрыт до вызова `http2stream.pushStream()`
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `res` [`<http2.Http2ServerResponse>`](http2.md) Новый объект `Http2ServerResponse`

Вызывает [`http2stream.pushStream()`](#http2streampushstreamheaders-options-callback) с заданными заголовками и при успехе передаёт в
колбэк новый `Http2ServerResponse`, оборачивающий [`Http2Stream`](#class-http2stream). Если
`Http2ServerRequest` закрыт, колбэк получает `ERR_HTTP2_INVALID_STREAM`.

#### `response.end([data[, encoding]][, callback])`

<!-- YAML
added: v8.4.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18780
    description: This method now returns a reference to `ServerResponse`.
-->

Добавлено в: v8.4.0

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Сообщает, что все заголовки и тело ответа отправлены; сообщение считается завершённым.
`response.end()` нужно вызвать для каждого ответа.

Если указан `data`, это эквивалентно
[`response.write(data, encoding)`](http.md#responsewritechunk-encoding-callback) и затем `response.end(callback)`.

Если указан `callback`, он вызывается по окончании потока ответа.

#### `response.finished`

<!-- YAML
added: v8.4.0
deprecated:
 - v13.4.0
 - v12.16.0
-->

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`response.writableEnded`](#responsewritableended).

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`false`, пока ответ не завершён; после [`response.end()`](#responseenddata-encoding-callback) — `true`.

#### `response.getHeader(name)`

<!-- YAML
added: v8.4.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает заголовок из очереди на отправку (ещё не ушёл клиенту). Имя без учёта регистра.

```js
const contentType = response.getHeader('content-type');
```

#### `response.getHeaderNames()`

<!-- YAML
added: v8.4.0
-->

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Массив уникальных имён исходящих заголовков; все в нижнем регистре.

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

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Неглубокая копия текущих исходящих заголовков; массивы в значениях можно менять без
дополнительных вызовов методов http. Ключи — имена заголовков в нижнем регистре.

Объект из `response.getHeaders()` _не_ наследует от `Object`: методы вроде `obj.toString()`,
`obj.hasOwnProperty()` _не работают_.

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

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если заголовок `name` есть среди исходящих. Сопоставление имени без учёта регистра.

```js
const hasContentType = response.hasHeader('content-type');
```

#### `response.headersSent`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если заголовки уже отправлены, иначе `false` (только чтение).

#### `response.removeHeader(name)`

<!-- YAML
added: v8.4.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Удаляет заголовок из очереди неявной отправки.

```js
response.removeHeader('Content-Encoding');
```

#### `response.req`

<!-- YAML
added: v15.7.0
-->

* Тип: [`<http2.Http2ServerRequest>`](http2.md)

Ссылка на исходный объект HTTP2 `request`.

#### `response.sendDate`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, заголовок Date генерируется и отправляется автоматически, если его ещё нет.
По умолчанию `true`.

Отключать только для тестов; в ответах HTTP требуется заголовок Date.

#### `response.setHeader(name, value)`

<!-- YAML
added: v8.4.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Задаёт значение неявного заголовка; если заголовок уже есть, значение заменяется.
Массив строк — несколько полей с одним именем.

```js
response.setHeader('Content-Type', 'text/html; charset=utf-8');
```

or

```js
response.setHeader('Set-Cookie', ['type=ninja', 'language=javascript']);
```

Недопустимые символы — [`TypeError`](errors.md#class-typeerror).

Заголовки из [`response.setHeader()`](#responsesetheadername-value) объединяются с аргументом
[`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers); приоритет у [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

```js
// Returns content-type = text/plain
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('ok');
});
```

#### `response.setTimeout(msecs[, callback])`

<!-- YAML
added: v8.4.0
-->

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<http2.Http2ServerResponse>`](http2.md)

Задаёт таймаут [`Http2Stream`](#class-http2stream) равным `msecs` мс. Колбэк добавляется как слушатель
`'timeout'` на объекте ответа.

Логика таймаута такая же, как у `request.setTimeout`: без слушателей потоки уничтожаются;
со слушателями — обрабатывайте явно.

#### `response.socket`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<net.Socket>`](net.md#class-netsocket) | [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

`Proxy` как `net.Socket`/`tls.TLSSocket` с логикой HTTP/2.

`destroyed`, `readable` и `writable` берутся из `response.stream`.

Методы `destroy`, `emit`, `end`, `on` и `once` вызываются на `response.stream`.

`setTimeout` вызывается на `response.stream.session`.

`pause`, `read`, `resume` и `write` дают ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`.
См. [`Http2Session` и сокеты][`Http2Session` and Sockets].

Остальное идёт на сокет напрямую.

=== "MJS"

    ```js
    import { createServer } from 'node:http2';
    const server = createServer((req, res) => {
      const ip = req.socket.remoteAddress;
      const port = req.socket.remotePort;
      res.end(`Your IP address is ${ip} and your source port is ${port}.`);
    }).listen(3000);
    ```

=== "CJS"

    ```js
    const http2 = require('node:http2');
    const server = http2.createServer((req, res) => {
      const ip = req.socket.remoteAddress;
      const port = req.socket.remotePort;
      res.end(`Your IP address is ${ip} and your source port is ${port}.`);
    }).listen(3000);
    ```

#### `response.statusCode`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

При неявных заголовках (без явного [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers)) свойство задаёт
код статуса, который уйдёт клиенту при сбросе заголовков.

```js
response.statusCode = 404;
```

После отправки заголовков клиенту свойство отражает фактически отправленный код статуса.

#### `response.statusMessage`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Текстовое пояснение к статусу в HTTP/2 не поддерживается (RFC 7540 8.1.2.4). Возвращается
пустая строка.

#### `response.stream`

<!-- YAML
added: v8.4.0
-->

* Тип: [`<Http2Stream>`](#class-http2stream)

[`Http2Stream`](#class-http2stream), связанный с ответом.

#### `response.writableEnded`

<!-- YAML
added: v12.9.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`response.end()`](#responseenddata-encoding-callback). Не показывает сброс данных в ядро; для этого
см. [`writable.writableFinished`](stream.md#writablewritablefinished).

#### `response.write(chunk[, encoding][, callback])`

<!-- YAML
added: v8.4.0
-->

* `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) ещё не вызывался, включается режим неявных заголовков и
они сбрасываются.

Отправляет фрагмент тела ответа; можно вызывать несколько раз.

Как в `node:http`: для HEAD тело не отправляется; для ответов `204` и `304` тело
_не должно_ быть.

`chunk` — строка или буфер; для строки второй параметр — кодировка в байты (по умолчанию
`'utf8'`). `callback` — после сброса этого фрагмента.

Это сырое тело HTTP, не multipart и прочие высокоуровневые кодировки.

Первый вызов [`response.write()`](#responsewritechunk-encoding-callback) отправляет буферизованные заголовки и первый фрагмент
тела; дальше данные стримятся отдельными порциями — буферизация до первого фрагмента тела.

`true`, если всё сразу ушло в буфер ядра; `false`, если часть осталась в пользовательской памяти.
При освобождении буфера будет `'drain'`.

#### `response.writeContinue()`

<!-- YAML
added: v8.4.0
-->

Отправляет статус `100 Continue` — клиенту можно отправлять тело запроса. См. [`'checkContinue'`](#event-checkcontinue)
у `Http2Server` и `Http2SecureServer`.

#### `response.writeEarlyHints(hints)`

<!-- YAML
added: v18.11.0
-->

* `hints` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Отправляет статус `103 Early Hints` с заголовком Link, чтобы агент мог заранее подгрузить
или предсоединиться к ресурсам. `hints` — объект со значениями заголовков для Early Hints.

**Пример**

```js
const earlyHintsLink = '</styles.css>; rel=preload; as=style';
response.writeEarlyHints({
  'link': earlyHintsLink,
});

const earlyHintsLinks = [
  '</styles.css>; rel=preload; as=style',
  '</scripts.js>; rel=preload; as=script',
];
response.writeEarlyHints({
  'link': earlyHintsLinks,
});
```

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

Добавлено в: v8.4.0

* `statusCode` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `statusMessage` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object) | [`<HTTP/2 Raw Headers>`](#raw-headers)
* Возвращает: [`<http2.Http2ServerResponse>`](http2.md)

Отправляет заголовки ответа. `statusCode` — трёхзначный HTTP-код, например `404`. Последний
аргумент `headers` — заголовки ответа.

Возвращает `Http2ServerResponse` для цепочки вызовов.

Для совместимости с [HTTP/1][HTTP/1] вторым аргументом можно передать `statusMessage`, но в HTTP/2
он не используется, эффекта нет, будет предупреждение процесса.

```js
const body = 'hello world';
response.writeHead(200, {
  'Content-Length': Buffer.byteLength(body),
  'Content-Type': 'text/plain; charset=utf-8',
});
```

`Content-Length` задаётся в байтах, не в символах; для подсчёта — `Buffer.byteLength()`.
Исходящие сообщения Node не сверяет с длиной тела; при приёме отклоняет, если `Content-Length`
не совпадает с фактическим размером.

Не более одного вызова на сообщение до [`response.end()`](#responseenddata-encoding-callback).

Если до этого вызывались [`response.write()`](#responsewritechunk-encoding-callback) или [`response.end()`](#responseenddata-encoding-callback), неявные заголовки
считаются и этот метод вызывается сам.

Заголовки из [`response.setHeader()`](#responsesetheadername-value) объединяются с [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers); приоритет у
[`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

```js
// Returns content-type = text/plain
const server = http2.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('ok');
});
```

Недопустимые символы в имени или значении заголовка — [`TypeError`](errors.md#class-typeerror).

## Сбор метрик производительности HTTP/2

API [Performance Observer][Performance Observer] позволяет собирать базовые метрики для каждой `Http2Session` и
`Http2Stream`.

=== "MJS"

    ```js
    import { PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((items) => {
      const entry = items.getEntries()[0];
      console.log(entry.entryType);  // prints 'http2'
      if (entry.name === 'Http2Session') {
        // Entry contains statistics about the Http2Session
      } else if (entry.name === 'Http2Stream') {
        // Entry contains statistics about the Http2Stream
      }
    });
    obs.observe({ entryTypes: ['http2'] });
    ```

=== "CJS"

    ```js
    const { PerformanceObserver } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((items) => {
      const entry = items.getEntries()[0];
      console.log(entry.entryType);  // prints 'http2'
      if (entry.name === 'Http2Session') {
        // Entry contains statistics about the Http2Session
      } else if (entry.name === 'Http2Stream') {
        // Entry contains statistics about the Http2Stream
      }
    });
    obs.observe({ entryTypes: ['http2'] });
    ```

У `PerformanceEntry` свойство `entryType` равно `'http2'`.

`name` — `'Http2Stream'` или `'Http2Session'`.

Если `name` равен `Http2Stream`, у `PerformanceEntry` есть дополнительные поля:

* `bytesRead` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Байт кадров `DATA`, полученных для этого `Http2Stream`.
* `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Байт кадров `DATA`, отправленных для этого `Http2Stream`.
* `id` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор связанного `Http2Stream`
* `timeToFirstByte` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды между `startTime` записи `PerformanceEntry` и приёмом первого кадра `DATA`.
* `timeToFirstByteSent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды между `startTime` и отправкой первого кадра `DATA`.
* `timeToFirstHeader` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды между `startTime` и приёмом первого заголовка.

Если `name` равен `Http2Session`, дополнительные поля:

* `bytesRead` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Байт получено для этой `Http2Session`.
* `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Байт отправлено для этой `Http2Session`.
* `framesReceived` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число принятых кадров HTTP/2 у `Http2Session`.
* `framesSent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число отправленных кадров HTTP/2 у `Http2Session`.
* `maxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум одновременно открытых потоков за жизнь `Http2Session`.
* `pingRTT` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды от отправки кадра `PING` до подтверждения. Только если на `Http2Session` отправляли `PING`.
* `streamAverageDuration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Средняя длительность (мс) всех `Http2Stream`.
* `streamCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число обработанных `Http2Stream` у `Http2Session`.
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'server'` или `'client'` — тип `Http2Session`.

## Примечание о `:authority` и `host`

В HTTP/2 в запросе должен быть псевдозаголовок `:authority` или заголовок `host`. При прямой
сборке HTTP/2 предпочтительнее `:authority`; при переводе с HTTP/1 (например в прокси) — `host`.

API совместимости подставляет `host`, если нет `:authority`. См. [`request.authority`](#requestauthority).
Без API совместимости (или при прямой работе с `req.headers`) запасной логикой занимаетесь сами.

[ALPN Protocol ID]: https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids
[ALPN negotiation]: #alpn-negotiation
[Compatibility API]: #compatibility-api
[DEP0202]: deprecations.md#dep0202-http1incomingmessage-and-http1serverresponse-options-of-http2-servers
[HTTP/1]: http.md
[HTTP/2]: https://tools.ietf.org/html/rfc7540
[HTTP/2 Headers Object]: #headers-object
[HTTP/2 Raw Headers]: #raw-headers
[HTTP/2 Settings Object]: #settings-object
[HTTP/2 Unencrypted]: https://http2.github.io/faq/#does-http2-require-encryption
[HTTPS]: https.md
[Performance Observer]: perf_hooks.md
[RFC 7838]: https://tools.ietf.org/html/rfc7838
[RFC 8336]: https://tools.ietf.org/html/rfc8336
[RFC 8441]: https://tools.ietf.org/html/rfc8441
[RFC 9113]: https://datatracker.ietf.org/doc/html/rfc9113#section-5.3.1
[Sensitive headers]: #sensitive-headers
[`'checkContinue'`]: #event-checkcontinue
[`'connect'`]: #event-connect
[`'request'`]: #event-request
[`'unknownProtocol'`]: #event-unknownprotocol
[`ClientHttp2Stream`]: #class-clienthttp2stream
[`Duplex`]: stream.md#class-streamduplex
[`Http2ServerRequest`]: #class-http2http2serverrequest
[`Http2ServerResponse`]: #class-http2http2serverresponse
[`Http2Session` and Sockets]: #http2session-and-sockets
[`Http2Session`'s `'stream'` event]: #event-stream
[`Http2Stream`]: #class-http2stream
[`ServerHttp2Stream`]: #class-serverhttp2stream
[`TypeError`]: errors.md#class-typeerror
[`http.createServer()`]: http.md#httpcreateserveroptions-requestlistener
[`http2.SecureServer`]: #class-http2secureserver
[`http2.Server`]: #class-http2server
[`http2.createSecureServer()`]: #http2createsecureserveroptions-onrequesthandler
[`http2.createServer()`]: #http2createserveroptions-onrequesthandler
[`http2session.close()`]: #http2sessionclosecallback
[`http2stream.pushStream()`]: #http2streampushstreamheaders-options-callback
[`import()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
[`net.Server.close()`]: net.md#serverclosecallback
[`net.Socket.bufferSize`]: net.md#socketbuffersize
[`net.Socket.prototype.ref()`]: net.md#socketref
[`net.Socket.prototype.unref()`]: net.md#socketunref
[`net.Socket`]: net.md#class-netsocket
[`net.connect()`]: net.md#netconnect
[`net.createServer()`]: net.md#netcreateserveroptions-connectionlistener
[`request.authority`]: #requestauthority
[`request.maxHeadersCount`]: http.md#requestmaxheaderscount
[`request.socket.getPeerCertificate()`]: tls.md#tlssocketgetpeercertificatedetailed
[`request.socket`]: #requestsocket
[`response.end()`]: #responseenddata-encoding-callback
[`response.setHeader()`]: #responsesetheadername-value
[`response.socket`]: #responsesocket
[`response.writableEnded`]: #responsewritableended
[`response.write()`]: #responsewritechunk-encoding-callback
[`response.write(data, encoding)`]: http.md#responsewritechunk-encoding-callback
[`response.writeContinue()`]: #responsewritecontinue
[`response.writeHead()`]: #responsewriteheadstatuscode-statusmessage-headers
[`server.close()`]: #serverclosecallback
[`server.maxHeadersCount`]: http.md#servermaxheaderscount
[`tls.Server.close()`]: tls.md#serverclosecallback
[`tls.TLSSocket`]: tls.md#class-tlstlssocket
[`tls.connect()`]: tls.md#tlsconnectoptions-callback
[`tls.createServer()`]: tls.md#tlscreateserveroptions-secureconnectionlistener
[`writable.writableFinished`]: stream.md#writablewritablefinished
[error code]: #error-codes-for-rst_stream-and-goaway
