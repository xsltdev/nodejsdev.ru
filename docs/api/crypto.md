# Crypto

!!!success "Стабильность: 2"

    Стабильно

Модуль `crypto` предоставляет функционал шифрования, который включает в себя набор wrapper'ов для хэша OpenSSL, HMAC, шифраторов, дешифраторов и функций верификации.

Для доступа к этому модулю используйте `require('crypto')`.

```js
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

## Как определить, доступна ли поддержка шифрования

В Node.js можно сбилдить код без включения поддержки модуля `crypto`. В некоторых случаях, вызов `require('crypto')` приведет к выпадению ошибки:

```js
var crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}
```

## Класс Certificate

SPKAC-механизм запроса на верификацию сертификата, изначально реализованный в Netscape, а сейчас являющийся частью кейгена в HTML5.

Модуль `crypto` дает классу `Certificate` работать с данными SPKAC. Чаще всего используется для обработки выводов, сгенерированными элементом HTML5 `<keygen>`. Node.js использует реализацию OpenSSL SPKAC.

### new crypto.Certificate()

Экземпляры класса `Certificate` могут быть созданы посредством ключевого слова `new` или с помощью вызова функции `crypto.Certificate()`:

```js
const crypto = require('crypto');

const cert1 = new crypto.Certificate();
const cert2 = crypto.Certificate();
```

### certificate.exportChallenge()

```
certificate.exportChallenge(spkac)
```

Структура данных `spkac` включает в себя открытый ключ и челлендж. `certificate.exportChallenge()` возвращает компонент челленджа в виде буфера Node.js. Аргумент `spkac` может быть либо строкой, либо буфером.

```js
const cert = require('crypto').Certificate();
const spkac = getSpkacSomehow();
const challenge = cert.exportChallenge(spkac);
console.log(challenge.toString('utf8'));
// Prints the challenge as a UTF8 string
```

### certificate.exportPublicKey()

```
certificate.exportPublicKey(spkac)
```

Структура данных `spkac` включает в себя открытый ключ и челлендж. `certificate.exportPublicKey()` возвращает компонент открытого ключа в виде буфера Node.js. Аргумент `spkac` может быть либо строкой, либо буфером.

```js
const cert = require('crypto').Certificate();
const spkac = getSpkacSomehow();
const publicKey = cert.exportPublicKey(spkac);
console.log(publicKey);
// Prints the public key as >Buffer ...<
```

### certificate.verifySpkac()

```
certificate.verifySpkac(spkac)
```

Возвращает `true`, если заданная структура данных `spkac` является валидной, и, соответственно, `false` во всех иных случаях. Аргумент `spkac` должен быть в виде буфера Node.js.

```js
const cert = require('crypto').Certificate();
const spkac = getSpkacSomehow();
console.log(cert.verifySpkac(Buffer.from(spkac)));
// Prints true or false
```

## Класс Cipher

Экземпляры класса `Cipher` используются для шифрования данных. Класс можно использовать двумя способами:

- как стрим, который явялется открытым для чтения и записи одновременно, где нешифрованные данные записываются для получения читаемых шифрованных данных, или
- применяя методы `cipher.update()` и `cipher.final()` для получения шифрованных данных.

Методы `crypto.createCipher()` или `crypto.createCipheriv()` используются для создания экземпляров `Cipher`. Объекты `Cipher` не могут создаваться непосредственно через ключевое слово `new`.

Пример: использование объектов `Cipher` в качестве стрима:

```js
const crypto = require('crypto');
const cipher = crypto.createCipher('aes192', 'a password');

var encrypted = '';
cipher.on('readable', () => {
  var data = cipher.read();
  if (data) encrypted += data.toString('hex');
});
cipher.on('end', () => {
  console.log(encrypted);
  // Prints: ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504
});

cipher.write('some clear text data');
cipher.end();
```

Еще пример: использования `Cipher` и стримов (piped streams):

```js
const crypto = require('crypto');
const fs = require('fs');
const cipher = crypto.createCipher('aes192', 'a password');

const input = fs.createReadStream('test.js');
const output = fs.createWriteStream('test.enc');

input.pipe(cipher).pipe(output);
```

Еще пример: использование методов `cipher.update()` и `cipher.final()`:

```js
const crypto = require('crypto');
const cipher = crypto.createCipher('aes192', 'a password');

var encrypted = cipher.update(
  'some clear text data',
  'utf8',
  'hex'
);
encrypted += cipher.final('hex');
console.log(encrypted);
// Prints: ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504
```

### cipher.final()

```
cipher.final([output_encoding])
```

Возвращает все оставшееся зашифрованное содержимое. Если параметр `output_encoding` – один из `binary`, `base64` или `hex`, возвращается строка. Если `output_encoding` нет, то возвращается буфер.

После вызова метода `cipher.final()`, объект `Cipher` больше нельзя использовать для шифрования данных. Попытки вызвать `cipher.final()` больше одного раза приведут к выпадению ошибки.

### cipher.setAAD()

```
cipher.setAAD(buffer)
```

При использовании режима проверки подлинности шифрования (authenticated encryption mode) (на данный момент поддерживается только GCM), метод `cipher.setAAD()` устанавливает значение, используемое для входящего параметра AAD (additional authenticated data – дополнительные данные аутентификации).

### cipher.getAuthTag()

При использовании режима проверки подлинности шифрования (authenticated encryption mode), метод `cipher.getAuthTag()` возвращает буфер, содержащий тэг аутентификации, который вычисляется из исходных данных.

Метод `cipher.getAuthTag()` должен вызываться только после завершенного шифрования (в результате применения метода `cipher.final()`).

### cipher.setAutoPadding()

```
cipher.setAutoPadding(auto_padding=true)
```

При использования блоковых алгоритмов щифрования, класс `Cipher` автоматически добавляет паддинг во входящие данные в,блок с подходящим размером. Для отключения этой функции по умолчанию, следует использовать `cipher.setAutoPadding(false)`.

Если `auto_padding` имеет значение `false`, длина всех входящих данных должна быть кратной размеру блока шифра, иначе `cipher.final()` выдаст ошибку. Отключение автоматического добавления паддинга может быть полезным в тех случаях, где паддинг нестандартный, например, `0x0` вместо PKCS.

Метод `cipher.setAutoPadding()` нужно вызывать перед `cipher.final()`.

### cipher.update()

```
cipher.update(data[, input_encoding][, output_encoding])
```

Обновляет шифр с `data`. Если передается аргумент `input_encoding`, его значение должно быть одним из `utf8`, `ascii` или `binary`, а аргумент `data` – строкой с определенной кодировкой. Если аргумент `input_encoding` не передается, `data` должно быть буфером. Если `data` – буфер, `input_encoding` игонорируется.

`output_encoding` определяет формат вывода зашифрованных данных и может быть `binary`, `base64` или `hex`. Если `output_encoding` определено, то возвращается строка, которая использует заданную кодировку. Если `output_encoding` нет, то возвращается буфер.

Метод `cipher.update()` можно вызывать много раз с новыми данными, пока вызывается `cipher.final()`. Вызов `cipher.update()` после `cipher.final()` может привести к выпадению ошибки.

## Класс Decipher

Экземпляры класса `Decipher` используются для дешифровки данных. Класс можно использовать двумя способами:

- как стрим, который явялется открытым для чтения и записи одновременно, где зашифрованные данные записываются для получения читаемых дешифрованных данных, или
- используя методы `decipher.update()` и `decipher.final()` для получения дешифрованных данных.

Методы `crypto.createDecipher()` или `crypto.createDecipheriv()` используются для создания экземпляров `Decipher`. Объекты `Decipher` не могут быть созданы непосредственно с помощью ключевого слова `new`.

Пример: использование объектов `Decipher` как стрим:

```js
const crypto = require('crypto');
const decipher = crypto.createDecipher(
  'aes192',
  'a password'
);

