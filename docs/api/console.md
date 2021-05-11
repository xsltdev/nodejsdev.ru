# Модуль console

!!!success "Стабильность: 2"

    Стабильно

Модуль `console` предоставляет простую консоль для компиляции, которая подобна консольному механизму в JavaScript, предоставляемому веб-браузерами.

Модуль экспортирует два компонента:

- Класс `Console` с такими методами, как `console.log()`, `console.error()` и `console.warn()`, которые могу использоваться для записи в любой стрим Node.js.
- Глобальный экземпляр `console`, сконфигурированный для записи в `stdout` и `stderr`. Так как объект является глобальным, его можно использовать без вызова `require('console')`.

Пример использования глобального экземпляра console:

```js
console.log('hello world');
// Prints: hello world, to stdout
console.log('hello %s', 'world');
// Prints: hello world, to stdout
console.error(new Error('Whoops, something bad happened'));
// Prints: [Error: Whoops, something bad happened], to stderr

const name = 'Will Robinson';
console.warn(`Danger ${name}! Danger!`);
// Prints: Danger Will Robinson! Danger!, to stderr
```

Пример использования класса `Console`:

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

API для класса консоль разработано главным образом вокруг объекта браузера `console`, и класс `Console` в Node.js не должен точно дублировать функционал браузера.

## Асинхронные и синхронные консоли

Консольные функции, как правило, являются асинхронными, если только целью не является файл. Благодаря быстрой работе дисков, операционные системы обычно используют обратное кэширование, с очень малой вероятностью запись может блокироваться, однако, это возможно.

Кроме того, консольные функции блокируются, когда выводы на TTY (терминалы) на OS X являются очень маленькими, буфер примерно 1 КБ. Такое происходит для предотвращения чередования между `stdout` и `stderr`.

## Класс Console

Класс `Console` можно использовать для создания простых логгеров с конфигурируемыми выходящими стримами. Этот класс доступен при вызове `require('console')`. `Console` или `console.Console`:

```js
const Console = require('console').Console;
const Console = console.Console;
```

### new Console()

```
new Console(stdout[, stderr])
```

Создает новый `Console` путем передачи одного или двух открытых для записи экземпляров стримов. `stdout` является открытым для записи стримом для вывода на экран логов или информации. `stderr` используется для вывода предупреждений (варнингов) или ошибок. Если `stderr` не передается, то варнинги и ошибки будут отправляться в `stdout`.

```js
const output = fs.createWriteStream('./stdout.log');
const errorOutput = fs.createWriteStream('./stderr.log');
// custom simple logger
const logger = new Console(output, errorOutput);
// use it like console
var count = 5;
logger.log('count: %d', count);
// in stdout.log: count 5
```

Глобальный экземпляр `console` является специальным классом `Console`, чей вывод направляется на `process.stdout` и `process.stderr`. Эквивалент вызова:

```js
new Console(process.stdout, process.stderr);
```

### console.assert()

```
console.assert(value[, message][, ...])
```

Добавлено в v0.1.101

Простой assertion тест, который проверяет, `value` на истинность. Если значение `value` не истинно, выпадает ошибка `AssertionError`. При должных настройках ошибку `message` можно форматировать с помощью `util.format()` и использовать, как текст ошибки:

```js
console.assert(true, 'does nothing');
// OK
console.assert(false, 'Whoops %s', "didn't work");
// AssertionError: Whoops didn't work
```

!!!node "Примечание"

    Метод `console.assert()` реализуется другим способом в Node.js, в отличие от метода `console.assert()`, используемого браузерами.

Главным образом в браузерах, вызов `console.assert()` c неистинными assertion может привести к выводу сообщения об ошибке в консоль без прекращения выполнения последующего кода. В Node.js, однако, неистинный assertion может привести только к ошибке `AssertionError`.

Приблизительная функциональность, реализуемая браузерами, может быть реализована путем расширения `console` в Node.js и перезаписи метода `console.assert()`.

В этом примере показано, как создавать простой модуль, который расширяет и перезаписывает поведение по умолчанию в console Node.js:

```js
'use strict';

// Creates a simple extension of console with a
// new impl for assert without monkey-patching.
const myConsole = Object.setPrototypeOf(
  {
    assert(assertion, message, ...args) {
      try {
        console.assert(assertion, message, ...args);
      } catch (err) {
        console.error(err.stack);
      }
    },
  },
  console
);

module.exports = myConsole;
```

