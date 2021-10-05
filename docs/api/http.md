# Модуль http

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/http.js -->

Для использования HTTP-сервера и клиента необходимо: `require('http')`.

Интерфейсы HTTP в Node.js предназначены для поддержки многих функций протокола, которые традиционно было трудно использовать. В частности, большие сообщения, возможно, закодированные по частям. Интерфейс старается никогда не буферизовать целые запросы или ответы, поэтому пользователь может передавать данные в потоке.

Заголовки HTTP-сообщений представлены таким объектом:

<!-- eslint-skip -->

```js
{ 'content-length': '123',
  'content-type': 'text/plain',
  'connection': 'keep-alive',
  'host': 'mysite.com',
  'accept': '*/*' }
```

Ключи в нижнем регистре. Значения не изменяются.

Чтобы поддерживать полный спектр возможных HTTP-приложений, HTTP-интерфейс Node.js является очень низкоуровневым. Он занимается только обработкой потоков и анализом сообщений. Он разбирает сообщение на заголовки и тело, но не анализирует фактические заголовки или тело.

Видеть [`message.headers`](#messageheaders) для получения подробной информации о том, как обрабатываются повторяющиеся заголовки.

Необработанные заголовки в том виде, в котором они были получены, сохраняются в `rawHeaders` свойство, которое представляет собой массив `[key, value, key2, value2, ...]`. Например, объект заголовка предыдущего сообщения может иметь `rawHeaders` список, подобный следующему:

<!-- eslint-disable semi -->

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
  'mysite.com',
  'accepT',
  '*/*',
];
```

## Класс: `http.Agent`

<!-- YAML
added: v0.3.4
-->

An `Agent` отвечает за управление сохранением и повторным использованием соединения для клиентов HTTP. Он поддерживает очередь ожидающих запросов для данного хоста и порта, повторно используя одно соединение сокета для каждого, пока очередь не станет пустой, и в это время сокет либо уничтожается, либо помещается в пул, где он сохраняется для повторного использования для запросов. к тому же хосту и порту. Будет ли он уничтожен или объединен, зависит от `keepAlive` [вариант](#new-agentoptions).

Для объединенных в пул соединений включена поддержка TCP Keep-Alive, но серверы могут по-прежнему закрывать неактивные соединения, и в этом случае они будут удалены из пула, и будет создано новое соединение, когда будет сделан новый HTTP-запрос для этого хоста и порта. Серверы также могут отказать в разрешении нескольких запросов по одному и тому же соединению, и в этом случае соединение должно быть переделано для каждого запроса и не может быть объединено в пул. В `Agent` будет по-прежнему делать запросы к этому серверу, но каждый из них будет выполняться через новое соединение.

Когда соединение закрывается клиентом или сервером, оно удаляется из пула. Любые неиспользуемые сокеты в пуле не будут обновлены, чтобы не продолжать работу процесса Node.js, когда нет ожидающих запросов. (видеть [`socket.unref()`](net.md#socketunref)).

Хорошая практика - [`destroy()`](#agentdestroy) ан `Agent` Например, когда он больше не используется, потому что неиспользуемые сокеты потребляют ресурсы ОС.

Сокеты удаляются из агента, когда сокет излучает либо `'close'` событие или `'agentRemove'` событие. Если вы собираетесь держать один HTTP-запрос открытым в течение длительного времени, не сохраняя его в агенте, можно сделать что-то вроде следующего:

```js
http
  .get(options, (res) => {
    // Do stuff
  })
  .on('socket', (socket) => {
    socket.emit('agentRemove');
  });
```

Агент также может быть использован для индивидуального запроса. Предоставляя `{agent: false}` как вариант для `http.get()` или `http.request()` функции, разовое использование `Agent` с параметрами по умолчанию будет использоваться для подключения клиента.

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

<!-- YAML
added: v0.3.4
changes:
  - version:
      - v15.6.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/36685
    description: Change the default scheduling from 'fifo' to 'lifo'.
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33617
    description: Add `maxTotalSockets` option to agent constructor.
  - version:
      - v14.5.0
      - v12.20.0
    pr-url: https://github.com/nodejs/node/pull/33278
    description: Add `scheduling` option to specify the free socket
                 scheduling strategy.
-->

- `options` {Object} Набор настраиваемых параметров для настройки агента. Может иметь следующие поля:
  - `keepAlive` {boolean} Сохраняйте сокеты, даже если нет ожидающих запросов, чтобы их можно было использовать для будущих запросов без необходимости повторно устанавливать TCP-соединение. Не путать с `keep-alive` ценность `Connection` заголовок. В `Connection: keep-alive` заголовок всегда отправляется при использовании агента, кроме случаев, когда `Connection` заголовок указан явно или когда `keepAlive` а также `maxSockets` параметры соответственно установлены на `false` а также `Infinity`, в таком случае `Connection: close` будет использоваться. **Дефолт:** `false`.
  - `keepAliveMsecs` {number} При использовании `keepAlive` опция, определяет [начальная задержка](net.md#socketsetkeepaliveenable-initialdelay) для пакетов TCP Keep-Alive. Игнорируется, когда `keepAlive` вариант `false` или `undefined`. **Дефолт:** `1000`.
  - `maxSockets` {number} Максимальное количество сокетов для каждого хоста. Если один и тот же хост открывает несколько одновременных подключений, каждый запрос будет использовать новый сокет до тех пор, пока `maxSockets` значение достигнуто. Если хост пытается открыть больше соединений, чем `maxSockets`, дополнительные запросы будут помещены в очередь ожидающих запросов и войдут в активное состояние соединения, когда существующее соединение завершится. Это гарантирует, что есть не более `maxSockets` активные соединения в любой момент времени с заданного хоста. **Дефолт:** `Infinity`.
  - `maxTotalSockets` {число} Максимальное количество сокетов, разрешенное для всех хостов в сумме. Каждый запрос будет использовать новый сокет, пока не будет достигнут максимум. **Дефолт:** `Infinity`.
  - `maxFreeSockets` {number} Максимальное количество сокетов, которые можно оставить открытыми в свободном состоянии. Уместно, только если `keepAlive` установлен на `true`. **Дефолт:** `256`.
  - `scheduling` {string} Стратегия планирования, применяемая при выборе следующего свободного сокета для использования. Может быть `'fifo'` или `'lifo'`. Основное различие между двумя стратегиями планирования заключается в том, что `'lifo'` выбирает последний использованный сокет, а `'fifo'` выбирает сокет, который использовался меньше всего. В случае низкой скорости запросов в секунду `'lifo'` планирование снизит риск выбора сокета, который мог быть закрыт сервером из-за бездействия. В случае высокой скорости запросов в секунду `'fifo'` планирование максимизирует количество открытых сокетов, в то время как `'lifo'` планирование будет держать его на минимальном уровне. **Дефолт:** `'lifo'`.
  - `timeout` {number} Тайм-аут сокета в миллисекундах. Это установит тайм-аут при создании сокета.

`options` в [`socket.connect()`](net.md#socketconnectoptions-connectlistener) также поддерживаются.

По умолчанию [`http.globalAgent`](#httpglobalagent) что используется [`http.request()`](#httprequestoptions-callback) для всех этих значений установлены соответствующие значения по умолчанию.

Чтобы настроить любой из них, пользовательский [`http.Agent`](#class-httpagent) экземпляр должен быть создан.

```js
const http = require('http');
const keepAliveAgent = new http.Agent({ keepAlive: true });
options.agent = keepAliveAgent;
http.request(options, onResponseCallback);
```

### `agent.createConnection(options[, callback])`

<!-- YAML
added: v0.11.4
-->

- `options` {Object} Параметры, содержащие сведения о подключении. Проверять [`net.createConnection()`](net.md#netcreateconnectionoptions-connectlistener) для формата опций
- `callback` {Function} Функция обратного вызова, которая получает созданный сокет
- Возвращает: {stream.Duplex}

Создает сокет / поток, который будет использоваться для HTTP-запросов.

По умолчанию эта функция такая же, как и [`net.createConnection()`](net.md#netcreateconnectionoptions-connectlistener). Однако специальные агенты могут переопределить этот метод, если требуется большая гибкость.

Сокет / поток может быть предоставлен одним из двух способов: путем возврата сокета / потока из этой функции или путем передачи сокета / потока в `callback`.

Этот метод гарантированно возвращает экземпляр класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не указывает тип сокета, отличный от {net.Socket}.

`callback` имеет подпись `(err, stream)`.

### `agent.keepSocketAlive(socket)`

<!-- YAML
added: v8.1.0
-->

- `socket` {stream.Duplex}

Вызывается, когда `socket` отделяется от запроса и может сохраняться `Agent`. По умолчанию:

```js
socket.setKeepAlive(true, this.keepAliveMsecs);
socket.unref();
return true;
```

Этот метод может быть отменен конкретным `Agent` подкласс. Если этот метод возвращает ложное значение, сокет будет уничтожен, а не сохранен для использования со следующим запросом.

В `socket` аргумент может быть экземпляром {net.Socket}, подклассом {stream.Duplex}.

### `agent.reuseSocket(socket, request)`

<!-- YAML
added: v8.1.0
-->

- `socket` {stream.Duplex}
- `request` {http.ClientRequest}

Вызывается, когда `socket` прикреплен к `request` после сохранения из-за опций сохранения активности. По умолчанию:

```js
socket.ref();
```

Этот метод может быть отменен конкретным `Agent` подкласс.

В `socket` аргумент может быть экземпляром {net.Socket}, подклассом {stream.Duplex}.

### `agent.destroy()`

<!-- YAML
added: v0.11.4
-->

Уничтожьте все сокеты, которые в настоящее время используются агентом.

Обычно в этом нет необходимости. Однако при использовании агента с `keepAlive` включен, то лучше явно закрыть агент, когда он больше не нужен. В противном случае сокеты могут оставаться открытыми довольно долгое время, прежде чем сервер их отключит.

### `agent.freeSockets`

<!-- YAML
added: v0.11.4
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/36409
    description: The property now has a `null` prototype.
-->

- {Объект}

Объект, содержащий массивы сокетов, ожидающих в настоящее время использования агентом, когда `keepAlive` включен. Не модифицируйте.

Розетки в `freeSockets` список будет автоматически уничтожен и удален из массива на `'timeout'`.

### `agent.getName(options)`

<!-- YAML
added: v0.11.4
-->

- `options` {Object} Набор параметров, предоставляющих информацию для генерации имени
  - `host` {строка} Доменное имя или IP-адрес сервера, на который будет отправлен запрос
  - `port` {number} Порт удаленного сервера
  - `localAddress` {строка} Локальный интерфейс для привязки сетевых подключений при выдаче запроса
  - `family` {integer} Должно быть 4 или 6, если это не равно `undefined`.
- Возвращает: {строка}

Получите уникальное имя для набора параметров запроса, чтобы определить, можно ли повторно использовать соединение. Для агента HTTP это возвращает `host:port:localAddress` или `host:port:localAddress:family`. Для агента HTTPS имя включает CA, сертификат, шифры и другие параметры, специфичные для HTTPS / TLS, которые определяют возможность повторного использования сокета.

### `agent.maxFreeSockets`

<!-- YAML
added: v0.11.7
-->

- {количество}

По умолчанию установлено значение 256. Для агентов с `keepAlive` enabled, это устанавливает максимальное количество сокетов, которые будут оставлены открытыми в свободном состоянии.

### `agent.maxSockets`

<!-- YAML
added: v0.3.6
-->

- {количество}

По умолчанию установлено на `Infinity`. Определяет, сколько одновременных сокетов может быть открыто агентом для каждого источника. Происхождение - это возвращаемое значение [`agent.getName()`](#agentgetnameoptions).

### `agent.maxTotalSockets`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

- {количество}

По умолчанию установлено на `Infinity`. Определяет, сколько одновременных сокетов может быть открыто агентом. В отличие от `maxSockets`, этот параметр применяется ко всем источникам.

### `agent.requests`

<!-- YAML
added: v0.5.9
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/36409
    description: The property now has a `null` prototype.
-->

- {Объект}

Объект, содержащий очереди запросов, которые еще не назначены сокетам. Не модифицируйте.

### `agent.sockets`

<!-- YAML
added: v0.3.6
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/36409
    description: The property now has a `null` prototype.
-->

- {Объект}

Объект, который содержит массивы сокетов, которые в настоящее время используются агентом. Не модифицируйте.

## Класс: `http.ClientRequest`

<!-- YAML
added: v0.1.17
-->

- Расширяется: {Stream}

Этот объект создается внутри и возвращается из [`http.request()`](#httprequestoptions-callback). Он представляет собой _в ходе выполнения_ запрос, заголовок которого уже поставлен в очередь. Заголовок все еще изменяем с помощью [`setHeader(name, value)`](#requestsetheadername-value), [`getHeader(name)`](#requestgetheadername), [`removeHeader(name)`](#requestremoveheadername) API. Фактический заголовок будет отправлен вместе с первым блоком данных или при вызове [`request.end()`](#requestenddata-encoding-callback).

Чтобы получить ответ, добавьте слушателя для [`'response'`](#event-response) к объекту запроса. [`'response'`](#event-response) будет испущен из объекта запроса, когда будут получены заголовки ответа. В [`'response'`](#event-response) событие выполняется с одним аргументом, который является экземпляром [`http.IncomingMessage`](#class-httpincomingmessage).

В течение [`'response'`](#event-response) событие, можно добавить слушателей к объекту ответа; особенно слушать `'data'` событие.

Если нет [`'response'`](#event-response) обработчик добавлен, то ответ будет полностью отброшен. Однако если [`'response'`](#event-response) добавляется обработчик событий, затем данные из объекта ответа **должен** быть потребленным, либо позвонив `response.read()` всякий раз, когда есть `'readable'` событие, или добавив `'data'` обработчик, или вызвав `.resume()` метод. Пока данные не будут использованы, `'end'` событие не сработает. Кроме того, до тех пор, пока данные не будут считаны, они будут занимать память, что в конечном итоге может привести к ошибке «процесса не хватает памяти».

Для обратной совместимости `res` будет только излучать `'error'` если есть `'error'` слушатель зарегистрировался.

Node.js не проверяет, равны ли Content-Length и длина переданного тела.

### Событие: `'abort'`

<!-- YAML
added: v1.4.1
deprecated: REPLACEME
-->

> Стабильность: 0 - Не рекомендуется. Слушайте `'close'` событие вместо этого.

Выдается, когда запрос был прерван клиентом. Это событие генерируется только при первом вызове `abort()`.

### Событие: `'connect'`

<!-- YAML
added: v0.7.0
-->

- `response` {http.IncomingMessage}
- `socket` {stream.Duplex}
- `head` {Буфер}

Излучается каждый раз, когда сервер отвечает на запрос с помощью `CONNECT` метод. Если это событие не прослушивается, клиенты, получающие `CONNECT` будут закрыты их соединения.

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

Пара клиент и сервер, демонстрирующая, как прослушивать `'connect'` событие:

```js
const http = require('http');
const net = require('net');
const { URL } = require('url');

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

