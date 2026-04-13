---
title: Buffer
description: Объекты Buffer представляют последовательность байтов фиксированной длины
---

# Буфер

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/buffer.html)

<!--introduced_in=v0.1.90-->

!!!success "Стабильность: 2 – Стабильная"

    Совместимость с экосистемой npm имеет высокий приоритет.

<!-- source_link=lib/buffer.js -->

Объекты `Buffer` используются для представления последовательности байтов фиксированной длины. Многие API Node.js поддерживают `Buffer`.

Класс `Buffer` — подкласс встроенного в JavaScript типа [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) и расширяет его методами для дополнительных сценариев. API Node.js принимают обычные [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) везде, где поддерживаются и `Buffer`.

Хотя класс `Buffer` доступен в глобальной области видимости, рекомендуется явно ссылаться на него через `import` или `require`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.7.0, v14.18.0 | Введена кодировка base64url. |
    | v6.4.0 | Введено `latin1` как псевдоним для `binary`. |
    | v5.0.0 | Удалены устаревшие кодировки `raw` и `raws`. |

При преобразовании между `Buffer` и строками может быть указана кодировка символов. Если кодировка не указана, по умолчанию используется UTF-8.

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

Буферы Node.js принимают любые варианты регистра в строках кодировок, которые им передают. Например, UTF-8 можно указать как `'utf8'`, `'UTF8'` или `'uTf8'`.

В настоящее время Node.js поддерживает следующие кодировки символов:

-   `'utf8'` (псевдоним: `'utf-8'`): многобайтовое кодирование символов Unicode. Многие веб-страницы и другие форматы документов используют [UTF-8](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#encoding). Это кодировка по умолчанию. При декодировании `Buffer` в строку, которая не содержит только корректных данных UTF-8, для обозначения ошибок используется символ замены Unicode `U+FFFD` `�`.

-   `'utf16le'` (псевдоним: `'utf-16le'`): многобайтовое кодирование символов Unicode. В отличие от `'utf8'`, каждый символ строки кодируется 2 или 4 байтами. Node.js поддерживает только младший порядок байтов([endianness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#Endianness)) для [UTF-16](https://en.wikipedia.org/wiki/UTF-16).

-   `'latin1'`: Latin-1 соответствует [ISO-8859-1](https://en.wikipedia.org/wiki/ISO-8859-1). Эта кодировка поддерживает только символы Unicode от `U+0000` до `U+00FF`. Каждый символ кодируется одним байтом. Символы вне этого диапазона усекаются и отображаются на символы из него.

Преобразование `Buffer` в строку одним из перечисленных способов называется декодированием, а преобразование строки в `Buffer` — кодированием.

Node.js также поддерживает следующие двоично-текстовые кодировки. Для них соглашение об именовании обратное: преобразование `Buffer` в строку обычно называют кодированием, а строки в `Buffer` — декодированием.

-   `'base64'`: кодирование [Base64](https://en.wikipedia.org/wiki/Base64). При создании `Buffer` из строки эта кодировка также корректно принимает «безопасный для URL и имён файлов алфавит» из [RFC 4648, раздел 5](https://datatracker.ietf.org/doc/html/rfc4648#section5). Пробельные символы (пробелы, табуляции, переводы строк) внутри строки в base64 игнорируются.

-   `'base64url'`: кодирование [base64url](https://tools.ietf.org/html/rfc4648#section-5) по [RFC 4648, Section 5](https://tools.ietf.org/html/rfc4648#section-5). При создании `Buffer` из строки эта кодировка также принимает обычные строки в base64. При кодировании `Buffer` в строку заполнение (padding) опускается.

-   `'hex'`: каждый байт кодируется двумя шестнадцатеричными символами. При декодировании строк, в которых нечётное число шестнадцатеричных символов, возможна усечённая обработка данных. Пример ниже.

Также поддерживаются устаревшие кодировки символов:

-   `'ascii'`: только 7-битные данные [ASCII](https://en.wikipedia.org/wiki/ASCII). При кодировании строки в `Buffer` это эквивалентно `'latin1'`. При декодировании `Buffer` в строку у этой кодировки дополнительно сбрасывается старший бит каждого байта перед интерпретацией как `'latin1'`. Обычно эту кодировку использовать не нужно: для текста только в ASCII лучше подходят `'utf8'` или, если известно, что данные строго ASCII, `'latin1'`. Оставлена для совместимости со старым кодом.

-   `'binary'`: псевдоним `'latin1'`. Название может вводить в заблуждение: все перечисленные здесь кодировки преобразуют строки и двоичные данные. Для строк и `Buffer` чаще всего подходит `'utf8'`.

-   `'ucs2'`, `'ucs-2'`: псевдонимы `'utf16le'`. Раньше под UCS-2 понимали вариант UTF-16 без символов с кодовыми точками выше `U+FFFF`. В Node.js такие символы всегда поддерживаются.

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

Современные веб-браузеры следуют [WHATWG Encoding Standard](https://www.whatwg.org/spec/#encoding-standard), где `'latin1'` и `'ISO-8859-1'` сопоставляются с `'win-1252'`. Поэтому при вызове, например, `http.get()`, если в ответе указана одна из кодировок из спецификации WHATWG, сервер мог вернуть данные в `'win-1252'`, и декодирование с `'latin1'` может дать неверные символы.

## Буферы и TypedArray

<!-- YAML
changes:
  - version: v3.0.0
    pr-url: https://github.com/nodejs/node/pull/2002
    description: The `Buffer` class now inherits from `Uint8Array`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v3.0.0 | Класс Buffer теперь наследуется от Uint8Array. |

Экземпляры `Buffer` одновременно являются экземплярами JavaScript [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) и [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray). Все методы и свойства [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) доступны у `Buffer`. При этом между API `Buffer` и [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) есть тонкие различия.

В частности:

-   [`TypedArray.prototype.slice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice) создаёт копию части `TypedArray`, тогда как [`Buffer.prototype.slice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice) даёт представление над существующим `Buffer` без копирования. Такое поведение может удивлять и оставлено для совместимости со старым кодом. Для поведения, аналогичного [`Buffer.prototype.slice()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice) и для `Buffer`, и для других `TypedArray`, предпочтительнее [`TypedArray.prototype.subarray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray).
-   [`buf.toString()`](#buftostringencoding-start-end) не эквивалентен одноимённому методу `TypedArray`.
-   Ряд методов, например [`buf.indexOf()`](#bufindexofvalue-byteoffset-encoding), принимает дополнительные аргументы.

Создать новые экземпляры [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) из `Buffer` можно двумя способами:

-   Передача `Buffer` в конструктор [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) копирует содержимое `Buffer`, интерпретируемое как массив целых чисел, а не как последовательность байтов целевого типа.

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

-   Передача лежащего в основе `Buffer` [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) создаст [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), разделяющий с `Buffer` память.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from('hello', 'utf16le');
    const uint16array = new Uint16Array(
      buf.buffer,
      buf.byteOffset,
      buf.length / Uint16Array.BYTES_PER_ELEMENT);

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
      buf.length / Uint16Array.BYTES_PER_ELEMENT);

    console.log(uint16array);

    // Prints: Uint16Array(5) [ 104, 101, 108, 108, 111 ]
    ```

Новый `Buffer`, разделяющий ту же выделенную память, что и экземпляр [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), можно создать через свойство `.buffer` объекта `TypedArray` так же, как описано выше. [`Buffer.from()`](#static-method-bufferfromarraybuffer-byteoffset-length) в этом случае ведёт себя как `new Uint8Array()`.

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

При создании `Buffer` из `.buffer` у [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) можно использовать только часть лежащего в основе [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), передав параметры `byteOffset` и `length`.

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

`Buffer.from()` и [`TypedArray.from()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from) имеют разные сигнатуры и реализацию. В частности, варианты [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) принимают второй аргумент — функцию отображения, вызываемую для каждого элемента:

-   [`TypedArray.from(source[, mapFn[, thisArg]])`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from)

Метод `Buffer.from()` функцию отображения не поддерживает:

-   [`Buffer.from(array)`](#static-method-bufferfromarray)
-   [`Buffer.from(buffer)`](#static-method-bufferfrombuffer)
-   [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length)
-   [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding)

### Методы `Buffer` можно вызывать для экземпляров `Uint8Array`

Все методы прототипа `Buffer` можно вызывать с экземпляром `Uint8Array`.

```js
const { toString, write } = Buffer.prototype;

const uint8array = new Uint8Array(5);

write.call(uint8array, 'hello', 0, 5, 'utf8'); // 5
// <Uint8Array 68 65 6c 6c 6f>

toString.call(uint8array, 'utf8'); // 'hello'
```

## Буферы и итерация

Экземпляры `Buffer` можно перебирать синтаксисом `for..of`:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, 2, 3]);

    for (const b of buf) {
      console.log(b);
    }
    // Prints:
    //   1
    //   2
    //   3
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([1, 2, 3]);

    for (const b of buf) {
      console.log(b);
    }
    // Prints:
    //   1
    //   2
    //   3
    ```

Дополнительно итераторы можно получить методами [`buf.values()`](#bufvalues), [`buf.keys()`](#bufkeys) и [`buf.entries()`](#bufentries).

## Класс: `Blob`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
changes:
  - version:
    - v18.0.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/41270
    description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0, v16.17.0 | Больше не экспериментально. |

[Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) инкапсулирует неизменяемые сырые данные, которые безопасно разделять между несколькими рабочими потоками.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.7.0 | Добавлен стандартный параметр «окончания» для замены окончаний строк и удален нестандартный параметр «кодировка». |

-   `sources` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<TypedArray[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<Blob[]>](https://developer.mozilla.org/en-US/docs/Web/API/Blob) Массив строк, [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) или [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), либо любая смесь таких объектов, которые будут помещены в `Blob`.
-   `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `endings` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений `'transparent'` или `'native'`. При `'native'` окончания строк в строковых частях приводятся к родному для платформы виду, как в `require('node:os').EOL`.
    -   `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) MIME-тип содержимого блоба. Поле `type` задаёт предполагаемый тип данных; формат строки не проверяется.

Создаёт новый объект `Blob`, объединяющий указанные источники.

Источники [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) и [Buffer](buffer.md#buffer) копируются в `Blob`, поэтому после создания `Blob` их можно безопасно изменять.

Строковые источники кодируются в UTF-8 и копируются в блоб. Непарные суррогатные пары в каждой строковой части заменяются символом замены Unicode U+FFFD.

### `blob.arrayBuffer()`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

-   Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Возвращает промис, который выполняется с [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), содержащим копию данных `Blob`.

### `blob.bytes()`

<!-- YAML
added:
  - v22.3.0
  - v20.16.0
-->

Метод `blob.bytes()` возвращает байты объекта `Blob` в виде `Promise<Uint8Array>`.

```js
const blob = new Blob(['hello']);
blob.bytes().then((bytes) => {
    console.log(bytes); // Outputs: Uint8Array(5) [ 104, 101, 108, 108, 111 ]
});
```

### `blob.size`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

Общий размер `Blob` в байтах.

### `blob.slice([start[, end[, type]]])`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

-   `start` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Начальный индекс.
-   `end` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Конечный индекс.
-   `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) MIME-тип для нового `Blob`

Создаёт и возвращает новый `Blob` с подмножеством данных этого `Blob`. Исходный `Blob` не изменяется.

### `blob.stream()`

<!-- YAML
added: v16.7.0
-->

-   Возвращает: [ReadableStream](https://developer.mozilla.org/docs/Web/API/ReadableStream)(webstreams.md#readablestream)

Возвращает новый `ReadableStream` для чтения содержимого `Blob`.

### `blob.text()`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

-   Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Возвращает промис, который выполняется со строкой — содержимым `Blob`, декодированным как UTF-8.

### `blob.type`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
-->

-   Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

MIME-тип содержимого `Blob`.

### Объекты `Blob` и `MessageChannel`

После создания [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) его можно передать через `MessagePort` в несколько мест без переноса или немедленного копирования данных. Данные внутри `Blob` копируются только при вызове `arrayBuffer()` или `text()`.

=== "MJS"

    ```js
    import { Blob } from 'node:buffer';
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

    // The Blob is still usable after posting.
    blob.text().then(console.log);
    ```

=== "CJS"

    ```js
    const { Blob } = require('node:buffer');
    const { setTimeout: delay } = require('node:timers/promises');

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

Класс `Buffer` — глобальный тип для прямой работы с двоичными данными. Его можно создавать разными способами.

### Статический метод: `Buffer.alloc(size[, fill[, encoding]])`

<!-- YAML
added: v5.10.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/45796
    description: Throw ERR_INVALID_ARG_TYPE or ERR_OUT_OF_RANGE instead of
                 ERR_INVALID_ARG_VALUE for invalid input arguments.
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

Добавлено в: v5.10.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Выдавайте ERR_INVALID_ARG_TYPE или ERR_OUT_OF_RANGE вместо ERR_INVALID_ARG_VALUE для недопустимых входных аргументов. |
    | v15.0.0 | Выдавайте ERR_INVALID_ARG_VALUE вместо ERR_INVALID_OPT_VALUE для недопустимых входных аргументов. |
    | v10.0.0 | Попытка заполнить буфер ненулевой длины буфером нулевой длины вызывает исключение. |
    | v10.0.0 | Указание недопустимой строки для `fill` вызывает исключение. |
    | v8.9.3 | Указание недопустимой строки для `fill` теперь приводит к заполнению буфера нулями. |

-   `size` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Желаемая длина нового `Buffer`.
-   `fill` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение для предварительного заполнения нового `Buffer`. **По умолчанию:** `0`.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `fill` — строка, это её кодировка. **По умолчанию:** `'utf8'`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Выделяет новый `Buffer` размером `size` байт. Если `fill` равен `undefined`, буфер заполняется нулями.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.alloc(5);

    console.log(buf);
    // Prints: <Buffer 00 00 00 00 00>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.alloc(5);

    console.log(buf);
    // Prints: <Buffer 00 00 00 00 00>
    ```

Если `size` больше `buffer.constants.MAX_LENGTH` или меньше 0, выбрасывается [`ERR_OUT_OF_RANGE`](errors.md#err_out_of_range).

Если указан `fill`, выделенный `Buffer` инициализируется вызовом [`buf.fill(fill)`](#buffillvalue-offset-end-encoding).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.alloc(5, 'a');

    console.log(buf);
    // Prints: <Buffer 61 61 61 61 61>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.alloc(5, 'a');

    console.log(buf);
    // Prints: <Buffer 61 61 61 61 61>
    ```

Если указаны и `fill`, и `encoding`, выделенный `Buffer` инициализируется вызовом [`buf.fill(fill, encoding)`](#buffillvalue-offset-end-encoding).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

    console.log(buf);
    // Prints: <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

    console.log(buf);
    // Prints: <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
    ```

Вызов [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) может быть заметно медленнее [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize), но гарантирует, что содержимое нового `Buffer` не будет включать чувствительные данные из предыдущих выделений памяти, в том числе не относящиеся к `Buffer`.

Если `size` не является числом, выбрасывается `TypeError`.

### Статический метод: `Buffer.allocUnsafe(size)`

<!-- YAML
added: v5.10.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/45796
    description: Throw ERR_INVALID_ARG_TYPE or ERR_OUT_OF_RANGE instead of
                 ERR_INVALID_ARG_VALUE for invalid input arguments.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34682
    description: Throw ERR_INVALID_ARG_VALUE instead of ERR_INVALID_OPT_VALUE
                 for invalid input arguments.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7079
    description: Passing a negative `size` will now throw an error.
-->

Добавлено в: v5.10.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Выдавайте ERR_INVALID_ARG_TYPE или ERR_OUT_OF_RANGE вместо ERR_INVALID_ARG_VALUE для недопустимых входных аргументов. |
    | v15.0.0 | Выдавайте ERR_INVALID_ARG_VALUE вместо ERR_INVALID_OPT_VALUE для недопустимых входных аргументов. |
    | v7.0.0 | Передача отрицательного размера теперь приведет к ошибке. |

-   `size` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Желаемая длина нового `Buffer`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Выделяет новый `Buffer` размером `size` байт. Если `size` больше `buffer.constants.MAX_LENGTH` или меньше 0, выбрасывается [`ERR_OUT_OF_RANGE`](errors.md#err_out_of_range).

Память под такие экземпляры `Buffer` _не инициализируется_. Содержимое нового `Buffer` непредсказуемо и _может содержать конфиденциальные данные_. Вместо этого используйте [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding), чтобы получить буфер, заполненный нулями.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(10);

    console.log(buf);
    // Prints (contents may vary): <Buffer a0 8b 28 3f 01 00 00 00 50 32>

    buf.fill(0);

    console.log(buf);
    // Prints: <Buffer 00 00 00 00 00 00 00 00 00 00>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.allocUnsafe(10);

    console.log(buf);
    // Prints (contents may vary): <Buffer a0 8b 28 3f 01 00 00 00 50 32>

    buf.fill(0);

    console.log(buf);
    // Prints: <Buffer 00 00 00 00 00 00 00 00 00 00>
    ```

Если `size` не является числом, выбрасывается `TypeError`.

Модуль `Buffer` заранее выделяет внутренний экземпляр размера `Buffer.poolSize` — пул для быстрого выделения новых `Buffer`, создаваемых через [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize), [`Buffer.from(array)`](#static-method-bufferfromarray), [`Buffer.from(string)`](#static-method-bufferfromstring-encoding) и [`Buffer.concat()`](#static-method-bufferconcatlist-totallength), только если `size` меньше `Buffer.poolSize >>> 1` (целая часть `Buffer.poolSize`, делённой на два).

Использование этого пула — ключевое отличие между `Buffer.alloc(size, fill)` и `Buffer.allocUnsafe(size).fill(fill)`: `Buffer.alloc(size, fill)` _никогда_ не использует внутренний пул `Buffer`, а `Buffer.allocUnsafe(size).fill(fill)` _использует_ его, если `size` не больше половины `Buffer.poolSize`. Разница тонкая, но важна, когда нужна дополнительная производительность [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize).

### Статический метод: `Buffer.allocUnsafeSlow(size)`

<!-- YAML
added: v5.12.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/45796
    description: Throw ERR_INVALID_ARG_TYPE or ERR_OUT_OF_RANGE instead of
                 ERR_INVALID_ARG_VALUE for invalid input arguments.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34682
    description: Throw ERR_INVALID_ARG_VALUE instead of ERR_INVALID_OPT_VALUE
                 for invalid input arguments.
-->

Добавлено в: v5.12.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Выдавайте ERR_INVALID_ARG_TYPE или ERR_OUT_OF_RANGE вместо ERR_INVALID_ARG_VALUE для недопустимых входных аргументов. |
    | v15.0.0 | Выдавайте ERR_INVALID_ARG_VALUE вместо ERR_INVALID_OPT_VALUE для недопустимых входных аргументов. |

-   `size` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Желаемая длина нового `Buffer`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Выделяет новый `Buffer` размером `size` байт. Если `size` больше `buffer.constants.MAX_LENGTH` или меньше 0, выбрасывается [`ERR_OUT_OF_RANGE`](errors.md#err_out_of_range). При `size` равном 0 создаётся `Buffer` нулевой длины.

Память под такие экземпляры `Buffer` _не инициализируется_. Содержимое нового `Buffer` непредсказуемо и _может содержать конфиденциальные данные_. Инициализируйте такие буферы вызовом [`buf.fill(0)`](#buffillvalue-offset-end-encoding).

При использовании [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) для выделения новых `Buffer` фрагменты меньше `Buffer.poolSize >>> 1` (при значении пула по умолчанию — до 4 КиБ) вырезаются из одного заранее выделенного `Buffer`. Это снижает накладные расходы сборщика мусора при множестве отдельных выделений и улучшает производительность и расход памяти, уменьшая число отслеживаемых объектов `ArrayBuffer`.

Если же нужно удерживать небольшой фрагмент памяти из пула неопределённо долго, разумнее создать внепуловый `Buffer` через `Buffer.allocUnsafeSlow()` и скопировать нужные данные.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Если `size` не является числом, выбрасывается `TypeError`.

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

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.0.0 | Передача недопустимого ввода теперь приведет к ошибке. |
    | v5.10.0 | Параметром string теперь может быть любой TypedArray, DataView или ArrayBuffer. |

-   `string` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<SharedArrayBuffer>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) Значение, для которого вычисляется длина.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `string` — строка, это её кодировка. **По умолчанию:** `'utf8'`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт в `string` при заданной интерпретации.

Возвращает длину строки в байтах при кодировании в `encoding`. Это не то же самое, что [`String.prototype.length`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length): длина в символах не учитывает кодировку при преобразовании в байты.

Для `'base64'`, `'base64url'` и `'hex'` функция предполагает корректные входные данные. Если в строке есть посторонние символы (например пробелы), возвращаемое значение может быть больше длины `Buffer`, созданного из этой строки.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const str = '\u00bd + \u00bc = \u00be';

    console.log(`${str}: ${str.length} characters, ` +
                `${Buffer.byteLength(str, 'utf8')} bytes`);
    // Prints: ½ + ¼ = ¾: 9 characters, 12 bytes
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const str = '\u00bd + \u00bc = \u00be';

    console.log(`${str}: ${str.length} characters, ` +
                `${Buffer.byteLength(str, 'utf8')} bytes`);
    // Prints: ½ + ¼ = ¾: 9 characters, 12 bytes
    ```

Если `string` имеет тип [Buffer](buffer.md#buffer) | [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), возвращается значение `.byteLength`.

### Статический метод: `Buffer.compare(buf1, buf2)`

<!-- YAML
added: v0.11.13
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The arguments can now be `Uint8Array`s.
-->

Добавлено в: v0.11.13

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Аргументы теперь могут быть Uint8Array. |

-   `buf1` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   `buf2` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `-1`, `0` или `1` в зависимости от результата сравнения. Подробности см. в [`buf.compare()`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

Сравнивает `buf1` с `buf2`, обычно для сортировки массивов экземпляров `Buffer`. Эквивалентно вызову [`buf1.compare(buf2)`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from('1234');
    const buf2 = Buffer.from('0123');
    const arr = [buf1, buf2];

    console.log(arr.sort(Buffer.compare));
    // Prints: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
    // (This result is equal to: [buf2, buf1].)
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.7.11

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Элементами списка теперь могут быть элементы Uint8Array. |

-   `list` [<Buffer[]>](buffer.md#buffer) | [<Uint8Array[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Список экземпляров `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) для объединения.
-   `totalLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Суммарная длина экземпляров `Buffer` в `list` после конкатенации.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Возвращает новый `Buffer`, полученный конкатенацией всех экземпляров `Buffer` из `list`.

Если список пуст или `totalLength` равен `0`, возвращается новый `Buffer` нулевой длины.

Если `totalLength` не указан, он вычисляется по экземплярам `Buffer` в `list` суммированием их длин.

Если `totalLength` указан, он должен быть целым без знака. Если суммарная длина `Buffer` в `list` больше `totalLength`, результат усекается до `totalLength`. Если суммарная длина меньше `totalLength`, оставшееся место заполняется нулями.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

`Buffer.concat()` также может использовать внутренний пул `Buffer`, как это делает [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize).

### Статический метод: `Buffer.copyBytesFrom(view[, offset[, length]])`

<!-- YAML
added:
 - v19.8.0
 - v18.16.0
-->

-   `view` [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) для копирования.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Начальное смещение в `view`. **По умолчанию:** `0`.
-   `length` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число элементов из `view` для копирования. **По умолчанию:** `view.length - offset`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Копирует базовую память `view` в новый `Buffer`.

```js
const u16 = new Uint16Array([0, 0xffff]);
const buf = Buffer.copyBytesFrom(u16, 1, 1);
u16[1] = 0;
console.log(buf.length); // 2
console.log(buf[0]); // 255
console.log(buf[1]); // 255
```

### Статический метод: `Buffer.from(array)`

<!-- YAML
added: v5.10.0
-->

-   `array` [<integer[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [<Buffer>](buffer.md#buffer)

Выделяет новый `Buffer`, используя `array` байтов в диапазоне `0` – `255`. Элементы массива вне этого диапазона усекаются, чтобы поместиться в него.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    // Creates a new Buffer containing the UTF-8 bytes of the string 'buffer'.
    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    // Creates a new Buffer containing the UTF-8 bytes of the string 'buffer'.
    const buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
    ```

Если `array` — объект, похожий на `Array` (то есть с свойством `length` типа `number`), он обрабатывается как массив, если только это не `Buffer` или `Uint8Array`. Иначе говоря, все остальные варианты `TypedArray` обрабатываются как `Array`. Чтобы создать `Buffer` из байтов, лежащих в основе `TypedArray`, используйте [`Buffer.copyBytesFrom()`](#static-method-buffercopybytesfromview-offset-length).

Будет выброшен `TypeError`, если `array` не является `Array` или другим типом, подходящим для вариантов `Buffer.from()`.

`Buffer.from(array)` и [`Buffer.from(string)`](#static-method-bufferfromstring-encoding) также могут использовать внутренний пул `Buffer`, как это делает [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize).

### Статический метод: `Buffer.from(arrayBuffer[, byteOffset[, length]])`

<!-- YAML
added: v5.10.0
-->

-   `arrayBuffer` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<SharedArrayBuffer>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), например свойство `.buffer` у [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).
-   `byteOffset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Индекс первого байта, который нужно «раскрыть». **По умолчанию:** `0`.
-   `length` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байтов для «раскрытия». **По умолчанию:** `arrayBuffer.byteLength - byteOffset`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Создаёт представление [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) без копирования базовой памяти. Например, при передаче ссылки на свойство `.buffer` экземпляра [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) вновь созданный `Buffer` будет использовать ту же выделенную память, что и базовый `ArrayBuffer` [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Необязательные аргументы `byteOffset` и `length` задают диапазон памяти внутри `arrayBuffer`, который будет совместно использоваться с `Buffer`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const ab = new ArrayBuffer(10);
    const buf = Buffer.from(ab, 0, 2);

    console.log(buf.length);
    // Prints: 2
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const ab = new ArrayBuffer(10);
    const buf = Buffer.from(ab, 0, 2);

    console.log(buf.length);
    // Prints: 2
    ```

Будет выброшен `TypeError`, если `arrayBuffer` не является [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) или другим типом, подходящим для вариантов `Buffer.from()`.

Важно помнить, что базовый `ArrayBuffer` может охватывать область памяти шире, чем представление `TypedArray`. Новый `Buffer`, созданный через свойство `buffer` у `TypedArray`, может выходить за границы самого `TypedArray`:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const arrA = Uint8Array.from([0x63, 0x64, 0x65, 0x66]); // 4 elements
    const arrB = new Uint8Array(arrA.buffer, 1, 2); // 2 elements
    console.log(arrA.buffer === arrB.buffer); // true

    const buf = Buffer.from(arrB.buffer);
    console.log(buf);
    // Prints: <Buffer 63 64 65 66>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

-   `buffer` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Существующий `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), из которого копируются данные.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Копирует данные переданного `buffer` в новый экземпляр `Buffer`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from('buffer');
    const buf2 = Buffer.from(buf1);

    buf1[0] = 0x61;

    console.log(buf1.toString());
    // Prints: auffer
    console.log(buf2.toString());
    // Prints: buffer
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from('buffer');
    const buf2 = Buffer.from(buf1);

    buf1[0] = 0x61;

    console.log(buf1.toString());
    // Prints: auffer
    console.log(buf2.toString());
    // Prints: buffer
    ```

Будет выброшен `TypeError`, если `buffer` не является `Buffer` или другим типом, подходящим для вариантов `Buffer.from()`.

### Статический метод: `Buffer.from(object[, offsetOrEncoding[, length]])`

<!-- YAML
added: v8.2.0
-->

-   `object` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект с поддержкой `Symbol.toPrimitive` или `valueOf()`.
-   `offsetOrEncoding` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Смещение в байтах или кодировка.
-   `length` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Для объектов, у которых `valueOf()` возвращает значение, не строго равное `object`, возвращается `Buffer.from(object.valueOf(), offsetOrEncoding, length)`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from(new String('this is a test'));
    // Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from(new String('this is a test'));
    // Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
    ```

Для объектов с поддержкой `Symbol.toPrimitive` возвращается `Buffer.from(object[Symbol.toPrimitive]('string'), offsetOrEncoding)`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    class Foo {
      [Symbol.toPrimitive]() {
        return 'this is a test';
      }
    }

    const buf = Buffer.from(new Foo(), 'utf8');
    // Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    class Foo {
      [Symbol.toPrimitive]() {
        return 'this is a test';
      }
    }

    const buf = Buffer.from(new Foo(), 'utf8');
    // Prints: <Buffer 74 68 69 73 20 69 73 20 61 20 74 65 73 74>
    ```

Будет выброшен `TypeError`, если у `object` нет указанных методов или тип не подходит для вариантов `Buffer.from()`.

### Статический метод: `Buffer.from(string[, encoding])`

<!-- YAML
added: v5.10.0
-->

-   `string` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка для кодирования.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка `string`. **По умолчанию:** `'utf8'`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Создаёт новый `Buffer`, содержащий `string`. Параметр `encoding` задаёт кодировку символов при преобразовании `string` в байты.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from('this is a tést');
    const buf2 = Buffer.from('7468697320697320612074c3a97374', 'hex');

    console.log(buf1.toString());
    // Prints: this is a tést
    console.log(buf2.toString());
    // Prints: this is a tést
    console.log(buf1.toString('latin1'));
    // Prints: this is a tÃ©st
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from('this is a tést');
    const buf2 = Buffer.from('7468697320697320612074c3a97374', 'hex');

    console.log(buf1.toString());
    // Prints: this is a tést
    console.log(buf2.toString());
    // Prints: this is a tést
    console.log(buf1.toString('latin1'));
    // Prints: this is a tÃ©st
    ```

Будет выброшен `TypeError`, если `string` не является строкой или другим типом, подходящим для вариантов `Buffer.from()`.

[`Buffer.from(string)`](#static-method-bufferfromstring-encoding) также может использовать внутренний пул `Buffer`, как это делает [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize).

### Статический метод: `Buffer.isBuffer(obj)`

<!-- YAML
added: v0.1.101
-->

-   `obj` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `obj` — это `Buffer`, иначе `false`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    Buffer.isBuffer(Buffer.alloc(10)); // true
    Buffer.isBuffer(Buffer.from('foo')); // true
    Buffer.isBuffer('a string'); // false
    Buffer.isBuffer([]); // false
    Buffer.isBuffer(new Uint8Array(1024)); // false
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя кодировки для проверки.
-   Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `encoding` — имя поддерживаемой кодировки символов, иначе `false`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    console.log(Buffer.isEncoding('utf8'));
    // Prints: true

    console.log(Buffer.isEncoding('hex'));
    // Prints: true

    console.log(Buffer.isEncoding('utf/8'));
    // Prints: false

    console.log(Buffer.isEncoding(''));
    // Prints: false
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    console.log(Buffer.isEncoding('utf8'));
    // Prints: true

    console.log(Buffer.isEncoding('hex'));
    // Prints: true

    console.log(Buffer.isEncoding('utf/8'));
    // Prints: false

    console.log(Buffer.isEncoding(''));
    // Prints: false
    ```

### `Buffer.poolSize`

<!-- YAML
added: v0.11.3
-->

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `8192`

Это размер (в байтах) предварительно выделенных внутренних экземпляров `Buffer`, используемых для пулинга. Это значение можно изменить.

### `buf[index]`

-   `index` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Оператор индекса `[index]` позволяет читать и задавать октет в позиции `index` в `buf`. Значения соответствуют отдельным байтам, поэтому допустимый диапазон — от `0x00` до `0xFF` (шестнадцатеричный) или от `0` до `255` (десятичный).

Оператор унаследован от `Uint8Array`, поэтому при выходе за границы поведение такое же, как у `Uint8Array`. Иначе говоря, `buf[index]` возвращает `undefined`, если `index` отрицателен или больше либо равен `buf.length`, а присваивание `buf[index] = value` не меняет буфер, если `index` отрицателен или `>= buf.length`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

-   Тип: [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) Базовый объект `ArrayBuffer`, на основе которого создан этот `Buffer`.

Не гарантируется, что этот `ArrayBuffer` в точности соответствует исходному `Buffer`. Подробности см. в примечаниях к `buf.byteOffset`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const arrayBuffer = new ArrayBuffer(16);
    const buffer = Buffer.from(arrayBuffer);

    console.log(buffer.buffer === arrayBuffer);
    // Prints: true
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const arrayBuffer = new ArrayBuffer(16);
    const buffer = Buffer.from(arrayBuffer);

    console.log(buffer.buffer === arrayBuffer);
    // Prints: true
    ```

### `buf.byteOffset`

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `byteOffset` базового объекта `ArrayBuffer` у `Buffer`.

При задании `byteOffset` в `Buffer.from(ArrayBuffer, byteOffset, length)` или иногда при выделении `Buffer` меньше `Buffer.poolSize` буфер не начинается с нулевого смещения в базовом `ArrayBuffer`.

Это может вызывать проблемы при прямом доступе к базовому `ArrayBuffer` через `buf.buffer`, поскольку другие части `ArrayBuffer` могут не относиться к самому объекту `Buffer`.

Частая проблема при создании `TypedArray`, разделяющего память с `Buffer`, — нужно корректно указать `byteOffset`:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    // Create a buffer smaller than `Buffer.poolSize`.
    const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // When casting the Node.js Buffer to an Int8Array, use the byteOffset
    // to refer only to the part of `nodeBuffer.buffer` that contains the memory
    // for `nodeBuffer`.
    new Int8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.length);
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    // Create a buffer smaller than `Buffer.poolSize`.
    const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // When casting the Node.js Buffer to an Int8Array, use the byteOffset
    // to refer only to the part of `nodeBuffer.buffer` that contains the memory
    // for `nodeBuffer`.
    new Int8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.length);
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

Добавлено в: v0.11.13

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Параметр target теперь может быть Uint8Array. |
    | v5.11.0 | Теперь поддерживаются дополнительные параметры для указания смещений. |

-   `target` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), с которым сравнивается `buf`.
-   `targetStart` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `target`, с которого начинается сравнение. **По умолчанию:** `0`.
-   `targetEnd` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `target`, на котором сравнение заканчивается (не включая). **По умолчанию:** `target.length`.
-   `sourceStart` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `buf`, с которого начинается сравнение. **По умолчанию:** `0`.
-   `sourceEnd` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `buf`, на котором сравнение заканчивается (не включая). **По умолчанию:** `buf.length`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Сравнивает `buf` с `target` и возвращает число, показывающее, идёт ли `buf` в порядке сортировки до, после или совпадает с `target`. Сравнение основано на фактической последовательности байтов в каждом `Buffer`.

-   возвращается `0`, если `target` совпадает с `buf`;
-   возвращается `1`, если `target` при сортировке должен идти _перед_ `buf`;
-   возвращается `-1`, если `target` при сортировке должен идти _после_ `buf`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Необязательные аргументы `targetStart`, `targetEnd`, `sourceStart` и `sourceEnd` позволяют ограничить сравнение заданными диапазонами в `target` и `buf`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

    console.log(buf1.compare(buf2, 5, 9, 0, 4));
    // Prints: 0
    console.log(buf1.compare(buf2, 0, 6, 4));
    // Prints: -1
    console.log(buf1.compare(buf2, 5, 6, 5));
    // Prints: 1
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

    console.log(buf1.compare(buf2, 5, 9, 0, 4));
    // Prints: 0
    console.log(buf1.compare(buf2, 0, 6, 4));
    // Prints: -1
    console.log(buf1.compare(buf2, 5, 6, 5));
    // Prints: 1
    ```

Выбрасывается [`ERR_OUT_OF_RANGE`](errors.md#err_out_of_range), если `targetStart < 0`, `sourceStart < 0`, `targetEnd > target.byteLength` или `sourceEnd > source.byteLength`.

### `buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])`

<!-- YAML
added: v0.1.90
-->

-   `target` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), в который копируют.
-   `targetStart` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `target`, с которого начинается запись. **По умолчанию:** `0`.
-   `sourceStart` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `buf`, с которого начинается копирование. **По умолчанию:** `0`.
-   `sourceEnd` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в `buf`, на котором копирование останавливается (не включая). **По умолчанию:** `buf.length`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число скопированных байтов.

Копирует данные из области `buf` в область `target`, даже если память `target` перекрывается с `buf`.

[`TypedArray.prototype.set()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/set) выполняет ту же операцию и доступен для всех TypedArray, включая `Buffer` Node.js, хотя набор аргументов у функции другой.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

-   Возвращает: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Создаёт и возвращает [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) пар `[index, byte]` по содержимому `buf`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.13

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Аргументы теперь могут быть Uint8Array. |

-   `otherBuffer` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) для сравнения с `buf`.
-   Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если у `buf` и `otherBuffer` совпадают все байты, иначе `false`. Эквивалентно выражению [`buf.compare(otherBuffer) === 0`](#bufcomparetarget-targetstart-targetend-sourcestart-sourceend).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from('ABC');
    const buf2 = Buffer.from('414243', 'hex');
    const buf3 = Buffer.from('ABCD');

    console.log(buf1.equals(buf2));
    // Prints: true
    console.log(buf1.equals(buf3));
    // Prints: false
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v11.0.0 | Выдает `ERR_OUT_OF_RANGE` вместо `ERR_INDEX_OUT_OF_RANGE`. |
    | v10.0.0 | Отрицательные значения end вызывают ошибку ERR_INDEX_OUT_OF_RANGE. |
    | v10.0.0 | Попытка заполнить буфер ненулевой длины буфером нулевой длины вызывает исключение. |
    | v10.0.0 | Указание недопустимой строки для `value` вызывает исключение. |
    | v5.7.0 | Параметр `encoding` теперь поддерживается. |

-   `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение для заполнения `buf`. Пустое значение (строка, Uint8Array, Buffer) приводится к `0`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед началом заполнения `buf`. **По умолчанию:** `0`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Где закончить заполнение `buf` (не включая). **По умолчанию:** `buf.length`.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка для `value`, если `value` — строка. **По умолчанию:** `'utf8'`.
-   Возвращает: [<Buffer>](buffer.md#buffer) Ссылка на `buf`.

Заполняет `buf` указанным `value`. Если `offset` и `end` не заданы, заполняется весь `buf`:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    // Fill a `Buffer` with the ASCII character 'h'.

    const b = Buffer.allocUnsafe(50).fill('h');

    console.log(b.toString());
    // Prints: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh

    // Fill a buffer with empty string
    const c = Buffer.allocUnsafe(5).fill('');

    console.log(c.fill(''));
    // Prints: <Buffer 00 00 00 00 00>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    // Fill a `Buffer` with the ASCII character 'h'.

    const b = Buffer.allocUnsafe(50).fill('h');

    console.log(b.toString());
    // Prints: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh

    // Fill a buffer with empty string
    const c = Buffer.allocUnsafe(5).fill('');

    console.log(c.fill(''));
    // Prints: <Buffer 00 00 00 00 00>
    ```

`value` приводится к `uint32`, если это не строка, не `Buffer` и не целое число. Если получившееся целое больше `255` (десятичное), `buf` заполняется значением `value & 255`.

Если последняя запись операции `fill()` приходится на многобайтовый символ, в `buf` записываются только те байты символа, которые в него помещаются:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    // Fill a `Buffer` with character that takes up two bytes in UTF-8.

    console.log(Buffer.allocUnsafe(5).fill('\u0222'));
    // Prints: <Buffer c8 a2 c8 a2 c8>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    // Fill a `Buffer` with character that takes up two bytes in UTF-8.

    console.log(Buffer.allocUnsafe(5).fill('\u0222'));
    // Prints: <Buffer c8 a2 c8 a2 c8>
    ```

Если `value` содержит недопустимые символы, они отбрасываются; если не остаётся корректных данных для заполнения, выбрасывается исключение:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(5);

    console.log(buf.fill('a'));
    // Prints: <Buffer 61 61 61 61 61>
    console.log(buf.fill('aazz', 'hex'));
    // Prints: <Buffer aa aa aa aa aa>
    console.log(buf.fill('zz', 'hex'));
    // Throws an exception.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.allocUnsafe(5);

    console.log(buf.fill('a'));
    // Prints: <Buffer 61 61 61 61 61>
    console.log(buf.fill('aazz', 'hex'));
    // Prints: <Buffer aa aa aa aa aa>
    console.log(buf.fill('zz', 'hex'));
    // Throws an exception.
    ```

### `buf.includes(value[, start[, end]][, encoding])`

<!-- YAML
added: v5.3.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62390
    description: Added the `end` parameter.
  - version:
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
-->

Добавлено в: v5.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавлен параметр `end`. |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |

-   `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Что искать.
-   `start` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) С какого места начинать поиск в `buf`. Если отрицательно, смещение считается от конца `buf`. **По умолчанию:** `0`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Где закончить поиск в `buf` (не включая). **По умолчанию:** `buf.length`.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `value` — строка, это её кодировка. **По умолчанию:** `'utf8'`.
-   Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если `value` найден в `buf`, иначе `false`.

Эквивалентно выражению [`buf.indexOf() !== -1`](#bufindexofvalue-byteoffset-encoding).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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
    console.log(buf.includes(Buffer.from('a buffer example').slice(0, 8)));
    // Prints: true
    console.log(buf.includes('this', 4));
    // Prints: false
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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
    console.log(buf.includes(Buffer.from('a buffer example').slice(0, 8)));
    // Prints: true
    console.log(buf.includes('this', 4));
    // Prints: false
    ```

### `buf.indexOf(value[, start[, end]][, encoding])`

<!-- YAML
added: v1.5.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62390
    description: Added the `end` parameter.
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

Добавлено в: v1.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавлен параметр `end`. |
    | v8.0.0 | Значением теперь может быть Uint8Array. |
    | v5.7.0, v4.4.0 | При передаче encoding параметр byteOffset больше не требуется. |

-   `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Что искать.
-   `start` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) С какого места начинать поиск в `buf`. Если отрицательно, смещение считается от конца `buf`. **По умолчанию:** `0`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Где закончить поиск в `buf` (не включая). **По умолчанию:** `buf.length`.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `value` — строка, задаёт кодировку для двоичного представления строки при поиске в `buf`. **По умолчанию:** `'utf8'`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Индекс первого вхождения `value` в `buf` или `-1`, если `value` в `buf` нет.

Если `value` — это:

-   строка, `value` интерпретируется в соответствии с кодировкой символов в `encoding`;
-   `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), используется `value` целиком; для сравнения части `Buffer` используйте [`buf.subarray`](#bufsubarraystart-end);
-   число, `value` интерпретируется как беззнаковое 8-битное целое в диапазоне от `0` до `255`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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
    console.log(buf.indexOf(Buffer.from('a buffer example').slice(0, 8)));
    // Prints: 8

    const utf16Buffer = Buffer.from('\u039a\u0391\u03a3\u03a3\u0395', 'utf16le');

    console.log(utf16Buffer.indexOf('\u03a3', 0, 'utf16le'));
    // Prints: 4
    console.log(utf16Buffer.indexOf('\u03a3', -4, 'utf16le'));
    // Prints: 6
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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
    console.log(buf.indexOf(Buffer.from('a buffer example').slice(0, 8)));
    // Prints: 8

    const utf16Buffer = Buffer.from('\u039a\u0391\u03a3\u03a3\u0395', 'utf16le');

    console.log(utf16Buffer.indexOf('\u03a3', 0, 'utf16le'));
    // Prints: 4
    console.log(utf16Buffer.indexOf('\u03a3', -4, 'utf16le'));
    // Prints: 6
    ```

Если `value` не является строкой, числом или `Buffer`, метод выбросит `TypeError`. Если `value` — число, оно приводится к допустимому байтовому значению (целое от 0 до 255).

Если `byteOffset` не число, оно приводится к числу. Если результат приведения `NaN` или `0`, ищется весь буфер. Поведение совпадает с [`String.prototype.indexOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Если `value` — пустая строка или пустой `Buffer`, а `byteOffset` меньше `buf.length`, возвращается `byteOffset`. Если `value` пусто и `byteOffset` не меньше `buf.length`, возвращается `buf.length`.

### `buf.keys()`

<!-- YAML
added: v1.1.0
-->

-   Возвращает: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Создаёт и возвращает [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) по ключам `buf` (индексам).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

### `buf.lastIndexOf(value[, start[, end]][, encoding])`

<!-- YAML
added: v6.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62390
    description: Added the `end` parameter.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The `value` can now be a `Uint8Array`.
-->

Добавлено в: v6.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавлен параметр `end`. |
    | v8.0.0 | Значением теперь может быть Uint8Array. |

-   `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) | [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Что искать.
-   `start` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) С какого места начинать поиск в `buf`. Если отрицательно, смещение считается от конца `buf`. **По умолчанию:** `buf.length - 1`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Где закончить поиск в `buf` (не включая). **По умолчанию:** `buf.length`.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `value` — строка, задаёт кодировку для двоичного представления строки при поиске в `buf`. **По умолчанию:** `'utf8'`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Индекс последнего вхождения `value` в `buf` или `-1`, если `value` в `buf` нет.

То же, что [`buf.indexOf()`](#bufindexofvalue-byteoffset-encoding), но ищется последнее вхождение `value`, а не первое.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

    const utf16Buffer = Buffer.from('\u039a\u0391\u03a3\u03a3\u0395', 'utf16le');

    console.log(utf16Buffer.lastIndexOf('\u03a3', undefined, 'utf16le'));
    // Prints: 6
    console.log(utf16Buffer.lastIndexOf('\u03a3', -5, 'utf16le'));
    // Prints: 4
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

    const utf16Buffer = Buffer.from('\u039a\u0391\u03a3\u03a3\u0395', 'utf16le');

    console.log(utf16Buffer.lastIndexOf('\u03a3', undefined, 'utf16le'));
    // Prints: 6
    console.log(utf16Buffer.lastIndexOf('\u03a3', -5, 'utf16le'));
    // Prints: 4
    ```

Если `value` не является строкой, числом или `Buffer`, метод выбросит `TypeError`. Если `value` — число, оно приводится к допустимому байтовому значению (целое от 0 до 255).

Если `byteOffset` не число, оно приводится к числу. Аргументы, дающие при приведении `NaN` (например `{}` или `undefined`), означают поиск по всему буферу. Поведение совпадает с [`String.prototype.lastIndexOf()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/lastIndexOf).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Если `value` — пустая строка или пустой `Buffer`, возвращается `byteOffset`.

### `buf.length`

<!-- YAML
added: v0.1.90
-->

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает число байт в `buf`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    // Create a `Buffer` and write a shorter string to it using UTF-8.

    const buf = Buffer.alloc(1234);

    console.log(buf.length);
    // Prints: 1234

    buf.write('some string', 0, 'utf8');

    console.log(buf.length);
    // Prints: 1234
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

> Stability: 0 - Deprecated: Use [`buf.buffer`](#bufbuffer) instead.

Свойство `buf.parent` — устаревший псевдоним для `buf.buffer`.

### `buf.readBigInt64BE([offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Читает знаковое 64-битное целое (big-endian) из `buf` по указанному смещению `offset`.

Целые числа, прочитанные из `Buffer`, интерпретируются как знаковые в дополнении до двух.

### `buf.readBigInt64LE([offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Читает знаковое 64-битное целое (little-endian) из `buf` по указанному смещению `offset`.

Целые числа, прочитанные из `Buffer`, интерпретируются как знаковые в дополнении до двух.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.10.0, v12.19.0 | Эта функция также доступна как `buf.readBigUint64BE()`. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Читает беззнаковое 64-битное целое (big-endian) из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readBigUint64BE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);

    console.log(buf.readBigUInt64BE(0));
    // Prints: 4294967295n
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.10.0, v12.19.0 | Эта функция также доступна как `buf.readBigUint64LE()`. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Читает беззнаковое 64-битное целое (little-endian) из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readBigUint64LE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);

    console.log(buf.readBigUInt64LE(0));
    // Prints: 18446744069414584320n
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает 64-битное число с плавающей запятой (big-endian) из `buf` по указанному смещению `offset`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

    console.log(buf.readDoubleBE(0));
    // Prints: 8.20788039913184e-304
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает 64-битное число с плавающей запятой (little-endian) из `buf` по указанному смещению `offset`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

    console.log(buf.readDoubleLE(0));
    // Prints: 5.447603722011605e-270
    console.log(buf.readDoubleLE(1));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает 32-битное число с плавающей запятой (big-endian) из `buf` по указанному смещению `offset`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, 2, 3, 4]);

    console.log(buf.readFloatBE(0));
    // Prints: 2.387939260590663e-38
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает 32-битное число с плавающей запятой (little-endian) из `buf` по указанному смещению `offset`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, 2, 3, 4]);

    console.log(buf.readFloatLE(0));
    // Prints: 1.539989614439558e-36
    console.log(buf.readFloatLE(1));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает знаковое 8-битное целое из `buf` по указанному смещению `offset`.

Integers read from a `Buffer` are interpreted as two's complement signed values.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([-1, 5]);

    console.log(buf.readInt8(0));
    // Prints: -1
    console.log(buf.readInt8(1));
    // Prints: 5
    console.log(buf.readInt8(2));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает знаковое 16-битное целое (big-endian) из `buf` по указанному смещению `offset`.

Integers read from a `Buffer` are interpreted as two's complement signed values.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0, 5]);

    console.log(buf.readInt16BE(0));
    // Prints: 5
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает знаковое 16-битное целое (little-endian) из `buf` по указанному смещению `offset`.

Integers read from a `Buffer` are interpreted as two's complement signed values.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0, 5]);

    console.log(buf.readInt16LE(0));
    // Prints: 1280
    console.log(buf.readInt16LE(1));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает знаковое 32-битное целое (big-endian) из `buf` по указанному смещению `offset`.

Integers read from a `Buffer` are interpreted as two's complement signed values.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0, 0, 0, 5]);

    console.log(buf.readInt32BE(0));
    // Prints: 5
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает знаковое 32-битное целое (little-endian) из `buf` по указанному смещению `offset`.

Integers read from a `Buffer` are interpreted as two's complement signed values.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0, 0, 0, 5]);

    console.log(buf.readInt32LE(0));
    // Prints: 83886080
    console.log(buf.readInt32LE(1));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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
  - version:
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.

-->

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт прочитать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает из `buf` начиная с `offset` ровно `byteLength` байт и интерпретирует результат как знаковое целое в дополнении до двух (big-endian) с точностью до 48 бит.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

    console.log(buf.readIntBE(0, 6).toString(16));
    // Prints: 1234567890ab
    console.log(buf.readIntBE(1, 6).toString(16));
    // Throws ERR_OUT_OF_RANGE.
    console.log(buf.readIntBE(1, 0).toString(16));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

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
  - version:
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 and `byteLength` to `uint32` anymore.

-->

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт прочитать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает из `buf` начиная с `offset` ровно `byteLength` байт и интерпретирует результат как знаковое целое в дополнении до двух (little-endian) с точностью до 48 бит.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

    console.log(buf.readIntLE(0, 6).toString(16));
    // Prints: -546f87a9cbee
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

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

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUint8()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает беззнаковое 8-битное целое из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readUint8`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([1, -2]);

    console.log(buf.readUInt8(0));
    // Prints: 1
    console.log(buf.readUInt8(1));
    // Prints: 254
    console.log(buf.readUInt8(2));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUint16BE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает беззнаковое 16-битное целое (big-endian) из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readUint16BE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56]);

    console.log(buf.readUInt16BE(0).toString(16));
    // Prints: 1234
    console.log(buf.readUInt16BE(1).toString(16));
    // Prints: 3456
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUint16LE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает беззнаковое 16-битное целое (little-endian) из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readUint16LE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56]);

    console.log(buf.readUInt16LE(0).toString(16));
    // Prints: 3412
    console.log(buf.readUInt16LE(1).toString(16));
    // Prints: 5634
    console.log(buf.readUInt16LE(2).toString(16));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUint32BE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает беззнаковое 32-битное целое (big-endian) из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readUint32BE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

    console.log(buf.readUInt32BE(0).toString(16));
    // Prints: 12345678
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUint32LE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает беззнаковое 32-битное целое (little-endian) из `buf` по указанному смещению `offset`.

Также доступна под псевдонимом `readUint32LE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78]);

    console.log(buf.readUInt32LE(0).toString(16));
    // Prints: 78563412
    console.log(buf.readUInt32LE(1).toString(16));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUintBE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт прочитать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает из `buf` начиная с `offset` ровно `byteLength` байт и интерпретирует результат как беззнаковое целое (big-endian) с точностью до 48 бит.

Также доступна под псевдонимом `readUintBE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

    console.log(buf.readUIntBE(0, 6).toString(16));
    // Prints: 1234567890ab
    console.log(buf.readUIntBE(1, 6).toString(16));
    // Throws ERR_OUT_OF_RANGE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

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
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.readUintLE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед чтением. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт прочитать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Читает из `buf` начиная с `offset` ровно `byteLength` байт и интерпретирует результат как беззнаковое целое (little-endian) с точностью до 48 бит.

Также доступна под псевдонимом `readUintLE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

    console.log(buf.readUIntLE(0, 6).toString(16));
    // Prints: ab9078563412
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xab]);

    console.log(buf.readUIntLE(0, 6).toString(16));
    // Prints: ab9078563412
    ```

### `buf.subarray([start[, end]])`

<!-- YAML
added: v3.0.0
-->

-   `start` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) С какого индекса начинается новый `Buffer`. **По умолчанию:** `0`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Где заканчивается новый `Buffer` (не включая). **По умолчанию:** `buf.length`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Возвращает новый `Buffer`, ссылающийся на ту же память, что и исходный, но со смещением и обрезкой по индексам `start` и `end`.

Если указать `end` больше [`buf.length`](#buflength), результат совпадёт с вариантом, когда `end` равен [`buf.length`](#buflength).

Метод унаследован от [`TypedArray.prototype.subarray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/subarray).

Изменение нового фрагмента `Buffer` меняет память в исходном `Buffer`, потому что выделенная память у обоих объектов перекрывается.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Отрицательные индексы задают срез относительно конца `buf`, а не начала.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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
    - v17.5.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41596
    description: The buf.slice() method has been deprecated.
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

Добавлено в: v0.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.5.0, v16.15.0 | Метод buf.slice() устарел. |
    | v7.1.0, v6.9.2 | Приведение смещений к целым числам теперь правильно обрабатывает значения вне диапазона 32-битных целых чисел. |
    | v7.0.0 | Все смещения теперь приводятся к целым числам перед выполнением каких-либо вычислений с ними. |

> Stability: 0 - Deprecated: Use [`buf.subarray`](#bufsubarraystart-end) instead.

-   `start` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) С какого индекса начинается новый `Buffer`. **По умолчанию:** `0`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Где заканчивается новый `Buffer` (не включая). **По умолчанию:** `buf.length`.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Возвращает новый `Buffer`, ссылающийся на ту же память, что и исходный, но со смещением и обрезкой по индексам `start` и `end`.

Метод не совместим с `Uint8Array.prototype.slice()`, от которого наследуется `Buffer`. Чтобы скопировать срез, используйте `Uint8Array.prototype.slice()`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from('buffer');

    const copiedBuf = Uint8Array.prototype.slice.call(buf);
    copiedBuf[0]++;
    console.log(copiedBuf.toString());
    // Prints: cuffer

    console.log(buf.toString());
    // Prints: buffer

    // With buf.slice(), the original buffer is modified.
    const notReallyCopiedBuf = buf.slice();
    notReallyCopiedBuf[0]++;
    console.log(notReallyCopiedBuf.toString());
    // Prints: cuffer
    console.log(buf.toString());
    // Also prints: cuffer (!)
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from('buffer');

    const copiedBuf = Uint8Array.prototype.slice.call(buf);
    copiedBuf[0]++;
    console.log(copiedBuf.toString());
    // Prints: cuffer

    console.log(buf.toString());
    // Prints: buffer

    // With buf.slice(), the original buffer is modified.
    const notReallyCopiedBuf = buf.slice();
    notReallyCopiedBuf[0]++;
    console.log(notReallyCopiedBuf.toString());
    // Prints: cuffer
    console.log(buf.toString());
    // Also prints: cuffer (!)
    ```

### `buf.swap16()`

<!-- YAML
added: v5.10.0
-->

-   Возвращает: [<Buffer>](buffer.md#buffer) Ссылка на `buf`.

Interprets `buf` as an array of unsigned 16-bit integers and swaps the byte order _in-place_. Throws [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size) if [`buf.length`](#buflength) is not a multiple of 2.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

    console.log(buf1);
    // Prints: <Buffer 01 02 03 04 05 06 07 08>

    buf1.swap16();

    console.log(buf1);
    // Prints: <Buffer 02 01 04 03 06 05 08 07>

    const buf2 = Buffer.from([0x1, 0x2, 0x3]);

    buf2.swap16();
    // Throws ERR_INVALID_BUFFER_SIZE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

    console.log(buf1);
    // Prints: <Buffer 01 02 03 04 05 06 07 08>

    buf1.swap16();

    console.log(buf1);
    // Prints: <Buffer 02 01 04 03 06 05 08 07>

    const buf2 = Buffer.from([0x1, 0x2, 0x3]);

    buf2.swap16();
    // Throws ERR_INVALID_BUFFER_SIZE.
    ```

One convenient use of `buf.swap16()` is to perform a fast in-place conversion between UTF-16 little-endian and UTF-16 big-endian:

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from('This is little-endian UTF-16', 'utf16le');
    buf.swap16(); // Convert to big-endian UTF-16 text.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from('This is little-endian UTF-16', 'utf16le');
    buf.swap16(); // Convert to big-endian UTF-16 text.
    ```

### `buf.swap32()`

<!-- YAML
added: v5.10.0
-->

-   Возвращает: [<Buffer>](buffer.md#buffer) Ссылка на `buf`.

Interprets `buf` as an array of unsigned 32-bit integers and swaps the byte order _in-place_. Throws [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size) if [`buf.length`](#buflength) is not a multiple of 4.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

    console.log(buf1);
    // Prints: <Buffer 01 02 03 04 05 06 07 08>

    buf1.swap32();

    console.log(buf1);
    // Prints: <Buffer 04 03 02 01 08 07 06 05>

    const buf2 = Buffer.from([0x1, 0x2, 0x3]);

    buf2.swap32();
    // Throws ERR_INVALID_BUFFER_SIZE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

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

-   Возвращает: [<Buffer>](buffer.md#buffer) Ссылка на `buf`.

Интерпретирует `buf` как массив 64-битных чисел и меняет порядок байтов _на месте_. Выбрасывает [`ERR_INVALID_BUFFER_SIZE`](errors.md#err_invalid_buffer_size), если [`buf.length`](#buflength) не кратен 8.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

    console.log(buf1);
    // Prints: <Buffer 01 02 03 04 05 06 07 08>

    buf1.swap64();

    console.log(buf1);
    // Prints: <Buffer 08 07 06 05 04 03 02 01>

    const buf2 = Buffer.from([0x1, 0x2, 0x3]);

    buf2.swap64();
    // Throws ERR_INVALID_BUFFER_SIZE.
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

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

-   Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает JSON-представление `buf`. [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) неявно вызывает эту функцию при сериализации экземпляра `Buffer`.

`Buffer.from()` принимает объекты в формате, возвращаемом этим методом. В частности, `Buffer.from(buf.toJSON())` ведёт себя как `Buffer.from(buf)`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
    const json = JSON.stringify(buf);

    console.log(json);
    // Prints: {"type":"Buffer","data":[1,2,3,4,5]}

    const copy = JSON.parse(json, (key, value) => {
      return value && value.type === 'Buffer' ?
        Buffer.from(value) :
        value;
    });

    console.log(copy);
    // Prints: <Buffer 01 02 03 04 05>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
    const json = JSON.stringify(buf);

    console.log(json);
    // Prints: {"type":"Buffer","data":[1,2,3,4,5]}

    const copy = JSON.parse(json, (key, value) => {
      return value && value.type === 'Buffer' ?
        Buffer.from(value) :
        value;
    });

    console.log(copy);
    // Prints: <Buffer 01 02 03 04 05>
    ```

### `buf.toString([encoding[, start[, end]]])`

<!-- YAML
added: v0.1.90
changes:
  - version:
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |

-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка символов. **По умолчанию:** `'utf8'`.
-   `start` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в байтах, с которого начинать декодирование. **По умолчанию:** `0`.
-   `end` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в байтах, на котором декодирование останавливается (не включая). **По умолчанию:** `buf.length`.
-   Возвращает: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Декодирует `buf` в строку в соответствии с кодировкой `encoding`. Можно передать `start` и `end`, чтобы декодировать только часть `buf`.

Если `encoding` — `'utf8'`, а последовательность байтов во входе не является корректным UTF-8, каждый некорректный байт заменяется символом-заменителем `U+FFFD`.

Максимальная длина строки (в кодовых единицах UTF-16) задаётся константой [`buffer.constants.MAX_STRING_LENGTH`](#bufferconstantsmax_string_length).

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

-   Возвращает: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Создаёт и возвращает [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols) по значениям `buf` (байтам). Функция вызывается автоматически, когда `Buffer` используется в операторе `for..of`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

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

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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
changes:
  - version:
     - v25.5.0
     - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/56578
    description: supports Uint8Array as `this` value.
-->

Добавлено в: v0.1.90

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.5.0, v24.13.1 | поддерживает Uint8Array как значение this. |

-   `string` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью `string`. **По умолчанию:** `0`.
-   `length` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум байт для записи (не больше `buf.length - offset`). **По умолчанию:** `buf.length - offset`.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка символов `string`. **По умолчанию:** `'utf8'`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число записанных байт.

Записывает `string` в `buf` начиная с `offset` в кодировке `encoding`. Параметр `length` — сколько байт записать. Если в `buf` недостаточно места для всей строки, будет записана только часть `string`. Частично закодированные символы не записываются.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.alloc(256);

    const len = buf.write('\u00bd + \u00bc = \u00be', 0);

    console.log(`${len} bytes: ${buf.toString('utf8', 0, len)}`);
    // Prints: 12 bytes: ½ + ¼ = ¾

    const buffer = Buffer.alloc(10);

    const length = buffer.write('abcd', 8);

    console.log(`${length} bytes: ${buffer.toString('utf8', 8, 10)}`);
    // Prints: 2 bytes : ab
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.alloc(256);

    const len = buf.write('\u00bd + \u00bc = \u00be', 0);

    console.log(`${len} bytes: ${buf.toString('utf8', 0, len)}`);
    // Prints: 12 bytes: ½ + ¼ = ¾

    const buffer = Buffer.alloc(10);

    const length = buffer.write('abcd', 8);

    console.log(`${length} bytes: ${buffer.toString('utf8', 8, 10)}`);
    // Prints: 2 bytes : ab
    ```

### `buf.writeBigInt64BE(value[, offset])`

<!-- YAML
added:
 - v12.0.0
 - v10.20.0
-->

-   `value` [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(8);

    buf.writeBigInt64BE(0x0102030405060708n, 0);

    console.log(buf);
    // Prints: <Buffer 01 02 03 04 05 06 07 08>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

-   `value` [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(8);

    buf.writeBigInt64LE(0x0102030405060708n, 0);

    console.log(buf);
    // Prints: <Buffer 08 07 06 05 04 03 02 01>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.10.0, v12.19.0 | Эта функция также доступна как `buf.writeBigUint64BE()`. |

-   `value` [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian.

Также доступна под псевдонимом `writeBigUint64BE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(8);

    buf.writeBigUInt64BE(0xdecafafecacefaden, 0);

    console.log(buf);
    // Prints: <Buffer de ca fa fe ca ce fa de>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.10.0, v12.19.0 | Эта функция также доступна как `buf.writeBigUint64LE()`. |

-   `value` [<bigint>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться: `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(8);

    buf.writeBigUInt64LE(0xdecafafecacefaden, 0);

    console.log(buf);
    // Prints: <Buffer de fa ce ca fe fa ca de>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

    const buf = Buffer.allocUnsafe(8);

    buf.writeBigUInt64LE(0xdecafafecacefaden, 0);

    console.log(buf);
    // Prints: <Buffer de fa ce ca fe fa ca de>
    ```

Также доступна под псевдонимом `writeBigUint64LE`.

### `buf.writeDoubleBE(value[, offset])`

<!-- YAML
added: v0.11.15
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18395
    description: Removed `noAssert` and no implicit coercion of the offset
                 to `uint32` anymore.
-->

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian. `value` должно быть числом JavaScript. Поведение не определено, если `value` не является числом JavaScript.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(8);

    buf.writeDoubleBE(123.456, 0);

    console.log(buf);
    // Prints: <Buffer 40 5e dd 2f 1a 9f be 77>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 8`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian. `value` должно быть числом JavaScript. Поведение не определено, если `value` не является числом JavaScript.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(8);

    buf.writeDoubleLE(123.456, 0);

    console.log(buf);
    // Prints: <Buffer 77 be 9f 1a 2f dd 5e 40>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian. Поведение не определено, если `value` не является числом JavaScript.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeFloatBE(0xcafebabe, 0);

    console.log(buf);
    // Prints: <Buffer 4f 4a fe bb>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian. Поведение не определено, если `value` не является числом JavaScript.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeFloatLE(0xcafebabe, 0);

    console.log(buf);
    // Prints: <Buffer bb fe 4a 4f>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset`. `value` должно быть корректным знаковым 8-битным целым. Поведение не определено, если `value` не является таким числом.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(2);

    buf.writeInt8(2, 0);
    buf.writeInt8(-2, 1);

    console.log(buf);
    // Prints: <Buffer 02 fe>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian. `value` должно быть корректным знаковым 16-битным целым. Поведение не определено, если `value` не является таким числом.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(2);

    buf.writeInt16BE(0x0102, 0);

    console.log(buf);
    // Prints: <Buffer 01 02>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian. `value` должно быть корректным знаковым 16-битным целым. Поведение не определено, если `value` не является таким числом.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(2);

    buf.writeInt16LE(0x0304, 0);

    console.log(buf);
    // Prints: <Buffer 04 03>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian. `value` должно быть корректным знаковым 32-битным целым. Поведение не определено, если `value` не является таким числом.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeInt32BE(0x01020304, 0);

    console.log(buf);
    // Prints: <Buffer 01 02 03 04>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian. `value` должно быть корректным знаковым 32-битным целым. Поведение не определено, если `value` не является таким числом.

`value` интерпретируется и записывается как знаковое целое в дополнении до двух.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeInt32LE(0x05060708, 0);

    console.log(buf);
    // Prints: <Buffer 08 07 06 05>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт записать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `byteLength` байт `value` в `buf` по смещению `offset` в порядке big-endian. Поддерживается точность до 48 бит. Поведение не определено, если `value` не является знаковым целым.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(6);

    buf.writeIntBE(0x1234567890ab, 0, 6);

    console.log(buf);
    // Prints: <Buffer 12 34 56 78 90 ab>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт записать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `byteLength` байт `value` в `buf` по смещению `offset` в порядке little-endian. Поддерживается точность до 48 бит. Поведение не определено, если `value` не является знаковым целым.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(6);

    buf.writeIntLE(0x1234567890ab, 0, 6);

    console.log(buf);
    // Prints: <Buffer ab 90 78 56 34 12>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUint8()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 1`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset`. `value` должно быть корректным беззнаковым 8-битным целым. Поведение не определено, если `value` не является таким числом.

Также доступна под псевдонимом `writeUint8`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeUInt8(0x3, 0);
    buf.writeUInt8(0x4, 1);
    buf.writeUInt8(0x23, 2);
    buf.writeUInt8(0x42, 3);

    console.log(buf);
    // Prints: <Buffer 03 04 23 42>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUint16BE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian. `value` должно быть корректным беззнаковым 16-битным целым. Поведение не определено, если `value` не является таким числом.

Также доступна под псевдонимом `writeUint16BE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeUInt16BE(0xdead, 0);
    buf.writeUInt16BE(0xbeef, 2);

    console.log(buf);
    // Prints: <Buffer de ad be ef>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUint16LE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 2`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian. `value` должно быть корректным беззнаковым 16-битным целым. Поведение не определено, если `value` не является таким числом.

Также доступна под псевдонимом `writeUint16LE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeUInt16LE(0xdead, 0);
    buf.writeUInt16LE(0xbeef, 2);

    console.log(buf);
    // Prints: <Buffer ad de ef be>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUint32BE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке big-endian. `value` должно быть корректным беззнаковым 32-битным целым. Поведение не определено, если `value` не является таким числом.

Также доступна под псевдонимом `writeUint32BE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeUInt32BE(0xfeedface, 0);

    console.log(buf);
    // Prints: <Buffer fe ed fa ce>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUint32LE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - 4`. **По умолчанию:** `0`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `value` в `buf` по смещению `offset` в порядке little-endian. `value` должно быть корректным беззнаковым 32-битным целым. Поведение не определено, если `value` не является таким числом.

Также доступна под псевдонимом `writeUint32LE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(4);

    buf.writeUInt32LE(0xfeedface, 0);

    console.log(buf);
    // Prints: <Buffer ce fa ed fe>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUintBE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт записать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `byteLength` байт `value` в `buf` по смещению `offset` в порядке big-endian. Поддерживается точность до 48 бит. Поведение не определено, если `value` не является беззнаковым целым.

Также доступна под псевдонимом `writeUintBE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(6);

    buf.writeUIntBE(0x1234567890ab, 0, 6);

    console.log(buf);
    // Prints: <Buffer 12 34 56 78 90 ab>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

Добавлено в: v0.5.5

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.9.0, v12.19.0 | Эта функция также доступна как `buf.writeUintLE()`. |
    | v10.0.0 | Удален noAssert и больше нет неявного приведения смещения и byteLength к uint32. |

-   `value` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число для записи в `buf`.
-   `offset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт пропустить перед записью. Должно выполняться `0 <= offset <= buf.length - byteLength`.
-   `byteLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько байт записать. Должно выполняться `0 < byteLength <= 6`.
-   Возвращает: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `offset` плюс число записанных байт.

Записывает `byteLength` байт `value` в `buf` по смещению `offset` в порядке little-endian. Поддерживается точность до 48 бит. Поведение не определено, если `value` не является беззнаковым целым.

Также доступна под псевдонимом `writeUintLE`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';

    const buf = Buffer.allocUnsafe(6);

    buf.writeUIntLE(0x1234567890ab, 0, 6);

    console.log(buf);
    // Prints: <Buffer ab 90 78 56 34 12>
    ```

=== "CJS"

    ```js
    const { Buffer } = require('node:buffer');

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Вызов этого конструктора выдает предупреждение об устаревании при запуске из кода вне каталога `node_modules`. |
    | v7.2.1 | Вызов этого конструктора больше не выдает предупреждение об устаревании. |
    | v7.0.0 | Вызов этого конструктора теперь выдает предупреждение об устаревании. |

> Stability: 0 - Deprecated: Use [`Buffer.from(array)`](#static-method-bufferfromarray) instead.

-   `array` [<integer[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Массив байтов для копирования.

См. [`Buffer.from(array)`](#static-method-bufferfromarray).

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

Добавлено в: v3.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Вызов этого конструктора выдает предупреждение об устаревании при запуске из кода вне каталога `node_modules`. |
    | v7.2.1 | Вызов этого конструктора больше не выдает предупреждение об устаревании. |
    | v7.0.0 | Вызов этого конструктора теперь выдает предупреждение об устаревании. |
    | v6.0.0 | Параметры `byteOffset` и `length` теперь поддерживаются. |

> Stability: 0 - Deprecated: Use [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length) instead.

-   `arrayBuffer` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<SharedArrayBuffer>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) или свойство `.buffer` у [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).
-   `byteOffset` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Индекс первого байта, который нужно «раскрыть». **По умолчанию:** `0`.
-   `length` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байтов для «раскрытия». **По умолчанию:** `arrayBuffer.byteLength - byteOffset`.

См. [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Вызов этого конструктора выдает предупреждение об устаревании при запуске из кода вне каталога `node_modules`. |
    | v7.2.1 | Вызов этого конструктора больше не выдает предупреждение об устаревании. |
    | v7.0.0 | Вызов этого конструктора теперь выдает предупреждение об устаревании. |

> Stability: 0 - Deprecated: Use [`Buffer.from(buffer)`](#static-method-bufferfrombuffer) instead.

-   `buffer` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Существующий `Buffer` или [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), из которого копируются данные.

См. [`Buffer.from(buffer)`](#static-method-bufferfrombuffer).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Вызов этого конструктора выдает предупреждение об устаревании при запуске из кода вне каталога `node_modules`. |
    | v8.0.0 | `new Buffer(size)` по умолчанию возвращает заполненную нулями память. |
    | v7.2.1 | Вызов этого конструктора больше не выдает предупреждение об устаревании. |
    | v7.0.0 | Вызов этого конструктора теперь выдает предупреждение об устаревании. |

> Stability: 0 - Deprecated: Use [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) instead (also see [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize)).

-   `size` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Желаемая длина нового `Buffer`.

См. [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) и [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize). Этот вариант конструктора эквивалентен [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Вызов этого конструктора выдает предупреждение об устаревании при запуске из кода вне каталога `node_modules`. |
    | v7.2.1 | Вызов этого конструктора больше не выдает предупреждение об устаревании. |
    | v7.0.0 | Вызов этого конструктора теперь выдает предупреждение об устаревании. |

> Stability: 0 - Deprecated: Use [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding) instead.

-   `string` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка для кодирования.
-   `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка `string`. **По умолчанию:** `'utf8'`.

См. [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding).

## Класс: `File`

<!-- YAML
added:
  - v19.2.0
  - v18.13.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/47613
    description: Makes File instances cloneable.
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/47153
    description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Делает экземпляры файлов клонируемыми. |
    | v20.0.0 | Больше не экспериментально. |

-   Наследует: [<Blob>](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

[File](https://developer.mozilla.org/en-US/docs/Web/API/File) представляет сведения о файле.

### `new buffer.File(sources, fileName[, options])`

<!-- YAML
added:
  - v19.2.0
  - v18.13.0
-->

-   `sources` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<ArrayBuffer[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<TypedArray[]>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<Blob[]>](https://developer.mozilla.org/en-US/docs/Web/API/Blob) | [<File[]>](https://developer.mozilla.org/en-US/docs/Web/API/File) Массив строк, [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView), [File](https://developer.mozilla.org/en-US/docs/Web/API/File) или [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), либо любая смесь таких объектов, которые будут помещены в `File`.
-   `fileName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла.
-   `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `endings` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'transparent'` или `'native'`. При `'native'` окончания строк в строковых частях приводятся к виду, заданному `require('node:os').EOL`.
    -   `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) MIME-тип файла.
    -   `lastModified` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Время последнего изменения файла. **По умолчанию:** `Date.now()`.

### `file.name`

<!-- YAML
added:
  - v19.2.0
  - v18.13.0
-->

-   Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя `File`.

### `file.lastModified`

<!-- YAML
added:
  - v19.2.0
  - v18.13.0
-->

-   Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Дата последнего изменения `File`.

## API модуля `node:buffer`

Хотя объект `Buffer` доступен глобально, дополнительные API, связанные с `Buffer`, доступны только через модуль `node:buffer` (`require('node:buffer')`).

### `buffer.atob(data)`

<!-- YAML
added:
  - v15.13.0
  - v14.17.0
-->

> Stability: 3 - Legacy. Use `Buffer.from(data, 'base64')` instead.

-   `data` {any} Входная строка в Base64.

Декодирует строку Base64 в байты и кодирует эти байты в строку Latin-1 (ISO-8859-1).

`data` может быть любым значением JavaScript, приводимым к строке.

**Функция оставлена для совместимости со старыми веб-API и не должна использоваться в новом коде: строки для двоичных данных и отсутствие типизированных массивов устарели. В коде на Node.js преобразование между base64 и двоичными данными делайте через `Buffer.from(str, 'base64')` и `buf.toString('base64')`.**

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

### `buffer.btoa(data)`

<!-- YAML
added:
  - v15.13.0
  - v14.17.0
-->

> Stability: 3 - Legacy. Use `buf.toString('base64')` instead.

-   `data` {any} Строка ASCII (Latin1).

Декодирует строку в байты по Latin-1 (ISO-8859) и кодирует байты в Base64.

`data` может быть любым значением JavaScript, приводимым к строке.

**Функция оставлена для совместимости со старыми веб-API и не должна использоваться в новом коде. В коде на Node.js используйте `Buffer.from(str, 'base64')` и `buf.toString('base64')`.**

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

### `buffer.isAscii(input)`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   `input` [<Buffer>](buffer.md#buffer) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) Входные данные для проверки.
-   Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `input` содержит только корректные данные в ASCII, в том числе при пустом `input`.

Выбрасывает исключение, если `input` — отсоединённый `ArrayBuffer`.

### `buffer.isUtf8(input)`

<!-- YAML
added:
  - v19.4.0
  - v18.14.0
-->

-   `input` [<Buffer>](buffer.md#buffer) | [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) Входные данные для проверки.
-   Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `input` содержит только корректные данные UTF-8, в том числе при пустом `input`.

Выбрасывает исключение, если `input` — отсоединённый `ArrayBuffer`.

### `buffer.INSPECT_MAX_BYTES`

<!-- YAML
added: v0.5.4
-->

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `50`

Максимальное число байт, возвращаемых при вызове `buf.inspect()`. Пользовательские модули могут переопределить значение. Подробнее о поведении `buf.inspect()` см. [`util.inspect()`](util.md#utilinspectobject-options).

### `buffer.kMaxLength`

<!-- YAML
added: v3.0.0
-->

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший допустимый размер одного экземпляра `Buffer`.

Псевдоним [`buffer.constants.MAX_LENGTH`](#bufferconstantsmax_length).

### `buffer.kStringMaxLength`

<!-- YAML
added: v3.0.0
-->

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольшая допустимая длина одного примитива `string`.

Псевдоним [`buffer.constants.MAX_STRING_LENGTH`](#bufferconstantsmax_string_length).

### `buffer.resolveObjectURL(id)`

<!-- YAML
added: v16.7.0
changes:
 - version:
    - v24.0.0
    - v22.17.0
   pr-url: https://github.com/nodejs/node/pull/57513
   description: Marking the API stable.
-->

Добавлено в: v16.7.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

-   `id` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка URL вида `'blob:nodedata:...`, полученная ранее от `URL.createObjectURL()`.
-   Возвращает: [<Blob>](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

Сопоставляет `'blob:nodedata:...'` с соответствующим объектом [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), зарегистрированным ранее через `URL.createObjectURL()`.

### `buffer.transcode(source, fromEnc, toEnc)`

<!-- YAML
added: v7.1.0
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10236
    description: The `source` parameter can now be a `Uint8Array`.
-->

Добавлено в: v7.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Параметр `source` теперь может быть `Uint8Array`. |

-   `source` [<Buffer>](buffer.md#buffer) | [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Экземпляр `Buffer` или `Uint8Array`.
-   `fromEnc` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исходная кодировка.
-   `toEnc` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Целевая кодировка.
-   Возвращает: [<Buffer>](buffer.md#buffer)

Перекодирует данные из одной символьной кодировки в другую. Возвращает новый `Buffer`.

Выбрасывает исключение при недопустимых `fromEnc` или `toEnc` или если такое перекодирование запрещено.

`buffer.transcode()` поддерживает кодировки: `'ascii'`, `'utf8'`, `'utf16le'`, `'ucs2'`, `'latin1'` и `'binary'`.

При невозможности представить последовательность байт в целевой кодировке используются символы замены. Например:

=== "MJS"

    ```js
    import { Buffer, transcode } from 'node:buffer';

    const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
    console.log(newBuf.toString('ascii'));
    // Prints: '?'
    ```

=== "CJS"

    ```js
    const { Buffer, transcode } = require('node:buffer');

    const newBuf = transcode(Buffer.from('€'), 'utf8', 'ascii');
    console.log(newBuf.toString('ascii'));
    // Prints: '?'
    ```

Так как символ евро (`€`) не представим в US-ASCII, в результате перекодирования он заменяется на `?`.

### Константы Buffer

<!-- YAML
added: v8.2.0
-->

#### `buffer.constants.MAX_LENGTH`

<!-- YAML
added: v8.2.0
changes:
  - version: v22.0.0
    pr-url: https://github.com/nodejs/node/pull/52465
    description: Value is changed to 2<sup>53</sup> - 1 on 64-bit
      architectures, and 2<sup>31</sup> - 1 on 32-bit architectures.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35415
    description: Value is changed to 2<sup>32</sup> on 64-bit
      architectures.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/32116
    description: Value is changed from 2<sup>31</sup> - 1 to
      2<sup>32</sup> - 1 on 64-bit architectures.
-->

Добавлено в: v8.2.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0 | Значение изменяется на 2<sup>53</sup> — 1 в 64-разрядных архитектурах и на 2<sup>31</sup> — 1 в 32-разрядных архитектурах. |
    | v15.0.0 | Значение изменяется на 2<sup>32</sup> в 64-разрядных архитектурах. |
    | v14.0.0 | Значение изменено с 2<sup>31</sup> – 1 на 2<sup>32</sup> – 1 в 64-разрядных архитектурах. |

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольший допустимый размер одного экземпляра `Buffer`.

На 32-битных архитектурах значение равно 2<sup>31</sup> - 1 (около 2 ГиБ).

На 64-битных — [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (2<sup>53</sup> - 1, около 8 ПиБ).

Внутри соответствует [`v8::Uint8Array::kMaxLength`](https://v8.github.io/api/head/classv8_1_1Uint8Array.html#a7677e3d0c9c92e4d40bef7212f5980c6).

То же значение доступно как [`buffer.kMaxLength`](#bufferkmaxlength).

#### `buffer.constants.MAX_STRING_LENGTH`

<!-- YAML
added: v8.2.0
-->

-   Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Наибольшая допустимая длина одного примитива `string`.

Наибольшая длина `length` у примитива `string` в UTF-16 кодовых единицах.

Значение может зависеть от движка JavaScript.

## `Buffer.from()`, `Buffer.alloc()` и `Buffer.allocUnsafe()`

В версиях Node.js до 6.0.0 экземпляры `Buffer` создавались функцией-конструктором `Buffer`, которая выделяла память под возвращаемый `Buffer` по-разному в зависимости от аргументов:

-   Передача числа первым аргументом в `Buffer()` (например `new Buffer(10)`) выделяет новый объект `Buffer` заданного размера. До Node.js 8.0.0 память для таких экземпляров _не_ инициализировалась и _могла содержать конфиденциальные данные_. Такие экземпляры _нужно_ было затем инициализировать через [`buf.fill(0)`](#buffillvalue-offset-end-encoding) или записью во весь `Buffer` до чтения. Поведение было _намеренным_ ради производительности, но на практике потребовалось явнее различать «быстрый неинициализированный» и «медленный безопасный» буфер. С Node.js 8.0.0 выражения `Buffer(num)` и `new Buffer(num)` возвращают `Buffer` с инициализированной памятью.
-   Передача строки, массива или `Buffer` первым аргументом копирует данные объекта в `Buffer`.
-   Передача [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) возвращает `Buffer`, разделяющий выделенную память с соответствующим буфером массива.

Так как поведение `new Buffer()` зависит от типа первого аргумента, при недостаточной проверке аргументов или инициализации можно непреднамеренно создать проблемы безопасности и надёжности.

Например, если злоумышленник заставит приложение получить число там, где ожидалась строка, может вызваться `new Buffer(100)` вместо `new Buffer("100")` — будет выделен буфер на 100 байт вместо трёх байт со строкой `"100"`. Такое часто возможно через JSON API: типы числа и строки различимы, и в наивный код без проверки можно подставить число. До Node.js 8.0.0 буфер на 100 байт мог содержать произвольные остатки памяти и использоваться для утечки секретов. С Node.js 8.0.0 память обнуляется, но возможны другие атаки — например выделение очень больших буферов и исчерпание памяти.

Чтобы сделать создание `Buffer` надёжнее, варианты конструктора `new Buffer()` **устарели** и заменены методами `Buffer.from()`, [`Buffer.alloc()`](#static-method-bufferallocsize-fill-encoding) и [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize).

_Следует перенести весь существующий код с `new Buffer()` на эти API._

-   [`Buffer.from(array)`](#static-method-bufferfromarray) возвращает новый `Buffer` с _копией_ переданных октетов.
-   [`Buffer.from(arrayBuffer[, byteOffset[, length]])`](#static-method-bufferfromarraybuffer-byteoffset-length) возвращает новый `Buffer`, _разделяющий память_ с указанным [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).
-   [`Buffer.from(buffer)`](#static-method-bufferfrombuffer) возвращает новый `Buffer` с _копией_ содержимого данного `Buffer`.
-   [`Buffer.from(string[, encoding])`](#static-method-bufferfromstring-encoding) возвращает новый `Buffer` с _копией_ строки.
-   [`Buffer.alloc(size[, fill[, encoding]])`](#static-method-bufferallocsize-fill-encoding) возвращает новый инициализированный `Buffer` заданного размера. Медленнее [`Buffer.allocUnsafe(size)`](#static-method-bufferallocunsafesize), но гарантирует отсутствие старых чувствительных данных. При нечисловом `size` выбрасывается `TypeError`.
-   [`Buffer.allocUnsafe(size)`](#static-method-bufferallocunsafesize) и [`Buffer.allocUnsafeSlow(size)`](#static-method-bufferallocunsafeslowsize) возвращают новый неинициализированный `Buffer` заданного размера; в памяти могут остаться старые данные.

Экземпляры, возвращаемые [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize), [`Buffer.from(string)`](#static-method-bufferfromstring-encoding), [`Buffer.concat()`](#static-method-bufferconcatlist-totallength) и [`Buffer.from(array)`](#static-method-bufferfromarray), _могут_ выделяться из общего внутреннего пула, если `size` не больше половины `Buffer.poolSize`. Экземпляры от [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) общий пул _никогда_ не используют.

### Опция командной строки `--zero-fill-buffers`

<!-- YAML
added: v5.10.0
-->

Node.js можно запускать с флагом `--zero-fill-buffers`, чтобы все вновь выделенные `Buffer` по умолчанию обнулялись. Без флага буферы, созданные через [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) и [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize), не обнуляются. Флаг может заметно снизить производительность; включайте его только если нужно гарантировать отсутствие старых данных в новой памяти.

```console
$ node --zero-fill-buffers
> Buffer.allocUnsafe(5);
<Buffer 00 00 00 00 00>
```

### Почему `Buffer.allocUnsafe()` и `Buffer.allocUnsafeSlow()` «небезопасны»?

При вызове [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) и [`Buffer.allocUnsafeSlow()`](#static-method-bufferallocunsafeslowsize) выделенный участок памяти _не инициализирован_ (не обнулён). Это ускоряет выделение, но в памяти могут остаться старые данные. Использование `Buffer` от [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) без _полной_ перезаписи может привести к утечке этих данных при чтении.

Производительность [`Buffer.allocUnsafe()`](#static-method-bufferallocunsafesize) выше, но нужна повышенная осторожность, чтобы не ввести уязвимости.
