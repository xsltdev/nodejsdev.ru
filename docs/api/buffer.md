---
description: Экземпляры класса Buffer похожи на массивы целых чисел, однако соотносятся с фиксированным, сырым распределением памяти вне движка V8
---

# Класс Buffer

!!!success "Стабильность: 2"

    Стабильно

До появления `TypedArray` в ECMAScript 2015 (ES6), JavaScript не имел механизма считывания и управления потоками бинарных данных. Класс `Buffer` был введен как часть Node.js API чтобы сделать возможным взаимодействие с потоками в контексте таких явлений, как TCP-потоки и операции с файловыми системами.

Теперь, когда `TypedArray` был добавлен в ES6, класс `Buffer` включает `Uint8Array` API в более удобном и оптимизированном виде для Node.js.

Экземпляры класса `Buffer` похожи на массивы целых чисел, однако соотносятся с фиксированным, сырым распределением памяти вне движка V8. Размер для `Buffer` установлен в процессе создания и не может быть изменен.

Класс `Buffer` является глобальным в Node.js, так что вряд ли понадобится использовать `require("buffer")`.

```js
const buf1 = Buffer.alloc(10);
// Creates a zero-filled Buffer of length 10.

const buf2 = Buffer.alloc(10, 1);
// Creates a Buffer of length 10, filled with 0x01.

const buf3 = Buffer.allocUnsafe(10);
// Creates an uninitialized buffer of length 10.
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using either fill() or write().
const buf4 = Buffer.from([1, 2, 3]);
// Creates a Buffer containing [01, 02, 03].

const buf5 = Buffer.from('test');
// Creates a Buffer containing ASCII bytes [74, 65, 73, 74].

const buf6 = Buffer.from('tést', 'utf8');
// Creates a Buffer containing UTF8 bytes [74, c3, a9, 73, 74].
```

## Buffer.from(), Buffer.alloc() и Buffer.allocUnsafe()

Исторически сложилось так, что экземпляры `Buffer` создавались с помощью конструктора `Buffer`, который распределяет возвращаемый `Buffer` по-разному, основываясь на заданных аргументах:

- Если первому аргументу `Buffer()` передается число (например, `new Buffer(10)`), то создается новый объект буфера заданного размера. Память для каждого экземпляра буфера не инициализируется и может содержать конфиденциальные данные. Такие объекты буфера могут быть инициализированы вручную, посредством `buf.fill(0)` или с помощью записывания полностью в `Buffer`. Такое поведение является предусмотренным для того, чтобы повысить производительность, однако, опыт разработки показывает, что есть явное различие между созданием быстрого, но не инициализированного буфера и созданием медленного, но безопасного.
- Если первому аргументу передается строка, массив или буфер, то переданные объекты копируются в буфер.
- `ArrayBuffer` в качестве аргумента возвращает `Buffer`, который делится памятью с `ArrayBuffer`.

Так как поведение `newBuffer()` существенно изменяется в зависимости от задаваемого первого аргумента, приложения, которые не проверяют точно входящие аргументы, передаваемые в `newBuffer()`, или те, которые не могут должным образом инициализировать новое содержимое буфера, могут поставить под угрозу безопасность и надежность кода.

Для того, чтобы сделать процесс создания объектов более надежным и менее склонным к ошибкам, новые методы `Buffer.from()`, `Buffer.alloc()` и `Buffer.alllocUnsafe()` должны быть представлены как альтернативные способы создания экземпляров `Buffer`.

Разработчики могут переместить все существующие `newBuffer()` конструкторы в один из этих API:

- `Buffer.from(array)` возвращает новый буфер, содержащий копию существующих данных.
- `Buffer.from(arrayBuffer[, byteOffset [, length]])` возвращает новые буфер, который делится выделенной памятью с `ArrayBuffer`.
- `Buffer.from(buffer)` возвращает новый буфер, содержащий копию содержимого данного буфера.
- `Buffer.from(str, [, encoding])` возвращает новый буфер, содержащий копию заданной строки.
- `Buffer.alloc(size[, fill[, encoding]])` возвращает «заполненный» экземпляр буфера заданного размера. Этот метод может быть существенно медленнее, чем `Buffer.allocUnsafe(size)`, но обеспечивает то, что новосозданный буфер не будет содержать старые или потенциально незащищенные данные.
- `Buffer.allocUnsafe(size)` возвращает новый буфер заданного размера, чье содержимое должно быть инициализировано с помощью `buff.fill(0)` или полностью написано вручную.

Экземпляры `Buffer`, возвращаемые `Buffer.allocUnsafe(size)` могут занимать выделенную из совместного пула память, если их размер меньше или равен половине `Buffer.poolSize`.

**Что делает `Buffer.allocUnsafe(size)` «небезопасным»?**

При вызове `Buffer.allocUnsafe(size)`, сегмент выделенной памяти является неинициализированным (не обнуленным). В то время, как распределение памяти происходит довольно быстро, выделенный сегмент памяти может содержать старые данные, которые могут быть потенциально незащищенными. Использование буфера, созданного `Buffer.allocUnsafe(size)` без полной перезаписи памяти может позволить этим старым данным просочиться во время чтения буфера.

Несмотря на явные преимущества в производительности при использовании `Buffer.allocUnsafe(size)`, нужно быть предельно внимательным и принять все меры для того, чтобы избежать уязвимостей безопасности в приложении.

## Буферы и кодировки

Буферы используются в основном для представления последовательности кодированных символов, типа UTF8, UCS2, Base64 или даже шестнадцатеричные данные. Их можно конвертировать между буферами и обычными строками-объектами JavaScript при помощи определенного метода кодирования.

```js
const buf = Buffer.from('hello world', 'ascii');

console.log(buf.toString('hex'));
// prints: 68656c6c6f20776f726c64

console.log(buf.toString('base64'));
// prints: aGVsbG8gd29ybGQ=
```

Кодировки, на данный момент поддерживаемые Node.js:

- `ascii` – для семибитный ascii-данных. Этот метод кодирования очень быстрый и ставит вперед старший бит.
- `utf8–` мультибайтно кодированные Unicode-символы. Многие веб-страницы и прочие форматы документов используют UTF-8.
- `utf16le` – 2 или 4 байта, кодируют Unicode-символы в прямом порядке. Поддерживаются взаимозаменяемые пары (от `U+10000` до `U+10FFFF`).
- `ucs2` – аналог `utf16le`
- `base64` – Base64 строковое кодирование. При создании буфера из строки это кодирование корректно поддерживает «Безопасный алфавит для URL и названий файлов», как определено в RFC 4648, раздел 5.
- `binary` – Способ кодирования буфера в однобайтовую (`latin-1`) строку. Строка `latin-1` не поддерживается. Вместо этого нужно передать бинарное значение для использования кодировки `latin-1`.
- `hex` – кодирует каждый байт как два шестнадцатеричных символа.

## Буферы и TypedArray

Буферы также являются экземплярами `Uint8Array` в `TypedArray`. Однако, присутствуют маленькие несовместимости в спецификации `TypedArray` в ECMAScript 2015. Например, когда `ArrayBuffer#slice()` создает копию метода `slice`, реализация `Buffer#slice()` создает надстройку над существующим буфером без копирования, делая `Buffer#slice()` гораздо более продвинутым.

