---
title: Модули: пакеты
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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v14.13.0, v12.20.0 | Добавьте поддержку шаблонов экспорта. |
    | v14.6.0, v12.19.0 | Добавьте поле «импорт» пакета. |
    | v13.7.0, v12.17.0 | Снимите флажок условного экспорта. |
    | v13.7.0, v12.16.0 | Удалите опцию `--experimental-conditional-exports`. В версии 12.16.0 условный экспорт по-прежнему отстает от `--experimental-modules`. |
    | v13.6.0, v12.16.0 | Снимите флажок со ссылки на пакет, используя его имя. |
    | v12.7.0 | Представьте поле «exports» «package.json» как более мощную альтернативу классическому полю «main». |
    | v12.0.0 | Добавьте поддержку модулей ES, используя расширение файла `.js` через поле `"type"` package.json`. |

## Введение

Пакет — это дерево каталогов, описанное файлом `package.json`. Пакет
включает каталог с этим `package.json` и все подкаталоги до следующего каталога
с другим `package.json` или до каталога с именем `node_modules`.

Здесь — рекомендации авторам пакетов по `package.json`
и справочник по полям [`package.json`][], определённым в Node.js.

## Определение системы модулей {: #determining-module-system}

### Введение

Node.js будет считать следующее [ES-модулями][ES modules], если передать это в `node` как
начальный ввод или сослаться через операторы `import` или выражения `import()`:

* файлы с расширением `.mjs`;

* файлы с расширением `.js`, если ближайший родительский `package.json`
  содержит поле верхнего уровня [`"type"`][] со значением `"module"`;

* строки, переданные в `--eval` или в `node` через `STDIN` с флагом `--input-type=module`;

* код, который синтаксически разбирается только как [ES-модули][ES modules], например
  операторы `import`/`export` или `import.meta`, без явного указания интерпретации.
  Явные маркеры — расширения `.mjs`/`.cjs`, поле `"type"` в `package.json` со значениями
  `"module"` или `"commonjs"` или флаг `--input-type`. Динамические выражения `import()`
  допустимы и в CommonJS, и в ES-модулях и сами по себе не заставляют файл считаться ES-модулем.
  См. [Syntax detection][].

Node.js будет считать следующее [CommonJS][], если передать это в `node` как
начальный ввод или сослаться через `import`/`import()`:

* файлы с расширением `.cjs`;

* файлы с расширением `.js`, если ближайший родительский `package.json`
  содержит поле [`"type"`][] со значением `"commonjs"`;

* строки для `--eval` или `--print`, а также ввод через `STDIN` с флагом `--input-type=commonjs`;

* файлы `.js` без родительского `package.json` или при отсутствии поля `type` в ближайшем
  `package.json`, если код успешно выполняется как CommonJS. Иными словами, Node.js сначала
  пытается выполнить такие «двусмысленные» файлы как CommonJS и повторно оценивает их как ES-модули,
  если разбор как CommonJS не удался из-за синтаксиса ES-модуля.

Использование синтаксиса ES-модулей в «двусмысленных» файлах даёт накладные расходы, поэтому
рекомендуется везде, где возможно, быть явным. В частности, авторам пакетов следует всегда указывать
поле [`"type"`][] в `package.json`, даже если все исходники — CommonJS.
Явный `type` защитит пакет, если когда-нибудь изменится тип по умолчанию в Node.js, и упростит
работу сборщиков и загрузчиков при определении интерпретации файлов.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v22.7.0, v20.19.0 | Обнаружение синтаксиса включено по умолчанию. |

> Stability: 1.2 - Release candidate

Node.js просматривает исходный код двусмысленного ввода и, если обнаружен синтаксис ES-модуля,
обрабатывает ввод как ES-модуль.

Двусмысленный ввод — это:

* файлы с расширением `.js` или без расширения, при отсутствии управляющего `package.json`
  или при отсутствии в нём поля `type`;
* строковый ввод (`--eval` или `STDIN`), если не указан `--input-type`.

Синтаксис ES-модуля — это синтаксис, который при выполнении как CommonJS привёл бы к ошибке. К нему относятся:

* операторы `import` (но не выражения `import()` — они допустимы в CommonJS);
* операторы `export`;
* обращения к `import.meta`;
* `await` на верхнем уровне модуля;
* повторные лексические объявления переменных обёртки CommonJS (`require`, `module`,
  `exports`, `__dirname`, `__filename`).

### Разрешение и загрузка модулей {: #module-resolution-and-loading}

У Node.js два вида разрешения и загрузки модулей — в зависимости от способа запроса.

Когда модуль запрашивается через `require()` (по умолчанию в CommonJS и может быть создан
через `createRequire()` и в CommonJS, и в ES-модулях):

* Разрешение:
  * разрешение через `require()` поддерживает [папки как модули][folders as modules];
  * при отсутствии точного совпадения `require()` подставляет расширения (`.js`, `.json`, затем `.node`)
    и снова пытается разрешить [папки как модули][folders as modules];
  * по умолчанию URL в качестве спецификаторов не поддерживаются.
* Загрузка:
  * `.json` обрабатываются как JSON-текст;
  * `.node` — скомпилированные аддоны, загружаемые через `process.dlopen()`;
  * `.ts`, `.mts`, `.cts` — как [TypeScript][];
  * прочие расширения или отсутствие расширения — как JavaScript-текст;
  * `require()` может [загружать ES-модули из CommonJS][load ECMAScript modules from CommonJS modules] только если
    [ES-модуль][ES Module] _и его зависимости_ синхронны (нет top-level `await`).

Когда модуль запрашивается статическим `import` (только в ES-модулях)
или выражением `import()` (в CommonJS и ES-модулях):

* Разрешение:
  * у `import`/`import()` нет «папок как модулей», индекс каталога (например `'./startup/index.js'`) задаётся полностью;
  * поиск расширений не выполняется: для относительного или абсолютного file URL нужно указать расширение;
  * по умолчанию поддерживаются спецификаторы `file://` и `data:`.
