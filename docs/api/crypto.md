---
title: Криптография
description: Модуль node:crypto — хэши, HMAC, шифрование, подпись и проверка на базе OpenSSL
---

# Криптография

<!--introduced_in=v0.3.6-->

> Стабильность: 2 — Стабильная

<!-- source_link=lib/crypto.js -->

Модуль `node:crypto` предоставляет криптографические возможности, включая обёртки
над функциями OpenSSL для хэшей, HMAC, шифрования и расшифрования, подписи и проверки.

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

Node.js может быть собран без модуля `node:crypto`.
Тогда `import` из `crypto` или вызов `require('node:crypto')` приведут к ошибке.

В CommonJS ошибку можно перехватить через try/catch:

<!-- eslint-disable no-global-assign -->

=== "CJS"

    ```js
    let crypto;
    try {
      crypto = require('node:crypto');
    } catch (err) {
      console.error('crypto support is disabled!');
    }
    ```

<!-- eslint-enable no-global-assign -->

При лексическом `import` в ESM ошибку можно перехватить только если обработчик
`process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль
(например через preload).

Если код может выполняться в сборке Node.js без crypto, вместо лексического `import`
используйте динамический [`import()`][`import()`]:

=== "MJS"

    ```js
    let crypto;
    try {
      crypto = await import('node:crypto');
    } catch (err) {
      console.error('crypto support is disabled!');
    }
    ```

## Типы асимметричных ключей

В таблице — типы асимметричных ключей, которые распознаёт API [`KeyObject`][`KeyObject`], и поддерживаемые форматы импорта/экспорта.

| Тип ключа                          | Описание           | OID                     | `'pem'` | `'der'` | `'jwk'` | `'raw-public'` | `'raw-private'` | `'raw-seed'` |
| ---------------------------------- | ------------------ | ----------------------- | ------- | ------- | ------- | -------------- | --------------- | ------------ |
| `'dh'`                             | Diffie-Hellman     | 1.2.840.113549.1.3.1    | ✔       | ✔       |         |                |                 |              |
| `'dsa'`                            | DSA                | 1.2.840.10040.4.1       | ✔       | ✔       |         |                |                 |              |
| `'ec'`                             | Elliptic curve     | 1.2.840.10045.2.1       | ✔       | ✔       | ✔       | ✔              | ✔               |              |
| `'ed25519'`                        | Ed25519            | 1.3.101.112             | ✔       | ✔       | ✔       | ✔              | ✔               |              |
| `'ed448'`                          | Ed448              | 1.3.101.113             | ✔       | ✔       | ✔       | ✔              | ✔               |              |
| `'ml-dsa-44'`[^openssl35]          | ML-DSA-44          | 2.16.840.1.101.3.4.3.17 | ✔       | ✔       | ✔       | ✔              |                 | ✔            |
| `'ml-dsa-65'`[^openssl35]          | ML-DSA-65          | 2.16.840.1.101.3.4.3.18 | ✔       | ✔       | ✔       | ✔              |                 | ✔            |
| `'ml-dsa-87'`[^openssl35]          | ML-DSA-87          | 2.16.840.1.101.3.4.3.19 | ✔       | ✔       | ✔       | ✔              |                 | ✔            |
| `'ml-kem-512'`[^openssl35]         | ML-KEM-512         | 2.16.840.1.101.3.4.4.1  | ✔       | ✔       |         | ✔              |                 | ✔            |
| `'ml-kem-768'`[^openssl35]         | ML-KEM-768         | 2.16.840.1.101.3.4.4.2  | ✔       | ✔       |         | ✔              |                 | ✔            |
| `'ml-kem-1024'`[^openssl35]        | ML-KEM-1024        | 2.16.840.1.101.3.4.4.3  | ✔       | ✔       |         | ✔              |                 | ✔            |
| `'rsa-pss'`                        | RSA PSS            | 1.2.840.113549.1.1.10   | ✔       | ✔       |         |                |                 |              |
| `'rsa'`                            | RSA                | 1.2.840.113549.1.1.1    | ✔       | ✔       | ✔       |                |                 |              |
| `'slh-dsa-sha2-128f'`[^openssl35]  | SLH-DSA-SHA2-128f  | 2.16.840.1.101.3.4.3.21 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-sha2-128s'`[^openssl35]  | SLH-DSA-SHA2-128s  | 2.16.840.1.101.3.4.3.20 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-sha2-192f'`[^openssl35]  | SLH-DSA-SHA2-192f  | 2.16.840.1.101.3.4.3.23 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-sha2-192s'`[^openssl35]  | SLH-DSA-SHA2-192s  | 2.16.840.1.101.3.4.3.22 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-sha2-256f'`[^openssl35]  | SLH-DSA-SHA2-256f  | 2.16.840.1.101.3.4.3.25 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-sha2-256s'`[^openssl35]  | SLH-DSA-SHA2-256s  | 2.16.840.1.101.3.4.3.24 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-shake-128f'`[^openssl35] | SLH-DSA-SHAKE-128f | 2.16.840.1.101.3.4.3.27 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-shake-128s'`[^openssl35] | SLH-DSA-SHAKE-128s | 2.16.840.1.101.3.4.3.26 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-shake-192f'`[^openssl35] | SLH-DSA-SHAKE-192f | 2.16.840.1.101.3.4.3.29 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-shake-192s'`[^openssl35] | SLH-DSA-SHAKE-192s | 2.16.840.1.101.3.4.3.28 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-shake-256f'`[^openssl35] | SLH-DSA-SHAKE-256f | 2.16.840.1.101.3.4.3.31 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'slh-dsa-shake-256s'`[^openssl35] | SLH-DSA-SHAKE-256s | 2.16.840.1.101.3.4.3.30 | ✔       | ✔       |         | ✔              | ✔               |              |
| `'x25519'`                         | X25519             | 1.3.101.110             | ✔       | ✔       | ✔       | ✔              | ✔               |              |
| `'x448'`                           | X448               | 1.3.101.111             | ✔       | ✔       | ✔       | ✔              | ✔               |              |

### Форматы ключей

Асимметричные ключи можно представить в нескольких форматах. **Рекомендуется один раз импортировать материал ключа в [`KeyObject`][`KeyObject`] и переиспользовать его**
для всех дальнейших операций — так не повторяется разбор и достигается лучшая производительность.

Если [`KeyObject`][`KeyObject`] неудобен (например ключ приходит в сообщении протокола и используется один раз), большинство криптографических функций принимают строку PEM или объект с форматом и материалом ключа. Полный набор опций — в [`crypto.createPublicKey()`][`crypto.createPublicKey()`],
[`crypto.createPrivateKey()`][`crypto.createPrivateKey()`] и [`keyObject.export()`][`keyObject.export()`].

#### KeyObject

[`KeyObject`][`KeyObject`] — представление разобранного ключа в памяти. Создаётся через [`crypto.createPublicKey()`][`crypto.createPublicKey()`], [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`],
[`crypto.createSecretKey()`][`crypto.createSecretKey()`] или функции генерации, например [`crypto.generateKeyPair()`][`crypto.generateKeyPair()`]. Первая криптографическая операция с данным [`KeyObject`][`KeyObject`] может быть медленнее последующих: OpenSSL лениво инициализирует внутренние кэши при первом использовании.

#### PEM и DER

PEM и DER — традиционные кодировки асимметричных ключей на базе структур ASN.1.

* **PEM** — текстовая кодировка: DER в Base64 между строками заголовка и подвала (например `-----BEGIN PUBLIC KEY-----`). Строки PEM можно передавать напрямую во многие операции.
* **DER** — двоичная кодировка тех же структур ASN.1. Для входа DER нужно явно указать `type` (обычно `'spki'` или `'pkcs8'`).

#### JSON Web Key (JWK)

JSON Web Key (JWK) — представление ключа в JSON по [RFC 7517][RFC 7517]. Компоненты кодируются в Base64url внутри объекта. Для RSA JWK снижает накладные расходы разбора ASN.1 и часто даёт самый быстрый импорт из сериализованных форматов.

#### «Сырые» форматы ключей

> Стабильность: 1.1 — Активная разработка

Форматы `'raw-public'`, `'raw-private'` и `'raw-seed'` позволяют импортировать и экспортировать сырой материал ключа без обёртки.
Подробности — [`keyObject.export()`][`keyObject.export()`], [`crypto.createPublicKey()`][`crypto.createPublicKey()`], [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`].

`'raw-public'` обычно самый быстрый способ импорта открытого ключа.
`'raw-private'` и `'raw-seed'` не всегда быстрее других форматов: в них только скаляр/seed закрытого ключа — для использования часто нужно вычислить открытую часть (умножение на кривой, развёртывание seed), что дорого. В других форматах уже есть обе части ключа.

### Выбор формата ключа

**По возможности используйте [`KeyObject`][`KeyObject`]** — создайте из любого доступного формата и переиспользуйте. Ниже — про выбор формата сериализации при импорте в [`KeyObject`][`KeyObject`] или при передаче материала inline, когда [`KeyObject`][`KeyObject`] не подходит.

#### Импорт ключей

Если [`KeyObject`][`KeyObject`] создаётся для многократного использования, стоимость импорта платится один раз, и более быстрый формат снижает задержку старта.

Импорт состоит из **разбора обёртки** и **вычислений по ключу** (восстановление полного ключа: открытый ключ из закрытого скаляра, развёртывание seed и т. д.). Что доминирует, зависит от типа ключа. Например:

* Открытые ключи — `'raw-public'` обычно быстрее всех сериализованных форматов: нет разбора ASN.1 и Base64.
* Закрытые EC — `'raw-private'` быстрее PEM/DER (меньше ASN.1). На больших кривых (P-384, P-521) вычисление открытой точки дорого, выигрыш меньше.
* RSA — `'jwk'` часто самый быстрый сериализованный формат: компоненты как целые в Base64url без ASN.1.

#### Материал ключа inline в операциях

Если [`KeyObject`][`KeyObject`] нельзя переиспользовать (ключ пришёл как сырые байты в сообщении и используется один раз), функции обычно принимают PEM или объект с форматом и материалом. Полная стоимость — импорт плюс сама криптооперация.

Если доминирует тяжёлая операция (подпись RSA, ECDH на P-384/P-521), формат сериализации почти не влияет на пропускную способность — выбирайте удобный. Для лёгких операций (Ed25519) импорт заметнее, и быстрые `'raw-public'` / `'raw-private'` дают выигрыш.

Даже при нескольких использованиях одного материала лучше импортировать в [`KeyObject`][`KeyObject`], чем снова передавать сырой или PEM.

### Примеры

Переиспользование [`KeyObject`][`KeyObject`] для подписи и проверки:

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

Пример: импорт ключей разных форматов в [`KeyObject`][`KeyObject`]:

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

Пример: передача материала ключа напрямую в [`crypto.sign()`][`crypto.sign()`] и
[`crypto.verify()`][`crypto.verify()`] без предварительного [`KeyObject`][`KeyObject`]:

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

<!-- YAML
added: v0.11.8
-->

SPKAC — механизм запроса на подпись сертификата, изначально в Netscape и формально
вошедший в элемент HTML5 `keygen`.

`<keygen>` устарел с [HTML 5.2][HTML 5.2]; в новых проектах элемент не используют.

Модуль `node:crypto` предоставляет класс `Certificate` для работы с данными SPKAC.
Чаще всего это вывод элемента `<keygen>`. Внутри Node.js использует [реализацию SPKAC в OpenSSL][OpenSSL's SPKAC implementation].

### Статический метод: `Certificate.exportChallenge(spkac[, encoding])`

<!-- YAML
added: v9.0.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The spkac argument can be an ArrayBuffer. Limited the size of
                 the spkac argument to a maximum of 2**31 - 1 bytes.
-->

Добавлено в: v9.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Аргументом spkac может быть ArrayBuffer. Ограничен размер аргумента spkac максимум до 2**31–1 байта. |

* `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `spkac`
* Возвращает: [`<Buffer>`](buffer.md#buffer) компонент challenge структуры `spkac` (открытый ключ и challenge)

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

<!-- YAML
added: v9.0.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The spkac argument can be an ArrayBuffer. Limited the size of
                 the spkac argument to a maximum of 2**31 - 1 bytes.
-->

Добавлено в: v9.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Аргументом spkac может быть ArrayBuffer. Ограничен размер аргумента spkac максимум до 2**31–1 байта. |

* `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `spkac`
* Возвращает: [`<Buffer>`](buffer.md#buffer) компонент открытого ключа структуры `spkac` (открытый ключ и challenge)

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

<!-- YAML
added: v9.0.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The spkac argument can be an ArrayBuffer. Added encoding.
                 Limited the size of the spkac argument to a maximum of
                 2**31 - 1 bytes.
-->

Добавлено в: v9.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Аргументом spkac может быть ArrayBuffer. Добавлена ​​кодировка. Ограничен размер аргумента spkac максимум до 2**31–1 байта. |

* `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `spkac`
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если структура `spkac` допустима, иначе `false`

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

> Stability: 0 - Deprecated

Через устаревший интерфейс можно создавать новые экземпляры
класса `crypto.Certificate`, как показано в примерах ниже.

#### `new crypto.Certificate()`

Экземпляры класса `Certificate` можно создать с помощью ключевого слова `new`
или вызовом `crypto.Certificate()` как функции:

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

<!-- YAML
added: v0.11.8
-->

* `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `spkac`
* Возвращает: [`<Buffer>`](buffer.md#buffer) компонент challenge структуры данных `spkac`, который
  включает открытый ключ и challenge

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

<!-- YAML
added: v0.11.8
-->

* `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `spkac`
* Возвращает: [`<Buffer>`](buffer.md#buffer) компонент открытого ключа структуры данных `spkac`,
  который включает открытый ключ и challenge

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

<!-- YAML
added: v0.11.8
-->

* `spkac` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `spkac`
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если переданная структура данных `spkac` допустима,
  иначе `false`

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

<!-- YAML
added: v0.1.94
-->

* Extends: [`<stream.Transform>`](stream.md#class-streamtransform)

Экземпляры `Cipheriv` используются для шифрования данных. Два варианта использования:

* как [поток][stream] `Transform`: в пишущую сторону подаётся открытый текст, со стороны чтения — шифротекст;
* через [`cipher.update()`][`cipher.update()`] и [`cipher.final()`][`cipher.final()`].

[`crypto.createCipheriv()`][`crypto.createCipheriv()`] создаёт экземпляры `Cipheriv`; конструктор `new` не используют.

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

Пример: методы [`cipher.update()`][`cipher.update()`] и [`cipher.final()`][`cipher.final()`]:

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

<!-- YAML
added: v0.1.94
-->

* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the return value.
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Any remaining enciphered contents.
  If `outputEncoding` is specified, a string is
  returned. If an `outputEncoding` is not provided, a [`Buffer`][`Buffer`] is returned.

Once the `cipher.final()` method has been called, the `Cipheriv` object can no
longer be used to encrypt data. Attempts to call `cipher.final()` more than
once will result in an error being thrown.

### `cipher.getAuthTag()`

<!-- YAML
added: v1.0.0
-->

* Возвращает: [`<Buffer>`](buffer.md#buffer) В режимах с аутентификацией (`GCM`, `CCM`,
  `OCB`, `chacha20-poly1305`) метод `cipher.getAuthTag()` возвращает
  [`Buffer`][`Buffer`] с _тегом аутентификации_, вычисленным по данным.

`cipher.getAuthTag()` вызывают только после завершения шифрования через [`cipher.final()`][`cipher.final()`].

Если при создании `cipher` была задана опция `authTagLength`, вернётся ровно столько байт.

### `cipher.setAAD(buffer[, options])`

<!-- YAML
added: v1.0.0
-->

* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
  * `plaintextLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка][encoding] строки `buffer`.
* Возвращает: [`<Cipheriv>`](crypto.md#class-cipheriv) Тот же экземпляр `Cipheriv` (цепочка вызовов).

В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) метод `cipher.setAAD()`
задаёт _дополнительные аутентифицированные данные_ (AAD).

Для `GCM` и `OCB` опция `plaintextLength` необязательна. Для `CCM` её нужно указать,
и значение должно совпадать с длиной открытого текста в байтах. См. [режим CCM][CCM mode].

`cipher.setAAD()` вызывают до [`cipher.update()`][`cipher.update()`].

### `cipher.setAutoPadding([autoPadding])`

<!-- YAML
added: v0.7.1
-->

* `autoPadding` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
* Возвращает: [`<Cipheriv>`](crypto.md#class-cipheriv) Тот же экземпляр `Cipheriv`.

Для блочных шифров `Cipheriv` по умолчанию добавляет padding до размера блока.
Отключить: `cipher.setAutoPadding(false)`.

При `autoPadding === false` длина всех входных данных должна быть кратна размеру блока,
иначе [`cipher.final()`][`cipher.final()`] выбросит ошибку. Отключение padding нужно для нестандартного
заполнения (например `0x0` вместо PKCS).

`cipher.setAutoPadding()` вызывают до [`cipher.final()`][`cipher.final()`].

### `cipher.update(data[, inputEncoding][, outputEncoding])`

<!-- YAML
added: v0.1.94
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.1.94

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка][encoding] данных.
* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка][encoding] результата.
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Обновляет шифр данными `data`. Если задан `inputEncoding`, `data` — строка в этой кодировке.
Если `inputEncoding` нет, `data` должен быть [`Buffer`][`Buffer`], `TypedArray` или `DataView`;
для бинарных типов `inputEncoding` игнорируется.

`outputEncoding` задаёт формат шифротекста на выходе: при указании возвращается строка,
иначе — [`Buffer`][`Buffer`].

`cipher.update()` можно вызывать несколько раз до [`cipher.final()`][`cipher.final()`]; после
[`cipher.final()`][`cipher.final()`] вызов `cipher.update()` приведёт к ошибке.

## Class: `Decipheriv`

<!-- YAML
added: v0.1.94
-->

* Extends: [`<stream.Transform>`](stream.md#class-streamtransform)

Экземпляры `Decipheriv` расшифровывают данные. Два варианта:

* как [поток][stream] `Transform`: на запись подаётся шифротекст, со стороны чтения — открытый текст;
* через [`decipher.update()`][`decipher.update()`] и [`decipher.final()`][`decipher.final()`].

[`crypto.createDecipheriv()`][`crypto.createDecipheriv()`] создаёт `Decipheriv`; `new` не используют.

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

Пример: [`decipher.update()`][`decipher.update()`] и [`decipher.final()`][`decipher.final()`]:

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

<!-- YAML
added: v0.1.94
-->

* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка][encoding] результата.
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Оставшийся расшифрованный материал.
  При указанном `outputEncoding` возвращается строка, иначе — [`Buffer`][`Buffer`].

После вызова `decipher.final()` объект `Decipheriv` больше нельзя использовать для расшифровки.
Повторный вызов `decipher.final()` вызывает ошибку.

### `decipher.setAAD(buffer[, options])`

<!-- YAML
added: v1.0.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The buffer argument can be a string or ArrayBuffer and is
                limited to no more than 2 ** 31 - 1 bytes.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9398
    description: This method now returns a reference to `decipher`.
-->

Добавлено в: v1.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Аргумент буфера может быть строкой или ArrayBuffer и ограничен не более чем 2 ** 31 — 1 байтами. |
    | v7.2.0 | Этот метод теперь возвращает ссылку на `decipher`. |

* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
  * `plaintextLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки `buffer`.
* Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv) Тот же `Decipheriv` (цепочка вызовов).

В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) метод `decipher.setAAD()`
задаёт _дополнительные аутентифицированные данные_ (AAD).

Для `GCM` аргумент `options` необязателен. Для `CCM` нужно указать `plaintextLength`,
совпадающий с длиной шифротекста в байтах. См. [режим CCM][CCM mode].

`decipher.setAAD()` вызывают до [`decipher.update()`][`decipher.update()`].

При передаче строки в `buffer` учитывайте
[оговорки по строкам во входах крипто-API][caveats when using strings as inputs to cryptographic APIs].

### `decipher.setAuthTag(buffer[, encoding])`

<!-- YAML
added: v1.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/61084
    description: Using GCM tag lengths other than 128 bits without specifying
                 the `authTagLength` option when creating `decipher` is not
                 allowed anymore.
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52345
    description: Using GCM tag lengths other than 128 bits without specifying
                 the `authTagLength` option when creating `decipher` is
                 deprecated.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The buffer argument can be a string or ArrayBuffer and is
                limited to no more than 2 ** 31 - 1 bytes.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/17825
    description: This method now throws if the GCM tag length is invalid.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9398
    description: This method now returns a reference to `decipher`.
-->

Добавлено в: v1.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Использование тегов GCM длиной, отличной от 128 бит, без указания опции authTagLength при создании decipher больше не допускается. |
    | v22.0.0, v20.13.0 | Использование тегов GCM длиной, отличной от 128 бит, без указания опции authTagLength при создании decipher устарело. |
    | v15.0.0 | Аргумент буфера может быть строкой или ArrayBuffer и ограничен не более чем 2 ** 31 — 1 байтами. |
    | v11.0.0 | Этот метод теперь выдает ошибку, если длина тега GCM недействительна. |
    | v7.2.0 | Этот метод теперь возвращает ссылку на `decipher`. |

* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки `buffer`.
* Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv) Тот же `Decipheriv`.

В режимах с аутентификацией (`GCM`, `CCM`, `OCB`, `chacha20-poly1305`) `decipher.setAuthTag()` передаёт
полученный _тег аутентификации_. Без тега или при изменении шифротекста [`decipher.final()`][`decipher.final()`]
выбросит ошибку — данные нужно отбросить. Неверная длина тега по [NIST SP 800-38D][NIST SP 800-38D] или
несовпадение с `authTagLength` также даёт ошибку.

`decipher.setAuthTag()` для `CCM` вызывают до [`decipher.update()`][`decipher.update()`], для `GCM`, `OCB` и
`chacha20-poly1305` — до [`decipher.final()`][`decipher.final()`].
`decipher.setAuthTag()` можно вызвать только один раз.

Для строки-тега см.
[оговорки по строкам во входах крипто-API][caveats when using strings as inputs to cryptographic APIs].

### `decipher.setAutoPadding([autoPadding])`

<!-- YAML
added: v0.7.1
-->

* `autoPadding` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
* Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv) Тот же `Decipheriv`.

