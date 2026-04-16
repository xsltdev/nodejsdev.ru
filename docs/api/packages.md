---
title: 'Модули: пакеты'
description: package.json, поля exports и imports, условные экспорты, определение системы модулей и разрешение путей в Node.js
---

# Модули: пакеты

<!--introduced_in=v12.20.0-->

<!-- type=misc -->

<!-- YAML
changes:
  - version:
    - v14.13.0
    - v12.20.0
    pr-url: https://github.com/nodejs/node/pull/34718
    description: Add support for `"exports"` patterns.
  - version:
    - v14.6.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34117
    description: Add package `"imports"` field.
  - version:
    - v13.7.0
    - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/29866
    description: Unflag conditional exports.
  - version:
    - v13.7.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31001
    description: Remove the `--experimental-conditional-exports` option. In 12.16.0, conditional exports are still behind `--experimental-modules`.
  - version:
    - v13.6.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31002
    description: Unflag self-referencing a package using its name.
  - version: v12.7.0
    pr-url: https://github.com/nodejs/node/pull/28568
    description:
      Introduce `"exports"` `package.json` field as a more powerful alternative
      to the classic `"main"` field.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26745
    description:
      Add support for ES modules using `.js` file extension via `package.json`
      `"type"` field.
-->

## Введение

Пакет — это дерево каталогов, описанное файлом `package.json`. Пакет включает каталог с этим `package.json` и все подкаталоги до следующего каталога с другим `package.json` или до каталога с именем `node_modules`.

