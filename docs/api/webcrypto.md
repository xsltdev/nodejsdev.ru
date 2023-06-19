---
description: Node.js предоставляет реализацию стандартного Web Crypto API
---

# Web Crypto API

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/webcrypto.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Node.js предоставляет реализацию стандартного [Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/).

Используйте `globalThis.crypto` или `require('node:crypto').webcrypto` для доступа к этому модулю.

```js
const { subtle } = globalThis.crypto;

(async function () {
    const key = await subtle.generateKey(
        {
            name: 'HMAC',
            хэш: 'SHA-256',
            length: 256,
        },
        true,
        ['sign', 'verify']
    );

    const enc = new TextEncoder();
    const message = enc.encode('Я люблю кексы');

    const digest = await subtle.sign(
        {
            name: 'HMAC',
        },
        key,
        message
    );
})();
```

## Примеры

### Генерация ключей

Класс `SubtleCrypto` можно использовать для генерации симметричных (секретных) ключей или пар асимметричных ключей (открытый ключ и закрытый ключ).

#### AES ключи

```js
const { subtle } = globalThis.crypto;

async function generateAesKey(length = 256) {
    const key = await subtle.generateKey(
        {
            name: 'AES-CBC',
            length,
        },
        true,
        ['encrypt', 'decrypt']
    );

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
    } = await subtle.generateKey(
        {
            name: 'ECDSA',
            namedCurve,
        },
        true,
        ['sign', 'verify']
    );

    return { publicKey, privateKey };
}
```

#### Ключевые пары Ed25519/Ed448/X25519/X448

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

```js
const { subtle } = globalThis.crypto;

async function generateEd25519Key() {
    return subtle.generateKey(
        {
            name: 'Ed25519',
        },
        true,
        ['sign', 'verify']
    );
}

async function generateX25519Key() {
    return subtle.generateKey(
        {
            name: 'X25519',
        },
        true,
        ['deriveKey']
    );
}
```

#### HMAC ключи

```js
const { subtle } = globalThis.crypto;

async function generateHmacKey(hash = 'SHA-256') {
    const key = await subtle.generateKey(
        {
            name: 'HMAC',
            хэш,
        },
        true,
        ['sign', 'verify']
    );

    return key;
}
```

#### Пары ключей RSA

```js
const { subtle } = globalThis.crypto;
const publicExponent = new Uint8Array([1, 0, 1]);

async function generateRsaKey(
    modulusLength = 2048,
    hash = 'SHA-256'
) {
    const {
        publicKey,
        privateKey,
    } = await subtle.generateKey(
        {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength,
            publicExponent,
            хэш,
        },
        true,
        ['sign', 'verify']
    );

    return { publicKey, privateKey };
}
```

### Шифрование и дешифрование

```js
const crypto = globalThis.crypto;

async function aesEncrypt(plaintext) {
    const ec = new TextEncoder();
    const key = await generateAesKey();
    const iv = crypto.getRandomValues(new Uint8Array(16));

    const ciphertext = await crypto.subtle.encrypt(
        {
            name: 'AES-CBC',
            iv,
        },
        key,
        ec.encode(plaintext)
    );

    return {
        key,
        iv,
        ciphertext,
    };
}

async function aesDecrypt(ciphertext, key, iv) {
    const dec = new TextDecoder();
    const plaintext = await crypto.subtle.decrypt(
        {
            name: 'AES-CBC',
            iv,
        },
        key,
        ciphertext
    );

    return dec.decode(plaintext);
}
```

### Экспорт и импорт ключей

```js
const { subtle } = globalThis.crypto;

async function generateAndExportHmacKey(
    format = 'jwk',
    hash = 'SHA-512'
) {
    const key = await subtle.generateKey(
        {
            name: 'HMAC',
            hash,
        },
        true,
        ['sign', 'verify']
    );

    return subtle.exportKey(format, key);
}

async function importHmacKey(
    keyData,
    format = 'jwk',
    hash = 'SHA-512'
) {
    const key = await subtle.importKey(
        format,
        keyData,
        {
            name: 'HMAC',
            hash,
        },
        true,
        ['sign', 'verify']
    );

    return key;
}
```

### Завертывание и разворачивание ключей

