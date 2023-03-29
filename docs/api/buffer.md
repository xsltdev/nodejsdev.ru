---
description: Buffer объекты используются для представления последовательности байтов фиксированной длины
---

# Буфер

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/buffer.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Объекты **`Buffer`** используются для представления последовательности байтов фиксированной длины. Многие API Node.js поддерживают `Buffer`.

Класс `Buffer` является подклассом класса JavaScript [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) и расширяет его методами, которые охватывают дополнительные случаи использования. API Node.js принимают обычные [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), где также поддерживаются `Buffer`.

Хотя класс `Buffer` доступен в глобальной области видимости, все же рекомендуется явно ссылаться на него с помощью оператора import или require.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

При преобразовании между `Buffer` и строками может быть указана кодировка символов. Если кодировка не указана, по умолчанию будет использоваться UTF-8.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Буферы Node.js принимают все варианты кодировки строк, которые они получают. Например, UTF-8 может быть указана как `utf8`, `UTF8`, или `uTf8`.

В настоящее время Node.js поддерживает следующие кодировки символов:

- `utf8` (псевдоним: `utf-8`): Многобайтовая кодировка символов Unicode. Многие веб-страницы и другие форматы документов используют [UTF-8](https://en.wikipedia.org/wiki/UTF-8). Это кодировка символов по умолчанию. При декодировании `Buffer` в строку, которая содержит не только допустимые данные UTF-8, для представления ошибок будет использоваться символ замены Unicode `U+FFFD` `�`.

- `utf16le` (псевдоним: `utf-16le`): Многобайтовые кодированные символы Юникода. В отличие от `utf8`, каждый символ в строке будет закодирован с помощью 2 или 4 байт. Node.js поддерживает только [little-endian](https://en.wikipedia.org/wiki/Endianness) вариант [UTF-16](https://en.wikipedia.org/wiki/UTF-16).

- `latin1`: Latin-1 обозначает [ISO-8859-1](https://en.wikipedia.org/wiki/ISO-8859-1). Эта кодировка поддерживает только символы Unicode от `U+0000` до `U+00FF`. Каждый символ кодируется с помощью одного байта. Символы, которые не вписываются в этот диапазон, усекаются и отображаются на символы этого диапазона.

Преобразование `Buffer` в строку с помощью одного из вышеперечисленных способов называется декодированием, а преобразование строки в `Buffer` - кодированием.

Node.js также поддерживает следующие двоично-текстовые кодировки. Для двоично-текстовых кодировок соглашение об именовании является обратным: Преобразование `Buffer` в строку обычно называется кодированием, а преобразование строки в `Buffer` - декодированием.

- `base64`: [Base64](https://en.wikipedia.org/wiki/Base64) кодирование. При создании `Buffer` из строки эта кодировка также корректно принимает "Безопасный алфавит URL и имен файлов", как указано в [RFC 4648, раздел 5](https://tools.ietf.org/html/rfc4648#section-5). Символы пробелов, такие как пробелы, табуляции и новые строки, содержащиеся в строке в base64-кодировке, игнорируются.

- `base64url`: [base64url](https://tools.ietf.org/html/rfc4648#section-5) кодировка, как указано в [RFC 4648, Section 5](https://tools.ietf.org/html/rfc4648#section-5). При создании `Buffer` из строки эта кодировка также будет правильно воспринимать обычные строки в base64-кодировке. При кодировании `Buffer` в строку, эта кодировка будет опускать вставку.

- `hex`: Кодировать каждый байт как два шестнадцатеричных символа. При декодировании строк, состоящих не только из четного числа шестнадцатеричных символов, может произойти усечение данных. Пример см. ниже.

Также поддерживаются следующие устаревшие кодировки символов:

- `ascii`: Только для 7-битных данных [ASCII](https://en.wikipedia.org/wiki/ASCII). При кодировании строки в `Buffer` это эквивалентно использованию `latin1`. При декодировании `Buffer` в строку использование этой кодировки дополнительно снимет старший бит каждого байта перед декодированием как `latin1`. Как правило, нет причин использовать эту кодировку, поскольку `utf8` (или, если известно, что данные всегда будут только ASCII, `latin1`) будет лучшим выбором при кодировании или декодировании только ASCII текста. Он предоставляется только для совместимости с предыдущими версиями.

- `binary`: Псевдоним для `latin1`. Дополнительную информацию по этому вопросу см. в [binary strings](https://developer.mozilla.org/en-US/docs/Web/API/DOMString/Binary). Название этой кодировки может ввести в заблуждение, поскольку все перечисленные здесь кодировки конвертируют между строками и двоичными данными. Для преобразования между строками и `Buffer`, как правило, подходит `utf8`.

- `ucs2`, `ucs-2`: Псевдонимы `utf16le`. UCS-2 - это вариант UTF-16, который не поддерживал символы с кодовыми точками больше, чем `U+FFFF`. В Node.js эти кодовые точки поддерживаются всегда.

<!-- end list -->

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    Buffer.from('1ag123', 'hex');
    // Prints <Buffer 1a>, data truncated when first non-hexadecimal value
    // ('g') encountered.

    Buffer.from('1a7', 'hex');
    // Prints <Buffer 1a>, data truncated when data ends in single digit ('7').

    Buffer.from('1634', 'hex');
    // Prints <Buffer 16 34>, all data represented.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    Buffer.from('1ag123', 'hex');
    // Prints <Buffer 1a>, data truncated when first non-hexadecimal value
    // ('g') encountered.

    Buffer.from('1a7', 'hex');
    // Prints <Buffer 1a>, data truncated when data ends in single digit ('7').

    Buffer.from('1634', 'hex');
    // Prints <Buffer 16 34>, all data represented.
    ```

Современные веб-браузеры следуют [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/), который псевдонимы `latin1` и `ISO-8859-1` на `win-1252`. Это означает, что при выполнении чего-то вроде `http.get()`, если возвращаемая кодовая система является одной из тех, что перечислены в спецификации WHATWG, возможно, что сервер действительно вернул данные в кодировке `win-1252`, а использование кодировки `latin1` может неправильно декодировать символы.

## Буферы и TypedArrays

Экземпляры `Buffer` также являются экземплярами JavaScript [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) и [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray). Все методы [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) доступны для `Buffer`. Однако между API `Buffer` и API [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) существуют тонкие несовместимости.

В частности:

- В то время как [`TypedArray.prototype.slice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice) создает копию части `TypedArray`, `Buffer.prototype.slice()` создает представление над существующим `Buffer` без копирования. Такое поведение может удивить, и существует только для совместимости с наследием. [`TypedArray.prototype.subarray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray) может быть использован для достижения поведения `Buffer.prototype.slice()` как на `Buffer`, так и на других `TypedArray` и должен быть предпочтительным.
- `buf.toString()` несовместим со своим эквивалентом `TypedArray`.
- Ряд методов, например, `buf.indexOf()`, поддерживают дополнительные аргументы.

Существует два способа создания новых экземпляров [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) из `Buffer`:

- Передача `Buffer` конструктору [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) скопирует содержимое `Buffer`, интерпретируемое как массив целых чисел, а не как последовательность байтов целевого типа.

<!-- end list -->

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, 2, 3, 4]);
    const uint32array = new Uint32Array(buf);

    console.log(uint32array);

    // Prints: Uint32Array(4) [ 1, 2, 3, 4 ]
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([1, 2, 3, 4]);
    const uint32array = new Uint32Array(buf);

    console.log(uint32array);

    // Prints: Uint32Array(4) [ 1, 2, 3, 4 ]
    ```

- Передача `Buffer`, лежащего в основе [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), создаст [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), который разделит свою память с `Buffer`.

<!-- end list -->

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from('hello', 'utf16le');
    const uint16array = new Uint16Array(
    	buf.buffer,
    	buf.byteOffset,
    	buf.length / Uint16Array.BYTES_PER_ELEMENT
    );

    console.log(uint16array);

    // Prints: Uint16Array(5) [ 104, 101, 108, 108, 111 ]
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from('hello', 'utf16le');
    const uint16array = new Uint16Array(
    	buf.buffer,
    	buf.byteOffset,
    	buf.length / Uint16Array.BYTES_PER_ELEMENT
    );

    console.log(uint16array);

    // Prints: Uint16Array(5) [ 104, 101, 108, 108, 111 ]
    ```

Можно создать новый `Buffer`, который разделяет ту же выделенную память, что и экземпляр [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), используя свойство `.buffer` объекта `TypedArray` таким же образом. `Buffer.from()` в этом контексте ведет себя как `new Uint8Array()`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

При создании `Buffer` с помощью `.buffer` [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) можно использовать только часть базового [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), передавая параметры `byteOffset` и `length`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const arr = new Uint16Array(20);
    const buf = Buffer.from(arr.buffer, 0, 16);

    console.log(buf.length);
    // Prints: 16
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const arr = new Uint16Array(20);
    const buf = Buffer.from(arr.buffer, 0, 16);

    console.log(buf.length);
    // Prints: 16
    ```

Варианты `Buffer.from()` и [`TypedArray.from()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from) имеют разные сигнатуры и реализации. В частности, варианты [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) принимают второй аргумент, который является функцией отображения, вызываемой для каждого элемента типизированного массива:

- `TypedArray.from(source[, mapFn[, thisArg]])`.

Метод `Buffer.from()`, однако, не поддерживает использование функции отображения:

- `Buffer.from(array)`
- `Buffer.from(buffer)`
- `Buffer.from(arrayBuffer[, byteOffset[, length]])`
- `Buffer.from(string[, encoding])`

## Буферы и итерация

Экземпляры `Buffer` можно итерировать, используя синтаксис `for..of`:

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([1, 2, 3]);

for (const b of buf) {
  console.log(b);
}
// Печатает:
// 1
// 2
// 3
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([1, 2, 3]);

for (const b of buf) {
  console.log(b);
}
// Печатает:
// 1
// 2
// 3
```

Кроме того, для создания итераторов можно использовать методы [`buf.values()`](#bufvalues), [`buf.keys()`](#bufkeys) и [`buf.entries()`](#bufentries).

## Класс: `Blob`

В [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) заключены неизменяемые, необработанные данные, которые могут безопасно использоваться несколькими рабочими потоками.

### `new Buffer.Blob([sources[, options]])`

- `sources` {string\[\]|ArrayBuffer\[\]|TypedArray\[\]|DataView\[\]|Blob\[\]} Массив строк, {ArrayBuffer}, {TypedArray}, {DataView} или {Blob} объектов, или любая смесь таких объектов, которые будут храниться в `Blob`.
- `options` {Object}
  - `endings` {string} Одно из значений `transparent` или `native`. Если установлено значение `'native'`, окончания строк в строковых исходных частях будут преобразованы к родному для платформы окончанию строк, как указано в `require('node:os').EOL`.
  - `type` {string} Тип содержимого блоба. Цель `type` - передать тип MIME-медиа данных, однако проверка формата типа не выполняется.

Создает новый объект `Blob`, содержащий конкатенацию заданных источников.

Источники {ArrayBuffer}, {TypedArray}, {DataView} и {Buffer} копируются в 'Blob' и поэтому могут быть безопасно изменены после создания 'Blob'.

Источники строк кодируются как последовательности байтов UTF-8 и копируются в блоб. Несовпадающие суррогатные пары в каждой части строки будут заменены символами замены Unicode U+FFFD.

### `blob.arrayBuffer()`

- Возвращает: {Promise}

Возвращает обещание, которое выполняется с {ArrayBuffer}, содержащим копию данных `Blob`.

### `blob.size`

Общий размер `блоба` в байтах.

### `blob.slice([start[, end[, type]]])`

- `start` {number} Начальный индекс.
- `end` {number} Конечный индекс.
- `type` {string} Тип содержимого для нового `Blob`.

Создает и возвращает новый `Blob`, содержащий подмножество данных объектов этого `Blob`. Исходный `Blob` не изменяется.

### `blob.stream()`

- Возвращает: {ReadableStream}

Возвращает новый `ReadableStream`, который позволяет читать содержимое `Blob`.

### `blob.text()`

- Возвращает: {Promise}

Возвращает обещание, которое выполняется с содержимым `Blob`, декодированным как строка UTF-8.

### `blob.type`

- Тип: {строка}

Тип содержимого `blob`.

### `Blob` объекты и `MessageChannel`

После создания объекта {Blob} он может быть отправлен через `MessagePort` в несколько пунктов назначения без передачи или немедленного копирования данных. Данные, содержащиеся в `Blob`, копируются только при вызове методов `arrayBuffer()` или `text()`.

```mjs
import { Blob, Buffer } from 'node:buffer';
import { setTimeout as delay } from 'node:timers/promises';

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

// Blob все еще можно использовать после отправки сообщения.
blob.text().then(console.log);
```

```cjs
const { Blob, Buffer } = require('node:buffer');
const {
  setTimeout: delay,
} = require('node:timers/promises');

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

// Blob все еще можно использовать после отправки сообщения.
blob.text().then(console.log);
```

## Класс: `Buffer`

Класс `Buffer` - это глобальный тип для работы с двоичными данными напрямую. Он может быть построен различными способами.

### Статический метод: `Buffer.alloc(size[, fill[, encoding]])`

- `size` {целое число} Желаемая длина нового `Buffer`.
- `fill` {string|Buffer|Uint8Array|integer} Значение для предварительного заполнения нового `Buffer`. **По умолчанию:** `0`.
- `encoding` {string} Если `fill` является строкой, то это ее кодировка. **По умолчанию:** `'utf8'`.

Выделяет новый `Buffer` размером `size` байт. Если `fill` - `undefined`, `Buffer` будет заполнен нулями.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.alloc(5);

console.log(buf);
// Печатает: <Буфер 00 00 00 00 00 00 00>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.alloc(5);

console.log(buf);
// Печатает: <Буфер 00 00 00 00 00 00 00>
```

Если `size` больше чем [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length) или меньше `0`, то будет выброшено [`ERR_INVALID_ARG_VALUE`](errors.md#err_invalid_arg_value).

Если указано `fill`, выделенный `Buffer` будет инициализирован вызовом [`buf.fill(fill)`](#buffillvalue-offset-end-encoding).

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.alloc(5, 'a');

console.log(buf);
// Печатает: <Буфер 61 61 61 61 61 61 61 61>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.alloc(5, 'a');

console.log(buf);
// Печатает: <Буфер 61 61 61 61 61 61 61 61>
```

Если указаны и `fill`, и `encoding`, выделенный `Buffer` будет инициализирован вызовом [`buf.fill(fill, encoding)`](#buffillvalue-offset-end-encoding).

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

console.log(buf);
// Печатает: <Буфер 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

console.log(buf);
// Печатает: <Буфер 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

Вызов `Buffer.alloc()` может быть ощутимо медленнее альтернативы `Buffer.allocUnsafe()`, но гарантирует, что содержимое вновь созданного экземпляра `Buffer` никогда не будет содержать конфиденциальных данных из предыдущих распределений, включая данные, которые могли быть выделены не для `Buffer`.

Если `size` не является числом, будет выдана ошибка `TypeError`.

### Статический метод: `Buffer.allocUnsafe(size)`

- `size` {целое число} Желаемая длина нового `Buffer`.

Выделяет новый `Buffer` размером `size` байт. Если `size` больше чем [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length) или меньше чем `0`, то происходит выброс [`ERR_INVALID_ARG_VALUE`](errors.md#err_invalid_arg_value).

Базовая память для экземпляров `Buffer`, созданных таким образом, _не инициализируется_. Содержимое вновь созданного `Buffer` неизвестно и _может содержать конфиденциальные данные_. Вместо этого используйте `Buffer.alloc()` для инициализации экземпляров `Buffer` нулями.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(10);

console.log(buf);
// Печатает (содержимое может отличаться): <Буфер a0 8b 28 3f 01 00 00 00 00 50 32>

buf.fill(0);

console.log(buf);
// Печатает: <Буфер 00 00 00 00 00 00 00 00 00 00 00 00 00 00>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(10);

console.log(buf);
// Печатает (содержимое может отличаться): <Буфер a0 8b 28 3f 01 00 00 00 00 50 32>

buf.fill(0);

console.log(buf);
// Печатает: <Буфер 00 00 00 00 00 00 00 00 00 00 00 00 00 00>
```

Если `size` не является числом, будет выдана ошибка `TypeError`.

Модуль `Buffer` предварительно выделяет внутренний экземпляр `Buffer` размером `Buffer.poolSize`, который используется как пул для быстрого выделения новых экземпляров `Buffer`, созданных с помощью `Buffer.allocUnsafe()`, `Buffer. from(array)`, `Buffer.concat()`, и устаревшего конструктора `new Buffer(size)`, только если `size` меньше или равен `Buffer.poolSize >> 1` (пол `Buffer.poolSize` деленное на два).

Использование этого предварительно распределенного внутреннего пула памяти является ключевым отличием между вызовом `Buffer.alloc(size, fill)` и `Buffer.allocUnsafe(size).fill(fill)`. В частности, `Buffer.alloc(size, fill)` _никогда_ не будет использовать внутренний пул `Buffer`, в то время как `Buffer.allocUnsafe(size).fill(fill)` \*будет использовать внутренний пул `Buffer`, если `size` меньше или равен половине `Buffer.poolSize`. Разница едва заметна, но может быть важна, когда приложению требуется дополнительная производительность, которую обеспечивает `Buffer.allocUnsafe()`.

### Статический метод: `Buffer.allocUnsafeSlow(size)`

- `size` {целое число} Желаемая длина нового `Buffer`.

Выделяет новый `Буфер` размером `size` байт. Если `size` больше чем [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length) или меньше 0, то будет выброшен [`ERR_INVALID_ARG_VALUE`](errors.md#err_invalid_arg_value). Буфер нулевой длины `Buffer` создается, если `size` равен 0.

Базовая память для экземпляров `Buffer`, созданных таким образом, _не инициализируется_. Содержимое вновь созданного `Buffer` неизвестно и _может содержать конфиденциальные данные_. Используйте [`buf.fill(0)`](#buffillvalue-offset-end-encoding) для инициализации таких экземпляров `Buffer` нулями.

При использовании `Buffer.allocUnsafe()` для выделения новых экземпляров `Buffer`, выделения размером менее 4 КиБ вырезаются из одного предварительно выделенного `Buffer`. Это позволяет приложениям избежать накладных расходов на сборку мусора при создании множества отдельно выделенных экземпляров `Buffer`. Такой подход улучшает производительность и использование памяти за счет отсутствия необходимости отслеживать и очищать множество отдельных объектов `ArrayBuffer`.

Однако в случае, когда разработчику может понадобиться сохранить небольшой участок памяти из пула на неопределенное время, может быть целесообразно создать экземпляр `Buffer` без пула, используя `Buffer.allocUnsafeSlow()` и затем скопировать соответствующие биты.

```mjs
import { Buffer } from 'node:buffer';

// Нужно сохранить несколько небольших кусков памяти.
const store = [];

socket.on('readable', () => {
  let data;
  while (null !== (data = readable.read())) {
    // Выделяем место для сохраняемых данных.
    const sb = Buffer.allocUnsafeSlow(10);

    // Копируем данные в новое выделение.
    data.copy(sb, 0, 0, 10);

    store.push(sb);
  }
});
```

```cjs
const { Buffer } = require('node:buffer');

// Нужно хранить несколько небольших кусков памяти.
const store = [];

socket.on('readable', () => {
  let data;
  while (null !== (data = readable.read())) {
    // Выделяем место для сохраняемых данных.
    const sb = Buffer.allocUnsafeSlow(10);

    // Копируем данные в новое выделение.
    data.copy(sb, 0, 0, 10);

    store.push(sb);
  }
});
```

Если `size` не является числом, будет выдана ошибка `TypeError`.

### Статический метод: `Buffer.byteLength(string[, encoding])`

- `string` {string|Buffer|TypedArray|DataView|ArrayBuffer|SharedArrayBuffer} Значение для вычисления длины.
- `encoding` {string} Если `string` является строкой, то это ее кодировка. **По умолчанию:** `'utf8'`.
- Возвращает: {целое число} Количество байтов, содержащихся в `string`.

Возвращает длину байта строки при кодировании с помощью `encoding`. Это не то же самое, что [`String.prototype.length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length), который не учитывает кодировку, используемую для преобразования строки в байты.

Для `'base64'`, `'base64url'` и `'hex'` эта функция предполагает корректный ввод. Для строк, которые содержат данные не base64/hex-кодировки (например, пробелы), возвращаемое значение может быть больше, чем длина `буфера`, созданного из строки.

```mjs
import { Buffer } from 'node:buffer';

const str = '\u00bd + \u00bc = \u00be';

console.log(
  `${str}: ${str.length} символов, ` +
    `${Buffer.byteLength(str, 'utf8')} bytes`
);
// Печатает: ½ + ¼ = ¾: 9 символов, 12 байт
```

```cjs
const { Buffer } = require('node:buffer');

const str = '\u00bd + \u00bc = \u00be';

console.log(
  `${str}: ${str.length} символов, ` +
    `${Buffer.byteLength(str, 'utf8')} bytes`
);
// Печатает: ½ + ¼ = ¾: 9 символов, 12 байт
```

Если `string` является `Buffer`/[`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)/[`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)/[`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)/ [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), возвращается длина байта, сообщенная `.byteLength`.

### Статический метод: `Buffer.compare(buf1, buf2)`

- `buf1` {Buffer|Uint8Array}
- `buf2` {Buffer|Uint8Array}
- Возвращает: {целое число} Либо `-1`, `0`, либо `1`, в зависимости от результата сравнения. Подробности смотрите в [`buf.compare()`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

Сравнивает `buf1` с `buf2`, обычно для сортировки массивов экземпляров `Buffer`. Это эквивалентно вызову [`buf1.compare(buf2)`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

console.log(arr.sort(Buffer.compare));
// Печатает: [ <Буфер 30 31 32 33>, <Буфер 31 32 33 34> ]
// (Этот результат равен: [buf2, buf1]).
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

console.log(arr.sort(Buffer.compare));
// Печатает: [ <Буфер 30 31 32 33>, <Буфер 31 32 33 34> ]
// (Этот результат равен: [buf2, buf1]).
```

### Статический метод: `Buffer.concat(list[, totalLength])`.

- `list` {Buffer\[\] | Uint8Array\[\]} Список экземпляров `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) для конкатенации.
- `totalLength` {целое число} Общая длина экземпляров `Buffer` в `списке` при конкатенации.
- Возвращает: {Buffer}

Возвращает новый `Буфер`, который является результатом объединения всех экземпляров `Буфера` в `списке`.

Если в списке нет элементов или если `totalLength` равна 0, то возвращается новый `Buffer` нулевой длины.

Если `totalLength` не указана, то она вычисляется из экземпляров `Buffer` в `list` путем сложения их длин.

Если `totalLength` указана, она приводится к целому числу без знака. Если суммарная длина `буферов` в `списке` превышает `totalLength`, результат усекается до `totalLength`.

```mjs
import { Buffer } from 'node:buffer';

// Создаем один `Buffer` из списка трех экземпляров `Buffer`.

const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// Печатает: 42

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// Печатает: <Буфер 00 00 00 00 00 ...
console.log(bufA.length);
// Печатает: 42
```

```cjs
const { Buffer } = require('node:buffer');

// Создаем один `Buffer` из списка трех экземпляров `Buffer`.

const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// Печатает: 42

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// Печатает: <Буфер 00 00 00 00 00 ...
console.log(bufA.length);
// Печатает: 42
```

`Buffer.concat()` может также использовать внутренний пул `Buffer`, как это делает `Buffer.allocUnsafe()`.

### Статический метод: `Buffer.copyBytesFrom(view[, offset[, length]])`

- `view` {TypedArray} {TypedArray} для копирования.
- `offset` {integer} Начальное смещение в `view`. **По умолчанию:**: `0`.
- `length` {integer} Количество элементов из `view` для копирования. **По умолчанию:** `view.length - offset`.

Копирует базовую память `view` в новый `Buffer`.

```js
const u16 = new Uint16Array([0, 0xffff]);
const buf = Buffer.copyBytesFrom(u16, 0, 1);
u16[1] = 0;
console.log(buf.length); // 2
console.log(buf[0]); // 255
console.log(buf[1]); // 255
```

### Статический метод: `Buffer.from(array)`

- `массив` {целое число\[\]}

Выделяет новый `Буфер`, используя `массив` байтов в диапазоне `0` - `255`. Записи массива за пределами этого диапазона будут усечены, чтобы поместиться в него.

```mjs
import { Buffer } from 'node:buffer';

// Создает новый буфер, содержащий байты UTF-8 строки 'buffer'.
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
const { Buffer } = require('node:buffer');

// Создает новый буфер, содержащий UTF-8 байты строки 'buffer'.
const buf = Buffer.from([
  0x62,
  0x75,
  0x66,
  0x66,
  0x65,
  0x72,
]);
```

Если `array` не является `Array` или другим типом, подходящим для вариантов `Buffer.from()`, то будет выдан `TypeError`.

`Buffer.from(array)` и `Buffer.from(string)` могут также использовать внутренний пул `Buffer`, как это делает `Buffer.allocUnsafe()`.

### Статический метод: `Buffer.from(arrayBuffer[, byteOffset[, length]])`.

- `arrayBuffer` {ArrayBuffer|SharedArrayBuffer} [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), например, свойство `.buffer` для [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).
- `byteOffset` {integer} Индекс первого байта для раскрытия. **По умолчанию:** `0`.
- `length` {integer} Количество байтов для раскрытия. **По умолчанию:** `arrayBuffer.byteLength - byteOffset`.

Это создает представление [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) без копирования основной памяти. Например, при передаче ссылки на свойство `.buffer` экземпляра [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), вновь созданный `Buffer` будет использовать ту же выделенную память, что и основной `ArrayBuffer` [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

```mjs
import { Buffer } from 'node:buffer';

const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Делит память с `arr`.
const buf = Buffer.from(arr.buffer);

console.log(buf);
// Печатает: <Буфер 88 13 a0 0f>

// Изменение исходного Uint16Array изменяет и буфер.
arr[1] = 6000;

console.log(buf);
// Печатает: <Буфер 88 13 70 17>
```

```cjs
const { Buffer } = require('node:buffer');

const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

// Делит память с `arr`.
const buf = Buffer.from(arr.buffer);

console.log(buf);
// Печатает: <Буфер 88 13 a0 0f>

// Изменение исходного Uint16Array изменяет и буфер.
arr[1] = 6000;

console.log(buf);
// Печатает: <Буфер 88 13 70 17>
```

Необязательные аргументы `byteOffset` и `length` задают диапазон памяти в `arrayBuffer`, который будет совместно использоваться `Buffer`.

```mjs
import { Buffer } from 'node:buffer';

const ab = new ArrayBuffer(10);
const buf = Buffer.from(ab, 0, 2);

console.log(buf.length);
// Печатает: 2
```

```cjs
const { Buffer } = require('node:buffer');

const ab = new ArrayBuffer(10);
const buf = Buffer.from(ab, 0, 2);

console.log(buf.length);
// Печатает: 2
```

Если `arrayBuffer` не является [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) или другим типом, подходящим для вариантов `Buffer.from()`, то будет выдан `TypeError`.

Важно помнить, что резервный `ArrayBuffer` может охватывать диапазон памяти, выходящий за границы представления `TypedArray`. Новый `Buffer`, созданный с помощью свойства `buffer` представления `TypedArray`:

```mjs
import { Buffer } from 'node:buffer';

const arrA = Uint8Array.from([0x63, 0x64, 0x65, 0x66]); // 4 elements
const arrB = new Uint8Array(arrA.buffer, 1, 2); // 2 elements
console.log(arrA.buffer === arrB.buffer); // true

const buf = Buffer.from(arrB.buffer);
console.log(buf);
// Prints: <Buffer 63 64 65 66>
```

```cjs
const { Buffer } = require('node:buffer');

const arrA = Uint8Array.from([0x63, 0x64, 0x65, 0x66]); // 4 elements
const arrB = new Uint8Array(arrA.buffer, 1, 2); // 2 elements
console.log(arrA.buffer === arrB.buffer); // true

const buf = Buffer.from(arrB.buffer);
console.log(buf);
// Prints: <Buffer 63 64 65 66>
```

### Статический метод: `Buffer.from(buffer)`

- `buffer` {Buffer|Uint8Array} Существующий `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), из которого нужно скопировать данные.

Копирует переданные данные `buffer` в новый экземпляр `Buffer`.

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from('buffer');
const buf2 = Buffer.from(buf1);

buf1[0] = 0x61;

console.log(buf1.toString());
// Печатает: буфер
console.log(buf2.toString());
// Печатает: буфер
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from('buffer');
const buf2 = Buffer.from(buf1);

buf1[0] = 0x61;

console.log(buf1.toString());
// Печатает: буфер
console.log(buf2.toString());
// Печатает: буфер
```

Если `buffer` не является `Buffer` или другим типом, подходящим для вариантов `Buffer.from()`, то будет выдан `TypeError`.

### Статический метод: `Buffer.from(object[, offsetOrEncoding[, length]])`

- `object` {Object} Объект, поддерживающий `Symbol.toPrimitive` или `valueOf()`.
- `offsetOrEncoding` {integer|string} Смещение байтов или кодировка.
- `length` {integer} Длина.

Для объектов, чья функция `valueOf()` возвращает значение, не равное строго `object`, возвращает `Buffer.from(object.valueOf(), offsetOrEncoding, length)`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from(new String('this is a test'));
// Печатает: <Буфер 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from(new String('this is a test'));
// Печатает: <Буфер 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
```

Для объектов, поддерживающих `Symbol.toPrimitive`, возвращает `Buffer.from(object[Symbol.toPrimitive]('string'), offsetOrEncoding)`.

```mjs
import { Buffer } from 'node:buffer';

class Foo {
  [Symbol.toPrimitive]() {
    return 'это тест';
  }
}

const buf = Buffer.from(new Foo(), 'utf8');
// Печатает: <Буфер 74 68 69 73 20 69 73 20 61 20 74 65 73 74>.
```

```cjs
const { Buffer } = require('node:buffer');

class Foo {
  [Symbol.toPrimitive]() {
    return 'это тест';
  }
}

const buf = Buffer.from(new Foo(), 'utf8');
// Печатает: <Буфер 74 68 69 73 20 69 73 20 61 20 74 65 73 74>.
```

Если `object` не имеет упомянутых методов или не является другим типом, подходящим для вариантов `Buffer.from()`, будет выброшен `TypeError`.

### Статический метод: `Buffer.from(string[, encoding])`

- `строка` {строка} Строка для кодирования.
- `encoding` {string} Кодировка `строки`. **По умолчанию:** `'utf8'`.

Создает новый `буфер`, содержащий `строку`. Параметр `encoding` определяет кодировку символов, которая будет использоваться при преобразовании `строки` в байты.

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from('this is a tést');
const buf2 = Buffer.from(
  '7468697320697320612074c3a97374',
  'hex'
);

console.log(buf1.toString());
// Печатает: это тэст
console.log(buf2.toString());
// Печатает: это тест
console.log(buf1.toString('latin1'));
// Выводит: это тэст
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from('this is a tést');
const buf2 = Buffer.from(
  '7468697320697320612074c3a97374',
  'hex'
);

console.log(buf1.toString());
// Печатает: это тэст
console.log(buf2.toString());
// Печатает: это тест
console.log(buf1.toString('latin1'));
// Выводит: это тэст
```

Если `string` не является строкой или другим типом, подходящим для вариантов `Buffer.from()`, будет выдан `TypeError`.

### Статический метод: `Buffer.isBuffer(obj)`

- `obj` {Объект}
- Возвращает: {boolean}

Возвращает `true`, если `obj` является `Buffer`, `false` в противном случае.

```mjs
import { Buffer } from 'node:buffer';

Buffer.isBuffer(Buffer.alloc(10)); // true
Buffer.isBuffer(Buffer.from('foo')); // true
Buffer.isBuffer('a string'); // false
Buffer.isBuffer([]); // false
Buffer.isBuffer(new Uint8Array(1024)); // false
```

```cjs
const { Buffer } = require('node:buffer');

Buffer.isBuffer(Buffer.alloc(10)); // true
Buffer.isBuffer(Buffer.from('foo')); // true
Buffer.isBuffer('a string'); // false
Buffer.isBuffer([]); // false
Buffer.isBuffer(new Uint8Array(1024)); // false
```

### Статический метод: `Buffer.isEncoding(encoding)`

- `encoding` {string} Имя кодировки символов для проверки.
- Возвращает: {boolean}

Возвращает `true`, если `encoding` является именем поддерживаемой кодировки символов, или `false` в противном случае.

```mjs
import { Buffer } from 'node:buffer';

console.log(Buffer.isEncoding('utf8'));
// Выводит: true

console.log(Buffer.isEncoding('hex'));
// Печатает: true

console.log(Buffer.isEncoding('utf/8'));
// Печатает: false

console.log(Buffer.isEncoding(''));
// Выводит: false
```

```cjs
const { Buffer } = require('node:buffer');

console.log(Buffer.isEncoding('utf8'));
// Выводит: true

console.log(Buffer.isEncoding('hex'));
// Печатает: true

console.log(Buffer.isEncoding('utf/8'));
// Печатает: false

console.log(Buffer.isEncoding(''));
// Выводит: false
```

### Свойство класса: `Buffer.poolSize`

- {целое число} **По умолчанию:** `8192`.

Это размер (в байтах) предварительно выделенных внутренних экземпляров `Buffer`, используемых для объединения в пул. Это значение может быть изменено.

### `buf[index]`

- `index` {целое число}

Оператор индекса `[index]` может использоваться для получения и установки октета в позиции `index` в `buf`. Значения относятся к отдельным байтам, поэтому допустимый диапазон значений находится между `0x00` и `0xFF` (шестнадцатеричный) или `0` и `255` (десятичный).

Этот оператор унаследован от `Uint8Array`, поэтому его поведение при доступе за пределы границ такое же, как и у `Uint8Array`. Другими словами, `buf[index]` возвращает `undefined`, когда `index` отрицателен или больше или равен `buf.length`, а `buf[index] = value` не изменяет буфер, если `index` отрицателен или `>= buf.length`.

```mjs
import { Buffer } from 'node:buffer';

// Копируем строку ASCII в `буфер` по одному байту за раз.
// (Это работает только для ASCII-строк. В общем случае следует использовать
// `Buffer.from()` для выполнения этого преобразования).

const str = 'Node.js';
const buf = Buffer.allocUnsafe(str.length);

for (let i = 0; i < str.length; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('utf8'));
// Печать: Node.js
```

```cjs
const { Buffer } = require('node:buffer');

// Скопируйте ASCII-строку в `Buffer` по одному байту за раз.
// (Это работает только для ASCII-строк. В общем случае следует использовать
// `Buffer.from()` для выполнения этого преобразования).

const str = 'Node.js';
const buf = Buffer.allocUnsafe(str.length);

for (let i = 0; i < str.length; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('utf8'));
// Печать: Node.js
```

### `buf.buffer`

- {ArrayBuffer} Основной объект `ArrayBuffer`, на основе которого создается данный объект `Buffer`.

Не гарантируется, что этот `ArrayBuffer` будет точно соответствовать исходному `Buffer`. Подробности смотрите в примечаниях к `buf.byteOffset`.

```mjs
import { Buffer } from 'node:buffer';

const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer);
// Печатает: true
```

```cjs
const { Buffer } = require('node:buffer');

const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer);
// Печатает: true
```

### `buf.byteOffset`

- {целое число} БайтОффсет" объекта `Buffer`, лежащего в основе `ArrayBuffer`.

При установке `byteOffset` в `Buffer.from(ArrayBuffer, byteOffset, length)`, или иногда при выделении `Buffer` меньшего размера, чем `Buffer.poolSize`, буфер не начинается с нулевого смещения на нижележащем `ArrayBuffer`.

Это может вызвать проблемы при прямом доступе к базовому `ArrayBuffer` с помощью `buf.buffer`, поскольку другие части `ArrayBuffer` могут быть не связаны с самим объектом `Buffer`.

Частая проблема при создании объекта `TypedArray`, который разделяет свою память с `Buffer`, заключается в том, что в этом случае необходимо правильно указать `byteOffset`:

```mjs
import { Buffer } from 'node:buffer';

// Создаем буфер меньше, чем `Buffer.poolSize`.
const nodeBuffer = Buffer.from([
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

// При приведении буфера Node.js к массиву Int8Array используйте смещение байтов.
// для обращения только к той части `nodeBuffer.buffer`, которая содержит память
// для `nodeBuffer`.
new Int8Array(
  nodeBuffer.buffer,
  nodeBuffer.byteOffset,
  nodeBuffer.length
);
```

```cjs
const { Buffer } = require('node:buffer');

// Создаем буфер размером меньше, чем `Buffer.poolSize`.
const nodeBuffer = Buffer.from([
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

// При приведении буфера Node.js к массиву Int8Array используйте смещение байтов.
// для обращения только к той части `nodeBuffer.buffer`, которая содержит память
// для `nodeBuffer`.
new Int8Array(
  nodeBuffer.buffer,
  nodeBuffer.byteOffset,
  nodeBuffer.length
);
```

### `buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])`

- `target` {Buffer|Uint8Array} `Буфер` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), с которым нужно сравнить `buf`.
- `targetStart` {integer} Смещение внутри `target`, с которого следует начать сравнение. **По умолчанию:** `0`.
- `targetEnd` {целое число} Смещение в пределах `цели`, на котором заканчивается сравнение (не включительно). **По умолчанию:** `target.length`.
- `sourceStart` {целое число} Смещение в `buf`, с которого следует начать сравнение. **По умолчанию:** `0`.
- `sourceEnd` {целое число} Смещение в `buf`, на котором заканчивается сравнение (не включительно). **По умолчанию:** [`buf.length`](#buflength).
- Возвращает: {целое}

Сравнивает `buf` с `target` и возвращает число, указывающее, находится ли `buf` перед, после или совпадает с `target` в порядке сортировки. Сравнение основано на фактической последовательности байтов в каждом `буфере`.

- `0` возвращается, если `цель` совпадает с `buf`.
- `1` возвращается, если `цель` должна быть _перед_ `buf` при сортировке.
- `-1` возвращается, если `цель` должна быть _после_ `buf` при сортировке.

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('BCD');
const buf3 = Buffer.from('ABCD');

console.log(buf1.compare(buf1));
// Печатает: 0
console.log(buf1.compare(buf2));
// Печатает: -1
console.log(buf1.compare(buf3));
// Печатает: -1
console.log(buf2.compare(buf1));
// Печатает: 1
console.log(buf2.compare(buf3));
// Печатает: 1
console.log([buf1, buf2, buf3].sort(Buffer.compare));
// Печатает: [ <Буфер 41 42 43>, <Буфер 41 42 43 44>, <Буфер 42 43 44> ]
// (Этот результат равен: [buf1, buf3, buf2]).
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('BCD');
const buf3 = Buffer.from('ABCD');

console.log(buf1.compare(buf1));
// Печатает: 0
console.log(buf1.compare(buf2));
// Печатает: -1
console.log(buf1.compare(buf3));
// Печатает: -1
console.log(buf2.compare(buf1));
// Печатает: 1
console.log(buf2.compare(buf3));
// Печатает: 1
console.log([buf1, buf2, buf3].sort(Buffer.compare));
// Печатает: [ <Буфер 41 42 43>, <Буфер 41 42 43 44>, <Буфер 42 43 44> ]
// (Этот результат равен: [buf1, buf3, buf2]).
```

Дополнительные аргументы `targetStart`, `targetEnd`, `sourceStart` и `sourceEnd` могут быть использованы для ограничения сравнения определенными диапазонами в пределах `target` и `buf` соответственно.

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

console.log(buf1.compare(buf2, 5, 9, 0, 4));
// Печатает: 0
console.log(buf1.compare(buf2, 0, 6, 4));
// Печатает: -1
console.log(buf1.compare(buf2, 5, 6, 5));
// Печатается: 1
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

console.log(buf1.compare(buf2, 5, 9, 0, 4));
// Печатает: 0
console.log(buf1.compare(buf2, 0, 6, 4));
// Печатает: -1
console.log(buf1.compare(buf2, 5, 6, 5));
// Печатается: 1
```

[`ERR_OUT_OF_RANGE`](errors.md#err_out_of_range) выбрасывается, если `targetStart < 0`, `sourceStart < 0`, `targetEnd > target.byteLength`, или `sourceEnd > source.byteLength`.

### `buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])`

- `target` {Buffer|Uint8Array} Буфер или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) для копирования.
- `targetStart` {integer} Смещение внутри `target`, с которого следует начать запись. **По умолчанию:** `0`.
- `sourceStart` {integer} Смещение в `buf`, с которого начинается копирование. **По умолчанию:** `0`.
- `sourceEnd` {integer} Смещение в `buf`, с которого следует прекратить копирование (не включительно). **По умолчанию:** [`buf.length`](#buflength).
- Возвращает: {целое число} Количество скопированных байт.

Копирует данные из области `buf` в область `target`, даже если область памяти `target` перекрывается с `buf`.

[`TypedArray.prototype.set()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set) выполняет ту же операцию и доступен для всех TypedArray, включая Node.js `Buffer`, хотя принимает разные аргументы функции.

```mjs
import { Buffer } from 'node:buffer';

// Создаем два экземпляра `Buffer`.
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное ASCII значение для 'a'.
  buf1[i] = i + 97;
}

// Копируем байты с 16 по 19 из `buf1` в `buf2`, начиная с байта 8 из `buf2`.
buf1.copy(buf2, 8, 16, 20);
// Это эквивалентно:
// buf2.set(buf1.subarray(16, 20), 8);

console.log(buf2.toString('ascii', 0, 25));
// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
```

```cjs
const { Buffer } = require('node:buffer');

// Создаем два экземпляра `Buffer`.
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное ASCII значение для 'a'.
  buf1[i] = i + 97;
}

// Копируем байты с 16 по 19 из `buf1` в `buf2`, начиная с байта 8 из `buf2`.
buf1.copy(buf2, 8, 16, 20);
// Это эквивалентно:
// buf2.set(buf1.subarray(16, 20), 8);

console.log(buf2.toString('ascii', 0, 25));
// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
```

```mjs
import { Buffer } from 'node:buffer';

// Создаем `Buffer` и копируем данные из одного региона в перекрывающийся регион
// в пределах того же `Буфера`.

const buf = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное ASCII-значение для 'a'.
  buf[i] = i + 97;
}

buf.copy(buf, 0, 4, 10);

console.log(buf.toString());
// Prints: efghijghijklmnopqrstuvwxyz
```

```cjs
const { Buffer } = require('node:buffer');

// Создайте `Buffer` и скопируйте данные из одного региона в перекрывающийся регион
// в пределах того же `Буфера`.

const buf = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное ASCII-значение для 'a'.
  buf[i] = i + 97;
}

buf.copy(buf, 0, 4, 10);

console.log(buf.toString());
// Prints: efghijghijklmnopqrstuvwxyz
```

### `buf.entries()`

- Возвращает: {Итератор}

Создает и возвращает [итератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) пар `[индекс, байт]` из содержимого `buf`.

```mjs
import { Buffer } from 'node:buffer';

// Запись всего содержимого `буфера`.

const buf = Buffer.from('buffer');

for (const pair of buf.entries()) {
  console.log(pair);
}
// Печатает:
// [0, 98]
// [1, 117]
// [2, 102]
// [3, 102]
// [4, 101]
// [5, 114]
```

```cjs
const { Buffer } = require('node:buffer');

// Запись всего содержимого `буфера`.

const buf = Buffer.from('buffer');

for (const pair of buf.entries()) {
  console.log(pair);
}
// Печатает:
// [0, 98]
// [1, 117]
// [2, 102]
// [3, 102]
// [4, 101]
// [5, 114]
```

### `buf.equals(otherBuffer)`

- `otherBuffer` {Buffer|Uint8Array} Буфер или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), с которым сравнивается `buf`.
- Возвращает: {boolean}

Возвращает `true`, если и `buf` и `otherBuffer` имеют одинаковые байты, `false` в противном случае. Эквивалентно [`buf.compare(otherBuffer) === 0`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('414243', 'hex');
const buf3 = Buffer.from('ABCD');

console.log(buf1.equals(buf2));
// Выводит: true
console.log(buf1.equals(buf3));
// Выводит: false
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('414243', 'hex');
const buf3 = Buffer.from('ABCD');

console.log(buf1.equals(buf2));
// Выводит: true
console.log(buf1.equals(buf3));
// Выводит: false
```

### `buf.fill(value[, offset[, end]][, encoding])`

- `value` {string|Buffer|Uint8Array|integer} Значение, которым заполняется `buf`. Пустое значение (string, Uint8Array, Buffer) принудительно записывается в `0`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом заполнения `buf`. **По умолчанию:** `0`.
- `end` {integer} Где остановить заполнение `buf` (не включительно). **По умолчанию:** [`buf.length`](#buflength).
- `encoding` {string} Кодировка для `value`, если `value` является строкой. **По умолчанию:** `'utf8'`.
- Возвращает: {Buffer} Ссылка на `buf`.

Заполняет `buf` указанным `значением`. Если `offset` и `end` не указаны, то заполняется весь `buf`:

```mjs
import { Buffer } from 'node:buffer';

// Заполняем `буфер` символом ASCII 'h'.

const b = Buffer.allocUnsafe(50).fill('h');

console.log(b.toString());
// Печатает: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh

// Заполнение буфера пустой строкой
const c = Buffer.allocUnsafe(5).fill('');

console.log(c.fill(''));
// Печатает: <Буфер 00 00 00 00 00 00 00>
```

```cjs
const { Buffer } = require('node:buffer');

// Заполните `Buffer` символом ASCII 'h'.

const b = Buffer.allocUnsafe(50).fill('h');

console.log(b.toString());
// Печатает: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh

// Заполнение буфера пустой строкой
const c = Buffer.allocUnsafe(5).fill('');

console.log(c.fill(''));
// Печатает: <Буфер 00 00 00 00 00 00 00>
```

Значение `value` приводится к значению `uint32`, если оно не является строкой, `Buffer` или целым числом. Если полученное целое число больше `255` (десятичное), `buf` будет заполнен `value & 255`.

Если финальная запись операции `fill()` приходится на многобайтовый символ, то записываются только те байты этого символа, которые помещаются в `buf`:

```mjs
import { Buffer } from 'node:buffer';

// Заполняем `буфер` символом, который занимает два байта в UTF-8.

console.log(Buffer.allocUnsafe(5).fill('\u0222'));
// Печатает: <Буфер c8 a2 c8 a2 c8>
```

```cjs
const { Buffer } = require('node:buffer');

// Заполните `Buffer` символом, который занимает два байта в UTF-8.

console.log(Buffer.allocUnsafe(5).fill('\u0222'));
// Печатает: <Буфер c8 a2 c8 a2 c8>
```

Если `value` содержит недопустимые символы, оно усекается; если не остается допустимых данных для заполнения, выбрасывается исключение:

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(5);

console.log(buf.fill('a'));
// Печатает: <Буфер 61 61 61 61 61 61 61 61>
console.log(buf.fill('aazz', 'hex'));
// Печатает: <Буфер aa aa aa aa aa aa aa>
console.log(buf.fill('zz', 'hex'));
// Выброс исключения.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(5);

console.log(buf.fill('a'));
// Печатает: <Буфер 61 61 61 61 61 61 61 61>
console.log(buf.fill('aazz', 'hex'));
// Печатает: <Буфер aa aa aa aa aa aa aa>
console.log(buf.fill('zz', 'hex'));
// Выброс исключения.
```

### `buf.includes(value[, byteOffset][, encoding])`

- `value` {string|Buffer|Uint8Array|integer} Что искать.
- `byteOffset` {целое число} С чего начать поиск в `buf`. Если отрицательно, то смещение отсчитывается от конца `buf`. **По умолчанию:** `0`.
- `encoding` {string} Если `value` является строкой, то это ее кодировка. **По умолчанию:** `'utf8'`.
- Возвращает: {boolean} `true`, если `значение` было найдено в `buf`, `false` в противном случае.

Эквивалентно [`buf.indexOf() !== -1`](#bufindexofvalue-byteoffset-encoding).

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('this is a buffer');

console.log(buf.includes('this'));
// Выводит: true
console.log(buf.includes('is'));
// Выводит: true
console.log(buf.includes(Buffer.from('a buffer')));
// Выводит: true
console.log(buf.includes(97));
// Выводит: true (97 - десятичное значение ASCII для 'a')
console.log(buf.includes(Buffer.from('a buffer example')));
// Печатает: false
console.log(
  buf.includes(Buffer.from('a buffer example').slice(0, 8))
);
// Выводит: true
console.log(buf.includes('this', 4));
// Печатает: false
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('this is a buffer');

console.log(buf.includes('this'));
// Выводит: true
console.log(buf.includes('is'));
// Выводит: true
console.log(buf.includes(Buffer.from('a buffer')));
// Выводит: true
console.log(buf.includes(97));
// Выводит: true (97 - десятичное значение ASCII для 'a')
console.log(buf.includes(Buffer.from('a buffer example')));
// Печатает: false
console.log(
  buf.includes(Buffer.from('a buffer example').slice(0, 8))
);
// Выводит: true
console.log(buf.includes('this', 4));
// Печатает: false
```

### `buf.indexOf(value[, byteOffset][, encoding])`

- `value` {string|Buffer|Uint8Array|integer} Что искать.
- `byteOffset` {целое число} С чего начать поиск в `buf`. Если отрицательно, то смещение отсчитывается от конца `buf`. **По умолчанию:** `0`.
- `encoding` {string} Если `value` является строкой, то это кодировка, используемая для определения двоичного представления строки, которая будет искаться в `buf`. **По умолчанию:** `'utf8'`.
- Возвращает: {целое число} Индекс первого вхождения `значения` в `buf`, или `-1`, если `buf` не содержит `значения`.

Если `value` является:

- строка, `value` интерпретируется в соответствии с кодировкой символов в `encoding`.
- `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), `value` будет использовано полностью. Для сравнения частичного `Buffer` используйте [`buf.subarray`](#bufsubarraystart-end).
- число, `value` будет интерпретировано как беззнаковое 8-битное целое значение от `0` до `255`.

<!-- конец списка -->

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('this is a buffer');

console.log(buf.indexOf('this'));
// Печатает: 0
console.log(buf.indexOf('is'));
// Печатает: 2
console.log(buf.indexOf(Buffer.from('a buffer')));
// Печатается: 8
console.log(buf.indexOf(97));
// Печатает: 8 (97 - десятичное ASCII-значение для 'a')
console.log(buf.indexOf(Buffer.from('a buffer example')));
// Печатает: -1
console.log(
  buf.indexOf(Buffer.from('a buffer example').slice(0, 8))
);
// Печатается: 8

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(utf16Buffer.indexOf('\u03a3', 0, 'utf16le'));
// Печатает: 4
console.log(utf16Buffer.indexOf('\u03a3', -4, 'utf16le'));
// Печатается: 6
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('this is a buffer');

console.log(buf.indexOf('this'));
// Печатает: 0
console.log(buf.indexOf('is'));
// Печатает: 2
console.log(buf.indexOf(Buffer.from('a buffer')));
// Печатается: 8
console.log(buf.indexOf(97));
// Печатает: 8 (97 - десятичное ASCII-значение для 'a')
console.log(buf.indexOf(Buffer.from('a buffer example')));
// Печатает: -1
console.log(
  buf.indexOf(Buffer.from('a buffer example').slice(0, 8))
);
// Печатается: 8

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(utf16Buffer.indexOf('\u03a3', 0, 'utf16le'));
// Печатает: 4
console.log(utf16Buffer.indexOf('\u03a3', -4, 'utf16le'));
// Печатается: 6
```

Если `value` не является строкой, числом или `Buffer`, этот метод выдаст `TypeError`. Если `value` является числом, оно будет приведено к допустимому значению байта, целому числу от 0 до 255.

Если `byteOffset` не является числом, оно будет приведено к числу. Если результатом когеренции является `NaN` или `0`, то будет произведен поиск во всем буфере. Это поведение соответствует [`String.prototype.indexOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf).

```mjs
import { Buffer } from 'node:buffer';

const b = Buffer.from('abcdef');

// Передаем значение, которое является числом, но не является допустимым байтом.
// Выводит: 2, что эквивалентно поиску 99 или 'c'.
console.log(b.indexOf(99.9));
console.log(b.indexOf(256 + 99));

// Передача байтового смещения, которое приводит к NaN или 0.
// Печатается: 1, поиск во всем буфере.
console.log(b.indexOf('b', undefined));
console.log(b.indexOf('b', {}));
console.log(b.indexOf('b', null));
console.log(b.indexOf('b', []));
```

```cjs
const { Buffer } = require('node:buffer');

const b = Buffer.from('abcdef');

// Передача значения, которое является числом, но не является допустимым байтом.
// Выводит: 2, что эквивалентно поиску 99 или 'c'.
console.log(b.indexOf(99.9));
console.log(b.indexOf(256 + 99));

// Передача байтового смещения, которое приводит к NaN или 0.
// Печатается: 1, поиск во всем буфере.
console.log(b.indexOf('b', undefined));
console.log(b.indexOf('b', {}));
console.log(b.indexOf('b', null));
console.log(b.indexOf('b', []));
```

Если `value` - пустая строка или пустой `Buffer` и `byteOffset` меньше `buf.length`, то будет возвращен `byteOffset`. Если `value` пустое и `byteOffset` не меньше `buf.length`, будет возвращена `buf.length`.

### `buf.keys()`

- Возвращает: {Итератор}

Создает и возвращает [итератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) ключей (индексов) `buf`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('buffer');

for (const key of buf.keys()) {
  console.log(key);
}
// Печатает:
// 0
// 1
// 2
// 3
// 4
// 5
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('buffer');

for (const key of buf.keys()) {
  console.log(key);
}
// Печатает:
// 0
// 1
// 2
// 3
// 4
// 5
```

### `buf.lastIndexOf(value[, byteOffset][, encoding])`

- `value` {string|Buffer|Uint8Array|integer} Что искать.
- `byteOffset` {целое число} С чего начать поиск в `buf`. Если отрицательно, то смещение рассчитывается от конца `buf`. **По умолчанию:** `buf.length - 1`.
- `encoding` {string} Если `value` является строкой, то это кодировка, используемая для определения двоичного представления строки, которая будет искаться в `buf`. **По умолчанию:** `'utf8'`.
- Возвращает: {целое число} Индекс последнего вхождения `значения` в `buf`, или `-1`, если `buf` не содержит `значения`.

Идентично [`buf.indexOf()`](#bufindexofvalue-byteoffset-encoding), за исключением того, что находится последнее вхождение `значения`, а не первое.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('этот буфер является буфером');

console.log(buf.lastIndexOf('this'));
// Печатает: 0
console.log(buf.lastIndexOf('buffer'));
// Печатает: 17
console.log(buf.lastIndexOf(Buffer.from('buffer')));
// Печатает: 17
console.log(buf.lastIndexOf(97));
// Печатает: 15 (97 - десятичное ASCII-значение для 'a')
console.log(buf.lastIndexOf(Buffer.from('yolo')));
// Печатает: -1
console.log(buf.lastIndexOf('buffer', 5));
// Печатает: 5
console.log(buf.lastIndexOf('buffer', 4));
// Печатает: -1

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(
  utf16Buffer.lastIndexOf('\u03a3', undefined, 'utf16le')
);
// Печатается: 6
console.log(
  utf16Buffer.lastIndexOf('\u03a3', -5, 'utf16le')
);
// Печатается: 4
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('этот буфер является буфером');

console.log(buf.lastIndexOf('this'));
// Печатает: 0
console.log(buf.lastIndexOf('buffer'));
// Печатает: 17
console.log(buf.lastIndexOf(Buffer.from('buffer')));
// Печатает: 17
console.log(buf.lastIndexOf(97));
// Печатает: 15 (97 - десятичное ASCII-значение для 'a')
console.log(buf.lastIndexOf(Buffer.from('yolo')));
// Печатает: -1
console.log(buf.lastIndexOf('buffer', 5));
// Печатает: 5
console.log(buf.lastIndexOf('buffer', 4));
// Печатает: -1

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'utf16le'
);

console.log(
  utf16Buffer.lastIndexOf('\u03a3', undefined, 'utf16le')
);
// Печатается: 6
console.log(
  utf16Buffer.lastIndexOf('\u03a3', -5, 'utf16le')
);
// Печатается: 4
```

Если `value` не является строкой, числом или `Buffer`, этот метод выдаст `TypeError`. Если `value` - число, оно будет приведено к допустимому значению байта, целому числу от 0 до 255.

Если `byteOffset` не является числом, оно будет приведено к числу. Любые аргументы, которые приводятся к `NaN`, такие как `{}` или `undefined`, будут искать во всем буфере. Это поведение соответствует [`String.prototype.lastIndexOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/lastIndexOf).

```mjs
import { Buffer } from 'node:buffer';

const b = Buffer.from('abcdef');

// Передаем значение, которое является числом, но не является допустимым байтом.
// Выводит: 2, что эквивалентно поиску 99 или 'c'.
console.log(b.lastIndexOf(99.9));
console.log(b.lastIndexOf(256 + 99));

// Передача байтового смещения, которое приводится к NaN.
// Печатает: 1, поиск во всем буфере.
console.log(b.lastIndexOf('b', undefined));
console.log(b.lastIndexOf('b', {}));

// Передача byteOffset, который коэрцитирует к 0.
// Выводит: -1, что эквивалентно передаче 0.
console.log(b.lastIndexOf('b', null));
console.log(b.lastIndexOf('b', []));
```

```cjs
const { Buffer } = require('node:buffer');

const b = Buffer.from('abcdef');

// Передача значения, которое является числом, но не является допустимым байтом.
// Выводит: 2, что эквивалентно поиску 99 или 'c'.
console.log(b.lastIndexOf(99.9));
console.log(b.lastIndexOf(256 + 99));

// Передача байтового смещения, которое приводится к NaN.
// Печатает: 1, поиск во всем буфере.
console.log(b.lastIndexOf('b', undefined));
console.log(b.lastIndexOf('b', {}));

// Передача byteOffset, который коэрцитирует к 0.
// Выводит: -1, что эквивалентно передаче 0.
console.log(b.lastIndexOf('b', null));
console.log(b.lastIndexOf('b', []));
```

Если `value` - пустая строка или пустой `Buffer`, будет возвращен `byteOffset`.

### `buf.length`

- {целое число}

Возвращает количество байт в `buf`.

```mjs
import { Buffer } from 'node:buffer';

// Создаем `Буфер` и записываем в него более короткую строку, используя UTF-8.

const buf = Buffer.alloc(1234);

console.log(buf.length);
// Печатает: 1234

buf.write('some string', 0, 'utf8');

console.log(buf.length);
// Печатает: 1234
```

```cjs
const { Buffer } = require('node:buffer');

// Создаем `Буфер` и записываем в него более короткую строку, используя UTF-8.

const buf = Buffer.alloc(1234);

console.log(buf.length);
// Печатает: 1234

buf.write('some string', 0, 'utf8');

console.log(buf.length);
// Печатает: 1234
```

### `buf.parent`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого используйте `buf.buffer`.

Свойство `buf.parent` является устаревшим псевдонимом для `buf.buffer`.

### `buf.readBigInt64BE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {bigint}

Читает знаковое, big-endian 64-битное целое число из `buf` по указанному `смещению`.

Целое число, считанное из `буфера`, интерпретируется как знаковое значение с двумя дополнениями.

### `buf.readBigInt64LE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {bigint}

Читает знаковое, little-endian 64-битное целое число из `buf` по указанному `смещению`.

Целочисленные значения, считанные из `буфера`, интерпретируются как знаковое число с двойным дополнением.

### `buf.readBigUInt64BE([offset])`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {bigint}

Читает беззнаковое, big-endian 64-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readBigUint64BE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([
  0x00,
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
// Печатает: 4294967295n
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([
  0x00,
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
// Печатает: 4294967295n
```

### `buf.readBigUInt64LE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {bigint}

Читает беззнаковое, little-endian 64-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readBigUint64LE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([
  0x00,
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
// Печатает: 18446744069414584320n
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([
  0x00,
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
// Печатает: 18446744069414584320n
```

### `buf.readDoubleBE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {число}

Читает 64-битное, big-endian двойное число из `buf` по указанному `смещению`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleBE(0));
// Печатает: 8.20788039913184e-304
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleBE(0));
// Печатает: 8.20788039913184e-304
```

### `buf.readDoubleLE([offset])`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {число}

Читает 64-битное, little-endian двойное число из `buf` по указанному `смещению`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleLE(0));
// Печатает: 5.447603722011605e-270
console.log(buf.readDoubleLE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

console.log(buf.readDoubleLE(0));
// Печатает: 5.447603722011605e-270
console.log(buf.readDoubleLE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readFloatBE([offset])`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {число}

Читает 32-битное, big-endian float из `buf` по указанному `смещению`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatBE(0));
// Печатает: 2.387939260590663e-38
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatBE(0));
// Печатает: 2.387939260590663e-38
```

### `buf.readFloatLE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {число}

Читает 32-битное, little-endian float из `buf` по указанному `смещению`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatLE(0));
// Печатает: 1.539989614439558e-36
console.log(buf.readFloatLE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([1, 2, 3, 4]);

console.log(buf.readFloatLE(0));
// Печатает: 1.539989614439558e-36
console.log(buf.readFloatLE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readInt8([offset])`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает знаковое 8-битное целое число из `buf` по указанному `смещению`.

Целое число, считанное из `буфера`, интерпретируется как два знаковых дополнения.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([-1, 5]);

console.log(buf.readInt8(0));
// Печатает: -1
console.log(buf.readInt8(1));
// Печатает: 5
console.log(buf.readInt8(2));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([-1, 5]);

console.log(buf.readInt8(0));
// Печатает: -1
console.log(buf.readInt8(1));
// Печатает: 5
console.log(buf.readInt8(2));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readInt16BE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает знаковое, big-endian 16-битное целое число из `buf` по указанному `смещению`.

Целочисленные значения, считанные из `буфера`, интерпретируются как два дополнения к знаковым значениям.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16BE(0));
// Печатает: 5
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16BE(0));
// Печатает: 5
```

### `buf.readInt16LE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает знаковое, little-endian 16-битное целое число из `buf` по указанному `смещению`.

Целочисленные значения, считанные из `буфера`, интерпретируются как два дополнения к знаковым значениям.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16LE(0));
// Печатает: 1280
console.log(buf.readInt16LE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0, 5]);

console.log(buf.readInt16LE(0));
// Печатает: 1280
console.log(buf.readInt16LE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readInt32BE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает знаковое, big-endian 32-битное целое число из `buf` по указанному `смещению`.

Целочисленные значения, считанные из `буфера`, интерпретируются как два дополнения к знаковым значениям.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0, 0, 0, 0, 5]);

console.log(buf.readInt32BE(0));
// Печатает: 5
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0, 0, 0, 0, 5]);

console.log(buf.readInt32BE(0));
// Печатает: 5
```

### `buf.readInt32LE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает знаковое, little-endian 32-битное целое число из `buf` по указанному `смещению`.

Целочисленные значения, считанные из `буфера`, интерпретируются как два дополнения к знаковым значениям.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0, 0, 0, 0, 5]);

console.log(buf.readInt32LE(0));
// Печатает: 83886080
console.log(buf.readInt32LE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0, 0, 0, 0, 5]);

console.log(buf.readInt32LE(0));
// Печатает: 83886080
console.log(buf.readInt32LE(1));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readIntBE(offset, byteLength)`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {integer}

Считывает `byteLength` количество байт из `buf` по указанному `смещению` и интерпретирует результат как знаковое значение с большой точностью до 48 бит.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntBE(0, 6).toString(16));
// Печатает: 1234567890ab
console.log(buf.readIntBE(1, 6).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
console.log(buf.readIntBE(1, 0).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntBE(0, 6).toString(16));
// Печатает: 1234567890ab
console.log(buf.readIntBE(1, 6).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
console.log(buf.readIntBE(1, 0).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readIntLE(offset, byteLength)`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {integer}

Считывает `byteLength` количество байт из `buf` по указанному `смещению` и интерпретирует результат как знаковое значение с точностью до 48 бит.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntLE(0, 6).toString(16));
// Печатает: -546f87a9cbee
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readIntLE(0, 6).toString(16));
// Печатает: -546f87a9cbee
```

### `buf.readUInt8([offset])`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает беззнаковое 8-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readUint8`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([1, -2]);

console.log(buf.readUInt8(0));
// Печатает: 1
console.log(buf.readUInt8(1));
// Печатается: 254
console.log(buf.readUInt8(2));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([1, -2]);

console.log(buf.readUInt8(0));
// Печатает: 1
console.log(buf.readUInt8(1));
// Печатается: 254
console.log(buf.readUInt8(2));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readUInt16BE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает беззнаковое, big-endian 16-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readUint16BE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16BE(0).toString(16));
// Печатает: 1234
console.log(buf.readUInt16BE(1).toString(16));
// Печатает: 3456
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16BE(0).toString(16));
// Печатает: 1234
console.log(buf.readUInt16BE(1).toString(16));
// Печатает: 3456
```

### `buf.readUInt16LE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает беззнаковое, little-endian 16-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readUint16LE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16LE(0).toString(16));
// Печатает: 3412
console.log(buf.readUInt16LE(1).toString(16));
// Печатает: 5634
console.log(buf.readUInt16LE(2).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0x12, 0x34, 0x56]);