Новые экземпляры `TypedArray` также возможно создать из буфера с некоторыми нюансами:

- Память для объектов буфера копируется в `TypedArray`, а не расшаривается.
- Память для объектов буфера интерпретируется как массив определенных элементов, а не как байтовый массив заданного типа. Так, `new Uint32Array(Buffer.from([1,2,3,4]))` создает `Uint32Array` из 4 элементов `[1,2,3,4]`, а не c одним элементом `[0x1020304]` или `[0x4030201]`.

Можно создать новый буфер, который расшарит ту же самую выделенную память как у экземпляров `TypedArray` с помощью свойств `.buffer` объектов `TypedArray`:

```js
const arr = new Uint16Array(2);
arr[0] = 5000;
arr[1] = 4000;

const buf1 = Buffer.from(arr); // copies the buffer

const buf2 = Buffer.from(arr.buffer); // shares the memory with arr;

console.log(buf1);
// Prints: <Buffer 88 a0>, copied buffer has only two elements

console.log(buf2);
// Prints: <Buffer 88 13 a0 0f>

arr[1] = 6000;

console.log(buf1);
// Prints: <Buffer 88 a0>

console.log(buf2);
// Prints: <Buffer 88 13 70 17>
```

Запомните, что создавая буфер через `.buffer`, возможно использовать только часть основного `ArrayBuffer`, передавая параметры `byteOffset` и `length`:

```js
const arr = new Uint16Array(20);

const buf = Buffer.from(arr.buffer, 0, 16);

console.log(buf.length);
// Prints: 16
```

`Buffer.from()` и `TypedArray.from()` имеют разные свойства и реализации. В частности, `TypedArray` принимает второй аргумент, являющейся функцией отображения, вызываемой на каждом элементе массива.

```
TypedArray.from(source[, mapFn[, thisArg]])
```

Метод `Buffer.from()`, напротив, не поддерживает использование функции отображения:

- `Buffer.from(array)`
- `Buffer.from(buffer)`
- `Buffer.from(arrayBuffer[, byteOffset [, length]])`
- `Buffer.from(str[, encoding])`

## Буферы и итерации ES6

Буферы могут быть разбиты на итерации с помощью синтакса `for..of` из ECMAScript 2015 (ES6):

```js
const buf = Buffer.from([1, 2, 3]);

for (var b of buf) console.log(b);

// Prints:
//   1
//   2
//   3
```

Кроме этого, методы `buf.values()`, `buf.keys()` и `buf.entries()` также могут быть использованы для создания итераций.

## --zero-fill-buffers параметр командной строки

Node.js может быть запущен с помощью флага командной строки `--zero-fill-buffers` чтобы заставить все нововыделенные буферы и экземпляры `SlowBuffer`, созданные посредством `new Buffer(size)` или `new SlowBuffer(size)` автоматически обнулиться перед созданием. Использование этого флага изменяет поведение по умолчанию этих методов и может оказать существенное влияние на производительность. Использование `--zero-fill-buffers` рекомендуется только в том случае, когда это необходимо для того, чтобы нововыделенный буфер не содержал потенциально уязвимые данные.

```
$ node --zero-fill-buffers
> Buffer(5);
<Buffer 00 00 00 00 00>
```

## Класс Buffer

Класс `Buffer` принадлежит к глобальному типу для работы напрямую с бинарными данными. Он может быть использован несколькими способами:

### new Buffer()

```
new Buffer(array)
```

!!!danger "Стабильность: 0"

    устарело или набрало много негативных отзывов

`array` `<массив>`
: Выделяет новый буфер используя массив с восьмибитными числами

```js
const buf = new Buffer([
  0x62,
  0x75,
  0x66,
  0x66,
  0x65,
  0x72,
]);
// creates a new Buffer containing ASCII bytes
// ['b','u','f','f','e','r']
```

---

```
new Buffer(buffer)
```

!!!danger "Стабильность: 0"

    устарело или набрало много негативных отзывов

`buffer` `<буфер>`
: Копирует данные из буфера в новый экземпляр `Buffer`.

```js
const buf1 = new Buffer('buffer');
const buf2 = new Buffer(buf1);
buf1[0] = 0x61;

console.log(buf1.toString());
// 'auffer'

console.log(buf2.toString());
// 'buffer' (copy is not changed)
```

---

```
new Buffer(arrayBuffer[, byteOffset[, length]])
```

!!!danger "Стабильность: 0"

    устарело или набрало много негативных отзывов

`arrayBuffer`
: свойство `.buffer` из `TypedArray` или `new ArrayBuffer()`

`byteOffset` `<число>`
: по умолчанию: `0`

`length` `<число>`
: по умолчанию: `arrayBuffer.length – byteOffset`.

При передаче свойствам `.buffer` ссылки на экземпляры `TypedArray`, на новосозданный буфер будет расшарена та же выделенная память, что и на `TypedArray`.

Опционально `byteOffset` и `length` аргументы определяют диапазон памяти внутри `arrayBuffer`, которая будет расшарена буфером.

```js
const arr = new Uint16Array(2);
arr[0] = 5000;
arr[1] = 4000;

const buf = new Buffer(arr.buffer); // shares the memory with arr;

console.log(buf);
// Prints: <Buffer 88 13 a0 0f>

// changing the TypdArray changes the Buffer also
arr[1] = 6000;

console.log(buf);
// Prints: <Buffer 88 13 70 17>
```

---

```
new Buffer(size)
```

!!!danger "Стабильность: 0"

    устарело или набрало много негативных отзывов

`size` `<число>`
: Выделяет новому буферу `<число>` байт. `size` может быть меньше или равно значению `require("buffer").kMaxLength` (в 64-битных архитектурах `kMaxLength` равно `(2^31)-1`). В противном случае выпадает `RangeError`. Если `size` меньше `0`, создается нулевой буфер.

В отличие от `ArrayBuffers`, основная память для экземпляров `Buffer`, созданная таким способом, не инициализируется. Содержание новосозданного буфера является неизвестным и может содержать уязвимые данные. Нужно использовать `buf.fill(0)`, чтобы инициализировать буфер как пустой.

```js
const buf = new Buffer(5);

console.log(buf);
// <Buffer 78 e0 82 02 01>
// (octets will be different, every time)

buf.fill(0);
console.log(buf);
// <Buffer 00 00 00 00 00>
```

---

```
new Buffer(str[, encoding])
```

!!!danger "Стабильность: 0"

    устарело или набрало много негативных отзывов

`str` `<Строка>`
: Строка, подлежащая кодированию.

`encoding` `<Строка>`
: По умолчанию: `utf8`

Создает новый буфер, содержащий заданную строку `str` JavaScript. Если задано условие, параметр кодирования определяет кодировку символов строки.

```js
const buf1 = new Buffer('this is a tést';);

console.log(buf1.toString());
// prints: this is a tést

console.log(buf1.toString('ascii';));
// prints: this is a tC)st

const buf2 = new Buffer('7468697320697320612074c3a97374', 'hex');

console.log(buf2.toString());
// prints: this is a tést
```

