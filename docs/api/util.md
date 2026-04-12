---
title: Util
description: Модуль node:util — вспомогательные функции для внутренних API Node.js и прикладного кода
---

# Util

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/util.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/util.js -->

Модуль `node:util` обслуживает внутренние API Node.js; многие утилиты полезны и
в приложениях. Подключение:

=== "MJS"

    ```js
    import util from 'node:util';
    ```

=== "CJS"

    ```js
    const util = require('node:util');
    ```

## `util.callbackify(original)`

<!-- YAML
added: v8.2.0
-->

* `original` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Асинхронная функция
* Возвращает: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функцию в стиле колбэка с ошибкой первым аргументом

Принимает `async`-функцию (или функцию, возвращающую `Promise`) и возвращает
обёртку в стиле error-first: последний аргумент — `(err, value) => ...`. В
колбэке первый аргумент — причина отклонения (или `null` при выполнении),
второй — результат промиса.

=== "MJS"

    ```js
    import { callbackify } from 'node:util';
    
    async function fn() {
      return 'hello world';
    }
    const callbackFunction = callbackify(fn);
    
    callbackFunction((err, ret) => {
      if (err) throw err;
      console.log(ret);
    });
    ```

=== "CJS"

    ```js
    const { callbackify } = require('node:util');
    
    async function fn() {
      return 'hello world';
    }
    const callbackFunction = callbackify(fn);
    
    callbackFunction((err, ret) => {
      if (err) throw err;
      console.log(ret);
    });
    ```

Выведет:

```text
hello world
```

Колбэк выполняется асинхронно со «укороченным» стеком. Если колбэк выбросит
исключение, процесс испустит [`'uncaughtException'`][], и при отсутствии
обработчика завершится.

Так как `null` особый для первого аргумента колбэка, при отклонении промиса с
ложным значением оно оборачивается в `Error` с полем `reason`.

```js
function fn() {
  return Promise.reject(null);
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  // When the Promise was rejected with `null` it is wrapped with an Error and
  // the original value is stored in `reason`.
  err && Object.hasOwn(err, 'reason') && err.reason === null;  // true
});
```

## `util.convertProcessSignalToExitCode(signal)`

<!-- YAML
added:
 - v25.4.0
 - v24.14.0
-->

* `signal` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сигнала (например `'SIGTERM'`)
* Возвращает: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, соответствующий `signal`

`util.convertProcessSignalToExitCode()` преобразует имя сигнала в код выхода POSIX.
По POSIX код для завершения по сигналу: `128 + номер сигнала`.

При недопустимом имени сигнала выбрасывается ошибка. Список сигналов: [`signal(7)`][].

=== "MJS"

    ```js
    import { convertProcessSignalToExitCode } from 'node:util';
    
    console.log(convertProcessSignalToExitCode('SIGTERM')); // 143 (128 + 15)
    console.log(convertProcessSignalToExitCode('SIGKILL')); // 137 (128 + 9)
    ```

=== "CJS"

    ```js
    const { convertProcessSignalToExitCode } = require('node:util');
    
    console.log(convertProcessSignalToExitCode('SIGTERM')); // 143 (128 + 15)
    console.log(convertProcessSignalToExitCode('SIGKILL')); // 137 (128 + 9)
    ```

Удобно при работе с процессами, чтобы по сигналу завершения получить код выхода.

## `util.debuglog(section[, callback])`

<!-- YAML
added: v0.11.3
-->

* `section` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Идентификатор части приложения, для которой создаётся `debuglog`.
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при первом обращении к логгеру и получает более
  оптимизированную функцию логирования.
* Возвращает: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция логирования

`util.debuglog()` создаёт функцию, которая при совпадении имени `section` с переменной
окружения `NODE_DEBUG` пишет отладочные сообщения в `stderr` (по смыслу как
[`console.error()`][]); иначе функция ничего не делает.

=== "MJS"

    ```js
    import { debuglog } from 'node:util';
    const log = debuglog('foo');
    
    log('hello from foo [%d]', 123);
    ```

=== "CJS"

    ```js
    const { debuglog } = require('node:util');
    const log = debuglog('foo');
    
    log('hello from foo [%d]', 123);
    ```

При запуске с `NODE_DEBUG=foo` вывод будет примерно таким:

```console
FOO 3245: hello from foo [123]
```

`3245` — PID процесса. Без этой переменной окружения ничего не печатается.

Имя `section` поддерживает шаблон `*`:

=== "MJS"

    ```js
    import { debuglog } from 'node:util';
    const log = debuglog('foo-bar');
    
    log('hi there, it\'s foo-bar [%d]', 2333);
    ```

=== "CJS"

    ```js
    const { debuglog } = require('node:util');
    const log = debuglog('foo-bar');
    
    log('hi there, it\'s foo-bar [%d]', 2333);
    ```

при `NODE_DEBUG=foo*` вывод будет примерно таким:

```console
FOO-BAR 3257: hi there, it's foo-bar [2333]
```

В `NODE_DEBUG` можно перечислить несколько секций через запятую: `NODE_DEBUG=fs,net,tls`.

Необязательный `callback` заменяет функцию логирования на более подходящую без лишних обёрток.

=== "MJS"

    ```js
    import { debuglog } from 'node:util';
    let log = debuglog('internals', (debug) => {
      // Replace with a logging function that optimizes out
      // testing if the section is enabled
      log = debug;
    });
    ```

=== "CJS"

    ```js
    const { debuglog } = require('node:util');
    let log = debuglog('internals', (debug) => {
      // Replace with a logging function that optimizes out
      // testing if the section is enabled
      log = debug;
    });
    ```

### `debuglog().enabled`

<!-- YAML
added: v14.9.0
-->

* Type: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Геттер `util.debuglog().enabled` удобен для проверок в условиях: зависит ли имя `section` от переменной окружения `NODE_DEBUG`.
Если имя `section` входит в значение этой переменной, возвращается `true`, иначе — `false`.

=== "MJS"

    ```js
    import { debuglog } from 'node:util';
    const enabled = debuglog('foo').enabled;
    if (enabled) {
      console.log('hello from foo [%d]', 123);
    }
    ```

=== "CJS"

    ```js
    const { debuglog } = require('node:util');
    const enabled = debuglog('foo').enabled;
    if (enabled) {
      console.log('hello from foo [%d]', 123);
    }
    ```

Если программу запустить с `NODE_DEBUG=foo` в окружении, вывод будет примерно таким:

```console
hello from foo [123]
```

## `util.debug(section)`

<!-- YAML
added: v14.9.0
-->

Псевдоним `util.debuglog`. Имя `debug` читается естественнее, когда нужна только проверка `util.debuglog().enabled` без логирования.

## `util.deprecate(fn, msg[, code[, options]])`

<!-- YAML
added: v0.8.0
changes:
  - version:
      - v25.2.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/59982
    description: Add options object with modifyPrototype to conditionally
                 modify the prototype of the deprecated object.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/16393
    description: Deprecation warnings are only emitted once for each code.
-->

Добавлено в: v0.8.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.2.0, v24.12.0 | Добавьте объект параметров с помощью EditPrototype, чтобы условно изменить прототип устаревшего объекта. |
    | v10.0.0 | Предупреждения об устаревании выдаются только один раз для каждого кода. |

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Помечаемая как устаревшая функция.
* `msg` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст предупреждения при вызове устаревшей функции.
* `code` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код устаревания. Список кодов — в [списке устаревших API][].
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `modifyPrototype` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если false — не менять прототип объекта при выводе предупреждения.
    **По умолчанию:** `true`.
* Returns: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обёртка над устаревшей функцией с выводом предупреждения.

Метод `util.deprecate()` оборачивает `fn` (функцию или класс) так, что она помечена как устаревшая.

=== "MJS"

    ```js
    import { deprecate } from 'node:util';
    
    export const obsoleteFunction = deprecate(() => {
      // Do something here.
    }, 'obsoleteFunction() is deprecated. Use newShinyFunction() instead.');
    ```

=== "CJS"

    ```js
    const { deprecate } = require('node:util');
    
    exports.obsoleteFunction = deprecate(() => {
      // Do something here.
    }, 'obsoleteFunction() is deprecated. Use newShinyFunction() instead.');
    ```

При вызове `util.deprecate()` возвращается функция, которая выдаёт `DeprecationWarning` через событие [`'warning'`][]. Предупреждение выводится в `stderr` при первом вызове возвращаемой функции; затем вызывается обёрнутая функция без повторного предупреждения.

Если в нескольких вызовах `util.deprecate()` указан один и тот же необязательный `code`, предупреждение выводится только один раз для этого `code`.

=== "MJS"

    ```js
    import { deprecate } from 'node:util';
    
    const fn1 = deprecate(
      () => 'a value',
      'deprecation message',
      'DEP0001',
    );
    const fn2 = deprecate(
      () => 'a  different value',
      'other dep message',
      'DEP0001',
    );
    fn1(); // Emits a deprecation warning with code DEP0001
    fn2(); // Does not emit a deprecation warning because it has the same code
    ```

=== "CJS"

    ```js
    const { deprecate } = require('node:util');
    
    const fn1 = deprecate(
      function() {
        return 'a value';
      },
      'deprecation message',
      'DEP0001',
    );
    const fn2 = deprecate(
      function() {
        return 'a  different value';
      },
      'other dep message',
      'DEP0001',
    );
    fn1(); // Emits a deprecation warning with code DEP0001
    fn2(); // Does not emit a deprecation warning because it has the same code
    ```

Если заданы флаги `--no-deprecation` или `--no-warnings`, либо свойство `process.noDeprecation` установлено в `true` _до_ первого предупреждения об устаревании, `util.deprecate()` ничего не делает.

Если заданы `--trace-deprecation` или `--trace-warnings`, либо `process.traceDeprecation` равен `true`, при первом вызове устаревшей функции в `stderr` выводятся предупреждение и трассировка стека.

Если задан `--throw-deprecation` или `process.throwDeprecation` равен `true`, при вызове устаревшей функции выбрасывается исключение.

`--throw-deprecation` и `process.throwDeprecation` имеют приоритет над `--trace-deprecation` и `process.traceDeprecation`.

## `util.diff(actual, expected)`

<!-- YAML
added:
  - v23.11.0
  - v22.15.0
-->

> Стабильность: 1 — экспериментальная

* `actual` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Первое сравниваемое значение

* `expected` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Второе сравниваемое значение

