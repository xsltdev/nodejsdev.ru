---
title: Web Crypto API
description: Реализация стандарта Web Crypto в Node.js — SubtleCrypto, CryptoKey, алгоритмы и матрица поддержки
---

# Web Crypto API

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/webcrypto.html)

<!-- YAML
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/62183
    description: Алгоритмы TurboSHAKE и KangarooTwelve
      теперь поддерживаются.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59647
    description: Алгоритмы KMAC теперь поддерживаются.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59544
    description: Алгоритмы Argon2 теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59539
    description: Алгоритм AES-OCB теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59569
    description: Алгоритмы ML-KEM теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHAKE теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы ML-DSA теперь поддерживаются.
  - version:
    - v23.5.0
    - v22.13.0
    - v20.19.3
    pr-url: https://github.com/nodejs/node/pull/56142
    description: Алгоритмы `Ed25519` и `X25519` теперь стабильны.
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/46067
    description: Аргументы приводятся и проверяются по WebIDL,
      как в других реализациях Web Crypto API.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44897
    description: Больше не экспериментально, кроме алгоритмов `Ed25519`, `Ed448`,
      `X25519` и `X448`.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43310
    description: Удалён проприетарный формат импорта/экспорта `'node.keyObject'`.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43310
    description: Удалены проприетарные алгоритмы `'NODE-DSA'`, `'NODE-DH'`
      и `'NODE-SCRYPT'`.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'Ed25519'`, `'Ed448'`, `'X25519'` и `'X448'`.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Удалены проприетарные алгоритмы `'NODE-ED25519'` и `'NODE-ED448'`.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Удалены проприетарные кривые `'NODE-X25519'` и `'NODE-X448'`
      из алгоритма `'ECDH'`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.9.0 | Алгоритмы TurboSHAKE и KangarooTwelve теперь поддерживаются. |
    | v24.8.0 | Алгоритмы KMAC теперь поддерживаются. |
    | v24.8.0 | Алгоритмы Argon2 теперь поддерживаются. |
    | v24.7.0 | Алгоритм AES-OCB теперь поддерживается. |
    | v24.7.0 | Алгоритмы ML-KEM теперь поддерживаются. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |
    | v24.7.0 | Алгоритмы SHAKE теперь поддерживаются. |
    | v24.7.0 | Алгоритмы ML-DSA теперь поддерживаются. |
    | v23.5.0, v22.13.0, v20.19.3 | Алгоритмы `Ed25519` и `X25519` теперь стабильны. |
    | v20.0.0, v18.17.0 | Аргументы приводятся и проверяются по WebIDL, как в других реализациях Web Crypto API. |
    | v19.0.0 | Больше не экспериментально, кроме алгоритмов `Ed25519`, `Ed448`, `X25519` и `X448`. |
    | v18.4.0, v16.17.0 | Удалён проприетарный формат импорта/экспорта `'node.keyObject'`. |
    | v18.4.0, v16.17.0 | Удалены проприетарные алгоритмы `'NODE-DSA'`, `'NODE-DH'` и `'NODE-SCRYPT'`. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'Ed25519'`, `'Ed448'`, `'X25519'` и `'X448'`. |
    | v18.4.0, v16.17.0 | Удалены проприетарные алгоритмы `'NODE-ED25519'` и `'NODE-ED448'`. |
    | v18.4.0, v16.17.0 | Удалены проприетарные кривые `'NODE-X25519'` и `'NODE-X448'` из алгоритма `'ECDH'`. |

<!-- introduced_in=v15.0.0 -->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Node.js реализует стандарт [Web Crypto API][Web Crypto API].

Доступ: `globalThis.crypto` или `require('node:crypto').webcrypto`.

```js
const { subtle } = globalThis.crypto;

(async function() {

  const key = await subtle.generateKey({
    name: 'HMAC',
    hash: 'SHA-256',
    length: 256,
  }, true, ['sign', 'verify']);

  const enc = new TextEncoder();
  const message = enc.encode('I love cupcakes');

  const digest = await subtle.sign({
    name: 'HMAC',
  }, key, message);

})();
```

## Современные алгоритмы в Web Cryptography API {#modern-algorithms-in-the-web-cryptography-api}

!!!warning "Стабильность: 1.1 – Активная разработка"

    Изменения возможны; при необходимости проверяйте поведение в документации upstream.