Если шифрование было без стандартного блочного padding, `decipher.setAutoPadding(false)` отключает
автоматическое снятие padding, чтобы [`decipher.final()`][`decipher.final()`] не проверял и не удалял его.

Без padding длина входных данных должна быть кратна размеру блока шифра.

`decipher.setAutoPadding()` вызывают до [`decipher.final()`][`decipher.final()`].

### `decipher.update(data[, inputEncoding][, outputEncoding])`

<!-- YAML
added: v0.1.94
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.1.94

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка][encoding] строки `data`.
* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Кодировка][encoding] результата.
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Обновляет расшифровщик данными `data`. Если задан `inputEncoding`, `data` — строка в этой кодировке.
Если `inputEncoding` нет, `data` должен быть [`Buffer`][`Buffer`]; для `Buffer` `inputEncoding` игнорируется.

`outputEncoding` задаёт формат выхода: строка или [`Buffer`][`Buffer`].

`decipher.update()` можно вызывать несколько раз до [`decipher.final()`][`decipher.final()`]; после
[`decipher.final()`][`decipher.final()`] — ошибка.

Даже при аутентифицирующем шифре на этом шаге подлинность открытого текста может быть не подтверждена;
для AEAD проверка обычно завершается при вызове [`decipher.final()`][`decipher.final()`].

## Класс: `DiffieHellman`

<!-- YAML
added: v0.5.0
-->

Класс `DiffieHellman` — обмен ключами Диффи–Хеллмана.

Экземпляры создаются через [`crypto.createDiffieHellman()`][`crypto.createDiffieHellman()`].

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

<!-- YAML
added: v0.5.0
-->

* `otherPublicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `otherPublicKey`
* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет общий секрет, используя `otherPublicKey` как открытый ключ
другой стороны, и возвращает вычисленный общий секрет. Переданный
ключ интерпретируется в указанной `inputEncoding`, а секрет кодируется
в указанной `outputEncoding`.
Если `inputEncoding` не
задана, ожидается, что `otherPublicKey` — это [`Buffer`][`Buffer`],
`TypedArray` или `DataView`.

Если задана `outputEncoding`, возвращается строка; иначе —
[`Buffer`][`Buffer`].

### `diffieHellman.generateKeys([encoding])`

<!-- YAML
added: v0.5.0
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует значения закрытого и открытого ключей Диффи–Хеллмана, если они ещё не были
сгенерированы или вычислены, и возвращает
открытый ключ в указанной `encoding`. Этот ключ нужно
передать другой стороне.
Если задана `encoding`, возвращается строка; иначе —
[`Buffer`][`Buffer`].

Эта функция — тонкая обёртка над [`DH_generate_key()`][`DH_generate_key()`]. В частности,
после того как закрытый ключ уже сгенерирован или задан, вызов этой функции только обновляет
открытый ключ, но не создаёт новый закрытый.

### `diffieHellman.getGenerator([encoding])`

<!-- YAML
added: v0.5.0
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает генератор Диффи–Хеллмана в указанной `encoding`.
Если задана `encoding`, возвращается строка;
иначе — [`Buffer`][`Buffer`].

### `diffieHellman.getPrime([encoding])`

<!-- YAML
added: v0.5.0
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает простое число (модуль) Диффи–Хеллмана в указанной `encoding`.
Если задана `encoding`, возвращается строка;
иначе — [`Buffer`][`Buffer`].

### `diffieHellman.getPrivateKey([encoding])`

<!-- YAML
added: v0.5.0
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает закрытый ключ Диффи–Хеллмана в указанной `encoding`.
Если задана `encoding`,
возвращается строка; иначе — [`Buffer`][`Buffer`].

### `diffieHellman.getPublicKey([encoding])`

<!-- YAML
added: v0.5.0
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает открытый ключ Диффи–Хеллмана в указанной `encoding`.
Если задана `encoding`,
возвращается строка; иначе — [`Buffer`][`Buffer`].

### `diffieHellman.setPrivateKey(privateKey[, encoding])`

<!-- YAML
added: v0.5.0
-->

* `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `privateKey`

Задаёт закрытый ключ Диффи–Хеллмана. Если передан аргумент `encoding`,
ожидается, что `privateKey` —
строка. Если `encoding` не задана, ожидается, что `privateKey` —
это [`Buffer`][`Buffer`], `TypedArray` или `DataView`.

Эта функция не вычисляет связанный открытый ключ автоматически. Можно вызвать либо
[`diffieHellman.setPublicKey()`][`diffieHellman.setPublicKey()`], либо [`diffieHellman.generateKeys()`][`diffieHellman.generateKeys()`] —
чтобы явно задать открытый ключ или получить его автоматически.

### `diffieHellman.setPublicKey(publicKey[, encoding])`

<!-- YAML
added: v0.5.0
-->

* `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `publicKey`

Задаёт открытый ключ Диффи–Хеллмана. Если передан аргумент `encoding`,
ожидается, что `publicKey` —
строка. Если `encoding` не задана, ожидается, что `publicKey` —
это [`Buffer`][`Buffer`], `TypedArray` или `DataView`.

### `diffieHellman.verifyError`

<!-- YAML
added: v0.11.12
-->

Битовое поле с предупреждениями и/или ошибками, полученными при проверке
при инициализации объекта `DiffieHellman`.

Для этого свойства допустимы следующие значения (как определено в модуле `node:constants`):

* `DH_CHECK_P_NOT_SAFE_PRIME`
* `DH_CHECK_P_NOT_PRIME`
* `DH_UNABLE_TO_CHECK_GENERATOR`
* `DH_NOT_SUITABLE_GENERATOR`

## Класс: `DiffieHellmanGroup`

<!-- YAML
added: v0.7.5
-->

Класс `DiffieHellmanGroup` принимает в качестве аргумента известную группу modp.
Работает так же, как `DiffieHellman`, за исключением того, что после создания нельзя менять
ключи. Другими словами, не реализованы методы `setPublicKey()`
и `setPrivateKey()`.

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

* `'modp14'` (2048 bits, [RFC 3526][RFC 3526] Section 3)
* `'modp15'` (3072 bits, [RFC 3526][RFC 3526] Section 4)
* `'modp16'` (4096 bits, [RFC 3526][RFC 3526] Section 5)
* `'modp17'` (6144 bits, [RFC 3526][RFC 3526] Section 6)
* `'modp18'` (8192 bits, [RFC 3526][RFC 3526] Section 7)

Следующие группы по-прежнему поддерживаются, но устарели (см. [ограничения][Caveats]):

* `'modp1'` (768 bits, [RFC 2409][RFC 2409] Section 6.1) <span class="deprecated-inline"></span>
* `'modp2'` (1024 bits, [RFC 2409][RFC 2409] Section 6.2) <span class="deprecated-inline"></span>
* `'modp5'` (1536 bits, [RFC 3526][RFC 3526] Section 2) <span class="deprecated-inline"></span>

Эти устаревшие группы могут быть удалены в будущих версиях Node.js.

## Класс: `ECDH`

<!-- YAML
added: v0.11.14
-->

Класс `ECDH` — утилита для обмена ключами по протоколу Elliptic Curve Diffie-Hellman (ECDH).

Экземпляры класса `ECDH` создаются функцией
[`crypto.createECDH()`][`crypto.createECDH()`].

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

<!-- YAML
added: v10.0.0
-->

* `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `curve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `key`
* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'uncompressed'`
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Преобразует открытый ключ EC Diffie-Hellman, заданный `key` и `curve`, в
формат, указанный в `format`. Аргумент `format` задаёт кодирование точки
и может быть `'compressed'`, `'uncompressed'` или `'hybrid'`. Переданный ключ
интерпретируется в указанной `inputEncoding`, возвращаемый ключ кодируется
в указанной `outputEncoding`.

Список имён доступных кривых можно получить через [`crypto.getCurves()`][`crypto.getCurves()`].
В свежих версиях OpenSSL команда `openssl ecparam -list_curves` также выводит
имя и описание каждой доступной эллиптической кривой.

Если `format` не указан, точка возвращается в формате `'uncompressed'`.

Если `inputEncoding` не задана, ожидается, что `key` — это [`Buffer`][`Buffer`],
`TypedArray` или `DataView`.

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

<!-- YAML
added: v0.11.14
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/16849
    description: Changed error format to better support invalid public key
                 error.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.11.14

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Изменен формат ошибок для лучшей поддержки ошибок недопустимого открытого ключа. |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `otherPublicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `otherPublicKey`
* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет общий секрет, используя `otherPublicKey` как открытый ключ
другой стороны, и возвращает вычисленный общий секрет. Переданный
ключ интерпретируется в указанной `inputEncoding`, возвращаемый секрет
кодируется в указанной `outputEncoding`.
Если `inputEncoding` не
задана, ожидается, что `otherPublicKey` — это [`Buffer`][`Buffer`], `TypedArray` или
`DataView`.

Если задана `outputEncoding`, возвращается строка; иначе —
[`Buffer`][`Buffer`].

`ecdh.computeSecret` выбросит ошибку
`ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY`, когда `otherPublicKey`
лежит вне эллиптической кривой. Поскольку `otherPublicKey` обычно
приходит от удалённого пользователя по незащищённой сети,
обязательно обрабатывайте это исключение.

### `ecdh.generateKeys([encoding[, format]])`

<!-- YAML
added: v0.11.14
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'uncompressed'`
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует значения закрытого и открытого ключей EC Diffie-Hellman и возвращает
открытый ключ в указанных `format` и `encoding`. Этот ключ нужно
передать другой стороне.

Аргумент `format` задаёт кодирование точки и может быть `'compressed'` или
`'uncompressed'`. Если `format` не указан, точка возвращается в
формате `'uncompressed'`.

Если задана `encoding`, возвращается строка; иначе — [`Buffer`][`Buffer`].

### `ecdh.getPrivateKey([encoding])`

<!-- YAML
added: v0.11.14
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) закрытый ключ EC Diffie-Hellman в указанной `encoding`.

Если задана `encoding`, возвращается строка; иначе — [`Buffer`][`Buffer`].

### `ecdh.getPublicKey([encoding][, format])`

<!-- YAML
added: v0.11.14
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'uncompressed'`
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) открытый ключ EC Diffie-Hellman в указанных
  `encoding` и `format`.

Аргумент `format` задаёт кодирование точки и может быть `'compressed'` или
`'uncompressed'`. Если `format` не указан, точка возвращается в
формате `'uncompressed'`.

Если задана `encoding`, возвращается строка; иначе — [`Buffer`][`Buffer`].

### `ecdh.setPrivateKey(privateKey[, encoding])`

<!-- YAML
added: v0.11.14
-->

* `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `privateKey`

Задаёт закрытый ключ EC Diffie-Hellman.
Если задана `encoding`, ожидается, что `privateKey` —
строка; иначе ожидается [`Buffer`][`Buffer`],
`TypedArray` или `DataView`.

Если `privateKey` недопустим для кривой, указанной при создании объекта `ECDH`,
выбрасывается ошибка. После установки закрытого ключа также вычисляется и задаётся
связанная открытая точка (ключ) в объекте `ECDH`.

### `ecdh.setPublicKey(publicKey[, encoding])`

<!-- YAML
added: v0.11.14
deprecated: v5.2.0
-->

> Stability: 0 - Deprecated

* `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `publicKey`

Задаёт открытый ключ EC Diffie-Hellman.
Если задана `encoding`, ожидается, что `publicKey` —
строка; иначе ожидается [`Buffer`][`Buffer`], `TypedArray` или `DataView`.

Обычно этот метод не нужен: для `ECDH` достаточно закрытого ключа и открытого ключа
другой стороны, чтобы вычислить общий секрет. Обычно вызывают либо [`ecdh.generateKeys()`][`ecdh.generateKeys()`], либо
[`ecdh.setPrivateKey()`][`ecdh.setPrivateKey()`]. Метод [`ecdh.setPrivateKey()`][`ecdh.setPrivateKey()`]
пытается сгенерировать открытую точку/ключ, соответствующие устанавливаемому
закрытому ключу.

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

<!-- YAML
added: v0.1.92
-->

* Наследует: [`<stream.Transform>`](stream.md#class-streamtransform)

Класс `Hash` — утилита для вычисления хеш-дайджестов данных. Его можно
использовать одним из двух способов:

* как [поток][stream] с чтением и записью: данные пишутся
  с одной стороны, а на стороне чтения получается вычисленный хеш-дайджест;
* через методы [`hash.update()`][`hash.update()`] и [`hash.digest()`][`hash.digest()`], чтобы получить
  вычисленный хеш.

Экземпляры `Hash` создаёт метод [`crypto.createHash()`][`crypto.createHash()`]. Объекты `Hash`
не создают напрямую через `new`.

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

Пример: [`hash.update()`][`hash.update()`] и [`hash.digest()`][`hash.digest()`]:

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

<!-- YAML
added: v13.1.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
* Возвращает: [`<Hash>`](crypto.md)

Создаёт новый объект `Hash` с глубокой копией внутреннего состояния
текущего объекта `Hash`.

Необязательный аргумент `options` управляет поведением потока. Для XOF-функций хеширования,
таких как `'shake256'`, можно задать опцию `outputLength`, чтобы
указать желаемую длину выхода в байтах.

Ошибка выбрасывается при попытке скопировать объект `Hash` после вызова
его метода [`hash.digest()`][`hash.digest()`].

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

<!-- YAML
added: v0.1.92
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет дайджест по всем данным, переданным для хеширования (через
[`hash.update()`][`hash.update()`]).
Если задана `encoding`, возвращается строка; иначе —
[`Buffer`][`Buffer`].

После вызова `hash.digest()` объект `Hash` использовать снова нельзя.
Повторные вызовы приведут к ошибке.

### `hash.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `data`

Обновляет содержимое хеша данными `data`; их кодировка задаётся в `inputEncoding`.
Если `inputEncoding` не задана и `data` — строка, принудительно используется
кодировка `'utf8'`. Если `data` — [`Buffer`][`Buffer`], `TypedArray` или
`DataView`, то `inputEncoding` игнорируется.

Метод можно вызывать многократно по мере поступления новых данных в потоке.

## Класс: `Hmac`

<!-- YAML
added: v0.1.94
-->

* Наследует: [`<stream.Transform>`](stream.md#class-streamtransform)

Класс `Hmac` — утилита для вычисления криптографических HMAC-дайджестов. Его можно
использовать одним из двух способов:

* как [поток][stream] с чтением и записью: данные пишутся
  с одной стороны, а на стороне чтения получается вычисленный HMAC-дайджест;
* через методы [`hmac.update()`][`hmac.update()`] и [`hmac.digest()`][`hmac.digest()`], чтобы получить
  вычисленный HMAC-дайджест.

Экземпляры `Hmac` создаёт метод [`crypto.createHmac()`][`crypto.createHmac()`]. Объекты `Hmac`
не создают напрямую через `new`.

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

Пример: [`hmac.update()`][`hmac.update()`] и [`hmac.digest()`][`hmac.digest()`]:

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

<!-- YAML
added: v0.1.94
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] возвращаемого значения
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вычисляет HMAC-дайджест по всем данным, переданным через [`hmac.update()`][`hmac.update()`].
Если задана `encoding`,
возвращается строка; иначе — [`Buffer`][`Buffer`].

