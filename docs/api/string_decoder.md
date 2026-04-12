---
title: Декодер строк
description: Модуль node:string_decoder предоставляет API для декодирования объектов Buffer в строки с сохранением многобайтовых символов UTF-8 и UTF-16
---

# Декодер строк

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/string_decoder.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/string_decoder.js -->

Модуль `node:string_decoder` предоставляет API для декодирования объектов `Buffer` в строки таким образом, что сохраняются закодированные многобайтовые символы UTF-8 и UTF-16. К нему можно обратиться так:

=== "MJS"

    ```js
    import { StringDecoder } from 'node:string_decoder';
    ```

=== "CJS"

    ```js
    const { StringDecoder } = require('node:string_decoder');
    ```

В следующем примере показано базовое использование класса `StringDecoder`.

=== "MJS"

    ```js
    import { StringDecoder } from 'node:string_decoder';
    import { Buffer } from 'node:buffer';
    const decoder = new StringDecoder('utf8');
    
    const cent = Buffer.from([0xC2, 0xA2]);
    console.log(decoder.write(cent)); // Выводит: ¢
    
    const euro = Buffer.from([0xE2, 0x82, 0xAC]);
    console.log(decoder.write(euro)); // Выводит: €
    ```

=== "CJS"

    ```js
    const { StringDecoder } = require('node:string_decoder');
    const decoder = new StringDecoder('utf8');
    
    const cent = Buffer.from([0xC2, 0xA2]);
    console.log(decoder.write(cent)); // Выводит: ¢
    
    const euro = Buffer.from([0xE2, 0x82, 0xAC]);
    console.log(decoder.write(euro)); // Выводит: €
    ```

Когда экземпляр `Buffer` записывается в экземпляр `StringDecoder`, используется внутренний буфер, чтобы декодированная строка не содержала неполных многобайтовых символов. Они удерживаются в буфере до следующего вызова `stringDecoder.write()` или до вызова `stringDecoder.end()`.

В следующем примере три байта в кодировке UTF-8 для символа евро (`€`) записываются тремя отдельными операциями:

=== "MJS"

    ```js
    import { StringDecoder } from 'node:string_decoder';
    import { Buffer } from 'node:buffer';
    const decoder = new StringDecoder('utf8');
    
    decoder.write(Buffer.from([0xE2]));
    decoder.write(Buffer.from([0x82]));
    console.log(decoder.end(Buffer.from([0xAC]))); // Выводит: €
    ```

=== "CJS"

    ```js
    const { StringDecoder } = require('node:string_decoder');
    const decoder = new StringDecoder('utf8');
    
    decoder.write(Buffer.from([0xE2]));
    decoder.write(Buffer.from([0x82]));
    console.log(decoder.end(Buffer.from([0xAC]))); // Выводит: €
    ```

## Класс: `StringDecoder`

### `new StringDecoder([encoding])`

<!-- YAML
added: v0.1.99
-->

* `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Символьная [кодировка][encoding], которую будет использовать `StringDecoder`.
  **По умолчанию:** `'utf8'`.

Создаёт новый экземпляр `StringDecoder`.

### `stringDecoder.end([buffer])`

<!-- YAML
added: v0.9.3
-->

* `buffer` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Байты для декодирования.
* Возвращает: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает весь оставшийся ввод, накопленный во внутреннем буфере, в виде строки. Байты, соответствующие неполным символам UTF-8 и UTF-16, будут заменены подстановочными символами, подходящими для данной кодировки.

Если передан аргумент `buffer`, перед возвратом оставшегося ввода выполняется ещё один вызов `stringDecoder.write()`.
После вызова `end()` объект `stringDecoder` можно снова использовать для нового ввода.

### `stringDecoder.write(buffer)`

<!-- YAML
added: v0.1.99
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/9618
    description: Each invalid character is now replaced by a single replacement
                 character instead of one for each individual byte.
-->

Добавлено в: v0.1.99

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Каждый недопустимый символ теперь заменяется одним символом замены вместо одного для каждого отдельного байта. |

* `buffer` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Buffer>](buffer.md#buffer) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Байты для декодирования.
* Возвращает: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает декодированную строку; в конце `Buffer`, `TypedArray` или `DataView` любые неполные многобайтовые символы не попадают в возвращаемую строку и сохраняются во внутреннем буфере для следующего вызова
`stringDecoder.write()` или `stringDecoder.end()`.

[encoding]: buffer.md#buffers-and-character-encodings
