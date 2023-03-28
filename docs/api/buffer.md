---
description: Buffer объекты используются для представления последовательности байтов фиксированной длины
---

# Буфер

<!--introduced_in=v0.1.90-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/buffer.js -->

`Buffer` объекты используются для представления последовательности байтов фиксированной длины. Поддержка многих API-интерфейсов Node.js `Buffer`с.

В `Buffer` класс является подклассом JavaScript [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) class и расширяет его методами, которые охватывают дополнительные варианты использования. API-интерфейсы Node.js принимают простые [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)s где бы то ни было `Buffer`s также поддерживаются.

В то время как `Buffer` class доступен в глобальной области, по-прежнему рекомендуется явно ссылаться на него с помощью оператора import или require.

```mjs
import { Buffer } from 'buffer';

// Creates a zero-filled Buffer of length 10.
const buf1 = Buffer.alloc(10);

// Creates a Buffer of length 10,
// filled with bytes which all have the value `1`.
const buf2 = Buffer.alloc(10, 1);

// Creates an uninitialized buffer of length 10.
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using fill(), write(), or other functions that fill the Buffer's
// contents.
const buf3 = Buffer.allocUnsafe(10);

// Creates a Buffer containing the bytes [1, 2, 3].
const buf4 = Buffer.from([1, 2, 3]);

// Creates a Buffer containing the bytes [1, 1, 1, 1] – the entries
// are all truncated using `(value & 255)` to fit into the range 0–255.
const buf5 = Buffer.from([257, 257.5, -255, '1']);

// Creates a Buffer containing the UTF-8-encoded bytes for the string 'tést':
// [0x74, 0xc3, 0xa9, 0x73, 0x74] (in hexadecimal notation)
// [116, 195, 169, 115, 116] (in decimal notation)
const buf6 = Buffer.from('tést');

// Creates a Buffer containing the Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
const buf7 = Buffer.from('tést', 'latin1');
```

```cjs
const { Buffer } = require('buffer');

// Creates a zero-filled Buffer of length 10.
const buf1 = Buffer.alloc(10);

// Creates a Buffer of length 10,
// filled with bytes which all have the value `1`.
const buf2 = Buffer.alloc(10, 1);

// Creates an uninitialized buffer of length 10.
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using fill(), write(), or other functions that fill the Buffer's
// contents.
const buf3 = Buffer.allocUnsafe(10);

// Creates a Buffer containing the bytes [1, 2, 3].
const buf4 = Buffer.from([1, 2, 3]);

// Creates a Buffer containing the bytes [1, 1, 1, 1] – the entries
// are all truncated using `(value & 255)` to fit into the range 0–255.
const buf5 = Buffer.from([257, 257.5, -255, '1']);

// Creates a Buffer containing the UTF-8-encoded bytes for the string 'tést':
// [0x74, 0xc3, 0xa9, 0x73, 0x74] (in hexadecimal notation)
// [116, 195, 169, 115, 116] (in decimal notation)
const buf6 = Buffer.from('tést');

// Creates a Buffer containing the Latin-1 bytes [0x74, 0xe9, 0x73, 0x74].
const buf7 = Buffer.from('tést', 'latin1');
```

## Буферы и кодировки символов

<!-- YAML
changes:
  - version:
      - v15.7.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/36952
    description: Introduced `base64url` encoding.
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7111
    description: Introduced `latin1` as an alias for `binary`.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/2859
    description: Removed the deprecated `raw` and `raws` encodings.
-->

При преобразовании между `Buffer`s и строки, может быть указана кодировка символов. Если кодировка символов не указана, по умолчанию будет использоваться UTF-8.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('hello world', 'utf8');

console.log(buf.toString('hex'));
// Prints: 68656c6c6f20776f726c64
console.log(buf.toString('base64'));
// Prints: aGVsbG8gd29ybGQ=

console.log(Buffer.from('fhqwhgads', 'utf8'));
// Prints: <Buffer 66 68 71 77 68 67 61 64 73>
console.log(Buffer.from('fhqwhgads', 'utf16le'));
// Prints: <Buffer 66 00 68 00 71 00 77 00 68 00 67 00 61 00 64 00 73 00>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('hello world', 'utf8');

console.log(buf.toString('hex'));
// Prints: 68656c6c6f20776f726c64
console.log(buf.toString('base64'));
// Prints: aGVsbG8gd29ybGQ=

console.log(Buffer.from('fhqwhgads', 'utf8'));
// Prints: <Buffer 66 68 71 77 68 67 61 64 73>
console.log(Buffer.from('fhqwhgads', 'utf16le'));
// Prints: <Buffer 66 00 68 00 71 00 77 00 68 00 67 00 61 00 64 00 73 00>
```

Буферы Node.js принимают все варианты регистров строк кодирования, которые они получают. Например, UTF-8 можно указать как `'utf8'`, `'UTF8'` или `'uTf8'`.

В настоящее время Node.js поддерживает следующие кодировки символов:

- `'utf8'` (псевдоним: `'utf-8'`): Символы Юникода с многобайтовой кодировкой. Многие веб-страницы и другие форматы документов используют [UTF-8](https://en.wikipedia.org/wiki/UTF-8). Это кодировка символов по умолчанию. При декодировании `Buffer` в строку, которая не содержит исключительно допустимые данные UTF-8, символ замены Unicode `U+FFFD` � будет использоваться для представления этих ошибок.

- `'utf16le'` (псевдоним: `'utf-16le'`): Символы Юникода с многобайтовой кодировкой. В отличие от `'utf8'`, каждый символ в строке будет закодирован с использованием 2 или 4 байтов. Node.js поддерживает только [прямой порядок байтов](https://en.wikipedia.org/wiki/Endianness) вариант [UTF-16](https://en.wikipedia.org/wiki/UTF-16).

- `'latin1'`: Latin-1 означает [ISO-8859-1](https://en.wikipedia.org/wiki/ISO-8859-1). Эта кодировка символов поддерживает только символы Unicode из `U+0000` к `U+00FF`. Каждый символ кодируется одним байтом. Символы, не попадающие в этот диапазон, усекаются и будут сопоставлены с символами в этом диапазоне.

Преобразование `Buffer` в строку с использованием одного из вышеперечисленных называется декодированием, а преобразование строки в `Buffer` называется кодированием.

Node.js также поддерживает следующие кодировки двоичного кода в текст. Для кодировок двоичного кода в текст соглашение об именах обратное: преобразование `Buffer` в строку обычно называется кодированием, а преобразование строки в `Buffer` как расшифровка.

- `'base64'`: [Base64](https://en.wikipedia.org/wiki/Base64) кодирование. При создании `Buffer` из строки, эта кодировка также будет правильно принимать "безопасный алфавит URL и имени файла", как указано в [RFC 4648, раздел 5](https://tools.ietf.org/html/rfc4648#section-5). Пробелы, такие как пробелы, табуляции и новые строки, содержащиеся в строке в кодировке base64, игнорируются.

- `'base64url'`: [base64url](https://tools.ietf.org/html/rfc4648#section-5) кодировка, как указано в [RFC 4648, раздел 5](https://tools.ietf.org/html/rfc4648#section-5). При создании `Buffer` из строки, эта кодировка также будет правильно принимать обычные строки в кодировке base64. При кодировании `Buffer` в строку, эта кодировка будет опускать заполнение.

- `'hex'`: Закодировать каждый байт как два шестнадцатеричных символа. Усечение данных может происходить при декодировании строк, содержащих исключительно допустимые шестнадцатеричные символы. См. Пример ниже.

Также поддерживаются следующие устаревшие кодировки символов:

- `'ascii'`: Для 7-битных [ASCII](https://en.wikipedia.org/wiki/ASCII) только данные. При кодировании строки в `Buffer`, это эквивалентно использованию `'latin1'`. При декодировании `Buffer` в строку, использование этой кодировки дополнительно сбрасывает старший бит каждого байта перед декодированием как `'latin1'`. Как правило, не должно быть причин для использования этой кодировки, так как `'utf8'` (или, если известно, что данные всегда относятся только к ASCII, `'latin1'`) будет лучшим выбором при кодировании или декодировании текста только в формате ASCII. Это предусмотрено только для совместимости с устаревшими версиями.

- `'binary'`: Псевдоним для `'latin1'`. Видеть [двоичные строки](https://developer.mozilla.org/en-US/docs/Web/API/DOMString/Binary) для получения дополнительной информации по этой теме. Название этой кодировки может вводить в заблуждение, поскольку все перечисленные здесь кодировки преобразуются между строками и двоичными данными. Для преобразования между строками и `Buffer`s, обычно `'utf8'` это правильный выбор.

- `'ucs2'`, `'ucs-2'`: Псевдонимы `'utf16le'`. UCS-2 используется для обозначения варианта UTF-16, который не поддерживает символы с кодовыми точками больше, чем U + FFFF. В Node.js эти кодовые точки всегда поддерживаются.

```mjs
import { Buffer } from 'buffer';

Buffer.from('1ag', 'hex');
// Prints <Buffer 1a>, data truncated when first non-hexadecimal value
// ('g') encountered.

Buffer.from('1a7g', 'hex');
// Prints <Buffer 1a>, data truncated when data ends in single digit ('7').

Buffer.from('1634', 'hex');
// Prints <Buffer 16 34>, all data represented.
```

```cjs
const { Buffer } = require('buffer');

Buffer.from('1ag', 'hex');
// Prints <Buffer 1a>, data truncated when first non-hexadecimal value
// ('g') encountered.

Buffer.from('1a7g', 'hex');
// Prints <Buffer 1a>, data truncated when data ends in single digit ('7').

Buffer.from('1634', 'hex');
// Prints <Buffer 16 34>, all data represented.
```

Современные веб-браузеры следуют [Стандарт кодирования WHATWG](https://encoding.spec.whatwg.org/) который псевдоним обоих `'latin1'` а также `'ISO-8859-1'` к `'win-1252'`. Это означает, что при выполнении чего-то вроде `http.get()`, если возвращенная кодировка является одной из перечисленных в спецификации WHATWG, возможно, что сервер действительно вернул `'win-1252'`-кодированные данные и использование `'latin1'` кодировка может неправильно декодировать символы.

## Буферы и TypedArrays

<!-- YAML
changes:
  - version: v3.0.0
    pr-url: https://github.com/nodejs/node/pull/2002
    description: The `Buffer`s class now inherits from `Uint8Array`.
-->

`Buffer` экземпляры также являются JavaScript [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) а также [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) экземпляры. Все [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) методы доступны на `Buffer`с. Однако есть тонкие несовместимости между `Buffer` API и [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) API.

Особенно:

- В то время как [`TypedArray.prototype.slice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice) создает копию части `TypedArray`, [`Buffer.prototype.slice()`](#bufslicestart-end) создает вид на существующие `Buffer` без копирования. Такое поведение может быть неожиданным и существует только для совместимости с устаревшими версиями. [`TypedArray.prototype.subarray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray) может использоваться для достижения поведения [`Buffer.prototype.slice()`](#bufslicestart-end) на обоих `Buffer`s и другие `TypedArray`с.
- [`buf.toString()`](#buftostringencoding-start-end) несовместимо с его `TypedArray` эквивалент.
- Ряд методов, например [`buf.indexOf()`](#bufindexofvalue-byteoffset-encoding), поддерживаю дополнительные аргументы.

Есть два способа создать новый [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) экземпляры из `Buffer`:

- Прохождение `Buffer` к [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) конструктор скопирует `Buffer`s содержимое, интерпретируемое как массив целых чисел, а не как последовательность байтов целевого типа.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, 2, 3, 4]);
const uint32array = new Uint32Array(buf);

console.log(uint32array);

// Prints: Uint32Array(4) [ 1, 2, 3, 4 ]
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, 2, 3, 4]);
const uint32array = new Uint32Array(buf);

console.log(uint32array);

// Prints: Uint32Array(4) [ 1, 2, 3, 4 ]
```

- Прохождение `Buffer`лежащий в основе [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) создаст [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) который разделяет свою память с `Buffer`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('hello', 'utf16le');
const uint16array = new Uint16Array(
  buf.buffer,
  buf.byteOffset,
  buf.length / Uint16Array.BYTES_PER_ELEMENT
);

console.log(uint16array);

// Prints: Uint16Array(5) [ 104, 101, 108, 108, 111 ]
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('hello', 'utf16le');
const uint16array = new Uint16Array(
  buf.buffer,
  buf.byteOffset,
  buf.length / Uint16Array.BYTES_PER_ELEMENT
);

console.log(uint16array);

// Prints: Uint16Array(5) [ 104, 101, 108, 108, 111 ]
```

