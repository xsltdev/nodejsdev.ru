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

При использовании ESM, если есть вероятность, что код будет выполняться на сборке Node.js без поддержки криптографии, используйте функцию [`import()`][`import()`] вместо лексического `import`:

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
[`tls.createServer()`][`tls.createServer()`].

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

* `hint` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) необязательное сообщение сервера для выбора идентичности при
  согласовании. В TLS 1.3 всегда `null`.
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) вида
  `{ psk: <Buffer|TypedArray|DataView>, identity: <string> }` или `null`.

Затем на сервере:

* `socket` [<tls.TLSSocket>](tls.md#class-tlstlssocket) сокет сервера, эквивалент `this`.
* `identity` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) идентификатор от клиента.
* Возвращает: [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) PSK (или `null`).

Возврат `null` прерывает согласование и отправляет уведомление
`unknown_psk_identity` другой стороне. Чтобы скрыть неизвестную идентичность PSK,
колбэк может вернуть случайные данные как `psk`, чтобы соединение завершилось с
`decrypt_error` до окончания согласования.

### Смягчение атаки с пересогласованием по инициативе клиента

<!-- type=misc -->

Протокол TLS позволяет клиенту пересогласовывать часть параметров сеанса. Это
дорого для сервера и может использоваться для DoS.

Чтобы снизить риск, пересогласование ограничено тремя разами в десять минут. При
превышении порога на экземпляре [`tls.TLSSocket`][`tls.TLSSocket`] испускается событие
`'error'`. Пределы настраиваются:

* `tls.CLIENT_RENEG_LIMIT` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) число запросов пересогласования.
  **По умолчанию:** `3`.
* `tls.CLIENT_RENEG_WINDOW` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) окно времени пересогласования в секундах.
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

В Node.js клиенты ждут события [`'session'`][`'session'`], передают данные в опцию `session`
последующего [`tls.connect()`][`tls.connect()`] для повторного использования сеанса. Серверы
должны обрабатывать [`'newSession'`][`'newSession'`] и [`'resumeSession'`][`'resumeSession'`], сохраняя и
восстанавливая данные по ID. Для балансировщиков и кластера нужен общий кэш
сеансов (например Redis).

#### Билеты сеанса (session tickets)

Сервер шифрует состояние сеанса и отправляет клиенту «билет». При переподключении
состояние передаётся в начале установления связи; отдельный кэш на сервере не
нужен. Если билет не используется (не удалось расшифровать, устарел и т.д.),
создаётся новый сеанс и новый билет. См. [RFC 5077][RFC 5077].

Возобновление по билетам поддерживают многие браузеры при HTTPS.

В Node.js те же API, что и для идентификаторов. Для отладки: если
[`tls.TLSSocket.getTLSTicket()`][`tls.TLSSocket.getTLSTicket()`] возвращает значение, в данных сеанса есть
билет, иначе — состояние на стороне клиента.

В TLSv1.3 сервер может отправить несколько билетов и несколько событий
`'session'`; подробнее см. [`'session'`][`'session'`].

Однопроцессным серверам не нужна особая настройка для билетов. Чтобы билеты
работали после перезапуска или между узлами, у всех серверов должны быть одинаковые
ключи билетов: внутри три 16-байтовых ключа, в API они представлены одним
буфером 48 байт.

Ключи можно взять с одного экземпляра [`server.getTicketKeys()`][`server.getTicketKeys()`] и распространить,
но надёжнее сгенерировать 48 криптографически стойких случайных байт и задать
опцией `ticketKeys` в [`tls.createServer()`][`tls.createServer()`]. Ключи регулярно обновляют; сброс —
[`server.setTicketKeys()`][`server.setTicketKeys()`].

Ключи билетов — криптографические секреты; их _**нужно хранить безопасно**_. В
TLS 1.2 и ниже компрометация ключей позволяет расшифровать сеансы, защищённые
этими билетами. Не храните их на диске, регулярно обновляйте.

Если клиенты объявляют поддержку билетов, сервер их отправляет. Отключить билеты
можно через `require('node:constants').SSL_OP_NO_TICKET` в `secureOptions`.

И у идентификаторов, и у билетов есть таймаут; новый сеанс настраивается опцией
`sessionTimeout` в [`tls.createServer()`][`tls.createServer()`].

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

Значение по умолчанию можно полностью заменить ключом [`--tls-cipher-list`][`--tls-cipher-list`]
(напрямую или через переменную окружения [`NODE_OPTIONS`][`NODE_OPTIONS`]). Например, ниже
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
сервера опцией `ciphers` из [`tls.createSecureContext()`][`tls.createSecureContext()`] — она доступна в
[`tls.createServer()`][`tls.createServer()`], [`tls.connect()`][`tls.connect()`] и при создании
[`tls.TLSSocket`][`tls.TLSSocket`].

Список может смешивать имена наборов шифров TLSv1.3 (начинаются с `'TLS_'`) и
спецификации для TLSv1.2 и ниже. Для TLSv1.2 действует устаревший формат списка,
см. документацию OpenSSL [cipher list format][cipher list format], но к шифрам TLSv1.3 эти
правила _не_ применяются: наборы TLSv1.3 включаются только полным именем в списке.
Их нельзя включить или отключить устаревшими суффиксами TLSv1.2 вроде `'EECDH'` или
`'!EECDH'`.

Несмотря на порядок в списке, протокол TLSv1.3 безопаснее TLSv1.2 и будет выбран
при поддержке рукопожатием, если включены какие-либо наборы TLSv1.3.

Набор шифров по умолчанию в Node.js подобран с учётом текущих практик
безопасности. Его изменение сильно влияет на безопасность приложения. Ключ
`--tls-cipher-list` и опция `ciphers` должны использоваться только при крайней
необходимости.

По умолчанию предпочитаются шифры GCM для [Chrome's 'modern cryptography' setting][Chrome's 'modern cryptography' setting] и шифры ECDHE/DHE для совершенной прямой секретности, с
_некоторой_ обратной совместимостью.

Старые клиенты на небезопасных RC4 или DES (например Internet Explorer 6) не
смогут завершить рукопожатие с конфигурацией по умолчанию. Если таких клиентов
нужно поддержать, см. [TLS recommendations][TLS recommendations]. О формате списка — в документации
OpenSSL [cipher list format][cipher list format].

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
(`SECLEVEL=0`). Подробнее — [OpenSSL documentation on security levels][OpenSSL documentation on security levels].

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

### Использование [`--tls-cipher-list`][`--tls-cipher-list`]

Уровень и шифры можно задать с командной строки через
`--tls-cipher-list=DEFAULT@SECLEVEL=X`, см. раздел [Modifying the default TLS cipher suite][Modifying the default TLS cipher suite]. Обычно не рекомендуется
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

