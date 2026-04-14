---
title: Модули ECMAScript (ESM)
description: Спецификаторы import, import.meta, атрибуты импорта, взаимодействие с CommonJS и алгоритм разрешения модулей в Node.js
---

# Модули: ECMAScript {: #modules-ecmascript-modules}

<!--introduced_in=v8.5.0-->

<!-- type=misc -->

<!-- YAML
added: v8.5.0
changes:
  - version:
    - v23.1.0
    - v22.12.0
    - v20.18.3
    - v18.20.5
    pr-url: https://github.com/nodejs/node/pull/55333
    description: Import attributes are no longer experimental.
  - version: v22.0.0
    pr-url: https://github.com/nodejs/node/pull/52104
    description: Drop support for import assertions.
  - version:
    - v21.0.0
    - v20.10.0
    - v18.20.0
    pr-url: https://github.com/nodejs/node/pull/50140
    description: Add experimental support for import attributes.
  - version:
    - v20.0.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/44710
    description: Module customization hooks are executed off the main thread.
  - version:
    - v18.6.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42623
    description: Add support for chaining module customization hooks.
  - version:
    - v17.1.0
    - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/40250
    description: Add experimental support for import assertions.
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/37468
    description:
      Consolidate customization hooks, removed `getFormat`, `getSource`,
      `transformSource`, and `getGlobalPreloadCode` hooks
      added `load` and `globalPreload` hooks
      allowed returning `format` from either `resolve` or `load` hooks.
  - version:
    - v15.3.0
    - v14.17.0
    - v12.22.0
    pr-url: https://github.com/nodejs/node/pull/35781
    description: Stabilize modules implementation.
  - version:
    - v14.13.0
    - v12.20.0
    pr-url: https://github.com/nodejs/node/pull/35249
    description: Support for detection of CommonJS named exports.
  - version: v14.8.0
    pr-url: https://github.com/nodejs/node/pull/34558
    description: Unflag Top-Level Await.
  - version:
    - v14.0.0
    - v13.14.0
    - v12.20.0
    pr-url: https://github.com/nodejs/node/pull/31974
    description: Remove experimental modules warning.
  - version:
    - v13.2.0
    - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/29866
    description: Loading ECMAScript modules no longer requires a command-line flag.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/26745
    description:
      Add support for ES modules using `.js` file extension via `package.json`
      `"type"` field.
-->

Добавлено в: v8.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.1.0, v22.12.0, v20.18.3, v18.20.5 | Атрибуты импорта больше не являются экспериментальными. |
    | v22.0.0 | Прекратить поддержку утверждений импорта. |
    | v21.0.0, v20.10.0, v18.20.0 | Добавьте экспериментальную поддержку атрибутов импорта. |
    | v20.0.0, v18.19.0 | Хуки настройки модуля выполняются вне основного потока. |
    | v18.6.0, v16.17.0 | Добавьте поддержку цепочки хуков настройки модулей. |
    | v17.1.0, v16.14.0 | Добавьте экспериментальную поддержку утверждений импорта. |
    | v17.0.0, v16.12.0 | Консолидация перехватчиков настройки, удалены перехватчики `getFormat`, `getSource`, `transformSource` и `getGlobalPreloadCode`, добавлены перехватчики `load` и `globalPreload`, позволяющие возвращать `format` из перехватчиков `resolve` или `load`. |
    | v15.3.0, v14.17.0, v12.22.0 | Стабилизировать реализацию модулей. |
    | v14.13.0, v12.20.0 | Поддержка обнаружения именованных экспортов CommonJS. |
    | v14.8.0 | Снимите флажок «Ожидание верхнего уровня». |
    | v14.0.0, v13.14.0, v12.20.0 | Удалить предупреждение об экспериментальных модулях. |
    | v13.2.0, v12.17.0 | Для загрузки модулей ECMAScript больше не требуется флаг командной строки. |
    | v12.0.0 | Добавьте поддержку модулей ES, используя расширение файла `.js` через поле `"type"` package.json`. |

> Stability: 2 - Stable

## Введение

<!--name=esm-->

Модули ECMAScript — [официальный стандартный формат][the official standard format] для упаковки кода JavaScript
для повторного использования. Модули задаются с помощью различных операторов [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) и
[`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).

Ниже пример ES-модуля, экспортирующего функцию:

```js
// addTwo.mjs
function addTwo(num) {
  return num + 2;
}

export { addTwo };
```

Ниже пример ES-модуля, импортирующего функцию из `addTwo.mjs`:

```js
// app.mjs
import { addTwo } from './addTwo.mjs';

// Prints: 6
console.log(addTwo(4));
```

Node.js полностью поддерживает модули ECMAScript в том виде, в каком они сейчас
описаны в спецификации, и обеспечивает взаимодействие между ними и изначальным
форматом модулей — [CommonJS][CommonJS].

<!-- Anchors to make sure old links find a target -->

<i id="esm_package_json_type_field"></i><i id="esm_package_scope_and_file_extensions"></i><i id="esm_input_type_flag"></i>

## Включение {: #enabling}

<!-- type=misc -->

У Node.js две системы модулей: модули [CommonJS][CommonJS] и модули ECMAScript.

