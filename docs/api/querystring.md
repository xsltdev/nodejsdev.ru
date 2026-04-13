---
title: Строка запроса
description: Модуль node:querystring предоставляет утилиты для разбора и форматирования строк запросов URL
---

# Строка запроса

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/querystring.html)

<!--introduced_in=v0.1.25-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!--name=querystring-->

<!-- source_link=lib/querystring.js -->

Модуль `node:querystring` предоставляет утилиты для разбора и форматирования строк запросов URL. Доступ к нему можно получить так:

```js
const querystring = require('node:querystring');
```

`querystring` более производителен, чем [URLSearchParams](url.md#class-urlsearchparams), но не является стандартизированным API. Используйте [URLSearchParams](url.md#class-urlsearchparams), когда производительность не критична или когда желательна совместимость с кодом браузера.

## `querystring.decode()`

<!-- YAML
added: v0.1.99
-->

Функция `querystring.decode()` является псевдонимом для `querystring.parse()`.

## `querystring.encode()`

<!-- YAML
added: v0.1.99
-->

Функция `querystring.encode()` является псевдонимом для `querystring.stringify()`.

## `querystring.escape(str)`

<!-- YAML
added: v0.1.25
-->

* `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `querystring.escape()` выполняет процентное кодирование URL для заданного `str` способом, оптимизированным для специфических требований строк запросов URL.

Метод `querystring.escape()` используется `querystring.stringify()` и, как правило, не предполагается его прямое использование. Он экспортируется главным образом для того, чтобы код приложения мог при необходимости обеспечить замену реализации процентного кодирования, назначив `querystring.escape` альтернативной функции.

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

Добавлено в: v0.1.25

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Несколько пустых записей теперь анализируются правильно (например, `&=&=`). |
    | v6.0.0 | Возвращенный объект больше не наследуется от Object.prototype. |
    | v6.0.0, v4.2.4 | Параметр `eq` теперь может иметь длину более `1`. |

* `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка запроса URL для разбора
* `sep` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Подстрока, используемая для разделения пар ключей и значений в строке запроса. **По умолчанию:** `'&'`.
* `eq` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Подстрока, используемая для разделения ключей и значений в строке запроса. **По умолчанию:** `'='`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `decodeURIComponent` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую следует использовать при декодировании символов в процентном кодировании в строке запроса. **По умолчанию:** `querystring.unescape()`.
  * `maxKeys` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт максимальное количество ключей для разбора. Укажите `0`, чтобы снять ограничение на подсчёт ключей. **По умолчанию:** `1000`.

Метод `querystring.parse()` разбирает строку запроса URL (`str`) в набор пар ключей и значений.

Например, строка запроса `'foo=bar&abc=xyz&abc=123'` разбирается в:

```json
{
  "foo": "bar",
  "abc": ["xyz", "123"]
}
```

Объект, возвращаемый методом `querystring.parse()`, _не_ прототипически наследует от JavaScript `Object`. Это означает, что типичные методы `Object`, такие как `obj.toString()`, `obj.hasOwnProperty()` и другие, не определены и _не будут работать_.

По умолчанию предполагается, что символы в процентном кодировании в строке запроса закодированы в UTF-8. Если используется другая кодировка символов, нужно указать альтернативную опцию `decodeURIComponent`:

```js
// Предполагается, что функция gbkDecodeURIComponent уже существует...

querystring.parse('w=%D6%D0%CE%C4&foo=bar', null, null,
                  { decodeURIComponent: gbkDecodeURIComponent });
```

## `querystring.stringify(obj[, sep[, eq[, options]]])`

<!-- YAML
added: v0.1.25
-->

* `obj` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект для сериализации в строку запроса URL
* `sep` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Подстрока, используемая для разделения пар ключей и значений в строке запроса. **По умолчанию:** `'&'`.
* `eq` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Подстрока, используемая для разделения ключей и значений в строке запроса. **По умолчанию:** `'='`.
* `options`
  * `encodeURIComponent` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую следует использовать при преобразовании небезопасных для URL символов в процентное кодирование в строке запроса. **По умолчанию:** `querystring.escape()`.

Метод `querystring.stringify()` формирует строку запроса URL из заданного `obj`, перебирая «собственные свойства» объекта.

Он сериализует следующие типы значений, переданных в `obj`:
[string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [string[]](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [number[]](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [bigint[]](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | [boolean[]](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
Числовые значения должны быть конечными. Любые другие входные значения будут приведены к пустым строкам.

```js
querystring.stringify({ foo: 'bar', baz: ['qux', 'quux'], corge: '' });
// Returns 'foo=bar&baz=qux&baz=quux&corge='

querystring.stringify({ foo: 'bar', baz: 'qux' }, ';', ':');
// Returns 'foo:bar;baz:qux'
```

По умолчанию символы, требующие процентного кодирования в строке запроса, кодируются как UTF-8. Если нужна другая кодировка, необходимо указать альтернативную опцию `encodeURIComponent`:

```js
// Предполагается, что функция gbkEncodeURIComponent уже существует,

querystring.stringify({ w: '中文', foo: 'bar' }, null, null,
                      { encodeURIComponent: gbkEncodeURIComponent });
```

## `querystring.unescape(str)`

<!-- YAML
added: v0.1.25
-->

* `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `querystring.unescape()` выполняет декодирование символов в процентном кодировании URL для заданного `str`.

Метод `querystring.unescape()` используется `querystring.parse()` и, как правило, не предполагается его прямое использование. Он экспортируется главным образом для того, чтобы код приложения мог при необходимости предоставить замену реализации декодирования, назначив `querystring.unescape` альтернативной функции.

По умолчанию метод `querystring.unescape()` пытается использовать встроенный в JavaScript метод `decodeURIComponent()` для декодирования. Если это не удаётся, используется более безопасный эквивалент, который не выбрасывает исключение на некорректных URL.