### Событие: `'continue'`

<!-- YAML
added: v0.3.2
-->

Генерируется, когда сервер отправляет HTTP-ответ «100 Continue», обычно потому, что запрос содержит «Expect: 100-continue». Это инструкция о том, что клиент должен отправить тело запроса.

### Событие: `'information'`

<!-- YAML
added: v10.0.0
-->

- `info` {Объект}
  - `httpVersion` {нить}
  - `httpVersionMajor` {целое число}
  - `httpVersionMinor` {целое число}
  - `statusCode` {целое число}
  - `statusMessage` {нить}
  - `headers` {Объект}
  - `rawHeaders` {нить\[]}

Выдается, когда сервер отправляет промежуточный ответ 1xx (за исключением 101 Upgrade). Слушатели этого события получат объект, содержащий версию HTTP, код состояния, сообщение о состоянии, объект заголовков значений ключа и массив с именами необработанных заголовков, за которыми следуют их соответствующие значения.

```js
const http = require('http');

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

101 Статусы обновления не вызывают это событие из-за их разрыва с традиционной цепочкой HTTP-запросов / ответов, такой как веб-сокеты, обновления TLS на месте или HTTP 2.0. Чтобы получать уведомления об обновлении 101, прислушайтесь к [`'upgrade'`](#event-upgrade) событие вместо этого.

### Событие: `'response'`

<!-- YAML
added: v0.1.0
-->

- `response` {http.IncomingMessage}

Выдается при получении ответа на этот запрос. Это событие генерируется только один раз.

### Событие: `'socket'`

<!-- YAML
added: v0.5.3
-->

- `socket` {stream.Duplex}

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

### Событие: `'timeout'`

<!-- YAML
added: v0.7.8
-->

Генерируется, когда базовый сокет выходит из строя по тайм-ауту. Это только уведомляет о том, что сокет бездействует. Запрос необходимо уничтожить вручную.

Смотрите также: [`request.setTimeout()`](#requestsettimeouttimeout-callback).

### Событие: `'upgrade'`

<!-- YAML
added: v0.1.94
-->

- `response` {http.IncomingMessage}
- `socket` {stream.Duplex}
- `head` {Буфер}

Излучается каждый раз, когда сервер отвечает на запрос об обновлении. Если это событие не прослушивается, а код состояния ответа - 101 Switching Protocols, клиенты, получающие заголовок обновления, будут закрывать свои соединения.

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

Пара клиент-сервер, демонстрирующая, как прослушивать `'upgrade'` событие.

```js
const http = require('http');

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

### `request.abort()`

