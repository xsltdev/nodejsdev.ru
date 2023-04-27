---
description: Модуль vm позволяет компилировать и выполнять код в контексте виртуальной машины V8
---

# VM

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/vm.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:vm` позволяет компилировать и выполнять код в контексте виртуальной машины V8.

**Модуль `node:vm` не является механизмом безопасности. Не используйте его для запуска недоверенного кода.**

Код JavaScript может быть скомпилирован и запущен сразу или скомпилирован, сохранен и запущен позже.

Чаще всего код запускается в другом контексте V8 Context. Это означает, что вызываемый код имеет другой глобальный объект, чем вызывающий код.

Контекст можно обеспечить, [_контекстируя_](#what-does-it-mean-to-contextify-an-object) объект. Вызываемый код рассматривает любое свойство в контексте как глобальную переменную. Любые изменения глобальных переменных, вызванные вызываемым кодом, отражаются в объекте контекста.

```js
const vm = require('node:vm');

const x = 1;

const context = { x: 2 };
vm.createContext(context); // Contextify the object.

const code = 'x += 40; var y = 17;';
// `x` and `y` are global variables in the context.
// Initially, x has the value 2 because that is the value of context.x.
vm.runInContext(code, context);

console.log(context.x); // 42
console.log(context.y); // 17

console.log(x); // 1; y не определено.
```

## Класс: `vm.Script`

Экземпляры класса `vm.Script` содержат предварительно скомпилированные сценарии, которые могут быть выполнены в определенных контекстах.

### `новый vm.Script(code[, options])`

-   `code` {строка} JavaScript-код для компиляции.
-   `options` {Object|string}
    -   `filename` {string} Определяет имя файла, используемое в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `'evalmachine.<anonymous>'`.
    -   `lineOffset` {number} Задает смещение номера строки, которое отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `columnOffset` {number} Определяет смещение номера колонки первой строки, которая отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `cachedData` {Buffer|TypedArray|DataView} Предоставляет необязательный `Buffer` или `TypedArray`, или `DataView` с данными кэша кода V8 для предоставленного источника. При предоставлении значение `cachedDataRejected` будет установлено в `true` или `false` в зависимости от принятия данных V8.
    -   `produceCachedData` {boolean} Если `true` и нет `cachedData`, V8 попытается создать данные кэша кода для `code`. В случае успеха будет создан `буфер` с данными кэша кода V8 и сохранен в свойстве `cachedData` возвращаемого экземпляра `vm.Script`. Значение `cachedDataProduced` будет установлено в `true` или `false` в зависимости от того, успешно ли были созданы данные кэша кода. Эта опция **устарела** в пользу `script.createCachedData()`. **По умолчанию:** `false`.
    -   `importModuleDynamically` {Функция} Вызывается во время оценки этого модуля при вызове `import()`. Если эта опция не указана, вызовы `import()` будут отклонены с [`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing). Эта опция является частью API экспериментальных модулей. Мы не рекомендуем использовать ее в производственной среде.
        -   `specifier` {строка} спецификатор, передаваемый в `import()`.
        -   `script` {vm.Script}
        -   `importAssertions` {Object} Значение `"assert"`, переданное в опциональном параметре [`optionsExpression`](https://tc39.es/proposal-import-assertions/#sec-evaluate-import-call), или пустой объект, если значение не было предоставлено.
        -   Возвращает: {Module Namespace Object|vm.Module} Возвращать `vm.Module` рекомендуется для того, чтобы воспользоваться преимуществами отслеживания ошибок и избежать проблем с пространствами имен, содержащими экспорт функций `then`.

Если `options` - строка, то она указывает имя файла.

Создание нового объекта `vm.Script` компилирует `code`, но не запускает его. Скомпилированный `vm.Script` может быть запущен позже несколько раз. Код `code` не привязан к какому-либо глобальному объекту; скорее, он привязывается перед каждым запуском, только для этого запуска.

### `script.cachedDataRejected`

-   {boolean|undefined}

Когда `cachedData` предоставляется для создания `vm.Script`, это значение будет установлено в `true` или `false` в зависимости от принятия данных V8. В противном случае значение будет `undefined`.

### `script.createCachedData()`

-   Возвращает: {Буфер}

Создает кэш кода, который можно использовать с опцией `cachedData` конструктора `Script`. Возвращает `буфер`. Этот метод может быть вызван в любое время и любое количество раз.

Кэш кода `Script` не содержит никаких наблюдаемых состояний JavaScript. Кэш кода можно сохранять вместе с исходным текстом сценария и использовать для создания новых экземпляров `Script` многократно.

Функции в исходнике `Script` могут быть помечены как лениво компилируемые, и они не компилируются при построении `Script`. Эти функции будут скомпилированы, когда они будут вызваны в первый раз. Кэш кода сериализует метаданные, которые V8 знает о `Script` в настоящее время, и которые он может использовать для ускорения будущих компиляций.

```js
const script = new vm.Script(`}
function add(a, b) {
  return a + b;
}


const x = add(1, 2);
`);

const cacheWithoutAdd = script.createCachedData();
// В `cacheWithoutAdd` функция `add()` помечена для полной компиляции
// при вызове.

script.runInThisContext();

const cacheWithAdd = script.createCachedData();
// `cacheWithAdd` содержит полностью скомпилированную функцию `add()`.
```

### `script.runInContext(contextifiedObject[, options])`