* Загрузка:
  * `.json` — JSON-текст; при импорте JSON-модулей нужен атрибут типа импорта (например
    `import json from './data.json' with { type: 'json' }`);
  * `.node` — аддоны через `process.dlopen()`, если включён [`--experimental-addon-modules`][];
  * `.ts`, `.mts`, `.cts` — как [TypeScript][];
  * для JavaScript-текста допускаются только расширения `.js`, `.mjs`, `.cjs`;
  * `.wasm` — [WebAssembly-модули][WebAssembly modules];
  * иные расширения дают ошибку [`ERR_UNKNOWN_FILE_EXTENSION`][]; дополнительные расширения — через [хуки настройки][customization hooks];
  * `import`/`import()` могут загружать JavaScript-[модули CommonJS][commonjs]; для них используется [merve][], чтобы по возможности вывести именованные экспорты статическим анализом.

Независимо от способа запроса разрешение и загрузку можно настроить через [хуки настройки][customization hooks].

### `package.json` и расширения файлов

В пакете поле [`package.json`][] [`"type"`][] задаёт, как Node.js интерпретирует
файлы `.js`. Без `"type"` файлы `.js` считаются [CommonJS][].

`"type": "module"` означает, что `.js` в этом пакете — [ES module][].

`"type"` действует не только на точку входа (`node my-app.js`), но и на файлы,
подключаемые через `import` и `import()`.

```js
// my-app.js считается ES-модулем: рядом package.json с "type": "module".

import './startup/init.js';
// ES-модуль: в ./startup нет package.json, наследуется "type" с уровня выше.

import 'commonjs-package';
// CommonJS: у ./node_modules/commonjs-package/package.json нет "type" или "type": "commonjs".

import './node_modules/commonjs-package/index.js';
// То же: package.json пакета без "module" или с "commonjs".
```

Файлы `.mjs` всегда загружаются как [ES modules][], независимо от родительского `package.json`.

Файлы `.cjs` всегда загружаются как [CommonJS][], независимо от родительского `package.json`.

```js
import './legacy-file.cjs';
// CommonJS: расширение .cjs всегда CommonJS.

import 'commonjs-package/src/index.mjs';
// ES-модуль: .mjs всегда ES-модуль.
```

Расширения `.mjs` и `.cjs` позволяют смешивать типы в одном пакете:

* в пакете с `"type": "module"` отдельный файл можно пометить как [CommonJS][], давав ему `.cjs`
  (и `.js`, и `.mjs` в таком пакете — ES-модули);

* в пакете с `"type": "commonjs"` отдельный файл можно пометить как [ES module][], давав ему `.mjs`
  (и `.js`, и `.cjs` в таком пакете — CommonJS).

### Флаг `--input-type`

