---
title: TLS (SSL)
description: Модуль node:tls предоставляет реализацию протоколов Transport Layer Security (TLS) и Secure Socket Layer (SSL) на базе OpenSSL
---

# TLS (SSL)

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/tls.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/tls.js -->

Модуль `node:tls` предоставляет реализацию протоколов Transport Layer Security (TLS) и Secure Socket Layer (SSL), построенную на базе OpenSSL. Обратиться к нему можно так:

=== "MJS"

    ```js
    import tls from 'node:tls';
    ```

=== "CJS"

    ```js
    const tls = require('node:tls');
    ```

## Определение отсутствия поддержки криптографии

Возможна сборка Node.js без поддержки модуля `node:crypto`. В таких случаях попытка `import` из `tls` или вызов `require('node:tls')` приведет к выброшенной ошибке.

При использовании CommonJS возникшую ошибку можно перехватить с помощью try/catch:

=== "CJS"

    ```js
    let tls;
    try {
      tls = require('node:tls');
    } catch (err) {
      console.error('tls support is disabled!');
    }
    ```

При использовании лексического ключевого слова ESM `import` ошибка может быть поймана только если обработчик `process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль (например, с помощью модуля предзагрузки).

При использовании ESM, если есть вероятность, что код будет выполняться на сборке Node.js без поддержки криптографии, используйте функцию [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) вместо лексического `import`:

=== "MJS"

    ```js
    let tls;
    try {
      tls = await import('node:tls');
    } catch (err) {
      console.error('tls support is disabled!');
    }
    ```

## Концепции TLS/SSL

TLS/SSL — набор протоколов, опирающихся на инфраструктуру открытых ключей (PKI) для обеспечения безопасной связи между клиентом и сервером. В типичных сценариях у каждого сервера должен быть закрытый ключ.

Закрытые ключи можно сгенерировать разными способами. Ниже показано использование интерфейса командной строки OpenSSL для генерации 2048-битного закрытого ключа RSA:

```bash
openssl genrsa -out ryans-key.pem 2048
```

При использовании TLS/SSL у всех серверов (и у некоторых клиентов) должен быть _сертификат_. Сертификаты — это _открытые ключи_, соответствующие закрытому ключу и подписанные цифровой подписью центром сертификации или владельцем закрытого ключа (такие сертификаты называют «самоподписанными»). Первый шаг к получению сертификата — создать файл _запроса на подписание сертификата_ (CSR).

Интерфейс командной строки OpenSSL можно использовать для генерации CSR для закрытого ключа:

```bash
openssl req -new -sha256 -key ryans-key.pem -out ryans-csr.pem
```

После создания файла CSR его можно отправить в центр сертификации для подписания или использовать для создания самоподписанного сертификата.

Создание самоподписанного сертификата с помощью OpenSSL показано в примере ниже:

```bash
openssl x509 -req -in ryans-csr.pem -signkey ryans-key.pem -out ryans-cert.pem
```

После создания сертификата его можно использовать для создания файла `.pfx` или `.p12`:

```bash
openssl pkcs12 -export -in ryans-cert.pem -inkey ryans-key.pem \
      -certfile ca-cert.pem -out ryans.pfx
```

Где:

* `in`: подписанный сертификат
* `inkey`: соответствующий закрытый ключ
* `certfile`: объединение всех сертификатов центра сертификации (CA) в один файл, например `cat ca1-cert.pem ca2-cert.pem > ca-cert.pem`

### Совершенная прямая секретность (perfect forward secrecy) {#perfect-forward-secrecy}

<!-- type=misc -->

Термин _[forward secrecy][forward secrecy]_ или _perfect forward secrecy_ описывает свойство
методов согласования ключей (обмена ключами): ключи сервера и клиента
используются для выработки новых временных ключей, применяемых только в текущем
сеансе связи. По сути, даже если закрытый ключ сервера скомпрометирован,
перехваченный трафик можно расшифровать лишь если атакующий получит пару ключей,
сгенерированную именно для этого сеанса.

Совершенная прямая секретность достигается случайной генерацией пары ключей для
согласования при каждом рукопожатии TLS/SSL (в отличие от использования одного
ключа для всех сеансов). Методы с такой техникой называют «эфемерными».

Сейчас обычно используются два метода (обратите внимание на букву «E» в
аббревиатурах):

* [ECDHE][ECDHE]: эфемерный вариант протокола согласования ключей на эллиптических
  кривых Диффи — Хеллмана.
* [DHE][DHE]: эфемерный вариант протокола Диффи — Хеллмана.

Совершенная прямая секретность на ECDHE включена по умолчанию. Опция `ecdhCurve`
при создании TLS-сервера может задать список поддерживаемых кривых ECDH. См.
[`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener).

DHE по умолчанию отключён, но его можно включить вместе с ECDHE, задав опцию
`dhparam` в `'auto'`. Пользовательские параметры DHE поддерживаются, но не
рекомендуются по сравнению с автоматически выбранными известными параметрами.

До TLSv1.2 совершенная прямая секретность была необязательной. В TLSv1.3 (EC)DHE
используется всегда (кроме соединений только с PSK).

### ALPN и SNI

<!-- type=misc -->

ALPN (расширение согласования протокола прикладного уровня) и SNI (указание
имени сервера) — расширения рукопожатия TLS:

* ALPN: один TLS-сервер для нескольких протоколов (HTTP, HTTP/2).
* SNI: один TLS-сервер для нескольких имён хоста с разными сертификатами.

### Предварительно разделённые ключи (PSK) {#pre-shared-keys}

<!-- type=misc -->

TLS-PSK — альтернатива обычной аутентификации по сертификатам: вместо
сертификатов используется предварительно разделённый ключ, что даёт взаимную
аутентификацию. TLS-PSK и инфраструктура открытых ключей не исключают друг
друга: клиент и сервер могут поддерживать оба варианта и выбирать при согласовании
шифров.

TLS-PSK уместен только там, где есть безопасный способ раздать ключ каждому
узлу; для большинства сценариев TLS он не заменяет PKI. Реализация TLS-PSK в
OpenSSL неоднократно имела уязвимости, отчасти из‑за редкого использования.
Рассмотрите альтернативы перед переходом на PSK-шифры. При генерации PSK
критична достаточная энтропия, см. [RFC 4086][RFC 4086]. Вывод общего секрета из пароля
или других источников с низкой энтропией небезопасен.

PSK-шифры по умолчанию отключены; для TLS-PSK нужно явно задать набор шифров в
опции `ciphers`. Список: `openssl ciphers -v 'PSK'`. Для TLS 1.3 подходят все
шифры с PSK: `openssl ciphers -v -s -tls1_3 -psk`. На клиенте следует передать
свой `checkServerIdentity`, иначе при отсутствии сертификата проверка по умолчанию
не пройдёт.

Согласно [RFC 4279][RFC 4279], должны поддерживаться идентификаторы PSK до 128 байт и сами
PSK до 64 байт. В OpenSSL 1.1.0 максимальный размер идентификатора — 128 байт,
PSK — до 256 байт.

Текущая реализация не поддерживает асинхронные обратные вызовы PSK из‑за
ограничений API OpenSSL.

Для TLS-PSK клиент и сервер задают опцию `pskCallback` — функцию, возвращающую
PSK (совместимый с дайджестом выбранного шифра).

Сначала на клиенте:

* `hint` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) необязательное сообщение сервера для выбора идентичности при
  согласовании. В TLS 1.3 всегда `null`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) вида
  `{ psk: <Buffer|TypedArray|DataView>, identity: <string> }` или `null`.

Затем на сервере:

* `socket` [`<tls.TLSSocket>`](tls.md#class-tlstlssocket) сокет сервера, эквивалент `this`.
* `identity` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) идентификатор от клиента.
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) PSK (или `null`).

Возврат `null` прерывает согласование и отправляет уведомление
`unknown_psk_identity` другой стороне. Чтобы скрыть неизвестную идентичность PSK,
колбэк может вернуть случайные данные как `psk`, чтобы соединение завершилось с
`decrypt_error` до окончания согласования.

### Смягчение атаки с пересогласованием по инициативе клиента

<!-- type=misc -->

Протокол TLS позволяет клиенту пересогласовывать часть параметров сеанса. Это
дорого для сервера и может использоваться для DoS.

Чтобы снизить риск, пересогласование ограничено тремя разами в десять минут. При
превышении порога на экземпляре [`tls.TLSSocket`](#class-tlstlssocket) испускается событие
`'error'`. Пределы настраиваются:

* `tls.CLIENT_RENEG_LIMIT` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) число запросов пересогласования.
  **По умолчанию:** `3`.
* `tls.CLIENT_RENEG_WINDOW` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) окно времени пересогласования в секундах.
  **По умолчанию:** `600` (10 минут).

Не меняйте эти значения без полного понимания последствий.

TLSv1.3 не поддерживает пересогласование.

### Возобновление сеанса {#session-resumption}

Установление TLS-сессии может быть медленным; процесс ускоряют сохранением и
повторным использованием состояния сеанса. Ниже — от старых к новым (и
предпочтительным) механизмам.

#### Идентификаторы сеансов

Сервер выдаёт уникальный ID новым соединениям и передаёт клиенту. Клиент и сервер
хранят состояние сеанса. При переподключении клиент отправляет ID сохранённого
состояния; если у сервера есть данные для этого ID, сеанс можно продолжить, иначе
создаётся новый. Подробнее см. [RFC 2246][RFC 2246], стр. 23 и 30.

Возобновление по идентификаторам поддерживают большинство браузеров при HTTPS.

