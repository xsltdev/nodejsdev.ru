---
title: HTTP
description: Модуль node:http — клиент и сервер HTTP/1, агенты, запросы и ответы, потоковая передача
---

# HTTP

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль содержит клиент и сервер; подключается через `require('node:http')` (CommonJS) или `import * as http from 'node:http'` (ESM).

Интерфейсы HTTP в Node.js рассчитаны на возможности протокола, которые традиционно были неудобны. В частности, на крупные сообщения с возможным chunked-кодированием. Интерфейс не буферизует целиком запросы и ответы, чтобы пользователь мог передавать данные потоком.

Заголовки HTTP-сообщения задаются объектом вида:

```json
{
    "content-length": "123",
    "content-type": "text/plain",
    "connection": "keep-alive",
    "host": "example.com",
    "accept": "*/*"
}
```

Ключи приводятся к нижнему регистру. Значения не изменяются.

Чтобы охватить широкий спектр HTTP-приложений, API HTTP в Node.js намеренно низкоуровневое: оно занимается потоками и разбором сообщений. Сообщение делится на заголовки и тело, но сами заголовки и тело как семантика не разбираются.

Поведение при дублирующихся заголовках см. в [`message.headers`](#messageheaders).

«Сырые» заголовки в том виде, как пришли, хранятся в `rawHeaders` — массиве `[key, value, key2, value2, ...]`. Для примера выше объект заголовков мог бы иметь список `rawHeaders` такого вида:

```js
[
    'ConTent-Length',
    '123456',
    'content-LENGTH',
    '123',
    'content-type',
    'text/plain',
    'CONNECTION',
    'keep-alive',
    'Host',
    'example.com',
    'accepT',
    '*/*',
];
```

## Класс: `http.Agent` {#class-httpagent}

`Agent` управляет сохранением и повторным использованием соединений для HTTP-клиентов. Для пары хост/порт ведётся очередь запросов и переиспользуется одно сокетное соединение, пока очередь не опустеет; затем сокет уничтожают или помещают в пул для повторного использования к тем же хосту и порту. Уничтожение или пул зависят от опции `keepAlive` ([см. ниже](#new-agentoptions)).

У соединений в пуле включён TCP Keep-Alive, но сервер может закрыть простаивающее соединение — тогда оно убирается из пула и при новом запросе создаётся новое. Сервер может запретить несколько запросов на одном соединении — тогда соединение нельзя пулить и для каждого запроса оно создаётся заново. `Agent` всё равно отправит запросы, но каждый пойдёт по новому соединению.

Когда клиент или сервер закрывает соединение, оно удаляется из пула. Неиспользуемые сокеты в пуле получают `unref`, чтобы не держать процесс Node.js без активных запросов (см. [`socket.unref()`](net.md#socketunref)).

Рекомендуется вызывать [`destroy()`](#agentdestroy) у `Agent`, когда он больше не нужен: лишние сокеты расходуют ресурсы ОС.

Сокет исключается из агента при событии `'close'` или `'agentRemove'`. Чтобы держать один HTTP-запрос долго, не удерживая его в агенте, можно сделать так:

```js
http.get(options, (res) => {
    // Do stuff
}).on('socket', (socket) => {
    socket.emit('agentRemove');
});
```

Для одного запроса можно не использовать общий агент: опция `{agent: false}` у `http.get()` или `http.request()` создаёт одноразовый `Agent` с настройками по умолчанию.

`agent:false`:

```js
http.get(
    {
        hostname: 'localhost',
        port: 80,
        path: '/',
        agent: false, // Create a new agent just for this one request
    },
    (res) => {
        // Do stuff with response
    }
);
```

### `new Agent([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Набор настраиваемых опций агента. Может содержать поля:
    -   `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Сохранять сокеты даже при отсутствии невыполненных запросов, чтобы их можно было использовать для будущих запросов без повторного установления TCP-соединения. Не путать со значением `keep-alive` заголовка `Connection`. Заголовок `Connection: keep-alive` всегда отправляется при использовании агента, кроме случаев, когда заголовок `Connection` задан явно или когда опции `keepAlive` и `maxSockets` соответственно равны `false` и `Infinity` — тогда используется `Connection: close`. **По умолчанию:** `false`.
    -   `keepAliveMsecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) При использовании `keepAlive` задаёт [начальную задержку](net.md#socketsetkeepaliveenable-initialdelay) для пакетов TCP Keep-Alive. Игнорируется, если `keepAlive` равен `false` или `undefined`. **По умолчанию:** `1000`.
    -   `agentKeepAliveTimeoutBuffer` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды, вычитаемые из подсказки сервера `keep-alive: timeout=...` при определении времени истечения срока жизни сокета. Буфер помогает закрывать сокет агента чуть раньше сервера и снижает риск отправки запроса по сокету, который сервер вот-вот закроет. **По умолчанию:** `1000`.
    -   `maxSockets` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число сокетов на один хост. Если один хост открывает несколько параллельных соединений, каждый запрос использует новый сокет, пока не достигнуто значение `maxSockets`. Если соединений больше, чем `maxSockets`, лишние запросы ставятся в очередь ожидания и переходят в активное состояние, когда завершается существующее соединение. Так гарантируется не более `maxSockets` активных соединений с данного хоста в любой момент. **По умолчанию:** `Infinity`.
    -   `maxTotalSockets` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число сокетов по всем хостам вместе. Каждый запрос использует новый сокет, пока не достигнут предел. **По умолчанию:** `Infinity`.
    -   `maxFreeSockets` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число сокетов на хост, оставляемых в свободном состоянии. Учитывается только при `keepAlive: true`. **По умолчанию:** `256`.
    -   `scheduling` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Стратегия выбора следующего свободного сокета: `'fifo'` или `'lifo'`. Главное отличие: `'lifo'` берёт последний использованный сокет, `'fifo'` — наименее недавно использованный. При низкой частоте запросов `'lifo'` снижает риск взять сокет, уже закрытый сервером из‑за простоя. При высокой частоте `'fifo'` увеличивает число открытых сокетов, а `'lifo'` держит его минимальным. **По умолчанию:** `'lifo'`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут сокета в миллисекундах; задаётся при создании сокета.
    -   `proxyEnv` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Переменные окружения для настройки прокси. См. [встроенную поддержку прокси](#built-in-proxy-support). **По умолчанию:** `undefined`
        -   `HTTP_PROXY` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined URL прокси для HTTP-запросов. Если `undefined`, для HTTP прокси не используется.
        -   `HTTPS_PROXY` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined URL прокси для HTTPS-запросов. Если `undefined`, для HTTPS прокси не используется.
        -   `NO_PROXY` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Шаблоны конечных точек, для которых прокси не применяется.
        -   `http_proxy` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined То же, что `HTTP_PROXY`. Если заданы оба, имеет приоритет `http_proxy`.
        -   `https_proxy` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined То же, что `HTTPS_PROXY`. Если заданы оба, имеет приоритет `https_proxy`.
        -   `no_proxy` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined То же, что `NO_PROXY`. Если заданы оба, имеет приоритет `no_proxy`.
    -   `defaultPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт по умолчанию, если в запросе порт не указан. **По умолчанию:** `80`.
    -   `protocol` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Протокол для агента. **По умолчанию:** `'http:'`.

Также поддерживаются `options` из [`socket.connect()`](net.md#socketconnectoptions-connectlistener).

Чтобы изменить эти параметры, нужно создать собственный экземпляр [`http.Agent`](#class-httpagent).

=== "MJS"

    ```js
    import { Agent, request } from 'node:http';
    const keepAliveAgent = new Agent({ keepAlive: true });
    options.agent = keepAliveAgent;
    request(options, onResponseCallback);
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const keepAliveAgent = new http.Agent({ keepAlive: true });
    options.agent = keepAliveAgent;
    http.request(options, onResponseCallback);
    ```

### `agent.createConnection(options[, callback])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры соединения; формат см. в [`net.createConnection()`](net.md#netcreateconnectionoptions-connectlistener). Для пользовательских агентов этот объект передаётся в пользовательскую функцию `createConnection`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) (Необязательно, в основном для пользовательских агентов) Функция, которую должна вызвать реализация `createConnection` после создания сокета, в том числе при асинхронном создании.
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null Ошибка, если создать сокет не удалось.
    -   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex) Созданный сокет.
-   Возвращает: [`<stream.Duplex>`](stream.md#class-streamduplex) Созданный сокет. Возвращается реализацией по умолчанию или синхронной пользовательской `createConnection`. Если пользовательская реализация передаёт сокет через `callback` асинхронно, возвращаемое значение может не быть основным способом получить сокет.

Создаёт сокет/поток для HTTP-запросов.

По умолчанию поведение совпадает с [`net.createConnection()`](net.md#netcreateconnectionoptions-connectlistener): сокет создаётся синхронно и возвращается. Необязательный параметр `callback` в сигнатуре в этой реализации **не** используется.

Однако пользовательские агенты могут переопределить этот метод для большей гибкости, например чтобы создавать сокеты асинхронно. При переопределении `createConnection`:

1.  **Синхронное создание сокета**: переопределённый метод может вернуть сокет/поток напрямую.
2.  **Асинхронное создание сокета**: метод может принять `callback` и передать в него созданный сокет/поток (например `callback(null, newSocket)`). Если при создании сокета произошла ошибка, её следует передать первым аргументом в `callback` (например `callback(err)`).

Агент вызовет переданную функцию `createConnection` с `options` и этим внутренним `callback`. У колбэка, который предоставляет агент, сигнатура `(err, stream)`.

### `agent.keepSocketAlive(socket)`

-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Вызывается, когда `socket` отсоединён от запроса и может быть сохранён агентом `Agent`. Поведение по умолчанию:

```js
socket.setKeepAlive(true, this.keepAliveMsecs);
socket.unref();
return true;
```

Метод можно переопределить в подклассе `Agent`. Если метод возвращает ложное значение, сокет уничтожается вместо сохранения для следующего запроса.

Аргумент `socket` может быть экземпляром [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex).

### `agent.reuseSocket(socket, request)`

-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)
-   `request` [`<http.ClientRequest>`](#class-httpclientrequest)

Вызывается, когда `socket` привязан к `request` после сохранения из‑за опций keep-alive. Поведение по умолчанию:

```js
socket.ref();
```

Метод можно переопределить в подклассе `Agent`.

Аргумент `socket` может быть экземпляром [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex).

### `agent.destroy()`

Уничтожает все сокеты, которые сейчас использует агент.

Обычно это не требуется. Но если агент с включённым `keepAlive` больше не нужен, лучше явно завершить агент: иначе сокеты могут долго оставаться открытыми до закрытия сервером.

### `agent.freeSockets`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект с массивами сокетов, ожидающих использования агентом при включённом `keepAlive`. Не изменяйте.

Сокеты из `freeSockets` при `'timeout'` автоматически уничтожаются и удаляются из массива.

### `agent.getName([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Набор опций для формирования имени
    -   `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Доменное имя или IP сервера, которому адресуется запрос
    -   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт удалённого сервера
    -   `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный интерфейс для привязки при запросе
    -   `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Должно быть 4 или 6, если не `undefined`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает уникальное имя для набора опций запроса, чтобы определить, можно ли повторно использовать соединение. Для HTTP-агента это `host:port:localAddress` или `host:port:localAddress:family`. Для HTTPS-агента имя включает CA, cert, ciphers и другие параметры HTTPS/TLS, влияющие на повторное использование сокета.

### `agent.maxFreeSockets`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

По умолчанию `256`. Для агентов с включённым `keepAlive` задаёт максимальное число сокетов, оставляемых открытыми в свободном состоянии.

### `agent.maxSockets`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

По умолчанию `Infinity`. Определяет, сколько одновременных сокетов агент может держать на один origin. Origin — это значение, возвращаемое [`agent.getName()`](#agentgetnameoptions).

### `agent.maxTotalSockets`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

По умолчанию `Infinity`. Определяет, сколько одновременных сокетов может открыть агент в целом. В отличие от `maxSockets`, лимит распространяется на все origin.

### `agent.requests`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект с очередями запросов, ещё не назначенных на сокеты. Не изменяйте.

### `agent.sockets`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект с массивами сокетов, которые агент сейчас использует. Не изменяйте.

## Класс: `http.ClientRequest` {#class-httpclientrequest}

-   Наследует: [`<http.OutgoingMessage>`](http.md)

Этот объект создаётся внутри и возвращается из [`http.request()`](#httprequestoptions-callback). Это _текущий_ запрос, заголовок которого уже поставлен в очередь. Заголовок ещё можно менять через [`setHeader(name, value)`](#requestsetheadername-value), [`getHeader(name)`](#requestgetheadername), [`removeHeader(name)`](#requestremoveheadername). Фактический заголовок уйдёт с первым фрагментом данных или при вызове [`request.end()`](#requestenddata-encoding-callback).

Чтобы получить ответ, добавьте обработчик [`'response'`](#event-response) к объекту запроса. [`'response'`](#event-response) возникает, когда получены заголовки ответа; с одним аргументом — экземпляром [`http.IncomingMessage`](#class-httpincomingmessage).

Во время [`'response'`](#event-response) можно подписаться на объект ответа, в частности на `'data'`.

Если обработчик [`'response'`](#event-response) не добавлен, ответ полностью отбрасывается. Если же обработчик есть, данные ответа **нужно** потребить: вызывать `response.read()` при `'readable'`, или обработать `'data'`, или вызвать `.resume()`. Пока данные не прочитаны, `'end'` не произойдёт. Непрочитанные данные занимают память и могут привести к ошибке «process out of memory».

Для обратной совместимости `res` выдаёт `'error'` только если зарегистрирован обработчик `'error'`.

Задайте заголовок `Content-Length`, чтобы ограничить размер тела ответа. Если [`response.strictContentLength`](#responsestrictcontentlength) равен `true`, несоответствие значения `Content-Length` приведёт к `Error` с кодом [`'ERR_HTTP_CONTENT_LENGTH_MISMATCH'`](errors.md#err_http_content_length_mismatch).

`Content-Length` задаётся в байтах, не в символах. Для длины тела в байтах используйте [`Buffer.byteLength()`](buffer.md#static-method-bufferbytelengthstring-encoding).

### Событие: `'abort'`

!!!warning "Стабильность: 0 - Устарело"

    Вместо этого отслеживайте событие `'close'`.

Генерируется, когда клиент прервал запрос. Событие только при первом вызове `abort()`.

### Событие: `'close'`

Указывает, что запрос завершён или соединение оборвано преждевременно (до конца ответа).

### Событие: `'connect'`

-   `response` [`<http.IncomingMessage>`](#class-httpincomingmessage)
-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)
-   `head` [`<Buffer>`](buffer.md#buffer)

Генерируется при каждом ответе сервера на запрос с методом `CONNECT`. Если на событие не подписаны, у клиентов с методом `CONNECT` соединения закрываются.

К обработчику передаётся экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только не указан другой тип сокета, отличный от [net.Socket](net.md#class-netsocket).

Пример клиента и сервера с обработкой `'connect'`:

=== "MJS"

    ```js
    import { createServer, request } from 'node:http';
    import { connect } from 'node:net';
    import { URL } from 'node:url';

    // Create an HTTP tunneling proxy
    const proxy = createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('okay');
    });
    proxy.on('connect', (req, clientSocket, head) => {
      // Connect to an origin server
      const { port, hostname } = new URL(`http://${req.url}`);
      const serverSocket = connect(port || 80, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: Node.js-Proxy\r\n' +
                        '\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      });
    });

    // Now that proxy is running
    proxy.listen(1337, '127.0.0.1', () => {

      // Make a request to a tunneling proxy
      const options = {
        port: 1337,
        host: '127.0.0.1',
        method: 'CONNECT',
        path: 'www.google.com:80',
      };

      const req = request(options);
      req.end();

      req.on('connect', (res, socket, head) => {
        console.log('got connected!');

        // Make a request over an HTTP tunnel
        socket.write('GET / HTTP/1.1\r\n' +
                     'Host: www.google.com:80\r\n' +
                     'Connection: close\r\n' +
                     '\r\n');
        socket.on('data', (chunk) => {
          console.log(chunk.toString());
        });
        socket.on('end', () => {
          proxy.close();
        });
      });
    });
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const net = require('node:net');
    const { URL } = require('node:url');

    // Create an HTTP tunneling proxy
    const proxy = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('okay');
    });
    proxy.on('connect', (req, clientSocket, head) => {
      // Connect to an origin server
      const { port, hostname } = new URL(`http://${req.url}`);
      const serverSocket = net.connect(port || 80, hostname, () => {
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: Node.js-Proxy\r\n' +
                        '\r\n');
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      });
    });

    // Now that proxy is running
    proxy.listen(1337, '127.0.0.1', () => {

      // Make a request to a tunneling proxy
      const options = {
        port: 1337,
        host: '127.0.0.1',
        method: 'CONNECT',
        path: 'www.google.com:80',
      };

      const req = http.request(options);
      req.end();

      req.on('connect', (res, socket, head) => {
        console.log('got connected!');

        // Make a request over an HTTP tunnel
        socket.write('GET / HTTP/1.1\r\n' +
                     'Host: www.google.com:80\r\n' +
                     'Connection: close\r\n' +
                     '\r\n');
        socket.on('data', (chunk) => {
          console.log(chunk.toString());
        });
        socket.on('end', () => {
          proxy.close();
        });
      });
    });
    ```

### Событие: `'continue'`

Генерируется, когда сервер отправляет ответ HTTP `100 Continue`, обычно потому что в запросе был заголовок `Expect: 100-continue`. Это сигнал клиенту отправить тело запроса.

### Событие: `'finish'` {#event-finish}

Генерируется, когда запрос отправлен. Точнее, событие возникает, когда последняя часть заголовков и тела запроса передана ОС для передачи по сети. Это не значит, что сервер уже что-либо получил.

### Событие: `'information'`

-   `info` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `httpVersion` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `httpVersionMajor` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `httpVersionMinor` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `statusCode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `statusMessage` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `rawHeaders` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерируется, когда сервер отправляет промежуточный ответ 1xx (кроме 101 Upgrade). Обработчики получают объект с версией HTTP, кодом и текстом статуса, объектом заголовков «ключ–значение» и массивом сырых имён заголовков и значений.

=== "MJS"

    ```js
    import { request } from 'node:http';

    const options = {
      host: '127.0.0.1',
      port: 8080,
      path: '/length_request',
    };

    // Make a request
    const req = request(options);
    req.end();

    req.on('information', (info) => {
      console.log(`Got information prior to main response: ${info.statusCode}`);
    });
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    const options = {
      host: '127.0.0.1',
      port: 8080,
      path: '/length_request',
    };

    // Make a request
    const req = http.request(options);
    req.end();

    req.on('information', (info) => {
      console.log(`Got information prior to main response: ${info.statusCode}`);
    });
    ```

Статусы 101 Upgrade это событие не вызывают: они выходят из обычной цепочки запрос/ответ (WebSocket, обновление TLS на месте, HTTP/2). Для 101 Upgrade слушайте событие [`'upgrade'`](#event-upgrade).

### Событие: `'response'` {#event-response}

-   `response` [`<http.IncomingMessage>`](#class-httpincomingmessage)

Генерируется при получении ответа на этот запрос. Событие возникает только один раз.

### Событие: `'socket'`

-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Обработчику гарантированно передаётся экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только пользователь не задал другой тип сокета, не [net.Socket](net.md#class-netsocket).

### Событие: `'timeout'`

Генерируется при таймауте базового сокета из‑за простоя. Это лишь сигнал о простое; запрос нужно завершить вручную (например [`request.destroy()`](#requestdestroyerror)).

См. также [`request.setTimeout()`](#requestsettimeouttimeout-callback).

### Событие: `'upgrade'` {#event-upgrade}

-   `response` [`<http.IncomingMessage>`](#class-httpincomingmessage)
-   `stream` [`<stream.Duplex>`](stream.md#class-streamduplex)
-   `head` [`<Buffer>`](buffer.md#buffer)

Генерируется при каждом ответе сервера с обновлением протокола. Если на событие нет подписчиков и код ответа 101 Switching Protocols, у клиентов с заголовком upgrade соединения закрываются.

Обработчику гарантированно передаётся экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только пользователь не задал другой тип сокета, не [net.Socket](net.md#class-netsocket).

Пример пары клиент–сервер с обработкой события `'upgrade'`.

=== "MJS"

    ```js
    import http from 'node:http';
    import process from 'node:process';

    // Create an HTTP server
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('okay');
    });
    server.on('upgrade', (req, stream, head) => {
      stream.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                   'Upgrade: WebSocket\r\n' +
                   'Connection: Upgrade\r\n' +
                   '\r\n');

      stream.pipe(stream); // echo back
    });

    // Now that server is running
    server.listen(1337, '127.0.0.1', () => {

      // make a request
      const options = {
        port: 1337,
        host: '127.0.0.1',
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket',
        },
      };

      const req = http.request(options);
      req.end();

      req.on('upgrade', (res, stream, upgradeHead) => {
        console.log('got upgraded!');
        stream.end();
        process.exit(0);
      });
    });
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    // Create an HTTP server
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('okay');
    });
    server.on('upgrade', (req, stream, head) => {
      stream.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                   'Upgrade: WebSocket\r\n' +
                   'Connection: Upgrade\r\n' +
                   '\r\n');

      stream.pipe(stream); // echo back
    });

    // Now that server is running
    server.listen(1337, '127.0.0.1', () => {

      // make a request
      const options = {
        port: 1337,
        host: '127.0.0.1',
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket',
        },
      };

      const req = http.request(options);
      req.end();

      req.on('upgrade', (res, stream, upgradeHead) => {
        console.log('got upgraded!');
        stream.end();
        process.exit(0);
      });
    });
    ```

### `request.abort()`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`request.destroy()`](#requestdestroyerror).

Помечает запрос как прерываемый. Оставшиеся данные ответа отбрасываются, сокет уничтожается.

### `request.aborted`

!!!warning "Стабильность: 0 - Устарело"

    Проверяйте [`request.destroyed`](#requestdestroyed).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `request.aborted` равно `true`, если запрос был прерван.

### `request.connection`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`request.socket`](#requestsocket).

-   Тип: [`<stream.Duplex>`](stream.md#class-streamduplex)

См. [`request.socket`](#requestsocket).

### `request.cork()`

См. [`writable.cork()`](stream.md#writablecork).

### `request.end([data[, encoding]][, callback])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Завершает отправку запроса. Неотправленные части тела сбрасываются в поток. При chunked-режиме отправляется завершающая последовательность `'0\r\n\r\n'`.

Если указан `data`, это эквивалентно вызову [`request.write(data, encoding)`](#requestwritechunk-encoding-callback) с последующим `request.end(callback)`.

Если указан `callback`, он вызывается по завершении потока запроса.

### `request.destroy([error])`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Необязательная ошибка для события `'error'`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает запрос. При необходимости генерирует `'error'` и `'close'`. Оставшиеся данные ответа отбрасываются, сокет уничтожается.

Подробнее см. [`writable.destroy()`](stream.md#writabledestroyerror).

#### `request.destroyed`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`request.destroy()`](#requestdestroyerror).

См. [`writable.destroyed`](stream.md#writabledestroyed).

### `request.finished`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`request.writableEnded`](#requestwritableended).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `request.finished` равно `true`, если вызван [`request.end()`](#requestenddata-encoding-callback). `request.end()` вызывается автоматически, если запрос начат через [`http.get()`](#httpgetoptions-callback).

### `request.flushHeaders()`

Немедленно отправляет заголовки запроса.

По соображениям эффективности Node.js обычно буферизует заголовки до вызова `request.end()` или записи первого фрагмента данных, затем пытается объединить заголовки и данные в один TCP-пакет.

Обычно это желаемо (экономия round-trip), но не если первые данные уйдут намного позже. `request.flushHeaders()` отключает эту оптимизацию и «запускает» запрос.

### `request.getHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Читает заголовок запроса. Имя не чувствительно к регистру. Тип возвращаемого значения зависит от аргументов, переданных в [`request.setHeader()`](#requestsetheadername-value).

```js
request.setHeader('content-type', 'text/html');
request.setHeader(
    'Content-Length',
    Buffer.byteLength(body)
);
request.setHeader('Cookie', [
    'type=ninja',
    'language=javascript',
]);
const contentType = request.getHeader('Content-Type');
// 'contentType' is 'text/html'
const contentLength = request.getHeader('Content-Length');
// 'contentLength' is of type number
const cookie = request.getHeader('Cookie');
// 'cookie' is of type string[]
```

### `request.getHeaderNames()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив уникальных имён текущих исходящих заголовков. Все имена в нижнем регистре.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Cookie', ['foo=bar', 'bar=baz']);

const headerNames = request.getHeaderNames();
// headerNames === ['foo', 'cookie']
```

### `request.getHeaders()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает неглубокую копию текущих исходящих заголовков. При неглубоком копировании массивы в значениях можно менять без повторных вызовов методов модуля `http`. Ключи объекта — имена заголовков, значения — соответствующие значения заголовков. Все имена в нижнем регистре.

Объект, возвращаемый `request.getHeaders()`, _не_ наследует прототипически от JavaScript `Object`, поэтому обычные методы вроде `obj.toString()`, `obj.hasOwnProperty()` и т.п. не определены и _не сработают_.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Cookie', ['foo=bar', 'bar=baz']);

const headers = request.getHeaders();
// headers === { foo: 'bar', 'cookie': ['foo=bar', 'bar=baz'] }
```

### `request.getRawHeaderNames()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив уникальных имён текущих исходящих «сырых» заголовков. Регистр имён сохраняется таким, каким был задан.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = request.getRawHeaderNames();
// headerNames === ['Foo', 'Set-Cookie']
```

### `request.hasHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если заголовок с именем `name` сейчас есть среди исходящих. Сопоставление имени не чувствительно к регистру.

```js
const hasContentType = request.hasHeader('content-type');
```

### `request.maxHeadersCount`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2000`

Ограничивает максимальное число заголовков ответа. При `0` лимит не применяется.

### `request.path`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь запроса.

### `request.method`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метод запроса.

### `request.host`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост запроса.

### `request.protocol`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Протокол запроса.

### `request.removeHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Удаляет заголовок, уже заданный в объекте заголовков.

```js
request.removeHeader('Content-Type');
```

### `request.reusedSocket`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Отправляется ли запрос через повторно используемый сокет.

При отправке через агент с keep-alive базовый сокет может переиспользоваться. Если сервер закроет соединение в неудачный момент, клиент может получить `ECONNRESET`.

=== "MJS"

    ```js
    import http from 'node:http';
    const agent = new http.Agent({ keepAlive: true });

    // Server has a 5 seconds keep-alive timeout by default
    http
      .createServer((req, res) => {
        res.write('hello\n');
        res.end();
      })
      .listen(3000);

    setInterval(() => {
      // Adapting a keep-alive agent
      http.get('http://localhost:3000', { agent }, (res) => {
        res.on('data', (data) => {
          // Do nothing
        });
      });
    }, 5000); // Sending request on 5s interval so it's easy to hit idle timeout
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const agent = new http.Agent({ keepAlive: true });

    // Server has a 5 seconds keep-alive timeout by default
    http
      .createServer((req, res) => {
        res.write('hello\n');
        res.end();
      })
      .listen(3000);

    setInterval(() => {
      // Adapting a keep-alive agent
      http.get('http://localhost:3000', { agent }, (res) => {
        res.on('data', (data) => {
          // Do nothing
        });
      });
    }, 5000); // Sending request on 5s interval so it's easy to hit idle timeout
    ```

Зная, переиспользовался ли сокет, можно автоматически повторять запрос при ошибке.

=== "MJS"

    ```js
    import http from 'node:http';
    const agent = new http.Agent({ keepAlive: true });

    function retriableRequest() {
      const req = http
        .get('http://localhost:3000', { agent }, (res) => {
          // ...
        })
        .on('error', (err) => {
          // Check if retry is needed
          if (req.reusedSocket && err.code === 'ECONNRESET') {
            retriableRequest();
          }
        });
    }

    retriableRequest();
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const agent = new http.Agent({ keepAlive: true });

    function retriableRequest() {
      const req = http
        .get('http://localhost:3000', { agent }, (res) => {
          // ...
        })
        .on('error', (err) => {
          // Check if retry is needed
          if (req.reusedSocket && err.code === 'ECONNRESET') {
            retriableRequest();
          }
        });
    }

    retriableRequest();
    ```

### `request.setHeader(name, value)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Задаёт одно значение заголовка в объекте заголовков. Если заголовок уже есть среди отправляемых, значение заменяется. Для нескольких заголовков с одним именем передайте массив строк. Нестроковые значения сохраняются как есть, поэтому [`request.getHeader()`](#requestgetheadername) может вернуть не строку; при передаче по сети значения приводятся к строкам.

```js
request.setHeader('Content-Type', 'application/json');
```

or

```js
request.setHeader('Cookie', [
    'type=ninja',
    'language=javascript',
]);
```

Если значение — строка с символами вне кодировки `latin1`, будет выброшено исключение.

Чтобы передать символы UTF-8, закодируйте значение по стандарту [RFC 8187](https://www.rfc-editor.org/rfc/rfc8187.txt).

```js
const filename = 'Rock 🎵.txt';
request.setHeader(
    'Content-Disposition',
    `attachment; filename*=utf-8''${encodeURIComponent(
        filename
    )}`
);
```

### `request.setNoDelay([noDelay])`

-   `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

После назначения сокета запросу и установления соединения вызывается [`socket.setNoDelay()`](net.md#socketsetnodelaynodelay).

### `request.setSocketKeepAlive([enable][, initialDelay])`

-   `enable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `initialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

После назначения сокета запросу и установления соединения вызывается [`socket.setKeepAlive()`](net.md#socketsetkeepaliveenable-initialdelay).

### `request.setTimeout(timeout[, callback])`

-   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды до таймаута запроса.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция при таймауте; то же, что подписка на событие `'timeout'`.
-   Возвращает: [`<http.ClientRequest>`](#class-httpclientrequest)

После назначения сокета запросу и установления соединения вызывается [`socket.setTimeout()`](net.md#socketsettimeouttimeout-callback).

### `request.socket`

-   Тип: [`<stream.Duplex>`](stream.md#class-streamduplex)

Ссылка на базовый сокет. Обычно к свойству не обращаются: в частности, сокет не генерирует `'readable'` из‑за того, как парсер протокола привязан к сокету.

=== "MJS"

    ```js
    import http from 'node:http';
    const options = {
      host: 'www.google.com',
    };
    const req = http.get(options);
    req.end();
    req.once('response', (res) => {
      const ip = req.socket.localAddress;
      const port = req.socket.localPort;
      console.log(`Your IP address is ${ip} and your source port is ${port}.`);
      // Consume response object
    });
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const options = {
      host: 'www.google.com',
    };
    const req = http.get(options);
    req.end();
    req.once('response', (res) => {
      const ip = req.socket.localAddress;
      const port = req.socket.localPort;
      console.log(`Your IP address is ${ip} and your source port is ${port}.`);
      // Consume response object
    });
    ```

Свойство гарантированно является экземпляром класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только не задан другой тип сокета, не [net.Socket](net.md#class-netsocket).

### `request.uncork()`

См. [`writable.uncork()`](stream.md#writableuncork).

### `request.writableEnded`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`request.end()`](#requestenddata-encoding-callback). Не показывает, сброшены ли данные в ОС; для этого используйте [`request.writableFinished`](#requestwritablefinished).

### `request.writableFinished`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если все данные сброшены в нижележащую систему непосредственно перед событием [`'finish'`](#event-finish).

### `request.write(chunk[, encoding][, callback])`

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отправляет фрагмент тела. Метод можно вызывать многократно. Если `Content-Length` не задан, данные кодируются chunked transfer encoding, чтобы сервер знал конец тела; добавляется заголовок `Transfer-Encoding: chunked`. Для завершения запроса нужен вызов [`request.end()`](#requestenddata-encoding-callback).

Аргумент `encoding` необязателен и учитывается только для строкового `chunk`. По умолчанию `'utf8'`.

`callback` необязателен и вызывается после сброса этого фрагмента, если только фрагмент не пустой.

Возвращает `true`, если данные полностью сброшены в буфер ядра; `false`, если часть или всё осталось в пользовательской памяти. Когда буфер освободится, сгенерируется `'drain'`.

Вызов `write` с пустой строкой или буфером ничего не делает и ждёт следующих данных.

## Класс: `http.Server` {#class-httpserver}

-   Наследует: [`<net.Server>`](net.md#class-netserver)

### Событие: `'checkContinue'` {#event-checkcontinue}

-   `request` [`<http.IncomingMessage>`](#class-httpincomingmessage)
-   `response` [`<http.ServerResponse>`](#class-httpserverresponse)

Генерируется при каждом запросе с HTTP `Expect: 100-continue`. Если на событие нет подписчиков, сервер сам отвечает `100 Continue`, когда это уместно.

Обработка: вызвать [`response.writeContinue()`](#responsewritecontinue), если клиенту следует продолжить отправку тела, или сформировать подходящий HTTP-ответ (например 400 Bad Request), если тело отправлять не нужно.

Если событие обработано, событие [`'request'`](#event-request) не генерируется.

### Событие: `'checkExpectation'`

-   `request` [`<http.IncomingMessage>`](#class-httpincomingmessage)
-   `response` [`<http.ServerResponse>`](#class-httpserverresponse)

Генерируется при каждом запросе с заголовком HTTP `Expect`, значение которого не `100-continue`. Без обработчиков сервер сам отвечает `417 Expectation Failed`, когда это уместно.

Если событие обработано, событие [`'request'`](#event-request) не генерируется.

### Событие: `'clientError'`

-   `exception` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Если у клиентского соединения возникает `'error'`, оно передаётся сюда. Обработчик должен закрыть или уничтожить базовый сокет; при желании можно корректно ответить по HTTP вместо грубого разрыва. Сокет **нужно закрыть или уничтожить** до завершения обработчика.

Обработчику гарантированно передаётся экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только не задан другой тип сокета, не [net.Socket](net.md#class-netsocket).

Поведение по умолчанию — попытка закрыть сокет ответом HTTP `400 Bad Request` или `431 Request Header Fields Too Large` при ошибке [`HPE_HEADER_OVERFLOW`](errors.md#hpe_header_overflow). Если сокет не доступен для записи или уже отправлены заголовки привязанного [`http.ServerResponse`](#class-httpserverresponse), сокет сразу уничтожается.

`socket` — это [`net.Socket`](net.md#class-netsocket), с которого произошла ошибка.

=== "MJS"

    ```js
    import http from 'node:http';

    const server = http.createServer((req, res) => {
      res.end();
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.listen(8000);
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    const server = http.createServer((req, res) => {
      res.end();
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.listen(8000);
    ```

При `'clientError'` нет объектов `request` и `response`, поэтому любой HTTP-ответ (заголовки и тело) _нужно_ записать непосредственно в `socket`. Ответ должен быть корректным HTTP-сообщением.

`err` — экземпляр `Error` с двумя дополнительными полями:

-   `bytesParsed`: сколько байт пакета запроса Node.js, возможно, разобрал верно;
-   `rawPacket`: сырой пакет текущего запроса.

Иногда клиент уже получил ответ и/или сокет уничтожен (например при `ECONNRESET`). Перед записью в сокет лучше проверить, что он ещё доступен для записи.

```js
server.on('clientError', (err, socket) => {
    if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
    }

    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
```

### Событие: `'close'` {#event-close-2}

Генерируется при закрытии сервера.

### Событие: `'connect'` {#event-connect-2}

-   `request` [`<http.IncomingMessage>`](#class-httpincomingmessage) Аргументы HTTP-запроса, как в [`'request'`](#event-request)
-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex) Сетевой сокет между сервером и клиентом
-   `head` [`<Buffer>`](buffer.md#buffer) Первый пакет туннелируемого потока (может быть пустым)

Генерируется при каждом запросе метода HTTP `CONNECT`. Без обработчиков у клиентов с методом `CONNECT` соединения закрываются.

Обработчику гарантированно передаётся экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только не задан другой тип сокета, не [net.Socket](net.md#class-netsocket).

После события у сокета запроса не будет слушателя `'data'` — для приёма данных на сервер его нужно привязать вручную.

### Событие: `'connection'`

-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Генерируется при установлении нового TCP-потока. `socket` обычно — [`net.Socket`](net.md#class-netsocket). Обычно на событие не подписываются: сокет не генерирует `'readable'` из‑за привязки парсера. Тот же сокет доступен как `request.socket`.

Событие можно сгенерировать вручную, чтобы подставить соединение в HTTP-сервер; тогда можно передать любой поток [`Duplex`](stream.md#class-streamduplex).

Если здесь вызвать `socket.setTimeout()`, после обслуживания запроса таймаут заменяется на `server.keepAliveTimeout` (если оно не равно нулю).

Обработчику гарантированно передаётся экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только не задан другой тип сокета, не [net.Socket](net.md#class-netsocket).

### Событие: `'dropRequest'`

-   `request` [`<http.IncomingMessage>`](#class-httpincomingmessage) Аргументы HTTP-запроса, как в [`'request'`](#event-request)
-   `socket` [`<stream.Duplex>`](stream.md#class-streamduplex) Сетевой сокет между сервером и клиентом

Когда число запросов на сокете достигает порога `server.maxRequestsPerSocket`, сервер отбрасывает новые запросы и вместо этого генерирует `'dropRequest'`, затем отправляет клиенту `503`.

### Событие: `'request'` {#event-request}

-   `request` [`<http.IncomingMessage>`](#class-httpincomingmessage)
-   `response` [`<http.ServerResponse>`](#class-httpserverresponse)

Генерируется при каждом запросе. На одном соединении может быть несколько запросов (HTTP Keep-Alive).

### Событие: `'upgrade'` {#server-event-upgrade}

-   `request` [`<http.IncomingMessage>`](#class-httpincomingmessage) Аргументы HTTP-запроса, как в [`'request'`](#event-request)
-   `stream` [`<stream.Duplex>`](stream.md#class-streamduplex) Поток после обновления между сервером и клиентом
-   `head` [`<Buffer>`](buffer.md#buffer) Первый пакет обновлённого потока (может быть пустым)

Генерируется при принятии клиентского запроса на обновление HTTP. По умолчанию все такие запросы игнорируются (идут обычные `'request'`), пока на это событие не подписаться — тогда запросы принимаются (вместо `'request'` идёт `'upgrade'`, дальнейший обмен — через сырой поток). Точнее поведение задаёт опция сервера `shouldUpgradeCallback`.

Подписка необязательна; клиент не может настоять на смене протокола.

Если `shouldUpgradeCallback` принял обновление, но обработчика нет, сокет уничтожается и соединение для клиента сразу закрывается.

Редко у входящего запроса есть тело: оно разбирается как обычно, отдельно от потока обновления; «сырые» данные потока начинаются после тела. Чтение потока не блокируется ожиданием тела — чтение из потока само запускает поток тела. Если нужно прочитать тело, сделайте это (подпишитесь на `'data'`) до чтения из обновлённого потока.

Аргумент `stream` обычно — [net.Socket](net.md#class-netsocket) запроса; при наличии тела это может быть duplex. Сырое соединение — в [`request.socket`](#requestsocket) (экземпляр [net.Socket](net.md#class-netsocket), если не задан другой тип сокета).

### `server.close([callback])`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Прекращает приём новых соединений и закрывает все соединения с этим сервером, которые не отправляют запрос и не ждут ответа. См. [`net.Server.close()`](net.md#serverclosecallback).

```js
const http = require('node:http');

const server = http.createServer(
    { keepAliveTimeout: 60000 },
    (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(
            JSON.stringify({
                data: 'Hello World!',
            })
        );
    }
);

server.listen(8000);
// Close the server after 10 seconds
setTimeout(() => {
    server.close(() => {
        console.log(
            'server on port 8000 closed successfully'
        );
    });
}, 10000);
```

### `server.closeAllConnections()`

Закрывает все установленные HTTP(S)-соединения с этим сервером, в том числе активные (идёт запрос или ожидается ответ). Сокеты, обновлённые до другого протокола (WebSocket, HTTP/2 и т.д.), _не_ уничтожаются.

> Жёсткий способ закрыть всё; использовать осторожно. Вместе с `server.close` лучше вызывать этот метод _после_ `server.close`, чтобы избежать гонок, когда между вызовами появляются новые соединения.

```js
const http = require('node:http');

const server = http.createServer(
    { keepAliveTimeout: 60000 },
    (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(
            JSON.stringify({
                data: 'Hello World!',
            })
        );
    }
);

server.listen(8000);
// Close the server after 10 seconds
setTimeout(() => {
    server.close(() => {
        console.log(
            'server on port 8000 closed successfully'
        );
    });
    // Closes all connections, ensuring the server closes successfully
    server.closeAllConnections();
}, 10000);
```

### `server.closeIdleConnections()`

Закрывает все соединения с этим сервером, которые не отправляют запрос и не ждут ответа.

> Начиная с Node.js 19.0.0, вызывать этот метод вместе с `server.close`, чтобы «собрать» keep-alive соединения, не обязательно. Вреда не будет; метод полезен для обратной совместимости со старыми версиями. Вместе с `server.close` его лучше вызывать _после_ `server.close`, чтобы избежать гонок с новыми соединениями.

```js
const http = require('node:http');

const server = http.createServer(
    { keepAliveTimeout: 60000 },
    (req, res) => {
        res.writeHead(200, {
            'Content-Type': 'application/json',
        });
        res.end(
            JSON.stringify({
                data: 'Hello World!',
            })
        );
    }
);

server.listen(8000);
// Close the server after 10 seconds
setTimeout(() => {
    server.close(() => {
        console.log(
            'server on port 8000 closed successfully'
        );
    });
    // Closes idle connections, such as keep-alive connections. Server will close
    // once remaining active connections are terminated
    server.closeIdleConnections();
}, 10000);
```

### `server.headersTimeout`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** меньшее из [`server.requestTimeout`](#serverrequesttimeout) и `60000`.

Ограничивает время ожидания полных HTTP-заголовков парсером.

При истечении таймаута сервер отвечает `408`, не передаёт запрос в обработчик и закрывает соединение.

Следует задать ненулевое значение (например 120 с), чтобы снизить риск DoS, если перед сервером нет обратного прокси.

### `server.listen()`

Запускает прослушивание HTTP-соединений. Аналог [`server.listen()`](net.md#serverlisten) у [`net.Server`](net.md#class-netserver).

### `server.listening`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Принимает ли сервер соединения.

### `server.maxHeadersCount`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2000`

Ограничивает максимальное число входящих заголовков. При `0` лимит не применяется.

### `server.requestTimeout`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `300000`

Таймаут в миллисекундах на приём всего запроса от клиента.

При истечении сервер отвечает `408`, не вызывает обработчик запроса и закрывает соединение.

Нужно ненулевое значение (например 120 с) для защиты от DoS без обратного прокси.

### `server.setTimeout([msecs][, callback])`

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** 0 (без таймаута)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<http.Server>`](#class-httpserver)

Задаёт таймаут сокетов; при срабатывании на объекте `Server` генерируется `'timeout'` с сокетом в аргументе.

Если есть слушатель `'timeout'` на `Server`, он вызывается с истёкшим по таймауту сокетом.

По умолчанию сервер не задаёт таймаут сокетам; если есть колбэк на `'timeout'`, таймауты нужно обрабатывать явно.

### `server.maxRequestsPerSocket`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Запросов на сокет. **По умолчанию:** 0 (no limit)

Максимум запросов на одном сокете до закрытия keep-alive соединения.

`0` отключает лимит.

При достижении лимита в заголовке `Connection` будет `close`, но соединение само не закрывается; последующие запросы после лимита получат ответ `503 Service Unavailable`.

### `server.timeout`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** 0 (без таймаута)

Миллисекунды простоя, после которых сокет считается истёкшим по таймауту.

`0` отключает такое поведение для входящих соединений.

Логика таймаута задаётся при установлении соединения; смена значения влияет только на новые соединения.

### `server.keepAliveTimeout`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** `5000` (5 секунд).

Миллисекунды простоя, которые сервер ждёт новых входящих данных после отправки последнего ответа, прежде чем уничтожить сокет.

К этому значению добавляется [`server.keepAliveTimeoutBuffer`](#serverkeepalivetimeoutbuffer): `socketTimeout = keepAliveTimeout + keepAliveTimeoutBuffer`. Если до срабатывания keep-alive таймаута приходят новые данные, сбрасывается обычный таймаут простоя — [`server.timeout`](#servertimeout).

`0` отключает keep-alive таймаут на входящих соединениях. `0` делает поведение похожим на Node.js до 8.0.0, где keep-alive таймаута не было.

Смена значения влияет только на новые соединения.

### `server.keepAliveTimeoutBuffer`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** `1000` (1 секунда).

Дополнительный запас к [`server.keepAliveTimeout`](#serverkeepalivetimeout) для внутреннего таймаута сокета.

Уменьшает сбросы соединения (`ECONNRESET`), слегка увеличивая таймаут относительно объявленного keep-alive.

Учитывается только для новых входящих соединений.

### `server[Symbol.asyncDispose]()`

Вызывает [`server.close()`](#serverclosecallback) и возвращает промис, выполняющийся после закрытия сервера.

## Класс: `http.ServerResponse` {#class-httpserverresponse}

-   Наследует: [`<http.OutgoingMessage>`](http.md)

Объект создаётся внутри HTTP-сервера и передаётся вторым аргументом в [`'request'`](#event-request).

### Событие: `'close'` {#event-close-3}

Сигнализирует, что ответ завершён или соединение оборвано до завершения ответа.

### Событие: `'finish'` {#event-finish-serverresponse}

Генерируется, когда ответ отправлен: последняя часть заголовков и тела передана ОС для передачи по сети. Это не гарантирует, что клиент уже что-то получил.

### `response.addTrailers(headers)`

-   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Добавляет завершающие (trailing) HTTP-заголовки в конце сообщения.

Они отправляются **только** при chunked-кодировании ответа; иначе (например HTTP/1.0) они тихо отбрасываются.

Для trailers нужен заголовок `Trailer` со списком полей, например:

```js
response.writeHead(200, {
    'Content-Type': 'text/plain',
    Trailer: 'Content-MD5',
});
response.write(fileData);
response.addTrailers({
    'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667',
});
response.end();
```

Недопустимые символы в имени или значении заголовка приводят к [`TypeError`](errors.md#class-typeerror).

### `response.connection`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`response.socket`](#responsesocket).

-   Тип: [`<stream.Duplex>`](stream.md#class-streamduplex)

См. [`response.socket`](#responsesocket).

### `response.cork()`

См. [`writable.cork()`](stream.md#writablecork).

### `response.end([data[, encoding]][, callback])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Сообщает, что все заголовки и тело ответа отправлены; сообщение считается завершённым. Для каждого ответа нужно вызвать `response.end()`.

Если задан `data`, это аналогично [`response.write(data, encoding)`](#responsewritechunk-encoding-callback) с последующим `response.end(callback)`.

Если задан `callback`, он вызывается по завершении потока ответа.

### `response.finished`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`response.writableEnded`](#responsewritableended).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `response.finished` равно `true`, если вызван [`response.end()`](#responseenddata-encoding-callback).

### `response.flushHeaders()`

Немедленно отправляет заголовки ответа. См. также [`request.flushHeaders()`](#requestflushheaders).

### `response.getHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Читает заголовок из очереди на отправку клиенту. Имя не чувствительно к регистру. Тип возвращаемого значения зависит от аргументов [`response.setHeader()`](#responsesetheadername-value).

```js
response.setHeader('Content-Type', 'text/html');
response.setHeader(
    'Content-Length',
    Buffer.byteLength(body)
);
response.setHeader('Set-Cookie', [
    'type=ninja',
    'language=javascript',
]);
const contentType = response.getHeader('content-type');
// contentType is 'text/html'
const contentLength = response.getHeader('Content-Length');
// contentLength is of type number
const setCookie = response.getHeader('set-cookie');
// setCookie is of type string[]
```

### `response.getHeaderNames()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив уникальных имён текущих исходящих заголовков. Все имена в нижнем регистре.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = response.getHeaderNames();
// headerNames === ['foo', 'set-cookie']
```

### `response.getHeaders()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает неглубокую копию текущих исходящих заголовков. Массивы в значениях можно менять без дополнительных вызовов методов модуля `http`. Ключи — имена заголовков, значения — соответствующие значения. Все имена в нижнем регистре.

Объект из `response.getHeaders()` _не_ наследует прототипически от JavaScript `Object`, поэтому обычные методы вроде `obj.toString()`, `obj.hasOwnProperty()` и т.п. не определены и _не сработают_.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headers = response.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```

### `response.hasHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если заголовок с именем `name` сейчас есть среди исходящих. Сопоставление имени не чувствительно к регистру.

```js
const hasContentType = response.hasHeader('content-type');
```

### `response.headersSent`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое (только чтение): `true`, если заголовки уже отправлены.

### `response.removeHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Удаляет заголовок из очереди неявной отправки.

```js
response.removeHeader('Content-Encoding');
```

### `response.req`

-   Тип: [`<http.IncomingMessage>`](#class-httpincomingmessage)

Ссылка на исходный объект HTTP-запроса.

### `response.sendDate`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, заголовок `Date` генерируется и добавляется к ответу, если его ещё нет. По умолчанию `true`.

Отключать только для тестов; в большинстве ответов `Date` обязателен (см. [RFC 9110 раздел 6.6.1](https://www.rfc-editor.org/rfc/rfc9110#section-6.6.1)).

### `response.setHeader(name, value)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `value` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<http.ServerResponse>`](#class-httpserverresponse)

Возвращает объект ответа для цепочки вызовов.

Задаёт одно значение неявного заголовка. Если заголовок уже в очереди на отправку, значение заменяется. Несколько заголовков с одним именем — массивом строк. Нестроковые значения хранятся как есть, [`response.getHeader()`](#responsegetheadername) может вернуть не строку; при передаче по сети значения приводятся к строкам.

```js
response.setHeader('Content-Type', 'text/html');
```

или

```js
response.setHeader('Set-Cookie', [
    'type=ninja',
    'language=javascript',
]);
```

Недопустимые символы в имени или значении приводят к [`TypeError`](errors.md#class-typeerror).

Заголовки из [`response.setHeader()`](#responsesetheadername-value) объединяются с заголовками [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers); приоритет у аргументов [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

```js
// В итоге content-type = text/plain
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
});
```

Если вызван [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) без предварительных [`response.setHeader()`](#responsesetheadername-value), значения заголовков пишутся в канал без внутреннего кэша, и [`response.getHeader()`](#responsegetheadername) может не показать ожидаемое. Если нужно поэтапно задавать и потом читать/менять заголовки, используйте [`response.setHeader()`](#responsesetheadername-value), а не только [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

### `response.setTimeout(msecs[, callback])`

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<http.ServerResponse>`](#class-httpserverresponse)

Задаёт таймаут сокета `msecs`. Если передан `callback`, он добавляется как слушатель `'timeout'` на объекте ответа.

Если нет слушателя `'timeout'` ни у запроса, ни у ответа, ни у сервера, при таймауте сокеты уничтожаются. Если обработчик `'timeout'` задан у запроса, ответа или сервера, истёкшие сокеты нужно обрабатывать явно.

### `response.socket`

-   Тип: [`<stream.Duplex>`](stream.md#class-streamduplex)

Ссылка на базовый сокет. Обычно к свойству не обращаются: сокет не генерирует `'readable'` из‑за привязки парсера. После `response.end()` свойство обнуляется.

=== "MJS"

    ```js
    import http from 'node:http';
    const server = http.createServer((req, res) => {
      const ip = res.socket.remoteAddress;
      const port = res.socket.remotePort;
      res.end(`Your IP address is ${ip} and your source port is ${port}.`);
    }).listen(3000);
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const server = http.createServer((req, res) => {
      const ip = res.socket.remoteAddress;
      const port = res.socket.remotePort;
      res.end(`Your IP address is ${ip} and your source port is ${port}.`);
    }).listen(3000);
    ```

Свойство гарантированно — экземпляр класса [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если только не задан другой тип сокета, не [net.Socket](net.md#class-netsocket).

### `response.statusCode`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `200`

При неявных заголовках (без явного [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers)) задаёт код статуса, который уйдёт клиенту при сбросе заголовков.

```js
response.statusCode = 404;
```

После отправки заголовков свойство отражает фактически отправленный код.

### `response.statusMessage`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

При неявных заголовках задаёт текст статуса для клиента при сбросе заголовков. Если оставить `undefined`, подставится стандартная фраза для кода.

```js
response.statusMessage = 'Not found';
```

После отправки заголовков — фактически отправленная фраза статуса.

### `response.strictContentLength`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`

При `true` проверяется совпадение значения `Content-Length` и размера тела в байтах. Несоответствие даёт `Error` с кодом [`'ERR_HTTP_CONTENT_LENGTH_MISMATCH'`](errors.md#err_http_content_length_mismatch).

### `response.uncork()`

См. [`writable.uncork()`](stream.md#writableuncork).

### `response.writableEnded`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после [`response.end()`](#responseenddata-encoding-callback). Не показывает сброс данных в ОС; для этого [`response.writableFinished`](#responsewritablefinished).

### `response.writableFinished`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если данные сброшены в нижележащую систему непосредственно перед событием [`'finish'`](#event-finish-serverresponse).

### `response.write(chunk[, encoding][, callback])`

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) ещё не вызывался, включается режим неявных заголовков и они сбрасываются.

Отправляет фрагмент тела ответа; метод можно вызывать многократно.

Если в `createServer` задано `rejectNonStandardBodyWrites: true`, запись тела запрещена, когда метод запроса или код ответа не подразумевают тело. Попытка писать тело для HEAD или при `204`/`304` синхронно даёт `Error` с кодом `ERR_HTTP_BODY_NOT_ALLOWED`.

`chunk` — строка или буфер; для строки второй параметр задаёт кодировку. `callback` вызывается после сброса фрагмента.

Это сырой HTTP-тело, не связанный с multipart и прочими высокоуровневыми схемами.

Первый вызов [`response.write()`](#responsewritechunk-encoding-callback) отправляет буферизованные заголовки и первый фрагмент тела. Дальше Node.js считает, что данные стримятся, и шлёт новые части отдельно: буферизация до первого фрагмента тела.

Возвращает `true`, если данные полностью сброшены в буфер ядра; `false`, если часть осталась в пользовательской памяти. При освобождении буфера будет `'drain'`.

### `response.writeContinue()`

Отправляет клиенту сообщение HTTP/1.1 `100 Continue`: можно отправлять тело запроса. См. событие [`'checkContinue'`](#event-checkcontinue) на `Server`.

### `response.writeEarlyHints(hints[, callback])`

-   `hints` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Отправляет клиенту HTTP/1.1 `103 Early Hints` с заголовком `Link`, чтобы пользовательский агент мог заранее подгрузить ресурсы. `hints` — объект с заголовками для этого сообщения. Необязательный `callback` вызывается после записи ответа.

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
    'x-trace-id': 'id for diagnostics',
});

const earlyHintsCallback = () =>
    console.log('early hints message sent');
response.writeEarlyHints(
    {
        link: earlyHintsLinks,
    },
    earlyHintsCallback
);
```

### `response.writeHead(statusCode[, statusMessage][, headers])`

-   `statusCode` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `statusMessage` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
-   Возвращает: [`<http.ServerResponse>`](#class-httpserverresponse)

Отправляет клиенту строку ответа: код — трёхзначный HTTP (например `404`), последний аргумент `headers` — заголовки ответа. Необязательно вторым аргументом можно передать текстовую `statusMessage`.

`headers` может быть массивом, где ключи и значения идут подряд в одном списке; это _не_ список пар. Чётные индексы — ключи, нечётные — значения; формат как у `request.rawHeaders`.

Возвращает `ServerResponse` для цепочки вызовов.

```js
const body = 'hello world';
response
    .writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/plain',
    })
    .end(body);
```

Вызывать не более одного раза на сообщение и до [`response.end()`](#responseenddata-encoding-callback).

Если до этого вызывались [`response.write()`](#responsewritechunk-encoding-callback) или [`response.end()`](#responseenddata-encoding-callback), будут вычислены неявные/изменяемые заголовки и вызвана эта функция.

Заголовки из [`response.setHeader()`](#responsesetheadername-value) объединяются с аргументами [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers); приоритет у [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

Если вызван [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) без предварительных [`response.setHeader()`](#responsesetheadername-value), значения пишутся в канал без внутреннего кэша, [`response.getHeader()`](#responsegetheadername) может не совпасть с ожиданиями. Для поэтапной настройки заголовков используйте [`response.setHeader()`](#responsesetheadername-value).

```js
// В итоге content-type = text/plain
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
});
```

`Content-Length` — в байтах, не в символах; длину тела считайте через [`Buffer.byteLength()`](buffer.md#static-method-bufferbytelengthstring-encoding). Node.js проверяет согласованность `Content-Length` с переданным телом.

Недопустимые символы в имени или значении заголовка — [`TypeError`](errors.md#class-typeerror).

### `response.writeProcessing()`

Отправляет клиенту HTTP/1.1 `102 Processing`: можно продолжать отправку тела запроса.

## Класс: `http.IncomingMessage` {#class-httpincomingmessage}

-   Наследует: [`<stream.Readable>`](stream.md#streamreadable)

Объект `IncomingMessage` создаётся [`http.Server`](#class-httpserver) или [`http.ClientRequest`](#class-httpclientrequest) и передаётся первым аргументом в [`'request'`](#event-request) и [`'response'`](#event-response) соответственно. Через него доступны статус, заголовки и данные ответа.

В отличие от `socket` (подкласс [stream.Duplex](stream.md#class-streamduplex)), сам `IncomingMessage` — [stream.Readable](stream.md#streamreadable): он создаётся отдельно для разбора и выдачи входящих заголовков и тела, тогда как сокет при keep-alive может переиспользоваться.

### Событие: `'aborted'`

!!!warning "Стабильность: 0 - Устарело"

    Вместо этого отслеживайте событие `'close'`.

Генерируется при прерывании запроса.

### Событие: `'close'` {#event-close-4}

Генерируется по завершении запроса.

### `message.aborted`

!!!warning "Стабильность: 0 - Устарело"

    Проверяйте `message.destroyed` из [stream.Readable](stream.md#streamreadable).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `message.aborted` равно `true`, если запрос прерван.

### `message.complete`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `message.complete` равно `true`, если полное HTTP-сообщение получено и успешно разобрано.

Удобно проверять, успел ли клиент или сервер полностью передать сообщение до обрыва соединения:

```js
const req = http.request(
    {
        host: '127.0.0.1',
        port: 8080,
        method: 'POST',
    },
    (res) => {
        res.resume();
        res.on('end', () => {
            if (!res.complete)
                console.error(
                    'The connection was terminated while the message was still being sent'
                );
        });
    }
);
```

### `message.connection`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`message.socket`](#messagesocket).

Псевдоним для [`message.socket`](#messagesocket).

### `message.destroy([error])`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Вызывает `destroy()` у сокета, принявшего `IncomingMessage`. Если передан `error`, на сокете генерируется `'error'`, и `error` передаётся слушателям.

### `message.headers`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект заголовков запроса/ответа.

Пары «имя–значение»; имена заголовков в нижнем регистре.

```js
// Prints something like:
//
// { 'user-agent': 'curl/7.22.0',
//   host: '127.0.0.1:8000',
//   accept: '*/*' }
console.log(request.headers);
```

Дубликаты в сырых заголовках обрабатываются так:

-   Повторы `age`, `authorization`, `content-length`, `content-type`, `etag`, `expires`, `from`, `host`, `if-modified-since`, `if-unmodified-since`, `last-modified`, `location`, `max-forwards`, `proxy-authorization`, `referer`, `retry-after`, `server`, `user-agent` отбрасываются. Чтобы объединять дубликаты этих заголовков, используйте `joinDuplicateHeaders` в [`http.request()`](#httprequestoptions-callback) и [`http.createServer()`](#httpcreateserveroptions-requestlistener) (см. RFC 9110 раздел 5.3).
-   `set-cookie` всегда массив; дубликаты добавляются в массив.
-   Для нескольких `cookie` значения склеиваются через `; `.
-   Для остальных заголовков значения склеиваются через `, `.

### `message.headersDistinct`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Как [`message.headers`](#messageheaders), но без логики склейки: значения всегда массивы строк, даже если заголовок пришёл один раз.

```js
// Prints something like:
//
// { 'user-agent': ['curl/7.22.0'],
//   host: ['127.0.0.1:8000'],
//   accept: ['*/*'] }
console.log(request.headersDistinct);
```

### `message.httpVersion`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Для серверного запроса — версия HTTP от клиента; для клиентского ответа — версия HTTP сервера. Обычно `'1.1'` или `'1.0'`.

`message.httpVersionMajor` — первая цифра, `message.httpVersionMinor` — вторая.

### `message.method`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

**Только для запроса от [`http.Server`](#class-httpserver).**

Метод запроса строкой, только чтение. Примеры: `'GET'`, `'DELETE'`.

### `message.rawHeaders`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Сырой список заголовков запроса/ответа в том виде, как получен.

Ключи и значения в одном массиве; это _не_ список пар: чётные индексы — ключи, нечётные — значения.

Имена не приводятся к нижнему регистру, дубликаты не сливаются.

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

### `message.rawTrailers`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Сырые ключи и значения trailer'ов запроса/ответа. Заполняется на событии `'end'`.

### `message.setTimeout(msecs[, callback])`

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<http.IncomingMessage>`](#class-httpincomingmessage)

Вызывает `message.socket.setTimeout(msecs, callback)`.

### `message.signal`

-   Тип: [`<AbortSignal>`](globals.md#abortsignal)

[AbortSignal](globals.md#abortsignal), который прерывается при закрытии базового сокета или уничтожении запроса. Создаётся лениво при первом обращении — [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) не создаётся, если свойство не использовалось.

Удобно отменять асинхронную работу (запросы к БД, `fetch`) при обрыве соединения клиентом.

=== "MJS"

    ```js
    import http from 'node:http';

    http.createServer(async (req, res) => {
      try {
        const data = await fetch('https://example.com/api', { signal: req.signal });
        res.end(JSON.stringify(await data.json()));
      } catch (err) {
        if (err.name === 'AbortError') return;
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(3000);
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    http.createServer(async (req, res) => {
      try {
        const data = await fetch('https://example.com/api', { signal: req.signal });
        res.end(JSON.stringify(await data.json()));
      } catch (err) {
        if (err.name === 'AbortError') return;
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(3000);
    ```

### `message.socket`

-   Тип: [`<stream.Duplex>`](stream.md#class-streamduplex)

Объект [`net.Socket`](net.md#class-netsocket), связанный с соединением.

При HTTPS можно вызвать [`request.socket.getPeerCertificate()`](tls.md#tlssocketgetpeercertificatedetailed) для данных сертификата клиента.

Свойство гарантированно — экземпляр [net.Socket](net.md#class-netsocket), подкласса [stream.Duplex](stream.md#class-streamduplex), если не задан другой тип сокета или значение не обнулено внутри Node.js.

### `message.statusCode`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

**Только для ответа от [`http.ClientRequest`](#class-httpclientrequest).**

Трёхзначный код статуса HTTP, например `404`.

### `message.statusMessage`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

**Только для ответа от [`http.ClientRequest`](#class-httpclientrequest).**

Текстовая фраза статуса HTTP, например `OK` или `Internal Server Error`.

### `message.trailers`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект trailer'ов запроса/ответа. Заполняется на событии `'end'`.

### `message.trailersDistinct`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Как [`message.trailers`](#messagetrailers), но без склейки: значения всегда массивы строк. Заполняется на `'end'`.

### `message.url`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

**Только для запроса от [`http.Server`](#class-httpserver).**

Строка URL запроса — только та часть, что в самом HTTP-запросе. Пример:

```http
GET /status?name=ryan HTTP/1.1
Accept: text/plain
```

Разбор на части:

```js
new URL(
    `http://${process.env.HOST ?? 'localhost'}${
        request.url
    }`
);
```

Если `request.url` равен `'/status?name=ryan'` и `process.env.HOST` не задан:

```console
$ node
> new URL(`http://${process.env.HOST ?? 'localhost'}${request.url}`);
URL {
  href: 'http://localhost/status?name=ryan',
  origin: 'http://localhost',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'localhost',
  hostname: 'localhost',
  port: '',
  pathname: '/status',
  search: '?name=ryan',
  searchParams: URLSearchParams { 'name' => 'ryan' },
  hash: ''
}
```

Задайте `process.env.HOST` имени хоста сервера или замените эту часть. При использовании `req.headers.host` проверяйте значение: клиент может прислать произвольный `Host`.

## Класс: `http.OutgoingMessage`

-   Наследует: [`<Stream>`](stream.md#stream)

Базовый класс для [`http.ClientRequest`](#class-httpclientrequest) и [`http.ServerResponse`](#class-httpserverresponse) — абстрактное исходящее сообщение в HTTP-транзакции.

### Событие: `'drain'`

Генерируется, когда буфер сообщения снова свободен.

### Событие: `'finish'`

Генерируется при успешном завершении передачи.

### Событие: `'prefinish'`

После `outgoingMessage.end()`. К моменту события данные обработаны, но не обязательно полностью сброшены.

### `outgoingMessage.addTrailers(headers)`

-   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Добавляет HTTP trailer'ы (заголовки в конце сообщения).

Они отправляются **только** при chunked-кодировании сообщения; иначе тихо отбрасываются.

Нужен заголовок `Trailer` со списком имён полей, например:

```js
message.writeHead(200, {
    'Content-Type': 'text/plain',
    Trailer: 'Content-MD5',
});
message.write(fileData);
message.addTrailers({
    'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667',
});
message.end();
```

Недопустимые символы в имени или значении — `TypeError`.

### `outgoingMessage.appendHeader(name, value)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка
-   `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение заголовка
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Добавляет одно значение к заголовку.

Если `value` — массив, это эквивалентно нескольким вызовам метода.

Если предыдущих значений не было, это эквивалентно [`outgoingMessage.setHeader(name, value)`](#outgoingmessagesetheadername-value).

В зависимости от `options.uniqueHeaders` при создании клиента или сервера заголовок уйдёт несколько раз или один раз со значениями, склеенными через `; `.

### `outgoingMessage.connection`

!!!warning "Стабильность: 0 - Устарело"

    Используйте [`outgoingMessage.socket`](#outgoingmessagesocket).

Псевдоним [`outgoingMessage.socket`](#outgoingmessagesocket).

### `outgoingMessage.cork()`

См. [`writable.cork()`](stream.md#writablecork).

### `outgoingMessage.destroy([error])`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Необязательная ошибка, которую нужно сгенерировать вместе с событием `error`
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает сообщение. Если сокет уже связан с сообщением и подключён, он тоже уничтожается.

### `outgoingMessage.end(chunk[, encoding][, callback])`

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно. **По умолчанию:** `utf8`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Optional
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Завершает исходящее сообщение. Неотправленные части тела сбрасываются в ОС. При chunked-режиме отправляется завершающий кусок `0\r\n\r\n` и trailer'ы (если есть).

Если указан `chunk`, это эквивалентно `outgoingMessage.write(chunk, encoding)` с последующим `outgoingMessage.end(callback)`.

Если указан `callback`, он вызывается по завершении сообщения (как слушатель `'finish'`).

### `outgoingMessage.flushHeaders()`

Немедленно отправляет заголовки сообщения.

По соображениям эффективности Node.js обычно буферизует заголовки до вызова `outgoingMessage.end()` или записи первого фрагмента данных; затем Node.js пытается объединить заголовки и данные в один TCP-пакет.

Обычно это желаемо (экономия round-trip), но не если первые данные уйдут намного позже. `outgoingMessage.flushHeaders()` отключает оптимизацию и «запускает» сообщение.

### `outgoingMessage.getHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Возвращает значение HTTP-заголовка с данным именем. Если заголовок не задан, возвращается `undefined`.

### `outgoingMessage.getHeaderNames()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив уникальных имён текущих исходящих заголовков. Все имена в нижнем регистре.

### `outgoingMessage.getHeaders()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает неглубокую копию текущих исходящих заголовков. При неглубоком копировании массивы в значениях можно менять без дополнительных вызовов методов модуля HTTP. Ключи — имена заголовков, значения — соответствующие значения. Все имена в нижнем регистре.

Объект, возвращаемый `outgoingMessage.getHeaders()`, не наследует прототипически от JavaScript `Object`, поэтому обычные методы вроде `obj.toString()`, `obj.hasOwnProperty()` и т.п. не определены и не сработают.

```js
outgoingMessage.setHeader('Foo', 'bar');
outgoingMessage.setHeader('Set-Cookie', [
    'foo=bar',
    'bar=baz',
]);

const headers = outgoingMessage.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```

### `outgoingMessage.hasHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если заголовок с именем `name` сейчас есть среди исходящих. Имя не чувствительно к регистру.

```js
const hasContentType = outgoingMessage.hasHeader(
    'content-type'
);
```

### `outgoingMessage.headersSent`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Только чтение: `true`, если заголовки уже отправлены.

### `outgoingMessage.pipe()`

Переопределяет `stream.pipe()` у наследуемого класса `Stream` (родитель `http.OutgoingMessage`).

Вызов бросает `Error`: `outgoingMessage` — только для записи.

### `outgoingMessage.removeHeader(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка

Удаляет заголовок из очереди неявной отправки.

```js
outgoingMessage.removeHeader('Content-Encoding');
```

### `outgoingMessage.setHeader(name, value)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка
-   `value` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение заголовка
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Задаёт одно значение заголовка. Если заголовок уже в очереди на отправку, значение заменяется. Несколько заголовков с одним именем — массивом строк.

### `outgoingMessage.setHeaders(headers)`

-   `headers` [`<Headers>`](globals.md#class-headers) | [`<Map>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Задаёт несколько неявных заголовков. `headers` — экземпляр [`Headers`](globals.md#class-headers) или `Map`; существующие имена заменяются.

```js
const headers = new Headers({ foo: 'bar' });
outgoingMessage.setHeaders(headers);
```

или

```js
const headers = new Map([['foo', 'bar']]);
outgoingMessage.setHeaders(headers);
```

Заголовки из [`outgoingMessage.setHeaders()`](#outgoingmessagesetheadersheaders) объединяются с [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers); приоритет у [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

```js
// В итоге content-type = text/plain
const server = http.createServer((req, res) => {
    const headers = new Headers({
        'Content-Type': 'text/html',
    });
    res.setHeaders(headers);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
});
```

### `outgoingMessage.setTimeout(msecs[, callback])`

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательный обработчик таймаута; как подписка на `timeout`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

После привязки сокета к сообщению и подключения вызывается [`socket.setTimeout()`](net.md#socketsettimeouttimeout-callback) с `msecs` первым аргументом.

### `outgoingMessage.socket`

-   Тип: [`<stream.Duplex>`](stream.md#class-streamduplex)

Ссылка на базовый сокет; обычно к свойству не обращаются.

После `outgoingMessage.end()` свойство обнуляется.

### `outgoingMessage.uncork()`

См. [`writable.uncork()`](stream.md#writableuncork)

### `outgoingMessage.writableCorked`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Сколько раз вызывали `outgoingMessage.cork()`.

### `outgoingMessage.writableEnded`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после `outgoingMessage.end()`. Не показывает сброс данных; для этого `message.writableFinished`.

### `outgoingMessage.writableFinished`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если все данные сброшены в нижележащую систему.

### `outgoingMessage.writableHighWaterMark`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

`highWaterMark` базового сокета, если задан; иначе порог по умолчанию, когда [`writable.write()`](stream.md#writablewritechunk-encoding-callback) начинает возвращать `false` (`16384`).

### `outgoingMessage.writableLength`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число байт в буфере.

### `outgoingMessage.writableObjectMode`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Всегда `false`.

### `outgoingMessage.write(chunk[, encoding][, callback])`

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `utf8`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отправляет фрагмент тела; метод можно вызывать многократно.

`encoding` учитывается только для строкового `chunk`. По умолчанию `'utf8'`.

`callback` необязателен и вызывается после сброса фрагмента.

Возвращает `true`, если данные полностью сброшены в буфер ядра; `false`, если часть осталась в пользовательской памяти. При освобождении буфера будет `'drain'`.

## `http.METHODS`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список HTTP-методов, поддерживаемых парсером.

## `http.STATUS_CODES`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект стандартных кодов ответа HTTP и кратких описаний, например `http.STATUS_CODES[404] === 'Not Found'`.

## `http.createServer([options][, requestListener])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

    -   `connectionsCheckingInterval`: Интервал в миллисекундах для проверки таймаутов запроса и заголовков у незавершённых запросов. **По умолчанию:** `30000`.
    -   `headersTimeout`: Таймаут в миллисекундах на приём полных HTTP-заголовков от клиента. См. [`server.headersTimeout`](#serverheaderstimeout). **По умолчанию:** `60000`.
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Переопределяет `readableHighWaterMark` и `writableHighWaterMark` у всех сокетов; влияет на `highWaterMark` у `IncomingMessage` и `ServerResponse`. **По умолчанию:** см. [`stream.getDefaultHighWaterMark()`](stream.md#streamgetdefaulthighwatermarkobjectmode).
    -   `insecureHTTPParser` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` используется парсер HTTP с «мягкими» флагами; нежелательно. См. [`--insecure-http-parser`](cli.md#--insecure-http-parser). **По умолчанию:** `false`.
    -   `IncomingMessage` [`<http.IncomingMessage>`](#class-httpincomingmessage) Класс входящего сообщения (для расширения). **По умолчанию:** `IncomingMessage`.
    -   `joinDuplicateHeaders` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` значения повторяющихся полей заголовков в запросе объединяются через `, ` вместо отбрасывания дубликатов. См. [`message.headers`](#messageheaders). **По умолчанию:** `false`.
    -   `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` включает keep-alive на сокете сразу после нового входящего соединения (как [`socket.setKeepAlive(enable, initialDelay)`](net.md#socketsetkeepaliveenable-initialdelay)). **По умолчанию:** `false`.
    -   `keepAliveInitialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Положительное число — задержка перед первым keep-alive зондом на простаивающем сокете. **По умолчанию:** `0`.
    -   `keepAliveTimeout`: Миллисекунды простоя ожидания новых данных после отправки последнего ответа, прежде чем сокет уничтожится. См. [`server.keepAliveTimeout`](#serverkeepalivetimeout). **По умолчанию:** `5000`.
    -   `maxHeaderSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Переопределяет [`--max-http-header-size`](cli.md#--max-http-header-sizesize) для запросов этому серверу (максимальная длина заголовков в байтах). **По умолчанию:** 16384 (16 KiB).
    -   `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` отключает алгоритм Нейла сразу после нового входящего соединения. **По умолчанию:** `true`.
    -   `requestTimeout`: Таймаут в миллисекундах на приём всего запроса от клиента. См. [`server.requestTimeout`](#serverrequesttimeout). **По умолчанию:** `300000`.
    -   `requireHostHeader` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` сервер отвечает `400` на HTTP/1.1 без заголовка `Host`, как требует спецификация. **По умолчанию:** `true`.
    -   `ServerResponse` [`<http.ServerResponse>`](#class-httpserverresponse) Класс ответа сервера (для расширения). **По умолчанию:** `ServerResponse`.
    -   `shouldUpgradeCallback(request)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Получает входящий запрос, возвращает `boolean`: принимать ли обновление. Принятые обновления дают `'upgrade'` (или сокет уничтожается без слушателя); отклонённые идут как обычный `'request'`. По умолчанию: `() => server.listenerCount('upgrade') > 0`.
    -   `uniqueHeaders` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Заголовки ответа, которые должны отправиться один раз; если значение — массив, элементы склеиваются через `; `.
    -   `rejectNonStandardBodyWrites` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` запись в ответ без тела даёт ошибку. **По умолчанию:** `false`.
    -   `optimizeEmptyRequests` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` запросы без `Content-Length` и `Transfer-Encoding` (нет тела) получают уже завершённый поток тела и не генерируют `'data'`/`'end'`; см. `req.readableEnded`. **По умолчанию:** `false`.

-   `requestListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

-   Возвращает: [`<http.Server>`](#class-httpserver)

Возвращает новый экземпляр [`http.Server`](#class-httpserver).

`requestListener` автоматически добавляется как обработчик [`'request'`](#event-request).

=== "MJS"

    ```js
    import http from 'node:http';

    // Create a local server to receive data from
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        data: 'Hello World!',
      }));
    });

    server.listen(8000);
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    // Create a local server to receive data from
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        data: 'Hello World!',
      }));
    });

    server.listen(8000);
    ```

---

=== "MJS"

    ```js
    import http from 'node:http';

    // Create a local server to receive data from
    const server = http.createServer();

    // Listen to the request event
    server.on('request', (request, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        data: 'Hello World!',
      }));
    });

    server.listen(8000);
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    // Create a local server to receive data from
    const server = http.createServer();

    // Listen to the request event
    server.on('request', (request, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        data: 'Hello World!',
      }));
    });

    server.listen(8000);
    ```

## `http.get(options[, callback])`

## `http.get(url[, options][, callback])`

-   `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Принимает те же `options`, что и [`http.request()`](#httprequestoptions-callback), но с методом `GET` по умолчанию.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<http.ClientRequest>`](#class-httpclientrequest)

Удобный метод для типичных GET без тела. От [`http.request()`](#httprequestoptions-callback) отличается тем, что метод по умолчанию GET и вызывается `req.end()` автоматически. Ответ нужно прочитать, как описано в разделе [`http.ClientRequest`](#class-httpclientrequest).

`callback` вызывается с одним аргументом — экземпляром [`http.IncomingMessage`](#class-httpincomingmessage).

Пример получения JSON:

```js
http.get('http://localhost:8000/', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    // Any 2xx status code signals a successful response but
    // here we're only checking for 200.
    if (statusCode !== 200) {
        error = new Error(
            'Request Failed.\n' +
                `Status Code: ${statusCode}`
        );
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error(
            'Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`
        );
    }
    if (error) {
        console.error(error.message);
        // Consume response data to free up memory
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => {
        rawData += chunk;
    });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`Got error: ${e.message}`);
});

// Create a local server to receive data from
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'application/json',
    });
    res.end(
        JSON.stringify({
            data: 'Hello World!',
        })
    );
});

server.listen(8000);
```

## `http.globalAgent`

-   Тип: [`<http.Agent>`](http.md#class-httpagent)

Глобальный `Agent` по умолчанию для всех HTTP-клиентских запросов. В отличие от конфигурации `Agent` по умолчанию: включён `keepAlive` и `timeout` 5 секунд.

## `http.maxHeaderSize`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Только чтение: максимальный размер HTTP-заголовков в байтах. По умолчанию 16 KiB; задаётся флагом [`--max-http-header-size`](cli.md#--max-http-header-sizesize).

Можно переопределить опцией `maxHeaderSize` у сервера и клиентских запросов.

## `http.request(options[, callback])`

## `http.request(url[, options][, callback])`

-   `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `agent` [`<http.Agent>`](http.md#class-httpagent) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Поведение [`Agent`](#class-httpagent):
        -   `undefined` (по умолчанию): [`http.globalAgent`](#httpglobalagent) для этого хоста и порта.
        -   объект `Agent`: использовать переданный агент.
        -   `false`: новый `Agent` с параметрами по умолчанию.
    -   `auth` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Basic (`'user:password'`) для заголовка Authorization.
    -   `createConnection` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Создаёт сокет/поток для запроса без опции `agent`; см. [`agent.createConnection()`](#agentcreateconnectionoptions-callback). Подойдёт любой [`Duplex`](stream.md#class-streamduplex).
    -   `defaultPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт протокола по умолчанию. **По умолчанию:** `agent.defaultPort` при использовании `Agent`, иначе `undefined`.
    -   `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство адресов при разрешении `host`/`hostname`: `4` или `6`. Если не задано, используются IPv4 и IPv6.
    -   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Объект заголовков или массив строк в формате [`message.rawHeaders`](#messagerawheaders).
    -   `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательные подсказки [`dns.lookup()` hints](dns.md#supported-getaddrinfo-flags).
    -   `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Домен или IP сервера. **По умолчанию:** `'localhost'`.
    -   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Синоним `host`; для [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) при указании обоих используется `hostname`.
    -   `insecureHTTPParser` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` — «мягкий» парсер HTTP; нежелательно. См. [`--insecure-http-parser`](cli.md#--insecure-http-parser). **По умолчанию:** `false`
    -   `joinDuplicateHeaders` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Склеивает значения повторяющихся заголовков через `, `. См. [`message.headers`](#messageheaders). **По умолчанию:** `false`.
    -   `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный интерфейс для исходящих соединений.
    -   `localPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Локальный порт источника.
    -   `lookup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция разрешения имён. **По умолчанию:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
    -   `maxHeaderSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Переопределяет [`--max-http-header-size`](cli.md#--max-http-header-sizesize) для ответов сервера (макс. длина заголовков в байтах). **По умолчанию:** 16384 (16 KiB).
    -   `method` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) HTTP-метод. **По умолчанию:** `'GET'`.
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь запроса, включая query при необходимости, напр. `'/index.html?page=12'`. Недопустимые символы в пути дают исключение (сейчас отклоняются пробелы). **По умолчанию:** `'/'`.
    -   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт сервера. **По умолчанию:** `defaultPort` или `80`.
    -   `protocol` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Протокол. **По умолчанию:** `'http:'`.
    -   `setDefaultHeaders` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Автоматически добавлять заголовки `Connection`, `Content-Length`, `Transfer-Encoding`, `Host`. При `false` всё задаётся вручную. По умолчанию `true`.
    -   `setHost` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Автоматически добавлять `Host`; переопределяет часть поведения `setDefaultHeaders`. По умолчанию `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Сигнал прерывания запроса.
    -   `socketPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь Unix socket; несовместимо с указанием `host` или `port` (TCP).
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут сокета в миллисекундах до подключения.
    -   `uniqueHeaders` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Заголовки, которые должны уйти один раз; массив значений склеивается через `; `.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<http.ClientRequest>`](#class-httpclientrequest)

Также поддерживаются `options` из [`socket.connect()`](net.md#socketconnectoptions-connectlistener).

Node.js держит несколько соединений с сервером для HTTP-запросов; эта функция отправляет запрос прозрачно.

`url` — строка или объект [`URL`](url.md#the-whatwg-url-api); строка разбирается через [`new URL()`](url.md#new-urlinput-base), объект [`URL`](url.md#the-whatwg-url-api) превращается в обычный `options`.

Если заданы и `url`, и `options`, объекты сливаются; поля из `options` важнее.

Необязательный `callback` добавляется как одноразовый слушатель [`'response'`](#event-response).

`http.request()` возвращает [`http.ClientRequest`](#class-httpclientrequest) — поток для записи. Чтобы загрузить файл через POST, пишите в этот объект.

=== "MJS"

    ```js
    import http from 'node:http';
    import { Buffer } from 'node:buffer';

    const postData = JSON.stringify({
      'msg': 'Hello World!',
    });

    const options = {
      hostname: 'www.google.com',
      port: 80,
      path: '/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(postData);
    req.end();
    ```

=== "CJS"

    ```js
    const http = require('node:http');

    const postData = JSON.stringify({
      'msg': 'Hello World!',
    });

    const options = {
      hostname: 'www.google.com',
      port: 80,
      path: '/upload',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
      });
      res.on('end', () => {
        console.log('No more data in response.');
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(postData);
    req.end();
    ```

В примере вызывается `req.end()`. Для `http.request()` всегда нужно вызвать `req.end()`, чтобы завершить запрос, даже если тело не пишется.

Любая ошибка запроса (DNS, TCP, разбор HTTP) даёт `'error'` на объекте запроса. Без слушателей `'error'` исключение пробрасывается.

Особые заголовки:

-   `Connection: keep-alive` — соединение с сервером сохраняется до следующего запроса.

-   `Content-Length` отключает chunked по умолчанию.

-   `Expect` — заголовки запроса отправляются сразу. Для `Expect: 100-continue` обычно нужны таймаут и обработчик `'continue'`. См. RFC 2616 раздел 8.2.3.

-   `Authorization` переопределяет вычисление Basic из опции `auth`.

Пример с [`URL`](url.md#the-whatwg-url-api) в качестве `options`:

```js
const options = new URL('http://abc:xyz@example.com');

const req = http.request(options, (res) => {
    // ...
});
```

При успешном запросе события идут в таком порядке:

-   `'socket'`
-   `'response'`
    -   `'data'` произвольное число раз на объекте `res` (событие `'data'` может не генерироваться вообще, если тело ответа пустое, например при большинстве перенаправлений)
    -   `'end'` на объекте `res`
-   `'close'`

При ошибке соединения:

-   `'socket'`
-   `'error'`
-   `'close'`

При преждевременном закрытии соединения до получения ответа:

-   `'socket'`
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'`
-   `'close'`

При преждевременном закрытии после получения ответа:

-   `'socket'`
-   `'response'`
    -   `'data'` произвольное число раз на объекте `res`
-   (соединение закрывается здесь)
-   `'aborted'` на объекте `res`
-   `'close'`
-   `'error'` на объекте `res` с ошибкой с сообщением `'Error: aborted'` and code `'ECONNRESET'`
-   `'close'` на объекте `res`

Если `req.destroy()` вызван до назначения сокета, порядок событий:

-   (здесь вызывается `req.destroy()`)
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'` либо с ошибкой, с которой был вызван `req.destroy()`
-   `'close'`

Если `req.destroy()` вызван до успешного соединения:

-   `'socket'`
-   (здесь вызывается `req.destroy()`)
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'` либо с ошибкой, с которой был вызван `req.destroy()`
-   `'close'`

Если `req.destroy()` вызван после получения ответа:

-   `'socket'`
-   `'response'`
    -   `'data'` произвольное число раз на объекте `res`
-   (здесь вызывается `req.destroy()`)
-   `'aborted'` на объекте `res`
-   `'close'`
-   `'error'` на объекте `res` с ошибкой с сообщением `'Error: aborted'` и кодом `'ECONNRESET'` либо с ошибкой, с которой был вызван `req.destroy()`
-   `'close'` на объекте `res`

Если `req.abort()` вызван до назначения сокета:

-   (здесь вызывается `req.abort()`)
-   `'abort'`
-   `'close'`

Если `req.abort()` вызван до успешного соединения:

-   `'socket'`
-   (здесь вызывается `req.abort()`)
-   `'abort'`
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'`
-   `'close'`

Если `req.abort()` вызван после получения ответа:

-   `'socket'`
-   `'response'`
    -   `'data'` произвольное число раз на объекте `res`
-   (здесь вызывается `req.abort()`)
-   `'abort'`
-   `'aborted'` на объекте `res`
-   `'error'` на объекте `res` с ошибкой с сообщением `'Error: aborted'` and code `'ECONNRESET'`.
-   `'close'`
-   `'close'` на объекте `res`

Опция `timeout` или `setTimeout()` сами по себе не прерывают запрос — только добавляют событие `'timeout'`.

`AbortSignal` и `abort()` на `AbortController` ведут себя как `.destroy()` на запросе: `'error'` с сообщением `'AbortError: The operation was aborted'`, кодом `'ABORT_ERR'` и при необходимости `cause`.

## `http.validateHeaderName(name[, label])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метка для сообщения об ошибке. **По умолчанию:** `'Header name'`.

Низкоуровневая проверка `name`, как при `res.setHeader(name, value)`.

Недопустимое `name` даёт [`TypeError`](errors.md#class-typeerror) с `code: 'ERR_INVALID_HTTP_TOKEN'`.

Вызывать перед передачей заголовков в запрос/ответ не обязательно — модуль HTTP проверит сам.

Пример:

=== "MJS"

    ```js
    import { validateHeaderName } from 'node:http';

    try {
      validateHeaderName('');
    } catch (err) {
      console.error(err instanceof TypeError); // --> true
      console.error(err.code); // --> 'ERR_INVALID_HTTP_TOKEN'
      console.error(err.message); // --> 'Header name must be a valid HTTP token [""]'
    }
    ```

=== "CJS"

    ```js
    const { validateHeaderName } = require('node:http');

    try {
      validateHeaderName('');
    } catch (err) {
      console.error(err instanceof TypeError); // --> true
      console.error(err.code); // --> 'ERR_INVALID_HTTP_TOKEN'
      console.error(err.message); // --> 'Header name must be a valid HTTP token [""]'
    }
    ```

## `http.validateHeaderValue(name, value)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Низкоуровневая проверка `value`, как при `res.setHeader(name, value)`.

Недопустимое значение даёт [`TypeError`](errors.md#class-typeerror).

-   `undefined` — `code: 'ERR_HTTP_INVALID_HEADER_VALUE'`.
-   недопустимый символ — `code: 'ERR_INVALID_CHAR'`.

Вызывать перед передачей заголовков не обязательно — модуль HTTP проверит сам.

Примеры:

=== "MJS"

    ```js
    import { validateHeaderValue } from 'node:http';

    try {
      validateHeaderValue('x-my-header', undefined);
    } catch (err) {
      console.error(err instanceof TypeError); // --> true
      console.error(err.code === 'ERR_HTTP_INVALID_HEADER_VALUE'); // --> true
      console.error(err.message); // --> 'Invalid value "undefined" for header "x-my-header"'
    }

    try {
      validateHeaderValue('x-my-header', 'oʊmɪɡə');
    } catch (err) {
      console.error(err instanceof TypeError); // --> true
      console.error(err.code === 'ERR_INVALID_CHAR'); // --> true
      console.error(err.message); // --> 'Invalid character in header content ["x-my-header"]'
    }
    ```

=== "CJS"

    ```js
    const { validateHeaderValue } = require('node:http');

    try {
      validateHeaderValue('x-my-header', undefined);
    } catch (err) {
      console.error(err instanceof TypeError); // --> true
      console.error(err.code === 'ERR_HTTP_INVALID_HEADER_VALUE'); // --> true
      console.error(err.message); // --> 'Invalid value "undefined" for header "x-my-header"'
    }

    try {
      validateHeaderValue('x-my-header', 'oʊmɪɡə');
    } catch (err) {
      console.error(err instanceof TypeError); // --> true
      console.error(err.code === 'ERR_INVALID_CHAR'); // --> true
      console.error(err.message); // --> 'Invalid character in header content ["x-my-header"]'
    }
    ```

## `http.setMaxIdleHTTPParsers(max)`

-   `max` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `1000`.

Задаёт максимальное число простаивающих HTTP-парсеров.

## `http.setGlobalProxyFromEnv([proxyEnv])`

-   `proxyEnv` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Конфигурация прокси; те же поля, что у опции `proxyEnv` у [`Agent`](#class-httpagent). **По умолчанию:** `process.env`.
-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция восстановления прежних настроек агента и диспетчера до вызова `http.setGlobalProxyFromEnv()`.

Сбрасывает глобальные настройки и включает встроенный прокси для `fetch()` и `http.request()`/`https.request()` во время работы, вместо флага `--use-env-proxy` или переменной `NODE_USE_ENV_PROXY`. Можно переопределить настройки из окружения.

Перезаписывает `http.globalAgent`, `https.globalAgent` и глобальный диспетчер undici; лучше вызывать до любых запросов, не в середине запросов.

См. [встроенную поддержку прокси](#built-in-proxy-support) о форматах URL прокси и синтаксисе `NO_PROXY`.

## Класс: `WebSocket`

Реализация [WebSocket](globals.md), совместимая с браузером.

## Встроенная поддержка прокси {#built-in-proxy-support}

!!!warning "Стабильность: 1.1 - Активная разработка"

При создании глобального агента, если `NODE_USE_ENV_PROXY=1` или включён `--use-env-proxy`, агент собирается с `proxyEnv: process.env` и прокси берётся из переменных окружения.

Динамически включить прокси глобально: [`http.setGlobalProxyFromEnv()`](#httpsetglobalproxyfromenvproxyenv).

У пользовательских агентов передайте опцию `proxyEnv`: `process.env` для наследования из окружения или объект с явными значениями.

Проверяются поля `proxyEnv`:

-   `HTTP_PROXY` или `http_proxy`: URL прокси для HTTP; при обоих приоритет у `http_proxy`.
-   `HTTPS_PROXY` или `https_proxy`: URL для HTTPS; приоритет у `https_proxy`.
-   `NO_PROXY` или `no_proxy`: список хостов без прокси через запятую; приоритет у `no_proxy`.

Для Unix domain socket настройки прокси игнорируются.

### Формат URL прокси

Протоколы HTTP или HTTPS:

-   HTTP: `http://proxy.example.com:8080`
-   HTTPS: `https://proxy.example.com:8080`
-   С аутентификацией: `http://username:password@proxy.example.com:8080`

### Формат `NO_PROXY`

Поддерживаются варианты:

-   `*` — обход прокси для всех хостов
-   `example.com` — точное совпадение имени
-   `.example.com` — суффикс домена (`sub.example.com`)
-   `*.example.com` — шаблон домена
-   `192.168.1.100` — точный IP
-   `192.168.1.1-192.168.1.100` — диапазон IP
-   `example.com:8080` — хост с портом

Несколько записей через запятую.

### Пример

Запуск процесса с прокси для запросов через глобальный агент — переменная `NODE_USE_ENV_PROXY`:

```console
NODE_USE_ENV_PROXY=1 HTTP_PROXY=http://proxy.example.com:8080 NO_PROXY=localhost,127.0.0.1 node client.js
```

Или флаг `--use-env-proxy`.

```console
HTTP_PROXY=http://proxy.example.com:8080 NO_PROXY=localhost,127.0.0.1 node --use-env-proxy client.js
```

Чтобы динамически и глобально включить поддержку прокси через `process.env` (поведение `http.setGlobalProxyFromEnv()` по умолчанию):

=== "CJS"

    ```js
    const http = require('node:http');

    // Читает из process.env переменные окружения, связанные с прокси
    const restore = http.setGlobalProxyFromEnv();

    // Последующие запросы будут использовать настроенные прокси из переменных окружения
    http.get('http://www.example.com', (res) => {
      // Запрос пойдёт через прокси, если заданы HTTP_PROXY или http_proxy
    });

    fetch('https://www.example.com', (res) => {
      // Запрос пойдёт через прокси, если заданы HTTPS_PROXY или https_proxy
    });

    // Чтобы вернуть исходные глобальные настройки агента и диспетчера, вызовите возвращённую функцию.
    // restore();
    ```

=== "MJS"

    ```js
    import http from 'node:http';

    // Читает из process.env переменные окружения, связанные с прокси
    http.setGlobalProxyFromEnv();

    // Последующие запросы будут использовать настроенные прокси из переменных окружения
    http.get('http://www.example.com', (res) => {
      // Запрос пойдёт через прокси, если заданы HTTP_PROXY или http_proxy
    });

    fetch('https://www.example.com', (res) => {
      // Запрос пойдёт через прокси, если заданы HTTPS_PROXY или https_proxy
    });

    // Чтобы вернуть исходные глобальные настройки агента и диспетчера, вызовите возвращённую функцию.
    // restore();
    ```

Чтобы динамически и глобально включить поддержку прокси с пользовательскими настройками:

=== "CJS"

    ```js
    const http = require('node:http');

    const restore = http.setGlobalProxyFromEnv({
      http_proxy: 'http://proxy.example.com:8080',
      https_proxy: 'https://proxy.example.com:8443',
      no_proxy: 'localhost,127.0.0.1,.internal.example.com',
    });

    // Последующие запросы будут использовать настроенные прокси
    http.get('http://www.example.com', (res) => {
      // Этот запрос пойдёт через прокси proxy.example.com:8080
    });

    fetch('https://www.example.com', (res) => {
      // Этот запрос пойдёт через прокси proxy.example.com:8443
    });
    ```

=== "MJS"

    ```js
    import http from 'node:http';

    http.setGlobalProxyFromEnv({
      http_proxy: 'http://proxy.example.com:8080',
      https_proxy: 'https://proxy.example.com:8443',
      no_proxy: 'localhost,127.0.0.1,.internal.example.com',
    });

    // Последующие запросы будут использовать настроенные прокси
    http.get('http://www.example.com', (res) => {
      // Этот запрос пойдёт через прокси proxy.example.com:8080
    });

    fetch('https://www.example.com', (res) => {
      // Этот запрос пойдёт через прокси proxy.example.com:8443
    });
    ```

Чтобы создать пользовательский агент со встроенной поддержкой прокси:

=== "CJS"

    ```js
    const http = require('node:http');

    // Пользовательский агент с настройкой прокси.
    const agent = new http.Agent({ proxyEnv: { HTTP_PROXY: 'http://proxy.example.com:8080' } });

    http.request({
      hostname: 'www.example.com',
      port: 80,
      path: '/',
      agent,
    }, (res) => {
      // Запрос пойдёт через proxy.example.com:8080 по протоколу HTTP.
      console.log(`Статус: ${res.statusCode}`);
    });
    ```

Другой вариант, который тоже работает:

=== "CJS"

    ```js
    const http = require('node:http');
    // Имя опции в нижнем регистре.
    const agent1 = new http.Agent({ proxyEnv: { http_proxy: 'http://proxy.example.com:8080' } });
    // Значения из переменных окружения: при запуске, например, с
    // HTTP_PROXY=http://proxy.example.com:8080 будет использован прокси из process.env.HTTP_PROXY.
    const agent2 = new http.Agent({ proxyEnv: process.env });
    ```
