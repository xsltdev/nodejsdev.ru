# Модуль https

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

**HTTPS** это протокол [HTTP](http.md) через TLS / SSL. В Node.js это реализовано как отдельный модуль.

## Класс https.Agent

Объект `Agent` для HTTPS подобен [`http.Agent`](http.md#httpagent).

Смотрите [`https.request()`](http.md#httprequest) для получения детальной информации.

## Класс https.Server

Этот класс является подклассом `tls.Server` и генерирует события так же как и `http.Server`.

Смотрите [`http.Server`](http.md#httpserver) для получения детальной информации.

### server.setTimeout()

```
server.setTimeout(msecs, callback)
```

Смотрите [`server.setTimeout()`](http.md#serversettimeout).

### server.timeout

Смотрите [`server.timeout`](http.md#servertimeout).

## https.createServer()

```
https.createServer(options[, requestListener])
```

Возвращает новый объект HTTPS веб-сервера. `options` похож на `tls.createServer()`. `RequestListener` это функция, которая автоматически добавляется к событию `request`.

Пример:

```js
// curl -k https://localhost:8000/
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync(
    'test/fixtures/keys/agent2-cert.pem'
  ),
};

https
  .createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  })
  .listen(8000);
```

Или

```js
const https = require('https');
const fs = require('fs');

const options = {
  pfx: fs.readFileSync('server.pfx'),
};

https
  .createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  })
  .listen(8000);
```

### server.close()

```
server.close([callback])
```

Смотрите HTTP [`server.close()`](http.md#serverclose) для получения детальной информации.

### server.listen()

```
server.listen(handle[, callback])
server.listen(path[, callback])
server.listen(port[, host][, backlog][, callback])
```

Смотрите HTTP [`server.listen()`](http.md#serverlisten) для получения детальной информации.

## https.get()

```
https.get(options, callback)
```

Как [`http.get()`](http.md#httpget), но для HTTPS.

`options` могут быть объектом или строкой. Если `options` является строкой, то она автоматически анализируется с помощью с `url.parse()`.

Пример:

```js
const https = require('https');

https
  .get('https://encrypted.google.com/', (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
      process.stdout.write(d);
    });
  })
  .on('error', (e) => {
    console.error(e);
  });
```

## https.globalAgent

Глобальный экземпляр `https.Agent` для всех клиентских запросов HTTPS.

## https.request()

```
https.request(options, callback)
```

Делает запрос на защищенный веб-сервер. `options` могут быть объектом или строкой. Если `options` является строкой, то она автоматически анализируется с помощью `url.parse()`.

Все опции от [`http.request()`](http.md#httprequest) являются действительными.

Пример:

```js
const https = require('https');

var options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
};

var req = https.request(options, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});
req.end();

req.on('error', (e) => {
  console.error(e);
});
```

Аргумент опций имеет следующие параметры:

`host`
: доменное имя или IP-адрес сервера, чтобы выдать запрос. По умолчанию `localhost`.

`hostname`
: альтернативное дополнительное имя для `host`. Для поддержки `url.parse()` `hostname` предпочтительнее `host`.

`family`
: IP-адрес, который `family` использует при обработке `host` и `hostname`. Допустимые значения 4 или 6. Если параметр не указан, будет использоваться как IP v4, так и v6.

`port`
: Порт удаленного сервера. По умолчанию `443`.

`localAddress`
: Локальный интерфейс для привязки сетевых соединений.

`socketPath`
: доменный сокет Unix (используйте один из хостов: `port` или `socketPath` ).

`method`
: Строка, определяющая метод запроса HTTP. По умолчанию `GET`.

`path`
: Путь запроса. По умолчанию `/`. Должен включать в себя строку запроса, если таковые имеются, например `/index.html?page=12`. Срабатывает исключение, когда путь запроса содержит недопустимые символы. В настоящее время недопустимы только пробелы, но это может измениться в будущем

`headers`
: Объект, содержащий заголовки запроса.

`auth`
: Базовая аутентификация, т. е. используется `user:password`, чтобы вычислить заголовок авторизации.

`agent`
: Управляет поведением `Agent`. Когда агент используется `Agent` запрос будет изменен по умолчанию на `Connection: Keep-Alive`. Возможные значения:
: - `undefined` (по умолчанию): использовать `globalAgent` для этого хоста и порта.
: - Объект `Agent`: напрямую использует переданное в `Agent`.
: - `false`: перестает соединяться с `Agent` посредством пулов соединений, по умолчанию меняет запрос на `Connection: close`.
: Могут быть указаны также следующие варианты от `tls.connect()`. Тем не менее, `globalAgent` игнорирует следующее без уведомлений.

`pfx`
: Сертификат, секретный ключ и сертификаты CA для использования SSL. По умолчанию `null`.

`key`
: Секретный ключ для использования SSL. По умолчанию `null`.

`passphrase`
: Строка многословный пароля для секретного ключа или PFX. По умолчанию `null`.

`cert`
: Открытый сертификат x509. По умолчанию `null`.

`ca`
: Строка, буфер или массив строк или буферов доверенных сертификатов в формате PEM. Если это не принимается во внимание, то будет использоваться хорошо известный "корень" CA, как VeriSign. Они используются для авторизации соединения.

`ciphers`
: Строка, описывающая шифры для использования или исключения.

`rejectUnauthorized`
: Если значение `true`, то сертификат сервера проверяется на соответствие списку поставляемых CA. Генерируется событие `error`, если проверка неудачна. Проверка происходит на уровне подключения, перед тем запрос HTTP посылается. По умолчанию `true`.

`secureProtocol`
: Метод SSL, например, SSLv3_method чтобы запустить SSL version 3. Возможные значения зависят от установки OpenSSL и определены в постоянных методах SSL.

`servername`
: Имя сервера для SNI (Индикация Имени Сервера) расширение TLS.

Для того, чтобы задать эти параметры, используйте пользовательский `Agent`.

Пример:

```js
var options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync(
    'test/fixtures/keys/agent2-cert.pem'
  ),
};
options.agent = new https.Agent(options);

var req = https.request(options, (res) => {
  // ...
});
```

В качестве альтернативы, откажитесь от организации связного пула путем не использования `Agent`.

Пример:

```js
var options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync(
    'test/fixtures/keys/agent2-cert.pem'
  ),
  agent: false,
};

var req = https.request(options, (res) => {
  // ...
});
```
