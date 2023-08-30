---
description: HTTPS - это протокол HTTP через TLS/SSL
---

# HTTPS

[:octicons-tag-24: v18.x.x](https://nodejs.org/dist/latest-v18.x/docs/api/https.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

**HTTPS** - это протокол HTTP через TLS/SSL. В Node.js он реализован в виде отдельного модуля.

<!-- 0000.part.md -->

## Определение отсутствия поддержки криптографии

Возможно, что Node.js собран без поддержки модуля `node:crypto`. В таких случаях попытка `импорта` из `https` или вызов `require('node:https')` приведет к ошибке.

При использовании CommonJS возникшую ошибку можно перехватить с помощью `try/catch`:

```cjs
let https;
try {
    https = require('node:https');
} catch (err) {
    console.error('Поддержка https отключена!');
}
```

При использовании лексического ключевого слова ESM `import` ошибка может быть поймана только в том случае, если обработчик `process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль (например, с помощью модуля предварительной загрузки).

При использовании ESM, если есть вероятность, что код может быть запущен на сборке Node.js, в которой не включена поддержка криптографии, используйте функцию [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) вместо лексического ключевого слова `import`:

```mjs
let https;
try {
    https = await import('node:https');
} catch (err) {
    console.error('Поддержка https отключена!');
}
```

<!-- 0001.part.md -->

## Класс: `https.Agent`

Объект [`Agent`](#class-httpsagent) для HTTPS, аналогичный [`http.Agent`](http.md#class-httpagent). Дополнительную информацию смотрите в [`https.request()`](#httpsrequestoptions-callback).

<!-- 0002.part.md -->

### `new Agent([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Набор конфигурируемых опций для установки на агента. Может иметь те же поля, что и для [`http.Agent(options)`](http.md#new-agentoptions), и

    -   `maxCachedSessions` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное количество TLS кэшированных сессий. Используйте `0`, чтобы отключить кэширование сессий TLS. **По умолчанию:** `100`.

    -   `servername` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) значение расширения [Server Name Indication extension](https://en.wikipedia.org/wiki/Server_Name_Indication) для отправки на сервер. Используйте пустую строку `''`, чтобы отключить отправку расширения. **По умолчанию:** имя хоста целевого сервера, если только целевой сервер не указан с помощью IP-адреса, в этом случае по умолчанию используется `''` (без расширения).

        Информацию о повторном использовании сеанса TLS см. в [`Session Resumption`](tls.md#session-resumption).

<!-- 0003.part.md -->

#### Событие: `keylog`

-   `line` [`<Buffer>`](buffer.md#buffer) Строка текста ASCII, в формате NSS `SSLKEYLOGFILE`.
-   `tlsSocket` {tls.TLSSocket} Экземпляр `tls.TLSSocket`, на котором оно было сгенерировано.

Событие `keylog` испускается, когда ключевой материал генерируется или принимается соединением, управляемым этим агентом (обычно до завершения рукопожатия, но не обязательно). Этот ключевой материал может быть сохранен для отладки, поскольку он позволяет расшифровать захваченный трафик TLS. Он может выдаваться несколько раз для каждого сокета.

Типичный случай использования - добавление полученных строк в общий текстовый файл, который впоследствии используется программами (например, Wireshark) для расшифровки трафика:

```js
// ...
https.globalAgent.on('keylog', (line, tlsSocket) => {
    fs.appendFileSync('/tmp/ssl-keys.log', line, {
        mode: 0o600,
    });
});
```

<!-- 0004.part.md -->

## Класс: `https.Server`

-   Расширяет: {tls.Server}

Дополнительную информацию смотрите в [`http.Server`](http.md#class-httpserver).

<!-- 0005.part.md -->

### `server.close([callback])`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {https.Server}

См. [`server.close()`](http.md#serverclosecallback) в модуле `node:http`.

<!-- 0006.part.md -->

### `server.closeAllConnections()`

Смотрите [`server.closeAllConnections()`](http.md#servercloseallconnections) в модуле `node:http`.

<!-- 0007.part.md -->

### `server.closeIdleConnections()`

Смотрите [`server.closeIdleConnections()`](http.md#servercloseidleconnections) в модуле `node:http`.

<!-- 0008.part.md -->

### `server.headersTimeout`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `60000`.

Смотрите [`server.headersTimeout`](http.md#serverheaderstimeout) в модуле `node:http`.

<!-- 0009.part.md -->

### `server.listen()`

Запускает HTTPS-сервер, прослушивающий зашифрованные соединения. Этот метод идентичен [`server.listen()`](net.md#serverlisten) из [`net.Server`](net.md#class-netserver).

<!-- 0010.part.md -->

### `server.maxHeadersCount`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2000`.

Смотрите [`server.maxHeadersCount`](http.md#servermaxheaderscount) в модуле `node:http`.

<!-- 0011.part.md -->

### `server.requestTimeout`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `300000`.

Смотрите [`server.requestTimeout`](http.md#serverrequesttimeout) в модуле `node:http`.

<!-- 0012.part.md -->

### `server.setTimeout([msecs][, callback])`

-   `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `120000` (2 минуты)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {https.Server}

См. [`server.setTimeout()`](http.md#serversettimeoutmsecs-callback) в модуле `node:http`.

<!-- 0013.part.md -->

### `server.timeout`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** 0 (без таймаута).

Смотрите [`server.timeout`](http.md#servertimeout) в модуле `node:http`.

<!-- 0014.part.md -->

### `server.keepAliveTimeout`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `5000` (5 секунд)

Смотрите [`server.keepAliveTimeout`](http.md#serverkeepalivetimeout) в модуле `node:http`.

<!-- 0015.part.md -->

## `https.createServer([options][, requestListener])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Принимает `опции` из [`tls.createServer()`](tls.md#tlsscreateserveroptions-secureconnectionlistener), [`tls.createSecureContext()`](tls.md#tlsscreatesecurecontextoptions) и [`http.createServer()`](http.md#httpcreateserveroptions-requestlistener).
-   `requestListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Слушатель, который будет добавлен к событию `'request'`.
-   Возвращает: {https.Server}

<!-- конец списка -->

```js
// curl -k https://localhost:8000/
const https = require('node:https');
const fs = require('node:fs');

const options = {
    key: fs.readFileSync(
        'test/fixtures/keys/agent2-key.pem'
    ),
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
const https = require('node:https');
const fs = require('node:fs');


const options = {
  pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
  парольная фраза: 'sample',
};


https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('hello world\n');
}).listen(8000);
```

<!-- 0016.part.md -->

## `https.get(options[, callback])`

<!-- 0017.part.md -->

## `https.get(url[, options][, callback])`

-   `url` {строка | URL}
-   `options` {Object | string | URL} Принимает те же `опции`, что и [`https.request()`](#httpsrequestoptions-callback), с `методом`, всегда установленным на `GET`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Подобно [`http.get()`](http.md#httpgetoptions-callback), но для HTTPS.

`options` может быть объектом, строкой или объектом [`URL`](url.md#the-whatwg-url-api). Если `options` является строкой, она автоматически разбирается с помощью [`new URL()`](url.md#new-urlinput-base). Если это объект [`URL`](url.md#the-whatwg-url-api), он будет автоматически преобразован в обычный объект `options`.

```js
const https = require('node:https');

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

<!-- 0018.part.md -->

## `https.globalAgent`

Глобальный экземпляр [`https.Agent`](#class-httpsagent) для всех запросов HTTPS клиентов.

<!-- 0019.part.md -->

## `https.request(options[, callback])`

<!-- 0020.part.md -->

-   `url` {строка | URL}
-   `options` {Object | string | URL} Принимает все `опции` из [`http.request()`](http.md#httprequestoptions-callback), с некоторыми различиями в значениях по умолчанию:
    -   `protocol` **Default:** `'https:'`.
    -   `port` **По умолчанию:** `443`
    -   `agent` **По умолчанию:** `https.globalAgent`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: {http.ClientRequest}

Делает запрос на защищенный веб-сервер.

Также принимаются следующие дополнительные `опции` из [`tls.connect()`](tls.md#tlsconnectoptions-callback): `ca`, `cert`, `ciphers`, `clientCertEngine`, `crl`, `dhparam`, `ecdhCurve`, `honorCipherOrder`, `key`, `passphrase`, `pfx`, `rejectUnauthorized`, `ecureOptions`, `ecureProtocol`, `servername`, `essionIdContext`, `highWaterMark`.

`options` может быть объектом, строкой или объектом [`URL`](url.md#the-whatwg-url-api). Если `options` - строка, она автоматически разбирается с помощью [`new URL()`](url.md#new-urlinput-base). Если это объект [`URL`](url.md#the-whatwg-url-api), то он будет автоматически преобразован в обычный объект `options`.

`https.request()` возвращает экземпляр класса [`http.ClientRequest`](http.md#class-httpclientrequest). Экземпляр `ClientRequest` представляет собой поток, доступный для записи. Если нужно загрузить файл с помощью POST-запроса, то пишите в объект `ClientRequest`.

```js
const https = require('node:https');

const options = {
    hostname: 'encrypted.google.com',
    port: 443,
    path: '/',
    method: 'GET',
};

const req = https.request(options, (res) => {
    console.log('statusCode:', res.statusCode);
    console.log('headers:', res.headers);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (e) => {
    console.error(e);
});
req.end();
```

Пример использования опций из [`tls.connect()`](tls.md#tlsconnectoptions-callback):

```js
const options = {
    hostname: 'encrypted.google.com',
    port: 443,
    path: '/',
    method: 'GET',
    key: fs.readFileSync(
        'test/fixtures/keys/agent2-key.pem'
    ),
    cert: fs.readFileSync(
        'test/fixtures/keys/agent2-cert.pem'
    ),
};
options.agent = new https.Agent(options);

const req = https.request(options, (res) => {
    // ...
});
```

В качестве альтернативы откажитесь от пула соединений, не используя [`Agent`](#class-httpsagent).

```js
const options = {
    hostname: 'encrypted.google.com',
    port: 443,
    path: '/',
    method: 'GET',
    key: fs.readFileSync(
        'test/fixtures/keys/agent2-key.pem'
    ),
    cert: fs.readFileSync(
        'test/fixtures/keys/agent2-cert.pem'
    ),
    agent: false,
};

const req = https.request(options, (res) => {
    // ...
});
```

Пример с использованием [`URL`](url.md#the-whatwg-url-api) в качестве `options`:

```js
const options = new URL('https://abc:xyz@example.com');

const req = https.request(options, (res) => {
    // ...
});
```

Пример привязки к отпечатку пальца сертификата или открытому ключу (аналогично `pin-sha256`):

```js
const tls = require('node:tls');
const https = require('node:https');
const crypto = require('node:crypto');

function sha256(s) {
    return crypto
        .createHash('sha256')
        .update(s)
        .digest('base64');
}
const options = {
    hostname: 'github.com',
    port: 443,
    path: '/',
    method: 'GET',
    checkServerIdentity: function (host, cert) {
        // Make sure the certificate is issued to the host we are connected to
        const err = tls.checkServerIdentity(host, cert);
        if (err) {
            return err;
        }

        // Pin the public key, similar to HPKP pin-sha256 pinning
        const pubkey256 =
            'pL1+qb9HTMRZJmuC/bB/ZI9d302BYrrqiVuRyW+DGrU=';
        if (sha256(cert.pubkey) !== pubkey256) {
            const msg =
                'Certificate verification error: ' +
                `The public key of '${cert.subject.CN}' ` +
                'does not match our pinned fingerprint';
            return new Error(msg);
        }

        // Pin the exact certificate, rather than the pub key
        const cert256 =
            '25:FE:39:32:D9:63:8C:8A:FC:A1:9A:29:87:' +
            'D8:3E:4C:1D:98:DB:71:E4:1A:48:03:98:EA:22:6A:BD:8B:93:16';
        if (cert.fingerprint256 !== cert256) {
            const msg =
                'Certificate verification error: ' +
                `The certificate of '${cert.subject.CN}' ` +
                'does not match our pinned fingerprint';
            return new Error(msg);
        }

        // This loop is informational only.
        // Print the certificate and public key fingerprints of all certs in the
        // chain. Its common to pin the public key of the issuer on the public
        // internet, while pinning the public key of the service in sensitive
        // environments.
        do {
            console.log(
                'Subject Common Name:',
                cert.subject.CN
            );
            console.log(
                '  Certificate SHA256 fingerprint:',
                cert.fingerprint256
            );

            hash = crypto.createHash('sha256');
            console.log(
                '  Public key ping-sha256:',
                sha256(cert.pubkey)
            );

            lastprint256 = cert.fingerprint256;
            cert = cert.issuerCertificate;
        } while (cert.fingerprint256 !== lastprint256);
    },
};

options.agent = new https.Agent(options);
const req = https.request(options, (res) => {
    console.log(
        'All OK. Server matched our pinned cert or public key'
    );
    console.log('statusCode:', res.statusCode);
    // Print the HPKP values
    console.log('headers:', res.headers['public-key-pins']);

    res.on('data', (d) => {});
});

req.on('error', (e) => {
    console.error(e.message);
});
req.end();
```

Выходные данные, например:

```text
Subject Common Name: github.com
  Certificate SHA256 fingerprint: 25:FE:39:32:D9:63:8C:8A:FC:A1:9A:29:87:D8:3E:4C:1D:98:DB:71:E4:1A:48:03:98:EA:22:6A:BD:8B:93:16
  Public key ping-sha256: pL1+qb9HTMRZJmuC/bB/ZI9d302BYrrqiVuRyW+DGrU=
Subject Common Name: DigiCert SHA2 Extended Validation Server CA
  Certificate SHA256 fingerprint: 40:3E:06:2A:26:53:05:91:13:28:5B:AF:80:A0:D4:AE:42:2C:84:8C:9F:78:FA:D0:1F:C9:4B:C5:B8:7F:EF:1A
  Public key ping-sha256: RRM1dGqnDFsCJXBTHky16vi1obOlCgFFn/yOhI/y+ho=
Subject Common Name: DigiCert High Assurance EV Root CA
  Certificate SHA256 fingerprint: 74:31:E5:F4:C3:C1:CE:46:90:77:4F:0B:61:E0:54:40:88:3B:A9:A0:1E:D0:0B:A6:AB:D7:80:6E:D3:B1:18:CF
  Public key ping-sha256: WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18=
All OK. Server matched our pinned cert or public key
statusCode: 200
headers: max-age=0; pin-sha256="WoiWRyIOVNa9ihaBciRSC7XHjliYS9VwUGOIud4PB18="; pin-sha256="RRM1dGqnDFsCJXBTHky16vi1obOlCgFFn/yOhI/y+ho="; pin-sha256="k2v657xBsOVe1PQRwOsHsw3bsGT2VzIqz5K+59sNQws="; pin-sha256="K87oWBWM9UZfyddvDfoxL+8lpNyoUB2ptGtn0fv6G2Q="; pin-sha256="IQBnNBEiFuhj+8x6X8XLgh01V9Ic5/V3IRQLNFFc7v4="; pin-sha256="iie1VXtL7HzAMF+/PVPR9xzT80kQxdZeJ+zduCB3uj0="; pin-sha256="LvRiGEjRqfzurezaWuj8Wie2gyHMrW5Q06LspMnox7A="; includeSubDomains
```

<!-- 0021.part.md -->
