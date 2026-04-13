---
title: API модуля node:module
description: createRequire, хуки настройки модулей, кэш компиляции, registerHooks и вспомогательные методы для работы с модулями в Node.js
---

# Модули: API `node:module` {: #the-module-object}

<!--introduced_in=v12.20.0-->

<!-- YAML
added: v0.3.7
-->

## Объект `Module`

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Общие вспомогательные методы при работе с экземплярами
`Module` и переменной [`module`][`module`], часто встречающейся в модулях [CommonJS][CommonJS]. Доступ
через `import 'node:module'` или `require('node:module')`.

### `module.builtinModules`

<!-- YAML
added:
  - v9.3.0
  - v8.10.0
  - v6.13.0
changes:
  - version: v23.5.0
    pr-url: https://github.com/nodejs/node/pull/56185
    description: The list now also contains prefix-only modules.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.5.0 | Список теперь также содержит модули только с префиксами. |

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список имён всех модулей, предоставляемых Node.js. Можно использовать, чтобы проверить,
поддерживается ли модуль третьей стороной или нет.

`module` в этом контексте — не тот же объект, что даёт
[обёртка модуля][module wrapper]. Чтобы получить доступ к API, подключите модуль `Module`:

=== "MJS"

    ```js
    // module.mjs
    // In an ECMAScript module
    import { builtinModules as builtin } from 'node:module';
    ```

=== "CJS"

    ```js
    // module.cjs
    // In a CommonJS module
    const builtin = require('node:module').builtinModules;
    ```

### `module.createRequire(filename)`

<!-- YAML
added: v12.2.0
-->

* `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Имя файла для построения функции
  `require`. Должно быть объектом file URL, строкой file URL или абсолютным путём.
* Возвращает: [`<require>`](modules.md#requireid) Функция `require`

=== "MJS"

    ```js
    import { createRequire } from 'node:module';
    const require = createRequire(import.meta.url);
    
    // sibling-module.js is a CommonJS module.
    const siblingModule = require('./sibling-module');
    ```

### `module.findPackageJSON(specifier[, base])`

<!-- YAML
added:
  - v23.2.0
  - v22.14.0
-->

> Стабильность: 1.1 — активная разработка

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Спецификатор модуля, для которого нужно получить `package.json`.
  При _голом спецификаторе_ возвращается `package.json` в корне пакета. При _относительном_ или _абсолютном_
  спецификаторе — ближайший родительский `package.json`.
* `base` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Абсолютное расположение (`file:` URL или путь ФС) содержащего
  модуля. В CJS используйте `__filename` (не `__dirname`!); в ESM — `import.meta.url`.
  Не нужно передавать, если `specifier` — абсолютный спецификатор.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь, если `package.json` найден. Для пакета — корневой
  `package.json`; для относительного или неразрешённого — ближайший родительский `package.json` к `specifier`.

> **Ограничение**: не используйте это для определения формата модуля. На формат влияет много факторов;
> поле `type` в `package.json` — _наименее_ надёжный ориентир (расширение файла важнее, а хук загрузчика — ещё важнее).

> **Ограничение**: сейчас используется только встроенный резолвер по умолчанию; если зарегистрированы
> [хуки настройки `resolve`][resolve hook], они не влияют на разрешение.
> Это может измениться в будущем.

```text
/path/to/project
  ├ packages/
    ├ bar/
      ├ bar.js
      └ package.json // name = '@foo/bar'
    └ qux/
      ├ node_modules/
        └ some-package/
          └ package.json // name = 'some-package'
      ├ qux.js
      └ package.json // name = '@foo/qux'
  ├ main.js
  └ package.json // name = '@foo'
```

=== "MJS"

    ```js
    // /path/to/project/packages/bar/bar.js
    import { findPackageJSON } from 'node:module';
    
    findPackageJSON('..', import.meta.url);
    // '/path/to/project/package.json'
    // Same result when passing an absolute specifier instead:
    findPackageJSON(new URL('../', import.meta.url));
    findPackageJSON(import.meta.resolve('../'));
    
    findPackageJSON('some-package', import.meta.url);
    // '/path/to/project/packages/bar/node_modules/some-package/package.json'
    // When passing an absolute specifier, you might get a different result if the
    // resolved module is inside a subfolder that has nested `package.json`.
    findPackageJSON(import.meta.resolve('some-package'));
    // '/path/to/project/packages/bar/node_modules/some-package/some-subfolder/package.json'
    
    findPackageJSON('@foo/qux', import.meta.url);
    // '/path/to/project/packages/qux/package.json'
    ```

=== "CJS"

    ```js
    // /path/to/project/packages/bar/bar.js
    const { findPackageJSON } = require('node:module');
    const { pathToFileURL } = require('node:url');
    const path = require('node:path');
    
    findPackageJSON('..', __filename);
    // '/path/to/project/package.json'
    // Same result when passing an absolute specifier instead:
    findPackageJSON(pathToFileURL(path.join(__dirname, '..')));
    
    findPackageJSON('some-package', __filename);
    // '/path/to/project/packages/bar/node_modules/some-package/package.json'
    // When passing an absolute specifier, you might get a different result if the
    // resolved module is inside a subfolder that has nested `package.json`.
    findPackageJSON(pathToFileURL(require.resolve('some-package')));
    // '/path/to/project/packages/bar/node_modules/some-package/some-subfolder/package.json'
    
    findPackageJSON('@foo/qux', __filename);
    // '/path/to/project/packages/qux/package.json'
    ```

### `module.isBuiltin(moduleName)`

<!-- YAML
added:
  - v18.6.0
  - v16.17.0
-->

* `moduleName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя модуля
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если модуль встроенный, иначе `false`

=== "MJS"

    ```js
    import { isBuiltin } from 'node:module';
    isBuiltin('node:fs'); // true
    isBuiltin('fs'); // true
    isBuiltin('wss'); // false
    ```

### `module.register(specifier[, parentURL][, options])`

<!-- YAML
added:
  - v20.6.0
  - v18.19.0
deprecated: v25.9.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/62401
    description: Runtime deprecation (DEP0205).
  - version:
    - v23.6.1
    - v22.13.1
    - v20.18.2
    pr-url: https://github.com/nodejs-private/node-private/pull/629
    description: Using this feature with the permission model enabled requires
                 passing `--allow-worker`.
  - version:
    - v20.8.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/49655
    description: Add support for WHATWG URL instances.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Прекращение поддержки во время выполнения (DEP0205). |
    | v23.6.1, v22.13.1, v20.18.2 | Для использования этой функции с включенной моделью разрешений требуется передать --allow-worker. |
    | v20.8.0, v18.19.0 | Добавьте поддержку экземпляров URL-адресов WHATWG. |

> Стабильность: 0 — устарело: используйте [`module.registerHooks()`][`module.registerHooks()`].

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Модуль с хуками настройки; обычно та же строка, что для
  `import()`, но относительные спецификаторы разрешаются относительно `parentURL`.
* `parentURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Базовый URL для разрешения `specifier`, например
  `import.meta.url`. **По умолчанию:** `'data:'`
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `parentURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Базовый URL для разрешения `specifier`. Игнорируется,
    если `parentURL` передан вторым аргументом. **По умолчанию:** `'data:'`
  * `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение для хука [`initialize`][`initialize`].
  * `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Передаваемые объекты][transferable objects] для
    хука `initialize`.

Регистрирует модуль, экспортирующий [хуки][hooks], меняющие разрешение и загрузку
модулей. См. [хуки настройки][Customization hooks].

При [модели разрешений][Permission Model] для этой возможности нужен `--allow-worker`.

### `module.registerHooks(options)`

<!-- YAML
added:
  - v23.5.0
  - v22.15.0
changes:
  - version:
    - v25.4.0
    - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/60960
    description: Synchronous and in-thread hooks are now release candidate.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.13.1 | Синхронные и внутрипоточные перехватчики теперь являются кандидатами на выпуск. |

> Стабильность: 1.2 — кандидат в релиз

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `load` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | undefined См. [хук load][load hook]. **По умолчанию:** `undefined`.
  * `resolve` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | undefined См. [хук resolve][resolve hook]. **По умолчанию:** `undefined`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект со свойством:
  * `deregister()` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Снимает зарегистрированные хуки; иначе хуки живут до
    завершения процесса.

Регистрирует [хуки][hooks], меняющие разрешение и загрузку модулей.
См. [хуки настройки][Customization hooks]. Возвращённый объект позволяет
[снять хуки][deregistration of synchronous customization hooks].

### `module.stripTypeScriptTypes(code[, options])`

<!-- YAML
added:
  - v23.2.0
  - v22.13.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/61803
    description: Removed `transform` and `sourceMap` options.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Удалены опции «transform» и «sourceMap». |

> Стабильность: 1.2 — кандидат в релиз

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исходный код, из которого нужно убрать аннотации типов.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'strip'`. Допустимые значения:
    * `'strip'` — только снятие аннотаций без преобразования конструкций TypeScript.
  * `sourceUrl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) URL исходника для source map.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код без аннотаций типов.

`module.stripTypeScriptTypes()` удаляет аннотации типов из кода TypeScript. Его
можно вызывать перед запуском через `vm.runInContext()` или `vm.compileFunction()`.

По умолчанию будет ошибка, если в коде есть конструкции TypeScript, требующие
трансформации (например `enum`). Подробнее — [type-stripping][type-stripping].

_ВНИМАНИЕ_: вывод этой функции не гарантированно стабилен между версиями Node.js
из‑за изменений в парсере TypeScript.

