---
title: Punycode
description: Устаревший модуль node:punycode — обёртка над Punycode.js для кодирования интернационализированных доменных имён
---

# Punycode

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта возможность проблемна и может измениться. Полагаться на неё не следует. Её использование может приводить к ошибкам. Обратная совместимость не гарантируется.

**Версия модуля punycode, входящего в состав Node.js, объявлена устаревающей.** В одной из будущих основных версий Node.js этот модуль будет удалён. Пользователям, которые сейчас зависят от модуля `punycode`, следует перейти на пользовательский модуль [Punycode.js](https://github.com/bestiejs/punycode.js). Для кодирования URL на основе Punycode см. [`url.domainToASCII`](url.md#urldomaintoasciidomain) или, в более общем случае, [WHATWG URL API](url.md#the-whatwg-url-api).

Модуль `punycode` — это встроенная версия модуля [Punycode.js](https://github.com/bestiejs/punycode.js). Доступ к нему:

```js
const punycode = require('node:punycode');
```

[Punycode](https://tools.ietf.org/html/rfc3492) — схема кодирования символов по RFC 3492, в первую очередь предназначенная для интернационализированных доменных имён. Поскольку имена хостов в URL ограничены символами ASCII, доменные имена с не-ASCII символами нужно преобразовать в ASCII с помощью Punycode. Например, японский иероглиф, соответствующий английскому слову `'example'`, — это `'例'`. Интернационализированное доменное имя `'例.com'` (эквивалент `'example.com'`) в Punycode представляется ASCII-строкой `'xn--fsq.com'`.

Модуль `punycode` даёт простую реализацию стандарта Punycode.

Модуль `punycode` — сторонняя зависимость Node.js, доступная разработчикам для удобства. Исправления и изменения нужно направлять в проект [Punycode.js](https://github.com/bestiejs/punycode.js).

## `punycode.decode(string)`

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `punycode.decode()` преобразует строку [Punycode](https://tools.ietf.org/html/rfc3492) из символов ASCII в эквивалентную строку кодовых точек Unicode.

```js
punycode.decode('maana-pta'); // 'mañana'
punycode.decode('--dqo34k'); // '☃-⌘'
```

## `punycode.encode(string)`

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `punycode.encode()` преобразует строку кодовых точек Unicode в строку [Punycode](https://tools.ietf.org/html/rfc3492) из символов ASCII.

```js
punycode.encode('mañana'); // 'maana-pta'
punycode.encode('☃-⌘'); // '--dqo34k'
```

## `punycode.toASCII(domain)`

-   `domain` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `punycode.toASCII()` преобразует строку Unicode с интернационализированным доменным именем в [Punycode](https://tools.ietf.org/html/rfc3492). Преобразуются только не-ASCII части имени. Вызов `punycode.toASCII()` для строки, уже содержащей только ASCII, не меняет её.

```js
// кодирование доменных имён
punycode.toASCII('mañana.com'); // 'xn--maana-pta.com'
punycode.toASCII('☃-⌘.com'); // 'xn----dqo34k.com'
punycode.toASCII('example.com'); // 'example.com'
```

## `punycode.toUnicode(domain)`

-   `domain` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `punycode.toUnicode()` преобразует строку доменного имени с закодированными в [Punycode](https://tools.ietf.org/html/rfc3492) частями в Unicode. Преобразуются только части в Punycode.

```js
// декодирование доменных имён
punycode.toUnicode('xn--maana-pta.com'); // 'mañana.com'
punycode.toUnicode('xn----dqo34k.com'); // '☃-⌘.com'
punycode.toUnicode('example.com'); // 'example.com'
```

## `punycode.ucs2`

### `punycode.ucs2.decode(string)`

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `punycode.ucs2.decode()` возвращает массив числовых значений кодовых точек каждого символа Unicode в строке.

```js
punycode.ucs2.decode('abc'); // [0x61, 0x62, 0x63]
// суррогатная пара для U+1D306 (тетраграмма центра):
punycode.ucs2.decode('\uD834\uDF06'); // [0x1D306]
```

### `punycode.ucs2.encode(codePoints)`

-   `codePoints` [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `punycode.ucs2.encode()` возвращает строку по массиву числовых кодовых точек.

```js
punycode.ucs2.encode([0x61, 0x62, 0x63]); // 'abc'
punycode.ucs2.encode([0x1d306]); // '\uD834\uDF06'
```

## `punycode.version`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строку с номером текущей версии [Punycode.js](https://github.com/bestiejs/punycode.js).
