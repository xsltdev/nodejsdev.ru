---
description: Модуль http2 предоставляет реализацию протокола HTTP 2
---

# HTTP/2

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/http2.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:http2` предоставляет реализацию протокола [HTTP/2](https://tools.ietf.org/html/rfc7540). Доступ к нему можно получить, используя:

```js
const http2 = require('node:http2');
```

<!-- 0000.part.md -->

## Определение отсутствия поддержки криптографии

Возможно, что Node.js будет собран без поддержки модуля `node:crypto`. В таких случаях попытка `import` из `node:http2` или вызов `require('node:http2')` приведет к ошибке.

При использовании CommonJS возникшую ошибку можно перехватить с помощью `try/catch`:

```cjs
let http2;
try {
    http2 = require('node:http2');
} catch (err) {
    console.error('Поддержка http2 отключена!');
}
```

При использовании лексического ключевого слова ESM `import` ошибка может быть поймана только в том случае, если обработчик `process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль (например, с помощью модуля предварительной загрузки).

При использовании ESM, если есть вероятность, что код может быть запущен на сборке Node.js, в которой не включена поддержка криптографии, используйте функцию [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) вместо лексического ключевого слова `import`:

```mjs
let http2;
try {
    http2 = await import('node:http2');
} catch (err) {
    console.error('Поддержка http2 отключена!');
}
```

<!-- 0001.part.md -->

## Core API