Возможно создание нового `Buffer` который использует ту же выделенную память, что и [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) экземпляр, используя `TypedArray` объекты `.buffer` имущество таким же образом. [`Buffer.from()`](#static-method-bufferfromarraybuffer-byteoffset-length) ведет себя как `new Uint8Array()` в контексте.

```mjs
import { Buffer } from 'buffer';

const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Copies the contents of `arr`.
const buf1 = Buffer.from(arr);

// Shares memory with `arr`.
const buf2 = Buffer.from(arr.buffer);

console.log(buf1);
// Prints: <Buffer 88 a0>
console.log(buf2);
// Prints: <Buffer 88 13 a0 0f>

arr[1] = 6000;

console.log(buf1);
// Prints: <Buffer 88 a0>
console.log(buf2);
// Prints: <Buffer 88 13 70 17>
```

```cjs
const { Buffer } = require('buffer');

const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Copies the contents of `arr`.
const buf1 = Buffer.from(arr);

// Shares memory with `arr`.
const buf2 = Buffer.from(arr.buffer);

console.log(buf1);
// Prints: <Buffer 88 a0>
console.log(buf2);
// Prints: <Buffer 88 13 a0 0f>

arr[1] = 6000;

console.log(buf1);
// Prints: <Buffer 88 a0>
console.log(buf2);
// Prints: <Buffer 88 13 70 17>
```

При создании `Buffer` используя [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)с `.buffer`, можно использовать только часть базового [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) проходя в `byteOffset` а также `length` параметры.

```mjs
import { Buffer } from 'buffer';

const arr = new Uint16Array(20);
const buf = Buffer.from(arr.buffer, 0, 16);

console.log(buf.length);
// Prints: 16
```

```cjs
const { Buffer } = require('buffer');

const arr = new Uint16Array(20);
const buf = Buffer.from(arr.buffer, 0, 16);

console.log(buf.length);
// Prints: 16
```

В `Buffer.from()` а также [`TypedArray.from()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from) имеют разные подписи и реализации. В частности, [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) варианты принимают второй аргумент, который является функцией сопоставления, которая вызывается для каждого элемента типизированного массива:

- `TypedArray.from(source[, mapFn[, thisArg]])`

В `Buffer.from()` метод, однако, не поддерживает использование функции сопоставления:

- [`Buffer.from(array)`](#static-method-bufferfromarray)
- [`Buffer.from(buffer)`](#static-method-bufferfrombuffer)
- [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length)
- [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding)

## Буферы и итерация

`Buffer` экземпляры могут быть повторены с помощью `for..of` синтаксис:

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, 2, 3]);

for (const b of buf) {
  console.log(b);
}
// Prints:
//   1
//   2
//   3
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, 2, 3]);

for (const b of buf) {
  console.log(b);
}
// Prints:
//   1
//   2
//   3
```

Кроме того, [`buf.values()`](#bufvalues), [`buf.keys()`](#bufkeys), а также [`buf.entries()`](#bufentries) методы могут использоваться для создания итераторов.

## Класс: `Blob`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

> Стабильность: 1 - экспериментальная

А [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) инкапсулирует неизменяемые необработанные данные, которые могут безопасно совместно использоваться несколькими рабочими потоками.

### `new buffer.Blob([sources[, options]])`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
changes:
  - version: v16.7.0
    pr-url: https://github.com/nodejs/node/pull/39708
    description: Added the standard `endings` option to replace line-endings,
                 and removed the non-standard `encoding` option.
-->

- `sources` {string \[] | ArrayBuffer \[] | TypedArray \[] | DataView \[] | Blob \[]} Массив строк, объектов {ArrayBuffer}, {TypedArray}, {DataView} или {Blob} или любое сочетание таких объектов , который будет храниться в `Blob`.
- `options` {Объект}
  - `endings` {string} Одно из `'transparent'` или `'native'`. При установке на `'native'`, окончания строк в исходных частях строк будут преобразованы в собственные окончания строк платформы, как указано в `require('os').EOL`.
  - `type` {строка} Тип содержимого Blob. Намерение для `type` для передачи медиа-типа MIME данных, однако проверка формата типа не выполняется.

Создает новый `Blob` объект, содержащий конкатенацию данных источников.

Источники {ArrayBuffer}, {TypedArray}, {DataView} и {Buffer} копируются в Blob и поэтому могут быть безопасно изменены после создания Blob.

Источники строк кодируются как байтовые последовательности UTF-8 и копируются в Blob. Несовпадающие суррогатные пары в каждой части строки будут заменены символами замены Unicode U + FFFD.

### `blob.arrayBuffer()`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

- Возврат: {Обещание}

Возвращает обещание, которое выполняется с помощью {ArrayBuffer}, содержащего копию `Blob` данные.

### `blob.size`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

Общий размер `Blob` в байтах.

### `blob.slice([start, [end, [type]]])`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

- `start` {number} Начальный индекс.
- `end` {число} Конечный индекс.
- `type` {строка} Тип содержимого для нового `Blob`

Создает и возвращает новый `Blob` содержащий подмножество этого `Blob` данные об объектах. Оригинал `Blob` не изменено.

### `blob.stream()`

<!-- YAML
added: v16.7.0
-->

- Возвращает: {ReadableStream}

Возвращает новый `ReadableStream` что позволяет содержание `Blob` быть прочитанным.

### `blob.text()`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

- Возврат: {Обещание}

Возвращает обещание, которое выполняется с содержимым `Blob` декодируется как строка UTF-8.

### `blob.type`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

- Тип: {строка}

Тип содержимого `Blob`.

### `Blob` объекты и `MessageChannel`

После создания объекта {Blob} его можно отправить через `MessagePort` в несколько пунктов назначения без передачи или немедленного копирования данных. Данные, содержащиеся в `Blob` копируется только тогда, когда `arrayBuffer()` или `text()` методы называются.

```mjs
import { Blob, Buffer } from 'buffer';
import { setTimeout as delay } from 'timers/promises';

const blob = new Blob(['hello there']);

const mc1 = new MessageChannel();
const mc2 = new MessageChannel();

mc1.port1.onmessage = async ({ data }) => {
  console.log(await data.arrayBuffer());
  mc1.port1.close();
};

mc2.port1.onmessage = async ({ data }) => {
  await delay(1000);
  console.log(await data.arrayBuffer());
  mc2.port1.close();
};

mc1.port2.postMessage(blob);
mc2.port2.postMessage(blob);

// The Blob is still usable after posting.
blob.text().then(console.log);
```

```cjs
const { Blob, Buffer } = require('buffer');
const { setTimeout: delay } = require('timers/promises');

const blob = new Blob(['hello there']);

const mc1 = new MessageChannel();
const mc2 = new MessageChannel();

mc1.port1.onmessage = async ({ data }) => {
  console.log(await data.arrayBuffer());
  mc1.port1.close();
};

mc2.port1.onmessage = async ({ data }) => {
  await delay(1000);
  console.log(await data.arrayBuffer());
  mc2.port1.close();
};

mc1.port2.postMessage(blob);
mc2.port2.postMessage(blob);

// The Blob is still usable after posting.
blob.text().then(console.log);
```

## Класс: `Buffer`

В `Buffer` class - это глобальный тип для непосредственной работы с двоичными данными. Его можно построить разными способами.

### Статический метод: `Buffer.alloc(size[, fill[, encoding]])`

<!-- YAML
added: v5.10.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34682
    description: Throw ERR_INVALID_ARG_VALUE instead of ERR_INVALID_OPT_VALUE
                 for invalid input arguments.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18129
    description: Attempting to fill a non-zero length buffer with a zero length
                 buffer triggers a thrown exception.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17427
    description: Specifying an invalid string for `fill` triggers a thrown
                 exception.
  - version: v8.9.3
    pr-url: https://github.com/nodejs/node/pull/17428
    description: Specifying an invalid string for `fill` now results in a
                 zero-filled buffer.
-->

- `size` {integer} Желаемая длина нового `Buffer`.
- `fill` {string | Buffer | Uint8Array | integer} Значение для предварительного заполнения нового `Buffer` с участием. **Дефолт:** `0`.
- `encoding` {строка} Если `fill` это строка, это ее кодировка. **Дефолт:** `'utf8'`.

Выделяет новый `Buffer` из `size` байтов. Если `fill` является `undefined`, то `Buffer` будет заполнено нулями.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.alloc(5);

console.log(buf);
// Prints: <Buffer 00 00 00 00 00>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.alloc(5);

console.log(buf);
// Prints: <Buffer 00 00 00 00 00>
```

Если `size` больше чем [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length) или меньше 0, [`ERR_INVALID_ARG_VALUE`](errors.md#err_invalid_arg_value) брошен.

Если `fill` указано, выделенный `Buffer` будет инициализирован вызовом [`buf.fill(fill)`](#buffillvalue-offset-end-encoding).

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.alloc(5, 'a');

console.log(buf);
// Prints: <Buffer 61 61 61 61 61>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.alloc(5, 'a');

console.log(buf);
// Prints: <Buffer 61 61 61 61 61>
```

Если оба `fill` а также `encoding` указаны, выделенные `Buffer` будет инициализирован вызовом [`buf.fill(fill, encoding)`](#buffillvalue-offset-end-encoding).

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

console.log(buf);
// Prints: <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

console.log(buf);
// Prints: <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

Вызов [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) может быть заметно медленнее, чем альтернатива [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) но гарантирует, что вновь созданный `Buffer` содержимое экземпляра никогда не будет содержать конфиденциальные данные из предыдущих распределений, включая данные, которые могли не быть выделены для `Buffer`с.

А `TypeError` будет брошен, если `size` это не число.

### Статический метод: `Buffer.allocUnsafe(size)`

<!-- YAML
added: v5.10.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34682
    description: Throw ERR_INVALID_ARG_VALUE instead of ERR_INVALID_OPT_VALUE
                 for invalid input arguments.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7079
    description: Passing a negative `size` will now throw an error.
-->

- `size` {integer} Желаемая длина нового `Buffer`.

Выделяет новый `Buffer` из `size` байтов. Если `size` больше чем [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length) или меньше 0, [`ERR_INVALID_ARG_VALUE`](errors.md#err_invalid_arg_value) брошен.

Основная память для `Buffer` экземпляры, созданные таким образом, _не инициализирован_. Содержимое вновь созданного `Buffer` неизвестны и _может содержать конфиденциальные данные_. Использовать [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) вместо того, чтобы инициализировать `Buffer` экземпляры с нулями.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(10);

console.log(buf);
// Prints (contents may vary): <Buffer a0 8b 28 3f 01 00 00 00 50 32>

buf.fill(0);

console.log(buf);
// Prints: <Buffer 00 00 00 00 00 00 00 00 00 00>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(10);

console.log(buf);
// Prints (contents may vary): <Buffer a0 8b 28 3f 01 00 00 00 50 32>

buf.fill(0);

console.log(buf);
// Prints: <Buffer 00 00 00 00 00 00 00 00 00 00>
```

А `TypeError` будет брошен, если `size` это не число.

В `Buffer` модуль предварительно выделяет внутренний `Buffer` экземпляр размера [`Buffer.poolSize`](#class-property-bufferpoolsize) который используется как пул для быстрого выделения новых `Buffer` экземпляры, созданные с использованием [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize), [`Buffer.from(array)`](#static-method-bufferfromarray), [`Buffer.concat()`](#static-method-bufferconcatlist-totallength), а устаревшие `new Buffer(size)` конструктор только когда `size` меньше или равно `Buffer.poolSize >> 1` (этаж [`Buffer.poolSize`](#class-property-bufferpoolsize) делится на два).

Использование этого предварительно выделенного пула внутренней памяти - ключевое различие между вызовами `Buffer.alloc(size, fill)` против. `Buffer.allocUnsafe(size).fill(fill)`. Конкретно, `Buffer.alloc(size, fill)` буду _никогда_ использовать внутренний `Buffer` бассейн, в то время как `Buffer.allocUnsafe(size).fill(fill)` _буду_ использовать внутренний `Buffer` бассейн, если `size` меньше или равно половине [`Buffer.poolSize`](#class-property-bufferpoolsize). Разница небольшая, но может быть важна, когда приложению требуется дополнительная производительность, [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) обеспечивает.

### Статический метод: `Buffer.allocUnsafeSlow(size)`

<!-- YAML
added: v5.12.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34682
    description: Throw ERR_INVALID_ARG_VALUE instead of ERR_INVALID_OPT_VALUE
                 for invalid input arguments.
-->

- `size` {integer} Желаемая длина нового `Buffer`.

Выделяет новый `Buffer` из `size` байтов. Если `size` больше чем [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length) или меньше 0, [`ERR_INVALID_ARG_VALUE`](errors.md#err_invalid_arg_value) брошен. Нулевой длины `Buffer` создается, если `size` равно 0.

Основная память для `Buffer` экземпляры, созданные таким образом, _не инициализирован_. Содержимое вновь созданного `Buffer` неизвестны и _может содержать конфиденциальные данные_. Использовать [`buf.fill(0)`](#buffillvalue-offset-end-encoding) инициализировать такой `Buffer` экземпляры с нулями.

Когда используешь [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) выделить новые `Buffer` экземпляров, выделения размером менее 4 КБ выделяются из одного предварительно выделенного `Buffer`. Это позволяет приложениям избежать накладных расходов на сборку мусора, связанных с созданием множества отдельно выделенных `Buffer` экземпляры. Такой подход улучшает как производительность, так и использование памяти, устраняя необходимость отслеживать и очищать как можно больше отдельных `ArrayBuffer` объекты.

Однако в случае, когда разработчику может потребоваться сохранить небольшой фрагмент памяти из пула в течение неопределенного времени, может оказаться целесообразным создать не объединенный в пул `Buffer` экземпляр с использованием `Buffer.allocUnsafeSlow()` а затем копирование соответствующих битов.

```mjs
import { Buffer } from 'buffer';

// Need to keep around a few small chunks of memory.
const store = [];

socket.on('readable', () => {
  let data;
  while (null !== (data = readable.read())) {
    // Allocate for retained data.
    const sb = Buffer.allocUnsafeSlow(10);

    // Copy the data into the new allocation.
    data.copy(sb, 0, 0, 10);

    store.push(sb);
  }
});
```

```cjs
const { Buffer } = require('buffer');

// Need to keep around a few small chunks of memory.
const store = [];

socket.on('readable', () => {
  let data;
  while (null !== (data = readable.read())) {
    // Allocate for retained data.
    const sb = Buffer.allocUnsafeSlow(10);

    // Copy the data into the new allocation.
    data.copy(sb, 0, 0, 10);

    store.push(sb);
  }
});
```

А `TypeError` будет брошен, если `size` это не число.

### Статический метод: `Buffer.byteLength(string[, encoding])`

<!-- YAML
added: v0.1.90
changes:
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8946
    description: Passing invalid input will now throw an error.
  - version: v5.10.0
    pr-url: https://github.com/nodejs/node/pull/5255
    description: The `string` parameter can now be any `TypedArray`, `DataView`
                 or `ArrayBuffer`.
-->

- `string` {string | Buffer | TypedArray | DataView | ArrayBuffer | SharedArrayBuffer} Значение, длину которого требуется вычислить.
- `encoding` {строка} Если `string` это строка, это ее кодировка. **Дефолт:** `'utf8'`.
- Возвращает: {целое число} количество байтов, содержащихся в `string`.

Возвращает длину строки в байтах при кодировании с использованием `encoding`. Это не то же самое, что [`String.prototype.length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length), который не учитывает кодировку, используемую для преобразования строки в байты.

Для `'base64'`, `'base64url'`, а также `'hex'`, эта функция предполагает допустимый ввод. Для строк, содержащих данные в кодировке, отличной от base64 / шестнадцатеричной (например, пробелы), возвращаемое значение может быть больше, чем длина `Buffer` создан из строки.

```mjs
import { Buffer } from 'buffer';

const str = '\u00bd + \u00bc = \u00be';

console.log(
  `${str}: ${str.length} characters, ` +
    `${Buffer.byteLength(str, 'utf8')} bytes`
);
// Prints: ½ + ¼ = ¾: 9 characters, 12 bytes
```

```cjs
const { Buffer } = require('buffer');

const str = '\u00bd + \u00bc = \u00be';

console.log(
  `${str}: ${str.length} characters, ` +
    `${Buffer.byteLength(str, 'utf8')} bytes`
);
// Prints: ½ + ¼ = ¾: 9 characters, 12 bytes
```

Когда `string` это `Buffer`/[`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)/[`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)/[`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)/ [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), длина байта, как сообщает `.byteLength` возвращается.

### Статический метод: `Buffer.compare(buf1, buf2)`

<!-- YAML
added: v0.11.13
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The arguments can now be `Uint8Array`s.
-->

- `buf1` {Buffer | Uint8Array}
- `buf2` {Buffer | Uint8Array}
- Возвращает: {integer} Либо `-1`, `0`, или `1`, в зависимости от результата сравнения. Видеть [`buf.compare()`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend) для подробностей.

Сравнивает `buf1` к `buf2`, обычно с целью сортировки массивов `Buffer` экземпляры. Это эквивалентно вызову [`buf1.compare(buf2)`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

console.log(arr.sort(Buffer.compare));
// Prints: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
// (This result is equal to: [buf2, buf1].)
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

console.log(arr.sort(Buffer.compare));
// Prints: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
// (This result is equal to: [buf2, buf1].)
```

### Статический метод: `Buffer.concat(list[, totalLength])`

<!-- YAML
added: v0.7.11
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The elements of `list` can now be `Uint8Array`s.
-->

- `list` {Буфер \[] | Uint8Array \[]} Список `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) экземпляры для объединения.
- `totalLength` {integer} Общая длина `Buffer` экземпляры в `list` при конкатенации.
- Возвращает: {Buffer}

Возвращает новый `Buffer` что является результатом объединения всех `Buffer` экземпляры в `list` вместе.

Если в списке нет пунктов или если `totalLength` равно 0, то новый `Buffer` возвращается.

Если `totalLength` не предусмотрено, рассчитывается от `Buffer` экземпляры в `list` добавив их длины.

Если `totalLength` предоставляется, оно приводится к беззнаковому целому числу. Если общая длина `Buffer`с в `list` превышает `totalLength`, результат обрезается до `totalLength`.

```mjs
import { Buffer } from 'buffer';

// Create a single `Buffer` from a list of three `Buffer` instances.

const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// Prints: 42

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// Prints: <Buffer 00 00 00 00 ...>
console.log(bufA.length);
// Prints: 42
```

```cjs
const { Buffer } = require('buffer');

// Create a single `Buffer` from a list of three `Buffer` instances.

const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// Prints: 42

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// Prints: <Buffer 00 00 00 00 ...>
console.log(bufA.length);
// Prints: 42
```

`Buffer.concat()` может также использовать внутренний `Buffer` бассейн как [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) делает.

### Статический метод: `Buffer.from(array)`

<!-- YAML
added: v5.10.0
-->

- `array` {целое \[]}

Выделяет новый `Buffer` используя `array` байтов в диапазоне `0` - `255`. Записи массива вне этого диапазона будут усечены, чтобы поместиться в него.

```mjs
import { Buffer } from 'buffer';

// Creates a new Buffer containing the UTF-8 bytes of the string 'buffer'.
const buf = Buffer.from([
  0x62,
  0x75,
  0x66,
  0x66,
  0x65,
  0x72,
]);
```

```cjs
const { Buffer } = require('buffer');

// Creates a new Buffer containing the UTF-8 bytes of the string 'buffer'.
const buf = Buffer.from([
  0x62,
  0x75,
  0x66,
  0x66,
  0x65,
  0x72,
]);
```

А `TypeError` будет брошен, если `array` не `Array` или другой тип, подходящий для `Buffer.from()` варианты.

`Buffer.from(array)` а также [`Buffer.from(string)`](#static-method-bufferfromstring-encoding) может также использовать внутренний `Buffer` бассейн как [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) делает.

### Статический метод: `Buffer.from(arrayBuffer[, byteOffset[, length]])`

<!-- YAML
added: v5.10.0
-->

- `arrayBuffer` {ArrayBuffer | SharedArrayBuffer} An [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), например `.buffer` собственность [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).
- `byteOffset` {integer} Индекс первого выставляемого байта. **Дефолт:** `0`.
- `length` {integer} Число байтов, которые нужно раскрыть. **Дефолт:** `arrayBuffer.byteLength - byteOffset`.

Это создает вид [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) без копирования базовой памяти. Например, при передаче ссылки на `.buffer` собственность [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) например, недавно созданный `Buffer` будет использовать ту же выделенную память, что и [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)лежит в основе `ArrayBuffer`.

```mjs
import { Buffer } from 'buffer';

const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Shares memory with `arr`.
const buf = Buffer.from(arr.buffer);

console.log(buf);
// Prints: <Buffer 88 13 a0 0f>

// Changing the original Uint16Array changes the Buffer also.
arr[1] = 6000;

console.log(buf);
// Prints: <Buffer 88 13 70 17>
```

```cjs
const { Buffer } = require('buffer');

const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Shares memory with `arr`.
const buf = Buffer.from(arr.buffer);

console.log(buf);
// Prints: <Buffer 88 13 a0 0f>

// Changing the original Uint16Array changes the Buffer also.
arr[1] = 6000;

console.log(buf);
// Prints: <Buffer 88 13 70 17>
```

Необязательный `byteOffset` а также `length` аргументы указывают диапазон памяти в пределах `arrayBuffer` что будет разделено `Buffer`.

```mjs
import { Buffer } from 'buffer';

const ab = new ArrayBuffer(10);
const buf = Buffer.from(ab, 0, 2);

console.log(buf.length);
// Prints: 2
```

```cjs
const { Buffer } = require('buffer');

const ab = new ArrayBuffer(10);
const buf = Buffer.from(ab, 0, 2);

console.log(buf.length);
// Prints: 2
```

А `TypeError` будет брошен, если `arrayBuffer` не [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) или другой тип, подходящий для `Buffer.from()` варианты.

Важно помнить, что подкладка `ArrayBuffer` может охватывать диапазон памяти, выходящий за пределы `TypedArray` Посмотреть. Новый `Buffer` создан с использованием `buffer` собственность `TypedArray` может выходить за пределы диапазона `TypedArray`:

```mjs
import { Buffer } from 'buffer';

const arrA = Uint8Array.from([0x63, 0x64, 0x65, 0x66]); // 4 elements
const arrB = new Uint8Array(arrA.buffer, 1, 2); // 2 elements
console.log(arrA.buffer === arrB.buffer); // true

const buf = Buffer.from(arrB.buffer);
console.log(buf);
// Prints: <Buffer 63 64 65 66>
```

```cjs
const { Buffer } = require('buffer');

const arrA = Uint8Array.from([0x63, 0x64, 0x65, 0x66]); // 4 elements
const arrB = new Uint8Array(arrA.buffer, 1, 2); // 2 elements
console.log(arrA.buffer === arrB.buffer); // true

const buf = Buffer.from(arrB.buffer);
console.log(buf);
// Prints: <Buffer 63 64 65 66>
```

### Статический метод: `Buffer.from(buffer)`

<!-- YAML
added: v5.10.0
-->

- `buffer` {Buffer | Uint8Array} Существующий `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) из которого копировать данные.

Копирует пройденное `buffer` данные на новый `Buffer` пример.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from('buffer');
const buf2 = Buffer.from(buf1);

buf1[0] = 0x61;

console.log(buf1.toString());
// Prints: auffer
console.log(buf2.toString());
// Prints: buffer
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from('buffer');
const buf2 = Buffer.from(buf1);

buf1[0] = 0x61;

console.log(buf1.toString());
// Prints: auffer
console.log(buf2.toString());
// Prints: buffer
```

А `TypeError` будет брошен, если `buffer` это не `Buffer` или другой тип, подходящий для `Buffer.from()` варианты.

### Статический метод: `Buffer.from(object[, offsetOrEncoding[, length]])`

<!-- YAML
added: v8.2.0
-->

- `object` {Object} Объект, поддерживающий `Symbol.toPrimitive` или `valueOf()`.
- `offsetOrEncoding` {целое число | строка} байтовое смещение или кодировка.
- `length` {integer} Длина.

Для объектов, чьи `valueOf()` функция возвращает значение, не строго равное `object`, возвращает `Buffer.from(object.valueOf(), offsetOrEncoding, length)`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from(new String('this is a test'));
// Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from(new String('this is a test'));
// Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
```

Для объектов, поддерживающих `Symbol.toPrimitive`, возвращает `Buffer.from(object[Symbol.toPrimitive]('string'), offsetOrEncoding)`.

```mjs
import { Buffer } from 'buffer';

class Foo {
  [Symbol.toPrimitive]() {
    return 'this is a test';
  }
}

const buf = Buffer.from(new Foo(), 'utf8');
// Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
```

```cjs
const { Buffer } = require('buffer');

class Foo {
  [Symbol.toPrimitive]() {
    return 'this is a test';
  }
}

const buf = Buffer.from(new Foo(), 'utf8');
// Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
```

А `TypeError` будет брошен, если `object` не имеет упомянутых методов или не относится к другому типу, подходящему для `Buffer.from()` варианты.

### Статический метод: `Buffer.from(string[, encoding])`

<!-- YAML
added: v5.10.0
-->

- `string` {строка} Строка для кодирования.
- `encoding` {строка} Кодировка `string`. **Дефолт:** `'utf8'`.

Создает новый `Buffer` содержащий `string`. В `encoding` параметр определяет кодировку символов, которая будет использоваться при преобразовании `string` в байты.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from('this is a tést');
const buf2 = Buffer.from(
  '7468697320697320612074c3a97374',
  'hex'
);

console.log(buf1.toString());
// Prints: this is a tést
console.log(buf2.toString());
// Prints: this is a tést
console.log(buf1.toString('latin1'));
// Prints: this is a tÃ©st
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from('this is a tést');
const buf2 = Buffer.from(
  '7468697320697320612074c3a97374',
  'hex'
);

console.log(buf1.toString());
// Prints: this is a tést
console.log(buf2.toString());
// Prints: this is a tést
console.log(buf1.toString('latin1'));
// Prints: this is a tÃ©st
```

А `TypeError` будет брошен, если `string` не является строкой или другим типом, подходящим для `Buffer.from()` варианты.

### Статический метод: `Buffer.isBuffer(obj)`

<!-- YAML
added: v0.1.101
-->

- `obj` {Объект}
- Возвращает: {логическое}

Возврат `true` если `obj` это `Buffer`, `false` иначе.

```mjs
import { Buffer } from 'buffer';

Buffer.isBuffer(Buffer.alloc(10)); // true
Buffer.isBuffer(Buffer.from('foo')); // true
Buffer.isBuffer('a string'); // false
Buffer.isBuffer([]); // false
Buffer.isBuffer(new Uint8Array(1024)); // false
```

```cjs
const { Buffer } = require('buffer');

Buffer.isBuffer(Buffer.alloc(10)); // true
Buffer.isBuffer(Buffer.from('foo')); // true
Buffer.isBuffer('a string'); // false
Buffer.isBuffer([]); // false
Buffer.isBuffer(new Uint8Array(1024)); // false
```

### Статический метод: `Buffer.isEncoding(encoding)`

<!-- YAML
added: v0.9.1
-->

- `encoding` {строка} Имя кодировки символов для проверки.
- Возвращает: {логическое}

Возврат `true` если `encoding` имя поддерживаемой кодировки символов, или `false` иначе.

```mjs
import { Buffer } from 'buffer';

console.log(Buffer.isEncoding('utf8'));
// Prints: true

console.log(Buffer.isEncoding('hex'));
// Prints: true

console.log(Buffer.isEncoding('utf/8'));
// Prints: false

console.log(Buffer.isEncoding(''));
// Prints: false
```

```cjs
const { Buffer } = require('buffer');

console.log(Buffer.isEncoding('utf8'));
// Prints: true

console.log(Buffer.isEncoding('hex'));
// Prints: true

console.log(Buffer.isEncoding('utf/8'));
// Prints: false

console.log(Buffer.isEncoding(''));
// Prints: false
```

### Свойство класса: `Buffer.poolSize`

<!-- YAML
added: v0.11.3
-->

- {целое число} **Дефолт:** `8192`

Это размер (в байтах) предварительно выделенного внутреннего `Buffer` экземпляры, используемые для объединения. Это значение можно изменить.

### `buf[index]`

- `index` {целое число}

Оператор индекса `[index]` может использоваться для получения и установки октета в позиции `index` в `buf`. Значения относятся к отдельным байтам, поэтому допустимый диапазон значений находится между `0x00` а также `0xFF` (шестнадцатеричный) или `0` а также `255` (десятичный).

Этот оператор унаследован от `Uint8Array`, поэтому его поведение при доступе за границу такое же, как и `Uint8Array`. Другими словами, `buf[index]` возвращается `undefined` когда `index` отрицательно или больше или равно `buf.length`, а также `buf[index] = value` не изменяет буфер, если `index` отрицательный или `>= buf.length`.

```mjs
import { Buffer } from 'buffer';

// Copy an ASCII string into a `Buffer` one byte at a time.
// (This only works for ASCII-only strings. In general, one should use
// `Buffer.from()` to perform this conversion.)

const str = 'Node.js';
const buf = Buffer.allocUnsafe(str.length);

for (let i = 0; i < str.length; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('utf8'));
// Prints: Node.js
```

```cjs
const { Buffer } = require('buffer');

// Copy an ASCII string into a `Buffer` one byte at a time.
// (This only works for ASCII-only strings. In general, one should use
// `Buffer.from()` to perform this conversion.)

const str = 'Node.js';
const buf = Buffer.allocUnsafe(str.length);

for (let i = 0; i < str.length; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('utf8'));
// Prints: Node.js
```

### `buf.buffer`

- {ArrayBuffer} Базовый `ArrayBuffer` объект, на основе которого это `Buffer` объект создан.

Этот `ArrayBuffer` не гарантируется точное соответствие оригиналу `Buffer`. См. Примечания к `buf.byteOffset` для подробностей.

```mjs
import { Buffer } from 'buffer';

const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer);
// Prints: true
```

```cjs
const { Buffer } = require('buffer');

const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer);
// Prints: true
```

### `buf.byteOffset`

- {integer} `byteOffset` принадлежащий `Buffer`лежащий в основе `ArrayBuffer` объект.

При установке `byteOffset` в `Buffer.from(ArrayBuffer, byteOffset, length)`, а иногда при выделении `Buffer` меньше чем `Buffer.poolSize`, буфер не начинается с нулевого смещения на нижележащем `ArrayBuffer`.

Это может вызвать проблемы при доступе к базовому `ArrayBuffer` напрямую используя `buf.buffer`, как и другие части `ArrayBuffer` может не иметь отношения к `Buffer` сам объект.

Распространенная проблема при создании `TypedArray` объект, который разделяет свою память с `Buffer` в том, что в этом случае нужно указать `byteOffset` правильно:

```mjs
import { Buffer } from 'buffer';

// Create a buffer smaller than `Buffer.poolSize`.
const nodeBuffer = new Buffer.from([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
]);

// When casting the Node.js Buffer to an Int8Array, use the byteOffset
// to refer only to the part of `nodeBuffer.buffer` that contains the memory
// for `nodeBuffer`.
new Int8Array(
  nodeBuffer.buffer,
  nodeBuffer.byteOffset,
  nodeBuffer.length
);
```

```cjs
const { Buffer } = require('buffer');

// Create a buffer smaller than `Buffer.poolSize`.
const nodeBuffer = new Buffer.from([
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
]);

// When casting the Node.js Buffer to an Int8Array, use the byteOffset
// to refer only to the part of `nodeBuffer.buffer` that contains the memory
// for `nodeBuffer`.
new Int8Array(
  nodeBuffer.buffer,
  nodeBuffer.byteOffset,
  nodeBuffer.length
);
```

### `buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])`

<!-- YAML
added: v0.11.13
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The `target` parameter can now be a `Uint8Array`.
  - version: v5.11.0
    pr-url: https://github.com/nodejs/node/pull/5880
    description: Additional parameters for specifying offsets are supported now.
-->

- `target` {Buffer | Uint8Array} A `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) с чем сравнивать `buf`.
- `targetStart` {integer} Смещение в пределах `target` с чего начать сравнение. **Дефолт:** `0`.
- `targetEnd` {integer} Смещение в пределах `target` на котором следует завершить сравнение (не включительно). **Дефолт:** `target.length`.
- `sourceStart` {integer} Смещение в пределах `buf` с чего начать сравнение. **Дефолт:** `0`.
- `sourceEnd` {integer} Смещение в пределах `buf` на котором следует завершить сравнение (не включительно). **Дефолт:** [`buf.length`](#buflength).
- Возвращает: {целое число}

Сравнивает `buf` с участием `target` и возвращает число, указывающее, `buf` идет до, после или то же самое, что и `target` в порядке сортировки. Сравнение основано на фактической последовательности байтов в каждом `Buffer`.

- `0` возвращается, если `target` такой же как `buf`
- `1` возвращается, если `target` должен прийти _до_ `buf` при сортировке.
- `-1` возвращается, если `target` должен прийти _после_ `buf` при сортировке.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('BCD');
const buf3 = Buffer.from('ABCD');

console.log(buf1.compare(buf1));
// Prints: 0
console.log(buf1.compare(buf2));
// Prints: -1
console.log(buf1.compare(buf3));
// Prints: -1
console.log(buf2.compare(buf1));
// Prints: 1
console.log(buf2.compare(buf3));
// Prints: 1
console.log([buf1, buf2, buf3].sort(Buffer.compare));
// Prints: [ <Buffer 41 42 43>, <Buffer 41 42 43 44>, <Buffer 42 43 44> ]
// (This result is equal to: [buf1, buf3, buf2].)
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('BCD');
const buf3 = Buffer.from('ABCD');

console.log(buf1.compare(buf1));
// Prints: 0
console.log(buf1.compare(buf2));
// Prints: -1
console.log(buf1.compare(buf3));
// Prints: -1
console.log(buf2.compare(buf1));
// Prints: 1
console.log(buf2.compare(buf3));
// Prints: 1
console.log([buf1, buf2, buf3].sort(Buffer.compare));
// Prints: [ <Buffer 41 42 43>, <Buffer 41 42 43 44>, <Buffer 42 43 44> ]
// (This result is equal to: [buf1, buf3, buf2].)
```

Необязательный `targetStart`, `targetEnd`, `sourceStart`, а также `sourceEnd` аргументы могут использоваться для ограничения сравнения определенными диапазонами в пределах `target` а также `buf` соответственно.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

console.log(buf1.compare(buf2, 5, 9, 0, 4));
// Prints: 0
console.log(buf1.compare(buf2, 0, 6, 4));
// Prints: -1
console.log(buf1.compare(buf2, 5, 6, 5));
// Prints: 1
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

console.log(buf1.compare(buf2, 5, 9, 0, 4));
// Prints: 0
console.log(buf1.compare(buf2, 0, 6, 4));
// Prints: -1
console.log(buf1.compare(buf2, 5, 6, 5));
// Prints: 1
```

[`ERR_OUT_OF_RANGE`](errors.md#err_out_of_range) бросается, если `targetStart < 0`, `sourceStart < 0`, `targetEnd > target.byteLength`, или `sourceEnd > source.byteLength`.

### `buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])`

<!-- YAML
added: v0.1.90
-->

- `target` {Buffer | Uint8Array} A `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) копировать в.
- `targetStart` {integer} Смещение в пределах `target` на котором начать писать. **Дефолт:** `0`.
- `sourceStart` {integer} Смещение в пределах `buf` с которого начать копирование. **Дефолт:** `0`.
- `sourceEnd` {integer} Смещение в пределах `buf` при котором копирование прекращается (не включительно). **Дефолт:** [`buf.length`](#buflength).
- Возвращает: {целое число} Количество скопированных байтов.

Копирует данные из региона `buf` в регион в `target`, даже если `target` область памяти перекрывается с `buf`.

[`TypedArray.prototype.set()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set) выполняет ту же операцию и доступен для всех TypedArrays, включая Node.js `Buffer`s, хотя и принимает другие аргументы функции.

```mjs
import { Buffer } from 'buffer';

// Create two `Buffer` instances.
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

// Copy `buf1` bytes 16 through 19 into `buf2` starting at byte 8 of `buf2`.
buf1.copy(buf2, 8, 16, 20);
// This is equivalent to:
// buf2.set(buf1.subarray(16, 20), 8);

console.log(buf2.toString('ascii', 0, 25));
// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
```

```cjs
const { Buffer } = require('buffer');

// Create two `Buffer` instances.
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

// Copy `buf1` bytes 16 through 19 into `buf2` starting at byte 8 of `buf2`.
buf1.copy(buf2, 8, 16, 20);
// This is equivalent to:
// buf2.set(buf1.subarray(16, 20), 8);

console.log(buf2.toString('ascii', 0, 25));
// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
```

```mjs
import { Buffer } from 'buffer';

// Create a `Buffer` and copy data from one region to an overlapping region
// within the same `Buffer`.

const buf = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf[i] = i + 97;
}

buf.copy(buf, 0, 4, 10);

console.log(buf.toString());
// Prints: efghijghijklmnopqrstuvwxyz
```

```cjs
const { Buffer } = require('buffer');

// Create a `Buffer` and copy data from one region to an overlapping region
// within the same `Buffer`.

const buf = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf[i] = i + 97;
}

buf.copy(buf, 0, 4, 10);

console.log(buf.toString());
// Prints: efghijghijklmnopqrstuvwxyz
```

### `buf.entries()`

<!-- YAML
added: v1.1.0
-->

- Возвращает: {Iterator}

Создает и возвращает [итератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) из `[index, byte]` пары из содержимого `buf`.

```mjs
import { Buffer } from 'buffer';

// Log the entire contents of a `Buffer`.

const buf = Buffer.from('buffer');

for (const pair of buf.entries()) {
  console.log(pair);
}
// Prints:
//   [0, 98]
//   [1, 117]
//   [2, 102]
//   [3, 102]
//   [4, 101]
//   [5, 114]
```

```cjs
const { Buffer } = require('buffer');

// Log the entire contents of a `Buffer`.

const buf = Buffer.from('buffer');

for (const pair of buf.entries()) {
  console.log(pair);
}
// Prints:
//   [0, 98]
//   [1, 117]
//   [2, 102]
//   [3, 102]
//   [4, 101]
//   [5, 114]
```

### `buf.equals(otherBuffer)`

<!-- YAML
added: v0.11.13
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The arguments can now be `Uint8Array`s.
-->

- `otherBuffer` {Buffer | Uint8Array} A `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) с чем сравнивать `buf`.
- Возвращает: {логическое}

Возврат `true` если оба `buf` а также `otherBuffer` иметь точно такие же байты, `false` иначе. Эквивалентно [`buf.compare(otherBuffer) === 0`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('414243', 'hex');
const buf3 = Buffer.from('ABCD');

console.log(buf1.equals(buf2));
// Prints: true
console.log(buf1.equals(buf3));
// Prints: false
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('414243', 'hex');
const buf3 = Buffer.from('ABCD');

console.log(buf1.equals(buf2));
// Prints: true
console.log(buf1.equals(buf3));
// Prints: false
```

### `buf.fill(value[, offset[, end]][, encoding])`

<!-- YAML
added: v0.5.0
changes:
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22969
    description: Throws `ERR_OUT_OF_RANGE` instead of `ERR_INDEX_OUT_OF_RANGE`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18790
    description: Negative `end` values throw an `ERR_INDEX_OUT_OF_RANGE` error.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18129
    description: Attempting to fill a non-zero length buffer with a zero length
                 buffer triggers a thrown exception.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17427
    description: Specifying an invalid string for `value` triggers a thrown
                 exception.
  - version: v5.7.0
    pr-url: https://github.com/nodejs/node/pull/4935
    description: The `encoding` parameter is supported now.
-->

- `value` {string | Buffer | Uint8Array | integer} Значение, которым нужно заполнить `buf`.
- `offset` {integer} Количество байтов, которые нужно пропустить перед началом заполнения `buf`. **Дефолт:** `0`.
- `end` {integer} Где прекратить заполнение `buf` (не включительно). **Дефолт:** [`buf.length`](#buflength).
- `encoding` {строка} Кодировка для `value` если `value` это строка. **Дефолт:** `'utf8'`.
- Возвращает: {Buffer} Ссылка на `buf`.

Заполняет `buf` с указанным `value`. Если `offset` а также `end` не даны, весь `buf` будет заполнено:

```mjs
import { Buffer } from 'buffer';

// Fill a `Buffer` with the ASCII character 'h'.

const b = Buffer.allocUnsafe(50).fill('h');

console.log(b.toString());
// Prints: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
```

```cjs
const { Buffer } = require('buffer');

// Fill a `Buffer` with the ASCII character 'h'.

const b = Buffer.allocUnsafe(50).fill('h');

console.log(b.toString());
// Prints: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
```

`value` принужден к `uint32` значение, если это не строка, `Buffer`, или целое число. Если полученное целое число больше, чем `255` (десятичный), `buf` будет заполнен `value & 255`.

Если окончательное написание `fill()` операция приходится на многобайтовый символ, тогда только байты этого символа, которые вписываются в `buf` написаны:

```mjs
import { Buffer } from 'buffer';

// Fill a `Buffer` with character that takes up two bytes in UTF-8.

console.log(Buffer.allocUnsafe(5).fill('\u0222'));
// Prints: <Buffer c8 a2 c8 a2 c8>
```

```cjs
const { Buffer } = require('buffer');

// Fill a `Buffer` with character that takes up two bytes in UTF-8.

console.log(Buffer.allocUnsafe(5).fill('\u0222'));
// Prints: <Buffer c8 a2 c8 a2 c8>
```

Если `value` содержит недопустимые символы, он усечен; если не осталось действительных данных заполнения, выдается исключение:

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(5);

console.log(buf.fill('a'));
// Prints: <Buffer 61 61 61 61 61>
console.log(buf.fill('aazz', 'hex'));
// Prints: <Buffer aa aa aa aa aa>
console.log(buf.fill('zz', 'hex'));
// Throws an exception.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(5);

console.log(buf.fill('a'));
// Prints: <Buffer 61 61 61 61 61>
console.log(buf.fill('aazz', 'hex'));
// Prints: <Buffer aa aa aa aa aa>
console.log(buf.fill('zz', 'hex'));
// Throws an exception.
```

### `buf.includes(value[, byteOffset][, encoding])`

<!-- YAML
added: v5.3.0
-->

- `value` {string | Buffer | Uint8Array | integer} Что искать.
- `byteOffset` {integer} С чего начать поиск в `buf`. Если отрицательное, то смещение рассчитывается от конца `buf`. **Дефолт:** `0`.
- `encoding` {строка} Если `value` это строка, это ее кодировка. **Дефолт:** `'utf8'`.
- Возвращает: {логическое} `true` если `value` был найден в `buf`, `false` иначе.

Эквивалентно [`buf.indexOf() !== -1`](#bufindexofvalue-byteoffset-encoding).

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('this is a buffer');

console.log(buf.includes('this'));
// Prints: true
console.log(buf.includes('is'));
// Prints: true
console.log(buf.includes(Buffer.from('a buffer')));
// Prints: true
console.log(buf.includes(97));
// Prints: true (97 is the decimal ASCII value for 'a')
console.log(buf.includes(Buffer.from('a buffer example')));
// Prints: false
console.log(
  buf.includes(Buffer.from('a buffer example').slice(0, 8))
);
// Prints: true
console.log(buf.includes('this', 4));
// Prints: false
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('this is a buffer');

console.log(buf.includes('this'));
// Prints: true
console.log(buf.includes('is'));
// Prints: true
console.log(buf.includes(Buffer.from('a buffer')));
// Prints: true
console.log(buf.includes(97));
// Prints: true (97 is the decimal ASCII value for 'a')
console.log(buf.includes(Buffer.from('a buffer example')));
// Prints: false
console.log(
  buf.includes(Buffer.from('a buffer example').slice(0, 8))
);
// Prints: true
console.log(buf.includes('this', 4));
// Prints: false
```

### `buf.indexOf(value[, byteOffset][, encoding])`

<!-- YAML
added: v1.5.0
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The `value` can now be a `Uint8Array`.
  - version:
    - v5.7.0
    - v4.4.0
    pr-url: https://github.com/nodejs/node/pull/4803
    description: When `encoding` is being passed, the `byteOffset` parameter
                 is no longer required.
-->

- `value` {string | Buffer | Uint8Array | integer} Что искать.
- `byteOffset` {integer} С чего начать поиск в `buf`. Если отрицательное, то смещение рассчитывается от конца `buf`. **Дефолт:** `0`.
- `encoding` {строка} Если `value` - строка, это кодировка, используемая для определения двоичного представления строки, которая будет искать в `buf`. **Дефолт:** `'utf8'`.
- Возвращает: {целое число} Индекс первого вхождения `value` в `buf`, или `-1` если `buf` не содержит `value`.

Если `value` является:

- строка, `value` интерпретируется в соответствии с кодировкой символов в `encoding`.
- а `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), `value` будет использоваться полностью. Для сравнения частичного `Buffer`, использовать [`buf.slice()`](#bufslicestart-end).
- число, `value` будет интерпретироваться как 8-битное целое число без знака между `0` а также `255`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('this is a buffer');

console.log(buf.indexOf('this'));
// Prints: 0
console.log(buf.indexOf('is'));
// Prints: 2
console.log(buf.indexOf(Buffer.from('a buffer')));
// Prints: 8
console.log(buf.indexOf(97));
// Prints: 8 (97 is the decimal ASCII value for 'a')
console.log(buf.indexOf(Buffer.from('a buffer example')));
// Prints: -1
console.log(
  buf.indexOf(Buffer.from('a buffer example').slice(0, 8))
);
// Prints: 8

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(utf16Buffer.indexOf('\u03a3', 0, 'utf16le'));
// Prints: 4
console.log(utf16Buffer.indexOf('\u03a3', -4, 'utf16le'));
// Prints: 6
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('this is a buffer');

console.log(buf.indexOf('this'));
// Prints: 0
console.log(buf.indexOf('is'));
// Prints: 2
console.log(buf.indexOf(Buffer.from('a buffer')));
// Prints: 8
console.log(buf.indexOf(97));
// Prints: 8 (97 is the decimal ASCII value for 'a')
console.log(buf.indexOf(Buffer.from('a buffer example')));
// Prints: -1
console.log(
  buf.indexOf(Buffer.from('a buffer example').slice(0, 8))
);
// Prints: 8

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(utf16Buffer.indexOf('\u03a3', 0, 'utf16le'));
// Prints: 4
console.log(utf16Buffer.indexOf('\u03a3', -4, 'utf16le'));
// Prints: 6
```

Если `value` не является строкой, числом или `Buffer`, этот метод вызовет `TypeError`. Если `value` является числом, оно будет приведено к допустимому байтовому значению, целому числу от 0 до 255.

Если `byteOffset` не является числом, оно будет преобразовано в число. Если результат принуждения `NaN` или `0`, то будет произведен поиск во всем буфере. Это поведение соответствует [`String.prototype.indexOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf).

```mjs
import { Buffer } from 'buffer';

const b = Buffer.from('abcdef');

// Passing a value that's a number, but not a valid byte.
// Prints: 2, equivalent to searching for 99 or 'c'.
console.log(b.indexOf(99.9));
console.log(b.indexOf(256 + 99));

// Passing a byteOffset that coerces to NaN or 0.
// Prints: 1, searching the whole buffer.
console.log(b.indexOf('b', undefined));
console.log(b.indexOf('b', {}));
console.log(b.indexOf('b', null));
console.log(b.indexOf('b', []));
```

```cjs
const { Buffer } = require('buffer');

const b = Buffer.from('abcdef');

// Passing a value that's a number, but not a valid byte.
// Prints: 2, equivalent to searching for 99 or 'c'.
console.log(b.indexOf(99.9));
console.log(b.indexOf(256 + 99));

// Passing a byteOffset that coerces to NaN or 0.
// Prints: 1, searching the whole buffer.
console.log(b.indexOf('b', undefined));
console.log(b.indexOf('b', {}));
console.log(b.indexOf('b', null));
console.log(b.indexOf('b', []));
```

Если `value` пустая строка или пустая `Buffer` а также `byteOffset` меньше чем `buf.length`, `byteOffset` будет возвращен. Если `value` пусто и `byteOffset` по крайней мере `buf.length`, `buf.length` будет возвращен.

### `buf.keys()`

<!-- YAML
added: v1.1.0
-->

- Возвращает: {Iterator}

Создает и возвращает [итератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) из `buf` ключи (индексы).

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('buffer');

for (const key of buf.keys()) {
  console.log(key);
}
// Prints:
//   0
//   1
//   2
//   3
//   4
//   5
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('buffer');

for (const key of buf.keys()) {
  console.log(key);
}
// Prints:
//   0
//   1
//   2
//   3
//   4
//   5
```

### `buf.lastIndexOf(value[, byteOffset][, encoding])`

<!-- YAML
added: v6.0.0
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The `value` can now be a `Uint8Array`.
-->

- `value` {string | Buffer | Uint8Array | integer} Что искать.
- `byteOffset` {integer} С чего начать поиск в `buf`. Если отрицательное, то смещение рассчитывается от конца `buf`. **Дефолт:** `buf.length - 1`.
- `encoding` {строка} Если `value` - строка, это кодировка, используемая для определения двоичного представления строки, которая будет искать в `buf`. **Дефолт:** `'utf8'`.
- Возвращает: {целое число} Индекс последнего вхождения `value` в `buf`, или `-1` если `buf` не содержит `value`.

Идентично [`buf.indexOf()`](#bufindexofvalue-byteoffset-encoding), кроме последнего появления `value` найден, а не первое вхождение.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('this buffer is a buffer');

console.log(buf.lastIndexOf('this'));
// Prints: 0
console.log(buf.lastIndexOf('buffer'));
// Prints: 17
console.log(buf.lastIndexOf(Buffer.from('buffer')));
// Prints: 17
console.log(buf.lastIndexOf(97));
// Prints: 15 (97 is the decimal ASCII value for 'a')
console.log(buf.lastIndexOf(Buffer.from('yolo')));
// Prints: -1
console.log(buf.lastIndexOf('buffer', 5));
// Prints: 5
console.log(buf.lastIndexOf('buffer', 4));
// Prints: -1

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(
  utf16Buffer.lastIndexOf('\u03a3', undefined, 'utf16le')
);
// Prints: 6
console.log(
  utf16Buffer.lastIndexOf('\u03a3', -5, 'utf16le')
);
// Prints: 4
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('this buffer is a buffer');

console.log(buf.lastIndexOf('this'));
// Prints: 0
console.log(buf.lastIndexOf('buffer'));
// Prints: 17
console.log(buf.lastIndexOf(Buffer.from('buffer')));
// Prints: 17
console.log(buf.lastIndexOf(97));
// Prints: 15 (97 is the decimal ASCII value for 'a')
console.log(buf.lastIndexOf(Buffer.from('yolo')));
// Prints: -1
console.log(buf.lastIndexOf('buffer', 5));
// Prints: 5
console.log(buf.lastIndexOf('buffer', 4));
// Prints: -1

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(
  utf16Buffer.lastIndexOf('\u03a3', undefined, 'utf16le')
);
// Prints: 6
console.log(
  utf16Buffer.lastIndexOf('\u03a3', -5, 'utf16le')
);
// Prints: 4
```

Если `value` не является строкой, числом или `Buffer`, этот метод вызовет `TypeError`. Если `value` является числом, оно будет приведено к допустимому байтовому значению, целому числу от 0 до 255.

Если `byteOffset` не является числом, оно будет преобразовано в число. Любые аргументы, которые принуждают к `NaN`, нравиться `{}` или `undefined`, будет искать во всем буфере. Это поведение соответствует [`String.prototype.lastIndexOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/lastIndexOf).

```mjs
import { Buffer } from 'buffer';

const b = Buffer.from('abcdef');

// Passing a value that's a number, but not a valid byte.
// Prints: 2, equivalent to searching for 99 or 'c'.
console.log(b.lastIndexOf(99.9));
console.log(b.lastIndexOf(256 + 99));

// Passing a byteOffset that coerces to NaN.
// Prints: 1, searching the whole buffer.
console.log(b.lastIndexOf('b', undefined));
console.log(b.lastIndexOf('b', {}));

// Passing a byteOffset that coerces to 0.
// Prints: -1, equivalent to passing 0.
console.log(b.lastIndexOf('b', null));
console.log(b.lastIndexOf('b', []));
```

```cjs
const { Buffer } = require('buffer');

const b = Buffer.from('abcdef');

// Passing a value that's a number, but not a valid byte.
// Prints: 2, equivalent to searching for 99 or 'c'.
console.log(b.lastIndexOf(99.9));
console.log(b.lastIndexOf(256 + 99));

// Passing a byteOffset that coerces to NaN.
// Prints: 1, searching the whole buffer.
console.log(b.lastIndexOf('b', undefined));
console.log(b.lastIndexOf('b', {}));

// Passing a byteOffset that coerces to 0.
// Prints: -1, equivalent to passing 0.
console.log(b.lastIndexOf('b', null));
console.log(b.lastIndexOf('b', []));
```

Если `value` пустая строка или пустая `Buffer`, `byteOffset` будет возвращен.

### `buf.length`

<!-- YAML
added: v0.1.90
-->

- {целое число}

Возвращает количество байтов в `buf`.

```mjs
import { Buffer } from 'buffer';

// Create a `Buffer` and write a shorter string to it using UTF-8.

const buf = Buffer.alloc(1234);

console.log(buf.length);
// Prints: 1234

buf.write('some string', 0, 'utf8');

console.log(buf.length);
// Prints: 1234
```

```cjs
const { Buffer } = require('buffer');

// Create a `Buffer` and write a shorter string to it using UTF-8.

const buf = Buffer.alloc(1234);

console.log(buf.length);
// Prints: 1234

buf.write('some string', 0, 'utf8');

console.log(buf.length);
// Prints: 1234
```

### `buf.parent`

<!-- YAML
deprecated: v8.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`buf.buffer`](#bufbuffer) вместо.

В `buf.parent` свойство - устаревший псевдоним для `buf.buffer`.

### `buf.readBigInt64BE([offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возврат: {bigint}

Читает знаковое 64-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

### `buf.readBigInt64LE([offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возврат: {bigint}

Читает знаковое 64-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

### `buf.readBigUInt64BE([offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
changes:
  - version:
    - v14.10.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34960
    description: This function is also available as `buf.readBigUint64BE()`.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возврат: {bigint}

Читает беззнаковое 64-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Эта функция также доступна в `readBigUint64BE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xff,
  0xff,
  0xff,
]);

console.log(buf.readBigUInt64BE(0));
// Prints: 4294967295n
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xff,
  0xff,
  0xff,
]);

console.log(buf.readBigUInt64BE(0));
// Prints: 4294967295n
```

### `buf.readBigUInt64LE([offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
changes:
  - version:
    - v14.10.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34960
    description: This function is also available as `buf.readBigUint64LE()`.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возврат: {bigint}

Читает беззнаковое 64-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Эта функция также доступна в `readBigUint64LE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xff,
  0xff,
  0xff,
]);

console.log(buf.readBigUInt64LE(0));
// Prints: 18446744069414584320n
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xff,
  0xff,
  0xff,
]);

console.log(buf.readBigUInt64LE(0));
// Prints: 18446744069414584320n
```

### `buf.readDoubleBE([offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возврат: {number}

Считывает 64-битное число с прямым порядком байтов из `buf` в указанном `offset`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleBE(0));
// Prints: 8.20788039913184e-304
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleBE(0));
// Prints: 8.20788039913184e-304
```

### `buf.readDoubleLE([offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возврат: {number}

Читает 64-битное двоичное число с прямым порядком байтов из `buf` в указанном `offset`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleLE(0));
// Prints: 5.447603722011605e-270
console.log(buf.readDoubleLE(1));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleLE(0));
// Prints: 5.447603722011605e-270
console.log(buf.readDoubleLE(1));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readFloatBE([offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возврат: {number}

Читает 32-битное число с обратным порядком байтов с обратным порядком байтов из `buf` в указанном `offset`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatBE(0));
// Prints: 2.387939260590663e-38
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatBE(0));
// Prints: 2.387939260590663e-38
```

### `buf.readFloatLE([offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возврат: {number}

Читает 32-битное число с прямым порядком байтов с порядковым номером из числа `buf` в указанном `offset`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatLE(0));
// Prints: 1.539989614439558e-36
console.log(buf.readFloatLE(1));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatLE(0));
// Prints: 1.539989614439558e-36
console.log(buf.readFloatLE(1));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readInt8([offset])`

<!-- YAML
added: v0.5.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 1`. **Дефолт:** `0`.
- Возвращает: {целое число}

Считывает 8-битное целое число со знаком из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([-1, 5]);

console.log(buf.readInt8(0));
// Prints: -1
console.log(buf.readInt8(1));
// Prints: 5
console.log(buf.readInt8(2));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([-1, 5]);

console.log(buf.readInt8(0));
// Prints: -1
console.log(buf.readInt8(1));
// Prints: 5
console.log(buf.readInt8(2));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readInt16BE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число}