* `'UNABLE_TO_GET_ISSUER_CERT'`: Unable to get issuer certificate.
* `'UNABLE_TO_GET_CRL'`: Unable to get certificate CRL.
* `'UNABLE_TO_DECRYPT_CERT_SIGNATURE'`: Unable to decrypt certificate's
  signature.
* `'UNABLE_TO_DECRYPT_CRL_SIGNATURE'`: Unable to decrypt CRL's signature.
* `'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY'`: Unable to decode issuer public key.
* `'CERT_SIGNATURE_FAILURE'`: Certificate signature failure.
* `'CRL_SIGNATURE_FAILURE'`: CRL signature failure.
* `'CERT_NOT_YET_VALID'`: Certificate is not yet valid.
* `'CERT_HAS_EXPIRED'`: Certificate has expired.
* `'CRL_NOT_YET_VALID'`: CRL is not yet valid.
* `'CRL_HAS_EXPIRED'`: CRL has expired.
* `'ERROR_IN_CERT_NOT_BEFORE_FIELD'`: Format error in certificate's notBefore
  field.
* `'ERROR_IN_CERT_NOT_AFTER_FIELD'`: Format error in certificate's notAfter
  field.
* `'ERROR_IN_CRL_LAST_UPDATE_FIELD'`: Format error in CRL's lastUpdate field.
* `'ERROR_IN_CRL_NEXT_UPDATE_FIELD'`: Format error in CRL's nextUpdate field.
* `'OUT_OF_MEM'`: Out of memory.
* `'DEPTH_ZERO_SELF_SIGNED_CERT'`: Self signed certificate.
* `'SELF_SIGNED_CERT_IN_CHAIN'`: Self signed certificate in certificate chain.
* `'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'`: Unable to get local issuer certificate.
* `'UNABLE_TO_VERIFY_LEAF_SIGNATURE'`: Unable to verify the first certificate.
* `'CERT_CHAIN_TOO_LONG'`: Certificate chain too long.
* `'CERT_REVOKED'`: Certificate revoked.
* `'INVALID_CA'`: Invalid CA certificate.
* `'PATH_LENGTH_EXCEEDED'`: Path length constraint exceeded.
* `'INVALID_PURPOSE'`: Unsupported certificate purpose.
* `'CERT_UNTRUSTED'`: Certificate not trusted.
* `'CERT_REJECTED'`: Certificate rejected.
* `'HOSTNAME_MISMATCH'`: Hostname mismatch.

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