### Buffer.alloc()

```
Buffer.alloc(size[, fill[, encoding]])
```

`size` `<число>`
: Размер в байтах

`fill` `<значение>`
: По умолчанию: `undefined`

`encoding` `<Строка>`
: По умолчанию: `utf8`

Выделяет новому буферу `<число>` байт. Если `fill` не задано значение, буфер будет пустым.

```js
const buf = Buffer.alloc(5);
console.log(buf);
// <Buffer 00 00 00 00 00>
```

`size` может быть меньше или равно значению `require("buffer").kMaxLength` (в 64-битных архитектурах `kMaxLength` равно `(2^31)-1`). В противном случае выпадает `RangeError`. Если `size` меньше `0`, создается нулевой буфер.

Если `fill` определено, выделенный буфер будет инициализироваться посредством: `buf.fill(fill)`.

```js
const buf = Buffer.alloc(5, 'a');

console.log(buf);
// <Buffer 61 61 61 61 61>
```

Если и `fill` и `encoding` определены, выделенный буфер будет инициализироваться так: `buf.fill(fill, encoding)`.

```js
const buf = Buffer.alloc(11, 'aGVsbG8gd29ybGQ=', 'base64');

console.log(buf);
// <Buffer 68 65 6c 6c 6f 20 77 6f 72 6c 64>
```

Команда `Buffer.alloc(size)` может выполняться существенно медленнее, чем альтернативная `Buffer.allocUnsafe(size)`, но обеспечивает то, что созданный буфер не будет содержать потенциально уязвимых данных.

Если передать `size` не число, выпадает ошибка `TypeError`.

### Buffer.allocUnsafe()

```
Buffer.allocUnsafe(size)
```

`size` `<число>`
: Размер в байтах

Выделяет ненулевой буфер размером указанного числа байт. `size` может быть меньше или равно значению `require("buffer").kMaxLength` (в 64-битных архитектурах `kMaxLength` равно `(2^31)-1`). В противном случае выпадает `RangeError`. Если `size` меньше `0`, создается нулевой буфер.

Основная память для экземпляров `Buffer`, созданная таким способом, не инициализируется. Содержание новосозданного буфера является неизвестным и может содержать уязвимые данные. Нужно использовать `buf.fill(0)`, чтобы инициализировать буфер как пустой.

```js
const buf = Buffer.allocUnsafe(5);

console.log(buf);
// <Buffer 78 e0 82 02 01>
// (octets will be different, every time)

buf.fill(0);

console.log(buf);
// <Buffer 00 00 00 00 00>
```

Если `size` не является числом, выпадает ошибка `TypeError`.

Следует заметить, что модуль буфера заранее размещает внутренние экземпляры буфера размера `size` `Buffer.poolSize`, которые используются как пул для быстрого размещения новых экземпляров буфера созданных с помощью `Buffer.allocUnsafe(size)` (и нового конструктора `Buffer(size)`) только в случае, если `size` меньше или равно `Buffer.poolSize >> 1` (граничный размер `Buffer.poolSize`, разделенный на `2`). По умолчанию значение `Buffer.poolSize` равно `8192`, но может быть отредактировано.

Использование предварительно выделенного пула памяти является ключевым отличием между вызовом `Buffer.alloc(size, fill)` и `Buffer.allocUnsafe(size).fill(fill)`. А именно, `Buffer.alloc(size, fill)` никогда не использует внутренний пул буфера, в то время, как `Buffer.allocUnsafe(size),fill(fill)` использует внутренний пул буфера если `size` меньше или равняется половине `Buffer.poolSize`. Эта разница несущественна, но может быть важной когда приложение требует дополнительной производительности, которую обеспечивает `Buffer.allocUnsafe(size)`.

### Buffer.byteLength()

```
Buffer.byteLength(string[, encoding])
```

`string` `<Строка>|<Буфер>|<TypedArray>|<DataView>|<ArrayBuffer>`
: Строка

`encoding` `<Строка>`
: По умолчанию: `utf8`

возвращает `<число>`

Возвращает актуальную длину строки в байтах. Это не то же самое, что `String.prototype.length`, так как последний возвращает число символов строки.

Пример:

```js
const str = '\u00bd + \u00bc = \u00be';

console.log(
  `${str}: ${str.length} characters, ` +
    `${Buffer.byteLength(str, 'utf8')} bytes`
);

// ½ + ¼ = ¾: 9 characters, 12 bytes
```

Когда `string` – это `Buffer/DataView/TypedArray/ArrayBuffer`, возвращается актуальная длина строки в байтах.

Во всех других случаях, конвертируется в `String` и возвращает длину строки в байтах.

### Buffer.compare()

```
Buffer.compare(buf1, buf2)
```

- `buf1` `<буфер>`
- `buf2` `<буфер>`
- возвращает `<число>`

Сравнивает `buf1` и `buf2` с целью сортировки массивов буферов. Эквивалент `buf1.compare(buf2)`.

```js
const arr = [Buffer.from('1234'), Buffer.from('0123')];
arr.sort(Buffer.compare);
```

### Buffer.concat()

```
Buffer.concat(list[, totalLength])
```

- `list` `<массив>`. Список объектов буфера для `concat`.
- `totalLength` `<число>`. Полная длина буферов в списке после выполнения `concat`.
- Возвращает `<буфер>`

Возвращает новый буфер, полученный в результате выполнения операции `concat` над всеми буферами в `list` одновременно.

Если в список не заполнен, или `totalLength` равняется `0`, тогда возвращается новый нулевой буфер.

Если `totalLength` не указан, он вычисляется из буферов в `list`. Однако, это добавляет дополнительный цикл в функцию, так что быстрее задать `totalLength` вручную.

Пример: создаем один буфер из списка с тремя буферами:

```js
const buf1 = Buffer.alloc(10, 0);
const buf2 = Buffer.alloc(14, 0);
const buf3 = Buffer.alloc(18, 0);
const totalLength = buf1.length + buf2.length + buf3.length;
console.log(totalLength);

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);
console.log(bufA);
console.log(bufA.length);

// 42
// <Buffer 00 00 00 00 ...>
// 42
```

### Buffer.from()

```
Buffer.from(array)
```

- `array` `<массив>`

Выделяет новый буфер используя `array`.

```js
const buf = Buffer.from([
  0x62,
  0x75,
  0x66,
  0x66,
  0x65,
  0x72,
]);
// creates a new Buffer containing ASCII bytes
// ['b','u','f','f','e','r']
```

Выпадает ошибка `TypeError`, если `array` не является массивом.

---

```
Buffer.from(arrayBuffer[, byteOffset[, length]])
```

- `arrayBuffer` `<массив буфера>`. Свойство `.buffer` из `TypedArray` или `newArrayBuffer()`
- `byteOffset` `<число>`. По умолчанию: `0`
- `length` `<число>`. По умолчанию: `arrayBuffer.length – byteOffset`

Когда передается ссылка свойству `.buffer` на экземпляр `TypedArray`, новосозданный буфер расшаривает одну и ту же выделенную память с `TypedArray`.

