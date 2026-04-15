---
title: Crypto
description: Модуль node:crypto — хэши, HMAC, шифрование, подпись и проверка на базе OpenSSL
---

# Криптография

> Стабильность: 2 — Стабильная

Модуль `node:crypto` предоставляет криптографические возможности, включая обёртки над функциями OpenSSL для хэшей, HMAC, шифрования и расшифрования, подписи и проверки.

=== "MJS"

    ```js
    const { createHmac } = await import('node:crypto');

    const secret = 'abcdefg';
    const hash = createHmac('sha256', secret)
                   .update('I love cupcakes')
                   .digest('hex');
    console.log(hash);
    // Prints:
    //   c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
    ```

=== "CJS"

    ```js
    const { createHmac } = require('node:crypto');

    const secret = 'abcdefg';
    const hash = createHmac('sha256', secret)
                   .update('I love cupcakes')
                   .digest('hex');
    console.log(hash);
    // Prints:
    //   c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
    ```

## Когда поддержка crypto недоступна

Node.js может быть собран без модуля `node:crypto`. Тогда `import` из `crypto` или вызов `require('node:crypto')` приведут к ошибке.

В CommonJS ошибку можно перехватить через try/catch:

=== "CJS"

    ```js
    let crypto;
    try {
      crypto = require('node:crypto');
    } catch (err) {
      console.error('crypto support is disabled!');
    }
    ```

При лексическом `import` в ESM ошибку можно перехватить только если обработчик `process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль (например через preload).

Если код может выполняться в сборке Node.js без crypto, вместо лексического `import` используйте динамический [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import):

=== "MJS"

    ```js
    let crypto;
    try {
      crypto = await import('node:crypto');
    } catch (err) {
      console.error('crypto support is disabled!');
    }
    ```

## Типы асимметричных ключей {#asymmetric-key-types}

В таблице — типы асимметричных ключей, которые распознаёт API [`KeyObject`](#class-keyobject), и поддерживаемые форматы импорта/экспорта.

| Тип ключа | Описание | OID | `'pem'` | `'der'` | `'jwk'` | `'raw-public'` | `'raw-private'` | `'raw-seed'` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `'dh'` | Diffie-Hellman | 1.2.840.113549.1.3.1 | ✔ | ✔ |  |  |  |  |
| `'dsa'` | DSA | 1.2.840.10040.4.1 | ✔ | ✔ |  |  |  |  |
| `'ec'` | Elliptic curve | 1.2.840.10045.2.1 | ✔ | ✔ | ✔ | ✔ | ✔ |  |
| `'ed25519'` | Ed25519 | 1.3.101.112 | ✔ | ✔ | ✔ | ✔ | ✔ |  |
| `'ed448'` | Ed448 | 1.3.101.113 | ✔ | ✔ | ✔ | ✔ | ✔ |  |
| `'ml-dsa-44'`[^openssl35] | ML-DSA-44 | 2.16.840.1.101.3.4.3.17 | ✔ | ✔ | ✔ | ✔ |  | ✔ |
| `'ml-dsa-65'`[^openssl35] | ML-DSA-65 | 2.16.840.1.101.3.4.3.18 | ✔ | ✔ | ✔ | ✔ |  | ✔ |
| `'ml-dsa-87'`[^openssl35] | ML-DSA-87 | 2.16.840.1.101.3.4.3.19 | ✔ | ✔ | ✔ | ✔ |  | ✔ |
| `'ml-kem-512'`[^openssl35] | ML-KEM-512 | 2.16.840.1.101.3.4.4.1 | ✔ | ✔ |  | ✔ |  | ✔ |
| `'ml-kem-768'`[^openssl35] | ML-KEM-768 | 2.16.840.1.101.3.4.4.2 | ✔ | ✔ |  | ✔ |  | ✔ |
| `'ml-kem-1024'`[^openssl35] | ML-KEM-1024 | 2.16.840.1.101.3.4.4.3 | ✔ | ✔ |  | ✔ |  | ✔ |
| `'rsa-pss'` | RSA PSS | 1.2.840.113549.1.1.10 | ✔ | ✔ |  |  |  |  |
| `'rsa'` | RSA | 1.2.840.113549.1.1.1 | ✔ | ✔ | ✔ |  |  |  |
| `'slh-dsa-sha2-128f'`[^openssl35] | SLH-DSA-SHA2-128f | 2.16.840.1.101.3.4.3.21 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-sha2-128s'`[^openssl35] | SLH-DSA-SHA2-128s | 2.16.840.1.101.3.4.3.20 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-sha2-192f'`[^openssl35] | SLH-DSA-SHA2-192f | 2.16.840.1.101.3.4.3.23 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-sha2-192s'`[^openssl35] | SLH-DSA-SHA2-192s | 2.16.840.1.101.3.4.3.22 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-sha2-256f'`[^openssl35] | SLH-DSA-SHA2-256f | 2.16.840.1.101.3.4.3.25 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-sha2-256s'`[^openssl35] | SLH-DSA-SHA2-256s | 2.16.840.1.101.3.4.3.24 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-shake-128f'`[^openssl35] | SLH-DSA-SHAKE-128f | 2.16.840.1.101.3.4.3.27 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-shake-128s'`[^openssl35] | SLH-DSA-SHAKE-128s | 2.16.840.1.101.3.4.3.26 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-shake-192f'`[^openssl35] | SLH-DSA-SHAKE-192f | 2.16.840.1.101.3.4.3.29 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-shake-192s'`[^openssl35] | SLH-DSA-SHAKE-192s | 2.16.840.1.101.3.4.3.28 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-shake-256f'`[^openssl35] | SLH-DSA-SHAKE-256f | 2.16.840.1.101.3.4.3.31 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'slh-dsa-shake-256s'`[^openssl35] | SLH-DSA-SHAKE-256s | 2.16.840.1.101.3.4.3.30 | ✔ | ✔ |  | ✔ | ✔ |  |
| `'x25519'` | X25519 | 1.3.101.110 | ✔ | ✔ | ✔ | ✔ | ✔ |  |
| `'x448'` | X448 | 1.3.101.111 | ✔ | ✔ | ✔ | ✔ | ✔ |  |

### Форматы ключей

Асимметричные ключи можно представить в нескольких форматах. **Рекомендуется один раз импортировать материал ключа в [`KeyObject`](#class-keyobject) и переиспользовать его** для всех дальнейших операций — так не повторяется разбор и достигается лучшая производительность.

Если [`KeyObject`](#class-keyobject) неудобен (например ключ приходит в сообщении протокола и используется один раз), большинство криптографических функций принимают строку PEM или объект с форматом и материалом ключа. Полный набор опций — в [`crypto.createPublicKey()`](#cryptocreatepublickeykey), [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey) и [`keyObject.export()`](#keyobjectexportoptions).

#### KeyObject

[`KeyObject`](#class-keyobject) — представление разобранного ключа в памяти. Создаётся через [`crypto.createPublicKey()`](#cryptocreatepublickeykey), [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey), [`crypto.createSecretKey()`](#cryptocreatesecretkeykey-encoding) или функции генерации, например [`crypto.generateKeyPair()`](#cryptogeneratekeypairtype-options-callback). Первая криптографическая операция с данным [`KeyObject`](#class-keyobject) может быть медленнее последующих: OpenSSL лениво инициализирует внутренние кэши при первом использовании.

#### PEM и DER

PEM и DER — традиционные кодировки асимметричных ключей на базе структур ASN.1.

-   **PEM** — текстовая кодировка: DER в Base64 между строками заголовка и подвала (например `-----BEGIN PUBLIC KEY-----`). Строки PEM можно передавать напрямую во многие операции.
-   **DER** — двоичная кодировка тех же структур ASN.1. Для входа DER нужно явно указать `type` (обычно `'spki'` или `'pkcs8'`).

#### JSON Web Key (JWK)

JSON Web Key (JWK) — представление ключа в JSON по [RFC 7517](https://www.rfc-editor.org/rfc/rfc7517.txt). Компоненты кодируются в Base64url внутри объекта. Для RSA JWK снижает накладные расходы разбора ASN.1 и часто даёт самый быстрый импорт из сериализованных форматов.

#### «Сырые» форматы ключей

> Стабильность: 1.1 — Активная разработка

Форматы `'raw-public'`, `'raw-private'` и `'raw-seed'` позволяют импортировать и экспортировать сырой материал ключа без обёртки. Подробности — [`keyObject.export()`](#keyobjectexportoptions), [`crypto.createPublicKey()`](#cryptocreatepublickeykey), [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey).

`'raw-public'` обычно самый быстрый способ импорта открытого ключа. `'raw-private'` и `'raw-seed'` не всегда быстрее других форматов: в них только скаляр/seed закрытого ключа — для использования часто нужно вычислить открытую часть (умножение на кривой, развёртывание seed), что дорого. В других форматах уже есть обе части ключа.

### Выбор формата ключа

**По возможности используйте [`KeyObject`](#class-keyobject)** — создайте из любого доступного формата и переиспользуйте. Ниже — про выбор формата сериализации при импорте в [`KeyObject`](#class-keyobject) или при передаче материала inline, когда [`KeyObject`](#class-keyobject) не подходит.

#### Импорт ключей

Если [`KeyObject`](#class-keyobject) создаётся для многократного использования, стоимость импорта платится один раз, и более быстрый формат снижает задержку старта.

Импорт состоит из **разбора обёртки** и **вычислений по ключу** (восстановление полного ключа: открытый ключ из закрытого скаляра, развёртывание seed и т. д.). Что доминирует, зависит от типа ключа. Например:

-   Открытые ключи — `'raw-public'` обычно быстрее всех сериализованных форматов: нет разбора ASN.1 и Base64.
-   Закрытые EC — `'raw-private'` быстрее PEM/DER (меньше ASN.1). На больших кривых (P-384, P-521) вычисление открытой точки дорого, выигрыш меньше.
-   RSA — `'jwk'` часто самый быстрый сериализованный формат: компоненты как целые в Base64url без ASN.1.

#### Материал ключа inline в операциях

Если [`KeyObject`](#class-keyobject) нельзя переиспользовать (ключ пришёл как сырые байты в сообщении и используется один раз), функции обычно принимают PEM или объект с форматом и материалом. Полная стоимость — импорт плюс сама криптооперация.

Если доминирует тяжёлая операция (подпись RSA, ECDH на P-384/P-521), формат сериализации почти не влияет на пропускную способность — выбирайте удобный. Для лёгких операций (Ed25519) импорт заметнее, и быстрые `'raw-public'` / `'raw-private'` дают выигрыш.

Даже при нескольких использованиях одного материала лучше импортировать в [`KeyObject`](#class-keyobject), чем снова передавать сырой или PEM.

### Примеры

Переиспользование [`KeyObject`](#class-keyobject) для подписи и проверки:

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    const { generateKeyPair, sign, verify } = await import('node:crypto');

    const { publicKey, privateKey } = await promisify(generateKeyPair)('ed25519');

    // KeyObject хранит разобранный ключ в памяти и переиспользуется
    // без повторного разбора.
    const data = new TextEncoder().encode('message to sign');
    const signature = sign(null, data, privateKey);
    verify(null, data, publicKey, signature);
    ```