Читает знаковое 16-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16BE(0));
// Prints: 5
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16BE(0));
// Prints: 5
```

### `buf.readInt16LE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число}

Считывает знаковое 16-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16LE(0));
// Prints: 1280
console.log(buf.readInt16LE(1));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16LE(0));
// Prints: 1280
console.log(buf.readInt16LE(1));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readInt32BE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число}

Считывает 32-битное целое число с прямым порядком байтов со знаком из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0, 0, 0, 5]);

console.log(buf.readInt32BE(0));
// Prints: 5
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0, 0, 0, 5]);

console.log(buf.readInt32BE(0));
// Prints: 5
```

### `buf.readInt32LE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число}

Считывает 32-битное целое число с прямым порядком байтов со знаком из `buf` в указанном `offset`.

Целые числа читаются из `Buffer` интерпретируются как знаковые значения с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0, 0, 0, 5]);

console.log(buf.readInt32LE(0));
// Prints: 83886080
console.log(buf.readInt32LE(1));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0, 0, 0, 5]);

console.log(buf.readInt32LE(0));
// Prints: 83886080
console.log(buf.readInt32LE(1));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readIntBE(offset, byteLength)`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число}

Читает `byteLength` количество байтов от `buf` в указанном `offset` и интерпретирует результат как знаковое значение с прямым порядком байтов, дополнение до двух, поддерживающее точность до 48 бит.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntBE(0, 6).toString(16));
// Prints: 1234567890ab
console.log(buf.readIntBE(1, 6).toString(16));
// Throws ERR_OUT_OF_RANGE.
console.log(buf.readIntBE(1, 0).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntBE(0, 6).toString(16));
// Prints: 1234567890ab
console.log(buf.readIntBE(1, 6).toString(16));
// Throws ERR_OUT_OF_RANGE.
console.log(buf.readIntBE(1, 0).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readIntLE(offset, byteLength)`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число}

