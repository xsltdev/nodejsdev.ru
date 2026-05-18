---
description: Алгоритм разрешения модулей Node.js — node_modules, package.json, exports и imports
---

# Алгоритм разрешения модулей Node.js: node_modules и exports

Источник: [theNodeBook — Node.js Module Resolution](https://www.thenodebook.com/modules/resolution-algorithm)

Разрешение модулей в Node.js превращает спецификатор в `import` или `require` в конкретную запись модуля. Механика охватывает встроенные спецификаторы, относительные и абсолютные пути, имена пакетов, подъём по `node_modules` и метаданные из `package.json`. CommonJS и ESM разделяют ряд концепций, но правила резолвера у них разные.

## Как работает разрешение модулей в Node.js

Разрешение сильно опирается на метаданные. `package.json` может перенаправлять точки входа, скрывать файлы, задавать условные ветки и менять формат модуля. `require.resolve()` показывает результат для CommonJS. ESM-разрешение использует URL и более строгие правила для пакетов. Симлинки, self reference и conditional exports делают родительский модуль частью итогового результата.

Каждый вызов `require()` начинается со строки. `'fs'`. `'./utils'`. `'lodash'`. Просто строка. И Node должен превратить её в абсолютный путь к реальным байтам на диске. Алгоритм, который это делает, сложнее, чем кажется: он ветвится по первому символу спецификатора, выполняет синхронные обращения к файловой системе и поднимается по дереву каталогов к корню.

За полтора десятилетия релизов Node процесс уточняли, но ядро логики с ранних времён не менялось принципиально. Другое дело поля `"exports"` и `"imports"` в `package.json` — они накладывают на классический обход файловой системы систему, похожую на разрешения. Полная ментальная модель — старая и новая — превращает отладку `MODULE_NOT_FOUND` из минут в секунды.

## Три категории спецификаторов

Алгоритм смотрит на строку в `require()` и сразу относит её к одной из трёх категорий. Категория определяет ветку кода.

**Встроенные модули** — спецификаторы из внутреннего реестра нативных модулей Node: `'fs'`, `'path'`, `'http'`, `'crypto'` и фиксированный список. Они разрешаются первыми, до любого доступа к файловой системе. Можно явно писать `'node:fs'`.

**Относительные и абсолютные пути** начинаются с `'./'`, `'../'` или `'/'`. Разрешаются относительно каталога вызывающего модуля. `require('./utils')` в файле `/home/app/src/lib/foo.js` ищет что-то в `/home/app/src/lib/utils` (с проверкой расширений — ниже).

**Bare-спецификаторы** — всё остальное: `'lodash'`, `'@scope/pkg'`, `'express/lib/router'`. Запускают алгоритм подъёма по `node_modules` — самую сложную ветку.

Классификация выполняется в `Module._resolveFilename()` — точке входа всего CJS-разрешения. Одна цепочка `if`: сначала встроенные, затем пути, затем bare. Порядок важен.

## Встроенные модули

Встроенные модули обходят весь процесс разрешения. При `require('fs')` Node проверяет внутреннюю карту `NativeModule` (объект, заполненный при старте из списка скомпилированных модулей). Совпадение — и сразу ссылка на exports встроенного модуля. Без файловой системы, без `stat`, без манипуляций с путями.

```javascript
const fs = require('fs');
const also_fs = require('node:fs');
```

Обе строки ведут к одному встроенному модулю. Префикс `node:` появился в Node 14.18 / 16.0, чтобы отделить встроенные модули от npm-пакетов с тем же именем. До `node:` теоретически пакет `fs` на npm мог бы перехватить `require('fs')`, но проверка встроенных идёт раньше — встроенный побеждает. Префикс `node:` делает намерение однозначным. Некоторые новые встроенные модули (например, `node:test`) доступны только с префиксом.

Нюанс: проверка опирается на жёсткий список, и в нём есть модули, которые кажутся userland: `'assert'`, `'util'`, `'string_decoder'`. Локальный `assert.js` и `require('assert')` всегда дадут встроенный модуль. Свой файл загрузится только через `require('./assert')`.

Полный список доступен в рантайме:

```javascript
const builtins = require('module').builtinModules;
console.log(builtins.length, builtins.slice(0, 5));
```

В Node 24 `builtinModules` возвращает около 80 записей — и с префиксом (`'node:fs'`), и без (`'fs'`). Внутренние модули с `_` (например, `_http_agent` или `_stream_readable`) в старых версиях были в публичном списке, но постепенно убрали. В бинарнике они ещё есть — иногда загружаются через `require('_http_agent')` — но полагаться на них при обновлениях Node рискованно.

## Относительные и абсолютные пути

Если спецификатор начинается с `./`, `../` или `/`, Node трактует его как путь в файловой системе. Относительные пути считаются от `__dirname` вызывающего модуля. Абсолютный используется как есть.

Разрешённый путь проходит серию проб. Node не ищет только точное имя файла — пробует расширения и проверяет каталоги.

### Проверка расширений

`require('./utils')` без файла буквально named `utils` (без расширения) приводит к перебору в таком порядке:

1.  `.js`
2.  `.json`
3.  `.node`

Каждая попытка — внутренний `stat`, существует ли файл. Побеждает первое совпадение. Если в каталоге есть и `utils.js`, и `utils.json`, `require('./utils')` загрузит `utils.js`.

```javascript
require('./config');
```

Строка может разрешиться в `config.js`, `config.json` или `config.node`. Расширение `.node` — скомпилированный C++-аддон (разделяемая библиотека). `.json` вызывает `JSON.parse()` содержимого. `.js` проходит через обёртку модуля и выполняется как JavaScript (см. [предыдущую главу про `require()`](./cjs-require.md)).

У каждого расширения свой обработчик в `Module._extensions`. Теоретически можно добавить свой:

```javascript
require.extensions['.txt'] = function (module, filename) {
    const content = require('fs').readFileSync(
        filename,
        'utf8'
    );
    module.exports = content;
};
```

Механизм устарел годами, но в Node 24 всё ещё работает; некоторые инструменты (ts-node с обработчиком `.ts`) используют его внутри. Предупреждение о deprecation появляется с флагом `--pending-deprecation`.

Обработчик `.json` по сути делает следующее:

```javascript
Module._extensions['.json'] = function (module, filename) {
    const content = fs.readFileSync(filename, 'utf8');
    module.exports = JSON.parse(stripBOM(content));
};
```

`stripBOM` убирает UTF-8 BOM при наличии. JSON через `require()` парсится один раз, кэшируется как объект, повторные `require()` того же файла возвращают тот же объект. Мутации видны везде, где файл уже require'или — многие ожидают свежую копию при каждом вызове, но её нет.

Обработчик `.node` вызывает `process.dlopen()` — обёртку над `dlopen()` в Unix и `LoadLibrary()` в Windows. Библиотека должна экспортировать символ `node_register_module_v*`. Бинарные аддоны платформозависимы: `.node`, собранный на Linux, не загрузится на macOS. node-gyp и prebuild занимаются сборкой и дистрибуцией.

### Точное имя файла

До проверки расширений Node пробует спецификатор как точный путь. `require('./utils.js')` сразу делает `stat` на `utils.js` — без fallback на `utils.js.js`. Файл есть — готово; нет — `MODULE_NOT_FOUND`.

Практическая разница: `require('./utils')` пробует `utils`, затем `utils.js`, `utils.json`, `utils.node`, затем каталог `utils`. `require('./utils.js')` — только `utils.js`.

Явное расширение экономит лишние `stat`. В больших кодовых базах это заметно. Правила вроде `import/extensions` из eslint-plugin-import требуют расширения по той же причине. TypeScript с `-moduleResolution node` повторяет порядок проб — отсюда `.js` в исходниках, которые компилируются из `.ts`.

### Каталог как модуль

Когда `require('./mylib')` указывает на каталог (`stat` говорит «каталог»), Node ищет точку входа внутри в таком порядке:

1.  `package.json` в каталоге, поле `"main"`
2.  `index.js`
3.  `index.json`
4.  `index.node`

```json
{
    "name": "mylib",
    "main": "lib/entry.js"
}
```

При таком `./mylib/package.json` вызов `require('./mylib')` загрузит `./mylib/lib/entry.js`. Без `package.json` или без `"main"` — fallback на `index.js`.

Конвенция `index.js` старая, с первых дней Node. Многие каталоги содержат только `index.js`, реэкспортирующий соседние файлы. Паттерн вряд ли исчезнет.

Если есть и `package.json` с `"main"`, и `index.js`, побеждает `"main"`. Цепочка fallback продолжается только при неудаче шага. Если `"main"` указывает на несуществующий файл — `MODULE_NOT_FOUND`; Node не откатывается к `index.js`. Поле `"main"` после чтения считается авторитетным.

```javascript
// ./mylib/ с package.json "main": "entry.js"
const lib = require('./mylib');
// Загрузится ./mylib/entry.js, ./mylib/index.js игнорируется
```

Проверка каталога использует внутренние `stat`-привязки с кодом типа файла. Файл — ветка с расширениями. Каталог — логика «каталог как модуль». `ENOENT` — эта ветка исчерпана.

## Алгоритм подъёма по node_modules

Bare-спецификатор без префикса пути запускает самую сложную ветку. `require('lodash')` должен найти lodash на диске. Node стартует из каталога вызывающего файла и поднимается вверх, проверяя `node_modules` на каждом уровне.

`Module._nodeModulePaths(from)` строит список каталогов для поиска. Для файла `/home/app/src/lib/foo.js`:

```
/home/app/src/lib/node_modules
/home/app/src/node_modules
/home/app/node_modules
/home/node_modules
/node_modules
```

Node берёт каталог вызывающего модуля, отрезает последний сегмент пути, добавляет `/node_modules`, повторяет до корня ФС. Затем в каждом каталоге пытается разрешить bare-спецификатор как файл или каталог — с теми же правилами расширений и «каталог как модуль». Первое совпадение побеждает.

`require('lodash')` из `/home/app/src/lib/foo.js` сначала смотрит `/home/app/src/lib/node_modules/lodash`, затем `/home/app/src/node_modules/lodash`, затем `/home/app/node_modules/lodash` и так далее.

### Зачем подъём

Вложенные пакеты могут иметь свои зависимости: `/home/app/node_modules/express/node_modules/accepts` — отдельная копия `accepts` только для express. Другая версия может лежать в `/home/app/node_modules/accepts` для приложения. npm dedupe старается поднять общие версии выше, при конфликте вложенные `node_modules` изолируют версии.

Цена — глубина дерева. До npm v3 дерево могло уходить на десятки уровней и упираться в лимит пути Windows в 260 символов. npm v3+ сильно уплощает дерево. pnpm использует симлинки в content-addressable store. Алгоритм разрешения один и тот же — он следует за той структурой ФС, которую нашёл менеджер пакетов.

### Scoped-пакеты

`@babel/core` — вложенность каталогов: `node_modules/@babel/core/`, где `@babel` — каталог, `core` — подкаталог. Подъём тот же; `@babel/core` — два сегмента пути внутри каждого `node_modules`.

### Require подпутей

Можно require'ить файлы глубоко внутри пакета: `require('express/lib/router')`. Сначала разрешается `express` по цепочке подъёма, затем добавляется `/lib/router` и снова применяются расширения и логика каталогов. Итог может быть `node_modules/express/lib/router/index.js` или `router.js`.

Если в пакете есть поле `"exports"`, глубокие подпути блокируются, пока карта `"exports"` их явно не разрешит. Пакет может открыть `require('express')` и `require('express/Router')`, но закрыть `require('express/lib/router')`. Карта `"exports"` — allow-list публичной поверхности.

До `"exports"` любой мог залезть во внутренние файлы. Авторам библиотек нечем было пометить приватность. Переименование внутреннего файла ломало потребителей, завязавшихся на путь вне публичного API. `"exports"` задал границу пакета.

## Поле package.json "main"

Когда подъём нашёл каталог в `node_modules`, нужно выбрать файл для загрузки. Сначала читается `package.json` и поле `"main"`.

```json
{
    "name": "lodash",
    "version": "4.17.21",
    "main": "lodash.js"
}
```

Значение `"main"` разрешается относительно корня пакета. `"./dist/index.js"` даёт `/path/to/node_modules/lodash/dist/index.js`. Без `"main"` — fallback на `index.js` в корне пакета.

Часто `"main"` — CJS, а для ESM отдельно указывают `"module"` (поле экосистемы бандлеров, Node официально не признаёт) или современное `"exports"`, которое покрывает оба случая.

Типичный паттерн в npm:

```json
{
    "name": "some-lib",
    "main": "./dist/cjs/index.js",
    "module": "./dist/esm/index.js"
}
```

Node полностью игнорирует `"module"`. Webpack, Rollup и esbuild читают его при сборке под браузер или ESM. Node смотрит только на `"main"` и `"exports"`. Пакету «и Node, и бандлеры» лучше одно поле `"exports"` с условными ветками.

## Поле package.json "exports"

`"exports"` — современный способ описать публичный API пакета. Появилось в Node 12.7 и с тех пор расширялось. Если `"exports"` есть, оно имеет приоритет над `"main"` для `require()`. Оно же ограничивает, что можно импортировать: всё, чего нет в карте, недоступно.

```json
{
    "name": "my-pkg",
    "exports": {
        ".": "./lib/index.js",
        "./utils": "./lib/utils.js"
    }
}
```

`require('my-pkg')` → `./lib/index.js`, `require('my-pkg/utils')` → `./lib/utils.js`. `require('my-pkg/lib/internal.js')` бросит `ERR_PACKAGE_PATH_NOT_EXPORTED`, даже если файл на диске есть. Карта `"exports"` — единственные входы.

### Условные exports

`"exports"` поддерживает условия — разное разрешение в зависимости от контекста импорта.

```json
{
    "exports": {
        ".": {
            "import": "./lib/index.mjs",
            "require": "./lib/index.cjs",
            "default": "./lib/index.js"
        }
    }
}
```

`require('my-pkg')` сопоставляет `"require"` → `./lib/index.cjs`. `import 'my-pkg'` в ES-модуле — `"import"` → `./lib/index.mjs`. `"default"` — fallback, если ничего не подошло.

Другие имена условий: `"node"` (среда Node), `"browser"` (Node игнорирует, бандлеры используют), `"development"` / `"production"` (произвольные, включаются флагом `--conditions`). Свои имена возможны, но не сработают, пока потребитель их не передаст.

Порядок условий важен: Node обходит объект сверху вниз и берёт первое совпадение. `"default"` перед `"require"` перехватит всё — `"require"` никогда не сработает.

### Шаблоны подпутей

С Node 12.20 в `"exports"` есть wildcard-паттерны:

```json
{
    "exports": {
        "./features/*": "./src/features/*.js"
    }
}
```

`require('my-pkg/features/auth')` → `./src/features/auth.js`. `*` заменяет один сегмент пути. Удобно для пакетов с множеством entry point без перечисления каждого.

`*` — простая подстановка строки; совпадает и с сегментами, содержащими `/`. Поэтому `require('my-pkg/features/auth/handler')` может сопоставиться с `./features/*` и разрешиться в `./src/features/auth/handler.js`. В документации Node это «subpath patterns» — один паттерн открывает целые вложенные деревья.

### Приоритет exports над main

Если есть и `"exports"`, и `"main"`, для Node 12.7+ побеждает `"exports"`. `"main"` часто оставляют для старых версий Node. На практике пакеты с `"exports"` держат `"main"` ради обратной совместимости.

## Поле package.json "imports"

`"imports"` — внутренняя сторона `"exports"`. `"exports"` задаёт, что могут загрузить потребители; `"imports"` — приватные алиасы только внутри пакета.

```json
{
    "name": "my-app",
    "imports": {
        "#utils": "./src/utils/index.js",
        "#db": "./src/database/client.js"
    }
}
```

В любом файле пакета `my-app` можно писать `require('#utils')` → `./src/utils/index.js`. Префикс `#` обязателен — отличие от bare-спецификатора. Снаружи пакета `require('#utils')` упадёт: поле `"imports"` действует только в границах пакета, который его определил.

`"imports"` тоже поддерживает условия:

```json
{
    "imports": {
        "#db": {
            "development": "./src/database/mock.js",
            "default": "./src/database/client.js"
        }
    }
}
```

`node -conditions=development app.js` направит `require('#db')` на mock. Без флага — на реальный клиент.

Помимо эстетики это снимает хрупкость `require('../../../../utils/helpers')`: перенос файла ломает относительные пути, а записи imports map стабильны.

Спецификаторы с `#` разрешаются иначе, чем bare: Node не поднимается по `node_modules`. Ищется ближайший `package.json` над вызывающим файлом (подъём от каталога файла), читается `"imports"`. Нет поля — сразу ошибка, без fallback к `package.json` выше.

Это намеренно: `"imports"` принадлежит одному пакету. У зависимости свой `#utils`, у вас свой — конфликта нет, каждый читает свой `package.json`.

## NODE_PATH

`NODE_PATH` — переменная окружения с дополнительными каталогами для поиска модулей. В Unix список через `:`, в Windows через `;`. Эти каталоги проверяются после того, как исчерпана цепочка `node_modules`.

```bash
NODE_PATH=/home/shared/libs:/opt/custom/modules node app.js
```

`require('some-lib')` сначала обойдёт обычные `node_modules`, затем `/home/shared/libs/some-lib` и `/opt/custom/modules/some-lib`.

`NODE_PATH` — наследие. В документации Node — «ради совместимости», не рекомендуется. Встречается в Docker с общими каталогами модулей, в монорепо до npm workspaces, в CI с предкэшем. Для обычной разработки достаточно `node_modules`.

## Глобальные каталоги

Помимо `NODE_PATH` Node в последнюю очередь проверяет:

-   `$HOME/.node_modules`
-   `$HOME/.node_libraries`
-   `$PREFIX/lib/node`

`$PREFIX` — путь из `node -e "process.stdout.write(process.config.variables.node_prefix)"`, обычно `/usr/local` в Unix.

На практике эти пути почти не используют. Это самый последний рубеж перед `MODULE_NOT_FOUND`.

## require.resolve()

`require.resolve()` прогоняет полный алгоритм и возвращает абсолютный путь к файлу, который был бы загружен — без выполнения и без побочных эффектов кэша загрузки.

```javascript
const p = require.resolve('lodash');
console.log(p);
```

Может напечатать `/home/app/node_modules/lodash/lodash.js`. Модуль не найден — `MODULE_NOT_FOUND`, как у `require()`.

Можно передать опции:

```javascript
require.resolve('lodash', {
    paths: ['/custom/search/path'],
});
```

`paths` заменяет каталоги поиска по умолчанию. Проверяются только указанные пути плюс встроенные модули.

`require.resolve.paths()` возвращает массив каталогов, которые `require()` обошёл бы для спецификатора:

```javascript
const dirs = require.resolve.paths('lodash');
console.log(dirs);
```

Тот же список, что строит `Module._nodeModulePaths()` — цепочка подъёма, `NODE_PATH`, глобальные каталоги.

`require.resolve()` удобен для условной загрузки, поиска корня пакета и отладки:

```javascript
let yaml;
try {
    yaml = require(require.resolve('js-yaml'));
} catch {
    yaml = null;
}
```

Внешний `require.resolve()` отвечает на «есть ли пакет?» без выполнения кода. Можно и просто `require('js-yaml')` в `try`, но `resolve` явнее разделяет поиск и загрузку.

Корень пакета:

```javascript
const path = require('path');
const pkgDir = path.dirname(
    require.resolve('lodash/package.json')
);
console.log(pkgDir);
```

`require.resolve('lodash/package.json')` работает даже при жёстком `"exports"`: `package.json` неявно доступен — Node сам читает его при разрешении.

## Поведение симлинков

После нахождения файла алгоритм вызывает `fs.realpathSync()` перед использованием пути как ключа кэша. Симлинки приводятся к реальной цели.

```
/home/app/node_modules/my-pkg -> /opt/packages/my-pkg
/home/app/vendor/my-pkg -> /opt/packages/my-pkg
```

Оба указывают на один каталог. Ключ кэша — реальный путь `/opt/packages/my-pkg/index.js`. Модуль загружается один раз; `require('my-pkg')` и путь через vendor дают один объект exports.

Для pnpm с симлинками из центрального store одна версия lodash в разных проектах монорепо даёт один real path — кэш компактнее в рамках одного процесса.

Флаг `--preserve-symlinks` отключает realpath: ключом становится путь симлинка. Два симлинка на один файл — два экземпляра модуля и два объекта exports. Нужен редко — когда важна видимая локация файла, а не цель симлинка.

`--preserve-symlinks-main` то же только для главного скрипта (`node app.js`). Без флага `__dirname` entry-модуля считается от цели симлинка; с флагом — от расположения симлинка.

Оба флага редки. Но при npm link / pnpm и сбоях `instanceof` между «двумя копиями» одного пакета виноват часто шаг realpath.

`realpath` также канонизирует регистр — на Windows. На macOS с регистронезависимым APFS `fs.realpathSync('/Users/App/Index.js')` может вернуть запрошенный регистр, не фактический на диске. Тот же файл с разным регистром в `require` на macOS иногда даёт два экземпляра модуля (dual-package hazard).

## Внутри Module.\_resolveFilename

Алгоритм живёт в `lib/internal/modules/cjs/loader.js`, в `Module._resolveFilename(request, parent, isMain, options)`. По шагам виден точный порядок операций.

Параметры: `request` — строка спецификатора; `parent` — объект `Module` вызывающего (null для entry); `isMain` — главный модуль `node app.js`; `options` — второй аргумент `require.resolve()`.

Сначала встроенные: `NativeModule.canBeRequiredByUsers(request)` сверяет строку с набором, зашитым в бинарник при сборке из имён файлов в `lib/`. Успех — возврат спецификатора как есть (`'fs'`), путь к файлу не нужен. Префикс `node:` снимается для lookup, в ответе может вернуться с префиксом.

Иначе строится список путей. Для относительных/абсолютных — каталог родителя из `parent.filename`. Для bare — `Module._resolveLookupPaths(request, parent)`: `Module._nodeModulePaths(parent.path)`, `NODE_PATH`, глобальные каталоги.

Далее `Module._findPath(request, paths, isMain)` — работа с ФС. У `_findPath` свой кэш: `Map` с ключом `request + '\x00' + paths.join('\x00')`.

Для каждого каталога в `paths` собирается кандидат: относительный путь join'ится с каталогом; bare внутри `node_modules` — join с путём из node_modules.

`tryFile(basePath)` — быстрая C++-привязка `internalModuleStat`: путь, если файл есть, иначе `false`. Результаты кэшируются в `Module._pathCache`.

Провал `tryFile` → `tryExtensions(basePath, ['.js', '.json', '.node'])` — append и снова `tryFile`, первое совпадение.

Провал расширений → каталог: `tryPackage(basePath)` читает `package.json`, `"main"` (или `"."`), при наличии `"exports"` — `resolveExports()` с условиями, подпутями и паттернами.

Ни один каталог не дал результата — `_findPath` возвращает `false`, `_resolveFilename` бросает `MODULE_NOT_FOUND`: `Cannot find module 'whatever'`.

### Синхронная стоимость

Все операции синхронны: `internalModuleStat()`, `fs.readFileSync()` для `package.json`, `fs.realpathSync()` для симлинков. Event loop блокируется на всём разрешении (см. [event loop](../node-arch/event-loop-intro.md)). Внутренние привязки обходят создание JS-объектов `fs.Stats`, но `stat` всё равно стоит микросекунд. Тысячи `require` при старте на медленной ФС (сетевой mount, некоторые Docker volume) или глубоком `node_modules` дают заметную сумму.

Каждый неуспешный `stat` — потраченная работа. `require('lodash')` из глубокого `src/lib/utils/helpers/` может сделать шесть и более `stat` до нахождения пакета в корневом `node_modules`. `_pathCache` спасает повторы в процессе; первое разрешение каждого уникального спецификатора платит полную цену.

В профиле это видно: `strace` на Linux или `dtrace` на macOS показывают сотни `stat()` при старте, многие с `ENOENT` на промежуточных `node_modules`. Цена подъёма — тщательность brute-force.

`require-cache`, `module-alias` пытаются сократить путь; webpack и esbuild резолвят на этапе сборки и убирают runtime `require()`.

На финальном пути вызывается `fs.realpathSync()`. В Linux — `readlink()`, в macOS — `realpath()`. `--preserve-symlinks` пропускает шаг — ускорение в symlink-heavy средах (pnpm с тысячами пакетов).

Внутри Node есть `fs.realpathSync.native()` — делегирование в C `realpath()`. Система модулей использует нативный вариант. При профилировании старта, если `realpathSync` в flame graph, крутите `--preserve-symlinks`.

### Кэш разрешения

`Module._resolveFilename` косвенно кэширует через `Module._cache`: разрешённое имя файла — ключ загруженного модуля. У `_findPath` отдельный кэш `(request, paths) → абсолютный путь`. Повторное разрешение того же спецификатора с того же места может обойтись без проб ФС, даже если модуль ещё не загружали.

`require.cache` — ссылка на `Module._cache`:

```javascript
console.log(Object.keys(require.cache));
```

Ключи — абсолютные пути после realpath. Значения — объекты `Module` с `exports`, `filename`, `loaded`, `children`.

Удаление записи заставляет перезагрузить при следующем `require()`. Hot-reload так и делает, но хрупко: нужно убрать модуль из `children` родителя, иначе родитель держит старый объект; ссылки на старые exports не обновятся. `nodemon` чаще перезапускает процесс.

```javascript
delete require.cache[require.resolve('./myModule')];
const fresh = require('./myModule');
```

## Отладка разрешения

Если модуль не находится:

`require.resolve()` — первый шаг. Бросает — действительно не найден с этой точки. Вернул неожиданный путь — возможно, подтянулась другая версия из верхнего `node_modules`.

`Module._nodeModulePaths(process.cwd())` показывает каталоги поиска от cwd:

```javascript
const Module = require('module');
console.log(Module._nodeModulePaths(process.cwd()));
```

`require.resolve.paths('some-pkg')` — пути для конкретного спецификатора, включая `NODE_PATH` и глобальные.

`DEBUG` здесь не помогает (это userland-конвенция). Можно подменить `Module._findPath`:

```javascript
const Module = require('module');
const orig = Module._findPath;
Module._findPath = function (request, paths, isMain) {
    console.log('findPath:', request, paths);
    return orig.call(this, request, paths, isMain);
};
```

Грубо, но в dev быстрее стека: каждый спецификатор и список каталогов. В проде так не делают.

Менее инвазивно: `node -require` с диагностическим модулем или `node -print "require.resolve('some-pkg')"` из нужного каталога.

`NODE_DEBUG=module` включает подробный лог загрузки и разрешения в stderr:

```bash
NODE_DEBUG=module node app.js 2>&1 | head -20
```

Строки вроде `MODULE: looking for "./utils" in ["/home/app/src"]` и `MODULE: load "/home/app/src/utils.js" for module "."`. Grep по вашему спецификатору покажет каждый шаг.

## Крайние случаи

**Self-referencing.** С Node 13.1 пакет с полем `"exports"` может `require()` себя по имени: внутри `my-pkg` вызов `require('my-pkg')` идёт через собственную карту `"exports"`. Без `"exports"` — `MODULE_NOT_FOUND`. Нужно в основном для подпутей: внутренний код использует те же публичные пути, что и потребители.

**Поле `"type"`.** `"commonjs"` или `"module"` влияет на трактовку `.js` как CJS или ESM, но для алгоритма `require()` разрешения не меняет — меняется только загрузчик после разрешения. `require()` в CJS всегда считает `.js` CommonJS.

**Циклы при разрешении.** На этапе «строка → путь» циклов нет: конечный обход ФС. Циклы `require()` при загрузке (A → B → A) обрабатываются частично собранным exports; это другая фаза.

**Регистр.** На регистронезависимых ФС (macOS по умолчанию, Windows NTFS) `require('./Utils')` и `require('./utils')` находят один файл. Ключ кэша — результат `realpathSync`. Деплой с macOS на Linux (ext4, регистрозависимый) ломает `require('./Utils')`, если на диске только `utils.js` — классический «у меня работает».

**package.json без `"name"`.** Для разрешения нормально: важны `"main"`, `"exports"`, `"imports"`. `"name"` нужен npm и self-referencing.

**ESM vs CJS для относительных путей.** В CJS `require('./foo')` пробует расширения. В ESM `import './foo'` расширения не подставляет — нужно полное имя с расширением. Алгоритмы различаются; ESM — в [следующей главе](./esm-import-export.md). Здесь — только `require()`.

**Несколько package.json.** В дереве их может быть много. Для bare читается `package.json` в найденном `node_modules`. Для `"imports"` — ближайший над вызывающим файлом. В монорепо с вложенными пакетами это задаёт область конфигурации.

## Связанное чтение

-   Предыдущая: [require() в Node.js: Module.\_load, обёртки и кэш CJS](./cjs-require.md)
-   Далее: [ES modules в Node.js: import/export, линковка и определение формата](./esm-import-export.md)
