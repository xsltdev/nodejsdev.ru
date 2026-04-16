---
title: VM (выполнение JavaScript)
description: Модуль node:vm — компиляция и запуск кода в контекстах виртуальной машины V8; не является средством изоляции для недоверенного кода
---

# VM (выполнение JavaScript)

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/vm.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!--name=vm-->

<!-- source_link=lib/vm.js -->

Модуль `node:vm` позволяет компилировать и выполнять код в контекстах виртуальной
машины V8.

<strong class="critical">Модуль `node:vm` не является механизмом
безопасности. Не используйте его для запуска недоверенного кода.</strong>

Код на JavaScript можно скомпилировать и выполнить сразу или
скомпилировать, сохранить и выполнить позже.

Типичный сценарий — выполнить код в другом контексте V8. Тогда у вызываемого кода
другой глобальный объект, чем у вызывающего.

Контекст можно задать, [_контекстируя_][contextified] объект. Вызываемый код
воспринимает любое свойство контекста как глобальную переменную. Изменения глобальных
переменных, внесённые вызываемым кодом, отражаются в объекте контекста.

=== "MJS"

    ```js
    import { createContext, runInContext } from 'node:vm';
    
    const x = 1;
    
    const context = { x: 2 };
    createContext(context); // Контекстировать объект.
    
    const code = 'x += 40; var y = 17;';
    // `x` и `y` — глобальные переменные в контексте.
    // Изначально x равен 2, потому что таково значение context.x.
    runInContext(code, context);
    
    console.log(context.x); // 42
    console.log(context.y); // 17
    
    console.log(x); // 1; y не определён
    ```

=== "CJS"

    ```js
    const { createContext, runInContext } = require('node:vm');
    
    const x = 1;
    
    const context = { x: 2 };
    createContext(context); // Контекстировать объект.
    
    const code = 'x += 40; var y = 17;';
    // `x` и `y` — глобальные переменные в контексте.
    // Изначально x равен 2, потому что таково значение context.x.
    runInContext(code, context);
    
    console.log(context.x); // 42
    console.log(context.y); // 17
    
    console.log(x); // 1; y не определён
    ```

## Класс: `vm.Script`

<!-- YAML
added: v0.3.1
-->

Экземпляры класса `vm.Script` содержат предварительно скомпилированные сценарии, которые
можно выполнять в заданных контекстах.

### `new vm.Script(code[, options])`

<!-- YAML
added: v0.3.1
changes:
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51244
    description: Added support for
                `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`.
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/40249
    description: Added support for import attributes to the
                 `importModuleDynamically` parameter.
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/20300
    description: The `produceCachedData` is deprecated in favour of
                 `script.createCachedData()`.
  - version: v5.7.0
    pr-url: https://github.com/nodejs/node/pull/4777
    description: The `cachedData` and `produceCachedData` options are
                 supported now.
-->

