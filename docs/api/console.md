---
description: В console модуль предоставляет простую консоль отладки, аналогичную механизму консоли JavaScript, предоставляемому веб-браузерами
---

# Модуль console

<!--introduced_in=v0.10.13-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/console.js -->

В `console` Модуль предоставляет простую консоль отладки, аналогичную механизму консоли JavaScript, предоставляемому веб-браузерами.

Модуль экспортирует два конкретных компонента:

- А `Console` класс с такими методами, как `console.log()`, `console.error()` а также `console.warn()` который можно использовать для записи в любой поток Node.js.
- Глобальный `console` экземпляр настроен для записи в [`process.stdout`](process.md#processstdout) а также [`process.stderr`](process.md#processstderr). Глобальный `console` можно использовать без звонка `require('console')`.

**_Предупреждение_**: Методы глобального объекта консоли не являются ни постоянно синхронными, как API-интерфейсы браузера, на которые они похожи, ни они не являются последовательно асинхронными, как все другие потоки Node.js. Увидеть [примечание по вводу / выводу процесса](process.md#a-note-on-process-io) для дополнительной информации.

Пример использования глобального `console`:

```js
console.log('hello world');
// Prints: hello world, to stdout
console.log('hello %s', 'world');
// Prints: hello world, to stdout
console.error(new Error('Whoops, something bad happened'));
// Prints error message and stack trace to stderr:
//   Error: Whoops, something bad happened
//     at [eval]:5:15
//     at Script.runInThisContext (node:vm:132:18)
//     at Object.runInThisContext (node:vm:309:38)
//     at node:internal/process/execution:77:19
//     at [eval]-wrapper:6:22
//     at evalScript (node:internal/process/execution:76:60)
//     at node:internal/main/eval_string:23:3

const name = 'Will Robinson';
console.warn(`Danger ${name}! Danger!`);
// Prints: Danger Will Robinson! Danger!, to stderr
```

Пример использования `Console` класс:

```js
const out = getStreamSomehow();
const err = getStreamSomehow();
const myConsole = new console.Console(out, err);

myConsole.log('hello world');
// Prints: hello world, to out
myConsole.log('hello %s', 'world');
// Prints: hello world, to out
myConsole.error(
  new Error('Whoops, something bad happened')
);
// Prints: [Error: Whoops, something bad happened], to err

const name = 'Will Robinson';
myConsole.warn(`Danger ${name}! Danger!`);
// Prints: Danger Will Robinson! Danger!, to err
```

## Класс: `Console`

<!-- YAML
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/9744
    description: Errors that occur while writing to the underlying streams
                 will now be ignored by default.
-->

<!--type=class-->

В `Console` class может использоваться для создания простого регистратора с настраиваемыми выходными потоками, и к нему можно получить доступ, используя либо `require('console').Console` или `console.Console` (или их деструктурированные аналоги):

```js
const { Console } = require('console');
```

```js
const { Console } = console;
```

### `new Console(stdout[, stderr][, ignoreErrors])`

### `new Console(options)`

<!-- YAML
changes:
  - version:
     - v14.2.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32964
    description: The `groupIndentation` option was introduced.
  - version: v11.7.0
    pr-url: https://github.com/nodejs/node/pull/24978
    description: The `inspectOptions` option is introduced.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19372
    description: The `Console` constructor now supports an `options` argument,
                 and the `colorMode` option was introduced.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/9744
    description: The `ignoreErrors` option was introduced.
-->

- `options` {Объект}
  - `stdout` {stream.Writable}
  - `stderr` {stream.Writable}
  - `ignoreErrors` {boolean} Игнорировать ошибки при записи в базовые потоки. **Дефолт:** `true`.
  - `colorMode` {boolean | string} Установить поддержку цвета для этого `Console` пример. Установка на `true` позволяет раскрашивать при просмотре значений. Установка на `false` отключает окраску при проверке значений. Установка на `'auto'` делает поддержку цвета зависимой от значения `isTTY` свойство и значение, возвращаемое `getColorDepth()` в соответствующем потоке. Этот вариант нельзя использовать, если `inspectOptions.colors` также установлен. **Дефолт:** `'auto'`.
  - `inspectOptions` {Object} Определяет параметры, которые передаются в [`util.inspect()`](util.md#utilinspectobject-options).
  - `groupIndentation` {number} Установить отступ группы. **Дефолт:** `2`.

Создает новый `Console` с одним или двумя экземплярами потока с возможностью записи. `stdout` - это поток с возможностью записи для вывода журнала или информации. `stderr` используется для вывода предупреждений или ошибок. Если `stderr` не предусмотрено, `stdout` используется для `stderr`.

```js
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
// Custom simple logger
const logger = new Console({
  stdout: output,
  stderr: errorOutput,
});
// use it like console
const count = 5;
logger.log('count: %d', count);
// In stdout.log: count 5
```

Глобальный `console` это особенный `Console` чей вывод отправляется [`process.stdout`](process.md#processstdout) а также [`process.stderr`](process.md#processstderr). Это эквивалентно вызову:

```js
new Console({
  stdout: process.stdout,
  stderr: process.stderr,
});
```

### `console.assert(value[, ...message])`

<!-- YAML
added: v0.1.101
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17706
    description: The implementation is now spec compliant and does not throw
                 anymore.
-->

- `value` {any} Значение, проверенное на достоверность.
- `...message` {any} Все аргументы кроме `value` используются как сообщение об ошибке.

`console.assert()` пишет сообщение, если `value` является [ложь](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) или опущено. Он только пишет сообщение и никаким другим образом не влияет на выполнение. Вывод всегда начинается с `"Assertion failed"`. Если предусмотрено, `message` форматируется с использованием [`util.format()`](util.md#utilformatformat-args).

Если `value` является [правдивый](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), Ничего не произошло.

```js
console.assert(true, 'does nothing');

console.assert(false, 'Whoops %s work', "didn't");
// Assertion failed: Whoops didn't work

console.assert();
// Assertion failed
```

### `console.clear()`

<!-- YAML
added: v8.3.0
-->

Когда `stdout` является телетайпом, звонит `console.clear()` попытается очистить TTY. Когда `stdout` не является телетайпом, этот метод ничего не делает.

Конкретная работа `console.clear()` может различаться в зависимости от операционной системы и типа терминала. Для большинства операционных систем Linux `console.clear()` действует аналогично `clear` команда оболочки. В Windows `console.clear()` очистит только вывод в текущем окне просмотра терминала для двоичного файла Node.js.

### `console.count([label])`

<!-- YAML
added: v8.3.0
-->

- `label` {строка} Отображаемая метка счетчика. **Дефолт:** `'default'`.

Поддерживает внутренний счетчик, специфичный для `label` и выводит на `stdout` количество раз `console.count()` был вызван с данным `label`.

<!-- eslint-skip -->

```js
> console.count()
default: 1
undefined
> console.count('default')
default: 2
undefined
> console.count('abc')
abc: 1
undefined
> console.count('xyz')
xyz: 1
undefined
> console.count('abc')
abc: 2
undefined
> console.count()
default: 3
undefined
>
```

### `console.countReset([label])`

<!-- YAML
added: v8.3.0
-->

- `label` {строка} Отображаемая метка счетчика. **Дефолт:** `'default'`.

Сбрасывает внутренний счетчик, относящийся к `label`.

<!-- eslint-skip -->

```js
> console.count('abc');
abc: 1
undefined
> console.countReset('abc');
undefined
> console.count('abc');
abc: 1
undefined
>
```

### `console.debug(data[, ...args])`

<!-- YAML
added: v8.0.0
changes:
  - version: v8.10.0
    pr-url: https://github.com/nodejs/node/pull/17033
    description: "`console.debug` is now an alias for `console.log`."
-->

- `data` {любой}
- `...args` {любой}

В `console.debug()` функция - это псевдоним для [`console.log()`](#consolelogdata-args).

### `console.dir(obj[, options])`

<!-- YAML
added: v0.1.101
-->

- `obj` {любой}
- `options` {Объект}
  - `showHidden` {boolean} Если `true` тогда также будут показаны неперечислимые свойства объекта и свойства символа. **Дефолт:** `false`.
  - `depth` {number} говорит [`util.inspect()`](util.md#utilinspectobject-options) сколько раз повторять при форматировании объекта. Это полезно для осмотра больших сложных объектов. Чтобы сделать его рекурсивным бесконечно, передайте `null`. **Дефолт:** `2`.
  - `colors` {boolean} Если `true`, то вывод будет оформлен с использованием цветовых кодов ANSI. Цвета настраиваются; видеть [настройка `util.inspect()` цвета](util.md#customizing-utilinspect-colors). **Дефолт:** `false`.

Использует [`util.inspect()`](util.md#utilinspectobject-options) на `obj` и выводит полученную строку в `stdout`. Эта функция обходит любые пользовательские `inspect()` функция, определенная на `obj`.

### `console.dirxml(...data)`

<!-- YAML
added: v8.0.0
changes:
  - version: v9.3.0
    pr-url: https://github.com/nodejs/node/pull/17152
    description: "`console.dirxml` now calls `console.log` for its arguments."
-->

- `...data` {любой}

Этот метод вызывает `console.log()` передавая ему полученные аргументы. Этот метод не производит никакого форматирования XML.

### `console.error([data][, ...args])`

<!-- YAML
added: v0.1.100
-->

- `data` {любой}
- `...args` {любой}

Печать на `stderr` с новой строкой. Можно передать несколько аргументов, первый из которых используется в качестве основного сообщения, а все дополнительные - в качестве значений подстановки, как в printf (3) (все аргументы передаются в [`util.format()`](util.md#utilformatformat-args)).

```js
const code = 5;
console.error('error #%d', code);
// Prints: error #5, to stderr
console.error('error', code);
// Prints: error 5, to stderr
```

Если элементы форматирования (например, `%d`) не найдены в первой строке, то [`util.inspect()`](util.md#utilinspectobject-options) вызывается для каждого аргумента, и результирующие строковые значения объединяются. Видеть [`util.format()`](util.md#utilformatformat-args) для дополнительной информации.

### `console.group([...label])`

<!-- YAML
added: v8.5.0
-->

- `...label` {любой}

Увеличивает отступ последующих строк пробелами для `groupIndentation` длина.

Если один или несколько `label`предусмотрены, они печатаются первыми без дополнительного отступа.

### `console.groupCollapsed()`

<!-- YAML
  added: v8.5.0
-->

Псевдоним для [`console.group()`](#consolegrouplabel).

### `console.groupEnd()`

<!-- YAML
added: v8.5.0
-->

Уменьшает отступ последующих строк пробелами для `groupIndentation` длина.

### `console.info([data][, ...args])`

<!-- YAML
added: v0.1.100
-->

- `data` {любой}
- `...args` {любой}

В `console.info()` функция - это псевдоним для [`console.log()`](#consolelogdata-args).

### `console.log([data][, ...args])`

<!-- YAML
added: v0.1.100
-->

- `data` {любой}
- `...args` {любой}

Печать на `stdout` с новой строкой. Можно передать несколько аргументов, первый из которых используется в качестве основного сообщения, а все дополнительные - в качестве значений подстановки, как в printf (3) (все аргументы передаются в [`util.format()`](util.md#utilformatformat-args)).

```js
const count = 5;
console.log('count: %d', count);
// Prints: count: 5, to stdout
console.log('count:', count);
// Prints: count: 5, to stdout
```

Видеть [`util.format()`](util.md#utilformatformat-args) для дополнительной информации.

### `console.table(tabularData[, properties])`

<!-- YAML
added: v10.0.0
-->

- `tabularData` {любой}
- `properties` {string \[]} Альтернативные свойства для построения таблицы.

Попробуйте построить таблицу со столбцами свойств `tabularData` (или используйте `properties`) и ряды `tabularData` и зарегистрируйте это. Возвращается к простой регистрации аргумента, если он не может быть проанализирован как табличный.

```js
// These can't be parsed as tabular data
console.table(Symbol());
// Symbol()

console.table(undefined);
// undefined

console.table([
  { a: 1, b: 'Y' },
  { a: 'Z', b: 2 },
]);
// ┌─────────┬─────┬─────┐
// │ (index) │  a  │  b  │
// ├─────────┼─────┼─────┤
// │    0    │  1  │ 'Y' │
// │    1    │ 'Z' │  2  │
// └─────────┴─────┴─────┘

console.table(
  [
    { a: 1, b: 'Y' },
    { a: 'Z', b: 2 },
  ],
  ['a']
);
// ┌─────────┬─────┐
// │ (index) │  a  │
// ├─────────┼─────┤
// │    0    │  1  │
// │    1    │ 'Z' │
// └─────────┴─────┘
```

### `console.time([label])`

<!-- YAML
added: v0.1.104
-->

- `label` {нить} **Дефолт:** `'default'`

Запускает таймер, который можно использовать для вычисления продолжительности операции. Таймеры идентифицируются уникальным `label`. Используйте то же самое `label` при звонке [`console.timeEnd()`](#consoletimeendlabel) для остановки таймера и вывода прошедшего времени в подходящих единицах времени для `stdout`. Например, если прошедшее время составляет 3869 мс, `console.timeEnd()` отображает «3.869 с».

### `console.timeEnd([label])`

<!-- YAML
added: v0.1.104
changes:
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/29251
    description: The elapsed time is displayed with a suitable time unit.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5901
    description: This method no longer supports multiple calls that don’t map
                 to individual `console.time()` calls; see below for details.
-->

- `label` {нить} **Дефолт:** `'default'`

Останавливает таймер, который ранее был запущен вызовом [`console.time()`](#consoletimelabel) и распечатывает результат в `stdout`:

```js
console.time('100-elements');
for (let i = 0; i < 100; i++) {}
console.timeEnd('100-elements');
// prints 100-elements: 225.438ms
```

### `console.timeLog([label][, ...data])`

<!-- YAML
added: v10.7.0
-->

- `label` {нить} **Дефолт:** `'default'`
- `...data` {любой}

Для таймера, который ранее запускался вызовом [`console.time()`](#consoletimelabel), печатает прошедшее время и другие `data` аргументы `stdout`:

```js
console.time('process');
const value = expensiveProcess1(); // Returns 42
console.timeLog('process', value);
// Prints "process: 365.227ms 42".
doExpensiveProcess2(value);
console.timeEnd('process');
```

### `console.trace([message][, ...args])`

<!-- YAML
added: v0.1.104
-->

- `message` {любой}
- `...args` {любой}

Печать на `stderr` Струна `'Trace: '`, за которым следует [`util.format()`](util.md#utilformatformat-args) форматированное сообщение и трассировка стека до текущей позиции в коде.

```js
console.trace('Show me');
// Prints: (stack trace will vary based on where trace is called)
//  Trace: Show me
//    at repl:2:9
//    at REPLServer.defaultEval (repl.js:248:27)
//    at bound (domain.js:287:14)
//    at REPLServer.runBound [as eval] (domain.js:300:12)
//    at REPLServer.<anonymous> (repl.js:412:12)
//    at emitOne (events.js:82:20)
//    at REPLServer.emit (events.js:169:7)
//    at REPLServer.Interface._onLine (readline.js:210:10)
//    at REPLServer.Interface._line (readline.js:549:8)
//    at REPLServer.Interface._ttyWrite (readline.js:826:14)
```

### `console.warn([data][, ...args])`

<!-- YAML
added: v0.1.100
-->

- `data` {любой}
- `...args` {любой}

В `console.warn()` функция - это псевдоним для [`console.error()`](#consoleerrordata-args).

## Только методы инспектора

Следующие методы предоставляются движком V8 в общем API, но ничего не отображают, если только они не используются вместе с [инспектор](debugger.md) (`--inspect` флаг).

### `console.profile([label])`

<!-- YAML
added: v8.0.0
-->

- `label` {нить}

Этот метод ничего не отображает, если он не используется в инспекторе. В `console.profile()` запускает профиль процессора JavaScript с необязательной меткой до тех пор, пока [`console.profileEnd()`](#consoleprofileendlabel) называется. Затем профиль добавляется в **Профиль** панель инспектора.

```js
console.profile('MyLabel');
// Some code
console.profileEnd('MyLabel');
// Adds the profile 'MyLabel' to the Profiles panel of the inspector.
```

### `console.profileEnd([label])`

<!-- YAML
added: v8.0.0
-->

- `label` {нить}

Этот метод ничего не отображает, если он не используется в инспекторе. Останавливает текущий сеанс профилирования ЦП JavaScript, если он был запущен, и печатает отчет в **Профили** панель инспектора. Видеть [`console.profile()`](#consoleprofilelabel) для примера.

Если этот метод вызывается без метки, последний запущенный профиль останавливается.

### `console.timeStamp([label])`

<!-- YAML
added: v8.0.0
-->

- `label` {нить}

Этот метод ничего не отображает, если он не используется в инспекторе. В `console.timeStamp()` метод добавляет событие с меткой `'label'` к **Лента новостей** панель инспектора.