```js
const arr = new Uint16Array(2);

arr[0] = 5000;
arr[1] = 4000;

const buf = Buffer.from(arr.buffer); // shares the memory with arr;

console.log(buf);
// Prints: <Buffer 88 13 a0 0f>

// changing the TypedArray changes the Buffer also

arr[1] = 6000;

console.log(buf);
// Prints: <Buffer 88 13 70 17>
```

Опционально аргументы `byteOffset` и `length` определяют диапазон памяти внутри `arrayBuffer`, которая будет расшарена буфером.

```js
const ab = new ArrayBuffer(10);

const buf = Buffer.from(ab, 0, 2);

console.log(buf.length);
// Prints: 2
```

Выпадает ошибка `TypedError`, если `arrayBuffer` не является массивом буфера.

---

```
Buffer.from(buffer)
```

- `buffer` `<буфер>`

Копирует переданные данные буфера в новый экземпляр `Buffer`.

```js
const buf1 = Buffer.from('buffer');
const buf2 = Buffer.from(buf1);

buf1[0] = 0x61;
console.log(buf1.toString());
// 'auffer'
console.log(buf2.toString());
// 'buffer' (copy is not changed)
```

Выпадает ошибка `TypedError`, если буфер не принадлежит `Buffer`.

---

```
Buffer.from(str[, encoding])
```

- `str` `<Строка>`. Строка для кодирования
- `encoding` `<Строка>` Кодировка. По умолчанию: `utf8`

Создает новый буфер, содержащий исходную строку `str` JavaScript. Можно задать `encoding` другую кодировку. По умолчанию используется `utf8`.

```js
const buf1 = Buffer.from('this is a tést');

console.log(buf1.toString());
// prints: this is a tést

console.log(buf1.toString('ascii'));
// prints: this is a tC)st

const buf2 = Buffer.from(
  '7468697320697320612074c3a97374',
  'hex'
);

console.log(buf2.toString());
// prints: this is a tést
```

Если `str` не строка, то выпадает ошибка `TypeError`.

### Buffer.isBuffer()

```
Buffer.isBuffer(obj)
```

- `obj` `<Объект>`
- Возвращает `<Boolean>`

Возвращает `true`, если `obj` является буфером

### Buffer.isEncoding()

```
Buffer.isEncoding(encoding)
```

- `encoding` `<Строка>`. Кодированная строка для теста
- Возвращает `<Boolean>`

Возвращает `true`, если `encoding` имеет валидный аргумент, в противном случае возвращает `false`.

### buf[index]

Оператор индекса `[index]` может быть использован для того, чтобы получить и установить байты на позицию `index` в буфере. Значения относятся к отдельным байтам, так что диапазон допустимых значений находится между `0x00` и `0xFF` (шестнадцатеричная система) и `0` и `255` (десятеричная).

Пример: копирование ASCII строки в буфер по байтам:

```js
const str = "Node.js";
const buf = Buffer.allocUnsafe(str.length);

for (var i = 0; i < str.length ; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('ascii';));
// Prints: Node.js
```

### buf.compare()

```
buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])
```

- `target` `<буфер>`
- `targetStart` `<целое число>`. Смещение внутри `target`, с которого начинается сравнение. По умолчанию: `0`
- `targetEnd` `<целое число>`. Смещение с `target`, с которым заканчивается сравнение. Игнорируется, когда `targetStart` неопределен. По умолчанию: `target.byteLength`.
- `sourceStart` `<целое число>`. Смещение внутри `buf`, с которого начинается сравнение. Игнорируется, если `targetStart` неопределено, по умолчанию: `0`.
- `sourceEnd` `<целое число>`. Смещение внутри `buf`, с которым заканчивается сравнение. Игнорируется, если `targetStart` неопределен, по умолчанию: `buf.byteLength`.
- Возвращает `<число>`

Сравнивает экземпляры двух буферов и возвращает число, показывающее, появляется ли `buf` до, после или в то же время, что и `target` в порядке сортировки. Сравнение базируется на актуальной последовательности байтов каждого буфера.

- `0` возвращается, если `target` совпадает с `buf`
- `1` возвращается, если `target` должен идти перед `buf` в порядке сортировки
- `-1` возвращается, если `target` должен идти за `buf` в порядке сортировки

```js
const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('BCD');
const buf3 = Buffer.from('ABCD');

console.log(buf1.compare(buf1));
// Prints: 0
console.log(buf1.compare(buf2));
// Prints: -1 console.log(buf1.compare(buf3));
// Prints: 1
console.log(buf2.compare(buf1));
// Prints: 1 console.log(buf2.compare(buf3));
// Prints: 1

[buf1, buf2, buf3].sort(Buffer.compare);
// produces sort order [buf1, buf3, buf2]
```

Опционально аргументы `targetStart`, `targetEnd`, `sourceStart` и `sourceEnd` могут быть использованы для того, чтобы ограничить сравнение определенным диапазоном с помощью объектов двух буферов.

```js
const buf1 = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const buf2 = Buffer.from([5, 6, 7, 8, 9, 1, 2, 3, 4]);

console.log(buf1.compare(buf2, 5, 9, 0, 4));
// Prints: 0
console.log(buf1.compare(buf2, 0, 6, 4));
// Prints: -1
console.log(buf1.compare(buf2, 5, 6, 5));
// Prints: 1
```

### buf.copy()

```
buf.copy(targetBuffer[, targetStart[, sourceStart[, sourceEnd]]])
```

- `targetBuffer` `<буфер>`. Буфер, в который будет осуществляться копирование
- `targetStart` `<число>`. По умолчанию: `0`
- `sourceStart` `<число>`. По умолчанию: `0`
- `sourceEnd` `<число>`. По умолчанию: `buffer.length`
- возвращает `<число>`. Количество копированных байтов.

```js
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');
for (var i = 0; i < 26; i++) {
  buf1[i] = i + 97;
  // 97 is ASCII a
}
buf1.copy(buf2, 8, 16, 20);
console.log(buf2.toString('ascii', 0, 25));
// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
```

Пример: создать один буфер, затем скопировать данные из одной области в ту же область того же буфера

```js
const buf = Buffer.allocUnsafe(26);

for (var i = 0; i < 26; i++) {
  buf1[i] = i + 97; // 97 is ASCII a
}

buf.copy(buf, 0, 4, 10);
console.log(buf.toString());

// efghijghijklmnopqrstuvwxyz
```

### buf.entries()

```
buf.entries()
```

- возвращает `<итератор>`

Создает и возвращает итератор пар `[index, byte]` из содержимого буфера.

```js
const buf = Buffer.from('buffer');

for (var pair of buf.entries()) {
  console.log(pair);
}
// prints: // [0, 98]
// [1, 117]
// [2, 102]
// [3, 102]
// [4, 101]
// [5, 114]
```

### buf.equals()

```
buf.equals(otherBuffer)
```

- `otherBuffer` `<буфер>`
- возвращает `<Boolean>`

Возвращает логическое значение, показывающее, имеют ли данный и `otherBuffer` одинаковые байты.

