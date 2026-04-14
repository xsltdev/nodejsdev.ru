---
title: HTTPS
description: HTTPS — протокол HTTP поверх TLS/SSL; в Node.js реализован отдельным модулем
---

# HTTPS

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/https.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/https.js -->

**HTTPS** — это протокол HTTP поверх TLS/SSL. В Node.js он реализован отдельным модулем.

## Определение отсутствия поддержки криптографии

Node.js может быть собран без поддержки модуля `node:crypto`. В таких случаях попытка выполнить `import` из `https` или вызвать `require('node:https')` приведёт к выбросу ошибки.

При использовании CommonJS выброшенную ошибку можно перехватить через try/catch:

=== "CJS"

    ```js
    let https;
    try {
      https = require('node:https');
    } catch (err) {
      console.error('https support is disabled!');
    }
    ```

При использовании лексического ключевого слова ESM `import` ошибку можно перехватить только если обработчик `process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль (например, с помощью модуля предварительной загрузки).

При использовании ESM, если есть вероятность запуска кода на сборке Node.js без поддержки криптографии, рассмотрите использование функции [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) вместо лексического `import`:

=== "MJS"

    ```js
    let https;
    try {
      https = await import('node:https');
    } catch (err) {
      console.error('https support is disabled!');
    }
    ```

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

Добавлено в: v0.4.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v5.3.0 | поддержка `0` `maxCachedSessions` для отключения кэширования сеанса TLS. |
    | v2.5.0 | параметр maxCachedSessions добавлен в параметры для повторного использования сеансов TLS. |

Объект [`Agent`](#class-httpsagent) для HTTPS, аналогичный [`http.Agent`](http.md#class-httpagent). Подробнее см. [`https.request()`](#httpsrequestoptions-callback).

Как и у `http.Agent`, метод `createConnection(options[, callback])` можно переопределить, чтобы настроить установление TLS-соединений.

> Подробности о переопределении этого метода, в том же числе об асинхронном создании сокета с колбэком, см. в [`agent.createConnection()`](http.md#agentcreateconnectionoptions-callback).

### `new Agent([options])`

<!-- YAML
changes:
  - version:
    - v24.5.0
    - v22.21.0
    pr-url: https://github.com/nodejs/node/pull/58980
    description: Add support for `proxyEnv`.
  - version:
    - v24.5.0
    - v22.21.0
    pr-url: https://github.com/nodejs/node/pull/58980
    description: Add support for `defaultPort` and `protocol`.
  - version: v12.5.0
    pr-url: https://github.com/nodejs/node/pull/28209
    description: do not automatically set servername if the target host was
                 specified using an IP address.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.5.0, v22.21.0 | Добавьте поддержку proxyEnv. |
    | v24.5.0, v22.21.0 | Добавьте поддержку defaultPort и протокола. |
    | v12.5.0 | не задавайте имя сервера автоматически, если целевой хост был указан с использованием IP-адреса. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Набор настраиваемых опций агента.
  Может содержать те же поля, что и [`http.Agent(options)`](http.md#new-agentoptions), а также
  * `maxCachedSessions` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное число кэшированных TLS-сессий.
    Укажите `0`, чтобы отключить кэширование сессий TLS. **По умолчанию:** `100`.
  * `servername` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) значение расширения
    [Server Name Indication][sni wiki], отправляемое серверу. Пустая строка `''`
    отключает отправку расширения.
    **По умолчанию:** имя хоста целевого сервера, если только целевой сервер
    не задан IP-адресом — тогда по умолчанию `''` (без расширения).

    См. [`Session Resumption`](tls.md#session-resumption) о повторном использовании TLS-сессий.

#### Событие: `'keylog'`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

* `line` [`<Buffer>`](buffer.md#buffer) Строка ASCII-текста в формате NSS `SSLKEYLOGFILE`.
* `tlsSocket` [`<tls.TLSSocket>`](tls.md#class-tlstlssocket) Экземпляр `tls.TLSSocket`, для которого материал был сгенерирован.

Событие `keylog` испускается, когда ключевой материал генерируется или получается соединением, управляемым этим агентом (обычно до завершения рукопожатия, но не обязательно). Этот материал можно сохранять для отладки: по нему можно расшифровать захваченный трафик TLS. Для каждого сокета событие может испускаться несколько раз.

Типичный сценарий — дописывать полученные строки в общий текстовый файл, который затем используется программами (например, Wireshark) для расшифровки трафика:

```js
// ...
https.globalAgent.on('keylog', (line, tlsSocket) => {
  fs.appendFileSync('/tmp/ssl-keys.log', line, { mode: 0o600 });
});
```

## Класс: `https.Server`

<!-- YAML
added: v0.3.4
-->

* Наследует: [`<tls.Server>`](#class-tlsserver)

См. [`http.Server`](http.md#class-httpserver).

### `server.close([callback])`

<!-- YAML
added: v0.1.90
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<https.Server>`](https.md)