var decrypted = '';
decipher.on('readable', () => {
  var data = decipher.read();
  if (data) decrypted += data.toString('utf8');
});
decipher.on('end', () => {
  console.log(decrypted);
  // Prints: some clear text data
});

var encrypted =
  'ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504';
decipher.write(encrypted, 'hex');
decipher.end();
```

Еще пример: `Decipher` и piped streams:

```js
const crypto = require('crypto');
const fs = require('fs');
const decipher = crypto.createDecipher(
  'aes192',
  'a password'
);

const input = fs.createReadStream('test.enc');
const output = fs.createWriteStream('test.js');

input.pipe(decipher).pipe(output);
```

Еще пример: методы `decipher.update()` и `decipher.final()`:

```js
const crypto = require('crypto');
const decipher = crypto.createDecipher(
  'aes192',
  'a password'
);

var encrypted =
  'ca981be48e90867604588e75d04feabb63cc007a8f8ad89b10616ed84d815504';
var decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
console.log(decrypted);
// Prints: some clear text data
```

### decipher.final()

```
decipher.final([output_encoding])
```

Возвращает все оставшееся дешифрованное содержимое. Если параметр `output_encoding` – один из `binary`, `base64` или `hex`, возвращается строка. Если `output_encoding` нет, то возвращается буфер.

После вызова метода `decipher.final()`, объект `Decipher` больше нельзя использовать для расшифровки данных. Попытки вызвать `decipher.final()` больше одного раза приведут к выпадению ошибки.

### decipher.setAAD()

```
decipher.setAAD(buffer)
```

При использовании режима проверки подлинности шифрования (authenticated encryption mode) (на данный момент поддерживается только GCM), метод `cipher.setAAD()` устанавливает значение, используемое для входящего параметра AAD (additional authenticated data – дополнительные данные аутентификации).

### decipher.setAuthTag()

```
decipher.setAuthTag(buffer)
```

При использовании режима проверки подлинности шифрования (authenticated encryption mode) (на данный момент поддерживается только GCM), метод `decipher.setAAD()` используется для передачи полученного тэга аутентификации. Если тэг не передается, или текст шифра искажен, то выпадает ошибка `decipher.final()`, показывая, что текст шифра будет игнорироваться по причине непройденной аутентификации.

### decipher.setAutoPadding()

```
decipher.setAutoPadding(auto_padding=true)
```

Без использования блоковых алгоритмов щифрования, вызов `decipher.setAutoPadding(false)` приведет к отключению автоматического паддинга с целью предотвращения проверки методом `decipher.final()` паддинга и удаления его.

Отключение автопаддинга будет работать, если длина входящих данных является кратной размеру блока шифра.

Метод `decipher.setAutoPadding()` нужно вызывать перед `decipher.update()`.

### decipher.update()

```
decipher.update(data[, input_encoding][, output_encoding])
```

Обновляет дешифратор с новыми данными `data`. Если передается аргумент `input_encoding`, его значение должно быть одним из `utf8`, `ascii` или `binary`, а аргумент `data` – строкой с определенной кодировкой. Если аргумент `input_encoding` не передается, `data` должно быть буфером. Если `data` – буфер, `input_encoding` игонорируется.

`output_encoding` определяет формат вывода зашифрованных данных и может быть `binary`, `ascii` или `utf8`. Если `output_encoding` определено, то возвращается строка, которая использует заданную кодировку. Если `output_encoding` нет, то возвращается буфер.

Метод `decipher.update()` можно вызывать много раз с новыми данными, пока вызывается `decipher.final()`. Вызов `decipher.update()` после `decipher.final()` может привести к выпадению ошибки.

## Класс DiffieHellman

Класс `DiffieHellman` является утилитой для создания обмена ключами Диффи-Хеллмана.

Экземпляры класса `DiffieHellman` могут быть созданы посредством функции `crypto.createDiffieHellman()`:

```js
const crypto = require('crypto');
const assert = require('assert');

// Generate Alice's keys...
const alice = crypto.createDiffieHellman(2048);
const alice_key = alice.generateKeys();

// Generate Bob's keys...
const bob = crypto.createDiffieHellman(
  alice.getPrime(),
  alice.getGenerator()
);
const bob_key = bob.generateKeys();

// Exchange and generate the secret...
const alice_secret = alice.computeSecret(bob_key);
const bob_secret = bob.computeSecret(alice_key);

// OK
assert.equal(
  alice_secret.toString('hex'),
  bob_secret.toString('hex')
);
```

### diffieHellman.computeSecret()

```
diffieHellman.computeSecret(other_public_key[, input_encoding][, output_encoding])
```

Вычисляет разделенный секрет, используя `other_public_key` как открытый ключ другого участника и возвращает вычисленный разделенный секрет. Предоставляемый ключ интерпретируется посредством определенного `input_encoding`, а секрет кодируется через определенный `output_encoding`. Кодировки могут быть `binary`, `base64` или `hex`. Если `input_encoding` нет, то `other_public_key` должен быть буфером.

Если `output_encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### diffieHellman.generateKeys()

```
diffieHellman.generateKeys([encoding])
```

Генерирует приватные и открытые значения ключа Диффи-Хеллмана и возвращает открытый ключ в указанной кодировке `encoding`. Этот ключ должен быть передан другому участнику. Кодировка может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### diffieHellman.getGenerator()

```
diffieHellman.getGenerator([encoding])
```

Возвращает генератор Диффи-Хеллмана в указанной кодировке `encoding`, которая может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### diffieHellman.getPrime()

```
diffieHellman.getPrime([encoding])
```

Возвращает простое число Диффи-Хеллмана в указанной кодировке `encoding`, которая может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### diffieHellman.getPrivateKey()

```
diffieHellman.getPrivateKey([encoding])
```

Возвращает приватный ключ Диффи-Хеллмана в указанной кодировке `encoding`, которая может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### diffieHellman.getPublicKey()

```
diffieHellman.getPublicKey([encoding])
```

Возвращает публичный ключ Диффи-Хеллмана в указанной кодировке `encoding`, которая может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### diffieHellman.setPrivateKey()

```
diffieHellman.setPrivateKey(private_key[, encoding])
```

Устанавливает приватный ключ Диффи-Хеллмана. Если присутствует аргумент `encoding` либо `binary`, `hex`, или `base64`, то `private_key` должен быть строкой. Если `encoding` нет, то `private_key` будет буфером.