Core API предоставляет низкоуровневый интерфейс, разработанный специально для поддержки функций протокола HTTP/2. Он специально _не_ предназначен для совместимости с существующим API модуля [HTTP/1](http.md). Однако, [Compatibility API](#compatibility-api) является таковым.

API ядра `http2` гораздо более симметричен между клиентом и сервером, чем API `http`. Например, большинство событий, таких как `'error'`, `'connect'` и `'stream'`, могут быть вызваны как клиентским, так и серверным кодом.

<!-- 0002.part.md -->

### Пример на стороне сервера

Ниже показан простой HTTP/2 сервер, использующий Core API. Поскольку не известно ни одного браузера, поддерживающего [незашифрованный HTTP/2](https://http2.github.io/faq/#does-http2-require-encryption), при взаимодействии с клиентами браузера необходимо использовать [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler).

```js
const http2 = require('node:http2');
const fs = require('node:fs');

const server = http2.createSecureServer({
    key: fs.readFileSync('localhost-privkey.pem'),
    cert: fs.readFileSync('localhost-cert.pem'),
});
server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {
    // stream - это дуплекс
    stream.respond({
        'content-type': 'text/html; charset=utf-8',
        status: 200,
    });
    stream.end('<h1>Hello World</h1>');
});

server.listen(8443);
```

Чтобы сгенерировать сертификат и ключ для этого примера, выполните:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

<!-- 0003.part.md -->

### Пример на стороне клиента

Ниже показан клиент HTTP/2:

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
req.on('data', (chunk) => {
    data += chunk;
});
req.on('end', () => {
    console.log(`\n${data}`);
    client.close();
});
req.end();
```

<!-- 0004.part.md -->

### Класс: `Http2Session`

-   Расширяет: {EventEmitter}

Экземпляры класса `http2.Http2Session` представляют активный сеанс связи между HTTP/2 клиентом и сервером. Экземпляры этого класса _не_ предназначены для создания непосредственно пользовательским кодом.

Каждый экземпляр `Http2Session` будет проявлять несколько иное поведение в зависимости от того, работает ли он как сервер или как клиент. Свойство `http2session.type` может быть использовано для определения режима, в котором работает `Http2Session`. На стороне сервера пользовательский код редко должен иметь возможность работать с объектом `Http2Session` напрямую, большинство действий обычно выполняется через взаимодействие с объектами `Http2Server` или `Http2Stream`.

Пользовательский код не будет создавать экземпляры `Http2Session` напрямую. Экземпляры `Http2Session` на стороне сервера создаются экземпляром `Http2Server` при получении нового HTTP/2 соединения. Экземпляры `Http2Session` на стороне клиента создаются с помощью метода `http2.connect()`.

<!-- 0005.part.md -->

#### `Http2Session` и сокеты

Каждый экземпляр `Http2Session` при создании ассоциируется ровно с одним [`net.Socket`](net.md#class-netsocket) или [`tls.TLSSocket`](tls.md#class-tlstlssocket). При уничтожении `Socket` или `Http2Session` будут уничтожены оба.

Из-за специфических требований к сериализации и обработке, налагаемых протоколом HTTP/2, пользовательскому коду не рекомендуется читать данные из или записывать данные в экземпляр `Socket`, связанный с `Http2Session`. Это может перевести сессию HTTP/2 в неопределенное состояние, в результате чего сессия и сокет станут непригодными для использования.

После того, как `Socket` был привязан к `Http2Session`, пользовательский код должен полагаться исключительно на API `Http2Session`.

<!-- 0006.part.md -->

#### Событие: `'close'`

Событие `'close'` происходит после уничтожения `Http2Session`. Его слушатель не ожидает никаких аргументов.

<!-- 0007.part.md -->

#### Событие: `'connect'`

-   `session` {Http2Session}
-   `socket` {net.Socket}

Событие `'connect'` происходит, когда `Http2Session` успешно соединяется с удаленным аналогом и может начать взаимодействие.

Пользовательский код, как правило, не прослушивает это событие напрямую.

<!-- 0008.part.md -->

#### Событие: `error`

-   `error` {Ошибка}

Событие `'error'` генерируется, когда происходит ошибка во время обработки `Http2Session`.

<!-- 0009.part.md -->

#### Событие: `FrameError`

-   `type` {integer} Тип кадра.
-   `code` {integer} Код ошибки.
-   `id` {integer} Идентификатор потока (или `0`, если кадр не связан с потоком).

Событие `'frameError'` генерируется, когда возникает ошибка при попытке отправить кадр в сессии. Если кадр, который не удалось отправить, связан с определенным `Http2Stream`, делается попытка выдать событие `'frameError'` на `Http2Stream`.

Если событие `'frameError'` связано с потоком, поток будет закрыт и уничтожен сразу после события `'frameError'`. Если событие не связано с потоком, то `Http2Session` будет закрыт сразу после события `'frameError'`.

<!-- 0010.part.md -->

#### Событие: `goaway`

-   `errorCode` {number} Код ошибки HTTP/2, указанный во фрейме `GOAWAY`.
-   `lastStreamID` {number} ID последнего потока, который удаленный пир успешно обработал (или `0`, если ID не указан).
-   `opaqueData` {Buffer} Если в кадр `GOAWAY` были включены дополнительные непрозрачные данные, будет передан экземпляр `Buffer`, содержащий эти данные.

Событие `goaway` испускается при получении кадра `GOAWAY`.

Экземпляр `Http2Session` будет автоматически закрыт при получении события `'goaway'`.

<!-- 0011.part.md -->

#### Событие: `'localSettings'`

-   `settings` {HTTP/2 Объект настроек} Копия полученного кадра `SETTINGS`.

Событие `'localSettings'` испускается, когда получено подтверждение кадра `SETTINGS`.

При использовании `http2session.settings()` для отправки новых настроек, измененные настройки не вступают в силу до тех пор, пока не будет вызвано событие `'localSettings'`.

```js
session.settings({ enablePush: false });

session.on('localSettings', (settings) => {
    /* Использовать новые настройки */
});
```

<!-- 0012.part.md -->

#### Событие: `ping`.

-   `payload` {Буфер} 8-байтовая полезная нагрузка кадра `PING`.

Событие `'ping'` генерируется всякий раз, когда от подключенного аналога получен кадр `PING`.

<!-- 0013.part.md -->

#### Событие: `'remoteSettings'`

-   `settings` {HTTP/2 Объект настроек} Копия полученного кадра `SETTINGS`.

Событие `'remoteSettings'` испускается, когда новый фрейм `SETTINGS` получен от подключенного аналога.

```js
session.on('remoteSettings', (settings) => {
    /* Использовать новые настройки */
});
```

<!-- 0014.part.md -->

#### Событие: `stream`

-   `stream` {Http2Stream} Ссылка на поток
-   `headers` {HTTP/2 Headers Object} Объект, описывающий заголовки
-   `flags` {number} Соответствующие числовые флаги
-   `rawHeaders` {Array} Массив, содержащий имена необработанных заголовков, за которыми следуют их соответствующие значения.

Событие `'stream'` испускается, когда создается новый `Http2Stream`.

```js
const http2 = require('node:http2');
session.on('stream', (stream, headers, flags) => {
    const method = headers[':method'];
    const path = headers[':path'];
    // ...
    stream.respond({
        ':status': 200,
        'content-type': 'text/plain; charset=utf-8',
    });
    stream.write('hello');
    stream.end('world');
});
```

На стороне сервера пользовательский код обычно не будет слушать это событие напрямую, а вместо этого зарегистрирует обработчик для события `'stream'`, испускаемого экземплярами `net.Server` или `tls.Server`, возвращаемыми `http2.createServer()` и `http2.createSecureServer()` соответственно, как показано в примере ниже:

```js
const http2 = require('node:http2');

// Создаем незашифрованный HTTP/2 сервер
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

Несмотря на то, что потоки HTTP/2 и сетевые сокеты не находятся в соответствии 1:1, сетевая ошибка уничтожит каждый отдельный поток и должна быть обработана на уровне потока, как показано выше.

<!-- 0015.part.md -->

#### Событие: `'timeout'`

После использования метода `http2session.setTimeout()` для установки периода таймаута для данной `Http2Session`, событие `'timeout'` испускается, если нет активности в `Http2Session` после заданного количества миллисекунд. Его слушатель не ожидает никаких аргументов.

```js
session.setTimeout(2000);
session.on('timeout', () => {
    /* ... */
});
```

<!-- 0016.part.md -->

#### `http2session.alpnProtocol`

-   {string|undefined}

Значение будет `undefined`, если `Http2Session` еще не подключен к сокету, `h2c`, если `Http2Session` не подключен к `TLSSocket`, или вернет значение собственного свойства `alpnProtocol` подключенного `TLSSocket`.

<!-- 0017.part.md -->

#### `http2session.close([callback])`

-   `callback` {функция}

Благородно закрывает `Http2Session`, позволяя всем существующим потокам завершиться самостоятельно и предотвращая создание новых экземпляров `Http2Stream`. После закрытия `http2session.destroy()` _может_ быть вызвана, если нет открытых экземпляров `Http2Stream`.

Если указано, то функция `callback` регистрируется как обработчик события `'close'`.

<!-- 0018.part.md -->

#### `http2session.closed`

-   {boolean}

Будет `true`, если данный экземпляр `Http2Session` был закрыт, иначе `false`.

<!-- 0019.part.md -->

#### `http2session.connecting`

-   {boolean}

Будет `true`, если данный экземпляр `Http2Session` все еще подключен, будет установлен в `false` перед выдачей события `connect` и/или вызовом обратного вызова `http2.connect`.

<!-- 0020.part.md -->

#### `http2session.destroy([error][, code])`

-   `error` {Error} Объект `Error`, если `Http2Session` уничтожается из-за ошибки.
-   `code` {number} Код ошибки HTTP/2 для отправки в финальном фрейме `GOAWAY`. Если не указано, и `error` не является неопределенным, по умолчанию `INTERNAL_ERROR`, в противном случае по умолчанию `NO_ERROR`.

Немедленно завершает `Http2Session` и связанный с ним `net.Socket` или `tls.TLSSocket`.

После уничтожения `Http2Session` выдает событие `'close'`. Если `error` не является неопределенным, то событие `'error'` будет выдано непосредственно перед событием `'close'`.

Если есть какие-либо оставшиеся открытые `Http2Streams`, связанные с `Http2Session`, они также будут уничтожены.

<!-- 0021.part.md -->

#### `http2session.destroyed`

-   {boolean}

Будет `true`, если этот экземпляр `Http2Session` был уничтожен и больше не должен использоваться, иначе `false`.

<!-- 0022.part.md -->

#### `http2session.encrypted`

-   {boolean|undefined}

Значение равно `undefined`, если сокет сессии `Http2Session` еще не подключен, `true`, если `Http2Session` подключен к `TLSSocket`, и `false`, если `Http2Session` подключен к любому другому типу сокета или потока.

<!-- 0023.part.md -->

#### `http2session.goaway([code[, lastStreamID[, opaqueData]]]])`

-   `code` {number} Код ошибки HTTP/2
-   `lastStreamID` {число} Числовой идентификатор последнего обработанного `Http2Stream`.
-   `opaqueData` {Buffer|TypedArray|DataView} Экземпляр `TypedArray` или `DataView`, содержащий дополнительные данные, которые должны быть переданы в кадре `GOAWAY`.

Передает кадр `GOAWAY` подключенному аналогу _без_ закрытия `Http2Session`.

<!-- 0024.part.md -->

#### `http2session.localSettings`

-   {HTTP/2 Settings Object}

Объект без прототипа, описывающий текущие локальные настройки данной `Http2Session`. Локальные настройки являются локальными для _этого_ экземпляра `Http2Session`.

<!-- 0025.part.md -->

#### `http2session.originSet`

-   {string\[\]|undefined}

Если `Http2Session` подключен к `TLSSocket`, свойство `originSet` возвращает `массив` источников, для которых `Http2Session` может считаться авторитетным.

Свойство `originSet` доступно только при использовании безопасного TLS-соединения.

<!-- 0026.part.md -->

#### `http2session.pendingSettingsAck`

-   {boolean}

Указывает, ожидает ли `Http2Session` в настоящее время подтверждения отправленного кадра `SETTINGS`. Будет `true` после вызова метода `http2session.settings()`. Будет `false`, когда все отправленные фреймы `SETTINGS` будут подтверждены.

<!-- 0027.part.md -->

#### `http2session.ping([payload, ]callback)`

-   `payload` {Buffer|TypedArray|DataView} Необязательная полезная нагрузка пинга.
-   `callback` {Function}
-   Возвращает: {boolean}

Отправляет фрейм `PING` подключенному HTTP/2 peer. Должна быть указана функция `callback`. Метод вернет `true`, если `PING` был отправлен, `false` в противном случае.

Максимальное количество незавершенных (непризнанных) пингов определяется параметром конфигурации `maxOutstandingPings`. По умолчанию максимальное значение равно 10.

Если указано, то `payload` должен представлять собой `Buffer`, `TypedArray` или `DataView`, содержащий 8 байт данных, которые будут переданы вместе с `PING` и возвращены с подтверждением пинга.

Обратный вызов будет вызван с тремя аргументами: аргумент error, который будет `null`, если `PING` был успешно подтвержден, аргумент `duration`, который сообщает количество миллисекунд, прошедших с момента отправки пинга и получения подтверждения, и `Buffer`, содержащий 8-байтовый полезный груз `PING`.

```js
session.ping(
    Buffer.from('abcdefgh'),
    (err, duration, payload) => {
        if (!err) {
            console.log(
                `Пинг подтвержден через ${длительность} миллисекунд`
            );
            console.log(
                `С полезной нагрузкой '${payload.toString()}'`
            );
        }
    }
);
```

Если аргумент `payload` не указан, то по умолчанию в качестве полезной нагрузки будет использоваться 64-битная метка времени (little endian), отмечающая начало длительности `PING`.

<!-- 0028.part.md -->

#### `http2session.ref()`

Вызывает [`ref()`](net.md#socketref) для данного экземпляра `Http2Session`, лежащего в основе [`net.Socket`](net.md#class-netsocket).

<!-- 0029.part.md -->

#### `http2session.remoteSettings`

-   {HTTP/2 Settings Object}

Объект без прототипа, описывающий текущие удаленные настройки этой `Http2Session`. Удаленные настройки устанавливаются _подключенным_ HTTP/2 peer.

<!-- 0030.part.md -->

#### `http2session.setLocalWindowSize(windowSize)`

-   `windowSize` {число}

Устанавливает размер окна локальной конечной точки. Значение `windowSize` - это полный размер окна, который нужно установить, а не дельта.

```js
const http2 = require('node:http2');

const server = http2.createServer();
const expectedWindowSize = 2 ** 20;
server.on('connect', (session) => {
    // Устанавливаем размер локального окна равным 2 ** 20
    session.setLocalWindowSize(expectedWindowSize);
});
```

<!-- 0031.part.md -->

#### `http2session.setTimeout(msecs, callback)`

-   `msecs` {число}
-   `callback` {функция}

Используется для установки функции обратного вызова, которая вызывается, когда нет активности на `Http2Session` после `msecs` миллисекунд. Данный `callback` регистрируется как слушатель события `'timeout'`.

<!-- 0032.part.md -->

#### `http2session.socket`

-   {net.Socket|tls.TLSSocket}

Возвращает объект `Proxy`, который действует как `net.Socket` (или `tls.TLSSocket`), но ограничивает доступные методы теми, которые безопасны для использования с HTTP/2.

Методы `destroy`, `emit`, `end`, `pause`, `read`, `resume` и `write` приведут к ошибке с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`. Смотрите [`Http2Session` и сокеты](#http2session-and-sockets) для получения дополнительной информации.

Метод `setTimeout` будет вызван на этой `Http2Session`.

Все остальные взаимодействия будут направлены непосредственно на сокет.

<!-- 0033.part.md -->

#### `http2session.state`

Предоставляет различную информацию о текущем состоянии `Http2Session`.

-   {Object}
    -   `effectiveLocalWindowSize` {number} Текущий размер локального (принимающего) окна управления потоком для `Http2Session`.
    -   `effectiveRecvDataLength` {number} Текущее количество байт, которые были получены с момента последнего управления потоком `WINDOW_UPDATE`.
    -   `nextStreamID` {number} Числовой идентификатор, который будет использоваться в следующий раз, когда новый `Http2Stream` будет создан этой `Http2Session`.
    -   `localWindowSize` {number} Количество байт, которое удаленный пир может отправить без получения `WINDOW_UPDATE`.
    -   `lastProcStreamID` {number} Числовой идентификатор `Http2Stream`, для которого последним был получен фрейм `HEADERS` или `DATA`.
    -   `remoteWindowSize` {number} Количество байт, которое эта `Http2Session` может отправить без получения `WINDOW_UPDATE`.
    -   `outboundQueueSize` {number} Количество кадров, находящихся в очереди на отправку для этой `Http2Session`.
    -   `deflateDynamicTableSize` {number} Текущий размер в байтах таблицы состояния сжатия исходящих заголовков.
    -   `inflateDynamicTableSize` {число} Текущий размер в байтах таблицы состояния сжатия входящих заголовков.

Объект, описывающий текущее состояние данного `Http2Session`.

<!-- 0034.part.md -->

#### `http2session.settings([settings][, callback])`

-   `settings` {HTTP/2 объект настроек}
-   `callback` {Функция} Обратный вызов, который вызывается после подключения сессии или сразу же, если сессия уже подключена.
    -   `err` {Error|null}
    -   `settings` {HTTP/2 Settings Object} Обновленный объект `settings`.
    -   `duration` {integer}

Обновляет текущие локальные настройки для данной `Http2Session` и отправляет новый фрейм `SETTINGS` подключенному HTTP/2 peer.

После вызова свойство `http2session.pendingSettingsAck` будет иметь значение `true`, пока сессия ожидает подтверждения новых настроек от удаленного пира.

Новые настройки вступят в силу только после получения подтверждения `SETTINGS` и возникновения события `'localSettings'`. Можно отправить несколько кадров `SETTINGS`, пока ожидается подтверждение.

<!-- 0035.part.md -->

#### `http2session.type`

-   {число}

Значение `http2session.type` будет равно `http2.constants.NGHTTP2_SESSION_SERVER`, если данный экземпляр `Http2Session` является сервером, и `http2.constants.NGHTTP2_SESSION_CLIENT`, если экземпляр является клиентом.

<!-- 0036.part.md -->

#### `http2session.unref()`

Вызывает [`unref()`](net.md#socketunref) для данного экземпляра `Http2Session`, лежащего в основе [`net.Socket`](net.md#class-netsocket).

<!-- 0037.part.md -->

### Класс: `ServerHttp2Session`

-   Расширяет: {Http2Session}

<!-- 0038.part.md -->

#### `serverhttp2session.altsvc(alt, originOrStream)`

-   `alt` {string} Описание конфигурации альтернативной службы, как определено в [RFC 7838](https://tools.ietf.org/html/rfc7838).
-   `originOrStream` {number|string|URL|Object} Либо строка URL, указывающая происхождение (или `Object` со свойством `origin`), либо числовой идентификатор активного `Http2Stream`, заданный свойством `http2stream.id`.

Отправляет фрейм `ALTSVC` (как определено в [RFC 7838](https://tools.ietf.org/html/rfc7838)) подключенному клиенту.

```js
const http2 = require('node:http2');

const server = http2.createServer();
server.on('session', (session) => {
    // Устанавливаем altsvc для origin https://example.org:80
    session.altsvc('h2=":8000"', 'https://example.org:80');
});

server.on('stream', (stream) => {
    // Устанавливаем altsvc для определенного потока
    stream.session.altsvc('h2=":8000"', stream.id);
});
```

Отправка фрейма `ALTSVC` с определенным идентификатором потока указывает на то, что альтернативный сервис связан с происхождением данного `Http2Stream`.

Строки `alt` и origin _должны_ содержать только ASCII байты и строго интерпретируются как последовательность ASCII байтов. Специальное значение `'clear'` может быть передано для очистки любой ранее установленной альтернативной службы для данного домена.

Если в качестве аргумента `originOrStream` передана строка, она будет разобрана как URL и будет определено происхождение. Например, источником для HTTP URL `'https://example.org/foo/bar'` является ASCII строка `'https://example.org'`. Если заданная строка не может быть разобрана как URL или если не может быть выведено правильное происхождение, будет выдана ошибка.

Объект `URL` или любой объект со свойством `origin` может быть передан как `originOrStream`, в этом случае будет использовано значение свойства `origin`. Значение свойства `origin` _должно_ быть правильно сериализованным ASCII origin.

<!-- 0039.part.md -->

#### Указание альтернативных служб

Формат параметра `alt` строго определен [RFC 7838](https://tools.ietf.org/html/rfc7838) как ASCII-строка, содержащая список "альтернативных" протоколов, связанных с определенным хостом и портом, через запятую.

Например, значение `'h2="example.org:81"'` указывает, что протокол HTTP/2 доступен на хосте `'example.org'` на порту TCP/IP 81. Хост и порт _должны_ содержаться в кавычках (```).

Можно указать несколько альтернатив, например: `'h2="example.org:81", h2=":82"'`.

Идентификатор протокола (`'h2'` в примерах) может быть любым действительным [ALPN Protocol ID](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids).

Синтаксис этих значений не проверяется реализацией Node.js и передается как предоставленный пользователем или полученный от аналога.

<!-- 0040.part.md -->

#### `serverhttp2session.origin(...origins)`

-   `origins` { string | URL | Object } Одна или несколько строк URL, переданных в качестве отдельных аргументов.

Посылает фрейм `ORIGIN` (как определено в [RFC 8336](https://tools.ietf.org/html/rfc8336)) подключенному клиенту для рекламы набора источников, для которых сервер способен предоставлять авторитетные ответы.

```js
const http2 = require('node:http2');
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

Когда в качестве `origin` передается строка, она будет разобрана как URL, и из нее будет выведено происхождение. Например, источником для HTTP URL `'https://example.org/foo/bar'` является ASCII строка `'https://example.org'`. Если заданная строка не может быть разобрана как URL или если не может быть выведено правильное происхождение, будет выдана ошибка.

В качестве `оригинала` может быть передан объект `URL` или любой объект со свойством `origin`, в этом случае будет использовано значение свойства `origin`. Значение свойства `origin` _должно_ быть правильно сериализованным ASCII origin.

В качестве альтернативы, опцию `origins` можно использовать при создании нового HTTP/2 сервера с помощью метода `http2.createSecureServer()`:

```js
const http2 = require('node:http2');
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

<!-- 0041.part.md -->

### Класс: `ClientHttp2Session`

-   Расширяет: {Http2Session}

<!-- 0042.part.md -->

#### Событие: `'altsvc'`

-   `alt` {строка}
-   `origin` {string}
-   `streamId` {число}

Событие `'altsvc'` испускается всякий раз, когда клиент получает кадр `ALTSVC`. В событии указывается значение `ALTSVC`, происхождение и ID потока. Если в кадре `ALTSVC` не указан `origin`, то `origin` будет пустой строкой.

```js
const http2 = require('node:http2');
const client = http2.connect('https://example.org');

client.on('altsvc', (alt, origin, streamId) => {
    console.log(alt);
    console.log(origin);
    console.log(streamId);
});
```

<!-- 0043.part.md -->

#### Событие: `origin`

-   `origins` {string\[\]}

Событие `'origin'` генерируется каждый раз, когда клиент получает кадр `ORIGIN`. Событие испускается с массивом строк `origin`. Набор `http2session.originSet` будет обновлен, чтобы включить полученные оригиналы.

```js
const http2 = require('node:http2');
const client = http2.connect('https://example.org');

client.on('origin', (origins) => {
    for (let n = 0; n < origins.length; n++)
        console.log(origins[n]);
});
```

Событие `origin` испускается только при использовании безопасного TLS-соединения.

<!-- 0044.part.md -->

#### `clienthttp2session.request(headers[, options])`

-   `headers` {HTTP/2 Headers Object}

-   `options` {Объект}

    -   `endStream` {boolean} `true` если сторона `Http2Stream` _записываемая_ должна быть закрыта изначально, например, при отправке `GET` запроса, который не должен ожидать тела полезной нагрузки.
    -   `exclusive` {boolean} Когда `true` и `parent` идентифицирует родительский поток, создаваемый поток становится единственной прямой зависимостью родительского потока, а все остальные существующие зависимости становятся зависимыми от вновь созданного потока. **По умолчанию:** `false`.
    -   `parent` {number} Указывает числовой идентификатор потока, от которого зависит создаваемый поток.
    -   `weight` {число} Определяет относительную зависимость потока по отношению к другим потокам с тем же `родителями`. Значение - число от `1` до `256` (включительно).
    -   `waitForTrailers` {boolean} Если `true`, то `Http2Stream` будет выдавать событие `'wantTrailers'` после отправки последнего кадра `DATA`.
    -   `signal` {AbortSignal} Сигнал прерывания, который может быть использован для прерывания текущего запроса.

-   Возвращает: {ClientHttp2Stream}

Только для экземпляров HTTP/2 Client `Http2Session`, `http2session.request()` создает и возвращает экземпляр `Http2Stream`, который может быть использован для отправки HTTP/2 запроса на подключенный сервер.

Когда `ClientHttp2Session` создается впервые, сокет может быть еще не подключен. Если в это время вызывается `clienthttp2session.request()`, фактический запрос будет отложен до тех пор, пока сокет не будет готов к работе. Если `сессия` будет закрыта до выполнения фактического запроса, будет выброшена ошибка `ERR_HTTP2_GOAWAY_SESSION`.

Этот метод доступен, только если `http2session.type` равен `http2.constants.NGHTTP2_SESSION_CLIENT`.

```js
const http2 = require('node:http2');
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
        /* ... */
    });
    req.on('end', () => {
        /* ... */
    });
});
```

Когда опция `options.waitForTrailers` установлена, событие `'wantTrailers'` испускается сразу после постановки в очередь последнего куска данных полезной нагрузки для отправки. Метод `http2stream.sendTrailers()` может быть вызван для отправки заголовков в конце письма.

Когда параметр `options.waitForTrailers` установлен, `Http2Stream` не будет автоматически закрываться, когда будет передан последний кадр `DATA`. Пользовательский код должен вызвать либо `http2stream.sendTrailers()`, либо `http2stream.close()`, чтобы закрыть `Http2Stream`.

Если в `options.signal` установлен `AbortSignal`, а затем вызван `abort` на соответствующем `AbortController`, запрос выдаст событие `'error'` с ошибкой `AbortError`.

Псевдозаголовки `:method` и `:path` не указываются в `headers`, они соответственно имеют значение по умолчанию:

-   `:method` = `'GET'`.
-   `:path` = `/`

<!-- 0045.part.md -->

### Класс: `Http2Stream`

-   Расширяет: {stream.Duplex}

Каждый экземпляр класса `Http2Stream` представляет двунаправленный поток HTTP/2-коммуникаций через экземпляр `Http2Session`. Любой отдельный `Http2Session` может иметь до 2<sup>31</sup>-1 экземпляров `Http2Stream` за время своего существования.

Пользовательский код не будет создавать экземпляры `Http2Stream` напрямую. Скорее, они создаются, управляются и предоставляются пользовательскому коду через экземпляр `Http2Session`. На сервере экземпляры `Http2Stream` создаются либо в ответ на входящий HTTP-запрос (и передаются коду пользователя через событие `'stream'`), либо в ответ на вызов метода `http2stream.pushStream()`. На клиенте экземпляры `Http2Stream` создаются и возвращаются либо при вызове метода `http2session.request()`, либо в ответ на входящее событие `'push'`.

Класс `Http2Stream` является базой для классов [`ServerHttp2Stream`](#class-serverhttp2stream) и [`ClientHttp2Stream`](#class-clienthttp2stream), каждый из которых используется на стороне сервера или клиента соответственно.

Все экземпляры `Http2Stream` являются потоками [`Duplex`](stream.md#class-streamduplex). Сторона `Writable` потока `Duplex` используется для отправки данных подключенному аналогу, а сторона `Readable` используется для получения данных, отправленных подключенным аналогом.

Кодировка текстовых символов по умолчанию для `Http2Stream` - UTF-8. При использовании `Http2Stream` для отправки текста, используйте заголовок `'content-type'` для установки кодировки.

```js
stream.respond({
    'content-type': 'text/html; charset=utf-8',
    ':status': 200,
});
```

<!-- 0046.part.md -->

#### `Http2Stream` Lifecycle

<!-- 0047.part.md -->

##### Создание

На стороне сервера экземпляры [`ServerHttp2Stream`](#class-serverhttp2stream) создаются либо когда:

-   Получается новый кадр HTTP/2 `HEADERS` с ранее неиспользованным идентификатором потока;
-   Вызывается метод `http2stream.pushStream()`.

На стороне клиента экземпляры [`ClientHttp2Stream`](#class-clienthttp2stream) создаются при вызове метода `http2session.request()`.

На клиенте экземпляр `Http2Stream`, возвращаемый методом `http2session.request()`, может быть не сразу готов к использованию, если родительский `Http2Session` еще не полностью создан. В таких случаях операции, вызываемые на `Http2Stream`, будут буферизироваться до тех пор, пока не произойдет событие `'ready'`. Пользовательский код редко, если вообще когда-либо, должен обрабатывать событие `'ready'` непосредственно. Статус готовности `Http2Stream` можно определить, проверив значение `http2stream.id`. Если значение равно `undefined`, поток еще не готов к использованию.

<!-- 0048.part.md -->

##### Уничтожение

Все экземпляры [`Http2Stream`](#class-http2stream) уничтожаются либо когда:

-   кадр `RST_STREAM` для потока получен подключенным пиром, и (только для клиентских потоков) ожидающие данные были прочитаны.
-   Вызывается метод `http2stream.close()`, и (только для клиентских потоков) ожидающие данные были прочитаны.
-   Вызываются методы `http2stream.destroy()` или `http2session.destroy()`.

Когда экземпляр `Http2Stream` уничтожается, будет предпринята попытка отправить фрейм `RST_STREAM` подключенному пиру.

Когда экземпляр `Http2Stream` будет уничтожен, произойдет событие `'close'`. Поскольку `Http2Stream` является экземпляром `stream.Duplex`, событие `'end'` также будет выдано, если данные потока в настоящее время текут. Событие `'error'` также может быть вызвано, если `http2stream.destroy()` было вызвано с `Error`, переданным в качестве первого аргумента.

После уничтожения `Http2Stream` свойство `http2stream.destroyed` будет равно `true`, а свойство `http2stream.rstCode` будет указывать код ошибки `RST_STREAM`. После уничтожения экземпляр `Http2Stream` больше не может использоваться.

<!-- 0049.part.md -->

#### Событие: `'aborted'`

Событие `'aborted'` генерируется всякий раз, когда экземпляр `Http2Stream` аномально прерывается в середине коммуникации. Его слушатель не ожидает никаких аргументов.

Событие `'aborted'` будет испущено, только если записываемая сторона `Http2Stream` не была завершена.

<!-- 0050.part.md -->

#### Событие: `'close'`

Событие `'close'` происходит, когда `Http2Stream` уничтожается. После того, как это событие произошло, экземпляр `Http2Stream` больше не может использоваться.

Код ошибки HTTP/2, используемый при закрытии потока, можно получить с помощью свойства `http2stream.rstCode`. Если код имеет любое значение, отличное от `NGHTTP2_NO_ERROR` (`0`), то также будет выдано событие `'error`.

<!-- 0051.part.md -->

#### Событие: `error`

-   `error` {Ошибка}

Событие `'error'` генерируется, когда происходит ошибка во время обработки `Http2Stream`.

<!-- 0052.part.md -->

#### Событие: `FrameError`

-   `type` {integer} Тип кадра.
-   `code` {integer} Код ошибки.
-   `id` {integer} Идентификатор потока (или `0`, если кадр не связан с потоком).

Событие `'frameError'` генерируется при возникновении ошибки при попытке отправить кадр. При вызове функция-обработчик получает целочисленный аргумент, идентифицирующий тип кадра, и целочисленный аргумент, идентифицирующий код ошибки. Экземпляр `Http2Stream` будет уничтожен сразу после возникновения события `'frameError'`.

<!-- 0053.part.md -->

#### Событие: `'ready'`

Событие `'ready'` происходит, когда поток `Http2Stream` был открыт, ему был присвоен `id`, и его можно использовать. Слушатель не ожидает никаких аргументов.

<!-- 0054.part.md -->

#### Событие: `'timeout'`

Событие `'timeout'` происходит после того, как для данного `Http2Stream` не было получено никакой активности в течение количества миллисекунд, установленного с помощью `http2stream.setTimeout()`. Его слушатель не ожидает никаких аргументов.

<!-- 0055.part.md -->

#### Событие: `trailers`

-   `headers` {HTTP/2 Headers Object} Объект, описывающий заголовки
-   `flags` {число} Ассоциированные числовые флаги

Событие `'trailers'` генерируется, когда получен блок заголовков, связанных с полями заголовков в конце. Обратному вызову слушателя передается [HTTP/2 Headers Object](#headers-object) и флаги, связанные с заголовками.

Это событие может не произойти, если `http2stream.end()` вызывается до получения трейлеров и входящие данные не читаются и не прослушиваются.

```js
stream.on('trailers', (headers, flags) => {
    console.log(headers);
});
```

<!-- 0056.part.md -->

#### Событие: `'wantTrailers'`

Событие `'wantTrailers'` происходит, когда `Http2Stream` поставил в очередь последний кадр `DATA` для отправки в кадре и `Http2Stream` готов к отправке заголовков. При инициировании запроса или ответа для этого события должна быть установлена опция `waitForTrailers`.

<!-- 0057.part.md -->

#### `http2stream.aborted`

-   {boolean}

Устанавливается в `true`, если экземпляр `Http2Stream` был аномально прерван. Если установлено, то будет выдано событие `'aborted''.

<!-- 0058.part.md -->

#### `http2stream.bufferSize`

-   {число}

Это свойство показывает количество символов, буферизованных для записи. Подробности смотрите в [`net.Socket.bufferSize`](net.md#socketbuffersize).

<!-- 0059.part.md -->

#### `http2stream.close(code[, callback])`

-   `code` {number} Беззнаковое 32-битное целое число, идентифицирующее код ошибки. **По умолчанию:** `http2.constants.NGHTTP2_NO_ERROR` (`0x00`).
-   `callback` {Function} Необязательная функция, зарегистрированная для прослушивания события `'close'`.

Закрывает экземпляр `Http2Stream`, отправляя кадр `RST_STREAM` подключенному HTTP/2 peer.

<!-- 0060.part.md -->

#### `http2stream.closed`

-   {boolean}

Устанавливается в `true`, если экземпляр `Http2Stream` был закрыт.

<!-- 0061.part.md -->

#### `http2stream.destroyed`

-   {boolean}

Устанавливается в `true`, если экземпляр `Http2Stream` был уничтожен и больше не может использоваться.

<!-- 0062.part.md -->

#### `http2stream.endAfterHeaders`

-   {boolean}

Устанавливается в `true`, если в полученном кадре HEADERS запроса или ответа был установлен флаг `END_STREAM`, указывающий на то, что дополнительные данные не должны быть получены и читаемая сторона `Http2Stream` будет закрыта.

<!-- 0063.part.md -->

#### `http2stream.id`

-   {number|undefined}

Числовой идентификатор потока данного экземпляра `Http2Stream`. Устанавливается в `undefined`, если идентификатор потока еще не был назначен.

<!-- 0064.part.md -->

#### `http2stream.pending`

-   {boolean}

Устанавливается в `true`, если экземпляру `Http2Stream` еще не был присвоен числовой идентификатор потока.

<!-- 0065.part.md -->

#### `http2stream.priority(options)`

-   `options` {Object}
    -   `exclusive` {boolean} Когда `true` и `parent` идентифицирует родительский поток, этот поток становится единственной прямой зависимостью родительского потока, а все остальные существующие зависимые потоки становятся зависимыми от этого потока. **По умолчанию:** `false`.
    -   `parent` {number} Указывает числовой идентификатор потока, от которого зависит этот поток.
    -   `weight` {число} Определяет относительную зависимость потока по отношению к другим потокам с тем же `родителями`. Значение - число от `1` до `256` (включительно).
    -   `silent` {boolean} Если `true`, изменяет приоритет локально, не посылая кадр `PRIORITY` подключенному аналогу.

Обновляет приоритет для данного экземпляра `Http2Stream`.

<!-- 0066.part.md -->

#### `http2stream.rstCode`

-   {число}

Устанавливается в `RST_STREAM` [код ошибки] (#error-codes-for-rst_stream-and-goaway), сообщаемый при уничтожении `Http2Stream` после получения кадра `RST_STREAM` от подключенного пира, вызова `http2stream.close()` или `http2stream.destroy()`. Будет `не определено`, если `Http2Stream` не был закрыт.

<!-- 0067.part.md -->

#### `http2stream.sentHeaders`

-   {HTTP/2 Headers Object}

Объект, содержащий исходящие заголовки, отправленные для данного `Http2Stream`.

<!-- 0068.part.md -->

#### `http2stream.sentInfoHeaders`

-   {HTTP/2 Headers Object\[\]}

Массив объектов, содержащих исходящие информационные (дополнительные) заголовки, отправленные для данного `Http2Stream`.

<!-- 0069.part.md -->

#### `http2stream.sentTrailers`

-   {HTTP/2 Headers Object}

Объект, содержащий исходящие трейлеры, отправленные для данного `HttpStream`.

<!-- 0070.part.md -->

#### `http2stream.session`

-   {Http2Session}

Ссылка на экземпляр `Http2Session`, которому принадлежит данный `Http2Stream`. Значение будет `не определено` после уничтожения экземпляра `Http2Stream`.

<!-- 0071.part.md -->

#### `http2stream.setTimeout(msecs, callback)`

-   `msecs` {число}
-   `callback` {функция}

<!-- конец списка -->

```js
const http2 = require('node:http2');
const client = http2.connect('http://example.org:8000');
const { NGHTTP2_CANCEL } = http2.constants;
const req = client.request({ ':path': '/' });

// Отменяем поток, если нет активности через 5 секунд
req.setTimeout(5000, () => req.close(NGHTTP2_CANCEL));
```

<!-- 0072.part.md -->

#### `http2stream.state`

Предоставляет различную информацию о текущем состоянии `Http2Stream`.

-   {Object}
    -   `localWindowSize` {число} Количество байт, которое подключенный пир может отправить для данного `Http2Stream` без получения `WINDOW_UPDATE`.
    -   `state` {число} Флаг, указывающий на низкоуровневое текущее состояние `Http2Stream`, определенное `nghttp2`.
    -   `localClose` {number} `1`, если этот `Http2Stream` был закрыт локально.
    -   `remoteClose` {number} `1`, если этот `Http2Stream` был закрыт удаленно.
    -   `sumDependencyWeight` {number} Суммарный вес всех экземпляров `Http2Stream`, которые зависят от этого `Http2Stream`, как указано с помощью фреймов `PRIORITY`.
    -   `weight` {число} Приоритетный вес этого `Http2Stream`.

Текущее состояние этого `Http2Stream`.

<!-- 0073.part.md -->

#### `http2stream.sendTrailers(headers)`

-   `headers` {HTTP/2 Headers Object}

Отправляет трейлинг фрейма `HEADERS` подключенному аналогу HTTP/2. Этот метод приводит к немедленному закрытию `Http2Stream` и может быть вызван только после возникновения события `'wantTrailers`. При отправке запроса или ответа, опция `options.waitForTrailers` должна быть установлена для того, чтобы держать `Http2Stream` открытым после последнего кадра `DATA`, чтобы можно было отправить трейлеры.

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

Спецификация HTTP/1 запрещает трейлерам содержать поля псевдозаголовков HTTP/2 (например, `':method'`, `':path'` и т. д.).

<!-- 0074.part.md -->

### Класс: `ClientHttp2Stream`

-   Расширяет {Http2Stream}

Класс `ClientHttp2Stream` является расширением `Http2Stream`, который используется исключительно в HTTP/2 клиентах. Экземпляры `Http2Stream` на клиенте обеспечивают такие события, как `'response'` и `'push'`, которые актуальны только на клиенте.

<!-- 0075.part.md -->

#### Событие: `continue`

Выдается, когда сервер посылает статус `100 Continue`, обычно потому, что запрос содержит `Expect: 100-continue`. Это указание, что клиент должен отправить тело запроса.

<!-- 0076.part.md -->

#### Событие: `headers`

-   `headers` {HTTP/2 Headers Object}
-   `флаги` {число}

Событие `'headers'` возникает, когда для потока получен дополнительный блок заголовков, например, когда получен блок информационных заголовков `1xx`. Обратному вызову слушателя передается объект [HTTP/2 Headers Object](#headers-object) и флаги, связанные с заголовками.

```js
stream.on('headers', (headers, flags) => {
    console.log(headers);
});
```

<!-- 0077.part.md -->

#### Событие: `push`

-   `headers` {HTTP/2 Headers Object}
-   `флаги` {число}

Событие `'push'` возникает при получении заголовков ответа для потока Server Push. Обратному вызову слушателя передается объект [HTTP/2 Headers Object](#headers-object) и флаги, связанные с заголовками.

```js
stream.on('push', (headers, flags) => {
    console.log(headers);
});
```

<!-- 0078.part.md -->

#### Событие: `response`

-   `headers` {HTTP/2 Headers Object}
-   `флаги` {число}

Событие `'response'` испускается, когда для этого потока был получен кадр ответа `HEADERS` от подключенного HTTP/2 сервера. Слушатель вызывается с двумя аргументами: `Object`, содержащий полученный [HTTP/2 Headers Object](#headers-object), и флаги, связанные с заголовками.

```js
const http2 = require('node:http2');
const client = http2.connect('https://localhost');
const req = client.request({ ':path': '/' });
req.on('response', (headers, flags) => {
    console.log(headers[':status']);
});
```

<!-- 0079.part.md -->

### Класс: `ServerHttp2Stream`

-   Расширяет: {Http2Stream}

Класс `ServerHttp2Stream` является расширением [`Http2Stream`](#class-http2stream), который используется исключительно на HTTP/2 серверах. Экземпляры `Http2Stream` на сервере предоставляют дополнительные методы, такие как `http2stream.pushStream()` и `http2stream.respond()`, которые актуальны только на сервере.

<!-- 0080.part.md -->

#### `http2stream.additionalHeaders(headers)`

-   `headers` {HTTP/2 Headers Object}

Отправляет дополнительный информационный фрейм `HEADERS` подключенному HTTP/2 peer.

<!-- 0081.part.md -->

#### `http2stream.headersSent`

-   {boolean}

True, если заголовки были отправлены, false в противном случае (только для чтения).

<!-- 0082.part.md -->

#### `http2stream.pushAllowed`

-   {boolean}

Свойство только для чтения, отображаемое на флаг `SETTINGS_ENABLE_PUSH` последнего кадра `SETTINGS` удаленного клиента. Будет `true`, если удаленный пир принимает push-потоки, `false` в противном случае. Настройки одинаковы для каждого `Http2Stream` в одном и том же `Http2Session`.

<!-- 0083.part.md -->

#### `http2stream.pushStream(headers[, options], callback)`

-   `headers` {HTTP/2 Headers Object}
-   `options` {Объект}
    -   `exclusive` {boolean} Если `true` и `parent` указывает родительский поток, создаваемый поток становится единственной прямой зависимостью родительского потока, а все остальные существующие зависимости становятся зависимыми от вновь созданного потока. **По умолчанию:** `false`.
    -   `parent` {number} Указывает числовой идентификатор потока, от которого зависит создаваемый поток.
-   `callback` {функция} Обратный вызов, который будет вызван после того, как поток push будет инициирован.
    -   `err` {Ошибка}
    -   `pushStream` {ServerHttp2Stream} Возвращаемый объект `pushStream`.
    -   `headers` {HTTP/2 Headers Object} Объект заголовков, с которым был инициирован `pushStream`.

Инициирует поток push. Обратный вызов вызывается с новым экземпляром `Http2Stream`, созданным для потока push, переданным в качестве второго аргумента, или с `Error`, переданным в качестве первого аргумента.

```js
const http2 = require('node:http2');
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
    stream.end('некоторые данные');
});
```

Установка веса push-потока не разрешена во фрейме `HEADERS`. Передайте значение `weight` в `http2stream.priority` с опцией `silent`, установленной в `true`, чтобы включить балансировку полосы пропускания на стороне сервера между параллельными потоками.

Вызов `http2stream.pushStream()` изнутри проталкиваемого потока запрещен и приведет к ошибке.

<!-- 0084.part.md -->

#### `http2stream.respond([headers[, options]])`

-   `headers` {HTTP/2 Headers Object}
-   `options` {Объект}
    -   `endStream` {boolean} Устанавливается в `true`, чтобы указать, что ответ не будет включать данные полезной нагрузки.
    -   `waitForTrailers` {boolean} Если `true`, то `Http2Stream` будет выдавать событие `'wantTrailers'` после того, как будет отправлен последний кадр `DATA`.

<!-- конец списка -->

```js
const http2 = require('node:http2');
const server = http2.createServer();
server.on('stream', (stream) => {
    stream.respond({ ':status': 200 });
    stream.end('some data');
});
```

Инициирует ответ. Если установлена опция `options.waitForTrailers`, событие `'wantTrailers'` будет выдано сразу после постановки в очередь последнего куска данных полезной нагрузки для отправки. После этого метод `http2stream.sendTrailers()` может быть использован для отправки полей заголовков, идущих следом, пиру.

Когда параметр `options.waitForTrailers` установлен, `Http2Stream` не будет автоматически закрываться, когда будет передан последний кадр `DATA`. Пользовательский код должен вызвать либо `http2stream.sendTrailers()`, либо `http2stream.close()`, чтобы закрыть `Http2Stream`.

```js
const http2 = require('node:http2');
const server = http2.createServer();
server.on('stream', (stream) => {
    stream.respond(
        { ':status': 200 },
        { waitForTrailers: true }
    );
    stream.on('wantTrailers', () => {
        stream.sendTrailers({
            ABC: 'некоторое значение для отправки',
        });
    });
    stream.end('некоторые данные');
});
```

<!-- 0085.part.md -->

#### `http2stream.respondWithFD(fd[, headers[, options]])`

-   `fd` {number|FileHandle} Читаемый дескриптор файла.
-   `headers` {HTTP/2 Headers Object}
-   `options` {Объект}
    -   `statCheck` {Функция}
    -   `waitForTrailers` {boolean} Когда `true`, `Http2Stream` будет выдавать событие `'wantTrailers'` после того, как будет отправлен последний кадр `DATA`.
    -   `offset` {число} Позиция смещения, с которой следует начать чтение.
    -   `length` {number} Количество данных из fd для отправки.

Инициирует ответ, данные которого считываются из заданного дескриптора файла. Проверка заданного файлового дескриптора не производится. Если при попытке чтения данных с помощью дескриптора файла произойдет ошибка, `Http2Stream` будет закрыт с помощью кадра `RST_STREAM` со стандартным кодом `INTERNAL_ERROR`.

При использовании `Http2Stream` интерфейс `Duplex` объекта `Http2Stream` будет закрыт автоматически.

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

Необязательная функция `options.statCheck` может быть указана, чтобы дать возможность пользовательскому коду установить дополнительные заголовки содержимого, основываясь на деталях `fs.Stat` данного fd. Если указана функция `statCheck`, метод `http2stream.respondWithFD()` выполнит вызов `fs.fstat()` для сбора информации о предоставленном дескрипторе файла.

Опции `offset` и `length` могут быть использованы для ограничения ответа определенным подмножеством диапазона. Это может быть использовано, например, для поддержки запросов HTTP Range.

Дескриптор файла или `FileHandle` не закрывается при закрытии потока, поэтому его нужно будет закрыть вручную, когда он больше не нужен. Использование одного и того же файлового дескриптора одновременно для нескольких потоков не поддерживается и может привести к потере данных. Повторное использование дескриптора файла после завершения потока поддерживается.

Когда установлена опция `options.waitForTrailers`, событие `'wantTrailers` будет выдаваться сразу после постановки в очередь последнего куска данных полезной нагрузки для отправки. После этого метод `http2stream.sendTrailers()` может быть использован для отправки полей заголовков, идущих следом, пиру.

Если параметр `options.waitForTrailers` установлен, `Http2Stream` не будет автоматически закрываться, когда будет передан последний кадр `DATA`. Пользовательский код _должен_ вызвать либо `http2stream.sendTrailers()`, либо `http2stream.close()` для закрытия `Http2Stream`.

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

-   `path` {string|Buffer|URL}
-   `headers` {HTTP/2 Headers Object}
-   `options` {Объект}
    -   `statCheck` {Функция}
    -   `onError` {Функция} Функция обратного вызова, вызываемая в случае ошибки перед отправкой.
    -   `waitForTrailers` {boolean} Если `true`, то `Http2Stream` будет выдавать событие `'wantTrailers'` после отправки последнего кадра `DATA`.
    -   `offset` {число} Позиция смещения, с которой следует начать чтение.
    -   `length` {number} Количество данных из fd для отправки.

Отправляет обычный файл в качестве ответа. В `path` должен быть указан обычный файл, иначе на объект `Http2Stream` будет выдано событие `'error'`.

При использовании, интерфейс `Duplex` объекта `Http2Stream` будет автоматически закрыт.

Необязательная функция `options.statCheck` может быть указана, чтобы дать возможность пользовательскому коду установить дополнительные заголовки содержимого на основе данных `fs.Stat` данного файла:

Если при попытке чтения данных файла произойдет ошибка, `Http2Stream` будет закрыт с помощью фрейма `RST_STREAM` со стандартным кодом `INTERNAL_ERROR`. Если определен обратный вызов `onError`, то он будет вызван. В противном случае поток будет уничтожен.

Пример с использованием пути к файлу:

```js
const http2 = require('node:http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  function statCheck(stat, headers) {
    headers['last-modified'] = stat.mtime.toUTCString();
  }


  function onError(err) {
    // stream.respond() может бросить, если поток был уничтожен
    // другой стороной.
    try {
      if (err.code === 'ENOENT') {
        stream.respond({ ':status': 404 });
      } else {
        stream.respond({ ':status': 500 });
      }
    } catch (err) {
      // Выполняем фактическую обработку ошибок.
      console.error(err);
    }
    stream.end();
  }


  stream.respondWithFile('/some/file',
                         { 'content-type': 'text/plain; charset=utf-8' }
                         { statCheck, onError });
});
```

Функция `options.statCheck` может также использоваться для отмены операции отправки, возвращая `false`. Например, условный запрос может проверить результаты stat, чтобы определить, был ли файл изменен, и вернуть соответствующий ответ `304`:

```js
const http2 = require('node:http2');
const server = http2.createServer();
server.on('stream', (stream) => {
  function statCheck(stat, headers) {
    // Проверяем stat здесь...
    stream.respond({ ':status': 304 });
    return false; // Отмена операции отправки
  }
  stream.respondWithFile('/some/file',
                         { 'content-type': 'text/plain; charset=utf-8' }
                         { statCheck });
});
```

Поле заголовка `content-length` будет установлено автоматически.

Опции `offset` и `length` могут быть использованы для ограничения ответа определенным подмножеством диапазонов. Это может быть использовано, например, для поддержки запросов HTTP Range.

Функция `options.onError` также может быть использована для обработки всех ошибок, которые могут произойти до начала доставки файла. Поведением по умолчанию является уничтожение потока.

Если установлена опция `options.waitForTrailers`, событие `'wantTrailers` будет выдано сразу после постановки в очередь последнего куска данных полезной нагрузки для отправки. После этого метод `http2stream.sendTrailers()` может быть использован для отправки полей заголовков, идущих в хвосте, пиру.

Когда параметр `options.waitForTrailers` установлен, `Http2Stream` не будет автоматически закрываться, когда будет передан последний кадр `DATA`. Пользовательский код должен вызвать либо `http2stream.sendTrailers()`, либо `http2stream.close()`, чтобы закрыть `Http2Stream`.

```js
const http2 = require('node:http2');
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

<!-- 0087.part.md -->

### Класс: `Http2Server`

-   Расширяет: {net.Server}

Экземпляры `Http2Server` создаются с помощью функции `http2.createServer()`. Класс `Http2Server` не экспортируется напрямую модулем `node:http2`.

<!-- 0088.part.md -->

#### Событие: `'checkContinue'`

-   `запрос` {http2.Http2ServerRequest}
-   `ответ` {http2.Http2ServerResponse}

Если зарегистрирован слушатель [`'request'`](#event-request) или [`http2.createServer()`](#http2createserveroptions-onrequesthandler) снабжен функцией обратного вызова, событие `'checkContinue'` испускается каждый раз, когда получен запрос с HTTP `Expect: 100-continue`. Если это событие не прослушивается, сервер будет автоматически отвечать со статусом `100 Continue` в зависимости от ситуации.

Обработка этого события включает вызов [`response.writeContinue()`](#responsewritecontinue), если клиент должен продолжить отправку тела запроса, или генерацию соответствующего HTTP ответа (например, 400 Bad Request), если клиент не должен продолжать отправку тела запроса.

Когда это событие испущено и обработано, событие [`'request'`](#event-request) не будет испущено.

<!-- 0089.part.md -->

#### Событие: `connection`

-   `socket` {stream.Duplex}

Это событие возникает при установлении нового TCP-потока. `socket` обычно представляет собой объект типа [`net.Socket`] (net.md#class-netsocket). Обычно пользователи не хотят обращаться к этому событию.

Это событие также может быть явно вызвано пользователями для инъекции соединений в HTTP-сервер. В этом случае может быть передан любой поток [`Duplex`](stream.md#class-streamduplex).

<!-- 0090.part.md -->

#### Событие: `request`

-   `запрос` {http2.Http2ServerRequest}
-   `response` {http2.Http2ServerResponse}

Выдается при каждом запросе. В одной сессии может быть несколько запросов. См. [API совместимости] (#compatibility-api).

<!-- 0091.part.md -->

#### Событие: `session`

-   `session` {ServerHttp2Session}

Событие `'session'` испускается, когда новый `Http2Session` создается Http2Server'ом.

<!-- 0092.part.md -->

#### Событие: `sessionError`

-   `error` {Ошибка}
-   `session` {ServerHttp2Session}

Событие `'sessionError'` испускается, когда событие `'error'` испускается объектом `Http2Session`, связанным с `Http2Server`.

<!-- 0093.part.md -->

#### Событие: `stream`

-   `stream` {Http2Stream} Ссылка на поток
-   `headers` {HTTP/2 Headers Object} Объект, описывающий заголовки
-   `flags` {number} Соответствующие числовые флаги
-   `rawHeaders` {Array} Массив, содержащий имена необработанных заголовков, за которыми следуют их соответствующие значения.

Событие `'stream'` испускается, когда событие `'stream'` было испущено `Http2Session`, связанным с сервером.

См. также [событие `Http2Session` `'stream'`](#event-stream).

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
        [HTTP2_HEADER_CONTENT_TYPE]:
            'text/plain; charset=utf-8',
    });
    stream.write('hello ');
    stream.end('world');
});
```

<!-- 0094.part.md -->

#### Событие: `timeout`

Событие `'timeout'` происходит, когда на сервере нет активности в течение заданного количества миллисекунд, установленного с помощью `http2server.setTimeout()`. **По умолчанию:** 0 (таймаут отсутствует)

<!-- 0095.part.md -->

#### `server.close([callback])`

-   `callback` {Функция}

Прекращает создание сервером новых сессий. Это не препятствует созданию новых потоков запросов из-за постоянной природы сессий HTTP/2. Чтобы изящно завершить работу сервера, вызовите [`http2session.close()`](#http2sessionclosecallback) для всех активных сессий.

Если указан `callback`, он не будет вызван, пока все активные сессии не будут закрыты, хотя сервер уже перестал допускать новые сессии. Подробнее см. в [`net.Server.close()`](net.md#serverclosecallback).

<!-- 0096.part.md -->

#### `server.setTimeout([msecs][, callback])`

-   `msecs` {число} **По умолчанию:** 0 (без таймаута)
-   `callback` {функция}
-   Возвращает: {Http2Server}

Используется для установки значения тайм-аута для запросов http2-сервера и задает функцию обратного вызова, которая вызывается при отсутствии активности на `Http2Server` по истечении `msecs` миллисекунд.

Данный обратный вызов регистрируется как слушатель события `'timeout'`.

В случае, если `callback` не является функцией, будет выброшена новая ошибка `ERR_INVALID_ARG_TYPE`.

<!-- 0097.part.md -->

#### `server.timeout`

-   {number} Таймаут в миллисекундах. **По умолчанию:** 0 (таймаут отсутствует).

Количество миллисекунд бездействия, после которого считается, что сокет завершил работу.

Значение `0` отключает таймаут для входящих соединений.

Логика таймаута сокета устанавливается при подключении, поэтому изменение этого значения влияет только на новые соединения с сервером, а не на существующие.

<!-- 0098.part.md -->

#### `server.updateSettings([settings])`

-   `settings` {HTTP/2 Settings Object}

Используется для обновления сервера с заданными настройками.

Выбрасывает `ERR_HTTP2_INVALID_SETTING_VALUE` для недопустимых значений `settings`.

Выбрасывает `ERR_INVALID_ARG_TYPE` для недопустимого аргумента `settings`.

<!-- 0099.part.md -->

### Класс: `Http2SecureServer`

-   Расширяет: {tls.Server}

Экземпляры `Http2SecureServer` создаются с помощью функции `http2.createSecureServer()`. Класс `Http2SecureServer` не экспортируется напрямую модулем `node:http2`.

<!-- 0100.part.md -->

#### Событие: `'checkContinue'`

-   `запрос` {http2.Http2ServerRequest}
-   `ответ` {http2.Http2ServerResponse}

Если зарегистрирован слушатель [`'request'`](#event-request) или [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler) снабжен функцией обратного вызова, событие `'checkContinue'` испускается каждый раз, когда получен запрос с HTTP `Expect: 100-continue`. Если это событие не прослушивается, сервер будет автоматически отвечать со статусом `100 Continue` в зависимости от ситуации.

Обработка этого события включает вызов [`response.writeContinue()`](#responsewritecontinue), если клиент должен продолжить отправку тела запроса, или генерацию соответствующего HTTP ответа (например, 400 Bad Request), если клиент не должен продолжать отправку тела запроса.

Когда это событие испущено и обработано, событие [`'request'`](#event-request) не будет испущено.

<!-- 0101.part.md -->

#### Событие: `connection`

-   `socket` {stream.Duplex}

Это событие возникает при установлении нового TCP-потока, до начала квитирования TLS. `socket` обычно представляет собой объект типа [`net.Socket`] (net.md#class-netsocket). Обычно пользователи не хотят обращаться к этому событию.

Это событие также может быть явно вызвано пользователями для инъекции соединений в HTTP-сервер. В этом случае может быть передан любой поток [`Duplex`](stream.md#class-streamduplex).

<!-- 0102.part.md -->

#### Событие: `request`

-   `запрос` {http2.Http2ServerRequest}
-   `response` {http2.Http2ServerResponse}

Выдается при каждом запросе. В одной сессии может быть несколько запросов. См. [API совместимости] (#compatibility-api).

<!-- 0103.part.md -->

#### Событие: `session`

-   `session` {ServerHttp2Session}

Событие `'session'` испускается, когда новый `Http2Session` создается сервером `Http2SecureServer`.

<!-- 0104.part.md -->

#### Событие: `sessionError`

-   `error` {Ошибка}
-   `session` {ServerHttp2Session}

Событие `'sessionError'` генерируется, когда объект `Http2Session`, связанный с `Http2SecureServer`, выдает событие `'error'`.

<!-- 0105.part.md -->

#### Событие: `stream`

-   `stream` {Http2Stream} Ссылка на поток
-   `headers` {HTTP/2 Headers Object} Объект, описывающий заголовки
-   `flags` {number} Соответствующие числовые флаги
-   `rawHeaders` {Array} Массив, содержащий имена необработанных заголовков, за которыми следуют их соответствующие значения.

Событие `'stream'` испускается, когда событие `'stream'` было испущено `Http2Session`, связанным с сервером.

См. также [событие `Http2Session` `'stream'`](#event-stream).

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
        [HTTP2_HEADER_CONTENT_TYPE]:
            'text/plain; charset=utf-8',
    });
    stream.write('hello ');
    stream.end('world');
});
```

<!-- 0106.part.md -->

#### Событие: `'timeout'`

Событие `'timeout'` происходит, когда на сервере нет активности в течение заданного количества миллисекунд, установленного с помощью `http2secureServer.setTimeout()`. **По умолчанию:** 2 минуты.

<!-- 0107.part.md -->

#### Событие: `unknownProtocol`

-   `socket` {stream.Duplex}

Событие `'unknownProtocol'` возникает, когда подключающийся клиент не может согласовать разрешенный протокол (т.е. HTTP/2 или HTTP/1.1). Обработчик события получает сокет для обработки. Если для этого события не зарегистрирован слушатель, соединение разрывается. Таймаут может быть указан с помощью опции `'unknownProtocolTimeout'`, передаваемой в [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler).

В ранних версиях Node.js это событие возникало, если `allowHTTP1` было `false` и во время квитирования TLS клиент либо не отправлял расширение ALPN, либо отправлял расширение ALPN, не включающее HTTP/2 (`h2`). Более новые версии Node.js выдают это событие только в том случае, если `allowHTTP1` равно `false` и клиент не отправляет расширение ALPN. Если клиент отправляет расширение ALPN, которое не включает HTTP/2 (или HTTP/1.1, если `allowHTTP1` равно `true`), квитирование TLS завершится неудачей, и безопасное соединение не будет установлено.

<!-- 0108.part.md -->

#### `server.close([callback])`

-   `callback` {Функция}

Прекращает создание сервером новых сессий. Это не препятствует созданию новых потоков запросов из-за постоянной природы сессий HTTP/2. Чтобы изящно завершить работу сервера, вызовите [`http2session.close()`](#http2sessionclosecallback) для всех активных сессий.

Если указан `callback`, он не будет вызван, пока все активные сессии не будут закрыты, хотя сервер уже перестал допускать новые сессии. Более подробную информацию смотрите в [`tls.Server.close()`](tls.md#serverclosecallback).

<!-- 0109.part.md -->

#### `server.setTimeout([msecs][, callback])`

-   `msecs` {число} **По умолчанию:** `120000` (2 минуты)
-   `callback` {функция}
-   Возвращает: {Http2SecureServer}

Используется для установки значения тайм-аута для запросов http2 secure server, и устанавливает функцию обратного вызова, которая вызывается, когда нет активности на `Http2SecureServer` после `msecs` миллисекунд.

Данный обратный вызов регистрируется как слушатель события `'timeout'`.

В случае, если `callback` не является функцией, будет выброшена новая ошибка `ERR_INVALID_ARG_TYPE`.

<!-- 0110.part.md -->

#### `server.timeout`

-   {number} Таймаут в миллисекундах. **По умолчанию:** 0 (таймаут отсутствует).

Количество миллисекунд бездействия, после которого считается, что сокет завершил работу.

Значение `0` отключает таймаут для входящих соединений.

Логика таймаута сокета устанавливается при подключении, поэтому изменение этого значения влияет только на новые соединения с сервером, а не на существующие.

<!-- 0111.part.md -->

#### `server.updateSettings([settings])`

-   `settings` {HTTP/2 Settings Object}

Используется для обновления сервера с заданными настройками.

Выбрасывает `ERR_HTTP2_INVALID_SETTING_VALUE` для недопустимых значений `settings`.

Выбрасывает `ERR_INVALID_ARG_TYPE` для недопустимого аргумента `settings`.

<!-- 0112.part.md -->

### `http2.createServer([options][, onRequestHandler])`

-   `options` {Object}
    -   `maxDeflateDynamicTableSize` {number} Устанавливает максимальный размер динамической таблицы для дефлирования полей заголовка. **По умолчанию:** `4Kib`.
    -   `maxSettings` {number} Устанавливает максимальное количество записей настроек в рамке `SETTINGS`. Минимальное допустимое значение - `1`. **По умолчанию:** `32`.
    -   `maxSessionMemory`{число} Задает максимальное количество памяти, которое разрешено использовать `Http2Session`. Значение выражается в количестве мегабайт, например, `1` равно 1 мегабайту. Минимально допустимое значение - `1`. Это ограничение, основанное на кредите, существующие `Http2Stream` могут привести к превышению этого ограничения, но новые экземпляры `Http2Stream` будут отклонены при превышении этого ограничения. Текущее количество сессий `Http2Stream`, текущее использование памяти таблиц сжатия заголовков, текущие данные в очереди на отправку, а также непринятые фреймы `PING` и `SETTINGS` учитываются в текущем лимите. **По умолчанию:** `10`.
    -   `maxHeaderListPairs` {number} Устанавливает максимальное количество записей заголовков. Это аналогично [`server.maxHeadersCount`](http.md#servermaxheaderscount) или [`request.maxHeadersCount`](http.md#requestmaxheaderscount) в модуле `node:http`. Минимальное значение - `4`. **По умолчанию:** `128`.
    -   `maxOutstandingPings` {number} Задает максимальное количество оставшихся непринятых пингов. **По умолчанию:** `10`.
    -   `maxSendHeaderBlockLength` {number} Устанавливает максимально допустимый размер сериализованного сжатого блока заголовков. Попытки отправить заголовки, превышающие этот предел, приведут к возникновению события `'frameError'', а поток будет закрыт и уничтожен. Хотя этот параметр устанавливает максимально допустимый размер для всего блока заголовков, `nghttp2`(внутренняя библиотека http2) имеет ограничение`65536` для каждой распакованной пары ключ/значение.
    -   `paddingStrategy` {number} Стратегия, используемая для определения количества прокладок для фреймов `HEADERS` и `DATA`. **По умолчанию:** `http2.constants.PADDING_STRATEGY_NONE`. Значение может быть одним из:
        -   `http2.constants.PADDING_STRATEGY_NONE`: Никакая прокладка не применяется.
        -   `http2.constants.PADDING_STRATEGY_MAX`: Применяется максимальное количество прокладок, определяемое внутренней реализацией.
        -   `http2.constants.PADDING_STRATEGY_ALIGNED`: Пытается применить достаточное количество прокладок, чтобы общая длина кадра, включая 9-байтовый заголовок, была кратна 8. Для каждого кадра существует максимально допустимое количество байт прокладок, которое определяется текущим состоянием и настройками управления потоком. Если этот максимум меньше, чем рассчитанное количество, необходимое для обеспечения выравнивания, используется максимум, и общая длина кадра не обязательно выравнивается по 8 байтам.
    -   `peerMaxConcurrentStreams` {number} Устанавливает максимальное количество одновременных потоков для удаленного пира, как если бы был получен кадр `SETTINGS`. Будет переопределено, если удаленный пир установит собственное значение для `maxConcurrentStreams`. **По умолчанию:** `100`.
    -   `maxSessionInvalidFrames` {целое число} Устанавливает максимальное количество недействительных кадров, которое будет допущено до закрытия сессии. **По умолчанию:** `1000`.
    -   `maxSessionRejectedStreams` {integer} Устанавливает максимальное количество отклоненных при создании потоков, которое будет допустимо до закрытия сессии. Каждый отказ связан с ошибкой `NGHTTP2_ENHANCE_YOUR_CALM`, которая должна сказать пиру больше не открывать потоки, поэтому продолжение открытия потоков рассматривается как признак неправильного поведения пира. **По умолчанию:** `100`.
    -   `settings` {HTTP/2 Settings Object} Начальные настройки для отправки удаленному пиру при подключении.
    -   `Http1IncomingMessage` {http.IncomingMessage} Определяет класс `IncomingMessage`, который будет использоваться для HTTP/1 fallback. Полезно для расширения оригинального `http.IncomingMessage`. **По умолчанию:** `http.IncomingMessage`.
    -   `Http1ServerResponse` {http.ServerResponse} Определяет класс `ServerResponse`, который будет использоваться для HTTP/1 fallback. Полезно для расширения оригинального `http.ServerResponse`. **По умолчанию:** `http.ServerResponse`.
    -   `Http2ServerRequest` {http2.Http2ServerRequest} Определяет класс `Http2ServerRequest` для использования. Полезен для расширения оригинального `Http2ServerRequest`. **По умолчанию:** `Http2ServerRequest`.
    -   `Http2ServerResponse` {http2.Http2ServerResponse} Определяет класс `Http2ServerResponse` для использования. Полезно для расширения оригинального `Http2ServerResponse`. **По умолчанию:** `Http2ServerResponse`.
    -   `unknownProtocolTimeout` {number} Определяет тайм-аут в миллисекундах, который сервер должен ждать, когда выдается [`неизвестный протокол`](#event-unknownprotocol). Если сокет не будет уничтожен к этому времени, сервер уничтожит его. **По умолчанию:** `10000`.
    -   ...: Может быть предоставлена любая опция [`net.createServer()`](net.md#netcreateserveroptions-connectionlistener).
-   `onRequestHandler` {Функция} См. [API совместимости](#compatibility-api).
-   Возвращает: {Http2Server}

Возвращает экземпляр `net.Server`, который создает и управляет экземплярами `Http2Session`.

Поскольку не существует браузеров, поддерживающих [незашифрованный HTTP/2](https://http2.github.io/faq/#does-http2-require-encryption), при взаимодействии с клиентами браузеров необходимо использовать [`http2.createSecureServer()`](#http2createsecureserveroptions-onrequesthandler).

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

<!-- 0113.part.md -->

### `http2.createSecureServer(options[, onRequestHandler])`

-   `options` {Object}
    -   `allowHTTP1` {boolean} Входящие клиентские соединения, не поддерживающие HTTP/2, будут понижены до HTTP/1.x, если установлено значение `true`. См. событие [`неизвестный протокол`](#event-unknownprotocol). См. [ALPN negotiation](#alpn-negotiation). **По умолчанию:** `false`.
    -   `maxDeflateDynamicTableSize` {number} Устанавливает максимальный размер динамической таблицы для дефлирования полей заголовка. **По умолчанию:** `4Kib`.
    -   `maxSettings` {number} Устанавливает максимальное количество записей настроек в рамке `SETTINGS`. Минимальное допустимое значение - `1`. **По умолчанию:** `32`.
    -   `maxSessionMemory`{число} Задает максимальное количество памяти, которое разрешено использовать `Http2Session`. Значение выражается в количестве мегабайт, например, `1` равно 1 мегабайту. Минимально допустимое значение - `1`. Это ограничение, основанное на кредите, существующие `Http2Stream` могут привести к превышению этого ограничения, но новые экземпляры `Http2Stream` будут отклонены при превышении этого ограничения. Текущее количество сессий `Http2Stream`, текущее использование памяти таблиц сжатия заголовков, текущие данные в очереди на отправку, а также непринятые фреймы `PING` и `SETTINGS` учитываются в текущем лимите. **По умолчанию:** `10`.
    -   `maxHeaderListPairs` {number} Устанавливает максимальное количество записей заголовков. Это аналогично [`server.maxHeadersCount`](http.md#servermaxheaderscount) или [`request.maxHeadersCount`](http.md#requestmaxheaderscount) в модуле `node:http`. Минимальное значение - `4`. **По умолчанию:** `128`.
    -   `maxOutstandingPings` {number} Задает максимальное количество оставшихся непринятых пингов. **По умолчанию:** `10`.
    -   `maxSendHeaderBlockLength` {number} Устанавливает максимально допустимый размер сериализованного сжатого блока заголовков. Попытки отправить заголовки, превышающие этот предел, приведут к возникновению события `'frameError'', а поток будет закрыт и уничтожен.
    -   `paddingStrategy` {number} Стратегия, используемая для определения количества вставки для фреймов `HEADERS` и `DATA`. **По умолчанию:** `http2.constants.PADDING_STRATEGY_NONE`. Значение может быть одним из:
    -   `http2.constants.PADDING_STRATEGY_NONE`: Никакие прокладки не применяются.
        -   `http2.constants.PADDING_STRATEGY_MAX`: Применяется максимальное количество прокладок, определяемое внутренней реализацией.
        -   `http2.constants.PADDING_STRATEGY_ALIGNED`: Пытается применить достаточное количество прокладок, чтобы общая длина кадра, включая 9-байтовый заголовок, была кратна 8. Для каждого кадра существует максимально допустимое количество байт прокладок, которое определяется текущим состоянием и настройками управления потоком. Если этот максимум меньше, чем рассчитанное количество, необходимое для обеспечения выравнивания, используется максимум, и общая длина кадра не обязательно выравнивается по 8 байтам.
    -   `peerMaxConcurrentStreams` {number} Устанавливает максимальное количество одновременных потоков для удаленного пира, как если бы был получен кадр `SETTINGS`. Будет переопределено, если удаленный пир установит собственное значение для `maxConcurrentStreams`. **По умолчанию:** `100`.
    -   `maxSessionInvalidFrames` {целое число} Устанавливает максимальное количество недействительных кадров, которое будет допущено до закрытия сессии. **По умолчанию:** `1000`.
    -   `maxSessionRejectedStreams` {integer} Устанавливает максимальное количество отклоненных при создании потоков, которое будет допустимо до закрытия сессии. Каждый отказ связан с ошибкой `NGHTTP2_ENHANCE_YOUR_CALM`, которая должна сказать пиру больше не открывать потоки, поэтому продолжение открытия потоков рассматривается как признак неправильного поведения пира. **По умолчанию:** `100`.
    -   `settings` {HTTP/2 Settings Object} Начальные настройки для отправки удаленному пиру при подключении.
    -   ...: Можно предоставить любые опции [`tls.createServer()`](tls.md#tlscreateserveroptions-secureconnectionlistener). Для серверов обычно требуются опции идентификации (`pfx` или `key`/`cert`).
    -   `origins` {string\[\]} Массив строк происхождения для отправки во фрейме `ORIGIN` сразу после создания новой серверной `Http2Session`.
    -   `unknownProtocolTimeout` {number} Определяет таймаут в миллисекундах, который сервер должен выждать, когда испускается событие [`'unknownProtocol'`](#event-unknownprotocol). Если сокет не будет уничтожен к этому времени, сервер уничтожит его. **По умолчанию:** `10000`.
-   `onRequestHandler` {Функция} См. [Compatibility API](#compatibility-api).
-   Возвращает: {Http2SecureServer}

Возвращает экземпляр `tls.Server`, который создает и управляет экземплярами `Http2Session`.

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

<!-- 0114.part.md -->

### `http2.connect(authority[, options][, listener])`

-   `authority` {string|URL} Удаленный HTTP/2 сервер, к которому необходимо подключиться. Он должен быть в виде минимального корректного URL с префиксом `http://` или `https://`, имени хоста и IP-порта (если используется порт не по умолчанию). Информация о пользователе (идентификатор пользователя и пароль), путь, строка запроса и детали фрагмента в URL будут проигнорированы.
-   `options` {Object}
    -   `maxDeflateDynamicTableSize` {number} Устанавливает максимальный размер динамической таблицы для дефлирования полей заголовка. **По умолчанию:** `4Kib`.
    -   `maxSettings` {number} Устанавливает максимальное количество записей настроек в рамке `SETTINGS`. Минимальное допустимое значение - `1`. **По умолчанию:** `32`.
    -   `maxSessionMemory`{число} Задает максимальное количество памяти, которое разрешено использовать `Http2Session`. Значение выражается в количестве мегабайт, например, `1` равно 1 мегабайту. Минимально допустимое значение - `1`. Это ограничение, основанное на кредите, существующие `Http2Stream` могут привести к превышению этого ограничения, но новые экземпляры `Http2Stream` будут отклонены при превышении этого ограничения. Текущее количество сессий `Http2Stream`, текущее использование памяти таблиц сжатия заголовков, текущие данные в очереди на отправку, а также непризнанные фреймы `PING` и `SETTINGS` учитываются в текущем лимите. **По умолчанию:** `10`.
    -   `maxHeaderListPairs` {number} Sets the maximum number of header entries. This is similar to [`server.maxHeadersCount`](http.md#servermaxheaderscount) or [`request.maxHeadersCount`](http.md#requestmaxheaderscount) in the `node:http` module. The minimum value is `1`. **Default:** `128`.
    -   `maxOutstandingPings` {number} Sets the maximum number of outstanding, unacknowledged pings. **Default:** `10`.
    -   `maxReservedRemoteStreams` {number} Sets the maximum number of reserved push streams the client will accept at any given time. Once the current number of currently reserved push streams exceeds reaches this limit, new push streams sent by the server will be automatically rejected. The minimum allowed value is 0. The maximum allowed value is 2<sup>32</sup>-1. A negative value sets this option to the maximum allowed value. **Default:** `200`.
    -   `maxSendHeaderBlockLength` {number} Sets the maximum allowed size for a serialized, compressed block of headers. Attempts to send headers that exceed this limit will result in a `'frameError'` event being emitted and the stream being closed and destroyed.
    -   `paddingStrategy` {number} Стратегия, используемая для определения количества вставки для фреймов `HEADERS` и `DATA`. **По умолчанию:** `http2.constants.PADDING_STRATEGY_NONE`. Значение может быть одним из:
        -   `http2.constants.PADDING_STRATEGY_NONE`: Никакая прокладка не применяется.
        -   `http2.constants.PADDING_STRATEGY_MAX`: Применяется максимальное количество прокладок, определяемое внутренней реализацией.
        -   `http2.constants.PADDING_STRATEGY_ALIGNED`: Попытка применить достаточное количество прокладок для того, чтобы общая длина кадра, включая

<!-- 0115.part.md -->

### `http2.constants`

<!-- 0116.part.md -->

#### Коды ошибок для `RST_STREAM` и `GOAWAY`

| Значение | Имя | Константа |
| --- | --- | --- |
| `0x00` | Ошибка отсутствует | `http2.constants.NGHTTP2_NO_ERROR` |
| `0x01` | Ошибка протокола | `http2.constants.NGHTTP2_PROTOCOL_ERROR` |
| `0x02` | Внутренняя ошибка | `http2.constants.NGHTTP2_INTERNAL_ERROR` |  |
| `0x03` | Ошибка контроля потока | `http2.constants.NGHTTP2_FLOW_CONTROL_ERROR` |  |
| `0x04` | Таймаут настроек | `http2.constants.NGHTTP2_SETTINGS_TIMEOUT` |  |
| `0x05` | Поток закрыт | `http2.constants.NGHTTP2_STREAM_CLOSED` |  |
| `0x06` | Ошибка размера кадра | `http2.constants.NGHTTP2_FRAME_SIZE_ERROR` |  |
| `0x07` | Отказанный поток | `http2.constants.NGHTTP2_REFUSED_STREAM` |  |
| `0x08` | Отмена | `http2.constants.NGHTTP2_CANCEL` |  |
|  | `0x09` | Ошибка сжатия | `http2.constants.NGHTTP2_COMPRESSION_ERROR` |  |
| `0x0a` | Ошибка соединения | `http2.constants.NGHTTP2_CONNECT_ERROR` |
|  | `0x0b` | Повышение спокойствия | `http2.constants.NGHTTP2_ENHANCE_YOUR_CALM` |  |
|  | `0x0c` | Недостаточная безопасность | `http2.constants.NGHTTP2_INADEQUATE_SECURITY` |  |
|  | `0x0d` | HTTP/1.1 Required | `http2.constants.NGHTTP2_HTTP_1_1_REQUIRED` |  |

Событие `'timeout'` происходит, когда на сервере нет активности в течение заданного количества миллисекунд, установленного с помощью `http2server.setTimeout()`.

<!-- 0117.part.md -->

### `http2.getDefaultSettings()`

-   Возвращает: {HTTP/2 Settings Object}

Возвращает объект, содержащий настройки по умолчанию для экземпляра `Http2Session`. Этот метод возвращает новый экземпляр объекта при каждом вызове, поэтому возвращаемые экземпляры могут быть безопасно изменены для использования.

<!-- 0118.part.md -->

### `http2.getPackedSettings([settings])`

-   `settings` {HTTP/2 Объект настроек}
-   Возвращает: {Буфер}

Возвращает экземпляр `Buffer`, содержащий сериализованное представление заданных настроек HTTP/2, как указано в спецификации [HTTP/2](https://tools.ietf.org/html/rfc7540). Предназначен для использования с полем заголовка `HTTP2-Settings`.

```js
const http2 = require('node:http2');

const packed = http2.getPackedSettings({
    enablePush: false,
});

console.log(packed.toString('base64'));
// Печатает: AAIAAAAAAA
```

<!-- 0119.part.md -->

### `http2.getUnpackedSettings(buf)`

-   `buf` {Buffer|TypedArray} Упакованные настройки.
-   Возвращает: {HTTP/2 Settings Object}

Возвращает [HTTP/2 Settings Object](#settings-object), содержащий десериализованные настройки из данного `Buffer`, сгенерированные `http2.getPackedSettings()`.

<!-- 0120.part.md -->

### `http2.sensitiveHeaders`

-   {символ}

Этот символ может быть установлен как свойство объекта HTTP/2 headers со значением массива, чтобы предоставить список заголовков, считающихся чувствительными. Более подробную информацию смотрите в [Sensitive headers](#sensitive-headers).

<!-- 0121.part.md -->

### Объект заголовков

Заголовки представляются как собственные свойства объектов JavaScript. Ключи свойств будут сериализованы в нижний регистр. Значения свойств должны быть строками (если это не так, они будут принудительно преобразованы в строки) или `массивом` строк (чтобы отправить более одного значения для каждого поля заголовка).

```js
const headers = {
    ':status': '200',
    'content-type': 'text-plain',
    ABC: ['has', 'more', 'than', 'one', 'value'],
};

stream.respond(headers);
```

Объекты заголовков, передаваемые в функции обратного вызова, будут иметь прототип `null`. Это означает, что обычные объектные методы JavaScript, такие как `Object.prototype.toString()` и `Object.prototype.hasOwnProperty()` не будут работать.

Для входящих заголовков:

-   Заголовок `:status` преобразуется в `number`.
-   Дубликаты `:status`, `:method`, `:authority`, `:scheme`, `:path`, `: protocol`, `age`, `authorization`, `access-control-allow-credentials`, `access-control-max-age`, `access-control-request-method`, `content-encoding`, `content-language`, `content-length`, `content-location`, `content-md5`, `content-range`, `content-type`, `date`, `dnt`, `etag`, `expires`, `from`, `host`, `if-match`, `if-modified-since`, `if-none-match`, `if-range`, `if-unmodified-since`, `last-modified`, `location`, `max-forwards`, `proxy-authorization`, `range`, `referer`, `retry-after`, `tk`, `upgrade-insecure-requests`, `user-agent` или `x-content-type-options` отбрасываются.
-   `set-cookie` всегда является массивом. Дубликаты добавляются в массив.
-   Для дублирующихся заголовков `cookie` значения объединяются с помощью ';'.
-   Для всех остальных заголовков значения объединяются с помощью ','.

<!-- конец списка -->

```js
const http2 = require('node:http2');
const server = http2.createServer();
server.on('stream', (stream, headers) => {
    console.log(headers[':path']);
    console.log(headers.ABC);
});
```

<!-- 0122.part.md -->

#### Чувствительные заголовки

Заголовки HTTP2 могут быть помечены как чувствительные, что означает, что алгоритм сжатия заголовков HTTP/2 никогда не будет их индексировать. Это может иметь смысл для заголовков с низкой энтропией, которые могут быть ценными для злоумышленника, например, `Cookie` или `Authorization`. Чтобы добиться этого, добавьте имя заголовка в свойство `[http2.sensitiveHeaders]` в виде массива:

```js
const headers = {
    ':status': '200',
    'content-type': 'text-plain',
    cookie: 'some-cookie',
    'other-sensitive-header': 'очень секретные данные',
    [http2.sensitiveHeaders]: [
        'cookie',
        'other-sensitive-header',
    ],
};

stream.respond(headers);
```

Для некоторых заголовков, таких как `Authorization` и короткие заголовки `Cookie`, этот флаг устанавливается автоматически.

Это свойство также устанавливается для полученных заголовков. Оно будет содержать имена всех заголовков, помеченных как чувствительные, включая те, которые были помечены таким образом автоматически.

<!-- 0123.part.md -->

### Объект настроек

API `http2.getDefaultSettings()`, `http2.getPackedSettings()`, `http2.createServer()`, `http2.createSecureServer()`, `http2session.settings()`, `http2session.localSettings` и `http2session.remoteSettings` либо возвращают, либо получают на вход объект, определяющий настройки конфигурации для объекта `Http2Session`. Эти объекты представляют собой обычные объекты JavaScript, содержащие следующие свойства.

-   `headerTableSize` {number} Specifies the maximum number of bytes used for header compression. The minimum allowed value is 0. The maximum allowed value is 2<sup>32</sup>-1. **Default:** `4096`.
-   `enablePush` {boolean} Указывает `true`, если HTTP/2 Push-потоки должны быть разрешены для экземпляров `Http2Session`. **По умолчанию:** `true`.
-   `initialWindowSize` {number} Specifies the _sender’s_ initial window size in bytes for stream-level flow control. The minimum allowed value is 0. The maximum allowed value is 2<sup>32</sup>-1. **Default:** `65535`.
-   `maxFrameSize` {number} Specifies the size in bytes of the largest frame payload. The minimum allowed value is 16,384. The maximum allowed value is 2<sup>24</sup>-1. **Default:** `16384`.
-   `maxConcurrentStreams` {number} Specifies the maximum number of concurrent streams permitted on an `Http2Session`. There is no default value which implies, at least theoretically, 2<sup>32</sup>-1 streams may be open concurrently at any given time in an `Http2Session`. The minimum value is 0. The maximum allowed value is 2<sup>32</sup>-1. **Default:** `4294967295`.
-   `maxHeaderListSize` {number} Specifies the maximum size (uncompressed octets) of header list that will be accepted. The minimum allowed value is 0. The maximum allowed value is 2<sup>32</sup>-1. **Default:** `65535`.
-   `maxHeaderSize` {число} Псевдоним для `maxHeaderListSize`.
-   `enableConnectProtocol`{boolean} Указывает `true`, если должен быть включен "Расширенный протокол соединения", определенный в [RFC 8441] (https://tools.ietf.org/html/rfc8441). Этот параметр имеет смысл только в том случае, если он отправлен сервером. После включения параметра `enableConnectProtocol` для данной `Http2Session`, он не может быть отключен. **По умолчанию:** `false`.

Все дополнительные свойства объекта настроек игнорируются.

<!-- 0124.part.md -->

### Обработка ошибок

Существует несколько типов ошибок, которые могут возникнуть при использовании модуля `node:http2`:

Ошибки валидации возникают, когда передан неверный аргумент, опция или значение настройки. О них всегда сообщает синхронный `throw`.

Ошибки состояния возникают, когда действие выполняется в неправильное время (например, попытка отправить данные в потоке после его закрытия). О них будет сообщено либо с помощью синхронного `throw`, либо через событие `'error'` на объектах `Http2Stream`, `Http2Session` или HTTP/2 Server, в зависимости от того, где и когда произошла ошибка.

Внутренние ошибки возникают, когда сессия HTTP/2 неожиданно завершается неудачей. О них будет сообщено через событие `'error'` на объектах `Http2Session` или HTTP/2 Server.

Ошибки протокола возникают при нарушении различных ограничений протокола HTTP/2. О них будет сообщено либо с помощью синхронного `throw`, либо через событие `'error'` на объектах `Http2Stream`, `Http2Session` или HTTP/2 Server, в зависимости от того, где и когда произошла ошибка.

<!-- 0125.part.md -->

### Обработка недопустимых символов в именах и значениях заголовков

В реализации HTTP/2 применяется более строгая обработка недопустимых символов в именах и значениях заголовков HTTP, чем в реализации HTTP/1.

Имена полей заголовков _нечувствительны к регистру_ и передаются по проводам строго в виде строк в нижнем регистре. API, предоставляемый Node.js, позволяет задавать имена заголовков в виде строк со смешанным регистром (например, `Content-Type`), но при передаче они будут преобразованы в строчные (например, `content-type`).

Имена полей заголовка _должны содержать только_ один или несколько из следующих символов ASCII: `a`-`z`, `A`-`Z`, `0`-`9`, `!`, `#`, `$`, `%`, `&`, `'`, `*`, `+`, `-`, `.`, `^`, `_`, `````(обратный знак),`|`и`~`.

Использование недопустимых символов в имени поля заголовка HTTP приведет к закрытию потока с сообщением об ошибке протокола.

Значения полей заголовков обрабатываются более мягко, но _не должны_ содержать символов новой строки или возврата каретки и _должны_ быть ограничены символами US-ASCII, согласно требованиям спецификации HTTP.

<!-- 0126.part.md -->

### Push streams на клиенте

Чтобы получать потоки на клиенте, установите слушателя для события `'stream'` на `ClientHttp2Session`:

```js
const http2 = require('node:http2');

const client = http2.connect('http://localhost');

client.on('stream', (pushedStream, requestHeaders) => {
    pushedStream.on('push', (responseHeaders) => {
        // Обработка заголовков ответа
    });
    pushedStream.on('data', (chunk) => {
        /* обрабатываем вталкиваемые данные */
    });
});

const req = client.request({ ':path': '/' });
```

<!-- 0127.part.md -->

### Поддержка метода `CONNECT`

Метод `CONNECT` используется для того, чтобы позволить HTTP/2 серверу использоваться в качестве прокси для TCP/IP соединений.

Простой TCP-сервер:

```js
const net = require('node:net');

const server = net.createServer((socket) => {
    let name = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => (name += chunk));
    socket.on('end', () => socket.end(`hello ${name}`));
});

server.listen(8000);
```

HTTP/2 CONNECT прокси:

```js
const http2 = require('node:http2');
const { NGHTTP2_REFUSED_STREAM } = http2.constants;
const net = require('node:net');

const proxy = http2.createServer();
proxy.on('stream', (stream, headers) => {
    if (headers[':method'] !== 'CONNECT') {
        // Принимать только запросы CONNECT
        stream.close(NGHTTP2_REFUSED_STREAM);
        return;
    }
    const auth = new URL(`tcp://${headers[':authority']}`);
    // Очень хорошая идея проверить, что имя хоста и порт являются.
    // к которым должен подключаться этот прокси.
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

Клиент HTTP/2 CONNECT:

```js
const http2 = require('node:http2');

const client = http2.connect('http://localhost:8001');

// Не следует указывать заголовки ':path' и ':scheme'
// для запросов CONNECT, иначе будет выдана ошибка.
const req = client.request({
    ':method': 'CONNECT',
    ':authority': 'localhost:8000',
});

req.on('response', (headers) => {
    console.log(
        headers[http2.constants.HTTP2_HEADER_STATUS]
    );
});
let data = '';
req.setEncoding('utf8');
req.on('data', (chunk) => (data += chunk));
req.on('end', () => {
    console.log(`Сервер говорит: ${data}`);
    client.close();
});
req.end('Jane');
```

<!-- 0128.part.md -->

### Расширенный протокол `CONNECT`

[RFC 8441](https://tools.ietf.org/html/rfc8441) определяет расширение "Extended CONNECT Protocol" для HTTP/2, которое может быть использовано для загрузки использования `Http2Stream` с помощью метода `CONNECT` в качестве туннеля для других коммуникационных протоколов (таких как WebSockets).

Использование расширенного протокола CONNECT включается серверами HTTP/2 с помощью параметра `enableConnectProtocol`:

```js
const http2 = require('node:http2');
const settings = { enableConnectProtocol: true };
const server = http2.createServer({ settings });
```

Как только клиент получает от сервера фрейм `SETTINGS`, указывающий на возможность использования расширенного CONNECT, он может отправлять запросы `CONNECT`, использующие псевдозаголовок `':protocol'` HTTP/2:

```js
const http2 = require('node:http2');
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

<!-- 0129.part.md -->

## API совместимости

Целью Compatibility API является обеспечение схожего с HTTP/1 опыта разработчика при использовании HTTP/2, что делает возможным разработку приложений, поддерживающих как [HTTP/1](http.md), так и HTTP/2. Этот API нацелен только на **публичный API** из [HTTP/1](http.md). Однако многие модули используют внутренние методы или состояние, и они _не поддерживаются_, поскольку это совершенно другая реализация.

Следующий пример создает HTTP/2 сервер, используя API совместимости:

```js
const http2 = require('node:http2');
const server = http2.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('ok');
});
```

Чтобы создать смешанный [HTTPS](https.md) и HTTP/2 сервер, обратитесь к разделу [ALPN negotiation](#alpn-negotiation). Обновление с не-tls серверов HTTP/1 не поддерживается.

API совместимости HTTP/2 состоит из [`Http2ServerRequest`](#class-http2http2serverrequest) и [`Http2ServerResponse`](#class-http2http2serverresponse). Они направлены на совместимость API с HTTP/1, но не скрывают различий между протоколами. Например, сообщение о статусе для HTTP-кодов игнорируется.

<!-- 0130.part.md -->

### ALPN negotiation

Переговоры ALPN позволяют поддерживать [HTTPS](https.md) и HTTP/2 через один и тот же сокет. Объекты `req` и `res` могут быть как HTTP/1, так и HTTP/2, и приложение **должно** ограничиться публичным API [HTTP/1](http.md) и определить, возможно ли использовать более продвинутые возможности HTTP/2.

В следующем примере создается сервер, поддерживающий оба протокола:

```js
const { createSecureServer } = require('node:http2');
const { readFileSync } = require('node:fs');

const cert = readFileSync('./cert.pem');
const key = readFileSync('./key.pem');

const server = createSecureServer(
    { cert, key, allowHTTP1: true },
    onRequest
).listen(4443);

function onRequest(req, res) {
    // Определяет, является ли это запрос HTTPS или HTTP/2
    const {
        socket: { alpnProtocol },
    } =
        req.httpVersion === '2.0'
            ? req.stream.session
            : req;
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

Событие `'request'` работает одинаково как на [HTTPS](https.md), так и на HTTP/2.

<!-- 0131.part.md -->

### Класс: `http2.Http2ServerRequest`

-   Расширяет: {stream.Readable}

Объект `Http2ServerRequest` создается [`http2.Server`](#class-http2server) или [`http2.SecureServer`](#class-http2secureserver) и передается в качестве первого аргумента в событие [`'request'`](#event-request). Он может быть использован для доступа к статусу запроса, заголовкам и данным.

<!-- 0132.part.md -->

#### Событие: `'aborted'`

Событие `'aborted'` генерируется всякий раз, когда экземпляр `Http2ServerRequest` аномально прерывается в середине коммуникации.

Событие `'aborted'` будет испущено только в том случае, если записываемая сторона `Http2ServerRequest` не была завершена.

<!-- 0133.part.md -->

#### Событие: `close`

Указывает, что базовый [`Http2Stream`](#class-http2stream) был закрыт. Как и `'end'`, это событие происходит только один раз для каждого ответа.

<!-- 0134.part.md -->

#### `request.aborted`

-   {boolean}

Свойство `request.aborted` будет иметь значение `true`, если запрос был прерван.

<!-- 0135.part.md -->

#### `request.authority`

-   {строка}

Поле псевдозаголовка полномочий запроса. Поскольку HTTP/2 позволяет запросам задавать либо `:authority`, либо `host`, это значение берется из `req.headers[':authority']`, если оно присутствует. В противном случае оно берется из `req.headers['host']`.

<!-- 0136.part.md -->

#### `request.complete`

-   {boolean}

Свойство `request.complete` будет равно `true`, если запрос был завершен, прерван или уничтожен.

<!-- 0137.part.md -->

#### `request.connection`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`request.socket`](#requestsocket).

-   {net.Socket|tls.TLSSocket}

См. [`request.socket`](#requestsocket).

<!-- 0138.part.md -->

#### `request.destroy([error])`

-   `error` {Error}

Вызывает `destroy()` на [`Http2Stream`](#class-http2stream), который получил [`Http2ServerRequest`](#class-http2http2serverrequest). Если указано `error`, то выдается событие `error` и `error` передается в качестве аргумента любым слушателям этого события.

Ничего не происходит, если поток уже был уничтожен.

<!-- 0139.part.md -->

#### `request.headers`

-   {Object}

Объект заголовков запроса/ответа.

Пары ключ-значение имен и значений заголовков. Имена заголовков записываются в нижнем регистре.

```js
// Выводит что-то вроде:
//
// { { 'user-agent': 'curl/7.22.0',
// host: '127.0.0.1:8000',
// accept: '*/*' }
console.log(request.headers);
```

См. [HTTP/2 Headers Object](#headers-object).

В HTTP/2 путь запроса, имя хоста, протокол и метод представлены в виде специальных заголовков с префиксом `:` (например, `':path'`). Эти специальные заголовки будут включены в объект `request.headers`. Необходимо следить за тем, чтобы случайно не изменить эти специальные заголовки, иначе могут возникнуть ошибки. Например, удаление всех заголовков из запроса приведет к возникновению ошибок:

```js
removeAllHeaders(request.headers);
assert(request.url); // Ошибка, потому что заголовок :path был удален
```

<!-- 0140.part.md -->

#### `request.httpVersion`

-   {string}

В случае запроса сервера, версия HTTP, отправленная клиентом. В случае ответа клиента - HTTP-версия подключившегося сервера. Возвращает `2.0`.

Также `message.httpVersionMajor` является первым целым числом, а `message.httpVersionMinor` - вторым.

<!-- 0141.part.md -->

#### `request.method`

-   {строка}

Метод запроса в виде строки. Только для чтения. Примеры: `GET`, `DELETE`.

<!-- 0142.part.md -->

#### `request.rawHeaders`

-   {string\[\]}

Список необработанных заголовков запроса/ответа в том виде, в котором они были получены.

Ключи и значения находятся в одном списке. Это _не_ список кортежей. Таким образом, четные смещения - это значения ключей, а нечетные смещения - связанные с ними значения.

Имена заголовков не выделяются нижним регистром, а дубликаты не объединяются.

```js
// Выводит что-то вроде:
//
// [ 'user-agent',
// 'this is invalid because there can be only one',
// 'User-Agent',
// 'curl/7.22.0',
// 'Host',
// '127.0.0.1:8000',
// 'ACCEPT',
// '*/*' ]
console.log(request.rawHeaders);
```

<!-- 0143.part.md -->

#### `request.rawTrailers`

-   {string\[\]}

Необработанные ключи и значения трейлеров запроса/ответа в том виде, в котором они были получены. Заполняется только при событии `'end'`.

<!-- 0144.part.md -->

#### `request.scheme`

-   {строка}

Поле псевдозаголовка схемы запроса, указывающее на часть схемы целевого URL.

<!-- 0145.part.md -->

#### `request.setTimeout(msecs, callback)`

-   `msecs` {число}
-   `callback` {функция}
-   Возвращает: {http2.Http2ServerRequest}

Устанавливает значение тайм-аута [`Http2Stream`](#class-http2stream) в `msecs`. Если указан обратный вызов, то он добавляется в качестве слушателя события `'timeout'` на объекте ответа.

Если к запросу, ответу или серверу не добавлен слушатель `'timeout'`, то [`Http2Stream`](#class-http2stream)уничтожаются по истечении времени. Если для событий `'timeout'' запроса, ответа или сервера назначен обработчик, то таймаут сокетов должен обрабатываться явно.

<!-- 0146.part.md -->

#### `request.socket`

-   {net.Socket|tls.TLSSocket}

Возвращает объект `Proxy`, который действует как `net.Socket` (или `tls.TLSSocket`), но применяет геттеры, сеттеры и методы, основанные на логике HTTP/2.

Свойства `destroyed`, `readable` и `writable` будут получены из `request.stream` и установлены в `request.stream`.

Методы `destroy`, `emit`, `end`, `on` и `once` будут вызываться на `request.stream`.

Метод `setTimeout` будет вызван на `request.stream.session`.

`pause`, `read`, `resume` и `write` будут вызывать ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`. Смотрите [`Http2Session` и сокеты](#http2session-and-sockets) для получения дополнительной информации.

Все остальные взаимодействия будут направлены непосредственно на сокет. При поддержке TLS используйте [`request.socket.getPeerCertificate()`](tls.md#tlssocketgetpeercertificatedetailed) для получения аутентификационных данных клиента.

<!-- 0147.part.md -->

#### `request.stream`

-   {Http2Stream}

Объект [`Http2Stream`](#class-http2stream), поддерживающий запрос.

<!-- 0148.part.md -->

#### `request.trailers`

-   {Object}

Объект трейлеров запроса/ответа. Заполняется только при событии `end`.

<!-- 0149.part.md -->

#### `request.url`

-   {строка}

Строка URL запроса. Содержит только тот URL, который присутствует в фактическом HTTP-запросе. Если запрос имеет вид:

```http
GET /status?name=ryan HTTP/1.1
Accept: text/plain
```

Тогда `request.url` будет:

```js
'/status?name=ryan';

```

Чтобы разобрать url на части, можно использовать `new URL()`:

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

<!-- 0150.part.md -->

### Класс: `http2.Http2ServerResponse`

-   Расширяет: {Stream}

Этот объект создается внутри HTTP-сервера, а не пользователем. Он передается в качестве второго параметра в событие [`'request'`](#event-request).

<!-- 0151.part.md -->

#### Событие: `close`

Указывает, что базовый [`Http2Stream`](#class-http2stream) был завершен до того, как [`response.end()`](#responseenddata-encoding-callback) был вызван или успел промыться.

<!-- 0152.part.md -->

#### Событие: `finish`

Вызывается, когда ответ был отправлен. Точнее, это событие возникает, когда последний сегмент заголовков и тела ответа был передан мультиплексированию HTTP/2 для передачи по сети. Это не означает, что клиент уже что-то получил.

После этого события для объекта ответа больше не будет испускаться никаких событий.

<!-- 0153.part.md -->

#### `response.addTrailers(headers)`

-   `headers` {Object}

Этот метод добавляет в ответ трейлинг-заголовки HTTP (заголовок, но в конце сообщения).

Попытка установить имя или значение поля заголовка, которое содержит недопустимые символы, приведет к возникновению [`TypeError`](errors.md#class-typeerror).

<!-- 0154.part.md -->

#### `response.connection`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`response.socket`](#responsesocket).

-   {net.Socket|tls.TLSSocket}

См. [`response.socket`](#responsesocket).

<!-- 0155.part.md -->

#### `response.createPushResponse(headers, callback)`

-   `headers` {HTTP/2 Headers Object} Объект, описывающий заголовки
-   `callback` {Функция} Вызывается после завершения `http2stream.pushStream()`, либо когда попытка создать проталкиваемый `Http2Stream` не удалась или была отклонена, либо состояние `Http2ServerRequest` закрыто до вызова метода `http2stream.pushStream()`.
    -   `err` {Ошибка}
    -   `res` {http2.Http2ServerResponse} Только что созданный объект `Http2ServerResponse`.

Вызывает [`http2stream.pushStream()`](#http2streampushstreamheaders-options-callback) с заданными заголовками и в случае успеха оборачивает заданный [`Http2Stream`](#class-http2stream) на вновь созданный `Http2ServerResponse` в качестве параметра обратного вызова. Когда `Http2ServerRequest` закрывается, обратный вызов вызывается с ошибкой `ERR_HTTP2_INVALID_STREAM`.

<!-- 0156.part.md -->

#### `response.end([data[, encoding]][, callback])`

-   `данные` {string|Buffer|Uint8Array}
-   `encoding` {string}
-   `callback` {функция}
-   Возвращает: {this}

Этот метод сигнализирует серверу, что все заголовки и тело ответа были отправлены; сервер должен считать это сообщение завершенным. Метод `response.end()` ДОЛЖЕН вызываться в каждом ответе.

Если указано `data`, это эквивалентно вызову [`response.write(data, encoding)`](http.md#responsewritechunk-encoding-callback), за которым следует `response.end(callback)`.

Если указан `callback`, он будет вызван, когда поток ответа будет завершен.

<!-- 0157.part.md -->

#### `response.finished`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`response.writableEnded`](#responsewritableended).

-   {boolean}

Булево значение, указывающее, завершен ли ответ. Начинается как `false`. После выполнения [`response.end()`](#responseenddata-encoding-callback) значение будет `true`.

<!-- 0158.part.md -->

#### `response.getHeader(name)`

-   `name` {string}
-   Возвращает: {string}

Считывает заголовок, который уже был поставлен в очередь, но не отправлен клиенту. Имя не чувствительно к регистру.

```js
const contentType = response.getHeader('content-type');
```

<!-- 0159.part.md -->

#### `response.getHeaderNames()`

-   Возвращает: {string\[\]}

Возвращает массив, содержащий уникальные имена текущих исходящих заголовков. Все имена заголовков пишутся в нижнем регистре.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = response.getHeaderNames();
// headerNames === ['foo', 'set-cookie']
```

<!-- 0160.part.md -->

#### `response.getHeaders()`

-   Возвращает: {Object}

Возвращает неглубокую копию текущих исходящих заголовков. Поскольку используется неглубокая копия, значения массива могут быть изменены без дополнительных вызовов различных методов модуля http, связанных с заголовками. Ключами возвращаемого объекта являются имена заголовков, а значениями - соответствующие значения заголовков. Все имена заголовков пишутся в нижнем регистре.

Объект, возвращаемый методом `response.getHeaders()`, _не_ прототипически наследует от JavaScript `Object`. Это означает, что типичные методы `Object`, такие как `obj.toString()`, `obj.hasOwnProperty()` и другие, не определены и _не будут работать_.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headers = response.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```

<!-- 0161.part.md -->

#### `response.hasHeader(name)`

-   `name` {string}
-   Возвращает: {boolean}

Возвращает `true`, если заголовок, обозначенный `name`, в настоящее время установлен в исходящих заголовках. Соответствие имени заголовка не чувствительно к регистру.

```js
const hasContentType = response.hasHeader('content-type');
```

<!-- 0162.part.md -->

#### `response.headersSent`

-   {boolean}

True, если заголовки были отправлены, false в противном случае (только для чтения).

<!-- 0163.part.md -->

#### `response.removeHeader(name)`

-   `name` {строка}

Удаляет заголовок, который был поставлен в очередь для неявной отправки.

```js
response.removeHeader('Content-Encoding');
```

<!-- 0164.part.md -->

#### `response.req`

-   {http2.Http2ServerRequest}

Ссылка на исходный объект HTTP2 `request`.

<!-- 0165.part.md -->

#### `response.sendDate`

-   {boolean}

При значении true заголовок Date будет автоматически сгенерирован и отправлен в ответ, если он еще не присутствует в заголовках. По умолчанию установлено значение true.

Этот параметр следует отключать только для тестирования; HTTP требует наличия заголовка Date в ответах.

<!-- 0166.part.md -->

#### `response.setHeader(name, value)`

-   `имя` {строка}
-   `value` {string|string\[\]}

Устанавливает одно значение заголовка для неявных заголовков. Если этот заголовок уже существует в отправляемых заголовках, его значение будет заменено. Используйте массив строк для отправки нескольких заголовков с одинаковым именем.

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

Попытка установить имя или значение поля заголовка, содержащее недопустимые символы, приведет к возникновению [`TypeError`](errors.md#class-typeerror).

Когда заголовки были установлены с помощью [`response.setHeader()`](#responsesetheadername-value), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), причем заголовки, переданные в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), будут иметь приоритет.

```js
// Возвращает content-type = text/plain
const server = http2.createServer((req, res) => {
    res.setHeader(
        'Content-Type',
        'text/html; charset=utf-8'
    );
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('ok');
});
```

<!-- 0167.part.md -->

#### `response.setTimeout(msecs[, callback])`

-   `msecs` {число}
-   `callback` {функция}
-   Возвращает: {http2.Http2ServerResponse}

Устанавливает значение тайм-аута [`Http2Stream`](#class-http2stream) в `msecs`. Если указан обратный вызов, то он добавляется в качестве слушателя события `'timeout'` для объекта ответа.

Если к запросу, ответу или серверу не добавлен слушатель `'timeout'`, то [`Http2Stream`](#class-http2stream)уничтожаются по истечении времени. Если для событий `'timeout'' запроса, ответа или сервера назначен обработчик, то таймаут сокетов должен обрабатываться явно.

<!-- 0168.part.md -->

#### `response.socket`

-   {net.Socket|tls.TLSSocket}

Возвращает объект `Proxy`, который действует как `net.Socket` (или `tls.TLSSocket`), но применяет геттеры, сеттеры и методы, основанные на логике HTTP/2.

Свойства `destroyed`, `readable` и `writable` будут получены из `response.stream` и установлены в `response.stream`.

Методы `destroy`, `emit`, `end`, `on` и `once` будут вызываться на `response.stream`.

Метод `setTimeout` будет вызван на `response.stream.session`.

`pause`, `read`, `resume` и `write` будут вызывать ошибку с кодом `ERR_HTTP2_NO_SOCKET_MANIPULATION`. Смотрите [`Http2Session` и сокеты](#http2session-and-sockets) для получения дополнительной информации.

Все остальные взаимодействия будут направлены непосредственно на сокет.

```js
const http2 = require('node:http2');
const server = http2
    .createServer((req, res) => {
        const ip = req.socket.remoteAddress;
        const port = req.socket.remotePort;
        res.end(
            `Ваш IP адрес ${ip} и ваш порт источника ${port}.`
        );
    })
    .listen(3000);
```

<!-- 0169.part.md -->

#### `response.statusCode`

-   {число}

При использовании неявных заголовков (без явного вызова [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers)) это свойство управляет кодом статуса, который будет отправлен клиенту, когда заголовки будут смыты.

```js
response.statusCode = 404;
```

После того, как заголовок ответа был отправлен клиенту, это свойство указывает на код статуса, который был отправлен.

<!-- 0170.part.md -->

#### `response.statusMessage`

-   {string}

Сообщение о статусе не поддерживается HTTP/2 (RFC 7540 8.1.2.4). Оно возвращает пустую строку.

<!-- 0171.part.md -->

#### `response.stream`

-   {Http2Stream}

Объект [`Http2Stream`](#class-http2stream), поддерживающий ответ.

<!-- 0172.part.md -->

#### `response.writableEnded`

-   {boolean}

Является `true` после вызова [`response.end()`](#responseenddata-encoding-callback). Это свойство не указывает, были ли данные выгружены, для этого используйте [`writable.writableFinished`](stream.md#writablewritablefinished).

<!-- 0173.part.md -->

#### `response.write(chunk[, encoding][, callback])`

-   `chunk` {string|Buffer|Uint8Array}
-   `encoding` {string}
-   `обратный вызов` {функция}
-   Возвращает: {boolean}

Если этот метод вызван и [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) не был вызван, он переключится в режим неявных заголовков и промоет неявные заголовки.

При этом отправляется фрагмент тела ответа. Этот метод может быть вызван несколько раз для предоставления последовательных частей тела.

В модуле `node:http` тело ответа опускается, если запрос является запросом HEAD. Аналогично, ответы `204` и `304` _не должны_ включать тело сообщения.

`chunk` может быть строкой или буфером. Если `chunk` является строкой, второй параметр указывает, как кодировать его в поток байтов. По умолчанию `кодировка` - `'utf8'`. Функция `callback` будет вызвана, когда этот кусок данных будет сброшен.

Это необработанное тело HTTP и не имеет ничего общего с многокомпонентными кодировками тела более высокого уровня, которые могут быть использованы.

При первом вызове [`response.write()`](#responsewritechunk-encoding-callback) клиенту будет отправлена буферизованная информация заголовка и первый фрагмент тела. При втором вызове [`response.write()`](#responsewritechunk-encoding-callback) Node.js предполагает, что данные будут передаваться потоком, и отправляет новые данные отдельно. То есть, ответ буферизируется до первого куска тела.

Возвращает `true`, если все данные были успешно переданы в буфер ядра. Возвращает `false`, если все данные или их часть были помещены в пользовательскую память. Когда буфер снова освободится, будет выдано сообщение `drain`.

<!-- 0174.part.md -->

#### `response.writeContinue()`

Отправляет клиенту статус `100 Continue`, указывающий на то, что тело запроса должно быть отправлено. См. событие [`'checkContinue'`](#event-checkcontinue) на `Http2Server` и `Http2SecureServer`.

<!-- 0175.part.md -->

#### `response.writeEarlyHints(hints)`

-   `hints` {Object}

Отправляет статус `103 Early Hints` клиенту с заголовком Link, указывая, что пользовательский агент может предварительно загрузить/отключить связанные ресурсы. Объект `hints` содержит значения заголовков, которые должны быть отправлены с сообщением ранних подсказок.

**Пример**

```js
const earlyHintsLink =
    '</styles.css>; rel=preload; as=style';
response.writeEarlyHints({
    link: earlyHintsLink,
});

const earlyHintsLinks = [
    '</styles.css>; rel=preload; as=style',
    '</scripts.js>; rel=preload; as=script',
];
response.writeEarlyHints({
    link: earlyHintsLinks,
});
```

<!-- 0176.part.md -->

#### `response.writeHead(statusCode[, statusMessage][, headers])`

-   `statusCode` {число}
-   `statusMessage` {строка}
-   `headers` {Object|Array}
-   Возвращает: {http2.Http2ServerResponse}

Отправляет заголовок ответа на запрос. Код статуса - это трехзначный код статуса HTTP, например `404`. Последний аргумент, `headers`, - это заголовки ответа.

Возвращает ссылку на `Http2ServerResponse`, так что вызовы могут быть объединены в цепочку.

Для совместимости с [HTTP/1](http.md), в качестве второго аргумента может быть передано человекочитаемое `statusMessage`. Однако, поскольку `statusMessage` не имеет никакого значения в HTTP/2, этот аргумент не будет иметь никакого эффекта и будет выдано предупреждение процесса.

```js
const body = 'hello world';
response.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain; charset=utf-8',
});
```

Длина `Content-Length` указывается в байтах, а не в символах. API `Buffer.byteLength()` может быть использован для определения количества байт в данной кодировке. При передаче исходящих сообщений Node.js не проверяет, равны или нет Content-Length и длина передаваемого тела. Однако при получении сообщений Node.js будет автоматически отклонять сообщения, если `Content-Length` не соответствует фактическому размеру полезной нагрузки.

Этот метод может быть вызван не более одного раза в сообщении до вызова [`response.end()`](#responseenddata-encoding-callback).

Если [`response.write()`](#responsewritechunk-encoding-callback) или [`response.end()`](#responseenddata-encoding-callback) будут вызваны до вызова этой функции, неявные/изменяемые заголовки будут вычислены и вызовут эту функцию.

Если заголовки были установлены с помощью [`response.setHeader()`](#responsesetheadername-value), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), причем заголовки, переданные в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), будут иметь приоритет.

```js
// Возвращает content-type = text/plain
const server = http2.createServer((req, res) => {
    res.setHeader(
        'Content-Type',
        'text/html; charset=utf-8'
    );
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
    });
    res.end('ok');
});
```

Попытка установить имя или значение поля заголовка, содержащее недопустимые символы, приведет к возникновению [`TypeError`](errors.md#class-typeerror).

<!-- 0177.part.md -->

## Сбор метрик производительности HTTP/2

API [Performance Observer](perf_hooks.md) можно использовать для сбора основных показателей производительности для каждого экземпляра `Http2Session` и `Http2Stream`.

```js
const { PerformanceObserver } = require('node:perf_hooks');

const obs = new PerformanceObserver((items) => {
    const entry = items.getEntries()[0];
    console.log(entry.entryType); // печатает 'http2'
    if (entry.name === 'Http2Session') {
        // запись содержит статистику о Http2Session
    } else if (entry.name === 'Http2Stream') {
        // Ввод содержит статистику о Http2Stream
    }
});
obs.observe({ entryTypes: ['http2'] });
```

Свойство `entryType` записи `PerformanceEntry` будет равно `'http2'`.

Свойство `name` `PerformanceEntry` будет равно либо `'Http2Stream'`, либо `'Http2Session'`.

Если `name` равно `Http2Stream`, то `PerformanceEntry` будет содержать следующие дополнительные свойства:

-   `bytesRead` {number} Количество байтов кадра `DATA`, полученных для данного `Http2Stream`.
-   `bytesWritten` {number} Количество байт кадра `DATA`, отправленных для этого `Http2Stream`.
-   `id` {number} Идентификатор связанного `Http2Stream`.
-   `timeToFirstByte` {number} Количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и получением первого `DATA` кадра.
-   `timeToFirstByteSent` {number} Количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и отправкой первого кадра `DATA`.
-   `timeToFirstHeader` {число} Количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и получением первого заголовка.

Если `name` равно `Http2Session`, то `PerformanceEntry` будет содержать следующие дополнительные свойства:

-   `bytesRead` {number} Количество байт, полученных для данного `Http2Session`.
-   `bytesWritten` {number} Количество отправленных байт для этой `Http2Session`.
-   `framesReceived` {number} Количество кадров HTTP/2, полученных `Http2Session`.
-   `framesSent` {number} Количество кадров HTTP/2, отправленных `Http2Session`.
-   `maxConcurrentStreams` {number} Максимальное количество потоков, одновременно открытых во время жизни `Http2Session`.
-   `pingRTT` {число} Количество миллисекунд, прошедших с момента передачи кадра `PING` и получения его подтверждения. Присутствует, только если кадр `PING` был отправлен на `Http2Session`.
-   `streamAverageDuration` {number} Средняя продолжительность (в миллисекундах) для всех экземпляров `Http2Stream`.
-   `streamCount` {number} Количество экземпляров `Http2Stream`, обработанных `Http2Session`.
-   `type` {string} Либо `сервер`, либо `клиент` для идентификации типа `Http2Session``.

<!-- 0178.part.md -->

## Примечание по поводу `:authority` и `host`

HTTP/2 требует, чтобы запросы содержали либо псевдозаголовок `:authority`, либо заголовок `host`. Предпочтите `:authority` при создании HTTP/2 запроса напрямую, и `host` при конвертации из HTTP/1 (например, в прокси).

API совместимости возвращается к `host`, если `:authority` отсутствует. Более подробную информацию смотрите в [`request.authority`](#requestauthority). Однако, если вы не используете API совместимости (или используете `req.headers` напрямую), вам необходимо реализовать любое поведение отката самостоятельно.

<!-- 0179.part.md -->