```js
const buf1 = Buffer.from('ABC');
constbuf2 = Buffer.from('414243', 'hex');
constbuf3 = Buffer.from('ABCD');

console.log(buf1.equals(buf2));
// Prints: true

console.log(buf1.equals(buf3));
// Prints: false
```

### buf.fill()

```
buf.fill(value[, offset[, end]][, encoding])
```

- `value` `<Строка> | <буфер> | `<число>``
- `offset` `<число>`. По умолчанию: `0`
- `end` `<число>`. По умолчанию: `buf.length`
- `encoding` `<Строка>`. По умолчанию: `utf8`
- возвращает `<буфер>`

Заполняет буфер заданными значениями. Если `offset` (которое по умолчанию равно `0`) и `end` (по умолчанию `buf.length`) не заданы, будет заполнен весь буфер. Метод возвращает ссылку на буфер, так что вызовы могут быть связаны. Имеется в виду, что можно упростить создание буфера. Можно реализовать создание и заполнение буфера в одну строку:

```js
const b = Buffer.alloc(50, 'h');
console.log(b.toString());
// Prints: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
```

`encoding` является уместным только если `value` строка. В противном случае кодировка просто игнорируется. `value` приводится к значению `uint32`, если не является строкой или числом.

Операция `fill()` записывает байты в буфер без какой-либо индикации. Если окончательная запись выпадает между многобайтовым символом, то в буфер записываются все подходящие байты.

```js
Buffer.alloc(3, '\u0222');
// Prints: <Buffer c8 a2 c8>
```

### buf.indexOf()

```
buf.indexOf(value[, byteOffset][, encoding])
```

- `value` `<Строка> | <буфер> | `<число>``
- `byteOffset` `<число>`. По умолчанию: `0`
- `encoding` `<Строка>`. По умолчанию `utf8`
- возвращает `<число>`

Работает похоже на `Array#indexOf()`, так как возвращает либо стартовый индекс позиции `value` в буфере, либо `-1`, если буфер не содержит `value`. Само `value` может быть строкой, буфером или числом. Строки могут быть по умолчанию интерпретированы как UTF8. Буферы будут использовать целый буфер (для того, чтобы сравнивать буфер частично, нужно использовать `buf.slice()`). Числа могут варьироваться от `0` до `255`.

```js
const buf = Buffer.from('this is a buffer');

buf.indexOf('this');
// returns 0

buf.indexOf('is');
// returns 2

buf.indexOf(Buffer.from('a buffer'));
// returns 8

buf.indexOf(97); // ascii for 'a'
// returns 8
buf.indexOf(Buffer.from('a buffer example'));
// returns -1

buf.indexOf(Buffer.from('a buffer example').slice(0, 8));
// returns 8

const utf16Buffer = Buffer.from(
  '\u039a\u0391\u03a3\u03a3\u0395',
  'ucs2'
);

utf16Buffer.indexOf('\u03a3', 0, 'ucs2');
// returns 4

utf16Buffer.indexOf('\u03a3', -4, 'ucs2');
// returns 6
```

### buf.includes()

```
buf.includes(value[, byteOffset][, encoding])
```

- `value` `<Строка> | <буфер> | `<число>``
- `byteOffset` `<число>`. По умолчанию: `0`
- `encoding` `<Строка>`. По умолчанию `utf8`
- возвращает `<Boolean>`

Работает похоже на `Array#includes()`. Значение `value` может быть строкой, буфером или числом. Строки интерпретируются как UTF8, если аргумент `encoding` не определен. Буферы будут использовать целый буфер (для того, чтобы сравнивать буфер частично, нужно использовать `buf.slice()`). Числа могут варьироваться от `0` до `255`.

`byteOffset` отображает индекс в `buf`, с которого начинается поиск.

```js
const buf = Buffer.from('this is a buffer');

buf.includes('this');
// returns true

buf.includes('is');
// returns true

buf.includes(Buffer.from('a buffer'));
// returns true

buf.includes(97); // ascii for 'a'
// returns true
buf.includes(Buffer.from('a buffer example'));
// returns false

buf.includes(Buffer.from('a buffer example').slice(0, 8));
// returns true

buf.includes('this', 4);
// returns false
```

### buf.keys()

```
buf.keys()
```

- возвращает `<Итератор>`

Создает и возвращает итератор ключей (индексов) буфера.

```js
const buf = Buffer.from('buffer');

for (var key of buf.keys()) {
  console.log(key);
}
// prints:
// 0
// 1
// 2
// 3
// 4
// 5
```

### buf.length

```
buf.length
```

- `<число>` Возвращает количество выделенной памяти для буфера в байтах.

Следует заметить, что необязательно отображается количество используемых данных в буфере. Например, в примере ниже буферу отведено 1234 байта, но только занято только 11 ASCII байтов.

```js
const buf = Buffer.allocUnsafe(1234);

console.log(buf.length);
// Prints: 1234

buf.write('some string', 0, 'ascii');
console.log(buf.length);
// Prints: 1234
```

Так как свойство `length` является неизменным, изменение значения `length` может привести к непредсказуемому поведению. Приложения, которые хотят изменить длину буфера должны видеть `length` открытым только для чтения и использовать `buf.slice()` для создания нового буфера.

```js
var buf = Buffer.allocUnsafe(10);

buf.write('abcdefghj', 0, 'ascii');

console.log(buf.length);
// Prints: 10

buf = buf.slice(0, 5);

console.log(buf.length);
// Prints: 5
```

### buf.readDoubleLE()

```
buf.readDoubleLE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 8`
- `noAssert` `<Boolean>` По умолчанию: `false`
- возвращает `<число>`

Считывает 64-битное число типа `double` из буфера при заданном смещении с указанным `endian` форматом (`readDoubleBE()` возвращает большой `endian`, `readDoubleLE()` возвращает малый `endian`)

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

```js
const buf = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);

buf.readDoubleBE();
// Returns: 8.20788039913184e-304
buf.readDoubleLE();
// Returns: 5.447603722011605e-270
buf.readDoubleLE(1);
// throws RangeError: Index out of range

buf.readDoubleLE(1, true); // Warning: reads passed end of buffer!
// Segmentation fault! don't do this!
```

### buf.readFloatLE()

```
buf.readFloatLE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 4`
- `noAssert` `<Boolean>` По умолчанию: `false`
- возвращает `<число>`

Считывает 32-битное число типа `float` из буфера при заданном смещении с указанным `endian` форматом (`readFloatBE()` возвращает большой `endian`, `readFloatLE()` возвращает малый `endian`)

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

```js
const buf = Buffer.from([1, 2, 3, 4]);

buf.readFloatBE();
// Returns: 2.387939260590663e-38
buf.readFloatLE();
// Returns: 1.539989614439558e-36
buf.readFloatLE(1);
// throws RangeError: Index out of range

buf.readFloatLE(1, true); // Warning: reads passed end of buffer!
// Segmentation fault! don't do this!
```

### buf.readInt8()

```
buf.readInt8(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 1`
- `noAssert` `<Boolean>` По умолчанию: `false`
- возвращает `<число>`

