---
title: CommonJS modules
description: Модули CommonJS - это оригинальный способ упаковки кода JavaScript для Node.js
---

# Модули CommonJS

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/modules.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

**Модули CommonJS** - это оригинальный способ упаковки кода JavaScript для Node.js. Node.js также поддерживает стандарт [ECMAScript modules](esm.md), используемый браузерами и другими средами выполнения JavaScript.

В Node.js каждый файл рассматривается как отдельный модуль. Например, рассмотрим файл с именем `foo.js`:

```js
const circle = require('./circle.js');
console.log(
    `Площадь круга радиуса 4 равна ${circle.area(4)}`
);
```

В первой строке `foo.js` загружает модуль `circle.js`, который находится в том же каталоге, что и `foo.js`.

Вот содержимое `circle.js`:

```js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
```

Модуль `circle.js` экспортировал функции `area()` и `circumference()`. Функции и объекты добавляются в корень модуля путем указания дополнительных свойств специального объекта `exports`.

Переменные, локальные для модуля, будут приватными, поскольку модуль обернут в функцию Node.js (см. [module wrapper](#the-module-wrapper)). В этом примере переменная `PI` является приватной для `circle.js`.

Свойству `module.exports` может быть присвоено новое значение (например, функция или объект).

Ниже, `bar.js` использует модуль `square`, который экспортирует класс Square:

```js
const Square = require('./square.js');
const mySquare = new Square(2);
console.log(`Площадь mySquare равна ${mySquare.area()}`);
```

Модуль `square` определен в `square.js`:

```js
// Назначение на exports не изменит модуль, необходимо использовать module.exports
module.exports = class Square {
    constructor(width) {
        this.width = width;
    }

    площадь() {
        return this.width ** 2;
    }
};
```

Система модулей CommonJS реализована в модуле [`module` core module](module.md).

<!-- 0000.part.md -->

## Включение

Node.js имеет две системы модулей: CommonJS модули и [ECMAScript модули](esm.md).

По умолчанию Node.js будет считать модулями CommonJS следующее:

-   Файлы с расширением `.cjs`;

-   Файлы с расширением `.js`, если ближайший родительский файл `package.json` содержит поле верхнего уровня [`"type"`](packages.md#type) со значением `"commonjs"`.

-   Файлы с расширением `.js`, если ближайший родительский `package.json` файл не содержит поля верхнего уровня [`"type"`](packages.md#type). Авторы пакетов должны включать поле [`тип`](packages.md#type), даже в пакетах, где все источники являются CommonJS. Явное указание `типа` пакета облегчит инструментам сборки и загрузчикам определение того, как следует интерпретировать файлы в пакете.

-   Файлы с расширением не `.mjs`, `.cjs`, `.json`, `.node` или `.js` (если ближайший родительский файл `package.json` содержит поле верхнего уровня [`"type"`](packages.md#type) со значением `"module"`, эти файлы будут распознаны как модули CommonJS только в том случае, если они включаются через `require()`, но не при использовании в качестве точки входа программы в командной строке).

Более подробную информацию смотрите в [Определение системы модулей](packages.md#determining-module-system).

Вызов `require()` всегда использует загрузчик модулей CommonJS. Вызов `import()` всегда использует загрузчик модулей ECMAScript.

<!-- 0001.part.md -->

## Доступ к главному модулю

Когда файл запускается непосредственно из Node.js, `require.main` устанавливается в его `модуль`. Это означает, что можно определить, был ли файл запущен напрямую, проверив `require.main === module`.

Для файла `foo.js` это будет `true`, если он запущен через `node foo.js`, но `false`, если запущен через `require('./foo')`.

Если точка входа не является модулем CommonJS, `require.main` будет `undefined`, и главный модуль будет недоступен.

<!-- 0002.part.md -->

## Советы по работе с менеджером пакетов

Семантика функции Node.js `require()` была разработана достаточно общей, чтобы поддерживать разумные структуры каталогов. Программы менеджеров пакетов, такие как `dpkg`, `rpm` и `npm`, надеюсь, найдут возможность собирать собственные пакеты из модулей Node.js без модификации.

Ниже мы приводим предлагаемую структуру каталогов, которая может работать:

Допустим, мы хотим, чтобы папка по адресу `/usr/lib/node/<some-package>/<some-version>` содержала содержимое определенной версии пакета.

Пакеты могут зависеть друг от друга. Для того чтобы установить пакет `foo`, может потребоваться установить определенную версию пакета `bar`. Пакет `bar` может сам иметь зависимости, и в некоторых случаях они могут даже сталкиваться или образовывать циклические зависимости.

Поскольку Node.js просматривает `realpath` всех загружаемых модулей (то есть, разрешает симлинки), а затем [ищет их зависимости в папках `node_modules`](#loading-from-node_modules-folders), эта ситуация может быть разрешена с помощью следующей архитектуры:

-   `/usr/lib/node/foo/1.2.3/`: Содержимое пакета `foo`, версия 1.2.3.
-   `/usr/lib/node/bar/4.3.2/`: Содержимое пакета `bar`, от которого зависит `foo`.
-   `/usr/lib/node/foo/1.2.3/node_modules/bar`: Символическая ссылка на `/usr/lib/node/bar/4.3.2/`.
-   `/usr/lib/node/bar/4.3.2/node_modules/*`: Символические ссылки на пакеты, от которых зависит `bar`.

Таким образом, даже если встретится цикл или возникнут конфликты зависимостей, каждый модуль сможет получить версию своей зависимости, которую он может использовать.

Когда код в пакете `foo` выполняет `require('bar')`, он получит версию, которая находится по симлинку в `/usr/lib/node/foo/1.2.3/node_modules/bar`. Затем, когда код в пакете `bar` вызовет `require('quux')`, он получит версию, которая находится по симлинку в `/usr/lib/node/bar/4.3.2/node_modules/quux`.

Более того, чтобы сделать процесс поиска модулей еще более оптимальным, вместо того, чтобы помещать пакеты непосредственно в `/usr/lib/node`, мы можем поместить их в `/usr/lib/node_modules/<name>/<version>`. Тогда Node.js не будет утруждать себя поиском отсутствующих зависимостей в `/usr/node_modules` или `/node_modules`.

Чтобы сделать модули доступными для Node.js REPL, может быть полезно также добавить папку `/usr/lib/node_modules` в переменную окружения `$NODE_PATH`. Поскольку поиск модулей с помощью папок `node_modules` является относительным и основан на реальном пути к файлам, выполняющим вызовы `require()`, сами пакеты могут находиться где угодно.

<!-- 0003.part.md -->

## Расширение `.mjs`

Из-за синхронной природы `require()` невозможно использовать его для загрузки файлов модулей ECMAScript. Попытка сделать это приведет к ошибке [`ERR_REQUIRE_ESM`](errors.md#err_require_esm). Вместо этого используйте [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).

Расширение `.mjs` зарезервировано для [Модулей ECMAScript](esm.md), которые не могут быть загружены через `require()`. Смотрите раздел [Определение системы модулей](packages.md#determining-module-system) для получения дополнительной информации о том, какие файлы разбираются как модули ECMAScript.

<!-- 0004.part.md -->

## Все вместе

Чтобы получить точное имя файла, который будет загружен при вызове `require()`, используйте функцию `require.resolve()`.

Если собрать воедино все вышесказанное, вот высокоуровневый алгоритм в псевдокоде того, что делает `require()`:

```
require(X) from module at path Y
1. If X is a core module,
   a. return the core module
   b. STOP
2. If X begins with '/'
   a. set Y to be the file system root
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
3. let DIRS = []
4. while I >= 0,
   a. if PARTS[I] = "node_modules" CONTINUE
   b. DIR = path join(PARTS[0 .. I] + "node_modules")
   c. DIRS = DIR + DIRS
   d. let I = I - 1
5. return DIRS + GLOBAL_FOLDERS

LOAD_PACKAGE_IMPORTS(X, DIR)
1. Find the closest package scope SCOPE to DIR.
2. If no scope was found, return.
3. If the SCOPE/package.json "imports" is null or undefined, return.
4. let MATCH = PACKAGE_IMPORTS_RESOLVE(X, pathToFileURL(SCOPE),
  ["node", "require"]) defined in the ESM resolver.
5. RESOLVE_ESM_MATCH(MATCH).

LOAD_PACKAGE_EXPORTS(X, DIR)
1. Try to interpret X as a combination of NAME and SUBPATH where the name
   may have a @scope/ prefix and the subpath begins with a slash (`/`).
2. If X does not match this pattern or DIR/NAME/package.json is not a file,
   return.
3. Parse DIR/NAME/package.json, and look for "exports" field.
4. If "exports" is null or undefined, return.
5. let MATCH = PACKAGE_EXPORTS_RESOLVE(pathToFileURL(DIR/NAME), "." + SUBPATH,
   `package.json` "exports", ["node", "require"]) defined in the ESM resolver.
6. RESOLVE_ESM_MATCH(MATCH)

LOAD_PACKAGE_SELF(X, DIR)
1. Find the closest package scope SCOPE to DIR.
2. If no scope was found, return.
3. If the SCOPE/package.json "exports" is null or undefined, return.
4. If the SCOPE/package.json "name" is not the first segment of X, return.
5. let MATCH = PACKAGE_EXPORTS_RESOLVE(pathToFileURL(SCOPE),
   "." + X.slice("name".length), `package.json` "exports", ["node", "require"])
   defined in the ESM resolver.
6. RESOLVE_ESM_MATCH(MATCH)

RESOLVE_ESM_MATCH(MATCH)
1. let RESOLVED_PATH = fileURLToPath(MATCH)
2. If the file at RESOLVED_PATH exists, load RESOLVED_PATH as its extension
   format. STOP
3. THROW "not found"
```

<!-- 0005.part.md -->

## Кэширование

Модули кэшируются после первой загрузки. Это означает (помимо прочего), что при каждом вызове `require('foo')` будет возвращен точно такой же объект, если он будет разрешен в тот же файл.

При условии, что `require.cache` не изменен, многократные вызовы `require('foo')` не приведут к многократному выполнению кода модуля. Это важная особенность. С ее помощью можно возвращать "частично выполненные" объекты, что позволяет загружать переходные зависимости, даже если они могут вызвать циклы.

Чтобы модуль выполнял код несколько раз, экспортируйте функцию и вызовите ее.

<!-- 0006.part.md -->

### Предостережения по кэшированию модулей

Модули кэшируются на основе их разрешенного имени файла. Поскольку модули могут разрешаться в разные имена файлов в зависимости от расположения вызывающего модуля (загрузка из папок `node_modules`), это не _гарантия_ того, что `require('foo')` всегда будет возвращать точно такой же объект, если он разрешается в разные файлы.

Кроме того, в файловых системах или операционных системах, не чувствительных к регистру, разные разрешенные имена файлов могут указывать на один и тот же файл, но кэш все равно будет рассматривать их как разные модули и будет перезагружать файл несколько раз. Например, `require('./foo')` и `require('./FOO')` возвращают два разных объекта, независимо от того, являются ли `./foo` и `./FOO` одним и тем же файлом.

<!-- 0007.part.md -->

## Основные модули

Node.js имеет несколько модулей, скомпилированных в двоичный файл. Эти модули более подробно описаны в других разделах этой документации.

Основные модули определены в исходном коде Node.js и находятся в папке `lib/`.

Основные модули могут быть определены с помощью префикса `node:`, в этом случае они обходят кэш `require`. Например, `require('node:http')` всегда будет возвращать встроенный модуль HTTP, даже если в `require.cache` есть запись с таким именем.

Некоторые модули ядра всегда загружаются предпочтительно, если их идентификатор передан в `require()`. Например, `require('http')` всегда будет возвращать встроенный модуль HTTP, даже если существует файл с таким именем. Список основных модулей, которые могут быть загружены без использования префикса `node:`, раскрывается как [`module.builtinModules`](module.md#modulebuiltinmodules).

<!-- 0008.part.md -->

## Циклы

Когда есть циклические вызовы `require()`, модуль может не закончить выполнение, когда он будет возвращен.

Рассмотрим такую ситуацию:

`a.js`:

```js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('в a, b.done = %j', b.done);
exports.done = true;
console.log('a done');
```

`b.js`:

```js
console.log('b started');
exports.done = false;
const a = require('./a.js');
console.log('в b, a.done = %j', a.done);
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

Когда `main.js` загружает `a.js`, то `a.js` в свою очередь загружает `b.js`. В этот момент `b.js` пытается загрузить `a.js`. Чтобы предотвратить бесконечный цикл, **незавершенная копия** объекта экспорта `a.js` возвращается в модуль `b.js`. Затем `b.js` завершает загрузку, и его объект `exports` передается модулю `a.js`.

К тому времени, когда `main.js` загрузит оба модуля, они оба завершат работу. Вывод этой программы будет выглядеть следующим образом:

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

Для того чтобы циклические зависимости модулей корректно работали в приложении, необходимо тщательное планирование.

<!-- 0009.part.md -->

## Модули файлов

Если точное имя файла не найдено, то Node.js попытается загрузить требуемое имя файла с добавленными расширениями: `.js`, `.json`, и, наконец, `.node`. При загрузке файла, имеющего другое расширение (например, `.cjs`), его полное имя должно быть передано в `require()`, включая расширение файла (например, `require('./file.cjs')`).

Файлы `.json` анализируются как текстовые файлы JSON, файлы `.node` интерпретируются как скомпилированные модули аддонов, загруженные с помощью `process.dlopen()`. Файлы, использующие любое другое расширение (или вообще без расширения), разбираются как текстовые файлы JavaScript. Обратитесь к разделу [Определение системы модулей](packages.md#determining-module-system), чтобы понять, какая цель разбора будет использоваться.

Требуемый модуль с префиксом `'/'` - это абсолютный путь к файлу. Например, `require('/home/marco/foo.js')` загрузит файл по адресу `/home/marco/foo.js`.

Требуемый модуль с префиксом `./'` является относительным к файлу, вызывающему `require()`. То есть, `circle.js` должен находиться в том же каталоге, что и `foo.js`, чтобы `require('./circle')` нашел его.

Без ведущего `'/'`, `'/'` или `'/.../'` для указания файла, модуль должен быть либо основным модулем, либо загружаться из папки `node_modules`.

Если указанный путь не существует, `require()` выдаст ошибку [`MODULE_NOT_FOUND`](errors.md#module_not_found).

<!-- 0010.part.md -->

## Папки как модули

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [subpath exports](packages.md#subpath-exports) или [subpath imports](packages.md#subpath-imports).

Существует три способа передачи папки в `require()` в качестве аргумента.

Первый - создать в корне папки файл [`package.json`](packages.md#nodejs-packagejson-field-definitions), который определяет `главный` модуль. Пример файла [`package.json`](packages.md#nodejs-packagejson-field-definitions) может выглядеть следующим образом:

```json
{ "name": "some-library", "main": "./lib/some-library.js" }
```

Если бы это находилось в папке `./some-library`, то `require('./some-library')` попытался бы загрузить `./some-library/lib/some-library.js`.

Если в каталоге нет файла [`package.json`](packages.md#nodejs-packagejson-field-definitions), или если запись [`"main"`](packages.md#main) отсутствует или не может быть разрешена, то Node.js попытается загрузить файл `index.js` или `index.node` из этого каталога. Например, если в предыдущем примере не было файла [`package.json`](packages.md#nodejs-packagejson-field-definitions), то `require('./some-library')` попытается загрузить:

-   `./some-library/index.js`
-   `./some-library/index.node`.

Если эти попытки не увенчаются успехом, то Node.js сообщит об отсутствии всего модуля с ошибкой по умолчанию:

```console
Ошибка: Cannot find module 'some-library'
```

Во всех трех вышеприведенных случаях вызов `import('./some-library')` приведет к ошибке [`ERR_UNSUPPORTED_DIR_IMPORT`](errors.md#err_unsupported_dir_import). Использование пакетов [subpath exports](packages.md#subpath-exports) или [subpath imports](packages.md#subpath-imports) может обеспечить те же преимущества организации содержимого, что и папки, и модули, и работать как для `require`, так и для `import`.

<!-- 0011.part.md -->

## Загрузка из папок `node_modules`

Если идентификатор модуля, переданный в `require()`, не является модулем [core](#core-modules) и не начинается с `'/'`, `'../'` или `'./'`, то Node.js начинает с каталога текущего модуля, добавляет `/node_modules` и пытается загрузить модуль из этого места. Node.js не будет добавлять `node_modules` к пути, который уже заканчивается на `node_modules`.

Если модуль не найден там, то он переходит в родительский каталог, и так далее, пока не будет достигнут корень файловой системы.

Например, если файл по адресу `'/home/ry/projects/foo.js'` вызывает `require('bar.js')`, то Node.js будет искать в следующих местах, в таком порядке:

-   `/home/ry/projects/node_modules/bar.js`
-   `/home/ry/node_modules/bar.js`
-   `/home/node_modules/bar.js`
-   `/node_modules/bar.js`

Это позволяет программам локализовать свои зависимости, чтобы они не конфликтовали.

Можно потребовать определенные файлы или подмодули, распространяемые вместе с модулем, включив суффикс пути после имени модуля. Например, `require('example-module/path/to/file')` разрешит `path/to/file` относительно того места, где находится `example-module`. Путь с суффиксом следует той же семантике разрешения модуля.

<!-- 0012.part.md -->

## Загрузка из глобальных папок

Если переменная окружения `NODE_PATH` установлена в список абсолютных путей, разделенных двоеточием, то Node.js будет искать модули по этим путям, если они не найдены в других местах.

В Windows `NODE_PATH` разграничивается точками с запятой (`;`) вместо двоеточий.

`NODE_PATH` был изначально создан для поддержки загрузки модулей из различных путей до того, как был определен текущий алгоритм [разрешения модулей](#all-together).

`NODE_PATH` все еще поддерживается, но теперь, когда экосистема Node.js пришла к соглашению о расположении зависимых модулей, необходимость в нем отпала. Иногда развертывания, которые полагаются на `NODE_PATH`, показывают неожиданное поведение, когда люди не знают, что `NODE_PATH` должен быть установлен. Иногда зависимости модуля меняются, в результате чего при поиске по `NODE_PATH` загружается другая версия (или даже другой модуль).

Кроме того, Node.js будет искать в следующем списке GLOBAL_FOLDERS:

-   1: `$HOME/.node_modules`.
-   2: `$HOME/.node_libraries`
-   3: `$PREFIX/lib/node`.

Где `$HOME` - это домашний каталог пользователя, а `$PREFIX` - это настроенный в Node.js `node_prefix`.

Это в основном для исторических целей.

Настоятельно рекомендуется размещать зависимости в локальной папке `node_modules`. Они будут загружаться быстрее и надежнее.

<!-- 0013.part.md -->

## Обертка модуля

Прежде чем код модуля будет выполнен, Node.js обернет его функцией-оберткой, которая выглядит следующим образом:

```js
(function (
    exports,
    require,
    module,
    __filename,
    __dirname
) {
    // Код модуля на самом деле находится здесь
});
```

Делая это, Node.js достигает нескольких вещей:

-   Переменные верхнего уровня (определенные с помощью `var`, `const` или `let`) привязываются к модулю, а не к глобальному объекту.
-   Это помогает обеспечить некоторые глобальные на вид переменные, которые на самом деле специфичны для модуля, например:
    -   Объекты `module` и `exports`, которые исполнитель может использовать для экспорта значений из модуля.
    -   Удобные переменные `__filename` и `__dirname`, содержащие абсолютное имя файла и путь к каталогу модуля.

<!-- 0014.part.md -->

## Область применения модуля

<!-- 0015.part.md -->

### `__dirname`

-   {строка}

Имя каталога текущего модуля. Это то же самое, что [`path.dirname()`](path.md#pathdirnamepath) из [`__filename`](#__filename).

Пример: запуск `node example.js` из `/Users/mjr`.

```js
console.log(__dirname);
// Prints: /Users/mjr
console.log(path.dirname(__filename));
// Печатает: /Users/mjr
```

<!-- 0016.part.md -->

### `__filename`

-   {строка}

Имя файла текущего модуля. Это абсолютный путь к файлу текущего модуля с разрешенными симлинками.

Для основной программы это имя не обязательно совпадает с именем файла, используемым в командной строке.

Имя каталога текущего модуля смотрите в [`__dirname`](#__dirname).

Примеры:

Запуск `node example.js` из `/Users/mjr`.

```js
console.log(__filename);
// Печатает: /Users/mjr/example.js
console.log(__dirname);
// Печатает: /Users/mjr
```

Даны два модуля: `a` и `b`, где `b` является зависимостью от `a`, а структура каталогов имеет вид:

-   `/Users/mjr/app/a.js`
-   `/Users/mjr/app/node_modules/b/b.js`.

Ссылки на `__filename` в пределах `b.js` вернут `/Users/mjr/app/node_modules/b/b.js`, а ссылки на `__filename` в пределах `a.js` вернут `/Users/mjr/app/a.js`.

<!-- 0017.part.md -->

### `exports`

-   {Object}

Ссылка на `module.exports`, который короче по типу. Смотрите раздел о ярлыке [exports](#exports-shortcut) для подробностей о том, когда использовать `exports` и когда использовать `module.exports`.

<!-- 0018.part.md -->

### `module`

-   {module}

Ссылка на текущий модуль, см. раздел об объекте [`module`](#the-module-object). В частности, `module.exports` используется для определения того, что модуль экспортирует и делает доступным через `require()`.

<!-- 0019.part.md -->

### `require(id)`

-   `id` {строка} имя модуля или путь к нему
-   Возвращает: {любое} экспортированное содержимое модуля

Используется для импорта модулей, `JSON` и локальных файлов. Модули могут быть импортированы из `node_modules`. Локальные модули и JSON файлы могут быть импортированы с использованием относительного пути (например, `./`, `./foo`, `./bar/baz`, `../foo`), который будет разрешен относительно каталога, названного [`__dirname`](#__dirname) (если определен) или текущего рабочего каталога. Относительные пути в стиле POSIX разрешаются независимо от ОС, то есть приведенные выше примеры будут работать на Windows так же, как и на Unix-системах.

```js
// Импортирование локального модуля с путем относительно `__dirname` или текущей
// рабочему каталогу. (В Windows это будет выглядеть как .\path\myLocalModule).
const myLocalModule = require('./path/myLocalModule');

// Импортируем файл JSON:
const jsonData = require('./path/filename.json');

// Импортирование модуля из node_modules или встроенного модуля Node.js:
const crypto = require('node:crypto');
```

<!-- 0020.part.md -->

#### `require.cache`

-   {Object}

Модули кэшируются в этом объекте, когда они требуются. Если удалить значение ключа из этого объекта, то при следующем `require` модуль будет перезагружен. Это не относится к [родным аддонам](addons.md), для которых перезагрузка приведет к ошибке.

Также возможно добавление или замена записей. Этот кэш проверяется перед встроенными модулями, и если в кэш добавлено имя, совпадающее со встроенным модулем, то только `node:`-префиксные вызовы require будут получать встроенный модуль. Используйте с care\!

```js
const assert = require('node:assert');
const realFs = require('node:fs');

const fakeFs = {};
require.cache.fs = { exports: fakeFs };

assert.strictEqual(require('fs'), fakeFs);
assert.strictEqual(require('node:fs'), realFs);
```

<!-- 0021.part.md -->

#### `require.extensions`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

-   {Object}

Указывает `require`, как обрабатывать определенные расширения файлов.

Обрабатывать файлы с расширением `.sjs` как `.js`:

```js
require.extensions['.sjs'] = require.extensions['.js'];
```

**Удалено.** В прошлом этот список использовался для загрузки в Node.js не-JavaScript модулей путем их компиляции по требованию. Однако на практике существуют гораздо лучшие способы сделать это, например, загрузить модули через какую-либо другую программу Node.js или скомпилировать их в JavaScript заранее.

Избегайте использования `require.extensions`. Его использование может вызвать тонкие ошибки, а разрешение расширений становится медленнее с каждым зарегистрированным расширением.

<!-- 0022.part.md -->

#### `require.main`

-   {module | undefined}

Объект `Module`, представляющий сценарий входа, загруженный при запуске процесса Node.js, или `undefined`, если точка входа программы не является модулем CommonJS. Смотрите ["Доступ к главному модулю"](#accessing-the-main-module).

В сценарии `entry.js`:

```js
console.log(require.main);
```

```bash
node entry.js
```

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

<!-- 0023.part.md -->

#### `require.resolve(request[, options])`

-   `request` {string} Путь к модулю для разрешения.
-   `options` {Object}
    -   `paths` {string\[\]} Пути для разрешения местоположения модуля. Если эти пути присутствуют, они используются вместо путей разрешения по умолчанию, за исключением [GLOBAL_FOLDERS](#loading-from-the-global-folders), таких как `$HOME/.node_modules`, которые всегда включаются. Каждый из этих путей используется как начальная точка для алгоритма разрешения модулей, что означает, что иерархия `node_modules` проверяется с этого места.
-   Возвращает: {строка}.

Использует внутренний механизм `require()` для поиска местоположения модуля, но вместо загрузки модуля возвращает только имя разрешенного файла.

Если модуль не может быть найден, выдается ошибка `MODULE_NOT_FOUND`.

<!-- 0024.part.md -->

##### `require.resolve.paths(request)`

-   `request` {string} Путь модуля, пути поиска которого извлекаются.
-   Возвращает: {string\[\]|null}

Возвращает массив, содержащий пути, найденные при разрешении `request`, или `null`, если строка `request` ссылается на основной модуль, например `http` или `fs`.

<!-- 0025.part.md -->

## Объект `module`

-   {Object}

В каждом модуле свободная переменная `module` является ссылкой на объект, представляющий текущий модуль. Для удобства, `module.exports` также доступен через `exports` module-global. На самом деле `module` не является глобальным, а скорее локальным для каждого модуля.

<!-- 0026.part.md -->

### `module.children`

-   {module\[\]}

Объекты модуля, впервые требуемые этим модулем.

<!-- 0027.part.md -->

### `module.exports`

-   {Object}

Объект `module.exports` создается системой `Module`. Иногда это неприемлемо; многие хотят, чтобы их модуль был экземпляром какого-либо класса. Чтобы сделать это, назначьте нужный объект экспорта в `module.exports`. Присвоение нужного объекта в `exports` просто перепривяжет локальную переменную `exports`, что, вероятно, не является желаемым.

Например, предположим, что мы создаем модуль под названием `a.js`:

```js
const EventEmitter = require('node:events');

module.exports = new EventEmitter();

// Выполняем некоторую работу, и через некоторое время выдаем
// событие 'ready' из самого модуля.
setTimeout(() => {
    module.exports.emit('ready');
}, 1000);
```

Затем в другом файле мы можем сделать следующее:

```js
const a = require('./a');
a.on('ready', () => {
    console.log('модуль "a" готов');
});
```

Присвоение `module.exports` должно быть сделано немедленно. Это не может быть сделано ни в каких обратных вызовах. Это не работает:

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

<!-- 0028.part.md -->

#### Ярлык `exports`

Переменная `exports` доступна в области видимости модуля на уровне файлов, и ей присваивается значение `module.exports` перед оценкой модуля.

Она позволяет сократить время, так что `module.exports.f = ...` может быть записано более кратко как `exports.f = ...`. Однако имейте в виду, что, как и любая переменная, если присвоить `exports` новое значение, оно больше не будет связано с `module.exports`:

```js
module.exports.hello = true; // Экспортируется из require модуля
exports = { hello: false }; // Не экспортируется, доступен только в модуле
```

Когда свойство `module.exports` полностью заменяется новым объектом, обычно также переназначают `exports`:

```js
module.exports = exports = function Constructor() {
    // ... и т.д.
};
```

Чтобы проиллюстрировать поведение, представьте эту гипотетическую реализацию `require()`, которая очень похожа на то, что на самом деле делает `require()`:

```js
function require(/* ... */) {
    const module = { exports: {} };
    ((module, exports) => {
        // Код модуля здесь. В этом примере определите функцию.
        function someFunc() {}
        exports = someFunc;
        // На данный момент exports больше не является сокращением до module.exports, и
        // этот модуль по-прежнему будет экспортировать пустой объект по умолчанию.
        module.exports = someFunc;
        // Теперь модуль будет экспортировать someFunc, а не объект по умолчанию.
        // объекта по умолчанию.
    })(module, module.exports);
    return module.exports;
}
```

<!-- 0029.part.md -->

### `module.filename`

-   {строка}

Полностью разрешенное имя файла модуля.

<!-- 0030.part.md -->

### `module.id`

-   {string}

Идентификатор для модуля. Обычно это полностью разрешенное имя файла.

<!-- 0031.part.md -->

### `module.isPreloading`

-   Тип: {boolean} `true`, если модуль запущен во время фазы предварительной загрузки Node.js.

<!-- 0032.part.md -->

### `module.loaded`

-   {boolean}

Завершил ли модуль загрузку или находится в процессе загрузки.

<!-- 0033.part.md -->

### `module.parent`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Пожалуйста, используйте [`require.main`](#requiremain) и [`module.children`](#modulechildren) вместо этого.

-   {module | null | undefined}

Модуль, который первым потребовал данный модуль, или `null`, если текущий модуль является точкой входа текущего процесса, или `undefined`, если модуль был загружен чем-то, что не является модулем CommonJS (например: REPL или `import`).

<!-- 0034.part.md -->

### `module.path`

-   {строка}

Имя каталога модуля. Обычно оно совпадает с [`path.dirname()`](path.md#pathdirnamepath) из [`module.id`](#moduleid).

<!-- 0035.part.md -->

### `module.paths`

-   {string\[\]}

Пути поиска для модуля.

<!-- 0036.part.md -->

### `module.require(id)`

-   `id` {строка}
-   Возвращает: {любое} экспортированное содержимое модуля

Метод `module.require()` предоставляет возможность загрузить модуль так, как если бы `require()` был вызван из исходного модуля.

Для этого необходимо получить ссылку на объект `module`. Поскольку `require()` возвращает `module.exports`, а `module` обычно _только_ доступен в коде конкретного модуля, для использования он должен быть явно экспортирован.
