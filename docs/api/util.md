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

* `original` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Асинхронная функция
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функцию в стиле колбэка с ошибкой первым аргументом

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
исключение, процесс испустит [`'uncaughtException'`][`'uncaughtException'`], и при отсутствии
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

* `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сигнала (например `'SIGTERM'`)
* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, соответствующий `signal`

`util.convertProcessSignalToExitCode()` преобразует имя сигнала в код выхода POSIX.
По POSIX код для завершения по сигналу: `128 + номер сигнала`.

При недопустимом имени сигнала выбрасывается ошибка. Список сигналов: [`signal(7)`][`signal(7)`].

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

* `section` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Идентификатор части приложения, для которой создаётся `debuglog`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при первом обращении к логгеру и получает более
  оптимизированную функцию логирования.
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция логирования

`util.debuglog()` создаёт функцию, которая при совпадении имени `section` с переменной
окружения `NODE_DEBUG` пишет отладочные сообщения в `stderr` (по смыслу как
[`console.error()`][`console.error()`]); иначе функция ничего не делает.

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

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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
    | v25.2.0, v24.12.0 | Добавлен объект параметров с `modifyPrototype` для условного изменения прототипа устаревшего объекта. |
    | v10.0.0 | Предупреждения об устаревании выдаются только один раз для каждого кода. |

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Помечаемая как устаревшая функция.
* `msg` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст предупреждения при вызове устаревшей функции.
* `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Код устаревания. Список кодов — в [списке устаревших API][list of deprecated APIS].
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `modifyPrototype` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если false — не менять прототип объекта при выводе предупреждения.
    **По умолчанию:** `true`.
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обёртка над устаревшей функцией с выводом предупреждения.

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

При вызове `util.deprecate()` возвращается функция, которая выдаёт `DeprecationWarning` через событие [`'warning'`][`'warning'`]. Предупреждение выводится в `stderr` при первом вызове возвращаемой функции; затем вызывается обёрнутая функция без повторного предупреждения.

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

* `actual` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Первое сравниваемое значение

* `expected` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Второе сравниваемое значение

* Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив записей различий; каждая запись — массив из двух элементов:
  * `0` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код операции: `-1` удаление, `0` без изменений, `1` вставка
  * `1` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение, связанное с операцией

* Сложность алгоритма: O(N*D), где:

* N — суммарная длина двух последовательностей (N = actual.length + expected.length)

* D — расстояние редактирования (минимальное число операций для превращения одной последовательности в другую).

[`util.diff()`][`util.diff()`] сравнивает две строки или массива и возвращает массив записей различий.
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

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строка формата в стиле `printf`.

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
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Отформатированная строка

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

* `inspectOptions` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Как [`util.format()`][`util.format()`], но дополнительно принимает `inspectOptions` — опции для
[`util.inspect()`][`util.inspect()`].

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

* `frameCount` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько кадров стека захватить как объекты call site.
  **По умолчанию:** `10`. Допустимый диапазон 1–200.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательно
  * `sourceMap` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Восстанавливать исходное место в стеке по source map;
    по умолчанию включается с флагом `--enable-source-maps`.