Node.js поддерживает следующие возможности из предложения WICG
[Modern Algorithms in the Web Cryptography API](https://wicg.github.io/webcrypto-modern-algos/):

Алгоритмы:

* `'AES-OCB'`[^openssl30]
* `'Argon2d'`[^openssl32]
* `'Argon2i'`[^openssl32]
* `'Argon2id'`[^openssl32]
* `'ChaCha20-Poly1305'`
* `'cSHAKE128'`
* `'cSHAKE256'`
* `'KMAC128'`[^openssl30]
* `'KMAC256'`[^openssl30]
* `'KT128'`
* `'KT256'`
* `'ML-DSA-44'`[^openssl35]
* `'ML-DSA-65'`[^openssl35]
* `'ML-DSA-87'`[^openssl35]
* `'ML-KEM-512'`[^openssl35]
* `'ML-KEM-768'`[^openssl35]
* `'ML-KEM-1024'`[^openssl35]
* `'SHA3-256'`
* `'SHA3-384'`
* `'SHA3-512'`
* `'TurboSHAKE128'`
* `'TurboSHAKE256'`

Форматы ключей:

* `'raw-public'`
* `'raw-secret'`
* `'raw-seed'`

Методы:

* [`subtle.decapsulateBits()`](#subtledecapsulatebitsdecapsulationalgorithm-decapsulationkey-ciphertext)
* [`subtle.decapsulateKey()`](#subtledecapsulatekeydecapsulationalgorithm-decapsulationkey-ciphertext-sharedkeyalgorithm-extractable-usages)
* [`subtle.encapsulateBits()`](#subtleencapsulatebitsencapsulationalgorithm-encapsulationkey)
* [`subtle.encapsulateKey()`](#subtleencapsulatekeyencapsulationalgorithm-encapsulationkey-sharedkeyalgorithm-extractable-usages)
* [`subtle.getPublicKey()`](#subtlegetpublickeykey-keyusages)
* [`SubtleCrypto.supports()`](#static-method-subtlecryptosupportsoperation-algorithm-lengthoradditionalalgorithm)

## Безопасные кривые в Web Cryptography API {#secure-curves-in-the-web-cryptography-api}

!!!warning "Стабильность: 1.1 – Активная разработка"

Node.js поддерживает следующие возможности из предложения WICG
[Secure Curves in the Web Cryptography API](https://wicg.github.io/webcrypto-secure-curves/):

Алгоритмы:

* `'Ed448'`
* `'X448'`

## Примеры

### Генерация ключей

Класс [SubtleCrypto](webcrypto.md) позволяет создавать симметричные (секретные) ключи
и асимметричные пары (открытый и закрытый ключ).

#### Ключи AES

```js
const { subtle } = globalThis.crypto;

async function generateAesKey(length = 256) {
  const key = await subtle.generateKey({
    name: 'AES-CBC',
    length,
  }, true, ['encrypt', 'decrypt']);

  return key;
}
```

#### Пары ключей ECDSA

```js
const { subtle } = globalThis.crypto;

async function generateEcKey(namedCurve = 'P-521') {
  const {
    publicKey,
    privateKey,
  } = await subtle.generateKey({
    name: 'ECDSA',
    namedCurve,
  }, true, ['sign', 'verify']);

  return { publicKey, privateKey };
}
```

#### Пары ключей Ed25519/X25519

```js
const { subtle } = globalThis.crypto;

async function generateEd25519Key() {
  return subtle.generateKey({
    name: 'Ed25519',
  }, true, ['sign', 'verify']);
}

async function generateX25519Key() {
  return subtle.generateKey({
    name: 'X25519',
  }, true, ['deriveKey']);
}
```

#### Ключи HMAC

```js
const { subtle } = globalThis.crypto;

async function generateHmacKey(hash = 'SHA-256') {
  const key = await subtle.generateKey({
    name: 'HMAC',
    hash,
  }, true, ['sign', 'verify']);

  return key;
}
```

#### Пары ключей RSA

```js
const { subtle } = globalThis.crypto;
const publicExponent = new Uint8Array([1, 0, 1]);

async function generateRsaKey(modulusLength = 2048, hash = 'SHA-256') {
  const {
    publicKey,
    privateKey,
  } = await subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength,
    publicExponent,
    hash,
  }, true, ['sign', 'verify']);

  return { publicKey, privateKey };
}
```

### Шифрование и расшифрование

```js
const crypto = globalThis.crypto;

async function aesEncrypt(plaintext) {
  const ec = new TextEncoder();
  const key = await generateAesKey();
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const ciphertext = await crypto.subtle.encrypt({
    name: 'AES-CBC',
    iv,
  }, key, ec.encode(plaintext));

  return {
    key,
    iv,
    ciphertext,
  };
}

async function aesDecrypt(ciphertext, key, iv) {
  const dec = new TextDecoder();
  const plaintext = await crypto.subtle.decrypt({
    name: 'AES-CBC',
    iv,
  }, key, ciphertext);

  return dec.decode(plaintext);
}
```

### Экспорт и импорт ключей

```js
const { subtle } = globalThis.crypto;

async function generateAndExportHmacKey(format = 'jwk', hash = 'SHA-512') {
  const key = await subtle.generateKey({
    name: 'HMAC',
    hash,
  }, true, ['sign', 'verify']);

  return subtle.exportKey(format, key);
}

async function importHmacKey(keyData, format = 'jwk', hash = 'SHA-512') {
  const key = await subtle.importKey(format, keyData, {
    name: 'HMAC',
    hash,
  }, true, ['sign', 'verify']);

  return key;
}
```

### Упаковка и распаковка ключей

```js
const { subtle } = globalThis.crypto;

async function generateAndWrapHmacKey(format = 'jwk', hash = 'SHA-512') {
  const [
    key,
    wrappingKey,
  ] = await Promise.all([
    subtle.generateKey({
      name: 'HMAC', hash,
    }, true, ['sign', 'verify']),
    subtle.generateKey({
      name: 'AES-KW',
      length: 256,
    }, true, ['wrapKey', 'unwrapKey']),
  ]);

  const wrappedKey = await subtle.wrapKey(format, key, wrappingKey, 'AES-KW');

  return { wrappedKey, wrappingKey };
}

async function unwrapHmacKey(
  wrappedKey,
  wrappingKey,
  format = 'jwk',
  hash = 'SHA-512') {

  const key = await subtle.unwrapKey(
    format,
    wrappedKey,
    wrappingKey,
    'AES-KW',
    { name: 'HMAC', hash },
    true,
    ['sign', 'verify']);

  return key;
}
```

### Подпись и проверка

```js
const { subtle } = globalThis.crypto;

async function sign(key, data) {
  const ec = new TextEncoder();
  const signature =
    await subtle.sign('RSASSA-PKCS1-v1_5', key, ec.encode(data));
  return signature;
}

async function verify(key, signature, data) {
  const ec = new TextEncoder();
  const verified =
    await subtle.verify(
      'RSASSA-PKCS1-v1_5',
      key,
      signature,
      ec.encode(data));
  return verified;
}
```

### Получение битов и ключей

```js
const { subtle } = globalThis.crypto;

async function pbkdf2(pass, salt, iterations = 1000, length = 256) {
  const ec = new TextEncoder();
  const key = await subtle.importKey(
    'raw',
    ec.encode(pass),
    'PBKDF2',
    false,
    ['deriveBits']);
  const bits = await subtle.deriveBits({
    name: 'PBKDF2',
    hash: 'SHA-512',
    salt: ec.encode(salt),
    iterations,
  }, key, length);
  return bits;
}

async function pbkdf2Key(pass, salt, iterations = 1000, length = 256) {
  const ec = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    ec.encode(pass),
    'PBKDF2',
    false,
    ['deriveKey']);
  const key = await subtle.deriveKey({
    name: 'PBKDF2',
    hash: 'SHA-512',
    salt: ec.encode(salt),
    iterations,
  }, keyMaterial, {
    name: 'AES-GCM',
    length,
  }, true, ['encrypt', 'decrypt']);
  return key;
}
```

### Хеш (digest)

```js
const { subtle } = globalThis.crypto;

async function digest(data, algorithm = 'SHA-512') {
  const ec = new TextEncoder();
  const digest = await subtle.digest(algorithm, ec.encode(data));
  return digest;
}
```

### Проверка поддержки алгоритмов в рантайме {#checking-for-runtime-algorithm-support}

[`SubtleCrypto.supports()`](#static-method-subtlecryptosupportsoperation-algorithm-lengthoradditionalalgorithm) позволяет определять возможности в Web Crypto API
и выяснять, поддерживается ли заданный идентификатор алгоритма
(вместе с его параметрами) для указанной операции.

В этом примере из пароля выводится ключ с помощью Argon2, если доступен,
иначе PBKDF2; затем с ним шифруется и расшифровывается текст
с помощью AES-OCB, если доступен, иначе AES-GCM.

=== "MJS"

    ```js
    const { SubtleCrypto, crypto } = globalThis;
    
    const password = 'correct horse battery staple';
    const derivationAlg =
      SubtleCrypto.supports?.('importKey', 'Argon2id') ?
        'Argon2id' :
        'PBKDF2';
    const encryptionAlg =
      SubtleCrypto.supports?.('importKey', 'AES-OCB') ?
        'AES-OCB' :
        'AES-GCM';
    const passwordKey = await crypto.subtle.importKey(
      derivationAlg === 'Argon2id' ? 'raw-secret' : 'raw',
      new TextEncoder().encode(password),
      derivationAlg,
      false,
      ['deriveKey'],
    );
    const nonce = crypto.getRandomValues(new Uint8Array(16));
    const derivationParams =
      derivationAlg === 'Argon2id' ?
        {
          nonce,
          parallelism: 4,
          memory: 2 ** 21,
          passes: 1,
        } :
        {
          salt: nonce,
          iterations: 100_000,
          hash: 'SHA-256',
        };
    const key = await crypto.subtle.deriveKey(
      {
        name: derivationAlg,
        ...derivationParams,
      },
      passwordKey,
      {
        name: encryptionAlg,
        length: 256,
      },
      false,
      ['encrypt', 'decrypt'],
    );
    const plaintext = 'Hello, world!';
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await crypto.subtle.encrypt(
      { name: encryptionAlg, iv },
      key,
      new TextEncoder().encode(plaintext),
    );
    const decrypted = new TextDecoder().decode(await crypto.subtle.decrypt(
      { name: encryptionAlg, iv },
      key,
      encrypted,
    ));
    ```

## Матрица алгоритмов

Таблицы описывают алгоритмы, поддерживаемые реализацией Web Crypto API в Node.js,
и доступные для каждого из них API:

### API управления ключами

| Алгоритм                             | [`subtle.generateKey()`](#subtlegeneratekeyalgorithm-extractable-keyusages) | [`subtle.exportKey()`](#subtleexportkeyformat-key) | [`subtle.importKey()`](#subtleimportkeyformat-keydata-algorithm-extractable-keyusages) | [`subtle.getPublicKey()`](#subtlegetpublickeykey-keyusages) |
| ------------------------------------ | -------------------------- | ------------------------ | ------------------------ | --------------------------- |
| `'AES-CBC'`                          | ✔                          | ✔                        | ✔                        |                             |
| `'AES-CTR'`                          | ✔                          | ✔                        | ✔                        |                             |
| `'AES-GCM'`                          | ✔                          | ✔                        | ✔                        |                             |
| `'AES-KW'`                           | ✔                          | ✔                        | ✔                        |                             |
| `'AES-OCB'`                          | ✔                          | ✔                        | ✔                        |                             |
| `'Argon2d'`                          |                            |                          | ✔                        |                             |
| `'Argon2i'`                          |                            |                          | ✔                        |                             |
| `'Argon2id'`                         |                            |                          | ✔                        |                             |
| `'ChaCha20-Poly1305'`[^modern-algos] | ✔                          | ✔                        | ✔                        |                             |
| `'ECDH'`                             | ✔                          | ✔                        | ✔                        | ✔                           |
| `'ECDSA'`                            | ✔                          | ✔                        | ✔                        | ✔                           |
| `'Ed25519'`                          | ✔                          | ✔                        | ✔                        | ✔                           |
| `'Ed448'`[^secure-curves]            | ✔                          | ✔                        | ✔                        | ✔                           |
| `'HKDF'`                             |                            |                          | ✔                        |                             |
| `'HMAC'`                             | ✔                          | ✔                        | ✔                        |                             |
| `'KMAC128'`[^modern-algos]           | ✔                          | ✔                        | ✔                        |                             |
| `'KMAC256'`[^modern-algos]           | ✔                          | ✔                        | ✔                        |                             |
| `'ML-DSA-44'`[^modern-algos]         | ✔                          | ✔                        | ✔                        | ✔                           |
| `'ML-DSA-65'`[^modern-algos]         | ✔                          | ✔                        | ✔                        | ✔                           |
| `'ML-DSA-87'`[^modern-algos]         | ✔                          | ✔                        | ✔                        | ✔                           |
| `'ML-KEM-512'`[^modern-algos]        | ✔                          | ✔                        | ✔                        | ✔                           |
| `'ML-KEM-768'`[^modern-algos]        | ✔                          | ✔                        | ✔                        | ✔                           |
| `'ML-KEM-1024'`[^modern-algos]       | ✔                          | ✔                        | ✔                        | ✔                           |
| `'PBKDF2'`                           |                            |                          | ✔                        |                             |
| `'RSA-OAEP'`                         | ✔                          | ✔                        | ✔                        | ✔                           |
| `'RSA-PSS'`                          | ✔                          | ✔                        | ✔                        | ✔                           |
| `'RSASSA-PKCS1-v1_5'`                | ✔                          | ✔                        | ✔                        | ✔                           |
| `'X25519'`                           | ✔                          | ✔                        | ✔                        | ✔                           |
| `'X448'`[^secure-curves]             | ✔                          | ✔                        | ✔                        | ✔                           |

### API криптографических операций

**Условные обозначения столбцов:**

* **Шифрование**: [`subtle.encrypt()`](#subtleencryptalgorithm-key-data) / [`subtle.decrypt()`](#subtledecryptalgorithm-key-data)
* **Подписи и MAC**: [`subtle.sign()`](#subtlesignalgorithm-key-data) / [`subtle.verify()`](#subtleverifyalgorithm-key-signature-data)
* **Вывод ключа или битов**: [`subtle.deriveBits()`](#subtlederivebitsalgorithm-basekey-length) / [`subtle.deriveKey()`](#subtlederivekeyalgorithm-basekey-derivedkeyalgorithm-extractable-keyusages)
* **Упаковка ключа**: [`subtle.wrapKey()`](#subtlewrapkeyformat-key-wrappingkey-wrapalgo) / [`subtle.unwrapKey()`](#subtleunwrapkeyformat-wrappedkey-unwrappingkey-unwrapalgo-unwrappedkeyalgo-extractable-keyusages)
* **Инкапсуляция ключа**: [`subtle.encapsulateBits()`](#subtleencapsulatebitsencapsulationalgorithm-encapsulationkey) / [`subtle.decapsulateBits()`](#subtledecapsulatebitsdecapsulationalgorithm-decapsulationkey-ciphertext) /
  [`subtle.encapsulateKey()`](#subtleencapsulatekeyencapsulationalgorithm-encapsulationkey-sharedkeyalgorithm-extractable-usages) / [`subtle.decapsulateKey()`](#subtledecapsulatekeydecapsulationalgorithm-decapsulationkey-ciphertext-sharedkeyalgorithm-extractable-usages)
* **Хеш (digest)**: [`subtle.digest()`](#subtledigestalgorithm-data)

| Алгоритм                             | Шифрование | Подписи и MAC | Вывод ключа или битов | Упаковка ключа | Инкапсуляция ключа | Digest |
| ------------------------------------ | ---------- | ------------------ | ---------------------- | ------------ | ----------------- | ------ |
| `'AES-CBC'`                          | ✔          |                    |                        | ✔            |                   |        |
| `'AES-CTR'`                          | ✔          |                    |                        | ✔            |                   |        |
| `'AES-GCM'`                          | ✔          |                    |                        | ✔            |                   |        |
| `'AES-KW'`                           |            |                    |                        | ✔            |                   |        |
| `'AES-OCB'`                          | ✔          |                    |                        | ✔            |                   |        |
| `'Argon2d'`                          |            |                    | ✔                      |              |                   |        |
| `'Argon2i'`                          |            |                    | ✔                      |              |                   |        |
| `'Argon2id'`                         |            |                    | ✔                      |              |                   |        |
| `'ChaCha20-Poly1305'`[^modern-algos] | ✔          |                    |                        | ✔            |                   |        |
| `'cSHAKE128'`[^modern-algos]         |            |                    |                        |              |                   | ✔      |
| `'cSHAKE256'`[^modern-algos]         |            |                    |                        |              |                   | ✔      |
| `'ECDH'`                             |            |                    | ✔                      |              |                   |        |
| `'ECDSA'`                            |            | ✔                  |                        |              |                   |        |
| `'Ed25519'`                          |            | ✔                  |                        |              |                   |        |
| `'Ed448'`[^secure-curves]            |            | ✔                  |                        |              |                   |        |
| `'HKDF'`                             |            |                    | ✔                      |              |                   |        |
| `'HMAC'`                             |            | ✔                  |                        |              |                   |        |
| `'KMAC128'`[^modern-algos]           |            | ✔                  |                        |              |                   |        |
| `'KMAC256'`[^modern-algos]           |            | ✔                  |                        |              |                   |        |
| `'KT128'`[^modern-algos]             |            |                    |                        |              |                   | ✔      |
| `'KT256'`[^modern-algos]             |            |                    |                        |              |                   | ✔      |
| `'ML-DSA-44'`[^modern-algos]         |            | ✔                  |                        |              |                   |        |
| `'ML-DSA-65'`[^modern-algos]         |            | ✔                  |                        |              |                   |        |
| `'ML-DSA-87'`[^modern-algos]         |            | ✔                  |                        |              |                   |        |
| `'ML-KEM-512'`[^modern-algos]        |            |                    |                        |              | ✔                 |        |
| `'ML-KEM-768'`[^modern-algos]        |            |                    |                        |              | ✔                 |        |
| `'ML-KEM-1024'`[^modern-algos]       |            |                    |                        |              | ✔                 |        |
| `'PBKDF2'`                           |            |                    | ✔                      |              |                   |        |
| `'RSA-OAEP'`                         | ✔          |                    |                        | ✔            |                   |        |
| `'RSA-PSS'`                          |            | ✔                  |                        |              |                   |        |
| `'RSASSA-PKCS1-v1_5'`                |            | ✔                  |                        |              |                   |        |
| `'SHA-1'`                            |            |                    |                        |              |                   | ✔      |
| `'SHA-256'`                          |            |                    |                        |              |                   | ✔      |
| `'SHA-384'`                          |            |                    |                        |              |                   | ✔      |
| `'SHA-512'`                          |            |                    |                        |              |                   | ✔      |
| `'SHA3-256'`[^modern-algos]          |            |                    |                        |              |                   | ✔      |
| `'SHA3-384'`[^modern-algos]          |            |                    |                        |              |                   | ✔      |
| `'SHA3-512'`[^modern-algos]          |            |                    |                        |              |                   | ✔      |
| `'TurboSHAKE128'`[^modern-algos]     |            |                    |                        |              |                   | ✔      |
| `'TurboSHAKE256'`[^modern-algos]     |            |                    |                        |              |                   | ✔      |
| `'X25519'`                           |            |                    | ✔                      |              |                   |        |
| `'X448'`[^secure-curves]             |            |                    | ✔                      |              |                   |        |

## Класс: `Crypto`

<!-- YAML
added: v15.0.0
-->

`globalThis.crypto` — это экземпляр класса `Crypto`.
Класс `Crypto` — синглтон, открывающий доступ к остальной части
криптографического API.

### `crypto.subtle`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<SubtleCrypto>`](webcrypto.md)

Предоставляет доступ к API `SubtleCrypto`.

### `crypto.getRandomValues(typedArray)`

<!-- YAML
added: v15.0.0
-->

* `typedArray` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
* Возвращает: [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)

Генерирует криптографически стойкие случайные значения. Переданный `typedArray`
заполняется случайными значениями, возвращается ссылка на `typedArray`.

`typedArray` должен быть экземпляром целочисленного [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray),
то есть `Float32Array` и `Float64Array` не принимаются.

Будет выброшена ошибка, если размер `typedArray` превышает 65 536 байт.

### `crypto.randomUUID()`

<!-- YAML
added: v16.7.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует случайный UUID версии 4 по [RFC 4122][RFC 4122]. UUID создаётся с помощью
криптографически стойкого генератора псевдослучайных чисел.

## Класс: `CryptoKey`

<!-- YAML
added: v15.0.0
-->

### `cryptoKey.algorithm`

<!-- YAML
added: v15.0.0
-->

<!--lint disable maximum-line-length remark-lint-->

* Тип: [`<KeyAlgorithm>`](webcrypto.md) | [`<RsaHashedKeyAlgorithm>`](webcrypto.md) | [`<EcKeyAlgorithm>`](webcrypto.md) | [`<AesKeyAlgorithm>`](webcrypto.md) | [`<HmacKeyAlgorithm>`](webcrypto.md) | [`<KmacKeyAlgorithm>`](webcrypto.md)

<!--lint enable maximum-line-length remark-lint-->

Объект с описанием алгоритма, для которого предназначен ключ, вместе с
дополнительными параметрами, зависящими от алгоритма.

Только для чтения.

### `cryptoKey.extractable`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, [CryptoKey](webcrypto.md#class-cryptokey) можно извлечь через
[`subtle.exportKey()`](#subtleexportkeyformat-key) или [`subtle.wrapKey()`](#subtlewrapkeyformat-key-wrappingkey-wrapalgo).

Только для чтения.

### `cryptoKey.type`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из `'secret'`, `'private'` или `'public'`.

Строка, указывающая, является ли ключ симметричным (`'secret'`) или
асимметричным (`'private'` или `'public'`).

### `cryptoKey.usages`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Массив строк с операциями, для которых может использоваться ключ.

Возможные варианты использования:

* `'encrypt'` — разрешает использовать ключ с [`subtle.encrypt()`](#subtleencryptalgorithm-key-data)
* `'decrypt'` — разрешает использовать ключ с [`subtle.decrypt()`](#subtledecryptalgorithm-key-data)
* `'sign'` — разрешает использовать ключ с [`subtle.sign()`](#subtlesignalgorithm-key-data)
* `'verify'` — разрешает использовать ключ с [`subtle.verify()`](#subtleverifyalgorithm-key-signature-data)
* `'deriveKey'` — разрешает использовать ключ с [`subtle.deriveKey()`](#subtlederivekeyalgorithm-basekey-derivedkeyalgorithm-extractable-keyusages)
* `'deriveBits'` — разрешает использовать ключ с [`subtle.deriveBits()`](#subtlederivebitsalgorithm-basekey-length)
* `'encapsulateBits'` — разрешает использовать ключ с [`subtle.encapsulateBits()`](#subtleencapsulatebitsencapsulationalgorithm-encapsulationkey)
* `'decapsulateBits'` — разрешает использовать ключ с [`subtle.decapsulateBits()`](#subtledecapsulatebitsdecapsulationalgorithm-decapsulationkey-ciphertext)
* `'encapsulateKey'` — разрешает использовать ключ с [`subtle.encapsulateKey()`](#subtleencapsulatekeyencapsulationalgorithm-encapsulationkey-sharedkeyalgorithm-extractable-usages)
* `'decapsulateKey'` — разрешает использовать ключ с [`subtle.decapsulateKey()`](#subtledecapsulatekeydecapsulationalgorithm-decapsulationkey-ciphertext-sharedkeyalgorithm-extractable-usages)
* `'wrapKey'` — разрешает использовать ключ с [`subtle.wrapKey()`](#subtlewrapkeyformat-key-wrappingkey-wrapalgo)
* `'unwrapKey'` — разрешает использовать ключ с [`subtle.unwrapKey()`](#subtleunwrapkeyformat-wrappedkey-unwrappingkey-unwrapalgo-unwrappedkeyalgo-extractable-keyusages)

Допустимые варианты зависят от алгоритма ключа (см. `cryptokey.algorithm.name`).

**Условные обозначения столбцов:**

* **Шифрование**: [`subtle.encrypt()`](#subtleencryptalgorithm-key-data) / [`subtle.decrypt()`](#subtledecryptalgorithm-key-data)
* **Подписи и MAC**: [`subtle.sign()`](#subtlesignalgorithm-key-data) / [`subtle.verify()`](#subtleverifyalgorithm-key-signature-data)
* **Вывод ключа или битов**: [`subtle.deriveBits()`](#subtlederivebitsalgorithm-basekey-length) / [`subtle.deriveKey()`](#subtlederivekeyalgorithm-basekey-derivedkeyalgorithm-extractable-keyusages)
* **Упаковка ключа**: [`subtle.wrapKey()`](#subtlewrapkeyformat-key-wrappingkey-wrapalgo) / [`subtle.unwrapKey()`](#subtleunwrapkeyformat-wrappedkey-unwrappingkey-unwrapalgo-unwrappedkeyalgo-extractable-keyusages)
* **Инкапсуляция ключа**: [`subtle.encapsulateBits()`](#subtleencapsulatebitsencapsulationalgorithm-encapsulationkey) / [`subtle.decapsulateBits()`](#subtledecapsulatebitsdecapsulationalgorithm-decapsulationkey-ciphertext) /
  [`subtle.encapsulateKey()`](#subtleencapsulatekeyencapsulationalgorithm-encapsulationkey-sharedkeyalgorithm-extractable-usages) / [`subtle.decapsulateKey()`](#subtledecapsulatekeydecapsulationalgorithm-decapsulationkey-ciphertext-sharedkeyalgorithm-extractable-usages)

| Поддерживаемый алгоритм ключа        | Шифрование | Подписи и MAC | Вывод ключа или битов | Упаковка ключа | Инкапсуляция ключа |
| ------------------------------------ | ---------- | ------------------ | ---------------------- | ------------ | ----------------- |
| `'AES-CBC'`                          | ✔          |                    |                        | ✔            |                   |
| `'AES-CTR'`                          | ✔          |                    |                        | ✔            |                   |
| `'AES-GCM'`                          | ✔          |                    |                        | ✔            |                   |
| `'AES-KW'`                           |            |                    |                        | ✔            |                   |
| `'AES-OCB'`                          | ✔          |                    |                        | ✔            |                   |
| `'Argon2d'`                          |            |                    | ✔                      |              |                   |
| `'Argon2i'`                          |            |                    | ✔                      |              |                   |
| `'Argon2id'`                         |            |                    | ✔                      |              |                   |
| `'ChaCha20-Poly1305'`[^modern-algos] | ✔          |                    |                        | ✔            |                   |
| `'ECDH'`                             |            |                    | ✔                      |              |                   |
| `'ECDSA'`                            |            | ✔                  |                        |              |                   |
| `'Ed25519'`                          |            | ✔                  |                        |              |                   |
| `'Ed448'`[^secure-curves]            |            | ✔                  |                        |              |                   |
| `'HDKF'`                             |            |                    | ✔                      |              |                   |
| `'HMAC'`                             |            | ✔                  |                        |              |                   |
| `'KMAC128'`[^modern-algos]           |            | ✔                  |                        |              |                   |
| `'KMAC256'`[^modern-algos]           |            | ✔                  |                        |              |                   |
| `'ML-DSA-44'`[^modern-algos]         |            | ✔                  |                        |              |                   |
| `'ML-DSA-65'`[^modern-algos]         |            | ✔                  |                        |              |                   |
| `'ML-DSA-87'`[^modern-algos]         |            | ✔                  |                        |              |                   |
| `'ML-KEM-512'`[^modern-algos]        |            |                    |                        |              | ✔                 |
| `'ML-KEM-768'`[^modern-algos]        |            |                    |                        |              | ✔                 |
| `'ML-KEM-1024'`[^modern-algos]       |            |                    |                        |              | ✔                 |
| `'PBKDF2'`                           |            |                    | ✔                      |              |                   |
| `'RSA-OAEP'`                         | ✔          |                    |                        | ✔            |                   |
| `'RSA-PSS'`                          |            | ✔                  |                        |              |                   |
| `'RSASSA-PKCS1-v1_5'`                |            | ✔                  |                        |              |                   |
| `'X25519'`                           |            |                    | ✔                      |              |                   |
| `'X448'`[^secure-curves]             |            |                    | ✔                      |              |                   |

## Класс: `CryptoKeyPair`

<!-- YAML
added: v15.0.0
-->

`CryptoKeyPair` — простой объект-словарь со свойствами `publicKey` и
`privateKey`, представляющий асимметричную пару ключей.

### `cryptoKeyPair.privateKey`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<CryptoKey>`](webcrypto.md#class-cryptokey) — [CryptoKey](webcrypto.md#class-cryptokey), у которого `type` будет `'private'`.

### `cryptoKeyPair.publicKey`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<CryptoKey>`](webcrypto.md#class-cryptokey) — [CryptoKey](webcrypto.md#class-cryptokey), у которого `type` будет `'public'`.

## Класс: `SubtleCrypto`

<!-- YAML
added: v15.0.0
-->

### Статический метод: `SubtleCrypto.supports(operation, algorithm[, lengthOrAdditionalAlgorithm])`

<!-- YAML
added: v24.7.0
-->

> Стабильность: 1.1 – Активная разработка

<!--lint disable maximum-line-length remark-lint-->

* `operation` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `"encrypt"`, `"decrypt"`, `"sign"`, `"verify"`, `"digest"`, `"generateKey"`, `"deriveKey"`, `"deriveBits"`, `"importKey"`, `"exportKey"`, `"getPublicKey"`, `"wrapKey"`, `"unwrapKey"`, `"encapsulateBits"`, `"encapsulateKey"`, `"decapsulateBits"` или `"decapsulateKey"`
* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)
* `lengthOrAdditionalAlgorithm` null | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | undefined В зависимости от операции: игнорируется; либо значение аргумента длины, если операция — `"deriveBits"`; либо алгоритм выводимого ключа при `"deriveKey"`; либо алгоритм ключа, экспортируемого перед упаковкой при `"wrapKey"`; либо алгоритм ключа, импортируемого после распаковки при `"unwrapKey"`; либо алгоритм ключа, импортируемого после инкапсуляции/декапсуляции при `"encapsulateKey"` или `"decapsulateKey"`. **По умолчанию:** `null`, если операция — `"deriveBits"`, иначе `undefined`.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, поддерживает ли реализация заданную операцию

<!--lint enable maximum-line-length remark-lint-->

Позволяет определять возможности в Web Crypto API
и выяснять, поддерживается ли заданный идентификатор алгоритма
(вместе с его параметрами) для указанной операции.

См. раздел [Checking for runtime algorithm support][Checking for runtime algorithm support] с примером использования этого метода.

### `subtle.decapsulateBits(decapsulationAlgorithm, decapsulationKey, ciphertext)`

<!-- YAML
added: v24.7.0
-->

> Стабильность: 1.1 – Активная разработка

* `decapsulationAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)
* `decapsulationKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `ciphertext` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Получатель сообщения использует свой асимметричный закрытый ключ, чтобы расшифровать
«инкапсулированный ключ» (`ciphertext`) и восстановить временный симметричный
ключ (в виде [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)), которым затем расшифровывается сообщение.

В настоящее время поддерживаются следующие алгоритмы:

* `'ML-KEM-512'`[^modern-algos]
* `'ML-KEM-768'`[^modern-algos]
* `'ML-KEM-1024'`[^modern-algos]

### `subtle.decapsulateKey(decapsulationAlgorithm, decapsulationKey, ciphertext, sharedKeyAlgorithm, extractable, usages)`

<!-- YAML
added: v24.7.0
-->

> Стабильность: 1.1 – Активная разработка

* `decapsulationAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)
* `decapsulationKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `ciphertext` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* `sharedKeyAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md) | [`<AesDerivedKeyParams>`](webcrypto.md) | [`<KmacImportParams>`](webcrypto.md)
* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `usages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [CryptoKey](webcrypto.md#class-cryptokey).

Получатель сообщения использует свой асимметричный закрытый ключ, чтобы расшифровать
«инкапсулированный ключ» (`ciphertext`) и восстановить временный симметричный
ключ (в виде [CryptoKey](webcrypto.md#class-cryptokey)), которым затем расшифровывается сообщение.

В настоящее время поддерживаются следующие алгоритмы:

* `'ML-KEM-512'`[^modern-algos]
* `'ML-KEM-768'`[^modern-algos]
* `'ML-KEM-1024'`[^modern-algos]

### `subtle.decrypt(algorithm, key, data)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59539
    description: Алгоритм AES-OCB теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритм AES-OCB теперь поддерживается. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |

* `algorithm` [`<RsaOaepParams>`](webcrypto.md) | [`<AesCtrParams>`](webcrypto.md) | [`<AesCbcParams>`](webcrypto.md) | [`<AeadParams>`](webcrypto.md)
* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

По методу и параметрам из `algorithm` и ключевому материалу из `key`
метод пытается расшифровать переданные `data`. При успехе промис выполняется
с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим открытый текст.

В настоящее время поддерживаются следующие алгоритмы:

* `'AES-CBC'`
* `'AES-CTR'`
* `'AES-GCM'`
* `'AES-OCB'`[^modern-algos]
* `'ChaCha20-Poly1305'`[^modern-algos]
* `'RSA-OAEP'`

### `subtle.deriveBits(algorithm, baseKey[, length])`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59544
    description: Алгоритмы Argon2 теперь поддерживаются.
  - version:
    - v22.5.0
    - v20.17.0
    - v18.20.5
    pr-url: https://github.com/nodejs/node/pull/53601
    description: Параметр length теперь необязателен для `'ECDH'`, `'X25519'`
                 и `'X448'`.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'X25519'` и `'X448'`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Алгоритмы Argon2 теперь поддерживаются. |
    | v22.5.0, v20.17.0, v18.20.5 | Параметр length теперь необязателен для `'ECDH'`, `'X25519'` и `'X448'`. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'X25519'` и `'X448'`. |

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<EcdhKeyDeriveParams>`](webcrypto.md) | [`<HkdfParams>`](webcrypto.md) | [`<Pbkdf2Params>`](webcrypto.md) | [`<Argon2Params>`](webcrypto.md)
* `baseKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `length` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

<!--lint enable maximum-line-length remark-lint-->

По методу и параметрам из `algorithm` и ключевому материалу из `baseKey`
метод пытается сгенерировать `length` бит.

Если `length` не указан или равен `null`, генерируется максимальное число бит для данного
алгоритма. Так допускается для `'ECDH'`, `'X25519'` и `'X448'`[^secure-curves];
для остальных алгоритмов `length` должен быть числом.

При успехе промис выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
содержащим сгенерированные данные.

В настоящее время поддерживаются следующие алгоритмы:

* `'Argon2d'`[^modern-algos]
* `'Argon2i'`[^modern-algos]
* `'Argon2id'`[^modern-algos]
* `'ECDH'`
* `'HKDF'`
* `'PBKDF2'`
* `'X25519'`
* `'X448'`[^secure-curves]

### `subtle.deriveKey(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59544
    description: Алгоритмы Argon2 теперь поддерживаются.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'X25519'` и `'X448'`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Алгоритмы Argon2 теперь поддерживаются. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'X25519'` и `'X448'`. |

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<EcdhKeyDeriveParams>`](webcrypto.md) | [`<HkdfParams>`](webcrypto.md) | [`<Pbkdf2Params>`](webcrypto.md) | [`<Argon2Params>`](webcrypto.md)
* `baseKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `derivedKeyAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md) | [`<AesDerivedKeyParams>`](webcrypto.md) | [`<KmacImportParams>`](webcrypto.md)
* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [CryptoKey](webcrypto.md#class-cryptokey).

<!--lint enable maximum-line-length remark-lint-->

По методу и параметрам из `algorithm` и ключевому материалу из `baseKey`
метод пытается сгенерировать новый [CryptoKey](webcrypto.md#class-cryptokey) по методу и параметрам в `derivedKeyAlgorithm`.

Вызов этого метода эквивалентен вызову [`subtle.deriveBits()`](#subtlederivebitsalgorithm-basekey-length) для
получения сырого ключевого материала с последующей передачей результата в
[`subtle.importKey()`](#subtleimportkeyformat-keydata-algorithm-extractable-keyusages) с аргументами `deriveKeyAlgorithm`, `extractable` и
`keyUsages`.

В настоящее время поддерживаются следующие алгоритмы:

* `'Argon2d'`[^modern-algos]
* `'Argon2i'`[^modern-algos]
* `'Argon2id'`[^modern-algos]
* `'ECDH'`
* `'HKDF'`
* `'PBKDF2'`
* `'X25519'`
* `'X448'`[^secure-curves]

### `subtle.digest(algorithm, data)`

<!-- YAML
added: v15.0.0
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/62183
    description: Алгоритмы TurboSHAKE и KangarooTwelve
      теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHAKE теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.9.0 | Алгоритмы TurboSHAKE и KangarooTwelve теперь поддерживаются. |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |
    | v24.7.0 | Алгоритмы SHAKE теперь поддерживаются. |

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<CShakeParams>`](webcrypto.md) | [`<TurboShakeParams>`](webcrypto.md) | [`<KangarooTwelveParams>`](webcrypto.md)
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

По методу из `algorithm` метод пытается вычислить дайджест `data`. При успехе промис
выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим вычисленный дайджест.

Если `algorithm` задан как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), допустимы значения:

* `'cSHAKE128'`[^modern-algos]
* `'cSHAKE256'`[^modern-algos]
* `'KT128'`[^modern-algos]
* `'KT256'`[^modern-algos]
* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]
* `'TurboSHAKE128'`[^modern-algos]
* `'TurboSHAKE256'`[^modern-algos]

Если `algorithm` задан как [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), у него должно быть свойство `name`
со значением из списка выше.

### `subtle.encapsulateBits(encapsulationAlgorithm, encapsulationKey)`

<!-- YAML
added: v24.7.0
-->

> Стабильность: 1.1 – Активная разработка

* `encapsulationAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)
* `encapsulationKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [EncapsulatedBits](webcrypto.md).

Использует асимметричный открытый ключ получателя сообщения для шифрования временного симметричного ключа.
Этот зашифрованный ключ — «инкапсулированный ключ» в виде [EncapsulatedBits](webcrypto.md).

В настоящее время поддерживаются следующие алгоритмы:

* `'ML-KEM-512'`[^modern-algos]
* `'ML-KEM-768'`[^modern-algos]
* `'ML-KEM-1024'`[^modern-algos]

### `subtle.encapsulateKey(encapsulationAlgorithm, encapsulationKey, sharedKeyAlgorithm, extractable, usages)`

<!-- YAML
added: v24.7.0
-->

> Стабильность: 1.1 – Активная разработка

* `encapsulationAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)
* `encapsulationKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `sharedKeyAlgorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md) | [`<AesDerivedKeyParams>`](webcrypto.md) | [`<KmacImportParams>`](webcrypto.md)
* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `usages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [EncapsulatedKey](webcrypto.md).

Использует асимметричный открытый ключ получателя сообщения для шифрования временного симметричного ключа.
Этот зашифрованный ключ — «инкапсулированный ключ» в виде [EncapsulatedKey](webcrypto.md).

В настоящее время поддерживаются следующие алгоритмы:

* `'ML-KEM-512'`[^modern-algos]
* `'ML-KEM-768'`[^modern-algos]
* `'ML-KEM-1024'`[^modern-algos]

### `subtle.encrypt(algorithm, key, data)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59539
    description: Алгоритм AES-OCB теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритм AES-OCB теперь поддерживается. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |

* `algorithm` [`<RsaOaepParams>`](webcrypto.md) | [`<AesCtrParams>`](webcrypto.md) | [`<AesCbcParams>`](webcrypto.md) | [`<AeadParams>`](webcrypto.md)
* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

По методу и параметрам из `algorithm` и ключевому материалу из `key`
метод пытается зашифровать `data`.
При успехе промис выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
содержащим шифротекст.

В настоящее время поддерживаются следующие алгоритмы:

* `'AES-CBC'`
* `'AES-CTR'`
* `'AES-GCM'`
* `'AES-OCB'`[^modern-algos]
* `'ChaCha20-Poly1305'`[^modern-algos]
* `'RSA-OAEP'`

### `subtle.exportKey(format, key)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59647
    description: Алгоритмы KMAC теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59569
    description: Алгоритмы ML-KEM теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы ML-DSA теперь поддерживаются.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'Ed25519'`, `'Ed448'`, `'X25519'` и `'X448'`.
  - version: v15.9.0
    pr-url: https://github.com/nodejs/node/pull/37203
    description: Удалён экспорт JWK `'NODE-DSA'`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Алгоритмы KMAC теперь поддерживаются. |
    | v24.7.0 | Алгоритмы ML-KEM теперь поддерживаются. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |
    | v24.7.0 | Алгоритмы ML-DSA теперь поддерживаются. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'Ed25519'`, `'Ed448'`, `'X25519'` и `'X448'`. |
    | v15.9.0 | Удалён экспорт JWK `'NODE-DSA'`. |

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть одним из `'raw'`, `'pkcs8'`, `'spki'`, `'jwk'`, `'raw-secret'`[^modern-algos],
  `'raw-public'`[^modern-algos] или `'raw-seed'`[^modern-algos].
* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object).

Экспортирует ключ в указанный формат, если он поддерживается.

Если [CryptoKey](webcrypto.md#class-cryptokey) не извлекаемый, промис будет отклонён.

Если `format` — `'pkcs8'` или `'spki'` и экспорт успешен,
промис выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим данные ключа.

Если `format` — `'jwk'` и экспорт успешен, промис выполняется
с объектом JavaScript, соответствующим спецификации [JSON Web Key][JSON Web Key].

| Поддерживаемый алгоритм ключа        | `'spki'` | `'pkcs8'` | `'jwk'` | `'raw'` | `'raw-secret'` | `'raw-public'` | `'raw-seed'` |
| ------------------------------------ | -------- | --------- | ------- | ------- | -------------- | -------------- | ------------ |
| `'AES-CBC'`                          |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-CTR'`                          |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-GCM'`                          |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-KW'`                           |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-OCB'`[^modern-algos]           |          |           | ✔       |         | ✔              |                |              |
| `'ChaCha20-Poly1305'`[^modern-algos] |          |           | ✔       |         | ✔              |                |              |
| `'ECDH'`                             | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'ECDSA'`                            | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'Ed25519'`                          | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'Ed448'`[^secure-curves]            | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'HMAC'`                             |          |           | ✔       | ✔       | ✔              |                |              |
| `'KMAC128'`[^modern-algos]           |          |           | ✔       |         | ✔              |                |              |
| `'KMAC256'`[^modern-algos]           |          |           | ✔       |         | ✔              |                |              |
| `'ML-DSA-44'`[^modern-algos]         | ✔        | ✔         | ✔       |         |                | ✔              | ✔            |
| `'ML-DSA-65'`[^modern-algos]         | ✔        | ✔         | ✔       |         |                | ✔              | ✔            |
| `'ML-DSA-87'`[^modern-algos]         | ✔        | ✔         | ✔       |         |                | ✔              | ✔            |
| `'ML-KEM-512'`[^modern-algos]        | ✔        | ✔         |         |         |                | ✔              | ✔            |
| `'ML-KEM-768'`[^modern-algos]        | ✔        | ✔         |         |         |                | ✔              | ✔            |
| `'ML-KEM-1024'`[^modern-algos]       | ✔        | ✔         |         |         |                | ✔              | ✔            |
| `'RSA-OAEP'`                         | ✔        | ✔         | ✔       |         |                |                |              |
| `'RSA-PSS'`                          | ✔        | ✔         | ✔       |         |                |                |              |
| `'RSASSA-PKCS1-v1_5'`                | ✔        | ✔         | ✔       |         |                |                |              |

### `subtle.getPublicKey(key, keyUsages)`

<!-- YAML
added: v24.7.0
-->

> Стабильность: 1.1 – Активная разработка

* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey) Закрытый ключ, из которого выводится соответствующий открытый ключ.
* `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [CryptoKey](webcrypto.md#class-cryptokey).

Выводит открытый ключ из заданного закрытого ключа.

### `subtle.generateKey(algorithm, extractable, keyUsages)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59647
    description: Алгоритмы KMAC теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59569
    description: Алгоритмы ML-KEM теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы ML-DSA теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Алгоритмы KMAC теперь поддерживаются. |
    | v24.7.0 | Алгоритмы ML-KEM теперь поддерживаются. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |
    | v24.7.0 | Алгоритмы ML-DSA теперь поддерживаются. |

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaHashedKeyGenParams>`](webcrypto.md) | [`<EcKeyGenParams>`](webcrypto.md) | [`<HmacKeyGenParams>`](webcrypto.md) | [`<AesKeyGenParams>`](webcrypto.md) | [`<KmacKeyGenParams>`](webcrypto.md)

<!--lint enable maximum-line-length remark-lint-->

* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [CryptoKey](webcrypto.md#class-cryptokey) | [CryptoKeyPair](webcrypto.md).

По параметрам из `algorithm` метод
пытается сгенерировать новый ключевой материал. В зависимости от алгоритма
получается один [CryptoKey](webcrypto.md#class-cryptokey) или [CryptoKeyPair](webcrypto.md).

Алгоритмы, при которых генерируется [CryptoKeyPair](webcrypto.md) (открытый и закрытый ключ):

* `'ECDH'`
* `'ECDSA'`
* `'Ed25519'`
* `'Ed448'`[^secure-curves]
* `'ML-DSA-44'`[^modern-algos]
* `'ML-DSA-65'`[^modern-algos]
* `'ML-DSA-87'`[^modern-algos]
* `'ML-KEM-512'`[^modern-algos]
* `'ML-KEM-768'`[^modern-algos]
* `'ML-KEM-1024'`[^modern-algos]
* `'RSA-OAEP'`
* `'RSA-PSS'`
* `'RSASSA-PKCS1-v1_5'`
* `'X25519'`
* `'X448'`[^secure-curves]

Алгоритмы, при которых генерируется [CryptoKey](webcrypto.md#class-cryptokey) (секретный ключ):

* `'AES-CBC'`
* `'AES-CTR'`
* `'AES-GCM'`
* `'AES-KW'`
* `'AES-OCB'`[^modern-algos]
* `'ChaCha20-Poly1305'`[^modern-algos]
* `'HMAC'`
* `'KMAC128'`[^modern-algos]
* `'KMAC256'`[^modern-algos]

### `subtle.importKey(format, keyData, algorithm, extractable, keyUsages)`

<!-- YAML
added: v15.0.0
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/62218
    description: Импорт ключей ML-DSA и ML-KEM в PKCS#8
      без seed больше не поддерживается.
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59647
    description: Алгоритмы KMAC теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59569
    description: Алгоритмы ML-KEM теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы ML-DSA теперь поддерживаются.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'Ed25519'`, `'Ed448'`, `'X25519'` и `'X448'`.
  - version: v15.9.0
    pr-url: https://github.com/nodejs/node/pull/37203
    description: Удалён импорт JWK `'NODE-DSA'`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.9.0 | Импорт ключей ML-DSA и ML-KEM в PKCS#8 без seed больше не поддерживается. |
    | v24.8.0 | Алгоритмы KMAC теперь поддерживаются. |
    | v24.7.0 | Алгоритмы ML-KEM теперь поддерживаются. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |
    | v24.7.0 | Алгоритмы ML-DSA теперь поддерживаются. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'Ed25519'`, `'Ed448'`, `'X25519'` и `'X448'`. |
    | v15.9.0 | Удалён импорт JWK `'NODE-DSA'`. |

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть одним из `'raw'`, `'pkcs8'`, `'spki'`, `'jwk'`, `'raw-secret'`[^modern-algos],
  `'raw-public'`[^modern-algos] или `'raw-seed'`[^modern-algos].
* `keyData` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaHashedImportParams>`](webcrypto.md) | [`<EcKeyImportParams>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md) | [`<KmacImportParams>`](webcrypto.md)

<!--lint enable maximum-line-length remark-lint-->

* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [CryptoKey](webcrypto.md#class-cryptokey).

Метод пытается интерпретировать переданные `keyData`
в формате `format` и создать экземпляр [CryptoKey](webcrypto.md#class-cryptokey) с использованием
`algorithm`, `extractable` и `keyUsages`. При успешном импорте промис
выполняется с [CryptoKey](webcrypto.md#class-cryptokey), представляющим ключевой материал.

При импорте ключей алгоритмов KDF `extractable` должен быть `false`.

В настоящее время поддерживаются следующие алгоритмы:

| Поддерживаемый алгоритм ключа        | `'spki'` | `'pkcs8'` | `'jwk'` | `'raw'` | `'raw-secret'` | `'raw-public'` | `'raw-seed'` |
| ------------------------------------ | -------- | --------- | ------- | ------- | -------------- | -------------- | ------------ |
| `'AES-CBC'`                          |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-CTR'`                          |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-GCM'`                          |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-KW'`                           |          |           | ✔       | ✔       | ✔              |                |              |
| `'AES-OCB'`[^modern-algos]           |          |           | ✔       |         | ✔              |                |              |
| `'Argon2d'`[^modern-algos]           |          |           |         |         | ✔              |                |              |
| `'Argon2i'`[^modern-algos]           |          |           |         |         | ✔              |                |              |
| `'Argon2id'`[^modern-algos]          |          |           |         |         | ✔              |                |              |
| `'ChaCha20-Poly1305'`[^modern-algos] |          |           | ✔       |         | ✔              |                |              |
| `'ECDH'`                             | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'ECDSA'`                            | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'Ed25519'`                          | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'Ed448'`[^secure-curves]            | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'HDKF'`                             |          |           |         | ✔       | ✔              |                |              |
| `'HMAC'`                             |          |           | ✔       | ✔       | ✔              |                |              |
| `'KMAC128'`[^modern-algos]           |          |           | ✔       |         | ✔              |                |              |
| `'KMAC256'`[^modern-algos]           |          |           | ✔       |         | ✔              |                |              |
| `'ML-DSA-44'`[^modern-algos]         | ✔        | ✔         | ✔       |         |                | ✔              | ✔            |
| `'ML-DSA-65'`[^modern-algos]         | ✔        | ✔         | ✔       |         |                | ✔              | ✔            |
| `'ML-DSA-87'`[^modern-algos]         | ✔        | ✔         | ✔       |         |                | ✔              | ✔            |
| `'ML-KEM-512'`[^modern-algos]        | ✔        | ✔         |         |         |                | ✔              | ✔            |
| `'ML-KEM-768'`[^modern-algos]        | ✔        | ✔         |         |         |                | ✔              | ✔            |
| `'ML-KEM-1024'`[^modern-algos]       | ✔        | ✔         |         |         |                | ✔              | ✔            |
| `'PBKDF2'`                           |          |           |         | ✔       | ✔              |                |              |
| `'RSA-OAEP'`                         | ✔        | ✔         | ✔       |         |                |                |              |
| `'RSA-PSS'`                          | ✔        | ✔         | ✔       |         |                |                |              |
| `'RSASSA-PKCS1-v1_5'`                | ✔        | ✔         | ✔       |         |                |                |              |
| `'X25519'`                           | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |
| `'X448'`[^secure-curves]             | ✔        | ✔         | ✔       | ✔       |                | ✔              |              |

### `subtle.sign(algorithm, key, data)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59647
    description: Алгоритмы KMAC теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы ML-DSA теперь поддерживаются.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'Ed25519'` и `'Ed448'`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Алгоритмы KMAC теперь поддерживаются. |
    | v24.7.0 | Алгоритмы ML-DSA теперь поддерживаются. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'Ed25519'` и `'Ed448'`. |

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaPssParams>`](webcrypto.md) | [`<EcdsaParams>`](webcrypto.md) | [`<ContextParams>`](webcrypto.md) | [`<KmacParams>`](webcrypto.md)
* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

<!--lint enable maximum-line-length remark-lint-->

По методу и параметрам из `algorithm` и ключевому материалу из `key`
метод пытается сформировать криптографическую
подпись `data`. При успехе промис выполняется с
[ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим подпись.

В настоящее время поддерживаются следующие алгоритмы:

* `'ECDSA'`
* `'Ed25519'`
* `'Ed448'`[^secure-curves]
* `'HMAC'`
* `'KMAC128'`[^modern-algos]
* `'KMAC256'`[^modern-algos]
* `'ML-DSA-44'`[^modern-algos]
* `'ML-DSA-65'`[^modern-algos]
* `'ML-DSA-87'`[^modern-algos]
* `'RSA-PSS'`
* `'RSASSA-PKCS1-v1_5'`

### `subtle.unwrapKey(format, wrappedKey, unwrappingKey, unwrapAlgo, unwrappedKeyAlgo, extractable, keyUsages)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59539
    description: Алгоритм AES-OCB теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритм AES-OCB теперь поддерживается. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть одним из `'raw'`, `'pkcs8'`, `'spki'`, `'jwk'`, `'raw-secret'`[^modern-algos],
  `'raw-public'`[^modern-algos] или `'raw-seed'`[^modern-algos].
* `wrappedKey` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* `unwrappingKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)

<!--lint disable maximum-line-length remark-lint-->

* `unwrapAlgo` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaOaepParams>`](webcrypto.md) | [`<AesCtrParams>`](webcrypto.md) | [`<AesCbcParams>`](webcrypto.md) | [`<AeadParams>`](webcrypto.md)
* `unwrappedKeyAlgo` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaHashedImportParams>`](webcrypto.md) | [`<EcKeyImportParams>`](webcrypto.md) | [`<HmacImportParams>`](webcrypto.md) | [`<KmacImportParams>`](webcrypto.md)

<!--lint enable maximum-line-length remark-lint-->

* `extractable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `keyUsages` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key usages][Key usages].
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [CryptoKey](webcrypto.md#class-cryptokey).

В криптографии «упаковка ключа» означает экспорт и последующее шифрование
ключевого материала. Метод пытается расшифровать упакованный
ключ и создать экземпляр [CryptoKey](webcrypto.md#class-cryptokey). Это эквивалентно сначала вызову
[`subtle.decrypt()`](#subtledecryptalgorithm-key-data) для зашифрованных данных ключа (аргументы `wrappedKey`,
`unwrapAlgo` и `unwrappingKey`), затем передаче результата в
[`subtle.importKey()`](#subtleimportkeyformat-keydata-algorithm-extractable-keyusages) с аргументами `unwrappedKeyAlgo`,
`extractable` и `keyUsages`. При успехе промис выполняется с объектом [CryptoKey](webcrypto.md#class-cryptokey).

В настоящее время поддерживаются следующие алгоритмы упаковки:

* `'AES-CBC'`
* `'AES-CTR'`
* `'AES-GCM'`
* `'AES-KW'`
* `'AES-OCB'`[^modern-algos]
* `'ChaCha20-Poly1305'`[^modern-algos]
* `'RSA-OAEP'`

Поддерживаются следующие алгоритмы распакованного ключа:

* `'AES-CBC'`
* `'AES-CTR'`
* `'AES-GCM'`
* `'AES-KW'`
* `'AES-OCB'`[^modern-algos]
* `'ChaCha20-Poly1305'`[^modern-algos]
* `'ECDH'`
* `'ECDSA'`
* `'Ed25519'`
* `'Ed448'`[^secure-curves]
* `'HMAC'`
* `'KMAC128'`[^secure-curves]
* `'KMAC256'`[^secure-curves]
* `'ML-DSA-44'`[^modern-algos]
* `'ML-DSA-65'`[^modern-algos]
* `'ML-DSA-87'`[^modern-algos]
* `'ML-KEM-512'`[^modern-algos]
* `'ML-KEM-768'`[^modern-algos]
* `'ML-KEM-1024'`[^modern-algos]
* `'RSA-OAEP'`
* `'RSA-PSS'`
* `'RSASSA-PKCS1-v1_5'`
* `'X25519'`
* `'X448'`[^secure-curves]

### `subtle.verify(algorithm, key, signature, data)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59647
    description: Алгоритмы KMAC теперь поддерживаются.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы ML-DSA теперь поддерживаются.
  - version:
    - v18.4.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42507
    description: Добавлены алгоритмы `'Ed25519'` и `'Ed448'`.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Алгоритмы KMAC теперь поддерживаются. |
    | v24.7.0 | Алгоритмы ML-DSA теперь поддерживаются. |
    | v18.4.0, v16.17.0 | Добавлены алгоритмы `'Ed25519'` и `'Ed448'`. |

<!--lint disable maximum-line-length remark-lint-->

* `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaPssParams>`](webcrypto.md) | [`<EcdsaParams>`](webcrypto.md) | [`<ContextParams>`](webcrypto.md) | [`<KmacParams>`](webcrypto.md)
* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `signature` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* `data` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

<!--lint enable maximum-line-length remark-lint-->

По методу и параметрам из `algorithm` и ключевому материалу из `key`
метод пытается проверить, что `signature` является
действительной криптографической подписью `data`. Промис выполняется
со значением `true` или `false`.

В настоящее время поддерживаются следующие алгоритмы:

* `'ECDSA'`
* `'Ed25519'`
* `'Ed448'`[^secure-curves]
* `'HMAC'`
* `'KMAC128'`[^secure-curves]
* `'KMAC256'`[^secure-curves]
* `'ML-DSA-44'`[^modern-algos]
* `'ML-DSA-65'`[^modern-algos]
* `'ML-DSA-87'`[^modern-algos]
* `'RSA-PSS'`
* `'RSASSA-PKCS1-v1_5'`

### `subtle.wrapKey(format, key, wrappingKey, wrapAlgo)`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59539
    description: Алгоритм AES-OCB теперь поддерживается.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритм ChaCha20-Poly1305 теперь поддерживается.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритм AES-OCB теперь поддерживается. |
    | v24.7.0 | Алгоритм ChaCha20-Poly1305 теперь поддерживается. |

<!--lint disable maximum-line-length remark-lint-->

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть одним из `'raw'`, `'pkcs8'`, `'spki'`, `'jwk'`, `'raw-secret'`[^modern-algos],
  `'raw-public'`[^modern-algos] или `'raw-seed'`[^modern-algos].
* `key` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `wrappingKey` [`<CryptoKey>`](webcrypto.md#class-cryptokey)
* `wrapAlgo` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md) | [`<RsaOaepParams>`](webcrypto.md) | [`<AesCtrParams>`](webcrypto.md) | [`<AesCbcParams>`](webcrypto.md) | [`<AeadParams>`](webcrypto.md)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

<!--lint enable maximum-line-length remark-lint-->

В криптографии «упаковка ключа» означает экспорт и последующее шифрование
ключевого материала. Метод экспортирует ключевой материал в
формат `format`, затем шифрует его методом и параметрами из `wrapAlgo`
и ключом `wrappingKey`. Это эквивалентно вызову [`subtle.exportKey()`](#subtleexportkeyformat-key) с
`format` и `key`, затем передаче результата в
[`subtle.encrypt()`](#subtleencryptalgorithm-key-data) с `wrappingKey` и `wrapAlgo`. При
успехе промис выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
содержащим зашифрованные данные ключа.

В настоящее время поддерживаются следующие алгоритмы упаковки:

* `'AES-CBC'`
* `'AES-CTR'`
* `'AES-GCM'`
* `'AES-KW'`
* `'AES-OCB'`[^modern-algos]
* `'ChaCha20-Poly1305'`[^modern-algos]
* `'RSA-OAEP'`

## Параметры алгоритмов

Объекты параметров алгоритма задают методы и параметры для
различных методов [SubtleCrypto](webcrypto.md). Несмотря на описание как «классов», это
обычные объекты-словари JavaScript.

### Класс: `Algorithm`

<!-- YAML
added: v15.0.0
-->

#### `Algorithm.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `AeadParams`

<!-- YAML
added: v15.0.0
-->

#### `aeadParams.additionalData`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | undefined

Дополнительные данные, которые не шифруются, но участвуют в аутентификации
данных. Использование `additionalData` необязательно.

#### `aeadParams.iv`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Вектор инициализации должен быть уникален для каждой операции шифрования с
данным ключом.

#### `aeadParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'AES-GCM'`, `'AES-OCB'`, или `'ChaCha20-Poly1305'`.

#### `aeadParams.tagLength`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер в битах сгенерированного тега аутентификации.

### Класс: `AesDerivedKeyParams`

<!-- YAML
added: v15.0.0
-->

#### `aesDerivedKeyParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'AES-CBC'`, `'AES-CTR'`, `'AES-GCM'`, `'AES-OCB'`, или `'AES-KW'`

#### `aesDerivedKeyParams.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина выводимого ключа AES. Должна быть `128`, `192`
или `256`.

### Класс: `AesCbcParams`

<!-- YAML
added: v15.0.0
-->

#### `aesCbcParams.iv`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Вектор инициализации. Длина ровно 16 байт;
должен быть непредсказуемым и криптографически случайным.

#### `aesCbcParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'AES-CBC'`.

### Класс: `AesCtrParams`

<!-- YAML
added: v15.0.0
-->

#### `aesCtrParams.counter`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Начальное значение блока счётчика. Длина ровно 16 байт.

В режиме `AES-CTR` правые `length` бит блока используются как
счётчик, остальные биты — как одноразовое число (nonce).

#### `aesCtrParams.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число бит в `aesCtrParams.counter`, используемых
  в качестве счётчика.

#### `aesCtrParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'AES-CTR'`.

### Класс: `AesKeyAlgorithm`

<!-- YAML
added: v15.0.0
-->

#### `aesKeyAlgorithm.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина ключа AES в битах.

#### `aesKeyAlgorithm.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `AesKeyGenParams`

<!-- YAML
added: v15.0.0
-->

#### `aesKeyGenParams.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина генерируемого ключа AES. Должна быть `128`, `192`
или `256`.

#### `aesKeyGenParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'AES-CBC'`, `'AES-CTR'`, `'AES-GCM'`, или
  `'AES-KW'`

### Класс: `Argon2Params`

<!-- YAML
added: v24.8.0
-->

#### `argon2Params.associatedData`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Необязательные связанные данные.

#### `argon2Params.memory`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Объём памяти в кибибайтах. Должен быть не меньше 8-кратной степени параллелизма.

#### `argon2Params.name`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'Argon2d'`, `'Argon2i'`, или `'Argon2id'`.

#### `argon2Params.nonce`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Одноразовое число (nonce), в приложениях хеширования паролей используется как соль.

#### `argon2Params.parallelism`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Степень параллелизма.

#### `argon2Params.passes`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число проходов.

#### `argon2Params.secretValue`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Необязательное секретное значение.

#### `argon2Params.version`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Номер версии Argon2. По умолчанию и сейчас единственно определённая версия — `19` (`0x13`).

### Класс: `ContextParams`

<!-- YAML
added: v24.7.0
-->

#### `contextParams.name`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `Ed448`[^secure-curves], `'ML-DSA-44'`[^modern-algos],
  `'ML-DSA-65'`[^modern-algos], или `'ML-DSA-87'`[^modern-algos].

#### `contextParams.context`

<!-- YAML
added: v24.7.0
changes:
  - version: v24.8.0
    pr-url: https://github.com/nodejs/node/pull/59570
    description: Поддерживается непустой контекст.
-->

Добавлено в: v24.7.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.8.0 | Поддерживается непустой контекст. |

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | undefined

Свойство `context` задаёт необязательные контекстные данные, связываемые с
сообщением.

### Класс: `CShakeParams`

<!-- YAML
added: v24.7.0
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/61875
    description: `cShakeParams.length` переименовано в `cShakeParams.outputLength`.
-->

Добавлено в: v24.7.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.9.0 | `cShakeParams.length` переименовано в `cShakeParams.outputLength`. |

#### `cShakeParams.name`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'cSHAKE128'`[^modern-algos] или `'cSHAKE256'`[^modern-algos]

#### `cShakeParams.outputLength`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) запрашиваемая длина вывода в битах.

#### `cShakeParams.functionName`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | undefined

Свойство `functionName` задаёт имя функции, которое NIST использует для определения
функций на основе cSHAKE.
Реализация Web Crypto API в Node.js поддерживает только нулевую длину `functionName`,
что эквивалентно отсутствию `functionName`.

#### `cShakeParams.customization`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | undefined

Свойство `customization` задаёт строку настройки.
Реализация Web Crypto API в Node.js поддерживает только нулевую длину `customization`,
что эквивалентно отсутствию `customization`.

### Класс: `EcdhKeyDeriveParams`

<!-- YAML
added: v15.0.0
-->

#### `ecdhKeyDeriveParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'ECDH'`, `'X25519'`, или `'X448'`[^secure-curves].

#### `ecdhKeyDeriveParams.public`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<CryptoKey>`](webcrypto.md#class-cryptokey)

Вывод ключа ECDH использует на входе закрытый ключ одной стороны и
открытый ключ другой — из них получается общий секрет.
Свойство `ecdhKeyDeriveParams.public` задаёт открытый ключ другой стороны.

### Класс: `EcdsaParams`

<!-- YAML
added: v15.0.0
-->

#### `ecdsaParams.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `ecdsaParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'ECDSA'`.

### Класс: `EcKeyAlgorithm`

<!-- YAML
added: v15.0.0
-->

#### `ecKeyAlgorithm.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

#### `ecKeyAlgorithm.namedCurve`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `EcKeyGenParams`

<!-- YAML
added: v15.0.0
-->

#### `ecKeyGenParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'ECDSA'` или `'ECDH'`.

#### `ecKeyGenParams.namedCurve`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'P-256'`, `'P-384'`, `'P-521'`.

### Класс: `EcKeyImportParams`

<!-- YAML
added: v15.0.0
-->

#### `ecKeyImportParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'ECDSA'` или `'ECDH'`.

#### `ecKeyImportParams.namedCurve`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'P-256'`, `'P-384'`, `'P-521'`.

### Класс: `EncapsulatedBits`

<!-- YAML
added: v24.7.0
-->

Временный симметричный секретный ключ (в виде [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)) для шифрования сообщения
и шифротекст (его можно передать получателю вместе с сообщением),
зашифрованный этим общим ключом. Получатель своим закрытым ключом восстанавливает
общий ключ и расшифровывает сообщение.

#### `encapsulatedBits.ciphertext`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

#### `encapsulatedBits.sharedKey`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

### Класс: `EncapsulatedKey`

<!-- YAML
added: v24.7.0
-->

Временный симметричный секретный ключ (в виде [CryptoKey](webcrypto.md#class-cryptokey)) для шифрования сообщения
и шифротекст (его можно передать получателю вместе с сообщением),
зашифрованный этим общим ключом. Получатель своим закрытым ключом восстанавливает
общий ключ и расшифровывает сообщение.

#### `encapsulatedKey.ciphertext`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

#### `encapsulatedKey.sharedKey`

<!-- YAML
added: v24.7.0
-->

* Тип: [`<CryptoKey>`](webcrypto.md#class-cryptokey)

### Класс: `HkdfParams`

<!-- YAML
added: v15.0.0
-->

#### `hkdfParams.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `hkdfParams.info`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Контекстные данные приложения для алгоритма HKDF.
Может быть нулевой длины, но должно быть указано.

#### `hkdfParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'HKDF'`.

#### `hkdfParams.salt`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Соль существенно повышает стойкость HKDF.
Она должна быть случайной или псевдослучайной и той же длины, что и
выход функции хеширования (например, при `'SHA-256'` соль — 256 бит случайных данных).

### Класс: `HmacImportParams`

<!-- YAML
added: v15.0.0
-->

#### `hmacImportParams.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `hmacImportParams.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Необязательное число бит в ключе HMAC. Обычно не указывается.

#### `hmacImportParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'HMAC'`.

### Класс: `HmacKeyAlgorithm`

<!-- YAML
added: v15.0.0
-->

#### `hmacKeyAlgorithm.hash`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<Algorithm>`](webcrypto.md)

#### `hmacKeyAlgorithm.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина ключа HMAC в битах.

#### `hmacKeyAlgorithm.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `HmacKeyGenParams`

<!-- YAML
added: v15.0.0
-->

#### `hmacKeyGenParams.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `hmacKeyGenParams.length`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число бит для генерируемого ключа HMAC. Если не указано,
длина определяется используемым алгоритмом хеширования.
Обычно не указывается.

#### `hmacKeyGenParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'HMAC'`.

### Класс: `KeyAlgorithm`

<!-- YAML
added: v15.0.0
-->

#### `keyAlgorithm.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `KangarooTwelveParams`

<!-- YAML
added: v25.9.0
-->

#### `kangarooTwelveParams.customization`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | undefined

Необязательная строка настройки для KangarooTwelve.

#### `kangarooTwelveParams.name`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'KT128'`[^modern-algos] или `'KT256'`[^modern-algos]

#### `kangarooTwelveParams.outputLength`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) запрашиваемая длина вывода в битах.

### Класс: `KmacImportParams`

<!-- YAML
added: v24.8.0
-->

#### `kmacImportParams.length`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Необязательное число бит в ключе KMAC. Обычно не указывается.

#### `kmacImportParams.name`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'KMAC128'` или `'KMAC256'`.

### Класс: `KmacKeyAlgorithm`

<!-- YAML
added: v24.8.0
-->

#### `kmacKeyAlgorithm.length`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина ключа KMAC в битах.

#### `kmacKeyAlgorithm.name`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `KmacKeyGenParams`

<!-- YAML
added: v24.8.0
-->

#### `kmacKeyGenParams.length`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число бит для генерируемого ключа KMAC. Если не указано,
длина определяется используемым алгоритмом KMAC.
Обычно не указывается.

#### `kmacKeyGenParams.name`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'KMAC128'` или `'KMAC256'`.

### Класс: `KmacParams`

<!-- YAML
added: v24.8.0
changes:
  - version: v25.9.0
    pr-url: https://github.com/nodejs/node/pull/61875
    description: `kmacParams.length` переименовано в `kmacParams.outputLength`.
-->

Добавлено в: v24.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.9.0 | `kmacParams.length` переименовано в `kmacParams.outputLength`. |

#### `kmacParams.algorithm`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'KMAC128'` или `'KMAC256'`.

#### `kmacParams.outputLength`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина вывода в байтах. Должна быть положительным целым числом.

#### `kmacParams.customization`

<!-- YAML
added: v24.8.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer) | undefined

Свойство `customization` задаёт необязательную строку настройки.

### Класс: `Pbkdf2Params`

<!-- YAML
added: v15.0.0
-->

#### `pbkdf2Params.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `pbkdf2Params.iterations`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число итераций PBKDF2 при выводе битов.

#### `pbkdf2Params.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'PBKDF2'`.

#### `pbkdf2Params.salt`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Рекомендуется не менее 16 случайных или псевдослучайных байт.

### Класс: `RsaHashedImportParams`

<!-- YAML
added: v15.0.0
-->

#### `rsaHashedImportParams.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `rsaHashedImportParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'RSASSA-PKCS1-v1_5'`, `'RSA-PSS'` или
  `'RSA-OAEP'`.

### Класс: `RsaHashedKeyAlgorithm`

<!-- YAML
added: v15.0.0
-->

#### `rsaHashedKeyAlgorithm.hash`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<Algorithm>`](webcrypto.md)

#### `rsaHashedKeyAlgorithm.modulusLength`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина модуля RSA в битах.

#### `rsaHashedKeyAlgorithm.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

#### `rsaHashedKeyAlgorithm.publicExponent`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

Открытая экспонента RSA.

### Класс: `RsaHashedKeyGenParams`

<!-- YAML
added: v15.0.0
-->

#### `rsaHashedKeyGenParams.hash`

<!-- YAML
added: v15.0.0
changes:
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59365
    description: Алгоритмы SHA-3 теперь поддерживаются.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0 | Алгоритмы SHA-3 теперь поддерживаются. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Algorithm>`](webcrypto.md)

Если задано как [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

* `'SHA-1'`
* `'SHA-256'`
* `'SHA-384'`
* `'SHA-512'`
* `'SHA3-256'`[^modern-algos]
* `'SHA3-384'`[^modern-algos]
* `'SHA3-512'`[^modern-algos]

Если задано как [Algorithm](webcrypto.md), свойство `name` объекта
должно быть одним из перечисленных выше значений.

#### `rsaHashedKeyGenParams.modulusLength`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина модуля RSA в битах. Рекомендуется не меньше `2048`.

#### `rsaHashedKeyGenParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'RSASSA-PKCS1-v1_5'`, `'RSA-PSS'` или
  `'RSA-OAEP'`.

#### `rsaHashedKeyGenParams.publicExponent`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

Открытая экспонента RSA. Должна быть [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) с целым без знака в формате big-endian,
помещающимся в 32 бита. В [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) допустимы ведущие нулевые биты. Значение должно быть простым. Если нет причин выбирать другое, используйте `new Uint8Array([1, 0, 1])`
(65537) в качестве открытой экспоненты.

### Класс: `RsaOaepParams`

<!-- YAML
added: v15.0.0
-->

#### `rsaOaepParams.label`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<Buffer>`](buffer.md#buffer)

Дополнительные байты, которые не шифруются, но связываются
с полученным шифротекстом.

Параметр `rsaOaepParams.label` необязателен.

#### `rsaOaepParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'RSA-OAEP'`.

### Класс: `RsaPssParams`

<!-- YAML
added: v15.0.0
-->

#### `rsaPssParams.name`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'RSA-PSS'`.

#### `rsaPssParams.saltLength`

<!-- YAML
added: v15.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина (в байтах) используемой случайной соли.

### Класс: `TurboShakeParams`

<!-- YAML
added: v25.9.0
-->

#### `turboShakeParams.domainSeparation`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

Необязательный байт разделения доменов (0x01–0x7f). **По умолчанию:** `0x1f`.

#### `turboShakeParams.name`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'TurboSHAKE128'`[^modern-algos] или `'TurboSHAKE256'`[^modern-algos]

#### `turboShakeParams.outputLength`

<!-- YAML
added: v25.9.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) запрашиваемая длина вывода в битах.

[^secure-curves]: См. [Secure Curves in the Web Cryptography API][Secure Curves in the Web Cryptography API]

[^modern-algos]: См. [Modern Algorithms in the Web Cryptography API][Modern Algorithms in the Web Cryptography API]

[^openssl30]: Требуется OpenSSL >= 3.0

[^openssl32]: Требуется OpenSSL >= 3.2

[^openssl35]: Требуется OpenSSL >= 3.5

[Checking for runtime algorithm support]: #checking-for-runtime-algorithm-support
[JSON Web Key]: https://tools.ietf.org/html/rfc7517
[Key usages]: #cryptokeyusages
[Modern Algorithms in the Web Cryptography API]: #modern-algorithms-in-the-web-cryptography-api
[RFC 4122]: https://www.rfc-editor.org/rfc/rfc4122.txt
[Secure Curves in the Web Cryptography API]: #secure-curves-in-the-web-cryptography-api
[Web Crypto API]: https://www.w3.org/TR/WebCryptoAPI/
[`SubtleCrypto.supports()`]: #static-method-subtlecryptosupportsoperation-algorithm-lengthoradditionalalgorithm
[`subtle.decapsulateBits()`]: #subtledecapsulatebitsdecapsulationalgorithm-decapsulationkey-ciphertext
[`subtle.decapsulateKey()`]: #subtledecapsulatekeydecapsulationalgorithm-decapsulationkey-ciphertext-sharedkeyalgorithm-extractable-usages
[`subtle.decrypt()`]: #subtledecryptalgorithm-key-data
[`subtle.deriveBits()`]: #subtlederivebitsalgorithm-basekey-length
[`subtle.deriveKey()`]: #subtlederivekeyalgorithm-basekey-derivedkeyalgorithm-extractable-keyusages
[`subtle.digest()`]: #subtledigestalgorithm-data
[`subtle.encapsulateBits()`]: #subtleencapsulatebitsencapsulationalgorithm-encapsulationkey
[`subtle.encapsulateKey()`]: #subtleencapsulatekeyencapsulationalgorithm-encapsulationkey-sharedkeyalgorithm-extractable-usages
[`subtle.encrypt()`]: #subtleencryptalgorithm-key-data
[`subtle.exportKey()`]: #subtleexportkeyformat-key
[`subtle.generateKey()`]: #subtlegeneratekeyalgorithm-extractable-keyusages
[`subtle.getPublicKey()`]: #subtlegetpublickeykey-keyusages
[`subtle.importKey()`]: #subtleimportkeyformat-keydata-algorithm-extractable-keyusages
[`subtle.sign()`]: #subtlesignalgorithm-key-data
[`subtle.unwrapKey()`]: #subtleunwrapkeyformat-wrappedkey-unwrappingkey-unwrapalgo-unwrappedkeyalgo-extractable-keyusages
[`subtle.verify()`]: #subtleverifyalgorithm-key-signature-data
[`subtle.wrapKey()`]: #subtlewrapkeyformat-key-wrappingkey-wrapalgo