### diffieHellman.setPublicKey()

```
diffieHellman.setPublicKey(private_key[, encoding])
```

Устанавливает публичный ключ Диффи-Хеллмана. Если присутствует аргумент `encoding` либо `binary`, `hex`, или `base64`, то `public_key` должен быть строкой. Если `encoding` нет, то `public_key` будет буфером.

### diffieHellman.verifyError

Битовое поле, которое содержит все варнинги и/или ошибки, полученные в результате проверки, проведенной в ходе инициализации объекта `DiffieHellman`.

Следующие значения являются валидными для этого свойства (как определено в модуле `constants`):

- `DH_CHECK_P_NOT_SAFE_PRIME`
- `DH_CHECK_P_NOT_PRIME`
- `DH_UNABLE_TO_CHECK_GENERATOR`
- `DH_NOT_SUITABLE_GENERATOR`

## Класс ECDH

Класс `ECDH` является утилитой для создания эллиптической кривой Диффи-Хеллмана (Elliptic Curve Diffie-Hellman (ECDH)) для обмена ключами.

Экземпляры класса ECDH могут быть созданы посредством функции `crypto.createECDH()`:

```js
const crypto = require('crypto');
const assert = require('assert');

// Generate Alice's keys...
const alice = crypto.createECDH('secp521r1');
const alice_key = alice.generateKeys();

// Generate Bob's keys...
const bob = crypto.createECDH('secp521r1');
const bob_key = bob.generateKeys();

// Exchange and generate the secret...
const alice_secret = alice.computeSecret(bob_key);
const bob_secret = bob.computeSecret(alice_key);

assert(alice_secret, bob_secret);
// OK
```

### ecdh.computeSecret()

```
ecdh.computeSecret(other_public_key[, input_encoding][, output_encoding])
```

Вычисляет разделенный секрет, используя `other_public_key` как открытый ключ другого участника и возвращает вычисленный разделенный секрет. Предоставляемый ключ интерпретируется посредством определенного `input_encoding`, а секрет кодируется через определенный `output_encoding`. Кодировки могут быть `binary`, `base64` или `hex`. Если `input_encoding` нет, то `other_public_key` должен быть буфером.

Если `output_encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### ecdh.generateKeys()

```
ecdh.generateKeys([encoding[, format]])
```

Генерирует приватные и открытые значения ключа EC Диффи-Хеллмана и возвращает открытый ключ в заданном формате `format` и кодировке `encoding`. Этот ключ должен быть передан другому участнику.

Аргументы `format` указывают на точку кодирования и могут быть `compressed`, `uncompressed` или `hybrid`, Если `format` не указан, точка возвращается в формате `uncompressed`.

Аргумент `encoding` может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### ecdh.getPrivateKey()

```
ecdh.getPrivateKey([encoding])
```

Возвращает приватный ключ EC Диффи-Хеллмана в указанной кодировке `encoding`, которая может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### ecdh.getPublicKey()

```
ecdh.getPublicKey([encoding[, format]])
```

Возвращает публичный ключ EC Диффи-Хеллмана в указанной кодировке `encoding` и формате `format`. Аргумент `format` указывает на точку кодирования и могут быть `compressed`, `uncompressed` или `hybrid`, Если `format` не указан, точка возвращается в формате `uncompressed`.

Аргумент `encoding` может быть `binary`, `base64` или `hex`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

### ecdh.setPrivateKey()

```
ecdh.setPrivateKey(private_key[, encoding])
```

Устанавливает приватный ключ Диффи-Хеллмана. `encoding` может быть `binary`, `hex`, или `base64`, то `private_key` должен быть строкой. Если `encoding` нет, то `private_key` будет буфером. Если `private_key` не валидный для указанной кривой при создании объекта ECDH, то выпадает ошибка. Перед установкой приватного ключа, соответствующая открытая точка (ключ) также генерируется и устанавливается в объект ECDH.

### ecdh.setPublicKey()

!!!danger "Стабильность: 0 - Отказано"

```
ecdh.setPublicKey(private_key[, encoding])
```

Устанавливает публичный (открытый) ключ Диффи-Хеллмана. Ключевая кодировка `encoding` может быть `binary`, `hex`, или `base64`, то `public_key` должен быть строкой. Если `encoding` нет, то `public_key` будет буфером.

!!!note "Примечание"

    Обычно нет причин вызывать этот метод, так как ECDH для вычисления разделенного секрета требует только приватный ключ и публичный ключ другого участника. Вызывается либо `ecdh.generateKeys()`, либо `ecdh.setPrivateKey()`. Метод `ecdh.setPrivateKey()` пытается сгенерировать публичный ключ, соответствующий установленному приватному ключу.

Пример (получение разделенного секрета):

```js
const crypto = require('crypto');
const alice = crypto.createECDH('secp256k1');
const bob = crypto.createECDH('secp256k1');

// Note: This is a shortcut way to specify one of Alice's previous private
// keys. It would be unwise to use such a predictable private key in a real
// application.
alice.setPrivateKey(
  crypto
    .createHash('sha256')
    .update('alice', 'utf8')
    .digest()
);

// Bob uses a newly generated cryptographically strong
// pseudorandom key pair bob.generateKeys();

const alice_secret = alice.computeSecret(
  bob.getPublicKey(),
  null,
  'hex'
);
const bob_secret = bob.computeSecret(
  alice.getPublicKey(),
  null,
  'hex'
);

// alice_secret and bob_secret should be the same shared secret value
console.log(alice_secret === bob_secret);
```

## Класс Hmac

Класс `Hmac` является утилитой для создания криптографических дайджестов HMAC. Его можно использовать так:

- как стрим, который явялется открытым для чтения и записи одновременно, где данные записываются для получения вычисляемого HMAC-дайджеста, или
- используя методы `hmac.update()` и `hmac.digest()` для получения вычисляемого хэша.

Метод `crypto.createHmac()` используется для создания экземпляров `Hmac`. Объекты `Hmac` не создаются непосредственно с помощью ключевого слова `new`.

Пример: использование объектов `Hmac` как стрим:

```js
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', 'a secret');

hmac.on('readable', () => {
  var data = hmac.read();
  if (data) console.log(data.toString('hex'));
  // Prints:
  //   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
});

hmac.write('some data to hash');
hmac.end();
```

Пример: использование `Hmac` и направленных стримов (piped streams):

```js
const crypto = require('crypto');
const fs = require('fs');
const hmac = crypto.createHmac('sha256', 'a secret');

const input = fs.createReadStream('test.js');
input.pipe(hmac).pipe(process.stdout);
```

Использование методов `hmac.update()` и `hmac.digest()`:

```js
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', 'a secret');

