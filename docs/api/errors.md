---
title: Errors
description: Приложения, работающие в Node.js, обычно сталкиваются с четырьмя категориями ошибок
---

# Ошибки

Приложения, работающие на Node.js, обычно сталкиваются с четырьмя категориями ошибок:

-   Стандартные ошибки JavaScript, такие как {EvalError}, {SyntaxError}, {RangeError}, {ReferenceError}, {TypeError} и {URIError}.
-   Системные ошибки, вызванные ограничениями базовой операционной системы, например, попытка открыть несуществующий файл или попытка отправить данные через закрытый сокет.
-   Пользовательские ошибки, вызванные кодом приложения.
-   `AssertionError` - это специальный класс ошибок, которые могут быть вызваны, когда Node.js обнаруживает исключительное нарушение логики, которое никогда не должно происходить. Обычно их вызывает модуль `node:assert`.

Все JavaScript и системные ошибки, вызываемые Node.js, наследуются от или являются экземплярами стандартного класса JavaScript [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) и гарантированно предоставляют _по крайней мере_ свойства, доступные для этого класса.

<!-- 0000.part.md -->

## Распространение и перехват ошибок

Node.js поддерживает несколько механизмов для распространения и обработки ошибок, возникающих во время работы приложения. То, как эти ошибки сообщаются и обрабатываются, полностью зависит от типа `Error` и стиля вызываемого API.

Все ошибки JavaScript обрабатываются как исключения, которые _немедленно_ генерируют и выбрасывают ошибку, используя стандартный механизм JavaScript `throw`. Они обрабатываются с помощью конструкции [`try...catch`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch), предоставляемой языком JavaScript.

```js
// Выброс с ошибкой ReferenceError, потому что z не определен.
try {
    const m = 1;
    const n = m + z;
} catch (err) {
    // Обрабатываем ошибку здесь.
}
```

Любое использование механизма JavaScript `throw` вызовет исключение, которое _должно_ быть обработано с помощью `try...catch`, иначе процесс Node.js немедленно завершится.

