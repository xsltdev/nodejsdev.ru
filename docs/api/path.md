# Path

!!!success "Стабильность: 2 – Стабильная версия"

Модуль `path` предоставляет утилиты для работы с путями к файлам и директориям. К нему можно получить доступ таким образом:

```js
const path = require('path');
```

## Windows vs POSIX

По умолчанию операции модуля `path` варьируются в зависимости от операционной системы, на которой запущено приложение Node.js. Конкретнее, при запуске на Windows модуль `path` будет подразумевать использование Windows-путей.

Например, использование функции `path.basename()` с путем к файлу `C:\temp\myfile.html`, характерным для Windows, будет давать разные результаты при запуске на POSIX и на Windows:

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

Для получения совместимых результатов при работе с файловыми путями Windows на любой другой операционной системе, нужно использовать `path.win32`:

На POSIX и Windows:

```js
path.win32.basename('C:\\temp\\myfile.html');
// Возвращает: 'myfile.html'
```

Для получения совместимых результатов при работе с файловыми путями POSIX на любой другой операционной системе, нужно использовать `path.posix`:

На POSIX и Windows:

```js
path.posix.basename('/tmp/myfile.html');
// Возвращает: 'myfile.html'
```

## path.basename()

```
path.basename(path[, ext])
```

- `path` `<Строка>`
- `ext` `<Строка>` Опциональное файловое расширение

Возвращает строку

Метод `path.basename()` возвращает последнюю порцию путей, подобно команде `basename` на Linux.

Пример:

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// Возвращает: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Возвращает: 'quux'
```

Может выпадать ошибка `TypeError` если `path` не является строкой или если задается параметр `ext`, и он не является строкой.

## path.delimiter

- `<Строка>`

Предоставляет разделитель пути для конкретной платформы:

- `;` для Windows
- `:` для POSIX

Например, на POSIX:

```js
console.log(process.env.PATH);
// Выводит на экран: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// Возвращает: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

На Windows:

```js
console.log(process.env.PATH);
// Выводит на экран: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// Возвращает: ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

## path.dirname()

```
path.dirname(path)
```

- `path` `<Строка>`

Возвращает строку

Метод `path.dirname()` возвращает имя директории `path`, подобно команде `dirname` на Linux.

Пример:

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Возвращает: '/foo/bar/baz/asdf'
```

Может выпадать ошибка `TypeError` если `path` не является строкой.

## path.extname()

```
path.extname(path)
```

- `path` `<Строка>`

Возвращает строку

Метод `path.extname()` возвращает расширение для `path`, стоящее после последней точки `.`, которая означает конец строки в окончании пути. Если точки нет в конце пути или если первый символ базового имени `path` (см. `path.basename()`) является точкой, то возвращается пустая строка.

Пример:

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
```

Выпадает ошибка `TypeError` если `path` не является строкой.

## path.format()

```
path.format(pathObject)
```

- `pathObject` `<Объект>`
  : - `dir` `<Строка>`
  : - `root` `<Строка>`
  : - `base` `<Строка>`
  : - `name` `<Строка>`
  : - `ext`

Возвращает строку

Метод `path.format()` возвращает строку с путем из объекта. Работает в противоположность `path.parse()`.

При задании свойств `pathObjects`, следует помнить, что есть такие комбинации, в которых одно свойство имеет приоритет над другим:

- `pathObject.root` игнорируется, если есть `pathObject.dir`
- `pathObject.ext` и `pathObject.name` игнорируются, если существует `pathObject.base`

Пример для POSIX:

```js
// If `dir`, `root` and `base` are provided,
// `${dir}${path.sep}${base}`
//возвращается. `root` игнорируется.
path.format({
  root: '/ignored',
  dir: '/home/user/dir',
  base: 'file.txt'
});
// Возвращает: '/home/user/dir/file.txt'