Пример: импорт ключей разных форматов в [`KeyObject`](#class-keyobject):

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    const {
      createPrivateKey, createPublicKey, generateKeyPair,
    } = await import('node:crypto');

    const generated = await promisify(generateKeyPair)('ed25519');

    // PEM
    const privatePem = generated.privateKey.export({ format: 'pem', type: 'pkcs8' });
    const publicPem = generated.publicKey.export({ format: 'pem', type: 'spki' });
    createPrivateKey(privatePem);
    createPublicKey(publicPem);

    // DER — нужен явный type
    const privateDer = generated.privateKey.export({ format: 'der', type: 'pkcs8' });
    const publicDer = generated.publicKey.export({ format: 'der', type: 'spki' });
    createPrivateKey({ key: privateDer, format: 'der', type: 'pkcs8' });
    createPublicKey({ key: publicDer, format: 'der', type: 'spki' });

    // JWK
    const privateJwk = generated.privateKey.export({ format: 'jwk' });
    const publicJwk = generated.publicKey.export({ format: 'jwk' });
    createPrivateKey({ key: privateJwk, format: 'jwk' });
    createPublicKey({ key: publicJwk, format: 'jwk' });

    // Raw
    const rawPriv = generated.privateKey.export({ format: 'raw-private' });
    const rawPub = generated.publicKey.export({ format: 'raw-public' });
    createPrivateKey({ key: rawPriv, format: 'raw-private', asymmetricKeyType: 'ed25519' });
    createPublicKey({ key: rawPub, format: 'raw-public', asymmetricKeyType: 'ed25519' });
    ```

Пример: передача материала ключа напрямую в [`crypto.sign()`](#cryptosignalgorithm-data-key-callback) и [`crypto.verify()`](#cryptoverifyalgorithm-data-key-signature-callback) без предварительного [`KeyObject`](#class-keyobject):

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    const { generateKeyPair, sign, verify } = await import('node:crypto');

    const generated = await promisify(generateKeyPair)('ed25519');

    const data = new TextEncoder().encode('message to sign');

    // PEM strings
    const privatePem = generated.privateKey.export({ format: 'pem', type: 'pkcs8' });
    const publicPem = generated.publicKey.export({ format: 'pem', type: 'spki' });
    const sig1 = sign(null, data, privatePem);
    verify(null, data, publicPem, sig1);

    // JWK objects
    const privateJwk = generated.privateKey.export({ format: 'jwk' });
    const publicJwk = generated.publicKey.export({ format: 'jwk' });
    const sig2 = sign(null, data, { key: privateJwk, format: 'jwk' });
    verify(null, data, { key: publicJwk, format: 'jwk' }, sig2);

    // Raw key bytes
    const rawPriv = generated.privateKey.export({ format: 'raw-private' });
    const rawPub = generated.publicKey.export({ format: 'raw-public' });
    const sig3 = sign(null, data, {
      key: rawPriv, format: 'raw-private', asymmetricKeyType: 'ed25519',
    });
    verify(null, data, {
      key: rawPub, format: 'raw-public', asymmetricKeyType: 'ed25519',
    }, sig3);
    ```

Пример: для ключей EC при импорте сырых ключей нужна опция `namedCurve`:

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    const {
      createPrivateKey, createPublicKey, generateKeyPair, sign, verify,
    } = await import('node:crypto');

    const generated = await promisify(generateKeyPair)('ec', {
      namedCurve: 'P-256',
    });

    // Export the raw EC public key (uncompressed by default).
    const rawPublicKey = generated.publicKey.export({ format: 'raw-public' });

    // The following is equivalent.
    const rawPublicKeyUncompressed = generated.publicKey.export({
      format: 'raw-public',
      type: 'uncompressed',
    });

    // Export compressed point format.
    const rawPublicKeyCompressed = generated.publicKey.export({
      format: 'raw-public',
      type: 'compressed',
    });

    // Export the raw EC private key.
    const rawPrivateKey = generated.privateKey.export({ format: 'raw-private' });

    // Import the raw EC keys.
    // Both compressed and uncompressed point formats are accepted.
    const publicKey = createPublicKey({
      key: rawPublicKey,
      format: 'raw-public',
      asymmetricKeyType: 'ec',
      namedCurve: 'P-256',
    });
    const privateKey = createPrivateKey({
      key: rawPrivateKey,
      format: 'raw-private',
      asymmetricKeyType: 'ec',
      namedCurve: 'P-256',
    });

    const data = new TextEncoder().encode('message to sign');
    const signature = sign('sha256', data, privateKey);
    verify('sha256', data, publicKey, signature);
    ```

Пример: экспорт и импорт сырых seed:

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    const {
      createPrivateKey, decapsulate, encapsulate, generateKeyPair,
    } = await import('node:crypto');

    const generated = await promisify(generateKeyPair)('ml-kem-768');

    // Export the raw seed (64 bytes for ML-KEM).
    const seed = generated.privateKey.export({ format: 'raw-seed' });

    // Import the raw seed.
    const privateKey = createPrivateKey({
      key: seed,
      format: 'raw-seed',
      asymmetricKeyType: 'ml-kem-768',
    });

    const { ciphertext } = encapsulate(generated.publicKey);
    decapsulate(privateKey, ciphertext);
    ```

## Класс: `Certificate`

SPKAC — механизм запроса на подпись сертификата, изначально в Netscape и формально вошедший в элемент HTML5 `keygen`.

`<keygen>` устарел с [HTML 5.2](https://www.w3.org/TR/html52/changes.html#features-removed); в новых проектах элемент не используют.

Модуль `node:crypto` предоставляет класс `Certificate` для работы с данными SPKAC. Чаще всего это вывод элемента `<keygen>`. Внутри Node.js использует [реализацию SPKAC в OpenSSL](https://www.openssl.org/docs/man3.0/man1/openssl-spkac.html).

### Статический метод: `Certificate.exportChallenge(spkac[, encoding])`

-   `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) компонент challenge структуры `spkac` (открытый ключ и challenge)

=== "MJS"

    ```js
    const { Certificate } = await import('node:crypto');
    const spkac = getSpkacSomehow();
    const challenge = Certificate.exportChallenge(spkac);
    console.log(challenge.toString('utf8'));
    // Prints: the challenge as a UTF8 string
    ```

=== "CJS"

    ```js
    const { Certificate } = require('node:crypto');
    const spkac = getSpkacSomehow();
    const challenge = Certificate.exportChallenge(spkac);
    console.log(challenge.toString('utf8'));
    // Prints: the challenge as a UTF8 string
    ```

### Статический метод: `Certificate.exportPublicKey(spkac[, encoding])`

-   `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) компонент открытого ключа структуры `spkac` (открытый ключ и challenge)

=== "MJS"

    ```js
    const { Certificate } = await import('node:crypto');
    const spkac = getSpkacSomehow();
    const publicKey = Certificate.exportPublicKey(spkac);
    console.log(publicKey);
    // Prints: the public key as <Buffer ...>
    ```

=== "CJS"

    ```js
    const { Certificate } = require('node:crypto');
    const spkac = getSpkacSomehow();
    const publicKey = Certificate.exportPublicKey(spkac);
    console.log(publicKey);
    // Prints: the public key as <Buffer ...>
    ```

### Статический метод: `Certificate.verifySpkac(spkac[, encoding])`

-   `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если структура `spkac` допустима, иначе `false`

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const { Certificate } = await import('node:crypto');

    const spkac = getSpkacSomehow();
    console.log(Certificate.verifySpkac(Buffer.from(spkac)));
    // Prints: true or false
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');
    const { Certificate } = require('node:crypto');

    const spkac = getSpkacSomehow();
    console.log(Certificate.verifySpkac(Buffer.from(spkac)));
    // Prints: true or false
    ```

### Устаревший API

> Стабильность: 0 - Устарело

Через устаревший интерфейс можно создавать новые экземпляры класса `crypto.Certificate`, как показано в примерах ниже.

#### `new crypto.Certificate()`

Экземпляры класса `Certificate` можно создать с помощью ключевого слова `new` или вызовом `crypto.Certificate()` как функции:

=== "MJS"

    ```js
    const { Certificate } = await import('node:crypto');

    const cert1 = new Certificate();
    const cert2 = Certificate();
    ```

=== "CJS"

    ```js
    const { Certificate } = require('node:crypto');

    const cert1 = new Certificate();
    const cert2 = Certificate();
    ```

#### `certificate.exportChallenge(spkac[, encoding])`

-   `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) компонент challenge структуры данных `spkac`, который включает открытый ключ и challenge

=== "MJS"

    ```js
    const { Certificate } = await import('node:crypto');
    const cert = Certificate();
    const spkac = getSpkacSomehow();
    const challenge = cert.exportChallenge(spkac);
    console.log(challenge.toString('utf8'));
    // Prints: the challenge as a UTF8 string
    ```

=== "CJS"

    ```js
    const { Certificate } = require('node:crypto');
    const cert = Certificate();
    const spkac = getSpkacSomehow();
    const challenge = cert.exportChallenge(spkac);
    console.log(challenge.toString('utf8'));
    // Prints: the challenge as a UTF8 string
    ```

#### `certificate.exportPublicKey(spkac[, encoding])`

-   `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) компонент открытого ключа структуры данных `spkac`, который включает открытый ключ и challenge

=== "MJS"

    ```js
    const { Certificate } = await import('node:crypto');
    const cert = Certificate();
    const spkac = getSpkacSomehow();
    const publicKey = cert.exportPublicKey(spkac);
    console.log(publicKey);
    // Prints: the public key as <Buffer ...>
    ```

=== "CJS"

    ```js
    const { Certificate } = require('node:crypto');
    const cert = Certificate();
    const spkac = getSpkacSomehow();
    const publicKey = cert.exportPublicKey(spkac);
    console.log(publicKey);
    // Prints: the public key as <Buffer ...>
    ```

#### `certificate.verifySpkac(spkac[, encoding])`

-   `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если переданная структура данных `spkac` допустима, иначе `false`

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const { Certificate } = await import('node:crypto');

    const cert = Certificate();
    const spkac = getSpkacSomehow();
    console.log(cert.verifySpkac(Buffer.from(spkac)));
    // Prints: true or false
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');
    const { Certificate } = require('node:crypto');

    const cert = Certificate();
    const spkac = getSpkacSomehow();
    console.log(cert.verifySpkac(Buffer.from(spkac)));
    // Prints: true or false
    ```

## Class: `Cipheriv`

-   Расширяет: [`<stream.Transform>`](stream.md#class-streamtransform)

Экземпляры `Cipheriv` используются для шифрования данных. Два варианта использования:

-   как [поток](stream.md) `Transform`: в пишущую сторону подаётся открытый текст, со стороны чтения — шифротекст;
-   через [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding) и [`cipher.final()`](#cipherfinaloutputencoding).

[`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) создаёт экземпляры `Cipheriv`; конструктор `new` не используют.

Пример: `Cipheriv` как поток:

=== "MJS"

    ```js
    const {
      scrypt,
      randomFill,
      createCipheriv,
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) throw err;
      // Then, we'll generate a random initialization vector
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        // Once we have the key and iv, we can create and use the cipher...
        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = '';
        cipher.setEncoding('hex');

        cipher.on('data', (chunk) => encrypted += chunk);
        cipher.on('end', () => console.log(encrypted));

        cipher.write('some clear text data');
        cipher.end();
      });
    });
    ```

=== "CJS"

    ```js
    const {
      scrypt,
      randomFill,
      createCipheriv,
    } = require('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) throw err;
      // Then, we'll generate a random initialization vector
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        // Once we have the key and iv, we can create and use the cipher...
        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = '';
        cipher.setEncoding('hex');

        cipher.on('data', (chunk) => encrypted += chunk);
        cipher.on('end', () => console.log(encrypted));

        cipher.write('some clear text data');
        cipher.end();
      });
    });
    ```

Пример: `Cipheriv` и `pipeline`:

=== "MJS"

    ```js
    import {
      createReadStream,
      createWriteStream,
    } from 'node:fs';

    import {
      pipeline,
    } from 'node:stream';

    const {
      scrypt,
      randomFill,
      createCipheriv,
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) throw err;
      // Then, we'll generate a random initialization vector
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        const cipher = createCipheriv(algorithm, key, iv);

        const input = createReadStream('test.js');
        const output = createWriteStream('test.enc');

        pipeline(input, cipher, output, (err) => {
          if (err) throw err;
        });
      });
    });
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
      createWriteStream,
    } = require('node:fs');

    const {
      pipeline,
    } = require('node:stream');

    const {
      scrypt,
      randomFill,
      createCipheriv,
    } = require('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) throw err;
      // Then, we'll generate a random initialization vector
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        const cipher = createCipheriv(algorithm, key, iv);

        const input = createReadStream('test.js');
        const output = createWriteStream('test.enc');

        pipeline(input, cipher, output, (err) => {
          if (err) throw err;
        });
      });
    });
    ```

Пример: методы [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding) и [`cipher.final()`](#cipherfinaloutputencoding):

=== "MJS"

    ```js
    const {
      scrypt,
      randomFill,
      createCipheriv,
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) throw err;
      // Then, we'll generate a random initialization vector
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
        encrypted += cipher.final('hex');
        console.log(encrypted);
      });
    });
    ```

=== "CJS"

    ```js
    const {
      scrypt,
      randomFill,
      createCipheriv,
    } = require('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';

    // First, we'll generate the key. The key length is dependent on the algorithm.
    // In this case for aes192, it is 24 bytes (192 bits).
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) throw err;
      // Then, we'll generate a random initialization vector
      randomFill(new Uint8Array(16), (err, iv) => {
        if (err) throw err;

        const cipher = createCipheriv(algorithm, key, iv);

        let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
        encrypted += cipher.final('hex');
        console.log(encrypted);
      });
    });
    ```

### `cipher.final([outputEncoding])`

-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Любое оставшееся зашифрованное содержимое. Если указан `outputEncoding`, возвращается строка. Если `outputEncoding` не указан, возвращается [`Buffer`](buffer.md).

После вызова метода `cipher.final()` объект `Cipheriv` больше нельзя использовать для шифрования данных. Попытка вызвать `cipher.final()` более одного раза приведёт к выбросу ошибки.

### `cipher.getAuthTag()`

-   Возвращает: [`<Buffer>`](buffer.md#buffer) В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) метод `cipher.getAuthTag()` возвращает [`Buffer`](buffer.md) с _тегом аутентификации_, вычисленным по данным.

`cipher.getAuthTag()` вызывают только после завершения шифрования через [`cipher.final()`](#cipherfinaloutputencoding).

Если при создании `cipher` была задана опция `authTagLength`, вернётся ровно столько байт.

### `cipher.setAAD(buffer[, options])`

-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.Transform`](stream.md#new-streamtransformoptions)
    -   `plaintextLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `buffer`.
-   Возвращает: [`<Cipheriv>`](crypto.md#class-cipheriv) Тот же экземпляр `Cipheriv` (цепочка вызовов).

В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) метод `cipher.setAAD()` задаёт _дополнительные аутентифицированные данные_ (AAD).

Для `GCM` и `OCB` опция `plaintextLength` необязательна. Для `CCM` её нужно указать, и значение должно совпадать с длиной открытого текста в байтах. См. [режим CCM](#ccm-mode).

`cipher.setAAD()` вызывают до [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding).

### `cipher.setAutoPadding([autoPadding])`

-   `autoPadding` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
-   Возвращает: [`<Cipheriv>`](crypto.md#class-cipheriv) Тот же экземпляр `Cipheriv`.

Для блочных шифров `Cipheriv` по умолчанию добавляет padding до размера блока. Отключить: `cipher.setAutoPadding(false)`.

При `autoPadding === false` длина всех входных данных должна быть кратна размеру блока, иначе [`cipher.final()`](#cipherfinaloutputencoding) выбросит ошибку. Отключение padding нужно для нестандартного заполнения (например `0x0` вместо PKCS).

`cipher.setAutoPadding()` вызывают до [`cipher.final()`](#cipherfinaloutputencoding).

### `cipher.update(data[, inputEncoding][, outputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) данных.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) результата.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Обновляет шифр данными `data`. Если задан `inputEncoding`, `data` — строка в этой кодировке. Если `inputEncoding` нет, `data` должен быть [`Buffer`](buffer.md), `TypedArray` или `DataView`; для бинарных типов `inputEncoding` игнорируется.

`outputEncoding` задаёт формат шифротекста на выходе: при указании возвращается строка, иначе — [`Buffer`](buffer.md).

`cipher.update()` можно вызывать несколько раз до [`cipher.final()`](#cipherfinaloutputencoding); после [`cipher.final()`](#cipherfinaloutputencoding) вызов `cipher.update()` приведёт к ошибке.

## Class: `Decipheriv`

-   Расширяет: [`<stream.Transform>`](stream.md#class-streamtransform)

Экземпляры `Decipheriv` расшифровывают данные. Два варианта:

-   как [поток](stream.md) `Transform`: на запись подаётся шифротекст, со стороны чтения — открытый текст;
-   через [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) и [`decipher.final()`](#decipherfinaloutputencoding).

[`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options) создаёт `Decipheriv`; `new` не используют.

Пример: `Decipheriv` как поток:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const {
      scryptSync,
      createDecipheriv,
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';
    // Key length is dependent on the algorithm. In this case for aes192, it is
    // 24 bytes (192 bits).
    // Use the async `crypto.scrypt()` instead.
    const key = scryptSync(password, 'salt', 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = '';
    decipher.on('readable', () => {
      let chunk;
      while (null !== (chunk = decipher.read())) {
        decrypted += chunk.toString('utf8');
      }
    });
    decipher.on('end', () => {
      console.log(decrypted);
      // Prints: some clear text data
    });

    // Encrypted with same algorithm, key and iv.
    const encrypted =
      'e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa';
    decipher.write(encrypted, 'hex');
    decipher.end();
    ```

=== "CJS"

    ```js
    const {
      scryptSync,
      createDecipheriv,
    } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';
    // Key length is dependent on the algorithm. In this case for aes192, it is
    // 24 bytes (192 bits).
    // Use the async `crypto.scrypt()` instead.
    const key = scryptSync(password, 'salt', 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(algorithm, key, iv);

    let decrypted = '';
    decipher.on('readable', () => {
      let chunk;
      while (null !== (chunk = decipher.read())) {
        decrypted += chunk.toString('utf8');
      }
    });
    decipher.on('end', () => {
      console.log(decrypted);
      // Prints: some clear text data
    });

    // Encrypted with same algorithm, key and iv.
    const encrypted =
      'e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa';
    decipher.write(encrypted, 'hex');
    decipher.end();
    ```

Пример: `Decipheriv` и `pipeline`:

=== "MJS"

    ```js
    import {
      createReadStream,
      createWriteStream,
    } from 'node:fs';
    import { Buffer } from 'node:buffer';
    const {
      scryptSync,
      createDecipheriv,
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';
    // Use the async `crypto.scrypt()` instead.
    const key = scryptSync(password, 'salt', 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(algorithm, key, iv);

    const input = createReadStream('test.enc');
    const output = createWriteStream('test.js');

    input.pipe(decipher).pipe(output);
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
      createWriteStream,
    } = require('node:fs');
    const {
      scryptSync,
      createDecipheriv,
    } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';
    // Use the async `crypto.scrypt()` instead.
    const key = scryptSync(password, 'salt', 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(algorithm, key, iv);

    const input = createReadStream('test.enc');
    const output = createWriteStream('test.js');

    input.pipe(decipher).pipe(output);
    ```

Пример: [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) и [`decipher.final()`](#decipherfinaloutputencoding):

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const {
      scryptSync,
      createDecipheriv,
    } = await import('node:crypto');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';
    // Use the async `crypto.scrypt()` instead.
    const key = scryptSync(password, 'salt', 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(algorithm, key, iv);

    // Encrypted using same algorithm, key and iv.
    const encrypted =
      'e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa';
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted);
    // Prints: some clear text data
    ```

=== "CJS"

    ```js
    const {
      scryptSync,
      createDecipheriv,
    } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const algorithm = 'aes-192-cbc';
    const password = 'Password used to generate key';
    // Use the async `crypto.scrypt()` instead.
    const key = scryptSync(password, 'salt', 24);
    // The IV is usually passed along with the ciphertext.
    const iv = Buffer.alloc(16, 0); // Initialization vector.

    const decipher = createDecipheriv(algorithm, key, iv);

    // Encrypted using same algorithm, key and iv.
    const encrypted =
      'e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa';
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    console.log(decrypted);
    // Prints: some clear text data
    ```

### `decipher.final([outputEncoding])`

-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) результата.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оставшийся расшифрованный материал. При указанном `outputEncoding` возвращается строка, иначе — [`Buffer`](buffer.md).

После вызова `decipher.final()` объект `Decipheriv` больше нельзя использовать для расшифровки. Повторный вызов `decipher.final()` вызывает ошибку.

### `decipher.setAAD(buffer[, options])`

-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.transform`](stream.md#new-streamtransformoptions)
    -   `plaintextLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки `buffer`.
-   Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv) Тот же `Decipheriv` (цепочка вызовов).

В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) метод `decipher.setAAD()` задаёт _дополнительные аутентифицированные данные_ (AAD).

Для `GCM` аргумент `options` необязателен. Для `CCM` нужно указать `plaintextLength`, совпадающий с длиной шифротекста в байтах. См. [режим CCM](#ccm-mode).

`decipher.setAAD()` вызывают до [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding).

При передаче строки в `buffer` учитывайте [оговорки по строкам во входах крипто-API](#using-strings-as-inputs-to-cryptographic-apis).

### `decipher.setAuthTag(buffer[, encoding])`

-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки `buffer`.
-   Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv) Тот же `Decipheriv`.

В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) `decipher.setAuthTag()` передаёт полученный _тег аутентификации_. Без тега или при изменении шифротекста [`decipher.final()`](#decipherfinaloutputencoding) выбросит ошибку — данные нужно отбросить. Неверная длина тега по [NIST SP 800-38D](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf) или несовпадение с `authTagLength` также даёт ошибку.

`decipher.setAuthTag()` для `CCM` вызывают до [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding), для `GCM`, `OCB` и `chacha20-poly1305` — до [`decipher.final()`](#decipherfinaloutputencoding). `decipher.setAuthTag()` можно вызвать только один раз.

Для строки-тега см. [оговорки по строкам во входах крипто-API](#using-strings-as-inputs-to-cryptographic-apis).

### `decipher.setAutoPadding([autoPadding])`

-   `autoPadding` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
-   Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv) Тот же `Decipheriv`.

Если шифрование было без стандартного блочного padding, `decipher.setAutoPadding(false)` отключает автоматическое снятие padding, чтобы [`decipher.final()`](#decipherfinaloutputencoding) не проверял и не удалял его.

Без padding длина входных данных должна быть кратна размеру блока шифра.

`decipher.setAutoPadding()` вызывают до [`decipher.final()`](#decipherfinaloutputencoding).

### `decipher.update(data[, inputEncoding][, outputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `data`.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) результата.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Обновляет расшифровщик данными `data`. Если задан `inputEncoding`, `data` — строка в этой кодировке. Если `inputEncoding` нет, `data` должен быть [`Buffer`](buffer.md); для `Buffer` `inputEncoding` игнорируется.

`outputEncoding` задаёт формат выхода: строка или [`Buffer`](buffer.md).

`decipher.update()` можно вызывать несколько раз до [`decipher.final()`](#decipherfinaloutputencoding); после [`decipher.final()`](#decipherfinaloutputencoding) — ошибка.

Даже при аутентифицирующем шифре на этом шаге подлинность открытого текста может быть не подтверждена; для AEAD проверка обычно завершается при вызове [`decipher.final()`](#decipherfinaloutputencoding).

## Класс: `DiffieHellman`

Класс `DiffieHellman` — обмен ключами Диффи–Хеллмана.

Экземпляры создаются через [`crypto.createDiffieHellman()`](#cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding).

=== "MJS"

    ```js
    import assert from 'node:assert';

    const {
      createDiffieHellman,
    } = await import('node:crypto');

    // Generate Alice's keys...
    const alice = createDiffieHellman(2048);
    const aliceKey = alice.generateKeys();

    // Generate Bob's keys...
    const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());
    const bobKey = bob.generateKeys();

    // Exchange and generate the secret...
    const aliceSecret = alice.computeSecret(bobKey);
    const bobSecret = bob.computeSecret(aliceKey);

    // OK
    assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');

    const {
      createDiffieHellman,
    } = require('node:crypto');

    // Generate Alice's keys...
    const alice = createDiffieHellman(2048);
    const aliceKey = alice.generateKeys();

    // Generate Bob's keys...
    const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());
    const bobKey = bob.generateKeys();

    // Exchange and generate the secret...
    const aliceSecret = alice.computeSecret(bobKey);
    const bobSecret = bob.computeSecret(aliceKey);

    // OK
    assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));
    ```

### `diffieHellman.computeSecret(otherPublicKey[, inputEncoding][, outputEncoding])`

-   `otherPublicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `otherPublicKey`
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет общий секрет, используя `otherPublicKey` как открытый ключ другой стороны, и возвращает вычисленный общий секрет. Переданный ключ интерпретируется в указанной `inputEncoding`, а секрет кодируется в указанной `outputEncoding`. Если `inputEncoding` не задана, ожидается, что `otherPublicKey` — это [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если задана `outputEncoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `diffieHellman.generateKeys([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует значения закрытого и открытого ключей Диффи–Хеллмана, если они ещё не были сгенерированы или вычислены, и возвращает открытый ключ в указанной `encoding`. Этот ключ нужно передать другой стороне. Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

Эта функция — тонкая обёртка над [`DH_generate_key()`](https://www.openssl.org/docs/man3.0/man3/DH_generate_key.html). В частности, после того как закрытый ключ уже сгенерирован или задан, вызов этой функции только обновляет открытый ключ, но не создаёт новый закрытый.

### `diffieHellman.getGenerator([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает генератор Диффи–Хеллмана в указанной `encoding`. Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `diffieHellman.getPrime([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает простое число (модуль) Диффи–Хеллмана в указанной `encoding`. Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `diffieHellman.getPrivateKey([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает закрытый ключ Диффи–Хеллмана в указанной `encoding`. Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `diffieHellman.getPublicKey([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает открытый ключ Диффи–Хеллмана в указанной `encoding`. Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `diffieHellman.setPrivateKey(privateKey[, encoding])`

-   `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `privateKey`

Задаёт закрытый ключ Диффи–Хеллмана. Если передан аргумент `encoding`, ожидается, что `privateKey` — строка. Если `encoding` не задана, ожидается, что `privateKey` — это [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Эта функция не вычисляет связанный открытый ключ автоматически. Можно вызвать либо [`diffieHellman.setPublicKey()`](#diffiehellmansetpublickeypublickey-encoding), либо [`diffieHellman.generateKeys()`](#diffiehellmangeneratekeysencoding) — чтобы явно задать открытый ключ или получить его автоматически.

### `diffieHellman.setPublicKey(publicKey[, encoding])`

-   `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `publicKey`

Задаёт открытый ключ Диффи–Хеллмана. Если передан аргумент `encoding`, ожидается, что `publicKey` — строка. Если `encoding` не задана, ожидается, что `publicKey` — это [`Buffer`](buffer.md), `TypedArray` или `DataView`.

### `diffieHellman.verifyError`

Битовое поле с предупреждениями и/или ошибками, полученными при проверке при инициализации объекта `DiffieHellman`.

Для этого свойства допустимы следующие значения (как определено в модуле `node:constants`):

-   `DH_CHECK_P_NOT_SAFE_PRIME`
-   `DH_CHECK_P_NOT_PRIME`
-   `DH_UNABLE_TO_CHECK_GENERATOR`
-   `DH_NOT_SUITABLE_GENERATOR`

## Класс: `DiffieHellmanGroup` {#class-diffiehellmangroup}

Класс `DiffieHellmanGroup` принимает в качестве аргумента известную группу modp. Работает так же, как `DiffieHellman`, за исключением того, что после создания нельзя менять ключи. Другими словами, не реализованы методы `setPublicKey()` и `setPrivateKey()`.

=== "MJS"

    ```js
    const { createDiffieHellmanGroup } = await import('node:crypto');
    const dh = createDiffieHellmanGroup('modp16');
    ```

=== "CJS"

    ```js
    const { createDiffieHellmanGroup } = require('node:crypto');
    const dh = createDiffieHellmanGroup('modp16');
    ```

Поддерживаются следующие группы:

-   `'modp14'` (2048 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 3)
-   `'modp15'` (3072 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 4)
-   `'modp16'` (4096 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 5)
-   `'modp17'` (6144 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 6)
-   `'modp18'` (8192 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 7)

Следующие группы по-прежнему поддерживаются, но устарели (см. [ограничения](#support-for-weak-or-compromised-algorithms)):

-   `'modp1'` (768 bits, [RFC 2409](https://www.rfc-editor.org/rfc/rfc2409.txt) Section 6.1)
-   `'modp2'` (1024 bits, [RFC 2409](https://www.rfc-editor.org/rfc/rfc2409.txt) Section 6.2)
-   `'modp5'` (1536 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 2)

Эти устаревшие группы могут быть удалены в будущих версиях Node.js.

## Класс: `ECDH`

Класс `ECDH` — утилита для обмена ключами по протоколу Elliptic Curve Diffie-Hellman (ECDH).

Экземпляры класса `ECDH` создаются функцией [`crypto.createECDH()`](#cryptocreateecdhcurvename).

=== "MJS"

    ```js
    import assert from 'node:assert';

    const {
      createECDH,
    } = await import('node:crypto');

    // Generate Alice's keys...
    const alice = createECDH('secp521r1');
    const aliceKey = alice.generateKeys();

    // Generate Bob's keys...
    const bob = createECDH('secp521r1');
    const bobKey = bob.generateKeys();

    // Exchange and generate the secret...
    const aliceSecret = alice.computeSecret(bobKey);
    const bobSecret = bob.computeSecret(aliceKey);

    assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));
    // OK
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');

    const {
      createECDH,
    } = require('node:crypto');

    // Generate Alice's keys...
    const alice = createECDH('secp521r1');
    const aliceKey = alice.generateKeys();

    // Generate Bob's keys...
    const bob = createECDH('secp521r1');
    const bobKey = bob.generateKeys();

    // Exchange and generate the secret...
    const aliceSecret = alice.computeSecret(bobKey);
    const bobSecret = bob.computeSecret(aliceKey);

    assert.strictEqual(aliceSecret.toString('hex'), bobSecret.toString('hex'));
    // OK
    ```

### Статический метод: `ECDH.convertKey(key, curve[, inputEncoding[, outputEncoding[, format]]])`

-   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `curve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `key`
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'uncompressed'`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Преобразует открытый ключ EC Diffie-Hellman, заданный `key` и `curve`, в формат, указанный в `format`. Аргумент `format` задаёт кодирование точки и может быть `'compressed'`, `'uncompressed'` или `'hybrid'`. Переданный ключ интерпретируется в указанной `inputEncoding`, возвращаемый ключ кодируется в указанной `outputEncoding`.

Список имён доступных кривых можно получить через [`crypto.getCurves()`](#cryptogetcurves). В свежих версиях OpenSSL команда `openssl ecparam -list_curves` также выводит имя и описание каждой доступной эллиптической кривой.

Если `format` не указан, точка возвращается в формате `'uncompressed'`.

Если `inputEncoding` не задана, ожидается, что `key` — это [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Пример (распаковка ключа):

=== "MJS"

    ```js
    const {
      createECDH,
      ECDH,
    } = await import('node:crypto');

    const ecdh = createECDH('secp256k1');
    ecdh.generateKeys();

    const compressedKey = ecdh.getPublicKey('hex', 'compressed');

    const uncompressedKey = ECDH.convertKey(compressedKey,
                                            'secp256k1',
                                            'hex',
                                            'hex',
                                            'uncompressed');

    // The converted key and the uncompressed public key should be the same
    console.log(uncompressedKey === ecdh.getPublicKey('hex'));
    ```

=== "CJS"

    ```js
    const {
      createECDH,
      ECDH,
    } = require('node:crypto');

    const ecdh = createECDH('secp256k1');
    ecdh.generateKeys();

    const compressedKey = ecdh.getPublicKey('hex', 'compressed');

    const uncompressedKey = ECDH.convertKey(compressedKey,
                                            'secp256k1',
                                            'hex',
                                            'hex',
                                            'uncompressed');

    // The converted key and the uncompressed public key should be the same
    console.log(uncompressedKey === ecdh.getPublicKey('hex'));
    ```

### `ecdh.computeSecret(otherPublicKey[, inputEncoding][, outputEncoding])`

-   `otherPublicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `otherPublicKey`
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет общий секрет, используя `otherPublicKey` как открытый ключ другой стороны, и возвращает вычисленный общий секрет. Переданный ключ интерпретируется в указанной `inputEncoding`, возвращаемый секрет кодируется в указанной `outputEncoding`. Если `inputEncoding` не задана, ожидается, что `otherPublicKey` — это [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если задана `outputEncoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

`ecdh.computeSecret` выбросит ошибку `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY`, когда `otherPublicKey` лежит вне эллиптической кривой. Поскольку `otherPublicKey` обычно приходит от удалённого пользователя по незащищённой сети, обязательно обрабатывайте это исключение.

### `ecdh.generateKeys([encoding[, format]])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'uncompressed'`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует значения закрытого и открытого ключей EC Diffie-Hellman и возвращает открытый ключ в указанных `format` и `encoding`. Этот ключ нужно передать другой стороне.

Аргумент `format` задаёт кодирование точки и может быть `'compressed'` или `'uncompressed'`. Если `format` не указан, точка возвращается в формате `'uncompressed'`.

Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `ecdh.getPrivateKey([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) закрытый ключ EC Diffie-Hellman в указанной `encoding`.

Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `ecdh.getPublicKey([encoding][, format])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'uncompressed'`
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) открытый ключ EC Diffie-Hellman в указанных `encoding` и `format`.

Аргумент `format` задаёт кодирование точки и может быть `'compressed'` или `'uncompressed'`. Если `format` не указан, точка возвращается в формате `'uncompressed'`.

Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

### `ecdh.setPrivateKey(privateKey[, encoding])`

-   `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `privateKey`

Задаёт закрытый ключ EC Diffie-Hellman. Если задана `encoding`, ожидается, что `privateKey` — строка; иначе ожидается [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если `privateKey` недопустим для кривой, указанной при создании объекта `ECDH`, выбрасывается ошибка. После установки закрытого ключа также вычисляется и задаётся связанная открытая точка (ключ) в объекте `ECDH`.

### `ecdh.setPublicKey(publicKey[, encoding])`

> Стабильность: 0 - Устарело

-   `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `publicKey`

Задаёт открытый ключ EC Diffie-Hellman. Если задана `encoding`, ожидается, что `publicKey` — строка; иначе ожидается [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Обычно этот метод не нужен: для `ECDH` достаточно закрытого ключа и открытого ключа другой стороны, чтобы вычислить общий секрет. Обычно вызывают либо [`ecdh.generateKeys()`](#ecdhgeneratekeysencoding-format), либо [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding). Метод [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding) пытается сгенерировать открытую точку/ключ, соответствующие устанавливаемому закрытому ключу.

Пример (получение общего секрета):

=== "MJS"

    ```js
    const {
      createECDH,
      createHash,
    } = await import('node:crypto');

    const alice = createECDH('secp256k1');
    const bob = createECDH('secp256k1');

    // This is a shortcut way of specifying one of Alice's previous private
    // keys. It would be unwise to use such a predictable private key in a real
    // application.
    alice.setPrivateKey(
      createHash('sha256').update('alice', 'utf8').digest(),
    );

    // Bob uses a newly generated cryptographically strong
    // pseudorandom key pair
    bob.generateKeys();

    const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
    const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

    // aliceSecret and bobSecret should be the same shared secret value
    console.log(aliceSecret === bobSecret);
    ```

=== "CJS"

    ```js
    const {
      createECDH,
      createHash,
    } = require('node:crypto');

    const alice = createECDH('secp256k1');
    const bob = createECDH('secp256k1');

    // This is a shortcut way of specifying one of Alice's previous private
    // keys. It would be unwise to use such a predictable private key in a real
    // application.
    alice.setPrivateKey(
      createHash('sha256').update('alice', 'utf8').digest(),
    );

    // Bob uses a newly generated cryptographically strong
    // pseudorandom key pair
    bob.generateKeys();

    const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
    const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

    // aliceSecret and bobSecret should be the same shared secret value
    console.log(aliceSecret === bobSecret);
    ```

## Класс: `Hash`

-   Наследует: [`<stream.Transform>`](stream.md#class-streamtransform)

Класс `Hash` — утилита для вычисления хеш-дайджестов данных. Его можно использовать одним из двух способов:

-   как [поток](stream.md) с чтением и записью: данные пишутся с одной стороны, а на стороне чтения получается вычисленный хеш-дайджест;
-   через методы [`hash.update()`](#hashupdatedata-inputencoding) и [`hash.digest()`](#hashdigestencoding), чтобы получить вычисленный хеш.

Экземпляры `Hash` создаёт метод [`crypto.createHash()`](#cryptocreatehashalgorithm-options). Объекты `Hash` не создают напрямую через `new`.

Пример: объект `Hash` как поток:

=== "MJS"

    ```js
    const {
      createHash,
    } = await import('node:crypto');

    const hash = createHash('sha256');

    hash.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = hash.read();
      if (data) {
        console.log(data.toString('hex'));
        // Prints:
        //   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
      }
    });

    hash.write('some data to hash');
    hash.end();
    ```

=== "CJS"

    ```js
    const {
      createHash,
    } = require('node:crypto');

    const hash = createHash('sha256');

    hash.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = hash.read();
      if (data) {
        console.log(data.toString('hex'));
        // Prints:
        //   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
      }
    });

    hash.write('some data to hash');
    hash.end();
    ```

Пример: `Hash` и `pipeline`:

=== "MJS"

    ```js
    import { createReadStream } from 'node:fs';
    import { stdout } from 'node:process';
    const { createHash } = await import('node:crypto');

    const hash = createHash('sha256');

    const input = createReadStream('test.js');
    input.pipe(hash).setEncoding('hex').pipe(stdout);
    ```

=== "CJS"

    ```js
    const { createReadStream } = require('node:fs');
    const { createHash } = require('node:crypto');
    const { stdout } = require('node:process');

    const hash = createHash('sha256');

    const input = createReadStream('test.js');
    input.pipe(hash).setEncoding('hex').pipe(stdout);
    ```

Пример: [`hash.update()`](#hashupdatedata-inputencoding) и [`hash.digest()`](#hashdigestencoding):

=== "MJS"

    ```js
    const {
      createHash,
    } = await import('node:crypto');

    const hash = createHash('sha256');

    hash.update('some data to hash');
    console.log(hash.digest('hex'));
    // Prints:
    //   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
    ```

=== "CJS"

    ```js
    const {
      createHash,
    } = require('node:crypto');

    const hash = createHash('sha256');

    hash.update('some data to hash');
    console.log(hash.digest('hex'));
    // Prints:
    //   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
    ```

### `hash.copy([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: [`<Hash>`](crypto.md)

Создаёт новый объект `Hash` с глубокой копией внутреннего состояния текущего объекта `Hash`.

Необязательный аргумент `options` управляет поведением потока. Для XOF-функций хеширования, таких как `'shake256'`, можно задать опцию `outputLength`, чтобы указать желаемую длину выхода в байтах.

Ошибка выбрасывается при попытке скопировать объект `Hash` после вызова его метода [`hash.digest()`](#hashdigestencoding).

=== "MJS"

    ```js
    // Calculate a rolling hash.
    const {
      createHash,
    } = await import('node:crypto');

    const hash = createHash('sha256');

    hash.update('one');
    console.log(hash.copy().digest('hex'));

    hash.update('two');
    console.log(hash.copy().digest('hex'));

    hash.update('three');
    console.log(hash.copy().digest('hex'));

    // Etc.
    ```

=== "CJS"

    ```js
    // Calculate a rolling hash.
    const {
      createHash,
    } = require('node:crypto');

    const hash = createHash('sha256');

    hash.update('one');
    console.log(hash.copy().digest('hex'));

    hash.update('two');
    console.log(hash.copy().digest('hex'));

    hash.update('three');
    console.log(hash.copy().digest('hex'));

    // Etc.
    ```

### `hash.digest([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет дайджест по всем данным, переданным для хеширования (через [`hash.update()`](#hashupdatedata-inputencoding)). Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

После вызова `hash.digest()` объект `Hash` использовать снова нельзя. Повторные вызовы приведут к ошибке.

### `hash.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`

Обновляет содержимое хеша данными `data`; их кодировка задаётся в `inputEncoding`. Если `inputEncoding` не задана и `data` — строка, принудительно используется кодировка `'utf8'`. Если `data` — [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Метод можно вызывать многократно по мере поступления новых данных в потоке.

## Класс: `Hmac`

-   Наследует: [`<stream.Transform>`](stream.md#class-streamtransform)

Класс `Hmac` — утилита для вычисления криптографических HMAC-дайджестов. Его можно использовать одним из двух способов:

-   как [поток](stream.md) с чтением и записью: данные пишутся с одной стороны, а на стороне чтения получается вычисленный HMAC-дайджест;
-   через методы [`hmac.update()`](#hmacupdatedata-inputencoding) и [`hmac.digest()`](#hmacdigestencoding), чтобы получить вычисленный HMAC-дайджест.

Экземпляры `Hmac` создаёт метод [`crypto.createHmac()`](#cryptocreatehmacalgorithm-key-options). Объекты `Hmac` не создают напрямую через `new`.

Пример: объект `Hmac` как поток:

=== "MJS"

    ```js
    const {
      createHmac,
    } = await import('node:crypto');

    const hmac = createHmac('sha256', 'a secret');

    hmac.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = hmac.read();
      if (data) {
        console.log(data.toString('hex'));
        // Prints:
        //   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
      }
    });

    hmac.write('some data to hash');
    hmac.end();
    ```

=== "CJS"

    ```js
    const {
      createHmac,
    } = require('node:crypto');

    const hmac = createHmac('sha256', 'a secret');

    hmac.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = hmac.read();
      if (data) {
        console.log(data.toString('hex'));
        // Prints:
        //   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
      }
    });

    hmac.write('some data to hash');
    hmac.end();
    ```

Пример: `Hmac` и `pipeline`:

=== "MJS"

    ```js
    import { createReadStream } from 'node:fs';
    import { stdout } from 'node:process';
    const {
      createHmac,
    } = await import('node:crypto');

    const hmac = createHmac('sha256', 'a secret');

    const input = createReadStream('test.js');
    input.pipe(hmac).pipe(stdout);
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
    } = require('node:fs');
    const {
      createHmac,
    } = require('node:crypto');
    const { stdout } = require('node:process');

    const hmac = createHmac('sha256', 'a secret');

    const input = createReadStream('test.js');
    input.pipe(hmac).pipe(stdout);
    ```

Пример: [`hmac.update()`](#hmacupdatedata-inputencoding) и [`hmac.digest()`](#hmacdigestencoding):

=== "MJS"

    ```js
    const {
      createHmac,
    } = await import('node:crypto');

    const hmac = createHmac('sha256', 'a secret');

    hmac.update('some data to hash');
    console.log(hmac.digest('hex'));
    // Prints:
    //   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
    ```

=== "CJS"

    ```js
    const {
      createHmac,
    } = require('node:crypto');

    const hmac = createHmac('sha256', 'a secret');

    hmac.update('some data to hash');
    console.log(hmac.digest('hex'));
    // Prints:
    //   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
    ```

### `hmac.digest([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет HMAC-дайджест по всем данным, переданным через [`hmac.update()`](#hmacupdatedata-inputencoding). Если задана `encoding`, возвращается строка; иначе — [`Buffer`](buffer.md).

После вызова `hmac.digest()` объект `Hmac` использовать снова нельзя. Повторные вызовы `hmac.digest()` приведут к ошибке.

### `hmac.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`

Обновляет содержимое `Hmac` данными `data`; их кодировка задаётся в `inputEncoding`. Если `inputEncoding` не задана и `data` — строка, принудительно используется кодировка `'utf8'`. Если `data` — [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Метод можно вызывать многократно по мере поступления новых данных в потоке.

## Класс: `KeyObject` {#class-keyobject}

В Node.js класс `KeyObject` представляет симметричный или асимметричный ключ; у каждого вида ключа свой набор возможностей. Экземпляры `KeyObject` создают методы [`crypto.createSecretKey()`](#cryptocreatesecretkeykey-encoding), [`crypto.createPublicKey()`](#cryptocreatepublickeykey) и [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Объекты `KeyObject` не создают напрямую через `new`.

В большинстве приложений лучше использовать API `KeyObject` вместо передачи ключей строками или `Buffer` — благодаря улучшенным мерам безопасности.

Экземпляры `KeyObject` можно передавать в другие потоки через [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist). Получатель получает клонированный `KeyObject`; указывать `KeyObject` в аргументе `transferList` не нужно.

### Статический метод: `KeyObject.from(key)`

-   `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
-   Возвращает: [`<KeyObject>`](#class-keyobject)

Возвращает лежащий в основе [KeyObject](#class-keyobject) для [CryptoKey](webcrypto.md#class-cryptokey). У возвращённого [KeyObject](#class-keyobject) не сохраняются ограничения Web Crypto API для исходного [CryptoKey](webcrypto.md#class-cryptokey): допустимые сценарии использования ключа, привязки к алгоритму или хешу и флаг извлекаемости. В частности, базовый материал ключа у возвращённого [KeyObject](#class-keyobject) всегда можно экспортировать.

=== "MJS"

    ```js
    const { KeyObject } = await import('node:crypto');
    const { subtle } = globalThis.crypto;

    const key = await subtle.generateKey({
      name: 'HMAC',
      hash: 'SHA-256',
      length: 256,
    }, true, ['sign', 'verify']);

    const keyObject = KeyObject.from(key);
    console.log(keyObject.symmetricKeySize);
    // Prints: 32 (symmetric key size in bytes)
    ```

=== "CJS"

    ```js
    const { KeyObject } = require('node:crypto');
    const { subtle } = globalThis.crypto;

    (async function() {
      const key = await subtle.generateKey({
        name: 'HMAC',
        hash: 'SHA-256',
        length: 256,
      }, true, ['sign', 'verify']);

      const keyObject = KeyObject.from(key);
      console.log(keyObject.symmetricKeySize);
      // Prints: 32 (symmetric key size in bytes)
    })();
    ```

### `keyObject.asymmetricKeyDetails`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `modulusLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер ключа в битах (RSA, DSA).
    -   `publicExponent` [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) открытая экспонента (RSA).
    -   `hashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя хеш-функции для сообщения (RSA-PSS).
    -   `mgf1HashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя хеш-функции, используемой в MGF1 (RSA-PSS).
    -   `saltLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) минимальная длина соли в байтах (RSA-PSS).
    -   `divisorLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер `q` в битах (DSA).
    -   `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя кривой (EC).

Это свойство есть только у асимметричных ключей. В зависимости от типа ключа объект содержит сведения о нём. Ни одно из значений, полученных через это свойство, нельзя использовать для однозначной идентификации ключа или для компрометации его безопасности.

Для ключей RSA-PSS, если в материале ключа есть последовательность `RSASSA-PSS-params`, будут заданы свойства `hashAlgorithm`, `mgf1HashAlgorithm` и `saltLength`.

Другие детали ключа могут быть раскрыты через этот API дополнительными атрибутами.

### `keyObject.asymmetricKeyType`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Для асимметричных ключей это свойство задаёт тип ключа. См. поддерживаемые [типы асимметричных ключей](#asymmetric-key-types).

Для нераспознанных типов `KeyObject` и для симметричных ключей свойство равно `undefined`.

### `keyObject.equals(otherKeyObject)`

-   `otherKeyObject` [`<KeyObject>`](#class-keyobject) объект `KeyObject`, с которым сравнивается `keyObject`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true` или `false` в зависимости от того, совпадают ли ключи по типу, значению и параметрам. Этот метод не является [постоянным по времени](https://en.wikipedia.org/wiki/Timing_attack).

### `keyObject.export([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Для симметричных ключей можно использовать такие опции кодирования:

-   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'buffer'` (по умолчанию) или `'jwk'`.

Для открытых ключей можно использовать такие опции кодирования:

-   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'pem'`, `'der'`, `'jwk'` или `'raw-public'`. Поддержка форматов — в разделе [типы асимметричных ключей](#asymmetric-key-types).
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если `format` — `'pem'` или `'der'`, должно быть `'pkcs1'` (только RSA) или `'spki'`. Для ключей EC с форматом `'raw-public'` может быть `'uncompressed'` (по умолчанию) или `'compressed'`. Игнорируется, если `format` — `'jwk'`.

Для закрытых ключей можно использовать такие опции кодирования:

-   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'pem'`, `'der'`, `'jwk'`, `'raw-private'` или `'raw-seed'`. Поддержка форматов — в разделе [типы асимметричных ключей](#asymmetric-key-types).
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если `format` — `'pem'` или `'der'`, должно быть `'pkcs1'` (только RSA), `'pkcs8'` или `'sec1'` (только EC). Игнорируется, если `format` — `'jwk'`, `'raw-private'` или `'raw-seed'`.
-   `cipher` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если указано, закрытый ключ будет зашифрован заданными `cipher` и `passphrase` с помощью шифрования на пароле PKCS#5 v2.0. Игнорируется, если `format` — `'jwk'`, `'raw-private'` или `'raw-seed'`.
-   `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) пароль для шифрования. Обязателен, если указан `cipher`.

Тип результата зависит от выбранного формата: для PEM — строка, для DER — [`Buffer`](buffer.md#buffer) с данными в кодировке DER, для [JWK](https://tools.ietf.org/html/rfc7517) — объект. Сырые форматы возвращают [`Buffer`](buffer.md#buffer) с сырым материалом ключа.

Закрытые ключи можно зашифровать, указав `cipher` и `passphrase`. Тип PKCS#8 поддерживает шифрование и для PEM, и для DER `format` для любого алгоритма ключа. PKCS#1 и SEC1 допускают шифрование только при PEM `format`. Для максимальной совместимости используйте PKCS#8 для зашифрованных закрытых ключей. Поскольку PKCS#8 определяет собственный механизм шифрования, шифрование на уровне PEM не поддерживается при шифровании ключа PKCS#8. См. [RFC 5208](https://www.rfc-editor.org/rfc/rfc5208.txt) о шифровании PKCS#8 и [RFC 1421](https://www.rfc-editor.org/rfc/rfc1421.txt) о шифровании PKCS#1 и SEC1.

### `keyObject.symmetricKeySize`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Для секретных ключей это свойство задаёт размер ключа в байтах. Для асимметричных ключей свойство равно `undefined`.

### `keyObject.toCryptoKey(algorithm, extractable, keyUsages)`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaHashedImportParams>`](webcrypto.md) | [`<EcKeyImportParams>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md)
-   `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) см. [сценарии использования ключа](webcrypto.md#cryptokeyusages).
-   Возвращает: [`<CryptoKey>`](webcrypto.md#class-cryptokey)

Преобразует экземпляр `KeyObject` в `CryptoKey`.

### `keyObject.type`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

В зависимости от вида этого `KeyObject` свойство равно `'secret'` для секретных (симметричных) ключей, `'public'` для открытых (асимметричных) ключей или `'private'` для закрытых (асимметричных) ключей.

## Class: `Sign`

-   Расширяет: [`<stream.Writable>`](stream.md#streamwritable)

Класс `Sign` - это утилита для генерации подписей. Он может использоваться одним из двух способов:

-   Как записываемый [stream](stream.md), в который записываются данные для подписи, а метод [`sign.sign()`](#signsignprivatekey-outputencoding) используется для генерации и возврата подписи, или
-   С помощью методов [`sign.update()`](#signupdatedata-inputencoding) и [`sign.sign()`](#signsignprivatekey-outputencoding) для создания подписи.

Метод [`crypto.createSign()`](#cryptocreatesignalgorithm-options) используется для создания экземпляров `Sign`. Аргументом служит строковое имя используемой хеш-функции. Объекты `Sign` не должны создаваться напрямую с помощью ключевого слова `new`.

Пример: объекты `Sign` и [`Verify`](#class-verify) как потоки:

=== "MJS"

    ```js
    const {
      generateKeyPairSync,
      createSign,
      createVerify,
    } = await import('node:crypto');

    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'sect239k1',
    });

    const sign = createSign('SHA256');
    sign.write('some data to sign');
    sign.end();
    const signature = sign.sign(privateKey, 'hex');

    const verify = createVerify('SHA256');
    verify.write('some data to sign');
    verify.end();
    console.log(verify.verify(publicKey, signature, 'hex'));
    // Prints: true
    ```

=== "CJS"

    ```js
    const {
      generateKeyPairSync,
      createSign,
      createVerify,
    } = require('node:crypto');

    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'sect239k1',
    });

    const sign = createSign('SHA256');
    sign.write('some data to sign');
    sign.end();
    const signature = sign.sign(privateKey, 'hex');

    const verify = createVerify('SHA256');
    verify.write('some data to sign');
    verify.end();
    console.log(verify.verify(publicKey, signature, 'hex'));
    // Prints: true
    ```

Пример: [`sign.update()`](#signupdatedata-inputencoding) и [`verify.update()`](#verifyupdatedata-inputencoding):

=== "MJS"

    ```js
    const {
      generateKeyPairSync,
      createSign,
      createVerify,
    } = await import('node:crypto');

    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    const sign = createSign('SHA256');
    sign.update('some data to sign');
    sign.end();
    const signature = sign.sign(privateKey);

    const verify = createVerify('SHA256');
    verify.update('some data to sign');
    verify.end();
    console.log(verify.verify(publicKey, signature));
    // Prints: true
    ```

=== "CJS"

    ```js
    const {
      generateKeyPairSync,
      createSign,
      createVerify,
    } = require('node:crypto');

    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });

    const sign = createSign('SHA256');
    sign.update('some data to sign');
    sign.end();
    const signature = sign.sign(privateKey);

    const verify = createVerify('SHA256');
    verify.update('some data to sign');
    verify.end();
    console.log(verify.verify(publicKey, signature));
    // Prints: true
    ```

### `sign.sign(privateKey[, outputEncoding])`

-   `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    -   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет подпись для всех переданных данных, полученных либо через [`sign.update()`](#signupdatedata-inputencoding), либо через [`sign.write()`](stream.md#writablewritechunk-encoding-callback).

Если `privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, можно передать следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр задаёт формат создаваемой подписи. Возможны следующие значения:
    -   `'der'` (по умолчанию): ASN.1-структура подписи `(r, s)` в кодировке DER.
    -   `'ieee-p1363'`: формат подписи `r || s`, предложенный в IEEE-P1363.
-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение padding для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (default)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая применяется для подписи сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt), если только хеш-функция MGF1 не была задана как часть ключа в соответствии с разделом 3.3 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли при использовании `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли равной размеру дайджеста, а `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) - максимально допустимому значению.

Если указан `outputEncoding`, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

После вызова метода `sign.sign()` объект `Sign` больше нельзя использовать повторно. Несколько вызовов `sign.sign()` приведут к выбросу ошибки.

### `sign.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `data`.

Обновляет содержимое `Sign` указанными `data`, кодировка которых задаётся в `inputEncoding`. Если `encoding` не указан и `data` является строкой, принудительно используется кодировка `'utf8'`. Если `data` является [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Этот метод можно вызывать многократно по мере поступления новых данных в потоке.

## Класс: `Verify` {#class-verify}

-   Расширяет: [`<stream.Writable>`](stream.md#streamwritable)

Класс `Verify` - это утилита для проверки подписей. Он может использоваться одним из двух способов:

-   Как записываемый [stream](stream.md), где записанные данные используются для проверки переданной подписи, или
-   С помощью методов [`verify.update()`](#verifyupdatedata-inputencoding) и [`verify.verify()`](#verifyverifykey-signature-signatureencoding) для проверки подписи.

Метод [`crypto.createVerify()`](#cryptocreateverifyalgorithm-options) используется для создания экземпляров `Verify`. Объекты `Verify` не должны создаваться напрямую с помощью ключевого слова `new`.

Примеры см. в разделе [`Sign`](#class-sign).

### `verify.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `data`.

Обновляет содержимое `Verify` указанными `data`, кодировка которых задаётся в `inputEncoding`. Если `inputEncoding` не указан и `data` является строкой, принудительно используется кодировка `'utf8'`. Если `data` является [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Этот метод можно вызывать многократно по мере поступления новых данных в потоке.

### `verify.verify(key, signature[, signatureEncoding])`

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    -   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `signature` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `signatureEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `signature`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` или `false` в зависимости от корректности подписи для данных и открытого ключа.

Проверяет переданные данные с использованием указанных `key` и `signature`.

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, можно передать следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр задаёт формат подписи. Возможны следующие значения:
    -   `'der'` (по умолчанию): ASN.1-структура подписи `(r, s)` в кодировке DER.
    -   `'ieee-p1363'`: формат подписи `r || s`, предложенный в IEEE-P1363.
-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение padding для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (default)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая применяется для проверки сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt), если только хеш-функция MGF1 не была задана как часть ключа в соответствии с разделом 3.3 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли при использовании `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли равной размеру дайджеста, а `crypto.constants.RSA_PSS_SALTLEN_AUTO` (по умолчанию) приводит к её автоматическому определению.

Аргумент `signature` - это ранее вычисленная подпись для данных в кодировке `signatureEncoding`. Если указан `signatureEncoding`, ожидается, что `signature` будет строкой; в противном случае ожидается [`Buffer`](buffer.md), `TypedArray` или `DataView`.

После вызова `verify.verify()` объект `verify` больше нельзя использовать повторно. Несколько вызовов `verify.verify()` приведут к выбросу ошибки.

Поскольку открытые ключи могут быть выведены из закрытых, вместо открытого ключа можно передать закрытый ключ.

## Класс: `X509Certificate`

Инкапсулирует сертификат X509 и предоставляет доступ только для чтения к его информации.

=== "MJS"

    ```js
    const { X509Certificate } = await import('node:crypto');

    const x509 = new X509Certificate('{... pem encoded cert ...}');

    console.log(x509.subject);
    ```

=== "CJS"

    ```js
    const { X509Certificate } = require('node:crypto');

    const x509 = new X509Certificate('{... pem encoded cert ...}');

    console.log(x509.subject);
    ```

### `new X509Certificate(buffer)`

-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A PEM or DER encoded X509 Certificate.

### `x509.ca`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Будет `true`, если это сертификат центра сертификации (CA).

### `x509.checkEmail(email[, options])`

-   `email` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `subject` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'default'`, `'always'` или `'never'`. **По умолчанию:** `'default'`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | `undefined` Возвращает `email`, если сертификат соответствует, и `undefined` в противном случае.

Проверяет, соответствует ли сертификат заданному адресу электронной почты.

Если параметр `'subject'` не задан или установлен в `'default'`, субъект сертификата учитывается только в том случае, если расширение subject alternative name либо отсутствует, либо не содержит адресов электронной почты.

Если параметр `'subject'` установлен в `'always'` и расширение subject alternative name либо отсутствует, либо не содержит подходящего адреса электронной почты, субъект сертификата учитывается.

Если параметр `'subject'` установлен в `'never'`, субъект сертификата не учитывается никогда, даже если сертификат не содержит subject alternative name.

### `x509.checkHost(name[, options])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `subject` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'default'`, `'always'` или `'never'`. **По умолчанию:** `'default'`.
    -   `wildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
    -   `partialWildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
    -   `multiLabelWildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
    -   `singleLabelSubdomains` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | `undefined` Возвращает имя субъекта, соответствующее `name`, или `undefined`, если ни одно имя субъекта не соответствует `name`.

Проверяет, соответствует ли сертификат заданному имени хоста.

Если сертификат соответствует заданному имени хоста, возвращается совпадающее имя субъекта. Возвращаемое имя может быть точным совпадением (например, `foo.example.com`) или может содержать подстановочные символы (например, `*.example.com`). Поскольку сравнение имён хостов нечувствительно к регистру, возвращаемое имя субъекта может отличаться от переданного `name` регистром символов.

Если параметр `'subject'` не задан или установлен в `'default'`, субъект сертификата учитывается только в том случае, если расширение subject alternative name либо отсутствует, либо не содержит DNS-имён. Это поведение соответствует [RFC 2818](https://www.rfc-editor.org/rfc/rfc2818.txt) ("HTTP Over TLS").

Если параметр `'subject'` установлен в `'always'` и расширение subject alternative name либо отсутствует, либо не содержит подходящего DNS-имени, субъект сертификата учитывается.

Если параметр `'subject'` установлен в `'never'`, субъект сертификата не учитывается никогда, даже если сертификат не содержит subject alternative name.

### `x509.checkIP(ip)`

-   `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | `undefined` Возвращает `ip`, если сертификат соответствует, и `undefined` в противном случае.

Проверяет, соответствует ли сертификат заданному IP-адресу (IPv4 или IPv6).

Учитываются только subject alternative name типа `iPAddress` из [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280.txt), и они должны точно совпадать с указанным адресом `ip`. Другие subject alternative name, а также поле subject сертификата игнорируются.

### `x509.checkIssued(otherCert)`

-   `otherCert` [`<X509Certificate>`](crypto.md)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, мог ли данный сертификат быть выдан указанным `otherCert`, сравнивая метаданные сертификатов.

Это полезно для сокращения списка возможных сертификатов издателя, отобранных более грубой процедурой фильтрации, например только по именам subject и issuer.

Наконец, чтобы проверить, что подпись этого сертификата была создана закрытым ключом, соответствующим открытому ключу `otherCert`, используйте [`x509.verify(publicKey)`](#x509verifypublickey) с открытым ключом `otherCert`, представленным как [`KeyObject`](#class-keyobject), например так:

```js
if (!x509.verify(otherCert.publicKey)) {
    throw new Error('otherCert did not issue x509');
}
```

### `x509.checkPrivateKey(privateKey)`

-   `privateKey` [`<KeyObject>`](#class-keyobject) Закрытый ключ.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, согласуется ли открытый ключ этого сертификата с указанным закрытым ключом.

### `x509.fingerprint`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Отпечаток SHA-1 этого сертификата.

Поскольку SHA-1 криптографически скомпрометирован, а его безопасность существенно ниже, чем у алгоритмов, обычно используемых для подписи сертификатов, рекомендуется вместо него использовать [`x509.fingerprint256`](#x509fingerprint256).

### `x509.fingerprint256`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Отпечаток SHA-256 этого сертификата.

### `x509.fingerprint512`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Отпечаток SHA-512 этого сертификата.

Поскольку вычисление отпечатка SHA-256 обычно происходит быстрее, а его размер вдвое меньше, чем у SHA-512, [`x509.fingerprint256`](#x509fingerprint256) может быть лучшим выбором. Хотя SHA-512 в целом, вероятно, обеспечивает более высокий уровень безопасности, безопасность SHA-256 соответствует безопасности большинства алгоритмов, обычно используемых для подписи сертификатов.

### `x509.infoAccess`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Текстовое представление расширения certificate authority information access.

Это список описаний доступа, разделённых переводом строки. Каждая строка начинается с метода доступа и вида места доступа, затем следует двоеточие и значение, связанное с этим местом доступа.

После префикса, обозначающего метод доступа и вид места доступа, оставшаяся часть строки может быть заключена в кавычки, чтобы показать, что значение является строковым литералом JSON. Для обратной совместимости Node.js использует строковые литералы JSON в этом свойстве только при необходимости, чтобы избежать неоднозначности. Сторонний код должен быть готов обрабатывать оба возможных формата записей.

### `x509.issuer`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Идентификатор издателя, включённый в этот сертификат.

### `x509.issuerCertificate`

-   Тип: [`<X509Certificate>`](crypto.md)

Сертификат издателя или `undefined`, если сертификат издателя недоступен.

### `x509.keyUsage`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Массив с подробным описанием расширенного использования ключа для этого сертификата.

### `x509.publicKey`

-   Тип: [`<KeyObject>`](#class-keyobject)

Открытый ключ [KeyObject](#class-keyobject) для этого сертификата.

### `x509.raw`

-   Тип: [`<Buffer>`](buffer.md#buffer)

[`Buffer`](buffer.md#buffer), содержащий DER-кодировку этого сертификата.

### `x509.serialNumber`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Серийный номер этого сертификата.

Серийные номера назначаются центрами сертификации и не являются уникальными идентификаторами сертификатов. В качестве уникального идентификатора лучше использовать [`x509.fingerprint256`](#x509fingerprint256).

### `x509.subject`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Полный subject этого сертификата.

### `x509.subjectAltName`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Subject alternative name, указанный для этого сертификата.

Это список subject alternative name, разделённых запятыми. Каждая запись начинается со строки, обозначающей вид subject alternative name, затем следует двоеточие и связанное с записью значение.

Ранние версии Node.js ошибочно предполагали, что это свойство безопасно разделять по последовательности из двух символов `', '` (см. [CVE-2021-44532](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44532)). Однако как вредоносные, так и легитимные сертификаты могут содержать subject alternative name, включающие эту последовательность при представлении в виде строки.

После префикса, обозначающего тип записи, оставшаяся часть записи может быть заключена в кавычки, чтобы показать, что значение является строковым литералом JSON. Для обратной совместимости Node.js использует строковые литералы JSON в этом свойстве только при необходимости, чтобы избежать неоднозначности. Сторонний код должен быть готов обрабатывать оба возможных формата записей.

### `x509.toJSON()`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Стандартной JSON-кодировки для сертификатов X509 не существует. Метод `toJSON()` возвращает строку, содержащую сертификат в PEM-кодировке.

### `x509.toLegacyObject()`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает информацию об этом сертификате, используя устаревшую кодировку [certificate object](tls.md#certificate-object).

### `x509.toString()`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает сертификат в PEM-кодировке.

### `x509.validFrom`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Дата и время, начиная с которых этот сертификат считается действительным.

### `x509.validFromDate`

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Дата и время, начиная с которых этот сертификат считается действительным, представленные объектом `Date`.

### `x509.validTo`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Дата и время, до которых этот сертификат считается действительным.

### `x509.validToDate`

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Дата и время, до которых этот сертификат считается действительным, представленные объектом `Date`.

### `x509.signatureAlgorithm`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Алгоритм, использованный для подписи сертификата, или `undefined`, если алгоритм подписи неизвестен OpenSSL.

### `x509.signatureAlgorithmOid`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

OID алгоритма, использованного для подписи сертификата.

### `x509.verify(publicKey)`

-   `publicKey` [`<KeyObject>`](#class-keyobject) Открытый ключ.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, что данный сертификат был подписан указанным открытым ключом. Других проверок корректности сертификата не выполняет.

## Методы и свойства модуля `node:crypto`

### `crypto.argon2(algorithm, parameters, callback)`

!!!warning "Стабильность: 1.2 - Кандидат на выпуск"

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Вариант Argon2: `"argon2d"`, `"argon2i"` или `"argon2id"`.
-   `parameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Обязателен: пароль для сценариев хеширования паролей с Argon2.
    -   `nonce` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Обязателен: должен иметь длину не менее 8 байт. Это salt для сценариев хеширования паролей с Argon2.
    -   `parallelism` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: степень параллелизма определяет, сколько вычислительных цепочек (lane) может выполняться. Должно быть больше 1 и меньше `2**24-1`.
    -   `tagLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: длина генерируемого ключа. Должна быть больше 4 и меньше `2**32-1`.
    -   `memory` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: стоимость по памяти в блоках по 1 KiB. Должно быть больше `8 * parallelism` и меньше `2**32-1`. Фактическое число блоков округляется вниз до ближайшего кратного `4 * parallelism`.
    -   `passes` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: количество проходов (итераций). Должно быть больше 1 и меньше `2**32-1`.
    -   `secret` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined Необязателен: случайный дополнительный ввод, похожий на salt, который **НЕ** следует хранить вместе с производным ключом. В сценариях хеширования паролей это называется pepper. Если используется, длина не должна превышать `2**32-1` байт.
    -   `associatedData` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined Необязателен: дополнительные данные, добавляемые в хеш; функционально эквивалентны salt или secret, но предназначены для неслучайных данных. Если используются, длина не должна превышать `2**32-1` байт.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `derivedKey` [`<Buffer>`](buffer.md#buffer)

Предоставляет асинхронную реализацию [Argon2](https://www.rfc-editor.org/rfc/rfc9106.html). Argon2 - это функция выведения ключа на основе пароля, специально сделанная вычислительно и по памяти дорогой, чтобы атаки перебором были неэффективны.

`nonce` должен быть максимально уникальным. Рекомендуется использовать случайный nonce длиной не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `message`, `nonce`, `secret` или `associatedData` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. При ошибке выведения ключа `err` содержит объект исключения, иначе `err` равен `null`. Аргумент `derivedKey` передаётся в callback как [`Buffer`](buffer.md).

Исключение выбрасывается, если какие-либо входные аргументы имеют недопустимые значения или типы.

=== "MJS"

    ```js
    const { argon2, randomBytes } = await import('node:crypto');

    const parameters = {
      message: 'password',
      nonce: randomBytes(16),
      parallelism: 4,
      tagLength: 64,
      memory: 65536,
      passes: 3,
    };

    argon2('argon2id', parameters, (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // 'af91dad...9520f15'
    });
    ```

=== "CJS"

    ```js
    const { argon2, randomBytes } = require('node:crypto');

    const parameters = {
      message: 'password',
      nonce: randomBytes(16),
      parallelism: 4,
      tagLength: 64,
      memory: 65536,
      passes: 3,
    };

    argon2('argon2id', parameters, (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // 'af91dad...9520f15'
    });
    ```

### `crypto.argon2Sync(algorithm, parameters)`

!!!warning "Стабильность: 1.2 - Кандидат на выпуск"

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Вариант Argon2: `"argon2d"`, `"argon2i"` или `"argon2id"`.
-   `parameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Обязателен: пароль для сценариев хеширования паролей с Argon2.
    -   `nonce` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Обязателен: должен иметь длину не менее 8 байт. Это salt для сценариев хеширования паролей с Argon2.
    -   `parallelism` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: степень параллелизма определяет, сколько вычислительных цепочек (lane) может выполняться. Должно быть больше 1 и меньше `2**24-1`.
    -   `tagLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: длина генерируемого ключа. Должна быть больше 4 и меньше `2**32-1`.
    -   `memory` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: стоимость по памяти в блоках по 1 KiB. Должно быть больше `8 * parallelism` и меньше `2**32-1`. Фактическое число блоков округляется вниз до ближайшего кратного `4 * parallelism`.
    -   `passes` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Обязателен: количество проходов (итераций). Должно быть больше 1 и меньше `2**32-1`.
    -   `secret` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined Необязателен: случайный дополнительный ввод, похожий на salt, который **НЕ** следует хранить вместе с производным ключом. В сценариях хеширования паролей это называется pepper. Если используется, длина не должна превышать `2**32-1` байт.
    -   `associatedData` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined Необязателен: дополнительные данные, добавляемые в хеш; функционально эквивалентны salt или secret, но предназначены для неслучайных данных. Если используются, длина не должна превышать `2**32-1` байт.
-   Возвращает: [`<Buffer>`](buffer.md#buffer)

Предоставляет синхронную реализацию [Argon2](https://www.rfc-editor.org/rfc/rfc9106.html). Argon2 - это функция выведения ключа на основе пароля, специально сделанная вычислительно и по памяти дорогой, чтобы атаки перебором были неэффективны.

`nonce` должен быть максимально уникальным. Рекомендуется использовать случайный nonce длиной не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `message`, `nonce`, `secret` или `associatedData` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Если при выведении ключа возникает ошибка, выбрасывается исключение; в противном случае производный ключ возвращается как [`Buffer`](buffer.md).

Исключение выбрасывается, если какие-либо входные аргументы имеют недопустимые значения или типы.

=== "MJS"

    ```js
    const { argon2Sync, randomBytes } = await import('node:crypto');

    const parameters = {
      message: 'password',
      nonce: randomBytes(16),
      parallelism: 4,
      tagLength: 64,
      memory: 65536,
      passes: 3,
    };

    const derivedKey = argon2Sync('argon2id', parameters);
    console.log(derivedKey.toString('hex'));  // 'af91dad...9520f15'
    ```

=== "CJS"

    ```js
    const { argon2Sync, randomBytes } = require('node:crypto');

    const parameters = {
      message: 'password',
      nonce: randomBytes(16),
      parallelism: 4,
      tagLength: 64,
      memory: 65536,
      passes: 3,
    };

    const derivedKey = argon2Sync('argon2id', parameters);
    console.log(derivedKey.toString('hex'));  // 'af91dad...9520f15'
    ```

### `crypto.checkPrime(candidate[, options], callback)`

-   `candidate` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Возможное простое число, закодированное как последовательность октетов big-endian произвольной длины.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `checks` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество вероятностных итераций проверки простоты Миллера-Рабина, которые нужно выполнить. Когда значение равно `0` (ноль), используется такое число проверок, которое даёт вероятность ложноположительного результата не более 2<sup>-64</sup> для случайного входа. При выборе количества проверок следует соблюдать осторожность. Подробнее см. в документации OpenSSL по параметрам `nchecks` функции [`BN_is_prime_ex`](https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html). **По умолчанию:** `0`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Устанавливается в объект [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), если во время проверки произошла ошибка.
    -   `result` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если `candidate` является простым числом с вероятностью ошибки менее `0.25 ** options.checks`.

Проверяет `candidate` на простоту.

### `crypto.checkPrimeSync(candidate[, options])`

-   `candidate` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Возможное простое число, закодированное как последовательность октетов big-endian произвольной длины.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `checks` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество вероятностных итераций проверки простоты Миллера-Рабина, которые нужно выполнить. Когда значение равно `0` (ноль), используется такое число проверок, которое даёт вероятность ложноположительного результата не более 2<sup>-64</sup> для случайного входа. При выборе количества проверок следует соблюдать осторожность. Подробнее см. в документации OpenSSL по параметрам `nchecks` функции [`BN_is_prime_ex`](https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html). **По умолчанию:** `0`
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если `candidate` является простым числом с вероятностью ошибки менее `0.25 ** options.checks`.

Проверяет `candidate` на простоту.

### `crypto.constants`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект, содержащий часто используемые константы для операций, связанных с криптографией и безопасностью. Конкретные константы, определённые в настоящий момент, описаны в разделе [Константы crypto](#crypto-constants).

### `crypto.createCipheriv(algorithm, key, iv[, options])`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
-   `iv` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | null
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.Transform`](stream.md#new-streamtransformoptions)
-   Возвращает: [`<Cipheriv>`](crypto.md#class-cipheriv)

Создаёт и возвращает объект `Cipheriv` с указанными `algorithm`, `key` и вектором инициализации (`iv`).

Аргумент `options` управляет поведением потока и является необязательным, кроме случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае параметр `authTagLength` обязателен и задаёт длину тега аутентификации в байтах, см. [Режим CCM](#ccm-mode). В режиме GCM параметр `authTagLength` не обязателен, но может использоваться для установки длины тега аутентификации, который будет возвращён методом `getAuthTag()`, и по умолчанию равен 16 байтам. Для `chacha20-poly1305` параметр `authTagLength` по умолчанию также равен 16 байтам.

Значение `algorithm` зависит от OpenSSL; примеры: `'aes192'` и другие. В современных версиях OpenSSL список доступных алгоритмов шифрования можно вывести командой `openssl list -cipher-algorithms`.

`key` - это сырой ключ, используемый алгоритмом `algorithm`, а `iv` - [вектор инициализации](https://en.wikipedia.org/wiki/Initialization_vector). Оба аргумента должны быть строками в кодировке `'utf8'`, объектами [Buffer](buffer.md), `TypedArray` или `DataView`. Аргумент `key` также может быть [`KeyObject`](#class-keyobject) типа `secret`. Если шифру не нужен вектор инициализации, `iv` может быть `null`.

При передаче строк для `key` или `iv` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Векторы инициализации должны быть непредсказуемыми и уникальными; в идеале они должны быть криптографически случайными. Они не обязаны быть секретными: обычно IV просто добавляются к сообщениям с шифротекстом в незашифрованном виде. Это может звучать противоречиво, но важно помнить, что злоумышленник не должен иметь возможности заранее предсказать значение конкретного IV.

### `crypto.createDecipheriv(algorithm, key, iv[, options])`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
-   `iv` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | null
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.Transform`](stream.md#new-streamtransformoptions)
-   Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv)

Создаёт и возвращает объект `Decipheriv`, использующий указанные `algorithm`, `key` и вектор инициализации (`iv`).

Аргумент `options` управляет поведением потока и является необязательным, кроме случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае параметр `authTagLength` обязателен и задаёт длину тега аутентификации в байтах, см. [Режим CCM](#ccm-mode). Для AES-GCM и `chacha20-poly1305` параметр `authTagLength` по умолчанию равен 16 байтам и должен быть установлен в другое значение, если используется иная длина.

Значение `algorithm` зависит от OpenSSL; примеры: `'aes192'` и другие. В современных версиях OpenSSL список доступных алгоритмов шифрования можно вывести командой `openssl list -cipher-algorithms`.

`key` - это сырой ключ, используемый алгоритмом `algorithm`, а `iv` - [вектор инициализации](https://en.wikipedia.org/wiki/Initialization_vector). Оба аргумента должны быть строками в кодировке `'utf8'`, объектами [Buffer](buffer.md), `TypedArray` или `DataView`. Аргумент `key` также может быть [`KeyObject`](#class-keyobject) типа `secret`. Если шифру не нужен вектор инициализации, `iv` может быть `null`.

При передаче строк для `key` или `iv` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Векторы инициализации должны быть непредсказуемыми и уникальными; в идеале они должны быть криптографически случайными. Они не обязаны быть секретными: обычно IV просто добавляются к сообщениям с шифротекстом в незашифрованном виде. Это может звучать противоречиво, но важно помнить, что злоумышленник не должен иметь возможности заранее предсказать значение конкретного IV.

### `crypto.createDiffieHellman(prime[, primeEncoding][, generator][, generatorEncoding])`

-   `prime` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `primeEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `prime`.
-   `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) **По умолчанию:** `2`
-   `generatorEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка](buffer.md#buffers-and-character-encodings) строки `generator`.
-   Возвращает: [`<DiffieHellman>`](crypto.md)

Создаёт объект обмена ключами `DiffieHellman`, используя переданный `prime` и необязательный конкретный `generator`.

Аргумент `generator` может быть числом, строкой или [`Buffer`](buffer.md). Если `generator` не указан, используется значение `2`.

Если указан `primeEncoding`, ожидается, что `prime` будет строкой; в противном случае ожидается [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если указан `generatorEncoding`, ожидается, что `generator` будет строкой; в противном случае ожидается число, [`Buffer`](buffer.md), `TypedArray` или `DataView`.

### `crypto.createDiffieHellman(primeLength[, generator])`

-   `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2`
-   Возвращает: [`<DiffieHellman>`](crypto.md)

Создаёт объект обмена ключами `DiffieHellman` и генерирует простое число длиной `primeLength` бит, используя необязательный конкретный числовой `generator`. Если `generator` не указан, используется значение `2`.

### `crypto.createDiffieHellmanGroup(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<DiffieHellmanGroup>`](#class-diffiehellmangroup)

Псевдоним для [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).

### `crypto.createECDH(curveName)`

-   `curveName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<ECDH>`](crypto.md)

Создаёт объект обмена ключами Elliptic Curve Diffie-Hellman (`ECDH`) с использованием предопределённой кривой, заданной строкой `curveName`. Чтобы получить список доступных имён кривых, используйте [`crypto.getCurves()`](#cryptogetcurves). В современных версиях OpenSSL команда `openssl ecparam -list_curves` также выводит имя и описание каждой доступной эллиптической кривой.

### `crypto.createHash(algorithm[, options])`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: [`<Hash>`](crypto.md)

Создаёт и возвращает объект `Hash`, который можно использовать для генерации дайджестов хеша с помощью указанного `algorithm`. Необязательный аргумент `options` управляет поведением потока. Для XOF-хеш-функций, таких как `'shake256'`, параметр `outputLength` можно использовать для задания желаемой длины результата в байтах.

Значение `algorithm` зависит от алгоритмов, поддерживаемых версией OpenSSL на данной платформе. Примеры: `'sha256'`, `'sha512'` и другие. В современных версиях OpenSSL список доступных алгоритмов дайджеста можно вывести командой `openssl list -digest-algorithms`.

Пример: вычисление суммы sha256 для файла

=== "MJS"

    ```js
    import {
      createReadStream,
    } from 'node:fs';
    import { argv } from 'node:process';
    const {
      createHash,
    } = await import('node:crypto');

    const filename = argv[2];

    const hash = createHash('sha256');

    const input = createReadStream(filename);
    input.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = input.read();
      if (data)
        hash.update(data);
      else {
        console.log(`${hash.digest('hex')} ${filename}`);
      }
    });
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
    } = require('node:fs');
    const {
      createHash,
    } = require('node:crypto');
    const { argv } = require('node:process');

    const filename = argv[2];

    const hash = createHash('sha256');

    const input = createReadStream(filename);
    input.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = input.read();
      if (data)
        hash.update(data);
      else {
        console.log(`${hash.digest('hex')} ${filename}`);
      }
    });
    ```

### `crypto.createHmac(algorithm, key[, options])`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.Transform`](stream.md#new-streamtransformoptions)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки, используемая, когда `key` является строкой.
-   Возвращает: [`<Hmac>`](crypto.md)

Создаёт и возвращает объект `Hmac`, использующий указанные `algorithm` и `key`. Необязательный аргумент `options` управляет поведением потока.

Значение `algorithm` зависит от алгоритмов, поддерживаемых версией OpenSSL на данной платформе. Примеры: `'sha256'`, `'sha512'` и другие. В современных версиях OpenSSL список доступных алгоритмов дайджеста можно вывести командой `openssl list -digest-algorithms`.

`key` - это ключ HMAC, используемый для генерации криптографического HMAC-хеша. Если это [`KeyObject`](#class-keyobject), его тип должен быть `secret`. Если это строка, учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis). Если ключ получен из криптографически надёжного источника энтропии, например через [`crypto.randomBytes()`](#cryptorandombytessize-callback) или [`crypto.generateKey()`](#cryptogeneratekeytype-options-callback), его длина не должна превышать размер блока `algorithm` (например, 512 бит для SHA-256).

Пример: вычисление HMAC sha256 для файла

=== "MJS"

    ```js
    import {
      createReadStream,
    } from 'node:fs';
    import { argv } from 'node:process';
    const {
      createHmac,
    } = await import('node:crypto');

    const filename = argv[2];

    const hmac = createHmac('sha256', 'a secret');

    const input = createReadStream(filename);
    input.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = input.read();
      if (data)
        hmac.update(data);
      else {
        console.log(`${hmac.digest('hex')} ${filename}`);
      }
    });
    ```

=== "CJS"

    ```js
    const {
      createReadStream,
    } = require('node:fs');
    const {
      createHmac,
    } = require('node:crypto');
    const { argv } = require('node:process');

    const filename = argv[2];

    const hmac = createHmac('sha256', 'a secret');

    const input = createReadStream(filename);
    input.on('readable', () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = input.read();
      if (data)
        hmac.update(data);
      else {
        console.log(`${hmac.digest('hex')} ${filename}`);
      }
    });
    ```

### `crypto.createPrivateKey(key)`

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
    -   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Материал ключа в формате PEM, DER, JWK или в сыром формате.
    -   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть `'pem'`, `'der'`, `'jwk'`, `'raw-private'` или `'raw-seed'`. **По умолчанию:** `'pem'`.
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть `'pkcs1'`, `'pkcs8'` или `'sec1'`. Этот параметр обязателен только когда `format` равен `'der'`, в остальных случаях игнорируется.
    -   `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) Парольная фраза, используемая для расшифровки.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, используемая, когда `key` является строкой.
    -   `asymmetricKeyType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Обязателен, когда `format` равен `'raw-private'` или `'raw-seed'`, в остальных случаях игнорируется. Должен быть [поддерживаемым типом ключа](#asymmetric-key-types).
    -   `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя используемой кривой. Обязателен, когда `asymmetricKeyType` равен `'ec'`, в остальных случаях игнорируется.
-   Возвращает: [`<KeyObject>`](#class-keyobject)

Создаёт и возвращает новый объект ключа, содержащий закрытый ключ. Если `key` является строкой или `Buffer`, предполагается формат `'pem'`; в противном случае `key` должен быть объектом со свойствами, описанными выше.

Если закрытый ключ зашифрован, необходимо указать `passphrase`. Длина парольной фразы ограничена 1024 байтами.

### `crypto.createPublicKey(key)`

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
    -   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Материал ключа в формате PEM, DER, JWK или в сыром формате.
    -   `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть `'pem'`, `'der'`, `'jwk'` или `'raw-public'`. **По умолчанию:** `'pem'`.
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть `'pkcs1'` или `'spki'`. Этот параметр обязателен только когда `format` равен `'der'`, в остальных случаях игнорируется.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, используемая, когда `key` является строкой.
    -   `asymmetricKeyType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Обязателен, когда `format` равен `'raw-public'`, в остальных случаях игнорируется. Должен быть [поддерживаемым типом ключа](#asymmetric-key-types).
    -   `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя используемой кривой. Обязателен, когда `asymmetricKeyType` равен `'ec'`, в остальных случаях игнорируется.
-   Возвращает: [`<KeyObject>`](#class-keyobject)

Создаёт и возвращает новый объект ключа, содержащий открытый ключ. Если `key` является строкой или `Buffer`, предполагается формат `'pem'`; если `key` является `KeyObject` с типом `'private'`, открытый ключ выводится из указанного закрытого ключа; в противном случае `key` должен быть объектом со свойствами, описанными выше.

Если формат равен `'pem'`, `key` также может быть сертификатом X.509.

Поскольку открытые ключи могут быть выведены из закрытых, вместо открытого ключа можно передать закрытый. В этом случае функция ведёт себя так, как будто был вызван [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey), за исключением того, что тип возвращаемого `KeyObject` будет `'public'`, а закрытый ключ нельзя будет извлечь из возвращённого `KeyObject`. Аналогично, если передан `KeyObject` типа `'private'`, будет возвращён новый `KeyObject` типа `'public'`, и извлечь закрытый ключ из возвращаемого объекта будет невозможно.

### `crypto.createSecretKey(key[, encoding])`

-   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки, если `key` является строкой.
-   Возвращает: [`<KeyObject>`](#class-keyobject)

Создаёт и возвращает новый объект ключа, содержащий секретный ключ для симметричного шифрования или `Hmac`.

### `crypto.createSign(algorithm[, options])`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.Writable`](stream.md#new-streamwritableoptions)
-   Возвращает: [`<Sign>`](#class-sign)

Создаёт и возвращает объект `Sign`, использующий указанный `algorithm`. Чтобы получить имена доступных алгоритмов дайджеста, используйте [`crypto.getHashes()`](#cryptogethashes). Необязательный аргумент `options` управляет поведением `stream.Writable`.

В некоторых случаях экземпляр `Sign` можно создать, используя имя алгоритма подписи, например `'RSA-SHA256'`, вместо имени алгоритма дайджеста. Тогда будет использован соответствующий алгоритм дайджеста. Это работает не для всех алгоритмов подписи, например не для `'ecdsa-with-SHA256'`, поэтому лучше всегда использовать имена алгоритмов дайджеста.

### `crypto.createVerify(algorithm[, options])`

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [параметры `stream.Writable`](stream.md#new-streamwritableoptions)
-   Возвращает: [`<Verify>`](#class-verify)

Создаёт и возвращает объект `Verify`, использующий указанный алгоритм. Чтобы получить массив имён доступных алгоритмов подписи, используйте [`crypto.getHashes()`](#cryptogethashes). Необязательный аргумент `options` управляет поведением `stream.Writable`.

В некоторых случаях экземпляр `Verify` можно создать, используя имя алгоритма подписи, например `'RSA-SHA256'`, вместо имени алгоритма дайджеста. Тогда будет использован соответствующий алгоритм дайджеста. Это работает не для всех алгоритмов подписи, например не для `'ecdsa-with-SHA256'`, поэтому лучше всегда использовать имена алгоритмов дайджеста.

### `crypto.decapsulate(key, ciphertext[, callback])`

!!!warning "Стабильность: 1.2 - Кандидат на выпуск"

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) Закрытый ключ
-   `ciphertext` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `sharedKey` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer), если функция `callback` не указана.

Декапсуляция ключа с использованием KEM-алгоритма и закрытого ключа.

Поддерживаемые типы ключей и соответствующие им KEM-алгоритмы:

-   `'rsa'`[^openssl30] RSA Secret Value Encapsulation
-   `'ec'`[^openssl32] DHKEM(P-256, HKDF-SHA256), DHKEM(P-384, HKDF-SHA256), DHKEM(P-521, HKDF-SHA256)
-   `'x25519'`[^openssl32] DHKEM(X25519, HKDF-SHA256)
-   `'x448'`[^openssl32] DHKEM(X448, HKDF-SHA512)
-   `'ml-kem-512'`[^openssl35] ML-KEM
-   `'ml-kem-768'`[^openssl35] ML-KEM
-   `'ml-kem-1024'`[^openssl35] ML-KEM

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey).

Если указана функция `callback`, эта функция использует пул потоков libuv.

### `crypto.diffieHellman(options[, callback])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject)
    -   `publicKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `secret` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer), если функция `callback` не передана.

Вычисляет общий секрет Диффи — Хеллмана на основе `privateKey` и `publicKey`. Оба ключа должны представлять один и тот же тип асимметричного ключа и поддерживать операцию DH или ECDH.

Если `options.privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `options.privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey).

Если `options.publicKey` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `options.publicKey` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey).

Если передана функция `callback`, эта функция использует пул потоков libuv.

### `crypto.encapsulate(key[, callback])`

!!!warning "Стабильность: 1.2 - Кандидат на выпуск"

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) Открытый ключ
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `result` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `sharedKey` [`<Buffer>`](buffer.md#buffer)
        -   `ciphertext` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), если функция `callback` не указана.
    -   `sharedKey` [`<Buffer>`](buffer.md#buffer)
    -   `ciphertext` [`<Buffer>`](buffer.md#buffer)

Инкапсуляция ключа с использованием KEM-алгоритма и открытого ключа.

Поддерживаемые типы ключей и соответствующие им KEM-алгоритмы:

-   `'rsa'`[^openssl30] RSA Secret Value Encapsulation
-   `'ec'`[^openssl32] DHKEM(P-256, HKDF-SHA256), DHKEM(P-384, HKDF-SHA256), DHKEM(P-521, HKDF-SHA256)
-   `'x25519'`[^openssl32] DHKEM(X25519, HKDF-SHA256)
-   `'x448'`[^openssl32] DHKEM(X448, HKDF-SHA512)
-   `'ml-kem-512'`[^openssl35] ML-KEM
-   `'ml-kem-768'`[^openssl35] ML-KEM
-   `'ml-kem-1024'`[^openssl35] ML-KEM

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey).

If the `callback` function is provided this function uses libuv's threadpool.

### `crypto.fips`

<!-- YAML
added: v6.0.0
deprecated: v10.0.0
-->

> Stability: 0 - Deprecated

Свойство для проверки и управления тем, используется ли в данный момент FIPS-совместимый криптографический провайдер. Установка значения `true` требует FIPS-сборки Node.js.

Это свойство устарело. Используйте вместо него `crypto.setFips()` и `crypto.getFips()`.

### `crypto.generateKey(type, options, callback)`

<!-- YAML
added: v15.0.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The intended use of the generated secret key. Currently accepted values are `'hmac'` and `'aes'`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The bit length of the key to generate. This must be a value greater than 0.
        -   If `type` is `'hmac'`, the minimum is 8, and the maximum length is 2<sup>31</sup>-1. If the value is not a multiple of 8, the generated key will be truncated to `Math.floor(length / 8)`.
        -   If `type` is `'aes'`, the length must be one of `128`, `192`, or `256`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `key` [`<KeyObject>`](#class-keyobject)

Asynchronously generates a new random secret key of the given `length`. The `type` will determine which validations will be performed on the `length`.

=== "MJS"

    ```js
    const {
      generateKey,
    } = await import('node:crypto');

    generateKey('hmac', { length: 512 }, (err, key) => {
      if (err) throw err;
      console.log(key.export().toString('hex'));  // 46e..........620
    });
    ```

=== "CJS"

    ```js
    const {
      generateKey,
    } = require('node:crypto');

    generateKey('hmac', { length: 512 }, (err, key) => {
      if (err) throw err;
      console.log(key.export().toString('hex'));  // 46e..........620
    });
    ```

The size of a generated HMAC key should not exceed the block size of the underlying hash function. See [`crypto.createHmac()`](#cryptocreatehmacalgorithm-key-options) for more information.

### `crypto.generateKeyPair(type, options, callback)`

<!-- YAML
added: v10.12.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59537
    description: Add support for SLH-DSA key pairs.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59461
    description: Add support for ML-KEM key pairs.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA key pairs.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/39927
    description: Add ability to define `RSASSA-PSS-params` sequence parameters
                 for RSA-PSS keys pairs.
  - version:
     - v13.9.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31178
    description: Add support for Diffie-Hellman.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26960
    description: Add support for RSA-PSS key pairs.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26774
    description: Add ability to generate X25519 and X448 key pairs.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26554
    description: Add ability to generate Ed25519 and Ed448 key pairs.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `generateKeyPair` and `generateKeyPairSync` functions now
                 produce key objects if no encoding was specified.
-->

Добавлено в: v10.12.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Добавьте поддержку пар ключей SLH-DSA. |
    | v24.7.0 | Добавьте поддержку пар ключей ML-KEM. |
    | v24.6.0 | Добавьте поддержку пар ключей ML-DSA. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v16.10.0 | Добавлена ​​возможность определять параметры последовательности `RSASSA-PSS-params` для пар ключей RSA-PSS. |
    | v13.9.0, v12.17.0 | Добавьте поддержку Диффи-Хеллмана. |
    | v12.0.0 | Добавьте поддержку пар ключей RSA-PSS. |
    | v12.0.0 | Добавьте возможность генерировать пары ключей X25519 и X448. |
    | v12.0.0 | Добавьте возможность генерировать пары ключей Ed25519 и Ed448. |
    | v11.6.0 | Функции `generateKeyPair` и `generateKeyPairSync` теперь создают ключевые объекты, если не была указана кодировка. |

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The asymmetric key type to generate. See the supported [asymmetric key types](#asymmetric-key-types).
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `modulusLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Key size in bits (RSA, DSA).
    -   `publicExponent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Public exponent (RSA). **По умолчанию:** `0x10001`.
    -   `hashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest (RSA-PSS).
    -   `mgf1HashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest used by MGF1 (RSA-PSS).
    -   `saltLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Minimal salt length in bytes (RSA-PSS).
    -   `divisorLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Size of `q` in bits (DSA).
    -   `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the curve to use (EC).
    -   `prime` [`<Buffer>`](buffer.md#buffer) The prime parameter (DH).
    -   `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Prime length in bits (DH).
    -   `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Custom generator (DH). **По умолчанию:** `2`.
    -   `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Diffie-Hellman group name (DH). See [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).
    -   `paramEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'named'` or `'explicit'` (EC). **По умолчанию:** `'named'`.
    -   `publicKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`](#keyobjectexportoptions).
    -   `privateKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`](#keyobjectexportoptions).
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)
    -   `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)

Generates a new asymmetric key pair of the given `type`. See the supported [asymmetric key types](#asymmetric-key-types).

If a `publicKeyEncoding` or `privateKeyEncoding` was specified, this function behaves as if [`keyObject.export()`](#keyobjectexportoptions) had been called on its result. Otherwise, the respective part of the key is returned as a [`KeyObject`](#class-keyobject).

It is recommended to encode public keys as `'spki'` and private keys as `'pkcs8'` with encryption for long-term storage:

=== "MJS"

    ```js
    const {
      generateKeyPair,
    } = await import('node:crypto');

    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
      },
    }, (err, publicKey, privateKey) => {
      // Handle errors and use the generated key pair.
    });
    ```

=== "CJS"

    ```js
    const {
      generateKeyPair,
    } = require('node:crypto');

    generateKeyPair('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
      },
    }, (err, publicKey, privateKey) => {
      // Handle errors and use the generated key pair.
    });
    ```

On completion, `callback` will be called with `err` set to `undefined` and `publicKey` / `privateKey` representing the generated key pair.

If this method is invoked as its [`util.promisify()`](util.md#utilpromisifyoriginal)ed version, it returns a `Promise` for an `Object` with `publicKey` and `privateKey` properties.

### `crypto.generateKeyPairSync(type, options)`

<!-- YAML
added: v10.12.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59537
    description: Add support for SLH-DSA key pairs.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59461
    description: Add support for ML-KEM key pairs.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA key pairs.
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/39927
    description: Add ability to define `RSASSA-PSS-params` sequence parameters
                 for RSA-PSS keys pairs.
  - version:
     - v13.9.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31178
    description: Add support for Diffie-Hellman.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26960
    description: Add support for RSA-PSS key pairs.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26774
    description: Add ability to generate X25519 and X448 key pairs.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26554
    description: Add ability to generate Ed25519 and Ed448 key pairs.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `generateKeyPair` and `generateKeyPairSync` functions now
                 produce key objects if no encoding was specified.
-->

Добавлено в: v10.12.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Добавьте поддержку пар ключей SLH-DSA. |
    | v24.7.0 | Добавьте поддержку пар ключей ML-KEM. |
    | v24.6.0 | Добавьте поддержку пар ключей ML-DSA. |
    | v16.10.0 | Добавлена ​​возможность определять параметры последовательности `RSASSA-PSS-params` для пар ключей RSA-PSS. |
    | v13.9.0, v12.17.0 | Добавьте поддержку Диффи-Хеллмана. |
    | v12.0.0 | Добавьте поддержку пар ключей RSA-PSS. |
    | v12.0.0 | Добавьте возможность генерировать пары ключей X25519 и X448. |
    | v12.0.0 | Добавьте возможность генерировать пары ключей Ed25519 и Ed448. |
    | v11.6.0 | Функции `generateKeyPair` и `generateKeyPairSync` теперь создают ключевые объекты, если не была указана кодировка. |

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The asymmetric key type to generate. See the supported [asymmetric key types](#asymmetric-key-types).
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `modulusLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Key size in bits (RSA, DSA).
    -   `publicExponent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Public exponent (RSA). **По умолчанию:** `0x10001`.
    -   `hashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest (RSA-PSS).
    -   `mgf1HashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest used by MGF1 (RSA-PSS).
    -   `saltLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Minimal salt length in bytes (RSA-PSS).
    -   `divisorLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Size of `q` in bits (DSA).
    -   `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the curve to use (EC).
    -   `prime` [`<Buffer>`](buffer.md#buffer) The prime parameter (DH).
    -   `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Prime length in bits (DH).
    -   `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Custom generator (DH). **По умолчанию:** `2`.
    -   `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Diffie-Hellman group name (DH). See [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).
    -   `paramEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'named'` or `'explicit'` (EC). **По умолчанию:** `'named'`.
    -   `publicKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`](#keyobjectexportoptions).
    -   `privateKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`](#keyobjectexportoptions).
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)
    -   `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)

Generates a new asymmetric key pair of the given `type`. See the supported [asymmetric key types](#asymmetric-key-types).

If a `publicKeyEncoding` or `privateKeyEncoding` was specified, this function behaves as if [`keyObject.export()`](#keyobjectexportoptions) had been called on its result. Otherwise, the respective part of the key is returned as a [`KeyObject`](#class-keyobject).

When encoding public keys, it is recommended to use `'spki'`. When encoding private keys, it is recommended to use `'pkcs8'` with a strong passphrase, and to keep the passphrase confidential.

=== "MJS"

    ```js
    const {
      generateKeyPairSync,
    } = await import('node:crypto');

    const {
      publicKey,
      privateKey,
    } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
      },
    });
    ```

=== "CJS"

    ```js
    const {
      generateKeyPairSync,
    } = require('node:crypto');

    const {
      publicKey,
      privateKey,
    } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: 'top secret',
      },
    });
    ```

The return value `{ publicKey, privateKey }` represents the generated key pair. When PEM encoding was selected, the respective key will be a string, otherwise it will be a buffer containing the data encoded as DER.

### `crypto.generateKeySync(type, options)`

<!-- YAML
added: v15.0.0
-->

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The intended use of the generated secret key. Currently accepted values are `'hmac'` and `'aes'`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The bit length of the key to generate.
        -   If `type` is `'hmac'`, the minimum is 8, and the maximum length is 2<sup>31</sup>-1. If the value is not a multiple of 8, the generated key will be truncated to `Math.floor(length / 8)`.
        -   If `type` is `'aes'`, the length must be one of `128`, `192`, or `256`.
-   Возвращает: [`<KeyObject>`](#class-keyobject)

Synchronously generates a new random secret key of the given `length`. The `type` will determine which validations will be performed on the `length`.

=== "MJS"

    ```js
    const {
      generateKeySync,
    } = await import('node:crypto');

    const key = generateKeySync('hmac', { length: 512 });
    console.log(key.export().toString('hex'));  // e89..........41e
    ```

=== "CJS"

    ```js
    const {
      generateKeySync,
    } = require('node:crypto');

    const key = generateKeySync('hmac', { length: 512 });
    console.log(key.export().toString('hex'));  // e89..........41e
    ```

The size of a generated HMAC key should not exceed the block size of the underlying hash function. See [`crypto.createHmac()`](#cryptocreatehmacalgorithm-key-options) for more information.

### `crypto.generatePrime(size[, options], callback)`

<!-- YAML
added: v15.8.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v15.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The size (in bits) of the prime to generate.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `add` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    -   `rem` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    -   `safe` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, the generated prime is returned as a `bigint`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `prime` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Generates a pseudorandom prime of `size` bits.

If `options.safe` is `true`, the prime will be a safe prime -- that is, `(prime - 1) / 2` will also be a prime.

The `options.add` and `options.rem` parameters can be used to enforce additional requirements, e.g., for Diffie-Hellman:

-   If `options.add` and `options.rem` are both set, the prime will satisfy the condition that `prime % add = rem`.
-   If only `options.add` is set and `options.safe` is not `true`, the prime will satisfy the condition that `prime % add = 1`.
-   If only `options.add` is set and `options.safe` is set to `true`, the prime will instead satisfy the condition that `prime % add = 3`. This is necessary because `prime % add = 1` for `options.add > 2` would contradict the condition enforced by `options.safe`.
-   `options.rem` is ignored if `options.add` is not given.

Both `options.add` and `options.rem` must be encoded as big-endian sequences if given as an `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer`, or `DataView`.

By default, the prime is encoded as a big-endian sequence of octets in an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). If the `bigint` option is `true`, then a [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) is provided.

The `size` of the prime will have a direct impact on how long it takes to generate the prime. The larger the size, the longer it will take. Because we use OpenSSL's `BN_generate_prime_ex` function, which provides only minimal control over our ability to interrupt the generation process, it is not recommended to generate overly large primes, as doing so may make the process unresponsive.

### `crypto.generatePrimeSync(size[, options])`

<!-- YAML
added: v15.8.0
-->

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The size (in bits) of the prime to generate.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `add` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    -   `rem` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
    -   `safe` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, the generated prime is returned as a `bigint`.
-   Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Generates a pseudorandom prime of `size` bits.

If `options.safe` is `true`, the prime will be a safe prime -- that is, `(prime - 1) / 2` will also be a prime.

The `options.add` and `options.rem` parameters can be used to enforce additional requirements, e.g., for Diffie-Hellman:

-   If `options.add` and `options.rem` are both set, the prime will satisfy the condition that `prime % add = rem`.
-   If only `options.add` is set and `options.safe` is not `true`, the prime will satisfy the condition that `prime % add = 1`.
-   If only `options.add` is set and `options.safe` is set to `true`, the prime will instead satisfy the condition that `prime % add = 3`. This is necessary because `prime % add = 1` for `options.add > 2` would contradict the condition enforced by `options.safe`.
-   `options.rem` is ignored if `options.add` is not given.

Both `options.add` and `options.rem` must be encoded as big-endian sequences if given as an `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer`, or `DataView`.

By default, the prime is encoded as a big-endian sequence of octets in an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). If the `bigint` option is `true`, then a [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) is provided.

The `size` of the prime will have a direct impact on how long it takes to generate the prime. The larger the size, the longer it will take. Because we use OpenSSL's `BN_generate_prime_ex` function, which provides only minimal control over our ability to interrupt the generation process, it is not recommended to generate overly large primes, as doing so may make the process unresponsive.

### `crypto.getCipherInfo(nameOrNid[, options])`

<!-- YAML
added: v15.0.0
-->

-   `nameOrNid` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The name or nid of the cipher to query.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `keyLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A test key length.
    -   `ivLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A test IV length.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The name of the cipher
    -   `nid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nid of the cipher
    -   `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The block size of the cipher in bytes. This property is omitted when `mode` is `'stream'`.
    -   `ivLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The expected or default initialization vector length in bytes. This property is omitted if the cipher does not use an initialization vector.
    -   `keyLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The expected or default key length in bytes.
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The cipher mode. One of `'cbc'`, `'ccm'`, `'cfb'`, `'ctr'`, `'ecb'`, `'gcm'`, `'ocb'`, `'ofb'`, `'stream'`, `'wrap'`, `'xts'`.

Returns information about a given cipher.

Some ciphers accept variable length keys and initialization vectors. By default, the `crypto.getCipherInfo()` method will return the default values for these ciphers. To test if a given key length or iv length is acceptable for given cipher, use the `keyLength` and `ivLength` options. If the given values are unacceptable, `undefined` will be returned.

### `crypto.getCiphers()`

<!-- YAML
added: v0.9.3
-->

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array with the names of the supported cipher algorithms.

=== "MJS"

    ```js
    const {
      getCiphers,
    } = await import('node:crypto');

    console.log(getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
    ```

=== "CJS"

    ```js
    const {
      getCiphers,
    } = require('node:crypto');

    console.log(getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
    ```

### `crypto.getCurves()`

<!-- YAML
added: v2.3.0
-->

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array with the names of the supported elliptic curves.

=== "MJS"

    ```js
    const {
      getCurves,
    } = await import('node:crypto');

    console.log(getCurves()); // ['Oakley-EC2N-3', 'Oakley-EC2N-4', ...]
    ```

=== "CJS"

    ```js
    const {
      getCurves,
    } = require('node:crypto');

    console.log(getCurves()); // ['Oakley-EC2N-3', 'Oakley-EC2N-4', ...]
    ```

### `crypto.getDiffieHellman(groupName)`

<!-- YAML
added: v0.7.5
-->

-   `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<DiffieHellmanGroup>`](#class-diffiehellmangroup)

Creates a predefined `DiffieHellmanGroup` key exchange object. The supported groups are listed in the documentation for [`DiffieHellmanGroup`](#class-diffiehellmangroup).

The returned object mimics the interface of objects created by [`crypto.createDiffieHellman()`](#cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding), but will not allow changing the keys (with [`diffieHellman.setPublicKey()`](#diffiehellmansetpublickeypublickey-encoding), for example). The advantage of using this method is that the parties do not have to generate nor exchange a group modulus beforehand, saving both processor and communication time.

Example (obtaining a shared secret):

=== "MJS"

    ```js
    const {
      getDiffieHellman,
    } = await import('node:crypto');
    const alice = getDiffieHellman('modp14');
    const bob = getDiffieHellman('modp14');

    alice.generateKeys();
    bob.generateKeys();

    const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
    const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

    /* aliceSecret and bobSecret should be the same */
    console.log(aliceSecret === bobSecret);
    ```

=== "CJS"

    ```js
    const {
      getDiffieHellman,
    } = require('node:crypto');

    const alice = getDiffieHellman('modp14');
    const bob = getDiffieHellman('modp14');

    alice.generateKeys();
    bob.generateKeys();

    const aliceSecret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
    const bobSecret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

    /* aliceSecret and bobSecret should be the same */
    console.log(aliceSecret === bobSecret);
    ```

### `crypto.getFips()`

<!-- YAML
added: v10.0.0
-->

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `1`, если и только если в данный момент используется FIPS-совместимый криптографический провайдер, иначе `0`. В одном из будущих semver-major-релизов тип возвращаемого значения этого API может быть изменён на [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

### `crypto.getHashes()`

<!-- YAML
added: v0.9.3
-->

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array of the names of the supported hash algorithms, such as `'RSA-SHA256'`. Hash algorithms are also called "digest" algorithms.

=== "MJS"

    ```js
    const {
      getHashes,
    } = await import('node:crypto');

    console.log(getHashes()); // ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
    ```

=== "CJS"

    ```js
    const {
      getHashes,
    } = require('node:crypto');

    console.log(getHashes()); // ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
    ```

### `crypto.getRandomValues(typedArray)`

<!-- YAML
added: v17.4.0
-->

-   `typedArray` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) Возвращает `typedArray`.

Удобный псевдоним для [`crypto.webcrypto.getRandomValues()`](webcrypto.md#cryptogetrandomvaluestypedarray). Эта реализация не соответствует спецификации Web Crypto, поэтому для написания кода, совместимого с веб-платформой, следует использовать [`crypto.webcrypto.getRandomValues()`](webcrypto.md#cryptogetrandomvaluestypedarray).

### `crypto.hash(algorithm, data[, options])`

<!-- YAML
added:
 - v21.7.0
 - v20.12.0
changes:
  - version:
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/60994
    description: This API is no longer experimental.
  - version: v24.4.0
    pr-url: https://github.com/nodejs/node/pull/58121
    description: The `outputLength` option was added for XOF hash functions.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | Этот API больше не является экспериментальным. |
    | v24.4.0 | Опция «outputLength» была добавлена ​​для хэш-функций XOF. |

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) When `data` is a string, it will be encoded as UTF-8 before being hashed. If a different input encoding is desired for a string input, user could encode the string into a `TypedArray` using either `TextEncoder` or `Buffer.from()` and passing the encoded `TypedArray` into this API instead.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Encoding](buffer.md#buffers-and-character-encodings) used to encode the returned digest. **По умолчанию:** `'hex'`.
    -   `outputLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) For XOF hash functions such as 'shake256', the outputLength option can be used to specify the desired output length in bytes.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Утилита для создания одноразовых хеш-дайджестов данных. Она может быть быстрее объектного `crypto.createHash()` при хешировании небольшого объёма данных (<= 5 МБ), который уже доступен целиком. Если данные могут быть большими или поступают потоком, по-прежнему рекомендуется использовать `crypto.createHash()`.

Значение `algorithm` зависит от алгоритмов, поддерживаемых версией OpenSSL на данной платформе. Примеры: `'sha256'`, `'sha512'` и другие. В современных версиях OpenSSL список доступных алгоритмов дайджеста можно вывести командой `openssl list -digest-algorithms`.

Если `options` является строкой, она задаёт `outputEncoding`.

Пример:

=== "CJS"

    ```js
    const crypto = require('node:crypto');
    const { Buffer } = require('node:buffer');

    // Hashing a string and return the result as a hex-encoded string.
    const string = 'Node.js';
    // 10b3493287f831e81a438811a1ffba01f8cec4b7
    console.log(crypto.hash('sha1', string));

    // Encode a base64-encoded string into a Buffer, hash it and return
    // the result as a buffer.
    const base64 = 'Tm9kZS5qcw==';
    // <Buffer 10 b3 49 32 87 f8 31 e8 1a 43 88 11 a1 ff ba 01 f8 ce c4 b7>
    console.log(crypto.hash('sha1', Buffer.from(base64, 'base64'), 'buffer'));
    ```

=== "MJS"

    ```js
    import crypto from 'node:crypto';
    import { Buffer } from 'node:buffer';

    // Hashing a string and return the result as a hex-encoded string.
    const string = 'Node.js';
    // 10b3493287f831e81a438811a1ffba01f8cec4b7
    console.log(crypto.hash('sha1', string));

    // Encode a base64-encoded string into a Buffer, hash it and return
    // the result as a buffer.
    const base64 = 'Tm9kZS5qcw==';
    // <Buffer 10 b3 49 32 87 f8 31 e8 1a 43 88 11 a1 ff ba 01 f8 ce c4 b7>
    console.log(crypto.hash('sha1', Buffer.from(base64, 'base64'), 'buffer'));
    ```

### `crypto.hkdf(digest, ikm, salt, info, keylen, callback)`

<!-- YAML
added: v15.0.0
changes:
  - version:
    - v18.8.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/44201
    description: The input keying material can now be zero-length.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.8.0, v16.18.0 | Входной ключевой материал теперь может иметь нулевую длину. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The digest algorithm to use.
-   `ikm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) Входной ключевой материал. Обязателен, но может иметь нулевую длину.
-   `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значение salt. Обязательно, но может иметь нулевую длину.
-   `info` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Дополнительное значение info. Обязательно, но может иметь нулевую длину и не может превышать 1024 байта.
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина генерируемого ключа. Должна быть больше 0. Максимально допустимое значение равно `255`, умноженному на количество байтов, производимых выбранной хеш-функцией (например, `sha512` создаёт 64-байтовые хеши, поэтому максимальный вывод HKDF составляет 16320 байт).
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `derivedKey` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

HKDF — это простая функция выработки ключа, определённая в RFC 5869. Переданные `ikm`, `salt` и `info` используются вместе с `digest` для выработки ключа длиной `keylen` байт.

Переданная функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. Если при выработке ключа возникает ошибка, в `err` будет передано её значение; в противном случае `err` будет равно `null`. Успешно сгенерированный `derivedKey` будет передан в callback как [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Если какие-либо входные аргументы содержат недопустимые значения или типы, будет выброшена ошибка.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const {
      hkdf,
    } = await import('node:crypto');

    hkdf('sha512', 'key', 'salt', 'info', 64, (err, derivedKey) => {
      if (err) throw err;
      console.log(Buffer.from(derivedKey).toString('hex'));  // '24156e2...5391653'
    });
    ```

=== "CJS"

    ```js
    const {
      hkdf,
    } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    hkdf('sha512', 'key', 'salt', 'info', 64, (err, derivedKey) => {
      if (err) throw err;
      console.log(Buffer.from(derivedKey).toString('hex'));  // '24156e2...5391653'
    });
    ```

### `crypto.hkdfSync(digest, ikm, salt, info, keylen)`

<!-- YAML
added: v15.0.0
changes:
  - version:
    - v18.8.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/44201
    description: The input keying material can now be zero-length.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.8.0, v16.18.0 | Входной ключевой материал теперь может иметь нулевую длину. |

-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используемый алгоритм дайджеста.
-   `ikm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) Входной ключевой материал. Обязателен, но может иметь нулевую длину.
-   `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Значение salt. Обязательно, но может иметь нулевую длину.
-   `info` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Дополнительное значение info. Обязательно, но может иметь нулевую длину и не может превышать 1024 байта.
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина генерируемого ключа. Должна быть больше 0. Максимально допустимое значение равно `255`, умноженному на количество байтов, производимых выбранной хеш-функцией (например, `sha512` создаёт 64-байтовые хеши, поэтому максимальный вывод HKDF составляет 16320 байт).
-   Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Предоставляет синхронную функцию выведения ключа HKDF, определённую в RFC 5869. Переданные `ikm`, `salt` и `info` используются вместе с `digest` для выведения ключа длиной `keylen` байт.

Успешно сгенерированный `derivedKey` будет возвращён как [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Ошибка будет выброшена, если какие-либо входные аргументы имеют недопустимые значения или типы, либо если не удаётся сгенерировать производный ключ.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const {
      hkdfSync,
    } = await import('node:crypto');

    const derivedKey = hkdfSync('sha512', 'key', 'salt', 'info', 64);
    console.log(Buffer.from(derivedKey).toString('hex'));  // '24156e2...5391653'
    ```

=== "CJS"

    ```js
    const {
      hkdfSync,
    } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const derivedKey = hkdfSync('sha512', 'key', 'salt', 'info', 64);
    console.log(Buffer.from(derivedKey).toString('hex'));  // '24156e2...5391653'
    ```

### `crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)`

<!-- YAML
added: v0.5.5
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The password and salt arguments can also be ArrayBuffer
                 instances.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30578
    description: The `iterations` parameter is now restricted to positive
                 values. Earlier releases treated other values as one.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11305
    description: The `digest` parameter is always required now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/4047
    description: Calling this function without passing the `digest` parameter
                 is deprecated now and will emit a warning.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default encoding for `password` if it is a string changed
                 from `binary` to `utf8`.
-->

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v15.0.0 | Аргументы пароля и соли также могут быть экземплярами ArrayBuffer. |
    | v14.0.0 | Параметр `iterations` теперь ограничен положительными значениями. В более ранних версиях другие значения рассматривались как одно. |
    | v8.0.0 | Параметр `digest` теперь требуется всегда. |
    | v6.0.0 | Вызов этой функции без передачи параметра `digest` теперь устарел и выдаст предупреждение. |
    | v6.0.0 | Кодировка по умолчанию для пароля, если это строка, изменена с двоичной на utf8. |

-   `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `iterations` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `derivedKey` [`<Buffer>`](buffer.md#buffer)

Предоставляет асинхронную реализацию Password-Based Key Derivation Function 2 (PBKDF2). Выбранный алгоритм дайджеста HMAC, заданный через `digest`, используется для выведения ключа требуемой длины в байтах (`keylen`) из `password`, `salt` и `iterations`.

Переданная функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. Если при выведении ключа возникает ошибка, `err` будет установлен; в противном случае `err` будет равен `null`. По умолчанию успешно созданный `derivedKey` передаётся в callback как [`Buffer`](buffer.md). Если какие-либо входные аргументы имеют недопустимые значения или типы, будет выброшена ошибка.

Аргумент `iterations` должен быть числом, установленным как можно выше. Чем больше число итераций, тем безопаснее будет производный ключ, но тем больше времени займёт выполнение.

`salt` должен быть максимально уникальным. Рекомендуется использовать случайный salt длиной не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

=== "MJS"

    ```js
    const {
      pbkdf2,
    } = await import('node:crypto');

    pbkdf2('secret', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
    });
    ```

=== "CJS"

    ```js
    const {
      pbkdf2,
    } = require('node:crypto');

    pbkdf2('secret', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
    });
    ```

Массив поддерживаемых функций дайджеста можно получить с помощью [`crypto.getHashes()`](#cryptogethashes).

Этот API использует пул потоков libuv, что для некоторых приложений может иметь неожиданные и отрицательные последствия для производительности; подробнее см. в документации [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize).

### `crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)`

<!-- YAML
added: v0.9.3
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30578
    description: The `iterations` parameter is now restricted to positive
                 values. Earlier releases treated other values as one.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/4047
    description: Calling this function without passing the `digest` parameter
                 is deprecated now and will emit a warning.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default encoding for `password` if it is a string changed
                 from `binary` to `utf8`.
-->

Добавлено в: v0.9.3

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Параметр `iterations` теперь ограничен положительными значениями. В более ранних версиях другие значения рассматривались как одно. |
    | v6.0.0 | Вызов этой функции без передачи параметра `digest` теперь устарел и выдаст предупреждение. |
    | v6.0.0 | Кодировка по умолчанию для пароля, если это строка, изменена с двоичной на utf8. |

-   `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `iterations` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<Buffer>`](buffer.md#buffer)

Предоставляет синхронную реализацию Password-Based Key Derivation Function 2 (PBKDF2). Выбранный алгоритм дайджеста HMAC, заданный через `digest`, используется для выведения ключа требуемой длины в байтах (`keylen`) из `password`, `salt` и `iterations`.

Если возникает ошибка, выбрасывается `Error`; в противном случае производный ключ возвращается как [`Buffer`](buffer.md).

Аргумент `iterations` должен быть числом, установленным как можно выше. Чем больше число итераций, тем безопаснее будет производный ключ, но тем больше времени займёт выполнение.

`salt` должен быть максимально уникальным. Рекомендуется использовать случайный salt длиной не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

=== "MJS"

    ```js
    const {
      pbkdf2Sync,
    } = await import('node:crypto');

    const key = pbkdf2Sync('secret', 'salt', 100000, 64, 'sha512');
    console.log(key.toString('hex'));  // '3745e48...08d59ae'
    ```

=== "CJS"

    ```js
    const {
      pbkdf2Sync,
    } = require('node:crypto');

    const key = pbkdf2Sync('secret', 'salt', 100000, 64, 'sha512');
    console.log(key.toString('hex'));  // '3745e48...08d59ae'
    ```

An array of supported digest functions can be retrieved using [`crypto.getHashes()`](#cryptogethashes).

### `crypto.privateDecrypt(privateKey, buffer)`

<!-- YAML
added: v0.11.14
changes:
  - version:
      - v21.6.2
      - v20.11.1
      - v18.19.1
    pr-url: https://github.com/nodejs-private/node-private/pull/515
    description: The `RSA_PKCS1_PADDING` padding was disabled unless the
                 OpenSSL build supports implicit rejection.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: Added string, ArrayBuffer, and CryptoKey as allowable key
                 types. The oaepLabel can be an ArrayBuffer. The buffer can
                 be a string or ArrayBuffer. All types that accept buffers
                 are limited to a maximum of 2 ** 31 - 1 bytes.
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29489
    description: The `oaepLabel` option was added.
  - version: v12.9.0
    pr-url: https://github.com/nodejs/node/pull/28335
    description: The `oaepHash` option was added.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: This function now supports key objects.
-->

Добавлено в: v0.11.14

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.6.2, v20.11.1, v18.19.1 | Заполнение `RSA_PKCS1_PADDING` было отключено, если сборка OpenSSL не поддерживает неявное отклонение. |
    | v15.0.0 | Добавлены строки, ArrayBuffer и CryptoKey в качестве допустимых типов ключей. oaepLabel может быть ArrayBuffer. Буфер может быть строкой или ArrayBuffer. Все типы, которые принимают буферы, ограничены максимум 2**31 — 1 байтами. |
    | v12.11.0 | Добавлена ​​опция oaepLabel. |
    | v12.9.0 | Добавлена ​​опция oaepHash. |
    | v11.6.0 | Эта функция теперь поддерживает ключевые объекты. |

<!--lint disable maximum-line-length remark-lint-->

-   `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    -   `oaepHash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хеш-функция, используемая для OAEP-паддинга и MGF1. **По умолчанию:** `'sha1'`
    -   `oaepLabel` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Метка, используемая для OAEP-паддинга. Если не указана, метка не используется.
    -   `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) Необязательное значение паддинга, определённое в `crypto.constants`. Может быть одним из следующих: `crypto.constants.RSA_NO_PADDING`, `crypto.constants.RSA_PKCS1_PADDING` или `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `Buffer` с расшифрованным содержимым.

<!--lint enable maximum-line-length remark-lint-->

Расшифровывает `buffer` с помощью `privateKey`. `buffer` должен быть предварительно зашифрован соответствующим открытым ключом, например с использованием [`crypto.publicEncrypt()`](#cryptopublicencryptkey-buffer).

Если `privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, можно передать свойство `padding`. В противном случае функция использует `RSA_PKCS1_OAEP_PADDING`.

Использование `crypto.constants.RSA_PKCS1_PADDING` в [`crypto.privateDecrypt()`](#cryptoprivatedecryptprivatekey-buffer) требует, чтобы OpenSSL поддерживал неявное отклонение (`rsa_pkcs1_implicit_rejection`). Если версия OpenSSL, используемая Node.js, не поддерживает эту возможность, попытка использовать `RSA_PKCS1_PADDING` завершится ошибкой.

### `crypto.privateEncrypt(privateKey, buffer)`

<!-- YAML
added: v1.1.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: Added string, ArrayBuffer, and CryptoKey as allowable key
                 types. The passphrase can be an ArrayBuffer. The buffer can
                 be a string or ArrayBuffer. All types that accept buffers
                 are limited to a maximum of 2 ** 31 - 1 bytes.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: This function now supports key objects.
-->

Добавлено в: v1.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Добавлены строки, ArrayBuffer и CryptoKey в качестве допустимых типов ключей. Парольной фразой может быть ArrayBuffer. Буфер может быть строкой или ArrayBuffer. Все типы, которые принимают буферы, ограничены максимум 2**31 — 1 байтами. |
    | v11.6.0 | Эта функция теперь поддерживает ключевые объекты. |

<!--lint disable maximum-line-length remark-lint-->

-   `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    -   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey) Закрытый ключ в PEM-кодировке.
    -   `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательная парольная фраза для закрытого ключа.
    -   `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) Необязательное значение паддинга, определённое в `crypto.constants`. Может быть одним из следующих: `crypto.constants.RSA_NO_PADDING` или `crypto.constants.RSA_PKCS1_PADDING`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, используемая, когда `buffer`, `key` или `passphrase` являются строками.
-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `Buffer` с зашифрованным содержимым.

<!--lint enable maximum-line-length remark-lint-->

Шифрует `buffer` с помощью `privateKey`. Возвращённые данные можно расшифровать соответствующим открытым ключом, например с использованием [`crypto.publicDecrypt()`](#cryptopublicdecryptkey-buffer).

Если `privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, можно передать свойство `padding`. В противном случае функция использует `RSA_PKCS1_PADDING`.

### `crypto.publicDecrypt(key, buffer)`

<!-- YAML
added: v1.1.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: Added string, ArrayBuffer, and CryptoKey as allowable key
                 types. The passphrase can be an ArrayBuffer. The buffer can
                 be a string or ArrayBuffer. All types that accept buffers
                 are limited to a maximum of 2 ** 31 - 1 bytes.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: This function now supports key objects.
-->

Добавлено в: v1.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Добавлены строки, ArrayBuffer и CryptoKey в качестве допустимых типов ключей. Парольной фразой может быть ArrayBuffer. Буфер может быть строкой или ArrayBuffer. Все типы, которые принимают буферы, ограничены максимум 2**31 — 1 байтами. |
    | v11.6.0 | Эта функция теперь поддерживает ключевые объекты. |

<!--lint disable maximum-line-length remark-lint-->

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    -   `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательная парольная фраза для закрытого ключа.
    -   `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) Необязательное значение паддинга, определённое в `crypto.constants`. Может быть одним из следующих: `crypto.constants.RSA_NO_PADDING` или `crypto.constants.RSA_PKCS1_PADDING`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, используемая, когда `buffer`, `key` или `passphrase` являются строками.
-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `Buffer` с расшифрованным содержимым.

<!--lint enable maximum-line-length remark-lint-->

Расшифровывает `buffer` с помощью `key`. `buffer` должен быть предварительно зашифрован соответствующим закрытым ключом, например с использованием [`crypto.privateEncrypt()`](#cryptoprivateencryptprivatekey-buffer).

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, можно передать свойство `padding`. В противном случае функция использует `RSA_PKCS1_PADDING`.

Поскольку открытые ключи RSA могут быть получены из закрытых, вместо открытого ключа можно передать закрытый.

### `crypto.publicEncrypt(key, buffer)`

<!-- YAML
added: v0.11.14
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: Added string, ArrayBuffer, and CryptoKey as allowable key
                 types. The oaepLabel and passphrase can be ArrayBuffers. The
                 buffer can be a string or ArrayBuffer. All types that accept
                 buffers are limited to a maximum of 2 ** 31 - 1 bytes.
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29489
    description: The `oaepLabel` option was added.
  - version: v12.9.0
    pr-url: https://github.com/nodejs/node/pull/28335
    description: The `oaepHash` option was added.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: This function now supports key objects.
-->

Добавлено в: v0.11.14

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Добавлены строки, ArrayBuffer и CryptoKey в качестве допустимых типов ключей. oaepLabel и парольная фраза могут быть ArrayBuffers. Буфер может быть строкой или ArrayBuffer. Все типы, которые принимают буферы, ограничены максимум 2**31 — 1 байтами. |
    | v12.11.0 | Добавлена ​​опция oaepLabel. |
    | v12.9.0 | Добавлена ​​опция oaepHash. |
    | v11.6.0 | Эта функция теперь поддерживает ключевые объекты. |

<!--lint disable maximum-line-length remark-lint-->

-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    -   `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey) Открытый или закрытый ключ в PEM-кодировке, [KeyObject](#class-keyobject) или [CryptoKey](webcrypto.md#class-cryptokey).
    -   `oaepHash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хеш-функция, используемая для OAEP-паддинга и MGF1. **По умолчанию:** `'sha1'`
    -   `oaepLabel` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Метка, используемая для OAEP-паддинга. Если не указана, метка не используется.
    -   `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательная парольная фраза для закрытого ключа.
    -   `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) Необязательное значение паддинга, определённое в `crypto.constants`. Может быть одним из следующих: `crypto.constants.RSA_NO_PADDING`, `crypto.constants.RSA_PKCS1_PADDING` или `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, используемая, когда `buffer`, `key`, `oaepLabel` или `passphrase` являются строками.
-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `Buffer` с зашифрованным содержимым.

<!--lint enable maximum-line-length remark-lint-->

Шифрует содержимое `buffer` с помощью `key` и возвращает новый [`Buffer`](buffer.md) с зашифрованным содержимым. Возвращённые данные можно расшифровать соответствующим закрытым ключом, например с использованием [`crypto.privateDecrypt()`](#cryptoprivatedecryptprivatekey-buffer).

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, можно передать свойство `padding`. В противном случае функция использует `RSA_PKCS1_OAEP_PADDING`.

Поскольку открытые ключи RSA могут быть получены из закрытых, вместо открытого ключа можно передать закрытый.

### `crypto.randomBytes(size[, callback])`

<!-- YAML
added: v0.5.8
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/16454
    description: Passing `null` as the `callback` argument now throws
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.5.8

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v9.0.0 | При передаче null в качестве аргумента обратного вызова теперь выдается ERR_INVALID_CALLBACK. |

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байтов для генерации. Значение `size` не должно быть больше `2**31 - 1`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `buf` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer), если функция `callback` не указана.

Генерирует криптографически стойкие псевдослучайные данные. Аргумент `size` — это число, указывающее количество байтов для генерации.

Если передана функция `callback`, байты генерируются асинхронно, а функция `callback` вызывается с двумя аргументами: `err` и `buf`. Если возникает ошибка, `err` будет объектом `Error`; в противном случае оно будет равно `null`. Аргумент `buf` — это [`Buffer`](buffer.md), содержащий сгенерированные байты.

=== "MJS"

    ```js
    // Asynchronous
    const {
      randomBytes,
    } = await import('node:crypto');

    randomBytes(256, (err, buf) => {
      if (err) throw err;
      console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    });
    ```

=== "CJS"

    ```js
    // Asynchronous
    const {
      randomBytes,
    } = require('node:crypto');

    randomBytes(256, (err, buf) => {
      if (err) throw err;
      console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);
    });
    ```

Если функция `callback` не передана, случайные байты генерируются синхронно и возвращаются как [`Buffer`](buffer.md). Если при генерации байтов возникает проблема, будет выброшена ошибка.

=== "MJS"

    ```js
    // Synchronous
    const {
      randomBytes,
    } = await import('node:crypto');

    const buf = randomBytes(256);
    console.log(
      `${buf.length} bytes of random data: ${buf.toString('hex')}`);
    ```

=== "CJS"

    ```js
    // Synchronous
    const {
      randomBytes,
    } = require('node:crypto');

    const buf = randomBytes(256);
    console.log(
      `${buf.length} bytes of random data: ${buf.toString('hex')}`);
    ```

Метод `crypto.randomBytes()` не завершится, пока не станет доступно достаточное количество энтропии. Обычно это не должно занимать больше нескольких миллисекунд. Единственный случай, когда генерация случайных байтов потенциально может блокироваться дольше, — сразу после загрузки, когда во всей системе ещё низкий уровень энтропии.

Этот API использует пул потоков libuv, что для некоторых приложений может иметь неожиданные и негативные последствия для производительности; подробности см. в документации по [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize).

Асинхронная версия `crypto.randomBytes()` выполняется в рамках одного запроса к пулу потоков. Чтобы минимизировать разброс длительности задач в пуле потоков, разбивайте большие запросы `randomBytes` на части, если выполняете их в рамках обработки клиентского запроса.

### `crypto.randomFill(buffer[, offset][, size], callback)`

<!-- YAML
added:
  - v7.10.0
  - v6.13.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15231
    description: The `buffer` argument may be any `TypedArray` or `DataView`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v9.0.0 | Аргументом `buffer` может быть любой `TypedArray` или `DataView`. |

-   `buffer` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Обязательный параметр. Размер переданного `buffer` не должен быть больше `2**31 - 1`.
-   `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.length - offset`. Значение `size` не должно быть больше `2**31 - 1`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `function(err, buf) {}`.

Эта функция похожа на [`crypto.randomBytes()`](#cryptorandombytessize-callback), но требует, чтобы первым аргументом был [`Buffer`](buffer.md), который будет заполнен. Также требуется передать callback.

Если функция `callback` не передана, будет выброшена ошибка.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const { randomFill } = await import('node:crypto');

    const buf = Buffer.alloc(10);
    randomFill(buf, (err, buf) => {
      if (err) throw err;
      console.log(buf.toString('hex'));
    });

    randomFill(buf, 5, (err, buf) => {
      if (err) throw err;
      console.log(buf.toString('hex'));
    });

    // The above is equivalent to the following:
    randomFill(buf, 5, 5, (err, buf) => {
      if (err) throw err;
      console.log(buf.toString('hex'));
    });
    ```

=== "CJS"

    ```js
    const { randomFill } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const buf = Buffer.alloc(10);
    randomFill(buf, (err, buf) => {
      if (err) throw err;
      console.log(buf.toString('hex'));
    });

    randomFill(buf, 5, (err, buf) => {
      if (err) throw err;
      console.log(buf.toString('hex'));
    });

    // The above is equivalent to the following:
    randomFill(buf, 5, 5, (err, buf) => {
      if (err) throw err;
      console.log(buf.toString('hex'));
    });
    ```

В качестве `buffer` можно передать любой экземпляр `ArrayBuffer`, `TypedArray` или `DataView`.

Хотя это включает экземпляры `Float32Array` и `Float64Array`, эту функцию не следует использовать для генерации случайных чисел с плавающей точкой. Результат может содержать `+Infinity`, `-Infinity` и `NaN`, и даже если массив содержит только конечные числа, они не будут получены из равномерного случайного распределения и не имеют осмысленных нижней и верхней границ.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const { randomFill } = await import('node:crypto');

    const a = new Uint32Array(10);
    randomFill(a, (err, buf) => {
      if (err) throw err;
      console.log(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
        .toString('hex'));
    });

    const b = new DataView(new ArrayBuffer(10));
    randomFill(b, (err, buf) => {
      if (err) throw err;
      console.log(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
        .toString('hex'));
    });

    const c = new ArrayBuffer(10);
    randomFill(c, (err, buf) => {
      if (err) throw err;
      console.log(Buffer.from(buf).toString('hex'));
    });
    ```

=== "CJS"

    ```js
    const { randomFill } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const a = new Uint32Array(10);
    randomFill(a, (err, buf) => {
      if (err) throw err;
      console.log(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
        .toString('hex'));
    });

    const b = new DataView(new ArrayBuffer(10));
    randomFill(b, (err, buf) => {
      if (err) throw err;
      console.log(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength)
        .toString('hex'));
    });

    const c = new ArrayBuffer(10);
    randomFill(c, (err, buf) => {
      if (err) throw err;
      console.log(Buffer.from(buf).toString('hex'));
    });
    ```

Этот API использует пул потоков libuv, что для некоторых приложений может иметь неожиданные и негативные последствия для производительности; подробности см. в документации по [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize).

Асинхронная версия `crypto.randomFill()` выполняется в рамках одного запроса к пулу потоков. Чтобы минимизировать разброс длительности задач в пуле потоков, разбивайте большие запросы `randomFill` на части, если выполняете их в рамках обработки клиентского запроса.

### `crypto.randomFillSync(buffer[, offset][, size])`

<!-- YAML
added:
  - v7.10.0
  - v6.13.0
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15231
    description: The `buffer` argument may be any `TypedArray` or `DataView`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v9.0.0 | Аргументом `buffer` может быть любой `TypedArray` или `DataView`. |

-   `buffer` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Обязательный параметр. Размер переданного `buffer` не должен быть больше `2**31 - 1`.
-   `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.length - offset`. Значение `size` не должно быть больше `2**31 - 1`.
-   Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Объект, переданный в аргументе `buffer`.

Синхронная версия [`crypto.randomFill()`](#cryptorandomfillbuffer-offset-size-callback).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const { randomFillSync } = await import('node:crypto');

    const buf = Buffer.alloc(10);
    console.log(randomFillSync(buf).toString('hex'));

    randomFillSync(buf, 5);
    console.log(buf.toString('hex'));

    // The above is equivalent to the following:
    randomFillSync(buf, 5, 5);
    console.log(buf.toString('hex'));
    ```

=== "CJS"

    ```js
    const { randomFillSync } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const buf = Buffer.alloc(10);
    console.log(randomFillSync(buf).toString('hex'));

    randomFillSync(buf, 5);
    console.log(buf.toString('hex'));

    // The above is equivalent to the following:
    randomFillSync(buf, 5, 5);
    console.log(buf.toString('hex'));
    ```

В качестве `buffer` можно передать любой экземпляр `ArrayBuffer`, `TypedArray` или `DataView`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const { randomFillSync } = await import('node:crypto');

    const a = new Uint32Array(10);
    console.log(Buffer.from(randomFillSync(a).buffer,
                            a.byteOffset, a.byteLength).toString('hex'));

    const b = new DataView(new ArrayBuffer(10));
    console.log(Buffer.from(randomFillSync(b).buffer,
                            b.byteOffset, b.byteLength).toString('hex'));

    const c = new ArrayBuffer(10);
    console.log(Buffer.from(randomFillSync(c)).toString('hex'));
    ```

=== "CJS"

    ```js
    const { randomFillSync } = require('node:crypto');
    const { Buffer } = require('node:buffer');

    const a = new Uint32Array(10);
    console.log(Buffer.from(randomFillSync(a).buffer,
                            a.byteOffset, a.byteLength).toString('hex'));

    const b = new DataView(new ArrayBuffer(10));
    console.log(Buffer.from(randomFillSync(b).buffer,
                            b.byteOffset, b.byteLength).toString('hex'));

    const c = new ArrayBuffer(10);
    console.log(Buffer.from(randomFillSync(c)).toString('hex'));
    ```

### `crypto.randomInt([min, ]max[, callback])`

<!-- YAML
added:
  - v14.10.0
  - v12.19.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `min` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Start of random range (inclusive). **По умолчанию:** `0`.
-   `max` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) End of random range (exclusive).
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `function(err, n) {}`.

Возвращает случайное целое число `n` такое, что `min <= n < max`. Эта реализация избегает [смещения по модулю](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias).

Диапазон (`max - min`) должен быть меньше 2<sup>48</sup>. Значения `min` и `max` должны быть [безопасными целыми числами](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger).

Если функция `callback` не передана, случайное целое число генерируется синхронно.

=== "MJS"

    ```js
    // Asynchronous
    const {
      randomInt,
    } = await import('node:crypto');

    randomInt(3, (err, n) => {
      if (err) throw err;
      console.log(`Random number chosen from (0, 1, 2): ${n}`);
    });
    ```

=== "CJS"

    ```js
    // Asynchronous
    const {
      randomInt,
    } = require('node:crypto');

    randomInt(3, (err, n) => {
      if (err) throw err;
      console.log(`Random number chosen from (0, 1, 2): ${n}`);
    });
    ```

---

=== "MJS"

    ```js
    // Synchronous
    const {
      randomInt,
    } = await import('node:crypto');

    const n = randomInt(3);
    console.log(`Random number chosen from (0, 1, 2): ${n}`);
    ```

=== "CJS"

    ```js
    // Synchronous
    const {
      randomInt,
    } = require('node:crypto');

    const n = randomInt(3);
    console.log(`Random number chosen from (0, 1, 2): ${n}`);
    ```

---

=== "MJS"

    ```js
    // With `min` argument
    const {
      randomInt,
    } = await import('node:crypto');

    const n = randomInt(1, 7);
    console.log(`The dice rolled: ${n}`);
    ```

=== "CJS"

    ```js
    // With `min` argument
    const {
      randomInt,
    } = require('node:crypto');

    const n = randomInt(1, 7);
    console.log(`The dice rolled: ${n}`);
    ```

### `crypto.randomUUID([options])`

<!-- YAML
added:
  - v15.6.0
  - v14.17.0
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `disableEntropyCache` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) По умолчанию Node.js для повышения производительности генерирует и кэширует достаточно случайных данных, чтобы создать до 128 случайных UUID. Чтобы сгенерировать UUID без использования кэша, установите `disableEntropyCache` в `true`. **По умолчанию:** `false`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует случайный UUID версии 4 по [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.txt). UUID генерируется с использованием криптографического псевдослучайного генератора чисел.

### `crypto.randomUUIDv7([options])`

<!-- YAML
added: REPLACEME
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `disableEntropyCache` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) По умолчанию Node.js для повышения производительности генерирует и кэширует достаточно случайных данных, чтобы создать до 128 случайных UUID. Чтобы сгенерировать UUID без использования кэша, установите `disableEntropyCache` в `true`. **По умолчанию:** `false`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует случайный UUID версии 7 по [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.txt). UUID содержит Unix-временную метку с точностью до миллисекунд в старших 48 битах, после которой идут криптографически стойкие случайные биты для остальных полей, что делает его подходящим для использования в качестве ключа базы данных с сортировкой по времени. Встроенная временная метка опирается на немонотонные часы и не гарантированно строго возрастает.

### `crypto.scrypt(password, salt, keylen[, options], callback)`

<!-- YAML
added: v10.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The password and salt arguments can also be ArrayBuffer
                 instances.
  - version:
     - v12.8.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/28799
    description: The `maxmem` value can now be any safe integer.
  - version: v10.9.0
    pr-url: https://github.com/nodejs/node/pull/21525
    description: The `cost`, `blockSize` and `parallelization` option names
                 have been added.
-->

Добавлено в: v10.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v15.0.0 | Аргументы пароля и соли также могут быть экземплярами ArrayBuffer. |
    | v12.8.0, v10.17.0 | Значение `maxmem` теперь может быть любым безопасным целым числом. |
    | v10.9.0 | Были добавлены имена опций Cost, BlockSize и Parallelization. |

-   `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cost` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр вычислительной стоимости по CPU/памяти. Должен быть степенью двойки больше единицы. **По умолчанию:** `16384`.
    -   `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр размера блока. **По умолчанию:** `8`.
    -   `parallelization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр параллелизма. **По умолчанию:** `1`.
    -   `N` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `cost`. Можно указать только один из двух.
    -   `r` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `blockSize`. Можно указать только один из двух.
    -   `p` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `parallelization`. Можно указать только один из двух.
    -   `maxmem` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Верхняя граница памяти. Ошибка возникает, когда (приблизительно) `128 * N * r > maxmem`. **По умолчанию:** `32 * 1024 * 1024`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `derivedKey` [`<Buffer>`](buffer.md#buffer)

Предоставляет асинхронную реализацию [scrypt](https://en.wikipedia.org/wiki/Scrypt). Scrypt - это функция выведения ключа на основе пароля, специально сделанная вычислительно и по памяти дорогой, чтобы атаки перебором были неэффективны.

`salt` должен быть максимально уникальным. Рекомендуется использовать случайный salt длиной не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. При ошибке выведения ключа `err` содержит объект исключения, иначе `err` равен `null`. Аргумент `derivedKey` передаётся в callback как [`Buffer`](buffer.md).

Исключение выбрасывается, если какие-либо входные аргументы имеют недопустимые значения или типы.

=== "MJS"

    ```js
    const {
      scrypt,
    } = await import('node:crypto');

    // Using the factory defaults.
    scrypt('password', 'salt', 64, (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
    });
    // Using a custom N parameter. Must be a power of two.
    scrypt('password', 'salt', 64, { N: 1024 }, (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // '3745e48...aa39b34'
    });
    ```

=== "CJS"

    ```js
    const {
      scrypt,
    } = require('node:crypto');

    // Using the factory defaults.
    scrypt('password', 'salt', 64, (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // '3745e48...08d59ae'
    });
    // Using a custom N parameter. Must be a power of two.
    scrypt('password', 'salt', 64, { N: 1024 }, (err, derivedKey) => {
      if (err) throw err;
      console.log(derivedKey.toString('hex'));  // '3745e48...aa39b34'
    });
    ```

### `crypto.scryptSync(password, salt, keylen[, options])`

<!-- YAML
added: v10.5.0
changes:
  - version:
     - v12.8.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/28799
    description: The `maxmem` value can now be any safe integer.
  - version: v10.9.0
    pr-url: https://github.com/nodejs/node/pull/21525
    description: The `cost`, `blockSize` and `parallelization` option names
                 have been added.
-->

Добавлено в: v10.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v12.8.0, v10.17.0 | Значение `maxmem` теперь может быть любым безопасным целым числом. |
    | v10.9.0 | Были добавлены имена опций Cost, BlockSize и Parallelization. |

-   `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cost` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр вычислительной стоимости по CPU/памяти. Должен быть степенью двойки больше единицы. **По умолчанию:** `16384`.
    -   `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр размера блока. **По умолчанию:** `8`.
    -   `parallelization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр параллелизма. **По умолчанию:** `1`.
    -   `N` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `cost`. Можно указать только один из двух.
    -   `r` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `blockSize`. Можно указать только один из двух.
    -   `p` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `parallelization`. Можно указать только один из двух.
    -   `maxmem` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Верхняя граница памяти. Ошибка возникает, когда (приблизительно) `128 * N * r > maxmem`. **По умолчанию:** `32 * 1024 * 1024`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer)

Предоставляет синхронную реализацию [scrypt](https://en.wikipedia.org/wiki/Scrypt). Scrypt - это функция выведения ключа на основе пароля, специально сделанная вычислительно и по памяти дорогой, чтобы атаки перебором были неэффективны.

`salt` должен быть максимально уникальным. Рекомендуется использовать случайный salt длиной не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt` учитывайте [оговорки по использованию строк как входных данных криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Если при выведении ключа возникает ошибка, выбрасывается исключение; в противном случае производный ключ возвращается как [`Buffer`](buffer.md).

Исключение выбрасывается, если какие-либо входные аргументы имеют недопустимые значения или типы.

=== "MJS"

    ```js
    const {
      scryptSync,
    } = await import('node:crypto');
    // Using the factory defaults.

    const key1 = scryptSync('password', 'salt', 64);
    console.log(key1.toString('hex'));  // '3745e48...08d59ae'
    // Using a custom N parameter. Must be a power of two.
    const key2 = scryptSync('password', 'salt', 64, { N: 1024 });
    console.log(key2.toString('hex'));  // '3745e48...aa39b34'
    ```

=== "CJS"

    ```js
    const {
      scryptSync,
    } = require('node:crypto');
    // Using the factory defaults.

    const key1 = scryptSync('password', 'salt', 64);
    console.log(key1.toString('hex'));  // '3745e48...08d59ae'
    // Using a custom N parameter. Must be a power of two.
    const key2 = scryptSync('password', 'salt', 64, { N: 1024 });
    console.log(key2.toString('hex'));  // '3745e48...aa39b34'
    ```

### `crypto.secureHeapUsed()`

<!-- YAML
added: v15.6.0
-->

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `total` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий размер выделенной защищённой кучи, заданный флагом командной строки `--secure-heap=n`.
    -   `min` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальный размер выделения из защищённой кучи, заданный флагом командной строки `--secure-heap-min`.
    -   `used` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество байтов, в данный момент выделенных из защищённой кучи.
    -   `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Вычисленное отношение `used` к общему количеству выделенных байтов `total`.

### `crypto.setEngine(engine[, flags])`

<!-- YAML
added: v0.11.11
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53329
    description: Custom engine support in OpenSSL 3 is deprecated.
-->

Добавлено в: v0.11.11

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | Поддержка специального механизма в OpenSSL 3 устарела. |

-   `engine` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `flags` [`<crypto.constants>`](crypto.md#cryptoconstants) **По умолчанию:** `crypto.constants.ENGINE_METHOD_ALL`

Загружает и устанавливает `engine` для некоторых или всех функций OpenSSL (выбираются флагами). Поддержка пользовательских engine в OpenSSL объявлена устаревшей, начиная с OpenSSL 3.

`engine` может быть либо идентификатором, либо путём к разделяемой библиотеке engine.

Необязательный аргумент `flags` по умолчанию использует `ENGINE_METHOD_ALL`. `flags` — это битовое поле, принимающее один из следующих флагов (определённых в `crypto.constants`) или их комбинацию:

-   `crypto.constants.ENGINE_METHOD_RSA`
-   `crypto.constants.ENGINE_METHOD_DSA`
-   `crypto.constants.ENGINE_METHOD_DH`
-   `crypto.constants.ENGINE_METHOD_RAND`
-   `crypto.constants.ENGINE_METHOD_EC`
-   `crypto.constants.ENGINE_METHOD_CIPHERS`
-   `crypto.constants.ENGINE_METHOD_DIGESTS`
-   `crypto.constants.ENGINE_METHOD_PKEY_METHS`
-   `crypto.constants.ENGINE_METHOD_PKEY_ASN1_METHS`
-   `crypto.constants.ENGINE_METHOD_ALL`
-   `crypto.constants.ENGINE_METHOD_NONE`

### `crypto.setFips(bool)`

<!-- YAML
added: v10.0.0
-->

-   `bool` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, чтобы включить режим FIPS.

Включает FIPS-совместимый криптографический провайдер в сборке Node.js с поддержкой FIPS. Выбрасывает ошибку, если режим FIPS недоступен.

### `crypto.sign(algorithm, data, key[, callback])`

<!-- YAML
added: v12.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62474
    description: Add support for Ed25519 context parameter.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59570
    description: Add support for ML-DSA, Ed448, and SLH-DSA context parameter.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59537
    description: Add support for SLH-DSA signing.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA signing.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37500
    description: Optional callback argument added.
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/29292
    description: This function now supports IEEE-P1363 DSA and ECDSA signatures.
-->

Добавлено в: v12.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавить поддержку параметра контекста Ed25519. |
    | v24.8.0 | Добавьте поддержку параметров контекста ML-DSA, Ed448 и SLH-DSA. |
    | v24.8.0 | Добавьте поддержку подписи SLH-DSA. |
    | v24.6.0 | Добавьте поддержку подписи ML-DSA. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v15.12.0 | Добавлен необязательный аргумент обратного вызова. |
    | v13.2.0, v12.16.0 | Эта функция теперь поддерживает подписи IEEE-P1363 DSA и ECDSA. |

<!--lint disable maximum-line-length remark-lint-->

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined
-   `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `signature` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer), если функция `callback` не передана.

<!--lint enable maximum-line-length remark-lint-->

Вычисляет и возвращает подпись для `data`, используя указанный закрытый ключ и алгоритм. Если `algorithm` равен `null` или `undefined`, то алгоритм зависит от типа ключа.

Для Ed25519, Ed448 и ML-DSA параметр `algorithm` должен быть `null` или `undefined`.

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, можно передать следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр задаёт формат создаваемой подписи. Возможны следующие значения:
    -   `'der'` (по умолчанию): ASN.1-структура подписи `(r, s)` в кодировке DER.
    -   `'ieee-p1363'`: формат подписи `r || s`, предложенный в IEEE-P1363.
-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение padding для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (default)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая применяется для подписи сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли при использовании `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли равной размеру дайджеста, а `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) - максимально допустимому значению.
-   `context` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Для Ed25519[^openssl32] (с использованием Ed25519ctx из [RFC 8032](https://www.rfc-editor.org/rfc/rfc8032.txt)), Ed448, ML-DSA и SLH-DSA этот параметр задаёт необязательный контекст, позволяющий различать подписи, созданные для разных целей одним и тем же ключом.

Если указана функция `callback`, эта функция использует пул потоков libuv.

### `crypto.subtle`

<!-- YAML
added: v17.4.0
-->

-   Тип: [`<SubtleCrypto>`](webcrypto.md)

Удобный псевдоним для [`crypto.webcrypto.subtle`](webcrypto.md#class-subtlecrypto).

### `crypto.timingSafeEqual(a, b)`

<!-- YAML
added: v6.6.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The a and b arguments can also be ArrayBuffer.
-->

Добавлено в: v6.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Аргументы a и b также могут быть ArrayBuffer. |

-   `a` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `b` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Эта функция сравнивает базовые байты, представляющие указанные экземпляры `ArrayBuffer`, `TypedArray` или `DataView`, используя алгоритм с постоянным временем выполнения.

Эта функция не раскрывает временную информацию, которая позволила бы злоумышленнику угадать одно из значений. Она подходит для сравнения HMAC-дайджестов или секретных значений, таких как cookie аутентификации или [capability URL](https://www.w3.org/TR/capability-urls/).

`a` и `b` должны оба быть `Buffer`, `TypedArray` или `DataView`, и их длина в байтах должна совпадать. Если длины в байтах различаются, выбрасывается ошибка.

Если хотя бы один из `a` и `b` является `TypedArray`, в котором на элемент приходится более одного байта, например `Uint16Array`, результат будет вычислен с использованием порядка байтов платформы.

Когда оба входных значения являются `Float32Array` или `Float64Array`, эта функция может вернуть неожиданный результат из-за кодировки чисел с плавающей точкой IEEE 754. В частности, ни `x === y`, ни `Object.is(x, y)` не означают, что байтовые представления двух чисел с плавающей точкой `x` и `y` совпадают.

Использование `crypto.timingSafeEqual` не гарантирует, что _окружающий_ код безопасен с точки зрения времени выполнения. Следует убедиться, что окружающий код не вносит уязвимостей, связанных с побочными временными эффектами.

### `crypto.verify(algorithm, data, key, signature[, callback])`

<!-- YAML
added: v12.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62474
    description: Add support for Ed25519 context parameter.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59570
    description: Add support for ML-DSA, Ed448, and SLH-DSA context parameter.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59537
    description: Add support for SLH-DSA signature verification.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA signature verification.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37500
    description: Optional callback argument added.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The data, key, and signature arguments can also be ArrayBuffer.
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/29292
    description: This function now supports IEEE-P1363 DSA and ECDSA signatures.
-->

Добавлено в: v12.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавить поддержку параметра контекста Ed25519. |
    | v24.8.0 | Добавьте поддержку параметров контекста ML-DSA, Ed448 и SLH-DSA. |
    | v24.8.0 | Добавьте поддержку проверки подписи SLH-DSA. |
    | v24.6.0 | Добавьте поддержку проверки подписи ML-DSA. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v15.12.0 | Добавлен необязательный аргумент обратного вызова. |
    | v15.0.0 | Аргументы данных, ключа и подписи также могут быть ArrayBuffer. |
    | v13.2.0, v12.16.0 | Эта функция теперь поддерживает подписи IEEE-P1363 DSA и ECDSA. |

<!--lint disable maximum-line-length remark-lint-->

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined
-   `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
-   `signature` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `result` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` или `false` в зависимости от корректности подписи для данных и открытого ключа, если функция `callback` не передана.

<!--lint enable maximum-line-length remark-lint-->

Проверяет заданную подпись для `data`, используя указанные ключ и алгоритм. Если `algorithm` равен `null` или `undefined`, то алгоритм зависит от типа ключа.

Для Ed25519, Ed448 и ML-DSA параметр `algorithm` должен быть `null` или `undefined`.

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведёт себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, можно передать следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр задаёт формат подписи. Возможны следующие значения:
    -   `'der'` (по умолчанию): ASN.1-структура подписи `(r, s)` в кодировке DER.
    -   `'ieee-p1363'`: формат подписи `r || s`, предложенный в IEEE-P1363.
-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение padding для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (по умолчанию)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая применяется для подписи сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли при использовании `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли равной размеру дайджеста, а `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) — максимально допустимому значению.
-   `context` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Для Ed25519[^openssl32] (с использованием Ed25519ctx из [RFC 8032](https://www.rfc-editor.org/rfc/rfc8032.txt)), Ed448, ML-DSA и SLH-DSA этот параметр задаёт необязательный контекст, позволяющий различать подписи, созданные для разных целей одним и тем же ключом.

Аргумент `signature` — это ранее вычисленная подпись для `data`.

Поскольку открытые ключи могут быть получены из закрытых, в качестве `key` можно передать как закрытый, так и открытый ключ.

Если передана функция `callback`, эта функция использует пул потоков libuv.

### `crypto.webcrypto`

<!-- YAML
added: v15.0.0
-->

Тип: [`<Crypto>`](crypto.md) Реализация стандарта Web Crypto API.

Подробнее см. в [документации Web Crypto API](webcrypto.md).

## Примечания

### Использование строк в качестве входных данных для криптографических API {#using-strings-as-inputs-to-cryptographic-apis}

По историческим причинам многие криптографические API, предоставляемые Node.js, принимают строки в качестве входных данных, хотя лежащий в их основе криптографический алгоритм работает с последовательностями байтов. Это относится к открытому тексту, шифротексту, симметричным ключам, векторам инициализации, парольным фразам, солям, тегам аутентификации и дополнительным аутентифицированным данным.

При передаче строк в криптографические API следует учитывать следующие факторы.

-   Не все последовательности байтов являются допустимыми строками UTF-8. Поэтому, когда последовательность байтов длиной `n` получается из строки, её энтропия обычно ниже, чем энтропия случайной или псевдослучайной последовательности байтов длиной `n`. Например, ни одна строка UTF-8 не даст последовательность байтов `c0 af`. Секретные ключи почти всегда должны быть случайными или псевдослучайными последовательностями байтов.
-   Аналогично, при преобразовании случайных или псевдослучайных последовательностей байтов в строки UTF-8 подпоследовательности, которые не представляют допустимые кодовые точки, могут быть заменены символом замены Unicode (`U+FFFD`). Поэтому байтовое представление результирующей строки Unicode может не совпадать с последовательностью байтов, из которой эта строка была создана.

    ```js
    const original = [0xc0, 0xaf];
    const bytesAsString = Buffer.from(original).toString(
        'utf8'
    );
    const stringAsBytes = Buffer.from(
        bytesAsString,
        'utf8'
    );
    console.log(stringAsBytes);
    // Prints '<Buffer ef bf bd ef bf bd>'.
    ```

    Выходные данные шифров, хеш-функций, алгоритмов подписи и функций выведения ключей представляют собой псевдослучайные последовательности байтов и не должны использоваться как строки Unicode.

-   Когда строки получены из пользовательского ввода, некоторые символы Unicode могут быть представлены несколькими эквивалентными способами, которые приводят к разным последовательностям байтов. Например, при передаче пользовательской парольной фразы в функцию выведения ключа, такую как PBKDF2 или scrypt, результат зависит от того, используются ли в строке составные или разложенные символы. Node.js не нормализует представления символов. Разработчикам стоит рассмотреть использование [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) для пользовательского ввода перед передачей его в криптографические API.

### Устаревший API потоков (до Node.js 0.10)

Модуль Crypto был добавлен в Node.js до появления концепции унифицированного API потоков и до появления объектов [`Buffer`](buffer.md) для работы с двоичными данными. Поэтому многие классы `crypto` имеют методы, которые обычно не встречаются у других классов Node.js, реализующих API [streams](stream.md) (например, `update()`, `final()` или `digest()`). Кроме того, многие методы по умолчанию принимали и возвращали строки в кодировке `'latin1'`, а не `Buffer`. Это поведение было изменено в Node.js 0.9.3: по умолчанию стали использоваться объекты [`Buffer`](buffer.md).

### Поддержка слабых или скомпрометированных алгоритмов {#support-for-weak-or-compromised-algorithms}

Модуль `node:crypto` по-прежнему поддерживает некоторые алгоритмы, которые уже скомпрометированы и не рекомендуются к использованию. API также позволяет использовать шифры и хеши с небольшим размером ключа, которые слишком слабы для безопасного применения.

Пользователи должны полностью брать на себя ответственность за выбор криптографического алгоритма и размера ключа в соответствии со своими требованиями к безопасности.

Согласно рекомендациям [NIST SP 800-131A](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-131Ar2.pdf):

-   MD5 и SHA-1 больше не считаются приемлемыми там, где требуется устойчивость к коллизиям, например для цифровых подписей.
-   Рекомендуется, чтобы ключи, используемые с алгоритмами RSA, DSA и DH, имели длину не менее 2048 бит, а ключи кривых для ECDSA и ECDH - не менее 224 бит, чтобы их можно было безопасно использовать в течение нескольких лет.
-   Группы DH `modp1`, `modp2` и `modp5` имеют размер ключа менее 2048 бит и не рекомендуются.

Другие рекомендации и подробности см. в этом справочном документе.

Некоторые алгоритмы с известными слабостями и малой практической значимостью доступны только через [legacy provider](cli.md#--openssl-legacy-provider), который по умолчанию не включён.

### Режим CCM {#ccm-mode}

CCM - один из поддерживаемых [алгоритмов AEAD](https://en.wikipedia.org/wiki/Authenticated_encryption). Приложения, использующие этот режим, должны соблюдать определённые ограничения при работе с API шифрования:

-   Длина тега аутентификации должна быть указана при создании шифра через параметр `authTagLength` и должна составлять 4, 6, 8, 10, 12, 14 или 16 байт.
-   Длина вектора инициализации (nonce) `N` должна быть от 7 до 13 байт (`7 ≤ N ≤ 13`).
-   Длина открытого текста ограничена `2 ** (8 * (15 - N))` байтами.
-   При расшифровке тег аутентификации должен быть установлен через `setAuthTag()` до вызова `update()`. В противном случае расшифровка завершится неудачей, а `final()` выбросит ошибку в соответствии с разделом 2.6 [RFC 3610](https://www.rfc-editor.org/rfc/rfc3610.txt).
-   Использование потоковых методов, таких как `write(data)`, `end(data)` или `pipe()`, в режиме CCM может завершиться неудачей, так как CCM не умеет обрабатывать более одного фрагмента данных на экземпляр.
-   При передаче дополнительных аутентифицированных данных (AAD) длина фактического сообщения в байтах должна быть передана в `setAAD()` через параметр `plaintextLength`. Многие криптографические библиотеки включают тег аутентификации в шифротекст, а значит создают шифротексты длиной `plaintextLength + authTagLength`. Node.js не включает тег аутентификации, поэтому длина шифротекста всегда равна `plaintextLength`. Если AAD не используется, это не требуется.
-   Поскольку CCM обрабатывает всё сообщение целиком, `update()` должен вызываться ровно один раз.
-   Хотя вызова `update()` достаточно для шифрования или расшифровки сообщения, приложения _обязаны_ вызвать `final()`, чтобы вычислить или проверить тег аутентификации.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    const {
      createCipheriv,
      createDecipheriv,
      randomBytes,
    } = await import('node:crypto');

    const key = 'keykeykeykeykeykeykeykey';
    const nonce = randomBytes(12);

    const aad = Buffer.from('0123456789', 'hex');

    const cipher = createCipheriv('aes-192-ccm', key, nonce, {
      authTagLength: 16,
    });
    const plaintext = 'Hello world';
    cipher.setAAD(aad, {
      plaintextLength: Buffer.byteLength(plaintext),
    });
    const ciphertext = cipher.update(plaintext, 'utf8');
    cipher.final();
    const tag = cipher.getAuthTag();

    // Now transmit { ciphertext, nonce, tag }.

    const decipher = createDecipheriv('aes-192-ccm', key, nonce, {
      authTagLength: 16,
    });
    decipher.setAuthTag(tag);
    decipher.setAAD(aad, {
      plaintextLength: ciphertext.length,
    });
    const receivedPlaintext = decipher.update(ciphertext, null, 'utf8');

    try {
      decipher.final();
    } catch (err) {
      throw new Error('Authentication failed!', { cause: err });
    }

    console.log(receivedPlaintext);
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');
    const {
      createCipheriv,
      createDecipheriv,
      randomBytes,
    } = require('node:crypto');

    const key = 'keykeykeykeykeykeykeykey';
    const nonce = randomBytes(12);

    const aad = Buffer.from('0123456789', 'hex');

    const cipher = createCipheriv('aes-192-ccm', key, nonce, {
      authTagLength: 16,
    });
    const plaintext = 'Hello world';
    cipher.setAAD(aad, {
      plaintextLength: Buffer.byteLength(plaintext),
    });
    const ciphertext = cipher.update(plaintext, 'utf8');
    cipher.final();
    const tag = cipher.getAuthTag();

    // Now transmit { ciphertext, nonce, tag }.

    const decipher = createDecipheriv('aes-192-ccm', key, nonce, {
      authTagLength: 16,
    });
    decipher.setAuthTag(tag);
    decipher.setAAD(aad, {
      plaintextLength: ciphertext.length,
    });
    const receivedPlaintext = decipher.update(ciphertext, null, 'utf8');

    try {
      decipher.final();
    } catch (err) {
      throw new Error('Authentication failed!', { cause: err });
    }

    console.log(receivedPlaintext);
    ```

### Режим FIPS

При использовании OpenSSL 3 Node.js поддерживает FIPS 140-2 при работе с подходящим провайдером OpenSSL 3, например [FIPS provider из OpenSSL 3](https://www.openssl.org/docs/man3.0/man7/crypto.html#FIPS-provider), который можно установить, следуя инструкциям в [FIPS README OpenSSL](https://github.com/openssl/openssl/blob/openssl-3.0/README-FIPS.md).

Для поддержки FIPS в Node.js вам понадобятся:

-   Корректно установленный FIPS provider для OpenSSL 3.
-   [Файл конфигурации модуля FIPS](https://www.openssl.org/docs/man3.0/man5/fips_config.html) для OpenSSL 3.
-   Файл конфигурации OpenSSL 3, который ссылается на файл конфигурации модуля FIPS.

Node.js нужно настроить с помощью файла конфигурации OpenSSL, указывающего на FIPS provider. Пример такого файла:

```text
nodejs_conf = nodejs_init

.include /<absolute path>/fipsmodule.cnf

[nodejs_init]
providers = provider_sect

[provider_sect]
default = default_sect
# The fips section name should match the section name inside the
# included fipsmodule.cnf.
fips = fips_sect

[default_sect]
activate = 1
```

где `fipsmodule.cnf` - файл конфигурации модуля FIPS, созданный на этапе установки FIPS provider:

```bash
openssl fipsinstall
```

Установите переменную окружения `OPENSSL_CONF`, чтобы она указывала на ваш файл конфигурации, а `OPENSSL_MODULES` - на расположение динамической библиотеки FIPS provider. Например:

```bash
export OPENSSL_CONF=/<path to configuration file>/nodejs.cnf
export OPENSSL_MODULES=/<path to openssl lib>/ossl-modules
```

После этого режим FIPS можно включить в Node.js одним из следующих способов:

-   Запустить Node.js с флагами командной строки `--enable-fips` или `--force-fips`.
-   Программно вызвать `crypto.setFips(true)`.

При желании режим FIPS можно включить в Node.js и через файл конфигурации OpenSSL. Например:

```text
nodejs_conf = nodejs_init

.include /<absolute path>/fipsmodule.cnf

[nodejs_init]
providers = provider_sect
alg_section = algorithm_sect

[provider_sect]
default = default_sect
# The fips section name should match the section name inside the
# included fipsmodule.cnf.
fips = fips_sect

[default_sect]
activate = 1

[algorithm_sect]
default_properties = fips=yes
```

## Константы crypto {#crypto-constants}

Следующие константы, экспортируемые через `crypto.constants`, применяются в различных сценариях использования модулей `node:crypto`, `node:tls` и `node:https` и в целом относятся к OpenSSL.

### Параметры OpenSSL

Подробности см. в [списке флагов SSL OP](https://wiki.openssl.org/index.php/List_of_SSL_OP_Flags#Table_of_Options).

| Константа | Описание |
| --- | --- |
| `SSL_OP_ALL` | Применяет несколько обходных решений для известных ошибок внутри OpenSSL. Подробности см. в [документации OpenSSL](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html). |
| `SSL_OP_ALLOW_NO_DHE_KEX` | Указывает OpenSSL разрешить режим обмена ключами для TLS v1.3, не основанный на [EC]DHE. |
| `SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION` | Разрешает устаревшее небезопасное повторное согласование между OpenSSL и некорректно обновлёнными клиентами или серверами. См. [документацию OpenSSL](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html). |
| `SSL_OP_CIPHER_SERVER_PREFERENCE` | Пытается использовать предпочтения сервера вместо предпочтений клиента при выборе шифра. Поведение зависит от версии протокола. См. [документацию OpenSSL](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html). |
| `SSL_OP_CISCO_ANYCONNECT` | Указывает OpenSSL использовать идентификатор версии Cisco для `DTLS_BAD_VER`. |
| `SSL_OP_COOKIE_EXCHANGE` | Указывает OpenSSL включить обмен cookie. |
| `SSL_OP_CRYPTOPRO_TLSEXT_BUG` | Указывает OpenSSL добавлять расширение `server-hello` из ранней версии черновика cryptopro. |
| `SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS` | Указывает OpenSSL отключить защитный механизм от уязвимости SSL 3.0/TLS 1.0, добавленный в OpenSSL 0.9.6d. |
| `SSL_OP_LEGACY_SERVER_CONNECT` | Разрешает начальное соединение с серверами, которые не поддерживают RI. |
| `SSL_OP_NO_COMPRESSION` | Указывает OpenSSL отключить поддержку сжатия SSL/TLS. |
| `SSL_OP_NO_ENCRYPT_THEN_MAC` | Указывает OpenSSL отключить режим encrypt-then-MAC. |
| `SSL_OP_NO_QUERY_MTU` |  |
| `SSL_OP_NO_RENEGOTIATION` | Указывает OpenSSL отключить повторное согласование. |
| `SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION` | Указывает OpenSSL всегда начинать новую сессию при повторном согласовании. |
| `SSL_OP_NO_SSLv2` | Указывает OpenSSL отключить SSL v2. |
| `SSL_OP_NO_SSLv3` | Указывает OpenSSL отключить SSL v3. |
| `SSL_OP_NO_TICKET` | Указывает OpenSSL отключить использование тикетов RFC4507bis. |
| `SSL_OP_NO_TLSv1` | Указывает OpenSSL отключить TLS v1. |
| `SSL_OP_NO_TLSv1_1` | Указывает OpenSSL отключить TLS v1.1. |
| `SSL_OP_NO_TLSv1_2` | Указывает OpenSSL отключить TLS v1.2. |
| `SSL_OP_NO_TLSv1_3` | Указывает OpenSSL отключить TLS v1.3. |
| `SSL_OP_PRIORITIZE_CHACHA` | Указывает серверу OpenSSL отдавать приоритет ChaCha20-Poly1305, если клиент делает то же самое. Этот параметр не действует, если не включён `SSL_OP_CIPHER_SERVER_PREFERENCE`. |
| `SSL_OP_TLS_ROLLBACK_BUG` | Указывает OpenSSL отключить обнаружение атаки с откатом версии протокола. |

### Константы движка OpenSSL

| Константа | Описание |
| --- | --- |
| `ENGINE_METHOD_RSA` | Ограничивает использование движка только RSA. |
| `ENGINE_METHOD_DSA` | Ограничивает использование движка только DSA. |
| `ENGINE_METHOD_DH` | Ограничивает использование движка только DH. |
| `ENGINE_METHOD_RAND` | Ограничивает использование движка только RAND. |
| `ENGINE_METHOD_EC` | Ограничивает использование движка только EC. |
| `ENGINE_METHOD_CIPHERS` | Ограничивает использование движка только CIPHERS. |
| `ENGINE_METHOD_DIGESTS` | Ограничивает использование движка только DIGESTS. |
| `ENGINE_METHOD_PKEY_METHS` | Ограничивает использование движка только PKEY_METHS. |
| `ENGINE_METHOD_PKEY_ASN1_METHS` | Ограничивает использование движка только PKEY_ASN1_METHS. |
| `ENGINE_METHOD_ALL` |  |
| `ENGINE_METHOD_NONE` |  |

### Прочие константы OpenSSL

| Константа | Описание |
| --- | --- |
| `DH_CHECK_P_NOT_SAFE_PRIME` |  |
| `DH_CHECK_P_NOT_PRIME` |  |
| `DH_UNABLE_TO_CHECK_GENERATOR` |  |
| `DH_NOT_SUITABLE_GENERATOR` |  |
| `RSA_PKCS1_PADDING` |  |
| `RSA_SSLV23_PADDING` |  |
| `RSA_NO_PADDING` |  |
| `RSA_PKCS1_OAEP_PADDING` |  |
| `RSA_X931_PADDING` |  |
| `RSA_PKCS1_PSS_PADDING` |  |
| `RSA_PSS_SALTLEN_DIGEST` | Устанавливает длину соли для `RSA_PKCS1_PSS_PADDING` равной размеру дайджеста при подписи или проверке. |
| `RSA_PSS_SALTLEN_MAX_SIGN` | Устанавливает длину соли для `RSA_PKCS1_PSS_PADDING` в максимально допустимое значение при подписании данных. |
| `RSA_PSS_SALTLEN_AUTO` | Приводит к тому, что длина соли для `RSA_PKCS1_PSS_PADDING` определяется автоматически при проверке подписи. |
| `POINT_CONVERSION_COMPRESSED` |  |
| `POINT_CONVERSION_UNCOMPRESSED` |  |
| `POINT_CONVERSION_HYBRID` |  |

### Константы crypto в Node.js

| Константа | Описание |
| --- | --- |
| `defaultCoreCipherList` | Определяет встроенный список шифров по умолчанию, используемый Node.js. |
| `defaultCipherList` | Определяет активный список шифров по умолчанию, используемый текущим процессом Node.js. |

[^openssl30]: Требуется OpenSSL >= 3.0
[^openssl32]: Требуется OpenSSL >= 3.2
[^openssl35]: Требуется OpenSSL >= 3.5
