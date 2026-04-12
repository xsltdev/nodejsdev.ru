---
description: Модуль path предоставляет утилиты для работы с путями к файлам и каталогам
---

# Path

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/path.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:path`** предоставляет утилиты для работы с путями к файлам и каталогам. Доступ к нему можно получить с помощью:

```js
const path = require('node:path');
```

<!-- 0000.part.md -->

## Windows против POSIX

Работа модуля `node:path` по умолчанию зависит от операционной системы, на которой запущено приложение Node.js. В частности, при работе в операционной системе Windows модуль `node:path` будет считать, что используются пути в стиле Windows.

Поэтому использование `path.basename()` может дать разные результаты на POSIX и Windows:

На POSIX:

```js
path.basename('C:\\temp\\myfile.html');
// Возвращает: 'C:\temp\myfile.html'
```

В Windows:

```js
path.basename('C:\\temp\\myfile.html');
// Возвращает: 'myfile.html'
```

Для достижения последовательных результатов при работе с путями к файлам Windows в любой операционной системе используйте [`path.win32`](#pathwin32):

В POSIX и Windows:

```js
path.win32.basename('C:\\temp\\myfile.html');
// Возвращает: 'myfile.html'
```

Для достижения согласованных результатов при работе с путями к файлам POSIX в любой операционной системе используйте [`path.posix`](#pathposix):

В POSIX и Windows:

```js
path.posix.basename('/tmp/myfile.html');
// Возвращает: 'myfile.html'
```

В Windows Node.js следует концепции рабочего каталога на каждом диске. Такое поведение можно наблюдать при использовании пути к диску без обратной косой черты. Например, `path.resolve('C:\')` потенциально может вернуть другой результат, чем `path.resolve('C:')`. Для получения дополнительной информации смотрите [эту страницу MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#fully-qualified-vs-relative-paths).

<!-- 0001.part.md -->

## `path.basename(path[, suffix])`

-   `путь` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `suffix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательный суффикс для удаления
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.basename()` возвращает последнюю часть `path`, аналогично команде Unix `basename`. Заглавные [разделители каталогов](#pathsep) игнорируются.

```js
path.basename('/foo/bar/baz/asdf/quux.html');
// Возвращает: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Возвращает: 'quux'
```

Хотя Windows обычно обрабатывает имена файлов, включая расширения файлов, без учета регистра, эта функция этого не делает. Например, `C:\foo.html` и `C:\foo.HTML` ссылаются на один и тот же файл, но `basename` рассматривает расширение как строку, чувствительную к регистру:

```js
path.win32.basename('C:\foo.html', '.html');
// Возвращает: 'foo'

path.win32.basename('C:\foo.HTML', '.html');
// Возвращает: 'foo.HTML'
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `path` не является строкой или если указан `suffix, который не является строкой.

<!-- 0002.part.md -->

## `path.delimiter`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Предоставляет специфический для платформы разделитель путей:

-   `;` для Windows
-   `:` для POSIX

Например, на POSIX:

```js
console.log(process.env.PATH);
// Печатает: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// Возвращает: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

В Windows:

```js
console.log(process.env.PATH);
// Печатает: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// Возвращает ['C:\Windows\system32', 'C:\Windows', 'C:\Program Files\node\']
```

<!-- 0003.part.md -->

## `path.dirname(path)`

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.dirname()` возвращает имя каталога `пути`, аналогично команде Unix `dirname`. Заглавные разделители каталогов игнорируются, см. [`path.sep`](#pathsep).

```js
path.dirname('/foo/bar/baz/asdf/quux');
// Возвращает: '/foo/bar/baz/asdf'
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `path` не является строкой.

<!-- 0004.part.md -->

## `path.extname(path)`

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.extname()` возвращает расширение `пути`, начиная с последнего появления символа `.` (точка) до конца строки в последней части `пути`. Если в последней части `path` нет символа `.`, или если нет символов `.`, кроме первого символа основного имени `path` (см. `path.basename()`), возвращается пустая строка.

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

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `path` не является строкой.

<!-- 0005.part.md -->

## `path.format(pathObject)`

-   `pathObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любой объект JavaScript, имеющий следующие свойства:
    -   `dir` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `root` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `ext` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.format()` возвращает строку пути из объекта. Это противоположность [`path.parse()`](#pathparsepath).

При задании свойств для `pathObject` помните, что существуют комбинации, в которых одно свойство имеет приоритет над другим:

-   `pathObject.root` игнорируется, если указано `pathObject.dir`.
-   `pathObject.ext` и `pathObject.name` игнорируются, если существует `pathObject.base`.

Например, на POSIX:

```js
// Если указаны `dir`, `root` и `base`,
// `${dir}${path.sep}${base}`
// будет возвращен. `root` игнорируется.
path.format({
    root: '/ignored',
    dir: '/home/user/dir',
    base: 'file.txt',
});
// Возвращает: '/home/user/dir/file.txt'

// `root` будет использоваться, если `dir` не указан.
// Если указан только `root` или `dir` равен `root`, то разделитель платформы не будет включен.
// платформенный разделитель не будет включен. `ext` будет проигнорирован.
path.format({
    root: '/',
    base: 'file.txt',
    ext: 'ignored',
});
// Возвращает: '/file.txt'

// `name` + `ext` будут использованы, если `base` не указан.
path.format({
    root: '/',
    name: 'file',
    ext: '.txt',
});
// Возвращает: '/file.txt'

// Точка будет добавлена, если она не указана в `ext`.
path.format({
    root: '/',
    name: 'file',
    ext: 'txt',
});
// Возвращает: '/file.txt'
```

В Windows:

```js
path.format({
    dir: 'C:pathdir',
    base: 'file.txt',
});
// Возвращает: 'C:\path\dir\file.txt'
```

<!-- 0006.part.md -->

## `path.isAbsolute(path)`

-   `путь` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Метод `path.isAbsolute()` определяет, является ли `path` абсолютным путем.

Если заданный `path` является строкой нулевой длины, будет возвращена `false`.

Например, на POSIX:

```js
path.isAbsolute('/foo/bar'); // true
path.isAbsolute('/baz/...'); // true
path.isAbsolute('qux/'); // false
path.isAbsolute('.'); // false
```

В Windows:

```js
path.isAbsolute('//server'); // true
path.isAbsolute('\\server'); // true
path.isAbsolute('C:/foo/...'); // true
path.isAbsolute('C:\foo...'); // true
path.isAbsolute('bar\baz'); // false
path.isAbsolute('bar/baz'); // false
path.isAbsolute('.'); // false
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `path` не является строкой.

<!-- 0007.part.md -->

## `path.join([...paths])`

-   `...paths` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Последовательность сегментов пути
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.join()` объединяет все заданные сегменты `пути` вместе, используя в качестве разделителя специфический для платформы разделитель, а затем нормализует полученный путь.

Сегменты `пути` нулевой длины игнорируются. Если объединенная строка пути является строкой нулевой длины, то будет возвращена `.'`, представляющая текущий рабочий каталог.

```js
path.join('/foo', 'bar', 'baz/asdf', 'quux', '.');
// Возвращает: '/foo/bar/baz/asdf'

path.join('foo', {}, 'bar');
// Выбрасывает 'TypeError: Path must be a string. Received {}'
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если любой из сегментов пути не является строкой.

<!-- 0008.part.md -->

## `path.normalize(path)`

-   `путь` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.normalize()` нормализует заданный `путь`, разрешая сегменты `...` и `...`.

Если найдено несколько последовательных символов разделения сегментов пути (например, `/` на POSIX и `\` или `/` на Windows), они заменяются одним экземпляром специфического для платформы разделителя сегментов пути (`/` на POSIX и `\` на Windows). Последующие разделители сохраняются.

Если `path` является строкой нулевой длины, возвращается `'.'`, представляющий текущий рабочий каталог.

Например, на POSIX:

```js
path.normalize('/foo/bar//baz/asdf/quux/...');
// Возвращает: '/foo/bar/baz/asdf'
```

В Windows:

```js
path.normalize('C:\temp\\foo\bar\..\');
// Возвращает: 'C:\temp\foo\'
```

Поскольку Windows распознает несколько разделителей путей, оба разделителя будут заменены экземплярами предпочитаемого Windows разделителя (`\`):

```js
path.win32.normalize('C:////temp\\////foo/bar');
// Возвращает: 'C:\temp\foo\bar'
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `path` не является строкой.

<!-- 0009.part.md -->

## `path.parse(path)`

-   `путь` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `path.parse()` возвращает объект, свойства которого представляют значимые элементы `пути`. Заглавные разделители каталогов игнорируются, см. [`path.sep`](#pathsep).

Возвращаемый объект будет иметь следующие свойства:

-   `dir` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `root` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `база` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `ext` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Например, на POSIX:

```js
path.parse('/home/user/dir/file.txt');
// Возвращает:
// { root: '/',
// dir: '/home/user/dir',
// base: 'file.txt',
// ext: '.txt',
// name: 'file' }
```

```текст
┌─────────────────────┬────────────┐
│ dir │ base │
├──────┬ ├──────┬─────┤
│ root │ │ name │ ext │
"  / home/user/dir / file .txt "
└──────┴──────────────┴──────┴─────┘
(Все пробелы в строке "" следует игнорировать. Они предназначены исключительно для форматирования).
```

В Windows:

```js
path.parse('C:\\path\\dir\\file.txt');
// Возвращает:
// { root: 'C:\',
// dir: 'C:\path\dir',
// base: 'file.txt',
// ext: '.txt',
// name: 'file' }
```

```
┌─────────────────────┬────────────┐
│ dir │ base │
├──────┬ ├──────┬─────┤
│ root │ │ name │ ext │
" C:\ путь\dir \ файл .txt "
└──────┴──────────────┴──────┴─────┘
(Все пробелы в строке "" следует игнорировать. Они предназначены исключительно для форматирования).
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `path` не является строкой.

<!-- 0010.part.md -->

## `path.posix`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `path.posix` предоставляет доступ к POSIX-специфическим реализациям методов `path`.

API доступен через `require('node:path').posix` или `require('node:path/posix')`.

<!-- 0011.part.md -->

## `path.relative(from, to)`

-   `from` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `to` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.relative()` возвращает относительный путь от `from` к `to` на основе текущего рабочего каталога. Если `from` и `to` разрешаются в один и тот же путь (после вызова `path.resolve()` для каждого), возвращается строка нулевой длины.

Если в качестве `from` или `to` передана строка нулевой длины, то вместо строк нулевой длины будет использоваться текущий рабочий каталог.

Например, на POSIX:

```js
path.relative(
    '/data/orandea/test/aaa',
    '/data/orandea/impl/bbb'
);
// Возвращает: '../../impl/bbb'
```

В Windows:

```js
path.relative('C:orandea\testaaa', 'C:orandeaimpl\bb');
// Возвращает: '..\.\.\impl\bbb'
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если `from` или `to` не является строкой.

<!-- 0012.part.md -->

## `path.resolve([...paths])`

-   `...paths` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Последовательность путей или сегментов путей
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `path.resolve()` преобразует последовательность путей или сегментов путей в абсолютный путь.

Заданная последовательность путей обрабатывается справа налево, с добавлением каждого последующего `path`, пока не будет построен абсолютный путь. Например, если задана последовательность сегментов пути: `/foo`, `/bar`, `baz`, вызов `path.resolve('/foo', '/bar', 'baz')` вернет `/bar/baz`, потому что `'baz'` не является абсолютным путем, а `'/bar' + '/' + 'baz'` является.

Если после обработки всех заданных сегментов `path` абсолютный путь еще не сгенерирован, то используется текущий рабочий каталог.

Результирующий путь нормализуется и удаляются косые черты, если только путь не разрешается в корневой каталог.

Сегменты `пути` нулевой длины игнорируются.

Если сегменты `path` не переданы, `path.resolve()` вернет абсолютный путь к текущему рабочему каталогу.

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
// Если текущий рабочий каталог - /home/myself/node,
// это возвращает '/home/myself/node/wwwroot/static_files/gif/image.gif'
```

Ошибка [`TypeError`](errors.md#class-typeerror) возникает, если любой из аргументов не является строкой.

<!-- 0013.part.md -->

## `path.sep`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Предоставляет специфический для платформы разделитель сегментов пути:

-   `\` в Windows
-   `/` на POSIX

Например, на POSIX:

```js
'foo/bar/baz'.split(path.sep);
// Возвращает: ['foo', 'bar', 'baz'].
```

В Windows:

```js
'foo\bar\baz'.split(path.sep);
// Возвращает: ['foo', 'bar', 'baz'].
```

В Windows в качестве разделителя сегментов пути принимается как прямая косая черта (`/`), так и обратная косая черта (`\`); однако методы `path` добавляют только обратную косую черту (`\`).

<!-- 0014.part.md -->

## `path.toNamespacedPath(path)`

-   `путь` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Только в системах Windows, возвращает эквивалентный [namespace-prefixed path](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#namespaces) для заданного `path`. Если `path` не является строкой, `path` будет возвращен без изменений.

Этот метод имеет смысл только в системах Windows. В POSIX-системах метод не работает и всегда возвращает `path` без изменений.

<!-- 0015.part.md -->

## `path.win32`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `path.win32` предоставляет доступ к Windows-специфическим реализациям методов `path`.

API доступен через `require('node:path').win32` или `require('node:path/win32')`.

<!-- 0016.part.md -->