Авторы могут указать Node.js интерпретировать JavaScript как ES-модуль через расширение
файла `.mjs`, поле `package.json` [`"type"`](packages.md#type) со значением `"module"`
или флаг [`--input-type`](cli.md#--input-typetype) со значением `"module"`. Это явные признаки того, что код
должен выполняться как ES-модуль.

Наоборот, авторы могут явно указать Node.js интерпретировать JavaScript как
CommonJS через расширение `.cjs`, поле `package.json` [`"type"`](packages.md#type) со значением
`"commonjs"` или флаг [`--input-type`](cli.md#--input-typetype) со значением `"commonjs"`.

Если в коде нет явных маркеров ни для одной из систем модулей, Node.js просматривает
исходный текст модуля на наличие синтаксиса ES-модулей. Если такой синтаксис найден,
код выполняется как ES-модуль; иначе модуль выполняется как CommonJS. Подробнее см.
[Determining module system][Determining module system].

<!-- Anchors to make sure old links find a target -->

<i id="esm_package_entry_points"></i><i id="esm_main_entry_point_export"></i><i id="esm_subpath_exports"></i><i id="esm_package_exports_fallbacks"></i><i id="esm_exports_sugar"></i><i id="esm_conditional_exports"></i><i id="esm_nested_conditions"></i><i id="esm_self_referencing_a_package_using_its_name"></i><i id="esm_internal_package_imports"></i><i id="esm_dual_commonjs_es_module_packages"></i><i id="esm_dual_package_hazard"></i><i id="esm_writing_dual_packages_while_avoiding_or_minimizing_hazards"></i><i id="esm_approach_1_use_an_es_module_wrapper"></i><i id="esm_approach_2_isolate_state"></i>

## Пакеты

Этот раздел перенесён в [Модули: пакеты](packages.md).

## Спецификаторы `import` {: #import-specifiers}

### Терминология {: #terminology}

_Спецификатор_ оператора `import` — это строка после ключевого слова `from`,
например `'node:path'` в `import { sep } from 'node:path'`. Спецификаторы также
используются в операторах `export from` и в качестве аргумента выражения `import()`.

Существует три типа спецификаторов:

* _Относительные спецификаторы_, например `'./startup.js'` или `'../config.mjs'`. Они
  указывают путь относительно расположения импортирующего файла. _Расширение файла
  для таких спецификаторов всегда обязательно._

* _Голые спецификаторы_, например `'some-package'` или `'some-package/shuffle'`. Они
  могут ссылаться на основную точку входа пакета по имени или на конкретный
  функциональный модуль внутри пакета с префиксом имени пакета, как в примерах.
  _Указывать расширение файла нужно только для пакетов без поля [`"exports"`](packages.md#exports)._

* _Абсолютные спецификаторы_, например `'file:///opt/nodejs/config.js'`. Они
  прямо и однозначно ссылаются на полный путь.

Разрешение голых спецификаторов выполняется [алгоритмом разрешения и загрузки модулей Node.js][Node.js Module Resolution And Loading Algorithm].
Все остальные спецификаторы разрешаются только стандартной семантикой относительного
разрешения [URL][URL].

Как и в CommonJS, файлы модулей внутри пакетов доступны добавлением пути к имени пакета,
если только в [`package.json`](packages.md#nodejs-packagejson-field-definitions) пакета нет поля [`"exports"`](packages.md#exports) — тогда файлы внутри
пакета доступны только по путям, заданным в [`"exports"`](packages.md#exports).

Подробнее о правилах разрешения пакетов для голых спецификаторов см. в [документации по пакетам](packages.md).

### Обязательные расширения файлов {: #mandatory-file-extensions}

При использовании ключевого слова `import` для разрешения относительных или абсолютных
спецификаторов нужно указать расширение файла. Индексы каталогов (например `'./startup/index.js'`)
также должны быть указаны полностью.

Такое поведение соответствует тому, как `import` ведёт себя в браузере при обычно
настроенном сервере.

### URL

ES-модули разрешаются и кэшируются как URL. Поэтому специальные символы нужно
[кодировать в процентах][percent-encoded], например `#` как `%23` и `?` как `%3F`.

Поддерживаются схемы URL `file:`, `node:` и `data:`. Спецификатор вроде
`'https://example.com/app.js'` нативно в Node.js не поддерживается, если не используется
[пользовательский HTTPS-загрузчик][custom https loader].

#### URL `file:`

Модуль загружается несколько раз, если спецификатор `import`, которым он разрешается,
имеет другой query или fragment.

```js
import './foo.mjs?query=1'; // loads ./foo.mjs with query of "?query=1"
import './foo.mjs?query=2'; // loads ./foo.mjs with query of "?query=2"
```

Корень тома можно задать через `/`, `//` или `file:///`. Учитывая различия между
[URL][URL] и разрешением путей (в том числе детали процентного кодирования), при импорте пути
рекомендуется использовать [url.pathToFileURL][url.pathToFileURL].

#### Импорты `data:` {: #data-imports}

<!-- YAML
added: v12.10.0
-->

[`data:` URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) поддерживаются для импорта со следующими MIME-типами:

* `text/javascript` — для ES-модулей
* `application/json` — для JSON
* `application/wasm` — для Wasm

```js
import 'data:text/javascript,console.log("hello!");';
import _ from 'data:application/json,"world!"' with { type: 'json' };
```

`data:` URL разрешают только [голые спецификаторы][Terminology] для встроенных модулей
и [абсолютные спецификаторы][Terminology]. Разрешение
[относительных спецификаторов][Terminology] не работает, потому что `data:` не является [специальной схемой][special scheme]. Например, попытка загрузить `./foo`
из `data:text/javascript,import "./foo";` не разрешается, потому что для `data:` URL
нет понятия относительного разрешения.

#### Импорты `node:`

<!-- YAML
added:
  - v14.13.1
  - v12.20.0
changes:
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37246
    description: Added `node:` import support to `require(...)`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.0.0, v14.18.0 | Добавлена ​​поддержка импорта `node:` в `require(...)`. |

URL `node:` поддерживаются как альтернативный способ загрузки встроенных модулей Node.js.
Эта схема URL позволяет ссылаться на встроенные модули допустимыми абсолютными строками URL.

```js
import fs from 'node:fs/promises';
```

## Атрибуты импорта {#import-assertions}

<!-- YAML
added:
  - v17.1.0
  - v16.14.0
changes:
  - version:
    - v21.0.0
    - v20.10.0
    - v18.20.0
    pr-url: https://github.com/nodejs/node/pull/50140
    description: Switch from Import Assertions to Import Attributes.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0, v18.20.0 | Переключитесь с импорта утверждений на импорт атрибутов. |

[Атрибуты импорта][Import Attributes MDN] — встроенный синтаксис для операторов импорта модулей,
чтобы передавать дополнительную информацию вместе со спецификатором модуля.

```js
import fooData from './foo.json' with { type: 'json' };

const { default: barData } =
  await import('./bar.json', { with: { type: 'json' } });
```

Node.js поддерживает только атрибут `type` со следующими значениями:

| Атрибут `type` | Назначение       |
| ---------------- | ---------------- |
| `'json'`         | [JSON-модули][JSON modules] |

Атрибут `type: 'json'` обязателен при импорте JSON-модулей.

## Встроенные модули

[Встроенные модули][Built-in modules] предоставляют именованные экспорты своего публичного API.
Также есть экспорт по умолчанию — это значение экспорта CommonJS.
Экспорт по умолчанию можно использовать, в том числе для изменения именованных
экспортов. Именованные экспорты встроенных модулей обновляются только при вызове
[`module.syncBuiltinESMExports()`](module.md#modulesyncbuiltinesmexports).

```js
import EventEmitter from 'node:events';
const e = new EventEmitter();
```

```js
import { readFile } from 'node:fs';
readFile('./foo.txt', (err, source) => {
  if (err) {
    console.error(err);
  } else {
    console.log(source);
  }
});
```

```js
import fs, { readFileSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { Buffer } from 'node:buffer';

fs.readFileSync = () => Buffer.from('Hello, ESM');
syncBuiltinESMExports();

fs.readFileSync === readFileSync;
```

> При импорте встроенных модулей все именованные экспорты (т.е. свойства объекта экспорта модуля)
> заполняются, даже если к ним не обращаются по отдельности.
> Из-за этого начальный импорт встроенных модулей может быть чуть медленнее, чем загрузка через
> `require()` или `process.getBuiltinModule()`, где объект экспорта модуля вычисляется сразу,
> но часть свойств может инициализироваться только при первом обращении к ним.

## Выражения `import()` {: #import-expressions}

[Динамический `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) даёт асинхронный способ импортировать модули. Он
поддерживается и в CommonJS, и в ES-модулях и может загружать как CommonJS,
так и ES-модули.

## `import.meta`

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Мета-свойство `import.meta` — это `Object` со следующими свойствами. Оно поддерживается только в ES-модулях.

### `import.meta.dirname` {: #importmetadirname}

<!-- YAML
added:
  - v21.2.0
  - v20.11.0
changes:
  - version:
     - v24.0.0
     - v22.16.0
    pr-url: https://github.com/nodejs/node/pull/58011
    description: This property is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.16.0 | Это свойство больше не является экспериментальным. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя каталога текущего модуля.

Это то же самое, что [`path.dirname()`](path.md#pathdirnamepath) от [`import.meta.filename`](#importmetafilename).

> **Ограничение**: свойство есть только у модулей с протоколом `file:`.

### `import.meta.filename` {: #importmetafilename}

<!-- YAML
added:
  - v21.2.0
  - v20.11.0
changes:
  - version:
     - v24.0.0
     - v22.16.0
    pr-url: https://github.com/nodejs/node/pull/58011
    description: This property is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.16.0 | Это свойство больше не является экспериментальным. |

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Полный абсолютный путь и имя файла текущего модуля с разрешёнными
  символическими ссылками.

Это то же самое, что [`url.fileURLToPath()`](url.md#urlfileurltopathurl-options) от [`import.meta.url`](#importmetaurl).

> **Ограничение**: это свойство поддерживают только локальные модули. У модулей без
> протокола `file:` его не будет.

### `import.meta.url` {: #importmetaurl}

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный `file:` URL модуля.

Определено так же, как в браузерах: URL текущего файла модуля.

Это позволяет удобно загружать файлы относительно модуля:

```js
import { readFileSync } from 'node:fs';
const buffer = readFileSync(new URL('./data.proto', import.meta.url));
```

### `import.meta.main` {: #importmetamain}

<!-- YAML
added:
  - v24.2.0
  - v22.18.0
-->

> Stability: 1.0 - Early development

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если текущий модуль — точка входа процесса; иначе `false`.

Эквивалентно `require.main === module` в CommonJS.

Аналогично `__name__ == "__main__"` в Python.

```js
export function foo() {
  return 'Hello, world';
}

function main() {
  const message = foo();
  console.log(message);
}

if (import.meta.main) main();
// `foo` can be imported from another module without possible side-effects from `main`
```

### `import.meta.resolve(specifier)` {: #importmetaresolvespecifier}

<!-- YAML
added:
  - v13.9.0
  - v12.16.2
changes:
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/49028
    description: No longer behind `--experimental-import-meta-resolve` CLI flag,
                 except for the non-standard `parentURL` parameter.
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/49038
    description: This API no longer throws when targeting `file:` URLs that do
                 not map to an existing file on the local FS.
  - version:
    - v20.0.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/44710
    description: This API now returns a string synchronously instead of a Promise.
  - version:
      - v16.2.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38587
    description: Add support for WHATWG `URL` object to `parentURL` parameter.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0, v18.19.0 | Больше нет флага CLI `--experimental-import-meta-resolve`, за исключением нестандартного параметра `parentURL`. |
    | v20.6.0, v18.19.0 | Этот API больше не выдает ошибку при выборе URL-адресов file:, которые не сопоставлены с существующим файлом в локальной файловой системе. |
    | v20.0.0, v18.19.0 | Этот API теперь синхронно возвращает строку вместо обещания. |
    | v16.2.0, v14.18.0 | Добавьте поддержку объекта WHATWG `URL` в параметр `parentURL`. |

> Stability: 1.2 - Release candidate

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Спецификатор модуля для разрешения относительно текущего модуля.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютная строка URL, в которую разрешился бы спецификатор.

[`import.meta.resolve`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve) — функция разрешения относительно модуля с областью действия
на каждый модуль; возвращает строку URL.

```js
const dependencyAsset = import.meta.resolve('component-lib/asset.css');
// file:///app/node_modules/component-lib/asset.css
import.meta.resolve('./dep.js');
// file:///app/dep.js
```

Поддерживаются все возможности разрешения модулей Node.js. Разрешение зависимостей
ограничено допустимыми разрешениями `exports` внутри пакета.

**Ограничения**:

* Могут выполняться синхронные операции с файловой системой, что
  сказывается на производительности аналогично `require.resolve`.
* В пользовательских загрузчиках эта возможность недоступна (возник бы
  взаимный тупик).

**Нестандартный API**:

При использовании флага `--experimental-import-meta-resolve` функция принимает
второй аргумент:

* `parent` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Необязательный абсолютный URL родительского модуля, от которого разрешать.
  **По умолчанию:** `import.meta.url`

## Взаимодействие с CommonJS

### Операторы `import`

Оператор `import` может ссылаться на ES-модуль или модуль CommonJS.
Операторы `import` допустимы только в ES-модулях, но динамические выражения [`import()`](#import-expressions)
поддерживаются в CommonJS для загрузки ES-модулей.

При импорте [модулей CommonJS](#commonjs-namespaces) объект
`module.exports` предоставляется как экспорт по умолчанию. Именованные экспорты могут быть
доступны благодаря статическому анализу как удобство для совместимости с экосистемой.

### `require`

В CommonJS `require` сейчас поддерживает загрузку только синхронных ES-модулей
(то есть ES-модулей без top-level `await`).

Подробнее см. [Loading ECMAScript modules using `require()`](modules.md#loading-ecmascript-modules-using-require).

### Пространства имён CommonJS {: #commonjs-namespaces}

<!-- YAML
added: v14.13.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/53848
    description: Added `'module.exports'` export marker to CJS namespaces.
-->

Добавлено в: v14.13.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Добавлен маркер экспорта module.exports в пространства имен CJS. |

Модули CommonJS состоят из объекта `module.exports` произвольного типа.

Чтобы это поддержать, при импорте CommonJS из ES-модуля строится обёртка
пространства имён для модуля CommonJS: у неё всегда есть ключ экспорта `default`,
указывающий на значение `module.exports` в CommonJS.

Дополнительно к исходному тексту модуля CommonJS применяется эвристический статический анализ,
чтобы составить по возможности статический список экспортов для пространства имён
из значений на `module.exports`. Это нужно, потому что пространства имён
должны быть построены до выполнения модуля CJS.

Объекты пространства имён CommonJS также предоставляют экспорт `default` как
именованный экспорт `'module.exports'`, чтобы однозначно показать, что в CommonJS
используется именно это значение, а не объект пространства имён. Это
согласуется с семантикой обработки имени экспорта `'module.exports'` в
поддержке взаимодействия [`require(esm)`](modules.md#loading-ecmascript-modules-using-require).

Импортируя модуль CommonJS, к нему можно надёжно обратиться через экспорт по умолчанию
ES-модуля или эквивалентный «синтаксический сахар»:

<!-- eslint-disable no-duplicate-imports -->

```js
import { default as cjs } from 'cjs';
// Identical to the above
import cjsSugar from 'cjs';

console.log(cjs);
console.log(cjs === cjsSugar);
// Prints:
//   <module.exports>
//   true
```

Этот экзотический объект пространства имён модуля можно увидеть напрямую при
`import * as m from 'cjs'` или динамическом импорте:

<!-- eslint-skip -->

```js
import * as m from 'cjs';
console.log(m);
console.log(m === await import('cjs'));
// Prints:
//   [Module] { default: <module.exports>, 'module.exports': <module.exports> }
//   true
```

Для лучшей совместимости с существующими практиками в экосистеме JS Node.js
дополнительно пытается определить именованные экспорты CommonJS для каждого импортируемого
модуля CommonJS и предоставить их как отдельные экспорты ES-модуля через статический
анализ.

Например, модуль CommonJS:

=== "CJS"

    ```js
    // cjs.cjs
    exports.name = 'exported';
    ```

Поддерживает именованные импорты в ES-модулях:

<!-- eslint-disable no-duplicate-imports -->

```js
import { name } from './cjs.cjs';
console.log(name);
// Prints: 'exported'

import cjs from './cjs.cjs';
console.log(cjs);
// Prints: { name: 'exported' }

import * as m from './cjs.cjs';
console.log(m);
// Prints:
//   [Module] {
//     default: { name: 'exported' },
//     'module.exports': { name: 'exported' },
//     name: 'exported'
//   }
```

Как видно из последнего примера с логированием экзотического объекта пространства имён,
экспорт `name` копируется с объекта `module.exports` и задаётся
напрямую в пространстве имён ES-модуля при импорте.

Обновления «живых» привязок или новые экспорты, добавленные в `module.exports`, для таких
именованных экспортов не отслеживаются.

Определение именованных экспортов опирается на типичные синтаксические шаблоны, но не всегда
даёт верный результат. В таких случаях лучше подойдёт импорт по умолчанию,
описанный выше.

Охват обнаружения именованных экспортов включает многие распространённые шаблоны экспорта,
реэкспорта и выходы сборщиков и транспайлеров. Точные правила см. в [merve][merve].

### Отличия ES-модулей от CommonJS

#### Нет `require`, `exports` и `module.exports`

В большинстве случаев для загрузки модулей CommonJS можно использовать ES-`import`.

При необходимости функцию `require` можно создать внутри ES-модуля через
[`module.createRequire()`](module.md#modulecreaterequirefilename).

#### Нет `__filename` и `__dirname`

Эти переменные CommonJS в ES-модулях недоступны.

Сценарии с `__filename` и `__dirname` можно воспроизвести через
[`import.meta.filename`](#importmetafilename) и [`import.meta.dirname`](#importmetadirname).

#### Нет загрузки аддонов

Импорты ES-модулей [аддоны][Addons] сейчас не поддерживают.

Их можно загрузить через [`module.createRequire()`](module.md#modulecreaterequirefilename) или
[`process.dlopen`](process.md#processdlopenmodule-filename-flags).

#### Нет `require.main`

Вместо `require.main === module` есть API [`import.meta.main`](#importmetamain).

#### Нет `require.resolve`

Относительное разрешение — через `new URL('./local', import.meta.url)`.

Полная замена `require.resolve` — API [import.meta.resolve][import.meta.resolve].

Либо можно использовать `module.createRequire()`.

#### Нет `NODE_PATH`

`NODE_PATH` не участвует в разрешении спецификаторов `import`. Если нужно подобное
поведение, используйте символические ссылки.

#### Нет `require.extensions`

`import` не использует `require.extensions`. Замену можно обеспечить
хуками настройки модулей.

#### Нет `require.cache`

`import` не использует `require.cache` — у загрузчика ES-модулей свой
отдельный кэш.

<i id="esm_experimental_json_modules"></i>

## JSON-модули {: #json-modules}

<!-- YAML
changes:
  - version:
    - v23.1.0
    - v22.12.0
    - v20.18.3
    - v18.20.5
    pr-url: https://github.com/nodejs/node/pull/55333
    description: JSON modules are no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.1.0, v22.12.0, v20.18.3, v18.20.5 | Модули JSON больше не являются экспериментальными. |

На JSON-файлы можно ссылаться через `import`:

```js
import packageConfig from './package.json' with { type: 'json' };
```

Синтаксис `with { type: 'json' }` обязателен; см. [Import Attributes][Import Attributes].

Импортируемый JSON даёт только экспорт `default`. Именованных экспортов нет.
В кэше CommonJS создаётся запись, чтобы избежать дублирования.
Тот же объект возвращается в CommonJS, если JSON-модуль уже был
импортирован с того же пути.

<i id="esm_experimental_wasm_modules"></i>

## Wasm-модули {: #wasm-modules}

<!-- YAML
changes:
  - version:
     - v24.5.0
     - v22.19.0
    pr-url: https://github.com/nodejs/node/pull/57038
    description: Wasm modules no longer require the `--experimental-wasm-modules` flag.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.5.0, v22.19.0 | Для модулей Wasm больше не требуется флаг --experimental-wasm-modules. |

Поддерживается импорт как экземпляров модулей WebAssembly, так и импортов в фазе исходника (source phase).

Оба варианта согласованы с
[ES Module Integration Proposal for WebAssembly][ES Module Integration Proposal for WebAssembly].

### Импорты Wasm в фазе исходника (Source Phase)

> Stability: 1.2 - Release candidate

<!-- YAML
added: v24.0.0
-->

Предложение [Source Phase Imports][Source Phase Imports] позволяет сочетанию ключевых слов `import source`
импортировать объект `WebAssembly.Module` напрямую, вместо получения
уже инстанцированного экземпляра модуля с зависимостями.

Это полезно, когда нужны кастомные инстанции Wasm, но разрешение и загрузка
по-прежнему через интеграцию ES-модулей.

Например, чтобы создать несколько экземпляров модуля или передать пользовательские импорты
в новый экземпляр `library.wasm`:

```js
import source libraryModule from './library.wasm';

const instance1 = await WebAssembly.instantiate(libraryModule, importObject1);

const instance2 = await WebAssembly.instantiate(libraryModule, importObject2);
```

Помимо статической фазы исходника есть динамический вариант фазы исходника
через синтаксис динамического импорта фазы `import.source`:

```js
const dynamicLibrary = await import.source('./library.wasm');

const instance = await WebAssembly.instantiate(dynamicLibrary, importObject);
```

### Встроенные строковые функции JavaScript

> Stability: 1.2 - Release candidate

<!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

При импорте модулей WebAssembly предложение
[WebAssembly JS String Builtins Proposal][WebAssembly JS String Builtins Proposal] автоматически включается через
интеграцию ESM. Это позволяет модулям WebAssembly напрямую использовать эффективные
встроенные строковые функции времени компиляции из пространства имён `wasm:js-string`.

Например, следующий Wasm-модуль экспортирует строковую функцию `getLength` с использованием
встроенной `length` из `wasm:js-string`:

```text
(module
  ;; Compile-time import of the string length builtin.
  (import "wasm:js-string" "length" (func $string_length (param externref) (result i32)))

  ;; Define getLength, taking a JS value parameter assumed to be a string,
  ;; calling string length on it and returning the result.
  (func $getLength (param $str externref) (result i32)
    local.get $str
    call $string_length
  )

  ;; Export the getLength function.
  (export "getLength" (func $get_length))
)
```

```js
import { getLength } from './string-len.wasm';
getLength('foo'); // Returns 3.
```

Встроенные функции Wasm — это импорты времени компиляции, связываемые при компиляции модуля,
а не при инстанцировании. Они ведут себя не как обычные импорты графа модулей
и их нельзя просмотреть через `WebAssembly.Module.imports(mod)`
или виртуализовать без перекомпиляции модуля через прямой API
`WebAssembly.compile` с отключёнными строковыми встроенными функциями.

Строковые константы также можно импортировать из встроенного URL импорта `wasm:js/string-constants`,
чтобы задать статические глобальные строки JS:

```text
(module
  (import "wasm:js/string-constants" "hello" (global $hello externref))
)
```

Импорт модуля в фазе исходника до инстанцирования тоже
автоматически использует встроенные функции времени компиляции:

```js
import source mod from './string-len.wasm';
const { exports: { getLength } } = await WebAssembly.instantiate(mod, {});
getLength('foo'); // Also returns 3.
```

### Импорты фазы экземпляра Wasm

> Stability: 1.1 - Active development

Импорты экземпляра позволяют импортировать любые `.wasm` как обычные модули,
поддерживая в свою очередь их импорты модулей.

Например, `index.js` с содержимым:

```js
import * as M from './library.wasm';
console.log(M);
```

при запуске:

```bash
node index.mjs
```

даст интерфейс экспортов для инстанцирования `library.wasm`.

### Зарезервированные пространства имён Wasm

<!-- YAML
added:
 - v24.5.0
 - v22.19.0
-->

При импорте экземпляров модулей WebAssembly нельзя использовать имена импортируемых модулей
или имена импорта/экспорта с зарезервированными префиксами:

* `wasm-js:` — зарезервировано для всех имён импорта модулей, имён модулей и имён экспорта.
* `wasm:` — зарезервировано для имён импорта модулей и имён экспорта (имена импортируемых модулей
  разрешены для поддержки будущих полифиллов встроенных функций).

Импорт модуля с перечисленными зарезервированными именами вызовет
`WebAssembly.LinkError`.

<i id="esm_experimental_top_level_await"></i>

## Top-level `await`

<!-- YAML
added: v14.8.0
-->

Ключевое слово `await` можно использовать в теле модуля ECMAScript на верхнем уровне.

Пусть в `a.mjs`

```js
export const five = await Promise.resolve(5);
```

а в `b.mjs`

```js
import { five } from './a.mjs';

console.log(five); // Logs `5`
```

```bash
node b.mjs # works
```

Если выражение top-level `await` никогда не завершится, процесс `node` завершится
с кодом `13` ([status code][status code]).

```js
import { spawn } from 'node:child_process';
import { execPath } from 'node:process';

spawn(execPath, [
  '--input-type=module',
  '--eval',
  // Never-resolving Promise:
  'await new Promise(() => {})',
]).once('exit', (code) => {
  console.log(code); // Logs `13`
});
```

<i id="esm_experimental_loaders"></i>

## Загрузчики (Loaders)

Документация по загрузчикам перенесена в
[Модули: хуки настройки][Module customization hooks].

## Алгоритм разрешения и загрузки

### Возможности

У стандартного резолвера такие свойства:

* разрешение на основе FileURL, как у ES-модулей;
* относительное и абсолютное разрешение URL;
* нет расширений по умолчанию;
* нет «главных» файлов каталогов;
* разрешение голых спецификаторов пакетов через поиск в `node_modules`;
* не падает на неизвестных расширениях или протоколах;
* при необходимости может передать в фазу загрузки подсказку о формате.

У стандартного загрузчика такие свойства:

* загрузка встроенных модулей через URL `node:`;
* «встроенная» загрузка модулей через URL `data:`;
* загрузка модулей `file:`;
* ошибка на любой другой протокол URL;
* ошибка на неизвестных расширениях при загрузке `file:`
  (поддерживаются только `.cjs`, `.js` и `.mjs`).

### Алгоритм разрешения

Алгоритм загрузки спецификатора ES-модуля задаётся методом
**ESM\_RESOLVE** ниже. Он возвращает разрешённый URL для
спецификатора модуля относительно `parentURL`.

Алгоритм разрешения определяет полный разрешённый URL для загрузки модуля
вместе с предполагаемым форматом модуля. Сам алгоритм разрешения не решает,
можно ли загрузить протокол разрешённого URL и допустимы ли расширения файлов —
эти проверки выполняет Node.js на фазе загрузки
(например, если запрошен URL с протоколом, отличным от
`file:`, `data:` или `node:`).

Алгоритм также пытается определить формат файла по
расширению (см. алгоритм `ESM_FILE_FORMAT` ниже). Если расширение
не распознано (например, это не `.mjs`, `.cjs` или
`.json`), возвращается формат `undefined`,
что приведёт к ошибке на фазе загрузки.

Формат модуля для разрешённого URL задаётся **ESM\_FILE\_FORMAT** — он возвращает
однозначный формат для любого файла. Формат _«module»_ соответствует ECMAScript-модулю,
а _«commonjs»_ — загрузке через устаревший загрузчик CommonJS. Дополнительные форматы, например _«addon»_, могут появиться в будущих версиях.

В приведённых ниже алгоритмах ошибки подпрограмм пробрасываются как ошибки
верхнего уровня, если явно не сказано иное.

_defaultConditions_ — массив имён условной среды,
`["node", "import"]`.

Резолвер может выбросить такие ошибки:

* _Invalid Module Specifier_: спецификатор модуля — недопустимый URL, имя пакета
  или подпуть пакета.
* _Invalid Package Configuration_: конфигурация `package.json` недопустима или
  содержит недопустимые данные.
* _Invalid Package Target_: в `exports` или `imports` пакета целевой модуль
  имеет недопустимый тип или строку.
* _Package Path Not Exported_: `exports` пакета не задаёт и не разрешает целевой
  подпуть для данного модуля.
* _Package Import Not Defined_: в `imports` пакета нет такого спецификатора.
* _Module Not Found_: запрошенный пакет или модуль не существует.
* _Unsupported Directory Import_: разрешённый путь указывает на каталог,
  импорт модулей в каталог не поддерживается.

<i id="resolver-algorithm-specification"></i>

### Спецификация алгоритма разрешения {: #resolution-algorithm-specification}

**ESM\_RESOLVE**(_specifier_, _parentURL_)

> 1. Let _resolved_ be **undefined**.
> 2. If _specifier_ is a valid URL, then
>    1. Set _resolved_ to the result of parsing and reserializing
>       _specifier_ as a URL.
> 3. Otherwise, if _specifier_ starts with _"/"_, _"./"_, or _"../"_, then
>    1. Set _resolved_ to the URL resolution of _specifier_ relative to
>       _parentURL_.
> 4. Otherwise, if _specifier_ starts with _"#"_, then
>    1. Set _resolved_ to the result of
>       **PACKAGE\_IMPORTS\_RESOLVE**(_specifier_,
>       _parentURL_, _defaultConditions_).
> 5. Otherwise,
>    1. Note: _specifier_ is now a bare specifier.
>    2. Set _resolved_ the result of
>       **PACKAGE\_RESOLVE**(_specifier_, _parentURL_).
> 6. Let _format_ be **undefined**.
> 7. If _resolved_ is a _"file:"_ URL, then
>    1. If _resolved_ contains any percent encodings of _"/"_ or _"\\"_ (_"%2F"_
>       and _"%5C"_ respectively), then
>       1. Throw an _Invalid Module Specifier_ error.
>    2. If the file at _resolved_ is a directory, then
>       1. Throw an _Unsupported Directory Import_ error.
>    3. If the file at _resolved_ does not exist, then
>       1. Throw a _Module Not Found_ error.
>    4. Set _resolved_ to the real path of _resolved_, maintaining the
>       same URL querystring and fragment components.
>    5. Set _format_ to the result of **ESM\_FILE\_FORMAT**(_resolved_).
> 8. Otherwise,
>    1. Set _format_ the module format of the content type associated with the
>       URL _resolved_.
> 9. Return _format_ and _resolved_ to the loading phase

**PACKAGE\_RESOLVE**(_packageSpecifier_, _parentURL_)

> 1. Let _packageName_ be **undefined**.
> 2. If _packageSpecifier_ is an empty string, then
>    1. Throw an _Invalid Module Specifier_ error.
> 3. If _packageSpecifier_ is a Node.js builtin module name, then
>    1. Return the string _"node:"_ concatenated with _packageSpecifier_.
> 4. If _packageSpecifier_ does not start with _"@"_, then
>    1. Set _packageName_ to the substring of _packageSpecifier_ until the first
>       _"/"_ separator or the end of the string.
> 5. Otherwise,
>    1. If _packageSpecifier_ does not contain a _"/"_ separator, then
>       1. Throw an _Invalid Module Specifier_ error.
>    2. Set _packageName_ to the substring of _packageSpecifier_
>       until the second _"/"_ separator or the end of the string.
> 6. If _packageName_ starts with _"."_ or contains _"\\"_ or _"%"_, then
>    1. Throw an _Invalid Module Specifier_ error.
> 7. Let _packageSubpath_ be _"."_ concatenated with the substring of
>    _packageSpecifier_ from the position at the length of _packageName_.
> 8. Let _selfUrl_ be the result of
>    **PACKAGE\_SELF\_RESOLVE**(_packageName_, _packageSubpath_, _parentURL_).
> 9. If _selfUrl_ is not **undefined**, return _selfUrl_.
> 10. While _parentURL_ is not the file system root,
>     1. Let _packageURL_ be the URL resolution of _"node\_modules/"_
>        concatenated with _packageName_, relative to _parentURL_.
>     2. Set _parentURL_ to the parent folder URL of _parentURL_.
>     3. If the folder at _packageURL_ does not exist, then
>        1. Continue the next loop iteration.
>     4. Let _pjson_ be the result of **READ\_PACKAGE\_JSON**(_packageURL_).
>     5. If _pjson_ is not **null** and _pjson_._exports_ is not **null** or
>        **undefined**, then
>        1. Return the result of **PACKAGE\_EXPORTS\_RESOLVE**(_packageURL_,
>           _packageSubpath_, _pjson.exports_, _defaultConditions_).
>     6. Otherwise, if _packageSubpath_ is equal to _"."_, then
>        1. If _pjson.main_ is a string, then
>           1. Return the URL resolution of _main_ in _packageURL_.
>     7. Otherwise,
>        1. Return the URL resolution of _packageSubpath_ in _packageURL_.
> 11. Throw a _Module Not Found_ error.

**PACKAGE\_SELF\_RESOLVE**(_packageName_, _packageSubpath_, _parentURL_)

> 1. Let _packageURL_ be the result of **LOOKUP\_PACKAGE\_SCOPE**(_parentURL_).
> 2. If _packageURL_ is **null**, then
>    1. Return **undefined**.
> 3. Let _pjson_ be the result of **READ\_PACKAGE\_JSON**(_packageURL_).
> 4. If _pjson_ is **null** or if _pjson_._exports_ is **null** or
>    **undefined**, then
>    1. Return **undefined**.
> 5. If _pjson.name_ is equal to _packageName_, then
>    1. Return the result of **PACKAGE\_EXPORTS\_RESOLVE**(_packageURL_,
>       _packageSubpath_, _pjson.exports_, _defaultConditions_).
> 6. Otherwise, return **undefined**.

**PACKAGE\_EXPORTS\_RESOLVE**(_packageURL_, _subpath_, _exports_, _conditions_)

Note: This function is directly invoked by the CommonJS resolution algorithm.

> 1. If _exports_ is an Object with both a key starting with _"."_ and a key not
>    starting with _"."_, throw an _Invalid Package Configuration_ error.
> 2. If _subpath_ is equal to _"."_, then
>    1. Let _mainExport_ be **undefined**.
>    2. If _exports_ is a String or Array, or an Object containing no keys
>       starting with _"."_, then
>       1. Set _mainExport_ to _exports_.
>    3. Otherwise if _exports_ is an Object containing a _"."_ property, then
>       1. Set _mainExport_ to _exports_\[_"."_].
>    4. If _mainExport_ is not **undefined**, then
>       1. Let _resolved_ be the result of **PACKAGE\_TARGET\_RESOLVE**(
>          _packageURL_, _mainExport_, **null**, **false**, _conditions_).
>       2. If _resolved_ is not **null** or **undefined**, return _resolved_.
> 3. Otherwise, if _exports_ is an Object and all keys of _exports_ start with
>    _"."_, then
>    1. Assert: _subpath_ begins with _"./"_.
>    2. Let _resolved_ be the result of **PACKAGE\_IMPORTS\_EXPORTS\_RESOLVE**(
>       _subpath_, _exports_, _packageURL_, **false**, _conditions_).
>    3. If _resolved_ is not **null** or **undefined**, return _resolved_.
> 4. Throw a _Package Path Not Exported_ error.

**PACKAGE\_IMPORTS\_RESOLVE**(_specifier_, _parentURL_, _conditions_)

Note: This function is directly invoked by the CommonJS resolution algorithm.

> 1. Assert: _specifier_ begins with _"#"_.
> 2. If _specifier_ is exactly equal to _"#"_, then
>    1. Throw an _Invalid Module Specifier_ error.
> 3. Let _packageURL_ be the result of **LOOKUP\_PACKAGE\_SCOPE**(_parentURL_).
> 4. If _packageURL_ is not **null**, then
>    1. Let _pjson_ be the result of **READ\_PACKAGE\_JSON**(_packageURL_).
>    2. If _pjson.imports_ is a non-null Object, then
>       1. Let _resolved_ be the result of
>          **PACKAGE\_IMPORTS\_EXPORTS\_RESOLVE**(
>          _specifier_, _pjson.imports_, _packageURL_, **true**, _conditions_).
>       2. If _resolved_ is not **null** or **undefined**, return _resolved_.
> 5. Throw a _Package Import Not Defined_ error.

**PACKAGE\_IMPORTS\_EXPORTS\_RESOLVE**(_matchKey_, _matchObj_, _packageURL_,
_isImports_, _conditions_)

> 1. If _matchKey_ ends in _"/"_, then
>    1. Throw an _Invalid Module Specifier_ error.
> 2. If _matchKey_ is a key of _matchObj_ and does not contain _"\*"_, then
>    1. Let _target_ be the value of _matchObj_\[_matchKey_].
>    2. Return the result of **PACKAGE\_TARGET\_RESOLVE**(_packageURL_,
>       _target_, **null**, _isImports_, _conditions_).
> 3. Let _expansionKeys_ be the list of keys of _matchObj_ containing only a
>    single _"\*"_, sorted by the sorting function **PATTERN\_KEY\_COMPARE**
>    which orders in descending order of specificity.
> 4. For each key _expansionKey_ in _expansionKeys_, do
>    1. Let _patternBase_ be the substring of _expansionKey_ up to but excluding
>       the first _"\*"_ character.
>    2. If _matchKey_ starts with but is not equal to _patternBase_, then
>       1. Let _patternTrailer_ be the substring of _expansionKey_ from the
>          index after the first _"\*"_ character.
>       2. If _patternTrailer_ has zero length, or if _matchKey_ ends with
>          _patternTrailer_ and the length of _matchKey_ is greater than or
>          equal to the length of _expansionKey_, then
>          1. Let _target_ be the value of _matchObj_\[_expansionKey_].
>          2. Let _patternMatch_ be the substring of _matchKey_ starting at the
>             index of the length of _patternBase_ up to the length of
>             _matchKey_ minus the length of _patternTrailer_.
>          3. Return the result of **PACKAGE\_TARGET\_RESOLVE**(_packageURL_,
>             _target_, _patternMatch_, _isImports_, _conditions_).
> 5. Return **null**.

**PATTERN\_KEY\_COMPARE**(_keyA_, _keyB_)

> 1. Assert: _keyA_ contains only a single _"\*"_.
> 2. Assert: _keyB_ contains only a single _"\*"_.
> 3. Let _baseLengthA_ be the index of _"\*"_ in _keyA_.
> 4. Let _baseLengthB_ be the index of _"\*"_ in _keyB_.
> 5. If _baseLengthA_ is greater than _baseLengthB_, return -1.
> 6. If _baseLengthB_ is greater than _baseLengthA_, return 1.
> 7. If the length of _keyA_ is greater than the length of _keyB_, return -1.
> 8. If the length of _keyB_ is greater than the length of _keyA_, return 1.
> 9. Return 0.

**PACKAGE\_TARGET\_RESOLVE**(_packageURL_, _target_, _patternMatch_,
_isImports_, _conditions_)

> 1. If _target_ is a String, then
>    1. If _target_ does not start with _"./"_, then
>       1. If _isImports_ is **false**, or if _target_ starts with _"../"_ or
>          _"/"_, or if _target_ is a valid URL, then
>          1. Throw an _Invalid Package Target_ error.
>       2. If _patternMatch_ is a String, then
>          1. Return **PACKAGE\_RESOLVE**(_target_ with every instance of _"\*"_
>             replaced by _patternMatch_, _packageURL_ + _"/"_).
>       3. Return **PACKAGE\_RESOLVE**(_target_, _packageURL_ + _"/"_).
>    2. If _target_ split on _"/"_ or _"\\"_ contains any _""_, _"."_, _".."_,
>       or _"node\_modules"_ segments after the first _"."_ segment, case
>       insensitive and including percent encoded variants, throw an _Invalid
>       Package Target_ error.
>    3. Let _resolvedTarget_ be the URL resolution of the concatenation of
>       _packageURL_ and _target_.
>    4. Assert: _packageURL_ is contained in _resolvedTarget_.
>    5. If _patternMatch_ is **null**, then
>       1. Return _resolvedTarget_.
>    6. If _patternMatch_ split on _"/"_ or _"\\"_ contains any _""_, _"."_,
>       _".."_, or _"node\_modules"_ segments, case insensitive and including
>       percent encoded variants, throw an _Invalid Module Specifier_ error.
>    7. Return the URL resolution of _resolvedTarget_ with every instance of
>       _"\*"_ replaced with _patternMatch_.
> 2. Otherwise, if _target_ is a non-null Object, then
>    1. If _target_ contains any index property keys, as defined in ECMA-262
>       [6.1.7 Array Index][6.1.7 Array Index], throw an _Invalid Package Configuration_ error.
>    2. For each property _p_ of _target_, in object insertion order as,
>       1. If _p_ equals _"default"_ or _conditions_ contains an entry for _p_,
>          then
>          1. Let _targetValue_ be the value of the _p_ property in _target_.
>          2. Let _resolved_ be the result of **PACKAGE\_TARGET\_RESOLVE**(
>             _packageURL_, _targetValue_, _patternMatch_, _isImports_,
>             _conditions_).
>          3. If _resolved_ is equal to **undefined**, continue the loop.
>          4. Return _resolved_.
>    3. Return **undefined**.
> 3. Otherwise, if _target_ is an Array, then
>    1. If \_target.length is zero, return **null**.
>    2. For each item _targetValue_ in _target_, do
>       1. Let _resolved_ be the result of **PACKAGE\_TARGET\_RESOLVE**(
>          _packageURL_, _targetValue_, _patternMatch_, _isImports_,
>          _conditions_), continuing the loop on any _Invalid Package Target_
>          error.
>       2. If _resolved_ is **undefined**, continue the loop.
>       3. Return _resolved_.
>    3. Return or throw the last fallback resolution **null** return or error.
> 4. Otherwise, if _target_ is _null_, return **null**.
> 5. Otherwise throw an _Invalid Package Target_ error.

**ESM\_FILE\_FORMAT**(_url_)

> 1. Assert: _url_ corresponds to an existing file.
> 2. If _url_ ends in _".mjs"_, then
>    1. Return _"module"_.
> 3. If _url_ ends in _".cjs"_, then
>    1. Return _"commonjs"_.
> 4. If _url_ ends in _".json"_, then
>    1. Return _"json"_.
> 5. If _url_ ends in
>    _".wasm"_, then
>    1. Return _"wasm"_.
> 6. If `--experimental-addon-modules` is enabled and _url_ ends in
>    _".node"_, then
>    1. Return _"addon"_.
> 7. Let _packageURL_ be the result of **LOOKUP\_PACKAGE\_SCOPE**(_url_).
> 8. Let _pjson_ be the result of **READ\_PACKAGE\_JSON**(_packageURL_).
> 9. Let _packageType_ be **null**.
> 10. If _pjson?.type_ is _"module"_ or _"commonjs"_, then
>     1. Set _packageType_ to _pjson.type_.
> 11. If _url_ ends in _".js"_, then
>     1. If _packageType_ is not **null**, then
>        1. Return _packageType_.
>     2. If the result of **DETECT\_MODULE\_SYNTAX**(_source_) is true, then
>        1. Return _"module"_.
>     3. Return _"commonjs"_.
> 12. If _url_ does not have any extension, then
>     1. If _packageType_ is _"module"_ and the file at _url_ contains the
>        "application/wasm" content type header for a WebAssembly module, then
>        1. Return _"wasm"_.
>     2. If _packageType_ is not **null**, then
>        1. Return _packageType_.
>     3. If the result of **DETECT\_MODULE\_SYNTAX**(_source_) is true, then
>        1. Return _"module"_.
>     4. Return _"commonjs"_.
> 13. Return **undefined** (will throw during load phase).

**LOOKUP\_PACKAGE\_SCOPE**(_url_)

> 1. Let _scopeURL_ be _url_.
> 2. While _scopeURL_ is not the file system root,
>    1. Set _scopeURL_ to the parent URL of _scopeURL_.
>    2. If _scopeURL_ ends in a _"node\_modules"_ path segment, return **null**.
>    3. Let _pjsonURL_ be the resolution of _"package.json"_ within
>       _scopeURL_.
>    4. if the file at _pjsonURL_ exists, then
>       1. Return _scopeURL_.
> 3. Return **null**.

**READ\_PACKAGE\_JSON**(_packageURL_)

> 1. Let _pjsonURL_ be the resolution of _"package.json"_ within _packageURL_.
> 2. If the file at _pjsonURL_ does not exist, then
>    1. Return **null**.
> 3. If the file at _packageURL_ does not parse as valid JSON, then
>    1. Throw an _Invalid Package Configuration_ error.
> 4. Return the parsed JSON source of the file at _pjsonURL_.

**DETECT\_MODULE\_SYNTAX**(_source_)

> 1. Parse _source_ as an ECMAScript module.
> 2. If the parse is successful, then
>    1. If _source_ contains top-level `await`, static `import` or `export`
>       statements, or `import.meta`, return **true**.
>    2. If _source_ contains a top-level lexical declaration (`const`, `let`,
>       or `class`) of any of the CommonJS wrapper variables (`require`,
>       `exports`, `module`, `__filename`, or `__dirname`) then return **true**.
> 3. Return **false**.

### Настройка алгоритма разрешения спецификаторов ESM

[Module customization hooks][Module customization hooks] дают способ изменить алгоритм разрешения
спецификаторов ESM. Пример с разрешением в стиле CommonJS для спецификаторов ESM —
[commonjs-extension-resolution-loader][commonjs-extension-resolution-loader].

<!-- Note: The merve link should be kept in-sync with the deps version -->

[6.1.7 Array Index]: https://tc39.es/ecma262/#integer-index
[Addons]: addons.md
[Built-in modules]: modules.md#built-in-modules
[CommonJS]: modules.md
[Determining module system]: packages.md#determining-module-system
[Dynamic `import()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import
[ES Module Integration Proposal for WebAssembly]: https://github.com/webassembly/esm-integration
[Import Attributes]: #import-attributes
[Import Attributes MDN]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with
[JSON modules]: #json-modules
[Loading ECMAScript modules using `require()`]: modules.md#loading-ecmascript-modules-using-require
[Module customization hooks]: module.md#customization-hooks
[Node.js Module Resolution And Loading Algorithm]: #resolution-algorithm-specification
[Source Phase Imports]: https://github.com/tc39/proposal-source-phase-imports
[Terminology]: #terminology
[URL]: https://url.spec.whatwg.org/
[WebAssembly JS String Builtins Proposal]: https://github.com/WebAssembly/js-string-builtins
[`"exports"`]: packages.md#exports
[`"type"`]: packages.md#type
[`--input-type`]: cli.md#--input-typetype
[`data:` URLs]: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
[`export`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
[`import()`]: #import-expressions
[`import.meta.dirname`]: #importmetadirname
[`import.meta.filename`]: #importmetafilename
[`import.meta.main`]: #importmetamain
[`import.meta.resolve`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve
[`import.meta.url`]: #importmetaurl
[`import`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[`module.createRequire()`]: module.md#modulecreaterequirefilename
[`module.syncBuiltinESMExports()`]: module.md#modulesyncbuiltinesmexports
[`package.json`]: packages.md#nodejs-packagejson-field-definitions
[`path.dirname()`]: path.md#pathdirnamepath
[`process.dlopen`]: process.md#processdlopenmodule-filename-flags
[`require(esm)`]: modules.md#loading-ecmascript-modules-using-require
[`url.fileURLToPath()`]: url.md#urlfileurltopathurl-options
[commonjs-extension-resolution-loader]: https://github.com/nodejs/loaders-test/tree/main/commonjs-extension-resolution-loader
[custom https loader]: module.md#import-from-https
[import.meta.resolve]: #importmetaresolvespecifier
[merve]: https://github.com/anonrig/merve/tree/v1.0.0
[percent-encoded]: url.md#percent-encoding-in-urls
[special scheme]: https://url.spec.whatwg.org/#special-scheme
[status code]: process.md#exit-codes
[the official standard format]: https://tc39.github.io/ecma262/#sec-modules
[url.pathToFileURL]: url.md#urlpathtofileurlpath-options