=== "MJS"

    ```js
    import { stripTypeScriptTypes } from 'node:module';
    const code = 'const a: number = 1;';
    const strippedCode = stripTypeScriptTypes(code);
    console.log(strippedCode);
    // Prints: const a         = 1;
    ```

=== "CJS"

    ```js
    const { stripTypeScriptTypes } = require('node:module');
    const code = 'const a: number = 1;';
    const strippedCode = stripTypeScriptTypes(code);
    console.log(strippedCode);
    // Prints: const a         = 1;
    ```

Если задан `sourceUrl`, в конец результата добавляется соответствующий комментарий:

=== "MJS"

    ```js
    import { stripTypeScriptTypes } from 'node:module';
    const code = 'const a: number = 1;';
    const strippedCode = stripTypeScriptTypes(code, { mode: 'strip', sourceUrl: 'source.ts' });
    console.log(strippedCode);
    // Prints: const a         = 1\n\n//# sourceURL=source.ts;
    ```

=== "CJS"

    ```js
    const { stripTypeScriptTypes } = require('node:module');
    const code = 'const a: number = 1;';
    const strippedCode = stripTypeScriptTypes(code, { mode: 'strip', sourceUrl: 'source.ts' });
    console.log(strippedCode);
    // Prints: const a         = 1\n\n//# sourceURL=source.ts;
    ```

### `module.syncBuiltinESMExports()`

<!-- YAML
added: v12.12.0
-->

Метод `module.syncBuiltinESMExports()` обновляет живые привязки встроенных
[ES Modules][ES Modules], чтобы они соответствовали экспорту [CommonJS][CommonJS]. Имена экспорта в
[ES Modules][ES Modules] не добавляет и не удаляет.

```js
const fs = require('node:fs');
const assert = require('node:assert');
const { syncBuiltinESMExports } = require('node:module');

fs.readFile = newAPI;

delete fs.readFileSync;

function newAPI() {
  // ...
}

fs.newAPI = newAPI;

syncBuiltinESMExports();

import('node:fs').then((esmFS) => {
  // It syncs the existing readFile property with the new value
  assert.strictEqual(esmFS.readFile, newAPI);
  // readFileSync has been deleted from the required fs
  assert.strictEqual('readFileSync' in fs, false);
  // syncBuiltinESMExports() does not remove readFileSync from esmFS
  assert.strictEqual('readFileSync' in esmFS, true);
  // syncBuiltinESMExports() does not add names
  assert.strictEqual(esmFS.newAPI, undefined);
});
```

## Кэш компиляции модулей {: #module-compile-cache}

<!-- YAML
added: v22.1.0
changes:
  - version: v22.8.0
    pr-url: https://github.com/nodejs/node/pull/54501
    description: add initial JavaScript APIs for runtime access.
-->

Добавлено в: v22.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.8.0 | добавьте начальные API-интерфейсы JavaScript для доступа во время выполнения. |

Кэш компиляции модулей включается через [`module.enableCompileCache()`][`module.enableCompileCache()`] или
переменную окружения [`NODE_COMPILE_CACHE=dir`][`NODE_COMPILE_CACHE=dir`]. После включения при компиляции
CommonJS, ECMAScript- или TypeScript-модулей используется дисковый [кэш кода V8][V8 code cache]
в указанном каталоге, что ускоряет компиляцию. Первый обход графа модулей может стать
медленнее, повторные загрузки того же графа — заметно быстрее, если содержимое не менялось.

Чтобы очистить кэш, удалите каталог кэша; при следующем использовании того же пути он
создастся снова. Чтобы не забивать диск устаревшим кэшем, лучше использовать каталог под
[`os.tmpdir()`][`os.tmpdir()`]. Если [`module.enableCompileCache()`][`module.enableCompileCache()`] вызван без `directory`, Node.js
берёт [`NODE_COMPILE_CACHE=dir`][`NODE_COMPILE_CACHE=dir`], если задано, иначе `path.join(os.tmpdir(), 'node-compile-cache')`.
Текущий каталог кэша у процесса — [`module.getCompileCacheDir()`][`module.getCompileCacheDir()`].

Отключить кэш можно переменной [`NODE_DISABLE_COMPILE_CACHE=1`][`NODE_DISABLE_COMPILE_CACHE=1`], если кэш даёт
неожиданные эффекты (например менее точное покрытие тестами).

Сейчас при включённом кэше данные кэша кода для модуля создаются сразу после компиляции,
но на диск записываются ближе к завершению процесса (поведение может измениться).
[`module.flushCompileCache()`][`module.flushCompileCache()`] принудительно сбрасывает накопленный кэш на диск, если
нужно запустить другие процессы Node.js с общим кэшем до выхода родителя.

Формат кэша на диске — деталь реализации; на него не стоит опираться. Кэш обычно
совместим только с той же версией Node.js и не гарантирован между версиями.

### Переносимость кэша компиляции

По умолчанию кэш инвалидируется при изменении абсолютных путей к модулям. Чтобы кэш
переживал перенос каталога проекта, включите переносимый режим: ранее скомпилированные
модули можно переиспользовать в других местах, если относительная структура к каталогу
кэша сохраняется (по возможности). Если Node.js не может вычислить путь модуля относительно
каталога кэша, модуль не кэшируется.

Два способа включить переносимый режим:

1. Через опцию `portable` в [`module.enableCompileCache()`][`module.enableCompileCache()`]:

   ```js
   // Non-portable cache (default): cache breaks if project is moved
   module.enableCompileCache({ directory: '/path/to/cache/storage/dir' });

   // Portable cache: cache works after the project is moved
   module.enableCompileCache({ directory: '/path/to/cache/storage/dir', portable: true });
   ```

2. Через переменную окружения [`NODE_COMPILE_CACHE_PORTABLE=1`][`NODE_COMPILE_CACHE_PORTABLE=1`]

### Ограничения кэша компиляции

При использовании кэша вместе с [покрытием кода V8 JavaScript][V8 JavaScript code coverage]
точность покрытия для функций, восстановленных из кэша кода, может быть ниже. Для точных
замеров при тестах лучше отключать кэш.

Кэш, созданный одной версией Node.js, другой версией не используется; при разных версиях
в одном базовом каталоге хранятся отдельные подкаталоги.

### `module.constants.compileCacheStatus`

<!-- YAML
added: v22.8.0
changes:
  - version: v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60971
    description: This feature is no longer experimental.
-->

Добавлено в: v22.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Эта функция больше не является экспериментальной. |

Следующие константы возвращаются в поле `status` объекта из [`module.enableCompileCache()`][`module.enableCompileCache()`]
и отражают результат попытки включить [кэш компиляции модулей][module compile cache].

<table>
  <tr>
    <th>Константа</th>
    <th>Описание</th>
  </tr>
  <tr>
    <td><code>ENABLED</code></td>
    <td>
      Node.js успешно включил кэш компиляции. Каталог, в котором хранится кэш,
      будет указан в поле <code>directory</code> возвращаемого объекта.
    </td>
  </tr>
  <tr>
    <td><code>ALREADY_ENABLED</code></td>
    <td>
      Кэш компиляции уже был включён ранее — либо предыдущим вызовом
      <code>module.enableCompileCache()</code>, либо переменной окружения <code>NODE_COMPILE_CACHE=dir</code>.
      Каталог хранения кэша будет указан в поле <code>directory</code> возвращаемого объекта.
    </td>
  </tr>
  <tr>
    <td><code>FAILED</code></td>
    <td>
      Node.js не удалось включить кэш компиляции. Причина может быть в отсутствии прав
      на использование указанного каталога или в ошибках файловой системы.
      Подробности сбоя возвращаются в поле <code>message</code> возвращаемого объекта.
    </td>
  </tr>
  <tr>
    <td><code>DISABLED</code></td>
    <td>
      Кэш компиляции нельзя включить, так как задана переменная окружения
      <code>NODE_DISABLE_COMPILE_CACHE=1</code>.
    </td>
  </tr>
</table>

### `module.enableCompileCache([options])`

<!-- YAML
added: v22.8.0
changes:
  - version: v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60971
    description: This feature is no longer experimental.
  - version:
      - v25.0.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/58797
    description: Add `portable` option to enable portable compile cache.
  - version:
      - v25.0.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/59931
    description: Rename the unreleased `path` option to `directory` to maintain consistency.
-->

Добавлено в: v22.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Эта функция больше не является экспериментальной. |
    | v25.0.0, v24.12.0 | Добавьте опцию «portable», чтобы включить переносимый кеш компиляции. |
    | v25.0.0, v24.12.0 | Переименуйте невыпущенную опцию «path» в «directory», чтобы обеспечить согласованность. |