console.log(buf.readUInt16LE(0).toString(16));
// Печатает: 3412
console.log(buf.readUInt16LE(1).toString(16));
// Печатает: 5634
console.log(buf.readUInt16LE(2).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readUInt32BE([offset])`

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает беззнаковое, big-endian 32-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readUint32BE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32BE(0).toString(16));
// Печатает: 12345678
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32BE(0).toString(16));
// Печатает: 12345678
```

### `buf.readUInt32LE([offset])`

- `offset` {целое число} Количество байт, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число}

Читает беззнаковое, little-endian 32-битное целое число из `buf` по указанному `смещению`.

Эта функция также доступна под псевдонимом `readUint32LE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32LE(0).toString(16));
// Печатает: 78563412
console.log(buf.readUInt32LE(1).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

console.log(buf.readUInt32LE(0).toString(16));
// Печатает: 78563412
console.log(buf.readUInt32LE(1).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readUIntBE(offset, byteLength)`.

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {integer}

Считывает `byteLength` количество байт из `buf` по указанному `смещению` и интерпретирует результат как целое число без знака big-endian, поддерживающее точность до 48 бит.

Эта функция также доступна под псевдонимом `readUintBE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readUIntBE(0, 6).toString(16));
// Печатает: 1234567890ab
console.log(buf.readUIntBE(1, 6).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from([
  0x12,
  0x34,
  0x56,
  0x78,
  0x90,
  0xab,
]);

console.log(buf.readUIntBE(0, 6).toString(16));
// Печатает: 1234567890ab
console.log(buf.readUIntBE(1, 6).toString(16));
// Выбрасывает ERR_OUT_OF_RANGE.
```

