---
title: Ошибки
description: Классы и коды ошибок Node.js, распространение и перехват исключений, системные и пользовательские ошибки
---

# Ошибки

<!--introduced_in=v4.0.0-->

<!--type=misc-->

Приложения в Node.js обычно сталкиваются со следующими категориями ошибок:

* стандартные ошибки JavaScript, такие как [EvalError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/EvalError), [SyntaxError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError), [RangeError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RangeError),
  [ReferenceError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError), [TypeError](errors.md#class-typeerror) и [URIError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/URIError);
* стандартные `DOMException`;
* системные ошибки из‑за ограничений операционной системы, например попытка открыть
  несуществующий файл или отправить данные через закрытый сокет;
* `AssertionError` — особый класс ошибок, когда Node.js обнаруживает нарушение логики,
  которого не должно происходить; обычно их вызывает модуль `node:assert`;
* пользовательские ошибки, задаваемые кодом приложения.

Все ошибки JavaScript и системные ошибки, порождённые Node.js, наследуют или являются
экземплярами стандартного класса JavaScript [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) и гарантированно предоставляют
_как минимум_ свойства, доступные у этого класса.

Свойство [`error.message`][] у ошибок Node.js может меняться в любых версиях. Для
идентификации ошибки используйте [`error.code`][]. Для `DOMException` тип определяйте
по [`domException.name`][].

## Распространение и перехват ошибок

<!--type=misc-->

Node.js поддерживает несколько способов распространения и обработки ошибок во время
работы приложения. То, как ошибки сообщаются и обрабатываются, полностью зависит от
типа `Error` и стиля вызываемого API.

Ошибки JavaScript обрабатываются как исключения: они _немедленно_ создаются и
выбрасываются стандартным механизмом `throw`. Их перехватывают конструкцией
[`try…catch`][try-catch], которую предоставляет язык JavaScript.

```js
// Throws with a ReferenceError because z is not defined.
try {
  const m = 1;
  const n = m + z;
} catch (err) {
  // Handle the error here.
}
```

Любое использование механизма `throw` в JavaScript порождает исключение, которое
_обязано_ быть обработано, иначе процесс Node.js завершится немедленно.

За редким исключением _синхронные_ API (любой блокирующий метод, который не возвращает
[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) и не принимает функцию `callback`, например [`fs.readFileSync`][]),
сообщают об ошибках через `throw`.

Ошибки в _асинхронных_ API могут сообщаться по-разному:

* Некоторые асинхронные методы возвращают [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise); учитывайте, что промис может
  быть отклонён. См. флаг [`--unhandled-rejections`][], чтобы понять, как процесс
  реагирует на необработанное отклонение промиса.

  <!-- eslint-disable no-useless-return -->

  ```js
  const fs = require('node:fs/promises');

  (async () => {
    let data;
    try {
      data = await fs.readFile('a file that does not exist');
    } catch (err) {
      console.error('There was an error reading the file!', err);
      return;
    }
    // Otherwise handle the data
  })();
  ```

* У большинства асинхронных методов с функцией `callback` первым аргументом
  передаётся объект `Error`. Если первый аргумент не `null` и является экземпляром
  `Error`, произошла ошибка, которую нужно обработать.

  <!-- eslint-disable no-useless-return -->

  ```js
  const fs = require('node:fs');
  fs.readFile('a file that does not exist', (err, data) => {
    if (err) {
      console.error('There was an error reading the file!', err);
      return;
    }
    // Otherwise handle the data
  });
  ```

* Если асинхронный метод вызывается у объекта [`EventEmitter`][], ошибки могут
  направляться в событие `'error'` этого объекта.

  ```js
  const net = require('node:net');
  const connection = net.connect('localhost');

  // Adding an 'error' event handler to a stream:
  connection.on('error', (err) => {
    // If the connection is reset by the server, or if it can't
    // connect at all, or on any sort of error encountered by
    // the connection, the error will be sent here.
    console.error(err);
  });

  connection.pipe(process.stdout);
  ```

* Несколько методов API Node.js, которые обычно асинхронны, всё же могут
  использовать `throw` для исключений, которые нужно перехватывать через `try…catch`.
  Полного списка таких методов нет; смотрите документацию каждого метода для выбора
  подходящего способа обработки ошибок.

Механизм события `'error'` чаще всего используется в [потоковых][stream-based]
и [событийных][event emitter-based] API, которые представляют серию асинхронных
операций во времени (в отличие от одной операции, которая может завершиться успехом
или неудачей).

Для _всех_ объектов [`EventEmitter`][], если обработчик `'error'` не задан,
ошибка будет выброшена: процесс Node.js сообщит о необработанном исключении и
завершится, если только не зарегистрирован обработчик события [`'uncaughtException'`][]
или не используется устаревший модуль [`node:domain`][domains].

```js
const EventEmitter = require('node:events');
const ee = new EventEmitter();

setImmediate(() => {
  // This will crash the process because no 'error' event
  // handler has been added.
  ee.emit('error', new Error('This will crash'));
});
```

Ошибки, возникающие таким образом, _нельзя_ перехватить через `try…catch`, потому что
они выбрасываются _после_ того, как вызывающий код уже завершился.

Смотрите документацию каждого метода, чтобы понять, как именно распространяются ошибки.

## Класс: `Error`

<!--type=class-->

Обобщённый объект JavaScript [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), не указывающий конкретную причину ошибки.
Объекты `Error` содержат «трассировку стека» — место в коде, где создан `Error`,
и могут включать текстовое описание.

Все ошибки Node.js, включая системные и ошибки JavaScript, являются экземплярами
`Error` или наследуются от него.

### `new Error(message[, options])`

* `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `cause` {any} ошибка, послужившая причиной новой ошибки.

Создаёт объект `Error` и задаёт свойство `error.message` переданным текстом.
Если в `message` передан объект, текст получают вызовом `String(message)`.
При наличии опции `cause` она попадает в `error.cause`. Свойство `error.stack`
отражает место вызова `new Error()`. Трассировки зависят от [API трассировки стека V8][V8's stack trace API].
Охват стека ограничен либо (a) началом _синхронного_ выполнения кода, либо (b) числом
кадров из `Error.stackTraceLimit` — в зависимости от того, что меньше.

### `Error.captureStackTrace(targetObject[, constructorOpt])`

* `targetObject` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `constructorOpt` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Создаёт на `targetObject` свойство `.stack`; при обращении к нему возвращается
строка с местом в коде, где вызван `Error.captureStackTrace()`.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

Первая строка трассировки будет с префиксом
`${myObject.name}: ${myObject.message}`.

Необязательный аргумент `constructorOpt` — функция. Если задан, из трассировки
исключаются все кадры выше `constructorOpt`, включая сам `constructorOpt`.

Аргумент `constructorOpt` удобен, чтобы скрыть детали реализации генерации ошибок
от пользователя. Пример:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

### `Error.stackTraceLimit`

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `Error.stackTraceLimit` задаёт число кадров стека, собираемых в трассировку
(и для `new Error().stack`, и для `Error.captureStackTrace(obj)`).

По умолчанию `10`, но можно задать любое допустимое число в JavaScript. Изменения
влияют на трассировки, захваченные _после_ смены значения.

Если задать не число или отрицательное число, кадры в трассировку не попадут.

### `error.cause`

<!-- YAML
added: v16.9.0
-->

* Тип: {any}

Если задано, `error.cause` — исходная причина `Error`. Используется при перехвате
ошибки и выбросе новой с другим сообщением или кодом, чтобы сохранить доступ к
первоначальной ошибке.

Обычно `error.cause` задаётся вызовом `new Error(message, { cause })`. Конструктор
не задаёт его, если опция `cause` не передана.

Свойство позволяет связывать ошибки в цепочку. При сериализации объектов `Error`
[`util.inspect()`][] рекурсивно обрабатывает `error.cause`, если оно есть.

```js
const cause = new Error('The remote HTTP server responded with a 500 status');
const symptom = new Error('The message failed to send', { cause });

console.log(symptom);
// Prints:
//   Error: The message failed to send
//       at REPL2:1:17
//       at Script.runInThisContext (node:vm:130:12)
//       ... 7 lines matching cause stack trace ...
//       at [_line] [as _line] (node:internal/readline/interface:886:18) {
//     [cause]: Error: The remote HTTP server responded with a 500 status
//         at REPL1:1:15
//         at Script.runInThisContext (node:vm:130:12)
//         at REPLServer.defaultEval (node:repl:574:29)
//         at bound (node:domain:426:15)
//         at REPLServer.runBound [as eval] (node:domain:437:12)
//         at REPLServer.onLine (node:repl:902:10)
//         at REPLServer.emit (node:events:549:35)
//         at REPLServer.emit (node:domain:482:12)
//         at [_onLine] [as _onLine] (node:internal/readline/interface:425:12)
//         at [_line] [as _line] (node:internal/readline/interface:886:18)
```

### `error.code`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.code` — строковая метка вида ошибки. Это самый стабильный способ
идентификации: оно меняется только между мажорными версиями Node.js. Строки
`error.message`, напротив, могут меняться в любых версиях. Подробности по кодам —
в разделе [коды ошибок Node.js][Node.js error codes].

### `error.message`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.message` — текстовое описание, задаваемое вызовом `new Error(message)`.
`message` из конструктора также попадает в первую строку трассировки `Error`, но
изменение этого свойства после создания объекта _может не_ изменить первую строку
трассировки (например, если `error.stack` уже прочитали до смены свойства).

```js
const err = new Error('The message');
console.error(err.message);
// Prints: The message
```

### `error.stack`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.stack` — строка с описанием места в коде, где создан `Error`.

```console
Error: Things keep happening!
   at /home/gbusey/file.js:525:2
   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)
   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)
   at increaseSynergy (/home/gbusey/actors.js:701:6)
```

Первая строка имеет вид `<имя класса ошибки>: <сообщение>`, далее идут кадры стека
(каждая строка начинается с «at »). Каждый кадр — место вызова в коде, приведшее к
ошибке. V8 старается показать имя функции (по имени переменной, объявлению функции
или методу объекта), но иногда подходящего имени нет: тогда для кадра выводится только
расположение. Иначе выводится имя функции и в скобках — расположение.

Кадры строятся только для функций JavaScript. Если, например, выполнение
синхронно проходит через функцию аддона на C++ `cheetahify`, которая затем вызывает
функцию JavaScript, кадра для вызова `cheetahify` в трассировке не будет:

```js
const cheetahify = require('./native-binding.node');

function makeFaster() {
  // `cheetahify()` *synchronously* calls speedy.
  cheetahify(function speedy() {
    throw new Error('oh no!');
  });
}

makeFaster();
// will throw:
//   /home/gbusey/file.js:6
//       throw new Error('oh no!');
//           ^
//   Error: oh no!
//       at speedy (/home/gbusey/file.js:6:11)
//       at makeFaster (/home/gbusey/file.js:5:3)
//       at Object.<anonymous> (/home/gbusey/file.js:10:1)
//       at Module._compile (module.js:456:26)
//       at Object.Module._extensions..js (module.js:474:10)
//       at Module.load (module.js:356:32)
//       at Function.Module._load (module.js:312:12)
//       at Function.Module.runMain (module.js:497:10)
//       at startup (node.js:119:16)
//       at node.js:906:3
```

Сведения о расположении могут быть такими:

* `native` — внутренний вызов V8 (как у `[].forEach`);
* `plain-filename.js:строка:столбец` — вызов внутри Node.js;
* `/absolute/path/to/file.js:строка:столбец` — вызов в пользовательской программе
  (CommonJS) или зависимостях;
* `<transport-protocol>:///url/to/module/file.mjs:строка:столбец` — вызов в
  пользовательской программе (ESM) или зависимостях.

Число кадров в трассировке ограничено меньшим из двух: `Error.stackTraceLimit` и
числа доступных кадров на текущем тике цикла событий.

`error.stack` — геттер/сеттер для внутреннего скрытого свойства, которое есть только
у встроенных объектов `Error` (для которых [`Error.isError`][] возвращает `true`).
Если `error` не встроенный объект ошибки, геттер `error.stack` всегда возвращает
`undefined`, сеттер ничего не делает. Так бывает, если аксессор вызывают вручную с
`this`, не являющимся встроенной ошибкой, например с [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

## Класс: `AssertionError`

* Наследует: [<errors.Error>](errors.md#error)

Означает сбой проверки утверждения. Подробнее см. [`Class: assert.AssertionError`][].

## Класс: `RangeError`

* Наследует: [<errors.Error>](errors.md#error)

Указывает, что переданный аргумент вне допустимого набора или диапазона значений
функции — будь то числовой диапазон или набор допустимых вариантов параметра.

```js
require('node:net').connect(-1);
// Throws "RangeError: "port" option should be >= 0 and < 65536: -1"
```

Node.js создаёт и выбрасывает `RangeError` _сразу_ как часть проверки аргументов.

## Класс: `ReferenceError`

* Наследует: [<errors.Error>](errors.md#error)

Указывает на обращение к необъявленной переменной. Часто это опечатки или иная
поломка программы.

Прикладной код теоретически может порождать такие ошибки, но на практике их
выдаёт только V8.

```js
doesNotExist;
// Throws ReferenceError, doesNotExist is not a variable in this program.
```

Если приложение не генерирует и не выполняет код динамически, экземпляры
`ReferenceError` указывают на ошибку в коде или зависимостях.

## Класс: `SyntaxError`

* Наследует: [<errors.Error>](errors.md#error)

Указывает, что программа не является допустимым JavaScript. Такие ошибки
возникают и распространяются только при вычислении кода — через `eval`, `Function`,
`require` или [vm][]. Почти всегда это признак поломанной программы.

```js
try {
  require('node:vm').runInThisContext('binary ! isNotOk');
} catch (err) {
  // 'err' will be a SyntaxError.
}
```

Экземпляры `SyntaxError` в контексте, где они созданы, не исправить —
их может перехватить только другой контекст.

## Класс: `SystemError`

* Наследует: [<errors.Error>](errors.md#error)

Node.js порождает системные ошибки при исключениях в среде выполнения. Обычно
это нарушение ограничений ОС, например попытка прочитать несуществующий файл.

* `address` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано — адрес, при соединении с которым произошёл сбой
* `code` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) строковый код ошибки
* `dest` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано — путь назначения при ошибке файловой системы
* `errno` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) номер ошибки, предоставленный системой
* `info` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) если задано — дополнительные сведения об условии ошибки
* `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) человекочитаемое описание от системы
* `path` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано — путь к файлу при ошибке файловой системы
* `port` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) если задано — сетевой порт, который недоступен
* `syscall` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя системного вызова, вызвавшего ошибку

### `error.address`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если задано, `error.address` — адрес, при соединении с которым произошёл сбой.

### `error.code`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.code` — строковое представление кода ошибки.

### `error.dest`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если задано, `error.dest` — путь назначения при ошибке файловой системы.

### `error.errno`

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `error.errno` — отрицательное число, соответствующее коду в
[`libuv Error handling`][].

В Windows номер ошибки от системы нормализуется libuv.

Строковое имя кода получают через [`util.getSystemErrorName(error.errno)`][].

### `error.info`

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Если задано, `error.info` — объект с подробностями об условии ошибки.

### `error.message`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

`error.message` — человекочитаемое описание от системы.

### `error.path`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если задано, `error.path` — недопустимый или релевантный путь.

### `error.port`

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Если задано, `error.port` — сетевой порт, который недоступен.

### `error.syscall`

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.syscall` описывает [syscall][], завершившийся ошибкой.

### Типичные системные ошибки

Ниже перечислены ошибки, часто встречающиеся в программах Node.js. Полный список
см. на странице [`errno`(3) man page][].

* `EACCES` (Permission denied): попытка доступа к файлу способом, запрещённым правами.

* `EADDRINUSE` (Address already in use): не удалось привязать сервер ([`net`][], [`http`][]
  или [`https`][]) к локальному адресу — его уже занимает другой сервер на этой машине.

* `ECONNREFUSED` (Connection refused): соединение отклонено — целевая машина активно
  отказала. Обычно сервис на удалённом хосте не слушает порт.

* `ECONNRESET` (Connection reset by peer): соединение разорвано удалённой стороной,
  часто из‑за таймаута или перезагрузки. Типично в модулях [`http`][] и [`net`][].

* `EEXIST` (File exists): целью операции был существующий файл, тогда как требовалось,
  чтобы файла не было.

* `EISDIR` (Is a directory): ожидался файл, а по указанному пути — каталог.

* `EMFILE` (Too many open files in system): достигнут предел [дескрипторов файлов][file descriptors]
  в системе; новый дескриптор недоступен, пока не закроют хотя бы один. Часто при массовом
  открытии файлов, особенно на macOS с низким лимитом. Повысить лимит: `ulimit -n 2048`
  в той же оболочке, где запускают Node.js.

* `ENOENT` (No such file or directory): часто от операций [`fs`][] — компонент пути
  не существует; по указанному пути не найден ни файл, ни каталог.

* `ENOTDIR` (Not a directory): компонент пути существует, но это не каталог, как ожидалось.
  Часто от [`fs.readdir`][].

* `ENOTEMPTY` (Directory not empty): каталог не пуст, а операция требует пустого каталога;
  обычно связано с [`fs.unlink`][].

* `ENOTFOUND` (DNS lookup failed): сбой DNS (`EAI_NODATA` или `EAI_NONAME`). Не стандартная ошибка POSIX.

* `EPERM` (Operation not permitted): операция требует повышенных привилегий.

* `EPIPE` (Broken pipe): запись в pipe, сокет или FIFO, когда читателя нет. Часто на уровнях
  [`net`][] и [`http`][] — удалённая сторона потока закрыла соединение.

* `ETIMEDOUT` (Operation timed out): таймаут connect/send — удалённая сторона не ответила
  вовремя. Обычно в [`http`][] или [`net`][]. Часто признак того, что `socket.end()` не вызвали.

## Класс: `TypeError`

* Наследует: [<errors.Error>](errors.md#error)

Указывает, что аргумент имеет недопустимый тип, например функция передана туда,
где ожидается строка.

```js
require('node:url').parse(() => { });
// Throws TypeError, since it expected a string.
```

Node.js создаёт и выбрасывает `TypeError` _сразу_ как часть проверки типов аргументов.

## Исключения и ошибки

<!--type=misc-->

Исключение JavaScript — значение, выброшенное из‑за недопустимой операции или
явным `throw`. Не обязательно, чтобы это были экземпляры `Error` или наследники,
но все исключения, которые выбрасывают Node.js или движок JavaScript, _будут_
экземплярами `Error`.

Некоторые исключения на уровне JavaScript _невосстановимы_: такие исключения
_всегда_ завершают процесс Node.js. Примеры: проверки `assert()` или вызовы
`abort()` в слое C++.

## Ошибки OpenSSL

Ошибки из `crypto` или `tls` относятся к классу `Error`; помимо стандартных
`.code` и `.message` могут быть дополнительные поля, специфичные для OpenSSL.

### `error.opensslErrorStack`

Массив ошибок, уточняющих место в библиотеке OpenSSL, где возникла ошибка.

### `error.function`

Функция OpenSSL, в которой возникла ошибка.

### `error.library`

Библиотека OpenSSL, в которой возникла ошибка.

### `error.reason`

Человекочитаемое описание причины ошибки.

<a id="nodejs-error-codes"></a>

## Коды ошибок Node.js

<a id="ABORT_ERR"></a>

### `ABORT_ERR`

<!-- YAML
added: v15.0.0
-->

Используется, когда операция была прервана (обычно с помощью `AbortController`).

API, _не_ использующие `AbortSignal`, обычно не выдают ошибку с этим кодом.

Этот код не использует обычное соглашение `ERR_*`, которое используется в ошибках Node.js, чтобы быть совместимым с `AbortError` веб-платформы.

<a id="ERR_ACCESS_DENIED"></a>

### `ERR_ACCESS_DENIED`

Специальный тип ошибки, возникающий всякий раз, когда Node.js пытается получить доступ к ресурсу, ограниченному [Permission Model][].

<a id="ERR_AMBIGUOUS_ARGUMENT"></a>

### `ERR_AMBIGUOUS_ARGUMENT`

Аргумент функции используется таким образом, что подпись функции может быть неправильно понята. Модуль `node:assert` выбрасывает это сообщение, когда параметр `message` в `assert.throws(block, message)` совпадает с сообщением об ошибке, выброшенным `block`, поскольку такое использование предполагает, что пользователь считает `message` ожидаемым сообщением, а не сообщением, которое отобразит `AssertionError`, если `block` не выбросит сообщение.

<a id="ERR_ARG_NOT_ITERABLE"></a>

### `ERR_ARG_NOT_ITERABLE`

Аргумент iterable (т.е. значение, которое работает с циклами `for...of`) был необходим, но не предоставлялся API Node.js.

<a id="ERR_ASSERTION"></a>

### `ERR_ASSERTION`

Специальный тип ошибки, который может быть вызван всякий раз, когда Node.js обнаруживает исключительное нарушение логики, которое никогда не должно происходить. Обычно их вызывает модуль `node:assert`.

<a id="ERR_ASYNC_CALLBACK"></a>

### `ERR_ASYNC_CALLBACK`

Была предпринята попытка зарегистрировать что-то, что не является функцией, в качестве обратного вызова `AsyncHooks`.

<a id="ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED"></a>

### `ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED`

Операция, связанная с загрузкой модулей, переопределена асинхронным хуком
загрузчика, который не завершил промис до выхода потока загрузчика.

<a id="ERR_ASYNC_TYPE"></a>

### `ERR_ASYNC_TYPE`

Тип асинхронного ресурса был неверным. Пользователи также могут определять свои собственные типы при использовании общедоступного API embedder.

<a id="ERR_BROTLI_COMPRESSION_FAILED"></a>

### `ERR_BROTLI_COMPRESSION_FAILED`

Данные, переданные в поток Brotli, не были успешно сжаты.

<a id="ERR_BROTLI_INVALID_PARAM"></a>

### `ERR_BROTLI_INVALID_PARAM`

При построении потока Brotli был передан недопустимый ключ параметра.

<a id="ERR_BUFFER_CONTEXT_NOT_AVAILABLE"></a>

### `ERR_BUFFER_CONTEXT_NOT_AVAILABLE`

Была предпринята попытка создать экземпляр Node.js `Buffer` из кода аддона или embedder, находясь в JS-движке Context, который не связан с экземпляром Node.js. Данные, переданные в метод `Buffer`, будут освобождены к моменту возврата метода.

При возникновении этой ошибки возможной альтернативой созданию экземпляра `Buffer` является создание обычного `Uint8Array`, который отличается только прототипом получаемого объекта. `Uint8Array` общеприняты во всех основных API Node.js, где есть `Buffer`; они доступны во всех контекстах.

<a id="ERR_BUFFER_OUT_OF_BOUNDS"></a>

### `ERR_BUFFER_OUT_OF_BOUNDS`

Была предпринята попытка выполнить операцию, выходящую за пределы `Buffer`.

<a id="ERR_BUFFER_TOO_LARGE"></a>

### `ERR_BUFFER_TOO_LARGE`

Была предпринята попытка создать `Буфер` большего размера, чем максимально допустимый.

<a id="ERR_CANNOT_WATCH_SIGINT"></a>

### `ERR_CANNOT_WATCH_SIGINT`

Node.js не смог проследить за сигналом `SIGINT`.

<a id="ERR_CHILD_CLOSED_BEFORE_REPLY"></a>

### `ERR_CHILD_CLOSED_BEFORE_REPLY`

Дочерний процесс был закрыт до того, как родительский процесс получил ответ.

<a id="ERR_CHILD_PROCESS_IPC_REQUIRED"></a>

### `ERR_CHILD_PROCESS_IPC_REQUIRED`

Используется, когда дочерний процесс форкируется без указания IPC-канала.

<a id="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"></a>

### `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`

Используется, когда основной процесс пытается прочитать данные из STDERR/STDOUT дочернего процесса, и длина данных превышает параметр `maxBuffer`.

<a id="ERR_CLOSED_MESSAGE_PORT"></a>

### `ERR_CLOSED_MESSAGE_PORT`

<!-- YAML
added: v10.5.0
changes:
  - version:
      - v16.2.0
      - v14.17.1
    pr-url: https://github.com/nodejs/node/pull/38510
    description: The error message was reintroduced.
  - version: v11.12.0
    pr-url: https://github.com/nodejs/node/pull/26487
    description: The error message was removed.
-->

Добавлено в: v10.5.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v16.2.0, v14.17.1 | Сообщение об ошибке появилось снова. |
    | v11.12.0 | Сообщение об ошибке было удалено. |

Была попытка использовать экземпляр `MessagePort` в закрытом состоянии, обычно после вызова `.close()`.

<a id="ERR_CONSOLE_WRITABLE_STREAM"></a>

### `ERR_CONSOLE_WRITABLE_STREAM`

`Console` была создана без потока `stdout`, или `Console` имеет незаписываемый поток `stdout` или `stderr`.

<a id="ERR_CONSTRUCT_CALL_INVALID"></a>

### `ERR_CONSTRUCT_CALL_INVALID`

<!-- YAML
added: v12.5.0
-->

Был вызван конструктор класса, который не является вызываемым.

<a id="ERR_CONSTRUCT_CALL_REQUIRED"></a>

### `ERR_CONSTRUCT_CALL_REQUIRED`

Конструктор для класса был вызван без `new`.

<a id="ERR_CONTEXT_NOT_INITIALIZED"></a>

### `ERR_CONTEXT_NOT_INITIALIZED`

Контекст vm, переданный в API, еще не инициализирован. Это может произойти, если во время создания контекста произошла (и была поймана) ошибка, например, если при создании контекста произошел сбой выделения или был достигнут максимальный размер стека вызовов.

<a id="ERR_CPU_PROFILE_ALREADY_STARTED"></a>

### `ERR_CPU_PROFILE_ALREADY_STARTED`

<!-- YAML
added:
  - v24.8.0
  - v22.20.0
-->

Профиль CPU с указанным именем уже запущен.

<a id="ERR_CPU_PROFILE_NOT_STARTED"></a>

### `ERR_CPU_PROFILE_NOT_STARTED`

<!-- YAML
added:
  - v24.8.0
  - v22.20.0
-->

Профиль CPU с указанным именем не запущен.

<a id="ERR_CPU_PROFILE_TOO_MANY"></a>

### `ERR_CPU_PROFILE_TOO_MANY`

<!-- YAML
added:
  - v24.8.0
  - v22.20.0
-->

Собирается слишком много профилей CPU.

<a id="ERR_CRYPTO_ARGON2_NOT_SUPPORTED"></a>

### `ERR_CRYPTO_ARGON2_NOT_SUPPORTED`

Argon2 не поддерживается используемой версией OpenSSL.

<a id="ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED"></a>

### `ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED`

Был запрошен механизм клиентского сертификата, который не поддерживается используемой версией OpenSSL.

<a id="ERR_CRYPTO_ECDH_INVALID_FORMAT"></a>

### `ERR_CRYPTO_ECDH_INVALID_FORMAT`

В метод `getPublicKey()` класса `crypto.ECDH()` было передано недопустимое значение аргумента `format`.

<a id="ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY"></a>

### `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY`

В метод `crypto.ECDH()` класса `computeSecret()` было передано недопустимое значение аргумента `key`. Это означает, что открытый ключ лежит за пределами эллиптической кривой.

<a id="ERR_CRYPTO_ENGINE_UNKNOWN"></a>

### `ERR_CRYPTO_ENGINE_UNKNOWN`

В [`require('node:crypto').setEngine()`](crypto.md#cryptosetengineengine-flags) был передан неверный идентификатор криптографического движка.

<a id="ERR_CRYPTO_FIPS_FORCED"></a>

### `ERR_CRYPTO_FIPS_FORCED`

Был использован аргумент командной строки [`--force-fips`](cli.md#--force-fips), но была попытка включить или отключить режим FIPS в модуле `node:crypto`.

<a id="ERR_CRYPTO_FIPS_UNAVAILABLE"></a>

### `ERR_CRYPTO_FIPS_UNAVAILABLE`

Была предпринята попытка включить или отключить режим FIPS, но режим FIPS был недоступен.

<a id="ERR_CRYPTO_HASH_FINALIZED"></a>

### `ERR_CRYPTO_HASH_FINALIZED`

[`hash.digest()`](crypto.md#hashdigestencoding) был вызван несколько раз. Метод `hash.digest()` должен вызываться не более одного раза для каждого экземпляра объекта `Hash`.

<a id="ERR_CRYPTO_HASH_UPDATE_FAILED"></a>

### `ERR_CRYPTO_HASH_UPDATE_FAILED`

[`hash.update()`](crypto.md#hashupdatedata-inputencoding) не удалось по какой-либо причине. Это должно происходить редко, если вообще происходит.

<a id="ERR_CRYPTO_INCOMPATIBLE_KEY"></a>

### `ERR_CRYPTO_INCOMPATIBLE_KEY`

Данные криптографические ключи несовместимы с предпринимаемой операцией.

<a id="ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS"></a>

### `ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS`

Выбранная кодировка открытого или закрытого ключа несовместима с другими вариантами.

<a id="ERR_CRYPTO_INITIALIZATION_FAILED"></a>

### `ERR_CRYPTO_INITIALIZATION_FAILED`

<!-- YAML
added: v15.0.0
-->

Инициализация криптоподсистемы не удалась.

<a id="ERR_CRYPTO_INVALID_AUTH_TAG"></a>

### `ERR_CRYPTO_INVALID_AUTH_TAG`

<!-- YAML
added: v15.0.0
-->

Был предоставлен недопустимый тег аутентификации.

<a id="ERR_CRYPTO_INVALID_COUNTER"></a>

### `ERR_CRYPTO_INVALID_COUNTER`

<!-- YAML
added: v15.0.0
-->

Для шифра с режимом счетчика был предоставлен некорректный счетчик.

<a id="ERR_CRYPTO_INVALID_CURVE"></a>

### `ERR_CRYPTO_INVALID_CURVE`

<!-- YAML
added: v15.0.0
-->

Была предоставлена недопустимая эллиптическая кривая.

<a id="ERR_CRYPTO_INVALID_DIGEST"></a>

### `ERR_CRYPTO_INVALID_DIGEST`

Был указан неверный [алгоритм криптодайджеста](crypto.md#cryptogethashes).

<a id="ERR_CRYPTO_INVALID_IV"></a>

### `ERR_CRYPTO_INVALID_IV`

<!-- YAML
added: v15.0.0
-->

Был предоставлен недопустимый вектор инициализации.

<a id="ERR_CRYPTO_INVALID_JWK"></a>

### `ERR_CRYPTO_INVALID_JWK`

<!-- YAML
added: v15.0.0
-->

Был предоставлен недопустимый веб-ключ JSON.

<a id="ERR_CRYPTO_INVALID_KEYLEN"></a>

### `ERR_CRYPTO_INVALID_KEYLEN`

<!-- YAML
added: v15.0.0
-->

Указана недопустимая длина ключа.

<a id="ERR_CRYPTO_INVALID_KEYPAIR"></a>

### `ERR_CRYPTO_INVALID_KEYPAIR`

<!-- YAML
added: v15.0.0
-->

Была предоставлена недопустимая пара ключей.

<a id="ERR_CRYPTO_INVALID_KEYTYPE"></a>

### `ERR_CRYPTO_INVALID_KEYTYPE`

<!-- YAML
added: v15.0.0
-->

Был предоставлен недопустимый тип ключа.

<a id="ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE"></a>

### `ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE`

Тип данного объекта криптографического ключа не подходит для данной операции.

<a id="ERR_CRYPTO_INVALID_MESSAGELEN"></a>

### `ERR_CRYPTO_INVALID_MESSAGELEN`

<!-- YAML
added: v15.0.0
-->

Была предоставлена недопустимая длина сообщения.

<a id="ERR_CRYPTO_INVALID_SCRYPT_PARAMS"></a>

### `ERR_CRYPTO_INVALID_SCRYPT_PARAMS`

<!-- YAML
added: v15.0.0
-->

Были предоставлены неверные параметры алгоритма scrypt.

<a id="ERR_CRYPTO_INVALID_STATE"></a>

### `ERR_CRYPTO_INVALID_STATE`

Метод crypto был использован на объекте, который находился в недопустимом состоянии. Например, вызов [`cipher.getAuthTag()`](crypto.md#ciphergetauthtag) перед вызовом `cipher.final()`.

<a id="ERR_CRYPTO_INVALID_TAG_LENGTH"></a>

### `ERR_CRYPTO_INVALID_TAG_LENGTH`

<!-- YAML
added: v15.0.0
-->

Была указана недопустимая длина тега аутентификации.

<a id="ERR_CRYPTO_JOB_INIT_FAILED"></a>

### `ERR_CRYPTO_JOB_INIT_FAILED`

<!-- YAML
added: v15.0.0
-->

Инициализация асинхронной криптооперации не удалась.

<a id="ERR_CRYPTO_JWK_UNSUPPORTED_CURVE"></a>

### `ERR_CRYPTO_JWK_UNSUPPORTED_CURVE`

Эллиптическая кривая ключа не зарегистрирована для использования в [JSON Web Key Elliptic Curve Registry](https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve).

<a id="ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE"></a>

### `ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE`

Асимметричный тип ключа не зарегистрирован для использования в [JSON Web Key Types Registry](https://www.iana.org/assignments/jose/jose.xhtml#web-key-types).

<a id="ERR_CRYPTO_KEM_NOT_SUPPORTED"></a>

### `ERR_CRYPTO_KEM_NOT_SUPPORTED`

<!-- YAML
added: v24.7.0
-->

Attempted to use KEM operations while Node.js was not compiled with
OpenSSL with KEM support.

<a id="ERR_CRYPTO_OPERATION_FAILED"></a>

### `ERR_CRYPTO_OPERATION_FAILED`

<!-- YAML
added: v15.0.0
-->

Криптооперация завершилась неудачно по неустановленной причине.

<a id="ERR_CRYPTO_PBKDF2_ERROR"></a>

### `ERR_CRYPTO_PBKDF2_ERROR`

Алгоритм PBKDF2 не сработал по неустановленным причинам. OpenSSL не предоставляет более подробной информации, и, соответственно, Node.js тоже.

<a id="ERR_CRYPTO_SCRYPT_NOT_SUPPORTED"></a>

### `ERR_CRYPTO_SCRYPT_NOT_SUPPORTED`

Node.js was compiled without `scrypt` support. Not possible with the official
release binaries but can happen with custom builds, including distro builds.

<a id="ERR_CRYPTO_SIGN_KEY_REQUIRED"></a>

### `ERR_CRYPTO_SIGN_KEY_REQUIRED`

Ключ подписи `key` не был передан в метод [`sign.sign()`][].

<a id="ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH"></a>

### `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`

[`crypto.timingSafeEqual()`](crypto.md#cryptotimingsafeequala-b) был вызван с аргументами `Buffer`, `TypedArray` или `DataView` разной длины.

<a id="ERR_CRYPTO_UNKNOWN_CIPHER"></a>

### `ERR_CRYPTO_UNKNOWN_CIPHER`

Был указан неизвестный шифр.

<a id="ERR_CRYPTO_UNKNOWN_DH_GROUP"></a>

### `ERR_CRYPTO_UNKNOWN_DH_GROUP`

Указано неизвестное имя группы Диффи-Хеллмана. Список допустимых имен групп см. в [`crypto.getDiffieHellman()`](crypto.md#cryptogetdiffiehellmangroupname).

<a id="ERR_CRYPTO_UNSUPPORTED_OPERATION"></a>

### `ERR_CRYPTO_UNSUPPORTED_OPERATION`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

Была предпринята попытка вызвать неподдерживаемую криптооперацию.

<a id="ERR_DEBUGGER_ERROR"></a>

### `ERR_DEBUGGER_ERROR`

<!-- YAML
added:
  - v16.4.0
  - v14.17.4
-->

Произошла ошибка при работе с [отладчиком](debugger.md).

<a id="ERR_DEBUGGER_STARTUP_ERROR"></a>

### `ERR_DEBUGGER_STARTUP_ERROR`

<!-- YAML
added:
  - v16.4.0
  - v14.17.4
-->

[Отладчик](debugger.md) затянул время, ожидая, пока освободится требуемый хост/порт.

<a id="ERR_DIR_CLOSED"></a>

### `ERR_DIR_CLOSED`

Каталог [`fs.Dir`](fs.md#class-fsdir) был ранее закрыт.

<a id="ERR_DIR_CONCURRENT_OPERATION"></a>

### `ERR_DIR_CONCURRENT_OPERATION`

<!-- YAML
added: v14.3.0
-->

Была предпринята синхронная операция чтения или закрытия для [`fs.Dir`](fs.md#class-fsdir), у которого ещё выполняются асинхронные операции.

<a id="ERR_DLOPEN_DISABLED"></a>

### `ERR_DLOPEN_DISABLED`

<!-- YAML
added:
  - v16.10.0
  - v14.19.0
-->

Загрузка родных аддонов была отключена с помощью [`--no-addons`](cli.md#--no-addons).

<a id="ERR_DLOPEN_FAILED"></a>

### `ERR_DLOPEN_FAILED`

<!-- YAML
added: v15.0.0
-->

Вызов `process.dlopen()` не удался.

<a id="ERR_DNS_SET_SERVERS_FAILED"></a>

### `ERR_DNS_SET_SERVERS_FAILED`

`c-ares` failed to set the DNS server.

<a id="ERR_DOMAIN_CALLBACK_NOT_AVAILABLE"></a>

### `ERR_DOMAIN_CALLBACK_NOT_AVAILABLE`

Модуль `node:domain` был недоступен: не удалось установить необходимые перехватчики обработки ошибок, потому что ранее уже был вызван [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn).

<a id="ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE"></a>

### `ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) could not be called because the `node:domain` module has been loaded at an earlier point in time.

Трассировка стека дополнена моментом загрузки модуля `node:domain`.

<a id="ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION"></a>

### `ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION`

[`v8.startupSnapshot.setDeserializeMainFunction()`](v8.md#v8startupsnapshotsetdeserializemainfunctioncallback-data) could not be called because it had already been called before.

<a id="ERR_ENCODING_INVALID_ENCODED_DATA"></a>

### `ERR_ENCODING_INVALID_ENCODED_DATA`

Data provided to `TextDecoder()` API was invalid according to the encoding provided.

<a id="ERR_ENCODING_NOT_SUPPORTED"></a>

<a id="ERR_ENCODING_NOT_SUPPORTED"></a>

### `ERR_ENCODING_NOT_SUPPORTED`

Encoding provided to `TextDecoder()` API was not one of the [WHATWG Supported Encodings](util.md#whatwg-supported-encodings).

<a id="ERR_EVAL_ESM_CANNOT_PRINT"></a>

<a id="ERR_EVAL_ESM_CANNOT_PRINT"></a>

### `ERR_EVAL_ESM_CANNOT_PRINT`

`--print` cannot be used with ESM input.

<a id="ERR_EVENT_RECURSION"></a>

<a id="ERR_EVENT_RECURSION"></a>

### `ERR_EVENT_RECURSION`

Thrown when an attempt is made to recursively dispatch an event on `EventTarget`.

<a id="ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE"></a>

<a id="ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE"></a>

### `ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE`

Контекст выполнения JS не связан со средой Node.js. Такое возможно при встраивании Node.js как библиотеки, если не настроены некоторые перехватчики движка JS.

<a id="ERR_FALSY_VALUE_REJECTION"></a>

<a id="ERR_FALSY_VALUE_REJECTION"></a>

### `ERR_FALSY_VALUE_REJECTION`

`Promise`, преобразованный через `util.callbackify()`, был отклонён с ложным значением.

<a id="ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"></a>

<a id="ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"></a>

### `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM`

<!-- YAML
added: v14.0.0
-->

Used when a feature that is not available to the current platform which is running Node.js is used.

<a id="ERR_FS_CP_DIR_TO_NON_DIR"></a>

<a id="ERR_FS_CP_DIR_TO_NON_DIR"></a>

### `ERR_FS_CP_DIR_TO_NON_DIR`

<!-- YAML
added: v16.7.0
-->

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать каталог в не-каталог (файл, симлинк и т. п.).

<a id="ERR_FS_CP_EEXIST"></a>

<a id="ERR_FS_CP_EEXIST"></a>

### `ERR_FS_CP_EEXIST`

<!-- YAML
added: v16.7.0
-->

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка перезаписать уже существующий файл при `force` и `errorOnExist`, равных `true`.

<a id="ERR_FS_CP_EINVAL"></a>

<a id="ERR_FS_CP_EINVAL"></a>

### `ERR_FS_CP_EINVAL`

<!-- YAML
added: v16.7.0
-->

При использовании [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) `src` или `dest` указывали на недопустимый путь.

<a id="ERR_FS_CP_FIFO_PIPE"></a>

<a id="ERR_FS_CP_FIFO_PIPE"></a>

### `ERR_FS_CP_FIFO_PIPE`

<!-- YAML
added: v16.7.0
-->

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать именованный канал.

<a id="ERR_FS_CP_NON_DIR_TO_DIR"></a>

<a id="ERR_FS_CP_NON_DIR_TO_DIR"></a>

### `ERR_FS_CP_NON_DIR_TO_DIR`

<!-- YAML
added: v16.7.0
-->

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать не-каталог (файл, симлинк и т. п.) в каталог.

<a id="ERR_FS_CP_SOCKET"></a>

<a id="ERR_FS_CP_SOCKET"></a>

### `ERR_FS_CP_SOCKET`

<!-- YAML
added: v16.7.0
-->

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка копирования в сокет.

<a id="ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY"></a>

<a id="ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY"></a>

### `ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY`

<!-- YAML
added: v16.7.0
-->

При использовании [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) симлинк в `dest` указывал на подкаталог `src`.

<a id="ERR_FS_CP_UNKNOWN"></a>

<a id="ERR_FS_CP_UNKNOWN"></a>

### `ERR_FS_CP_UNKNOWN`

<!-- YAML
added: v16.7.0
-->

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка копирования в файл неизвестного типа.

<a id="ERR_FS_EISDIR"></a>

<a id="ERR_FS_EISDIR"></a>

### `ERR_FS_EISDIR`

Path is a directory.

<a id="ERR_FS_FILE_TOO_LARGE"></a>

<a id="ERR_FS_FILE_TOO_LARGE"></a>

### `ERR_FS_FILE_TOO_LARGE`

Была предпринята попытка прочитать файл, размер которого больше максимально допустимого для `Buffer`.

<a id="ERR_FS_INVALID_SYMLINK_TYPE"></a>

<a id="ERR_FS_WATCH_QUEUE_OVERFLOW"></a>

### `ERR_FS_WATCH_QUEUE_OVERFLOW`

Число событий ФС, поставленных в очередь и не обработанных, превысило значение,
заданное в `maxQueue` для `fs.watch()`.

<a id="ERR_HTTP2_ALTSVC_INVALID_ORIGIN"></a>

### `ERR_HTTP2_ALTSVC_INVALID_ORIGIN`

Кадры HTTP/2 ALTSVC требуют корректного origin.

<a id="ERR_HTTP2_ALTSVC_LENGTH"></a>

<a id="ERR_HTTP2_ALTSVC_LENGTH"></a>

### `ERR_HTTP2_ALTSVC_LENGTH`

Кадры HTTP/2 ALTSVC ограничены максимум 16 382 байтами полезной нагрузки.

<a id="ERR_HTTP2_CONNECT_AUTHORITY"></a>

<a id="ERR_HTTP2_CONNECT_AUTHORITY"></a>

### `ERR_HTTP2_CONNECT_AUTHORITY`

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:authority` обязателен.

<a id="ERR_HTTP2_CONNECT_PATH"></a>

<a id="ERR_HTTP2_CONNECT_PATH"></a>

### `ERR_HTTP2_CONNECT_PATH`

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:path` запрещён.

<a id="ERR_HTTP2_CONNECT_SCHEME"></a>

<a id="ERR_HTTP2_CONNECT_SCHEME"></a>

### `ERR_HTTP2_CONNECT_SCHEME`

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:scheme` запрещён.

<a id="ERR_HTTP2_ERROR"></a>

<a id="ERR_HTTP2_ERROR"></a>

### `ERR_HTTP2_ERROR`

Произошла неспецифичная ошибка HTTP/2.

<a id="ERR_HTTP2_GOAWAY_SESSION"></a>

<a id="ERR_HTTP2_GOAWAY_SESSION"></a>

### `ERR_HTTP2_GOAWAY_SESSION`

Новые потоки HTTP/2 нельзя открыть после того, как `Http2Session` получил кадр `GOAWAY` от удалённой стороны.

<a id="ERR_HTTP2_HEADER_SINGLE_VALUE"></a>

<a id="ERR_HTTP2_HEADERS_AFTER_RESPOND"></a>

### `ERR_HTTP2_HEADERS_AFTER_RESPOND`

Дополнительные заголовки были указаны после начала HTTP/2-ответа.

<a id="ERR_HTTP2_HEADERS_SENT"></a>

<a id="ERR_HTTP2_HEADERS_SENT"></a>

### `ERR_HTTP2_HEADERS_SENT`

Была предпринята попытка отправить несколько наборов заголовков ответа.

<a id="ERR_HTTP2_INFO_STATUS_NOT_ALLOWED"></a>

<a id="ERR_HTTP2_HEADER_SINGLE_VALUE"></a>

### `ERR_HTTP2_HEADER_SINGLE_VALUE`

Для поля заголовка HTTP/2, которое должно иметь одно значение, передано несколько значений.

<a id="ERR_HTTP2_HEADERS_AFTER_RESPOND"></a>

<a id="ERR_HTTP2_INFO_STATUS_NOT_ALLOWED"></a>

### `ERR_HTTP2_INFO_STATUS_NOT_ALLOWED`

Информационные коды состояния HTTP (`1xx`) нельзя задавать как код ответа для HTTP/2.

<a id="ERR_HTTP2_INVALID_CONNECTION_HEADERS"></a>

<a id="ERR_HTTP2_INVALID_CONNECTION_HEADERS"></a>

### `ERR_HTTP2_INVALID_CONNECTION_HEADERS`

HTTP/1 connection specific headers are forbidden to be used in HTTP/2 requests and responses.

<a id="ERR_HTTP2_INVALID_HEADER_VALUE"></a>

<a id="ERR_HTTP2_INVALID_HEADER_VALUE"></a>

### `ERR_HTTP2_INVALID_HEADER_VALUE`

Указано недопустимое значение заголовка HTTP/2.

<a id="ERR_HTTP2_INVALID_INFO_STATUS"></a>

<a id="ERR_HTTP2_INVALID_INFO_STATUS"></a>

### `ERR_HTTP2_INVALID_INFO_STATUS`

Указан недопустимый информационный код состояния HTTP. Такие коды должны быть целыми от `100` до `199` включительно.

<a id="ERR_HTTP2_INVALID_ORIGIN"></a>

<a id="ERR_HTTP2_INVALID_ORIGIN"></a>

### `ERR_HTTP2_INVALID_ORIGIN`

HTTP/2 `ORIGIN` frames require a valid origin.

<a id="ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH"></a>

<a id="ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH"></a>

### `ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH`

Input `Buffer` and `Uint8Array` instances passed to the `http2.getUnpackedSettings()` API must have a length that is a multiple of six.

<a id="ERR_HTTP2_INVALID_PSEUDOHEADER"></a>

<a id="ERR_HTTP2_INVALID_PSEUDOHEADER"></a>

### `ERR_HTTP2_INVALID_PSEUDOHEADER`

Only valid HTTP/2 pseudoheaders (`:status`, `:path`, `:authority`, `:scheme`, and `:method`) may be used.

<a id="ERR_HTTP2_INVALID_SESSION"></a>

<a id="ERR_HTTP2_INVALID_SESSION"></a>

### `ERR_HTTP2_INVALID_SESSION`

Операция выполнялась над объектом `Http2Session`, который уже был уничтожен.

<a id="ERR_HTTP2_INVALID_SETTING_VALUE"></a>

<a id="ERR_HTTP2_INVALID_SETTING_VALUE"></a>

### `ERR_HTTP2_INVALID_SETTING_VALUE`

Для параметра HTTP/2 SETTINGS указано недопустимое значение.

<a id="ERR_HTTP2_INVALID_STREAM"></a>

<a id="ERR_HTTP2_INVALID_STREAM"></a>

### `ERR_HTTP2_INVALID_STREAM`

Операция выполнялась над потоком, который уже был уничтожен.

<a id="ERR_HTTP2_MAX_PENDING_SETTINGS_ACK"></a>

<a id="ERR_HTTP2_MAX_PENDING_SETTINGS_ACK"></a>

### `ERR_HTTP2_MAX_PENDING_SETTINGS_ACK`

Whenever an HTTP/2 `SETTINGS` frame is sent to a connected peer, the peer is required to send an acknowledgment that it has received and applied the new `SETTINGS`. By default, a maximum number of unacknowledged `SETTINGS` frames may be sent at any given time. This error code is used when that limit has been reached.

<a id="ERR_HTTP2_NESTED_PUSH"></a>

<a id="ERR_HTTP2_NESTED_PUSH"></a>

### `ERR_HTTP2_NESTED_PUSH`

Была попытка открыть новый push-поток изнутри push-потока. Вложенные push-потоки не допускаются.

<a id="ERR_HTTP2_NO_MEM"></a>

<a id="ERR_HTTP2_NO_MEM"></a>

### `ERR_HTTP2_NO_MEM`

Out of memory when using the `http2session.setLocalWindowSize(windowSize)` API.

<a id="ERR_HTTP2_NO_SOCKET_MANIPULATION"></a>

<a id="ERR_HTTP2_NO_SOCKET_MANIPULATION"></a>

### `ERR_HTTP2_NO_SOCKET_MANIPULATION`

Была попытка напрямую управлять сокетом, привязанным к `Http2Session` (чтение, запись, pause, resume и т. д.).

<a id="ERR_HTTP2_ORIGIN_LENGTH"></a>

<a id="ERR_HTTP2_ORIGIN_LENGTH"></a>

### `ERR_HTTP2_ORIGIN_LENGTH`

HTTP/2 `ORIGIN` frames are limited to a length of 16382 bytes.

<a id="ERR_HTTP2_OUT_OF_STREAMS"></a>

<a id="ERR_HTTP2_OUT_OF_STREAMS"></a>

### `ERR_HTTP2_OUT_OF_STREAMS`

Достигнуто максимальное число потоков на одной сессии HTTP/2.

<a id="ERR_HTTP2_PAYLOAD_FORBIDDEN"></a>

<a id="ERR_HTTP2_PAYLOAD_FORBIDDEN"></a>

### `ERR_HTTP2_PAYLOAD_FORBIDDEN`

Для кода ответа HTTP, которому запрещено тело, было указано тело сообщения.

<a id="ERR_HTTP2_PING_CANCEL"></a>

<a id="ERR_HTTP2_PING_CANCEL"></a>

### `ERR_HTTP2_PING_CANCEL`

HTTP/2 PING был отменён.

<a id="ERR_HTTP2_PING_LENGTH"></a>

<a id="ERR_HTTP2_PING_LENGTH"></a>

### `ERR_HTTP2_PING_LENGTH`

HTTP/2 ping payloads must be exactly 8 bytes in length.

<a id="ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED"></a>

<a id="ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED"></a>

### `ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED`

Псевдозаголовок HTTP/2 использован недопустимо. Псевдозаголовки — имена ключей, начинающиеся с префикса `:`.

<a id="ERR_HTTP2_PUSH_DISABLED"></a>

<a id="ERR_HTTP2_PUSH_DISABLED"></a>

### `ERR_HTTP2_PUSH_DISABLED`

Была попытка создать push-поток, хотя клиент отключил push.

<a id="ERR_HTTP2_SEND_FILE"></a>

<a id="ERR_HTTP2_SEND_FILE"></a>

### `ERR_HTTP2_SEND_FILE`

Через API `Http2Stream.prototype.responseWithFile()` была попытка отправить каталог.

<a id="ERR_HTTP2_SEND_FILE_NOSEEK"></a>

<a id="ERR_HTTP2_SEND_FILE_NOSEEK"></a>

### `ERR_HTTP2_SEND_FILE_NOSEEK`

Через `Http2Stream.prototype.responseWithFile()` была попытка отправить не обычный файл, при этом указаны опции `offset` или `length`.

<a id="ERR_HTTP2_SESSION_ERROR"></a>

<a id="ERR_HTTP2_SESSION_ERROR"></a>

### `ERR_HTTP2_SESSION_ERROR`

`Http2Session` закрыта с ненулевым кодом ошибки.

<a id="ERR_HTTP2_SETTINGS_CANCEL"></a>

<a id="ERR_HTTP2_SETTINGS_CANCEL"></a>

### `ERR_HTTP2_SETTINGS_CANCEL`

Настройки `Http2Session` отменены.

<a id="ERR_HTTP2_SOCKET_BOUND"></a>

<a id="ERR_HTTP2_SOCKET_BOUND"></a>

### `ERR_HTTP2_SOCKET_BOUND`

Была попытка связать `Http2Session` с `net.Socket` или `tls.TLSSocket`, уже привязанным к другой `Http2Session`.

<a id="ERR_HTTP2_SOCKET_UNBOUND"></a>

<a id="ERR_HTTP2_SOCKET_UNBOUND"></a>

### `ERR_HTTP2_SOCKET_UNBOUND`

Была попытка использовать свойство `socket` у уже закрытой `Http2Session`.

<a id="ERR_HTTP2_STATUS_101"></a>

<a id="ERR_HTTP2_STATUS_101"></a>

### `ERR_HTTP2_STATUS_101`

Use of the `101` Informational status code is forbidden in HTTP/2.

<a id="ERR_HTTP2_STATUS_INVALID"></a>

<a id="ERR_HTTP2_STATUS_INVALID"></a>

### `ERR_HTTP2_STATUS_INVALID`

Указан недопустимый код состояния HTTP. Код должен быть целым от `100` до `599` включительно.

<a id="ERR_HTTP2_STREAM_CANCEL"></a>

<a id="ERR_HTTP2_STREAM_CANCEL"></a>

### `ERR_HTTP2_STREAM_CANCEL`

`Http2Stream` был уничтожен до передачи данных удалённой стороне.

<a id="ERR_HTTP2_STREAM_ERROR"></a>

<a id="ERR_HTTP2_STREAM_ERROR"></a>

### `ERR_HTTP2_STREAM_ERROR`

В кадре `RST_STREAM` указан ненулевой код ошибки.

<a id="ERR_HTTP2_STREAM_SELF_DEPENDENCY"></a>

<a id="ERR_HTTP2_STREAM_SELF_DEPENDENCY"></a>

### `ERR_HTTP2_STREAM_SELF_DEPENDENCY`

При задании приоритета потока HTTP/2 поток может быть помечен зависимым от родительского. Этот код используется при попытке сделать поток зависимым от самого себя.

<a id="ERR_HTTP2_TOO_MANY_INVALID_FRAMES"></a>

<a id="ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS"></a>

### `ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS`

Превышено число поддерживаемых пользовательских настроек (10).

<a id="ERR_HTTP2_TOO_MANY_INVALID_FRAMES"></a>

### `ERR_HTTP2_TOO_MANY_INVALID_FRAMES`

<!-- YAML
added: v15.14.0
-->

Превышен предел допустимого числа некорректных кадров протокола HTTP/2 от удалённой стороны, заданный опцией `maxSessionInvalidFrames`.

<a id="ERR_HTTP2_TRAILERS_ALREADY_SENT"></a>

<a id="ERR_HTTP2_TRAILERS_ALREADY_SENT"></a>

### `ERR_HTTP2_TRAILERS_ALREADY_SENT`

Trailing headers have already been sent on the `Http2Stream`.

<a id="ERR_HTTP2_TRAILERS_NOT_READY"></a>

<a id="ERR_HTTP2_TRAILERS_NOT_READY"></a>

### `ERR_HTTP2_TRAILERS_NOT_READY`

Метод `http2stream.sendTrailers()` нельзя вызывать до события `'wantTrailers'` на объекте `Http2Stream`. Событие `'wantTrailers'` генерируется только если для `Http2Stream` задана опция `waitForTrailers`.

<a id="ERR_HTTP2_UNSUPPORTED_PROTOCOL"></a>

<a id="ERR_HTTP2_UNSUPPORTED_PROTOCOL"></a>

### `ERR_HTTP2_UNSUPPORTED_PROTOCOL`

В `http2.connect()` передан URL с протоколом, отличным от `http:` или `https:`.

<a id="ERR_ILLEGAL_CONSTRUCTOR"></a>

<a id="ERR_HTTP_BODY_NOT_ALLOWED"></a>

### `ERR_HTTP_BODY_NOT_ALLOWED`

Ошибка возникает при записи в HTTP-ответ, который не допускает тела.

<a id="ERR_HTTP_CONTENT_LENGTH_MISMATCH"></a>

### `ERR_HTTP_CONTENT_LENGTH_MISMATCH`

Размер тела ответа не совпадает со значением заголовка Content-Length.

<a id="ERR_HTTP_CONTENT_LENGTH_MISMATCH"></a>

<a id="ERR_HTTP_HEADERS_SENT"></a>

### `ERR_HTTP_HEADERS_SENT`

Была попытка добавить заголовки после того, как заголовки уже были отправлены.

<a id="ERR_HTTP_INVALID_HEADER_VALUE"></a>

<a id="ERR_HTTP_INVALID_HEADER_VALUE"></a>

### `ERR_HTTP_INVALID_HEADER_VALUE`

Указано недопустимое значение HTTP-заголовка.

<a id="ERR_HTTP_INVALID_STATUS_CODE"></a>

<a id="ERR_HTTP_INVALID_STATUS_CODE"></a>

### `ERR_HTTP_INVALID_STATUS_CODE`

Код состояния вне обычного диапазона (100–999).

<a id="ERR_HTTP_REQUEST_TIMEOUT"></a>

<a id="ERR_HTTP_REQUEST_TIMEOUT"></a>

### `ERR_HTTP_REQUEST_TIMEOUT`

Клиент не отправил весь запрос за отведённое время.

<a id="ERR_HTTP_SOCKET_ENCODING"></a>

<a id="ERR_HTTP_SOCKET_ASSIGNED"></a>

### `ERR_HTTP_SOCKET_ASSIGNED`

Указанному [`ServerResponse`][] уже назначен сокет.

<a id="ERR_HTTP_SOCKET_ENCODING"></a>

### `ERR_HTTP_SOCKET_ENCODING`

Согласно [RFC 7230, раздел 3](https://tools.ietf.org/html/rfc7230#section-3), смена кодировки сокета не допускается.

<a id="ERR_HTTP_TRAILER_INVALID"></a>

<a id="ERR_HTTP_TRAILER_INVALID"></a>

### `ERR_HTTP_TRAILER_INVALID`

Заголовок `Trailer` задан, хотя кодирование передачи это не поддерживает.

<a id="ERR_HTTP2_ALTSVC_INVALID_ORIGIN"></a>

<a id="ERR_ILLEGAL_CONSTRUCTOR"></a>

### `ERR_ILLEGAL_CONSTRUCTOR`

Была попытка создать объект через непубличный конструктор.

<a id="ERR_IMPORT_ASSERTION_TYPE_FAILED"></a>

<a id="ERR_IMPORT_ATTRIBUTE_MISSING"></a>

### `ERR_IMPORT_ATTRIBUTE_MISSING`

<!-- YAML
added:
  - v21.1.0
-->

Отсутствует атрибут импорта, из‑за чего указанный модуль нельзя импортировать.

<a id="ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE"></a>

### `ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE`

<!-- YAML
added:
  - v21.1.0
-->

Атрибут импорта `type` указан, но модуль другого типа.

<a id="ERR_IMPORT_ATTRIBUTE_UNSUPPORTED"></a>

### `ERR_IMPORT_ATTRIBUTE_UNSUPPORTED`

<!-- YAML
added:
  - v21.0.0
  - v20.10.0
  - v18.19.0
-->

Атрибут импорта не поддерживается этой версией Node.js.

<a id="ERR_INCOMPATIBLE_OPTION_PAIR"></a>

### `ERR_INCOMPATIBLE_OPTION_PAIR`

Пара опций несовместима с самой собой и не может использоваться одновременно.

<a id="ERR_INPUT_TYPE_NOT_ALLOWED"></a>

<a id="ERR_INPUT_TYPE_NOT_ALLOWED"></a>

### `ERR_INPUT_TYPE_NOT_ALLOWED`

> Stability: 1 - Experimental

Флаг `--input-type` использован для запуска файла. Его можно применять только вместе с вводом через `--eval`, `--print` или `STDIN`.

<a id="ERR_INSPECTOR_ALREADY_ACTIVATED"></a>

<a id="ERR_INSPECTOR_ALREADY_ACTIVATED"></a>

### `ERR_INSPECTOR_ALREADY_ACTIVATED`

При использовании `node:inspector` была попытка активировать инспектор, когда он уже слушает порт. Вызовите `inspector.close()` перед активацией на другом адресе.

<a id="ERR_INSPECTOR_ALREADY_CONNECTED"></a>

<a id="ERR_INSPECTOR_ALREADY_CONNECTED"></a>

### `ERR_INSPECTOR_ALREADY_CONNECTED`

При использовании `node:inspector` была попытка подключиться, когда инспектор уже подключён.

<a id="ERR_INSPECTOR_CLOSED"></a>

<a id="ERR_INSPECTOR_CLOSED"></a>

### `ERR_INSPECTOR_CLOSED`

При использовании `node:inspector` была попытка использовать инспектор после закрытия сессии.

<a id="ERR_INSPECTOR_COMMAND"></a>

<a id="ERR_INSPECTOR_COMMAND"></a>

### `ERR_INSPECTOR_COMMAND`

Ошибка при выполнении команды через модуль `node:inspector`.

<a id="ERR_INSPECTOR_NOT_ACTIVE"></a>

<a id="ERR_INSPECTOR_NOT_ACTIVE"></a>

### `ERR_INSPECTOR_NOT_ACTIVE`

`inspector` не активен в момент вызова `inspector.waitForDebugger()`.

<a id="ERR_INSPECTOR_NOT_AVAILABLE"></a>

<a id="ERR_INSPECTOR_NOT_AVAILABLE"></a>

### `ERR_INSPECTOR_NOT_AVAILABLE`

Модуль `node:inspector` недоступен.

<a id="ERR_INSPECTOR_NOT_CONNECTED"></a>

<a id="ERR_INSPECTOR_NOT_CONNECTED"></a>

### `ERR_INSPECTOR_NOT_CONNECTED`

При использовании `node:inspector` была попытка использовать инспектор до подключения.

<a id="ERR_INSPECTOR_NOT_WORKER"></a>

<a id="ERR_INSPECTOR_NOT_WORKER"></a>

### `ERR_INSPECTOR_NOT_WORKER`

API вызван в основном потоке, хотя допускается только из потока worker.

<a id="ERR_INTERNAL_ASSERTION"></a>

<a id="ERR_INTERNAL_ASSERTION"></a>

### `ERR_INTERNAL_ASSERTION`

Обнаружена ошибка в Node.js или некорректное использование внутренностей Node.js. Сообщите об issue: <https://github.com/nodejs/node/issues>.

<a id="ERR_INVALID_ADDRESS_FAMILY"></a>

<a id="ERR_INVALID_ADDRESS"></a>

### `ERR_INVALID_ADDRESS`

Переданный адрес не распознан API Node.js.

<a id="ERR_INVALID_ADDRESS_FAMILY"></a>

### `ERR_INVALID_ADDRESS_FAMILY`

Переданное семейство адресов не распознано API Node.js.

<a id="ERR_INVALID_ARG_TYPE"></a>

<a id="ERR_INVALID_ARG_TYPE"></a>

### `ERR_INVALID_ARG_TYPE`

В API Node.js передан аргумент неверного типа.

<a id="ERR_INVALID_ARG_VALUE"></a>

<a id="ERR_INVALID_ARG_VALUE"></a>

### `ERR_INVALID_ARG_VALUE`

Для аргумента передано недопустимое или неподдерживаемое значение.

<a id="ERR_INVALID_ASYNC_ID"></a>

<a id="ERR_INVALID_ASYNC_ID"></a>

### `ERR_INVALID_ASYNC_ID`

Через `AsyncHooks` передан недопустимый `asyncId` или `triggerAsyncId`. Идентификатор меньше -1 не должен встречаться.

<a id="ERR_INVALID_BUFFER_SIZE"></a>

<a id="ERR_INVALID_BUFFER_SIZE"></a>

### `ERR_INVALID_BUFFER_SIZE`

Для `Buffer` выполнен swap, но размер не подходит для операции.

<a id="ERR_INVALID_CHAR"></a>

<a id="ERR_INVALID_CHAR"></a>

### `ERR_INVALID_CHAR`

В заголовках обнаружены недопустимые символы.

<a id="ERR_INVALID_CURSOR_POS"></a>

<a id="ERR_INVALID_CURSOR_POS"></a>

### `ERR_INVALID_CURSOR_POS`

Курсор потока нельзя переместить на указанную строку без указанного столбца.

<a id="ERR_INVALID_FD"></a>

<a id="ERR_INVALID_FD"></a>

### `ERR_INVALID_FD`

Недопустимый файловый дескриптор (`fd`), например отрицательное значение.

<a id="ERR_INVALID_FD_TYPE"></a>

<a id="ERR_INVALID_FD_TYPE"></a>

### `ERR_INVALID_FD_TYPE`

Недопустимый тип файлового дескриптора (`fd`).

<a id="ERR_INVALID_FILE_URL_HOST"></a>

<a id="ERR_INVALID_FILE_URL_HOST"></a>

### `ERR_INVALID_FILE_URL_HOST`

API Node.js, работающее с URL `file:` (например функции [`fs`](fs.md)), получило URL с недопустимым хостом. Такое возможно только на Unix-подобных системах, где поддерживаются только `localhost` или пустой хост.

<a id="ERR_INVALID_FILE_URL_PATH"></a>

<a id="ERR_INVALID_FILE_URL_PATH"></a>

### `ERR_INVALID_FILE_URL_PATH`

API Node.js, работающее с URL `file:` (например [`fs`](fs.md)), получило URL с недопустимым путём. Допустимость пути зависит от платформы.

<a id="ERR_INVALID_HANDLE_TYPE"></a>

<a id="ERR_INVALID_HANDLE_TYPE"></a>

### `ERR_INVALID_HANDLE_TYPE`

Попытка передать неподдерживаемый «handle» по IPC дочернему процессу. См. [`subprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback) и [`process.send()`](process.md#processsendmessage-sendhandle-options-callback).

<a id="ERR_INVALID_HTTP_TOKEN"></a>

<a id="ERR_INVALID_HTTP_TOKEN"></a>

### `ERR_INVALID_HTTP_TOKEN`

Передан недопустимый HTTP-токен.

<a id="ERR_INVALID_IP_ADDRESS"></a>

<a id="ERR_INVALID_IP_ADDRESS"></a>

### `ERR_INVALID_IP_ADDRESS`

Недопустимый IP-адрес.

<a id="ERR_INVALID_MIME_SYNTAX"></a>

<a id="ERR_INVALID_MIME_SYNTAX"></a>

### `ERR_INVALID_MIME_SYNTAX`

Синтаксис MIME некорректен.

<a id="ERR_INVALID_MODULE"></a>

<a id="ERR_INVALID_MODULE"></a>

### `ERR_INVALID_MODULE`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

Попытка загрузить несуществующий или иначе недопустимый модуль.

<a id="ERR_INVALID_MODULE_SPECIFIER"></a>

<a id="ERR_INVALID_MODULE_SPECIFIER"></a>

### `ERR_INVALID_MODULE_SPECIFIER`

Строка импортируемого модуля — недопустимый URL, имя пакета или спецификатор подпути.

<a id="ERR_INVALID_OBJECT_DEFINE_PROPERTY"></a>

<a id="ERR_INVALID_OBJECT_DEFINE_PROPERTY"></a>

### `ERR_INVALID_OBJECT_DEFINE_PROPERTY`

Ошибка при установке недопустимого атрибута свойства объекта.

<a id="ERR_INVALID_PACKAGE_CONFIG"></a>

<a id="ERR_INVALID_PACKAGE_CONFIG"></a>

### `ERR_INVALID_PACKAGE_CONFIG`

Файл [`package.json`](packages.md#nodejs-packagejson-field-definitions) недопустим и не разобран.

<a id="ERR_INVALID_PACKAGE_TARGET"></a>

<a id="ERR_INVALID_PACKAGE_TARGET"></a>

### `ERR_INVALID_PACKAGE_TARGET`

Поле [`"exports"`](packages.md#exports) в `package.json` содержит недопустимое сопоставление цели для данного разрешения модуля.

<a id="ERR_INVALID_PERFORMANCE_MARK"></a>

<a id="ERR_INVALID_PROTOCOL"></a>

### `ERR_INVALID_PROTOCOL`

В `http.request()` передан недопустимый `options.protocol`.

<a id="ERR_INVALID_REPL_EVAL_CONFIG"></a>

<a id="ERR_INVALID_REPL_EVAL_CONFIG"></a>

### `ERR_INVALID_REPL_EVAL_CONFIG`

В конфиге [`REPL`](repl.md) одновременно заданы `breakEvalOnSigint` и `eval`, что не поддерживается.

<a id="ERR_INVALID_REPL_INPUT"></a>

<a id="ERR_INVALID_REPL_INPUT"></a>

### `ERR_INVALID_REPL_INPUT`

Ввод нельзя использовать в [`REPL`](repl.md). Условия использования этой ошибки описаны в документации [`REPL`](repl.md).

<a id="ERR_INVALID_RETURN_PROPERTY"></a>

<a id="ERR_INVALID_RETURN_PROPERTY"></a>

### `ERR_INVALID_RETURN_PROPERTY`

Выбрасывается, если опция-функция не возвращает допустимое значение для одного из свойств объекта при выполнении.

<a id="ERR_INVALID_RETURN_PROPERTY_VALUE"></a>

<a id="ERR_INVALID_RETURN_PROPERTY_VALUE"></a>

### `ERR_INVALID_RETURN_PROPERTY_VALUE`

Выбрасывается, если опция-функция не возвращает ожидаемый тип для одного из свойств объекта при выполнении.

<a id="ERR_INVALID_RETURN_VALUE"></a>

<a id="ERR_INVALID_RETURN_VALUE"></a>

### `ERR_INVALID_RETURN_VALUE`

Выбрасывается, если опция-функция не возвращает ожидаемый тип при выполнении (например ожидался промис).

<a id="ERR_INVALID_STATE"></a>

<a id="ERR_INVALID_STATE"></a>

### `ERR_INVALID_STATE`

<!-- YAML
added: v15.0.0
-->

Операция не может быть завершена из‑за недопустимого состояния: объект уже уничтожен или выполняет другую операцию.

<a id="ERR_INVALID_SYNC_FORK_INPUT"></a>

<a id="ERR_INVALID_SYNC_FORK_INPUT"></a>

### `ERR_INVALID_SYNC_FORK_INPUT`

В асинхронный fork в качестве stdio переданы `Buffer`, `TypedArray`, `DataView` или строка. См. документацию [`child_process`](child_process.md).

<a id="ERR_INVALID_THIS"></a>

<a id="ERR_INVALID_THIS"></a>

### `ERR_INVALID_THIS`

Функция API Node.js вызвана с несовместимым значением `this`.

```js
const urlSearchParams = new URLSearchParams(
    'foo=bar&baz=new'
);

const buf = Buffer.alloc(1);
urlSearchParams.has.call(buf, 'foo');
// Throws a TypeError with code 'ERR_INVALID_THIS'
```

<a id="ERR_INVALID_TRANSFER_OBJECT"></a>

<a id="ERR_INVALID_TUPLE"></a>

### `ERR_INVALID_TUPLE`

Элемент переданного `iterable` в [конструктор `URLSearchParams`](url.md#new-urlsearchparamsiterable) [WHATWG](url.md#the-whatwg-url-api) не является кортежем `[name, value]`: элемент не итерируемый или не из двух элементов.

<a id="ERR_INVALID_URI"></a>

<a id="ERR_INVALID_TYPESCRIPT_SYNTAX"></a>

### `ERR_INVALID_TYPESCRIPT_SYNTAX`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
changes:
    - version:
      - v23.7.0
      - v22.14.0
      pr-url: https://github.com/nodejs/node/pull/56610
      description: This error is no longer thrown on valid yet unsupported syntax.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.7.0, v22.14.0 | Эта ошибка больше не выдается при допустимом, но неподдерживаемом синтаксисе. |

Указанный синтаксис TypeScript недопустим.

<a id="ERR_INVALID_URI"></a>

### `ERR_INVALID_URI`

Передан недопустимый URI.

<a id="ERR_INVALID_URL"></a>

<a id="ERR_INVALID_URL"></a>

### `ERR_INVALID_URL`

В [конструктор `URL`](url.md#new-urlinput-base) [WHATWG](url.md#the-whatwg-url-api) или устаревший [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) передан недопустимый URL. У объекта ошибки обычно есть свойство `'input'` с неразобранным URL.

<a id="ERR_INVALID_URL_SCHEME"></a>

<a id="ERR_INVALID_URL_PATTERN"></a>

### `ERR_INVALID_URL_PATTERN`

Передан недопустимый URLPattern в [WHATWG][WHATWG URL API]
[`URLPattern` constructor][`new URLPattern(input)`] to be parsed.

<a id="ERR_INVALID_URL_SCHEME"></a>

### `ERR_INVALID_URL_SCHEME`

Попытка использовать URL с несовместимой схемой (протоколом). Сейчас используется в [`fs`](fs.md) с [WHATWG URL API](url.md#the-whatwg-url-api) (только `'file'`), в будущем возможно и в других API.

<a id="ERR_IPC_CHANNEL_CLOSED"></a>

<a id="ERR_IPC_CHANNEL_CLOSED"></a>

### `ERR_IPC_CHANNEL_CLOSED`

Попытка использовать уже закрытый IPC-канал.

<a id="ERR_IPC_DISCONNECTED"></a>

<a id="ERR_IPC_DISCONNECTED"></a>

### `ERR_IPC_DISCONNECTED`

Попытка отключить уже отключённый IPC-канал. См. [`child_process`](child_process.md).

<a id="ERR_IPC_ONE_PIPE"></a>

<a id="ERR_IPC_ONE_PIPE"></a>

### `ERR_IPC_ONE_PIPE`

Попытка создать дочерний процесс Node.js с более чем одним IPC-каналом. См. [`child_process`](child_process.md).

<a id="ERR_IPC_SYNC_FORK"></a>

<a id="ERR_IPC_SYNC_FORK"></a>

### `ERR_IPC_SYNC_FORK`

Попытка открыть IPC-канал с синхронно форкнутым процессом Node.js. См. [`child_process`](child_process.md).

<a id="ERR_LOADER_CHAIN_INCOMPLETE"></a>

<a id="ERR_IP_BLOCKED"></a>

### `ERR_IP_BLOCKED`

IP is blocked by `net.BlockList`.

<a id="ERR_LOADER_CHAIN_INCOMPLETE"></a>

### `ERR_LOADER_CHAIN_INCOMPLETE`

<!-- YAML
added:
  - v18.6.0
  - v16.17.0
-->

Хук загрузчика ESM вернул управление без вызова `next()` и без явного short circuit.

<a id="ERR_MANIFEST_ASSERT_INTEGRITY"></a>

<a id="ERR_LOAD_SQLITE_EXTENSION"></a>

### `ERR_LOAD_SQLITE_EXTENSION`

<!-- YAML
added:
  - v23.5.0
  - v22.13.0
-->

Ошибка при загрузке расширения SQLite.

<a id="ERR_MEMORY_ALLOCATION_FAILED"></a>

### `ERR_MEMORY_ALLOCATION_FAILED`

Не удалось выделить память (обычно в слое C++).

<a id="ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE"></a>

<a id="ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE"></a>

### `ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

Сообщение в [`MessagePort`](worker_threads.md#class-messageport) не удалось десериализовать в целевом контексте [vm](vm.md). Не все объекты Node.js можно создать в любом контексте; передача через `postMessage()` может не сработать.

<a id="ERR_METHOD_NOT_IMPLEMENTED"></a>

<a id="ERR_METHOD_NOT_IMPLEMENTED"></a>

### `ERR_METHOD_NOT_IMPLEMENTED`

Требуемый метод не реализован.

<a id="ERR_MISSING_ARGS"></a>

<a id="ERR_MISSING_ARGS"></a>

### `ERR_MISSING_ARGS`

Не передан обязательный аргумент API Node.js (строгое соответствие спецификации: иногда допустимо `func(undefined)`, но не `func()`). В большинстве нативных API `func(undefined)` и `func()` эквивалентны; может использоваться [`ERR_INVALID_ARG_TYPE`](#err_invalid_arg_type).

<a id="ERR_MISSING_OPTION"></a>

<a id="ERR_MISSING_OPTION"></a>

### `ERR_MISSING_OPTION`

For APIs that accept options objects, some options might be mandatory. This code is thrown if a required option is missing.

<a id="ERR_MISSING_PASSPHRASE"></a>

<a id="ERR_MISSING_PASSPHRASE"></a>

### `ERR_MISSING_PASSPHRASE`

Попытка прочитать зашифрованный ключ без пароля.

<a id="ERR_MISSING_PLATFORM_FOR_WORKER"></a>

<a id="ERR_MISSING_PLATFORM_FOR_WORKER"></a>

### `ERR_MISSING_PLATFORM_FOR_WORKER`

Платформа V8 в этом экземпляре Node.js не поддерживает создание Workers из‑за отсутствия поддержки со стороны встраивания. В стандартных сборках Node.js эта ошибка не возникает.

<a id="ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST"></a>

<a id="ERR_MODULE_LINK_MISMATCH"></a>

### `ERR_MODULE_LINK_MISMATCH`

Модуль нельзя связать: одинаковые запросы модуля в нём разрешаются в разные
модули.

<a id="ERR_MODULE_NOT_FOUND"></a>

### `ERR_MODULE_NOT_FOUND`

Загрузчик ECMAScript-модулей не смог разрешить файл модуля при `import` или при загрузке точки входа.

<a id="ERR_MULTIPLE_CALLBACK"></a>

<a id="ERR_MULTIPLE_CALLBACK"></a>

### `ERR_MULTIPLE_CALLBACK`

Колбэк вызван более одного раза.

Колбэк обычно вызывают один раз: запрос выполняется или отклоняется, но не оба сразу. Повторный вызов нарушает это.

<a id="ERR_NAPI_CONS_FUNCTION"></a>

<a id="ERR_NAPI_CONS_FUNCTION"></a>

### `ERR_NAPI_CONS_FUNCTION`

While using `Node-API`, a constructor passed was not a function.

<a id="ERR_NAPI_INVALID_DATAVIEW_ARGS"></a>

<a id="ERR_NAPI_INVALID_DATAVIEW_ARGS"></a>

### `ERR_NAPI_INVALID_DATAVIEW_ARGS`

While calling `napi_create_dataview()`, a given `offset` was outside the bounds of the dataview or `offset + length` was larger than a length of given `buffer`.

<a id="ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT"></a>

<a id="ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT"></a>

### `ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT`

While calling `napi_create_typedarray()`, the provided `offset` was not a multiple of the element size.

<a id="ERR_NAPI_INVALID_TYPEDARRAY_LENGTH"></a>

<a id="ERR_NAPI_INVALID_TYPEDARRAY_LENGTH"></a>

### `ERR_NAPI_INVALID_TYPEDARRAY_LENGTH`

While calling `napi_create_typedarray()`, `(length * size_of_element) + byte_offset` was larger than the length of given `buffer`.

<a id="ERR_NAPI_TSFN_CALL_JS"></a>

<a id="ERR_NAPI_TSFN_CALL_JS"></a>

### `ERR_NAPI_TSFN_CALL_JS`

Ошибка при вызове JavaScript-части потокобезопасной функции.

<a id="ERR_NAPI_TSFN_GET_UNDEFINED"></a>

<a id="ERR_NAPI_TSFN_GET_UNDEFINED"></a>

### `ERR_NAPI_TSFN_GET_UNDEFINED`

Ошибка при получении значения JavaScript `undefined`.

<a id="ERR_NAPI_TSFN_START_IDLE_LOOP"></a>

<a id="ERR_NON_CONTEXT_AWARE_DISABLED"></a>

### `ERR_NON_CONTEXT_AWARE_DISABLED`

Загружен нативный аддон без поддержки контекста в процессе, где это запрещено.

<a id="ERR_OUT_OF_RANGE"></a>

<a id="ERR_NOT_BUILDING_SNAPSHOT"></a>

### `ERR_NOT_BUILDING_SNAPSHOT`

Использованы операции, доступные только при сборке снимка запуска V8, хотя снимок не собирается.

<a id="ERR_NO_CRYPTO"></a>

<a id="ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION"></a>

### `ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

Операция недоступна вне приложения в виде одного исполняемого файла.

<a id="ERR_NOT_SUPPORTED_IN_SNAPSHOT"></a>

### `ERR_NOT_SUPPORTED_IN_SNAPSHOT`

Попытка выполнить операции, недоступные при сборке снимка запуска.

<a id="ERR_NO_CRYPTO"></a>

### `ERR_NO_CRYPTO`

Использованы криптографические возможности при сборке Node.js без OpenSSL.

<a id="ERR_NO_ICU"></a>

<a id="ERR_NO_ICU"></a>

### `ERR_NO_ICU`

Требуются возможности [ICU](intl.md#internationalization-support), но Node.js собран без ICU.

<a id="ERR_NON_CONTEXT_AWARE_DISABLED"></a>

<a id="ERR_NO_TYPESCRIPT"></a>

### `ERR_NO_TYPESCRIPT`

<!-- YAML
added:
  - v23.0.0
  - v22.12.0
-->

Требуется [поддержка Native TypeScript][], но Node.js собран без TypeScript.

<a id="ERR_OPERATION_FAILED"></a>

### `ERR_OPERATION_FAILED`

<!-- YAML
added: v15.0.0
-->

Операция не удалась. Обычно обозначает общий сбой асинхронной операции.

<a id="ERR_OPTIONS_BEFORE_BOOTSTRAPPING"></a>

### `ERR_OPTIONS_BEFORE_BOOTSTRAPPING`

<!-- YAML
added:
 - v23.10.0
 - v22.16.0
-->

Попытка получить опции до завершения начальной загрузки.

<a id="ERR_OUT_OF_RANGE"></a>

### `ERR_OUT_OF_RANGE`

Значение вне допустимого диапазона.

<a id="ERR_PACKAGE_IMPORT_NOT_DEFINED"></a>

<a id="ERR_PACKAGE_IMPORT_NOT_DEFINED"></a>

### `ERR_PACKAGE_IMPORT_NOT_DEFINED`

Поле [`"imports"`](packages.md#imports) в `package.json` не задаёт сопоставление для данного внутреннего спецификатора пакета.

<a id="ERR_PACKAGE_PATH_NOT_EXPORTED"></a>

<a id="ERR_PACKAGE_PATH_NOT_EXPORTED"></a>

### `ERR_PACKAGE_PATH_NOT_EXPORTED`

Поле [`"exports"`](packages.md#exports) в `package.json` не экспортирует запрошенный подпуть. Экспорты инкапсулированы: приватные внутренние модули нельзя импортировать через разрешение пакета, кроме как по абсолютному URL.

<a id="ERR_PARSE_ARGS_INVALID_OPTION_VALUE"></a>

<a id="ERR_PARSE_ARGS_INVALID_OPTION_VALUE"></a>

### `ERR_PARSE_ARGS_INVALID_OPTION_VALUE`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

При `strict`, равном `true`, выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), если для опции типа [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) передано значение [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type), или для опции типа [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) передана строка [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type).

<a id="ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL"></a>

<a id="ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL"></a>

### `ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

Thrown by [`util.parseArgs()`](util.md#utilparseargsconfig), when a positional argument is provided and `allowPositionals` is set to `false`.

<a id="ERR_PARSE_ARGS_UNKNOWN_OPTION"></a>

<a id="ERR_PARSE_ARGS_UNKNOWN_OPTION"></a>

### `ERR_PARSE_ARGS_UNKNOWN_OPTION`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

При `strict`, равном `true`, выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), если аргумент не описан в `options`.

<a id="ERR_PERFORMANCE_INVALID_TIMESTAMP"></a>

<a id="ERR_PERFORMANCE_INVALID_TIMESTAMP"></a>

### `ERR_PERFORMANCE_INVALID_TIMESTAMP`

Для метки или измерения производительности передано недопустимое время.

<a id="ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS"></a>

<a id="ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS"></a>

### `ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS`

Invalid options were provided for a performance measure.

<a id="ERR_PROTO_ACCESS"></a>

<a id="ERR_PROTO_ACCESS"></a>

### `ERR_PROTO_ACCESS`

Accessing `Object.prototype.__proto__` has been forbidden using [`--disable-proto=throw`](cli.md#--disable-protomode). [`Object.getPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) and [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf) should be used to get and set the prototype of an object.

<a id="ERR_REQUIRE_ESM"></a>

<a id="ERR_PROXY_INVALID_CONFIG"></a>

### `ERR_PROXY_INVALID_CONFIG`

Failed to proxy a request because the proxy configuration is invalid.

<a id="ERR_PROXY_TUNNEL"></a>

### `ERR_PROXY_TUNNEL`

Failed to establish proxy tunnel when `NODE_USE_ENV_PROXY` or `--use-env-proxy` is enabled.

<a id="ERR_QUIC_APPLICATION_ERROR"></a>

### `ERR_QUIC_APPLICATION_ERROR`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

> Stability: 1 - Experimental

Ошибка приложения QUIC.

<a id="ERR_QUIC_CONNECTION_FAILED"></a>

### `ERR_QUIC_CONNECTION_FAILED`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

> Stability: 1 - Experimental

Establishing a QUIC connection failed.

<a id="ERR_QUIC_ENDPOINT_CLOSED"></a>

### `ERR_QUIC_ENDPOINT_CLOSED`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

> Stability: 1 - Experimental

Конечная точка QUIC закрыта с ошибкой.

<a id="ERR_QUIC_OPEN_STREAM_FAILED"></a>

### `ERR_QUIC_OPEN_STREAM_FAILED`

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

> Stability: 1 - Experimental

Opening a QUIC stream failed.

<a id="ERR_QUIC_TRANSPORT_ERROR"></a>

### `ERR_QUIC_TRANSPORT_ERROR`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

> Stability: 1 - Experimental

Ошибка транспорта QUIC.

<a id="ERR_QUIC_VERSION_NEGOTIATION_ERROR"></a>

### `ERR_QUIC_VERSION_NEGOTIATION_ERROR`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
-->

> Stability: 1 - Experimental

Сессия QUIC не удалась: требуется согласование версии.

<a id="ERR_REQUIRE_ASYNC_MODULE"></a>

### `ERR_REQUIRE_ASYNC_MODULE`

При попытке `require()` [ES-модуля][] оказалось, что модуль асинхронный, то есть
содержит top-level await.

Чтобы увидеть, где находится top-level await, используйте
`--experimental-print-required-tla` (при этом модули выполняются до поиска
top-level await).

<a id="ERR_REQUIRE_CYCLE_MODULE"></a>

### `ERR_REQUIRE_CYCLE_MODULE`

При попытке `require()` [ES-модуля][] участвует в немедленном цикле граница
CommonJS↔ESM.
Это недопустимо: ES-модули нельзя вычислять, пока они уже вычисляются.

Чтобы разорвать цикл, вызов `require()` в цикле не должен происходить на верхнем
уровне ни ES-модуля (через `createRequire()`), ни CommonJS-модуля — его следует
отложить во внутреннюю функцию.

<a id="ERR_REQUIRE_ESM"></a>

### `ERR_REQUIRE_ESM`

<!-- YAML
changes:
  - version:
    - v23.0.0
    - v22.12.0
    - v20.19.0
    pr-url: https://github.com/nodejs/node/pull/55085
    description: require() now supports loading synchronous ES modules by default.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.0.0, v22.12.0, v20.19.0 | require() теперь поддерживает загрузку синхронных модулей ES по умолчанию. |

> Stability: 1 - Experimental

An attempt was made to `require()` an [ES Module](esm.md).

<a id="ERR_SCRIPT_EXECUTION_INTERRUPTED"></a>

<a id="ERR_SCRIPT_EXECUTION_INTERRUPTED"></a>

### `ERR_SCRIPT_EXECUTION_INTERRUPTED`

Script execution was interrupted by `SIGINT` (For example, <kbd>Ctrl</kbd>+<kbd>C</kbd> was pressed.)

<a id="ERR_SCRIPT_EXECUTION_TIMEOUT"></a>

<a id="ERR_SCRIPT_EXECUTION_TIMEOUT"></a>

### `ERR_SCRIPT_EXECUTION_TIMEOUT`

Script execution timed out, possibly due to bugs in the script being executed.

<a id="ERR_SERVER_ALREADY_LISTEN"></a>

<a id="ERR_SERVER_ALREADY_LISTEN"></a>

### `ERR_SERVER_ALREADY_LISTEN`

Метод [`server.listen()`](net.md#serverlisten) вызван, когда `net.Server` уже слушает. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP/2.

<a id="ERR_SERVER_NOT_RUNNING"></a>

<a id="ERR_SERVER_NOT_RUNNING"></a>

### `ERR_SERVER_NOT_RUNNING`

Метод [`server.close()`](net.md#serverclosecallback) вызван, когда `net.Server` не работает. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP/2.

<a id="ERR_SOCKET_ALREADY_BOUND"></a>

<a id="ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND"></a>

### `ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

A key was passed to single executable application APIs to identify an asset,
but no match could be found.

<a id="ERR_SOCKET_ALREADY_BOUND"></a>

### `ERR_SOCKET_ALREADY_BOUND`

An attempt was made to bind a socket that has already been bound.

<a id="ERR_SOCKET_BAD_BUFFER_SIZE"></a>

<a id="ERR_SOCKET_BAD_BUFFER_SIZE"></a>

### `ERR_SOCKET_BAD_BUFFER_SIZE`

An invalid (negative) size was passed for either the `recvBufferSize` or `sendBufferSize` options in [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback).

<a id="ERR_SOCKET_BAD_PORT"></a>

<a id="ERR_SOCKET_BAD_PORT"></a>

### `ERR_SOCKET_BAD_PORT`

An API function expecting a port \>= 0 and \< 65536 received an invalid value.

<a id="ERR_SOCKET_BAD_TYPE"></a>

<a id="ERR_SOCKET_BAD_TYPE"></a>

### `ERR_SOCKET_BAD_TYPE`

An API function expecting a socket type (`udp4` or `udp6`) received an invalid value.

<a id="ERR_SOCKET_BUFFER_SIZE"></a>

<a id="ERR_SOCKET_BUFFER_SIZE"></a>

### `ERR_SOCKET_BUFFER_SIZE`

While using [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback), the size of the receive or send `Buffer` could not be determined.

<a id="ERR_SOCKET_CLOSED"></a>

<a id="ERR_SOCKET_CLOSED"></a>

### `ERR_SOCKET_CLOSED`

An attempt was made to operate on an already closed socket.

<a id="ERR_SOCKET_CLOSED_BEFORE_CONNECTION"></a>

<a id="ERR_SOCKET_CLOSED_BEFORE_CONNECTION"></a>

### `ERR_SOCKET_CLOSED_BEFORE_CONNECTION`

При вызове [`net.Socket.write()`](net.md#socketwritedata-encoding-callback) на подключающемся сокете сокет был закрыт до установления соединения.

<a id="ERR_SOCKET_DGRAM_IS_CONNECTED"></a>

<a id="ERR_SOCKET_CONNECTION_TIMEOUT"></a>

### `ERR_SOCKET_CONNECTION_TIMEOUT`

Сокет не смог подключиться ни к одному адресу из DNS за отведённое время при
автовыборе семейства адресов.

<a id="ERR_SOCKET_DGRAM_IS_CONNECTED"></a>

### `ERR_SOCKET_DGRAM_IS_CONNECTED`

A [`dgram.connect()`](dgram.md#socketconnectport-address-callback) call was made on an already connected socket.

<a id="ERR_SOCKET_DGRAM_NOT_CONNECTED"></a>

<a id="ERR_SOCKET_DGRAM_NOT_CONNECTED"></a>

### `ERR_SOCKET_DGRAM_NOT_CONNECTED`

A [`dgram.disconnect()`](dgram.md#socketdisconnect) or [`dgram.remoteAddress()`](dgram.md#socketremoteaddress) call was made on a disconnected socket.

<a id="ERR_SOCKET_DGRAM_NOT_RUNNING"></a>

<a id="ERR_SOCKET_DGRAM_NOT_RUNNING"></a>

### `ERR_SOCKET_DGRAM_NOT_RUNNING`

A call was made and the UDP subsystem was not running.

<a id="ERR_SRI_PARSE"></a>

<a id="ERR_SOURCE_MAP_CORRUPT"></a>

### `ERR_SOURCE_MAP_CORRUPT`

Карту исходников не удалось разобрать: файл отсутствует или повреждён.

<a id="ERR_SOURCE_MAP_MISSING_SOURCE"></a>

### `ERR_SOURCE_MAP_MISSING_SOURCE`

A file imported from a source map was not found.

<a id="ERR_SOURCE_PHASE_NOT_DEFINED"></a>

### `ERR_SOURCE_PHASE_NOT_DEFINED`

<!-- YAML
added: v24.0.0
-->

The provided module import does not provide a source phase imports representation for source phase
import syntax `import source x from 'x'` or `import.source(x)`.

<a id="ERR_SQLITE_ERROR"></a>

### `ERR_SQLITE_ERROR`

<!-- YAML
added: v22.5.0
-->

An error was returned from [SQLite][].

<a id="ERR_SRI_PARSE"></a>

### `ERR_SRI_PARSE`

A string was provided for a Subresource Integrity check, but was unable to be parsed. Check the format of integrity attributes by looking at the [Subresource Integrity specification](https://www.w3.org/TR/SRI/#the-integrity-attribute).

<a id="ERR_STREAM_ALREADY_FINISHED"></a>

<a id="ERR_STREAM_ALREADY_FINISHED"></a>

### `ERR_STREAM_ALREADY_FINISHED`

A stream method was called that cannot complete because the stream was finished.

<a id="ERR_STREAM_CANNOT_PIPE"></a>

<a id="ERR_STREAM_CANNOT_PIPE"></a>

### `ERR_STREAM_CANNOT_PIPE`

An attempt was made to call [`stream.pipe()`](stream.md#readablepipedestination-options) on a [`Writable`](stream.md#class-streamwritable) stream.

<a id="ERR_STREAM_DESTROYED"></a>

<a id="ERR_STREAM_DESTROYED"></a>

### `ERR_STREAM_DESTROYED`

A stream method was called that cannot complete because the stream was destroyed using `stream.destroy()`.

<a id="ERR_STREAM_NULL_VALUES"></a>

<a id="ERR_STREAM_ITER_MISSING_FLAG"></a>

### `ERR_STREAM_ITER_MISSING_FLAG`

A stream/iter API was used without the `--experimental-stream-iter` CLI flag
enabled.

<a id="ERR_STREAM_NULL_VALUES"></a>

### `ERR_STREAM_NULL_VALUES`

An attempt was made to call [`stream.write()`](stream.md#writablewritechunk-encoding-callback) with a `null` chunk.

<a id="ERR_STREAM_PREMATURE_CLOSE"></a>

<a id="ERR_STREAM_PREMATURE_CLOSE"></a>

### `ERR_STREAM_PREMATURE_CLOSE`

An error returned by `stream.finished()` and `stream.pipeline()`, when a stream or a pipeline ends non gracefully with no explicit error.

<a id="ERR_STREAM_PUSH_AFTER_EOF"></a>

<a id="ERR_STREAM_PUSH_AFTER_EOF"></a>

### `ERR_STREAM_PUSH_AFTER_EOF`

An attempt was made to call [`stream.push()`](stream.md#readablepushchunk-encoding) after a `null`(EOF) had been pushed to the stream.

<a id="ERR_STREAM_UNSHIFT_AFTER_END_EVENT"></a>

<a id="ERR_STREAM_UNABLE_TO_PIPE"></a>

### `ERR_STREAM_UNABLE_TO_PIPE`

An attempt was made to pipe to a closed or destroyed stream in a pipeline.

<a id="ERR_STREAM_UNSHIFT_AFTER_END_EVENT"></a>

### `ERR_STREAM_UNSHIFT_AFTER_END_EVENT`

An attempt was made to call [`stream.unshift()`](stream.md#readableunshiftchunk-encoding) after the `'end'` event was emitted.

<a id="ERR_STREAM_WRAP"></a>

<a id="ERR_STREAM_WRAP"></a>

### `ERR_STREAM_WRAP`

Prevents an abort if a string decoder was set on the Socket or if the decoder is in `objectMode`.

```js
const Socket = require('node:net').Socket;
const instance = new Socket();

instance.setEncoding('utf8');
```

<a id="ERR_STREAM_WRITE_AFTER_END"></a>

<a id="ERR_STREAM_WRITE_AFTER_END"></a>

### `ERR_STREAM_WRITE_AFTER_END`

An attempt was made to call [`stream.write()`](stream.md#writablewritechunk-encoding-callback) after `stream.end()` has been called.

<a id="ERR_STRING_TOO_LONG"></a>

<a id="ERR_STRING_TOO_LONG"></a>

### `ERR_STRING_TOO_LONG`

An attempt has been made to create a string longer than the maximum allowed length.

<a id="ERR_SYNTHETIC"></a>

<a id="ERR_SYNTHETIC"></a>

### `ERR_SYNTHETIC`

An artificial error object used to capture the call stack for diagnostic reports.

<a id="ERR_SYSTEM_ERROR"></a>

<a id="ERR_SYSTEM_ERROR"></a>

### `ERR_SYSTEM_ERROR`

An unspecified or non-specific system error has occurred within the Node.js process. The error object will have an `err.info` object property with additional details.

<a id="ERR_TAP_LEXER_ERROR"></a>

<a id="ERR_TEST_FAILURE"></a>

### `ERR_TEST_FAILURE`

Ошибка означает провал теста. Дополнительные сведения — в свойстве `cause`. Свойство `failureType` указывает, что делал тест при сбое.

<a id="ERR_TLS_CERT_ALTNAME_FORMAT"></a>

<a id="ERR_TLS_ALPN_CALLBACK_INVALID_RESULT"></a>

### `ERR_TLS_ALPN_CALLBACK_INVALID_RESULT`

This error is thrown when an `ALPNCallback` returns a value that is not in the
list of ALPN protocols offered by the client.

<a id="ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS"></a>

### `ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS`

This error is thrown when creating a `TLSServer` if the TLS options include
both `ALPNProtocols` and `ALPNCallback`. These options are mutually exclusive.

<a id="ERR_TLS_CERT_ALTNAME_FORMAT"></a>

### `ERR_TLS_CERT_ALTNAME_FORMAT`

This error is thrown by `checkServerIdentity` if a user-supplied `subjectaltname` property violates encoding rules. Certificate objects produced by Node.js itself always comply with encoding rules and will never cause this error.

<a id="ERR_TLS_CERT_ALTNAME_INVALID"></a>

<a id="ERR_TLS_CERT_ALTNAME_INVALID"></a>

### `ERR_TLS_CERT_ALTNAME_INVALID`

While using TLS, the host name/IP of the peer did not match any of the `subjectAltNames` in its certificate.

<a id="ERR_TLS_DH_PARAM_SIZE"></a>

<a id="ERR_TLS_DH_PARAM_SIZE"></a>

### `ERR_TLS_DH_PARAM_SIZE`

While using TLS, the parameter offered for the Diffie-Hellman (`DH`) key-agreement protocol is too small. By default, the key length must be greater than or equal to 1024 bits to avoid vulnerabilities, even though it is strongly recommended to use 2048 bits or larger for stronger security.

<a id="ERR_TLS_HANDSHAKE_TIMEOUT"></a>

<a id="ERR_TLS_HANDSHAKE_TIMEOUT"></a>

### `ERR_TLS_HANDSHAKE_TIMEOUT`

A TLS/SSL handshake timed out. In this case, the server must also abort the connection.

<a id="ERR_TLS_INVALID_CONTEXT"></a>

<a id="ERR_TLS_INVALID_CONTEXT"></a>

### `ERR_TLS_INVALID_CONTEXT`

<!-- YAML
added: v13.3.0
-->

Контекст должен быть `SecureContext`.

<a id="ERR_TLS_INVALID_PROTOCOL_METHOD"></a>

<a id="ERR_TLS_INVALID_PROTOCOL_METHOD"></a>

### `ERR_TLS_INVALID_PROTOCOL_METHOD`

Указанный метод `secureProtocol` недопустим: неизвестен или отключён как небезопасный.

<a id="ERR_TLS_INVALID_PROTOCOL_VERSION"></a>

<a id="ERR_TLS_INVALID_PROTOCOL_VERSION"></a>

### `ERR_TLS_INVALID_PROTOCOL_VERSION`

Valid TLS protocol versions are `'TLSv1'`, `'TLSv1.1'`, or `'TLSv1.2'`.

<a id="ERR_TLS_INVALID_STATE"></a>

<a id="ERR_TLS_INVALID_STATE"></a>

### `ERR_TLS_INVALID_STATE`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

TLS-сокет должен быть подключён и установлено безопасное соединение. Дождитесь события `secure` перед продолжением.

<a id="ERR_TLS_PROTOCOL_VERSION_CONFLICT"></a>

<a id="ERR_TLS_PROTOCOL_VERSION_CONFLICT"></a>

### `ERR_TLS_PROTOCOL_VERSION_CONFLICT`

Attempting to set a TLS protocol `minVersion` or `maxVersion` conflicts with an attempt to set the `secureProtocol` explicitly. Use one mechanism or the other.

<a id="ERR_TLS_PSK_SET_IDENTIY_HINT_FAILED"></a>

<a id="ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED"></a>

### `ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED`

Failed to set PSK identity hint. Hint may be too long.

<a id="ERR_TLS_RENEGOTIATION_DISABLED"></a>

### `ERR_TLS_RENEGOTIATION_DISABLED`

An attempt was made to renegotiate TLS on a socket instance with renegotiation disabled.

<a id="ERR_TLS_REQUIRED_SERVER_NAME"></a>

<a id="ERR_TLS_REQUIRED_SERVER_NAME"></a>

### `ERR_TLS_REQUIRED_SERVER_NAME`

While using TLS, the `server.addContext()` method was called without providing a host name in the first parameter.

<a id="ERR_TLS_SESSION_ATTACK"></a>

<a id="ERR_TLS_SESSION_ATTACK"></a>

### `ERR_TLS_SESSION_ATTACK`

An excessive amount of TLS renegotiations is detected, which is a potential vector for denial-of-service attacks.

<a id="ERR_TLS_SNI_FROM_SERVER"></a>

<a id="ERR_TLS_SNI_FROM_SERVER"></a>

### `ERR_TLS_SNI_FROM_SERVER`

An attempt was made to issue Server Name Indication from a TLS server-side socket, which is only valid from a client.

<a id="ERR_TRACE_EVENTS_CATEGORY_REQUIRED"></a>

<a id="ERR_TRACE_EVENTS_CATEGORY_REQUIRED"></a>

### `ERR_TRACE_EVENTS_CATEGORY_REQUIRED`

Метод `trace_events.createTracing()` требует хотя бы одну категорию трассировки.

<a id="ERR_TRACE_EVENTS_UNAVAILABLE"></a>

<a id="ERR_TRACE_EVENTS_UNAVAILABLE"></a>

### `ERR_TRACE_EVENTS_UNAVAILABLE`

Модуль `node:trace_events` не загружен: Node.js собран с флагом `--without-v8-platform`.

<a id="ERR_TRANSFORM_ALREADY_TRANSFORMING"></a>

<a id="ERR_TRAILING_JUNK_AFTER_STREAM_END"></a>

### `ERR_TRAILING_JUNK_AFTER_STREAM_END`

Trailing junk found after the end of the compressed stream.
This error is thrown when extra, unexpected data is detected
after the end of a compressed stream (for example, in zlib
or gzip decompression).

<a id="ERR_TRANSFORM_ALREADY_TRANSFORMING"></a>

### `ERR_TRANSFORM_ALREADY_TRANSFORMING`

A `Transform` stream finished while it was still transforming.

<a id="ERR_TRANSFORM_WITH_LENGTH_0"></a>

<a id="ERR_TRANSFORM_WITH_LENGTH_0"></a>

### `ERR_TRANSFORM_WITH_LENGTH_0`

A `Transform` stream finished with data still in the write buffer.

<a id="ERR_TTY_INIT_FAILED"></a>

<a id="ERR_TTY_INIT_FAILED"></a>

### `ERR_TTY_INIT_FAILED`

Инициализация TTY не удалась из‑за системной ошибки.

<a id="ERR_UNAVAILABLE_DURING_EXIT"></a>

<a id="ERR_UNAVAILABLE_DURING_EXIT"></a>

### `ERR_UNAVAILABLE_DURING_EXIT`

Function was called within a [`process.on('exit')`](process.md#event-exit) handler that shouldn’t be called within [`process.on('exit')`](process.md#event-exit) handler.

<a id="ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET"></a>

<a id="ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET"></a>

### `ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET`

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) was called twice, without first resetting the callback to `null`.

Эта ошибка предотвращает случайную перезапись колбэка, зарегистрированного другим модулем.

<a id="ERR_UNESCAPED_CHARACTERS"></a>

<a id="ERR_UNESCAPED_CHARACTERS"></a>

### `ERR_UNESCAPED_CHARACTERS`

A string that contained unescaped characters was received.

<a id="ERR_UNHANDLED_ERROR"></a>

<a id="ERR_UNHANDLED_ERROR"></a>

### `ERR_UNHANDLED_ERROR`

An unhandled error occurred (for instance, when an `'error'` event is emitted by an [`EventEmitter`](events.md#class-eventemitter) but an `'error'` handler is not registered).

<a id="ERR_UNKNOWN_BUILTIN_MODULE"></a>

<a id="ERR_UNKNOWN_BUILTIN_MODULE"></a>

### `ERR_UNKNOWN_BUILTIN_MODULE`

Used to identify a specific kind of internal Node.js error that should not typically be triggered by user code. Instances of this error point to an internal bug within the Node.js binary itself.

<a id="ERR_UNKNOWN_CREDENTIAL"></a>

<a id="ERR_UNKNOWN_CREDENTIAL"></a>

### `ERR_UNKNOWN_CREDENTIAL`

A Unix group or user identifier that does not exist was passed.

<a id="ERR_UNKNOWN_ENCODING"></a>

<a id="ERR_UNKNOWN_ENCODING"></a>

### `ERR_UNKNOWN_ENCODING`

An invalid or unknown encoding option was passed to an API.

<a id="ERR_UNKNOWN_FILE_EXTENSION"></a>

<a id="ERR_UNKNOWN_FILE_EXTENSION"></a>

### `ERR_UNKNOWN_FILE_EXTENSION`

> Stability: 1 - Experimental

An attempt was made to load a module with an unknown or unsupported file extension.

<a id="ERR_UNKNOWN_MODULE_FORMAT"></a>

<a id="ERR_UNKNOWN_MODULE_FORMAT"></a>

### `ERR_UNKNOWN_MODULE_FORMAT`

> Stability: 1 - Experimental

An attempt was made to load a module with an unknown or unsupported format.

<a id="ERR_UNKNOWN_SIGNAL"></a>

<a id="ERR_UNKNOWN_SIGNAL"></a>

### `ERR_UNKNOWN_SIGNAL`

An invalid or unknown process signal was passed to an API expecting a valid signal (such as [`subprocess.kill()`](child_process.md#subprocesskillsignal)).

<a id="ERR_UNSUPPORTED_DIR_IMPORT"></a>

<a id="ERR_UNSUPPORTED_DIR_IMPORT"></a>

### `ERR_UNSUPPORTED_DIR_IMPORT`

`import` a directory URL is unsupported. Instead, [self-reference a package using its name](packages.md#self-referencing-a-package-using-its-name) and [define a custom subpath](packages.md#subpath-exports) in the [`"exports"`](packages.md#exports) field of the [`package.json`](packages.md#nodejs-packagejson-field-definitions) file.

```js
import './'; // unsupported
import './index.js'; // supported
import 'package-name'; // supported
```

<a id="ERR_UNSUPPORTED_ESM_URL_SCHEME"></a>

<a id="ERR_UNSUPPORTED_ESM_URL_SCHEME"></a>

### `ERR_UNSUPPORTED_ESM_URL_SCHEME`

`import` with URL schemes other than `file` and `data` is unsupported.

<a id="ERR_USE_AFTER_CLOSE"></a>

<a id="ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING"></a>

### `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`

<!-- YAML
added: v22.6.0
-->

Type stripping is not supported for files descendent of a `node_modules` directory.

<a id="ERR_UNSUPPORTED_RESOLVE_REQUEST"></a>

### `ERR_UNSUPPORTED_RESOLVE_REQUEST`

An attempt was made to resolve an invalid module referrer. This can happen when
importing or calling `import.meta.resolve()` with either:

* a bare specifier that is not a builtin module from a module whose URL scheme
  is not `file`.
* a [relative URL][] from a module whose URL scheme is not a [special scheme][].

=== "MJS"

    ```js
    try {
      // Trying to import the package 'bare-specifier' from a `data:` URL module:
      await import('data:text/javascript,import "bare-specifier"');
    } catch (e) {
      console.log(e.code); // ERR_UNSUPPORTED_RESOLVE_REQUEST
    }
    ```

<a id="ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX"></a>

### `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

Указанный синтаксис TypeScript не поддерживается.
This could happen when using TypeScript syntax that requires
transformation with [type-stripping][].

<a id="ERR_USE_AFTER_CLOSE"></a>

### `ERR_USE_AFTER_CLOSE`

> Stability: 1 - Experimental

An attempt was made to use something that was already closed.

<a id="ERR_VALID_PERFORMANCE_ENTRY_TYPE"></a>

<a id="ERR_VALID_PERFORMANCE_ENTRY_TYPE"></a>

### `ERR_VALID_PERFORMANCE_ENTRY_TYPE`

While using the Performance Timing API (`perf_hooks`), no valid performance entry types are found.

<a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING"></a>

<a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING"></a>

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`

A dynamic import callback was not specified.

<a id="ERR_VM_MODULE_ALREADY_LINKED"></a>

<a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG"></a>

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG`

A dynamic import callback was invoked without `--experimental-vm-modules`.

<a id="ERR_VM_MODULE_ALREADY_LINKED"></a>

### `ERR_VM_MODULE_ALREADY_LINKED`

The module attempted to be linked is not eligible for linking, because of one of the following reasons:

-   It has already been linked (`linkingStatus` is `'linked'`)
-   It is being linked (`linkingStatus` is `'linking'`)
-   Linking has failed for this module (`linkingStatus` is `'errored'`)

<a id="ERR_VM_MODULE_CACHED_DATA_REJECTED"></a>

<a id="ERR_VM_MODULE_CACHED_DATA_REJECTED"></a>

### `ERR_VM_MODULE_CACHED_DATA_REJECTED`

The `cachedData` option passed to a module constructor is invalid.

<a id="ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA"></a>

<a id="ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA"></a>

### `ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA`

Cached data cannot be created for modules which have already been evaluated.

<a id="ERR_VM_MODULE_DIFFERENT_CONTEXT"></a>

<a id="ERR_VM_MODULE_DIFFERENT_CONTEXT"></a>

### `ERR_VM_MODULE_DIFFERENT_CONTEXT`

The module being returned from the linker function is from a different context than the parent module. Linked modules must share the same context.

<a id="ERR_VM_MODULE_LINK_FAILURE"></a>

<a id="ERR_VM_MODULE_LINK_FAILURE"></a>

### `ERR_VM_MODULE_LINK_FAILURE`

The module was unable to be linked due to a failure.

<a id="ERR_VM_MODULE_NOT_MODULE"></a>

<a id="ERR_VM_MODULE_NOT_MODULE"></a>

### `ERR_VM_MODULE_NOT_MODULE`

The fulfilled value of a linking promise is not a `vm.Module` object.

<a id="ERR_VM_MODULE_STATUS"></a>

<a id="ERR_VM_MODULE_STATUS"></a>

### `ERR_VM_MODULE_STATUS`

The current module’s status does not allow for this operation. The specific meaning of the error depends on the specific function.

<a id="ERR_WASI_ALREADY_STARTED"></a>

<a id="ERR_WASI_ALREADY_STARTED"></a>

### `ERR_WASI_ALREADY_STARTED`

Экземпляр WASI уже запущен.

<a id="ERR_WASI_NOT_STARTED"></a>

<a id="ERR_WASI_NOT_STARTED"></a>

### `ERR_WASI_NOT_STARTED`

Экземпляр WASI не был запущен.

<a id="ERR_WEBASSEMBLY_RESPONSE"></a>

<a id="ERR_WEBASSEMBLY_NOT_SUPPORTED"></a>

### `ERR_WEBASSEMBLY_NOT_SUPPORTED`

A feature requiring WebAssembly was used, but WebAssembly is not supported or
has been disabled in the current environment (for example, when running with
`--jitless`).

<a id="ERR_WEBASSEMBLY_RESPONSE"></a>

### `ERR_WEBASSEMBLY_RESPONSE`

<!-- YAML
added: v18.1.0
-->

`Response`, переданный в `WebAssembly.compileStreaming` или `WebAssembly.instantiateStreaming`, не является корректным ответом WebAssembly.

<a id="ERR_WORKER_INIT_FAILED"></a>

<a id="ERR_WORKER_INIT_FAILED"></a>

### `ERR_WORKER_INIT_FAILED`

Инициализация `Worker` не удалась.

<a id="ERR_WORKER_INVALID_EXEC_ARGV"></a>

<a id="ERR_WORKER_INVALID_EXEC_ARGV"></a>

### `ERR_WORKER_INVALID_EXEC_ARGV`

Опция `execArgv` в конструкторе `Worker` содержит недопустимые флаги.

<a id="ERR_WORKER_NOT_RUNNING"></a>

<a id="ERR_WORKER_MESSAGING_ERRORED"></a>

### `ERR_WORKER_MESSAGING_ERRORED`

<!-- YAML
added: v22.5.0
-->

> Stability: 1.1 - Active development

В потоке назначения произошла ошибка при обработке сообщения, отправленного через [`postMessageToThread()`][].

<a id="ERR_WORKER_MESSAGING_FAILED"></a>

### `ERR_WORKER_MESSAGING_FAILED`

<!-- YAML
added: v22.5.0
-->

> Stability: 1.1 - Active development

Поток, указанный в [`postMessageToThread()`][], недопустим или у него нет обработчика `workerMessage`.

<a id="ERR_WORKER_MESSAGING_SAME_THREAD"></a>

### `ERR_WORKER_MESSAGING_SAME_THREAD`

<!-- YAML
added: v22.5.0
-->

> Stability: 1.1 - Active development

Запрошенный в [`postMessageToThread()`][] идентификатор потока совпадает с текущим.

<a id="ERR_WORKER_MESSAGING_TIMEOUT"></a>

### `ERR_WORKER_MESSAGING_TIMEOUT`

<!-- YAML
added: v22.5.0
-->

> Stability: 1.1 - Active development

Sending a message via [`postMessageToThread()`][] timed out.

<a id="ERR_WORKER_NOT_RUNNING"></a>

### `ERR_WORKER_NOT_RUNNING`

An operation failed because the `Worker` instance is not currently running.

<a id="ERR_WORKER_OUT_OF_MEMORY"></a>

<a id="ERR_WORKER_OUT_OF_MEMORY"></a>

### `ERR_WORKER_OUT_OF_MEMORY`

Экземпляр `Worker` завершён из‑за достижения лимита памяти.

<a id="ERR_WORKER_PATH"></a>

<a id="ERR_WORKER_PATH"></a>

### `ERR_WORKER_PATH`

Путь к основному скрипту worker не является ни абсолютным, ни относительным с `./` или `../`.

<a id="ERR_WORKER_UNSERIALIZABLE_ERROR"></a>

<a id="ERR_WORKER_UNSERIALIZABLE_ERROR"></a>

### `ERR_WORKER_UNSERIALIZABLE_ERROR`

All attempts at serializing an uncaught exception from a worker thread failed.

<a id="ERR_WORKER_UNSUPPORTED_OPERATION"></a>

<a id="ERR_WORKER_UNSUPPORTED_OPERATION"></a>

### `ERR_WORKER_UNSUPPORTED_OPERATION`

Запрошенная возможность не поддерживается в потоках worker.

<a id="ERR_ZLIB_INITIALIZATION_FAILED"></a>

<a id="ERR_ZLIB_INITIALIZATION_FAILED"></a>

### `ERR_ZLIB_INITIALIZATION_FAILED`

Creation of a [`zlib`](zlib.md) object failed due to incorrect configuration.

<a id="HPE_HEADER_OVERFLOW"></a>

<a id="ERR_ZSTD_INVALID_PARAM"></a>

### `ERR_ZSTD_INVALID_PARAM`

An invalid parameter key was passed during construction of a Zstd stream.

<a id="HPE_CHUNK_EXTENSIONS_OVERFLOW"></a>

### `HPE_CHUNK_EXTENSIONS_OVERFLOW`

<!-- YAML
added:
 - v21.6.2
 - v20.11.1
 - v18.19.1
-->

Too much data was received for a chunk extensions. In order to protect against
malicious or malconfigured clients, if more than 16 KiB of data is received
then an `Error` with this code will be emitted.

<a id="HPE_HEADER_OVERFLOW"></a>

### `HPE_HEADER_OVERFLOW`

<!-- YAML
changes:
  - version:
     - v11.4.0
     - v10.15.0
    commit: 186035243fad247e3955f
    pr-url: https://github.com/nodejs-private/node-private/pull/143
    description: Max header size in `http_parser` was set to 8 KiB.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v11.4.0, v10.15.0 | Максимальный размер заголовка в http_parser был установлен на 8 КиБ. |

Too much HTTP header data was received. In order to protect against malicious or malconfigured clients, if more than 8 KiB of HTTP header data is received then HTTP parsing will abort without a request or response object being created, and an `Error` with this code will be emitted.

<a id="HPE_UNEXPECTED_CONTENT_LENGTH"></a>

<a id="HPE_UNEXPECTED_CONTENT_LENGTH"></a>

### `HPE_UNEXPECTED_CONTENT_LENGTH`

Server is sending both a `Content-Length` header and `Transfer-Encoding: chunked`.

`Transfer-Encoding: chunked` allows the server to maintain an HTTP persistent connection for dynamically generated content. In this case, the `Content-Length` HTTP header cannot be used.

Use `Content-Length` or `Transfer-Encoding: chunked`.

<a id="MODULE_NOT_FOUND"></a>

<a id="MODULE_NOT_FOUND"></a>

### `MODULE_NOT_FOUND`

<!-- YAML
changes:
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/25690
    description: Added `requireStack` property.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v12.0.0 | Добавлено свойство requireStack. |

A module file could not be resolved by the CommonJS modules loader while
attempting a [`require()`][] operation or when loading the program entry point.

## Устаревшие коды ошибок Node.js

> Стабильность: 0 — устарело. Эти коды либо непоследовательны, либо удалены.

<a id="ERR_CANNOT_TRANSFER_OBJECT"></a>

### `ERR_CANNOT_TRANSFER_OBJECT`

<!-- YAML
added: v10.5.0
removed: v12.5.0
-->

В `postMessage()` передан объект, перенос которого не поддерживается.

<a id="ERR_CPU_USAGE"></a>

### `ERR_CPU_USAGE`

<!-- YAML
removed: v15.0.0
-->

Не удалось обработать нативный вызов из `process.cpuUsage`.

<a id="ERR_CRYPTO_HASH_DIGEST_NO_UTF16"></a>

### `ERR_CRYPTO_HASH_DIGEST_NO_UTF16`

<!-- YAML
added: v9.0.0
removed: v12.12.0
-->

С [`hash.digest()`][] использована кодировка UTF-16. Хотя `hash.digest()` может
принимать аргумент `encoding` и возвращать строку вместо `Buffer`, кодировки UTF-16
(например `ucs` или `utf16le`) не поддерживаются.

<a id="ERR_CRYPTO_SCRYPT_INVALID_PARAMETER"></a>

### `ERR_CRYPTO_SCRYPT_INVALID_PARAMETER`

<!-- YAML
removed: v23.0.0
-->

An incompatible combination of options was passed to [`crypto.scrypt()`][] or
[`crypto.scryptSync()`][]. New versions of Node.js use the error code
[`ERR_INCOMPATIBLE_OPTION_PAIR`][] instead, which is consistent with other APIs.

<a id="ERR_FS_INVALID_SYMLINK_TYPE"></a>

### `ERR_FS_INVALID_SYMLINK_TYPE`

<!-- YAML
removed: v23.0.0
-->

An invalid symlink type was passed to the [`fs.symlink()`][] or
[`fs.symlinkSync()`][] methods.

<a id="ERR_HTTP2_FRAME_ERROR"></a>

### `ERR_HTTP2_FRAME_ERROR`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when a failure occurs sending an individual frame on the HTTP/2
session.

<a id="ERR_HTTP2_HEADERS_OBJECT"></a>

### `ERR_HTTP2_HEADERS_OBJECT`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when an HTTP/2 Headers Object is expected.

<a id="ERR_HTTP2_HEADER_REQUIRED"></a>

### `ERR_HTTP2_HEADER_REQUIRED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when a required header is missing in an HTTP/2 message.

<a id="ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND"></a>

### `ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

HTTP/2 informational headers must only be sent _prior_ to calling the
`Http2Stream.prototype.respond()` method.

<a id="ERR_HTTP2_STREAM_CLOSED"></a>

### `ERR_HTTP2_STREAM_CLOSED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when an action has been performed on an HTTP/2 Stream that has already
been closed.

<a id="ERR_HTTP_INVALID_CHAR"></a>

### `ERR_HTTP_INVALID_CHAR`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when an invalid character is found in an HTTP response status message
(reason phrase).

<a id="ERR_IMPORT_ASSERTION_TYPE_FAILED"></a>

### `ERR_IMPORT_ASSERTION_TYPE_FAILED`

<!-- YAML
added:
  - v17.1.0
  - v16.14.0
removed: v21.1.0
-->

An import assertion has failed, preventing the specified module to be imported.

<a id="ERR_IMPORT_ASSERTION_TYPE_MISSING"></a>

### `ERR_IMPORT_ASSERTION_TYPE_MISSING`

<!-- YAML
added:
  - v17.1.0
  - v16.14.0
removed: v21.1.0
-->

An import assertion is missing, preventing the specified module to be imported.

<a id="ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED"></a>

### `ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED`

<!-- YAML
added:
  - v17.1.0
  - v16.14.0
removed: v21.1.0
-->

Атрибут импорта не поддерживается этой версией Node.js.

<a id="ERR_INDEX_OUT_OF_RANGE"></a>

### `ERR_INDEX_OUT_OF_RANGE`

<!-- YAML
  added: v10.0.0
  removed: v11.0.0
-->

A given index was out of the accepted range (e.g. negative offsets).

<a id="ERR_INVALID_OPT_VALUE"></a>

### `ERR_INVALID_OPT_VALUE`

<!-- YAML
added: v8.0.0
removed: v15.0.0
-->

An invalid or unexpected value was passed in an options object.

<a id="ERR_INVALID_OPT_VALUE_ENCODING"></a>

### `ERR_INVALID_OPT_VALUE_ENCODING`

<!-- YAML
added: v9.0.0
removed: v15.0.0
-->

An invalid or unknown file encoding was passed.

<a id="ERR_INVALID_PERFORMANCE_MARK"></a>

### `ERR_INVALID_PERFORMANCE_MARK`

<!-- YAML
added: v8.5.0
removed: v16.7.0
-->

While using the Performance Timing API (`perf_hooks`), a performance mark is
invalid.

<a id="ERR_INVALID_TRANSFER_OBJECT"></a>

### `ERR_INVALID_TRANSFER_OBJECT`

<!-- YAML
removed: v21.0.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/47839
    description: A `DOMException` is thrown instead.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Вместо этого выдается исключение DOMException. |

An invalid transfer object was passed to `postMessage()`.

<a id="ERR_MANIFEST_ASSERT_INTEGRITY"></a>

### `ERR_MANIFEST_ASSERT_INTEGRITY`

<!-- YAML
removed: v22.2.0
-->

An attempt was made to load a resource, but the resource did not match the
integrity defined by the policy manifest. See the documentation for policy
manifests for more information.

<a id="ERR_MANIFEST_DEPENDENCY_MISSING"></a>

### `ERR_MANIFEST_DEPENDENCY_MISSING`

<!-- YAML
removed: v22.2.0
-->

An attempt was made to load a resource, but the resource was not listed as a
dependency from the location that attempted to load it. See the documentation
for policy manifests for more information.

<a id="ERR_MANIFEST_INTEGRITY_MISMATCH"></a>

### `ERR_MANIFEST_INTEGRITY_MISMATCH`

<!-- YAML
removed: v22.2.0
-->

An attempt was made to load a policy manifest, but the manifest had multiple
entries for a resource which did not match each other. Update the manifest
entries to match in order to resolve this error. See the documentation for
policy manifests for more information.

<a id="ERR_MANIFEST_INVALID_RESOURCE_FIELD"></a>

### `ERR_MANIFEST_INVALID_RESOURCE_FIELD`

<!-- YAML
removed: v22.2.0
-->

A policy manifest resource had an invalid value for one of its fields. Update
the manifest entry to match in order to resolve this error. See the
documentation for policy manifests for more information.

<a id="ERR_MANIFEST_INVALID_SPECIFIER"></a>

### `ERR_MANIFEST_INVALID_SPECIFIER`

<!-- YAML
removed: v22.2.0
-->

A policy manifest resource had an invalid value for one of its dependency
mappings. Update the manifest entry to match to resolve this error. See the
documentation for policy manifests for more information.

<a id="ERR_MANIFEST_PARSE_POLICY"></a>

### `ERR_MANIFEST_PARSE_POLICY`

<!-- YAML
removed: v22.2.0
-->

An attempt was made to load a policy manifest, but the manifest was unable to
be parsed. See the documentation for policy manifests for more information.

<a id="ERR_MANIFEST_TDZ"></a>

### `ERR_MANIFEST_TDZ`

<!-- YAML
removed: v22.2.0
-->

An attempt was made to read from a policy manifest, but the manifest
initialization has not yet taken place. This is likely a bug in Node.js.

<a id="ERR_MANIFEST_UNKNOWN_ONERROR"></a>

### `ERR_MANIFEST_UNKNOWN_ONERROR`

<!-- YAML
removed: v22.2.0
-->

A policy manifest was loaded, but had an unknown value for its "onerror"
behavior. See the documentation for policy manifests for more information.

<a id="ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST"></a>

### `ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`

<!-- YAML
removed: v15.0.0
-->

Этот код ошибки заменён на [`ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`][] в Node.js
15.0.0: старое название больше не отражает ситуацию, так как появились и другие
переносимые типы.

<a id="ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST"></a>

### `ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`

<!-- YAML
added: v15.0.0
removed: v21.0.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/47839
    description: A `DOMException` is thrown instead.
-->

Добавлено в: v15.0.0

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Вместо этого выдается исключение DOMException. |

An object that needs to be explicitly listed in the `transferList` argument
is in the object passed to a [`postMessage()`][] call, but is not provided
in the `transferList` for that call. Usually, this is a `MessagePort`.

In Node.js versions prior to v15.0.0, the error code being used here was
[`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`][]. However, the set of
transferable object types has been expanded to cover more types than
`MessagePort`.

<a id="ERR_NAPI_CONS_PROTOTYPE_OBJECT"></a>

### `ERR_NAPI_CONS_PROTOTYPE_OBJECT`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used by the `Node-API` when `Constructor.prototype` is not an object.

<a id="ERR_NAPI_TSFN_START_IDLE_LOOP"></a>

### `ERR_NAPI_TSFN_START_IDLE_LOOP`

<!-- YAML
added:
  - v10.6.0
  - v8.16.0
removed:
  - v14.2.0
  - v12.17.0
-->

On the main thread, values are removed from the queue associated with the
thread-safe function in an idle loop. This error indicates that an error
has occurred when attempting to start the loop.

<a id="ERR_NAPI_TSFN_STOP_IDLE_LOOP"></a>

### `ERR_NAPI_TSFN_STOP_IDLE_LOOP`

<!-- YAML
added:
  - v10.6.0
  - v8.16.0
removed:
  - v14.2.0
  - v12.17.0
-->

Once no more items are left in the queue, the idle loop must be suspended. This
error indicates that the idle loop has failed to stop.

<a id="ERR_NO_LONGER_SUPPORTED"></a>

### `ERR_NO_LONGER_SUPPORTED`

A Node.js API was called in an unsupported manner, such as
`Buffer.write(string, encoding, offset[, length])`.

<a id="ERR_OUTOFMEMORY"></a>

### `ERR_OUTOFMEMORY`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used generically to identify that an operation caused an out of memory
condition.

<a id="ERR_PARSE_HISTORY_DATA"></a>

### `ERR_PARSE_HISTORY_DATA`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Модулю `node:repl` не удалось разобрать данные из файла истории REPL.

<a id="ERR_SOCKET_CANNOT_SEND"></a>

### `ERR_SOCKET_CANNOT_SEND`

<!-- YAML
added: v9.0.0
removed: v14.0.0
-->

Data could not be sent on a socket.

<a id="ERR_STDERR_CLOSE"></a>

### `ERR_STDERR_CLOSE`

<!-- YAML
removed: v10.12.0
changes:
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/23053
    description: Rather than emitting an error, `process.stderr.end()` now
                 only closes the stream side but not the underlying resource,
                 making this error obsolete.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v10.12.0 | Вместо того, чтобы выдавать ошибку, `process.stderr.end()` теперь закрывает только сторону потока, но не базовый ресурс, что делает эту ошибку устаревшей. |

An attempt was made to close the `process.stderr` stream. By design, Node.js
does not allow `stdout` or `stderr` streams to be closed by user code.

<a id="ERR_STDOUT_CLOSE"></a>

### `ERR_STDOUT_CLOSE`

<!-- YAML
removed: v10.12.0
changes:
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/23053
    description: Rather than emitting an error, `process.stderr.end()` now
                 only closes the stream side but not the underlying resource,
                 making this error obsolete.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v10.12.0 | Вместо того, чтобы выдавать ошибку, `process.stderr.end()` теперь закрывает только сторону потока, но не базовый ресурс, что делает эту ошибку устаревшей. |

An attempt was made to close the `process.stdout` stream. By design, Node.js
does not allow `stdout` or `stderr` streams to be closed by user code.

<a id="ERR_STREAM_READ_NOT_IMPLEMENTED"></a>

### `ERR_STREAM_READ_NOT_IMPLEMENTED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when an attempt is made to use a readable stream that has not implemented
[`readable._read()`][].

<a id="ERR_TAP_LEXER_ERROR"></a>

### `ERR_TAP_LEXER_ERROR`

An error representing a failing lexer state.

<a id="ERR_TAP_PARSER_ERROR"></a>

### `ERR_TAP_PARSER_ERROR`

An error representing a failing parser state. Additional information about
the token causing the error is available via the `cause` property.

<a id="ERR_TAP_VALIDATION_ERROR"></a>

### `ERR_TAP_VALIDATION_ERROR`

Ошибка означает провал проверки TAP.

<a id="ERR_TLS_RENEGOTIATION_FAILED"></a>

### `ERR_TLS_RENEGOTIATION_FAILED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when a TLS renegotiation request has failed in a non-specific way.

<a id="ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER"></a>

### `ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER`

<!-- YAML
added: v10.5.0
removed: v14.0.0
-->

A `SharedArrayBuffer` whose memory is not managed by the JavaScript engine
or by Node.js was encountered during serialization. Such a `SharedArrayBuffer`
cannot be serialized.

Это возможно только если нативные аддоны создают `SharedArrayBuffer` в режиме
«externalized» или переводят существующий `SharedArrayBuffer` в этот режим.

<a id="ERR_UNKNOWN_STDIN_TYPE"></a>

### `ERR_UNKNOWN_STDIN_TYPE`

<!-- YAML
added: v8.0.0
removed: v11.7.0
-->

An attempt was made to launch a Node.js process with an unknown `stdin` file
type. This error is usually an indication of a bug within Node.js itself,
although it is possible for user code to trigger it.

<a id="ERR_UNKNOWN_STREAM_TYPE"></a>

### `ERR_UNKNOWN_STREAM_TYPE`

<!-- YAML
added: v8.0.0
removed: v11.7.0
-->

An attempt was made to launch a Node.js process with an unknown `stdout` or
`stderr` file type. This error is usually an indication of a bug within Node.js
itself, although it is possible for user code to trigger it.

<a id="ERR_V8BREAKITERATOR"></a>

### `ERR_V8BREAKITERATOR`

Использован API V8 `BreakIterator`, но полный набор данных ICU не установлен.

<a id="ERR_VALUE_OUT_OF_RANGE"></a>

### `ERR_VALUE_OUT_OF_RANGE`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when a given value is out of the accepted range.

<a id="ERR_VM_MODULE_LINKING_ERRORED"></a>

### `ERR_VM_MODULE_LINKING_ERRORED`

<!-- YAML
added: v10.0.0
removed:
  - v18.1.0
  - v16.17.0
-->

Функция связывания вернула модуль, для которого связывание не удалось.

<a id="ERR_VM_MODULE_NOT_LINKED"></a>

### `ERR_VM_MODULE_NOT_LINKED`

Модуль должен быть успешно связан до инстанцирования.

<a id="ERR_WORKER_UNSUPPORTED_EXTENSION"></a>

### `ERR_WORKER_UNSUPPORTED_EXTENSION`

<!-- YAML
added: v11.0.0
removed: v16.9.0
-->

Путь к основному скрипту worker имеет неизвестное расширение файла.

<a id="ERR_ZLIB_BINDING_CLOSED"></a>

### `ERR_ZLIB_BINDING_CLOSED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Used when an attempt is made to use a `zlib` object after it has already been
closed.

<a id="openssl-error-codes"></a>

## Коды ошибок OpenSSL

<a id="Time Validity Errors"></a>

### Ошибки срока действия

<a id="CERT_NOT_YET_VALID"></a>

#### `CERT_NOT_YET_VALID`

Сертификат ещё не действителен: дата notBefore позже текущего времени.

<a id="CERT_HAS_EXPIRED"></a>

#### `CERT_HAS_EXPIRED`

Срок действия сертификата истёк: дата notAfter раньше текущего времени.

<a id="CRL_NOT_YET_VALID"></a>

#### `CRL_NOT_YET_VALID`

Список отзыва сертификатов (CRL) имеет дату выпуска в будущем.

<a id="CRL_HAS_EXPIRED"></a>

#### `CRL_HAS_EXPIRED`

Срок действия списка отзыва сертификатов (CRL) истёк.

<a id="CERT_REVOKED"></a>

#### `CERT_REVOKED`

Сертификат отозван; он есть в списке отзыва (CRL).

<a id="Trust or Chain Related Errors"></a>

### Trust or Chain Related Errors

<a id="UNABLE_TO_GET_ISSUER_CERT"></a>

#### `UNABLE_TO_GET_ISSUER_CERT`

Сертификат издателя для найденного сертификата не найден. Обычно это значит, что
список доверенных сертификатов неполон.

<a id="UNABLE_TO_GET_ISSUER_CERT_LOCALLY"></a>

#### `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`

Издатель сертификата неизвестен. Так бывает, если издатель не входит в список
доверенных сертификатов.

<a id="DEPTH_ZERO_SELF_SIGNED_CERT"></a>

#### `DEPTH_ZERO_SELF_SIGNED_CERT`

Переданный сертификат самоподписанный, и тот же сертификат не найден в списке
доверенных сертификатов.

<a id="SELF_SIGNED_CERT_IN_CHAIN"></a>

#### `SELF_SIGNED_CERT_IN_CHAIN`

Издатель сертификата неизвестен. Так бывает, если издатель не входит в список
доверенных сертификатов.

<a id="CERT_CHAIN_TOO_LONG"></a>

#### `CERT_CHAIN_TOO_LONG`

Длина цепочки сертификатов больше максимальной глубины.

<a id="UNABLE_TO_GET_CRL"></a>

#### `UNABLE_TO_GET_CRL`

Не найдена ссылка на CRL из сертификата.

<a id="UNABLE_TO_VERIFY_LEAF_SIGNATURE"></a>

#### `UNABLE_TO_VERIFY_LEAF_SIGNATURE`

Подписи проверить нельзя: в цепочке только один сертификат, и он не
самоподписанный.

<a id="CERT_UNTRUSTED"></a>

#### `CERT_UNTRUSTED`

Корневой центр сертификации (CA) не помечен как доверенный для указанной цели.

<a id="Basic Extension Errors"></a>

### Basic Extension Errors

<a id="INVALID_CA"></a>

#### `INVALID_CA`

Сертификат CA недопустим: это не CA или расширения не соответствуют цели.

<a id="PATH_LENGTH_EXCEEDED"></a>

#### `PATH_LENGTH_EXCEEDED`

Превышен параметр pathlength в basicConstraints.

<a id="Name Related Errors"></a>

### Name Related Errors

<a id="HOSTNAME_MISMATCH"></a>

#### `HOSTNAME_MISMATCH`

Certificate does not match provided name.

<a id="Usage and Policy Errors"></a>

### Usage and Policy Errors

<a id="INVALID_PURPOSE"></a>

#### `INVALID_PURPOSE`

Предоставленный сертификат нельзя использовать для указанной цели.

<a id="CERT_REJECTED"></a>

#### `CERT_REJECTED`

Корневой CA помечен как отклоняющий указанную цель.

<a id="Formatting Errors"></a>

### Formatting Errors

<a id="CERT_SIGNATURE_FAILURE"></a>

#### `CERT_SIGNATURE_FAILURE`

Подпись сертификата недействительна.

<a id="CRL_SIGNATURE_FAILURE"></a>

#### `CRL_SIGNATURE_FAILURE`

Подпись списка отзыва сертификатов (CRL) недействительна.

<a id="ERROR_IN_CERT_NOT_BEFORE_FIELD"></a>

#### `ERROR_IN_CERT_NOT_BEFORE_FIELD`

The certificate notBefore field contains an invalid time.

<a id="ERROR_IN_CERT_NOT_AFTER_FIELD"></a>

#### `ERROR_IN_CERT_NOT_AFTER_FIELD`

The certificate notAfter field contains an invalid time.

<a id="ERROR_IN_CRL_LAST_UPDATE_FIELD"></a>

#### `ERROR_IN_CRL_LAST_UPDATE_FIELD`

The CRL lastUpdate field contains an invalid time.

<a id="ERROR_IN_CRL_NEXT_UPDATE_FIELD"></a>

#### `ERROR_IN_CRL_NEXT_UPDATE_FIELD`

The CRL nextUpdate field contains an invalid time.

<a id="UNABLE_TO_DECRYPT_CERT_SIGNATURE"></a>

#### `UNABLE_TO_DECRYPT_CERT_SIGNATURE`

The certificate signature could not be decrypted. This means that the actual
signature value could not be determined rather than it not matching the expected
value, this is only meaningful for RSA keys.

<a id="UNABLE_TO_DECRYPT_CRL_SIGNATURE"></a>

#### `UNABLE_TO_DECRYPT_CRL_SIGNATURE`

The certificate revocation list (CRL) signature could not be decrypted: this
means that the actual signature value could not be determined rather than it not
matching the expected value.

<a id="UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY"></a>

#### `UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY`

The public key in the certificate SubjectPublicKeyInfo could not be read.

<a id="Other OpenSSL Errors"></a>

### Other OpenSSL Errors

<a id="OUT_OF_MEM"></a>

#### `OUT_OF_MEM`

An error occurred trying to allocate memory. This should never happen.

[ES Module]: esm.md
[ICU]: intl.md#internationalization-support
[JSON Web Key Elliptic Curve Registry]: https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve
[JSON Web Key Types Registry]: https://www.iana.org/assignments/jose/jose.xhtml#web-key-types
[Native TypeScript support]: typescript.md#type-stripping
[Node.js error codes]: #nodejs-error-codes
[Permission Model]: permissions.md#permission-model
[RFC 7230 Section 3]: https://tools.ietf.org/html/rfc7230#section-3
[SQLite]: sqlite.md
[Subresource Integrity specification]: https://www.w3.org/TR/SRI/#the-integrity-attribute
[V8's stack trace API]: https://v8.dev/docs/stack-trace-api
[WHATWG Supported Encodings]: util.md#whatwg-supported-encodings
[WHATWG URL API]: url.md#the-whatwg-url-api
[`"exports"`]: packages.md#exports
[`"imports"`]: packages.md#imports
[`'uncaughtException'`]: process.md#event-uncaughtexception
[`--disable-proto=throw`]: cli.md#--disable-protomode
[`--force-fips`]: cli.md#--force-fips
[`--no-addons`]: cli.md#--no-addons
[`--unhandled-rejections`]: cli.md#--unhandled-rejectionsmode
[`Class: assert.AssertionError`]: assert.md#class-assertassertionerror
[`ERR_INCOMPATIBLE_OPTION_PAIR`]: #err_incompatible_option_pair
[`ERR_INVALID_ARG_TYPE`]: #err_invalid_arg_type
[`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`]: #err_missing_message_port_in_transfer_list
[`ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`]: #err_missing_transferable_in_transfer_list
[`ERR_REQUIRE_ASYNC_MODULE`]: #err_require_async_module
[`Error.isError`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError
[`EventEmitter`]: events.md#class-eventemitter
[`MessagePort`]: worker_threads.md#class-messageport
[`Object.getPrototypeOf`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
[`Object.setPrototypeOf`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
[`REPL`]: repl.md
[`ServerResponse`]: http.md#class-httpserverresponse
[`Writable`]: stream.md#class-streamwritable
[`child_process`]: child_process.md
[`cipher.getAuthTag()`]: crypto.md#ciphergetauthtag
[`crypto.getDiffieHellman()`]: crypto.md#cryptogetdiffiehellmangroupname
[`crypto.scrypt()`]: crypto.md#cryptoscryptpassword-salt-keylen-options-callback
[`crypto.scryptSync()`]: crypto.md#cryptoscryptsyncpassword-salt-keylen-options
[`crypto.timingSafeEqual()`]: crypto.md#cryptotimingsafeequala-b
[`dgram.connect()`]: dgram.md#socketconnectport-address-callback
[`dgram.createSocket()`]: dgram.md#dgramcreatesocketoptions-callback
[`dgram.disconnect()`]: dgram.md#socketdisconnect
[`dgram.remoteAddress()`]: dgram.md#socketremoteaddress
[`domException.name`]: https://developer.mozilla.org/en-US/docs/Web/API/DOMException/name
[`errno`(3) man page]: https://man7.org/linux/man-pages/man3/errno.3.html
[`error.code`]: #errorcode
[`error.message`]: #errormessage
[`fs.Dir`]: fs.md#class-fsdir
[`fs.cp()`]: fs.md#fscpsrc-dest-options-callback
[`fs.readFileSync`]: fs.md#fsreadfilesyncpath-options
[`fs.readdir`]: fs.md#fsreaddirpath-options-callback
[`fs.symlink()`]: fs.md#fssymlinktarget-path-type-callback
[`fs.symlinkSync()`]: fs.md#fssymlinksynctarget-path-type
[`fs.unlink`]: fs.md#fsunlinkpath-callback
[`fs`]: fs.md
[`hash.digest()`]: crypto.md#hashdigestencoding
[`hash.update()`]: crypto.md#hashupdatedata-inputencoding
[`http`]: http.md
[`https`]: https.md
[`libuv Error handling`]: https://docs.libuv.org/en/v1.x/errors.html
[`net.Socket.write()`]: net.md#socketwritedata-encoding-callback
[`net`]: net.md
[`new URL(input)`]: url.md#new-urlinput-base
[`new URLPattern(input)`]: url.md#new-urlpatternstring-baseurl-options
[`new URLSearchParams(iterable)`]: url.md#new-urlsearchparamsiterable
[`package.json`]: packages.md#nodejs-packagejson-field-definitions
[`postMessage()`]: worker_threads.md#portpostmessagevalue-transferlist
[`postMessageToThread()`]: worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout
[`process.on('exit')`]: process.md#event-exit
[`process.send()`]: process.md#processsendmessage-sendhandle-options-callback
[`process.setUncaughtExceptionCaptureCallback()`]: process.md#processsetuncaughtexceptioncapturecallbackfn
[`readable._read()`]: stream.md#readable_readsize
[`require('node:crypto').setEngine()`]: crypto.md#cryptosetengineengine-flags
[`require()`]: modules.md#requireid
[`server.close()`]: net.md#serverclosecallback
[`server.listen()`]: net.md#serverlisten
[`sign.sign()`]: crypto.md#signsignprivatekey-outputencoding
[`stream.pipe()`]: stream.md#readablepipedestination-options
[`stream.push()`]: stream.md#readablepushchunk-encoding
[`stream.unshift()`]: stream.md#readableunshiftchunk-encoding
[`stream.write()`]: stream.md#writablewritechunk-encoding-callback
[`subprocess.kill()`]: child_process.md#subprocesskillsignal
[`subprocess.send()`]: child_process.md#subprocesssendmessage-sendhandle-options-callback
[`url.parse()`]: url.md#urlparseurlstring-parsequerystring-slashesdenotehost
[`util.getSystemErrorName(error.errno)`]: util.md#utilgetsystemerrornameerr
[`util.inspect()`]: util.md#utilinspectobject-options
[`util.parseArgs()`]: util.md#utilparseargsconfig
[`v8.startupSnapshot.setDeserializeMainFunction()`]: v8.md#v8startupsnapshotsetdeserializemainfunctioncallback-data
[`zlib`]: zlib.md
[crypto digest algorithm]: crypto.md#cryptogethashes
[debugger]: debugger.md
[define a custom subpath]: packages.md#subpath-exports
[domains]: domain.md
[event emitter-based]: events.md#class-eventemitter
[file descriptors]: https://en.wikipedia.org/wiki/File_descriptor
[relative URL]: https://url.spec.whatwg.org/#relative-url-string
[self-reference a package using its name]: packages.md#self-referencing-a-package-using-its-name
[special scheme]: https://url.spec.whatwg.org/#special-scheme
[stream-based]: stream.md
[syscall]: https://man7.org/linux/man-pages/man2/syscalls.2.html
[try-catch]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch
[type-stripping]: typescript.md#type-stripping
[vm]: vm.md