<!-- YAML
added: v12.0.0
-->

Строки для `--eval`/`-e` или из `STDIN` обрабатываются как [ES modules][], если задано
`--input-type=module`.

```bash
node --input-type=module --eval "import { sep } from 'node:path'; console.log(sep);"

echo "import { sep } from 'node:path'; console.log(sep);" | node --input-type=module
```

Также есть `--input-type=commonjs` для явного запуска строки как CommonJS. Если
`--input-type` не указан, по умолчанию это поведение CommonJS.

## Точки входа пакета

В `package.json` точки входа задают поля [`"main"`][] и [`"exports"`][]. Оба
подходят и для ES-модулей, и для CommonJS.

[`"main"`][] поддерживается во всех версиях Node.js, но задаёт только главную точку входа.

[`"exports"`][] — современная замена [`"main"`][]: несколько точек входа, условное
разрешение в разных средах и **запрет любых путей вне перечисленных в [`"exports"`][]**.
Так проще явно описать публичный API пакета.

Для новых пакетов под актуальные версии Node.js рекомендуется [`"exports"`][].
Для поддержки Node.js 10 и ниже нужен [`"main"`][]. Если заданы оба, [`"exports"`][]
имеет приоритет над [`"main"`][] в поддерживаемых версиях.

[Conditional exports][] внутри [`"exports"`][] задают разные точки входа по среде,
включая `require` и `import`. Про совместимый CommonJS и ES в одном пакете см.
[раздел про dual-пакеты][the dual CommonJS/ES module packages section].

Если у существующего пакета появляется [`"exports"`][], потребители не смогут использовать
непроэкспортированные пути, в том числе [`package.json`][] (например `require('your-package/package.json')`).
**Это обычно ломающее изменение.**

Чтобы ввести [`"exports"`][] без поломки, экспортируйте все ранее поддерживаемые пути;
лучше явно перечислить точки входа. Например, если раньше были `main`, `lib`, `feature`
и `package.json`, можно задать:

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

Так сохраняется обратная совместимость в минорных версиях; в следующем major можно
сузить экспорты только до нужных путей:

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

Для нового пакета рекомендуется поле [`"exports"`][]:

```json
{
  "exports": "./index.js"
}
```

Если задано [`"exports"`][], подпути пакета инкапсулированы и недоступны импортёрам.
Например, `require('pkg/subpath.js')` даёт [`ERR_PACKAGE_PATH_NOT_EXPORTED`][].

Так проще гарантировать контракт API и semver; полной изоляции нет: прямой
`require('/path/to/node_modules/pkg/subpath.js')` по-прежнему может загрузить файл.

Актуальные Node.js и сборщики поддерживают `"exports"`. Для старых версий можно
дублировать `"main"` тем же путём, что и `"exports"`:

```json
{
  "main": "./index.js",
  "exports": "./index.js"
}
```

### Subpath exports

<!-- YAML
added: v12.7.0
-->

When using the [`"exports"`][] field, custom subpaths can be defined along
with the main entry point by treating the main entry point as the
`"."` subpath:

```json
{
  "exports": {
    ".": "./index.js",
    "./submodule.js": "./src/submodule.js"
  }
}
```

Now only the defined subpath in [`"exports"`][] can be imported by a consumer:

```js
import submodule from 'es-module-package/submodule.js';
// Loads ./node_modules/es-module-package/src/submodule.js
```

While other subpaths will error:

```js
import submodule from 'es-module-package/private-module.js';
// Throws ERR_PACKAGE_PATH_NOT_EXPORTED
```

#### Extensions in subpaths

Package authors should provide either extensioned (`import 'pkg/subpath.js'`) or
extensionless (`import 'pkg/subpath'`) subpaths in their exports. This ensures
that there is only one subpath for each exported module so that all dependents
import the same consistent specifier, keeping the package contract clear for
consumers and simplifying package subpath completions.

Traditionally, packages tended to use the extensionless style, which has the
benefits of readability and of masking the true path of the file within the
package.

With [import maps][] now providing a standard for package resolution in browsers
and other JavaScript runtimes, using the extensionless style can result in
bloated import map definitions. Explicit file extensions can avoid this issue by
enabling the import map to utilize a [packages folder mapping][] to map multiple
subpaths where possible instead of a separate map entry per package subpath
export. This also mirrors the requirement of using [the full specifier path][]
in relative and absolute import specifiers.