См. [`server.close()`](http.md#serverclosecallback) в модуле `node:http`.

### `server[Symbol.asyncDispose]()`

<!-- YAML
added: v20.4.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

Добавлено в: v20.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Вызывает [`server.close()`](#serverclosecallback) и возвращает промис, который выполняется, когда сервер закрыт.

### `server.closeAllConnections()`

<!-- YAML
added: v18.2.0
-->

См. [`server.closeAllConnections()`](http.md#servercloseallconnections) в модуле `node:http`.

### `server.closeIdleConnections()`

<!-- YAML
added: v18.2.0
-->

См. [`server.closeIdleConnections()`](http.md#servercloseidleconnections) в модуле `node:http`.

### `server.headersTimeout`

<!-- YAML
added: v11.3.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `60000`

См. [`server.headersTimeout`](http.md#serverheaderstimeout) в модуле `node:http`.

### `server.listen()`

Запускает прослушивание HTTPS-сервером зашифрованных соединений.
Метод совпадает с [`server.listen()`](net.md#serverlisten) у [`net.Server`](net.md#class-netserver).

### `server.maxHeadersCount`

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2000`

См. [`server.maxHeadersCount`](http.md#servermaxheaderscount) в модуле `node:http`.

### `server.requestTimeout`

<!-- YAML
added: v14.11.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41263
    description: The default request timeout changed
                 from no timeout to 300s (5 minutes).
-->

Добавлено в: v14.11.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Тайм-аут запроса по умолчанию изменен с «нет тайм-аута» на 300 с (5 минут). |

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `300000`

См. [`server.requestTimeout`](http.md#serverrequesttimeout) в модуле `node:http`.

### `server.setTimeout([msecs][, callback])`

<!-- YAML
added: v0.11.2
-->

* `msecs` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `120000` (2 минуты)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<https.Server>`](https.md)

См. [`server.setTimeout()`](http.md#serversettimeoutmsecs-callback) в модуле `node:http`.

### `server.timeout`

<!-- YAML
added: v0.11.2
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27558
    description: The default timeout changed from 120s to 0 (no timeout).
-->

Добавлено в: v0.11.2

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.0.0 | Таймаут по умолчанию изменен со 120 с на 0 (таймаут отсутствует). |

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** 0 (без таймаута)

См. [`server.timeout`](http.md#servertimeout) в модуле `node:http`.

### `server.keepAliveTimeout`

<!-- YAML
added: v8.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `5000` (5 секунд)

См. [`server.keepAliveTimeout`](http.md#serverkeepalivetimeout) в модуле `node:http`.

## `https.createServer([options][, requestListener])`

<!-- YAML
added: v0.3.4
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Принимает `options` из [`tls.createServer()`](tls.md#tlscreateserveroptions-secureconnectionlistener),
  [`tls.createSecureContext()`](tls.md#tlscreatesecurecontextoptions) и [`http.createServer()`](http.md#httpcreateserveroptions-requestlistener).
* `requestListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обработчик, добавляемый к событию `'request'`.
* Возвращает: [`<https.Server>`](https.md)

=== "MJS"

    ```js
    // curl -k https://localhost:8000/
    import { createServer } from 'node:https';
    import { readFileSync } from 'node:fs';
    
    const options = {
      key: readFileSync('private-key.pem'),
      cert: readFileSync('certificate.pem'),
    };
    
    createServer(options, (req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    }).listen(8000);
    ```

=== "CJS"

    ```js
    // curl -k https://localhost:8000/
    const https = require('node:https');
    const fs = require('node:fs');
    
    const options = {
      key: fs.readFileSync('private-key.pem'),
      cert: fs.readFileSync('certificate.pem'),
    };
    
    https.createServer(options, (req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    }).listen(8000);
    ```

Или

=== "MJS"

    ```js
    import { createServer } from 'node:https';
    import { readFileSync } from 'node:fs';
    
    const options = {
      pfx: readFileSync('test_cert.pfx'),
      passphrase: 'sample',
    };
    
    createServer(options, (req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    }).listen(8000);
    ```

=== "CJS"

    ```js
    const https = require('node:https');
    const fs = require('node:fs');
    
    const options = {
      pfx: fs.readFileSync('test_cert.pfx'),
      passphrase: 'sample',
    };
    
    https.createServer(options, (req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    }).listen(8000);
    ```

Чтобы сгенерировать сертификат и ключ для этого примера, выполните:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout private-key.pem -out certificate.pem
```

Затем для генерации сертификата `pfx` для этого примера выполните:

```bash
openssl pkcs12 -certpbe AES-256-CBC -export -out test_cert.pfx \
  -inkey private-key.pem -in certificate.pem -passout pass:sample
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

Добавлено в: v0.3.6

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.9.0 | Параметр `url` теперь можно передавать вместе с отдельным объектом `options`. |
    | v7.5.0 | Параметр `options` может быть объектом `URL` WHATWG. |

* `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Принимает те же `options`, что и
  [`https.request()`](#httpsrequestoptions-callback), метод по умолчанию — GET.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<http.ClientRequest>`](#httpclientrequest)

Аналог [`http.get()`](http.md#httpgetoptions-callback), но для HTTPS.

`options` может быть объектом, строкой или объектом [`URL`](url.md#the-whatwg-url-api). Если `options` — строка, она автоматически разбирается через [`new URL()`](url.md#new-urlinput-base). Если это [`URL`](url.md#the-whatwg-url-api), он преобразуется в обычный объект `options`.

=== "MJS"

    ```js
    import { get } from 'node:https';
    import process from 'node:process';
    
    get('https://encrypted.google.com/', (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (d) => {
        process.stdout.write(d);
      });
    
    }).on('error', (e) => {
      console.error(e);
    });
    ```

=== "CJS"

    ```js
    const https = require('node:https');
    
    https.get('https://encrypted.google.com/', (res) => {
      console.log('statusCode:', res.statusCode);
      console.log('headers:', res.headers);
    
      res.on('data', (d) => {
        process.stdout.write(d);
      });
    
    }).on('error', (e) => {
      console.error(e);
    });
    ```

## `https.globalAgent`

<!-- YAML
added: v0.5.9
changes:
  - version:
      - v19.0.0
    pr-url: https://github.com/nodejs/node/pull/43522
    description: The agent now uses HTTP Keep-Alive and a 5 second timeout by
                 default.
-->

Добавлено в: v0.5.9

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.0.0 | Агент теперь по умолчанию использует HTTP Keep-Alive и 5-секундный тайм-аут. |

Глобальный экземпляр [`https.Agent`](#class-httpsagent) для всех клиентских HTTPS-запросов. Отличается от конфигурации [`https.Agent`](#class-httpsagent) по умолчанию тем, что у него включён `keepAlive` и `timeout` 5 секунд.

## `https.request(options[, callback])`

## `https.request(url[, options][, callback])`

<!-- YAML
added: v0.3.6
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53329
    description: The `clientCertEngine` option depends on custom engine
                 support in OpenSSL which is deprecated in OpenSSL 3.
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

Добавлено в: v0.3.6

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Параметр clientCertEngine зависит от поддержки специального механизма в OpenSSL, который устарел в OpenSSL 3. |
    | v16.7.0, v14.18.0 | При использовании объекта URL анализируемое имя пользователя и пароль теперь будут правильно декодированы URI. |
    | v14.1.0, v13.14.0 | Опция `highWaterMark` теперь принята. |
    | v10.9.0 | Параметр `url` теперь можно передавать вместе с отдельным объектом `options`. |
    | v9.3.0 | Параметр `options` теперь может включать `clientCertEngine`. |
    | v7.5.0 | Параметр `options` может быть объектом `URL` WHATWG. |

* `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Принимает все `options` из
  [`http.request()`](http.md#httprequestoptions-callback), с отличиями значений по умолчанию:
  * `protocol` **По умолчанию:** `'https:'`
  * `port` **По умолчанию:** `443`
  * `agent` **По умолчанию:** `https.globalAgent`
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<http.ClientRequest>`](#httpclientrequest)

Выполняет запрос к защищённому веб-серверу.

Также принимаются дополнительные `options` из [`tls.connect()`](tls.md#tlsconnectoptions-callback):
`ca`, `cert`, `ciphers`, `clientCertEngine` (устарело), `crl`, `dhparam`, `ecdhCurve`,
`honorCipherOrder`, `key`, `passphrase`, `pfx`, `rejectUnauthorized`,
`secureOptions`, `secureProtocol`, `servername`, `sessionIdContext`,
`highWaterMark`.

`options` может быть объектом, строкой или объектом [`URL`](url.md#the-whatwg-url-api). Если `options` — строка, она автоматически разбирается через [`new URL()`](url.md#new-urlinput-base). Если это [`URL`](url.md#the-whatwg-url-api), он преобразуется в обычный объект `options`.

`https.request()` возвращает экземпляр класса [`http.ClientRequest`](http.md#class-httpclientrequest).
`ClientRequest` — поток для записи. Чтобы загрузить файл запросом POST, пишите в объект `ClientRequest`.

=== "MJS"

    ```js
    import { request } from 'node:https';
    import process from 'node:process';
    
    const options = {
      hostname: 'encrypted.google.com',
      port: 443,
      path: '/',
      method: 'GET',
    };
    
    const req = request(options, (res) => {
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

=== "CJS"

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

Пример с опциями из [`tls.connect()`](tls.md#tlsconnectoptions-callback):

```js
const options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
};
options.agent = new https.Agent(options);

const req = https.request(options, (res) => {
  // ...
});
```

Либо отключите пул соединений, не используя [`Agent`](#class-httpsagent).

```js
const options = {
  hostname: 'encrypted.google.com',
  port: 443,
  path: '/',
  method: 'GET',
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  agent: false,
};

const req = https.request(options, (res) => {
  // ...
});
```

Пример с [`URL`](url.md#the-whatwg-url-api) в качестве `options`:

```js
const options = new URL('https://abc:xyz@example.com');

const req = https.request(options, (res) => {
  // ...
});
```

Пример привязки к отпечатку сертификата или открытому ключу (аналогично `pin-sha256`):

=== "MJS"

    ```js
    import { checkServerIdentity } from 'node:tls';
    import { Agent, request } from 'node:https';
    import { createHash } from 'node:crypto';
    
    function sha256(s) {
      return createHash('sha256').update(s).digest('base64');
    }
    const options = {
      hostname: 'github.com',
      port: 443,
      path: '/',
      method: 'GET',
      checkServerIdentity: function(host, cert) {
        // Make sure the certificate is issued to the host we are connected to
        const err = checkServerIdentity(host, cert);
        if (err) {
          return err;
        }
    
        // Pin the public key, similar to HPKP pin-sha256 pinning
        const pubkey256 = 'SIXvRyDmBJSgatgTQRGbInBaAK+hZOQ18UmrSwnDlK8=';
        if (sha256(cert.pubkey) !== pubkey256) {
          const msg = 'Certificate verification error: ' +
            `The public key of '${cert.subject.CN}' ` +
            'does not match our pinned fingerprint';
          return new Error(msg);
        }
    
        // Pin the exact certificate, rather than the pub key
        const cert256 = 'FD:6E:9B:0E:F3:98:BC:D9:04:C3:B2:EC:16:7A:7B:' +
          '0F:DA:72:01:C9:03:C5:3A:6A:6A:E5:D0:41:43:63:EF:65';
        if (cert.fingerprint256 !== cert256) {
          const msg = 'Certificate verification error: ' +
            `The certificate of '${cert.subject.CN}' ` +
            'does not match our pinned fingerprint';
          return new Error(msg);
        }
    
        // This loop is informational only.
        // Print the certificate and public key fingerprints of all certs in the
        // chain. Its common to pin the public key of the issuer on the public
        // internet, while pinning the public key of the service in sensitive
        // environments.
        let lastprint256;
        do {
          console.log('Subject Common Name:', cert.subject.CN);
          console.log('  Certificate SHA256 fingerprint:', cert.fingerprint256);
    
          const hash = createHash('sha256');
          console.log('  Public key ping-sha256:', sha256(cert.pubkey));
    
          lastprint256 = cert.fingerprint256;
          cert = cert.issuerCertificate;
        } while (cert.fingerprint256 !== lastprint256);
    
      },
    };
    
    options.agent = new Agent(options);
    const req = request(options, (res) => {
      console.log('All OK. Server matched our pinned cert or public key');
      console.log('statusCode:', res.statusCode);
    
      res.on('data', (d) => {});
    });
    
    req.on('error', (e) => {
      console.error(e.message);
    });
    req.end();
    ```

=== "CJS"

    ```js
    const tls = require('node:tls');
    const https = require('node:https');
    const crypto = require('node:crypto');
    
    function sha256(s) {
      return crypto.createHash('sha256').update(s).digest('base64');
    }
    const options = {
      hostname: 'github.com',
      port: 443,
      path: '/',
      method: 'GET',
      checkServerIdentity: function(host, cert) {
        // Make sure the certificate is issued to the host we are connected to
        const err = tls.checkServerIdentity(host, cert);
        if (err) {
          return err;
        }
    
        // Pin the public key, similar to HPKP pin-sha256 pinning
        const pubkey256 = 'SIXvRyDmBJSgatgTQRGbInBaAK+hZOQ18UmrSwnDlK8=';
        if (sha256(cert.pubkey) !== pubkey256) {
          const msg = 'Certificate verification error: ' +
            `The public key of '${cert.subject.CN}' ` +
            'does not match our pinned fingerprint';
          return new Error(msg);
        }
    
        // Pin the exact certificate, rather than the pub key
        const cert256 = 'FD:6E:9B:0E:F3:98:BC:D9:04:C3:B2:EC:16:7A:7B:' +
          '0F:DA:72:01:C9:03:C5:3A:6A:6A:E5:D0:41:43:63:EF:65';
        if (cert.fingerprint256 !== cert256) {
          const msg = 'Certificate verification error: ' +
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
          console.log('  Certificate SHA256 fingerprint:', cert.fingerprint256);
    
          hash = crypto.createHash('sha256');
          console.log('  Public key ping-sha256:', sha256(cert.pubkey));
    
          lastprint256 = cert.fingerprint256;
          cert = cert.issuerCertificate;
        } while (cert.fingerprint256 !== lastprint256);
    
      },
    };
    
    options.agent = new https.Agent(options);
    const req = https.request(options, (res) => {
      console.log('All OK. Server matched our pinned cert or public key');
      console.log('statusCode:', res.statusCode);
    
      res.on('data', (d) => {});
    });
    
    req.on('error', (e) => {
      console.error(e.message);
    });
    req.end();
    ```

Пример вывода:

```text
Subject Common Name: github.com
  Certificate SHA256 fingerprint: FD:6E:9B:0E:F3:98:BC:D9:04:C3:B2:EC:16:7A:7B:0F:DA:72:01:C9:03:C5:3A:6A:6A:E5:D0:41:43:63:EF:65
  Public key ping-sha256: SIXvRyDmBJSgatgTQRGbInBaAK+hZOQ18UmrSwnDlK8=
Subject Common Name: Sectigo ECC Domain Validation Secure Server CA
  Certificate SHA256 fingerprint: 61:E9:73:75:E9:F6:DA:98:2F:F5:C1:9E:2F:94:E6:6C:4E:35:B6:83:7C:E3:B9:14:D2:24:5C:7F:5F:65:82:5F
  Public key ping-sha256: Eep0p/AsSa9lFUH6KT2UY+9s1Z8v7voAPkQ4fGknZ2g=
Subject Common Name: USERTrust ECC Certification Authority
  Certificate SHA256 fingerprint: A6:CF:64:DB:B4:C8:D5:FD:19:CE:48:89:60:68:DB:03:B5:33:A8:D1:33:6C:62:56:A8:7D:00:CB:B3:DE:F3:EA
  Public key ping-sha256: UJM2FOhG9aTNY0Pg4hgqjNzZ/lQBiMGRxPD5Y2/e0bw=
Subject Common Name: AAA Certificate Services
  Certificate SHA256 fingerprint: D7:A7:A0:FB:5D:7E:27:31:D7:71:E9:48:4E:BC:DE:F7:1D:5F:0C:3E:0A:29:48:78:2B:C8:3E:E0:EA:69:9E:F4
  Public key ping-sha256: vRU+17BDT2iGsXvOi76E7TQMcTLXAqj0+jGPdW7L1vM=
All OK. Server matched our pinned cert or public key
statusCode: 200
```

[`Agent`]: #class-httpsagent
[`Session Resumption`]: tls.md#session-resumption
[`URL`]: url.md#the-whatwg-url-api
[`agent.createConnection()`]: http.md#agentcreateconnectionoptions-callback
[`http.Agent(options)`]: http.md#new-agentoptions
[`http.Agent`]: http.md#class-httpagent
[`http.ClientRequest`]: http.md#class-httpclientrequest
[`http.Server`]: http.md#class-httpserver
[`http.createServer()`]: http.md#httpcreateserveroptions-requestlistener
[`http.get()`]: http.md#httpgetoptions-callback
[`http.request()`]: http.md#httprequestoptions-callback
[`https.Agent`]: #class-httpsagent
[`https.request()`]: #httpsrequestoptions-callback
[`import()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
[`net.Server`]: net.md#class-netserver
[`new URL()`]: url.md#new-urlinput-base
[`server.close()`]: http.md#serverclosecallback
[`server.closeAllConnections()`]: http.md#servercloseallconnections
[`server.closeIdleConnections()`]: http.md#servercloseidleconnections
[`server.headersTimeout`]: http.md#serverheaderstimeout
[`server.keepAliveTimeout`]: http.md#serverkeepalivetimeout
[`server.listen()`]: net.md#serverlisten
[`server.maxHeadersCount`]: http.md#servermaxheaderscount
[`server.requestTimeout`]: http.md#serverrequesttimeout
[`server.setTimeout()`]: http.md#serversettimeoutmsecs-callback
[`server.timeout`]: http.md#servertimeout
[`tls.connect()`]: tls.md#tlsconnectoptions-callback
[`tls.createSecureContext()`]: tls.md#tlscreatesecurecontextoptions
[`tls.createServer()`]: tls.md#tlscreateserveroptions-secureconnectionlistener
[httpsServerClose]: #serverclosecallback
[sni wiki]: https://en.wikipedia.org/wiki/Server_Name_Indication
