---
title: Ошибки
description: Классы и коды ошибок Node.js, распространение и перехват исключений, системные и пользовательские ошибки
---

# Ошибки

Приложения в Node.js обычно сталкиваются со следующими категориями ошибок:

-   стандартные ошибки JavaScript, такие как [EvalError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/EvalError), [SyntaxError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SyntaxError), [RangeError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/RangeError), [ReferenceError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ReferenceError), [TypeError](errors.md#class-typeerror) и [URIError](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/URIError);
-   стандартные `DOMException`;
-   системные ошибки из‑за ограничений операционной системы, например попытка открыть несуществующий файл или отправить данные через закрытый сокет;
-   `AssertionError` — особый класс ошибок, когда Node.js обнаруживает нарушение логики, которого не должно происходить; обычно их вызывает модуль `node:assert`;
-   пользовательские ошибки, задаваемые кодом приложения.

Все ошибки JavaScript и системные ошибки, порождённые Node.js, наследуют или являются экземплярами стандартного класса JavaScript [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) и гарантированно предоставляют _как минимум_ свойства, доступные у этого класса.

Свойство [`error.message`](#errormessage) у ошибок Node.js может меняться в любых версиях. Для идентификации ошибки используйте [`error.code`](#errorcode). Для `DOMException` тип определяйте по [`domException.name`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException/name).

## Распространение и перехват ошибок

Node.js поддерживает несколько способов распространения и обработки ошибок во время работы приложения. То, как ошибки сообщаются и обрабатываются, полностью зависит от типа `Error` и стиля вызываемого API.

Ошибки JavaScript обрабатываются как исключения: они _немедленно_ создаются и выбрасываются стандартным механизмом `throw`. Их перехватывают конструкцией [`try…catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch), которую предоставляет язык JavaScript.

```js
// Throws with a ReferenceError because z is not defined.
try {
    const m = 1;
    const n = m + z;
} catch (err) {
    // Handle the error here.
}
```

Любое использование механизма `throw` в JavaScript порождает исключение, которое _обязано_ быть обработано, иначе процесс Node.js завершится немедленно.

За редким исключением _синхронные_ API (любой блокирующий метод, который не возвращает [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) и не принимает функцию `callback`, например [`fs.readFileSync`](fs.md#fsreadfilesyncpath-options)), сообщают об ошибках через `throw`.

Ошибки в _асинхронных_ API могут сообщаться по-разному:

-   Некоторые асинхронные методы возвращают [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise); учитывайте, что промис может быть отклонён. См. флаг [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode), чтобы понять, как процесс реагирует на необработанное отклонение промиса.

    ```js
    const fs = require('node:fs/promises');

    (async () => {
        let data;
        try {
            data = await fs.readFile(
                'a file that does not exist'
            );
        } catch (err) {
            console.error(
                'There was an error reading the file!',
                err
            );
            return;
        }
        // Otherwise handle the data
    })();
    ```

-   У большинства асинхронных методов с функцией `callback` первым аргументом передаётся объект `Error`. Если первый аргумент не `null` и является экземпляром `Error`, произошла ошибка, которую нужно обработать.

    ```js
    const fs = require('node:fs');
    fs.readFile(
        'a file that does not exist',
        (err, data) => {
            if (err) {
                console.error(
                    'There was an error reading the file!',
                    err
                );
                return;
            }
            // Otherwise handle the data
        }
    );
    ```

-   Если асинхронный метод вызывается у объекта [`EventEmitter`](events.md#class-eventemitter), ошибки могут направляться в событие `'error'` этого объекта.

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

-   Несколько методов API Node.js, которые обычно асинхронны, всё же могут использовать `throw` для исключений, которые нужно перехватывать через `try…catch`. Полного списка таких методов нет; смотрите документацию каждого метода для выбора подходящего способа обработки ошибок.

Механизм события `'error'` чаще всего используется в [потоковых](stream.md) и [событийных](events.md#class-eventemitter) API, которые представляют серию асинхронных операций во времени (в отличие от одной операции, которая может завершиться успехом или неудачей).

Для _всех_ объектов [`EventEmitter`](events.md#class-eventemitter), если обработчик `'error'` не задан, ошибка будет выброшена: процесс Node.js сообщит о необработанном исключении и завершится, если только не зарегистрирован обработчик события [`'uncaughtException'`](process.md#event-uncaughtexception) или не используется устаревший модуль [`node:domain`](domain.md).

```js
const EventEmitter = require('node:events');
const ee = new EventEmitter();

setImmediate(() => {
    // This will crash the process because no 'error' event
    // handler has been added.
    ee.emit('error', new Error('This will crash'));
});
```

Ошибки, возникающие таким образом, _нельзя_ перехватить через `try…catch`, потому что они выбрасываются _после_ того, как вызывающий код уже завершился.

Смотрите документацию каждого метода, чтобы понять, как именно распространяются ошибки.

## Класс: `Error`

Обобщённый объект JavaScript [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), не указывающий конкретную причину ошибки. Объекты `Error` содержат «трассировку стека» — место в коде, где создан `Error`, и могут включать текстовое описание.

Все ошибки Node.js, включая системные и ошибки JavaScript, являются экземплярами `Error` или наследуются от него.

### `new Error(message[, options])`

-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cause` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) ошибка, послужившая причиной новой ошибки.

Создаёт объект `Error` и задаёт свойство `error.message` переданным текстом. Если в `message` передан объект, текст получают вызовом `String(message)`. При наличии опции `cause` она попадает в `error.cause`. Свойство `error.stack` отражает место вызова `new Error()`. Трассировки зависят от [API трассировки стека V8](https://v8.dev/docs/stack-trace-api). Охват стека ограничен либо (a) началом _синхронного_ выполнения кода, либо (b) числом кадров из `Error.stackTraceLimit` — в зависимости от того, что меньше.

### `Error.captureStackTrace(targetObject[, constructorOpt])`

-   `targetObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `constructorOpt` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Создаёт на `targetObject` свойство `.stack`; при обращении к нему возвращается строка с местом в коде, где вызван `Error.captureStackTrace()`.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack; // Similar to `new Error().stack`
```

Первая строка трассировки будет с префиксом `${myObject.name}: ${myObject.message}`.

Необязательный аргумент `constructorOpt` — функция. Если задан, из трассировки исключаются все кадры выше `constructorOpt`, включая сам `constructorOpt`.

Аргумент `constructorOpt` удобен, чтобы скрыть детали реализации генерации ошибок от пользователя. Пример:

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

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `Error.stackTraceLimit` задаёт число кадров стека, собираемых в трассировку (и для `new Error().stack`, и для `Error.captureStackTrace(obj)`).

По умолчанию `10`, но можно задать любое допустимое число в JavaScript. Изменения влияют на трассировки, захваченные _после_ смены значения.

Если задать не число или отрицательное число, кадры в трассировку не попадут.

### `error.cause`

-   Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Если задано, `error.cause` — исходная причина `Error`. Используется при перехвате ошибки и выбросе новой с другим сообщением или кодом, чтобы сохранить доступ к первоначальной ошибке.

Обычно `error.cause` задаётся вызовом `new Error(message, { cause })`. Конструктор не задаёт его, если опция `cause` не передана.

Свойство позволяет связывать ошибки в цепочку. При сериализации объектов `Error` [`util.inspect()`](util.md#utilinspectobject-options) рекурсивно обрабатывает `error.cause`, если оно есть.

```js
const cause = new Error(
    'The remote HTTP server responded with a 500 status'
);
const symptom = new Error('The message failed to send', {
    cause,
});

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

### `error.code` {#errorcode}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.code` — строковая метка вида ошибки. Это самый стабильный способ идентификации: оно меняется только между мажорными версиями Node.js. Строки `error.message`, напротив, могут меняться в любых версиях. Подробности по кодам — в разделе [кодов ошибок Node.js](#nodejs-error-codes).

### `error.message` {#errormessage}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.message` — текстовое описание, задаваемое вызовом `new Error(message)`. `message` из конструктора также попадает в первую строку трассировки `Error`, но изменение этого свойства после создания объекта _может не_ изменить первую строку трассировки (например, если `error.stack` уже прочитали до смены свойства).

```js
const err = new Error('The message');
console.error(err.message);
// Prints: The message
```

### `error.stack`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.stack` — строка с описанием места в коде, где создан `Error`.

```console
Error: Things keep happening!
   at /home/gbusey/file.js:525:2
   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)
   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)
   at increaseSynergy (/home/gbusey/actors.js:701:6)
```

Первая строка имеет вид `<имя класса ошибки>: <сообщение>`, далее идут кадры стека (каждая строка начинается с «at »). Каждый кадр — место вызова в коде, приведшее к ошибке. V8 старается показать имя функции (по имени переменной, объявлению функции или методу объекта), но иногда подходящего имени нет: тогда для кадра выводится только расположение. Иначе выводится имя функции и в скобках — расположение.

Кадры строятся только для функций JavaScript. Если, например, выполнение синхронно проходит через функцию аддона на C++ `cheetahify`, которая затем вызывает функцию JavaScript, кадра для вызова `cheetahify` в трассировке не будет:

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

-   `native` — внутренний вызов V8 (как у `[].forEach`);
-   `plain-filename.js:строка:столбец` — вызов внутри Node.js;
-   `/absolute/path/to/file.js:строка:столбец` — вызов в пользовательской программе (CommonJS) или зависимостях;
-   `<transport-protocol>:///url/to/module/file.mjs:строка:столбец` — вызов в пользовательской программе (ESM) или зависимостях.

Число кадров в трассировке ограничено меньшим из двух: `Error.stackTraceLimit` и числа доступных кадров на текущем тике цикла событий.

`error.stack` — геттер/сеттер для внутреннего скрытого свойства, которое есть только у встроенных объектов `Error` (для которых [`Error.isError`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/isError) возвращает `true`). Если `error` не встроенный объект ошибки, геттер `error.stack` всегда возвращает `undefined`, сеттер ничего не делает. Так бывает, если аксессор вызывают вручную с `this`, не являющимся встроенной ошибкой, например с [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy).

## Класс: `AssertionError`

-   Наследует: [`<errors.Error>`](errors.md#error)

Означает сбой проверки утверждения. Подробнее см. [`Class: assert.AssertionError`](assert.md#class-assertassertionerror).

## Класс: `RangeError`

-   Наследует: [`<errors.Error>`](errors.md#error)

Указывает, что переданный аргумент вне допустимого набора или диапазона значений функции — будь то числовой диапазон или набор допустимых вариантов параметра.

```js
require('node:net').connect(-1);
// Throws "RangeError: "port" option should be >= 0 and < 65536: -1"
```

Node.js создаёт и выбрасывает `RangeError` _сразу_ как часть проверки аргументов.

## Класс: `ReferenceError`

-   Наследует: [`<errors.Error>`](errors.md#error)

Указывает на обращение к необъявленной переменной. Часто это опечатки или иная поломка программы.

Прикладной код теоретически может порождать такие ошибки, но на практике их выдаёт только V8.

```js
doesNotExist;
// Throws ReferenceError, doesNotExist is not a variable in this program.
```

Если приложение не генерирует и не выполняет код динамически, экземпляры `ReferenceError` указывают на ошибку в коде или зависимостях.

## Класс: `SyntaxError`

-   Наследует: [`<errors.Error>`](errors.md#error)

Указывает, что программа не является допустимым JavaScript. Такие ошибки возникают и распространяются только при вычислении кода — через `eval`, `Function`, `require` или [vm](vm.md). Почти всегда это признак поломанной программы.

```js
try {
    require('node:vm').runInThisContext('binary ! isNotOk');
} catch (err) {
    // 'err' will be a SyntaxError.
}
```

Экземпляры `SyntaxError` в контексте, где они созданы, не исправить — их может перехватить только другой контекст.

## Класс: `SystemError`

-   Наследует: [`<errors.Error>`](errors.md#error)

Node.js порождает системные ошибки при исключениях в среде выполнения. Обычно это нарушение ограничений ОС, например попытка прочитать несуществующий файл.

-   `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано — адрес, при соединении с которым произошёл сбой
-   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) строковый код ошибки
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано — путь назначения при ошибке файловой системы
-   `errno` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) номер ошибки, предоставленный системой
-   `info` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) если задано — дополнительные сведения об условии ошибки
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) человекочитаемое описание от системы
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано — путь к файлу при ошибке файловой системы
-   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) если задано — сетевой порт, который недоступен
-   `syscall` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя системного вызова, вызвавшего ошибку

### `error.address`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если задано, `error.address` — адрес, при соединении с которым произошёл сбой.

### `error.code` {#systemerror-errorcode}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.code` — строковое представление кода ошибки.

### `error.dest`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если задано, `error.dest` — путь назначения при ошибке файловой системы.

### `error.errno`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `error.errno` — отрицательное число, соответствующее коду в [`обработке ошибок libuv`](https://docs.libuv.org/en/v1.x/errors.html).

В Windows номер ошибки от системы нормализуется libuv.

Строковое имя кода получают через [`util.getSystemErrorName(error.errno)`](util.md#utilgetsystemerrornameerr).

### `error.info`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Если задано, `error.info` — объект с подробностями об условии ошибки.

### `error.message` {#systemerror-errormessage}

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

`error.message` — человекочитаемое описание от системы.

### `error.path`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если задано, `error.path` — недопустимый или релевантный путь.

### `error.port`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Если задано, `error.port` — сетевой порт, который недоступен.

### `error.syscall`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.syscall` описывает [syscall](https://man7.org/linux/man-pages/man2/syscalls.2.html), завершившийся ошибкой.

### Типичные системные ошибки

Ниже перечислены ошибки, часто встречающиеся в программах Node.js. Полный список см. на странице [страницы руководства `errno`(3)](https://man7.org/linux/man-pages/man3/errno.3.html).

-   `EACCES` (доступ запрещён): попытка доступа к файлу способом, запрещённым правами.

-   `EADDRINUSE` (адрес уже используется): не удалось привязать сервер ([`net`](net.md), [`http`](http.md) или [`https`](https.md)) к локальному адресу — его уже занимает другой сервер на этой машине.

-   `ECONNREFUSED` (в соединении отказано): соединение отклонено — целевая машина активно отказала. Обычно сервис на удалённом хосте не слушает порт.

-   `ECONNRESET` (соединение сброшено удалённой стороной): соединение разорвано удалённой стороной, часто из‑за таймаута или перезагрузки. Типично в модулях [`http`](http.md) и [`net`](net.md).

-   `EEXIST` (файл уже существует): целью операции был существующий файл, тогда как требовалось, чтобы файла не было.

-   `EISDIR` (это каталог): ожидался файл, а по указанному пути — каталог.

-   `EMFILE` (слишком много открытых файлов в системе): достигнут предел [дескрипторов файлов](https://en.wikipedia.org/wiki/File_descriptor) в системе; новый дескриптор недоступен, пока не закроют хотя бы один. Часто при массовом открытии файлов, особенно на macOS с низким лимитом. Повысить лимит: `ulimit -n 2048` в той же оболочке, где запускают Node.js.

-   `ENOENT` (нет такого файла или каталога): часто от операций [`fs`](fs.md) — компонент пути не существует; по указанному пути не найден ни файл, ни каталог.

-   `ENOTDIR` (не каталог): компонент пути существует, но это не каталог, как ожидалось. Часто от [`fs.readdir`](fs.md#fsreaddirpath-options-callback).

-   `ENOTEMPTY` (каталог не пуст): каталог не пуст, а операция требует пустого каталога; обычно связано с [`fs.unlink`](fs.md#fsunlinkpath-callback).

-   `ENOTFOUND` (ошибка DNS-поиска): сбой DNS (`EAI_NODATA` или `EAI_NONAME`). Не стандартная ошибка POSIX.

-   `EPERM` (операция не разрешена): операция требует повышенных привилегий.

-   `EPIPE` (разорванный канал): запись в pipe, сокет или FIFO, когда читателя нет. Часто на уровнях [`net`](net.md) и [`http`](http.md) — удалённая сторона потока закрыла соединение.

-   `ETIMEDOUT` (время операции истекло): таймаут connect/send — удалённая сторона не ответила вовремя. Обычно в [`http`](http.md) или [`net`](net.md). Часто признак того, что `socket.end()` не вызвали.

## Класс: `TypeError`

-   Наследует: [`<errors.Error>`](errors.md#error)

Указывает, что аргумент имеет недопустимый тип, например функция передана туда, где ожидается строка.

```js
require('node:url').parse(() => {});
// Throws TypeError, since it expected a string.
```

Node.js создаёт и выбрасывает `TypeError` _сразу_ как часть проверки типов аргументов.

## Исключения и ошибки

Исключение JavaScript — значение, выброшенное из‑за недопустимой операции или явным `throw`. Не обязательно, чтобы это были экземпляры `Error` или наследники, но все исключения, которые выбрасывают Node.js или движок JavaScript, _будут_ экземплярами `Error`.

Некоторые исключения на уровне JavaScript _невосстановимы_: такие исключения _всегда_ завершают процесс Node.js. Примеры: проверки `assert()` или вызовы `abort()` в слое C++.

## Ошибки OpenSSL

Ошибки из `crypto` или `tls` относятся к классу `Error`; помимо стандартных `.code` и `.message` могут быть дополнительные поля, специфичные для OpenSSL.

### `error.opensslErrorStack`

Массив ошибок, уточняющих место в библиотеке OpenSSL, где возникла ошибка.

### `error.function`

Функция OpenSSL, в которой возникла ошибка.

### `error.library`

Библиотека OpenSSL, в которой возникла ошибка.

### `error.reason`

Человекочитаемое описание причины ошибки.

## Коды ошибок Node.js {#nodejs-error-codes}

### `ABORT_ERR` {#ABORT_ERR}

Используется, когда операция была прервана (обычно с помощью `AbortController`).

API, _не_ использующие `AbortSignal`, обычно не выдают ошибку с этим кодом.

Этот код не использует обычное соглашение `ERR_*`, которое используется в ошибках Node.js, чтобы быть совместимым с `AbortError` веб-платформы.

### `ERR_ACCESS_DENIED` {#ERR_ACCESS_DENIED}

Специальный тип ошибки, возникающий всякий раз, когда Node.js пытается получить доступ к ресурсу, ограниченному [моделью разрешений](permissions.md#permission-model).

### `ERR_AMBIGUOUS_ARGUMENT` {#ERR_AMBIGUOUS_ARGUMENT}

Аргумент функции используется таким образом, что подпись функции может быть неправильно понята. Модуль `node:assert` выбрасывает это сообщение, когда параметр `message` в `assert.throws(block, message)` совпадает с сообщением об ошибке, выброшенным `block`, поскольку такое использование предполагает, что пользователь считает `message` ожидаемым сообщением, а не сообщением, которое отобразит `AssertionError`, если `block` не выбросит сообщение.

### `ERR_ARG_NOT_ITERABLE` {#ERR_ARG_NOT_ITERABLE}

Требовался итерируемый аргумент (то есть значение, работающее с циклами `for...of`), но API Node.js его не получил.

### `ERR_ASSERTION` {#ERR_ASSERTION}

Специальный тип ошибки, который может быть вызван всякий раз, когда Node.js обнаруживает исключительное нарушение логики, которое никогда не должно происходить. Обычно их вызывает модуль `node:assert`.

### `ERR_ASYNC_CALLBACK` {#ERR_ASYNC_CALLBACK}

Была предпринята попытка зарегистрировать что-то, что не является функцией, в качестве обратного вызова `AsyncHooks`.

### `ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED` {#ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED}

Операция, связанная с загрузкой модулей, переопределена асинхронным хуком загрузчика, который не завершил промис до выхода потока загрузчика.

### `ERR_ASYNC_TYPE` {#ERR_ASYNC_TYPE}

Тип асинхронного ресурса был неверным. Пользователи также могут определять собственные типы при использовании общедоступного API встраивания.

### `ERR_BROTLI_COMPRESSION_FAILED` {#ERR_BROTLI_COMPRESSION_FAILED}

Данные, переданные в поток Brotli, не были успешно сжаты.

### `ERR_BROTLI_INVALID_PARAM` {#ERR_BROTLI_INVALID_PARAM}

При построении потока Brotli был передан недопустимый ключ параметра.

### `ERR_BUFFER_CONTEXT_NOT_AVAILABLE` {#ERR_BUFFER_CONTEXT_NOT_AVAILABLE}

Была предпринята попытка создать экземпляр Node.js `Buffer` из кода аддона или встраивающего окружения, находясь в контексте JS-движка, который не связан с экземпляром Node.js. Данные, переданные в метод `Buffer`, будут освобождены к моменту возврата метода.

При возникновении этой ошибки возможной альтернативой созданию экземпляра `Buffer` является создание обычного `Uint8Array`, который отличается только прототипом получаемого объекта. `Uint8Array` общеприняты во всех основных API Node.js, где есть `Buffer`; они доступны во всех контекстах.

### `ERR_BUFFER_OUT_OF_BOUNDS` {#ERR_BUFFER_OUT_OF_BOUNDS}

Была предпринята попытка выполнить операцию, выходящую за пределы `Buffer`.

### `ERR_BUFFER_TOO_LARGE` {#ERR_BUFFER_TOO_LARGE}

Была предпринята попытка создать `Буфер` большего размера, чем максимально допустимый.

### `ERR_CANNOT_WATCH_SIGINT` {#ERR_CANNOT_WATCH_SIGINT}

Node.js не смог проследить за сигналом `SIGINT`.

### `ERR_CHILD_CLOSED_BEFORE_REPLY` {#ERR_CHILD_CLOSED_BEFORE_REPLY}

Дочерний процесс был закрыт до того, как родительский процесс получил ответ.

### `ERR_CHILD_PROCESS_IPC_REQUIRED` {#ERR_CHILD_PROCESS_IPC_REQUIRED}

Используется, когда дочерний процесс форкируется без указания IPC-канала.

### `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` {#ERR_CHILD_PROCESS_STDIO_MAXBUFFER}

Используется, когда основной процесс пытается прочитать данные из STDERR/STDOUT дочернего процесса, и длина данных превышает параметр `maxBuffer`.

### `ERR_CLOSED_MESSAGE_PORT` {#ERR_CLOSED_MESSAGE_PORT}

Добавлено в: v10.5.0

Была попытка использовать экземпляр `MessagePort` в закрытом состоянии, обычно после вызова `.close()`.

### `ERR_CONSOLE_WRITABLE_STREAM` {#ERR_CONSOLE_WRITABLE_STREAM}

`Console` была создана без потока `stdout`, или `Console` имеет незаписываемый поток `stdout` или `stderr`.

### `ERR_CONSTRUCT_CALL_INVALID` {#ERR_CONSTRUCT_CALL_INVALID}

Был вызван конструктор класса, который не является вызываемым.

### `ERR_CONSTRUCT_CALL_REQUIRED` {#ERR_CONSTRUCT_CALL_REQUIRED}

Конструктор для класса был вызван без `new`.

### `ERR_CONTEXT_NOT_INITIALIZED` {#ERR_CONTEXT_NOT_INITIALIZED}

Контекст vm, переданный в API, еще не инициализирован. Это может произойти, если во время создания контекста произошла (и была поймана) ошибка, например, если при создании контекста произошел сбой выделения или был достигнут максимальный размер стека вызовов.

### `ERR_CPU_PROFILE_ALREADY_STARTED` {#ERR_CPU_PROFILE_ALREADY_STARTED}

Профиль CPU с указанным именем уже запущен.

### `ERR_CPU_PROFILE_NOT_STARTED` {#ERR_CPU_PROFILE_NOT_STARTED}

Профиль CPU с указанным именем не запущен.

### `ERR_CPU_PROFILE_TOO_MANY` {#ERR_CPU_PROFILE_TOO_MANY}

Собирается слишком много профилей CPU.

### `ERR_CRYPTO_ARGON2_NOT_SUPPORTED` {#ERR_CRYPTO_ARGON2_NOT_SUPPORTED}

Argon2 не поддерживается используемой версией OpenSSL.

### `ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED` {#ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED}

Был запрошен механизм клиентского сертификата, который не поддерживается используемой версией OpenSSL.

### `ERR_CRYPTO_ECDH_INVALID_FORMAT` {#ERR_CRYPTO_ECDH_INVALID_FORMAT}

В метод `getPublicKey()` класса `crypto.ECDH()` было передано недопустимое значение аргумента `format`.

### `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY` {#ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY}

В метод `crypto.ECDH()` класса `computeSecret()` было передано недопустимое значение аргумента `key`. Это означает, что открытый ключ лежит за пределами эллиптической кривой.

### `ERR_CRYPTO_ENGINE_UNKNOWN` {#ERR_CRYPTO_ENGINE_UNKNOWN}

В [`require('node:crypto').setEngine()`](crypto.md#cryptosetengineengine-flags) был передан неверный идентификатор криптографического движка.

### `ERR_CRYPTO_FIPS_FORCED` {#ERR_CRYPTO_FIPS_FORCED}

Был использован аргумент командной строки [`--force-fips`](cli.md#--force-fips), но была попытка включить или отключить режим FIPS в модуле `node:crypto`.

### `ERR_CRYPTO_FIPS_UNAVAILABLE` {#ERR_CRYPTO_FIPS_UNAVAILABLE}

Была предпринята попытка включить или отключить режим FIPS, но режим FIPS был недоступен.

### `ERR_CRYPTO_HASH_FINALIZED` {#ERR_CRYPTO_HASH_FINALIZED}

[`hash.digest()`](crypto.md#hashdigestencoding) был вызван несколько раз. Метод `hash.digest()` должен вызываться не более одного раза для каждого экземпляра объекта `Hash`.

### `ERR_CRYPTO_HASH_UPDATE_FAILED` {#ERR_CRYPTO_HASH_UPDATE_FAILED}

[`hash.update()`](crypto.md#hashupdatedata-inputencoding) не удалось по какой-либо причине. Это должно происходить редко, если вообще происходит.

### `ERR_CRYPTO_INCOMPATIBLE_KEY` {#ERR_CRYPTO_INCOMPATIBLE_KEY}

Данные криптографические ключи несовместимы с предпринимаемой операцией.

### `ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS` {#ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS}

Выбранная кодировка открытого или закрытого ключа несовместима с другими вариантами.

### `ERR_CRYPTO_INITIALIZATION_FAILED` {#ERR_CRYPTO_INITIALIZATION_FAILED}

Инициализация криптоподсистемы не удалась.

### `ERR_CRYPTO_INVALID_AUTH_TAG` {#ERR_CRYPTO_INVALID_AUTH_TAG}

Был предоставлен недопустимый тег аутентификации.

### `ERR_CRYPTO_INVALID_COUNTER` {#ERR_CRYPTO_INVALID_COUNTER}

Для шифра с режимом счетчика был предоставлен некорректный счетчик.

### `ERR_CRYPTO_INVALID_CURVE` {#ERR_CRYPTO_INVALID_CURVE}

Была предоставлена недопустимая эллиптическая кривая.

### `ERR_CRYPTO_INVALID_DIGEST` {#ERR_CRYPTO_INVALID_DIGEST}

Был указан неверный [алгоритм криптодайджеста](crypto.md#cryptogethashes).

### `ERR_CRYPTO_INVALID_IV` {#ERR_CRYPTO_INVALID_IV}

Был предоставлен недопустимый вектор инициализации.

### `ERR_CRYPTO_INVALID_JWK` {#ERR_CRYPTO_INVALID_JWK}

Был предоставлен недопустимый веб-ключ JSON.

### `ERR_CRYPTO_INVALID_KEYLEN` {#ERR_CRYPTO_INVALID_KEYLEN}

Указана недопустимая длина ключа.

### `ERR_CRYPTO_INVALID_KEYPAIR` {#ERR_CRYPTO_INVALID_KEYPAIR}

Была предоставлена недопустимая пара ключей.

### `ERR_CRYPTO_INVALID_KEYTYPE` {#ERR_CRYPTO_INVALID_KEYTYPE}

Был предоставлен недопустимый тип ключа.

### `ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE` {#ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE}

Тип данного объекта криптографического ключа не подходит для данной операции.

### `ERR_CRYPTO_INVALID_MESSAGELEN` {#ERR_CRYPTO_INVALID_MESSAGELEN}

Была предоставлена недопустимая длина сообщения.

### `ERR_CRYPTO_INVALID_SCRYPT_PARAMS` {#ERR_CRYPTO_INVALID_SCRYPT_PARAMS}

Были предоставлены неверные параметры алгоритма scrypt.

### `ERR_CRYPTO_INVALID_STATE` {#ERR_CRYPTO_INVALID_STATE}

Метод crypto был использован на объекте, который находился в недопустимом состоянии. Например, вызов [`cipher.getAuthTag()`](crypto.md#ciphergetauthtag) перед вызовом `cipher.final()`.

### `ERR_CRYPTO_INVALID_TAG_LENGTH` {#ERR_CRYPTO_INVALID_TAG_LENGTH}

Была указана недопустимая длина тега аутентификации.

### `ERR_CRYPTO_JOB_INIT_FAILED` {#ERR_CRYPTO_JOB_INIT_FAILED}

Инициализация асинхронной криптооперации не удалась.

### `ERR_CRYPTO_JWK_UNSUPPORTED_CURVE` {#ERR_CRYPTO_JWK_UNSUPPORTED_CURVE}

Эллиптическая кривая ключа не зарегистрирована для использования в [реестре эллиптических кривых JSON Web Key](https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve).

### `ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE` {#ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE}

Асимметричный тип ключа не зарегистрирован для использования в [реестре типов JSON Web Key](https://www.iana.org/assignments/jose/jose.xhtml#web-key-types).

### `ERR_CRYPTO_KEM_NOT_SUPPORTED` {#ERR_CRYPTO_KEM_NOT_SUPPORTED}

Была предпринята попытка использовать операции KEM, хотя Node.js был собран без OpenSSL с поддержкой KEM.

### `ERR_CRYPTO_OPERATION_FAILED` {#ERR_CRYPTO_OPERATION_FAILED}

Криптооперация завершилась неудачно по неустановленной причине.

### `ERR_CRYPTO_PBKDF2_ERROR` {#ERR_CRYPTO_PBKDF2_ERROR}

Алгоритм PBKDF2 не сработал по неустановленным причинам. OpenSSL не предоставляет более подробной информации, и, соответственно, Node.js тоже.

### `ERR_CRYPTO_SCRYPT_NOT_SUPPORTED` {#ERR_CRYPTO_SCRYPT_NOT_SUPPORTED}

Node.js был собран без поддержки `scrypt`. Это невозможно для официальных бинарных релизов, но может случиться в пользовательских сборках, включая сборки дистрибутивов.

### `ERR_CRYPTO_SIGN_KEY_REQUIRED` {#ERR_CRYPTO_SIGN_KEY_REQUIRED}

Ключ подписи `key` не был передан в метод [`sign.sign()`](crypto.md#signsignprivatekey-outputencoding).

### `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` {#ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH}

[`crypto.timingSafeEqual()`](crypto.md#cryptotimingsafeequala-b) был вызван с аргументами `Buffer`, `TypedArray` или `DataView` разной длины.

### `ERR_CRYPTO_UNKNOWN_CIPHER` {#ERR_CRYPTO_UNKNOWN_CIPHER}

Был указан неизвестный шифр.

### `ERR_CRYPTO_UNKNOWN_DH_GROUP` {#ERR_CRYPTO_UNKNOWN_DH_GROUP}

Указано неизвестное имя группы Диффи-Хеллмана. Список допустимых имен групп см. в [`crypto.getDiffieHellman()`](crypto.md#cryptogetdiffiehellmangroupname).

### `ERR_CRYPTO_UNSUPPORTED_OPERATION` {#ERR_CRYPTO_UNSUPPORTED_OPERATION}

Была предпринята попытка вызвать неподдерживаемую криптооперацию.

### `ERR_DEBUGGER_ERROR` {#ERR_DEBUGGER_ERROR}

Произошла ошибка при работе с [отладчиком](debugger.md).

### `ERR_DEBUGGER_STARTUP_ERROR` {#ERR_DEBUGGER_STARTUP_ERROR}

[Отладчик](debugger.md) затянул время, ожидая, пока освободится требуемый хост/порт.

### `ERR_DIR_CLOSED` {#ERR_DIR_CLOSED}

Каталог [`fs.Dir`](fs.md#class-fsdir) был ранее закрыт.

### `ERR_DIR_CONCURRENT_OPERATION` {#ERR_DIR_CONCURRENT_OPERATION}

Была предпринята синхронная операция чтения или закрытия для [`fs.Dir`](fs.md#class-fsdir), у которого ещё выполняются асинхронные операции.

### `ERR_DLOPEN_DISABLED` {#ERR_DLOPEN_DISABLED}

Загрузка родных аддонов была отключена с помощью [`--no-addons`](cli.md#--no-addons).

### `ERR_DLOPEN_FAILED` {#ERR_DLOPEN_FAILED}

Вызов `process.dlopen()` не удался.

### `ERR_DNS_SET_SERVERS_FAILED` {#ERR_DNS_SET_SERVERS_FAILED}

`c-ares` не удалось установить DNS-сервер.

### `ERR_DOMAIN_CALLBACK_NOT_AVAILABLE` {#ERR_DOMAIN_CALLBACK_NOT_AVAILABLE}

Модуль `node:domain` был недоступен: не удалось установить необходимые перехватчики обработки ошибок, потому что ранее уже был вызван [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn).

### `ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE` {#ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE}

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) нельзя было вызвать, потому что модуль `node:domain` уже был загружен ранее.

Трассировка стека дополнена моментом загрузки модуля `node:domain`.

### `ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION` {#ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION}

[`v8.startupSnapshot.setDeserializeMainFunction()`](v8.md#v8startupsnapshotsetdeserializemainfunctioncallback-data) нельзя было вызвать, потому что он уже вызывался ранее.

### `ERR_ENCODING_INVALID_ENCODED_DATA` {#ERR_ENCODING_INVALID_ENCODED_DATA}

Данные, переданные в API `TextDecoder()`, были недопустимы для указанной кодировки.

### `ERR_ENCODING_NOT_SUPPORTED` {#ERR_ENCODING_NOT_SUPPORTED}

Кодировка, переданная в API `TextDecoder()`, не входит в число [кодировок, поддерживаемых WHATWG](util.md#whatwg-supported-encodings).

### `ERR_EVAL_ESM_CANNOT_PRINT` {#ERR_EVAL_ESM_CANNOT_PRINT}

`--print` нельзя использовать с входными данными ESM.

### `ERR_EVENT_RECURSION` {#ERR_EVENT_RECURSION}

Выбрасывается при попытке рекурсивно отправить событие в `EventTarget`.

### `ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE` {#ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE}

Контекст выполнения JS не связан со средой Node.js. Такое возможно при встраивании Node.js как библиотеки, если не настроены некоторые перехватчики движка JS.

### `ERR_FALSY_VALUE_REJECTION` {#ERR_FALSY_VALUE_REJECTION}

`Promise`, преобразованный через `util.callbackify()`, был отклонён с ложным значением.

### `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM` {#ERR_FEATURE_UNAVAILABLE_ON_PLATFORM}

Используется, когда вызывается возможность, недоступная на текущей платформе, где запущен Node.js.

### `ERR_FS_CP_DIR_TO_NON_DIR` {#ERR_FS_CP_DIR_TO_NON_DIR}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать каталог в не-каталог (файл, симлинк и т. п.).

### `ERR_FS_CP_EEXIST` {#ERR_FS_CP_EEXIST}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка перезаписать уже существующий файл при `force` и `errorOnExist`, равных `true`.

### `ERR_FS_CP_EINVAL` {#ERR_FS_CP_EINVAL}

При использовании [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) `src` или `dest` указывали на недопустимый путь.

### `ERR_FS_CP_FIFO_PIPE` {#ERR_FS_CP_FIFO_PIPE}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать именованный канал.

### `ERR_FS_CP_NON_DIR_TO_DIR` {#ERR_FS_CP_NON_DIR_TO_DIR}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать не-каталог (файл, симлинк и т. п.) в каталог.

### `ERR_FS_CP_SOCKET` {#ERR_FS_CP_SOCKET}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка копирования в сокет.

### `ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY` {#ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY}

При использовании [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) симлинк в `dest` указывал на подкаталог `src`.

### `ERR_FS_CP_UNKNOWN` {#ERR_FS_CP_UNKNOWN}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка копирования в файл неизвестного типа.

### `ERR_FS_EISDIR` {#ERR_FS_EISDIR}

Путь указывает на каталог.

### `ERR_FS_FILE_TOO_LARGE` {#ERR_FS_FILE_TOO_LARGE}

Была предпринята попытка прочитать файл, размер которого больше максимально допустимого для `Buffer`.

### `ERR_FS_WATCH_QUEUE_OVERFLOW` {#ERR_FS_INVALID_SYMLINK_TYPE}

Число событий ФС, поставленных в очередь и не обработанных, превысило значение, заданное в `maxQueue` для `fs.watch()`.

### `ERR_HTTP2_ALTSVC_INVALID_ORIGIN` {#ERR_HTTP2_ALTSVC_INVALID_ORIGIN}

Кадры HTTP/2 ALTSVC требуют корректного origin.

### `ERR_HTTP2_ALTSVC_LENGTH` {#ERR_HTTP2_ALTSVC_LENGTH}

Кадры HTTP/2 ALTSVC ограничены максимум 16 382 байтами полезной нагрузки.

### `ERR_HTTP2_CONNECT_AUTHORITY` {#ERR_HTTP2_CONNECT_AUTHORITY}

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:authority` обязателен.

### `ERR_HTTP2_CONNECT_PATH` {#ERR_HTTP2_CONNECT_PATH}

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:path` запрещён.

### `ERR_HTTP2_CONNECT_SCHEME` {#ERR_HTTP2_CONNECT_SCHEME}

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:scheme` запрещён.

### `ERR_HTTP2_ERROR` {#ERR_HTTP2_ERROR}

Произошла неспецифичная ошибка HTTP/2.

### `ERR_HTTP2_GOAWAY_SESSION` {#ERR_HTTP2_GOAWAY_SESSION}

Новые потоки HTTP/2 нельзя открыть после того, как `Http2Session` получил кадр `GOAWAY` от удалённой стороны.

### `ERR_HTTP2_HEADERS_AFTER_RESPOND` {#ERR_HTTP2_HEADER_SINGLE_VALUE}

Дополнительные заголовки были указаны после начала HTTP/2-ответа.

### `ERR_HTTP2_HEADERS_SENT` {#ERR_HTTP2_HEADERS_SENT}

Была предпринята попытка отправить несколько наборов заголовков ответа.

### `ERR_HTTP2_HEADER_SINGLE_VALUE` {#ERR_HTTP2_INFO_STATUS_NOT_ALLOWED}

Для поля заголовка HTTP/2, которое должно иметь одно значение, передано несколько значений.

### `ERR_HTTP2_INFO_STATUS_NOT_ALLOWED` {#ERR_HTTP2_HEADERS_AFTER_RESPOND}

Информационные коды состояния HTTP (`1xx`) нельзя задавать как код ответа для HTTP/2.

### `ERR_HTTP2_INVALID_CONNECTION_HEADERS` {#ERR_HTTP2_INVALID_CONNECTION_HEADERS}

Запрещено использовать специфичные для соединения заголовки HTTP/1 в запросах и ответах HTTP/2.

### `ERR_HTTP2_INVALID_HEADER_VALUE` {#ERR_HTTP2_INVALID_HEADER_VALUE}

Указано недопустимое значение заголовка HTTP/2.

### `ERR_HTTP2_INVALID_INFO_STATUS` {#ERR_HTTP2_INVALID_INFO_STATUS}

Указан недопустимый информационный код состояния HTTP. Такие коды должны быть целыми от `100` до `199` включительно.

### `ERR_HTTP2_INVALID_ORIGIN` {#ERR_HTTP2_INVALID_ORIGIN}

Кадры HTTP/2 `ORIGIN` требуют корректного origin.

### `ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH` {#ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH}

Входные экземпляры `Buffer` и `Uint8Array`, переданные в API `http2.getUnpackedSettings()`, должны иметь длину, кратную шести.

### `ERR_HTTP2_INVALID_PSEUDOHEADER` {#ERR_HTTP2_INVALID_PSEUDOHEADER}

Допустимо использовать только корректные псевдозаголовки HTTP/2 (`:status`, `:path`, `:authority`, `:scheme` и `:method`).

### `ERR_HTTP2_INVALID_SESSION` {#ERR_HTTP2_INVALID_SESSION}

Операция выполнялась над объектом `Http2Session`, который уже был уничтожен.

### `ERR_HTTP2_INVALID_SETTING_VALUE` {#ERR_HTTP2_INVALID_SETTING_VALUE}

Для параметра HTTP/2 SETTINGS указано недопустимое значение.

### `ERR_HTTP2_INVALID_STREAM` {#ERR_HTTP2_INVALID_STREAM}

Операция выполнялась над потоком, который уже был уничтожен.

### `ERR_HTTP2_MAX_PENDING_SETTINGS_ACK` {#ERR_HTTP2_MAX_PENDING_SETTINGS_ACK}

Каждый раз, когда подключённой стороне отправляется кадр HTTP/2 `SETTINGS`, она должна подтвердить, что получила и применила новые `SETTINGS`. По умолчанию одновременно можно отправить только ограниченное число неподтверждённых кадров `SETTINGS`. Этот код ошибки используется, когда данный предел достигнут.

### `ERR_HTTP2_NESTED_PUSH` {#ERR_HTTP2_NESTED_PUSH}

Была попытка открыть новый push-поток изнутри push-потока. Вложенные push-потоки не допускаются.

### `ERR_HTTP2_NO_MEM` {#ERR_HTTP2_NO_MEM}

Недостаточно памяти при использовании API `http2session.setLocalWindowSize(windowSize)`.

### `ERR_HTTP2_NO_SOCKET_MANIPULATION` {#ERR_HTTP2_NO_SOCKET_MANIPULATION}

Была попытка напрямую управлять сокетом, привязанным к `Http2Session` (чтение, запись, pause, resume и т. д.).

### `ERR_HTTP2_ORIGIN_LENGTH` {#ERR_HTTP2_ORIGIN_LENGTH}

Длина кадров HTTP/2 `ORIGIN` ограничена 16382 байтами.

### `ERR_HTTP2_OUT_OF_STREAMS` {#ERR_HTTP2_OUT_OF_STREAMS}

Достигнуто максимальное число потоков на одной сессии HTTP/2.

### `ERR_HTTP2_PAYLOAD_FORBIDDEN` {#ERR_HTTP2_PAYLOAD_FORBIDDEN}

Для кода ответа HTTP, которому запрещено тело, было указано тело сообщения.

### `ERR_HTTP2_PING_CANCEL` {#ERR_HTTP2_PING_CANCEL}

HTTP/2 PING был отменён.

### `ERR_HTTP2_PING_LENGTH` {#ERR_HTTP2_PING_LENGTH}

Полезная нагрузка ping в HTTP/2 должна иметь длину ровно 8 байт.

### `ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED` {#ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED}

Псевдозаголовок HTTP/2 использован недопустимо. Псевдозаголовки — имена ключей, начинающиеся с префикса `:`.

### `ERR_HTTP2_PUSH_DISABLED` {#ERR_HTTP2_PUSH_DISABLED}

Была попытка создать push-поток, хотя клиент отключил push.

### `ERR_HTTP2_SEND_FILE` {#ERR_HTTP2_SEND_FILE}

Через API `Http2Stream.prototype.responseWithFile()` была попытка отправить каталог.

### `ERR_HTTP2_SEND_FILE_NOSEEK` {#ERR_HTTP2_SEND_FILE_NOSEEK}

Через `Http2Stream.prototype.responseWithFile()` была попытка отправить не обычный файл, при этом указаны опции `offset` или `length`.

### `ERR_HTTP2_SESSION_ERROR` {#ERR_HTTP2_SESSION_ERROR}

`Http2Session` закрыта с ненулевым кодом ошибки.

### `ERR_HTTP2_SETTINGS_CANCEL` {#ERR_HTTP2_SETTINGS_CANCEL}

Настройки `Http2Session` отменены.

### `ERR_HTTP2_SOCKET_BOUND` {#ERR_HTTP2_SOCKET_BOUND}

Была попытка связать `Http2Session` с `net.Socket` или `tls.TLSSocket`, уже привязанным к другой `Http2Session`.

### `ERR_HTTP2_SOCKET_UNBOUND` {#ERR_HTTP2_SOCKET_UNBOUND}

Была попытка использовать свойство `socket` у уже закрытой `Http2Session`.

### `ERR_HTTP2_STATUS_101` {#ERR_HTTP2_STATUS_101}

Использование информационного кода состояния `101` запрещено в HTTP/2.

### `ERR_HTTP2_STATUS_INVALID` {#ERR_HTTP2_STATUS_INVALID}

Указан недопустимый код состояния HTTP. Код должен быть целым от `100` до `599` включительно.

### `ERR_HTTP2_STREAM_CANCEL` {#ERR_HTTP2_STREAM_CANCEL}

`Http2Stream` был уничтожен до передачи данных удалённой стороне.

### `ERR_HTTP2_STREAM_ERROR` {#ERR_HTTP2_STREAM_ERROR}

В кадре `RST_STREAM` указан ненулевой код ошибки.

### `ERR_HTTP2_STREAM_SELF_DEPENDENCY` {#ERR_HTTP2_STREAM_SELF_DEPENDENCY}

При задании приоритета потока HTTP/2 поток может быть помечен зависимым от родительского. Этот код используется при попытке сделать поток зависимым от самого себя.

### `ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS` {#ERR_HTTP2_TOO_MANY_INVALID_FRAMES}

Превышено число поддерживаемых пользовательских настроек (10).

### `ERR_HTTP2_TOO_MANY_INVALID_FRAMES` {#ERR_HTTP2_TOO_MANY_INVALID_FRAMES}

Превышен предел допустимого числа некорректных кадров протокола HTTP/2 от удалённой стороны, заданный опцией `maxSessionInvalidFrames`.

### `ERR_HTTP2_TRAILERS_ALREADY_SENT` {#ERR_HTTP2_TRAILERS_ALREADY_SENT}

Завершающие заголовки уже были отправлены в `Http2Stream`.

### `ERR_HTTP2_TRAILERS_NOT_READY` {#ERR_HTTP2_TRAILERS_NOT_READY}

Метод `http2stream.sendTrailers()` нельзя вызывать до события `'wantTrailers'` на объекте `Http2Stream`. Событие `'wantTrailers'` генерируется только если для `Http2Stream` задана опция `waitForTrailers`.

### `ERR_HTTP2_UNSUPPORTED_PROTOCOL` {#ERR_HTTP2_UNSUPPORTED_PROTOCOL}

В `http2.connect()` передан URL с протоколом, отличным от `http:` или `https:`.

### `ERR_HTTP_BODY_NOT_ALLOWED` {#ERR_ILLEGAL_CONSTRUCTOR}

Ошибка возникает при записи в HTTP-ответ, который не допускает тела.

### `ERR_HTTP_CONTENT_LENGTH_MISMATCH` {#ERR_HTTP_CONTENT_LENGTH_MISMATCH}

Размер тела ответа не совпадает со значением заголовка Content-Length.

### `ERR_HTTP_HEADERS_SENT` {#ERR_HTTP_CONTENT_LENGTH_MISMATCH}

Была попытка добавить заголовки после того, как заголовки уже были отправлены.

### `ERR_HTTP_INVALID_HEADER_VALUE` {#ERR_HTTP_INVALID_HEADER_VALUE}

Указано недопустимое значение HTTP-заголовка.

### `ERR_HTTP_INVALID_STATUS_CODE` {#ERR_HTTP_INVALID_STATUS_CODE}

Код состояния вне обычного диапазона (100–999).

### `ERR_HTTP_REQUEST_TIMEOUT` {#ERR_HTTP_REQUEST_TIMEOUT}

Клиент не отправил весь запрос за отведённое время.

### `ERR_HTTP_SOCKET_ASSIGNED` {#ERR_HTTP_SOCKET_ENCODING}

Указанному [`ServerResponse`](http.md#class-httpserverresponse) уже назначен сокет.

### `ERR_HTTP_SOCKET_ENCODING` {#ERR_HTTP_SOCKET_ENCODING}

Согласно [RFC 7230, раздел 3](https://tools.ietf.org/html/rfc7230#section-3), смена кодировки сокета не допускается.

### `ERR_HTTP_TRAILER_INVALID` {#ERR_HTTP_TRAILER_INVALID}

Заголовок `Trailer` задан, хотя кодирование передачи это не поддерживает.

### `ERR_ILLEGAL_CONSTRUCTOR` {#ERR_HTTP2_ALTSVC_INVALID_ORIGIN}

Была попытка создать объект через непубличный конструктор.

### `ERR_IMPORT_ATTRIBUTE_MISSING` {#ERR_IMPORT_ASSERTION_TYPE_FAILED}

Отсутствует атрибут импорта, из‑за чего указанный модуль нельзя импортировать.

### `ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE` {#ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE}

Атрибут импорта `type` указан, но модуль другого типа.

### `ERR_IMPORT_ATTRIBUTE_UNSUPPORTED` {#ERR_IMPORT_ATTRIBUTE_UNSUPPORTED}

Атрибут импорта не поддерживается этой версией Node.js.

### `ERR_INCOMPATIBLE_OPTION_PAIR` {#err_incompatible_option_pair}

Пара опций несовместима с самой собой и не может использоваться одновременно.

### `ERR_INPUT_TYPE_NOT_ALLOWED` {#ERR_INPUT_TYPE_NOT_ALLOWED}

!!!warning "Стабильность: 1 - Экспериментальная"

Флаг `--input-type` использован для запуска файла. Его можно применять только вместе с вводом через `--eval`, `--print` или `STDIN`.

### `ERR_INSPECTOR_ALREADY_ACTIVATED` {#ERR_INSPECTOR_ALREADY_ACTIVATED}

При использовании `node:inspector` была попытка активировать инспектор, когда он уже слушает порт. Вызовите `inspector.close()` перед активацией на другом адресе.

### `ERR_INSPECTOR_ALREADY_CONNECTED` {#ERR_INSPECTOR_ALREADY_CONNECTED}

При использовании `node:inspector` была попытка подключиться, когда инспектор уже подключён.

### `ERR_INSPECTOR_CLOSED` {#ERR_INSPECTOR_CLOSED}

При использовании `node:inspector` была попытка использовать инспектор после закрытия сессии.

### `ERR_INSPECTOR_COMMAND` {#ERR_INSPECTOR_COMMAND}

Ошибка при выполнении команды через модуль `node:inspector`.

### `ERR_INSPECTOR_NOT_ACTIVE` {#ERR_INSPECTOR_NOT_ACTIVE}

`inspector` не активен в момент вызова `inspector.waitForDebugger()`.

### `ERR_INSPECTOR_NOT_AVAILABLE` {#ERR_INSPECTOR_NOT_AVAILABLE}

Модуль `node:inspector` недоступен.

### `ERR_INSPECTOR_NOT_CONNECTED` {#ERR_INSPECTOR_NOT_CONNECTED}

При использовании `node:inspector` была попытка использовать инспектор до подключения.

### `ERR_INSPECTOR_NOT_WORKER` {#ERR_INSPECTOR_NOT_WORKER}

API вызван в основном потоке, хотя допускается только из потока worker.

### `ERR_INTERNAL_ASSERTION` {#ERR_INTERNAL_ASSERTION}

Обнаружена ошибка в Node.js или некорректное использование внутренностей Node.js. Сообщите о проблеме: <https://github.com/nodejs/node/issues>.

### `ERR_INVALID_ADDRESS` {#ERR_INVALID_ADDRESS_FAMILY}

Переданный адрес не распознан API Node.js.

### `ERR_INVALID_ADDRESS_FAMILY` {#ERR_INVALID_ADDRESS_FAMILY}

Переданное семейство адресов не распознано API Node.js.

### `ERR_INVALID_ARG_TYPE` {#err_invalid_arg_type}

В API Node.js передан аргумент неверного типа.

### `ERR_INVALID_ARG_VALUE` {#ERR_INVALID_ARG_VALUE}

Для аргумента передано недопустимое или неподдерживаемое значение.

### `ERR_INVALID_ASYNC_ID` {#ERR_INVALID_ASYNC_ID}

Через `AsyncHooks` передан недопустимый `asyncId` или `triggerAsyncId`. Идентификатор меньше -1 не должен встречаться.

### `ERR_INVALID_BUFFER_SIZE` {#ERR_INVALID_BUFFER_SIZE}

Для `Buffer` выполнен swap, но размер не подходит для операции.

### `ERR_INVALID_CHAR` {#ERR_INVALID_CHAR}

В заголовках обнаружены недопустимые символы.

### `ERR_INVALID_CURSOR_POS` {#ERR_INVALID_CURSOR_POS}

Курсор потока нельзя переместить на указанную строку без указанного столбца.

### `ERR_INVALID_FD` {#ERR_INVALID_FD}

Недопустимый файловый дескриптор (`fd`), например отрицательное значение.

### `ERR_INVALID_FD_TYPE` {#ERR_INVALID_FD_TYPE}

Недопустимый тип файлового дескриптора (`fd`).

### `ERR_INVALID_FILE_URL_HOST` {#ERR_INVALID_FILE_URL_HOST}

API Node.js, работающее с URL `file:` (например функции [`fs`](fs.md)), получило URL с недопустимым хостом. Такое возможно только на Unix-подобных системах, где поддерживаются только `localhost` или пустой хост.

### `ERR_INVALID_FILE_URL_PATH` {#ERR_INVALID_FILE_URL_PATH}

API Node.js, работающее с URL `file:` (например [`fs`](fs.md)), получило URL с недопустимым путём. Допустимость пути зависит от платформы.

### `ERR_INVALID_HANDLE_TYPE` {#ERR_INVALID_HANDLE_TYPE}

Попытка передать неподдерживаемый «handle» по IPC дочернему процессу. См. [`subprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback) и [`process.send()`](process.md#processsendmessage-sendhandle-options-callback).

### `ERR_INVALID_HTTP_TOKEN` {#ERR_INVALID_HTTP_TOKEN}

Передан недопустимый HTTP-токен.

### `ERR_INVALID_IP_ADDRESS` {#ERR_INVALID_IP_ADDRESS}

Недопустимый IP-адрес.

### `ERR_INVALID_MIME_SYNTAX` {#ERR_INVALID_MIME_SYNTAX}

Синтаксис MIME некорректен.

### `ERR_INVALID_MODULE` {#ERR_INVALID_MODULE}

Попытка загрузить несуществующий или иначе недопустимый модуль.

### `ERR_INVALID_MODULE_SPECIFIER` {#ERR_INVALID_MODULE_SPECIFIER}

Строка импортируемого модуля — недопустимый URL, имя пакета или спецификатор подпути.

### `ERR_INVALID_OBJECT_DEFINE_PROPERTY` {#ERR_INVALID_OBJECT_DEFINE_PROPERTY}

Ошибка при установке недопустимого атрибута свойства объекта.

### `ERR_INVALID_PACKAGE_CONFIG` {#ERR_INVALID_PACKAGE_CONFIG}

Файл [`package.json`](packages.md#nodejs-packagejson-field-definitions) недопустим и не разобран.

### `ERR_INVALID_PACKAGE_TARGET` {#ERR_INVALID_PACKAGE_TARGET}

Поле [`"exports"`](packages.md#exports) в `package.json` содержит недопустимое сопоставление цели для данного разрешения модуля.

### `ERR_INVALID_PROTOCOL` {#ERR_INVALID_PERFORMANCE_MARK}

В `http.request()` передан недопустимый `options.protocol`.

### `ERR_INVALID_REPL_EVAL_CONFIG` {#ERR_INVALID_REPL_EVAL_CONFIG}

В конфиге [`REPL`](repl.md) одновременно заданы `breakEvalOnSigint` и `eval`, что не поддерживается.

### `ERR_INVALID_REPL_INPUT` {#ERR_INVALID_REPL_INPUT}

Ввод нельзя использовать в [`REPL`](repl.md). Условия использования этой ошибки описаны в документации [`REPL`](repl.md).

### `ERR_INVALID_RETURN_PROPERTY` {#ERR_INVALID_RETURN_PROPERTY}

Выбрасывается, если опция-функция не возвращает допустимое значение для одного из свойств объекта при выполнении.

### `ERR_INVALID_RETURN_PROPERTY_VALUE` {#ERR_INVALID_RETURN_PROPERTY_VALUE}

Выбрасывается, если опция-функция не возвращает ожидаемый тип для одного из свойств объекта при выполнении.

### `ERR_INVALID_RETURN_VALUE` {#ERR_INVALID_RETURN_VALUE}

Выбрасывается, если опция-функция не возвращает ожидаемый тип при выполнении (например ожидался промис).

### `ERR_INVALID_STATE` {#ERR_INVALID_STATE}

Операция не может быть завершена из‑за недопустимого состояния: объект уже уничтожен или выполняет другую операцию.

### `ERR_INVALID_SYNC_FORK_INPUT` {#ERR_INVALID_SYNC_FORK_INPUT}

В асинхронный fork в качестве stdio переданы `Buffer`, `TypedArray`, `DataView` или строка. См. документацию [`child_process`](child_process.md).

### `ERR_INVALID_THIS` {#ERR_INVALID_THIS}

Функция API Node.js вызвана с несовместимым значением `this`.

```js
const urlSearchParams = new URLSearchParams(
    'foo=bar&baz=new'
);

const buf = Buffer.alloc(1);
urlSearchParams.has.call(buf, 'foo');
// Throws a TypeError with code 'ERR_INVALID_THIS'
```

### `ERR_INVALID_TUPLE` {#ERR_INVALID_TRANSFER_OBJECT}

Элемент переданного `iterable` в [конструктор `URLSearchParams`](url.md#new-urlsearchparamsiterable) [WHATWG](url.md#the-whatwg-url-api) не является кортежем `[name, value]`: элемент не итерируемый или не из двух элементов.

### `ERR_INVALID_TYPESCRIPT_SYNTAX` {#ERR_INVALID_URI}

Указанный синтаксис TypeScript недопустим.

### `ERR_INVALID_URI` {#ERR_INVALID_URI}

Передан недопустимый URI.

### `ERR_INVALID_URL` {#ERR_INVALID_URL}

В [конструктор `URL`](url.md#new-urlinput-base) [WHATWG](url.md#the-whatwg-url-api) или устаревший [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) передан недопустимый URL. У объекта ошибки обычно есть свойство `'input'` с неразобранным URL.

### `ERR_INVALID_URL_PATTERN` {#ERR_INVALID_URL_SCHEME}

Для разбора в [конструктор `URLPattern`](url.md#new-urlpatternstring-baseurl-options) по [WHATWG URL API](url.md#the-whatwg-url-api) был передан недопустимый URLPattern.

### `ERR_INVALID_URL_SCHEME` {#ERR_INVALID_URL_SCHEME}

Попытка использовать URL с несовместимой схемой (протоколом). Сейчас используется в [`fs`](fs.md) с [WHATWG URL API](url.md#the-whatwg-url-api) (только `'file'`), в будущем возможно и в других API.

### `ERR_IPC_CHANNEL_CLOSED` {#ERR_IPC_CHANNEL_CLOSED}

Попытка использовать уже закрытый IPC-канал.

### `ERR_IPC_DISCONNECTED` {#ERR_IPC_DISCONNECTED}

Попытка отключить уже отключённый IPC-канал. См. [`child_process`](child_process.md).

### `ERR_IPC_ONE_PIPE` {#ERR_IPC_ONE_PIPE}

Попытка создать дочерний процесс Node.js с более чем одним IPC-каналом. См. [`child_process`](child_process.md).

### `ERR_IPC_SYNC_FORK` {#ERR_IPC_SYNC_FORK}

Попытка открыть IPC-канал с синхронно форкнутым процессом Node.js. См. [`child_process`](child_process.md).

### `ERR_IP_BLOCKED` {#ERR_LOADER_CHAIN_INCOMPLETE}

IP-адрес заблокирован `net.BlockList`.

### `ERR_LOADER_CHAIN_INCOMPLETE` {#ERR_LOADER_CHAIN_INCOMPLETE}

Хук загрузчика ESM вернул управление без вызова `next()` и без явного короткого замыкания.

### `ERR_LOAD_SQLITE_EXTENSION` {#ERR_MANIFEST_ASSERT_INTEGRITY}

Ошибка при загрузке расширения SQLite.

### `ERR_MEMORY_ALLOCATION_FAILED` {#ERR_MEMORY_ALLOCATION_FAILED}

Не удалось выделить память (обычно в слое C++).

### `ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE` {#ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE}

Сообщение в [`MessagePort`](worker_threads.md#class-messageport) не удалось десериализовать в целевом контексте [vm](vm.md). Не все объекты Node.js можно создать в любом контексте; передача через `postMessage()` может не сработать.

### `ERR_METHOD_NOT_IMPLEMENTED` {#ERR_METHOD_NOT_IMPLEMENTED}

Требуемый метод не реализован.

### `ERR_MISSING_ARGS` {#ERR_MISSING_ARGS}

Не передан обязательный аргумент API Node.js (строгое соответствие спецификации: иногда допустимо `func(undefined)`, но не `func()`). В большинстве нативных API `func(undefined)` и `func()` эквивалентны; может использоваться [`ERR_INVALID_ARG_TYPE`](#err_invalid_arg_type).

### `ERR_MISSING_OPTION` {#ERR_MISSING_OPTION}

Для API, принимающих объекты параметров, некоторые параметры могут быть обязательными. Этот код ошибки выбрасывается, если обязательный параметр отсутствует.

### `ERR_MISSING_PASSPHRASE` {#ERR_MISSING_PASSPHRASE}

Попытка прочитать зашифрованный ключ без пароля.

### `ERR_MISSING_PLATFORM_FOR_WORKER` {#ERR_MISSING_PLATFORM_FOR_WORKER}

Платформа V8 в этом экземпляре Node.js не поддерживает создание Workers из‑за отсутствия поддержки со стороны встраивания. В стандартных сборках Node.js эта ошибка не возникает.

### `ERR_MODULE_LINK_MISMATCH` {#err_module_link_mismatch}

Модуль нельзя связать: одинаковые запросы модуля в нём разрешаются в разные модули.

### `ERR_MODULE_NOT_FOUND` {#ERR_MODULE_NOT_FOUND}

Загрузчик ECMAScript-модулей не смог разрешить файл модуля при `import` или при загрузке точки входа.

### `ERR_MULTIPLE_CALLBACK` {#ERR_MULTIPLE_CALLBACK}

Колбэк вызван более одного раза.

Колбэк обычно вызывают один раз: запрос выполняется или отклоняется, но не оба сразу. Повторный вызов нарушает это.

### `ERR_NAPI_CONS_FUNCTION` {#ERR_NAPI_CONS_FUNCTION}

При использовании `Node-API` переданный конструктор не был функцией.

### `ERR_NAPI_INVALID_DATAVIEW_ARGS` {#ERR_NAPI_INVALID_DATAVIEW_ARGS}

При вызове `napi_create_dataview()` переданный `offset` выходил за пределы data view либо `offset + length` превышало длину переданного `buffer`.

### `ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT` {#ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT}

При вызове `napi_create_typedarray()` переданный `offset` не был кратен размеру элемента.

### `ERR_NAPI_INVALID_TYPEDARRAY_LENGTH` {#ERR_NAPI_INVALID_TYPEDARRAY_LENGTH}

При вызове `napi_create_typedarray()` значение `(length * size_of_element) + byte_offset` превышало длину переданного `buffer`.

### `ERR_NAPI_TSFN_CALL_JS` {#ERR_NAPI_TSFN_CALL_JS}

Ошибка при вызове JavaScript-части потокобезопасной функции.

### `ERR_NAPI_TSFN_GET_UNDEFINED` {#ERR_NAPI_TSFN_GET_UNDEFINED}

Ошибка при получении значения JavaScript `undefined`.

### `ERR_NON_CONTEXT_AWARE_DISABLED` {#ERR_NAPI_TSFN_START_IDLE_LOOP}

Загружен нативный аддон без поддержки контекста в процессе, где это запрещено.

### `ERR_NOT_BUILDING_SNAPSHOT` {#ERR_OUT_OF_RANGE}

Использованы операции, доступные только при сборке снимка запуска V8, хотя снимок не собирается.

### `ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION` {#ERR_NO_CRYPTO}

Операция недоступна вне приложения в виде одного исполняемого файла.

### `ERR_NOT_SUPPORTED_IN_SNAPSHOT` {#ERR_NOT_SUPPORTED_IN_SNAPSHOT}

Попытка выполнить операции, недоступные при сборке снимка запуска.

### `ERR_NO_CRYPTO` {#ERR_NO_CRYPTO}

Использованы криптографические возможности при сборке Node.js без OpenSSL.

### `ERR_NO_ICU` {#ERR_NO_ICU}

Требуются возможности [ICU](intl.md#internationalization-support), но Node.js собран без ICU.

### `ERR_NO_TYPESCRIPT` {#ERR_NON_CONTEXT_AWARE_DISABLED}

Требуется [поддержка Native TypeScript](typescript.md#type-stripping), но Node.js собран без TypeScript.

### `ERR_OPERATION_FAILED` {#ERR_OPERATION_FAILED}

Операция не удалась. Обычно обозначает общий сбой асинхронной операции.

### `ERR_OPTIONS_BEFORE_BOOTSTRAPPING` {#ERR_OPTIONS_BEFORE_BOOTSTRAPPING}

Попытка получить опции до завершения начальной загрузки.

### `ERR_OUT_OF_RANGE` {#ERR_OUT_OF_RANGE}

Значение вне допустимого диапазона.

### `ERR_PACKAGE_IMPORT_NOT_DEFINED` {#ERR_PACKAGE_IMPORT_NOT_DEFINED}

Поле [`"imports"`](packages.md#imports) в `package.json` не задаёт сопоставление для данного внутреннего спецификатора пакета.

### `ERR_PACKAGE_PATH_NOT_EXPORTED` {#ERR_PACKAGE_PATH_NOT_EXPORTED}

Поле [`"exports"`](packages.md#exports) в `package.json` не экспортирует запрошенный подпуть. Экспорты инкапсулированы: приватные внутренние модули нельзя импортировать через разрешение пакета, кроме как по абсолютному URL.

### `ERR_PARSE_ARGS_INVALID_OPTION_VALUE` {#ERR_PARSE_ARGS_INVALID_OPTION_VALUE}

При `strict`, равном `true`, выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), если для опции типа [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) передано значение [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type), или для опции типа [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) передана строка [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type).

### `ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL` {#ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL}

Выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), когда передан позиционный аргумент, а `allowPositionals` установлен в `false`.

### `ERR_PARSE_ARGS_UNKNOWN_OPTION` {#ERR_PARSE_ARGS_UNKNOWN_OPTION}

При `strict`, равном `true`, выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), если аргумент не описан в `options`.

### `ERR_PERFORMANCE_INVALID_TIMESTAMP` {#ERR_PERFORMANCE_INVALID_TIMESTAMP}

Для метки или измерения производительности передано недопустимое время.

### `ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS` {#ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS}

Для измерения производительности были переданы недопустимые параметры.

### `ERR_PROTO_ACCESS` {#ERR_PROTO_ACCESS}

Доступ к `Object.prototype.__proto__` был запрещён с помощью [`--disable-proto=throw`](cli.md#--disable-protomode). Для получения и установки прототипа объекта следует использовать [`Object.getPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) и [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf).

### `ERR_PROXY_INVALID_CONFIG` {#ERR_REQUIRE_ESM}

Не удалось проксировать запрос, потому что конфигурация прокси недопустима.

### `ERR_PROXY_TUNNEL` {#ERR_PROXY_TUNNEL}

Не удалось установить прокси-туннель, когда включён `NODE_USE_ENV_PROXY` или `--use-env-proxy`.

### `ERR_QUIC_APPLICATION_ERROR` {#ERR_QUIC_APPLICATION_ERROR}

!!!warning "Стабильность: 1 - Экспериментальная"

Ошибка приложения QUIC.

### `ERR_QUIC_CONNECTION_FAILED` {#ERR_QUIC_CONNECTION_FAILED}

!!!warning "Стабильность: 1 - Экспериментальная"

Не удалось установить соединение QUIC.

### `ERR_QUIC_ENDPOINT_CLOSED` {#ERR_QUIC_ENDPOINT_CLOSED}

!!!warning "Стабильность: 1 - Экспериментальная"

Конечная точка QUIC закрыта с ошибкой.

### `ERR_QUIC_OPEN_STREAM_FAILED` {#ERR_QUIC_OPEN_STREAM_FAILED}

!!!warning "Стабильность: 1 - Экспериментальная"

Не удалось открыть поток QUIC.

### `ERR_QUIC_TRANSPORT_ERROR` {#ERR_QUIC_TRANSPORT_ERROR}

!!!warning "Стабильность: 1 - Экспериментальная"

Ошибка транспорта QUIC.

### `ERR_QUIC_VERSION_NEGOTIATION_ERROR` {#ERR_QUIC_VERSION_NEGOTIATION_ERROR}

!!!warning "Стабильность: 1 - Экспериментальная"

Сессия QUIC не удалась: требуется согласование версии.

### `ERR_REQUIRE_ASYNC_MODULE` {#ERR_REQUIRE_ASYNC_MODULE}

При попытке `require()` [ES-модуля](esm.md) оказалось, что модуль асинхронный, то есть содержит `await` верхнего уровня.

Чтобы увидеть, где находится `await` верхнего уровня, используйте `--experimental-print-required-tla` (при этом модули выполняются до поиска `await` верхнего уровня).

### `ERR_REQUIRE_CYCLE_MODULE` {#ERR_REQUIRE_CYCLE_MODULE}

При попытке `require()` [ES-модуля](esm.md) участвует в немедленном цикле граница CommonJS↔ESM. Это недопустимо: ES-модули нельзя вычислять, пока они уже вычисляются.

Чтобы разорвать цикл, вызов `require()` в цикле не должен происходить на верхнем уровне ни ES-модуля (через `createRequire()`), ни CommonJS-модуля — его следует отложить во внутреннюю функцию.

### `ERR_REQUIRE_ESM` {#ERR_REQUIRE_ESM}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка вызвать `require()` для [ES-модуля](esm.md).

### `ERR_SCRIPT_EXECUTION_INTERRUPTED` {#ERR_SCRIPT_EXECUTION_INTERRUPTED}

Выполнение скрипта было прервано сигналом `SIGINT` (например, при нажатии <kbd>Ctrl</kbd>+<kbd>C</kbd>).

### `ERR_SCRIPT_EXECUTION_TIMEOUT` {#ERR_SCRIPT_EXECUTION_TIMEOUT}

Время выполнения скрипта истекло, возможно из-за ошибок в исполняемом скрипте.

### `ERR_SERVER_ALREADY_LISTEN` {#ERR_SERVER_ALREADY_LISTEN}

Метод [`server.listen()`](net.md#serverlisten) вызван, когда `net.Server` уже слушает. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP/2.

### `ERR_SERVER_NOT_RUNNING` {#ERR_SERVER_NOT_RUNNING}

Метод [`server.close()`](net.md#serverclosecallback) вызван, когда `net.Server` не работает. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP/2.

### `ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND` {#ERR_SOCKET_ALREADY_BOUND}

В API одноисполняемого приложения был передан ключ для идентификации ресурса, но соответствие не найдено.

### `ERR_SOCKET_ALREADY_BOUND` {#ERR_SOCKET_ALREADY_BOUND}

Была предпринята попытка привязать сокет, который уже привязан.

### `ERR_SOCKET_BAD_BUFFER_SIZE` {#ERR_SOCKET_BAD_BUFFER_SIZE}

Для параметров `recvBufferSize` или `sendBufferSize` в [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback) был передан недопустимый (отрицательный) размер.

### `ERR_SOCKET_BAD_PORT` {#ERR_SOCKET_BAD_PORT}

Функция API, ожидающая порт \>= 0 и \< 65536, получила недопустимое значение.

### `ERR_SOCKET_BAD_TYPE` {#ERR_SOCKET_BAD_TYPE}

Функция API, ожидающая тип сокета (`udp4` или `udp6`), получила недопустимое значение.

### `ERR_SOCKET_BUFFER_SIZE` {#ERR_SOCKET_BUFFER_SIZE}

При использовании [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback) не удалось определить размер буфера приёма или отправки.

### `ERR_SOCKET_CLOSED` {#ERR_SOCKET_CLOSED}

Была предпринята попытка выполнить операцию над уже закрытым сокетом.

### `ERR_SOCKET_CLOSED_BEFORE_CONNECTION` {#ERR_SOCKET_CLOSED_BEFORE_CONNECTION}

При вызове [`net.Socket.write()`](net.md#socketwritedata-encoding-callback) на подключающемся сокете сокет был закрыт до установления соединения.

### `ERR_SOCKET_CONNECTION_TIMEOUT` {#ERR_SOCKET_DGRAM_IS_CONNECTED}

Сокет не смог подключиться ни к одному адресу из DNS за отведённое время при автовыборе семейства адресов.

### `ERR_SOCKET_DGRAM_IS_CONNECTED` {#ERR_SOCKET_DGRAM_IS_CONNECTED}

Вызов [`dgram.connect()`](dgram.md#socketconnectport-address-callback) был выполнен для уже подключённого сокета.

### `ERR_SOCKET_DGRAM_NOT_CONNECTED` {#ERR_SOCKET_DGRAM_NOT_CONNECTED}

Вызов [`dgram.disconnect()`](dgram.md#socketdisconnect) или [`dgram.remoteAddress()`](dgram.md#socketremoteaddress) был выполнен для отключённого сокета.

### `ERR_SOCKET_DGRAM_NOT_RUNNING` {#ERR_SOCKET_DGRAM_NOT_RUNNING}

Был выполнен вызов, когда подсистема UDP не работала.

### `ERR_SOURCE_MAP_CORRUPT` {#ERR_SRI_PARSE}

Карту исходников не удалось разобрать: файл отсутствует или повреждён.

### `ERR_SOURCE_MAP_MISSING_SOURCE` {#ERR_SOURCE_MAP_MISSING_SOURCE}

Файл, импортируемый из карты исходников, не найден.

### `ERR_SOURCE_PHASE_NOT_DEFINED` {#ERR_SOURCE_PHASE_NOT_DEFINED}

Предоставленный импорт модуля не содержит представления импортов фазы исходника для синтаксиса `import source x from 'x'` или `import.source(x)`.

### `ERR_SQLITE_ERROR` {#ERR_SQLITE_ERROR}

Из [SQLite](sqlite.md) была возвращена ошибка.

### `ERR_SRI_PARSE` {#ERR_SRI_PARSE}

Для проверки целостности подресурса была передана строка, но её не удалось разобрать. Проверьте формат атрибутов целостности по [спецификации Subresource Integrity](https://www.w3.org/TR/SRI/#the-integrity-attribute).

### `ERR_STREAM_ALREADY_FINISHED` {#ERR_STREAM_ALREADY_FINISHED}

Был вызван метод потока, который не может завершиться, потому что поток уже завершён.

### `ERR_STREAM_CANNOT_PIPE` {#ERR_STREAM_CANNOT_PIPE}

Была предпринята попытка вызвать [`stream.pipe()`](stream.md#readablepipedestination-options) у потока [`Writable`](stream.md#class-streamwritable).

### `ERR_STREAM_DESTROYED` {#ERR_STREAM_DESTROYED}

Был вызван метод потока, который не может завершиться, потому что поток уничтожен через `stream.destroy()`.

### `ERR_STREAM_ITER_MISSING_FLAG` {#ERR_STREAM_NULL_VALUES}

API `stream/iter` использовался без включённого CLI-флага `--experimental-stream-iter`.

### `ERR_STREAM_NULL_VALUES` {#ERR_STREAM_NULL_VALUES}

Была предпринята попытка вызвать [`stream.write()`](stream.md#writablewritechunk-encoding-callback) с фрагментом `null`.

### `ERR_STREAM_PREMATURE_CLOSE` {#ERR_STREAM_PREMATURE_CLOSE}

Ошибка, возвращаемая `stream.finished()` и `stream.pipeline()`, когда поток или конвейер завершается некорректно без явной ошибки.

### `ERR_STREAM_PUSH_AFTER_EOF` {#ERR_STREAM_PUSH_AFTER_EOF}

Была предпринята попытка вызвать [`stream.push()`](stream.md#readablepushchunk-encoding) после того, как в поток уже был отправлен `null` (EOF).

### `ERR_STREAM_UNABLE_TO_PIPE` {#ERR_STREAM_UNSHIFT_AFTER_END_EVENT}

Была предпринята попытка направить данные в закрытый или уничтоженный поток внутри конвейера.

### `ERR_STREAM_UNSHIFT_AFTER_END_EVENT` {#ERR_STREAM_UNSHIFT_AFTER_END_EVENT}

Была предпринята попытка вызвать [`stream.unshift()`](stream.md#readableunshiftchunk-encoding) после генерации события `'end'`.

### `ERR_STREAM_WRAP` {#ERR_STREAM_WRAP}

Предотвращает прерывание, если у `Socket` был задан строковый декодер или если декодер находится в режиме `objectMode`.

```js
const Socket = require('node:net').Socket;
const instance = new Socket();

instance.setEncoding('utf8');
```

### `ERR_STREAM_WRITE_AFTER_END` {#ERR_STREAM_WRITE_AFTER_END}

Была предпринята попытка вызвать [`stream.write()`](stream.md#writablewritechunk-encoding-callback) после вызова `stream.end()`.

### `ERR_STRING_TOO_LONG` {#ERR_STRING_TOO_LONG}

Была предпринята попытка создать строку длиннее максимально допустимой.

### `ERR_SYNTHETIC` {#ERR_SYNTHETIC}

Искусственный объект ошибки, используемый для захвата стека вызовов в диагностических отчётах.

### `ERR_SYSTEM_ERROR` {#ERR_SYSTEM_ERROR}

В процессе Node.js произошла неуточнённая системная ошибка. У объекта ошибки будет свойство-объект `err.info` с дополнительными сведениями.

### `ERR_TEST_FAILURE` {#ERR_TAP_LEXER_ERROR}

Ошибка означает провал теста. Дополнительные сведения — в свойстве `cause`. Свойство `failureType` указывает, что делал тест при сбое.

### `ERR_TLS_ALPN_CALLBACK_INVALID_RESULT` {#ERR_TLS_CERT_ALTNAME_FORMAT}

Эта ошибка выбрасывается, когда `ALPNCallback` возвращает значение, которого нет в списке ALPN-протоколов, предложенных клиентом.

### `ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS` {#ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS}

Эта ошибка выбрасывается при создании `TLSServer`, если параметры TLS содержат и `ALPNProtocols`, и `ALPNCallback`. Эти параметры взаимно исключают друг друга.

### `ERR_TLS_CERT_ALTNAME_FORMAT` {#ERR_TLS_CERT_ALTNAME_FORMAT}

Эта ошибка выбрасывается `checkServerIdentity`, если переданное пользователем свойство `subjectaltname` нарушает правила кодирования. Объекты сертификатов, созданные самим Node.js, всегда соответствуют этим правилам и никогда не вызовут такую ошибку.

### `ERR_TLS_CERT_ALTNAME_INVALID` {#ERR_TLS_CERT_ALTNAME_INVALID}

При использовании TLS имя хоста или IP-адрес удалённой стороны не совпали ни с одним из `subjectAltNames` в её сертификате.

### `ERR_TLS_DH_PARAM_SIZE` {#ERR_TLS_DH_PARAM_SIZE}

При использовании TLS параметр, предложенный для протокола согласования ключей Diffie-Hellman (`DH`), слишком мал. По умолчанию длина ключа должна быть не меньше 1024 бит, чтобы избежать уязвимостей, хотя для более надёжной защиты настоятельно рекомендуется использовать 2048 бит и больше.

### `ERR_TLS_HANDSHAKE_TIMEOUT` {#ERR_TLS_HANDSHAKE_TIMEOUT}

Время ожидания TLS/SSL-рукопожатия истекло. В этом случае сервер также должен прервать соединение.

### `ERR_TLS_INVALID_CONTEXT` {#ERR_TLS_INVALID_CONTEXT}

Контекст должен быть `SecureContext`.

### `ERR_TLS_INVALID_PROTOCOL_METHOD` {#ERR_TLS_INVALID_PROTOCOL_METHOD}

Указанный метод `secureProtocol` недопустим: неизвестен или отключён как небезопасный.

### `ERR_TLS_INVALID_PROTOCOL_VERSION` {#ERR_TLS_INVALID_PROTOCOL_VERSION}

Допустимые версии протокола TLS: `'TLSv1'`, `'TLSv1.1'` или `'TLSv1.2'`.

### `ERR_TLS_INVALID_STATE` {#ERR_TLS_INVALID_STATE}

TLS-сокет должен быть подключён и установлено безопасное соединение. Дождитесь события `secure` перед продолжением.

### `ERR_TLS_PROTOCOL_VERSION_CONFLICT` {#ERR_TLS_PROTOCOL_VERSION_CONFLICT}

Попытка установить `minVersion` или `maxVersion` протокола TLS конфликтует с явной установкой `secureProtocol`. Используйте либо один механизм, либо другой.

### `ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED` {#ERR_TLS_PSK_SET_IDENTIY_HINT_FAILED}

Не удалось установить подсказку идентичности PSK. Возможно, подсказка слишком длинная.

### `ERR_TLS_RENEGOTIATION_DISABLED` {#ERR_TLS_RENEGOTIATION_DISABLED}

Была предпринята попытка повторного согласования TLS на экземпляре сокета, где повторное согласование отключено.

### `ERR_TLS_REQUIRED_SERVER_NAME` {#ERR_TLS_REQUIRED_SERVER_NAME}

При использовании TLS метод `server.addContext()` был вызван без указания имени хоста в первом параметре.

### `ERR_TLS_SESSION_ATTACK` {#ERR_TLS_SESSION_ATTACK}

Обнаружено чрезмерное количество повторных согласований TLS, что может быть вектором для атак типа отказа в обслуживании.

### `ERR_TLS_SNI_FROM_SERVER` {#ERR_TLS_SNI_FROM_SERVER}

Была предпринята попытка передать Server Name Indication из серверного TLS-сокета, хотя это допустимо только со стороны клиента.

### `ERR_TRACE_EVENTS_CATEGORY_REQUIRED` {#ERR_TRACE_EVENTS_CATEGORY_REQUIRED}

Метод `trace_events.createTracing()` требует хотя бы одну категорию трассировки.

### `ERR_TRACE_EVENTS_UNAVAILABLE` {#ERR_TRACE_EVENTS_UNAVAILABLE}

Модуль `node:trace_events` не загружен: Node.js собран с флагом `--without-v8-platform`.

### `ERR_TRAILING_JUNK_AFTER_STREAM_END` {#ERR_TRANSFORM_ALREADY_TRANSFORMING}

После конца сжатого потока обнаружены лишние данные. Эта ошибка выбрасывается, когда после завершения сжатого потока обнаруживаются дополнительные неожиданные данные (например, при распаковке zlib или gzip).

### `ERR_TRANSFORM_ALREADY_TRANSFORMING` {#ERR_TRANSFORM_ALREADY_TRANSFORMING}

Поток `Transform` завершился, пока ещё выполнял преобразование.

### `ERR_TRANSFORM_WITH_LENGTH_0` {#ERR_TRANSFORM_WITH_LENGTH_0}

Поток `Transform` завершился, хотя в буфере записи ещё оставались данные.

### `ERR_TTY_INIT_FAILED` {#ERR_TTY_INIT_FAILED}

Инициализация TTY не удалась из‑за системной ошибки.

### `ERR_UNAVAILABLE_DURING_EXIT` {#ERR_UNAVAILABLE_DURING_EXIT}

Функция была вызвана внутри обработчика [`process.on('exit')`](process.md#event-exit), где её вызывать нельзя.

### `ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET` {#ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET}

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) был вызван дважды без предварительного сброса callback в `null`.

Эта ошибка предотвращает случайную перезапись колбэка, зарегистрированного другим модулем.

### `ERR_UNESCAPED_CHARACTERS` {#ERR_UNESCAPED_CHARACTERS}

Была получена строка с неэкранированными символами.

### `ERR_UNHANDLED_ERROR` {#ERR_UNHANDLED_ERROR}

Произошла необработанная ошибка (например, когда [`EventEmitter`](events.md#class-eventemitter) генерирует событие `'error'`, но обработчик `'error'` не зарегистрирован).

### `ERR_UNKNOWN_BUILTIN_MODULE` {#ERR_UNKNOWN_BUILTIN_MODULE}

Используется для обозначения определённого вида внутренней ошибки Node.js, которая обычно не должна вызываться пользовательским кодом. Экземпляры этой ошибки указывают на внутреннюю ошибку в самом бинарном файле Node.js.

### `ERR_UNKNOWN_CREDENTIAL` {#ERR_UNKNOWN_CREDENTIAL}

Был передан идентификатор Unix-группы или пользователя, который не существует.

### `ERR_UNKNOWN_ENCODING` {#ERR_UNKNOWN_ENCODING}

В API был передан недопустимый или неизвестный параметр кодировки.

### `ERR_UNKNOWN_FILE_EXTENSION` {#ERR_UNKNOWN_FILE_EXTENSION}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка загрузить модуль с неизвестным или неподдерживаемым расширением файла.

### `ERR_UNKNOWN_MODULE_FORMAT` {#ERR_UNKNOWN_MODULE_FORMAT}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка загрузить модуль с неизвестным или неподдерживаемым форматом.

### `ERR_UNKNOWN_SIGNAL` {#ERR_UNKNOWN_SIGNAL}

В API, ожидающий допустимый сигнал процесса (например, [`subprocess.kill()`](child_process.md#subprocesskillsignal)), был передан недопустимый или неизвестный сигнал.

### `ERR_UNSUPPORTED_DIR_IMPORT` {#ERR_UNSUPPORTED_DIR_IMPORT}

`import` URL каталога не поддерживается. Вместо этого [сошлитесь на пакет по его имени](packages.md#self-referencing-a-package-using-its-name) и [определите пользовательский подпуть](packages.md#subpath-exports) в поле [`"exports"`](packages.md#exports) файла [`package.json`](packages.md#nodejs-packagejson-field-definitions).

```js
import './'; // unsupported
import './index.js'; // supported
import 'package-name'; // supported
```

### `ERR_UNSUPPORTED_ESM_URL_SCHEME` {#ERR_UNSUPPORTED_ESM_URL_SCHEME}

`import` с URL-схемами, отличными от `file` и `data`, не поддерживается.

### `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` {#ERR_USE_AFTER_CLOSE}

Удаление типов не поддерживается для файлов, находящихся внутри каталога `node_modules`.

### `ERR_UNSUPPORTED_RESOLVE_REQUEST` {#ERR_UNSUPPORTED_RESOLVE_REQUEST}

Была предпринята попытка разрешить недопустимый источник ссылки на модуль. Это может произойти при импорте или вызове `import.meta.resolve()` в одном из случаев:

-   голый спецификатор, который не является встроенным модулем, из модуля, чья URL-схема не равна `file`;
-   [относительный URL](https://url.spec.whatwg.org/#relative-url-string) из модуля, чья URL-схема не является [специальной схемой](https://url.spec.whatwg.org/#special-scheme).

=== "MJS"

    ```js
    try {
      // Trying to import the package 'bare-specifier' from a `data:` URL module:
      await import('data:text/javascript,import "bare-specifier"');
    } catch (e) {
      console.log(e.code); // ERR_UNSUPPORTED_RESOLVE_REQUEST
    }
    ```

### `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` {#ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX}

Указанный синтаксис TypeScript не поддерживается. Это может произойти при использовании синтаксиса TypeScript, который требует преобразования с помощью [удаления типов](typescript.md#type-stripping).

### `ERR_USE_AFTER_CLOSE` {#ERR_USE_AFTER_CLOSE}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка использовать объект, который уже закрыт.

### `ERR_VALID_PERFORMANCE_ENTRY_TYPE` {#ERR_VALID_PERFORMANCE_ENTRY_TYPE}

При использовании API измерения производительности (`perf_hooks`) не найдено допустимых типов записей производительности.

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` {#ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING}

Не был указан обратный вызов динамического импорта.

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG` {#ERR_VM_MODULE_ALREADY_LINKED}

Обратный вызов динамического импорта был вызван без `--experimental-vm-modules`.

### `ERR_VM_MODULE_ALREADY_LINKED` {#ERR_VM_MODULE_ALREADY_LINKED}

Модуль, который пытались связать, не подходит для связывания по одной из следующих причин:

-   Он уже связан (`linkingStatus` равен `'linked'`)
-   Он находится в процессе связывания (`linkingStatus` равен `'linking'`)
-   Для этого модуля связывание завершилось ошибкой (`linkingStatus` равен `'errored'`)

### `ERR_VM_MODULE_CACHED_DATA_REJECTED` {#ERR_VM_MODULE_CACHED_DATA_REJECTED}

Параметр `cachedData`, переданный конструктору модуля, недопустим.

### `ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA` {#ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA}

Кэшированные данные нельзя создать для модулей, которые уже были вычислены.

### `ERR_VM_MODULE_DIFFERENT_CONTEXT` {#ERR_VM_MODULE_DIFFERENT_CONTEXT}

Модуль, возвращаемый функцией связывания, принадлежит другому контексту, чем родительский модуль. Связанные модули должны находиться в одном и том же контексте.

### `ERR_VM_MODULE_LINK_FAILURE` {#ERR_VM_MODULE_LINK_FAILURE}

Модуль не удалось связать из-за ошибки.

### `ERR_VM_MODULE_NOT_MODULE` {#ERR_VM_MODULE_NOT_MODULE}

Значение успешно выполненного промиса связывания не является объектом `vm.Module`.

### `ERR_VM_MODULE_STATUS` {#ERR_VM_MODULE_STATUS}

Текущий статус модуля не допускает эту операцию. Точное значение ошибки зависит от конкретной функции.

### `ERR_WASI_ALREADY_STARTED` {#ERR_WASI_ALREADY_STARTED}

Экземпляр WASI уже запущен.

### `ERR_WASI_NOT_STARTED` {#ERR_WASI_NOT_STARTED}

Экземпляр WASI не был запущен.

### `ERR_WEBASSEMBLY_NOT_SUPPORTED` {#ERR_WEBASSEMBLY_RESPONSE}

Была использована возможность, требующая WebAssembly, но WebAssembly не поддерживается или отключён в текущем окружении (например, при запуске с `--jitless`).

### `ERR_WEBASSEMBLY_RESPONSE` {#ERR_WEBASSEMBLY_RESPONSE}

`Response`, переданный в `WebAssembly.compileStreaming` или `WebAssembly.instantiateStreaming`, не является корректным ответом WebAssembly.

### `ERR_WORKER_INIT_FAILED` {#ERR_WORKER_INIT_FAILED}

Инициализация `Worker` не удалась.

### `ERR_WORKER_INVALID_EXEC_ARGV` {#ERR_WORKER_INVALID_EXEC_ARGV}

Опция `execArgv` в конструкторе `Worker` содержит недопустимые флаги.

### `ERR_WORKER_MESSAGING_ERRORED` {#ERR_WORKER_NOT_RUNNING}

!!!warning "Стабильность: 1.1 - Активная разработка"

В потоке назначения произошла ошибка при обработке сообщения, отправленного через [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout).

### `ERR_WORKER_MESSAGING_FAILED` {#ERR_WORKER_MESSAGING_FAILED}

!!!warning "Стабильность: 1.1 - Активная разработка"

Поток, указанный в [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout), недопустим или у него нет обработчика `workerMessage`.

### `ERR_WORKER_MESSAGING_SAME_THREAD` {#ERR_WORKER_MESSAGING_SAME_THREAD}

!!!warning "Стабильность: 1.1 - Активная разработка"

Запрошенный в [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout) идентификатор потока совпадает с текущим.

### `ERR_WORKER_MESSAGING_TIMEOUT` {#ERR_WORKER_MESSAGING_TIMEOUT}

!!!warning "Стабильность: 1.1 - Активная разработка"

Время ожидания отправки сообщения через [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout) истекло.

### `ERR_WORKER_NOT_RUNNING` {#ERR_WORKER_NOT_RUNNING}

Операция завершилась неудачей, потому что экземпляр `Worker` сейчас не запущен.

### `ERR_WORKER_OUT_OF_MEMORY` {#ERR_WORKER_OUT_OF_MEMORY}

Экземпляр `Worker` завершён из‑за достижения лимита памяти.

### `ERR_WORKER_PATH` {#ERR_WORKER_PATH}

Путь к основному скрипту потока worker не является ни абсолютным, ни относительным с `./` или `../`.

### `ERR_WORKER_UNSERIALIZABLE_ERROR` {#ERR_WORKER_UNSERIALIZABLE_ERROR}

Все попытки сериализовать неперехваченное исключение из потока worker завершились неудачей.

### `ERR_WORKER_UNSUPPORTED_OPERATION` {#ERR_WORKER_UNSUPPORTED_OPERATION}

Запрошенная возможность не поддерживается в потоках worker.

### `ERR_ZLIB_INITIALIZATION_FAILED` {#ERR_ZLIB_INITIALIZATION_FAILED}

Не удалось создать объект [`zlib`](zlib.md) из-за неверной конфигурации.

### `ERR_ZSTD_INVALID_PARAM` {#HPE_HEADER_OVERFLOW}

При создании потока Zstd был передан недопустимый ключ параметра.

### `HPE_CHUNK_EXTENSIONS_OVERFLOW` {#HPE_CHUNK_EXTENSIONS_OVERFLOW}

Было получено слишком много данных для расширений чанка. Чтобы защититься от вредоносных или неверно настроенных клиентов, при получении более 16 КиБ данных генерируется `Error` с этим кодом.

### `HPE_HEADER_OVERFLOW` {#HPE_HEADER_OVERFLOW}

Было получено слишком много данных HTTP-заголовков. Чтобы защититься от вредоносных или неверно настроенных клиентов, при получении более 8 КиБ данных заголовков разбор HTTP прерывается без создания объекта запроса или ответа, и генерируется `Error` с этим кодом.

### `HPE_UNEXPECTED_CONTENT_LENGTH` {#HPE_UNEXPECTED_CONTENT_LENGTH}

Сервер отправляет одновременно заголовок `Content-Length` и `Transfer-Encoding: chunked`.

`Transfer-Encoding: chunked` позволяет серверу поддерживать постоянное HTTP-соединение для динамически генерируемого содержимого. В этом случае заголовок HTTP `Content-Length` использовать нельзя.

Используйте `Content-Length` или `Transfer-Encoding: chunked`.

### `MODULE_NOT_FOUND` {#MODULE_NOT_FOUND}

Загрузчик модулей CommonJS не смог разрешить файл модуля при попытке выполнить операцию [`require()`](modules.md#requireid) или при загрузке точки входа программы.

## Устаревшие коды ошибок Node.js

> Стабильность: 0 — устарело. Эти коды либо непоследовательны, либо удалены.

### `ERR_CANNOT_TRANSFER_OBJECT` {#ERR_CANNOT_TRANSFER_OBJECT}

В `postMessage()` передан объект, перенос которого не поддерживается.

### `ERR_CPU_USAGE` {#ERR_CPU_USAGE}

Не удалось обработать нативный вызов из `process.cpuUsage`.

### `ERR_CRYPTO_HASH_DIGEST_NO_UTF16` {#ERR_CRYPTO_HASH_DIGEST_NO_UTF16}

С [`hash.digest()`](crypto.md#hashdigestencoding) использована кодировка UTF-16. Хотя `hash.digest()` может принимать аргумент `encoding` и возвращать строку вместо `Buffer`, кодировки UTF-16 (например `ucs` или `utf16le`) не поддерживаются.

### `ERR_CRYPTO_SCRYPT_INVALID_PARAMETER` {#ERR_CRYPTO_SCRYPT_INVALID_PARAMETER}

В [`crypto.scrypt()`](crypto.md#cryptoscryptpassword-salt-keylen-options-callback) или [`crypto.scryptSync()`](crypto.md#cryptoscryptsyncpassword-salt-keylen-options) была передана несовместимая комбинация параметров. В новых версиях Node.js вместо этого используется код ошибки [`ERR_INCOMPATIBLE_OPTION_PAIR`](#err_incompatible_option_pair), что согласуется с другими API.

### `ERR_FS_INVALID_SYMLINK_TYPE` {#ERR_FS_INVALID_SYMLINK_TYPE}

В методы [`fs.symlink()`](fs.md#fssymlinktarget-path-type-callback) или [`fs.symlinkSync()`](fs.md#fssymlinksynctarget-path-type) был передан недопустимый тип симлинка.

### `ERR_HTTP2_FRAME_ERROR` {#ERR_HTTP2_FRAME_ERROR}

Используется, когда происходит сбой при отправке отдельного кадра в HTTP/2-сессии.

### `ERR_HTTP2_HEADERS_OBJECT` {#ERR_HTTP2_HEADERS_OBJECT}

Используется, когда ожидается объект заголовков HTTP/2.

### `ERR_HTTP2_HEADER_REQUIRED` {#ERR_HTTP2_HEADER_REQUIRED}

Используется, когда в сообщении HTTP/2 отсутствует обязательный заголовок.

### `ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND` {#ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND}

Информационные заголовки HTTP/2 можно отправлять только _до_ вызова метода `Http2Stream.prototype.respond()`.

### `ERR_HTTP2_STREAM_CLOSED` {#ERR_HTTP2_STREAM_CLOSED}

Используется, когда действие выполняется над потоком HTTP/2, который уже закрыт.

### `ERR_HTTP_INVALID_CHAR` {#ERR_HTTP_INVALID_CHAR}

Используется, когда в сообщении о статусе HTTP-ответа (reason phrase) обнаружен недопустимый символ.

### `ERR_IMPORT_ASSERTION_TYPE_FAILED` {#ERR_IMPORT_ASSERTION_TYPE_FAILED}

Проверка import assertion завершилась неудачей, из-за чего указанный модуль нельзя импортировать.

### `ERR_IMPORT_ASSERTION_TYPE_MISSING` {#ERR_IMPORT_ASSERTION_TYPE_MISSING}

Отсутствует import assertion, из-за чего указанный модуль нельзя импортировать.

### `ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED` {#ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED}

Атрибут импорта не поддерживается этой версией Node.js.

### `ERR_INDEX_OUT_OF_RANGE` {#ERR_INDEX_OUT_OF_RANGE}

Заданный индекс выходил за пределы допустимого диапазона (например, отрицательные смещения).

### `ERR_INVALID_OPT_VALUE` {#ERR_INVALID_OPT_VALUE}

В объекте параметров было передано недопустимое или неожиданное значение.

### `ERR_INVALID_OPT_VALUE_ENCODING` {#ERR_INVALID_OPT_VALUE_ENCODING}

Была передана недопустимая или неизвестная кодировка файла.

### `ERR_INVALID_PERFORMANCE_MARK` {#ERR_INVALID_PERFORMANCE_MARK}

При использовании API измерения производительности (`perf_hooks`) метка производительности оказалась недопустимой.

### `ERR_INVALID_TRANSFER_OBJECT` {#ERR_INVALID_TRANSFER_OBJECT}

В `postMessage()` был передан недопустимый переносимый объект.

### `ERR_MANIFEST_ASSERT_INTEGRITY` {#ERR_MANIFEST_ASSERT_INTEGRITY}

Была предпринята попытка загрузить ресурс, но он не соответствовал целостности, заданной манифестом политики. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_DEPENDENCY_MISSING` {#ERR_MANIFEST_DEPENDENCY_MISSING}

Была предпринята попытка загрузить ресурс, но он не был указан как зависимость из места, откуда выполнялась загрузка. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_INTEGRITY_MISMATCH` {#ERR_MANIFEST_INTEGRITY_MISMATCH}

Была предпринята попытка загрузить манифест политики, но в нём оказалось несколько записей для одного ресурса, которые не совпадали между собой. Приведите записи манифеста к совпадающему виду, чтобы устранить эту ошибку. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_INVALID_RESOURCE_FIELD` {#ERR_MANIFEST_INVALID_RESOURCE_FIELD}

Ресурс манифеста политики имел недопустимое значение в одном из полей. Исправьте запись манифеста, чтобы устранить эту ошибку. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_INVALID_SPECIFIER` {#ERR_MANIFEST_INVALID_SPECIFIER}

Ресурс манифеста политики имел недопустимое значение в одном из отображений зависимостей. Исправьте запись манифеста, чтобы устранить эту ошибку. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_PARSE_POLICY` {#ERR_MANIFEST_PARSE_POLICY}

Была предпринята попытка загрузить манифест политики, но его не удалось разобрать. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_TDZ` {#ERR_MANIFEST_TDZ}

Была предпринята попытка прочитать манифест политики, но его инициализация ещё не произошла. Вероятно, это ошибка в Node.js.

### `ERR_MANIFEST_UNKNOWN_ONERROR` {#ERR_MANIFEST_UNKNOWN_ONERROR}

Манифест политики был загружен, но содержал неизвестное значение для поведения `"onerror"`. Подробнее см. документацию по манифестам политики.

### `ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST` {#err_missing_message_port_in_transfer_list}

Этот код ошибки заменён на [`ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`](#err_missing_transferable_in_transfer_list) в Node.js 15.0.0: старое название больше не отражает ситуацию, так как появились и другие переносимые типы.

### `ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST` {#err_missing_transferable_in_transfer_list}

Добавлено в: v15.0.0

Объект, который должен быть явно указан в аргументе `transferList`, находится в объекте, переданном вызову [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist), но не указан в `transferList` для этого вызова. Обычно это `MessagePort`.

В версиях Node.js до v15.0.0 здесь использовался код ошибки [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](#err_missing_message_port_in_transfer_list). Однако набор переносимых типов объектов был расширен и теперь охватывает больше типов, чем только `MessagePort`.

### `ERR_NAPI_CONS_PROTOTYPE_OBJECT` {#ERR_NAPI_CONS_PROTOTYPE_OBJECT}

Используется `Node-API`, когда `Constructor.prototype` не является объектом.

### `ERR_NAPI_TSFN_START_IDLE_LOOP` {#ERR_NAPI_TSFN_START_IDLE_LOOP}

В основном потоке значения удаляются из очереди, связанной с потокобезопасной функцией, в цикле ожидания. Эта ошибка означает, что при попытке запустить этот цикл произошёл сбой.

### `ERR_NAPI_TSFN_STOP_IDLE_LOOP` {#ERR_NAPI_TSFN_STOP_IDLE_LOOP}

Когда в очереди больше не остаётся элементов, цикл ожидания должен быть приостановлен. Эта ошибка означает, что цикл ожидания не смог остановиться.

### `ERR_NO_LONGER_SUPPORTED` {#ERR_NO_LONGER_SUPPORTED}

API Node.js был вызван неподдерживаемым способом, например `Buffer.write(string, encoding, offset[, length])`.

### `ERR_OUTOFMEMORY` {#ERR_OUTOFMEMORY}

Используется как общий код для обозначения того, что операция привела к состоянию нехватки памяти.

### `ERR_PARSE_HISTORY_DATA` {#ERR_PARSE_HISTORY_DATA}

Модулю `node:repl` не удалось разобрать данные из файла истории REPL.

### `ERR_SOCKET_CANNOT_SEND` {#ERR_SOCKET_CANNOT_SEND}

Не удалось отправить данные через сокет.

### `ERR_STDERR_CLOSE` {#ERR_STDERR_CLOSE}

Была предпринята попытка закрыть поток `process.stderr`. По замыслу Node.js пользовательскому коду не разрешается закрывать потоки `stdout` или `stderr`.

### `ERR_STDOUT_CLOSE` {#ERR_STDOUT_CLOSE}

Была предпринята попытка закрыть поток `process.stdout`. По замыслу Node.js пользовательскому коду не разрешается закрывать потоки `stdout` или `stderr`.

### `ERR_STREAM_READ_NOT_IMPLEMENTED` {#ERR_STREAM_READ_NOT_IMPLEMENTED}

Используется, когда предпринимается попытка использовать читаемый поток, в котором не реализован [`readable._read()`](stream.md#readable_readsize).

### `ERR_TAP_LEXER_ERROR` {#ERR_TAP_LEXER_ERROR}

Ошибка, представляющая неуспешное состояние лексера.

### `ERR_TAP_PARSER_ERROR` {#ERR_TAP_PARSER_ERROR}

Ошибка, представляющая неуспешное состояние парсера. Дополнительные сведения о токене, вызвавшем ошибку, доступны через свойство `cause`.

### `ERR_TAP_VALIDATION_ERROR` {#ERR_TAP_VALIDATION_ERROR}

Ошибка означает провал проверки TAP.

### `ERR_TLS_RENEGOTIATION_FAILED` {#ERR_TLS_RENEGOTIATION_FAILED}

Используется, когда запрос на повторное согласование TLS завершился неудачей по неуточнённой причине.

### `ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER` {#ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER}

Во время сериализации встретился `SharedArrayBuffer`, память которого не управляется движком JavaScript или Node.js. Такой `SharedArrayBuffer` нельзя сериализовать.

Это возможно только если нативные аддоны создают `SharedArrayBuffer` в режиме «externalized» или переводят существующий `SharedArrayBuffer` в этот режим.

### `ERR_UNKNOWN_STDIN_TYPE` {#ERR_UNKNOWN_STDIN_TYPE}

Была предпринята попытка запустить процесс Node.js с неизвестным типом файла `stdin`. Обычно эта ошибка указывает на сбой в самом Node.js, хотя её может спровоцировать и пользовательский код.

### `ERR_UNKNOWN_STREAM_TYPE` {#ERR_UNKNOWN_STREAM_TYPE}

Была предпринята попытка запустить процесс Node.js с неизвестным типом файла `stdout` или `stderr`. Обычно эта ошибка указывает на сбой в самом Node.js, хотя её может спровоцировать и пользовательский код.

### `ERR_V8BREAKITERATOR` {#ERR_V8BREAKITERATOR}

Использован API V8 `BreakIterator`, но полный набор данных ICU не установлен.

### `ERR_VALUE_OUT_OF_RANGE` {#ERR_VALUE_OUT_OF_RANGE}

Используется, когда переданное значение выходит за пределы допустимого диапазона.

### `ERR_VM_MODULE_LINKING_ERRORED` {#ERR_VM_MODULE_LINKING_ERRORED}

Функция связывания вернула модуль, для которого связывание не удалось.

### `ERR_VM_MODULE_NOT_LINKED` {#ERR_VM_MODULE_NOT_LINKED}

Модуль должен быть успешно связан до инстанцирования.

### `ERR_WORKER_UNSUPPORTED_EXTENSION` {#ERR_WORKER_UNSUPPORTED_EXTENSION}

Путь к основному скрипту потока worker имеет неизвестное расширение файла.

### `ERR_ZLIB_BINDING_CLOSED` {#ERR_ZLIB_BINDING_CLOSED}

Используется, когда предпринимается попытка использовать объект `zlib` после того, как он уже закрыт.

## Коды ошибок OpenSSL {#openssl-error-codes}

### Ошибки срока действия {#Time Validity Errors}

#### `CERT_NOT_YET_VALID` {#CERT_NOT_YET_VALID}

Сертификат ещё не действителен: дата notBefore позже текущего времени.

#### `CERT_HAS_EXPIRED` {#CERT_HAS_EXPIRED}

Срок действия сертификата истёк: дата notAfter раньше текущего времени.

#### `CRL_NOT_YET_VALID` {#CRL_NOT_YET_VALID}

Список отзыва сертификатов (CRL) имеет дату выпуска в будущем.

#### `CRL_HAS_EXPIRED` {#CRL_HAS_EXPIRED}

Срок действия списка отзыва сертификатов (CRL) истёк.

#### `CERT_REVOKED` {#CERT_REVOKED}

Сертификат отозван; он есть в списке отзыва (CRL).

### Ошибки доверия или цепочки сертификатов {#Trust or Chain Related Errors}

#### `UNABLE_TO_GET_ISSUER_CERT` {#UNABLE_TO_GET_ISSUER_CERT}

Сертификат издателя для найденного сертификата не найден. Обычно это значит, что список доверенных сертификатов неполон.

#### `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` {#UNABLE_TO_GET_ISSUER_CERT_LOCALLY}

Издатель сертификата неизвестен. Так бывает, если издатель не входит в список доверенных сертификатов.

#### `DEPTH_ZERO_SELF_SIGNED_CERT` {#DEPTH_ZERO_SELF_SIGNED_CERT}

Переданный сертификат самоподписанный, и тот же сертификат не найден в списке доверенных сертификатов.

#### `SELF_SIGNED_CERT_IN_CHAIN` {#SELF_SIGNED_CERT_IN_CHAIN}

Издатель сертификата неизвестен. Так бывает, если издатель не входит в список доверенных сертификатов.

#### `CERT_CHAIN_TOO_LONG` {#CERT_CHAIN_TOO_LONG}

Длина цепочки сертификатов больше максимальной глубины.

#### `UNABLE_TO_GET_CRL` {#UNABLE_TO_GET_CRL}

Не найдена ссылка на CRL из сертификата.

#### `UNABLE_TO_VERIFY_LEAF_SIGNATURE` {#UNABLE_TO_VERIFY_LEAF_SIGNATURE}

Подписи проверить нельзя: в цепочке только один сертификат, и он не самоподписанный.

#### `CERT_UNTRUSTED` {#CERT_UNTRUSTED}

Корневой центр сертификации (CA) не помечен как доверенный для указанной цели.

### Ошибки базовых расширений {#Basic Extension Errors}

#### `INVALID_CA` {#INVALID_CA}

Сертификат CA недопустим: это не CA или расширения не соответствуют цели.

#### `PATH_LENGTH_EXCEEDED` {#PATH_LENGTH_EXCEEDED}

Превышено значение параметра `pathlength` в `basicConstraints`.

### Ошибки, связанные с именами {#Name Related Errors}

#### `HOSTNAME_MISMATCH` {#HOSTNAME_MISMATCH}

Сертификат не соответствует указанному имени.

### Ошибки использования и политики {#Usage and Policy Errors}

#### `INVALID_PURPOSE` {#INVALID_PURPOSE}

Предоставленный сертификат нельзя использовать для указанной цели.

#### `CERT_REJECTED` {#CERT_REJECTED}

Корневой CA помечен как отклоняющий указанную цель.

### Ошибки форматирования {#Formatting Errors}

#### `CERT_SIGNATURE_FAILURE` {#CERT_SIGNATURE_FAILURE}

Подпись сертификата недействительна.

#### `CRL_SIGNATURE_FAILURE` {#CRL_SIGNATURE_FAILURE}

Подпись списка отзыва сертификатов (CRL) недействительна.

#### `ERROR_IN_CERT_NOT_BEFORE_FIELD` {#ERROR_IN_CERT_NOT_BEFORE_FIELD}

Поле `notBefore` сертификата содержит недопустимое время.

#### `ERROR_IN_CERT_NOT_AFTER_FIELD` {#ERROR_IN_CERT_NOT_AFTER_FIELD}

Поле `notAfter` сертификата содержит недопустимое время.

#### `ERROR_IN_CRL_LAST_UPDATE_FIELD` {#ERROR_IN_CRL_LAST_UPDATE_FIELD}

Поле `lastUpdate` списка отзыва сертификатов (CRL) содержит недопустимое время.

#### `ERROR_IN_CRL_NEXT_UPDATE_FIELD` {#ERROR_IN_CRL_NEXT_UPDATE_FIELD}

Поле `nextUpdate` списка отзыва сертификатов (CRL) содержит недопустимое время.

#### `UNABLE_TO_DECRYPT_CERT_SIGNATURE` {#UNABLE_TO_DECRYPT_CERT_SIGNATURE}

Не удалось расшифровать подпись сертификата. Это означает, что фактическое значение подписи не удалось определить, а не то, что оно не совпало с ожидаемым значением; это имеет смысл только для ключей RSA.

#### `UNABLE_TO_DECRYPT_CRL_SIGNATURE` {#UNABLE_TO_DECRYPT_CRL_SIGNATURE}

Не удалось расшифровать подпись списка отзыва сертификатов (CRL): это означает, что фактическое значение подписи не удалось определить, а не то, что оно не совпало с ожидаемым значением.

#### `UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY` {#UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY}

Не удалось прочитать открытый ключ из `SubjectPublicKeyInfo` сертификата.

### Другие ошибки OpenSSL {#Other OpenSSL Errors}

#### `OUT_OF_MEM` {#OUT_OF_MEM}

Произошла ошибка при попытке выделить память. Этого не должно происходить.