```js
const { subtle } = globalThis.crypto;

async function generateAndWrapHmacKey(
    format = 'jwk',
    hash = 'SHA-512'
) {
    const [ключ, wrappingKey] = await Promise.all([
        subtle.generateKey(
            {
                name: 'HMAC',
                hash,
            },
            true,
            ['sign', 'verify']
        ),
        subtle.generateKey(
            {
                name: 'AES-KW',
                length: 256,
            },
            true,
            ['wrapKey', 'unwrapKey']
        ),
    ]);

    const wrappedKey = await subtle.wrapKey(
        format,
        key,
        wrappingKey,
        'AES-KW'
    );

    return { wrappedKey, wrappingKey };
}

async function unwrapHmacKey(
    wrappedKey,
    wrappingKey,
    format = 'jwk',
    hash = 'SHA-512'
) {
    const key = await subtle.unwrapKey(
        format,
        wrappedKey,
        wrappingKey,
        'AES-KW',
        { name: 'HMAC', hash },
        true,
        ['sign', 'verify']
    );

    return key;
}
```

### Подпишите и проверьте

```js
const { subtle } = globalThis.crypto;

async function sign(key, data) {
    const ec = new TextEncoder();
    const signature = await subtle.sign(
        'RSASSA-PKCS1-v1_5',
        key,
        ec.encode(data)
    );
    return signature;
}

async function verify(key, signature, data) {
    const ec = new TextEncoder();
    const verified = await subtle.verify(
        'RSASSA-PKCS1-v1_5',
        key,
        signature,
        ec.encode(data)
    );
    return verified;
}
```

### Получение битов и ключей

```js
const { subtle } = globalThis.crypto;

async function pbkdf2(
    pass,
    salt,
    iterations = 1000,
    length = 256
) {
    const ec = new TextEncoder();
    const key = await subtle.importKey(
        'raw',
        ec.encode(pass),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const bits = await subtle.deriveBits(
        {
            name: 'PBKDF2',
            hash: 'SHA-512',
            salt: ec.encode(salt),
            iterations,
        },
        key,
        length
    );
    return bits;
}

async function pbkdf2Key(
    pass,
    salt,
    iterations = 1000,
    length = 256
) {
    const ec = new TextEncoder();
    const keyMaterial = await subtle.importKey(
        'raw',
        ec.encode(pass),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    const key = await subtle.deriveKey(
        {
            name: 'PBKDF2',
            hash: 'SHA-512',
            salt: ec.encode(salt),
            iterations,
        },
        keyMaterial,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
    return key;
}
```

### Дайджест

```js
const { subtle } = globalThis.crypto;

async function digest(data, algorithm = 'SHA-512') {
    const ec = new TextEncoder();
    const digest = await subtle.digest(
        algorithm,
        ec.encode(data)
    );
    return digest;
}
```

## Матрица алгоритмов

В таблице подробно описаны алгоритмы, поддерживаемые реализацией Node.js Web Crypto API, и API, поддерживаемые для каждого из них:

<table style="width:100%;">
<colgroup>
<col style="width: 32%" />
<col style="width: 7%" />
<col style="width: 6%" />
<col style="width: 6%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 5%" />
<col style="width: 6%" />
<col style="width: 6%" />
<col style="width: 6%" />
<col style="width: 3%" />
<col style="width: 4%" />
<col style="width: 4%" />
</colgroup>
<thead>
<tr class="header">
<th>Алгоритм</th>
<th><code>generateKey</code></th>
<th><code>exportKey</code></th>
<th><code>importKey</code></th>
<th><code>encrypt</code></th>
<th><code>decrypt</code></th>
<th><code>wrapKey</code></th>
<th><code>unwrapKey</code></th>
<th><code>deriveBits</code></th>
<th><code>deriveKey</code></th>
<th><code>sign</code></th>
<th><code>verify</code></th>
<th><code>digest</code></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>'RSASSA-PKCS1-v1_5'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="even">
<td><code>'RSA-PSS'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="odd">
<td><code>'RSA-OAEP'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'ECDSA'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="odd">
<td><code>'Ed25519'</code> <span class="experimental-inline"></span>[1]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="even">
<td><code>'Ed448'</code> <span class="experimental-inline"></span>[2]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="odd">
<td><code>'ECDH'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'X25519'</code> <span class="experimental-inline"></span>[3]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'X448'</code> <span class="experimental-inline"></span>[4]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'AES-CTR'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'AES-CBC'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'AES-GCM'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'AES-KW'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'HMAC'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="odd">
<td><code>'HKDF'</code></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'PBKDF2'</code></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'SHA-1'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'SHA-256'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'SHA-384'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'SHA-512'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
</tr>
</tbody>
</table>

## Класс: `Crypto`