Здесь — рекомендации авторам пакетов по `package.json` и справочник по полям [`package.json`](#nodejs-packagejson-field-definitions), определённым в Node.js.

## Определение системы модулей {: #determining-module-system}

### Введение

Node.js будет считать следующее [ES-модулями][es modules], если передать это в `node` как начальный ввод или сослаться через операторы `import` или выражения `import()`:

-   файлы с расширением `.mjs`;

-   файлы с расширением `.js`, если ближайший родительский `package.json` содержит поле верхнего уровня [`"type"`](#type) со значением `"module"`;

-   строки, переданные в `--eval` или в `node` через `STDIN` с флагом `--input-type=module`;

-   код, который синтаксически разбирается только как [ES-модули][es modules], например операторы `import`/`export` или `import.meta`, без явного указания интерпретации. Явные маркеры — расширения `.mjs`/`.cjs`, поле `"type"` в `package.json` со значениями `"module"` или `"commonjs"` или флаг `--input-type`. Динамические выражения `import()` допустимы и в CommonJS, и в ES-модулях и сами по себе не заставляют файл считаться ES-модулем. См. [обнаружение синтаксиса][syntax detection].

Node.js будет считать следующее [CommonJS][commonjs], если передать это в `node` как начальный ввод или сослаться через `import`/`import()`:

-   файлы с расширением `.cjs`;

-   файлы с расширением `.js`, если ближайший родительский `package.json` содержит поле [`"type"`](#type) со значением `"commonjs"`;

-   строки для `--eval` или `--print`, а также ввод через `STDIN` с флагом `--input-type=commonjs`;

-   файлы `.js` без родительского `package.json` или при отсутствии поля `type` в ближайшем `package.json`, если код успешно выполняется как CommonJS. Иными словами, Node.js сначала пытается выполнить такие «двусмысленные» файлы как CommonJS и повторно оценивает их как ES-модули, если разбор как CommonJS не удался из-за синтаксиса ES-модуля.

Использование синтаксиса ES-модулей в «двусмысленных» файлах даёт накладные расходы, поэтому рекомендуется везде, где возможно, быть явным. В частности, авторам пакетов следует всегда указывать поле [`"type"`](#type) в `package.json`, даже если все исходники — CommonJS. Явный `type` защитит пакет, если когда-нибудь изменится тип по умолчанию в Node.js, и упростит работу сборщиков и загрузчиков при определении интерпретации файлов.

### Обнаружение синтаксиса {: #syntax-detection}

<!-- YAML
added:
  - v21.1.0
  - v20.10.0
changes:
  - version:
    - v22.7.0
    - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/53619
    description: Syntax detection is enabled by default.
-->

> Стабильность: 1.2 — кандидат на выпуск

Node.js просматривает исходный код двусмысленного ввода и, если обнаружен синтаксис ES-модуля, обрабатывает ввод как ES-модуль.

Двусмысленный ввод — это:

-   файлы с расширением `.js` или без расширения, при отсутствии управляющего `package.json` или при отсутствии в нём поля `type`;
-   строковый ввод (`--eval` или `STDIN`), если не указан `--input-type`.

Синтаксис ES-модуля — это синтаксис, который при выполнении как CommonJS привёл бы к ошибке. К нему относятся:

-   операторы `import` (но не выражения `import()` — они допустимы в CommonJS);
-   операторы `export`;
-   обращения к `import.meta`;
-   `await` на верхнем уровне модуля;
-   повторные лексические объявления переменных обёртки CommonJS (`require`, `module`, `exports`, `__dirname`, `__filename`).

### Разрешение и загрузка модулей {: #module-resolution-and-loading}

У Node.js два вида разрешения и загрузки модулей — в зависимости от способа запроса.

Когда модуль запрашивается через `require()` (по умолчанию в CommonJS и может быть создан через `createRequire()` и в CommonJS, и в ES-модулях):

-   Разрешение:
    -   разрешение через `require()` поддерживает [папки как модули][folders as modules];
    -   при отсутствии точного совпадения `require()` подставляет расширения (`.js`, `.json`, затем `.node`) и снова пытается разрешить [папки как модули][folders as modules];
    -   по умолчанию URL в качестве спецификаторов не поддерживаются.
-   Загрузка:
    -   `.json` обрабатываются как JSON-текст;
    -   `.node` — скомпилированные аддоны, загружаемые через `process.dlopen()`;
    -   `.ts`, `.mts`, `.cts` — как [TypeScript][typescript];
    -   прочие расширения или отсутствие расширения — как JavaScript-текст;
    -   `require()` может [загружать ES-модули из CommonJS][load ecmascript modules from commonjs modules] только если [ES-модуль][es module] _и его зависимости_ синхронны (нет top-level `await`).

Когда модуль запрашивается статическим `import` (только в ES-модулях) или выражением `import()` (в CommonJS и ES-модулях):

-   Разрешение:
    -   у `import`/`import()` нет «папок как модулей», индекс каталога (например `'./startup/index.js'`) задаётся полностью;
    -   поиск расширений не выполняется: для относительного или абсолютного file URL нужно указать расширение;
    -   по умолчанию поддерживаются спецификаторы `file://` и `data:`.
-   Загрузка:
    -   `.json` — JSON-текст; при импорте JSON-модулей нужен атрибут типа импорта (например `import json from './data.json' with { type: 'json' }`);
    -   `.node` — аддоны через `process.dlopen()`, если включён [`--experimental-addon-modules`](cli.md#--experimental-addon-modules);
    -   `.ts`, `.mts`, `.cts` — как [TypeScript][typescript];
    -   для JavaScript-текста допускаются только расширения `.js`, `.mjs`, `.cjs`;
    -   `.wasm` — [WebAssembly-модули][webassembly modules];
    -   иные расширения дают ошибку [`ERR_UNKNOWN_FILE_EXTENSION`](errors.md#err_unknown_file_extension); дополнительные расширения — через [хуки настройки][customization hooks];
    -   `import`/`import()` могут загружать JavaScript-[модули CommonJS][commonjs]; для них используется [merve][merve], чтобы по возможности вывести именованные экспорты статическим анализом.

Независимо от способа запроса разрешение и загрузку можно настроить через [хуки настройки][customization hooks].

### `package.json` и расширения файлов

В пакете поле [`package.json`](#nodejs-packagejson-field-definitions) [`"type"`](#type) задаёт, как Node.js интерпретирует файлы `.js`. Без `"type"` файлы `.js` считаются [CommonJS][commonjs].

`"type": "module"` означает, что `.js` в этом пакете — [ES module][es module].

`"type"` действует не только на точку входа (`node my-app.js`), но и на файлы, подключаемые через `import` и `import()`.

```js
// my-app.js считается ES-модулем: рядом package.json с "type": "module".

import './startup/init.js';
// ES-модуль: в ./startup нет package.json, наследуется "type" с уровня выше.

import 'commonjs-package';
// CommonJS: у ./node_modules/commonjs-package/package.json нет "type" или "type": "commonjs".

import './node_modules/commonjs-package/index.js';
// То же: package.json пакета без "module" или с "commonjs".
```

Файлы `.mjs` всегда загружаются как [ES modules][es modules], независимо от родительского `package.json`.

Файлы `.cjs` всегда загружаются как [CommonJS][commonjs], независимо от родительского `package.json`.

```js
import './legacy-file.cjs';
// CommonJS: расширение .cjs всегда CommonJS.

import 'commonjs-package/src/index.mjs';
// ES-модуль: .mjs всегда ES-модуль.
```

Расширения `.mjs` и `.cjs` позволяют смешивать типы в одном пакете:

-   в пакете с `"type": "module"` отдельный файл можно пометить как [CommonJS][commonjs], давав ему `.cjs` (и `.js`, и `.mjs` в таком пакете — ES-модули);

-   в пакете с `"type": "commonjs"` отдельный файл можно пометить как [ES module][es module], давав ему `.mjs` (и `.js`, и `.cjs` в таком пакете — CommonJS).

### Флаг `--input-type`

<!-- YAML
added: v12.0.0
-->

Строки для `--eval`/`-e` или из `STDIN` обрабатываются как [ES modules][es modules], если задано `--input-type=module`.

```bash
node --input-type=module --eval "import { sep } from 'node:path'; console.log(sep);"

echo "import { sep } from 'node:path'; console.log(sep);" | node --input-type=module
```

Также есть `--input-type=commonjs` для явного запуска строки как CommonJS. Если `--input-type` не указан, по умолчанию это поведение CommonJS.

## Точки входа пакета {: #package-entry-points}

В `package.json` точки входа задают поля [`"main"`](#main) и [`"exports"`](#exports). Оба подходят и для ES-модулей, и для CommonJS.

[`"main"`](#main) поддерживается во всех версиях Node.js, но задаёт только главную точку входа.

[`"exports"`](#exports) — современная замена [`"main"`](#main): несколько точек входа, условное разрешение в разных средах и **запрет любых путей вне перечисленных в [`"exports"`](#exports)**. Так проще явно описать публичный API пакета.

Для новых пакетов под актуальные версии Node.js рекомендуется [`"exports"`](#exports). Для поддержки Node.js 10 и ниже нужен [`"main"`](#main). Если заданы оба, [`"exports"`](#exports) имеет приоритет над [`"main"`](#main) в поддерживаемых версиях.

[Условные экспорты][conditional exports] внутри [`"exports"`](#exports) задают разные точки входа по среде, включая `require` и `import`. Про совместимый CommonJS и ES в одном пакете см. [раздел про dual-пакеты][the dual commonjs/es module packages section].

Если у существующего пакета появляется [`"exports"`](#exports), потребители не смогут использовать непроэкспортированные пути, в том числе [`package.json`](#nodejs-packagejson-field-definitions) (например `require('your-package/package.json')`). **Это обычно ломающее изменение.**

Чтобы ввести [`"exports"`](#exports) без поломки, экспортируйте все ранее поддерживаемые пути; лучше явно перечислить точки входа. Например, если раньше были `main`, `lib`, `feature` и `package.json`, можно задать:

```json
{
    "name": "my-package",
    "exports": {
        ".": "./lib/index.js",
        "./lib": "./lib/index.js",
        "./lib/index": "./lib/index.js",
        "./lib/index.js": "./lib/index.js",
        "./feature": "./feature/index.js",
        "./feature/index": "./feature/index.js",
        "./feature/index.js": "./feature/index.js",
        "./package.json": "./package.json"
    }
}
```

Либо экспортировать целые каталоги с шаблонами и с расширениями, и без:

```json
{
    "name": "my-package",
    "exports": {
        ".": "./lib/index.js",
        "./lib": "./lib/index.js",
        "./lib/*": "./lib/*.js",
        "./lib/*.js": "./lib/*.js",
        "./feature": "./feature/index.js",
        "./feature/*": "./feature/*.js",
        "./feature/*.js": "./feature/*.js",
        "./package.json": "./package.json"
    }
}
```

Так сохраняется обратная совместимость в минорных версиях; в следующем major можно сузить экспорты только до нужных путей:

```json
{
    "name": "my-package",
    "exports": {
        ".": "./lib/index.js",
        "./feature/*.js": "./feature/*.js",
        "./feature/internal/*": null
    }
}
```

### Экспорт главной точки входа

Для нового пакета рекомендуется поле [`"exports"`](#exports):

```json
{
    "exports": "./index.js"
}
```

Если задано [`"exports"`](#exports), подпути пакета инкапсулированы и недоступны импортёрам. Например, `require('pkg/subpath.js')` даёт [`ERR_PACKAGE_PATH_NOT_EXPORTED`](errors.md#err_package_path_not_exported).

Так проще гарантировать контракт API и semver; полной изоляции нет: прямой `require('/path/to/node_modules/pkg/subpath.js')` по-прежнему может загрузить файл.

Актуальные Node.js и сборщики поддерживают `"exports"`. Для старых версий можно дублировать `"main"` тем же путём, что и `"exports"`:

```json
{
    "main": "./index.js",
    "exports": "./index.js"
}
```

### Экспорт подпутей {: #subpath-exports}

<!-- YAML
added: v12.7.0
-->

При использовании поля [`"exports"`](#exports) можно задать пользовательские подпути наряду с главной точкой входа, считая главную точку входа подпутём `"."`:

```json
{
    "exports": {
        ".": "./index.js",
        "./submodule.js": "./src/submodule.js"
    }
}
```

Тогда потребитель может импортировать только подпуть, явно заданный в [`"exports"`](#exports):

```js
import submodule from 'es-module-package/submodule.js';
// Loads ./node_modules/es-module-package/src/submodule.js
```

Другие подпути приведут к ошибке:

```js
import submodule from 'es-module-package/private-module.js';
// Throws ERR_PACKAGE_PATH_NOT_EXPORTED
```

#### Расширения в подпутях

Авторам пакетов следует указывать в экспорте либо подпути с расширением (`import 'pkg/subpath.js'`), либо без него (`import 'pkg/subpath'`). Так для каждого экспортируемого модуля остаётся единственный подпуть, все зависимости используют один и тот же спецификатор, контракт пакета ясен потребителям, а автодополнение подпутей упрощается.

Традиционно пакеты чаще использовали стиль без расширения: он удобнее читается и скрывает реальный путь к файлу внутри пакета.

Теперь, когда [карты импорта][import maps] задают стандарт разрешения пакетов в браузерах и других средах JavaScript, стиль без расширения может раздувать определения карт импорта. Явные расширения файлов помогают избежать этого, позволяя карте импорта использовать [отображение папки пакетов][packages folder mapping] и по возможности сопоставлять несколько подпутей вместо отдельной записи карты на каждый экспортируемый подпуть. Это же согласуется с требованием указывать [полный путь спецификатора][the full specifier path] в относительных и абсолютных спецификаторах импорта.

#### Правила путей и проверка целей экспорта

Задавая пути как цели в поле [`"exports"`](#exports), Node.js применяет несколько правил ради безопасности, предсказуемости и инкапсуляции. Понимание этих правил важно для авторов, публикующих пакеты.

##### Цели должны быть относительными URL

Все целевые пути в карте [`"exports"`](#exports) (значения, сопоставленные ключам экспорта) должны быть строками относительных URL, начинающимися с `./`.

```json
// package.json
{
    "name": "my-package",
    "exports": {
        ".": "./dist/main.js", // Correct
        "./feature": "./lib/feature.js" // Correct
        // "./origin-relative": "/dist/main.js", // Incorrect: Must start with ./
        // "./absolute": "file:///dev/null", // Incorrect: Must start with ./
        // "./outside": "../common/util.js" // Incorrect: Must start with ./
    }
}
```

Причины такого поведения:

-   **Безопасность:** нельзя экспортировать произвольные файлы за пределами собственного каталога пакета.
-   **Инкапсуляция:** все экспортируемые пути разрешаются относительно корня пакета, пакет остаётся самодостаточным.

##### Без обхода каталогов и недопустимых сегментов

Цели экспорта не должны разрешаться в расположение вне корня пакета. Кроме того, сегменты пути вроде `.` (одна точка), `..` (две точки) или `node_modules` (и их эквиваленты в URL-кодировании) как правило запрещены в строке `target` после начального `./` и в любой части `subpath`, подставляемой в шаблон цели.

```json
// package.json
{
    "name": "my-package",
    "exports": {
        // ".": "./dist/../../elsewhere/file.js", // Invalid: path traversal
        // ".": "././dist/main.js",             // Invalid: contains "." segment
        // ".": "./dist/../dist/main.js",       // Invalid: contains ".." segment
        // "./utils/./helper.js": "./utils/helper.js" // Key has invalid segment
    }
}
```

### Синтаксический сахар для `exports`

<!-- YAML
added: v12.11.0
-->

Если экспорт `"."` — единственный, поле [`"exports"`](#exports) допускает сокращённую запись: вместо объекта можно указать непосредственно значение [`"exports"`](#exports).

```json
{
    "exports": {
        ".": "./index.js"
    }
}
```

эквивалентно:

```json
{
    "exports": "./index.js"
}
```

### Импорт подпутей {: #subpath-imports}

<!-- YAML
added:
  - v14.6.0
  - v12.19.0
changes:
  - version:
     - v25.4.0
     - v24.14.0
    pr-url: https://github.com/nodejs/node/pull/60864
    description: Allow subpath imports that start with `#/`.
-->

Помимо поля [`"exports"`](#exports) в пакете есть поле `"imports"` — для приватных сопоставлений, которые действуют только для спецификаторов импорта изнутри самого пакета.

Записи в поле `"imports"` всегда должны начинаться с `#`, чтобы их можно было отличить от спецификаторов внешних пакетов.

Например, поле `imports` позволяет получить преимущества условных экспортов для внутренних модулей:

```json
// package.json
{
    "imports": {
        "#dep": {
            "node": "dep-node-native",
            "default": "./dep-polyfill.js"
        }
    },
    "dependencies": {
        "dep-node-native": "^1.0.0"
    }
}
```

здесь `import '#dep'` не получает разрешение внешнего пакета `dep-node-native` (включая его собственные `exports`), а в других средах получает локальный файл `./dep-polyfill.js` относительно пакета.

В отличие от поля `"exports"`, поле `"imports"` допускает сопоставление с внешними пакетами.

Правила разрешения для поля `imports` в остальном аналогичны полю `exports`.

### Шаблоны подпутей

<!-- YAML
added:
  - v14.13.0
  - v12.20.0
changes:
  - version:
    - v16.10.0
    - v14.19.0
    pr-url: https://github.com/nodejs/node/pull/40041
    description: Support pattern trailers in "imports" field.
  - version:
    - v16.9.0
    - v14.19.0
    pr-url: https://github.com/nodejs/node/pull/39635
    description: Support pattern trailers.
-->

Для пакетов с небольшим числом экспортов или импортов рекомендуется явно перечислять каждый подпуть в `exports`. Если же подпутей очень много, это может раздувать `package.json` и усложнять сопровождение.

В таких случаях вместо этого можно использовать шаблоны подпутей экспорта:

```json
// ./node_modules/es-module-package/package.json
{
    "exports": {
        "./features/*.js": "./src/features/*.js"
    },
    "imports": {
        "#internal/*.js": "./src/internal/*.js"
    }
}
```

**Сопоставления с `*` раскрывают вложенные подпути как синтаксис простой подстановки строк.**

Все вхождения `*` в правой части заменяются этим значением, в том числе если в нём есть разделители `/`.

```js
import featureX from 'es-module-package/features/x.js';
// Loads ./node_modules/es-module-package/src/features/x.js

import featureY from 'es-module-package/features/y/y.js';
// Loads ./node_modules/es-module-package/src/features/y/y.js

import internalZ from '#internal/z.js';
// Loads ./src/internal/z.js
```

Это прямое статическое сопоставление и замена без особой обработки расширений файлов. Указание `"*.js"` с обеих сторон сопоставления ограничивает экспортируемые файлы пакета только JS.

Свойство статически перечислимых экспортов сохраняется и для шаблонов: отдельные экспорты пакета можно получить, рассматривая шаблон цели справа как глоб `**` по списку файлов внутри пакета. Так как пути `node_modules` в целях `exports` запрещены, такое раскрытие опирается только на файлы самого пакета.

Чтобы исключить приватные подкаталоги из шаблонов, можно использовать цели `null`:

```json
// ./node_modules/es-module-package/package.json
{
    "exports": {
        "./features/*.js": "./src/features/*.js",
        "./features/private-internal/*": null
    }
}
```

```js
import featureInternal from 'es-module-package/features/private-internal/m.js';
// Throws: ERR_PACKAGE_PATH_NOT_EXPORTED

import featureX from 'es-module-package/features/x.js';
// Loads ./node_modules/es-module-package/src/features/x.js
```

### Условные экспорты {: #conditional-exports}

<!-- YAML
added:
  - v13.2.0
  - v12.16.0
changes:
  - version:
    - v13.7.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31001
    description: Unflag conditional exports.
-->

Условные экспорты позволяют сопоставлять разные пути в зависимости от условий. Они поддерживаются и для импорта CommonJS, и для ES-модулей.

Например, пакет, который хочет отдавать разные точки входа для `require()` и `import`, можно описать так:

```json
// package.json
{
    "exports": {
        "import": "./index-module.js",
        "require": "./index-require.cjs"
    },
    "type": "module"
}
```

Node.js реализует следующие условия; ниже они перечислены от более специфичных к менее специфичным — в таком порядке условия и следует задавать:

-   `"node-addons"` — по смыслу близко к `"node"`, совпадает в любой среде Node.js. Его можно использовать для точки входа с нативными аддонами на C++ вместо более универсальной точки без нативных аддонов. Это условие можно отключить флагом [`--no-addons`](cli.md#--no-addons).
-   `"node"` — совпадает в любой среде Node.js. Цель может быть CommonJS или ES-модулем. _В большинстве случаев явно выделять платформу Node.js не требуется._
-   `"import"` — совпадает, когда пакет загружают через `import` или `import()`, либо через любую операцию верхнего уровня импорта или разрешения загрузчика ECMAScript-модулей. Действует независимо от формата целевого файла. _Всегда взаимоисключающе с `"require"`._
-   `"require"` — совпадает, когда пакет загружают через `require()`. Указанный файл должен быть загружаем через `require()`, хотя условие совпадает независимо от формата цели. Ожидаемые форматы: CommonJS, JSON, нативные аддоны и ES-модули. _Всегда взаимоисключающе с `"import"`._
-   `"module-sync"` — совпадает независимо от того, загружают ли пакет через `import`, `import()` или `require()`. Ожидается формат ES-модулей без top-level `await` в графе модулей — иначе при `require()` будет выброшено `ERR_REQUIRE_ASYNC_MODULE`.
-   `"default"` — универсальный запасной вариант, всегда совпадает. Может указывать на CommonJS или ES-модуль. _Это условие всегда должно идти последним._

В объекте [`"exports"`](#exports) порядок ключей важен. При сопоставлении условий более ранние записи имеют больший приоритет и перекрывают последующие. _Обычно условия в объекте задают от более специфичных к менее специфичным._

Использование условий `"import"` и `"require"` связано с рисками; подробнее — в [разделе о двойных пакетах CommonJS/ES-модулей][the dual commonjs/es module packages section].

Условие `"node-addons"` подходит для точки входа с нативными аддонами на C++. Его можно отключить флагом [`--no-addons`](cli.md#--no-addons). При `"node-addons"` имеет смысл рассматривать `"default"` как усиление с более универсальной точкой входа, например с WebAssembly вместо нативного аддона.

Условные экспорты можно распространять и на подпути, например:

```json
{
    "exports": {
        ".": "./index.js",
        "./feature.js": {
            "node": "./feature-node.js",
            "default": "./feature.js"
        }
    }
}
```

Определяется пакет, в котором `require('pkg/feature.js')` и `import 'pkg/feature.js'` могут отдавать разные реализации в Node.js и в других средах JavaScript.

При ветвлении по средам по возможности всегда включайте условие `"default"`. Оно гарантирует, что неизвестные среды JS смогут использовать универсальную реализацию и не придётся подстраиваться под уже существующие среды ради поддержки условных экспортов. Поэтому ветки `"node"` и `"default"` обычно предпочтительнее сочетания `"node"` и `"browser"`.

### Вложенные условия {: #nested-conditions}

Помимо прямых сопоставлений Node.js поддерживает вложенные объекты условий.

Например, чтобы задать пакет только с двойными точками входа для Node.js, но не для браузера:

```json
{
    "exports": {
        "node": {
            "import": "./feature-node.mjs",
            "require": "./feature-node.cjs"
        },
        "default": "./feature.mjs"
    }
}
```

Условия по-прежнему сопоставляются по порядку, как при «плоских» условиях. Если у вложенного условия нет сопоставления, проверка продолжается по остальным условиям родителя. Так вложенные условия ведут себя как вложенные операторы `if` в JavaScript.

### Разрешение пользовательских условий {: #resolving-user-conditions}

<!-- YAML
added:
  - v14.9.0
  - v12.19.0
-->

При запуске Node.js пользовательские условия можно задать флагом `--conditions`:

```bash
node --conditions=development index.js
```

Тогда будет разрешаться условие `"development"` в импортах и экспортах пакетов, а существующие `"node"`, `"node-addons"`, `"default"`, `"import"` и `"require"` — по правилам как обычно.

Произвольное число пользовательских условий задаётся повторением флага.

В типичных условиях допустимы только буквы и цифры; при необходимости разделители — `:`, `-` или `=`. Иные символы могут вызвать проблемы совместимости вне Node.js.

В Node.js у условий мало ограничений, в частности:

1. Должен быть хотя бы один символ.
2. Нельзя начинать с `.`, так как в некоторых контекстах допускаются относительные пути.
3. Нельзя использовать `,` — часть CLI может воспринять это как список через запятую.
4. Нельзя использовать целочисленные ключи вроде `"10"` — возможны неожиданные эффекты порядка ключей в объектах JS.

### Определения условий сообщества {: #conditions-definitions}

Строки условий, кроме `"import"`, `"require"`, `"node"`, `"module-sync"`, `"node-addons"` и `"default"`, [реализованных в ядре Node.js](#conditional-exports), по умолчанию игнорируются.

Другие платформы могут вводить свои условия; в Node.js пользовательские условия включаются флагом [`--conditions` / `-C`](#resolving-user-conditions).

Чтобы пользовательские условия пакетов использовались однозначно, ниже приведён список распространённых условий и их строгие определения для согласованности экосистемы.

-   `"types"` — системы типов могут по нему находить файл типов для данного экспорта. _Это условие всегда должно идти первым._
-   `"browser"` — любая среда веб-браузера.
-   `"development"` — точка входа только для режима разработки, например с дополнительной отладочной информацией и более понятными сообщениями об ошибках. _Всегда взаимоисключающе с `"production"`._
-   `"production"` — точка входа для production-среды. _Всегда взаимоисключающе с `"development"`._

Для прочих сред определения платформенных ключей ведёт [WinterCG][wintercg] в спецификации предложения [Runtime Keys][runtime keys].

Новые определения условий можно добавить в этот список через pull request в [документацию Node.js по этому разделу][документацию node.js по этому разделу]. Требования к включению нового определения:

-   Определение должно быть ясным и однозначным для всех реализаторов.
-   Должен быть чётко обоснован сценарий, зачем нужно условие.
-   Должно быть достаточно существующих реализаций в дикой природе.
-   Имя условия не должно конфликтовать с другим определением или широко используемым условием.
-   Публикация определения должна давать экосистеме выигрыш в согласовании, который иначе недостижим. Например, это не обязательно так для условий, специфичных для компании или приложения.
-   Пользователь Node.js ожидал бы увидеть условие в документации ядра. Хороший пример — `"types"`: оно не очень подходит к предложению [Runtime Keys][runtime keys], но хорошо смотрится в документации Node.js.

В будущем эти определения могут быть перенесены в отдельный реестр условий.

### Самоссылка на пакет по имени {: #self-referencing-a-package-using-its-name}

<!-- YAML
added:
  - v13.1.0
  - v12.16.0
changes:
  - version:
    - v13.6.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31002
    description: Unflag self-referencing a package using its name.
-->

Внутри пакета значения из поля `package.json` [`"exports"`](#exports) можно запрашивать по имени пакета. Например, пусть `package.json` такой:

```json
// package.json
{
    "name": "a-package",
    "exports": {
        ".": "./index.mjs",
        "./foo.js": "./foo.js"
    }
}
```

Тогда любой модуль _в этом пакете_ может ссылаться на экспорт самого пакета:

```js
// ./a-module.mjs
import { something } from 'a-package'; // Imports "something" from ./index.mjs.
```

Самоссылка возможна только если в `package.json` есть [`"exports"`](#exports), и разрешает импортировать только то, что разрешает это поле [`"exports"`](#exports) (в `package.json`). Поэтому приведённый ниже код для предыдущего пакета вызовет ошибку выполнения:

```js
// ./another-module.mjs

// Imports "another" from ./m.mjs. Fails because
// the "package.json" "exports" field
// does not provide an export named "./m.mjs".
import { another } from 'a-package/m.mjs';
```

Самоссылка также работает с `require` и в ES-модуле, и в CommonJS. Например, такой код тоже допустим:

=== "CJS"

    ```js
    // ./a-module.js
    const { something } = require('a-package/foo.js'); // Loads from ./foo.js.
    ```

Наконец, самоссылка работает и для пакетов со scope. Например, сработает такой код:

```json
// package.json
{
    "name": "@my/package",
    "exports": "./index.js"
}
```

=== "CJS"

    ```js
    // ./index.js
    module.exports = 42;
    ```

=== "CJS"

    ```js
    // ./other.js
    console.log(require('@my/package'));
    ```

```console
$ node other.js
42
```

## Двойные пакеты CommonJS/ES-модулей {: #dual-commonjses-module-packages}

Подробности — в [репозитории примеров пакетов][the package examples repository].

## Определения полей `package.json` в Node.js {: #nodejs-packagejson-field-definitions}

Здесь описаны поля, которые использует среда выполнения Node.js. Другие инструменты (например [npm](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)) используют дополнительные поля: Node.js их игнорирует, и они здесь не документируются.

В Node.js используются следующие поля `package.json`:

-   [`"name"`](#name) — нужно для именованных импортов внутри пакета; менеджеры пакетов используют его как имя пакета.
-   [`"main"`](#main) — модуль по умолчанию при загрузке пакета по имени, если не задано `exports`, а также в версиях Node.js до появления `exports`.
-   [`"type"`](#type) — тип пакета: как загружать файлы `.js` — как CommonJS или как ES-модули.
-   [`"exports"`](#exports) — экспорт пакета и условные экспорты; если задано, ограничивает, какие подмодули можно загрузить из пакета.
-   [`"imports"`](#imports) — импорты пакета для модулей внутри самого пакета.

### `"name"` {: #name}

<!-- YAML
added:
  - v13.1.0
  - v12.16.0
changes:
  - version:
    - v13.6.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31002
    description: Remove the `--experimental-resolve-self` option.
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

```json
{
    "name": "package-name"
}
```

Поле `"name"` задаёт имя пакета. Для публикации в реестре _npm_ имя должно удовлетворять [определённым требованиям](https://docs.npmjs.com/files/package.json#name).

Поле `"name"` можно использовать вместе с [`"exports"`](#exports) для [самоссылки][self-reference] на пакет по его имени.

### `"main"` {: #main}

<!-- YAML
added: v0.4.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

```json
{
    "main": "./index.js"
}
```

Поле `"main"` задаёт точку входа пакета при импорте по имени через поиск в `node_modules`. Его значение — путь.

Если задано поле [`"exports"`](#exports), оно имеет приоритет над `"main"` при импорте пакета по имени.

Оно же задаёт файл, который подставляется при [загрузке каталога пакета через `require()`](modules.md#folders-as-modules).

=== "CJS"

    ```js
    // This resolves to ./path/to/directory/index.js.
    require('./path/to/directory');
    ```

### `"type"` {: #type}

<!-- YAML
added: v12.0.0
changes:
  - version:
    - v13.2.0
    - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/29866
    description: Unflag `--experimental-modules`.
-->

Добавлено в: v12.0.0

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Поле `"type"` задаёт формат модулей, который Node.js применяет ко всем файлам `.js`, у которых ближайший родительский файл — этот `package.json`.

Файлы с расширением `.js` загружаются как ES-модули, если ближайший родительский `package.json` содержит поле верхнего уровня `"type"` со значением `"module"`.

Ближайший родительский `package.json` — это первый найденный `package.json` при подъёме от текущей папки к родительским, пока не встретится каталог `node_modules` или корень тома.

```json
// package.json
{
    "type": "module"
}
```

```bash
# In same folder as preceding package.json
node my-app.js # Runs as ES module
```

Если у ближайшего родительского `package.json` нет поля `"type"` или указано `"type": "commonjs"`, файлы `.js` обрабатываются как [CommonJS][commonjs]. Если дошли до корня тома и `package.json` не найден, файлы `.js` тоже считаются [CommonJS][commonjs].

Операторы `import` для файлов `.js` обрабатываются как ES-модули, если ближайший родительский `package.json` содержит `"type": "module"`.

```js
// my-app.js, part of the same example as above
import './startup.js'; // Loaded as ES module because of package.json
```

Независимо от значения `"type"` файлы `.mjs` всегда обрабатываются как ES-модули, а `.cjs` — как CommonJS.

### `"exports"` {: #exports}

<!-- YAML
added: v12.7.0
changes:
  - version:
    - v14.13.0
    - v12.20.0
    pr-url: https://github.com/nodejs/node/pull/34718
    description: Add support for `"exports"` patterns.
  - version:
    - v13.7.0
    - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/29866
    description: Unflag conditional exports.
  - version:
    - v13.7.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31008
    description: Implement logical conditional exports ordering.
  - version:
    - v13.7.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/31001
    description: Remove the `--experimental-conditional-exports` option. In 12.16.0, conditional exports are still behind `--experimental-modules`.
  - version:
    - v13.2.0
    - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/29978
    description: Implement conditional exports.
-->

Добавлено в: v12.7.0

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

```json
{
    "exports": "./index.js"
}
```

Поле `"exports"` задаёт [точки входа][entry points] пакета при импорте по имени через поиск в `node_modules` или через [самоссылку][self-reference] по имени пакета. Поддерживается в Node.js 12+ как альтернатива [`"main"`](#main): можно описать [экспорт подпутей][subpath exports] и [условные экспорты][conditional exports], скрывая внутренние неэкспортируемые модули.

[Условные экспорты][conditional exports] внутри `"exports"` позволяют задавать разные точки входа по среде, в том числе в зависимости от того, обращаются к пакету через `require` или через `import`.

Все пути в `"exports"` должны быть относительными file URL, начинающимися с `./`.

### `"imports"` {: #imports}

<!-- YAML
added:
 - v14.6.0
 - v12.19.0
-->

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

```json
// package.json
{
    "imports": {
        "#dep": {
            "node": "dep-node-native",
            "default": "./dep-polyfill.js"
        }
    },
    "dependencies": {
        "dep-node-native": "^1.0.0"
    }
}
```

Записи в поле `imports` должны быть строками, начинающимися с `#`.

Импорты пакета допускают сопоставление с внешними пакетами.

Это поле задаёт [импорт подпутей][subpath imports] для текущего пакета.

[commonjs]: modules.md
[conditional exports]: #conditional-exports
[es module]: esm.md
[es modules]: esm.md
[документацию node.js по этому разделу]: https://github.com/nodejs/node/blob/HEAD/doc/api/packages.md#conditions-definitions
[runtime keys]: https://runtime-keys.proposal.wintercg.org/
[syntax detection]: #syntax-detection
[typescript]: typescript.md
[webassembly modules]: esm.md#wasm-modules
[wintercg]: https://wintercg.org/
[`"exports"`]: #exports
[`"imports"`]: #imports
[`"main"`]: #main
[`"name"`]: #name
[`"type"`]: #type
[`--conditions` / `-c` flag]: #resolving-user-conditions
[`--experimental-addon-modules`]: cli.md#--experimental-addon-modules
[`--no-addons` flag]: cli.md#--no-addons
[`err_package_path_not_exported`]: errors.md#err_package_path_not_exported
[`err_unknown_file_extension`]: errors.md#err_unknown_file_extension
[`package.json`]: #nodejs-packagejson-field-definitions
[customization hooks]: module.md#customization-hooks
[entry points]: #package-entry-points
[folders as modules]: modules.md#folders-as-modules
[import maps]: https://github.com/WICG/import-maps
[load ecmascript modules from commonjs modules]: modules.md#loading-ecmascript-modules-using-require
[merve]: https://github.com/anonrig/merve
[packages folder mapping]: https://github.com/WICG/import-maps#packages-via-trailing-slashes
[self-reference]: #self-referencing-a-package-using-its-name
[subpath exports]: #subpath-exports
[subpath imports]: #subpath-imports
[the dual commonjs/es module packages section]: #dual-commonjses-module-packages
[the full specifier path]: esm.md#mandatory-file-extensions
[the package examples repository]: https://github.com/nodejs/package-examples
