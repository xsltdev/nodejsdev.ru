---
title: Модули ECMAScript (ESM)
description: Спецификаторы import, import.meta, атрибуты импорта, взаимодействие с CommonJS и алгоритм разрешения модулей в Node.js
---

# Модули: ECMAScript {#modules-ecmascript-modules}

Добавлено в: v8.5.0

!!!success "Стабильность: 2 – Стабильная"

## Введение

Модули ECMAScript — [официальный стандартный формат](https://tc39.github.io/ecma262/#sec-modules) для упаковки кода JavaScript для повторного использования. Модули задаются с помощью различных операторов [`import`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) и [`export`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export).

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

Node.js полностью поддерживает модули ECMAScript в том виде, в каком они сейчас описаны в спецификации, и обеспечивает взаимодействие между ними и изначальным форматом модулей — [CommonJS](modules.md).

## Включение {#enabling}

У Node.js две системы модулей: модули [CommonJS](modules.md) и модули ECMAScript.

Авторы могут указать Node.js интерпретировать JavaScript как ES-модуль через расширение файла `.mjs`, поле `package.json` [`"type"`](packages.md#type) со значением `"module"` или флаг [`--input-type`](cli.md#--input-typetype) со значением `"module"`. Это явные признаки того, что код должен выполняться как ES-модуль.

Наоборот, авторы могут явно указать Node.js интерпретировать JavaScript как CommonJS через расширение `.cjs`, поле `package.json` [`"type"`](packages.md#type) со значением `"commonjs"` или флаг [`--input-type`](cli.md#--input-typetype) со значением `"commonjs"`.

Если в коде нет явных маркеров ни для одной из систем модулей, Node.js просматривает исходный текст модуля на наличие синтаксиса ES-модулей. Если такой синтаксис найден, код выполняется как ES-модуль; иначе модуль выполняется как CommonJS. Подробнее см. [Определение системы модулей](packages.md#determining-module-system).

## Пакеты

Этот раздел перенесён в [Модули: пакеты](packages.md).

## Спецификаторы `import` {#import-specifiers}

### Терминология {#terminology}

_Спецификатор_ оператора `import` — это строка после ключевого слова `from`, например `'node:path'` в `import { sep } from 'node:path'`. Спецификаторы также используются в операторах `export from` и в качестве аргумента выражения `import()`.

Существует три типа спецификаторов:

-   _Относительные спецификаторы_, например `'./startup.js'` или `'../config.mjs'`. Они указывают путь относительно расположения импортирующего файла. _Расширение файла для таких спецификаторов всегда обязательно._

-   _Голые спецификаторы_, например `'some-package'` или `'some-package/shuffle'`. Они могут ссылаться на основную точку входа пакета по имени или на конкретный функциональный модуль внутри пакета с префиксом имени пакета, как в примерах. _Указывать расширение файла нужно только для пакетов без поля [`"exports"`](packages.md#exports)._

-   _Абсолютные спецификаторы_, например `'file:///opt/nodejs/config.js'`. Они прямо и однозначно ссылаются на полный путь.

Разрешение голых спецификаторов выполняется [алгоритмом разрешения и загрузки модулей Node.js](#resolution-algorithm-specification). Все остальные спецификаторы разрешаются только стандартной семантикой относительного разрешения [URL](https://url.spec.whatwg.org/).

Как и в CommonJS, файлы модулей внутри пакетов доступны добавлением пути к имени пакета, если только в [`package.json`](packages.md#nodejs-packagejson-field-definitions) пакета нет поля [`"exports"`](packages.md#exports) — тогда файлы внутри пакета доступны только по путям, заданным в [`"exports"`](packages.md#exports).

Подробнее о правилах разрешения пакетов для голых спецификаторов см. в [документации по пакетам](packages.md).

### Обязательные расширения файлов {#mandatory-file-extensions}

При использовании ключевого слова `import` для разрешения относительных или абсолютных спецификаторов нужно указать расширение файла. Индексы каталогов (например `'./startup/index.js'`) также должны быть указаны полностью.

Такое поведение соответствует тому, как `import` ведёт себя в браузере при обычно настроенном сервере.

### URL

ES-модули разрешаются и кэшируются как URL. Поэтому специальные символы нужно [кодировать в процентах](url.md#percent-encoding-in-urls), например `#` как `%23` и `?` как `%3F`.

Поддерживаются схемы URL `file:`, `node:` и `data:`. Спецификатор вроде `'https://example.com/app.js'` нативно в Node.js не поддерживается, если не используется [пользовательский HTTPS-загрузчик](module.md#import-from-https).

#### URL `file:`

Модуль загружается несколько раз, если спецификатор `import`, которым он разрешается, имеет другой query или fragment.

```js
import './foo.mjs?query=1'; // loads ./foo.mjs with query of "?query=1"
import './foo.mjs?query=2'; // loads ./foo.mjs with query of "?query=2"
```

Корень тома можно задать через `/`, `//` или `file:///`. Учитывая различия между [URL](https://url.spec.whatwg.org/) и разрешением путей (в том числе детали процентного кодирования), при импорте пути рекомендуется использовать [url.pathToFileURL](url.md#urlpathtofileurlpath-options).

#### Импорты `data:` {#data-imports}

[`data:` URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) поддерживаются для импорта со следующими MIME-типами:

-   `text/javascript` — для ES-модулей
-   `application/json` — для JSON
-   `application/wasm` — для Wasm

```js
import 'data:text/javascript,console.log("hello!");';
import _ from 'data:application/json,"world!"' with { type: 'json' };
```

`data:` URL разрешают только [голые спецификаторы](#terminology) для встроенных модулей и [абсолютные спецификаторы](#terminology). Разрешение [относительных спецификаторов](#terminology) не работает, потому что `data:` не является [специальной схемой](https://url.spec.whatwg.org/#special-scheme). Например, попытка загрузить `./foo` из `data:text/javascript,import "./foo";` не разрешается, потому что для `data:` URL нет понятия относительного разрешения.

#### Импорты `node:`

URL `node:` поддерживаются как альтернативный способ загрузки встроенных модулей Node.js. Эта схема URL позволяет ссылаться на встроенные модули допустимыми абсолютными строками URL.

```js
import fs from 'node:fs/promises';
```

## Атрибуты импорта {#import-assertions}

[Атрибуты импорта](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with) — встроенный синтаксис для операторов импорта модулей, чтобы передавать дополнительную информацию вместе со спецификатором модуля.

```js
import fooData from './foo.json' with { type: 'json' };

const { default: barData } =
  await import('./bar.json', { with: { type: 'json' } });
```

Node.js поддерживает только атрибут `type` со следующими значениями:

| Атрибут `type` | Назначение                   |
| -------------- | ---------------------------- |
| `'json'`       | [JSON-модули](#json-modules) |

Атрибут `type: 'json'` обязателен при импорте JSON-модулей.

## Встроенные модули

[Встроенные модули](modules.md#built-in-modules) предоставляют именованные экспорты своего публичного API. Также есть экспорт по умолчанию — это значение экспорта CommonJS. Экспорт по умолчанию можно использовать, в том числе для изменения именованных экспортов. Именованные экспорты встроенных модулей обновляются только при вызове [`module.syncBuiltinESMExports()`](module.md#modulesyncbuiltinesmexports).

```js
import EventEmitter from 'node:events';
const e = new EventEmitter();
```

---

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

---

```js
import fs, { readFileSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { Buffer } from 'node:buffer';

fs.readFileSync = () => Buffer.from('Hello, ESM');
syncBuiltinESMExports();

fs.readFileSync === readFileSync;
```

> При импорте встроенных модулей все именованные экспорты (т.е. свойства объекта экспорта модуля) заполняются, даже если к ним не обращаются по отдельности. Из-за этого начальный импорт встроенных модулей может быть чуть медленнее, чем загрузка через `require()` или `process.getBuiltinModule()`, где объект экспорта модуля вычисляется сразу, но часть свойств может инициализироваться только при первом обращении к ним.

## Выражения `import()` {#import-expressions}

[Динамический `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import) даёт асинхронный способ импортировать модули. Он поддерживается и в CommonJS, и в ES-модулях и может загружать как CommonJS, так и ES-модули.

## `import.meta`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Мета-свойство `import.meta` — это `Object` со следующими свойствами. Оно поддерживается только в ES-модулях.

### `import.meta.dirname` {#importmetadirname}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя каталога текущего модуля.

Это то же самое, что [`path.dirname()`](path.md#pathdirnamepath) от [`import.meta.filename`](#importmetafilename).

> **Ограничение**: свойство есть только у модулей с протоколом `file:`.

### `import.meta.filename` {#importmetafilename}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Полный абсолютный путь и имя файла текущего модуля с разрешёнными символическими ссылками.

Это то же самое, что [`url.fileURLToPath()`](url.md#urlfileurltopathurl-options) от [`import.meta.url`](#importmetaurl).

> **Ограничение**: это свойство поддерживают только локальные модули. У модулей без протокола `file:` его не будет.

### `import.meta.url` {#importmetaurl}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный `file:` URL модуля.

Определено так же, как в браузерах: URL текущего файла модуля.

Это позволяет удобно загружать файлы относительно модуля:

```js
import { readFileSync } from 'node:fs';
const buffer = readFileSync(
    new URL('./data.proto', import.meta.url)
);
```

### `import.meta.main` {#importmetamain}

!!!warning "Стабильность: 1.0 – ранняя разработка"

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если текущий модуль — точка входа процесса; иначе `false`.

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

### `import.meta.resolve(specifier)` {#importmetaresolvespecifier}

!!!warning "Стабильность: 1.2 – кандидат в релиз"

-   `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Спецификатор модуля для разрешения относительно текущего модуля.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютная строка URL, в которую разрешился бы спецификатор.

[`import.meta.resolve`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import.meta/resolve) — функция разрешения относительно модуля с областью действия на каждый модуль; возвращает строку URL.

```js
const dependencyAsset = import.meta.resolve(
    'component-lib/asset.css'
);
// file:///app/node_modules/component-lib/asset.css
import.meta.resolve('./dep.js');
// file:///app/dep.js
```

Поддерживаются все возможности разрешения модулей Node.js. Разрешение зависимостей ограничено допустимыми разрешениями `exports` внутри пакета.

**Ограничения**:

-   Могут выполняться синхронные операции с файловой системой, что сказывается на производительности аналогично `require.resolve`.
-   В пользовательских загрузчиках эта возможность недоступна (возник бы взаимный тупик).

**Нестандартный API**:

При использовании флага `--experimental-import-meta-resolve` функция принимает второй аргумент:

-   `parent` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Необязательный абсолютный URL родительского модуля, от которого разрешать. **По умолчанию:** `import.meta.url`

## Взаимодействие с CommonJS

### Операторы `import`

Оператор `import` может ссылаться на ES-модуль или модуль CommonJS. Операторы `import` допустимы только в ES-модулях, но динамические выражения [`import()`](#import-expressions) поддерживаются в CommonJS для загрузки ES-модулей.

При импорте [модулей CommonJS](#commonjs-namespaces) объект `module.exports` предоставляется как экспорт по умолчанию. Именованные экспорты могут быть доступны благодаря статическому анализу как удобство для совместимости с экосистемой.

### `require`

В CommonJS `require` сейчас поддерживает загрузку только синхронных ES-модулей (то есть ES-модулей без top-level `await`).

Подробнее см. [Загрузка ECMAScript-модулей через `require()`](modules.md#loading-ecmascript-modules-using-require).

### Пространства имён CommonJS {#commonjs-namespaces}

Модули CommonJS состоят из объекта `module.exports` произвольного типа.

Чтобы это поддержать, при импорте CommonJS из ES-модуля строится обёртка пространства имён для модуля CommonJS: у неё всегда есть ключ экспорта `default`, указывающий на значение `module.exports` в CommonJS.

Дополнительно к исходному тексту модуля CommonJS применяется эвристический статический анализ, чтобы составить по возможности статический список экспортов для пространства имён из значений на `module.exports`. Это нужно, потому что пространства имён должны быть построены до выполнения модуля CJS.

Объекты пространства имён CommonJS также предоставляют экспорт `default` как именованный экспорт `'module.exports'`, чтобы однозначно показать, что в CommonJS используется именно это значение, а не объект пространства имён. Это согласуется с семантикой обработки имени экспорта `'module.exports'` в поддержке взаимодействия [`require(esm)`](modules.md#loading-ecmascript-modules-using-require).

Импортируя модуль CommonJS, к нему можно надёжно обратиться через экспорт по умолчанию ES-модуля или эквивалентный «синтаксический сахар»:

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

Этот экзотический объект пространства имён модуля можно увидеть напрямую при `import * as m from 'cjs'` или динамическом импорте:

```js
import * as m from 'cjs';
console.log(m);
console.log(m === (await import('cjs')));
// Prints:
//   [Module] { default: <module.exports>, 'module.exports': <module.exports> }
//   true
```

Для лучшей совместимости с существующими практиками в экосистеме JS Node.js дополнительно пытается определить именованные экспорты CommonJS для каждого импортируемого модуля CommonJS и предоставить их как отдельные экспорты ES-модуля через статический анализ.

Например, модуль CommonJS:

=== "CJS"

    ```js
    // cjs.cjs
    exports.name = 'exported';
    ```

Поддерживает именованные импорты в ES-модулях:

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

Как видно из последнего примера с логированием экзотического объекта пространства имён, экспорт `name` копируется с объекта `module.exports` и задаётся напрямую в пространстве имён ES-модуля при импорте.

Обновления «живых» привязок или новые экспорты, добавленные в `module.exports`, для таких именованных экспортов не отслеживаются.

Определение именованных экспортов опирается на типичные синтаксические шаблоны, но не всегда даёт верный результат. В таких случаях лучше подойдёт импорт по умолчанию, описанный выше.

Охват обнаружения именованных экспортов включает многие распространённые шаблоны экспорта, реэкспорта и выходы сборщиков и транспайлеров. Точные правила см. в [merve](https://github.com/anonrig/merve/tree/v1.0.0).

### Отличия ES-модулей от CommonJS

#### Нет `require`, `exports` и `module.exports`

В большинстве случаев для загрузки модулей CommonJS можно использовать ES-`import`.

При необходимости функцию `require` можно создать внутри ES-модуля через [`module.createRequire()`](module.md#modulecreaterequirefilename).

#### Нет `__filename` и `__dirname`

Эти переменные CommonJS в ES-модулях недоступны.

Сценарии с `__filename` и `__dirname` можно воспроизвести через [`import.meta.filename`](#importmetafilename) и [`import.meta.dirname`](#importmetadirname).

#### Нет загрузки аддонов

Импорты ES-модулей [аддоны](addons.md) сейчас не поддерживают.

Их можно загрузить через [`module.createRequire()`](module.md#modulecreaterequirefilename) или [`process.dlopen`](process.md#processdlopenmodule-filename-flags).

#### Нет `require.main`

Вместо `require.main === module` есть API [`import.meta.main`](#importmetamain).

#### Нет `require.resolve`

Относительное разрешение — через `new URL('./local', import.meta.url)`.

Полная замена `require.resolve` — API [import.meta.resolve](#importmetaresolvespecifier).

Либо можно использовать `module.createRequire()`.

#### Нет `NODE_PATH`

`NODE_PATH` не участвует в разрешении спецификаторов `import`. Если нужно подобное поведение, используйте символические ссылки.

#### Нет `require.extensions`

`import` не использует `require.extensions`. Замену можно обеспечить хуками настройки модулей.

#### Нет `require.cache`

`import` не использует `require.cache` — у загрузчика ES-модулей свой отдельный кэш.

<i id="esm_experimental_json_modules"></i>

## JSON-модули {#json-modules}

На JSON-файлы можно ссылаться через `import`:

```js
import packageConfig from './package.json' with { type: 'json' };
```

Синтаксис `with { type: 'json' }` обязателен; см. [атрибуты импорта](#import-assertions).

Импортируемый JSON даёт только экспорт `default`. Именованных экспортов нет. В кэше CommonJS создаётся запись, чтобы избежать дублирования. Тот же объект возвращается в CommonJS, если JSON-модуль уже был импортирован с того же пути.

## Wasm-модули {#wasm-modules}

Поддерживается импорт как экземпляров модулей WebAssembly, так и импортов в фазе исходника (source phase).

Оба варианта согласованы с [предложении интеграции ES-модулей для WebAssembly](https://github.com/webassembly/esm-integration).

### Импорты Wasm в фазе исходника

!!!warning "Стабильность: 1.2 – кандидат в релиз"

Предложение [импортов фазы исходника](https://github.com/tc39/proposal-source-phase-imports) позволяет сочетанию ключевых слов `import source` импортировать объект `WebAssembly.Module` напрямую, вместо получения уже инстанцированного экземпляра модуля с зависимостями.

Это полезно, когда нужны кастомные инстанции Wasm, но разрешение и загрузка по-прежнему через интеграцию ES-модулей.

Например, чтобы создать несколько экземпляров модуля или передать пользовательские импорты в новый экземпляр `library.wasm`:

```js
import source libraryModule from './library.wasm';

const instance1 = await WebAssembly.instantiate(libraryModule, importObject1);

const instance2 = await WebAssembly.instantiate(libraryModule, importObject2);
```

Помимо статической фазы исходника есть динамический вариант фазы исходника через синтаксис динамического импорта фазы `import.source`:

```js
const dynamicLibrary = await import.source(
    './library.wasm'
);

const instance = await WebAssembly.instantiate(
    dynamicLibrary,
    importObject
);
```

### Встроенные строковые функции JavaScript

!!!warning "Стабильность: 1.2 – кандидат в релиз"

При импорте модулей WebAssembly предложение [предложение WebAssembly JS String Builtins](https://github.com/WebAssembly/js-string-builtins) автоматически включается через интеграцию ESM. Это позволяет модулям WebAssembly напрямую использовать эффективные встроенные строковые функции времени компиляции из пространства имён `wasm:js-string`.

Например, следующий Wasm-модуль экспортирует строковую функцию `getLength` с использованием встроенной `length` из `wasm:js-string`:

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

---

```js
import { getLength } from './string-len.wasm';
getLength('foo'); // Returns 3.
```

Встроенные функции Wasm — это импорты времени компиляции, связываемые при компиляции модуля, а не при инстанцировании. Они ведут себя не как обычные импорты графа модулей и их нельзя просмотреть через `WebAssembly.Module.imports(mod)` или виртуализовать без перекомпиляции модуля через прямой API `WebAssembly.compile` с отключёнными строковыми встроенными функциями.

Строковые константы также можно импортировать из встроенного URL импорта `wasm:js/string-constants`, чтобы задать статические глобальные строки JS:

```text
(module
  (import "wasm:js/string-constants" "hello" (global $hello externref))
)
```

Импорт модуля в фазе исходника до инстанцирования тоже автоматически использует встроенные функции времени компиляции:

```js
import source mod from './string-len.wasm';
const { exports: { getLength } } = await WebAssembly.instantiate(mod, {});
getLength('foo'); // Also returns 3.
```

### Импорты фазы экземпляра Wasm

!!!warning "Стабильность: 1.1 – активная разработка"

Импорты экземпляра позволяют импортировать любые `.wasm` как обычные модули, поддерживая в свою очередь их импорты модулей.

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

При импорте экземпляров модулей WebAssembly нельзя использовать имена импортируемых модулей или имена импорта/экспорта с зарезервированными префиксами:

-   `wasm-js:` — зарезервировано для всех имён импорта модулей, имён модулей и имён экспорта.
-   `wasm:` — зарезервировано для имён импорта модулей и имён экспорта (имена импортируемых модулей разрешены для поддержки будущих полифиллов встроенных функций).

Импорт модуля с перечисленными зарезервированными именами вызовет `WebAssembly.LinkError`.

## `await` верхнего уровня

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

---

```bash
node b.mjs # works
```

Если выражение top-level `await` никогда не завершится, процесс `node` завершится с кодом `13` ([status code](process.md#exit-codes)).

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

## Загрузчики

Документация по загрузчикам перенесена в [Модули: хуки настройки](module.md#customization-hooks).

## Алгоритм разрешения и загрузки

### Возможности

У стандартного резолвера такие свойства:

-   разрешение на основе FileURL, как у ES-модулей;
-   относительное и абсолютное разрешение URL;
-   нет расширений по умолчанию;
-   нет «главных» файлов каталогов;
-   разрешение голых спецификаторов пакетов через поиск в `node_modules`;
-   не падает на неизвестных расширениях или протоколах;
-   при необходимости может передать в фазу загрузки подсказку о формате.

У стандартного загрузчика такие свойства:

-   загрузка встроенных модулей через URL `node:`;
-   «встроенная» загрузка модулей через URL `data:`;
-   загрузка модулей `file:`;
-   ошибка на любой другой протокол URL;
-   ошибка на неизвестных расширениях при загрузке `file:` (поддерживаются только `.cjs`, `.js` и `.mjs`).

### Алгоритм разрешения

Алгоритм загрузки спецификатора ES-модуля задаётся методом **ESM_RESOLVE** ниже. Он возвращает разрешённый URL для спецификатора модуля относительно `parentURL`.

Алгоритм разрешения определяет полный разрешённый URL для загрузки модуля вместе с предполагаемым форматом модуля. Сам алгоритм разрешения не решает, можно ли загрузить протокол разрешённого URL и допустимы ли расширения файлов — эти проверки выполняет Node.js на фазе загрузки (например, если запрошен URL с протоколом, отличным от `file:`, `data:` или `node:`).

Алгоритм также пытается определить формат файла по расширению (см. алгоритм `ESM_FILE_FORMAT` ниже). Если расширение не распознано (например, это не `.mjs`, `.cjs` или `.json`), возвращается формат `undefined`, что приведёт к ошибке на фазе загрузки.

Формат модуля для разрешённого URL задаётся **ESM_FILE_FORMAT** — он возвращает однозначный формат для любого файла. Формат _«module»_ соответствует ECMAScript-модулю, а _«commonjs»_ — загрузке через устаревший загрузчик CommonJS. Дополнительные форматы, например _«addon»_, могут появиться в будущих версиях.

В приведённых ниже алгоритмах ошибки подпрограмм пробрасываются как ошибки верхнего уровня, если явно не сказано иное.

_defaultConditions_ — массив имён условной среды, `["node", "import"]`.

Резолвер может выбросить такие ошибки:

-   _Недопустимый спецификатор модуля_: спецификатор модуля — недопустимый URL, имя пакета или подпуть пакета.
-   _Недопустимая конфигурация пакета_: конфигурация `package.json` недопустима или содержит недопустимые данные.
-   _Недопустимая цель пакета_: в `exports` или `imports` пакета целевой модуль имеет недопустимый тип или строку.
-   _Путь пакета не экспортирован_: `exports` пакета не задаёт и не разрешает целевой подпуть для данного модуля.
-   _Импорт пакета не определён_: в `imports` пакета нет такого спецификатора.
-   _Модуль не найден_: запрошенный пакет или модуль не существует.
-   _Импорт каталога не поддерживается_: разрешённый путь указывает на каталог, импорт модулей в каталог не поддерживается.

### Спецификация алгоритма разрешения {#resolution-algorithm-specification}

**ESM_RESOLVE**(_specifier_, _parentURL_)

1.  Пусть _resolved_ будет **undefined**.
2.  Если _specifier_ является корректным URL, тогда
    1.  Установить _resolved_ равным результату разбора и повторной сериализации _specifier_ как URL.
3.  Иначе, если _specifier_ начинается с _"/"_, _"./"_ или _"../"_, тогда
    1.  Установить _resolved_ равным результату разрешения URL для _specifier_ относительно _parentURL_.
4.  Иначе, если _specifier_ начинается с _"#"_, тогда
    1.  Установить _resolved_ равным результату **PACKAGE_IMPORTS_RESOLVE**(_specifier_, _parentURL_, _defaultConditions_).
5.  Иначе,
    1.  Примечание: теперь _specifier_ является голым спецификатором.
    2.  Установить _resolved_ равным результату **PACKAGE_RESOLVE**(_specifier_, _parentURL_).
6.  Пусть _format_ будет **undefined**.
7.  Если _resolved_ является URL вида _"file:"_, тогда
    1.  Если _resolved_ содержит процентные кодировки _"/"_ или _"\\"_ (_"%2F"_ и _"%5C"_ соответственно), тогда
        1.  Выбросить ошибку _Недопустимый спецификатор модуля_.
    2.  Если файл по адресу _resolved_ является каталогом, тогда
        1.  Выбросить ошибку _Импорт каталога не поддерживается_.
    3.  Если файл по адресу _resolved_ не существует, тогда
        1.  Выбросить ошибку _Модуль не найден_.
    4.  Установить _resolved_ в реальный путь _resolved_, сохранив те же компоненты строки запроса URL и фрагмента.
    5.  Установить _format_ равным результату **ESM_FILE_FORMAT**(_resolved_).
8.  Иначе,
    1.  Установить _format_ в формат модуля для типа содержимого, связанного с URL _resolved_.
9.  Вернуть _format_ и _resolved_ на этап загрузки.

**PACKAGE_RESOLVE**(_packageSpecifier_, _parentURL_)

1.  Пусть _packageName_ будет **undefined**.
2.  Если _packageSpecifier_ является пустой строкой, тогда
    1.  Выбросить ошибку _Недопустимый спецификатор модуля_.
3.  Если _packageSpecifier_ является именем встроенного модуля Node.js, тогда
    1.  Вернуть строку _"node:"_, объединённую с _packageSpecifier_.
4.  Если _packageSpecifier_ не начинается с _"@"_, тогда
    1.  Установить _packageName_ равным подстроке _packageSpecifier_ до первого разделителя _"/"_ или до конца строки.
5.  Иначе,
    1.  Если _packageSpecifier_ не содержит разделитель _"/"_, тогда
        1.  Выбросить ошибку _Недопустимый спецификатор модуля_.
    2.  Установить _packageName_ равным подстроке _packageSpecifier_ до второго разделителя _"/"_ или до конца строки.
6.  Если _packageName_ начинается с _"."_ или содержит _"\\"_ либо _"%"_, тогда
    1.  Выбросить ошибку _Недопустимый спецификатор модуля_.
7.  Пусть _packageSubpath_ будет _"."_, объединённая с подстрокой _packageSpecifier_ от позиции длины _packageName_.
8.  Пусть _selfUrl_ будет результатом **PACKAGE_SELF_RESOLVE**(_packageName_, _packageSubpath_, _parentURL_).
9.  Если _selfUrl_ не равен **undefined**, вернуть _selfUrl_.
10. Пока _parentURL_ не является корнем файловой системы,
    1.  Пусть _packageURL_ будет результатом разрешения URL _"node_modules/"_, объединённого с _packageName_, относительно _parentURL_.
    2.  Установить _parentURL_ в URL родительской папки для _parentURL_.
    3.  Если каталог по адресу _packageURL_ не существует, тогда
        1.  Продолжить следующую итерацию цикла.
    4.  Пусть _pjson_ будет результатом **READ_PACKAGE_JSON**(_packageURL_).
    5.  Если _pjson_ не равен **null** и _pjson_._exports_ не равен **null** или **undefined**, тогда
        1.  Вернуть результат **PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _packageSubpath_, _pjson.exports_, _defaultConditions_).
    6.  Иначе, если _packageSubpath_ равен _"."_, тогда
        1.  Если _pjson.main_ является строкой, тогда
            1.  Вернуть разрешение URL _main_ в _packageURL_.
    7.  Иначе,
        1.  Вернуть разрешение URL _packageSubpath_ в _packageURL_.
11. Выбросить ошибку _Модуль не найден_.

**PACKAGE_SELF_RESOLVE**(_packageName_, _packageSubpath_, _parentURL_)

1.  Пусть _packageURL_ будет результатом **LOOKUP_PACKAGE_SCOPE**(_parentURL_).
2.  Если _packageURL_ равно **null**, то
    1.  Вернуть **undefined**.
3.  Пусть _pjson_ будет результатом **READ_PACKAGE_JSON**(_packageURL_).
4.  Если _pjson_ равно **null** либо _pjson_._exports_ равно **null** или **undefined**, то
    1.  Вернуть **undefined**.
5.  Если _pjson.name_ равно _packageName_, то
    1.  Вернуть результат **PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _packageSubpath_, _pjson.exports_, _defaultConditions_).
6.  Иначе вернуть **undefined**.

**PACKAGE_EXPORTS_RESOLVE**(_packageURL_, _subpath_, _exports_, _conditions_)

Примечание: эта функция вызывается напрямую алгоритмом разрешения CommonJS.

1.  Если _exports_ является объектом, у которого есть и ключ, начинающийся с _"."_, и ключ, не начинающийся с _"."_, выбросить ошибку _Недопустимая конфигурация пакета_.
2.  Если _subpath_ равен _"."_, то
    1.  Пусть _mainExport_ будет **undefined**.
    2.  Если _exports_ является строкой или массивом либо объектом, не содержащим ключей, начинающихся с _"."_, то
        1.  Установить _mainExport_ в _exports_.
    3.  Иначе, если _exports_ является объектом и содержит свойство _"."_, то
        1.  Установить _mainExport_ в _exports_\[_"."_].
    4.  Если _mainExport_ не равен **undefined**, то
        1.  Пусть _resolved_ будет результатом **PACKAGE_TARGET_RESOLVE**( _packageURL_, _mainExport_, **null**, **false**, _conditions_).
        2.  Если _resolved_ не равен **null** и не равен **undefined**, вернуть _resolved_.
3.  Иначе, если _exports_ является объектом и все его ключи начинаются с _"."_, то
    1.  Утверждение: _subpath_ начинается с _"./"_.
    2.  Пусть _resolved_ будет результатом **PACKAGE_IMPORTS_EXPORTS_RESOLVE**( _subpath_, _exports_, _packageURL_, **false**, _conditions_).
    3.  Если _resolved_ не равен **null** и не равен **undefined**, вернуть _resolved_.
4.  Выбросить ошибку _Путь пакета не экспортируется_.

**PACKAGE_IMPORTS_RESOLVE**(_specifier_, _parentURL_, _conditions_)

Примечание: эта функция вызывается напрямую алгоритмом разрешения CommonJS.

1.  Утверждение: _specifier_ начинается с _"#"_.
2.  Если _specifier_ в точности равен _"#"_, то
    1.  Выбросить ошибку _Недопустимый спецификатор модуля_.
3.  Пусть _packageURL_ будет результатом **LOOKUP_PACKAGE_SCOPE**(_parentURL_).
4.  Если _packageURL_ не равен **null**, то
    1.  Пусть _pjson_ будет результатом **READ_PACKAGE_JSON**(_packageURL_).
    2.  Если _pjson.imports_ является ненулевым объектом, то
        1.  Пусть _resolved_ будет результатом **PACKAGE_IMPORTS_EXPORTS_RESOLVE**( _specifier_, _pjson.imports_, _packageURL_, **true**, _conditions_).
        2.  Если _resolved_ не равен **null** и не равен **undefined**, вернуть _resolved_.
5.  Выбросить ошибку _Импорт пакета не определён_.

**PACKAGE_IMPORTS_EXPORTS_RESOLVE**(_matchKey_, _matchObj_, _packageURL_, _isImports_, _conditions_)

1.  Если _matchKey_ оканчивается на _"/"_, то
    1.  Выбросить ошибку _Недопустимый спецификатор модуля_.
2.  Если _matchKey_ является ключом в _matchObj_ и не содержит _"\*"_, то
    1.  Пусть _target_ будет значением _matchObj_\[_matchKey_].
    2.  Вернуть результат **PACKAGE_TARGET_RESOLVE**(_packageURL_, _target_, **null**, _isImports_, _conditions_).
3.  Пусть _expansionKeys_ будет списком ключей _matchObj_, содержащих только один _"\*"_, отсортированных функцией **PATTERN_KEY_COMPARE**, которая располагает их по убыванию специфичности.
4.  Для каждого ключа _expansionKey_ в _expansionKeys_ выполнить
    1.  Пусть _patternBase_ будет подстрокой _expansionKey_ до первого символа _"\*"_, не включая его.
    2.  Если _matchKey_ начинается с _patternBase_, но не равен ему, то
        1.  Пусть _patternTrailer_ будет подстрокой _expansionKey_, начиная с позиции после первого символа _"\*"_.
        2.  Если _patternTrailer_ имеет нулевую длину либо _matchKey_ оканчивается на _patternTrailer_ и длина _matchKey_ больше либо равна длине _expansionKey_, то
            1.  Пусть _target_ будет значением _matchObj_\[_expansionKey_].
            2.  Пусть _patternMatch_ будет подстрокой _matchKey_, начиная с позиции, равной длине _patternBase_, и до длины _matchKey_ минус длина _patternTrailer_.
            3.  Вернуть результат **PACKAGE_TARGET_RESOLVE**(_packageURL_, _target_, _patternMatch_, _isImports_, _conditions_).
5.  Вернуть **null**.

**PATTERN_KEY_COMPARE**(_keyA_, _keyB_)

1.  Утверждение: _keyA_ содержит только один _"\*"_.
2.  Утверждение: _keyB_ содержит только один _"\*"_.
3.  Пусть _baseLengthA_ будет индексом _"\*"_ в _keyA_.
4.  Пусть _baseLengthB_ будет индексом _"\*"_ в _keyB_.
5.  Если _baseLengthA_ больше _baseLengthB_, вернуть -1.
6.  Если _baseLengthB_ больше _baseLengthA_, вернуть 1.
7.  Если длина _keyA_ больше длины _keyB_, вернуть -1.
8.  Если длина _keyB_ больше длины _keyA_, вернуть 1.
9.  Вернуть 0.

**PACKAGE_TARGET_RESOLVE**(_packageURL_, _target_, _patternMatch_, _isImports_, _conditions_)

1.  Если _target_ является строкой, то
    1.  Если _target_ не начинается с _"./"_, то
        1.  Если _isImports_ равно **false**, либо _target_ начинается с _"../"_ или _"/"_, либо _target_ является допустимым URL, то
            1.  Выбросить ошибку _Недопустимая цель пакета_.
        2.  Если _patternMatch_ является строкой, то
            1.  Вернуть **PACKAGE_RESOLVE**(_target_, где каждое вхождение _"\*"_ заменено на _patternMatch_, _packageURL_ + _"/"_).
        3.  Вернуть **PACKAGE_RESOLVE**(_target_, _packageURL_ + _"/"_).
    2.  Если _target_, разбитый по _"/"_ или _"\\"_, содержит после первого сегмента _"."_ любой из сегментов _""_, _"."_, _".."_ или _"node_modules"_ без учёта регистра и с учётом percent-encoding, выбросить ошибку _Недопустимая цель пакета_.
    3.  Пусть _resolvedTarget_ будет URL-результатом разрешения конкатенации _packageURL_ и _target_.
    4.  Утверждение: _packageURL_ содержится в _resolvedTarget_.
    5.  Если _patternMatch_ равен **null**, то
        1.  Вернуть _resolvedTarget_.
    6.  Если _patternMatch_, разбитый по _"/"_ или _"\\"_, содержит любой из сегментов _""_, _"."_, _".."_, или _"node_modules"_ без учёта регистра и с учётом percent-encoding, выбросить ошибку _Недопустимый спецификатор модуля_.
    7.  Вернуть результат разрешения URL для _resolvedTarget_, где каждое вхождение _"\*"_ заменено на _patternMatch_.
2.  Иначе, если _target_ является ненулевым объектом, то
    1.  Если _target_ содержит какие-либо индексные ключи свойств, как определено в ECMA-262 [6.1.7 Индекс массива](https://tc39.es/ecma262/#integer-index), выбросить ошибку _Недопустимая конфигурация пакета_.
    2.  Для каждого свойства _p_ объекта _target_ в порядке вставки выполнить
        1.  Если _p_ равно _"default"_ либо _conditions_ содержит запись для _p_, то
            1.  Пусть _targetValue_ будет значением свойства _p_ в _target_.
            2.  Пусть _resolved_ будет результатом **PACKAGE_TARGET_RESOLVE**( _packageURL_, _targetValue_, _patternMatch_, _isImports_, _conditions_).
            3.  Если _resolved_ равен **undefined**, продолжить цикл.
            4.  Вернуть _resolved_.
    3.  Вернуть **undefined**.
3.  Иначе, если _target_ является массивом, то
    1.  Если \_target.length равно нулю, вернуть **null**.
    2.  Для каждого элемента _targetValue_ в _target_ выполнить
        1.  Пусть _resolved_ будет результатом **PACKAGE_TARGET_RESOLVE**( _packageURL_, _targetValue_, _patternMatch_, _isImports_, _conditions_); при ошибке _Недопустимая цель пакета_ продолжить цикл.
        2.  Если _resolved_ равен **undefined**, продолжить цикл.
        3.  Вернуть _resolved_.
    3.  Вернуть **null** последнего резервного разрешения либо выбросить его ошибку.
4.  Иначе, если _target_ равен _null_, вернуть **null**.
5.  Иначе выбросить ошибку _Недопустимая цель пакета_.

**ESM_FILE_FORMAT**(_url_)

1.  Утверждение: _url_ соответствует существующему файлу.
2.  Если _url_ оканчивается на _".mjs"_, то
    1.  Вернуть _"module"_.
3.  Если _url_ оканчивается на _".cjs"_, то
    1.  Вернуть _"commonjs"_.
4.  Если _url_ оканчивается на _".json"_, то
    1.  Вернуть _"json"_.
5.  Если _url_ оканчивается на _".wasm"_, то
    1.  Вернуть _"wasm"_.
6.  Если включён `--experimental-addon-modules` и _url_ оканчивается на _".node"_, то
    1.  Вернуть _"addon"_.
7.  Пусть _packageURL_ будет результатом **LOOKUP_PACKAGE_SCOPE**(_url_).
8.  Пусть _pjson_ будет результатом **READ_PACKAGE_JSON**(_packageURL_).
9.  Пусть _packageType_ будет **null**.
10. Если _pjson?.type_ равно _"module"_ или _"commonjs"_, то
    1.  Установить _packageType_ в _pjson.type_.
11. Если _url_ оканчивается на _".js"_, то
    1.  Если _packageType_ не равно **null**, то
        1.  Вернуть _packageType_.
    2.  Если результат **DETECT_MODULE_SYNTAX**(_source_) равен true, то
        1.  Вернуть _"module"_.
    3.  Вернуть _"commonjs"_.
12. Если у _url_ нет расширения, то
    1.  Если _packageType_ равно _"module"_ и файл по адресу _url_ содержит заголовок типа содержимого `"application/wasm"` для модуля WebAssembly, то
        1.  Вернуть _"wasm"_.
    2.  Если _packageType_ не равно **null**, то
        1.  Вернуть _packageType_.
    3.  Если результат **DETECT_MODULE_SYNTAX**(_source_) равен true, то
        1.  Вернуть _"module"_.
    4.  Вернуть _"commonjs"_.
13. Вернуть **undefined** (ошибка будет выброшена на этапе загрузки).

**LOOKUP_PACKAGE_SCOPE**(_url_)

1.  Пусть _scopeURL_ будет _url_.
2.  Пока _scopeURL_ не является корнем файловой системы,
    1.  Установить _scopeURL_ в родительский URL для _scopeURL_.
    2.  Если _scopeURL_ оканчивается сегментом пути _"node_modules"_, вернуть **null**.
    3.  Пусть _pjsonURL_ будет результатом разрешения _"package.json"_ внутри _scopeURL_.
    4.  Если файл по адресу _pjsonURL_ существует, то
        1.  Вернуть _scopeURL_.
3.  Вернуть **null**.

**READ_PACKAGE_JSON**(_packageURL_)

1.  Пусть _pjsonURL_ будет результатом разрешения _"package.json"_ внутри _packageURL_.
2.  Если файл по адресу _pjsonURL_ не существует, то
    1.  Вернуть **null**.
3.  Если файл по адресу _packageURL_ не удаётся разобрать как корректный JSON, то
    1.  Выбросить ошибку _Недопустимая конфигурация пакета_.
4.  Вернуть разобранный JSON-источник файла по адресу _pjsonURL_.

**DETECT_MODULE_SYNTAX**(_source_)

1.  Разобрать _source_ как ECMAScript-модуль.
2.  Если разбор успешен, то
    1.  Если _source_ содержит `await` верхнего уровня, статические операторы `import` или `export`, либо `import.meta`, вернуть **true**.
    2.  Если _source_ содержит лексическое объявление верхнего уровня (`const`, `let` или `class`) для любой из переменных-обёрток CommonJS (`require`, `exports`, `module`, `__filename` или `__dirname`), вернуть **true**.
3.  Вернуть **false**.

### Настройка алгоритма разрешения спецификаторов ESM

[модули: хуки настройки](module.md#customization-hooks) дают способ изменить алгоритм разрешения спецификаторов ESM. Пример с разрешением в стиле CommonJS для спецификаторов ESM — [commonjs-extension-resolution-loader](https://github.com/nodejs/loaders-test/tree/main/commonjs-extension-resolution-loader).
