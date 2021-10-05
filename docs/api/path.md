# Модуль path

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/path.js -->

В `path` Модуль предоставляет утилиты для работы с путями к файлам и каталогам. Доступ к нему можно получить, используя:

```js
const path = require('path');
```

## Windows против POSIX

Работа по умолчанию `path` Модуль зависит от операционной системы, в которой запущено приложение Node.js. В частности, при работе в операционной системе Windows `path` модуль будет предполагать, что используются пути в стиле Windows.

Итак, используя `path.basename()` может дать разные результаты в POSIX и Windows:

В POSIX:

```js
path.basename('C:\\temp\\myfile.html');
// Returns: 'C:\\temp\\myfile.html'
```

В Windows:

```js
path.basename('C:\\temp\\myfile.html');
// Returns: 'myfile.html'
```

Чтобы добиться согласованных результатов при работе с путями к файлам Windows в любой операционной системе, используйте [`path.win32`](#pathwin32):

В POSIX и Windows:

```js
path.win32.basename('C:\\temp\\myfile.html');
// Returns: 'myfile.html'
```

Чтобы добиться согласованных результатов при работе с путями к файлам POSIX в любой операционной системе, используйте [`path.posix`](#pathposix):

В POSIX и Windows:

```js
path.posix.basename('/tmp/myfile.html');
// Returns: 'myfile.html'
```

В Windows Node.js следует концепции рабочего каталога для каждого диска. Такое поведение наблюдается при использовании пути к диску без обратной косой черты. Например, `path.resolve('C:\\')` потенциально может вернуть другой результат, чем `path.resolve('C:')`. Для получения дополнительной информации см. [эта страница MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#fully-qualified-vs-relative-paths).

## `path.basename(path[, ext])`

<!-- YAML
added: v0.1.25
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Passing a non-string as the `path` argument will throw now.
-->

- `path` {нить}
- `ext` {строка} Необязательное расширение файла
- Возвращает: {строка}

В `path.basename()` метод возвращает последнюю часть `path`, аналогично Unix `basename` команда. Конечные разделители каталогов игнорируются, см. [`path.sep`](#pathsep).

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Returns: 'quux'
```

Хотя Windows обычно обрабатывает имена файлов, включая расширения файлов, без учета регистра, эта функция этого не делает. Например, `C:\\foo.html` а также `C:\\foo.HTML` относятся к тому же файлу, но `basename` обрабатывает расширение как строку с учетом регистра:

```js
path.win32.basename('C:\\foo.html', '.html');
// Returns: 'foo'

path.win32.basename('C:\\foo.HTML', '.html');
// Returns: 'foo.HTML'
```

А [`TypeError`](errors.md#class-typeerror) бросается, если `path` не является строкой или если `ext` дается и не является строкой.

## `path.delimiter`

<!-- YAML
added: v0.9.3
-->

- {нить}

Предоставляет разделитель пути для конкретной платформы:

- `;` для Windows
- `:` для POSIX

Например, в POSIX:

```js
console.log(process.env.PATH);
// Prints: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// Returns: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

В Windows:

```js
console.log(process.env.PATH);
// Prints: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// Returns ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

## `path.dirname(path)`

<!-- YAML
added: v0.1.16
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Passing a non-string as the `path` argument will throw now.
-->

- `path` {нить}
- Возвращает: {строка}

В `path.dirname()` метод возвращает имя каталога `path`, аналогично Unix `dirname` команда. Конечные разделители каталогов игнорируются, см. [`path.sep`](#pathsep).

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Returns: '/foo/bar/baz/asdf'
```

А [`TypeError`](errors.md#class-typeerror) бросается, если `path` не строка.

## `path.extname(path)`

<!-- YAML
added: v0.1.25
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5348
    description: Passing a non-string as the `path` argument will throw now.
-->

- `path` {нить}
- Возвращает: {строка}

В `path.extname()` метод возвращает расширение `path`, от последнего появления `.` (точка) до конца строки в последней части `path`. Если нет `.` в последней части `path`, или если нет `.` символы кроме первого символа базового имени `path` (видеть `path.basename()`) возвращается пустая строка.

```js
path.extname('index.html');
// Returns: '.html'

path.extname('index.coffee.md');
// Returns: '.md'

path.extname('index.');
// Returns: '.'

path.extname('index');
// Returns: ''

path.extname('.index');
// Returns: ''

path.extname('.index.md');
// Returns: '.md'
```

А [`TypeError`](errors.md#class-typeerror) бросается, если `path` не строка.

## `path.format(pathObject)`

<!-- YAML
added: v0.11.15
-->

- `pathObject` {Object} Любой объект JavaScript, имеющий следующие свойства:
  - `dir` {нить}
  - `root` {нить}
  - `base` {нить}
  - `name` {нить}
  - `ext` {нить}
- Возвращает: {строка}

В `path.format()` Метод возвращает строку пути от объекта. Это противоположность [`path.parse()`](#pathparsepath).

При предоставлении свойств `pathObject` помните, что есть комбинации, в которых одно свойство имеет приоритет над другим:

- `pathObject.root` игнорируется, если `pathObject.dir` предоставлен
- `pathObject.ext` а также `pathObject.name` игнорируются, если `pathObject.base` существуют

Например, в POSIX:

```js
// If `dir`, `root` and `base` are provided,
// `${dir}${path.sep}${base}`
// will be returned. `root` is ignored.
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt',
});
// Returns: '/home/user/dir/file.txt'

// `root` will be used if `dir` is not specified.
// If only `root` is provided or `dir` is equal to `root` then the
// platform separator will not be included. `ext` will be ignored.
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored',
});
// Returns: '/file.txt'

// `name` + `ext` will be used if `base` is not specified.
path.format({
  root: '/',
  name: 'file',
  ext: '.txt',
});
// Returns: '/file.txt'
```

В Windows:

```js
path.format({
  dir: 'C:\\path\\dir',
  base: 'file.txt',
});
// Returns: 'C:\\path\\dir\\file.txt'
```

## `path.isAbsolute(path)`

<!-- YAML
added: v0.11.2
-->

- `path` {нить}
- Возвращает: {логическое}

В `path.isAbsolute()` метод определяет, если `path` это абсолютный путь.

Если данный `path` строка нулевой длины, `false` будет возвращен.

Например, в POSIX:

```js
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('/baz/..'); // true
path.isAbsolute('qux/'); // false
path.isAbsolute('.'); // false
```

В Windows:

```js
path.isAbsolute('//server'); // true
path.isAbsolute('\\\\server'); // true
path.isAbsolute('C:/foo/..'); // true
path.isAbsolute('C:\\foo\\..'); // true
path.isAbsolute('bar\\baz'); // false
path.isAbsolute('bar/baz'); // false
path.isAbsolute('.'); // false
```

А [`TypeError`](errors.md#class-typeerror) бросается, если `path` не строка.

## `path.join([...paths])`

<!-- YAML
added: v0.1.16
-->

- `...paths` {string} Последовательность сегментов пути
- Возвращает: {строка}

В `path.join()` метод объединяет все данные `path` сегменты вместе с использованием разделителя для конкретной платформы в качестве разделителя, а затем нормализует полученный путь.

Нулевой длины `path` сегменты игнорируются. Если объединенная строка пути является строкой нулевой длины, тогда `'.'` будет возвращен, представляя текущий рабочий каталог.

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// Returns: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// Throws 'TypeError: Path must be a string. Received {}'
```

А [`TypeError`](errors.md#class-typeerror) выбрасывается, если какой-либо из сегментов пути не является строкой.

## `path.normalize(path)`

<!-- YAML
added: v0.1.23
-->

- `path` {нить}
- Возвращает: {строка}

В `path.normalize()` метод нормализует данный `path`, разрешение `'..'` а также `'.'` сегменты.

При обнаружении нескольких последовательных символов разделения сегментов пути (например, `/` на POSIX и либо `\` или `/` в Windows) они заменяются одним экземпляром разделителя сегментов пути, зависящего от платформы (`/` на POSIX и `\` в Windows). Конечные разделители сохранены.

Если `path` строка нулевой длины, `'.'` возвращается, представляя текущий рабочий каталог.

Например, в POSIX:

```js
path.normalize('/foo/bar//baz/asdf/quux/..');
// Returns: '/foo/bar/baz/asdf'
```

В Windows:

```js
path.normalize('C:\\temp\\\\foo\\bar\\..\\');
// Returns: 'C:\\temp\\foo\\'
```

Поскольку Windows распознает несколько разделителей путей, оба разделителя будут заменены экземплярами предпочтительного разделителя Windows (`\`):

```js
path.win32.normalize('C:////temp\\\\/\\/\\/foo/bar');
// Returns: 'C:\\temp\\foo\\bar'
```

А [`TypeError`](errors.md#class-typeerror) бросается, если `path` не строка.

## `path.parse(path)`

<!-- YAML
added: v0.11.15
-->

- `path` {нить}
- Возвращает: {Object}

В `path.parse()` метод возвращает объект, свойства которого представляют собой важные элементы `path`. Конечные разделители каталогов игнорируются, см. [`path.sep`](#pathsep).

Возвращенный объект будет иметь следующие свойства:

- `dir` {нить}
- `root` {нить}
- `base` {нить}
- `name` {нить}
- `ext` {нить}

Например, в POSIX:

```js
path.parse('/home/user/dir/file.txt');
// Returns:
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
(All spaces in the "" line should be ignored. They are purely for formatting.)
```

В Windows:

```js
path.parse('C:\\path\\dir\\file.txt');
// Returns:
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
(All spaces in the "" line should be ignored. They are purely for formatting.)
```

А [`TypeError`](errors.md#class-typeerror) бросается, если `path` не строка.

## `path.posix`

<!-- YAML
added: v0.11.15
changes:
  - version: v15.3.0
    pr-url: https://github.com/nodejs/node/pull/34962
    description: Exposed as `require('path/posix')`.
-->

- {Объект}

В `path.posix` свойство обеспечивает доступ к специфическим реализациям POSIX `path` методы.

API доступен через `require('path').posix` или `require('path/posix')`.

## `path.relative(from, to)`

<!-- YAML
added: v0.5.0
changes:
  - version: v6.8.0
    pr-url: https://github.com/nodejs/node/pull/8523
    description: On Windows, the leading slashes for UNC paths are now included
                 in the return value.
-->

- `from` {нить}
- `to` {нить}
- Возвращает: {строка}

В `path.relative()` метод возвращает относительный путь от `from` к `to` на основе текущего рабочего каталога. Если `from` а также `to` каждый разрешает один и тот же путь (после вызова `path.resolve()` на каждом) возвращается строка нулевой длины.

Если строка нулевой длины передается как `from` или `to`, текущий рабочий каталог будет использоваться вместо строк нулевой длины.

Например, в POSIX:

```js
path.relative(
  '/data/orandea/test/aaa',
  '/data/orandea/impl/bbb'
);
// Returns: '../../impl/bbb'
```

В Windows:

```js
path.relative(
  'C:\\orandea\\test\\aaa',
  'C:\\orandea\\impl\\bbb'
);
// Returns: '..\\..\\impl\\bbb'
```

А [`TypeError`](errors.md#class-typeerror) выбрасывается, если `from` или `to` не строка.

## `path.resolve([...paths])`

<!-- YAML
added: v0.3.4
-->

- `...paths` {string} Последовательность путей или сегментов пути
- Возвращает: {строка}

В `path.resolve()` преобразует последовательность путей или сегментов пути в абсолютный путь.

Заданная последовательность путей обрабатывается справа налево, с каждым последующим `path` добавляется до тех пор, пока не будет построен абсолютный путь. Например, учитывая последовательность сегментов пути: `/foo`, `/bar`, `baz`, звоню `path.resolve('/foo', '/bar', 'baz')` вернется `/bar/baz` потому что `'baz'` это не абсолютный путь, но `'/bar' + '/' + 'baz'` является.

Если после обработки все дано `path` сегменты, абсолютный путь еще не сформирован, используется текущий рабочий каталог.

Результирующий путь нормализуется, а завершающие косые черты удаляются, если путь не разрешен до корневого каталога.

Нулевой длины `path` сегменты игнорируются.

Если нет `path` сегменты пройдены, `path.resolve()` вернет абсолютный путь к текущему рабочему каталогу.

```js
path.resolve('/foo/bar', './baz');
// Returns: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/');
// Returns: '/tmp/file'

path.resolve(
  'wwwroot',
  'static_files/png/',
  '../gif/image.gif'
);
// If the current working directory is /home/myself/node,
// this returns '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

А [`TypeError`](errors.md#class-typeerror) выбрасывается, если какой-либо из аргументов не является строкой.

## `path.sep`

<!-- YAML
added: v0.7.9
-->

- {нить}

Предоставляет разделитель сегментов пути, зависящий от платформы:

- `\` в Windows
- `/` в POSIX

Например, в POSIX:

```js
'foo/bar/baz'.split(path.sep);
// Returns: ['foo', 'bar', 'baz']
```

В Windows:

```js
'foo\\bar\\baz'.split(path.sep);
// Returns: ['foo', 'bar', 'baz']
```

В Windows обе косые черты (`/`) и обратная косая черта (`\`) принимаются как разделители отрезков пути; Однако `path` методы только добавляют обратную косую черту (`\`).

## `path.toNamespacedPath(path)`

<!-- YAML
added: v9.0.0
-->

- `path` {нить}
- Возвращает: {строка}

Только в системах Windows возвращает эквивалент [путь с префиксом пространства имен](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#namespaces) для данного `path`. Если `path` не строка, `path` будет возвращен без изменений.

Этот метод имеет смысл только в системах Windows. В системах POSIX метод не работает и всегда возвращает `path` без доработок.

## `path.win32`

<!-- YAML
added: v0.11.15
changes:
  - version: v15.3.0
    pr-url: https://github.com/nodejs/node/pull/34962
    description: Exposed as `require('path/win32')`.
-->

- {Объект}

В `path.win32` свойство обеспечивает доступ к специфичным для Windows реализациям `path` методы.

API доступен через `require('path').win32` или `require('path/win32')`.