За редким исключением, _синхронные_ API (любой блокирующий метод, который не принимает функцию `callback`, например, [`fs.readFileSync`](fs.md#fsreadfilesyncpath-options)), будут использовать `throw` для сообщения об ошибках.

Ошибки, возникающие в _асинхронных API_, могут сообщаться различными способами:

-   Большинство асинхронных методов, которые принимают функцию `callback`, принимают объект `Error`, передаваемый в качестве первого аргумента этой функции. Если первый аргумент не является `null` и представляет собой экземпляр `Error`, то произошла ошибка, которую следует обработать.

    ```js
    const fs = require('node:fs');
    fs.readFile(
        'файл, который не существует',
        (err, data) => {
            if (err) {
                console.error(
                    'Произошла ошибка при чтении файла!',
                    err
                );
                return;
            }
            // Иначе обрабатываем данные
        }
    );
    ```

-   Когда асинхронный метод вызывается на объекте, который является [`EventEmitter`](events.md#class-eventemitter), ошибки могут быть направлены в событие `'error'` этого объекта.

    ```js
    const net = require('node:net');
    const connection = net.connect('localhost');

    // Добавление обработчика события 'error' к потоку:
    connection.on('error', (err) => {
        // Если соединение сбрасывается сервером, или если не удается
        // соединиться вообще, или при любой ошибке, с которой столкнулось
        // соединением, ошибка будет отправлена сюда.
        console.error(err);
    });

    connection.pipe(process.stdout);
    ```

-   Несколько типично асинхронных методов в API Node.js все еще могут использовать механизм `throw` для создания исключений, которые должны обрабатываться с помощью `try...catch`. Полного списка таких методов нет; пожалуйста, обратитесь к документации каждого метода для определения требуемого механизма обработки ошибок.

Использование механизма событий `error` наиболее характерно для API [stream-based](stream.md) и [event emitter-based](events.md#class-eventemitter), которые сами по себе представляют серию асинхронных операций во времени (в отличие от одной операции, которая может пройти или не пройти).

```js
const EventEmitter = require('node:events');
const ee = new EventEmitter();

setImmediate(() => {
    // This will crash the process because no 'error' event
    // handler has been added.
    ee.emit('error', new Error('This will crash'));
});
```

Ошибки, сгенерированные таким образом, _не могут_ быть перехвачены с помощью `try...catch`, поскольку они возникают _после_ того, как вызывающий код уже завершился.

Разработчики должны обратиться к документации для каждого метода, чтобы определить, как именно распространяются ошибки, вызванные этими методами.

### Обратные вызовы по ошибке

Большинство асинхронных методов, представленных в API ядра Node.js, следуют идиоматическому шаблону, называемому _первым обратным вызовом при ошибке_. В этом шаблоне функция обратного вызова передается методу в качестве аргумента. Когда операция либо завершается, либо возникает ошибка, вызывается функция обратного вызова с объектом `Error` (если таковой имеется), переданным в качестве первого аргумента. Если ошибка не была обнаружена, первый аргумент будет передан как `null`.

```js
const fs = require('node:fs');

function errorFirstCallback(err, data) {
    if (err) {
        console.error('Произошла ошибка', err);
        return;
    }
    console.log(data);
}

fs.readFile(
    '/some/file/that/does-not-exist',
    errorFirstCallback
);
fs.readFile(
    '/some/file/that/does-exist',
    errorFirstCallback
);
```

Механизм JavaScript `try...catch` **нельзя** использовать для перехвата ошибок, генерируемых асинхронными API. Частой ошибкой новичков является попытка использовать `throw` внутри обратного вызова error-first:

```js
// THIS WILL NOT WORK:
const fs = require('node:fs');

try {
    fs.readFile(
        '/some/file/that/does-not-exist',
        (err, data) => {
            // Mistaken assumption: throwing here...
            if (err) {
                throw err;
            }
        }
    );
} catch (err) {
    // This will not catch the throw!
    console.error(err);
}
```

Это не сработает, потому что функция обратного вызова, переданная в `fs.readFile()`, вызывается асинхронно. К тому моменту, когда callback будет вызван, окружающий код, включая блок `try...catch`, уже завершится. Выброс ошибки внутри обратного вызова **может привести к краху процесса Node.js** в большинстве случаев. Если включены [domains](domain.md), или обработчик был зарегистрирован в `process.on('uncaughtException')`, такие ошибки могут быть перехвачены.

<!-- 0002.part.md -->

## Класс: `Error`

Общий объект JavaScript [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), который не обозначает никаких конкретных обстоятельств того, почему произошла ошибка. Объекты `Error` фиксируют "трассировку стека", детализирующую точку в коде, в которой `Error` был инстанцирован, и могут предоставлять текстовое описание ошибки.

Все ошибки, генерируемые Node.js, включая все системные ошибки и ошибки JavaScript, будут либо экземплярами класса `Error`, либо наследоваться от него.

<!-- 0003.part.md -->

### ### `new Error(message[, options])`

-   `сообщение` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cause` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Ошибка, которая вызвала вновь созданную ошибку.

Создает новый объект `Error` и устанавливает свойство `error.message` в предоставленное текстовое сообщение. Если в качестве `message` передан объект, текстовое сообщение генерируется вызовом `String(message)`. Если передана опция `cause`, она присваивается свойству `error.cause`. Свойство `error.stack` будет представлять точку в коде, в которой была вызвана `new Error()`. Трассировка стека зависит от [V8's stack trace API](https://v8.dev/docs/stack-trace-api). Трассировка стека распространяется только на (a) начало _синхронного выполнения кода_, или (b) количество кадров, заданное свойством `Error.stackTraceLimit`, в зависимости от того, что меньше.

<!-- 0004.part.md -->

### `Error.captureStackTrace(targetObject[, constructorOpt])`

-   `targetObject` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `constructorOpt` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Создает свойство `.stack` на `targetObject`, которое при обращении к нему возвращает строку, представляющую место в коде, в котором была вызвана `Error.captureStackTrace()`.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack; // Аналогично `new Error().stack`.
```

Первая строка трассировки будет иметь префикс `${myObject.name}: ${myObject.message}`.

Необязательный аргумент `constructorOpt` принимает функцию. Если он задан, все фреймы выше `constructorOpt`, включая `constructorOpt`, будут опущены в сгенерированной трассировке стека.

Аргумент `constructorOpt` полезен для сокрытия от пользователя деталей реализации генерации ошибок. Например:

```js
function MyError() {
    Error.captureStackTrace(this, MyError);
}

// Без передачи MyError в captureStackTrace, MyError
// кадр будет отображаться в свойстве .stack. Передавая
// конструктору, мы опускаем этот кадр и сохраняем все кадры ниже него.
new MyError().stack;
```

<!-- 0005.part.md -->

### `Error.stackTraceLimit`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `Error.stackTraceLimit` определяет количество кадров стека, собираемых трассировкой стека (независимо от того, генерируется ли она `new Error().stack` или `Error.captureStackTrace(obj)`).

Значение по умолчанию - `10`, но может быть установлено в любое допустимое число JavaScript. Изменения будут влиять на любую трассировку стека, захваченную _после_ изменения значения.

Если значение не равно числу или равно отрицательному числу, трассировка стека не будет фиксироваться.

<!-- 0006.part.md -->

### `error.cause`

-   {любая}

Если присутствует, свойство `error.cause` является основной причиной `Error`. Оно используется, когда вы ловите ошибку и бросаете новую с другим сообщением или кодом, чтобы сохранить доступ к исходной ошибке.

Свойство `error.cause` обычно устанавливается вызовом `new Error(message, { cause })`. Оно не устанавливается конструктором, если не указан параметр `cause`.

Это свойство позволяет связывать ошибки в цепочку. При сериализации объектов `Error`, [`util.inspect()`](util.md#utilinspectobject-options) рекурсивно сериализует `error.cause`, если оно установлено.

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

<!-- 0007.part.md -->

### `error.code`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.code` - это строковая метка, которая идентифицирует вид ошибки. `error.code` является наиболее стабильным способом идентификации ошибки. Он будет меняться только между основными версиями Node.js. В отличие от этого, строки `error.message` могут изменяться между любыми версиями Node.js. Подробности о конкретных кодах см. в [Node.js error codes](#nodejs-error-codes).

<!-- 0008.part.md -->

### `error.message`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.message` - это строковое описание ошибки, заданное вызовом `new Error(message)`. Переданное конструктору `message` также появится в первой строке трассировки стека `Error`, однако изменение этого свойства после создания объекта `Error` может не изменить первую строку трассировки стека (например, если `error.stack` будет прочитан до изменения этого свойства).

```js
const err = new Error('Сообщение');
console.error(err.message);
// Выводит: Сообщение
```

<!-- 0009.part.md -->

### `error.stack`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.stack` представляет собой строку, описывающую точку в коде, в которой `Error` была инстанцирована.

```console
Error: Things keep happening!
   at /home/gbusey/file.js:525:2
   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)
   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)
   at increaseSynergy (/home/gbusey/actors.js:701:6)
```

Первая строка отформатирована как `<имя класса ошибки>: <сообщение об ошибке>`, а за ней следует серия стековых кадров (каждая строка начинается с "at"). Каждый кадр описывает место вызова в коде, которое привело к возникновению ошибки. V8 пытается отобразить имя для каждой функции (по имени переменной, имени функции или имени метода объекта), но иногда ему не удается найти подходящее имя. Если V8 не может определить имя функции, для этого кадра будет отображаться только информация о местоположении. В противном случае будет выведено определенное имя функции с информацией о местоположении, заключенной в круглые скобки.

Фреймы генерируются только для функций JavaScript. Если, например, выполнение синхронно проходит через функцию аддона C++ под названием `cheetahify`, которая сама вызывает функцию JavaScript, фрейм, представляющий вызов `cheetahify`, не будет присутствовать в стековых трассах:

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

Информация о местоположении будет одной из:

-   `native`, если кадр представляет собой вызов внутри V8 (как в `[].forEach`).
-   `plain-filename.js:line:column`, если фрейм представляет собой вызов внутри Node.js.
-   `/absolute/path/to/file.js:line:column`, если фрейм представляет собой вызов в пользовательской программе (использующей систему модулей CommonJS), или ее зависимостях.
-   `<transport-protocol>:///url/to/module/file.mjs:line:column`, если кадр представляет собой вызов в пользовательской программе (с использованием системы модулей ES), или ее зависимостей.

Строка, представляющая трассировку стека, лениво генерируется при \*\*обращении к свойству `error.stack`.

Количество кадров, захватываемых трассировкой стека, ограничено меньшим из значений `Error.stackTraceLimit` или количеством доступных кадров на текущем такте цикла событий.

<!-- 0010.part.md -->

## Класс: `AssertionError`

-   Расширяет: [`<errors.Error>`](errors.md#error)

Указывает на неудачу утверждения. Подробнее см. в [`Класс: assert.AssertionError`](assert.md#class-assertassertionerror).

<!-- 0011.part.md -->

## Класс: `RangeError`

-   Расширяет: [`<errors.Error>`](errors.md#error)

Указывает, что предоставленный аргумент не входит в набор или диапазон допустимых значений для функции; будь то числовой диапазон, или вне набора опций для данного параметра функции.

```js
require('node:net').connect(-1);
// Выбрасывает "RangeError: параметр "port" должен быть >= 0 и < 65536: -1"
```

Node.js будет генерировать и бросать экземпляры `RangeError` _немедленно_ в качестве формы проверки аргументов.

<!-- 0012.part.md -->

## Класс: `ReferenceError`

-   Расширяет: [`<errors.Error>`](errors.md#error)

Указывает на попытку доступа к переменной, которая не определена. Такие ошибки обычно указывают на опечатки в коде или на другие сбои в программе.

Хотя клиентский код может генерировать и распространять эти ошибки, на практике это делает только V8.

```js
doesNotExist;
// Выбрасывает ошибку ReferenceError, doesNotExist не является переменной в этой программе.
```

Если только приложение не генерирует и не выполняет код динамически, случаи `ReferenceError` указывают на ошибку в коде или его зависимостях.

<!-- 0013.part.md -->

## Класс: `SyntaxError`

-   Расширяет: [`<errors.Error>`](errors.md#error)

Указывает, что программа не является валидным JavaScript. Эти ошибки могут генерироваться и распространяться только в результате оценки кода. Оценка кода может происходить в результате `eval`, `Function`, `require` или [vm](vm.md). Эти ошибки почти всегда свидетельствуют о неработающей программе.

```js
try {
    require('node:vm').runInThisContext('binary ! isNotOk');
} catch (err) {
    // 'err' will be a SyntaxError.
}
```

Экземпляры `SyntaxError` не могут быть устранены в контексте, который их создал - они могут быть пойманы только другими контекстами.

<!-- 0014.part.md -->

## Класс: `SystemError`

-   Расширяет: [`<errors.Error>`](errors.md#error)

Node.js генерирует системные ошибки, когда в среде выполнения возникают исключения. Обычно они возникают, когда приложение нарушает ограничения операционной системы. Например, системная ошибка возникнет, если приложение попытается прочитать несуществующий файл.

-   `address` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если присутствует, адрес, с которым произошел сбой сетевого соединения.
-   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковый код ошибки
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если присутствует, назначение пути к файлу при сообщении об ошибке файловой системы
-   `errno` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер ошибки, предоставляемый системой
-   `info` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если присутствует, дополнительные сведения о состоянии ошибки
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Предоставленное системой человекочитаемое описание ошибки
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если присутствует, путь к файлу при сообщении об ошибке файловой системы
-   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если присутствует, порт сетевого подключения, который недоступен
-   `syscall` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя системного вызова, вызвавшего ошибку

<!-- 0015.part.md -->

### `error.address`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если присутствует, `error.address` - это строка, описывающая адрес, с которым не удалось установить сетевое соединение.

<!-- 0016.part.md -->

### `error.code`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.code` - это строка, представляющая код ошибки.

<!-- 0017.part.md -->

### `error.dest`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если присутствует, то `error.dest` является местом назначения пути к файлу при сообщении об ошибке файловой системы.

<!-- 0018.part.md -->

### `error.errno`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `error.errno` - это отрицательное число, которое соответствует коду ошибки, определенному в [`libuv Error handling`](https://docs.libuv.org/en/v1.x/errors.html).

В Windows номер ошибки, предоставляемый системой, будет нормализован libuv.

Чтобы получить строковое представление кода ошибки, используйте [`util.getSystemErrorName(error.errno)`](util.md#utilgetsystemerrornameerr).

<!-- 0019.part.md -->

### `error.info`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Если присутствует, `error.info` - это объект с подробной информацией о состоянии ошибки.

<!-- 0020.part.md -->

### `error.message`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

`error.message` - это предоставленное системой человекочитаемое описание ошибки.

<!-- 0021.part.md -->

### `error.path`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если присутствует, `error.path` - это строка, содержащая соответствующее неверное имя пути.

<!-- 0022.part.md -->

### `error.port`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Если присутствует, `error.port` - это порт сетевого подключения, который недоступен.

<!-- 0023.part.md -->

### `error.syscall`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `error.syscall` - это строка, описывающая [syscall](https://man7.org/linux/man-pages/man2/syscalls.2.html), который завершился неудачей.

<!-- 0024.part.md -->

### Общие системные ошибки

Это список системных ошибок, часто встречающихся при написании программ на Node.js. Полный список см. на странице [`errno`(3) man page](https://man7.org/linux/man-pages/man3/errno.3.html).

-   `EACCES` (Разрешение отклонено): Была предпринята попытка получить доступ к файлу способом, запрещенным его разрешениями на доступ к файлу.

-   `EADDRINUSE` (Адрес уже используется): Попытка привязать сервер ([`net`](net.md), [`http`](http.md) или [`https`](https.md)) к локальному адресу не удалась из-за того, что другой сервер в локальной системе уже занимает этот адрес.

-   `ECONNREFUSED` (Connection refused): Не удалось установить соединение, поскольку целевая машина активно отказывается от него. Обычно это происходит при попытке подключения к службе, которая неактивна на внешнем узле.

-   `ECONNRESET` (Connection reset by peer): Соединение было принудительно закрыто сверстником. Обычно это происходит в результате потери соединения на удаленном сокете из-за тайм-аута или перезагрузки. Часто встречается в модулях [`http`](http.md) и [`net`](net.md).

-   `EEXIST` (Файл существует): Существующий файл был целью операции, которая требовала, чтобы цель не существовала.

-   `EISDIR` (Is a directory): Операция ожидала файл, но заданный путь оказался каталогом.

-   `EMFILE` (Слишком много открытых файлов в системе): Максимальное количество [файловых дескрипторов](https://en.wikipedia.org/wiki/File_descriptor), допустимое в системе, достигнуто, и запросы на другой дескриптор не могут быть выполнены, пока не будет закрыт хотя бы один. Это происходит при параллельном открытии большого количества файлов одновременно, особенно на системах (в частности, macOS), где существует низкий лимит файловых дескрипторов для процессов. Чтобы устранить низкий лимит, запустите `ulimit -n 2048` в той же оболочке, в которой будет запущен процесс Node.js.

-   `ENOENT` (Нет такого файла или каталога): Обычно вызывается операциями [`fs`](fs.md), указывая на то, что компонент указанного пути не существует. По указанному пути не удалось найти ни одной сущности (файла или каталога).

-   `ENOTDIR` (Не каталог): Компонент указанного пути существует, но не является каталогом, как ожидалось. Обычно вызывается [`fs.readdir`](fs.md#fsreaddirpath-options-callback).

-   `ENOTEMPTY` (Каталог не пуст): Каталог с записями был целью операции, требующей пустого каталога, обычно [`fs.unlink`](fs.md#fsunlinkpath-callback).

-   `ENOTFOUND` (DNS-поиск не удался): Указывает на ошибку DNS либо `EAI_NODATA`, либо `EAI_NONAME`. Это не стандартная ошибка POSIX.

-   `EPERM` (Операция не разрешена): Была предпринята попытка выполнить операцию, требующую повышенных привилегий.

-   `EPIPE` (Сломанная труба): Запись в трубу, сокет или FIFO, для которой нет процесса для чтения данных. Обычно встречается на уровнях [`net`](net.md) и [`http`](http.md), указывая на то, что удаленная сторона потока, на которую производится запись, была закрыта.

-   `ETIMEDOUT` (Операция завершилась): Запрос на подключение или отправку не прошел, потому что

<!-- 0025.part.md -->

## Класс: `TypeError`

-   Расширяет [`<errors.Error>`](errors.md#error)

Указывает, что предоставленный аргумент не является допустимым типом. Например, передача функции в параметр, который ожидает строку, будет `TypeError`.

```js
require('node:url').parse(() => {});
// Выбросит TypeError, так как ожидается строка.
```

Node.js будет генерировать и бросать экземпляры `TypeError` _немедленно_ в качестве формы проверки аргументов.

<!-- 0026.part.md -->

## Исключения и ошибки

Исключение JavaScript - это значение, которое выбрасывается в результате некорректной операции или как цель оператора `throw`. Хотя не требуется, чтобы эти значения были экземплярами `Error` или классами, наследующими от `Error`, все исключения, выбрасываемые Node.js или временем выполнения JavaScript, _будут_ экземплярами `Error`.

Некоторые исключения являются _неустранимыми_ на уровне JavaScript. Такие исключения _всегда_ приводят к аварийному завершению процесса Node.js. Примерами могут служить проверки `assert()` или вызовы `abort()` на уровне C++.

<!-- 0027.part.md -->

## Ошибки OpenSSL

Ошибки, возникающие в `crypto` или `tls`, относятся к классу `Error`, и помимо стандартных свойств `.code` и `.message` могут иметь некоторые дополнительные свойства, специфичные для OpenSSL.

<!-- 0028.part.md -->

### `error.opensslErrorStack`

Массив ошибок, который может дать представление о том, в каком месте библиотеки OpenSSL возникла ошибка.

<!-- 0029.part.md -->

### `error.function`

Функция OpenSSL, в которой возникла ошибка.

<!-- 0030.part.md -->

### `error.library`

Библиотека OpenSSL, в которой возникла ошибка.

<!-- 0031.part.md -->

### `error.reason`

Человекочитаемая строка, описывающая причину ошибки.

<!-- 0032.part.md -->

## Node.js error codes

<!-- 0033.part.md -->

### `ABORT_ERR`

Используется, когда операция была прервана (обычно с помощью `AbortController`).

API, _не_ использующие `AbortSignal`, обычно не выдают ошибку с этим кодом.

Этот код не использует обычное соглашение `ERR_*`, которое используется в ошибках Node.js, чтобы быть совместимым с `AbortError` веб-платформы.

<!-- 0034.part.md -->

### `ERR_ACCESS_DENIED`

Специальный тип ошибки, возникающий всякий раз, когда Node.js пытается получить доступ к ресурсу, ограниченному [Permission Model](permissions.md#permission-model).

<!-- 0035.part.md -->

### `ERR_AMBIGUOUS_ARGUMENT`

Аргумент функции используется таким образом, что подпись функции может быть неправильно понята. Модуль `node:assert` выбрасывает это сообщение, когда параметр `message` в `assert.throws(block, message)` совпадает с сообщением об ошибке, выброшенным `block`, поскольку такое использование предполагает, что пользователь считает `message` ожидаемым сообщением, а не сообщением, которое отобразит `AssertionError`, если `block` не выбросит сообщение.

<!-- 0036.part.md -->

### `ERR_ARG_NOT_ITERABLE`

Аргумент iterable (т.е. значение, которое работает с циклами `for...of`) был необходим, но не предоставлялся API Node.js.

<!-- 0037.part.md -->

### `ERR_ASSERTION`

Специальный тип ошибки, который может быть вызван всякий раз, когда Node.js обнаруживает исключительное нарушение логики, которое никогда не должно происходить. Обычно их вызывает модуль `node:assert`.

<!-- 0038.part.md -->

### `ERR_ASYNC_CALLBACK`

Была предпринята попытка зарегистрировать что-то, что не является функцией, в качестве обратного вызова `AsyncHooks`.

<!-- 0039.part.md -->

### `ERR_ASYNC_TYPE`

Тип асинхронного ресурса был неверным. Пользователи также могут определять свои собственные типы при использовании общедоступного API embedder.

<!-- 0040.part.md -->

### `ERR_BROTLI_COMPRESSION_FAILED`

Данные, переданные в поток Brotli, не были успешно сжаты.

<!-- 0041.part.md -->

### `ERR_BROTLI_INVALID_PARAM`

При построении потока Brotli был передан недопустимый ключ параметра.

<!-- 0042.part.md -->

### `ERR_BUFFER_CONTEXT_NOT_AVAILABLE`

Была предпринята попытка создать экземпляр Node.js `Buffer` из кода аддона или embedder, находясь в JS-движке Context, который не связан с экземпляром Node.js. Данные, переданные в метод `Buffer`, будут освобождены к моменту возврата метода.

При возникновении этой ошибки возможной альтернативой созданию экземпляра `Buffer` является создание обычного `Uint8Array`, который отличается только прототипом получаемого объекта. `Uint8Array` общеприняты во всех основных API Node.js, где есть `Buffer`; они доступны во всех Contexts.

<!-- 0043.part.md -->

### `ERR_BUFFER_OUT_OF_BOUNDS`

Была предпринята попытка выполнить операцию, выходящую за пределы `Буфера`.

<!-- 0044.part.md -->

### `ERR_BUFFER_TOO_LARGE`

Была предпринята попытка создать `Буфер` большего размера, чем максимально допустимый.

<!-- 0045.part.md -->

### `ERR_CANNOT_WATCH_SIGINT`

Node.js не смог проследить за сигналом `SIGINT`.

<!-- 0046.part.md -->

### `ERR_CHILD_CLOSED_BEFORE_REPLY`

Дочерний процесс был закрыт до того, как родительский процесс получил ответ.

<!-- 0047.part.md -->

### `ERR_CHILD_PROCESS_IPC_REQUIRED`

Используется, когда дочерний процесс форкируется без указания IPC-канала.

<!-- 0048.part.md -->

### `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`

Используется, когда основной процесс пытается прочитать данные из STDERR/STDOUT дочернего процесса, и длина данных превышает параметр `maxBuffer`.

<!-- 0049.part.md -->

### `ERR_CLOSED_MESSAGE_PORT`

Была попытка использовать экземпляр `MessagePort` в закрытом состоянии, обычно после вызова `.close()`.

<!-- 0050.part.md -->

### `ERR_CONSOLE_WRITABLE_STREAM`

`Console` была создана без потока `stdout`, или `Console` имеет незаписываемый поток `stdout` или `stderr`.

<!-- 0051.part.md -->

### `ERR_CONSTRUCT_CALL_INVALID`

Был вызван конструктор класса, который не является вызываемым.

<!-- 0052.part.md -->

### `ERR_CONSTRUCT_CALL_REQUIRED`

Конструктор для класса был вызван без `new`.

<!-- 0053.part.md -->

### `ERR_CONTEXT_NOT_INITIALIZED`

Контекст vm, переданный в API, еще не инициализирован. Это может произойти, если во время создания контекста произошла (и была поймана) ошибка, например, если при создании контекста произошел сбой выделения или был достигнут максимальный размер стека вызовов.

<!-- 0054.part.md -->

### `ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED`

Был запрошен механизм клиентского сертификата, который не поддерживается используемой версией OpenSSL.

<!-- 0055.part.md -->

### `ERR_CRYPTO_ECDH_INVALID_FORMAT`

В метод `getPublicKey()` класса `crypto.ECDH()` было передано недопустимое значение аргумента `format`.

<!-- 0056.part.md -->

### `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY`

В метод `crypto.ECDH()` класса `computeSecret()` было передано недопустимое значение аргумента `key`. Это означает, что открытый ключ лежит за пределами эллиптической кривой.

<!-- 0057.part.md -->

### `ERR_CRYPTO_ENGINE_UNKNOWN`

В [`require('node:crypto').setEngine()`](crypto.md#cryptosetengineengine-flags) был передан неверный идентификатор криптографического движка.

<!-- 0058.part.md -->

### `ERR_CRYPTO_FIPS_FORCED`

Был использован аргумент командной строки [`--force-fips`](cli.md#--force-fips), но была попытка включить или отключить режим FIPS в модуле `node:crypto`.

<!-- 0059.part.md -->

### `ERR_CRYPTO_FIPS_UNAVAILABLE`

Была предпринята попытка включить или отключить режим FIPS, но режим FIPS был недоступен.

<!-- 0060.part.md -->

### `ERR_CRYPTO_HASH_FINALIZED`

[`hash.digest()`](crypto.md#hashdigestencoding) был вызван несколько раз. Метод `hash.digest()` должен вызываться не более одного раза для каждого экземпляра объекта `Hash`.

<!-- 0061.part.md -->

### `ERR_CRYPTO_HASH_UPDATE_FAILED`

[`hash.update()`](crypto.md#hashupdatedata-inputencoding) не удалось по какой-либо причине. Это должно происходить редко, если вообще происходит.

<!-- 0062.part.md -->

### `ERR_CRYPTO_INCOMPATIBLE_KEY`

Данные криптографические ключи несовместимы с предпринимаемой операцией.

<!-- 0063.part.md -->

### `ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS`

Выбранная кодировка открытого или закрытого ключа несовместима с другими вариантами.

<!-- 0064.part.md -->

### `ERR_CRYPTO_INITIALIZATION_FAILED`

Инициализация криптоподсистемы не удалась.

<!-- 0065.part.md -->

### `ERR_CRYPTO_INVALID_AUTH_TAG`

Был предоставлен недопустимый тег аутентификации.

<!-- 0066.part.md -->

### `ERR_CRYPTO_INVALID_COUNTER`

Для шифра с режимом счетчика был предоставлен некорректный счетчик.

<!-- 0067.part.md -->

### `ERR_CRYPTO_INVALID_CURVE`

Была предоставлена недопустимая эллиптическая кривая.

<!-- 0068.part.md -->

### `ERR_CRYPTO_INVALID_DIGEST`

Был указан неверный [алгоритм криптодайджеста](crypto.md#cryptogethashes).

<!-- 0069.part.md -->

### `ERR_CRYPTO_INVALID_IV`

Был предоставлен недопустимый вектор инициализации.

<!-- 0070.part.md -->

### `ERR_CRYPTO_INVALID_JWK`

Был предоставлен недопустимый веб-ключ JSON.

<!-- 0071.part.md -->

### `ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE`

Тип данного объекта криптографического ключа не подходит для данной операции.

<!-- 0072.part.md -->

### `ERR_CRYPTO_INVALID_KEYLEN`

Указана недопустимая длина ключа.

<!-- 0073.part.md -->

### `ERR_CRYPTO_INVALID_KEYPAIR`

Была предоставлена недопустимая пара ключей.

<!-- 0074.part.md -->

### `ERR_CRYPTO_INVALID_KEYTYPE`

Был предоставлен недопустимый тип ключа.

<!-- 0075.part.md -->

### `ERR_CRYPTO_INVALID_MESSAGELEN`

Была предоставлена недопустимая длина сообщения.

<!-- 0076.part.md -->

### `ERR_CRYPTO_INVALID_SCRYPT_PARAMS`

Были предоставлены неверные параметры алгоритма scrypt.

<!-- 0077.part.md -->

### `ERR_CRYPTO_INVALID_STATE`

Метод crypto был использован на объекте, который находился в недопустимом состоянии. Например, вызов [`cipher.getAuthTag()`](crypto.md#ciphergetauthtag) перед вызовом `cipher.final()`.

<!-- 0078.part.md -->

### `ERR_CRYPTO_INVALID_TAG_LENGTH`

Была указана недопустимая длина тега аутентификации.

<!-- 0079.part.md -->

### `ERR_CRYPTO_JOB_INIT_FAILED`

Инициализация асинхронной криптооперации не удалась.

<!-- 0080.part.md -->

### `ERR_CRYPTO_JWK_UNSUPPORTED_CURVE`

Эллиптическая кривая ключа не зарегистрирована для использования в [JSON Web Key Elliptic Curve Registry](https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve).

<!-- 0081.part.md -->

### `ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE`

Асимметричный тип ключа не зарегистрирован для использования в [JSON Web Key Types Registry](https://www.iana.org/assignments/jose/jose.xhtml#web-key-types).

<!-- 0082.part.md -->

### `ERR_CRYPTO_OPERATION_FAILED`

Криптооперация завершилась неудачно по неустановленной причине.

<!-- 0083.part.md -->

### `ERR_CRYPTO_PBKDF2_ERROR`

Алгоритм PBKDF2 не сработал по неустановленным причинам. OpenSSL не предоставляет более подробной информации, и, соответственно, Node.js тоже.

<!-- 0084.part.md -->

### `ERR_CRYPTO_SCRYPT_INVALID_PARAMETER`

Один или несколько параметров [`crypto.scrypt()`](crypto.md#cryptoscryptpassword-salt-keylen-options-callback) или [`crypto.scryptSync()`](crypto.md#cryptoscryptsyncpassword-salt-keylen-options) находятся вне своего законного диапазона.

<!-- 0085.part.md -->

### `ERR_CRYPTO_SCRYPT_NOT_SUPPORTED`.

Node.js был скомпилирован без поддержки `scrypt`. Невозможно с двоичными файлами официального релиза, но может произойти с пользовательскими сборками, включая сборки дистрибутивов.

<!-- 0086.part.md -->

### `ERR_CRYPTO_SIGN_KEY_REQUIRED`.

Методу [`sign.sign()`](crypto.md#signsignprivatekey-outputencoding) не был предоставлен ключ подписи.

<!-- 0087.part.md -->

### `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`

[`crypto.timingSafeEqual()`](crypto.md#cryptotimingsafeequala-b) был вызван с аргументами `Buffer`, `TypedArray` или `DataView` разной длины.

<!-- 0088.part.md -->

### `ERR_CRYPTO_UNKNOWN_CIPHER`.

Был указан неизвестный шифр.

<!-- 0089.part.md -->

### `ERR_CRYPTO_UNKNOWN_DH_GROUP`

Указано неизвестное имя группы Диффи-Хеллмана. Список допустимых имен групп см. в [`crypto.getDiffieHellman()`](crypto.md#cryptogetdiffiehellmangroupname).

<!-- 0090.part.md -->

### `ERR_CRYPTO_UNSUPPORTED_OPERATION`

Была предпринята попытка вызвать неподдерживаемую криптооперацию.

<!-- 0091.part.md -->

### `ERR_DEBUGGER_ERROR`

Произошла ошибка при работе с [отладчиком](debugger.md).

<!-- 0092.part.md -->

### `ERR_DEBUGGER_STARTUP_ERROR`

[Отладчик](debugger.md) затянул время, ожидая, пока освободится требуемый хост/порт.

<!-- 0093.part.md -->

### `ERR_DLOPEN_DISABLED`

Загрузка родных аддонов была отключена с помощью [`--no-addons`](cli.md#--no-addons).

<!-- 0094.part.md -->

### `ERR_DLOPEN_FAILED`

Вызов `process.dlopen()` не удался.

<!-- 0095.part.md -->

### `ERR_DIR_CLOSED`

Каталог [`fs.Dir`](fs.md#class-fsdir) был ранее закрыт.

<!-- 0096.part.md -->

### `ERR_DIR_CONCURRENT_OPERATION`

A synchronous read or close call was attempted on an [`fs.Dir`](fs.md#class-fsdir) which has ongoing asynchronous operations.

<!-- 0097.part.md -->

### `ERR_DNS_SET_SERVERS_FAILED`

`c-ares` failed to set the DNS server.

<!-- 0098.part.md -->

### `ERR_DOMAIN_CALLBACK_NOT_AVAILABLE`

The `node:domain` module was not usable since it could not establish the required error handling hooks, because [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) had been called at an earlier point in time.

<!-- 0099.part.md -->

### `ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) could not be called because the `node:domain` module has been loaded at an earlier point in time.

The stack trace is extended to include the point in time at which the `node:domain` module had been loaded.

<!-- 0100.part.md -->

### `ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION`

[`v8.startupSnapshot.setDeserializeMainFunction()`](v8.md#v8startupsnapshotsetdeserializemainfunctioncallback-data) could not be called because it had already been called before.

<!-- 0101.part.md -->

### `ERR_ENCODING_INVALID_ENCODED_DATA`

Data provided to `TextDecoder()` API was invalid according to the encoding provided.

<a id="ERR_ENCODING_NOT_SUPPORTED"></a>

<!-- 0102.part.md -->

### `ERR_ENCODING_NOT_SUPPORTED`

Encoding provided to `TextDecoder()` API was not one of the [WHATWG Supported Encodings](util.md#whatwg-supported-encodings).

<a id="ERR_EVAL_ESM_CANNOT_PRINT"></a>

<!-- 0103.part.md -->

### `ERR_EVAL_ESM_CANNOT_PRINT`

`--print` cannot be used with ESM input.

<a id="ERR_EVENT_RECURSION"></a>

<!-- 0104.part.md -->

### `ERR_EVENT_RECURSION`

Thrown when an attempt is made to recursively dispatch an event on `EventTarget`.

<a id="ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE"></a>

<!-- 0105.part.md -->

### `ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE`

The JS execution context is not associated with a Node.js environment. This may occur when Node.js is used as an embedded library and some hooks for the JS engine are not set up properly.

<a id="ERR_FALSY_VALUE_REJECTION"></a>

<!-- 0106.part.md -->

### `ERR_FALSY_VALUE_REJECTION`

A `Promise` that was callbackified via `util.callbackify()` was rejected with a falsy value.

<a id="ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"></a>

<!-- 0107.part.md -->

### `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM`

Used when a feature that is not available to the current platform which is running Node.js is used.

<a id="ERR_FS_CP_DIR_TO_NON_DIR"></a>

<!-- 0108.part.md -->

### `ERR_FS_CP_DIR_TO_NON_DIR`

An attempt was made to copy a directory to a non-directory (file, symlink, etc.) using [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_EEXIST"></a>

<!-- 0109.part.md -->

### `ERR_FS_CP_EEXIST`

An attempt was made to copy over a file that already existed with [`fs.cp()`](fs.md#fscpsrc-dest-options-callback), with the `force` and `errorOnExist` set to `true`.

<a id="ERR_FS_CP_EINVAL"></a>

<!-- 0110.part.md -->

### `ERR_FS_CP_EINVAL`

When using [`fs.cp()`](fs.md#fscpsrc-dest-options-callback), `src` or `dest` pointed to an invalid path.

<a id="ERR_FS_CP_FIFO_PIPE"></a>

<!-- 0111.part.md -->

### `ERR_HTTP_CONTENT_LENGTH_MISMATCH`

Response body size doesn’t match with the specified content-length header value.

<a id="ERR_HTTP_CONTENT_LENGTH_MISMATCH"></a>

<!-- 0112.part.md -->

### `ERR_FS_CP_FIFO_PIPE`

An attempt was made to copy a named pipe with [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_NON_DIR_TO_DIR"></a>

<!-- 0113.part.md -->

### `ERR_FS_CP_NON_DIR_TO_DIR`

An attempt was made to copy a non-directory (file, symlink, etc.) to a directory using [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_SOCKET"></a>

<!-- 0114.part.md -->

### `ERR_FS_CP_SOCKET`

An attempt was made to copy to a socket with [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY"></a>

<!-- 0115.part.md -->

### `ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY`

When using [`fs.cp()`](fs.md#fscpsrc-dest-options-callback), a symlink in `dest` pointed to a subdirectory of `src`.

<a id="ERR_FS_CP_UNKNOWN"></a>

<!-- 0116.part.md -->

### `ERR_FS_CP_UNKNOWN`

An attempt was made to copy to an unknown file type with [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_EISDIR"></a>

<!-- 0117.part.md -->

### `ERR_FS_EISDIR`

Path is a directory.

<a id="ERR_FS_FILE_TOO_LARGE"></a>

<!-- 0118.part.md -->

### `ERR_FS_FILE_TOO_LARGE`

An attempt has been made to read a file whose size is larger than the maximum allowed size for a `Buffer`.

<a id="ERR_FS_INVALID_SYMLINK_TYPE"></a>

<!-- 0119.part.md -->

### `ERR_FS_INVALID_SYMLINK_TYPE`

An invalid symlink type was passed to the [`fs.symlink()`](fs.md#fssymlinktarget-path-type-callback) or [`fs.symlinkSync()`](fs.md#fssymlinksynctarget-path-type) methods.

<a id="ERR_HTTP_HEADERS_SENT"></a>

<!-- 0120.part.md -->

### `ERR_HTTP_HEADERS_SENT`

An attempt was made to add more headers after the headers had already been sent.

<a id="ERR_HTTP_INVALID_HEADER_VALUE"></a>

<!-- 0121.part.md -->

### `ERR_HTTP_INVALID_HEADER_VALUE`

An invalid HTTP header value was specified.

<a id="ERR_HTTP_INVALID_STATUS_CODE"></a>

<!-- 0122.part.md -->

### `ERR_HTTP_INVALID_STATUS_CODE`

Status code was outside the regular status code range (100-999).

<a id="ERR_HTTP_REQUEST_TIMEOUT"></a>

<!-- 0123.part.md -->

### `ERR_HTTP_REQUEST_TIMEOUT`

The client has not sent the entire request within the allowed time.

<a id="ERR_HTTP_SOCKET_ENCODING"></a>

<!-- 0124.part.md -->

### `ERR_HTTP_SOCKET_ENCODING`

Changing the socket encoding is not allowed per [RFC 7230 Section 3](https://tools.ietf.org/html/rfc7230#section-3).

<a id="ERR_HTTP_TRAILER_INVALID"></a>

<!-- 0125.part.md -->

### `ERR_HTTP_TRAILER_INVALID`

The `Trailer` header was set even though the transfer encoding does not support that.

<a id="ERR_HTTP2_ALTSVC_INVALID_ORIGIN"></a>

<!-- 0126.part.md -->

### `ERR_HTTP2_ALTSVC_INVALID_ORIGIN`

HTTP/2 ALTSVC frames require a valid origin.

<a id="ERR_HTTP2_ALTSVC_LENGTH"></a>

<!-- 0127.part.md -->

### `ERR_HTTP2_ALTSVC_LENGTH`

HTTP/2 ALTSVC frames are limited to a maximum of 16,382 payload bytes.

<a id="ERR_HTTP2_CONNECT_AUTHORITY"></a>

<!-- 0128.part.md -->

### `ERR_HTTP2_CONNECT_AUTHORITY`

For HTTP/2 requests using the `CONNECT` method, the `:authority` pseudo-header is required.

<a id="ERR_HTTP2_CONNECT_PATH"></a>

<!-- 0129.part.md -->

### `ERR_HTTP2_CONNECT_PATH`

For HTTP/2 requests using the `CONNECT` method, the `:path` pseudo-header is forbidden.

<a id="ERR_HTTP2_CONNECT_SCHEME"></a>

<!-- 0130.part.md -->

### `ERR_HTTP2_CONNECT_SCHEME`

For HTTP/2 requests using the `CONNECT` method, the `:scheme` pseudo-header is forbidden.

<a id="ERR_HTTP2_ERROR"></a>

<!-- 0131.part.md -->

### `ERR_HTTP2_ERROR`

A non-specific HTTP/2 error has occurred.

<a id="ERR_HTTP2_GOAWAY_SESSION"></a>

<!-- 0132.part.md -->

### `ERR_HTTP2_GOAWAY_SESSION`

New HTTP/2 Streams may not be opened after the `Http2Session` has received a `GOAWAY` frame from the connected peer.

<a id="ERR_HTTP2_HEADER_SINGLE_VALUE"></a>

<!-- 0133.part.md -->

### `ERR_HTTP2_HEADER_SINGLE_VALUE`

Multiple values were provided for an HTTP/2 header field that was required to have only a single value.

<a id="ERR_HTTP2_HEADERS_AFTER_RESPOND"></a>

<!-- 0134.part.md -->

### `ERR_HTTP2_HEADERS_AFTER_RESPOND`

An additional headers was specified after an HTTP/2 response was initiated.

<a id="ERR_HTTP2_HEADERS_SENT"></a>

<!-- 0135.part.md -->

### `ERR_HTTP2_HEADERS_SENT`

An attempt was made to send multiple response headers.

<a id="ERR_HTTP2_INFO_STATUS_NOT_ALLOWED"></a>

<!-- 0136.part.md -->

### `ERR_HTTP2_INFO_STATUS_NOT_ALLOWED`

Informational HTTP status codes (`1xx`) may not be set as the response status code on HTTP/2 responses.

<a id="ERR_HTTP2_INVALID_CONNECTION_HEADERS"></a>

<!-- 0137.part.md -->

### `ERR_HTTP2_INVALID_CONNECTION_HEADERS`

HTTP/1 connection specific headers are forbidden to be used in HTTP/2 requests and responses.

<a id="ERR_HTTP2_INVALID_HEADER_VALUE"></a>

<!-- 0138.part.md -->

### `ERR_HTTP2_INVALID_HEADER_VALUE`

An invalid HTTP/2 header value was specified.

<a id="ERR_HTTP2_INVALID_INFO_STATUS"></a>

<!-- 0139.part.md -->

### `ERR_HTTP2_INVALID_INFO_STATUS`

An invalid HTTP informational status code has been specified. Informational status codes must be an integer between `100` and `199` (inclusive).

<a id="ERR_HTTP2_INVALID_ORIGIN"></a>

<!-- 0140.part.md -->

### `ERR_HTTP2_INVALID_ORIGIN`

HTTP/2 `ORIGIN` frames require a valid origin.

<a id="ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH"></a>

<!-- 0141.part.md -->

### `ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH`

Input `Buffer` and `Uint8Array` instances passed to the `http2.getUnpackedSettings()` API must have a length that is a multiple of six.

<a id="ERR_HTTP2_INVALID_PSEUDOHEADER"></a>

<!-- 0142.part.md -->

### `ERR_HTTP2_INVALID_PSEUDOHEADER`

Only valid HTTP/2 pseudoheaders (`:status`, `:path`, `:authority`, `:scheme`, and `:method`) may be used.

<a id="ERR_HTTP2_INVALID_SESSION"></a>

<!-- 0143.part.md -->

### `ERR_HTTP2_INVALID_SESSION`

An action was performed on an `Http2Session` object that had already been destroyed.

<a id="ERR_HTTP2_INVALID_SETTING_VALUE"></a>

<!-- 0144.part.md -->

### `ERR_HTTP2_INVALID_SETTING_VALUE`

An invalid value has been specified for an HTTP/2 setting.

<a id="ERR_HTTP2_INVALID_STREAM"></a>

<!-- 0145.part.md -->

### `ERR_HTTP2_INVALID_STREAM`

An operation was performed on a stream that had already been destroyed.

<a id="ERR_HTTP2_MAX_PENDING_SETTINGS_ACK"></a>

<!-- 0146.part.md -->

### `ERR_HTTP2_MAX_PENDING_SETTINGS_ACK`

Whenever an HTTP/2 `SETTINGS` frame is sent to a connected peer, the peer is required to send an acknowledgment that it has received and applied the new `SETTINGS`. By default, a maximum number of unacknowledged `SETTINGS` frames may be sent at any given time. This error code is used when that limit has been reached.

<a id="ERR_HTTP2_NESTED_PUSH"></a>

<!-- 0147.part.md -->

### `ERR_HTTP2_NESTED_PUSH`

An attempt was made to initiate a new push stream from within a push stream. Nested push streams are not permitted.

<a id="ERR_HTTP2_NO_MEM"></a>

<!-- 0148.part.md -->

### `ERR_HTTP2_NO_MEM`

Out of memory when using the `http2session.setLocalWindowSize(windowSize)` API.

<a id="ERR_HTTP2_NO_SOCKET_MANIPULATION"></a>

<!-- 0149.part.md -->

### `ERR_HTTP2_NO_SOCKET_MANIPULATION`

An attempt was made to directly manipulate (read, write, pause, resume, etc.) a socket attached to an `Http2Session`.

<a id="ERR_HTTP2_ORIGIN_LENGTH"></a>

<!-- 0150.part.md -->

### `ERR_HTTP2_ORIGIN_LENGTH`

HTTP/2 `ORIGIN` frames are limited to a length of 16382 bytes.

<a id="ERR_HTTP2_OUT_OF_STREAMS"></a>

<!-- 0151.part.md -->

### `ERR_HTTP2_OUT_OF_STREAMS`

The number of streams created on a single HTTP/2 session reached the maximum limit.

<a id="ERR_HTTP2_PAYLOAD_FORBIDDEN"></a>

<!-- 0152.part.md -->

### `ERR_HTTP2_PAYLOAD_FORBIDDEN`

A message payload was specified for an HTTP response code for which a payload is forbidden.

<a id="ERR_HTTP2_PING_CANCEL"></a>

<!-- 0153.part.md -->

### `ERR_HTTP2_PING_CANCEL`

An HTTP/2 ping was canceled.

<a id="ERR_HTTP2_PING_LENGTH"></a>

<!-- 0154.part.md -->

### `ERR_HTTP2_PING_LENGTH`

HTTP/2 ping payloads must be exactly 8 bytes in length.

<a id="ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED"></a>

<!-- 0155.part.md -->

### `ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED`

An HTTP/2 pseudo-header has been used inappropriately. Pseudo-headers are header key names that begin with the `:` prefix.

<a id="ERR_HTTP2_PUSH_DISABLED"></a>

<!-- 0156.part.md -->

### `ERR_HTTP2_PUSH_DISABLED`

An attempt was made to create a push stream, which had been disabled by the client.

<a id="ERR_HTTP2_SEND_FILE"></a>

<!-- 0157.part.md -->

### `ERR_HTTP2_SEND_FILE`

An attempt was made to use the `Http2Stream.prototype.responseWithFile()` API to send a directory.

<a id="ERR_HTTP2_SEND_FILE_NOSEEK"></a>

<!-- 0158.part.md -->

### `ERR_HTTP2_SEND_FILE_NOSEEK`

An attempt was made to use the `Http2Stream.prototype.responseWithFile()` API to send something other than a regular file, but `offset` or `length` options were provided.

<a id="ERR_HTTP2_SESSION_ERROR"></a>

<!-- 0159.part.md -->

### `ERR_HTTP2_SESSION_ERROR`

The `Http2Session` closed with a non-zero error code.

<a id="ERR_HTTP2_SETTINGS_CANCEL"></a>

<!-- 0160.part.md -->

### `ERR_HTTP2_SETTINGS_CANCEL`

The `Http2Session` settings canceled.

<a id="ERR_HTTP2_SOCKET_BOUND"></a>

<!-- 0161.part.md -->

### `ERR_HTTP2_SOCKET_BOUND`

An attempt was made to connect a `Http2Session` object to a `net.Socket` or `tls.TLSSocket` that had already been bound to another `Http2Session` object.

<a id="ERR_HTTP2_SOCKET_UNBOUND"></a>

<!-- 0162.part.md -->

### `ERR_HTTP2_SOCKET_UNBOUND`

An attempt was made to use the `socket` property of an `Http2Session` that has already been closed.

<a id="ERR_HTTP2_STATUS_101"></a>

<!-- 0163.part.md -->

### `ERR_HTTP2_STATUS_101`

Use of the `101` Informational status code is forbidden in HTTP/2.

<a id="ERR_HTTP2_STATUS_INVALID"></a>

<!-- 0164.part.md -->

### `ERR_HTTP2_STATUS_INVALID`

An invalid HTTP status code has been specified. Status codes must be an integer between `100` and `599` (inclusive).

<a id="ERR_HTTP2_STREAM_CANCEL"></a>

<!-- 0165.part.md -->

### `ERR_HTTP2_STREAM_CANCEL`

An `Http2Stream` was destroyed before any data was transmitted to the connected peer.

<a id="ERR_HTTP2_STREAM_ERROR"></a>

<!-- 0166.part.md -->

### `ERR_HTTP2_STREAM_ERROR`

A non-zero error code was been specified in an `RST_STREAM` frame.

<a id="ERR_HTTP2_STREAM_SELF_DEPENDENCY"></a>

<!-- 0167.part.md -->

### `ERR_HTTP2_STREAM_SELF_DEPENDENCY`

When setting the priority for an HTTP/2 stream, the stream may be marked as a dependency for a parent stream. This error code is used when an attempt is made to mark a stream and dependent of itself.

<a id="ERR_HTTP2_TOO_MANY_INVALID_FRAMES"></a>

<!-- 0168.part.md -->

### `ERR_HTTP2_TOO_MANY_INVALID_FRAMES`

The limit of acceptable invalid HTTP/2 protocol frames sent by the peer, as specified through the `maxSessionInvalidFrames` option, has been exceeded.

<a id="ERR_HTTP2_TRAILERS_ALREADY_SENT"></a>

<!-- 0169.part.md -->

### `ERR_HTTP2_TRAILERS_ALREADY_SENT`

Trailing headers have already been sent on the `Http2Stream`.

<a id="ERR_HTTP2_TRAILERS_NOT_READY"></a>

<!-- 0170.part.md -->

### `ERR_HTTP2_TRAILERS_NOT_READY`

The `http2stream.sendTrailers()` method cannot be called until after the `'wantTrailers'` event is emitted on an `Http2Stream` object. The `'wantTrailers'` event will only be emitted if the `waitForTrailers` option is set for the `Http2Stream`.

<a id="ERR_HTTP2_UNSUPPORTED_PROTOCOL"></a>

<!-- 0171.part.md -->

### `ERR_HTTP2_UNSUPPORTED_PROTOCOL`

`http2.connect()` was passed a URL that uses any protocol other than `http:` or `https:`.

<a id="ERR_ILLEGAL_CONSTRUCTOR"></a>

<!-- 0172.part.md -->

### `ERR_ILLEGAL_CONSTRUCTOR`

An attempt was made to construct an object using a non-public constructor.

<a id="ERR_IMPORT_ASSERTION_TYPE_FAILED"></a>

<!-- 0173.part.md -->

### `ERR_IMPORT_ASSERTION_TYPE_FAILED`

An import assertion has failed, preventing the specified module to be imported.

<a id="ERR_IMPORT_ASSERTION_TYPE_MISSING"></a>

<!-- 0174.part.md -->

### `ERR_IMPORT_ASSERTION_TYPE_MISSING`

An import assertion is missing, preventing the specified module to be imported.

<a id="ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED"></a>

<!-- 0175.part.md -->

### `ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED`

An import assertion is not supported by this version of Node.js.

<a id="ERR_INCOMPATIBLE_OPTION_PAIR"></a>

<!-- 0176.part.md -->

### `ERR_INCOMPATIBLE_OPTION_PAIR`

An option pair is incompatible with each other and cannot be used at the same time.

<a id="ERR_INPUT_TYPE_NOT_ALLOWED"></a>

<!-- 0177.part.md -->

### `ERR_INPUT_TYPE_NOT_ALLOWED`

> Stability: 1 - Experimental

The `--input-type` flag was used to attempt to execute a file. This flag can only be used with input via `--eval`, `--print`, or `STDIN`.

<a id="ERR_INSPECTOR_ALREADY_ACTIVATED"></a>

<!-- 0178.part.md -->

### `ERR_INSPECTOR_ALREADY_ACTIVATED`

While using the `node:inspector` module, an attempt was made to activate the inspector when it already started to listen on a port. Use `inspector.close()` before activating it on a different address.

<a id="ERR_INSPECTOR_ALREADY_CONNECTED"></a>

<!-- 0179.part.md -->

### `ERR_INSPECTOR_ALREADY_CONNECTED`

While using the `node:inspector` module, an attempt was made to connect when the inspector was already connected.

<a id="ERR_INSPECTOR_CLOSED"></a>

<!-- 0180.part.md -->

### `ERR_INSPECTOR_CLOSED`

While using the `node:inspector` module, an attempt was made to use the inspector after the session had already closed.

<a id="ERR_INSPECTOR_COMMAND"></a>

<!-- 0181.part.md -->

### `ERR_INSPECTOR_COMMAND`

An error occurred while issuing a command via the `node:inspector` module.

<a id="ERR_INSPECTOR_NOT_ACTIVE"></a>

<!-- 0182.part.md -->

### `ERR_INSPECTOR_NOT_ACTIVE`

The `inspector` is not active when `inspector.waitForDebugger()` is called.

<a id="ERR_INSPECTOR_NOT_AVAILABLE"></a>

<!-- 0183.part.md -->

### `ERR_INSPECTOR_NOT_AVAILABLE`

The `node:inspector` module is not available for use.

<a id="ERR_INSPECTOR_NOT_CONNECTED"></a>

<!-- 0184.part.md -->

### `ERR_INSPECTOR_NOT_CONNECTED`

While using the `node:inspector` module, an attempt was made to use the inspector before it was connected.

<a id="ERR_INSPECTOR_NOT_WORKER"></a>

<!-- 0185.part.md -->

### `ERR_INSPECTOR_NOT_WORKER`

An API was called on the main thread that can only be used from the worker thread.

<a id="ERR_INTERNAL_ASSERTION"></a>

<!-- 0186.part.md -->

### `ERR_INTERNAL_ASSERTION`

There was a bug in Node.js or incorrect usage of Node.js internals. To fix the error, open an issue at <https://github.com/nodejs/node/issues>.

<a id="ERR_INVALID_ADDRESS_FAMILY"></a>

<!-- 0187.part.md -->

### `ERR_INVALID_ADDRESS_FAMILY`

The provided address family is not understood by the Node.js API.

<a id="ERR_INVALID_ARG_TYPE"></a>

<!-- 0188.part.md -->

### `ERR_INVALID_ARG_TYPE`

An argument of the wrong type was passed to a Node.js API.

<a id="ERR_INVALID_ARG_VALUE"></a>

<!-- 0189.part.md -->

### `ERR_INVALID_ARG_VALUE`

An invalid or unsupported value was passed for a given argument.

<a id="ERR_INVALID_ASYNC_ID"></a>

<!-- 0190.part.md -->

### `ERR_INVALID_ASYNC_ID`

An invalid `asyncId` or `triggerAsyncId` was passed using `AsyncHooks`. An id less than -1 should never happen.

<a id="ERR_INVALID_BUFFER_SIZE"></a>

<!-- 0191.part.md -->

### `ERR_INVALID_BUFFER_SIZE`

A swap was performed on a `Buffer` but its size was not compatible with the operation.

<a id="ERR_INVALID_CHAR"></a>

<!-- 0192.part.md -->

### `ERR_INVALID_CHAR`

Invalid characters were detected in headers.

<a id="ERR_INVALID_CURSOR_POS"></a>

<!-- 0193.part.md -->

### `ERR_INVALID_CURSOR_POS`

A cursor on a given stream cannot be moved to a specified row without a specified column.

<a id="ERR_INVALID_FD"></a>

<!-- 0194.part.md -->

### `ERR_INVALID_FD`

A file descriptor (‘fd’) was not valid (e.g. it was a negative value).

<a id="ERR_INVALID_FD_TYPE"></a>

<!-- 0195.part.md -->

### `ERR_INVALID_FD_TYPE`

A file descriptor (‘fd’) type was not valid.

<a id="ERR_INVALID_FILE_URL_HOST"></a>

<!-- 0196.part.md -->

### `ERR_INVALID_FILE_URL_HOST`

A Node.js API that consumes `file:` URLs (such as certain functions in the [`fs`](fs.md) module) encountered a file URL with an incompatible host. This situation can only occur on Unix-like systems where only `localhost` or an empty host is supported.

<a id="ERR_INVALID_FILE_URL_PATH"></a>

<!-- 0197.part.md -->

### `ERR_INVALID_FILE_URL_PATH`

A Node.js API that consumes `file:` URLs (such as certain functions in the [`fs`](fs.md) module) encountered a file URL with an incompatible path. The exact semantics for determining whether a path can be used is platform-dependent.

<a id="ERR_INVALID_HANDLE_TYPE"></a>

<!-- 0198.part.md -->

### `ERR_INVALID_HANDLE_TYPE`

An attempt was made to send an unsupported “handle” over an IPC communication channel to a child process. See [`subprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback) and [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) for more information.

<a id="ERR_INVALID_HTTP_TOKEN"></a>

<!-- 0199.part.md -->

### `ERR_INVALID_HTTP_TOKEN`

An invalid HTTP token was supplied.

<a id="ERR_INVALID_IP_ADDRESS"></a>

<!-- 0200.part.md -->

### `ERR_INVALID_IP_ADDRESS`

An IP address is not valid.

<a id="ERR_INVALID_MIME_SYNTAX"></a>

<!-- 0201.part.md -->

### `ERR_INVALID_MIME_SYNTAX`

The syntax of a MIME is not valid.

<a id="ERR_INVALID_MODULE"></a>

<!-- 0202.part.md -->

### `ERR_INVALID_MODULE`

An attempt was made to load a module that does not exist or was otherwise not valid.

<a id="ERR_INVALID_MODULE_SPECIFIER"></a>

<!-- 0203.part.md -->

### `ERR_INVALID_MODULE_SPECIFIER`

The imported module string is an invalid URL, package name, or package subpath specifier.

<a id="ERR_INVALID_OBJECT_DEFINE_PROPERTY"></a>

<!-- 0204.part.md -->

### `ERR_INVALID_OBJECT_DEFINE_PROPERTY`

An error occurred while setting an invalid attribute on the property of an object.

<a id="ERR_INVALID_PACKAGE_CONFIG"></a>

<!-- 0205.part.md -->

### `ERR_INVALID_PACKAGE_CONFIG`

An invalid [`package.json`](packages.md#nodejs-packagejson-field-definitions) file failed parsing.

<a id="ERR_INVALID_PACKAGE_TARGET"></a>

<!-- 0206.part.md -->

### `ERR_INVALID_PACKAGE_TARGET`

The `package.json` [`"exports"`](packages.md#exports) field contains an invalid target mapping value for the attempted module resolution.

<a id="ERR_INVALID_PERFORMANCE_MARK"></a>

<!-- 0207.part.md -->

### `ERR_INVALID_PERFORMANCE_MARK`

While using the Performance Timing API (`perf_hooks`), a performance mark is invalid.

<a id="ERR_INVALID_PROTOCOL"></a>

<!-- 0208.part.md -->

### `ERR_INVALID_PROTOCOL`

An invalid `options.protocol` was passed to `http.request()`.

<a id="ERR_INVALID_REPL_EVAL_CONFIG"></a>

<!-- 0209.part.md -->

### `ERR_INVALID_REPL_EVAL_CONFIG`

Both `breakEvalOnSigint` and `eval` options were set in the [`REPL`](repl.md) config, which is not supported.

<a id="ERR_INVALID_REPL_INPUT"></a>

<!-- 0210.part.md -->

### `ERR_INVALID_REPL_INPUT`

The input may not be used in the [`REPL`](repl.md). The conditions under which this error is used are described in the [`REPL`](repl.md) documentation.

<a id="ERR_INVALID_RETURN_PROPERTY"></a>

<!-- 0211.part.md -->

### `ERR_INVALID_RETURN_PROPERTY`

Thrown in case a function option does not provide a valid value for one of its returned object properties on execution.

<a id="ERR_INVALID_RETURN_PROPERTY_VALUE"></a>

<!-- 0212.part.md -->

### `ERR_INVALID_RETURN_PROPERTY_VALUE`

Thrown in case a function option does not provide an expected value type for one of its returned object properties on execution.

<a id="ERR_INVALID_RETURN_VALUE"></a>

<!-- 0213.part.md -->

### `ERR_INVALID_RETURN_VALUE`

Thrown in case a function option does not return an expected value type on execution, such as when a function is expected to return a promise.

<a id="ERR_INVALID_STATE"></a>

<!-- 0214.part.md -->

### `ERR_INVALID_STATE`

Indicates that an operation cannot be completed due to an invalid state. For instance, an object may have already been destroyed, or may be performing another operation.

<a id="ERR_INVALID_SYNC_FORK_INPUT"></a>

<!-- 0215.part.md -->

### `ERR_INVALID_SYNC_FORK_INPUT`

A `Buffer`, `TypedArray`, `DataView`, or `string` was provided as stdio input to an asynchronous fork. See the documentation for the [`child_process`](child_process.md) module for more information.

<a id="ERR_INVALID_THIS"></a>

<!-- 0216.part.md -->

### `ERR_INVALID_THIS`

A Node.js API function was called with an incompatible `this` value.

```js
const urlSearchParams = new URLSearchParams(
    'foo=bar&baz=new'
);

const buf = Buffer.alloc(1);
urlSearchParams.has.call(buf, 'foo');
// Throws a TypeError with code 'ERR_INVALID_THIS'
```

<a id="ERR_INVALID_TRANSFER_OBJECT"></a>

<!-- 0217.part.md -->

### `ERR_INVALID_TRANSFER_OBJECT`

An invalid transfer object was passed to `postMessage()`.

<a id="ERR_INVALID_TUPLE"></a>

<!-- 0218.part.md -->

### `ERR_INVALID_TUPLE`

An element in the `iterable` provided to the [WHATWG](url.md#the-whatwg-url-api) [`URLSearchParams` constructor](url.md#new-urlsearchparamsiterable) did not represent a `[name, value]` tuple – that is, if an element is not iterable, or does not consist of exactly two elements.

<a id="ERR_INVALID_URI"></a>

<!-- 0219.part.md -->

### `ERR_INVALID_URI`

An invalid URI was passed.

<a id="ERR_INVALID_URL"></a>

<!-- 0220.part.md -->

### `ERR_INVALID_URL`

An invalid URL was passed to the [WHATWG](url.md#the-whatwg-url-api) [`URL` constructor](url.md#new-urlinput-base) or the legacy [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) to be parsed. The thrown error object typically has an additional property `'input'` that contains the URL that failed to parse.

<a id="ERR_INVALID_URL_SCHEME"></a>

<!-- 0221.part.md -->

### `ERR_INVALID_URL_SCHEME`

An attempt was made to use a URL of an incompatible scheme (protocol) for a specific purpose. It is only used in the [WHATWG URL API](url.md#the-whatwg-url-api) support in the [`fs`](fs.md) module (which only accepts URLs with `'file'` scheme), but may be used in other Node.js APIs as well in the future.

<a id="ERR_IPC_CHANNEL_CLOSED"></a>

<!-- 0222.part.md -->

### `ERR_IPC_CHANNEL_CLOSED`

An attempt was made to use an IPC communication channel that was already closed.

<a id="ERR_IPC_DISCONNECTED"></a>

<!-- 0223.part.md -->

### `ERR_IPC_DISCONNECTED`

An attempt was made to disconnect an IPC communication channel that was already disconnected. See the documentation for the [`child_process`](child_process.md) module for more information.

<a id="ERR_IPC_ONE_PIPE"></a>

<!-- 0224.part.md -->

### `ERR_IPC_ONE_PIPE`

An attempt was made to create a child Node.js process using more than one IPC communication channel. See the documentation for the [`child_process`](child_process.md) module for more information.

<a id="ERR_IPC_SYNC_FORK"></a>

<!-- 0225.part.md -->

### `ERR_IPC_SYNC_FORK`

An attempt was made to open an IPC communication channel with a synchronously forked Node.js process. See the documentation for the [`child_process`](child_process.md) module for more information.

<a id="ERR_LOADER_CHAIN_INCOMPLETE"></a>

<!-- 0226.part.md -->

### `ERR_LOADER_CHAIN_INCOMPLETE`

An ESM loader hook returned without calling `next()` and without explicitly signaling a short circuit.

<a id="ERR_MANIFEST_ASSERT_INTEGRITY"></a>

<!-- 0227.part.md -->

### `ERR_MANIFEST_ASSERT_INTEGRITY`

An attempt was made to load a resource, but the resource did not match the integrity defined by the policy manifest. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MANIFEST_DEPENDENCY_MISSING"></a>

<!-- 0228.part.md -->

### `ERR_MANIFEST_DEPENDENCY_MISSING`

An attempt was made to load a resource, but the resource was not listed as a dependency from the location that attempted to load it. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MANIFEST_INTEGRITY_MISMATCH"></a>

<!-- 0229.part.md -->

### `ERR_MANIFEST_INTEGRITY_MISMATCH`

An attempt was made to load a policy manifest, but the manifest had multiple entries for a resource which did not match each other. Update the manifest entries to match in order to resolve this error. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MANIFEST_INVALID_RESOURCE_FIELD"></a>

<!-- 0230.part.md -->

### `ERR_MANIFEST_INVALID_RESOURCE_FIELD`

A policy manifest resource had an invalid value for one of its fields. Update the manifest entry to match in order to resolve this error. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MANIFEST_INVALID_SPECIFIER"></a>

<!-- 0231.part.md -->

### `ERR_MANIFEST_INVALID_SPECIFIER`

A policy manifest resource had an invalid value for one of its dependency mappings. Update the manifest entry to match to resolve this error. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MANIFEST_PARSE_POLICY"></a>

<!-- 0232.part.md -->

### `ERR_MANIFEST_PARSE_POLICY`

An attempt was made to load a policy manifest, but the manifest was unable to be parsed. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MANIFEST_TDZ"></a>

<!-- 0233.part.md -->

### `ERR_MANIFEST_TDZ`

An attempt was made to read from a policy manifest, but the manifest initialization has not yet taken place. This is likely a bug in Node.js.

<a id="ERR_MANIFEST_UNKNOWN_ONERROR"></a>

<!-- 0234.part.md -->

### `ERR_MANIFEST_UNKNOWN_ONERROR`

A policy manifest was loaded, but had an unknown value for its “onerror” behavior. See the documentation for [policy](permissions.md#policies) manifests for more information.

<a id="ERR_MEMORY_ALLOCATION_FAILED"></a>

<!-- 0235.part.md -->

### `ERR_MEMORY_ALLOCATION_FAILED`

An attempt was made to allocate memory (usually in the C++ layer) but it failed.

<a id="ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE"></a>

<!-- 0236.part.md -->

### `ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE`

A message posted to a [`MessagePort`](worker_threads.md#class-messageport) could not be deserialized in the target [vm](vm.md) `Context`. Not all Node.js objects can be successfully instantiated in any context at this time, and attempting to transfer them using `postMessage()` can fail on the receiving side in that case.

<a id="ERR_METHOD_NOT_IMPLEMENTED"></a>

<!-- 0237.part.md -->

### `ERR_METHOD_NOT_IMPLEMENTED`

A method is required but not implemented.

<a id="ERR_MISSING_ARGS"></a>

<!-- 0238.part.md -->

### `ERR_MISSING_ARGS`

A required argument of a Node.js API was not passed. This is only used for strict compliance with the API specification (which in some cases may accept `func(undefined)` but not `func()`). In most native Node.js APIs, `func(undefined)` and `func()` are treated identically, and the [`ERR_INVALID_ARG_TYPE`](#err_invalid_arg_type) error code may be used instead.

<a id="ERR_MISSING_OPTION"></a>

<!-- 0239.part.md -->

### `ERR_MISSING_OPTION`

For APIs that accept options objects, some options might be mandatory. This code is thrown if a required option is missing.

<a id="ERR_MISSING_PASSPHRASE"></a>

<!-- 0240.part.md -->

### `ERR_MISSING_PASSPHRASE`

An attempt was made to read an encrypted key without specifying a passphrase.

<a id="ERR_MISSING_PLATFORM_FOR_WORKER"></a>

<!-- 0241.part.md -->

### `ERR_MISSING_PLATFORM_FOR_WORKER`

The V8 platform used by this instance of Node.js does not support creating Workers. This is caused by lack of embedder support for Workers. In particular, this error will not occur with standard builds of Node.js.

<a id="ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST"></a>

<!-- 0242.part.md -->

### `ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`

An object that needs to be explicitly listed in the `transferList` argument is in the object passed to a [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist) call, but is not provided in the `transferList` for that call. Usually, this is a `MessagePort`.

In Node.js versions prior to v15.0.0, the error code being used here was [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](#err_missing_message_port_in_transfer_list). However, the set of transferable object types has been expanded to cover more types than `MessagePort`.

<a id="ERR_MODULE_NOT_FOUND"></a>

<!-- 0243.part.md -->

### `ERR_MODULE_NOT_FOUND`

A module file could not be resolved by the ECMAScript modules loader while attempting an `import` operation or when loading the program entry point.

<a id="ERR_MULTIPLE_CALLBACK"></a>

<!-- 0244.part.md -->

### `ERR_MULTIPLE_CALLBACK`

A callback was called more than once.

A callback is almost always meant to only be called once as the query can either be fulfilled or rejected but not both at the same time. The latter would be possible by calling a callback more than once.

<a id="ERR_NAPI_CONS_FUNCTION"></a>

<!-- 0245.part.md -->

### `ERR_NAPI_CONS_FUNCTION`

While using `Node-API`, a constructor passed was not a function.

<a id="ERR_NAPI_INVALID_DATAVIEW_ARGS"></a>

<!-- 0246.part.md -->

### `ERR_NAPI_INVALID_DATAVIEW_ARGS`

While calling `napi_create_dataview()`, a given `offset` was outside the bounds of the dataview or `offset + length` was larger than a length of given `buffer`.

<a id="ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT"></a>

<!-- 0247.part.md -->

### `ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT`

While calling `napi_create_typedarray()`, the provided `offset` was not a multiple of the element size.

<a id="ERR_NAPI_INVALID_TYPEDARRAY_LENGTH"></a>

<!-- 0248.part.md -->

### `ERR_NAPI_INVALID_TYPEDARRAY_LENGTH`

While calling `napi_create_typedarray()`, `(length * size_of_element) + byte_offset` was larger than the length of given `buffer`.

<a id="ERR_NAPI_TSFN_CALL_JS"></a>

<!-- 0249.part.md -->

### `ERR_NAPI_TSFN_CALL_JS`

An error occurred while invoking the JavaScript portion of the thread-safe function.

<a id="ERR_NAPI_TSFN_GET_UNDEFINED"></a>

<!-- 0250.part.md -->

### `ERR_NAPI_TSFN_GET_UNDEFINED`

An error occurred while attempting to retrieve the JavaScript `undefined` value.

<a id="ERR_NAPI_TSFN_START_IDLE_LOOP"></a>

<!-- 0251.part.md -->

### `ERR_NAPI_TSFN_START_IDLE_LOOP`

On the main thread, values are removed from the queue associated with the thread-safe function in an idle loop. This error indicates that an error has occurred when attempting to start the loop.

<a id="ERR_NAPI_TSFN_STOP_IDLE_LOOP"></a>

<!-- 0252.part.md -->

### `ERR_NAPI_TSFN_STOP_IDLE_LOOP`

Once no more items are left in the queue, the idle loop must be suspended. This error indicates that the idle loop has failed to stop.

<a id="ERR_NOT_BUILDING_SNAPSHOT"></a>

<!-- 0253.part.md -->

### `ERR_NOT_BUILDING_SNAPSHOT`

An attempt was made to use operations that can only be used when building V8 startup snapshot even though Node.js isn’t building one.

<a id="ERR_NO_CRYPTO"></a>

<!-- 0254.part.md -->

### `ERR_NO_CRYPTO`

An attempt was made to use crypto features while Node.js was not compiled with OpenSSL crypto support.

<a id="ERR_NO_ICU"></a>

<!-- 0255.part.md -->

### `ERR_NO_ICU`

An attempt was made to use features that require [ICU](intl.md#internationalization-support), but Node.js was not compiled with ICU support.

<a id="ERR_NON_CONTEXT_AWARE_DISABLED"></a>

<!-- 0256.part.md -->

### `ERR_NON_CONTEXT_AWARE_DISABLED`

A non-context-aware native addon was loaded in a process that disallows them.

<a id="ERR_OUT_OF_RANGE"></a>

<!-- 0257.part.md -->

### `ERR_OUT_OF_RANGE`

A given value is out of the accepted range.

<a id="ERR_PACKAGE_IMPORT_NOT_DEFINED"></a>

<!-- 0258.part.md -->

### `ERR_PACKAGE_IMPORT_NOT_DEFINED`

The `package.json` [`"imports"`](packages.md#imports) field does not define the given internal package specifier mapping.

<a id="ERR_PACKAGE_PATH_NOT_EXPORTED"></a>

<!-- 0259.part.md -->

### `ERR_PACKAGE_PATH_NOT_EXPORTED`

The `package.json` [`"exports"`](packages.md#exports) field does not export the requested subpath. Because exports are encapsulated, private internal modules that are not exported cannot be imported through the package resolution, unless using an absolute URL.

<a id="ERR_PARSE_ARGS_INVALID_OPTION_VALUE"></a>

<!-- 0260.part.md -->

### `ERR_PARSE_ARGS_INVALID_OPTION_VALUE`

When `strict` set to `true`, thrown by [`util.parseArgs()`](util.md#utilparseargsconfig) if a [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) value is provided for an option of type [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), or if a [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) value is provided for an option of type [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

<a id="ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL"></a>

<!-- 0261.part.md -->

### `ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL`

Thrown by [`util.parseArgs()`](util.md#utilparseargsconfig), when a positional argument is provided and `allowPositionals` is set to `false`.

<a id="ERR_PARSE_ARGS_UNKNOWN_OPTION"></a>

<!-- 0262.part.md -->

### `ERR_PARSE_ARGS_UNKNOWN_OPTION`

When `strict` set to `true`, thrown by [`util.parseArgs()`](util.md#utilparseargsconfig) if an argument is not configured in `options`.

<a id="ERR_PERFORMANCE_INVALID_TIMESTAMP"></a>

<!-- 0263.part.md -->

### `ERR_PERFORMANCE_INVALID_TIMESTAMP`

An invalid timestamp value was provided for a performance mark or measure.

<a id="ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS"></a>

<!-- 0264.part.md -->

### `ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS`

Invalid options were provided for a performance measure.

<a id="ERR_PROTO_ACCESS"></a>

<!-- 0265.part.md -->

### `ERR_PROTO_ACCESS`

Accessing `Object.prototype.__proto__` has been forbidden using [`--disable-proto=throw`](cli.md#--disable-protomode). [`Object.getPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) and [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf) should be used to get and set the prototype of an object.

<a id="ERR_REQUIRE_ESM"></a>

<!-- 0266.part.md -->

### `ERR_REQUIRE_ESM`

> Stability: 1 - Experimental

An attempt was made to `require()` an [ES Module](esm.md).

<a id="ERR_SCRIPT_EXECUTION_INTERRUPTED"></a>

<!-- 0267.part.md -->

### `ERR_SCRIPT_EXECUTION_INTERRUPTED`

Script execution was interrupted by `SIGINT` (For example, <kbd>Ctrl</kbd>+<kbd>C</kbd> was pressed.)

<a id="ERR_SCRIPT_EXECUTION_TIMEOUT"></a>

<!-- 0268.part.md -->

### `ERR_SCRIPT_EXECUTION_TIMEOUT`

Script execution timed out, possibly due to bugs in the script being executed.

<a id="ERR_SERVER_ALREADY_LISTEN"></a>

<!-- 0269.part.md -->

### `ERR_SERVER_ALREADY_LISTEN`

The [`server.listen()`](net.md#serverlisten) method was called while a `net.Server` was already listening. This applies to all instances of `net.Server`, including HTTP, HTTPS, and HTTP/2 `Server` instances.

<a id="ERR_SERVER_NOT_RUNNING"></a>

<!-- 0270.part.md -->

### `ERR_SERVER_NOT_RUNNING`

The [`server.close()`](net.md#serverclosecallback) method was called when a `net.Server` was not running. This applies to all instances of `net.Server`, including HTTP, HTTPS, and HTTP/2 `Server` instances.

<a id="ERR_SOCKET_ALREADY_BOUND"></a>

<!-- 0271.part.md -->

### `ERR_SOCKET_ALREADY_BOUND`

An attempt was made to bind a socket that has already been bound.

<a id="ERR_SOCKET_BAD_BUFFER_SIZE"></a>

<!-- 0272.part.md -->

### `ERR_SOCKET_BAD_BUFFER_SIZE`

An invalid (negative) size was passed for either the `recvBufferSize` or `sendBufferSize` options in [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback).

<a id="ERR_SOCKET_BAD_PORT"></a>

<!-- 0273.part.md -->

### `ERR_SOCKET_BAD_PORT`

An API function expecting a port \>= 0 and \< 65536 received an invalid value.

<a id="ERR_SOCKET_BAD_TYPE"></a>

<!-- 0274.part.md -->

### `ERR_SOCKET_BAD_TYPE`

An API function expecting a socket type (`udp4` or `udp6`) received an invalid value.

<a id="ERR_SOCKET_BUFFER_SIZE"></a>

<!-- 0275.part.md -->

### `ERR_SOCKET_BUFFER_SIZE`

While using [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback), the size of the receive or send `Buffer` could not be determined.

<a id="ERR_SOCKET_CLOSED"></a>

<!-- 0276.part.md -->

### `ERR_SOCKET_CLOSED`

An attempt was made to operate on an already closed socket.

<a id="ERR_SOCKET_CLOSED_BEFORE_CONNECTION"></a>

<!-- 0277.part.md -->

### `ERR_SOCKET_CLOSED_BEFORE_CONNECTION`

When calling [`net.Socket.write()`](net.md#socketwritedata-encoding-callback) on a connecting socket and the socket was closed before the connection was established.

<a id="ERR_SOCKET_DGRAM_IS_CONNECTED"></a>

<!-- 0278.part.md -->

### `ERR_SOCKET_DGRAM_IS_CONNECTED`

A [`dgram.connect()`](dgram.md#socketconnectport-address-callback) call was made on an already connected socket.

<a id="ERR_SOCKET_DGRAM_NOT_CONNECTED"></a>

<!-- 0279.part.md -->

### `ERR_SOCKET_DGRAM_NOT_CONNECTED`

A [`dgram.disconnect()`](dgram.md#socketdisconnect) or [`dgram.remoteAddress()`](dgram.md#socketremoteaddress) call was made on a disconnected socket.

<a id="ERR_SOCKET_DGRAM_NOT_RUNNING"></a>

<!-- 0280.part.md -->

### `ERR_SOCKET_DGRAM_NOT_RUNNING`

A call was made and the UDP subsystem was not running.

<a id="ERR_SRI_PARSE"></a>

<!-- 0281.part.md -->

### `ERR_SRI_PARSE`

A string was provided for a Subresource Integrity check, but was unable to be parsed. Check the format of integrity attributes by looking at the [Subresource Integrity specification](https://www.w3.org/TR/SRI/#the-integrity-attribute).

<a id="ERR_STREAM_ALREADY_FINISHED"></a>

<!-- 0282.part.md -->

### `ERR_STREAM_ALREADY_FINISHED`

A stream method was called that cannot complete because the stream was finished.

<a id="ERR_STREAM_CANNOT_PIPE"></a>

<!-- 0283.part.md -->

### `ERR_STREAM_CANNOT_PIPE`

An attempt was made to call [`stream.pipe()`](stream.md#readablepipedestination-options) on a [`Writable`](stream.md#class-streamwritable) stream.

<a id="ERR_STREAM_DESTROYED"></a>

<!-- 0284.part.md -->

### `ERR_STREAM_DESTROYED`

A stream method was called that cannot complete because the stream was destroyed using `stream.destroy()`.

<a id="ERR_STREAM_NULL_VALUES"></a>

<!-- 0285.part.md -->

### `ERR_STREAM_NULL_VALUES`

An attempt was made to call [`stream.write()`](stream.md#writablewritechunk-encoding-callback) with a `null` chunk.

<a id="ERR_STREAM_PREMATURE_CLOSE"></a>

<!-- 0286.part.md -->

### `ERR_STREAM_PREMATURE_CLOSE`

An error returned by `stream.finished()` and `stream.pipeline()`, when a stream or a pipeline ends non gracefully with no explicit error.

<a id="ERR_STREAM_PUSH_AFTER_EOF"></a>

<!-- 0287.part.md -->

### `ERR_STREAM_PUSH_AFTER_EOF`

An attempt was made to call [`stream.push()`](stream.md#readablepushchunk-encoding) after a `null`(EOF) had been pushed to the stream.

<a id="ERR_STREAM_UNSHIFT_AFTER_END_EVENT"></a>

<!-- 0288.part.md -->

### `ERR_STREAM_UNSHIFT_AFTER_END_EVENT`

An attempt was made to call [`stream.unshift()`](stream.md#readableunshiftchunk-encoding) after the `'end'` event was emitted.

<a id="ERR_STREAM_WRAP"></a>

<!-- 0289.part.md -->

### `ERR_STREAM_WRAP`

Prevents an abort if a string decoder was set on the Socket or if the decoder is in `objectMode`.

```js
const Socket = require('node:net').Socket;
const instance = new Socket();

instance.setEncoding('utf8');
```

<a id="ERR_STREAM_WRITE_AFTER_END"></a>

<!-- 0290.part.md -->

### `ERR_STREAM_WRITE_AFTER_END`

An attempt was made to call [`stream.write()`](stream.md#writablewritechunk-encoding-callback) after `stream.end()` has been called.

<a id="ERR_STRING_TOO_LONG"></a>

<!-- 0291.part.md -->

### `ERR_STRING_TOO_LONG`

An attempt has been made to create a string longer than the maximum allowed length.

<a id="ERR_SYNTHETIC"></a>

<!-- 0292.part.md -->

### `ERR_SYNTHETIC`

An artificial error object used to capture the call stack for diagnostic reports.

<a id="ERR_SYSTEM_ERROR"></a>

<!-- 0293.part.md -->

### `ERR_SYSTEM_ERROR`

An unspecified or non-specific system error has occurred within the Node.js process. The error object will have an `err.info` object property with additional details.

<a id="ERR_TAP_LEXER_ERROR"></a>

<!-- 0294.part.md -->

### `ERR_TAP_LEXER_ERROR`

An error representing a failing lexer state.

<a id="ERR_TAP_PARSER_ERROR"></a>

<!-- 0295.part.md -->

### `ERR_TAP_PARSER_ERROR`

An error representing a failing parser state. Additional information about the token causing the error is available via the `cause` property.

<a id="ERR_TAP_VALIDATION_ERROR"></a>

<!-- 0296.part.md -->

### `ERR_TAP_VALIDATION_ERROR`

This error represents a failed TAP validation.

<a id="ERR_TEST_FAILURE"></a>

<!-- 0297.part.md -->

### `ERR_TEST_FAILURE`

This error represents a failed test. Additional information about the failure is available via the `cause` property. The `failureType` property specifies what the test was doing when the failure occurred.

<a id="ERR_TLS_CERT_ALTNAME_FORMAT"></a>

<!-- 0298.part.md -->

### `ERR_TLS_CERT_ALTNAME_FORMAT`

This error is thrown by `checkServerIdentity` if a user-supplied `subjectaltname` property violates encoding rules. Certificate objects produced by Node.js itself always comply with encoding rules and will never cause this error.

<a id="ERR_TLS_CERT_ALTNAME_INVALID"></a>

<!-- 0299.part.md -->

### `ERR_TLS_CERT_ALTNAME_INVALID`

While using TLS, the host name/IP of the peer did not match any of the `subjectAltNames` in its certificate.

<a id="ERR_TLS_DH_PARAM_SIZE"></a>

<!-- 0300.part.md -->

### `ERR_TLS_DH_PARAM_SIZE`

While using TLS, the parameter offered for the Diffie-Hellman (`DH`) key-agreement protocol is too small. By default, the key length must be greater than or equal to 1024 bits to avoid vulnerabilities, even though it is strongly recommended to use 2048 bits or larger for stronger security.

<a id="ERR_TLS_HANDSHAKE_TIMEOUT"></a>

<!-- 0301.part.md -->

### `ERR_TLS_HANDSHAKE_TIMEOUT`

A TLS/SSL handshake timed out. In this case, the server must also abort the connection.

<a id="ERR_TLS_INVALID_CONTEXT"></a>

<!-- 0302.part.md -->

### `ERR_TLS_INVALID_CONTEXT`

The context must be a `SecureContext`.

<a id="ERR_TLS_INVALID_PROTOCOL_METHOD"></a>

<!-- 0303.part.md -->

### `ERR_TLS_INVALID_PROTOCOL_METHOD`

The specified `secureProtocol` method is invalid. It is either unknown, or disabled because it is insecure.

<a id="ERR_TLS_INVALID_PROTOCOL_VERSION"></a>

<!-- 0304.part.md -->

### `ERR_TLS_INVALID_PROTOCOL_VERSION`

Valid TLS protocol versions are `'TLSv1'`, `'TLSv1.1'`, or `'TLSv1.2'`.

<a id="ERR_TLS_INVALID_STATE"></a>

<!-- 0305.part.md -->

### `ERR_TLS_INVALID_STATE`

The TLS socket must be connected and securely established. Ensure the ‘secure’ event is emitted before continuing.

<a id="ERR_TLS_PROTOCOL_VERSION_CONFLICT"></a>

<!-- 0306.part.md -->

### `ERR_TLS_PROTOCOL_VERSION_CONFLICT`

Attempting to set a TLS protocol `minVersion` or `maxVersion` conflicts with an attempt to set the `secureProtocol` explicitly. Use one mechanism or the other.

<a id="ERR_TLS_PSK_SET_IDENTIY_HINT_FAILED"></a>

<!-- 0307.part.md -->

### `ERR_TLS_PSK_SET_IDENTIY_HINT_FAILED`

Failed to set PSK identity hint. Hint may be too long.

<a id="ERR_TLS_RENEGOTIATION_DISABLED"></a>

<!-- 0308.part.md -->

### `ERR_TLS_RENEGOTIATION_DISABLED`

An attempt was made to renegotiate TLS on a socket instance with renegotiation disabled.

<a id="ERR_TLS_REQUIRED_SERVER_NAME"></a>

<!-- 0309.part.md -->

### `ERR_TLS_REQUIRED_SERVER_NAME`

While using TLS, the `server.addContext()` method was called without providing a host name in the first parameter.

<a id="ERR_TLS_SESSION_ATTACK"></a>

<!-- 0310.part.md -->

### `ERR_TLS_SESSION_ATTACK`

An excessive amount of TLS renegotiations is detected, which is a potential vector for denial-of-service attacks.

<a id="ERR_TLS_SNI_FROM_SERVER"></a>

<!-- 0311.part.md -->

### `ERR_TLS_SNI_FROM_SERVER`

An attempt was made to issue Server Name Indication from a TLS server-side socket, which is only valid from a client.

<a id="ERR_TRACE_EVENTS_CATEGORY_REQUIRED"></a>

<!-- 0312.part.md -->

### `ERR_TRACE_EVENTS_CATEGORY_REQUIRED`

The `trace_events.createTracing()` method requires at least one trace event category.

<a id="ERR_TRACE_EVENTS_UNAVAILABLE"></a>

<!-- 0313.part.md -->

### `ERR_TRACE_EVENTS_UNAVAILABLE`

The `node:trace_events` module could not be loaded because Node.js was compiled with the `--without-v8-platform` flag.

<a id="ERR_TRANSFORM_ALREADY_TRANSFORMING"></a>

<!-- 0314.part.md -->

### `ERR_TRANSFORM_ALREADY_TRANSFORMING`

A `Transform` stream finished while it was still transforming.

<a id="ERR_TRANSFORM_WITH_LENGTH_0"></a>

<!-- 0315.part.md -->

### `ERR_TRANSFORM_WITH_LENGTH_0`

A `Transform` stream finished with data still in the write buffer.

<a id="ERR_TTY_INIT_FAILED"></a>

<!-- 0316.part.md -->

### `ERR_TTY_INIT_FAILED`

The initialization of a TTY failed due to a system error.

<a id="ERR_UNAVAILABLE_DURING_EXIT"></a>

<!-- 0317.part.md -->

### `ERR_UNAVAILABLE_DURING_EXIT`

Function was called within a [`process.on('exit')`](process.md#event-exit) handler that shouldn’t be called within [`process.on('exit')`](process.md#event-exit) handler.

<a id="ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET"></a>

<!-- 0318.part.md -->

### `ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET`

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) was called twice, without first resetting the callback to `null`.

This error is designed to prevent accidentally overwriting a callback registered from another module.

<a id="ERR_UNESCAPED_CHARACTERS"></a>

<!-- 0319.part.md -->

### `ERR_UNESCAPED_CHARACTERS`

A string that contained unescaped characters was received.

<a id="ERR_UNHANDLED_ERROR"></a>

<!-- 0320.part.md -->

### `ERR_UNHANDLED_ERROR`

An unhandled error occurred (for instance, when an `'error'` event is emitted by an [`EventEmitter`](events.md#class-eventemitter) but an `'error'` handler is not registered).

<a id="ERR_UNKNOWN_BUILTIN_MODULE"></a>

<!-- 0321.part.md -->

### `ERR_UNKNOWN_BUILTIN_MODULE`

Used to identify a specific kind of internal Node.js error that should not typically be triggered by user code. Instances of this error point to an internal bug within the Node.js binary itself.

<a id="ERR_UNKNOWN_CREDENTIAL"></a>

<!-- 0322.part.md -->

### `ERR_UNKNOWN_CREDENTIAL`

A Unix group or user identifier that does not exist was passed.

<a id="ERR_UNKNOWN_ENCODING"></a>

<!-- 0323.part.md -->

### `ERR_UNKNOWN_ENCODING`

An invalid or unknown encoding option was passed to an API.

<a id="ERR_UNKNOWN_FILE_EXTENSION"></a>

<!-- 0324.part.md -->

### `ERR_UNKNOWN_FILE_EXTENSION`

> Stability: 1 - Experimental

An attempt was made to load a module with an unknown or unsupported file extension.

<a id="ERR_UNKNOWN_MODULE_FORMAT"></a>

<!-- 0325.part.md -->

### `ERR_UNKNOWN_MODULE_FORMAT`

> Stability: 1 - Experimental

An attempt was made to load a module with an unknown or unsupported format.

<a id="ERR_UNKNOWN_SIGNAL"></a>

<!-- 0326.part.md -->

### `ERR_UNKNOWN_SIGNAL`

An invalid or unknown process signal was passed to an API expecting a valid signal (such as [`subprocess.kill()`](child_process.md#subprocesskillsignal)).

<a id="ERR_UNSUPPORTED_DIR_IMPORT"></a>

<!-- 0327.part.md -->

### `ERR_UNSUPPORTED_DIR_IMPORT`

`import` a directory URL is unsupported. Instead, [self-reference a package using its name](packages.md#self-referencing-a-package-using-its-name) and [define a custom subpath](packages.md#subpath-exports) in the [`"exports"`](packages.md#exports) field of the [`package.json`](packages.md#nodejs-packagejson-field-definitions) file.

```js
import './'; // unsupported
import './index.js'; // supported
import 'package-name'; // supported
```

<a id="ERR_UNSUPPORTED_ESM_URL_SCHEME"></a>

<!-- 0328.part.md -->

### `ERR_UNSUPPORTED_ESM_URL_SCHEME`

`import` with URL schemes other than `file` and `data` is unsupported.

<a id="ERR_USE_AFTER_CLOSE"></a>

<!-- 0329.part.md -->

### `ERR_USE_AFTER_CLOSE`

> Stability: 1 - Experimental

An attempt was made to use something that was already closed.

<a id="ERR_VALID_PERFORMANCE_ENTRY_TYPE"></a>

<!-- 0330.part.md -->

### `ERR_VALID_PERFORMANCE_ENTRY_TYPE`

While using the Performance Timing API (`perf_hooks`), no valid performance entry types are found.

<a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING"></a>

<!-- 0331.part.md -->

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`

A dynamic import callback was not specified.

<a id="ERR_VM_MODULE_ALREADY_LINKED"></a>

<!-- 0332.part.md -->

### `ERR_VM_MODULE_ALREADY_LINKED`

The module attempted to be linked is not eligible for linking, because of one of the following reasons:

-   It has already been linked (`linkingStatus` is `'linked'`)
-   It is being linked (`linkingStatus` is `'linking'`)
-   Linking has failed for this module (`linkingStatus` is `'errored'`)

<a id="ERR_VM_MODULE_CACHED_DATA_REJECTED"></a>

<!-- 0333.part.md -->

### `ERR_VM_MODULE_CACHED_DATA_REJECTED`

The `cachedData` option passed to a module constructor is invalid.

<a id="ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA"></a>

<!-- 0334.part.md -->

### `ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA`

Cached data cannot be created for modules which have already been evaluated.

<a id="ERR_VM_MODULE_DIFFERENT_CONTEXT"></a>

<!-- 0335.part.md -->

### `ERR_VM_MODULE_DIFFERENT_CONTEXT`

The module being returned from the linker function is from a different context than the parent module. Linked modules must share the same context.

<a id="ERR_VM_MODULE_LINK_FAILURE"></a>

<!-- 0336.part.md -->

### `ERR_VM_MODULE_LINK_FAILURE`

The module was unable to be linked due to a failure.

<a id="ERR_VM_MODULE_NOT_MODULE"></a>

<!-- 0337.part.md -->

### `ERR_VM_MODULE_NOT_MODULE`

The fulfilled value of a linking promise is not a `vm.Module` object.

<a id="ERR_VM_MODULE_STATUS"></a>

<!-- 0338.part.md -->

### `ERR_VM_MODULE_STATUS`

The current module’s status does not allow for this operation. The specific meaning of the error depends on the specific function.

<a id="ERR_WASI_ALREADY_STARTED"></a>

<!-- 0339.part.md -->

### `ERR_WASI_ALREADY_STARTED`

The WASI instance has already started.

<a id="ERR_WASI_NOT_STARTED"></a>

<!-- 0340.part.md -->

### `ERR_WASI_NOT_STARTED`

The WASI instance has not been started.

<a id="ERR_WEBASSEMBLY_RESPONSE"></a>

<!-- 0341.part.md -->

### `ERR_WEBASSEMBLY_RESPONSE`

The `Response` that has been passed to `WebAssembly.compileStreaming` or to `WebAssembly.instantiateStreaming` is not a valid WebAssembly response.

<a id="ERR_WORKER_INIT_FAILED"></a>

<!-- 0342.part.md -->

### `ERR_WORKER_INIT_FAILED`

The `Worker` initialization failed.

<a id="ERR_WORKER_INVALID_EXEC_ARGV"></a>

<!-- 0343.part.md -->

### `ERR_WORKER_INVALID_EXEC_ARGV`

The `execArgv` option passed to the `Worker` constructor contains invalid flags.

<a id="ERR_WORKER_NOT_RUNNING"></a>

<!-- 0344.part.md -->

### `ERR_WORKER_NOT_RUNNING`

An operation failed because the `Worker` instance is not currently running.

<a id="ERR_WORKER_OUT_OF_MEMORY"></a>

<!-- 0345.part.md -->

### `ERR_WORKER_OUT_OF_MEMORY`

The `Worker` instance terminated because it reached its memory limit.

<a id="ERR_WORKER_PATH"></a>

<!-- 0346.part.md -->

### `ERR_WORKER_PATH`

The path for the main script of a worker is neither an absolute path nor a relative path starting with `./` or `../`.

<a id="ERR_WORKER_UNSERIALIZABLE_ERROR"></a>

<!-- 0347.part.md -->

### `ERR_WORKER_UNSERIALIZABLE_ERROR`

All attempts at serializing an uncaught exception from a worker thread failed.

<a id="ERR_WORKER_UNSUPPORTED_OPERATION"></a>

<!-- 0348.part.md -->

### `ERR_WORKER_UNSUPPORTED_OPERATION`

The requested functionality is not supported in worker threads.

<a id="ERR_ZLIB_INITIALIZATION_FAILED"></a>

<!-- 0349.part.md -->

### `ERR_ZLIB_INITIALIZATION_FAILED`

Creation of a [`zlib`](zlib.md) object failed due to incorrect configuration.

<a id="HPE_HEADER_OVERFLOW"></a>

<!-- 0350.part.md -->

### `HPE_HEADER_OVERFLOW`

Too much HTTP header data was received. In order to protect against malicious or malconfigured clients, if more than 8 KiB of HTTP header data is received then HTTP parsing will abort without a request or response object being created, and an `Error` with this code will be emitted.

<a id="HPE_UNEXPECTED_CONTENT_LENGTH"></a>

<!-- 0351.part.md -->

### `HPE_UNEXPECTED_CONTENT_LENGTH`

Server is sending both a `Content-Length` header and `Transfer-Encoding: chunked`.

`Transfer-Encoding: chunked` allows the server to maintain an HTTP persistent connection for dynamically generated content. In this case, the `Content-Length` HTTP header cannot be used.

Use `Content-Length` or `Transfer-Encoding: chunked`.

<a id="MODULE_NOT_FOUND"></a>

<!-- 0352.part.md -->

### `MODULE_NOT_FOUND`.

Файл модуля не может быть разрешен загрузчиком модулей CommonJS при попытке выполнить операцию [`require()`](modules.md#requireid) или при загрузке точки входа программы.

<!-- 0353.part.md -->

## Legacy Node.js error codes

> Stability: 0 - Deprecated. These error codes are either inconsistent, or have been removed.

<a id="ERR_CANNOT_TRANSFER_OBJECT"></a>

<!-- 0354.part.md -->

### `ERR_CANNOT_TRANSFER_OBJECT`

The value passed to `postMessage()` contained an object that is not supported for transferring.

<a id="ERR_CRYPTO_HASH_DIGEST_NO_UTF16"></a>

<!-- 0355.part.md -->

### `ERR_CRYPTO_HASH_DIGEST_NO_UTF16`

The UTF-16 encoding was used with [`hash.digest()`](crypto.md#hashdigestencoding). While the `hash.digest()` method does allow an `encoding` argument to be passed in, causing the method to return a string rather than a `Buffer`, the UTF-16 encoding (e.g. `ucs` or `utf16le`) is not supported.

<a id="ERR_HTTP2_FRAME_ERROR"></a>

<!-- 0356.part.md -->

### `ERR_HTTP2_FRAME_ERROR`

Used when a failure occurs sending an individual frame on the HTTP/2 session.

<a id="ERR_HTTP2_HEADERS_OBJECT"></a>

<!-- 0357.part.md -->

### `ERR_HTTP2_HEADERS_OBJECT`

Used when an HTTP/2 Headers Object is expected.

<a id="ERR_HTTP2_HEADER_REQUIRED"></a>

<!-- 0358.part.md -->

### `ERR_HTTP2_HEADER_REQUIRED`

Used when a required header is missing in an HTTP/2 message.

<a id="ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND"></a>

<!-- 0359.part.md -->

### `ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND`

HTTP/2 informational headers must only be sent _prior_ to calling the `Http2Stream.prototype.respond()` method.

<a id="ERR_HTTP2_STREAM_CLOSED"></a>

<!-- 0360.part.md -->

### `ERR_HTTP2_STREAM_CLOSED`

Used when an action has been performed on an HTTP/2 Stream that has already been closed.

<a id="ERR_HTTP_INVALID_CHAR"></a>

<!-- 0361.part.md -->

### `ERR_HTTP_INVALID_CHAR`

Used when an invalid character is found in an HTTP response status message (reason phrase).

<a id="ERR_INDEX_OUT_OF_RANGE"></a>

<!-- 0362.part.md -->

### `ERR_INDEX_OUT_OF_RANGE`

A given index was out of the accepted range (e.g. negative offsets).

<a id="ERR_INVALID_OPT_VALUE"></a>

<!-- 0363.part.md -->

### `ERR_INVALID_OPT_VALUE`

An invalid or unexpected value was passed in an options object.

<a id="ERR_INVALID_OPT_VALUE_ENCODING"></a>

<!-- 0364.part.md -->

### `ERR_INVALID_OPT_VALUE_ENCODING`

An invalid or unknown file encoding was passed.

<a id="ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST"></a>

<!-- 0365.part.md -->

### `ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`

This error code was replaced by [`ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`](#err_missing_transferable_in_transfer_list) in Node.js v15.0.0, because it is no longer accurate as other types of transferable objects also exist now.

<a id="ERR_NAPI_CONS_PROTOTYPE_OBJECT"></a>

<!-- 0366.part.md -->

### `ERR_NAPI_CONS_PROTOTYPE_OBJECT`

Used by the `Node-API` when `Constructor.prototype` is not an object.

<a id="ERR_NETWORK_IMPORT_BAD_RESPONSE"></a>

<!-- 0367.part.md -->

### `ERR_NETWORK_IMPORT_BAD_RESPONSE`

> Stability: 1 - Experimental

Response was received but was invalid when importing a module over the network.

<a id="ERR_NETWORK_IMPORT_DISALLOWED"></a>

<!-- 0368.part.md -->

### `ERR_NETWORK_IMPORT_DISALLOWED`

> Stability: 1 - Experimental

A network module attempted to load another module that it is not allowed to load. Likely this restriction is for security reasons.

<a id="ERR_NO_LONGER_SUPPORTED"></a>

<!-- 0369.part.md -->

### `ERR_NO_LONGER_SUPPORTED`

A Node.js API was called in an unsupported manner, such as `Buffer.write(string, encoding, offset[, length])`.

<a id="ERR_OPERATION_FAILED"></a>

<!-- 0370.part.md -->

### `ERR_OPERATION_FAILED`

An operation failed. This is typically used to signal the general failure of an asynchronous operation.

<a id="ERR_OUTOFMEMORY"></a>

<!-- 0371.part.md -->

### `ERR_OUTOFMEMORY`

Used generically to identify that an operation caused an out of memory condition.

<a id="ERR_PARSE_HISTORY_DATA"></a>

<!-- 0372.part.md -->

### `ERR_PARSE_HISTORY_DATA`

The `node:repl` module was unable to parse data from the REPL history file.

<a id="ERR_SOCKET_CANNOT_SEND"></a>

<!-- 0373.part.md -->

### `ERR_SOCKET_CANNOT_SEND`

Data could not be sent on a socket.

<a id="ERR_STDERR_CLOSE"></a>

<!-- 0374.part.md -->

### `ERR_STDERR_CLOSE`

An attempt was made to close the `process.stderr` stream. By design, Node.js does not allow `stdout` or `stderr` streams to be closed by user code.

<a id="ERR_STDOUT_CLOSE"></a>

<!-- 0375.part.md -->

### `ERR_STDOUT_CLOSE`

An attempt was made to close the `process.stdout` stream. By design, Node.js does not allow `stdout` or `stderr` streams to be closed by user code.

<a id="ERR_STREAM_READ_NOT_IMPLEMENTED"></a>

<!-- 0376.part.md -->

### `ERR_STREAM_READ_NOT_IMPLEMENTED`

Used when an attempt is made to use a readable stream that has not implemented [`readable._read()`](stream.md#readable_readsize).

<a id="ERR_TLS_RENEGOTIATION_FAILED"></a>

<!-- 0377.part.md -->

### `ERR_TLS_RENEGOTIATION_FAILED`

Used when a TLS renegotiation request has failed in a non-specific way.

<a id="ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER"></a>

<!-- 0378.part.md -->

### `ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER`

A `SharedArrayBuffer` whose memory is not managed by the JavaScript engine or by Node.js was encountered during serialization. Such a `SharedArrayBuffer` cannot be serialized.

This can only happen when native addons create `SharedArrayBuffer`s in “externalized” mode, or put existing `SharedArrayBuffer` into externalized mode.

<a id="ERR_UNKNOWN_STDIN_TYPE"></a>

<!-- 0379.part.md -->

### `ERR_UNKNOWN_STDIN_TYPE`

An attempt was made to launch a Node.js process with an unknown `stdin` file type. This error is usually an indication of a bug within Node.js itself, although it is possible for user code to trigger it.

<a id="ERR_UNKNOWN_STREAM_TYPE"></a>

<!-- 0380.part.md -->

### `ERR_UNKNOWN_STREAM_TYPE`

An attempt was made to launch a Node.js process with an unknown `stdout` or `stderr` file type. This error is usually an indication of a bug within Node.js itself, although it is possible for user code to trigger it.

<a id="ERR_V8BREAKITERATOR"></a>

<!-- 0381.part.md -->

### `ERR_V8BREAKITERATOR`

The V8 `BreakIterator` API was used but the full ICU data set is not installed.

<a id="ERR_VALUE_OUT_OF_RANGE"></a>

<!-- 0382.part.md -->

### `ERR_VALUE_OUT_OF_RANGE`

Used when a given value is out of the accepted range.

<a id="ERR_VM_MODULE_NOT_LINKED"></a>

<!-- 0383.part.md -->

### `ERR_VM_MODULE_NOT_LINKED`

The module must be successfully linked before instantiation.

<a id="ERR_VM_MODULE_LINKING_ERRORED"></a>

<!-- 0384.part.md -->

### `ERR_VM_MODULE_LINKING_ERRORED`

The linker function returned a module for which linking has failed.

<a id="ERR_WORKER_UNSUPPORTED_EXTENSION"></a>

<!-- 0385.part.md -->

### `ERR_WORKER_UNSUPPORTED_EXTENSION`

The pathname used for the main script of a worker has an unknown file extension.

<a id="ERR_ZLIB_BINDING_CLOSED"></a>

<!-- 0386.part.md -->

### `ERR_ZLIB_BINDING_CLOSED`

Used when an attempt is made to use a `zlib` object after it has already been closed.

<a id="ERR_CPU_USAGE"></a>

<!-- 0387.part.md -->

### `ERR_CPU_USAGE`.

Собственный вызов из `process.cpuUsage` не может быть обработан.

<!-- 0388.part.md -->