* `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательно. Если передана строка, она считается значением `options.directory`.
  * `directory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно. Каталог для хранения кэша компиляции. Если не указан,
    используется каталог из переменной окружения [`NODE_COMPILE_CACHE=dir`][`NODE_COMPILE_CACHE=dir`],
    если она задана, иначе `path.join(os.tmpdir(), 'node-compile-cache')`.
  * `portable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Необязательно. При `true` включается переносимый кэш компиляции, чтобы
    кэш можно было переиспользовать после переноса каталога проекта. Режим работает по возможности.
    Если не указано, поведение зависит от того, задана ли переменная окружения
    [`NODE_COMPILE_CACHE_PORTABLE=1`][`NODE_COMPILE_CACHE_PORTABLE=1`].
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `status` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одно из значений [`module.constants.compileCacheStatus`][`module.constants.compileCacheStatus`]
  * `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Если Node.js не удалось включить кэш компиляции, здесь
    сообщение об ошибке. Заполняется только при `status` равном `module.constants.compileCacheStatus.FAILED`.
  * `directory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Если кэш компиляции включён, здесь каталог,
    в котором он хранится. Заполняется только если `status` равен
    `module.constants.compileCacheStatus.ENABLED` или
    `module.constants.compileCacheStatus.ALREADY_ENABLED`.

Включает [кэш компиляции модулей][module compile cache] в текущем экземпляре Node.js.

В типичных сценариях рекомендуется вызывать `module.enableCompileCache()` без указания
`options.directory`, чтобы при необходимости каталог можно было переопределить переменной окружения
`NODE_COMPILE_CACHE`.

Кэш компиляции — это оптимизация, не критичная для работы приложения, поэтому метод
не бросает исключение, если кэш включить не удалось. Вместо этого возвращается объект
с текстом ошибки в поле `message` для отладки. При успешном включении в поле `directory`
возвращаемого объекта указывается путь к каталогу кэша. Поле `status` содержит одно из значений
`module.constants.compileCacheStatus` и отражает результат попытки включить [кэш компиляции модулей][module compile cache].

Метод действует только в текущем экземпляре Node.js. Чтобы включить кэш в дочерних потоках worker,
либо вызывайте этот метод и в них, либо задайте `process.env.NODE_COMPILE_CACHE` равным каталогу кэша,
чтобы поведение унаследовалось дочерними worker. Каталог можно взять из поля `directory`
возвращаемого этим методом объекта или через [`module.getCompileCacheDir()`][`module.getCompileCacheDir()`].

### `module.flushCompileCache()`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
changes:
  - version: v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60971
    description: This feature is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Эта функция больше не является экспериментальной. |

Сбрасывает накопленный к [кэшу компиляции модулей][module compile cache] в текущем экземпляре Node.js
соответствующий уже загруженным модулям. Возврат происходит после завершения всех операций
записи на диск, независимо от успеха. При ошибках сбой не сигнализируется: промахи кэша
не должны мешать работе приложения.

### `module.getCompileCacheDir()`

<!-- YAML
added: v22.8.0
changes:
  - version: v25.4.0
    pr-url: https://github.com/nodejs/node/pull/60971
    description: This feature is no longer experimental.
-->

Добавлено в: v22.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0 | Эта функция больше не является экспериментальной. |

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к каталогу [кэша компиляции модулей][module compile cache], если он включён,
  иначе `undefined`.

<i id="module_customization_hooks"></i>

## Хуки настройки {: #customization-hooks}

<!-- YAML
added: v8.8.0
changes:
  - version:
    - v25.4.0
    - v24.13.1
    pr-url: https://github.com/nodejs/node/pull/60960
    description: Synchronous and in-thread hooks are now release candidate.
  - version:
    - v23.5.0
    - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/55698
    description: Add support for synchronous and in-thread hooks.
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/48842
    description: Added `initialize` hook to replace `globalPreload`.
  - version:
    - v18.6.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42623
    description: Add support for chaining loaders.
  - version: v16.12.0
    pr-url: https://github.com/nodejs/node/pull/37468
    description: Removed `getFormat`, `getSource`, `transformSource`, and
                 `globalPreload`; added `load` hook and `getGlobalPreload` hook.
-->

Добавлено в: v8.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.13.1 | Синхронные и внутрипоточные перехватчики теперь являются кандидатами на выпуск. |
    | v23.5.0, v22.15.0 | Добавьте поддержку синхронных и внутрипоточных перехватчиков. |
    | v20.6.0, v18.19.0 | Добавлен хук `initialize` для замены `globalPreload`. |
    | v18.6.0, v16.17.0 | Добавьте поддержку цепочки загрузчиков. |
    | v16.12.0 | Удалены `getFormat`, `getSource`, `transformSource` и `globalPreload`; добавлен хук `load` и `getGlobalPreload`. |

<!-- type=misc -->

Сейчас Node.js поддерживает два вида хуков настройки модулей:

1. [`module.registerHooks(options)`][`module.registerHooks()`]: принимает синхронные функции-хуки,
   которые выполняются в том же потоке, где загружаются модули.
2. [`module.register(specifier[, parentURL][, options])`][`register`]: принимает спецификатор модуля,
   экспортирующего асинхронные функции-хуки. Они выполняются в отдельном потоке загрузчика.

Асинхронные хуки добавляют накладные расходы на обмен между потоками и связаны с
[рядом ограничений][caveats of asynchronous customization hooks], в частности при настройке модулей CommonJS в графе.
В большинстве случаев проще использовать синхронные хуки через `module.registerHooks()`.

### Синхронные хуки настройки {: #synchronous-customization-hooks}

> Стабильность: 1.2 — кандидат в релиз

<i id="enabling_module_customization_hooks"></i>

#### Регистрация синхронных хуков настройки {: #registration-of-synchronous-customization-hooks}

Чтобы зарегистрировать синхронные хуки настройки, используйте [`module.registerHooks()`][`module.registerHooks()`] —
в него передаются [синхронные функции-хуки][synchronous hook functions] напрямую.

=== "MJS"

    ```js
    // register-hooks.js
    import { registerHooks } from 'node:module';
    registerHooks({
      resolve(specifier, context, nextResolve) { /* implementation */ },
      load(url, context, nextLoad) { /* implementation */ },
    });
    ```

=== "CJS"

    ```js
    // register-hooks.js
    const { registerHooks } = require('node:module');
    registerHooks({
      resolve(specifier, context, nextResolve) { /* implementation */ },
      load(url, context, nextLoad) { /* implementation */ },
    });
    ```

##### Регистрация хуков до запуска кода приложения через флаги {: #registering-hooks-before-application-code-runs-with-flags}

Хуки можно зарегистрировать до выполнения кода приложения с помощью флагов
[`--import`][`--import`] или [`--require`][`--require`]:

```bash
node --import ./register-hooks.js ./my-app.js
node --require ./register-hooks.js ./my-app.js
```

Спецификатор для `--import` или `--require` может задаваться и через пакет:

```bash
node --import some-package/register ./my-app.js
node --require some-package/register ./my-app.js
```

Если у `some-package` в поле [`"exports"`][`"exports"`] задан экспорт `/register`,
он может указывать на файл, вызывающий `registerHooks()`, как в примерах `register-hooks.js` выше.

Флаги `--import` и `--require` гарантируют регистрацию хуков до загрузки любого кода приложения,
включая точку входа и по умолчанию — дочерние потоки worker.

##### Регистрация хуков до запуска кода приложения из кода {: #registering-hooks-before-application-code-runs-programmatically}

Альтернатива — вызвать `registerHooks()` из точки входа.

Если точке входа нужно подгружать другие модули с настраиваемой загрузкой, подключайте их через
`require()` или динамический `import()` уже после регистрации хуков. Не используйте статический `import`
для модулей, которые нужно настроить в том же файле, где вызывается `registerHooks()`: статические `import`
выполняются до любого кода в импортирующем модуле, в том числе до вызова `registerHooks()`, независимо
от порядка следования `import` в файле.

=== "MJS"

    ```js
    import { registerHooks } from 'node:module';
    
    registerHooks({ /* implementation of synchronous hooks */ });
    
    // If loaded using static import, the hooks would not be applied when loading
    // my-app.mjs, because statically imported modules are all executed before its
    // importer regardless of where the static import appears.
    // import './my-app.mjs';
    
    // my-app.mjs must be loaded dynamically to ensure the hooks are applied.
    await import('./my-app.mjs');
    ```

=== "CJS"

    ```js
    const { registerHooks } = require('node:module');
    
    registerHooks({ /* implementation of synchronous hooks */ });
    
    import('./my-app.mjs');
    // Or, if my-app.mjs does not have top-level await or it's a CommonJS module,
    // require() can also be used:
    // require('./my-app.mjs');
    ```

##### Регистрация хуков до запуска кода приложения через URL `data:` {: #registering-hooks-before-application-code-runs-with-a-data-url}

Код регистрации хуков можно встроить во встроенный URL `data:` так, чтобы он выполнился до кода приложения. Например:

```bash
node --import 'data:text/javascript,import {registerHooks} from "node:module"; registerHooks(/* hooks code */);' ./my-app.js
```

#### Соглашения о хуках и цепочке {: #convention-of-hooks-and-chaining}

Хуки образуют цепочку, даже если в ней только один пользовательский хук и встроенный хук по умолчанию.

Функции-хуки вкладываются друг в друга: каждая должна возвращать обычный объект; цепочка строится
так, что каждая вызывает `next<hookName>()`, ссылаясь на следующий хук загрузчика (порядок LIFO).

`registerHooks()` можно вызывать несколько раз:

=== "MJS"

    ```js
    // entrypoint.mjs
    import { registerHooks } from 'node:module';
    
    const hook1 = { /* implementation of hooks */ };
    const hook2 = { /* implementation of hooks */ };
    // hook2 runs before hook1.
    registerHooks(hook1);
    registerHooks(hook2);
    ```

=== "CJS"

    ```js
    // entrypoint.cjs
    const { registerHooks } = require('node:module');
    
    const hook1 = { /* implementation of hooks */ };
    const hook2 = { /* implementation of hooks */ };
    // hook2 runs before hook1.
    registerHooks(hook1);
    registerHooks(hook2);
    ```

В этом примере зарегистрированные хуки образуют цепочки с порядком «последний зарегистрированный — первый вызываемый» (LIFO). Если и `hook1`, и `hook2` задают хук `resolve`, вызовы идут справа налево:
сначала `hook2.resolve`, затем `hook1.resolve`, затем встроенный в Node.js:

Node.js default `resolve` ← `hook1.resolve` ← `hook2.resolve`

То же относится к остальным хукам.

Если хук возвращает объект без обязательного свойства, выбрасывается исключение. Если хук завершается
без вызова `next<hookName>()` и без `shortCircuit: true`, тоже выбрасывается исключение — так
предотвращают случайный обрыв цепочки. Укажите `shortCircuit: true`, если цепочку нужно намеренно завершить на вашем хуке.

Если хук должен участвовать при загрузке других модулей с хуками, те модули нужно подключать после регистрации этого хука.

#### Снятие регистрации синхронных хуков настройки {: #deregistration-of-synchronous-customization-hooks}

Объект, возвращаемый `registerHooks()`, содержит метод `deregister()`, удаляющий хуки из цепочки.
После `deregister()` хуки больше не вызываются при разрешении и загрузке модулей.

Сейчас это доступно только для синхронных хуков, зарегистрированных через `registerHooks()`, а не для асинхронных
через `module.register()`.

=== "MJS"

    ```js
    import { registerHooks } from 'node:module';
    
    const hooks = registerHooks({
      resolve(specifier, context, nextResolve) {
        console.log('resolve hook called for', specifier);
        return nextResolve(specifier, context);
      },
      load(url, context, nextLoad) {
        return nextLoad(url, context);
      },
    });
    
    // At this point, the hooks are active and will be called for
    // any subsequent import() or require() calls.
    await import('./my-module.mjs');
    
    // Later, remove the hooks from the chain.
    hooks.deregister();
    
    // Subsequent loads will no longer trigger the hooks.
    await import('./another-module.mjs');
    ```

=== "CJS"

    ```js
    const { registerHooks } = require('node:module');
    
    const hooks = registerHooks({
      resolve(specifier, context, nextResolve) {
        console.log('resolve hook called for', specifier);
        return nextResolve(specifier, context);
      },
      load(url, context, nextLoad) {
        return nextLoad(url, context);
      },
    });
    
    // At this point, the hooks are active and will be called for
    // any subsequent require() calls.
    require('./my-module.cjs');
    
    // Later, remove the hooks from the chain.
    hooks.deregister();
    
    // Subsequent loads will no longer trigger the hooks.
    require('./another-module.cjs');
    ```

#### Функции-хуки, принимаемые `module.registerHooks()` {: #hook-functions-accepted-by-moduleregisterhooks}

<!-- YAML
added:
  - v23.5.0
  - v22.15.0
-->

Метод `module.registerHooks()` принимает следующие синхронные функции-хуки.

=== "MJS"

    ```js
    function resolve(specifier, context, nextResolve) {
      // Take an `import` or `require` specifier and resolve it to a URL.
    }
    
    function load(url, context, nextLoad) {
      // Take a resolved URL and return the source code to be evaluated.
    }
    ```

Синхронные хуки выполняются в том же потоке и той же [области][realm], где загружаются модули;
код хука может передавать значения в модули через глобальные переменные или общее состояние.

В отличие от асинхронных, синхронные хуки по умолчанию не наследуются дочерними worker, но если хуки
зарегистрированы через предзагружаемый файл [`--import`][`--import`] или [`--require`][`--require`], дочерние worker
могут унаследовать предзагрузку через `process.execArgv`. Подробнее — в [документации `Worker`][the documentation of `Worker`].

#### Синхронный `resolve(specifier, context, nextResolve)` {: #synchronous-resolvespecifier-context-nextresolve}

<!-- YAML
changes:
  - version:
    - v23.5.0
    - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/55698
    description: Add support for synchronous and in-thread hooks.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.5.0, v22.15.0 | Добавьте поддержку синхронных и внутрипоточных перехватчиков. |

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `conditions` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Условия экспорта соответствующего `package.json`
  * `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение» с атрибутами импортируемого модуля
  * `parentURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Модуль, который импортирует текущий, либо `undefined`,
    если это точка входа Node.js
* `nextResolve` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Следующий в цепочке хук `resolve` или встроенный в Node.js хук `resolve`
  после последнего пользовательского хука `resolve`
  * `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Если опущен, подставляются значения по умолчанию; если передан,
    умолчания объединяются с переданным, с приоритетом у явно указанных полей.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined Подсказка для хука `load` (может быть проигнорирована): формат
    модуля (например `'commonjs'` или `'module'`) или произвольное значение вроде `'css'` или
    `'yaml'`.
  * `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Атрибуты импорта для кэширования модуля (необязательно;
    если не заданы, используются входные данные)
  * `shortCircuit` undefined | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Сигнал о намерении завершить цепочку хуков `resolve` на этом хуке. **По умолчанию:** `false`
  * `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный URL, в который разрешается входной спецификатор