Можно использовать как прямое замещение встроенной консоли:

```js
const console = require('./myConsole');
console.assert(
  false,
  'this message will print, but no error thrown'
);
console.log('this will also print');
```

### console.dir()

```
console.dir(obj[, options])
```

Добавлено в v0.1.101

Использует `util.inspect()` в obj и выводит полученную строку в `stdout`. Эта функция обходит любые кастомные функции `inspect()`, заданные `obj`. Опционально, объект `options` может передаваться для детального изменения форматированной строки:

- `showHidden` – при значении `true` неисчисляемые свойства и свойства символов объекта также будут показываться. По умолчанию: `false`.
- `depth` – сообщает `util.inspect()` о количестве рекурсий во время форматирования объекта. Полезно для проверки больших составных объектов. По умолчанию: `2`. Для бесконечной рекурсии нужно передать `null`.
- `colors` – при значении `true` вывод будет стилизован с помощью цветовых кодов ANSI. По умолчанию: `false`. Цвета настраиваются.

### console.error()

```
console.error([data][, ...])
```

Добавлено в v0.1.100

Выводит в `stderr` данные с новой строки. Можно передавать множественные аргументы: первый будет использоваться как основное сообщение, а дополнительные – как значения замещения, по типу `printf(3)` (все аргументы передаются в `util.format()`).

```js
const code = 5;
console.error('error #%d', code);
// Prints: error #5, to stderr
console.error('error', code);
// Prints: error 5, to stderr
```

Если элементы форматирования (например `%d`) не присутствуют в первой строке, то `util.inspect()` вызывается на каждый аргумент и значения полученной строки связываются в одно. См. `util.format()`.

### console.info()

```
console.info([data][, ...])
```

Добавлено в v0.1.100

То же, что и `console.log()`.

### console.log()

```
console.log([data][, ...])
```

Добавлено в v0.1.100

Выводит в `stdout` данные с новой строки. Можно передавать множественные аргументы: первый будет использоваться как основное сообщение, а дополнительные – как значения замещения, по типу `printf(3)` (все аргументы передаются в `util.format()`).

```js
var count = 5;
console.log('count: %d', count);
// Prints: count: 5, to stdout
console.log('count: ', count);
// Prints: count: 5, to stdout
```

Если элементы форматирования (например `%d`) не присутствуют в первой строке, то `util.inspect()` вызывается на каждый аргумент и значения полученной строки связываются в одно. См. `util.format()`.

### console.time()

```
console.time(label)
```

Добавлено в v0.1.104

Запускает таймер, который используется для вычисления длительности операции. Таймеры идентифицируются с помощью уникального `label`. Для остановки таймера и вывода времени в миллисекундах в `stdout`, нужно использовать этот `label` при вызове `console.timeEnd()`. Показания таймера точны до миллисекунд.

### console.timeEnd()

```
console.timeEnd(label)
```

Добавлено в v0.1.104

Останавливает таймер, запущенный предыдущей функцией. Выводит результат в `stdout`:

```js
console.time('100-elements');
for (var i = 0; i > 100; i++) {}
console.timeEnd('100-elements');
// prints 100-elements: 225.438ms
```

### console.trace()

```
console.trace(message[, ...])
```

Добавлено в v0.1.104

Выводит в `stderr` строку 'Trace :' c форматированным сообщением из `util.format()` и отслеживает его текущую позицию в коде.

```js
console.trace('Show me');
// Prints: (stack trace will vary based on where trace is called)
//  Trace: Show me
//    at repl:2:9
//    at REPLServer.defaultEval (repl.js:248:27)
//    at bound (domain.js:287:14)
//    at REPLServer.runBound [as eval] (domain.js:300:12)
//    at REPLServer. (repl.js:412:12)
//    at emitOne (events.js:82:20)
//    at REPLServer.emit (events.js:169:7)
//    at REPLServer.Interface._onLine (readline.js:210:10)
//    at REPLServer.Interface._line (readline.js:549:8)
//    at REPLServer.Interface._ttyWrite (readline.js:826:14)
```

### console.warn()

```
console.warn([data][, ...])
```

Добавлено в v0.1.100

То же, что и `console.error()`.
