---
title: Console
description: Модуль node:console — простая отладочная консоль и класс Console для записи в потоки
---

# Консоль

[:octicons-tag-24: latest](https://nodejs.org/docs/latest-v25.x/api/console.html)

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с npm имеет высший приоритет и не будет нарушена, кроме случаев явной необходимости.

Модуль `node:console` предоставляет простую отладочную консоль, похожую на механизм `console` в браузерах.

Модуль экспортирует два основных элемента:

-   Класс `Console` с методами вроде `console.log()`, `console.error()` и `console.warn()` для записи в любой поток Node.js.
-   Глобальный объект `console`, настроенный на запись в [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr). Глобальный `console` можно использовать без `require('node:console')`.

_**Предупреждение**_: методы глобального `console` не являются ни последовательно синхронными, как похожие API в браузере, ни последовательно асинхронными, как остальные потоки Node.js. Если поведение важно, сначала выясните, синхронный или асинхронный поток под капотом: это зависит от платформы и настройки стандартных потоков процесса. См. [заметку о вводе-выводе процесса](process.md#a-note-on-process-io).

Пример с глобальным `console`:

```js
console.log('hello world');
// Выводит: hello world, в stdout
console.log('hello %s', 'world');
// Выводит: hello world, в stdout
console.error(new Error('Whoops, something bad happened'));
// Выводит сообщение об ошибке и стек в stderr:
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
// Выводит: Danger Will Robinson! Danger!, в stderr
```

Пример с классом `Console`:

```js
const out = getStreamSomehow();
const err = getStreamSomehow();
const myConsole = new console.Console(out, err);

myConsole.log('hello world');
// Выводит: hello world, в out
myConsole.log('hello %s', 'world');
// Выводит: hello world, в out
myConsole.error(
    new Error('Whoops, something bad happened')
);
// Выводит: [Error: Whoops, something bad happened], в err

const name = 'Will Robinson';
myConsole.warn(`Danger ${name}! Danger!`);
// Выводит: Danger Will Robinson! Danger!, в err
```

## Класс: `Console`

Класс `Console` служит для создания простого логгера с настраиваемыми потоками вывода. Доступ: `require('node:console').Console` или `console.Console` (или деструктуризация):

=== "MJS"

    ```js
    import { Console } from 'node:console';
    ```

=== "CJS"

    ```js
    const { Console } = require('node:console');
    ```

```js
const { Console } = console;
```

### `new Console(stdout[, stderr][, ignoreErrors])`

### `new Console(options)`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `stdout` [`<stream.Writable>`](stream.md#class-streamwritable)
    -   `stderr` [`<stream.Writable>`](stream.md#class-streamwritable)
    -   `ignoreErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Игнорировать ошибки записи в базовые потоки. **По умолчанию:** `true`.
    -   `colorMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Поддержка цвета для этого экземпляра `Console`. `true` — раскраска при инспекции значений. `false` — без раскраски. `'auto'` — зависит от `isTTY` и результата `getColorDepth()` для соответствующего потока. Нельзя использовать вместе с `inspectOptions.colors`. **По умолчанию:** `'auto'`.
    -   `inspectOptions` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Map>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) Параметры для [`util.inspect()`](util.md#utilinspectobject-options). Может быть объектом опций или, если для stdout и stderr нужны разные опции, `Map` от потоков к опциям.
    -   `groupIndentation` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Отступ для групп. **По умолчанию:** `2`.

Создаёт новый `Console` с одним или двумя потоками записи. `stdout` — для логов и информации. `stderr` — для предупреждений и ошибок. Если `stderr` не задан, для ошибок используется `stdout`.

=== "MJS"

    ```js
    import { createWriteStream } from 'node:fs';
    import { Console } from 'node:console';
    // Или
    // const { Console } = console;

    const output = createWriteStream('./stdout.log');
    const errorOutput = createWriteStream('./stderr.log');
    // Простой самодельный логгер
    const logger = new Console({ stdout: output, stderr: errorOutput });
    // как обычный console
    const count = 5;
    logger.log('count: %d', count);
    // В stdout.log: count 5
    ```

=== "CJS"

    ```js
    const fs = require('node:fs');
    const { Console } = require('node:console');
    // Или
    // const { Console } = console;

    const output = fs.createWriteStream('./stdout.log');
    const errorOutput = fs.createWriteStream('./stderr.log');
    const logger = new Console({ stdout: output, stderr: errorOutput });
    const count = 5;
    logger.log('count: %d', count);
    // В stdout.log: count 5
    ```

Глобальный `console` — особый `Console`, вывод идёт в [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr). Эквивалентно:

```js
new Console({
    stdout: process.stdout,
    stderr: process.stderr,
});
```

### `console.assert(value[, ...message])`

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Проверяемое значение на истинность.
-   `...message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Остальные аргументы — текст сообщения.

`console.assert()` выводит сообщение, если `value` [ложно](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) или не передано. Выполнение не прерывается. Вывод всегда начинается с `"Assertion failed"`. Если передан `message`, он форматируется через [`util.format()`](util.md#utilformatformat-args).

Если `value` [истинно](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), ничего не происходит.

```js
console.assert(true, 'does nothing');

console.assert(false, 'Whoops %s work', "didn't");
// Assertion failed: Whoops didn't work

console.assert();
// Assertion failed
```

### `console.clear()`

Если `stdout` — TTY, `console.clear()` пытается очистить TTY. Если `stdout` не TTY, метод ничего не делает.

Поведение зависит от ОС и типа терминала. В большинстве Linux это похоже на команду `clear`. В Windows очищается только вывод в текущей области просмотра терминала для процесса `node`.

### `console.count([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Подпись счётчика. **По умолчанию:** `'default'`.

Ведёт внутренний счётчик для `label` и выводит в `stdout`, сколько раз `console.count()` вызывали с этим `label`.

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

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Подпись счётчика. **По умолчанию:** `'default'`.

Сбрасывает внутренний счётчик для `label`.

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

-   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

`console.debug()` — псевдоним [`console.log()`](#consolelogdata-args).

### `console.dir(obj[, options])`

-   `obj` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `showHidden` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, показываются ненумеруемые и символьные свойства. **По умолчанию:** `false`.
    -   `depth` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Глубина рекурсии для [`util.inspect()`](util.md#utilinspectobject-options) при форматировании. Для бесконечной глубины передайте `null`. **По умолчанию:** `2`.
    -   `colors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, вывод с ANSI-цветами. Настройка цветов — см. [настройку цветов `util.inspect()`](util.md#customizing-utilinspect-colors). **По умолчанию:** `false`.

Вызывает [`util.inspect()`](util.md#utilinspectobject-options) для `obj` и пишет строку в `stdout`. Пользовательская функция `inspect()` на `obj` обходится.

### `console.dirxml(...data)`

-   `...data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Вызывает `console.log()` с теми же аргументами. XML-форматирования не производится.

### `console.error([data][, ...args])`

-   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Пишет в `stderr` с переводом строки. Можно передать несколько аргументов: первый — основное сообщение, остальные — подстановки в стиле printf(3) (все аргументы передаются в [`util.format()`](util.md#utilformatformat-args)).

```js
const code = 5;
console.error('error #%d', code);
// Выводит: error #5, в stderr
console.error('error', code);
// Выводит: error 5, в stderr
```

Если в первой строке нет спецификаторов вроде `%d`, для каждого аргумента вызывается [`util.inspect()`](util.md#utilinspectobject-options), строки склеиваются. Подробнее — [`util.format()`](util.md#utilformatformat-args).

### `console.group([...label])`

-   `...label` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Увеличивает отступ последующих строк на `groupIndentation` пробелов.

Если переданы `label`, они печатаются первыми без дополнительного отступа.

### `console.groupCollapsed()`

Псевдоним [`console.group()`](#consolegrouplabel).

### `console.groupEnd()`

Уменьшает отступ последующих строк на `groupIndentation` пробелов.

### `console.info([data][, ...args])`

-   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

`console.info()` — псевдоним [`console.log()`](#consolelogdata-args).

### `console.log([data][, ...args])`

-   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Пишет в `stdout` с переводом строки. Несколько аргументов: первый — сообщение, остальные — подстановки как в printf(3) (через [`util.format()`](util.md#utilformatformat-args)).

```js
const count = 5;
console.log('count: %d', count);
// Выводит: count: 5, в stdout
console.log('count:', count);
// Выводит: count: 5, в stdout
```

См. [`util.format()`](util.md#utilformatformat-args).

### `console.table(tabularData[, properties])`

-   `tabularData` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `properties` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Альтернативный набор свойств для столбцов.

Пытается построить таблицу: столбцы из свойств `tabularData` (или из `properties`), строки — элементы `tabularData`, и вывести её. Если данные не удаётся разобрать как табличные, логируется аргумент как есть.

```js
// Не удаётся разобрать как табличные данные
console.table(Symbol());
// Symbol()

console.table(undefined);
// undefined

console.table([
    { a: 1, b: 'Y' },
    { a: 'Z', b: 2 },
]);
// ┌─────────┬─────┬─────┐
// │ (index) │ a   │ b   │
// ├─────────┼─────┼─────┤
// │ 0       │ 1   │ 'Y' │
// │ 1       │ 'Z' │ 2   │
// └─────────┴─────┴─────┘

console.table(
    [
        { a: 1, b: 'Y' },
        { a: 'Z', b: 2 },
    ],
    ['a']
);
// ┌─────────┬─────┐
// │ (index) │ a   │
// ├─────────┼─────┤
// │ 0       │ 1   │
// │ 1       │ 'Z' │
// └─────────┴─────┘
```

### `console.time([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'default'`

Запускает таймер для измерения длительности операции. Таймеры различаются по `label`. Используйте тот же `label` в [`console.timeEnd()`](#consoletimeendlabel), чтобы остановить таймер и вывести прошедшее время в подходящих единицах в `stdout`. Например, при 3869 мс `console.timeEnd()` покажет "3.869s".

### `console.timeEnd([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'default'`

Останавливает таймер, запущенный [`console.time()`](#consoletimelabel), и выводит результат в `stdout`:

```js
console.time('bunch-of-stuff');
// Какая-то работа.
console.timeEnd('bunch-of-stuff');
// Выводит: bunch-of-stuff: 225.438ms
```

### `console.timeLog([label][, ...data])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'default'`
-   `...data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Для таймера, запущенного [`console.time()`](#consoletimelabel), выводит прошедшее время и остальные аргументы `data` в `stdout`:

```js
console.time('process');
const value = expensiveProcess1(); // Returns 42
console.timeLog('process', value);
// Выводит "process: 365.227ms 42".
doExpensiveProcess2(value);
console.timeEnd('process');
```

### `console.trace([message][, ...args])`

-   `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Пишет в `stderr` строку `'Trace: '`, затем сообщение, отформатированное [`util.format()`](util.md#utilformatformat-args), и стек до текущего места в коде.

```js
console.trace('Show me');
// Выводит: (стек зависит от места вызова)
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

-   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

`console.warn()` — псевдоним [`console.error()`](#consoleerrordata-args).

## Методы только для инспектора

Следующие методы предоставляет движок V8 в общем API, но ничего не выводят, если не используются вместе с [инспектором](debugger.md) (флаг `--inspect`).

### `console.profile([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вне инспектора ничего не отображает. `console.profile()` начинает CPU-профиль JavaScript с необязательной меткой до вызова [`console.profileEnd()`](#consoleprofileendlabel). Профиль затем попадает на панель **Profile** инспектора.

```js
console.profile('MyLabel');
// Код
console.profileEnd('MyLabel');
// Добавляет профиль 'MyLabel' на панель Profiles инспектора.
```

### `console.profileEnd([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вне инспектора ничего не отображает. Останавливает текущую сессию CPU-профилирования, если она была начата, и выводит отчёт на панель **Profiles**. Пример — см. [`console.profile()`](#consoleprofilelabel).

Без метки останавливается последний запущенный профиль.

### `console.timeStamp([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Вне инспектора ничего не отображает. `console.timeStamp()` добавляет событие с меткой на панель **Timeline** инспектора.