Читает `byteLength` количество байтов от `buf` в указанном `offset` и интерпретирует результат как знаковое значение с прямым порядком байтов, дополнением до двух, с точностью до 48 бит.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntLE(0, 6).toString(16));
// Prints: -546f87a9cbee
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntLE(0, 6).toString(16));
// Prints: -546f87a9cbee
```

### `buf.readUInt8([offset])`

<!-- YAML
added: v0.5.0
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUint8()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 1`. **Дефолт:** `0`.
- Возвращает: {целое число}

Считывает 8-битное целое число без знака из `buf` в указанном `offset`.

Эта функция также доступна в `readUint8` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([1, -2]);

console.log(buf.readUInt8(0));
// Prints: 1
console.log(buf.readUInt8(1));
// Prints: 254
console.log(buf.readUInt8(2));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([1, -2]);

console.log(buf.readUInt8(0));
// Prints: 1
console.log(buf.readUInt8(1));
// Prints: 254
console.log(buf.readUInt8(2));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readUInt16BE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUint16BE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число}

Читает беззнаковое 16-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Эта функция также доступна в `readUint16BE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16BE(0).toString(16));
// Prints: 1234
console.log(buf.readUInt16BE(1).toString(16));
// Prints: 3456
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16BE(0).toString(16));
// Prints: 1234
console.log(buf.readUInt16BE(1).toString(16));
// Prints: 3456
```