-   `contextifiedObject` {Object} A [contextified](#what-does-it-mean-to-contextify-an-object) объект, возвращаемый методом `vm.createContext()`..
-   `options` {Object}
    -   `displayErrors` {boolean} При `true`, если при компиляции `кода` возникает [`ошибка`](errors.md#class-error), строка кода, вызвавшая ошибку, прикрепляется к трассировке стека. **По умолчанию:** `true`.
    -   `timeout` {integer} Определяет количество миллисекунд для выполнения `code` перед завершением выполнения. Если выполнение прервано, будет выдана ошибка [`Error`](errors.md#class-error). Это значение должно быть строго положительным целым числом.
    -   `breakOnSigint` {boolean} Если `true`, получает `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) прервет выполнение и выбросит [`Error`](errors.md#class-error). Существующие обработчики события, которые были подключены через `process.on('SIGINT')`, отключаются во время выполнения скрипта, но продолжают работать после этого. **По умолчанию:** `false`.
-   Возвращает: {any} результат самого последнего оператора, выполненного в сценарии.

Выполняет скомпилированный код, содержащийся в объекте `vm.Script`, в пределах заданного `contextifiedObject` и возвращает результат. Выполняемый код не имеет доступа к локальной области видимости.

Следующий пример компилирует код, который увеличивает глобальную переменную, устанавливает значение другой глобальной переменной, а затем выполняет код несколько раз. Глобальные переменные содержатся в объекте `context`.

```js
const vm = require('node:vm');

const context = {
    animal: 'cat',
    count: 2,
};

const script = new vm.Script('count += 1; name = "kitty";');

vm.createContext(context);
for (let i = 0; i < 10; ++i) {
    script.runInContext(context);
}

console.log(context);
// Prints: { animal: 'cat', count: 12, name: 'kitty' }
```

Использование опций `timeout` или `breakOnSigint` приведет к запуску новых циклов событий и соответствующих потоков, которые имеют ненулевые затраты производительности.

### `script.runInNewContext([contextObject[, options]])`

-   `contextObject` {Object} Объект, который будет [контекстирован] (#what-does-it-mean-to-contextify-an-object). Если `не определено`, будет создан новый объект.
-   `options` {Object}
    -   `displayErrors` {boolean} При `true`, если при компиляции `кода` возникает [`ошибка`](errors.md#class-error), строка кода, вызвавшая ошибку, прикрепляется к трассировке стека. **По умолчанию:** `true`.
    -   `timeout` {integer} Определяет количество миллисекунд для выполнения `code` перед завершением выполнения. Если выполнение прервано, будет выдана ошибка [`Error`](errors.md#class-error). Это значение должно быть строго положительным целым числом.
    -   `breakOnSigint` {boolean} If `true`, receiving `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) will terminate execution and throw an [`Error`](errors.md#class-error). Existing handlers for the event that have been attached via `process.on('SIGINT')` are disabled during script execution, but continue to work after that. **Default:** `false`.
    -   `contextName` {string} Человекочитаемое имя вновь созданного контекста. **По умолчанию:** `'VM Context i'`, где `i` - возрастающий числовой индекс созданного контекста.
    -   `contextOrigin` {string} [Origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin), соответствующий вновь созданному контексту для целей отображения. Origin должен быть отформатирован как URL, но содержать только схему, хост и порт (если необходимо), как значение свойства [`url.origin`](url.md#urlorigin) объекта [`URL`](url.md#class-url). В частности, в этой строке не должно быть косой черты, так как она обозначает путь. **По умолчанию:** ``````.
    -   `contextCodeGeneration` {Object}
        -   `strings` {boolean} Если установлено значение false, любые вызовы `eval` или конструкторов функций (`Function`, `GeneratorFunction` и т.д.) будут вызывать `EvalError`. **По умолчанию:** `true`.
        -   `wasm` {boolean} Если установлено значение false, то при любой попытке компиляции модуля WebAssembly будет выдаваться `WebAssembly.CompileError`. **По умолчанию:** `true`.
    -   `microtaskMode` {string} Если установлено значение `afterEvaluate`, микрозадачи (задачи, запланированные через `Promise` и `async function`) будут запущены сразу после выполнения скрипта. В этом случае они включаются в диапазоны `timeout` и `breakOnSigint`.
-   Возвращает: {любой} результат самого последнего оператора, выполненного в скрипте.

Сначала контекстирует заданный `contextObject`, запускает скомпилированный код, содержащийся в объекте `vm.Script` в созданном контексте, и возвращает результат. Выполняемый код не имеет доступа к локальной области видимости.

В следующем примере компилируется код, который устанавливает глобальную переменную, затем код выполняется несколько раз в разных контекстах. Глобальные переменные устанавливаются в каждом отдельном `контексте` и содержатся в нем.

```js
const vm = require('node:vm');

const script = new vm.Script('globalVar = "set"');

const contexts = [{}, {}, {}];
contexts.forEach((context) => {
    script.runInNewContext(context);
});

console.log(contexts);
// Prints: [{ globalVar: 'set' }, { globalVar: 'set' }, { globalVar: 'set' }]
```

### `script.runInThisContext([options])`

-   `options` {Object}
    -   `displayErrors` {boolean} When `true`, if an [`Error`](errors.md#class-error) occurs while compiling the `code`, the line of code causing the error is attached to the stack trace. **Default:** `true`.
    -   `timeout` {integer} Specifies the number of milliseconds to execute `code` before terminating execution. If execution is terminated, an [`Error`](errors.md#class-error) will be thrown. This value must be a strictly positive integer.
    -   `breakOnSigint` {boolean} If `true`, receiving `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) will terminate execution and throw an [`Error`](errors.md#class-error). Existing handlers for the event that have been attached via `process.on('SIGINT')` are disabled during script execution, but continue to work after that. **Default:** `false`.
-   Returns: {any} the result of the very last statement executed in the script.

Запускает скомпилированный код, содержащийся в `vm.Script`, в контексте текущего объекта `global`. Выполняемый код не имеет доступа к локальной области видимости, но _имеет_ доступ к текущему объекту `global`.

Следующий пример компилирует код, который увеличивает переменную `global`, а затем выполняет этот код несколько раз:

```js
const vm = require('node:vm');

global.globalVar = 0;

const script = new vm.Script('globalVar += 1', {
    filename: 'myfile.vm',
});

for (let i = 0; i < 1000; ++i) {
    script.runInThisContext();
}

console.log(globalVar);

// 1000
```

### `script.sourceMapURL`

-   {string|undefined}

Когда скрипт компилируется из источника, содержащего магический комментарий карты источника, это свойство будет установлено в URL карты источника.

```mjs
import vm from 'node:vm';

const script = new vm.Script(`
function myFunc() {}
//# sourceMappingURL=sourcemap.json
`);

console.log(script.sourceMapURL);
// Печать: sourcemap.json
```

```cjs
const vm = require('node:vm');

const script = new vm.Script(`
function myFunc() {}
//# sourceMappingURL=sourcemap.json
`);

console.log(script.sourceMapURL);
// Печать: sourcemap.json
```

## Класс: `vm.Module`

> Стабильность: 1 - Экспериментальный

Эта возможность доступна только при включенном флаге команды `--experimental-vm-modules`.

Класс `vm.Module` предоставляет низкоуровневый интерфейс для использования модулей ECMAScript в контекстах виртуальных машин. Это аналог класса `vm.Script`, который в точности повторяет [Module Record](https://www.ecma-international.org/ecma-262/#sec-abstract-module-records), как определено в спецификации ECMAScript.

Однако, в отличие от `vm.Script`, каждый объект `vm.Module` привязан к контексту с момента его создания. Операции над объектами `vm.Module` по своей сути асинхронны, в отличие от синхронной природы объектов `vm.Script`. Использование "асинхронных" функций может помочь при манипулировании объектами `vm.Module`.

Использование объекта `vm.Module` требует трех отдельных шагов: создание/разбор, связывание и оценка. Эти три этапа проиллюстрированы в следующем примере.

Эта реализация находится на более низком уровне, чем [ECMAScript Module loader](esm.md#modules-ecmascript-modules). Также пока не существует способа взаимодействия с загрузчиком, хотя поддержка планируется.

```mjs
import vm from 'node:vm';

const contextifiedObject = vm.createContext({
    secret: 42,
    print: console.log,
});

// Шаг 1
//
// Создайте модуль, построив новый объект `vm.SourceTextModule`. Этот
// разбирает предоставленный исходный текст, выбрасывая `SyntaxError`, если что-то идет не так
// неправильно. По умолчанию модуль создается в верхнем контексте. Но здесь мы.
// указываем `contextifiedObject` в качестве контекста, к которому принадлежит этот модуль.
//
// Здесь мы пытаемся получить экспорт по умолчанию из модуля "foo", и
// поместить его в локальное связывание "secret".

const bar = new vm.SourceTextModule(
    `
  import s from 'foo';
  s;
  print(s);
`,
    { context: contextifiedObject }
);

// Шаг 2
//
// "Свяжите" импортированные зависимости этого модуля с ним.
//
// Предоставленный обратный вызов связывания ("компоновщик") принимает два аргумента:.
// родительский модуль (`bar` в данном случае) и строку, которая является спецификатором
// импортируемого модуля. Ожидается, что обратный вызов вернет модуль, который.
// соответствует предоставленному спецификатору, с определенными требованиями, задокументированными
// в `module.link()`.
//
// Если компоновка не началась для возвращаемого модуля, тот же обратный вызов компоновщика
// обратный вызов будет вызван на возвращаемом Модуле.
//
// Даже Модули верхнего уровня без зависимостей должны быть явно линкованы. При этом
// предоставленный обратный вызов никогда не будет вызван, однако.
//
// Метод link() возвращает Promise, который будет разрешен, когда разрешатся все
// Обещания, возвращенные компоновщиком, разрешатся.
//
// Примечание: Это надуманный пример, так как функция компоновщика создает новый модуль
// модуль "foo" каждый раз, когда она вызывается. В полноценной модульной системе, вероятно, будет использоваться
// кэш, вероятно, будет использоваться, чтобы избежать дублирования модулей.

async function linker(specifier, referencingModule) {
    if (specifier === 'foo') {
        return new vm.SourceTextModule(
            `
      // The "secret" variable refers to the global variable we added to
      // "contextifiedObject" when creating the context.
      export default secret;
    `,
            { context: referencingModule.context }
        );

        // Using `contextifiedObject` instead of `referencingModule.context`
        // here would work as well.
    }
    throw new Error(
        `Unable to resolve dependency: ${specifier}`
    );
}
await bar.link(linker);

// Step 3
//
// Evaluate the Module. The evaluate() method returns a promise which will
// resolve after the module has finished evaluating.

// Prints 42.
await bar.evaluate();
```

```cjs
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

    const bar = new vm.SourceTextModule(
        `
    import s from 'foo';
    s;
    print(s);
  `,
        { context: contextifiedObject }
    );

    // Step 2
    //
    // "Link" the imported dependencies of this Module to it.
    //
    // The provided linking callback (the "linker") accepts two arguments: the
    // parent module (`bar` in this case) and the string that is the specifier of
    // the imported module. The callback is expected to return a Module that
    // corresponds to the provided specifier, with certain requirements documented
    // in `module.link()`.
    //
    // If linking has not started for the returned Module, the same linker
    // callback will be called on the returned Module.
    //
    // Even top-level Modules without dependencies must be explicitly linked. The
    // callback provided would never be called, however.
    //
    // The link() method returns a Promise that will be resolved when all the
    // Promises returned by the linker resolve.
    //
    // Note: This is a contrived example in that the linker function creates a new
    // "foo" module every time it is called. In a full-fledged module system, a
    // cache would probably be used to avoid duplicated modules.

    async function linker(specifier, referencingModule) {
        if (specifier === 'foo') {
            return new vm.SourceTextModule(
                `
        // The "secret" variable refers to the global variable we added to
        // "contextifiedObject" when creating the context.
        export default secret;
      `,
                { context: referencingModule.context }
            );

            // Using `contextifiedObject` instead of `referencingModule.context`
            // here would work as well.
        }
        throw new Error(
            `Unable to resolve dependency: ${specifier}`
        );
    }
    await bar.link(linker);

    // Step 3
    //
    // Evaluate the Module. The evaluate() method returns a promise which will
    // resolve after the module has finished evaluating.

    // Prints 42.
    await bar.evaluate();
})();
```

### `module.dependencySpecifiers`

-   {string\[\]}

Спецификаторы всех зависимостей этого модуля. Возвращаемый массив замораживается, чтобы запретить любые изменения в нем.

Соответствует полю `[[RequestedModules]]` [Cyclic Module Record](https://tc39.es/ecma262/#sec-cyclic-module-records)` в спецификации ECMAScript.

### `module.error`

-   {любая}

Если `module.status` имеет значение `'errored'`, то это свойство содержит исключение, выброшенное модулем во время оценки. Если статус имеет любое другое значение, обращение к этому свойству приведет к выброшенному исключению.

Значение `undefined` не может быть использовано для случаев, когда исключение не выбрасывается из-за возможной двусмысленности с `throw undefined;`.

Соответствует полю `[[EvaluationError]]` в [Cyclic Module Record](https://tc39.es/ecma262/#sec-cyclic-module-records) в спецификации ECMAScript.

### `module.evaluate([options])`

-   `options` {Object}
    -   `timeout` {integer} Specifies the number of milliseconds to evaluate before terminating execution. If execution is interrupted, an [`Error`](errors.md#class-error) will be thrown. This value must be a strictly positive integer.
    -   `breakOnSigint` {boolean} If `true`, receiving `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) will terminate execution and throw an [`Error`](errors.md#class-error). Existing handlers for the event that have been attached via `process.on('SIGINT')` are disabled during script execution, but continue to work after that. **Default:** `false`.
-   Возвращается: {Promise} Выполняется с `undefined` в случае успеха.

Оценить модуль.

Эта функция должна быть вызвана после того, как модуль был связан; в противном случае произойдет отказ. Он может быть вызван и тогда, когда модуль уже был оценен, в этом случае он либо ничего не сделает, если первоначальная оценка завершилась успехом (`module.status` имеет значение `'evaluated'`), либо повторно вызовет исключение, к которому привела первоначальная оценка (`module.status` имеет значение `'errored'`).

Этот метод не может быть вызван, пока модуль находится в процессе оценки (`module.status` имеет значение `'evaluating'`).

Соответствует полю [Evaluate() concrete method](https://tc39.es/ecma262/#sec-moduleevaluation) поля [Cyclic Module Record](https://tc39.es/ecma262/#sec-cyclic-module-records)s в спецификации ECMAScript.

### `module.identifier`

-   {строка}

Идентификатор текущего модуля, установленный в конструкторе.

### `module.link(linker)`

-   `linker` {Function}

    -   `specifier` {string} Спецификатор запрашиваемого модуля:

        ```mjs
        import foo from 'foo';
        // ^^^^^ спецификатор модуля
        ```

    -   `referencingModule` {vm.Module} Объект `модуля` `link()` вызывается на.

    -   `extra` {Object}

        -   `assert` {Object} Данные из утверждения:

            ```js
            import foo from "foo" assert { name: "value" };
            // ^^^^^^^^^^^^^^^^^ утверждение
            ```

            Согласно ECMA-262, ожидается, что хосты будут игнорировать утверждения, которые они не поддерживают, в отличие, например, от выдачи ошибки при наличии неподдерживаемого утверждения.

    -   Возвращает: {vm.Module|Promise}

-   Возвращает: {Promise}

Связать зависимости модуля. Этот метод должен быть вызван до оценки и может быть вызван только один раз для каждого модуля.

Ожидается, что функция вернет объект `Module` или `Promise`, который в конечном итоге разрешится в объект `Module`. Возвращаемый `модуль` должен удовлетворять следующим двум инвариантам:

-   Он должен принадлежать к тому же контексту, что и родительский `модуль`.
-   Его `статус` не должен быть `"errored"`.

Если `статус` возвращаемого `модуля будет `'unlinked'`, этот метод будет рекурсивно вызван на возвращаемом `модуле`с той же самой предоставленной функцией`linker`.

`link()` возвращает `Promise`, который будет либо разрешен, если все экземпляры связывания разрешатся в правильный `модуль`, либо отклонен, если функция компоновщика либо выбросит исключение, либо вернет недействительный `модуль`.

Функция компоновщика примерно соответствует определяемой реализацией абстрактной операции [HostResolveImportedModule](https://tc39.es/ecma262/#sec-hostresolveimportedmodule) в спецификации ECMAScript, с несколькими ключевыми отличиями:

-   Функция компоновщика может быть асинхронной, а [HostResolveImportedModule](https://tc39.es/ecma262/#sec-hostresolveimportedmodule) - синхронной.

Фактическая реализация [HostResolveImportedModule](https://tc39.es/ecma262/#sec-hostresolveimportedmodule), используемая во время компоновки модулей, возвращает модули, связанные во время компоновки. Поскольку в этот момент все модули уже были бы полностью связаны, реализация [HostResolveImportedModule](https://tc39.es/ecma262/#sec-hostresolveimportedmodule) является полностью синхронной согласно спецификации.

Соответствует полю [Link() concrete method](https://tc39.es/ecma262/#sec-moduledeclarationlinking) поля [Cyclic Module Record](https://tc39.es/ecma262/#sec-cyclic-module-records)s в спецификации ECMAScript.

### `module.namespace`

-   {Object}

Объект пространства имен модуля. Он доступен только после завершения связывания (`module.link()`).

Соответствует абстрактной операции [GetModuleNamespace](https://tc39.es/ecma262/#sec-getmodulenamespace) в спецификации ECMAScript.

### `module.status`

-   {string}

Текущий статус модуля. Будет одним из:

-   `'unlinked'`: `module.link()` еще не был вызван.

-   `'linking'`: `module.link()` был вызван, но еще не все Promises, возвращенные функцией linker, были разрешены.

-   `'linked'`: Модуль был успешно связан, и все его зависимости связаны, но `module.evaluate()` еще не был вызван.

-   ` 'evaluating``: Модуль оценивается через  `module.evaluate()` для себя или родительского модуля.

-   `'evaluated'`: Модуль был успешно оценен.

-   `'errored'`: Модуль был оценен, но возникло исключение.

Кроме `'errored'`, эта строка состояния соответствует полю `[[Status]]` спецификации [Cyclic Module Record](https://tc39.es/ecma262/#sec-cyclic-module-records). `'errored'` соответствует `'evaluated'` в спецификации, но с `[[EvaluationError]]`, установленным на значение, которое не является `undefined`.

## Класс: `vm.SourceTextModule`

> Стабильность: 1 - Экспериментальный

Эта возможность доступна только при включенном флаге команды `--experimental-vm-modules`.

-   Расширяет: {vm.Module}

Класс `vm.SourceTextModule` предоставляет [Source Text Module Record](https://tc39.es/ecma262/#sec-source-text-module-records), как определено в спецификации ECMAScript.

### `новый vm.SourceTextModule(code[, options])`

-   `code` {string} Код JavaScript-модуля для разбора
-   `options`
    -   `идентификатор` {строка} Строка, используемая в трассировках стека. **По умолчанию:** `'vm:module(i)'`, где `i` - контекстно-зависимый возрастающий индекс.
    -   `cachedData` {Buffer|TypedArray|DataView} Предоставляет необязательный `Buffer` или `TypedArray`, или `DataView` с данными кэша кода V8 для предоставленного источника. Код `code` должен быть таким же, как и модуль, из которого были созданы эти `cachedData`.
    -   `context` {Object} [контекстированный](#what-does-it-mean-to-contextify-an-object) объект, возвращенный методом `vm.createContext()`, для компиляции и оценки этого `модуля`.
    -   `lineOffset` {целое число} Определяет смещение номера строки, которое отображается в трассировках стека, создаваемых этим `модулем`. **По умолчанию:** `0`.
    -   `columnOffset` {integer} Определяет смещение номера колонки первой строки, которая отображается в трассировках стека, создаваемых этим `модулем`. **По умолчанию:** `0`.
    -   `initializeImportMeta` {Функция} Вызывается во время оценки этого `модуля` для инициализации `import.meta`.
        -   `meta` {import.meta}
        -   `модуль` {vm.SourceTextModule}
    -   `importModuleDynamically` {Функция} Вызывается во время оценки этого модуля при вызове `import()`. Если эта опция не указана, вызовы `import()` будут отклонены с [`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing).
        -   `specifier` {строка} спецификатор, переданный в `import()`.
        -   `модуль` {vm.Module}
        -   `importAssertions` {Object} Значение `"assert"`, переданное в опциональном параметре [`optionsExpression`](https://tc39.es/proposal-import-assertions/#sec-evaluate-import-call), или пустой объект, если значение не было предоставлено.
        -   Возвращает: {Module Namespace Object|vm.Module} Возвращать `vm.Module` рекомендуется для того, чтобы воспользоваться преимуществами отслеживания ошибок и избежать проблем с пространствами имен, содержащими экспорт функций `then`.

Создает новый экземпляр `SourceTextModule`.

Свойства, назначенные объекту `import.meta`, которые являются объектами, могут позволить модулю получить доступ к информации вне указанного `контекста`. Используйте `vm.runInContext()` для создания объектов в определенном контексте.

```mjs
import vm from 'node:vm';

const contextifiedObject = vm.createContext({ secret: 42 });

const module = new vm.SourceTextModule(
    'Object.getPrototypeOf(import.meta.prop).secret = secret;',
    {
        initializeImportMeta(meta) {
            // Примечание: этот объект создается в верхнем контексте. Как таковой,
            // Object.getPrototypeOf(import.meta.prop) указывает на
            // Object.prototype в верхнем контексте, а не на прототип в
            // контекстифицированном объекте.
            meta.prop = {};
        },
    }
);
// Поскольку модуль не имеет зависимостей, функция linker никогда не будет вызвана.
await module.link(() => {});
await module.evaluate();

// Теперь Object.prototype.secret будет равен 42.
//
// Чтобы исправить эту проблему, замените
// meta.prop = {};
// выше на
// meta.prop = vm.runInContext('{}', contextifiedObject);
```

```cjs
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
        }
    );
    // Since module has no dependencies, the linker function will never be called.
    await module.link(() => {});
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

-   Возвращает: {Буфер}

Создает кэш кода, который может быть использован с опцией `cachedData` конструктора `SourceTextModule`. Возвращает `Буфер`. Этот метод может быть вызван любое количество раз до того, как модуль будет оценен.

Кэш кода `SourceTextModule` не содержит никаких наблюдаемых состояний JavaScript. Кэш кода можно сохранять вместе с исходным текстом сценария и использовать для создания новых экземпляров `SourceTextModule` многократно.

Функции в источнике `SourceTextModule` могут быть помечены как лениво компилируемые, и они не компилируются при построении `SourceTextModule`. Эти функции будут скомпилированы, когда они будут вызваны в первый раз. Кэш кода сериализует метаданные, которые V8 знает о `SourceTextModule` на данный момент, которые он может использовать для ускорения компиляции в будущем.

```js
// Создаем начальный модуль
const module = new vm.SourceTextModule('const a = 1;');

// Создаем кэшированные данные из этого модуля
const cachedData = module.createCachedData();

// Создайте новый модуль, используя кэшированные данные. Код должен быть одинаковым.
const module2 = new vm.SourceTextModule('const a = 1;', {
    cachedData,
});
```

## Класс: `vm.SyntheticModule`.

> Стабильность: 1 - Экспериментальный

Эта возможность доступна только при включенном флаге команды `--experimental-vm-modules`.

-   Расширяет: {vm.Module}

Класс `vm.SyntheticModule` предоставляет [Synthetic Module Record](https://heycam.github.io/webidl/#synthetic-module-records), как определено в спецификации WebIDL. Целью синтетических модулей является предоставление общего интерфейса для раскрытия источников не-JavaScript в графы модулей ECMAScript.

```js
const vm = require('node:vm');

const source = '{ "a": 1 }';
const module = new vm.SyntheticModule(
    ['default'],
    function () {
        const obj = JSON.parse(source);
        this.setExport('default', obj);
    }
);

// Использование `module` в связывании...
```

### `новый vm.SyntheticModule(exportNames, evaluateCallback[, options])`

-   `exportNames` {string\[\]} Массив имен, которые будут экспортированы из модуля.
-   `evaluateCallback` {Function} Вызывается при оценке модуля.
-   `options`
    -   `identifier` {string} Строка, используемая в трассировках стека. **По умолчанию:** `'vm:module(i)'`, где `i` - специфический для контекста возрастающий индекс.
    -   `context` {Object} [контекстифицированный](#what-does-it-mean-to-contextify-an-object) объект, возвращенный методом `vm.createContext()`, для компиляции и оценки этого `модуля`.

Создает новый экземпляр `SyntheticModule`.

Объекты, назначенные на экспорты этого экземпляра, могут позволить импортерам модуля получить доступ к информации вне указанного `контекста`. Используйте `vm.runInContext()` для создания объектов в определенном контексте.

### `syntheticModule.setExport(name, value)`

-   `name` {string} Имя экспорта, который нужно установить.
-   `value` {любое} Значение, на которое нужно установить экспорт.

Этот метод используется после соединения модуля для установки значений экспортов. Если он будет вызван до того, как модуль будет связан, то будет выдана ошибка [`ERR_VM_MODULE_STATUS`](errors.md#err_vm_module_status).

```mjs
import vm from 'node:vm';

const m = new vm.SyntheticModule(['x'], () => {
    m.setExport('x', 1);
});

await m.link(() => {});
await m.evaluate();

assert.strictEqual(m.namespace.x, 1);
```

```cjs
const vm = require('node:vm');
(async () => {
    const m = new vm.SyntheticModule(['x'], () => {
        m.setExport('x', 1);
    });
    await m.link(() => {});
    await m.evaluate();
    assert.strictEqual(m.namespace.x, 1);
})();
```

## `vm.compileFunction(code[, params[, options]])`

-   `code` {строка} Тело функции для компиляции.
-   `params` {string\[\]} Массив строк, содержащий все параметры для функции.
-   `options` {Object}
    -   `filename` {string} Определяет имя файла, используемого в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `''`''.
    -   `lineOffset` {number} Определяет смещение номера строки, которое отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `columnOffset` {number} Определяет смещение номера колонки первой строки, которая отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `cachedData` {Buffer|TypedArray|DataView} Предоставляет необязательный `Buffer` или `TypedArray`, или `DataView` с данными кэша кода V8 для предоставленного источника.
    -   `produceCachedData` {boolean} Указывает, нужно ли создавать новые данные кэша. **По умолчанию:** `false`.
    -   `parsingContext` {Object} [контекстированный](#what-does-it-mean-to-contextify-an-object) объект, в котором должна быть скомпилирована указанная функция.
    -   `contextExtensions` {Object\[\]} Массив, содержащий коллекцию расширений контекста (объектов, оборачивающих текущую область видимости), которые будут применены при компиляции. **По умолчанию:** `[]`.
    -   `importModuleDynamically` {Функция} Вызывается во время оценки этого модуля при вызове `import()`. Если эта опция не указана, вызовы `import()` будут отклонены с [`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing). Эта опция является частью API экспериментальных модулей и не должна считаться стабильной.
        -   `specifier` {строка} спецификатор, передаваемый в `import()`.
        -   `function` {функция}
        -   `importAssertions` {Object} Значение `"assert"`, переданное в опциональном параметре [`optionsExpression`](https://tc39.es/proposal-import-assertions/#sec-evaluate-import-call), или пустой объект, если значение не было предоставлено.
        -   Возвращает: {Module Namespace Object|vm.Module} Рекомендуется возвращать `vm.Module`, чтобы воспользоваться преимуществами отслеживания ошибок и избежать проблем с пространствами имен, содержащими экспорт функций `then`.
-   Возвращает: {Функция}

Компилирует заданный код в предоставленный контекст (если контекст не предоставлен, используется текущий контекст) и возвращает его завернутым в функцию с заданными `параметрами`.

## `vm.createContext([contextObject[, options]])`

-   `contextObject` {Object}
-   `options` {Object}
    -   `name` {string} Человекочитаемое имя вновь созданного контекста. **По умолчанию:** `'VM Context i'`, где `i` - возрастающий числовой индекс созданного контекста.
    -   `origin` {string} [Origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin), соответствующее вновь созданному контексту для целей отображения. Origin должен быть отформатирован как URL, но содержать только схему, хост и порт (если необходимо), как значение свойства [`url.origin`](url.md#urlorigin) объекта [`URL`](url.md#class-url). В частности, в этой строке не должно быть косой черты, так как она обозначает путь. **По умолчанию:** ``````.
    -   `codeGeneration` {Object}
        -   `strings` {boolean} Если установлено значение false, любые вызовы `eval` или конструкторов функций (`Function`, `GeneratorFunction` и т.д.) будут вызывать `EvalError`. **По умолчанию:** `true`.
        -   `wasm` {boolean} Если установлено значение false, то при любой попытке компиляции модуля WebAssembly будет выдаваться `WebAssembly.CompileError`. **По умолчанию:** `true`.
    -   `microtaskMode` {string} Если установлено значение `afterEvaluate`, микрозадачи (задачи, запланированные через `Promise` и `async function`) будут выполняться сразу после запуска скрипта через [`script.runInContext()`](#scriptrunincontextcontextifiedobject-options). В этом случае они включаются в диапазоны `timeout` и `breakOnSigint`.
-   Возвращает: {Object} контекстифицированный объект.

Если дан `contextObject`, метод `vm.createContext()` [подготовит этот объект](#what-does-it-mean-to-contextify-an-object), чтобы его можно было использовать в вызовах [`vm.runInContext()`](#vmrunincontextcode-contextifiedobject-options) или [`script.runInContext()`](#scriptrunincontextcontextifiedobject-options). Внутри таких скриптов `contextObject` будет глобальным объектом, сохраняя все свои существующие свойства, но также имея встроенные объекты и функции, которые есть у любого стандартного [глобального объекта](https://es5.github.io/#x15.1). Вне скриптов, выполняемых модулем vm, глобальные переменные останутся неизменными.

```js
const vm = require('node:vm');

global.globalVar = 3;

const context = { globalVar: 1 };
vm.createContext(context);

vm.runInContext('globalVar *= 2;', context);

console.log(context);
// Prints: { globalVar: 2 }

console.log(global.globalVar);
// Печатает: 3
```

Если `contextObject` опущен (или передан явно как `undefined`), будет возвращен новый, пустой [контекстированный](#what-does-it-mean-to-contextify-an-object) объект.

Метод `vm.createContext()` в первую очередь полезен для создания единого контекста, который может быть использован для запуска нескольких сценариев. Например, при эмуляции веб-браузера этот метод можно использовать для создания одного контекста, представляющего глобальный объект окна, а затем запускать все теги `<script>` вместе в этом контексте.

Указанные `name` и `origin` контекста становятся видимыми через API Inspector.

## `vm.isContext(object)`

-   `object` {Object}
-   Возвращает: {boolean}

Возвращает `true`, если данный объект `object` был [контекстирован] (#what-does-it-mean-to-contextify-an-object) с помощью [`vm.createContext()`] (#vmcreatecontextcontextobject-options).

## `vm.measureMemory([options])`

> Стабильность: 1 - Экспериментальная

Измеряет память, известную V8 и используемую всеми контекстами, известными текущему изоляту V8 или основному контексту.

-   `options` {Object} Необязательно.
    -   `mode` {string} Либо `сводный`, либо `детальный`. В кратком режиме будет возвращена только память, измеренная для основного контекста. В подробном режиме будет возвращена память, измеренная для всех контекстов, известных текущему изоляту V8. **По умолчанию:** `'summary'`.
    -   `execution` {строка} Либо `'default'`, либо `'eager'`. При выполнении по умолчанию обещание не будет разрешено до следующего запланированного запуска сборки мусора, что может занять некоторое время (или никогда, если программа завершится до следующего GC). При нетерпеливом выполнении GC будет запущен сразу же, чтобы измерить память. **По умолчанию:** `'default'\*.
-   Возвращает: {Promise} Если память успешно измерена, обещание разрешится с объектом, содержащим информацию об использовании памяти.

Формат объекта, с которым может разрешиться возвращаемое обещание, специфичен для движка V8 и может меняться от версии V8 к версии.

Возвращаемый результат отличается от статистики, возвращаемой `v8.getHeapSpaceStatistics()` тем, что `vm.measureMemory()` измеряет память, достижимую каждым специфическим для V8 контекстом в текущем экземпляре движка V8, в то время как результат `v8.getHeapSpaceStatistics()` измеряет память, занимаемую каждым пространством кучи в текущем экземпляре V8.

```js
const vm = require('node:vm');
// Измерьте память, используемую основным контекстом.
vm.measureMemory({ mode: 'summary' })
    // Это то же самое, что и vm.measureMemory()
    .then((result) => {
        // Текущий формат:
        // {
        // итого: {
        // jsMemoryEstimate: 2418479, jsMemoryRange: [ 2418479, 2745799 ]
        // }
        // }
        console.log(result);
    });

const context = vm.createContext({ a: 1 });
vm.measureMemory({
    mode: 'detailed',
    execution: 'eager',
}).then((result) => {
    // Ссылаемся на контекст здесь, чтобы он не был GC'ed
    // пока измерение не будет завершено.
    console.log(context.a);
    // {
    // итого: {
    // jsMemoryEstimate: 2574732,
    // jsMemoryRange: [ 2574732, 2904372 ]
    // },
    // текущий: {
    // jsMemoryEstimate: 2438996,
    // jsMemoryRange: [ 2438996, 2768636 ]
    // },
    // other: [
    // {
    // jsMemoryEstimate: 135736,
    // jsMemoryRange: [ 135736, 465376 ]
    // }
    // ]
    // }
    console.log(result);
});
```

## `vm.runInContext(code, contextifiedObject[, options])`

-   `code` {string} JavaScript-код для компиляции и запуска.
-   `contextifiedObject` {Object} контекстифицированный объект, который будет использоваться в качестве `глобального` при компиляции и выполнении `кода`.
-   `options` {Object|string}
    -   `filename` {string} Определяет имя файла, используемого в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `'evalmachine.<anonymous>'`.
    -   `lineOffset` {number} Задает смещение номера строки, которое отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `columnOffset` {number} Определяет смещение номера колонки первой строки, которая отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `displayErrors` {boolean} Когда `true`, если при компиляции `кода` возникает [`ошибка`](errors.md#class-error), строка кода, вызвавшая ошибку, прикрепляется к трассировке стека. **По умолчанию:** `true`.
    -   `timeout` {integer} Определяет количество миллисекунд, в течение которых будет выполняться `код` перед завершением выполнения. Если выполнение прервано, будет выдана ошибка [`Error`](errors.md#class-error). This value must be a strictly positive integer.
    -   `breakOnSigint` {boolean} If `true`, receiving `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) will terminate execution and throw an [`Error`](errors.md#class-error). Existing handlers for the event that have been attached via `process.on('SIGINT')` are disabled during script execution, but continue to work after that. **Default:** `false`.
    -   `cachedData` {Buffer|TypedArray|DataView} Provides an optional `Buffer` or `TypedArray`, or `DataView` with V8’s code cache data for the supplied source.
    -   `importModuleDynamically` {Function} Called during evaluation of this module when `import()` is called. If this option is not specified, calls to `import()` will reject with [`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing). This option is part of the experimental modules API. We do not recommend using it in a production environment.
        -   `specifier` {string} specifier passed to `import()`
        -   `script` {vm.Script}
        -   `importAssertions` {Object} Значение `"assert"`, переданное в опциональном параметре [`optionsExpression`](https://tc39.es/proposal-import-assertions/#sec-evaluate-import-call), или пустой объект, если значение не было предоставлено.
        -   Возвращает: {Module Namespace Object|vm.Module} Рекомендуется возвращать `vm.Module`, чтобы воспользоваться преимуществами отслеживания ошибок и избежать проблем с пространствами имен, содержащими экспорт функций `then`.
-   Возвращает: {любой} результат самого последнего оператора, выполненного в сценарии.

Метод `vm.runInContext()` компилирует `код`, выполняет его в контексте `contextifiedObject`, а затем возвращает результат. Выполняемый код не имеет доступа к локальной области видимости. Объект `contextifiedObject` _должен_ быть предварительно [контекстирован](#what-does-it-mean-to-contextify-an-object) с помощью метода [`vm.createContext()`](#vmcreatecontextcontextobject-options).

Если `options` - строка, то она задает имя файла.

Следующий пример компилирует и выполняет различные скрипты, используя один объект [contextified](#what-does-it-mean-to-contextify-an-object):

```js
const vm = require('node:vm');

const contextObject = { globalVar: 1 };
vm.createContext(contextObject);

for (let i = 0; i < 10; ++i) {
    vm.runInContext('globalVar *= 2;', contextObject);
}
console.log(contextObject);
// Prints: { globalVar: 1024 }
```

## `vm.runInNewContext(code[, contextObject[, options]])`

-   `code` {string} JavaScript-код для компиляции и запуска.
-   `contextObject` {Object} Объект, который будет [контекстирован] (#what-does-it-mean-to-contextify-an-object). Если `не определено`, будет создан новый объект.
-   `options` {Object|string}
    -   `filename` {string} Определяет имя файла, используемого в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `'evalmachine.<anonymous>'`.
    -   `lineOffset` {number} Задает смещение номера строки, которое отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `columnOffset` {number} Определяет смещение номера колонки первой строки, которая отображается в трассировках стека, создаваемых этим скриптом. **По умолчанию:** `0`.
    -   `displayErrors` {boolean} Когда `true`, если при компиляции `кода` возникает [`ошибка`](errors.md#class-error), строка кода, вызвавшая ошибку, прикрепляется к трассировке стека. **По умолчанию:** `true`.
    -   `timeout` {integer} Определяет количество миллисекунд, в течение которых будет выполняться `код` перед завершением выполнения. Если выполнение прервано, будет выдана ошибка [`Error`](errors.md#class-error). This value must be a strictly positive integer.
    -   `breakOnSigint` {boolean} If `true`, receiving `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) will terminate execution and throw an [`Error`](errors.md#class-error). Existing handlers for the event that have been attached via `process.on('SIGINT')` are disabled during script execution, but continue to work after that. **Default:** `false`.
    -   `contextName` {string} Human-readable name of the newly created context. **Default:** `'VM Context i'`, where `i` is an ascending numerical index of the created context.
    -   `contextOrigin` {string} [Origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin) corresponding to the newly created context for display purposes. The origin should be formatted like a URL, but with only the scheme, host, and port (if necessary), like the value of the [`url.origin`](url.md#urlorigin) property of a [`URL`](url.md#class-url) object. Most notably, this string should omit the trailing slash, as that denotes a path. **Default:** `''`.
    -   `contextCodeGeneration` {Object}
        -   `strings` {boolean} Если установлено значение false, любые вызовы `eval` или конструкторов функций (`Function`, `GeneratorFunction` и т.д.) будут вызывать `EvalError`. **По умолчанию:** `true`.
        -   `wasm` {boolean} Если установлено значение false, то при любой попытке компиляции модуля WebAssembly будет выдаваться `WebAssembly.CompileError`. **По умолчанию:** `true`.
    -   `cachedData` {Buffer|TypedArray|DataView} Предоставляет необязательный `Buffer` или `TypedArray`, или `DataView` с данными кэша кода V8 для предоставленного источника.
    -   `importModuleDynamically` {Функция} Вызывается во время оценки этого модуля при вызове `import()`. Если эта опция не указана, вызовы `import()` будут отклонены с [`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing). Эта опция является частью API экспериментальных модулей. Мы не рекомендуем использовать ее в производственной среде.
        -   `specifier` {строка} спецификатор, передаваемый в `import()`.
        -   `script` {vm.Script}
        -   `importAssertions` {Object} Значение `"assert"`, переданное в опциональном параметре [`optionsExpression`](https://tc39.es/proposal-import-assertions/#sec-evaluate-import-call), или пустой объект, если значение не было предоставлено.
        -   Возвращает: {Module Namespace Object|vm.Module} Возвращать `vm.Module` рекомендуется для того, чтобы воспользоваться преимуществами отслеживания ошибок и избежать проблем с пространствами имен, содержащими экспорт функций `then`.
    -   `microtaskMode` {строка} Если установлено значение `afterEvaluate`, микрозадачи (задачи, запланированные через `Promise` и `async function`) будут запущены сразу после выполнения скрипта. В этом случае они включаются в диапазоны `timeout` и `breakOnSigint`.
-   Возвращает: {любой} результат самого последнего оператора, выполненного в скрипте.

Команда `vm.runInNewContext()` сначала контекстирует заданный `contextObject` (или создает новый `contextObject`, если передан как `undefined`), компилирует `код`, запускает его в созданном контексте, а затем возвращает результат. Выполняемый код не имеет доступа к локальной области видимости.

Если `options` - строка, то она указывает имя файла.

Следующий пример компилирует и выполняет код, который увеличивает глобальную переменную и устанавливает новую. Эти глобальные переменные содержатся в `contextObject`.

```js
const vm = require('node:vm');

const contextObject = {
    animal: 'cat',
    count: 2,
};

vm.runInNewContext(
    'count += 1; name = "kitty"',
    contextObject
);
console.log(contextObject);
// Prints: { animal: 'cat', count: 3, name: 'kitty' }
```

## `vm.runInThisContext(code[, options])`

-   `code` {string} The JavaScript code to compile and run.
-   `options` {Object|string}
    -   `filename` {string} Specifies the filename used in stack traces produced by this script. **Default:** `'evalmachine.<anonymous>'`.
    -   `lineOffset` {number} Specifies the line number offset that is displayed in stack traces produced by this script. **Default:** `0`.
    -   `columnOffset` {number} Specifies the first-line column number offset that is displayed in stack traces produced by this script. **Default:** `0`.
    -   `displayErrors` {boolean} When `true`, if an [`Error`](errors.md#class-error) occurs while compiling the `code`, the line of code causing the error is attached to the stack trace. **Default:** `true`.
    -   `timeout` {integer} Specifies the number of milliseconds to execute `code` before terminating execution. If execution is terminated, an [`Error`](errors.md#class-error) will be thrown. This value must be a strictly positive integer.
    -   `breakOnSigint` {boolean} If `true`, receiving `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) will terminate execution and throw an [`Error`](errors.md#class-error). Существующие обработчики события, которые были подключены через `process.on('SIGINT')`, отключаются во время выполнения скрипта, но продолжают работать после этого. **По умолчанию:** `false`.
    -   `cachedData` {Buffer|TypedArray|DataView} Предоставляет необязательный `Buffer` или `TypedArray`, или `DataView` с данными кэша кода V8 для предоставленного источника.
    -   `importModuleDynamically` {Функция} Вызывается во время оценки этого модуля при вызове `import()`. Если эта опция не указана, вызовы `import()` будут отклонены с [`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`](errors.md#err_vm_dynamic_import_callback_missing). Эта опция является частью API экспериментальных модулей. Мы не рекомендуем использовать ее в производственной среде.
        -   `specifier` {строка} спецификатор, передаваемый в `import()`.
        -   `script` {vm.Script}
        -   `importAssertions` {Object} Значение `"assert"`, переданное в опциональном параметре [`optionsExpression`](https://tc39.es/proposal-import-assertions/#sec-evaluate-import-call), или пустой объект, если значение не было предоставлено.
        -   Возвращает: {Объект пространства имен модуля|vm.Module} Рекомендуется возвращать `vm.Module`, чтобы воспользоваться преимуществами отслеживания ошибок и избежать проблем с пространствами имен, содержащими экспорт функций `then`.
-   Возвращает: {любой} результат самого последнего оператора, выполненного в сценарии.

`vm.runInThisContext()` компилирует `код`, выполняет его в контексте текущего `global` и возвращает результат. Выполняемый код не имеет доступа к локальной области видимости, но имеет доступ к текущему объекту `global`.

Если `options` - строка, то она указывает имя файла.

Следующий пример иллюстрирует использование как `vm.runInThisContext()`, так и функции JavaScript [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) для выполнения одного и того же кода:

```js
const vm = require('node:vm');
let localVar = 'начальное значение';

const vmResult = vm.runInThisContext('localVar = "vm";');
console.log(
    `vmResult: '${vmResult}', localVar: '${localVar}'`
);
// Печатает: vmResult: 'vm', localVar: 'начальное значение'

const evalResult = eval('localVar = "eval";');
console.log(
    `evalResult: '${evalResult}', localVar: '${localVar}'`
);
// Печатает: evalResult: 'eval', localVar: 'eval'
```

Поскольку `vm.runInThisContext()` не имеет доступа к локальной области видимости, `localVar` остается неизменным. Напротив, [`eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) _имеет_ доступ к локальной области видимости, поэтому значение `localVar` изменяется. Таким образом, `vm.runInThisContext()` очень похож на [косвенный вызов `eval()`](https://es5.github.io/#x10.4.2), например, `(0,eval)('code')`.

## Пример: Запуск HTTP-сервера в виртуальной машине

При использовании [`script.runInThisContext()`](#scriptruninthiscontextoptions) или [`vm.runInThisContext()`](#vmruninthiscontextcode-options), код выполняется в текущем глобальном контексте V8. Код, переданный в этот контекст VM, будет иметь свою собственную изолированную область видимости.

Чтобы запустить простой веб-сервер, использующий модуль `node:http`, код, переданный в контекст, должен либо сам вызвать `require('node:http')`, либо иметь ссылку на модуль `node:http`. Например:

```js
'use strict';
const vm = require('node:vm');

const code = `
((require) => {
  const http = require('node:http');


  http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Hello World\n');
  }).listen(8124);


  console.log('Server running at http://127.0.0.1:8124/');
})`;

vm.runInThisContext(code)(require);
```

В приведенном выше случае `require()` разделяет состояние с контекстом, из которого оно передается. Это может создать риск при выполнении недоверенного кода, например, изменить объекты в контексте нежелательным образом.

## Что значит "контекстифицировать" объект?

Весь JavaScript, выполняемый в Node.js, работает в рамках "контекста". Согласно [V8 Embedder's Guide](https://v8.dev/docs/embed#contexts):

> В V8 контекст - это среда выполнения, которая позволяет отдельным, не связанным между собой приложениям JavaScript выполняться в одном экземпляре V8. Вы должны явно указать контекст, в котором будет выполняться любой код JavaScript.

Когда вызывается метод `vm.createContext()`, аргумент `contextObject` (или вновь созданный объект, если `contextObject` имеет значение `undefined`) ассоциируется с новым экземпляром V8 Context. Этот V8 Context предоставляет `коду`, выполняемому с помощью методов модуля `node:vm`, изолированную глобальную среду, в которой он может работать. Процесс создания V8 Context и ассоциирования его с `contextObject` - это то, что в данном документе называется "контекстированием" объекта.

## Взаимодействие по таймауту с асинхронными задачами и Promises

`Promise` и `async function` могут планировать задачи, выполняемые движком JavaScript асинхронно. По умолчанию эти задачи запускаются после завершения выполнения всех функций JavaScript в текущем стеке. Это позволяет избежать функциональности опций `timeout` и `breakOnSigint`.

Например, следующий код, выполняемый `vm.runInNewContext()` с таймаутом в 5 миллисекунд, планирует бесконечный цикл для запуска после разрешения обещания. Запланированный цикл никогда не прерывается по таймауту:

```js
const vm = require('node:vm');

function loop() {
    console.log('входим в цикл');
    while (1) console.log(Date.now());
}

vm.runInNewContext(
    'Promise.resolve().then(() => loop());',
    { loop, console },
    { timeout: 5 }
);
// Это выводится *до* "входа в цикл" (!)
console.log('done executing');
```

Это можно решить, передав `microtaskMode: 'afterEvaluate'` в код, который создает `Context`:

```js
const vm = require('node:vm');

function loop() {
    while (1) console.log(Date.now());
}

vm.runInNewContext(
    'Promise.resolve().then(() => loop());',
    { loop, console },
    { timeout: 5, microtaskMode: 'afterEvaluate' }
);
```

В этом случае микрозадача, запланированная через `promise.then()`, будет запущена до возврата из `vm.runInNewContext()`, и будет прервана функцией `timeout`. Это относится только к коду, выполняющемуся в `vm.Context`, поэтому, например, [`vm.runInThisContext()`](#vmruninthiscontextcode-options) не принимает эту опцию.

Обратные вызовы Promise заносятся в очередь микрозадач того контекста, в котором они были созданы. Например, если в примере выше заменить `() => loop()` на просто `loop`, то `loop` будет помещена в глобальную очередь микрозадач, поскольку она является функцией из внешнего (основного) контекста, и, таким образом, также сможет избежать таймаута.

Если внутри `vm.Context` доступны функции асинхронного планирования, такие как `process.nextTick()`, `queueMicrotask()`, `setTimeout()`, `setImmediate()` и т.д., то переданные им функции будут добавлены в глобальные очереди, общие для всех контекстов. Поэтому обратные вызовы, переданные этим функциям, также не контролируются через таймаут.