Считывает 8-битное знаковое число типа `integer` из буфера при заданном смещении.

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

Целые числа (`integer`), считанные из буфера, интерпретируются как парные взаимодополняемые значения.

```js
const buf = Buffer.from([1, -2, 3, 4]);

buf.readInt8(0);
// returns 1
buf.readInt8(1);
// returns -2
```

### buf.readInt16BE(), buf.readInt16LE()

```
buf.readInt16BE(offset[, noAssert])
buf.readInt16LE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 2`
- `noAssert` По умолчанию: `false`
- возвращает `<число>`

Считывает 16-битное знаковое целое число из буфера при заданом смещении с указанным `endian` форматом (`readInt16BE()` возвращает большой `endian`, `readInt16LE()` возвращает малый `endian`).

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

Целые числа (`integer`), считанные из буфера, интерпретируются как парные взаимодополняемые значения.

```js
const buf = Buffer.from([1, -2, 3, 4]);

buf.readInt16BE();
// returns 510

buf.readInt16LE(1);
// returns 1022
```

### buf.readInt32BE(), buf.readInt32LE()

```
buf.readInt32BE(offset[, noAssert])
buf.readInt32LE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 4`
- `noAssert` По умолчанию: `false`
- Возвращает `<число>`

Считывает 32-битное знаковое целое число из буфера при заданом смещении с указанным `endian` форматом (`readInt32BE()` возвращает большой `endian`, `readInt32LE()` возвращает малый `endian`).

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

Целые числа (`integer`), считанные из буфера, интерпретируются как парные взаимодополняемые значения.

```js
const buf = Buffer.from([1, -2, 3, 4]);

buf.readInt32BE();
// returns 33424132

buf.readInt32LE();
// returns 67370497

buf.readInt32LE(1);
// throws RangeError: Index out of range
```

### buf.readIntBE(), buf.readIntLE()

```
buf.readIntBE(offset[, noAssert])
buf.readIntLE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – byteLength`
- `byteLength` `<число>` `0 <= byteLength <= 6`
- `noAssert` По умолчанию: `false`
- возвращает `<число>`

Считывает количество байт `byteLength` из буфера при заданном смещении и интерпретирует результат как пару взаимозаменяемых значений. Подерживает точность до 48 бит. Пример:

```js
const buf = Buffer.allocUnsafe([6);

buf.writeUInt16LE(0x90ab, 0);

buf.writeUInt32LE(0x12345678, 2);

buf.readIntLE(0, 6).toString(16);// Specify 6 bytes (48 bits)
// Returns: '1234567890ab'

buf.readIntBE(0, 6).toString(16);
// Returns: -546f87a9cbee
```

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

### buf.readUInt8()

```
buf.readUInt8(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 1`
- `noAssert` `<Boolean>` По умолчанию: `false`
- возвращает `<число>`

Считывает 8-битное беззнаковое число типа `integer` из буфера при заданном смещении.

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

Целые числа (`integer`), считанные из буфера, интерпретируются как парные взаимодополняемые значения.

```js
const buf = Buffer.from([1, -2, 3, 4]);

buf.readInt8(0);
// returns 1
buf.readInt8(1);
// returns 254
```

### buf.readUInt16BE(), buf.readUInt16LE()

```
buf.readUInt16BE(offset[, noAssert])
buf.readUInt16LE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 2`
- `noAssert` По умолчанию: `false`
- возвращает `<число>`

Считывает 16-битное беззнаковое целое число из буфера при заданом смещении с указанным `endian` форматом (`readInt16BE()` возвращает большой `endian`, `readInt16LE()` возвращает малый `endian`).

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

```js
const buf = Buffer.from([0x3, 0x4, 0x23, 0x42]);

buf.readUInt16BE(0);
// returns 0x0304

buf.readUInt16LE(0);
// returns 0x0403

buf.readUInt16BE(1);
// returns 0x0423

buf.readUInt16LE(1);
// returns 0x2304

buf.readUInt16BE(2);
// returns 0x2342

buf.readUInt16LE(1);
// returns 0x4223
```

### buf.readUInt32BE(), buf.readUInt32LE()

```
buf.readUInt32BE(offset[, noAssert])
buf.readUInt32LE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – 2`
- `noAssert` По умолчанию: `false`
- возвращает `<число>`

Считывает 32-битное беззнаковое целое число из буфера при заданом смещении с указанным `endian` форматом (`readInt32BE()` возвращает большой `endian`, `readInt32LE()` возвращает малый `endian`).

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

```js
const buf = Buffer.from([0x3, 0x4, 0x23, 0x42]);

buf.readUInt16BE(0);
// returns 0x03042342

console.log(buf.readUInt16LE(0));
// returns 0x42230403
```

### buf.readUIntBE(), buf.readUIntLE()

```
buf.readUIntBE(offset[, noAssert])
buf.readUIntLE(offset[, noAssert])
```

- `offset` `<число>` `0 <= offset <= buf.length – byteLength`
- `byteLength` `<число>` `0 <= byteLength <= 6`
- `noAssert` По умолчанию: `false`
- возвращает `<число>`

Считывает количество байт `byteLength` из буфера при заданном смещении и интерпретирует результат как пару взаимозаменяемых значений. Подерживает точность до 48 бит. Пример:

```js
const buf = Buffer.allocUnsafe([6);

buf.writeUInt16LE(0x90ab, 0);

buf.writeUInt32LE(0x12345678, 2);

buf.readUIntLE(0, 6).toString(16);// Specify 6 bytes (48 bits)
// Returns: '1234567890ab'

buf.readUIntBE(0, 6).toString(16);
// Returns: ab9078563412
```

Задание `noAssert` значения `true` пропускает валидацию смещения. Это позволяет `offset` выходить за пределы буфера.

### buf.slice()

```
buf.slice([start[, end]])
```

- `start` `<число>`. По умолчанию: `0`
- `end` `<число>`. По умолчанию: `buffer.length`
- возвращает `<буфер>`

Возвращает новый буфер, который ссылается на ту же самую память, что и исходный, но смещен и ограничен индексами `start` и `end`.

Обратите внимание, что изменение части нового буфера изменит количество памяти, выделенной под исходный буфер, потому что выделенная память двух объектов пересекается.

Пример: создание буфера с ASCII алфавитом, выделение части, затем модификация одного байта из исходного буфера:

```js
const buf = Buffer.allocUnsafe(26);

for (var i = 0; i < 26; i++) {
  buf1[i] = i + 97;
  // 97 is ASCII a
}

const buf2 = buf1.slice(0, 3);

buf2.toString('ascii', 0, buf2.length);
// Returns: 'abc'

buf1[0] = 33;

buf2.toString('ascii', 0, buf2.length);
// Returns : '!bc'
```

Задание отрицательных индексов заставит часть буфера генерироваться с конца буфера, а не с начала.

```js
const buf = Buffer.allocUnsafe(26);

for (var i = 0; i < 26; i++) {
  buf1[i] = i + 97;
  // 97 is ASCII a
}

const buf = Buffer.from('buffer');

buf.slice(-6, -1).toString();
// Returns 'buffe', equivalent to buf.slice(0, 5)

buf.slice(-6, -2).toString();
//Returns 'buff', equivalent to buf.slice(0, 4)

buf.slice(-5, -2).toString();
// Returns 'uff', equivalent to buf.slice(1, 4)
```