// `root` will be used if `dir` is not specified.
// Только если предоставлен `root`  или `dir` равнозначно `root`,
// платформенный разделитель не добавляется. `ext` игнорируется.
path.format({
  root: '/',
  base: 'file.txt',
  ext: 'ignored'
});
// Возвращает: '/file.txt'

// `name` + `ext` используются, если `base` не задано.
path.format({
  root: '/',
  name: 'file',
  ext: '.txt'
});
// Возвращает: '/file.txt'

На Windows:
path.format({
  dir : "C:\\path\\dir",
  base : "file.txt"
});
// Возвращает: 'C:\\path\\dir\\file.txt'
```

## path.isAbsolute()

```
path.isAbsolute(path)
```

- `path` `<Строка>`

Возвращает строку

Метод `path.isAbsolute()` определяет, является ли `path` абсолютным путем.

Если заданный путь `path` является строкой с нулевой длиной, возвращается `false`.

Пример для POSIX:

```js
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('/baz/..'); // true
path.isAbsolute('qux/'); // false
path.isAbsolute('.'); // false
```

Для Windows:

```js
path.isAbsolute('//server'); // true
path.isAbsolute('\\\\server'); // true
path.isAbsolute('C:/foo/..'); // true
path.isAbsolute('C:\\foo\\..'); // true
path.isAbsolute('bar\\baz'); // false
path.isAbsolute('bar/baz'); // false
path.isAbsolute('.'); // false
```

Выпадает ошибка `TypeError`, если `path` не является строкой.

## path.join()

```
path.join([...paths])
```

- `...paths` `<Строка>` Последовательность сегментов пути

Возвращает строку

Метод `path.join()` объединяет все данные сегменты пути вместе, используя для этого заданный платформенный разделитель, и приводит полученный путь к нормальному виду.

Нулевой сегмент `path` игнорируется. Если в результате объединения путей получилась строка с нулевой длиной, тогда возвращается `.`, представляя собой текущую рабочую директорию.

Пример:

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '..');
// Возвращает: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// Выдает TypeError: Arguments to path.join must be strings
```

Выпадает ошибка `TypeError`, если любой из сегментов `path` не является строкой.

## path.normalize()

```
path.normalize(path)
```

- `path` `<Строка>`

Возвращает строку

Метод `path.normalize()` нормализует данный путь, распределяя сегменты `..` и `.`