### `buf.readUIntLE(offset, byteLength)`.

- `offset` {целое число} Количество байтов, которые нужно пропустить перед началом чтения. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для чтения. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {integer}

Считывает `byteLength` количество байт из `buf` по указанному `смещению` и интерпретирует результат как беззнаковое, little-endian целое число, поддерживающее точность до 48 бит.

Эта функция также доступна под псевдонимом `readUintLE`.

```mjs
import { Buffer } from 'node:buffer';

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
const { Buffer } = require('node:buffer');

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

- `start` {целое число} С чего будет начинаться новый `буфер`. **По умолчанию:** `0`.
- `end` {целое число} Где закончится новый `буфер` (не включительно). **По умолчанию:** [`buf.length`](#buflength).
- Возвращает: {Буфер}

Возвращает новый `Буфер`, который ссылается на ту же память, что и исходный, но смещен и обрезан по индексам `start` и `end`.

Указание `end` больше чем [`buf.length`](#buflength) вернет тот же результат, что и `end` равный [`buf.length`](#buflength).

Этот метод унаследован от [`TypedArray.prototype.subarray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray).

Модификация нового фрагмента `Buffer` приведет к изменению памяти в исходном `Buffer`, поскольку выделенная память двух объектов перекрывается.

```mjs
import { Buffer } from 'node:buffer';

// Создаем `Буфер` с алфавитом ASCII, берем фрагмент и модифицируем один байт
// из исходного `Буфера`.

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное значение ASCII для 'a'.
  buf1[i] = i + 97;
}

const buf2 = buf1.subarray(0, 3);

console.log(buf2.toString('ascii', 0, buf2.length));
// Печатается: abc

buf1[0] = 33;

console.log(buf2.toString('ascii', 0, buf2.length));
// Prints: !bc
```