### buf.swap16()

```
buf.swap16()
```

- возвращает `<буфер>`

Интерпретирует буфер как массив беззнаковых 16-битных целых чисел и меняет порядок байтов тут же. Выдает `RangeError`, если длина буфера не является числом, кратным 16 бит. Метод возвращает ссылку на буфер, так что вызовы могут быть связаны.

```js
const buf = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf);
// Prints Buffer(0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8)

buf.swap16();
console.log(buf);
// Prints Buffer(0x2, 0x1, 0x4, 0x3, 0x6, 0x5, 0x8, 0x7)
```

### buf.swap32()

```
buf.swap32()
```

- возвращает `<буфер>`

Интерпретирует буфер как массив беззнаковых 32-битных целых чисел и меняет порядок байтов тут же. Выдает `RangeError`, если длина буфера не является числом, кратным 32 бит. Метод возвращает ссылку на буфер, так что вызовы могут быть связаны.

```js
const buf = Buffer.from([
  0x1,
  0x2,
  0x3,
  0x4,
  0x5,
  0x6,
  0x7,
  0x8,
]);

console.log(buf);
// Prints Buffer(0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8)

buf.swap32();
console.log(buf);
// Prints Buffer(0x4, 0x3, 0x2, 0x1, 0x8, 0x7, 0x6, 0x5)
```

### buf.toString()

```
buf.toString([encoding[, start[, end]]])
```

- `encoding` `<число>` `utf8`
- `start` `<число>`. По умолчанию: `0`
- `end` `<число>`. По умолчанию: `buffer.length`
- возвращает `<Строка>`

Декодирует и возвращает строку из данных буфера, используя заданную кодировку символов.

```js
const buf = Buffer.allocUnsafe(26);

for (var i = 0; i < 26; i++) {
  buf1[i] = i + 97;
  // 97 is ASCII a
}

buf.toString('ascii');
// Returns: 'abcdefghijklmnopqrstuvwxyz'

buf.toString('ascii', 0, 5);
// Returns: 'abcde'

buf.toString('utf8', 0, 5);
// Returns: 'abcde'

buf.toString(undefined, 0, 5);
// Returns: 'abcde', encoding defaults to 'utf8'
```

### buf.toJSON()

```
buf.toJSON()
```

- возвращает `<Объект>`

Возвращает образ JSON экземпляра буфера. `JSON.stringify()` неявно вызывает эту функцию, когда превращает экземпляр класса в строку.

Пример:

```js
const buf = Buffer.from('test');

const json = JSON.stringify(buf);

console.log(json);
// Prints: '{"type":"Buffer","data":[116,101,115,116]}'

const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer'
    ? Buffer.from(value.data)
    : value;
});

console.log(copy.toString());
// Prints: 'test'
```

### buf.values()

```
buf.values()
```

- возвращает `<итератор>`

Создает и возвращает итератор значений буфера (байты). Эта функция вызывается автоматически когда буфер используется в выражении `for...of`.

```js
const buf = Buffer.from('test');

for (var value of buf.values()) {
  console.log(value);
}
// prints:
// 98
// 117
// 102
// 102
// 101
// 114

for (var value of buf) {
  console.log(value);
}
// prints:
// 98
// 117
// 102
// 102
// 101
// 114
```

### buf.write()

```
buf.write(string[, offset[, length]][, encoding])
```

- `string` `<Строка>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0`
- `length` `<число>`. По умолчанию: `buffer.length - offset`
- `encoding` `<число>`. По умолчанию: `utf8`
- возвращает `<число>`. Количество записанных байт

Записывает строку в буфер при смещении, используя заданную кодировку. Параметр `length` определяет число байт для записи. Если буфер не содержит достаточно места для того, чтобы поместить всю строку, записывается только часть строки. Однако, частично кодированные символы не записываются:

```js
const buf = Buffer.allocUnsafe(256);
const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(
  `${len} bytes: ${buf.toString('utf8', 0, len)}`
);
// Prints: 12 bytes: ½ + ¼ = ¾
```

### buf.writeDoubleBE()

```
buf.writeDoubleBE(value, offset[, noAssert]), buf.writeDoubleLE(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 8`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении с указанным `endian` форматом (`writeDoubleBE()` записывает большой `endian`, `writeDoubleLE()` – малый `endian`). Аргумент `value` должен быть валидным 64-битным числом типа `double`. Поведение непредсказуемо, если `value` не является 64-битным `double` числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

```js
const buf = Buffer.allocUnsafe(8);

buf.writeDoubleBE(0xdeadbeefcafebabe, 0);

console.log(buf);
// Prints:

buf.writeDoubleLE(0xdeadbeefcafebabe, 0);

console.log(buf);
// Prints:
```

### buf.writeFloatBE()

```
buf.writeFloatBE(value, offset[, noAssert]), buf.writeFloatLE(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 4`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении с указанным `endian` форматом (`writeFloatBE()` записывает большой `endian`, `writeFloatLE()` – малый `endian`). Аргумент `value` должен быть валидным 32-битным числом типа `float`. Поведение непредсказуемо, если `value` не является 32-битным `float` числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

```js
const buf = Buffer.allocUnsafe(4);

buf.writeFloatBE(0xcafebabe, 0);

console.log(buf);
// Prints:

buf.writeFloatLE(0xcafebabe, 0);

console.log(buf);
// Prints:
```

### buf.writeInt8()

```
buf.writeInt8(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 1`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении. Аргумент `value` должен быть валидным знаковым 8-битным целым числом. Поведение непредсказуемо, если `value` не является знаковым 8-битным целым числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

`value` интерпретируется и записывается как пара взаимодополняемых знаковых целых чисел.

```js
const buf = Buffer.allocUnsafe(2);

buf.writeInt8(2, 0);

buf.writeInt8(-2, 1);

console.log(buf);
// Prints:
```

### buf.writeInt16BE()

```
buf.writeInt16BE(value, offset[, noAssert]), buf.writeInt16LE(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 2`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении с указанным `endian` форматом (`writeInt16BE()` записывает большой `endian`, `writeInt16LE()` – малый `endian`). Аргумент `value` должен быть валидным знаковым 16-битным целым числом. Поведение непредсказуемо, если `value` не является знаковым 16-битным целым числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

`value` интерпретируется и записывается как пара взаимодополняемых знаковых целых чисел.

```js
const buf = Buffer.allocUnsafe(4);
buf.writeInt16BE(0x0102, 0);
buf.writeInt16LE(0x0304, 2);

console.log(buf);
// Prints:
```

### buf.writeInt32BE(), buf.writeInt32LE()

```
buf.writeInt32BE(value, offset[, noAssert])
buf.writeInt32LE(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 4`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении с указанным `endian` форматом (`writeInt32BE()` записывает большой `endian`, `writeInt32LE()` – малый `endian`). Аргумент `value` должен быть валидным знаковым 32-битным целым числом. Поведение непредсказуемо, если `value` не является знаковым 32-битным целым числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