Цепочка хуков `resolve` задаёт Node.js, где искать модуль и как кэшировать данный оператор или выражение `import`, либо вызов `require`. Она может
вернуть формат (например `'module'`) как подсказку хуку `load`. Если формат указан, окончательное значение `format` задаёт хук `load` (он может проигнорировать подсказку
от `resolve`); если `resolve` возвращает `format`, нужен пользовательский хук `load`,
хотя бы чтобы передать значение встроенному хуку `load` Node.js.

Атрибуты типа импорта входят в ключ кэша внутреннего кэша модулей. Хук `resolve` должен вернуть объект `importAttributes`, если модуль нужно кэшировать с другими
атрибутами, чем в исходном коде.

Свойство `conditions` в `context` — массив условий для сопоставления с [условиями экспорта пакета][Conditional exports] при этом запросе разрешения. Его можно использовать для поиска условных сопоставлений в других местах или при вызове встроенной логики разрешения.

Текущие [условия экспорта пакета][Conditional exports] всегда присутствуют в массиве `context.conditions`, передаваемом в хук. Чтобы при вызове `defaultResolve` сохранить _стандартное поведение разрешения спецификаторов модулей Node.js_, в передаваемый ему массив `context.conditions` _нужно_ включить _все_ элементы массива `context.conditions`, изначально переданного в хук `resolve`.

=== "MJS"

    ```js
    import { registerHooks } from 'node:module';
    
    function resolve(specifier, context, nextResolve) {
      // When calling `defaultResolve`, the arguments can be modified. For example,
      // to change the specifier or to add applicable export conditions.
      if (specifier.includes('foo')) {
        specifier = specifier.replace('foo', 'bar');
        return nextResolve(specifier, {
          ...context,
          conditions: [...context.conditions, 'another-condition'],
        });
      }
    
      // The hook can also skip default resolution and provide a custom URL.
      if (specifier === 'special-module') {
        return {
          url: 'file:///path/to/special-module.mjs',
          format: 'module',
          shortCircuit: true,  // This is mandatory if nextResolve() is not called.
        };
      }
    
      // If no customization is needed, defer to the next hook in the chain which would be the
      // Node.js default resolve if this is the last user-specified loader.
      return nextResolve(specifier);
    }
    
    registerHooks({ resolve });
    ```

#### Синхронный `load(url, context, nextLoad)` {: #synchronous-loadurl-context-nextload}

<!-- YAML
changes:
  - version:
    - v23.5.0
    - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/55698
    description: Add support for synchronous and in-thread version.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.5.0, v22.15.0 | Добавьте поддержку синхронной и внутрипоточной версии. |