hmac.update('some data to hash');
console.log(hmac.digest('hex'));
// Prints:
//   7fd04df92f636fd450bc841c9418e5825c17f33ad9c87c518115a45971f7f77e
```

### hmac.digest()

```
hmac.digest([encoding])
```

Подсчитывает HMAC-дайджест всех данных, передаваемых через метод `hmac.update()`. `encoding` может быть `latin1`, `hex`, или `base64`. Если `encoding` передается, то возвращается строка, во всех других случаях возвращается буфер.

Объект `Hmac` нельзя использовать снова после вызова метода `hmac.digest()`. Множественнные вызовы `hmac.digest()` могут привести к ошибке.

### hmac.update()

```
hmac.update(data[, input_encoding])
```

Обновляет контент `Hmac` с передаваемыми данными, кодировка которых предоставляется в `input_encoding` и может быть `latin1`, `ascii`, или `utf8`. Если `encoding` не передается, то `data` будет строкой, к которой применяется кодировка `utf8`. Если `data` – буфер, то `input_encoding` игнорируется.

Этот метод можно вызывать многоразово, каждый раз с новыми данными, пока они содержатся в стриме.

## Класс Sign

Класс `Sign` является утилитой для генерации подписей. Его можно использовать двумя способами:

- как стрим, который явялется открытым для записи, куда записываются данные для подписи , а метод `sign.sign()` используется для генерации и возвращения подписей, или
- используя методы `sign.update()` и `sign.sign()` для получения подписей.

Метод `crypto.createSign()` используется для создания экземпляров `Sign`. Объекты `Sign` не создаются непосредственно с помощью ключевого слова `new`.

Пример: использование объектов `Sign` как стрим:

```js
const crypto = require('crypto');
const sign = crypto.createSign('RSA-SHA256');

sign.write('some data to sign');
sign.end();

const private_key = getPrivateKeySomehow();
console.log(sign.sign(private_key, 'hex'));
// Prints the calculated signature
```

Использование методов `sign.update()` и `sign.sign()`:

```js
const crypto = require('crypto');
const sign = crypto.createSign('RSA-SHA256');

sign.update('some data to sign');

const private_key = getPrivateKeySomehow();
console.log(sign.sign(private_key, 'hex'));
// Prints the calculated signature
```

Экзепляры `Sign` также могут быть созданы методом передачи имени алгоритма дайджеста, в этом случае OpenSSL будет выполнять полный алгоритм подписи из PEM-форматированного приватного ключа, включая алгоритмы, который не имеют прямозаданных констант имен, например, 'ecdsa-with-SHA256'

Пример: подпись с использованием ECDSA и SHA256:

```js
const crypto = require('crypto');
const sign = crypto.createSign('sha256');

sign.update('some data to sign');

const private_key =
  '-----BEGIN EC PRIVATE KEY-----\n' +
  'MHcCAQEEIF+jnWY1D5kbVYDNvxxo/Y+ku2uJPDwS0r/VuPZQrjjVoAoGCCqGSM49\n' +
  'AwEHoUQDQgAEurOxfSxmqIRYzJVagdZfMMSjRNNhB8i3mXyIMq704m2m52FdfKZ2\n' +
  'pQhByd5eyj3lgZ7m7jbchtdgyOF8Io/1ng==\n' +
  '-----END EC PRIVATE KEY-----\n';

console.log(sign.sign(private_key).toString('hex'));
```

### sign.sign()

```
sign.sign(private_key[, output_format])
```

Вычисляет подпись для всех данных, передаваемых посредстом `sign.update()` или `sign.write()`

Агрумент `private_key` может быть объектом либо строкой. Если `private_key` – строка, то она воспринимается, как сырой ключ без ключевой фразы. Если же `private_key` – объект, то он интерпретируется как два хэш-содержащих свойства:

- `key`: `Строка` – PEM-кодированный приватный ключ
- `passphrase`: `Строка` – ключевая фраза для приватного ключа

`output_format` может задавать одну из кодировок: `latin1`, `ascii`, или `utf8`. Если `output_format` передается, возвращается строка, во всех других случаях возвращается буфер.

Объект `Sign` нельзя использовать снова после вызова метода `sign.sign()`, так как множественные вызовы последнего могут привести к ошибке.

### sign.update()

```
sign.update(data[, input_encoding])
```

Обновляет контент `Sign` с передаваемыми данными, кодировка которых предоставляется в `input_encoding` и может быть `latin1`, `ascii`, или `utf8`. Если `encoding` не передается, то `data` будет строкой, к которой применяется кодировка `utf8`. Если `data` – буфер, то `input_encoding` игнорируется.

Этот метод можно вызывать многоразово, каждый раз с новыми данными, пока они содержатся в стриме.

## Класс Verify

Класс `Verify` – это утилита для подтверждения подписей. Его можно использовать такими способами:

- как стрим, который явялется открытым для записи, где записанные данные используются для валидации подписи, или
- используя методы `verify.update()` и `verify.verify()` для подтверждения подписей.

Метод `crypto.createSign()` используется для создания экземпляров `Sign`. Объекты `Sign` не создаются непосредственно с помощью ключевого слова `new`.

Пример: использование объектов `Verify` как стрим:

```js
const crypto = require('crypto');
const verify = crypto.createVerify('RSA-SHA256');

verify.write('some data to sign');
verify.end();

const public_key = getPublicKeySomehow();
const signature = getSignatureToVerify();
console.log(verify.verify(public_key, signature));
// Prints true or false
```

Использование методов `verify.update()` и `verify.verify()`:

```js
const crypto = require('crypto');
const verify = crypto.createVerify('RSA-SHA256');

verify.update('some data to sign');

