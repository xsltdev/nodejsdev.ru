---
description: Интерфейсы HTTP в Node.js разработаны для поддержки многих особенностей протокола, которые традиционно были сложны в использовании
---

# HTTP

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/http.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Для использования HTTP-сервера и клиента необходимо `require('node:http')`.

Интерфейсы HTTP в Node.js разработаны для поддержки многих особенностей протокола, которые традиционно были сложны в использовании. В частности, большие, возможно, закодированные в виде кусков, сообщения. Интерфейс тщательно следит за тем, чтобы никогда не буферизировать целые запросы или ответы, поэтому пользователь может передавать данные в потоковом режиме.

Заголовки HTTP-сообщений представлены объектом следующим образом:

```js
{
	'content-length': '123',
    'content-type': 'text/plain',
    'connection': 'keep-alive',
    'host': 'example.com',
    'accept': '*/*'
}
```

Ключи приводятся в нижнем регистре. Значения не изменяются.

Для того чтобы поддерживать весь спектр возможных HTTP-приложений, HTTP API Node.js является очень низкоуровневым. Он занимается только обработкой потоков и разбором сообщений. Он разбирает сообщение на заголовки и тело, но не разбирает собственно заголовки или тело.

Смотрите [`message.headers`](#messageheaders) для подробностей о том, как обрабатываются дублирующиеся заголовки.

Необработанные заголовки в том виде, в котором они были получены, сохраняются в свойстве `rawHeaders`, которое представляет собой массив `[key, value, key2, value2, ...]`. Например, объект заголовка предыдущего сообщения может иметь следующий список `rawHeaders`:

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

<!-- 0000.part.md -->

## Класс http.Agent

Агент отвечает за управление сохранением и повторным использованием соединений для HTTP-клиентов. Он поддерживает очередь ожидающих запросов для данного хоста и порта, повторно используя одно сокетное соединение для каждого до тех пор, пока очередь не опустеет, после чего сокет либо уничтожается, либо помещается в пул, где он хранится для повторного использования для запросов к тому же хосту и порту. Будет ли он уничтожен или помещен в пул, зависит от `keepAlive` [опция](#new-agent).

Для пула соединений включена функция TCP Keep-Alive, но серверы могут закрывать простаивающие соединения, в этом случае они будут удалены из пула, а новое соединение будет создано при новом HTTP-запросе на этот хост и порт. Серверы также могут отказаться разрешать несколько запросов через одно и то же соединение, в этом случае соединение будет создаваться заново для каждого запроса и не может быть объединено в пул. Агент будет по-прежнему выполнять запросы к этому серверу, но каждый запрос будет выполняться через новое соединение.

Когда соединение закрывается клиентом или сервером, оно удаляется из пула. Любые неиспользуемые сокеты в пуле будут удалены, чтобы не заставлять процесс Node.js работать, когда нет незавершенных запросов. (см. [`socket.unref()`](net.md#socketunref)).

Хорошей практикой является [`destroy()`](#agentdestroy) экземпляра `Agent`, когда он больше не используется, поскольку неиспользуемые сокеты потребляют ресурсы ОС.

Сокеты удаляются из агента, когда сокет испускает либо событие `'close'`, либо событие `'agentRemove'`. Если вы хотите держать один HTTP-запрос открытым в течение длительного времени, не сохраняя его в агенте, можно поступить следующим образом:

```js
http.get(options, (res) => {
    // Делаем что-нибудь
}).on('socket', (socket) => {
    socket.emit('agentRemove');
});
```

Агент также может быть использован для отдельного запроса. Если указать `{agent: false}` в качестве опции для функций `http.get()` или `http.request()`, то для клиентского соединения будет использоваться одноразовый `Agent` с параметрами по умолчанию.

`agent:false`:

```js
http.get(
    {
        hostname: 'localhost',
        port: 80,
        path: '/',
        agent: false, // Создаем нового агента только для этого запроса
    },
    (res) => {
        // Делаем что-нибудь с ответом
    }
);
```

<!-- 0001.part.md -->

### new Agent

```js
new Agent([options]);
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Набор конфигурируемых опций для установки на агента. Может иметь следующие поля:
    -   `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Сохранять сокеты даже при отсутствии невыполненных запросов, чтобы их можно было использовать для будущих запросов без необходимости восстанавливать TCP-соединение. Не путать со значением `keep-alive` заголовка `Connection`. Заголовок `Connection: keep-alive` всегда отправляется при использовании агента, за исключением случаев, когда заголовок `Connection` указан явно или когда опции `keepAlive` и `maxSockets` соответственно установлены в `false` и `Infinity`, в этом случае будет использоваться `Connection: close`. **По умолчанию:** `false`.
    -   `keepAliveMsecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) При использовании опции `keepAlive` указывает [начальную задержку](net.md#socketsetkeepaliveenable-initialdelay) для пакетов TCP Keep-Alive. Игнорируется, если опция `keepAlive` имеет значение `false` или `undefined`. **По умолчанию:** `1000`.
    -   `maxSockets` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество сокетов, разрешенное для одного хоста. Если один и тот же хост открывает несколько одновременных соединений, каждый запрос будет использовать новый сокет, пока не будет достигнуто значение `maxSockets`. Если хост пытается открыть больше соединений, чем `maxSockets`, дополнительные запросы попадают в очередь ожидающих запросов и переходят в состояние активного соединения, когда существующее соединение завершается. Это гарантирует, что в любой момент времени с данного хоста будет не более `maxSockets` активных соединений. **По умолчанию:** `бесконечность`.
    -   `maxTotalSockets` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество сокетов, разрешенное для всех хостов в целом. Каждый запрос будет использовать новый сокет, пока не будет достигнуто максимальное значение. **По умолчанию:** `Infinity`.
    -   `maxFreeSockets` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество сокетов на хосте, которое можно оставить открытым в свободном состоянии. Имеет значение, только если `keepAlive` установлено в `true`. **По умолчанию:** `256`.
    -   `scheduling` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Стратегия планирования, которую следует применять при выборе следующего свободного сокета для использования. Это может быть `'fifo'` или `'lifo'`. Основное различие между этими двумя стратегиями планирования заключается в том, что `'lifo'` выбирает последний использованный сокет, а `'fifo'` выбирает наименее использованный сокет. В случае низкой скорости запросов в секунду, планирование `'lifo'` снижает риск выбора сокета, который мог быть закрыт сервером из-за неактивности. В случае высокой скорости запросов в секунду, планирование `'fifo'` будет максимизировать количество открытых сокетов, в то время как планирование `'lifo'` будет поддерживать его на минимально возможном уровне. **По умолчанию:** `'lifo'`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут сокета в миллисекундах. Таймаут устанавливается при создании сокета.

Также поддерживаются `опции` в [`socket.connect()`](net.md#socketconnectoptions-connectlistener).

В стандартном [`http.globalAgent`](#httpglobalagent), который используется [`http.request()`](#httprequestoptions-callback), все эти значения установлены по умолчанию.

Для настройки любого из них необходимо создать пользовательский экземпляр `http.Agent`.

```js
const http = require('node:http');
const keepAliveAgent = new http.Agent({ keepAlive: true });
options.agent = keepAliveAgent;
http.request(options, onResponseCallback);
```

### agent.createConnection

```js
agent.createConnection(options[, callback])
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Опции, содержащие детали соединения. Формат опций смотрите в [`net.createConnection()`](net.md#netcreateconnectionoptions-connectlistener)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова, которая получает созданный сокет
-   Возвращает: {stream.Duplex}

Создает сокет/поток, который будет использоваться для HTTP-запросов.

По умолчанию эта функция аналогична [`net.createConnection()`](net.md#netcreateconnectionoptions-connectlistener). Однако пользовательские агенты могут переопределить этот метод, если требуется большая гибкость.

Сокет/поток может быть предоставлен одним из двух способов: путем возврата сокета/потока из этой функции или путем передачи сокета/потока в `callback`.

Этот метод гарантированно возвращает экземпляр класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

`callback` имеет сигнатуру `(err, stream)`.

<!-- 0003.part.md -->

### agent.keepSocketAlive

```js
agent.keepSocketAlive(socket);
```

-   `socket` {stream.Duplex}

Вызывается, когда `socket` отделяется от запроса и может быть сохранен `агентом`. Поведение по умолчанию:

```js
socket.setKeepAlive(true, this.keepAliveMsecs);
socket.unref();
return true;
```

Этот метод может быть переопределен конкретным подклассом `Agent`. Если этот метод возвращает ложное значение, то сокет будет уничтожен, а не сохранен для использования при следующем запросе.

Аргумент `socket` может быть экземпляром [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}.

<!-- 0004.part.md -->

### agent.reuseSocket

```js
agent.reuseSocket(socket, request);
```

-   `socket` {stream.Duplex}
-   `request` {http.ClientRequest}

Вызывается, когда `socket` присоединяется к `request` после того, как он был сохранен из-за опций keep-alive. Поведение по умолчанию таково:

```js
socket.ref();
```

Этот метод может быть переопределен конкретным подклассом `Agent`.

Аргумент `socket` может быть экземпляром [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}.

<!-- 0005.part.md -->

### agent.destroy

```js
agent.destroy();
```

Уничтожьте все сокеты, которые в настоящее время используются агентом.

Обычно в этом нет необходимости. Однако если используется агент с включенной опцией `keepAlive`, то лучше всего явно завершить работу агента, когда он больше не нужен. В противном случае сокеты могут оставаться открытыми довольно долгое время, прежде чем сервер их завершит.

<!-- 0006.part.md -->

### agent.freeSockets

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект, который содержит массивы сокетов, ожидающих использования агентом, когда включено `keepAlive`. Не модифицируйте.

Сокеты в списке `freeSockets` будут автоматически уничтожены и удалены из массива по `таймауту`.

<!-- 0007.part.md -->

### agent.getName

```js
agent.getName([options]);
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Набор опций, предоставляющих информацию для генерации имени
    -   `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Доменное имя или IP-адрес сервера, на который будет отправлен запрос
    -   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт удаленного сервера
    -   `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный интерфейс для привязки сетевых соединений при выдаче запроса
    -   `family` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Должно быть 4 или 6, если это не равно `undefined`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Получает уникальное имя для набора опций запроса, чтобы определить, может ли соединение быть использовано повторно. Для HTTP-агента это возвращает `host:port:localAddress` или `host:port:localAddress:family`. Для HTTPS-агента имя включает CA, cert, шифры и другие специфические для HTTPS/TLS опции, определяющие возможность повторного использования сокета.

<!-- 0008.part.md -->

### agent.maxFreeSockets

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

По умолчанию установлено значение 256. Для агентов с включенной опцией `keepAlive` задается максимальное количество сокетов, которые будут оставлены открытыми в свободном состоянии.

<!-- 0009.part.md -->

### agent.maxSockets

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

По умолчанию установлено на `бесконечность`. Определяет, сколько одновременных сокетов может быть открыто агентом для каждого origin. Origin - это возвращаемое значение [`agent.getName()`](#agentgetname).

<!-- 0010.part.md -->

### agent.maxTotalSockets

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

По умолчанию имеет значение `бесконечность`. Определяет, сколько одновременных сокетов может быть открыто у агента. В отличие от `maxSockets`, этот параметр применяется ко всем источникам.

<!-- 0011.part.md -->

### agent.requests

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект, содержащий очереди запросов, которые еще не были назначены на сокеты. Не модифицируйте.

<!-- 0012.part.md -->

### agent.sockets

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект, содержащий массивы сокетов, используемых агентом в данный момент. Не модифицировать.

<!-- 0013.part.md -->

## Класс http.ClientRequest

-   Расширяет: {http.OutgoingMessage}

Этот объект создается внутри и возвращается из [`http.request()`](#httprequest). Он представляет _проходящий_ запрос, заголовок которого уже поставлен в очередь. Заголовок все еще можно изменить с помощью API [`setHeader(name, value)`](#requestsetheader), [`getHeader(name)`](#requestgetheader), [`removeHeader(name)`](#requestremoveheader). Фактический заголовок будет отправлен вместе с первым куском данных или при вызове [`request.end()`](#requestend).

Чтобы получить ответ, добавьте к объекту запроса слушатель для [`'response'`](#response). [`'response'`](#response) будет испущен из объекта запроса, когда будут получены заголовки ответа. Событие [`'response'`](#response) выполняется с одним аргументом, который является экземпляром [`http.IncomingMessage`](#httpincomingmessage).

Во время события [`response`](#response) можно добавить слушателей к объекту ответа, в частности, для прослушивания события `данные`.

Если обработчик [`response`](#event-response) не добавлен, то ответ будет полностью отброшен. Однако если обработчик события [`'response'`](#event-response) добавлен, то данные из объекта ответа **должны** быть потреблены, либо вызовом `response.read()` при каждом событии `'readable'`, либо добавлением обработчика `'data'`, либо вызовом метода `.resume()`. Пока данные не будут прочитаны, событие `'end'` не произойдет. Кроме того, пока данные не будут считаны, будет расходоваться память, что в конечном итоге может привести к ошибке "процесс вышел из памяти".

Для обратной совместимости, `res` будет выдавать `'error'` только если зарегистрирован слушатель `'error'`.

Установите заголовок `Content-Length`, чтобы ограничить размер тела ответа. Если [`response.strictContentLength`](#responsestrictcontentlength) установлен в `true`, несоответствие значения заголовка `Content-Length` приведет к возникновению `ошибки`, определяемой `code:` [`'ERR_HTTP_CONTENT_LENGTH_MISMATCH`](errors.md#err_http_content_length_mismatch).

Значение `Content-Length` должно быть в байтах, а не в символах. Используйте [`Buffer.byteLength()`](buffer.md#static-method-bufferbytelengthstring-encoding) для определения длины тела в байтах.

<!-- 0014.part.md -->

### Событие abort

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого слушайте событие `'close'`.

Выдается, когда запрос был прерван клиентом. Это событие происходит только при первом вызове `abort()`.

<!-- 0015.part.md -->

### Событие close

Указывает, что запрос завершен, или его базовое соединение было прервано преждевременно (до завершения ответа).

<!-- 0016.part.md -->

### Событие connect

-   `ответ` {http.IncomingMessage}
-   `сокет` {stream.Duplex}
-   `head` [`<Buffer>`](buffer.md#buffer)

Выдается каждый раз, когда сервер отвечает на запрос методом `CONNECT`. Если это событие не прослушивается, клиенты, получающие метод `CONNECT`, закрывают свои соединения.

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если только пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

Пара клиент-сервер демонстрирует, как слушать событие `'connect'`:

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
    const serverSocket = net.connect(
        port || 80,
        hostname,
        () => {
            clientSocket.write(
                'HTTP/1.1 200 Connection Established\r\n' +
                    'Proxy-agent: Node.js-Proxy\r\n' +
                    '\r\n'
            );
            serverSocket.write(head);
            serverSocket.pipe(clientSocket);
            clientSocket.pipe(serverSocket);
        }
    );
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
        socket.write(
            'GET / HTTP/1.1\r\n' +
                'Host: www.google.com:80\r\n' +
                'Connection: close\r\n' +
                '\r\n'
        );
        socket.on('data', (chunk) => {
            console.log(chunk.toString());
        });
        socket.on('end', () => {
            proxy.close();
        });
    });
});
```

<!-- 0017.part.md -->

### Событие continue

Выдается, когда сервер посылает HTTP-ответ '100 Continue', обычно потому, что запрос содержит 'Expect: 100-continue'. Это указание, что клиент должен отправить тело запроса.

<!-- 0018.part.md -->

### Событие finish

Вызывается, когда запрос отправлен. Точнее, это событие возникает, когда последний сегмент заголовков и тела ответа был передан операционной системе для передачи по сети. Это не означает, что сервер уже что-то получил.

<!-- 0019.part.md -->

### Событие information

-   `info` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `httpVersion` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `httpVersionMajor` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `httpVersionMinor` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `statusCode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `statusMessage` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `rawHeaders` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Выдается, когда сервер посылает промежуточный ответ 1xx (исключая 101 Upgrade). Слушатели этого события получат объект, содержащий версию HTTP, код статуса, сообщение о статусе, объект заголовков с ключевыми значениями и массив с именами необработанных заголовков, за которыми следуют их соответствующие значения.

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
    console.log(
        `Got information prior to main response: ${info.statusCode}`
    );
});
```

Статусы 101 Upgrade не вызывают этого события из-за отхода от традиционной цепочки HTTP-запросов/ответов, таких как веб-сокеты, обновления TLS на месте или HTTP 2.0. Чтобы получать уведомления о 101 обновлении, вместо этого слушайте событие [`'upgrade'`](#upgrade).

<!-- 0020.part.md -->

### Событие response

-   `response` {http.IncomingMessage}

Испускается, когда получен ответ на данный запрос. Это событие испускается только один раз.

<!-- 0021.part.md -->

### Событие socket

-   `socket` {stream.Duplex}

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

<!-- 0022.part.md -->

### Событие timeout

Выдается, когда базовый сокет завершает работу от бездействия. Это только уведомляет о том, что сокет бездействовал. Запрос должен быть уничтожен вручную.

См. также: [`request.setTimeout()`](#requestsettimeouttimeout-callback).

<!-- 0023.part.md -->

### Событие upgrade

-   `ответ` {http.IncomingMessage}
-   `сокет` {stream.Duplex}
-   `head` [`<Buffer>`](buffer.md#buffer)

Выдается каждый раз, когда сервер отвечает на запрос с обновлением. Если это событие не прослушивается и код состояния ответа равен 101 Switching Protocols, клиенты, получившие заголовок обновления, закрывают свои соединения.

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если только пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

Пара клиент-сервер демонстрирует, как прослушивать событие `update`.

```js
const http = require('node:http');

// Create an HTTP server
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
});
server.on('upgrade', (req, socket, head) => {
    socket.write(
        'HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
            'Upgrade: WebSocket\r\n' +
            'Connection: Upgrade\r\n' +
            '\r\n'
    );

    socket.pipe(socket); // echo back
});

// Now that server is running
server.listen(1337, '127.0.0.1', () => {
    // make a request
    const options = {
        port: 1337,
        host: '127.0.0.1',
        headers: {
            Connection: 'Upgrade',
            Upgrade: 'websocket',
        },
    };

    const req = http.request(options);
    req.end();

    req.on('upgrade', (res, socket, upgradeHead) => {
        console.log('got upgraded!');
        socket.end();
        process.exit(0);
    });
});
```

<!-- 0024.part.md -->

### request.abort

```js
request.abort();
```

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого используйте [`request.destroy()`](#requestdestroyerror).

Помечает запрос как прерванный. Вызов этой функции приведет к тому, что оставшиеся данные в ответе будут удалены, а сокет будет уничтожен.

<!-- 0025.part.md -->

### request.aborted

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого проверьте [`request.destroyed`](#requestdestroyed).

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `request.aborted` будет `true`, если запрос был прерван.

<!-- 0026.part.md -->

### request.connection

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`request.socket`](#requestsocket).

-   {stream.Duplex}

См. [`request.socket`](#requestsocket).

<!-- 0027.part.md -->

### request.cork

```js
request.cork();
```

См. [`writable.cork()`](stream.md#writablecork).

<!-- 0028.part.md -->

### request.end

```js
request.end([data[, encoding]][, callback])
```

-   `данные` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Завершает отправку запроса. Если какие-либо части тела остались неотправленными, он спустит их в поток. Если запрос чанкирован, то будет отправлено завершающее `'0\r\n\r\n'`.

Если указано `data`, это эквивалентно вызову [`request.write(data, encoding)`](#requestwritechunk-encoding-callback), за которым следует `request.end(callback)`.

Если указан `callback`, он будет вызван, когда поток запросов завершится.

<!-- 0029.part.md -->

### request.destroy

```js
request.destroy([error]);
```

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Необязательно, ошибка, которую нужно выдать с событием `'error'`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожить запрос. Опционально выдает событие `'error'` и выдает событие `'close'`. Вызов этой функции приведет к тому, что оставшиеся данные в ответе будут сброшены, а сокет будет уничтожен.

Подробности см. в [`writable.destroy()`](stream.md#writabledestroyerror).

<!-- 0030.part.md -->

#### request.destroyed

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после вызова [`request.destroy()`](#requestdestroy).

Более подробную информацию смотрите в [`writable.destroyed`](stream.md#writabledestroyed).

<!-- 0031.part.md -->

### request.finished

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`request.writableEnded`](#requestwritableended).

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `request.finished` будет `true`, если был вызван [`request.end()`](#requestend). Свойство `request.end()` будет вызвано автоматически, если запрос был инициирован через [`http.get()`](#httpgetoptions-callback).

<!-- 0032.part.md -->

### request.flushHeaders

```js
request.flushHeaders();
```

Смывает заголовки запроса.

В целях эффективности Node.js обычно буферизирует заголовки запроса до тех пор, пока не будет вызван `request.end()` или не будет записан первый фрагмент данных запроса. Затем он пытается упаковать заголовки запроса и данные в один TCP-пакет.

Обычно это желательно (это экономит время на обход TCP), но не тогда, когда первые данные не будут отправлены, возможно, намного позже. Функция `request.flushHeaders()` обходит эту оптимизацию и запускает запрос.

<!-- 0033.part.md -->

### request.getHeader

```js
request.getHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Считывает заголовок запроса. Имя не чувствительно к регистру. Тип возвращаемого значения зависит от аргументов, переданных в [`request.setHeader()`](#requestsetheadername-value).

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
// 'contentType' - 'text/html'
const contentLength = request.getHeader('Content-Length');
// 'contentLength' имеет тип число
const cookie = request.getHeader('Cookie');
// 'cookie' имеет тип string[]
```

<!-- 0034.part.md -->

### request.getHeaderNames

```js
request.getHeaderNames();
```

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив, содержащий уникальные имена текущих исходящих заголовков. Все имена заголовков в нижнем регистре.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Cookie', ['foo=bar', 'bar=baz']);

const headerNames = request.getHeaderNames();
// headerNames === ['foo', 'cookie']
```

<!-- 0035.part.md -->

### request.getHeaders

```js
request.getHeaders();
```

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает неглубокую копию текущих исходящих заголовков. Поскольку используется неглубокая копия, значения массива могут быть изменены без дополнительных вызовов различных методов модуля http, связанных с заголовками. Ключами возвращаемого объекта являются имена заголовков, а значениями - соответствующие значения заголовков. Все имена заголовков пишутся в нижнем регистре.

Объект, возвращаемый методом `request.getHeaders()`, _не_ прототипически наследует от JavaScript `Object`. Это означает, что типичные методы `Object`, такие как `obj.toString()`, `obj.hasOwnProperty()` и другие, не определены и _не будут работать_.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Cookie', ['foo=bar', 'bar=baz']);

const headers = request.getHeaders();
// headers === { foo: 'bar', 'cookie': ['foo=bar', 'bar=baz'] }
```

<!-- 0036.part.md -->

### request.getRawHeaderNames

```js
request.getRawHeaderNames();
```

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив, содержащий уникальные имена текущих исходящих необработанных заголовков. Имена заголовков возвращаются с установленным точным регистром.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = request.getRawHeaderNames();
// headerNames === ['Foo', 'Set-Cookie']
```

<!-- 0037.part.md -->

### request.hasHeader

```js
request.hasHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если заголовок, обозначенный `name`, в настоящее время установлен в исходящих заголовках. Соответствие имени заголовка не чувствительно к регистру.

```js
const hasContentType = request.hasHeader('content-type');
```

<!-- 0038.part.md -->

### request.maxHeadersCount

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2000`.

Ограничивает максимальное количество заголовков ответа. Если установлено значение 0, ограничение не будет применяться.

<!-- 0039.part.md -->

### request.path

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь запроса.

<!-- 0040.part.md -->

### request.method

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метод запроса.

<!-- 0041.part.md -->

### request.host

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост запроса.

<!-- 0042.part.md -->

### request.protocol

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Протокол запроса.

<!-- 0043.part.md -->

### request.removeHeader

```js
request.removeHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Удаляет заголовок, который уже определен в объекте headers.

```js
request.removeHeader('Content-Type');
```

<!-- 0044.part.md -->

### request.reusedSocket

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Отправляется ли запрос через повторно используемый сокет.

При отправке запроса через агент с поддержкой keep-alive, базовый сокет может быть использован повторно. Но если сервер закроет соединение в неудачное время, клиент может столкнуться с ошибкой 'ECONNRESET'.

```js
const http = require('node:http');

// По умолчанию сервер имеет таймаут ожидания 5 секунд
http.createServer((req, res) => {
    res.write('hello\n');
    res.end();
}).listen(3000);

setInterval(() => {
    // Адаптация агента keep-alive
    http.get('http://localhost:3000', { agent }, (res) => {
        res.on('data', (data) => {
            // Ничего не делать
        });
    });
}, 5000); // Отправка запроса с интервалом в 5 секунд, так что легко нарваться на таймаут простоя.
```

Пометив запрос, использовал ли он повторно сокет или нет, мы можем сделать автоматический повтор ошибки на его основе.

```js
const http = require('node:http');
const agent = new http.Agent({ keepAlive: true });

function retriableRequest() {
    const req = http
        .get('http://localhost:3000', { agent }, (res) => {
            // ...
        })
        .on('error', (err) => {
            // Проверяем, нужна ли повторная попытка
            if (
                req.reusedSocket &&
                err.code === 'ECONNRESET'
            ) {
                retriableRequest();
            }
        });
}

retriableRequest();
```

<!-- 0045.part.md -->

### request.setHeader

```js
request.setHeader(name, value);
```

-   `имя` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Устанавливает значение одного заголовка для объекта headers. Если этот заголовок уже существует в отправляемых заголовках, его значение будет заменено. Для отправки нескольких заголовков с одинаковым именем используйте массив строк. Значения, не являющиеся строками, будут сохранены без изменений. Поэтому [`request.getHeader()`](#requestgetheader) может возвращать нестроковые значения. Однако нестроковые значения будут преобразованы в строки для передачи по сети.

```js
request.setHeader('Content-Type', 'application/json');
```

или

```js
request.setHeader('Cookie', [
    'type=ninja',
    'language=javascript',
]);
```

Когда значение представляет собой строку, будет выдано исключение, если оно содержит символы вне кодировки `latin1`.

Если вам нужно передать в значении символы UTF-8, пожалуйста, кодируйте значение, используя стандарт [RFC 8187](https://www.rfc-editor.org/rfc/rfc8187.txt).

```js
const filename = 'Rock 🎵.txt';
request.setHeader(
    'Content-Disposition',
    `attachment; filename*=utf-8''${encodeURIComponent(
        filename
    )}`
);
```

<!-- 0046.part.md -->

### request.setNoDelay

```js
request.setNoDelay([noDelay]);
```

-   `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Как только сокет будет назначен этому запросу и подключен [`socket.setNoDelay()`](net.md#socketsetnodelaynodelay) будет вызван.

<!-- 0047.part.md -->

### request.setSocketKeepAlive

```js
request.setSocketKeepAlive([enable][, initialDelay])
```

-   `enable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `initialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Как только сокет будет назначен этому запросу и подключен [`socket.setKeepAlive()`](net.md#socketsetkeepaliveenable-initialdelay) будет вызван.

<!-- 0048.part.md -->

### request.setTimeout

```js
request.setTimeout(timeout[, callback])
```

-   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды до завершения запроса.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция, которая будет вызвана, когда произойдет таймаут. Аналогично привязке к событию `timeout`.
-   Возвращает: {http.ClientRequest}

Когда сокет назначен этому запросу и подключен, будет вызвана функция [`socket.setTimeout()`](net.md#socketsettimeouttimeout-callback).

<!-- 0049.part.md -->

### request.socket

-   {stream.Duplex}

Ссылка на базовый сокет. Обычно пользователи не хотят обращаться к этому свойству. В частности, сокет не будет испускать события `'readable'' из-за того, как парсер протокола присоединяется к сокету.

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
    console.log(
        `Ваш IP-адрес - ${ip}, а порт источника - ${port}.`
    );
    // Потребляем объект ответа
});
```

Это свойство гарантированно является экземпляром класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не указал тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

<!-- 0050.part.md -->

### request.uncork

```js
request.uncork();
```

См. [`writable.uncork()`](stream.md#writableuncork).

<!-- 0051.part.md -->

### request.writableEnded

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после вызова [`request.end()`](#requestend). Это свойство не указывает, были ли данные выгружены, для этого используйте [`request.writableFinished`](#requestwritablefinished).

<!-- 0052.part.md -->

### request.writableFinished

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если все данные были выгружены в базовую систему, непосредственно перед тем, как будет выпущено событие [`'finish'`](#event-finish).

<!-- 0053.part.md -->

### request.write

```js
request.write(chunk[, encoding][, callback])
```

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `обратный вызов` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отправляет фрагмент тела. Этот метод может быть вызван несколько раз. Если не задана `Content-Length`, данные будут автоматически закодированы в кодировке передачи HTTP Chunked, чтобы сервер знал, когда данные заканчиваются. Добавляется заголовок `Transfer-Encoding: chunked`. Вызов [`request.end()`](#requestend) необходим для завершения отправки запроса.

Аргумент `encoding` является необязательным и применяется только в том случае, если `chunk` является строкой. По умолчанию используется значение `'utf8`.

Аргумент `callback` необязателен и будет вызван, когда этот кусок данных будет смыт, но только если кусок не пустой.

Возвращает `true`, если все данные были успешно сброшены в буфер ядра. Возвращает `false`, если все данные или их часть были помещены в пользовательскую память. Когда буфер снова станет свободным, будет выдано сообщение `'drain''.

Когда функция `write` вызывается с пустой строкой или буфером, она ничего не делает и ждет новых данных.

<!-- 0054.part.md -->

## http.Server

-   Расширяет: {net.Server}

<!-- 0055.part.md -->

### Событие: checkContinue

-   `запрос` {http.IncomingMessage}
-   `ответ` {http.ServerResponse}

Выдается каждый раз, когда получен запрос с HTTP `Expect: 100-continue`. Если это событие не прослушивается, сервер автоматически отвечает на запрос с `100 Continue`.

Обработка этого события включает вызов [`response.writeContinue()`](#responsewritecontinue), если клиент должен продолжить отправку тела запроса, или генерацию соответствующего HTTP ответа (например, 400 Bad Request), если клиент не должен продолжать отправку тела запроса.

Когда это событие испущено и обработано, событие [`'request'`](#event-request) не будет испущено.

<!-- 0056.part.md -->

### Событие: checkExpectation

-   `запрос` {http.IncomingMessage}
-   `ответ` {http.ServerResponse}

Выдается каждый раз, когда получен запрос с заголовком HTTP `Expect`, значение которого не равно `100-continue`. Если это событие не прослушивается, сервер автоматически отвечает на него сообщением `417 Expectation Failed`.

Когда это событие испущено и обработано, событие [`'request'`](#event-request) не будет испущено.

<!-- 0057.part.md -->

### Событие: clientError

-   `exception` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   `socket` {stream.Duplex}

Если клиентское соединение испускает событие `'error'', оно будет передано сюда. Слушатель этого события отвечает за закрытие/уничтожение базового сокета. Например, можно пожелать более изящно закрыть сокет с помощью пользовательского HTTP-ответа вместо резкого разрыва соединения. Сокет **должен быть закрыт или уничтожен** до завершения работы слушателя.

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

Поведение по умолчанию заключается в попытке закрыть сокет с HTTP '400 Bad Request', или HTTP '431 Request Header Fields Too Large' в случае ошибки [`HPE_HEADER_OVERFLOW`](errors.md#hpe_header_overflow). Если сокет не доступен для записи или были отправлены заголовки текущего присоединенного [`http.ServerResponse`](#httpserverresponse), он немедленно уничтожается.

`socket` - это объект [`net.Socket`](net.md#class-netsocket), с которого произошла ошибка.

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

Когда происходит событие `clientError`, не существует ни объекта `request`, ни объекта `response`, поэтому любой отправленный HTTP-ответ, включая заголовки ответа и полезную нагрузку, _должен_ быть записан непосредственно в объект `socket`. Необходимо следить за тем, чтобы ответ был правильно отформатированным сообщением HTTP-ответа.

`err` - это экземпляр `Error` с двумя дополнительными колонками:

-   `bytesParsed`: количество байт пакета запроса, который Node.js, возможно, разобрал правильно;
-   `rawPacket`: необработанный пакет текущего запроса.

В некоторых случаях клиент уже получил ответ и/или сокет уже был уничтожен, как в случае ошибок `ECONNRESET`. Прежде чем пытаться отправить данные в сокет, лучше проверить, что он все еще доступен для записи.

```js
server.on('clientError', (err, socket) => {
    if (err.code === 'ECONNRESET' || !socket.writable) {
        return;
    }

    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
```

<!-- 0058.part.md -->

### Событие: close

Выдается при закрытии сервера.

<!-- 0059.part.md -->

### Событие: connect

-   `request` {http.IncomingMessage} Аргументы для HTTP-запроса, как в событии [`'request'`](#event-request)
-   `socket` {stream.Duplex} Сетевой сокет между сервером и клиентом
-   `head` [`<Buffer>`](buffer.md#buffer) Первый пакет туннелируемого потока (может быть пустым).

Выдается каждый раз, когда клиент запрашивает метод HTTP `CONNECT`. Если это событие не прослушивается, то клиенты, запрашивающие метод `CONNECT`, будут иметь закрытые соединения.

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

После испускания этого события сокет запроса не будет иметь слушателя события `'data'`, что означает, что для обработки данных, отправленных на сервер по этому сокету, его нужно будет привязать.

<!-- 0060.part.md -->

### Событие: connection

-   `socket` {stream.Duplex}

Это событие возникает при установлении нового TCP-потока. `socket` обычно представляет собой объект типа [`net.Socket`](net.md#class-netsocket). Обычно пользователи не хотят обращаться к этому событию. В частности, сокет не будет испускать события `readable` из-за того, как парсер протокола присоединяется к сокету. Доступ к `socket` можно также получить через `request.socket`.

Это событие также может быть явно вызвано пользователями для инъекции соединений в HTTP-сервер. В этом случае может быть передан любой поток [`Duplex`](stream.md#class-streamduplex).

Если здесь вызывается `socket.setTimeout()`, то таймаут будет заменен на `server.keepAliveTimeout`, когда сокет обслужит запрос (если `server.keepAliveTimeout` ненулевой).

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

<!-- 0061.part.md -->

### Событие: dropRequest

-   `request` {http.IncomingMessage} Аргументы для HTTP-запроса, как в событии [`'request'`](#event-request)
-   `socket` {stream.Duplex} Сетевой сокет между сервером и клиентом

Когда количество запросов на сокете достигнет порога `server.maxRequestsPerSocket`, сервер отменит новые запросы и вместо них выдаст событие `'dropRequest'`, а затем отправит `503` клиенту.

<!-- 0062.part.md -->

### Событие: request

-   `запрос` {http.IncomingMessage}
-   `ответ` {http.ServerResponse}

Выдается каждый раз, когда поступает запрос. На одно соединение может приходиться несколько запросов (в случае соединений HTTP Keep-Alive).

<!-- 0063.part.md -->

### Событие: upgrade

-   `request` {http.IncomingMessage} Аргументы для HTTP-запроса, как в событии [`'request'`](#event-request)
-   `socket` {stream.Duplex} Сетевой сокет между сервером и клиентом
-   `head` [`<Buffer>`](buffer.md#buffer) Первый пакет обновленного потока (может быть пустым).

Выдается каждый раз, когда клиент запрашивает обновление HTTP. Прослушивание этого события необязательно, и клиенты не могут настаивать на смене протокола.

После испускания этого события сокет запроса не будет иметь слушателя события `'data'`, что означает, что его нужно будет привязать, чтобы обрабатывать данные, отправленные серверу на этом сокете.

Это событие гарантированно передается экземпляру класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

<!-- 0064.part.md -->

### server.close

```js
server.close([callback]);
```

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Останавливает сервер от приема новых соединений и закрывает все соединения, подключенные к этому серверу, которые не посылают запрос или не ожидают ответа. См. [`net.Server.close()`](net.md#serverclosecallback).

<!-- 0065.part.md -->

### server.closeAllConnections

```js
server.closeAllConnections();
```

Закрывает все соединения, подключенные к этому серверу.

<!-- 0066.part.md -->

### server.closeIdleConnections

```js
server.closeIdleConnections();
```

Закрывает все соединения, подключенные к этому серверу, которые не посылают запрос и не ожидают ответа.

<!-- 0067.part.md -->

### server.headersTimeout

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** Минимальное значение между [`server.requestTimeout`](#serverrequesttimeout) или `60000`.

Ограничивает количество времени, в течение которого парсер будет ждать получения полных заголовков HTTP.

Если таймаут истекает, сервер отвечает статусом 408, не пересылая запрос слушателю запросов, а затем закрывает соединение.

Это значение должно быть ненулевым (например, 120 секунд) для защиты от потенциальных атак Denial-of-Service в случае, если сервер развернут без обратного прокси.

<!-- 0068.part.md -->

### server.listen

```js
server.listen();
```

Запускает HTTP-сервер, прослушивающий соединения. Этот метод идентичен [`server.listen()`](net.md#serverlisten) из [`net.Server`](net.md#class-netserver).

<!-- 0069.part.md -->

### server.listening

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Указывает, прослушивает ли сервер соединения или нет.

<!-- 0070.part.md -->

### server.maxHeadersCount

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2000`.

Ограничивает максимальное количество входящих заголовков. Если установлено значение 0, ограничение не будет применяться.

<!-- 0071.part.md -->

### server.requestTimeout

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `300000`.

Устанавливает значение таймаута в миллисекундах для получения всего запроса от клиента.

Если таймаут истекает, сервер отвечает статусом 408 без пересылки запроса слушателю запроса, а затем закрывает соединение.

Это значение должно быть ненулевым (например, 120 секунд) для защиты от потенциальных атак Denial-of-Service в случае, если сервер развернут без обратного прокси.

<!-- 0072.part.md -->

### server.setTimeout

```js
server.setTimeout([msecs][, callback])
```

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** 0 (без таймаута)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {http.Server}

Устанавливает значение тайм-аута для сокетов и выдает событие `'timeout'` на объект Server, передавая сокет в качестве аргумента, если тайм-аут произошел.

Если на объекте Server есть слушатель события `'timeout'`, то он будет вызван с тайм-аутом сокета в качестве аргумента.

По умолчанию сервер не отключает сокеты по таймауту. Однако если событию `'timeout'` сервера назначен обратный вызов, то таймауты должны обрабатываться явно.

<!-- 0073.part.md -->

### server.maxRequestsPerSocket

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Запросы на сокет. **По умолчанию:** 0 (без ограничений).

Максимальное количество запросов, которое может обработать сокет перед закрытием соединения keep alive.

Значение `0` отключает ограничение.

При достижении лимита значение заголовка `Connection` будет установлено на `close`, но фактически соединение закрыто не будет, последующие запросы, отправленные после достижения лимита, получат в ответ `503 Service Unavailable`.

<!-- 0074.part.md -->

### server.timeout

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** 0 (таймаут отсутствует).

Количество миллисекунд бездействия, после которого считается, что сокет завершил работу.

Значение `0` отключает таймаут для входящих соединений.

Логика таймаута сокета устанавливается при подключении, поэтому изменение этого значения влияет только на новые соединения с сервером, а не на существующие.

<!-- 0075.part.md -->

### server.keepAliveTimeout

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Таймаут в миллисекундах. **По умолчанию:** `5000` (5 секунд).

Количество миллисекунд бездействия, в течение которых сервер должен ждать новых входящих данных, после того как он закончил писать последний ответ, прежде чем сокет будет уничтожен. Если сервер получит новые данные до истечения таймаута keep-alive, он сбросит обычный таймаут бездействия, т.е. [`server.timeout`](#servertimeout).

Значение `0` отключает таймаут "keep-alive" для входящих соединений. Значение `0` заставляет http-сервер вести себя аналогично Node.js версий до 8.0.0, в которых не было таймаута keep-alive.

Логика таймаута сокета устанавливается при подключении, поэтому изменение этого значения влияет только на новые подключения к серверу, а не на существующие.

<!-- 0076.part.md -->

## http.ServerResponse

-   Расширяет: {http.OutgoingMessage}

Этот объект создается внутри HTTP-сервера, а не пользователем. Он передается в качестве второго параметра в событие [`'request'`](#event-request).

<!-- 0077.part.md -->

### Событие: close

Указывает на то, что ответ завершен, или его базовое соединение было прервано преждевременно (до завершения ответа).

<!-- 0078.part.md -->

### Событие: finish

Вызывается, когда ответ был отправлен. Точнее, это событие возникает, когда последний сегмент заголовков и тела ответа был передан операционной системе для передачи по сети. Это не означает, что клиент уже что-то получил.

<!-- 0079.part.md -->

### response.addTrailers

```js
response.addTrailers(headers);
```

-   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Этот метод добавляет к ответу HTTP трейлерные заголовки (заголовок, но в конце сообщения).

Заголовки будут **только** если для ответа используется кодировка `chunked`; если это не так (например, если запрос был HTTP/1.0), они будут молча отброшены.

HTTP требует отправки заголовка `Trailer` для эмиссии трейлеров, в значении которого содержится список полей заголовка. Например,

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

Попытка установить имя или значение поля заголовка, содержащее недопустимые символы, приведет к возникновению [`TypeError`](errors.md#class-typeerror).

<!-- 0080.part.md -->

### response.connection

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`response.socket`](#responsesocket).

-   {stream.Duplex}

См. [`response.socket`](#responsesocket).

<!-- 0081.part.md -->

### response.cork

```js
response.cork();
```

См. [`writable.cork()`](stream.md#writablecork).

<!-- 0082.part.md -->

### response.end

```js
response.end([data[, encoding]][, callback])
```

-   `данные` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Этот метод сигнализирует серверу, что все заголовки и тело ответа были отправлены; сервер должен считать это сообщение завершенным. Метод `response.end()` ДОЛЖЕН вызываться в каждом ответе.

Если указаны `data`, это аналогично вызову [`response.write(data, encoding)`](#responsewritechunk-encoding-callback), за которым следует `response.end(callback)`.

Если указан `callback`, он будет вызван, когда поток ответа будет завершен.

<!-- 0083.part.md -->

### response.finished

> Стабильность: 0 - Утратил актуальность. Используйте [`response.writableEnded`](#responsewritableended).

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `response.finished` будет `true`, если был вызван [`response.end()`](#responseend).

<!-- 0084.part.md -->

### response.flushHeaders

```js
response.flushHeaders();
```

Промывает заголовки ответа. См. также: [`request.flushHeaders()`](#requestflushheaders).

<!-- 0085.part.md -->

### response.getHeader

```js
response.getHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Считывает заголовок, который уже был поставлен в очередь, но не отправлен клиенту. Имя не чувствительно к регистру. Тип возвращаемого значения зависит от аргументов, переданных в [`response.setHeader()`](#responsesetheadername-value).

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
// contentType - 'text/html'
const contentLength = response.getHeader('Content-Length');
// contentLength имеет тип число
const setCookie = response.getHeader('set-cookie');
// setCookie имеет тип string[]
```

<!-- 0086.part.md -->

### response.getHeaderNames

```js
response.getHeaderNames();
```

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив, содержащий уникальные имена текущих исходящих заголовков. Все имена заголовков пишутся в нижнем регистре.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = response.getHeaderNames();
// headerNames === ['foo', 'set-cookie']
```

<!-- 0087.part.md -->

### response.getHeaders

```js
response.getHeaders();
```

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает неглубокую копию текущих исходящих заголовков. Поскольку используется неглубокая копия, значения массива могут быть изменены без дополнительных вызовов различных методов модуля http, связанных с заголовками. Ключами возвращаемого объекта являются имена заголовков, а значениями - соответствующие значения заголовков. Все имена заголовков пишутся в нижнем регистре.

Объект, возвращаемый методом `response.getHeaders()`, _не_ прототипически наследует от JavaScript `Object`. Это означает, что типичные методы `Object`, такие как `obj.toString()`, `obj.hasOwnProperty()` и другие, не определены и _не будут работать_.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headers = response.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```

<!-- 0088.part.md -->

### response.hasHeader

```js
response.hasHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если заголовок, обозначенный `name`, в настоящее время установлен в исходящих заголовках. Соответствие имени заголовка не чувствительно к регистру.

```js
const hasContentType = response.hasHeader('content-type');
```

<!-- 0089.part.md -->

### response.headersSent

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Булево (только для чтения). `true`, если заголовки были отправлены, `false` в противном случае.

<!-- 0090.part.md -->

### response.removeHeader

```js
response.removeHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Удаляет заголовок, поставленный в очередь для неявной отправки.

```js
response.removeHeader('Content-Encoding');
```

<!-- 0091.part.md -->

### response.req

-   {http.IncomingMessage}

Ссылка на исходный объект HTTP `request`.

<!-- 0092.part.md -->

### response.sendDate

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При значении true заголовок Date будет автоматически сгенерирован и отправлен в ответ, если он еще не присутствует в заголовках. По умолчанию установлено значение true.

Это значение следует отключать только для тестирования; HTTP требует наличия заголовка Date в ответах.

<!-- 0093.part.md -->

### response.setHeader

```js
response.setHeader(name, value);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   Возвращает: {http.ServerResponse}

Возвращает объект ответа.

Устанавливает одно значение заголовка для неявных заголовков. Если этот заголовок уже существует в отправляемых заголовках, его значение будет заменено. Для отправки нескольких заголовков с одинаковым именем используйте массив строк. Значения, не являющиеся строками, будут сохранены без изменений. Поэтому [`response.getHeader()`](#responsegetheader) может возвращать нестроковые значения. Однако нестроковые значения будут преобразованы в строки для передачи по сети. Один и тот же объект ответа возвращается вызывающей стороне, чтобы обеспечить возможность цепочки вызовов.

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

Попытка установить имя или значение поля заголовка, которое содержит недопустимые символы, приведет к возникновению [`TypeError`](errors.md#class-typeerror).

Когда заголовки были установлены с помощью [`response.setHeader()`](#responsesetheader), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), причем заголовки, переданные в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), будут иметь приоритет.

```js
// Возвращает content-type = text/plain
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
});
```

Если вызывается метод [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) и этот метод не был вызван, то он напрямую запишет значения предоставленных заголовков в сетевой канал без внутреннего кэширования, и обращение [`response.getHeader()`](#responsegetheadername) к заголовку не даст ожидаемого результата. Если требуется постепенное накопление заголовков с возможным извлечением и изменением в будущем, используйте [`response.setHeader()`](#responsesetheadername-value) вместо [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

<!-- 0094.part.md -->

### response.setTimeout

```js
response.setTimeout(msecs[, callback])
```

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {http.ServerResponse}

Устанавливает значение тайм-аута сокета в `msecs`. Если указан обратный вызов, то он добавляется в качестве слушателя события `'timeout'` на объекте ответа.

Если к запросу, ответу или серверу не добавлен слушатель `'timeout'`, то сокеты уничтожаются по истечении времени. Если для событий `'timeout'` запроса, ответа или сервера назначен обработчик, то сокеты с таймаутом должны обрабатываться явно.

<!-- 0095.part.md -->

### response.socket

-   {stream.Duplex}

Ссылка на базовый сокет. Обычно пользователи не хотят обращаться к этому свойству. В частности, сокет не будет выдавать события `'readable'` из-за того, как парсер протокола подключается к сокету. После `response.end()` свойство обнуляется.

```js
const http = require('node:http');
const server = http
    .createServer((req, res) => {
        const ip = res.socket.remoteAddress;
        const port = res.socket.remotePort;
        res.end(
            `Ваш IP адрес ${ip} и ваш порт источника ${port}.`
        );
    })
    .listen(3000);
```

Это свойство гарантированно является экземпляром класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не указал тип сокета, отличный от [`<net.Socket>`](net.md#netsocket).

<!-- 0096.part.md -->

### response.statusCode

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `200`.

При использовании неявных заголовков (не вызывая [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) явно), это свойство контролирует код статуса, который будет отправлен клиенту, когда заголовки будут смыты.

```js
response.statusCode = 404;
```

После того, как заголовок ответа был отправлен клиенту, это свойство указывает на код статуса, который был отправлен.

<!-- 0097.part.md -->

### response.statusMessage

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

При использовании неявных заголовков (не вызывая [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) явно), это свойство управляет сообщением о статусе, которое будет отправлено клиенту, когда заголовки будут смыты. Если оставить это свойство как `undefined`, то будет использоваться стандартное сообщение для кода статуса.

```js
response.statusMessage = 'Not found';
```

После того, как заголовок ответа был отправлен клиенту, это свойство указывает на сообщение о статусе, которое было отправлено.

<!-- 0098.part.md -->

### response.strictContentLength

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.

Если установлено значение `true`, Node.js будет проверять, равны ли значение заголовка `Content-Length` и размер тела в байтах. Несоответствие значения заголовка `Content-Length` приведет к возникновению `ошибки`, определяемой `кодом:` [`'ERR_HTTP_CONTENT_LENGTH_MISMATCH'`](errors.md#err_http_content_length_mismatch).

<!-- 0099.part.md -->

### response.uncork

```js
response.uncork();
```

См. [`writable.uncork()`](stream.md#writableuncork).

<!-- 0100.part.md -->

### response.writableEnded

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true` после вызова [`response.end()`](#responseend). Это свойство не указывает, были ли данные удалены, для этого используйте [`response.writableFinished`](#responsewritablefinished).

<!-- 0101.part.md -->

### response.writableFinished

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если все данные были выгружены в базовую систему, непосредственно перед тем, как будет выпущено событие [`'finish'`](#event-finish).

<!-- 0102.part.md -->

### response.write

```js
response.write(chunk[, encoding][, callback])
```

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8''
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если этот метод вызван и [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) не был вызван, он переключится в режим неявных заголовков и промоет неявные заголовки.

При этом отправляется фрагмент тела ответа. Этот метод может быть вызван несколько раз для предоставления последовательных частей тела.

В модуле `node:http` тело ответа опускается, если запрос является запросом HEAD. Аналогично, ответы `204` и `304` _не должны_ включать тело сообщения.

`chunk` может быть строкой или буфером. Если `chunk` является строкой, второй параметр указывает, как кодировать его в поток байтов. Функция `callback` будет вызвана, когда этот кусок данных будет сброшен.

Это необработанное тело HTTP и не имеет ничего общего с многокомпонентными кодировками тела более высокого уровня, которые могут быть использованы.

При первом вызове [`response.write()`](#responsewrite) клиенту будет отправлена буферизованная информация заголовка и первый фрагмент тела. При втором вызове [`response.write()`](#responsewrite) Node.js предполагает, что данные будут передаваться потоком, и отправляет новые данные отдельно. То есть, ответ буферизируется до первого куска тела.

Возвращает `true`, если все данные были успешно переданы в буфер ядра. Возвращает `false`, если все данные или их часть были помещены в пользовательскую память. Когда буфер снова освободится, будет выдано сообщение `'drain'`.

<!-- 0103.part.md -->

### response.writeContinue

```js
response.writeContinue();
```

Отправляет клиенту сообщение HTTP/1.1 100 Continue, указывающее на то, что тело запроса должно быть отправлено. См. событие [`'checkContinue'`](#event-checkcontinue) на `Server`.

<!-- 0104.part.md -->

### response.writeEarlyHints

```js
response.writeEarlyHints(hints[, callback])
```

-   `hints` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Отправляет сообщение HTTP/1.1 103 Early Hints клиенту с заголовком Link, указывая, что пользовательский агент может предварительно загрузить/подключить связанные ресурсы. `hints` - это объект, содержащий значения заголовков, которые должны быть отправлены с сообщением ранних подсказок. Необязательный аргумент `callback` будет вызван, когда сообщение ответа будет записано.

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
    'x-trace-id': 'id для диагностики',
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

<!-- 0105.part.md -->

### response.writeHead

```js
response.writeHead(statusCode[, statusMessage][, headers])
```

-   `statusCode` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `statusMessage` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
-   Возвращает: {http.ServerResponse}

Отправляет заголовок ответа на запрос. Код статуса - это трехзначный код статуса HTTP, например `404`. Последний аргумент, `headers`, - это заголовки ответа. Опционально в качестве второго аргумента можно указать человекочитаемое `statusMessage`.

`headers` может быть `массивом`, где ключи и значения находятся в одном списке. Это _не_ список кортежей. Таким образом, четные смещения являются значениями ключей, а нечетные смещения - связанными с ними значениями. Массив имеет тот же формат, что и `request.rawHeaders`.

Возвращает ссылку на `ServerResponse`, так что вызовы могут быть объединены в цепочку.

```js
const body = 'hello world';
response
    .writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/plain',
    })
    .end(body);
```

Этот метод должен быть вызван только один раз для сообщения, и он должен быть вызван до вызова [`response.end()`](#responseend).

Если [`response.write()`](#responsewrite) или [`response.end()`](#responseend) будут вызваны до вызова этой функции, неявные/изменяемые заголовки будут вычислены и вызовут эту функцию.

Если заголовки были установлены с помощью [`response.setHeader()`](#responsesetheader), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewritehead), причем заголовки, переданные в [`response.writeHead()`](#responsewritehead), будут иметь приоритет.

Если этот метод вызван, а [`response.setHeader()`](#responsesetheader) не был вызван, он будет напрямую записывать переданные значения заголовков в сетевой канал без внутреннего кэширования, и [`response.getHeader()`](#responsegetheader) по заголовку не даст ожидаемого результата. Если требуется постепенное накопление заголовков с возможным извлечением и изменением в будущем, используйте вместо этого [`response.setHeader()`](#responsesetheader).

```js
// Возвращает content-type = text/plain
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('X-Foo', 'bar');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
});
```

`Content-Length` считывается в байтах, а не в символах. Используйте [`Buffer.byteLength()`](buffer.md#static-method-bufferbytelengthstring-encoding) для определения длины тела в байтах. Node.js будет проверять, равны ли `Content-Length` и длина переданного тела или нет.

Попытка установить имя или значение поля заголовка, которое содержит недопустимые символы, приведет к ошибке.

<!-- 0106.part.md -->

### response.writeProcessing

```js
response.writeProcessing();
```

Отправляет клиенту сообщение HTTP/1.1 102 Processing, указывающее на то, что тело запроса должно быть отправлено.

<!-- 0107.part.md -->

## http.IncomingMessage

-   Расширяет: [`<stream.Readable>`](stream.md#streamreadable)

Объект `IncomingMessage` создается [`http.Server`](#httpserver) или [`http.ClientRequest`](#httpclientrequest) и передается в качестве первого аргумента в события [`'request'`](#request) и [`'response'`](#response) соответственно. Он может быть использован для доступа к статусу ответа, заголовкам и данным.

В отличие от своего значения `socket`, которое является подклассом {stream.Duplex}, само `IncomingMessage` расширяет [`<stream.Readable>`](stream.md#streamreadable) и создается отдельно для разбора и выдачи входящих HTTP-заголовков и полезной нагрузки, поскольку базовый сокет может быть использован многократно в случае keep-alive.

<!-- 0108.part.md -->

### Событие: aborted

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого слушайте событие `'close'`.

Выдается, когда запрос был прерван.

<!-- 0109.part.md -->

### Событие: close

Выдается, когда запрос завершен.

<!-- 0110.part.md -->

### message.aborted

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Проверьте `message.destroyed` из {stream.Readable}.

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

Свойство `message.aborted` будет `true`, если запрос был прерван.

<!-- 0111.part.md -->

### message.complete

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `message.complete` будет иметь значение `true`, если было получено и успешно разобрано полное HTTP-сообщение.

Это свойство особенно полезно как средство определения того, полностью ли клиент или сервер передал сообщение до того, как соединение было разорвано:

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

<!-- 0112.part.md -->

### message.connection

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`message.socket`](#messagesocket).

Псевдоним для [`message.socket`](#messagesocket).

<!-- 0113.part.md -->

### message.destroy

```js
message.destroy([error]);
```

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Вызывает `destroy()` на сокете, который получил `IncomingMessage`. Если указано `error`, то на сокете испускается событие `'error`, а `error` передается в качестве аргумента всем слушателям этого события.

<!-- 0114.part.md -->

### message.headers

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект заголовков запроса/ответа.

Пары ключ-значение имен и значений заголовков. Имена заголовков приводятся в нижнем регистре.

```js
// Выводит что-то вроде:
//
// { { 'user-agent': 'curl/7.22.0',
// host: '127.0.0.1:8000',
// accept: '*/*' }
console.log(request.headers);
```

Дубликаты в необработанных заголовках обрабатываются следующими способами, в зависимости от имени заголовка:

-   Дубликаты `age`, `authorization`, `content-length`, `content-type`, `etag`, `expires`, `from`, `host`, `if-modified-since`, `if-unmodified-since`, `last-modified`, `location`, `max-forwards`, `proxy-authorization`, `referer`, `retry-after`, `server` или `user-agent` отбрасываются. Чтобы разрешить объединение дубликатов перечисленных выше заголовков, используйте опцию `joinDuplicateHeaders` в [`http.request()`](#httprequestoptions-callback) и [`http.createServer()`](#httpcreateserveroptions-requestlistener). См. RFC 9110 Раздел 5.3 для получения дополнительной информации.
-   `set-cookie` - это всегда массив. Дубликаты добавляются в массив.
-   Для дублирующихся заголовков `cookie` значения объединяются с помощью `;`.
-   Для всех остальных заголовков значения объединяются с помощью `,`.

<!-- 0115.part.md -->

### message.headersDistinct

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Аналогично [`message.headers`](#messageheaders), но нет логики объединения и значения всегда являются массивами строк, даже для заголовков, полученных только один раз.

```js
// Выводит что-то вроде:
//
// { 'user-agent': ['curl/7.22.0'],
// host: ['127.0.0.1:8000'],
// accept: ['*/*'] }
console.log(request.headersDistinct);
```

<!-- 0116.part.md -->

### message.httpVersion

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

В случае запроса сервера, версия HTTP, отправленная клиентом. В случае ответа клиента, версия HTTP подключенного сервера. Возможно, либо `'1.1'`, либо `'1.0'`.

Также `message.httpVersionMajor` является первым целым числом, а `message.httpVersionMinor` - вторым.

<!-- 0117.part.md -->

### message.method

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

**Действителен только для запроса, полученного с [`http.Server`](#httpserver).**.

Метод запроса в виде строки. Только для чтения. Примеры: `'GET'`, `'DELETE'`.

<!-- 0118.part.md -->

### message.rawHeaders

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

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

<!-- 0119.part.md -->

### message.rawTrailers

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Необработанные ключи и значения трейлеров запроса/ответа точно в том виде, в котором они были получены. Заполняются только при событии `конец`.

<!-- 0120.part.md -->

### message.setTimeout

```js
message.setTimeout(msecs[, callback])
```

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {http.IncomingMessage}

Вызывает `message.socket.setTimeout(msecs, callback)`.

<!-- 0121.part.md -->

### message.socket

-   {stream.Duplex}

Объект [`net.Socket`](net.md#class-netsocket), связанный с соединением.

При поддержке HTTPS используйте [`request.socket.getPeerCertificate()`](tls.md#tlssocketgetpeercertificatedetailed) для получения аутентификационных данных клиента.

Это свойство гарантированно является экземпляром класса [`<net.Socket>`](net.md#netsocket), подкласса {stream.Duplex}, если пользователь не указал тип сокета, отличный от [`<net.Socket>`](net.md#netsocket), или не обнулен внутренне.

<!-- 0122.part.md -->

### message.statusCode

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

**Действительно только для ответа, полученного от [`http.ClientRequest`](#httpclientrequest).**.

Трехзначный код состояния ответа HTTP. НАПРИМЕР, `404`.

<!-- 0123.part.md -->

### message.statusMessage

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

**Действительно только для ответа, полученного из [`http.ClientRequest`](#httpclientrequest).**.

Сообщение о статусе ответа HTTP (фраза причины). Например, `OK` или `Internal Server Error`.

<!-- 0124.part.md -->

### message.trailers

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект трейлеров запроса/ответа. Заполняется только при событии `end`.

<!-- 0125.part.md -->

### message.trailersDistinct

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Аналогичен [`message.trailers`](#messagetrailers), но здесь нет логики объединения и значения всегда являются массивами строк, даже для заголовков, полученных только один раз. Заполняется только при событии `end`.

<!-- 0126.part.md -->

### message.url

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

**Действительно только для запроса, полученного с [`http.Server`](#httpserver).**.

Строка URL запроса. Она содержит только тот URL, который присутствует в фактическом HTTP-запросе. Возьмем следующий запрос:

```http
GET /status?name=ryan HTTP/1.1
Accept: text/plain
```

Разберем URL на части:

```js
new URL(request.url, `http://${request.headers.host}`);
```

Когда `request.url` будет `'/status?name=ryan'` и `request.headers.host` будет `'localhost:3000'`:

```console
$ node
> new URL(request.url, `http://${request.headers.host}`)
URL {
  href: 'http://localhost:3000/status?name=ryan',
  origin: 'http://localhost:3000',
  protocol: 'http:',
  username: '',
  password: '',
  host: 'localhost:3000',
  hostname: 'localhost',
  port: '3000',
  pathname: '/status',
  search: '?name=ryan',
  searchParams: URLSearchParams { 'name' => 'ryan' },
  hash: ''
}
```

<!-- 0127.part.md -->

## http.OutgoingMessage

-   Расширяет: [`<Stream>`](stream.md#stream)

Этот класс служит в качестве родительского класса для [`http.ClientRequest`](#httpclientrequest) и [`http.ServerResponse`](#httpserverresponse). Это абстрактное исходящее сообщение с точки зрения участников HTTP-транзакции.

<!-- 0128.part.md -->

### Событие: drain

Выдается, когда буфер сообщения снова свободен.

<!-- 0129.part.md -->

### Событие: finish

Выдается при успешном завершении передачи.

<!-- 0130.part.md -->

### Событие: prefinish

Вызывается после вызова функции `outgoingMessage.end()`. Когда это событие происходит, все данные были обработаны, но не обязательно полностью смыты.

<!-- 0131.part.md -->

### outgoingMessage.addTrailers

```js
outgoingMessage.addTrailers(headers);
```

-   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Добавляет HTTP трейлеры (заголовки, но в конце сообщения) к сообщению.

Трейлеры будут **только** если сообщение закодировано в виде чанков. В противном случае трейлеры будут молча отброшены.

HTTP требует отправки заголовка `Trailer` для создания трейлеров, в значении которого содержится список имен полей заголовка, например.

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

Попытка установить имя или значение поля заголовка, содержащее недопустимые символы, приведет к возникновению ошибки `TypeError`.

<!-- 0132.part.md -->

### outgoingMessage.appendHeader

```js
outgoingMessage.appendHeader(name, value);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя заголовка
-   `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение заголовка
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Добавляет одно значение заголовка для объекта заголовка.

Если значение является массивом, это эквивалентно вызову этого метода несколько раз.

Если предыдущего значения для заголовка не было, это эквивалентно вызову [`outgoingMessage.setHeader(name, value)`](#outgoingmessagesetheader).

В зависимости от значения параметра `options.uniqueHeaders` при создании клиентского запроса или сервера, заголовок будет отправлен несколько раз или один раз со значениями, объединенными с помощью `;`.

<!-- 0133.part.md -->

### outgoingMessage.connection

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`outgoingMessage.socket`](#outgoingmessagesocket) вместо этого.

Псевдоним [`outgoingMessage.socket`](#outgoingmessagesocket).

<!-- 0134.part.md -->

### outgoingMessage.cork

```js
outgoingMessage.cork();
```

См. [`writable.cork()`](stream.md#writablecork).

<!-- 0135.part.md -->

### outgoingMessage.destroy

```js
outgoingMessage.destroy([error]);
```

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Необязательно, ошибка, которую нужно выдать с событием `error`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает сообщение. Если сокет связан с сообщением и подключен, этот сокет также будет уничтожен.

<!-- 0136.part.md -->

### outgoingMessage.end

```js
outgoingMessage.end(chunk[, encoding][, callback])
```

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно, **по умолчанию**: `utf8`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательно
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Завершает исходящее сообщение. Если какие-либо части тела остались неотправленными, то они будут переданы в базовую систему. Если сообщение разбито на части, будет отправлен завершающий фрагмент `0\r\n\r\n`, и отправлены трейлеры (если они есть).

Если указано `chunk`, это эквивалентно вызову `outgoingMessage.write(chunk, encoding)`, за которым следует `outgoingMessage.end(callback)`.

Если указан `callback`, он будет вызван, когда сообщение будет завершено (эквивалентно слушателю события `'finish'`).

<!-- 0137.part.md -->

### outgoingMessage.flushHeaders

```js
outgoingMessage.flushHeaders();
```

Смывает заголовки сообщений.

По причине эффективности Node.js обычно буферизирует заголовки сообщений до тех пор, пока не будет вызвана функция `outgoingMessage.end()` или не будет записан первый фрагмент данных сообщения. Затем он пытается упаковать заголовки и данные в один TCP-пакет.

Обычно это желательно (это экономит время прохождения TCP), но не тогда, когда первые данные не будут отправлены, возможно, намного позже. Функция `outgoingMessage.flushHeaders()` обходит оптимизацию и запускает сообщение.

<!-- 0138.part.md -->

### outgoingMessage.getHeader

```js
outgoingMessage.getHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка
-   Возвращает [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type)

Получает значение HTTP-заголовка с заданным именем. Если этот заголовок не установлен, возвращаемое значение будет `undefined`.

<!-- 0139.part.md -->

### outgoingMessage.getHeaderNames

```js
outgoingMessage.getHeaderNames();
```

-   Возвращает [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив, содержащий уникальные имена текущих заголовков исходящих сообщений. Все имена в нижнем регистре.

<!-- 0140.part.md -->

### outgoingMessage.getHeaders

```js
outgoingMessage.getHeaders();
```

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает неглубокую копию текущих заголовков исходящего сообщения. Поскольку используется неглубокая копия, значения массива могут быть изменены без дополнительных вызовов различных методов модуля HTTP, связанных с заголовками. Ключами возвращаемого объекта являются имена заголовков, а значениями - соответствующие значения заголовков. Все имена заголовков пишутся в нижнем регистре.

Объект, возвращаемый методом `outgoingMessage.getHeaders()`, прототипически не наследует от JavaScript `Object`. Это означает, что типичные методы `Object`, такие как `obj.toString()`, `obj.hasOwnProperty()` и другие, не определены и не будут работать.

```js
outgoingMessage.setHeader('Foo', 'bar');
outgoingMessage.setHeader('Set-Cookie', [
    'foo=bar',
    'bar=baz',
]);

const headers = outgoingMessage.getHeaders();
// headers === { foo: 'bar', 'set-cookie': ['foo=bar', 'bar=baz'] }
```

<!-- 0141.part.md -->

### outgoingMessage.hasHeader

```js
outgoingMessage.hasHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если заголовок, обозначенный `name`, в настоящее время установлен в исходящих заголовках. Имя заголовка не чувствительно к регистру.

```js
const hasContentType = outgoingMessage.hasHeader(
    'content-type'
);
```

<!-- 0142.part.md -->

### outgoingMessage.headersSent

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Только для чтения. `true`, если заголовки были отправлены, иначе `false`.

<!-- 0143.part.md -->

### outgoingMessage.pipe

```js
outgoingMessage.pipe();
```

Переопределяет метод `stream.pipe()`, унаследованный от унаследованного класса `Stream`, который является родительским классом `http.OutgoingMessage`.

Вызов этого метода вызовет `ошибку`, поскольку `outgoingMessage` является потоком только для записи.

<!-- 0144.part.md -->

### outgoingMessage.removeHeader

```js
outgoingMessage.removeHeader(name);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка

Удаляет заголовок, который находится в очереди на неявную отправку.

```js
outgoingMessage.removeHeader('Content-Encoding');
```

<!-- 0145.part.md -->

### outgoingMessage.setHeader

```js
outgoingMessage.setHeader(name, value);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя заголовка
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение заголовка
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Устанавливает одно значение заголовка. Если заголовок уже существует в отправляемых заголовках, его значение будет заменено. Используйте массив строк для отправки нескольких заголовков с одинаковым именем.

<!-- 0146.part.md -->

### outgoingMessage.setHeaders

```js
outgoingMessage.setHeaders(headers);
```

-   `headers` {Headers} | {Map}
-   Возвращает: {http.ServerResponse}

Возвращает объект ответа.

Устанавливает несколько значений заголовков для неявных заголовков. `headers` должен быть экземпляром [`Headers`](globals.md#class-headers) или `Map`, если заголовок уже существует в отправляемых заголовках, его значение будет заменено.

```js
const headers = new Headers({ foo: 'bar' });
response.setHeaders(headers);
```

или

```js
const headers = new Map([['foo', 'bar']]);
res.setHeaders(headers);
```

Когда заголовки были установлены с помощью [`outgoingMessage.setHeaders()`](#outgoingmessagesetheaders), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewritehead), причем заголовки, переданные в [`response.writeHead()`](#responsewritehead), будут иметь приоритет.

```js
// Возвращает content-type = text/plain
const server = http.createServer((req, res) => {
    const headers = new Headers({
        'Content-Type': 'text/html',
    });
    res.setHeaders(headers);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
});
```

<!-- 0147.part.md -->

### outgoingMessage.setTimeout

```js
outgoingMessage.setTimeout(msesc[, callback])
```

-   `msesc` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Необязательная функция, которая будет вызываться при возникновении тайм-аута. Аналогично привязке к событию `timeout`.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Когда сокет связан с сообщением и подключен, будет вызвана функция [`socket.setTimeout()`](net.md#socketsettimeouttimeout-callback) с `msecs` в качестве первого параметра.

<!-- 0148.part.md -->

### outgoingMessage.socket

-   {stream.Duplex}

Ссылка на базовый сокет. Обычно пользователи не хотят обращаться к этому свойству.

После вызова `outgoingMessage.end()` это свойство будет обнулено.

<!-- 0149.part.md -->

### outgoingMessage.uncork

```js
outgoingMessage.uncork();
```

См. [`writable.uncork()`](stream.md#writableuncork)

<!-- 0150.part.md -->

### outgoingMessage.writableCorked

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество раз, когда `outgoingMessage.cork()` был вызван.

<!-- 0151.part.md -->

### outgoingMessage.writableEnded

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если была вызвана функция `outgoingMessage.end()`. Это свойство не указывает, были ли данные удалены. Для этого используйте `message.writableFinished`.

<!-- 0152.part.md -->

### outgoingMessage.writableFinished

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если все данные были переданы в базовую систему.

<!-- 0153.part.md -->

### outgoingMessage.writableHighWaterMark

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

`highWaterMark` базового сокета, если он назначен. Иначе, уровень буфера по умолчанию, когда [`writable.write()`](stream.md#writablewritechunk-encoding-callback) начинает возвращать false (`16384`).

<!-- 0154.part.md -->

### outgoingMessage.writableLength

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество буферизованных байтов.

<!-- 0155.part.md -->

### outgoingMessage.writableObjectMode

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Всегда `false`.

<!-- 0156.part.md -->

### outgoingMessage.write

```js
outgoingMessage.write(chunk[, encoding][, callback])
```

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию**: `utf8`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отправляет фрагмент тела. Этот метод может быть вызван несколько раз.

Аргумент `encoding` имеет значение только тогда, когда `chunk` является строкой. По умолчанию это `'utf8`.

Аргумент `callback` является необязательным и будет вызван, когда этот фрагмент данных будет удален.

Возвращает `true`, если все данные были успешно сброшены в буфер ядра. Возвращает `false`, если все данные или их часть были помещены в пользовательскую память. Событие `'drain'' будет выдано, когда буфер снова освободится.

<!-- 0157.part.md -->

## http.METHODS

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список методов HTTP, которые поддерживаются парсером.

<!-- 0158.part.md -->

## http.STATUS_CODES

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Коллекция всех стандартных кодов состояния ответа HTTP и краткое описание каждого из них. Например, `http.STATUS_CODES[404] === 'Not Found'`.

<!-- 0159.part.md -->

## http.createServer

```js
http.createServer([options][, requestListener])
```

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

    -   `connectionsCheckingInterval`: Устанавливает значение интервала в миллисекундах для проверки таймаута запроса и заголовков в неполных запросах. **По умолчанию:** `30000`.
    -   `headersTimeout`: Устанавливает значение таймаута в миллисекундах для получения полных заголовков HTTP от клиента. Дополнительную информацию смотрите в [`server.headersTimeout`](#serverheaderstimeout). **По умолчанию:** `60000`.
    -   `insecureHTTPParser` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Использовать небезопасный парсер HTTP, который принимает недействительные заголовки HTTP, если `true`. Следует избегать использования небезопасного парсера. Дополнительную информацию смотрите в [`--insecure-http-parser`](cli.md#--insecure-http-parser). **По умолчанию:** `false`.
    -   `IncomingMessage` {http.IncomingMessage} Определяет класс `IncomingMessage`, который будет использоваться. Полезно для расширения оригинального `IncomingMessage`. **По умолчанию:** `IncomingMessage`.
    -   `keepAlive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `true`, это включает функцию keep-alive на сокете сразу после получения нового входящего соединения, аналогично тому, как это делается в \[`socket.setKeepAlive([enable][, initialDelay])`\]\[`socket.setKeepAlive(enable, initialDelay)`\]. **По умолчанию:** `false`.
    -   `keepAliveInitialDelay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задано положительное число, оно устанавливает начальную задержку перед отправкой первого зонда keepalive на неработающем сокете. **По умолчанию:** `0`.
    -   `keepAliveTimeout`: Количество миллисекунд бездействия, в течение которых сервер должен ожидать поступления дополнительных данных, после того как он закончил писать последний ответ, прежде чем сокет будет уничтожен. Дополнительную информацию смотрите в [`server.keepAliveTimeout`](#serverkeepalivetimeout). **По умолчанию:** `5000`.
    -   `maxHeaderSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Опционально переопределяет значение параметра [`--max-http-header-size`](cli.md#--max-http-header-sizesize) для запросов, полученных этим сервером, т.е. максимальную длину заголовков запроса в байтах. **По умолчанию:** 16384 (16 KiB).
    -   `noDelay` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `true`, то отключает использование алгоритма Нагла сразу после получения нового входящего соединения. **По умолчанию:** `true`.
    -   `requestTimeout`: Устанавливает значение таймаута в миллисекундах для получения всего запроса от клиента. Дополнительную информацию смотрите в [`server.requestTimeout`](#serverrequesttimeout). **По умолчанию:** `300000`.
    -   `requireHostHeader` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Заставляет сервер отвечать кодом состояния 400 (Bad Request) на любой запрос HTTP/1.1, в котором отсутствует заголовок Host (как предписано спецификацией). **По умолчанию:** `true`.
    -   `joinDuplicateHeaders` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Объединяет значения строк полей нескольких заголовков в запросе с помощью `,` вместо того, чтобы отбрасывать дубликаты. Более подробную информацию смотрите в [`message.headers`](#messageheaders). **По умолчанию:** `false`.
    -   `ServerResponse` {http.ServerResponse} Определяет класс `ServerResponse`, который будет использоваться. Полезен для расширения оригинального `ServerResponse`. **По умолчанию:** `ServerResponse`.
    -   `uniqueHeaders` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Список заголовков ответа, которые должны быть отправлены только один раз. Если значение заголовка представляет собой массив, элементы будут объединены с помощью `;`.

-   `requestListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

-   Возвращает: {http.Server}

Возвращает новый экземпляр [`http.Server`](#httpserver).

`requestListener` - это функция, которая автоматически добавляется к событию [`'request'`](#event-request).

```js
const http = require('node:http');

// Создаем локальный сервер для получения данных
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

---

```js
const http = require('node:http');

// Создаем локальный сервер для получения данных
const server = http.createServer();

// Прослушиваем событие запроса
server.on('request', (request, res) => {
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

<!-- 0160.part.md -->

## http.get

```js
http.get(options[, callback])
```

```js
http.get(url[, options][, callback])
```

-   `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Принимает те же `options`, что и [`http.request()`](#httprequestoptions-callback), с `method`, всегда установленным на `GET`. Свойства, унаследованные от прототипа, игнорируются.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {http.ClientRequest}

Поскольку большинство запросов - это GET-запросы без тела, Node.js предоставляет этот удобный метод. Единственное отличие этого метода от [`http.request()`](#httprequest) в том, что он устанавливает метод на GET и автоматически вызывает `req.end()`. Обратный вызов должен позаботиться о потреблении данных ответа по причинам, указанным в разделе [`http.ClientRequest`](#httpclientrequest).

Обратный вызов вызывается с единственным аргументом, который является экземпляром [`http.IncomingMessage`](#httpincomingmessage).

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

## http.globalAgent

-   {http.Agent}

Глобальный экземпляр `Agent`, который используется по умолчанию для всех клиентских HTTP-запросов.

<!-- 0163.part.md -->

## http.maxHeaderSize

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство только для чтения, определяющее максимально допустимый размер HTTP-заголовков в байтах. По умолчанию 16 килобайт. Настраивается с помощью опции CLI [`--max-http-header-size`](cli.md#--max-http-header-sizesize).

Его можно переопределить для серверов и клиентских запросов, передав параметр `maxHeaderSize`.

<!-- 0164.part.md -->

## http.request

```js
http.request(options[, callback])
```

<!-- 0165.part.md -->

## http.request

```js
http.request(url[, options][, callback])
```

-   `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `agent` {http.Agent} | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Управляет поведением [`Agent`](#httpagent). Возможные значения:
        -   `undefined` (по умолчанию): использовать [`http.globalAgent`](#httpglobalagent) для данного хоста и порта.
        -   `Agent` объект: явно использовать переданный `Agent`.
        -   `false`: заставляет использовать новый `Agent` со значениями по умолчанию.
    -   `auth` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Базовая аутентификация (`'user:password'`) для вычисления заголовка Authorization.
    -   `createConnection` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, создающая сокет/поток для использования в запросе, когда опция `agent` не используется. Это можно использовать, чтобы не создавать собственный класс `Agent` только для переопределения функции по умолчанию `createConnection`. Подробнее см. в [`agent.createConnection()`](#agentcreateconnection). Любой поток [`Duplex`](stream.md#class-streamduplex) является допустимым возвращаемым значением.
    -   `defaultPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт по умолчанию для протокола. **По умолчанию:** `agent.defaultPort`, если используется `Agent`, иначе `undefined`.
    -   `family` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Семейство IP-адресов для использования при разрешении `host` или `hostname`. Допустимыми значениями являются `4` или `6`. Если значение не указано, будут использоваться IP v4 и v6.
    -   `headers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, содержащий заголовки запроса.
    -   `hints` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательные [`dns.lookup()` hints](dns.md#supported-getaddrinfo-flags).
    -   `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Доменное имя или IP-адрес сервера, на который будет отправлен запрос. **По умолчанию:** `'localhost'`.
    -   `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Псевдоним для `host`. Для поддержки [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost), `hostname` будет использоваться, если указаны и `host` и `hostname`.
    -   `insecureHTTPParser` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Использовать небезопасный парсер HTTP, который принимает недействительные заголовки HTTP, если `true`. Следует избегать использования небезопасного парсера. Дополнительную информацию смотрите в [`--insecure-http-parser`](cli.md#--insecure-http-parser). **По умолчанию:** `false`.
    -   `localAddress` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Локальный интерфейс для привязки сетевых соединений.
    -   `localPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Локальный порт для подключения.
    -   `lookup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция поиска. **По умолчанию:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
    -   `maxHeaderSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Опционально переопределяет значение параметра [`--max-http-header-size`](cli.md#--max-http-header-sizesize) (максимальная длина заголовков ответа в байтах) для ответов, полученных от сервера. **По умолчанию:** 16384 (16 KiB).
    -   `method` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка, определяющая метод запроса HTTP. **По умолчанию:** `GET`.
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь запроса. Должен включать строку запроса, если таковая имеется. Например, `'/index.html?page=12'`. Исключение возникает, если путь запроса содержит недопустимые символы. В настоящее время отклоняются только пробелы, но в будущем это может измениться. **По умолчанию:** `'/'`.
    -   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт удаленного сервера. **По умолчанию:** `defaultPort`, если установлен, иначе `80`.
    -   `protocol` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используемый протокол. **По умолчанию:** `'http:'`.
    -   `setHost` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type): Определяет, следует ли автоматически добавлять заголовок `Host`. По умолчанию `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal): Сигнал прерывания, который может быть использован для прерывания текущего запроса.
    -   `socketPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Сокет домена Unix. Не может быть использован, если указано одно из `host` или `port`, так как они определяют TCP-сокет.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type): Число, определяющее таймаут сокета в миллисекундах. Это задает таймаут до подключения сокета.
    -   `uniqueHeaders` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array). Список заголовков запроса, которые должны быть отправлены только один раз. Если значение заголовка представляет собой массив, элементы будут объединены с помощью `;`.
    -   `joinDuplicateHeaders` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Объединяет значения строк полей нескольких заголовков в запросе с помощью `,` вместо того, чтобы отбрасывать дубликаты. Более подробную информацию смотрите в [`message.headers`](#messageheaders). **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {http.ClientRequest}

Также поддерживаются `опции` в [`socket.connect()`](net.md#socketconnectoptions-connectlistener).

Node.js поддерживает несколько соединений для каждого сервера для выполнения HTTP-запросов. Эта функция позволяет прозрачно отправлять запросы.

`url` может быть строкой или объектом [`URL`](url.md#the-whatwg-url-api). Если `url` - строка, она автоматически разбирается с помощью [`new URL()`](url.md#new-urlinput-base). Если это объект [`URL`](url.md#the-whatwg-url-api), то он будет автоматически преобразован в обычный объект `options`.

Если указаны и `url`, и `options`, объекты будут объединены, причем свойства `options` будут иметь приоритет.

Необязательный параметр `callback` будет добавлен как одноразовый слушатель для события [`'response'`](#event-response).

`http.request()` возвращает экземпляр класса [`http.ClientRequest`](#httpclientrequest). Экземпляр `ClientRequest` представляет собой поток, доступный для записи. Если нужно загрузить файл с помощью POST-запроса, то пишите в объект `ClientRequest`.

```js
const http = require('node:http');

const postData = JSON.stringify({
    msg: 'Hello World!',
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

В примере был вызван `req.end()`. При использовании `http.request()` необходимо всегда вызывать `req.end()` для обозначения окончания запроса - даже если в тело запроса не записываются данные.

Если во время запроса встречается какая-либо ошибка (будь то разрешение DNS, ошибки на уровне TCP или фактические ошибки разбора HTTP), на возвращаемом объекте запроса выдается событие `'error'`. Как и в случае со всеми событиями `'error'`, если не зарегистрированы слушатели, ошибка будет сброшена.

Есть несколько специальных заголовков, на которые следует обратить внимание.

-   Отправка 'Connection: keep-alive' уведомляет Node.js о том, что соединение с сервером должно сохраняться до следующего запроса.

-   Отправка заголовка 'Content-Length' отключит кодировку по умолчанию.

-   Отправка заголовка 'Expect' немедленно отправит заголовки запроса. Обычно при отправке 'Expect: 100-continue' следует установить таймаут и слушателя для события `'continue'`. См. RFC 2616 Раздел 8.2.3 для получения дополнительной информации.

-   Отправка заголовка `Authorization` отменяет использование опции `auth` для вычисления базовой аутентификации.

Пример с использованием [`URL`](url.md#the-whatwg-url-api) в качестве `options`:

```js
const options = new URL('http://abc:xyz@example.com');

const req = http.request(options, (res) => {
    // ...
});
```

При успешном запросе будут выданы следующие события в следующем порядке:

-   `socket`
-   `response`
    -   `'data'` любое количество раз, на объекте `res` (`'data'` не будет выдаваться вообще, если тело ответа пустое, например, при большинстве перенаправлений)
    -   `'end'` на объекте `res`.
-   `close`.

В случае ошибки соединения будут выданы следующие события:

-   `socket`
-   `error`
-   `close`

В случае преждевременного закрытия соединения до получения ответа, будут выданы следующие события в следующем порядке:

-   `socket`
-   `error` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'`
-   `close`

В случае преждевременного закрытия соединения после получения ответа, следующие события будут выдаваться в следующем порядке:

-   `socket`
-   `response`
    -   `data` любое количество раз, на объекте `res`.
-   (здесь соединение закрыто)
-   `aborted` на объекте `res`
-   `error` на объекте `res` с ошибкой с сообщением `Ошибка: прервано` и кодом `ECONNRESET`.
-   `close`
-   `close` объекта `res`

Если `req.destroy()` вызывается до назначения сокета, то следующие события будут выдаваться в следующем порядке:

-   (`req.destroy()` вызывается здесь)
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'`.
-   `close`.

Если `req.destroy()` вызывается до успешного соединения, то следующие события будут выдаваться в следующем порядке:

-   `'socket'`
-   (`req.destroy()` вызывается здесь)
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'`
-   `close`.

Если `req.destroy()` вызывается после получения ответа, то следующие события будут выдаваться в следующем порядке:

-   `'socket'`
-   `response`
    -   `data` любое количество раз, на объекте `res`.
-   (`req.destroy()` вызывается здесь)
-   `aborted` на объекте `res`
-   `'error'` на объекте `res` с ошибкой с сообщением `'Error: aborted'` и кодом `'ECONNRESET'`.
-   `close`
-   `close` объекта `res``

Если `req.abort()` вызывается до назначения сокета, то следующие события будут выдаваться в следующем порядке:

-   (`req.abort()` вызывается здесь)
-   `abort`
-   `close`.

Если `req.abort()` вызывается до успешного соединения, то следующие события будут выдаваться в следующем порядке:

-   `'socket'`
-   (`req.abort()` вызывается здесь)
-   `'abort'`
-   `'error'` с ошибкой с сообщением `'Error: socket hang up'` и кодом `'ECONNRESET'`
-   `close`.

Если `req.abort()` вызывается после получения ответа, то следующие события будут выдаваться в следующем порядке:

-   `'socket'`
-   `response`
    -   `data` любое количество раз, на объекте `res`.
-   (`req.abort()` вызывается здесь)
-   `'abort'`
-   `aborted` на объекте `res`
-   `error` на объекте `res` с ошибкой с сообщением `'Error: aborted'` и кодом `'ECONNRESET'`.
-   `close`
-   `close` на объекте `res`

Установка опции `timeout` или использование функции `setTimeout()` не прервет запрос и не сделает ничего, кроме добавления события `'timeout'`.

Передача `AbortSignal` и последующий вызов `abort` на соответствующем `AbortController` будет вести себя так же, как вызов `.destroy()` на самом запросе.

<!-- 0166.part.md -->

## http.validateHeaderName

```js
http.validateHeaderName(name[, label])
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метка для сообщения об ошибке. **По умолчанию:** `Имя заголовка`.

Выполняет низкоуровневые проверки предоставленного `name`, которые выполняются при вызове `res.setHeader(name, value)`.

Передача недопустимого значения в качестве `name` приведет к возникновению [`TypeError`](errors.md#class-typeerror), идентифицируемой `code: 'ERR_INVALID_HTTP_TOKEN'`.

Нет необходимости использовать этот метод перед передачей заголовков в HTTP-запрос или ответ. Модуль HTTP автоматически проверит такие заголовки. Примеры:

Пример:

```js
const { validateHeaderName } = require('node:http');

try {
    validateHeaderName('');
} catch (err) {
    console.error(err instanceof TypeError); // --> true
    console.error(err.code); // --> 'ERR_INVALID_HTTP_TOKEN'
    console.error(err.message); // --> 'Имя заголовка должно быть действительным HTTP-токеном [""]'
}
```

<!-- 0167.part.md -->

## http.validateHeaderValue

```js
http.validateHeaderValue(name, value);
```

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Выполняет низкоуровневые проверки предоставленного `значения`, которые выполняются при вызове `res.setHeader(name, value)`.

Передача недопустимого значения в качестве `value` приведет к возникновению [`TypeError`](errors.md#class-typeerror).

-   Ошибка неопределенного значения идентифицируется `code: 'ERR_HTTP_INVALID_HEADER_VALUE'`.
-   Ошибка недопустимого символа значения идентифицируется `кодом: 'ERR_INVALID_CHAR'`.

Нет необходимости использовать этот метод перед передачей заголовков в HTTP-запрос или ответ. Модуль HTTP автоматически проверит такие заголовки.

Примеры:

```js
const { validateHeaderValue } = require('node:http');

try {
    validateHeaderValue('x-my-header', undefined);
} catch (err) {
    console.error(err instanceof TypeError); // --> true
    console.error(
        err.code === 'ERR_HTTP_INVALID_HEADER_VALUE'
    ); // --> true
    console.error(err.message); // --> 'Недопустимое значение "undefined" для заголовка "x-my-header"'
}

try {
    validateHeaderValue('x-my-header', 'oʊmɪɡə');
} catch (err) {
    console.error(err instanceof TypeError); // --> true
    console.error(err.code === 'ERR_INVALID_CHAR'); // --> true
    console.error(err.message); // --> 'Недопустимый символ в содержимом заголовка ["x-my-header"]'
}
```

<!-- 0168.part.md -->

## http.setMaxIdleHTTPParsers

```js
http.setMaxIdleHTTPParsers(max);
```

-   `max` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `1000`.

Устанавливает максимальное количество неработающих парсеров HTTP.

<!-- 0169.part.md -->
