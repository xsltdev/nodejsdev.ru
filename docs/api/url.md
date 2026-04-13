---
title: URL
description: Модуль node:url — разбор и формирование URL; API WHATWG и унаследованный API Node.js
---

# URL

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/url.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/url.js -->

Модуль `node:url` предоставляет средства для разрешения и разбора URL. Подключение:

=== "MJS"

    ```js
    import url from 'node:url';
    ```

=== "CJS"

    ```js
    const url = require('node:url');
    ```

## Строки URL и объекты URL

Строка URL — структурированная строка с несколькими смысловыми компонентами.
После разбора возвращается объект URL со свойствами для каждого компонента.

В `node:url` два API: унаследованный, специфичный для Node.js, и новый,
соответствующий [WHATWG URL Standard][WHATWG URL Standard], как в браузерах.

Ниже сравнение WHATWG и унаследованного API. Для URL
`'https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'` сверху —
свойства объекта от унаследованного `url.parse()`, снизу — свойства WHATWG
`URL`.

У WHATWG `origin` включает `protocol` и `host`, но не `username` и `password`.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              href                                              │
├──────────┬──┬─────────────────────┬────────────────────────┬───────────────────────────┬───────┤
│ protocol │  │        auth         │          host          │           path            │ hash  │
│          │  │                     ├─────────────────┬──────┼──────────┬────────────────┤       │
│          │  │                     │    hostname     │ port │ pathname │     search     │       │
│          │  │                     │                 │      │          ├─┬──────────────┤       │
│          │  │                     │                 │      │          │ │    query     │       │
"  https:   //    user   :   pass   @ sub.example.com : 8080   /p/a/t/h  ?  query=string   #hash "
│          │  │          │          │    hostname     │ port │          │                │       │
│          │  │          │          ├─────────────────┴──────┤          │                │       │
│ protocol │  │ username │ password │          host          │          │                │       │
├──────────┴──┼──────────┴──────────┼────────────────────────┤          │                │       │
│   origin    │                     │         origin         │ pathname │     search     │ hash  │
├─────────────┴─────────────────────┴────────────────────────┴──────────┴────────────────┴───────┤
│                                              href                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
(Все пробелы в строке "" следует игнорировать. Они нужны только для форматирования.)
```

Разбор строки URL через WHATWG API:

```js
const myURL =
  new URL('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
```

Разбор через унаследованный API:

=== "MJS"

    ```js
    import url from 'node:url';
    const myURL =
      url.parse('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    ```

=== "CJS"

    ```js
    const url = require('node:url');
    const myURL =
      url.parse('https://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash');
    ```

### Сборка URL из частей и получение строки

WHATWG URL можно собрать из частей через сеттеры свойств или шаблонную строку:

```js
const myURL = new URL('https://example.org');
myURL.pathname = '/a/b/c';
myURL.search = '?d=e';
myURL.hash = '#fgh';
```

```js
const pathname = '/a/b/c';
const search = '?d=e';
const hash = '#fgh';
const myURL = new URL(`https://example.org${pathname}${search}${hash}`);
```

Итоговую строку URL даёт свойство `href`:

```js
console.log(myURL.href);
```

## WHATWG API для URL

### Класс: `URL`

<!-- YAML
added:
  - v7.0.0
  - v6.13.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18281
    description: Класс теперь доступен в глобальном объекте.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Класс теперь доступен в глобальном объекте. |

Совместимый с браузерами класс `URL`, реализованный по [WHATWG URL Standard][WHATWG URL Standard].
[Примеры разобранных URL][examples of parsed URLs] приведены в самом стандарте.
Класс `URL` также доступен в глобальном объекте.

По соглашениям браузеров все свойства объектов `URL` реализованы как геттеры и сеттеры
на прототипе класса, а не как свойства данных самого объекта. Поэтому, в отличие от
[legacy `urlObject`][legacy `urlObject`], использование ключевого слова `delete` для любых свойств объектов
`URL` (например, `delete myURL.protocol`, `delete myURL.pathname` и т.д.) не даёт эффекта,
но всё равно возвращает `true`.

#### `new URL(input[, base])`

<!-- YAML
changes:
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47339
    description: Требование ICU снято.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v18.17.0 | Требование ICU снято. |

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный или относительный входной URL для разбора. Если `input`
  относительный, нужен `base`. Если `input` абсолютный, `base` игнорируется. Если `input`
  не строка, сначала выполняется [преобразование в строку][converted to a string].
* `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Базовый URL для разрешения, если `input` не абсолютный. Если `base`
  не строка, сначала выполняется [преобразование в строку][converted to a string].

Создаёт новый объект `URL`, разбирая `input` относительно `base`. Если `base` передан
строкой, он разбирается так же, как `new URL(base)`.

```js
const myURL = new URL('/foo', 'https://example.org/');
// https://example.org/foo
```

Конструктор URL доступен как свойство глобального объекта.
Его также можно импортировать из встроенного модуля `url`:

=== "MJS"

    ```js
    import { URL } from 'node:url';
    console.log(URL === globalThis.URL); // Prints 'true'.
    ```

=== "CJS"

    ```js
    console.log(URL === require('node:url').URL); // Prints 'true'.
    ```

`TypeError` будет выброшен, если `input` или `base` не являются допустимыми URL. Значения
при необходимости приводятся к строкам. Например:

```js
const myURL = new URL({ toString: () => 'https://example.org/' });
// https://example.org/
```

Символы Юникода в имени хоста `input` автоматически преобразуются в ASCII
алгоритмом [Punycode][Punycode].

```js
const myURL = new URL('https://測試');
// https://xn--g6w251d/
```

Если заранее неизвестно, абсолютный ли `input`, а `base` задан, имеет смысл проверить,
что `origin` объекта `URL` совпадает с ожидаемым.

```js
let myURL = new URL('http://Example.com/', 'https://example.org/');
// http://example.com/

myURL = new URL('https://Example.com/', 'https://example.org/');
// https://example.com/

myURL = new URL('foo://Example.com/', 'https://example.org/');
// foo://Example.com/

myURL = new URL('http:Example.com/', 'https://example.org/');
// http://example.com/

myURL = new URL('https:Example.com/', 'https://example.org/');
// https://example.org/Example.com/

myURL = new URL('foo:Example.com/', 'https://example.org/');
// foo:Example.com/
```

#### `url.hash`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт фрагмент URL.

```js
const myURL = new URL('https://example.org/foo#bar');
console.log(myURL.hash);
// Prints #bar

myURL.hash = 'baz';
console.log(myURL.href);
// Prints https://example.org/foo#baz
```

Недопустимые символы URL в значении, присвоенном свойству `hash`, подвергаются
[процентному кодированию][percent-encoded]. Набор кодируемых символов может
слегка отличаться от того, что дают [`url.parse()`][`url.parse()`] и [`url.format()`][`url.format()`].

#### `url.host`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт часть хоста URL.

```js
const myURL = new URL('https://example.org:81/foo');
console.log(myURL.host);
// Prints example.org:81

myURL.host = 'example.com:82';
console.log(myURL.href);
// Prints https://example.com:82/foo
```

Недопустимые значения хоста, присвоенные свойству `host`, игнорируются.

#### `url.hostname`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт имя хоста в URL. Главное отличие `url.host` и `url.hostname`: в
`url.hostname` _не_ входит порт.

```js
const myURL = new URL('https://example.org:81/foo');
console.log(myURL.hostname);
// Prints example.org

// Setting the hostname does not change the port
myURL.hostname = 'example.com';
console.log(myURL.href);
// Prints https://example.com:81/foo

// Use myURL.host to change the hostname and port
myURL.host = 'example.org:82';
console.log(myURL.href);
// Prints https://example.org:82/foo
```

Недопустимые значения имени хоста, присвоенные свойству `hostname`, игнорируются.

#### `url.href`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт сериализованный URL.

```js
const myURL = new URL('https://example.org/foo');
console.log(myURL.href);
// Prints https://example.org/foo

myURL.href = 'https://example.com/bar';
console.log(myURL.href);
// Prints https://example.com/bar
```

Чтение свойства `href` эквивалентно вызову [`url.toString()`][`url.toString()`].

Присвоение нового значения эквивалентно созданию объекта `URL` через
[`new URL(value)`][`new URL()`]; изменяются все свойства объекта.

Если присвоенное значение не является допустимым URL, выбрасывается `TypeError`.

#### `url.origin`

<!-- YAML
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/33325
    description: Схема «gopher» больше не особая; для неё `url.origin` теперь
                 возвращает `'null'`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Схема «gopher» больше не особая; для неё `url.origin` теперь возвращает `'null'`. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает только для чтения сериализацию происхождения (origin) URL.

```js
const myURL = new URL('https://example.org/foo/bar?baz');
console.log(myURL.origin);
// Prints https://example.org
```

```js
const idnURL = new URL('https://測試');
console.log(idnURL.origin);
// Prints https://xn--g6w251d

console.log(idnURL.hostname);
// Prints xn--g6w251d
```

#### `url.password`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт часть пароля URL.

```js
const myURL = new URL('https://abc:xyz@example.com');
console.log(myURL.password);
// Prints xyz

myURL.password = '123';
console.log(myURL.href);
// Prints https://abc:123@example.com/
```

Недопустимые символы URL в значении свойства `password` кодируются
[процентным кодированием][percent-encoded]. Набор кодируемых символов может
слегка отличаться от [`url.parse()`][`url.parse()`] и [`url.format()`][`url.format()`].

#### `url.pathname`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт путь URL.

```js
const myURL = new URL('https://example.org/abc/xyz?123');
console.log(myURL.pathname);
// Prints /abc/xyz

myURL.pathname = '/abcdef';
console.log(myURL.href);
// Prints https://example.org/abcdef?123
```

Недопустимые символы URL в значении свойства `pathname` кодируются
[процентным кодированием][percent-encoded]. Набор кодируемых символов может
слегка отличаться от [`url.parse()`][`url.parse()`] и [`url.format()`][`url.format()`].

#### `url.port`

<!-- YAML
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/33325
    description: Схема «gopher» больше не особая.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Схема «gopher» больше не особая. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт порт в URL.

Значение порта может быть числом или строкой с числом в диапазоне `0`–`65535`
(включительно). Если задать порт по умолчанию для текущего `protocol` объекта
`URL`, свойство `port` станет пустой строкой (`''`).

Порт может быть пустой строкой; тогда фактический порт определяется схемой:

| protocol | port |
| -------- | ---- |
| "ftp"    | 21   |
| "file"   |      |
| "http"   | 80   |
| "https"  | 443  |
| "ws"     | 80   |
| "wss"    | 443  |

При присвоении значения порту оно сначала приводится к строке через `.toString()`.

Если строка недопустима, но начинается с цифр, в `port` попадает ведущее число.
Если число вне указанного диапазона, оно игнорируется.

```js
const myURL = new URL('https://example.org:8888');
console.log(myURL.port);
// Prints 8888

// Default ports are automatically transformed to the empty string
// (HTTPS protocol's default port is 443)
myURL.port = '443';
console.log(myURL.port);
// Prints the empty string
console.log(myURL.href);
// Prints https://example.org/

myURL.port = 1234;
console.log(myURL.port);
// Prints 1234
console.log(myURL.href);
// Prints https://example.org:1234/

// Completely invalid port strings are ignored
myURL.port = 'abcd';
console.log(myURL.port);
// Prints 1234

// Leading numbers are treated as a port number
myURL.port = '5678abcd';
console.log(myURL.port);
// Prints 5678

// Non-integers are truncated
myURL.port = 1234.5678;
console.log(myURL.port);
// Prints 1234

// Out-of-range numbers which are not represented in scientific notation
// will be ignored.
myURL.port = 1e10; // 10000000000, will be range-checked as described below
console.log(myURL.port);
// Prints 1234
```

Числа с десятичной точкой (в том числе с плавающей запятой и в экспоненциальной
записи) не исключение: в порт попадает ведущее число до точки, если оно допустимо:

```js
myURL.port = 4.567e21;
console.log(myURL.port);
// Prints 4 (because it is the leading number in the string '4.567e21')
```

#### `url.protocol`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт схему (протокол) URL.

```js
const myURL = new URL('https://example.org');
console.log(myURL.protocol);
// Prints https:

myURL.protocol = 'ftp';
console.log(myURL.href);
// Prints ftp://example.org/
```

Недопустимые значения протокола, присвоенные свойству `protocol`, игнорируются.

##### Особые схемы

<!-- YAML
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/33325
    description: Схема «gopher» больше не особая.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Схема «gopher» больше не особая. |

[WHATWG URL Standard][WHATWG URL Standard] считает ряд схем URL _особенными_ с точки зрения разбора
и сериализации. Если URL разобран с особой схемой, свойство `url.protocol` можно
сменить на другую особую схему, но нельзя — на неособую и наоборот.

Например, смена с `http` на `https` допустима:

```js
const u = new URL('http://example.org');
u.protocol = 'https';
console.log(u.href);
// https://example.org/
```

Смена с `http` на гипотетическую схему `fish` не срабатывает: новая схема не особая.

```js
const u = new URL('http://example.org');
u.protocol = 'fish';
console.log(u.href);
// http://example.org/
```

Аналогично, переход с неособой схемы на особую запрещён:

```js
const u = new URL('fish://example.org');
u.protocol = 'http';
console.log(u.href);
// fish://example.org
```

По WHATWG URL Standard особыми схемами являются `ftp`, `file`, `http`, `https`,
`ws` и `wss`.

#### `url.search`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт сериализованную строку запроса URL.

```js
const myURL = new URL('https://example.org/abc?123');
console.log(myURL.search);
// Prints ?123

myURL.search = 'abc=xyz';
console.log(myURL.href);
// Prints https://example.org/abc?abc=xyz
```

Недопустимые символы URL в значении свойства `search` кодируются
[процентным кодированием][percent-encoded]. Набор кодируемых символов может
слегка отличаться от [`url.parse()`][`url.parse()`] и [`url.format()`][`url.format()`].

#### `url.searchParams`

* Тип: [`<URLSearchParams>`](url.md#class-urlsearchparams)

Возвращает объект [`URLSearchParams`][`URLSearchParams`] с параметрами запроса URL. Свойство
только для чтения, но через `URLSearchParams` можно менять экземпляр URL; чтобы
полностью заменить строку запроса, используйте сеттер [`url.search`][`url.search`]. Подробнее
см. [`URLSearchParams`][`URLSearchParams`].

При изменении URL через `.searchParams` учитывайте: по спецификации WHATWG у
`URLSearchParams` другие правила процентного кодирования. Например, объект `URL`
не кодирует тильду ASCII (`~`), а `URLSearchParams` кодирует её всегда:

```js
const myURL = new URL('https://example.org/abc?foo=~bar');

console.log(myURL.search);  // prints ?foo=~bar

// Modify the URL via searchParams...
myURL.searchParams.sort();

console.log(myURL.search);  // prints ?foo=%7Ebar
```

#### `url.username`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт имя пользователя в URL.

```js
const myURL = new URL('https://abc:xyz@example.com');
console.log(myURL.username);
// Prints abc

myURL.username = '123';
console.log(myURL.href);
// Prints https://123:xyz@example.com/
```

Недопустимые символы URL в значении свойства `username` кодируются
[процентным кодированием][percent-encoded]. Набор кодируемых символов может
слегка отличаться от [`url.parse()`][`url.parse()`] и [`url.format()`][`url.format()`].

#### `url.toString()`

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `toString()` объекта `URL` возвращает сериализованный URL; результат
совпадает с [`url.href`][`url.href`] и [`url.toJSON()`][`url.toJSON()`].

#### `url.toJSON()`

<!-- YAML
added:
  - v7.7.0
  - v6.13.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `toJSON()` объекта `URL` возвращает сериализованный URL; результат
совпадает с [`url.href`][`url.href`] и [`url.toString()`][`url.toString()`].

Метод вызывается автоматически при сериализации объекта `URL` через
[`JSON.stringify()`][`JSON.stringify()`].

```js
const myURLs = [
  new URL('https://www.example.com'),
  new URL('https://test.example.org'),
];
console.log(JSON.stringify(myURLs));
// Prints ["https://www.example.com/","https://test.example.org/"]
```

#### `URL.createObjectURL(blob)`

<!-- YAML
added: v16.7.0
changes:
 - version:
    - v24.0.0
    - v22.17.0
   pr-url: https://github.com/nodejs/node/pull/57513
   description: API помечен как стабильный.
-->

Добавлено в: v16.7.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | API помечен как стабильный. |

* `blob` [`<Blob>`](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Создаёт строку URL `'blob:nodedata:...'`, представляющую переданный объект [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob);
по ней позже можно получить тот же `Blob`.

```js
const {
  Blob,
  resolveObjectURL,
} = require('node:buffer');

const blob = new Blob(['hello']);
const id = URL.createObjectURL(blob);

// later...

const otherBlob = resolveObjectURL(id);
console.log(otherBlob.size);
```

Данные зарегистрированного [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) остаются в памяти, пока не будет вызван
`URL.revokeObjectURL()` для их удаления.

Объекты `Blob` регистрируются в текущем потоке. При использовании Worker Threads
`Blob`, зарегистрированный в одном воркере, недоступен другим воркерам и главному потоку.

#### `URL.revokeObjectURL(id)`

<!-- YAML
added: v16.7.0
changes:
 - version:
    - v24.0.0
    - v22.17.0
   pr-url: https://github.com/nodejs/node/pull/57513
   description: API помечен как стабильный.
-->

Добавлено в: v16.7.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | API помечен как стабильный. |

* `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка URL `'blob:nodedata:...`, возвращённая предыдущим вызовом
  `URL.createObjectURL()`.

Удаляет сохранённый [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) с указанным идентификатором. Отзыв незарегистрированного
id завершается без ошибки.

#### `URL.canParse(input[, base])`

<!-- YAML
added:
  - v19.9.0
  - v18.17.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный или относительный входной URL. Если `input`
  относительный, нужен `base`. Если абсолютный — `base` игнорируется. Если `input`
  не строка, сначала [преобразуется в строку][converted to a string].
* `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Базовый URL, если `input` не абсолютный. Если `base` не строка,
  сначала [преобразуется в строку][converted to a string].
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, можно ли разобрать `input` относительно `base` в корректный `URL`.

```js
const isValid = URL.canParse('/foo', 'https://example.org/'); // true

const isNotValid = URL.canParse('/foo'); // false
```

#### `URL.parse(input[, base])`

<!-- YAML
added: v22.1.0
-->

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный или относительный входной URL. Если `input`
  относительный, нужен `base`. Если абсолютный — `base` игнорируется. Если `input`
  не строка, сначала [преобразуется в строку][converted to a string].
* `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Базовый URL, если `input` не абсолютный. Если `base` не строка,
  сначала [преобразуется в строку][converted to a string].
* Возвращает: [`<URL>`](url.md#the-whatwg-url-api) | null

Разбирает строку как URL. Если задан `base`, он используется для разрешения
неабсолютных `input`. Возвращает `null`, если параметры нельзя привести к допустимому URL.

### Класс: `URLPattern`

<!-- YAML
added: v23.8.0
-->

> Stability: 1 - Experimental

API `URLPattern` сопоставляет URL или их части с шаблоном.

```js
const myPattern = new URLPattern('https://nodejs.org/docs/latest/api/*.html');
console.log(myPattern.exec('https://nodejs.org/docs/latest/api/dns.html'));
// Prints:
// {
//  "hash": { "groups": {  "0": "" },  "input": "" },
//  "hostname": { "groups": {}, "input": "nodejs.org" },
//  "inputs": [
//    "https://nodejs.org/docs/latest/api/dns.html"
//  ],
//  "password": { "groups": { "0": "" }, "input": "" },
//  "pathname": { "groups": { "0": "dns" }, "input": "/docs/latest/api/dns.html" },
//  "port": { "groups": {}, "input": "" },
//  "protocol": { "groups": {}, "input": "https" },
//  "search": { "groups": { "0": "" }, "input": "" },
//  "username": { "groups": { "0": "" }, "input": "" }
// }

console.log(myPattern.test('https://nodejs.org/docs/latest/api/dns.html'));
// Prints: true
```

#### `new URLPattern()`

Создаёт пустой объект `URLPattern`.

#### `new URLPattern(string[, baseURL][, options])`

* `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка URL
* `baseURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Базовый URL
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры

Разбирает `string` как URL и создаёт по нему новый `URLPattern`.

Если `baseURL` не указан, по умолчанию `undefined`.

В `options` может быть булево `ignoreCase` для сопоставления без учёта регистра.

Конструктор может выбросить `TypeError` при ошибке разбора.

#### `new URLPattern(obj[, baseURL][, options])`

* `obj` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект шаблона
* `baseURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Базовый URL
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры

Разбирает `Object` как шаблон и создаёт `URLPattern`. Поля: `protocol`, `username`,
`password`, `hostname`, `port`, `pathname`, `search`, `hash` или `baseURL`.

Если `baseURL` не указан, по умолчанию `undefined`.

В `options` может быть булево `ignoreCase` для сопоставления без учёта регистра.

Конструктор может выбросить `TypeError` при ошибке разбора.

#### `urlPattern.exec(input[, baseURL])`

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) URL или части URL
* `baseURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Базовый URL

`input` — строка или объект с частями URL: `protocol`, `username`, `password`,
`hostname`, `port`, `pathname`, `search`, `hash` или `baseURL`.

Если `baseURL` не указан, по умолчанию `undefined`.

Возвращает объект с ключом `inputs` (массив аргументов вызова) и ключами компонентов
URL с совпавшими `input` и группами.

```js
const myPattern = new URLPattern('https://nodejs.org/docs/latest/api/*.html');
console.log(myPattern.exec('https://nodejs.org/docs/latest/api/dns.html'));
// Prints:
// {
//  "hash": { "groups": {  "0": "" },  "input": "" },
//  "hostname": { "groups": {}, "input": "nodejs.org" },
//  "inputs": [
//    "https://nodejs.org/docs/latest/api/dns.html"
//  ],
//  "password": { "groups": { "0": "" }, "input": "" },
//  "pathname": { "groups": { "0": "dns" }, "input": "/docs/latest/api/dns.html" },
//  "port": { "groups": {}, "input": "" },
//  "protocol": { "groups": {}, "input": "https" },
//  "search": { "groups": { "0": "" }, "input": "" },
//  "username": { "groups": { "0": "" }, "input": "" }
// }
```

#### `urlPattern.test(input[, baseURL])`

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) URL или части URL
* `baseURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Базовый URL

Семантика `input` и `baseURL` такая же, как у `urlPattern.exec`.

Возвращает `true`, если `input` соответствует шаблону.

```js
const myPattern = new URLPattern('https://nodejs.org/docs/latest/api/*.html');
console.log(myPattern.test('https://nodejs.org/docs/latest/api/dns.html'));
// Prints: true
```

### Класс: `URLSearchParams`

<!-- YAML
added:
  - v7.5.0
  - v6.13.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18281
    description: Класс теперь доступен в глобальном объекте.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Класс теперь доступен в глобальном объекте. |

API `URLSearchParams` даёт доступ на чтение и запись к строке запроса `URL`. Класс
можно использовать отдельно — ниже четыре варианта конструктора. Класс также
доступен в глобальном объекте.

Интерфейс WHATWG `URLSearchParams` и модуль [`querystring`][`querystring`] решают похожую задачу,
но [`querystring`][`querystring`] универсальнее: можно настраивать разделители (`&` и `=`).
Этот API предназначен именно для строк запроса в URL.

```js
const myURL = new URL('https://example.org/?abc=123');
console.log(myURL.searchParams.get('abc'));
// Prints 123

myURL.searchParams.append('abc', 'xyz');
console.log(myURL.href);
// Prints https://example.org/?abc=123&abc=xyz

myURL.searchParams.delete('abc');
myURL.searchParams.set('a', 'b');
console.log(myURL.href);
// Prints https://example.org/?a=b

const newSearchParams = new URLSearchParams(myURL.searchParams);
// The above is equivalent to
// const newSearchParams = new URLSearchParams(myURL.search);

newSearchParams.append('a', 'c');
console.log(myURL.href);
// Prints https://example.org/?a=b
console.log(newSearchParams.toString());
// Prints a=b&a=c

// newSearchParams.toString() is implicitly called
myURL.search = newSearchParams;
console.log(myURL.href);
// Prints https://example.org/?a=b&a=c
newSearchParams.delete('a');
console.log(myURL.href);
// Prints https://example.org/?a=b&a=c
```

#### `new URLSearchParams()`

Создаёт пустой `URLSearchParams`.

#### `new URLSearchParams(string)`

* `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка запроса

Разбирает `string` как строку запроса и создаёт `URLSearchParams`. Ведущий `'?`,
если есть, игнорируется.

```js
let params;

params = new URLSearchParams('user=abc&query=xyz');
console.log(params.get('user'));
// Prints 'abc'
console.log(params.toString());
// Prints 'user=abc&query=xyz'

params = new URLSearchParams('?user=abc&query=xyz');
console.log(params.toString());
// Prints 'user=abc&query=xyz'
```

#### `new URLSearchParams(obj)`

<!-- YAML
added:
  - v7.10.0
  - v6.13.0
-->

* `obj` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект с парами ключ–значение

Создаёт `URLSearchParams` из обычного объекта. Ключи и значения свойств `obj`
приводятся к строкам.

В отличие от [`querystring`][`querystring`], дубликаты ключей в виде массивов не поддерживаются:
массивы приводятся через [`array.toString()`][`array.toString()`] — элементы склеиваются запятыми.

```js
const params = new URLSearchParams({
  user: 'abc',
  query: ['first', 'second'],
});
console.log(params.getAll('query'));
// Prints [ 'first,second' ]
console.log(params.toString());
// Prints 'user=abc&query=first%2Csecond'
```

#### `new URLSearchParams(iterable)`

<!-- YAML
added:
  - v7.10.0
  - v6.13.0
-->

* `iterable` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Итерируемый объект с парами ключ–значение

Создаёт `URLSearchParams` из итерируемой карты по аналогии с конструктором [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
`iterable` может быть `Array` или любым итерируемым объектом, в том числе другим
`URLSearchParams` — тогда получится клон. Элементы — пары ключ–значение; каждая пара
может быть любым итерируемым объектом.

Дубликаты ключей допускаются.

```js
let params;

// Using an array
params = new URLSearchParams([
  ['user', 'abc'],
  ['query', 'first'],
  ['query', 'second'],
]);
console.log(params.toString());
// Prints 'user=abc&query=first&query=second'

// Using a Map object
const map = new Map();
map.set('user', 'abc');
map.set('query', 'xyz');
params = new URLSearchParams(map);
console.log(params.toString());
// Prints 'user=abc&query=xyz'

// Using a generator function
function* getQueryPairs() {
  yield ['user', 'abc'];
  yield ['query', 'first'];
  yield ['query', 'second'];
}
params = new URLSearchParams(getQueryPairs());
console.log(params.toString());
// Prints 'user=abc&query=first&query=second'

// Each key-value pair must have exactly two elements
new URLSearchParams([
  ['user', 'abc', 'error'],
]);
// Throws TypeError [ERR_INVALID_TUPLE]:
//        Each query pair must be an iterable [name, value] tuple
```

#### `urlSearchParams.append(name, value)`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Добавляет пару имя–значение в строку запроса.

#### `urlSearchParams.delete(name[, value])`

<!-- YAML
changes:
  - version:
      - v20.2.0
      - v18.18.0
    pr-url: https://github.com/nodejs/node/pull/47885
    description: Добавлена поддержка необязательного аргумента `value`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.2.0, v18.18.0 | Добавлена поддержка необязательного аргумента `value`. |

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если передан `value`, удаляются все пары с данным `name` и `value`.

Если `value` не передан, удаляются все пары с именем `name`.

#### `urlSearchParams.entries()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает ES6-итератор по парам имя–значение в запросе. Каждый элемент — массив
`Array`: первый элемент — `name`, второй — `value`.

Синоним [`urlSearchParams[Symbol.iterator]()`][`urlSearchParamsSymbol.iterator()`].

#### `urlSearchParams.forEach(fn[, thisArg])`

<!-- YAML
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Некорректный callback в `fn` теперь даёт `ERR_INVALID_ARG_TYPE`,
                 а не `ERR_INVALID_CALLBACK`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Некорректный callback в `fn` теперь даёт `ERR_INVALID_ARG_TYPE`, а не `ERR_INVALID_CALLBACK`. |

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается для каждой пары имя–значение
* `thisArg` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Значение `this` при вызове `fn`

Обходит пары имя–значение и вызывает `fn` для каждой.

```js
const myURL = new URL('https://example.org/?a=b&c=d');
myURL.searchParams.forEach((value, name, searchParams) => {
  console.log(name, value, myURL.searchParams === searchParams);
});
// Prints:
//   a b true
//   c d true
```

#### `urlSearchParams.get(name)`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Строка или `null`, если пары с таким `name` нет.

Возвращает значение первой пары с именем `name`; если таких пар нет — `null`.

#### `urlSearchParams.getAll(name)`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает значения всех пар с именем `name`; если таких пар нет — пустой массив.

#### `urlSearchParams.has(name[, value])`

<!-- YAML
changes:
  - version:
      - v20.2.0
      - v18.18.0
    pr-url: https://github.com/nodejs/node/pull/47885
    description: Добавлена поддержка необязательного аргумента `value`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.2.0, v18.18.0 | Добавлена поддержка необязательного аргумента `value`. |

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет наличие пар по `name` и необязательному `value`.

Если `value` задан, возвращает `true`, если есть пара с тем же `name` и `value`.

Если `value` не задан, возвращает `true`, если есть хотя бы одна пара с именем `name`.

#### `urlSearchParams.keys()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает ES6-итератор по именам в парах имя–значение.

```js
const params = new URLSearchParams('foo=bar&foo=baz');
for (const name of params.keys()) {
  console.log(name);
}
// Prints:
//   foo
//   foo
```

#### `urlSearchParams.set(name, value)`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Задаёт для `name` значение `value`. Если уже есть пары с именем `name`, у первой
пары меняется значение на `value`, остальные с тем же именем удаляются; иначе
добавляется новая пара.

```js
const params = new URLSearchParams();
params.append('foo', 'bar');
params.append('foo', 'baz');
params.append('abc', 'def');
console.log(params.toString());
// Prints foo=bar&foo=baz&abc=def

params.set('foo', 'def');
params.set('xyz', 'opq');
console.log(params.toString());
// Prints foo=def&abc=def&xyz=opq
```

#### `urlSearchParams.size`

<!-- YAML
added:
 - v19.8.0
 - v18.16.0
-->

Общее число записей параметров.

#### `urlSearchParams.sort()`

<!-- YAML
added:
  - v7.7.0
  - v6.13.0
-->

Сортирует пары имя–значение на месте по имени. Используется [устойчивый алгоритм
сортировки][stable sorting algorithm], порядок пар с одинаковым именем сохраняется.

Метод полезен, в частности, для повышения попаданий в кэш.

```js
const params = new URLSearchParams('query[]=abc&type=search&query[]=123');
params.sort();
console.log(params.toString());
// Prints query%5B%5D=abc&query%5B%5D=123&type=search
```

#### `urlSearchParams.toString()`

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает параметры запроса в виде строки с необходимым процентным кодированием.

#### `urlSearchParams.values()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает ES6-итератор по значениям в парах имя–значение.

#### `urlSearchParams[Symbol.iterator]()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает ES6-итератор по парам имя–значение в строке запроса. Каждый элемент —
массив `Array`: первый элемент — `name`, второй — `value`.

Синоним [`urlSearchParams.entries()`][`urlSearchParams.entries()`].

```js
const params = new URLSearchParams('foo=bar&xyz=baz');
for (const [name, value] of params) {
  console.log(name, value);
}
// Prints:
//   foo bar
//   xyz baz
```

### `url.domainToASCII(domain)`

<!-- YAML
added:
  - v7.4.0
  - v6.13.0
changes:
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47339
    description: Требование ICU снято.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v18.17.0 | Требование ICU снято. |

* `domain` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает ASCII-представление `domain` в [Punycode][Punycode]. Если домен недопустим —
пустая строка.

Обратная операция к [`url.domainToUnicode()`][`url.domainToUnicode()`].

=== "MJS"

    ```js
    import url from 'node:url';
    
    console.log(url.domainToASCII('español.com'));
    // Prints xn--espaol-zwa.com
    console.log(url.domainToASCII('中文.com'));
    // Prints xn--fiq228c.com
    console.log(url.domainToASCII('xn--iñvalid.com'));
    // Prints an empty string
    ```

=== "CJS"

    ```js
    const url = require('node:url');
    
    console.log(url.domainToASCII('español.com'));
    // Prints xn--espaol-zwa.com
    console.log(url.domainToASCII('中文.com'));
    // Prints xn--fiq228c.com
    console.log(url.domainToASCII('xn--iñvalid.com'));
    // Prints an empty string
    ```

### `url.domainToUnicode(domain)`

<!-- YAML
added:
  - v7.4.0
  - v6.13.0
changes:
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47339
    description: Требование ICU снято.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v18.17.0 | Требование ICU снято. |

* `domain` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает Unicode-представление `domain`. Если домен недопустим — пустая строка.

Обратная операция к [`url.domainToASCII()`][`url.domainToASCII()`].

=== "MJS"

    ```js
    import url from 'node:url';
    
    console.log(url.domainToUnicode('xn--espaol-zwa.com'));
    // Prints español.com
    console.log(url.domainToUnicode('xn--fiq228c.com'));
    // Prints 中文.com
    console.log(url.domainToUnicode('xn--iñvalid.com'));
    // Prints an empty string
    ```

=== "CJS"

    ```js
    const url = require('node:url');
    
    console.log(url.domainToUnicode('xn--espaol-zwa.com'));
    // Prints español.com
    console.log(url.domainToUnicode('xn--fiq228c.com'));
    // Prints 中文.com
    console.log(url.domainToUnicode('xn--iñvalid.com'));
    // Prints an empty string
    ```

### `url.fileURLToPath(url[, options])`

<!-- YAML
added: v10.12.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52509
    description: Аргумент `options` задаёт способ разбора аргумента `path`.
-->

Добавлено в: v10.12.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Аргумент `options` задаёт способ разбора аргумента `path`. |

* `url` [`<URL>`](url.md#the-whatwg-url-api) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка file URL или объект URL для преобразования в путь.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `windows` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined `true` — путь как в Windows, `false` — POSIX,
    `undefined` — по умолчанию для системы.
    **По умолчанию:** `undefined`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Полностью разрешённый путь к файлу для текущей платформы.

Функция корректно декодирует процентное кодирование и возвращает допустимую
абсолютную строку пути на разных платформах.

**Безопасность:**

Декодируются процентно закодированные символы, в том числе сегменты с точками
(`%2e` → `.`, `%2e%2e` → `..`), затем путь нормализуется. Закодированные обходы
каталога (например `%2e%2e`) превращаются в реальный обход, при этом закодированные
слэши (`%2F`, `%5C`) по-прежнему отклоняются.

**Нельзя полагаться только на `fileURLToPath()` против атак с обходом каталога.**
Всегда явно проверяйте полученный путь и границы допустимых каталогов перед
операциями с файловой системой.

=== "MJS"

    ```js
    import { fileURLToPath } from 'node:url';
    
    const __filename = fileURLToPath(import.meta.url);
    
    new URL('file:///C:/path/').pathname;      // Incorrect: /C:/path/
    fileURLToPath('file:///C:/path/');         // Correct:   C:\path\ (Windows)
    
    new URL('file://nas/foo.txt').pathname;    // Incorrect: /foo.txt
    fileURLToPath('file://nas/foo.txt');       // Correct:   \\nas\foo.txt (Windows)
    
    new URL('file:///你好.txt').pathname;      // Incorrect: /%E4%BD%A0%E5%A5%BD.txt
    fileURLToPath('file:///你好.txt');         // Correct:   /你好.txt (POSIX)
    
    new URL('file:///hello world').pathname;   // Incorrect: /hello%20world
    fileURLToPath('file:///hello world');      // Correct:   /hello world (POSIX)
    ```

=== "CJS"

    ```js
    const { fileURLToPath } = require('node:url');
    new URL('file:///C:/path/').pathname;      // Incorrect: /C:/path/
    fileURLToPath('file:///C:/path/');         // Correct:   C:\path\ (Windows)
    
    new URL('file://nas/foo.txt').pathname;    // Incorrect: /foo.txt
    fileURLToPath('file://nas/foo.txt');       // Correct:   \\nas\foo.txt (Windows)
    
    new URL('file:///你好.txt').pathname;      // Incorrect: /%E4%BD%A0%E5%A5%BD.txt
    fileURLToPath('file:///你好.txt');         // Correct:   /你好.txt (POSIX)
    
    new URL('file:///hello world').pathname;   // Incorrect: /hello%20world
    fileURLToPath('file:///hello world');      // Correct:   /hello world (POSIX)
    ```

### `url.fileURLToPathBuffer(url[, options])`

<!--
added:
 - v24.3.0
 - v22.18.0
-->

* `url` [`<URL>`](url.md#the-whatwg-url-api) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка file URL или объект URL для преобразования в путь.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `windows` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined `true` — путь как в Windows, `false` — POSIX,
    `undefined` — по умолчанию для системы.
    **По умолчанию:** `undefined`.
* Возвращает: [`<Buffer>`](buffer.md#buffer) Полностью разрешённый путь к файлу в виде [Buffer](buffer.md#buffer).

Как `url.fileURLToPath(...)`, но возвращается `Buffer` вместо строки. Удобно,
если в URL есть процентно закодированные фрагменты, не являющиеся корректным UTF-8.

**Безопасность:**

Те же риски, что у [`url.fileURLToPath()`][`url.fileURLToPath()`]: декодирование и нормализация пути.
**Нельзя полагаться только на эту функцию против атак с обходом каталога.**
Проверяйте полученный `Buffer` перед использованием в ФС.

### `url.format(URL[, options])`

<!-- YAML
added: v7.6.0
-->

* `URL` [`<URL>`](url.md#the-whatwg-url-api) Объект [WHATWG URL][WHATWG URL]
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `auth` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — включать имя пользователя и пароль в строку, иначе
    нет. **По умолчанию:** `true`.
  * `fragment` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — включать фрагмент. **По умолчанию:** `true`.
  * `search` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — включать строку запроса. **По умолчанию:** `true`.
  * `unicode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — символы Юникода в хосте кодируются напрямую, а не
    через Punycode. **По умолчанию:** `false`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Настраиваемая сериализация объекта [WHATWG URL][WHATWG URL] в строку.

У объекта URL есть `toString()` и `href`, но без настроек. `url.format(URL[, options])`
даёт базовую настройку вывода.

=== "MJS"

    ```js
    import url from 'node:url';
    const myURL = new URL('https://a:b@測試?abc#foo');
    
    console.log(myURL.href);
    // Prints https://a:b@xn--g6w251d/?abc#foo
    
    console.log(myURL.toString());
    // Prints https://a:b@xn--g6w251d/?abc#foo
    
    console.log(url.format(myURL, { fragment: false, unicode: true, auth: false }));
    // Prints 'https://測試/?abc'
    ```

=== "CJS"

    ```js
    const url = require('node:url');
    const myURL = new URL('https://a:b@測試?abc#foo');
    
    console.log(myURL.href);
    // Prints https://a:b@xn--g6w251d/?abc#foo
    
    console.log(myURL.toString());
    // Prints https://a:b@xn--g6w251d/?abc#foo
    
    console.log(url.format(myURL, { fragment: false, unicode: true, auth: false }));
    // Prints 'https://測試/?abc'
    ```

### `url.pathToFileURL(path[, options])`

<!-- YAML
added: v10.12.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52509
    description: Аргумент `options` задаёт способ возврата значения `path`.
-->

Добавлено в: v10.12.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | Аргумент `options` задаёт способ возврата значения `path`. |

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь для преобразования в file URL.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `windows` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined `true` — путь как в Windows, `false` — POSIX,
    `undefined` — по умолчанию для системы.
    **По умолчанию:** `undefined`.
* Возвращает: [`<URL>`](url.md#the-whatwg-url-api) Объект file URL.

Функция разрешает `path` в абсолютный путь и корректно кодирует управляющие символы
при преобразовании в file URL.

=== "MJS"

    ```js
    import { pathToFileURL } from 'node:url';
    
    new URL('/foo#1', 'file:');           // Incorrect: file:///foo#1
    pathToFileURL('/foo#1');              // Correct:   file:///foo%231 (POSIX)
    
    new URL('/some/path%.c', 'file:');    // Incorrect: file:///some/path%.c
    pathToFileURL('/some/path%.c');       // Correct:   file:///some/path%25.c (POSIX)
    ```

=== "CJS"

    ```js
    const { pathToFileURL } = require('node:url');
    new URL(__filename);                  // Incorrect: throws (POSIX)
    new URL(__filename);                  // Incorrect: C:\... (Windows)
    pathToFileURL(__filename);            // Correct:   file:///... (POSIX)
    pathToFileURL(__filename);            // Correct:   file:///C:/... (Windows)
    
    new URL('/foo#1', 'file:');           // Incorrect: file:///foo#1
    pathToFileURL('/foo#1');              // Correct:   file:///foo%231 (POSIX)
    
    new URL('/some/path%.c', 'file:');    // Incorrect: file:///some/path%.c
    pathToFileURL('/some/path%.c');       // Correct:   file:///some/path%25.c (POSIX)
    ```

### `url.urlToHttpOptions(url)`

<!-- YAML
added:
  - v15.7.0
  - v14.18.0
changes:
  - version:
    - v19.9.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/46989
    description: Возвращаемый объект также содержит все собственные перечислимые
                 свойства аргумента `url`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.9.0, v18.17.0 | Возвращаемый объект также содержит все собственные перечислимые свойства аргумента `url`. |

* `url` [`<URL>`](url.md#the-whatwg-url-api) Объект [WHATWG URL][WHATWG URL] для преобразования в объект опций.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект опций
  * `protocol` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Протокол.
  * `hostname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Доменное имя или IP сервера.
  * `hash` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Фрагмент URL.
  * `search` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сериализованная строка запроса.
  * `pathname` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь URL.
  * `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь запроса; при наличии строки запроса она включена.
    Например `'/index.html?page=12'`. Исключение при недопустимых символах в пути
    (сейчас отклоняются пробелы; правила могут измениться).
  * `href` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сериализованный URL.
  * `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт удалённого сервера.
  * `auth` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Basic-авторизация в виде `'user:password'` для заголовка Authorization.

Преобразует объект URL в обычный объект опций для [`http.request()`][`http.request()`] и [`https.request()`][`https.request()`].

=== "MJS"

    ```js
    import { urlToHttpOptions } from 'node:url';
    const myURL = new URL('https://a:b@測試?abc#foo');
    
    console.log(urlToHttpOptions(myURL));
    /*
    {
      protocol: 'https:',
      hostname: 'xn--g6w251d',
      hash: '#foo',
      search: '?abc',
      pathname: '/',
      path: '/?abc',
      href: 'https://a:b@xn--g6w251d/?abc#foo',
      auth: 'a:b'
    }
    */
    ```

=== "CJS"

    ```js
    const { urlToHttpOptions } = require('node:url');
    const myURL = new URL('https://a:b@測試?abc#foo');
    
    console.log(urlToHttpOptions(myURL));
    /*
    {
      protocol: 'https:',
      hostname: 'xn--g6w251d',
      hash: '#foo',
      search: '?abc',
      pathname: '/',
      path: '/?abc',
      href: 'https://a:b@xn--g6w251d/?abc#foo',
      auth: 'a:b'
    }
    */
    ```

## Унаследованный API URL

<!-- YAML
changes:
  - version:
      - v15.13.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37784
    description: Deprecation revoked. Status changed to "Legacy".
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22715
    description: This API is deprecated.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.13.0, v14.17.0 | Устаревание отменено. Статус изменен на «Наследие». |
    | v11.0.0 | Этот API устарел. |

> Stability: 3 - Legacy: предпочитайте WHATWG URL API.

### Legacy `urlObject`

<!-- YAML
changes:
  - version:
      - v15.13.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37784
    description: Deprecation revoked. Status changed to "Legacy".
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22715
    description: The Legacy URL API is deprecated. Use the WHATWG URL API.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.13.0, v14.17.0 | Устаревание отменено. Статус изменен на «Наследие». |
    | v11.0.0 | API устаревших URL-адресов устарел. Используйте URL-API WHATWG. |

Унаследованный `urlObject` (`require('node:url').Url` или
`import { Url } from 'node:url'`) создаётся и возвращается функцией `url.parse()`.

#### `urlObject.auth`

Свойство `auth` — часть URL с именем пользователя и паролем (_userinfo_). Эта
подстрока идёт после `protocol` и двойного слэша (если есть) и перед компонентом
`host`, отделённая символом `@`. Строка — либо только имя пользователя, либо
`имя:пароль`.

Например: `'user:pass'`.

#### `urlObject.hash`

Свойство `hash` — идентификатор фрагмента URL, включая ведущий `#`.

Например: `'#hash'`.

#### `urlObject.host`

Свойство `host` — вся часть хоста в нижнем регистре, включая `port`, если указан.

Например: `'sub.example.com:8080'`.

#### `urlObject.hostname`

Свойство `hostname` — имя хоста в нижнем регистре из компонента `host` _без_ `port`.

Например: `'sub.example.com'`.

#### `urlObject.href`

Свойство `href` — полная строка URL после разбора; компоненты `protocol` и `host`
приведены к нижнему регистру.

Например: `'http://user:pass@sub.example.com:8080/p/a/t/h?query=string#hash'`.

#### `urlObject.path`

Свойство `path` — конкатенация `pathname` и `search`.

Например: `'/p/a/t/h?query=string'`.

Декодирование `path` не выполняется.

#### `urlObject.pathname`

Свойство `pathname` — весь путь URL: после `host` (включая `port`) и до начала
`query` или `hash`, разделители — ASCII `?` или `#`.

Например: `'/p/a/t/h'`.

Декодирование строки пути не выполняется.

#### `urlObject.port`

Свойство `port` — числовая часть порта компонента `host`.

Например: `'8080'`.

#### `urlObject.protocol`

Свойство `protocol` — схема протокола URL в нижнем регистре.

Например: `'http:'`.

#### `urlObject.query`

Свойство `query` — либо строка запроса без ведущего ASCII `?`, либо объект из
метода `parse()` модуля [`querystring`][`querystring`]. Тип задаётся аргументом `parseQueryString` в `url.parse()`.

Например: `'query=string'` или `{'query': 'string'}`.

Если это строка, декодирование не выполняется; если объект — декодируются и ключи, и значения.

#### `urlObject.search`

Свойство `search` — вся «строка запроса» URL, включая ведущий ASCII `?`.

Например: `'?query=string'`.

Декодирование строки запроса не выполняется.

#### `urlObject.slashes`

Свойство `slashes` — `boolean`: `true`, если после двоеточия в `protocol` нужны
два ASCII-слэша (`/`).

### `url.format(urlObject)`

<!-- YAML
added: v0.1.25
changes:
  - version: v17.0.0
    pr-url: https://github.com/nodejs/node/pull/38631
    description: Now throws an `ERR_INVALID_URL` exception when Punycode
                 conversion of a hostname introduces changes that could cause
                 the URL to be re-parsed differently.
  - version:
      - v15.13.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37784
    description: Deprecation revoked. Status changed to "Legacy".
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22715
    description: The Legacy URL API is deprecated. Use the WHATWG URL API.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7234
    description: URLs with a `file:` scheme will now always use the correct
                 number of slashes regardless of `slashes` option. A falsy
                 `slashes` option with no protocol is now also respected at all
                 times.
-->

Добавлено в: v0.1.25

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.0.0 | Теперь выдает исключение ERR_INVALID_URL, когда преобразование имени хоста Punycode вносит изменения, которые могут привести к другому повторному анализу URL-адреса. |
    | v15.13.0, v14.17.0 | Устаревание отменено. Статус изменен на «Наследие». |
    | v11.0.0 | API устаревших URL-адресов устарел. Используйте URL-API WHATWG. |
    | v7.0.0 | URL-адреса со схемой `file:` теперь всегда будут использовать правильное количество косых черт независимо от параметра `косые черты`. Опция ложной косой черты без протокола теперь также всегда учитывается. |

* `urlObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект URL (как из `url.parse()` или собранный вручную).

Метод `url.format()` возвращает отформатированную строку URL из `urlObject`.

```js
const url = require('node:url');
url.format({
  protocol: 'https',
  hostname: 'example.com',
  pathname: '/some/path',
  query: {
    page: 1,
    format: 'json',
  },
});

// => 'https://example.com/some/path?page=1&format=json'
```

Если `urlObject` не объект и не строка, `url.format()` выбросит [`TypeError`][`TypeError`].

Форматирование выполняется так:

* Создаётся пустая строка `result`.
* Если `urlObject.protocol` — строка, она добавляется в `result` как есть.
* Иначе, если `urlObject.protocol` не `undefined` и не строка, выбрасывается [`Error`][`Error`].
* Для строковых значений `urlObject.protocol`, которые _не заканчиваются_ ASCII-двоеточием
  (`:`), к `result` добавляется литерал `:`.
* Если выполняется одно из условий, к `result` добавляется литерал `//`:
  * свойство `urlObject.slashes` истинно;
  * `urlObject.protocol` начинается с `http`, `https`, `ftp`, `gopher` или `file`;
* Если `urlObject.auth` истинно и `urlObject.host` или `urlObject.hostname` не `undefined`,
  значение `urlObject.auth` приводится к строке, добавляется к `result`, затем литерал `@`.
* Если `urlObject.host` — `undefined`:
  * если `urlObject.hostname` — строка, она добавляется к `result`;
  * иначе, если `urlObject.hostname` не `undefined` и не строка, выбрасывается [`Error`][`Error`];
  * если `urlObject.port` истинно и `urlObject.hostname` не `undefined`: к `result` добавляется
    `:` и строковое значение `urlObject.port`.
* Иначе, если `urlObject.host` истинно, его значение приводится к строке и добавляется к `result`.
* Если `urlObject.pathname` — непустая строка:
  * если `urlObject.pathname` _не начинается_ с ASCII `/`, к `result` добавляется `'/'`;
  * затем добавляется значение `urlObject.pathname`.
* Иначе, если `urlObject.pathname` не `undefined` и не строка, выбрасывается [`Error`][`Error`].
* Если `urlObject.search` — `undefined`, а `urlObject.query` — объект, к `result` добавляется
  `?` и результат вызова `stringify()` модуля [`querystring`][`querystring`] для `urlObject.query`.
* Иначе, если `urlObject.search` — строка:
  * если она _не начинается_ с ASCII `?`, к `result` добавляется `?`;
  * затем добавляется значение `urlObject.search`.
* Иначе, если `urlObject.search` не `undefined` и не строка, выбрасывается [`Error`][`Error`].
* Если `urlObject.hash` — строка:
  * если она _не начинается_ с ASCII `#`, к `result` добавляется `#`;
  * затем добавляется значение `urlObject.hash`.
* Иначе, если `urlObject.hash` не `undefined` и не строка, выбрасывается [`Error`][`Error`].
* Возвращается `result`.

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/node-url-to-whatwg-url)).

```bash
npx codemod@latest @nodejs/node-url-to-whatwg-url
```

### `url.format(urlString)`

<!-- YAML
added: v0.1.25
changes:
  - version:
      - v24.0.0
    pr-url: https://github.com/nodejs/node/pull/55017
    description: Application deprecation.
-->

Добавлено в: v0.1.25

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0 | Устаревание приложения. |

> Stability: 0 - Deprecated: предпочитайте WHATWG URL API.

* `urlString` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка, которая будет передана в `url.parse()`, затем отформатирована.

`url.format(urlString)` — сокращение для `url.format(url.parse(urlString))`.

Внутри вызывается устаревший [`url.parse()`][`url.parse()`], поэтому передача строки в `url.format()`
сама по себе устарела.

Канонизацию строки URL лучше делать через WHATWG URL API: `new URL(...)` и [`url.toString()`][`url.toString()`].

=== "MJS"

    ```js
    import { URL } from 'node:url';
    
    const unformatted = 'http://[fe80:0:0:0:0:0:0:1]:/a/b?a=b#abc';
    const formatted = new URL(unformatted).toString();
    
    console.log(formatted); // Prints: http://[fe80::1]/a/b?a=b#abc
    ```

=== "CJS"

    ```js
    const { URL } = require('node:url');
    
    const unformatted = 'http://[fe80:0:0:0:0:0:0:1]:/a/b?a=b#abc';
    const formatted = new URL(unformatted).toString();
    
    console.log(formatted); // Prints: http://[fe80::1]/a/b?a=b#abc
    ```

### `url.parse(urlString[, parseQueryString[, slashesDenoteHost]])`

<!-- YAML
added: v0.1.25
changes:
  - version:
      - v24.0.0
    pr-url: https://github.com/nodejs/node/pull/55017
    description: Application deprecation.
  - version:
      - v19.9.0
      - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47203
    description: Added support for `--pending-deprecation`.
  - version:
      - v19.0.0
      - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/44919
    description: Documentation-only deprecation.
  - version:
      - v15.13.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37784
    description: Deprecation revoked. Status changed to "Legacy".
  - version: v11.14.0
    pr-url: https://github.com/nodejs/node/pull/26941
    description: The `pathname` property on the returned URL object is now `/`
                 when there is no path and the protocol scheme is `ws:` or
                 `wss:`.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22715
    description: The Legacy URL API is deprecated. Use the WHATWG URL API.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/13606
    description: The `search` property on the returned URL object is now `null`
                 when no query string is present.
-->

Добавлено в: v0.1.25

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0 | Устаревание приложения. |
    | v19.9.0, v18.17.0 | Добавлена ​​поддержка `--pending-deprecation`. |
    | v19.0.0, v18.13.0 | Прекращение поддержки только документации. |
    | v15.13.0, v14.17.0 | Устаревание отменено. Статус изменен на «Наследие». |
    | v11.14.0 | Свойство pathname возвращаемого объекта URL теперь имеет значение `/`, если путь отсутствует и используется схема протокола `ws:` или `wss:`. |
    | v11.0.0 | API устаревших URL-адресов устарел. Используйте URL-API WHATWG. |
    | v9.0.0 | Свойство search в возвращаемом объекте URL теперь имеет значение null, если строка запроса отсутствует. |

> Stability: 0 - Deprecated: предпочитайте WHATWG URL API.

* `urlString` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка URL для разбора.
* `parseQueryString` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, свойство `query` всегда будет объектом
  из метода `parse()` модуля [`querystring`][`querystring`]. Если `false` — неразобранная строка. **По умолчанию:** `false`.
* `slashesDenoteHost` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, первый фрагмент после литерала `//` до
  следующего `/` считается `host`. Например, для `//foo/bar` получится
  `{host: 'foo', pathname: '/bar'}`, а не `{pathname: '//foo/bar'}`. **По умолчанию:** `false`.

Метод `url.parse()` разбирает строку URL и возвращает объект URL.

Если `urlString` не строка, выбрасывается `TypeError`.

Если есть `auth`, но его нельзя декодировать — `URIError`.

`url.parse()` использует мягкий нестандартный алгоритм; возможны уязвимости вроде
[подмены имени хоста][host name spoofing] и ошибок с учётными данными. Не применяйте к
недоверенным данным. Для CVE по `url.parse()` не выпускаются. Используйте [WHATWG URL][WHATWG URL],
например:

```js
function getURL(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'example.com';
  return new URL(`${proto}://${host}${req.url || '/'}`);
}
```

Пример выше предполагает, что от обратного прокси передаются корректные заголовки.
Без обратного прокси используйте вариант ниже:

```js
function getURL(req) {
  return new URL(`https://example.com${req.url || '/'}`);
}
```

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/node-url-to-whatwg-url)).

```bash
npx codemod@latest @nodejs/node-url-to-whatwg-url
```

### `url.resolve(from, to)`

<!-- YAML
added: v0.1.25
changes:
  - version:
      - v24.0.0
    pr-url: https://github.com/nodejs/node/pull/55017
    description: Deprecated again through DEP0169.
  - version:
      - v15.13.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37784
    description: Deprecation revoked. Status changed to "Legacy".
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22715
    description: The Legacy URL API is deprecated. Use the WHATWG URL API.
  - version: v6.6.0
    pr-url: https://github.com/nodejs/node/pull/8215
    description: The `auth` fields are now kept intact when `from` and `to`
                 refer to the same host.
  - version:
    - v6.5.0
    - v4.6.2
    pr-url: https://github.com/nodejs/node/pull/8214
    description: The `port` field is copied correctly now.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/1480
    description: The `auth` fields is cleared now the `to` parameter
                 contains a hostname.
-->

Добавлено в: v0.1.25

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0 | Устарело снова через DEP0169. |
    | v15.13.0, v14.17.0 | Устаревание отменено. Статус изменен на «Наследие». |
    | v11.0.0 | API устаревших URL-адресов устарел. Используйте URL-API WHATWG. |
    | v6.6.0 | Поля `auth` теперь сохраняются, когда `from` и `to` относятся к одному и тому же хосту. |
    | v6.5.0, v4.6.2 | Поле `port` теперь копируется правильно. |
    | v6.0.0 | Поля `auth` очищаются, теперь параметр `to` содержит имя хоста. |

> Stability: 0 - Deprecated: предпочитайте WHATWG URL API.

* `from` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Базовый URL, если `to` относительный.
* `to` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Целевой URL для разрешения.

Метод `url.resolve()` разрешает целевой URL относительно базового примерно так же,
как браузер для `<a href>`.

```js
const url = require('node:url');
url.resolve('/one/two/three', 'four');         // '/one/two/four'
url.resolve('http://example.com/', '/one');    // 'http://example.com/one'
url.resolve('http://example.com/one', '/two'); // 'http://example.com/two'
```

Внутри вызывается устаревший [`url.parse()`][`url.parse()`], поэтому `url.resolve()` устарел.

Тот же результат через WHATWG URL API:

```js
function resolve(from, to) {
  const resolvedUrl = new URL(to, new URL(from, 'resolve://'));
  if (resolvedUrl.protocol === 'resolve:') {
    // `from` is a relative URL.
    const { pathname, search, hash } = resolvedUrl;
    return pathname + search + hash;
  }
  return resolvedUrl.toString();
}

resolve('/one/two/three', 'four');         // '/one/two/four'
resolve('http://example.com/', '/one');    // 'http://example.com/one'
resolve('http://example.com/one', '/two'); // 'http://example.com/two'
```

## Процентное кодирование в URL {#whatwg-percent-encoding}

В URL допустим только определённый набор символов. Всё, что вне него, нужно
кодировать. Способ и набор символов зависят от позиции символа в структуре URL.

### Унаследованный API

В унаследованном API пробелы (`' '`) и перечисленные ниже символы в свойствах
объектов URL экранируются автоматически:

```text
< > " ` \r \n \t { } | \ ^ '
```

Например, пробел ASCII (`' '`) кодируется как `%20`. Прямой слэш ASCII (`/`) — как `%3C`.

### WHATWG API

[WHATWG URL Standard][WHATWG URL Standard] задаёт более выборочный и детальный набор кодируемых
символов, чем унаследованный API.

Алгоритм WHATWG определяет четыре «набора процентного кодирования»:

* _C0 control percent-encode set_ — кодовые точки U+0000–U+001F (включительно) и все
  выше U+007E (\~).

* _fragment percent-encode set_ — включает _C0 control percent-encode set_ и точки
  U+0020 SPACE, U+0022 ("), U+003C (<), U+003E (>), U+0060 (\`).

* _path percent-encode set_ — включает _C0 control percent-encode set_ и точки
  U+0020 SPACE, U+0022 ("), U+0023 (#), U+003C (<), U+003E (>), U+003F (?),
  U+0060 (\`), U+007B ({), U+007D (}).

* _userinfo encode set_ — включает _path percent-encode set_ и точки U+002F (/),
  U+003A (:), U+003B (;), U+003D (=), U+0040 (@), U+005B (\[)–U+005E(^), U+007C (|).

Набор _userinfo percent-encode set_ используется для имени пользователя и пароля в URL.
_path percent-encode set_ — для пути большинства URL. _fragment percent-encode set_ —
для фрагментов. _C0 control percent-encode set_ — для хоста и пути в особых случаях
и в прочих ситуациях по правилам стандарта.

Небуквенные символы в имени хоста кодируются через [Punycode][Punycode]. Имя хоста _может_
содержать _и_ Punycode, и процентное кодирование:

```js
const myURL = new URL('https://%CF%80.example.com/foo');
console.log(myURL.href);
// Prints https://xn--1xa.example.com/foo
console.log(myURL.origin);
// Prints https://xn--1xa.example.com
```

[Punycode]: https://tools.ietf.org/html/rfc5891#section-4.4
[WHATWG URL]: #the-whatwg-url-api
[WHATWG URL Standard]: https://url.spec.whatwg.org/
[`Error`]: errors.md#class-error
[`JSON.stringify()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[`TypeError`]: errors.md#class-typeerror
[`URLSearchParams`]: #class-urlsearchparams
[`array.toString()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toString
[`http.request()`]: http.md#httprequestoptions-callback
[`https.request()`]: https.md#httpsrequestoptions-callback
[`new URL()`]: #new-urlinput-base
[`querystring`]: querystring.md
[`url.domainToASCII()`]: #urldomaintoasciidomain
[`url.domainToUnicode()`]: #urldomaintounicodedomain
[`url.fileURLToPath()`]: #urlfileurltopathurl-options
[`url.format()`]: #urlformaturlobject
[`url.href`]: #urlhref
[`url.parse()`]: #urlparseurlstring-parsequerystring-slashesdenotehost
[`url.search`]: #urlsearch
[`url.toJSON()`]: #urltojson
[`url.toString()`]: #urltostring
[`urlSearchParams.entries()`]: #urlsearchparamsentries
[`urlSearchParamsSymbol.iterator()`]: #urlsearchparamssymboliterator
[converted to a string]: https://tc39.es/ecma262/#sec-tostring
[examples of parsed URLs]: https://url.spec.whatwg.org/#example-url-parsing
[host name spoofing]: https://hackerone.com/reports/678487
[legacy `urlObject`]: #legacy-urlobject
[percent-encoded]: #percent-encoding-in-urls
[stable sorting algorithm]: https://en.wikipedia.org/wiki/Sorting_algorithm#Stability
