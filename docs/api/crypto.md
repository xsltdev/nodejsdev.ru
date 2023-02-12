---
description: В crypto Модуль предоставляет криптографические функции, которые включают набор оболочек для функций хэша OpenSSL, HMAC, шифрования, дешифрования, подписи и проверки
---

# Модуль crypto

<!--introduced_in=v0.3.6-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/crypto.js -->

В `crypto` Модуль предоставляет криптографические функции, которые включают набор оболочек для функций хэша OpenSSL, HMAC, шифрования, дешифрования, подписи и проверки.

```mjs
const { createHmac } = await import('crypto');

const secret = 'abcdefg';
const hash = createHmac('sha256', secret)
  .update('I love cupcakes')
  .digest('hex');
console.log(hash);
// Prints:
//   c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
```

```cjs
const crypto = require('crypto');

const secret = 'abcdefg';
const hash = crypto
  .createHmac('sha256', secret)
  .update('I love cupcakes')
  .digest('hex');
console.log(hash);
// Prints:
//   c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e
```

## Определение того, недоступна ли поддержка криптографии

Node.js может быть построен без поддержки `crypto` модуль. В таких случаях попытка `import` из `crypto` или позвонив `require('crypto')` приведет к выдаче ошибки.

При использовании CommonJS возникшую ошибку можно отловить с помощью try / catch:

```cjs
let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}
```

При использовании лексического ESM `import` ключевое слово, ошибка может быть обнаружена только в том случае, если обработчик для `process.on('uncaughtException')` зарегистрирован _до_ любая попытка загрузить модуль осуществляется - например, с использованием модуля предварительной загрузки.

При использовании ESM, если есть вероятность, что код может быть запущен в сборке Node.js, где поддержка шифрования не включена, рассмотрите возможность использования `import()` функция вместо лексического `import` ключевое слово:

```mjs
let crypto;
try {
  crypto = await import('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}
```

## Класс: `Certificate`

<!-- YAML
added: v0.11.8
-->

SPKAC - это механизм запроса на подпись сертификата, изначально реализованный Netscape и официально указанный как часть [HTML5 `keygen` элемент](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/keygen).