### `buf.readUInt16LE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUint16LE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число}

Читает беззнаковое 16-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Эта функция также доступна в `readUint16LE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16LE(0).toString(16));
// Prints: 3412
console.log(buf.readUInt16LE(1).toString(16));
// Prints: 5634
console.log(buf.readUInt16LE(2).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16LE(0).toString(16));
// Prints: 3412
console.log(buf.readUInt16LE(1).toString(16));
// Prints: 5634
console.log(buf.readUInt16LE(2).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readUInt32BE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUint32BE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число}

Читает беззнаковое 32-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Эта функция также доступна в `readUint32BE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32BE(0).toString(16));
// Prints: 12345678
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32BE(0).toString(16));
// Prints: 12345678
```

### `buf.readUInt32LE([offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUint32LE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число}

Считывает беззнаковое 32-битное целое число с прямым порядком байтов из `buf` в указанном `offset`.

Эта функция также доступна в `readUint32LE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32LE(0).toString(16));
// Prints: 78563412
console.log(buf.readUInt32LE(1).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32LE(0).toString(16));
// Prints: 78563412
console.log(buf.readUInt32LE(1).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readUIntBE(offset, byteLength)`

<!-- YAML
added: v0.11.15
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUintBE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число}

Читает `byteLength` количество байтов от `buf` в указанном `offset` и интерпретирует результат как целое число без знака с прямым порядком байтов, поддерживающее до 48 бит точности.