После вызова `hmac.digest()` объект `Hmac` использовать снова нельзя.
Повторные вызовы `hmac.digest()` приведут к ошибке.

### `hmac.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.94
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.1.94

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка][encoding] строки `data`

Обновляет содержимое `Hmac` данными `data`; их кодировка задаётся в `inputEncoding`.
Если `inputEncoding` не задана и `data` — строка, принудительно используется
кодировка `'utf8'`. Если `data` — [`Buffer`][`Buffer`], `TypedArray` или
`DataView`, то `inputEncoding` игнорируется.

Метод можно вызывать многократно по мере поступления новых данных в потоке.

## Класс: `KeyObject`

<!-- YAML
added: v11.6.0
changes:
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA keys.
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33360
    description: Instances of this class can now be passed to worker threads
                 using `postMessage`.
  - version: v11.13.0
    pr-url: https://github.com/nodejs/node/pull/26438
    description: This class is now exported.
-->

Добавлено в: v11.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.6.0 | Добавьте поддержку ключей ML-DSA. |
    | v14.5.0, v12.19.0 | Экземпляры этого класса теперь можно передавать в рабочие потоки с помощью postMessage. |
    | v11.13.0 | Этот класс теперь экспортирован. |

В Node.js класс `KeyObject` представляет симметричный или асимметричный ключ;
у каждого вида ключа свой набор возможностей. Экземпляры `KeyObject` создают методы
[`crypto.createSecretKey()`][`crypto.createSecretKey()`], [`crypto.createPublicKey()`][`crypto.createPublicKey()`] и
[`crypto.createPrivateKey()`][`crypto.createPrivateKey()`]. Объекты `KeyObject`
не создают напрямую через `new`.

В большинстве приложений лучше использовать API `KeyObject` вместо передачи ключей
строками или `Buffer` — благодаря улучшенным мерам безопасности.

Экземпляры `KeyObject` можно передавать в другие потоки через [`postMessage()`][`postMessage()`].
Получатель получает клонированный `KeyObject`; указывать `KeyObject` в аргументе `transferList` не нужно.

### Статический метод: `KeyObject.from(key)`

<!-- YAML
added: v15.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62453
    description: Passing a non-extractable CryptoKey as `key` is deprecated.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Передача неизвлекаемого CryptoKey в качестве «ключа» устарела. |

* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* Возвращает: [`<KeyObject>`](#class-keyobject)

Возвращает лежащий в основе [KeyObject](#class-keyobject) для [CryptoKey](webcrypto.md#class-cryptokey). У возвращённого [KeyObject](#class-keyobject)
не сохраняются ограничения Web Crypto API для исходного
[CryptoKey](webcrypto.md#class-cryptokey): допустимые сценарии использования ключа, привязки к алгоритму или хешу
и флаг извлекаемости. В частности, базовый
материал ключа у возвращённого [KeyObject](#class-keyobject) всегда можно экспортировать.

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

<!-- YAML
added: v15.7.0
changes:
  - version: v16.9.0
    pr-url: https://github.com/nodejs/node/pull/39851
    description: Expose `RSASSA-PSS-params` sequence parameters
                 for RSA-PSS keys.
-->

Добавлено в: v15.7.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.9.0 | Предоставьте параметры последовательности `RSASSA-PSS-params` для ключей RSA-PSS. |

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `modulusLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер ключа в битах (RSA, DSA).
  * `publicExponent` [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) открытая экспонента (RSA).
  * `hashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя хеш-функции для сообщения (RSA-PSS).
  * `mgf1HashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя хеш-функции, используемой в
    MGF1 (RSA-PSS).
  * `saltLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) минимальная длина соли в байтах (RSA-PSS).
  * `divisorLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер `q` в битах (DSA).
  * `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя кривой (EC).

Это свойство есть только у асимметричных ключей. В зависимости от типа ключа
объект содержит сведения о нём. Ни одно из значений, полученных
через это свойство, нельзя использовать для однозначной идентификации ключа или для компрометации
его безопасности.

Для ключей RSA-PSS, если в материале ключа есть последовательность `RSASSA-PSS-params`,
будут заданы свойства `hashAlgorithm`, `mgf1HashAlgorithm` и `saltLength`.

Другие детали ключа могут быть раскрыты через этот API дополнительными атрибутами.

### `keyObject.asymmetricKeyType`

<!-- YAML
added: v11.6.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59537
    description: Add support for SLH-DSA keys.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59461
    description: Add support for ML-KEM keys.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA keys.
  - version:
     - v13.9.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31178
    description: Added support for `'dh'`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26960
    description: Added support for `'rsa-pss'`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26786
    description: This property now returns `undefined` for KeyObject
                 instances of unrecognized type instead of aborting.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26774
    description: Added support for `'x25519'` and `'x448'`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26319
    description: Added support for `'ed25519'` and `'ed448'`.
-->

Добавлено в: v11.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Добавить поддержку ключей SLH-DSA. |
    | v24.7.0 | Добавить поддержку ключей ML-KEM. |
    | v24.6.0 | Добавьте поддержку ключей ML-DSA. |
    | v13.9.0, v12.17.0 | Добавлена ​​поддержка dh. |
    | v12.0.0 | Добавлена ​​поддержка rsa-pss. |
    | v12.0.0 | Это свойство теперь возвращает undefined для экземпляров KeyObject нераспознанного типа вместо прерывания. |
    | v12.0.0 | Добавлена ​​поддержка x25519 и x448. |
    | v12.0.0 | Добавлена ​​поддержка ed25519 и ed448. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Для асимметричных ключей это свойство задаёт тип ключа. См. поддерживаемые
[типы асимметричных ключей][asymmetric key types].

Для нераспознанных типов `KeyObject` и для симметричных
ключей свойство равно `undefined`.

### `keyObject.equals(otherKeyObject)`

<!-- YAML
added:
  - v17.7.0
  - v16.15.0
-->

* `otherKeyObject` [`<KeyObject>`](#class-keyobject) объект `KeyObject`, с которым
  сравнивается `keyObject`.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true` или `false` в зависимости от того, совпадают ли ключи по
типу, значению и параметрам. Этот метод не является
[постоянным по времени](https://en.wikipedia.org/wiki/Timing_attack).

### `keyObject.export([options])`

<!-- YAML
added: v11.6.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62240
    description: Added support for `'raw-public'`, `'raw-private'`,
                 and `'raw-seed'` formats.
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62178
    description: ML-KEM and ML-DSA private key `'pkcs8'` export now
                 uses seed-only format by default when a seed is
                 available.
  - version: v15.9.0
    pr-url: https://github.com/nodejs/node/pull/37081
    description: Added support for `'jwk'` format.
-->

Добавлено в: v11.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавлена ​​поддержка форматов «raw-public», «raw-private» и «raw-seed». |
    | REPLACEME | Экспорт закрытого ключа ML-KEM и ML-DSA `'pkcs8'` теперь по умолчанию использует формат только начального значения, если начальное число доступно. |
    | v15.9.0 | Добавлена ​​поддержка формата jwk. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Для симметричных ключей можно использовать такие опции кодирования:

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'buffer'` (по умолчанию) или `'jwk'`.

Для открытых ключей можно использовать такие опции кодирования:

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'pem'`, `'der'`, `'jwk'` или `'raw-public'`.
  Поддержка форматов — в разделе [типы асимметричных ключей][asymmetric key types].
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если `format` — `'pem'` или `'der'`, должно быть `'pkcs1'`
  (только RSA) или `'spki'`. Для ключей EC с форматом `'raw-public'` может быть
  `'uncompressed'` (по умолчанию) или `'compressed'`. Игнорируется, если `format` —
  `'jwk'`.

Для закрытых ключей можно использовать такие опции кодирования:

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `'pem'`, `'der'`, `'jwk'`, `'raw-private'`
  или `'raw-seed'`. Поддержка форматов — в разделе [типы асимметричных ключей][asymmetric key types].
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если `format` — `'pem'` или `'der'`, должно быть `'pkcs1'`
  (только RSA), `'pkcs8'` или `'sec1'` (только EC). Игнорируется, если `format` —
  `'jwk'`, `'raw-private'` или `'raw-seed'`.
* `cipher` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если указано, закрытый ключ будет зашифрован
  заданными `cipher` и `passphrase` с помощью шифрования на пароле PKCS#5 v2.0.
  Игнорируется, если `format` — `'jwk'`, `'raw-private'` или
  `'raw-seed'`.
* `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) пароль для шифрования.
  Обязателен, если указан `cipher`.

Тип результата зависит от выбранного формата: для PEM —
строка, для DER — [`Buffer`](buffer.md#buffer) с данными в кодировке DER, для [JWK][JWK] — объект. Сырые форматы возвращают
[`Buffer`](buffer.md#buffer) с сырым материалом ключа.

Закрытые ключи можно зашифровать, указав `cipher` и `passphrase`.
Тип PKCS#8 поддерживает шифрование и для PEM, и для DER `format` для любого
алгоритма ключа. PKCS#1 и SEC1 допускают шифрование только при PEM `format`.
Для максимальной совместимости используйте PKCS#8 для зашифрованных закрытых ключей. Поскольку
PKCS#8 определяет собственный механизм шифрования, шифрование на уровне PEM не
поддерживается при шифровании ключа PKCS#8. См. [RFC 5208][RFC 5208] о шифровании PKCS#8
и [RFC 1421][RFC 1421] о шифровании PKCS#1 и SEC1.

### `keyObject.symmetricKeySize`

<!-- YAML
added: v11.6.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Для секретных ключей это свойство задаёт размер ключа в байтах. Для асимметричных ключей
свойство равно `undefined`.

### `keyObject.toCryptoKey(algorithm, extractable, keyUsages)`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaHashedImportParams>`](webcrypto.md) | [`<EcKeyImportParams>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md)

<!--lint enable maximum-line-length remark-lint-->

* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) см. [сценарии использования ключа][Key usages].
* Возвращает: [`<CryptoKey>`](webcrypto.md#class-cryptokey)

Преобразует экземпляр `KeyObject` в `CryptoKey`.

### `keyObject.type`

<!-- YAML
added: v11.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

В зависимости от вида этого `KeyObject` свойство равно
`'secret'` для секретных (симметричных) ключей, `'public'` для открытых (асимметричных) ключей
или `'private'` для закрытых (асимметричных) ключей.

## Class: `Sign`

<!-- YAML
added: v0.1.92
-->

* Extends: [`<stream.Writable>`](stream.md#streamwritable)

The `Sign` class is a utility for generating signatures. It can be used in one
of two ways:

* As a writable [stream][stream], where data to be signed is written and the
  [`sign.sign()`][`sign.sign()`] method is used to generate and return the signature, or
* Using the [`sign.update()`][`sign.update()`] and [`sign.sign()`][`sign.sign()`] methods to produce the
  signature.

The [`crypto.createSign()`][`crypto.createSign()`] method is used to create `Sign` instances. The
argument is the string name of the hash function to use. `Sign` objects are not
to be created directly using the `new` keyword.

Пример: объекты `Sign` и [`Verify`][`Verify`] как потоки:

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

Пример: [`sign.update()`][`sign.update()`] и [`verify.update()`][`verify.update()`]:

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

<!-- YAML
added: v0.1.92
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The privateKey can also be an ArrayBuffer and CryptoKey.
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/29292
    description: This function now supports IEEE-P1363 DSA and ECDSA signatures.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26960
    description: This function now supports RSA-PSS keys.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: This function now supports key objects.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11705
    description: Support for RSASSA-PSS and additional options was added.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | PrivateKey также может быть ArrayBuffer и CryptoKey. |
    | v13.2.0, v12.16.0 | Эта функция теперь поддерживает подписи IEEE-P1363 DSA и ECDSA. |
    | v12.0.0 | Эта функция теперь поддерживает ключи RSA-PSS. |
    | v11.6.0 | Эта функция теперь поддерживает ключевые объекты. |
    | v8.0.0 | Добавлена ​​поддержка RSASSA-PSS и дополнительных опций. |

<!--lint disable maximum-line-length remark-lint-->

* `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
  * `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the return value.
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

<!--lint enable maximum-line-length remark-lint-->

Calculates the signature on all the data passed through using either
[`sign.update()`][`sign.update()`] or [`sign.write()`][stream-writable-write].

If `privateKey` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`privateKey` had been passed to [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`]. If it is an
object, the following additional properties can be passed:

* `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) For DSA and ECDSA, this option specifies the
  format of the generated signature. It can be one of the following:
  * `'der'` (default): DER-encoded ASN.1 signature structure encoding `(r, s)`.
  * `'ieee-p1363'`: Signature format `r || s` as proposed in IEEE-P1363.
* `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optional padding value for RSA, one of the following:

  * `crypto.constants.RSA_PKCS1_PADDING` (default)
  * `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` will use MGF1 with the same hash function
  used to sign the message as specified in section 3.1 of [RFC 4055][RFC 4055], unless
  an MGF1 hash function has been specified as part of the key in compliance with
  section 3.3 of [RFC 4055][RFC 4055].
* `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Salt length for when padding is
  `RSA_PKCS1_PSS_PADDING`. The special value
  `crypto.constants.RSA_PSS_SALTLEN_DIGEST` sets the salt length to the digest
  size, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (default) sets it to the
  maximum permissible value.

If `outputEncoding` is provided a string is returned; otherwise a [`Buffer`][`Buffer`]
is returned.

The `Sign` object can not be again used after `sign.sign()` method has been
called. Multiple calls to `sign.sign()` will result in an error being thrown.

### `sign.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the `data` string.

Updates the `Sign` content with the given `data`, the encoding of which
is given in `inputEncoding`.
If `encoding` is not provided, and the `data` is a string, an
encoding of `'utf8'` is enforced. If `data` is a [`Buffer`][`Buffer`], `TypedArray`, or
`DataView`, then `inputEncoding` is ignored.

This can be called many times with new data as it is streamed.

## Class: `Verify`

<!-- YAML
added: v0.1.92
-->

* Extends: [`<stream.Writable>`](stream.md#streamwritable)

The `Verify` class is a utility for verifying signatures. It can be used in one
of two ways:

* As a writable [stream][stream] where written data is used to validate against the
  supplied signature, or
* Using the [`verify.update()`][`verify.update()`] and [`verify.verify()`][`verify.verify()`] methods to verify
  the signature.

The [`crypto.createVerify()`][`crypto.createVerify()`] method is used to create `Verify` instances.
`Verify` objects are not to be created directly using the `new` keyword.

See [`Sign`][`Sign`] for examples.

### `verify.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.0.0 | Значение по умолчанию `inputEncoding` изменено с `binary` на `utf8`. |

* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the `data` string.

Updates the `Verify` content with the given `data`, the encoding of which
is given in `inputEncoding`.
If `inputEncoding` is not provided, and the `data` is a string, an
encoding of `'utf8'` is enforced. If `data` is a [`Buffer`][`Buffer`], `TypedArray`, or
`DataView`, then `inputEncoding` is ignored.

This can be called many times with new data as it is streamed.

### `verify.verify(key, signature[, signatureEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer and CryptoKey.
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/29292
    description: This function now supports IEEE-P1363 DSA and ECDSA signatures.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26960
    description: This function now supports RSA-PSS keys.
  - version: v11.7.0
    pr-url: https://github.com/nodejs/node/pull/25217
    description: The key can now be a private key.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11705
    description: Support for RSASSA-PSS and additional options was added.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Ключ также может быть ArrayBuffer и CryptoKey. |
    | v13.2.0, v12.16.0 | Эта функция теперь поддерживает подписи IEEE-P1363 DSA и ECDSA. |
    | v12.0.0 | Эта функция теперь поддерживает ключи RSA-PSS. |
    | v11.7.0 | Ключ теперь может быть закрытым ключом. |
    | v8.0.0 | Добавлена ​​поддержка RSASSA-PSS и дополнительных опций. |

<!--lint disable maximum-line-length remark-lint-->

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
  * `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `signature` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `signatureEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the `signature` string.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` or `false` depending on the validity of the
  signature for the data and public key.

<!--lint enable maximum-line-length remark-lint-->

Verifies the provided data using the given `key` and `signature`.

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`key` had been passed to [`crypto.createPublicKey()`][`crypto.createPublicKey()`]. If it is an
object, the following additional properties can be passed:

* `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) For DSA and ECDSA, this option specifies the
  format of the signature. It can be one of the following:
  * `'der'` (default): DER-encoded ASN.1 signature structure encoding `(r, s)`.
  * `'ieee-p1363'`: Signature format `r || s` as proposed in IEEE-P1363.
* `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optional padding value for RSA, one of the following:

  * `crypto.constants.RSA_PKCS1_PADDING` (default)
  * `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` will use MGF1 with the same hash function
  used to verify the message as specified in section 3.1 of [RFC 4055][RFC 4055], unless
  an MGF1 hash function has been specified as part of the key in compliance with
  section 3.3 of [RFC 4055][RFC 4055].
* `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Salt length for when padding is
  `RSA_PKCS1_PSS_PADDING`. The special value
  `crypto.constants.RSA_PSS_SALTLEN_DIGEST` sets the salt length to the digest
  size, `crypto.constants.RSA_PSS_SALTLEN_AUTO` (default) causes it to be
  determined automatically.

The `signature` argument is the previously calculated signature for the data, in
the `signatureEncoding`.
If a `signatureEncoding` is specified, the `signature` is expected to be a
string; otherwise `signature` is expected to be a [`Buffer`][`Buffer`],
`TypedArray`, or `DataView`.

The `verify` object can not be used again after `verify.verify()` has been
called. Multiple calls to `verify.verify()` will result in an error being
thrown.

Because public keys can be derived from private keys, a private key may
be passed instead of a public key.

## Class: `X509Certificate`

<!-- YAML
added: v15.6.0
-->

Encapsulates an X509 certificate and provides read-only access to
its information.

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

<!-- YAML
added: v15.6.0
-->

* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A PEM or DER encoded
  X509 Certificate.

### `x509.ca`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Будет `true`, если это сертификат центра сертификации (CA).

### `x509.checkEmail(email[, options])`

<!-- YAML
added: v15.6.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41600
    description: The subject option now defaults to `'default'`.
  - version:
      - v17.5.0
      - v16.14.1
    pr-url: https://github.com/nodejs/node/pull/41599
    description: The `wildcards`, `partialWildcards`, `multiLabelWildcards`, and
                 `singleLabelSubdomains` options have been removed since they
                 had no effect.
  - version:
    - v17.5.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41569
    description: The subject option can now be set to `'default'`.
-->

Добавлено в: v15.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Опция темы теперь по умолчанию установлена ​​на `'default'`. |
    | v17.5.0, v16.14.1 | Параметры «wildcards», «partialWildcards», «multiLabelWildcards» и «singleLabelSubdomains» были удалены, поскольку они не имели никакого эффекта. |
    | v17.5.0, v16.15.0 | Для параметра темы теперь можно установить значение «по умолчанию». |

* `email` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `subject` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'default'`, `'always'`, or `'never'`.
    **По умолчанию:** `'default'`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Returns `email` if the certificate matches,
  `undefined` if it does not.

Checks whether the certificate matches the given email address.

If the `'subject'` option is undefined or set to `'default'`, the certificate
subject is only considered if the subject alternative name extension either does
not exist or does not contain any email addresses.

If the `'subject'` option is set to `'always'` and if the subject alternative
name extension either does not exist or does not contain a matching email
address, the certificate subject is considered.

If the `'subject'` option is set to `'never'`, the certificate subject is never
considered, even if the certificate contains no subject alternative names.

### `x509.checkHost(name[, options])`

<!-- YAML
added: v15.6.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41600
    description: The subject option now defaults to `'default'`.
  - version:
    - v17.5.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41569
    description: The subject option can now be set to `'default'`.
-->

Добавлено в: v15.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Опция темы теперь по умолчанию установлена ​​на `'default'`. |
    | v17.5.0, v16.15.0 | Для параметра темы теперь можно установить значение «по умолчанию». |

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `subject` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'default'`, `'always'`, or `'never'`.
    **По умолчанию:** `'default'`.
  * `wildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
  * `partialWildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
  * `multiLabelWildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
  * `singleLabelSubdomains` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Returns a subject name that matches `name`,
  or `undefined` if no subject name matches `name`.

Checks whether the certificate matches the given host name.

If the certificate matches the given host name, the matching subject name is
returned. The returned name might be an exact match (e.g., `foo.example.com`)
or it might contain wildcards (e.g., `*.example.com`). Because host name
comparisons are case-insensitive, the returned subject name might also differ
from the given `name` in capitalization.

If the `'subject'` option is undefined or set to `'default'`, the certificate
subject is only considered if the subject alternative name extension either does
not exist or does not contain any DNS names. This behavior is consistent with
[RFC 2818][RFC 2818] ("HTTP Over TLS").

If the `'subject'` option is set to `'always'` and if the subject alternative
name extension either does not exist or does not contain a matching DNS name,
the certificate subject is considered.

If the `'subject'` option is set to `'never'`, the certificate subject is never
considered, even if the certificate contains no subject alternative names.

### `x509.checkIP(ip)`

<!-- YAML
added: v15.6.0
changes:
  - version:
      - v17.5.0
      - v16.14.1
    pr-url: https://github.com/nodejs/node/pull/41571
    description: The `options` argument has been removed since it had no effect.
-->

Добавлено в: v15.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.5.0, v16.14.1 | Аргумент `options` был удален, поскольку он не имел никакого эффекта. |

* `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Returns `ip` if the certificate matches,
  `undefined` if it does not.

Checks whether the certificate matches the given IP address (IPv4 or IPv6).

Only [RFC 5280][RFC 5280] `iPAddress` subject alternative names are considered, and they
must match the given `ip` address exactly. Other subject alternative names as
well as the subject field of the certificate are ignored.

### `x509.checkIssued(otherCert)`

<!-- YAML
added: v15.6.0
-->

* `otherCert` [`<X509Certificate>`](crypto.md)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Checks whether this certificate was potentially issued by the given `otherCert`
by comparing the certificate metadata.

This is useful for pruning a list of possible issuer certificates which have been
selected using a more rudimentary filtering routine, i.e. just based on subject
and issuer names.

Finally, to verify that this certificate's signature was produced by a private key
corresponding to `otherCert`'s public key use [`x509.verify(publicKey)`][`x509.verify(publicKey)`]
with `otherCert`'s public key represented as a [`KeyObject`][`KeyObject`]
like so

```js
if (!x509.verify(otherCert.publicKey)) {
  throw new Error('otherCert did not issue x509');
}
```

### `x509.checkPrivateKey(privateKey)`

<!-- YAML
added: v15.6.0
-->

* `privateKey` [`<KeyObject>`](#class-keyobject) A private key.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Checks whether the public key for this certificate is consistent with
the given private key.

### `x509.fingerprint`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The SHA-1 fingerprint of this certificate.

Because SHA-1 is cryptographically broken and because the security of SHA-1 is
significantly worse than that of algorithms that are commonly used to sign
certificates, consider using [`x509.fingerprint256`][`x509.fingerprint256`] instead.

### `x509.fingerprint256`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The SHA-256 fingerprint of this certificate.

### `x509.fingerprint512`

<!-- YAML
added:
  - v17.2.0
  - v16.14.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The SHA-512 fingerprint of this certificate.

Because computing the SHA-256 fingerprint is usually faster and because it is
only half the size of the SHA-512 fingerprint, [`x509.fingerprint256`][`x509.fingerprint256`] may be
a better choice. While SHA-512 presumably provides a higher level of security in
general, the security of SHA-256 matches that of most algorithms that are
commonly used to sign certificates.

### `x509.infoAccess`

<!-- YAML
added: v15.6.0
changes:
  - version:
      - v17.3.1
      - v16.13.2
    pr-url: https://github.com/nodejs-private/node-private/pull/300
    description: Parts of this string may be encoded as JSON string literals
                 in response to CVE-2021-44532.
-->

Добавлено в: v15.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.3.1, v16.13.2 | Части этой строки могут быть закодированы как строковые литералы JSON в ответ на CVE-2021-44532. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

A textual representation of the certificate's authority information access
extension.

This is a line feed separated list of access descriptions. Each line begins with
the access method and the kind of the access location, followed by a colon and
the value associated with the access location.

After the prefix denoting the access method and the kind of the access location,
the remainder of each line might be enclosed in quotes to indicate that the
value is a JSON string literal. For backward compatibility, Node.js only uses
JSON string literals within this property when necessary to avoid ambiguity.
Third-party code should be prepared to handle both possible entry formats.

### `x509.issuer`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The issuer identification included in this certificate.

### `x509.issuerCertificate`

<!-- YAML
added: v15.9.0
-->

* Тип: [`<X509Certificate>`](crypto.md)

The issuer certificate or `undefined` if the issuer certificate is not
available.

### `x509.keyUsage`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

An array detailing the key extended usages for this certificate.

### `x509.publicKey`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<KeyObject>`](#class-keyobject)

The public key [KeyObject](#class-keyobject) for this certificate.

### `x509.raw`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<Buffer>`](buffer.md#buffer)

A `Buffer` containing the DER encoding of this certificate.

### `x509.serialNumber`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The serial number of this certificate.

Serial numbers are assigned by certificate authorities and do not uniquely
identify certificates. Consider using [`x509.fingerprint256`][`x509.fingerprint256`] as a unique
identifier instead.

### `x509.subject`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The complete subject of this certificate.

### `x509.subjectAltName`

<!-- YAML
added: v15.6.0
changes:
  - version:
      - v17.3.1
      - v16.13.2
    pr-url: https://github.com/nodejs-private/node-private/pull/300
    description: Parts of this string may be encoded as JSON string literals
                 in response to CVE-2021-44532.
-->

Добавлено в: v15.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.3.1, v16.13.2 | Части этой строки могут быть закодированы как строковые литералы JSON в ответ на CVE-2021-44532. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The subject alternative name specified for this certificate.

This is a comma-separated list of subject alternative names. Each entry begins
with a string identifying the kind of the subject alternative name followed by
a colon and the value associated with the entry.

Earlier versions of Node.js incorrectly assumed that it is safe to split this
property at the two-character sequence `', '` (see [CVE-2021-44532][CVE-2021-44532]). However,
both malicious and legitimate certificates can contain subject alternative names
that include this sequence when represented as a string.

After the prefix denoting the type of the entry, the remainder of each entry
might be enclosed in quotes to indicate that the value is a JSON string literal.
For backward compatibility, Node.js only uses JSON string literals within this
property when necessary to avoid ambiguity. Third-party code should be prepared
to handle both possible entry formats.

### `x509.toJSON()`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

There is no standard JSON encoding for X509 certificates. The
`toJSON()` method returns a string containing the PEM encoded
certificate.

### `x509.toLegacyObject()`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Returns information about this certificate using the legacy
[certificate object][certificate object] encoding.

### `x509.toString()`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Returns the PEM-encoded certificate.

### `x509.validFrom`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The date/time from which this certificate is valid.

### `x509.validFromDate`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

* Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

The date/time from which this certificate is valid, encapsulated in a `Date` object.

### `x509.validTo`

<!-- YAML
added: v15.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The date/time until which this certificate is valid.

### `x509.validToDate`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

* Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

The date/time until which this certificate is valid, encapsulated in a `Date` object.

### `x509.signatureAlgorithm`

<!-- YAML
added: v24.9.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

The algorithm used to sign the certificate or `undefined` if the signature algorithm is unknown by OpenSSL.

### `x509.signatureAlgorithmOid`

<!-- YAML
added: v24.9.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The OID of the algorithm used to sign the certificate.

### `x509.verify(publicKey)`

<!-- YAML
added: v15.6.0
-->

* `publicKey` [`<KeyObject>`](#class-keyobject) A public key.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Verifies that this certificate was signed by the given public key.
Does not perform any other validation checks on the certificate.

## `node:crypto` module methods and properties

### `crypto.argon2(algorithm, parameters, callback)`

<!-- YAML
added: v24.7.0
-->

> Stability: 1.2 - Release candidate

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Variant of Argon2, one of `"argon2d"`, `"argon2i"` or `"argon2id"`.
* `parameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) REQUIRED, this is the password for password
    hashing applications of Argon2.
  * `nonce` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) REQUIRED, must be at
    least 8 bytes long. This is the salt for password hashing applications of Argon2.
  * `parallelism` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, degree of parallelism determines how many computational chains (lanes)
    can be run. Must be greater than 1 and less than `2**24-1`.
  * `tagLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, the length of the key to generate. Must be greater than 4 and
    less than `2**32-1`.
  * `memory` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, memory cost in 1KiB blocks. Must be greater than
    `8 * parallelism` and less than `2**32-1`. The actual number of blocks is rounded
    down to the nearest multiple of `4 * parallelism`.
  * `passes` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, number of passes (iterations). Must be greater than 1 and less
    than `2**32-1`.
  * `secret` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined OPTIONAL, Random additional input,
    similar to the salt, that should **NOT** be stored with the derived key. This is known as pepper in
    password hashing applications. If used, must have a length not greater than `2**32-1` bytes.
  * `associatedData` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined OPTIONAL, Additional data to
    be added to the hash, functionally equivalent to salt or secret, but meant for
    non-random data. If used, must have a length not greater than `2**32-1` bytes.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `derivedKey` [`<Buffer>`](buffer.md#buffer)

Provides an asynchronous [Argon2][argon2] implementation. Argon2 is a password-based
key derivation function that is designed to be expensive computationally and
memory-wise in order to make brute-force attacks unrewarding.

The `nonce` should be as unique as possible. It is recommended that a nonce is
random and at least 16 bytes long. See [NIST SP 800-132][NIST SP 800-132] for details.

When passing strings for `message`, `nonce`, `secret` or `associatedData`, please
consider [caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

The `callback` function is called with two arguments: `err` and `derivedKey`.
`err` is an exception object when key derivation fails, otherwise `err` is
`null`. `derivedKey` is passed to the callback as a [`Buffer`][`Buffer`].

An exception is thrown when any of the input arguments specify invalid values
or types.

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

<!-- YAML
added: v24.7.0
-->

> Stability: 1.2 - Release candidate

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Variant of Argon2, one of `"argon2d"`, `"argon2i"` or `"argon2id"`.
* `parameters` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) REQUIRED, this is the password for password
    hashing applications of Argon2.
  * `nonce` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) REQUIRED, must be at
    least 8 bytes long. This is the salt for password hashing applications of Argon2.
  * `parallelism` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, degree of parallelism determines how many computational chains (lanes)
    can be run. Must be greater than 1 and less than `2**24-1`.
  * `tagLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, the length of the key to generate. Must be greater than 4 and
    less than `2**32-1`.
  * `memory` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, memory cost in 1KiB blocks. Must be greater than
    `8 * parallelism` and less than `2**32-1`. The actual number of blocks is rounded
    down to the nearest multiple of `4 * parallelism`.
  * `passes` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) REQUIRED, number of passes (iterations). Must be greater than 1 and less
    than `2**32-1`.
  * `secret` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined OPTIONAL, Random additional input,
    similar to the salt, that should **NOT** be stored with the derived key. This is known as pepper in
    password hashing applications. If used, must have a length not greater than `2**32-1` bytes.
  * `associatedData` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | undefined OPTIONAL, Additional data to
    be added to the hash, functionally equivalent to salt or secret, but meant for
    non-random data. If used, must have a length not greater than `2**32-1` bytes.
* Возвращает: [`<Buffer>`](buffer.md#buffer)

Provides a synchronous [Argon2][argon2] implementation. Argon2 is a password-based
key derivation function that is designed to be expensive computationally and
memory-wise in order to make brute-force attacks unrewarding.

The `nonce` should be as unique as possible. It is recommended that a nonce is
random and at least 16 bytes long. See [NIST SP 800-132][NIST SP 800-132] for details.

When passing strings for `message`, `nonce`, `secret` or `associatedData`, please
consider [caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

An exception is thrown when key derivation fails, otherwise the derived key is
returned as a [`Buffer`][`Buffer`].

An exception is thrown when any of the input arguments specify invalid values
or types.

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

* `candidate` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
  A possible prime encoded as a sequence of big endian octets of arbitrary
  length.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `checks` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of Miller-Rabin probabilistic primality
    iterations to perform. When the value is `0` (zero), a number of checks
    is used that yields a false positive rate of at most 2<sup>-64</sup> for
    random input. Care must be used when selecting a number of checks. Refer
    to the OpenSSL documentation for the [`BN_is_prime_ex`][`BN_is_prime_ex`] function `nchecks`
    options for more details. **По умолчанию:** `0`
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Set to an [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) object if an error occurred during check.
  * `result` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the candidate is a prime with an error
    probability less than `0.25 ** options.checks`.

Checks the primality of the `candidate`.

### `crypto.checkPrimeSync(candidate[, options])`

<!-- YAML
added: v15.8.0
-->

* `candidate` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
  A possible prime encoded as a sequence of big endian octets of arbitrary
  length.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `checks` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of Miller-Rabin probabilistic primality
    iterations to perform. When the value is `0` (zero), a number of checks
    is used that yields a false positive rate of at most 2<sup>-64</sup> for
    random input. Care must be used when selecting a number of checks. Refer
    to the OpenSSL documentation for the [`BN_is_prime_ex`][`BN_is_prime_ex`] function `nchecks`
    options for more details. **По умолчанию:** `0`
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the candidate is a prime with an error
  probability less than `0.25 ** options.checks`.

Checks the primality of the `candidate`.

### `crypto.constants`

<!-- YAML
added: v6.3.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

An object containing commonly used constants for crypto and security related
operations. The specific constants currently defined are described in
[Crypto constants][Crypto constants].

### `crypto.createCipheriv(algorithm, key, iv[, options])`

<!-- YAML
added: v0.1.94
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62453
    description: Passing a CryptoKey as `key` is deprecated.
  - version:
    - v17.9.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42427
    description: The `authTagLength` option is now optional when using the
                 `chacha20-poly1305` cipher and defaults to 16 bytes.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The password and iv arguments can be an ArrayBuffer and are
                 each limited to a maximum of 2 ** 31 - 1 bytes.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `key` argument can now be a `KeyObject`.
  - version:
     - v11.2.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/24081
    description: The cipher `chacha20-poly1305` (the IETF variant of
                 ChaCha20-Poly1305) is now supported.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/21447
    description: Ciphers in OCB mode are now supported.
  - version: v10.2.0
    pr-url: https://github.com/nodejs/node/pull/20235
    description: The `authTagLength` option can now be used to produce shorter
                 authentication tags in GCM mode and defaults to 16 bytes.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/18644
    description: The `iv` parameter may now be `null` for ciphers which do not
                 need an initialization vector.
-->

Добавлено в: v0.1.94

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Передача CryptoKey в качестве «ключа» устарела. |
    | v17.9.0, v16.17.0 | Параметр authTagLength теперь является необязательным при использовании шифра chacha20-poly1305 и по умолчанию равен 16 байтам. |
    | v15.0.0 | Аргументы пароля и iv могут быть ArrayBuffer, и каждый из них ограничен максимум 2 ** 31 - 1 байтами. |
    | v11.6.0 | Аргумент `key` теперь может быть `KeyObject`. |
    | v11.2.0, v10.17.0 | Теперь поддерживается шифр chacha20-poly1305 (вариант IETF ChaCha20-Poly1305). |
    | v10.10.0 | Теперь поддерживаются шифры в режиме OCB. |
    | v10.2.0 | Опцию `authTagLength` теперь можно использовать для создания более коротких тегов аутентификации в режиме GCM; по умолчанию она равна 16 байтам. |
    | v9.9.0 | Параметр iv теперь может иметь значение null для шифров, которым не нужен вектор инициализации. |

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `iv` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | null
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
* Возвращает: [`<Cipheriv>`](crypto.md#class-cipheriv)

Creates and returns a `Cipheriv` object, with the given `algorithm`, `key` and
initialization vector (`iv`).

The `options` argument controls stream behavior and is optional except when a
cipher in CCM or OCB mode (e.g. `'aes-128-ccm'`) is used. In that case, the
`authTagLength` option is required and specifies the length of the
authentication tag in bytes, see [CCM mode][CCM mode]. In GCM mode, the `authTagLength`
option is not required but can be used to set the length of the authentication
tag that will be returned by `getAuthTag()` and defaults to 16 bytes.
For `chacha20-poly1305`, the `authTagLength` option defaults to 16 bytes.

The `algorithm` is dependent on OpenSSL, examples are `'aes192'`, etc. On
recent OpenSSL releases, `openssl list -cipher-algorithms` will
display the available cipher algorithms.

The `key` is the raw key used by the `algorithm` and `iv` is an
[initialization vector][initialization vector]. Both arguments must be `'utf8'` encoded strings,
[Buffers][`Buffer`], `TypedArray`, or `DataView`s. The `key` may optionally be
a [`KeyObject`][`KeyObject`] of type `secret`. If the cipher does not need
an initialization vector, `iv` may be `null`.

When passing strings for `key` or `iv`, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

Initialization vectors should be unpredictable and unique; ideally, they will be
cryptographically random. They do not have to be secret: IVs are typically just
added to ciphertext messages unencrypted. It may sound contradictory that
something has to be unpredictable and unique, but does not have to be secret;
remember that an attacker must not be able to predict ahead of time what a
given IV will be.

### `crypto.createDecipheriv(algorithm, key, iv[, options])`

<!-- YAML
added: v0.1.94
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62453
    description: Passing a CryptoKey as `key` is deprecated.
  - version:
    - v17.9.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42427
    description: The `authTagLength` option is now optional when using the
                 `chacha20-poly1305` cipher and defaults to 16 bytes.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `key` argument can now be a `KeyObject`.
  - version:
     - v11.2.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/24081
    description: The cipher `chacha20-poly1305` (the IETF variant of
                 ChaCha20-Poly1305) is now supported.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/21447
    description: Ciphers in OCB mode are now supported.
  - version: v10.2.0
    pr-url: https://github.com/nodejs/node/pull/20039
    description: The `authTagLength` option can now be used to restrict accepted
                 GCM authentication tag lengths.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/18644
    description: The `iv` parameter may now be `null` for ciphers which do not
                 need an initialization vector.
-->

Добавлено в: v0.1.94

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Передача CryptoKey в качестве «ключа» устарела. |
    | v17.9.0, v16.17.0 | Параметр authTagLength теперь является необязательным при использовании шифра chacha20-poly1305 и по умолчанию равен 16 байтам. |
    | v11.6.0 | Аргумент `key` теперь может быть `KeyObject`. |
    | v11.2.0, v10.17.0 | Теперь поддерживается шифр chacha20-poly1305 (вариант IETF ChaCha20-Poly1305). |
    | v10.10.0 | Теперь поддерживаются шифры в режиме OCB. |
    | v10.2.0 | Опцию `authTagLength` теперь можно использовать для ограничения длины принимаемых тегов аутентификации GCM. |
    | v9.9.0 | Параметр iv теперь может иметь значение null для шифров, которым не нужен вектор инициализации. |

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `iv` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | null
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
* Возвращает: [`<Decipheriv>`](crypto.md#class-decipheriv)

Creates and returns a `Decipheriv` object that uses the given `algorithm`, `key`
and initialization vector (`iv`).

The `options` argument controls stream behavior and is optional except when a
cipher in CCM or OCB mode (e.g. `'aes-128-ccm'`) is used. In that case, the
`authTagLength` option is required and specifies the length of the
authentication tag in bytes, see [CCM mode][CCM mode].
For AES-GCM and `chacha20-poly1305`, the `authTagLength` option defaults to 16
bytes and must be set to a different value if a different length is used.

The `algorithm` is dependent on OpenSSL, examples are `'aes192'`, etc. On
recent OpenSSL releases, `openssl list -cipher-algorithms` will
display the available cipher algorithms.

The `key` is the raw key used by the `algorithm` and `iv` is an
[initialization vector][initialization vector]. Both arguments must be `'utf8'` encoded strings,
[Buffers][`Buffer`], `TypedArray`, or `DataView`s. The `key` may optionally be
a [`KeyObject`][`KeyObject`] of type `secret`. If the cipher does not need
an initialization vector, `iv` may be `null`.

When passing strings for `key` or `iv`, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

Initialization vectors should be unpredictable and unique; ideally, they will be
cryptographically random. They do not have to be secret: IVs are typically just
added to ciphertext messages unencrypted. It may sound contradictory that
something has to be unpredictable and unique, but does not have to be secret;
remember that an attacker must not be able to predict ahead of time what a given
IV will be.

### `crypto.createDiffieHellman(prime[, primeEncoding][, generator][, generatorEncoding])`

<!-- YAML
added: v0.11.12
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12223
    description: The `prime` argument can be any `TypedArray` or `DataView` now.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11983
    description: The `prime` argument can be a `Uint8Array` now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default for the encoding parameters changed
                 from `binary` to `utf8`.
-->

Добавлено в: v0.11.12

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Аргументом Prime теперь может быть любой TypedArray или DataView. |
    | v8.0.0 | Аргумент `prime` теперь может быть `Uint8Array`. |
    | v6.0.0 | Значение по умолчанию для параметров кодирования изменено с «двоичного» на «utf8». |

* `prime` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `primeEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the `prime` string.
* `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
  **По умолчанию:** `2`
* `generatorEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The [encoding][encoding] of the `generator` string.
* Возвращает: [`<DiffieHellman>`](crypto.md)

Creates a `DiffieHellman` key exchange object using the supplied `prime` and an
optional specific `generator`.

The `generator` argument can be a number, string, or [`Buffer`][`Buffer`]. If
`generator` is not specified, the value `2` is used.

If `primeEncoding` is specified, `prime` is expected to be a string; otherwise
a [`Buffer`][`Buffer`], `TypedArray`, or `DataView` is expected.

If `generatorEncoding` is specified, `generator` is expected to be a string;
otherwise a number, [`Buffer`][`Buffer`], `TypedArray`, or `DataView` is expected.

### `crypto.createDiffieHellman(primeLength[, generator])`

<!-- YAML
added: v0.5.0
-->

* `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2`
* Возвращает: [`<DiffieHellman>`](crypto.md)

Creates a `DiffieHellman` key exchange object and generates a prime of
`primeLength` bits using an optional specific numeric `generator`.
If `generator` is not specified, the value `2` is used.

### `crypto.createDiffieHellmanGroup(name)`

<!-- YAML
added: v0.9.3
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<DiffieHellmanGroup>`](#class-diffiehellmangroup)

An alias for [`crypto.getDiffieHellman()`][`crypto.getDiffieHellman()`]

### `crypto.createECDH(curveName)`

<!-- YAML
added: v0.11.14
-->

* `curveName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<ECDH>`](crypto.md)

Creates an Elliptic Curve Diffie-Hellman (`ECDH`) key exchange object using a
predefined curve specified by the `curveName` string. Use
[`crypto.getCurves()`][`crypto.getCurves()`] to obtain a list of available curve names. On recent
OpenSSL releases, `openssl ecparam -list_curves` will also display the name
and description of each available elliptic curve.

### `crypto.createHash(algorithm[, options])`

<!-- YAML
added: v0.1.92
changes:
  - version: v12.8.0
    pr-url: https://github.com/nodejs/node/pull/28805
    description: The `outputLength` option was added for XOF hash functions.
-->

Добавлено в: v0.1.92

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v12.8.0 | Опция «outputLength» была добавлена ​​для хэш-функций XOF. |

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
* Возвращает: [`<Hash>`](crypto.md)

Creates and returns a `Hash` object that can be used to generate hash digests
using the given `algorithm`. Optional `options` argument controls stream
behavior. For XOF hash functions such as `'shake256'`, the `outputLength` option
can be used to specify the desired output length in bytes.

The `algorithm` is dependent on the available algorithms supported by the
version of OpenSSL on the platform. Examples are `'sha256'`, `'sha512'`, etc.
On recent releases of OpenSSL, `openssl list -digest-algorithms` will
display the available digest algorithms.

Example: generating the sha256 sum of a file

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

<!-- YAML
added: v0.1.94
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62453
    description: Passing a CryptoKey as `key` is deprecated.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer or CryptoKey. The
                 encoding option was added. The key cannot contain
                 more than 2 ** 32 - 1 bytes.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `key` argument can now be a `KeyObject`.
-->

Добавлено в: v0.1.94

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Передача CryptoKey в качестве «ключа» устарела. |
    | v15.0.0 | Ключ также может быть ArrayBuffer или CryptoKey. Добавлена ​​опция кодирования. Ключ не может содержать более 2**32 – 1 байт. |
    | v11.6.0 | Аргумент `key` теперь может быть `KeyObject`. |

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options][`stream.transform` options]
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding to use when `key` is a string.
* Возвращает: [`<Hmac>`](crypto.md)

Creates and returns an `Hmac` object that uses the given `algorithm` and `key`.
Optional `options` argument controls stream behavior.

The `algorithm` is dependent on the available algorithms supported by the
version of OpenSSL on the platform. Examples are `'sha256'`, `'sha512'`, etc.
On recent releases of OpenSSL, `openssl list -digest-algorithms` will
display the available digest algorithms.

The `key` is the HMAC key used to generate the cryptographic HMAC hash. If it is
a [`KeyObject`][`KeyObject`], its type must be `secret`. If it is a string, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs]. If it was
obtained from a cryptographically secure source of entropy, such as
[`crypto.randomBytes()`][`crypto.randomBytes()`] or [`crypto.generateKey()`][`crypto.generateKey()`], its length should not
exceed the block size of `algorithm` (e.g., 512 bits for SHA-256).

Example: generating the sha256 HMAC of a file

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

<!-- YAML
added: v11.6.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62453
    description: Passing a CryptoKey as `key` is deprecated.
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62240
    description: Added support for `'raw-private'` and `'raw-seed'`
                 formats.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA keys.
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37254
    description: The key can also be a JWK object.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer. The encoding option was
                 added. The key cannot contain more than 2 ** 32 - 1 bytes.
-->

Добавлено в: v11.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Передача CryptoKey в качестве «ключа» устарела. |
    | REPLACEME | Добавлена ​​поддержка форматов «raw-private» и «raw-seed». |
    | v24.6.0 | Добавьте поддержку ключей ML-DSA. |
    | v15.12.0 | Ключ также может быть объектом JWK. |
    | v15.0.0 | Ключ также может быть ArrayBuffer. Добавлена ​​опция кодирования. Ключ не может содержать более 2**32 – 1 байт. |

<!--lint disable maximum-line-length remark-lint-->

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
  * `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The key
    material, either in PEM, DER, JWK, or raw format.
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'pem'`, `'der'`, `'jwk'`, `'raw-private'`,
    or `'raw-seed'`. **По умолчанию:** `'pem'`.
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'pkcs1'`, `'pkcs8'` or `'sec1'`. This option is
    required only if the `format` is `'der'` and ignored otherwise.
  * `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) The passphrase to use for decryption.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding to use when `key` is a string.
  * `asymmetricKeyType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Required when `format` is `'raw-private'`
    or `'raw-seed'` and ignored otherwise.
    Must be a [supported key type][asymmetric key types].
  * `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the curve to use. Required when
    `asymmetricKeyType` is `'ec'` and ignored otherwise.
* Возвращает: [`<KeyObject>`](#class-keyobject)

<!--lint enable maximum-line-length remark-lint-->

Creates and returns a new key object containing a private key. If `key` is a
string or `Buffer`, `format` is assumed to be `'pem'`; otherwise, `key`
must be an object with the properties described above.

If the private key is encrypted, a `passphrase` must be specified. The length
of the passphrase is limited to 1024 bytes.

### `crypto.createPublicKey(key)`

<!-- YAML
added: v11.6.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62453
    description: Passing a CryptoKey as `key` is deprecated.
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62240
    description: Added support for `'raw-public'` format.
  - version: v24.6.0
    pr-url: https://github.com/nodejs/node/pull/59259
    description: Add support for ML-DSA keys.
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37254
    description: The key can also be a JWK object.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer. The encoding option was
                 added. The key cannot contain more than 2 ** 32 - 1 bytes.
  - version: v11.13.0
    pr-url: https://github.com/nodejs/node/pull/26278
    description: The `key` argument can now be a `KeyObject` with type
                 `private`.
  - version: v11.7.0
    pr-url: https://github.com/nodejs/node/pull/25217
    description: The `key` argument can now be a private key.
-->

Добавлено в: v11.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Передача CryptoKey в качестве «ключа» устарела. |
    | REPLACEME | Добавлена ​​поддержка формата raw-public. |
    | v24.6.0 | Добавьте поддержку ключей ML-DSA. |
    | v15.12.0 | Ключ также может быть объектом JWK. |
    | v15.0.0 | Ключ также может быть ArrayBuffer. Добавлена ​​опция кодирования. Ключ не может содержать более 2**32 – 1 байт. |
    | v11.13.0 | Аргумент `key` теперь может быть `KeyObject` с типом `private`. |
    | v11.7.0 | Аргумент `key` теперь может быть закрытым ключом. |

<!--lint disable maximum-line-length remark-lint-->

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
  * `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The key
    material, either in PEM, DER, JWK, or raw format.
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'pem'`, `'der'`, `'jwk'`, or `'raw-public'`.
    **По умолчанию:** `'pem'`.
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'pkcs1'` or `'spki'`. This option is
    required only if the `format` is `'der'` and ignored otherwise.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding to use when `key` is a string.
  * `asymmetricKeyType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Required when `format` is `'raw-public'`
    and ignored otherwise.
    Must be a [supported key type][asymmetric key types].
  * `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the curve to use. Required when
    `asymmetricKeyType` is `'ec'` and ignored otherwise.
* Возвращает: [`<KeyObject>`](#class-keyobject)

<!--lint enable maximum-line-length remark-lint-->

Creates and returns a new key object containing a public key. If `key` is a
string or `Buffer`, `format` is assumed to be `'pem'`; if `key` is a `KeyObject`
with type `'private'`, the public key is derived from the given private key;
otherwise, `key` must be an object with the properties described above.

If the format is `'pem'`, the `'key'` may also be an X.509 certificate.

Because public keys can be derived from private keys, a private key may be
passed instead of a public key. In that case, this function behaves as if
[`crypto.createPrivateKey()`][`crypto.createPrivateKey()`] had been called, except that the type of the
returned `KeyObject` will be `'public'` and that the private key cannot be
extracted from the returned `KeyObject`. Similarly, if a `KeyObject` with type
`'private'` is given, a new `KeyObject` with type `'public'` will be returned
and it will be impossible to extract the private key from the returned object.

### `crypto.createSecretKey(key[, encoding])`

<!-- YAML
added: v11.6.0
changes:
  - version:
    - v18.8.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/44201
    description: The key can now be zero-length.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer or string. The encoding
                 argument was added. The key cannot contain more than
                 2 ** 32 - 1 bytes.
-->

Добавлено в: v11.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.8.0, v16.18.0 | Ключ теперь может иметь нулевую длину. |
    | v15.0.0 | Ключ также может быть ArrayBuffer или строкой. Был добавлен аргумент кодирования. Ключ не может содержать более 2**32 – 1 байт. |

* `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding when `key` is a string.
* Возвращает: [`<KeyObject>`](#class-keyobject)

Creates and returns a new key object containing a secret key for symmetric
encryption or `Hmac`.

### `crypto.createSign(algorithm[, options])`

<!-- YAML
added: v0.1.92
-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.Writable` options][`stream.Writable` options]
* Возвращает: [`<Sign>`](#class-sign)

Creates and returns a `Sign` object that uses the given `algorithm`. Use
[`crypto.getHashes()`][`crypto.getHashes()`] to obtain the names of the available digest algorithms.
Optional `options` argument controls the `stream.Writable` behavior.

In some cases, a `Sign` instance can be created using the name of a signature
algorithm, such as `'RSA-SHA256'`, instead of a digest algorithm. This will use
the corresponding digest algorithm. This does not work for all signature
algorithms, such as `'ecdsa-with-SHA256'`, so it is best to always use digest
algorithm names.

### `crypto.createVerify(algorithm[, options])`

<!-- YAML
added: v0.1.92
-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.Writable` options][`stream.Writable` options]
* Возвращает: [`<Verify>`](#class-verify)

Creates and returns a `Verify` object that uses the given algorithm.
Use [`crypto.getHashes()`][`crypto.getHashes()`] to obtain an array of names of the available
signing algorithms. Optional `options` argument controls the
`stream.Writable` behavior.

In some cases, a `Verify` instance can be created using the name of a signature
algorithm, such as `'RSA-SHA256'`, instead of a digest algorithm. This will use
the corresponding digest algorithm. This does not work for all signature
algorithms, such as `'ecdsa-with-SHA256'`, so it is best to always use digest
algorithm names.

### `crypto.decapsulate(key, ciphertext[, callback])`

<!-- YAML
added: v24.7.0
-->

> Stability: 1.2 - Release candidate

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) Private Key
* `ciphertext` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `sharedKey` [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Buffer>`](buffer.md#buffer) if the `callback` function is not provided.

<!--lint enable maximum-line-length remark-lint-->

Key decapsulation using a KEM algorithm with a private key.

Supported key types and their KEM algorithms are:

* `'rsa'`[^openssl30] RSA Secret Value Encapsulation
* `'ec'`[^openssl32] DHKEM(P-256, HKDF-SHA256), DHKEM(P-384, HKDF-SHA256), DHKEM(P-521, HKDF-SHA256)
* `'x25519'`[^openssl32] DHKEM(X25519, HKDF-SHA256)
* `'x448'`[^openssl32] DHKEM(X448, HKDF-SHA512)
* `'ml-kem-512'`[^openssl35] ML-KEM
* `'ml-kem-768'`[^openssl35] ML-KEM
* `'ml-kem-1024'`[^openssl35] ML-KEM

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if `key` had been
passed to [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`].

If the `callback` function is provided this function uses libuv's threadpool.

### `crypto.diffieHellman(options[, callback])`

<!-- YAML
added:
 - v13.9.0
 - v12.17.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62527
    description: Accept key data in addition to KeyObject instances.
  - version: v23.11.0
    pr-url: https://github.com/nodejs/node/pull/57274
    description: Optional callback argument added.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Принимайте ключевые данные в дополнение к экземплярам KeyObject. |
    | v23.11.0 | Добавлен необязательный аргумент обратного вызова. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject)
  * `publicKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `secret` [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Buffer>`](buffer.md#buffer) if the `callback` function is not provided.

Computes the Diffie-Hellman shared secret based on a `privateKey` and a `publicKey`.
Both keys must represent the same asymmetric key type and must support either the DH or
ECDH operation.

If `options.privateKey` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`options.privateKey` had been passed to [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`].

If `options.publicKey` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`options.publicKey` had been passed to [`crypto.createPublicKey()`][`crypto.createPublicKey()`].

If the `callback` function is provided this function uses libuv's threadpool.

### `crypto.encapsulate(key[, callback])`

<!-- YAML
added: v24.7.0
-->

> Stability: 1.2 - Release candidate

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) Public Key
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `result` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `sharedKey` [`<Buffer>`](buffer.md#buffer)
    * `ciphertext` [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) if the `callback` function is not provided.
  * `sharedKey` [`<Buffer>`](buffer.md#buffer)
  * `ciphertext` [`<Buffer>`](buffer.md#buffer)

<!--lint enable maximum-line-length remark-lint-->

Key encapsulation using a KEM algorithm with a public key.

Supported key types and their KEM algorithms are:

* `'rsa'`[^openssl30] RSA Secret Value Encapsulation
* `'ec'`[^openssl32] DHKEM(P-256, HKDF-SHA256), DHKEM(P-384, HKDF-SHA256), DHKEM(P-521, HKDF-SHA256)
* `'x25519'`[^openssl32] DHKEM(X25519, HKDF-SHA256)
* `'x448'`[^openssl32] DHKEM(X448, HKDF-SHA512)
* `'ml-kem-512'`[^openssl35] ML-KEM
* `'ml-kem-768'`[^openssl35] ML-KEM
* `'ml-kem-1024'`[^openssl35] ML-KEM

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if `key` had been
passed to [`crypto.createPublicKey()`][`crypto.createPublicKey()`].

If the `callback` function is provided this function uses libuv's threadpool.

### `crypto.fips`

<!-- YAML
added: v6.0.0
deprecated: v10.0.0
-->

> Stability: 0 - Deprecated

Property for checking and controlling whether a FIPS compliant crypto provider
is currently in use. Setting to true requires a FIPS build of Node.js.

This property is deprecated. Please use `crypto.setFips()` and
`crypto.getFips()` instead.

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

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The intended use of the generated secret key. Currently
  accepted values are `'hmac'` and `'aes'`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The bit length of the key to generate. This must be a
    value greater than 0.
    * If `type` is `'hmac'`, the minimum is 8, and the maximum length is
      2<sup>31</sup>-1. If the value is not a multiple of 8, the generated
      key will be truncated to `Math.floor(length / 8)`.
    * If `type` is `'aes'`, the length must be one of `128`, `192`, or `256`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `key` [`<KeyObject>`](#class-keyobject)

Asynchronously generates a new random secret key of the given `length`. The
`type` will determine which validations will be performed on the `length`.

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

The size of a generated HMAC key should not exceed the block size of the
underlying hash function. See [`crypto.createHmac()`][`crypto.createHmac()`] for more information.

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

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The asymmetric key type to generate. See the
  supported [asymmetric key types][asymmetric key types].
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `modulusLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Key size in bits (RSA, DSA).
  * `publicExponent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Public exponent (RSA). **По умолчанию:** `0x10001`.
  * `hashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest (RSA-PSS).
  * `mgf1HashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest used by
    MGF1 (RSA-PSS).
  * `saltLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Minimal salt length in bytes (RSA-PSS).
  * `divisorLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Size of `q` in bits (DSA).
  * `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the curve to use (EC).
  * `prime` [`<Buffer>`](buffer.md#buffer) The prime parameter (DH).
  * `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Prime length in bits (DH).
  * `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Custom generator (DH). **По умолчанию:** `2`.
  * `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Diffie-Hellman group name (DH). See
    [`crypto.getDiffieHellman()`][`crypto.getDiffieHellman()`].
  * `paramEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'named'` or `'explicit'` (EC).
    **По умолчанию:** `'named'`.
  * `publicKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`][`keyObject.export()`].
  * `privateKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`][`keyObject.export()`].
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)
  * `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)

Generates a new asymmetric key pair of the given `type`. See the
supported [asymmetric key types][asymmetric key types].

If a `publicKeyEncoding` or `privateKeyEncoding` was specified, this function
behaves as if [`keyObject.export()`][`keyObject.export()`] had been called on its result. Otherwise,
the respective part of the key is returned as a [`KeyObject`][`KeyObject`].

It is recommended to encode public keys as `'spki'` and private keys as
`'pkcs8'` with encryption for long-term storage:

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

On completion, `callback` will be called with `err` set to `undefined` and
`publicKey` / `privateKey` representing the generated key pair.

If this method is invoked as its [`util.promisify()`][`util.promisify()`]ed version, it returns
a `Promise` for an `Object` with `publicKey` and `privateKey` properties.

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

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The asymmetric key type to generate. See the
  supported [asymmetric key types][asymmetric key types].
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `modulusLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Key size in bits (RSA, DSA).
  * `publicExponent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Public exponent (RSA). **По умолчанию:** `0x10001`.
  * `hashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest (RSA-PSS).
  * `mgf1HashAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the message digest used by
    MGF1 (RSA-PSS).
  * `saltLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Minimal salt length in bytes (RSA-PSS).
  * `divisorLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Size of `q` in bits (DSA).
  * `namedCurve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Name of the curve to use (EC).
  * `prime` [`<Buffer>`](buffer.md#buffer) The prime parameter (DH).
  * `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Prime length in bits (DH).
  * `generator` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Custom generator (DH). **По умолчанию:** `2`.
  * `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Diffie-Hellman group name (DH). See
    [`crypto.getDiffieHellman()`][`crypto.getDiffieHellman()`].
  * `paramEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be `'named'` or `'explicit'` (EC).
    **По умолчанию:** `'named'`.
  * `publicKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`][`keyObject.export()`].
  * `privateKeyEncoding` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) See [`keyObject.export()`][`keyObject.export()`].
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `publicKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)
  * `privateKey` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<KeyObject>`](#class-keyobject)

Generates a new asymmetric key pair of the given `type`. See the
supported [asymmetric key types][asymmetric key types].

If a `publicKeyEncoding` or `privateKeyEncoding` was specified, this function
behaves as if [`keyObject.export()`][`keyObject.export()`] had been called on its result. Otherwise,
the respective part of the key is returned as a [`KeyObject`][`KeyObject`].

When encoding public keys, it is recommended to use `'spki'`. When encoding
private keys, it is recommended to use `'pkcs8'` with a strong passphrase,
and to keep the passphrase confidential.

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

The return value `{ publicKey, privateKey }` represents the generated key pair.
When PEM encoding was selected, the respective key will be a string, otherwise
it will be a buffer containing the data encoded as DER.

### `crypto.generateKeySync(type, options)`

<!-- YAML
added: v15.0.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The intended use of the generated secret key. Currently
  accepted values are `'hmac'` and `'aes'`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The bit length of the key to generate.
    * If `type` is `'hmac'`, the minimum is 8, and the maximum length is
      2<sup>31</sup>-1. If the value is not a multiple of 8, the generated
      key will be truncated to `Math.floor(length / 8)`.
    * If `type` is `'aes'`, the length must be one of `128`, `192`, or `256`.
* Возвращает: [`<KeyObject>`](#class-keyobject)

Synchronously generates a new random secret key of the given `length`. The
`type` will determine which validations will be performed on the `length`.

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

The size of a generated HMAC key should not exceed the block size of the
underlying hash function. See [`crypto.createHmac()`][`crypto.createHmac()`] for more information.

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

* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The size (in bits) of the prime to generate.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `add` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
  * `rem` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
  * `safe` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
  * `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, the generated prime is returned
    as a `bigint`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `prime` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Generates a pseudorandom prime of `size` bits.

If `options.safe` is `true`, the prime will be a safe prime -- that is,
`(prime - 1) / 2` will also be a prime.

The `options.add` and `options.rem` parameters can be used to enforce additional
requirements, e.g., for Diffie-Hellman:

* If `options.add` and `options.rem` are both set, the prime will satisfy the
  condition that `prime % add = rem`.
* If only `options.add` is set and `options.safe` is not `true`, the prime will
  satisfy the condition that `prime % add = 1`.
* If only `options.add` is set and `options.safe` is set to `true`, the prime
  will instead satisfy the condition that `prime % add = 3`. This is necessary
  because `prime % add = 1` for `options.add > 2` would contradict the condition
  enforced by `options.safe`.
* `options.rem` is ignored if `options.add` is not given.

Both `options.add` and `options.rem` must be encoded as big-endian sequences
if given as an `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer`, or
`DataView`.

By default, the prime is encoded as a big-endian sequence of octets
in an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). If the `bigint` option is `true`, then a [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
is provided.

The `size` of the prime will have a direct impact on how long it takes to
generate the prime. The larger the size, the longer it will take. Because
we use OpenSSL's `BN_generate_prime_ex` function, which provides only
minimal control over our ability to interrupt the generation process,
it is not recommended to generate overly large primes, as doing so may make
the process unresponsive.

### `crypto.generatePrimeSync(size[, options])`

<!-- YAML
added: v15.8.0
-->

* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The size (in bits) of the prime to generate.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `add` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
  * `rem` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<SharedArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<Buffer>`](buffer.md#buffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
  * `safe` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
  * `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, the generated prime is returned
    as a `bigint`.
* Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Generates a pseudorandom prime of `size` bits.

If `options.safe` is `true`, the prime will be a safe prime -- that is,
`(prime - 1) / 2` will also be a prime.

The `options.add` and `options.rem` parameters can be used to enforce additional
requirements, e.g., for Diffie-Hellman:

* If `options.add` and `options.rem` are both set, the prime will satisfy the
  condition that `prime % add = rem`.
* If only `options.add` is set and `options.safe` is not `true`, the prime will
  satisfy the condition that `prime % add = 1`.
* If only `options.add` is set and `options.safe` is set to `true`, the prime
  will instead satisfy the condition that `prime % add = 3`. This is necessary
  because `prime % add = 1` for `options.add > 2` would contradict the condition
  enforced by `options.safe`.
* `options.rem` is ignored if `options.add` is not given.

Both `options.add` and `options.rem` must be encoded as big-endian sequences
if given as an `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer`, or
`DataView`.

By default, the prime is encoded as a big-endian sequence of octets
in an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). If the `bigint` option is `true`, then a [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)
is provided.

The `size` of the prime will have a direct impact on how long it takes to
generate the prime. The larger the size, the longer it will take. Because
we use OpenSSL's `BN_generate_prime_ex` function, which provides only
minimal control over our ability to interrupt the generation process,
it is not recommended to generate overly large primes, as doing so may make
the process unresponsive.

### `crypto.getCipherInfo(nameOrNid[, options])`

<!-- YAML
added: v15.0.0
-->

* `nameOrNid` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The name or nid of the cipher to query.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `keyLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A test key length.
  * `ivLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A test IV length.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The name of the cipher
  * `nid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nid of the cipher
  * `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The block size of the cipher in bytes. This property
    is omitted when `mode` is `'stream'`.
  * `ivLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The expected or default initialization vector length in
    bytes. This property is omitted if the cipher does not use an initialization
    vector.
  * `keyLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The expected or default key length in bytes.
  * `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The cipher mode. One of `'cbc'`, `'ccm'`, `'cfb'`, `'ctr'`,
    `'ecb'`, `'gcm'`, `'ocb'`, `'ofb'`, `'stream'`, `'wrap'`, `'xts'`.

Returns information about a given cipher.

Some ciphers accept variable length keys and initialization vectors. By default,
the `crypto.getCipherInfo()` method will return the default values for these
ciphers. To test if a given key length or iv length is acceptable for given
cipher, use the `keyLength` and `ivLength` options. If the given values are
unacceptable, `undefined` will be returned.

### `crypto.getCiphers()`

<!-- YAML
added: v0.9.3
-->

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array with the names of the supported cipher
  algorithms.

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

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array with the names of the supported elliptic curves.

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

* `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<DiffieHellmanGroup>`](#class-diffiehellmangroup)

Creates a predefined `DiffieHellmanGroup` key exchange object. The
supported groups are listed in the documentation for [`DiffieHellmanGroup`][`DiffieHellmanGroup`].

The returned object mimics the interface of objects created by
[`crypto.createDiffieHellman()`][`crypto.createDiffieHellman()`], but will not allow changing
the keys (with [`diffieHellman.setPublicKey()`][`diffieHellman.setPublicKey()`], for example). The
advantage of using this method is that the parties do not have to
generate nor exchange a group modulus beforehand, saving both processor
and communication time.

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

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `1` if and only if a FIPS compliant crypto provider is
  currently in use, `0` otherwise. A future semver-major release may change
  the return type of this API to a [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

### `crypto.getHashes()`

<!-- YAML
added: v0.9.3
-->

* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An array of the names of the supported hash algorithms,
  such as `'RSA-SHA256'`. Hash algorithms are also called "digest" algorithms.

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

* `typedArray` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) Returns `typedArray`.

A convenient alias for [`crypto.webcrypto.getRandomValues()`][`crypto.webcrypto.getRandomValues()`]. This
implementation is not compliant with the Web Crypto spec, to write
web-compatible code use [`crypto.webcrypto.getRandomValues()`][`crypto.webcrypto.getRandomValues()`] instead.

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

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined
* `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) When `data` is a
  string, it will be encoded as UTF-8 before being hashed. If a different
  input encoding is desired for a string input, user could encode the string
  into a `TypedArray` using either `TextEncoder` or `Buffer.from()` and passing
  the encoded `TypedArray` into this API instead.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Encoding][encoding] used to encode the
    returned digest. **По умолчанию:** `'hex'`.
  * `outputLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) For XOF hash functions such as 'shake256',
    the outputLength option can be used to specify the desired output length in bytes.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

A utility for creating one-shot hash digests of data. It can be faster than
the object-based `crypto.createHash()` when hashing a smaller amount of data
(<= 5MB) that's readily available. If the data can be big or if it is streamed,
it's still recommended to use `crypto.createHash()` instead.

The `algorithm` is dependent on the available algorithms supported by the
version of OpenSSL on the platform. Examples are `'sha256'`, `'sha512'`, etc.
On recent releases of OpenSSL, `openssl list -digest-algorithms` will
display the available digest algorithms.

If `options` is a string, then it specifies the `outputEncoding`.

Example:

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

* `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The digest algorithm to use.
* `ikm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) The input
  keying material. Must be provided but can be zero-length.
* `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The salt value. Must
  be provided but can be zero-length.
* `info` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Additional info value.
  Must be provided but can be zero-length, and cannot be more than 1024 bytes.
* `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The length of the key to generate. Must be greater than 0.
  The maximum allowable value is `255` times the number of bytes produced by
  the selected digest function (e.g. `sha512` generates 64-byte hashes, making
  the maximum HKDF output 16320 bytes).
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `derivedKey` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

HKDF is a simple key derivation function defined in RFC 5869. The given `ikm`,
`salt` and `info` are used with the `digest` to derive a key of `keylen` bytes.

The supplied `callback` function is called with two arguments: `err` and
`derivedKey`. If an errors occurs while deriving the key, `err` will be set;
otherwise `err` will be `null`. The successfully generated `derivedKey` will
be passed to the callback as an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). An error will be thrown if any
of the input arguments specify invalid values or types.

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

* `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The digest algorithm to use.
* `ikm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) The input
  keying material. Must be provided but can be zero-length.
* `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The salt value. Must
  be provided but can be zero-length.
* `info` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Additional info value.
  Must be provided but can be zero-length, and cannot be more than 1024 bytes.
* `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The length of the key to generate. Must be greater than 0.
  The maximum allowable value is `255` times the number of bytes produced by
  the selected digest function (e.g. `sha512` generates 64-byte hashes, making
  the maximum HKDF output 16320 bytes).
* Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Provides a synchronous HKDF key derivation function as defined in RFC 5869. The
given `ikm`, `salt` and `info` are used with the `digest` to derive a key of
`keylen` bytes.

The successfully generated `derivedKey` will be returned as an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

An error will be thrown if any of the input arguments specify invalid values or
types, or if the derived key cannot be generated.

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

* `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `iterations` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `derivedKey` [`<Buffer>`](buffer.md#buffer)

Provides an asynchronous Password-Based Key Derivation Function 2 (PBKDF2)
implementation. A selected HMAC digest algorithm specified by `digest` is
applied to derive a key of the requested byte length (`keylen`) from the
`password`, `salt` and `iterations`.

The supplied `callback` function is called with two arguments: `err` and
`derivedKey`. If an error occurs while deriving the key, `err` will be set;
otherwise `err` will be `null`. By default, the successfully generated
`derivedKey` will be passed to the callback as a [`Buffer`][`Buffer`]. An error will be
thrown if any of the input arguments specify invalid values or types.

The `iterations` argument must be a number set as high as possible. The
higher the number of iterations, the more secure the derived key will be,
but will take a longer amount of time to complete.

The `salt` should be as unique as possible. It is recommended that a salt is
random and at least 16 bytes long. See [NIST SP 800-132][NIST SP 800-132] for details.

When passing strings for `password` or `salt`, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

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

An array of supported digest functions can be retrieved using
[`crypto.getHashes()`][`crypto.getHashes()`].

This API uses libuv's threadpool, which can have surprising and
negative performance implications for some applications; see the
[`UV_THREADPOOL_SIZE`][`UV_THREADPOOL_SIZE`] documentation for more information.

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

* `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `iterations` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<Buffer>`](buffer.md#buffer)

Provides a synchronous Password-Based Key Derivation Function 2 (PBKDF2)
implementation. A selected HMAC digest algorithm specified by `digest` is
applied to derive a key of the requested byte length (`keylen`) from the
`password`, `salt` and `iterations`.

If an error occurs an `Error` will be thrown, otherwise the derived key will be
returned as a [`Buffer`][`Buffer`].

The `iterations` argument must be a number set as high as possible. The
higher the number of iterations, the more secure the derived key will be,
but will take a longer amount of time to complete.

The `salt` should be as unique as possible. It is recommended that a salt is
random and at least 16 bytes long. See [NIST SP 800-132][NIST SP 800-132] for details.

When passing strings for `password` or `salt`, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

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

An array of supported digest functions can be retrieved using
[`crypto.getHashes()`][`crypto.getHashes()`].

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

* `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
  * `oaepHash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The hash function to use for OAEP padding and MGF1.
    **По умолчанию:** `'sha1'`
  * `oaepLabel` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The label to
    use for OAEP padding. If not specified, no label is used.
  * `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) An optional padding value defined in
    `crypto.constants`, which may be: `crypto.constants.RSA_NO_PADDING`,
    `crypto.constants.RSA_PKCS1_PADDING`, or
    `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [`<Buffer>`](buffer.md#buffer) A new `Buffer` with the decrypted content.

<!--lint enable maximum-line-length remark-lint-->

Decrypts `buffer` with `privateKey`. `buffer` was previously encrypted using
the corresponding public key, for example using [`crypto.publicEncrypt()`][`crypto.publicEncrypt()`].

If `privateKey` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`privateKey` had been passed to [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`]. If it is an
object, the `padding` property can be passed. Otherwise, this function uses
`RSA_PKCS1_OAEP_PADDING`.

Using `crypto.constants.RSA_PKCS1_PADDING` in [`crypto.privateDecrypt()`][`crypto.privateDecrypt()`]
requires OpenSSL to support implicit rejection (`rsa_pkcs1_implicit_rejection`).
If the version of OpenSSL used by Node.js does not support this feature,
attempting to use `RSA_PKCS1_PADDING` will fail.

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

* `privateKey` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
  * `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    A PEM encoded private key.
  * `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) An optional
    passphrase for the private key.
  * `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) An optional padding value defined in
    `crypto.constants`, which may be: `crypto.constants.RSA_NO_PADDING` or
    `crypto.constants.RSA_PKCS1_PADDING`.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding to use when `buffer`, `key`,
    or `passphrase` are strings.
* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [`<Buffer>`](buffer.md#buffer) A new `Buffer` with the encrypted content.

<!--lint enable maximum-line-length remark-lint-->

Encrypts `buffer` with `privateKey`. The returned data can be decrypted using
the corresponding public key, for example using [`crypto.publicDecrypt()`][`crypto.publicDecrypt()`].

If `privateKey` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`privateKey` had been passed to [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`]. If it is an
object, the `padding` property can be passed. Otherwise, this function uses
`RSA_PKCS1_PADDING`.

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

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
  * `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) An optional
    passphrase for the private key.
  * `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) An optional padding value defined in
    `crypto.constants`, which may be: `crypto.constants.RSA_NO_PADDING` or
    `crypto.constants.RSA_PKCS1_PADDING`.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding to use when `buffer`, `key`,
    or `passphrase` are strings.
* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [`<Buffer>`](buffer.md#buffer) A new `Buffer` with the decrypted content.

<!--lint enable maximum-line-length remark-lint-->

Decrypts `buffer` with `key`.`buffer` was previously encrypted using
the corresponding private key, for example using [`crypto.privateEncrypt()`][`crypto.privateEncrypt()`].

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`key` had been passed to [`crypto.createPublicKey()`][`crypto.createPublicKey()`]. If it is an
object, the `padding` property can be passed. Otherwise, this function uses
`RSA_PKCS1_PADDING`.

Because RSA public keys can be derived from private keys, a private key may
be passed instead of a public key.

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

* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
  * `key` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
    A PEM encoded public or private key, [KeyObject](#class-keyobject), or [CryptoKey](webcrypto.md#class-cryptokey).
  * `oaepHash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The hash function to use for OAEP padding and MGF1.
    **По умолчанию:** `'sha1'`
  * `oaepLabel` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The label to
    use for OAEP padding. If not specified, no label is used.
  * `passphrase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) An optional
    passphrase for the private key.
  * `padding` [`<crypto.constants>`](crypto.md#cryptoconstants) An optional padding value defined in
    `crypto.constants`, which may be: `crypto.constants.RSA_NO_PADDING`,
    `crypto.constants.RSA_PKCS1_PADDING`, or
    `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string encoding to use when `buffer`, `key`,
    `oaepLabel`, or `passphrase` are strings.
* `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [`<Buffer>`](buffer.md#buffer) A new `Buffer` with the encrypted content.

<!--lint enable maximum-line-length remark-lint-->

Encrypts the content of `buffer` with `key` and returns a new
[`Buffer`][`Buffer`] with encrypted content. The returned data can be decrypted using
the corresponding private key, for example using [`crypto.privateDecrypt()`][`crypto.privateDecrypt()`].

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if
`key` had been passed to [`crypto.createPublicKey()`][`crypto.createPublicKey()`]. If it is an
object, the `padding` property can be passed. Otherwise, this function uses
`RSA_PKCS1_OAEP_PADDING`.

Because RSA public keys can be derived from private keys, a private key may
be passed instead of a public key.

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

* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes to generate.  The `size` must
  not be larger than `2**31 - 1`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `buf` [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Buffer>`](buffer.md#buffer) if the `callback` function is not provided.

Generates cryptographically strong pseudorandom data. The `size` argument
is a number indicating the number of bytes to generate.

If a `callback` function is provided, the bytes are generated asynchronously
and the `callback` function is invoked with two arguments: `err` and `buf`.
If an error occurs, `err` will be an `Error` object; otherwise it is `null`. The
`buf` argument is a [`Buffer`][`Buffer`] containing the generated bytes.

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

If the `callback` function is not provided, the random bytes are generated
synchronously and returned as a [`Buffer`][`Buffer`]. An error will be thrown if
there is a problem generating the bytes.

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

The `crypto.randomBytes()` method will not complete until there is
sufficient entropy available.
This should normally never take longer than a few milliseconds. The only time
when generating the random bytes may conceivably block for a longer period of
time is right after boot, when the whole system is still low on entropy.

This API uses libuv's threadpool, which can have surprising and
negative performance implications for some applications; see the
[`UV_THREADPOOL_SIZE`][`UV_THREADPOOL_SIZE`] documentation for more information.

The asynchronous version of `crypto.randomBytes()` is carried out in a single
threadpool request. To minimize threadpool task length variation, partition
large `randomBytes` requests when doing so as part of fulfilling a client
request.

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

* `buffer` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Must be supplied. The
  size of the provided `buffer` must not be larger than `2**31 - 1`.
* `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.length - offset`. The `size` must
  not be larger than `2**31 - 1`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `function(err, buf) {}`.

This function is similar to [`crypto.randomBytes()`][`crypto.randomBytes()`] but requires the first
argument to be a [`Buffer`][`Buffer`] that will be filled. It also
requires that a callback is passed in.

If the `callback` function is not provided, an error will be thrown.

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

Any `ArrayBuffer`, `TypedArray`, or `DataView` instance may be passed as
`buffer`.

While this includes instances of `Float32Array` and `Float64Array`, this
function should not be used to generate random floating-point numbers. The
result may contain `+Infinity`, `-Infinity`, and `NaN`, and even if the array
contains finite numbers only, they are not drawn from a uniform random
distribution and have no meaningful lower or upper bounds.

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

This API uses libuv's threadpool, which can have surprising and
negative performance implications for some applications; see the
[`UV_THREADPOOL_SIZE`][`UV_THREADPOOL_SIZE`] documentation for more information.

The asynchronous version of `crypto.randomFill()` is carried out in a single
threadpool request. To minimize threadpool task length variation, partition
large `randomFill` requests when doing so as part of fulfilling a client
request.

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

* `buffer` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Must be supplied. The
  size of the provided `buffer` must not be larger than `2**31 - 1`.
* `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.length - offset`. The `size` must
  not be larger than `2**31 - 1`.
* Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The object passed as
  `buffer` argument.

Synchronous version of [`crypto.randomFill()`][`crypto.randomFill()`].

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

Any `ArrayBuffer`, `TypedArray` or `DataView` instance may be passed as
`buffer`.

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

* `min` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Start of random range (inclusive). **По умолчанию:** `0`.
* `max` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) End of random range (exclusive).
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `function(err, n) {}`.

Return a random integer `n` such that `min <= n < max`.  This
implementation avoids [modulo bias][modulo bias].

The range (`max - min`) must be less than 2<sup>48</sup>. `min` and `max` must
be [safe integers][safe integers].

If the `callback` function is not provided, the random integer is
generated synchronously.

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

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `disableEntropyCache` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) By default, to improve performance,
    Node.js generates and caches enough
    random data to generate up to 128 random UUIDs. To generate a UUID
    without using the cache, set `disableEntropyCache` to `true`.
    **По умолчанию:** `false`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Generates a random [RFC 4122][RFC 4122] version 4 UUID. The UUID is generated using a
cryptographic pseudorandom number generator.

### `crypto.randomUUIDv7([options])`

<!-- YAML
added: REPLACEME
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `disableEntropyCache` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) By default, to improve performance,
    Node.js generates and caches enough
    random data to generate up to 128 random UUIDs. To generate a UUID
    without using the cache, set `disableEntropyCache` to `true`.
    **По умолчанию:** `false`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Generates a random [RFC 9562][RFC 9562] version 7 UUID. The UUID contains a millisecond
precision Unix timestamp in the most significant 48 bits, followed by
cryptographically secure random bits for the remaining fields, making it
suitable for use as a database key with time-based sorting. The embedded
timestamp relies on a non-monotonic clock and is not guaranteed to be strictly
increasing.

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

* `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `cost` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) CPU/memory cost parameter. Must be a power of two greater
    than one. **По умолчанию:** `16384`.
  * `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Block size parameter. **По умолчанию:** `8`.
  * `parallelization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Parallelization parameter. **По умолчанию:** `1`.
  * `N` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Alias for `cost`. Only one of both may be specified.
  * `r` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Alias for `blockSize`. Only one of both may be specified.
  * `p` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Alias for `parallelization`. Only one of both may be specified.
  * `maxmem` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Memory upper bound. It is an error when (approximately)
    `128 * N * r > maxmem`. **По умолчанию:** `32 * 1024 * 1024`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `derivedKey` [`<Buffer>`](buffer.md#buffer)

Provides an asynchronous [scrypt][scrypt] implementation. Scrypt is a password-based
key derivation function that is designed to be expensive computationally and
memory-wise in order to make brute-force attacks unrewarding.

The `salt` should be as unique as possible. It is recommended that a salt is
random and at least 16 bytes long. See [NIST SP 800-132][NIST SP 800-132] for details.

When passing strings for `password` or `salt`, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

The `callback` function is called with two arguments: `err` and `derivedKey`.
`err` is an exception object when key derivation fails, otherwise `err` is
`null`. `derivedKey` is passed to the callback as a [`Buffer`][`Buffer`].

An exception is thrown when any of the input arguments specify invalid values
or types.

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

* `password` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `salt` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `cost` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) CPU/memory cost parameter. Must be a power of two greater
    than one. **По умолчанию:** `16384`.
  * `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Block size parameter. **По умолчанию:** `8`.
  * `parallelization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Parallelization parameter. **По умолчанию:** `1`.
  * `N` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Alias for `cost`. Only one of both may be specified.
  * `r` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Alias for `blockSize`. Only one of both may be specified.
  * `p` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Alias for `parallelization`. Only one of both may be specified.
  * `maxmem` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Memory upper bound. It is an error when (approximately)
    `128 * N * r > maxmem`. **По умолчанию:** `32 * 1024 * 1024`.
* Возвращает: [`<Buffer>`](buffer.md#buffer)

Provides a synchronous [scrypt][scrypt] implementation. Scrypt is a password-based
key derivation function that is designed to be expensive computationally and
memory-wise in order to make brute-force attacks unrewarding.

The `salt` should be as unique as possible. It is recommended that a salt is
random and at least 16 bytes long. See [NIST SP 800-132][NIST SP 800-132] for details.

When passing strings for `password` or `salt`, please consider
[caveats when using strings as inputs to cryptographic APIs][caveats when using strings as inputs to cryptographic APIs].

An exception is thrown when key derivation fails, otherwise the derived key is
returned as a [`Buffer`][`Buffer`].

An exception is thrown when any of the input arguments specify invalid values
or types.

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

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `total` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total allocated secure heap size as specified
    using the `--secure-heap=n` command-line flag.
  * `min` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The minimum allocation from the secure heap as
    specified using the `--secure-heap-min` command-line flag.
  * `used` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of bytes currently allocated from
    the secure heap.
  * `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The calculated ratio of `used` to `total`
    allocated bytes.

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

* `engine` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `flags` [`<crypto.constants>`](crypto.md#cryptoconstants) **По умолчанию:** `crypto.constants.ENGINE_METHOD_ALL`

Load and set the `engine` for some or all OpenSSL functions (selected by flags).
Support for custom engines in OpenSSL is deprecated from OpenSSL 3.

`engine` could be either an id or a path to the engine's shared library.

The optional `flags` argument uses `ENGINE_METHOD_ALL` by default. The `flags`
is a bit field taking one of or a mix of the following flags (defined in
`crypto.constants`):

* `crypto.constants.ENGINE_METHOD_RSA`
* `crypto.constants.ENGINE_METHOD_DSA`
* `crypto.constants.ENGINE_METHOD_DH`
* `crypto.constants.ENGINE_METHOD_RAND`
* `crypto.constants.ENGINE_METHOD_EC`
* `crypto.constants.ENGINE_METHOD_CIPHERS`
* `crypto.constants.ENGINE_METHOD_DIGESTS`
* `crypto.constants.ENGINE_METHOD_PKEY_METHS`
* `crypto.constants.ENGINE_METHOD_PKEY_ASN1_METHS`
* `crypto.constants.ENGINE_METHOD_ALL`
* `crypto.constants.ENGINE_METHOD_NONE`

### `crypto.setFips(bool)`

<!-- YAML
added: v10.0.0
-->

* `bool` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` to enable FIPS mode.

Enables the FIPS compliant crypto provider in a FIPS-enabled Node.js build.
Throws an error if FIPS mode is not available.

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

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `signature` [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Buffer>`](buffer.md#buffer) if the `callback` function is not provided.

<!--lint enable maximum-line-length remark-lint-->

Calculates and returns the signature for `data` using the given private key and
algorithm. If `algorithm` is `null` or `undefined`, then the algorithm is
dependent upon the key type.

`algorithm` is required to be `null` or `undefined` for Ed25519, Ed448, and
ML-DSA.

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if `key` had been
passed to [`crypto.createPrivateKey()`][`crypto.createPrivateKey()`]. If it is an object, the following
additional properties can be passed:

* `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) For DSA and ECDSA, this option specifies the
  format of the generated signature. It can be one of the following:
  * `'der'` (default): DER-encoded ASN.1 signature structure encoding `(r, s)`.
  * `'ieee-p1363'`: Signature format `r || s` as proposed in IEEE-P1363.
* `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optional padding value for RSA, one of the following:

  * `crypto.constants.RSA_PKCS1_PADDING` (default)
  * `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` will use MGF1 with the same hash function
  used to sign the message as specified in section 3.1 of [RFC 4055][RFC 4055].
* `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Salt length for when padding is
  `RSA_PKCS1_PSS_PADDING`. The special value
  `crypto.constants.RSA_PSS_SALTLEN_DIGEST` sets the salt length to the digest
  size, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (default) sets it to the
  maximum permissible value.
* `context` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) For Ed25519[^openssl32]
  (using Ed25519ctx from [RFC 8032][RFC 8032]), Ed448, ML-DSA, and SLH-DSA,
  this option specifies the optional context to differentiate signatures
  generated for different purposes with the same key.

If the `callback` function is provided this function uses libuv's threadpool.

### `crypto.subtle`

<!-- YAML
added: v17.4.0
-->

* Тип: [`<SubtleCrypto>`](webcrypto.md)

A convenient alias for [`crypto.webcrypto.subtle`][`crypto.webcrypto.subtle`].

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

* `a` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `b` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

This function compares the underlying bytes that represent the given
`ArrayBuffer`, `TypedArray`, or `DataView` instances using a constant-time
algorithm.

This function does not leak timing information that
would allow an attacker to guess one of the values. This is suitable for
comparing HMAC digests or secret values like authentication cookies or
[capability urls](https://www.w3.org/TR/capability-urls/).

`a` and `b` must both be `Buffer`s, `TypedArray`s, or `DataView`s, and they
must have the same byte length. An error is thrown if `a` and `b` have
different byte lengths.

If at least one of `a` and `b` is a `TypedArray` with more than one byte per
entry, such as `Uint16Array`, the result will be computed using the platform
byte order.

<strong class="critical">When both of the inputs are `Float32Array`s or
`Float64Array`s, this function might return unexpected results due to IEEE 754
encoding of floating-point numbers. In particular, neither `x === y` nor
`Object.is(x, y)` implies that the byte representations of two floating-point
numbers `x` and `y` are equal.</strong>

Use of `crypto.timingSafeEqual` does not guarantee that the _surrounding_ code
is timing-safe. Care should be taken to ensure that the surrounding code does
not introduce timing vulnerabilities.

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

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `key` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<KeyObject>`](#class-keyobject) | [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `signature` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `result` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` or `false` depending on the validity of the
  signature for the data and public key if the `callback` function is not
  provided.

<!--lint enable maximum-line-length remark-lint-->

Verifies the given signature for `data` using the given key and algorithm. If
`algorithm` is `null` or `undefined`, then the algorithm is dependent upon the
key type.

`algorithm` is required to be `null` or `undefined` for Ed25519, Ed448, and
ML-DSA.

If `key` is not a [`KeyObject`][`KeyObject`], this function behaves as if `key` had been
passed to [`crypto.createPublicKey()`][`crypto.createPublicKey()`]. If it is an object, the following
additional properties can be passed:

* `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) For DSA and ECDSA, this option specifies the
  format of the signature. It can be one of the following:
  * `'der'` (default): DER-encoded ASN.1 signature structure encoding `(r, s)`.
  * `'ieee-p1363'`: Signature format `r || s` as proposed in IEEE-P1363.
* `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optional padding value for RSA, one of the following:

  * `crypto.constants.RSA_PKCS1_PADDING` (default)
  * `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` will use MGF1 with the same hash function
  used to sign the message as specified in section 3.1 of [RFC 4055][RFC 4055].
* `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Salt length for when padding is
  `RSA_PKCS1_PSS_PADDING`. The special value
  `crypto.constants.RSA_PSS_SALTLEN_DIGEST` sets the salt length to the digest
  size, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (default) sets it to the
  maximum permissible value.
* `context` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) For Ed25519[^openssl32]
  (using Ed25519ctx from [RFC 8032][RFC 8032]), Ed448, ML-DSA, and SLH-DSA,
  this option specifies the optional context to differentiate signatures
  generated for different purposes with the same key.

The `signature` argument is the previously calculated signature for the `data`.

Because public keys can be derived from private keys, a private key or a public
key may be passed for `key`.

If the `callback` function is provided this function uses libuv's threadpool.

### `crypto.webcrypto`

<!-- YAML
added: v15.0.0
-->

Тип: [`<Crypto>`](crypto.md) Реализация стандарта Web Crypto API.

Подробнее см. в [документации Web Crypto API][Web Crypto API documentation].

## Примечания

### Using strings as inputs to cryptographic APIs

For historical reasons, many cryptographic APIs provided by Node.js accept
strings as inputs where the underlying cryptographic algorithm works on byte
sequences. These instances include plaintexts, ciphertexts, symmetric keys,
initialization vectors, passphrases, salts, authentication tags,
and additional authenticated data.

When passing strings to cryptographic APIs, consider the following factors.

* Not all byte sequences are valid UTF-8 strings. Therefore, when a byte
  sequence of length `n` is derived from a string, its entropy is generally
  lower than the entropy of a random or pseudorandom `n` byte sequence.
  For example, no UTF-8 string will result in the byte sequence `c0 af`. Secret
  keys should almost exclusively be random or pseudorandom byte sequences.
* Similarly, when converting random or pseudorandom byte sequences to UTF-8
  strings, subsequences that do not represent valid code points may be replaced
  by the Unicode replacement character (`U+FFFD`). The byte representation of
  the resulting Unicode string may, therefore, not be equal to the byte sequence
  that the string was created from.

  ```js
  const original = [0xc0, 0xaf];
  const bytesAsString = Buffer.from(original).toString('utf8');
  const stringAsBytes = Buffer.from(bytesAsString, 'utf8');
  console.log(stringAsBytes);
  // Prints '<Buffer ef bf bd ef bf bd>'.
  ```

  The outputs of ciphers, hash functions, signature algorithms, and key
  derivation functions are pseudorandom byte sequences and should not be
  used as Unicode strings.
* When strings are obtained from user input, some Unicode characters can be
  represented in multiple equivalent ways that result in different byte
  sequences. For example, when passing a user passphrase to a key derivation
  function, such as PBKDF2 or scrypt, the result of the key derivation function
  depends on whether the string uses composed or decomposed characters. Node.js
  does not normalize character representations. Developers should consider using
  [`String.prototype.normalize()`][`String.prototype.normalize()`] on user inputs before passing them to
  cryptographic APIs.

### Legacy streams API (prior to Node.js 0.10)

The Crypto module was added to Node.js before there was the concept of a
unified Stream API, and before there were [`Buffer`][`Buffer`] objects for handling
binary data. As such, many `crypto` classes have methods not
typically found on other Node.js classes that implement the [streams][stream]
API (e.g. `update()`, `final()`, or `digest()`). Also, many methods accepted
and returned `'latin1'` encoded strings by default rather than `Buffer`s. This
default was changed in Node.js 0.9.3 to use [`Buffer`][`Buffer`] objects by default
instead.

### Support for weak or compromised algorithms

The `node:crypto` module still supports some algorithms which are already
compromised and are not recommended for use. The API also allows
the use of ciphers and hashes with a small key size that are too weak for safe
use.

Users should take full responsibility for selecting the crypto
algorithm and key size according to their security requirements.

Based on the recommendations of [NIST SP 800-131A][NIST SP 800-131A]:

* MD5 and SHA-1 are no longer acceptable where collision resistance is
  required such as digital signatures.
* The key used with RSA, DSA, and DH algorithms is recommended to have
  at least 2048 bits and that of the curve of ECDSA and ECDH at least
  224 bits, to be safe to use for several years.
* The DH groups of `modp1`, `modp2` and `modp5` have a key size
  smaller than 2048 bits and are not recommended.

See the reference for other recommendations and details.

Some algorithms that have known weaknesses and are of little relevance in
practice are only available through the [legacy provider][legacy provider], which is not
enabled by default.

### CCM mode

CCM is one of the supported [AEAD algorithms][AEAD algorithms]. Applications which use this
mode must adhere to certain restrictions when using the cipher API:

* The authentication tag length must be specified during cipher creation by
  setting the `authTagLength` option and must be one of 4, 6, 8, 10, 12, 14 or
  16 bytes.
* The length of the initialization vector (nonce) `N` must be between 7 and 13
  bytes (`7 ≤ N ≤ 13`).
* The length of the plaintext is limited to `2 ** (8 * (15 - N))` bytes.
* When decrypting, the authentication tag must be set via `setAuthTag()` before
  calling `update()`.
  Otherwise, decryption will fail and `final()` will throw an error in
  compliance with section 2.6 of [RFC 3610][RFC 3610].
* Using stream methods such as `write(data)`, `end(data)` or `pipe()` in CCM
  mode might fail as CCM cannot handle more than one chunk of data per instance.
* When passing additional authenticated data (AAD), the length of the actual
  message in bytes must be passed to `setAAD()` via the `plaintextLength`
  option.
  Many crypto libraries include the authentication tag in the ciphertext,
  which means that they produce ciphertexts of the length
  `plaintextLength + authTagLength`. Node.js does not include the authentication
  tag, so the ciphertext length is always `plaintextLength`.
  This is not necessary if no AAD is used.
* As CCM processes the whole message at once, `update()` must be called exactly
  once.
* Even though calling `update()` is sufficient to encrypt/decrypt the message,
  applications _must_ call `final()` to compute or verify the
  authentication tag.

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

### FIPS mode

When using OpenSSL 3, Node.js supports FIPS 140-2 when used with an appropriate
OpenSSL 3 provider, such as the [FIPS provider from OpenSSL 3][FIPS provider from OpenSSL 3] which can be
installed by following the instructions in [OpenSSL's FIPS README file][OpenSSL's FIPS README file].

For FIPS support in Node.js you will need:

* A correctly installed OpenSSL 3 FIPS provider.
* An OpenSSL 3 [FIPS module configuration file][FIPS module configuration file].
* An OpenSSL 3 configuration file that references the FIPS module
  configuration file.

Node.js will need to be configured with an OpenSSL configuration file that
points to the FIPS provider. An example configuration file looks like this:

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

where `fipsmodule.cnf` is the FIPS module configuration file generated from the
FIPS provider installation step:

```bash
openssl fipsinstall
```

Set the `OPENSSL_CONF` environment variable to point to
your configuration file and `OPENSSL_MODULES` to the location of the FIPS
provider dynamic library. e.g.

```bash
export OPENSSL_CONF=/<path to configuration file>/nodejs.cnf
export OPENSSL_MODULES=/<path to openssl lib>/ossl-modules
```

FIPS mode can then be enabled in Node.js either by:

* Starting Node.js with `--enable-fips` or `--force-fips` command line flags.
* Programmatically calling `crypto.setFips(true)`.

Optionally FIPS mode can be enabled in Node.js via the OpenSSL configuration
file. e.g.

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

## Crypto constants

The following constants exported by `crypto.constants` apply to various uses of
the `node:crypto`, `node:tls`, and `node:https` modules and are generally
specific to OpenSSL.

### OpenSSL options

See the [list of SSL OP Flags][list of SSL OP Flags] for details.

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>SSL_OP_ALL</code></td>
    <td>Applies multiple bug workarounds within OpenSSL. See
    <a href="https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html">https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html</a>
    for detail.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_ALLOW_NO_DHE_KEX</code></td>
    <td>Instructs OpenSSL to allow a non-[EC]DHE-based key exchange mode
    for TLS v1.3</td>
  </tr>
  <tr>
    <td><code>SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION</code></td>
    <td>Allows legacy insecure renegotiation between OpenSSL and unpatched
    clients or servers. See
    <a href="https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html">https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html</a>.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_CIPHER_SERVER_PREFERENCE</code></td>
    <td>Attempts to use the server's preferences instead of the client's when
    selecting a cipher. Behavior depends on protocol version. See
    <a href="https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html">https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html</a>.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_CISCO_ANYCONNECT</code></td>
    <td>Instructs OpenSSL to use Cisco's version identifier of DTLS_BAD_VER.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_COOKIE_EXCHANGE</code></td>
    <td>Instructs OpenSSL to turn on cookie exchange.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_CRYPTOPRO_TLSEXT_BUG</code></td>
    <td>Instructs OpenSSL to add server-hello extension from an early version
    of the cryptopro draft.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS</code></td>
    <td>Instructs OpenSSL to disable a SSL 3.0/TLS 1.0 vulnerability
    workaround added in OpenSSL 0.9.6d.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_LEGACY_SERVER_CONNECT</code></td>
    <td>Allows initial connection to servers that do not support RI.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_COMPRESSION</code></td>
    <td>Instructs OpenSSL to disable support for SSL/TLS compression.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_ENCRYPT_THEN_MAC</code></td>
    <td>Instructs OpenSSL to disable encrypt-then-MAC.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_QUERY_MTU</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_RENEGOTIATION</code></td>
    <td>Instructs OpenSSL to disable renegotiation.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION</code></td>
    <td>Instructs OpenSSL to always start a new session when performing
    renegotiation.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_SSLv2</code></td>
    <td>Instructs OpenSSL to turn off SSL v2</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_SSLv3</code></td>
    <td>Instructs OpenSSL to turn off SSL v3</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_TICKET</code></td>
    <td>Instructs OpenSSL to disable use of RFC4507bis tickets.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_TLSv1</code></td>
    <td>Instructs OpenSSL to turn off TLS v1</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_TLSv1_1</code></td>
    <td>Instructs OpenSSL to turn off TLS v1.1</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_TLSv1_2</code></td>
    <td>Instructs OpenSSL to turn off TLS v1.2</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NO_TLSv1_3</code></td>
    <td>Instructs OpenSSL to turn off TLS v1.3</td>
  </tr>
  <tr>
    <td><code>SSL_OP_PRIORITIZE_CHACHA</code></td>
    <td>Instructs OpenSSL server to prioritize ChaCha20-Poly1305
    when the client does.
    This option has no effect if
    <code>SSL_OP_CIPHER_SERVER_PREFERENCE</code>
    is not enabled.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_TLS_ROLLBACK_BUG</code></td>
    <td>Instructs OpenSSL to disable version rollback attack detection.</td>
  </tr>
</table>

### OpenSSL engine constants

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_RSA</code></td>
    <td>Limit engine usage to RSA</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_DSA</code></td>
    <td>Limit engine usage to DSA</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_DH</code></td>
    <td>Limit engine usage to DH</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_RAND</code></td>
    <td>Limit engine usage to RAND</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_EC</code></td>
    <td>Limit engine usage to EC</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_CIPHERS</code></td>
    <td>Limit engine usage to CIPHERS</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_DIGESTS</code></td>
    <td>Limit engine usage to DIGESTS</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_PKEY_METHS</code></td>
    <td>Limit engine usage to PKEY_METHS</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_PKEY_ASN1_METHS</code></td>
    <td>Limit engine usage to PKEY_ASN1_METHS</td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_ALL</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>ENGINE_METHOD_NONE</code></td>
    <td></td>
  </tr>
</table>

### Other OpenSSL constants

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>DH_CHECK_P_NOT_SAFE_PRIME</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>DH_CHECK_P_NOT_PRIME</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>DH_UNABLE_TO_CHECK_GENERATOR</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>DH_NOT_SUITABLE_GENERATOR</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_PKCS1_PADDING</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_SSLV23_PADDING</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_NO_PADDING</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_PKCS1_OAEP_PADDING</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_X931_PADDING</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_PKCS1_PSS_PADDING</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>RSA_PSS_SALTLEN_DIGEST</code></td>
    <td>Sets the salt length for <code>RSA_PKCS1_PSS_PADDING</code> to the
        digest size when signing or verifying.</td>
  </tr>
  <tr>
    <td><code>RSA_PSS_SALTLEN_MAX_SIGN</code></td>
    <td>Sets the salt length for <code>RSA_PKCS1_PSS_PADDING</code> to the
        maximum permissible value when signing data.</td>
  </tr>
  <tr>
    <td><code>RSA_PSS_SALTLEN_AUTO</code></td>
    <td>Causes the salt length for <code>RSA_PKCS1_PSS_PADDING</code> to be
        determined automatically when verifying a signature.</td>
  </tr>
  <tr>
    <td><code>POINT_CONVERSION_COMPRESSED</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>POINT_CONVERSION_UNCOMPRESSED</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>POINT_CONVERSION_HYBRID</code></td>
    <td></td>
  </tr>
</table>

### Node.js crypto constants

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>defaultCoreCipherList</code></td>
    <td>Specifies the built-in default cipher list used by Node.js.</td>
  </tr>
  <tr>
    <td><code>defaultCipherList</code></td>
    <td>Specifies the active default cipher list used by the current Node.js
    process.</td>
  </tr>
</table>

[^openssl30]: Requires OpenSSL >= 3.0

[^openssl32]: Requires OpenSSL >= 3.2

[^openssl35]: Requires OpenSSL >= 3.5

[AEAD algorithms]: https://en.wikipedia.org/wiki/Authenticated_encryption
[CCM mode]: #ccm-mode
[CVE-2021-44532]: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44532
[Caveats]: #support-for-weak-or-compromised-algorithms
[Crypto constants]: #crypto-constants
[FIPS module configuration file]: https://www.openssl.org/docs/man3.0/man5/fips_config.html
[FIPS provider from OpenSSL 3]: https://www.openssl.org/docs/man3.0/man7/crypto.html#FIPS-provider
[HTML 5.2]: https://www.w3.org/TR/html52/changes.html#features-removed
[JWK]: https://tools.ietf.org/html/rfc7517
[Key usages]: webcrypto.md#cryptokeyusages
[NIST SP 800-131A]: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-131Ar2.pdf
[NIST SP 800-132]: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf
[NIST SP 800-38D]: https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf
[OpenSSL's FIPS README file]: https://github.com/openssl/openssl/blob/openssl-3.0/README-FIPS.md
[OpenSSL's SPKAC implementation]: https://www.openssl.org/docs/man3.0/man1/openssl-spkac.html
[RFC 1421]: https://www.rfc-editor.org/rfc/rfc1421.txt
[RFC 2409]: https://www.rfc-editor.org/rfc/rfc2409.txt
[RFC 2818]: https://www.rfc-editor.org/rfc/rfc2818.txt
[RFC 3526]: https://www.rfc-editor.org/rfc/rfc3526.txt
[RFC 3610]: https://www.rfc-editor.org/rfc/rfc3610.txt
[RFC 4055]: https://www.rfc-editor.org/rfc/rfc4055.txt
[RFC 4122]: https://www.rfc-editor.org/rfc/rfc4122.txt
[RFC 5208]: https://www.rfc-editor.org/rfc/rfc5208.txt
[RFC 5280]: https://www.rfc-editor.org/rfc/rfc5280.txt
[RFC 7517]: https://www.rfc-editor.org/rfc/rfc7517.txt
[RFC 8032]: https://www.rfc-editor.org/rfc/rfc8032.txt
[RFC 9562]: https://www.rfc-editor.org/rfc/rfc9562.txt
[Web Crypto API documentation]: webcrypto.md
[`BN_is_prime_ex`]: https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html
[`Buffer`]: buffer.md
[`DH_generate_key()`]: https://www.openssl.org/docs/man3.0/man3/DH_generate_key.html
[`DiffieHellmanGroup`]: #class-diffiehellmangroup
[`KeyObject`]: #class-keyobject
[`Sign`]: #class-sign
[`String.prototype.normalize()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
[`UV_THREADPOOL_SIZE`]: cli.md#uv_threadpool_sizesize
[`Verify`]: #class-verify
[`cipher.final()`]: #cipherfinaloutputencoding
[`cipher.update()`]: #cipherupdatedata-inputencoding-outputencoding
[`crypto.createCipheriv()`]: #cryptocreatecipherivalgorithm-key-iv-options
[`crypto.createDecipheriv()`]: #cryptocreatedecipherivalgorithm-key-iv-options
[`crypto.createDiffieHellman()`]: #cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding
[`crypto.createECDH()`]: #cryptocreateecdhcurvename
[`crypto.createHash()`]: #cryptocreatehashalgorithm-options
[`crypto.createHmac()`]: #cryptocreatehmacalgorithm-key-options
[`crypto.createPrivateKey()`]: #cryptocreateprivatekeykey
[`crypto.createPublicKey()`]: #cryptocreatepublickeykey
[`crypto.createSecretKey()`]: #cryptocreatesecretkeykey-encoding
[`crypto.createSign()`]: #cryptocreatesignalgorithm-options
[`crypto.createVerify()`]: #cryptocreateverifyalgorithm-options
[`crypto.generateKey()`]: #cryptogeneratekeytype-options-callback
[`crypto.generateKeyPair()`]: #cryptogeneratekeypairtype-options-callback
[`crypto.getCurves()`]: #cryptogetcurves
[`crypto.getDiffieHellman()`]: #cryptogetdiffiehellmangroupname
[`crypto.getHashes()`]: #cryptogethashes
[`crypto.privateDecrypt()`]: #cryptoprivatedecryptprivatekey-buffer
[`crypto.privateEncrypt()`]: #cryptoprivateencryptprivatekey-buffer
[`crypto.publicDecrypt()`]: #cryptopublicdecryptkey-buffer
[`crypto.publicEncrypt()`]: #cryptopublicencryptkey-buffer
[`crypto.randomBytes()`]: #cryptorandombytessize-callback
[`crypto.randomFill()`]: #cryptorandomfillbuffer-offset-size-callback
[`crypto.sign()`]: #cryptosignalgorithm-data-key-callback
[`crypto.verify()`]: #cryptoverifyalgorithm-data-key-signature-callback
[`crypto.webcrypto.getRandomValues()`]: webcrypto.md#cryptogetrandomvaluestypedarray
[`crypto.webcrypto.subtle`]: webcrypto.md#class-subtlecrypto
[`decipher.final()`]: #decipherfinaloutputencoding
[`decipher.update()`]: #decipherupdatedata-inputencoding-outputencoding
[`diffieHellman.generateKeys()`]: #diffiehellmangeneratekeysencoding
[`diffieHellman.setPublicKey()`]: #diffiehellmansetpublickeypublickey-encoding
[`ecdh.generateKeys()`]: #ecdhgeneratekeysencoding-format
[`ecdh.setPrivateKey()`]: #ecdhsetprivatekeyprivatekey-encoding
[`hash.digest()`]: #hashdigestencoding
[`hash.update()`]: #hashupdatedata-inputencoding
[`hmac.digest()`]: #hmacdigestencoding
[`hmac.update()`]: #hmacupdatedata-inputencoding
[`import()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
[`keyObject.export()`]: #keyobjectexportoptions
[`postMessage()`]: worker_threads.md#portpostmessagevalue-transferlist
[`sign.sign()`]: #signsignprivatekey-outputencoding
[`sign.update()`]: #signupdatedata-inputencoding
[`stream.Writable` options]: stream.md#new-streamwritableoptions
[`stream.transform` options]: stream.md#new-streamtransformoptions
[`util.promisify()`]: util.md#utilpromisifyoriginal
[`verify.update()`]: #verifyupdatedata-inputencoding
[`verify.verify()`]: #verifyverifykey-signature-signatureencoding
[`x509.fingerprint256`]: #x509fingerprint256
[`x509.verify(publicKey)`]: #x509verifypublickey
[argon2]: https://www.rfc-editor.org/rfc/rfc9106.html
[asymmetric key types]: #asymmetric-key-types
[caveats when using strings as inputs to cryptographic APIs]: #using-strings-as-inputs-to-cryptographic-apis
[certificate object]: tls.md#certificate-object
[encoding]: buffer.md#buffers-and-character-encodings
[initialization vector]: https://en.wikipedia.org/wiki/Initialization_vector
[legacy provider]: cli.md#--openssl-legacy-provider
[list of SSL OP Flags]: https://wiki.openssl.org/index.php/List_of_SSL_OP_Flags#Table_of_Options
[modulo bias]: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias
[safe integers]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger
[scrypt]: https://en.wikipedia.org/wiki/Scrypt
[stream]: stream.md
[stream-writable-write]: stream.md#writablewritechunk-encoding-callback