```cjs
const { Buffer } = require('node:buffer');

// Создаем `Буфер` с алфавитом ASCII, берем кусочек и модифицируем один байт
// из исходного `Буфера`.

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное значение ASCII для 'a'.
  buf1[i] = i + 97;
}

const buf2 = buf1.subarray(0, 3);

console.log(buf2.toString('ascii', 0, buf2.length));
// Печатается: abc

buf1[0] = 33;

console.log(buf2.toString('ascii', 0, buf2.length));
// Prints: !bc
```

Указание отрицательных индексов заставляет генерировать фрагмент относительно конца `buf`, а не начала.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('buffer');

console.log(buf.subarray(-6, -1).toString());
// Печатает: buffe
// (Эквивалентно buf.subarray(0, 5)).

console.log(buf.subarray(-6, -2).toString());
// Печатает: buff
// (Эквивалентно buf.subarray(0, 4)).

console.log(buf.subarray(-5, -2).toString());
// Печатает: uff
// (Эквивалентно buf.subarray(1, 4).)
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('buffer');

console.log(buf.subarray(-6, -1).toString());
// Печатает: buffe
// (Эквивалентно buf.subarray(0, 5)).

console.log(buf.subarray(-6, -2).toString());
// Печатает: buff
// (Эквивалентно buf.subarray(0, 4)).