const public_key = getPublicKeySomehow();
const signature = getSignatureToVerify();
console.log(verify.verify(public_key, signature));
// Prints true or false
```

### verifier.update()

```
verifier.update(data[, input_encoding])
```

Обновляет контент `Verify` с передаваемыми данными, кодировка которых предоставляется в `input_encoding` и может быть `latin1`, `ascii`, или `utf8`. Если `encoding` не передается, то `data` будет строкой, к которой применяется кодировка `utf8`. Если `data` – буфер, то `input_encoding` игнорируется.

Этот метод можно вызывать многоразово, каждый раз с новыми данными, пока они содержатся в стриме.

### verifier.verify()

```
verifier.verify(object, signature[, signature_format])
```

Подтверждает передаваемые данные, используя заданные `object` и `signature`. Аргумент `object` является строкой, содержащей PEM-кодированный объект, который может быть либо публичным ключом RSA, либо публичным ключом DSA, либо сертификатом X.509. Аргумент `signature` является предварительно вычисленной подписью для данных в формате `signature_format`, который может быть `latin1`, `hex`, или `base64`. Если задан `signature_format`, то `signature` должен быть строкой, в иных случаях это будет буфер.

Возвращает `true` или `false` в зависимости от валидности подписи для данных и публичного ключа.

Объект `verifier` нельзя использовать снова после вызова метода `verify.verify()`. Множественнные вызовы `verify.verify()` могут привести к ошибке.

## Методы и свойства модулей шифрования

### crypto.constants

Возвращают объект, содержащий общеиспользуемые константы для шифрования и операций, связанных с защитой. Специальные константы, которыми пользуются в настоящее время, описаны в "Константах криптографии".

### crypto.DEFAULT_ENCODING

Кодировка по умолчанию для использования в функциях, которые могут иметь в качестве аргумента строку или буфер. Значение по умолчанию - `buffer`, что делает метод применяемым по умолчанию ко всем объектам буфера.

Механизм `crypto.DEFAULT_ENCODING` разработан для обеспечения обратной совместимости с унаследованными программами, которые подразумевают в качестве дефолтной кодировки `latin1`.

Для новых приложений значение по умолчанию будет `buffer`. Это свойство может исчезнуть в следующем релизе Node.js.

### crypto.fips

Свойство для проверки и контроля того, используется ли в настоящее время FIPS-совместимый провайдер шифрования. Для задания значения `true` необходимо иметь FIPS билд Node.js.

### crypto.createCipher()

```
crypto.createCipher(algorithm, password)
```

Создает и возвращает объект `Cipher`, который использует заданные `algorithm` и `password`.

`algorithm` зависит от OpenSSL (примерами являются 'aes192' и т. д.). В последних релизах OpenSSL openssl `list-cipher-algorithms` отображают доступные алгоритмы шифрования.

`password` используется для получения ключа шифрования и вектора инициализации (IV). Значение должно быть либо `latin1` кодированная строка, либо буфер.

Реализация `crypto.createCipher()` позволяет получать ключи с помощью функции OpenSSL EVP_BytesToKey, где дайджест-алгоритм отправляется в MD5 за одну итерацию и без "соли". Отсутствие "соли" позволяет "атаковать" словарь, как один и тот же пароль создает один и тот же ключ. Малое количество итераций и незащифрованный защитный хэш-алгоритм позволяют тестировать пароли очень быстро.

Наряду с рекомендациями OpenSSL по использованию pbkdf2 вместо EVP_BytesToKey, разработчикам советуют получать ключ и вектор инициализации собственноручно, используя `crypto.pbkdf2()` и `crypto.createCipheriv()`, создавая объект `Cipher`.

### crypto.createCipheriv()

```
crypto.createCipheriv(algorithm, key, iv)
```

Создает и возвращает объект `Cipher`, который использует заданные `algorithm`, `key` и вектор инициализации `iv`.

`algorithm` зависит от OpenSSL (примерами являются 'aes192' и т. д.). В последних релизах OpenSSL openssl list-cipher-algorithms отображают доступные алгоритмы шифрования.

`key` является сырым ключом, используемым `algorithm` и `iv`. Аргументы в обоих случаях должны быть `utf8` кодированные строки или буферы.

### crypto.createCredentials()

```
crypto.createCredentials(details)
```

!!!danger "Стабильность: 0 – Отказано. Использовать `tls.createSecureContext()`"

Метод `crypto.createCredentials()` является аналоговым методом для создания и возвращения объекта `tls.SecureContext`. Однако, на данный момент этот метод не стоит использовать.

Опциональный аргумент `details` является хэш-объектом с такими ключами:

- `pfx` `>Строка<` | `>Буфер<` – PFX или PKCS12-кодированный приватный клюс, сертификат и CA сертификаты
- `key` `>Строка<` – PEM-кодированный приватный ключ
- `passphrase` `>Строка<` – ключевая фраза для приватного ключа или PFX
- `cert` `>Строка<` – PEM-кодированный сертификат
- `ca` `>Строка<` | `>Массив<` – строка либо массив строк PEM-кодированных CA сертификатов
- `crl` `>Строка<` | `>Массив<` – строка либо массив строк PEM-кодированных CRL (Certificate Revocation List - список отозванных сертификатов)
- `ciphers` `>Строка<` использует список форматов шифрования OpenSSL, которые описывают алгоритмы шифрования, которые нужно использовать или от которых нужно отказаться.

Если подробности в отношении 'ca' не предоставляются, Node.js будет использовать по умолчанию публисный список CA в Mozilla.

### crypto.createDecipher()

```
crypto.createDecipher(algorithm, password)
```

Создает и возвращает объект `Decipher`, который использует заданные `algorithm` и `password`.

Реализация `crypto.createDecipher()` позволяет получать ключи с помощью функции OpenSSL EVP_BytesToKey, где дайджест-алгоритм отправляется в MD5 за одну итерацию и без "соли". Отсутствие "соли" позволяет "атаковать" словарь, как один и тот же пароль создает один и тот же ключ. Малое количество итераций и незащифрованный защитный хэш-алгоритм позволяют тестировать пароли очень быстро.

Наряду с рекомендациями OpenSSL по использованию pbkdf2 вместо EVP_BytesToKey, разработчикам советуют получать ключ и вектор инициализации собственноручно, используя `crypto.pbkdf2()` и `crypto.createDecipheriv()`, создавая объект `Decipher`.

### crypto.createDecipheriv()

```
crypto.createDecipheriv(algorithm, key, iv)
```

Создает и возвращает объект `Decipher`, который использует заданные `algorithm`, `key` и вектор инициализации `iv`.

`algorithm` зависит от OpenSSL (примерами являются 'aes192' и т. д.). В последних релизах OpenSSL openssl list-cipher-algorithms отображают доступные алгоритмы шифрования.

`key` является сырым ключом, используемым `algorithm` и `iv`. Аргументы в обоих случаях должны быть 'utf8' кодированные строки или буферы.

### crypto.createDiffieHellman()

```
crypto.createDiffieHellman(prime[, prime_encoding][, generator][, generator_encoding])
```

Создает объект обмена ключами Диффи-Хеллмана, используя `prime` и опциональный `generator`.

Аргумент `generator` может быть числом, строкой или буфером. Если генератор не задан, то используется значение `2`.

Аргументы `prime_encoding` и `generator_encoding` могут быть 'latin1', 'hex', или 'base24'.

Если задано `prime_encoding`, то `prime` будет строкой, во всех остальных случаях - буфером.

### crypto.createDiffieHellman()

```
crypto.createDiffieHellman(prime_length[, generator])
```

Создает объект обмена ключами Диффи-Хеллмана и генерирует простое число из битов `prime_length`, используя опциональный `generator`. Если генератор не задан, то используется значение `2`.

### crypto.createECDH()

```
crypto.createECDH(curve_name)
```

Создает обмен ключами по эллиптической кривой Диффи-Хеллмана, используя предопределенную кривую, заданную строкой `curve_name`. Для получения списка доступных названий кривых см. `crypto.getCurves()`. В последних релизах OpenSSL `openssl ecparam -list_curves` также отражают имя и описание каждой доступной эллиптической кривой.

### crypto.createHash()

```
crypto.createHash(algorithm)
```

Создает и возращает объект `Hash`, который можно использовать для генерации хэш-дайджестов с помощью данного алгоритма.

`algorithm` зависит от доступных алгоритмов, поддерживаемых версией OpenSSL (примерами являются 'sha256', 'sha512' и т.д.). В последних релизах OpenSSL openssl list-message-digest-algorithms отображает доступные дайджест-алгоритмы.

Пример: генерация суммы файла sha256:

```js
const filename = process.argv[2];
const crypto = require('crypto');
const fs = require('fs');

const hash = crypto.createHash('sha256');