<!-- YAML
added: v0.3.8
deprecated:
  - v14.1.0
  - v13.14.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`request.destroy()`](#requestdestroyerror) вместо.

Отмечает запрос как прерывающийся. Вызов этого приведет к удалению оставшихся данных в ответе и уничтожению сокета.

### `request.aborted`

<!-- YAML
added: v0.11.14
deprecated: REPLACEME
changes:
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/20230
    description: The `aborted` property is no longer a timestamp number.
-->

> Стабильность: 0 - Не рекомендуется. Проверять [`request.destroyed`](#requestdestroyed) вместо.

- {логический}

В `request.aborted` собственность будет `true` если запрос был прерван.

### `request.connection`

<!-- YAML
added: v0.3.0
deprecated: v13.0.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`request.socket`](#requestsocket).

- {stream.Duplex}

Видеть [`request.socket`](#requestsocket).

### `request.end([data[, encoding]][, callback])`

<!-- YAML
added: v0.1.90
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18780
    description: This method now returns a reference to `ClientRequest`.
-->

- `data` {строка | буфер}
- `encoding` {нить}
- `callback` {Функция}
- Возвращает: {this}

Завершает отправку запроса. Если какие-либо части тела не отправлены, он смывает их в поток. Если запрос разбит на части, будет отправлен завершающий `'0\r\n\r\n'`.

Если `data` указано, это эквивалентно вызову [`request.write(data, encoding)`](#requestwritechunk-encoding-callback) с последующим `request.end(callback)`.

Если `callback` указан, он будет вызываться по завершении потока запроса.

### `request.destroy([error])`

<!-- YAML
added: v0.3.0
changes:
  - version: v14.5.0
    pr-url: https://github.com/nodejs/node/pull/32789
    description: The function returns `this` for consistency with other Readable
                 streams.
-->

- `error` {Error} Необязательно, сообщение об ошибке `'error'` событие.
- Возвращает: {this}

Уничтожьте запрос. При желании испустить `'error'` событие и испустить `'close'` событие. Вызов этого приведет к удалению оставшихся данных в ответе и уничтожению сокета.

Видеть [`writable.destroy()`](stream.md#writabledestroyerror) для получения дополнительной информации.

#### `request.destroyed`

<!-- YAML
added:
  - v14.1.0
  - v13.14.0
-->

- {логический}

Является `true` после [`request.destroy()`](#requestdestroyerror) был вызван.

Видеть [`writable.destroyed`](stream.md#writabledestroyed) для получения дополнительной информации.

### `request.finished`

<!-- YAML
added: v0.0.1
deprecated:
 - v13.4.0
 - v12.16.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`request.writableEnded`](#requestwritableended).

- {логический}

В `request.finished` собственность будет `true` если [`request.end()`](#requestenddata-encoding-callback) был вызван. `request.end()` будет автоматически вызываться, если запрос был инициирован через [`http.get()`](#httpgetoptions-callback).

### `request.flushHeaders()`

<!-- YAML
added: v1.6.0
-->

Очищает заголовки запроса.

Из соображений эффективности Node.js обычно буферизует заголовки запроса до тех пор, пока `request.end()` вызывается или записывается первый фрагмент данных запроса. Затем он пытается упаковать заголовки запроса и данные в один TCP-пакет.

Обычно это желательно (это экономит TCP-обход), но не тогда, когда первые данные не отправляются, возможно, намного позже. `request.flushHeaders()` обходит оптимизацию и запускает запрос.

### `request.getHeader(name)`

<!-- YAML
added: v1.6.0
-->

- `name` {нить}
- Возврат: {любой}

Считывает заголовок запроса. Имя не чувствительно к регистру. Тип возвращаемого значения зависит от аргументов, предоставленных для [`request.setHeader()`](#requestsetheadername-value).

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

### `request.getRawHeaderNames()`

<!-- YAML
added:
  - v15.13.0
  - v14.17.0
-->

- Возвращает: {строка \[]}

Возвращает массив, содержащий уникальные имена текущих исходящих необработанных заголовков. Имена заголовков возвращаются с установленным их точным регистром.

```js
request.setHeader('Foo', 'bar');
request.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = request.getRawHeaderNames();
// headerNames === ['Foo', 'Set-Cookie']
```

### `request.maxHeadersCount`

- {количество} **Дефолт:** `2000`

Ограничивает максимальное количество заголовков ответа. Если установлено значение 0, ограничение не применяется.

### `request.path`

<!-- YAML
added: v0.4.0
-->

- {строка} Путь запроса.

### `request.method`

<!-- YAML
added: v0.1.97
-->

- {строка} Метод запроса.

### `request.host`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

- {строка} Хост запроса.

### `request.protocol`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

- {строка} Протокол запроса.

### `request.removeHeader(name)`

<!-- YAML
added: v1.6.0
-->

- `name` {нить}

Удаляет заголовок, который уже определен в объекте заголовков.

```js
request.removeHeader('Content-Type');
```

### `request.reusedSocket`

<!-- YAML
added:
 - v13.0.0
 - v12.16.0
-->

- {boolean} Отправляется ли запрос через повторно используемый сокет.

При отправке запроса через агент с активным поддержанием активности базовый сокет может быть повторно использован. Но если сервер закрывает соединение в неподходящий момент, клиент может столкнуться с ошибкой «ECONNRESET».

```js
const http = require('http');

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

Пометив запрос, независимо от того, использовался ли он повторно или нет, мы можем выполнить на нем автоматическую повторную попытку ошибки.

```js
const http = require('http');
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

<!-- YAML
added: v1.6.0
-->

- `name` {нить}
- `value` {любой}

Устанавливает одно значение заголовка для объекта заголовков. Если этот заголовок уже существует в заголовках для отправки, его значение будет заменено. Используйте здесь массив строк, чтобы отправить несколько заголовков с одним и тем же именем. Нестроковые значения будут сохранены без изменений. Следовательно, [`request.getHeader()`](#requestgetheadername) может возвращать нестроковые значения. Однако нестроковые значения будут преобразованы в строки для передачи по сети.

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

### `request.setNoDelay([noDelay])`

<!-- YAML
added: v0.5.9
-->

- `noDelay` {логический}

Как только сокет назначен этому запросу и подключен [`socket.setNoDelay()`](net.md#socketsetnodelaynodelay) будет называться.

### `request.setSocketKeepAlive([enable][, initialDelay])`

<!-- YAML
added: v0.5.9
-->

- `enable` {логический}
- `initialDelay` {количество}

Как только сокет назначен этому запросу и подключен [`socket.setKeepAlive()`](net.md#socketsetkeepaliveenable-initialdelay) будет называться.

### `request.setTimeout(timeout[, callback])`

<!-- YAML
added: v0.5.9
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/8895
    description: Consistently set socket timeout only when the socket connects.
-->

- `timeout` {number} Миллисекунды до истечения времени ожидания запроса.
- `callback` {Функция} Необязательная функция, вызываемая при истечении времени ожидания. То же, что и привязка к `'timeout'` событие.
- Возвращает: {http.ClientRequest}

Как только сокет назначен этому запросу и подключен [`socket.setTimeout()`](net.md#socketsettimeouttimeout-callback) будет называться.

### `request.socket`

<!-- YAML
added: v0.3.0
-->

- {stream.Duplex}

Ссылка на базовый сокет. Обычно пользователи не хотят получать доступ к этому свойству. В частности, сокет не будет излучать `'readable'` события из-за того, как парсер протокола подключается к сокету.

```js
const http = require('http');
const options = {
  host: 'www.google.com',
};
const req = http.get(options);
req.end();
req.once('response', (res) => {
  const ip = req.socket.localAddress;
  const port = req.socket.localPort;
  console.log(
    `Your IP address is ${ip} and your source port is ${port}.`
  );
  // Consume response object
});
```

Это свойство гарантированно является экземпляром класса {net.Socket}, подкласса {stream.Duplex}, если только пользователь не указал тип сокета, отличный от {net.Socket}.

### `request.writableEnded`

<!-- YAML
added: v12.9.0
-->

- {логический}

Является `true` после [`request.end()`](#requestenddata-encoding-callback) был вызван. Это свойство не указывает, были ли данные сброшены, для этого использования. [`request.writableFinished`](#requestwritablefinished) вместо.

### `request.writableFinished`

<!-- YAML
added: v12.7.0
-->

- {логический}

Является `true` если все данные были сброшены в базовую систему, непосредственно перед [`'finish'`](#event-finish) событие испускается.

### `request.write(chunk[, encoding][, callback])`

<!-- YAML
added: v0.1.29
-->

- `chunk` {строка | буфер}
- `encoding` {нить}
- `callback` {Функция}
- Возвращает: {логическое}

Отправляет кусок тела. Этот метод можно вызывать несколько раз. Если нет `Content-Length` установлен, данные будут автоматически закодированы в кодировке передачи HTTP Chunked, чтобы сервер знал, когда данные заканчиваются. В `Transfer-Encoding: chunked` заголовок добавлен. Вызов [`request.end()`](#requestenddata-encoding-callback) необходимо для завершения отправки запроса.

В `encoding` аргумент является необязательным и применяется только тогда, когда `chunk` это строка. По умолчанию `'utf8'`.

В `callback` Аргумент является необязательным и будет вызываться, когда этот фрагмент данных будет сброшен, но только если этот фрагмент не пуст.

Возврат `true` если все данные были успешно сброшены в буфер ядра. Возврат `false` если все или часть данных были помещены в очередь в пользовательской памяти. `'drain'` будет выдан, когда буфер снова освободится.

Когда `write` функция вызывается с пустой строкой или буфером, она ничего не делает и ожидает ввода дополнительных данных.

## Класс: `http.Server`

<!-- YAML
added: v0.1.17
-->

- Расширяется: {net.Server}

### Событие: `'checkContinue'`

<!-- YAML
added: v0.3.0
-->

- `request` {http.IncomingMessage}
- `response` {http.ServerResponse}

Выдается каждый раз, когда запрос с HTTP `Expect: 100-continue` получен. Если это событие не прослушивается, сервер автоматически ответит `100 Continue` по мере необходимости.

Обработка этого события включает вызов [`response.writeContinue()`](#responsewritecontinue) если клиент должен продолжать отправлять тело запроса, или генерировать соответствующий HTTP-ответ (например, 400 Bad Request), если клиент не должен продолжать отправлять тело запроса.

Когда это событие генерируется и обрабатывается, [`'request'`](#event-request) событие не будет отправлено.

### Событие: `'checkExpectation'`

<!-- YAML
added: v5.5.0
-->

- `request` {http.IncomingMessage}
- `response` {http.ServerResponse}

Выдается каждый раз, когда запрос с HTTP `Expect` заголовок получен, где значение не `100-continue`. Если это событие не прослушивается, сервер автоматически ответит `417 Expectation Failed` по мере необходимости.

Когда это событие генерируется и обрабатывается, [`'request'`](#event-request) событие не будет отправлено.

### Событие: `'clientError'`

<!-- YAML
added: v0.1.94
changes:
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/25605
    description: The default behavior will return a 431 Request Header
                 Fields Too Large if a HPE_HEADER_OVERFLOW error occurs.
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/17672
    description: The `rawPacket` is the current buffer that just parsed. Adding
                 this buffer to the error object of `'clientError'` event is to
                 make it possible that developers can log the broken packet.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/4557
    description: The default action of calling `.destroy()` on the `socket`
                 will no longer take place if there are listeners attached
                 for `'clientError'`.
-->

- `exception` {Ошибка}
- `socket` {stream.Duplex}

Если клиентское соединение выдает `'error'` событие будет перенаправлено сюда. Слушатель этого события отвечает за закрытие / уничтожение базового сокета. Например, кто-то может захотеть более аккуратно закрыть сокет с помощью настраиваемого HTTP-ответа, вместо того, чтобы резко разорвать соединение.

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

Поведение по умолчанию - попытаться закрыть сокет с помощью HTTP «400 Bad Request» или HTTP «431 Request Header Fields Too Large» в случае [`HPE_HEADER_OVERFLOW`](errors.md#hpe_header_overflow) ошибка. Если сокет недоступен для записи или уже записал данные, он немедленно уничтожается.

`socket` это [`net.Socket`](net.md#class-netsocket) объект, из-за которого возникла ошибка.

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.end();
});
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
server.listen(8000);
```

Когда `'clientError'` событие происходит, нет `request` или `response` объект, поэтому любой отправленный HTTP-ответ, включая заголовки и полезную нагрузку, _должен_ быть написано прямо в `socket` объект. Необходимо позаботиться о том, чтобы ответ был правильно отформатированным ответным сообщением HTTP.

`err` это пример `Error` с двумя дополнительными столбцами:

- `bytesParsed`: количество байтов пакета запроса, который Node.js мог правильно проанализировать;
- `rawPacket`: необработанный пакет текущего запроса.

В некоторых случаях клиент уже получил ответ и / или сокет уже был уничтожен, как в случае `ECONNRESET` ошибки. Прежде чем пытаться отправить данные в сокет, лучше убедиться, что он все еще доступен для записи.

```js
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) {
    return;
  }

  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});
```

### Событие: `'close'`

<!-- YAML
added: v0.1.4
-->

Выдается при закрытии сервера.

### Событие: `'connect'`

<!-- YAML
added: v0.7.0
-->

- `request` {http.IncomingMessage} Аргументы для HTTP-запроса, как в [`'request'`](#event-request) событие
- `socket` {stream.Duplex} Сетевой сокет между сервером и клиентом
- `head` {Buffer} Первый пакет туннельного потока (может быть пустым)

Излучается каждый раз, когда клиент запрашивает HTTP `CONNECT` метод. Если это событие не прослушивается, то клиенты, запрашивающие `CONNECT` будут закрыты их соединения.

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

После того, как это событие будет сгенерировано, сокет запроса не будет иметь `'data'` прослушиватель событий, то есть его необходимо связать, чтобы обрабатывать данные, отправленные на сервер через этот сокет.

### Событие: `'connection'`

<!-- YAML
added: v0.1.0
-->

- `socket` {stream.Duplex}

Это событие генерируется, когда устанавливается новый поток TCP. `socket` обычно является объектом типа [`net.Socket`](net.md#class-netsocket). Обычно пользователи не хотят получать доступ к этому событию. В частности, сокет не будет излучать `'readable'` события из-за того, как парсер протокола подключается к сокету. В `socket` также можно получить на `request.socket`.

Это событие также может быть явно отправлено пользователями для вставки соединений в HTTP-сервер. В этом случае любой [`Duplex`](stream.md#class-streamduplex) поток можно пропустить.

Если `socket.setTimeout()` здесь вызывается, тайм-аут будет заменен на `server.keepAliveTimeout` когда сокет обслужил запрос (если `server.keepAliveTimeout` не равно нулю).

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

### Событие: `'request'`

<!-- YAML
added: v0.1.0
-->

- `request` {http.IncomingMessage}
- `response` {http.ServerResponse}

Выдается каждый раз при запросе. На одно соединение может быть несколько запросов (в случае соединений HTTP Keep-Alive).

### Событие: `'upgrade'`

<!-- YAML
added: v0.1.94
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19981
    description: Not listening to this event no longer causes the socket
                 to be destroyed if a client sends an Upgrade header.
-->

- `request` {http.IncomingMessage} Аргументы для HTTP-запроса, как в [`'request'`](#event-request) событие
- `socket` {stream.Duplex} Сетевой сокет между сервером и клиентом
- `head` {Buffer} Первый пакет обновленного потока (может быть пустым)

Выдается каждый раз, когда клиент запрашивает обновление HTTP. Прослушивание этого события необязательно, и клиенты не могут настаивать на изменении протокола.

После того, как это событие будет сгенерировано, сокет запроса не будет иметь `'data'` прослушиватель событий, то есть его необходимо связать, чтобы обрабатывать данные, отправленные на сервер через этот сокет.

Это событие гарантированно будет передано экземпляру класса {net.Socket}, подкласса {stream.Duplex}, если пользователь не укажет тип сокета, отличный от {net.Socket}.

### `server.close([callback])`

<!-- YAML
added: v0.1.90
-->

- `callback` {Функция}

Останавливает сервер от приема новых подключений. Видеть [`net.Server.close()`](net.md#serverclosecallback).

### `server.headersTimeout`

<!-- YAML
added:
 - v11.3.0
 - v10.14.0
-->

- {количество} **Дефолт:** `60000`

Ограничьте время ожидания парсером получения полных заголовков HTTP.

В случае бездействия правила, определенные в [`server.timeout`](#servertimeout) подать заявление. Однако этот тайм-аут, основанный на неактивности, по-прежнему позволяет поддерживать соединение открытым, если заголовки отправляются очень медленно (по умолчанию до байта в 2 минуты). Чтобы предотвратить это, всякий раз, когда поступают данные заголовка, выполняется дополнительная проверка, что более чем `server.headersTimeout` миллисекунд не прошло с момента установления соединения. Если проверка не удалась, `'timeout'` событие генерируется на объекте сервера, и (по умолчанию) сокет уничтожается. Видеть [`server.timeout`](#servertimeout) для получения дополнительной информации о том, как настроить поведение тайм-аута.

### `server.listen()`

Запускает HTTP-сервер, ожидающий подключений. Этот метод идентичен [`server.listen()`](net.md#serverlisten) из [`net.Server`](net.md#class-netserver).

### `server.listening`

<!-- YAML
added: v5.7.0
-->

- {boolean} Указывает, прослушивает ли сервер соединения.

### `server.maxHeadersCount`

<!-- YAML
added: v0.7.0
-->

- {количество} **Дефолт:** `2000`

Ограничивает максимальное количество входящих заголовков. Если установлено значение 0, ограничение не применяется.

### `server.requestTimeout`

<!-- YAML
added: v14.11.0
-->

- {количество} **Дефолт:** `0`

Устанавливает значение тайм-аута в миллисекундах для получения всего запроса от клиента.

Если тайм-аут истекает, сервер отвечает статусом 408, не перенаправляя запрос в приемник запросов, а затем закрывает соединение.

Он должен быть установлен на ненулевое значение (например, 120 секунд) для защиты от потенциальных атак типа «отказ в обслуживании» в случае, если сервер развернут без обратного прокси-сервера.

### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v0.9.12
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

- `msecs` {количество} **Дефолт:** 0 (без тайм-аута)
- `callback` {Функция}
- Возвращает: {http.Server}

Устанавливает значение тайм-аута для сокетов и выдает `'timeout'` в объекте Server, передавая сокет в качестве аргумента, если происходит тайм-аут.

Если есть `'timeout'` прослушиватель событий на объекте Server, тогда он будет вызываться с тайм-аутом сокета в качестве аргумента.

По умолчанию сервер не отключает сокеты по таймауту. Однако, если обратный вызов назначен серверу `'timeout'` событие таймауты должны обрабатываться явно.

### `server.maxRequestsPerSocket`

<!-- YAML
added: v16.10.0
-->

- {число} запросов на сокет. **Дефолт:** 0 (без ограничений)

Максимальное количество запросов, которые сокет может обработать перед закрытием соединения keep alive.

Ценность `0` отключит ограничение.

Когда предел будет достигнут, он установит `Connection` значение заголовка для `close`, но фактически не закроет соединение, последующие запросы, отправленные после достижения лимита, получат `503 Service Unavailable` как ответ.

### `server.timeout`

<!-- YAML
added: v0.9.12
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

- {number} Тайм-аут в миллисекундах. **Дефолт:** 0 (без тайм-аута)

Количество миллисекунд бездействия до истечения тайм-аута сокета.

Ценность `0` отключит поведение тайм-аута для входящих подключений.

Логика тайм-аута сокета настраивается при подключении, поэтому изменение этого значения влияет только на новые подключения к серверу, но не на существующие подключения.

### `server.keepAliveTimeout`

<!-- YAML
added: v8.0.0
-->

- {number} Тайм-аут в миллисекундах. **Дефолт:** `5000` (5 секунд).

Количество миллисекунд бездействия, необходимое серверу для ожидания дополнительных входящих данных после того, как он закончит запись последнего ответа, прежде чем сокет будет уничтожен. Если сервер получит новые данные до того, как истечет тайм-аут проверки активности, он сбросит обычный тайм-аут бездействия, т. Е. [`server.timeout`](#servertimeout).

Ценность `0` отключит тайм-аут сохранения активности для входящих подключений. Ценность `0` заставляет http-сервер вести себя аналогично версиям Node.js до 8.0.0, в которых не было тайм-аута сохранения активности.

Логика тайм-аута сокета настраивается при подключении, поэтому изменение этого значения влияет только на новые подключения к серверу, но не на существующие подключения.

## Класс: `http.ServerResponse`

<!-- YAML
added: v0.1.17
-->

- Расширяется: {Stream}

Этот объект создается внутри HTTP-сервером, а не пользователем. Он передается вторым параметром в [`'request'`](#event-request) событие.

### Событие: `'close'`

<!-- YAML
added: v0.6.7
-->

Указывает, что ответ завершен или его базовое соединение было преждевременно прервано (до завершения ответа).

### Событие: `'finish'`

<!-- YAML
added: v0.3.6
-->

Выдается после отправки ответа. В частности, это событие генерируется, когда последний сегмент заголовков и тела ответа передан операционной системе для передачи по сети. Это не означает, что клиент еще что-то получил.

### `response.addTrailers(headers)`

<!-- YAML
added: v0.3.0
-->

- `headers` {Объект}

Этот метод добавляет к ответу завершающие заголовки HTTP (заголовок, но в конце сообщения).

Прицепы будут **Только** выдается, если для ответа используется кодирование по частям; если это не так (например, если запрос был HTTP / 1.0), они будут отброшены без уведомления.

HTTP требует `Trailer` заголовок, который будет отправлен для отправки трейлеров, со списком полей заголовка в его значении. Например.,

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

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

### `response.connection`

<!-- YAML
added: v0.3.0
deprecated: v13.0.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`response.socket`](#responsesocket).

- {stream.Duplex}

Видеть [`response.socket`](#responsesocket).

### `response.cork()`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

Видеть [`writable.cork()`](stream.md#writablecork).

### `response.end([data[, encoding]][, callback])`

<!-- YAML
added: v0.1.90
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18780
    description: This method now returns a reference to `ServerResponse`.
-->

- `data` {строка | буфер}
- `encoding` {нить}
- `callback` {Функция}
- Возвращает: {this}

Этот метод сигнализирует серверу, что все заголовки и тело ответа отправлены; этот сервер должен считать это сообщение завершенным. Метод, `response.end()`, ДОЛЖЕН вызываться при каждом ответе.

Если `data` указан, он аналогичен вызову [`response.write(data, encoding)`](#responsewritechunk-encoding-callback) с последующим `response.end(callback)`.

Если `callback` указан, он будет вызываться по завершении потока ответа.

### `response.finished`

<!-- YAML
added: v0.0.2
deprecated:
 - v13.4.0
 - v12.16.0
-->

> Стабильность: 0 - Не рекомендуется. Использовать [`response.writableEnded`](#responsewritableended).

- {логический}

В `response.finished` собственность будет `true` если [`response.end()`](#responseenddata-encoding-callback) был вызван.

### `response.flushHeaders()`

<!-- YAML
added: v1.6.0
-->

Удаляет заголовки ответа. Смотрите также: [`request.flushHeaders()`](#requestflushheaders).

### `response.getHeader(name)`

<!-- YAML
added: v0.4.0
-->

- `name` {нить}
- Возврат: {любой}

Считывает заголовок, который уже поставлен в очередь, но не отправлен клиенту. Имя не чувствительно к регистру. Тип возвращаемого значения зависит от аргументов, предоставленных для [`response.setHeader()`](#responsesetheadername-value).

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

<!-- YAML
added: v7.7.0
-->

- Возвращает: {строка \[]}

Возвращает массив, содержащий уникальные имена текущих исходящих заголовков. Все имена заголовков в нижнем регистре.

```js
response.setHeader('Foo', 'bar');
response.setHeader('Set-Cookie', ['foo=bar', 'bar=baz']);

const headerNames = response.getHeaderNames();
// headerNames === ['foo', 'set-cookie']
```

### `response.getHeaders()`

<!-- YAML
added: v7.7.0
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

### `response.hasHeader(name)`

<!-- YAML
added: v7.7.0
-->

- `name` {нить}
- Возвращает: {логическое}

Возврат `true` если заголовок идентифицирован `name` в настоящее время устанавливается в исходящих заголовках. При сопоставлении имени заголовка регистр не учитывается.

```js
const hasContentType = response.hasHeader('content-type');
```

### `response.headersSent`

<!-- YAML
added: v0.9.3
-->

- {логический}

Boolean (только для чтения). Истина, если заголовки были отправлены, в противном случае - ложь.

### `response.removeHeader(name)`

<!-- YAML
added: v0.4.0
-->

- `name` {нить}

Удаляет заголовок, поставленный в очередь для неявной отправки.

```js
response.removeHeader('Content-Encoding');
```

### `response.req`

<!-- YAML
added: v15.7.0
-->

- {http.IncomingMessage}

Ссылка на исходный HTTP `request` объект.

### `response.sendDate`

<!-- YAML
added: v0.7.5
-->

- {логический}

Если установлено значение true, заголовок Date будет автоматически сгенерирован и отправлен в ответе, если он еще не присутствует в заголовках. По умолчанию true.

Это следует отключать только для тестирования; HTTP требует заголовка Date в ответах.

### `response.setHeader(name, value)`

<!-- YAML
added: v0.4.0
-->

- `name` {нить}
- `value` {любой}
- Возвращает: {http.ServerResponse}

Возвращает объект ответа.

Устанавливает одно значение заголовка для неявных заголовков. Если этот заголовок уже существует в заголовках для отправки, его значение будет заменено. Используйте здесь массив строк, чтобы отправить несколько заголовков с одним и тем же именем. Нестроковые значения будут сохранены без изменений. Следовательно, [`response.getHeader()`](#responsegetheadername) может возвращать нестроковые значения. Однако нестроковые значения будут преобразованы в строки для передачи по сети. Тот же объект ответа возвращается вызывающему, чтобы включить цепочку вызовов.

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

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

Когда заголовки были установлены с [`response.setHeader()`](#responsesetheadername-value), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), с заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) учитывая приоритет.

```js
// Returns content-type = text/plain
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
```

Если [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) вызывается метод, и этот метод не был вызван, он будет напрямую записывать предоставленные значения заголовка в сетевой канал без внутреннего кэширования, а [`response.getHeader()`](#responsegetheadername) в заголовке не даст ожидаемого результата. Если желательно прогрессивное заполнение заголовков с возможным извлечением и модификацией в будущем, используйте [`response.setHeader()`](#responsesetheadername-value) вместо того [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers).

### `response.setTimeout(msecs[, callback])`

<!-- YAML
added: v0.9.12
-->

- `msecs` {количество}
- `callback` {Функция}
- Возвращает: {http.ServerResponse}

Устанавливает значение тайм-аута сокета равным `msecs`. Если предоставляется обратный вызов, он добавляется в качестве слушателя на `'timeout'` событие в объекте ответа.

Если нет `'timeout'` слушатель добавляется к запросу, ответу или серверу, а затем сокеты уничтожаются по истечении времени ожидания. Если на запрос назначен обработчик, ответ или серверный `'timeout'` события, сокеты с истекшим временем ожидания должны обрабатываться явно.

### `response.socket`

<!-- YAML
added: v0.3.0
-->

- {stream.Duplex}

Ссылка на базовый сокет. Обычно пользователи не хотят получать доступ к этому свойству. В частности, сокет не будет излучать `'readable'` события из-за того, как парсер протокола подключается к сокету. После `response.end()`, собственность аннулирована.

```js
const http = require('http');
const server = http
  .createServer((req, res) => {
    const ip = res.socket.remoteAddress;
    const port = res.socket.remotePort;
    res.end(
      `Your IP address is ${ip} and your source port is ${port}.`
    );
  })
  .listen(3000);
```

Это свойство гарантированно является экземпляром класса {net.Socket}, подкласса {stream.Duplex}, если только пользователь не указал тип сокета, отличный от {net.Socket}.

### `response.statusCode`

<!-- YAML
added: v0.4.0
-->

- {количество} **Дефолт:** `200`

При использовании неявных заголовков (не вызывающих [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) явно), это свойство управляет кодом состояния, который будет отправлен клиенту при сбросе заголовков.

```js
response.statusCode = 404;
```

После того, как заголовок ответа был отправлен клиенту, это свойство указывает код состояния, который был отправлен.

### `response.statusMessage`

<!-- YAML
added: v0.11.8
-->

- {нить}

При использовании неявных заголовков (не вызывающих [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) явно), это свойство управляет сообщением о состоянии, которое будет отправлено клиенту, когда заголовки будут сброшены. Если это оставить как `undefined` тогда будет использоваться стандартное сообщение для кода состояния.

```js
response.statusMessage = 'Not found';
```

После того, как заголовок ответа был отправлен клиенту, это свойство указывает сообщение о состоянии, которое было отправлено.

### `response.uncork()`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

Видеть [`writable.uncork()`](stream.md#writableuncork).

### `response.writableEnded`

<!-- YAML
added: v12.9.0
-->

- {логический}

Является `true` после [`response.end()`](#responseenddata-encoding-callback) был вызван. Это свойство не указывает, были ли данные сброшены, для этого использования. [`response.writableFinished`](#responsewritablefinished) вместо.

### `response.writableFinished`

<!-- YAML
added: v12.7.0
-->

- {логический}

Является `true` если все данные были сброшены в базовую систему, непосредственно перед [`'finish'`](#event-finish) событие испускается.

### `response.write(chunk[, encoding][, callback])`

<!-- YAML
added: v0.1.29
-->

- `chunk` {строка | буфер}
- `encoding` {нить} **Дефолт:** `'utf8'`
- `callback` {Функция}
- Возвращает: {логическое}

Если этот метод вызван и [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) не был вызван, он переключится в режим неявного заголовка и сбрасывает неявные заголовки.

Это отправляет кусок тела ответа. Этот метод может вызываться несколько раз для получения последовательных частей тела.

в `http` модуль, тело ответа опускается, если запрос является запросом HEAD. Аналогичным образом `204` а также `304` ответы _не должен_ включить тело сообщения.

`chunk` может быть строкой или буфером. Если `chunk` является строкой, второй параметр указывает, как ее кодировать в поток байтов. `callback` будет вызываться, когда этот фрагмент данных будет сброшен.

Это необработанное тело HTTP и не имеет ничего общего с кодировками, состоящими из нескольких частей, которые могут быть использованы.

Первый раз [`response.write()`](#responsewritechunk-encoding-callback) вызывается, он отправит клиенту буферизованную информацию заголовка и первый фрагмент тела. Второй раз [`response.write()`](#responsewritechunk-encoding-callback) вызывается, Node.js предполагает, что данные будут передаваться в потоковом режиме, и отправляет новые данные отдельно. То есть ответ буферизируется до первого фрагмента тела.

Возврат `true` если все данные были успешно сброшены в буфер ядра. Возврат `false` если все или часть данных были помещены в очередь в пользовательской памяти. `'drain'` будет выдан, когда буфер снова освободится.

### `response.writeContinue()`

<!-- YAML
added: v0.3.0
-->

Отправляет клиенту сообщение HTTP / 1.1 100 Continue, указывающее, что тело запроса должно быть отправлено. Увидеть [`'checkContinue'`](#event-checkcontinue) событие на `Server`.

### `response.writeHead(statusCode[, statusMessage][, headers])`

<!-- YAML
added: v0.1.30
changes:
  - version: v14.14.0
    pr-url: https://github.com/nodejs/node/pull/35274
    description: Allow passing headers as an array.
  - version:
     - v11.10.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/25974
    description: Return `this` from `writeHead()` to allow chaining with
                 `end()`.
  - version:
    - v5.11.0
    - v4.4.5
    pr-url: https://github.com/nodejs/node/pull/6291
    description: A `RangeError` is thrown if `statusCode` is not a number in
                 the range `[100, 999]`.
-->

- `statusCode` {количество}
- `statusMessage` {нить}
- `headers` {Объект | Массив}
- Возвращает: {http.ServerResponse}

Отправляет заголовок ответа на запрос. Код состояния представляет собой трехзначный код состояния HTTP, например `404`. Последний аргумент, `headers`, являются заголовками ответа. При желании можно указать удобочитаемый `statusMessage` как второй аргумент.

`headers` может быть `Array` где ключи и значения находятся в одном списке. это _нет_ список кортежей. Таким образом, смещения с четными номерами являются ключевыми значениями, а смещения с нечетными номерами - соответствующими значениями. Массив имеет тот же формат, что и `request.rawHeaders`.

Возвращает ссылку на `ServerResponse`, так что вызовы можно связывать.

```js
const body = 'hello world';
response
  .writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/plain',
  })
  .end(body);
```

Этот метод должен вызываться только один раз в сообщении, и он должен быть вызван перед [`response.end()`](#responseenddata-encoding-callback) называется.

Если [`response.write()`](#responsewritechunk-encoding-callback) или [`response.end()`](#responseenddata-encoding-callback) вызываются перед вызовом этого, неявные / изменяемые заголовки будут вычислены и вызовут эту функцию.

Когда заголовки были установлены с [`response.setHeader()`](#responsesetheadername-value), они будут объединены с любыми заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers), с заголовками, переданными в [`response.writeHead()`](#responsewriteheadstatuscode-statusmessage-headers) учитывая приоритет.

Если этот метод вызван и [`response.setHeader()`](#responsesetheadername-value) не был вызван, он будет напрямую записывать предоставленные значения заголовка в сетевой канал без внутреннего кэширования, а [`response.getHeader()`](#responsegetheadername) в заголовке не даст ожидаемого результата. Если желательно прогрессивное заполнение заголовков с возможным извлечением и модификацией в будущем, используйте [`response.setHeader()`](#responsesetheadername-value) вместо.

```js
// Returns content-type = text/plain
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Foo', 'bar');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
});
```

`Content-Length` дается в байтах, а не в символах. Использовать [`Buffer.byteLength()`](buffer.md#static-method-bufferbytelengthstring-encoding) для определения длины тела в байтах. Node.js не проверяет, `Content-Length` и длина переданного тела равна или нет.

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

### `response.writeProcessing()`

<!-- YAML
added: v10.0.0
-->

Отправляет клиенту сообщение HTTP / 1.1 102 Processing, указывающее, что тело запроса должно быть отправлено.

## Класс: `http.IncomingMessage`

<!-- YAML
added: v0.1.17
changes:
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/33035
    description: The `destroyed` value returns `true` after the incoming data
                 is consumed.
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30135
    description: The `readableHighWaterMark` value mirrors that of the socket.
-->

- Расширяется: {stream.Readable}

An `IncomingMessage` объект создан [`http.Server`](#class-httpserver) или [`http.ClientRequest`](#class-httpclientrequest) и передается в качестве первого аргумента в [`'request'`](#event-request) а также [`'response'`](#event-response) событие соответственно. Его можно использовать для доступа к статусу ответа, заголовкам и данным.

В отличие от своего `socket` значение, которое является подклассом {stream.Duplex}, `IncomingMessage` сам расширяет {stream.Readable} и создается отдельно для синтаксического анализа и выдачи входящих HTTP-заголовков и полезной нагрузки, так как базовый сокет может быть повторно использован несколько раз в случае сохранения активности.

### Событие: `'aborted'`

<!-- YAML
added: v0.3.8
deprecated: REPLACEME
-->

> Стабильность: 0 - Не рекомендуется. Слушай `'close'` событие вместо этого.

Выдается, когда запрос был прерван.

### Событие: `'close'`

<!-- YAML
added: v0.4.2
-->

Указывает, что базовое соединение было закрыто.

### `message.aborted`

<!-- YAML
added: v10.1.0
deprecated: REPLACEME
-->

> Стабильность: 0 - Не рекомендуется. Проверять `message.destroyed` из {stream.Readable}.

- {логический}

В `message.aborted` собственность будет `true` если запрос был прерван.

### `message.complete`

<!-- YAML
added: v0.3.0
-->

- {логический}

В `message.complete` собственность будет `true` если было получено и успешно проанализировано полное сообщение HTTP.

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

### `message.connection`

<!-- YAML
added: v0.1.90
deprecated: v16.0.0
 -->

> Стабильность: 0 - Не рекомендуется. Использовать [`message.socket`](#messagesocket).

Псевдоним для [`message.socket`](#messagesocket).

### `message.destroy([error])`

<!-- YAML
added: v0.3.0
changes:
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/32789
    description: The function returns `this` for consistency with other Readable
                 streams.
-->

- `error` {Ошибка}
- Возвращает: {this}

Звонки `destroy()` на сокете, который получил `IncomingMessage`. Если `error` предоставляется, `'error'` событие испускается в сокете и `error` передается в качестве аргумента всем слушателям события.

### `message.headers`

<!-- YAML
added: v0.1.5
changes:
  - version: v15.1.0
    pr-url: https://github.com/nodejs/node/pull/35281
    description: >-
      `message.headers` is now lazily computed using an accessor property
      on the prototype.
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

Дубликаты в необработанных заголовках обрабатываются следующими способами, в зависимости от имени заголовка:

- Дубликаты `age`, `authorization`, `content-length`, `content-type`, `etag`, `expires`, `from`, `host`, `if-modified-since`, `if-unmodified-since`, `last-modified`, `location`, `max-forwards`, `proxy-authorization`, `referer`, `retry-after`, `server`, или `user-agent` отбрасываются.
- `set-cookie` всегда массив. В массив добавляются дубликаты.
- Для дубликата `cookie` заголовки, значения объединяются вместе с помощью '; '.
- Для всех остальных заголовков значения объединяются вместе с помощью ','.

### `message.httpVersion`

<!-- YAML
added: v0.1.1
-->

- {нить}

В случае запроса сервера - версия HTTP, отправленная клиентом. В случае ответа клиента - версия HTTP подключенного сервера. Наверное, либо `'1.1'` или `'1.0'`.

Также `message.httpVersionMajor` - первое целое число и `message.httpVersionMinor` это второй.

### `message.method`

<!-- YAML
added: v0.1.1
-->

- {нить}

**Действительно только для запроса, полученного от [`http.Server`](#class-httpserver).**

Метод запроса в виде строки. Только чтение. Примеры: `'GET'`, `'DELETE'`.

### `message.rawHeaders`

<!-- YAML
added: v0.11.6
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

### `message.rawTrailers`

<!-- YAML
added: v0.11.6
-->

- {нить\[]}

Необработанные ключи и значения трейлера запроса / ответа в том виде, в котором они были получены. Заселены только в `'end'` событие.

### `message.setTimeout(msecs[, callback])`

<!-- YAML
added: v0.5.9
-->

- `msecs` {количество}
- `callback` {Функция}
- Возвращает: {http.IncomingMessage}

Звонки `message.socket.setTimeout(msecs, callback)`.

### `message.socket`

<!-- YAML
added: v0.3.0
-->

- {stream.Duplex}

В [`net.Socket`](net.md#class-netsocket) объект, связанный с подключением.

С поддержкой HTTPS используйте [`request.socket.getPeerCertificate()`](tls.md#tlssocketgetpeercertificatedetailed) чтобы получить данные аутентификации клиента.

Это свойство гарантированно является экземпляром класса {net.Socket}, подкласса {stream.Duplex}, если только пользователь не указал тип сокета, отличный от {net.Socket}.

### `message.statusCode`

<!-- YAML
added: v0.1.1
-->

- {количество}

**Действительно только для ответа, полученного от [`http.ClientRequest`](#class-httpclientrequest).**

3-значный код состояния ответа HTTP. НАПРИМЕР. `404`.

### `message.statusMessage`

<!-- YAML
added: v0.11.10
-->

- {нить}

**Действительно только для ответа, полученного от [`http.ClientRequest`](#class-httpclientrequest).**

Сообщение о статусе ответа HTTP (фраза причины). НАПРИМЕР. `OK` или `Internal Server Error`.

### `message.trailers`

<!-- YAML
added: v0.3.0
-->

- {Объект}

Объект трейлеров запроса / ответа. Заселены только в `'end'` событие.

### `message.url`

<!-- YAML
added: v0.1.90
-->

- {нить}

**Действительно только для запроса, полученного от [`http.Server`](#class-httpserver).**

Строка URL-адреса запроса. Он содержит только URL-адрес, который присутствует в фактическом HTTP-запросе. Примите следующий запрос:

```http
GET /status?name=ryan HTTP/1.1
Accept: text/plain
```

Чтобы разобрать URL-адрес на части:

```js
new URL(request.url, `http://${request.headers.host}`);
```

Когда `request.url` является `'/status?name=ryan'` а также `request.headers.host` является `'localhost:3000'`:

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

## Класс: `http.OutgoingMessage`

<!-- YAML
added: v0.1.17
-->

- Расширяется: {Stream}

Этот класс служит родительским классом для [`http.ClientRequest`](#class-httpclientrequest) а также [`http.ServerResponse`](#class-httpserverresponse). Это абстракция исходящего сообщения с точки зрения участников HTTP-транзакции.

### Событие: `drain`

<!-- YAML
added: v0.3.6
-->

Выдается, когда буфер сообщения снова становится свободным.

### Событие: `finish`

<!-- YAML
added: v0.1.17
-->

Выдается после успешного завершения передачи.

### Событие: `prefinish`

<!-- YAML
added: v0.11.6
-->

Выдается, когда `outgoingMessage.end` назывался. Когда событие генерируется, все данные были обработаны, но не обязательно полностью сброшены.

### `outgoingMessage.addTrailers(headers)`

<!-- YAML
added: v0.3.0
-->

- `headers` {Объект}

Добавляет к сообщению трейлеры HTTP (заголовки, но в конце сообщения).

Прицепы **Только** будет отправлено, если сообщение закодировано по частям. В противном случае трейлер будет отброшен.

HTTP требует `Trailer` заголовок, который будет отправлен для отправки трейлеров, со списком полей заголовка в его значении, например

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

Попытка установить имя поля заголовка или значение, содержащее недопустимые символы, приведет к `TypeError` быть брошенным.

### `outgoingMessage.connection`

<!-- YAML
added: v0.3.0
deprecated:
  - v15.12.0
  - v14.17.1
-->

> Стабильность: 0 - Не рекомендуется: использовать [`outgoingMessage.socket`](#outgoingmessagesocket) вместо.

Псевдонимы `outgoingMessage.socket`

### `outgoingMessage.cork()`

<!-- YAML
added: v14.0.0
-->

Видеть [`writable.cork()`](stream.md#writablecork).

### `outgoingMessage.destroy([error])`

<!-- YAML
added: v0.3.0
-->

- `error` {Error} Необязательно, сообщение об ошибке `error` событие
- Возвращает: {this}

Уничтожает сообщение. Как только сокет связан с сообщением и подключен, этот сокет также будет уничтожен.

### `outgoingMessage.end(chunk[, encoding][, callback])`

<!-- YAML
added: v0.1.90
changes:
  - version: v0.11.6
    description: add `callback` argument.
-->

- `chunk` {строка | Buffer}
- `encoding` {string} Необязательно, **Дефолт**: `utf8`
- `callback` {Function} Необязательно
- Возвращает: {this}

Завершает исходящее сообщение. Если какие-либо части тела не отправлены, они будут сброшены в нижележащую систему. Если сообщение разбито на фрагменты, оно отправит завершающий фрагмент. `0\r\n\r\n`, и отправьте трейлер (если есть).

Если `chunk` указано, это эквивалентно вызову `outgoingMessage.write(chunk, encoding)`, с последующим `outgoingMessage.end(callback)`.

Если `callback` предоставлен, он будет вызываться по завершении сообщения. (эквивалент обратного вызова для события `finish`)

### `outgoingMessage.flushHeaders()`

<!-- YAML
added: v1.6.0
-->

Обязательно очищает заголовки сообщений

По соображениям эффективности Node.js обычно буферизует заголовки сообщений до тех пор, пока `outgoingMessage.end()` вызывается или записывается первый фрагмент данных сообщения. Затем он пытается упаковать заголовки и данные в один TCP-пакет.

Обычно это желательно (это экономит время приема-передачи TCP), но не тогда, когда первые данные не отправляются, возможно, гораздо позже. `outgoingMessage.flushHeaders()` обходит оптимизацию и запускает запрос.

### `outgoingMessage.getHeader(name)`

<!-- YAML
added: v0.4.0
-->

- `name` {строка} Название заголовка
- Возвращает {строку | неопределенный}

Получает значение заголовка HTTP с заданным именем. Если такого имени нет в сообщении, оно будет `undefined`.

### `outgoingMessage.getHeaderNames()`

<!-- YAML
added: v8.0.0
-->

- Возвращает {строку \[]}

Возвращает массив имен заголовков исходящего сообщения outgoingMessage. Все имена в нижнем регистре.

### `outgoingMessage.getHeaders()`

<!-- YAML
added:  v8.0.0
-->

- Возвращает: {Object}

Возвращает частичную копию текущих исходящих заголовков. Поскольку используется неглубокая копия, значения массива могут изменяться без дополнительных вызовов различных методов модуля HTTP, связанных с заголовками. Ключи возвращаемого объекта - это имена заголовков, а значения - соответствующие значения заголовков. Все имена заголовков в нижнем регистре.

Объект, возвращаемый `outgoingMessage.getHeaders()` не наследуется прототипом от объекта JavaScript. Это означает, что типичные методы объекта, такие как `obj.toString()`, `obj.hasOwnProperty()`, и другие не определены и работать не будут.

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

<!-- YAML
added:  v8.0.0
-->

- `name` {нить}
- Возвращает {логическое}

Возврат `true` если заголовок идентифицирован `name` в настоящее время устанавливается в исходящих заголовках. Имя заголовка не чувствительно к регистру.

```js
const hasContentType = outgoingMessage.hasHeader(
  'content-type'
);
```

### `outgoingMessage.headersSent`

<!-- YAML
added: v0.9.3
-->

- {логический}

Только для чтения. `true` если заголовки были отправлены, иначе `false`.

### `outgoingMessage.pipe()`

<!-- YAML
added: v9.0.0
-->

Переопределяет метод канала прежней версии `Stream` который является родительским классом `http.outgoingMessage`.

С `OutgoingMessage` должен быть потоком только для записи, вызов этой функции вызовет `Error`. Таким образом, он отключил метод канала, который он наследует от `Stream`.

Пользователь не должен вызывать эту функцию напрямую.

### `outgoingMessage.removeHeader()`

<!-- YAML
added:  v0.4.0
-->

Удаляет заголовок, поставленный в очередь для неявной отправки.

```js
outgoingMessage.removeHeader('Content-Encoding');
```

### `outgoingMessage.setHeader(name, value)`

<!-- YAML
added: v0.4.0
-->

- `name` {строка} Название заголовка
- `value` {строка} значение заголовка
- Возвращает: {this}

Устанавливает одно значение заголовка для объекта заголовка.

### `outgoingMessage.setTimeout(msesc[, callback])`

<!-- YAML
added: v0.9.12
-->

- `msesc` {количество}
- `callback` {Функция} Необязательная функция, вызываемая при истечении времени ожидания. То же, что и привязка к `timeout` событие.
- Возвращает: {this}

Как только сокет связан с сообщением и подключен, [`socket.setTimeout()`](net.md#socketsettimeouttimeout-callback) будет называться с `msecs` в качестве первого параметра.

### `outgoingMessage.socket`

<!-- YAML
added: v0.3.0
-->

- {stream.Duplex}

Ссылка на базовый сокет. Обычно пользователи не хотят получать доступ к этому свойству.

После звонка `outgoingMessage.end()`, это свойство будет обнулено.

### `outgoingMessage.uncork()`

<!-- YAML
added: v14.0.0
-->

Видеть [`writable.uncork()`](stream.md#writableuncork)

### `outgoingMessage.writableCorked`

<!-- YAML
added: v14.0.0
-->

- {количество}

Этот `outgoingMessage.writableCorked` вернет время сколько `outgoingMessage.cork()` были вызваны.

### `outgoingMessage.writableEnded`

<!-- YAML
added: v13.0.0
-->

- {логический}

Только чтение, `true` если `outgoingMessage.end()` был вызван. Отметил, что это свойство не отражает, были ли данные сброшены. Для этого используйте `message.writableFinished` вместо.

### `outgoingMessage.writableFinished`

<!-- YAML
added: v13.0.0
-->

- {логический}

Только для чтения. `true` если все данные были сброшены в базовую систему.

### `outgoingMessage.writableHighWaterMark`

<!-- YAML
added: v13.0.0
-->

- {количество}

Этот `outgoingMessage.writableHighWaterMark` будет `highWaterMark` базового сокета, если сокет существует. В противном случае это будет по умолчанию `highWaterMark`.

`highWaterMark` - это максимальный объем данных, который потенциально может буферизоваться сокетом.

### `outgoingMessage.writableLength`

<!-- YAML
added: v13.0.0
-->

- {количество}

Только для чтения, Это `outgoingMessage.writableLength` содержит количество байтов (или объектов) в буфере, готовых к отправке.

### `outgoingMessage.writableObjectMode`

<!-- YAML
added: v13.0.0
-->

- {логический}

Только чтение, всегда возвращается `false`.

### `outgoingMessage.write(chunk[, encoding][, callback])`

<!-- YAML
added: v0.1.29
changes:
  - version: v0.11.6
    description: add `callback` argument.
-->

- `chunk` {строка | Buffer}
- `encoding` {нить} **Дефолт**: `utf8`
- `callback` {Функция}
- Возвращает {логическое}

Если этот метод вызван, а заголовок не отправлен, он вызовет `this._implicitHeader` чтобы очистить неявный заголовок. Если у сообщения не должно быть тела (обозначено `this._hasBody`) вызов игнорируется и `chunk` не будут отправлены. Это может быть полезно при обработке конкретного сообщения, которое не должно включать тело. например ответ на `HEAD` запрос, `204` а также `304` отклик.

`chunk` может быть строкой или буфером. Когда `chunk` это строка, `encoding` параметр определяет, как кодировать `chunk` в поток байтов. `callback` будет вызван, когда `chunk` покраснел.

Если сообщение передается в кодировке chucked (обозначено `this.chunkedEncoding`), `chunk` будет сброшен как один фрагмент среди потока фрагментов. В противном случае он будет сброшен как тело сообщения.

Этот метод обрабатывает необработанное тело сообщения HTTP и не имеет ничего общего с кодировками, состоящими из нескольких частей, которые могут быть использованы.

Если это первый вызов этого метода сообщения, он сначала отправит буферизованный заголовок, а затем сбросит `chunk` как описано выше.

Второй и последующие вызовы этого метода предполагают, что данные будут переданы в потоковом режиме, и отправят новые данные отдельно. Это означает, что ответ буферизируется до первого фрагмента тела.

Возврат `true` если все данные были успешно сброшены в буфер ядра. Возврат `false` если все или часть данных были помещены в очередь в пользовательской памяти. Мероприятие `drain` будет выдан, когда буфер снова освободится.

## `http.METHODS`

<!-- YAML
added: v0.11.8
-->

- {нить\[]}

Список HTTP-методов, поддерживаемых парсером.

## `http.STATUS_CODES`

<!-- YAML
added: v0.1.22
-->

- {Объект}

Коллекция всех стандартных кодов состояния ответа HTTP и краткое описание каждого из них. Например, `http.STATUS_CODES[404] === 'Not Found'`.

## `http.createServer([options][, requestListener])`

<!-- YAML
added: v0.1.13
changes:
  - version:
     - v13.8.0
     - v12.15.0
     - v10.19.0
    pr-url: https://github.com/nodejs/node/pull/31448
    description: The `insecureHTTPParser` option is supported now.
  - version: v13.3.0
    pr-url: https://github.com/nodejs/node/pull/30570
    description: The `maxHeaderSize` option is supported now.
  - version:
    - v9.6.0
    - v8.12.0
    pr-url: https://github.com/nodejs/node/pull/15752
    description: The `options` argument is supported now.
-->

- `options` {Объект}

  - `IncomingMessage` {http.IncomingMessage} Определяет `IncomingMessage` класс, который будет использоваться. Полезно для расширения оригинала `IncomingMessage`. **Дефолт:** `IncomingMessage`.
  - `ServerResponse` {http.ServerResponse} Определяет `ServerResponse` класс, который будет использоваться. Полезно для расширения оригинала `ServerResponse`. **Дефолт:** `ServerResponse`.
  - `insecureHTTPParser` {boolean} Использовать небезопасный анализатор HTTP, который принимает недопустимые заголовки HTTP, когда `true`. Следует избегать использования небезопасного парсера. Видеть [`--insecure-http-parser`](cli.md#--insecure-http-parser) для дополнительной информации. **Дефолт:** `false`
  - `maxHeaderSize` {number} Необязательно переопределяет значение [`--max-http-header-size`](cli.md#--max-http-header-sizesize) для запросов, полученных этим сервером, т. е. максимальная длина заголовков запроса в байтах. **Дефолт:** 16384 (16 КБ).

- `requestListener` {Функция}

- Возвращает: {http.Server}

Возвращает новый экземпляр [`http.Server`](#class-httpserver).

В `requestListener` это функция, которая автоматически добавляется к [`'request'`](#event-request) событие.

```cjs
const http = require('http');

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

```cjs
const http = require('http');

// Create a local server to receive data from
const server = http.createServer();

// Listen to the request event
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

## `http.get(options[, callback])`

## `http.get(url[, options][, callback])`

<!-- YAML
added: v0.3.6
changes:
  - version: v10.9.0
    pr-url: https://github.com/nodejs/node/pull/21616
    description: The `url` parameter can now be passed along with a separate
                 `options` object.
  - version: v7.5.0
    pr-url: https://github.com/nodejs/node/pull/10638
    description: The `options` parameter can be a WHATWG `URL` object.
-->

- `url` {строка | URL}
- `options` {Object} принимает то же самое `options` в качестве [`http.request()`](#httprequestoptions-callback), с `method` всегда установлен на `GET`. Свойства, унаследованные от прототипа, игнорируются.
- `callback` {Функция}
- Возвращает: {http.ClientRequest}

Поскольку большинство запросов представляют собой GET-запросы без тел, Node.js предоставляет этот удобный метод. Единственная разница между этим методом и [`http.request()`](#httprequestoptions-callback) в том, что он устанавливает метод в GET и вызывает `req.end()` автоматически. Обратный вызов должен позаботиться о потреблении данных ответа по причинам, указанным в [`http.ClientRequest`](#class-httpclientrequest) раздел.

В `callback` вызывается с одним аргументом, который является экземпляром [`http.IncomingMessage`](#class-httpincomingmessage).

Пример получения JSON:

```js
http
  .get('http://localhost:8000/', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    // Any 2xx status code signals a successful response but
    // here we're only checking for 200.
    if (statusCode !== 200) {
      error = new Error(
        'Request Failed.\n' + `Status Code: ${statusCode}`
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
  })
  .on('error', (e) => {
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

<!-- YAML
added: v0.5.9
-->

- {http.Agent}

Глобальный экземпляр `Agent` который используется по умолчанию для всех клиентских HTTP-запросов.

## `http.maxHeaderSize`

<!-- YAML
added:
 - v11.6.0
 - v10.15.0
-->

- {количество}

Свойство только для чтения, указывающее максимально допустимый размер заголовков HTTP в байтах. По умолчанию 8 КБ. Настраивается с помощью [`--max-http-header-size`](cli.md#--max-http-header-sizesize) Вариант CLI.

Это можно изменить для запросов серверов и клиентов, передав `maxHeaderSize` вариант.

## `http.request(options[, callback])`

## `http.request(url[, options][, callback])`

<!-- YAML
added: v0.3.6
changes:
  - version:
      - v16.7.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39310
    description: When using a `URL` object parsed username and
                 password will now be properly URI decoded.
  - version:
      - v15.3.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/36048
    description: It is possible to abort a request with an AbortSignal.
  - version:
     - v13.8.0
     - v12.15.0
     - v10.19.0
    pr-url: https://github.com/nodejs/node/pull/31448
    description: The `insecureHTTPParser` option is supported now.
  - version: v13.3.0
    pr-url: https://github.com/nodejs/node/pull/30570
    description: The `maxHeaderSize` option is supported now.
  - version: v10.9.0
    pr-url: https://github.com/nodejs/node/pull/21616
    description: The `url` parameter can now be passed along with a separate
                 `options` object.
  - version: v7.5.0
    pr-url: https://github.com/nodejs/node/pull/10638
    description: The `options` parameter can be a WHATWG `URL` object.
-->

- `url` {строка | URL}
- `options` {Объект}
  - `agent` {http.Agent | boolean} Элементы управления [`Agent`](#class-httpagent) поведение. Возможные значения:
    - `undefined` (по умолчанию): использовать [`http.globalAgent`](#httpglobalagent) для этого хоста и порта.
    - `Agent` объект: явно использовать переданный `Agent`.
    - `false`: вызывает новый `Agent` со значениями по умолчанию, которые будут использоваться.
  - `auth` {строка} Базовая аутентификация, т.е. `'user:password'` для вычисления заголовка авторизации.
  - `createConnection` {Функция} Функция, которая создает сокет / поток для использования в запросе, когда `agent` опция не используется. Это можно использовать, чтобы избежать создания настраиваемого `Agent` класс, чтобы переопределить значение по умолчанию `createConnection` функция. Видеть [`agent.createConnection()`](#agentcreateconnectionoptions-callback) Больше подробностей. Любой [`Duplex`](stream.md#class-streamduplex) stream - допустимое возвращаемое значение.
  - `defaultPort` {number} Порт по умолчанию для протокола. **Дефолт:** `agent.defaultPort` если `Agent` используется, иначе `undefined`.
  - `family` {number} семейство IP-адресов для использования при разрешении `host` или `hostname`. Допустимые значения: `4` или `6`. Если не указано иное, будут использоваться IP v4 и v6.
  - `headers` {Object} Объект, содержащий заголовки запроса.
  - `hints` {number} Необязательно [`dns.lookup()` подсказки](dns.md#supported-getaddrinfo-flags).
  - `host` {строка} Доменное имя или IP-адрес сервера, на который будет отправлен запрос. **Дефолт:** `'localhost'`.
  - `hostname` {string} Псевдоним для `host`. Поддерживать [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost), `hostname` будет использоваться, если оба `host` а также `hostname` указаны.
  - `insecureHTTPParser` {boolean} Использовать небезопасный анализатор HTTP, который принимает недопустимые заголовки HTTP, когда `true`. Следует избегать использования небезопасного парсера. Видеть [`--insecure-http-parser`](cli.md#--insecure-http-parser) для дополнительной информации. **Дефолт:** `false`
  - `localAddress` {строка} Локальный интерфейс для привязки сетевых подключений.
  - `localPort` {number} Локальный порт для подключения.
  - `lookup` {Функция} Пользовательская функция поиска. **Дефолт:** [`dns.lookup()`](dns.md#dnslookuphostname-options-callback).
  - `maxHeaderSize` {number} Необязательно переопределяет значение [`--max-http-header-size`](cli.md#--max-http-header-sizesize) для ответов, полученных от сервера, т. е. максимальная длина заголовков ответов в байтах. **Дефолт:** 16384 (16 КБ).
  - `method` {строка} Строка, определяющая метод HTTP-запроса. **Дефолт:** `'GET'`.
  - `path` {строка} Путь запроса. Должен включать строку запроса, если таковая имеется. НАПРИМЕР. `'/index.html?page=12'`. Исключение возникает, когда путь запроса содержит недопустимые символы. В настоящее время отклоняются только пробелы, но это может измениться в будущем. **Дефолт:** `'/'`.
  - `port` {номер} Порт удаленного сервера. **Дефолт:** `defaultPort` если установлено, иначе `80`.
  - `protocol` {строка} Используемый протокол. **Дефолт:** `'http:'`.
  - `setHost` {boolean}: указывает, следует ли автоматически добавлять `Host` заголовок. По умолчанию `true`.
  - `socketPath` {string} Сокет домена Unix (не может использоваться, если один из `host` или `port` указано, это указывает сокет TCP).
  - `timeout` {число}: число, указывающее время ожидания сокета в миллисекундах. Это установит тайм-аут до подключения сокета.
  - `signal` {AbortSignal}: AbortSignal, который может использоваться для прерывания текущего запроса.
- `callback` {Функция}
- Возвращает: {http.ClientRequest}

Node.js поддерживает несколько подключений к серверу для выполнения HTTP-запросов. Эта функция позволяет прозрачно отправлять запросы.

`url` может быть строкой или [`URL`](url.md#the-whatwg-url-api) объект. Если `url` является строкой, она автоматически анализируется с помощью [`new URL()`](url.md#new-urlinput-base). Если это [`URL`](url.md#the-whatwg-url-api) объект, он будет автоматически преобразован в обычный `options` объект.

Если оба `url` а также `options` указаны, объекты объединяются, при этом `options` свойства имеют приоритет.

Необязательный `callback` будет добавлен как одноразовый слушатель для [`'response'`](#event-response) событие.

`http.request()` возвращает экземпляр [`http.ClientRequest`](#class-httpclientrequest) класс. В `ClientRequest` instance - это поток с возможностью записи. Если нужно загрузить файл с помощью POST-запроса, напишите в `ClientRequest` объект.

```js
const http = require('http');

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

В примере `req.end()` назывался. С участием `http.request()` нужно всегда звонить `req.end()` чтобы обозначить конец запроса - даже если в тело запроса не записываются никакие данные.

Если во время запроса обнаружена какая-либо ошибка (будь то разрешение DNS, ошибки уровня TCP или фактические ошибки синтаксического анализа HTTP), `'error'` Событие генерируется для возвращенного объекта запроса. Как и все `'error'` события, если слушатели не зарегистрированы, будет выдана ошибка.

Следует отметить несколько специальных заголовков.

- Отправка «Connection: keep-alive» уведомит Node.js о том, что соединение с сервером должно быть сохранено до следующего запроса.

- Отправка заголовка Content-Length отключит кодировку фрагментов по умолчанию.

- Отправка заголовка Expect немедленно отправит заголовки запроса. Обычно при отправке «Expect: 100-continue» и тайм-аут, и прослушиватель для `'continue'` событие должно быть установлено. Для получения дополнительной информации см. RFC 2616, раздел 8.2.3.

- Отправка заголовка авторизации переопределит использование `auth` возможность вычисления базовой аутентификации.

Пример использования [`URL`](url.md#the-whatwg-url-api) в качестве `options`:

```js
const options = new URL('http://abc:xyz@example.com');

const req = http.request(options, (res) => {
  // ...
});
```

При успешном запросе будут сгенерированы следующие события в следующем порядке:

- `'socket'`
- `'response'`
  - `'data'` любое количество раз на `res` объект (`'data'` не будет генерироваться вообще, если тело ответа пусто, например, в большинстве редиректов)
  - `'end'` на `res` объект
- `'close'`

В случае ошибки подключения будут выданы следующие события:

- `'socket'`
- `'error'`
- `'close'`

В случае преждевременного закрытия соединения до получения ответа будут отправлены следующие события в следующем порядке:

- `'socket'`
- `'error'` с ошибкой с сообщением `'Error: socket hang up'` и код `'ECONNRESET'`
- `'close'`

В случае преждевременного закрытия соединения после получения ответа будут сгенерированы следующие события в следующем порядке:

- `'socket'`
- `'response'`
  - `'data'` любое количество раз на `res` объект
- (соединение здесь закрыто)
- `'aborted'` на `res` объект
- `'error'` на `res` объект с ошибкой с сообщением `'Error: aborted'` и код `'ECONNRESET'`.
- `'close'`
- `'close'` на `res` объект

Если `req.destroy()` вызывается перед назначением сокета, следующие события будут генерироваться в следующем порядке:

- (`req.destroy()` звонил сюда)
- `'error'` с ошибкой с сообщением `'Error: socket hang up'` и код `'ECONNRESET'`
- `'close'`

Если `req.destroy()` вызывается до того, как соединение будет установлено, следующие события будут генерироваться в следующем порядке:

- `'socket'`
- (`req.destroy()` звонил сюда)
- `'error'` с ошибкой с сообщением `'Error: socket hang up'` и код `'ECONNRESET'`
- `'close'`

Если `req.destroy()` вызывается после получения ответа, следующие события будут сгенерированы в следующем порядке:

- `'socket'`
- `'response'`
  - `'data'` любое количество раз на `res` объект
- (`req.destroy()` звонил сюда)
- `'aborted'` на `res` объект
- `'error'` на `res` объект с ошибкой с сообщением `'Error: aborted'` и код `'ECONNRESET'`.
- `'close'`
- `'close'` на `res` объект

Если `req.abort()` вызывается перед назначением сокета, следующие события будут генерироваться в следующем порядке:

- (`req.abort()` звонил сюда)
- `'abort'`
- `'close'`

Если `req.abort()` вызывается до того, как соединение будет установлено, следующие события будут генерироваться в следующем порядке:

- `'socket'`
- (`req.abort()` звонил сюда)
- `'abort'`
- `'error'` с ошибкой с сообщением `'Error: socket hang up'` и код `'ECONNRESET'`
- `'close'`

Если `req.abort()` вызывается после получения ответа, следующие события будут сгенерированы в следующем порядке:

- `'socket'`
- `'response'`
  - `'data'` любое количество раз на `res` объект
- (`req.abort()` звонил сюда)
- `'abort'`
- `'aborted'` на `res` объект
- `'error'` на `res` объект с ошибкой с сообщением `'Error: aborted'` и код `'ECONNRESET'`.
- `'close'`
- `'close'` на `res` объект

Установка `timeout` вариант или используя `setTimeout()` функция не прервет запрос и не сделает ничего, кроме добавления `'timeout'` событие.

Прохождение `AbortSignal` а затем позвонив `abort` на соответствующем `AbortController` будет вести себя так же, как вызов `.destroy()` по самому запросу.

## `http.validateHeaderName(name)`

<!-- YAML
added: v14.3.0
-->

- `name` {нить}

Выполняет низкоуровневые проверки предоставленных `name` это делается, когда `res.setHeader(name, value)` называется.

Передача недопустимого значения как `name` приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным, идентифицированным `code: 'ERR_INVALID_HTTP_TOKEN'`.

Нет необходимости использовать этот метод перед передачей заголовков в HTTP-запрос или ответ. Модуль HTTP автоматически проверяет такие заголовки. Примеры:

Пример:

```js
const { validateHeaderName } = require('http');

try {
  validateHeaderName('');
} catch (err) {
  err instanceof TypeError; // --> true
  err.code; // --> 'ERR_INVALID_HTTP_TOKEN'
  err.message; // --> 'Header name must be a valid HTTP token [""]'
}
```

## `http.validateHeaderValue(name, value)`

<!-- YAML
added: v14.3.0
-->

- `name` {нить}
- `value` {любой}

Выполняет низкоуровневые проверки предоставленных `value` это делается, когда `res.setHeader(name, value)` называется.

Передача недопустимого значения как `value` приведет к [`TypeError`](errors.md#class-typeerror) быть брошенным.

- Ошибка неопределенного значения обозначается `code: 'ERR_HTTP_INVALID_HEADER_VALUE'`.
- Ошибка символа недопустимого значения обозначается `code: 'ERR_INVALID_CHAR'`.

Нет необходимости использовать этот метод перед передачей заголовков в HTTP-запрос или ответ. Модуль HTTP автоматически проверяет такие заголовки.

Примеры:

```js
const { validateHeaderValue } = require('http');

try {
  validateHeaderValue('x-my-header', undefined);
} catch (err) {
  err instanceof TypeError; // --> true
  err.code === 'ERR_HTTP_INVALID_HEADER_VALUE'; // --> true
  err.message; // --> 'Invalid value "undefined" for header "x-my-header"'
}

try {
  validateHeaderValue('x-my-header', 'oʊmɪɡə');
} catch (err) {
  err instanceof TypeError; // --> true
  err.code === 'ERR_INVALID_CHAR'; // --> true
  err.message; // --> 'Invalid character in header content ["x-my-header"]'
}
```