console.log(buf.subarray(-5, -2).toString());
// Печатает: uff
// (Эквивалентно buf.subarray(1, 4).)
```

### `buf.slice([start[, end]])`

- `start` {целое число} Место начала нового `буфера`. **По умолчанию:** `0`.
- `end` {целое число} Где закончится новый `буфер` (не включительно). **По умолчанию:** [`buf.length`](#buflength).
- Возвращает: {Буфер}

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого используйте `buf.subarray`.

Возвращает новый `Буфер`, который ссылается на ту же память, что и оригинал, но смещен и обрезан по индексам `start` и `end`.

Этот метод не совместим с `Uint8Array.prototype.slice()`, который является суперклассом `Buffer`. Чтобы скопировать срез, используйте `Uint8Array.prototype.slice()`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('buffer');

const copiedBuf = Uint8Array.prototype.slice.call(buf);
copiedBuf[0]++;
console.log(copiedBuf.toString());
// Опечатки: cuffer

console.log(buf.toString());
// Печатает: буфер

// С помощью buf.slice() исходный буфер модифицируется.
const notReallyCopiedBuf = buf.slice();
notReallyCopiedBuf[0]++;
console.log(notReallyCopiedBuf.toString());
// Опечатки: cuffer
console.log(buf.toString());
// Также печатает: cuffer (!)
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('buffer');

const copiedBuf = Uint8Array.prototype.slice.call(buf);
copiedBuf[0]++;
console.log(copiedBuf.toString());
// Опечатки: cuffer

console.log(buf.toString());
// Печатает: буфер

// С помощью buf.slice() исходный буфер модифицируется.
const notReallyCopiedBuf = buf.slice();
notReallyCopiedBuf[0]++;
console.log(notReallyCopiedBuf.toString());
// Опечатки: cuffer
console.log(buf.toString());
// Также печатает: cuffer (!)
```