const input = fs.createReadStream(filename);
input.on('readable', () => {
  var data = input.read();
  if (data) hash.update(data);
  else {
    console.log(`${hash.digest('hex')} ${filename}`);
  }
});
```

### crypto.createHmac()

```
crypto.createHmac(algorithm, key)
```

Создает и возращает объект `Hmac`, который использует данные `algorithm` и `key`

`algorithm` зависит от доступных алгоритмов, поддерживаемых версией OpenSSL (примерами являются 'sha256', 'sha512' и т.д.). В последних релизах OpenSSL openssl list-message-digest-algorithms отображает доступные дайджест-алгоритмы.

`key` является ключом HMAC, используемым для генерации криптографического хэша HMAC.

Пример: sha256 HMAC файла:

```js
const filename = process.argv[2];
const crypto = require('crypto');
const fs = require('fs');

const hmac = crypto.createHmac('sha256', 'a secret');

const input = fs.createReadStream(filename);
input.on('readable', () => {
  var data = input.read();
  if (data) hmac.update(data);
  else {
    console.log(`${hmac.digest('hex')} ${filename}`);
  }
});
```

### crypto.createSign()

```
crypto.createSign(algorithm)
```

Создает и вовращает объект `Sign`, который использует заданный алгоритм. В последних релизах OpenSSL openssl list-public-key-algorithms отображают доступные алгоритмы подписи. Как пример – 'RSA-SHA256'.

### crypto.getCiphers()

Возвращает массив с названиями поддерживаемых алгоритмов шифрования:

```js
const ciphers = crypto.getCiphers();
console.log(ciphers); // ['aes-128-cbc', 'aes-128-ccm', ...]
```

### crypto.getCurves()

Возвращает массив с названиями поддерживаемых эллиптических кривых:

```js
const curves = crypto.getCurves();
console.log(curves); // ['secp256k1', 'secp384r1', ...]
```

### crypto.getDiffieHellman()

```
crypto.getDiffieHellman(group_name)
```

Создает предопределенный объект обмена ключами Диффи-Хеллмана. Поддерживаемые группы: 'modp1', 'modp2', 'modp5' (установлено в RFC 2412, см. Caveats), 'modp14', 'modp15', 'modp16', 'modp17', 'modp18' (установлено в RFC 3526). Возвращаемый объект имитирует интерфейс объектов, созданных посредством `crypto.createDiffieHellman()`, но позволяет менять ключи (например, с помощью `diffieHellman.setPublicKey()`). Преимущество использования этого метода состоит в том, что участники не обязаны генерировать и обмениваться групповыми модулями заранее, таким образом экономя время процессора и сессии.

Пример: получение разделенного секрета:

```js
const crypto = require('crypto');
const alice = crypto.getDiffieHellman('modp14');
const bob = crypto.getDiffieHellman('modp14');

alice.generateKeys();
bob.generateKeys();

const alice_secret = alice.computeSecret(
  bob.getPublicKey(),
  null,
  'hex'
);
const bob_secret = bob.computeSecret(
  alice.getPublicKey(),
  null,
  'hex'
);

