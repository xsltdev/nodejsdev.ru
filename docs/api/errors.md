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

## Класс: `Error` {#class-error}

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

-   Наследует: [`<errors.Error>`](errors.md#class-error)

Означает сбой проверки утверждения. Подробнее см. [`Class: assert.AssertionError`](assert.md#class-assertassertionerror).

## Класс: `RangeError`

-   Наследует: [`<errors.Error>`](errors.md#class-error)

Указывает, что переданный аргумент вне допустимого набора или диапазона значений функции — будь то числовой диапазон или набор допустимых вариантов параметра.

```js
require('node:net').connect(-1);
// Throws "RangeError: "port" option should be >= 0 and < 65536: -1"
```

Node.js создаёт и выбрасывает `RangeError` _сразу_ как часть проверки аргументов.

## Класс: `ReferenceError`

-   Наследует: [`<errors.Error>`](errors.md#class-error)

Указывает на обращение к необъявленной переменной. Часто это опечатки или иная поломка программы.

Прикладной код теоретически может порождать такие ошибки, но на практике их выдаёт только V8.

```js
doesNotExist;
// Throws ReferenceError, doesNotExist is not a variable in this program.
```

Если приложение не генерирует и не выполняет код динамически, экземпляры `ReferenceError` указывают на ошибку в коде или зависимостях.

## Класс: `SyntaxError`

-   Наследует: [`<errors.Error>`](errors.md#class-error)

Указывает, что программа не является допустимым JavaScript. Такие ошибки возникают и распространяются только при вычислении кода — через `eval`, `Function`, `require` или [vm](vm.md). Почти всегда это признак поломанной программы.

```js
try {
    require('node:vm').runInThisContext('binary ! isNotOk');
} catch (err) {
    // 'err' will be a SyntaxError.
}
```

Экземпляры `SyntaxError` в контексте, где они созданы, не исправить — их может перехватить только другой контекст.

## Класс: `SystemError` {#class-systemerror}

-   Наследует: [`<errors.Error>`](errors.md#class-error)

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

### Типичные системные ошибки {#common-system-errors}

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

## Класс: `TypeError` {#class-typeerror}

-   Наследует: [`<errors.Error>`](errors.md#class-error)

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

### `ABORT_ERR` {#abort_err}

Используется, когда операция была прервана (обычно с помощью `AbortController`).

API, _не_ использующие `AbortSignal`, обычно не выдают ошибку с этим кодом.

Этот код не использует обычное соглашение `ERR_*`, которое используется в ошибках Node.js, чтобы быть совместимым с `AbortError` веб-платформы.

### `ERR_ACCESS_DENIED` {#err_access_denied}

Специальный тип ошибки, возникающий всякий раз, когда Node.js пытается получить доступ к ресурсу, ограниченному [моделью разрешений](permissions.md#permission-model).

### `ERR_AMBIGUOUS_ARGUMENT` {#err_ambiguous_argument}

Аргумент функции используется таким образом, что подпись функции может быть неправильно понята. Модуль `node:assert` выбрасывает это сообщение, когда параметр `message` в `assert.throws(block, message)` совпадает с сообщением об ошибке, выброшенным `block`, поскольку такое использование предполагает, что пользователь считает `message` ожидаемым сообщением, а не сообщением, которое отобразит `AssertionError`, если `block` не выбросит сообщение.

### `ERR_ARG_NOT_ITERABLE` {#err_arg_not_iterable}

Требовался итерируемый аргумент (то есть значение, работающее с циклами `for...of`), но API Node.js его не получил.

### `ERR_ASSERTION` {#err_assertion}

Специальный тип ошибки, который может быть вызван всякий раз, когда Node.js обнаруживает исключительное нарушение логики, которое никогда не должно происходить. Обычно их вызывает модуль `node:assert`.

### `ERR_ASYNC_CALLBACK` {#err_async_callback}

Была предпринята попытка зарегистрировать что-то, что не является функцией, в качестве обратного вызова `AsyncHooks`.

### `ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED` {#err_async_loader_request_never_settled}

Операция, связанная с загрузкой модулей, переопределена асинхронным хуком загрузчика, который не завершил промис до выхода потока загрузчика.

### `ERR_ASYNC_TYPE` {#err_async_type}

Тип асинхронного ресурса был неверным. Пользователи также могут определять собственные типы при использовании общедоступного API встраивания.

### `ERR_BROTLI_COMPRESSION_FAILED` {#err_brotli_compression_failed}

Данные, переданные в поток Brotli, не были успешно сжаты.

### `ERR_BROTLI_INVALID_PARAM` {#err_brotli_invalid_param}

При построении потока Brotli был передан недопустимый ключ параметра.

### `ERR_BUFFER_CONTEXT_NOT_AVAILABLE` {#err_buffer_context_not_available}

Была предпринята попытка создать экземпляр Node.js `Buffer` из кода аддона или встраивающего окружения, находясь в контексте JS-движка, который не связан с экземпляром Node.js. Данные, переданные в метод `Buffer`, будут освобождены к моменту возврата метода.

При возникновении этой ошибки возможной альтернативой созданию экземпляра `Buffer` является создание обычного `Uint8Array`, который отличается только прототипом получаемого объекта. `Uint8Array` общеприняты во всех основных API Node.js, где есть `Buffer`; они доступны во всех контекстах.

### `ERR_BUFFER_OUT_OF_BOUNDS` {#err_buffer_out_of_bounds}

Была предпринята попытка выполнить операцию, выходящую за пределы `Buffer`.

### `ERR_BUFFER_TOO_LARGE` {#err_buffer_too_large}

Была предпринята попытка создать `Буфер` большего размера, чем максимально допустимый.

### `ERR_CANNOT_WATCH_SIGINT` {#err_cannot_watch_sigint}

Node.js не смог проследить за сигналом `SIGINT`.

### `ERR_CHILD_CLOSED_BEFORE_REPLY` {#err_child_closed_before_reply}

Дочерний процесс был закрыт до того, как родительский процесс получил ответ.

### `ERR_CHILD_PROCESS_IPC_REQUIRED` {#err_child_process_ipc_required}

Используется, когда дочерний процесс форкируется без указания IPC-канала.

### `ERR_CHILD_PROCESS_STDIO_MAXBUFFER` {#err_child_process_stdio_maxbuffer}

Используется, когда основной процесс пытается прочитать данные из STDERR/STDOUT дочернего процесса, и длина данных превышает параметр `maxBuffer`.

### `ERR_CLOSED_MESSAGE_PORT` {#err_closed_message_port}

Добавлено в: v10.5.0

Была попытка использовать экземпляр `MessagePort` в закрытом состоянии, обычно после вызова `.close()`.

### `ERR_CONSOLE_WRITABLE_STREAM` {#err_console_writable_stream}

`Console` была создана без потока `stdout`, или `Console` имеет незаписываемый поток `stdout` или `stderr`.

### `ERR_CONSTRUCT_CALL_INVALID` {#err_construct_call_invalid}

Был вызван конструктор класса, который не является вызываемым.

### `ERR_CONSTRUCT_CALL_REQUIRED` {#err_construct_call_required}

Конструктор для класса был вызван без `new`.

### `ERR_CONTEXT_NOT_INITIALIZED` {#err_context_not_initialized}

Контекст vm, переданный в API, еще не инициализирован. Это может произойти, если во время создания контекста произошла (и была поймана) ошибка, например, если при создании контекста произошел сбой выделения или был достигнут максимальный размер стека вызовов.

### `ERR_CPU_PROFILE_ALREADY_STARTED` {#err_cpu_profile_already_started}

Профиль CPU с указанным именем уже запущен.

### `ERR_CPU_PROFILE_NOT_STARTED` {#err_cpu_profile_not_started}

Профиль CPU с указанным именем не запущен.

### `ERR_CPU_PROFILE_TOO_MANY` {#err_cpu_profile_too_many}

Собирается слишком много профилей CPU.

### `ERR_CRYPTO_ARGON2_NOT_SUPPORTED` {#err_crypto_argon2_not_supported}

Argon2 не поддерживается используемой версией OpenSSL.

### `ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED` {#err_crypto_custom_engine_not_supported}

Был запрошен механизм клиентского сертификата, который не поддерживается используемой версией OpenSSL.

### `ERR_CRYPTO_ECDH_INVALID_FORMAT` {#err_crypto_ecdh_invalid_format}

В метод `getPublicKey()` класса `crypto.ECDH()` было передано недопустимое значение аргумента `format`.

### `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY` {#err_crypto_ecdh_invalid_public_key}

В метод `crypto.ECDH()` класса `computeSecret()` было передано недопустимое значение аргумента `key`. Это означает, что открытый ключ лежит за пределами эллиптической кривой.

### `ERR_CRYPTO_ENGINE_UNKNOWN` {#err_crypto_engine_unknown}

В [`require('node:crypto').setEngine()`](crypto.md#cryptosetengineengine-flags) был передан неверный идентификатор криптографического движка.

### `ERR_CRYPTO_FIPS_FORCED` {#err_crypto_fips_forced}

Был использован аргумент командной строки [`--force-fips`](cli.md#--force-fips), но была попытка включить или отключить режим FIPS в модуле `node:crypto`.

### `ERR_CRYPTO_FIPS_UNAVAILABLE` {#err_crypto_fips_unavailable}

Была предпринята попытка включить или отключить режим FIPS, но режим FIPS был недоступен.

### `ERR_CRYPTO_HASH_FINALIZED` {#err_crypto_hash_finalized}

[`hash.digest()`](crypto.md#hashdigestencoding) был вызван несколько раз. Метод `hash.digest()` должен вызываться не более одного раза для каждого экземпляра объекта `Hash`.

### `ERR_CRYPTO_HASH_UPDATE_FAILED` {#err_crypto_hash_update_failed}

[`hash.update()`](crypto.md#hashupdatedata-inputencoding) не удалось по какой-либо причине. Это должно происходить редко, если вообще происходит.

### `ERR_CRYPTO_INCOMPATIBLE_KEY` {#err_crypto_incompatible_key}

Данные криптографические ключи несовместимы с предпринимаемой операцией.

### `ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS` {#err_crypto_incompatible_key_options}

Выбранная кодировка открытого или закрытого ключа несовместима с другими вариантами.

### `ERR_CRYPTO_INITIALIZATION_FAILED` {#err_crypto_initialization_failed}

Инициализация криптоподсистемы не удалась.

### `ERR_CRYPTO_INVALID_AUTH_TAG` {#err_crypto_invalid_auth_tag}

Был предоставлен недопустимый тег аутентификации.

### `ERR_CRYPTO_INVALID_COUNTER` {#err_crypto_invalid_counter}

Для шифра с режимом счетчика был предоставлен некорректный счетчик.

### `ERR_CRYPTO_INVALID_CURVE` {#err_crypto_invalid_curve}

Была предоставлена недопустимая эллиптическая кривая.

### `ERR_CRYPTO_INVALID_DIGEST` {#err_crypto_invalid_digest}

Был указан неверный [алгоритм криптодайджеста](crypto.md#cryptogethashes).

### `ERR_CRYPTO_INVALID_IV` {#err_crypto_invalid_iv}

Был предоставлен недопустимый вектор инициализации.

### `ERR_CRYPTO_INVALID_JWK` {#err_crypto_invalid_jwk}

Был предоставлен недопустимый веб-ключ JSON.

### `ERR_CRYPTO_INVALID_KEYLEN` {#err_crypto_invalid_keylen}

Указана недопустимая длина ключа.

### `ERR_CRYPTO_INVALID_KEYPAIR` {#err_crypto_invalid_keypair}

Была предоставлена недопустимая пара ключей.

### `ERR_CRYPTO_INVALID_KEYTYPE` {#err_crypto_invalid_keytype}

Был предоставлен недопустимый тип ключа.

### `ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE` {#err_crypto_invalid_key_object_type}

Тип данного объекта криптографического ключа не подходит для данной операции.

### `ERR_CRYPTO_INVALID_MESSAGELEN` {#err_crypto_invalid_messagelen}

Была предоставлена недопустимая длина сообщения.

### `ERR_CRYPTO_INVALID_SCRYPT_PARAMS` {#err_crypto_invalid_scrypt_params}

Были предоставлены неверные параметры алгоритма scrypt.

### `ERR_CRYPTO_INVALID_STATE` {#err_crypto_invalid_state}

Метод crypto был использован на объекте, который находился в недопустимом состоянии. Например, вызов [`cipher.getAuthTag()`](crypto.md#ciphergetauthtag) перед вызовом `cipher.final()`.

### `ERR_CRYPTO_INVALID_TAG_LENGTH` {#err_crypto_invalid_tag_length}

Была указана недопустимая длина тега аутентификации.

### `ERR_CRYPTO_JOB_INIT_FAILED` {#err_crypto_job_init_failed}

Инициализация асинхронной криптооперации не удалась.

### `ERR_CRYPTO_JWK_UNSUPPORTED_CURVE` {#err_crypto_jwk_unsupported_curve}

Эллиптическая кривая ключа не зарегистрирована для использования в [реестре эллиптических кривых JSON Web Key](https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve).

### `ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE` {#err_crypto_jwk_unsupported_key_type}

Асимметричный тип ключа не зарегистрирован для использования в [реестре типов JSON Web Key](https://www.iana.org/assignments/jose/jose.xhtml#web-key-types).

### `ERR_CRYPTO_KEM_NOT_SUPPORTED` {#err_crypto_kem_not_supported}

Была предпринята попытка использовать операции KEM, хотя Node.js был собран без OpenSSL с поддержкой KEM.

### `ERR_CRYPTO_OPERATION_FAILED` {#err_crypto_operation_failed}

Криптооперация завершилась неудачно по неустановленной причине.

### `ERR_CRYPTO_PBKDF2_ERROR` {#err_crypto_pbkdf2_error}

Алгоритм PBKDF2 не сработал по неустановленным причинам. OpenSSL не предоставляет более подробной информации, и, соответственно, Node.js тоже.

### `ERR_CRYPTO_SCRYPT_NOT_SUPPORTED` {#err_crypto_scrypt_not_supported}

Node.js был собран без поддержки `scrypt`. Это невозможно для официальных бинарных релизов, но может случиться в пользовательских сборках, включая сборки дистрибутивов.

### `ERR_CRYPTO_SIGN_KEY_REQUIRED` {#err_crypto_sign_key_required}

Ключ подписи `key` не был передан в метод [`sign.sign()`](crypto.md#signsignprivatekey-outputencoding).

### `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` {#err_crypto_timing_safe_equal_length}

[`crypto.timingSafeEqual()`](crypto.md#cryptotimingsafeequala-b) был вызван с аргументами `Buffer`, `TypedArray` или `DataView` разной длины.

### `ERR_CRYPTO_UNKNOWN_CIPHER` {#err_crypto_unknown_cipher}

Был указан неизвестный шифр.

### `ERR_CRYPTO_UNKNOWN_DH_GROUP` {#err_crypto_unknown_dh_group}

Указано неизвестное имя группы Диффи-Хеллмана. Список допустимых имен групп см. в [`crypto.getDiffieHellman()`](crypto.md#cryptogetdiffiehellmangroupname).

### `ERR_CRYPTO_UNSUPPORTED_OPERATION` {#err_crypto_unsupported_operation}

Была предпринята попытка вызвать неподдерживаемую криптооперацию.

### `ERR_DEBUGGER_ERROR` {#err_debugger_error}

Произошла ошибка при работе с [отладчиком](debugger.md).

### `ERR_DEBUGGER_STARTUP_ERROR` {#err_debugger_startup_error}

[Отладчик](debugger.md) затянул время, ожидая, пока освободится требуемый хост/порт.

### `ERR_DIR_CLOSED` {#err_dir_closed}

Каталог [`fs.Dir`](fs.md#class-fsdir) был ранее закрыт.

### `ERR_DIR_CONCURRENT_OPERATION` {#err_dir_concurrent_operation}

Была предпринята синхронная операция чтения или закрытия для [`fs.Dir`](fs.md#class-fsdir), у которого ещё выполняются асинхронные операции.

### `ERR_DLOPEN_DISABLED` {#err_dlopen_disabled}

Загрузка родных аддонов была отключена с помощью [`--no-addons`](cli.md#--no-addons).

### `ERR_DLOPEN_FAILED` {#err_dlopen_failed}

Вызов `process.dlopen()` не удался.

### `ERR_DNS_SET_SERVERS_FAILED` {#err_dns_set_servers_failed}

`c-ares` не удалось установить DNS-сервер.

### `ERR_DOMAIN_CALLBACK_NOT_AVAILABLE` {#err_domain_callback_not_available}

Модуль `node:domain` был недоступен: не удалось установить необходимые перехватчики обработки ошибок, потому что ранее уже был вызван [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn).

### `ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE` {#err_domain_cannot_set_uncaught_exception_capture}

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) нельзя было вызвать, потому что модуль `node:domain` уже был загружен ранее.

Трассировка стека дополнена моментом загрузки модуля `node:domain`.

### `ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION` {#err_duplicate_startup_snapshot_main_function}

[`v8.startupSnapshot.setDeserializeMainFunction()`](v8.md#v8startupsnapshotsetdeserializemainfunctioncallback-data) нельзя было вызвать, потому что он уже вызывался ранее.

### `ERR_ENCODING_INVALID_ENCODED_DATA` {#err_encoding_invalid_encoded_data}

Данные, переданные в API `TextDecoder()`, были недопустимы для указанной кодировки.

### `ERR_ENCODING_NOT_SUPPORTED` {#err_encoding_not_supported}

Кодировка, переданная в API `TextDecoder()`, не входит в число [кодировок, поддерживаемых WHATWG](util.md#whatwg-supported-encodings).

### `ERR_EVAL_ESM_CANNOT_PRINT` {#err_eval_esm_cannot_print}

`--print` нельзя использовать с входными данными ESM.

### `ERR_EVENT_RECURSION` {#err_event_recursion}

Выбрасывается при попытке рекурсивно отправить событие в `EventTarget`.

### `ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE` {#err_execution_environment_not_available}

Контекст выполнения JS не связан со средой Node.js. Такое возможно при встраивании Node.js как библиотеки, если не настроены некоторые перехватчики движка JS.

### `ERR_FALSY_VALUE_REJECTION` {#err_falsy_value_rejection}

`Promise`, преобразованный через `util.callbackify()`, был отклонён с ложным значением.

### `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM` {#err_feature_unavailable_on_platform}

Используется, когда вызывается возможность, недоступная на текущей платформе, где запущен Node.js.

### `ERR_FS_CP_DIR_TO_NON_DIR` {#err_fs_cp_dir_to_non_dir}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать каталог в не-каталог (файл, симлинк и т. п.).

### `ERR_FS_CP_EEXIST` {#err_fs_cp_eexist}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка перезаписать уже существующий файл при `force` и `errorOnExist`, равных `true`.

### `ERR_FS_CP_EINVAL` {#err_fs_cp_einval}

При использовании [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) `src` или `dest` указывали на недопустимый путь.

### `ERR_FS_CP_FIFO_PIPE` {#err_fs_cp_fifo_pipe}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать именованный канал.

### `ERR_FS_CP_NON_DIR_TO_DIR` {#err_fs_cp_non_dir_to_dir}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка скопировать не-каталог (файл, симлинк и т. п.) в каталог.

### `ERR_FS_CP_SOCKET` {#err_fs_cp_socket}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка копирования в сокет.

### `ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY` {#err_fs_cp_symlink_to_subdirectory}

При использовании [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) симлинк в `dest` указывал на подкаталог `src`.

### `ERR_FS_CP_UNKNOWN` {#err_fs_cp_unknown}

Через [`fs.cp()`](fs.md#fscpsrc-dest-options-callback) была предпринята попытка копирования в файл неизвестного типа.

### `ERR_FS_EISDIR` {#err_fs_eisdir}

Путь указывает на каталог.

### `ERR_FS_FILE_TOO_LARGE` {#err_fs_file_too_large}

Была предпринята попытка прочитать файл, размер которого больше максимально допустимого для `Buffer`.

### `ERR_FS_WATCH_QUEUE_OVERFLOW` {#err_fs_invalid_symlink_type}

Число событий ФС, поставленных в очередь и не обработанных, превысило значение, заданное в `maxQueue` для `fs.watch()`.

### `ERR_HTTP2_ALTSVC_INVALID_ORIGIN` {#err_http2_altsvc_invalid_origin}

Кадры HTTP/2 ALTSVC требуют корректного origin.

### `ERR_HTTP2_ALTSVC_LENGTH` {#err_http2_altsvc_length}

Кадры HTTP/2 ALTSVC ограничены максимум 16 382 байтами полезной нагрузки.

### `ERR_HTTP2_CONNECT_AUTHORITY` {#err_http2_connect_authority}

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:authority` обязателен.

### `ERR_HTTP2_CONNECT_PATH` {#err_http2_connect_path}

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:path` запрещён.

### `ERR_HTTP2_CONNECT_SCHEME` {#err_http2_connect_scheme}

Для HTTP/2-запросов с методом `CONNECT` псевдозаголовок `:scheme` запрещён.

### `ERR_HTTP2_ERROR` {#err_http2_error}

Произошла неспецифичная ошибка HTTP/2.

### `ERR_HTTP2_GOAWAY_SESSION` {#err_http2_goaway_session}

Новые потоки HTTP/2 нельзя открыть после того, как `Http2Session` получил кадр `GOAWAY` от удалённой стороны.

### `ERR_HTTP2_HEADERS_AFTER_RESPOND` {#err_http2_header_single_value}

Дополнительные заголовки были указаны после начала HTTP/2-ответа.

### `ERR_HTTP2_HEADERS_SENT` {#err_http2_headers_sent}

Была предпринята попытка отправить несколько наборов заголовков ответа.

### `ERR_HTTP2_HEADER_SINGLE_VALUE` {#err_http2_info_status_not_allowed}

Для поля заголовка HTTP/2, которое должно иметь одно значение, передано несколько значений.

### `ERR_HTTP2_INFO_STATUS_NOT_ALLOWED` {#err_http2_headers_after_respond}

Информационные коды состояния HTTP (`1xx`) нельзя задавать как код ответа для HTTP/2.

### `ERR_HTTP2_INVALID_CONNECTION_HEADERS` {#err_http2_invalid_connection_headers}

Запрещено использовать специфичные для соединения заголовки HTTP/1 в запросах и ответах HTTP/2.

### `ERR_HTTP2_INVALID_HEADER_VALUE` {#err_http2_invalid_header_value}

Указано недопустимое значение заголовка HTTP/2.

### `ERR_HTTP2_INVALID_INFO_STATUS` {#err_http2_invalid_info_status}

Указан недопустимый информационный код состояния HTTP. Такие коды должны быть целыми от `100` до `199` включительно.

### `ERR_HTTP2_INVALID_ORIGIN` {#err_http2_invalid_origin}

Кадры HTTP/2 `ORIGIN` требуют корректного origin.

### `ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH` {#err_http2_invalid_packed_settings_length}

Входные экземпляры `Buffer` и `Uint8Array`, переданные в API `http2.getUnpackedSettings()`, должны иметь длину, кратную шести.

### `ERR_HTTP2_INVALID_PSEUDOHEADER` {#err_http2_invalid_pseudoheader}

Допустимо использовать только корректные псевдозаголовки HTTP/2 (`:status`, `:path`, `:authority`, `:scheme` и `:method`).

### `ERR_HTTP2_INVALID_SESSION` {#err_http2_invalid_session}

Операция выполнялась над объектом `Http2Session`, который уже был уничтожен.

### `ERR_HTTP2_INVALID_SETTING_VALUE` {#err_http2_invalid_setting_value}

Для параметра HTTP/2 SETTINGS указано недопустимое значение.

### `ERR_HTTP2_INVALID_STREAM` {#err_http2_invalid_stream}

Операция выполнялась над потоком, который уже был уничтожен.

### `ERR_HTTP2_MAX_PENDING_SETTINGS_ACK` {#err_http2_max_pending_settings_ack}

Каждый раз, когда подключённой стороне отправляется кадр HTTP/2 `SETTINGS`, она должна подтвердить, что получила и применила новые `SETTINGS`. По умолчанию одновременно можно отправить только ограниченное число неподтверждённых кадров `SETTINGS`. Этот код ошибки используется, когда данный предел достигнут.

### `ERR_HTTP2_NESTED_PUSH` {#err_http2_nested_push}

Была попытка открыть новый push-поток изнутри push-потока. Вложенные push-потоки не допускаются.

### `ERR_HTTP2_NO_MEM` {#err_http2_no_mem}

Недостаточно памяти при использовании API `http2session.setLocalWindowSize(windowSize)`.

### `ERR_HTTP2_NO_SOCKET_MANIPULATION` {#err_http2_no_socket_manipulation}

Была попытка напрямую управлять сокетом, привязанным к `Http2Session` (чтение, запись, pause, resume и т. д.).

### `ERR_HTTP2_ORIGIN_LENGTH` {#err_http2_origin_length}

Длина кадров HTTP/2 `ORIGIN` ограничена 16382 байтами.

### `ERR_HTTP2_OUT_OF_STREAMS` {#err_http2_out_of_streams}

Достигнуто максимальное число потоков на одной сессии HTTP/2.

### `ERR_HTTP2_PAYLOAD_FORBIDDEN` {#err_http2_payload_forbidden}

Для кода ответа HTTP, которому запрещено тело, было указано тело сообщения.

### `ERR_HTTP2_PING_CANCEL` {#err_http2_ping_cancel}

HTTP/2 PING был отменён.

### `ERR_HTTP2_PING_LENGTH` {#err_http2_ping_length}

Полезная нагрузка ping в HTTP/2 должна иметь длину ровно 8 байт.

### `ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED` {#err_http2_pseudoheader_not_allowed}

Псевдозаголовок HTTP/2 использован недопустимо. Псевдозаголовки — имена ключей, начинающиеся с префикса `:`.

### `ERR_HTTP2_PUSH_DISABLED` {#err_http2_push_disabled}

Была попытка создать push-поток, хотя клиент отключил push.

### `ERR_HTTP2_SEND_FILE` {#err_http2_send_file}

Через API `Http2Stream.prototype.responseWithFile()` была попытка отправить каталог.

### `ERR_HTTP2_SEND_FILE_NOSEEK` {#err_http2_send_file_noseek}

Через `Http2Stream.prototype.responseWithFile()` была попытка отправить не обычный файл, при этом указаны опции `offset` или `length`.

### `ERR_HTTP2_SESSION_ERROR` {#err_http2_session_error}

`Http2Session` закрыта с ненулевым кодом ошибки.

### `ERR_HTTP2_SETTINGS_CANCEL` {#err_http2_settings_cancel}

Настройки `Http2Session` отменены.

### `ERR_HTTP2_SOCKET_BOUND` {#err_http2_socket_bound}

Была попытка связать `Http2Session` с `net.Socket` или `tls.TLSSocket`, уже привязанным к другой `Http2Session`.

### `ERR_HTTP2_SOCKET_UNBOUND` {#err_http2_socket_unbound}

Была попытка использовать свойство `socket` у уже закрытой `Http2Session`.

### `ERR_HTTP2_STATUS_101` {#err_http2_status_101}

Использование информационного кода состояния `101` запрещено в HTTP/2.

### `ERR_HTTP2_STATUS_INVALID` {#err_http2_status_invalid}

Указан недопустимый код состояния HTTP. Код должен быть целым от `100` до `599` включительно.

### `ERR_HTTP2_STREAM_CANCEL` {#err_http2_stream_cancel}

`Http2Stream` был уничтожен до передачи данных удалённой стороне.

### `ERR_HTTP2_STREAM_ERROR` {#err_http2_stream_error}

В кадре `RST_STREAM` указан ненулевой код ошибки.

### `ERR_HTTP2_STREAM_SELF_DEPENDENCY` {#err_http2_stream_self_dependency}

При задании приоритета потока HTTP/2 поток может быть помечен зависимым от родительского. Этот код используется при попытке сделать поток зависимым от самого себя.

### `ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS` {#err_http2_too_many_invalid_frames}

Превышено число поддерживаемых пользовательских настроек (10).

### `ERR_HTTP2_TOO_MANY_INVALID_FRAMES` {#err_http2_too_many_invalid_frames}

Превышен предел допустимого числа некорректных кадров протокола HTTP/2 от удалённой стороны, заданный опцией `maxSessionInvalidFrames`.

### `ERR_HTTP2_TRAILERS_ALREADY_SENT` {#err_http2_trailers_already_sent}

Завершающие заголовки уже были отправлены в `Http2Stream`.

### `ERR_HTTP2_TRAILERS_NOT_READY` {#err_http2_trailers_not_ready}

Метод `http2stream.sendTrailers()` нельзя вызывать до события `'wantTrailers'` на объекте `Http2Stream`. Событие `'wantTrailers'` генерируется только если для `Http2Stream` задана опция `waitForTrailers`.

### `ERR_HTTP2_UNSUPPORTED_PROTOCOL` {#err_http2_unsupported_protocol}

В `http2.connect()` передан URL с протоколом, отличным от `http:` или `https:`.

### `ERR_HTTP_BODY_NOT_ALLOWED` {#err_illegal_constructor}

Ошибка возникает при записи в HTTP-ответ, который не допускает тела.

### `ERR_HTTP_CONTENT_LENGTH_MISMATCH` {#err_http_content_length_mismatch}

Размер тела ответа не совпадает со значением заголовка Content-Length.

### `ERR_HTTP_HEADERS_SENT` {#err_http_content_length_mismatch}

Была попытка добавить заголовки после того, как заголовки уже были отправлены.

### `ERR_HTTP_INVALID_HEADER_VALUE` {#err_http_invalid_header_value}

Указано недопустимое значение HTTP-заголовка.

### `ERR_HTTP_INVALID_STATUS_CODE` {#err_http_invalid_status_code}

Код состояния вне обычного диапазона (100–999).

### `ERR_HTTP_REQUEST_TIMEOUT` {#err_http_request_timeout}

Клиент не отправил весь запрос за отведённое время.

### `ERR_HTTP_SOCKET_ASSIGNED` {#err_http_socket_encoding}

Указанному [`ServerResponse`](http.md#class-httpserverresponse) уже назначен сокет.

### `ERR_HTTP_SOCKET_ENCODING` {#err_http_socket_encoding}

Согласно [RFC 7230, раздел 3](https://tools.ietf.org/html/rfc7230#section-3), смена кодировки сокета не допускается.

### `ERR_HTTP_TRAILER_INVALID` {#err_http_trailer_invalid}

Заголовок `Trailer` задан, хотя кодирование передачи это не поддерживает.

### `ERR_ILLEGAL_CONSTRUCTOR` {#err_http2_altsvc_invalid_origin}

Была попытка создать объект через непубличный конструктор.

### `ERR_IMPORT_ATTRIBUTE_MISSING` {#err_import_assertion_type_failed}

Отсутствует атрибут импорта, из‑за чего указанный модуль нельзя импортировать.

### `ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE` {#err_import_attribute_type_incompatible}

Атрибут импорта `type` указан, но модуль другого типа.

### `ERR_IMPORT_ATTRIBUTE_UNSUPPORTED` {#err_import_attribute_unsupported}

Атрибут импорта не поддерживается этой версией Node.js.

### `ERR_INCOMPATIBLE_OPTION_PAIR` {#err_incompatible_option_pair}

Пара опций несовместима с самой собой и не может использоваться одновременно.

### `ERR_INPUT_TYPE_NOT_ALLOWED` {#err_input_type_not_allowed}

!!!warning "Стабильность: 1 - Экспериментальная"

Флаг `--input-type` использован для запуска файла. Его можно применять только вместе с вводом через `--eval`, `--print` или `STDIN`.

### `ERR_INSPECTOR_ALREADY_ACTIVATED` {#err_inspector_already_activated}

При использовании `node:inspector` была попытка активировать инспектор, когда он уже слушает порт. Вызовите `inspector.close()` перед активацией на другом адресе.

### `ERR_INSPECTOR_ALREADY_CONNECTED` {#err_inspector_already_connected}

При использовании `node:inspector` была попытка подключиться, когда инспектор уже подключён.

### `ERR_INSPECTOR_CLOSED` {#err_inspector_closed}

При использовании `node:inspector` была попытка использовать инспектор после закрытия сессии.

### `ERR_INSPECTOR_COMMAND` {#err_inspector_command}

Ошибка при выполнении команды через модуль `node:inspector`.

### `ERR_INSPECTOR_NOT_ACTIVE` {#err_inspector_not_active}

`inspector` не активен в момент вызова `inspector.waitForDebugger()`.

### `ERR_INSPECTOR_NOT_AVAILABLE` {#err_inspector_not_available}

Модуль `node:inspector` недоступен.

### `ERR_INSPECTOR_NOT_CONNECTED` {#err_inspector_not_connected}

При использовании `node:inspector` была попытка использовать инспектор до подключения.

### `ERR_INSPECTOR_NOT_WORKER` {#err_inspector_not_worker}

API вызван в основном потоке, хотя допускается только из потока worker.

### `ERR_INTERNAL_ASSERTION` {#err_internal_assertion}

Обнаружена ошибка в Node.js или некорректное использование внутренностей Node.js. Сообщите о проблеме: <https://github.com/nodejs/node/issues>.

### `ERR_INVALID_ADDRESS` {#err_invalid_address_family}

Переданный адрес не распознан API Node.js.

### `ERR_INVALID_ADDRESS_FAMILY` {#err_invalid_address_family}

Переданное семейство адресов не распознано API Node.js.

### `ERR_INVALID_ARG_TYPE` {#err_invalid_arg_type}

В API Node.js передан аргумент неверного типа.

### `ERR_INVALID_ARG_VALUE` {#err_invalid_arg_value}

Для аргумента передано недопустимое или неподдерживаемое значение.

### `ERR_INVALID_ASYNC_ID` {#err_invalid_async_id}

Через `AsyncHooks` передан недопустимый `asyncId` или `triggerAsyncId`. Идентификатор меньше -1 не должен встречаться.

### `ERR_INVALID_BUFFER_SIZE` {#err_invalid_buffer_size}

Для `Buffer` выполнен swap, но размер не подходит для операции.

### `ERR_INVALID_CHAR` {#err_invalid_char}

В заголовках обнаружены недопустимые символы.

### `ERR_INVALID_CURSOR_POS` {#err_invalid_cursor_pos}

Курсор потока нельзя переместить на указанную строку без указанного столбца.

### `ERR_INVALID_FD` {#err_invalid_fd}

Недопустимый файловый дескриптор (`fd`), например отрицательное значение.

### `ERR_INVALID_FD_TYPE` {#err_invalid_fd_type}

Недопустимый тип файлового дескриптора (`fd`).

### `ERR_INVALID_FILE_URL_HOST` {#err_invalid_file_url_host}

API Node.js, работающее с URL `file:` (например функции [`fs`](fs.md)), получило URL с недопустимым хостом. Такое возможно только на Unix-подобных системах, где поддерживаются только `localhost` или пустой хост.

### `ERR_INVALID_FILE_URL_PATH` {#err_invalid_file_url_path}

API Node.js, работающее с URL `file:` (например [`fs`](fs.md)), получило URL с недопустимым путём. Допустимость пути зависит от платформы.

### `ERR_INVALID_HANDLE_TYPE` {#err_invalid_handle_type}

Попытка передать неподдерживаемый «handle» по IPC дочернему процессу. См. [`subprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback) и [`process.send()`](process.md#processsendmessage-sendhandle-options-callback).

### `ERR_INVALID_HTTP_TOKEN` {#err_invalid_http_token}

Передан недопустимый HTTP-токен.

### `ERR_INVALID_IP_ADDRESS` {#err_invalid_ip_address}

Недопустимый IP-адрес.

### `ERR_INVALID_MIME_SYNTAX` {#err_invalid_mime_syntax}

Синтаксис MIME некорректен.

### `ERR_INVALID_MODULE` {#err_invalid_module}

Попытка загрузить несуществующий или иначе недопустимый модуль.

### `ERR_INVALID_MODULE_SPECIFIER` {#err_invalid_module_specifier}

Строка импортируемого модуля — недопустимый URL, имя пакета или спецификатор подпути.

### `ERR_INVALID_OBJECT_DEFINE_PROPERTY` {#err_invalid_object_define_property}

Ошибка при установке недопустимого атрибута свойства объекта.

### `ERR_INVALID_PACKAGE_CONFIG` {#err_invalid_package_config}

Файл [`package.json`](packages.md#nodejs-packagejson-field-definitions) недопустим и не разобран.

### `ERR_INVALID_PACKAGE_TARGET` {#err_invalid_package_target}

Поле [`"exports"`](packages.md#exports) в `package.json` содержит недопустимое сопоставление цели для данного разрешения модуля.

### `ERR_INVALID_PROTOCOL` {#err_invalid_performance_mark}

В `http.request()` передан недопустимый `options.protocol`.

### `ERR_INVALID_REPL_EVAL_CONFIG` {#err_invalid_repl_eval_config}

В конфиге [`REPL`](repl.md) одновременно заданы `breakEvalOnSigint` и `eval`, что не поддерживается.

### `ERR_INVALID_REPL_INPUT` {#err_invalid_repl_input}

Ввод нельзя использовать в [`REPL`](repl.md). Условия использования этой ошибки описаны в документации [`REPL`](repl.md).

### `ERR_INVALID_RETURN_PROPERTY` {#err_invalid_return_property}

Выбрасывается, если опция-функция не возвращает допустимое значение для одного из свойств объекта при выполнении.

### `ERR_INVALID_RETURN_PROPERTY_VALUE` {#err_invalid_return_property_value}

Выбрасывается, если опция-функция не возвращает ожидаемый тип для одного из свойств объекта при выполнении.

### `ERR_INVALID_RETURN_VALUE` {#err_invalid_return_value}

Выбрасывается, если опция-функция не возвращает ожидаемый тип при выполнении (например ожидался промис).

### `ERR_INVALID_STATE` {#err_invalid_state}

Операция не может быть завершена из‑за недопустимого состояния: объект уже уничтожен или выполняет другую операцию.

### `ERR_INVALID_SYNC_FORK_INPUT` {#err_invalid_sync_fork_input}

В асинхронный fork в качестве stdio переданы `Buffer`, `TypedArray`, `DataView` или строка. См. документацию [`child_process`](child_process.md).

### `ERR_INVALID_THIS` {#err_invalid_this}

Функция API Node.js вызвана с несовместимым значением `this`.

```js
const urlSearchParams = new URLSearchParams(
    'foo=bar&baz=new'
);

const buf = Buffer.alloc(1);
urlSearchParams.has.call(buf, 'foo');
// Throws a TypeError with code 'ERR_INVALID_THIS'
```

### `ERR_INVALID_TUPLE` {#err_invalid_transfer_object}

Элемент переданного `iterable` в [конструктор `URLSearchParams`](url.md#new-urlsearchparamsiterable) [WHATWG](url.md#the-whatwg-url-api) не является кортежем `[name, value]`: элемент не итерируемый или не из двух элементов.

### `ERR_INVALID_TYPESCRIPT_SYNTAX` {#err_invalid_typescript_syntax}

Указанный синтаксис TypeScript недопустим.

### `ERR_INVALID_URI` {#err_invalid_uri}

Передан недопустимый URI.

### `ERR_INVALID_URL` {#err_invalid_url}

В [конструктор `URL`](url.md#new-urlinput-base) [WHATWG](url.md#the-whatwg-url-api) или устаревший [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) передан недопустимый URL. У объекта ошибки обычно есть свойство `'input'` с неразобранным URL.

### `ERR_INVALID_URL_PATTERN` {#err_invalid_url_scheme}

Для разбора в [конструктор `URLPattern`](url.md#new-urlpatternstring-baseurl-options) по [WHATWG URL API](url.md#the-whatwg-url-api) был передан недопустимый URLPattern.

### `ERR_INVALID_URL_SCHEME` {#err_invalid_url_scheme}

Попытка использовать URL с несовместимой схемой (протоколом). Сейчас используется в [`fs`](fs.md) с [WHATWG URL API](url.md#the-whatwg-url-api) (только `'file'`), в будущем возможно и в других API.

### `ERR_IPC_CHANNEL_CLOSED` {#err_ipc_channel_closed}

Попытка использовать уже закрытый IPC-канал.

### `ERR_IPC_DISCONNECTED` {#err_ipc_disconnected}

Попытка отключить уже отключённый IPC-канал. См. [`child_process`](child_process.md).

### `ERR_IPC_ONE_PIPE` {#err_ipc_one_pipe}

Попытка создать дочерний процесс Node.js с более чем одним IPC-каналом. См. [`child_process`](child_process.md).

### `ERR_IPC_SYNC_FORK` {#err_ipc_sync_fork}

Попытка открыть IPC-канал с синхронно форкнутым процессом Node.js. См. [`child_process`](child_process.md).

### `ERR_IP_BLOCKED` {#err_loader_chain_incomplete}

IP-адрес заблокирован `net.BlockList`.

### `ERR_LOADER_CHAIN_INCOMPLETE` {#err_loader_chain_incomplete}

Хук загрузчика ESM вернул управление без вызова `next()` и без явного короткого замыкания.

### `ERR_LOAD_SQLITE_EXTENSION` {#err_manifest_assert_integrity}

Ошибка при загрузке расширения SQLite.

### `ERR_MEMORY_ALLOCATION_FAILED` {#err_memory_allocation_failed}

Не удалось выделить память (обычно в слое C++).

### `ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE` {#err_message_target_context_unavailable}

Сообщение в [`MessagePort`](worker_threads.md#class-messageport) не удалось десериализовать в целевом контексте [vm](vm.md). Не все объекты Node.js можно создать в любом контексте; передача через `postMessage()` может не сработать.

### `ERR_METHOD_NOT_IMPLEMENTED` {#err_method_not_implemented}

Требуемый метод не реализован.

### `ERR_MISSING_ARGS` {#err_missing_args}

Не передан обязательный аргумент API Node.js (строгое соответствие спецификации: иногда допустимо `func(undefined)`, но не `func()`). В большинстве нативных API `func(undefined)` и `func()` эквивалентны; может использоваться [`ERR_INVALID_ARG_TYPE`](#err_invalid_arg_type).

### `ERR_MISSING_OPTION` {#err_missing_option}

Для API, принимающих объекты параметров, некоторые параметры могут быть обязательными. Этот код ошибки выбрасывается, если обязательный параметр отсутствует.

### `ERR_MISSING_PASSPHRASE` {#err_missing_passphrase}

Попытка прочитать зашифрованный ключ без пароля.

### `ERR_MISSING_PLATFORM_FOR_WORKER` {#err_missing_platform_for_worker}

Платформа V8 в этом экземпляре Node.js не поддерживает создание Workers из‑за отсутствия поддержки со стороны встраивания. В стандартных сборках Node.js эта ошибка не возникает.

### `ERR_MODULE_LINK_MISMATCH` {#err_module_link_mismatch}

Модуль нельзя связать: одинаковые запросы модуля в нём разрешаются в разные модули.

### `ERR_MODULE_NOT_FOUND` {#err_module_not_found}

Загрузчик ECMAScript-модулей не смог разрешить файл модуля при `import` или при загрузке точки входа.

### `ERR_MULTIPLE_CALLBACK` {#err_multiple_callback}

Колбэк вызван более одного раза.

Колбэк обычно вызывают один раз: запрос выполняется или отклоняется, но не оба сразу. Повторный вызов нарушает это.

### `ERR_NAPI_CONS_FUNCTION` {#err_napi_cons_function}

При использовании `Node-API` переданный конструктор не был функцией.

### `ERR_NAPI_INVALID_DATAVIEW_ARGS` {#err_napi_invalid_dataview_args}

При вызове `napi_create_dataview()` переданный `offset` выходил за пределы data view либо `offset + length` превышало длину переданного `buffer`.

### `ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT` {#err_napi_invalid_typedarray_alignment}

При вызове `napi_create_typedarray()` переданный `offset` не был кратен размеру элемента.

### `ERR_NAPI_INVALID_TYPEDARRAY_LENGTH` {#err_napi_invalid_typedarray_length}

При вызове `napi_create_typedarray()` значение `(length * size_of_element) + byte_offset` превышало длину переданного `buffer`.

### `ERR_NAPI_TSFN_CALL_JS` {#err_napi_tsfn_call_js}

Ошибка при вызове JavaScript-части потокобезопасной функции.

### `ERR_NAPI_TSFN_GET_UNDEFINED` {#err_napi_tsfn_get_undefined}

Ошибка при получении значения JavaScript `undefined`.

### `ERR_NON_CONTEXT_AWARE_DISABLED` {#err_napi_tsfn_start_idle_loop}

Загружен нативный аддон без поддержки контекста в процессе, где это запрещено.

### `ERR_NOT_BUILDING_SNAPSHOT` {#err_out_of_range}

Использованы операции, доступные только при сборке снимка запуска V8, хотя снимок не собирается.

### `ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION` {#err_no_crypto}

Операция недоступна вне приложения в виде одного исполняемого файла.

### `ERR_NOT_SUPPORTED_IN_SNAPSHOT` {#err_not_supported_in_snapshot}

Попытка выполнить операции, недоступные при сборке снимка запуска.

### `ERR_NO_CRYPTO` {#err_no_crypto}

Использованы криптографические возможности при сборке Node.js без OpenSSL.

### `ERR_NO_ICU` {#err_no_icu}

Требуются возможности [ICU](intl.md#internationalization-support), но Node.js собран без ICU.

### `ERR_NO_TYPESCRIPT` {#err_non_context_aware_disabled}

Требуется [поддержка Native TypeScript](typescript.md#type-stripping), но Node.js собран без TypeScript.

### `ERR_OPERATION_FAILED` {#err_operation_failed}

Операция не удалась. Обычно обозначает общий сбой асинхронной операции.

### `ERR_OPTIONS_BEFORE_BOOTSTRAPPING` {#err_options_before_bootstrapping}

Попытка получить опции до завершения начальной загрузки.

### `ERR_OUT_OF_RANGE` {#err_out_of_range}

Значение вне допустимого диапазона.

### `ERR_PACKAGE_IMPORT_NOT_DEFINED` {#err_package_import_not_defined}

Поле [`"imports"`](packages.md#imports) в `package.json` не задаёт сопоставление для данного внутреннего спецификатора пакета.

### `ERR_PACKAGE_PATH_NOT_EXPORTED` {#err_package_path_not_exported}

Поле [`"exports"`](packages.md#exports) в `package.json` не экспортирует запрошенный подпуть. Экспорты инкапсулированы: приватные внутренние модули нельзя импортировать через разрешение пакета, кроме как по абсолютному URL.

### `ERR_PARSE_ARGS_INVALID_OPTION_VALUE` {#err_parse_args_invalid_option_value}

При `strict`, равном `true`, выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), если для опции типа [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) передано значение [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type), или для опции типа [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) передана строка [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type).

### `ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL` {#err_parse_args_unexpected_positional}

Выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), когда передан позиционный аргумент, а `allowPositionals` установлен в `false`.

### `ERR_PARSE_ARGS_UNKNOWN_OPTION` {#err_parse_args_unknown_option}

При `strict`, равном `true`, выбрасывается [`util.parseArgs()`](util.md#utilparseargsconfig), если аргумент не описан в `options`.

### `ERR_PERFORMANCE_INVALID_TIMESTAMP` {#err_performance_invalid_timestamp}

Для метки или измерения производительности передано недопустимое время.

### `ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS` {#err_performance_measure_invalid_options}

Для измерения производительности были переданы недопустимые параметры.

### `ERR_PROTO_ACCESS` {#err_proto_access}

Доступ к `Object.prototype.__proto__` был запрещён с помощью [`--disable-proto=throw`](cli.md#--disable-protomode). Для получения и установки прототипа объекта следует использовать [`Object.getPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) и [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf).

### `ERR_PROXY_INVALID_CONFIG` {#err_require_esm}

Не удалось проксировать запрос, потому что конфигурация прокси недопустима.

### `ERR_PROXY_TUNNEL` {#err_proxy_tunnel}

Не удалось установить прокси-туннель, когда включён `NODE_USE_ENV_PROXY` или `--use-env-proxy`.

### `ERR_QUIC_APPLICATION_ERROR` {#err_quic_application_error}

!!!warning "Стабильность: 1 - Экспериментальная"

Ошибка приложения QUIC.

### `ERR_QUIC_CONNECTION_FAILED` {#err_quic_connection_failed}

!!!warning "Стабильность: 1 - Экспериментальная"

Не удалось установить соединение QUIC.

### `ERR_QUIC_ENDPOINT_CLOSED` {#err_quic_endpoint_closed}

!!!warning "Стабильность: 1 - Экспериментальная"

Конечная точка QUIC закрыта с ошибкой.

### `ERR_QUIC_OPEN_STREAM_FAILED` {#err_quic_open_stream_failed}

!!!warning "Стабильность: 1 - Экспериментальная"

Не удалось открыть поток QUIC.

### `ERR_QUIC_TRANSPORT_ERROR` {#err_quic_transport_error}

!!!warning "Стабильность: 1 - Экспериментальная"

Ошибка транспорта QUIC.

### `ERR_QUIC_VERSION_NEGOTIATION_ERROR` {#err_quic_version_negotiation_error}

!!!warning "Стабильность: 1 - Экспериментальная"

Сессия QUIC не удалась: требуется согласование версии.

### `ERR_REQUIRE_ASYNC_MODULE` {#err_require_async_module}

При попытке `require()` [ES-модуля](esm.md) оказалось, что модуль асинхронный, то есть содержит `await` верхнего уровня.

Чтобы увидеть, где находится `await` верхнего уровня, используйте `--experimental-print-required-tla` (при этом модули выполняются до поиска `await` верхнего уровня).

### `ERR_REQUIRE_CYCLE_MODULE` {#err_require_cycle_module}

При попытке `require()` [ES-модуля](esm.md) участвует в немедленном цикле граница CommonJS↔ESM. Это недопустимо: ES-модули нельзя вычислять, пока они уже вычисляются.

Чтобы разорвать цикл, вызов `require()` в цикле не должен происходить на верхнем уровне ни ES-модуля (через `createRequire()`), ни CommonJS-модуля — его следует отложить во внутреннюю функцию.

### `ERR_REQUIRE_ESM` {#err_require_esm}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка вызвать `require()` для [ES-модуля](esm.md).

### `ERR_SCRIPT_EXECUTION_INTERRUPTED` {#err_script_execution_interrupted}

Выполнение скрипта было прервано сигналом `SIGINT` (например, при нажатии <kbd>Ctrl</kbd>+<kbd>C</kbd>).

### `ERR_SCRIPT_EXECUTION_TIMEOUT` {#err_script_execution_timeout}

Время выполнения скрипта истекло, возможно из-за ошибок в исполняемом скрипте.

### `ERR_SERVER_ALREADY_LISTEN` {#err_server_already_listen}

Метод [`server.listen()`](net.md#serverlisten) вызван, когда `net.Server` уже слушает. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP/2.

### `ERR_SERVER_NOT_RUNNING` {#err_server_not_running}

Метод [`server.close()`](net.md#serverclosecallback) вызван, когда `net.Server` не работает. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP/2.

### `ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND` {#err_socket_already_bound}

В API одноисполняемого приложения был передан ключ для идентификации ресурса, но соответствие не найдено.

### `ERR_SOCKET_ALREADY_BOUND` {#err_socket_already_bound}

Была предпринята попытка привязать сокет, который уже привязан.

### `ERR_SOCKET_BAD_BUFFER_SIZE` {#err_socket_bad_buffer_size}

Для параметров `recvBufferSize` или `sendBufferSize` в [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback) был передан недопустимый (отрицательный) размер.

### `ERR_SOCKET_BAD_PORT` {#err_socket_bad_port}

Функция API, ожидающая порт \>= 0 и \< 65536, получила недопустимое значение.

### `ERR_SOCKET_BAD_TYPE` {#err_socket_bad_type}

Функция API, ожидающая тип сокета (`udp4` или `udp6`), получила недопустимое значение.

### `ERR_SOCKET_BUFFER_SIZE` {#err_socket_buffer_size}

При использовании [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback) не удалось определить размер буфера приёма или отправки.

### `ERR_SOCKET_CLOSED` {#err_socket_closed}

Была предпринята попытка выполнить операцию над уже закрытым сокетом.

### `ERR_SOCKET_CLOSED_BEFORE_CONNECTION` {#err_socket_closed_before_connection}

При вызове [`net.Socket.write()`](net.md#socketwritedata-encoding-callback) на подключающемся сокете сокет был закрыт до установления соединения.

### `ERR_SOCKET_CONNECTION_TIMEOUT` {#err_socket_dgram_is_connected}

Сокет не смог подключиться ни к одному адресу из DNS за отведённое время при автовыборе семейства адресов.

### `ERR_SOCKET_DGRAM_IS_CONNECTED` {#err_socket_dgram_is_connected}

Вызов [`dgram.connect()`](dgram.md#socketconnectport-address-callback) был выполнен для уже подключённого сокета.

### `ERR_SOCKET_DGRAM_NOT_CONNECTED` {#err_socket_dgram_not_connected}

Вызов [`dgram.disconnect()`](dgram.md#socketdisconnect) или [`dgram.remoteAddress()`](dgram.md#socketremoteaddress) был выполнен для отключённого сокета.

### `ERR_SOCKET_DGRAM_NOT_RUNNING` {#err_socket_dgram_not_running}

Был выполнен вызов, когда подсистема UDP не работала.

### `ERR_SOURCE_MAP_CORRUPT` {#err_sri_parse}

Карту исходников не удалось разобрать: файл отсутствует или повреждён.

### `ERR_SOURCE_MAP_MISSING_SOURCE` {#err_source_map_missing_source}

Файл, импортируемый из карты исходников, не найден.

### `ERR_SOURCE_PHASE_NOT_DEFINED` {#err_source_phase_not_defined}

Предоставленный импорт модуля не содержит представления импортов фазы исходника для синтаксиса `import source x from 'x'` или `import.source(x)`.

### `ERR_SQLITE_ERROR` {#err_sqlite_error}

Из [SQLite](sqlite.md) была возвращена ошибка.

### `ERR_SRI_PARSE` {#err_sri_parse}

Для проверки целостности подресурса была передана строка, но её не удалось разобрать. Проверьте формат атрибутов целостности по [спецификации Subresource Integrity](https://www.w3.org/TR/SRI/#the-integrity-attribute).

### `ERR_STREAM_ALREADY_FINISHED` {#err_stream_already_finished}

Был вызван метод потока, который не может завершиться, потому что поток уже завершён.

### `ERR_STREAM_CANNOT_PIPE` {#err_stream_cannot_pipe}

Была предпринята попытка вызвать [`stream.pipe()`](stream.md#readablepipedestination-options) у потока [`Writable`](stream.md#class-streamwritable).

### `ERR_STREAM_DESTROYED` {#err_stream_destroyed}

Был вызван метод потока, который не может завершиться, потому что поток уничтожен через `stream.destroy()`.

### `ERR_STREAM_ITER_MISSING_FLAG` {#err_stream_iter_missing_flag}

API `stream/iter` использовался без включённого CLI-флага `--experimental-stream-iter`.

### `ERR_STREAM_NULL_VALUES` {#err_stream_null_values}

Была предпринята попытка вызвать [`stream.write()`](stream.md#writablewritechunk-encoding-callback) с фрагментом `null`.

### `ERR_STREAM_PREMATURE_CLOSE` {#err_stream_premature_close}

Ошибка, возвращаемая `stream.finished()` и `stream.pipeline()`, когда поток или конвейер завершается некорректно без явной ошибки.

### `ERR_STREAM_PUSH_AFTER_EOF` {#err_stream_push_after_eof}

Была предпринята попытка вызвать [`stream.push()`](stream.md#readablepushchunk-encoding) после того, как в поток уже был отправлен `null` (EOF).

### `ERR_STREAM_UNABLE_TO_PIPE` {#err_stream_unshift_after_end_event}

Была предпринята попытка направить данные в закрытый или уничтоженный поток внутри конвейера.

### `ERR_STREAM_UNSHIFT_AFTER_END_EVENT` {#err_stream_unshift_after_end_event}

Была предпринята попытка вызвать [`stream.unshift()`](stream.md#readableunshiftchunk-encoding) после генерации события `'end'`.

### `ERR_STREAM_WRAP` {#err_stream_wrap}

Предотвращает прерывание, если у `Socket` был задан строковый декодер или если декодер находится в режиме `objectMode`.

```js
const Socket = require('node:net').Socket;
const instance = new Socket();

instance.setEncoding('utf8');
```

### `ERR_STREAM_WRITE_AFTER_END` {#err_stream_write_after_end}

Была предпринята попытка вызвать [`stream.write()`](stream.md#writablewritechunk-encoding-callback) после вызова `stream.end()`.

### `ERR_STRING_TOO_LONG` {#err_string_too_long}

Была предпринята попытка создать строку длиннее максимально допустимой.

### `ERR_SYNTHETIC` {#err_synthetic}

Искусственный объект ошибки, используемый для захвата стека вызовов в диагностических отчётах.

### `ERR_SYSTEM_ERROR` {#err_system_error}

В процессе Node.js произошла неуточнённая системная ошибка. У объекта ошибки будет свойство-объект `err.info` с дополнительными сведениями.

### `ERR_TEST_FAILURE` {#err_tap_lexer_error}

Ошибка означает провал теста. Дополнительные сведения — в свойстве `cause`. Свойство `failureType` указывает, что делал тест при сбое.

### `ERR_TLS_ALPN_CALLBACK_INVALID_RESULT` {#err_tls_cert_altname_format}

Эта ошибка выбрасывается, когда `ALPNCallback` возвращает значение, которого нет в списке ALPN-протоколов, предложенных клиентом.

### `ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS` {#err_tls_alpn_callback_with_protocols}

Эта ошибка выбрасывается при создании `TLSServer`, если параметры TLS содержат и `ALPNProtocols`, и `ALPNCallback`. Эти параметры взаимно исключают друг друга.

### `ERR_TLS_CERT_ALTNAME_FORMAT` {#err_tls_cert_altname_format}

Эта ошибка выбрасывается `checkServerIdentity`, если переданное пользователем свойство `subjectaltname` нарушает правила кодирования. Объекты сертификатов, созданные самим Node.js, всегда соответствуют этим правилам и никогда не вызовут такую ошибку.

### `ERR_TLS_CERT_ALTNAME_INVALID` {#err_tls_cert_altname_invalid}

При использовании TLS имя хоста или IP-адрес удалённой стороны не совпали ни с одним из `subjectAltNames` в её сертификате.

### `ERR_TLS_DH_PARAM_SIZE` {#err_tls_dh_param_size}

При использовании TLS параметр, предложенный для протокола согласования ключей Diffie-Hellman (`DH`), слишком мал. По умолчанию длина ключа должна быть не меньше 1024 бит, чтобы избежать уязвимостей, хотя для более надёжной защиты настоятельно рекомендуется использовать 2048 бит и больше.

### `ERR_TLS_HANDSHAKE_TIMEOUT` {#err_tls_handshake_timeout}

Время ожидания TLS/SSL-рукопожатия истекло. В этом случае сервер также должен прервать соединение.

### `ERR_TLS_INVALID_CONTEXT` {#err_tls_invalid_context}

Контекст должен быть `SecureContext`.

### `ERR_TLS_INVALID_PROTOCOL_METHOD` {#err_tls_invalid_protocol_method}

Указанный метод `secureProtocol` недопустим: неизвестен или отключён как небезопасный.

### `ERR_TLS_INVALID_PROTOCOL_VERSION` {#err_tls_invalid_protocol_version}

Допустимые версии протокола TLS: `'TLSv1'`, `'TLSv1.1'` или `'TLSv1.2'`.

### `ERR_TLS_INVALID_STATE` {#err_tls_invalid_state}

TLS-сокет должен быть подключён и установлено безопасное соединение. Дождитесь события `secure` перед продолжением.

### `ERR_TLS_PROTOCOL_VERSION_CONFLICT` {#err_tls_protocol_version_conflict}

Попытка установить `minVersion` или `maxVersion` протокола TLS конфликтует с явной установкой `secureProtocol`. Используйте либо один механизм, либо другой.

### `ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED` {#err_tls_psk_set_identiy_hint_failed}

Не удалось установить подсказку идентичности PSK. Возможно, подсказка слишком длинная.

### `ERR_TLS_RENEGOTIATION_DISABLED` {#err_tls_renegotiation_disabled}

Была предпринята попытка повторного согласования TLS на экземпляре сокета, где повторное согласование отключено.

### `ERR_TLS_REQUIRED_SERVER_NAME` {#err_tls_required_server_name}

При использовании TLS метод `server.addContext()` был вызван без указания имени хоста в первом параметре.

### `ERR_TLS_SESSION_ATTACK` {#err_tls_session_attack}

Обнаружено чрезмерное количество повторных согласований TLS, что может быть вектором для атак типа отказа в обслуживании.

### `ERR_TLS_SNI_FROM_SERVER` {#err_tls_sni_from_server}

Была предпринята попытка передать Server Name Indication из серверного TLS-сокета, хотя это допустимо только со стороны клиента.

### `ERR_TRACE_EVENTS_CATEGORY_REQUIRED` {#err_trace_events_category_required}

Метод `trace_events.createTracing()` требует хотя бы одну категорию трассировки.

### `ERR_TRACE_EVENTS_UNAVAILABLE` {#err_trace_events_unavailable}

Модуль `node:trace_events` не загружен: Node.js собран с флагом `--without-v8-platform`.

### `ERR_TRAILING_JUNK_AFTER_STREAM_END` {#err_transform_already_transforming}

После конца сжатого потока обнаружены лишние данные. Эта ошибка выбрасывается, когда после завершения сжатого потока обнаруживаются дополнительные неожиданные данные (например, при распаковке zlib или gzip).

### `ERR_TRANSFORM_ALREADY_TRANSFORMING` {#err_transform_already_transforming}

Поток `Transform` завершился, пока ещё выполнял преобразование.

### `ERR_TRANSFORM_WITH_LENGTH_0` {#err_transform_with_length_0}

Поток `Transform` завершился, хотя в буфере записи ещё оставались данные.

### `ERR_TTY_INIT_FAILED` {#err_tty_init_failed}

Инициализация TTY не удалась из‑за системной ошибки.

### `ERR_UNAVAILABLE_DURING_EXIT` {#err_unavailable_during_exit}

Функция была вызвана внутри обработчика [`process.on('exit')`](process.md#event-exit), где её вызывать нельзя.

### `ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET` {#err_uncaught_exception_capture_already_set}

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) был вызван дважды без предварительного сброса callback в `null`.

Эта ошибка предотвращает случайную перезапись колбэка, зарегистрированного другим модулем.

### `ERR_UNESCAPED_CHARACTERS` {#err_unescaped_characters}

Была получена строка с неэкранированными символами.

### `ERR_UNHANDLED_ERROR` {#err_unhandled_error}

Произошла необработанная ошибка (например, когда [`EventEmitter`](events.md#class-eventemitter) генерирует событие `'error'`, но обработчик `'error'` не зарегистрирован).

### `ERR_UNKNOWN_BUILTIN_MODULE` {#err_unknown_builtin_module}

Используется для обозначения определённого вида внутренней ошибки Node.js, которая обычно не должна вызываться пользовательским кодом. Экземпляры этой ошибки указывают на внутреннюю ошибку в самом бинарном файле Node.js.

### `ERR_UNKNOWN_CREDENTIAL` {#err_unknown_credential}

Был передан идентификатор Unix-группы или пользователя, который не существует.

### `ERR_UNKNOWN_ENCODING` {#err_unknown_encoding}

В API был передан недопустимый или неизвестный параметр кодировки.

### `ERR_UNKNOWN_FILE_EXTENSION` {#err_unknown_file_extension}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка загрузить модуль с неизвестным или неподдерживаемым расширением файла.

### `ERR_UNKNOWN_MODULE_FORMAT` {#err_unknown_module_format}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка загрузить модуль с неизвестным или неподдерживаемым форматом.

### `ERR_UNKNOWN_SIGNAL` {#err_unknown_signal}

В API, ожидающий допустимый сигнал процесса (например, [`subprocess.kill()`](child_process.md#subprocesskillsignal)), был передан недопустимый или неизвестный сигнал.

### `ERR_UNSUPPORTED_DIR_IMPORT` {#err_unsupported_dir_import}

`import` URL каталога не поддерживается. Вместо этого [сошлитесь на пакет по его имени](packages.md#self-referencing-a-package-using-its-name) и [определите пользовательский подпуть](packages.md#subpath-exports) в поле [`"exports"`](packages.md#exports) файла [`package.json`](packages.md#nodejs-packagejson-field-definitions).

```js
import './'; // unsupported
import './index.js'; // supported
import 'package-name'; // supported
```

### `ERR_UNSUPPORTED_ESM_URL_SCHEME` {#err_unsupported_esm_url_scheme}

`import` с URL-схемами, отличными от `file` и `data`, не поддерживается.

### `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` {#err_use_after_close}

Удаление типов не поддерживается для файлов, находящихся внутри каталога `node_modules`.

### `ERR_UNSUPPORTED_RESOLVE_REQUEST` {#err_unsupported_resolve_request}

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

### `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` {#err_unsupported_typescript_syntax}

Указанный синтаксис TypeScript не поддерживается. Это может произойти при использовании синтаксиса TypeScript, который требует преобразования с помощью [удаления типов](typescript.md#type-stripping).

### `ERR_USE_AFTER_CLOSE` {#err_use_after_close}

!!!warning "Стабильность: 1 - Экспериментальная"

Была предпринята попытка использовать объект, который уже закрыт.

### `ERR_VALID_PERFORMANCE_ENTRY_TYPE` {#err_valid_performance_entry_type}

При использовании API измерения производительности (`perf_hooks`) не найдено допустимых типов записей производительности.

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` {#err_vm_dynamic_import_callback_missing}

Не был указан обратный вызов динамического импорта.

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG` {#err_vm_dynamic_import_callback_missing_flag}

Обратный вызов динамического импорта был вызван без `--experimental-vm-modules`.

### `ERR_VM_MODULE_ALREADY_LINKED` {#err_vm_module_already_linked}

Модуль, который пытались связать, не подходит для связывания по одной из следующих причин:

-   Он уже связан (`linkingStatus` равен `'linked'`)
-   Он находится в процессе связывания (`linkingStatus` равен `'linking'`)
-   Для этого модуля связывание завершилось ошибкой (`linkingStatus` равен `'errored'`)

### `ERR_VM_MODULE_CACHED_DATA_REJECTED` {#err_vm_module_cached_data_rejected}

Параметр `cachedData`, переданный конструктору модуля, недопустим.

### `ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA` {#err_vm_module_cannot_create_cached_data}

Кэшированные данные нельзя создать для модулей, которые уже были вычислены.

### `ERR_VM_MODULE_DIFFERENT_CONTEXT` {#err_vm_module_different_context}

Модуль, возвращаемый функцией связывания, принадлежит другому контексту, чем родительский модуль. Связанные модули должны находиться в одном и том же контексте.

### `ERR_VM_MODULE_LINK_FAILURE` {#err_vm_module_link_failure}

Модуль не удалось связать из-за ошибки.

### `ERR_VM_MODULE_NOT_MODULE` {#err_vm_module_not_module}

Значение успешно выполненного промиса связывания не является объектом `vm.Module`.

### `ERR_VM_MODULE_STATUS` {#err_vm_module_status}

Текущий статус модуля не допускает эту операцию. Точное значение ошибки зависит от конкретной функции.

### `ERR_WASI_ALREADY_STARTED` {#err_wasi_already_started}

Экземпляр WASI уже запущен.

### `ERR_WASI_NOT_STARTED` {#err_wasi_not_started}

Экземпляр WASI не был запущен.

### `ERR_WEBASSEMBLY_NOT_SUPPORTED` {#err_webassembly_response}

Была использована возможность, требующая WebAssembly, но WebAssembly не поддерживается или отключён в текущем окружении (например, при запуске с `--jitless`).

### `ERR_WEBASSEMBLY_RESPONSE` {#err_webassembly_response}

`Response`, переданный в `WebAssembly.compileStreaming` или `WebAssembly.instantiateStreaming`, не является корректным ответом WebAssembly.

### `ERR_WORKER_INIT_FAILED` {#err_worker_init_failed}

Инициализация `Worker` не удалась.

### `ERR_WORKER_INVALID_EXEC_ARGV` {#err_worker_invalid_exec_argv}

Опция `execArgv` в конструкторе `Worker` содержит недопустимые флаги.

### `ERR_WORKER_MESSAGING_ERRORED` {#err_worker_messaging_errored}

!!!warning "Стабильность: 1.1 - Активная разработка"

В потоке назначения произошла ошибка при обработке сообщения, отправленного через [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout).

### `ERR_WORKER_MESSAGING_FAILED` {#err_worker_messaging_failed}

!!!warning "Стабильность: 1.1 - Активная разработка"

Поток, указанный в [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout), недопустим или у него нет обработчика `workerMessage`.

### `ERR_WORKER_MESSAGING_SAME_THREAD` {#err_worker_messaging_same_thread}

!!!warning "Стабильность: 1.1 - Активная разработка"

Запрошенный в [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout) идентификатор потока совпадает с текущим.

### `ERR_WORKER_MESSAGING_TIMEOUT` {#err_worker_messaging_timeout}

!!!warning "Стабильность: 1.1 - Активная разработка"

Время ожидания отправки сообщения через [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout) истекло.

### `ERR_WORKER_NOT_RUNNING` {#err_worker_not_running}

Операция завершилась неудачей, потому что экземпляр `Worker` сейчас не запущен.

### `ERR_WORKER_OUT_OF_MEMORY` {#err_worker_out_of_memory}

Экземпляр `Worker` завершён из‑за достижения лимита памяти.

### `ERR_WORKER_PATH` {#err_worker_path}

Путь к основному скрипту потока worker не является ни абсолютным, ни относительным с `./` или `../`.

### `ERR_WORKER_UNSERIALIZABLE_ERROR` {#err_worker_unserializable_error}

Все попытки сериализовать неперехваченное исключение из потока worker завершились неудачей.

### `ERR_WORKER_UNSUPPORTED_OPERATION` {#err_worker_unsupported_operation}

Запрошенная возможность не поддерживается в потоках worker.

### `ERR_ZLIB_INITIALIZATION_FAILED` {#err_zlib_initialization_failed}

Не удалось создать объект [`zlib`](zlib.md) из-за неверной конфигурации.

### `ERR_ZSTD_INVALID_PARAM` {#err_zstd_invalid_param}

При создании потока Zstd был передан недопустимый ключ параметра.

### `HPE_CHUNK_EXTENSIONS_OVERFLOW` {#HPE_CHUNK_EXTENSIONS_OVERFLOW}

Было получено слишком много данных для расширений чанка. Чтобы защититься от вредоносных или неверно настроенных клиентов, при получении более 16 КиБ данных генерируется `Error` с этим кодом.

### `HPE_HEADER_OVERFLOW` {#hpe_header_overflow}

Было получено слишком много данных HTTP-заголовков. Чтобы защититься от вредоносных или неверно настроенных клиентов, при получении более 8 КиБ данных заголовков разбор HTTP прерывается без создания объекта запроса или ответа, и генерируется `Error` с этим кодом.

### `HPE_UNEXPECTED_CONTENT_LENGTH` {#HPE_UNEXPECTED_CONTENT_LENGTH}

Сервер отправляет одновременно заголовок `Content-Length` и `Transfer-Encoding: chunked`.

`Transfer-Encoding: chunked` позволяет серверу поддерживать постоянное HTTP-соединение для динамически генерируемого содержимого. В этом случае заголовок HTTP `Content-Length` использовать нельзя.

Используйте `Content-Length` или `Transfer-Encoding: chunked`.

### `MODULE_NOT_FOUND` {#module_not_found}

Загрузчик модулей CommonJS не смог разрешить файл модуля при попытке выполнить операцию [`require()`](modules.md#requireid) или при загрузке точки входа программы.

## Устаревшие коды ошибок Node.js

> Стабильность: 0 — устарело. Эти коды либо непоследовательны, либо удалены.

### `ERR_CANNOT_TRANSFER_OBJECT` {#err_cannot_transfer_object}

В `postMessage()` передан объект, перенос которого не поддерживается.

### `ERR_CPU_USAGE` {#err_cpu_usage}

Не удалось обработать нативный вызов из `process.cpuUsage`.

### `ERR_CRYPTO_HASH_DIGEST_NO_UTF16` {#err_crypto_hash_digest_no_utf16}

С [`hash.digest()`](crypto.md#hashdigestencoding) использована кодировка UTF-16. Хотя `hash.digest()` может принимать аргумент `encoding` и возвращать строку вместо `Buffer`, кодировки UTF-16 (например `ucs` или `utf16le`) не поддерживаются.

### `ERR_CRYPTO_SCRYPT_INVALID_PARAMETER` {#err_crypto_scrypt_invalid_parameter}

В [`crypto.scrypt()`](crypto.md#cryptoscryptpassword-salt-keylen-options-callback) или [`crypto.scryptSync()`](crypto.md#cryptoscryptsyncpassword-salt-keylen-options) была передана несовместимая комбинация параметров. В новых версиях Node.js вместо этого используется код ошибки [`ERR_INCOMPATIBLE_OPTION_PAIR`](#err_incompatible_option_pair), что согласуется с другими API.

### `ERR_FS_INVALID_SYMLINK_TYPE` {#err_fs_invalid_symlink_type}

В методы [`fs.symlink()`](fs.md#fssymlinktarget-path-type-callback) или [`fs.symlinkSync()`](fs.md#fssymlinksynctarget-path-type) был передан недопустимый тип симлинка.

### `ERR_HTTP2_FRAME_ERROR` {#err_http2_frame_error}

Используется, когда происходит сбой при отправке отдельного кадра в HTTP/2-сессии.

### `ERR_HTTP2_HEADERS_OBJECT` {#err_http2_headers_object}

Используется, когда ожидается объект заголовков HTTP/2.

### `ERR_HTTP2_HEADER_REQUIRED` {#err_http2_header_required}

Используется, когда в сообщении HTTP/2 отсутствует обязательный заголовок.

### `ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND` {#err_http2_info_headers_after_respond}

Информационные заголовки HTTP/2 можно отправлять только _до_ вызова метода `Http2Stream.prototype.respond()`.

### `ERR_HTTP2_STREAM_CLOSED` {#err_http2_stream_closed}

Используется, когда действие выполняется над потоком HTTP/2, который уже закрыт.

### `ERR_HTTP_INVALID_CHAR` {#err_http_invalid_char}

Используется, когда в сообщении о статусе HTTP-ответа (reason phrase) обнаружен недопустимый символ.

### `ERR_IMPORT_ASSERTION_TYPE_FAILED` {#err_import_assertion_type_failed}

Проверка import assertion завершилась неудачей, из-за чего указанный модуль нельзя импортировать.

### `ERR_IMPORT_ASSERTION_TYPE_MISSING` {#err_import_assertion_type_missing}

Отсутствует import assertion, из-за чего указанный модуль нельзя импортировать.

### `ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED` {#err_import_assertion_type_unsupported}

Атрибут импорта не поддерживается этой версией Node.js.

### `ERR_INDEX_OUT_OF_RANGE` {#err_index_out_of_range}

Заданный индекс выходил за пределы допустимого диапазона (например, отрицательные смещения).

### `ERR_INVALID_OPT_VALUE` {#err_invalid_opt_value}

В объекте параметров было передано недопустимое или неожиданное значение.

### `ERR_INVALID_OPT_VALUE_ENCODING` {#err_invalid_opt_value_encoding}

Была передана недопустимая или неизвестная кодировка файла.

### `ERR_INVALID_PERFORMANCE_MARK` {#err_invalid_performance_mark}

При использовании API измерения производительности (`perf_hooks`) метка производительности оказалась недопустимой.

### `ERR_INVALID_TRANSFER_OBJECT` {#err_invalid_transfer_object}

В `postMessage()` был передан недопустимый переносимый объект.

### `ERR_MANIFEST_ASSERT_INTEGRITY` {#err_manifest_assert_integrity}

Была предпринята попытка загрузить ресурс, но он не соответствовал целостности, заданной манифестом политики. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_DEPENDENCY_MISSING` {#err_manifest_dependency_missing}

Была предпринята попытка загрузить ресурс, но он не был указан как зависимость из места, откуда выполнялась загрузка. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_INTEGRITY_MISMATCH` {#err_manifest_integrity_mismatch}

Была предпринята попытка загрузить манифест политики, но в нём оказалось несколько записей для одного ресурса, которые не совпадали между собой. Приведите записи манифеста к совпадающему виду, чтобы устранить эту ошибку. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_INVALID_RESOURCE_FIELD` {#err_manifest_invalid_resource_field}

Ресурс манифеста политики имел недопустимое значение в одном из полей. Исправьте запись манифеста, чтобы устранить эту ошибку. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_INVALID_SPECIFIER` {#err_manifest_invalid_specifier}

Ресурс манифеста политики имел недопустимое значение в одном из отображений зависимостей. Исправьте запись манифеста, чтобы устранить эту ошибку. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_PARSE_POLICY` {#err_manifest_parse_policy}

Была предпринята попытка загрузить манифест политики, но его не удалось разобрать. Подробнее см. документацию по манифестам политики.

### `ERR_MANIFEST_TDZ` {#err_manifest_tdz}

Была предпринята попытка прочитать манифест политики, но его инициализация ещё не произошла. Вероятно, это ошибка в Node.js.

### `ERR_MANIFEST_UNKNOWN_ONERROR` {#err_manifest_unknown_onerror}

Манифест политики был загружен, но содержал неизвестное значение для поведения `"onerror"`. Подробнее см. документацию по манифестам политики.

### `ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST` {#err_missing_message_port_in_transfer_list}

Этот код ошибки заменён на [`ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`](#err_missing_transferable_in_transfer_list) в Node.js 15.0.0: старое название больше не отражает ситуацию, так как появились и другие переносимые типы.

### `ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST` {#err_missing_transferable_in_transfer_list}

Добавлено в: v15.0.0

Объект, который должен быть явно указан в аргументе `transferList`, находится в объекте, переданном вызову [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist), но не указан в `transferList` для этого вызова. Обычно это `MessagePort`.

В версиях Node.js до v15.0.0 здесь использовался код ошибки [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](#err_missing_message_port_in_transfer_list). Однако набор переносимых типов объектов был расширен и теперь охватывает больше типов, чем только `MessagePort`.

### `ERR_NAPI_CONS_PROTOTYPE_OBJECT` {#err_napi_cons_prototype_object}

Используется `Node-API`, когда `Constructor.prototype` не является объектом.

### `ERR_NAPI_TSFN_START_IDLE_LOOP` {#err_napi_tsfn_start_idle_loop}

В основном потоке значения удаляются из очереди, связанной с потокобезопасной функцией, в цикле ожидания. Эта ошибка означает, что при попытке запустить этот цикл произошёл сбой.

### `ERR_NAPI_TSFN_STOP_IDLE_LOOP` {#err_napi_tsfn_stop_idle_loop}

Когда в очереди больше не остаётся элементов, цикл ожидания должен быть приостановлен. Эта ошибка означает, что цикл ожидания не смог остановиться.

### `ERR_NO_LONGER_SUPPORTED` {#err_no_longer_supported}

API Node.js был вызван неподдерживаемым способом, например `Buffer.write(string, encoding, offset[, length])`.

### `ERR_OUTOFMEMORY` {#err_outofmemory}

Используется как общий код для обозначения того, что операция привела к состоянию нехватки памяти.

### `ERR_PARSE_HISTORY_DATA` {#err_parse_history_data}

Модулю `node:repl` не удалось разобрать данные из файла истории REPL.

### `ERR_SOCKET_CANNOT_SEND` {#err_socket_cannot_send}

Не удалось отправить данные через сокет.

### `ERR_STDERR_CLOSE` {#err_stderr_close}

Была предпринята попытка закрыть поток `process.stderr`. По замыслу Node.js пользовательскому коду не разрешается закрывать потоки `stdout` или `stderr`.

### `ERR_STDOUT_CLOSE` {#err_stdout_close}

Была предпринята попытка закрыть поток `process.stdout`. По замыслу Node.js пользовательскому коду не разрешается закрывать потоки `stdout` или `stderr`.

### `ERR_STREAM_READ_NOT_IMPLEMENTED` {#err_stream_read_not_implemented}

Используется, когда предпринимается попытка использовать читаемый поток, в котором не реализован [`readable._read()`](stream.md#readable_readsize).

### `ERR_TAP_LEXER_ERROR` {#err_tap_lexer_error}

Ошибка, представляющая неуспешное состояние лексера.

### `ERR_TAP_PARSER_ERROR` {#err_tap_parser_error}

Ошибка, представляющая неуспешное состояние парсера. Дополнительные сведения о токене, вызвавшем ошибку, доступны через свойство `cause`.

### `ERR_TAP_VALIDATION_ERROR` {#err_tap_validation_error}

Ошибка означает провал проверки TAP.

### `ERR_TLS_RENEGOTIATION_FAILED` {#err_tls_renegotiation_failed}

Используется, когда запрос на повторное согласование TLS завершился неудачей по неуточнённой причине.

### `ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER` {#err_transferring_externalized_sharedarraybuffer}

Во время сериализации встретился `SharedArrayBuffer`, память которого не управляется движком JavaScript или Node.js. Такой `SharedArrayBuffer` нельзя сериализовать.

Это возможно только если нативные аддоны создают `SharedArrayBuffer` в режиме «externalized» или переводят существующий `SharedArrayBuffer` в этот режим.

### `ERR_UNKNOWN_STDIN_TYPE` {#err_unknown_stdin_type}

Была предпринята попытка запустить процесс Node.js с неизвестным типом файла `stdin`. Обычно эта ошибка указывает на сбой в самом Node.js, хотя её может спровоцировать и пользовательский код.

### `ERR_UNKNOWN_STREAM_TYPE` {#err_unknown_stream_type}

Была предпринята попытка запустить процесс Node.js с неизвестным типом файла `stdout` или `stderr`. Обычно эта ошибка указывает на сбой в самом Node.js, хотя её может спровоцировать и пользовательский код.

### `ERR_V8BREAKITERATOR` {#err_v8breakiterator}

Использован API V8 `BreakIterator`, но полный набор данных ICU не установлен.

### `ERR_VALUE_OUT_OF_RANGE` {#err_value_out_of_range}

Используется, когда переданное значение выходит за пределы допустимого диапазона.

### `ERR_VM_MODULE_LINKING_ERRORED` {#err_vm_module_linking_errored}

Функция связывания вернула модуль, для которого связывание не удалось.

### `ERR_VM_MODULE_NOT_LINKED` {#err_vm_module_not_linked}

Модуль должен быть успешно связан до инстанцирования.

### `ERR_WORKER_UNSUPPORTED_EXTENSION` {#err_worker_unsupported_extension}

Путь к основному скрипту потока worker имеет неизвестное расширение файла.

### `ERR_ZLIB_BINDING_CLOSED` {#err_zlib_binding_closed}

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