* `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) URL, возвращённый цепочкой `resolve`
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `conditions` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Условия экспорта соответствующего `package.json`
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined Формат, опционально заданный цепочкой хуков `resolve`.
    На вход может прийти любая строка; она не обязана входить в список допустимых возвращаемых значений ниже.
  * `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `nextLoad` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Следующий в цепочке хук `load` или встроенный хук `load` Node.js
  после последнего пользовательского хука `load`
  * `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Если опущен, подставляются значения по умолчанию; если передан,
    умолчания объединяются с переданным, с приоритетом у явно указанных полей. Во встроенном `nextLoad`, если
    у модуля по `url` нет явной информации о типе модуля, поле `context.format` обязательно.
    <!-- TODO(joyeecheung): make it at least optionally non-mandatory by allowing
         JS-style/TS-style module detection when the format is simply unknown -->
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Один из допустимых форматов модуля, перечисленных [ниже][accepted final formats].
  * `shortCircuit` undefined | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Сигнал о намерении завершить цепочку хуков `load` на этом хуке. **По умолчанию:** `false`
  * `source` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) Исходный код для выполнения в Node.js

Хук `load` задаёт способ получить исходный код из разрешённого URL. Так можно, например, не читать
файлы с диска или преобразовать неподдерживаемый формат в поддерживаемый, например `yaml` в `module`.

=== "MJS"

    ```js
    import { registerHooks } from 'node:module';
    import { Buffer } from 'node:buffer';
    
    function load(url, context, nextLoad) {
      // The hook can skip default loading and provide a custom source code.
      if (url === 'special-module') {
        return {
          source: 'export const special = 42;',
          format: 'module',
          shortCircuit: true,  // This is mandatory if nextLoad() is not called.
        };
      }
    
      // It's possible to modify the source code loaded by the next - possibly default - step,
      // for example, replacing 'foo' with 'bar' in the source code of the module.
      const result = nextLoad(url, context);
      const source = typeof result.source === 'string' ?
        result.source : Buffer.from(result.source).toString('utf8');
      return {
        source: source.replace(/foo/g, 'bar'),
        ...result,
      };
    }
    
    registerHooks({ resolve });
    ```

В более сложных сценариях хук можно использовать для преобразования неподдерживаемого исходника в поддерживаемый (см. [примеры](#examples) ниже).

##### Допустимые итоговые форматы, возвращаемые `load` {: #accepted-final-formats-returned-by-load}

Итоговое значение `format` должно быть одним из следующих:

| `format`                | Описание                                           | Допустимые типы для `source`, возвращаемого `load`   |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------- |
| `'addon'`               | Загрузка нативного аддона Node.js                                  | {null}                                             |
| `'builtin'`             | Загрузка встроенного модуля Node.js                         | {null}                                             |
| `'commonjs-typescript'` | Загрузка CommonJS-модуля Node.js с синтаксисом TypeScript | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | null | undefined |
| `'commonjs'`            | Загрузка CommonJS-модуля Node.js                        | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | null | undefined |
| `'json'`                | Загрузка JSON-файла                                      | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)                  |
| `'module-typescript'`   | Загрузка ES-модуля с синтаксисом TypeScript              | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)                  |
| `'module'`              | Загрузка ES-модуля                                     | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)                  |
| `'wasm'`                | Загрузка модуля WebAssembly                             | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)                          |

Для формата `'builtin'` значение `source` игнорируется: сейчас нельзя подменить значение встроенного (ядрового) модуля Node.js.

> Все эти типы соответствуют классам, определённым в ECMAScript.

* Конкретный объект [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) — это [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).
* Конкретный объект [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) — это [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).

Если для текстового формата (например `'json'`, `'module'`) значение `source` не строка, оно приводится к строке через [`util.TextDecoder`][`util.TextDecoder`].

### Асинхронные хуки настройки {: #asynchronous-customization-hooks}

> Стабильность: 1.1 — активная разработка

#### Ограничения асинхронных хуков настройки {: #caveats-of-asynchronous-customization-hooks}

У асинхронных хуков настройки много ограничений, и неясно, удастся ли их устранить. Рекомендуется использовать синхронные хуки через `module.registerHooks()`.

* Асинхронные хуки выполняются в отдельном потоке, поэтому глобальное состояние настраиваемых модулей напрямую менять нельзя. Обычно используют каналы сообщений и атомики для обмена данными или управления потоком. См. [взаимодействие с асинхронными хуками настройки модулей](#communication-with-asynchronous-module-customization-hooks).
* Асинхронные хуки не затрагивают все вызовы `require()` в графе модулей.
  * На пользовательские функции `require`, созданные через `module.createRequire()`, они не действуют.
  * Если асинхронный хук `load` не переопределяет `source` для проходящих через него CommonJS-модулей, дочерние модули, подключаемые из них встроенным `require()`, тоже не проходят через асинхронные хуки.
* При настройке CommonJS-модулей есть дополнительные нюансы — см. [асинхронный хук `resolve`][asynchronous `resolve` hook] и [асинхронный хук `load`][asynchronous `load` hook].
* Когда вызовы `require()` внутри CommonJS-модулей настраиваются асинхронными хуками, Node.js может несколько раз загружать исходный код модуля для совместимости с существующим «monkey patching» в CommonJS. Если код между загрузками меняется, возможно неожиданное поведение.
  * Побочный эффект: если зарегистрированы и асинхронные, и синхронные хуки, а асинхронные настраивают CommonJS-модуль, синхронные хуки для вызовов `require()` в этом модуле могут вызываться несколько раз.

#### Регистрация асинхронных хуков настройки {: #registration-of-asynchronous-customization-hooks}

Асинхронные хуки регистрируются через [`module.register()`][`register`] — передаётся путь или URL модуля, экспортирующего [асинхронные функции-хуки][asynchronous hook functions].

Как и `registerHooks()`, `register()` можно вызвать из предзагружаемого по `--import` или `--require` модуля или прямо из точки входа.

=== "MJS"

    ```js
    // Use module.register() to register asynchronous hooks in a dedicated thread.
    import { register } from 'node:module';
    register('./hooks.mjs', import.meta.url);
    
    // If my-app.mjs is loaded statically here as `import './my-app.mjs'`, since ESM
    // dependencies are evaluated before the module that imports them,
    // it's loaded _before_ the hooks are registered above and won't be affected.
    // To ensure the hooks are applied, dynamic import() must be used to load ESM
    // after the hooks are registered.
    import('./my-app.mjs');
    ```

=== "CJS"

    ```js
    const { register } = require('node:module');
    const { pathToFileURL } = require('node:url');
    // Use module.register() to register asynchronous hooks in a dedicated thread.
    register('./hooks.mjs', pathToFileURL(__filename));
    
    import('./my-app.mjs');
    ```

В файле `hooks.mjs`:

=== "MJS"

    ```js
    // hooks.mjs
    export async function resolve(specifier, context, nextResolve) {
      /* implementation */
    }
    export async function load(url, context, nextLoad) {
      /* implementation */
    }
    ```

В отличие от синхронных, асинхронные хуки не выполняются для модулей, загруженных в том же файле,
где вызывается `register()`:

<!-- eslint-disable no-restricted-globals -->

=== "MJS"

    ```js
    // register-hooks.js
    import { register, createRequire } from 'node:module';
    register('./hooks.mjs', import.meta.url);
    
    // Asynchronous hooks does not affect modules loaded via custom require()
    // functions created by module.createRequire().
    const userRequire = createRequire(__filename);
    userRequire('./my-app-2.cjs');  // Hooks won't affect this
    ```

<!-- eslint-enable no-restricted-globals -->

=== "CJS"

    ```js
    // register-hooks.js
    const { register, createRequire } = require('node:module');
    const { pathToFileURL } = require('node:url');
    register('./hooks.mjs', pathToFileURL(__filename));
    
    // Asynchronous hooks does not affect modules loaded via built-in require()
    // in the module calling `register()`
    require('./my-app-2.cjs');  // Hooks won't affect this
    // .. or custom require() functions created by module.createRequire().
    const userRequire = createRequire(__filename);
    userRequire('./my-app-3.cjs');  // Hooks won't affect this
    ```

Асинхронные хуки можно зарегистрировать и через URL `data:` с флагом `--import`:

```bash
node --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("my-instrumentation", pathToFileURL("./"));' ./my-app.js
```

#### Цепочка асинхронных хуков настройки {: #chaining-of-asynchronous-customization-hooks}

Цепочка вызовов `register()` устроена похоже на `registerHooks()`. При смешении синхронных и асинхронных
хуков сначала всегда выполняются синхронные; у последнего синхронного хука следующим шагом идёт
вызов асинхронных хуков.

=== "MJS"

    ```js
    // entrypoint.mjs
    import { register } from 'node:module';
    
    register('./foo.mjs', import.meta.url);
    register('./bar.mjs', import.meta.url);
    await import('./my-app.mjs');
    ```

=== "CJS"

    ```js
    // entrypoint.cjs
    const { register } = require('node:module');
    const { pathToFileURL } = require('node:url');
    
    const parentURL = pathToFileURL(__filename);
    register('./foo.mjs', parentURL);
    register('./bar.mjs', parentURL);
    import('./my-app.mjs');
    ```

Если в `foo.mjs` и `bar.mjs` объявлены хуки `resolve`, вызовы идут справа налево: сначала `./bar.mjs`, затем `./foo.mjs`, затем встроенная логика Node.js:

Node.js default ← `./foo.mjs` ← `./bar.mjs`

При использовании асинхронных хуков уже зарегистрированные хуки влияют и на последующие вызовы `register`,
которые подгружают модули с хуками. В примере выше `bar.mjs` будет разрешён и загружен через хуки,
зарегистрированные в `foo.mjs` (хуки `foo` уже в цепочке). Так можно писать хуки не на JavaScript,
если более ранние хуки транспилируют код в JavaScript.

Метод `register()` нельзя вызывать из потока, в котором выполняется модуль с хуками или его зависимости.

#### Взаимодействие с асинхронными хуками настройки модулей {: #communication-with-asynchronous-module-customization-hooks}

Асинхронные хуки выполняются в отдельном потоке, не в основном потоке приложения. Поэтому изменение глобальных переменных
не затронет другой поток — для обмена нужны каналы сообщений.

Через `register` можно передать данные в хук [`initialize`][`initialize`], в том числе передаваемые объекты вроде портов.

=== "MJS"

    ```js
    import { register } from 'node:module';
    import { MessageChannel } from 'node:worker_threads';
    
    // This example demonstrates how a message channel can be used to
    // communicate with the hooks, by sending `port2` to the hooks.
    const { port1, port2 } = new MessageChannel();
    
    port1.on('message', (msg) => {
      console.log(msg);
    });
    port1.unref();
    
    register('./my-hooks.mjs', {
      parentURL: import.meta.url,
      data: { number: 1, port: port2 },
      transferList: [port2],
    });
    ```

=== "CJS"

    ```js
    const { register } = require('node:module');
    const { pathToFileURL } = require('node:url');
    const { MessageChannel } = require('node:worker_threads');
    
    // This example showcases how a message channel can be used to
    // communicate with the hooks, by sending `port2` to the hooks.
    const { port1, port2 } = new MessageChannel();
    
    port1.on('message', (msg) => {
      console.log(msg);
    });
    port1.unref();
    
    register('./my-hooks.mjs', {
      parentURL: pathToFileURL(__filename),
      data: { number: 1, port: port2 },
      transferList: [port2],
    });
    ```

#### Асинхронные хуки, принимаемые `module.register()` {: #asynchronous-hooks-accepted-by-moduleregister}

<!-- YAML
added: v8.8.0
changes:
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/48842
    description: Added `initialize` hook to replace `globalPreload`.
  - version:
    - v18.6.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42623
    description: Add support for chaining loaders.
  - version: v16.12.0
    pr-url: https://github.com/nodejs/node/pull/37468
    description: Removed `getFormat`, `getSource`, `transformSource`, and
                 `globalPreload`; added `load` hook and `getGlobalPreload` hook.
-->

Добавлено в: v8.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0, v18.19.0 | Добавлен хук `initialize` для замены `globalPreload`. |
    | v18.6.0, v16.17.0 | Добавьте поддержку цепочки загрузчиков. |
    | v16.12.0 | Удалены `getFormat`, `getSource`, `transformSource` и `globalPreload`; добавлен хук `load` и `getGlobalPreload`. |

Метод [`register`][`register`] регистрирует модуль, экспортирующий набор хуков. Это функции, которые Node.js вызывает для настройки
разрешения и загрузки модулей. Имена и сигнатуры должны совпадать с ожидаемыми, экспорт — именованный.

=== "MJS"

    ```js
    export async function initialize({ number, port }) {
      // Receives data from `register`.
    }
    
    export async function resolve(specifier, context, nextResolve) {
      // Take an `import` or `require` specifier and resolve it to a URL.
    }
    
    export async function load(url, context, nextLoad) {
      // Take a resolved URL and return the source code to be evaluated.
    }
    ```

Асинхронные хуки выполняются в отдельном потоке, изолированно от основного потока приложения — это другая [область][realm]. Поток хуков
может быть завершён основным потоком в любой момент, не рассчитывайте на завершение асинхронных операций вроде `console.log`. По умолчанию хуки наследуются дочерними worker.

#### `initialize()` {: #initialize}

<!-- YAML
added:
  - v20.6.0
  - v18.19.0
-->

* `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Данные из `register(loader, import.meta.url, { data })`.

