# Модуль https

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/https.js -->

HTTPS - это протокол HTTP через TLS / SSL. В Node.js это реализовано как отдельный модуль.

## Класс: `https.Agent`

<!-- YAML
added: v0.4.5
changes:
  - version: v5.3.0
    pr-url: https://github.com/nodejs/node/pull/4252
    description: support `0` `maxCachedSessions` to disable TLS session caching.
  - version: v2.5.0
    pr-url: https://github.com/nodejs/node/pull/2228
    description: parameter `maxCachedSessions` added to `options` for TLS
                 sessions reuse.
-->

An [`Agent`](#class-httpsagent) объект для HTTPS, аналогичный [`http.Agent`](http.md#class-httpagent). Видеть [`https.request()`](#httpsrequestoptions-callback) для дополнительной информации.

### `new Agent([options])`

<!-- YAML
changes:
  - version: v12.5.0
    pr-url: https://github.com/nodejs/node/pull/28209
    description: do not automatically set servername if the target host was
                 specified using an IP address.
-->

- `options` {Object} Набор настраиваемых параметров для настройки агента. Могут иметь те же поля, что и для [`http.Agent(options)`](http.md#new-agentoptions), а также

  - `maxCachedSessions` {number} максимальное количество сеансов кэширования TLS. Использовать `0` чтобы отключить кеширование сеанса TLS. **Дефолт:** `100`.
  - `servername` {строка} значение [Расширение индикации имени сервера](https://en.wikipedia.org/wiki/Server_Name_Indication) для отправки на сервер. Использовать пустую строку `''` чтобы отключить отправку расширения. **Дефолт:** имя хоста целевого сервера, если целевой сервер не указан с использованием IP-адреса, и в этом случае значение по умолчанию `''` (без расширения).

    Видеть [`Session Resumption`](tls.md#session-resumption) для получения информации о повторном использовании сеанса TLS.

#### Событие: `'keylog'`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

- `line` {Buffer} Строка текста ASCII в NSS `SSLKEYLOGFILE` формат.
- `tlsSocket` {tls.TLSSocket} `tls.TLSSocket` экземпляр, на котором он был сгенерирован.

В `keylog` Событие генерируется, когда ключевой материал генерируется или принимается соединением, управляемым этим агентом (обычно до завершения рукопожатия, но не обязательно). Этот ключевой материал можно сохранить для отладки, поскольку он позволяет расшифровывать захваченный трафик TLS. Он может генерироваться несколько раз для каждого сокета.

Типичным вариантом использования является добавление полученных строк в общий текстовый файл, который позже используется программным обеспечением (например, Wireshark) для расшифровки трафика:

```js
// ...
https.globalAgent.on('keylog', (line, tlsSocket) => {
  fs.appendFileSync('/tmp/ssl-keys.log', line, {
    mode: 0o600,
  });
});
```

## Класс: `https.Server`

<!-- YAML
added: v0.3.4
-->

- Расширяется: {tls.Server}

Видеть [`http.Server`](http.md#class-httpserver) для дополнительной информации.

### `server.close([callback])`

<!-- YAML
added: v0.1.90
-->

- `callback` {Функция}
- Возвращает: {https.Server}

Видеть [`server.close()`](http.md#serverclosecallback) из модуля HTTP для получения подробной информации.

### `server.headersTimeout`

<!-- YAML
added: v11.3.0
-->

- {количество} **Дефолт:** `60000`

Видеть [`http.Server#headersTimeout`](http.md#serverheaderstimeout).

### `server.listen()`

Запускает HTTPS-сервер, ожидающий зашифрованных соединений. Этот метод идентичен [`server.listen()`](net.md#serverlisten) из [`net.Server`](net.md#class-netserver).

### `server.maxHeadersCount`

- {количество} **Дефолт:** `2000`

Видеть [`http.Server#maxHeadersCount`](http.md#servermaxheaderscount).

### `server.requestTimeout`

<!-- YAML
added: v14.11.0
-->

- {количество} **Дефолт:** `0`

Видеть [`http.Server#requestTimeout`](http.md#serverrequesttimeout).

### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v0.11.2
-->

- `msecs` {количество} **Дефолт:** `120000` (2 минуты)
- `callback` {Функция}
- Возвращает: {https.Server}

Видеть [`http.Server#setTimeout()`](http.md#serversettimeoutmsecs-callback).

### `server.timeout`

<!-- YAML
added: v0.11.2
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

- {количество} **Дефолт:** 0 (без тайм-аута)

Видеть [`http.Server#timeout`](http.md#servertimeout).

### `server.keepAliveTimeout`

<!-- YAML
added: v8.0.0
-->

- {количество} **Дефолт:** `5000` (5 секунд)

Видеть [`http.Server#keepAliveTimeout`](http.md#serverkeepalivetimeout).

## `https.createServer([options][, requestListener])`

<!-- YAML
added: v0.3.4
-->

- `options` {Object} принимает `options` из [`tls.createServer()`](tls.md#tlscreateserveroptions-secureconnectionlistener), [`tls.createSecureContext()`](tls.md#tlscreatesecurecontextoptions) а также [`http.createServer()`](http.md#httpcreateserveroptions-requestlistener).
- `requestListener` {Function} Слушатель, который будет добавлен к `'request'` событие.
- Возвращает: {https.Server}

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
  pfx: fs.readFileSync('test/fixtures/test_cert.pfx'),
  passphrase: 'sample',
};

https
  .createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
  })
  .listen(8000);
```

## `https.get(options[, callback])`

## `https.get(url[, options][, callback])`

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
- `options` {Объект | строка | URL} Принимает то же самое `options` в качестве [`https.request()`](#httpsrequestoptions-callback), с `method` всегда установлен на `GET`.
- `callback` {Функция}

Нравиться [`http.get()`](http.md#httpgetoptions-callback) но для HTTPS.

`options` может быть объектом, строкой или [`URL`](url.md#the-whatwg-url-api) объект. Если `options` является строкой, она автоматически анализируется с помощью [`new URL()`](url.md#new-urlinput-base). Если это [`URL`](url.md#the-whatwg-url-api) объект, он будет автоматически преобразован в обычный `options` объект.

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

## `https.globalAgent`

<!-- YAML
added: v0.5.9
-->

Глобальный экземпляр [`https.Agent`](#class-httpsagent) для всех клиентских запросов HTTPS.

## `https.request(options[, callback])`

## `https.request(url[, options][, callback])`

<!-- YAML
added: v0.3.6
changes:
  - version:
      - v16.7.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39310
    description: When using a `URL` object parsed username
                 and password will now be properly URI decoded.
  - version:
      - v14.1.0
      - v13.14.0
    pr-url: https://github.com/nodejs/node/pull/32786
    description: The `highWaterMark` option is accepted now.
  - version: v10.9.0
    pr-url: https://github.com/nodejs/node/pull/21616
    description: The `url` parameter can now be passed along with a separate
                 `options` object.
  - version: v9.3.0
    pr-url: https://github.com/nodejs/node/pull/14903
    description: The `options` parameter can now include `clientCertEngine`.
  - version: v7.5.0
    pr-url: https://github.com/nodejs/node/pull/10638
    description: The `options` parameter can be a WHATWG `URL` object.
-->

- `url` {строка | URL}
- `options` {Объект | строка | URL} Принимает все `options` из [`http.request()`](http.md#httprequestoptions-callback), с некоторыми отличиями в значениях по умолчанию:
  - `protocol` **Дефолт:** `'https:'`
  - `port` **Дефолт:** `443`
  - `agent` **Дефолт:** `https.globalAgent`
- `callback` {Функция}
- Возвращает: {http.ClientRequest}

Отправляет запрос на защищенный веб-сервер.

Следующие дополнительные `options` из [`tls.connect()`](tls.md#tlsconnectoptions-callback) также принимаются: `ca`, `cert`, `ciphers`, `clientCertEngine`, `crl`, `dhparam`, `ecdhCurve`, `honorCipherOrder`, `key`, `passphrase`, `pfx`, `rejectUnauthorized`, `secureOptions`, `secureProtocol`, `servername`, `sessionIdContext`, `highWaterMark`.

`options` может быть объектом, строкой или [`URL`](url.md#the-whatwg-url-api) объект. Если `options` является строкой, она автоматически анализируется с помощью [`new URL()`](url.md#new-urlinput-base). Если это [`URL`](url.md#the-whatwg-url-api) объект, он будет автоматически преобразован в обычный `options` объект.

`https.request()` возвращает экземпляр [`http.ClientRequest`](http.md#class-httpclientrequest) класс. В `ClientRequest` instance - это поток с возможностью записи. Если нужно загрузить файл с помощью POST-запроса, напишите в `ClientRequest` объект.

```js
const https = require('https');

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
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync(
    'test/fixtures/keys/agent2-cert.pem'
  ),
};
options.agent = new https.Agent(options);

const req = https.request(options, (res) => {
  // ...
});
```

В качестве альтернативы можно отказаться от пула подключений, не используя [`Agent`](#class-httpsagent).

```js
const options = {
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

const req = https.request(options, (res) => {
  // ...
});
```

Пример использования [`URL`](url.md#the-whatwg-url-api) в качестве `options`:

```js
const options = new URL('https://abc:xyz@example.com');

const req = https.request(options, (res) => {
  // ...
});
```

Пример закрепления на отпечатке сертификата или открытом ключе (аналогично `pin-sha256`):

```js
const tls = require('tls');
const https = require('https');
const crypto = require('crypto');

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

    // Pin the public key, similar to HPKP pin-sha25 pinning
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
      console.log('Subject Common Name:', cert.subject.CN);
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

Например, выходы:

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