### `buf.swap16()`

- Возвращает: {Буфер} Ссылка на `buf`.

Интерпретирует `buf` как массив беззнаковых 16-битных целых чисел и меняет порядок байтов _на месте_. Выбрасывает [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size), если [`buf.length`](#buflength) не кратно 2.

```mjs
import { Buffer } from 'node:buffer';

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
// Печатает: <Буфер 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// Печатает: <Буфер 02 01 04 03 04 05 06 08 07>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap16();
// Выбрасывает ERR_INVALID_BUFFER_SIZE.
```

```cjs
const { Buffer } = require('node:buffer');

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
// Печатает: <Буфер 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// Печатает: <Буфер 02 01 04 03 04 05 06 08 07>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap16();
// Выбрасывает ERR_INVALID_BUFFER_SIZE.
```

Одним из удобных применений `buf.swap16()` является быстрое преобразование на месте между UTF-16 little-endian и UTF-16 big-endian:

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from(
  'Это little-endian UTF-16',
  'utf16le'
);
buf.swap16(); // Преобразование в big-endian UTF-16 текст.
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from(
  'This is little-endian UTF-16',
  'utf16le'
);
buf.swap16(); // Преобразуем текст в big-endian UTF-16.
```

### `buf.swap32()`

- Возвращает: {Буфер} Ссылка на `buf`.

Интерпретирует `buf` как массив беззнаковых 32-битных целых чисел и меняет порядок байтов _на месте_. Выбрасывает [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size), если [`buf.length`](#buflength) не кратно 4.

```mjs
import { Buffer } from 'node:buffer';

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
// Печатает: <Буфер 01 02 03 04 05 06 07 08>

buf1.swap32();

console.log(buf1);
// Печатает: <Буфер 04 03 02 01 08 07 06 05>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap32();
// Выбрасывает ERR_INVALID_BUFFER_SIZE.
```

```cjs
const { Buffer } = require('node:buffer');

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
// Печатает: <Буфер 01 02 03 04 05 06 07 08>

buf1.swap32();

console.log(buf1);
// Печатает: <Буфер 04 03 02 01 08 07 06 05>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap32();
// Выбрасывает ERR_INVALID_BUFFER_SIZE.
```

### `buf.swap64()`

- Возвращает: {Buffer} Ссылка на `buf`.

Интерпретирует `buf` как массив 64-битных чисел и меняет порядок байтов _на месте_. Выбрасывает [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size), если [`buf.length`](#buflength) не кратен 8.

```mjs
import { Buffer } from 'node:buffer';

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
// Печатает: <Буфер 01 02 03 04 05 06 07 08>

buf1.swap64();

console.log(buf1);
// Печатает: <Буфер 08 07 06 05 04 03 02 01>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap64();
// Выбрасывает ERR_INVALID_BUFFER_SIZE.
```

```cjs
const { Buffer } = require('node:buffer');

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
// Печатает: <Буфер 01 02 03 04 05 06 07 08>

buf1.swap64();

console.log(buf1);
// Печатает: <Буфер 08 07 06 05 04 03 02 01>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap64();
// Выбрасывает ERR_INVALID_BUFFER_SIZE.
```

### `buf.toJSON()`

- Возвращает: {Object}

Возвращает JSON-представление `buf`. [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) неявно вызывает эту функцию при структурировании экземпляра `Buffer`.

`Buffer.from()` принимает объекты в формате, возвращаемом этим методом. В частности, `Buffer.from(buf.toJSON())` работает как `Buffer.from(buf)`.

```mjs
import { Buffer } from 'node:buffer';

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
// Печатает: <Буфер 01 02 03 04 05>
```

```cjs
const { Buffer } = require('node:buffer');

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
// Печатает: <Буфер 01 02 03 04 05>
```

### `buf.toString([encoding[, start[, end]]])`

- `encoding` {string} Используемая кодировка символов. **По умолчанию:** `'utf8'`.
- `start` {integer} Смещение байта, с которого следует начать декодирование. **По умолчанию:** `0`.
- `end` {целое число} Смещение байта для остановки декодирования (не включительно). **По умолчанию:** [`buf.length`](#buflength).
- Возвращает: {string}

Декодирует `buf` в строку в соответствии с указанной кодировкой символов в `encoding`. Можно передать `start` и `end`, чтобы декодировать только часть `buf`.

Если `encoding` имеет значение `'utf8'` и последовательность байтов во входных данных не является правильной UTF-8, то каждый неправильный байт заменяется символом замены `U+FFFD`.

Максимальная длина экземпляра строки (в единицах кода UTF-16) доступна как [`buffer.constants.MAX_STRING_LENGTH`](#bufferconstantsmax_string_length).

```mjs
import { Buffer } from 'node:buffer';

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное ASCII значение для 'a'.
  buf1[i] = i + 97;
}

console.log(buf1.toString('utf8'));
// Печать: abcdefghijklmnopqrstuvwxyz
console.log(buf1.toString('utf8', 0, 5));
// Печатается: abcde

const buf2 = Buffer.from('tést');

console.log(buf2.toString('hex'));
// Печатается: 74c3a97374
console.log(buf2.toString('utf8', 0, 3));
// Печатает: té
console.log(buf2.toString(undefined, 0, 3));
// Печатает: té
```

```cjs
const { Buffer } = require('node:buffer');

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 - это десятичное ASCII значение для 'a'.
  buf1[i] = i + 97;
}

console.log(buf1.toString('utf8'));
// Печать: abcdefghijklmnopqrstuvwxyz
console.log(buf1.toString('utf8', 0, 5));
// Печатается: abcde

const buf2 = Buffer.from('tést');

console.log(buf2.toString('hex'));
// Печатается: 74c3a97374
console.log(buf2.toString('utf8', 0, 3));
// Печатает: té
console.log(buf2.toString(undefined, 0, 3));
// Печатает: té
```

### `buf.values()`

- Возвращает: {Итератор}

Создает и возвращает [итератор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) для значений `buf` (байтов). Эта функция вызывается автоматически, когда `Buffer` используется в операторе `for..of`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.from('buffer');

for (const value of buf.values()) {
  console.log(value);
}
// Печатает:
// 98
// 117
// 102
// 102
// 101
// 114

for (const value of buf) {
  console.log(value);
}
// Печатает:
// 98
// 117
// 102
// 102
// 101
// 114
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.from('buffer');

for (const value of buf.values()) {
  console.log(value);
}
// Печатает:
// 98
// 117
// 102
// 102
// 101
// 114

for (const value of buf) {
  console.log(value);
}
// Печатает:
// 98
// 117
// 102
// 102
// 101
// 114
```

### `buf.write(string[, offset[, length]][, encoding])`

- `string` {string} Строка для записи в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи `строки`. **По умолчанию:** `0`.
- `length` {integer} Максимальное количество байт для записи (записываемые байты не должны превышать `buf.length - offset`). **По умолчанию:** `buf.length - offset`.
- `encoding` {string} Кодировка символов `строки`. **По умолчанию:** `'utf8'`.
- Возвращает: {целое число} Количество записанных байт.

Записывает `string` в `buf` по адресу `offset` в соответствии с кодировкой символов в `encoding`. Параметр `length` - это количество байт для записи. Если `buf` не содержит достаточно места, чтобы вместить всю строку, будет записана только часть `string`. Однако частично закодированные символы не будут записаны.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.alloc(256);

const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(`${len} байт: ${buf.toString('utf8', 0, len)}`);
// Печатает: 12 байт: ½ + ¼ = ¾

const buffer = Buffer.alloc(10);

const length = buffer.write('abcd', 8);

console.log(
  `${length} bytes: ${buffer.toString('utf8', 8, 10)}`
);
// Печатает: 2 байта : ab
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.alloc(256);

const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(`${len} байт: ${buf.toString('utf8', 0, len)}`);
// Печатает: 12 байт: ½ + ¼ = ¾

const buffer = Buffer.alloc(10);

const length = buffer.write('abcd', 8);