`globalThis.crypto` является экземпляром класса `Crypto`. `Crypto` - это синглтон, который предоставляет доступ к остальной части API криптовалют.

### `crypto.subtle`

-   Тип: {SubtleCrypto}

Предоставляет доступ к API `SubtleCrypto`.

### `crypto.getRandomValues(typedArray)`

-   `typedArray` {Buffer|TypedArray}
-   Возвращает: {Buffer|TypedArray}

Генерирует криптографически сильные случайные значения. Данный `typedArray` заполняется случайными значениями, и возвращается ссылка на `typedArray`.

Данный `typedArray` должен быть целочисленным экземпляром [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), т.е. `Float32Array` и `Float64Array` не принимаются.

Если размер заданного `typedArray` превышает 65,536 байт, будет выдана ошибка.

### `crypto.randomUUID()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует случайный [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.txt) UUID версии 4. UUID генерируется с помощью криптографического генератора псевдослучайных чисел.

## Класс: `CryptoKey`

### `cryptoKey.algorithm`

-   Тип: {AesKeyGenParams|RsaHashedKeyGenParams|EcKeyGenParams|HmacKeyGenParams}

Объект, детализирующий алгоритм, для которого может быть использован ключ, вместе с дополнительными параметрами, специфичными для данного алгоритма.

Только для чтения.

### `cryptoKey.extractable`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, {CryptoKey} может быть извлечен с помощью `subtleCrypto.exportKey()` или `subtleCrypto.wrapKey()`.

Только для чтения.

### `cryptoKey.type`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из `'secret'`, `'private'` или `'public'`.

Строка, определяющая, является ли ключ симметричным (`'secret'`) или асимметричным (`'private'` или `'public'`) ключом.

### `cryptoKey.usages`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Массив строк, определяющих операции, для которых может быть использован ключ.

Возможные варианты использования следующие:

-   `'encrypt'` - ключ может быть использован для шифрования данных.
-   `'decrypt'` - ключ может быть использован для расшифровки данных.
-   `'sign'` - Ключ может использоваться для создания цифровых подписей.
-   `'verify'` - Ключ может использоваться для проверки цифровых подписей.
-   `'deriveKey'` - Ключ может быть использован для получения нового ключа.
-   `'deriveBits'` - Ключ может быть использован для получения битов.
-   `'wrapKey'` - Ключ может быть использован для получения другого ключа.
-   `'unwrapKey'` - Ключ может быть использован для разворачивания другого ключа.

Допустимые варианты использования ключа зависят от алгоритма ключа (определяется `cryptokey.algorithm.name`).

<table>
<colgroup>
<col style="width: 38%" />
<col style="width: 7%" />
<col style="width: 7%" />
<col style="width: 5%" />
<col style="width: 6%" />
<col style="width: 8%" />
<col style="width: 9%" />
<col style="width: 7%" />
<col style="width: 8%" />
</colgroup>
<thead>
<tr class="header">
<th>Key Type</th>
<th><code>'encrypt'</code></th>
<th><code>'decrypt'</code></th>
<th><code>'sign'</code></th>
<th><code>'verify'</code></th>
<th><code>'deriveKey'</code></th>
<th><code>'deriveBits'</code></th>
<th><code>'wrapKey'</code></th>
<th><code>'unwrapKey'</code></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>'AES-CBC'</code></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'AES-CTR'</code></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'AES-GCM'</code></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'AES-KW'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'ECDH'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'X25519'</code> <span class="experimental-inline"></span>[5]</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'X448'</code> <span class="experimental-inline"></span>[6]</td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'ECDSA'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'Ed25519'</code> <span class="experimental-inline"></span>[7]</td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'Ed448'</code> <span class="experimental-inline"></span>[8]</td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="odd">
<td><code>'HDKF'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
<td></td>
<td></td>
<

## Класс: `CryptoKeyPair`

`CryptoKeyPair` - это простой словарный объект со свойствами `publicKey` и `privateKey`, представляющий пару асимметричных ключей.

### `cryptoKeyPair.privateKey`

-   Тип: {CryptoKey} Криптоключ {CryptoKey}, `тип` которого будет `'private'`.

### `cryptoKeyPair.publicKey`

-   Тип: {CryptoKey} Криптоключ {CryptoKey}, `тип` которого будет `"public"`.

## Класс: `SubtleCrypto`

### `subtle.decrypt(algorithm, key, data)`