#### Path Rules and Validation for Export Targets

When defining paths as targets in the [`"exports"`][] field, Node.js enforces
several rules to ensure security, predictability, and proper encapsulation.
Understanding these rules is crucial for authors publishing packages.

##### Targets must be relative URLs

All target paths in the [`"exports"`][] map (the values associated with export
keys) must be relative URL strings starting with `./`.

```json
// package.json
{
  "name": "my-package",
  "exports": {
    ".": "./dist/main.js",          // Correct
    "./feature": "./lib/feature.js", // Correct
    // "./origin-relative": "/dist/main.js", // Incorrect: Must start with ./
    // "./absolute": "file:///dev/null", // Incorrect: Must start with ./
    // "./outside": "../common/util.js" // Incorrect: Must start with ./
  }
}
```

Reasons for this behavior include:

* **Security:** Prevents exporting arbitrary files from outside the
  package's own directory.
* **Encapsulation:** Ensures all exported paths are resolved relative to
  the package root, making the package self-contained.

##### No path traversal or invalid segments

Export targets must not resolve to a location outside the package's root
directory. Additionally, path segments like `.` (single dot), `..` (double dot),
or `node_modules` (and their URL-encoded equivalents) are generally disallowed
within the `target` string after the initial `./` and in any `subpath` part
substituted into a target pattern.

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

### Exports sugar

<!-- YAML
added: v12.11.0
-->

If the `"."` export is the only export, the [`"exports"`][] field provides sugar
for this case being the direct [`"exports"`][] field value.

```json
{
  "exports": {
    ".": "./index.js"
  }
}
```

can be written:

```json
{
  "exports": "./index.js"
}
```

### Subpath imports

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.14.0 | Разрешить импорт подпутей, начинающихся с `#/`. |

In addition to the [`"exports"`][] field, there is a package `"imports"` field
to create private mappings that only apply to import specifiers from within the
package itself.

Entries in the `"imports"` field must always start with `#` to ensure they are
disambiguated from external package specifiers.

For example, the imports field can be used to gain the benefits of conditional
exports for internal modules:

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

where `import '#dep'` does not get the resolution of the external package
`dep-node-native` (including its exports in turn), and instead gets the local
file `./dep-polyfill.js` relative to the package in other environments.

Unlike the `"exports"` field, the `"imports"` field permits mapping to external
packages.

The resolution rules for the imports field are otherwise analogous to the
exports field.

### Subpath patterns

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v16.10.0, v14.19.0 | Поддержка трейлеров шаблонов в поле «Импорт». |
    | v16.9.0, v14.19.0 | Поддержка шаблонов прицепов. |

For packages with a small number of exports or imports, we recommend
explicitly listing each exports subpath entry. But for packages that have
large numbers of subpaths, this might cause `package.json` bloat and
maintenance issues.

For these use cases, subpath export patterns can be used instead:

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

**`*` maps expose nested subpaths as it is a string replacement syntax
only.**

All instances of `*` on the right hand side will then be replaced with this
value, including if it contains any `/` separators.

```js
import featureX from 'es-module-package/features/x.js';
// Loads ./node_modules/es-module-package/src/features/x.js

import featureY from 'es-module-package/features/y/y.js';
// Loads ./node_modules/es-module-package/src/features/y/y.js

import internalZ from '#internal/z.js';
// Loads ./src/internal/z.js
```

This is a direct static matching and replacement without any special handling
for file extensions. Including the `"*.js"` on both sides of the mapping
restricts the exposed package exports to only JS files.

The property of exports being statically enumerable is maintained with exports
patterns since the individual exports for a package can be determined by
treating the right hand side target pattern as a `**` glob against the list of
files within the package. Because `node_modules` paths are forbidden in exports
targets, this expansion is dependent on only the files of the package itself.

To exclude private subfolders from patterns, `null` targets can be used:

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

### Conditional exports

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v13.7.0, v12.16.0 | Снимите флажок условного экспорта. |

Conditional exports provide a way to map to different paths depending on
certain conditions. They are supported for both CommonJS and ES module imports.

For example, a package that wants to provide different ES module exports for
`require()` and `import` can be written:

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

Node.js implements the following conditions, listed in order from most
specific to least specific as conditions should be defined:

* `"node-addons"` - similar to `"node"` and matches for any Node.js environment.
  This condition can be used to provide an entry point which uses native C++
  addons as opposed to an entry point which is more universal and doesn't rely
  on native addons. This condition can be disabled via the
  [`--no-addons` flag][].