Эта функция также доступна в `readUintBE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readUIntBE(0, 6).toString(16));
// Prints: 1234567890ab
console.log(buf.readUIntBE(1, 6).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readUIntBE(0, 6).toString(16));
// Prints: 1234567890ab
console.log(buf.readUIntBE(1, 6).toString(16));
// Throws ERR_OUT_OF_RANGE.
```

### `buf.readUIntLE(offset, byteLength)`

<!-- YAML
added: v0.11.15
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.readUintLE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `offset` {integer} Число байтов, которые нужно пропустить перед началом чтения. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число}

Читает `byteLength` количество байтов от `buf` в указанном `offset` и интерпретирует результат как беззнаковое целое число с прямым порядком байтов, поддерживающее до 48 бит точности.

Эта функция также доступна в `readUintLE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readUIntLE(0, 6).toString(16));
// Prints: ab9078563412
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readUIntLE(0, 6).toString(16));
// Prints: ab9078563412
```

### `buf.subarray([start[, end]])`

<!-- YAML
added: v3.0.0
-->

- `start` {integer} Где новое `Buffer` начнет. **Дефолт:** `0`.
- `end` {integer} Где новое `Buffer` закончится (не включительно). **Дефолт:** [`buf.length`](#buflength).
- Возвращает: {Buffer}

Возвращает новый `Buffer` который ссылается на ту же память, что и оригинал, но смещен и обрезан `start` а также `end` индексы.

Указание `end` больше чем [`buf.length`](#buflength) вернет тот же результат, что и `end` равно [`buf.length`](#buflength).

Этот метод унаследован от [`TypedArray.prototype.subarray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray).

Модификация нового `Buffer` slice изменит память в оригинале `Buffer` потому что выделенная память двух объектов перекрывается.

```mjs
import { Buffer } from 'buffer';

// Create a `Buffer` with the ASCII alphabet, take a slice, and modify one byte
// from the original `Buffer`.

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

const buf2 = buf1.subarray(0, 3);

console.log(buf2.toString('ascii', 0, buf2.length));
// Prints: abc

buf1[0] = 33;

console.log(buf2.toString('ascii', 0, buf2.length));
// Prints: !bc
```

```cjs
const { Buffer } = require('buffer');

// Create a `Buffer` with the ASCII alphabet, take a slice, and modify one byte
// from the original `Buffer`.

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

const buf2 = buf1.subarray(0, 3);

console.log(buf2.toString('ascii', 0, buf2.length));
// Prints: abc

buf1[0] = 33;

console.log(buf2.toString('ascii', 0, buf2.length));
// Prints: !bc
```

Указание отрицательных индексов приводит к тому, что срез создается относительно конца `buf` а не начало.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('buffer');

console.log(buf.subarray(-6, -1).toString());
// Prints: buffe
// (Equivalent to buf.subarray(0, 5).)

console.log(buf.subarray(-6, -2).toString());
// Prints: buff
// (Equivalent to buf.subarray(0, 4).)

console.log(buf.subarray(-5, -2).toString());
// Prints: uff
// (Equivalent to buf.subarray(1, 4).)
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('buffer');

console.log(buf.subarray(-6, -1).toString());
// Prints: buffe
// (Equivalent to buf.subarray(0, 5).)

console.log(buf.subarray(-6, -2).toString());
// Prints: buff
// (Equivalent to buf.subarray(0, 4).)

console.log(buf.subarray(-5, -2).toString());
// Prints: uff
// (Equivalent to buf.subarray(1, 4).)
```

### `buf.slice([start[, end]])`

<!-- YAML
added: v0.3.0
changes:
  - version:
    - v7.1.0
    - v6.9.2
    pr-url: https://github.com/nodejs/node/pull/9341
    description: Coercing the offsets to integers now handles values outside
                 the 32-bit integer range properly.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/9101
    description: All offsets are now coerced to integers before doing any
                 calculations with them.
-->

- `start` {integer} Где новое `Buffer` начнет. **Дефолт:** `0`.
- `end` {integer} Где новое `Buffer` закончится (не включительно). **Дефолт:** [`buf.length`](#buflength).
- Возвращает: {Buffer}

Возвращает новый `Buffer` который ссылается на ту же память, что и оригинал, но смещен и обрезан `start` а также `end` индексы.

Это то же поведение, что и `buf.subarray()`.

Этот метод несовместим с `Uint8Array.prototype.slice()`, который является суперклассом `Buffer`. Чтобы скопировать фрагмент, используйте `Uint8Array.prototype.slice()`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('buffer');

const copiedBuf = Uint8Array.prototype.slice.call(buf);
copiedBuf[0]++;
console.log(copiedBuf.toString());
// Prints: cuffer

console.log(buf.toString());
// Prints: buffer
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('buffer');

const copiedBuf = Uint8Array.prototype.slice.call(buf);
copiedBuf[0]++;
console.log(copiedBuf.toString());
// Prints: cuffer

console.log(buf.toString());
// Prints: buffer
```

### `buf.swap16()`

<!-- YAML
added: v5.10.0
-->

- Возвращает: {Buffer} Ссылка на `buf`.

Интерпретирует `buf` как массив беззнаковых 16-битных целых чисел и меняет порядок байтов _на месте_. Броски [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size) если [`buf.length`](#buflength) не делится на 2.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// Prints: <Buffer 02 01 04 03 06 05 08 07>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap16();
// Throws ERR_INVALID_BUFFER_SIZE.
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// Prints: <Buffer 02 01 04 03 06 05 08 07>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap16();
// Throws ERR_INVALID_BUFFER_SIZE.
```

Одно удобное использование `buf.swap16()` заключается в выполнении быстрого преобразования на месте между прямым порядком байтов UTF-16 и прямым порядком байтов UTF-16:

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from(
  'This is little-endian UTF-16',
  'utf16le'
);
buf.swap16(); // Convert to big-endian UTF-16 text.
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from(
  'This is little-endian UTF-16',
  'utf16le'
);
buf.swap16(); // Convert to big-endian UTF-16 text.
```

### `buf.swap32()`

<!-- YAML
added: v5.10.0
-->

- Возвращает: {Buffer} Ссылка на `buf`.

Интерпретирует `buf` как массив 32-битных целых чисел без знака и меняет порядок байтов _на месте_. Броски [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size) если [`buf.length`](#buflength) не делится на 4.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap32();

console.log(buf1);
// Prints: <Buffer 04 03 02 01 08 07 06 05>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap32();
// Throws ERR_INVALID_BUFFER_SIZE.
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap32();

console.log(buf1);
// Prints: <Buffer 04 03 02 01 08 07 06 05>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap32();
// Throws ERR_INVALID_BUFFER_SIZE.
```

### `buf.swap64()`

<!-- YAML
added: v6.3.0
-->

- Возвращает: {Buffer} Ссылка на `buf`.

Интерпретирует `buf` как массив 64-битных чисел и меняет порядок байтов _на месте_. Броски [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size) если [`buf.length`](#buflength) не делится на 8.

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap64();

console.log(buf1);
// Prints: <Buffer 08 07 06 05 04 03 02 01>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap64();
// Throws ERR_INVALID_BUFFER_SIZE.
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf1);
// Prints: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap64();

console.log(buf1);
// Prints: <Buffer 08 07 06 05 04 03 02 01>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap64();
// Throws ERR_INVALID_BUFFER_SIZE.
```

### `buf.toJSON()`

<!-- YAML
added: v0.9.2
-->

- Возвращает: {Object}

Возвращает JSON-представление `buf`. [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) неявно вызывает эту функцию при преобразовании `Buffer` пример.

`Buffer.from()` принимает объекты в формате, возвращенном этим методом. Особенно, `Buffer.from(buf.toJSON())` работает как `Buffer.from(buf)`.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
const json = JSON.stringify(buf);

console.log(json);
// Prints: {"type":"Buffer","data":[1,2,3,4,5]}

const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer'
    ? Buffer.from(value)
    : value;
});

console.log(copy);
// Prints: <Buffer 01 02 03 04 05>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
const json = JSON.stringify(buf);

console.log(json);
// Prints: {"type":"Buffer","data":[1,2,3,4,5]}

const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer'
    ? Buffer.from(value)
    : value;
});

console.log(copy);
// Prints: <Buffer 01 02 03 04 05>
```

### `buf.toString([encoding[, start[, end]]])`

<!-- YAML
added: v0.1.90
-->

- `encoding` {строка} Используемая кодировка символов. **Дефолт:** `'utf8'`.
- `start` {integer} Смещение в байтах, с которого начинается декодирование. **Дефолт:** `0`.
- `end` {integer} Смещение в байтах, при котором декодирование прекращается (не включительно). **Дефолт:** [`buf.length`](#buflength).
- Возвращает: {строка}

Декодирует `buf` в строку в соответствии с указанной кодировкой символов в `encoding`. `start` а также `end` может быть передан для декодирования только подмножества `buf`.

Если `encoding` является `'utf8'` и последовательность байтов во входных данных не является допустимой UTF-8, тогда каждый недопустимый байт заменяется символом замены `U+FFFD`.

Максимальная длина экземпляра строки (в единицах кода UTF-16) доступна как [`buffer.constants.MAX_STRING_LENGTH`](#bufferconstantsmax_string_length).

```mjs
import { Buffer } from 'buffer';

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

console.log(buf1.toString('utf8'));
// Prints: abcdefghijklmnopqrstuvwxyz
console.log(buf1.toString('utf8', 0, 5));
// Prints: abcde

const buf2 = Buffer.from('tést');

console.log(buf2.toString('hex'));
// Prints: 74c3a97374
console.log(buf2.toString('utf8', 0, 3));
// Prints: té
console.log(buf2.toString(undefined, 0, 3));
// Prints: té
```

```cjs
const { Buffer } = require('buffer');

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 is the decimal ASCII value for 'a'.
  buf1[i] = i + 97;
}

console.log(buf1.toString('utf8'));
// Prints: abcdefghijklmnopqrstuvwxyz
console.log(buf1.toString('utf8', 0, 5));
// Prints: abcde

const buf2 = Buffer.from('tést');

console.log(buf2.toString('hex'));
// Prints: 74c3a97374
console.log(buf2.toString('utf8', 0, 3));
// Prints: té
console.log(buf2.toString(undefined, 0, 3));
// Prints: té
```

### `buf.values()`

<!-- YAML
added: v1.1.0
-->

- Возвращает: {Iterator}

Создает и возвращает [итератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) для `buf` значения (байты). Эта функция вызывается автоматически, когда `Buffer` используется в `for..of` утверждение.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.from('buffer');

for (const value of buf.values()) {
  console.log(value);
}
// Prints:
//   98
//   117
//   102
//   102
//   101
//   114

for (const value of buf) {
  console.log(value);
}
// Prints:
//   98
//   117
//   102
//   102
//   101
//   114
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.from('buffer');

for (const value of buf.values()) {
  console.log(value);
}
// Prints:
//   98
//   117
//   102
//   102
//   101
//   114

for (const value of buf) {
  console.log(value);
}
// Prints:
//   98
//   117
//   102
//   102
//   101
//   114
```

### `buf.write(string[, offset[, length]][, encoding])`

<!-- YAML
added: v0.1.90
-->

- `string` {строка} Строка для записи `buf`.
- `offset` {integer} Количество байтов, которые нужно пропустить перед началом записи `string`. **Дефолт:** `0`.
- `length` {integer} Максимальное количество байтов для записи (записанные байты не превышают `buf.length - offset`). **Дефолт:** `buf.length - offset`.
- `encoding` {строка} Кодировка символов `string`. **Дефолт:** `'utf8'`.
- Возвращает: {integer} Количество записанных байтов.

Пишет `string` к `buf` в `offset` в соответствии с кодировкой символов в `encoding`. В `length` параметр - количество байтов для записи. Если `buf` не содержал достаточно места, чтобы вместить всю строку, только часть `string` будет написано. Однако частично закодированные символы записываться не будут.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.alloc(256);

const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(
  `${len} bytes: ${buf.toString('utf8', 0, len)}`
);
// Prints: 12 bytes: ½ + ¼ = ¾

const buffer = Buffer.alloc(10);

const length = buffer.write('abcd', 8);

console.log(
  `${length} bytes: ${buffer.toString('utf8', 8, 10)}`
);
// Prints: 2 bytes : ab
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.alloc(256);

const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(
  `${len} bytes: ${buf.toString('utf8', 0, len)}`
);
// Prints: 12 bytes: ½ + ¼ = ¾

const buffer = Buffer.alloc(10);

const length = buffer.write('abcd', 8);

console.log(
  `${length} bytes: ${buffer.toString('utf8', 8, 10)}`
);
// Prints: 2 bytes : ab
```

### `buf.writeBigInt64BE(value[, offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

- `value` {bigint} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов.

`value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64BE(0x0102030405060708n, 0);

console.log(buf);
// Prints: <Buffer 01 02 03 04 05 06 07 08>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64BE(0x0102030405060708n, 0);

console.log(buf);
// Prints: <Buffer 01 02 03 04 05 06 07 08>
```

### `buf.writeBigInt64LE(value[, offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

- `value` {bigint} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов.

`value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64LE(0x0102030405060708n, 0);

console.log(buf);
// Prints: <Buffer 08 07 06 05 04 03 02 01>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64LE(0x0102030405060708n, 0);

console.log(buf);
// Prints: <Buffer 08 07 06 05 04 03 02 01>
```

### `buf.writeBigUInt64BE(value[, offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
changes:
  - version:
    - v14.10.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34960
    description: This function is also available as `buf.writeBigUint64BE()`.
-->

- `value` {bigint} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов.

Эта функция также доступна в `writeBigUint64BE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64BE(0xdecafafecacefaden, 0);

console.log(buf);
// Prints: <Buffer de ca fa fe ca ce fa de>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64BE(0xdecafafecacefaden, 0);

console.log(buf);
// Prints: <Buffer de ca fa fe ca ce fa de>
```

### `buf.writeBigUInt64LE(value[, offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
changes:
  - version:
    - v14.10.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34960
    description: This function is also available as `buf.writeBigUint64LE()`.
-->

- `value` {bigint} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворять: `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` с прямым порядком байтов

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64LE(0xdecafafecacefaden, 0);

console.log(buf);
// Prints: <Buffer de fa ce ca fe fa ca de>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64LE(0xdecafafecacefaden, 0);

console.log(buf);
// Prints: <Buffer de fa ce ca fe fa ca de>
```

Эта функция также доступна в `writeBigUint64LE` псевдоним.

### `buf.writeDoubleBE(value[, offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {number} номер для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должен быть номером JavaScript. Поведение не определено, когда `value` - это что-нибудь, кроме числа JavaScript.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleBE(123.456, 0);

console.log(buf);
// Prints: <Buffer 40 5e dd 2f 1a 9f be 77>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleBE(123.456, 0);

console.log(buf);
// Prints: <Buffer 40 5e dd 2f 1a 9f be 77>
```

### `buf.writeDoubleLE(value[, offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {number} номер для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 8`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должен быть номером JavaScript. Поведение не определено, когда `value` - это что-нибудь, кроме числа JavaScript.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleLE(123.456, 0);

console.log(buf);
// Prints: <Buffer 77 be 9f 1a 2f dd 5e 40>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleLE(123.456, 0);

console.log(buf);
// Prints: <Buffer 77 be 9f 1a 2f dd 5e 40>
```

### `buf.writeFloatBE(value[, offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {number} номер для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. Поведение не определено, когда `value` - это что-нибудь, кроме числа JavaScript.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeFloatBE(0xcafebabe, 0);

console.log(buf);
// Prints: <Buffer 4f 4a fe bb>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeFloatBE(0xcafebabe, 0);

console.log(buf);
// Prints: <Buffer 4f 4a fe bb>
```

### `buf.writeFloatLE(value[, offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {number} номер для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. Поведение не определено, когда `value` - это что-нибудь, кроме числа JavaScript.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeFloatLE(0xcafebabe, 0);

console.log(buf);
// Prints: <Buffer bb fe 4a 4f>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeFloatLE(0xcafebabe, 0);

console.log(buf);
// Prints: <Buffer bb fe 4a 4f>
```

### `buf.writeInt8(value[, offset])`

<!-- YAML
added: v0.5.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 1`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset`. `value` должно быть действительным 8-битным целым числом со знаком. Поведение не определено, когда `value` представляет собой любое другое число, кроме 8-битного целого числа со знаком.

`value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(2);

buf.writeInt8(2, 0);
buf.writeInt8(-2, 1);

console.log(buf);
// Prints: <Buffer 02 fe>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(2);

buf.writeInt8(2, 0);
buf.writeInt8(-2, 1);

console.log(buf);
// Prints: <Buffer 02 fe>
```

### `buf.writeInt16BE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть действительным 16-разрядным целым числом со знаком. Поведение не определено, когда `value` представляет собой любое другое число, кроме 16-разрядного целого числа со знаком.

В `value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(2);

buf.writeInt16BE(0x0102, 0);

console.log(buf);
// Prints: <Buffer 01 02>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(2);

buf.writeInt16BE(0x0102, 0);

console.log(buf);
// Prints: <Buffer 01 02>
```

### `buf.writeInt16LE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть действительным 16-разрядным целым числом со знаком. Поведение не определено, когда `value` представляет собой любое другое число, кроме 16-разрядного целого числа со знаком.

В `value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(2);

buf.writeInt16LE(0x0304, 0);

console.log(buf);
// Prints: <Buffer 04 03>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(2);

buf.writeInt16LE(0x0304, 0);

console.log(buf);
// Prints: <Buffer 04 03>
```

### `buf.writeInt32BE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть действительным 32-битным целым числом со знаком. Поведение не определено, когда `value` - любое другое число, кроме 32-битного целого числа со знаком.

В `value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeInt32BE(0x01020304, 0);

console.log(buf);
// Prints: <Buffer 01 02 03 04>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeInt32BE(0x01020304, 0);

console.log(buf);
// Prints: <Buffer 01 02 03 04>
```

### `buf.writeInt32LE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть действительным 32-битным целым числом со знаком. Поведение не определено, когда `value` - любое другое число, кроме 32-битного целого числа со знаком.

В `value` интерпретируется и записывается как целое число со знаком с дополнением до двух.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeInt32LE(0x05060708, 0);

console.log(buf);
// Prints: <Buffer 08 07 06 05>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeInt32LE(0x05060708, 0);

console.log(buf);
// Prints: <Buffer 08 07 06 05>
```

### `buf.writeIntBE(value, offset, byteLength)`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `byteLength` байты `value` к `buf` в указанном `offset` как с прямым порядком байтов. Поддерживает точность до 48 бит. Поведение не определено, когда `value` - любое другое число, кроме целого числа со знаком.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer 12 34 56 78 90 ab>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer 12 34 56 78 90 ab>
```

### `buf.writeIntLE(value, offset, byteLength)`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `byteLength` байты `value` к `buf` в указанном `offset` как с прямым порядком байтов. Поддерживает точность до 48 бит. Поведение не определено, когда `value` - любое другое число, кроме целого числа со знаком.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer ab 90 78 56 34 12>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer ab 90 78 56 34 12>
```

### `buf.writeUInt8(value[, offset])`

<!-- YAML
added: v0.5.0
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUint8()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 1`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset`. `value` должно быть допустимым 8-разрядным целым числом без знака. Поведение не определено, когда `value` - любое другое, кроме беззнакового 8-битного целого числа.

Эта функция также доступна в `writeUint8` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt8(0x3, 0);
buf.writeUInt8(0x4, 1);
buf.writeUInt8(0x23, 2);
buf.writeUInt8(0x42, 3);

console.log(buf);
// Prints: <Buffer 03 04 23 42>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt8(0x3, 0);
buf.writeUInt8(0x4, 1);
buf.writeUInt8(0x23, 2);
buf.writeUInt8(0x42, 3);

console.log(buf);
// Prints: <Buffer 03 04 23 42>
```

### `buf.writeUInt16BE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUint16BE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть допустимым 16-разрядным целым числом без знака. Поведение не определено, когда `value` - любое другое, кроме беззнакового 16-разрядного целого числа.

Эта функция также доступна в `writeUint16BE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16BE(0xdead, 0);
buf.writeUInt16BE(0xbeef, 2);

console.log(buf);
// Prints: <Buffer de ad be ef>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16BE(0xdead, 0);
buf.writeUInt16BE(0xbeef, 2);

console.log(buf);
// Prints: <Buffer de ad be ef>
```

### `buf.writeUInt16LE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUint16LE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 2`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть допустимым 16-разрядным целым числом без знака. Поведение не определено, когда `value` - любое другое, кроме беззнакового 16-разрядного целого числа.

Эта функция также доступна в `writeUint16LE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16LE(0xdead, 0);
buf.writeUInt16LE(0xbeef, 2);

console.log(buf);
// Prints: <Buffer ad de ef be>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16LE(0xdead, 0);
buf.writeUInt16LE(0xbeef, 2);

console.log(buf);
// Prints: <Buffer ad de ef be>
```

### `buf.writeUInt32BE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUint32BE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть действительным 32-битным целым числом без знака. Поведение не определено, когда `value` - это что-либо, кроме 32-разрядного целого числа без знака.

Эта функция также доступна в `writeUint32BE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32BE(0xfeedface, 0);

console.log(buf);
// Prints: <Buffer fe ed fa ce>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32BE(0xfeedface, 0);

console.log(buf);
// Prints: <Buffer fe ed fa ce>
```

### `buf.writeUInt32LE(value[, offset])`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUint32LE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - 4`. **Дефолт:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `value` к `buf` в указанном `offset` как с прямым порядком байтов. В `value` должно быть действительным 32-битным целым числом без знака. Поведение не определено, когда `value` - это что-либо, кроме 32-разрядного целого числа без знака.

Эта функция также доступна в `writeUint32LE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32LE(0xfeedface, 0);

console.log(buf);
// Prints: <Buffer ce fa ed fe>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32LE(0xfeedface, 0);

console.log(buf);
// Prints: <Buffer ce fa ed fe>
```

### `buf.writeUIntBE(value, offset, byteLength)`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUintBE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `byteLength` байты `value` к `buf` в указанном `offset` как с прямым порядком байтов. Поддерживает точность до 48 бит. Поведение не определено, когда `value` - любое другое число, кроме беззнакового целого числа.

Эта функция также доступна в `writeUintBE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeUIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer 12 34 56 78 90 ab>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeUIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer 12 34 56 78 90 ab>
```

### `buf.writeUIntLE(value, offset, byteLength)`

<!-- YAML
added: v0.5.5
changes:
  - version:
    - v14.9.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34729
    description: This function is also available as `buf.writeUintLE()`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.
-->

- `value` {integer} Число для записи `buf`.
- `offset` {integer} Число байтов, которые нужно пропустить перед началом записи. Должен удовлетворить `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должен удовлетворить `0 < byteLength <= 6`.
- Возвращает: {целое число} `offset` плюс количество записанных байтов.

Пишет `byteLength` байты `value` к `buf` в указанном `offset` как с прямым порядком байтов. Поддерживает точность до 48 бит. Поведение не определено, когда `value` - любое другое число, кроме беззнакового целого числа.

Эта функция также доступна в `writeUintLE` псевдоним.

```mjs
import { Buffer } from 'buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeUIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer ab 90 78 56 34 12>
```

```cjs
const { Buffer } = require('buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeUIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Prints: <Buffer ab 90 78 56 34 12>
```

### `new Buffer(array)`

<!-- YAML
deprecated: v6.0.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19524
    description: Calling this constructor emits a deprecation warning when
                 run from code outside the `node_modules` directory.
  - version: v7.2.1
    pr-url: https://github.com/nodejs/node/pull/9529
    description: Calling this constructor no longer emits a deprecation warning.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8169
    description: Calling this constructor emits a deprecation warning now.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.from(array)`](#static-method-bufferfromarray) вместо.

- `array` {integer \[]} Массив байтов для копирования.

Видеть [`Buffer.from(array)`](#static-method-bufferfromarray).

### `new Buffer(arrayBuffer[, byteOffset[, length]])`

<!-- YAML
added: v3.0.0
deprecated: v6.0.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19524
    description: Calling this constructor emits a deprecation warning when
                 run from code outside the `node_modules` directory.
  - version: v7.2.1
    pr-url: https://github.com/nodejs/node/pull/9529
    description: Calling this constructor no longer emits a deprecation warning.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8169
    description: Calling this constructor emits a deprecation warning now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/4682
    description: The `byteOffset` and `length` parameters are supported now.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length) вместо.

- `arrayBuffer` {ArrayBuffer | SharedArrayBuffer} An [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) или `.buffer` собственность [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).
- `byteOffset` {integer} Индекс первого выставляемого байта. **Дефолт:** `0`.
- `length` {integer} Число байтов, которые нужно раскрыть. **Дефолт:** `arrayBuffer.byteLength - byteOffset`.

Видеть [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length).

### `new Buffer(buffer)`

<!-- YAML
deprecated: v6.0.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19524
    description: Calling this constructor emits a deprecation warning when
                 run from code outside the `node_modules` directory.
  - version: v7.2.1
    pr-url: https://github.com/nodejs/node/pull/9529
    description: Calling this constructor no longer emits a deprecation warning.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8169
    description: Calling this constructor emits a deprecation warning now.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.from(buffer)`](#static-method-bufferfrombuffer) вместо.

- `buffer` {Buffer | Uint8Array} Существующий `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) из которого копировать данные.

Видеть [`Buffer.from(buffer)`](#static-method-bufferfrombuffer).

### `new Buffer(size)`

<!-- YAML
deprecated: v6.0.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19524
    description: Calling this constructor emits a deprecation warning when
                 run from code outside the `node_modules` directory.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12141
    description: The `new Buffer(size)` will return zero-filled memory by
                 default.
  - version: v7.2.1
    pr-url: https://github.com/nodejs/node/pull/9529
    description: Calling this constructor no longer emits a deprecation warning.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8169
    description: Calling this constructor emits a deprecation warning now.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) вместо этого (см. также [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize)).

- `size` {integer} Желаемая длина нового `Buffer`.

Видеть [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) а также [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize). Этот вариант конструктора эквивалентен [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding).

### `new Buffer(string[, encoding])`

<!-- YAML
deprecated: v6.0.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19524
    description: Calling this constructor emits a deprecation warning when
                 run from code outside the `node_modules` directory.
  - version: v7.2.1
    pr-url: https://github.com/nodejs/node/pull/9529
    description: Calling this constructor no longer emits a deprecation warning.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8169
    description: Calling this constructor emits a deprecation warning now.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding) вместо.

- `string` {строка} Строка для кодирования.
- `encoding` {строка} Кодировка `string`. **Дефолт:** `'utf8'`.

Видеть [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding).

## `buffer` API модуля

В то время как `Buffer` объект доступен как глобальный, есть дополнительные `Buffer`-связанные API, которые доступны только через `buffer` доступ к модулю с помощью `require('buffer')`.

### `buffer.atob(data)`

<!-- YAML
added:
  - v15.13.0
  - v14.17.0
-->

> Стабильность: 3 - Наследие. Использовать `Buffer.from(data, 'base64')` вместо.

- `data` {any} Входная строка в кодировке Base64.

Декодирует строку данных в кодировке Base64 в байты и кодирует эти байты в строку с использованием Latin-1 (ISO-8859-1).

В `data` может быть любым значением JavaScript, которое может быть преобразовано в строку.

**Эта функция предоставляется только для совместимости с устаревшими API веб-платформ и никогда не должна использоваться в новом коде, поскольку они используют строки для представления двоичных данных и предшествуют введению типизированных массивов в JavaScript. Для кода, работающего с использованием API-интерфейсов Node.js, преобразование между строками в кодировке base64 и двоичными данными должно выполняться с использованием `Buffer.from(str, 'base64')` а также `buf.toString('base64')`.**

### `buffer.btoa(data)`

<!-- YAML
added:
  - v15.13.0
  - v14.17.0
-->

> Стабильность: 3 - Наследие. Использовать `buf.toString('base64')` вместо.

- `data` {any} Строка ASCII (Latin1).

Декодирует строку в байты с использованием Latin-1 (ISO-8859) и кодирует эти байты в строку с помощью Base64.

В `data` может быть любым значением JavaScript, которое может быть преобразовано в строку.

**Эта функция предоставляется только для совместимости с устаревшими API веб-платформ и никогда не должна использоваться в новом коде, поскольку они используют строки для представления двоичных данных и предшествуют введению типизированных массивов в JavaScript. Для кода, работающего с использованием API-интерфейсов Node.js, преобразование между строками в кодировке base64 и двоичными данными должно выполняться с использованием `Buffer.from(str, 'base64')` а также `buf.toString('base64')`.**

### `buffer.INSPECT_MAX_BYTES`

<!-- YAML
added: v0.5.4
-->

- {целое число} **Дефолт:** `50`

Возвращает максимальное количество байтов, которое будет возвращено, когда `buf.inspect()` называется. Это может быть отменено пользовательскими модулями. Видеть [`util.inspect()`](util.md#utilinspectobject-options) для более подробной информации о `buf.inspect()` поведение.

### `buffer.kMaxLength`

<!-- YAML
added: v3.0.0
-->

- {integer} Максимальный размер, разрешенный для одного `Buffer` пример.

Псевдоним для [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length).

### `buffer.kStringMaxLength`

<!-- YAML
added: v3.0.0
-->

- {integer} Наибольшая длина, разрешенная для одного `string` пример.

Псевдоним для [`buffer.constants.MAX_STRING_LENGTH`](#bufferconstantsmax_string_length).

### `buffer.resolveObjectURL(id)`

<!-- YAML
added: v16.7.0
-->

> Стабильность: 1 - экспериментальная

- `id` {строка} A `'blob:nodedata:...` Строка URL, возвращенная предыдущим вызовом `URL.createObjectURL()`.
- Возвращает: {Blob}

Постановляет `'blob:nodedata:...'` связанный объект {Blob}, зарегистрированный с использованием предыдущего вызова `URL.createObjectURL()`.

### `buffer.transcode(source, fromEnc, toEnc)`

<!-- YAML
added: v7.1.0
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The `source` parameter can now be a `Uint8Array`.
-->

- `source` {Buffer | Uint8Array} A `Buffer` или `Uint8Array` пример.
- `fromEnc` {строка} Текущая кодировка.
- `toEnc` {строка} Для целевой кодировки.
- Возвращает: {Buffer}

Перекодирует данный `Buffer` или `Uint8Array` экземпляр из одной кодировки символов в другую. Возвращает новый `Buffer` пример.

Выбрасывает, если `fromEnc` или `toEnc` указать недопустимые кодировки символов или если преобразование из `fromEnc` к `toEnc` не допускается.

Кодировки, поддерживаемые `buffer.transcode()` находятся: `'ascii'`, `'utf8'`, `'utf16le'`, `'ucs2'`, `'latin1'`, а также `'binary'`.

В процессе транскодирования будут использоваться символы подстановки, если данная последовательность байтов не может быть адекватно представлена в целевой кодировке. Например:

```mjs
import { Buffer, transcode } from 'buffer';

const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
console.log(newBuf.toString('ascii'));
// Prints: '?'
```

```cjs
const { Buffer, transcode } = require('buffer');

const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
console.log(newBuf.toString('ascii'));
// Prints: '?'
```

Потому что евро (`€`) знак не может быть представлен в US-ASCII, он заменяется на `?` в перекодированном `Buffer`.

### Класс: `SlowBuffer`

<!-- YAML
deprecated: v6.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) вместо.

Видеть [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize). Это никогда не был класс в том смысле, что конструктор всегда возвращал `Buffer` экземпляр, а не `SlowBuffer` пример.

#### `new SlowBuffer(size)`

<!-- YAML
deprecated: v6.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) вместо.

- `size` {integer} Желаемая длина нового `SlowBuffer`.

Видеть [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize).

### Константы буфера

<!-- YAML
added: v8.2.0
-->

#### `buffer.constants.MAX_LENGTH`

<!-- YAML
added: v8.2.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35415
    description: Value is changed to 2<sup>32</sup> on 64-bit
      architectures.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/32116
    description: Value is changed from 2<sup>31</sup> - 1 to
      2<sup>32</sup> - 1 on 64-bit architectures.
-->

- {integer} Максимальный размер, разрешенный для одного `Buffer` пример.

На 32-битных архитектурах это значение в настоящее время равно 2.<sup>30</sup> - 1 (около 1 ГБ).

На 64-битных архитектурах это значение в настоящее время равно 2.<sup>32</sup> (около 4 ГБ).

Это отражает [`v8::TypedArray::kMaxLength`](https://v8.github.io/api/head/classv8_1_1TypedArray.html#a54a48f4373da0850663c4393d843b9b0) под капотом.

Это значение также доступно как [`buffer.kMaxLength`](#bufferkmaxlength).

#### `buffer.constants.MAX_STRING_LENGTH`

<!-- YAML
added: v8.2.0
-->

- {integer} Наибольшая длина, разрешенная для одного `string` пример.

Представляет собой самый крупный `length` который `string` примитив может иметь, считая в единицах кода UTF-16.

Это значение может зависеть от используемого движка JS.

## `Buffer.from()`, `Buffer.alloc()`, а также `Buffer.allocUnsafe()`

В версиях Node.js до 6.0.0 `Buffer` экземпляры были созданы с использованием `Buffer` функция-конструктор, которая выделяет возвращаемый `Buffer` по-разному в зависимости от того, какие аргументы приводятся:

- Передача числа в качестве первого аргумента в `Buffer()` (например. `new Buffer(10)`) выделяет новый `Buffer` объект указанного размера. До Node.js 8.0.0 память, выделяемая для таких `Buffer` экземпляры _нет_ инициализирован и _может содержать конфиденциальные данные_. Такой `Buffer` экземпляры _должен_ впоследствии инициализироваться с помощью [`buf.fill(0)`](#buffillvalue-offset-end-encoding) или написав всему `Buffer` перед чтением данных из `Buffer`. Хотя это поведение _преднамеренный_ опыт разработки показал, что для повышения производительности требуется более четкое различие между созданием быстрого, но неинициализированного `Buffer` по сравнению с созданием более медленного, но безопасного `Buffer`. Начиная с Node.js 8.0.0, `Buffer(num)` а также `new Buffer(num)` вернуть `Buffer` с инициализированной памятью.
- Передача строки, массива или `Buffer` поскольку первый аргумент копирует данные переданного объекта в `Buffer`.
- Прохождение [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) возвращает `Buffer` который разделяет выделенную память с заданным буфером массива.

Потому что поведение `new Buffer()` отличается в зависимости от типа первого аргумента, проблемы безопасности и надежности могут быть непреднамеренно внесены в приложения при проверке аргумента или `Buffer` инициализация не выполняется.

Например, если злоумышленник может заставить приложение получить номер, в котором ожидается строка, приложение может вызвать `new Buffer(100)` вместо того `new Buffer("100")`, что приводит к выделению 100-байтового буфера вместо выделения 3-байтового буфера с содержимым `"100"`. Обычно это возможно с помощью вызовов API JSON. Поскольку JSON различает числовые и строковые типы, он позволяет вводить числа, когда наивно написанное приложение, которое недостаточно проверяет свой ввод, может ожидать, что всегда получит строку. До версии Node.js 8.0.0 100-байтовый буфер мог содержать произвольные ранее существовавшие данные в памяти, поэтому его можно было использовать для раскрытия секретов в памяти удаленному злоумышленнику. Начиная с Node.js 8.0.0, раскрытие памяти не может произойти, потому что данные заполнены нулями. Однако другие атаки по-прежнему возможны, например, когда сервером выделяются очень большие буферы, что приводит к снижению производительности или сбою при исчерпании памяти.

Сделать создание `Buffer` более надежными и менее подверженными ошибкам, различные формы `new Buffer()` конструктор был **устарел** и заменен отдельным `Buffer.from()`, [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding), а также [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) методы.

_Разработчикам следует перенести все существующие варианты использования `new Buffer()` конструкторы к одному из этих новых API._

- [`Buffer.from(array)`](#static-method-bufferfromarray) возвращает новый `Buffer` что _содержит копию_ предоставленных октетов.
- [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length) возвращает новый `Buffer` что _использует одну и ту же выделенную память_ как дано [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).
- [`Buffer.from(buffer)`](#static-method-bufferfrombuffer) возвращает новый `Buffer` что _содержит копию_ содержания данного `Buffer`.
- [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding) возвращает новый `Buffer` что _содержит копию_ предоставленной строки.
- [`Buffer.alloc(size[, fill[, encoding]])`](#static-method-bufferallocsize-fill-encoding) возвращает новый инициализированный `Buffer` указанного размера. Этот метод медленнее, чем [`Buffer.allocUnsafe(size)`](#static-method-bufferallocunsafesize) но гарантирует, что вновь созданный `Buffer` экземпляры никогда не содержат старые данные, которые могут быть конфиденциальными. А `TypeError` будет брошен, если `size` это не число.
- [`Buffer.allocUnsafe(size)`](#static-method-bufferallocunsafesize) а также [`Buffer.allocUnsafeSlow(size)`](#static-method-bufferallocunsafeslowsize) каждый возвращает новый неинициализированный `Buffer` указанных `size`. Поскольку `Buffer` неинициализирован, выделенный сегмент памяти может содержать старые данные, которые потенциально уязвимы.

`Buffer` экземпляры, возвращенные [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) а также [`Buffer.from(array)`](#static-method-bufferfromarray) _мая_ быть выделенным из общего пула внутренней памяти, если `size` меньше или равно половине [`Buffer.poolSize`](#class-property-bufferpoolsize). Экземпляры, возвращенные [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) _никогда_ использовать общий пул внутренней памяти.

### В `--zero-fill-buffers` параметр командной строки

<!-- YAML
added: v5.10.0
-->

Node.js можно запустить с помощью `--zero-fill-buffers` параметр командной строки, чтобы вызвать все вновь выделенные `Buffer` по умолчанию экземпляры должны быть обнулены при создании. Без этой опции буферы, созданные с помощью [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize), [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize), а также `new SlowBuffer(size)` не заполнены нулями. Использование этого флага может иметь ощутимое негативное влияние на производительность. Использовать `--zero-fill-buffers` вариант только тогда, когда это необходимо для обеспечения соблюдения этого вновь выделенного `Buffer` экземпляры не могут содержать старые потенциально конфиденциальные данные.

```console
$ node --zero-fill-buffers
> Buffer.allocUnsafe(5);
<Buffer 00 00 00 00 00>
```

### Что делает `Buffer.allocUnsafe()` а также `Buffer.allocUnsafeSlow()` «небезопасно»?

При звонке [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) а также [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize), сегмент выделенной памяти _неинициализированный_ (не обнуляется). Хотя такая конструкция делает выделение памяти довольно быстрым, выделенный сегмент памяти может содержать старые данные, которые потенциально уязвимы. Используя `Buffer` создан [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) без _полностью_ перезапись памяти может привести к утечке этих старых данных, когда `Buffer` память читается.

Хотя есть явные преимущества в производительности при использовании [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize), Дополнительная забота _должен_ быть приняты во избежание внесения уязвимостей безопасности в приложение.
