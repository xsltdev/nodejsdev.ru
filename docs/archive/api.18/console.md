---
title: Console
description: Модуль console предоставляет простую отладочную консоль, которая похожа на механизм консоли JavaScript, предоставляемый веб-браузерами
---

# Консоль

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/console.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:console` предоставляет простую отладочную консоль, которая похожа на механизм консоли JavaScript, предоставляемый веб-браузерами.

Модуль экспортирует два специфических компонента:

-   Класс `Console` с методами `console.log()`, `console.error()` и `console.warn()`, которые могут быть использованы для записи в любой поток Node.js.
-   Глобальный экземпляр `console` настроен на запись в [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr). Глобальная `console` может использоваться без вызова `require('node:console')`.

**_Предупреждение_**: Методы объекта глобальной консоли не являются ни последовательно синхронными, как API браузера, на которые они похожи, ни последовательно асинхронными, как все остальные потоки Node.js. Дополнительную информацию смотрите в [заметке о процессах ввода-вывода](process.md#a-note-on-process-io).

Пример с использованием глобальной `console`:

```js
console.log('hello world');
// Печатает: hello world, в stdout
console.log('hello %s', 'world');
// Выводит: hello world, на stdout
console.error(new Error('Упс, случилось что-то плохое'));
// Выводит сообщение об ошибке и трассировку стека в stderr:
// Ошибка: Whoops, something bad happened
// at [eval]:5:15
// at Script.runInThisContext (node:vm:132:18)
// at Object.runInThisContext (node:vm:309:38)
// at node:internal/process/execution:77:19
// at [eval]-wrapper:6:22
// at evalScript (node:internal/process/execution:76:60)
// at node:internal/main/eval_string:23:3

const name = 'Will Robinson';
console.warn(`Опасность ${имя}! Опасность!`);
// Выводит: Danger Will Robinson! Danger!, to stderr
```

Пример с использованием класса `Console`:

```js
const out = getStreamSomehow();
const err = getStreamSomehow();
const myConsole = new console.Console(out, err);

myConsole.log('hello world');
// Печатает: hello world, в out
myConsole.log('hello %s', 'world');
// Печатает: hello world, to out
myConsole.error(new Error('Упс, случилось что-то плохое'));
// Печатает: [Error: Whoops, something bad happened], to err

const name = 'Уилл Робинсон';
myConsole.warn(`Danger ${name}! Danger!`);
// Prints: Danger Will Robinson! Опасность!, to err
```

<!-- 0000.part.md -->

## Класс: `Console`

Класс `Console` может быть использован для создания простого регистратора с настраиваемыми потоками вывода, доступ к которому можно получить с помощью `require('node:console').Console` или `console.Console` (или их деструктурированных аналогов):

```js
const { Console } = require('node:console');
```

```js
const { Console } = console;
```

<!-- 0001.part.md -->

### `new Console(stdout[, stderr][, ignoreErrors])`

<!-- 0002.part.md -->

### `new Console(options)`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `stdout` [`<stream.Writable>`](stream.md#streamwritable)
    -   `stderr` [`<stream.Writable>`](stream.md#streamwritable)
    -   `ignoreErrors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Игнорировать ошибки при записи в базовые потоки. **По умолчанию:** `true`.
    -   `colorMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Устанавливает поддержку цвета для данного экземпляра `консоли`. Установка значения `true` включает раскраску при просмотре значений. Установка в `false` отключает раскраску при просмотре значений. Установка в `'auto'` делает поддержку цвета зависимой от значения свойства `isTTY` и значения, возвращаемого функцией `getColorDepth()` для соответствующего потока. Эта опция не может быть использована, если `inspectOptions.colors` также установлен. **По умолчанию:** `авто`.
    -   `inspectOptions` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Определяет опции, которые передаются в [`util.inspect()`](util.md#utilinspectobject-options).
    -   `groupIndentation` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Установка отступа группы. **По умолчанию:** `2`.

Создает новую `Console` с одним или двумя экземплярами записываемого потока. `stdout` - записываемый поток для вывода журнала или информации. `stderr` используется для вывода предупреждений или ошибок. Если `stderr` не указан, `stdout` используется для `stderr`.

```js
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
// Пользовательский простой регистратор
const logger = new Console({
    stdout: output,
    stderr: errorOutput,
});
// используем его как консоль
const count = 5;
logger.log('count: %d', count);
// В stdout.log: count 5
```

Глобальная `console` является специальной `Console`, вывод которой отправляется на [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr). Это эквивалентно вызову:

```js
new Console({
    stdout: process.stdout,
    stderr: process.stderr,
});
```

<!-- 0003.part.md -->

### `console.assert(value[, ...message])`

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение, проверяемое на истинность.
-   `...message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Все аргументы, кроме `value`, используются в качестве сообщения об ошибке.