`value` интерпретируется и записывается как пара взаимодополняемых знаковых целых чисел.

```js
const buf = Buffer.allocUnsafe(8);
buf.writeInt32BE(0x01020304, 0);
buf.writeInt32LE(0x05060708, 4);

console.log(buf);
// Prints:
```

### buf.writeIntBE(), buf.writeIntLE()

```
buf.writeIntBE(value, offset, byteLength[, noAssert])
buf.writeIntLE(value, offset, byteLength[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – byteLength`
- `byteLength` `<число>`. По умолчанию: `0 <= byteLength<= 6`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении и `byteLength`. Поддерживает точность до 48 бит. Например:

```js
const buf1 = Buffer.allocUnsafe(6);
buf.writeUIntBE(0x1234567890ab, 0, 6);

console.log(buf1);
// Prints:

const buf2 = Buffer.allocUnsafe(6);
buf.writeUIntLE(0x1234567890ab, 0, 6);

console.log(buf2);
// Prints:
```

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

### buf.writeUInt8()

```
buf.writeUInt8(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 1`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении. Аргумент `value` должен быть валидным беззнаковым 8-битным целым числом. Поведение непредсказуемо, если `value` не является беззнаковым 8-битным целым числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

`value` интерпретируется и записывается как пара взаимодополняемых знаковых целых чисел.

```js
const buf = Buffer.allocUnsafe(4);

buf.writeUInt8(0x3, 0);
buf.writeUInt8(0x4, 1);
buf.writeUInt8(0x23, 2);
buf.writeUInt8(0x42, 3);

console.log(buf);
// Prints:
```

### buf.writeUInt16BE(), buf.writeUInt16LE()

```
buf.writeUInt16BE(value, offset[, noAssert])
buf.writeUInt16LE(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 2`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении с указанным `endian` форматом (`writeUInt16BE()` записывает большой `endian`, `writeUInt16LE()` – малый `endian`). Аргумент `value` должен быть валидным беззнаковым 16-битным целым числом. Поведение непредсказуемо, если `value` не является беззнаковым 16-битным целым числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

Пример:

```js
const buf = Buffer.allocUnsafe(4);

buf.writeUInt16BE(0xdead, 0);
buf.writeUInt16BE(0xbeef, 2);

console.log(buf);
// Prints:
buf.writeUInt16LE(0xdead, 0);
buf.writeUInt16LE(0xbeef, 2);
console.log(buf); // Prints:
```

### buf.writeUInt32BE(), buf.writeUInt32LE()

```
buf.writeUInt32BE(value, offset[, noAssert])
buf.writeUInt32LE(value, offset[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – 4`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении с указанным `endian` форматом (`writeUInt32BE()` записывает большой `endian`, `writeUInt32LE()` – малый `endian`). Аргумент `value` должен быть валидным беззнаковым 32-битным целым числом. Поведение непредсказуемо, если `value` не является беззнаковым 32-битным целым числом.

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

Пример:

```js
const buf = Buffer.allocUnsafe(4);

buf.writeUInt32BE(0xfeedface, 0);

console.log(buf);
// Prints:
buf.writeUInt32ДE(0xfeedface, 0);
console.log(buf); // Prints:
```

### buf.writeUIntBE(), buf.writeUIntLE()

```
buf.writeUIntBE(value, offset, byteLength[, noAssert])
buf.writeUIntLE(value, offset, byteLength[, noAssert])
```

- `value` `<число>`. Байты для записи в буфер
- `offset` `<число>`. По умолчанию: `0 <= offset <= buf.length – byteLength`
- `byteLength` `<число>`. По умолчанию: `0 <= byteLength<= 6`
- `noAssert` . По умолчанию: `false`
- возвращает `<число>`. Смещение плюс количество записанных байт

Записывает `value` в буфер при заданном смещении и `byteLength`. Поддерживает точность до 48 бит. Например:

```js
const buf = Buffer.allocUnsafe(6);

buf.writeUIntBE(0x1234567890ab, 0, 6);

console.log(buf1);
// Prints:
```

Задание `noAssert` значения `true` для пропускает валидацию `value` или `offset`. Это означает, что `value` может иметь слишком большое значение для определенной функции и `offset` может выходить за пределы буфера приводя к тому, что значения удалятся без предупреждения. Не следует использовать этот прием, кроме тех случаев, когда вы уверены в корректности его применения.

## Buffer.INSPECT_MAX_BYTES

- `<число>`. По умолчанию: `50`

Возвращает максимальное количество байт которые будут возвращены после вызова `buffer.inspect()`. Пользовательские модули могут переопределить поведение. Смотреть `util.inspect()`, чтобы узнать больше информации по поведению `buffer.inspect()`. Следует заметить, что это свойство модуля буфера, возвращаемое `require("buffer")` не относится к глобальным параметрам буфера или его экземплярам.

## Класс SlowBuffer

!!!danger "Стабильность: 0"

    отклонено пользователями См. вместо этого `Buffer.allocUnsafeSlow(size)`

Возвращает буфер без пула.

Для того, чтобы избежать накопления лишних файлов из-за создания множества индивидуально-выделенных буферов, выделенная по умолчанию память 4 кБ отделяется от одного большого выделенного объекта. Это улучшает производительность и использование памяти, так как v8 не требуется больше отслеживать и очищать большое количество Persistent объектов.

В случае, когда разработчику нужно сохранить часть памяти из пула течение неопределенного периода времени, целесообразно создать экземпляр буфера без пула с помощью `SlowBuffer`, а затем копировать соответствующие биты.

```js
const store = [];

socket.on('readable', () => {
  var data = socket.read();
  // allocate for retained data

  var sb = SlowBuffer(10);
  // copy the data into the new allocation

  data.copy(sb, 0, 10, 10);
  store.push(sb);
});
```

Использовать `SlowBuffer` следует только в крайнем случае после того, как разработчик нашел чрезмерное использование памяти в приложении.

### new SlowBuffer()

```
new SlowBuffer(size)
```

!!!danger "Стабильность: 0"

    отклонено пользователями См. вместо этого `Buffer.allocUnsafeSlow(size)`

- `size` Число

Выделяет новый `SlowBuffer` размером `size` байт. `size` должен быть меньше или равен значению `require("buffer").kMaxLength` (в 64-битных архитектурах `kMaxLength` равняется `(2^31)-1`). Во всех других случаях выпадает ошибка `RangeError`. Если `size` задано меньше `0`, создается `SlowBuffer` с нулевым значением `length`.

Основная память для экземпляров `SlowBuffer` не инициализируется. Содержимое новосозданного `SlowBuffer` неизвестно и может содержать уязвимые данные. Следует использовать `buf.fill(0)` для того, чтобы инициализировать `SlowBuffer` как нулевой.

```js
const SlowBuffer = require('buffer').SlowBuffer;

const buf = new SlowBuffer(5);

console.log(buf);
//
// (octets will be different, every time)

buf.fill(0);

console.log(buf);
// )
```