Хук `initialize` поддерживается только в [`register`][`register`]. В `registerHooks()` он не нужен: инициализацию для синхронных хуков можно выполнить
непосредственно перед вызовом `registerHooks()`.

Хук `initialize` задаёт функцию, которая выполняется в потоке хуков при инициализации модуля с хуками — при регистрации через [`register`][`register`].

Хук может получить данные из вызова [`register`][`register`], включая порты и другие передаваемые объекты. Возвращаемое значение может быть
[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise); тогда основной поток дождётся его перед продолжением.

Код настройки модуля:

=== "MJS"

    ```js
    // path-to-my-hooks.js
    
    export async function initialize({ number, port }) {
      port.postMessage(`increment: ${number + 1}`);
    }
    ```

Код вызывающей стороны:

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { register } from 'node:module';
    import { MessageChannel } from 'node:worker_threads';
    
    // This example showcases how a message channel can be used to communicate
    // between the main (application) thread and the hooks running on the hooks
    // thread, by sending `port2` to the `initialize` hook.
    const { port1, port2 } = new MessageChannel();
    
    port1.on('message', (msg) => {
      assert.strictEqual(msg, 'increment: 2');
    });
    port1.unref();
    
    register('./path-to-my-hooks.js', {
      parentURL: import.meta.url,
      data: { number: 1, port: port2 },
      transferList: [port2],
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { register } = require('node:module');
    const { pathToFileURL } = require('node:url');
    const { MessageChannel } = require('node:worker_threads');
    
    // This example showcases how a message channel can be used to communicate
    // between the main (application) thread and the hooks running on the hooks
    // thread, by sending `port2` to the `initialize` hook.
    const { port1, port2 } = new MessageChannel();
    
    port1.on('message', (msg) => {
      assert.strictEqual(msg, 'increment: 2');
    });
    port1.unref();
    
    register('./path-to-my-hooks.js', {
      parentURL: pathToFileURL(__filename),
      data: { number: 1, port: port2 },
      transferList: [port2],
    });
    ```

#### Асинхронный `resolve(specifier, context, nextResolve)` {: #asynchronous-resolvespecifier-context-nextresolve}

<!-- YAML
changes:
  - version:
    - v21.0.0
    - v20.10.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/50140
    description: The property `context.importAssertions` is replaced with
                 `context.importAttributes`. Using the old name is still
                 supported and will emit an experimental warning.
  - version:
    - v18.6.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42623
    description: Add support for chaining resolve hooks. Each hook must either
      call `nextResolve()` or include a `shortCircuit` property set to `true`
      in its return.
  - version:
    - v17.1.0
    - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/40250
    description: Add support for import assertions.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0, v18.19.0 | Свойство context.importAssertions заменяется на context.importAttributes. Использование старого имени по-прежнему поддерживается и приведет к появлению экспериментального предупреждения. |
    | v18.6.0, v16.17.0 | Добавьте поддержку цепочек разрешений. Каждый хук должен либо вызвать nextResolve(), либо включить в свой возврат свойство shortCircuit, для которого установлено значение true. |
    | v17.1.0, v16.14.0 | Добавьте поддержку утверждений импорта. |

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `conditions` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Условия экспорта соответствующего `package.json`
  * `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект «ключ — значение» с атрибутами импортируемого модуля
  * `parentURL` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Модуль, который импортирует текущий, либо `undefined`,
    если это точка входа Node.js
* `nextResolve` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Следующий в цепочке хук `resolve` или встроенный хук `resolve` Node.js
  после последнего пользовательского хука `resolve`
  * `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Если опущен, подставляются значения по умолчанию; если передан,
    умолчания объединяются с переданным, с приоритетом у явно указанных полей.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Асинхронная версия принимает объект с перечисленными ниже полями
  или `Promise`, который разрешится таким объектом.
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined Подсказка для хука `load` (может быть проигнорирована): формат
    модуля или произвольное значение вроде `'css'` / `'yaml'`.
  * `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Атрибуты импорта для кэширования (необязательно;
    если не заданы, используются входные данные)
  * `shortCircuit` undefined | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Сигнал о намерении завершить цепочку хуков `resolve` на этом хуке. **По умолчанию:** `false`
  * `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный URL, в который разрешается входной спецификатор

Поведение совпадает с синхронной версией, но `nextResolve` возвращает `Promise`, а сам хук `resolve` может возвращать `Promise`.

> **Предупреждение** В асинхронной версии, несмотря на поддержку промисов и `async`-функций, вызовы `resolve` могут по-прежнему блокировать основной поток и влиять на производительность.

> **Предупреждение** Хук `resolve`, вызываемый для `require()` внутри настраиваемых асинхронными хуками CommonJS-модулей, не получает исходный спецификатор из `require()` — вместо этого передаётся уже полностью разрешённый по умолчанию правилам CommonJS URL.

> **Предупреждение** В таких CommonJS-модулях `require.resolve()` и `require()` используют условие экспорта `"import"`, а не `"require"`, что может давать неожиданные эффекты при загрузке dual package.

=== "MJS"

    ```js
    export async function resolve(specifier, context, nextResolve) {
      // When calling `defaultResolve`, the arguments can be modified. For example,
      // to change the specifier or add conditions.
      if (specifier.includes('foo')) {
        specifier = specifier.replace('foo', 'bar');
        return nextResolve(specifier, {
          ...context,
          conditions: [...context.conditions, 'another-condition'],
        });
      }
    
      // The hook can also skips default resolution and provide a custom URL.
      if (specifier === 'special-module') {
        return {
          url: 'file:///path/to/special-module.mjs',
          format: 'module',
          shortCircuit: true,  // This is mandatory if not calling nextResolve().
        };
      }
    
      // If no customization is needed, defer to the next hook in the chain which would be the
      // Node.js default resolve if this is the last user-specified loader.
      return nextResolve(specifier);
    }
    ```

#### Асинхронный `load(url, context, nextLoad)` {: #asynchronous-loadurl-context-nextload}

<!-- YAML
changes:
  - version: v22.6.0
    pr-url: https://github.com/nodejs/node/pull/56350
    description: Add support for `source` with format `commonjs-typescript` and `module-typescript`.
  - version: v20.6.0
    pr-url: https://github.com/nodejs/node/pull/47999
    description: Add support for `source` with format `commonjs`.
  - version:
    - v18.6.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/42623
    description: Add support for chaining load hooks. Each hook must either
      call `nextLoad()` or include a `shortCircuit` property set to `true` in
      its return.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.6.0 | Добавьте поддержку исходного кода в формате commonjs-typescript и module-typescript. |
    | v20.6.0 | Добавьте поддержку исходного кода в формате commonjs. |
    | v18.6.0, v16.17.0 | Добавьте поддержку цепочки хуков load. Каждый хук должен либо вызвать nextLoad(), либо включить в свой возврат свойство shortCircuit, для которого установлено значение true. |

* `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) URL, возвращённый цепочкой `resolve`
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `conditions` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Условия экспорта соответствующего `package.json`
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined Формат, опционально заданный цепочкой `resolve`.
    На вход может прийти любая строка; она не обязана входить в список допустимых возвращаемых значений ниже.
  * `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `nextLoad` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Следующий в цепочке хук `load` или встроенный хук `load` Node.js
  после последнего пользовательского хука `load`
  * `url` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined Если опущен, подставляются значения по умолчанию; если передан,
    умолчания объединяются с переданным, с приоритетом у явно указанных полей. Во встроенном `nextLoad`, если
    у модуля по `url` нет явной информации о типе модуля, поле `context.format` обязательно.
    <!-- TODO(joyeecheung): make it at least optionally non-mandatory by allowing
         JS-style/TS-style module detection when the format is simply unknown -->
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Объект с перечисленными ниже полями или `Promise`, который разрешится таким объектом.
  * `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `shortCircuit` undefined | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Сигнал о намерении завершить цепочку хуков `load` на этом хуке. **По умолчанию:** `false`
  * `source` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) Исходный код для выполнения в Node.js

