---
title: String decoder
description: Модуль string_decoder предоставляет API для декодирования объектов Buffer в строки с сохранением закодированных многобайтовых символов UTF-8 и UTF-16
---

# Декодер строк

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/string_decoder.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:string_decoder`** предоставляет API для декодирования объектов `Buffer` в строки с сохранением закодированных многобайтовых символов UTF-8 и UTF-16. Доступ к нему можно получить, используя:

```js
const { StringDecoder } = require('node:string_decoder');
```

В следующем примере показано базовое использование класса `StringDecoder`.

```js
const { StringDecoder } = require('node:string_decoder');
const decoder = new StringDecoder('utf8');

const cent = Buffer.from([0xc2, 0xa2]);
console.log(decoder.write(cent));

const euro = Buffer.from([0xe2, 0x82, 0xac]);
console.log(decoder.write(euro));
```

Когда экземпляр `Buffer` записывается в экземпляр `StringDecoder`, используется внутренний буфер, чтобы убедиться, что декодированная строка не содержит неполных многобайтовых символов. Они хранятся в буфере до следующего вызова `stringDecoder.write()` или до вызова `stringDecoder.end()`.

В следующем примере три байта символа европейского евро (`€`) в кодировке UTF-8 записываются за три отдельные операции:

```js
const { StringDecoder } = require('node:string_decoder');
const decoder = new StringDecoder('utf8');


decoder.write(Buffer.from([0xE2]));
decoder.write(Buffer.from([0x82]));
console.log(decoder.end(Buffer.from([0xAC]))));
```

## Класс: `StringDecoder`

### `new StringDecoder([encoding])`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Символьная [кодировка] (buffer.md#buffers-and-character-encodings), которую будет использовать `StringDecoder`. **По умолчанию:** `'utf8'`.

Создает новый экземпляр `StringDecoder`.

### `stringDecoder.end([buffer])`

-   `buffer` {Buffer|TypedArray|DataView} `Буфер`, или `TypedArray`, или `DataView`, содержащий байты для декодирования.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает все оставшиеся входные данные, хранящиеся во внутреннем буфере, в виде строки. Байты, представляющие неполные символы UTF-8 и UTF-16, будут заменены символами-заместителями, соответствующими кодировке.

Если указан аргумент `buffer`, то перед возвратом оставшегося ввода выполняется последний вызов `stringDecoder.write()`. После вызова `end()` объект `stringDecoder` может быть повторно использован для нового ввода.

### `stringDecoder.write(buffer)`

-   `buffer` {Buffer|TypedArray|DataView} `Буфер`, или `TypedArray`, или `DataView`, содержащий байты для декодирования.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает декодированную строку, гарантируя, что любые неполные многобайтовые символы в конце `Buffer`, или `TypedArray`, или `DataView` будут исключены из возвращаемой строки и сохранены во внутреннем буфере для следующего вызова `stringDecoder.write()` или `stringDecoder.end()`.

