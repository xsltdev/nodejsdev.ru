# Модуль querystring

<!--introduced_in=v0.1.25-->

> Стабильность: 3 - Наследие

<!--name=querystring-->

<!-- source_link=lib/querystring.js -->

В `querystring` Модуль предоставляет утилиты для синтаксического анализа и форматирования строк запроса URL. Доступ к нему можно получить, используя:

```js
const querystring = require('querystring');
```

В `querystring` API считается устаревшим. Хотя он все еще поддерживается, новый код должен использовать вместо него {URLSearchParams} API.

## `querystring.decode()`

<!-- YAML
added: v0.1.99
-->

В `querystring.decode()` функция - это псевдоним для `querystring.parse()`.

## `querystring.encode()`

<!-- YAML
added: v0.1.99
-->

В `querystring.encode()` функция - это псевдоним для `querystring.stringify()`.

## `querystring.escape(str)`

<!-- YAML
added: v0.1.25
-->

- `str` {нить}

В `querystring.escape()` выполняет процентное кодирование URL для заданного `str` способом, оптимизированным для конкретных требований строк запроса URL.

В `querystring.escape()` метод используется `querystring.stringify()` и обычно не предполагается использовать напрямую. Он экспортируется в первую очередь для того, чтобы код приложения мог обеспечить замену реализации процентного кодирования, если необходимо, назначив `querystring.escape` к альтернативной функции.

## `querystring.parse(str[, sep[, eq[, options]]])`

<!-- YAML
added: v0.1.25
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/10967
    description: Multiple empty entries are now parsed correctly (e.g. `&=&=`).
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/6055
    description: The returned object no longer inherits from `Object.prototype`.
  - version:
    - v6.0.0
    - v4.2.4
    pr-url: https://github.com/nodejs/node/pull/3807
    description: The `eq` parameter may now have a length of more than `1`.
-->

- `str` {строка} Строка запроса URL для анализа
- `sep` {строка} Подстрока, используемая для разделения пар ключ и значение в строке запроса. **Дефолт:** `'&'`.
- `eq` {нить}. Подстрока, используемая для разделения ключей и значений в строке запроса. **Дефолт:** `'='`.
- `options` {Объект}
  - `decodeURIComponent` {Функция} Функция, используемая при декодировании закодированных в процентах символов в строке запроса. **Дефолт:** `querystring.unescape()`.
  - `maxKeys` {число} Задает максимальное количество ключей для анализа. Указать `0` для снятия ограничений на подсчет ключей. **Дефолт:** `1000`.

В `querystring.parse()` анализирует строку запроса URL (`str`) в коллекцию пар ключ и значение.

Например, строка запроса `'foo=bar&abc=xyz&abc=123'` разбирается на:

<!-- eslint-skip -->

```js
{
  foo: 'bar',
  abc: ['xyz', '123']
}
```

Объект, возвращаемый `querystring.parse()` метод _не_ прототипно унаследовать от JavaScript `Object`. Это означает, что типичный `Object` такие методы как `obj.toString()`, `obj.hasOwnProperty()`, а другие не определены и _не будет работать_.

По умолчанию предполагается, что символы с процентной кодировкой в строке запроса используют кодировку UTF-8. Если используется альтернативная кодировка символов, то альтернативная `decodeURIComponent` необходимо будет указать вариант:

```js
// Assuming gbkDecodeURIComponent function already exists...

querystring.parse('w=%D6%D0%CE%C4&foo=bar', null, null, {
  decodeURIComponent: gbkDecodeURIComponent,
});
```

## `querystring.stringify(obj[, sep[, eq[, options]]])`

<!-- YAML
added: v0.1.25
-->

- `obj` {Object} Объект для сериализации в строку запроса URL
- `sep` {строка} Подстрока, используемая для разделения пар ключ и значение в строке запроса. **Дефолт:** `'&'`.
- `eq` {нить}. Подстрока, используемая для разделения ключей и значений в строке запроса. **Дефолт:** `'='`.
- `options`
  - `encodeURIComponent` {Функция} Функция, используемая при преобразовании небезопасных для URL-адресов символов в процентное кодирование в строке запроса. **Дефолт:** `querystring.escape()`.

В `querystring.stringify()` метод создает строку запроса URL из заданного `obj` путем перебора "собственных свойств" объекта.

Он сериализует следующие типы значений, переданных в `obj`: {строка | число | bigint | логическое | строка \[] | число \[] | bigint \[] | логическое \[]} Числовые значения должны быть конечными. Любые другие входные значения будут преобразованы в пустые строки.

```js
querystring.stringify({
  foo: 'bar',
  baz: ['qux', 'quux'],
  corge: '',
});
// Returns 'foo=bar&baz=qux&baz=quux&corge='

querystring.stringify({ foo: 'bar', baz: 'qux' }, ';', ':');
// Returns 'foo:bar;baz:qux'
```

По умолчанию символы, требующие процентного кодирования в строке запроса, будут закодированы как UTF-8. Если требуется альтернативная кодировка, то альтернативная `encodeURIComponent` необходимо будет указать вариант:

```js
// Assuming gbkEncodeURIComponent function already exists,

querystring.stringify(
  { w: '中文', foo: 'bar' },
  null,
  null,
  { encodeURIComponent: gbkEncodeURIComponent }
);
```

## `querystring.unescape(str)`

<!-- YAML
added: v0.1.25
-->

- `str` {нить}

В `querystring.unescape()` выполняет декодирование процентно закодированных символов URL на заданном `str`.

В `querystring.unescape()` метод используется `querystring.parse()` и обычно не предполагается использовать напрямую. Он экспортируется в первую очередь для того, чтобы код приложения мог обеспечить замену реализации декодирования, если необходимо, назначив `querystring.unescape` к альтернативной функции.

По умолчанию `querystring.unescape()` будет пытаться использовать встроенный JavaScript `decodeURIComponent()` метод декодирования. Если это не удастся, будет использован более безопасный эквивалент, не использующий искаженные URL-адреса.
