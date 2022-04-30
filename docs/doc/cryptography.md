# Криптография

Выполнение функций криптографии в Node.js обеспечивает встроенный в платформу модуль [`crypto`](../api/crypto.md), который поддерживает алгоритмы для шифрования и расшифровки данных, генерацию сертификатов, хэш-функции и т. д.

Модуль `crypto` входит не во все сборки Node.js, поэтому его использование в приложении, запускаемом на разных сервера, может быть не всегда возможным. Чтобы проверить доступность модуля, добавьте следующий код.

```js
let crypto;

try {
  crypto = require('crypto');
} catch (err) {
  console.log('Crypto module is unavailable');
}
```

Для получения списка поддерживаемых в Node.js алгоритмов шифрования, выполните у экземпляра модуля `crypto` функцию `getCiphers()`.

```js
const crypto = require('crypto');

console.log(crypto.getCiphers());
```

В рамках данной статьи рассмотрены шифрование и расшифровка данных.

Шифрование данных по заданному алгоритму осуществляется в три этапа:

- Создание объекта `Cipher`;
- Добавление к созданному объекту данных, которые необходимо зашифровать;
- Завершение процесса шифрования.

Объект `Cipher` создается вызовом метода `crypto.createCipheriv()`, который принимает три параметра:

- алгоритм;
- ключ;
- вектор инициализации (необязательный).

Обогащение созданного объекта `Cipher` данными осуществляется с помощью метода `[CipherInstance].update()`, которому можно передать следующие аргументы:

- данные для шифрования;
- кодировка исходных данных (необязательный);
- кодировка возвращаемого методом значения (необязательный).

Завершение процесса шифрования осуществляется вызовом метода `final()`, принимающему кодировку зашифрованных данных.

Рассмотрим пример шифрования данных.

_cipher.js_

```js
const crypto = require('crypto');

const iv = crypto.randomBytes(16); //генерация вектора инициализации
const key = crypto.scryptSync('secret', 'salt', 32); //генерация ключа

const encyptedData = crypto
  .createCipheriv('aes-256-cbc', key, iv)
  .update('Any data', 'utf8', 'hex')
  .final('hex');

console.log(encryptedData);
```

!!! note ""

    В зависимости от используемого алгоритма длина вектора инициализации может отличаться.

Теперь рассмотрим, как расшифровать зашифрованные данные. В качестве зашифрованных данных возьмем результат из предыдущего примера. Последовательность действий та же, только вместо метода `createCipher()` используется `createDecipher()`.

_decipher.js_

```js
const crypto = require('crypto');

const iv = crypto.randomBytes(16); //генерация вектора инициализации
const key = crypto.scryptSync('secret', 'salt', 32); //генерация ключа

const decyptedData = crypto
  .createDecipheriv('aes-256-cbc', key, iv)
  .update(encryptedData, 'hex', 'utf8')
  .final('utf8');

console.log(decryptedData); //Any data
```

Процесс шифрования представляет собой поток. Поэтому пример выше может быть переписан следующим образом.

_crypto-stream.js_

```js
const crypto = require('crypto');

const iv = crypto.randomBytes(16); //генерация вектора инициализации
const key = crypto.scryptSync('secret', 'salt', 32); //генерация ключа

let cipherStream = crypto.createCipheriv(
  'aes-256-cbc',
  key,
  iv
);

let encryptedData = '';

cipherStream.on(
  'data',
  (data) => (encryptedData += data.toString('hex'))
);

cipherStream.write('Any data');
cipherStream.end();

let decipherStream = crypto.createDecipheriv(
  'aes-256-cbc',
  key,
  iv
);

let decryptedData = '';

decipherStream.on(
  'data',
  (data) => (decryptedData += data)
);
decipherStream.on('end', () => console.log(decryptedData)); //'Any data'

decipherStream.write(encryptedData, 'hex');
decipherStream.end();
```