* Возвращает: [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Массив объектов call site
  * `functionName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя функции для этого call site.
  * `scriptName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя ресурса со скриптом для этой функции.
  * `scriptId` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Уникальный идентификатор скрипта, как в протоколе Chrome DevTools [`Runtime.ScriptId`][`Runtime.ScriptId`].
  * `lineNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер строки в JS (с 1).
  * `columnNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер колонки в JS (с 1).

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

* `err` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает строковое имя числового кода ошибки из API Node.js.
Соответствие кодов и имён зависит от платформы.
Имена распространённых ошибок см. в [Common System Errors][Common System Errors].

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

* Возвращает: [`<Map>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

Возвращает `Map` всех кодов системных ошибок, доступных из API Node.js.
Соответствие кодов и имён зависит от платформы.
Имена распространённых ошибок см. в [Common System Errors][Common System Errors].

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

* `err` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

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

* `enable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

* `constructor` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `superConstructor` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Использование `util.inherits()` не рекомендуется. Лучше ключевые слова ES6 `class` и
`extends` для наследования на уровне языка. Стили [semantically incompatible][semantically incompatible].

Копирует методы прототипа из одного [constructor][constructor] в другой. Прототип `constructor`
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

Пример на ES6 с `class` и `extends`:

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
    | v17.3.0, v16.14.0 | Опция `numericSeparator` теперь поддерживается. |
    | v16.18.0 | Добавлена поддержка `maxArrayLength` при осмотре `Set` и `Map`. |
    | v14.6.0, v12.19.0 | Если «объект» теперь принадлежит другому «vm.Context», пользовательская функция проверки на нем больше не будет получать аргументы, зависящие от контекста. |
    | v13.13.0, v12.17.0 | Опция `maxStringLength` теперь поддерживается. |
    | v13.5.0, v12.16.0 | Определенные пользователем свойства прототипа проверяются, если `showHidden` имеет значение `true`. |
    | v13.0.0 | Круговые ссылки теперь включают в себя маркер ссылки. |
    | v12.0.0 | Значение по умолчанию для параметра `compact` изменено на `3`, а значение по умолчанию для параметра `breakLength` изменено на `80`. |
    | v12.0.0 | Внутренние свойства больше не отображаются в аргументе контекста пользовательской функции проверки. |
    | v11.11.0 | Опция `compact` принимает числа для нового режима вывода. |
    | v11.7.0 | ArrayBuffers теперь также отображают свое двоичное содержимое. |
    | v11.5.0 | Опция `getters` теперь поддерживается. |
    | v11.4.0 | Значение глубины по умолчанию снова изменено на «2». |
    | v11.0.0 | Значение глубины по умолчанию изменено на «20». |
    | v11.0.0 | Выходные данные проверки теперь ограничены примерно 128 МБ. Данные, превышающие этот размер, не будут полностью проверены. |
    | v10.12.0 | Опция `sorted` теперь поддерживается. |
    | v10.6.0 | Проверка связанных списков и подобных объектов теперь возможна до максимального размера стека вызовов. |
    | v10.0.0 | Записи WeakMap и WeakSet теперь также можно проверить. |
    | v9.9.0 | Опция `compact` теперь поддерживается. |
    | v6.6.0 | Пользовательские функции проверки теперь могут возвращать `this`. |
    | v6.3.0 | Опция `breakLength` теперь поддерживается. |
    | v6.1.0 | Опция `maxArrayLength` теперь поддерживается; в частности, длинные массивы по умолчанию усекаются. |
    | v6.1.0 | Опция `showProxy` теперь поддерживается. |

* `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любой примитив JavaScript или `Object`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `showHidden` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, в результат форматирования включаются неперечисляемые символы и свойства `object`,
    а также записи [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и
    [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) и пользовательские свойства прототипа
    (кроме методов). **По умолчанию:** `false`.
  * `depth` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз рекурсивно форматировать
    `object`. Полезно при просмотре больших объектов. Чтобы рекурсировать до
    максимальной глубины стека вызовов, укажите `Infinity` или `null`.
    **По умолчанию:** `2`.
  * `colors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, вывод оформляется ANSI-кодами цвета.
    Цвета настраиваются. См. [настройку цветов `util.inspect`][Customizing `util.inspect` colors].
    **По умолчанию:** `false`.
  * `customInspect` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`,
    функции `[util.inspect.custom](depth, opts, inspect)` не вызываются.
    **По умолчанию:** `true`.
  * `showProxy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, при осмотре `Proxy` включаются
    объекты [`target` и `handler`][`target` and `handler`]. **По умолчанию:** `false`.
  * `maxArrayLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число элементов `Array`,
    [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map), [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet), включаемых при форматировании.
    Укажите `null` или `Infinity`, чтобы показать все элементы. `0` или
    отрицательное значение — не показывать элементы. **По умолчанию:** `100`.
  * `maxStringLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число символов,
    включаемых при форматировании. `null` или `Infinity` — показать всю строку.
    `0` или отрицательное — не показывать символы. **По умолчанию:** `10000`.
  * `breakLength` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длина, при которой значения переносятся на
    несколько строк. `Infinity` — весь ввод в одну строку
    (в сочетании с `compact`, равным `true` или числу >= `1`).
    **По умолчанию:** `80`.
  * `compact` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) При `false` каждый ключ объекта выводится
    с новой строки. Длинный текст переносится по строкам длиннее `breakLength`.
    Если задано число, до `n` вложенных элементов объединяются в одну строку,
    пока все свойства помещаются в `breakLength`. Короткие элементы массивов
    тоже группируются. Подробнее см. пример ниже. **По умолчанию:** `3`.
  * `sorted` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Если `true` или задана функция, все свойства
    объекта, а также записи `Set` и `Map` сортируются в итоговой
    строке. При `true` используется [сортировка по умолчанию][default sort]. Если передана функция,
    она используется как [функция сравнения][compare function].
  * `getters` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При `true` осматриваются геттеры. При
    `'get'` — только геттеры без соответствующего сеттера. При
    `'set'` — только геттеры с соответствующим сеттером.
    Это может вызвать побочные эффекты в зависимости от геттера.
    **По умолчанию:** `false`.
  * `numericSeparator` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, в bigint и числах каждые три цифры
    разделяются подчёркиванием.
    **По умолчанию:** `false`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Представление `object` в виде строки.

Метод `util.inspect()` возвращает строковое представление `object` для
отладки. Вывод `util.inspect` может меняться в любой момент
и не должен использоваться как стабильный программный контракт. Можно передать
дополнительные `options`, меняющие результат.
`util.inspect()` использует имя конструктора и/или свойство `Symbol.toStringTag`,
чтобы сформировать узнаваемую метку для просматриваемого значения.

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

Циклические ссылки указывают на якорь через индекс ссылки:

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

Следующий пример выводит все свойства объекта `util`:

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

Следующий пример показывает влияние опции `compact`:

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

Опция `showHidden` позволяет просматривать записи [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet).
Если записей больше, чем `maxArrayLength`, не гарантируется, какие именно будут показаны.
То есть при двух вызовах для одних и тех же записей [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) вывод может различаться.
Кроме того, записи без сильных ссылок могут быть собраны сборщиком мусора в любой момент.

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

Опция `sorted` гарантирует, что порядок вставки свойств объекта не влияет
на результат `util.inspect()`.

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

Опция `numericSeparator` добавляет подчёркивание каждые три цифры во всех
числах.

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

`util.inspect()` — синхронный метод для отладки. Максимальная длина вывода — около 128 МиБ.
При большем объёме вывод усекается.

### Настройка цветов `util.inspect` {#customizing-utilinspect-colors}

<!-- type=misc -->

Цветной вывод (если включён) для `util.inspect` можно настроить глобально
через свойства `util.inspect.styles` и `util.inspect.colors`.

`util.inspect.styles` сопоставляет имя стиля цвету из
`util.inspect.colors`.

Стили по умолчанию и соответствующие цвета:

* `bigint`: `yellow`
* `boolean`: `yellow`
* `date`: `magenta`
* `module`: `underline`
* `name`: (без оформления)
* `null`: `bold`
* `number`: `yellow`
* `regexp`: Метод, раскрашивающий классы символов, группы, утверждения и
  другие части для лучшей читаемости. Чтобы настроить раскраску, измените
  свойство `colors`. По умолчанию оно равно
  `['red', 'green', 'yellow', 'cyan', 'magenta']` и может быть
  скорректировано по необходимости. Массив циклически обходится в зависимости от
  «глубины».
* `special`: `cyan` (например, `Proxies`)
* `string`: `green`
* `symbol`: `green`
* `undefined`: `grey`

Оформление цветом использует ANSI-коды; не все терминалы их поддерживают.
Чтобы проверить поддержку цветов, используйте [`tty.hasColors()`][`tty.hasColors()`].

Предопределённые коды перечислены ниже (группы «Модификаторы», «цвета переднего плана» и «цвета фона»).

#### Сложная пользовательская раскраска

Стиль можно задать методом. Он получает строковое представление
входного значения. Вызывается, когда раскраска активна и тип
обрабатывается.

Пример: `util.inspect.styles.regexp(value)`

* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковое представление типа входного значения.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Скорректированное представление объекта.

#### Модификаторы {#modifiers}

Поддержка модификаторов зависит от терминала. Неподдерживаемые обычно
игнорируются.

* `reset` — сбрасывает все модификаторы (цвета) к значениям по умолчанию
* **bold** — жирный текст
* _italic_ — курсив
* <span style="border-bottom: 1px solid;">underline</span> — подчёркивание
* ~~strikethrough~~ — горизонтальная линия через центр текста
  (псевдонимы: `strikeThrough`, `crossedout`, `crossedOut`)
* `hidden` — текст выводится, но невидим (псевдоним: conceal)
* <span style="opacity: 0.5;">dim</span> — снижена интенсивность цвета (псевдонимы:
  `faint`)
* <span style="border-top: 1px solid;">overlined</span> — надчёркивание
* blink — текст мигает с интервалом
* <span style="filter: invert(100%);">inverse</span> — меняет местами цвет текста и фона (псевдонимы: `swapcolors`, `swapColors`)
* <span style="border-bottom: 1px double;">doubleunderline</span> — двойное подчёркивание (псевдонимы: `doubleUnderline`)
* <span style="border: 1px solid;">framed</span> — рамка вокруг текста

#### Цвета переднего плана

* `black`
* `red`
* `green`
* `yellow`
* `blue`
* `magenta`
* `cyan`
* `white`
* `gray` (псевдонимы: `grey`, `blackBright`)
* `redBright`
* `greenBright`
* `yellowBright`
* `blueBright`
* `magentaBright`
* `cyanBright`
* `whiteBright`

#### Цвета фона

* `bgBlack`
* `bgRed`
* `bgGreen`
* `bgYellow`
* `bgBlue`
* `bgMagenta`
* `bgCyan`
* `bgWhite`
* `bgGray` (псевдонимы: `bgGrey`, `bgBlackBright`)
* `bgRedBright`
* `bgGreenBright`
* `bgYellowBright`
* `bgBlueBright`
* `bgMagentaBright`
* `bgCyanBright`
* `bgWhiteBright`

### Пользовательские функции осмотра у объектов {#custom-inspection-functions-on-objects}

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

Объекты также могут определять собственную функцию
[`[util.inspect.custom](depth, opts, inspect)`][util.inspect.custom],
которую `util.inspect()` вызовет и чей результат использует при осмотре
объекта.

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

Пользовательские функции `[util.inspect.custom](depth, opts, inspect)` обычно возвращают
строку, но могут вернуть значение любого типа, которое затем форматируется
через `util.inspect()`.

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

* Тип: [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Символ для объявления пользовательских функций осмотра.

Помимо доступа через `util.inspect.custom`, этот
символ [зарегистрирован глобально][global symbol registry] и доступен
в любой среде как `Symbol.for('nodejs.util.inspect.custom')`.

Так можно писать переносимый код: пользовательская функция осмотра
используется в Node.js и игнорируется в браузере.
Сама `util.inspect()` передаётся третьим аргументом в пользовательскую
функцию осмотра для дальнейшей переносимости.

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

Подробнее см. [пользовательские функции осмотра у объектов][Custom inspection functions on objects].

### `util.inspect.defaultOptions`

<!-- YAML
added: v6.4.0
-->

Значение `defaultOptions` задаёт параметры по умолчанию для
`util.inspect`. Полезно для `console.log` и
`util.format`, которые неявно вызывают `util.inspect`. Его следует задать как
объект с одним или несколькими допустимыми параметрами [`util.inspect()`][`util.inspect()`].
Поддерживается и прямое присвоение полей опций.

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

* `val1` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* `val2` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* `skipPrototype` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, при строгом глубоком сравнении
  не сравниваются прототип и конструктор. **По умолчанию:** `false`.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если между `val1` и `val2` выполняется строгое глубокое равенство.
Иначе возвращает `false`.

По умолчанию строгое глубокое равенство включает сравнение прототипов и
конструкторов. При `skipPrototype` равным `true` объекты с
разными прототипами или конструкторами могут считаться равными, если их
перечисляемые свойства строго глубоко равны.

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

См. [`assert.deepStrictEqual()`][`assert.deepStrictEqual()`] подробнее о строгом глубоком равенстве.

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

Реализация [класса MIMEType](https://bmeck.github.io/node-proposal-mime-api/).

В соответствии с браузерными соглашениями все свойства объектов `MIMEType`
реализованы как геттеры и сеттеры на прототипе класса, а не как
свойства-данные на самом объекте.

MIME-строка — структурированная строка с несколькими значимыми
частями. После разбора возвращается объект `MIMEType` со
свойствами для каждой из частей.

### `new MIMEType(input)`

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Входная MIME-строка для разбора

Создаёт новый объект `MIMEType`, разобрав `input`.

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

Будет выброшен `TypeError`, если `input` не является допустимой MIME-строкой.
Значения при необходимости приводятся к строкам. Например:

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

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт часть типа MIME.

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

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Читает и задаёт часть подтипа MIME.

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

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает сущность (essence) MIME. Свойство только для чтения.
Чтобы изменить MIME, используйте `mime.type` или `mime.subtype`.

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

* Тип: [`<MIMEParams>`](#class-utilmimeparams)

Возвращает объект [`MIMEParams`][`MIMEparams`], представляющий
параметры MIME. Свойство только для чтения. Подробности — в документации
[`MIMEParams`][`MIMEparams`].

### `mime.toString()`

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `toString()` объекта `MIMEType` возвращает сериализованную MIME-строку.

В целях соответствия стандарту этот метод не позволяет настраивать
процесс сериализации MIME.

### `mime.toJSON()`

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Псевдоним [`mime.toString()`][`mime.toString()`].

Этот метод вызывается автоматически при сериализации объекта `MIMEType`
через [`JSON.stringify()`][`JSON.stringify()`].

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

API `MIMEParams` даёт чтение и запись параметров
`MIMEType`.

### `new MIMEParams()`

Создаёт новый объект `MIMEParams` с пустым набором параметров

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

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Удаляет все пары имя–значение с именем `name`.

### `mimeParams.entries()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает итератор по парам имя–значение в параметрах.
Каждый элемент итератора — массив JavaScript: первый элемент —
`name`, второй — `value`.

### `mimeParams.get(name)`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | `null` Строка или `null`, если пары с таким `name` нет

Возвращает значение первой пары с именем `name`. Если таких пар нет,
возвращается `null`.

### `mimeParams.has(name)`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если есть хотя бы одна пара с именем `name`.

### `mimeParams.keys()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает итератор по именам пар имя–значение.

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

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Задаёт в объекте `MIMEParams` для `name` значение
`value`. Если уже есть пары с именем `name`,
значение первой такой пары заменяется на `value`.

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

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Возвращает итератор по значениям пар имя–значение.

### `mimeParams[Symbol.iterator]()`

* Возвращает: [`<Iterator>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol)

Псевдоним [`mimeParams.entries()`][`mimeParams.entries()`].

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
    | v22.4.0, v20.16.0 | Добавлена поддержка отрицательных опций во входном `config`. |
    | v20.0.0 | API больше не является экспериментальным. |
    | v18.11.0, v16.19.0 | Добавлена поддержка значений по умолчанию во входной `config`. |
    | v18.7.0, v16.17.0 | Добавлен возврат подробной информации о разборе через токены во входном `config` и в возвращаемых свойствах. |

* `config` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Задаёт аргументы для разбора и настраивает
  парсер. Поддерживаются свойства:
  * `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив строк аргументов. **По умолчанию:** `process.argv`
    без `execPath` и `filename`.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Описание известных парсеру опций.
    Ключи `options` — длинные имена опций, значения —
    [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
    * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип аргумента: `boolean` или `string`.
    * `multiple` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Можно ли указывать опцию несколько
      раз. При `true` значения собираются в массив. При
      `false` побеждает последнее значение. **По умолчанию:** `false`.
    * `short` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Односимвольный псевдоним опции.
    * `default` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Значение, если опция
      отсутствует в разбираемых аргументах. Тип должен совпадать с `type`.
      Если `multiple` равен `true`, значение — массив. Значение по умолчанию не применяется,
      если опция есть в аргументах, даже если передано ложное значение.
  * `strict` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Выбрасывать ли ошибку при неизвестных аргументах
    или при несоответствии типу из `options`.
    **По умолчанию:** `true`.
  * `allowPositionals` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Принимает ли команда позиционные
    аргументы.
    **По умолчанию:** `false`, если `strict` равен `true`, иначе `true`.
  * `allowNegative` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, можно явно задавать булевы опции
    в `false` префиксом `--no-` у имени.
    **По умолчанию:** `false`.
  * `tokens` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Возвращать ли разобранные токены. Полезно для расширения
    поведения: дополнительные проверки или повторная обработка токенов.
    **По умолчанию:** `false`.

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Разобранные аргументы командной строки:
  * `values` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Соответствие имён опций значениям [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    или [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).
  * `positionals` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Позиционные аргументы.
  * `tokens` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined) См. раздел [токены `parseArgs`](#parseargs-tokens).
    Возвращается только при `tokens: true` в `config`.

Высокоуровневый API разбора аргументов командной строки по сравнению с прямой работой
с `process.argv`. Принимает описание ожидаемых аргументов
и возвращает структурированный объект с опциями и позиционными аргументами.

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

### Токены `parseArgs` {#parseargs-tokens}

Подробная информация о разборе доступна для пользовательской логики при
`tokens: true` в конфигурации.
У возвращаемых токенов есть свойства:

* все токены
  * `kind` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из значений: `'option'`, `'positional'`, `'option-terminator'`.
  * `index` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Индекс элемента в `args`, содержащего токен; исходный
    аргумент — `args[token.index]`.
* токены опций
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Длинное имя опции.
  * `rawName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Как опция указана в `args`, например `-f` или `--foo`.
  * `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined) Значение опции в `args`.
    Для булевых опций — `undefined`.
  * `inlineValue` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined) Указано ли значение в той же записи,
    как `--foo=bar`.
* позиционные токены
  * `value` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение позиционного аргумента в `args` (то есть `args[index]`).
* токен-разделитель опций

Токены возвращаются в порядке появления во входном массиве `args`. Повторные опции
дают отдельный токен на каждое использование. Короткие группы вроде `-xy` разворачиваются в токен на каждую опцию. Например, `-xxx` даёт три токена.

Например, для опции вроде `--no-color` (при `allowNegative` и типе `boolean`)
можно повторно обработать токены, чтобы изменить сохраняемое значение для отрицательной формы.

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

Пример: отрицательные опции; при нескольких вариантах побеждает последний.

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

* `content` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Сырое содержимое файла `.env`.

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Пример файла `.env`:

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

* `original` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Принимает функцию в стиле error-first с колбэком
`(err, value) => ...` последним аргументом и возвращает вариант,
возвращающий промисы.

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

Или эквивалентно с `async function`:

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

Если у `original` есть свойство `original[util.promisify.custom]`, `promisify`
вернёт его значение, см. [Custom promisified functions][Custom promisified functions].

`promisify()` предполагает, что `original` — функция с колбэком
последним аргументом во всех случаях. Если `original` не функция, `promisify()`
выбросит ошибку. Если `original` — функция, но последний аргумент не
колбэк в стиле error-first, ему всё равно будет передан error-first
колбэк последним аргументом.

Использование `promisify()` с методами класса или другими методами с `this` может
вести себя неожиданно без особой обработки:

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

Символ `util.promisify.custom` позволяет переопределить результат
[`util.promisify()`][`util.promisify()`]:

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

Полезно, если исходная функция не следует стандартному формату с error-first колбэком последним аргументом.

Например, функция принимает
`(foo, onSuccessCallback, onErrorCallback)`:

```js
doSomething[util.promisify.custom] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```

Если `promisify.custom` задан, но это не функция, `promisify()` выбросит ошибку.

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

* Тип: [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Символ для объявления пользовательских promisify-обёрток;
  см. [Custom promisified functions][Custom promisified functions].

Помимо доступа через `util.promisify.custom`, символ
[зарегистрирован глобально][global symbol registry] и доступен как
`Symbol.for('nodejs.util.promisify.custom')`.

Например, функция принимает
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

* `str` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает `str` без ANSI escape-последовательностей.

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
    | v22.8.0, v20.18.0 | Учитываются isTTY и переменные окружения NO_COLOR, NODE_DISABLE_COLORS и FORCE_COLOR. |

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Формат текста или массив
  форматов из `util.inspect.colors`, либо hex-цвет `#RGB`
  или `#RRGGBB`.
* `text` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст для форматирования.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `validateStream` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если true, проверяется, поддерживает ли `stream` цвета. **По умолчанию:** `true`.
  * `stream` [`<Stream>`](stream.md#stream) Поток для проверки поддержки цвета. **По умолчанию:** `process.stdout`.

Возвращает отформатированный текст с учётом переданного `format`
для вывода в терминал. Учитывает возможности терминала
и переменные окружения `NO_COLOR`,
`NODE_DISABLE_COLORS` и `FORCE_COLOR`.

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

`util.inspect.colors` также задаёт форматы вроде `italic` и
`underline`; их можно комбинировать:

=== "CJS"

    ```js
    console.log(
      util.styleText(['underline', 'italic'], 'My italic underlined message'),
    );
    ```

При массиве форматов порядок слева направо; более поздний стиль может перекрыть предыдущий.

=== "CJS"

    ```js
    console.log(
      util.styleText(['red', 'green'], 'text'), // green
    );
    ```

Специальное значение `none` не добавляет оформления к тексту.

Помимо имён цветов `util.styleText()` поддерживает hex-строки
через ANSI TrueColor (24 бита). Допустимы 3 (`#RGB`) и 6 (`#RRGGBB`) шестнадцатеричных цифр:

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

Полный список форматов — в подразделе [«Модификаторы»][modifiers].

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

Реализация API `TextDecoder` по [WHATWG Encoding Standard][WHATWG Encoding Standard].

```js
const decoder = new TextDecoder();
const u8arr = new Uint8Array([72, 101, 108, 108, 111]);
console.log(decoder.decode(u8arr)); // Hello
```

### Поддерживаемые кодировки WHATWG

Согласно [WHATWG Encoding Standard][WHATWG Encoding Standard], поддерживаемые кодировки `TextDecoder`
перечислены в таблицах ниже. Для каждой кодировки можно использовать
один или несколько псевдонимов.

В разных сборках Node.js набор кодировок различается
(см. [Internationalization][Internationalization])

#### Кодировки по умолчанию (полные данные ICU)

| Кодировка           | Псевдонимы                                                                                                                                                                                                                             |
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

#### Кодировки при сборке Node.js с опцией `small-icu`

| Кодировка    | Псевдонимы                      |
| ------------ | ------------------------------- |
| `'utf-8'`    | `'unicode-1-1-utf-8'`, `'utf8'` |
| `'utf-16le'` | `'utf-16'`                      |
| `'utf-16be'` |                                 |

#### Кодировки при отключённом ICU

| Кодировка    | Псевдонимы                      |
| ------------ | ------------------------------- |
| `'utf-8'`    | `'unicode-1-1-utf-8'`, `'utf8'` |
| `'utf-16le'` | `'utf-16'`                      |

Кодировка `'iso-8859-16'` из [WHATWG Encoding Standard][WHATWG Encoding Standard]
не поддерживается.

### `new TextDecoder([encoding[, options]])`

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, которую поддерживает этот экземпляр `TextDecoder`.
  **По умолчанию:** `'utf-8'`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `fatal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` — ошибки декодирования фатальны.
    Не поддерживается при отключённом ICU
    (см. [Internationalization][Internationalization]). **По умолчанию:** `false`.
  * `ignoreBOM` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` метка порядка байтов попадает в результат.
    При `false` BOM удаляется из вывода. Используется только для `encoding`
    `'utf-8'`, `'utf-16be'` или `'utf-16le'`. **По умолчанию:** `false`.

Создаёт экземпляр `TextDecoder`. В `encoding` указывается одна из
поддерживаемых кодировок или псевдоним.

Класс `TextDecoder` также доступен как глобальный.

### `textDecoder.decode([input[, options]])`

* `input` [`<ArrayBuffer>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) Экземпляр `ArrayBuffer`, `DataView` или
  `TypedArray` с закодированными данными.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `stream` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если ожидаются следующие фрагменты данных.
    **По умолчанию:** `false`.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Декодирует `input` и возвращает строку. При `options.stream` равном `true` неполные
байтовые последовательности в конце `input` буферизуются
и дописываются при следующем вызове `textDecoder.decode()`.

Если `textDecoder.fatal` равен `true`, ошибки декодирования приводят к
выбросу `TypeError`.

### `textDecoder.encoding`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Кодировка, поддерживаемая этим экземпляром `TextDecoder`.

### `textDecoder.fatal`

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Будет `true`, если ошибки декодирования приводят к выбросу `TypeError`.

### `textDecoder.ignoreBOM`

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Будет `true`, если в результат декодирования входит метка порядка байтов (BOM).

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

Реализация API `TextEncoder` по [WHATWG Encoding Standard][WHATWG Encoding Standard]. Все
экземпляры `TextEncoder` поддерживают только UTF-8.

```js
const encoder = new TextEncoder();
const uint8array = encoder.encode('this is some data');
```

Класс `TextEncoder` также доступен как глобальный.

### `textEncoder.encode([input])`

* `input` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст для кодирования. **По умолчанию:** пустая строка.
* Возвращает: [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)

Кодирует строку `input` в UTF-8 и возвращает `Uint8Array` с
байтами.

### `textEncoder.encodeInto(src, dest)`

<!-- YAML
added: v12.11.0
-->

* `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст для кодирования.
* `dest` [`<Uint8Array>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) Массив для результата кодирования.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `read` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число прочитанных кодовых единиц Unicode из `src`.
  * `written` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число записанных байт UTF-8 в `dest`.

Кодирует `src` в UTF-8 в `dest` и возвращает объект с полями
`read` и `written`.

```js
const encoder = new TextEncoder();
const src = 'this is some data';
const dest = new Uint8Array(10);
const { read, written } = encoder.encodeInto(src, dest);
```

### `textEncoder.encoding`

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Кодировка экземпляра `TextEncoder`. Всегда `'utf-8'`.

## `util.toUSVString(string)`

<!-- YAML
added:
  - v16.8.0
  - v14.18.0
-->

* `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает `string`, заменив суррогатные кодовые позиции
(или непарные суррогатные кодовые единицы) на
символ замены Unicode U+FFFD.

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

Создаёт и возвращает [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController), у которого [AbortSignal](globals.md#abortsignal) помечен
как передаваемый и может использоваться с `structuredClone()` или `postMessage()`.

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

* `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Возвращает: [`<AbortSignal>`](globals.md#abortsignal)

Помечает [AbortSignal](globals.md#abortsignal) как передаваемый для использования с
`structuredClone()` и `postMessage()`.

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
    | v24.0.0, v22.16.0 | Индекс стабильности изменён с экспериментального на стабильный. |

* `signal` [`<AbortSignal>`](globals.md#abortsignal)
* `resource` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Любой непустой объект, связанный с прерываемой операцией и удерживаемый слабо.
  Если `resource` собран до прерывания `signal`, промис остаётся в ожидании,
  и Node.js перестаёт его отслеживать.
  Это снижает риск утечек памяти в долгоживущих или неотменяемых операциях.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Подписывается на событие abort у `signal` и возвращает промис, который выполняется при прерывании `signal`.
Если передан `resource`, на объект операции держится слабая ссылка:
если `resource` собран до прерывания `signal`,
промис остаётся в ожидании.
Это снижает риск утечек памяти в долгоживущих или неотменяемых операциях.

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

`util.types` выполняет проверки типов встроенных объектов.
В отличие от `instanceof` и `Object.prototype.toString.call(value)`, эти проверки не
заглядывают в свойства, доступные из JavaScript (например в прототип),
и обычно вызывают код на C++.

Результат не гарантирует, какие свойства или поведение значение раскрывает в JavaScript.
В основном полезно авторам аддонов, проверяющим типы в JavaScript.

API доступен через `require('node:util').types` или `require('node:util/types')`.

### `util.types.isAnyArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или
[SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).

См. также [`util.types.isArrayBuffer()`][`util.types.isArrayBuffer()`] и
[`util.types.isSharedArrayBuffer()`][`util.types.isSharedArrayBuffer()`].

```js
util.types.isAnyArrayBuffer(new ArrayBuffer());  // Returns true
util.types.isAnyArrayBuffer(new SharedArrayBuffer());  // Returns true
```

### `util.types.isArrayBufferView(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — одно из представлений (views) [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer),
например типизированный массив или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView). Эквивалентно
[`ArrayBuffer.isView()`][`ArrayBuffer.isView()`].

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

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект `arguments`.

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

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer).
Не включает экземпляры [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer). Обычно нужно проверять оба; см. [`util.types.isAnyArrayBuffer()`][`util.types.isAnyArrayBuffer()`].

```js
util.types.isArrayBuffer(new ArrayBuffer());  // Returns true
util.types.isArrayBuffer(new SharedArrayBuffer());  // Returns false
```

### `util.types.isAsyncFunction(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — [async function][async function].
Отражает только то, что видит движок JavaScript;
в частности, при транспиляции результат может не совпадать с исходным кодом.

```js
util.types.isAsyncFunction(function foo() {});  // Returns false
util.types.isAsyncFunction(async function foo() {});  // Returns true
```

### `util.types.isBigInt64Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — экземпляр `BigInt64Array`.

```js
util.types.isBigInt64Array(new BigInt64Array());   // Returns true
util.types.isBigInt64Array(new BigUint64Array());  // Returns false
```

### `util.types.isBigIntObject(value)`

<!-- YAML
added: v10.4.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект BigInt, например
созданный через `Object(BigInt(123))`.

```js
util.types.isBigIntObject(Object(BigInt(123)));   // Returns true
util.types.isBigIntObject(BigInt(123));   // Returns false
util.types.isBigIntObject(123);  // Returns false
```

### `util.types.isBigUint64Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — экземпляр `BigUint64Array`.

```js
util.types.isBigUint64Array(new BigInt64Array());   // Returns false
util.types.isBigUint64Array(new BigUint64Array());  // Returns true
```

### `util.types.isBooleanObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект Boolean, например
созданный через `new Boolean()`.

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

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — любой объект-обёртка примитива, например
`new Boolean()`, `new String()` или `Object(Symbol())`.

Например:

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

* `value` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `value` — [CryptoKey](webcrypto.md#class-cryptokey), иначе `false`.

### `util.types.isDataView(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView).

```js
const ab = new ArrayBuffer(20);
util.types.isDataView(new DataView(ab));  // Returns true
util.types.isDataView(new Float64Array());  // Returns false
```

См. также [`ArrayBuffer.isView()`][`ArrayBuffer.isView()`].

### `util.types.isDate(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Date](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date).

```js
util.types.isDate(new Date());  // Returns true
```

### `util.types.isExternal(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — нативное `External`.

Нативное значение `External` — особый объект с указателем C++ (`void*`) для нативного кода,
без других свойств. Создаётся внутренностями Node.js или аддонами.
В JavaScript это [замороженные][`Object.freeze()`] объекты с прототипом `null`.

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

Подробнее о `napi_create_external` см.
[`napi_create_external()`][`napi_create_external()`].

### `util.types.isFloat16Array(value)`

<!-- YAML
added:
 - v24.0.0
 - v22.16.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Float16Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Float16Array).

```js
util.types.isFloat16Array(new ArrayBuffer());  // Returns false
util.types.isFloat16Array(new Float16Array());  // Returns true
util.types.isFloat16Array(new Float32Array());  // Returns false
```

### `util.types.isFloat32Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Float32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array).

```js
util.types.isFloat32Array(new ArrayBuffer());  // Returns false
util.types.isFloat32Array(new Float32Array());  // Returns true
util.types.isFloat32Array(new Float64Array());  // Returns false
```

### `util.types.isFloat64Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Float64Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array).

```js
util.types.isFloat64Array(new ArrayBuffer());  // Returns false
util.types.isFloat64Array(new Uint8Array());  // Returns false
util.types.isFloat64Array(new Float64Array());  // Returns true
```

### `util.types.isGeneratorFunction(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — генераторная функция.
Отражает только то, что видит движок; при транспиляции результат может не совпадать с исходным кодом.

```js
util.types.isGeneratorFunction(function foo() {});  // Returns false
util.types.isGeneratorFunction(function* foo() {});  // Returns true
```

### `util.types.isGeneratorObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект генератора, возвращённый встроенной генераторной функцией.
Отражает только то, что видит движок; при транспиляции результат может не совпадать с исходным кодом.

```js
function* foo() {}
const generator = foo();
util.types.isGeneratorObject(generator);  // Returns true
```

### `util.types.isInt8Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Int8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array).

```js
util.types.isInt8Array(new ArrayBuffer());  // Returns false
util.types.isInt8Array(new Int8Array());  // Returns true
util.types.isInt8Array(new Float64Array());  // Returns false
```

### `util.types.isInt16Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Int16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array).

```js
util.types.isInt16Array(new ArrayBuffer());  // Returns false
util.types.isInt16Array(new Int16Array());  // Returns true
util.types.isInt16Array(new Float64Array());  // Returns false
```

### `util.types.isInt32Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Int32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array).

```js
util.types.isInt32Array(new ArrayBuffer());  // Returns false
util.types.isInt32Array(new Int32Array());  // Returns true
util.types.isInt32Array(new Float64Array());  // Returns false
```

### `util.types.isKeyObject(value)`

<!-- YAML
added: v16.2.0
-->

* `value` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если `value` — [KeyObject](#class-keyobject), иначе `false`.

### `util.types.isMap(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

```js
util.types.isMap(new Map());  // Returns true
```

### `util.types.isMapIterator(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — итератор, возвращённый для встроенного экземпляра [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

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

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — экземпляр [Module Namespace Object][Module Namespace Object].

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

> Стабильность: 0 — устарело: используйте [`Error.isError`][`Error.isError`].

**Примечание:** в Node.js 24 `Error.isError()` пока медленнее `util.types.isNativeError()`.
При критичной производительности сравните оба варианта на своей среде.

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение создано конструктором
[built-in `Error` type][built-in `Error` type].

```js
console.log(util.types.isNativeError(new Error()));  // true
console.log(util.types.isNativeError(new TypeError()));  // true
console.log(util.types.isNativeError(new RangeError()));  // true
```

Подклассы встроенных типов ошибок тоже считаются нативными ошибками:

```js
class MyError extends Error {}
console.log(util.types.isNativeError(new MyError()));  // true
```

Проверка `instanceof` для класса нативной ошибки не эквивалентна `isNativeError()`
с результатом `true`. `isNativeError()` возвращает `true` для ошибок из другого [realm][realm], тогда как `instanceof Error` даёт `false`:

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

Наоборот, `isNativeError()` возвращает `false` для объектов, не созданных
конструктором нативной ошибки, в том числе для значений с `instanceof` нативной ошибки:

```js
const myError = { __proto__: Error.prototype };
console.log(util.types.isNativeError(myError)); // false
console.log(myError instanceof Error); // true
```

### `util.types.isNumberObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект Number, например
созданный через `new Number()`.

```js
util.types.isNumberObject(0);  // Returns false
util.types.isNumberObject(new Number(0));   // Returns true
```

### `util.types.isPromise(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
util.types.isPromise(Promise.resolve(42));  // Returns true
```

### `util.types.isProxy(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — экземпляр [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

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

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект регулярного выражения.

```js
util.types.isRegExp(/abc/);  // Returns true
util.types.isRegExp(new RegExp('abc'));  // Returns true
```

### `util.types.isSet(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

```js
util.types.isSet(new Set());  // Returns true
```

### `util.types.isSetIterator(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — итератор, возвращённый для встроенного экземпляра [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set).

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

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).
Не включает экземпляры [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer). Обычно нужно проверять оба; см. [`util.types.isAnyArrayBuffer()`][`util.types.isAnyArrayBuffer()`].

```js
util.types.isSharedArrayBuffer(new ArrayBuffer());  // Returns false
util.types.isSharedArrayBuffer(new SharedArrayBuffer());  // Returns true
```

### `util.types.isStringObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект String, например
созданный через `new String()`.

```js
util.types.isStringObject('foo');  // Returns false
util.types.isStringObject(new String('foo'));   // Returns true
```

### `util.types.isSymbolObject(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — объект Symbol, созданный
вызовом `Object()` над примитивом `Symbol`.

```js
const symbol = Symbol('foo');
util.types.isSymbolObject(symbol);  // Returns false
util.types.isSymbolObject(Object(symbol));   // Returns true
```

### `util.types.isTypedArray(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

```js
util.types.isTypedArray(new ArrayBuffer());  // Returns false
util.types.isTypedArray(new Uint8Array());  // Returns true
util.types.isTypedArray(new Float64Array());  // Returns true
```

См. также [`ArrayBuffer.isView()`][`ArrayBuffer.isView()`].

### `util.types.isUint8Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array).

```js
util.types.isUint8Array(new ArrayBuffer());  // Returns false
util.types.isUint8Array(new Uint8Array());  // Returns true
util.types.isUint8Array(new Float64Array());  // Returns false
```

### `util.types.isUint8ClampedArray(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Uint8ClampedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray).

```js
util.types.isUint8ClampedArray(new ArrayBuffer());  // Returns false
util.types.isUint8ClampedArray(new Uint8ClampedArray());  // Returns true
util.types.isUint8ClampedArray(new Float64Array());  // Returns false
```

### `util.types.isUint16Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Uint16Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array).

```js
util.types.isUint16Array(new ArrayBuffer());  // Returns false
util.types.isUint16Array(new Uint16Array());  // Returns true
util.types.isUint16Array(new Float64Array());  // Returns false
```

### `util.types.isUint32Array(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [Uint32Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array).

```js
util.types.isUint32Array(new ArrayBuffer());  // Returns false
util.types.isUint32Array(new Uint32Array());  // Returns true
util.types.isUint32Array(new Float64Array());  // Returns false
```

### `util.types.isWeakMap(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap).

```js
util.types.isWeakMap(new WeakMap());  // Returns true
```

### `util.types.isWeakSet(value)`

<!-- YAML
added: v10.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если значение — встроенный экземпляр [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet).

```js
util.types.isWeakSet(new WeakSet());  // Returns true
```

## Устаревшие API

Следующие API устарели и не должны использоваться. Существующие
приложения и модули следует обновить, используя альтернативы.

### `util._extend(target, source)`

<!-- YAML
added: v0.7.5
deprecated: v6.0.0
-->

> Стабильность: 0 — устарело: используйте [`Object.assign()`][`Object.assign()`].

* `target` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `source` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `util._extend()` не предназначался для использования вне внутренних
модулей Node.js, но сообщество всё равно им пользовалось.

API устарело; в новом коде не используйте. Похожее поведение даёт
[`Object.assign()`][`Object.assign()`].

Доступна автоматическая миграция ([исходник](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-extend-to-object-assign)):

```bash
npx codemod@latest @nodejs/util-extend-to-object-assign
```

### `util.isArray(object)`

<!-- YAML
added: v0.6.0
deprecated: v4.0.0
-->

> Стабильность: 0 — устарело: используйте [`Array.isArray()`][`Array.isArray()`].

* `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Псевдоним [`Array.isArray()`][`Array.isArray()`].

Возвращает `true`, если `object` — массив `Array`. Иначе возвращает `false`.

```js
const util = require('node:util');

util.isArray([]);
// Returns: true
util.isArray(new Array());
// Returns: true
util.isArray({});
// Returns: false
```

Доступна автоматическая миграция ([исходник](https://github.com/nodejs/userland-migrations/tree/main/recipes/util-is)):

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