-   `algorithm`: {RsaOaepParams|AesCtrParams|AesCbcParams|AesGcmParams}
-   `key`: {CryptoKey}
-   `data`: {ArrayBuffer|TypedArray|DataView|Buffer}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Используя метод и параметры, указанные в `algorithm`, и ключевой материал, предоставленный `key`, `subtle.decrypt()` пытается расшифровать предоставленные `data`. В случае успеха, возвращаемое обещание будет разрешено с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим результат в виде открытого текста.

В настоящее время поддерживаются следующие алгоритмы:

-   `RSA-OAEP`
-   `AES-CTR`
-   `AES-CBC`
-   `AES-GCM`

### `subtle.deriveBits(algorithm, baseKey, length)`

-   `algorithm`: {AlgorithmIdentifier|EcdhKeyDeriveParams|HkdfParams|Pbkdf2Params}
-   `baseKey`: {CryptoKey}
-   `length`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<null>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Null_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Используя метод и параметры, указанные в `algorithm`, и ключевой материал, предоставленный `baseKey`, `subtle.deriveBits()` пытается сгенерировать биты `length`.

Реализация Node.js требует, чтобы, когда `length` является числом, оно было кратно `8`.

Когда `length` равно `null`, генерируется максимальное количество битов для данного алгоритма. Это разрешено для алгоритмов `'ECDH`, `'X25519` и `'X448`.

В случае успеха возвращаемое обещание будет разрешено с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим сгенерированные данные.

В настоящее время поддерживаются следующие алгоритмы:

-   `'ECDH'`
-   `'X25519'`
-   `'X448'`
-   `'HKDF'`
-   `'PBKDF2'`

### `subtle.deriveKey(algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages)`

-   `algorithm`: {AlgorithmIdentifier|EcdhKeyDeriveParams|HkdfParams|Pbkdf2Params}
-   `baseKey`: {CryptoKey}
-   `derivedKeyAlgorithm`: {HmacKeyGenParams|AesKeyGenParams}
-   `extractable`: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `keyUsages`: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [Key usages](#cryptokeyusages).
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий {CryptoKey}.

Используя метод и параметры, указанные в `algorithm`, и ключевой материал, предоставленный `baseKey`, `subtle.deriveKey()` пытается сгенерировать новый {CryptoKey} на основе метода и параметров в `derivedKeyAlgorithm`.

Вызов `subtle.deriveKey()` эквивалентен вызову `subtle.deriveBits()` для генерации исходного ключевого материала, а затем передаче результата в метод `subtle.importKey()` с использованием параметров `deriveKeyAlgorithm`, `extractable` и `keyUsages` в качестве входных.

В настоящее время поддерживаются следующие алгоритмы:

-   `'ECDH'`
-   `'X25519'` <span class="experimental-inline"></span>\[11\]
-   `'X448'` <span class="experimental-inline"></span>\[12\]
-   `'HKDF'`
-   `ПБКДФ2`

### `subtle.digest(algorithm, data)`

-   `алгоритм`: {string|Object}
-   `данные`: {ArrayBuffer|TypedArray|DataView|Buffer}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Используя метод, определенный `алгоритмом`, `subtle.digest()` пытается сгенерировать дайджест `данных`. В случае успеха возвращаемое обещание разрешается с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим вычисленный дайджест.

Если `algorithm` указан как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), он должен быть одним из:

-   `'SHA-1'`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`.

Если `algorithm` предоставлен как [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого является одним из вышеперечисленных.

### `subtle.encrypt(algorithm, key, data)`

-   `алгоритм`: {RsaOaepParams|AesCtrParams|AesCbcParams|AesGcmParams}
-   `ключ`: {CryptoKey}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Используя метод и параметры, указанные `algorithm`, и ключевой материал, предоставленный `key`, `subtle.encrypt()` пытается зашифровать `данные`. В случае успеха возвращаемое обещание разрешается с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим зашифрованный результат.

В настоящее время поддерживаются следующие алгоритмы:

-   `RSA-OAEP`
-   `AES-CTR`
-   `AES-CBC`
-   `AES-GCM`

### `subtle.exportKey(format, key)`

-   `format`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Must be one of `'raw'`, `'pkcs8'`, `'spki'`, or `'jwk'`.
-   `key`: {CryptoKey}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий {ArrayBuffer|Object}.

Экспортирует заданный ключ в указанный формат, если он поддерживается.

Если {CryptoKey} не может быть извлечен, возвращаемое обещание будет отклонено.

Если `формат` равен `'pkcs8'` или `'spki'` и экспорт успешен, возвращаемое обещание будет разрешено с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим экспортированные данные ключа.

Если `формат` равен `'jwk'` и экспорт успешен, возвращаемое обещание будет разрешено в объект JavaScript, соответствующий спецификации [JSON Web Key](https://tools.ietf.org/html/rfc7517).

<table>
<thead>
<tr class="header">
<th>Key Type</th>
<th><code>'spki'</code></th>
<th><code>'pkcs8'</code></th>
<th><code>'jwk'</code></th>
<th><code>'raw'</code></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>'AES-CBC'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'AES-CTR'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'AES-GCM'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'AES-KW'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'ECDH'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'ECDSA'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'Ed25519'</code> <span class="experimental-inline"></span>[13]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'Ed448'</code> <span class="experimental-inline"></span>[14]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'HDKF'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'HMAC'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'PBKDF2'</code></td>
<td></td>
<td></td>
<td></td>
<td></td>
</tr>
<tr class="even">
<td><code>'RSA-OAEP'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="odd">
<td><code>'RSA-PSS'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="even">
<td><code>'RSASSA-PKCS1-v1_5'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
</tbody>
</table>

### `subtle.generateKey(algorithm, extractable, keyUsages)`

-   `algorithm`: {AlgorithmIdentifier|RsaHashedKeyGenParams|EcKeyGenParams|HmacKeyGenParams|AesKeyGenParams}

<!-- end list -->

-   `extractable`: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `keyUsages`: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [Key usages](#cryptokeyusages).
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий {CryptoKey|CryptoKeyPair}.

Используя метод и параметры, указанные в `algorithm`, `subtle.generateKey()` пытается сгенерировать новый ключевой материал. В зависимости от используемого метода, метод может генерировать либо один {CryptoKey}, либо {CryptoKeyPair}.

Поддерживаемые алгоритмы генерации {CryptoKeyPair} (открытого и закрытого ключа) включают:

-   `'RSASSA-PKCS1-v1_5'`
-   `'RSA-PSS'`
-   `'RSA-OAEP'`
-   `'ECDSA'`
-   `'Ed25519'`
-   `'Ed448'`
-   `'ECDH'`
-   `'X25519'`
-   `'X448'`

Поддерживаются следующие алгоритмы генерации {CryptoKey} (секретного ключа):

-   `HMAC`
-   `AES-CTR`
-   `AES-CBC`
-   `AES-GCM`
-   `AES-KW`

### `subtle.importKey(format, keyData, algorithm, extractable, keyUsages)`

-   `format`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должен быть одним из `raw`, `pkcs8`, `spki` или `jwk`.
-   `keyData`: {ArrayBuffer|TypedArray|DataView|Buffer|Object}
-   `algorithm`: {AlgorithmIdentifier|RsaHashedImportParams|EcKeyImportParams|HmacImportParams}
-   `extractable`: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `keyUsages`: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key Usages](#cryptokeyusages).
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий {CryptoKey}.

Метод `subtle.importKey()` пытается интерпретировать предоставленные `keyData` в заданном `формате` для создания экземпляра {CryptoKey} с использованием предоставленных аргументов `algorithm`, `extractable` и `keyUsages`. Если импорт прошел успешно, возвращаемое обещание будет разрешено с созданным {CryptoKey}.

Если импортируется ключ `'PBKDF2`, `extractable` должно быть `false`.

В настоящее время поддерживаются следующие алгоритмы:

<table>
<thead>
<tr class="header">
<th>Key Type</th>
<th><code>'spki'</code></th>
<th><code>'pkcs8'</code></th>
<th><code>'jwk'</code></th>
<th><code>'raw'</code></th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>'AES-CBC'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'AES-CTR'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'AES-GCM'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'AES-KW'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'ECDH'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'X25519'</code> <span class="experimental-inline"></span>[19]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'X448'</code> <span class="experimental-inline"></span>[20]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'ECDSA'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'Ed25519'</code> <span class="experimental-inline"></span>[21]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'Ed448'</code> <span class="experimental-inline"></span>[22]</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'HDKF'</code></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'HMAC'</code></td>
<td></td>
<td></td>
<td>✔</td>
<td>✔</td>
</tr>
<tr class="odd">
<td><code>'PBKDF2'</code></td>
<td></td>
<td></td>
<td></td>
<td>✔</td>
</tr>
<tr class="even">
<td><code>'RSA-OAEP'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="odd">
<td><code>'RSA-PSS'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
<tr class="even">
<td><code>'RSASSA-PKCS1-v1_5'</code></td>
<td>✔</td>
<td>✔</td>
<td>✔</td>
<td></td>
</tr>
</tbody>
</table>