При наличии разделяющих символов для множественных последовательных сегментов пути (`/` на POSIX и `\` на Windows), они заменяются единственным экземпляром заданного платформой разделителя пути. При этом завершающие разделители сохраняются.

Если путь является строкой с нулевой длиной, возвращается `.`, представляя собой текущую рабочую директорию.

Пример для POSIX:

```js
path.normalize('/foo/bar//baz/asdf/quux/..');
// Возвращает: '/foo/bar/baz/asdf'
```

Для Windows:

```js
path.normalize('C:\\temp\\\\foo\\bar\\..\\');
// Возвращает: 'C:\\temp\\foo\\'
```

Выпадает ошибка `TypeError`, если `path` не является строкой.

## path.parse(path)

```
path.parse(path)
```

- `path` `<Строка>`

Возвращает объект

Метод `path.parse()` возвращает объект, чьи свойства представляют собой важные элементы пути.

Возвращаемый объект будет иметь такие свойства:

- `root` `<Строка>`
- `dir` `<Строка>`
- `base` `<Строка>`
- `ext` `<Строка>`
- `name` `<Строка>`

Например, на POSIX:

```js
path.parse('/home/user/dir/file.txt')
// Возвращает:
// {
//    root : "/",
//    dir : "/home/user/dir",
//    base : "file.txt",
//    ext : ".txt",
//    name : "file"
// }

┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
"  /    home/user/dir / file  .txt "
└──────┴──────────────┴──────┴─────┘
(все пробелы в "" строке должны игнорироваться – они нужны исключительно для форматирования)
```

На Windows:

```js
path.parse('C:\\path\\dir\\file.txt')
// Возвращает:
// {
//    root : "C:\\",
//    dir : "C:\\path\\dir",
//    base : "file.txt",
//    ext : ".txt",
//    name : "file"
// }

┌─────────────────────┬────────────┐
│          dir        │    base    │
├──────┬              ├──────┬─────┤
│ root │              │ name │ ext │
" C:\      path\dir   \ file  .txt "
└──────┴──────────────┴──────┴─────┘
(все пробелы в "" строке должны игнорироваться – они нужны исключительно для форматирования)
```

Выпадает ошибка `TypeError`, если `path` не является строкой.

## path.posix

`<Объект>`

Свойство `path.posix` предоставляет доступ к заданным реализациям методов `path` на POSIX.

## path.relative()

```
path.relative(from, to)
```

- `from` `<Строка>`
- `to` `<Строка>`

Возвращает строку

Метод `path.relative(from, to)` возвращает приблизительный путь из `from` в `to`. Если `from` и `to` приводят к одному и тому же пути (после вызова `path.resolve()` для обоих), возвращается строка с нулевой длиной.

Если в качестве `from` или `to` передается строка с нулевой длиной, вместо таких строк будет использоваться текущая рабочая директория.

Пример для POSIX:

```js
path.relative(
  '/data/orandea/test/aaa',
  '/data/orandea/impl/bbb'
);
// Возвращает: '../../impl/bbb'
```

Для Windows:

```js
path.relative(
  'C:\\orandea\\test\\aaa',
  'C:\\orandea\\impl\\bbb'
);
// Возвращает: '..\\..\\impl\\bbb'
```

Выпадает ошибка `TypeError`, если ни `from`, ни `to` не являются строками.

## path.resolve()

```
path.resolve([...paths])
```

- `...paths` `<Строка>` Последовательность сегментов пути

Возвращает строку

Метод `path.resolve()` превращает последовательность путей или сегментов пути в абсолютный путь.

Данная последовательность путей обрабатывается справа налево, добавляя префикс к каждому последующему пути перед компоновкой абсолютного пути. Например, задана последовательность сегментов пути: `/foo`, `/bar`, `/baz`, вызов `path.resolve('/foo', '/bar', 'baz')` возвратит `/bar/baz`.

Если после обработки все данные сегменты абсолютного пути не были сгенерированы, используется текущая рабочая директория.

Путь, полученный в результате, нормализуется и слэши, завершающие его, удаляются, но только если путь не был превращен в путь к корневой директории.

Сегменты нулевого пути игнорируются.

Если не передается сегментов пути, `path.resolve()` возвращает абсолютный путь к текущей рабочей директории.

Например:

```js
path.resolve('/foo/bar', './baz');
// Возвращает: '/foo/bar/baz'

path.resolve('/foo/bar', '/tmp/file/');
// Возвращает: '/tmp/file'

path.resolve(
  'wwwroot',
  'static_files/png/',
  '../gif/image.gif'
);
// если текущая рабочая директория /home/myself/node,
// Возвращает '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

Выпадает ошибка `TypeError`, если любой из аргументов не является строкой.

## path.sep

- `<Строка>`

Предоставляет заданный платформой разделитель сегментов пути:

- `\` на Windows
- `/` на POSIX

на POSIX:

```js
'foo/bar/baz'.split(path.sep);
// Возвращает: ['foo', 'bar', 'baz']
```

На Windows:

```js
'foo\\bar\\baz'.split(path.sep);
// Возвращает: ['foo', 'bar', 'baz']
```

## path.win32

- `<Объект>`

Свойство `path.win32` предоставляет доступ к заданным реализациям методов `path` на Windows.

!!!note "Примечание"

    На Windows оба слэша – прямой (`/`) и обратный (`\`) принимаются как разделители пути, однако, в возвращаемых значениях используется только обратный слэш.