* `socket` [<stream.Duplex>](stream.md#class-streamduplex)

Событие испускается при установлении нового TCP-потока, до начала рукопожатия TLS.
`socket` обычно имеет тип [`net.Socket`][`net.Socket`], но не получает события так, как сокет
из [`net.Server`][`net.Server`] `'connection'`. Обычно обработчик не нужен.

Пользователь может явно испустить событие, чтобы подать соединение на TLS-сервер;
тогда можно передать любой поток [`Duplex`][`Duplex`].

### Событие: `'keylog'`

<!-- YAML
added:
 - v12.3.0
 - v10.20.0
-->

* `line` [<Buffer>](buffer.md#buffer) Строка ASCII в формате NSS `SSLKEYLOGFILE`.
* `tlsSocket` [<tls.TLSSocket>](tls.md#class-tlstlssocket) Экземпляр `tls.TLSSocket`, для которого сгенерирован материал.

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
сохранять во внешнем хранилище и передавать в колбэк [`'resumeSession'`][`'resumeSession'`].

Обработчику передаются три аргумента:

* `sessionId` [<Buffer>](buffer.md#buffer) Идентификатор TLS-сеанса
* `sessionData` [<Buffer>](buffer.md#buffer) Данные TLS-сеанса
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция без аргументов, которую нужно вызвать, чтобы
  начать передачу данных по защищённому соединению

Обработчик влияет только на соединения, установленные после его регистрации.

### Событие: `'OCSPRequest'`

<!-- YAML
added: v0.11.13
-->

Событие `'OCSPRequest'` испускается, когда клиент запрашивает статус сертификата.
Обработчику передаются три аргумента:

* `certificate` [<Buffer>](buffer.md#buffer) Сертификат сервера
* `issuer` [<Buffer>](buffer.md#buffer) Сертификат издателя
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Колбэк для передачи результата запроса OCSP

Текущий сертификат сервера можно разобрать, чтобы получить URL OCSP и ID
сертификата; после получения ответа OCSP вызывают `callback(null, resp)`, где
`resp` — `Buffer` с ответом OCSP. И `certificate`, и `issuer` — DER в `Buffer`;
по ним находят ID и URL OCSP.

Вместо ответа можно вызвать `callback(null, null)`.

Вызов `callback(err)` приведёт к `socket.destroy(err)`.

Типичный сценарий:

1. Клиент подключается и отправляет запрос статуса (расширение в ClientHello).
2. Сервер получает запрос и испускает `'OCSPRequest'`.
3. Сервер извлекает URL OCSP из `certificate` или `issuer` и выполняет [OCSP request][OCSP request] к УЦ.
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

* `sessionId` [<Buffer>](buffer.md#buffer) Идентификатор TLS-сеанса
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после восстановления сеанса:
  `callback([err[, sessionData]])`
  * `err` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `sessionData` [<Buffer>](buffer.md#buffer)

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

* `tlsSocket` [<tls.TLSSocket>](tls.md#class-tlstlssocket) Установленный TLS-сокет.

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

* `exception` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект ошибки
* `tlsSocket` [<tls.TLSSocket>](tls.md#class-tlstlssocket) Сокет, с которого пришла ошибка

### `server.addContext(hostname, context)`

<!-- YAML
added: v0.5.3
-->

* `hostname` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста для SNI или шаблон (например `'*'`)
* `context` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [<tls.SecureContext>](tls.md#tlscreatesecurecontextoptions) Свойства из опций [`tls.createSecureContext()`][`tls.createSecureContext()`]
  (`key`, `cert`, `ca` и т.д.) или готовый контекст от [`tls.createSecureContext()`][`tls.createSecureContext()`]

`server.addContext()` добавляет контекст, который используется, если SNI клиента
совпадает с `hostname` (или шаблоном). При нескольких совпадениях берётся
последний добавленный.

### `server.address()`

<!-- YAML
added: v0.6.0
-->

* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает привязанный адрес, семейство и порт, как сообщает ОС. См.
[`net.Server.address()`][`net.Server.address()`].

### `server.close([callback])`

<!-- YAML
added: v0.3.2
-->

* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Будет зарегистрирован на событие `'close'` сервера
* Возвращает: [<tls.Server>](#class-tlsserver)

`server.close()` прекращает приём новых соединений. Работает асинхронно; событие
`'close'` придёт, когда не останется открытых соединений.

### `server.getTicketKeys()`

<!-- YAML
added: v3.0.0
-->

* Возвращает: [<Buffer>](buffer.md#buffer) Буфер из 48 байт с ключами session ticket

Возвращает ключи билетов сеанса. См. [Session Resumption][Session Resumption].

### `server.listen()`

Запускает прослушивание зашифрованных соединений. Аналогично [`server.listen()`][`server.listen()`]
у [`net.Server`][`net.Server`].

### `server.setSecureContext(options)`

<!-- YAML
added: v11.0.0
-->

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Свойства опций [`tls.createSecureContext()`][`tls.createSecureContext()`] (`key`, `cert`, `ca` и т.д.)

`server.setSecureContext()` заменяет защищённый контекст сервера; уже установленные
соединения не разрываются.

### `server.setTicketKeys(keys)`

<!-- YAML
added: v3.0.0
-->

* `keys` [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Буфер из 48 байт с ключами билетов

Задаёт ключи билетов; действуют для новых подключений, текущие используют
предыдущие ключи. См. [Session Resumption][Session Resumption].

## Класс: `tls.TLSSocket` {#class-tlstlssocket}

<!-- YAML
added: v0.11.4
-->

* Расширяет: [net.Socket](net.md#class-netsocket)

Прозрачно шифрует записываемые данные и выполняет согласование TLS.

Экземпляры `tls.TLSSocket` реализуют дуплексный интерфейс [Stream][Stream].

Метаданные соединения (например [`tls.TLSSocket.getPeerCertificate()`][`tls.TLSSocket.getPeerCertificate()`]) доступны,
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

* `socket` [<net.Socket>](net.md#class-netsocket) | [<stream.Duplex>](stream.md#class-streamduplex)
  На сервере — любой `Duplex`. На клиенте — обычно [`net.Socket`][`net.Socket`]; для произвольного
  `Duplex` на клиенте используйте [`tls.connect()`][`tls.connect()`].
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `enableTrace`: см. [`tls.createServer()`][`tls.createServer()`]
  * `isServer`: протокол SSL/TLS асимметричен; при `true` сокет создаётся как сервер.
    **По умолчанию:** `false`.
  * `server` [<net.Server>](net.md#class-netserver) Экземпляр [`net.Server`][`net.Server`]
  * `requestCert`: запрашивать ли сертификат у удалённой стороны. Клиенты всегда
    запрашивают сертификат сервера; сервер (`isServer === true`) может запросить
    сертификат клиента.
  * `rejectUnauthorized`: см. [`tls.createServer()`][`tls.createServer()`]
  * `ALPNProtocols`: см. [`tls.createServer()`][`tls.createServer()`]
  * `SNICallback`: см. [`tls.createServer()`][`tls.createServer()`]
  * `ALPNCallback`: см. [`tls.createServer()`][`tls.createServer()`]
  * `session` [<Buffer>](buffer.md#buffer) Экземпляр `Buffer` с TLS-сеансом
  * `requestOCSP` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` в ClientHello добавляется запрос статуса OCSP,
    а событие `'OCSPResponse'` испускается на сокете до установления защищённого канала
  * `secureContext`: контекст от [`tls.createSecureContext()`][`tls.createSecureContext()`]. Если не задан,
    создаётся вызовом `tls.createSecureContext()` с полным объектом `options`.
  * ...: опции [`tls.createSecureContext()`][`tls.createSecureContext()`], если `secureContext` не передан;
    иначе игнорируются.

Создаёт новый `tls.TLSSocket` поверх существующего TCP-сокета.

### Событие: `'keylog'`

<!-- YAML
added:
 - v12.3.0
 - v10.20.0
-->

* `line` [<Buffer>](buffer.md#buffer) Строка ASCII в формате NSS `SSLKEYLOGFILE`.

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

* `response` [<Buffer>](buffer.md#buffer) Ответ OCSP сервера

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

* `session` [<Buffer>](buffer.md#buffer)

На клиентском `tls.TLSSocket` событие `'session'` испускается при появлении
нового сеанса или TLS-билета; момент относительно завершения рукопожатия зависит
от версии протокола. На сервере не испускается; не испускается при простом
возобновлении без нового сеанса. Для некоторых версий протокола событие может
повторяться — все полученные сеансы можно использовать для возобновления.

Клиент может передать `session` в опцию `session` вызова [`tls.connect()`][`tls.connect()`].

См. [Session Resumption][Session Resumption].

В TLSv1.2 и ниже после рукопожатия можно вызвать [`tls.TLSSocket.getSession()`][`tls.TLSSocket.getSession()`].
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

* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

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

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

* `length` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт ключевого материала

* `label` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метка приложения, обычно из
  [IANA Exporter Label Registry](https://www.iana.org/assignments/tls-parameters/tls-parameters.xhtml#exporter-labels).

* `context` [<Buffer>](buffer.md#buffer) Необязательный контекст.

* Возвращает: [<Buffer>](buffer.md#buffer) Запрошенные байты ключевого материала

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

См. документацию OpenSSL [`SSL_export_keying_material`][`SSL_export_keying_material`].

### `tlsSocket.getCertificate()`

<!-- YAML
added: v11.2.0
-->

* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект локального сертификата; свойства соответствуют полям сертификата.

Пример структуры — в [`tls.TLSSocket.getPeerCertificate()`][`tls.TLSSocket.getPeerCertificate()`].

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

* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя набора шифров в OpenSSL.
  * `standardName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя набора шифров по IETF.
  * `version` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Минимальная версия TLS, поддерживаемая этим набором.
    Фактически согласованный протокол — в [`tls.TLSSocket.getProtocol()`][`tls.TLSSocket.getProtocol()`].

Сведения о согласованном наборе шифров.

Например, TLSv1.2 с AES256-SHA:

```json
{
    "name": "AES256-SHA",
    "standardName": "TLS_RSA_WITH_AES_256_CBC_SHA",
    "version": "SSLv3"
}
```

See
[SSL\_CIPHER\_get\_name](https://www.openssl.org/docs/man1.1.1/man3/SSL_CIPHER_get_name.html)
for more information.

### `tlsSocket.getEphemeralKeyInfo()`

<!-- YAML
added: v5.0.0
-->

* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Тип, имя и размер параметра эфемерного обмена ключами ([perfect forward secrecy][perfect forward secrecy])
на клиентском соединении. Пустой объект, если обмен не эфемерный. На серверном
сокете возвращает `null` (поддерживается только клиент). Типы: `'DH'` и `'ECDH'`;
поле `name` только при типе `'ECDH'`.

Пример: `{ type: 'ECDH', name: 'prime256v1', size: 256 }`.

### `tlsSocket.getFinished()`

<!-- YAML
added: v9.9.0
-->

* Возвращает: [<Buffer>](buffer.md#buffer) | undefined The latest `Finished` message that has been
  sent to the socket as part of a SSL/TLS handshake, or `undefined` if
  no `Finished` message has been sent yet.

As the `Finished` messages are message digests of the complete handshake
(with a total of 192 bits for TLS 1.0 and more for SSL 3.0), they can
be used for external authentication procedures when the authentication
provided by SSL/TLS is not desired or is not enough.

Corresponds to the `SSL_get_finished` routine in OpenSSL and may be used
to implement the `tls-unique` channel binding from [RFC 5929][RFC 5929].

### `tlsSocket.getPeerCertificate([detailed])`

<!-- YAML
added: v0.11.4
-->

* `detailed` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` — полная цепочка сертификатов, иначе только
  сертификат пира.
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект сертификата.

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

* `ca` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` для центра сертификации (CA), иначе `false`.
* `raw` [<Buffer>](buffer.md#buffer) Данные сертификата X.509 в кодировке DER.
* `subject` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Субъект: Country (`C`), StateOrProvince (`ST`), Locality (`L`),
  Organization (`O`), OrganizationalUnit (`OU`), CommonName (`CN`). Для TLS
  `CN` обычно — DNS-имя. Пример:
  `{C: 'UK', ST: 'BC', L: 'Metro', O: 'Node Fans', OU: 'Docs', CN: 'example.com'}`.
* `issuer` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Издатель, в тех же полях, что и `subject`.
* `valid_from` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Начало срока действия.
* `valid_to` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Конец срока действия.
* `serialNumber` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Серийный номер в hex. Пример: `'B9B0D332A1AA5635'`.
* `fingerprint` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) SHA-1 от DER, строка с `:` между байтами в hex.
* `fingerprint256` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) SHA-256 от DER, формат с `:`.
* `fingerprint512` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) SHA-512 от DER, формат с `:`.
* `ext_key_usage` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) (необяз.) Расширенное использование ключа, набор OID.
* `subjectaltname` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (необяз.) Альтернативные имена субъекта.
* `infoAccess` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) (необяз.) AuthorityInfoAccess для OCSP.
* `issuerCertificate` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) (необяз.) Сертификат издателя; у самоподписанных
  возможна циклическая ссылка.

В зависимости от типа ключа могут быть поля открытого ключа.

Для RSA:

* `bits` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер ключа в битах. Пример: `1024`.
* `exponent` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Экспонента в hex-записи. Пример: `'0x010001'`.
* `modulus` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Модуль в hex. Пример: `'B56CE45CB7...'`.
* `pubkey` [<Buffer>](buffer.md#buffer) Открытый ключ.

Для EC:

* `pubkey` [<Buffer>](buffer.md#buffer) Открытый ключ.
* `bits` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер в битах. Пример: `256`.
* `asn1Curve` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (необяз.) Имя ASN.1 OID кривой. Пример: `'prime256v1'`.
* `nistCurve` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) (необяз.) Имя кривой NIST, если есть. Пример: `'P-256'`.

Example certificate:

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

* Возвращает: [<Buffer>](buffer.md#buffer) | undefined Последнее ожидаемое или полученное сообщение
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

* Возвращает: [<X509Certificate>](crypto.md)

Сертификат пира как объект [X509Certificate](crypto.md).

Если сертификата нет или сокет уничтожен — `undefined`.

### `tlsSocket.getProtocol()`

<!-- YAML
added: v5.7.0
-->

* Возвращает: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строка с согласованной версией SSL/TLS. Для подключённых сокетов без завершённого
рукопожатия — `'unknown'`. Для серверных сокетов или отключённого клиента — `null`.

Protocol versions are:

* `'SSLv3'`
* `'TLSv1'`
* `'TLSv1.1'`
* `'TLSv1.2'`
* `'TLSv1.3'`

См. документацию OpenSSL [`SSL_get_version`][`SSL_get_version`].

### `tlsSocket.getSession()`

<!-- YAML
added: v0.11.4
-->

* Тип: [<Buffer>](buffer.md#buffer)

Данные TLS-сессии или `undefined`, если сессия не согласована. На клиенте их
можно передать в опцию `session` [`tls.connect()`][`tls.connect()`] для возобновления. На сервере
полезно для отладки.

См. [возобновление сеанса][Session Resumption].

`getSession()` только для TLSv1.2 и ниже. Для TLSv1.3 используйте событие [`'session'`][`'session'`]
(оно же подходит для TLSv1.2 и ниже).

### `tlsSocket.getSharedSigalgs()`

<!-- YAML
added: v12.11.0
-->

* Возвращает: [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Общие алгоритмы подписи сервера и клиента по убыванию предпочтения.

See
[SSL\_get\_shared\_sigalgs](https://www.openssl.org/docs/man1.1.1/man3/SSL_get_shared_sigalgs.html)
for more information.

### `tlsSocket.getTLSTicket()`

<!-- YAML
added: v0.11.4
-->

* Тип: [<Buffer>](buffer.md#buffer)

На клиенте — билет сессии TLS, если есть, иначе `undefined`. На сервере всегда
`undefined`.

Полезно для отладки.

См. [Session Resumption][Session Resumption].

### `tlsSocket.getX509Certificate()`

<!-- YAML
added: v15.9.0
-->

* Возвращает: [<X509Certificate>](crypto.md)

Локальный сертификат как [X509Certificate](crypto.md).

Если локального сертификата нет или сокет уничтожен — `undefined`.

### `tlsSocket.isSessionReused()`

<!-- YAML
added: v0.5.6
-->

* Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the session was reused, `false` otherwise.

See [Session Resumption][Session Resumption] for more information.

### `tlsSocket.localAddress`

<!-- YAML
added: v0.11.4
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление локального IP.

### `tlsSocket.localPort`

<!-- YAML
added: v0.11.4
-->

* Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Числовой локальный порт.

### `tlsSocket.remoteAddress`

<!-- YAML
added: v0.11.4
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Строковое представление удалённого IP, например `'74.125.127.100'` или
`'2001:4860:a005::68'`.

### `tlsSocket.remoteFamily`

<!-- YAML
added: v0.11.4
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Семейство удалённого IP: `'IPv4'` или `'IPv6'`.

### `tlsSocket.remotePort`

<!-- YAML
added: v0.11.4
-->

* Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

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

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `rejectUnauthorized` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если не `false`, сертификат сервера проверяется
    по списку ЦС. При ошибке — событие `'error'`, `err.code` — код OpenSSL.
    **По умолчанию:** `true`.
  * `requestCert`

* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Если `renegotiate()` вернул `true`, `callback` один раз
  привязывается к [`'secure'`][`'secure'`]. Если `false` — вызов на следующем тике с ошибкой,
  если сокет не уничтожен.

* Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если пересогласование начато, иначе `false`.

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

* `context` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [<tls.SecureContext>](tls.md#tlscreatesecurecontextoptions) Объект как минимум с `key` и `cert` из опций
  [`tls.createSecureContext()`][`tls.createSecureContext()`], либо готовый контекст из [`tls.createSecureContext()`][`tls.createSecureContext()`].

`tlsSocket.setKeyCert()` задаёт закрытый ключ и сертификат для сокета. Удобно для
выбора сертификата сервера в `ALPNCallback`.

### `tlsSocket.setMaxSendFragment(size)`

<!-- YAML
added: v0.11.11
-->

* `size` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер TLS-фрагмента, не больше `16384`.
  **По умолчанию:** `16384`.
* Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

* `hostname` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя хоста или IP для проверки сертификата.
* `cert` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Объект сертификата][certificate object] пира.
* Возвращает: [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | undefined

Проверяет, что сертификат `cert` выдан для `hostname`.

При ошибке возвращает объект `Error` с полями `reason`, `host` и `cert`. При успехе —
`undefined`.

Предназначена для опции `checkServerIdentity` в [`tls.connect()`][`tls.connect()`] и работы с
[объектом сертификата][certificate object]. В других случаях рассмотрите
[`x509.checkHost()`][`x509.checkHost()`].

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

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `enableTrace`: See [`tls.createServer()`][`tls.createServer()`]
  * `host` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Host the client should connect to. **Default:**
    `'localhost'`.
  * `port` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Port the client should connect to.
  * `path` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Creates Unix socket connection to path. If this option is
    specified, `host` and `port` are ignored.
  * `socket` [<stream.Duplex>](stream.md#class-streamduplex) Establish secure connection on a given socket
    rather than creating a new socket. Typically, this is an instance of
    [`net.Socket`][`net.Socket`], but any `Duplex` stream is allowed.
    If this option is specified, `path`, `host`, and `port` are ignored,
    except for certificate validation. Usually, a socket is already connected
    when passed to `tls.connect()`, but it can be connected later.
    Connection/disconnection/destruction of `socket` is the user's
    responsibility; calling `tls.connect()` will not cause `net.connect()` to be
    called.
  * `allowHalfOpen` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `false`, then the socket will
    automatically end the writable side when the readable side ends. If the
    `socket` option is set, this option has no effect. See the `allowHalfOpen`
    option of [`net.Socket`][`net.Socket`] for details. **Default:** `false`.
  * `rejectUnauthorized` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If not `false`, the server certificate is
    verified against the list of supplied CAs. An `'error'` event is emitted if
    verification fails; `err.code` contains the OpenSSL error code. **Default:**
    `true`.
  * `pskCallback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) For TLS-PSK negotiation, see [Pre-shared keys][Pre-shared keys].
  * `ALPNProtocols` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) An array of strings,
    or a single `Buffer`, `TypedArray`, or `DataView` containing the supported
    ALPN protocols. Buffers should have the format `[len][name][len][name]...`
    e.g. `'\x08http/1.1\x08http/1.0'`, where the `len` byte is the length of the
    next protocol name. Passing an array is usually much simpler, e.g.
    `['http/1.1', 'http/1.0']`. Protocols earlier in the list have higher
    preference than those later.
  * `servername` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Server name for the SNI (Server Name Indication) TLS
    extension. It is the name of the host being connected to, and must be a host
    name, and not an IP address. It can be used by a multi-homed server to
    choose the correct certificate to present to the client, see the
    `SNICallback` option to [`tls.createServer()`][`tls.createServer()`].
  * `checkServerIdentity(servername, cert)` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function
    to be used (instead of the builtin `tls.checkServerIdentity()` function)
    when checking the server's host name (or the provided `servername` when
    explicitly set) against the certificate. This should return an [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) if
    verification fails. The method should return `undefined` if the `servername`
    and `cert` are verified.
  * `session` [<Buffer>](buffer.md#buffer) A `Buffer` instance, containing TLS session.
  * `requestOCSP` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, specifies that the OCSP status request
    extension will be added to the client hello and an `'OCSPResponse'` event
    will be emitted on the socket before establishing a secure communication.
  * `minDHSize` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Minimum size of the DH parameter in bits to accept a
    TLS connection. When a server offers a DH parameter with a size less
    than `minDHSize`, the TLS connection is destroyed and an error is thrown.
    **Default:** `1024`.
  * `highWaterMark` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Consistent with the readable stream `highWaterMark` parameter.
    **Default:** `16 * 1024`.
  * `timeout`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If set and if a socket is created internally, will call
    [`socket.setTimeout(timeout)`][`socket.setTimeout(timeout)`] after the socket is created, but before it
    starts the connection.
  * `secureContext`: TLS context object created with
    [`tls.createSecureContext()`][`tls.createSecureContext()`]. If a `secureContext` is _not_ provided, one
    will be created by passing the entire `options` object to
    `tls.createSecureContext()`.
  * `onread` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) If the `socket` option is missing, incoming data is
    stored in a single `buffer` and passed to the supplied `callback` when
    data arrives on the socket, otherwise the option is ignored. See the
    `onread` option of [`net.Socket`][`net.Socket`] for details.
  * ...: [`tls.createSecureContext()`][`tls.createSecureContext()`] options that are used if the
    `secureContext` option is missing, otherwise they are ignored.
  * ...: Any [`socket.connect()`][`socket.connect()`] option not already listed.
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [<tls.TLSSocket>](tls.md#class-tlstlssocket)

The `callback` function, if specified, will be added as a listener for the
[`'secureConnect'`][`'secureConnect'`] event.

`tls.connect()` returns a [`tls.TLSSocket`][`tls.TLSSocket`] object.

Unlike the `https` API, `tls.connect()` does not enable the
SNI (Server Name Indication) extension by default, which may cause some
servers to return an incorrect certificate or reject the connection
altogether. To enable SNI, set the `servername` option in addition
to `host`.

The following illustrates a client for the echo server example from
[`tls.createServer()`][`tls.createServer()`]:

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

To generate the certificate and key for this example, run:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout client-key.pem -out client-cert.pem
```

Then, to generate the `server-cert.pem` certificate for this example, run:

```bash
openssl pkcs12 -certpbe AES-256-CBC -export -out server-cert.pem \
  -inkey client-key.pem -in client-cert.pem
```

## `tls.connect(path[, options][, callback])`

<!-- YAML
added: v0.11.3
-->

* `path` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Default value for `options.path`.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`tls.connect()`][`tls.connect()`].
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) See [`tls.connect()`][`tls.connect()`].
* Возвращает: [<tls.TLSSocket>](tls.md#class-tlstlssocket)

Same as [`tls.connect()`][`tls.connect()`] except that `path` can be provided
as an argument instead of an option.

A path option, if specified, will take precedence over the path argument.

## `tls.connect(port[, host][, options][, callback])`

<!-- YAML
added: v0.11.3
-->

* `port` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Default value for `options.port`.
* `host` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Default value for `options.host`.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`tls.connect()`][`tls.connect()`].
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) See [`tls.connect()`][`tls.connect()`].
* Возвращает: [<tls.TLSSocket>](tls.md#class-tlstlssocket)

Same as [`tls.connect()`][`tls.connect()`] except that `port` and `host` can be provided
as arguments instead of options.

A port or host option, if specified, will take precedence over any port or host
argument.

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

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `allowPartialTrustChain` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Treat intermediate (non-self-signed)
    certificates in the trust CA certificate list as trusted.
  * `ca` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Buffer[]>](buffer.md#buffer) Optionally override the trusted CA
    certificates. If not specified, the CA certificates trusted by default are
    the same as the ones returned by [`tls.getCACertificates()`][`tls.getCACertificates()`] using the
    `default` type.  If specified, the default list would be completely replaced
    (instead of being concatenated) by the certificates in the `ca` option.
    Users need to concatenate manually if they wish to add additional certificates
    instead of completely overriding the default.
    The value can be a string or `Buffer`, or an `Array` of
    strings and/or `Buffer`s. Any string or `Buffer` can contain multiple PEM
    CAs concatenated together. The peer's certificate must be chainable to a CA
    trusted by the server for the connection to be authenticated. When using
    certificates that are not chainable to a well-known CA, the certificate's CA
    must be explicitly specified as a trusted or the connection will fail to
    authenticate.
    If the peer uses a certificate that doesn't match or chain to one of the
    default CAs, use the `ca` option to provide a CA certificate that the peer's
    certificate can match or chain to.
    For self-signed certificates, the certificate is its own CA, and must be
    provided.
    For PEM encoded certificates, supported types are "TRUSTED CERTIFICATE",
    "X509 CERTIFICATE", and "CERTIFICATE".
  * `cert` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Buffer[]>](buffer.md#buffer) Cert chains in PEM format. One
    cert chain should be provided per private key. Each cert chain should
    consist of the PEM formatted certificate for a provided private `key`,
    followed by the PEM formatted intermediate certificates (if any), in order,
    and not including the root CA (the root CA must be pre-known to the peer,
    see `ca`). When providing multiple cert chains, they do not have to be in
    the same order as their private keys in `key`. If the intermediate
    certificates are not provided, the peer will not be able to validate the
    certificate, and the handshake will fail.
  * `sigalgs` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Colon-separated list of supported signature algorithms.
    The list can contain digest algorithms (`SHA256`, `MD5` etc.), public key
    algorithms (`RSA-PSS`, `ECDSA` etc.), combination of both (e.g
    'RSA+SHA384') or TLS v1.3 scheme names (e.g. `rsa_pss_pss_sha512`).
    See [OpenSSL man pages](https://www.openssl.org/docs/man1.1.1/man3/SSL_CTX_set1_sigalgs_list.html)
    for more info.
  * `ciphers` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Cipher suite specification, replacing the default. For
    more information, see [Modifying the default TLS cipher suite][Modifying the default TLS cipher suite]. Permitted
    ciphers can be obtained via [`tls.getCiphers()`][`tls.getCiphers()`]. Cipher names must be
    uppercased in order for OpenSSL to accept them.
  * `clientCertEngine` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of an OpenSSL engine which can provide the
    client certificate. **Deprecated.**
  * `crl` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Buffer[]>](buffer.md#buffer) PEM formatted CRLs (Certificate
    Revocation Lists).
  * `dhparam` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) `'auto'` or custom Diffie-Hellman parameters,
    required for non-ECDHE [perfect forward secrecy][perfect forward secrecy]. If omitted or invalid,
    the parameters are silently discarded and DHE ciphers will not be available.
    [ECDHE][ECDHE]-based [perfect forward secrecy][perfect forward secrecy] will still be available.
  * `ecdhCurve` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) A string describing a named curve or a colon separated
    list of curve NIDs or names, for example `P-521:P-384:P-256`, to use for
    ECDH key agreement. Set to `auto` to select the
    curve automatically. Use [`crypto.getCurves()`][`crypto.getCurves()`] to obtain a list of
    available curve names. On recent releases, `openssl ecparam -list_curves`
    will also display the name and description of each available elliptic curve.
    **Default:** [`tls.DEFAULT_ECDH_CURVE`][`tls.DEFAULT_ECDH_CURVE`].
  * `honorCipherOrder` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Attempt to use the server's cipher suite
    preferences instead of the client's. When `true`, causes
    `SSL_OP_CIPHER_SERVER_PREFERENCE` to be set in `secureOptions`, see
    [OpenSSL Options][OpenSSL Options] for more information.
  * `key` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Buffer[]>](buffer.md#buffer) | [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Private keys in PEM
    format. PEM allows the option of private keys being encrypted. Encrypted
    keys will be decrypted with `options.passphrase`. Multiple keys using
    different algorithms can be provided either as an array of unencrypted key
    strings or buffers, or an array of objects in the form
    `{pem: <string|buffer>[, passphrase: <string>]}`. The object form can only
    occur in an array. `object.passphrase` is optional. Encrypted keys will be
    decrypted with `object.passphrase` if provided, or `options.passphrase` if
    it is not.
  * `privateKeyEngine` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of an OpenSSL engine to get private key
    from. Should be used together with `privateKeyIdentifier`. **Deprecated.**
  * `privateKeyIdentifier` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Identifier of a private key managed by
    an OpenSSL engine. Should be used together with `privateKeyEngine`.
    Should not be set together with `key`, because both options define a
    private key in different ways. **Deprecated.**
  * `maxVersion` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Optionally set the maximum TLS version to allow. One
    of `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`. Cannot be specified
    along with the `secureProtocol` option; use one or the other.
    **Default:** [`tls.DEFAULT_MAX_VERSION`][`tls.DEFAULT_MAX_VERSION`].
  * `minVersion` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Optionally set the minimum TLS version to allow. One
    of `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`. Cannot be specified
    along with the `secureProtocol` option; use one or the other. Avoid
    setting to less than TLSv1.2, but it may be required for
    interoperability. Versions before TLSv1.2 may require downgrading the [OpenSSL Security Level][OpenSSL Security Level].
    **Default:** [`tls.DEFAULT_MIN_VERSION`][`tls.DEFAULT_MIN_VERSION`].
  * `passphrase` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Shared passphrase used for a single private key and/or
    a PFX.
  * `pfx` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Buffer[]>](buffer.md#buffer) | [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) PFX or PKCS12 encoded
    private key and certificate chain. `pfx` is an alternative to providing
    `key` and `cert` individually. PFX is usually encrypted, if it is,
    `passphrase` will be used to decrypt it. Multiple PFX can be provided either
    as an array of unencrypted PFX buffers, or an array of objects in the form
    `{buf: <string|buffer>[, passphrase: <string>]}`. The object form can only
    occur in an array. `object.passphrase` is optional. Encrypted PFX will be
    decrypted with `object.passphrase` if provided, or `options.passphrase` if
    it is not.
  * `secureOptions` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optionally affect the OpenSSL protocol behavior,
    which is not usually necessary. This should be used carefully if at all!
    Value is a numeric bitmask of the `SSL_OP_*` options from
    [OpenSSL Options][OpenSSL Options].
  * `secureProtocol` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Legacy mechanism to select the TLS protocol
    version to use, it does not support independent control of the minimum and
    maximum version, and does not support limiting the protocol to TLSv1.3. Use
    `minVersion` and `maxVersion` instead. The possible values are listed as
    [SSL\_METHODS][SSL_METHODS], use the function names as strings. For example,
    use `'TLSv1_1_method'` to force TLS version 1.1, or `'TLS_method'` to allow
    any TLS protocol version up to TLSv1.3. It is not recommended to use TLS
    versions less than 1.2, but it may be required for interoperability.
    **Default:** none, see `minVersion`.
  * `sessionIdContext` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Opaque identifier used by servers to ensure
    session state is not shared between applications. Unused by clients.
  * `ticketKeys` [<Buffer>](buffer.md#buffer) 48-bytes of cryptographically strong pseudorandom
    data. See [Session Resumption][Session Resumption] for more information.
  * `sessionTimeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of seconds after which a TLS session
    created by the server will no longer be resumable. See
    [Session Resumption][Session Resumption] for more information. **Default:** `300`.

[`tls.createServer()`][`tls.createServer()`] sets the default value of the `honorCipherOrder` option
to `true`, other APIs that create secure contexts leave it unset.

[`tls.createServer()`][`tls.createServer()`] uses a 128 bit truncated SHA1 hash value generated
from `process.argv` as the default value of the `sessionIdContext` option, other
APIs that create secure contexts have no default value.

The `tls.createSecureContext()` method creates a `SecureContext` object. It is
usable as an argument to several `tls` APIs, such as [`server.addContext()`][`server.addContext()`],
but has no public methods. The [`tls.Server`][`tls.Server`] constructor and the
[`tls.createServer()`][`tls.createServer()`] method do not support the `secureContext` option.

A key is _required_ for ciphers that use certificates. Either `key` or
`pfx` can be used to provide it.

If the `ca` option is not given, then Node.js will default to using
[Mozilla's publicly trusted list of CAs][Mozilla's publicly trusted list of CAs].

Custom DHE parameters are discouraged in favor of the new `dhparam: 'auto'`
option. When set to `'auto'`, well-known DHE parameters of sufficient strength
will be selected automatically. Otherwise, if necessary, `openssl dhparam` can
be used to create custom parameters. The key length must be greater than or
equal to 1024 bits or else an error will be thrown. Although 1024 bits is
permissible, use 2048 bits or larger for stronger security.

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

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ALPNProtocols` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) An array of strings,
    or a single `Buffer`, `TypedArray`, or `DataView` containing the supported
    ALPN protocols. Buffers should have the format `[len][name][len][name]...`
    e.g. `0x05hello0x05world`, where the first byte is the length of the next
    protocol name. Passing an array is usually much simpler, e.g.
    `['hello', 'world']`. (Protocols should be ordered by their priority.)
  * `ALPNCallback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) If set, this will be called when a
    client opens a connection using the ALPN extension. One argument will
    be passed to the callback: an object containing `servername` and
    `protocols` fields, respectively containing the server name from
    the SNI extension (if any) and an array of ALPN protocol name strings. The
    callback must return either one of the strings listed in
    `protocols`, which will be returned to the client as the selected
    ALPN protocol, or `undefined`, to reject the connection with a fatal alert.
    If a string is returned that does not match one of the client's ALPN
    protocols, an error will be thrown. This option cannot be used with the
    `ALPNProtocols` option, and setting both options will throw an error.
  * `clientCertEngine` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of an OpenSSL engine which can provide the
    client certificate. **Deprecated.**
  * `enableTrace` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, [`tls.TLSSocket.enableTrace()`][`tls.TLSSocket.enableTrace()`] will be
    called on new connections. Tracing can be enabled after the secure
    connection is established, but this option must be used to trace the secure
    connection setup. **Default:** `false`.
  * `handshakeTimeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Abort the connection if the SSL/TLS handshake
    does not finish in the specified number of milliseconds.
    A `'tlsClientError'` is emitted on the `tls.Server` object whenever
    a handshake times out. **Default:** `120000` (120 seconds).
  * `rejectUnauthorized` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If not `false` the server will reject any
    connection which is not authorized with the list of supplied CAs. This
    option only has an effect if `requestCert` is `true`. **Default:** `true`.
  * `requestCert` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true` the server will request a certificate from
    clients that connect and attempt to verify that certificate. **Default:**
    `false`.
  * `sessionTimeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of seconds after which a TLS session
    created by the server will no longer be resumable. See
    [Session Resumption][Session Resumption] for more information. **Default:** `300`.
  * `SNICallback(servername, callback)` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A function that will be
    called if the client supports SNI TLS extension. Two arguments will be
    passed when called: `servername` and `callback`. `callback` is an
    error-first callback that takes two optional arguments: `error` and `ctx`.
    `ctx`, if provided, is a `SecureContext` instance.
    [`tls.createSecureContext()`][`tls.createSecureContext()`] can be used to get a proper `SecureContext`.
    If `callback` is called with a falsy `ctx` argument, the default secure
    context of the server will be used. If `SNICallback` wasn't provided the
    default callback with high-level API will be used (see below).
  * `ticketKeys` [<Buffer>](buffer.md#buffer) 48-bytes of cryptographically strong pseudorandom
    data. See [Session Resumption][Session Resumption] for more information.
  * `pskCallback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) For TLS-PSK negotiation, see [Pre-shared keys][Pre-shared keys].
  * `pskIdentityHint` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) optional hint to send to a client to help
    with selecting the identity during TLS-PSK negotiation. Will be ignored
    in TLS 1.3. Upon failing to set pskIdentityHint `'tlsClientError'` will be
    emitted with `'ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED'` code.
  * ...: Any [`tls.createSecureContext()`][`tls.createSecureContext()`] option can be provided. For
    servers, the identity options (`pfx`, `key`/`cert`, or `pskCallback`)
    are usually required.
  * ...: Any [`net.createServer()`][`net.createServer()`] option can be provided.
* `secureConnectionListener` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [<tls.Server>](#class-tlsserver)

Creates a new [`tls.Server`][`tls.Server`]. The `secureConnectionListener`, if provided, is
automatically set as a listener for the [`'secureConnection'`][`'secureConnection'`] event.

The `ticketKeys` options is automatically shared between `node:cluster` module
workers.

The following illustrates a simple echo server:

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

To generate the certificate and key for this example, run:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
  -keyout server-key.pem -out server-cert.pem
```

Then, to generate the `client-cert.pem` certificate for this example, run:

```bash
openssl pkcs12 -certpbe AES-256-CBC -export -out client-cert.pem \
  -inkey server-key.pem -in server-cert.pem
```

The server can be tested by connecting to it using the example client from
[`tls.connect()`][`tls.connect()`].

## `tls.setDefaultCACertificates(certs)`

<!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

* `certs` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<ArrayBufferView[]>](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) An array of CA certificates in PEM format.

Sets the default CA certificates used by Node.js TLS clients. If the provided
certificates are parsed successfully, they will become the default CA
certificate list returned by [`tls.getCACertificates()`][`tls.getCACertificates()`] and used
by subsequent TLS connections that don't specify their own CA certificates.
The certificates will be deduplicated before being set as the default.

This function only affects the current Node.js thread. Previous
sessions cached by the HTTPS agent won't be affected by this change, so
this method should be called before any unwanted cachable TLS connections are
made.

To use system CA certificates as the default:

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

This function completely replaces the default CA certificate list. To add additional
certificates to the existing defaults, get the current certificates and append to them:

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

* `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The type of CA certificates that will be returned. Valid values
  are `"default"`, `"system"`, `"bundled"` and `"extra"`.
  **Default:** `"default"`.
* Возвращает: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array of PEM-encoded certificates. The array may contain duplicates
  if the same certificate is repeatedly stored in multiple sources.

Returns an array containing the CA certificates from various sources, depending on `type`:

* `"default"`: return the CA certificates that will be used by the Node.js TLS clients by default.
  * When [`--use-bundled-ca`][`--use-bundled-ca`] is enabled (default), or [`--use-openssl-ca`][`--use-openssl-ca`] is not enabled,
    this would include CA certificates from the bundled Mozilla CA store.
  * When [`--use-system-ca`][`--use-system-ca`] is enabled, this would also include certificates from the system's
    trusted store.
  * When [`NODE_EXTRA_CA_CERTS`][`NODE_EXTRA_CA_CERTS`] is used, this would also include certificates loaded from the specified
    file.
* `"system"`: return the CA certificates that are loaded from the system's trusted store, according
  to rules set by [`--use-system-ca`][`--use-system-ca`]. This can be used to get the certificates from the system
  when [`--use-system-ca`][`--use-system-ca`] is not enabled.
* `"bundled"`: return the CA certificates from the bundled Mozilla CA store. This would be the same
  as [`tls.rootCertificates`][`tls.rootCertificates`].
* `"extra"`: return the CA certificates loaded from [`NODE_EXTRA_CA_CERTS`][`NODE_EXTRA_CA_CERTS`]. It's an empty array if
  [`NODE_EXTRA_CA_CERTS`][`NODE_EXTRA_CA_CERTS`] is not set.

## `tls.getCiphers()`

<!-- YAML
added: v0.10.2
-->

* Возвращает: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Returns an array with the names of the supported TLS ciphers. The names are
lower-case for historical reasons, but must be uppercased to be used in
the `ciphers` option of [`tls.createSecureContext()`][`tls.createSecureContext()`].

Not all supported ciphers are enabled by default. See
[Modifying the default TLS cipher suite][Modifying the default TLS cipher suite].

Cipher names that start with `'tls_'` are for TLSv1.3, all the others are for
TLSv1.2 and below.

```js
console.log(tls.getCiphers()); // ['aes128-gcm-sha256', 'aes128-sha', ...]
```

## `tls.rootCertificates`

<!-- YAML
added: v12.3.0
-->

* Тип: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

An immutable array of strings representing the root certificates (in PEM format)
from the bundled Mozilla CA store as supplied by the current Node.js version.

The bundled CA store, as supplied by Node.js, is a snapshot of Mozilla CA store
that is fixed at release time. It is identical on all supported platforms.

To get the actual CA certificates used by the current Node.js instance, which
may include certificates loaded from the system store (if `--use-system-ca` is used)
or loaded from a file indicated by `NODE_EXTRA_CA_CERTS`, use
[`tls.getCACertificates()`][`tls.getCACertificates()`].

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

The default curve name to use for ECDH key agreement in a tls server. The
default value is `'auto'`. See [`tls.createSecureContext()`][`tls.createSecureContext()`] for further
information.

## `tls.DEFAULT_MAX_VERSION`

<!-- YAML
added: v11.4.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The default value of the `maxVersion` option of
  [`tls.createSecureContext()`][`tls.createSecureContext()`]. It can be assigned any of the supported TLS
  protocol versions, `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`.
  **Default:** `'TLSv1.3'`, unless changed using CLI options. Using
  `--tls-max-v1.2` sets the default to `'TLSv1.2'`. Using `--tls-max-v1.3` sets
  the default to `'TLSv1.3'`. If multiple of the options are provided, the
  highest maximum is used.

## `tls.DEFAULT_MIN_VERSION`

<!-- YAML
added: v11.4.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The default value of the `minVersion` option of
  [`tls.createSecureContext()`][`tls.createSecureContext()`]. It can be assigned any of the supported TLS
  protocol versions, `'TLSv1.3'`, `'TLSv1.2'`, `'TLSv1.1'`, or `'TLSv1'`.
  Versions before TLSv1.2 may require downgrading the [OpenSSL Security Level][OpenSSL Security Level].
  **Default:** `'TLSv1.2'`, unless changed using CLI options. Using
  `--tls-min-v1.0` sets the default to `'TLSv1'`. Using `--tls-min-v1.1` sets
  the default to `'TLSv1.1'`. Using `--tls-min-v1.3` sets the default to
  `'TLSv1.3'`. If multiple of the options are provided, the lowest minimum is
  used.

## `tls.DEFAULT_CIPHERS`

<!-- YAML
added: v0.11.3
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The default value of the `ciphers` option of
  [`tls.createSecureContext()`][`tls.createSecureContext()`]. It can be assigned any of the supported
  OpenSSL ciphers.  Defaults to the content of
  `crypto.constants.defaultCoreCipherList`, unless changed using CLI options
  using `--tls-default-ciphers`.

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