Добавлено в: v0.3.1

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) JavaScript-код для компиляции.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла в трассировках стека, создаваемых этим сценарием. **По умолчанию:** `'evalmachine.<anonymous>'`.
  * `lineOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки в трассировках стека. **По умолчанию:** `0`.
  * `columnOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера колонки первой строки в трассировках стека. **По умолчанию:** `0`.
  * `cachedData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательный `Buffer`,
    `TypedArray` или `DataView` с данными кэша кода V8 для исходного текста. Если задано,
    свойство `cachedDataRejected` будет `true` или `false` в зависимости от того, принял ли V8 данные.
  * `produceCachedData` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` и отсутствии `cachedData` V8
    попытается создать данные кэша кода для `code`. При успехе будет создан
    `Buffer` с кэшем кода V8 и сохранён в свойстве `cachedData` возвращённого экземпляра `vm.Script`.
    Свойство `cachedDataProduced` будет `true` или `false` в зависимости от успеха.
    Эта опция **устарела**; используйте `script.createCachedData()`.
    **По умолчанию:** `false`.
  * `importModuleDynamically`
    [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    Задаёт, как загружать модули при вычислении этого сценария при вызове `import()`. Опция относится к
    экспериментальному API модулей. В production не рекомендуется.
    Подробнее см. [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).

Если `options` — строка, она задаёт имя файла.

Создание объекта `vm.Script` компилирует `code`, но не выполняет его.
Скомпилированный `vm.Script` можно многократно выполнять позже. Код `code` не привязан
к глобальному объекту; привязка выполняется перед каждым запуском, только на время этого запуска.

### `script.cachedDataRejected`

<!-- YAML
added: v5.7.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined

Если при создании `vm.Script` передан `cachedData`, это значение будет
`true` или `false` в зависимости от того, принял ли V8 данные.
Иначе значение — `undefined`.

### `script.createCachedData()`

<!-- YAML
added: v10.6.0
-->

* Возвращает: [`<Buffer>`](buffer.md#buffer)

Создаёт кэш кода для опции `cachedData` конструктора `Script`. Возвращает `Buffer`. Метод можно вызывать в любое
время и любое число раз.

Кэш кода `Script` не содержит наблюдаемых из JavaScript состояний. Его можно сохранять рядом с исходным текстом и
использовать для создания новых экземпляров `Script` многократно.

Функции в исходнике `Script` могут быть помечены как лениво компилируемые и не
компилируются при создании `Script`. Они скомпилируются при первом вызове. Кэш кода сериализует
метаданные, которые V8 уже знает о `Script`, чтобы ускорить
дальнейшие компиляции.

```js
const script = new vm.Script(`
function add(a, b) {
  return a + b;
}

const x = add(1, 2);
`);

const cacheWithoutAdd = script.createCachedData();
// В `cacheWithoutAdd` функция `add()` помечена для полной компиляции при вызове.

script.runInThisContext();

const cacheWithAdd = script.createCachedData();
// `cacheWithAdd` содержит полностью скомпилированную функцию `add()`.
```

### `script.runInContext(contextifiedObject[, options])`

<!-- YAML
added: v0.3.1
changes:
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: The `breakOnSigint` option is supported now.
-->

Добавлено в: v0.3.1

* `contextifiedObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Контекстированный][contextified] объект, возвращённый
  методом `vm.createContext()`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `displayErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true`, если при компиляции `code` возникает [`Error`](errors.md#class-error),
    строка кода, вызвавшая ошибку, добавляется к трассировке стека. **По умолчанию:** `true`.
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд выполнения `code` до принудительной остановки. При остановке выбрасывается [`Error`](errors.md#class-error).
    Значение — строго положительное целое.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Обработчики, подключённые через `process.on('SIGINT')`, на время выполнения сценария отключаются, затем снова действуют. **По умолчанию:** `false`.
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат последнего выполненного оператора сценария.

Выполняет скомпилированный код объекта `vm.Script` в заданном
`contextifiedObject` и возвращает результат. У выполняемого кода нет доступа
к локальной области видимости.

Пример компилирует код, увеличивающий глобальную переменную, задаёт
другую глобальную переменную и несколько раз выполняет сценарий.
Глобальные переменные хранятся в объекте `context`.

=== "MJS"

    ```js
    import { createContext, Script } from 'node:vm';
    
    const context = {
      animal: 'cat',
      count: 2,
    };
    
    const script = new Script('count += 1; name = "kitty";');
    
    createContext(context);
    for (let i = 0; i < 10; ++i) {
      script.runInContext(context);
    }
    
    console.log(context);
    // Prints: { animal: 'cat', count: 12, name: 'kitty' }
    ```

=== "CJS"

    ```js
    const { createContext, Script } = require('node:vm');
    
    const context = {
      animal: 'cat',
      count: 2,
    };
    
    const script = new Script('count += 1; name = "kitty";');
    
    createContext(context);
    for (let i = 0; i < 10; ++i) {
      script.runInContext(context);
    }
    
    console.log(context);
    // Prints: { animal: 'cat', count: 12, name: 'kitty' }
    ```

Использование опций `timeout` или `breakOnSigint` запускает новые циклы событий
и связанные потоки, что даёт ненулевые накладные расходы.

### `script.runInNewContext([contextObject[, options]])`

<!-- YAML
added: v0.3.1
changes:
  - version:
    - v22.8.0
    - v20.18.0
    pr-url: https://github.com/nodejs/node/pull/54394
    description: Аргумент `contextObject` теперь может быть `vm.constants.DONT_CONTEXTIFY`.
  - version: v14.6.0
    pr-url: https://github.com/nodejs/node/pull/34023
    description: Поддерживается опция `microtaskMode`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19016
    description: Поддерживается опция `contextCodeGeneration`.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: Поддерживается опция `breakOnSigint`.
-->

Добавлено в: v0.3.1

* `contextObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<vm.constants.DONT_CONTEXTIFY>`](#vmconstantsdont_contextify) | undefined
  Либо [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify), либо объект, который будет [контекстифицирован][contextified].
  Если `undefined`, для обратной совместимости создаётся пустой контекстифицированный объект.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `displayErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, при [`Error`](errors.md#class-error) при компиляции
    `code` к стеку добавляется строка с ошибочным кодом.
    **По умолчанию:** `true`.
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд выполнения `code`
    до прерывания. При прерывании выбрасывается [`Error`](errors.md#class-error).
    Значение должно быть строго положительным целым.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Обработчики `process.on('SIGINT')` отключаются на время выполнения скрипта, затем снова работают.
    **По умолчанию:** `false`.
  * `contextName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Читаемое имя нового контекста.
    **По умолчанию:** `'VM Context i'`, где `i` — возрастающий индекс
    созданного контекста.
  * `contextOrigin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Origin][origin] нового контекста для отображения.
    Формат как у URL, но только схема, хост и при необходимости порт, как
    у [`url.origin`](url.md#urlorigin) у [`URL`](url.md#class-url). Обратите внимание: без завершающего слэша, он означает путь.
    **По умолчанию:** `''`.
  * `contextCodeGeneration` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `strings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, вызовы `eval` и конструкторов функций
      (`Function`, `GeneratorFunction` и т.д.) дают
      `EvalError`. **По умолчанию:** `true`.
    * `wasm` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, компиляция WebAssembly
      даёт `WebAssembly.CompileError`. **По умолчанию:** `true`.
  * `microtaskMode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если `afterEvaluate`, микрозадачи (через `Promise` и `async function`)
    выполняются сразу после скрипта. В этом случае они входят в ограничения `timeout` и
    `breakOnSigint`.
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат последнего выполненного в скрипте выражения.

Эквивалентно `script.runInContext(vm.createContext(options), options)`.
Делает следующее:

1. Создаёт новый контекст.
2. Если `contextObject` — объект, [контекстифицирует][contextified] его в новом контексте.
   Если `contextObject` — `undefined`, создаётся новый объект и [контекстифицируется][contextified].
   Если [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify) — ничего не [контекстифицировать][contextified].
3. Запускает скомпилированный код `vm.Script` в созданном контексте. Код
   не видит область, из которой вызван метод.
4. Возвращает результат.

В примере ниже компилируется код, задающий глобальную переменную, затем он выполняется
несколько раз в разных контекстах. Глобальные переменные изолированы в каждом `context`.

=== "MJS"

    ```js
    import { constants, Script } from 'node:vm';
    
    const script = new Script('globalVar = "set"');
    
    const contexts = [{}, {}, {}];
    contexts.forEach((context) => {
      script.runInNewContext(context);
    });
    
    console.log(contexts);
    // Prints: [{ globalVar: 'set' }, { globalVar: 'set' }, { globalVar: 'set' }]
    
    // This would throw if the context is created from a contextified object.
    // constants.DONT_CONTEXTIFY allows creating contexts with ordinary
    // global objects that can be frozen.
    const freezeScript = new Script('Object.freeze(globalThis); globalThis;');
    const frozenContext = freezeScript.runInNewContext(constants.DONT_CONTEXTIFY);
    ```

=== "CJS"

    ```js
    const { constants, Script } = require('node:vm');
    
    const script = new Script('globalVar = "set"');
    
    const contexts = [{}, {}, {}];
    contexts.forEach((context) => {
      script.runInNewContext(context);
    });
    
    console.log(contexts);
    // Prints: [{ globalVar: 'set' }, { globalVar: 'set' }, { globalVar: 'set' }]
    
    // This would throw if the context is created from a contextified object.
    // constants.DONT_CONTEXTIFY allows creating contexts with ordinary
    // global objects that can be frozen.
    const freezeScript = new Script('Object.freeze(globalThis); globalThis;');
    const frozenContext = freezeScript.runInNewContext(constants.DONT_CONTEXTIFY);
    ```

### `script.runInThisContext([options])`

<!-- YAML
added: v0.3.1
changes:
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: The `breakOnSigint` option is supported now.
-->

Добавлено в: v0.3.1

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `displayErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, при [`Error`](errors.md#class-error) при компиляции `code`
    строка с ошибочным кодом добавляется к трассировке стека. **По умолчанию:** `true`.
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд выполнения `code` до остановки. При остановке
    выбрасывается [`Error`](errors.md#class-error). Значение — строго положительное целое.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Обработчики `process.on('SIGINT')` отключаются на время выполнения
    сценария, затем снова работают. **По умолчанию:** `false`.
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат последнего выполненного в сценарии оператора.

Выполняет скомпилированный код объекта `vm.Script` в контексте текущего объекта
`global`. У выполняемого кода нет доступа к локальной области видимости, но есть
к текущему `global`.

В примере ниже код увеличивает глобальную переменную и выполняется несколько раз:

=== "MJS"

    ```js
    import { Script } from 'node:vm';
    
    global.globalVar = 0;
    
    const script = new Script('globalVar += 1', { filename: 'myfile.vm' });
    
    for (let i = 0; i < 1000; ++i) {
      script.runInThisContext();
    }
    
    console.log(globalVar);
    
    // 1000
    ```

=== "CJS"

    ```js
    const { Script } = require('node:vm');
    
    global.globalVar = 0;
    
    const script = new Script('globalVar += 1', { filename: 'myfile.vm' });
    
    for (let i = 0; i < 1000; ++i) {
      script.runInThisContext();
    }
    
    console.log(globalVar);
    
    // 1000
    ```

### `script.sourceMapURL`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Если сценарий скомпилирован из исходника с магическим комментарием source map,
это свойство будет содержать URL карты исходников.

=== "MJS"

    ```js
    import vm from 'node:vm';
    
    const script = new vm.Script(`
    function myFunc() {}
    //# sourceMappingURL=sourcemap.json
    `);
    
    console.log(script.sourceMapURL);
    // Prints: sourcemap.json
    ```

=== "CJS"

    ```js
    const vm = require('node:vm');
    
    const script = new vm.Script(`
    function myFunc() {}
    //# sourceMappingURL=sourcemap.json
    `);
    
    console.log(script.sourceMapURL);
    // Prints: sourcemap.json
    ```

## Класс: `vm.Module`

<!-- YAML
added:
 - v13.0.0
 - v12.16.0
-->

!!!warning "Стабильность: 1 - Экспериментальная"

Эта возможность доступна только при включённом флаге командной строки
`--experimental-vm-modules`.

Класс `vm.Module` даёт низкоуровневый интерфейс для работы с модулями ECMAScript
в контекстах VM. Это аналог класса `vm.Script`, который тесно следует
записям [Module Record][Module Record] в спецификации ECMAScript.

В отличие от `vm.Script`, каждый объект `vm.Module` при создании привязан к контексту.

Работа с объектом `vm.Module` состоит из трёх шагов: создание/разбор,
связывание и вычисление. Эти шаги показаны в примере ниже.

Реализация находится на более низком уровне, чем [загрузчик модулей ECMAScript][ECMAScript Module Loader].
Взаимодействовать с загрузчиком пока нельзя, хотя поддержка планируется.

=== "MJS"

    ```js
    import vm from 'node:vm';
    
    const contextifiedObject = vm.createContext({
      secret: 42,
      print: console.log,
    });
    
    // Step 1
    //
    // Create a Module by constructing a new `vm.SourceTextModule` object. This
    // parses the provided source text, throwing a `SyntaxError` if anything goes
    // wrong. By default, a Module is created in the top context. But here, we
    // specify `contextifiedObject` as the context this Module belongs to.
    //
    // Here, we attempt to obtain the default export from the module "foo", and
    // put it into local binding "secret".
    
    const rootModule = new vm.SourceTextModule(`
      import s from 'foo';
      s;
      print(s);
    `, { context: contextifiedObject });
    
    // Step 2
    //
    // "Link" the imported dependencies of this Module to it.
    //
    // Obtain the requested dependencies of a SourceTextModule by
    // `sourceTextModule.moduleRequests` and resolve them.
    //
    // Even top-level Modules without dependencies must be explicitly linked. The
    // array passed to `sourceTextModule.linkRequests(modules)` can be
    // empty, however.
    //
    // Note: This is a contrived example in that the resolveAndLinkDependencies
    // creates a new "foo" module every time it is called. In a full-fledged
    // module system, a cache would probably be used to avoid duplicated modules.
    
    const moduleMap = new Map([
      ['root', rootModule],
    ]);
    
    function resolveAndLinkDependencies(module) {
      const requestedModules = module.moduleRequests.map((request) => {
        // In a full-fledged module system, the resolveAndLinkDependencies would
        // resolve the module with the module cache key `[specifier, attributes]`.
        // In this example, we just use the specifier as the key.
        const specifier = request.specifier;
    
        let requestedModule = moduleMap.get(specifier);
        if (requestedModule === undefined) {
          requestedModule = new vm.SourceTextModule(`
            // The "secret" variable refers to the global variable we added to
            // "contextifiedObject" when creating the context.
            export default secret;
          `, { context: module.context });
          moduleMap.set(specifier, requestedModule);
          // Resolve the dependencies of the new module as well.
          resolveAndLinkDependencies(requestedModule);
        }
    
        return requestedModule;
      });
    
      module.linkRequests(requestedModules);
    }
    
    resolveAndLinkDependencies(rootModule);
    rootModule.instantiate();
    
    // Step 3
    //
    // Evaluate the Module. The evaluate() method returns a promise which will
    // resolve after the module has finished evaluating.
    
    // Prints 42.
    await rootModule.evaluate();
    ```

=== "CJS"

    ```js
    const vm = require('node:vm');
    
    const contextifiedObject = vm.createContext({
      secret: 42,
      print: console.log,
    });
    
    (async () => {
      // Step 1
      //
      // Create a Module by constructing a new `vm.SourceTextModule` object. This
      // parses the provided source text, throwing a `SyntaxError` if anything goes
      // wrong. By default, a Module is created in the top context. But here, we
      // specify `contextifiedObject` as the context this Module belongs to.
      //
      // Here, we attempt to obtain the default export from the module "foo", and
      // put it into local binding "secret".
    
      const rootModule = new vm.SourceTextModule(`
        import s from 'foo';
        s;
        print(s);
      `, { context: contextifiedObject });
    
      // Step 2
      //
      // "Link" the imported dependencies of this Module to it.
      //
      // Obtain the requested dependencies of a SourceTextModule by
      // `sourceTextModule.moduleRequests` and resolve them.
      //
      // Even top-level Modules without dependencies must be explicitly linked. The
      // array passed to `sourceTextModule.linkRequests(modules)` can be
      // empty, however.
      //
      // Note: This is a contrived example in that the resolveAndLinkDependencies
      // creates a new "foo" module every time it is called. In a full-fledged
      // module system, a cache would probably be used to avoid duplicated modules.
    
      const moduleMap = new Map([
        ['root', rootModule],
      ]);
    
      function resolveAndLinkDependencies(module) {
        const requestedModules = module.moduleRequests.map((request) => {
          // In a full-fledged module system, the resolveAndLinkDependencies would
          // resolve the module with the module cache key `[specifier, attributes]`.
          // In this example, we just use the specifier as the key.
          const specifier = request.specifier;
    
          let requestedModule = moduleMap.get(specifier);
          if (requestedModule === undefined) {
            requestedModule = new vm.SourceTextModule(`
              // The "secret" variable refers to the global variable we added to
              // "contextifiedObject" when creating the context.
              export default secret;
            `, { context: module.context });
            moduleMap.set(specifier, requestedModule);
            // Resolve the dependencies of the new module as well.
            resolveAndLinkDependencies(requestedModule);
          }
    
          return requestedModule;
        });
    
        module.linkRequests(requestedModules);
      }
    
      resolveAndLinkDependencies(rootModule);
      rootModule.instantiate();
    
      // Step 3
      //
      // Evaluate the Module. The evaluate() method returns a promise which will
      // resolve after the module has finished evaluating.
    
      // Prints 42.
      await rootModule.evaluate();
    })();
    ```

### `module.error`

* Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Если `module.status` равен `'errored'`, это свойство содержит исключение,
выброшенное модулем при вычислении. При любом другом статусе обращение
к свойству приводит к выброшенному исключению.

Значение `undefined` нельзя использовать для случая «исключения не было» из‑за
возможной неоднозначности с `throw undefined;`.

Соответствует полю `[[EvaluationError]]` у [Cyclic Module Record][Cyclic Module Record]
в спецификации ECMAScript.

### `module.evaluate([options])`

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт число миллисекунд выполнения
    до принудительного завершения. Если выполнение будет прервано, будет выброшен [`Error`](errors.md#class-error).
    Это значение должно быть строго положительным целым числом.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Уже подключённые обработчики через
    `process.on('SIGINT')` на время выполнения сценария отключаются, затем снова
    работают. **По умолчанию:** `false`.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Вычисляет модуль и его зависимости. Соответствует полю [Evaluate() concrete method][Evaluate() concrete method] у [Cyclic Module Record][Cyclic Module Record] в спецификации ECMAScript.

Если модуль — `vm.SourceTextModule`, `evaluate()` нужно вызывать после инстанцирования модуля;
иначе `evaluate()` вернёт отклонённый промис.

Для `vm.SourceTextModule` промис, возвращаемый `evaluate()`, может быть выполнен
синхронно или асинхронно:

1. Если у `vm.SourceTextModule` нет top-level `await` ни в нём самом, ни в зависимостях, промис будет
   выполнен _синхронно_ после вычисления модуля и всех зависимостей.
   1. При успешном вычислении промис _синхронно_ разрешается в `undefined`.
   2. Если вычисление завершается исключением, промис _синхронно_ отклоняется этим исключением
      (то же, что в `module.error`).
2. Если у `vm.SourceTextModule` есть top-level `await` в нём или в зависимостях, промис будет
   выполнен _асинхронно_ после вычисления модуля и всех зависимостей.
   1. При успешном вычислении промис _асинхронно_ разрешается в `undefined`.
   2. Если вычисление завершается исключением, промис _асинхронно_ отклоняется этим исключением.

Если модуль — `vm.SyntheticModule`, `evaluate()` всегда возвращает промис, который выполняется синхронно; см.
[Evaluate() of a Synthetic Module Record][Evaluate() of a Synthetic Module Record]:

1. Если `evaluateCallback`, переданный в конструктор, синхронно выбрасывает исключение, `evaluate()` возвращает
   промис, который будет синхронно отклонён этим исключением.
2. Если `evaluateCallback` не выбрасывает исключение, `evaluate()` возвращает промис, который будет
   синхронно разрешён в `undefined`.

`evaluateCallback` у `vm.SyntheticModule` выполняется синхронно внутри вызова `evaluate()`, его
возвращаемое значение отбрасывается. Поэтому если `evaluateCallback` — асинхронная функция, промис, возвращаемый
`evaluate()`, не отразит её асинхронное поведение, а отклонения от асинхронного
`evaluateCallback` будут потеряны.

`evaluate()` можно вызвать снова после того, как модуль уже вычислен:

1. Если первое вычисление завершилось успешно (`module.status` — `'evaluated'`), ничего не делает
   и возвращает промис, разрешающийся в `undefined`.
2. Если первое вычисление завершилось исключением (`module.status` — `'errored'`), снова отклоняется
   тем исключением, что было при первом вычислении.

Этот метод нельзя вызывать, пока модуль вычисляется (`module.status` — `'evaluating'`).

### `module.identifier`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Идентификатор текущего модуля, заданный в конструкторе.

### `module.link(linker)`

<!-- YAML
changes:
  - version:
    - v21.1.0
    - v20.10.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/50141
    description: The option `extra.assert` is renamed to `extra.attributes`. The
                 former name is still provided for backward compatibility.
-->

* `linker` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Спецификатор запрошенного модуля:
    ```mjs
    import foo from 'foo';
    //              ^^^^^ the module specifier
    ```

  * `referencingModule` [`<vm.Module>`](vm.md) Объект `Module`, для которого вызывается `link()`.

  * `extra` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `attributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Данные из атрибута:
      ```mjs
      import foo from 'foo' with { name: 'value' };
      //                         ^^^^^^^^^^^^^^^^^ the attribute
      ```
      По ECMA-262 хост должен вызвать ошибку при наличии
      неподдерживаемого атрибута.
    * `assert` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Псевдоним для `extra.attributes`.

  * Возвращает: [`<vm.Module>`](vm.md) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Связывает зависимости модуля. Метод нужно вызвать до вычисления, не более
одного раза на модуль.

Используйте [`sourceTextModule.linkRequests(modules)`](#sourcetextmodulelinkrequestsmodules) и
[`sourceTextModule.instantiate()`](#sourcetextmoduleinstantiate), чтобы связывать модули синхронно или
асинхронно.

Функция должна вернуть объект `Module` или `Promise`, который в итоге
разрешается в `Module`. Возвращённый `Module` должен удовлетворять двум инвариантам:

* Принадлежит тому же контексту, что и родительский `Module`.
* Его `status` не должен быть `'errored'`.

Если у возвращённого `Module` `status` равен `'unlinked'`, этот метод будет
рекурсивно вызван для возвращённого `Module` с той же функцией `linker`.

`link()` возвращает `Promise`, который разрешится, когда все связывания
дадут корректный `Module`, или будет отклонён, если функция-связчик
выбросит исключение или вернёт некорректный `Module`.

Функция-связчик примерно соответствует реализации абстрактной операции
[HostResolveImportedModule][HostResolveImportedModule] в спецификации ECMAScript,
с отличиями:

* Функция-связчик может быть асинхронной, тогда как
  [HostResolveImportedModule][HostResolveImportedModule] — синхронна.

Фактическая реализация [HostResolveImportedModule][HostResolveImportedModule], используемая при
связывании модулей, возвращает модули, связанные в процессе связывания. К этому моменту
все модули уже полностью связаны, поэтому реализация
[HostResolveImportedModule][HostResolveImportedModule] по спецификации полностью синхронна.

Соответствует полю [Link() concrete method][Link() concrete method] у [Cyclic Module Record][Cyclic Module Record] в спецификации ECMAScript.

### `module.namespace`

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект пространства имён модуля. Доступен только после завершения связывания
(вызова `module.link()`).

Соответствует абстрактной операции [GetModuleNamespace][GetModuleNamespace] в спецификации ECMAScript.

### `module.status`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Текущий статус модуля. Одно из значений:

* `'unlinked'`: `module.link()` ещё не вызывался.

* `'linking'`: `module.link()` вызван, но ещё не разрешены все промисы,
  возвращённые функцией-связчиком.

* `'linked'`: модуль успешно связан, все зависимости связаны, но `module.evaluate()` ещё не вызывался.

* `'evaluating'`: модуль вычисляется через `module.evaluate()` у
  него самого или родительского модуля.

* `'evaluated'`: модуль успешно вычислен.

* `'errored'`: модуль был вычислен, но было выброшено исключение.

Кроме `'errored'`, строка статуса соответствует полю `[[Status]]` у
[Cyclic Module Record][Cyclic Module Record] в спецификации. `'errored'` соответствует
`'evaluated'` в спецификации, но с `[[EvaluationError]]`, отличным от
`undefined`.

## Класс: `vm.SourceTextModule`

<!-- YAML
added: v9.6.0
-->

!!!warning "Стабильность: 1 - Экспериментальная"

Эта возможность доступна только при включённом флаге командной строки
`--experimental-vm-modules`.

* Наследует: [`<vm.Module>`](vm.md)

Класс `vm.SourceTextModule` реализует [Source Text Module Record][Source Text Module Record], как
определено в спецификации ECMAScript.

### `new vm.SourceTextModule(code[, options])`

<!-- YAML
changes:
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/40249
    description: Added support for import attributes to the
                 `importModuleDynamically` parameter.
-->

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) код модуля JavaScript для разбора
* `options`
  * `identifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка для трассировок стека.
    **По умолчанию:** `'vm:module(i)'`, где `i` — возрастающий индекс,
    зависящий от контекста.
  * `cachedData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательный `Buffer`,
    `TypedArray` или `DataView` с данными кэша кода V8 для переданного
    исходника. `code` должен совпадать с модулем, из которого получен этот
    `cachedData`.
  * `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Контекстифицированный][contextified] объект, возвращённый
    `vm.createContext()`, в котором компилируется и вычисляется этот `Module`.
    Если контекст не задан, модуль вычисляется в текущем
    контексте выполнения.
  * `lineOffset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки в трассировках стека для этого
    `Module`. **По умолчанию:** `0`.
  * `columnOffset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера колонки первой строки в трассировках стека для этого
    `Module`. **По умолчанию:** `0`.
  * `initializeImportMeta` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при вычислении этого `Module`
    для инициализации `import.meta`.
    * `meta` [`<import.meta>`](esm.md#importmeta)
    * `module` [`<vm.SourceTextModule>`](vm.md)
  * `importModuleDynamically` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Задаёт,
    как загружать модули при вычислении этого модуля при вызове `import()`. Опция относится к экспериментальному
    API модулей. В production не рекомендуется.
    Подробнее см.
    [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).

Создаёт новый экземпляр `SourceTextModule`.

Свойства `import.meta`, значениями которых являются объекты, могут
позволить модулю обращаться к данным вне указанного `context`. Используйте
`vm.runInContext()`, чтобы создавать объекты в нужном контексте.

=== "MJS"

    ```js
    import vm from 'node:vm';
    
    const contextifiedObject = vm.createContext({ secret: 42 });
    
    const module = new vm.SourceTextModule(
      'Object.getPrototypeOf(import.meta.prop).secret = secret;',
      {
        initializeImportMeta(meta) {
          // Note: this object is created in the top context. As such,
          // Object.getPrototypeOf(import.meta.prop) points to the
          // Object.prototype in the top context rather than that in
          // the contextified object.
          meta.prop = {};
        },
      });
    // The module has an empty `moduleRequests` array.
    module.linkRequests([]);
    module.instantiate();
    await module.evaluate();
    
    // Now, Object.prototype.secret will be equal to 42.
    //
    // To fix this problem, replace
    //     meta.prop = {};
    // above with
    //     meta.prop = vm.runInContext('{}', contextifiedObject);
    ```

=== "CJS"

    ```js
    const vm = require('node:vm');
    const contextifiedObject = vm.createContext({ secret: 42 });
    (async () => {
      const module = new vm.SourceTextModule(
        'Object.getPrototypeOf(import.meta.prop).secret = secret;',
        {
          initializeImportMeta(meta) {
            // Note: this object is created in the top context. As such,
            // Object.getPrototypeOf(import.meta.prop) points to the
            // Object.prototype in the top context rather than that in
            // the contextified object.
            meta.prop = {};
          },
        });
      // The module has an empty `moduleRequests` array.
      module.linkRequests([]);
      module.instantiate();
      await module.evaluate();
      // Now, Object.prototype.secret will be equal to 42.
      //
      // To fix this problem, replace
      //     meta.prop = {};
      // above with
      //     meta.prop = vm.runInContext('{}', contextifiedObject);
    })();
    ```

### `sourceTextModule.createCachedData()`

<!-- YAML
added:
 - v13.7.0
 - v12.17.0
-->

* Возвращает: [`<Buffer>`](buffer.md#buffer)

Создаёт кэш кода для опции `cachedData` конструктора `SourceTextModule`.
Возвращает `Buffer`. Метод можно вызывать любое число раз до вычисления модуля.

Кэш кода `SourceTextModule` не содержит наблюдаемых из JavaScript состояний. Его можно сохранять рядом с исходным текстом и
многократно использовать для создания новых экземпляров `SourceTextModule`.

Функции в исходнике `SourceTextModule` могут быть помечены как лениво компилируемые и не
компилируются при создании `SourceTextModule`. Они скомпилируются при первом вызове.
Кэш кода сериализует метаданные, которые V8 уже знает о
`SourceTextModule`, чтобы ускорить дальнейшие компиляции.

```js
// Create an initial module
const module = new vm.SourceTextModule('const a = 1;');

// Create cached data from this module
const cachedData = module.createCachedData();

// Create a new module using the cached data. The code must be the same.
const module2 = new vm.SourceTextModule('const a = 1;', { cachedData });
```

### `sourceTextModule.dependencySpecifiers`

<!-- YAML
changes:
  - version:
    - v24.4.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/20300
    description: This is deprecated in favour of `sourceTextModule.moduleRequests`.
-->

!!!warning "Стабильность: 0 - Устарело"

    Вместо этого используйте [`sourceTextModule.moduleRequests`](#sourcetextmodulemodulerequests).

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Спецификаторы всех зависимостей этого модуля. Возвращаемый массив заморожен,
изменять его нельзя.

Соответствует полю `[[RequestedModules]]` у [Cyclic Module Record][Cyclic Module Record] в
спецификации ECMAScript.

### `sourceTextModule.hasAsyncGraph()`

<!-- YAML
added: v24.9.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Обходит граф зависимостей и возвращает `true`, если в зависимостях или в самом модуле
есть выражения top-level `await`,
иначе возвращает `false`.

Поиск может быть медленным при достаточно большом графе.

Требуется предварительно инстанцировать модуль. Если модуль ещё не
инстанцирован, будет выброшена ошибка.

### `sourceTextModule.hasTopLevelAwait()`

<!-- YAML
added: v24.9.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, содержит ли сам модуль выражения top-level `await`.

Соответствует полю `[[HasTLA]]` у [Cyclic Module Record][Cyclic Module Record] в
спецификации ECMAScript.

### `sourceTextModule.instantiate()`

<!-- YAML
added:
 - v24.8.0
 - v22.21.0
-->

* Возвращает: [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)

Инстанцирует модуль со связанными запрошенными модулями.

Разрешает импортированные привязки модуля, в том числе при реэкспорте имён.
Если какие-то привязки разрешить нельзя,
ошибка выбрасывается синхронно.

Если среди запрошенных модулей есть циклические зависимости, метод
[`sourceTextModule.linkRequests(modules)`](#sourcetextmodulelinkrequestsmodules) нужно вызвать для всех
модулей в цикле до вызова этого метода.

### `sourceTextModule.linkRequests(modules)`

<!-- YAML
added:
 - v24.8.0
 - v22.21.0
-->

* `modules` [`<vm.Module[]>`](vm.md) Массив объектов `vm.Module`, от которых зависит этот модуль.
  Порядок модулей в массиве совпадает с порядком
  [`sourceTextModule.moduleRequests`](#sourcetextmodulemodulerequests).
* Возвращает: [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined)

Связывает зависимости модуля. Метод нужно вызвать до вычисления, не более
одного раза на модуль.

Порядок экземпляров в массиве `modules` должен соответствовать порядку разрешения
[`sourceTextModule.moduleRequests`](#sourcetextmodulemodulerequests). Если два запроса модуля имеют одинаковый
спецификатор и атрибуты импорта, они должны разрешаться в один и тот же экземпляр модуля, иначе будет выброшен
`ERR_MODULE_LINK_MISMATCH`. Например, при связывании запросов для этого
модуля:

<!-- eslint-disable no-duplicate-imports -->

=== "MJS"

    ```js
    import foo from 'foo';
    import source Foo from 'foo';
    ```

<!-- eslint-enable no-duplicate-imports -->

Массив `modules` должен содержать две ссылки на один и тот же экземпляр, потому что оба
запроса модуля совпадают, но в двух фазах.

Если у модуля нет зависимостей, массив `modules` может быть пустым.

`sourceTextModule.moduleRequests` можно использовать для реализации определяемой хостом абстрактной операции
[HostLoadImportedModule][HostLoadImportedModule] в спецификации ECMAScript,
а `sourceTextModule.linkRequests()` — чтобы вызвать определённую в спецификации
[FinishLoadingImportedModule][FinishLoadingImportedModule] для модуля со всеми зависимостями одним пакетом.

Синхронность или асинхронность разрешения зависимостей определяет создатель `SourceTextModule`.

После связывания каждого модуля из массива `modules` вызовите
[`sourceTextModule.instantiate()`](#sourcetextmoduleinstantiate).

### `sourceTextModule.moduleRequests`

<!-- YAML
added:
  - v24.4.0
  - v22.20.0
-->

* Тип: [`<ModuleRequest[]>`](vm.md) Зависимости этого модуля.

Запрошенные импортные зависимости этого модуля. Возвращаемый массив заморожен,
изменять его нельзя.

Например, для исходного текста:

<!-- eslint-disable no-duplicate-imports -->

=== "MJS"

    ```js
    import foo from 'foo';
    import fooAlias from 'foo';
    import bar from './bar.js';
    import withAttrs from '../with-attrs.ts' with { arbitraryAttr: 'attr-val' };
    import source Module from 'wasm-mod.wasm';
    ```

<!-- eslint-enable no-duplicate-imports -->

значение `sourceTextModule.moduleRequests` будет таким:

```js
[
  {
    specifier: 'foo',
    attributes: {},
    phase: 'evaluation',
  },
  {
    specifier: 'foo',
    attributes: {},
    phase: 'evaluation',
  },
  {
    specifier: './bar.js',
    attributes: {},
    phase: 'evaluation',
  },
  {
    specifier: '../with-attrs.ts',
    attributes: { arbitraryAttr: 'attr-val' },
    phase: 'evaluation',
  },
  {
    specifier: 'wasm-mod.wasm',
    attributes: {},
    phase: 'source',
  },
];
```

## Класс: `vm.SyntheticModule`

<!-- YAML
added:
 - v13.0.0
 - v12.16.0
-->

!!!warning "Стабильность: 1 - Экспериментальная"

Эта возможность доступна только при включённом флаге командной строки
`--experimental-vm-modules`.

* Наследует: [`<vm.Module>`](vm.md)

Класс `vm.SyntheticModule` реализует [Synthetic Module Record][Synthetic Module Record], как
определено в спецификации WebIDL. Синтетические модули дают
универсальный интерфейс для подключения к графам модулей ECMAScript источников, не являющихся JavaScript.

=== "MJS"

    ```js
    import { SyntheticModule } from 'node:vm';
    
    const source = '{ "a": 1 }';
    const syntheticModule = new SyntheticModule(['default'], function() {
      const obj = JSON.parse(source);
      this.setExport('default', obj);
    });
    
    // Use `syntheticModule` in linking
    (async () => {
      await syntheticModule.link(() => {});
      await syntheticModule.evaluate();
    
      console.log('Default export:', syntheticModule.namespace.default);
    })();
    ```

=== "CJS"

    ```js
    const { SyntheticModule } = require('node:vm');
    
    const source = '{ "a": 1 }';
    const syntheticModule = new SyntheticModule(['default'], function() {
      const obj = JSON.parse(source);
      this.setExport('default', obj);
    });
    
    // Use `syntheticModule` in linking
    (async () => {
      await syntheticModule.link(() => {});
      await syntheticModule.evaluate();
    
      console.log('Default export:', syntheticModule.namespace.default);
    })();
    ```

### `new vm.SyntheticModule(exportNames, evaluateCallback[, options])`

<!-- YAML
added:
 - v13.0.0
 - v12.16.0
-->

* `exportNames` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив имён, которые будут экспортироваться из
  модуля.
* `evaluateCallback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при вычислении модуля.
* `options`
  * `identifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка для трассировок стека.
    **По умолчанию:** `'vm:module(i)'`, где `i` — возрастающий индекс,
    зависящий от контекста.
  * `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Контекстифицированный][contextified] объект, возвращённый
    `vm.createContext()`, в котором компилируется и вычисляется этот `Module`.

Создаёт новый экземпляр `SyntheticModule`.

Объекты, присваиваемые экспортам этого экземпляра, могут позволить импортёрам
модуля обращаться к данным вне указанного `context`. Используйте
`vm.runInContext()`, чтобы создавать объекты в нужном контексте.

### `syntheticModule.setExport(name, value)`

<!-- YAML
added:
 - v13.0.0
 - v12.16.0
changes:
  - version:
     - v24.8.0
     - v22.21.0
    pr-url: https://github.com/nodejs/node/pull/59000
    description: No longer need to call `syntheticModule.link()` before
                 calling this method.
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя устанавливаемого экспорта.
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение для экспорта.

Метод задаёт ячейки привязок экспорта модуля указанным значением.

=== "MJS"

    ```js
    import vm from 'node:vm';
    
    const m = new vm.SyntheticModule(['x'], () => {
      m.setExport('x', 1);
    });
    
    await m.evaluate();
    
    assert.strictEqual(m.namespace.x, 1);
    ```

=== "CJS"

    ```js
    const vm = require('node:vm');
    (async () => {
      const m = new vm.SyntheticModule(['x'], () => {
        m.setExport('x', 1);
      });
      await m.evaluate();
      assert.strictEqual(m.namespace.x, 1);
    })();
    ```

## Тип: `ModuleRequest`

<!-- YAML
added:
  - v24.4.0
  - v22.20.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Спецификатор запрошенного модуля.
  * `attributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Значение `"with"`, переданное в
    [WithClause][WithClause] в [ImportDeclaration][ImportDeclaration], или пустой объект, если значение не
    задано.
  * `phase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Фаза запрошенного модуля (`"source"` или `"evaluation"`).

`ModuleRequest` описывает запрос на импорт модуля с заданными атрибутами импорта и фазой.

## `vm.compileFunction(code[, params[, options]])`

<!-- YAML
added: v10.10.0
changes:
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51244
    description: Added support for
                `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`.
  - version:
    - v19.6.0
    - v18.15.0
    pr-url: https://github.com/nodejs/node/pull/46320
    description: The return value now includes `cachedDataRejected`
                 with the same semantics as the `vm.Script` version
                 if the `cachedData` option was passed.
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/40249
    description: Added support for import attributes to the
                 `importModuleDynamically` parameter.
  - version: v15.9.0
    pr-url: https://github.com/nodejs/node/pull/35431
    description: Added `importModuleDynamically` option again.
  - version: v14.3.0
    pr-url: https://github.com/nodejs/node/pull/33364
    description: Removal of `importModuleDynamically` due to compatibility
                 issues.
  - version:
    - v14.1.0
    - v13.14.0
    pr-url: https://github.com/nodejs/node/pull/32985
    description: The `importModuleDynamically` option is now supported.
-->

Добавлено в: v10.10.0

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тело компилируемой функции.
* `params` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив строк — имён всех параметров
  функции.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла в трассировках стека для этого
    сценария. **По умолчанию:** `''`.
  * `lineOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки в трассировках стека. **По умолчанию:** `0`.
  * `columnOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера колонки первой строки в трассировках стека. **По умолчанию:** `0`.
  * `cachedData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательный `Buffer`,
    `TypedArray` или `DataView` с данными кэша кода V8 для переданного
    исходника. Должен быть получен предыдущим вызовом [`vm.compileFunction()`](#vmcompilefunctioncode-params-options)
    с теми же `code` и `params`.
  * `produceCachedData` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Создавать ли новые данные кэша.
    **По умолчанию:** `false`.
  * `parsingContext` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Контекстифицированный][contextified] объект, в котором должна
    компилироваться эта функция.
  * `contextExtensions` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Массив расширений контекста
    (объектов, оборачивающих текущую область видимости), применяемых при
    компиляции. **По умолчанию:** `[]`.
  * `importModuleDynamically`
    [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    Задаёт, как загружать модули при вычислении этой функции при вызове `import()`. Опция относится к
    экспериментальному API модулей. В production не рекомендуется. Подробнее см.
    [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Компилирует переданный код в указанном контексте (если контекст не задан,
используется текущий) и возвращает функцию с заданными `params`.

## `vm.constants`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект с наиболее используемыми константами для операций VM.

### `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

!!!warning "Стабильность: 1.1 - Активная разработка"

Константа для опции `importModuleDynamically` у
`vm.Script` и `vm.compileFunction()`: Node.js использует стандартный
загрузчик ESM из основного контекста для загрузки запрошенного модуля.

Подробнее см.
[Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).

## `vm.createContext([contextObject[, options]])`

<!-- YAML
added: v0.3.1
changes:
  - version:
    - v22.8.0
    - v20.18.0
    pr-url: https://github.com/nodejs/node/pull/54394
    description: The `contextObject` argument now accepts `vm.constants.DONT_CONTEXTIFY`.
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51244
    description: Added support for
                 `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`.
  - version:
    - v21.2.0
    - v20.11.0
    pr-url: https://github.com/nodejs/node/pull/50360
    description: The `importModuleDynamically` option is supported now.
  - version: v14.6.0
    pr-url: https://github.com/nodejs/node/pull/34023
    description: The `microtaskMode` option is supported now.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19398
    description: The first argument can no longer be a function.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19016
    description: The `codeGeneration` option is supported now.
-->

Добавлено в: v0.3.1

* `contextObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<vm.constants.DONT_CONTEXTIFY>`](#vmconstantsdont_contextify) | undefined
  Либо [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify), либо объект, который будет [контекстифицирован][contextified].
  Если `undefined`, для обратной совместимости создаётся пустой контекстифицированный объект.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Читаемое имя создаваемого контекста.
    **По умолчанию:** `'VM Context i'`, где `i` — возрастающий числовой индекс
    созданного контекста.
  * `origin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Origin][origin] нового контекста для отображения.
    Формат как у URL, но только схема, хост и при необходимости порт, как у
    свойства [`url.origin`](url.md#urlorigin) у [`URL`](url.md#class-url). Завершающий слэш не указывайте — он означает путь.
    **По умолчанию:** `''`.
  * `codeGeneration` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `strings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `false` вызовы `eval` и конструкторов функций
      (`Function`, `GeneratorFunction` и т.д.) выбрасывают
      `EvalError`. **По умолчанию:** `true`.
    * `wasm` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `false` попытка скомпилировать модуль WebAssembly
      выбрасывает `WebAssembly.CompileError`. **По умолчанию:** `true`.
  * `microtaskMode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При `afterEvaluate` микрозадачи (через `Promise` и `async function`)
    выполняются сразу после сценария в [`script.runInContext()`](#scriptrunincontextcontextifiedobject-options).
    В этом случае они входят в действие опций `timeout` и `breakOnSigint`.
  * `importModuleDynamically`
    [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    Задаёт, как загружать модули при вызове `import()` в этом контексте без сценария-реферера или модуля. Опция относится к
    экспериментальному API модулей. В production не рекомендуется. Подробнее см.
    [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) контекстифицированный объект.

Если передан объект `contextObject`, метод `vm.createContext()` [подготавливает этот
объект][contextified] и возвращает ссылку для использования в
вызовах [`vm.runInContext()`](#vmrunincontextcode-contextifiedobject-options) или [`script.runInContext()`](#scriptrunincontextcontextifiedobject-options). В таких
сценариях глобальный объект оборачивается `contextObject`, сохраняя все
имеющиеся свойства и добавляя встроенные объекты и функции, как у обычного [глобального объекта][global object]. Вне сценариев, запускаемых модулем `vm`, глобальные
переменные среды выполнения не меняются.

=== "MJS"

    ```js
    import { createContext, runInContext } from 'node:vm';
    
    global.globalVar = 3;
    
    const context = { globalVar: 1 };
    createContext(context);
    
    runInContext('globalVar *= 2;', context);
    
    console.log(context);
    // Prints: { globalVar: 2 }
    
    console.log(global.globalVar);
    // Prints: 3
    ```

=== "CJS"

    ```js
    const { createContext, runInContext } = require('node:vm');
    
    global.globalVar = 3;
    
    const context = { globalVar: 1 };
    createContext(context);
    
    runInContext('globalVar *= 2;', context);
    
    console.log(context);
    // Prints: { globalVar: 2 }
    
    console.log(global.globalVar);
    // Prints: 3
    ```

Если `contextObject` опущен (или явно передан как `undefined`), возвращается новый
пустой [контекстифицированный][contextified] объект.

Когда глобальный объект в новом контекте [контекстифицирован][contextified], у него есть особенности по сравнению с обычными глобальными объектами: например, его нельзя заморозить. Чтобы создать контекст
без этих особенностей, передайте [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify) в качестве аргумента
`contextObject`. Подробнее — в описании [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify).

Метод `vm.createContext()` удобен для создания одного
контекста, в котором выполняется несколько сценариев. Например, при эмуляции
браузера можно создать один контекст глобального объекта окна и выполнять в нём все теги `<script>`.

Заданные `name` и `origin` контекста видны через API инспектора.

## `vm.isContext(object)`

<!-- YAML
added: v0.11.7
-->

* `object` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если переданный `object` был [контекстифицирован][contextified] через
[`vm.createContext()`](#vmcreatecontextcontextobject-options), или если это глобальный объект контекста, созданного
с [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify).

## `vm.measureMemory([options])`

<!-- YAML
added: v13.10.0
-->

!!!warning "Стабильность: 1 - Экспериментальная"

Измеряет память, известную V8 и используемую всеми контекстами текущего
изолята V8, либо основным контекстом.

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательно.
  * `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'summary'` или `'detailed'`. В режиме summary
    возвращается только память основного контекста. В режиме
    detailed — память для всех контекстов, известных текущему
    изоляту V8.
    **По умолчанию:** `'summary'`
  * `execution` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'default'` или `'eager'`. При значении по умолчанию
    промис не разрешится, пока не начнётся следующая запланированная
    сборка мусора (это может занять время или не произойти, если процесс
    завершится раньше). При `eager` сборка мусора запускается
    сразу для измерения памяти.
    **По умолчанию:** `'default'`
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успешном измерении промис разрешается
  объектом с информацией об использовании памяти.
  Иначе отклоняется с ошибкой `ERR_CONTEXT_NOT_INITIALIZED`.

Формат объекта, с которым может разрешиться промис,
зависит от движка V8 и может меняться между версиями V8.

Результат отличается от статистики `v8.getHeapSpaceStatistics()`: `vm.measureMemory()` измеряет
память, достижимую из каждого контекста V8 в текущем экземпляре
движка, тогда как `v8.getHeapSpaceStatistics()` измеряет
память, занятую каждым пространством кучи в текущем экземпляре V8.

=== "MJS"

    ```js
    import { createContext, measureMemory } from 'node:vm';
    // Measure the memory used by the main context.
    measureMemory({ mode: 'summary' })
      // This is the same as vm.measureMemory()
      .then((result) => {
        // The current format is:
        // {
        //   total: { jsMemoryEstimate: 1601828, jsMemoryRange: [1601828, 5275288] },
        //   WebAssembly: { code: 0, metadata: 33962 },
        // }
        console.log(result);
      });
    
    const context = createContext({ a: 1 });
    measureMemory({ mode: 'detailed', execution: 'eager' }).then((result) => {
      // Reference the context here so that it won't be GC'ed
      // until the measurement is complete.
      console.log('Context:', context.a);
      // {
      //   total: { jsMemoryEstimate: 1767100, jsMemoryRange: [1767100, 5440560] },
      //   WebAssembly: { code: 0, metadata: 33962 },
      //   current: { jsMemoryEstimate: 1601828, jsMemoryRange: [1601828, 5275288] },
      //   other: [{ jsMemoryEstimate: 165272, jsMemoryRange: [Array] }],
      // }
      console.log(result);
    });
    ```

=== "CJS"

    ```js
    const { createContext, measureMemory } = require('node:vm');
    // Measure the memory used by the main context.
    measureMemory({ mode: 'summary' })
      // This is the same as vm.measureMemory()
      .then((result) => {
        // The current format is:
        // {
        //   total: { jsMemoryEstimate: 1601828, jsMemoryRange: [1601828, 5275288] },
        //   WebAssembly: { code: 0, metadata: 33962 },
        // }
        console.log(result);
      });
    
    const context = createContext({ a: 1 });
    measureMemory({ mode: 'detailed', execution: 'eager' }).then((result) => {
      // Reference the context here so that it won't be GC'ed
      // until the measurement is complete.
      console.log('Context:', context.a);
      // {
      //   total: { jsMemoryEstimate: 1767100, jsMemoryRange: [1767100, 5440560] },
      //   WebAssembly: { code: 0, metadata: 33962 },
      //   current: { jsMemoryEstimate: 1601828, jsMemoryRange: [1601828, 5275288] },
      //   other: [{ jsMemoryEstimate: 165272, jsMemoryRange: [Array] }],
      // }
      console.log(result);
    });
    ```

## `vm.runInContext(code, contextifiedObject[, options])`

<!-- YAML
added: v0.3.1
changes:
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51244
    description: Added support for
                `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`.
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/40249
    description: Added support for import attributes to the
                 `importModuleDynamically` parameter.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: The `breakOnSigint` option is supported now.
-->

Добавлено в: v0.3.1

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код JavaScript для компиляции и выполнения.
* `contextifiedObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Контекстифицированный][contextified] объект, который будет
    использоваться как `global` при компиляции и выполнении `code`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла в трассировках стека для этого
    сценария. **По умолчанию:** `'evalmachine.<anonymous>'`.
  * `lineOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки в трассировках стека. **По умолчанию:** `0`.
  * `columnOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера колонки первой строки в трассировках стека. **По умолчанию:** `0`.
  * `displayErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true`, если при компиляции `code` возникает [`Error`](errors.md#class-error),
    строка с ошибочным кодом добавляется к трассировке стека. **По умолчанию:** `true`.
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт число миллисекунд выполнения `code`
    до принудительного завершения. Если выполнение будет остановлено, будет выброшен [`Error`](errors.md#class-error).
    Это значение должно быть строго положительным целым числом.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Уже подключённые обработчики через
    `process.on('SIGINT')` на время выполнения сценария отключаются, затем снова
    работают. **По умолчанию:** `false`.
  * `cachedData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательный `Buffer`,
    `TypedArray` или `DataView` с данными кэша кода V8 для переданного
    исходника.
  * `importModuleDynamically`
    [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    Задаёт, как загружать модули при вычислении этого сценария при вызове `import()`. Опция относится к
    экспериментальному API модулей. В production не рекомендуется. Подробнее см.
    [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).

Метод `vm.runInContext()` компилирует `code`, выполняет его в контексте
`contextifiedObject` и возвращает результат. У выполняемого кода нет доступа
к локальной области видимости. Объект `contextifiedObject` _должен_ быть заранее
[контекстифицирован][contextified] через [`vm.createContext()`](#vmcreatecontextcontextobject-options).

Если `options` — строка, она задаёт имя файла.

В следующем примере компилируются и выполняются разные сценарии в одном
[контекстифицированном][contextified] объекте:

=== "MJS"

    ```js
    import { createContext, runInContext } from 'node:vm';
    
    const contextObject = { globalVar: 1 };
    createContext(contextObject);
    
    for (let i = 0; i < 10; ++i) {
      runInContext('globalVar *= 2;', contextObject);
    }
    console.log(contextObject);
    // Prints: { globalVar: 1024 }
    ```

=== "CJS"

    ```js
    const { createContext, runInContext } = require('node:vm');
    
    const contextObject = { globalVar: 1 };
    createContext(contextObject);
    
    for (let i = 0; i < 10; ++i) {
      runInContext('globalVar *= 2;', contextObject);
    }
    console.log(contextObject);
    // Prints: { globalVar: 1024 }
    ```

## `vm.runInNewContext(code[, contextObject[, options]])`

<!-- YAML
added: v0.3.1
changes:
  - version:
    - v22.8.0
    - v20.18.0
    pr-url: https://github.com/nodejs/node/pull/54394
    description: The `contextObject` argument now accepts `vm.constants.DONT_CONTEXTIFY`.
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51244
    description: Added support for
                `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`.
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/40249
    description: Added support for import attributes to the
                 `importModuleDynamically` parameter.
  - version: v14.6.0
    pr-url: https://github.com/nodejs/node/pull/34023
    description: The `microtaskMode` option is supported now.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19016
    description: The `contextCodeGeneration` option is supported now.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: The `breakOnSigint` option is supported now.
-->

Добавлено в: v0.3.1

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код JavaScript для компиляции и выполнения.
* `contextObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<vm.constants.DONT_CONTEXTIFY>`](#vmconstantsdont_contextify) | undefined
  Либо [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify), либо объект, который будет [контекстифицирован][contextified].
  Если `undefined`, для обратной совместимости создаётся пустой контекстифицированный объект.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла в трассировках стека для этого
    сценария. **По умолчанию:** `'evalmachine.<anonymous>'`.
  * `lineOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки в трассировках стека. **По умолчанию:** `0`.
  * `columnOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера колонки первой строки в трассировках стека. **По умолчанию:** `0`.
  * `displayErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true`, если при компиляции `code` возникает [`Error`](errors.md#class-error),
    строка с ошибочным кодом добавляется к трассировке стека. **По умолчанию:** `true`.
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт число миллисекунд выполнения `code`
    до принудительного завершения. Если выполнение будет остановлено, будет выброшен [`Error`](errors.md#class-error).
    Это значение должно быть строго положительным целым числом.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Уже подключённые обработчики через
    `process.on('SIGINT')` на время выполнения сценария отключаются, затем снова
    работают. **По умолчанию:** `false`.
  * `contextName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Читаемое имя создаваемого контекста.
    **По умолчанию:** `'VM Context i'`, где `i` — возрастающий числовой индекс
    созданного контекста.
  * `contextOrigin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) [Origin][origin] нового контекста для отображения.
    Формат как у URL, но только схема, хост и при необходимости порт, как
    у [`url.origin`](url.md#urlorigin) у [`URL`](url.md#class-url). Завершающий слэш не указывайте — он означает путь.
    **По умолчанию:** `''`.
  * `contextCodeGeneration` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `strings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `false` вызовы `eval` и конструкторов функций
      (`Function`, `GeneratorFunction` и т.д.) выбрасывают
      `EvalError`. **По умолчанию:** `true`.
    * `wasm` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `false` попытка скомпилировать модуль WebAssembly
      выбрасывает `WebAssembly.CompileError`. **По умолчанию:** `true`.
  * `cachedData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательный `Buffer`,
    `TypedArray` или `DataView` с данными кэша кода V8 для переданного
    исходника.
  * `importModuleDynamically`
    [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    Задаёт, как загружать модули при вычислении этого сценария при вызове `import()`. Опция относится к
    экспериментальному API модулей. В production не рекомендуется. Подробнее см.
    [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).
  * `microtaskMode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При `afterEvaluate` микрозадачи (через `Promise` и `async function`)
    выполняются сразу после сценария. В этом случае они входят в действие опций `timeout` и
    `breakOnSigint`.
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат последнего выполненного в сценарии оператора.

Сокращение для
`(new vm.Script(code, options)).runInContext(vm.createContext(options), options)`.
Если `options` — строка, она задаёт имя файла.

Метод делает следующее:

1. Создаёт новый контекст.
2. Если `contextObject` — объект, [контекстифицирует][contextified] его в новом контексте.
   Если `contextObject` — `undefined`, создаётся новый объект и [контекстифицируется][contextified].
   Если `contextObject` — [`vm.constants.DONT_CONTEXTIFY`](#vmconstantsdont_contextify), ничего не [контекстифицировать][contextified].
3. Компилирует код как `vm.Script`.
4. Выполняет скомпилированный код в созданном контексте. Код не видит область видимости,
   из которой вызван метод.
5. Возвращает результат.

В следующем примере компилируется и выполняется код, увеличивающий глобальную
переменную и задающий новую. Эти глобальные переменные лежат в `contextObject`.

=== "MJS"

    ```js
    import { runInNewContext, constants } from 'node:vm';
    
    const contextObject = {
      animal: 'cat',
      count: 2,
    };
    
    runInNewContext('count += 1; name = "kitty"', contextObject);
    console.log(contextObject);
    // Prints: { animal: 'cat', count: 3, name: 'kitty' }
    
    // This would throw if the context is created from a contextified object.
    // vm.constants.DONT_CONTEXTIFY allows creating contexts with ordinary global objects that
    // can be frozen.
    const frozenContext = runInNewContext(
      'Object.freeze(globalThis); globalThis;',
      constants.DONT_CONTEXTIFY,
    );
    ```

=== "CJS"

    ```js
    const { runInNewContext, constants } = require('node:vm');
    
    const contextObject = {
      animal: 'cat',
      count: 2,
    };
    
    runInNewContext('count += 1; name = "kitty"', contextObject);
    console.log(contextObject);
    // Prints: { animal: 'cat', count: 3, name: 'kitty' }
    
    // This would throw if the context is created from a contextified object.
    // vm.constants.DONT_CONTEXTIFY allows creating contexts with ordinary global objects that
    // can be frozen.
    const frozenContext = runInNewContext(
      'Object.freeze(globalThis); globalThis;',
      constants.DONT_CONTEXTIFY,
    );
    ```

## `vm.runInThisContext(code[, options])`

<!-- YAML
added: v0.3.1
changes:
  - version:
    - v21.7.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/51244
    description: Added support for
                `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`.
  - version:
    - v17.0.0
    - v16.12.0
    pr-url: https://github.com/nodejs/node/pull/40249
    description: Added support for import attributes to the
                 `importModuleDynamically` parameter.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6635
    description: The `breakOnSigint` option is supported now.
-->

Добавлено в: v0.3.1

* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код JavaScript для компиляции и выполнения.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла в трассировках стека для этого
    сценария. **По умолчанию:** `'evalmachine.<anonymous>'`.
  * `lineOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера строки в трассировках стека. **По умолчанию:** `0`.
  * `columnOffset` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение номера колонки первой строки в трассировках стека. **По умолчанию:** `0`.
  * `displayErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true`, если при компиляции `code` возникает [`Error`](errors.md#class-error),
    строка с ошибочным кодом добавляется к трассировке стека. **По умолчанию:** `true`.
  * `timeout` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задаёт число миллисекунд выполнения `code`
    до принудительного завершения. Если выполнение будет остановлено, будет выброшен [`Error`](errors.md#class-error).
    Это значение должно быть строго положительным целым числом.
  * `breakOnSigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` сигнал `SIGINT`
    (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прерывает выполнение и выбрасывает
    [`Error`](errors.md#class-error). Уже подключённые обработчики через
    `process.on('SIGINT')` на время выполнения сценария отключаются, затем снова
    работают. **По умолчанию:** `false`.
  * `cachedData` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Необязательный `Buffer`,
    `TypedArray` или `DataView` с данными кэша кода V8 для переданного
    исходника.
  * `importModuleDynamically`
    [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
    Задаёт, как загружать модули при вычислении этого сценария при вызове `import()`. Опция относится к
    экспериментальному API модулей. В production не рекомендуется. Подробнее см.
    [Поддержка динамического `import()` в API компиляции](#support-of-dynamic-import-in-compilation-apis).
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат последнего выполненного в сценарии оператора.

`vm.runInThisContext()` компилирует `code`, выполняет его в контексте текущего
`global` и возвращает результат. У выполняемого кода нет доступа к локальной
области видимости, но есть к текущему объекту `global`.

Если `options` — строка, она задаёт имя файла.

Следующий пример показывает использование и `vm.runInThisContext()`, и
встроенной [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) для одного и того же кода:

<!-- eslint-disable prefer-const -->

=== "MJS"

    ```js
    import { runInThisContext } from 'node:vm';
    let localVar = 'initial value';
    
    const vmResult = runInThisContext('localVar = "vm";');
    console.log(`vmResult: '${vmResult}', localVar: '${localVar}'`);
    // Prints: vmResult: 'vm', localVar: 'initial value'
    
    const evalResult = eval('localVar = "eval";');
    console.log(`evalResult: '${evalResult}', localVar: '${localVar}'`);
    // Prints: evalResult: 'eval', localVar: 'eval'
    ```

<!-- eslint-disable prefer-const -->

=== "CJS"

    ```js
    const { runInThisContext } = require('node:vm');
    let localVar = 'initial value';
    
    const vmResult = runInThisContext('localVar = "vm";');
    console.log(`vmResult: '${vmResult}', localVar: '${localVar}'`);
    // Prints: vmResult: 'vm', localVar: 'initial value'
    
    const evalResult = eval('localVar = "eval";');
    console.log(`evalResult: '${evalResult}', localVar: '${localVar}'`);
    // Prints: evalResult: 'eval', localVar: 'eval'
    ```

Так как у `vm.runInThisContext()` нет доступа к локальной области видимости,
`localVar` не меняется. Прямой вызов `eval()`, наоборот, _имеет_ доступ
к локальной области, поэтому `localVar` меняется. В этом смысле
`vm.runInThisContext()` близок к [косвенному вызову `eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval), например
`(0,eval)('code')`.

## Пример: HTTP-сервер внутри VM

Используя [`script.runInThisContext()`](#scriptruninthiscontextoptions) или
[`vm.runInThisContext()`](#vmruninthiscontextcode-options), код выполняется в текущем глобальном контексте V8. Переданный в VM код имеет свою изолированную область видимости.

Чтобы запустить простой веб-сервер на модуле `node:http`, переданный в контекст код должен сам вызвать `require('node:http')` или получить
ссылку на `node:http` снаружи. Например:

=== "MJS"

    ```js
    import { runInThisContext } from 'node:vm';
    import { createRequire } from 'node:module';
    
    const require = createRequire(import.meta.url);
    
    const code = `
    ((require) => {
      const { createServer } = require('node:http');
    
      createServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Hello World\\n');
      }).listen(8124);
    
      console.log('Server running at http://127.0.0.1:8124/');
    })`;
    
    runInThisContext(code)(require);
    ```

=== "CJS"

    ```js
    const { runInThisContext } = require('node:vm');
    
    const code = `
    ((require) => {
      const { createServer } = require('node:http');
    
      createServer((request, response) => {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Hello World\\n');
      }).listen(8124);
    
      console.log('Server running at http://127.0.0.1:8124/');
    })`;
    
    runInThisContext(code)(require);
    ```

`require()` в этом примере разделяет состояние с контекстом, из которого он
передан. Это может быть рискованно при выполнении недоверенного кода, например
при нежелательном изменении объектов в контексте.

## Что значит «контекстифицировать» объект? {#what-does-it-mean-to-contextify-an-object}

Весь JavaScript в Node.js выполняется в области «контекста».
Согласно [V8 Embedder's Guide][V8 Embedder's Guide]:

> В V8 контекст — это среда выполнения, в которой отдельные независимые
> приложения на JavaScript могут работать в одном экземпляре V8. Нужно явно
> указать контекст, в котором должен выполняться код на JavaScript.

При вызове `vm.createContext()` с объектом аргумент `contextObject`
используется для обёртки глобального объекта нового экземпляра V8 Context
(если `contextObject` — `undefined`, перед контекстификацией из текущего контекста
создаётся новый объект). Этот V8 Context даёт коду, выполняемому через методы модуля `node:vm`,
изолированную глобальную среду.
Создание V8 Context и связывание его с `contextObject`
во внешнем контексте в этом документе называется «контекстификацией» объекта.

Контекстификация вносит особенности в значение `globalThis` в контексте:
например, его нельзя заморозить, и оно не совпадает по ссылке с `contextObject`
во внешнем контексте.

=== "MJS"

    ```js
    import { createContext, runInContext } from 'node:vm';
    
    // An undefined `contextObject` option makes the global object contextified.
    const context = createContext();
    console.log(runInContext('globalThis', context) === context);  // false
    // A contextified global object cannot be frozen.
    try {
      runInContext('Object.freeze(globalThis);', context);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`); // TypeError: Cannot freeze
    }
    console.log(runInContext('globalThis.foo = 1; foo;', context));  // 1
    ```

=== "CJS"

    ```js
    const { createContext, runInContext } = require('node:vm');
    
    // An undefined `contextObject` option makes the global object contextified.
    const context = createContext();
    console.log(runInContext('globalThis', context) === context);  // false
    // A contextified global object cannot be frozen.
    try {
      runInContext('Object.freeze(globalThis);', context);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`); // TypeError: Cannot freeze
    }
    console.log(runInContext('globalThis.foo = 1; foo;', context));  // 1
    ```

Чтобы получить контекст с обычным глобальным объектом и прокси глобального объекта во
внешнем контексте с меньшим числом особенностей, укажите `vm.constants.DONT_CONTEXTIFY` как аргумент
`contextObject`.

### `vm.constants.DONT_CONTEXTIFY`

Эта константа в качестве аргумента `contextObject` в API `vm` указывает Node.js создать
контекст без оборачивания глобального объекта дополнительной обёрткой в специфичной для Node.js манере.
В результате `globalThis` в новом контексте ведёт себя ближе к обычному
глобальному объекту.

=== "MJS"

    ```js
    import { createContext, runInContext, constants } from 'node:vm';
    
    // Use vm.constants.DONT_CONTEXTIFY to freeze the global object.
    const context = createContext(constants.DONT_CONTEXTIFY);
    runInContext('Object.freeze(globalThis);', context);
    try {
      runInContext('bar = 1; bar;', context);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`); // ReferenceError: bar is not defined
    }
    ```

=== "CJS"

    ```js
    const { createContext, runInContext, constants } = require('node:vm');
    
    // Use vm.constants.DONT_CONTEXTIFY to freeze the global object.
    const context = createContext(constants.DONT_CONTEXTIFY);
    runInContext('Object.freeze(globalThis);', context);
    try {
      runInContext('bar = 1; bar;', context);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`); // ReferenceError: bar is not defined
    }
    ```

Если `vm.constants.DONT_CONTEXTIFY` передан в [`vm.createContext()`](#vmcreatecontextcontextobject-options) как `contextObject`,
возвращаемый объект похож на прокси к глобальному объекту нового контекста с
меньшим числом особенностей Node.js. Он совпадает по ссылке с `globalThis` в новом контексте,
его можно менять извне и через него обращаться к встроенным объектам нового контекста.

=== "MJS"

    ```js
    import { createContext, runInContext, constants } from 'node:vm';
    
    const context = createContext(constants.DONT_CONTEXTIFY);
    
    // Returned object is reference equal to globalThis in the new context.
    console.log(runInContext('globalThis', context) === context);  // true
    
    // Can be used to access globals in the new context directly.
    console.log(context.Array);  // [Function: Array]
    runInContext('foo = 1;', context);
    console.log(context.foo);  // 1
    context.bar = 1;
    console.log(runInContext('bar;', context));  // 1
    
    // Can be frozen and it affects the inner context.
    Object.freeze(context);
    try {
      runInContext('baz = 1; baz;', context);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`); // ReferenceError: baz is not defined
    }
    ```

=== "CJS"

    ```js
    const { createContext, runInContext, constants } = require('node:vm');
    
    const context = createContext(constants.DONT_CONTEXTIFY);
    
    // Returned object is reference equal to globalThis in the new context.
    console.log(runInContext('globalThis', context) === context);  // true
    
    // Can be used to access globals in the new context directly.
    console.log(context.Array);  // [Function: Array]
    runInContext('foo = 1;', context);
    console.log(context.foo);  // 1
    context.bar = 1;
    console.log(runInContext('bar;', context));  // 1
    
    // Can be frozen and it affects the inner context.
    Object.freeze(context);
    try {
      runInContext('baz = 1; baz;', context);
    } catch (e) {
      console.log(`${e.constructor.name}: ${e.message}`); // ReferenceError: baz is not defined
    }
    ```

## Взаимодействие таймаута с асинхронными задачами и Promise

`Promise` и `async function` могут планировать задачи, выполняемые движком JavaScript
асинхронно. По умолчанию эти задачи выполняются после того, как завершатся все функции
на текущем стеке.
Так можно «выйти» из действия опций `timeout` и
`breakOnSigint`.

Например, код ниже, выполняемый через `vm.runInNewContext()` с таймаутом
5 миллисекунд, планирует бесконечный цикл после разрешения промиса.
Запланированный цикл таймаутом не прерывается:

=== "MJS"

    ```js
    import { runInNewContext } from 'node:vm';
    
    function loop() {
      console.log('entering loop');
      while (1) console.log(Date.now());
    }
    
    runInNewContext(
      'Promise.resolve().then(() => loop());',
      { loop, console },
      { timeout: 5 },
    );
    // This is printed *before* 'entering infinite loop' (!)
    console.log('done executing');
    ```

=== "CJS"

    ```js
    const { runInNewContext } = require('node:vm');
    
    function loop() {
      console.log('entering loop');
      while (1) console.log(Date.now());
    }
    
    runInNewContext(
      'Promise.resolve().then(() => loop());',
      { loop, console },
      { timeout: 5 },
    );
    // This is printed *before* 'entering infinite loop' (!)
    console.log('done executing');
    ```

Это можно исправить, передав `microtaskMode: 'afterEvaluate'` при создании `Context`:

=== "MJS"

    ```js
    import { runInNewContext } from 'node:vm';
    
    function loop() {
      while (1) console.log(Date.now());
    }
    
    runInNewContext(
      'Promise.resolve().then(() => loop());',
      { loop, console },
      { timeout: 5, microtaskMode: 'afterEvaluate' },
    );
    ```

=== "CJS"

    ```js
    const { runInNewContext } = require('node:vm');
    
    function loop() {
      while (1) console.log(Date.now());
    }
    
    runInNewContext(
      'Promise.resolve().then(() => loop());',
      { loop, console },
      { timeout: 5, microtaskMode: 'afterEvaluate' },
    );
    ```

В этом случае микрозадача, запланированная через `promise.then()`, выполнится
до возврата из `vm.runInNewContext()` и может быть прервана
механизмом `timeout`. Это относится только к коду в
`vm.Context`, например [`vm.runInThisContext()`](#vmruninthiscontextcode-options) эту опцию не принимает.

Колбэки Promise попадают в очередь микрозадач того контекста, в котором
они были созданы. Если в примере выше заменить `() => loop()` на просто `loop`,
то `loop` попадёт в глобальную очередь микрозадач,
потому что это функция из внешнего (основного) контекста, и таймаут
её тоже не ограничит.

Если внутри `vm.Context` доступны `process.nextTick()`,
`queueMicrotask()`, `setTimeout()`, `setImmediate()` и т.п., переданные в них функции попадают в глобальные очереди,
общие для всех контекстов. Поэтому такие колбэки тоже нельзя надёжно ограничить таймаутом.

### Когда `microtaskMode` равен `'afterEvaluate'`: осторожно с общими Promise между контекстами

В режиме `'afterEvaluate'` у `Context` своя очередь микрозадач, отдельная
от глобальной очереди внешнего (основного) контекста. Этот режим нужен, чтобы действовал `timeout` и `breakOnSigint` при
асинхронных задачах, но он усложняет совместное использование промисов между контекстами.

В примере ниже промис создаётся во внутреннем контексте и передаётся во
внешний. Когда внешний контекст делает `await` по промису, порядок выполнения
ломается неожиданным образом: `console.log` не выполняется.

=== "MJS"

    ```js
    import { createContext, runInContext } from 'node:vm';
    
    const inner_context = createContext({}, { microtaskMode: 'afterEvaluate' });
    
    // runInContext() returns a Promise created in the inner context.
    const inner_promise = runInContext('Promise.resolve()', inner_context);
    
    // As part of performing `await`, the JavaScript runtime must enqueue a task
    // on the microtask queue of the context where `inner_promise` was created.
    // A task is added on the inner microtask queue, but **it will not be run
    // automatically**: this task will remain pending indefinitely.
    //
    // Since the outer microtask queue is empty, execution in the outer module
    // falls through, and the log statement below is never executed.
    await inner_promise;
    
    console.log('this will NOT be printed');
    ```

=== "CJS"

    ```js
    const { createContext, runInContext } = require('node:vm');
    
    // runInContext() returns a Promise created in the inner context.
    const inner_context = createContext({}, { microtaskMode: 'afterEvaluate' });
    
    (async () => {
      const inner_promise = runInContext('Promise.resolve()', inner_context);
    
      // As part of performing `await`, the JavaScript runtime must enqueue a task
      // on the microtask queue of the context where `inner_promise` was created.
      // A task is added on the inner microtask queue, but **it will not be run
      // automatically**: this task will remain pending indefinitely.
      //
      // Since the outer microtask queue is empty, execution in the outer module
      // falls through, and the log statement below is never executed.
      await inner_promise;
    
      console.log('this will NOT be printed');
    })();
    ```

Чтобы безопасно делить промисы между контекстами с разными очередями микрозадач,
нужно гарантировать, что задачи во внутренней очереди микрозадач будут выполняться
**всякий раз**, когда внешний контекст ставит задачу во внутреннюю очередь микрозадач.

Задачи в очереди микрозадач контекста выполняются при каждом вызове
`runInContext()` или `SourceTextModule.evaluate()` для сценария или
модуля в этом контексте. В нашем примере нормальный ход выполнения можно восстановить,
запланировав второй вызов `runInContext()` **до** `await
inner_promise`.

=== "MJS"

    ```js
    // Schedule `runInContext()` to manually drain the inner context microtask
    // queue; it will run after the `await` statement below.
    setImmediate(() => {
      vm.runInContext('', context);
    });
    
    await inner_promise;
    
    console.log('OK');
    ```

**Примечание:** строго говоря, в этом режиме `node:vm` расходится с буквой
спецификации ECMAScript по [постановке задач в очередь][enqueing jobs]: асинхронные
задачи из разных контекстов могут выполняться в ином порядке, чем они были
поставлены в очередь.

## Поддержка динамического `import()` в API компиляции {#support-of-dynamic-import-in-compilation-apis}

Следующие API поддерживают опцию `importModuleDynamically` для динамического
`import()` в коде, скомпилированном модулем `vm`.

* `new vm.Script`
* `vm.compileFunction()`
* `new vm.SourceTextModule`
* `vm.runInThisContext()`
* `vm.runInContext()`
* `vm.runInNewContext()`
* `vm.createContext()`

Опция по-прежнему относится к экспериментальному API модулей. В production не рекомендуется.

### Когда опция `importModuleDynamically` не задана или равна `undefined`

Если опция не указана или равна `undefined`, код с `import()` всё ещё можно скомпилировать через API `vm`, но при выполнении скомпилированного кода, когда
фактически вызывается `import()`, результат будет отклонён с
[`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing).

### Когда `importModuleDynamically` равен `vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`

Сейчас эта опция не поддерживается для `vm.SourceTextModule`.

При этой опции, когда в скомпилированном коде инициируется `import()`, Node.js
использует стандартный загрузчик ESM из основного контекста для загрузки запрошенного
модуля и возвращает его выполняемому коду.

Так компилируемый код получает доступ к встроенным модулям Node.js вроде `fs` или `http`.
Если код выполняется в другом контексте,
учтите, что объекты, созданные модулями, загруженными из основного контекста,
принадлежат основному контексту и не являются `instanceof` встроенных классов в
новом контексте.

=== "CJS"

    ```js
    const { Script, constants } = require('node:vm');
    const script = new Script(
      'import("node:fs").then(({readFile}) => readFile instanceof Function)',
      { importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER });
    
    // false: URL loaded from the main context is not an instance of the Function
    // class in the new context.
    script.runInNewContext().then(console.log);
    ```

=== "MJS"

    ```js
    import { Script, constants } from 'node:vm';
    
    const script = new Script(
      'import("node:fs").then(({readFile}) => readFile instanceof Function)',
      { importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER });
    
    // false: URL loaded from the main context is not an instance of the Function
    // class in the new context.
    script.runInNewContext().then(console.log);
    ```

Эта опция также позволяет сценарию или функции загружать пользовательские модули:

=== "MJS"

    ```js
    import { Script, constants } from 'node:vm';
    import { resolve } from 'node:path';
    import { writeFileSync } from 'node:fs';
    
    // Write test.js and test.txt to the directory where the current script
    // being run is located.
    writeFileSync(resolve(import.meta.dirname, 'test.mjs'),
                  'export const filename = "./test.json";');
    writeFileSync(resolve(import.meta.dirname, 'test.json'),
                  '{"hello": "world"}');
    
    // Compile a script that loads test.mjs and then test.json
    // as if the script is placed in the same directory.
    const script = new Script(
      `(async function() {
        const { filename } = await import('./test.mjs');
        return import(filename, { with: { type: 'json' } })
      })();`,
      {
        filename: resolve(import.meta.dirname, 'test-with-default.js'),
        importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
      });
    
    // { default: { hello: 'world' } }
    script.runInThisContext().then(console.log);
    ```

=== "CJS"

    ```js
    const { Script, constants } = require('node:vm');
    const { resolve } = require('node:path');
    const { writeFileSync } = require('node:fs');
    
    // Write test.js and test.txt to the directory where the current script
    // being run is located.
    writeFileSync(resolve(__dirname, 'test.mjs'),
                  'export const filename = "./test.json";');
    writeFileSync(resolve(__dirname, 'test.json'),
                  '{"hello": "world"}');
    
    // Compile a script that loads test.mjs and then test.json
    // as if the script is placed in the same directory.
    const script = new Script(
      `(async function() {
        const { filename } = await import('./test.mjs');
        return import(filename, { with: { type: 'json' } })
      })();`,
      {
        filename: resolve(__dirname, 'test-with-default.js'),
        importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER,
      });
    
    // { default: { hello: 'world' } }
    script.runInThisContext().then(console.log);
    ```

При загрузке пользовательских модулей через стандартный загрузчик
из основного контекста учтите следующее:

1. Разрешение модуля выполняется относительно опции `filename`, переданной в
   `vm.Script` или `vm.compileFunction()`. Поддерживается
   `filename` как абсолютный путь, так и строка URL. Если `filename` —
   строка, которая не является ни абсолютным путём, ни URL, или если она `undefined`,
   разрешение идёт относительно текущего рабочего каталога
   процесса. Для `vm.createContext()` разрешение всегда
   относительно текущего рабочего каталога, так как опция используется только при отсутствии сценария-реферера или модуля.
2. Для одного и того же `filename`, разрешающегося в конкретный путь, после первой успешной загрузки модуля с этого пути результат может кэшироваться,
   и повторная загрузка с того же пути вернёт
   то же самое. Если `filename` — строка URL, кэш не совпадёт
   при разных query-параметрах. Для `filename`, не являющихся строками URL,
   сейчас нельзя обойти кэширование.

### Когда `importModuleDynamically` — функция

Если `importModuleDynamically` — функция, она вызывается при `import()`
в скомпилированном коде, чтобы задать способ компиляции и вычисления запрошенного модуля. Сейчас процесс Node.js должен быть запущен с флагом `--experimental-vm-modules`, иначе опция не сработает. Если
флаг не задан, этот колбэк игнорируется. Если выполняемый код
фактически вызывает `import()`, результат будет отклонён с
[`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG`](errors.md#err_vm_dynamic_import_callback_missing_flag).

Колбэк `importModuleDynamically(specifier, referrer, importAttributes)`
имеет сигнатуру:

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) спецификатор, переданный в `import()`
* `referrer` [`<vm.Script>`](vm.md#new-vmscriptcode-options) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<vm.SourceTextModule>`](vm.md) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  Реферер — скомпилированный `vm.Script` для `new vm.Script`,
  `vm.runInThisContext`, `vm.runInContext` и `vm.runInNewContext`; скомпилированный
  `Function` для `vm.compileFunction`; скомпилированный
  `vm.SourceTextModule` для `new vm.SourceTextModule`; объект контекста `Object`
  для `vm.createContext()`.
* `importAttributes` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Значение `"with"`, переданное в необязательный параметр
  [`optionsExpression`](https://tc39.es/proposal-import-attributes/#sec-evaluate-import-call), или пустой объект, если значение не
  задано.
* `phase` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Фаза динамического импорта (`"source"` или `"evaluation"`).
* Возвращает: [`<Module Namespace Object>`](https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects) | [`<vm.Module>`](vm.md) Рекомендуется возвращать `vm.Module`, чтобы
  использовать отслеживание ошибок и избежать проблем
  с пространствами имён, где среди экспортов есть функция `then`.

=== "MJS"

    ```js
    // This script must be run with --experimental-vm-modules.
    import { Script, SyntheticModule } from 'node:vm';
    
    const script = new Script('import("foo.json", { with: { type: "json" } })', {
      async importModuleDynamically(specifier, referrer, importAttributes) {
        console.log(specifier);  // 'foo.json'
        console.log(referrer);   // The compiled script
        console.log(importAttributes);  // { type: 'json' }
        const m = new SyntheticModule(['bar'], () => { });
        await m.link(() => { });
        m.setExport('bar', { hello: 'world' });
        return m;
      },
    });
    const result = await script.runInThisContext();
    console.log(result);  //  { bar: { hello: 'world' } }
    ```

=== "CJS"

    ```js
    // This script must be run with --experimental-vm-modules.
    const { Script, SyntheticModule } = require('node:vm');
    
    (async function main() {
      const script = new Script('import("foo.json", { with: { type: "json" } })', {
        async importModuleDynamically(specifier, referrer, importAttributes) {
          console.log(specifier);  // 'foo.json'
          console.log(referrer);   // The compiled script
          console.log(importAttributes);  // { type: 'json' }
          const m = new SyntheticModule(['bar'], () => { });
          await m.link(() => { });
          m.setExport('bar', { hello: 'world' });
          return m;
        },
      });
      const result = await script.runInThisContext();
      console.log(result);  //  { bar: { hello: 'world' } }
    })();
    ```

[Cyclic Module Record]: https://tc39.es/ecma262/#sec-cyclic-module-records
[ECMAScript Module Loader]: esm.md#modules-ecmascript-modules
[Evaluate() concrete method]: https://tc39.es/ecma262/#sec-moduleevaluation
[Evaluate() of a Synthetic Module Record]: https://tc39.es/ecma262/#sec-smr-Evaluate
[FinishLoadingImportedModule]: https://tc39.es/ecma262/#sec-FinishLoadingImportedModule
[GetModuleNamespace]: https://tc39.es/ecma262/#sec-getmodulenamespace
[HostLoadImportedModule]: https://tc39.es/ecma262/#sec-HostLoadImportedModule
[HostResolveImportedModule]: https://tc39.es/ecma262/#sec-hostresolveimportedmodule
[ImportDeclaration]: https://tc39.es/ecma262/#prod-ImportDeclaration
[Link() concrete method]: https://tc39.es/ecma262/#sec-moduledeclarationlinking
[Module Record]: https://tc39.es/ecma262/#sec-abstract-module-records
[Source Text Module Record]: https://tc39.es/ecma262/#sec-source-text-module-records
[Support of dynamic `import()` in compilation APIs]: #support-of-dynamic-import-in-compilation-apis
[Synthetic Module Record]: https://tc39.es/ecma262/#sec-synthetic-module-records
[V8 Embedder's Guide]: https://v8.dev/docs/embed#contexts
[WithClause]: https://tc39.es/ecma262/#prod-WithClause
[`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG`]: errors.md#err_vm_dynamic_import_callback_missing_flag
[`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`]: errors.md#err_vm_dynamic_import_callback_missing
[`Error`]: errors.md#class-error
[`URL`]: url.md#class-url
[`eval()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
[`optionsExpression`]: https://tc39.es/proposal-import-attributes/#sec-evaluate-import-call
[`script.runInContext()`]: #scriptrunincontextcontextifiedobject-options
[`script.runInThisContext()`]: #scriptruninthiscontextoptions
[`sourceTextModule.instantiate()`]: #sourcetextmoduleinstantiate
[`sourceTextModule.linkRequests(modules)`]: #sourcetextmodulelinkrequestsmodules
[`sourceTextModule.moduleRequests`]: #sourcetextmodulemodulerequests
[`url.origin`]: url.md#urlorigin
[`vm.compileFunction()`]: #vmcompilefunctioncode-params-options
[`vm.constants.DONT_CONTEXTIFY`]: #vmconstantsdont_contextify
[`vm.createContext()`]: #vmcreatecontextcontextobject-options
[`vm.runInContext()`]: #vmrunincontextcode-contextifiedobject-options
[`vm.runInThisContext()`]: #vmruninthiscontextcode-options
[contextified]: #what-does-it-mean-to-contextify-an-object
[enqueing jobs]: https://tc39.es/ecma262/#sec-hostenqueuepromisejob
[global object]: https://tc39.es/ecma262/#sec-global-object
[indirect `eval()` call]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#direct_and_indirect_eval
[origin]: https://developer.mozilla.org/en-US/docs/Glossary/Origin