> **Предупреждение**: асинхронный хук `load` несовместим с экспортом через пространства имён из CommonJS-модулей.
> Совместное использование даёт пустой объект при импорте. В будущем это могут исправить. С синхронным хуком `load` такой проблемы нет — экспорты работают как обычно.

Поведение в целом как у синхронной версии, но при асинхронном хуке `load` отсутствие или наличие `source` для `'commonjs'` даёт сильно разный эффект:

* Если `source` задан, все вызовы `require` из этого модуля обрабатывает ESM-загрузчик с зарегистрированными хуками `resolve` и `load`; все `require.resolve` — ESM-загрузчиком с хуками `resolve`; доступен лишь подмножество API CommonJS (нет `require.extensions`, `require.cache`, `require.resolve.paths`), подмена загрузчика CommonJS не действует.
* Если `source` — `undefined` или `null`, обработку ведёт загрузчик CommonJS, вызовы `require`/`require.resolve` не проходят через зарегистрированные хуки. Поведение для «пустого» `source` временное — в будущем такая форма не будет поддерживаться.

Для синхронного хука `load` эти ограничения не действуют: доступен полный набор API CommonJS для настраиваемых модулей, и `require`/`require.resolve` всегда идут через зарегистрированные хуки.

Внутренняя асинхронная реализация `load` Node.js (значение `next` для последнего хука в цепочке `load`) для обратной совместимости возвращает `null` в `source`, когда `format` — `'commonjs'`. Ниже пример хука, который явно переходит на недефолтное поведение:

=== "MJS"

    ```js
    import { readFile } from 'node:fs/promises';
    
    // Asynchronous version accepted by module.register(). This fix is not needed
    // for the synchronous version accepted by module.registerHooks().
    export async function load(url, context, nextLoad) {
      const result = await nextLoad(url, context);
      if (result.format === 'commonjs') {
        result.source ??= await readFile(new URL(result.responseURL ?? url));
      }
      return result;
    }
    ```

Для синхронного хука `load` это тоже не так: возвращаемый `source` содержит код, загруженный следующим хуком, независимо от формата модуля.

### Примеры {: #examples}

Разные хуки настройки модулей можно комбинировать для широкого круга сценариев загрузки и выполнения кода в Node.js.

#### Импорт по HTTPS {: #import-from-https}

Ниже хук включает базовую поддержку таких спецификаторов. Это может выглядеть как сильное расширение возможностей ядра, но на практике есть серьёзные минусы: производительность ниже, чем при чтении с диска, нет кэширования и нет модели безопасности.

=== "MJS"

    ```js
    // https-hooks.mjs
    import { get } from 'node:https';
    
    export function load(url, context, nextLoad) {
      // For JavaScript to be loaded over the network, we need to fetch and
      // return it.
      if (url.startsWith('https://')) {
        return new Promise((resolve, reject) => {
          get(url, (res) => {
            let data = '';
            res.setEncoding('utf8');
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({
              // This example assumes all network-provided JavaScript is ES module
              // code.
              format: 'module',
              shortCircuit: true,
              source: data,
            }));
          }).on('error', (err) => reject(err));
        });
      }
    
      // Let Node.js handle all other URLs.
      return nextLoad(url);
    }
    ```

=== "MJS"

    ```js
    // main.mjs
    import { VERSION } from 'https://coffeescript.org/browser-compiler-modern/coffeescript.js';
    
    console.log(VERSION);
    ```

С подключённым выше модулем хуков команда
`node --import 'data:text/javascript,import [register](#moduleregisterspecifier-parenturl-options) from "node:module"; import { pathToFileURL } from "node:url"; register(pathToFileURL("./https-hooks.mjs"));' ./main.mjs`
выводит текущую версию CoffeeScript согласно модулю по URL из
`main.mjs`.

<!-- TODO(joyeecheung): add an example on how to implement it with a fetchSync based on
workers and Atomics.wait() - or all these examples are too much to be put in the API
documentation already and should be put into a repository instead? -->

#### Транспиляция {: #transpilation}

Исходники в форматах, которые Node.js не понимает напрямую, можно преобразовать в JavaScript через [хук `load`][load hook].

Это медленнее, чем транспилировать файлы до запуска Node.js; хуки-транспиляторы имеют смысл в основном для разработки и тестов.

##### Асинхронная версия {: #asynchronous-version}

=== "MJS"

    ```js
    // coffeescript-hooks.mjs
    import { readFile } from 'node:fs/promises';
    import { findPackageJSON } from 'node:module';
    import coffeescript from 'coffeescript';
    
    const extensionsRegex = /\.(coffee|litcoffee|coffee\.md)$/;
    
    export async function load(url, context, nextLoad) {
      if (extensionsRegex.test(url)) {
        // CoffeeScript files can be either CommonJS or ES modules. Use a custom format
        // to tell Node.js not to detect its module type.
        const { source: rawSource } = await nextLoad(url, { ...context, format: 'coffee' });
        // This hook converts CoffeeScript source code into JavaScript source code
        // for all imported CoffeeScript files.
        const transformedSource = coffeescript.compile(rawSource.toString(), url);
    
        // To determine how Node.js would interpret the transpilation result,
        // search up the file system for the nearest parent package.json file
        // and read its "type" field.
        return {
          format: await getPackageType(url),
          shortCircuit: true,
          source: transformedSource,
        };
      }
    
      // Let Node.js handle all other URLs.
      return nextLoad(url, context);
    }
    
    async function getPackageType(url) {
      // `url` is only a file path during the first iteration when passed the
      // resolved url from the load() hook
      // an actual file path from load() will contain a file extension as it's
      // required by the spec
      // this simple truthy check for whether `url` contains a file extension will
      // work for most projects but does not cover some edge-cases (such as
      // extensionless files or a url ending in a trailing space)
      const pJson = findPackageJSON(url);
    
      return readFile(pJson, 'utf8')
        .then(JSON.parse)
        .then((json) => json?.type)
        .catch(() => undefined);
    }
    ```

##### Синхронная версия

=== "MJS"

    ```js
    // coffeescript-sync-hooks.mjs
    import { readFileSync } from 'node:fs';
    import { registerHooks, findPackageJSON } from 'node:module';
    import coffeescript from 'coffeescript';
    
    const extensionsRegex = /\.(coffee|litcoffee|coffee\.md)$/;
    
    function load(url, context, nextLoad) {
      if (extensionsRegex.test(url)) {
        const { source: rawSource } = nextLoad(url, { ...context, format: 'coffee' });
        const transformedSource = coffeescript.compile(rawSource.toString(), url);
    
        return {
          format: getPackageType(url),
          shortCircuit: true,
          source: transformedSource,
        };
      }
    
      return nextLoad(url, context);
    }
    
    function getPackageType(url) {
      const pJson = findPackageJSON(url);
      if (!pJson) {
        return undefined;
      }
      try {
        const file = readFileSync(pJson, 'utf-8');
        return JSON.parse(file)?.type;
      } catch {
        return undefined;
      }
    }
    
    registerHooks({ load });
    ```

#### Запуск с хуками

```coffee
# main.coffee
import { scream } from './scream.coffee'
console.log scream 'hello, world'

import { version } from 'node:process'
console.log "Brought to you by Node.js version #{version}"
```

```coffee
# scream.coffee
export scream = (str) -> str.toUpperCase()
```

Для запуска примера добавьте `package.json` с полем `type`, задающим тип модулей для CoffeeScript.

```json
{
  "type": "module"
}
```

Это только для примера. В реальных загрузчиках `getPackageType()` должен возвращать `format`,
известный Node.js, даже без явного `type` в `package.json`, иначе `nextLoad` выбросит `ERR_UNKNOWN_FILE_EXTENSION`
(если `undefined`) или `ERR_UNKNOWN_MODULE_FORMAT` (если формат не из списка в [документации хука `load`][load hook]).

С подключёнными выше модулями хуков команды
`node --import 'data:text/javascript,import [register](#moduleregisterspecifier-parenturl-options) from "node:module"; import { pathToFileURL } from "node:url"; register(pathToFileURL("./coffeescript-hooks.mjs"));' ./main.coffee`
или `node --import ./coffeescript-sync-hooks.mjs ./main.coffee`
превращают `main.coffee` в JavaScript после чтения исходника с диска, но до выполнения; то же для любых `.coffee`,
`.litcoffee` или `.coffee.md`, на которые есть `import` в загружаемых файлах.

#### Карты импорта (import maps) {: #import-maps}

В двух предыдущих примерах использовались хуки `load`. Ниже — пример хука `resolve`: модуль читает `import-map.json`,
в котором задано, какие спецификаторы подменять другими URL (упрощённая реализация небольшой части спецификации import maps).

##### Асинхронная версия (карты импорта)

=== "MJS"

    ```js
    // import-map-hooks.js
    import fs from 'node:fs/promises';
    
    const { imports } = JSON.parse(await fs.readFile('import-map.json'));
    
    export async function resolve(specifier, context, nextResolve) {
      if (Object.hasOwn(imports, specifier)) {
        return nextResolve(imports[specifier], context);
      }
    
      return nextResolve(specifier, context);
    }
    ```

##### Синхронная версия (карты импорта)