console.log(
  `${length} bytes: ${buffer.toString('utf8', 8, 10)}`
);
// Печатает: 2 байта : ab
```

### `buf.writeBigInt64BE(value[, offset])`

- `value` {bigint} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {бесконечное число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как big-endian.

Значение `value` интерпретируется и записывается как целое знаковое число с двойным дополнением.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64BE(0x0102030405060708n, 0);

console.log(buf);
// Печатает: <Буфер 01 02 03 04 05 06 07 08>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64BE(0x0102030405060708n, 0);

console.log(buf);
// Печатает: <Буфер 01 02 03 04 05 06 07 08>
```

### `buf.writeBigInt64LE(value[, offset])`

- `value` {bigint} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {бесконечное число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian.

Значение `value` интерпретируется и записывается как целое знаковое число с двойным дополнением.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64LE(0x0102030405060708n, 0);

console.log(buf);
// Печатает: <Буфер 08 07 06 05 04 03 02 01>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64LE(0x0102030405060708n, 0);

console.log(buf);
// Печатает: <Буфер 08 07 06 05 04 03 02 01>
```

### `buf.writeBigUInt64BE(value[, offset])`

- `value` {bigint} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {бесконечное число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как big-endian.

Эта функция также доступна под псевдонимом `writeBigUint64BE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64BE(0xdecafafecacefaden, 0);

console.log(buf);
// Печатает: <Буфер de ca fa fe ca ce fa de>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64BE(0xdecafafecacefaden, 0);

console.log(buf);
// Печатает: <Буфер de ca fa fe ca ce fa de>
```

### `buf.writeBigUInt64LE(value[, offset])`

- `value` {bigint} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {бесконечное число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64LE(0xdecafafecacefaden, 0);

console.log(buf);
// Печатает: <Буфер de fa ce ca fe fa ca de>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeBigUInt64LE(0xdecafafecacefaden, 0);

console.log(buf);
// Печатает: <Буфер de fa ce ca fe fa ca de>
```

Эта функция также доступна под псевдонимом `writeBigUint64LE`.

### `buf.writeDoubleBE(value[, offset])`

- `value` {number} Число, которое будет записано в `buf`.
- `offset` {целое число} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как big-endian. Значение `value` должно быть числом JavaScript. Поведение не определено, если `значение` не является числом JavaScript.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleBE(123.456, 0);

console.log(buf);
// Печатает: <Буфер 40 5e dd 2f 1a 9f be 77>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleBE(123.456, 0);

console.log(buf);
// Печатает: <Буфер 40 5e dd 2f 1a 9f be 77>
```

### `buf.writeDoubleLE(value[, offset])`

- `value` {number} Число, которое будет записано в `buf`.
- `offset` {целое число} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian. Значение `value` должно быть числом JavaScript. Поведение не определено, если `значение` не является числом JavaScript.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleLE(123.456, 0);

console.log(buf);
// Печатает: <Буфер 77 be 9f 1a 2f dd 5e 40>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(8);

buf.writeDoubleLE(123.456, 0);

console.log(buf);
// Печатает: <Буфер 77 be 9f 1a 2f dd 5e 40>
```

### `buf.writeFloatBE(value[, offset])`

- `value` {number} Число, которое будет записано в `buf`.
- `offset` {целое число} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как big-endian. Поведение не определено, если `значение` не является числом JavaScript.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeFloatBE(0xcafebabe, 0);

console.log(buf);
// Печатает: <Буфер 4f 4a fe bb>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeFloatBE(0xcafebabe, 0);

console.log(buf);
// Печатает: <Буфер 4f 4a fe bb>
```

### `buf.writeFloatLE(value[, offset])`

- `value` {number} Число, которое будет записано в `buf`.
- `offset` {целое число} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian. Поведение не определено, если `значение` не является числом JavaScript.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeFloatLE(0xcafebabe, 0);

console.log(buf);
// Печатает: <Буфер bb fe 4a 4f>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeFloatLE(0xcafebabe, 0);

console.log(buf);
// Печатает: <Буфер bb fe 4a 4f>
```

### `buf.writeInt8(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {целое число} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению`. `Значение` должно быть правильным знаковым 8-битным целым числом. Поведение не определено, если `значение` не является знаковым 8-битным целым числом.

`value` интерпретируется и записывается как целое число с двумя знаками дополнения.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(2);

buf.writeInt8(2, 0);
buf.writeInt8(-2, 1);

console.log(buf);
// Печатает: <Буфер 02 fe>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(2);

buf.writeInt8(2, 0);
buf.writeInt8(-2, 1);

console.log(buf);
// Печатает: <Буфер 02 fe>
```

### `buf.writeInt16BE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` в порядке big-endian. Значение `value` должно быть правильным подписанным 16-битным целым числом. Поведение не определено, если `значение` не является 16-разрядным целым числом.

Значение `value` интерпретируется и записывается как целое число с двойным дополнением.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(2);

buf.writeInt16BE(0x0102, 0);

console.log(buf);
// Печатает: <Буфер 01 02>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(2);

buf.writeInt16BE(0x0102, 0);

console.log(buf);
// Печатает: <Буфер 01 02>
```

### `buf.writeInt16LE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian. Значение `value` должно быть правильным подписанным 16-битным целым числом. Поведение не определено, если `значение` не является значащим 16-битным целым числом.

Значение `value` интерпретируется и записывается как целое число с двойным дополнением.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(2);

buf.writeInt16LE(0x0304, 0);

console.log(buf);
// Печатает: <Буфер 04 03>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(2);

buf.writeInt16LE(0x0304, 0);

console.log(buf);
// Печатает: <Буфер 04 03>
```

### `buf.writeInt32BE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` в порядке big-endian. Значение `value` должно быть правильным знаковым 32-битным целым числом. Поведение не определено, если `значение` не является знаковым 32-битным целым числом.

Значение `value` интерпретируется и записывается как знаковое целое число с двойным дополнением.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeInt32BE(0x01020304, 0);

console.log(buf);
// Печатает: <Буфер 01 02 03 04>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeInt32BE(0x01020304, 0);

console.log(buf);
// Печатает: <Буфер 01 02 03 04>
```

### `buf.writeInt32LE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian. Значение `value` должно быть правильным знаковым 32-битным целым числом. Поведение не определено, если `значение` не является знаковым 32-битным целым числом.

Значение `value` интерпретируется и записывается как знаковое целое число с двойным дополнением.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeInt32LE(0x05060708, 0);

console.log(buf);
// Печатает: <Буфер 08 07 06 05>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeInt32LE(0x05060708, 0);

console.log(buf);
// Печатает: <Буфер 08 07 06 05>
```

### `buf.writeIntBE(value, offset, byteLength)`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байтов, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {бесконечное число} `смещение` плюс количество записанных байт.

Записывает `byteLength` байт `значения` в `buf` по указанному `смещению` как big-endian. Поддерживает точность до 48 бит. Поведение не определено, если `значение` не является знаковым целым числом.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер 12 34 56 78 90 ab>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер 12 34 56 78 90 ab>
```

### `buf.writeIntLE(value, offset, byteLength)`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байтов, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {бесконечное число} `смещение` плюс количество записанных байт.

Записывает `byteLength` байт `значения` в `buf` по указанному `смещению` как little-endian. Поддерживает точность до 48 бит. Поведение не определено, если `значение` не является знаковым целым числом.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер ab 90 78 56 34 12>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер ab 90 78 56 34 12>
```

### `buf.writeUInt8(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению`. `Значение` должно быть правильным беззнаковым 8-битным целым числом. Поведение функции не определено, если `значение` не является беззнаковым 8-битным целым числом.

Эта функция также доступна под псевдонимом `writeUint8`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt8(0x3, 0);
buf.writeUInt8(0x4, 1);
buf.writeUInt8(0x23, 2);
buf.writeUInt8(0x42, 3);

console.log(buf);
// Печатает: <Буфер 03 04 23 42>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt8(0x3, 0);
buf.writeUInt8(0x4, 1);
buf.writeUInt8(0x23, 2);
buf.writeUInt8(0x42, 3);

console.log(buf);
// Печатает: <Буфер 03 04 23 42>
```

### `buf.writeUInt16BE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` в порядке big-endian. Значение `value` должно быть правильным беззнаковым 16-битным целым числом. Поведение не определено, если `значение` не является беззнаковым 16-битным целым числом.

Эта функция также доступна под псевдонимом `writeUint16BE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16BE(0xdead, 0);
buf.writeUInt16BE(0xbeef, 2);

console.log(buf);
// Печатает: <Буфер de ad be ef>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16BE(0xdead, 0);
buf.writeUInt16BE(0xbeef, 2);

console.log(buf);
// Печатает: <Буфер de ad be ef>
```

### `buf.writeUInt16LE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian. Значение `value` должно быть правильным беззнаковым 16-битным целым числом. Поведение не определено, если `значение` не является беззнаковым 16-битным целым числом.

Эта функция также доступна под псевдонимом `writeUint16LE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16LE(0xdead, 0);
buf.writeUInt16LE(0xbeef, 2);

console.log(buf);
// Печатает: <Буфер ad de ef be>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt16LE(0xdead, 0);
buf.writeUInt16LE(0xbeef, 2);

console.log(buf);
// Печатает: <Буфер ad de ef be>
```

### `buf.writeUInt32BE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` в порядке big-endian. Значение `value` должно быть правильным беззнаковым 32-битным целым числом. Поведение функции не определено, если `значение` не является беззнаковым 32-битным целым числом.

Эта функция также доступна под псевдонимом `writeUint32BE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32BE(0xfeedface, 0);

console.log(buf);
// Печатает: <Buffer fe ed fa ce>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32BE(0xfeedface, 0);

console.log(buf);
// Печатает: <Buffer fe ed fa ce>
```

### `buf.writeUInt32LE(value[, offset])`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байт, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
- Возвращает: {целое число} `offset` плюс количество записанных байт.

Записывает `значение` в `buf` по указанному `смещению` как little-endian. Значение `value` должно быть правильным беззнаковым 32-битным целым числом. Поведение функции не определено, если `значение` не является беззнаковым 32-битным целым числом.

Эта функция также доступна под псевдонимом `writeUint32LE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32LE(0xfeedface, 0);

console.log(buf);
// Печатает: <Buffer ce fa ed fe>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(4);

buf.writeUInt32LE(0xfeedface, 0);

console.log(buf);
// Печатает: <Buffer ce fa ed fe>
```

### `buf.writeUIntBE(value, offset, byteLength)`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байтов, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {бесконечное число} `смещение` плюс количество записанных байт.

Записывает `byteLength` байт `значения` в `buf` по указанному `смещению` как big-endian. Поддерживает точность до 48 бит. Поведение не определено, если `значение` не является целым числом без знака.

Эта функция также доступна под псевдонимом `writeUintBE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeUIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер 12 34 56 78 90 ab>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeUIntBE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер 12 34 56 78 90 ab>
```

### `buf.writeUIntLE(value, offset, byteLength)`

- `value` {integer} Число, которое будет записано в `buf`.
- `offset` {integer} Количество байтов, которое нужно пропустить перед началом записи. Должно удовлетворять условию `0 <= offset <= buf.length - byteLength`.
- `byteLength` {integer} Количество байтов для записи. Должно удовлетворять `0 < byteLength <= 6`.
- Возвращает: {бесконечное число} `смещение` плюс количество записанных байт.

Записывает `byteLength` байт `значения` в `buf` по указанному `смещению` как little-endian. Поддерживает точность до 48 бит. Поведение не определено, если `значение` не является целым числом без знака.

Эта функция также доступна под псевдонимом `writeUintLE`.

```mjs
import { Buffer } from 'node:buffer';

const buf = Buffer.allocUnsafe(6);

buf.writeUIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер ab 90 78 56 34 12>
```

```cjs
const { Buffer } = require('node:buffer');

const buf = Buffer.allocUnsafe(6);

buf.writeUIntLE(0x1234567890ab, 0, 6);

console.log(buf);
// Печатает: <Буфер ab 90 78 56 34 12>
```

### `new Buffer(array)`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте `Buffer.from(array)` вместо этого.

- `array` {integer\[\]} Массив байтов для копирования.

См. `Buffer.from(array)`.

### `new Buffer(arrayBuffer[, byteOffset[, length]])`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте `Buffer.from(arrayBuffer[, byteOffset[, length]])` вместо этого.

- `arrayBuffer` {ArrayBuffer|SharedArrayBuffer} [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) или свойство `.buffer` из [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).
- `byteOffset` {integer} Индекс первого байта для раскрытия. **По умолчанию:** `0`.
- `length` {integer} Количество байтов для раскрытия. **По умолчанию:** `arrayBuffer.byteLength - byteOffset`.

См. `Buffer.from(arrayBuffer[, byteOffset[, length]])`.

### `new Buffer(buffer)`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте `Buffer.from(buffer)` вместо этого.

- `buffer` {Buffer|Uint8Array} Существующий `Buffer` или [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), из которого нужно скопировать данные.

См. `Buffer.from(buffer)`.

### `new Buffer(size)`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте `Buffer.alloc()` вместо этого (также смотрите `Buffer.allocUnsafe()`).

- `size` {целое число} Желаемая длина нового `буфера`.

См. `Buffer.alloc()` и `Buffer.allocUnsafe()`. Этот вариант конструктора эквивалентен `Buffer.alloc()`.

### `new Buffer(string[, encoding])`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте `Buffer.from(string[, encoding])` вместо этого.

- `string` {string} Строка для кодирования.
- `encoding` {string} Кодировка `string`. **По умолчанию:** `'utf8'`.

См. `Buffer.from(string[, encoding])`.

## Класс: `File`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- Расширяет: {Blob}

[`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) предоставляет информацию о файлах.

### `новый буфер.File(sources, fileName[, options])`

- `sources` {string\[\]|ArrayBuffer\[\]|TypedArray\[\]|DataView\[\]|Blob\[\]|File\[\]} Массив объектов string, {ArrayBuffer}, {TypedArray}, {DataView}, {File} или {Blob}, или любая смесь таких объектов, которые будут храниться в `файле`.
- `fileName` {string} Имя файла.
- `options` {Object}
  - `endings` {string} Одно из значений `'transparent'` или `'native'`. Если установлено значение `'native'`, окончания строк в строковых исходных частях будут преобразованы к родному для платформы окончанию строк, как указано в `require('node:os').EOL`.
  - `type` {string} Тип содержимого файла.
  - `lastModified` {number} Дата последнего изменения файла. **По умолчанию:** `Date.now()`.

### `file.name`

- Тип: {строка}

Имя `файла`.

### `file.lastModified`

- Тип: {число}

Дата последнего изменения `файла`.

## API модуля `node:buffer`

Хотя объект `Buffer` доступен как глобальный, существуют дополнительные API, связанные с `Buffer`, которые доступны только через модуль `node:buffer`, доступ к которому осуществляется с помощью `require('node:buffer')`.

### `buffer.atob(data)`

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте `Buffer.from(data, 'base64')`.

- `data` {любой} Входная строка в Base64-кодировке.

Декодирует строку данных в Base64-кодировке в байты и кодирует эти байты в строку с использованием Latin-1 (ISO-8859-1).

В качестве `данных` может выступать любое JavaScript-значение, которое может быть преобразовано в строку.

**Эта функция предоставляется только для совместимости с устаревшими API веб-платформ и никогда не должна использоваться в новом коде, поскольку они используют строки для представления двоичных данных и предшествуют внедрению типизированных массивов в JavaScript. Для кода, работающего с использованием API Node.js, преобразование между строками в кодировке base64 и двоичными данными должно выполняться с помощью `Buffer.from(str, 'base64')` и `buf.toString('base64')`**.

### `buffer.btoa(data)`

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте `buf.toString('base64')`.

- `data` {любой} Строка ASCII (Latin1).

Декодирует строку в байты, используя Latin-1 (ISO-8859), и кодирует эти байты в строку, используя Base64.

В качестве `data` может выступать любое JavaScript-значение, которое может быть преобразовано в строку.

**Эта функция предоставляется только для совместимости с устаревшими API веб-платформ и никогда не должна использоваться в новом коде, поскольку они используют строки для представления двоичных данных и предшествуют внедрению типизированных массивов в JavaScript. Для кода, работающего с использованием API Node.js, преобразование между строками в кодировке base64 и двоичными данными должно выполняться с помощью `Buffer.from(str, 'base64')` и `buf.toString('base64')`.**.

### `buffer.isAscii(input)`

- input {Buffer | ArrayBuffer | TypedArray} Входные данные для проверки.
- Возвращает: {boolean}

Эта функция возвращает `true`, если `input` содержит только правильные данные в ASCII-кодировке, включая случай, когда `input` пуст.

Выбрасывается, если `input` является отделенным буфером массива.

### `buffer.isUtf8(input)`

- input {Buffer | ArrayBuffer | TypedArray} Входные данные для проверки.
- Возвращает: {boolean}

Эта функция возвращает `true`, если `input` содержит только правильные данные в кодировке UTF-8, включая случай, когда `input` пуст.

Выбрасывается, если `input` является отделенным буфером массива.

### `buffer.INSPECT_MAX_BYTES`

- {целое число} **По умолчанию:** `50`.

Возвращает максимальное количество байт, которое будет возвращено при вызове `buf.inspect()`. Это значение может быть переопределено пользовательскими модулями. Смотрите [`util.inspect()`](util.md#utilinspectobject-options) для более подробной информации о поведении `buf.inspect()`.

### `buffer.kMaxLength`

- {целое число} Наибольший размер, допустимый для одного экземпляра `Buffer`.

Псевдоним для [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length).

### `buffer.kStringMaxLength`

- {целое число} Наибольшая длина, допустимая для одного экземпляра `string`.

Псевдоним для [`buffer.constants.MAX_STRING_LENGTH`](#bufferconstantsmax_string_length).

### `buffer.resolveObjectURL(id)`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- `id` {string} Строка URL `'blob:nodedata:...`, возвращенная предыдущим вызовом `URL.createObjectURL()`.
- Возвращает: {Blob}

Разрешает `'blob:nodedata:...'` связанный объект {Blob}, зарегистрированный с помощью предыдущего вызова `URL.createObjectURL()`.

### `buffer.transcode(source, fromEnc, toEnc)`

- `source` {Buffer|Uint8Array} Экземпляр `буфера` или `Uint8Array`.
- `fromEnc` {string} Текущая кодировка.
- `toEnc` {string} Целевая кодировка.
- Возвращает: {Buffer}

Перекодирует заданный экземпляр `Buffer` или `Uint8Array` из одной кодировки в другую. Возвращает новый экземпляр `Buffer`.

Выбрасывается, если в `fromEnc` или `toEnc` указаны неверные кодировки символов или если преобразование из `fromEnc` в `toEnc` недопустимо.

Кодировки, поддерживаемые `buffer.transcode()`, следующие: `ascii`, `utf8`, `utf16le`, `ucs2`, `latin1` и `binary`.

Процесс транскодирования будет использовать подстановочные символы, если заданная последовательность байтов не может быть адекватно представлена в целевой кодировке. Например:

```mjs
import { Buffer, transcode } from 'node:buffer';

const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
console.log(newBuf.toString('ascii'));
// Печатает: '?'
```

```cjs
const { Buffer, transcode } = require('node:buffer');

const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
console.log(newBuf.toString('ascii'));
// Печатает: '?'
```

Поскольку знак евро (`€`) не может быть представлен в US-ASCII, он заменяется на `?` в транскодированном `буфере`.

### Класс: `SlowBuffer`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) вместо этого.

См. `Buffer.allocUnsafeSlow()`. Это никогда не был класс в том смысле, что конструктор всегда возвращал экземпляр `Buffer`, а не экземпляр `SlowBuffer`.

#### `new SlowBuffer(size)`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Используйте [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) вместо этого.

- `size` {integer} Желаемая длина нового `SlowBuffer`.

См. `Buffer.allocUnsafeSlow()`.

### Буферные константы

#### `buffer.constants.MAX_LENGTH`

- {integer} Наибольший размер, допустимый для одного экземпляра `Buffer`.

На 32-битных архитектурах это значение в настоящее время составляет 2<sup>30</sup> - 1 (около 1 GiB).

На 64-битных архитектурах это значение в настоящее время составляет 2<sup>32</sup> (около 4 GiB).

Он отражает [`v8::TypedArray::kMaxLength`](https://v8.github.io/api/head/classv8_1_1TypedArray.html#a54a48f4373da0850663c4393d843b9b0) под капотом.

Это значение также доступно как [`buffer.kMaxLength`](#bufferkmaxlength).

#### `buffer.constants.MAX_STRING_LENGTH`

- {целое число} Наибольшая длина, допустимая для одного экземпляра `строки`.

Представляет собой наибольшую `длину`, которую может иметь примитив `строка`, подсчитанную в единицах кода UTF-16.

Это значение может зависеть от используемого JS-движка.

## `Buffer.from()`, `Buffer.alloc()` и `Buffer.allocUnsafe()`

В версиях Node.js до 6.0.0 экземпляры `Buffer` создавались с помощью функции конструктора `Buffer`, которая распределяет возвращаемый `Buffer` по-разному в зависимости от того, какие аргументы были предоставлены:

- Передача числа в качестве первого аргумента в `Buffer()` (например, `new Buffer(10)`) выделяет новый объект `Buffer` указанного размера. До версии Node.js 8.0.0 память, выделенная для таких экземпляров `Buffer`, _не_ инициализируется и _может содержать конфиденциальные данные_. Такие экземпляры `Buffer` _должны_ быть впоследствии инициализированы с помощью [`buf.fill(0)`](#buffillvalue-offset-end-encoding) или путем записи во весь `Buffer` перед чтением данных из `Buffer`. Хотя такое поведение _преднамеренно_ направлено на повышение производительности, опыт разработки показал, что требуется более явное различие между созданием быстрого, но неинициализированного `Буфера` и созданием более медленного, но безопасного `Буфера`. Начиная с Node.js 8.0.0, `Buffer(num)` и `new Buffer(num)` возвращают `Buffer` с инициализированной памятью.
- Передача строки, массива или `Buffer` в качестве первого аргумента копирует данные переданного объекта в `Buffer`.
- Передача [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) возвращает `Буфер`, который делит выделенную память с данным буфером массива.

Поскольку поведение `new Buffer()` отличается в зависимости от типа первого аргумента, проблемы безопасности и надежности могут быть непреднамеренно внесены в приложения, когда не выполняется проверка аргументов или инициализация `Buffer`.

Например, если злоумышленник может заставить приложение получить число, когда ожидается строка, приложение может вызвать `new Buffer(100)` вместо `new Buffer("100")`, что приведет к выделению 100-байтного буфера вместо выделения 3-байтного буфера с содержимым `"100"`. Это обычно возможно при использовании вызовов JSON API. Поскольку JSON различает числовые и строковые типы, он позволяет вводить числа там, где наивно написанное приложение, которое не проверяет свой ввод в достаточной степени, могло бы ожидать всегда получать строку. До версии Node.js 8.0.0 100-байтовый буфер мог содержать произвольные данные в памяти, поэтому его можно было использовать для раскрытия секретов памяти удаленному злоумышленнику. Начиная с Node.js 8.0.0.0, раскрытие памяти невозможно, поскольку данные заполняются нулями. Однако другие атаки все еще возможны, например, заставить сервер выделять очень большие буферы, что приведет к снижению производительности или аварийному завершению работы при исчерпании памяти.

Чтобы сделать создание экземпляров `Buffer` более надежным и менее подверженным ошибкам, различные формы конструктора `new Buffer()` были **удалены** и заменены отдельными методами `Buffer.from()`, `Buffer.alloc()` и `Buffer.allocUnsafe()`.

_Разработчикам следует перенести все существующие варианты использования конструкторов `new Buffer()` на один из этих новых API._

- `Buffer.from(array)` возвращает новый `Buffer`, который _содержит копию_ предоставленных октетов.
- `Buffer.from(arrayBuffer[, byteOffset[, length]]]` возвращает новый `Буфер`, который _разделяет ту же выделенную память_, что и данный [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).
- `Buffer.from(buffer)` возвращает новый `Buffer`, который _содержит копию_ содержимого данного `Buffer`.
- `Buffer.from(string[, encoding])` возвращает новый `Буфер`, который _содержит копию_ предоставленной строки.
- `Buffer.alloc(size[, fill[, encoding]])` возвращает новый инициализированный `Буфер` указанного размера. Этот метод медленнее, чем `Buffer.allocUnsafe(size)`, но гарантирует, что вновь созданные экземпляры `Buffer` никогда не будут содержать старые данные, которые потенциально могут быть конфиденциальными. Если `size` не является числом, будет выдана ошибка `TypeError`.
- `Buffer.allocUnsafe(size)` и `Buffer.allocUnsafeSlow(size)` каждый возвращает новый неинициализированный `Буфер` указанного `size`. Поскольку `Буфер` является неинициализированным, выделенный участок памяти может содержать старые данные, которые потенциально могут быть конфиденциальными.

Экземпляры `Буфера`, возвращаемые `Buffer.allocUnsafe()` и `Buffer.from(array)` _могут_ быть выделены из общего внутреннего пула памяти, если `size` меньше или равен половине `Buffer.poolSize`. Экземпляры, возвращаемые `Buffer.allocUnsafeSlow()` _никогда_ не используют общий внутренний пул памяти.

### Опция командной строки `--zero-fill-buffers`

Node.js может быть запущен с использованием опции командной строки `--zero-fill-buffers`, чтобы все вновь выделенные экземпляры `Buffer` по умолчанию заполнялись нулями при создании. Без этой опции буферы, созданные с помощью `Buffer.allocUnsafe()`, `Buffer.allocUnsafeSlow()` и `new SlowBuffer(size)` не заполняются нулем. Использование этого флага может оказать ощутимое негативное влияние на производительность. Используйте опцию `--zero-fill-buffers` только в случае необходимости, чтобы убедиться, что вновь выделенные экземпляры `Buffer` не могут содержать старые данные, которые являются потенциально конфиденциальными.

```console
$ node --zero-fill-buffers
> Buffer.allocUnsafe(5);
<Buffer 00 00 00 00 00>
```

### Что делает `Buffer.allocUnsafe()` и `Buffer.allocUnsafeSlow()` "небезопасными"?

При вызове `Buffer.allocUnsafe()` и `Buffer.allocUnsafeSlow()` сегмент выделенной памяти _неинициализируется_ (не обнуляется). Хотя такая конструкция делает выделение памяти довольно быстрым, выделенный сегмент памяти может содержать старые данные, которые потенциально могут быть конфиденциальными. Использование `буфера`, созданного с помощью `Buffer.allocUnsafe()` без _полной_ перезаписи памяти, может привести к утечке этих старых данных при чтении памяти `буфера`.

Хотя использование `Buffer.allocUnsafe()` имеет очевидные преимущества в производительности, необходимо соблюдать особую осторожность, чтобы избежать появления уязвимостей в безопасности приложения.