`<keygen>` устарело, так как [HTML 5.2](https://www.w3.org/TR/html52/changes.html#features-removed) и новые проекты больше не должны использовать этот элемент.

В `crypto` модуль предоставляет `Certificate` класс для работы с данными SPKAC. Чаще всего используется обработка вывода, созданного HTML5. `<keygen>` элемент. Node.js использует [Реализация OpenSSL SPKAC](https://www.openssl.org/docs/man1.1.0/apps/openssl-spkac.html) внутренне.

### Статический метод: `Certificate.exportChallenge(spkac[, encoding])`

<!-- YAML
added: v9.0.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The spkac argument can be an ArrayBuffer. Limited the size of
                 the spkac argument to a maximum of 2**31 - 1 bytes.
-->

- `spkac` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `spkac` нить.
- Возвращает: {Buffer} компонент вызова `spkac` структура данных, которая включает открытый ключ и вызов.

```mjs
const { Certificate } = await import('crypto');
const spkac = getSpkacSomehow();
const challenge = Certificate.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Prints: the challenge as a UTF8 string
```

```cjs
const { Certificate } = require('crypto');
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

- `spkac` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `spkac` нить.
- Возвращает: {Buffer} Компонент открытого ключа `spkac` структура данных, которая включает открытый ключ и вызов.

```mjs
const { Certificate } = await import('crypto');
const spkac = getSpkacSomehow();
const publicKey = Certificate.exportPublicKey(spkac);
console.log(publicKey);
// Prints: the public key as <Buffer ...>
```

```cjs
const { Certificate } = require('crypto');
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

- `spkac` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `spkac` нить.
- Возвращает: {логическое} `true` если данный `spkac` структура данных действительна, `false` иначе.

```mjs
import { Buffer } from 'buffer';
const { Certificate } = await import('crypto');

const spkac = getSpkacSomehow();
console.log(Certificate.verifySpkac(Buffer.from(spkac)));
// Prints: true or false
```

```cjs
const { Certificate } = require('crypto');
const { Buffer } = require('buffer');

const spkac = getSpkacSomehow();
console.log(Certificate.verifySpkac(Buffer.from(spkac)));
// Prints: true or false
```

### Устаревший API

> Стабильность: 0 - устарело

В устаревшем интерфейсе можно создавать новые экземпляры `crypto.Certificate` class, как показано в примерах ниже.

#### `new crypto.Certificate()`

Экземпляры `Certificate` класс можно создать с помощью `new` ключевое слово или позвонив `crypto.Certificate()` как функция:

```mjs
const { Certificate } = await import('crypto');

const cert1 = new Certificate();
const cert2 = Certificate();
```

```cjs
const { Certificate } = require('crypto');

const cert1 = new Certificate();
const cert2 = Certificate();
```

#### `certificate.exportChallenge(spkac[, encoding])`

<!-- YAML
added: v0.11.8
-->

- `spkac` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `spkac` нить.
- Возвращает: {Buffer} компонент вызова `spkac` структура данных, которая включает открытый ключ и вызов.

```mjs
const { Certificate } = await import('crypto');
const cert = Certificate();
const spkac = getSpkacSomehow();
const challenge = cert.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Prints: the challenge as a UTF8 string
```

```cjs
const { Certificate } = require('crypto');
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

- `spkac` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `spkac` нить.
- Возвращает: {Buffer} Компонент открытого ключа `spkac` структура данных, которая включает открытый ключ и вызов.

```mjs
const { Certificate } = await import('crypto');
const cert = Certificate();
const spkac = getSpkacSomehow();
const publicKey = cert.exportPublicKey(spkac);
console.log(publicKey);
// Prints: the public key as <Buffer ...>
```

```cjs
const { Certificate } = require('crypto');
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

- `spkac` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `spkac` нить.
- Возвращает: {логическое} `true` если данный `spkac` структура данных действительна, `false` иначе.

```mjs
import { Buffer } from 'buffer';
const { Certificate } = await import('crypto');

const cert = Certificate();
const spkac = getSpkacSomehow();
console.log(cert.verifySpkac(Buffer.from(spkac)));
// Prints: true or false
```

```cjs
const { Certificate } = require('crypto');
const { Buffer } = require('buffer');

const cert = Certificate();
const spkac = getSpkacSomehow();
console.log(cert.verifySpkac(Buffer.from(spkac)));
// Prints: true or false
```

## Класс: `Cipher`

<!-- YAML
added: v0.1.94
-->

- Расширяется: {stream.Transform}

Экземпляры `Cipher` class используются для шифрования данных. Класс можно использовать одним из двух способов:

- Как [транслировать](stream.md) который доступен как для чтения, так и для записи, когда простые незашифрованные данные записываются для создания зашифрованных данных на читаемой стороне, или
- С помощью [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding) а также [`cipher.final()`](#cipherfinaloutputencoding) методы для создания зашифрованных данных.

В [`crypto.createCipher()`](#cryptocreatecipheralgorithm-password-options) или [`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) методы используются для создания `Cipher` экземпляры. `Cipher` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Пример: использование `Cipher` объекты как потоки:

```mjs
const { scrypt, randomFill, createCipheriv } = await import(
  'crypto'
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
} = require('crypto');

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

Пример: использование `Cipher` и конвейерные потоки:

```mjs
import { createReadStream, createWriteStream } from 'fs';

import { pipeline } from 'stream';

const { scrypt, randomFill, createCipheriv } = await import(
  'crypto'
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
} = require('fs');

const { pipeline } = require('stream');

const {
  scrypt,
  randomFill,
  createCipheriv,
} = require('crypto');

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

Пример: использование [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding) а также [`cipher.final()`](#cipherfinaloutputencoding) методы:

```mjs
const { scrypt, randomFill, createCipheriv } = await import(
  'crypto'
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
} = require('crypto');

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

### `cipher.final([outputEncoding])`

<!-- YAML
added: v0.1.94
-->

- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | строка} Любое оставшееся зашифрованное содержимое. Если `outputEncoding` указан, возвращается строка. Если `outputEncoding` не предусмотрено, [`Buffer`](buffer.md) возвращается.

Однажды `cipher.final()` метод был вызван, `Cipher` объект больше не может использоваться для шифрования данных. Попытки позвонить `cipher.final()` более одного раза приведет к выдаче ошибки.

### `cipher.getAuthTag()`

<!-- YAML
added: v1.0.0
-->

- Возвращает: {Buffer} При использовании режима аутентифицированного шифрования (`GCM`, `CCM` а также `OCB` в настоящее время поддерживаются), `cipher.getAuthTag()` метод возвращает [`Buffer`](buffer.md) содержащий _тег аутентификации_ который был рассчитан на основе заданных данных.

В `cipher.getAuthTag()` метод должен вызываться только после завершения шифрования с использованием [`cipher.final()`](#cipherfinaloutputencoding) метод.

### `cipher.setAAD(buffer[, options])`

<!-- YAML
added: v1.0.0
-->

- `buffer` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
  - `plaintextLength` {количество}
  - `encoding` {строка} Кодировка строки, используемая, когда `buffer` это строка.
- Возвращает: {Cipher} для цепочки методов.

При использовании режима аутентифицированного шифрования (`GCM`, `CCM` а также `OCB` в настоящее время поддерживаются), `cipher.setAAD()` устанавливает значение, используемое для _дополнительные аутентифицированные данные_ (AAD) входной параметр.

В `plaintextLength` опция не является обязательной для `GCM` а также `OCB`. Когда используешь `CCM`, то `plaintextLength` должна быть указана опция, и ее значение должно соответствовать длине открытого текста в байтах. Видеть [CCM режим](#ccm-mode).

В `cipher.setAAD()` метод должен быть вызван перед [`cipher.update()`](#cipherupdatedata-inputencoding-outputencoding).

### `cipher.setAutoPadding([autoPadding])`

<!-- YAML
added: v0.7.1
-->

- `autoPadding` {логический} **Дефолт:** `true`
- Возвращает: {Cipher} для цепочки методов.

При использовании алгоритмов блочного шифрования `Cipher` class автоматически добавит отступ к входным данным до соответствующего размера блока. Чтобы отключить вызов заполнения по умолчанию `cipher.setAutoPadding(false)`.

Когда `autoPadding` является `false`, длина всех входных данных должна быть кратной размеру блока шифра или [`cipher.final()`](#cipherfinaloutputencoding) выдаст ошибку. Отключение автоматического заполнения полезно для нестандартного заполнения, например, с помощью `0x0` вместо заполнения PKCS.

В `cipher.setAutoPadding()` метод должен быть вызван перед [`cipher.final()`](#cipherfinaloutputencoding).

### `cipher.update(data[, inputEncoding][, outputEncoding])`

<!-- YAML
added: v0.1.94
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

- `data` {строка | буфер | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) данных.
- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Обновляет шифр с `data`. Если `inputEncoding` приводится аргумент, `data` Аргумент - это строка, использующая указанную кодировку. Если `inputEncoding` аргумент не приводится, `data` должен быть [`Buffer`](buffer.md), `TypedArray`, или `DataView`. Если `data` это [`Buffer`](buffer.md), `TypedArray`, или `DataView`, тогда `inputEncoding` игнорируется.

В `outputEncoding` определяет выходной формат зашифрованных данных. Если `outputEncoding` указан, возвращается строка, использующая указанную кодировку. Если нет `outputEncoding` предоставляется, [`Buffer`](buffer.md) возвращается.

В `cipher.update()` метод может вызываться несколько раз с новыми данными до тех пор, пока [`cipher.final()`](#cipherfinaloutputencoding) называется. Вызов `cipher.update()` после [`cipher.final()`](#cipherfinaloutputencoding) приведет к выдаче ошибки.

## Класс: `Decipher`

<!-- YAML
added: v0.1.94
-->

- Расширяется: {stream.Transform}

Экземпляры `Decipher` class используются для расшифровки данных. Класс можно использовать одним из двух способов:

- Как [транслировать](stream.md) который доступен как для чтения, так и для записи, когда простые зашифрованные данные записываются для создания незашифрованных данных на читаемой стороне, или
- С помощью [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) а также [`decipher.final()`](#decipherfinaloutputencoding) методы для получения незашифрованных данных.

В [`crypto.createDecipher()`](#cryptocreatedecipheralgorithm-password-options) или [`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options) методы используются для создания `Decipher` экземпляры. `Decipher` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Пример: использование `Decipher` объекты как потоки:

```mjs
import { Buffer } from 'buffer';
const { scryptSync, createDecipheriv } = await import(
  'crypto'
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
const { scryptSync, createDecipheriv } = require('crypto');
const { Buffer } = require('buffer');

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

Пример: использование `Decipher` и конвейерные потоки:

```mjs
import { createReadStream, createWriteStream } from 'fs';
import { Buffer } from 'buffer';
const { scryptSync, createDecipheriv } = await import(
  'crypto'
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
} = require('fs');
const { scryptSync, createDecipheriv } = require('crypto');
const { Buffer } = require('buffer');

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

Пример: использование [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) а также [`decipher.final()`](#decipherfinaloutputencoding) методы:

```mjs
import { Buffer } from 'buffer';
const { scryptSync, createDecipheriv } = await import(
  'crypto'
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
const { scryptSync, createDecipheriv } = require('crypto');
const { Buffer } = require('buffer');

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

- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | строка} Любое оставшееся расшифрованное содержимое. Если `outputEncoding` указан, возвращается строка. Если `outputEncoding` не предусмотрено, [`Buffer`](buffer.md) возвращается.

Однажды `decipher.final()` метод был вызван, `Decipher` объект больше не может использоваться для расшифровки данных. Попытки позвонить `decipher.final()` более одного раза приведет к выдаче ошибки.

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

- `buffer` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
  - `plaintextLength` {количество}
  - `encoding` {строка} Кодировка строки, используемая, когда `buffer` это строка.
- Возвращает: {Decipher} для цепочки методов.

При использовании режима аутентифицированного шифрования (`GCM`, `CCM` а также `OCB` в настоящее время поддерживаются), `decipher.setAAD()` устанавливает значение, используемое для _дополнительные аутентифицированные данные_ (AAD) входной параметр.

В `options` аргумент не является обязательным для `GCM`. Когда используешь `CCM`, то `plaintextLength` Параметр должен быть указан, и его значение должно соответствовать длине зашифрованного текста в байтах. Видеть [CCM режим](#ccm-mode).

В `decipher.setAAD()` метод должен быть вызван перед [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding).

При передаче строки как `buffer`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

### `decipher.setAuthTag(buffer[, encoding])`

<!-- YAML
added: v1.0.0
changes:
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

- `buffer` {строка | Буфер | ArrayBuffer | TypedArray | DataView}
- `encoding` {строка} Кодировка строки, используемая, когда `buffer` это строка.
- Возвращает: {Decipher} для цепочки методов.

При использовании режима аутентифицированного шифрования (`GCM`, `CCM` а также `OCB` в настоящее время поддерживаются), `decipher.setAuthTag()` метод используется для передачи полученного _тег аутентификации_. Если тег не указан или зашифрованный текст был изменен, [`decipher.final()`](#decipherfinaloutputencoding) выдаст, указывая, что зашифрованный текст следует отбросить из-за неудачной аутентификации. Если длина тега недействительна в соответствии с [NIST SP 800-38D](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf) или не соответствует значению `authTagLength` вариант, `decipher.setAuthTag()` выдаст ошибку.

В `decipher.setAuthTag()` метод должен быть вызван перед [`decipher.update()`](#decipherupdatedata-inputencoding-outputencoding) для `CCM` режим или ранее [`decipher.final()`](#decipherfinaloutputencoding) для `GCM` а также `OCB` режимы. `decipher.setAuthTag()` можно вызвать только один раз.

При передаче строки в качестве тега аутентификации учитывайте [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

### `decipher.setAutoPadding([autoPadding])`

<!-- YAML
added: v0.7.1
-->

- `autoPadding` {логический} **Дефолт:** `true`
- Возвращает: {Decipher} для цепочки методов.

Когда данные были зашифрованы без стандартного заполнения блока, вызов `decipher.setAutoPadding(false)` отключит автоматическое заполнение, чтобы предотвратить [`decipher.final()`](#decipherfinaloutputencoding) от проверки и удаления отступов.

Отключение автоматического заполнения будет работать только в том случае, если длина входных данных кратна размеру блока шифров.

В `decipher.setAutoPadding()` метод должен быть вызван перед [`decipher.final()`](#decipherfinaloutputencoding).

### `decipher.update(data[, inputEncoding][, outputEncoding])`

<!-- YAML
added: v0.1.94
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

- `data` {строка | буфер | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `data` нить.
- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Обновляет дешифратор с `data`. Если `inputEncoding` приводится аргумент, `data` Аргумент - это строка, использующая указанную кодировку. Если `inputEncoding` аргумент не приводится, `data` должен быть [`Buffer`](buffer.md). Если `data` это [`Buffer`](buffer.md) тогда `inputEncoding` игнорируется.

В `outputEncoding` определяет выходной формат зашифрованных данных. Если `outputEncoding` указан, возвращается строка, использующая указанную кодировку. Если нет `outputEncoding` предоставляется, [`Buffer`](buffer.md) возвращается.

В `decipher.update()` метод может вызываться несколько раз с новыми данными до тех пор, пока [`decipher.final()`](#decipherfinaloutputencoding) называется. Вызов `decipher.update()` после [`decipher.final()`](#decipherfinaloutputencoding) приведет к выдаче ошибки.

## Класс: `DiffieHellman`

<!-- YAML
added: v0.5.0
-->

В `DiffieHellman` class - это утилита для создания обменов ключами Диффи-Хеллмана.

Экземпляры `DiffieHellman` класс можно создать с помощью [`crypto.createDiffieHellman()`](#cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding) функция.

```mjs
import assert from 'assert';

const { createDiffieHellman } = await import('crypto');

// Generate Alice's keys...
const alice = createDiffieHellman(2048);
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = createDiffieHellman(
  alice.getPrime(),
  alice.getGenerator()
);
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// OK
assert.strictEqual(
  aliceSecret.toString('hex'),
  bobSecret.toString('hex')
);
```

```cjs
const assert = require('assert');

const { createDiffieHellman } = require('crypto');

// Generate Alice's keys...
const alice = createDiffieHellman(2048);
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = createDiffieHellman(
  alice.getPrime(),
  alice.getGenerator()
);
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

// OK
assert.strictEqual(
  aliceSecret.toString('hex'),
  bobSecret.toString('hex')
);
```

### `diffieHellman.computeSecret(otherPublicKey[, inputEncoding][, outputEncoding])`

<!-- YAML
added: v0.5.0
-->

- `otherPublicKey` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) из `otherPublicKey` нить.
- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Вычисляет общий секрет, используя `otherPublicKey` в качестве открытого ключа другой стороны и возвращает вычисленный общий секрет. Поставляемый ключ интерпретируется с использованием указанного `inputEncoding`, а секрет кодируется с использованием указанного `outputEncoding`. Если `inputEncoding` не предусмотрено, `otherPublicKey` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

Если `outputEncoding` дана строка возвращается; в противном случае [`Buffer`](buffer.md) возвращается.

### `diffieHellman.generateKeys([encoding])`

<!-- YAML
added: v0.5.0
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Создает частные и общедоступные значения ключей Диффи-Хеллмана и возвращает открытый ключ в указанном `encoding`. Этот ключ следует передать другой стороне. Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `diffieHellman.getGenerator([encoding])`

<!-- YAML
added: v0.5.0
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Возвращает генератор Диффи-Хеллмана в указанном `encoding`. Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `diffieHellman.getPrime([encoding])`

<!-- YAML
added: v0.5.0
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Возвращает простое число Диффи-Хеллмана в указанном `encoding`. Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `diffieHellman.getPrivateKey([encoding])`

<!-- YAML
added: v0.5.0
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Возвращает закрытый ключ Диффи-Хеллмана в указанном `encoding`. Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `diffieHellman.getPublicKey([encoding])`

<!-- YAML
added: v0.5.0
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Возвращает открытый ключ Диффи-Хеллмана в указанном `encoding`. Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `diffieHellman.setPrivateKey(privateKey[, encoding])`

<!-- YAML
added: v0.5.0
-->

- `privateKey` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `privateKey` нить.

Устанавливает закрытый ключ Диффи-Хеллмана. Если `encoding` предоставляется аргумент, `privateKey` ожидается строка. Если нет `encoding` предоставлен, `privateKey` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

### `diffieHellman.setPublicKey(publicKey[, encoding])`

<!-- YAML
added: v0.5.0
-->

- `publicKey` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `publicKey` нить.

Устанавливает открытый ключ Диффи-Хеллмана. Если `encoding` предоставляется аргумент, `publicKey` ожидается строка. Если нет `encoding` предоставлен, `publicKey` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

### `diffieHellman.verifyError`

<!-- YAML
added: v0.11.12
-->

Битовое поле, содержащее любые предупреждения и / или ошибки, возникшие в результате проверки, выполненной во время инициализации `DiffieHellman` объект.

Следующие значения допустимы для этого свойства (как определено в `constants` модуль):

- `DH_CHECK_P_NOT_SAFE_PRIME`
- `DH_CHECK_P_NOT_PRIME`
- `DH_UNABLE_TO_CHECK_GENERATOR`
- `DH_NOT_SUITABLE_GENERATOR`

## Класс: `DiffieHellmanGroup`

<!-- YAML
added: v0.7.5
-->

В `DiffieHellmanGroup` class принимает в качестве аргумента хорошо известную группу modp. Работает так же, как `DiffieHellman`, за исключением того, что он не позволяет изменять свои ключи после создания. Другими словами, он не реализует `setPublicKey()` или `setPrivateKey()` методы.

```mjs
const { createDiffieHellmanGroup } = await import('crypto');
const dh = createDiffieHellmanGroup('modp1');
```

```cjs
const { createDiffieHellmanGroup } = require('crypto');
const dh = createDiffieHellmanGroup('modp1');
```

Имя (например, `'modp1'`) взято из [RFC 2412](https://www.rfc-editor.org/rfc/rfc2412.txt) (modp1 и 2) и [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt):

```console
$ perl -ne 'print "$1\n" if /"(modp\d+)"/' src/node_crypto_groups.h
modp1  #  768 bits
modp2  # 1024 bits
modp5  # 1536 bits
modp14 # 2048 bits
modp15 # etc.
modp16
modp17
modp18
```

## Класс: `ECDH`

<!-- YAML
added: v0.11.14
-->

В `ECDH` class - это утилита для создания обменов ключами Elliptic Curve Diffie-Hellman (ECDH).

Экземпляры `ECDH` класс можно создать с помощью [`crypto.createECDH()`](#cryptocreateecdhcurvename) функция.

```mjs
import assert from 'assert';

const { createECDH } = await import('crypto');

// Generate Alice's keys...
const alice = createECDH('secp521r1');
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = createECDH('secp521r1');
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

assert.strictEqual(
  aliceSecret.toString('hex'),
  bobSecret.toString('hex')
);
// OK
```

```cjs
const assert = require('assert');

const { createECDH } = require('crypto');

// Generate Alice's keys...
const alice = createECDH('secp521r1');
const aliceKey = alice.generateKeys();

// Generate Bob's keys...
const bob = createECDH('secp521r1');
const bobKey = bob.generateKeys();

// Exchange and generate the secret...
const aliceSecret = alice.computeSecret(bobKey);
const bobSecret = bob.computeSecret(aliceKey);

assert.strictEqual(
  aliceSecret.toString('hex'),
  bobSecret.toString('hex')
);
// OK
```

### Статический метод: `ECDH.convertKey(key, curve[, inputEncoding[, outputEncoding[, format]]])`

<!-- YAML
added: v10.0.0
-->

- `key` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `curve` {нить}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `key` нить.
- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- `format` {нить} **Дефолт:** `'uncompressed'`
- Возвращает: {Buffer | нить}

Преобразует открытый ключ EC Diffie-Hellman, указанный в `key` а также `curve` в формате, указанном `format`. В `format` аргумент указывает кодировку точки и может быть `'compressed'`, `'uncompressed'` или `'hybrid'`. Поставляемый ключ интерпретируется с использованием указанного `inputEncoding`, а возвращаемый ключ кодируется с использованием указанного `outputEncoding`.

Использовать [`crypto.getCurves()`](#cryptogetcurves) чтобы получить список доступных имен кривых. В последних выпусках OpenSSL `openssl ecparam -list_curves` также отобразит имя и описание каждой доступной эллиптической кривой.

Если `format` не указано точка будет возвращена в `'uncompressed'` формат.

Если `inputEncoding` не предусмотрено, `key` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

Пример (распаковка ключа):

```mjs
const { createECDH, ECDH } = await import('crypto');

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

// The converted key and the uncompressed public key should be the same
console.log(uncompressedKey === ecdh.getPublicKey('hex'));
```

```cjs
const { createECDH, ECDH } = require('crypto');

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

- `otherPublicKey` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `otherPublicKey` нить.
- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Вычисляет общий секрет, используя `otherPublicKey` в качестве открытого ключа другой стороны и возвращает вычисленный общий секрет. Поставляемый ключ интерпретируется с использованием указанного `inputEncoding`, а возвращаемый секрет кодируется с использованием указанного `outputEncoding`. Если `inputEncoding` не предусмотрено, `otherPublicKey` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

Если `outputEncoding` дана строка будет возвращена; в противном случае [`Buffer`](buffer.md) возвращается.

`ecdh.computeSecret` бросит `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY` ошибка когда `otherPublicKey` лежит вне эллиптической кривой. С `otherPublicKey` обычно предоставляется удаленным пользователем по незащищенной сети, не забудьте обработать это исключение соответствующим образом.

### `ecdh.generateKeys([encoding[, format]])`

<!-- YAML
added: v0.11.14
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- `format` {нить} **Дефолт:** `'uncompressed'`
- Возвращает: {Buffer | нить}

Создает частные и общедоступные значения ключей Диффи-Хеллмана EC и возвращает открытый ключ в указанном `format` а также `encoding`. Этот ключ следует передать другой стороне.

В `format` аргумент указывает кодировку точки и может быть `'compressed'` или `'uncompressed'`. Если `format` не указано, балл будет возвращен в `'uncompressed'` формат.

Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `ecdh.getPrivateKey([encoding])`

<!-- YAML
added: v0.11.14
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | string} EC Диффи-Хеллмана в указанном `encoding`.

Если `encoding` указывается, возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `ecdh.getPublicKey([encoding][, format])`

<!-- YAML
added: v0.11.14
-->

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- `format` {нить} **Дефолт:** `'uncompressed'`
- Возвращает: {Buffer | string} Открытый ключ EC Диффи-Хеллмана в указанном `encoding` а также `format`.

В `format` аргумент указывает кодировку точки и может быть `'compressed'` или `'uncompressed'`. Если `format` не указано точка будет возвращена в `'uncompressed'` формат.

Если `encoding` указывается, возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

### `ecdh.setPrivateKey(privateKey[, encoding])`

<!-- YAML
added: v0.11.14
-->

- `privateKey` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `privateKey` нить.

Устанавливает закрытый ключ EC Diffie-Hellman. Если `encoding` предоставлен, `privateKey` ожидается строка; иначе `privateKey` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

Если `privateKey` недействителен для указанной кривой, когда `ECDH` объект был создан, выдается ошибка. После установки закрытого ключа соответствующая общедоступная точка (ключ) также создается и устанавливается в `ECDH` объект.

### `ecdh.setPublicKey(publicKey[, encoding])`

<!-- YAML
added: v0.11.14
deprecated: v5.2.0
-->

> Стабильность: 0 - устарело

- `publicKey` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `publicKey` нить.

Устанавливает открытый ключ EC Diffie-Hellman. Если `encoding` предоставлен `publicKey` ожидается строка; в противном случае [`Buffer`](buffer.md), `TypedArray`, или `DataView` ожидается.

Обычно нет причин для вызова этого метода, потому что `ECDH` требуется только закрытый ключ и открытый ключ другой стороны для вычисления общего секрета. Обычно либо [`ecdh.generateKeys()`](#ecdhgeneratekeysencoding-format) или [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding) будет называться. В [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding) пытается сгенерировать открытую точку / ключ, связанный с устанавливаемым частным ключом.

Пример (получение общего секрета):

```mjs
const { createECDH, createHash } = await import('crypto');

const alice = createECDH('secp256k1');
const bob = createECDH('secp256k1');

// This is a shortcut way of specifying one of Alice's previous private
// keys. It would be unwise to use such a predictable private key in a real
// application.
alice.setPrivateKey(
  createHash('sha256').update('alice', 'utf8').digest()
);

// Bob uses a newly generated cryptographically strong
// pseudorandom key pair
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

// aliceSecret and bobSecret should be the same shared secret value
console.log(aliceSecret === bobSecret);
```

```cjs
const { createECDH, createHash } = require('crypto');

const alice = createECDH('secp256k1');
const bob = createECDH('secp256k1');

// This is a shortcut way of specifying one of Alice's previous private
// keys. It would be unwise to use such a predictable private key in a real
// application.
alice.setPrivateKey(
  createHash('sha256').update('alice', 'utf8').digest()
);

// Bob uses a newly generated cryptographically strong
// pseudorandom key pair
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

// aliceSecret and bobSecret should be the same shared secret value
console.log(aliceSecret === bobSecret);
```

## Класс: `Hash`

<!-- YAML
added: v0.1.92
-->

- Расширяется: {stream.Transform}

В `Hash` class - это утилита для создания хеш-дайджестов данных. Его можно использовать одним из двух способов:

- Как [транслировать](stream.md) который доступен как для чтения, так и для записи, когда данные записываются для создания вычисленного хеш-дайджеста на читаемой стороне, или
- С помощью [`hash.update()`](#hashupdatedata-inputencoding) а также [`hash.digest()`](#hashdigestencoding) методы для создания вычисленного хеша.

В [`crypto.createHash()`](#cryptocreatehashalgorithm-options) метод используется для создания `Hash` экземпляры. `Hash` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Пример: использование `Hash` объекты как потоки:

```mjs
const { createHash } = await import('crypto');

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

```cjs
const { createHash } = require('crypto');

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

Пример: использование `Hash` и конвейерные потоки:

```mjs
import { createReadStream } from 'fs';
import { stdout } from 'process';
const { createHash } = await import('crypto');

const hash = createHash('sha256');

const input = createReadStream('test.js');
input.pipe(hash).setEncoding('hex').pipe(stdout);
```

```cjs
const { createReadStream } = require('fs');
const { createHash } = require('crypto');
const { stdout } = require('process');

const hash = createHash('sha256');

const input = createReadStream('test.js');
input.pipe(hash).setEncoding('hex').pipe(stdout);
```

Пример: использование [`hash.update()`](#hashupdatedata-inputencoding) а также [`hash.digest()`](#hashdigestencoding) методы:

```mjs
const { createHash } = await import('crypto');

const hash = createHash('sha256');

hash.update('some data to hash');
console.log(hash.digest('hex'));
// Prints:
//   6a2da20943931e9834fc12cfe5bb47bbd9ae43489a30726962b576f4e3993e50
```

```cjs
const { createHash } = require('crypto');

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

- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
- Возвращает: {Hash}

Создает новый `Hash` объект, содержащий глубокую копию внутреннего состояния текущего `Hash` объект.

Необязательный `options` аргумент управляет поведением потока. Для хэш-функций XOF, таких как `'shake256'`, то `outputLength` Опция может использоваться для указания желаемой длины вывода в байтах.

Выдается ошибка при попытке скопировать `Hash` объект после его [`hash.digest()`](#hashdigestencoding) был вызван метод.

```mjs
// Calculate a rolling hash.
const { createHash } = await import('crypto');

const hash = createHash('sha256');

hash.update('one');
console.log(hash.copy().digest('hex'));

hash.update('two');
console.log(hash.copy().digest('hex'));

hash.update('three');
console.log(hash.copy().digest('hex'));

// Etc.
```

```cjs
// Calculate a rolling hash.
const { createHash } = require('crypto');

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

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Вычисляет дайджест всех данных, переданных для хеширования (с использованием [`hash.update()`](#hashupdatedata-inputencoding) метод). Если `encoding` предоставляется строка будет возвращена; в противном случае [`Buffer`](buffer.md) возвращается.

В `Hash` объект не может быть использован снова после `hash.digest()` был вызван метод. Множественные вызовы вызовут ошибку.

### `hash.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

- `data` {строка | буфер | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `data` нить.

Обновляет хеш-содержимое заданным `data`, кодировка которого приведена в `inputEncoding`. Если `encoding` не предусмотрено, а `data` это строка, кодировка `'utf8'` принудительно. Если `data` это [`Buffer`](buffer.md), `TypedArray`, или `DataView`, тогда `inputEncoding` игнорируется.

Это можно вызывать много раз с новыми данными во время потоковой передачи.

## Класс: `Hmac`

<!-- YAML
added: v0.1.94
-->

- Расширяется: {stream.Transform}

В `Hmac` class - это утилита для создания криптографических дайджестов HMAC. Его можно использовать одним из двух способов:

- Как [транслировать](stream.md) который доступен как для чтения, так и для записи, когда данные записываются для создания вычисленного дайджеста HMAC на читаемой стороне, или
- С помощью [`hmac.update()`](#hmacupdatedata-inputencoding) а также [`hmac.digest()`](#hmacdigestencoding) методы для создания вычисленного дайджеста HMAC.

В [`crypto.createHmac()`](#cryptocreatehmacalgorithm-key-options) метод используется для создания `Hmac` экземпляры. `Hmac` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Пример: использование `Hmac` объекты как потоки:

```mjs
const { createHmac } = await import('crypto');

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

```cjs
const { createHmac } = require('crypto');

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

Пример: использование `Hmac` и конвейерные потоки:

```mjs
import { createReadStream } from 'fs';
import { stdout } from 'process';
const { createHmac } = await import('crypto');

const hmac = createHmac('sha256', 'a secret');

const input = createReadStream('test.js');
input.pipe(hmac).pipe(stdout);
```

```cjs
const { createReadStream } = require('fs');
const { createHmac } = require('crypto');
const { stdout } = require('process');

const hmac = createHmac('sha256', 'a secret');

const input = createReadStream('test.js');
input.pipe(hmac).pipe(stdout);
```

Пример: использование [`hmac.update()`](#hmacupdatedata-inputencoding) а также [`hmac.digest()`](#hmacdigestencoding) методы:

```mjs
const { createHmac } = await import('crypto');

const hmac = createHmac('sha256', 'a secret');

hmac.update('some data to hash');
console.log(hmac.digest('hex'));
// Prints:
//   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
```

```cjs
const { createHmac } = require('crypto');

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

- `encoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

Вычисляет дайджест HMAC всех переданных данных, используя [`hmac.update()`](#hmacupdatedata-inputencoding). Если `encoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается;

В `Hmac` объект не может быть использован снова после `hmac.digest()` был вызван. Множественные звонки на `hmac.digest()` приведет к выдаче ошибки.

### `hmac.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.94
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

- `data` {строка | буфер | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `data` нить.

Обновляет `Hmac` доволен данным `data`, кодировка которого приведена в `inputEncoding`. Если `encoding` не предусмотрено, а `data` это строка, кодировка `'utf8'` принудительно. Если `data` это [`Buffer`](buffer.md), `TypedArray`, или `DataView`, тогда `inputEncoding` игнорируется.

Это можно вызывать много раз с новыми данными во время потоковой передачи.

## Класс: `KeyObject`

<!-- YAML
added: v11.6.0
changes:
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

Node.js использует `KeyObject` для представления симметричного или асимметричного ключа, и каждый вид ключа предоставляет разные функции. В [`crypto.createSecretKey()`](#cryptocreatesecretkeykey-encoding), [`crypto.createPublicKey()`](#cryptocreatepublickeykey) а также [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey) методы используются для создания `KeyObject` экземпляры. `KeyObject` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Большинству приложений следует рассмотреть возможность использования нового `KeyObject` API вместо передачи ключей в виде строк или `Buffer`s за счет улучшенных функций безопасности.

`KeyObject` экземпляры могут быть переданы в другие потоки через [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist). Приемник получает клонированный `KeyObject`, а `KeyObject` не нужно указывать в `transferList` аргумент.

### Статический метод: `KeyObject.from(key)`

<!-- YAML
added: v15.0.0
-->

- `key` {CryptoKey}
- Возвращает: {KeyObject}

Пример: преобразование `CryptoKey` экземпляр к `KeyObject`:

```mjs
const { webcrypto, KeyObject } = await import('crypto');
const { subtle } = webcrypto;

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
// Prints: 32 (symmetric key size in bytes)
```

```cjs
const {
  webcrypto: { subtle },
  KeyObject,
} = require('crypto');

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

- {Объект}
  - `modulusLength`: {число} Размер ключа в битах (RSA, DSA).
  - `publicExponent`: {bigint} Открытая экспонента (RSA).
  - `hashAlgorithm`: {строка} Имя дайджеста сообщения (RSA-PSS).
  - `mgf1HashAlgorithm`: {строка} Имя дайджеста сообщения, используемого MGF1 (RSA-PSS).
  - `saltLength`: {число} Минимальная длина соли в байтах (RSA-PSS).
  - `divisorLength`: {number} Размер `q` в битах (DSA).
  - `namedCurve`: {строка} Название кривой (EC).

Это свойство существует только для асимметричных ключей. В зависимости от типа ключа этот объект содержит информацию о ключе. Никакая информация, полученная с помощью этого свойства, не может использоваться для однозначной идентификации ключа или для нарушения безопасности ключа.

Для ключей RSA-PSS, если материал ключа содержит `RSASSA-PSS-params` последовательность, `hashAlgorithm`, `mgf1HashAlgorithm`, а также `saltLength` свойства будут установлены.

Другие ключевые детали могут быть представлены через этот API с использованием дополнительных атрибутов.

### `keyObject.asymmetricKeyType`

<!-- YAML
added: v11.6.0
changes:
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

- {нить}

Для асимметричных ключей это свойство представляет тип ключа. Поддерживаемые типы ключей:

- `'rsa'` (OID 1.2.840.113549.1.1.1)
- `'rsa-pss'` (OID 1.2.840.113549.1.1.10)
- `'dsa'` (OID 1.2.840.10040.4.1)
- `'ec'` (OID 1.2.840.10045.2.1)
- `'x25519'` (OID 1.3.101.110)
- `'x448'` (OID 1.3.101.111)
- `'ed25519'` (OID 1.3.101.112)
- `'ed448'` (OID 1.3.101.113)
- `'dh'` (OID 1.2.840.113549.1.3.1)

Это свойство `undefined` для непризнанных `KeyObject` типы и симметричные ключи.

### `keyObject.export([options])`

<!-- YAML
added: v11.6.0
changes:
  - version: v15.9.0
    pr-url: https://github.com/nodejs/node/pull/37081
    description: Added support for `'jwk'` format.
-->

- `options`: {Объект}
- Возвращает: {строка | Буфер | Объект}

Для симметричных ключей можно использовать следующие варианты кодирования:

- `format`: {строка} Должно быть `'buffer'` (по умолчанию) или `'jwk'`.

Для открытых ключей могут использоваться следующие варианты кодирования:

- `type`: {строка} Должен быть одним из `'pkcs1'` (Только RSA) или `'spki'`.
- `format`: {строка} Должно быть `'pem'`, `'der'`, или `'jwk'`.

Для закрытых ключей можно использовать следующие параметры кодирования:

- `type`: {строка} Должен быть одним из `'pkcs1'` (Только RSA), `'pkcs8'` или `'sec1'` (Только ЕС).
- `format`: {строка} Должно быть `'pem'`, `'der'`, или `'jwk'`.
- `cipher`: {строка} Если указано, закрытый ключ будет зашифрован заданным `cipher` а также `passphrase` с использованием шифрования на основе пароля PKCS # 5 v2.0.
- `passphrase`: {строка | Buffer} Парольная фраза для шифрования, см. `cipher`.

Тип результата зависит от выбранного формата кодирования, когда PEM результатом является строка, когда DER это будет буфер, содержащий данные, закодированные как DER, когда [JWK](https://tools.ietf.org/html/rfc7517) это будет объект.

Когда [JWK](https://tools.ietf.org/html/rfc7517) был выбран формат кодирования, все остальные параметры кодирования игнорируются.

Ключи типа PKCS # 1, SEC1 и PKCS # 8 могут быть зашифрованы с помощью комбинации `cipher` а также `format` параметры. PKCS # 8 `type` можно использовать с любым `format` для шифрования любого ключевого алгоритма (RSA, EC или DH), указав `cipher`. PKCS # 1 и SEC1 можно зашифровать, только указав `cipher` когда PEM `format` используется. Для максимальной совместимости используйте PKCS # 8 для зашифрованных закрытых ключей. Поскольку PKCS # 8 определяет свой собственный механизм шифрования, шифрование на уровне PEM не поддерживается при шифровании ключа PKCS # 8. Видеть [RFC 5208](https://www.rfc-editor.org/rfc/rfc5208.txt) для шифрования PKCS # 8 и [RFC 1421](https://www.rfc-editor.org/rfc/rfc1421.txt) для шифрования PKCS # 1 и SEC1.

### `keyObject.symmetricKeySize`

<!-- YAML
added: v11.6.0
-->

- {количество}

Для секретных ключей это свойство представляет размер ключа в байтах. Это свойство `undefined` для асимметричных ключей.

### `keyObject.type`

<!-- YAML
added: v11.6.0
-->

- {нить}

В зависимости от типа этого `KeyObject`, это свойство либо `'secret'` для секретных (симметричных) ключей, `'public'` для публичных (асимметричных) ключей или `'private'` для приватных (асимметричных) ключей.

## Класс: `Sign`

<!-- YAML
added: v0.1.92
-->

- Расширяется: {stream.Writable}

В `Sign` class - это утилита для генерации подписей. Его можно использовать одним из двух способов:

- Как записываемый [транслировать](stream.md), где записываются подписываемые данные и [`sign.sign()`](#signsignprivatekey-outputencoding) используется для генерации и возврата подписи, или
- С помощью [`sign.update()`](#signupdatedata-inputencoding) а также [`sign.sign()`](#signsignprivatekey-outputencoding) методы для создания подписи.

В [`crypto.createSign()`](#cryptocreatesignalgorithm-options) метод используется для создания `Sign` экземпляры. Аргумент - это строковое имя используемой хеш-функции. `Sign` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Пример: использование `Sign` а также [`Verify`](#class-verify) объекты как потоки:

```mjs
const {
  generateKeyPairSync,
  createSign,
  createVerify,
} = await import('crypto');

const { privateKey, publicKey } = generateKeyPairSync(
  'ec',
  {
    namedCurve: 'sect239k1',
  }
);

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

```cjs
const {
  generateKeyPairSync,
  createSign,
  createVerify,
} = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync(
  'ec',
  {
    namedCurve: 'sect239k1',
  }
);

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

Пример: использование [`sign.update()`](#signupdatedata-inputencoding) а также [`verify.update()`](#verifyupdatedata-inputencoding) методы:

```mjs
const {
  generateKeyPairSync,
  createSign,
  createVerify,
} = await import('crypto');

const { privateKey, publicKey } = generateKeyPairSync(
  'rsa',
  {
    modulusLength: 2048,
  }
);

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

```cjs
const {
  generateKeyPairSync,
  createSign,
  createVerify,
} = require('crypto');

const { privateKey, publicKey } = generateKeyPairSync(
  'rsa',
  {
    modulusLength: 2048,
  }
);

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

<!--lint disable maximum-line-length remark-lint-->

- `privateKey` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
  - `dsaEncoding` {нить}
  - `padding` {целое число}
  - `saltLength` {целое число}
- `outputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) возвращаемого значения.
- Возвращает: {Buffer | нить}

<!--lint enable maximum-line-length remark-lint-->

Вычисляет подпись для всех передаваемых данных, используя либо [`sign.update()`](#signupdatedata-inputencoding) или [`sign.write()`](stream.md#writablewritechunk-encoding-callback).

Если `privateKey` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `privateKey` был передан [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, можно передать следующие дополнительные свойства:

- `dsaEncoding` {строка} Для DSA и ECDSA этот параметр определяет формат сгенерированной подписи. Это может быть одно из следующих значений:
  - `'der'` (по умолчанию): кодирование структуры подписи ASN.1 в формате DER `(r, s)`.
  - `'ieee-p1363'`: Формат подписи `r || s` как предложено в IEEE-P1363.
- `padding` {integer} Необязательное значение заполнения для RSA, одно из следующих:

  - `crypto.constants.RSA_PKCS1_PADDING` (дефолт)
  - `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая использовалась для подписи сообщения, как указано в разделе 3.1. [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt), если только хэш-функция MGF1 не была указана как часть ключа в соответствии с разделом 3.3 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

- `saltLength` {integer} Длина соли при заполнении `RSA_PKCS1_PSS_PADDING`. Особая ценность `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли по размеру переваривания, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) устанавливает максимально допустимое значение.

Если `outputEncoding` при условии, что возвращается строка; в противном случае [`Buffer`](buffer.md) возвращается.

В `Sign` объект не может быть снова использован после `sign.sign()` был вызван метод. Множественные звонки на `sign.sign()` приведет к выдаче ошибки.

### `sign.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

- `data` {строка | буфер | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `data` нить.

Обновляет `Sign` доволен данным `data`, кодировка которого приведена в `inputEncoding`. Если `encoding` не предусмотрено, а `data` это строка, кодировка `'utf8'` принудительно. Если `data` это [`Buffer`](buffer.md), `TypedArray`, или `DataView`, тогда `inputEncoding` игнорируется.

Это можно вызывать много раз с новыми данными во время потоковой передачи.

## Класс: `Verify`

<!-- YAML
added: v0.1.92
-->

- Расширяется: {stream.Writable}

В `Verify` class - это утилита для проверки подписей. Его можно использовать одним из двух способов:

- Как записываемый [транслировать](stream.md) если письменные данные используются для проверки поставленной подписи, или
- С помощью [`verify.update()`](#verifyupdatedata-inputencoding) а также [`verify.verify()`](#verifyverifyobject-signature-signatureencoding) методы проверки подписи.

В [`crypto.createVerify()`](#cryptocreateverifyalgorithm-options) метод используется для создания `Verify` экземпляры. `Verify` объекты не должны создаваться напрямую с помощью `new` ключевое слово.

Видеть [`Sign`](#class-sign) Например.

### `verify.update(data[, inputEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5522
    description: The default `inputEncoding` changed from `binary` to `utf8`.
-->

- `data` {строка | буфер | TypedArray | DataView}
- `inputEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `data` нить.

Обновляет `Verify` доволен данным `data`, кодировка которого приведена в `inputEncoding`. Если `inputEncoding` не предусмотрено, а `data` это строка, кодировка `'utf8'` принудительно. Если `data` это [`Buffer`](buffer.md), `TypedArray`, или `DataView`, тогда `inputEncoding` игнорируется.

Это можно вызывать много раз с новыми данными во время потоковой передачи.

### `verify.verify(object, signature[, signatureEncoding])`

<!-- YAML
added: v0.1.92
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The object can also be an ArrayBuffer and CryptoKey.
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

<!--lint disable maximum-line-length remark-lint-->

- `object` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
  - `dsaEncoding` {нить}
  - `padding` {целое число}
  - `saltLength` {целое число}
- `signature` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `signatureEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `signature` нить.
- Возвращает: {логическое} `true` или `false` в зависимости от действительности подписи для данных и открытого ключа.

<!--lint enable maximum-line-length remark-lint-->

Проверяет предоставленные данные, используя указанный `object` а также `signature`.

Если `object` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `object` был передан [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, можно передать следующие дополнительные свойства:

- `dsaEncoding` {строка} Для DSA и ECDSA этот параметр определяет формат подписи. Это может быть одно из следующих значений:
  - `'der'` (по умолчанию): кодирование структуры подписи ASN.1 в формате DER `(r, s)`.
  - `'ieee-p1363'`: Формат подписи `r || s` как предложено в IEEE-P1363.
- `padding` {integer} Необязательное значение заполнения для RSA, одно из следующих:

  - `crypto.constants.RSA_PKCS1_PADDING` (дефолт)
  - `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая использовалась для проверки сообщения, как указано в разделе 3.1. [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt), если только хэш-функция MGF1 не была указана как часть ключа в соответствии с разделом 3.3 [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

- `saltLength` {integer} Длина соли при заполнении `RSA_PKCS1_PSS_PADDING`. Особая ценность `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли по размеру переваривания, `crypto.constants.RSA_PSS_SALTLEN_AUTO` (по умолчанию) определяет его автоматически.

В `signature` аргумент - это ранее вычисленная подпись для данных в `signatureEncoding`. Если `signatureEncoding` указано, `signature` ожидается строка; иначе `signature` ожидается, что это будет [`Buffer`](buffer.md), `TypedArray`, или `DataView`.

В `verify` объект не может быть использован снова после `verify.verify()` был вызван. Множественные звонки на `verify.verify()` приведет к выдаче ошибки.

Поскольку открытые ключи могут быть получены из закрытых ключей, закрытый ключ может быть передан вместо открытого ключа.

## Класс: `X509Certificate`

<!-- YAML
added: v15.6.0
-->

Инкапсулирует сертификат X509 и предоставляет доступ только для чтения к его информации.

```mjs
const { X509Certificate } = await import('crypto');

const x509 = new X509Certificate(
  '{... pem encoded cert ...}'
);

console.log(x509.subject);
```

```cjs
const { X509Certificate } = require('crypto');

const x509 = new X509Certificate(
  '{... pem encoded cert ...}'
);

console.log(x509.subject);
```

### `new X509Certificate(buffer)`

<!-- YAML
added: v15.6.0
-->

- `buffer` {string | TypedArray | Buffer | DataView} Сертификат X509 в кодировке PEM или DER.

### `x509.ca`

<!-- YAML
added: v15.6.0
-->

- Тип: {boolean} Будет `true` если это сертификат центра сертификации (CA).

### `x509.checkEmail(email[, options])`

<!-- YAML
added: v15.6.0
-->

- `email` {нить}
- `options` {Объект}
  - `subject` {нить} `'always'` или `'never'`. **Дефолт:** `'always'`.
  - `wildcards` {логический} **Дефолт:** `true`.
  - `partialWildcards` {логический} **Дефолт:** `true`.
  - `multiLabelWildcards` {логический} **Дефолт:** `false`.
  - `singleLabelSubdomains` {логический} **Дефолт:** `false`.
- Возвраты: {строка | undefined} Возвраты `email` если сертификат совпадает, `undefined` если это не так.

Проверяет, соответствует ли сертификат указанному адресу электронной почты.

### `x509.checkHost(name[, options])`

<!-- YAML
added: v15.6.0
-->

- `name` {нить}
- `options` {Объект}
  - `subject` {нить} `'always'` или `'never'`. **Дефолт:** `'always'`.
  - `wildcards` {логический} **Дефолт:** `true`.
  - `partialWildcards` {логический} **Дефолт:** `true`.
  - `multiLabelWildcards` {логический} **Дефолт:** `false`.
  - `singleLabelSubdomains` {логический} **Дефолт:** `false`.
- Возвраты: {строка | undefined} Возвраты `name` если сертификат совпадает, `undefined` если это не так.

Проверяет, соответствует ли сертификат заданному имени хоста.

### `x509.checkIP(ip[, options])`

<!-- YAML
added: v15.6.0
-->

- `ip` {нить}
- `options` {Объект}
  - `subject` {нить} `'always'` или `'never'`. **Дефолт:** `'always'`.
  - `wildcards` {логический} **Дефолт:** `true`.
  - `partialWildcards` {логический} **Дефолт:** `true`.
  - `multiLabelWildcards` {логический} **Дефолт:** `false`.
  - `singleLabelSubdomains` {логический} **Дефолт:** `false`.
- Возвраты: {строка | undefined} Возвраты `ip` если сертификат совпадает, `undefined` если это не так.

Проверяет, соответствует ли сертификат заданному IP-адресу (IPv4 или IPv6).

### `x509.checkIssued(otherCert)`

<!-- YAML
added: v15.6.0
-->

- `otherCert` {X509Certificate}
- Возвращает: {логическое}

Проверяет, выдан ли данный сертификат данным `otherCert`.

### `x509.checkPrivateKey(privateKey)`

<!-- YAML
added: v15.6.0
-->

- `privateKey` {KeyObject} Закрытый ключ.
- Возвращает: {логическое}

Проверяет, соответствует ли открытый ключ этого сертификата заданному закрытому ключу.

### `x509.fingerprint`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Отпечаток SHA-1 этого сертификата.

### `x509.fingerprint256`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Отпечаток этого сертификата SHA-256.

### `x509.infoAccess`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Содержание доступа к информации этого сертификата.

### `x509.issuer`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Идентификация эмитента, включенная в этот сертификат.

### `x509.issuerCertificate`

<!-- YAML
added: v15.9.0
-->

- Тип: {X509Certificate}

Сертификат эмитента или `undefined` если сертификат эмитента недоступен.

### `x509.keyUsage`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка \[]}

Массив с подробным описанием использования ключей для этого сертификата.

### `x509.publicKey`

<!-- YAML
added: v15.6.0
-->

- Тип: {KeyObject}

Открытый ключ {KeyObject} для этого сертификата.

### `x509.raw`

<!-- YAML
added: v15.6.0
-->

- Тип: {Buffer}

А `Buffer` содержащий кодировку DER этого сертификата.

### `x509.serialNumber`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Серийный номер этого сертификата.

### `x509.subject`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Полная тема этого сертификата.

### `x509.subjectAltName`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Альтернативное имя субъекта, указанное для этого сертификата.

### `x509.toJSON()`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Для сертификатов X509 нет стандартной кодировки JSON. В `toJSON()` Метод возвращает строку, содержащую сертификат в кодировке PEM.

### `x509.toLegacyObject()`

<!-- YAML
added: v15.6.0
-->

- Тип: {Object}

Возвращает информацию об этом сертификате с использованием устаревшего [объект сертификата](tls.md#certificate-object) кодирование.

### `x509.toString()`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Возвращает сертификат в кодировке PEM.

### `x509.validFrom`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Дата / время, с которого этот сертификат считается действительным.

### `x509.validTo`

<!-- YAML
added: v15.6.0
-->

- Тип: {строка}

Дата / время, до которых этот сертификат считается действительным.

### `x509.verify(publicKey)`

<!-- YAML
added: v15.6.0
-->

- `publicKey` {KeyObject} Открытый ключ.
- Возвращает: {логическое}

Проверяет, что этот сертификат был подписан данным открытым ключом. Никаких других проверок сертификата не выполняет.

## `crypto` методы и свойства модуля

### `crypto.constants`

<!-- YAML
added: v6.3.0
-->

- Возвращает: {Object} Объект, содержащий часто используемые константы для операций, связанных с шифрованием и безопасностью. Конкретные определенные в настоящее время константы описаны в [Константы криптографии](#crypto-constants).

### `crypto.DEFAULT_ENCODING`

<!-- YAML
added: v0.9.3
deprecated: v10.0.0
-->

> Стабильность: 0 - устарело

Кодировка по умолчанию, используемая для функций, которые могут принимать либо строки, либо [буферы](buffer.md). Значение по умолчанию - `'buffer'`, что делает методы по умолчанию равными [`Buffer`](buffer.md) объекты.

В `crypto.DEFAULT_ENCODING` предусмотрен механизм обратной совместимости с устаревшими программами, которые ожидают `'latin1'` быть кодировкой по умолчанию.

Новые приложения должны ожидать, что по умолчанию будет `'buffer'`.

Это свойство устарело.

### `crypto.fips`

<!-- YAML
added: v6.0.0
deprecated: v10.0.0
-->

> Стабильность: 0 - устарело

Свойство для проверки и контроля того, используется ли в настоящее время поставщик шифрования, совместимый с FIPS. Для установки значения true требуется сборка Node.js.

Это свойство устарело. Пожалуйста, используйте `crypto.setFips()` а также `crypto.getFips()` вместо.

### `crypto.checkPrime(candidate[, options, [callback]])`

<!-- YAML
added: v15.8.0
-->

- `candidate` {ArrayBuffer | SharedArrayBuffer | TypedArray | Buffer | DataView | bigint} Возможный простой, закодированный как последовательность октетов с прямым порядком байтов произвольной длины.
- `options` {Объект}
  - `checks` {number} Число итераций вероятностной простоты Миллера-Рабина, которые необходимо выполнить. Когда значение `0` (ноль), используется ряд проверок, которые дают количество ложных срабатываний не более 2<sup>-64</sup> для случайного ввода. Следует проявлять осторожность при выборе ряда проверок. Обратитесь к документации OpenSSL для [`BN_is_prime_ex`](https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html) функция `nchecks` варианты для более подробной информации. **Дефолт:** `0`
- `callback` {Функция}
  - `err` {Ошибка} Установите объект {Ошибка}, если во время проверки произошла ошибка.
  - `result` {логический} `true` если кандидат простое число с вероятностью ошибки меньше, чем `0.25 ** options.checks`.

Проверяет первичность `candidate`.

### `crypto.checkPrimeSync(candidate[, options])`

<!-- YAML
added: v15.8.0
-->

- `candidate` {ArrayBuffer | SharedArrayBuffer | TypedArray | Buffer | DataView | bigint} Возможный простой, закодированный как последовательность октетов с прямым порядком байтов произвольной длины.
- `options` {Объект}
  - `checks` {number} Число итераций вероятностной простоты Миллера-Рабина, которые необходимо выполнить. Когда значение `0` (ноль), используется ряд проверок, которые дают количество ложных срабатываний не более 2<sup>-64</sup> для случайного ввода. Следует проявлять осторожность при выборе ряда проверок. Обратитесь к документации OpenSSL для [`BN_is_prime_ex`](https://www.openssl.org/docs/man1.1.1/man3/BN_is_prime_ex.html) функция `nchecks` варианты для более подробной информации. **Дефолт:** `0`
- Возвращает: {логическое} `true` если кандидат простое число с вероятностью ошибки меньше, чем `0.25 ** options.checks`.

Проверяет первичность `candidate`.

### `crypto.createCipher(algorithm, password[, options])`

<!-- YAML
added: v0.1.94
deprecated: v10.0.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The password argument can be an ArrayBuffer and is limited to
                 a maximum of 2 ** 31 - 1 bytes.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/21447
    description: Ciphers in OCB mode are now supported.
  - version: v10.2.0
    pr-url: https://github.com/nodejs/node/pull/20235
    description: The `authTagLength` option can now be used to produce shorter
                 authentication tags in GCM mode and defaults to 16 bytes.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) вместо.

- `algorithm` {нить}
- `password` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
- Возвращает: {Cipher}

Создает и возвращает `Cipher` объект, который использует данный `algorithm` а также `password`.

В `options` аргумент управляет поведением потока и является необязательным, кроме случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае `authTagLength` опция обязательна и определяет длину тега аутентификации в байтах, см. [CCM режим](#ccm-mode). В режиме GCM `authTagLength` опция не требуется, но может использоваться для установки длины тега аутентификации, который будет возвращен `getAuthTag()` и по умолчанию 16 байт.

В `algorithm` зависит от OpenSSL, примеры: `'aes192'`и т. д. В последних выпусках OpenSSL, `openssl list -cipher-algorithms` (`openssl list-cipher-algorithms` для более старых версий OpenSSL) отобразит доступные алгоритмы шифрования.

В `password` используется для получения ключа шифрования и вектора инициализации (IV). Значение должно быть либо `'latin1'` закодированная строка, a [`Buffer`](buffer.md), а `TypedArray`, или `DataView`.

Реализация `crypto.createCipher()` извлекает ключи с помощью функции OpenSSL [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html) с алгоритмом дайджеста, установленным на MD5, одной итерацией и без соли. Отсутствие соли позволяет атаковать по словарю, поскольку один и тот же пароль всегда создает один и тот же ключ. Малое количество итераций и некриптографически безопасный алгоритм хеширования позволяют очень быстро проверять пароли.

В соответствии с рекомендацией OpenSSL использовать более современный алгоритм вместо [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html) Разработчикам рекомендуется получить ключ и IV самостоятельно, используя [`crypto.scrypt()`](#cryptoscryptpassword-salt-keylen-options-callback) и использовать [`crypto.createCipheriv()`](#cryptocreatecipherivalgorithm-key-iv-options) создать `Cipher` объект. Пользователи не должны использовать шифры с режимом счетчика (например, CTR, GCM или CCM) в `crypto.createCipher()`. Когда они используются, выдается предупреждение, чтобы избежать риска повторного использования IV, вызывающего уязвимости. Для случая, когда IV повторно используется в GCM, см. [Непринятие неуважения к противникам]() для подробностей.

### `crypto.createCipheriv(algorithm, key, iv[, options])`

<!-- YAML
added: v0.1.94
changes:
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
    description: The cipher `chacha20-poly1305` is now supported.
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

- `algorithm` {нить}
- `key` {строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
- `iv` {строка | ArrayBuffer | Buffer | TypedArray | DataView | null}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
- Возвращает: {Cipher}

Создает и возвращает `Cipher` объект, с данным `algorithm`, `key` и вектор инициализации (`iv`).

В `options` аргумент управляет поведением потока и является необязательным, кроме случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае `authTagLength` опция обязательна и определяет длину тега аутентификации в байтах, см. [CCM режим](#ccm-mode). В режиме GCM `authTagLength` опция не требуется, но может использоваться для установки длины тега аутентификации, который будет возвращен `getAuthTag()` и по умолчанию 16 байт.

В `algorithm` зависит от OpenSSL, примеры: `'aes192'`и т. д. В последних выпусках OpenSSL, `openssl list -cipher-algorithms` (`openssl list-cipher-algorithms` для более старых версий OpenSSL) отобразит доступные алгоритмы шифрования.

В `key` необработанный ключ, используемый `algorithm` а также `iv` является [вектор инициализации](https://en.wikipedia.org/wiki/Initialization_vector). Оба аргумента должны быть `'utf8'` закодированные строки, [Буферы](buffer.md), `TypedArray`, или `DataView`с. В `key` может при желании быть [`KeyObject`](#class-keyobject) типа `secret`. Если шифру не нужен вектор инициализации, `iv` может быть `null`.

При передаче строк для `key` или `iv`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Векторы инициализации должны быть непредсказуемыми и уникальными; в идеале они будут криптографически случайными. Они не обязательно должны быть секретными: IV обычно просто добавляются к сообщениям с зашифрованным текстом в незашифрованном виде. Может показаться противоречивым, что что-то должно быть непредсказуемым и уникальным, но не обязательно секретным; помните, что злоумышленник не должен иметь возможность заранее предсказать, каким будет данный IV.

### `crypto.createDecipher(algorithm, password[, options])`

<!-- YAML
added: v0.1.94
deprecated: v10.0.0
changes:
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/21447
    description: Ciphers in OCB mode are now supported.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options) вместо.

- `algorithm` {нить}
- `password` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
- Возвращает: {Decipher}

Создает и возвращает `Decipher` объект, который использует данный `algorithm` а также `password` (ключ).

В `options` аргумент управляет поведением потока и является необязательным, кроме случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае `authTagLength` опция обязательна и определяет длину тега аутентификации в байтах, см. [CCM режим](#ccm-mode).

Реализация `crypto.createDecipher()` извлекает ключи с помощью функции OpenSSL [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html) с алгоритмом дайджеста, установленным на MD5, одной итерацией и без соли. Отсутствие соли позволяет атаковать по словарю, поскольку один и тот же пароль всегда создает один и тот же ключ. Малое количество итераций и некриптографически безопасный алгоритм хеширования позволяют очень быстро проверять пароли.

В соответствии с рекомендацией OpenSSL использовать более современный алгоритм вместо [`EVP_BytesToKey`](https://www.openssl.org/docs/man1.1.0/crypto/EVP_BytesToKey.html) Разработчикам рекомендуется получить ключ и IV самостоятельно, используя [`crypto.scrypt()`](#cryptoscryptpassword-salt-keylen-options-callback) и использовать [`crypto.createDecipheriv()`](#cryptocreatedecipherivalgorithm-key-iv-options) создать `Decipher` объект.

### `crypto.createDecipheriv(algorithm, key, iv[, options])`

<!-- YAML
added: v0.1.94
changes:
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `key` argument can now be a `KeyObject`.
  - version:
     - v11.2.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/24081
    description: The cipher `chacha20-poly1305` is now supported.
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

- `algorithm` {нить}
- `key` {строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
- `iv` {строка | ArrayBuffer | Buffer | TypedArray | DataView | null}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
- Возвращает: {Decipher}

Создает и возвращает `Decipher` объект, который использует данный `algorithm`, `key` и вектор инициализации (`iv`).

В `options` аргумент управляет поведением потока и является необязательным, кроме случаев, когда используется шифр в режиме CCM или OCB (например, `'aes-128-ccm'`). В этом случае `authTagLength` опция обязательна и определяет длину тега аутентификации в байтах, см. [CCM режим](#ccm-mode). В режиме GCM `authTagLength` опция не требуется, но может использоваться для ограничения принятых тегов аутентификации тегами с указанной длиной.

В `algorithm` зависит от OpenSSL, примеры: `'aes192'`и т. д. В последних выпусках OpenSSL, `openssl list -cipher-algorithms` (`openssl list-cipher-algorithms` для более старых версий OpenSSL) отобразит доступные алгоритмы шифрования.

В `key` необработанный ключ, используемый `algorithm` а также `iv` является [вектор инициализации](https://en.wikipedia.org/wiki/Initialization_vector). Оба аргумента должны быть `'utf8'` закодированные строки, [Буферы](buffer.md), `TypedArray`, или `DataView`с. В `key` может при желании быть [`KeyObject`](#class-keyobject) типа `secret`. Если шифру не нужен вектор инициализации, `iv` может быть `null`.

При передаче строк для `key` или `iv`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Векторы инициализации должны быть непредсказуемыми и уникальными; в идеале они будут криптографически случайными. Они не обязательно должны быть секретными: IV обычно просто добавляются к сообщениям с зашифрованным текстом в незашифрованном виде. Может показаться противоречивым, что что-то должно быть непредсказуемым и уникальным, но не обязательно секретным; помните, что злоумышленник не должен иметь возможность заранее предсказать, каким будет данный IV.

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

- `prime` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `primeEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `prime` нить.
- `generator` {число | строка | ArrayBuffer | Buffer | TypedArray | DataView} **Дефолт:** `2`
- `generatorEncoding` {строка} [кодирование](buffer.md#buffers-and-character-encodings) принадлежащий `generator` нить.
- Возвращает: {DiffieHellman}

Создает `DiffieHellman` объект обмена ключами с использованием прилагаемого `prime` и необязательный конкретный `generator`.

В `generator` аргумент может быть числом, строкой или [`Buffer`](buffer.md). Если `generator` не указано, значение `2` используется.

Если `primeEncoding` указано, `prime` ожидается строка; в противном случае [`Buffer`](buffer.md), `TypedArray`, или `DataView` ожидается.

Если `generatorEncoding` указано, `generator` ожидается строка; в противном случае число, [`Buffer`](buffer.md), `TypedArray`, или `DataView` ожидается.

### `crypto.createDiffieHellman(primeLength[, generator])`

<!-- YAML
added: v0.5.0
-->

- `primeLength` {количество}
- `generator` {количество} **Дефолт:** `2`
- Возвращает: {DiffieHellman}

Создает `DiffieHellman` объект обмена ключами и генерирует начальное число `primeLength` биты с использованием необязательного конкретного числового `generator`. Если `generator` не указано, значение `2` используется.

### `crypto.createDiffieHellmanGroup(name)`

<!-- YAML
added: v0.9.3
-->

- `name` {нить}
- Возвращает: {DiffieHellmanGroup}

Псевдоним для [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname)

### `crypto.createECDH(curveName)`

<!-- YAML
added: v0.11.14
-->

- `curveName` {нить}
- Возвращает: {ECDH}

Создает эллиптическую кривую Диффи-Хеллмана (`ECDH`) объект обмена ключами, использующий предопределенную кривую, заданную параметром `curveName` нить. Использовать [`crypto.getCurves()`](#cryptogetcurves) чтобы получить список доступных имен кривых. В последних выпусках OpenSSL `openssl ecparam -list_curves` также отобразит имя и описание каждой доступной эллиптической кривой.

### `crypto.createHash(algorithm[, options])`

<!-- YAML
added: v0.1.92
changes:
  - version: v12.8.0
    pr-url: https://github.com/nodejs/node/pull/28805
    description: The `outputLength` option was added for XOF hash functions.
-->

- `algorithm` {нить}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
- Возвращает: {Hash}

Создает и возвращает `Hash` объект, который можно использовать для генерации хеш-дайджестов с использованием заданного `algorithm`. По желанию `options` аргумент управляет поведением потока. Для хэш-функций XOF, таких как `'shake256'`, то `outputLength` Опция может использоваться для указания желаемой длины вывода в байтах.

В `algorithm` зависит от доступных алгоритмов, поддерживаемых версией OpenSSL на платформе. Примеры `'sha256'`, `'sha512'`и т. д. В последних выпусках OpenSSL, `openssl list -digest-algorithms` (`openssl list-message-digest-algorithms` для более старых версий OpenSSL) отобразит доступные алгоритмы дайджеста.

Пример: создание суммы sha256 файла

```mjs
import { createReadStream } from 'fs';
import { argv } from 'process';
const { createHash } = await import('crypto');

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
const { createReadStream } = require('fs');
const { createHash } = require('crypto');
const { argv } = require('process');

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

### `crypto.createHmac(algorithm, key[, options])`

<!-- YAML
added: v0.1.94
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer or CryptoKey. The
                 encoding option was added. The key cannot contain
                 more than 2 ** 32 - 1 bytes.
  - version: v11.6.0
    pr-url: https://github.com/nodejs/node/pull/24234
    description: The `key` argument can now be a `KeyObject`.
-->

- `algorithm` {нить}
- `key` {строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
- `options` {Объект} [`stream.transform` параметры](stream.md#new-streamtransformoptions)
  - `encoding` {строка} Кодировка строки, используемая, когда `key` это строка.
- Возвращает: {Hmac}

Создает и возвращает `Hmac` объект, который использует данный `algorithm` а также `key`. По желанию `options` аргумент управляет поведением потока.

В `algorithm` зависит от доступных алгоритмов, поддерживаемых версией OpenSSL на платформе. Примеры `'sha256'`, `'sha512'`и т. д. В последних выпусках OpenSSL, `openssl list -digest-algorithms` (`openssl list-message-digest-algorithms` для более старых версий OpenSSL) отобразит доступные алгоритмы дайджеста.

В `key` - ключ HMAC, используемый для генерации криптографического хэша HMAC. Если это [`KeyObject`](#class-keyobject), его тип должен быть `secret`.

Пример: создание sha256 HMAC файла

```mjs
import { createReadStream } from 'fs';
import { argv } from 'process';
const { createHmac } = await import('crypto');

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
const { createReadStream } = require('fs');
const { createHmac } = require('crypto');
const { argv } = require('process');

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

### `crypto.createPrivateKey(key)`

<!-- YAML
added: v11.6.0
changes:
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37254
    description: The key can also be a JWK object.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer. The encoding option was
                 added. The key cannot contain more than 2 ** 32 - 1 bytes.
-->

<!--lint disable maximum-line-length remark-lint-->

- `key` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView}
  - `key`: {строка | ArrayBuffer | Buffer | TypedArray | DataView | Object} Ключевой материал в формате PEM, DER или JWK.
  - `format`: {строка} Должно быть `'pem'`, `'der'`, или '`'jwk'`. **Дефолт:** `'pem'`.
  - `type`: {строка} Должно быть `'pkcs1'`, `'pkcs8'` или `'sec1'`. Эта опция требуется только в том случае, если `format` является `'der'` и игнорируется в противном случае.
  - `passphrase`: {строка | Buffer} Кодовая фраза для расшифровки.
  - `encoding`: {строка} Кодировка строки, используемая, когда `key` это строка.
- Возвращает: {KeyObject}

<!--lint enable maximum-line-length remark-lint-->

Создает и возвращает новый ключевой объект, содержащий закрытый ключ. Если `key` это строка или `Buffer`, `format` предполагается, что это `'pem'`; иначе, `key` должен быть объектом со свойствами, описанными выше.

Если закрытый ключ зашифрован, `passphrase` необходимо указать. Длина ключевой фразы ограничена 1024 байтами.

### `crypto.createPublicKey(key)`

<!-- YAML
added: v11.6.0
changes:
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

<!--lint disable maximum-line-length remark-lint-->

- `key` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView}
  - `key`: {строка | ArrayBuffer | Buffer | TypedArray | DataView | Object} Ключевой материал в формате PEM, DER или JWK.
  - `format`: {строка} Должно быть `'pem'`, `'der'`, или `'jwk'`. **Дефолт:** `'pem'`.
  - `type`: {строка} Должно быть `'pkcs1'` или `'spki'`. Эта опция требуется только в том случае, если `format` является `'der'` и игнорируется в противном случае.
  - `encoding` {строка} Кодировка строки, используемая, когда `key` это строка.
- Возвращает: {KeyObject}

<!--lint enable maximum-line-length remark-lint-->

Создает и возвращает новый ключевой объект, содержащий открытый ключ. Если `key` это строка или `Buffer`, `format` предполагается, что это `'pem'`; если `key` это `KeyObject` с типом `'private'`, открытый ключ является производным от данного закрытого ключа; иначе, `key` должен быть объектом со свойствами, описанными выше.

Если формат `'pem'`, то `'key'` также может быть сертификат X.509.

Поскольку открытые ключи могут быть получены из закрытых ключей, закрытый ключ может быть передан вместо открытого ключа. В этом случае эта функция ведет себя так, как если бы [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey) был вызван, за исключением того, что тип возвращаемого `KeyObject` будет `'public'` и что закрытый ключ не может быть извлечен из возвращенного `KeyObject`. Аналогично, если `KeyObject` с типом `'private'` дан новый `KeyObject` с типом `'public'` будет возвращен, и извлечь закрытый ключ из возвращенного объекта будет невозможно.

### `crypto.createSecretKey(key[, encoding])`

<!-- YAML
added: v11.6.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The key can also be an ArrayBuffer or string. The encoding
                 argument was added. The key cannot contain more than
                 2 ** 32 - 1 bytes.
-->

- `key` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `encoding` {строка} Кодировка строки, когда `key` это строка.
- Возвращает: {KeyObject}

Создает и возвращает новый объект ключа, содержащий секретный ключ для симметричного шифрования или `Hmac`.

### `crypto.createSign(algorithm[, options])`

<!-- YAML
added: v0.1.92
-->

- `algorithm` {нить}
- `options` {Объект} [`stream.Writable` параметры](stream.md#new-streamwritableoptions)
- Возвращает: {Знак}

Создает и возвращает `Sign` объект, который использует данный `algorithm`. Использовать [`crypto.getHashes()`](#cryptogethashes) для получения названий доступных алгоритмов дайджеста. По желанию `options` аргумент контролирует `stream.Writable` поведение.

В некоторых случаях `Sign` экземпляр может быть создан с использованием имени алгоритма подписи, например `'RSA-SHA256'`вместо алгоритма дайджеста. Это будет использовать соответствующий алгоритм дайджеста. Это не работает для всех алгоритмов подписи, таких как `'ecdsa-with-SHA256'`, поэтому лучше всегда использовать имена алгоритмов дайджеста.

### `crypto.createVerify(algorithm[, options])`

<!-- YAML
added: v0.1.92
-->

- `algorithm` {нить}
- `options` {Объект} [`stream.Writable` параметры](stream.md#new-streamwritableoptions)
- Возврат: {Verify}

Создает и возвращает `Verify` объект, использующий данный алгоритм. Использовать [`crypto.getHashes()`](#cryptogethashes) получить массив имен доступных алгоритмов подписи. По желанию `options` аргумент контролирует `stream.Writable` поведение.

В некоторых случаях `Verify` экземпляр может быть создан с использованием имени алгоритма подписи, например `'RSA-SHA256'`вместо алгоритма дайджеста. Это будет использовать соответствующий алгоритм дайджеста. Это не работает для всех алгоритмов подписи, таких как `'ecdsa-with-SHA256'`, поэтому лучше всегда использовать имена алгоритмов дайджеста.

### `crypto.diffieHellman(options)`

<!-- YAML
added:
 - v13.9.0
 - v12.17.0
-->

- `options`: {Объект}
  - `privateKey`: {KeyObject}
  - `publicKey`: {KeyObject}
- Возвращает: {Buffer}

Вычисляет секрет Диффи-Хеллмана на основе `privateKey` и `publicKey`. Оба ключа должны иметь одинаковые `asymmetricKeyType`, который должен быть одним из `'dh'` (для Диффи-Хеллмана), `'ec'` (для ECDH), `'x448'`, или `'x25519'` (для ECDH-ES).

### `crypto.generateKey(type, options, callback)`

<!-- YAML
added: v15.0.0
-->

- `type`: {строка} Предполагаемое использование сгенерированного секретного ключа. В настоящее время принятые значения: `'hmac'` а также `'aes'`.
- `options`: {Объект}
  - `length`: {число} Битовая длина ключа, который нужно сгенерировать. Это должно быть значение больше 0.
    - Если `type` является `'hmac'`, минимум 1, а максимальная длина 2<sup>31 год</sup>-1. Если значение не кратно 8, сгенерированный ключ будет усечен до `Math.floor(length / 8)`.
    - Если `type` является `'aes'`, длина должна быть одной из `128`, `192`, или `256`.
- `callback`: {Функция}
  - `err`: {Ошибка}
  - `key`: {KeyObject}

Асинхронно генерирует новый случайный секретный ключ заданного `length`. В `type` определит, какие проверки будут выполняться на `length`.

```mjs
const { generateKey } = await import('crypto');

generateKey('hmac', { length: 64 }, (err, key) => {
  if (err) throw err;
  console.log(key.export().toString('hex')); // 46e..........620
});
```

```cjs
const { generateKey } = require('crypto');

generateKey('hmac', { length: 64 }, (err, key) => {
  if (err) throw err;
  console.log(key.export().toString('hex')); // 46e..........620
});
```

### `crypto.generateKeyPair(type, options, callback)`

<!-- YAML
added: v10.12.0
changes:
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

- `type`: {строка} Должно быть `'rsa'`, `'rsa-pss'`, `'dsa'`, `'ec'`, `'ed25519'`, `'ed448'`, `'x25519'`, `'x448'`, или `'dh'`.
- `options`: {Объект}
  - `modulusLength`: {число} Размер ключа в битах (RSA, DSA).
  - `publicExponent`: {число} Открытая экспонента (RSA). **Дефолт:** `0x10001`.
  - `hashAlgorithm`: {строка} Имя дайджеста сообщения (RSA-PSS).
  - `mgf1HashAlgorithm`: {строка} Имя дайджеста сообщения, используемого MGF1 (RSA-PSS).
  - `saltLength`: {число} Минимальная длина соли в байтах (RSA-PSS).
  - `divisorLength`: {number} Размер `q` в битах (DSA).
  - `namedCurve`: {строка} Имя кривой для использования (EC).
  - `prime`: {Buffer} Основной параметр (DH).
  - `primeLength`: {число} Простая длина в битах (DH).
  - `generator`: {номер} Пользовательский генератор (DH). **Дефолт:** `2`.
  - `groupName`: {строка} Имя группы Диффи-Хеллмана (DH). Видеть [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).
  - `publicKeyEncoding`: {Object} См. [`keyObject.export()`](#keyobjectexportoptions).
  - `privateKeyEncoding`: {Object} См. [`keyObject.export()`](#keyobjectexportoptions).
- `callback`: {Функция}
  - `err`: {Ошибка}
  - `publicKey`: {строка | Буфер | KeyObject}
  - `privateKey`: {строка | Буфер | KeyObject}

Создает новую пару асимметричных ключей из заданного `type`. В настоящее время поддерживаются RSA, RSA-PSS, DSA, EC, Ed25519, Ed448, X25519, X448 и DH.

Если `publicKeyEncoding` или `privateKeyEncoding` была указана, эта функция ведет себя так, как если бы [`keyObject.export()`](#keyobjectexportoptions) был вызван на его результат. В противном случае соответствующая часть ключа возвращается как [`KeyObject`](#class-keyobject).

Открытые ключи рекомендуется кодировать как `'spki'` и приватные ключи как `'pkcs8'` с шифрованием для длительного хранения:

```mjs
const { generateKeyPair } = await import('crypto');

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
const { generateKeyPair } = require('crypto');

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

По окончании, `callback` будет называться с `err` установлен в `undefined` а также `publicKey` / `privateKey` представляющий сгенерированную пару ключей.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает `Promise` для `Object` с участием `publicKey` а также `privateKey` характеристики.

### `crypto.generateKeyPairSync(type, options)`

<!-- YAML
added: v10.12.0
changes:
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

- `type`: {строка} Должно быть `'rsa'`, `'rsa-pss'`, `'dsa'`, `'ec'`, `'ed25519'`, `'ed448'`, `'x25519'`, `'x448'`, или `'dh'`.
- `options`: {Объект}
  - `modulusLength`: {число} Размер ключа в битах (RSA, DSA).
  - `publicExponent`: {число} Открытая экспонента (RSA). **Дефолт:** `0x10001`.
  - `hashAlgorithm`: {строка} Имя дайджеста сообщения (RSA-PSS).
  - `mgf1HashAlgorithm`: {строка} Имя дайджеста сообщения, используемого MGF1 (RSA-PSS).
  - `saltLength`: {число} Минимальная длина соли в байтах (RSA-PSS).
  - `divisorLength`: {number} Размер `q` в битах (DSA).
  - `namedCurve`: {строка} Имя кривой для использования (EC).
  - `prime`: {Buffer} Основной параметр (DH).
  - `primeLength`: {число} Простая длина в битах (DH).
  - `generator`: {номер} Пользовательский генератор (DH). **Дефолт:** `2`.
  - `groupName`: {строка} Имя группы Диффи-Хеллмана (DH). Видеть [`crypto.getDiffieHellman()`](#cryptogetdiffiehellmangroupname).
  - `publicKeyEncoding`: {Object} См. [`keyObject.export()`](#keyobjectexportoptions).
  - `privateKeyEncoding`: {Object} См. [`keyObject.export()`](#keyobjectexportoptions).
- Возвращает: {Object}
  - `publicKey`: {строка | Буфер | KeyObject}
  - `privateKey`: {строка | Буфер | KeyObject}

Создает новую пару асимметричных ключей из заданного `type`. В настоящее время поддерживаются RSA, RSA-PSS, DSA, EC, Ed25519, Ed448, X25519, X448 и DH.

Если `publicKeyEncoding` или `privateKeyEncoding` была указана, эта функция ведет себя так, как если бы [`keyObject.export()`](#keyobjectexportoptions) был вызван на его результат. В противном случае соответствующая часть ключа возвращается как [`KeyObject`](#class-keyobject).

При кодировании открытых ключей рекомендуется использовать `'spki'`. При кодировании закрытых ключей рекомендуется использовать `'pkcs8'` с надежной кодовой фразой и сохранить конфиденциальность парольной фразы.

```mjs
const { generateKeyPairSync } = await import('crypto');

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
const { generateKeyPairSync } = require('crypto');

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

Возвращаемое значение `{ publicKey, privateKey }` представляет сгенерированную пару ключей. Когда была выбрана кодировка PEM, соответствующий ключ будет строкой, в противном случае это будет буфер, содержащий данные, закодированные как DER.

### `crypto.generateKeySync(type, options)`

<!-- YAML
added: v15.0.0
-->

- `type`: {строка} Предполагаемое использование сгенерированного секретного ключа. В настоящее время принятые значения: `'hmac'` а также `'aes'`.
- `options`: {Объект}
  - `length`: {число} Битовая длина ключа, который нужно сгенерировать.
    - Если `type` является `'hmac'`, минимум 1, а максимальная длина 2<sup>31 год</sup>-1. Если значение не кратно 8, сгенерированный ключ будет усечен до `Math.floor(length / 8)`.
    - Если `type` является `'aes'`, длина должна быть одной из `128`, `192`, или `256`.
- Возвращает: {KeyObject}

Синхронно генерирует новый случайный секретный ключ заданного `length`. В `type` определит, какие проверки будут выполняться на `length`.

```mjs
const { generateKeySync } = await import('crypto');

const key = generateKeySync('hmac', { length: 64 });
console.log(key.export().toString('hex')); // e89..........41e
```

```cjs
const { generateKeySync } = require('crypto');

const key = generateKeySync('hmac', { length: 64 });
console.log(key.export().toString('hex')); // e89..........41e
```

### `crypto.generatePrime(size[, options[, callback]])`

<!-- YAML
added: v15.8.0
-->

- `size` {number} Размер (в битах) простого числа для генерации.
- `options` {Объект}
  - `add` {ArrayBuffer | SharedArrayBuffer | TypedArray | Buffer | DataView | bigint}
  - `rem` {ArrayBuffer | SharedArrayBuffer | TypedArray | Buffer | DataView | bigint}
  - `safe` {логический} **Дефолт:** `false`.
  - `bigint` {boolean} Когда `true`, сгенерированное простое число возвращается как `bigint`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `prime` {ArrayBuffer | bigint}

Генерирует псевдослучайное простое число `size` биты.

Если `options.safe` является `true`, простое число будет безопасным, т. е. `(prime - 1) / 2` тоже будет прайм.

В `options.add` а также `options.rem` параметры могут использоваться для обеспечения дополнительных требований, например, для Диффи-Хеллмана:

- Если `options.add` а также `options.rem` оба установлены, простое число будет удовлетворять условию, что `prime % add = rem`.
- Если только `options.add` установлен и `options.safe` не является `true`, простое число будет удовлетворять условию, что `prime % add = 1`.
- Если только `options.add` установлен и `options.safe` установлен на `true`, простое число вместо этого будет удовлетворять условию, что `prime % add = 3`. Это необходимо, потому что `prime % add = 1` для `options.add > 2` будет противоречить условию, установленному `options.safe`.
- `options.rem` игнорируется, если `options.add` не дано.

Оба `options.add` а также `options.rem` должны быть закодированы как последовательности с прямым порядком байтов, если заданы как `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer`, или `DataView`.

По умолчанию простое число кодируется как последовательность октетов с прямым порядком байтов в {ArrayBuffer}. Если `bigint` вариант `true`, тогда предоставляется {bigint}.

### `crypto.generatePrimeSync(size[, options])`

<!-- YAML
added: v15.8.0
-->

- `size` {number} Размер (в битах) простого числа для генерации.
- `options` {Объект}
  - `add` {ArrayBuffer | SharedArrayBuffer | TypedArray | Buffer | DataView | bigint}
  - `rem` {ArrayBuffer | SharedArrayBuffer | TypedArray | Buffer | DataView | bigint}
  - `safe` {логический} **Дефолт:** `false`.
  - `bigint` {boolean} Когда `true`, сгенерированное простое число возвращается как `bigint`.
- Возвращает: {ArrayBuffer | bigint}.

Генерирует псевдослучайное простое число `size` биты.

Если `options.safe` является `true`, простое число будет безопасным, т. е. `(prime - 1) / 2` тоже будет прайм.

В `options.add` а также `options.rem` параметры могут использоваться для обеспечения дополнительных требований, например, для Диффи-Хеллмана:

- Если `options.add` а также `options.rem` оба установлены, простое число будет удовлетворять условию, что `prime % add = rem`.
- Если только `options.add` установлен и `options.safe` не является `true`, простое число будет удовлетворять условию, что `prime % add = 1`.
- Если только `options.add` установлен и `options.safe` установлен на `true`, простое число вместо этого будет удовлетворять условию, что `prime % add = 3`. Это необходимо, потому что `prime % add = 1` для `options.add > 2` будет противоречить условию, установленному `options.safe`.
- `options.rem` игнорируется, если `options.add` не дано.

Оба `options.add` а также `options.rem` должны быть закодированы как последовательности с прямым порядком байтов, если заданы как `ArrayBuffer`, `SharedArrayBuffer`, `TypedArray`, `Buffer`, или `DataView`.

По умолчанию простое число кодируется как последовательность октетов с прямым порядком байтов в {ArrayBuffer}. Если `bigint` вариант `true`, тогда предоставляется {bigint}.

### `crypto.getCipherInfo(nameOrNid[, options])`

<!-- YAML
added: v15.0.0
-->

- `nameOrNid`: {строка | число} Имя или nid запрашиваемого шифра.
- `options`: {Объект}
  - `keyLength`: {number} Тестовая длина ключа.
  - `ivLength`: {number} Длина тестового IV.
- Возвращает: {Object}
  - `name` {строка} Название шифра
  - `nid` {number} nid шифра
  - `blockSize` {число} Размер блока шифра в байтах. Это свойство опускается, когда `mode` является `'stream'`.
  - `ivLength` {number} Ожидаемая длина вектора инициализации или длина вектора инициализации по умолчанию в байтах. Это свойство опускается, если шифр не использует вектор инициализации.
  - `keyLength` {number} Ожидаемая длина ключа или длина ключа по умолчанию в байтах.
  - `mode` {строка} Режим шифрования. Один из `'cbc'`, `'ccm'`, `'cfb'`, `'ctr'`, `'ecb'`, `'gcm'`, `'ocb'`, `'ofb'`, `'stream'`, `'wrap'`, `'xts'`.

Возвращает информацию о заданном шифре.

Некоторые шифры принимают ключи переменной длины и векторы инициализации. По умолчанию `crypto.getCipherInfo()` метод вернет значения по умолчанию для этих шифров. Чтобы проверить, подходит ли данная длина ключа или длина iv для данного шифра, используйте `keyLength` а также `ivLength` параметры. Если указанные значения неприемлемы, `undefined` будет возвращен.

### `crypto.getCiphers()`

<!-- YAML
added: v0.9.3
-->

- Возвращает: {строка \[]} Массив с именами поддерживаемых алгоритмов шифрования.

```mjs
const { getCiphers } = await import('crypto');

console.log(getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
```

```cjs
const { getCiphers } = require('crypto');

console.log(getCiphers()); // ['aes-128-cbc', 'aes-128-ccm', ...]
```

### `crypto.getCurves()`

<!-- YAML
added: v2.3.0
-->

- Возвращает: {строка \[]} Массив с именами поддерживаемых эллиптических кривых.

```mjs
const { getCurves } = await import('crypto');

console.log(getCurves()); // ['Oakley-EC2N-3', 'Oakley-EC2N-4', ...]
```

```cjs
const { getCurves } = require('crypto');

console.log(getCurves()); // ['Oakley-EC2N-3', 'Oakley-EC2N-4', ...]
```

### `crypto.getDiffieHellman(groupName)`

<!-- YAML
added: v0.7.5
-->

- `groupName` {нить}
- Возвращает: {DiffieHellmanGroup}

Создает предопределенный `DiffieHellmanGroup` объект обмена ключами. Поддерживаемые группы: `'modp1'`, `'modp2'`, `'modp5'` (определено в [RFC 2412](https://www.rfc-editor.org/rfc/rfc2412.txt), но смотри [Предостережения](#support-for-weak-or-compromised-algorithms)) а также `'modp14'`, `'modp15'`, `'modp16'`, `'modp17'`, `'modp18'` (определено в [RFC 3526](https://www.rfc-editor.org/rfc/rfc3526.txt)). Возвращенный объект имитирует интерфейс объектов, созданных [`crypto.createDiffieHellman()`](#cryptocreatediffiehellmanprime-primeencoding-generator-generatorencoding), но не позволит менять ключи (с [`diffieHellman.setPublicKey()`](#diffiehellmansetpublickeypublickey-encoding), Например). Преимущество использования этого метода заключается в том, что сторонам не нужно заранее генерировать и обмениваться групповым модулем, что экономит время процессора и связи.

Пример (получение общего секрета):

```mjs
const { getDiffieHellman } = await import('crypto');
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

/* aliceSecret and bobSecret should be the same */
console.log(aliceSecret === bobSecret);
```

```cjs
const { getDiffieHellman } = require('crypto');

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

/* aliceSecret and bobSecret should be the same */
console.log(aliceSecret === bobSecret);
```

### `crypto.getFips()`

<!-- YAML
added: v10.0.0
-->

- Возврат: {number} `1` тогда и только тогда, когда в настоящее время используется поставщик криптографии, совместимый с FIPS, `0` иначе. В будущих выпусках semver-major тип возвращаемого значения этого API может быть изменен на {boolean}.

### `crypto.getHashes()`

<!-- YAML
added: v0.9.3
-->

- Возвращает: {string \[]} Массив имен поддерживаемых алгоритмов хеширования, например `'RSA-SHA256'`. Алгоритмы хеширования также называются алгоритмами «дайджеста».

```mjs
const { getHashes } = await import('crypto');

console.log(getHashes()); // ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
```

```cjs
const { getHashes } = require('crypto');

console.log(getHashes()); // ['DSA', 'DSA-SHA', 'DSA-SHA1', ...]
```

### `crypto.hkdf(digest, ikm, salt, info, keylen, callback)`

<!-- YAML
added: v15.0.0
-->

- `digest` {строка} Используемый алгоритм дайджеста.
- `ikm` {string | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject} Входной ключевой материал. Он должен быть не менее одного байта в длину.
- `salt` {string | ArrayBuffer | Buffer | TypedArray | DataView} Значение соли. Должен быть предоставлен, но может быть нулевой длины.
- `info` {string | ArrayBuffer | Buffer | TypedArray | DataView} Значение дополнительной информации. Должен быть предоставлен, но может иметь нулевую длину и не может превышать 1024 байта.
- `keylen` {number} Длина ключа, который нужно сгенерировать. Должно быть больше 0. Максимально допустимое значение: `255` умноженное на количество байтов, созданных выбранной функцией дайджеста (например, `sha512` генерирует 64-байтовые хэши, в результате чего максимальный вывод HKDF составляет 16320 байт).
- `callback` {Функция}
  - `err` {Ошибка}
  - `derivedKey` {ArrayBuffer}

HKDF - это простая функция вывода ключей, определенная в RFC 5869. Данная `ikm`, `salt` а также `info` используются с `digest` получить ключ `keylen` байтов.

Поставляемый `callback` функция вызывается с двумя аргументами: `err` а также `derivedKey`. Если при получении ключа возникла ошибка, `err` будет установлен; иначе `err` будет `null`. Успешно созданный `derivedKey` будет передан обратному вызову как {ArrayBuffer}. Будет выдана ошибка, если какой-либо из входных аргументов указывает недопустимые значения или типы.

```mjs
import { Buffer } from 'buffer';
const { hkdf } = await import('crypto');

hkdf(
  'sha512',
  'key',
  'salt',
  'info',
  64,
  (err, derivedKey) => {
    if (err) throw err;
    console.log(Buffer.from(derivedKey).toString('hex')); // '24156e2...5391653'
  }
);
```

```cjs
const { hkdf } = require('crypto');
const { Buffer } = require('buffer');

hkdf(
  'sha512',
  'key',
  'salt',
  'info',
  64,
  (err, derivedKey) => {
    if (err) throw err;
    console.log(Buffer.from(derivedKey).toString('hex')); // '24156e2...5391653'
  }
);
```

### `crypto.hkdfSync(digest, ikm, salt, info, keylen)`

<!-- YAML
added: v15.0.0
-->

- `digest` {строка} Используемый алгоритм дайджеста.
- `ikm` {string | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject} Входной ключевой материал. Он должен быть не менее одного байта в длину.
- `salt` {string | ArrayBuffer | Buffer | TypedArray | DataView} Значение соли. Должен быть предоставлен, но может быть нулевой длины.
- `info` {string | ArrayBuffer | Buffer | TypedArray | DataView} Значение дополнительной информации. Должен быть предоставлен, но может иметь нулевую длину и не может превышать 1024 байта.
- `keylen` {number} Длина ключа, который нужно сгенерировать. Должно быть больше 0. Максимально допустимое значение: `255` умноженное на количество байтов, созданных выбранной функцией дайджеста (например, `sha512` генерирует 64-байтовые хэши, в результате чего максимальный вывод HKDF составляет 16320 байт).
- Возвращает: {ArrayBuffer}

Предоставляет функцию синхронного получения ключа HKDF, как определено в RFC 5869. Данный `ikm`, `salt` а также `info` используются с `digest` получить ключ `keylen` байтов.

Успешно созданный `derivedKey` будет возвращен как {ArrayBuffer}.

Ошибка будет выдана, если какой-либо из входных аргументов указывает недопустимые значения или типы, или если производный ключ не может быть сгенерирован.

```mjs
import { Buffer } from 'buffer';
const { hkdfSync } = await import('crypto');

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
const { hkdfSync } = require('crypto');
const { Buffer } = require('buffer');

const derivedKey = hkdfSync(
  'sha512',
  'key',
  'salt',
  'info',
  64
);
console.log(Buffer.from(derivedKey).toString('hex')); // '24156e2...5391653'
```

### `crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)`

<!-- YAML
added: v0.5.5
changes:
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

- `password` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `salt` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `iterations` {количество}
- `keylen` {количество}
- `digest` {нить}
- `callback` {Функция}
  - `err` {Ошибка}
  - `derivedKey` {Буфер}

Предоставляет реализацию функции 2 асинхронного вывода ключа на основе пароля (PBKDF2). Выбранный алгоритм дайджеста HMAC, указанный `digest` применяется для получения ключа запрошенной байтовой длины (`keylen`) от `password`, `salt` а также `iterations`.

Поставляемый `callback` функция вызывается с двумя аргументами: `err` а также `derivedKey`. Если при получении ключа произошла ошибка, `err` будет установлен; иначе `err` будет `null`. По умолчанию успешно сгенерированный `derivedKey` будет передан обратному вызову как [`Buffer`](buffer.md). Будет выдана ошибка, если какой-либо из входных аргументов указывает недопустимые значения или типы.

Если `digest` является `null`, `'sha1'` будет использоваться. Такое поведение устарело, укажите `digest` явно.

В `iterations` Аргумент должен быть максимально высоким числом. Чем больше количество итераций, тем более безопасным будет полученный ключ, но для завершения потребуется больше времени.

В `salt` должен быть максимально уникальным. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Видеть [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) для подробностей.

При передаче строк для `password` или `salt`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

```mjs
const { pbkdf2 } = await import('crypto');

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
const { pbkdf2 } = require('crypto');

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

В `crypto.DEFAULT_ENCODING` свойство можно использовать для изменения способа `derivedKey` передается обратному вызову. Однако это свойство устарело, и его следует избегать.

```mjs
import crypto from 'crypto';
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
const crypto = require('crypto');
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

Массив поддерживаемых функций дайджеста можно получить с помощью [`crypto.getHashes()`](#cryptogethashes).

Этот API использует пул потоков libuv, что может иметь неожиданные и отрицательные последствия для производительности некоторых приложений; увидеть [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) документация для получения дополнительной информации.

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

- `password` {строка | буфер | TypedArray | DataView}
- `salt` {строка | буфер | TypedArray | DataView}
- `iterations` {количество}
- `keylen` {количество}
- `digest` {нить}
- Возвращает: {Buffer}

Обеспечивает синхронную реализацию функции вывода ключей 2 на основе пароля (PBKDF2). Выбранный алгоритм дайджеста HMAC, указанный `digest` применяется для получения ключа запрошенной байтовой длины (`keylen`) от `password`, `salt` а также `iterations`.

В случае ошибки `Error` будет выброшен, иначе производный ключ будет возвращен как [`Buffer`](buffer.md).

Если `digest` является `null`, `'sha1'` будет использоваться. Такое поведение устарело, укажите `digest` явно.

В `iterations` Аргумент должен быть максимально высоким числом. Чем больше количество итераций, тем более безопасным будет полученный ключ, но для завершения потребуется больше времени.

В `salt` должен быть максимально уникальным. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Видеть [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) для подробностей.

При передаче строк для `password` или `salt`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

```mjs
const { pbkdf2Sync } = await import('crypto');

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
const { pbkdf2Sync } = require('crypto');

const key = pbkdf2Sync(
  'secret',
  'salt',
  100000,
  64,
  'sha512'
);
console.log(key.toString('hex')); // '3745e48...08d59ae'
```

В `crypto.DEFAULT_ENCODING` свойство может быть использовано для изменения способа `derivedKey` возвращается. Однако это свойство устарело, и его следует избегать.

```mjs
import crypto from 'crypto';
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
const crypto = require('crypto');
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

### `crypto.privateDecrypt(privateKey, buffer)`

<!-- YAML
added: v0.11.14
changes:
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

<!--lint disable maximum-line-length remark-lint-->

- `privateKey` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
  - `oaepHash` {строка} Хэш-функция, используемая для заполнения OAEP и MGF1. **Дефолт:** `'sha1'`
  - `oaepLabel` {string | ArrayBuffer | Buffer | TypedArray | DataView} Метка, используемая для заполнения OAEP. Если не указано, метка не используется.
  - `padding` {crypto.constants} Необязательное значение заполнения, определенное в `crypto.constants`, которые могут быть: `crypto.constants.RSA_NO_PADDING`, `crypto.constants.RSA_PKCS1_PADDING`, или `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
- `buffer` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- Возвращает: {Buffer} новый `Buffer` с расшифрованным контентом.

<!--lint enable maximum-line-length remark-lint-->

Расшифровывает `buffer` с участием `privateKey`. `buffer` был ранее зашифрован с использованием соответствующего открытого ключа, например, с использованием [`crypto.publicEncrypt()`](#cryptopublicencryptkey-buffer).

Если `privateKey` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `privateKey` был передан [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, то `padding` собственность может быть передана. В противном случае эта функция использует `RSA_PKCS1_OAEP_PADDING`.

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

<!--lint disable maximum-line-length remark-lint-->

- `privateKey` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
  - `key` {string | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey} Закрытый ключ в кодировке PEM.
  - `passphrase` {string | ArrayBuffer | Buffer | TypedArray | DataView} Необязательная кодовая фраза для закрытого ключа.
  - `padding` {crypto.constants} Необязательное значение заполнения, определенное в `crypto.constants`, которые могут быть: `crypto.constants.RSA_NO_PADDING` или `crypto.constants.RSA_PKCS1_PADDING`.
  - `encoding` {строка} Кодировка строки, используемая, когда `buffer`, `key`, или `passphrase` струны.
- `buffer` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- Возвращает: {Buffer} новый `Buffer` с зашифрованным контентом.

<!--lint enable maximum-line-length remark-lint-->

Шифрует `buffer` с участием `privateKey`. Возвращенные данные можно расшифровать с помощью соответствующего открытого ключа, например, используя [`crypto.publicDecrypt()`](#cryptopublicdecryptkey-buffer).

Если `privateKey` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `privateKey` был передан [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, то `padding` собственность может быть передана. В противном случае эта функция использует `RSA_PKCS1_PADDING`.

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

<!--lint disable maximum-line-length remark-lint-->

- `key` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
  - `passphrase` {string | ArrayBuffer | Buffer | TypedArray | DataView} Необязательная кодовая фраза для закрытого ключа.
  - `padding` {crypto.constants} Необязательное значение заполнения, определенное в `crypto.constants`, которые могут быть: `crypto.constants.RSA_NO_PADDING` или `crypto.constants.RSA_PKCS1_PADDING`.
  - `encoding` {строка} Кодировка строки, используемая, когда `buffer`, `key`, или `passphrase` струны.
- `buffer` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- Возвращает: {Buffer} новый `Buffer` с расшифрованным контентом.

<!--lint enable maximum-line-length remark-lint-->

Расшифровывает `buffer` с участием `key`.`buffer` был ранее зашифрован с использованием соответствующего закрытого ключа, например, с использованием [`crypto.privateEncrypt()`](#cryptoprivateencryptprivatekey-buffer).

Если `key` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, то `padding` собственность может быть передана. В противном случае эта функция использует `RSA_PKCS1_PADDING`.

Поскольку открытые ключи RSA могут быть получены из закрытых ключей, закрытый ключ может быть передан вместо открытого ключа.

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

<!--lint disable maximum-line-length remark-lint-->

- `key` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
  - `key` {string | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey} Открытый или закрытый ключ, закодированный в PEM, {KeyObject} или {CryptoKey}.
  - `oaepHash` {строка} Хэш-функция, используемая для заполнения OAEP и MGF1. **Дефолт:** `'sha1'`
  - `oaepLabel` {string | ArrayBuffer | Buffer | TypedArray | DataView} Метка, используемая для заполнения OAEP. Если не указано, метка не используется.
  - `passphrase` {string | ArrayBuffer | Buffer | TypedArray | DataView} Необязательная кодовая фраза для закрытого ключа.
  - `padding` {crypto.constants} Необязательное значение заполнения, определенное в `crypto.constants`, которые могут быть: `crypto.constants.RSA_NO_PADDING`, `crypto.constants.RSA_PKCS1_PADDING`, или `crypto.constants.RSA_PKCS1_OAEP_PADDING`.
  - `encoding` {строка} Кодировка строки, используемая, когда `buffer`, `key`, `oaepLabel`, или `passphrase` струны.
- `buffer` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- Возвращает: {Buffer} новый `Buffer` с зашифрованным контентом.

<!--lint enable maximum-line-length remark-lint-->

Шифрует содержимое `buffer` с участием `key` и возвращает новый [`Buffer`](buffer.md) с зашифрованным контентом. Возвращенные данные можно расшифровать с помощью соответствующего закрытого ключа, например, используя [`crypto.privateDecrypt()`](#cryptoprivatedecryptprivatekey-buffer).

Если `key` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, то `padding` собственность может быть передана. В противном случае эта функция использует `RSA_PKCS1_OAEP_PADDING`.

Поскольку открытые ключи RSA могут быть получены из закрытых ключей, закрытый ключ может быть передан вместо открытого ключа.

### `crypto.randomBytes(size[, callback])`

<!-- YAML
added: v0.5.8
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/16454
    description: Passing `null` as the `callback` argument now throws
                 `ERR_INVALID_CALLBACK`.
-->

- `size` {number} Количество байтов для генерации. В `size` не должен быть больше, чем `2**31 - 1`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `buf` {Буфер}
- Возвращает: {Buffer}, если `callback` функция не предусмотрена.

Генерирует криптостойкие псевдослучайные данные. В `size` Аргумент - это число, указывающее количество байтов для генерации.

Если `callback` предоставляется функция, байты генерируются асинхронно, а `callback` функция вызывается с двумя аргументами: `err` а также `buf`. Если произошла ошибка, `err` будет `Error` объект; в противном случае это `null`. В `buf` аргумент [`Buffer`](buffer.md) содержащий сгенерированные байты.

```mjs
// Asynchronous
const { randomBytes } = await import('crypto');

randomBytes(256, (err, buf) => {
  if (err) throw err;
  console.log(
    `${buf.length} bytes of random data: ${buf.toString(
      'hex'
    )}`
  );
});
```

```cjs
// Asynchronous
const { randomBytes } = require('crypto');

randomBytes(256, (err, buf) => {
  if (err) throw err;
  console.log(
    `${buf.length} bytes of random data: ${buf.toString(
      'hex'
    )}`
  );
});
```

Если `callback` функция не предусмотрена, случайные байты генерируются синхронно и возвращаются как [`Buffer`](buffer.md). Если возникнет проблема с генерацией байтов, будет выдана ошибка.

```mjs
// Synchronous
const { randomBytes } = await import('crypto');

const buf = randomBytes(256);
console.log(
  `${buf.length} bytes of random data: ${buf.toString(
    'hex'
  )}`
);
```

```cjs
// Synchronous
const { randomBytes } = require('crypto');

const buf = randomBytes(256);
console.log(
  `${buf.length} bytes of random data: ${buf.toString(
    'hex'
  )}`
);
```

В `crypto.randomBytes()` метод не будет завершен, пока не будет доступна достаточная энтропия. Обычно это не должно занимать больше нескольких миллисекунд. Единственный раз, когда генерация случайных байтов может предположительно блокироваться на более длительный период времени, - это сразу после загрузки, когда вся система все еще находится на низком уровне энтропии.

Этот API использует пул потоков libuv, что может иметь неожиданные и отрицательные последствия для производительности некоторых приложений; увидеть [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) документация для получения дополнительной информации.

Асинхронная версия `crypto.randomBytes()` выполняется в одном запросе пула потоков. Чтобы свести к минимуму изменение длины задачи пула потоков, разделите большие `randomBytes` запросы, когда это делается в рамках выполнения запроса клиента.

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

- `buffer` {ArrayBuffer | Buffer | TypedArray | DataView} Должен быть предоставлен. Размер предоставленного `buffer` не должен быть больше, чем `2**31 - 1`.
- `offset` {количество} **Дефолт:** `0`
- `size` {количество} **Дефолт:** `buffer.length - offset`. В `size` не должен быть больше, чем `2**31 - 1`.
- Возвращает: {ArrayBuffer | Buffer | TypedArray | DataView} Объект, переданный как `buffer` аргумент.

Синхронная версия [`crypto.randomFill()`](#cryptorandomfillbuffer-offset-size-callback).

```mjs
import { Buffer } from 'buffer';
const { randomFillSync } = await import('crypto');

const buf = Buffer.alloc(10);
console.log(randomFillSync(buf).toString('hex'));

randomFillSync(buf, 5);
console.log(buf.toString('hex'));

// The above is equivalent to the following:
randomFillSync(buf, 5, 5);
console.log(buf.toString('hex'));
```

```cjs
const { randomFillSync } = require('crypto');
const { Buffer } = require('buffer');

const buf = Buffer.alloc(10);
console.log(randomFillSync(buf).toString('hex'));

randomFillSync(buf, 5);
console.log(buf.toString('hex'));

// The above is equivalent to the following:
randomFillSync(buf, 5, 5);
console.log(buf.toString('hex'));
```

Любой `ArrayBuffer`, `TypedArray` или `DataView` экземпляр может быть передан как `buffer`.

```mjs
import { Buffer } from 'buffer';
const { randomFillSync } = await import('crypto');

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
const { randomFillSync } = require('crypto');
const { Buffer } = require('buffer');

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

### `crypto.randomFill(buffer[, offset][, size], callback)`

<!-- YAML
added:
  - v7.10.0
  - v6.13.0
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15231
    description: The `buffer` argument may be any `TypedArray` or `DataView`.
-->

- `buffer` {ArrayBuffer | Buffer | TypedArray | DataView} Должен быть предоставлен. Размер предоставленного `buffer` не должен быть больше, чем `2**31 - 1`.
- `offset` {количество} **Дефолт:** `0`
- `size` {количество} **Дефолт:** `buffer.length - offset`. В `size` не должен быть больше, чем `2**31 - 1`.
- `callback` {Функция} `function(err, buf) {}`.

Эта функция похожа на [`crypto.randomBytes()`](#cryptorandombytessize-callback) но требует, чтобы первый аргумент был [`Buffer`](buffer.md) это будет заполнено. Также требуется, чтобы был передан обратный вызов.

Если `callback` функция не предусмотрена, будет выдана ошибка.

```mjs
import { Buffer } from 'buffer';
const { randomFill } = await import('crypto');

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

```cjs
const { randomFill } = require('crypto');
const { Buffer } = require('buffer');

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

Любой `ArrayBuffer`, `TypedArray`, или `DataView` экземпляр может быть передан как `buffer`.

Хотя это включает в себя экземпляры `Float32Array` а также `Float64Array`, эту функцию не следует использовать для генерации случайных чисел с плавающей запятой. Результат может содержать `+Infinity`, `-Infinity`, а также `NaN`, и даже если массив содержит только конечные числа, они не основаны на равномерном случайном распределении и не имеют значимых нижних или верхних границ.

```mjs
import { Buffer } from 'buffer';
const { randomFill } = await import('crypto');

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
const { randomFill } = require('crypto');
const { Buffer } = require('buffer');

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

Этот API использует пул потоков libuv, что может иметь неожиданные и отрицательные последствия для производительности некоторых приложений; увидеть [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) документация для получения дополнительной информации.

Асинхронная версия `crypto.randomFill()` выполняется в одном запросе пула потоков. Чтобы свести к минимуму изменение длины задачи пула потоков, разделите большие `randomFill` запросы, когда это делается в рамках выполнения запроса клиента.

### `crypto.randomInt([min, ]max[, callback])`

<!-- YAML
added:
  - v14.10.0
  - v12.19.0
-->

- `min` {integer} Начало случайного диапазона (включительно). **Дефолт:** `0`.
- `max` {integer} Конец случайного диапазона (исключая).
- `callback` {Функция} `function(err, n) {}`.

Вернуть случайное целое число `n` такой, что `min <= n < max`. Эта реализация позволяет избежать [смещение по модулю](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Modulo_bias).

Диапазон (`max - min`) должно быть меньше 2<sup>48</sup>. `min` а также `max` должно быть [безопасные целые числа](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger).

Если `callback` функция не предусмотрена, случайное целое число генерируется синхронно.

```mjs
// Asynchronous
const { randomInt } = await import('crypto');

randomInt(3, (err, n) => {
  if (err) throw err;
  console.log(`Random number chosen from (0, 1, 2): ${n}`);
});
```

```cjs
// Asynchronous
const { randomInt } = require('crypto');

randomInt(3, (err, n) => {
  if (err) throw err;
  console.log(`Random number chosen from (0, 1, 2): ${n}`);
});
```

```mjs
// Synchronous
const { randomInt } = await import('crypto');

const n = randomInt(3);
console.log(`Random number chosen from (0, 1, 2): ${n}`);
```

```cjs
// Synchronous
const { randomInt } = require('crypto');

const n = randomInt(3);
console.log(`Random number chosen from (0, 1, 2): ${n}`);
```

```mjs
// With `min` argument
const { randomInt } = await import('crypto');

const n = randomInt(1, 7);
console.log(`The dice rolled: ${n}`);
```

```cjs
// With `min` argument
const { randomInt } = require('crypto');

const n = randomInt(1, 7);
console.log(`The dice rolled: ${n}`);
```

### `crypto.randomUUID([options])`

<!-- YAML
added:
  - v15.6.0
  - v14.17.0
-->

- `options` {Объект}
  - `disableEntropyCache` {boolean} По умолчанию для повышения производительности Node.js генерирует и кэширует достаточно случайных данных для генерации до 128 случайных UUID. Чтобы сгенерировать UUID без использования кеша, установите `disableEntropyCache` к `true`. **Дефолт:** `false`.
- Возвращает: {строка}

Создает случайный [RFC 4122](https://www.rfc-editor.org/rfc/rfc4122.txt) версия 4 UUID. UUID генерируется с помощью криптографического генератора псевдослучайных чисел.

### `crypto.scrypt(password, salt, keylen[, options], callback)`

<!-- YAML
added: v10.5.0
changes:
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

- `password` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `salt` {строка | ArrayBuffer | Buffer | TypedArray | DataView}
- `keylen` {количество}
- `options` {Объект}
  - `cost` {number} Параметр стоимости ЦП / памяти. Должна быть степень двойки больше единицы. **Дефолт:** `16384`.
  - `blockSize` {number} Параметр размера блока. **Дефолт:** `8`.
  - `parallelization` {number} Параметр распараллеливания. **Дефолт:** `1`.
  - `N` {number} Псевдоним для `cost`. Может быть указан только один из обоих.
  - `r` {number} Псевдоним для `blockSize`. Может быть указан только один из обоих.
  - `p` {number} Псевдоним для `parallelization`. Может быть указан только один из обоих.
  - `maxmem` {number} Верхняя граница памяти. Это ошибка, когда (приблизительно) `128 * N * r > maxmem`. **Дефолт:** `32 * 1024 * 1024`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `derivedKey` {Буфер}

Обеспечивает асинхронный [зашифровать](https://en.wikipedia.org/wiki/Scrypt) реализация. Scrypt - это функция генерации ключей на основе пароля, которая требует больших затрат с точки зрения вычислений и памяти, чтобы сделать атаки грубой силой бесполезными.

В `salt` должен быть максимально уникальным. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Видеть [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) для подробностей.

При передаче строк для `password` или `salt`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

В `callback` функция вызывается с двумя аргументами: `err` а также `derivedKey`. `err` является объектом исключения, когда получение ключа не удается, в противном случае `err` является `null`. `derivedKey` передается в обратный вызов как [`Buffer`](buffer.md).

Исключение возникает, когда любой из входных аргументов указывает недопустимые значения или типы.

```mjs
const { scrypt } = await import('crypto');

// Using the factory defaults.
scrypt('password', 'salt', 64, (err, derivedKey) => {
  if (err) throw err;
  console.log(derivedKey.toString('hex')); // '3745e48...08d59ae'
});
// Using a custom N parameter. Must be a power of two.
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
const { scrypt } = require('crypto');

// Using the factory defaults.
scrypt('password', 'salt', 64, (err, derivedKey) => {
  if (err) throw err;
  console.log(derivedKey.toString('hex')); // '3745e48...08d59ae'
});
// Using a custom N parameter. Must be a power of two.
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

- `password` {строка | буфер | TypedArray | DataView}
- `salt` {строка | буфер | TypedArray | DataView}
- `keylen` {количество}
- `options` {Объект}
  - `cost` {number} Параметр стоимости ЦП / памяти. Должна быть степень двойки больше единицы. **Дефолт:** `16384`.
  - `blockSize` {number} Параметр размера блока. **Дефолт:** `8`.
  - `parallelization` {number} Параметр распараллеливания. **Дефолт:** `1`.
  - `N` {number} Псевдоним для `cost`. Может быть указан только один из обоих.
  - `r` {number} Псевдоним для `blockSize`. Может быть указан только один из обоих.
  - `p` {number} Псевдоним для `parallelization`. Может быть указан только один из обоих.
  - `maxmem` {number} Верхняя граница памяти. Это ошибка, когда (приблизительно) `128 * N * r > maxmem`. **Дефолт:** `32 * 1024 * 1024`.
- Возвращает: {Buffer}

Обеспечивает синхронный [зашифровать](https://en.wikipedia.org/wiki/Scrypt) реализация. Scrypt - это функция генерации ключей на основе пароля, которая требует больших затрат с точки зрения вычислений и памяти, чтобы сделать атаки грубой силой бесполезными.

В `salt` должен быть максимально уникальным. Рекомендуется, чтобы соль была случайной и имела длину не менее 16 байт. Видеть [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) для подробностей.

При передаче строк для `password` или `salt`, пожалуйста примите к сведению [предостережения при использовании строк в качестве входных данных для криптографических API](#using-strings-as-inputs-to-cryptographic-apis).

Исключение создается, когда получение ключа не удается, в противном случае производный ключ возвращается как [`Buffer`](buffer.md).

Исключение возникает, когда любой из входных аргументов указывает недопустимые значения или типы.

```mjs
const { scryptSync } = await import('crypto');
// Using the factory defaults.

const key1 = scryptSync('password', 'salt', 64);
console.log(key1.toString('hex')); // '3745e48...08d59ae'
// Using a custom N parameter. Must be a power of two.
const key2 = scryptSync('password', 'salt', 64, {
  N: 1024,
});
console.log(key2.toString('hex')); // '3745e48...aa39b34'
```

```cjs
const { scryptSync } = require('crypto');
// Using the factory defaults.

const key1 = scryptSync('password', 'salt', 64);
console.log(key1.toString('hex')); // '3745e48...08d59ae'
// Using a custom N parameter. Must be a power of two.
const key2 = scryptSync('password', 'salt', 64, {
  N: 1024,
});
console.log(key2.toString('hex')); // '3745e48...aa39b34'
```

### `crypto.secureHeapUsed()`

<!-- YAML
added: v15.6.0
-->

- Возвращает: {Object}
  - `total` {number} Общий размер выделенной безопасной кучи, указанный с помощью `--secure-heap=n` флаг командной строки.
  - `min` {number} Минимальное выделение из защищенной кучи, указанное с помощью `--secure-heap-min` флаг командной строки.
  - `used` {number} Общее количество байтов, выделенных в настоящее время из защищенной кучи.
  - `utilization` {number} Расчетный коэффициент `used` к `total` выделенные байты.

### `crypto.setEngine(engine[, flags])`

<!-- YAML
added: v0.11.11
-->

- `engine` {нить}
- `flags` {crypto.constants} **Дефолт:** `crypto.constants.ENGINE_METHOD_ALL`

Загрузите и установите `engine` для некоторых или всех функций OpenSSL (выбранных флажками).

`engine` может быть либо идентификатором, либо путем к разделяемой библиотеке движка.

Необязательный `flags` аргумент использует `ENGINE_METHOD_ALL` по умолчанию. В `flags` является битовым полем, принимающим один из следующих флагов или их сочетание (определено в `crypto.constants`):

- `crypto.constants.ENGINE_METHOD_RSA`
- `crypto.constants.ENGINE_METHOD_DSA`
- `crypto.constants.ENGINE_METHOD_DH`
- `crypto.constants.ENGINE_METHOD_RAND`
- `crypto.constants.ENGINE_METHOD_EC`
- `crypto.constants.ENGINE_METHOD_CIPHERS`
- `crypto.constants.ENGINE_METHOD_DIGESTS`
- `crypto.constants.ENGINE_METHOD_PKEY_METHS`
- `crypto.constants.ENGINE_METHOD_PKEY_ASN1_METHS`
- `crypto.constants.ENGINE_METHOD_ALL`
- `crypto.constants.ENGINE_METHOD_NONE`

Приведенные ниже флаги устарели в OpenSSL-1.1.0.

- `crypto.constants.ENGINE_METHOD_ECDH`
- `crypto.constants.ENGINE_METHOD_ECDSA`
- `crypto.constants.ENGINE_METHOD_STORE`

### `crypto.setFips(bool)`

<!-- YAML
added: v10.0.0
-->

- `bool` {логический} `true` для включения режима FIPS.

Включает FIPS-совместимого поставщика криптографии в сборке Node.js с поддержкой FIPS. Выдает ошибку, если режим FIPS недоступен.

### `crypto.sign(algorithm, data, key[, callback])`

<!-- YAML
added: v12.0.0
changes:
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37500
    description: Optional callback argument added.
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/29292
    description: This function now supports IEEE-P1363 DSA and ECDSA signatures.
-->

<!--lint disable maximum-line-length remark-lint-->

- `algorithm` {строка | null | неопределенный}
- `data` {ArrayBuffer | Buffer | TypedArray | DataView}
- `key` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
- `callback` {Функция}
  - `err` {Ошибка}
  - `signature` {Буфер}
- Возвращает: {Buffer}, если `callback` функция не предусмотрена.

<!--lint enable maximum-line-length remark-lint-->

Вычисляет и возвращает подпись для `data` используя данный закрытый ключ и алгоритм. Если `algorithm` является `null` или `undefined`, то алгоритм зависит от типа ключа (особенно Ed25519 и Ed448).

Если `key` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан [`crypto.createPrivateKey()`](#cryptocreateprivatekeykey). Если это объект, можно передать следующие дополнительные свойства:

- `dsaEncoding` {строка} Для DSA и ECDSA этот параметр определяет формат сгенерированной подписи. Это может быть одно из следующих значений:
  - `'der'` (по умолчанию): кодирование структуры подписи ASN.1 в формате DER `(r, s)`.
  - `'ieee-p1363'`: Формат подписи `r || s` как предложено в IEEE-P1363.
- `padding` {integer} Необязательное значение заполнения для RSA, одно из следующих:

  - `crypto.constants.RSA_PKCS1_PADDING` (дефолт)
  - `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая использовалась для подписи сообщения, как указано в разделе 3.1. [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

- `saltLength` {integer} Длина соли при заполнении `RSA_PKCS1_PSS_PADDING`. Особая ценность `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли по размеру переваривания, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) устанавливает максимально допустимое значение.

Если `callback` при условии, что эта функция использует пул потоков libuv.

### `crypto.timingSafeEqual(a, b)`

<!-- YAML
added: v6.6.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: The a and b arguments can also be ArrayBuffer.
-->

- `a` {ArrayBuffer | Buffer | TypedArray | DataView}
- `b` {ArrayBuffer | Buffer | TypedArray | DataView}
- Возвращает: {логическое}

Эта функция основана на алгоритме постоянного времени. Возвращает истину, если `a` равно `b`, без утечки информации о времени, которая позволила бы злоумышленнику угадать одно из значений. Это подходит для сравнения дайджестов HMAC или секретных значений, таких как файлы cookie аутентификации или [URL-адреса возможностей](https://www.w3.org/TR/capability-urls/).

`a` а также `b` оба должны быть `Buffer`с, `TypedArray`s, или `DataView`s, и они должны иметь одинаковую длину в байтах.

Если хотя бы один из `a` а также `b` это `TypedArray` с более чем одним байтом на запись, например `Uint16Array`, результат будет вычислен с использованием порядка байтов платформы.

Использование `crypto.timingSafeEqual` не гарантирует, что _окружающий_ код безопасен по времени. Следует позаботиться о том, чтобы окружающий код не привносил временные уязвимости.

### `crypto.verify(algorithm, data, key, signature[, callback])`

<!-- YAML
added: v12.0.0
changes:
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

<!--lint disable maximum-line-length remark-lint-->

- `algorithm` {строка | null | undefined}
- `data` {ArrayBuffer | Буфер | TypedArray | DataView}
- `key` {Объект | строка | ArrayBuffer | Buffer | TypedArray | DataView | KeyObject | CryptoKey}
- `signature` {ArrayBuffer | Buffer | TypedArray | DataView}
- `callback` {Функция}
  - `err` {Ошибка}
  - `result` {логический}
- Возвращает: {логическое} `true` или `false` в зависимости от действительности подписи для данных и открытого ключа, если `callback` функция не предусмотрена.

<!--lint enable maximum-line-length remark-lint-->

Проверяет данную подпись для `data` используя данный ключ и алгоритм. Если `algorithm` является `null` или `undefined`, то алгоритм зависит от типа ключа (особенно Ed25519 и Ed448).

Если `key` это не [`KeyObject`](#class-keyobject), эта функция ведет себя так, как если бы `key` был передан [`crypto.createPublicKey()`](#cryptocreatepublickeykey). Если это объект, можно передать следующие дополнительные свойства:

- `dsaEncoding` {строка} Для DSA и ECDSA этот параметр определяет формат подписи. Это может быть одно из следующих значений:
  - `'der'` (по умолчанию): кодирование структуры подписи ASN.1 в формате DER `(r, s)`.
  - `'ieee-p1363'`: Формат подписи `r || s` как предложено в IEEE-P1363.
- `padding` {integer} Необязательное значение заполнения для RSA, одно из следующих:

  - `crypto.constants.RSA_PKCS1_PADDING` (дефолт)
  - `crypto.constants.RSA_PKCS1_PSS_PADDING`

  `RSA_PKCS1_PSS_PADDING` будет использовать MGF1 с той же хеш-функцией, которая использовалась для подписи сообщения, как указано в разделе 3.1. [RFC 4055](https://www.rfc-editor.org/rfc/rfc4055.txt).

- `saltLength` {integer} Длина соли при заполнении `RSA_PKCS1_PSS_PADDING`. Особая ценность `crypto.constants.RSA_PSS_SALTLEN_DIGEST` устанавливает длину соли по размеру переваривания, `crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN` (по умолчанию) устанавливает максимально допустимое значение.

В `signature` аргумент - это предварительно вычисленная подпись для `data`.

Поскольку открытые ключи могут быть получены из закрытых ключей, закрытый ключ или открытый ключ может быть передан для `key`.

Если `callback` при условии, что эта функция использует пул потоков libuv.

### `crypto.webcrypto`

<!-- YAML
added: v15.0.0
-->

Тип: {Crypto} Реализация стандарта Web Crypto API.

Увидеть [Документация по Web Crypto API](webcrypto.md) для подробностей.

## Примечания

### Использование строк в качестве входных данных для криптографических API

По историческим причинам многие криптографические API, предоставляемые Node.js, принимают строки в качестве входных данных, где основной криптографический алгоритм работает с последовательностями байтов. Эти экземпляры включают открытые тексты, зашифрованные тексты, симметричные ключи, векторы инициализации, парольные фразы, соли, теги аутентификации и дополнительные аутентифицированные данные.

При передаче строк в криптографические API-интерфейсы учитывайте следующие факторы.

- Не все последовательности байтов являются допустимыми строками UTF-8. Следовательно, когда байтовая последовательность длины `n` происходит от строки, его энтропия обычно ниже, чем энтропия случайного или псевдослучайного `n` байтовая последовательность. Например, отсутствие строки UTF-8 не приведет к последовательности байтов. `c0 af`. Секретные ключи должны быть почти исключительно случайными или псевдослучайными последовательностями байтов.
- Аналогичным образом, при преобразовании случайных или псевдослучайных последовательностей байтов в строки UTF-8 подпоследовательности, которые не представляют действительные кодовые точки, могут быть заменены символом замены Unicode (`U+FFFD`). Таким образом, байтовое представление результирующей строки Unicode может не совпадать с последовательностью байтов, из которой была создана строка.

  ```js
  const original = [0xc0, 0xaf];
  const bytesAsString = Buffer.from(original).toString(
    'utf8'
  );
  const stringAsBytes = Buffer.from(bytesAsString, 'utf8');
  console.log(stringAsBytes);
  // Prints '<Buffer ef bf bd ef bf bd>'.
  ```

  Выходные данные шифров, хэш-функций, алгоритмов подписи и функций вывода ключей являются псевдослучайными последовательностями байтов и не должны использоваться в качестве строк Unicode.

- Когда строки получаются из пользовательского ввода, некоторые символы Unicode могут быть представлены несколькими эквивалентными способами, что приводит к различным последовательностям байтов. Например, при передаче ключевой фразы в функцию получения ключа, такую как PBKDF2 или scrypt, результат функции получения ключа зависит от того, использует ли строка составные или разложенные символы. Node.js не нормализует представления символов. Разработчикам следует рассмотреть возможность использования [`String.prototype.normalize()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize) на вводимые пользователем данные перед их передачей в криптографические API.

### API устаревших потоков (до Node.js 0.10)

Модуль Crypto был добавлен в Node.js до того, как появилась концепция унифицированного Stream API, и до того, как появились [`Buffer`](buffer.md) объекты для обработки двоичных данных. Таким образом, многие из `crypto` определенные классы имеют методы, которые обычно не встречаются в других классах Node.js, которые реализуют [потоки](stream.md) API (например, `update()`, `final()`, или `digest()`). Кроме того, многие методы принимаются и возвращаются `'latin1'` закодированные строки по умолчанию, а не `Buffer`с. Это значение по умолчанию было изменено после того, как Node.js v0.8 стал использовать [`Buffer`](buffer.md) вместо этого объекты по умолчанию.

### Последние изменения ECDH

Использование `ECDH` с нединамически генерируемыми парами ключей было упрощено. Теперь, [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding) может быть вызван с предварительно выбранным закрытым ключом, и связанная с ним общедоступная точка (ключ) будет вычислена и сохранена в объекте. Это позволяет коду хранить и предоставлять только частную часть пары ключей EC. [`ecdh.setPrivateKey()`](#ecdhsetprivatekeyprivatekey-encoding) теперь также подтверждает, что закрытый ключ действителен для выбранной кривой.

В [`ecdh.setPublicKey()`](#ecdhsetpublickeypublickey-encoding) метод устарел, так как его включение в API бесполезно. Либо должен быть установлен ранее сохраненный закрытый ключ, который автоматически генерирует связанный открытый ключ, либо [`ecdh.generateKeys()`](#ecdhgeneratekeysencoding-format) должен называться. Главный недостаток использования [`ecdh.setPublicKey()`](#ecdhsetpublickeypublickey-encoding) заключается в том, что его можно использовать для перевода пары ключей ECDH в несогласованное состояние.

### Поддержка слабых или скомпрометированных алгоритмов

В `crypto` модуль по-прежнему поддерживает некоторые алгоритмы, которые уже скомпрометированы и в настоящее время не рекомендуются для использования. API также позволяет использовать шифры и хэши с небольшим размером ключа, которые слишком слабы для безопасного использования.

Пользователи должны нести полную ответственность за выбор алгоритма шифрования и размера ключа в соответствии со своими требованиями к безопасности.

На основании рекомендаций [NIST SP 800-131A](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-131Ar1.pdf):

- MD5 и SHA-1 больше не приемлемы там, где требуется устойчивость к коллизиям, например цифровые подписи.
- Рекомендуется, чтобы ключ, используемый с алгоритмами RSA, DSA и DH, имел не менее 2048 бит, а ключ кривой ECDSA и ECDH - не менее 224 бит, чтобы его можно было безопасно использовать в течение нескольких лет.
- Группы DH `modp1`, `modp2` а также `modp5` иметь размер ключа меньше 2048 бит и не рекомендуется.

См. Ссылку для других рекомендаций и деталей.

### CCM режим

СКК - один из поддерживаемых [Алгоритмы AEAD](https://en.wikipedia.org/wiki/Authenticated_encryption). Приложения, использующие этот режим, должны придерживаться определенных ограничений при использовании API шифрования:

- Длина тега аутентификации должна быть указана во время создания шифра путем установки параметра `authTagLength` вариант и должен быть одним из 4, 6, 8, 10, 12, 14 или 16 байтов.
- Длина вектора инициализации (nonce) `N` должно быть от 7 до 13 байтов (`7 ≤ N ≤ 13`).
- Длина открытого текста ограничена `2 ** (8 * (15 - N))` байтов.
- При расшифровке тег аутентификации должен быть установлен через `setAuthTag()` перед звонком `update()`. В противном случае расшифровка не удастся и `final()` выдаст ошибку в соответствии с разделом 2.6 [RFC 3610](https://www.rfc-editor.org/rfc/rfc3610.txt).
- Использование потоковых методов, таких как `write(data)`, `end(data)` или `pipe()` в режиме CCM может произойти сбой, поскольку CCM не может обрабатывать более одного блока данных на экземпляр.
- При передаче дополнительных аутентифицированных данных (AAD) длина фактического сообщения в байтах должна быть передана в `setAAD()` через `plaintextLength` вариант. Многие криптографические библиотеки включают тег аутентификации в зашифрованный текст, что означает, что они создают зашифрованные тексты длины `plaintextLength + authTagLength`. Node.js не включает тег аутентификации, поэтому длина зашифрованного текста всегда равна `plaintextLength`. В этом нет необходимости, если AAD не используется.
- Поскольку CCM обрабатывает все сообщение сразу, `update()` должен быть вызван ровно один раз.
- Хотя звонит `update()` достаточно, чтобы зашифровать / расшифровать сообщение, приложения _должен_ вызов `final()` для вычисления или проверки тега аутентификации.

```mjs
import { Buffer } from 'buffer';
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} = await import('crypto');

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
  throw new Error('Authentication failed!', { cause: err });
}

console.log(receivedPlaintext);
```

```cjs
const {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} = require('crypto');
const { Buffer } = require('buffer');

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
  throw new Error('Authentication failed!', { cause: err });
}

console.log(receivedPlaintext);
```

## Константы криптографии

Следующие константы, экспортируемые `crypto.constants` применяются к различным видам использования `crypto`, `tls`, а также `https` модули и обычно относятся к OpenSSL.

### Параметры OpenSSL

Увидеть [список флагов SSL OP](https://wiki.openssl.org/index.php/List_of_SSL_OP_Flags#Table_of_Options) для подробностей.

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>SSL_OP_ALL</code></td>
    <td>Applies multiple bug workarounds within OpenSSL. See
    <a href="https://www.openssl.org/docs/man1.0.2/ssl/SSL_CTX_set_options.html">https://www.openssl.org/docs/man1.0.2/ssl/SSL_CTX_set_options.html</a>
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
    <a href="https://www.openssl.org/docs/man1.0.2/ssl/SSL_CTX_set_options.html">https://www.openssl.org/docs/man1.0.2/ssl/SSL_CTX_set_options.html</a>.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_CIPHER_SERVER_PREFERENCE</code></td>
    <td>Attempts to use the server's preferences instead of the client's when
    selecting a cipher. Behavior depends on protocol version. See
    <a href="https://www.openssl.org/docs/man1.0.2/ssl/SSL_CTX_set_options.html">https://www.openssl.org/docs/man1.0.2/ssl/SSL_CTX_set_options.html</a>.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_CISCO_ANYCONNECT</code></td>
    <td>Instructs OpenSSL to use Cisco's "speshul" version of DTLS_BAD_VER.</td>
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
    <td><code>SSL_OP_EPHEMERAL_RSA</code></td>
    <td>Instructs OpenSSL to always use the tmp_rsa key when performing RSA
    operations.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_LEGACY_SERVER_CONNECT</code></td>
    <td>Allows initial connection to servers that do not support RI.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_MICROSOFT_SESS_ID_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_MSIE_SSLV2_RSA_PADDING</code></td>
    <td>Instructs OpenSSL to disable the workaround for a man-in-the-middle
    protocol-version vulnerability in the SSL 2.0 server implementation.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_NETSCAPE_CA_DN_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_NETSCAPE_CHALLENGE_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG</code></td>
    <td></td>
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
    <td><code>SSL_OP_PKCS1_CHECK_1</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_PKCS1_CHECK_2</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_PRIORITIZE_CHACHA</code></td>
    <td>Instructs OpenSSL server to prioritize ChaCha20Poly1305
    when client does.
    This option has no effect if
    <code>SSL_OP_CIPHER_SERVER_PREFERENCE</code>
    is not enabled.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_SINGLE_DH_USE</code></td>
    <td>Instructs OpenSSL to always create a new key when using
    temporary/ephemeral DH parameters.</td>
  </tr>
  <tr>
    <td><code>SSL_OP_SINGLE_ECDH_USE</code></td>
    <td>Instructs OpenSSL to always create a new key when using
    temporary/ephemeral ECDH parameters.</td>
  </tr>
    <td><code>SSL_OP_SSLEAY_080_CLIENT_DH_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_TLS_BLOCK_PADDING_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_TLS_D5_BUG</code></td>
    <td></td>
  </tr>
  <tr>
    <td><code>SSL_OP_TLS_ROLLBACK_BUG</code></td>
    <td>Instructs OpenSSL to disable version rollback attack detection.</td>
  </tr>
</table>

### Константы движка OpenSSL

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
    <td>Limit engine usage to PKEY_METHDS</td>
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

### Другие константы OpenSSL

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
    <td><code>ALPN_ENABLED</code></td>
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

### Крипто-константы Node.js

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