=== "MJS"

    ```js
    // import-map-sync-hooks.js
    import fs from 'node:fs/promises';
    import module from 'node:module';
    
    const { imports } = JSON.parse(fs.readFileSync('import-map.json', 'utf-8'));
    
    function resolve(specifier, context, nextResolve) {
      if (Object.hasOwn(imports, specifier)) {
        return nextResolve(imports[specifier], context);
      }
    
      return nextResolve(specifier, context);
    }
    
    module.registerHooks({ resolve });
    ```

##### Использование хуков

При таких файлах:

=== "MJS"

    ```js
    // main.js
    import 'a-module';
    ```

```json
// import-map.json
{
  "imports": {
    "a-module": "./some-module.js"
  }
}
```

=== "MJS"

    ```js
    // some-module.js
    console.log('some module!');
    ```

Команда `node --import 'data:text/javascript,import [register](#moduleregisterspecifier-parenturl-options) from "node:module"; import { pathToFileURL } from "node:url"; register(pathToFileURL("./import-map-hooks.js"));' main.js`
или `node --import ./import-map-sync-hooks.js main.js`
должна вывести `some module!`.

## Поддержка source map {: #source-map-support}

<!-- YAML
added:
 - v13.7.0
 - v12.17.0
-->

> Стабильность: 1 — экспериментальная

Node.js поддерживает формат TC39 ECMA-426 [Source Map][Source Map] (ранее его называли форматом Source map revision 3).

API в этом разделе помогают работать с кэшем source map. Кэш заполняется, когда включён разбор source map и
в «подвале» модулей найдены [директивы подключения source map][source map include directives].

Чтобы включить разбор source map, запустите Node.js с флагом
[`--enable-source-maps`][`--enable-source-maps`], с покрытием кода через
[`NODE_V8_COVERAGE=dir`][`NODE_V8_COVERAGE=dir`] или включите поддержку программно через
[`module.setSourceMapsSupport()`][`module.setSourceMapsSupport()`].

=== "MJS"

    ```js
    // module.mjs
    // In an ECMAScript module
    import { findSourceMap, SourceMap } from 'node:module';
    ```

=== "CJS"

    ```js
    // module.cjs
    // In a CommonJS module
    const { findSourceMap, SourceMap } = require('node:module');
    ```

### `module.getSourceMapsSupport()`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `enabled` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включена ли поддержка source map
  * `nodeModules` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включена ли поддержка для файлов в `node_modules`.
  * `generatedCode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включена ли поддержка для кода из `eval` или `new Function`.

Метод сообщает, включена ли поддержка [Source Map v3][Source Map] для трассировок стека.

<!-- Anchors to make sure old links find a target -->

### `module.findSourceMap(path)` {#module_module_findsourcemap_path_error}

<!-- YAML
added:
 - v13.7.0
 - v12.17.0
-->

* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<module.SourceMap>`](module.md) | undefined `module.SourceMap`, если source map найден,
  иначе `undefined`.

`path` — разрешённый путь к файлу, для которого нужно получить соответствующий source map.

### `module.setSourceMapsSupport(enabled[, options])`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

* `enabled` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить поддержку source map.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательно
  * `nodeModules` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить поддержку для файлов в
    `node_modules`. **По умолчанию:** `false`.
  * `generatedCode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить поддержку для кода из
    `eval` или `new Function`. **По умолчанию:** `false`.

Функция включает или отключает поддержку [Source Map v3][Source Map] для трассировок стека.

По возможностям это близко к запуску Node.js с опциями командной строки
`--enable-source-maps`, с дополнительными параметрами для файлов в `node_modules` и сгенерированного кода.

Разбираются и загружаются только source map в JS-файлах, подключённых после включения поддержки.
Надёжнее задать `--enable-source-maps` в командной строке, чтобы не потерять source map у модулей,
загруженных до вызова этого API.

### Класс: `module.SourceMap`

<!-- YAML
added:
 - v13.7.0
 - v12.17.0
-->

#### `new SourceMap(payload[, { lineLengths }])`

<!-- YAML
changes:
  - version: v20.5.0
    pr-url: https://github.com/nodejs/node/pull/48461
    description: Add support for `lineLengths`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.5.0 | Добавьте поддержку `lineLengths`. |

* `payload` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `lineLengths` [`<number[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Создаёт новый экземпляр `sourceMap`.

`payload` — объект с полями по [формату Source map][Source map format]:

* `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `version` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `sources` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `sourcesContent` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `names` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `mappings` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `sourceRoot` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

`lineLengths` — необязательный массив длин строк сгенерированного кода.

#### `sourceMap.payload`

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Геттер для полезной нагрузки, из которой создан экземпляр [`SourceMap`][`SourceMap`].

#### `sourceMap.findEntry(lineOffset, columnOffset)`

* `lineOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки (с нуля) в сгенерированном исходнике
* `columnOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера столбца (с нуля) в сгенерированном исходнике
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По смещению строки и столбца в сгенерированном файле возвращает объект с диапазоном SourceMap в исходном файле или пустой объект, если не найдено.

Объект содержит поля:

* `generatedLine` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение строки начала диапазона в сгенерированном исходнике
* `generatedColumn` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение столбца начала диапазона в сгенерированном исходнике
* `originalSource` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла исходника, как в SourceMap
* `originalLine` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение строки начала диапазона в исходном файле
* `originalColumn` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение столбца начала диапазона в исходном файле
* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращаемое значение — «сырой» диапазон в SourceMap в координатах с нулевой базой, а не номера строки/столбца с единицей, как в сообщениях `Error` и объектах `CallSite`.

Чтобы получить номера строки и столбца с единицей, как в стеках `Error` и `CallSite`, используйте `sourceMap.findOrigin(lineNumber, columnNumber)`.

#### `sourceMap.findOrigin(lineNumber, columnNumber)`

<!-- YAML
added:
  - v20.4.0
  - v18.18.0
-->

* `lineNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер строки (с единицы) позиции вызова в сгенерированном исходнике
* `columnNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер столбца (с единицы) позиции вызова в сгенерированном исходнике
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

По номерам строки и столбца (с единицы) в сгенерированном исходнике находит соответствующую позицию в исходном файле.

Если пара `lineNumber`/`columnNumber` не найдена в source map, возвращается пустой объект. Иначе объект содержит:

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Имя диапазона в source map, если было задано
* `fileName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя исходного файла, как в SourceMap
* `lineNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер строки (с единицы) соответствующей позиции в исходнике
* `columnNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер столбца (с единицы) соответствующей позиции в исходнике

[CommonJS]: modules.md
[Conditional exports]: packages.md#conditional-exports
[Customization hooks]: #customization-hooks
[ES Modules]: esm.md
[Permission Model]: permissions.md#permission-model
[Source Map]: https://tc39.es/ecma426/
[Source map format]: https://tc39.es/ecma426/#sec-source-map-format
[V8 JavaScript code coverage]: https://v8project.blogspot.com/2017/12/javascript-code-coverage.html
[V8 code cache]: https://v8.dev/blog/code-caching-for-devs
[`"exports"`]: packages.md#exports
[`--enable-source-maps`]: cli.md#--enable-source-maps
[`--import`]: cli.md#--importmodule
[`--require`]: cli.md#-r---require-module
[`NODE_COMPILE_CACHE=dir`]: cli.md#node_compile_cachedir
[`NODE_COMPILE_CACHE_PORTABLE=1`]: cli.md#node_compile_cache_portable1
[`NODE_DISABLE_COMPILE_CACHE=1`]: cli.md#node_disable_compile_cache1
[`NODE_V8_COVERAGE=dir`]: cli.md#node_v8_coveragedir
[`SourceMap`]: #class-modulesourcemap
[`initialize`]: #initialize
[`module.constants.compileCacheStatus`]: #moduleconstantscompilecachestatus
[`module.enableCompileCache()`]: #moduleenablecompilecacheoptions
[`module.flushCompileCache()`]: #moduleflushcompilecache
[`module.getCompileCacheDir()`]: #modulegetcompilecachedir
[`module.registerHooks()`]: #moduleregisterhooksoptions
[`module.setSourceMapsSupport()`]: #modulesetsourcemapssupportenabled-options
[`module`]: #the-module-object
[`os.tmpdir()`]: os.md#ostmpdir
[`register`]: #moduleregisterspecifier-parenturl-options
[`util.TextDecoder`]: util.md#class-utiltextdecoder
[accepted final formats]: #accepted-final-formats-returned-by-load
[asynchronous `load` hook]: #asynchronous-loadurl-context-nextload
[asynchronous `resolve` hook]: #asynchronous-resolvespecifier-context-nextresolve
[asynchronous hook functions]: #asynchronous-hooks-accepted-by-moduleregister
[caveats of asynchronous customization hooks]: #caveats-of-asynchronous-customization-hooks
[deregistration of synchronous customization hooks]: #deregistration-of-synchronous-customization-hooks
[hooks]: #customization-hooks
[load hook]: #synchronous-loadurl-context-nextload
[module compile cache]: #module-compile-cache
[module wrapper]: modules.md#the-module-wrapper
[realm]: https://tc39.es/ecma262/#realm
[resolve hook]: #synchronous-resolvespecifier-context-nextresolve
[source map include directives]: https://tc39.es/ecma426/#sec-linking-generated-code
[synchronous hook functions]: #hook-functions-accepted-by-moduleregisterhooks
[the documentation of `Worker`]: worker_threads.md#new-workerfilename-options
[transferable objects]: worker_threads.md#portpostmessagevalue-transferlist
[type-stripping]: typescript.md#type-stripping
