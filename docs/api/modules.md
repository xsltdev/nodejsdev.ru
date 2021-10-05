# Модули: модули CommonJS

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!--name=module-->

В модульной системе Node.js каждый файл рассматривается как отдельный модуль. Например, рассмотрим файл с именем `foo.js`:

```js
const circle = require('./circle.js');
console.log(
  `The area of a circle of radius 4 is ${circle.area(4)}`
);
```

В первой строке `foo.js` загружает модуль `circle.js` который находится в том же каталоге, что и `foo.js`.

Вот содержание `circle.js`:

```js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
```

Модуль `circle.js` экспортировал функции `area()` а также `circumference()`. Функции и объекты добавляются в корень модуля путем указания дополнительных свойств на специальном `exports` объект.

Переменные, локальные для модуля, будут частными, потому что модуль заключен в функцию с помощью Node.js (см. [оболочка модуля](#the-module-wrapper)). В этом примере переменная `PI` является частным для `circle.js`.

В `module.exports` свойству может быть присвоено новое значение (например, функция или объект).

Ниже, `bar.js` использует `square` модуль, который экспортирует класс Square:

```js
const Square = require('./square.js');
const mySquare = new Square(2);
console.log(`The area of mySquare is ${mySquare.area()}`);
```

В `square` модуль определен в `square.js`:

```js
// Assigning to exports will not modify module, must use module.exports
module.exports = class Square {
  constructor(width) {
    this.width = width;
  }

  area() {
    return this.width ** 2;
  }
};
```

Модульная система реализована в `require('module')` модуль.

## Доступ к основному модулю

<!-- type=misc -->

Когда файл запускается непосредственно из Node.js, `require.main` установлен на его `module`. Это означает, что можно определить, был ли файл запущен напрямую, путем тестирования. `require.main === module`.

Для файла `foo.js`, это будет `true` если пробежать через `node foo.js`, но `false` если управляется `require('./foo')`.

Потому что `module` обеспечивает `filename` свойство (обычно эквивалентно `__filename`), точку входа текущего приложения можно получить, проверив `require.main.filename`.

## Советы менеджера пакетов

<!-- type=misc -->

Семантика Node.js `require()` были разработаны так, чтобы быть достаточно общими для поддержки разумных структур каталогов. Программы-менеджеры пакетов, такие как `dpkg`, `rpm`, а также `npm` мы надеемся найти возможность создавать собственные пакеты из модулей Node.js без изменений.

Ниже мы приводим предлагаемую структуру каталогов, которая может работать:

Допустим, мы хотели, чтобы папка находилась по адресу `/usr/lib/node/<some-package>/<some-version>` хранить содержимое конкретной версии пакета.

Пакеты могут зависеть друг от друга. Чтобы установить пакет `foo`, может потребоваться установить определенную версию пакета `bar`. В `bar` сам пакет может иметь зависимости, а в некоторых случаях они могут даже конфликтовать или образовывать циклические зависимости.

Поскольку Node.js ищет `realpath` любых загружаемых модулей (то есть разрешает символические ссылки), а затем [ищет их зависимости в `node_modules` папки](#loading-from-node_modules-folders), эту ситуацию можно разрешить с помощью следующей архитектуры:

- `/usr/lib/node/foo/1.2.3/`: Содержание `foo` пакет, версия 1.2.3.
- `/usr/lib/node/bar/4.3.2/`: Содержание `bar` пакет, который `foo` зависит от.
- `/usr/lib/node/foo/1.2.3/node_modules/bar`: Символическая ссылка на `/usr/lib/node/bar/4.3.2/`.
- `/usr/lib/node/bar/4.3.2/node_modules/*`: Символические ссылки на пакеты, которые `bar` зависит от.

Таким образом, даже если встречается цикл или если есть конфликты зависимостей, каждый модуль сможет получить версию своей зависимости, которую он может использовать.

Когда код в `foo` пакет делает `require('bar')`, он получит версию, которая символически связана с `/usr/lib/node/foo/1.2.3/node_modules/bar`. Затем, когда код в `bar` пакетные звонки `require('quux')`, он получит версию, которая символически связана с `/usr/lib/node/bar/4.3.2/node_modules/quux`.

Кроме того, чтобы сделать процесс поиска модулей еще более оптимальным, вместо того, чтобы помещать пакеты непосредственно в `/usr/lib/node`, мы могли бы вставить их `/usr/lib/node_modules/<name>/<version>`. Тогда Node.js не будет утруждать себя поиском недостающих зависимостей в `/usr/node_modules` или `/node_modules`.

Чтобы сделать модули доступными для Node.js REPL, может быть полезно также добавить `/usr/lib/node_modules` папку в `$NODE_PATH` переменная окружения. Поскольку поиск модуля с помощью `node_modules` все папки являются относительными и основаны на реальном пути к файлам, которые обращаются к `require()`, сами пакеты могут быть где угодно.

## В `.mjs` расширение

Невозможно `require()` файлы с `.mjs` расширение. Попытка сделать это выбросит [ошибка](errors.md#err_require_esm). В `.mjs` расширение зарезервировано для [Модули ECMAScript](esm.md) который не может быть загружен через `require()`. Видеть [Модули ECMAScript](esm.md) Больше подробностей.

## Все вместе...

<!-- type=misc -->

Чтобы получить точное имя файла, которое будет загружено при `require()` называется, используйте `require.resolve()` функция.

Объединив все вышеперечисленное, вот высокоуровневый алгоритм в псевдокоде того, что `require()` делает:

<pre>
require(X) from module at path Y
1. If X is a core module,
   a. return the core module
   b. STOP
2. If X begins with '/'
   a. set Y to be the filesystem root
3. If X begins with './' or '/' or '../'
   a. LOAD_AS_FILE(Y + X)
   b. LOAD_AS_DIRECTORY(Y + X)
   c. THROW "not found"
4. If X begins with '#'
   a. LOAD_PACKAGE_IMPORTS(X, dirname(Y))
5. LOAD_PACKAGE_SELF(X, dirname(Y))
6. LOAD_NODE_MODULES(X, dirname(Y))
7. THROW "not found"

LOAD_AS_FILE(X)
1. If X is a file, load X as its file extension format. STOP
2. If X.js is a file, load X.js as JavaScript text. STOP
3. If X.json is a file, parse X.json to a JavaScript Object. STOP
4. If X.node is a file, load X.node as binary addon. STOP

LOAD_INDEX(X)
1. If X/index.js is a file, load X/index.js as JavaScript text. STOP
2. If X/index.json is a file, parse X/index.json to a JavaScript object. STOP
3. If X/index.node is a file, load X/index.node as binary addon. STOP

LOAD_AS_DIRECTORY(X)
1. If X/package.json is a file,
   a. Parse X/package.json, and look for "main" field.
   b. If "main" is a falsy value, GOTO 2.
   c. let M = X + (json main field)
   d. LOAD_AS_FILE(M)
   e. LOAD_INDEX(M)
   f. LOAD_INDEX(X) DEPRECATED
   g. THROW "not found"
2. LOAD_INDEX(X)

LOAD_NODE_MODULES(X, START)
1. let DIRS = NODE_MODULES_PATHS(START)
2. for each DIR in DIRS:
   a. LOAD_PACKAGE_EXPORTS(X, DIR)
   b. LOAD_AS_FILE(DIR/X)
   c. LOAD_AS_DIRECTORY(DIR/X)

NODE_MODULES_PATHS(START)
1. let PARTS = path split(START)
2. let I = count of PARTS - 1
3. let DIRS = [GLOBAL_FOLDERS]
4. while I >= 0,
   a. if PARTS[I] = "node_modules" CONTINUE
   b. DIR = path join(PARTS[0 .. I] + "node_modules")
   c. DIRS = DIRS + DIR
   d. let I = I - 1
5. return DIRS

LOAD_PACKAGE_IMPORTS(X, DIR)
1. Find the closest package scope SCOPE to DIR.
2. If no scope was found, return.
3. If the SCOPE/package.json "imports" is null or undefined, return.
4. let MATCH = PACKAGE_IMPORTS_RESOLVE(X, pathToFileURL(SCOPE),
  ["node", "require"]) <a href="esm.md#resolver-algorithm-specification">defined in the ESM resolver</a>.
5. RESOLVE_ESM_MATCH(MATCH).

LOAD_PACKAGE_EXPORTS(X, DIR)
1. Try to interpret X as a combination of NAME and SUBPATH where the name
   may have a @scope/ prefix and the subpath begins with a slash (`/`).
2. If X does not match this pattern or DIR/NAME/package.json is not a file,
   return.
3. Parse DIR/NAME/package.json, and look for "exports" field.
4. If "exports" is null or undefined, return.
5. let MATCH = PACKAGE_EXPORTS_RESOLVE(pathToFileURL(DIR/NAME), "." + SUBPATH,
   `package.json` "exports", ["node", "require"]) <a href="esm.md#resolver-algorithm-specification">defined in the ESM resolver</a>.
6. RESOLVE_ESM_MATCH(MATCH)

LOAD_PACKAGE_SELF(X, DIR)
1. Find the closest package scope SCOPE to DIR.
2. If no scope was found, return.
3. If the SCOPE/package.json "exports" is null or undefined, return.
4. If the SCOPE/package.json "name" is not the first segment of X, return.
5. let MATCH = PACKAGE_EXPORTS_RESOLVE(pathToFileURL(SCOPE),
   "." + X.slice("name".length), `package.json` "exports", ["node", "require"])
   <a href="esm.md#resolver-algorithm-specification">defined in the ESM resolver</a>.
6. RESOLVE_ESM_MATCH(MATCH)

RESOLVE_ESM_MATCH(MATCH)
1. let { RESOLVED, EXACT } = MATCH
2. let RESOLVED_PATH = fileURLToPath(RESOLVED)
3. If EXACT is true,
   a. If the file at RESOLVED_PATH exists, load RESOLVED_PATH as its extension
      format. STOP
4. Otherwise, if EXACT is false,
   a. LOAD_AS_FILE(RESOLVED_PATH)
   b. LOAD_AS_DIRECTORY(RESOLVED_PATH)
5. THROW "not found"
</pre>

## Кеширование

<!--type=misc-->

Модули кэшируются после первой загрузки. Это означает (среди прочего), что каждый вызов `require('foo')` вернет точно такой же объект, если он разрешится в тот же файл.

Предоставлена `require.cache` не модифицируется, многократные вызовы `require('foo')` не приведет к многократному выполнению кода модуля. Это важная особенность. С его помощью можно возвращать «частично выполненные» объекты, что позволяет загружать транзитивные зависимости, даже если они вызывают циклы.

Чтобы модуль выполнял код несколько раз, экспортируйте функцию и вызовите эту функцию.

### Предупреждения о кешировании модулей

<!--type=misc-->

Модули кэшируются на основе их разрешенного имени файла. Поскольку модули могут преобразовываться в другое имя файла в зависимости от местоположения вызывающего модуля (загрузка из `node_modules` папки), это не _гарантия_ что `require('foo')` всегда будет возвращать один и тот же объект, если он разрешается в разные файлы.

Кроме того, в файловых системах или операционных системах без учета регистра разные разрешенные имена файлов могут указывать на один и тот же файл, но кеш по-прежнему будет рассматривать их как разные модули и перезагружать файл несколько раз. Например, `require('./foo')` а также `require('./FOO')` вернуть два разных объекта, независимо от того, `./foo` а также `./FOO` это один и тот же файл.

## Основные модули

<!--type=misc-->

<!-- YAML
changes:
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37246
    description: Added `node:` import support to `require(...)`.
-->

В Node.js есть несколько модулей, скомпилированных в двоичный файл. Эти модули более подробно описаны в других разделах этой документации.

Основные модули определены в исходном коде Node.js и расположены в `lib/` папка.

Основные модули всегда предпочтительно загружаются, если их идентификатор передается в `require()`. Например, `require('http')` всегда будет возвращать встроенный HTTP-модуль, даже если есть файл с таким именем.

Основные модули также можно идентифицировать с помощью `node:` префикс, и в этом случае он обходит `require` кеш. Например, `require('node:http')` всегда будет возвращать встроенный HTTP-модуль, даже если есть `require.cache` запись с этим именем.

## Циклы

<!--type=misc-->

Когда есть круговые `require()` вызовы, модуль мог не завершить выполнение, когда он был возвращен.

Рассмотрим эту ситуацию:

`a.js`:

```js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done = %j', b.done);
exports.done = true;
console.log('a done');
```

`b.js`:

```js
console.log('b starting');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done = %j', a.done);
exports.done = true;
console.log('b done');
```

`main.js`:

```js
console.log('main starting');
const a = require('./a.js');
const b = require('./b.js');
console.log(
  'in main, a.done = %j, b.done = %j',
  a.done,
  b.done
);
```

Когда `main.js` грузы `a.js`, тогда `a.js` в свою очередь загружает `b.js`. В таком случае, `b.js` пытается загрузить `a.js`. Чтобы предотвратить бесконечный цикл, **незаконченная копия** принадлежащий `a.js` объект экспорта возвращается в `b.js` модуль. `b.js` затем завершает загрузку, и его `exports` объект предоставляется `a.js` модуль.

К тому времени `main.js` загрузил оба модуля, они оба готовы. Таким образом, результат этой программы будет:

```console
$ node main.js
main starting
a starting
b starting
in b, a.done = false
b done
in a, b.done = true
a done
in main, a.done = true, b.done = true
```

Для правильной работы циклических зависимостей модулей в приложении требуется тщательное планирование.

## Файловые модули

<!--type=misc-->

Если точное имя файла не найдено, то Node.js попытается загрузить требуемое имя файла с добавленными расширениями: `.js`, `.json`, и наконец `.node`.

`.js` файлы интерпретируются как текстовые файлы JavaScript, и `.json` файлы анализируются как текстовые файлы JSON. `.node` файлы интерпретируются как скомпилированные дополнительные модули, загруженные с `process.dlopen()`.

Требуемый модуль с префиксом `'/'` это абсолютный путь к файлу. Например, `require('/home/marco/foo.js')` загрузит файл по адресу `/home/marco/foo.js`.

Требуемый модуль с префиксом `'./'` относительно файла, вызывающего `require()`. То есть, `circle.js` должен находиться в том же каталоге, что и `foo.js` для `require('./circle')` найти это.

Без ведущего `'/'`, `'./'`, или `'../'` чтобы указать файл, модуль должен быть либо базовым, либо загружаться из `node_modules` папка.

Если данный путь не существует, `require()` бросит [`Error`](errors.md#class-error) с этими `code` свойство установлено на `'MODULE_NOT_FOUND'`.

## Папки как модули

<!--type=misc-->

Удобно организовать программы и библиотеки в автономные каталоги, а затем предоставить единую точку входа в эти каталоги. Существует три способа передачи папки в `require()` как аргумент.

Первый - создать [`package.json`](packages.md#nodejs-packagejson-field-definitions) файл в корне папки, в котором указывается `main` модуль. Пример [`package.json`](packages.md#nodejs-packagejson-field-definitions) файл может выглядеть так:

```json
{ "name": "some-library", "main": "./lib/some-library.js" }
```

Если бы это было в папке на `./some-library`, тогда `require('./some-library')` попытается загрузить `./some-library/lib/some-library.js`.

Это степень осознания `package.json` файлы в Node.js.

Если нет [`package.json`](packages.md#nodejs-packagejson-field-definitions) файл присутствует в каталоге, или если [`"main"`](packages.md#main) запись отсутствует или не может быть разрешена, тогда Node.js попытается загрузить `index.js` или `index.node` файл из этого каталога. Например, если не было [`package.json`](packages.md#nodejs-packagejson-field-definitions) файл в предыдущем примере, затем `require('./some-library')` попытается загрузить:

- `./some-library/index.js`
- `./some-library/index.node`

Если эти попытки не удастся, Node.js сообщит об отсутствии всего модуля с ошибкой по умолчанию:

```console
Error: Cannot find module 'some-library'
```

## Загрузка из `node_modules` папки

<!--type=misc-->

Если идентификатор модуля передан в `require()` это не [основной](#core-modules) модуль и не начинается с `'/'`, `'../'`, или `'./'`, то Node.js запускается в родительском каталоге текущего модуля и добавляет `/node_modules`, и пытается загрузить модуль из этого места. Node.js не будет добавлять `node_modules` на путь, уже заканчивающийся в `node_modules`.

Если его там нет, он перемещается в родительский каталог и так далее, пока не будет достигнут корень файловой системы.

Например, если файл на `'/home/ry/projects/foo.js'` называется `require('bar.js')`, то Node.js будет искать в следующих местах в следующем порядке:

- `/home/ry/projects/node_modules/bar.js`
- `/home/ry/node_modules/bar.js`
- `/home/node_modules/bar.js`
- `/node_modules/bar.js`

Это позволяет программам локализовать свои зависимости, чтобы они не конфликтовали.

Можно потребовать определенные файлы или подмодули, распространяемые вместе с модулем, путем включения суффикса пути после имени модуля. Например `require('example-module/path/to/file')` разрешит `path/to/file` относительно того, где `example-module` расположен. Путь с суффиксом следует той же семантике разрешения модуля.

## Загрузка из глобальных папок

<!-- type=misc -->

Если `NODE_PATH` Переменная среды установлена в список абсолютных путей, разделенных двоеточиями, тогда Node.js будет искать по этим путям модули, если они не найдены где-либо еще.

В Windows `NODE_PATH` разделяется точкой с запятой (`;`) вместо двоеточия.

`NODE_PATH` изначально был создан для поддержки загрузки модулей с разных путей до текущего [разрешение модуля](#all-together) алгоритм был определен.

`NODE_PATH` все еще поддерживается, но теперь он менее необходим, когда экосистема Node.js установила соглашение о размещении зависимых модулей. Иногда развертывания, основанные на `NODE_PATH` проявлять удивительное поведение, когда люди не знают, что `NODE_PATH` должен быть установлен. Иногда зависимости модуля меняются, в результате чего другая версия (или даже другой модуль) загружается как `NODE_PATH` ищется.

Кроме того, Node.js будет искать в следующем списке GLOBAL_FOLDERS:

- 1: `$HOME/.node_modules`
- 2: `$HOME/.node_libraries`
- 3: `$PREFIX/lib/node`

Где `$HOME` домашний каталог пользователя, и `$PREFIX` настроен ли Node.js `node_prefix`.

Это в основном по историческим причинам.

Настоятельно рекомендуется размещать зависимости в локальном `node_modules` папка. Они будут загружаться быстрее и надежнее.

## Оболочка модуля

<!-- type=misc -->

Перед выполнением кода модуля Node.js обернет его оболочкой функции, которая выглядит следующим образом:

```js
(function (
  exports,
  require,
  module,
  __filename,
  __dirname
) {
  // Module code actually lives in here
});
```

Таким образом Node.js достигает нескольких целей:

- Он хранит переменные верхнего уровня (определенные с помощью `var`, `const` или `let`) область видимости модуля, а не глобального объекта.
- Это помогает предоставить некоторые глобально выглядящие переменные, которые действительно относятся к модулю, например:
  - В `module` а также `exports` объекты, которые разработчик может использовать для экспорта значений из модуля.
  - Удобные переменные `__filename` а также `__dirname`, содержащий абсолютное имя файла и путь к каталогу модуля.

## Объем модуля

### `__dirname`

<!-- YAML
added: v0.1.27
-->

<!-- type=var -->

- {нить}

Имя каталога текущего модуля. Это то же самое, что и [`path.dirname()`](path.md#pathdirnamepath) принадлежащий [`__filename`](#__filename).

Пример: бег `node example.js` из `/Users/mjr`

```js
console.log(__dirname);
// Prints: /Users/mjr
console.log(path.dirname(__filename));
// Prints: /Users/mjr
```

### `__filename`

<!-- YAML
added: v0.0.1
-->

<!-- type=var -->

- {нить}

Имя файла текущего модуля. Это абсолютный путь к текущему файлу модуля с разрешенными символическими ссылками.

Для основной программы это не обязательно то же самое, что имя файла, используемое в командной строке.

Видеть [`__dirname`](#__dirname) для имени каталога текущего модуля.

Примеры:

Бег `node example.js` из `/Users/mjr`

```js
console.log(__filename);
// Prints: /Users/mjr/example.js
console.log(__dirname);
// Prints: /Users/mjr
```

Учитывая два модуля: `a` а также `b`, куда `b` это зависимость от `a` и есть структура каталогов:

- `/Users/mjr/app/a.js`
- `/Users/mjr/app/node_modules/b/b.js`

Ссылки на `__filename` в `b.js` вернусь `/Users/mjr/app/node_modules/b/b.js` в то время как ссылки на `__filename` в `a.js` вернусь `/Users/mjr/app/a.js`.

### `exports`

<!-- YAML
added: v0.1.12
-->

<!-- type=var -->

- {Объект}

Ссылка на `module.exports` что короче набрать. См. Раздел о [ярлык экспорта](#exports-shortcut) для получения подробной информации о том, когда использовать `exports` и когда использовать `module.exports`.

### `module`

<!-- YAML
added: v0.1.16
-->

<!-- type=var -->

- {модуль}

Ссылку на текущий модуль см. В разделе о [`module` объект](#the-module-object). Особенно, `module.exports` используется для определения того, что модуль экспортирует и делает доступным через `require()`.

### `require(id)`

<!-- YAML
added: v0.1.13
-->

<!-- type=var -->

- `id` {строка} имя модуля или путь
- Возвращает: {любой} экспортированное содержимое модуля

Используется для импорта модулей, `JSON`, и локальные файлы. Модули можно импортировать из `node_modules`. Локальные модули и файлы JSON можно импортировать, используя относительный путь (например, `./`, `./foo`, `./bar/baz`, `../foo`), который будет разрешен для каталога, названного [`__dirname`](#__dirname) (если определено) или текущий рабочий каталог. Относительные пути стиля POSIX разрешаются независимо от ОС, что означает, что приведенные выше примеры будут работать в Windows так же, как и в системах Unix.

```js
// Importing a local module with a path relative to the `__dirname` or current
// working directory. (On Windows, this would resolve to .\path\myLocalModule.)
const myLocalModule = require('./path/myLocalModule');

// Importing a JSON file:
const jsonData = require('./path/filename.json');

// Importing a module from node_modules or Node.js built-in module:
const crypto = require('crypto');
```

#### `require.cache`

<!-- YAML
added: v0.3.0
-->

- {Объект}

Модули кэшируются в этом объекте, когда они требуются. Удалив значение ключа из этого объекта, следующий `require` перезагрузит модуль. Это не относится к [нативные дополнения](addons.md), для которых перезагрузка приведет к ошибке.

Также возможно добавление или замена записей. Этот кеш проверяется перед собственными модулями, и если в кеш добавляется имя, соответствующее собственному модулю, только `node:`-prefixed require вызовы будут получать собственный модуль. Используйте осторожно!

<!-- eslint-disable node-core/no-duplicate-requires -->

```js
const assert = require('assert');
const realFs = require('fs');

const fakeFs = {};
require.cache.fs = { exports: fakeFs };

assert.strictEqual(require('fs'), fakeFs);
assert.strictEqual(require('node:fs'), realFs);
```

#### `require.extensions`

<!-- YAML
added: v0.3.0
deprecated: v0.10.6
-->

> Стабильность: 0 - устарело

- {Объект}

Инструктировать `require` о том, как обрабатывать определенные расширения файлов.

Обработка файлов с расширением `.sjs` в качестве `.js`:

```js
require.extensions['.sjs'] = require.extensions['.js'];
```

**Устарело.** Раньше этот список использовался для загрузки модулей, отличных от JavaScript, в Node.js путем их компиляции по запросу. Однако на практике есть гораздо лучшие способы сделать это, например, загрузить модули через какую-нибудь другую программу Node.js или заранее скомпилировать их в JavaScript.

Избегать использования `require.extensions`. Использование может вызвать небольшие ошибки, и разрешение расширений будет медленнее с каждым зарегистрированным расширением.

#### `require.main`

<!-- YAML
added: v0.1.17
-->

- {модуль}

В `Module` объект, представляющий сценарий входа, загружаемый при запуске процесса Node.js. Видеть [«Доступ к основному модулю»](#accessing-the-main-module).

В `entry.js` сценарий:

```js
console.log(require.main);
```

```bash
node entry.js
```

<!-- eslint-skip -->

```js
Module {
  id: '.',
  path: '/absolute/path/to',
  exports: {},
  filename: '/absolute/path/to/entry.js',
  loaded: false,
  children: [],
  paths:
   [ '/absolute/path/to/node_modules',
     '/absolute/path/node_modules',
     '/absolute/node_modules',
     '/node_modules' ] }
```

#### `require.resolve(request[, options])`

<!-- YAML
added: v0.3.0
changes:
  - version: v8.9.0
    pr-url: https://github.com/nodejs/node/pull/16397
    description: The `paths` option is now supported.
-->

- `request` {строка} Путь к модулю для разрешения.
- `options` {Объект}
  - `paths` {string \[]} Пути для определения местоположения модуля. Если присутствует, эти пути используются вместо путей разрешения по умолчанию, за исключением [GLOBAL_FOLDERS](#loading-from-the-global-folders) нравиться `$HOME/.node_modules`, которые всегда включены. Каждый из этих путей используется в качестве отправной точки для алгоритма разрешения модуля, что означает, что `node_modules` иерархия проверяется из этого места.
- Возвращает: {строка}

Используйте внутренний `require()` машины для поиска местоположения модуля, но вместо загрузки модуля просто верните разрешенное имя файла.

Если модуль не может быть найден, `MODULE_NOT_FOUND` выдается ошибка.

##### `require.resolve.paths(request)`

<!-- YAML
added: v8.9.0
-->

- `request` {строка} Путь к модулю, пути поиска которого извлекаются.
- Возвращает: {string \[] | null}

Возвращает массив, содержащий пути, найденные во время разрешения `request` или `null` если `request` строка ссылается на основной модуль, например `http` или `fs`.

## В `module` объект

<!-- YAML
added: v0.1.16
-->

<!-- type=var -->

<!-- name=module -->

- {Объект}

В каждом модуле `module` свободная переменная - это ссылка на объект, представляющий текущий модуль. Для удобства, `module.exports` также доступен через `exports` модуль-глобальный. `module` на самом деле не глобальный, а скорее локальный для каждого модуля.

### `module.children`

<!-- YAML
added: v0.1.16
-->

- {модуль \[]}

Объекты модуля, необходимые для этого впервые.

### `module.exports`

<!-- YAML
added: v0.1.16
-->

- {Объект}

В `module.exports` объект создается `Module` система. Иногда это неприемлемо; многие хотят, чтобы их модуль был экземпляром какого-то класса. Для этого назначьте желаемый объект экспорта в `module.exports`. Назначение желаемого объекта на `exports` просто перепишет локальный `exports` переменная, что, вероятно, не то, что нужно.

Например, предположим, что мы создаем модуль с именем `a.js`:

```js
const EventEmitter = require('events');

module.exports = new EventEmitter();

// Do some work, and after some time emit
// the 'ready' event from the module itself.
setTimeout(() => {
  module.exports.emit('ready');
}, 1000);
```

Затем в другом файле мы могли бы сделать:

```js
const a = require('./a');
a.on('ready', () => {
  console.log('module "a" is ready');
});
```

Присвоение `module.exports` нужно сделать немедленно. Это невозможно сделать ни в каких обратных вызовах. Это не работает:

`x.js`:

```js
setTimeout(() => {
  module.exports = { a: 'hello' };
}, 0);
```

`y.js`:

```js
const x = require('./x');
console.log(x.a);
```

#### `exports` ярлык

<!-- YAML
added: v0.1.16
-->

В `exports` переменная доступна в пределах области файлового уровня модуля, и ей присваивается значение `module.exports` перед оценкой модуля.

Это позволяет ярлык, так что `module.exports.f = ...` можно записать более кратко как `exports.f = ...`. Однако имейте в виду, что, как и любой переменной, если новое значение присваивается `exports`, он больше не привязан к `module.exports`:

```js
module.exports.hello = true; // Exported from require of module
exports = { hello: false }; // Not exported, only available in the module
```

Когда `module.exports` свойство полностью заменяется новым объектом, обычно также переназначается `exports`:

<!-- eslint-disable func-name-matching -->

```js
module.exports = exports = function Constructor() {
  // ... etc.
};
```

Чтобы проиллюстрировать поведение, представьте себе эту гипотетическую реализацию `require()`, что очень похоже на то, что на самом деле делает `require()`:

```js
function require(/* ... */) {
  const module = { exports: {} };
  ((module, exports) => {
    // Module code here. In this example, define a function.
    function someFunc() {}
    exports = someFunc;
    // At this point, exports is no longer a shortcut to module.exports, and
    // this module will still export an empty default object.
    module.exports = someFunc;
    // At this point, the module will now export someFunc, instead of the
    // default object.
  })(module, module.exports);
  return module.exports;
}
```

### `module.filename`

<!-- YAML
added: v0.1.16
-->

- {нить}

Полностью разрешенное имя файла модуля.

### `module.id`

<!-- YAML
added: v0.1.16
-->

- {нить}

Идентификатор модуля. Обычно это полностью разрешенное имя файла.

### `module.isPreloading`

<!-- YAML
added:
  - v15.4.0
  - v14.17.0
-->

- Тип: {логическое} `true` если модуль запущен на этапе предварительной загрузки Node.js.

### `module.loaded`

<!-- YAML
added: v0.1.16
-->

- {логический}

Независимо от того, загружается ли модуль или находится в процессе загрузки.

### `module.parent`

<!-- YAML
added: v0.1.16
deprecated:
  - v14.6.0
  - v12.19.0
-->

> Стабильность: 0 - Не рекомендуется: используйте [`require.main`](#requiremain) а также [`module.children`](#modulechildren) вместо.

- {модуль | null | неопределенный}

Модуль, который первым требовал этого, или `null` если текущий модуль является точкой входа текущего процесса, или `undefined` если модуль был загружен чем-то, что не является модулем CommonJS (например: REPL или `import`).

### `module.path`

<!-- YAML
added: v11.14.0
-->

- {нить}

Имя каталога модуля. Обычно это то же самое, что и [`path.dirname()`](path.md#pathdirnamepath) принадлежащий [`module.id`](#moduleid).

### `module.paths`

<!-- YAML
added: v0.4.0
-->

- {нить\[]}

Пути поиска для модуля.

### `module.require(id)`

<!-- YAML
added: v0.5.1
-->

- `id` {нить}
- Возвращает: {любой} экспортированное содержимое модуля

В `module.require()` метод обеспечивает способ загрузки модуля, как если бы `require()` был вызван из исходного модуля.

Для этого необходимо получить ссылку на `module` объект. С `require()` возвращает `module.exports`, а `module` обычно _Только_ доступный в коде конкретного модуля, он должен быть явно экспортирован, чтобы его можно было использовать.

## В `Module` объект

Этот раздел был перемещен в [Модули: `module` основной модуль](module.md#the-module-object).

<!-- Anchors to make sure old links find a target -->

- <a id="modules_module_builtinmodules" href="module.html#modulebuiltinmodules">`module.builtinModules`</a>
- <a id="modules_module_createrequire_filename" href="module.html#modulecreaterequirefilename">`module.createRequire(filename)`</a>
- <a id="modules_module_syncbuiltinesmexports" href="module.html#modulesyncbuiltinesmexports">`module.syncBuiltinESMExports()`</a>

## Поддержка Source Map v3

Этот раздел был перемещен в [Модули: `module` основной модуль](module.md#source-map-v3-support).

<!-- Anchors to make sure old links find a target -->

- <a id="modules_module_findsourcemap_path_error" href="module.html#modulefindsourcemappath">`module.findSourceMap(path)`</a>
- <a id="modules_class_module_sourcemap" href="module.html#class-modulesourcemap">Класс: `module.SourceMap`</a>
  - <a id="modules_new_sourcemap_payload" href="module.html#new-sourcemappayload">`new SourceMap(payload)`</a>
  - <a id="modules_sourcemap_payload" href="module.html#sourcemappayload">`sourceMap.payload`</a>
  - <a id="modules_sourcemap_findentry_linenumber_columnnumber" href="module.html#sourcemapfindentrylinenumber-columnnumber">`sourceMap.findEntry(lineNumber, columnNumber)`</a>
