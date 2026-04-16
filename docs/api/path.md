---
title: Path
description: Модуль node:path — утилиты для работы с путями к файлам и каталогам на POSIX и Windows
---

# Path

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/path.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с npm имеет высший приоритет и не будет нарушена, кроме случаев явной необходимости.

<!-- source_link=lib/path.js -->

Модуль `node:path` предоставляет утилиты для работы с путями к файлам и каталогам. Подключение:

=== "CJS"

    ```js
    const path = require('node:path');
    ```

=== "MJS"

    ```js
    import path from 'node:path';
    ```

## Windows и POSIX

Поведение модуля `node:path` по умолчанию зависит от операционной системы, на которой выполняется приложение Node.js. В частности, в Windows модуль `node:path` предполагает использование путей в стиле Windows.

Поэтому `path.basename()` может давать разные результаты на POSIX и Windows:

На POSIX:

```js
path.basename('C:\\temp\\myfile.html');
// Возвращает: 'C:\\temp\\myfile.html'
```

На Windows:

```js
path.basename('C:\\temp\\myfile.html');
// Возвращает: 'myfile.html'
```

Чтобы получать согласованные результаты при работе с путями Windows на любой
операционной системе, используйте [`path.win32`](#pathwin32):

На POSIX и Windows:

```js
path.win32.basename('C:\\temp\\myfile.html');
// Возвращает: 'myfile.html'
```

Чтобы получать согласованные результаты при работе с путями POSIX на любой
операционной системе, используйте [`path.posix`](#pathposix):

На POSIX и Windows:

```js
path.posix.basename('/tmp/myfile.html');
// Возвращает: 'myfile.html'
```

В Windows Node.js следует концепции рабочего каталога для каждого диска.
Это заметно при пути к диску без обратной косой черты. Например,
`path.resolve('C:\\')` может вернуть результат, отличный от
`path.resolve('C:')`. Подробнее см.
[страницу MSDN][MSDN-Rel-Path].

## `path.basename(path[, suffix])`

<!-- YAML
added: v0.1.25
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Passing a non-string as the `path` argument will throw now.
-->

Добавлено в: v0.1.25

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `suffix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательный суффикс, который нужно убрать
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.basename()` возвращает последнюю часть `path`, аналогично команде Unix `basename`. Завершающие [разделители каталогов](#pathsep)
игнорируются.

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// Возвращает: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Возвращает: 'quux'
```

Хотя в Windows имена файлов, включая расширения, обычно обрабатываются без учёта регистра, эта функция к регистру чувствительна. Например, `C:\\foo.html` и
`C:\\foo.HTML` указывают на один файл, но `basename` воспринимает расширение как строку с учётом регистра:

```js
path.win32.basename('C:\\foo.html', '.html');
// Возвращает: 'foo'

path.win32.basename('C:\\foo.HTML', '.html');
// Возвращает: 'foo.HTML'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` не строка или если указан `suffix`, который не является строкой.

## `path.delimiter`

<!-- YAML
added: v0.9.3
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Разделитель путей для текущей платформы:

* `;` в Windows
* `:` в POSIX

Например, на POSIX:

```js
console.log(process.env.PATH);
// Выводит: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// Возвращает: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

На Windows:

```js
console.log(process.env.PATH);
// Выводит: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// Возвращает ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

## `path.dirname(path)`

<!-- YAML
added: v0.1.16
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Passing a non-string as the `path` argument will throw now.
-->

Добавлено в: v0.1.16

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.dirname()` возвращает имя каталога для `path`, аналогично команде Unix `dirname`. Завершающие разделители каталогов игнорируются, см.
[`path.sep`](#pathsep).

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Возвращает: '/foo/bar/baz/asdf'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` не строка.

## `path.extname(path)`

<!-- YAML
added: v0.1.25
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Passing a non-string as the `path` argument will throw now.
-->

Добавлено в: v0.1.25

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.extname()` возвращает расширение `path`: от последнего символа `.` до конца строки в последней части пути. Если в последней части `path` нет `.`, либо нет символов `.`, кроме первого символа
basename `path` (см. `path.basename()`), возвращается пустая строка.

```js
path.extname('index.html');
// Возвращает: '.html'

path.extname('index.coffee.md');
// Возвращает: '.md'

path.extname('index.');
// Возвращает: '.'

path.extname('index');
// Возвращает: ''

path.extname('.index');
// Возвращает: ''

path.extname('.index.md');
// Возвращает: '.md'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` не строка.

## `path.format(pathObject)`

<!-- YAML
added: v0.11.15
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44349
    description: The dot will be added if it is not specified in `ext`.
-->

Добавлено в: v0.11.15

* `pathObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любой объект JavaScript со свойствами:
  * `dir` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `root` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `ext` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.format()` собирает строку пути из объекта. Обратная операция к [`path.parse()`](#pathparsepath).

При заполнении `pathObject` помните, что в некоторых сочетаниях одно свойство важнее другого:

* `pathObject.root` игнорируется, если задан `pathObject.dir`
* `pathObject.ext` и `pathObject.name` игнорируются, если есть `pathObject.base`

Например, на POSIX:

```js
// Если заданы `dir`, `root` и `base`,
// вернётся `${dir}${path.sep}${base}`. `root` игнорируется.
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt',
});
// Возвращает: '/home/user/dir/file.txt'

// `root` используется, если `dir` не указан.
// Если задан только `root` или `dir` совпадает с `root`, разделитель платформы не добавляется. `ext` игнорируется.
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored',
});
// Возвращает: '/file.txt'

// Используются `name` + `ext`, если `base` не указан.
path.format({
  root: '/',
  name: 'file',
  ext: '.txt',
});
// Возвращает: '/file.txt'

// Точка будет добавлена, если в `ext` её нет.
path.format({
  root: '/',
  name: 'file',
  ext: 'txt',
});
// Возвращает: '/file.txt'
```

На Windows:

```js
path.format({
  dir: 'C:\\path\\dir',
  base: 'file.txt',
});
// Возвращает: 'C:\\path\\dir\\file.txt'
```

## `path.matchesGlob(path, pattern)`

<!-- YAML
added:
  - v22.5.0
  - v20.17.0
changes:
  - version:
    - v24.8.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59572
    description: Marking the API stable.
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь для сопоставления с шаблоном.
* `pattern` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Glob-шаблон.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Совпадает ли `path` с `pattern`.

Метод `path.matchesGlob()` определяет, соответствует ли `path` шаблону `pattern`.

Например:

```js
path.matchesGlob('/foo/bar', '/foo/*'); // true
path.matchesGlob('/foo/bar*', 'foo/bird'); // false
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` или `pattern` не строки.

## `path.isAbsolute(path)`

<!-- YAML
added: v0.11.2
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `path.isAbsolute()` определяет, является ли строка `path` абсолютным путём в буквальном смысле. Поэтому он не подходит как единственная защита от обхода каталога (path traversal).

Если `path` — пустая строка, возвращается `false`.

Например, на POSIX:

```js
path.isAbsolute('/foo/bar');   // true
path.isAbsolute('/baz/..');    // true
path.isAbsolute('/baz/../..'); // true
path.isAbsolute('qux/');       // false
path.isAbsolute('.');          // false
```

На Windows:

```js
path.isAbsolute('//server');    // true
path.isAbsolute('\\\\server');  // true
path.isAbsolute('C:/foo/..');   // true
path.isAbsolute('C:\\foo\\..'); // true
path.isAbsolute('bar\\baz');    // false
path.isAbsolute('bar/baz');     // false
path.isAbsolute('.');           // false
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` не строка.

## `path.join([...paths])`

<!-- YAML
added: v0.1.16
-->

* `...paths` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Последовательность сегментов пути
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.join()` соединяет все сегменты `path` с разделителем для текущей платформы, затем нормализует результат.

Сегменты нулевой длины пропускаются. Если в результате получилась пустая строка, возвращается `'.'` (текущий рабочий каталог).

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// Возвращает: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// Throws 'TypeError: Path must be a string. Received {}'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если какой-либо сегмент не строка.

## `path.normalize(path)`

<!-- YAML
added: v0.1.23
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.normalize()` нормализует `path`, разрешая сегменты `'..'` и `'.'`.

Если подряд идут несколько разделителей сегментов (например `/` в POSIX и `\` или `/` в Windows), они заменяются одним разделителем для платформы (`/` в POSIX и `\` в Windows). Завершающие разделители сохраняются.

Если `path` — пустая строка, возвращается `'.'` (текущий рабочий каталог).

На POSIX применяемые этой функцией правила нормализации не полностью совпадают со спецификацией POSIX. Например, две начальные косые черты заменяются одной, как у обычного абсолютного пути, тогда как в некоторых системах POSIX путь из ровно двух косых черт имеет особый смысл. Аналогично другие преобразования, например удаление сегментов `..`, могут изменить то, как система разрешает путь.

Например, на POSIX:

```js
path.normalize('/foo/bar//baz/asdf/quux/..');
// Возвращает: '/foo/bar/baz/asdf'
```

На Windows:

```js
path.normalize('C:\\temp\\\\foo\\bar\\..\\');
// Возвращает: 'C:\\temp\\foo\\'
```

Так как в Windows допускается несколько видов разделителей, оба типа заменяются предпочитаемым для Windows (`\`):

```js
path.win32.normalize('C:////temp\\\\/\\/\\/foo/bar');
// Возвращает: 'C:\\temp\\foo\\bar'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` не строка.

## `path.parse(path)`

<!-- YAML
added: v0.11.15
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `path.parse()` возвращает объект, свойства которого соответствуют частям `path`. Завершающие разделители каталогов игнорируются, см. [`path.sep`](#pathsep).

У объекта будут свойства:

* `dir` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `root` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `ext` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Например, на POSIX:

```js
path.parse('/home/user/dir/file.txt');
// Возвращает:
// { root: '/',
//   dir: '/home/user/dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
```

```text
┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
"  /    home/user/dir / file  .txt "
└──────┴──────────────┴──────┴─────┘
(Пробелы в строке "" только для выравнивания, их следует игнорировать.)
```

На Windows:

```js
path.parse('C:\\path\\dir\\file.txt');
// Возвращает:
// { root: 'C:\\',
//   dir: 'C:\\path\\dir',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file' }
```

```text
┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
" C:\      path\dir   \ file  .txt "
└──────┴──────────────┴──────┴─────┘
(Пробелы в строке "" только для выравнивания, их следует игнорировать.)
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `path` не строка.

## `path.posix`

<!-- YAML
added: v0.11.15
changes:
  - version: v15.3.0
    pr-url: https://github.com/nodejs/node/pull/34962
    description: Exposed as `require('path/posix')`.
-->

Добавлено в: v0.11.15

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `path.posix` даёт доступ к реализациям методов `path` в стиле POSIX.

Доступ: `require('node:path').posix` или `require('node:path/posix')`.

## `path.relative(from, to)`

<!-- YAML
added: v0.5.0
changes:
  - version: v6.8.0
    pr-url: https://github.com/nodejs/node/pull/8523
    description: On Windows, the leading slashes for UNC paths are now included
                 in the return value.
-->

Добавлено в: v0.5.0

* `from` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `to` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.relative()` возвращает относительный путь от `from` к `to` относительно текущего рабочего каталога. Если `from` и `to` после `path.resolve()` совпадают, возвращается пустая строка.

Если в качестве `from` или `to` передана пустая строка, вместо неё используется текущий рабочий каталог.

Например, на POSIX:

```js
path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb');
// Возвращает: '../../impl/bbb'
```

На Windows:

```js
path.relative('C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb');
// Возвращает: '..\\..\\impl\\bbb'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если `from` или `to` не строка.

## `path.resolve([...paths])`

<!-- YAML
added: v0.3.4
-->

* `...paths` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Последовательность путей или сегментов
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.resolve()` превращает последовательность путей или сегментов в абсолютный путь.

Последовательность обрабатывается справа налево: каждый следующий `path` добавляется слева, пока не получится абсолютный путь.
Например, для сегментов `/foo`, `/bar`, `baz`
вызов `path.resolve('/foo', '/bar', 'baz')` даст `/bar/baz`,
потому что `baz` не абсолютный, а `'/bar' + '/' + 'baz'` — абсолютный.

Если после обработки всех сегментов абсолютный путь ещё не получен, используется текущий рабочий каталог.

Результат нормализуется; завершающие косые черты убираются, кроме случая, когда путь разрешился в корень.

Сегменты нулевой длины игнорируются.

Если сегменты не переданы, `path.resolve()` возвращает абсолютный путь текущего рабочего каталога.

```js
path.resolve('/foo/bar', './baz');
// Возвращает: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/');
// Возвращает: '/tmp/file'

path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
// Если текущий рабочий каталог /home/myself/node,
// вернёт '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

Выбрасывается [`TypeError`](errors.md#class-typeerror), если какой-либо аргумент не строка.

## `path.sep`

<!-- YAML
added: v0.7.9
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Разделитель сегментов пути для текущей платформы:

* `\` в Windows
* `/` в POSIX

Например, на POSIX:

```js
'foo/bar/baz'.split(path.sep);
// Возвращает: ['foo', 'bar', 'baz']
```

На Windows:

```js
'foo\\bar\\baz'.split(path.sep);
// Возвращает: ['foo', 'bar', 'baz']
```

В Windows и прямой (`/`), и обратный (`\`) слэш считаются разделителями; однако методы `path` при добавлении используют обратную косую (`\`).

## `path.toNamespacedPath(path)`

<!-- YAML
added: v9.0.0
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Только в Windows: возвращает эквивалентный путь с [префиксом пространства имён][namespace-prefixed path] для данного `path`. Если `path` не строка, возвращается без изменений.

Метод имеет смысл только в Windows. В POSIX он фактически ничего не делает и всегда возвращает `path` без изменений.

## `path.win32`

<!-- YAML
added: v0.11.15
changes:
  - version: v15.3.0
    pr-url: https://github.com/nodejs/node/pull/34962
    description: Exposed as `require('path/win32')`.
-->

Добавлено в: v0.11.15

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `path.win32` даёт доступ к реализациям методов `path` для Windows.

Доступ: `require('node:path').win32` или `require('node:path/win32')`.

[MSDN-Rel-Path]: https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#fully-qualified-vs-relative-paths
[`TypeError`]: errors.md#class-typeerror
[`path.parse()`]: #pathparsepath
[`path.posix`]: #pathposix
[`path.sep`]: #pathsep
[`path.win32`]: #pathwin32
[namespace-prefixed path]: https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#namespaces