* `"node"` - matches for any Node.js environment. Can be a CommonJS or ES
  module file. _In most cases explicitly calling out the Node.js platform is
  not necessary._
* `"import"` - matches when the package is loaded via `import` or
  `import()`, or via any top-level import or resolve operation by the
  ECMAScript module loader. Applies regardless of the module format of the
  target file. _Always mutually exclusive with `"require"`._
* `"require"` - matches when the package is loaded via `require()`. The
  referenced file should be loadable with `require()` although the condition
  matches regardless of the module format of the target file. Expected
  formats include CommonJS, JSON, native addons, and ES modules. _Always mutually
  exclusive with `"import"`._
* `"module-sync"` - matches no matter the package is loaded via `import`,
  `import()` or `require()`. The format is expected to be ES modules that does
  not contain top-level await in its module graph - if it does,
  `ERR_REQUIRE_ASYNC_MODULE` will be thrown when the module is `require()`-ed.
* `"default"` - the generic fallback that always matches. Can be a CommonJS
  or ES module file. _This condition should always come last._

Within the [`"exports"`][] object, key order is significant. During condition
matching, earlier entries have higher priority and take precedence over later
entries. _The general rule is that conditions should be from most specific to
least specific in object order_.

Using the `"import"` and `"require"` conditions can lead to some hazards,
which are further explained in [the dual CommonJS/ES module packages section][].

The `"node-addons"` condition can be used to provide an entry point which
uses native C++ addons. However, this condition can be disabled via the
[`--no-addons` flag][]. When using `"node-addons"`, it's recommended to treat
`"default"` as an enhancement that provides a more universal entry point, e.g.
using WebAssembly instead of a native addon.

Conditional exports can also be extended to exports subpaths, for example:

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

Defines a package where `require('pkg/feature.js')` and
`import 'pkg/feature.js'` could provide different implementations between
Node.js and other JS environments.

When using environment branches, always include a `"default"` condition where
possible. Providing a `"default"` condition ensures that any unknown JS
environments are able to use this universal implementation, which helps avoid
these JS environments from having to pretend to be existing environments in
order to support packages with conditional exports. For this reason, using
`"node"` and `"default"` condition branches is usually preferable to using
`"node"` and `"browser"` condition branches.

### Nested conditions

In addition to direct mappings, Node.js also supports nested condition objects.

For example, to define a package that only has dual mode entry points for
use in Node.js but not the browser:

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

Conditions continue to be matched in order as with flat conditions. If
a nested condition does not have any mapping it will continue checking
the remaining conditions of the parent condition. In this way nested
conditions behave analogously to nested JavaScript `if` statements.

### Resolving user conditions

<!-- YAML
added:
  - v14.9.0
  - v12.19.0
-->

When running Node.js, custom user conditions can be added with the
`--conditions` flag:

```bash
node --conditions=development index.js
```

which would then resolve the `"development"` condition in package imports and
exports, while resolving the existing `"node"`, `"node-addons"`, `"default"`,
`"import"`, and `"require"` conditions as appropriate.

Any number of custom conditions can be set with repeat flags.

Typical conditions should only contain alphanumerical characters,
using ":", "-", or "=" as separators if necessary. Anything else may run
into compability issues outside of node.

In node, conditions have very few restrictions, but specifically these include:

1. They must contain at least one character.
2. They cannot start with "." since they may appear in places that also
   allow relative paths.
3. They cannot contain "," since they may be parsed as a comma-separated
   list by some CLI tools.
4. They cannot be integer property keys like "10" since that can have
   unexpected effects on property key ordering for JS objects.

### Community Conditions Definitions

