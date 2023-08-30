---
title: Crypto
description: Модуль crypto предоставляет криптографическую функциональность, которая включает набор оберток для функций хэша, HMAC, шифра, расшифровки, подписи и проверки OpenSSL
---

# Криптография

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/async_context.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:crypto` предоставляет криптографическую функциональность, которая включает набор оберток для функций хэша, HMAC, шифра, расшифровки, подписи и проверки OpenSSL.

```mjs
const { createHmac } = await import('node:crypto');

const secret = 'abcdefg';
const hash = createHmac('sha256', secret)
    .update('I love cupcakes')
    .digest('hex');
console.log(hash);
// Печать:
// c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
```

```cjs
const { createHmac } = require('node:crypto');

const secret = 'abcdefg';
const hash = createHmac('sha256', secret)
    .update('I love cupcakes')
    .digest('hex');
console.log(hash);
// Печать:
// c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
```

<!-- 0000.part.md -->

## Определение отсутствия поддержки криптографии

Возможно, что Node.js будет собран без поддержки модуля `node:crypto`. В таких случаях попытка `импорта` из `crypto` или вызов `require('node:crypto')` приведет к ошибке.

При использовании CommonJS возникшую ошибку можно перехватить с помощью `try/catch`:

```cjs
let crypto;
try {
    crypto = require('node:crypto');
} catch (err) {
    console.error('поддержка крипто отключена!');
}
```

При использовании лексического ключевого слова ESM `import` ошибка может быть поймана только в том случае, если обработчик `process.on('uncaughtException')` зарегистрирован _до_ любой попытки загрузить модуль (например, с помощью модуля предварительной загрузки).

При использовании ESM, если есть вероятность, что код может быть запущен на сборке Node.js, в которой не включена поддержка криптографии, используйте функцию [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) вместо лексического ключевого слова `import`:

```mjs
let crypto;
try {
    crypto = await import('node:crypto');
} catch (err) {
    console.error('поддержка крипто отключена!');
}
```

<!-- 0001.part.md -->

## Класс: `Certificate`

SPKAC - это механизм запроса подписи сертификата, первоначально реализованный компанией Netscape и формально указанный как часть элемента [HTML5 `keygen`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/keygen).

`<keygen>` устарел с [HTML 5.2](https://www.w3.org/TR/html52/changes.html#features-removed), и новые проекты больше не должны использовать этот элемент.

Модуль `node:crypto` предоставляет класс `Certificate` для работы с данными SPKAC. Наиболее распространенным использованием является обработка вывода, генерируемого элементом HTML5 `<keygen>`. Node.js использует [OpenSSL's SPKAC implementation](https://www.openssl.org/docs/man1.1.0/apps/openssl-spkac.html) внутренне.

<!-- 0002.part.md -->

### Статический метод: `Certificate.exportChallenge(spkac[, encoding])`

-   `spkac` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Компонент вызова структуры данных `spkac`, который включает открытый ключ и вызов.

<!-- конец списка -->

```mjs
const { Certificate } = await import('node:crypto');
const spkac = getSpkacSomehow();
const challenge = Certificate.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Выводит: вызов в виде строки UTF8
```

```cjs
const { Certificate } = require('node:crypto');
const spkac = getSpkacSomehow();
const challenge = Certificate.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Выводит: вызов в виде строки UTF8
```

<!-- 0003.part.md -->

### Статический метод: `Certificate.exportPublicKey(spkac[, encoding])`

-   `spkac` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Компонент открытого ключа структуры данных `spkac`, который включает в себя открытый ключ и вызов.

<!-- конец списка -->

```mjs
const { Certificate } = await import('node:crypto');
const spkac = getSpkacSomehow();
const publicKey = Certificate.exportPublicKey(spkac);
console.log(publicKey);
// Печатает: открытый ключ в виде <Буфера ...>
```

```cjs
const { Certificate } = require('node:crypto');
const spkac = getSpkacSomehow();
const publicKey = Certificate.exportPublicKey(spkac);
console.log(publicKey);
// Печатает: открытый ключ в виде <Буфера ...>
```

<!-- 0004.part.md -->

### Статический метод: `Certificate.verifySpkac(spkac[, encoding])`

-   `spkac` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если данная структура данных `spkac` корректна, `false` в противном случае.

<!-- конец списка -->

```mjs
import { Buffer } from 'node:buffer';
const { Certificate } = await import('node:crypto');

const spkac = getSpkacSomehow();
console.log(Certificate.verifySpkac(Buffer.from(spkac)));
// Выводит: true или false
```

```cjs
const { Buffer } = require('node:buffer');
const { Certificate } = require('node:crypto');

const spkac = getSpkacSomehow();
console.log(Certificate.verifySpkac(Buffer.from(spkac)));
// Выводит: true или false
```

<!-- 0005.part.md -->

### Legacy API

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

В качестве унаследованного интерфейса можно создавать новые экземпляры класса `crypto.Certificate`, как показано в примерах ниже.

<!-- 0006.part.md -->

#### `new crypto.Certificate()`

Экземпляры класса `Certificate` могут быть созданы с помощью ключевого слова `new` или путем вызова функции `crypto.Certificate()`:

```mjs
const { Certificate } = await import('node:crypto');

const cert1 = new Certificate();
const cert2 = Certificate();
```

```cjs
const { Certificate } = require('node:crypto');

const cert1 = new Certificate();
const cert2 = Certificate();
```

<!-- 0007.part.md -->

#### `certificate.exportChallenge(spkac[, encoding])`

-   `spkac` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Компонент вызова структуры данных `spkac`, который включает открытый ключ и вызов.

<!-- конец списка -->

```mjs
const { Certificate } = await import('node:crypto');
const cert = Certificate();
const spkac = getSpkacSomehow();
const challenge = cert.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Выводит: вызов в виде строки UTF8
```

```cjs
const { Certificate } = require('node:crypto');
const cert = Certificate();
const spkac = getSpkacSomehow();
const challenge = cert.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Выводит: вызов в виде строки UTF8
```

<!-- 0008.part.md -->

#### `certificate.exportPublicKey(spkac[, encoding])`

-   `spkac` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Компонент открытого ключа структуры данных `spkac`, который включает в себя открытый ключ и вызов.

<!-- конец списка -->

```mjs
const { Certificate } = await import('node:crypto');
const cert = Certificate();
const spkac = getSpkacSomehow();
const publicKey = cert.exportPublicKey(spkac);
console.log(publicKey);
// Печатает: открытый ключ в виде <Буфера ...>
```

```cjs
const { Certificate } = require('node:crypto');
const cert = Certificate();
const spkac = getSpkacSomehow();
const publicKey = cert.exportPublicKey(spkac);
console.log(publicKey);
// Печатает: открытый ключ в виде <Буфера ...>
```

<!-- 0009.part.md -->

#### `certificate.verifySpkac(spkac[, encoding])`

-   `spkac` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `spkac`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если данная структура данных `spkac` корректна, `false` в противном случае.

<!-- конец списка -->

```mjs
import { Buffer } from 'node:buffer';
const { Certificate } = await import('node:crypto');

const cert = Certificate();
const spkac = getSpkacSomehow();
console.log(cert.verifySpkac(Buffer.from(spkac)));
// Выводит: true или false
```

```cjs
const { Buffer } = require('node:buffer');
const { Certificate } = require('node:crypto');

const cert = Certificate();
const spkac = getSpkacSomehow();
console.log(cert.verifySpkac(Buffer.from(spkac)));
// Выводит: true или false
```

<!-- 0010.part.md -->

## Класс: `Cipher`

-   Расширяет: {stream.Transform}

Экземпляры класса `Cipher` используются для шифрования данных. Класс может быть использован одним из двух способов:

-   Как [поток](stream.md), который является одновременно читаемым и записываемым, где простые незашифрованные данные записываются для получения зашифрованных данных на читаемой стороне, или
-   используя методы [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding) и [`cipher.final()`](#cipherfinaloutputencoding) для создания зашифрованных данных.

Методы [`crypto.createCipher()`](#cryptocreatecipheralgorithm-password-options) или [`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) используются для создания экземпляров `Cipher`. Объекты `Cipher` не должны создаваться напрямую с помощью ключевого слова `new`.

Пример: Использование объектов `Cipher` в качестве потоков:

```mjs
const { scrypt, randomFill, createCipheriv } = await import(
    'node:crypto'
);

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

        cipher.on('data', (chunk) => (encrypted += chunk));
        cipher.on('end', () => console.log(encrypted));

        cipher.write('some clear text data');
        cipher.end();
    });
});
```

```cjs
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

        cipher.on('data', (chunk) => (encrypted += chunk));
        cipher.on('end', () => console.log(encrypted));

        cipher.write('some clear text data');
        cipher.end();
    });
});
```

Пример: Использование `Cipher` и конвейерных потоков:

```mjs
import {
    createReadStream,
    createWriteStream,
} from 'node:fs';

import { pipeline } from 'node:stream';

const { scrypt, randomFill, createCipheriv } = await import(
    'node:crypto'
);

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

```cjs
const {
    createReadStream,
    createWriteStream,
} = require('node:fs');

const { pipeline } = require('node:stream');

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

Пример: Использование методов [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding) и [`cipher.final()`](#cipherfinaloutputencoding):

```mjs
const { scrypt, randomFill, createCipheriv } = await import(
    'node:crypto'
);

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

        let encrypted = cipher.update(
            'some clear text data',
            'utf8',
            'hex'
        );
        encrypted += cipher.final('hex');
        console.log(encrypted);
    });
});
```

```cjs
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

        let encrypted = cipher.update(
            'some clear text data',
            'utf8',
            'hex'
        );
        encrypted += cipher.final('hex');
        console.log(encrypted);
    });
});
```

<!-- 0011.part.md -->

### `cipher.final([outputEncoding])`

-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка} Любое оставшееся зашифрованное содержимое. Если указано `outputEncoding`, возвращается строка. Если `outputEncoding` не указан, возвращается [`Buffer`](buffer.md).

После вызова метода `cipher.final()` объект `Cipher` больше не может быть использован для шифрования данных. Попытки вызвать `cipher.final()` более одного раза приведут к возникновению ошибки.

<!-- 0012.part.md -->

### `cipher.getAuthTag()`