/* alice_secret and bob_secret should be the same */
console.log(alice_secret == bob_secret);
```

### crypto.getHashes()

Возвращает массив с названиями поддерживаемых хэш-алгоритмов:

```js
const hashes = crypto.getHashes();
console.log(hashes); // ['sha', 'sha1', 'sha1WithRSAEncryption', ...]
```

### crypto.pbkdf2()

```
crypto.pbkdf2(password, salt, iterations, keylen, digest, callback)
```

Предоставляет асинхронную реализацию дифференциальной функции Пароль-Ключ 2 (Password-Based Key Derivation Function 2 (PBKDF2)). Выбранный HMAC дайджест-алгоритм, заданный через `digest` применяется для получения ключа запрашиваемой длины (`keylen`) из `password`, `salt` и `iterations`.

Поддерживаемая функция обратного вызова `callback` вызывается с двумя аргументами: `err` и `derivedKey`. Если случается ошибка, устанавливается `err`, если нет, то у `err` будет значение `NULL`. Успешно сгенерированный `derivedKey` передается в буфер.

Аргумент `iterations` должен быть максимально возможным числом. Чем больше число итераций, тем более защищенным будет ключ; однако, это займет больше времени на выполнение.

`salt` должно быть максимально уникально. Рекомендуется создавать рандомную "соль" и устанавливать ее длину больше, чем 16 байт. См. NIST SP 800-132.

Пример:

```js
const crypto = require('crypto');
crypto.pbkdf2(
  'secret',
  'salt',
  100000,
  512,
  'sha512',
  (err, key) => {
    if (err) throw err;
    console.log(key.toString('hex')); // 'c5e478d...1469e50'
  }
);
```

Массив моддерживаемых дайджест-функций может быть получен посредством `crypto.getHashes()`.

### crypto.pbkdf2Sync()

```
crypto.pbkdf2Sync(password, salt, iterations, keylen, digest)
```

Предоставляет синхронную реализацию дифференциальной функции Пароль-Ключ 2 (Password-Based Key Derivation Function 2 (PBKDF2)). Выбранный HMAC дайджест-алгоритм, заданный через `digest` применяется для получения ключа запрашиваемой длины (`keylen`) из `password`, `salt` и `iterations`.

Поддерживаемая функция обратного вызова `callback` вызывается с двумя аргументами: `err` и `derivedKey`. Если случается ошибка, устанавливается `err`, если нет, то у `err` будет значение `NULL`. Успешно сгенерированный `derivedKey` передается в буфер.

Аргумент `iterations` должен быть максимально возможным числом. Чем больше число итераций, тем более защищенным будет ключ; однако, это займет больше времени на выполнение.

`salt` должно быть максимально уникально. Рекомендуется создавать рандомную "соль" и устанавливать ее длину больше, чем 16 байт. См. NIST SP 800-132.

Пример:

```js
const crypto = require('crypto');
const key = crypto.pbkdf2Sync(
  'secret',
  'salt',
  100000,
  512,
  'sha512'
);
console.log(key.toString('hex')); // 'c5e478d...1469e50'
```

Массив моддерживаемых дайджест-функций может быть получен посредством `crypto.getHashes()`.

### crypto.privateDecrypt()

```
crypto.privateDecrypt(private_key, buffer)
```

Расшифровывает буфер с помощью приватного ключа `private_key`.

`private_key` может быть объектом или строкой. Если `private_key` является строкой, то он воспринимается как ключ без ключевой фразы и к нему применяется `RSA_PKCS1_OAEP_PADDING`. Если ключ является объектом, то в этом случае он интерпретируется как хэш-объект с такими ключами:

- `key` `>Строка<` – PEM-кодированный приватный ключ
- `passphrase` `>Строка<` – ключевая фраза для приватного ключа
- `padding` – опциональное значение паддинга.

`padding` может быть одним из следующих:

- `crypto.constants.RSA_NO_PADDING`
- `crypto.constants.RSA_PKCS1_PADDING`
- `crypto.constants.RSA_PKCS1_OAEP_PADDING`

Все паддинги заданы в `crypto.constants`.

### crypto.privateEncrypt()

```
crypto.privateEncrypt(private_key, buffer)
```

Шифрует буфер с помощью приватного ключа `private_key`.

`private_key` может быть объектом или строкой. Если `private_key` является строкой, то он воспринимается как ключ без ключевой фразы и к нему применяется `RSA_PKCS1_PADDING`. Если ключ является объектом, то в этом случае он интерпретируется как хэш-объект с такими ключами:

- `key` `>Строка<` – PEM-кодированный приватный ключ
- `passphrase` `>Строка<` – ключевая фраза для приватного ключа
- `padding` – опциональное значение паддинга.

`padding` может быть одним из следующих:

- `crypto.constants.RSA_NO_PADDING`
- `crypto.constants.RSA_PKCS1_PADDING`
- `crypto.constants.RSA_PKCS1_OAEP_PADDING`

Все паддинги заданы в `crypto.constants`.

### crypto.publicDecrypt()

```
crypto.publicDecrypt(public_key, buffer)
```

Расшифровывает буфер с помощью публичного ключа `public_key`.

`public_key` может быть объектом или строкой. Если `public_key` является строкой, то он воспринимается как ключ без ключевой фразы и к нему применяется `RSA_PKCS1_PADDING`. Если ключ является объектом, то в этом случае он интерпретируется как хэш-объект с такими ключами:

- `key` `>Строка<` – PEM-кодированный приватный ключ
- `passphrase` `>Строка<` – ключевая фраза для приватного ключа
- `padding` – опциональное значение паддинга.

`padding` может быть одним из следующих:

- `crypto.constants.RSA_NO_PADDING`
- `crypto.constants.RSA_PKCS1_PADDING`
- `crypto.constants.RSA_PKCS1_OAEP_PADDING`

Так как публичные ключи RSA могут быть получены из приватных, можно передавать приватный ключ вместо публичного.

Все паддинги заданы в `crypto.constants`.

### crypto.publicEncrypt()

```
crypto.publicEncrypt(public_key, buffer)
```

Шифрует буфер с помощью публичного ключа `public_key`.

`public_key` может быть объектом или строкой. Если `public_key` является строкой, то он воспринимается как ключ без ключевой фразы и к нему применяется `RSA_PKCS1_OAEP_PADDING`. Если ключ является объектом, то в этом случае он интерпретируется как хэш-объект с такими ключами:

- `key` `>Строка<` – PEM-кодированный приватный ключ
- `passphrase` `>Строка<` – ключевая фраза для приватного ключа
- `padding` – опциональное значение паддинга.

`padding` может быть одним из следующих:

- `crypto.constants.RSA_NO_PADDING`
- `crypto.constants.RSA_PKCS1_PADDING`
- `crypto.constants.RSA_PKCS1_OAEP_PADDING`

Так как публичные ключи RSA могут быть получены из приватных, можно передавать приватный ключ вместо публичного.

Все паддинги заданы в `crypto.constants`.

### crypto.randomBytes()

```
crypto.randomBytes(size[, callback])
```

Генерирует криптографически защищенные псевдорандомные данные. Аргумент `size` является числом, отражающим количество сгенерированных байтов.

Если есть функция обратного вызова `callback`, то байты генерируются асинхронно, а функция вызывается с двумя аргументами: `err` и `buf`. Если случается ошибка, то `err` будет объектом `Error`, в других случаях значение будет `NULL`. Аргумент `buf` является буфером, содержащим в себе сгенерированные байты:

```js
// Asynchronous
const crypto = require('crypto');
crypto.randomBytes(256, (err, buf) => {
  if (err) throw err;
  console.log(
    `${buf.length} bytes of random data: ${buf.toString(
      'hex'
    )}`
  );
});
```

Если нет функции обратного вызова, рандомные байты генерируюся синхронно и возвращаются в виде буфера. Если есть проблема с генерацией байтов, выскакивает ошибка:

```js
// Synchronous
const buf = crypto.randomBytes(256);
console.log(
  `${buf.length} bytes of random data: ${buf.toString(
    'hex'
  )}`
);
```

Метод `crypto.randomBytes()` будет заблокирован, пока не будет получена соответствующая энтропия. Обычно этот процесс занимает не больше пары миллисекунд. Исключение составляет ситуация, когда генерация байтов включается непосредственно после загрузки, так как вся система имеет низкую энтропию.

### crypto.setEngine()

```
crypto.setEngine(engine[, flags])
```

Загружает и устанавливает `engine` дяя некоторых OpenSSL функций (выбранных по флагам).

`engine` может быть либо ID, либо путем в библиотеку движка.

Опциональный аргумент `flags` использует по умолчанию метод `ENGINE_METHOD_ALL`. `flags` является битовым полем, в котором выбирается один из нижеприведенных флагов (заданных в `crypto.constants`):

- `crypto.constants.ENGINE_METHOD_RSA`
- `crypto.constants.ENGINE_METHOD_DSA`
- `crypto.constants.ENGINE_METHOD_DH`
- `crypto.constants.ENGINE_METHOD_RAND`
- `crypto.constants.ENGINE_METHOD_ECDH`
- `crypto.constants.ENGINE_METHOD_ECDSA`
- `crypto.constants.ENGINE_METHOD_CIPHERS`
- `crypto.constants.ENGINE_METHOD_DIGESTS`
- `crypto.constants.ENGINE_METHOD_STORE`
- `crypto.constants.ENGINE_METHOD_PKEY_METHS`
- `crypto.constants.ENGINE_METHOD_PKEY_ASN1_METHS`
- `crypto.constants.ENGINE_METHOD_ALL`
- `crypto.constants.ENGINE_METHOD_NONE`

## Примечания

### API унаследованных стримов

Модуль шифрования `Crypro` был добавлен в Node.js перед концептом единого `Stream` API и перед появлением объектов буфера, которые обрабатывали бинарные данные. Поэтому большая часть классов `crypto` имеют нетипичные для прочих Node.js классов метод, которые реализуют API стримов (например, `update()`, `final()`, `digest()`). Кроме того, многие методы по умолчанию принимают и возвращают строки, кодированные в 'latin1' вместо буферов. Эта настройка по умолчанию была изменена после релиза Node.js v0.8, где по умолчанию начали использоваться объекты буфера.

### Недавние изменения ECDH

Упрощено использование ECDH с нединамически сгенерированными парами ключей. Теперь `ecdh.setPrivateKey()` можно вызвать с уже предустановленным приватным ключом и соответствующим публичным ключом, который будет вычислен и встроен в объект. Это позволяет коду хранить и предоставлять только приватную часть пары ключей EC. Также `ecdh.setPrivateKey()` теперь проверяет, является ли приватный ключ валидным для выбранной кривой.

Метод `ecdh.setPublicKey()` сейчас не используется, так как включение его в API не является целесообразным. Наличие приватного ключа позволяет генерировать публичный ключ, либо же ключи генерируются с помощью `ecdh.generateKeys()`. Главный недостаток использования `ecdh.setPublicKey()` заключается в том, что он сохраняет пару ключей ECDH в нестабильном состоянии.

### Поддержка устаревших алгоритмов

Модуль `crypto` все еще поддерживает некоторые алгоритмы, которые уже практически не используются. API позволяет также использовать шифраторы и хэш с ключом малого размера, который не предоставляет полную безопасность.

Пользователи несут полную отвественность за выбор алгоритма шифрования и размер ключа, который будет соотвествовать требованиям к необходимой безопасности.

На основании рекомендаций NIST SP 800-131A:

- MD5 и SHA-1 не подходят там, где требуется "сопротивление столкновения" (collision resistance), как, например, в цифровых подписях
- Ключ с алгоритмом RSA, DSA или DH должен иметь как минимум 2048 бит, а для кривых ECDSA и ECDH - 224 бита для безопасного использования в течение нескольких лет.
- DH группы modp1, modp2 и modp5 имеют размера ключа меньший, чем 2048 бит и не рекомендуются для использования.

## Константы шифрования

Следующие константы экспортируются посредством `crypto.constants` для модулей `crypto`, `tls`, `https` и обычно задаются OpenSSL.

### Опции OpenSSL

`SSL_OP_ALL`
: Применяет множественные методы обхода багов в OpenSSL. См. [openssl.org](https://www.openssl.org/docs/manmaster/man3/SSL_CTX_set_options.html)

`SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION`
: Позволяет наследование небезопасного повторного переподключения между OpenSSL и неизвестными клиентами или серверами. См. [openssl.org](https://www.openssl.org/docs/manmaster/man3/SSL_CTX_set_options.html)

`SSL_OP_CIPHER_SERVER_PREFERENCE`
: Изпользует предпочтения сервера вместо клиента при выборе шифратора. См. [openssl.org](https://www.openssl.org/docs/manmaster/man3/SSL_CTX_set_options.html)

`SSL_OP_CISCO_ANYCONNECT`
: Дает OpenSSL инструкцию на использование "отсталой" версии Cisco DTLS_BAD_VER

`SSL_OP_COOKIE_EXCHANGE`
: Дает OpenSSL инструкцию на переход к обмену куки

`SSL_OP_CRYPTOPRO_TLSEXT_BUG`
: Дает OpenSSL инструкцию на добаление расширения к серверу из ранней версии проекта cryptopro

`SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS`
: Дает OpenSSL инструкцию на отключение уязвимого обходного пути SSL 3.0/TLS 1.0, который был добавлен в OpenSSL 0.9.6d

`SSL_OP_EPHEMERAL_RSA`
: Дает OpenSSL инструкцию: всегда использовать ключ `tmp_rsa` при выполнении операций RSA

`SSL_OP_LEGACY_SERVER_CONNECT`
: Позволяет подключение к серверу, который не поддерживает RI

`SSL_OP_MICROSOFT_BIG_SSLV3_BUFFER`

`SSL_OP_MICROSOFT_SESS_ID_BUG`

`SSL_OP_MSIE_SSLV2_RSA_PADDING`
: Дает инструкцию на отключение уязвимого обходного пути в реализации сервера SSL 2.0 для протокола man-in-the-middle

`SSL_OP_NETSCAPE_CA_DN_BUG`

`SSL_OP_NETSCAPE_CHALLENGE_BUG`

`SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG`

`SSL_OP_NETSCAPE_REUSE_CIPHER_CHANGE_BUG`

`SSL_OP_NO_COMPRESSION`
: Дает инструкцию на отключение поддержки SSL/TLS сжатия

`SSL_OP_NO_QUERY_MTU`

`SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION`
: Дает инструкцию всегда стартовать новую сессию при выполнении переподключения

`SSL_OP_NO_SSLv2`
: Выключить SSL v2

`SSL_OP_NO_SSLv3`
: Выключить SSL v3

`SSL_OP_NO_TICKET`
: Дает инструкцию на отключение использования билетов RFC4507bis

`SSL_OP_NO_TLSv1`
: Отключение TLS v1

`SSL_OP_NO_TLSv1_1`
: Отключение TLS v1.1

`SSL_OP_NO_TLSv1_2`
: Отключение TLS v1.2

`SSL_OP_PKCS1_CHECK_1`

`SSL_OP_PKCS1_CHECK_2`

`SSL_OP_SINGLE_DH_USE`
: Дает инструкцию на создание нового ключа при использовании временных параметров DH

`SSL_OP_SINGLE_ECDH_USE`
: Дает инструкцию на создание нового ключа при использовании временных параметров ECDH

`SSL_OP_SSLEAY_080_CLIENT_DH_BUG`

`SSL_OP_SSLREF2_REUSE_CERT_TYPE_BUG`

`SSL_OP_TLS_BLOCK_PADDING_BUG`

`SSL_OP_TLS_D5_BUG`

`SSL_OP_TLS_ROLLBACK_BUG`
: Дает инструкцию на отключение версии отката обнаружения атак

### Константы движка OpenSSL

`ENGINE_METHOD_RSA`
: Лимитирует использование движка до `RSA`

`ENGINE_METHOD_DSA`
: Лимитирует использование движка до `DSA`

`ENGINE_METHOD_DH`
: Лимитирует использование движка до `DH`

`ENGINE_METHOD_RAND`
: Лимитирует использование движка до `RAND`

`ENGINE_METHOD_ECDH`
: Лимитирует использование движка до `ECDH`

`ENGINE_METHOD_ECDSA`
: Лимитирует использование движка до `ECDSA`

`ENGINE_METHOD_CIPHERS`
: Лимитирует использование движка до `CIPHERS`

`ENGINE_METHOD_DIGESTS`
: Лимитирует использование движка до `DIGESTS`

`ENGINE_METHOD_STORE`
: Лимитирует использование движка до `STORE`

`ENGINE_METHOD_PKEY_METHS`
: Лимитирует использование движка до `PKEY_METHS`

`ENGINE_METHOD_PKEY_ASN1_METHS`
: Лимитирует использование движка до `PKEY_ASN1_METHS`

`ENGINE_METHOD_ALL`

`ENGINE_METHOD_NONE`

### Другие константы OpenSSL

- `DH_CHECK_P_NOT_SAFE_PRIME`
- `DH_CHECK_P_NOT_PRIME `
- `DH_UNABLE_TO_CHECK_GENERATOR`
- `DH_NOT_SUITABLE_GENERATOR`
- `NPN_ENABLED`
- `ALPN_ENABLED`
- `RSA_PKCS1_PADDING`
- `RSA_SSLV23_PADDING`
- `RSA_NO_PADDING`
- `RSA_PKCS1_OAEP_PADDING`
- `RSA_X931_PADDING`
- `RSA_PKCS1_PSS_PADDING`
- `POINT_CONVERSION_COMPRESSED`
- `POINT_CONVERSION_UNCOMPRESSED`
- `POINT_CONVERSION_HYBRID`

### Константы шифрования Node.js

`defaultCoreCipherList`
: Определяет встроенный список шифраторов по умолчанию, используемый Node.js

`defaultCipherList`
: Определяет активный список шифраторов по умолчанию, используемый текущим процессом Node.js