Condition strings other than the `"import"`, `"require"`, `"node"`, `"module-sync"`,
`"node-addons"` and `"default"` conditions
[implemented in Node.js core](#conditional-exports) are ignored by default.

Other platforms may implement other conditions and user conditions can be
enabled in Node.js via the [`--conditions` / `-C` flag][].

Since custom package conditions require clear definitions to ensure correct
usage, a list of common known package conditions and their strict definitions
is provided below to assist with ecosystem coordination.

* `"types"` - can be used by typing systems to resolve the typing file for
  the given export. _This condition should always be included first._
* `"browser"` - any web browser environment.
* `"development"` - can be used to define a development-only environment
  entry point, for example to provide additional debugging context such as
  better error messages when running in a development mode. _Must always be
  mutually exclusive with `"production"`._
* `"production"` - can be used to define a production environment entry
  point. _Must always be mutually exclusive with `"development"`._

For other runtimes, platform-specific condition key definitions are maintained
by the [WinterCG][] in the [Runtime Keys][] proposal specification.

New conditions definitions may be added to this list by creating a pull request
to the [Node.js documentation for this section][]. The requirements for listing
a new condition definition here are that:

* The definition should be clear and unambiguous for all implementers.
* The use case for why the condition is needed should be clearly justified.
* There should exist sufficient existing implementation usage.
* The condition name should not conflict with another condition definition or
  condition in wide usage.
* The listing of the condition definition should provide a coordination
  benefit to the ecosystem that wouldn't otherwise be possible. For example,
  this would not necessarily be the case for company-specific or
  application-specific conditions.
* The condition should be such that a Node.js user would expect it to be in
  Node.js core documentation. The `"types"` condition is a good example: It
  doesn't really belong in the [Runtime Keys][] proposal but is a good fit
  here in the Node.js docs.

The above definitions may be moved to a dedicated conditions registry in due
course.

### Self-referencing a package using its name

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v13.6.0, v12.16.0 | Снимите флажок со ссылки на пакет, используя его имя. |

Within a package, the values defined in the package's
`package.json` [`"exports"`][] field can be referenced via the package's name.
For example, assuming the `package.json` is:

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

Then any module _in that package_ can reference an export in the package itself:

```js
// ./a-module.mjs
import { something } from 'a-package'; // Imports "something" from ./index.mjs.
```

Self-referencing is available only if `package.json` has [`"exports"`][], and
will allow importing only what that [`"exports"`][] (in the `package.json`)
allows. So the code below, given the previous package, will generate a runtime
error:

```js
// ./another-module.mjs

// Imports "another" from ./m.mjs. Fails because
// the "package.json" "exports" field
// does not provide an export named "./m.mjs".
import { another } from 'a-package/m.mjs';
```

Self-referencing is also available when using `require`, both in an ES module,
and in a CommonJS one. For example, this code will also work:

=== "CJS"

    ```js
    // ./a-module.js
    const { something } = require('a-package/foo.js'); // Loads from ./foo.js.
    ```

Finally, self-referencing also works with scoped packages. For example, this
code will also work:

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

## Dual CommonJS/ES module packages

See [the package examples repository][] for details.

## Node.js `package.json` field definitions

This section describes the fields used by the Node.js runtime. Other tools (such
as [npm](https://docs.npmjs.com/cli/v8/configuring-npm/package-json)) use
additional fields which are ignored by Node.js and not documented here.

The following fields in `package.json` files are used in Node.js:

* [`"name"`][] - Relevant when using named imports within a package. Also used
  by package managers as the name of the package.
* [`"main"`][] - The default module when loading the package, if exports is not
  specified, and in versions of Node.js prior to the introduction of exports.
* [`"type"`][] - The package type determining whether to load `.js` files as
  CommonJS or ES modules.
* [`"exports"`][] - Package exports and conditional exports. When present,
  limits which submodules can be loaded from within the package.
* [`"imports"`][] - Package imports, for use by modules within the package
  itself.

### `"name"`

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v13.6.0, v12.16.0 | Удалите опцию `--experimental-resolve-self`. |

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

```json
{
  "name": "package-name"
}
```

The `"name"` field defines your package's name. Publishing to the
_npm_ registry requires a name that satisfies
[certain requirements](https://docs.npmjs.com/files/package.json#name).

The `"name"` field can be used in addition to the [`"exports"`][] field to
[self-reference][] a package using its name.

### `"main"`

<!-- YAML
added: v0.4.0
-->

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

```json
{
  "main": "./index.js"
}
```

The `"main"` field defines the entry point of a package when imported by name
via a `node_modules` lookup.  Its value is a path.

The [`"exports"`][] field, if it exists, takes precedence over the
`"main"` field when importing the package by name.

It also defines the script that is used when the [package directory is loaded
via `require()`](modules.md#folders-as-modules).

=== "CJS"

    ```js
    // This resolves to ./path/to/directory/index.js.
    require('./path/to/directory');
    ```

### `"type"`

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v13.2.0, v12.17.0 | Снимите флаг `--experimental-modules`. |

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The `"type"` field defines the module format that Node.js uses for all
`.js` files that have that `package.json` file as their nearest parent.

Files ending with `.js` are loaded as ES modules when the nearest parent
`package.json` file contains a top-level field `"type"` with a value of
`"module"`.

The nearest parent `package.json` is defined as the first `package.json` found
when searching in the current folder, that folder's parent, and so on up
until a node\_modules folder or the volume root is reached.

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

If the nearest parent `package.json` lacks a `"type"` field, or contains
`"type": "commonjs"`, `.js` files are treated as [CommonJS][]. If the volume
root is reached and no `package.json` is found, `.js` files are treated as
[CommonJS][].

`import` statements of `.js` files are treated as ES modules if the nearest
parent `package.json` contains `"type": "module"`.

```js
// my-app.js, part of the same example as above
import './startup.js'; // Loaded as ES module because of package.json
```

Regardless of the value of the `"type"` field, `.mjs` files are always treated
as ES modules and `.cjs` files are always treated as CommonJS.

### `"exports"`

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v14.13.0, v12.20.0 | Добавьте поддержку шаблонов экспорта. |
    | v13.7.0, v12.17.0 | Снимите флажок условного экспорта. |
    | v13.7.0, v12.16.0 | Реализуйте логический условный порядок экспорта. |
    | v13.7.0, v12.16.0 | Удалите опцию `--experimental-conditional-exports`. В версии 12.16.0 условный экспорт по-прежнему отстает от `--experimental-modules`. |
    | v13.2.0, v12.16.0 | Реализуйте условный экспорт. |

* Type: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

```json
{
  "exports": "./index.js"
}
```

The `"exports"` field allows defining the [entry points][] of a package when
imported by name loaded either via a `node_modules` lookup or a
[self-reference][] to its own name. It is supported in Node.js 12+ as an
alternative to the [`"main"`][] that can support defining [subpath exports][]
and [conditional exports][] while encapsulating internal unexported modules.

[Conditional Exports][] can also be used within `"exports"` to define different
package entry points per environment, including whether the package is
referenced via `require` or via `import`.

All paths defined in the `"exports"` must be relative file URLs starting with
`./`.

### `"imports"`

<!-- YAML
added:
 - v14.6.0
 - v12.19.0
-->

* Type: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

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

Entries in the imports field must be strings starting with `#`.

Package imports permit mapping to external packages.

This field defines [subpath imports][] for the current package.

[CommonJS]: modules.md
[Conditional exports]: #conditional-exports
[ES module]: esm.md
[ES modules]: esm.md
[Node.js documentation for this section]: https://github.com/nodejs/node/blob/HEAD/doc/api/packages.md#conditions-definitions
[Runtime Keys]: https://runtime-keys.proposal.wintercg.org/
[Syntax detection]: #syntax-detection
[TypeScript]: typescript.md
[WebAssembly modules]: esm.md#wasm-modules
[WinterCG]: https://wintercg.org/
[`"exports"`]: #exports
[`"imports"`]: #imports
[`"main"`]: #main
[`"name"`]: #name
[`"type"`]: #type
[`--conditions` / `-C` flag]: #resolving-user-conditions
[`--experimental-addon-modules`]: cli.md#--experimental-addon-modules
[`--no-addons` flag]: cli.md#--no-addons
[`ERR_PACKAGE_PATH_NOT_EXPORTED`]: errors.md#err_package_path_not_exported
[`ERR_UNKNOWN_FILE_EXTENSION`]: errors.md#err_unknown_file_extension
[`package.json`]: #nodejs-packagejson-field-definitions
[customization hooks]: module.md#customization-hooks
[entry points]: #package-entry-points
[folders as modules]: modules.md#folders-as-modules
[import maps]: https://github.com/WICG/import-maps
[load ECMAScript modules from CommonJS modules]: modules.md#loading-ecmascript-modules-using-require
[merve]: https://github.com/anonrig/merve
[packages folder mapping]: https://github.com/WICG/import-maps#packages-via-trailing-slashes
[self-reference]: #self-referencing-a-package-using-its-name
[subpath exports]: #subpath-exports
[subpath imports]: #subpath-imports
[the dual CommonJS/ES module packages section]: #dual-commonjses-module-packages
[the full specifier path]: esm.md#mandatory-file-extensions
[the package examples repository]: https://github.com/nodejs/package-examples