В Node.js клиенты ждут события [`'session'`](#event-session), передают данные в опцию `session`
последующего [`tls.connect()`](#tlsconnectoptions-callback) для повторного использования сеанса. Серверы
должны обрабатывать [`'newSession'`](#event-newsession) и [`'resumeSession'`](#event-resumesession), сохраняя и
восстанавливая данные по ID. Для балансировщиков и кластера нужен общий кэш
сеансов (например Redis).

#### Билеты сеанса (session tickets)

Сервер шифрует состояние сеанса и отправляет клиенту «билет». При переподключении
состояние передаётся в начале установления связи; отдельный кэш на сервере не
нужен. Если билет не используется (не удалось расшифровать, устарел и т.д.),
создаётся новый сеанс и новый билет. См. [RFC 5077][RFC 5077].

Возобновление по билетам поддерживают многие браузеры при HTTPS.

В Node.js те же API, что и для идентификаторов. Для отладки: если
[`tls.TLSSocket.getTLSTicket()`](#tlssocketgettlsticket) возвращает значение, в данных сеанса есть
билет, иначе — состояние на стороне клиента.

В TLSv1.3 сервер может отправить несколько билетов и несколько событий
`'session'`; подробнее см. [`'session'`](#event-session).

Однопроцессным серверам не нужна особая настройка для билетов. Чтобы билеты
работали после перезапуска или между узлами, у всех серверов должны быть одинаковые
ключи билетов: внутри три 16-байтовых ключа, в API они представлены одним
буфером 48 байт.

Ключи можно взять с одного экземпляра [`server.getTicketKeys()`](#servergetticketkeys) и распространить,
но надёжнее сгенерировать 48 криптографически стойких случайных байт и задать
опцией `ticketKeys` в [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener). Ключи регулярно обновляют; сброс —
[`server.setTicketKeys()`](#serversetticketkeyskeys).

Ключи билетов — криптографические секреты; их _**нужно хранить безопасно**_. В
TLS 1.2 и ниже компрометация ключей позволяет расшифровать сеансы, защищённые
этими билетами. Не храните их на диске, регулярно обновляйте.

Если клиенты объявляют поддержку билетов, сервер их отправляет. Отключить билеты
можно через `require('node:constants').SSL_OP_NO_TICKET` в `secureOptions`.

И у идентификаторов, и у билетов есть таймаут; новый сеанс настраивается опцией
`sessionTimeout` в [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener).

При любой неудаче возобновления сервер создаёт новый сеанс; сбой возобновления не
ломает TLS/HTTPS, поэтому деградацию производительности легко не заметить.
Проверить возобновление можно через OpenSSL CLI, например `-reconnect` у
`openssl s_client`:

```bash
openssl s_client -connect localhost:443 -reconnect
```

В отладочном выводе первое соединение обычно помечено как `New`, например:

```text
New, TLSv1.2, Cipher is ECDHE-RSA-AES128-GCM-SHA256
```

Последующие — как `Reused`, например:

```text
Reused, TLSv1.2, Cipher is ECDHE-RSA-AES128-GCM-SHA256
```

## Изменение набора шифров TLS по умолчанию {#modifying-the-default-tls-cipher-suite}

Node.js собирается с набором включённых и отключённых шифров TLS по умолчанию. Этот список можно задать при сборке Node.js, чтобы дистрибутивы могли подставить свой список.

Показать набор шифров по умолчанию может команда:

```console
node -p crypto.constants.defaultCoreCipherList | tr ':' '\n'
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
ECDHE-RSA-AES128-GCM-SHA256
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-AES256-GCM-SHA384
DHE-RSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-SHA256
DHE-RSA-AES128-SHA256
ECDHE-RSA-AES256-SHA384
DHE-RSA-AES256-SHA384
ECDHE-RSA-AES256-SHA256
DHE-RSA-AES256-SHA256
HIGH
!aNULL
!eNULL
!EXPORT
!DES
!RC4
!MD5
!PSK
!SRP
!CAMELLIA
```

Значение по умолчанию можно полностью заменить ключом [`--tls-cipher-list`](cli.md#--tls-cipher-listlist)
(напрямую или через переменную окружения [`NODE_OPTIONS`](cli.md#node_optionsoptions)). Например, ниже
`ECDHE-RSA-AES128-GCM-SHA256:!RC4` становится набором шифров TLS по умолчанию:

```bash
node --tls-cipher-list='ECDHE-RSA-AES128-GCM-SHA256:!RC4' server.js

export NODE_OPTIONS=--tls-cipher-list='ECDHE-RSA-AES128-GCM-SHA256:!RC4'
node server.js
```

Для проверки покажите установленный список шифров; обратите внимание на разницу
между `defaultCoreCipherList` и `defaultCipherList`:

```bash
node --tls-cipher-list='ECDHE-RSA-AES128-GCM-SHA256:!RC4' -p crypto.constants.defaultCipherList | tr ':' '\n'
ECDHE-RSA-AES128-GCM-SHA256
!RC4
```

То есть `defaultCoreCipherList` задаётся при компиляции, а `defaultCipherList` —
во время выполнения.

Чтобы изменить набор шифров из кода, задайте переменную `tls.DEFAULT_CIPHERS`
до прослушивания сокетов; уже открытые сокеты не изменятся. Например:

```js
// Remove Obsolete CBC Ciphers and RSA Key Exchange based Ciphers as they don't provide Forward Secrecy
tls.DEFAULT_CIPHERS +=
  ':!ECDHE-RSA-AES128-SHA:!ECDHE-RSA-AES128-SHA256:!ECDHE-RSA-AES256-SHA:!ECDHE-RSA-AES256-SHA384' +
  ':!ECDHE-ECDSA-AES128-SHA:!ECDHE-ECDSA-AES128-SHA256:!ECDHE-ECDSA-AES256-SHA:!ECDHE-ECDSA-AES256-SHA384' +
  ':!kRSA';
```

То же значение по умолчанию можно переопределить для отдельного клиента или
сервера опцией `ciphers` из [`tls.createSecureContext()`](#tlscreatesecurecontextoptions) — она доступна в
[`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener), [`tls.connect()`](#tlsconnectoptions-callback) и при создании
[`tls.TLSSocket`](#class-tlstlssocket).

Список может смешивать имена наборов шифров TLSv1.3 (начинаются с `'TLS_'`) и
спецификации для TLSv1.2 и ниже. Для TLSv1.2 действует устаревший формат списка,
см. документацию OpenSSL ([формат списка шифров][cipher list format]), но к шифрам TLSv1.3 эти
правила _не_ применяются: наборы TLSv1.3 включаются только полным именем в списке.
Их нельзя включить или отключить устаревшими суффиксами TLSv1.2 вроде `'EECDH'` или
`'!EECDH'`.

Несмотря на порядок в списке, протокол TLSv1.3 безопаснее TLSv1.2 и будет выбран
при поддержке рукопожатием, если включены какие-либо наборы TLSv1.3.

Набор шифров по умолчанию в Node.js подобран с учётом текущих практик
безопасности. Его изменение сильно влияет на безопасность приложения. Ключ
`--tls-cipher-list` и опция `ciphers` должны использоваться только при крайней
необходимости.

По умолчанию предпочитаются шифры GCM для [настройки «современной криптографии» в Chrome][Chrome's 'modern cryptography' setting] и шифры ECDHE/DHE для совершенной прямой секретности, с
_некоторой_ обратной совместимостью.

Старые клиенты на небезопасных RC4 или DES (например Internet Explorer 6) не
смогут завершить рукопожатие с конфигурацией по умолчанию. Если таких клиентов
нужно поддержать, см. [рекомендации Mozilla по TLS][TLS recommendations]. О формате списка — в документации
OpenSSL ([формат списка шифров][cipher list format]).

В TLSv1.3 только пять наборов шифров:

* `'TLS_AES_256_GCM_SHA384'`
* `'TLS_CHACHA20_POLY1305_SHA256'`
* `'TLS_AES_128_GCM_SHA256'`
* `'TLS_AES_128_CCM_SHA256'`
* `'TLS_AES_128_CCM_8_SHA256'`

Первые три включены по умолчанию. Два набора на основе `CCM` поддерживаются в
TLSv1.3 (могут быть быстрее на ограниченных системах), но по умолчанию отключены
из‑за меньшей стойкости.

## Уровень безопасности OpenSSL {#openssl-security-level}

Библиотека OpenSSL задаёт уровни безопасности — минимально допустимый уровень для
криптографических операций. Уровни от 0 до 5, каждый следующий строже. По
умолчанию уровень 2; он подходит для большинства современных приложений. Некоторые
устаревшие возможности и протоколы (например TLSv1) требуют более низкого уровня
(`SECLEVEL=0`). Подробнее — [документация OpenSSL об уровнях безопасности][OpenSSL documentation on security levels].

### Настройка уровня безопасности

В строке шифров можно указать `@SECLEVEL=X`, где `X` — нужный уровень. Например,
уровень 0 при списке шифров OpenSSL по умолчанию:

=== "MJS"

    ```js
    import { createServer, connect } from 'node:tls';
    const port = 443;
    
    createServer({ ciphers: 'DEFAULT@SECLEVEL=0', minVersion: 'TLSv1' }, function(socket) {
      console.log('Client connected with protocol:', socket.getProtocol());
      socket.end();
      this.close();
    })
    .listen(port, () => {
      connect(port, { ciphers: 'DEFAULT@SECLEVEL=0', maxVersion: 'TLSv1' });
    });
    ```

=== "CJS"

    ```js
    const { createServer, connect } = require('node:tls');
    const port = 443;
    
    createServer({ ciphers: 'DEFAULT@SECLEVEL=0', minVersion: 'TLSv1' }, function(socket) {
      console.log('Client connected with protocol:', socket.getProtocol());
      socket.end();
      this.close();
    })
    .listen(port, () => {
      connect(port, { ciphers: 'DEFAULT@SECLEVEL=0', maxVersion: 'TLSv1' });
    });
    ```

Так задаётся уровень 0, допускающий устаревшие возможности при сохранении списка
шифров OpenSSL по умолчанию.

### Использование [`--tls-cipher-list`](cli.md#--tls-cipher-listlist)

Уровень и шифры можно задать с командной строки через
`--tls-cipher-list=DEFAULT@SECLEVEL=X`, см. раздел [Изменение набора шифров TLS по умолчанию][Modifying the default TLS cipher suite]. Обычно не рекомендуется
задавать шифры только глобально из CLI; лучше настраивать контексты в коде
приложения — так точнее контроль и ниже риск глобального понижения уровня
безопасности.

## Коды ошибок сертификата X509

Ряд функций может завершиться ошибкой сертификата, о которой сообщает OpenSSL.
Тогда в колбэке передаётся [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) со свойством `code`, которое может быть
одним из значений:

<!--
values are taken from src/crypto/crypto_common.cc
description are taken from deps/openssl/openssl/crypto/x509/x509_txt.c
-->

* `'UNABLE_TO_GET_ISSUER_CERT'`: Не удалось получить сертификат издателя.
* `'UNABLE_TO_GET_CRL'`: Не удалось получить CRL сертификата.
* `'UNABLE_TO_DECRYPT_CERT_SIGNATURE'`: Не удалось расшифровать подпись
  сертификата.
* `'UNABLE_TO_DECRYPT_CRL_SIGNATURE'`: Не удалось расшифровать подпись CRL.
* `'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY'`: Не удалось декодировать открытый ключ издателя.
* `'CERT_SIGNATURE_FAILURE'`: Ошибка подписи сертификата.
* `'CRL_SIGNATURE_FAILURE'`: Ошибка подписи CRL.
* `'CERT_NOT_YET_VALID'`: Срок действия сертификата ещё не наступил.
* `'CERT_HAS_EXPIRED'`: Срок действия сертификата истёк.
* `'CRL_NOT_YET_VALID'`: Срок действия CRL ещё не наступил.
* `'CRL_HAS_EXPIRED'`: Срок действия CRL истёк.
* `'ERROR_IN_CERT_NOT_BEFORE_FIELD'`: Ошибка формата в поле notBefore
  сертификата.
* `'ERROR_IN_CERT_NOT_AFTER_FIELD'`: Ошибка формата в поле notAfter
  сертификата.
* `'ERROR_IN_CRL_LAST_UPDATE_FIELD'`: Ошибка формата в поле lastUpdate CRL.
* `'ERROR_IN_CRL_NEXT_UPDATE_FIELD'`: Ошибка формата в поле nextUpdate CRL.
* `'OUT_OF_MEM'`: Недостаточно памяти.
* `'DEPTH_ZERO_SELF_SIGNED_CERT'`: Самоподписанный сертификат.
* `'SELF_SIGNED_CERT_IN_CHAIN'`: Самоподписанный сертификат в цепочке сертификатов.
* `'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'`: Не удалось получить локальный сертификат издателя.
* `'UNABLE_TO_VERIFY_LEAF_SIGNATURE'`: Не удалось проверить подпись первого сертификата.
* `'CERT_CHAIN_TOO_LONG'`: Цепочка сертификатов слишком длинная.
* `'CERT_REVOKED'`: Сертификат отозван.
* `'INVALID_CA'`: Недопустимый сертификат УЦ.
* `'PATH_LENGTH_EXCEEDED'`: Превышено ограничение длины пути.
* `'INVALID_PURPOSE'`: Неподдерживаемое назначение сертификата.
* `'CERT_UNTRUSTED'`: Сертификат не доверен.
* `'CERT_REJECTED'`: Сертификат отклонён.
* `'HOSTNAME_MISMATCH'`: Несовпадение имени хоста.

При ошибках вроде `UNABLE_TO_VERIFY_LEAF_SIGNATURE`,
`DEPTH_ZERO_SELF_SIGNED_CERT` или `UNABLE_TO_GET_ISSUER_CERT` Node.js добавляет
подсказку: если корневой CA установлен локально, попробуйте флаг `--use-system-ca`,
чтобы направить к безопасному решению вместо небезопасных обходных путей.

## Класс: `tls.Server` {#class-tlsserver}

<!-- YAML
added: v0.3.2
-->

* Расширяет: [net.Server](net.md#class-netserver)

Принимает зашифрованные соединения по TLS или SSL.

### Событие: `'connection'`

<!-- YAML
added: v0.3.2
-->

* `socket` [`<stream.Duplex>`](stream.md#class-streamduplex)

Событие испускается при установлении нового TCP-потока, до начала рукопожатия TLS.
`socket` обычно имеет тип [`net.Socket`](net.md#class-netsocket), но не получает события так, как сокет
из [`net.Server`](net.md#class-netserver) `'connection'`. Обычно обработчик не нужен.

Пользователь может явно испустить событие, чтобы подать соединение на TLS-сервер;
тогда можно передать любой поток [`Duplex`](stream.md#class-streamduplex).

### Событие: `'keylog'`

<!-- YAML
added:
 - v12.3.0
 - v10.20.0
-->

* `line` [`<Buffer>`](buffer.md#buffer) Строка ASCII в формате NSS `SSLKEYLOGFILE`.
* `tlsSocket` [`<tls.TLSSocket>`](tls.md#class-tlstlssocket) Экземпляр `tls.TLSSocket`, для которого сгенерирован материал.

Событие `keylog` испускается при генерации или приёме ключевого материала
соединением с этим сервером (часто до завершения рукопожатия, но не обязательно).
Материал можно сохранять для отладки расшифровки трафика. Событие может
повторяться для одного сокета.

Типичный сценарий — дописывать строки в общий файл для последующего разбора в
Wireshark и т.п.:

```js
const logFile = fs.createWriteStream('/tmp/ssl-keys.log', { flags: 'a' });
// ...
server.on('keylog', (line, tlsSocket) => {
  if (tlsSocket.remoteAddress !== '...')
    return; // Only log keys for a particular IP
  logFile.write(line);
});
```

### Событие: `'newSession'`

<!-- YAML
added: v0.9.2
changes:
  - version: v0.11.12
    pr-url: https://github.com/nodejs/node-v0.x-archive/pull/7118
    description: The `callback` argument is now supported.
-->

Добавлено в: v0.9.2

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v0.11.12 | Аргумент обратного вызова теперь поддерживается. |

Событие `'newSession'` испускается при создании нового TLS-сеанса; данные можно
сохранять во внешнем хранилище и передавать в колбэк [`'resumeSession'`](#event-resumesession).

Обработчику передаются три аргумента:

* `sessionId` [`<Buffer>`](buffer.md#buffer) Идентификатор TLS-сеанса
* `sessionData` [`<Buffer>`](buffer.md#buffer) Данные TLS-сеанса
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция без аргументов, которую нужно вызвать, чтобы
  начать передачу данных по защищённому соединению

Обработчик влияет только на соединения, установленные после его регистрации.

### Событие: `'OCSPRequest'`

<!-- YAML
added: v0.11.13
-->

Событие `'OCSPRequest'` испускается, когда клиент запрашивает статус сертификата.
Обработчику передаются три аргумента:

* `certificate` [`<Buffer>`](buffer.md#buffer) Сертификат сервера
* `issuer` [`<Buffer>`](buffer.md#buffer) Сертификат издателя
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Колбэк для передачи результата запроса OCSP

Текущий сертификат сервера можно разобрать, чтобы получить URL OCSP и ID
сертификата; после получения ответа OCSP вызывают `callback(null, resp)`, где
`resp` — `Buffer` с ответом OCSP. И `certificate`, и `issuer` — DER в `Buffer`;
по ним находят ID и URL OCSP.

Вместо ответа можно вызвать `callback(null, null)`.

Вызов `callback(err)` приведёт к `socket.destroy(err)`.

Типичный сценарий:

1. Клиент подключается и отправляет запрос статуса (расширение в ClientHello).
2. Сервер получает запрос и испускает `'OCSPRequest'`.
3. Сервер извлекает URL OCSP из `certificate` или `issuer` и выполняет [запрос OCSP][OCSP request] к УЦ.
4. Сервер получает ответ и передаёт клиенту через `callback`.
5. Клиент проверяет ответ и либо закрывает сокет, либе продолжает рукопожатие.

`issuer` может быть `null`, если сертификат самоподписанный или издателя нет в
списке корневых (издателя можно задать опцией `ca` при установлении TLS).

Обработчик влияет только на соединения после его регистрации.

Для разбора сертификатов можно использовать пакет вроде [asn1.js][asn1.js].

### Событие: `'resumeSession'`

<!-- YAML
added: v0.9.2
-->

Событие `'resumeSession'` испускается, когда клиент просит возобновить предыдущий
TLS-сеанс. Обработчику передаются два аргумента:

* `sessionId` [`<Buffer>`](buffer.md#buffer) Идентификатор TLS-сеанса
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после восстановления сеанса:
  `callback([err[, sessionData]])`
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `sessionData` [`<Buffer>`](buffer.md#buffer)

Нужно найти `sessionData` во внешнем хранилище по `sessionId` (как сохранено в
`'newSession'`). Если найдено — `callback(null, sessionData)`; если нет —
вызвать `callback()` без `sessionData`, чтобы продолжить рукопожатие и создать
новый сеанс. Можно вызвать `callback(err)`, чтобы разорвать входящее соединение.

Обработчик влияет только на соединения после его регистрации.

Пример:

```js
const tlsSessionStore = {};
server.on('newSession', (id, data, cb) => {
  tlsSessionStore[id.toString('hex')] = data;
  cb();
});
server.on('resumeSession', (id, cb) => {
  cb(null, tlsSessionStore[id.toString('hex')] || null);
});
```

### Событие: `'secureConnection'`

<!-- YAML
added: v0.3.2
-->

Событие `'secureConnection'` испускается после успешного рукопожатия для нового
соединения. Обработчику передаётся один аргумент:

* `tlsSocket` [`<tls.TLSSocket>`](tls.md#class-tlstlssocket) Установленный TLS-сокет.

`tlsSocket.authorized` — `boolean`: прошёл ли клиент проверку одним из
переданных для сервера УЦ. Если `false`, в `socket.authorizationError` описана
причина. В зависимости от настроек сервера неавторизованные соединения могут
всё же приниматься.

`tlsSocket.alpnProtocol` — выбранный протокол ALPN; если расширение ALPN не
использовалось, значение `false`.

`tlsSocket.servername` — имя сервера из SNI.

### Событие: `'tlsClientError'`

<!-- YAML
added: v6.0.0
-->

Событие `'tlsClientError'` испускается при ошибке до установления защищённого
соединения. Два аргумента:

* `exception` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект ошибки
* `tlsSocket` [`<tls.TLSSocket>`](tls.md#class-tlstlssocket) Сокет, с которого пришла ошибка

### `server.addContext(hostname, context)`

<!-- YAML
added: v0.5.3
-->

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для SNI или шаблон (например `'*'`)
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<tls.SecureContext>`](tls.md#tlscreatesecurecontextoptions) Свойства из опций [`tls.createSecureContext()`](#tlscreatesecurecontextoptions)
  (`key`, `cert`, `ca` и т.д.) или готовый контекст от [`tls.createSecureContext()`](#tlscreatesecurecontextoptions)

`server.addContext()` добавляет контекст, который используется, если SNI клиента
совпадает с `hostname` (или шаблоном). При нескольких совпадениях берётся
последний добавленный.

### `server.address()`

<!-- YAML
added: v0.6.0
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает привязанный адрес, семейство и порт, как сообщает ОС. См.
[`net.Server.address()`](net.md#serveraddress).

### `server.close([callback])`

<!-- YAML
added: v0.3.2
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Будет зарегистрирован на событие `'close'` сервера
* Возвращает: [`<tls.Server>`](#class-tlsserver)

`server.close()` прекращает приём новых соединений. Работает асинхронно; событие
`'close'` придёт, когда не останется открытых соединений.

### `server.getTicketKeys()`

<!-- YAML
added: v3.0.0
-->

* Возвращает: [`<Buffer>`](buffer.md#buffer) Буфер из 48 байт с ключами session ticket

Возвращает ключи билетов сеанса. См. [возобновление сеанса][Session Resumption].

### `server.listen()`

Запускает прослушивание зашифрованных соединений. Аналогично [`server.listen()`](net.md#serverlisten)
у [`net.Server`](net.md#class-netserver).

### `server.setSecureContext(options)`

<!-- YAML
added: v11.0.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Свойства опций [`tls.createSecureContext()`](#tlscreatesecurecontextoptions) (`key`, `cert`, `ca` и т.д.)

`server.setSecureContext()` заменяет защищённый контекст сервера; уже установленные
соединения не разрываются.

### `server.setTicketKeys(keys)`

<!-- YAML
added: v3.0.0
-->

* `keys` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Буфер из 48 байт с ключами билетов

Задаёт ключи билетов; действуют для новых подключений, текущие используют
предыдущие ключи. См. [возобновление сеанса][Session Resumption].

## Класс: `tls.TLSSocket` {#class-tlstlssocket}

<!-- YAML
added: v0.11.4
-->

* Расширяет: [net.Socket](net.md#class-netsocket)

Прозрачно шифрует записываемые данные и выполняет согласование TLS.

Экземпляры `tls.TLSSocket` реализуют дуплексный интерфейс [Stream][Stream].

Метаданные соединения (например [`tls.TLSSocket.getPeerCertificate()`](#tlssocketgetpeercertificatedetailed)) доступны,
пока соединение открыто.

### `new tls.TLSSocket(socket[, options])`

<!-- YAML
added: v0.11.4
changes:
  - version: v12.2.0
    pr-url: https://github.com/nodejs/node/pull/27497
    description: The `enableTrace` option is now supported.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2564
    description: ALPN options are supported now.
-->

Добавлено в: v0.11.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v12.2.0 | Опция `enableTrace` теперь поддерживается. |
    | v5.0.0 | Опции ALPN теперь поддерживаются. |

* `socket` [`<net.Socket>`](net.md#class-netsocket) | [`<stream.Duplex>`](stream.md#class-streamduplex)
  На сервере — любой `Duplex`. На клиенте — обычно [`net.Socket`](net.md#class-netsocket); для произвольного
  `Duplex` на клиенте используйте [`tls.connect()`](#tlsconnectoptions-callback).
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `enableTrace`: см. [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener)
  * `isServer`: протокол SSL/TLS асимметричен; при `true` сокет создаётся как сервер.
    **По умолчанию:** `false`.
  * `server` [`<net.Server>`](net.md#class-netserver) Экземпляр [`net.Server`](net.md#class-netserver)
  * `requestCert`: запрашивать ли сертификат у удалённой стороны. Клиенты всегда
    запрашивают сертификат сервера; сервер (`isServer === true`) может запросить
    сертификат клиента.
  * `rejectUnauthorized`: см. [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener)
  * `ALPNProtocols`: см. [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener)
  * `SNICallback`: см. [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener)
  * `ALPNCallback`: см. [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener)
  * `session` [`<Buffer>`](buffer.md#buffer) Экземпляр `Buffer` с TLS-сеансом
  * `requestOCSP` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` в ClientHello добавляется запрос статуса OCSP,
    а событие `'OCSPResponse'` испускается на сокете до установления защищённого канала
  * `secureContext`: контекст от [`tls.createSecureContext()`](#tlscreatesecurecontextoptions). Если не задан,
    создаётся вызовом `tls.createSecureContext()` с полным объектом `options`.
  * ...: опции [`tls.createSecureContext()`](#tlscreatesecurecontextoptions), если `secureContext` не передан;
    иначе игнорируются.

Создаёт новый `tls.TLSSocket` поверх существующего TCP-сокета.

### Событие: `'keylog'`

<!-- YAML
added:
 - v12.3.0
 - v10.20.0
-->

* `line` [`<Buffer>`](buffer.md#buffer) Строка ASCII в формате NSS `SSLKEYLOGFILE`.

На `tls.TLSSocket` событие `keylog` испускается при генерации или приёме
ключевого материала; его можно сохранять для отладки расшифровки трафика. Может
повторяться до или после завершения рукопожатия.

Типичный сценарий — писать строки в файл для разбора в Wireshark:

```js
const logFile = fs.createWriteStream('/tmp/ssl-keys.log', { flags: 'a' });
// ...
tlsSocket.on('keylog', (line) => logFile.write(line));
```

### Событие: `'OCSPResponse'`

<!-- YAML
added: v0.11.13
-->

Событие `'OCSPResponse'` испускается, если при создании `tls.TLSSocket` была
задана опция `requestOCSP` и получен ответ OCSP. Обработчику передаётся один
аргумент:

* `response` [`<Buffer>`](buffer.md#buffer) Ответ OCSP сервера

Обычно это подписанный объект от УЦ со сведениями об отзыве сертификата сервера.

### Событие: `'secure'`

<!-- YAML
added: v0.11.4
-->

Событие `'secure'` испускается после успешного рукопожатия TLS и установления
защищённого соединения. Испускается и на клиенте, и на сервере для
`tls.TLSSocket`, в том числе созданных через `new tls.TLSSocket()`.

### Событие: `'secureConnect'`

<!-- YAML
added: v0.11.4
-->

Событие `'secureConnect'` испускается после успешного рукопожатия нового
соединения. Колбэк вызывается независимо от того, авторизован ли сертификат
сервера: клиенту нужно проверить `tlsSocket.authorized`. При `false` смотрите
`tlsSocket.authorizationError`. При использовании ALPN проверьте
`tlsSocket.alpnProtocol`.

Событие не испускается для сокета, созданного только через `new tls.TLSSocket()`
без сценария подключения клиента.

### Событие: `'session'`

<!-- YAML
added: v11.10.0
-->

* `session` [`<Buffer>`](buffer.md#buffer)

На клиентском `tls.TLSSocket` событие `'session'` испускается при появлении
нового сеанса или TLS-билета; момент относительно завершения рукопожатия зависит
от версии протокола. На сервере не испускается; не испускается при простом
возобновлении без нового сеанса. Для некоторых версий протокола событие может
повторяться — все полученные сеансы можно использовать для возобновления.

Клиент может передать `session` в опцию `session` вызова [`tls.connect()`](#tlsconnectoptions-callback).

См. [возобновление сеанса][Session Resumption].

В TLSv1.2 и ниже после рукопожатия можно вызвать [`tls.TLSSocket.getSession()`](#tlssocketgetsession).
В TLSv1.3 допускается только возобновление по билетам; билеты приходят после
рукопожатия, поэтому для переносимости лучше полагаться на событие `'session'`, а
не только на `getSession()`. Если нужен один сеанс — подпишитесь один раз:

```js
tlsSocket.once('session', (session) => {
  // The session can be used immediately or later.
  tls.connect({
    session: session,
    // Other connect options...
  });
});
```

### `tlsSocket.address()`

<!-- YAML
added: v0.11.4
changes:
  - version: v18.4.0
    pr-url: https://github.com/nodejs/node/pull/43054
    description: The `family` property now returns a string instead of a number.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41431
    description: The `family` property now returns a number instead of a string.
-->

Добавлено в: v0.11.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.4.0 | Свойство Family теперь возвращает строку вместо числа. |
    | v18.0.0 | Свойство Family теперь возвращает число вместо строки. |

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает привязанный `address`, имя `family` и `port` нижележащего сокета, как
сообщает ОС:
`{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`.

### `tlsSocket.authorizationError`

<!-- YAML
added: v0.11.4
-->

Причина, по которой сертификат пира не прошёл проверку. Заполняется только при
`tlsSocket.authorized === false`.

### `tlsSocket.authorized`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если сертификат пира подписан одним из указанных при создании `tls.TLSSocket`
ЦС, иначе `false`.

### `tlsSocket.disableRenegotiation()`

<!-- YAML
added: v8.4.0
-->

Отключает пересогласование TLS для этого `TLSSocket`. После вызова попытки
пересогласования приводят к событию `'error'` на `TLSSocket`.

### `tlsSocket.enableTrace()`

<!-- YAML
added: v12.2.0
-->

При включении трассировка TLS-пакетов пишется в `stderr` — удобно для отладки.

Формат совпадает с выводом `openssl s_client -trace` или `openssl s_server -trace`.
Генерируется через `SSL_trace()` в OpenSSL: формат не задокументирован, может
меняться и не является стабильным контрактом.

### `tlsSocket.encrypted`

<!-- YAML
added: v0.11.4
-->

Всегда возвращает `true`; можно отличить TLS-сокеты от обычных `net.Socket`.

### `tlsSocket.exportKeyingMaterial(length, label[, context])`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

* `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт ключевого материала

* `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метка приложения, обычно из
  [IANA Exporter Label Registry](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#exporter-labels).

* `context` [`<Buffer>`](buffer.md#buffer) Необязательный контекст.

* Возвращает: [`<Buffer>`](buffer.md#buffer) Запрошенные байты ключевого материала

Ключевой материал используется для проверок, снижающих риск атак в сетевых
протоколах (например IEEE 802.1X).

Пример

```js
const keyingMaterial = tlsSocket.exportKeyingMaterial(
  128,
  'client finished');

/*
 Example return value of keyingMaterial:
 <Buffer 76 26 af 99 c5 56 8e 42 09 91 ef 9f 93 cb ad 6c 7b 65 f8 53 f1 d8 d9
    12 5a 33 b8 b5 25 df 7b 37 9f e0 e2 4f b8 67 83 a3 2f cd 5d 41 42 4c 91
    74 ef 2c ... 78 more bytes>
*/
```

См. документацию OpenSSL [`SSL_export_keying_material`](https://www.openssl.org/docs/man1.1.1/man3/SSL_export_keying_material.html).

### `tlsSocket.getCertificate()`

<!-- YAML
added: v11.2.0
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект локального сертификата; свойства соответствуют полям сертификата.

Пример структуры — в [`tls.TLSSocket.getPeerCertificate()`](#tlssocketgetpeercertificatedetailed).

Если локального сертификата нет — пустой объект. Если сокет уничтожен — `null`.

### `tlsSocket.getCipher()`

<!-- YAML
added: v0.11.4
changes:
  - version:
     - v13.4.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30637
    description: Return the IETF cipher name as `standardName`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26625
    description: Return the minimum cipher version, instead of a fixed string
      (`'TLSv1/SSLv3'`).
-->

Добавлено в: v0.11.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.4.0, v12.16.0 | Верните имя шифра IETF как `standardName`. |
    | v12.0.0 | Возвращает минимальную версию шифра вместо фиксированной строки (TLSv1/SSLv3). |

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя набора шифров в OpenSSL.
  * `standardName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя набора шифров по IETF.
  * `version` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Минимальная версия TLS, поддерживаемая этим набором.
    Фактически согласованный протокол — в [`tls.TLSSocket.getProtocol()`](#tlssocketgetprotocol).

Сведения о согласованном наборе шифров.

Например, TLSv1.2 с AES256-SHA:

```json
{
    "name": "AES256-SHA",
    "standardName": "TLS_RSA_WITH_AES_256_CBC_SHA",
    "version": "SSLv3"
}
```

Подробнее см.
[SSL\_CIPHER\_get\_name](https://www.openssl.org/docs/man1.1.1/man3/SSL_CIPHER_get_name.html).

### `tlsSocket.getEphemeralKeyInfo()`

<!-- YAML
added: v5.0.0
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Тип, имя и размер параметра эфемерного обмена ключами ([perfect forward secrecy][perfect forward secrecy])
на клиентском соединении. Пустой объект, если обмен не эфемерный. На серверном
сокете возвращает `null` (поддерживается только клиент). Типы: `'DH'` и `'ECDH'`;
поле `name` только при типе `'ECDH'`.

Пример: `{ type: 'ECDH', name: 'prime256v1', size: 256 }`.

### `tlsSocket.getFinished()`

<!-- YAML
added: v9.9.0
-->

* Возвращает: [`<Buffer>`](buffer.md#buffer) | undefined Последнее сообщение `Finished`, отправленное
  на сокет в ходе рукопожатия SSL/TLS, либо `undefined`, если сообщение
  `Finished` ещё не отправлялось.

Сообщения `Finished` — это дайджесты всего рукопожатия (всего 192 бита для TLS 1.0
и больше для SSL 3.0); их можно использовать во внешних процедурах аутентификации,
когда встроенной аутентификации SSL/TLS недостаточно или она не подходит.

Соответствует функции `SSL_get_finished` в OpenSSL и может использоваться для
реализации привязки канала `tls-unique` из [RFC 5929][RFC 5929].

### `tlsSocket.getPeerCertificate([detailed])`

<!-- YAML
added: v0.11.4
-->

* `detailed` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` — полная цепочка сертификатов, иначе только
  сертификат пира.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект сертификата.

Объект сертификата пира. Если пир не передал сертификат — пустой объект. Если
сокет уничтожен — `null`.

При запросе полной цепочки у каждого сертификата есть `issuerCertificate` —
объект сертификата издателя.

#### Объект сертификата

<!-- YAML
changes:
  - version:
      - v19.1.0
      - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/44935
    description: Add "ca" property.
  - version:
      - v17.2.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/39809
    description: Add fingerprint512.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/24358
    description: Support Elliptic Curve public key info.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.1.0, v18.13.0 | Добавьте свойство «ca». |
    | v17.2.0, v16.14.0 | Добавьте отпечаток пальца 512. |
    | v11.4.0 | Поддержка информации об открытом ключе эллиптической кривой. |

Свойства объекта соответствуют полям сертификата.

* `ca` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` для центра сертификации (CA), иначе `false`.
* `raw` [`<Buffer>`](buffer.md#buffer) Данные сертификата X.509 в кодировке DER.
* `subject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Субъект: Country (`C`), StateOrProvince (`ST`), Locality (`L`),
  Organization (`O`), OrganizationalUnit (`OU`), CommonName (`CN`). Для TLS
  `CN` обычно — DNS-имя. Пример:
  `{C: 'UK', ST: 'BC', L: 'Metro', O: 'Node Fans', OU: 'Docs', CN: 'example.com'}`.
* `issuer` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Издатель, в тех же полях, что и `subject`.
* `valid_from` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Начало срока действия.
* `valid_to` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Конец срока действия.
* `serialNumber` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Серийный номер в hex. Пример: `'B9B0D332A1AA5635'`.
* `fingerprint` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) SHA-1 от DER, строка с `:` между байтами в hex.
* `fingerprint256` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) SHA-256 от DER, формат с `:`.
* `fingerprint512` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) SHA-512 от DER, формат с `:`.
* `ext_key_usage` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) (необяз.) Расширенное использование ключа, набор OID.
* `subjectaltname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (необяз.) Альтернативные имена субъекта.
* `infoAccess` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) (необяз.) AuthorityInfoAccess для OCSP.
* `issuerCertificate` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) (необяз.) Сертификат издателя; у самоподписанных
  возможна циклическая ссылка.

В зависимости от типа ключа могут быть поля открытого ключа.

Для RSA:

* `bits` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер ключа в битах. Пример: `1024`.
* `exponent` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Экспонента в hex-записи. Пример: `'0x010001'`.
* `modulus` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Модуль в hex. Пример: `'B56CE45CB7...'`.
* `pubkey` [`<Buffer>`](buffer.md#buffer) Открытый ключ.

Для EC:

* `pubkey` [`<Buffer>`](buffer.md#buffer) Открытый ключ.
* `bits` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер в битах. Пример: `256`.
* `asn1Curve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (необяз.) Имя ASN.1 OID кривой. Пример: `'prime256v1'`.
* `nistCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (необяз.) Имя кривой NIST, если есть. Пример: `'P-256'`.

Пример сертификата:

<!-- eslint-skip -->

```js
{ subject:
   { OU: [ 'Domain Control Validated', 'PositiveSSL Wildcard' ],
     CN: '*.nodejs.org' },
  issuer:
   { C: 'GB',
     ST: 'Greater Manchester',
     L: 'Salford',
     O: 'COMODO CA Limited',
     CN: 'COMODO RSA Domain Validation Secure Server CA' },
  subjectaltname: 'DNS:*.nodejs.org, DNS:nodejs.org',
  infoAccess:
   { 'CA Issuers - URI':
      [ 'http://crt.comodoca.com/COMODORSADomainValidationSecureServerCA.crt' ],
     'OCSP - URI': [ 'http://ocsp.comodoca.com' ] },
  modulus: 'B56CE45CB740B09A13F64AC543B712FF9EE8E4C284B542A1708A27E82A8D151CA178153E12E6DDA15BF70FFD96CB8A88618641BDFCCA03527E665B70D779C8A349A6F88FD4EF6557180BD4C98192872BCFE3AF56E863C09DDD8BC1EC58DF9D94F914F0369102B2870BECFA1348A0838C9C49BD1C20124B442477572347047506B1FCD658A80D0C44BCC16BC5C5496CFE6E4A8428EF654CD3D8972BF6E5BFAD59C93006830B5EB1056BBB38B53D1464FA6E02BFDF2FF66CD949486F0775EC43034EC2602AEFBF1703AD221DAA2A88353C3B6A688EFE8387811F645CEED7B3FE46E1F8B9F59FAD028F349B9BC14211D5830994D055EEA3D547911E07A0ADDEB8A82B9188E58720D95CD478EEC9AF1F17BE8141BE80906F1A339445A7EB5B285F68039B0F294598A7D1C0005FC22B5271B0752F58CCDEF8C8FD856FB7AE21C80B8A2CE983AE94046E53EDE4CB89F42502D31B5360771C01C80155918637490550E3F555E2EE75CC8C636DDE3633CFEDD62E91BF0F7688273694EEEBA20C2FC9F14A2A435517BC1D7373922463409AB603295CEB0BB53787A334C9CA3CA8B30005C5A62FC0715083462E00719A8FA3ED0A9828C3871360A73F8B04A4FC1E71302844E9BB9940B77E745C9D91F226D71AFCAD4B113AAF68D92B24DDB4A2136B55A1CD1ADF39605B63CB639038ED0F4C987689866743A68769CC55847E4A06D6E2E3F1',
  exponent: '0x10001',
  pubkey: <Buffer ... >,
  valid_from: 'Aug 14 00:00:00 2017 GMT',
  valid_to: 'Nov 20 23:59:59 2019 GMT',
  fingerprint: '01:02:59:D9:C3:D2:0D:08:F7:82:4E:44:A4:B4:53:C5:E2:3A:87:4D',
  fingerprint256: '69:AE:1A:6A:D4:3D:C6:C1:1B:EA:C6:23:DE:BA:2A:14:62:62:93:5C:7A:EA:06:41:9B:0B:BC:87:CE:48:4E:02',
  fingerprint512: '19:2B:3E:C3:B3:5B:32:E8:AE:BB:78:97:27:E4:BA:6C:39:C9:92:79:4F:31:46:39:E2:70:E5:5F:89:42:17:C9:E8:64:CA:FF:BB:72:56:73:6E:28:8A:92:7E:A3:2A:15:8B:C2:E0:45:CA:C3:BC:EA:40:52:EC:CA:A2:68:CB:32',
  ext_key_usage: [ '1.3.6.1.5.5.7.3.1', '1.3.6.1.5.5.7.3.2' ],
  serialNumber: '66593D57F20CBC573E433381B5FEC280',
  raw: <Buffer ... > }
```

### `tlsSocket.getPeerFinished()`

<!-- YAML
added: v9.9.0
-->

* Возвращает: [`<Buffer>`](buffer.md#buffer) | undefined Последнее ожидаемое или полученное сообщение
  `Finished` в рукопожатии SSL/TLS, либо `undefined`, если его ещё не было.

Сообщения `Finished` — дайджесты всего рукопожатия (192 бита для TLS 1.0 и больше
для SSL 3.0), их можно использовать для внешней аутентификации, если встроенной
недостаточно.

Соответствует `SSL_get_peer_finished` в OpenSSL; подходит для привязки канала
`tls-unique` из [RFC 5929][RFC 5929].

### `tlsSocket.getPeerX509Certificate()`

<!-- YAML
added: v15.9.0
-->

* Возвращает: [`<X509Certificate>`](crypto.md)

Сертификат пира как объект [X509Certificate](crypto.md).

Если сертификата нет или сокет уничтожен — `undefined`.

### `tlsSocket.getProtocol()`

<!-- YAML
added: v5.7.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строка с согласованной версией SSL/TLS. Для подключённых сокетов без завершённого
рукопожатия — `'unknown'`. Для серверных сокетов или отключённого клиента — `null`.

Версии протокола:

* `'SSLv3'`
* `'TLSv1'`
* `'TLSv1.1'`
* `'TLSv1.2'`
* `'TLSv1.3'`

См. документацию OpenSSL [`SSL_get_version`](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html).

### `tlsSocket.getSession()`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<Buffer>`](buffer.md#buffer)

Данные TLS-сессии или `undefined`, если сессия не согласована. На клиенте их
можно передать в опцию `session` [`tls.connect()`](#tlsconnectoptions-callback) для возобновления. На сервере
полезно для отладки.

См. [возобновление сеанса][Session Resumption].

`getSession()` только для TLSv1.2 и ниже. Для TLSv1.3 используйте событие [`'session'`](#event-session)
(оно же подходит для TLSv1.2 и ниже).

### `tlsSocket.getSharedSigalgs()`

<!-- YAML
added: v12.11.0
-->

* Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Общие алгоритмы подписи сервера и клиента по убыванию предпочтения.

Подробнее см.
[SSL\_get\_shared\_sigalgs](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_shared_sigalgs.html).

### `tlsSocket.getTLSTicket()`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<Buffer>`](buffer.md#buffer)

На клиенте — билет сессии TLS, если есть, иначе `undefined`. На сервере всегда
`undefined`.

Полезно для отладки.

См. [возобновление сеанса][Session Resumption].

### `tlsSocket.getX509Certificate()`

<!-- YAML
added: v15.9.0
-->

* Возвращает: [`<X509Certificate>`](crypto.md)

Локальный сертификат как [X509Certificate](crypto.md).

Если локального сертификата нет или сокет уничтожен — `undefined`.

### `tlsSocket.isSessionReused()`

<!-- YAML
added: v0.5.6
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если сеанс был повторно использован, иначе `false`.

Подробнее см. [возобновление сеанса][Session Resumption].

### `tlsSocket.localAddress`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление локального IP.

### `tlsSocket.localPort`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Числовой локальный порт.

### `tlsSocket.remoteAddress`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление удалённого IP, например `'74.125.127.100'` или
`'2001:4860:a005::68'`.

### `tlsSocket.remoteFamily`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Семейство удалённого IP: `'IPv4'` или `'IPv6'`.

### `tlsSocket.remotePort`

<!-- YAML
added: v0.11.4
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Числовой удалённый порт, например `443`.

### `tlsSocket.renegotiate(options, callback)`

<!-- YAML
added: v0.11.8
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.11.8

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `rejectUnauthorized` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если не `false`, сертификат сервера проверяется
    по списку ЦС. При ошибке — событие `'error'`, `err.code` — код OpenSSL.
    **По умолчанию:** `true`.
  * `requestCert` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Запрашивать ли сертификат у пира при пересогласовании.
    **По умолчанию:** `false`.

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Если `renegotiate()` вернул `true`, `callback` один раз
  привязывается к [`'secure'`](#event-secure). Если `false` — вызов на следующем тике с ошибкой,
  если сокет не уничтожен.

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если пересогласование начато, иначе `false`.

`tlsSocket.renegotiate()` запускает пересогласование TLS. По завершении в `callback`
передаётся `Error` при сбое или `null`.

Можно запросить сертификат пира после установления защищённого соединения.

На стороне сервера сокет будет уничтожен с ошибкой по таймауту `handshakeTimeout`.

В TLSv1.3 пересогласование не поддерживается протоколом.

### `tlsSocket.setKeyCert(context)`

<!-- YAML
added:
  - v22.5.0
  - v20.17.0
-->

* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<tls.SecureContext>`](tls.md#tlscreatesecurecontextoptions) Объект как минимум с `key` и `cert` из опций
  [`tls.createSecureContext()`](#tlscreatesecurecontextoptions), либо готовый контекст из [`tls.createSecureContext()`](#tlscreatesecurecontextoptions).

`tlsSocket.setKeyCert()` задаёт закрытый ключ и сертификат для сокета. Удобно для
выбора сертификата сервера в `ALPNCallback`.

### `tlsSocket.setMaxSendFragment(size)`

<!-- YAML
added: v0.11.11
-->

* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер TLS-фрагмента, не больше `16384`.
  **По умолчанию:** `16384`.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Задаёт максимальный размер TLS-фрагмента. `true`, если лимит установлен, иначе `false`.

Меньшие фрагменты снижают задержку буферизации на клиенте: крупные фрагменты
держатся в TLS до полной проверки целостности и могут тянуться через несколько
RTT. Меньшие фрагменты добавляют накладные байты и нагрузку на CPU и могут снизить
пропускную способность сервера.

## `tls.checkServerIdentity(hostname, cert)`

<!-- YAML
added: v0.8.4
changes:
  - version:
      - v17.3.1
      - v16.13.2
      - v14.18.3
      - v12.22.9
    pr-url: https://github.com/nodejs-private/node-private/pull/300
    description: Support for `uniformResourceIdentifier` subject alternative
                 names has been disabled in response to CVE-2021-44531.
-->

Добавлено в: v0.8.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.3.1, v16.13.2, v14.18.3, v12.22.9 | Поддержка альтернативных имен субъектов uniformResourceIdentifier отключена в ответ на CVE-2021-44531. |

* `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста или IP для проверки сертификата.
* `cert` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Объект сертификата][certificate object] пира.
* Возвращает: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | undefined

Проверяет, что сертификат `cert` выдан для `hostname`.

При ошибке возвращает объект `Error` с полями `reason`, `host` и `cert`. При успехе —
`undefined`.

Предназначена для опции `checkServerIdentity` в [`tls.connect()`](#tlsconnectoptions-callback) и работы с
[объектом сертификата][certificate object]. В других случаях рассмотрите
[`x509.checkHost()`](crypto.md#x509checkhostname-options).

Её можно заменить, передав свою функцию в `options.checkServerIdentity` для
`tls.connect()`; внутри можно вызывать `tls.checkServerIdentity()` и добавлять проверки.

Вызывается только если сертификат уже прошёл остальные проверки (например доверенный ЦС в `options.ca`).

В старых версиях Node.js ошибочно принимались сертификаты при совпадении
`uniformResourceIdentifier` в SAN ([CVE-2021-44531][CVE-2021-44531]). Если нужно принимать URI,
реализуйте это в своей `checkServerIdentity`.

## `tls.connect(options[, callback])`

<!-- YAML
added: v0.11.3
changes:
  - version:
      - v15.1.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/35753
    description: Added `onread` option.
  - version:
      - v14.1.0
      - v13.14.0
    pr-url: https://github.com/nodejs/node/pull/32786
    description: The `highWaterMark` option is accepted now.
  - version:
      - v13.6.0
      - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/23188
    description: The `pskCallback` option is now supported.
  - version: v12.9.0
    pr-url: https://github.com/nodejs/node/pull/27836
    description: Support the `allowHalfOpen` option.
  - version: v12.4.0
    pr-url: https://github.com/nodejs/node/pull/27816
    description: The `hints` option is now supported.
  - version: v12.2.0
    pr-url: https://github.com/nodejs/node/pull/27497
    description: The `enableTrace` option is now supported.
  - version:
      - v11.8.0
      - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/25517
    description: The `timeout` option is supported now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12839
    description: The `lookup` option is supported now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11984
    description: The `ALPNProtocols` option can be a `TypedArray` or
     `DataView` now.
  - version:
      - v5.3.0
      - v4.7.0
    pr-url: https://github.com/nodejs/node/pull/4246
    description: The `secureContext` option is supported now.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2564
    description: ALPN options are supported now.
-->

Добавлено в: v0.11.3

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.1.0, v14.18.0 | Добавлена ​​опция onread. |
    | v14.1.0, v13.14.0 | Опция `highWaterMark` теперь принята. |
    | v13.6.0, v12.16.0 | Опция `pskCallback` теперь поддерживается. |
    | v12.9.0 | Поддержите опциюallowHalfOpen. |
    | v12.4.0 | Опция `подсказки` теперь поддерживается. |
    | v12.2.0 | Опция `enableTrace` теперь поддерживается. |
    | v11.8.0, v10.16.0 | Опция `timeout` теперь поддерживается. |
    | v8.0.0 | Опция `поиск` теперь поддерживается. |
    | v8.0.0 | Параметр ALPNProtocols теперь может быть TypedArray или DataView. |
    | v5.3.0, v4.7.0 | Опция `secureContext` теперь поддерживается. |
    | v5.0.0 | Опции ALPN теперь поддерживаются. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `enableTrace`: см. [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener)
  * `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост, к которому должен подключаться клиент. **По умолчанию:**
    `'localhost'`.
  * `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт, к которому должен подключаться клиент.
  * `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Создаёт соединение через Unix-сокет по указанному пути. Если задана эта опция,
    `host` и `port` игнорируются.
  * `socket` [`<stream.Duplex>`](stream.md#class-streamduplex) Устанавливает защищённое соединение поверх заданного сокета
    вместо создания нового. Обычно это экземпляр
    [`net.Socket`](net.md#class-netsocket), но допустим любой поток `Duplex`.
    Если задана эта опция, `path`, `host` и `port` игнорируются,
    кроме проверки сертификата. Обычно сокет уже подключён
    к моменту передачи в `tls.connect()`, но подключение может быть выполнено позже.
    Подключение, отключение и уничтожение `socket` — ответственность пользователя;
    вызов `tls.connect()` не приводит к вызову `net.connect()`.
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, запись на сокете
    завершается автоматически при окончании чтения. Если задана опция
    `socket`, эта опция не действует. Подробнее — опция `allowHalfOpen`
    у [`net.Socket`](net.md#class-netsocket). **По умолчанию:** `false`.
  * `rejectUnauthorized` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если не `false`, сертификат сервера
    проверяется по списку переданных УЦ. При ошибке проверки испускается событие `'error'`;
    `err.code` содержит код ошибки OpenSSL. **По умолчанию:**
    `true`.
  * `pskCallback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Для согласования TLS-PSK см. [предварительно разделённые ключи][Pre-shared keys].
  * `ALPNProtocols` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Массив строк
    либо один `Buffer`, `TypedArray` или `DataView` с поддерживаемыми
    протоколами ALPN. У буферов формат `[len][name][len][name]...`,
    например `'\x08http/1.1\x08http/1.0'`, где байт `len` — длина следующего
    имени протокола. Проще передать массив, например
    `['http/1.1', 'http/1.0']`. Протоколы в начале списка имеют больший
    приоритет, чем идущие дальше.
  * `servername` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сервера для расширения TLS SNI (Server Name Indication).
    Это имя хоста, к которому выполняется подключение; должно быть именем хоста,
    а не IP-адресом. Многодомный сервер может использовать его для выбора
    нужного сертификата для клиента; см. опцию `SNICallback` у [`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener).
  * `checkServerIdentity(servername, cert)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов
    вместо встроенной `tls.checkServerIdentity()` при проверке имени хоста сервера
    (или переданного явно `servername`) по сертификату. Должен вернуть [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), если
    проверка не прошла. Должен вернуть `undefined`, если `servername`
    и `cert` успешно проверены.
  * `session` [`<Buffer>`](buffer.md#buffer) Экземпляр `Buffer` с данными TLS-сеанса.
  * `requestOCSP` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, в ClientHello добавляется запрос статуса OCSP
    и до установления защищённого канала на сокете испускается событие `'OCSPResponse'`.
  * `minDHSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальный размер параметра DH в битах для принятия
    TLS-соединения. Если сервер предлагает параметр DH меньше
    `minDHSize`, TLS-соединение разрушается и выбрасывается ошибка.
    **По умолчанию:** `1024`.
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Как у потока чтения, параметр `highWaterMark`.
    **По умолчанию:** `16 * 1024`.
  * `timeout`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задано и сокет создаётся внутри, после создания сокета,
    но до начала подключения, будет вызван [`socket.setTimeout(timeout)`](net.md#socketsettimeouttimeout-callback).
  * `secureContext`: объект TLS-контекста, созданный через
    [`tls.createSecureContext()`](#tlscreatesecurecontextoptions). Если `secureContext` _не_ передан, он
    создаётся передачей всего объекта `options` в
    `tls.createSecureContext()`.
  * `onread` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если опция `socket` отсутствует, входящие данные
    накапливаются в одном `buffer` и передаются в указанный `callback` при
    поступлении данных на сокет; иначе опция игнорируется. См. опцию
    `onread` у [`net.Socket`](net.md#class-netsocket).
  * ...: опции [`tls.createSecureContext()`](#tlscreatesecurecontextoptions), используемые, если опция
    `secureContext` отсутствует; иначе игнорируются.
  * ...: любые опции [`socket.connect()`](net.md#socketconnectoptions-connectlistener), не перечисленные выше.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

Функция `callback`, если указана, добавляется как обработчик события
[`'secureConnect'`](#event-secureconnect).

`tls.connect()` возвращает объект [`tls.TLSSocket`](#class-tlstlssocket).

В отличие от API `https`, `tls.connect()` по умолчанию не включает
расширение SNI (Server Name Indication), из‑за чего некоторые
серверы могут вернуть неверный сертификат или полностью отклонить соединение.
Чтобы включить SNI, задайте опцию `servername` вместе с
`host`.

Ниже — клиент для примера эхо-сервера из
[`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener):

=== "MJS"

    ```js
    // Assumes an echo server that is listening on port 8000.
    import { connect } from 'node:tls';
    import { readFileSync } from 'node:fs';
    import { stdin } from 'node:process';
    
    const options = {
      // Necessary only if the server requires client certificate authentication.
      key: readFileSync('client-key.pem'),
      cert: readFileSync('client-cert.pem'),
    
      // Necessary only if the server uses a self-signed certificate.
      ca: [ readFileSync('server-cert.pem') ],
    
      // Necessary only if the server's cert isn't for "localhost".
      checkServerIdentity: () => { return null; },
    };
    
    const socket = connect(8000, options, () => {
      console.log('client connected',
                  socket.authorized ? 'authorized' : 'unauthorized');
      stdin.pipe(socket);
      stdin.resume();
    });
    socket.setEncoding('utf8');
    socket.on('data', (data) => {
      console.log(data);
    });
    socket.on('end', () => {
      console.log('server ends connection');
    });
    ```

=== "CJS"

    ```js
    // Assumes an echo server that is listening on port 8000.
    const { connect } = require('node:tls');
    const { readFileSync } = require('node:fs');
    
    const options = {
      // Necessary only if the server requires client certificate authentication.
      key: readFileSync('client-key.pem'),
      cert: readFileSync('client-cert.pem'),
    
      // Necessary only if the server uses a self-signed certificate.
      ca: [ readFileSync('server-cert.pem') ],
    
      // Necessary only if the server's cert isn't for "localhost".
      checkServerIdentity: () => { return null; },
    };
    
    const socket = connect(8000, options, () => {
      console.log('client connected',
                  socket.authorized ? 'authorized' : 'unauthorized');
      process.stdin.pipe(socket);
      process.stdin.resume();
    });
    socket.setEncoding('utf8');
    socket.on('data', (data) => {
      console.log(data);
    });
    socket.on('end', () => {
      console.log('server ends connection');
    });
    ```

Чтобы сгенерировать сертификат и ключ для этого примера, выполните:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout client-key.pem -out client-cert.pem
```

Затем, чтобы сгенерировать сертификат `server-cert.pem` для этого примера, выполните:

```bash
openssl pkcs12 -certpbe AES-256-CBC -export -out server-cert.pem \
  -inkey client-key.pem -in client-cert.pem
```

## `tls.connect(path[, options][, callback])`

<!-- YAML
added: v0.11.3
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение по умолчанию для `options.path`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`tls.connect()`](#tlsconnectoptions-callback).
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) См. [`tls.connect()`](#tlsconnectoptions-callback).
* Возвращает: [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

То же, что [`tls.connect()`](#tlsconnectoptions-callback), но `path` можно передать
аргументом вместо опции.

Если задана опция `path`, она имеет приоритет над аргументом `path`.

## `tls.connect(port[, host][, options][, callback])`

<!-- YAML
added: v0.11.3
-->

* `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение по умолчанию для `options.port`.
* `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение по умолчанию для `options.host`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`tls.connect()`](#tlsconnectoptions-callback).
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) См. [`tls.connect()`](#tlsconnectoptions-callback).
* Возвращает: [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

То же, что [`tls.connect()`](#tlsconnectoptions-callback), но `port` и `host` можно передать
аргументами вместо опций.

Если заданы опции `port` или `host`, они имеют приоритет над соответствующими
аргументами.

## `tls.createSecureContext([options])`

<!-- YAML
added: v0.11.13
changes:
  - version:
    - v22.9.0
    - v20.18.0
    pr-url: https://github.com/nodejs/node/pull/54790
    description: The `allowPartialTrustChain` option has been added.
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53329
    description: The `clientCertEngine`, `privateKeyEngine` and
                 `privateKeyIdentifier` options depend on custom engine
                 support in OpenSSL which is deprecated in OpenSSL 3.
  - version:
    - v19.8.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46978
    description: The `dhparam` option can now be set to `'auto'` to
                 enable DHE with appropriate well-known parameters.
  - version: v12.12.0
    pr-url: https://github.com/nodejs/node/pull/28973
    description: Added `privateKeyIdentifier` and `privateKeyEngine` options
                 to get private key from an OpenSSL engine.
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29598
    description: Added `sigalgs` option to override supported signature
                 algorithms.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26209
    description: TLSv1.3 support added.
  - version: v11.5.0
    pr-url: https://github.com/nodejs/node/pull/24733
    description: The `ca:` option now supports `BEGIN TRUSTED CERTIFICATE`.
  - version:
     - v11.4.0
     - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/24405
    description: The `minVersion` and `maxVersion` can be used to restrict
                 the allowed TLS protocol versions.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19794
    description: The `ecdhCurve` cannot be set to `false` anymore due to a
                 change in OpenSSL.
  - version: v9.3.0
    pr-url: https://github.com/nodejs/node/pull/14903
    description: The `options` parameter can now include `clientCertEngine`.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15206
    description: The `ecdhCurve` option can now be multiple `':'` separated
                 curve names or `'auto'`.
  - version: v7.3.0
    pr-url: https://github.com/nodejs/node/pull/10294
    description: If the `key` option is an array, individual entries do not
                 need a `passphrase` property anymore. `Array` entries can also
                 just be `string`s or `Buffer`s now.
  - version: v5.2.0
    pr-url: https://github.com/nodejs/node/pull/4099
    description: The `ca` option can now be a single string containing multiple
                 CA certificates.
-->

Добавлено в: v0.11.13

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.9.0, v20.18.0 | Добавлена ​​опция `allowPartialTrustChain`. |
    | v22.4.0, v20.16.0 | Параметры clientCertEngine, PrivateKeyEngine и PrivateKeyIdentifier зависят от поддержки специального механизма в OpenSSL, которая устарела в OpenSSL 3. |
    | v19.8.0, v18.16.0 | Для опции dhparam теперь можно установить значение auto, чтобы включить DHE с соответствующими общеизвестными параметрами. |
    | v12.12.0 | Добавлены параметры PrivateKeyIdentifier и PrivateKeyEngine для получения закрытого ключа из механизма OpenSSL. |
    | v12.11.0 | Добавлена ​​опция sigalgs для переопределения поддерживаемых алгоритмов подписи. |
    | v12.0.0 | Добавлена ​​поддержка TLSv1.3. |
    | v11.5.0 | Опция `ca:` теперь поддерживает `BEGIN TRUSTED CERTIFICATE`. |
    | v11.4.0, v10.16.0 | «minVersion» и «maxVersion» можно использовать для ограничения разрешенных версий протокола TLS. |
    | v10.0.0 | Для ecdhCurve больше нельзя установить значение false из-за изменений в OpenSSL. |
    | v9.3.0 | Параметр `options` теперь может включать `clientCertEngine`. |
    | v9.0.0 | Опция `'ecdhCurve` теперь может содержать несколько имен кривых, разделенных `':'`, или `'auto'`. |
    | v7.3.0 | Если опция `key` представляет собой массив, отдельные записи больше не нуждаются в свойстве `passphrase`. Записи массива теперь также могут быть просто строками или буферами. |
    | v5.2.0 | Опция `ca` теперь может представлять собой одну строку, содержащую несколько сертификатов CA. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `allowPartialTrustChain` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Считать промежуточные (не самоподписанные)
    сертификаты в списке доверенных УЦ доверенными.
  * `ca` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Buffer[]>`](buffer.md#buffer) Необязательно переопределяет список доверенных УЦ.
    Если не указано, доверенные по умолчанию УЦ совпадают с теми, что возвращает
    [`tls.getCACertificates()`](#tlsgetcacertificatestype) с типом
    `default`. Если указано, список по умолчанию полностью заменяется
    (а не дополняется) сертификатами из опции `ca`.
    Чтобы добавить сертификаты к умолчанию без полной замены, их нужно объединить вручную.
    Значение может быть строкой или `Buffer`, либо `Array` из
    строк и/или `Buffer`. Любая строка или `Buffer` могут содержать несколько PEM
    УЦ подряд. Сертификат пира должен выстраиваться в цепочку к УЦ,
    которому доверяет сервер, иначе соединение не будет аутентифицировано. При использовании
    сертификатов, не выстраиваемых к известному УЦ, УЦ сертификата
    нужно явно указать как доверенный, иначе аутентификация не пройдёт.
    Если пир использует сертификат, не совпадающий и не выстраиваемый к одному из УЦ
    по умолчанию, укажите в опции `ca` УЦ, к которому можно привязать сертификат пира.
    Для самоподписанных сертификатов сам сертификат является своим УЦ и должен быть
    передан явно.
    Для PEM поддерживаются типы «TRUSTED CERTIFICATE»,
    «X509 CERTIFICATE» и «CERTIFICATE».
  * `cert` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Buffer[]>`](buffer.md#buffer) Цепочки сертификатов в формате PEM. На каждый
    закрытый ключ — одна цепочка. Каждая цепочка должна
    начинаться с PEM сертификата для соответствующего закрытого `key`,
    затем идут промежуточные сертификаты в PEM (если есть), по порядку,
    без корневого УЦ (корневой УЦ должен быть известен пиру заранее,
    см. `ca`). При нескольких цепочках порядок не обязан совпадать с порядком
    закрытых ключей в `key`. Если промежуточные
    сертификаты не переданы, пир не сможет проверить
    сертификат, и рукопожатие завершится ошибкой.
  * `sigalgs` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список поддерживаемых алгоритмов подписи через двоеточие.
    В списке допускаются алгоритмы хэширования (`SHA256`, `MD5` и т.д.), алгоритмы открытого ключа
    (`RSA-PSS`, `ECDSA` и т.д.), их комбинации (например
    'RSA+SHA384') или имена схем TLS v1.3 (например `rsa_pss_pss_sha512`).
    Подробнее см. [документацию OpenSSL](https://www.openssl.org/docs/man1.1.1/man3/SSL_CTX_set1_sigalgs_list.html).
  * `ciphers` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Описание наборов шифров вместо значения по умолчанию. См.
    [изменение набора шифров TLS по умолчанию][Modifying the default TLS cipher suite]. Список допустимых
    шифров можно получить через [`tls.getCiphers()`](#tlsgetciphers). Имена шифров должны быть
    в верхнем регистре, иначе OpenSSL их не примет.
  * `clientCertEngine` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя механизма OpenSSL, который может предоставить
    клиентский сертификат. **Устарело.**
  * `crl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Buffer[]>`](buffer.md#buffer) CRL в формате PEM (списки отозванных
    сертификатов).
  * `dhparam` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) `'auto'` или пользовательские параметры Diffie–Hellman,
    нужны для не-ECDHE [совершенной прямой секретности][perfect forward secrecy]. Если опущено или неверно,
    параметры тихо отбрасываются и шифры DHE недоступны.
    [ECDHE][ECDHE]-вариант [совершенной прямой секретности][perfect forward secrecy] остаётся доступным.
  * `ecdhCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка с именем кривой или список через двоеточие
    NID или имён кривых, например `P-521:P-384:P-256`, для
    согласования ключей ECDH. Значение `auto` выбирает кривую
    автоматически. Список имён кривых — [`crypto.getCurves()`](crypto.md#cryptogetcurves).
    В актуальных версиях `openssl ecparam -list_curves`
    также выводит имя и описание каждой кривой.
    **По умолчанию:** [`tls.DEFAULT_ECDH_CURVE`](#tlsdefault_ecdh_curve).
  * `honorCipherOrder` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Стараться использовать предпочтения сервера по наборам шифров
    вместо клиентских. При `true` в `secureOptions` задаётся
    `SSL_OP_CIPHER_SERVER_PREFERENCE`; см.
    [опции OpenSSL][OpenSSL Options].
  * `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Buffer[]>`](buffer.md#buffer) | [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Закрытые ключи в формате PEM.
    В PEM ключи могут быть зашифрованы; зашифрованные
    ключи расшифровываются с `options.passphrase`. Несколько ключей на разных алгоритмах
    можно передать массивом незашифрованных строк или буферов либо массивом объектов вида
    `{pem: <string|buffer>[, passphrase: <string>]}`. Форма с объектом допускается только
    в массиве. Поле `object.passphrase` необязательно. Зашифрованные ключи расшифровываются
    с `object.passphrase`, если задано, иначе с `options.passphrase`.
  * `privateKeyEngine` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя механизма OpenSSL для получения закрытого ключа.
    Использовать вместе с `privateKeyIdentifier`. **Устарело.**
  * `privateKeyIdentifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Идентификатор ключа, управляемого механизмом OpenSSL.
    Использовать вместе с `privateKeyEngine`.
    Не задавайте одновременно с `key`: обе опции задают закрытый ключ по-разному. **Устарело.**
  * `maxVersion` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно задаёт максимально допустимую версию TLS. Одно из
    `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'` или `'TLSv1'`. Нельзя указывать вместе с `secureProtocol`; выберите что-то одно.
    **По умолчанию:** [`tls.DEFAULT_MAX_VERSION`](#tlsdefault_max_version).
  * `minVersion` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно задаёт минимально допустимую версию TLS. Одно из
    `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'` или `'TLSv1'`. Нельзя указывать вместе с `secureProtocol`; выберите что-то одно. Старайтесь не опускать ниже TLSv1.2, но для совместимости
    это может быть нужно. Версии ниже TLSv1.2 могут потребовать снижения [уровня безопасности OpenSSL][OpenSSL Security Level].
    **По умолчанию:** [`tls.DEFAULT_MIN_VERSION`](#tlsdefault_min_version).
  * `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Общая фраза-пароль для одного закрытого ключа и/или
    PFX.
  * `pfx` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Buffer[]>`](buffer.md#buffer) | [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Закрытый ключ и цепочка в кодировке PFX или PKCS12.
    `pfx` — альтернатива отдельной передаче `key` и `cert`. PFX обычно зашифрован; тогда
    для расшифровки используется `passphrase`. Несколько PFX можно передать
    массивом незашифрованных буферов либо массивом объектов вида
    `{buf: <string|buffer>[, passphrase: <string>]}`. Форма с объектом допускается только
    в массиве. Поле `object.passphrase` необязательно. Зашифрованный PFX расшифровывается
    с `object.passphrase`, если задано, иначе с `options.passphrase`.
  * `secureOptions` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательно влияет на поведение протокола OpenSSL;
    обычно это не нужно. Используйте с осторожностью и только при необходимости.
    Значение — числовая битовая маска опций `SSL_OP_*` из
    [опций OpenSSL][OpenSSL Options].
  * `secureProtocol` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Устаревший способ выбрать версию протокола TLS:
    не поддерживает независимую настройку минимальной и максимальной версии и не позволяет ограничить протокол только TLSv1.3. Вместо
    этого используйте `minVersion` и `maxVersion`. Возможные значения перечислены в
    [SSL\_METHODS][SSL_METHODS]; в коде передаются имена функций строками. Например,
    `'TLSv1_1_method'` принудительно задаёт TLS 1.1, `'TLS_method'` — любую версию TLS до TLSv1.3. TLS
    ниже 1.2 не рекомендуется, но может требоваться для совместимости.
    **По умолчанию:** не задано; см. `minVersion`.
  * `sessionIdContext` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Непрозрачный идентификатор: серверы используют его, чтобы
    состояние сеанса не смешивалось между приложениями. Клиентами не используется.
  * `ticketKeys` [`<Buffer>`](buffer.md#buffer) 48 байт криптографически стойких псевдослучайных
    данных. Подробнее — [возобновление сеанса][Session Resumption].
  * `sessionTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через сколько секунд после создания сеанса TLS сервером
    его уже нельзя возобновить. См.
    [возобновление сеанса][Session Resumption]. **По умолчанию:** `300`.

[`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener) по умолчанию задаёт опцию `honorCipherOrder`
в `true`; у других API, создающих контекст, она не установлена.

[`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener) по умолчанию для `sessionIdContext` использует усечённый до 128 бит SHA1-хэш от
`process.argv`; у других API значения по умолчанию нет.

Метод `tls.createSecureContext()` создаёт объект `SecureContext`. Его можно передавать в ряд API `tls`, например
[`server.addContext()`](#serveraddcontexthostname-context),
но у объекта нет общедоступных методов. Конструктор [`tls.Server`](#class-tlsserver) и
[`tls.createServer()`](#tlscreateserveroptions-secureconnectionlistener) не поддерживают опцию `secureContext`.

Для шифров с сертификатами _обязателен_ ключ: его можно задать через `key` или
`pfx`.

Если опция `ca` не указана, Node.js по умолчанию использует
[публичный список доверенных УЦ Mozilla][Mozilla's publicly trusted list of CAs].

Пользовательские параметры DHE не рекомендуются; предпочтительнее `dhparam: 'auto'`.
При `'auto'` подбираются известные параметры DHE достаточной стойкости
автоматически. Иначе при необходимости можно создать параметры через `openssl dhparam`.
Длина ключа должна быть не меньше 1024 бит, иначе будет ошибка. Допустимо 1024 бита,
но для большей стойкости используйте 2048 бит и больше.

## `tls.createServer([options][, secureConnectionListener])`

<!-- YAML
added: v0.3.2
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53329
    description: The `clientCertEngine` option depends on custom engine
                 support in OpenSSL which is deprecated in OpenSSL 3.
  - version:
    - v20.4.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/45190
    description: The `options` parameter can now include `ALPNCallback`.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44031
    description: If `ALPNProtocols` is set, incoming connections that send an
                 ALPN extension with no supported protocols are terminated with
                 a fatal `no_application_protocol` alert.
  - version: v12.3.0
    pr-url: https://github.com/nodejs/node/pull/27665
    description: The `options` parameter now supports `net.createServer()`
                 options.
  - version: v9.3.0
    pr-url: https://github.com/nodejs/node/pull/14903
    description: The `options` parameter can now include `clientCertEngine`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11984
    description: The `ALPNProtocols` option can be a `TypedArray` or
     `DataView` now.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2564
    description: ALPN options are supported now.
-->

Добавлено в: v0.3.2

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Параметр clientCertEngine зависит от поддержки специального механизма в OpenSSL, который устарел в OpenSSL 3. |
    | v20.4.0, v18.19.0 | Параметр `options` теперь может включать `ALPNCallback`. |
    | v19.0.0 | Если установлен `ALPNProtocols`, входящие соединения, которые отправляют расширение ALPN без поддерживаемых протоколов, завершаются с фатальным предупреждением `no_application_protocol`. |
    | v12.3.0 | Параметр options теперь поддерживает параметры net.createServer(). |
    | v9.3.0 | Параметр `options` теперь может включать `clientCertEngine`. |
    | v8.0.0 | Параметр ALPNProtocols теперь может быть TypedArray или DataView. |
    | v5.0.0 | Опции ALPN теперь поддерживаются. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ALPNProtocols` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Массив строк
    либо один `Buffer`, `TypedArray` или `DataView` с поддерживаемыми
    протоколами ALPN. У буферов формат `[len][name][len][name]...`,
    например `0x05hello0x05world`, где первый байт — длина следующего
    имени протокола. Проще передать массив, например
    `['hello', 'world']`. (Порядок протоколов — по приоритету.)
  * `ALPNCallback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Если задан, вызывается, когда
    клиент открывает соединение с расширением ALPN. В колбэк передаётся один аргумент:
    объект с полями `servername` и
    `protocols` — имя сервера из расширения SNI (если есть) и массив имён протоколов ALPN.
    Колбэк должен вернуть одну из строк из
    `protocols` — она будет выбранным протоколом ALPN для клиента, —
    либо `undefined`, чтобы разорвать соединение с фатальным предупреждением.
    Если возвращённая строка не совпадает ни с одним из протоколов ALPN клиента,
    будет выброшена ошибка. Эту опцию нельзя сочетать с
    `ALPNProtocols`; при указании обеих будет ошибка.
  * `clientCertEngine` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя механизма OpenSSL, который может предоставить
    клиентский сертификат. **Устарело.**
  * `enableTrace` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, для новых соединений вызывается [`tls.TLSSocket.enableTrace()`](#tlssocketenabletrace).
    Трассировку можно включить и после установления защищённого
    соединения, но для трассировки этапа установления соединения нужна эта опция. **По умолчанию:** `false`.
  * `handshakeTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Разорвать соединение, если рукопожатие SSL/TLS
    не завершится за указанное число миллисекунд.
    На объекте `tls.Server` при таймауте рукопожатия испускается `'tlsClientError'`
    **По умолчанию:** `120000` (120 секунд).
  * `rejectUnauthorized` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если не `false`, сервер отклоняет
    соединения, не прошедшие авторизацию по списку переданных УЦ. Опция
    действует только если `requestCert` — `true`. **По умолчанию:** `true`.
  * `requestCert` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сервер запрашивает сертификат у
    подключающихся клиентов и пытается его проверить. **По умолчанию:**
    `false`.
  * `sessionTimeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через сколько секунд после создания сеанса TLS сервером
    его уже нельзя возобновить. См.
    [возобновление сеанса][Session Resumption]. **По умолчанию:** `300`.
  * `SNICallback(servername, callback)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, если
    клиент поддерживает расширение SNI. В колбэк передаются два аргумента: `servername` и `callback`. `callback` —
    колбэк в стиле error-first с двумя необязательными аргументами: `error` и `ctx`.
    Если передан `ctx`, это экземпляр `SecureContext`.
    Для получения корректного `SecureContext` можно вызвать [`tls.createSecureContext()`](#tlscreatesecurecontextoptions).
    Если `callback` вызван с ложным `ctx`, используется защищённый контекст сервера по умолчанию. Если `SNICallback` не задан,
    используется встроенный колбэк высокоуровневого API (см. ниже).
  * `ticketKeys` [`<Buffer>`](buffer.md#buffer) 48 байт криптографически стойких псевдослучайных
    данных. См. [возобновление сеанса][Session Resumption].
  * `pskCallback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Для согласования TLS-PSK см. [предварительно разделённые ключи][Pre-shared keys].
  * `pskIdentityHint` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательная подсказка клиенту для выбора
    идентичности при согласовании TLS-PSK. В TLS 1.3 игнорируется.
    При ошибке установки `pskIdentityHint` испускается `'tlsClientError'` с кодом
    `'ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED'`.
  * ...: можно передать любые опции [`tls.createSecureContext()`](#tlscreatesecurecontextoptions). Для
    серверов обычно нужны опции идентичности (`pfx`, `key`/`cert` или `pskCallback`).
  * ...: можно передать любые опции [`net.createServer()`](net.md#netcreateserveroptions-connectionlistener).
* `secureConnectionListener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<tls.Server>`](#class-tlsserver)

Создаёт новый [`tls.Server`](#class-tlsserver). Если передан `secureConnectionListener`, он
автоматически регистрируется на событие [`'secureConnection'`](#event-secureconnection).

Опция `ticketKeys` автоматически разделяется между воркерами модуля `node:cluster`.

Ниже — простой эхо-сервер:

=== "MJS"

    ```js
    import { createServer } from 'node:tls';
    import { readFileSync } from 'node:fs';
    
    const options = {
      key: readFileSync('server-key.pem'),
      cert: readFileSync('server-cert.pem'),
    
      // This is necessary only if using client certificate authentication.
      requestCert: true,
    
      // This is necessary only if the client uses a self-signed certificate.
      ca: [ readFileSync('client-cert.pem') ],
    };
    
    const server = createServer(options, (socket) => {
      console.log('server connected',
                  socket.authorized ? 'authorized' : 'unauthorized');
      socket.write('welcome!\n');
      socket.setEncoding('utf8');
      socket.pipe(socket);
    });
    server.listen(8000, () => {
      console.log('server bound');
    });
    ```

=== "CJS"

    ```js
    const { createServer } = require('node:tls');
    const { readFileSync } = require('node:fs');
    
    const options = {
      key: readFileSync('server-key.pem'),
      cert: readFileSync('server-cert.pem'),
    
      // This is necessary only if using client certificate authentication.
      requestCert: true,
    
      // This is necessary only if the client uses a self-signed certificate.
      ca: [ readFileSync('client-cert.pem') ],
    };
    
    const server = createServer(options, (socket) => {
      console.log('server connected',
                  socket.authorized ? 'authorized' : 'unauthorized');
      socket.write('welcome!\n');
      socket.setEncoding('utf8');
      socket.pipe(socket);
    });
    server.listen(8000, () => {
      console.log('server bound');
    });
    ```

Чтобы сгенерировать сертификат и ключ для этого примера, выполните:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout server-key.pem -out server-cert.pem
```

Затем, чтобы сгенерировать сертификат `client-cert.pem` для этого примера, выполните:

```bash
openssl pkcs12 -certpbe AES-256-CBC -export -out client-cert.pem \
  -inkey server-key.pem -in server-cert.pem
```

Сервер можно проверить, подключившись к нему примером клиента из
[`tls.connect()`](#tlsconnectoptions-callback).

## `tls.setDefaultCACertificates(certs)`

<!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

* `certs` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) Массив сертификатов УЦ в формате PEM.

Задаёт сертификаты УЦ по умолчанию для TLS-клиентов Node.js. Если переданные
сертификаты успешно разобраны, они становятся списком УЦ по умолчанию, который возвращает
[`tls.getCACertificates()`](#tlsgetcacertificatestype) и используется
последующими TLS-соединениями без собственного списка УЦ.
Перед установкой дубликаты сертификатов удаляются.

Функция действует только в текущем потоке Node.js. Уже закэшированные
сессии агента HTTPS не меняются, поэтому вызывать метод
нужно до установления нежелательных кэшируемых TLS-соединений.

Чтобы по умолчанию использовать системные CA:

=== "CJS"

    ```js
    const tls = require('node:tls');
    tls.setDefaultCACertificates(tls.getCACertificates('system'));
    ```

=== "MJS"

    ```js
    import tls from 'node:tls';
    tls.setDefaultCACertificates(tls.getCACertificates('system'));
    ```

Функция полностью заменяет список УЦ по умолчанию. Чтобы добавить сертификаты
к текущим умолчаниям, получите текущий список и дополните его:

=== "CJS"

    ```js
    const tls = require('node:tls');
    const currentCerts = tls.getCACertificates('default');
    const additionalCerts = ['-----BEGIN CERTIFICATE-----\n...'];
    tls.setDefaultCACertificates([...currentCerts, ...additionalCerts]);
    ```

=== "MJS"

    ```js
    import tls from 'node:tls';
    const currentCerts = tls.getCACertificates('default');
    const additionalCerts = ['-----BEGIN CERTIFICATE-----\n...'];
    tls.setDefaultCACertificates([...currentCerts, ...additionalCerts]);
    ```

## `tls.getCACertificates([type])`

<!-- YAML
added:
  - v23.10.0
  - v22.15.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Какие сертификаты УЦ возвращать. Допустимые значения:
  `"default"`, `"system"`, `"bundled"` и `"extra"`.
  **По умолчанию:** `"default"`.
* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив сертификатов в формате PEM. В массиве могут быть дубликаты,
  если один и тот же сертификат хранится в нескольких источниках.

Возвращает массив сертификатов УЦ из разных источников в зависимости от `type`:

* `"default"`: сертификаты УЦ, которые по умолчанию используют TLS-клиенты Node.js.
  * Если включён [`--use-bundled-ca`](cli.md#--use-bundled-ca---use-openssl-ca) (по умолчанию) или не включён [`--use-openssl-ca`](cli.md#--use-bundled-ca---use-openssl-ca),
    входят сертификаты из встроенного хранилища Mozilla CA.
  * Если включён [`--use-system-ca`](cli.md#--use-system-ca), также входят сертификаты из системного
    доверенного хранилища.
  * Если задан [`NODE_EXTRA_CA_CERTS`](cli.md#node_extra_ca_certsfile), также входят сертификаты из указанного
    файла.
* `"system"`: сертификаты УЦ, загруженные из системного доверенного хранилища по
  правилам [`--use-system-ca`](cli.md#--use-system-ca). Можно использовать, чтобы получить
  системные сертификаты, когда [`--use-system-ca`](cli.md#--use-system-ca) не включён.
* `"bundled"`: сертификаты из встроенного хранилища Mozilla CA. Совпадает с
  [`tls.rootCertificates`](#tlsrootcertificates).
* `"extra"`: сертификаты, загруженные из [`NODE_EXTRA_CA_CERTS`](cli.md#node_extra_ca_certsfile). Пустой массив, если
  [`NODE_EXTRA_CA_CERTS`](cli.md#node_extra_ca_certsfile) не задан.

## `tls.getCiphers()`

<!-- YAML
added: v0.10.2
-->

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает массив имён поддерживаемых шифров TLS. Имена в нижнем регистре
по историческим причинам, но в опции `ciphers` у [`tls.createSecureContext()`](#tlscreatesecurecontextoptions)
их нужно указывать в верхнем регистре.

Не все поддерживаемые шифры включены по умолчанию. См.
[изменение набора шифров TLS по умолчанию][Modifying the default TLS cipher suite].

Имена, начинающиеся с `'tls_'`, относятся к TLSv1.3, остальные — к TLSv1.2 и ниже.

```js
console.log(tls.getCiphers()); // ['aes128-gcm-sha256', 'aes128-sha', ...]
```

## `tls.rootCertificates`

<!-- YAML
added: v12.3.0
-->

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Неизменяемый массив строк с корневыми сертификатами (в формате PEM)
из встроенного хранилища Mozilla CA в текущей версии Node.js.

Встроенное хранилище CA в Node.js — снимок Mozilla CA на момент выпуска;
он одинаков на всех поддерживаемых платформах.

Чтобы получить фактический набор сертификатов УЦ в текущем экземпляре Node.js, в том числе
загруженные из системного хранилища (если используется `--use-system-ca`)
или из файла из `NODE_EXTRA_CA_CERTS`, вызывайте
[`tls.getCACertificates()`](#tlsgetcacertificatestype).

## `tls.DEFAULT_ECDH_CURVE`

<!-- YAML
added: v0.11.13
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/16853
    description: Default value changed to `'auto'`.
-->

Добавлено в: v0.11.13

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Значение по умолчанию изменено на «авто». |

Имя кривой по умолчанию для согласования ключей ECDH на TLS-сервере.
Значение по умолчанию — `'auto'`. Подробнее см. [`tls.createSecureContext()`](#tlscreatesecurecontextoptions).

## `tls.DEFAULT_MAX_VERSION`

<!-- YAML
added: v11.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение по умолчанию для опции `maxVersion` у
  [`tls.createSecureContext()`](#tlscreatesecurecontextoptions). Можно присвоить любую поддерживаемую версию TLS:
  `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'` или `'TLSv1'`.
  **По умолчанию:** `'TLSv1.3'`, если не переопределено опциями CLI. Флаг
  `--tls-max-v1.2` задаёт по умолчанию `'TLSv1.2'`. Флаг `--tls-max-v1.3` задаёт
  по умолчанию `'TLSv1.3'`. Если указано несколько таких опций, берётся
  наибольший максимум.

## `tls.DEFAULT_MIN_VERSION`

<!-- YAML
added: v11.4.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение по умолчанию для опции `minVersion` у
  [`tls.createSecureContext()`](#tlscreatesecurecontextoptions). Можно присвоить любую поддерживаемую версию TLS:
  `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'` или `'TLSv1'`.
  Версии ниже TLSv1.2 могут потребовать снижения [уровня безопасности OpenSSL][OpenSSL Security Level].
  **По умолчанию:** `'TLSv1.2'`, если не переопределено опциями CLI. Флаг
  `--tls-min-v1.0` задаёт по умолчанию `'TLSv1'`. Флаг `--tls-min-v1.1` задаёт
  по умолчанию `'TLSv1.1'`. Флаг `--tls-min-v1.3` задаёт по умолчанию
  `'TLSv1.3'`. Если указано несколько таких опций, берётся
  наименьший минимум.

## `tls.DEFAULT_CIPHERS`

<!-- YAML
added: v0.11.3
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение по умолчанию для опции `ciphers` у
  [`tls.createSecureContext()`](#tlscreatesecurecontextoptions). Можно присвоить любой поддерживаемый
  набор шифров OpenSSL. По умолчанию совпадает с
  `crypto.constants.defaultCoreCipherList`, если не переопределено опциями CLI
  `--tls-default-ciphers`.

[CVE-2021-44531]: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44531
[Chrome's 'modern cryptography' setting]: https://www.chromium.org/Home/chromium-security/education/tls#TOC-Cipher-Suites
[DHE]: https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange
[ECDHE]: https://en.wikipedia.org/wiki/Elliptic_curve_Diffie%E2%80%93Hellman
[Modifying the default TLS cipher suite]: #modifying-the-default-tls-cipher-suite
[Mozilla's publicly trusted list of CAs]: https://hg.mozilla.org/mozilla-central/raw-file/tip/security/nss/lib/ckfw/builtins/certdata.txt
[OCSP request]: https://en.wikipedia.org/wiki/OCSP_stapling
[OpenSSL Options]: crypto.md#openssl-options
[OpenSSL Security Level]: #openssl-security-level
[OpenSSL documentation on security levels]: https://www.openssl.org/docs/manmaster/man3/SSL_CTX_set_security_level.html#DEFAULT-CALLBACK-BEHAVIOUR
[Pre-shared keys]: #pre-shared-keys
[RFC 2246]: https://www.ietf.org/rfc/rfc2246.txt
[RFC 4086]: https://tools.ietf.org/html/rfc4086
[RFC 4279]: https://tools.ietf.org/html/rfc4279
[RFC 5077]: https://tools.ietf.org/html/rfc5077
[RFC 5929]: https://tools.ietf.org/html/rfc5929
[SSL_METHODS]: https://www.openssl.org/docs/man1.1.1/man7/ssl.html#Dealing-with-Protocol-Methods
[Session Resumption]: #session-resumption
[Stream]: stream.md#stream
[TLS recommendations]: https://wiki.mozilla.org/Security/Server_Side_TLS
[`'newSession'`]: #event-newsession
[`'resumeSession'`]: #event-resumesession
[`'secure'`]: #event-secure
[`'secureConnect'`]: #event-secureconnect
[`'secureConnection'`]: #event-secureconnection
[`'session'`]: #event-session
[`--tls-cipher-list`]: cli.md#--tls-cipher-listlist
[`--use-bundled-ca`]: cli.md#--use-bundled-ca---use-openssl-ca
[`--use-openssl-ca`]: cli.md#--use-bundled-ca---use-openssl-ca
[`--use-system-ca`]: cli.md#--use-system-ca
[`Duplex`]: stream.md#class-streamduplex
[`NODE_EXTRA_CA_CERTS`]: cli.md#node_extra_ca_certsfile
[`NODE_OPTIONS`]: cli.md#node_optionsoptions
[`SSL_export_keying_material`]: https://www.openssl.org/docs/man1.1.1/man3/SSL_export_keying_material.html
[`SSL_get_version`]: https://www.openssl.org/docs/man1.1.1/man3/SSL_get_version.html
[`crypto.getCurves()`]: crypto.md#cryptogetcurves
[`import()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
[`net.Server.address()`]: net.md#serveraddress
[`net.Server`]: net.md#class-netserver
[`net.Socket`]: net.md#class-netsocket
[`net.createServer()`]: net.md#netcreateserveroptions-connectionlistener
[`server.addContext()`]: #serveraddcontexthostname-context
[`server.getTicketKeys()`]: #servergetticketkeys
[`server.listen()`]: net.md#serverlisten
[`server.setTicketKeys()`]: #serversetticketkeyskeys
[`socket.connect()`]: net.md#socketconnectoptions-connectlistener
[`socket.setTimeout(timeout)`]: net.md#socketsettimeouttimeout-callback
[`tls.DEFAULT_ECDH_CURVE`]: #tlsdefault_ecdh_curve
[`tls.DEFAULT_MAX_VERSION`]: #tlsdefault_max_version
[`tls.DEFAULT_MIN_VERSION`]: #tlsdefault_min_version
[`tls.Server`]: #class-tlsserver
[`tls.TLSSocket.enableTrace()`]: #tlssocketenabletrace
[`tls.TLSSocket.getPeerCertificate()`]: #tlssocketgetpeercertificatedetailed
[`tls.TLSSocket.getProtocol()`]: #tlssocketgetprotocol
[`tls.TLSSocket.getSession()`]: #tlssocketgetsession
[`tls.TLSSocket.getTLSTicket()`]: #tlssocketgettlsticket
[`tls.TLSSocket`]: #class-tlstlssocket
[`tls.connect()`]: #tlsconnectoptions-callback
[`tls.createSecureContext()`]: #tlscreatesecurecontextoptions
[`tls.createServer()`]: #tlscreateserveroptions-secureconnectionlistener
[`tls.getCACertificates()`]: #tlsgetcacertificatestype
[`tls.getCiphers()`]: #tlsgetciphers
[`tls.rootCertificates`]: #tlsrootcertificates
[`x509.checkHost()`]: crypto.md#x509checkhostname-options
[asn1.js]: https://www.npmjs.com/package/asn1.js
[certificate object]: #certificate-object
[cipher list format]: https://www.openssl.org/docs/man1.1.1/man1/ciphers.html#CIPHER-LIST-FORMAT
[forward secrecy]: https://en.wikipedia.org/wiki/Perfect_forward_secrecy
[perfect forward secrecy]: #perfect-forward-secrecy