* Returns: [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив записей различий; каждая запись — массив из двух элементов:
  * `0` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код операции: `-1` удаление, `0` без изменений, `1` вставка
  * `1` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение, связанное с операцией

* Сложность алгоритма: O(N*D), где:

* N — суммарная длина двух последовательностей (N = actual.length + expected.length)

* D — расстояние редактирования (минимальное число операций для превращения одной последовательности в другую).

[`util.diff()`][] сравнивает две строки или массива и возвращает массив записей различий.
Используется алгоритм Майерса для минимальных отличий — тот же, что и во внутренних сообщениях assert.

При равных значениях возвращается пустой массив.

```js
const { diff } = require('node:util');

// Comparing strings
const actualString = '12345678';
const expectedString = '12!!5!7!';
console.log(diff(actualString, expectedString));
// [
//   [0, '1'],
//   [0, '2'],
//   [1, '3'],
//   [1, '4'],
//   [-1, '!'],
//   [-1, '!'],
//   [0, '5'],
//   [1, '6'],
//   [-1, '!'],
//   [0, '7'],
//   [1, '8'],
//   [-1, '!'],
// ]
// Comparing arrays
const actualArray = ['1', '2', '3'];
const expectedArray = ['1', '3', '4'];
console.log(diff(actualArray, expectedArray));
// [
//   [0, '1'],
//   [1, '2'],
//   [0, '3'],
//   [-1, '4'],
// ]
// Equal values return empty array
console.log(diff('same', 'same'));
// []
```

## `util.format(format[, ...args])`

<!-- YAML
added: v0.5.3
changes:
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29606
    description: The `%c` specifier is ignored now.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/23162
    description: The `format` argument is now only taken as such if it actually
                 contains format specifiers.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/23162
    description: If the `format` argument is not a format string, the output
                 string's formatting is no longer dependent on the type of the
                 first argument. This change removes previously present quotes
                 from strings that were being output when the first argument
                 was not a string.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/23708
    description: The `%d`, `%f`, and `%i` specifiers now support Symbols
                 properly.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/24806
    description: The `%o` specifier's `depth` has default depth of 4 again.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/17907
    description: The `%o` specifier's `depth` option will now fall back to the
                 default depth.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/22097
    description: The `%d` and `%i` specifiers now support BigInt.
  - version: v8.4.0
    pr-url: https://github.com/nodejs/node/pull/14558
    description: The `%o` and `%O` specifiers are supported now.
-->

Добавлено в: v0.5.3

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v12.11.0 | Спецификатор %c теперь игнорируется. |
    | v12.0.0 | Аргумент `format` теперь принимается как таковой только в том случае, если он действительно содержит спецификаторы формата. |
    | v12.0.0 | Если аргумент «формат» не является строкой формата, форматирование выходной строки больше не зависит от типа первого аргумента. Это изменение удаляет ранее существовавшие кавычки из строк, которые выводились, когда первый аргумент не был строкой. |
    | v11.4.0 | Спецификаторы `%d`, `%f` и `%i` теперь правильно поддерживают символы. |
    | v11.4.0 | Глубина спецификатора `%o` снова имеет глубину по умолчанию 4. |
    | v11.0.0 | Опция «глубина» спецификатора `%o` теперь вернется к глубине по умолчанию. |
    | v10.12.0 | Спецификаторы `%d` и `%i` теперь поддерживают BigInt. |
    | v8.4.0 | Спецификаторы `%o` и `%O` теперь поддерживаются. |

* `format` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка формата в стиле `printf`.

Метод `util.format()` возвращает отформатированную строку: первый аргумент —
 строка формата с нулём или более спецификаторами; каждый спецификатор заменяется
преобразованным значением соответствующего аргумента. Поддерживаемые спецификаторы:

* `%s`: для преобразования используется `String` для всех значений, кроме `BigInt`, `Object`
  и `-0`. Значения `BigInt` дополняются суффиксом `n`; объекты без пользовательских
  `toString` и `Symbol.toPrimitive` проходят через `util.inspect()`
  с опциями `{ depth: 0, colors: false, compact: 3 }`.
* `%d`: `Number` для всех значений, кроме `BigInt` и `Symbol`.
* `%i`: `parseInt(value, 10)` для всех значений, кроме `BigInt` и `Symbol`.
* `%f`: `parseFloat(value)` для всех значений, кроме `Symbol`.
* `%j`: JSON; при циклических ссылках подставляется строка `'[Circular]'`.
* `%o`: `Object`. Строковое представление объекта в общем стиле JS;
  как `util.inspect()` с `{ showHidden: true, showProxy: true }` — видны
  неперечисляемые свойства и прокси.
* `%O`: `Object`. Как `util.inspect()` без опций — без неперечисляемых свойств и прокси.
* `%c`: `CSS`. Спецификатор игнорируется вместе с переданным CSS.
* `%%`: один знак `%`. Аргумент не потребляет.
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Отформатированная строка

Если спецификатору не хватает аргумента, он не заменяется:

```js
util.format('%s:%s', 'foo');
// Returns: 'foo:%s'
```

Значения вне строки формата при типе не `string` форматируются через `util.inspect()`.

Если аргументов больше, чем спецификаторов, лишние дописываются к результату через пробел:

```js
util.format('%s:%s', 'foo', 'bar', 'baz');
// Returns: 'foo:bar baz'
```

Если в первом аргументе нет валидного спецификатора, `util.format()` возвращает
склеивание всех аргументов через пробел:

```js
util.format(1, 2, 3);
// Returns: '1 2 3'
```

Если передан только один аргумент, он возвращается без форматирования:

```js
util.format('%% %s');
// Returns: '%% %s'
```

`util.format()` — синхронный метод для отладки. Некоторые входные значения могут
сильно нагрузить цикл событий; не используйте в горячих участках кода.

## `util.formatWithOptions(inspectOptions, format[, ...args])`

<!-- YAML
added: v10.0.0
-->

* `inspectOptions` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `format` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Как [`util.format()`][], но дополнительно принимает `inspectOptions` — опции для
[`util.inspect()`][].

```js
util.formatWithOptions({ colors: true }, 'See object %O', { foo: 42 });
// Returns 'See object { foo: 42 }', where `42` is colored as a number
// when printed to a terminal.
```

## `util.getCallSites([frameCount][, options])`

<!-- YAML
added: v22.9.0
changes:
  - version:
    - v23.7.0
    - v22.14.0
    pr-url: https://github.com/nodejs/node/pull/56584
    description: Property `column` is deprecated in favor of `columnNumber`.
  - version:
    - v23.7.0
    - v22.14.0
    pr-url: https://github.com/nodejs/node/pull/56551
    description: Property `CallSite.scriptId` is exposed.
  - version:
    - v23.3.0
    - v22.12.0
    pr-url: https://github.com/nodejs/node/pull/55626
    description: The API is renamed from `util.getCallSite` to `util.getCallSites()`.
-->

Добавлено в: v22.9.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.7.0, v22.14.0 | Свойство «column» устарело в пользу «columnNumber». |
    | v23.7.0, v22.14.0 | Доступно свойство CallSite.scriptId. |
    | v23.3.0, v22.12.0 | API переименован с util.getCallSite на util.getCallSites(). |

> Стабильность: 1.1 — активная разработка

* `frameCount` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько кадров стека захватить как объекты call site.
  **По умолчанию:** `10`. Допустимый диапазон 1–200.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательно
  * `sourceMap` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Восстанавливать исходное место в стеке по source map;
    по умолчанию включается с флагом `--enable-source-maps`.
* Returns: [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Массив объектов call site
  * `functionName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя функции для этого call site.
  * `scriptName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя ресурса со скриптом для этой функции.
  * `scriptId` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Уникальный идентификатор скрипта, как в протоколе Chrome DevTools [`Runtime.ScriptId`][].
  * `lineNumber` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер строки в JS (с 1).
  * `columnNumber` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер колонки в JS (с 1).

Возвращает массив call site со стеком вызывающей функции.

В отличие от чтения `error.stack`, результат этого API не проходит через
`Error.prepareStackTrace`.

=== "MJS"

    ```js
    import { getCallSites } from 'node:util';
    
    function exampleFunction() {
      const callSites = getCallSites();
    
      console.log('Call Sites:');
      callSites.forEach((callSite, index) => {
        console.log(`CallSite ${index + 1}:`);
        console.log(`Function Name: ${callSite.functionName}`);
        console.log(`Script Name: ${callSite.scriptName}`);
        console.log(`Line Number: ${callSite.lineNumber}`);
        console.log(`Column Number: ${callSite.columnNumber}`);
      });
      // CallSite 1:
      // Function Name: exampleFunction
      // Script Name: /home/example.js
      // Line Number: 5
      // Column Number: 26
    
      // CallSite 2:
      // Function Name: anotherFunction
      // Script Name: /home/example.js
      // Line Number: 22
      // Column Number: 3
    
      // ...
    }
    
    // A function to simulate another stack layer
    function anotherFunction() {
      exampleFunction();
    }
    
    anotherFunction();
    ```

=== "CJS"

    ```js
    const { getCallSites } = require('node:util');
    
    function exampleFunction() {
      const callSites = getCallSites();
    
      console.log('Call Sites:');
      callSites.forEach((callSite, index) => {
        console.log(`CallSite ${index + 1}:`);
        console.log(`Function Name: ${callSite.functionName}`);
        console.log(`Script Name: ${callSite.scriptName}`);
        console.log(`Line Number: ${callSite.lineNumber}`);
        console.log(`Column Number: ${callSite.columnNumber}`);
      });
      // CallSite 1:
      // Function Name: exampleFunction
      // Script Name: /home/example.js
      // Line Number: 5
      // Column Number: 26
    
      // CallSite 2:
      // Function Name: anotherFunction
      // Script Name: /home/example.js
      // Line Number: 22
      // Column Number: 3
    
      // ...
    }
    
    // A function to simulate another stack layer
    function anotherFunction() {
      exampleFunction();
    }
    
    anotherFunction();
    ```

Исходные позиции в стеке можно восстановить, задав `sourceMap: true`.
Если source map недоступна, исходное место совпадает с текущим.
С флагом `--enable-source-maps` по умолчанию `sourceMap` считается истинным.

```ts
import { getCallSites } from 'node:util';

interface Foo {
  foo: string;
}

const callSites = getCallSites({ sourceMap: true });

// With sourceMap:
// Function Name: ''
// Script Name: example.js
// Line Number: 7
// Column Number: 26

// Without sourceMap:
// Function Name: ''
// Script Name: example.js
// Line Number: 2
// Column Number: 26
```

=== "CJS"

    ```js
    const { getCallSites } = require('node:util');
    
    const callSites = getCallSites({ sourceMap: true });
    
    // With sourceMap:
    // Function Name: ''
    // Script Name: example.js
    // Line Number: 7
    // Column Number: 26
    
    // Without sourceMap:
    // Function Name: ''
    // Script Name: example.js
    // Line Number: 2
    // Column Number: 26
    ```

## `util.getSystemErrorName(err)`

<!-- YAML
added: v9.7.0
-->

* `err` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строковое имя числового кода ошибки из API Node.js.
Соответствие кодов и имён зависит от платформы.
Имена распространённых ошибок см. в [Common System Errors][].

```js
fs.access('file/that/does/not/exist', (err) => {
  const name = util.getSystemErrorName(err.errno);
  console.error(name);  // ENOENT
});
```

## `util.getSystemErrorMap()`

<!-- YAML
added:
  - v16.0.0
  - v14.17.0
-->

* Returns: [<Map>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

Возвращает `Map` всех кодов системных ошибок, доступных из API Node.js.
Соответствие кодов и имён зависит от платформы.
Имена распространённых ошибок см. в [Common System Errors][].

```js
fs.access('file/that/does/not/exist', (err) => {
  const errorMap = util.getSystemErrorMap();
  const name = errorMap.get(err.errno);
  console.error(name);  // ENOENT
});
```

## `util.getSystemErrorMessage(err)`

<!-- YAML
added:
  - v23.1.0
  - v22.12.0
-->

* `err` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строковое сообщение для числового кода ошибки из API Node.js.
Соответствие кодов и текстов сообщений зависит от платформы.

```js
fs.access('file/that/does/not/exist', (err) => {
  const message = util.getSystemErrorMessage(err.errno);
  console.error(message);  // No such file or directory
});
```

## `util.setTraceSigInt(enable)`

<!-- YAML
added:
 - v24.6.0
 - v22.19.0
-->

* `enable` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Включает или отключает вывод трассировки стека при `SIGINT`. Доступно только в главном потоке.

## `util.inherits(constructor, superConstructor)`

<!-- YAML
added: v0.3.0
changes:
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3455
    description: The `constructor` parameter can refer to an ES6 class now.
-->

Добавлено в: v0.3.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v5.0.0 | Параметр `constructor` теперь может ссылаться на класс ES6. |

> Стабильность: 3 — устаревшее: используйте синтаксис классов ES2015 и ключевое слово `extends`.

* `constructor` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `superConstructor` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Использование `util.inherits()` не рекомендуется. Лучше ключевые слова ES6 `class` и
`extends` для наследования на уровне языка. Стили [semantically incompatible][].

Копирует методы прототипа из одного [constructor][] в другой. Прототип `constructor`
становится объектом, созданным из `superConstructor`.

По сути добавляет проверку входных данных к
`Object.setPrototypeOf(constructor.prototype, superConstructor.prototype)`.
Дополнительно `superConstructor` доступен как `constructor.super_`.

```js
const util = require('node:util');
const EventEmitter = require('node:events');

function MyStream() {
  EventEmitter.call(this);
}

util.inherits(MyStream, EventEmitter);

MyStream.prototype.write = function(data) {
  this.emit('data', data);
};

const stream = new MyStream();

console.log(stream instanceof EventEmitter); // true
console.log(MyStream.super_ === EventEmitter); // true

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('It works!'); // Received data: "It works!"
```

ES6 example using `class` and `extends`:

=== "MJS"

    ```js
    import EventEmitter from 'node:events';
    
    class MyStream extends EventEmitter {
      write(data) {
        this.emit('data', data);
      }
    }
    
    const stream = new MyStream();
    
    stream.on('data', (data) => {
      console.log(`Received data: "${data}"`);
    });
    stream.write('With ES6');
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    
    class MyStream extends EventEmitter {
      write(data) {
        this.emit('data', data);
      }
    }
    
    const stream = new MyStream();
    
    stream.on('data', (data) => {
      console.log(`Received data: "${data}"`);
    });
    stream.write('With ES6');
    ```

## `util.inspect(object[, options])`

## `util.inspect(object[, showHidden[, depth[, colors]]])`

<!-- YAML
added: v0.3.0
changes:
  - version:
    - v25.0.0
    pr-url: https://github.com/nodejs/node/pull/59710
    description: The util.inspect.styles.regexp style is now a method that is
                 invoked for coloring the stringified regular expression.
  - version:
    - v17.3.0
    - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41003
    description: The `numericSeparator` option is supported now.
  - version: v16.18.0
    pr-url: https://github.com/nodejs/node/pull/43576
    description: add support for `maxArrayLength` when inspecting `Set` and `Map`.
  - version:
    - v14.6.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33690
    description: If `object` is from a different `vm.Context` now, a custom
                 inspection function on it will not receive context-specific
                 arguments anymore.
  - version:
     - v13.13.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32392
    description: The `maxStringLength` option is supported now.
  - version:
     - v13.5.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30768
    description: User defined prototype properties are inspected in case
                 `showHidden` is `true`.
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27685
    description: Circular references now include a marker to the reference.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27109
    description: The `compact` options default is changed to `3` and the
                 `breakLength` options default is changed to `80`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/24971
    description: Internal properties no longer appear in the context argument
                 of a custom inspection function.
  - version: v11.11.0
    pr-url: https://github.com/nodejs/node/pull/26269
    description: The `compact` option accepts numbers for a new output mode.
  - version: v11.7.0
    pr-url: https://github.com/nodejs/node/pull/25006
    description: ArrayBuffers now also show their binary contents.
  - version: v11.5.0
    pr-url: https://github.com/nodejs/node/pull/24852
    description: The `getters` option is supported now.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/24326
    description: The `depth` default changed back to `2`.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22846
    description: The `depth` default changed to `20`.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22756
    description: The inspection output is now limited to about 128 MiB. Data
                 above that size will not be fully inspected.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/22788
    description: The `sorted` option is supported now.
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/20725
    description: Inspecting linked lists and similar objects is now possible
                 up to the maximum call stack size.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19259
    description: The `WeakMap` and `WeakSet` entries can now be inspected
                 as well.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/17576
    description: The `compact` option is supported now.
  - version: v6.6.0
    pr-url: https://github.com/nodejs/node/pull/8174
    description: Custom inspection functions can now return `this`.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/7499
    description: The `breakLength` option is supported now.
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/6334
    description: The `maxArrayLength` option is supported now; in particular,
                 long arrays are truncated by default.
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/6465
    description: The `showProxy` option is supported now.
-->

Добавлено в: v0.3.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Стиль util.inspect.styles.regexp теперь является методом, который вызывается для раскрашивания строкового регулярного выражения. |
    | v17.3.0, v16.14.0 | Опция numericSeparator теперь поддерживается. |
    | v16.18.0 | добавить поддержку maxArrayLength при проверке Set и Map. |
    | v14.6.0, v12.19.0 | Если «объект» теперь принадлежит другому «vm.Context», пользовательская функция проверки на нем больше не будет получать аргументы, зависящие от контекста. |
    | v13.13.0, v12.17.0 | Опция `maxStringLength` теперь поддерживается. |
    | v13.5.0, v12.16.0 | Определенные пользователем свойства прототипа проверяются, если `showHidden` имеет значение `true`. |
    | v13.0.0 | Круговые ссылки теперь включают в себя маркер ссылки. |
    | v12.0.0 | Значение по умолчанию для параметра `compact` изменено на `3`, а значение по умолчанию для параметра `breakLength` изменено на `80`. |
    | v12.0.0 | Внутренние свойства больше не отображаются в аргументе контекста пользовательской функции проверки. |
    | v11.11.0 | Опция `compact` принимает числа для нового режима вывода. |
    | v11.7.0 | ArrayBuffers теперь также отображают свое двоичное содержимое. |
    | v11.5.0 | Опция getters теперь поддерживается. |
    | v11.4.0 | Значение глубины по умолчанию снова изменено на «2». |
    | v11.0.0 | Значение глубины по умолчанию изменено на «20». |
    | v11.0.0 | Выходные данные проверки теперь ограничены примерно 128 МБ. Данные, превышающие этот размер, не будут полностью проверены. |
    | v10.12.0 | Опция `sorted` теперь поддерживается. |
    | v10.6.0 | Проверка связанных списков и подобных объектов теперь возможна до максимального размера стека вызовов. |
    | v10.0.0 | Записи WeakMap и WeakSet теперь также можно проверить. |
    | v9.9.0 | Опция `compact` теперь поддерживается. |
    | v6.6.0 | Пользовательские функции проверки теперь могут возвращать `this`. |
    | v6.3.0 | Опция `breakLength` теперь поддерживается. |
    | v6.1.0 | Опция maxArrayLength теперь поддерживается; в частности, длинные массивы по умолчанию усекаются. |
    | v6.1.0 | Опция `showProxy` теперь поддерживается. |

* `object` {any} Any JavaScript primitive or `Object`.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `showHidden` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, `object`'s non-enumerable symbols and
    properties are included in the formatted result. [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) and
    [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries are also included as well as user defined prototype
    properties (excluding method properties). **Default:** `false`.
  * `depth` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Specifies the number of times to recurse while formatting
    `object`. This is useful for inspecting large objects. To recurse up to
    the maximum call stack size pass `Infinity` or `null`.
    **Default:** `2`.
  * `colors` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, the output is styled with ANSI color
    codes. Colors are customizable. See [Customizing `util.inspect` colors][].
    **Default:** `false`.
  * `customInspect` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `false`,
    `[util.inspect.custom](depth, opts, inspect)` functions are not invoked.
    **Default:** `true`.
  * `showProxy` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, `Proxy` inspection includes
    the [`target` and `handler`][] objects. **Default:** `false`.
  * `maxArrayLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Specifies the maximum number of `Array`,
    [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), and [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) elements to include when formatting.
    Set to `null` or `Infinity` to show all elements. Set to `0` or
    negative to show no elements. **Default:** `100`.
  * `maxStringLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Specifies the maximum number of characters to
    include when formatting. Set to `null` or `Infinity` to show all elements.
    Set to `0` or negative to show no characters. **Default:** `10000`.
  * `breakLength` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The length at which input values are split across
    multiple lines. Set to `Infinity` to format the input as a single line
    (in combination with `compact` set to `true` or any number >= `1`).
    **Default:** `80`.
  * `compact` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Setting this to `false` causes each object key
    to be displayed on a new line. It will break on new lines in text that is
    longer than `breakLength`. If set to a number, the most `n` inner elements
    are united on a single line as long as all properties fit into
    `breakLength`. Short array elements are also grouped together. For more
    information, see the example below. **Default:** `3`.
  * `sorted` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) If set to `true` or a function, all properties
    of an object, and `Set` and `Map` entries are sorted in the resulting
    string. If set to `true` the [default sort][] is used. If set to a function,
    it is used as a [compare function][].
  * `getters` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If set to `true`, getters are inspected. If set
    to `'get'`, only getters without a corresponding setter are inspected. If
    set to `'set'`, only getters with a corresponding setter are inspected.
    This might cause side effects depending on the getter function.
    **Default:** `false`.
  * `numericSeparator` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `true`, an underscore is used to
    separate every three digits in all bigints and numbers.
    **Default:** `false`.
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The representation of `object`.

The `util.inspect()` method returns a string representation of `object` that is
intended for debugging. The output of `util.inspect` may change at any time
and should not be depended upon programmatically. Additional `options` may be
passed that alter the result.
`util.inspect()` will use the constructor's name and/or `Symbol.toStringTag`
property to make an identifiable tag for an inspected value.

```js
class Foo {
  get [Symbol.toStringTag]() {
    return 'bar';
  }
}

class Bar {}

const baz = Object.create(null, { [Symbol.toStringTag]: { value: 'foo' } });

util.inspect(new Foo()); // 'Foo [bar] {}'
util.inspect(new Bar()); // 'Bar {}'
util.inspect(baz);       // '[foo] {}'
```

Circular references point to their anchor by using a reference index:

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    
    const obj = {};
    obj.a = [obj];
    obj.b = {};
    obj.b.inner = obj.b;
    obj.b.obj = obj;
    
    console.log(inspect(obj));
    // <ref *1> {
    //   a: [ [Circular *1] ],
    //   b: <ref *2> { inner: [Circular *2], obj: [Circular *1] }
    // }
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    
    const obj = {};
    obj.a = [obj];
    obj.b = {};
    obj.b.inner = obj.b;
    obj.b.obj = obj;
    
    console.log(inspect(obj));
    // <ref *1> {
    //   a: [ [Circular *1] ],
    //   b: <ref *2> { inner: [Circular *2], obj: [Circular *1] }
    // }
    ```

The following example inspects all properties of the `util` object:

=== "MJS"

    ```js
    import util from 'node:util';
    
    console.log(util.inspect(util, { showHidden: true, depth: null }));
    ```

=== "CJS"

    ```js
    const util = require('node:util');
    
    console.log(util.inspect(util, { showHidden: true, depth: null }));
    ```

The following example highlights the effect of the `compact` option:

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    
    const o = {
      a: [1, 2, [[
        'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit, sed do ' +
          'eiusmod \ntempor incididunt ut labore et dolore magna aliqua.',
        'test',
        'foo']], 4],
      b: new Map([['za', 1], ['zb', 'test']]),
    };
    console.log(inspect(o, { compact: true, depth: 5, breakLength: 80 }));
    
    // { a:
    //   [ 1,
    //     2,
    //     [ [ 'Lorem ipsum dolor sit amet,\nconsectetur [...]', // A long line
    //           'test',
    //           'foo' ] ],
    //     4 ],
    //   b: Map(2) { 'za' => 1, 'zb' => 'test' } }
    
    // Setting `compact` to false or an integer creates more reader friendly output.
    console.log(inspect(o, { compact: false, depth: 5, breakLength: 80 }));
    
    // {
    //   a: [
    //     1,
    //     2,
    //     [
    //       [
    //         'Lorem ipsum dolor sit amet,\n' +
    //           'consectetur adipiscing elit, sed do eiusmod \n' +
    //           'tempor incididunt ut labore et dolore magna aliqua.',
    //         'test',
    //         'foo'
    //       ]
    //     ],
    //     4
    //   ],
    //   b: Map(2) {
    //     'za' => 1,
    //     'zb' => 'test'
    //   }
    // }
    
    // Setting `breakLength` to e.g. 150 will print the "Lorem ipsum" text in a
    // single line.
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    
    const o = {
      a: [1, 2, [[
        'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit, sed do ' +
          'eiusmod \ntempor incididunt ut labore et dolore magna aliqua.',
        'test',
        'foo']], 4],
      b: new Map([['za', 1], ['zb', 'test']]),
    };
    console.log(inspect(o, { compact: true, depth: 5, breakLength: 80 }));
    
    // { a:
    //   [ 1,
    //     2,
    //     [ [ 'Lorem ipsum dolor sit amet,\nconsectetur [...]', // A long line
    //           'test',
    //           'foo' ] ],
    //     4 ],
    //   b: Map(2) { 'za' => 1, 'zb' => 'test' } }
    
    // Setting `compact` to false or an integer creates more reader friendly output.
    console.log(inspect(o, { compact: false, depth: 5, breakLength: 80 }));
    
    // {
    //   a: [
    //     1,
    //     2,
    //     [
    //       [
    //         'Lorem ipsum dolor sit amet,\n' +
    //           'consectetur adipiscing elit, sed do eiusmod \n' +
    //           'tempor incididunt ut labore et dolore magna aliqua.',
    //         'test',
    //         'foo'
    //       ]
    //     ],
    //     4
    //   ],
    //   b: Map(2) {
    //     'za' => 1,
    //     'zb' => 'test'
    //   }
    // }
    
    // Setting `breakLength` to e.g. 150 will print the "Lorem ipsum" text in a
    // single line.
    ```

The `showHidden` option allows [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) and [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries to be
inspected. If there are more entries than `maxArrayLength`, there is no
guarantee which entries are displayed. That means retrieving the same
[WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) entries twice may result in different output. Furthermore, entries
with no remaining strong references may be garbage collected at any time.

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    
    const obj = { a: 1 };
    const obj2 = { b: 2 };
    const weakSet = new WeakSet([obj, obj2]);
    
    console.log(inspect(weakSet, { showHidden: true }));
    // WeakSet { { a: 1 }, { b: 2 } }
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    
    const obj = { a: 1 };
    const obj2 = { b: 2 };
    const weakSet = new WeakSet([obj, obj2]);
    
    console.log(inspect(weakSet, { showHidden: true }));
    // WeakSet { { a: 1 }, { b: 2 } }
    ```

The `sorted` option ensures that an object's property insertion order does not
impact the result of `util.inspect()`.

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    import assert from 'node:assert';
    
    const o1 = {
      b: [2, 3, 1],
      a: '`a` comes before `b`',
      c: new Set([2, 3, 1]),
    };
    console.log(inspect(o1, { sorted: true }));
    // { a: '`a` comes before `b`', b: [ 2, 3, 1 ], c: Set(3) { 1, 2, 3 } }
    console.log(inspect(o1, { sorted: (a, b) => b.localeCompare(a) }));
    // { c: Set(3) { 3, 2, 1 }, b: [ 2, 3, 1 ], a: '`a` comes before `b`' }
    
    const o2 = {
      c: new Set([2, 1, 3]),
      a: '`a` comes before `b`',
      b: [2, 3, 1],
    };
    assert.strict.equal(
      inspect(o1, { sorted: true }),
      inspect(o2, { sorted: true }),
    );
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    const assert = require('node:assert');
    
    const o1 = {
      b: [2, 3, 1],
      a: '`a` comes before `b`',
      c: new Set([2, 3, 1]),
    };
    console.log(inspect(o1, { sorted: true }));
    // { a: '`a` comes before `b`', b: [ 2, 3, 1 ], c: Set(3) { 1, 2, 3 } }
    console.log(inspect(o1, { sorted: (a, b) => b.localeCompare(a) }));
    // { c: Set(3) { 3, 2, 1 }, b: [ 2, 3, 1 ], a: '`a` comes before `b`' }
    
    const o2 = {
      c: new Set([2, 1, 3]),
      a: '`a` comes before `b`',
      b: [2, 3, 1],
    };
    assert.strict.equal(
      inspect(o1, { sorted: true }),
      inspect(o2, { sorted: true }),
    );
    ```

The `numericSeparator` option adds an underscore every three digits to all
numbers.

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    
    const thousand = 1000;
    const million = 1000000;
    const bigNumber = 123456789n;
    const bigDecimal = 1234.12345;
    
    console.log(inspect(thousand, { numericSeparator: true }));
    // 1_000
    console.log(inspect(million, { numericSeparator: true }));
    // 1_000_000
    console.log(inspect(bigNumber, { numericSeparator: true }));
    // 123_456_789n
    console.log(inspect(bigDecimal, { numericSeparator: true }));
    // 1_234.123_45
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    
    const thousand = 1000;
    const million = 1000000;
    const bigNumber = 123456789n;
    const bigDecimal = 1234.12345;
    
    console.log(inspect(thousand, { numericSeparator: true }));
    // 1_000
    console.log(inspect(million, { numericSeparator: true }));
    // 1_000_000
    console.log(inspect(bigNumber, { numericSeparator: true }));
    // 123_456_789n
    console.log(inspect(bigDecimal, { numericSeparator: true }));
    // 1_234.123_45
    ```

`util.inspect()` is a synchronous method intended for debugging. Its maximum
output length is approximately 128 MiB. Inputs that result in longer output will
be truncated.

### Customizing `util.inspect` colors

<!-- type=misc -->

Color output (if enabled) of `util.inspect` is customizable globally
via the `util.inspect.styles` and `util.inspect.colors` properties.

`util.inspect.styles` is a map associating a style name to a color from
`util.inspect.colors`.

The default styles and associated colors are:

* `bigint`: `yellow`
* `boolean`: `yellow`
* `date`: `magenta`
* `module`: `underline`
* `name`: (no styling)
* `null`: `bold`
* `number`: `yellow`
* `regexp`: A method that colors character classes, groups, assertions, and
  other parts for improved readability. To customize the coloring, change the
  `colors` property. It is set to
  `['red', 'green', 'yellow', 'cyan', 'magenta']` by default and may be
  adjusted as needed. The array is repetitively iterated through depending on
  the "depth".
* `special`: `cyan` (e.g., `Proxies`)
* `string`: `green`
* `symbol`: `green`
* `undefined`: `grey`

Color styling uses ANSI control codes that may not be supported on all
terminals. To verify color support use [`tty.hasColors()`][].

Predefined control codes are listed below (grouped as "Modifiers", "Foreground
colors", and "Background colors").

#### Complex custom coloring

It is possible to define a method as style. It receives the stringified value
of the input. It is invoked in case coloring is active and the type is
inspected.

Example: `util.inspect.styles.regexp(value)`

* `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The string representation of the input type.
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The adjusted representation of `object`.

#### Modifiers

Modifier support varies throughout different terminals. They will mostly be
ignored, if not supported.

* `reset` - Resets all (color) modifiers to their defaults
* **bold** - Make text bold
* _italic_ - Make text italic
* <span style="border-bottom: 1px solid;">underline</span> - Make text underlined
* ~~strikethrough~~ - Puts a horizontal line through the center of the text
  (Alias: `strikeThrough`, `crossedout`, `crossedOut`)
* `hidden` - Prints the text, but makes it invisible (Alias: conceal)
* <span style="opacity: 0.5;">dim</span> - Decreased color intensity (Alias:
  `faint`)
* <span style="border-top: 1px solid;">overlined</span> - Make text overlined
* blink - Hides and shows the text in an interval
* <span style="filter: invert(100%);">inverse</span> - Swap foreground and
  background colors (Alias: `swapcolors`, `swapColors`)
* <span style="border-bottom: 1px double;">doubleunderline</span> - Make text
  double underlined (Alias: `doubleUnderline`)
* <span style="border: 1px solid;">framed</span> - Draw a frame around the text

#### Foreground colors

* `black`
* `red`
* `green`
* `yellow`
* `blue`
* `magenta`
* `cyan`
* `white`
* `gray` (alias: `grey`, `blackBright`)
* `redBright`
* `greenBright`
* `yellowBright`
* `blueBright`
* `magentaBright`
* `cyanBright`
* `whiteBright`

#### Background colors

* `bgBlack`
* `bgRed`
* `bgGreen`
* `bgYellow`
* `bgBlue`
* `bgMagenta`
* `bgCyan`
* `bgWhite`
* `bgGray` (alias: `bgGrey`, `bgBlackBright`)
* `bgRedBright`
* `bgGreenBright`
* `bgYellowBright`
* `bgBlueBright`
* `bgMagentaBright`
* `bgCyanBright`
* `bgWhiteBright`

### Custom inspection functions on objects

<!-- type=misc -->

<!-- YAML
added: v0.1.97
changes:
  - version:
      - v17.3.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41019
    description: The inspect argument is added for more interoperability.
-->

Добавлено в: v0.1.97

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v17.3.0, v16.14.0 | Аргумент проверки добавлен для большей совместимости. |

Objects may also define their own
[`[util.inspect.custom](depth, opts, inspect)`][util.inspect.custom] function,
which `util.inspect()` will invoke and use the result of when inspecting
the object.

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    
    class Box {
      constructor(value) {
        this.value = value;
      }
    
      [inspect.custom](depth, options, inspect) {
        if (depth < 0) {
          return options.stylize('[Box]', 'special');
        }
    
        const newOptions = Object.assign({}, options, {
          depth: options.depth === null ? null : options.depth - 1,
        });
    
        // Five space padding because that's the size of "Box< ".
        const padding = ' '.repeat(5);
        const inner = inspect(this.value, newOptions)
                      .replace(/\n/g, `\n${padding}`);
        return `${options.stylize('Box', 'special')}< ${inner} >`;
      }
    }
    
    const box = new Box(true);
    
    console.log(inspect(box));
    // "Box< true >"
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    
    class Box {
      constructor(value) {
        this.value = value;
      }
    
      [inspect.custom](depth, options, inspect) {
        if (depth < 0) {
          return options.stylize('[Box]', 'special');
        }
    
        const newOptions = Object.assign({}, options, {
          depth: options.depth === null ? null : options.depth - 1,
        });
    
        // Five space padding because that's the size of "Box< ".
        const padding = ' '.repeat(5);
        const inner = inspect(this.value, newOptions)
                      .replace(/\n/g, `\n${padding}`);
        return `${options.stylize('Box', 'special')}< ${inner} >`;
      }
    }
    
    const box = new Box(true);
    
    console.log(inspect(box));
    // "Box< true >"
    ```

Custom `[util.inspect.custom](depth, opts, inspect)` functions typically return
a string but may return a value of any type that will be formatted accordingly
by `util.inspect()`.

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    
    const obj = { foo: 'this will not show up in the inspect() output' };
    obj[inspect.custom] = (depth) => {
      return { bar: 'baz' };
    };
    
    console.log(inspect(obj));
    // "{ bar: 'baz' }"
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    
    const obj = { foo: 'this will not show up in the inspect() output' };
    obj[inspect.custom] = (depth) => {
      return { bar: 'baz' };
    };
    
    console.log(inspect(obj));
    // "{ bar: 'baz' }"
    ```

### `util.inspect.custom`

<!-- YAML
added: v6.6.0
changes:
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/20857
    description: This is now defined as a shared symbol.
-->

Добавлено в: v6.6.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v10.12.0 | Теперь это определено как общий символ. |

* Type: [<symbol>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) that can be used to declare custom inspect functions.

In addition to being accessible through `util.inspect.custom`, this
symbol is [registered globally][global symbol registry] and can be
accessed in any environment as `Symbol.for('nodejs.util.inspect.custom')`.

Using this allows code to be written in a portable fashion, so that the custom
inspect function is used in an Node.js environment and ignored in the browser.
The `util.inspect()` function itself is passed as third argument to the custom
inspect function to allow further portability.

```js
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

class Password {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return 'xxxxxxxx';
  }

  [customInspectSymbol](depth, inspectOptions, inspect) {
    return `Password <${this.toString()}>`;
  }
}

const password = new Password('r0sebud');
console.log(password);
// Prints Password <xxxxxxxx>
```

See [Custom inspection functions on Objects][] for more details.

### `util.inspect.defaultOptions`

<!-- YAML
added: v6.4.0
-->

The `defaultOptions` value allows customization of the default options used by
`util.inspect`. This is useful for functions like `console.log` or
`util.format` which implicitly call into `util.inspect`. It shall be set to an
object containing one or more valid [`util.inspect()`][] options. Setting
option properties directly is also supported.

=== "MJS"

    ```js
    import { inspect } from 'node:util';
    const arr = Array(156).fill(0);
    
    console.log(arr); // Logs the truncated array
    inspect.defaultOptions.maxArrayLength = null;
    console.log(arr); // logs the full array
    ```

=== "CJS"

    ```js
    const { inspect } = require('node:util');
    const arr = Array(156).fill(0);
    
    console.log(arr); // Logs the truncated array
    inspect.defaultOptions.maxArrayLength = null;
    console.log(arr); // logs the full array
    ```

## `util.isDeepStrictEqual(val1, val2[, options])`

<!-- YAML
added: v9.0.0
changes:
  - version: v24.9.0
    pr-url: https://github.com/nodejs/node/pull/59762
    description: Added `options` parameter to allow skipping prototype comparison.
-->

Добавлено в: v9.0.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v24.9.0 | Добавлен параметр options, позволяющий пропустить сравнение прототипов. |

* `val1` {any}
* `val2` {any}
* `skipPrototype` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, prototype and constructor
  comparison is skipped during deep strict equality check. **Default:** `false`.
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if there is deep strict equality between `val1` and `val2`.
Otherwise, returns `false`.

By default, deep strict equality includes comparison of object prototypes and
constructors. When `skipPrototype` is `true`, objects with
different prototypes or constructors can still be considered equal if their
enumerable properties are deeply strictly equal.

```js
const util = require('node:util');

class Foo {
  constructor(a) {
    this.a = a;
  }
}

class Bar {
  constructor(a) {
    this.a = a;
  }
}

const foo = new Foo(1);
const bar = new Bar(1);

// Different constructors, same properties
console.log(util.isDeepStrictEqual(foo, bar));
// false

console.log(util.isDeepStrictEqual(foo, bar, true));
// true
```

See [`assert.deepStrictEqual()`][] for more information about deep strict
equality.

## Class: `util.MIMEType`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

An implementation of [the MIMEType class](https://bmeck.github.io/node-proposal-mime-api/).

In accordance with browser conventions, all properties of `MIMEType` objects
are implemented as getters and setters on the class prototype, rather than as
data properties on the object itself.

A MIME string is a structured string containing multiple meaningful
components. When parsed, a `MIMEType` object is returned containing
properties for each of these components.

### `new MIMEType(input)`

* `input` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The input MIME to parse

Creates a new `MIMEType` object by parsing the `input`.

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const myMIME = new MIMEType('text/plain');
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const myMIME = new MIMEType('text/plain');
    ```

A `TypeError` will be thrown if the `input` is not a valid MIME. Note
that an effort will be made to coerce the given values into strings. For
instance:

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    const myMIME = new MIMEType({ toString: () => 'text/plain' });
    console.log(String(myMIME));
    // Prints: text/plain
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    const myMIME = new MIMEType({ toString: () => 'text/plain' });
    console.log(String(myMIME));
    // Prints: text/plain
    ```

### `mime.type`

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Gets and sets the type portion of the MIME.

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const myMIME = new MIMEType('text/javascript');
    console.log(myMIME.type);
    // Prints: text
    myMIME.type = 'application';
    console.log(myMIME.type);
    // Prints: application
    console.log(String(myMIME));
    // Prints: application/javascript
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const myMIME = new MIMEType('text/javascript');
    console.log(myMIME.type);
    // Prints: text
    myMIME.type = 'application';
    console.log(myMIME.type);
    // Prints: application
    console.log(String(myMIME));
    // Prints: application/javascript
    ```

### `mime.subtype`

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Gets and sets the subtype portion of the MIME.

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const myMIME = new MIMEType('text/ecmascript');
    console.log(myMIME.subtype);
    // Prints: ecmascript
    myMIME.subtype = 'javascript';
    console.log(myMIME.subtype);
    // Prints: javascript
    console.log(String(myMIME));
    // Prints: text/javascript
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const myMIME = new MIMEType('text/ecmascript');
    console.log(myMIME.subtype);
    // Prints: ecmascript
    myMIME.subtype = 'javascript';
    console.log(myMIME.subtype);
    // Prints: javascript
    console.log(String(myMIME));
    // Prints: text/javascript
    ```

### `mime.essence`

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Gets the essence of the MIME. This property is read only.
Use `mime.type` or `mime.subtype` to alter the MIME.

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const myMIME = new MIMEType('text/javascript;key=value');
    console.log(myMIME.essence);
    // Prints: text/javascript
    myMIME.type = 'application';
    console.log(myMIME.essence);
    // Prints: application/javascript
    console.log(String(myMIME));
    // Prints: application/javascript;key=value
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const myMIME = new MIMEType('text/javascript;key=value');
    console.log(myMIME.essence);
    // Prints: text/javascript
    myMIME.type = 'application';
    console.log(myMIME.essence);
    // Prints: application/javascript
    console.log(String(myMIME));
    // Prints: application/javascript;key=value
    ```

### `mime.params`

* Type: [<MIMEParams>](#class-utilmimeparams)

Gets the [`MIMEParams`][] object representing the
parameters of the MIME. This property is read-only. See
[`MIMEParams`][] documentation for details.

### `mime.toString()`

* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The `toString()` method on the `MIMEType` object returns the serialized MIME.

Because of the need for standard compliance, this method does not allow users
to customize the serialization process of the MIME.

### `mime.toJSON()`

* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Alias for [`mime.toString()`][].

This method is automatically called when an `MIMEType` object is serialized
with [`JSON.stringify()`][].

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const myMIMES = [
      new MIMEType('image/png'),
      new MIMEType('image/gif'),
    ];
    console.log(JSON.stringify(myMIMES));
    // Prints: ["image/png", "image/gif"]
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const myMIMES = [
      new MIMEType('image/png'),
      new MIMEType('image/gif'),
    ];
    console.log(JSON.stringify(myMIMES));
    // Prints: ["image/png", "image/gif"]
    ```

## Class: `util.MIMEParams`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

The `MIMEParams` API provides read and write access to the parameters of a
`MIMEType`.

### `new MIMEParams()`

Creates a new `MIMEParams` object by with empty parameters

=== "MJS"

    ```js
    import { MIMEParams } from 'node:util';
    
    const myParams = new MIMEParams();
    ```

=== "CJS"

    ```js
    const { MIMEParams } = require('node:util');
    
    const myParams = new MIMEParams();
    ```

### `mimeParams.delete(name)`

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Remove all name-value pairs whose name is `name`.

### `mimeParams.entries()`

* Returns: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Returns an iterator over each of the name-value pairs in the parameters.
Each item of the iterator is a JavaScript `Array`. The first item of the array
is the `name`, the second item of the array is the `value`.

### `mimeParams.get(name)`

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null A string or `null` if there is no name-value pair
  with the given `name`.

Returns the value of the first name-value pair whose name is `name`. If there
are no such pairs, `null` is returned.

### `mimeParams.has(name)`

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if there is at least one name-value pair whose name is `name`.

### `mimeParams.keys()`

* Returns: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Returns an iterator over the names of each name-value pair.

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const { params } = new MIMEType('text/plain;foo=0;bar=1');
    for (const name of params.keys()) {
      console.log(name);
    }
    // Prints:
    //   foo
    //   bar
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const { params } = new MIMEType('text/plain;foo=0;bar=1');
    for (const name of params.keys()) {
      console.log(name);
    }
    // Prints:
    //   foo
    //   bar
    ```

### `mimeParams.set(name, value)`

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Sets the value in the `MIMEParams` object associated with `name` to
`value`. If there are any pre-existing name-value pairs whose names are `name`,
set the first such pair's value to `value`.

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const { params } = new MIMEType('text/plain;foo=0;bar=1');
    params.set('foo', 'def');
    params.set('baz', 'xyz');
    console.log(params.toString());
    // Prints: foo=def;bar=1;baz=xyz
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const { params } = new MIMEType('text/plain;foo=0;bar=1');
    params.set('foo', 'def');
    params.set('baz', 'xyz');
    console.log(params.toString());
    // Prints: foo=def;bar=1;baz=xyz
    ```

### `mimeParams.values()`

* Returns: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Returns an iterator over the values of each name-value pair.

### `mimeParams[Symbol.iterator]()`

* Returns: [<Iterator>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Alias for [`mimeParams.entries()`][].

=== "MJS"

    ```js
    import { MIMEType } from 'node:util';
    
    const { params } = new MIMEType('text/plain;foo=bar;xyz=baz');
    for (const [name, value] of params) {
      console.log(name, value);
    }
    // Prints:
    //   foo bar
    //   xyz baz
    ```

=== "CJS"

    ```js
    const { MIMEType } = require('node:util');
    
    const { params } = new MIMEType('text/plain;foo=bar;xyz=baz');
    for (const [name, value] of params) {
      console.log(name, value);
    }
    // Prints:
    //   foo bar
    //   xyz baz
    ```

## `util.parseArgs([config])`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
changes:
  - version:
    - v22.4.0
    - v20.16.0
    pr-url: https://github.com/nodejs/node/pull/53107
    description: add support for allowing negative options in input `config`.
  - version:
    - v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46718
    description: The API is no longer experimental.
  - version:
    - v18.11.0
    - v16.19.0
    pr-url: https://github.com/nodejs/node/pull/44631
    description: Add support for default values in input `config`.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43459
    description: add support for returning detailed parse information
                 using `tokens` in input `config` and returned properties.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v22.4.0, v20.16.0 | добавить поддержку разрешения отрицательных параметров во входных данных `config`. |
    | v20.0.0 | API больше не является экспериментальным. |
    | v18.11.0, v16.19.0 | Добавьте поддержку значений по умолчанию во входной `config`. |
    | v18.7.0, v16.17.0 | добавить поддержку возврата подробной информации о синтаксическом анализе с использованием токенов во входных данных config и возвращаемых свойствах. |

* `config` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Used to provide arguments for parsing and to configure
  the parser. `config` supports the following properties:
  * `args` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) array of argument strings. **Default:** `process.argv`
    with `execPath` and `filename` removed.
  * `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Used to describe arguments known to the parser.
    Keys of `options` are the long names of options and values are an
    [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) accepting the following properties:
    * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Type of argument, which must be either `boolean` or `string`.
    * `multiple` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this option can be provided multiple
      times. If `true`, all values will be collected in an array. If
      `false`, values for the option are last-wins. **Default:** `false`.
    * `short` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) A single character alias for the option.
    * `default` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) The value to assign to
      the option if it does not appear in the arguments to be parsed. The value
      must match the type specified by the `type` property. If `multiple` is
      `true`, it must be an array. No default value is applied when the option
      does appear in the arguments to be parsed, even if the provided value
      is falsy.
  * `strict` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Should an error be thrown when unknown arguments
    are encountered, or when arguments are passed that do not match the
    `type` configured in `options`.
    **Default:** `true`.
  * `allowPositionals` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this command accepts positional
    arguments.
    **Default:** `false` if `strict` is `true`, otherwise `true`.
  * `allowNegative` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, allows explicitly setting boolean
    options to `false` by prefixing the option name with `--no-`.
    **Default:** `false`.
  * `tokens` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Return the parsed tokens. This is useful for extending
    the built-in behavior, from adding additional checks through to reprocessing
    the tokens in different ways.
    **Default:** `false`.

* Returns: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The parsed command line arguments:
  * `values` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) A mapping of parsed option names with their [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    or [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) values.
  * `positionals` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Positional arguments.
  * `tokens` [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined See [parseArgs tokens](#parseargs-tokens)
    section. Only returned if `config` includes `tokens: true`.

Provides a higher level API for command-line argument parsing than interacting
with `process.argv` directly. Takes a specification for the expected arguments
and returns a structured object with the parsed options and positionals.

=== "MJS"

    ```js
    import { parseArgs } from 'node:util';
    const args = ['-f', '--bar', 'b'];
    const options = {
      foo: {
        type: 'boolean',
        short: 'f',
      },
      bar: {
        type: 'string',
      },
    };
    const {
      values,
      positionals,
    } = parseArgs({ args, options });
    console.log(values, positionals);
    // Prints: [Object: null prototype] { foo: true, bar: 'b' } []
    ```

=== "CJS"

    ```js
    const { parseArgs } = require('node:util');
    const args = ['-f', '--bar', 'b'];
    const options = {
      foo: {
        type: 'boolean',
        short: 'f',
      },
      bar: {
        type: 'string',
      },
    };
    const {
      values,
      positionals,
    } = parseArgs({ args, options });
    console.log(values, positionals);
    // Prints: [Object: null prototype] { foo: true, bar: 'b' } []
    ```

### `parseArgs` `tokens`

Detailed parse information is available for adding custom behaviors by
specifying `tokens: true` in the configuration.
The returned tokens have properties describing:

* all tokens
  * `kind` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) One of 'option', 'positional', or 'option-terminator'.
  * `index` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Index of element in `args` containing token. So the
    source argument for a token is `args[token.index]`.
* option tokens
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Long name of option.
  * `rawName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) How option used in args, like `-f` of `--foo`.
  * `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Option value specified in args.
    Undefined for boolean options.
  * `inlineValue` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Whether option value specified inline,
    like `--foo=bar`.
* positional tokens
  * `value` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The value of the positional argument in args (i.e. `args[index]`).
* option-terminator token

The returned tokens are in the order encountered in the input args. Options
that appear more than once in args produce a token for each use. Short option
groups like `-xy` expand to a token for each option. So `-xxx` produces
three tokens.

For example, to add support for a negated option like `--no-color` (which
`allowNegative` supports when the option is of `boolean` type), the returned
tokens can be reprocessed to change the value stored for the negated option.

=== "MJS"

    ```js
    import { parseArgs } from 'node:util';
    
    const options = {
      'color': { type: 'boolean' },
      'no-color': { type: 'boolean' },
      'logfile': { type: 'string' },
      'no-logfile': { type: 'boolean' },
    };
    const { values, tokens } = parseArgs({ options, tokens: true });
    
    // Reprocess the option tokens and overwrite the returned values.
    tokens
      .filter((token) => token.kind === 'option')
      .forEach((token) => {
        if (token.name.startsWith('no-')) {
          // Store foo:false for --no-foo
          const positiveName = token.name.slice(3);
          values[positiveName] = false;
          delete values[token.name];
        } else {
          // Resave value so last one wins if both --foo and --no-foo.
          values[token.name] = token.value ?? true;
        }
      });
    
    const color = values.color;
    const logfile = values.logfile ?? 'default.log';
    
    console.log({ logfile, color });
    ```

=== "CJS"

    ```js
    const { parseArgs } = require('node:util');
    
    const options = {
      'color': { type: 'boolean' },
      'no-color': { type: 'boolean' },
      'logfile': { type: 'string' },
      'no-logfile': { type: 'boolean' },
    };
    const { values, tokens } = parseArgs({ options, tokens: true });
    
    // Reprocess the option tokens and overwrite the returned values.
    tokens
      .filter((token) => token.kind === 'option')
      .forEach((token) => {
        if (token.name.startsWith('no-')) {
          // Store foo:false for --no-foo
          const positiveName = token.name.slice(3);
          values[positiveName] = false;
          delete values[token.name];
        } else {
          // Resave value so last one wins if both --foo and --no-foo.
          values[token.name] = token.value ?? true;
        }
      });
    
    const color = values.color;
    const logfile = values.logfile ?? 'default.log';
    
    console.log({ logfile, color });
    ```

Example usage showing negated options, and when an option is used
multiple ways then last one wins.

```console
$ node negate.js
{ logfile: 'default.log', color: undefined }
$ node negate.js --no-logfile --no-color
{ logfile: false, color: false }
$ node negate.js --logfile=test.log --color
{ logfile: 'test.log', color: true }
$ node negate.js --no-logfile --logfile=test.log --color --no-color
{ logfile: 'test.log', color: false }
```

## `util.parseEnv(content)`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
changes:
  - version:
     - v24.10.0
     - v22.21.0
    pr-url: https://github.com/nodejs/node/pull/59925
    description: This API is no longer experimental.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v24.10.0, v22.21.0 | Этот API больше не является экспериментальным. |

* `content` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The raw contents of a `.env` file.

* Returns: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Given an example `.env` file:

=== "CJS"

    ```js
    const { parseEnv } = require('node:util');
    
    parseEnv('HELLO=world\nHELLO=oh my\n');
    // Returns: { HELLO: 'oh my' }
    ```

=== "MJS"

    ```js
    import { parseEnv } from 'node:util';
    
    parseEnv('HELLO=world\nHELLO=oh my\n');
    // Returns: { HELLO: 'oh my' }
    ```

## `util.promisify(original)`

<!-- YAML
added: v8.0.0
changes:
  - version: v20.8.0
    pr-url: https://github.com/nodejs/node/pull/49647
    description: Calling `promisify` on a function that returns a `Promise` is
                 deprecated.
-->

Добавлено в: v8.0.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v20.8.0 | Вызов Promisify для функции, возвращающей Promise, устарел. |

* `original` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Returns: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Takes a function following the common error-first callback style, i.e. taking
an `(err, value) => ...` callback as the last argument, and returns a version
that returns promises.

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    import { stat } from 'node:fs';
    
    const promisifiedStat = promisify(stat);
    promisifiedStat('.').then((stats) => {
      // Do something with `stats`
    }).catch((error) => {
      // Handle the error.
    });
    ```

=== "CJS"

    ```js
    const { promisify } = require('node:util');
    const { stat } = require('node:fs');
    
    const promisifiedStat = promisify(stat);
    promisifiedStat('.').then((stats) => {
      // Do something with `stats`
    }).catch((error) => {
      // Handle the error.
    });
    ```

Or, equivalently using `async function`s:

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    import { stat } from 'node:fs';
    
    const promisifiedStat = promisify(stat);
    
    async function callStat() {
      const stats = await promisifiedStat('.');
      console.log(`This directory is owned by ${stats.uid}`);
    }
    
    callStat();
    ```

=== "CJS"

    ```js
    const { promisify } = require('node:util');
    const { stat } = require('node:fs');
    
    const promisifiedStat = promisify(stat);
    
    async function callStat() {
      const stats = await promisifiedStat('.');
      console.log(`This directory is owned by ${stats.uid}`);
    }
    
    callStat();
    ```

If there is an `original[util.promisify.custom]` property present, `promisify`
will return its value, see [Custom promisified functions][].

`promisify()` assumes that `original` is a function taking a callback as its
final argument in all cases. If `original` is not a function, `promisify()`
will throw an error. If `original` is a function but its last argument is not
an error-first callback, it will still be passed an error-first
callback as its last argument.

Using `promisify()` on class methods or other methods that use `this` may not
work as expected unless handled specially:

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    
    class Foo {
      constructor() {
        this.a = 42;
      }
    
      bar(callback) {
        callback(null, this.a);
      }
    }
    
    const foo = new Foo();
    
    const naiveBar = promisify(foo.bar);
    // TypeError: Cannot read properties of undefined (reading 'a')
    // naiveBar().then(a => console.log(a));
    
    naiveBar.call(foo).then((a) => console.log(a)); // '42'
    
    const bindBar = naiveBar.bind(foo);
    bindBar().then((a) => console.log(a)); // '42'
    ```

=== "CJS"

    ```js
    const { promisify } = require('node:util');
    
    class Foo {
      constructor() {
        this.a = 42;
      }
    
      bar(callback) {
        callback(null, this.a);
      }
    }
    
    const foo = new Foo();
    
    const naiveBar = promisify(foo.bar);
    // TypeError: Cannot read properties of undefined (reading 'a')
    // naiveBar().then(a => console.log(a));
    
    naiveBar.call(foo).then((a) => console.log(a)); // '42'
    
    const bindBar = naiveBar.bind(foo);
    bindBar().then((a) => console.log(a)); // '42'
    ```

### Custom promisified functions

Using the `util.promisify.custom` symbol one can override the return value of
[`util.promisify()`][]:

=== "MJS"

    ```js
    import { promisify } from 'node:util';
    
    function doSomething(foo, callback) {
      // ...
    }
    
    doSomething[promisify.custom] = (foo) => {
      return getPromiseSomehow();
    };
    
    const promisified = promisify(doSomething);
    console.log(promisified === doSomething[promisify.custom]);
    // prints 'true'
    ```

=== "CJS"

    ```js
    const { promisify } = require('node:util');
    
    function doSomething(foo, callback) {
      // ...
    }
    
    doSomething[promisify.custom] = (foo) => {
      return getPromiseSomehow();
    };
    
    const promisified = promisify(doSomething);
    console.log(promisified === doSomething[promisify.custom]);
    // prints 'true'
    ```

This can be useful for cases where the original function does not follow the
standard format of taking an error-first callback as the last argument.

For example, with a function that takes in
`(foo, onSuccessCallback, onErrorCallback)`:

```js
doSomething[util.promisify.custom] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```

If `promisify.custom` is defined but is not a function, `promisify()` will
throw an error.

### `util.promisify.custom`

<!-- YAML
added: v8.0.0
changes:
  - version:
      - v13.12.0
      - v12.16.2
    pr-url: https://github.com/nodejs/node/pull/31672
    description: This is now defined as a shared symbol.
-->

Добавлено в: v8.0.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v13.12.0, v12.16.2 | Теперь это определено как общий символ. |

* Type: [<symbol>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) that can be used to declare custom promisified variants of functions,
  see [Custom promisified functions][].

In addition to being accessible through `util.promisify.custom`, this
symbol is [registered globally][global symbol registry] and can be
accessed in any environment as `Symbol.for('nodejs.util.promisify.custom')`.

For example, with a function that takes in
`(foo, onSuccessCallback, onErrorCallback)`:

```js
const kCustomPromisifiedSymbol = Symbol.for('nodejs.util.promisify.custom');

doSomething[kCustomPromisifiedSymbol] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```

## `util.stripVTControlCharacters(str)`

<!-- YAML
added: v16.11.0
-->

* `str` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Returns `str` with any ANSI escape codes removed.

```js
console.log(util.stripVTControlCharacters('\u001B[4mvalue\u001B[0m'));
// Prints "value"
```

## `util.styleText(format, text[, options])`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/61556
    description: Add support for hexadecimal colors.
  - version:
      - v24.2.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/58437
    description: Added the `'none'` format as a non-op format.
  - version:
    - v23.5.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/56265
    description: styleText is now stable.
  - version:
    - v22.8.0
    - v20.18.0
    pr-url: https://github.com/nodejs/node/pull/54389
    description: Respect isTTY and environment variables
      such as NO_COLOR, NODE_DISABLE_COLORS, and FORCE_COLOR.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавить поддержку шестнадцатеричных цветов. |
    | v24.2.0, v22.17.0 | Добавлен формат none как неоперационный формат. |
    | v23.5.0, v22.13.0 | styleText теперь стабилен. |
    | v22.8.0, v20.18.0 | Уважайте isTTY и переменные среды, такие как NO_COLOR, NODE_DISABLE_COLORS и FORCE_COLOR. |

* `format` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) A text format or an Array
  of text formats defined in `util.inspect.colors`, or a hex color in `#RGB`
  or `#RRGGBB` form.
* `text` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The text to to be formatted.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `validateStream` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When true, `stream` is checked to see if it can handle colors. **Default:** `true`.
  * `stream` [<Stream>](stream.md#stream) A stream that will be validated if it can be colored. **Default:** `process.stdout`.

This function returns a formatted text considering the `format` passed
for printing in a terminal. It is aware of the terminal's capabilities
and acts according to the configuration set via `NO_COLOR`,
`NODE_DISABLE_COLORS` and `FORCE_COLOR` environment variables.

=== "MJS"

    ```js
    import { styleText } from 'node:util';
    import { stderr } from 'node:process';
    
    const successMessage = styleText('green', 'Success!');
    console.log(successMessage);
    
    const errorMessage = styleText(
      'red',
      'Error! Error!',
      // Validate if process.stderr has TTY
      { stream: stderr },
    );
    console.error(errorMessage);
    ```

=== "CJS"

    ```js
    const { styleText } = require('node:util');
    const { stderr } = require('node:process');
    
    const successMessage = styleText('green', 'Success!');
    console.log(successMessage);
    
    const errorMessage = styleText(
      'red',
      'Error! Error!',
      // Validate if process.stderr has TTY
      { stream: stderr },
    );
    console.error(errorMessage);
    ```

`util.inspect.colors` also provides text formats such as `italic`, and
`underline` and you can combine both:

=== "CJS"

    ```js
    console.log(
      util.styleText(['underline', 'italic'], 'My italic underlined message'),
    );
    ```

When passing an array of formats, the order of the format applied
is left to right so the following style might overwrite the previous one.

=== "CJS"

    ```js
    console.log(
      util.styleText(['red', 'green'], 'text'), // green
    );
    ```

The special format value `none` applies no additional styling to the text.

In addition to predefined color names, `util.styleText()` supports hex color
strings using ANSI TrueColor (24-bit) escape sequences. Hex colors can be
specified in either 3-digit (`#RGB`) or 6-digit (`#RRGGBB`) format:

=== "MJS"

    ```js
    import { styleText } from 'node:util';
    
    // 6-digit hex color
    console.log(styleText('#ff5733', 'Orange text'));
    
    // 3-digit hex color (shorthand)
    console.log(styleText('#f00', 'Red text'));
    ```

=== "CJS"

    ```js
    const { styleText } = require('node:util');
    
    // 6-digit hex color
    console.log(styleText('#ff5733', 'Orange text'));
    
    // 3-digit hex color (shorthand)
    console.log(styleText('#f00', 'Red text'));
    ```

The full list of formats can be found in [modifiers][].

## Class: `util.TextDecoder`

<!-- YAML
added: v8.3.0
changes:
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22281
    description: The class is now available on the global object.
-->

Добавлено в: v8.3.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v11.0.0 | Теперь класс доступен для глобального объекта. |

An implementation of the [WHATWG Encoding Standard][] `TextDecoder` API.

```js
const decoder = new TextDecoder();
const u8arr = new Uint8Array([72, 101, 108, 108, 111]);
console.log(decoder.decode(u8arr)); // Hello
```

### WHATWG supported encodings

Per the [WHATWG Encoding Standard][], the encodings supported by the
`TextDecoder` API are outlined in the tables below. For each encoding,
one or more aliases may be used.

Different Node.js build configurations support different sets of encodings.
(see [Internationalization][])

#### Encodings supported by default (with full ICU data)

| Encoding           | Aliases                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'ibm866'`         | `'866'`, `'cp866'`, `'csibm866'`                                                                                                                                                                                                    |
| `'iso-8859-2'`     | `'csisolatin2'`, `'iso-ir-101'`, `'iso8859-2'`, `'iso88592'`, `'iso_8859-2'`, `'iso_8859-2:1987'`, `'l2'`, `'latin2'`                                                                                                               |
| `'iso-8859-3'`     | `'csisolatin3'`, `'iso-ir-109'`, `'iso8859-3'`, `'iso88593'`, `'iso_8859-3'`, `'iso_8859-3:1988'`, `'l3'`, `'latin3'`                                                                                                               |
| `'iso-8859-4'`     | `'csisolatin4'`, `'iso-ir-110'`, `'iso8859-4'`, `'iso88594'`, `'iso_8859-4'`, `'iso_8859-4:1988'`, `'l4'`, `'latin4'`                                                                                                               |
| `'iso-8859-5'`     | `'csisolatincyrillic'`, `'cyrillic'`, `'iso-ir-144'`, `'iso8859-5'`, `'iso88595'`, `'iso_8859-5'`, `'iso_8859-5:1988'`                                                                                                              |
| `'iso-8859-6'`     | `'arabic'`, `'asmo-708'`, `'csiso88596e'`, `'csiso88596i'`, `'csisolatinarabic'`, `'ecma-114'`, `'iso-8859-6-e'`, `'iso-8859-6-i'`, `'iso-ir-127'`, `'iso8859-6'`, `'iso88596'`, `'iso_8859-6'`, `'iso_8859-6:1987'`                |
| `'iso-8859-7'`     | `'csisolatingreek'`, `'ecma-118'`, `'elot_928'`, `'greek'`, `'greek8'`, `'iso-ir-126'`, `'iso8859-7'`, `'iso88597'`, `'iso_8859-7'`, `'iso_8859-7:1987'`, `'sun_eu_greek'`                                                          |
| `'iso-8859-8'`     | `'csiso88598e'`, `'csisolatinhebrew'`, `'hebrew'`, `'iso-8859-8-e'`, `'iso-ir-138'`, `'iso8859-8'`, `'iso88598'`, `'iso_8859-8'`, `'iso_8859-8:1988'`, `'visual'`                                                                   |
| `'iso-8859-8-i'`   | `'csiso88598i'`, `'logical'`                                                                                                                                                                                                        |
| `'iso-8859-10'`    | `'csisolatin6'`, `'iso-ir-157'`, `'iso8859-10'`, `'iso885910'`, `'l6'`, `'latin6'`                                                                                                                                                  |
| `'iso-8859-13'`    | `'iso8859-13'`, `'iso885913'`                                                                                                                                                                                                       |
| `'iso-8859-14'`    | `'iso8859-14'`, `'iso885914'`                                                                                                                                                                                                       |
| `'iso-8859-15'`    | `'csisolatin9'`, `'iso8859-15'`, `'iso885915'`, `'iso_8859-15'`, `'l9'`                                                                                                                                                             |
| `'koi8-r'`         | `'cskoi8r'`, `'koi'`, `'koi8'`, `'koi8_r'`                                                                                                                                                                                          |
| `'koi8-u'`         | `'koi8-ru'`                                                                                                                                                                                                                         |
| `'macintosh'`      | `'csmacintosh'`, `'mac'`, `'x-mac-roman'`                                                                                                                                                                                           |
| `'windows-874'`    | `'dos-874'`, `'iso-8859-11'`, `'iso8859-11'`, `'iso885911'`, `'tis-620'`                                                                                                                                                            |
| `'windows-1250'`   | `'cp1250'`, `'x-cp1250'`                                                                                                                                                                                                            |
| `'windows-1251'`   | `'cp1251'`, `'x-cp1251'`                                                                                                                                                                                                            |
| `'windows-1252'`   | `'ansi_x3.4-1968'`, `'ascii'`, `'cp1252'`, `'cp819'`, `'csisolatin1'`, `'ibm819'`, `'iso-8859-1'`, `'iso-ir-100'`, `'iso8859-1'`, `'iso88591'`, `'iso_8859-1'`, `'iso_8859-1:1987'`, `'l1'`, `'latin1'`, `'us-ascii'`, `'x-cp1252'` |
| `'windows-1253'`   | `'cp1253'`, `'x-cp1253'`                                                                                                                                                                                                            |
| `'windows-1254'`   | `'cp1254'`, `'csisolatin5'`, `'iso-8859-9'`, `'iso-ir-148'`, `'iso8859-9'`, `'iso88599'`, `'iso_8859-9'`, `'iso_8859-9:1989'`, `'l5'`, `'latin5'`, `'x-cp1254'`                                                                     |
| `'windows-1255'`   | `'cp1255'`, `'x-cp1255'`                                                                                                                                                                                                            |
| `'windows-1256'`   | `'cp1256'`, `'x-cp1256'`                                                                                                                                                                                                            |
| `'windows-1257'`   | `'cp1257'`, `'x-cp1257'`                                                                                                                                                                                                            |
| `'windows-1258'`   | `'cp1258'`, `'x-cp1258'`                                                                                                                                                                                                            |
| `'x-mac-cyrillic'` | `'x-mac-ukrainian'`                                                                                                                                                                                                                 |
| `'gbk'`            | `'chinese'`, `'csgb2312'`, `'csiso58gb231280'`, `'gb2312'`, `'gb_2312'`, `'gb_2312-80'`, `'iso-ir-58'`, `'x-gbk'`                                                                                                                   |
| `'gb18030'`        |                                                                                                                                                                                                                                     |
| `'big5'`           | `'big5-hkscs'`, `'cn-big5'`, `'csbig5'`, `'x-x-big5'`                                                                                                                                                                               |
| `'euc-jp'`         | `'cseucpkdfmtjapanese'`, `'x-euc-jp'`                                                                                                                                                                                               |
| `'iso-2022-jp'`    | `'csiso2022jp'`                                                                                                                                                                                                                     |
| `'shift_jis'`      | `'csshiftjis'`, `'ms932'`, `'ms_kanji'`, `'shift-jis'`, `'sjis'`, `'windows-31j'`, `'x-sjis'`                                                                                                                                       |
| `'euc-kr'`         | `'cseuckr'`, `'csksc56011987'`, `'iso-ir-149'`, `'korean'`, `'ks_c_5601-1987'`, `'ks_c_5601-1989'`, `'ksc5601'`, `'ksc_5601'`, `'windows-949'`                                                                                      |

#### Encodings supported when Node.js is built with the `small-icu` option

| Encoding     | Aliases                         |
| ------------ | ------------------------------- |
| `'utf-8'`    | `'unicode-1-1-utf-8'`, `'utf8'` |
| `'utf-16le'` | `'utf-16'`                      |
| `'utf-16be'` |                                 |

#### Encodings supported when ICU is disabled

| Encoding     | Aliases                         |
| ------------ | ------------------------------- |
| `'utf-8'`    | `'unicode-1-1-utf-8'`, `'utf8'` |
| `'utf-16le'` | `'utf-16'`                      |

The `'iso-8859-16'` encoding listed in the [WHATWG Encoding Standard][]
is not supported.

### `new TextDecoder([encoding[, options]])`

* `encoding` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Identifies the `encoding` that this `TextDecoder` instance
  supports. **Default:** `'utf-8'`.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `fatal` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if decoding failures are fatal.
    This option is not supported when ICU is disabled
    (see [Internationalization][]). **Default:** `false`.
  * `ignoreBOM` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, the `TextDecoder` will include the byte
    order mark in the decoded result. When `false`, the byte order mark will
    be removed from the output. This option is only used when `encoding` is
    `'utf-8'`, `'utf-16be'`, or `'utf-16le'`. **Default:** `false`.

Creates a new `TextDecoder` instance. The `encoding` may specify one of the
supported encodings or an alias.

The `TextDecoder` class is also available on the global object.

### `textDecoder.decode([input[, options]])`

* `input` [<ArrayBuffer>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [<DataView>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [<TypedArray>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) An `ArrayBuffer`, `DataView`, or
  `TypedArray` instance containing the encoded data.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `stream` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if additional chunks of data are expected.
    **Default:** `false`.
* Returns: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Decodes the `input` and returns a string. If `options.stream` is `true`, any
incomplete byte sequences occurring at the end of the `input` are buffered
internally and emitted after the next call to `textDecoder.decode()`.

If `textDecoder.fatal` is `true`, decoding errors that occur will result in a
`TypeError` being thrown.

### `textDecoder.encoding`

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The encoding supported by the `TextDecoder` instance.

### `textDecoder.fatal`

* Type: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

The value will be `true` if decoding errors result in a `TypeError` being
thrown.

### `textDecoder.ignoreBOM`

* Type: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

The value will be `true` if the decoding result will include the byte order
mark.

## Class: `util.TextEncoder`

<!-- YAML
added: v8.3.0
changes:
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22281
    description: The class is now available on the global object.
-->

Добавлено в: v8.3.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v11.0.0 | Теперь класс доступен для глобального объекта. |

An implementation of the [WHATWG Encoding Standard][] `TextEncoder` API. All
instances of `TextEncoder` only support UTF-8 encoding.

```js
const encoder = new TextEncoder();
const uint8array = encoder.encode('this is some data');
```

The `TextEncoder` class is also available on the global object.

### `textEncoder.encode([input])`

* `input` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The text to encode. **Default:** an empty string.
* Returns: [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

UTF-8 encodes the `input` string and returns a `Uint8Array` containing the
encoded bytes.

### `textEncoder.encodeInto(src, dest)`

<!-- YAML
added: v12.11.0
-->

* `src` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The text to encode.
* `dest` [<Uint8Array>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) The array to hold the encode result.
* Returns: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `read` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The read Unicode code units of src.
  * `written` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The written UTF-8 bytes of dest.

UTF-8 encodes the `src` string to the `dest` Uint8Array and returns an object
containing the read Unicode code units and written UTF-8 bytes.

```js
const encoder = new TextEncoder();
const src = 'this is some data';
const dest = new Uint8Array(10);
const { read, written } = encoder.encodeInto(src, dest);
```

### `textEncoder.encoding`

* Type: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The encoding supported by the `TextEncoder` instance. Always set to `'utf-8'`.

## `util.toUSVString(string)`

<!-- YAML
added:
  - v16.8.0
  - v14.18.0
-->

* `string` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Returns the `string` after replacing any surrogate code points
(or equivalently, any unpaired surrogate code units) with the
Unicode "replacement character" U+FFFD.

## `util.transferableAbortController()`

<!-- YAML
added: v18.11.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.11.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Creates and returns an [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) instance whose [AbortSignal](globals.md#abortsignal) is marked
as transferable and can be used with `structuredClone()` or `postMessage()`.

## `util.transferableAbortSignal(signal)`

<!-- YAML
added: v18.11.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.11.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

* `signal` [<AbortSignal>](globals.md#abortsignal)
* Returns: [<AbortSignal>](globals.md#abortsignal)

Marks the given [AbortSignal](globals.md#abortsignal) as transferable so that it can be used with
`structuredClone()` and `postMessage()`.

```js
const signal = transferableAbortSignal(AbortSignal.timeout(100));
const channel = new MessageChannel();
channel.port2.postMessage(signal, [signal]);
```

## `util.aborted(signal, resource)`

<!-- YAML
added:
 - v19.7.0
 - v18.16.0
changes:
 - version:
   - v24.0.0
   - v22.16.0
   pr-url: https://github.com/nodejs/node/pull/57765
   description: Change stability index for this feature from Experimental to Stable.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.16.0 | Измените индекс стабильности для этой функции с «Экспериментального» на «Стабильный». |

* `signal` [<AbortSignal>](globals.md#abortsignal)
* `resource` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Any non-null object tied to the abortable operation and held weakly.
  If `resource` is garbage collected before the `signal` aborts, the promise remains pending,
  allowing Node.js to stop tracking it.
  This helps prevent memory leaks in long-running or non-cancelable operations.
* Returns: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Listens to abort event on the provided `signal` and returns a promise that resolves when the `signal` is aborted.
If `resource` is provided, it weakly references the operation's associated object,
so if `resource` is garbage collected before the `signal` aborts,
then returned promise shall remain pending.
This prevents memory leaks in long-running or non-cancelable operations.

=== "CJS"

    ```js
    const { aborted } = require('node:util');
    
    // Obtain an object with an abortable signal, like a custom resource or operation.
    const dependent = obtainSomethingAbortable();
    
    // Pass `dependent` as the resource, indicating the promise should only resolve
    // if `dependent` is still in memory when the signal is aborted.
    aborted(dependent.signal, dependent).then(() => {
    
      // This code runs when `dependent` is aborted.
      console.log('Dependent resource was aborted.');
    });
    
    // Simulate an event that triggers the abort.
    dependent.on('event', () => {
      dependent.abort(); // This will cause the `aborted` promise to resolve.
    });
    ```

=== "MJS"

    ```js
    import { aborted } from 'node:util';
    
    // Obtain an object with an abortable signal, like a custom resource or operation.
    const dependent = obtainSomethingAbortable();
    
    // Pass `dependent` as the resource, indicating the promise should only resolve
    // if `dependent` is still in memory when the signal is aborted.
    aborted(dependent.signal, dependent).then(() => {
    
      // This code runs when `dependent` is aborted.
      console.log('Dependent resource was aborted.');
    });
    
    // Simulate an event that triggers the abort.
    dependent.on('event', () => {
      dependent.abort(); // This will cause the `aborted` promise to resolve.
    });
    ```

## `util.types`

<!-- YAML
added: v10.0.0
changes:
  - version: v15.3.0
    pr-url: https://github.com/nodejs/node/pull/34055
    description: Exposed as `require('util/types')`.
-->

Добавлено в: v10.0.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v15.3.0 | Представлено как `require('util/types')`. |

`util.types` provides type checks for different kinds of built-in objects.
Unlike `instanceof` or `Object.prototype.toString.call(value)`, these checks do
not inspect properties of the object that are accessible from JavaScript (like
their prototype), and usually have the overhead of calling into C++.

The result generally does not make any guarantees about what kinds of
properties or behavior a value exposes in JavaScript. They are primarily
useful for addon developers who prefer to do type checking in JavaScript.

The API is accessible via `require('node:util').types` or `require('node:util/types')`.

### `util.types.isAnyArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) or
[SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) instance.

See also [`util.types.isArrayBuffer()`][] and
[`util.types.isSharedArrayBuffer()`][].

```js
util.types.isAnyArrayBuffer(new ArrayBuffer());  // Returns true
util.types.isAnyArrayBuffer(new SharedArrayBuffer());  // Returns true
```

### `util.types.isArrayBufferView(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is an instance of one of the [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
views, such as typed array objects or [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView). Equivalent to
[`ArrayBuffer.isView()`][].

```js
util.types.isArrayBufferView(new Int8Array());  // true
util.types.isArrayBufferView(Buffer.from('hello world')); // true
util.types.isArrayBufferView(new DataView(new ArrayBuffer(16)));  // true
util.types.isArrayBufferView(new ArrayBuffer());  // false
```

### `util.types.isArgumentsObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is an `arguments` object.

<!-- eslint-disable prefer-rest-params -->

```js
function foo() {
  util.types.isArgumentsObject(arguments);  // Returns true
}
```

### `util.types.isArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) instance.
This does _not_ include [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) instances. Usually, it is
desirable to test for both; See [`util.types.isAnyArrayBuffer()`][] for that.

```js
util.types.isArrayBuffer(new ArrayBuffer());  // Returns true
util.types.isArrayBuffer(new SharedArrayBuffer());  // Returns false
```

### `util.types.isAsyncFunction(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is an [async function][].
This only reports back what the JavaScript engine is seeing;
in particular, the return value may not match the original source code if
a transpilation tool was used.

```js
util.types.isAsyncFunction(function foo() {});  // Returns false
util.types.isAsyncFunction(async function foo() {});  // Returns true
```

### `util.types.isBigInt64Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a `BigInt64Array` instance.

```js
util.types.isBigInt64Array(new BigInt64Array());   // Returns true
util.types.isBigInt64Array(new BigUint64Array());  // Returns false
```

### `util.types.isBigIntObject(value)`

<!-- YAML
added: v10.4.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a BigInt object, e.g. created
by `Object(BigInt(123))`.

```js
util.types.isBigIntObject(Object(BigInt(123)));   // Returns true
util.types.isBigIntObject(BigInt(123));   // Returns false
util.types.isBigIntObject(123);  // Returns false
```

### `util.types.isBigUint64Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a `BigUint64Array` instance.

```js
util.types.isBigUint64Array(new BigInt64Array());   // Returns false
util.types.isBigUint64Array(new BigUint64Array());  // Returns true
```

### `util.types.isBooleanObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a boolean object, e.g. created
by `new Boolean()`.

```js
util.types.isBooleanObject(false);  // Returns false
util.types.isBooleanObject(true);   // Returns false
util.types.isBooleanObject(new Boolean(false)); // Returns true
util.types.isBooleanObject(new Boolean(true));  // Returns true
util.types.isBooleanObject(Boolean(false)); // Returns false
util.types.isBooleanObject(Boolean(true));  // Returns false
```

### `util.types.isBoxedPrimitive(value)`

<!-- YAML
added: v10.11.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is any boxed primitive object, e.g. created
by `new Boolean()`, `new String()` or `Object(Symbol())`.

For example:

```js
util.types.isBoxedPrimitive(false); // Returns false
util.types.isBoxedPrimitive(new Boolean(false)); // Returns true
util.types.isBoxedPrimitive(Symbol('foo')); // Returns false
util.types.isBoxedPrimitive(Object(Symbol('foo'))); // Returns true
util.types.isBoxedPrimitive(Object(BigInt(5))); // Returns true
```

### `util.types.isCryptoKey(value)`

<!-- YAML
added: v16.2.0
-->

* `value` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if `value` is a [CryptoKey](webcrypto.md#class-cryptokey), `false` otherwise.

### `util.types.isDataView(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) instance.

```js
const ab = new ArrayBuffer(20);
util.types.isDataView(new DataView(ab));  // Returns true
util.types.isDataView(new Float64Array());  // Returns false
```

See also [`ArrayBuffer.isView()`][].

### `util.types.isDate(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Date](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) instance.

```js
util.types.isDate(new Date());  // Returns true
```

### `util.types.isExternal(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a native `External` value.

A native `External` value is a special type of object that contains a
raw C++ pointer (`void*`) for access from native code, and has no other
properties. Such objects are created either by Node.js internals or native
addons. In JavaScript, they are [frozen][`Object.freeze()`] objects with a
`null` prototype.

```c
#include <js_native_api.h>
#include <stdlib.h>
napi_value result;
static napi_value MyNapi(napi_env env, napi_callback_info info) {
  int* raw = (int*) malloc(1024);
  napi_status status = napi_create_external(env, (void*) raw, NULL, NULL, &result);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "napi_create_external failed");
    return NULL;
  }
  return result;
}
...
DECLARE_NAPI_PROPERTY("myNapi", MyNapi)
...
```

=== "MJS"

    ```js
    import native from 'napi_addon.node';
    import { types } from 'node:util';
    
    const data = native.myNapi();
    types.isExternal(data); // returns true
    types.isExternal(0); // returns false
    types.isExternal(new String('foo')); // returns false
    ```

=== "CJS"

    ```js
    const native = require('napi_addon.node');
    const { types } = require('node:util');
    
    const data = native.myNapi();
    types.isExternal(data); // returns true
    types.isExternal(0); // returns false
    types.isExternal(new String('foo')); // returns false
    ```

For further information on `napi_create_external`, refer to
[`napi_create_external()`][].

### `util.types.isFloat16Array(value)`

<!-- YAML
added:
 - v24.0.0
 - v22.16.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Float16Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Float16Array) instance.

```js
util.types.isFloat16Array(new ArrayBuffer());  // Returns false
util.types.isFloat16Array(new Float16Array());  // Returns true
util.types.isFloat16Array(new Float32Array());  // Returns false
```

### `util.types.isFloat32Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Float32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) instance.

```js
util.types.isFloat32Array(new ArrayBuffer());  // Returns false
util.types.isFloat32Array(new Float32Array());  // Returns true
util.types.isFloat32Array(new Float64Array());  // Returns false
```

### `util.types.isFloat64Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Float64Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array) instance.

```js
util.types.isFloat64Array(new ArrayBuffer());  // Returns false
util.types.isFloat64Array(new Uint8Array());  // Returns false
util.types.isFloat64Array(new Float64Array());  // Returns true
```

### `util.types.isGeneratorFunction(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a generator function.
This only reports back what the JavaScript engine is seeing;
in particular, the return value may not match the original source code if
a transpilation tool was used.

```js
util.types.isGeneratorFunction(function foo() {});  // Returns false
util.types.isGeneratorFunction(function* foo() {});  // Returns true
```

### `util.types.isGeneratorObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a generator object as returned from a
built-in generator function.
This only reports back what the JavaScript engine is seeing;
in particular, the return value may not match the original source code if
a transpilation tool was used.

```js
function* foo() {}
const generator = foo();
util.types.isGeneratorObject(generator);  // Returns true
```

### `util.types.isInt8Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Int8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array) instance.

```js
util.types.isInt8Array(new ArrayBuffer());  // Returns false
util.types.isInt8Array(new Int8Array());  // Returns true
util.types.isInt8Array(new Float64Array());  // Returns false
```

### `util.types.isInt16Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Int16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array) instance.

```js
util.types.isInt16Array(new ArrayBuffer());  // Returns false
util.types.isInt16Array(new Int16Array());  // Returns true
util.types.isInt16Array(new Float64Array());  // Returns false
```

### `util.types.isInt32Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Int32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array) instance.

```js
util.types.isInt32Array(new ArrayBuffer());  // Returns false
util.types.isInt32Array(new Int32Array());  // Returns true
util.types.isInt32Array(new Float64Array());  // Returns false
```

### `util.types.isKeyObject(value)`

<!-- YAML
added: v16.2.0
-->

* `value` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if `value` is a [KeyObject](#class-keyobject), `false` otherwise.

### `util.types.isMap(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) instance.

```js
util.types.isMap(new Map());  // Returns true
```

### `util.types.isMapIterator(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is an iterator returned for a built-in
[Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) instance.

```js
const map = new Map();
util.types.isMapIterator(map.keys());  // Returns true
util.types.isMapIterator(map.values());  // Returns true
util.types.isMapIterator(map.entries());  // Returns true
util.types.isMapIterator(map[Symbol.iterator]());  // Returns true
```

### `util.types.isModuleNamespaceObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is an instance of a [Module Namespace Object][].

=== "MJS"

    ```js
    import * as ns from './a.js';
    
    util.types.isModuleNamespaceObject(ns);  // Returns true
    ```

### `util.types.isNativeError(value)`

<!-- YAML
added: v10.0.0
deprecated: v24.2.0
-->

> Stability: 0 - Deprecated: Use [`Error.isError`][] instead.

**Note:** As of Node.js 24, `Error.isError()` is currently slower than `util.types.isNativeError()`.
If performance is critical, consider benchmarking both in your environment.

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value was returned by the constructor of a
[built-in `Error` type][].

```js
console.log(util.types.isNativeError(new Error()));  // true
console.log(util.types.isNativeError(new TypeError()));  // true
console.log(util.types.isNativeError(new RangeError()));  // true
```

Subclasses of the native error types are also native errors:

```js
class MyError extends Error {}
console.log(util.types.isNativeError(new MyError()));  // true
```

A value being `instanceof` a native error class is not equivalent to `isNativeError()`
returning `true` for that value. `isNativeError()` returns `true` for errors
which come from a different [realm][] while `instanceof Error` returns `false`
for these errors:

=== "MJS"

    ```js
    import { createContext, runInContext } from 'node:vm';
    import { types } from 'node:util';
    
    const context = createContext({});
    const myError = runInContext('new Error()', context);
    console.log(types.isNativeError(myError)); // true
    console.log(myError instanceof Error); // false
    ```

=== "CJS"

    ```js
    const { createContext, runInContext } = require('node:vm');
    const { types } = require('node:util');
    
    const context = createContext({});
    const myError = runInContext('new Error()', context);
    console.log(types.isNativeError(myError)); // true
    console.log(myError instanceof Error); // false
    ```

Conversely, `isNativeError()` returns `false` for all objects which were not
returned by the constructor of a native error. That includes values
which are `instanceof` native errors:

```js
const myError = { __proto__: Error.prototype };
console.log(util.types.isNativeError(myError)); // false
console.log(myError instanceof Error); // true
```

### `util.types.isNumberObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a number object, e.g. created
by `new Number()`.

```js
util.types.isNumberObject(0);  // Returns false
util.types.isNumberObject(new Number(0));   // Returns true
```

### `util.types.isPromise(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
util.types.isPromise(Promise.resolve(42));  // Returns true
```

### `util.types.isProxy(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) instance.

```js
const target = {};
const proxy = new Proxy(target, {});
util.types.isProxy(target);  // Returns false
util.types.isProxy(proxy);  // Returns true
```

### `util.types.isRegExp(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a regular expression object.

```js
util.types.isRegExp(/abc/);  // Returns true
util.types.isRegExp(new RegExp('abc'));  // Returns true
```

### `util.types.isSet(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) instance.

```js
util.types.isSet(new Set());  // Returns true
```

### `util.types.isSetIterator(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is an iterator returned for a built-in
[Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) instance.

```js
const set = new Set();
util.types.isSetIterator(set.keys());  // Returns true
util.types.isSetIterator(set.values());  // Returns true
util.types.isSetIterator(set.entries());  // Returns true
util.types.isSetIterator(set[Symbol.iterator]());  // Returns true
```

### `util.types.isSharedArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) instance.
This does _not_ include [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) instances. Usually, it is
desirable to test for both; See [`util.types.isAnyArrayBuffer()`][] for that.

```js
util.types.isSharedArrayBuffer(new ArrayBuffer());  // Returns false
util.types.isSharedArrayBuffer(new SharedArrayBuffer());  // Returns true
```

### `util.types.isStringObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a string object, e.g. created
by `new String()`.

```js
util.types.isStringObject('foo');  // Returns false
util.types.isStringObject(new String('foo'));   // Returns true
```

### `util.types.isSymbolObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a symbol object, created
by calling `Object()` on a `Symbol` primitive.

```js
const symbol = Symbol('foo');
util.types.isSymbolObject(symbol);  // Returns false
util.types.isSymbolObject(Object(symbol));   // Returns true
```

### `util.types.isTypedArray(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) instance.

```js
util.types.isTypedArray(new ArrayBuffer());  // Returns false
util.types.isTypedArray(new Uint8Array());  // Returns true
util.types.isTypedArray(new Float64Array());  // Returns true
```

See also [`ArrayBuffer.isView()`][].

### `util.types.isUint8Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) instance.

```js
util.types.isUint8Array(new ArrayBuffer());  // Returns false
util.types.isUint8Array(new Uint8Array());  // Returns true
util.types.isUint8Array(new Float64Array());  // Returns false
```

### `util.types.isUint8ClampedArray(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Uint8ClampedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray) instance.

```js
util.types.isUint8ClampedArray(new ArrayBuffer());  // Returns false
util.types.isUint8ClampedArray(new Uint8ClampedArray());  // Returns true
util.types.isUint8ClampedArray(new Float64Array());  // Returns false
```

### `util.types.isUint16Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Uint16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array) instance.

```js
util.types.isUint16Array(new ArrayBuffer());  // Returns false
util.types.isUint16Array(new Uint16Array());  // Returns true
util.types.isUint16Array(new Float64Array());  // Returns false
```

### `util.types.isUint32Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [Uint32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array) instance.

```js
util.types.isUint32Array(new ArrayBuffer());  // Returns false
util.types.isUint32Array(new Uint32Array());  // Returns true
util.types.isUint32Array(new Float64Array());  // Returns false
```

### `util.types.isWeakMap(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) instance.

```js
util.types.isWeakMap(new WeakMap());  // Returns true
```

### `util.types.isWeakSet(value)`

<!-- YAML
added: v10.0.0
-->

* `value` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the value is a built-in [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) instance.

```js
util.types.isWeakSet(new WeakSet());  // Returns true
```

## Deprecated APIs

The following APIs are deprecated and should no longer be used. Existing
applications and modules should be updated to find alternative approaches.

### `util._extend(target, source)`

<!-- YAML
added: v0.7.5
deprecated: v6.0.0
-->

> Stability: 0 - Deprecated: Use [`Object.assign()`][] instead.

* `target` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `source` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

The `util._extend()` method was never intended to be used outside of internal
Node.js modules. The community found and used it anyway.

It is deprecated and should not be used in new code. JavaScript comes with very
similar built-in functionality through [`Object.assign()`][].

An automated migration is available ([source](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-extend-to-object-assign)):

```bash
npx codemod@latest @nodejs/util-extend-to-object-assign
```

### `util.isArray(object)`

<!-- YAML
added: v0.6.0
deprecated: v4.0.0
-->

> Stability: 0 - Deprecated: Use [`Array.isArray()`][] instead.

* `object` {any}
* Returns: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Alias for [`Array.isArray()`][].

Returns `true` if the given `object` is an `Array`. Otherwise, returns `false`.

```js
const util = require('node:util');

util.isArray([]);
// Returns: true
util.isArray(new Array());
// Returns: true
util.isArray({});
// Returns: false
```

An automated migration is available ([source](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

```bash
npx codemod@latest @nodejs/util-is
```

[Common System Errors]: errors.md#common-system-errors
[Custom inspection functions on objects]: #custom-inspection-functions-on-objects
[Custom promisified functions]: #custom-promisified-functions
[Customizing `util.inspect` colors]: #customizing-utilinspect-colors
[Internationalization]: intl.md
[Module Namespace Object]: https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects
[WHATWG Encoding Standard]: https://encoding.spec.whatwg.org/
[`'uncaughtException'`]: process.md#event-uncaughtexception
[`'warning'`]: process.md#event-warning
[`Array.isArray()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
[`ArrayBuffer.isView()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView
[`Error.isError`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError
[`JSON.stringify()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[`MIMEparams`]: #class-utilmimeparams
[`Object.assign()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
[`Object.freeze()`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
[`Runtime.ScriptId`]: https://chromedevtools.github.io/devtools-protocol/1-3/Runtime/#type-ScriptId
[`assert.deepStrictEqual()`]: assert.md#assertdeepstrictequalactual-expected-message
[`console.error()`]: console.md#consoleerrordata-args
[`mime.toString()`]: #mimetostring
[`mimeParams.entries()`]: #mimeparamsentries
[`napi_create_external()`]: n-api.md#napi_create_external
[`signal(7)`]: https://man7.org/linux/man-pages/man7/signal.7.html
[`target` and `handler`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#terminology
[`tty.hasColors()`]: tty.md#writestreamhascolorscount-env
[`util.diff()`]: #utildiffactual-expected
[`util.format()`]: #utilformatformat-args
[`util.inspect()`]: #utilinspectobject-options
[`util.promisify()`]: #utilpromisifyoriginal
[`util.types.isAnyArrayBuffer()`]: #utiltypesisanyarraybuffervalue
[`util.types.isArrayBuffer()`]: #utiltypesisarraybuffervalue
[`util.types.isSharedArrayBuffer()`]: #utiltypesissharedarraybuffervalue
[async function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[built-in `Error` type]: https://tc39.es/ecma262/#sec-error-objects
[compare function]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters
[constructor]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor
[default sort]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
[global symbol registry]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for
[list of deprecated APIS]: deprecations.md#list-of-deprecated-apis
[modifiers]: #modifiers
[realm]: https://tc39.es/ecma262/#realm
[semantically incompatible]: https://github.com/nodejs/node/issues/4179
[util.inspect.custom]: #utilinspectcustom