`console.assert()` пишет сообщение, если `value` является [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) или опущено. Она только пишет сообщение и никак иначе не влияет на выполнение. Вывод всегда начинается со слов `"Assertion failed"`. Если указано, то `сообщение` форматируется с помощью [`util.format()`](util.md#utilformatformat-args).

Если `value` является [truey](https://developer.mozilla.org/en-US/docs/Glossary/Truthy), то ничего не происходит.

```js
console.assert(true, 'ничего не делает');

console.assert(false, 'Whoops %s work', "didn't");
// Assertion failed: Whoops не сработал

console.assert();
// Assertion failed
```

<!-- 0004.part.md -->

### `console.clear()`

Если `stdout` является TTY, вызов `console.clear()` попытается очистить TTY. Когда `stdout` не является TTY, этот метод ничего не делает.

Конкретная операция `console.clear()` может отличаться в разных операционных системах и типах терминалов. В большинстве операционных систем Linux метод `console.clear()` работает аналогично команде оболочки `clear`. В Windows `console.clear()` очистит только вывод в текущем окне просмотра терминала для бинарного файла Node.js.

<!-- 0005.part.md -->

### `console.count([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Отображаемая метка для счетчика. **По умолчанию:** `'default'`.

Ведет внутренний счетчик, специфичный для `label`, и выводит в `stdout` количество раз, когда `console.count()` был вызван с заданной `label`.

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

<!-- 0006.part.md -->

### `console.countReset([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Отображаемая метка для счетчика. **По умолчанию:** `'default'`.

Сбрасывает внутренний счетчик, специфичный для `label`.

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

<!-- 0007.part.md -->

### `console.debug(data[, ...args])`

-   `данные` {любые}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Функция `console.debug()` является псевдонимом для [`console.log()`](#consolelogdata-args).

<!-- 0008.part.md -->

### `console.dir(obj[, options])`

-   `obj` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `showHidden` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, то будут показаны также неперечислимые и символьные свойства объекта. **По умолчанию:** `false`.
    -   `depth` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Указывает [`util.inspect()`](util.md#utilinspectobject-options), сколько раз пересматривать объект при форматировании. Это полезно при проверке больших сложных объектов. Чтобы заставить его выполнять возврат бесконечно, передайте `null`. **По умолчанию:** `2`.
    -   `colors` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, то вывод будет оформлен с использованием цветовых кодов ANSI. Цвета настраиваются; смотрите [настройка цветов `util.inspect()`](util.md#customizing-utilinspect-colors). **По умолчанию:** `false`.

Использует [`util.inspect()`](util.md#utilinspectobject-options) для `obj` и печатает полученную строку в `stdout`. Эта функция обходит любую пользовательскую функцию `inspect()`, определенную для `obj`.

<!-- 0009.part.md -->

### `console.dirxml(...data)`

-   `...data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Этот метод вызывает `console.log()`, передавая ему полученные аргументы. Этот метод не производит никакого форматирования XML.

<!-- 0010.part.md -->

### `console.error([data][, ...args])`

-   `данные` {любые}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Печатает в `stderr` с новой строкой. Можно передать несколько аргументов, при этом первый используется как основное сообщение, а все дополнительные - как подстановочные значения, аналогично printf(3) (все аргументы передаются в [`util.format()`](util.md#utilformatformat-args)).

```js
const code = 5;
console.error('error #%d', code);
// Выводит ошибку #5 в stderr
console.error('error', code);
// Выводит: ошибка 5, на stderr
```

Если элементы форматирования (например, `%d`) не найдены в первой строке, тогда [`util.inspect()`](util.md#utilinspectobject-options) вызывается на каждом аргументе и результирующие строковые значения конкатенируются. Дополнительную информацию смотрите в [`util.format()`](util.md#utilformatformat-args).

<!-- 0011.part.md -->

### `console.group([...label])`

-   `...label` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Увеличивает отступ последующих строк на пробелы для длины `groupIndentation`.

Если указана одна или более `ярлыков`, то они печатаются первыми без дополнительного отступа.

<!-- 0012.part.md -->

### `console.groupCollapsed()`

Псевдоним для [`console.group()`](#consolegrouplabel).

<!-- 0013.part.md -->

### `console.groupEnd()`

Уменьшает отступ последующих строк на пробелы для длины `groupIndentation`.

<!-- 0014.part.md -->

### `console.info([data][, ...args])`.

-   `данные` {любые}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Функция `console.info()` является псевдонимом для [`console.log()`](#consolelogdata-args).

<!-- 0015.part.md -->

### `console.log([data][, ...args])`

-   `данные` {любые}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Печатает в `stdout` с новой строкой. Можно передавать несколько аргументов, при этом первый используется как основное сообщение, а все дополнительные - как подстановочные значения, аналогично printf(3) (все аргументы передаются в [`util.format()`](util.md#utilformatformat-args)).

```js
const count = 5;
console.log('count: %d', count);
// Выводит: count: 5, в stdout
console.log('count:', count);
// Выводит: count: 5, в stdout
```

Дополнительную информацию смотрите в [`util.format()`](util.md#utilformatformat-args).

<!-- 0016.part.md -->

### `console.table(tabularData[, properties])`

-   `табличные данные` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `свойства` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Альтернативные свойства для построения таблицы.

Попробуйте построить таблицу со столбцами свойств `tabularData` (или используйте `properties`) и строками `tabularData` и запишите ее в журнал. Вернитесь к простому протоколированию аргумента, если он не может быть разобран как табличный.

```js
// Они не могут быть разобраны как табличные данные
console.table(Symbol());
// Symbol()

console.table(undefined);
// undefined

console.table([
    { a: 1, b: 'Y' },
    { a: 'Z', b: 2 },
]);
// ┌─────────┬─────┬─────┐
// │ (индекс) │ a │ b │ │
// ├─────────┼─────┼─────┤
// │ 0 │ 1 │ 'Y' │
// │ 1 │ 'Z' │ 2 │
// └─────────┴─────┴─────┘

console.table(
    [
        { a: 1, b: 'Y' },
        { a: 'Z', b: 2 },
    ],
    ['a']
);
// ┌─────────┬─────┐
// │ (индекс) │ a │
// ├─────────┼─────┤
// │ 0 │ 1 │
// │ 1 │ 'Z' │
// └─────────┴─────┘
```

<!-- 0017.part.md -->

### `console.time([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** 'default'.

Запускает таймер, который может быть использован для вычисления продолжительности операции. Таймеры идентифицируются уникальной `label`. Используйте эту же `метку` при вызове [`console.timeEnd()`](#consoletimeendlabel) для остановки таймера и вывода прошедшего времени в соответствующих единицах времени в `stdout`. Например, если прошедшее время составляет 3869 мс, `console.timeEnd()` выводит "3.869s".

<!-- 0018.part.md -->

### `console.timeEnd([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'default'`.

Останавливает таймер, который был ранее запущен вызовом [`console.time()`](#consoletimelabel) и печатает результат в `stdout`:

```js
console.time('bunch-of-stuff');
// Делаем кучу всего.
console.timeEnd('bunch-of-stuff');
// Печатает: bunch-of-stuff: 225.438ms
```

<!-- 0019.part.md -->

### `console.timeLog([label][, ...data])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'default'\*.
-   `...data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Для таймера, который был ранее запущен вызовом [`console.time()`](#consoletimelabel), печатает истекшее время и другие `данные` аргументов в `stdout`:

```js
console.time('process');
const value = expensiveProcess1(); // Возвращает 42
console.timeLog('process', value);
// Выводит "процесс: 365.227ms 42".
doExpensiveProcess2(value);
console.timeEnd('process');
```

<!-- 0020.part.md -->

### `console.trace([message][, ...args])`

-   `сообщение` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Печатает в `stderr` строку ` 'Trace:'``, затем [ `util.format()`](util.md#utilformatformat-args) отформатированное сообщение и трассировку стека до текущей позиции в коде.

```js
console.trace('Show me');
// Печать: (трассировка стека будет меняться в зависимости от места вызова трассировки)
// Трассировка: Show me
// at repl:2:9
// at REPLServer.defaultEval (repl.js:248:27)
// at bound (domain.js:287:14)
// at REPLServer.runBound [as eval] (domain.js:300:12)
// at REPLServer.<anonymous> (repl.js:412:12)
// at emitOne (events.js:82:20)
// at REPLServer.emit (events.js:169:7)
// at REPLServer.Interface._onLine (readline.js:210:10)
// at REPLServer.Interface._line (readline.js:549:8)
// at REPLServer.Interface._ttyWrite (readline.js:826:14)
```

<!-- 0021.part.md -->

### `console.warn([data][, ...args])`

-   `данные` {любые}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Функция `console.warn()` является псевдонимом для [`console.error()`](#consoleerrordata-args).

<!-- 0022.part.md -->

## Методы только для инспектора

Следующие методы открываются движком V8 в общем API, но ничего не отображают, если не используются вместе с [inspector](debugger.md) (флаг `--inspect`).

<!-- 0023.part.md -->

### `console.profile([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Этот метод ничего не отображает, если не используется в инспекторе. Метод `console.profile()` запускает профиль процессора JavaScript с необязательной меткой до вызова [`console.profileEnd()`](#consoleprofileendlabel). Затем профиль добавляется на панель **Profile** инспектора.

```js
console.profile('MyLabel');
// Некоторый код
console.profileEnd('MyLabel');
// Добавляет профиль 'MyLabel' на панель Profiles инспектора.
```

<!-- 0024.part.md -->

### `console.profileEnd([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Этот метод ничего не отображает, если не используется в инспекторе. Останавливает текущий сеанс профилирования процессора JavaScript, если он был запущен, и печатает отчет на панели **Profiles** инспектора. Пример см. в [`console.profile()`](#consoleprofilelabel).

Если этот метод вызывается без метки, то останавливается последний запущенный профиль.

<!-- 0025.part.md -->

### `console.timeStamp([label])`

-   `label` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Этот метод ничего не отображает, если не используется в инспекторе. Метод `console.timeStamp()` добавляет событие с меткой `'label'` на панель **Timeline** инспектора.

<!-- 0026.part.md -->