### `subtle.sign(algorithm, key, data)`

-   `algorithm`: {AlgorithmIdentifier|RsaPssParams|EcdsaParams|Ed448Params}
-   `key`: {CryptoKey}
-   `data`: {ArrayBuffer|TypedArray|DataView|Buffer}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Используя метод и параметры, заданные `algorithm`, и ключевой материал, предоставленный `key`, `subtle.sign()` пытается сгенерировать криптографическую подпись `data`. В случае успеха возвращаемое обещание разрешается с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим сгенерированную подпись.

В настоящее время поддерживаются следующие алгоритмы:

-   `'RSASSA-PKCS1-v1_5'`
-   `'RSA-PSS'`
-   `'ECDSA'`
-   `'Ed25519'` <span class="experimental-inline"></span>\[23\]
-   `'Ed448'` <span class="experimental-inline"></span>\[24\]
-   `'HMAC'`

### `subtle.unwrapKey(format, wrappedKey, unwrappingKey, unwrapAlgo, unwrappedKeyAlgo, extractable, keyUsages)`.

-   `format`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть одним из `raw`, `pkcs8`, `spki` или `jwk`.
-   `wrappedKey`: {ArrayBuffer|TypedArray|DataView|Buffer}
-   `unwrappingKey`: {CryptoKey}
-   `unwrapAlgo`: {AlgorithmIdentifier|RsaOaepParams|AesCtrParams|AesCbcParams|AesGcmParams}
-   `unwrappedKeyAlgo`: {AlgorithmIdentifier|RsaHashedImportParams|EcKeyImportParams|HmacImportParams}
-   `extractable`: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `keyUsages`: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [Key Usages](#cryptokeyusages).
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий {CryptoKey}.

В криптографии "обертывание ключа" означает экспорт и последующее шифрование ключевого материала. Метод `subtle.unwrapKey()` пытается расшифровать обернутый ключ и создать экземпляр {CryptoKey}. Это эквивалентно вызову `subtle.decrypt()` сначала на зашифрованных ключевых данных (используя аргументы `wrappedKey`, `unwrapAlgo` и `unwrappingKey` в качестве входных данных), а затем передаче результатов в метод `subtle.importKey()`, используя аргументы `unwrappedKeyAlgo`, `extractable` и `keyUsages` в качестве входных данных. В случае успеха возвращаемое обещание разрешается с объектом {CryptoKey}.

В настоящее время поддерживаются следующие алгоритмы обертывания:

-   `'RSA-OAEP'`
-   `'AES-CTR'`
-   `'AES-CBC'`
-   `'AES-GCM'`
-   `'AES-KW'`

Поддерживаемые алгоритмы развернутого ключа включают:

-   `'RSASSA-PKCS1-v1_5'`
-   `'RSA-PSS'`
-   `'RSA-OAEP'`
-   `'ECDSA'`
-   `'Ed25519'` <span class="experimental-inline"></span>\[25\]
-   `'Ed448'` <span class="experimental-inline"></span>\[26\]
-   `'ECDH'`
-   `'X25519'` <span class="experimental-inline"></span>\[27\]
-   `'X448'` <span class="experimental-inline"></span>\[28\]
-   `'HMAC'`
-   `'AES-CTR'`
-   `'AES-CBC'`
-   `'AES-GCM'`
-   `'AES-KW'`

### `subtle.verify(algorithm, key, signature, data)`

-   `algorithm`: {AlgorithmIdentifier|RsaPssParams|EcdsaParams|Ed448Params}
-   `key`: {CryptoKey}
-   `signature`: {ArrayBuffer|TypedArray|DataView|Buffer}
-   `data`: {ArrayBuffer|TypedArray|DataView|Buffer}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

Используя метод и параметры, указанные в `algorithm`, и ключевой материал, предоставленный `key`, `subtle.verify()` пытается проверить, что `signature` является действительной криптографической подписью `данных`. Возвращаемое обещание разрешается либо с `true`, либо с `false`.

В настоящее время поддерживаются следующие алгоритмы:

-   `'RSASSA-PKCS1-v1_5'`
-   `'RSA-PSS'`
-   `'ECDSA'`
-   `'Ed25519'`
-   `'Ed448'`
-   `'HMAC'`

### `subtle.wrapKey(format, key, wrappingKey, wrapAlgo)`.

-   `format`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть одним из `raw`, `pkcs8`, `spki` или `jwk`.
-   `key`: {CryptoKey}
-   `wrappingKey`: {CryptoKey}
-   `wrapAlgo`: {AlgorithmIdentifier|RsaOaepParams|AesCtrParams|AesCbcParams|AesGcmParams}
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), содержащий [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

В криптографии "обертывание ключа" означает экспорт и последующее шифрование ключевого материала. Метод `subtle.wrapKey()` экспортирует ключевой материал в формат, определенный `format`, затем шифрует его, используя метод и параметры, указанные `wrapAlgo`, и ключевой материал, предоставленный `wrappingKey`. Это эквивалентно вызову `subtle.exportKey()` с использованием `format` и `key` в качестве аргументов, затем передаче результата методу `subtle.encrypt()` с использованием `wrappingKey` и `wrapAlgo` в качестве входных данных. В случае успеха возвращенное обещание будет разрешено с [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим зашифрованные ключевые данные.

В настоящее время поддерживаются следующие алгоритмы обертывания:

-   `RSA-OAEP`
-   `AES-CTR`
-   `AES-CBC`
-   `AES-GCM`
-   `AES-KW`

## Параметры алгоритма

Объекты параметров алгоритма определяют методы и параметры, используемые различными методами {SubtleCrypto}. Хотя они описаны здесь как "классы", они являются простыми объектами словаря JavaScript.

### Класс: `AlgorithmIdentifier`

#### `algorithmIdentifier.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

### Класс: `AesCbcParams`

#### `aesCbcParams.iv`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Предоставляет вектор инициализации. Он должен быть длиной ровно 16 байт и должен быть непредсказуемым и криптографически случайным.

#### `aesCbcParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `AES-CBC`.

### Класс: `AesCtrParams`

#### `aesCtrParams.counter`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Начальное значение блока счетчика. Оно должно быть длиной ровно 16 байт.

Метод `AES-CTR` использует самые правые биты `длины` блока в качестве счетчика, а оставшиеся биты - в качестве несе.

#### `aesCtrParams.length`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество битов в `aesCtrParams.counter`, которые будут использоваться в качестве счетчика.

#### `aesCtrParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `AES-CTR`.

### Класс: `AesGcmParams`

#### `aesGcmParams.additionalData`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer|undefined}

В методе AES-GCM `additionalData` - это дополнительные входные данные, которые не шифруются, но включаются в проверку подлинности данных. Использование `additionalData` является необязательным.

#### `aesGcmParams.iv`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Вектор инициализации должен быть уникальным для каждой операции шифрования с использованием данного ключа.

В идеале это детерминированное 12-байтовое значение, которое вычисляется таким образом, что гарантируется его уникальность для всех вызовов, использующих один и тот же ключ. В качестве альтернативы вектор инициализации может состоять как минимум из 12 криптографически случайных байтов. Более подробную информацию о построении векторов инициализации для AES-GCM см. в разделе 8 [NIST SP 800-38D] (https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf).

#### `aesGcmParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `AES-GCM`.

#### `aesGcmParams.tagLength`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер в битах генерируемого тега аутентификации. Это значение должно быть одним из `32`, `64`, `96`, `104`, `112`, `120` или `128`. **По умолчанию:** `128`.

### Класс: `AesKeyGenParams`

#### `aesKeyGenParams.length`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина генерируемого ключа AES. Она должна быть либо `128`, либо `192`, либо `256`.

#### `aesKeyGenParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'AES-CBC'`, `'AES-CTR'`, `'AES-GCM'` или `'AES-KW'`.

### Класс: `EcdhKeyDeriveParams`

#### `ecdhKeyDeriveParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `ECDH`, `X25519` или `X448`.

#### `ecdhKeyDeriveParams.public`

-   Тип: {CryptoKey}

ECDH-производство ключей работает, принимая на вход закрытый ключ одной стороны и открытый ключ другой стороны, и используя их оба для генерации общего разделяемого секрета. Свойство `ecdhKeyDeriveParams.public` устанавливается на открытый ключ другой стороны.

### Класс: `EcdsaParams`

#### `ecdsaParams.hash`

-   Тип: {строка|Объект}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`.

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `ecdsaParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `ECDSA`.

### Класс: `EcKeyGenParams`

#### `ecKeyGenParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'ECDSA'` или `'ECDH'`.

#### `ecKeyGenParams.namedCurve`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'P-256'`, `'P-384'`, `'P-521'`.

### Класс: `EcKeyImportParams`

#### `ecKeyImportParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'ECDSA'` или `'ECDH'`.

#### `ecKeyImportParams.namedCurve`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должна быть одной из `'P-256'`, `'P-384'`, `'P-521'`.

### Класс: `Ed448Params`

#### `ed448Params.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `ed448`.

#### `ed448Params.context`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer|undefined}

Член `context` представляет необязательные данные контекста для связи с сообщением. Реализация Node.js Web Crypto API поддерживает только контекст нулевой длины, что эквивалентно отсутствию контекста вообще.

### Класс: `HkdfParams`

#### `hkdfParams.hash`

-   Тип: {строка|Объект}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`.

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `hkdfParams.info`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Предоставляет контекстный вход для алгоритма HKDF, специфичный для приложения. Он может быть нулевой длины, но должен быть предоставлен.

#### `hkdfParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `HKDF`.

#### `hkdfParams.salt`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Значение соли значительно повышает стойкость алгоритма HKDF. Оно должно быть случайным или псевдослучайным и иметь ту же длину, что и выход функции дайджеста (например, если в качестве дайджеста используется `'SHA-256'`, соль должна представлять собой 256 бит случайных данных).

### Класс: `HmacImportParams`

#### `hmacImportParams.hash`

-   Тип: {string|Object}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `hmacImportParams.length`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Необязательное количество битов в ключе HMAC. Это необязательное значение, и в большинстве случаев его следует опускать.

#### `hmacImportParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `HMAC`.

### Класс: `HmacKeyGenParams`

#### `hmacKeyGenParams.hash`

-   Тип: {string|Object}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `hmacKeyGenParams.length`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество битов для генерации ключа HMAC. Если опущено, длина будет определяться используемым алгоритмом хэширования. Этот параметр является необязательным и в большинстве случаев должен быть опущен.

#### `hmacKeyGenParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `HMAC`.

### Класс: `Pbkdf2Params`

#### `pbkdb2Params.hash`

-   Тип: {string|Object}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `pbkdf2Params.iterations`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество итераций, которые должен сделать алгоритм PBKDF2 при выведении битов.

#### `pbkdf2Params.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'PBKDF2'`.

#### `pbkdf2Params.salt`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Должно быть не менее 16 случайных или псевдослучайных байт.

### Класс: `RsaHashedImportParams`

#### `rsaHashedImportParams.hash`

-   Тип: {string|Object}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `rsaHashedImportParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'RSASSA-PKCS1-v1_5'`, `'RSA-PSS'` или `'RSA-OAEP'`.

### Класс: `RsaHashedKeyGenParams`

#### `rsaHashedKeyGenParams.hash`

-   Тип: {string|Object}

Если представлено как [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), значение должно быть одним из:

-   `SHA-1`
-   `SHA-256`
-   `SHA-384`
-   `SHA-512`

Если объект представлен в виде [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), он должен иметь свойство `name`, значение которого равно одному из перечисленных выше значений.

#### `rsaHashedKeyGenParams.modulusLength`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина в битах модуля RSA. В соответствии с наилучшей практикой, она должна быть не менее `2048`.

#### `rsaHashedKeyGenParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть одним из `'RSASSA-PKCS1-v1_5'`, `'RSA-PSS'` или `'RSA-OAEP'`.

#### `rsaHashedKeyGenParams.publicExponent`

-   Тип: [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

Публичная экспонента RSA. Это должен быть [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), содержащий беззнаковое целое число, которое должно укладываться в 32 бита. Массив [`<Uint8Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) может содержать произвольное количество старших нулевых битов. Значение должно быть простым числом. Если нет причин использовать другое значение, используйте `new Uint8Array([1, 0, 1])` (65537) в качестве публичной экспоненты.

### Класс: `RsaOaepParams`

#### `rsaOaepParams.label`

-   Тип: {ArrayBuffer|TypedArray|DataView|Buffer}

Дополнительная коллекция байтов, которые не будут зашифрованы, но будут привязаны к сгенерированному шифротексту.

Параметр `rsaOaepParams.label` является необязательным.

#### `rsaOaepParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) должно быть `RSA-OAEP`.

### Класс: `RsaPssParams`

#### `rsaPssParams.name`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `RSA-PSS`.

#### `rsaPssParams.saltLength`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Длина (в байтах) используемой случайной соли.

