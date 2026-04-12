---
title: Query strings
description: Модуль querystring предоставляет утилиты для разбора и форматирования строк запросов URL
---

# Строка запроса

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/querystring.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:querystring` предоставляет утилиты для разбора и форматирования строк запросов URL. Доступ к нему можно получить с помощью:

```js
const querystring = require('node:querystring');
```

`querystring` более производителен, чем {URLSearchParams}, но не является стандартизированным API. Используйте {URLSearchParams}, когда производительность не критична или когда желательна совместимость с кодом браузера.

## `querystring.decode()`

Функция `querystring.decode()` является псевдонимом для `querystring.parse()`.

## `querystring.encode()`

Функция `querystring.encode()` является псевдонимом для `querystring.stringify()`.

## `querystring.escape(str)`

-   `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `querystring.escape()` выполняет процентное кодирование URL для заданного `str` способом, оптимизированным для специфических требований строк запросов URL.

Метод `querystring.escape()` используется `querystring.stringify()` и, как правило, не предполагается его прямое использование. Он экспортируется главным образом для того, чтобы код приложения мог при необходимости обеспечить замену реализации процентного кодирования, назначив `querystring.escape` альтернативной функции.

## `querystring.parse(str[, sep[, eq[, options]]])`

-   `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка запроса URL для разбора
-   `sep` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Подстрока, используемая для разделения пар ключей и значений в строке запроса. **По умолчанию:** `'&'`.
-   `eq` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Подстрока, используемая для разделения ключей и значений в строке запроса. **По умолчанию:** `'='`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object).
    -   `decodeURIComponent` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую следует использовать при декодировании символов в строке запроса. **По умолчанию:** `querystring.unescape()`.
    -   `maxKeys` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Определяет максимальное количество ключей для разбора. Укажите `0`, чтобы снять ограничения на подсчет ключей. **По умолчанию:** `1000`.

Метод `querystring.parse()` анализирует строку запроса URL (`str`) в набор пар ключей и значений.

Например, строка запроса `'foo=bar&abc=xyz&abc=123'` разбирается как:

```js
{
  foo: 'bar',
  abc: ['xyz', '123']
}
```

Объект, возвращаемый методом `querystring.parse()`, _не_ прототипически наследует от JavaScript `Object`. Это означает, что типичные методы `Object`, такие как `obj.toString()`, `obj.hasOwnProperty()` и другие, не определены и _не будут работать_.

По умолчанию предполагается, что символы в строке запроса имеют кодировку UTF-8. Если используется альтернативная кодировка, то необходимо указать альтернативную опцию `decodeURIComponent`:

```js
// Предполагается, что функция gbkDecodeURIComponent уже существует...

querystring.parse('w=%D6%D0%CE%C4&foo=bar', null, null, {
    decodeURIComponent: gbkDecodeURIComponent,
});
```

## `querystring.stringify(obj[, sep[, eq[, options]]])`

-   `obj` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект для сериализации в строку запроса URL
-   `sep` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Подстрока, используемая для разделения пар ключей и значений в строке запроса. **По умолчанию:** `'&'`.
-   `eq` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type). Подстрока, используемая для разделения ключей и значений в строке запроса. **По умолчанию:** `'='`.
-   `options`.
    -   `encodeURIComponent` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую следует использовать при преобразовании небезопасных для URL символов в процентное кодирование в строке запроса. **По умолчанию:** `querystring.escape()`.

Метод `querystring.stringify()` создает строку запроса URL из заданного `obj` путем итерации по "собственным свойствам" объекта.

Он сериализует следующие типы значений, переданных в `obj`: {string|number|bigint|boolean|string\[\]|number\[\]|bigint\[\]|boolean\[\]}. Числовые значения должны быть конечными. Любые другие значения будут преобразованы в пустые строки.

```js
querystring.stringify({
    foo: 'bar',
    baz: ['qux', 'quux'],
    corge: '',
});
// Возвращает 'foo=bar&baz=qux&baz=quux&corge='

querystring.stringify({ foo: 'bar', baz: 'qux' }, ';', ':');
// Возвращает 'foo:bar;baz:qux'
```

По умолчанию символы, требующие процентного кодирования в строке запроса, будут закодированы как UTF-8. Если требуется альтернативная кодировка, то необходимо указать альтернативную опцию `encodeURIComponent`:

```js
// Предполагается, что функция gbkEncodeURIComponent уже существует,

querystring.stringify(
    { w: '中文', foo: 'bar' },
    null,
    null,
    { encodeURIComponent: gbkEncodeURIComponent }
);
```

## `querystring.unescape(str)`

-   `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `querystring.unescape()` выполняет декодирование символов, закодированных в процентах URL, на заданном `str`.

Метод `querystring.unescape()` используется функцией `querystring.parse()` и обычно не предполагается его прямое использование. Он экспортируется в первую очередь для того, чтобы код приложения мог при необходимости предоставить замену реализации декодирования, назначив `querystring.unescape` альтернативной функции.

По умолчанию метод `querystring.unescape()` пытается использовать для декодирования встроенный в JavaScript метод `decodeURIComponent()`. Если это не удается, будет использован более безопасный эквивалент, который не приводит к ошибкам в URL.

