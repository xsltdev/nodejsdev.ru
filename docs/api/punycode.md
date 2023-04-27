---
description: Punycode - это схема кодирования символов, определенная RFC 3492, которая в первую очередь предназначена для использования в интернационализированных доменных именах
---

# Punycode

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/punycode.html)

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

**Версия модуля punycode, входящего в состав Node.js, устаревает.** В будущей основной версии Node.js этот модуль будет удален. Пользователи, в настоящее время зависящие от модуля `punycode`, должны перейти на использование модуля [Punycode.js](https://github.com/bestiejs/punycode.js), предоставляемого userland. Для кодирования URL на основе punycode смотрите [`url.domainToASCII`](url.md#urldomaintoasciidomain) или, в более общем случае, [WHATWG URL API](url.md#the-whatwg-url-api).

Модуль `punycode` - это собранная версия модуля [Punycode.js](https://github.com/bestiejs/punycode.js). Доступ к нему можно получить, используя:

```js
const punycode = require('punycode');
```

[Punycode](https://tools.ietf.org/html/rfc3492) - это схема кодирования символов, определенная RFC 3492, которая в первую очередь предназначена для использования в интернационализированных доменных именах. Поскольку имена хостов в URL ограничены только символами ASCII, доменные имена, содержащие символы, не являющиеся символами ASCII, должны быть преобразованы в ASCII с помощью схемы Punycode. Например, японский иероглиф, которым переводится английское слово `'example'`, - это `'例'`. Интернационализированное доменное имя `'例.com'` (эквивалентное `'example.com'`) представлено в Punycode как строка ASCII `'xn--fsq.com'`.

Модуль `punycode` обеспечивает простую реализацию стандарта Punycode.

Модуль `punycode` является сторонней зависимостью, используемой Node.js и предоставляемой разработчикам для удобства. Исправления или другие модификации модуля должны быть направлены в проект [Punycode.js](https://github.com/bestiejs/punycode.js).

## `punycode.decode(string)`

-   `string` {string}

Метод `punycode.decode()` преобразует строку [Punycode](https://tools.ietf.org/html/rfc3492) из символов только ASCII в эквивалентную строку кодовых точек Unicode.

```js
punycode.decode('maana-pta'); // 'mañana'
punycode.decode('--dqo34k'); // '☃-⌘'
```

## `punycode.encode(string)`

-   `string` {string}

Метод `punycode.encode()` преобразует строку кодовых точек Unicode в [Punycode](https://tools.ietf.org/html/rfc3492) строку символов только ASCII.

```js
punycode.encode('mañana'); // 'maana-pta'
punycode.encode('☃-⌘'); // '--dqo34k'
```

## `punycode.toASCII(domain)`

-   `domain` {string}

Метод `punycode.toASCII()` преобразует строку Unicode, представляющую интернационализированное доменное имя, в [Punycode](https://tools.ietf.org/html/rfc3492). Преобразуются только части доменного имени, не относящиеся к коду ASCII. Вызов `punycode.toASCII()` для строки, которая уже содержит только символы ASCII, не будет иметь никакого эффекта.

```js
// кодирование доменных имен
punycode.toASCII('mañana.com'); // 'xn--maana-pta.com'
punycode.toASCII('☃-⌘.com'); // 'xn----dqo34k.com'
punycode.toASCII('example.com'); // 'example.com'
```

## `punycode.toUnicode(domain)`

-   `domain` {string}

Метод `punycode.toUnicode()` преобразует строку, представляющую имя домена, содержащую символы в кодировке [Punycode](https://tools.ietf.org/html/rfc3492), в Юникод. Преобразуются только части доменного имени, закодированные [Punycode](https://tools.ietf.org/html/rfc3492).

```js
// декодирование доменных имен
punycode.toUnicode('xn--maana-pta.com'); // 'mañana.com'
punycode.toUnicode('xn----dqo34k.com'); // '☃-⌘.com'
punycode.toUnicode('example.com'); // 'example.com'
```

## `punycode.ucs2`

### `punycode.ucs2.decode(string)`

-   `string` {string}

Метод `punycode.ucs2.decode()` возвращает массив, содержащий числовые значения кодовых точек каждого символа Unicode в строке.

```js
punycode.ucs2.decode('abc'); // [0x61, 0x62, 0x63]
// суррогатная пара для тетраграммы U+1D306 для центра:
punycode.ucs2.decode('\uD834\uDF06'); // [0x1D306]
```

### `punycode.ucs2.encode(codePoints)`

-   `codePoints` {целое число\[\]}

Метод `punycode.ucs2.encode()` возвращает строку, основанную на массиве числовых значений кодовых точек.

```js
punycode.ucs2.encode([0x61, 0x62, 0x63]); // 'abc'
punycode.ucs2.encode([0x1d306]); // '\uD834\uDF06'
```

## `punycode.version`

-   {string}

Возвращает строку, определяющую номер текущей версии [Punycode.js](https://github.com/bestiejs/punycode.js).