-   Возвращает: [`<Buffer>`](buffer.md#buffer) При использовании аутентифицированного режима шифрования (в настоящее время поддерживаются `GCM`, `CCM`, `OCB` и `chacha20-poly1305`) метод `cipher.getAuthTag()` возвращает [`Buffer`](buffer.md), содержащий _тег аутентификации_, который был вычислен из заданных данных.

Метод `cipher.getAuthTag()` следует вызывать только после завершения шифрования с помощью метода [`cipher.final()`](#cipherfinaloutputencoding).

Если параметр `authTagLength` был установлен при создании экземпляра `cipher`, эта функция вернет именно `authTagLength` байт.

<!-- 0013.part.md -->

### `cipher.setAAD(buffer[, options])`

-   `buffer` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
    -   `plaintextLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки, которую следует использовать, когда `buffer` является строкой.
-   Возвращает: {Cipher} для цепочки методов.

При использовании аутентифицированного режима шифрования (в настоящее время поддерживаются `GCM`, `CCM`, `OCB` и `chacha20-poly1305`) метод `cipher.setAAD()` устанавливает значение, используемое для входного параметра _дополнительные аутентифицированные данные_ (AAD).

Параметр `plaintextLength` является необязательным для `GCM` и `OCB`. При использовании `CCM`, опция `plaintextLength` должна быть указана, и ее значение должно соответствовать длине открытого текста в байтах. Смотрите [Режим CCM](#ccm-mode).

Метод `cipher.setAAD()` должен быть вызван до [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding).

<!-- 0014.part.md -->

### `cipher.setAutoPadding([autoPadding])`

-   `autoPadding` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
-   Возвращает: {Cipher} для цепочки методов.

При использовании алгоритмов блочного шифрования класс `Cipher` будет автоматически добавлять к входным данным прокладки соответствующего размера блока. Чтобы отключить добавление по умолчанию, вызовите `cipher.setAutoPadding(false)`.

Когда `autoPadding` имеет значение `false`, длина всех входных данных должна быть кратна размеру блока шифра, иначе [`cipher.final()`](#cipherfinaloutputencoding) выдаст ошибку. Отключение автоматической подшивки полезно при нестандартной подшивке, например, при использовании `0x0` вместо PKCS-подшивки.

Метод `cipher.setAutoPadding()` должен быть вызван до [`cipher.final()`](#cipherfinaloutputencoding).

<!-- 0015.part.md -->

### `cipher.update(data[, inputEncoding][, outputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) данных.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Обновляет шифр с `data`. Если указан аргумент `inputEncoding`, то аргумент `data` является строкой, использующей указанную кодировку. Если аргумент `inputEncoding` не указан, `data` должна быть [`Buffer`](buffer.md), `TypedArray` или `DataView`. Если `data` является [`Buffer`](buffer.md), `TypedArray`, или `DataView`, то `inputEncoding` игнорируется.

Параметр `outputEncoding` определяет формат вывода зашифрованных данных. Если `outputEncoding` указан, то возвращается строка, использующая указанную кодировку. Если `outputEncoding` не указан, возвращается [`Buffer`](buffer.md).

Метод `cipher.update()` может быть вызван несколько раз с новыми данными, пока не будет вызван [`cipher.final()`](#cipherfinaloutputencoding). Вызов `cipher.update()` после [`cipher.final()`](#cipherfinaloutputencoding) приведет к возникновению ошибки.

<!-- 0016.part.md -->

## Класс: `Decipher`

-   Расширяет: {stream.Transform}

Экземпляры класса `Decipher` используются для расшифровки данных. Класс может быть использован одним из двух способов:

-   Как [поток](stream.md), который является одновременно читаемым и записываемым, где простые зашифрованные данные записываются для получения незашифрованных данных на читаемой стороне, или
-   используя методы [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) и [`decipher.final()`](#decipherfinaloutputencoding) для получения незашифрованных данных.

Методы [`crypto.createDecipher()`](#cryptocreatedecipheralgorithm-password-options) или [`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options) используются для создания экземпляров `Decipher`. Объекты `Decipher` не должны создаваться напрямую с помощью ключевого слова `new`.

Пример: Использование объектов `Decipher` в качестве потоков:

```mjs
import { Buffer } from 'node:buffer';
const { scryptSync, createDecipheriv } = await import(
    'node:crypto'
);

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

```cjs
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

Пример: Использование `Decipher` и конвейерных потоков:

```mjs
import {
    createReadStream,
    createWriteStream,
} from 'node:fs';
import { Buffer } from 'node:buffer';
const { scryptSync, createDecipheriv } = await import(
    'node:crypto'
);

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

```cjs
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

Пример: Использование методов [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) и [`decipher.final()`](#decipherfinaloutputencoding):

```mjs
import { Buffer } from 'node:buffer';
const { scryptSync, createDecipheriv } = await import(
    'node:crypto'
);

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

```cjs
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

<!-- 0017.part.md -->

### `decipher.final([outputEncoding])`

-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка} Любое оставшееся расшифрованное содержимое. Если указано `outputEncoding`, возвращается строка. Если `outputEncoding` не указан, возвращается [`Buffer`](buffer.md).

После вызова метода `decipher.final()` объект `Decipher` больше не может быть использован для расшифровки данных. Попытки вызвать `decipher.final()` более одного раза приведут к возникновению ошибки.

<!-- 0018.part.md -->

### `decipher.setAAD(buffer[, options])`

-   `buffer` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
    -   `plaintextLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки, которую следует использовать, когда `buffer` является строкой.
-   Возвращает: {Decipher} для цепочки методов.

При использовании аутентифицированного режима шифрования (в настоящее время поддерживаются `GCM`, `CCM`, `OCB` и `chacha20-poly1305`) метод `decipher.setAAD()` устанавливает значение, используемое для входного параметра _дополнительные аутентифицированные данные_ (AAD).

Аргумент `options` является необязательным для `GCM`. При использовании `CCM` должен быть указан параметр `plaintextLength`, значение которого должно соответствовать длине шифротекста в байтах. Смотрите [Режим CCM](#ccm-mode).

Метод `decipher.setAAD()` должен быть вызван до [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding).

При передаче строки в качестве `буфера`, пожалуйста, учитывайте [предостережения при использовании строк в качестве входов в криптографические API](#using-strings-as-inputs-to-cryptographic-apis).

<!-- 0019.part.md -->

### `decipher.setAuthTag(buffer[, encoding])`

-   `буфер` {string|Buffer|ArrayBuffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки, которую следует использовать, когда `buffer` является строкой.
-   Возвращает: {Decipher} для цепочки методов.

При использовании аутентифицированного режима шифрования (в настоящее время поддерживаются `GCM`, `CCM`, `OCB` и `chacha20-poly1305`), метод `decipher.setAuthTag()` используется для передачи полученного _тега аутентификации_. Если тег не передан, или если текст шифра был подделан, произойдет ошибка [`decipher.final()`](#decipherfinaloutputencoding), указывающая на то, что текст шифра должен быть отброшен из-за неудачной аутентификации. Если длина тега недопустима согласно [NIST SP 800-38D](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf) или не соответствует значению опции `authTagLength`, `decipher.setAuthTag()` выдаст ошибку.

Метод `decipher.setAuthTag()` должен быть вызван до [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) для режима `CCM` или до [`decipher.final()`](#decipherfinaloutputencoding) для режимов `GCM` и `OCB` и `chacha20-poly1305`. `decipher.setAuthTag()` может быть вызван только один раз.

При передаче строки в качестве тега аутентификации, пожалуйста, учитывайте [предостережения при использовании строк в качестве входов в криптографические API](#using-strings-as-inputs-to-cryptographic-apis).

<!-- 0020.part.md -->

### `decipher.setAutoPadding([autoPadding])`

-   `autoPadding` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
-   Возвращает: {Decipher} для цепочки методов.

Если данные были зашифрованы без стандартной блочной прокладки, вызов `decipher.setAutoPadding(false)` отключит автоматическую прокладку, чтобы предотвратить [`decipher.final()`](#decipherfinaloutputencoding) от проверки наличия и удаления прокладки.

Отключение автоматической подстановки будет работать только в том случае, если длина входных данных кратна размеру блока шифра.

Метод `decipher.setAutoPadding()` должен быть вызван до [`decipher.final()`](#decipherfinaloutputencoding).

<!-- 0021.part.md -->

### `decipher.update(data[, inputEncoding][, outputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Обновляет расшифровку с `data`. Если указан аргумент `inputEncoding`, то аргумент `data` является строкой, использующей указанную кодировку. Если аргумент `inputEncoding` не указан, `data` должна быть [`Buffer`](buffer.md). Если `data` является [`Buffer`](buffer.md), то `inputEncoding` игнорируется.

Параметр `outputEncoding` определяет формат вывода зашифрованных данных. Если `outputEncoding` указан, то возвращается строка, использующая указанную кодировку. Если `outputEncoding` не указан, возвращается [`Buffer`](buffer.md).

Метод `decipher.update()` может быть вызван несколько раз с новыми данными, пока не будет вызван [`decipher.final()`](#decipherfinaloutputencoding). Вызов `decipher.update()` после [`decipher.final()`](#decipherfinaloutputencoding) приведет к возникновению ошибки.

<!-- 0022.part.md -->

## Класс: `DiffieHellman`

Класс `DiffieHellman` - это утилита для создания обменов ключами Диффи-Хеллмана.

Экземпляры класса `DiffieHellman` могут быть созданы с помощью функции [`crypto.createDiffieHellman()`](#cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding).

```mjs
import assert from 'node:assert';

const { createDiffieHellman } = await import('node:crypto');

// Генерируем ключи Алисы...
const alice = createDiffieHellman(2048);
const aliceKey = alice.generateKeys();

// Генерируем ключи Боба...
const bob = createDiffieHellman(
    alice.getPrime(),
    alice.getGenerator()
);
const bobKey = bob.generateKeys();

// Обмен и генерация секрета...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// OK
assert.strictEqual(
    aliceSecret.toString('hex'),
    bobSecret.toString('hex')
);
```

```cjs
const assert = require('node:assert');

const { createDiffieHellman } = require('node:crypto');

// Генерируем ключи Алисы...
const alice = createDiffieHellman(2048);
const aliceKey = alice.generateKeys();

// Генерируем ключи Боба...
const bob = createDiffieHellman(
    alice.getPrime(),
    alice.getGenerator()
);
const bobKey = bob.generateKeys();

// Обмен и генерация секрета...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// OK
assert.strictEqual(
    aliceSecret.toString('hex'),
    bobSecret.toString('hex')
);
```

<!-- 0023.part.md -->

### `diffieHellman.computeSecret(otherPublicKey[, inputEncoding][, outputEncoding])`

-   `otherPublicKey` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `otherPublicKey`.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Вычисляет общий секрет, используя `otherPublicKey` в качестве открытого ключа другой стороны, и возвращает вычисленный общий секрет. Предоставленный ключ интерпретируется с использованием указанного `inputEncoding`, а секрет кодируется с использованием указанного `outputEncoding`. Если `inputEncoding` не указан, ожидается, что `otherPublicKey` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если `outputEncoding` указан, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

<!-- 0024.part.md -->

### `diffieHellman.generateKeys([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {буфер | строка}.

Генерирует значения закрытого и открытого ключей Диффи-Хеллмана и возвращает открытый ключ в указанной `кодировке`. Этот ключ должен быть передан другой стороне. Если указано `encoding`, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

<!-- 0025.part.md -->

### `diffieHellman.getGenerator([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}

Возвращает генератор Диффи-Хеллмана в указанном `кодировании`. Если указано `encoding`, возвращается строка; в противном случае возвращается [`буфер`](buffer.md).

<!-- 0026.part.md -->

### `diffieHellman.getPrime([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}

Возвращает прайм Диффи-Хеллмана в указанном `кодировании`. Если `кодировка` указана, возвращается строка; в противном случае возвращается [`буфер`](buffer.md).

<!-- 0027.part.md -->

### `diffieHellman.getPrivateKey([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}

Возвращает закрытый ключ Диффи-Хеллмана в указанной `кодировке`. Если `encoding` указан, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

<!-- 0028.part.md -->

### `diffieHellman.getPublicKey([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}

Возвращает открытый ключ Диффи-Хеллмана в указанной `кодировке`. Если `encoding` указан, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

<!-- 0029.part.md -->

### `diffieHellman.setPrivateKey(privateKey[, encoding])`

-   `privateKey` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `privateKey`.

Устанавливает закрытый ключ Диффи-Хеллмана. Если указан аргумент `encoding`, ожидается, что `privateKey` будет строкой. Если аргумент `encoding` не указан, ожидается, что `privateKey` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

<!-- 0030.part.md -->

### `diffieHellman.setPublicKey(publicKey[, encoding])`

-   `publicKey` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `publicKey`.

Устанавливает открытый ключ Диффи-Хеллмана. Если указан аргумент `encoding`, ожидается, что `publicKey` будет строкой. Если аргумент `encoding` не указан, ожидается, что `publicKey` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

<!-- 0031.part.md -->

### `diffieHellman.verifyError`

Битовое поле, содержащее любые предупреждения и/или ошибки, возникшие в результате проверки, выполненной во время инициализации объекта `DiffieHellman`.

Для этого свойства действительны следующие значения (как определено в модуле `node:constants`):

-   `DH_CHECK_P_NOT_SAFE_PRIME`.
-   `DH_CHECK_P_NOT_PRIME`
-   `DH_UNABLE_TO_CHECK_GENERATOR`
-   `DH_NOT_SUITABLE_GENERATOR`

<!-- 0032.part.md -->

## Класс: `DiffieHellmanGroup`

Класс `DiffieHellmanGroup` принимает в качестве аргумента известную modp-группу. Он работает так же, как и `DiffieHellman`, за исключением того, что он не позволяет изменять свои ключи после создания. Другими словами, он не реализует методы `setPublicKey()` и `setPrivateKey()`.

```mjs
const { createDiffieHellmanGroup } = await import(
    'node:crypto'
);
const dh = createDiffieHellmanGroup('modp16');
```

```cjs
const { createDiffieHellmanGroup } = require('node:crypto');
const dh = createDiffieHellmanGroup('modp16');
```

Поддерживаются следующие группы:

-   `'modp14'` (2048 бит, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Раздел 3)
-   `'modp15'` (3072 бита, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Раздел 4)
-   `'modp16'` (4096 бит, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Раздел 5)
-   `'modp17'` (6144 бит, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Раздел 6)
-   `'modp18'` (8192 бита, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Раздел 7)

Следующие группы все еще поддерживаются, но устарели (см. [Caveats](#support-for-weak-or-compromised-algorithms)):

-   `'modp1'` (768 bits, [RFC 2409](https://www.rfc-editor.org/rfc/rfc2409.txt) Section 6.1) <span class="deprecated-inline"></span>
-   `'modp2'` (1024 bits, [RFC 2409](https://www.rfc-editor.org/rfc/rfc2409.txt) Section 6.2) <span class="deprecated-inline"></span>
-   `'modp5'` (1536 bits, [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt) Section 2) <span class="deprecated-inline"></span>

Эти устаревшие группы могут быть удалены в будущих версиях Node.js.

<!-- 0033.part.md -->

## Класс: `ECDH`

Класс `ECDH` - это утилита для создания обменов ключами Elliptic Curve Diffie-Hellman (ECDH).

Экземпляры класса `ECDH` могут быть созданы с помощью функции [`crypto.createECDH()`](#cryptocreateecdhcurvename).

```mjs
import assert from 'node:assert';

const { createECDH } = await import('node:crypto');

// Генерируем ключи Алисы...
const alice = createECDH('secp521r1');
const aliceKey = alice.generateKeys();

// Генерируем ключи Боба...
const bob = createECDH('secp521r1');
const bobKey = bob.generateKeys();

// Обмен и генерация секрета...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

assert.strictEqual(
    aliceSecret.toString('hex'),
    bobSecret.toString('hex')
);
// OK
```

```cjs
const assert = require('node:assert');

const { createECDH } = require('node:crypto');

// Генерируем ключи Алисы...
const alice = createECDH('secp521r1');
const aliceKey = alice.generateKeys();

// Генерируем ключи Боба...
const bob = createECDH('secp521r1');
const bobKey = bob.generateKeys();

// Обмен и генерация секрета...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

assert.strictEqual(
    aliceSecret.toString('hex'),
    bobSecret.toString('hex')
);
// OK
```

<!-- 0034.part.md -->

### Статический метод: `ECDH.convertKey(key, curve[, inputEncoding[, outputEncoding[, format]]])`

-   `key` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `curve` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `key`.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   `формат` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `uncompressed`.
-   Возвращает: {Буфер | строка}

Преобразует открытый ключ EC Диффи-Хеллмана, указанный `key` и `curve` в формат, указанный `format`. Аргумент `format` задает кодировку точки и может быть `сжатым`, `несжатым` или `гибридным`. Предоставленный ключ интерпретируется с использованием указанного `inputEncoding`, а возвращаемый ключ кодируется с использованием указанного `outputEncoding`.

Используйте [`crypto.getCurves()`](#cryptogetcurves) для получения списка доступных имен кривых. В последних выпусках OpenSSL, `openssl ecparam -list_curves` также отобразит имя и описание каждой доступной эллиптической кривой.

Если `format` не указан, точка будет возвращена в формате `uncompressed`.

Если `inputEncoding` не указан, ожидается, что `key` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Пример (распаковка ключа):

```mjs
const { createECDH, ECDH } = await import('node:crypto');

const ecdh = createECDH('secp256k1');
ecdh.generateKeys();

const compressedKey = ecdh.getPublicKey(
    'hex',
    'compressed'
);

const uncompressedKey = ECDH.convertKey(
    compressedKey,
    'secp256k1',
    'hex',
    'hex',
    'uncompressed'
);

// Преобразованный ключ и несжатый открытый ключ должны быть одинаковыми
console.log(uncompressedKey === ecdh.getPublicKey('hex'));
```

```cjs
const { createECDH, ECDH } = require('node:crypto');

const ecdh = createECDH('secp256k1');
ecdh.generateKeys();

const compressedKey = ecdh.getPublicKey(
    'hex',
    'compressed'
);

const uncompressedKey = ECDH.convertKey(
    compressedKey,
    'secp256k1',
    'hex',
    'hex',
    'uncompressed'
);

// Преобразованный ключ и несжатый открытый ключ должны быть одинаковыми
console.log(uncompressedKey === ecdh.getPublicKey('hex'));
```

<!-- 0035.part.md -->

### `ecdh.computeSecret(otherPublicKey[, inputEncoding][, outputEncoding])`

-   `otherPublicKey` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `otherPublicKey`.
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Вычисляет общий секрет, используя `otherPublicKey` в качестве открытого ключа другой стороны, и возвращает вычисленный общий секрет. Предоставленный ключ интерпретируется с использованием указанного `inputEncoding`, а возвращаемый секрет кодируется с использованием указанного `outputEncoding`. Если `inputEncoding` не указан, ожидается, что `otherPublicKey` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если задано `outputEncoding`, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

`ecdh.computeSecret` будет выдавать ошибку `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY`, если `otherPublicKey` лежит за пределами эллиптической кривой. Поскольку `otherPublicKey` обычно передается от удаленного пользователя по незащищенной сети, не забудьте обработать это исключение соответствующим образом.

<!-- 0036.part.md -->

### `ecdh.generateKeys([encoding[, format]])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   `формат` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `uncompressed`.
-   Возвращает: {Буфер | строка}

Генерирует значения закрытого и открытого ключей EC Diffie-Hellman и возвращает открытый ключ в указанном `формате` и `кодировке`. Этот ключ должен быть передан другой стороне.

Аргумент `формат` задает кодировку точки и может быть `сжатым` или `несжатым`. Если `format` не указан, точка будет возвращена в формате `'uncompressed'`.

Если указано `encoding`, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

<!-- 0037.part.md -->

### `ecdh.getPrivateKey([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка} EC Diffie-Hellman в указанном `кодировании`.

Если указано `encoding`, возвращается строка; в противном случае возвращается [`буфер`](buffer.md).

<!-- 0038.part.md -->

### `ecdh.getPublicKey([encoding][, format])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   `формат` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `uncompressed`.
-   Возвращает: {Буфер | строка} Открытый ключ EC Diffie-Hellman в указанном `кодировании` и `формате`.

Аргумент `формат` определяет кодировку точки и может быть `сжатым` или `несжатым`. Если `формат` не указан, точка будет возвращена в формате `без сжатия`.

Если указано `encoding`, возвращается строка, в противном случае возвращается [`Buffer`](buffer.md).

<!-- 0039.part.md -->

### `ecdh.setPrivateKey(privateKey[, encoding])`

-   `privateKey` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `privateKey`.

Устанавливает закрытый ключ EC Diffie-Hellman. Если указано `encoding`, ожидается, что `privateKey` будет строкой, в противном случае `privateKey` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если `privateKey` не действителен для кривой, указанной при создании объекта `ECDH`, будет выдана ошибка. При установке закрытого ключа, связанная с ним открытая точка (ключ) также генерируется и устанавливается в объекте `ECDH`.

<!-- 0040.part.md -->

### `ecdh.setPublicKey(publicKey[, encoding])`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

-   `publicKey` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `publicKey`.

Устанавливает открытый ключ EC Diffie-Hellman. Если указано `encoding`, то ожидается, что `publicKey` будет строкой; в противном случае ожидается [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Обычно нет причин вызывать этот метод, поскольку `ECDH` требует только закрытый ключ и открытый ключ другой стороны для вычисления общего секрета. Обычно вызывается либо [`ecdh.generateKeys()`](#ecdhgeneratekeysencoding-format), либо [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding). Метод [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding) пытается сгенерировать публичную точку/ключ, связанный с устанавливаемым закрытым ключом.

Пример (получение общего секрета):

```mjs
const { createECDH, createHash } = await import(
    'node:crypto'
);

const alice = createECDH('secp256k1');
const bob = createECDH('secp256k1');

// Это короткий способ указать один из предыдущих закрытых ключей Алисы.
// ключей. Было бы неразумно использовать такой предсказуемый закрытый ключ в реальном // приложении.
// приложении.
alice.setPrivateKey(
    createHash('sha256').update('alice', 'utf8').digest()
);

// Боб использует новую сгенерированную криптографически сильную
// псевдослучайную пару ключей
bob.generateKeys();

const aliceSecret = alice.computeSecret(
    bob.getPublicKey(),
    null,
    'hex'
);
const bobSecret = bob.computeSecret(
    alice.getPublicKey(),
    null,
    'hex'
);

// aliceSecret и bobSecret должны быть одним и тем же значением общего секрета
console.log(aliceSecret === bobSecret);
```

```cjs
const { createECDH, createHash } = require('node:crypto');

const alice = createECDH('secp256k1');
const bob = createECDH('secp256k1');

// Это короткий способ указать один из предыдущих закрытых ключей Алисы.
// ключей. Было бы неразумно использовать такой предсказуемый закрытый ключ в реальном // приложении.
// приложении.
alice.setPrivateKey(
    createHash('sha256').update('alice', 'utf8').digest()
);

// Боб использует новую сгенерированную криптографически сильную
// псевдослучайную пару ключей
bob.generateKeys();

const aliceSecret = alice.computeSecret(
    bob.getPublicKey(),
    null,
    'hex'
);
const bobSecret = bob.computeSecret(
    alice.getPublicKey(),
    null,
    'hex'
);

// aliceSecret и bobSecret должны быть одним и тем же значением общего секрета
console.log(aliceSecret === bobSecret);
```

<!-- 0041.part.md -->

## Класс: `Hash`

-   Расширяет: {stream.Transform}

Класс `Hash` - это утилита для создания хэш-дайджестов данных. Он может быть использован одним из двух способов:

-   В качестве [stream](stream.md), доступного как для чтения, так и для записи, где данные записываются для получения вычисленного хэш-дайджеста на стороне, доступной для чтения, или
-   используя методы [`hash.update()`](#hashupdatedata-inputencoding) и [`hash.digest()`](#hashdigestencoding) для создания вычисленного хэша.

Метод [`crypto.createHash()`](#cryptocreatehashalgorithm-options) используется для создания экземпляров `Hash`. Объекты `Hash` не должны создаваться напрямую с помощью ключевого слова `new`.

Пример: Использование объектов `Hash` в качестве потоков:

```mjs
const { createHash } = await import('node:crypto');

const hash = createHash('sha256');

hash.on('readable', () => {
    // Только один элемент будет произведен потоком
    // хэш-поток.
    const data = hash.read();
    if (data) {
        console.log(data.toString('hex'));
        // Печатает:
        // 6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
    }
});

hash.write('некоторые данные в хэш');
hash.end();
```

```cjs
const { createHash } = require('node:crypto');

const hash = createHash('sha256');

hash.on('readable', () => {
    // Только один элемент будет произведен потоком
    // хэш-поток.
    const data = hash.read();
    if (data) {
        console.log(data.toString('hex'));
        // Печатает:
        // 6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
    }
});

hash.write('некоторые данные в хэш');
hash.end();
```

Пример: Использование `Hash` и конвейерных потоков:

```mjs
import { createReadStream } from 'node:fs';
import { stdout } from 'node:process';
const { createHash } = await import('node:crypto');

const hash = createHash('sha256');

const input = createReadStream('test.js');
input.pipe(hash).setEncoding('hex').pipe(stdout);
```

```cjs
const { createReadStream } = require('node:fs');
const { createHash } = require('node:crypto');
const { stdout } = require('node:process');

const hash = createHash('sha256');

const input = createReadStream('test.js');
input.pipe(hash).setEncoding('hex').pipe(stdout);
```

Пример: Использование методов [`hash.update()`](#hashupdatedata-inputencoding) и [`hash.digest()`](#hashdigestencoding):

```mjs
const { createHash } = await import('node:crypto');

const hash = createHash('sha256');

hash.update('некоторые данные для хэширования');
console.log(hash.digest('hex'));
// Печатает:
// 6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
```

```cjs
const { createHash } = require('node:crypto');

const hash = createHash('sha256');

hash.update('некоторые данные для хэширования');
console.log(hash.digest('hex'));
// Печатает:
// 6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
```

<!-- 0042.part.md -->

### `hash.copy([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: {Hash}

Создает новый объект `Hash`, который содержит глубокую копию внутреннего состояния текущего объекта `Hash`.

Необязательный аргумент `options` управляет поведением потока. Для хэш-функций XOF, таких как `'shake256'`, опция `outputLength` может быть использована для указания желаемой длины вывода в байтах.

При попытке скопировать объект `Hash` после вызова его метода [`hash.digest()`](#hashdigestencoding) возникает ошибка.

```mjs
// Вычисление скользящего хэша.
const { createHash } = await import('node:crypto');

const hash = createHash('sha256');

hash.update('1');
console.log(hash.copy().digest('hex'));

hash.update('two');
console.log(hash.copy().digest('hex'));

hash.update('three');
console.log(hash.copy().digest('hex'));

// И т.д.
```

```cjs
// Вычисление скользящего хэша.
const { createHash } = require('node:crypto');

const hash = createHash('sha256');

hash.update('1');
console.log(hash.copy().digest('hex'));

hash.update('two');
console.log(hash.copy().digest('hex'));

hash.update('three');
console.log(hash.copy().digest('hex'));

// И т.д.
```

<!-- 0043.part.md -->

### `hash.digest([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Вычисляет дайджест всех данных, переданных для хеширования (с помощью метода [`hash.update()`](#hashupdatedata-inputencoding)). Если указано `encoding`, то возвращается строка; в противном случае возвращается [`Buffer`](buffer.md).

Объект `Hash` не может быть использован повторно после вызова метода `hash.digest()`. Многократные вызовы приведут к возникновению ошибки.

<!-- 0044.part.md -->

### `hash.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`.

Обновляет содержимое хэша с заданными `data`, кодировка которых указана в `inputEncoding`. Если `encoding` не указан, а `данные` являются строкой, то применяется кодировка `'utf8'`. Если `data` является [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Эта функция может вызываться много раз с новыми данными по мере их передачи.

<!-- 0045.part.md -->

## Класс: `Hmac`

-   Расширяет: {stream.Transform}

Класс `Hmac` - это утилита для создания криптографических HMAC-дайджестов. Он может быть использован одним из двух способов:

-   В виде [stream](stream.md), доступного как для чтения, так и для записи, где данные записываются для получения вычисленного HMAC-дайджеста на стороне, доступной для чтения, или
-   используя методы [`hmac.update()`](#hmacupdatedata-inputencoding) и [`hmac.digest()`](#hmacdigestencoding) для создания вычисленного HMAC-дайджеста.

Метод [`crypto.createHmac()`](#cryptocreatehmacalgorithm-key-options) используется для создания экземпляров `Hmac`. Объекты `Hmac` не должны создаваться напрямую с помощью ключевого слова `new`.

Пример: Использование объектов `Hmac` в качестве потоков:

```mjs
const { createHmac } = await import('node:crypto');

const hmac = createHmac('sha256', 'секрет');

hmac.on('readable', () => {
    // Только один элемент будет получен с помощью
    // хэш-поток.
    const data = hmac.read();
    if (data) {
        console.log(data.toString('hex'));
        // Печатает:
        // 7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
    }
});

hmac.write('некоторые данные для хэширования');
hmac.end();
```

```cjs
const { createHmac } = require('node:crypto');

const hmac = createHmac('sha256', 'секрет');

hmac.on('readable', () => {
    // Только один элемент будет получен с помощью
    // хэш-поток.
    const data = hmac.read();
    if (data) {
        console.log(data.toString('hex'));
        // Печатает:
        // 7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
    }
});

hmac.write('некоторые данные для хэширования');
hmac.end();
```

Пример: Использование `Hmac` и конвейерных потоков:

```mjs
import { createReadStream } from 'node:fs';
import { stdout } from 'node:process';
const { createHmac } = await import('node:crypto');

const hmac = createHmac('sha256', 'секрет');

const input = createReadStream('test.js');
input.pipe(hmac).pipe(stdout);
```

```cjs
const { createReadStream } = require('node:fs');
const { createHmac } = require('node:crypto');
const { stdout } = require('node:process');

const hmac = createHmac('sha256', 'секрет');

const input = createReadStream('test.js');
input.pipe(hmac).pipe(stdout);
```

Пример: Использование методов [`hmac.update()`](#hmacupdatedata-inputencoding) и [`hmac.digest()`](#hmacdigestencoding):

```mjs
const { createHmac } = await import('node:crypto');

const hmac = createHmac('sha256', 'секрет');

hmac.update('некоторые данные для хэширования');
console.log(hmac.digest('hex'));
// Печатает:
// 7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
```

```cjs
const { createHmac } = require('node:crypto');

const hmac = createHmac('sha256', 'секрет');

hmac.update('некоторые данные для хэширования');
console.log(hmac.digest('hex'));
// Печатает:
// 7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
```

<!-- 0046.part.md -->

### `hmac.digest([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Вычисляет HMAC-дайджест всех данных, переданных с помощью [`hmac.update()`](#hmacupdatedata-inputencoding). Если указано `encoding`, возвращается строка; в противном случае возвращается [`Buffer`](buffer.md);

Объект `Hmac` не может быть использован повторно после вызова `hmac.digest()`. Многократные вызовы `hmac.digest()` приведут к возникновению ошибки.

<!-- 0047.part.md -->

### `hmac.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`.

Обновляет содержимое `Hmac` с заданными `data`, кодировка которых указана в `inputEncoding`. Если `encoding` не указан, а `данные` являются строкой, то применяется кодировка `'utf8'`. Если `data` является [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Эта функция может вызываться много раз с новыми данными по мере их передачи.

<!-- 0048.part.md -->

## Класс: `KeyObject`

Node.js использует класс `KeyObject` для представления симметричного или асимметричного ключа, и каждый вид ключа открывает различные функции. Методы [`crypto.createSecretKey()`](#cryptocreatesecretkey-encoding), [`crypto.createPublicKey()`](#cryptocreatepublickeykey) и [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey) используются для создания экземпляров `KeyObject`. Объекты `KeyObject` не должны создаваться непосредственно с помощью ключевого слова `new`.

Большинство приложений должны рассмотреть возможность использования нового API `KeyObject` вместо передачи ключей в виде строк или `буфера` из-за улучшенных функций безопасности.

Экземпляры `KeyObject` могут быть переданы другим потокам через [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist). Получатель получает клонированный `KeyObject`, и `KeyObject` не нужно указывать в аргументе `transferList`.

<!-- 0049.part.md -->

### Статический метод: `KeyObject.from(key)`

-   `key` {CryptoKey}
-   Возвращает: {KeyObject}

Пример: Преобразование экземпляра `CryptoKey` в `KeyObject`:

```mjs
const { KeyObject } = await import('node:crypto');
const { subtle } = globalThis.crypto;

const key = await subtle.generateKey(
    {
        name: 'HMAC',
        hash: 'SHA-256',
        length: 256,
    },
    true,
    ['sign', 'verify']
);

const keyObject = KeyObject.from(key);
console.log(keyObject.symmetricKeySize);
// Печатается: 32 (размер симметричного ключа в байтах)
```

```cjs
const { KeyObject } = require('node:crypto');
const { subtle } = globalThis.crypto;

(async function () {
    const key = await subtle.generateKey(
        {
            name: 'HMAC',
            hash: 'SHA-256',
            length: 256,
        },
        true,
        ['sign', 'verify']
    );

    const keyObject = KeyObject.from(key);
    console.log(keyObject.symmetricKeySize);
    // Печатается: 32 (размер симметричного ключа в байтах)
})();
```

<!-- 0050.part.md -->

### `keyObject.asymmetricKeyDetails`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `modulusLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер ключа в битах (RSA, DSA).
    -   `publicExponent`: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Публичная экспонента (RSA).
    -   `hashAlgorithm`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя дайджеста сообщения (RSA-PSS).
    -   `mgf1HashAlgorithm`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя дайджеста сообщения, используемого MGF1 (RSA-PSS).
    -   `saltLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальная длина соли в байтах (RSA-PSS).
    -   `divisorLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер `q` в битах (DSA).
    -   `namedCurve`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя кривой (EC).

Это свойство существует только для асимметричных ключей. В зависимости от типа ключа, этот объект содержит информацию о ключе. Никакая информация, полученная через это свойство, не может быть использована для уникальной идентификации ключа или для нарушения безопасности ключа.

Для ключей RSA-PSS, если материал ключа содержит последовательность `RSASSA-PSS-params`, будут установлены свойства `hashAlgorithm`, `mgf1HashAlgorithm` и `saltLength`.

Другие детали ключа могут быть раскрыты через этот API с помощью дополнительных атрибутов.

<!-- 0051.part.md -->

### `keyObject.asymmetricKeyType`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Для асимметричных ключей это свойство представляет тип ключа. Поддерживаются следующие типы ключей:

-   `rsa` (OID 1.2.840.113549.1.1.1)
-   `rsa-pss` (OID 1.2.840.113549.1.1.10)
-   `dsa` (OID 1.2.840.10040.4.1)
-   `ec` (OID 1.2.840.10045.2.1)
-   `x25519` (OID 1.3.101.110)
-   `x448` (OID 1.3.101.111)
-   `ed25519` (OID 1.3.101.112)
-   `ed448` (OID 1.3.101.113)
-   `dh` (OID 1.2.840.113549.1.3.1)

Это свойство `не определено` для нераспознанных типов `KeyObject` и симметричных ключей.

<!-- 0052.part.md -->

### `keyObject.export([options])`

-   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   Возвращает: {строка | буфер | объект}.

Для симметричных ключей можно использовать следующие параметры кодировки:

-   `формат`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `буфер` (по умолчанию) или `jwk`.

Для открытых ключей можно использовать следующие параметры кодировки:

-   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть одно из `'pkcs1'` (только RSA) или `'spki'`.
-   `формат`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должен быть `'pem'`, `'der'` или `'jwk'`.

Для закрытых ключей можно использовать следующие параметры кодировки:

-   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть одно из `'pkcs1'` (только RSA), `'pkcs8'` или `'sec1'` (только EC).
-   `формат`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должен быть `'pem'`, `'der'` или `'jwk'`.
-   `шифр`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Если указано, закрытый ключ будет зашифрован с помощью заданных `шифра` и `пасфразы` с использованием PKCS\#5 v2.0 шифрования на основе пароля.
-   `passphrase`: {строка | буфер} Парольная фраза, используемая для шифрования, см. `шифр`.

Тип результата зависит от выбранного формата кодирования, при PEM результатом будет строка, при DER - буфер, содержащий данные, закодированные как DER, при [JWK](https://tools.ietf.org/html/rfc7517) - объект.

Если выбран формат кодирования [JWK](https://tools.ietf.org/html/rfc7517), все остальные варианты кодирования игнорируются.

Ключи типов PKCS\#1, SEC1 и PKCS\#8 могут быть зашифрованы с помощью комбинации опций `шифр` и `формат`. PKCS\#8 `type` можно использовать с любым `format` для шифрования любого алгоритма ключа (RSA, EC или DH), указав `cipher`. PKCS\#1 и SEC1 могут быть зашифрованы путем указания `шифра` только при использовании `формата PEM`. Для максимальной совместимости используйте PKCS\#8 для зашифрованных закрытых ключей. Поскольку PKCS\#8 определяет свой собственный механизм шифрования, шифрование на уровне PEM не поддерживается при шифровании ключа PKCS\#8. См. [RFC 5208](https://www.rfc-editor.org/rfc/rfc5208.txt) для шифрования PKCS\#8 и [RFC 1421](https://www.rfc-editor.org/rfc/rfc1421.txt) для шифрования PKCS\#1 и SEC1.

<!-- 0053.part.md -->

### `keyObject.equals(otherKeyObject)`

-   `otherKeyObject`: {KeyObject} Объект `KeyObject`, с которым сравнивается `keyObject`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true` или `false` в зависимости от того, имеют ли ключи абсолютно одинаковый тип, значение и параметры. Этот метод не является [постоянным временем](https://en.wikipedia.org/wiki/Timing_attack).

<!-- 0054.part.md -->

### `keyObject.symmetricKeySize`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Для секретных ключей это свойство представляет размер ключа в байтах. Для асимметричных ключей это свойство `не определено`.

<!-- 0055.part.md -->

### `keyObject.type`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

В зависимости от типа данного `KeyObject`, это свойство является либо `'secret'` для секретных (симметричных) ключей, либо `'public'` для открытых (асимметричных) ключей, либо `'private'` для закрытых (асимметричных) ключей.

<!-- 0056.part.md -->

## Класс: `Sign`

-   Расширяет: [`<stream.Writable>`](stream.md#streamwritable)

Класс `Sign` - это утилита для генерации подписей. Он может быть использован одним из двух способов:

-   Как записываемый [stream](stream.md), в который записываются данные, подлежащие подписи, а метод [`sign.sign()`](#signsignprivatekey-outputencoding) используется для генерации и возврата подписи, или
-   Использование методов [`sign.update()`](#signupdatedata-inputencoding) и [`sign.sign()`](#signsignprivatekey-outputencoding) для создания подписи.

Метод [`crypto.createSign()`](#cryptocreatesignalgorithm-options) используется для создания экземпляров `Sign`. Аргументом является строковое имя используемой хэш-функции. Объекты `Sign` не должны создаваться напрямую с помощью ключевого слова `new`.

Пример: Использование объектов `Sign` и [`Verify`](#class-verify) в качестве потоков:

```mjs
const {
    generateKeyPairSync,
    createSign,
    createVerify,
} = await import('node:crypto');

const { privateKey, publicKey } = generateKeyPairSync(
    'ec',
    {
        namedCurve: 'sect239k1',
    }
);

const sign = createSign('SHA256');
sign.write('некоторые данные для подписи');
sign.end();
const signature = sign.sign(privateKey, 'hex');

const verify = createVerify('SHA256');
verify.write('некоторые данные для подписи');
verify.end();
console.log(verify.verify(publicKey, signature, 'hex'));
// Выводит: true
```

```cjs
const {
    generateKeyPairSync,
    createSign,
    createVerify,
} = require('node:crypto');

const { privateKey, publicKey } = generateKeyPairSync(
    'ec',
    {
        namedCurve: 'sect239k1',
    }
);

const sign = createSign('SHA256');
sign.write('некоторые данные для подписи');
sign.end();
const signature = sign.sign(privateKey, 'hex');

const verify = createVerify('SHA256');
verify.write('некоторые данные для подписи');
verify.end();
console.log(verify.verify(publicKey, signature, 'hex'));
// Выводит: true
```

Пример: Использование методов [`sign.update()`](#signupdatedata-inputencoding) и [`verify.update()`](#verifyupdatedata-inputencoding):

```mjs
const {
    generateKeyPairSync,
    createSign,
    createVerify,
} = await import('node:crypto');

const { privateKey, publicKey } = generateKeyPairSync(
    'rsa',
    {
        modulusLength: 2048,
    }
);

const sign = createSign('SHA256');
sign.update('некоторые данные для подписи');
sign.end();
const signature = sign.sign(privateKey);

const verify = createVerify('SHA256');
verify.update('некоторые данные для подписи');
verify.end();
console.log(verify.verify(publicKey, signature));
// Выводит: true
```

```cjs
const {
    generateKeyPairSync,
    createSign,
    createVerify,
} = require('node:crypto');

const { privateKey, publicKey } = generateKeyPairSync(
    'rsa',
    {
        modulusLength: 2048,
    }
);

const sign = createSign('SHA256');
sign.update('некоторые данные для подписи');
sign.end();
const signature = sign.sign(privateKey);

const verify = createVerify('SHA256');
verify.update('некоторые данные для подписи');
verify.end();
console.log(verify.verify(publicKey, signature));
// Выводит: true
```

<!-- 0057.part.md -->

### `sign.sign(privateKey[, outputEncoding])`

-   `privateKey` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
    -   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `outputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) возвращаемого значения.
-   Возвращает: {Буфер | строка}.

Вычисляет подпись на всех переданных данных, используя либо [`sign.update()`](#signupdatedata-inputencoding), либо [`sign.write()`](stream.md#writablewritechunk-encoding-callback).

Если `privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykeykey). Если это объект, могут быть переданы следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр определяет формат генерируемой подписи. Он может быть одним из следующих:

    -   `der` (по умолчанию): DER-кодирование ASN.1 структуры подписи в кодировке `(r, s)`.
    -   `'ieee-p1363'`: Формат подписи `r || s`, предложенный в IEEE-P1363.

-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение прокладки для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (по умолчанию)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хэш-функцией, которая используется для подписи сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt), если только хэш-функция MGF1 не была указана как часть ключа в соответствии с разделом 3.3 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли для случая, когда padding равен `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли в размер дайджеста, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) - в максимально допустимое значение.

Если указано `outputEncoding`, возвращается строка; в противном случае возвращается [`буфер`](buffer.md).

Объект `Sign` не может быть повторно использован после вызова метода `sign.sign()`. Многократные вызовы метода `sign.sign()` приведут к возникновению ошибки.

<!-- 0058.part.md -->

### `sign.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`.

Обновляет содержимое `Sign` с заданными `data`, кодировка которых указана в `inputEncoding`. Если `encoding` не указан, и `данные` являются строкой, то применяется кодировка `'utf8'`. Если `data` является [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Эта функция может вызываться много раз с новыми данными по мере их передачи.

<!-- 0059.part.md -->

## Класс: `Verify`

-   Расширяет: [`<stream.Writable>`](stream.md#streamwritable)

Класс `Verify` - это утилита для проверки подписей. Он может быть использован одним из двух способов:

-   Как записываемый [stream](stream.md), где записанные данные используются для проверки на соответствие предоставленной подписи, или
-   Используя методы [`verify.update()`](#verifyupdatedata-inputencoding) и [`verify.verify()`](#verifyverifyobject-signature-signatureencoding) для проверки подписи.

Метод [`crypto.createVerify()`](#cryptocreateverifyalgorithm-options) используется для создания экземпляров `Verify`. Объекты `Verify` не должны создаваться напрямую с помощью ключевого слова `new`.

Примеры смотрите в [`Sign`](#class-sign).

<!-- 0060.part.md -->

### `verify.update(data[, inputEncoding])`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `inputEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `data`.

Обновляет содержимое `Verify` с заданными `data`, кодировка которых указана в `inputEncoding`. Если `inputEncoding` не указан, а `данные` являются строкой, применяется кодировка `'utf8'`. Если `data` является [`Buffer`](buffer.md), `TypedArray` или `DataView`, то `inputEncoding` игнорируется.

Эта функция может вызываться много раз с новыми данными по мере их передачи.

<!-- 0061.part.md -->

### `verify.verify(object, signature[, signatureEncoding])`

-   `object` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
    -   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `signature` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `signatureEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `signature`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` или `false` в зависимости от достоверности подписи для данных и открытого ключа.

Проверяет предоставленные данные с помощью заданных `объекта` и `подписи`.

Если `object` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `object` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, то могут быть переданы следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр определяет формат подписи. Он может быть одним из следующих:

    -   `'der` (по умолчанию): DER-кодирование ASN.1 структуры подписи в кодировке `(r, s)`.
    -   `'ieee-p1363'`: Формат подписи `r || s`, предложенный в IEEE-P1363.

-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение прокладки для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (по умолчанию)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хэш-функцией, которая используется для проверки сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt), если только хэш-функция MGF1 не была указана как часть ключа в соответствии с разделом 3.3 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли для случая, когда padding равен `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли в соответствии с размером дайджеста, `crypto.constants.RSA_PSS_SALTLEN_AUTO` (по умолчанию) заставляет ее определяться автоматически.

Аргумент `signature` - это ранее вычисленная подпись для данных в кодировке `signatureEncoding`. Если указано `signatureEncoding`, то ожидается, что `signature` будет строкой, в противном случае `signature` будет [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Объект `verify` не может быть использован повторно после вызова `verify.verify()`. Многократные вызовы `verify.verify()` приведут к возникновению ошибки.

Поскольку открытые ключи могут быть производными от закрытых ключей, вместо открытого ключа можно передать закрытый ключ.

<!-- 0062.part.md -->

## Класс: `X509Certificate`

Инкапсулирует сертификат X509 и предоставляет доступ к его информации только для чтения.

```mjs
const { X509Certificate } = await import('node:crypto');

const x509 = new X509Certificate(
    '{... pem encoded cert ...}'
);

console.log(x509.subject);
```

```cjs
const { X509Certificate } = require('node:crypto');

const x509 = new X509Certificate(
    '{... pem encoded cert ...}'
);

console.log(x509.subject);
```

<!-- 0063.part.md -->

### `new X509Certificate(buffer)`

-   `buffer` {string|TypedArray|Buffer|DataView} Сертификат X509 в кодировке PEM или DER.

<!-- 0064.part.md -->

### `x509.ca`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Будет `true`, если это сертификат центра сертификации (ЦС).

<!-- 0065.part.md -->

### `x509.checkEmail(email[, options])`

-   `email` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `subject` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `по умолчанию`, `всегда`, или `никогда`. **По умолчанию:** `'по умолчанию'\*.
-   Возвращает: {string|undefined} Возвращает `email`, если сертификат соответствует, `undefined`, если не соответствует.

Проверяет, соответствует ли сертификат заданному адресу электронной почты.

Если параметр `'subject'` неопределен или установлен в `'default'`, тема сертификата рассматривается только в том случае, если альтернативное расширение имени subject либо не существует, либо не содержит никаких адресов электронной почты.

Если опция `'subject'` установлена в `'always'` и если альтернативное расширение имени subject либо не существует, либо не содержит подходящего адреса электронной почты, то рассматривается тема сертификата.

Если опция `'subject'` установлена в `'never'`, тема сертификата никогда не рассматривается, даже если сертификат не содержит альтернативных имен темы.

<!-- 0066.part.md -->

### `x509.checkHost(name[, options])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `subject` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `по умолчанию`, `всегда`, или `никогда`. **По умолчанию:** `'по умолчанию'\*.
    -   `wildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
    -   `partialWildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`.
    -   `multiLabelWildcards` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
    -   `singleLabelSubdomains` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
-   Возвращает: {string|undefined} Возвращает имя субъекта, соответствующее `name`, или `undefined`, если ни одно имя субъекта не соответствует `name`.

Проверяет, соответствует ли сертификат заданному имени хоста.

Если сертификат соответствует заданному имени хоста, возвращается соответствующее имя субъекта. Возвращаемое имя может быть точным (например, `foo.example.com`) или содержать подстановочные знаки (например, `*.example.com`). Поскольку сравнение имен хостов не чувствительно к регистру, возвращаемое имя субъекта может отличаться от заданного `name` по капитализации.

Если опция `'subject'` не определена или установлена в `'default'`, субъект сертификата рассматривается только в том случае, если расширение альтернативного имени субъекта либо не существует, либо не содержит никаких имен DNS. Такое поведение соответствует [RFC 2818](https://www.rfc-editor.org/rfc/rfc2818.txt) ("HTTP Over TLS").

Если опция `'subject'` установлена в `'always'` и если расширение альтернативного имени субъекта либо не существует, либо не содержит подходящего DNS-имени, рассматривается субъект сертификата.

Если опция `'subject'` установлена в `'never'`, субъект сертификата никогда не рассматривается, даже если сертификат не содержит альтернативных имен субъекта.

<!-- 0067.part.md -->

### `x509.checkIP(ip)`

-   `ip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {string|undefined} Возвращает `ip`, если сертификат соответствует, `undefined`, если не соответствует.

Проверяет соответствие сертификата заданному IP-адресу (IPv4 или IPv6).

Учитываются только [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280.txt) `iPAddress` предметные альтернативные имена, которые должны точно совпадать с заданным `ip` адресом. Другие альтернативные имена субъектов, а также поле subject сертификата игнорируются.

<!-- 0068.part.md -->

### `x509.checkIssued(otherCert)`

-   `otherCert` {X509Certificate}
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, был ли этот сертификат выпущен данным `otherCert`.

<!-- 0069.part.md -->

### `x509.checkPrivateKey(privateKey)`

-   `privateKey` {KeyObject} Закрытый ключ.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

Проверяет, соответствует ли открытый ключ данного сертификата заданному закрытому ключу.

<!-- 0070.part.md -->

### `x509.fingerprint`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Отпечаток SHA-1 этого сертификата.

Поскольку SHA-1 является криптографически неполноценным и поскольку безопасность SHA-1 значительно хуже, чем у алгоритмов, которые обычно используются для подписания сертификатов, подумайте об использовании [`x509.fingerprint256`](#x509fingerprint256) вместо этого.

<!-- 0071.part.md -->

### `x509.fingerprint256`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Отпечаток SHA-256 этого сертификата.

<!-- 0072.part.md -->

### `x509.fingerprint512`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Отпечаток SHA-512 этого сертификата.

Поскольку вычисление отпечатка SHA-256 обычно происходит быстрее, а его размер в два раза меньше, чем у отпечатка SHA-512, [`x509.fingerprint256`](#x509fingerprint256) может быть лучшим выбором. Хотя SHA-512, предположительно, обеспечивает более высокий уровень безопасности в целом, безопасность SHA-256 соответствует безопасности большинства алгоритмов, которые обычно используются для подписания сертификатов.

<!-- 0073.part.md -->

### `x509.infoAccess`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Текстовое представление расширения доступа к информации об авторитете сертификата.

Это список описаний доступа, разделенных переводом строки. Каждая строка начинается с метода доступа и вида места доступа, затем следует двоеточие и значение, связанное с местом доступа.

После префикса, обозначающего метод доступа и вид места доступа, оставшаяся часть каждой строки может быть заключена в кавычки, чтобы указать, что значение является литералом строки JSON. Для обратной совместимости Node.js использует строковые литералы JSON в этом свойстве только при необходимости, чтобы избежать двусмысленности. Код сторонних разработчиков должен быть готов к обработке обоих возможных форматов ввода.

<!-- 0074.part.md -->

### `x509.issuer`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Идентификатор эмитента, включенный в данный сертификат.

<!-- 0075.part.md -->

### `x509.issuerCertificate`

-   Тип: {X509Certificate}

Сертификат эмитента или `undefined`, если сертификат эмитента недоступен.

<!-- 0076.part.md -->

### `x509.keyUsage`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Массив с подробным описанием использования ключей для этого сертификата.

<!-- 0077.part.md -->

### `x509.publicKey`

-   Тип: {KeyObject}

Открытый ключ {KeyObject} для этого сертификата.

<!-- 0078.part.md -->

### `x509.raw`

-   Тип: [`<Buffer>`](buffer.md#buffer)

Буфер, содержащий DER-кодировку данного сертификата.

<!-- 0079.part.md -->

### `x509.serialNumber`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Серийный номер данного сертификата.

Серийные номера присваиваются центрами сертификации и не являются уникальной идентификацией сертификатов. Вместо этого используйте [`x509.fingerprint256`](#x509fingerprint256) в качестве уникального идентификатора.

<!-- 0080.part.md -->

### `x509.subject`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Полный субъект этого сертификата.

<!-- 0081.part.md -->

### `x509.subjectAltName`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Альтернативное имя субъекта, указанное для этого сертификата.

Это список альтернативных имен субъектов, разделенных запятыми. Каждая запись начинается со строки, определяющей вид альтернативного имени субъекта, за которой следует двоеточие и значение, связанное с этой записью.

Ранние версии Node.js ошибочно полагали, что безопасно разделять это свойство на двухсимвольную последовательность `', '` (см. [CVE-2021-44532](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2021-44532)). Однако как вредоносные, так и легитимные сертификаты могут содержать альтернативные имена субъектов, включающие эту последовательность при представлении в виде строки.

После префикса, обозначающего тип записи, оставшаяся часть каждой записи может быть заключена в кавычки, чтобы указать, что значение является строковым литералом JSON. Для обратной совместимости Node.js использует строковые литералы JSON в этом свойстве только при необходимости, чтобы избежать двусмысленности. Код сторонних разработчиков должен быть готов к обработке обоих возможных форматов ввода.

<!-- 0082.part.md -->

### `x509.toJSON()`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Не существует стандартной кодировки JSON для сертификатов X509. Метод `toJSON()` возвращает строку, содержащую сертификат в кодировке PEM.

<!-- 0083.part.md -->

### `x509.toLegacyObject()`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает информацию об этом сертификате, используя кодировку legacy [certificate object](tls.md#certificate-object).

<!-- 0084.part.md -->

### `x509.toString()`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает сертификат в PEM-кодировке.

<!-- 0085.part.md -->

### `x509.validFrom`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Дата/время, с которой данный сертификат считается действительным.

<!-- 0086.part.md -->

### `x509.validTo`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Дата/время, до которого этот сертификат считается действительным.

<!-- 0087.part.md -->

### `x509.verify(publicKey)`

-   `publicKey` {KeyObject} Открытый ключ.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, что данный сертификат был подписан данным открытым ключом. Не выполняет никаких других проверок сертификата.

<!-- 0088.part.md -->

## Методы и свойства модуля `node:crypto`

<!-- 0089.part.md -->

### `crypto.constants`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект, содержащий часто используемые константы для операций, связанных с криптографией и безопасностью. Конкретные константы, определенные в настоящее время, описаны в [Crypto constants](#crypto-constants).

<!-- 0090.part.md -->

### `crypto.DEFAULT_ENCODING`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

Кодировка по умолчанию для функций, которые могут принимать либо строки, либо [buffers](buffer.md). Значение по умолчанию - `buffer`, что заставляет методы по умолчанию использовать объекты [`Buffer'](buffer.md).

Механизм `crypto.DEFAULT_ENCODING` предусмотрен для обратной совместимости с устаревшими программами, которые ожидают, что `'latin1'` будет кодировкой по умолчанию.

Новые приложения должны ожидать, что по умолчанию будет использоваться кодировка `'buffer'`.

Это свойство устарело.

<!-- 0091.part.md -->

### `crypto.fips`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

Свойство для проверки и контроля того, используется ли в настоящее время FIPS-совместимый криптопровайдер. Установка значения true требует FIPS-сборки Node.js.

Это свойство устарело. Вместо него используйте `crypto.setFips()` и `crypto.getFips()`.

<!-- 0092.part.md -->

### `crypto.checkPrime(candidate[, options], callback)`

-   `candidate` {ArrayBuffer|SharedArrayBuffer|TypedArray|Buffer|DataView|bigint} A possible prime encoded as a sequence of big endian octets of arbitrary length.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `checks` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of Miller-Rabin probabilistic primality iterations to perform. When the value is `0` (zero), a number of checks is used that yields a false positive rate of at most 2<sup>-64</sup> for random input. Care must be used when selecting a number of checks. Refer to the OpenSSL documentation for the [`BN_is_prime_ex`](https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html) function `nchecks` options for more details. **Default:** `0`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Set to an [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) object if an error occurred during check.
    -   `result` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the candidate is a prime with an error probability less than `0.25 ** options.checks`.

Checks the primality of the `candidate`.

<!-- 0093.part.md -->

### `crypto.checkPrimeSync(candidate[, options])`

-   `candidate` {ArrayBuffer|SharedArrayBuffer|TypedArray|Buffer|DataView|bigint} Возможный прайм, закодированный как последовательность октетов big endian произвольной длины.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `checks` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of Miller-Rabin probabilistic primality iterations to perform. Если значение равно `0` (ноль), используется такое количество проверок, которое дает коэффициент ложных срабатываний не более 2<sup>-64</sup> для случайного ввода. При выборе количества проверок следует проявлять осторожность. Более подробную информацию см. в документации OpenSSL для опций функции `nchecks` [`BN_is_prime_ex`](https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html). **По умолчанию:** `0`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если кандидат является простым с вероятностью ошибки меньше чем `0.25 ** options.checks`.

Проверяет первичность `candidate`.

<!-- 0094.part.md -->

### `crypto.createCipher(algorithm, password[, options])`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) вместо этого.

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `пароль` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: {Cipher}

Создает и возвращает объект `Cipher`, использующий заданные `алгоритм` и `пароль`.

Аргумент `options` управляет поведением потока и является необязательным, за исключением случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае опция `authTagLength` является обязательной и определяет длину тега аутентификации в байтах, см. [CCM mode](#ccm-mode). В режиме GCM опция `authTagLength` не обязательна, но может использоваться для установки длины тега аутентификации, который будет возвращен функцией `getAuthTag()` и по умолчанию составляет 16 байт. Для `chacha20-poly1305` опция `authTagLength` по умолчанию равна 16 байтам.

Алгоритм `algorithm` зависит от OpenSSL, примеры: `'aes192'` и т.д. В последних выпусках OpenSSL, `openssl list -cipher-algorithms` покажет доступные алгоритмы шифрования.

Пароль `password` используется для получения ключа шифрования и вектора инициализации (IV). The value must be either a `'latin1'` encoded string, a [`Buffer`](buffer.md), a `TypedArray`, or a `DataView`.

**Эта функция семантически небезопасна для всех поддерживаемых шифров и фатально ошибочна для шифров в режиме счетчика (таких как CTR, GCM или CCM).**

Реализация `crypto.createCipher()` создает ключи с помощью функции OpenSSL [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html) с алгоритмом дайджеста MD5, одной итерацией и без соли. Отсутствие соли позволяет проводить атаки по словарю, поскольку один и тот же пароль всегда создает один и тот же ключ. Малое количество итераций и некриптографически защищенный алгоритм хэширования позволяют проверять пароли очень быстро.

В соответствии с рекомендацией OpenSSL использовать более современный алгоритм вместо [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html), разработчикам рекомендуется самостоятельно определять ключ и IV с помощью [`crypto.scrypt()`](#cryptoscryptpassword-salt-keylen-options-callback) и использовать [`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) для создания объекта `Cipher`. Пользователи не должны использовать шифры с режимом счетчика (например, CTR, GCM или CCM) в `crypto.createCipher()`. При их использовании выдается предупреждение, чтобы избежать риска повторного использования IV, приводящего к уязвимостям. Для случая, когда IV повторно используется в GCM, смотрите [Nonce-Disrespecting Adversaries](https://github.com/nonce-disrespect/nonce-disrespect) для подробностей.

<!-- 0095.part.md -->

### `crypto.createCipheriv(algorithm, key, iv[, options])`

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
-   `iv` {string|ArrayBuffer|Buffer|TypedArray|DataView|null}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: {Cipher}

Создает и возвращает объект `Cipher` с заданным `алгоритмом`, `ключом` и вектором инициализации (`iv`).

Аргумент `options` управляет поведением потока и является необязательным, за исключением случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае опция `authTagLength` является обязательной и определяет длину тега аутентификации в байтах, см. [CCM mode](#ccm-mode). В режиме GCM опция `authTagLength` не обязательна, но может использоваться для установки длины тега аутентификации, который будет возвращен функцией `getAuthTag()` и по умолчанию составляет 16 байт. Для `chacha20-poly1305` опция `authTagLength` по умолчанию равна 16 байтам.

Алгоритм `algorithm` зависит от OpenSSL, примеры: `'aes192'` и т. д. В последних выпусках OpenSSL опция `openssl list -cipher-algorithms` покажет доступные алгоритмы шифрования.

Ключ `key` - это необработанный ключ, используемый `алгоритмом`, а `iv` - это [вектор инициализации](https://en.wikipedia.org/wiki/Initialization_vector). Оба аргумента должны быть строками в кодировке `'utf8`, [Buffers](buffer.md), `TypedArray` или `DataView`. Ключ может быть [`KeyObject`](#class-keyobject) типа `secret`. Если шифру не требуется вектор инициализации, `iv` может быть `null`.

При передаче строк для `key` или `iv`, пожалуйста, учитывайте [предостережения при использовании строк в качестве входов в криптографические API](#using-strings-as-inputs-to-cryptographic-apis).

Векторы инициализации должны быть непредсказуемыми и уникальными; в идеале они должны быть криптографически случайными. Они не обязательно должны быть секретными: IV обычно просто добавляются к шифротекстовым сообщениям в незашифрованном виде. Может показаться противоречивым, что что-то должно быть непредсказуемым и уникальным, но не должно быть секретным; помните, что атакующий не должен иметь возможности заранее предсказать, каким будет данный IV.

<!-- 0096.part.md -->

### `crypto.createDecipher(algorithm, password[, options])`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого используйте [`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options).

-   `algorithm` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `password` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Returns: {Decipher}

Создает и возвращает объект `Decipher`, использующий заданный `алгоритм` и `пароль` (ключ).

Аргумент `options` управляет поведением потока и является необязательным, за исключением случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае опция `authTagLength` является обязательной и определяет длину тега аутентификации в байтах, см. [CCM mode](#ccm-mode). Для `chacha20-poly1305` опция `authTagLength` по умолчанию равна 16 байтам.

Эта функция семантически небезопасна для всех поддерживаемых шифров и фатально небезопасна для шифров в режиме счетчика (таких как CTR, GCM или CCM).

Реализация `crypto.createDecipher()` извлекает ключи с помощью функции OpenSSL [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html) с алгоритмом дайджеста MD5, одной итерацией и без соли. Отсутствие соли позволяет проводить атаки по словарю, так как один и тот же пароль всегда создает один и тот же ключ. Малое количество итераций и некриптографически безопасный алгоритм хэширования позволяют проверять пароли очень быстро.

В соответствии с рекомендацией OpenSSL использовать более современный алгоритм вместо [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html), разработчикам рекомендуется самостоятельно определять ключ и IV с помощью [`crypto.scrypt()`](#cryptoscryptpassword-salt-keylen-options-callback) и использовать [`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options) для создания объекта `Decipher`.

<!-- 0097.part.md -->

### `crypto.createDecipheriv(algorithm, key, iv[, options])`

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
-   `iv` {string|ArrayBuffer|Buffer|TypedArray|DataView|null}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: {Decipher}

Создает и возвращает объект `Decipher`, который использует заданный `алгоритм`, `ключ` и вектор инициализации (`iv`).

Аргумент `options` управляет поведением потока и является необязательным, за исключением случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае опция `authTagLength` является обязательной и определяет длину тега аутентификации в байтах, см. [CCM mode](#ccm-mode). В режиме GCM опция `authTagLength` не требуется, но может быть использована для ограничения принимаемых тегов аутентификации тегами указанной длины. Для `chacha20-poly1305` опция `authTagLength` по умолчанию равна 16 байтам.

Алгоритм `algorithm` зависит от OpenSSL, примеры: `aes192` и т. д. В последних выпусках OpenSSL опция `openssl list -cipher-algorithms` покажет доступные алгоритмы шифрования.

Ключ `key` - это необработанный ключ, используемый `алгоритмом`, а `iv` - это [вектор инициализации](https://en.wikipedia.org/wiki/Initialization_vector). Оба аргумента должны быть строками в кодировке `'utf8`, [Buffers](buffer.md), `TypedArray` или `DataView`. Ключ может быть [`KeyObject`](#class-keyobject) типа `secret`. Если шифру не требуется вектор инициализации, `iv` может быть `null`.

При передаче строк для `key` или `iv`, пожалуйста, учитывайте [предостережения при использовании строк в качестве входов в криптографические API](#using-strings-as-inputs-to-cryptographic-apis).

Векторы инициализации должны быть непредсказуемыми и уникальными; в идеале они должны быть криптографически случайными. Они не обязательно должны быть секретными: IV обычно просто добавляются к шифротекстовым сообщениям в незашифрованном виде. Может показаться противоречивым, что что-то должно быть непредсказуемым и уникальным, но не должно быть секретным; помните, что атакующий не должен иметь возможности заранее предсказать, каким будет данный IV.

<!-- 0098.part.md -->

### `crypto.createDiffieHellman(prime[, primeEncoding][, generator][, generatorEncoding])`

-   `prime` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `primeEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `prime`.
-   `generator` {number|string|ArrayBuffer|Buffer|TypedArray|DataView} **По умолчанию:** `2`.
-   `generatorEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [кодировка](buffer.md#buffers-and-character-encodings) строки `генератора`.
-   Возвращает: {DiffieHellman}

Создает объект обмена ключами `DiffieHellman`, используя предоставленный `prime` и необязательный определенный `генератор`.

Аргумент `generator` может быть числом, строкой или [`Buffer`](buffer.md). Если `generator` не указан, используется значение `2`.

Если указано `primeEncoding`, ожидается, что `prime` будет строкой, в противном случае ожидается [`Buffer`](buffer.md), `TypedArray` или `DataView`.

Если указано `generatorEncoding`, ожидается, что `generator` будет строкой; в противном случае ожидается число, [`Buffer`](buffer.md), `TypedArray` или `DataView`.

<!-- 0099.part.md -->

### `crypto.createDiffieHellman(primeLength[, generator])`

-   `primeLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `генератор` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `2`
-   Возвращает: {DiffieHellman}

Создает объект обмена ключами `DiffieHellman` и генерирует прайм из битов `primeLength`, используя необязательный конкретный числовой `generator`. Если `generator` не указан, используется значение `2`.

<!-- 0100.part.md -->

### `crypto.createDiffieHellmanGroup(name)`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {DiffieHellmanGroup}

Псевдоним для [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname)

<!-- 0101.part.md -->

### `crypto.createECDH(curveName)`

-   `curveName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {ECDH}

Создает объект обмена ключами Elliptic Curve Diffie-Hellman (`ECDH`), используя предопределенную кривую, заданную строкой `curveName`. Используйте [`crypto.getCurves()`](#cryptogetcurves) для получения списка доступных имен кривых. В последних выпусках OpenSSL, `openssl ecparam -list_curves` также отобразит имя и описание каждой доступной эллиптической кривой.

<!-- 0102.part.md -->

### `crypto.createHash(algorithm[, options])`

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
-   Возвращает: {Hash}

Создает и возвращает объект `Hash`, который может быть использован для генерации хэш-дайджестов с помощью заданного `алгоритма`. Необязательный аргумент `options` управляет поведением потока. Для хэш-функций XOF, таких как `'shake256'`, опция `outputLength` может быть использована для указания желаемой длины выходного потока в байтах.

Параметр `algorithm` зависит от доступных алгоритмов, поддерживаемых версией OpenSSL на данной платформе. Примерами являются `sha256`, `sha512` и т. д. В последних выпусках OpenSSL команда `openssl list -digest-algorithms` отобразит доступные алгоритмы дайджеста.

Пример: генерация суммы sha256 для файла

```mjs
import { createReadStream } from 'node:fs';
import { argv } from 'node:process';
const { createHash } = await import('node:crypto');

const filename = argv[2];

const hash = createHash('sha256');

const input = createReadStream(filename);
input.on('readable', () => {
    // Only one element is going to be produced by the
    // hash stream.
    const data = input.read();
    if (data) hash.update(data);
    else {
        console.log(`${hash.digest('hex')} ${filename}`);
    }
});
```

```cjs
const { createReadStream } = require('node:fs');
const { createHash } = require('node:crypto');
const { argv } = require('node:process');

const filename = argv[2];

const hash = createHash('sha256');

const input = createReadStream(filename);
input.on('readable', () => {
    // Only one element is going to be produced by the
    // hash stream.
    const data = input.read();
    if (data) hash.update(data);
    else {
        console.log(`${hash.digest('hex')} ${filename}`);
    }
});
```

<!-- 0103.part.md -->

### `crypto.createHmac(algorithm, key[, options])`

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `key` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.transform` options](stream.md#new-streamtransformoptions)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, которую следует использовать, когда `ключ` является строкой.
-   Возвращает: {Hmac}

Создает и возвращает объект `Hmac`, который использует заданный `алгоритм` и `ключ`. Необязательный аргумент `options` управляет поведением потока.

Алгоритм зависит от доступных алгоритмов, поддерживаемых версией OpenSSL на данной платформе. Примеры: `'sha256'`, `'sha512'` и т. д. В последних версиях OpenSSL, `openssl list -digest-algorithms` отобразит доступные алгоритмы дайджеста.

Ключ - это ключ HMAC, используемый для генерации криптографического хэша HMAC. Если это [`KeyObject`](#class-keyobject), его тип должен быть `secret`.

Пример: генерация sha256 HMAC файла

```mjs
import { createReadStream } from 'node:fs';
import { argv } from 'node:process';
const { createHmac } = await import('node:crypto');

const filename = argv[2];

const hmac = createHmac('sha256', 'a secret');

const input = createReadStream(filename);
input.on('readable', () => {
    // Only one element is going to be produced by the
    // hash stream.
    const data = input.read();
    if (data) hmac.update(data);
    else {
        console.log(`${hmac.digest('hex')} ${filename}`);
    }
});
```

```cjs
const { createReadStream } = require('node:fs');
const { createHmac } = require('node:crypto');
const { argv } = require('node:process');

const filename = argv[2];

const hmac = createHmac('sha256', 'a secret');

const input = createReadStream(filename);
input.on('readable', () => {
    // Only one element is going to be produced by the
    // hash stream.
    const data = input.read();
    if (data) hmac.update(data);
    else {
        console.log(`${hmac.digest('hex')} ${filename}`);
    }
});
```

<!-- 0104.part.md -->

### `crypto.createPrivateKey(key)`

-   `key` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView}
    -   `key`: {string|ArrayBuffer|Buffer|TypedArray|DataView|Object} Материал ключа, либо в формате PEM, DER, либо JWK.
    -   `формат`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должен быть `pem`, `der` или `jwk`. **По умолчанию:** `'pem'`.
    -   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `'pkcs1'`, `'pkcs8'` или `'sec1'`. Этот параметр требуется, только если `формат` - `'der'` и игнорируется в противном случае.
    -   `passphrase`: {строка | буфер}. Парольная фраза, которую следует использовать для расшифровки.
    -   `encoding`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, которую следует использовать, когда `ключ` является строкой.
-   Возвращает: {KeyObject}

Создает и возвращает новый объект ключа, содержащий закрытый ключ. Если `key` является строкой или `Buffer`, `format` принимается равным `'pem'`; в противном случае `key` должен быть объектом со свойствами, описанными выше.

Если закрытый ключ зашифрован, необходимо указать `пассфразу`. Длина парольной фразы ограничена 1024 байтами.

<!-- 0105.part.md -->

### `crypto.createPublicKey(key)`

-   `key` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView}
    -   `key`: {string|ArrayBuffer|Buffer|TypedArray|DataView|Object} Материал ключа, либо в формате PEM, DER, либо JWK.
    -   `формат`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должен быть `'pem`, `'der` или `'jwk`. **По умолчанию:** `'pem'`.
    -   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `'pkcs1'` или `'spki'`. Этот параметр требуется только если `формат` - `'der'` и игнорируется в противном случае.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, которую следует использовать, когда `ключ` является строкой.
-   Возвращает: {KeyObject}

Создает и возвращает новый объект ключа, содержащий открытый ключ. Если `key` - строка или `Buffer`, `формат` принимается равным `'pem'`; если `key` - `KeyObject` с типом `'private'`, открытый ключ будет получен из данного закрытого ключа; в противном случае `key` должен быть объектом со свойствами, описанными выше.

Если формат `pem`, то `ключ` может также быть сертификатом X.509.

Поскольку открытые ключи могут быть получены из закрытых ключей, вместо открытого ключа может быть передан закрытый ключ. В этом случае эта функция ведет себя так же, как если бы была вызвана [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey), за исключением того, что тип возвращаемого `KeyObject` будет `'public'` и что закрытый ключ не может быть извлечен из возвращаемого `KeyObject`. Аналогично, если передан `KeyObject` с типом `'private'`, будет возвращен новый `KeyObject` с типом `'public'` и невозможно будет извлечь закрытый ключ из возвращенного объекта.

<!-- 0106.part.md -->

### `crypto.createSecretKey(key[, encoding])`

-   `key` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строки, когда `ключ` является строкой.
-   Возвращает: {KeyObject}

Создает и возвращает новый объект key, содержащий секретный ключ для симметричного шифрования или `Hmac`.

<!-- 0107.part.md -->

### `crypto.createSign(algorithm[, options])`

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.Writable` options](stream.md#new-streamwritableoptions)
-   Возвращает: {Sign}

Создает и возвращает объект `Sign`, использующий заданный `алгоритм`. Используйте [`crypto.getHashes()`](#cryptogethashes) для получения имен доступных алгоритмов дайджеста. Необязательный аргумент `options` управляет поведением `stream.Writable`.

В некоторых случаях экземпляр `Sign` может быть создан с использованием имени алгоритма подписи, например `'RSA-SHA256'`, вместо алгоритма дайджеста. В этом случае будет использоваться соответствующий алгоритм подписи. Это работает не для всех алгоритмов подписи, например, `'ecdsa-with-SHA256'`, поэтому лучше всегда использовать имена алгоритмов дайджеста.

<!-- 0108.part.md -->

### `crypto.createVerify(algorithm[, options])`

-   `алгоритм` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [`stream.Writable` options](stream.md#new-streamwritableoptions)
-   Возвращает: {Verify}

Создает и возвращает объект `Verify`, использующий заданный алгоритм. Используйте [`crypto.getHashes()`](#cryptogethashes) для получения массива имен доступных алгоритмов подписания. Необязательный аргумент `options` управляет поведением `stream.Writable`.

В некоторых случаях экземпляр `Verify` может быть создан с использованием имени алгоритма подписи, например `'RSA-SHA256'`, вместо алгоритма дайджеста. В этом случае будет использоваться соответствующий алгоритм. Это работает не для всех алгоритмов подписи, например, `'ecdsa-with-SHA256'`, поэтому лучше всегда использовать имена алгоритмов дайджеста.

<!-- 0109.part.md -->

### `crypto.diffieHellman(options)`

-   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `privateKey`: {KeyObject}
    -   `publicKey`: {KeyObject}
-   Возвращает: [`<Buffer>`](buffer.md#buffer)

Вычисляет секрет Диффи-Хеллмана на основе `privateKey` и `publicKey`. Оба ключа должны иметь одинаковый `asymmetricKeyType`, который должен быть одним из `'dh'` (для Diffie-Hellman), `'ec'` (для ECDH), `'x448'` или `'x25519'` (для ECDH-ES).

<!-- 0110.part.md -->

### `crypto.generateKey(type, options, callback)`

-   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Предполагаемое использование сгенерированного секретного ключа. В настоящее время принимаются значения `'hmac'` и `'aes'`.
    -   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `length`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина бита генерируемого ключа. Это должно быть значение больше 0.
            -   Если `type` имеет значение `'hmac'`, минимальная длина равна 8, а максимальная - 2<sup>31</sup>-1. Если значение не кратно 8, сгенерированный ключ будет усечен до `Math.floor(length / 8)`.
            -   Если `type` - `'aes`, длина должна быть одной из `128`, `192` или `256`.
    -   `callback`: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
        -   `err`: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
        -   `key`: {KeyObject}

Асинхронно генерирует новый случайный секретный ключ заданной `длины`. Тип `type` определяет, какие проверки будут выполняться для `длины`.

```mjs
const { generateKey } = await import('node:crypto');

generateKey('hmac', { length: 64 }, (err, key) => {
    if (err) throw err;
    console.log(key.export().toString('hex')); // 46e..........620
});
```

```cjs
const { generateKey } = require('node:crypto');

generateKey('hmac', { length: 64 }, (err, key) => {
    if (err) throw err;
    console.log(key.export().toString('hex')); // 46e..........620
});
```

<!-- 0111.part.md -->

### `crypto.generateKeyPair(type, options, callback)`.

-   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `rsa`, `rsa-pss`, `dsa`, `ec`, `ed25519`, `ed448`, `x25519`, `x448` или `dh`.
-   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `modulusLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер ключа в битах (RSA, DSA).
    -   `publicExponent`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Публичная экспонента (RSA). **По умолчанию:** `0x10001`.
    -   `hashAlgorithm`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя дайджеста сообщения (RSA-PSS).
    -   `mgf1HashAlgorithm`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя дайджеста сообщения, используемого MGF1 (RSA-PSS).
    -   `saltLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальная длина соли в байтах (RSA-PSS).
    -   `divisorLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер `q` в битах (DSA).
    -   `namedCurve`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя кривой, которую следует использовать (EC).
    -   `prime`: [`<Buffer>`](buffer.md#buffer) Параметр prime (DH).
    -   `primeLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина прайма в битах (DH).
    -   `generator`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Пользовательский генератор (DH). **По умолчанию:** `2`.
    -   `groupName`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя группы Диффи-Хеллмана (DH). См. [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).
    -   `paramEncoding`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `именованным` или `явным` (EC). **По умолчанию:** `'named'`.
    -   `publicKeyEncoding`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`keyObject.export()`](#keyobjectexportoptions).
    -   `privateKeyEncoding`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`keyObject.export()`](#keyobjectexportoptions).
-   `callback`: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err`: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `publicKey`: {string | Buffer | KeyObject}
    -   `privateKey`: {string | Buffer | KeyObject}.

Генерирует новую пару асимметричных ключей заданного `типа`. В настоящее время поддерживаются RSA, RSA-PSS, DSA, EC, Ed25519, Ed448, X25519, X448 и DH.

Если было указано `publicKeyEncoding` или `privateKeyEncoding`, эта функция ведет себя так, как если бы для ее результата был вызван [`keyObject.export()`](#keyobjectexportoptions). В противном случае соответствующая часть ключа возвращается как [`KeyObject`](#class-keyobject).

Рекомендуется кодировать открытые ключи как `'spki'` и закрытые ключи как `'pkcs8'` с шифрованием для длительного хранения:

```mjs
const { generateKeyPair } = await import('node:crypto');

generateKeyPair(
    'rsa',
    {
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
    },
    (err, publicKey, privateKey) => {
        // Handle errors and use the generated key pair.
    }
);
```

```cjs
const { generateKeyPair } = require('node:crypto');

generateKeyPair(
    'rsa',
    {
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
    },
    (err, publicKey, privateKey) => {
        // Handle errors and use the generated key pair.
    }
);
```

По завершении будет вызван `callback` с `err`, установленным в `undefined` и `publicKey` / `privateKey`, представляющими сгенерированную пару ключей.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal) версия, он возвращает `Promise` для `Object` со свойствами `publicKey` и `privateKey`.

<!-- 0112.part.md -->

### `crypto.generateKeyPairSync(type, options)`

-   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `'rsa`, `'rsa-pss`, `'dsa`, `'ec`, `'ed25519`, `'ed448`, `'x25519`, `'x448` или `'dh`.
-   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `modulusLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер ключа в битах (RSA, DSA).
    -   `publicExponent`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Публичная экспонента (RSA). **По умолчанию:** `0x10001`.
    -   `hashAlgorithm`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя дайджеста сообщения (RSA-PSS).
    -   `mgf1HashAlgorithm`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя дайджеста сообщения, используемого MGF1 (RSA-PSS).
    -   `saltLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальная длина соли в байтах (RSA-PSS).
    -   `divisorLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер `q` в битах (DSA).
    -   `namedCurve`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя кривой, которую следует использовать (EC).
    -   `prime`: [`<Buffer>`](buffer.md#buffer) Параметр prime (DH).
    -   `primeLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина прайма в битах (DH).
    -   `generator`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Пользовательский генератор (DH). **По умолчанию:** `2`.
    -   `groupName`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя группы Диффи-Хеллмана (DH). См. [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).
    -   `paramEncoding`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Должно быть `именованным` или `явным` (EC). **По умолчанию:** `'named'`.
    -   `publicKeyEncoding`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`keyObject.export()`](#keyobjectexportoptions).
    -   `privateKeyEncoding`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`keyObject.export()`](#keyobjectexportoptions).
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `publicKey`: {string | Buffer | KeyObject}
    -   `privateKey`: {string | Buffer | KeyObject}.

Генерирует новую пару асимметричных ключей заданного `типа`. В настоящее время поддерживаются RSA, RSA-PSS, DSA, EC, Ed25519, Ed448, X25519, X448 и DH.

Если было указано `publicKeyEncoding` или `privateKeyEncoding`, эта функция ведет себя так, как если бы для ее результата был вызван [`keyObject.export()`](#keyobjectexportoptions). В противном случае соответствующая часть ключа возвращается как [`KeyObject`](#class-keyobject).

При кодировании открытых ключей рекомендуется использовать `'spki'`. При кодировании закрытых ключей рекомендуется использовать `'pkcs8'` с сильной парольной фразой и хранить парольную фразу в тайне.

```mjs
const { generateKeyPairSync } = await import('node:crypto');

const { publicKey, privateKey } = generateKeyPairSync(
    'rsa',
    {
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
    }
);
```

```cjs
const { generateKeyPairSync } = require('node:crypto');

const { publicKey, privateKey } = generateKeyPairSync(
    'rsa',
    {
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
    }
);
```

Возвращаемое значение `{ publicKey, privateKey }` представляет собой сгенерированную пару ключей. Если выбрана кодировка PEM, то соответствующий ключ будет строкой, в противном случае это будет буфер, содержащий данные, закодированные в формате DER.

<!-- 0113.part.md -->

### `crypto.generateKeySync(type, options)`

-   `type`: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Предполагаемое использование сгенерированного секретного ключа. В настоящее время принимаются значения `'hmac'` и `'aes'`.
    -   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `length`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина бита генерируемого ключа.
            -   Если `type` - `'hmac'`, минимальная длина равна 8, а максимальная - 2<sup>31</sup>-1. Если значение не кратно 8, сгенерированный ключ будет усечен до `Math.floor(length / 8)`.
            -   Если `type` - `aes`, длина должна быть одной из `128`, `192` или `256`.
    -   Возвращает: {KeyObject}

Синхронно генерирует новый случайный секретный ключ заданной `длины`. Тип `type` определяет, какие проверки будут выполняться для `длины`.

```mjs
const { generateKeySync } = await import('node:crypto');

const key = generateKeySync('hmac', { length: 64 });
console.log(key.export().toString('hex')); // e89..........41e
```

```cjs
const { generateKeySync } = require('node:crypto');

const key = generateKeySync('hmac', { length: 64 });
console.log(key.export().toString('hex')); // e89..........41e
```

<!-- 0114.part.md -->

### `crypto.generatePrime(size[, options[, callback]])`

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер (в битах) простого числа для генерации.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `add` {ArrayBuffer|SharedArrayBuffer|TypedArray|Buffer|DataView|bigint}
    -   `rem` {ArrayBuffer|SharedArrayBuffer|TypedArray|Buffer|DataView|bigint}
    -   `safe` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сгенерированный прайм возвращается в виде `bigint`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `prime` {ArrayBuffer|bigint}

Генерирует псевдослучайное простое число размером `size` бит.

Если `options.safe` равно `true`, то прайм будет безопасным праймом - то есть `(прайм - 1) / 2` также будет праймом.

Параметры `options.add` и `options.rem` могут быть использованы для обеспечения дополнительных требований, например, для Диффи-Хеллмана:

-   Если `options.add` и `options.rem` оба заданы, то прайм будет удовлетворять условию, что `prime % add = rem`.
-   Если установлено только `options.add` и `options.safe` не `true`, то прайм будет удовлетворять условию, что `prime % add = 1`.
-   Если задано только `options.add` и `options.safe` имеет значение `true`, то вместо этого прайм будет удовлетворять условию, что `prime % add = 3`. Это необходимо, поскольку `prime % add = 1` для `options.add > 2` противоречит условию, навязанному `options.safe`.
-   `options.rem` игнорируется, если `options.add` не указан.

И `options.add`, и `options.rem` должны быть закодированы как big-endian последовательности, если они заданы как `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer` или `DataView`.

По умолчанию прайм кодируется как big-endian последовательность октетов в [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Если опция `bigint` имеет значение `true`, то предоставляется [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

<!-- 0115.part.md -->

### `crypto.generatePrimeSync(size[, options])`

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер (в битах) генерируемого прайма.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `add` {ArrayBuffer|SharedArrayBuffer|TypedArray|Buffer|DataView|bigint}
    -   `rem` {ArrayBuffer|SharedArrayBuffer|TypedArray|Buffer|DataView|bigint}
    -   `safe` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`.
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сгенерированный прайм возвращается в виде `bigint`.
-   Возвращает: {ArrayBuffer|bigint}

Генерирует псевдослучайное простое число размером `size` бит.

Если `options.safe` равно `true`, то прайм будет безопасным праймом - то есть, `(прайм - 1) / 2` также будет праймом.

Параметры `options.add` и `options.rem` могут быть использованы для обеспечения дополнительных требований, например, для Диффи-Хеллмана:

-   Если `options.add` и `options.rem` оба заданы, то прайм будет удовлетворять условию, что `prime % add = rem`.
-   Если установлено только `options.add` и `options.safe` не `true`, то прайм будет удовлетворять условию, что `prime % add = 1`.
-   Если задано только `options.add` и `options.safe` имеет значение `true`, то вместо этого прайм будет удовлетворять условию, что `prime % add = 3`. Это необходимо, поскольку `prime % add = 1` для `options.add > 2` противоречит условию, навязанному `options.safe`.
-   `options.rem` игнорируется, если `options.add` не указан.

И `options.add`, и `options.rem` должны быть закодированы как big-endian последовательности, если они заданы как `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer` или `DataView`.

По умолчанию прайм кодируется как big-endian последовательность октетов в [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Если опция `bigint` имеет значение `true`, то предоставляется [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt).

<!-- 0116.part.md -->

### `crypto.getCipherInfo(nameOrNid[, options])`

-   `nameOrNid`: {string|number} Имя или nid шифра для запроса.
-   `options`: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `keyLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина тестового ключа.
    -   `ivLength`: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тестовая длина IV.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя шифра
    -   `nid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) nid шифра
    -   `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер блока шифра в байтах. Это свойство опускается, если `mode` имеет значение `'stream'`.
    -   `ivLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидаемая или стандартная длина вектора инициализации в байтах. Это свойство опускается, если шифр не использует вектор инициализации.
    -   `keyLength` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидаемая длина ключа или длина ключа по умолчанию в байтах.
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Режим шифра. Один из `'cbc'`, `'ccm'`, `'cfb'`, `'ctr'`, `'ecb'`, `'gcm'`, `'ocb'`, `'ofb'`, `'stream'`, `'wrap'`, `'xts'`.

Возвращает информацию о заданном шифре.

Некоторые шифры принимают ключи переменной длины и векторы инициализации. По умолчанию метод `crypto.getCipherInfo()` возвращает значения по умолчанию для этих шифров. Чтобы проверить, приемлема ли заданная длина ключа или длина iv для данного шифра, используйте опции `keyLength` и `ivLength`. Если заданные значения неприемлемы, будет возвращено значение `undefined`.

<!-- 0117.part.md -->

### `crypto.getCiphers()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив с именами поддерживаемых алгоритмов шифрования.

<!-- конец списка -->

```mjs
const { getCiphers } = await import('node:crypto');

console.log(getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
```

```cjs
const { getCiphers } = require('node:crypto');

console.log(getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
```

<!-- 0118.part.md -->

### `crypto.getCurves()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив с именами поддерживаемых эллиптических кривых.

<!-- конец списка -->

```mjs
const { getCurves } = await import('node:crypto');

console.log(getCurves()); // ['Oakley-EC2N-3', 'Oakley-EC2N-4', ...]
```

```cjs
const { getCurves } = require('node:crypto');

console.log(getCurves()); // ['Oakley-EC2N-3', 'Oakley-EC2N-4', ...]
```

<!-- 0119.part.md -->

### `crypto.getDiffieHellman(groupName)`

-   `groupName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {DiffieHellmanGroup}

Создает предопределенный объект обмена ключами `DiffieHellmanGroup`. Поддерживаемые группы перечислены в документации по [`DiffieHellmanGroup`](#class-diffiehellmangroup).

Возвращаемый объект имитирует интерфейс объектов, создаваемых [`crypto.createDiffieHellman()`](#cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding), но не позволяет изменять ключи (например, с помощью [`diffieHellman.setPublicKey()`](#diffiehellmansetpublickeypublickey-encoding)). Преимущество использования этого метода в том, что сторонам не нужно предварительно генерировать групповой модуль и обмениваться им, что экономит процессорное и коммуникационное время.

Пример (получение общего секрета):

```mjs
const { getDiffieHellman } = await import('node:crypto');
const alice = getDiffieHellman('modp14');
const bob = getDiffieHellman('modp14');

alice.generateKeys();
bob.generateKeys();

const aliceSecret = alice.computeSecret(
    bob.getPublicKey(),
    null,
    'hex'
);
const bobSecret = bob.computeSecret(
    alice.getPublicKey(),
    null,
    'hex'
);

/* aliceSecret и bobSecret должны быть одинаковыми */
console.log(aliceSecret === bobSecret);
```

```cjs
const { getDiffieHellman } = require('node:crypto');

const alice = getDiffieHellman('modp14');
const bob = getDiffieHellman('modp14');

alice.generateKeys();
bob.generateKeys();

const aliceSecret = alice.computeSecret(
    bob.getPublicKey(),
    null,
    'hex'
);
const bobSecret = bob.computeSecret(
    alice.getPublicKey(),
    null,
    'hex'
);

/* aliceSecret и bobSecret должны быть одинаковыми */
console.log(aliceSecret === bobSecret);
```

<!-- 0120.part.md -->

### `crypto.getFips()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `1`, если и только если в настоящее время используется FIPS-совместимый криптопровайдер, `0` в противном случае. В будущем выпуске semver-major тип возврата этого API может быть изменен на [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

<!-- 0121.part.md -->

### `crypto.getHashes()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив имен поддерживаемых алгоритмов хэширования, например, `'RSA-SHA256'`. Хеш-алгоритмы также называют алгоритмами "дайджеста".

<!-- конец списка -->

```mjs
const { getHashes } = await import('node:crypto');

console.log(getHashes()); // ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
```

```cjs
const { getHashes } = require('node:crypto');

console.log(getHashes()); // ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
```

<!-- 0122.part.md -->

### `crypto.getRandomValues(typedArray)`

-   `typedArray` {Buffer|TypedArray|DataView|ArrayBuffer}
-   Возвращает: {Buffer|TypedArray|DataView|ArrayBuffer} Возвращает `typedArray`.

Удобный псевдоним для [`crypto.webcrypto.getRandomValues()`](webcrypto.md#cryptogetrandomvaluestypedarray). Эта реализация не соответствует спецификации Web Crypto, для написания веб-совместимого кода используйте [`crypto.webcrypto.getRandomValues()`](webcrypto.md#cryptogetrandomvaluestypedarray).

<!-- 0123.part.md -->

### `crypto.hkdf(digest, ikm, salt, info, keylen, callback)`

-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используемый алгоритм дайджеста.
-   `ikm` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject} Входной ключевой материал. Должен быть указан, но может иметь нулевую длину.
-   `salt` {string|ArrayBuffer|Buffer|TypedArray|DataView} Значение соли. Должно быть указано, но может иметь нулевую длину.
-   `info` {string|ArrayBuffer|Buffer|TypedArray|DataView} Дополнительное информационное значение. Должно быть указано, но может иметь нулевую длину и не может быть больше 1024 байт.
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина генерируемого ключа. Должна быть больше 0. Максимально допустимое значение равно `255`, умноженное на количество байт, выдаваемых выбранной функцией дайджеста (например, `sha512` генерирует 64-байтовые хэши, что делает максимальный выход HKDF 16320 байт).
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `derivedKey` [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

HKDF - это простая функция выведения ключей, определенная в RFC 5869. Заданные `ikm`, `salt` и `info` используются вместе с `digest` для получения ключа длиной `keylen` байт.

Поставленная функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. Если при выведении ключа произошла ошибка, будет установлено значение `err`, в противном случае `err` будет равно `null`. Успешно сгенерированный `derivedKey` будет передан в обратный вызов как [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Если какой-либо из входных аргументов содержит недопустимые значения или типы, будет выдана ошибка.

```mjs
import { Buffer } from 'node:buffer';
const { hkdf } = await import('node:crypto');

hkdf(
    'sha512',
    'key',
    'salt',
    'info',
    64,
    (err, derivedKey) => {
        if (err) throw err;
        console.log(
            Buffer.from(derivedKey).toString('hex')
        ); // '24156e2...5391653'
    }
);
```

```cjs
const { hkdf } = require('node:crypto');
const { Buffer } = require('node:buffer');

hkdf(
    'sha512',
    'key',
    'salt',
    'info',
    64,
    (err, derivedKey) => {
        if (err) throw err;
        console.log(
            Buffer.from(derivedKey).toString('hex')
        ); // '24156e2...5391653'
    }
);
```

<!-- 0124.part.md -->

### `crypto.hkdfSync(digest, ikm, salt, info, keylen)`

-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Используемый алгоритм дайджеста.
-   `ikm` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject} Входной ключевой материал. Должен быть указан, но может иметь нулевую длину.
-   `salt` {string|ArrayBuffer|Buffer|TypedArray|DataView} Значение соли. Должно быть указано, но может иметь нулевую длину.
-   `info` {string|ArrayBuffer|Buffer|TypedArray|DataView} Дополнительное информационное значение. Должно быть указано, но может иметь нулевую длину и не может быть больше 1024 байт.
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина генерируемого ключа. Должна быть больше 0. Максимально допустимое значение равно `255`, умноженное на количество байт, генерируемых выбранной функцией дайджеста (например, `sha512` генерирует 64-байтовые хэши, что делает максимальный выход HKDF 16320 байт).
-   Возвращает: [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Предоставляет синхронную функцию выведения ключей HKDF, как определено в RFC 5869. Заданные `ikm`, `salt` и `info` используются вместе с `digest` для получения ключа длиной `keylen` байт.

Успешно сгенерированный `derivedKey` будет возвращен в виде [`<ArrayBuffer>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).

Если в качестве входных аргументов указаны недопустимые значения или типы, или если производный ключ не может быть сгенерирован, будет выдана ошибка.

```mjs
import { Buffer } from 'node:buffer';
const { hkdfSync } = await import('node:crypto');

const derivedKey = hkdfSync(
    'sha512',
    'key',
    'salt',
    'info',
    64
);
console.log(Buffer.from(derivedKey).toString('hex')); // '24156e2...5391653'
```

```cjs
const { hkdfSync } = require('node:crypto');
const { Buffer } = require('node:buffer');

const derivedKey = hkdfSync(
    'sha512',
    'key',
    'salt',
    'info',
    64
);
console.log(Buffer.from(derivedKey).toString('hex')); // '24156e2...5391653'
```

<!-- 0125.part.md -->

### `crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)`

-   `password` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `соль` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `iterations` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` {ошибка}
    -   `derivedKey` [`<Buffer>`](buffer.md#buffer)

Обеспечивает асинхронную реализацию Password-Based Key Derivation Function 2 (PBKDF2). Выбранный алгоритм дайджеста HMAC, указанный в `digest`, применяется для получения ключа требуемой длины байта (`keylen`) из `password`, `alt` и `iterations`.

Поставленная функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. Если при создании ключа произошла ошибка, то `err` будет установлен; в противном случае `err` будет равен `null`. По умолчанию успешно сгенерированный `derivedKey` будет передан обратному вызову как [`Buffer`](buffer.md). Если в любом из входных аргументов указаны недопустимые значения или типы, будет выдана ошибка.

Аргумент `iterations` должен быть числом, установленным как можно выше. Чем больше число итераций, тем надежнее будет производный ключ, но на выполнение потребуется больше времени.

Соль" должна быть настолько уникальной, насколько это возможно. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt`, пожалуйста, учитывайте [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

```mjs
const { pbkdf2 } = await import('node:crypto');

pbkdf2(
    'secret',
    'salt',
    100000,
    64,
    'sha512',
    (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey.toString('hex')); // '3745e48...08d59ae'
    }
);
```

```cjs
const { pbkdf2 } = require('node:crypto');

pbkdf2(
    'secret',
    'salt',
    100000,
    64,
    'sha512',
    (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey.toString('hex')); // '3745e48...08d59ae'
    }
);
```

Свойство `crypto.DEFAULT_ENCODING` можно использовать для изменения способа передачи `derivedKey` в обратный вызов. Однако это свойство было устаревшим, и его использования следует избегать.

```mjs
import crypto from 'node:crypto';
crypto.DEFAULT_ENCODING = 'hex';
crypto.pbkdf2(
    'secret',
    'salt',
    100000,
    512,
    'sha512',
    (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey); // '3745e48...aa39b34'
    }
);
```

```cjs
const crypto = require('node:crypto');
crypto.DEFAULT_ENCODING = 'hex';
crypto.pbkdf2(
    'secret',
    'salt',
    100000,
    512,
    'sha512',
    (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey); // '3745e48...aa39b34'
    }
);
```

Массив поддерживаемых дайджест-функций можно получить с помощью [`crypto.getHashes()`](#cryptogethashes).

Этот API использует пул потоков libuv, что может иметь неожиданные и негативные последствия для производительности некоторых приложений; смотрите документацию [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) для получения дополнительной информации.

<!-- 0126.part.md -->

### `crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)`

-   `пароль` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `соль` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `iterations` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `digest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<Buffer>`](buffer.md#buffer)

Предоставляет синхронную реализацию Password-Based Key Derivation Function 2 (PBKDF2). Выбранный алгоритм дайджеста HMAC, указанный в `digest`, применяется для получения ключа запрашиваемой длины байта (`keylen`) из `password`, `alt` и `iterations`.

Если произойдет ошибка, будет выдано сообщение `Error`, в противном случае полученный ключ будет возвращен в виде [`буфера`](buffer.md).

Аргумент `iterations` должен быть числом, установленным как можно выше. Чем больше число итераций, тем надежнее будет полученный ключ, но на это потребуется больше времени.

Соль" должна быть настолько уникальной, насколько это возможно. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt`, пожалуйста, учитывайте [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

```mjs
const { pbkdf2Sync } = await import('node:crypto');

const key = pbkdf2Sync(
    'secret',
    'salt',
    100000,
    64,
    'sha512'
);
console.log(key.toString('hex')); // '3745e48...08d59ae'
```

```cjs
const { pbkdf2Sync } = require('node:crypto');

const key = pbkdf2Sync(
    'secret',
    'salt',
    100000,
    64,
    'sha512'
);
console.log(key.toString('hex')); // '3745e48...08d59ae'
```

Свойство `crypto.DEFAULT_ENCODING` можно использовать для изменения способа возврата `derivedKey`. Однако это свойство устарело, и его использования следует избегать.

```mjs
import crypto from 'node:crypto';
crypto.DEFAULT_ENCODING = 'hex';
const key = crypto.pbkdf2Sync(
    'secret',
    'salt',
    100000,
    512,
    'sha512'
);
console.log(key); // '3745e48...aa39b34'
```

```cjs
const crypto = require('node:crypto');
crypto.DEFAULT_ENCODING = 'hex';
const key = crypto.pbkdf2Sync(
    'secret',
    'salt',
    100000,
    512,
    'sha512'
);
console.log(key); // '3745e48...aa39b34'
```

Массив поддерживаемых функций дайджеста можно получить с помощью [`crypto.getHashes()`](#cryptogethashes).

<!-- 0127.part.md -->

### `crypto.privateDecrypt(privateKey, buffer)`

-   `privateKey` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
    -   `oaepHash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хэш-функция, используемая для OAEP padding и MGF1. **По умолчанию:** `'sha1'`.
    -   `oaepLabel` {string|ArrayBuffer|Buffer|TypedArray|DataView} Метка, которую следует использовать для OAEP-подкладки. Если не указано, метка не используется.
    -   `padding` {crypto.constants} Необязательное значение набивки, определенное в `crypto.constants`, которое может быть: `crypto.constants.RSA_NO_PADDING`, `crypto.constants.RSA_PKCS1_PADDING` или `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
-   `buffer` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `буфер` с расшифрованным содержимым.

Расшифровывает `buffer` с помощью `privateKey`. `Буфер` был ранее зашифрован с помощью соответствующего открытого ключа, например, с помощью [`crypto.publicEncrypt()`](#cryptopublicencryptkey-buffer).

Если `privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykeykey). Если это объект, может быть передано свойство `padding`. В противном случае эта функция использует `RSA_PKCS1_OAEP_PADDING`.

<!-- 0128.part.md -->

### `crypto.privateEncrypt(privateKey, buffer)`

-   `privateKey` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
    -   `key` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey} Закрытый ключ в кодировке PEM.
    -   `passphrase` {string|ArrayBuffer|Buffer|TypedArray|DataView} Необязательная ключевая фраза для закрытого ключа.
    -   `padding` {crypto.constants} Необязательное значение прокладки, определенное в `crypto.constants`, которое может быть: `crypto.constants.RSA_NO_PADDING` или `crypto.constants.RSA_PKCS1_PADDING`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, которую следует использовать, когда `буфер`, `ключ` или `пассфраза` являются строками.
-   `buffer` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `буфер` с зашифрованным содержимым.

Шифрует `buffer` с помощью `privateKey`. Возвращенные данные можно расшифровать с помощью соответствующего открытого ключа, например, используя [`crypto.publicDecrypt()`](#cryptopublicdecryptkey-buffer).

Если `privateKey` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `privateKey` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykeykey). Если это объект, может быть передано свойство `padding`. В противном случае эта функция использует `RSA_PKCS1_PADDING`.

<!-- 0129.part.md -->

### `crypto.publicDecrypt(key, buffer)`

-   `ключ` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
    -   `passphrase` {string|ArrayBuffer|Buffer|TypedArray|DataView} Необязательная ключевая фраза для закрытого ключа.
    -   `padding` {crypto.constants} Необязательное значение прокладки, определенное в `crypto.constants`, которое может быть: `crypto.constants.RSA_NO_PADDING` или `crypto.constants.RSA_PKCS1_PADDING`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, которую следует использовать, когда `буфер`, `ключ` или `пассфраза` являются строками.
-   `buffer` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `буфер` с расшифрованным содержимым.

Расшифровывает `buffer` с помощью `key`.`buffer` был ранее зашифрован с помощью соответствующего закрытого ключа, например, с помощью [`crypto.privateEncrypt()`](#cryptoprivateencryptprivatekey-buffer).

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, может быть передано свойство `padding`. В противном случае эта функция использует `RSA_PKCS1_PADDING`.

Поскольку открытые ключи RSA могут быть получены из закрытых ключей, вместо открытого ключа может быть передан закрытый ключ.

<!-- 0130.part.md -->

### `crypto.publicEncrypt(key, buffer)`

-   `key` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
    -   `ключ` {string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey} Открытый или закрытый ключ в кодировке PEM, {KeyObject} или {CryptoKey}.
    -   `oaepHash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хэш-функция, используемая для OAEP padding и MGF1. **По умолчанию:** `'sha1'`.
    -   `oaepLabel` {string|ArrayBuffer|Buffer|TypedArray|DataView} Метка, которую следует использовать для OAEP-подкладки. Если не указано, метка не используется.
    -   `passphrase` {string|ArrayBuffer|Buffer|TypedArray|DataView} Необязательная ключевая фраза для закрытого ключа.
    -   `padding` {crypto.constants} Необязательное значение прокладки, определенное в `crypto.constants`, которое может быть: `crypto.constants.RSA_NO_PADDING`, `crypto.constants.RSA_PKCS1_PADDING` или `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковая кодировка, которую следует использовать, когда `буфер`, `ключ`, `oaepLabel` или `passphrase` являются строками.
-   `buffer` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   Возвращает: [`<Buffer>`](buffer.md#buffer) Новый `буфер` с зашифрованным содержимым.

Шифрует содержимое `buffer` с помощью `key` и возвращает новый [`Buffer`](buffer.md) с зашифрованным содержимым. Возвращенные данные можно расшифровать с помощью соответствующего закрытого ключа, например, используя [`crypto.privateDecrypt()`](#cryptoprivatedecryptprivatekey-buffer).

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, может быть передано свойство `padding`. В противном случае эта функция использует `RSA_PKCS1_OAEP_PADDING`.

Поскольку открытые ключи RSA могут быть получены из закрытых ключей, вместо открытого ключа может быть передан закрытый ключ.

<!-- 0131.part.md -->

### `crypto.randomBytes(size[, callback])`

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт для генерации. `size` не должно быть больше, чем `2**31 - 1`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `buf` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer), если функция `callback` не предоставлена.

Генерирует криптографически сильные псевдослучайные данные. Аргумент `size` представляет собой число, указывающее количество байт для генерации.

Если указана функция `callback`, байты генерируются асинхронно, а функция `callback` вызывается с двумя аргументами: `err` и `buf`. Если произошла ошибка, то `err` будет объектом `Error`, в противном случае - `null`. Аргумент `buf` представляет собой [`буфер`](buffer.md), содержащий сгенерированные байты.

```mjs
// Асинхронный
const { randomBytes } = await import('node:crypto');

randomBytes(256, (err, buf) => {
    if (err) throw err;
    console.log(
        `${
            buf.length
        } байт случайных данных: ${buf.toString('hex')}`
    );
});
```

```cjs
// Асинхронный
const { randomBytes } = require('node:crypto');

randomBytes(256, (err, buf) => {
    if (err) throw err;
    console.log(
        `${
            buf.length
        } байт случайных данных: ${buf.toString('hex')}`
    );
});
```

Если функция `callback` не указана, случайные байты генерируются синхронно и возвращаются в виде [`буфера`](buffer.md). При возникновении проблем с генерацией байтов будет выдана ошибка.

```mjs
// Синхронный
const {
  randomBytes,
} = await import('node:crypto');


const buf = randomBytes(256);
console.log(
  ``${buf.length} байт случайных данных: ${buf.toString('hex')}``);
```

```cjs
// Синхронный
const {
  randomBytes,
} = require('node:crypto');


const buf = randomBytes(256);
console.log(
  ``${buf.length} байт случайных данных: ${buf.toString('hex')}``);
```

Метод `crypto.randomBytes()` не завершится, пока не будет получено достаточное количество энтропии. Обычно это не должно занимать более нескольких миллисекунд. Единственное время, когда генерация случайных байтов может блокироваться на более длительный период времени, это сразу после загрузки, когда вся система еще не имеет достаточного количества энтропии.

Этот API использует пул потоков libuv, что может иметь неожиданные и негативные последствия для производительности некоторых приложений; смотрите документацию [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) для получения дополнительной информации.

Асинхронная версия `crypto.randomBytes()` выполняется за один запрос к пулу потоков. Чтобы минимизировать изменение длины задачи пула потоков, разделяйте большие запросы `randomBytes`, когда это делается в рамках выполнения запроса клиента.

<!-- 0132.part.md -->

### `crypto.randomFillSync(buffer[, offset][, size])`

-   `buffer` {ArrayBuffer|Buffer|TypedArray|DataView} Должен быть предоставлен. Размер предоставляемого `буфера` не должен быть больше, чем `2**31 - 1`.
-   `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.length - offset`. `size` не должен быть больше, чем `2**31 - 1`.
-   Возвращает: {ArrayBuffer|Buffer|TypedArray|DataView} Объект, переданный в качестве аргумента `buffer`.

Синхронная версия [`crypto.randomFill()`](#cryptorandomfillbuffer-offset-size-callback).

```mjs
import { Buffer } from 'node:buffer';
const { randomFillSync } = await import('node:crypto');

const buf = Buffer.alloc(10);
console.log(randomFillSync(buf).toString('hex'));

randomFillSync(buf, 5);
console.log(buf.toString('hex'));

// Вышеприведенное эквивалентно следующему:
randomFillSync(buf, 5, 5);
console.log(buf.toString('hex'));
```

```cjs
const { randomFillSync } = require('node:crypto');
const { Buffer } = require('node:buffer');

const buf = Buffer.alloc(10);
console.log(randomFillSync(buf).toString('hex'));

randomFillSync(buf, 5);
console.log(buf.toString('hex'));

// Вышеприведенное эквивалентно следующему:
randomFillSync(buf, 5, 5);
console.log(buf.toString('hex'));
```

В качестве `буфера` может быть передан любой экземпляр `ArrayBuffer`, `TypedArray` или `DataView`.

```mjs
import { Buffer } from 'node:buffer';
const { randomFillSync } = await import('node:crypto');

const a = new Uint32Array(10);
console.log(
    Buffer.from(
        randomFillSync(a).buffer,
        a.byteOffset,
        a.byteLength
    ).toString('hex')
);

const b = new DataView(new ArrayBuffer(10));
console.log(
    Buffer.from(
        randomFillSync(b).buffer,
        b.byteOffset,
        b.byteLength
    ).toString('hex')
);

const c = new ArrayBuffer(10);
console.log(Buffer.from(randomFillSync(c)).toString('hex'));
```

```cjs
const { randomFillSync } = require('node:crypto');
const { Buffer } = require('node:buffer');

const a = new Uint32Array(10);
console.log(
    Buffer.from(
        randomFillSync(a).buffer,
        a.byteOffset,
        a.byteLength
    ).toString('hex')
);

const b = new DataView(new ArrayBuffer(10));
console.log(
    Buffer.from(
        randomFillSync(b).buffer,
        b.byteOffset,
        b.byteLength
    ).toString('hex')
);

const c = new ArrayBuffer(10);
console.log(Buffer.from(randomFillSync(c)).toString('hex'));
```

<!-- 0133.part.md -->

### `crypto.randomFill(buffer[, offset][, size], callback)`

-   `buffer` {ArrayBuffer|Buffer|TypedArray|DataView} Должен быть предоставлен. Размер предоставляемого `буфера` не должен быть больше, чем `2**31 - 1`.
-   `offset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.length - offset`. `size` не должно быть больше, чем `2**31 - 1`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `function(err, buf) {}`.

Эта функция аналогична [`crypto.randomBytes()`](#cryptorandombytessize-callback), но требует, чтобы первым аргументом был [`буфер`](buffer.md), который будет заполнен. Она также требует, чтобы был передан обратный вызов.

Если функция `callback` не передана, будет выдана ошибка.

```mjs
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

// Вышеприведенное эквивалентно следующему:
randomFill(buf, 5, 5, (err, buf) => {
    if (err) throw err;
    console.log(buf.toString('hex'));
});
```

```cjs
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

// Вышеприведенное эквивалентно следующему:
randomFill(buf, 5, 5, (err, buf) => {
    if (err) throw err;
    console.log(buf.toString('hex'));
});
```

Любой экземпляр `ArrayBuffer`, `TypedArray` или `DataView` может быть передан в качестве `buffer`.

Хотя сюда входят экземпляры `Float32Array` и `Float64Array`, эта функция не должна использоваться для генерации случайных чисел с плавающей точкой. Результат может содержать `+Infinity`, `-Infinity` и `NaN`, и даже если массив содержит только конечные числа, они не взяты из равномерного случайного распределения и не имеют значимых нижних или верхних границ.

```mjs
import { Buffer } from 'node:buffer';
const { randomFill } = await import('node:crypto');

const a = new Uint32Array(10);
randomFill(a, (err, buf) => {
    if (err) throw err;
    console.log(
        Buffer.from(
            buf.buffer,
            buf.byteOffset,
            buf.byteLength
        ).toString('hex')
    );
});

const b = new DataView(new ArrayBuffer(10));
randomFill(b, (err, buf) => {
    if (err) throw err;
    console.log(
        Buffer.from(
            buf.buffer,
            buf.byteOffset,
            buf.byteLength
        ).toString('hex')
    );
});

const c = new ArrayBuffer(10);
randomFill(c, (err, buf) => {
    if (err) throw err;
    console.log(Buffer.from(buf).toString('hex'));
});
```

```cjs
const { randomFill } = require('node:crypto');
const { Buffer } = require('node:buffer');

const a = new Uint32Array(10);
randomFill(a, (err, buf) => {
    if (err) throw err;
    console.log(
        Buffer.from(
            buf.buffer,
            buf.byteOffset,
            buf.byteLength
        ).toString('hex')
    );
});

const b = new DataView(new ArrayBuffer(10));
randomFill(b, (err, buf) => {
    if (err) throw err;
    console.log(
        Buffer.from(
            buf.buffer,
            buf.byteOffset,
            buf.byteLength
        ).toString('hex')
    );
});

const c = new ArrayBuffer(10);
randomFill(c, (err, buf) => {
    if (err) throw err;
    console.log(Buffer.from(buf).toString('hex'));
});
```

Этот API использует пул потоков libuv, что может иметь неожиданные и негативные последствия для производительности некоторых приложений; смотрите документацию [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) для получения дополнительной информации.

Асинхронная версия `crypto.randomFill()` выполняется за один запрос к пулу потоков. Чтобы минимизировать изменение длины задачи пула потоков, разделяйте большие запросы `randomFill`, если они выполняются в рамках выполнения запроса клиента.

<!-- 0134.part.md -->

### `crypto.randomInt([min, ]max[, callback])`

-   `min` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Начало произвольного диапазона (включительно). **По умолчанию:** `0`.
    -   `max` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Конец случайного диапазона (включительно).
    -   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) `function(err, n) {}`.

Возвращает случайное целое число `n`, такое, что `min <= n < max`. Эта реализация позволяет избежать [modulo bias](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias).

Диапазон (`max - min`) должен быть меньше 2<sup>48</sup>. `min` и `max` должны быть [безопасными целыми числами](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger).

Если функция `callback` не предоставлена, случайное целое генерируется синхронно.

```mjs
// Asynchronous
const { randomInt } = await import('node:crypto');

randomInt(3, (err, n) => {
    if (err) throw err;
    console.log(
        `Random number chosen from (0, 1, 2): ${n}`
    );
});
```

```cjs
// Asynchronous
const { randomInt } = require('node:crypto');

randomInt(3, (err, n) => {
    if (err) throw err;
    console.log(
        `Случайное число, выбранное из (0, 1, 2): ${n}`
    );
});
```

```mjs
// Синхронный
const { randomInt } = await import('node:crypto');

const n = randomInt(3);
console.log(
    `Случайное число, выбранное из (0, 1, 2): ${n}`
);
```

```cjs
// Синхронный
const { randomInt } = require('node:crypto');

const n = randomInt(3);
console.log(
    `Случайное число, выбранное из (0, 1, 2): ${n}`
);
```

```mjs
// С аргументом `min`
const { randomInt } = await import('node:crypto');

const n = randomInt(1, 7);
console.log(`Кубики брошены: ${n}`);
```

```cjs
// С аргументом `min`
const { randomInt } = require('node:crypto');

const n = randomInt(1, 7);
console.log(`Кубики брошены: ${n}`);
```

<!-- 0135.part.md -->

### `crypto.randomUUID([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `disableEntropyCache` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) По умолчанию, для повышения производительности, Node.js генерирует и кэширует достаточно случайных данных для генерации до 128 случайных UUID. Чтобы генерировать UUID без использования кэша, установите `disableEntropyCache` в `true`. **По умолчанию:** `false`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерирует случайный [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.txt) UUID версии 4. UUID генерируется с помощью криптографического генератора псевдослучайных чисел.

<!-- 0136.part.md -->

### `crypto.scrypt(password, salt, keylen[, options], callback)`

-   `пароль` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `соль` {string|ArrayBuffer|Buffer|TypedArray|DataView}
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cost` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр стоимости процессора/памяти. Должен быть на целых два больше единицы. **По умолчанию:** `16384`.
    -   `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр размера блока. **По умолчанию:** `8`.
    -   `parallelization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр распараллеливания. **По умолчанию:** `1`.
    -   `N` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `cost`. Может быть указан только один из них.
    -   `r` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `blockSize`. Может быть указано только одно из обоих.
    -   `p` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `распараллеливания`. Может быть указано только одно из обоих значений.
    -   `maxmem` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Верхняя граница памяти. Ошибкой будет, если (приблизительно) `128 * N * r > maxmem`. **По умолчанию:** `32 * 1024 * 1024`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `derivedKey` [`<Buffer>`](buffer.md#buffer)

Предоставляет асинхронную реализацию [scrypt](https://en.wikipedia.org/wiki/Scrypt). Scrypt - это функция получения ключа на основе пароля, которая спроектирована так, чтобы быть дорогой в вычислительном плане и по памяти, чтобы сделать атаки "грубой силы" невыгодными.

Соль" должна быть настолько уникальной, насколько это возможно. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt` следует учитывать [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Функция `callback` вызывается с двумя аргументами: `err` и `derivedKey`. `err` - это объект исключения, если выведение ключа не удалось, в противном случае `err` - это `null`. `derivedKey` передается обратному вызову как [`Buffer`](buffer.md).

Исключение возникает, если любой из входных аргументов содержит недопустимые значения или типы.

```mjs
const { scrypt } = await import('node:crypto');

// Использование заводских значений по умолчанию.
scrypt('password', 'salt', 64, (err, derivedKey) => {
    if (err) throw err;
    console.log(derivedKey.toString('hex')); // '3745e48...08d59ae'
});
// Использование пользовательского параметра N. Должен быть степенью двойки.
scrypt(
    'password',
    'salt',
    64,
    { N: 1024 },
    (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey.toString('hex')); // '3745e48...aa39b34'
    }
);
```

```cjs
const { scrypt } = require('node:crypto');

// Использование заводских настроек по умолчанию.
scrypt('password', 'salt', 64, (err, derivedKey) => {
    if (err) throw err;
    console.log(derivedKey.toString('hex')); // '3745e48...08d59ae'
});
// Использование пользовательского параметра N. Должен быть степенью двойки.
scrypt(
    'password',
    'salt',
    64,
    { N: 1024 },
    (err, derivedKey) => {
        if (err) throw err;
        console.log(derivedKey.toString('hex')); // '3745e48...aa39b34'
    }
);
```

<!-- 0137.part.md -->

### `crypto.scryptSync(password, salt, keylen[, options])`

-   `пароль` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `соль` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `keylen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cost` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр стоимости процессора/памяти. Должен быть на целых два больше единицы. **По умолчанию:** `16384`.
    -   `blockSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр размера блока. **По умолчанию:** `8`.
    -   `parallelization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Параметр распараллеливания. **По умолчанию:** `1`.
    -   `N` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `cost`. Может быть указан только один из них.
    -   `r` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `blockSize`. Может быть указано только одно из обоих.
    -   `p` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Псевдоним для `распараллеливания`. Может быть указано только одно из обоих значений.
    -   `maxmem` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Верхняя граница памяти. Ошибкой будет, если (приблизительно) `128 * N * r > maxmem`. **По умолчанию:** `32 * 1024 * 1024`.
-   Возвращает: [`<Buffer>`](buffer.md#buffer)

Предоставляет синхронную реализацию [scrypt](https://en.wikipedia.org/wiki/Scrypt). Scrypt - это функция получения ключа на основе пароля, которая спроектирована так, чтобы быть дорогой в вычислительном плане и по памяти, чтобы сделать атаки "грубой силы" невыгодными.

Соль" должна быть настолько уникальной, насколько это возможно. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Подробности см. в [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf).

При передаче строк для `password` или `salt` следует учитывать [предостережения при использовании строк в качестве входов в криптографические API](#using-strings-as-inputs-to-cryptographic-apis).

При неудачном выводе ключа возникает исключение, в противном случае полученный ключ возвращается как [`буфер`](buffer.md).

Исключение возникает, если в любом из входных аргументов указаны недопустимые значения или типы.

```mjs
const { scryptSync } = await import('node:crypto');
// Использование заводских значений по умолчанию.

const key1 = scryptSync('password', 'salt', 64);
console.log(key1.toString('hex')); // '3745e48...08d59ae'
// Использование пользовательского параметра N. Должен быть степенью двойки.
const key2 = scryptSync('password', 'salt', 64, {
    N: 1024,
});
console.log(key2.toString('hex')); // '3745e48...aa39b34'
```

```cjs
const { scryptSync } = require('node:crypto');
// Использование заводских настроек по умолчанию.

const key1 = scryptSync('password', 'salt', 64);
console.log(key1.toString('hex')); // '3745e48...08d59ae'
// Использование пользовательского параметра N. Должен быть степенью двойки.
const key2 = scryptSync('password', 'salt', 64, {
    N: 1024,
});
console.log(key2.toString('hex')); // '3745e48...aa39b34'
```

<!-- 0138.part.md -->

### `crypto.secureHeapUsed()`.

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `total` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий размер выделенной безопасной кучи, указанный с помощью флага командной строки `--secure-heap=n`.
    -   `min` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальное выделение из безопасной кучи, как указано с помощью флага командной строки `--secure-heap-min`.
    -   `used` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество байт, выделенных в данный момент из безопасной кучи.
    -   `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Рассчитанное отношение `использованных` к `общему количеству` выделенных байт.

<!-- 0139.part.md -->

### `crypto.setEngine(engine[, flags])`

-   `двигатель` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `flags` {crypto.constants} **По умолчанию:** `crypto.constants.ENGINE_METHOD_ALL`.

Загружает и устанавливает `engine` для некоторых или всех функций OpenSSL (выбранных флагами).

`engine` может быть либо идентификатором, либо путем к общей библиотеке движка.

Необязательный аргумент `flags` по умолчанию использует `ENGINE_METHOD_ALL`. `flags` - это битовое поле, принимающее один из следующих флагов (определенных в `crypto.constants`) или их смесь:

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

<!-- 0140.part.md -->

### `crypto.setFips(bool)`

-   `bool` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` для включения режима FIPS.

Включает FIPS-совместимый криптопровайдер в сборке Node.js с поддержкой FIPS. Выбрасывает ошибку, если режим FIPS недоступен.

<!-- 0141.part.md -->

### `crypto.sign(algorithm, data, key[, callback])`

-   `алгоритм` {string | null | undefined}
-   `данные` {ArrayBuffer|Buffer|TypedArray|DataView}
-   `key` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `signature` [`<Buffer>`](buffer.md#buffer)
-   Возвращает: [`<Buffer>`](buffer.md#buffer), если функция `callback` не предоставлена.

Вычисляет и возвращает подпись для `data`, используя заданный закрытый ключ и алгоритм. Если `algorithm` равен `null` или `undefined`, то алгоритм зависит от типа ключа (особенно Ed25519 и Ed448).

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан в [`crypto.createPrivateKey()`](#cryptocreateprivatekeykeykey). Если это объект, могут быть переданы следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр определяет формат генерируемой подписи. Он может быть одним из следующих:

    -   `'der` (по умолчанию): DER-кодирование ASN.1 структуры подписи в кодировке `(r, s)`.
    -   `'ieee-p1363'`: Формат подписи `r || s`, предложенный в IEEE-P1363.

-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение прокладки для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (по умолчанию)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хэш-функцией, которая используется для подписи сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли для случая, когда используется `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли в размер дайджеста, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) - в максимально допустимое значение.

Если указана функция `callback`, эта функция использует пул потоков libuv.

<!-- 0142.part.md -->

### `crypto.subtle`

-   Тип: {SubtleCrypto}

Удобный псевдоним для [`crypto.webcrypto.subtle`](webcrypto.md#class-subtlecrypto).

<!-- 0143.part.md -->

### `crypto.timingSafeEqual(a, b)`

-   `a` {ArrayBuffer|Buffer|TypedArray|DataView}
-   `b` {ArrayBuffer|Buffer|TypedArray|DataView}
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Эта функция сравнивает базовые байты, представляющие заданные экземпляры `ArrayBuffer`, `TypedArray` или `DataView`, используя алгоритм постоянного времени.

Эта функция не передает информацию о времени, которая позволила бы злоумышленнику угадать одно из значений. Она подходит для сравнения дайджестов HMAC или секретных значений, таких как аутентификационные cookies или [capability urls](https://www.w3.org/TR/capability-urls/).

`a` и `b` должны быть `Buffer`, `TypedArray` или `DataView`, и они должны иметь одинаковую длину байта. Если `a` и `b` имеют разную длину байта, будет выдана ошибка.

Если хотя бы один из `a` и `b` является `TypedArray` с более чем одним байтом на запись, например `Uint16Array`, результат будет вычислен с использованием порядка байтов платформы.

Когда оба входа являются `Float32Array` или `Float64Array`, эта функция может вернуть неожиданные результаты из-за кодировки IEEE 754 для чисел с плавающей точкой. В частности, ни `x === y`, ни `Object.is(x, y)` не означают, что байтовые представления двух чисел с плавающей точкой `x` и `y` равны.

Использование `crypto.timingSafeEqual` не гарантирует, что _окружающий_ код безопасен по времени. Следует позаботиться о том, чтобы окружающий код не создавал уязвимостей во времени.

<!-- 0144.part.md -->

### `crypto.verify(algorithm, data, key, signature[, callback])`

-   `алгоритм` {string|null|undefined}
-   `данные` {ArrayBuffer| Buffer|TypedArray|DataView}
-   `ключ` {Object|string|ArrayBuffer|Buffer|TypedArray|DataView|KeyObject|CryptoKey}
-   `signature` {ArrayBuffer|Buffer|TypedArray|DataView}
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `result` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` или `false` в зависимости от достоверности подписи для данных и открытого ключа, если функция `callback` не предоставлена.

Проверяет заданную подпись для `данных`, используя заданный ключ и алгоритм. Если `algorithm` равен `null` или `undefined`, то алгоритм зависит от типа ключа (особенно Ed25519 и Ed448).

Если `key` не является [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан в [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, могут быть переданы следующие дополнительные свойства:

-   `dsaEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Для DSA и ECDSA этот параметр определяет формат подписи. Он может быть одним из следующих:

    -   `'der` (по умолчанию): DER-кодирование ASN.1 структуры подписи в кодировке `(r, s)`.
    -   `'ieee-p1363'`: Формат подписи `r || s`, предложенный в IEEE-P1363.

-   `padding` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательное значение прокладки для RSA, одно из следующих:

    -   `crypto.constants.RSA_PKCS1_PADDING` (по умолчанию)
    -   `crypto.constants.RSA_PKCS1_PSS_PADDING`

    `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хэш-функцией, которая используется для подписи сообщения, как указано в разделе 3.1 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

-   `saltLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина соли для случая, когда используется `RSA_PKCS1_PSS_PADDING`. Специальное значение `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли в размер дайджеста, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) - в максимально допустимое значение.

Аргумент `signature` - это ранее вычисленная подпись для `данных`.

Поскольку открытые ключи могут быть получены из закрытых ключей, для `key` может быть передан как закрытый, так и открытый ключ.

Если указана функция `callback`, эта функция использует пул потоков libuv.

<!-- 0145.part.md -->

### `crypto.webcrypto`

Тип: {Crypto} Реализация стандарта Web Crypto API.

Подробности см. в документации [Web Crypto API](webcrypto.md).

<!-- 0146.part.md -->

## Примечания

<!-- 0147.part.md -->

### Использование строк в качестве входов в криптографические API

По историческим причинам многие криптографические API, предоставляемые Node.js, принимают строки в качестве входных данных, где основной криптографический алгоритм работает с последовательностями байтов. К таким экземплярам относятся открытые тексты, шифротексты, симметричные ключи, векторы инициализации, парольные фразы, соли, метки аутентификации и дополнительные аутентифицированные данные.

При передаче строк в криптографические API следует учитывать следующие факторы.

-   Не все последовательности байтов являются допустимыми строками UTF-8. Поэтому, когда из строки получается последовательность байтов длиной `n`, ее энтропия обычно ниже, чем энтропия случайной или псевдослучайной последовательности байтов длиной `n`. Например, из строки UTF-8 не получится последовательность байтов `c0 af`. Секретные ключи должны быть почти исключительно случайными или псевдослучайными последовательностями байтов.

-   Аналогично, при преобразовании случайных или псевдослучайных последовательностей байтов в строки UTF-8, последовательности, не представляющие допустимые кодовые точки, могут быть заменены символом замены Unicode (`U+FFFD`). Поэтому байтовое представление результирующей строки Unicode может быть не равно последовательности байтов, из которой она была создана.

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
    // Печатает '<Буфер ef bf bd ef bf bd>'.
    ```

    Выходы шифров, хэш-функций, алгоритмов подписи и функций получения ключей представляют собой псевдослучайные последовательности байтов и не должны использоваться как строки Unicode.

-   Когда строки получаются из пользовательского ввода, некоторые символы Unicode могут быть представлены несколькими эквивалентными способами, которые приводят к различным последовательностям байтов. Например, при передаче парольной фразы пользователя функции выведения ключа, такой как PBKDF2 или scrypt, результат функции выведения ключа зависит от того, используются ли в строке составные или разложенные символы. Node.js не нормализует представления символов. Разработчикам следует рассмотреть возможность использования [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) для пользовательского ввода перед передачей его в криптографические API.

<!-- 0148.part.md -->

### Старый API потоков (до Node.js 0.10)

Модуль Crypto был добавлен в Node.js до появления концепции унифицированного Stream API, и до появления объектов [`Buffer`](buffer.md) для работы с двоичными данными. Поэтому многие классы, определяющие `crypto`, имеют методы, которые обычно не встречаются в других классах Node.js, реализующих API [streams](stream.md) (например, `update()`, `final()` или `digest()`). Кроме того, многие методы по умолчанию принимали и возвращали строки в кодировке `'latin1'`, а не `буфер`. Это значение было изменено после Node.js v0.8 на использование объектов [`Buffer`](buffer.md) по умолчанию.

<!-- 0149.part.md -->

### Поддержка слабых или скомпрометированных алгоритмов

Модуль `node:crypto` по-прежнему поддерживает некоторые алгоритмы, которые уже скомпрометированы и в настоящее время не рекомендуются для использования. API также позволяет использовать шифры и хэши с небольшим размером ключа, которые слишком слабы для безопасного использования.

Пользователи должны взять на себя полную ответственность за выбор криптоалгоритма и размера ключа в соответствии со своими требованиями к безопасности.

В соответствии с рекомендациями [NIST SP 800-131A](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-131Ar1.pdf):

-   MD5 и SHA-1 больше не приемлемы там, где требуется устойчивость к коллизиям, например, в цифровых подписях.
-   Ключ, используемый в алгоритмах RSA, DSA и DH, рекомендуется иметь не менее 2048 бит, а ключ кривой ECDSA и ECDH - не менее 224 бит, чтобы его можно было безопасно использовать в течение нескольких лет.
-   Группы DH `modp1`, `modp2` и `modp5` имеют размер ключа меньше 2048 бит и не рекомендуются.

Другие рекомендации и подробности см. в справочнике.

Некоторые алгоритмы, имеющие известные недостатки и малоприменимые на практике, доступны только через [legacy provider](cli.md#--openssl-legacy-provider), который не включен по умолчанию.

<!-- 0150.part.md -->

### Режим CCM

CCM является одним из поддерживаемых [AEAD алгоритмов](https://en.wikipedia.org/wiki/Authenticated_encryption). Приложения, использующие этот режим, должны придерживаться определенных ограничений при использовании API шифра:

-   Длина тега аутентификации должна быть указана при создании шифра путем установки опции `authTagLength` и должна быть одной из 4, 6, 8, 10, 12, 14 или 16 байт.
-   Длина вектора инициализации (nonce) `N` должна быть от 7 до 13 байт (`7 ≤ N ≤ 13`).
-   Длина открытого текста ограничена `2 ** (8 * (15 - N))` байтами.
-   При расшифровке тег аутентификации должен быть установлен с помощью `setAuthTag()` перед вызовом `update()`. В противном случае расшифровка будет неудачной, и `final()` выдаст ошибку в соответствии с разделом 2.6 [RFC 3610](https://www.rfc-editor.org/rfc/rfc3610.txt).
-   Использование потоковых методов, таких как `write(data)`, `end(data)` или `pipe()` в режиме CCM может быть неудачным, так как CCM не может обрабатывать более одного куска данных на экземпляр.
-   При передаче дополнительных аутентифицированных данных (AAD), длина фактического сообщения в байтах должна быть передана в `setAAD()` через опцию `plaintextLength`. Многие криптобиблиотеки включают тег аутентификации в шифротекст, что означает, что они создают шифротексты длиной `plaintextLength + authTagLength`. Node.js не включает тег аутентификации, поэтому длина шифротекста всегда равна `plaintextLength`. Это не требуется, если не используется AAD.
-   Поскольку CCM обрабатывает все сообщение сразу, `update()` должна быть вызвана ровно один раз.
-   Даже если вызова `update()` достаточно для шифрования/дешифрования сообщения, приложения _должны_ вызывать `final()` для вычисления или проверки метки аутентификации.

<!-- конец списка -->

```mjs
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

const decipher = createDecipheriv(
    'aes-192-ccm',
    key,
    nonce,
    {
        authTagLength: 16,
    }
);
decipher.setAuthTag(tag);
decipher.setAAD(aad, {
    plaintextLength: ciphertext.length,
});
const receivedPlaintext = decipher.update(
    ciphertext,
    null,
    'utf8'
);

try {
    decipher.final();
} catch (err) {
    throw new Error('Authentication failed!', {
        cause: err,
    });
}

console.log(receivedPlaintext);
```

```cjs
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

const decipher = createDecipheriv(
    'aes-192-ccm',
    key,
    nonce,
    {
        authTagLength: 16,
    }
);
decipher.setAuthTag(tag);
decipher.setAAD(aad, {
    plaintextLength: ciphertext.length,
});
const receivedPlaintext = decipher.update(
    ciphertext,
    null,
    'utf8'
);

try {
    decipher.final();
} catch (err) {
    throw new Error('Authentication failed!', {
        cause: err,
    });
}

console.log(receivedPlaintext);
```

## Константы криптографии

Следующие константы, экспортируемые `crypto.constants`, применяются к различным вариантам использования модулей `node:crypto`, `node:tls` и `node:https` и в целом специфичны для OpenSSL.

<!-- 0152.part.md -->

### OpenSSL options

See the [list of SSL OP Flags](https://wiki.openssl.org/index.php/List_of_SSL_OP_Flags#Table_of_Options) for details.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>SSL_OP_ALL</code>

</td>

<td>

Applies multiple bug workarounds within OpenSSL. See <a href="https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html">https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html</a> for detail.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_ALLOW_NO_DHE_KEX</code>

</td>

<td>

Instructs OpenSSL to allow a non-\[EC\]DHE-based key exchange mode for TLS v1.3

</td>

</tr>

<tr>

<td>

<code>SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION</code>

</td>

<td>

Allows legacy insecure renegotiation between OpenSSL and unpatched clients or servers. See <a href="https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html">https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html</a>.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_CIPHER_SERVER_PREFERENCE</code>

</td>

<td>

Attempts to use the server’s preferences instead of the client’s when selecting a cipher. Behavior depends on protocol version. See <a href="https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html">https://www.openssl.org/docs/man3.0/man3/SSL_CTX_set_options.html</a>.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_CISCO_ANYCONNECT</code>

</td>

<td>

Instructs OpenSSL to use Cisco’s “speshul” version of DTLS_BAD_VER.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_COOKIE_EXCHANGE</code>

</td>

<td>

Instructs OpenSSL to turn on cookie exchange.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_CRYPTOPRO_TLSEXT_BUG</code>

</td>

<td>

Instructs OpenSSL to add server-hello extension from an early version of the cryptopro draft.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS</code>

</td>

<td>

Instructs OpenSSL to disable a SSL 3.0/TLS 1.0 vulnerability workaround added in OpenSSL 0.9.6d.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_LEGACY_SERVER_CONNECT</code>

</td>

<td>

Allows initial connection to servers that do not support RI.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_COMPRESSION</code>

</td>

<td>

Instructs OpenSSL to disable support for SSL/TLS compression.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_ENCRYPT_THEN_MAC</code>

</td>

<td>

Instructs OpenSSL to disable encrypt-then-MAC.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_QUERY_MTU</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_RENEGOTIATION</code>

</td>

<td>

Instructs OpenSSL to disable renegotiation.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION</code>

</td>

<td>

Instructs OpenSSL to always start a new session when performing renegotiation.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_SSLv2</code>

</td>

<td>

Instructs OpenSSL to turn off SSL v2

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_SSLv3</code>

</td>

<td>

Instructs OpenSSL to turn off SSL v3

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_TICKET</code>

</td>

<td>

Instructs OpenSSL to disable use of RFC4507bis tickets.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_TLSv1</code>

</td>

<td>

Instructs OpenSSL to turn off TLS v1

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_TLSv1_1</code>

</td>

<td>

Instructs OpenSSL to turn off TLS v1.1

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_TLSv1_2</code>

</td>

<td>

Instructs OpenSSL to turn off TLS v1.2

</td>

</tr>

<tr>

<td>

<code>SSL_OP_NO_TLSv1_3</code>

</td>

<td>

Instructs OpenSSL to turn off TLS v1.3

</td>

</tr>

<tr>

<td>

<code>SSL_OP_PRIORITIZE_CHACHA</code>

</td>

<td>

Instructs OpenSSL server to prioritize ChaCha20-Poly1305 when the client does. This option has no effect if <code>SSL_OP_CIPHER_SERVER_PREFERENCE</code> is not enabled.

</td>

</tr>

<tr>

<td>

<code>SSL_OP_TLS_ROLLBACK_BUG</code>

</td>

<td>

Instructs OpenSSL to disable version rollback attack detection.

</td>

</tr>

</table>

<!-- 0153.part.md -->

### OpenSSL engine constants

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_RSA</code>

</td>

<td>

Limit engine usage to RSA

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_DSA</code>

</td>

<td>

Limit engine usage to DSA

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_DH</code>

</td>

<td>

Limit engine usage to DH

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_RAND</code>

</td>

<td>

Limit engine usage to RAND

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_EC</code>

</td>

<td>

Limit engine usage to EC

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_CIPHERS</code>

</td>

<td>

Limit engine usage to CIPHERS

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_DIGESTS</code>

</td>

<td>

Limit engine usage to DIGESTS

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_PKEY_METHS</code>

</td>

<td>

Limit engine usage to PKEY_METHDS

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_PKEY_ASN1_METHS</code>

</td>

<td>

Limit engine usage to PKEY_ASN1_METHS

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_ALL</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>ENGINE_METHOD_NONE</code>

</td>

<td>

</td>

</tr>

</table>

<!-- 0154.part.md -->

### Other OpenSSL constants

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>DH_CHECK_P_NOT_SAFE_PRIME</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>DH_CHECK_P_NOT_PRIME</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>DH_UNABLE_TO_CHECK_GENERATOR</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>DH_NOT_SUITABLE_GENERATOR</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_PKCS1_PADDING</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_SSLV23_PADDING</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_NO_PADDING</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_PKCS1_OAEP_PADDING</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_X931_PADDING</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_PKCS1_PSS_PADDING</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>RSA_PSS_SALTLEN_DIGEST</code>

</td>

<td>

Sets the salt length for <code>RSA_PKCS1_PSS_PADDING</code> to the digest size when signing or verifying.

</td>

</tr>

<tr>

<td>

<code>RSA_PSS_SALTLEN_MAX_SIGN</code>

</td>

<td>

Sets the salt length for <code>RSA_PKCS1_PSS_PADDING</code> to the maximum permissible value when signing data.

</td>

</tr>

<tr>

<td>

<code>RSA_PSS_SALTLEN_AUTO</code>

</td>

<td>

Causes the salt length for <code>RSA_PKCS1_PSS_PADDING</code> to be determined automatically when verifying a signature.

</td>

</tr>

<tr>

<td>

<code>POINT_CONVERSION_COMPRESSED</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>POINT_CONVERSION_UNCOMPRESSED</code>

</td>

<td>

</td>

</tr>

<tr>

<td>

<code>POINT_CONVERSION_HYBRID</code>

</td>

<td>

</td>

</tr>

</table>

<!-- 0155.part.md -->

### Node.js crypto constants

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>defaultCoreCipherList</code>

</td>

<td>

Specifies the built-in default cipher list used by Node.js.

</td>

</tr>

<tr>

<td>

<code>defaultCipherList</code>

</td>

<td>

Specifies the active default cipher list used by the current Node.js process.

</td>

</tr>

</table>

<!-- 0156.part.md -->
