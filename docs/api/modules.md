---
title: Модули CommonJS
description: Система модулей CommonJS — require, module.exports, кэш, разрешение путей и взаимодействие с ES-модулями
---

# Модули: CommonJS {#modules-commonjs-modules}

!!!success "Стабильность: 2 – Стабильная"

**Модули CommonJS** — изначальный способ упаковки кода JavaScript для Node.js. Node.js также поддерживает стандарт [модулей ECMAScript](esm.md), который используют браузеры и другие среды выполнения JavaScript.

В Node.js каждый файл считается отдельным модулем. Например, рассмотрим файл с именем `foo.js`:

```js
const circle = require('./circle.js');
console.log(
    `The area of a circle of radius 4 is ${circle.area(4)}`
);
```

В первой строке `foo.js` загружает модуль `circle.js`, который находится в том же каталоге, что и `foo.js`.

Содержимое `circle.js`:

```js
const { PI } = Math;

exports.area = (r) => PI * r ** 2;

exports.circumference = (r) => 2 * PI * r;
```

Модуль `circle.js` экспортировал функции `area()` и `circumference()`. Функции и объекты добавляются в корень модуля через дополнительные свойства специального объекта `exports`.

Локальные переменные модуля будут приватными, потому что модуль оборачивается в функцию Node.js (см. [обёртку модуля](#the-module-wrapper)). В этом примере переменная `PI` приватна для `circle.js`.

Свойству `module.exports` можно присвоить новое значение (например, функцию или объект).

В следующем коде `bar.js` использует модуль `square`, который экспортирует класс Square:

```js
const Square = require('./square.js');
const mySquare = new Square(2);
console.log(`The area of mySquare is ${mySquare.area()}`);
```

Модуль `square` определён в `square.js`:

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

Система модулей CommonJS реализована во [встроенном модуле `module`](module.md).

## Включение {#enabling}

У Node.js две системы модулей: CommonJS и [модули ECMAScript](esm.md).

По умолчанию Node.js считает модулями CommonJS следующее:

-   Файлы с расширением `.cjs`.

-   Файлы с расширением `.js` или без расширения, если ближайший родительский файл `package.json` содержит поле верхнего уровня [`"type"`](packages.md#type) со значением `"commonjs"`.

-   Файлы с расширением `.js` или без расширения, если ближайший родительский `package.json` не содержит поля верхнего уровня [`"type"`](packages.md#type) или в родительских папках нет `package.json`; если только файл не содержит синтаксиса, который вызовет ошибку, если его не оценивать как ES-модуль. Авторам пакетов следует указывать поле [`"type"`](packages.md#type), даже если все исходники — CommonJS. Явное указание `type` пакета упрощает работу инструментов сборки и загрузчиков при определении того, как интерпретировать файлы пакета.

-   Файлы с расширением, отличным от `.mjs`, `.cjs`, `.json`, `.node` и `.js`, если ближайший родительский `package.json` содержит поле верхнего уровня [`"type"`](packages.md#type) со значением `"module"`.

Подробнее см. [Определение системы модулей](packages.md#determining-module-system).

Вызов `require()` всегда использует загрузчик модулей CommonJS. Вызов `import()` всегда использует загрузчик модулей ECMAScript.

## Доступ к главному модулю {#accessing-the-main-module}

Когда файл запускается напрямую из Node.js, `require.main` указывает на его `module`. Значит, можно определить, запущен ли файл напрямую, проверкой `require.main === module`.

Для файла `foo.js` это будет `true`, если он запущен как `node foo.js`, и `false`, если через `require('./foo')`.

Если точка входа не является модулем CommonJS, `require.main` равен `undefined`, и главный модуль недоступен.

## Советы по менеджерам пакетов {#package-manager-tips}

Семантика функции Node.js `require()` рассчитана на достаточно общую поддержку разумных структур каталогов. Программы менеджеров пакетов вроде `dpkg`, `rpm` и `npm` могут собирать нативные пакеты из модулей Node.js без изменений.

Ниже приведена предлагаемая структура каталогов:

Пусть каталог `/usr/lib/node/<some-package>/<some-version>` хранит содержимое конкретной версии пакета.

Пакеты могут зависеть друг от друга. Чтобы установить пакет `foo`, может понадобиться конкретная версия пакета `bar`. У `bar` могут быть свои зависимости, иногда они конфликтуют или образуют циклы.

Поскольку Node.js вычисляет `realpath` для загружаемых модулей (разрешает симлинки) и затем [ищет зависимости в каталогах `node_modules`](#loading-from-node_modules-folders), ситуацию можно разрешить такой схемой:

-   `/usr/lib/node/foo/1.2.3/`: содержимое пакета `foo`, версия 1.2.3.
-   `/usr/lib/node/bar/4.3.2/`: содержимое пакета `bar`, от которого зависит `foo`.
-   `/usr/lib/node/foo/1.2.3/node_modules/bar`: символическая ссылка на `/usr/lib/node/bar/4.3.2/`.
-   `/usr/lib/node/bar/4.3.2/node_modules/*`: символические ссылки на пакеты, от которых зависит `bar`.

Таким образом, даже при цикле или конфликтах зависимостей каждый модуль получит подходящую версию своей зависимости.

Когда код пакета `foo` вызывает `require('bar')`, подставляется версия по симлинку в `/usr/lib/node/foo/1.2.3/node_modules/bar`. Когда код пакета `bar` вызывает `require('quux')`, подставляется версия по симлинку в `/usr/lib/node/bar/4.3.2/node_modules/quux`.

Чтобы ускорить поиск модулей, вместо прямого размещения в `/usr/lib/node` можно класть пакеты в `/usr/lib/node_modules/<name>/<version>`. Тогда Node.js не будет искать отсутствующие зависимости в `/usr/node_modules` или `/node_modules`.

Чтобы модули были доступны в REPL Node.js, полезно добавить каталог `/usr/lib/node_modules` в переменную окружения `$NODE_PATH`. Поиск через каталоги `node_modules` относительный и опирается на реальный путь файлов, вызывающих `require()`, поэтому сами пакеты могут находиться где угодно.

## Загрузка ECMAScript-модулей через `require()` {#loading-ecmascript-modules-using-require}

Расширение `.mjs` зарезервировано для [ECMAScript Modules](esm.md). См. раздел [Определение системы модулей](packages.md#determining-module-system), какие файлы разбираются как ECMAScript-модули.

`require()` поддерживает загрузку ECMAScript-модулей только при выполнении условий:

-   модуль полностью синхронный (без top-level `await`); и
-   выполняется одно из условий:
    1.  у файла расширение `.mjs`;
    2.  у файла расширение `.js`, и ближайший `package.json` содержит `"type": "module"`;
    3.  у файла расширение `.js`, ближайший `package.json` не содержит `"type": "commonjs"`, и в модуле есть синтаксис ES-модуля.

Если загружаемый ES-модуль удовлетворяет требованиям, `require()` может загрузить его и вернуть [объект пространства имён модуля](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object). Поведение похоже на динамический `import()`, но выполняется синхронно и сразу возвращает объект пространства имён.

Пример ES-модулей:

=== "MJS"

    ```js
    // distance.mjs
    export function distance(a, b) { return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2); }
    ```

=== "MJS"

    ```js
    // point.mjs
    export default class Point {
      constructor(x, y) { this.x = x; this.y = y; }
    }
    ```

Их может загрузить модуль CommonJS через `require()`:

=== "CJS"

    ```js
    const distance = require('./distance.mjs');
    console.log(distance);
    // [Module: null prototype] {
    //   distance: [Function: distance]
    // }

    const point = require('./point.mjs');
    console.log(point);
    // [Module: null prototype] {
    //   default: [class Point],
    //   __esModule: true,
    // }
    ```

Для совместимости с инструментами, переводящими ES-модули в CommonJS и затем загружающими настоящие ES-модули через `require()`, в возвращаемом пространстве имён может быть свойство `__esModule: true`, если есть экспорт `default`, чтобы сгенерированный код распознавал default-экспорт. Если `__esModule` уже задано, оно не добавляется. Свойство экспериментальное и может измениться. Его должны использовать только инструменты конвертации ES → CommonJS по принятым в экосистеме соглашениям. Код, написанный напрямую на CommonJS, не должен от него зависеть.

Результат `require()` — [объект пространства имён модуля](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import#module_namespace_object): default-экспорт лежит в свойстве `.default`, как при `import()`. Чтобы задать, что именно вернёт `require(esm)` напрямую, ES-модуль может экспортировать нужное значение под строковым именем `"module.exports"`.

=== "MJS"

    ```js
    // point.mjs
    export default class Point {
      constructor(x, y) { this.x = x; this.y = y; }
    }

    // `distance` is lost to CommonJS consumers of this module, unless it's
    // added to `Point` as a static property.
    export function distance(a, b) { return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2); }
    export { Point as 'module.exports' }
    ```

=== "CJS"

    ```js
    const Point = require('./point.mjs');
    console.log(Point); // [class Point]

    // Named exports are lost when 'module.exports' is used
    const { distance } = require('./point.mjs');
    console.log(distance); // undefined
    ```

В примере выше при использовании экспорта с именем `module.exports` именованные экспорты недоступны потребителям CommonJS. Чтобы они сохранили доступ к именованным экспортам, можно сделать default-экспорт объектом со свойствами-экспортами. В этом примере `distance` можно привязать к default-экспорту — классу `Point` — как статический метод.

=== "MJS"

    ```js
    export function distance(a, b) { return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2); }

    export default class Point {
      constructor(x, y) { this.x = x; this.y = y; }
      static distance = distance;
    }

    export { Point as 'module.exports' }
    ```

=== "CJS"

    ```js
    const Point = require('./point.mjs');
    console.log(Point); // [class Point]

    const { distance } = require('./point.mjs');
    console.log(distance); // [Function: distance]
    ```

Если в `require()`-ном модуле есть top-level `await` или в графе его `import` есть top-level `await`, выбрасывается [`ERR_REQUIRE_ASYNC_MODULE`](errors.md#err_require_async_module). В этом случае асинхронный модуль нужно загружать через [`import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import).

При включённом `--experimental-print-required-tla` вместо выброса `ERR_REQUIRE_ASYNC_MODULE` до выполнения Node.js выполнит модуль, попытается найти top-level await и выведет их расположение, чтобы упростить исправление.

Если поддержка загрузки ES-модулей через `require()` даёт неожиданные сбои, её можно отключить флагом `--no-require-module`. Чтобы вывести места использования этой возможности, используйте [`--trace-require-module`](cli.md#--trace-require-modulemode).

Наличие возможности проверяется по [`process.features.require_module`](process.md#processfeaturesrequire_module) === `true`.

## Всё вместе {#all-together}

Чтобы узнать точное имя файла, которое загрузит `require()`, используйте `require.resolve()`.

Ниже псевдокод высокоуровневого алгоритма работы `require()`:

```text
require(X) from module at path Y
1. If X is a core module,
   a. return the core module
   b. STOP
2. If X begins with '/'
   a. set Y to the file system root
3. If X is equal to '.', or X begins with './', '/' or '../'
   a. LOAD_AS_FILE(Y + X)
   b. LOAD_AS_DIRECTORY(Y + X)
   c. THROW "not found"
4. If X begins with '#'
   a. LOAD_PACKAGE_IMPORTS(X, dirname(Y))
5. LOAD_PACKAGE_SELF(X, dirname(Y))
6. LOAD_NODE_MODULES(X, dirname(Y))
7. THROW "not found"

MAYBE_DETECT_AND_LOAD(X)
1. If X parses as a CommonJS module, load X as a CommonJS module. STOP.
2. Else, if the source code of X can be parsed as ECMAScript module using
  <a href="esm.md#resolver-algorithm-specification">DETECT_MODULE_SYNTAX defined in
  the ESM resolver</a>,
  a. Load X as an ECMAScript module. STOP.
3. THROW the SyntaxError from attempting to parse X as CommonJS in 1. STOP.

LOAD_AS_FILE(X)
1. If X is a file, load X as its file extension format. STOP
2. If X.js is a file,
    a. Find the closest package scope SCOPE to X.
    b. If no scope was found
      1. MAYBE_DETECT_AND_LOAD(X.js)
    c. If the SCOPE/package.json contains "type" field,
      1. If the "type" field is "module", load X.js as an ECMAScript module. STOP.
      2. If the "type" field is "commonjs", load X.js as a CommonJS module. STOP.
    d. MAYBE_DETECT_AND_LOAD(X.js)
3. If X.json is a file, load X.json to a JavaScript Object. STOP
4. If X.node is a file, load X.node as binary addon. STOP

LOAD_INDEX(X)
1. If X/index.js is a file
    a. Find the closest package scope SCOPE to X.
    b. If no scope was found, load X/index.js as a CommonJS module. STOP.
    c. If the SCOPE/package.json contains "type" field,
      1. If the "type" field is "module", load X/index.js as an ECMAScript module. STOP.
      2. Else, load X/index.js as a CommonJS module. STOP.
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
   a. if PARTS[I] = "node_modules", GOTO d.
   b. DIR = path join(PARTS[0 .. I] + "node_modules")
   c. DIRS = DIRS + DIR
   d. let I = I - 1
5. return DIRS + GLOBAL_FOLDERS

LOAD_PACKAGE_IMPORTS(X, DIR)
1. Find the closest package scope SCOPE to DIR.
2. If no scope was found, return.
3. If the SCOPE/package.json "imports" is null or undefined, return.
4. If `--no-require-module` is not enabled
  a. let CONDITIONS = ["node", "require", "module-sync"]
  b. Else, let CONDITIONS = ["node", "require"]
5. let MATCH = PACKAGE_IMPORTS_RESOLVE(X, pathToFileURL(SCOPE),
  CONDITIONS) <a href="esm.md#resolver-algorithm-specification">defined in the ESM resolver</a>.
6. RESOLVE_ESM_MATCH(MATCH).

LOAD_PACKAGE_EXPORTS(X, DIR)
1. Try to interpret X as a combination of NAME and SUBPATH where the name
   may have a @scope/ prefix and the subpath begins with a slash (`/`).
2. If X does not match this pattern or DIR/NAME/package.json is not a file,
   return.
3. Parse DIR/NAME/package.json, and look for "exports" field.
4. If "exports" is null or undefined, return.
5. If `--no-require-module` is not enabled
  a. let CONDITIONS = ["node", "require", "module-sync"]
  b. Else, let CONDITIONS = ["node", "require"]
6. let MATCH = PACKAGE_EXPORTS_RESOLVE(pathToFileURL(DIR/NAME), "." + SUBPATH,
   `package.json` "exports", CONDITIONS) <a href="esm.md#resolver-algorithm-specification">defined in the ESM resolver</a>.
7. RESOLVE_ESM_MATCH(MATCH)

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
1. let RESOLVED_PATH = fileURLToPath(MATCH)
2. If the file at RESOLVED_PATH exists, load RESOLVED_PATH as its extension
   format. STOP
3. THROW "not found"
```

## Кэширование {#caching}

Модули кэшируются после первой загрузки. В частности, каждый вызов `require('foo')` возвращает один и тот же объект, если он разрешается в тот же файл.

Пока `require.cache` не меняли, повторные `require('foo')` не приводят к повторному выполнению кода модуля. Это важно: можно вернуть «частично готовые» объекты и загружать транзитивные зависимости даже при циклах.

Чтобы код модуля выполнялся несколько раз, экспортируйте функцию и вызывайте её.

### Ограничения кэша модулей

Кэш привязан к разрешённому имени файла. Так как модуль может разрешаться в разные файлы в зависимости от места вызывающего модуля (загрузка из `node_modules`), нет _гарантии_, что `require('foo')` всегда вернёт один и тот же объект при разных файлах.

Кроме того, на файловых системах без учёта регистра разные разрешённые имена могут указывать на один файл, но кэш считает их разными модулями и перезагружает файл. Например, `require('./foo')` и `require('./FOO')` дают два разных объекта, независимо от того, один это файл или нет.

## Встроенные модули {#built-in-modules}

В Node.js несколько модулей встроено в бинарник; они подробнее описаны в других разделах документации.

Встроенные модули определены в исходниках Node.js в каталоге `lib/`.

Их можно запрашивать с префиксом `node:` — тогда обходится кэш `require`. Например, `require('node:http')` всегда возвращает встроенный HTTP-модуль, даже если в `require.cache` есть запись с таким именем.

Некоторые встроенные модули всегда имеют приоритет при передаче идентификатора в `require()`. Например, `require('http')` всегда даёт встроенный HTTP-модуль, даже если есть файл с таким именем.

Список всех встроенных модулей — в [`module.builtinModules`](module.md#modulebuiltinmodules). Имена перечислены без префикса `node:`, кроме модулей, для которых префикс обязателен (см. ниже).

### Встроенные модули с обязательным префиксом `node:` {#built-in-modules-with-mandatory-node-prefix}

При загрузке через `require()` некоторые встроенные модули нужно запрашивать с префиксом `node:`. Это снижает риск конфликта с пакетами пользователя с тем же именем. Сейчас префикс `node:` обязателен для:

-   [`node:sea`](single-executable-applications.md#single-executable-application-api)
-   [`node:sqlite`](sqlite.md)
-   [`node:test`](test.md)
-   [`node:test/reporters`](test.md#test-reporters)

Список этих модулей есть в [`module.builtinModules`](module.md#modulebuiltinmodules), с префиксом.

## Циклы {#cycles}

При циклических вызовах `require()` модуль может быть возвращён до завершения выполнения.

Пример:

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

Когда `main.js` загружает `a.js`, тот загружает `b.js`. В этот момент `b.js` пытается загрузить `a.js`. Чтобы избежать бесконечного цикла, модулю `b.js` возвращается **незавершённая копия** объекта экспорта `a.js`. Затем `b.js` догружается, и его `exports` передаётся модулю `a.js`.

К моменту, когда `main.js` загрузил оба модуля, они уже выполнены. Вывод программы:

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

Циклические зависимости требуют продуманной организации кода.

## Файлы как модули

Если файл с точным именем не найден, Node.js пробует добавить расширения `.js`, `.json` и наконец `.node`. Для другого расширения (например `.cjs`) нужно передать в `require()` полное имя включая расширение (например `require('./file.cjs')`).

Файлы `.json` разбираются как JSON, `.node` — как скомпилированные аддоны через `process.dlopen()`. С любыми другими расширениями или без расширения файл обрабатывается как JavaScript. См. [Определение системы модулей](packages.md#determining-module-system), какой режим разбора применяется.

Путь, начинающийся с `'/'`, — абсолютный путь к файлу. Например, `require('/home/marco/foo.js')` загрузит `/home/marco/foo.js`.

Путь с префиксом `'./'` задаётся относительно файла, вызывающего `require()`. То есть `circle.js` должен лежать в том же каталоге, что и `foo.js`, чтобы `require('./circle')` его нашёл.

Без ведущего `'/'`, `'./'` или `'../'` модуль должен быть встроенным или загружаться из `node_modules`.

Если путь не существует, `require()` выбрасывает [`MODULE_NOT_FOUND`](errors.md#module_not_found).

## Каталоги как модули {#folders-as-modules}

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого [экспорты подпутей](packages.md#subpath-exports) или [импорты подпутей](packages.md#subpath-imports).

Передать в `require()` каталог можно тремя способами.

Первый — создать в корне каталога [`package.json`](packages.md#nodejs-packagejson-field-definitions) с полем `main`. Пример [`package.json`](packages.md#nodejs-packagejson-field-definitions):

```json
{ "name": "some-library", "main": "./lib/some-library.js" }
```

Если каталог — `./some-library`, то `require('./some-library')` попытается загрузить `./some-library/lib/some-library.js`.

Если в каталоге нет [`package.json`](packages.md#nodejs-packagejson-field-definitions), или поле [`"main"`](packages.md#main) отсутствует или не разрешается, Node.js ищет `index.js` или `index.node` в этом каталоге. Например, без [`package.json`](packages.md#nodejs-packagejson-field-definitions) в примере выше `require('./some-library')` попытается загрузить:

-   `./some-library/index.js`
-   `./some-library/index.node`

Если и это не удалось, Node.js сообщает, что модуль не найден:

```console
Error: Cannot find module 'some-library'
```

Во всех трёх случаях вызов `import('./some-library')` даст ошибку [`ERR_UNSUPPORTED_DIR_IMPORT`](errors.md#err_unsupported_dir_import). [экспорты подпутей](packages.md#subpath-exports) или [импорты подпутей](packages.md#subpath-imports) дают схожую инкапсуляцию, как у каталогов-модулей, и работают и с `require`, и с `import`.

## Загрузка из каталогов `node_modules` {#loading-from-node_modules-folders}

Если идентификатор для `require()` — не [встроенный](#built-in-modules) модуль и не начинается с `'/'`, `'../'` или `'./'`, Node.js начинает с каталога текущего модуля, добавляет `/node_modules` и пытается загрузить модуль оттуда. К пути, уже оканчивающемуся на `node_modules`, ещё один `node_modules` не добавляется.

Если не найдено, поиск поднимается к родительскому каталогу и так далее до корня файловой системы.

Например, если файл `'/home/ry/projects/foo.js'` вызывает `require('bar.js')`, порядок поиска:

-   `/home/ry/projects/node_modules/bar.js`
-   `/home/ry/node_modules/bar.js`
-   `/home/node_modules/bar.js`
-   `/node_modules/bar.js`

Так зависимости можно локализовать и избежать конфликтов.

Можно подключать конкретные файлы или подмодули пакета, указав суффикс пути после имени. Например, `require('example-module/path/to/file')` разрешит `path/to/file` относительно расположения `example-module`. Для суффикса действуют те же правила разрешения.

## Загрузка из глобальных каталогов {#loading-from-the-global-folders}

Если задана переменная окружения `NODE_PATH` со списком абсолютных путей через двоеточие, Node.js ищет модули и там, если не нашла раньше.

В Windows разделитель `NODE_PATH` — точка с запятой (`;`), не двоеточие.

`NODE_PATH` изначально добавляли для загрузки с разных путей до появления нынешнего [алгоритма разрешения модулей](#all-together).

`NODE_PATH` по-прежнему поддерживается, но реже нужен: в экосистеме принят поиск через локальные `node_modules`. Развёртывания на `NODE_PATH` иногда ведут себя неожиданно, если переменную забыли задать. Смена зависимостей может привести к загрузке другой версии при обходе `NODE_PATH`.

Дополнительно Node.js ищет в списке GLOBAL_FOLDERS:

-   1: `$HOME/.node_modules`
-   2: `$HOME/.node_libraries`
-   3: `$PREFIX/lib/node`

Здесь `$HOME` — домашний каталог пользователя, `$PREFIX` — префикс установки Node.js (`node_prefix`).

В основном это наследие прошлого.

Настоятельно рекомендуется держать зависимости в локальном `node_modules` — так быстрее и надёжнее.

## Обёртка модуля {#the-module-wrapper}

Перед выполнением кода модуля Node.js оборачивает его в функцию вида:

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

Так Node.js:

-   ограничивает область видимости переменных верхнего уровня (`var`, `const`, `let`) модулем, а не глобальным объектом;
-   даёт переменные, похожие на глобальные, но привязанные к модулю:
    -   объекты `module` и `exports` для экспорта значений;
    -   `__filename` и `__dirname` — абсолютный путь к файлу и к каталогу модуля.

## Область видимости модуля {#the-module-scope}

<!-- markdownlint-disable MD051 -->

### Переменная `__dirname` {#__dirname}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя каталога текущего модуля. Совпадает с [`path.dirname()`](path.md#pathdirnamepath) от [`__filename`](#__filename).

Пример: запуск `node example.js` из `/Users/mjr`

```js
console.log(__dirname);
// Prints: /Users/mjr
console.log(path.dirname(__filename));
// Prints: /Users/mjr
```

### Переменная `__filename` {#__filename}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя файла текущего модуля — абсолютный путь с разрешёнными симлинками.

Для главной программы это не обязательно то же имя, что в командной строке.

См. [`__dirname`](#__dirname) для каталога текущего модуля.

Примеры:

Запуск `node example.js` из `/Users/mjr`

```js
console.log(__filename);
// Prints: /Users/mjr/example.js
console.log(__dirname);
// Prints: /Users/mjr
```

Два модуля: `a` и `b`, где `b` — зависимость `a`, структура каталогов:

-   `/Users/mjr/app/a.js`
-   `/Users/mjr/app/node_modules/b/b.js`

В `b.js` ссылки на `__filename` дают `/Users/mjr/app/node_modules/b/b.js`, в `a.js` — `/Users/mjr/app/a.js`.

### `exports` {#exports}

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Сокращение для `module.exports`. См. [сокращение exports](#exports-shortcut), когда использовать `exports`, а когда `module.exports`.

### `module` {#module}

-   Тип: [`<module>`](modules.md#module)

Ссылка на текущий модуль, см. объект [`module` object](#the-module-object). `module.exports` задаёт, что модуль экспортирует и отдаёт через `require()`.

### `require(id)` {#requireid}

-   `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя модуля или путь
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Экспортированное содержимое модуля

Импорт модулей, `JSON` и локальных файлов. Модули из `node_modules`, локальные файлы и JSON — через относительный путь (например `./`, `./foo`, `./bar/baz`, `../foo`), разрешаемый относительно [`__dirname`](#__dirname) (если есть) или текущего рабочего каталога. Относительные пути в стиле POSIX разрешаются одинаково на разных ОС, в том числе в Windows как в Unix.

```js
// Importing a local module with a path relative to the `__dirname` or current
// working directory. (On Windows, this would resolve to .\path\myLocalModule.)
const myLocalModule = require('./path/myLocalModule');

// Importing a JSON file:
const jsonData = require('./path/filename.json');

// Importing a module from node_modules or Node.js built-in module:
const crypto = require('node:crypto');
```

#### `require.cache` {#requirecache}

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Здесь кэшируются загруженные модули. Удалив ключ, следующий `require` перезагрузит модуль. Не действует для [нативных аддонов](addons.md) — повторная загрузка вызовет ошибку.

Записи можно добавлять и заменять. Кэш проверяется до встроенных модулей; если имя совпадает со встроенным, встроенный модуль получат только вызовы с префиксом `node:`. Пользуйтесь осторожно!

```js
const assert = require('node:assert');
const realFs = require('node:fs');

const fakeFs = {};
require.cache.fs = { exports: fakeFs };

assert.strictEqual(require('fs'), fakeFs);
assert.strictEqual(require('node:fs'), realFs);
```

#### `require.extensions` {#requireextensions}

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Задаёт обработку расширений файлов для `require`.

Обрабатывать `.sjs` как `.js`:

```js
require.extensions['.sjs'] = require.extensions['.js'];
```

**Устарело.** Раньше список использовали для подгрузки не-JS модулей с компиляцией на лету. Сейчас лучше загружать через отдельную программу или заранее компилировать в JavaScript.

Избегайте `require.extensions` — возможны тонкие ошибки, а каждое новое расширение замедляет разрешение.

#### `require.main` {#requiremain}

-   Тип: [`<module>`](modules.md#module) | undefined

Объект `Module` для сценария входа при запуске процесса Node.js, или `undefined`, если точка входа не CommonJS-модуль. См. [«Доступ к главному модулю»](#accessing-the-main-module).

В скрипте `entry.js`:

```js
console.log(require.main);
```

---

```bash
node entry.js
```

---

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

Добавлено в: v0.3.0

-   `request` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь модуля, который нужно разрешить.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `paths` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Каталоги для разрешения модуля. Если заданы, используются вместо путей по умолчанию, кроме [GLOBAL_FOLDERS](#loading-from-the-global-folders) вроде `$HOME/.node_modules` — они всегда учитываются. Каждый путь — стартовая точка для алгоритма разрешения, то есть от неё проверяется иерархия `node_modules`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Внутренний механизм `require()` для поиска файла модуля без его загрузки — возвращается разрешённый путь.

Если модуль не найден, выбрасывается `MODULE_NOT_FOUND`.

##### `require.resolve.paths(request)` {#requireresolvepathsrequest}

-   `request` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь модуля, для которого нужно получить пути поиска.
-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Массив путей, просмотренных при разрешении `request`, или `null`, если `request` — встроенный модуль, например `http` или `fs`.

## Объект `module` {#the-module-object}

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

В каждом модуле свободная переменная `module` — ссылка на объект текущего модуля. Для удобства к `module.exports` есть доступ через глобальную для модуля переменную `exports`. Сама `module` не глобальна, а локальна для модуля.

### `module.children` {#modulechildren}

-   Тип: [`<module[]>`](modules.md#module)

Объекты модулей, которые этот модуль впервые подключил через `require`.

### `module.exports` {#moduleexports}

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект `module.exports` создаётся системой `Module`. Иногда нужен не он, а, например, экземпляр класса — тогда присвойте `module.exports` нужный объект. Присвоение того же объекта переменной `exports` лишь перепривяжет локальную `exports`, что обычно не то, что нужно.

Пример модуля `a.js`:

```js
const EventEmitter = require('node:events');

module.exports = new EventEmitter();

// Do some work, and after some time emit
// the 'ready' event from the module itself.
setTimeout(() => {
    module.exports.emit('ready');
}, 1000);
```

В другом файле:

```js
const a = require('./a');
a.on('ready', () => {
    console.log('module "a" is ready');
});
```

Присваивание `module.exports` должно быть сразу, не в колбэках. Так не сработает:

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

#### Сокращение `exports` {#exports-shortcut}

Переменная `exports` есть в области файла модуля и до выполнения равна `module.exports`.

Это сокращение: `module.exports.f = ...` можно писать как `exports.f = ...`. Но при присвоении `exports` нового значения она перестаёт указывать на `module.exports`:

```js
module.exports.hello = true; // Exported from require of module
exports = { hello: false }; // Not exported, only available in the module
```

Когда `module.exports` полностью заменяют новым объектом, часто одновременно переприсваивают `exports`:

```js
module.exports = exports = function Constructor() {
    // ... etc.
};
```

Иллюстративная упрощённая модель `require()`, близкая к реальности:

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

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Полностью разрешённое имя файла модуля.

### `module.id` {#moduleid}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Идентификатор модуля. Обычно это полностью разрешённое имя файла.

### `module.isPreloading` {#moduleispreloading}

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если модуль выполняется на фазе предзагрузки Node.js.

### `module.loaded` {#moduleloaded}

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Загрузка модуля завершена или ещё идёт.

### `module.parent` {#moduleparent}

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Используйте вместо этого [`require.main`](#requiremain) и
    [`module.children`](#modulechildren).

-   Тип: [`<module>`](modules.md#module) | null | undefined

Модуль, который первым подключил этот, или `null`, если текущий модуль — точка входа процесса, или `undefined`, если загрузчик не CommonJS (например REPL или `import`).

### `module.path` {#modulepath}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Каталог модуля. Обычно совпадает с [`path.dirname()`](path.md#pathdirnamepath) от [`module.id`](#moduleid).

### `module.paths`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Пути поиска для модуля.

### `module.require(id)` {#modulerequireid}

-   `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Экспортированное содержимое модуля

`module.require()` загружает модуль так, как если бы `require()` вызвали из исходного модуля.

Нужна ссылка на объект `module`: `require()` возвращает `module.exports`, а сам `module` обычно доступен только внутри кода модуля, поэтому его иногда явно экспортируют.

## Объект `Module` {#class-module}

Раздел перенесён в [Модули: встроенный модуль `module`](module.md#the-module-object).

-   [`module.builtinModules`](module.md#modulebuiltinmodules)
-   [`module.createRequire(filename)`](module.md#modulecreaterequirefilename)
-   [`module.syncBuiltinESMExports()`](module.md#modulesyncbuiltinesmexports)

## Поддержка карт исходного кода v3

Раздел перенесён в [Модули: встроенный модуль `module`](module.md#source-map-support).

-   [`module.findSourceMap(path)`](module.md#module_module_findsourcemap_path_error)
-   [Класс: `module.SourceMap`](module.md#class-modulesourcemap)
    -   [`new SourceMap(payload)`](module.md#new-sourcemappayload--linelengths-)
    -   [`sourceMap.payload`](module.md#sourcemappayload)
    -   [`sourceMap.findEntry(lineOffset, columnOffset)`](module.md#sourcemapfindentrylineoffset-columnoffset)
