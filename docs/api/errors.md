---
description: Приложения, работающие в Node.js, обычно сталкиваются с четырьмя категориями ошибок
---

# Ошибки

<!--introduced_in=v4.0.0-->

<!--type=misc-->

Приложения, работающие в Node.js, обычно сталкиваются с четырьмя категориями ошибок:

- Стандартные ошибки JavaScript, такие как {EvalError}, {SyntaxError}, {RangeError}, {ReferenceError}, {TypeError} и {URIError}.
- Системные ошибки, вызванные ограничениями базовой операционной системы, такими как попытка открыть несуществующий файл или попытка отправить данные через закрытый сокет.
- Пользовательские ошибки, вызванные кодом приложения.
- `AssertionError`s - это особый класс ошибок, который может быть вызван, когда Node.js обнаруживает исключительное логическое нарушение, которое никогда не должно происходить. Обычно они поднимаются `assert` модуль.

Все ошибки JavaScript и системные ошибки, вызванные Node.js, наследуются от стандартного класса {Error} JavaScript или являются его экземплярами и гарантированно предоставляют _по меньшей мере_ свойства, доступные в этом классе.

## Распространение ошибок и перехват

<!--type=misc-->

Node.js поддерживает несколько механизмов распространения и обработки ошибок, возникающих во время работы приложения. То, как эти ошибки сообщаются и обрабатываются, полностью зависит от типа `Error` и стиль вызываемого API.

Все ошибки JavaScript обрабатываются как исключения, которые _немедленно_ генерировать и выдавать ошибку с помощью стандартного JavaScript `throw` механизм. Они обрабатываются с помощью [`try…catch` строить](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) предоставляется языком JavaScript.

```js
// Throws with a ReferenceError because z is not defined.
try {
  const m = 1;
  const n = m + z;
} catch (err) {
  // Handle the error here.
}
```

Любое использование JavaScript `throw` механизм вызовет исключение, которое _должен_ обрабатываться с использованием `try…catch` или процесс Node.js немедленно завершится.

За некоторыми исключениями, _Синхронный_ API (любой метод блокировки, не принимающий `callback` функция, например [`fs.readFileSync`](fs.md#fsreadfilesyncpath-options)), буду использовать `throw` сообщать об ошибках.

Ошибки, возникающие внутри _Асинхронные API_ можно сообщить несколькими способами:

- Большинство асинхронных методов, которые принимают `callback` функция примет `Error` объект, переданный в качестве первого аргумента этой функции. Если этот первый аргумент не `null` и является экземпляром `Error`, то произошла ошибка, которую необходимо обработать.

<!-- eslint-disable no-useless-return -->

```js
const fs = require('fs');
fs.readFile('a file that does not exist', (err, data) => {
  if (err) {
    console.error(
      'There was an error reading the file!',
      err
    );
    return;
  }
  // Otherwise handle the data
});
```

- Когда асинхронный метод вызывается для объекта, который является [`EventEmitter`](events.md#class-eventemitter), ошибки могут быть перенаправлены на этот объект `'error'` событие.

  ```js
  const net = require('net');
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

- Некоторые обычно асинхронные методы в API Node.js могут по-прежнему использовать `throw` механизм для создания исключений, которые должны обрабатываться с помощью `try…catch`. Исчерпывающего списка таких методов нет; обратитесь к документации по каждому методу, чтобы определить соответствующий требуемый механизм обработки ошибок.

Использование `'error'` механизм событий наиболее распространен для [потоковый](stream.md) а также [на основе эмиттера событий](events.md#class-eventemitter) API-интерфейсы, которые сами по себе представляют собой серию асинхронных операций с течением времени (в отличие от одной операции, которая может пройти или закончиться неудачей).

Для _все_ [`EventEmitter`](events.md#class-eventemitter) объекты, если `'error'` обработчик событий не предоставляется, будет выдана ошибка, в результате чего процесс Node.js сообщит о неперехваченном исключении и завершится сбоем, если только одно из следующих событий: [`domain`](domain.md) модуль используется надлежащим образом или обработчик зарегистрирован для [`'uncaughtException'`](process.md#event-uncaughtexception) событие.

```js
const EventEmitter = require('events');
const ee = new EventEmitter();

setImmediate(() => {
  // This will crash the process because no 'error' event
  // handler has been added.
  ee.emit('error', new Error('This will crash'));
});
```

Ошибки, сгенерированные таким образом _не мочь_ быть перехваченным с помощью `try…catch` как они брошены _после_ код вызова уже вышел.

Разработчики должны обращаться к документации по каждому методу, чтобы точно определить, как распространяются ошибки, вызванные этими методами.

### Обратные вызовы при первой ошибке

<!--type=misc-->

Большинство асинхронных методов, предоставляемых основным API Node.js, следуют идиоматическому шаблону, называемому _обратный вызов при первой ошибке_. В этом шаблоне функция обратного вызова передается методу в качестве аргумента. Когда операция завершается или возникает ошибка, вызывается функция обратного вызова с `Error` объект (если есть) передается в качестве первого аргумента. Если ошибки не возникло, первый аргумент будет передан как `null`.

```js
const fs = require('fs');

function errorFirstCallback(err, data) {
  if (err) {
    console.error('There was an error', err);
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

JavaScript `try…catch` механизм **не мочь** использоваться для перехвата ошибок, генерируемых асинхронными API. Распространенная ошибка новичков - пытаться использовать `throw` внутри обратного вызова с ошибкой:

```js
// THIS WILL NOT WORK:
const fs = require('fs');

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

Это не сработает, потому что функция обратного вызова передана в `fs.readFile()` вызывается асинхронно. К моменту вызова обратного вызова окружающий код, включая `try…catch` блок, уже вышли. Выдача ошибки внутри обратного вызова **может привести к сбою процесса Node.js** в большинстве случаев. Если [домены](domain.md) включены, или обработчик был зарегистрирован с `process.on('uncaughtException')`, такие ошибки можно перехватить.

## Класс: `Error`

<!--type=class-->

Общий объект JavaScript {Error}, не указывающий на конкретную причину возникновения ошибки. `Error` объекты фиксируют «трассировку стека», детализирующую точку в коде, в которой `Error` был создан, и может содержать текстовое описание ошибки.

Все ошибки, генерируемые Node.js, включая все системные ошибки и ошибки JavaScript, будут либо экземплярами, либо унаследованы от `Error` класс.

### `new Error(message)`

- `message` {нить}

Создает новый `Error` объект и устанавливает `error.message` в предоставленное текстовое сообщение. Если объект передается как `message`, текстовое сообщение создается при вызове `message.toString()`. В `error.stack` свойство будет представлять точку в коде, в которой `new Error()` назывался. Трассировки стека зависят от [API трассировки стека V8](https://github.com/v8/v8/wiki/Stack-Trace-API). Трассировки стека распространяются только на (а) начало _синхронное выполнение кода_, или (b) количество кадров, заданное свойством `Error.stackTraceLimit`, в зависимости от того, что меньше.

### `Error.captureStackTrace(targetObject[, constructorOpt])`

- `targetObject` {Объект}
- `constructorOpt` {Функция}

Создает `.stack` собственность на `targetObject`, который при доступе возвращает строку, представляющую место в коде, в котором `Error.captureStackTrace()` назывался.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack; // Similar to `new Error().stack`
```

Первая строка трассировки будет иметь префикс `${myObject.name}: ${myObject.message}`.

Необязательный `constructorOpt` Аргумент принимает функцию. Если указано, все кадры выше `constructorOpt`, включая `constructorOpt`, будет исключен из сгенерированной трассировки стека.

В `constructorOpt` Аргумент полезен для сокрытия деталей реализации генерации ошибок от пользователя. Например:

```js
function MyError() {
  Error.captureStackTrace(this, MyError);
}

// Without passing MyError to captureStackTrace, the MyError
// frame would show up in the .stack property. By passing
// the constructor, we omit that frame, and retain all frames below it.
new MyError().stack;
```

### `Error.stackTraceLimit`

- {количество}

В `Error.stackTraceLimit` указывает количество кадров стека, собранных трассировкой стека (независимо от того, сгенерированы ли они `new Error().stack` или `Error.captureStackTrace(obj)`).

Значение по умолчанию - `10` но может быть установлен на любой допустимый номер JavaScript. Изменения повлияют на любую записанную трассировку стека. _после_ значение было изменено.

Если установлено нечисловое значение или задано отрицательное число, трассировки стека не будут захватывать какие-либо кадры.

### `error.code`

- {нить}

В `error.code` Свойство - это строковая метка, определяющая тип ошибки. `error.code` это наиболее стабильный способ выявления ошибки. Он будет меняться только между основными версиями Node.js. Наоборот, `error.message` строки могут меняться между любыми версиями Node.js. Видеть [Коды ошибок Node.js](#nodejs-error-codes) для получения подробной информации о конкретных кодах.

### `error.message`

- {нить}

В `error.message` свойство - это строковое описание ошибки, установленное при вызове `new Error(message)`. В `message` переданный конструктору, также появится в первой строке трассировки стека `Error`, однако изменение этого свойства после `Error` объект создан _может нет_ изменить первую строку трассировки стека (например, когда `error.stack` читается до изменения этого свойства).

```js
const err = new Error('The message');
console.error(err.message);
// Prints: The message
```

### `error.stack`

- {нить}

В `error.stack` свойство - это строка, описывающая точку в коде, в которой `Error` был создан.

```console
Error: Things keep happening!
   at /home/gbusey/file.js:525:2
   at Frobnicator.refrobulate (/home/gbusey/business-logic.js:424:21)
   at Actor.<anonymous> (/home/gbusey/actors.js:400:8)
   at increaseSynergy (/home/gbusey/actors.js:701:6)
```

Первая строка отформатирована как `<error class name>: <error message>`, за которым следует серия кадров стека (каждая строка начинается с "at"). Каждый фрейм описывает сайт вызова в коде, который приводит к сгенерированной ошибке. V8 пытается отобразить имя для каждой функции (по имени переменной, имени функции или имени метода объекта), но иногда не может найти подходящее имя. Если V8 не может определить имя функции, для этого фрейма будет отображаться только информация о местоположении. В противном случае определенное имя функции будет отображаться с информацией о местоположении, добавленной в круглые скобки.

Фреймы создаются только для функций JavaScript. Если, например, выполнение синхронно проходит через дополнительную функцию C ++, называемую `cheetahify` который сам вызывает функцию JavaScript, фрейм, представляющий `cheetahify` вызов не будет присутствовать в трассировке стека:

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

Информация о местоположении будет одной из следующих:

- `native`, если кадр представляет внутренний вызов V8 (как в `[].forEach`).
- `plain-filename.js:line:column`, если фрейм представляет собой внутренний вызов Node.js.
- `/absolute/path/to/file.js:line:column`, если кадр представляет собой вызов в пользовательской программе или ее зависимостях.

Строка, представляющая трассировку стека, генерируется лениво, когда `error.stack` собственность **доступ**.

Количество кадров, захваченных трассировкой стека, ограничено меньшим из `Error.stackTraceLimit` или количество доступных кадров в текущем тике цикла событий.

## Класс: `AssertionError`

- Расширяется: {errors.Error}

Указывает на неудачу утверждения. Подробнее см. [`Class: assert.AssertionError`](assert.md#class-assertassertionerror).

## Класс: `RangeError`

- Расширяется: {errors.Error}

Указывает, что предоставленный аргумент находится за пределами набора или диапазона допустимых значений для функции; является ли это числовым диапазоном или вне набора опций для данного параметра функции.

```js
require('net').connect(-1);
// Throws "RangeError: "port" option should be >= 0 and < 65536: -1"
```

Node.js сгенерирует и выбросит `RangeError` экземпляры _немедленно_ как форма подтверждения аргумента.

## Класс: `ReferenceError`

- Расширяется: {errors.Error}

Указывает, что предпринимается попытка получить доступ к переменной, которая не определена. Такие ошибки обычно указывают на опечатки в коде или на некорректную программу.

Хотя клиентский код может генерировать и распространять эти ошибки, на практике это будет делать только V8.

```js
doesNotExist;
// Throws ReferenceError, doesNotExist is not a variable in this program.
```

Если приложение динамически не генерирует и не запускает код, `ReferenceError` экземпляры указывают на ошибку в коде или его зависимостях.

## Класс: `SyntaxError`

- Расширяется: {errors.Error}

Указывает, что программа не является допустимым JavaScript. Эти ошибки могут возникать и распространяться только в результате оценки кода. Оценка кода может произойти в результате `eval`, `Function`, `require`, или [vm](vm.md). Эти ошибки почти всегда указывают на неработающую программу.

```js
try {
  require('vm').runInThisContext('binary ! isNotOk');
} catch (err) {
  // 'err' will be a SyntaxError.
}
```

`SyntaxError` экземпляры невозможно восстановить в контексте, который их создал - они могут быть перехвачены только в других контекстах.

## Класс: `SystemError`

- Расширяется: {errors.Error}

Node.js генерирует системные ошибки, когда в среде выполнения возникают исключения. Обычно это происходит, когда приложение нарушает ограничение операционной системы. Например, системная ошибка произойдет, если приложение попытается прочитать несуществующий файл.

- `address` {строка} Если присутствует, адрес, к которому не удалось подключиться к сети.
- `code` {строка} Код ошибки строки
- `dest` {строка} Если присутствует, путь к файлу при сообщении об ошибке файловой системы
- `errno` {number} Номер ошибки, предоставленный системой
- `info` {Object} Если присутствует, дополнительные сведения о состоянии ошибки
- `message` {string} Предоставляемое системой описание ошибки в удобной для чтения форме.
- `path` {строка} Если присутствует, путь к файлу при сообщении об ошибке файловой системы
- `port` {number} Если присутствует, порт сетевого подключения, который недоступен
- `syscall` {строка} Имя системного вызова, вызвавшего ошибку

### `error.address`

- {нить}

Если представить, `error.address` - это строка, описывающая адрес, к которому не удалось установить сетевое соединение.

### `error.code`

- {нить}

В `error.code` свойство - это строка, представляющая код ошибки.

### `error.dest`

- {нить}

Если представить, `error.dest` - это путь к файлу при сообщении об ошибке файловой системы.

### `error.errno`

- {количество}

В `error.errno` свойство - отрицательное число, которое соответствует коду ошибки, определенному в [`libuv Error handling`](https://docs.libuv.org/en/v1.x/errors.html).

В Windows номер ошибки, предоставленный системой, будет нормализован libuv.

Чтобы получить строковое представление кода ошибки, используйте [`util.getSystemErrorName(error.errno)`](util.md#utilgetsystemerrornameerr).

### `error.info`

- {Объект}

Если представить, `error.info` - объект с подробной информацией о состоянии ошибки.

### `error.message`

- {нить}

`error.message` представляет собой удобочитаемое описание ошибки, предоставляемое системой.

### `error.path`

- {нить}

Если представить, `error.path` - строка, содержащая соответствующий недопустимый путь.

### `error.port`

- {количество}

Если представить, `error.port` порт сетевого подключения недоступен.

### `error.syscall`

- {нить}

В `error.syscall` свойство - это строка, описывающая [системный вызов](https://man7.org/linux/man-pages/man2/syscalls.2.html) это не удалось.

### Общие системные ошибки

Это список системных ошибок, которые часто встречаются при написании программы на Node.js. Полный список см. В [`errno`(3) справочная страница](https://man7.org/linux/man-pages/man3/errno.3.html).

- `EACCES` (В разрешении отказано): была сделана попытка получить доступ к файлу способом, запрещенным его разрешениями на доступ к файлу.

- `EADDRINUSE` (Адрес уже используется): попытка привязать сервер ([`net`](net.md), [`http`](http.md), или [`https`](https.md)) на локальный адрес не удалось из-за того, что другой сервер в локальной системе уже занимает этот адрес.

- `ECONNREFUSED` (В соединении отказано): соединение не может быть установлено, потому что целевая машина активно отказалась от него. Обычно это происходит из-за попытки подключиться к неактивной службе на чужом хосте.

- `ECONNRESET` (Сброс соединения одноранговым узлом): соединение было принудительно закрыто одноранговым узлом. Обычно это происходит из-за потери соединения с удаленным сокетом из-за тайм-аута или перезагрузки. Обычно встречается через [`http`](http.md) а также [`net`](net.md) модули.

- `EEXIST` (Файл существует): существующий файл был целью операции, которая требовала, чтобы цель не существовала.

- `EISDIR` (Является каталогом): операция ожидала файл, но указанный путь был каталогом.

- `EMFILE` (Слишком много открытых файлов в системе): максимальное количество [файловые дескрипторы](https://en.wikipedia.org/wiki/File_descriptor) допустимый в системе, и запросы для другого дескриптора не могут быть выполнены, пока хотя бы один из них не будет закрыт. Это происходит при одновременном открытии множества файлов одновременно, особенно в системах (в частности, macOS), где существует низкий предел дескрипторов файлов для процессов. Чтобы исправить низкий предел, запустите `ulimit -n 2048` в той же оболочке, которая будет запускать процесс Node.js.

- `ENOENT` (Нет такого файла или каталога): обычно создается [`fs`](fs.md) операции, чтобы указать, что компонент указанного пути не существует. По указанному пути не удалось найти ни один объект (файл или каталог).

- `ENOTDIR` (Не каталог): компонент с указанным путем существует, но не является каталогом, как ожидалось. Обычно выращивается [`fs.readdir`](fs.md#fsreaddirpath-options-callback).

- `ENOTEMPTY` (Каталог не пустой): каталог с записями был целью операции, для которой требуется пустой каталог, обычно [`fs.unlink`](fs.md#fsunlinkpath-callback).

- `ENOTFOUND` (Ошибка поиска DNS): указывает на сбой DNS либо `EAI_NODATA` или `EAI_NONAME`. Это не стандартная ошибка POSIX.

- `EPERM` (Операция запрещена): была сделана попытка выполнить операцию, требующую повышенных привилегий.

- `EPIPE` (Сломанный канал): запись в канал, сокет или FIFO, для которого нет процесса для чтения данных. Часто встречается на [`net`](net.md) а также [`http`](http.md) Уровни, указывающие на то, что удаленная сторона записываемого потока была закрыта.

- `ETIMEDOUT` (Превышено время ожидания операции): запрос на подключение или отправку завершился неудачно, поскольку подключенная сторона не ответила должным образом по прошествии определенного периода времени. Обычно встречается [`http`](http.md) или [`net`](net.md). Часто признак того, что `socket.end()` не был должным образом назван.

## Класс: `TypeError`

- Расширяет {errors.Error}

Указывает, что указанный аргумент не является допустимым типом. Например, передача функции параметру, который ожидает строку, будет `TypeError`.

```js
require('url').parse(() => {});
// Throws TypeError, since it expected a string.
```

Node.js сгенерирует и выбросит `TypeError` экземпляры _немедленно_ как форма подтверждения аргумента.

## Исключения против ошибок

<!--type=misc-->

Исключение JavaScript - это значение, которое выбрасывается в результате недопустимой операции или как цель `throw` утверждение. Хотя не требуется, чтобы эти значения были экземплярами `Error` или классы, которые наследуются от `Error`, все исключения, создаваемые Node.js или средой выполнения JavaScript _буду_ быть экземплярами `Error`.

Некоторые исключения _безвозвратно_ на уровне JavaScript. Такие исключения будут _всегда_ вызвать сбой процесса Node.js. Примеры включают `assert()` чеки или `abort()` вызывает в слое C ++.

## Ошибки OpenSSL

Ошибки, возникающие в `crypto` или `tls` классные `Error`, и в дополнение к стандартному `.code` а также `.message` properties, могут иметь некоторые дополнительные свойства, специфичные для OpenSSL.

### `error.opensslErrorStack`

Массив ошибок, который может дать контекст, откуда в библиотеке OpenSSL возникла ошибка.

### `error.function`

Функция OpenSSL, в которой возникла ошибка.

### `error.library`

Библиотека OpenSSL, в которой возникла ошибка.

### `error.reason`

Строка в удобном для чтения виде, описывающая причину ошибки.

<a id="nodejs-error-codes"></a>

## Коды ошибок Node.js

<a id="ABORT_ERR"></a>

### `ABORT_ERR`

<!-- YAML
added: v15.0.0
-->

Используется, когда операция была прервана (обычно с использованием `AbortController`).

API _нет_ с использованием `AbortSignal`s обычно не вызывают ошибки с этим кодом.

Этот код не использует обычный `ERR_*` соглашение об ошибках Node.js используется для обеспечения совместимости с веб-платформой. `AbortError`.

<a id="ERR_AMBIGUOUS_ARGUMENT"></a>

### `ERR_AMBIGUOUS_ARGUMENT`

Аргумент функции используется таким образом, чтобы предположить, что сигнатура функции может быть неправильно понята. Это брошено `assert` модуль, когда `message` параметр в `assert.throws(block, message)` совпадает с сообщением об ошибке, выданным `block` потому что это использование предполагает, что пользователь верит `message` ожидаемое сообщение, а не сообщение `AssertionError` будет отображаться, если `block` не бросает.

<a id="ERR_ARG_NOT_ITERABLE"></a>

### `ERR_ARG_NOT_ITERABLE`

Итерируемый аргумент (т.е. значение, которое работает с `for...of` loops) требуется, но не предоставляется API Node.js.

<a id="ERR_ASSERTION"></a>

### `ERR_ASSERTION`

Особый тип ошибки, которая может быть вызвана всякий раз, когда Node.js обнаруживает исключительное логическое нарушение, которое никогда не должно происходить. Обычно они поднимаются `assert` модуль.

<a id="ERR_ASYNC_CALLBACK"></a>

### `ERR_ASYNC_CALLBACK`

Была сделана попытка зарегистрировать что-то, что не является функцией, как `AsyncHooks` Перезвоните.

<a id="ERR_ASYNC_TYPE"></a>

### `ERR_ASYNC_TYPE`

Недопустимый тип асинхронного ресурса. Пользователи также могут определять свои собственные типы при использовании общедоступного API для встраивания.

<a id="ERR_BROTLI_COMPRESSION_FAILED"></a>

### `ERR_BROTLI_COMPRESSION_FAILED`

Данные, переданные в поток Brotli, не были успешно сжаты.

<a id="ERR_BROTLI_INVALID_PARAM"></a>

### `ERR_BROTLI_INVALID_PARAM`

Во время построения потока Brotli был передан недопустимый ключ параметра.

<a id="ERR_BUFFER_CONTEXT_NOT_AVAILABLE"></a>

### `ERR_BUFFER_CONTEXT_NOT_AVAILABLE`

Была сделана попытка создать Node.js `Buffer` из кода надстройки или встраивания, находясь в контексте механизма JS, который не связан с экземпляром Node.js. Данные, переданные в `Buffer` будет выпущен к тому времени, когда метод вернется.

При возникновении этой ошибки возможная альтернатива созданию `Buffer` пример - создать нормальный `Uint8Array`, который отличается только прототипом результирующего объекта. `Uint8Array`s общеприняты во всех основных API Node.js, где `Buffer`s есть; они доступны во всех контекстах.

<a id="ERR_BUFFER_OUT_OF_BOUNDS"></a>

### `ERR_BUFFER_OUT_OF_BOUNDS`

Операция за пределами `Buffer` была предпринята попытка.

<a id="ERR_BUFFER_TOO_LARGE"></a>

### `ERR_BUFFER_TOO_LARGE`

Была сделана попытка создать `Buffer` больше максимально допустимого размера.

<a id="ERR_CANNOT_WATCH_SIGINT"></a>

### `ERR_CANNOT_WATCH_SIGINT`

Node.js не смог отследить `SIGINT` сигнал.

<a id="ERR_CHILD_CLOSED_BEFORE_REPLY"></a>

### `ERR_CHILD_CLOSED_BEFORE_REPLY`

Дочерний процесс был закрыт до того, как родительский процесс получил ответ.

<a id="ERR_CHILD_PROCESS_IPC_REQUIRED"></a>

### `ERR_CHILD_PROCESS_IPC_REQUIRED`

Используется, когда дочерний процесс разветвляется без указания канала IPC.

<a id="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"></a>

### `ERR_CHILD_PROCESS_STDIO_MAXBUFFER`

Используется, когда основной процесс пытается прочитать данные из STDERR / STDOUT дочернего процесса, и длина данных больше, чем `maxBuffer` вариант.

<a id="ERR_CLOSED_MESSAGE_PORT"></a>

### `ERR_CLOSED_MESSAGE_PORT`

<!--
added:
  - v16.2.0
  - v14.17.1
changes:
  - version: 11.12.0
    pr-url: https://github.com/nodejs/node/pull/26487
    description: The error message was removed.
  - version:
      - v16.2.0
      - v14.17.1
    pr-url: https://github.com/nodejs/node/pull/38510
    description: The error message was reintroduced.
-->

Была попытка использовать `MessagePort` экземпляр в закрытом состоянии, обычно после `.close()` был вызван.

<a id="ERR_CONSOLE_WRITABLE_STREAM"></a>

### `ERR_CONSOLE_WRITABLE_STREAM`

`Console` был создан без `stdout` поток, или `Console` имеет незаписываемый `stdout` или `stderr` транслировать.

<a id="ERR_CONSTRUCT_CALL_INVALID"></a>

### `ERR_CONSTRUCT_CALL_INVALID`

<!--
added: v12.5.0
-->

Был вызван конструктор класса, который нельзя вызвать.

<a id="ERR_CONSTRUCT_CALL_REQUIRED"></a>

### `ERR_CONSTRUCT_CALL_REQUIRED`

Конструктор класса был вызван без `new`.

<a id="ERR_CONTEXT_NOT_INITIALIZED"></a>

### `ERR_CONTEXT_NOT_INITIALIZED`

Контекст vm, переданный в API, еще не инициализирован. Это может произойти при возникновении (и обнаружении) ошибки во время создания контекста, например, при сбое выделения или при достижении максимального размера стека вызовов при создании контекста.

<a id="ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED"></a>

### `ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED`

Был запрошен механизм сертификатов клиента, который не поддерживается используемой версией OpenSSL.

<a id="ERR_CRYPTO_ECDH_INVALID_FORMAT"></a>

### `ERR_CRYPTO_ECDH_INVALID_FORMAT`

Недопустимое значение для `format` аргумент был передан `crypto.ECDH()` класс `getPublicKey()` метод.

<a id="ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY"></a>

### `ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY`

Недопустимое значение для `key` аргумент был передан `crypto.ECDH()` класс `computeSecret()` метод. Это означает, что открытый ключ лежит за пределами эллиптической кривой.

<a id="ERR_CRYPTO_ENGINE_UNKNOWN"></a>

### `ERR_CRYPTO_ENGINE_UNKNOWN`

Неверный идентификатор криптографической машины был передан в [`require('crypto').setEngine()`](crypto.md#cryptosetengineengine-flags).

<a id="ERR_CRYPTO_FIPS_FORCED"></a>

### `ERR_CRYPTO_FIPS_FORCED`

В [`--force-fips`](cli.md#--force-fips) был использован аргумент командной строки, но была попытка включить или отключить режим FIPS в `crypto` модуль.

<a id="ERR_CRYPTO_FIPS_UNAVAILABLE"></a>

### `ERR_CRYPTO_FIPS_UNAVAILABLE`

Была сделана попытка включить или отключить режим FIPS, но режим FIPS был недоступен.

<a id="ERR_CRYPTO_HASH_FINALIZED"></a>

### `ERR_CRYPTO_HASH_FINALIZED`

[`hash.digest()`](crypto.md#hashdigestencoding) вызвали несколько раз. В `hash.digest()` метод должен вызываться не более одного раза для каждого экземпляра `Hash` объект.

<a id="ERR_CRYPTO_HASH_UPDATE_FAILED"></a>

### `ERR_CRYPTO_HASH_UPDATE_FAILED`

[`hash.update()`](crypto.md#hashupdatedata-inputencoding) не удалось по какой-либо причине. Это должно происходить редко, если вообще когда-либо случаться.

<a id="ERR_CRYPTO_INCOMPATIBLE_KEY"></a>

### `ERR_CRYPTO_INCOMPATIBLE_KEY`

Указанные криптографические ключи несовместимы с предпринятой операцией.

<a id="ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS"></a>

### `ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS`

Выбранная кодировка открытого или закрытого ключа несовместима с другими параметрами.

<a id="ERR_CRYPTO_INITIALIZATION_FAILED"></a>

### `ERR_CRYPTO_INITIALIZATION_FAILED`

<!-- YAML
added: v15.0.0
-->

Не удалось инициализировать криптоподсистему.

<a id="ERR_CRYPTO_INVALID_AUTH_TAG"></a>

### `ERR_CRYPTO_INVALID_AUTH_TAG`

<!-- YAML
added: v15.0.0
-->

Предоставлен недопустимый тег аутентификации.

<a id="ERR_CRYPTO_INVALID_COUNTER"></a>

### `ERR_CRYPTO_INVALID_COUNTER`

<!-- YAML
added: v15.0.0
-->

Для шифра режима противодействия предоставлен неверный счетчик.

<a id="ERR_CRYPTO_INVALID_CURVE"></a>

### `ERR_CRYPTO_INVALID_CURVE`

<!-- YAML
added: v15.0.0
-->

Была предоставлена неверная эллиптическая кривая.

<a id="ERR_CRYPTO_INVALID_DIGEST"></a>

### `ERR_CRYPTO_INVALID_DIGEST`

Недействительный [алгоритм криптодайджеста](crypto.md#cryptogethashes) было указано.

<a id="ERR_CRYPTO_INVALID_IV"></a>

### `ERR_CRYPTO_INVALID_IV`

<!-- YAML
added: v15.0.0
-->

Предоставлен недопустимый вектор инициализации.

<a id="ERR_CRYPTO_INVALID_JWK"></a>

### `ERR_CRYPTO_INVALID_JWK`

<!-- YAML
added: v15.0.0
-->

Был предоставлен недопустимый веб-ключ JSON.

<a id="ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE"></a>

### `ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE`

Данный тип объекта криптографического ключа недопустим для выполняемой операции.

<a id="ERR_CRYPTO_INVALID_KEYLEN"></a>

### `ERR_CRYPTO_INVALID_KEYLEN`

<!-- YAML
added: v15.0.0
-->

Была предоставлена неверная длина ключа.

<a id="ERR_CRYPTO_INVALID_KEYPAIR"></a>

### `ERR_CRYPTO_INVALID_KEYPAIR`

<!-- YAML
added: v15.0.0
-->

Была предоставлена неверная пара ключей.

<a id="ERR_CRYPTO_INVALID_KEYTYPE"></a>

### `ERR_CRYPTO_INVALID_KEYTYPE`

<!-- YAML
added: v15.0.0
-->

Предоставлен недопустимый тип ключа.

<a id="ERR_CRYPTO_INVALID_MESSAGELEN"></a>

### `ERR_CRYPTO_INVALID_MESSAGELEN`

<!-- YAML
added: v15.0.0
-->

Была предоставлена неверная длина сообщения.

<a id="ERR_CRYPTO_INVALID_SCRYPT_PARAMS"></a>

### `ERR_CRYPTO_INVALID_SCRYPT_PARAMS`

<!-- YAML
added: v15.0.0
-->

Были предоставлены неверные параметры алгоритма шифрования.

<a id="ERR_CRYPTO_INVALID_STATE"></a>

### `ERR_CRYPTO_INVALID_STATE`

Крипто-метод был использован для объекта, находившегося в недопустимом состоянии. Например, позвонив [`cipher.getAuthTag()`](crypto.md#ciphergetauthtag) перед звонком `cipher.final()`.

<a id="ERR_CRYPTO_INVALID_TAG_LENGTH"></a>

### `ERR_CRYPTO_INVALID_TAG_LENGTH`

<!-- YAML
added: v15.0.0
-->

Предоставлена неверная длина тега аутентификации.

<a id="ERR_CRYPTO_JOB_INIT_FAILED"></a>

### `ERR_CRYPTO_JOB_INIT_FAILED`

<!-- YAML
added: v15.0.0
-->

Не удалось инициализировать асинхронную криптооперацию.

<a id="ERR_CRYPTO_JWK_UNSUPPORTED_CURVE"></a>

### `ERR_CRYPTO_JWK_UNSUPPORTED_CURVE`

Эллиптическая кривая Ключа не зарегистрирована для использования в [Реестр эллиптических кривых веб-ключей JSON](https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve).

<a id="ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE"></a>

### `ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE`

Тип асимметричного ключа ключа не зарегистрирован для использования в [Реестр типов веб-ключей JSON](https://www.iana.org/assignments/jose/jose.xhtml#web-key-types).

<a id="ERR_CRYPTO_OPERATION_FAILED"></a>

### `ERR_CRYPTO_OPERATION_FAILED`

<!-- YAML
added: v15.0.0
-->

Криптооперация завершилась неудачно по неустановленной причине.

<a id="ERR_CRYPTO_PBKDF2_ERROR"></a>

### `ERR_CRYPTO_PBKDF2_ERROR`

Алгоритм PBKDF2 завершился неудачно по неустановленным причинам. OpenSSL не предоставляет более подробной информации, и, следовательно, Node.js.

<a id="ERR_CRYPTO_SCRYPT_INVALID_PARAMETER"></a>

### `ERR_CRYPTO_SCRYPT_INVALID_PARAMETER`

Один или больше [`crypto.scrypt()`](crypto.md#cryptoscryptpassword-salt-keylen-options-callback) или [`crypto.scryptSync()`](crypto.md#cryptoscryptsyncpassword-salt-keylen-options) параметры находятся за пределами допустимого диапазона.

<a id="ERR_CRYPTO_SCRYPT_NOT_SUPPORTED"></a>

### `ERR_CRYPTO_SCRYPT_NOT_SUPPORTED`

Node.js был скомпилирован без `scrypt` служба поддержки. Невозможно с официальными двоичными файлами выпуска, но может произойти с пользовательскими сборками, включая сборки дистрибутива.

<a id="ERR_CRYPTO_SIGN_KEY_REQUIRED"></a>

### `ERR_CRYPTO_SIGN_KEY_REQUIRED`

Подпись `key` не был предоставлен [`sign.sign()`](crypto.md#signsignprivatekey-outputencoding) метод.

<a id="ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH"></a>

### `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH`

[`crypto.timingSafeEqual()`](crypto.md#cryptotimingsafeequala-b) был вызван с `Buffer`, `TypedArray`, или `DataView` аргументы разной длины.

<a id="ERR_CRYPTO_UNKNOWN_CIPHER"></a>

### `ERR_CRYPTO_UNKNOWN_CIPHER`

Указан неизвестный шифр.

<a id="ERR_CRYPTO_UNKNOWN_DH_GROUP"></a>

### `ERR_CRYPTO_UNKNOWN_DH_GROUP`

Было дано неизвестное название группы Диффи-Хеллмана. Видеть [`crypto.getDiffieHellman()`](crypto.md#cryptogetdiffiehellmangroupname) для списка допустимых имен групп.

<a id="ERR_CRYPTO_UNSUPPORTED_OPERATION"></a>

### `ERR_CRYPTO_UNSUPPORTED_OPERATION`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

Была сделана попытка вызвать неподдерживаемую криптографическую операцию.

<a id="ERR_DEBUGGER_ERROR"></a>

### `ERR_DEBUGGER_ERROR`

<!-- YAML
added:
  - v16.4.0
  - v14.17.4
-->

Произошла ошибка с [отладчик](debugger.md).

<a id="ERR_DEBUGGER_STARTUP_ERROR"></a>

### `ERR_DEBUGGER_STARTUP_ERROR`

<!-- YAML
added:
  - v16.4.0
  - v14.17.4
-->

В [отладчик](debugger.md) истекло время ожидания освобождения необходимого хоста / порта.

<a id="ERR_DLOPEN_DISABLED"></a>

### `ERR_DLOPEN_DISABLED`

<!-- YAML
added: v16.10.0
-->

Загрузка собственных надстроек отключена с помощью [`--no-addons`](cli.md#--no-addons).

<a id="ERR_DLOPEN_FAILED"></a>

### `ERR_DLOPEN_FAILED`

<!-- YAML
added: v15.0.0
-->

Звонок в `process.dlopen()` не смогли.

<a id="ERR_DIR_CLOSED"></a>

### `ERR_DIR_CLOSED`

В [`fs.Dir`](fs.md#class-fsdir) ранее был закрыт.

<a id="ERR_DIR_CONCURRENT_OPERATION"></a>

### `ERR_DIR_CONCURRENT_OPERATION`

<!-- YAML
added: v14.3.0
-->

Была предпринята попытка синхронного чтения или закрытия [`fs.Dir`](fs.md#class-fsdir) который имеет текущие асинхронные операции.

<a id="ERR_DNS_SET_SERVERS_FAILED"></a>

### `ERR_DNS_SET_SERVERS_FAILED`

`c-ares` не удалось установить DNS-сервер.

<a id="ERR_DOMAIN_CALLBACK_NOT_AVAILABLE"></a>

### `ERR_DOMAIN_CALLBACK_NOT_AVAILABLE`

В `domain` модуль нельзя было использовать, так как он не мог установить требуемые перехватчики обработки ошибок, потому что [`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) был вызван в более ранний момент времени.

<a id="ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE"></a>

### `ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE`

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) нельзя было назвать, потому что `domain` модуль был загружен раньше.

Трассировка стека расширяется, чтобы включить момент времени, в который `domain` модуль был загружен.

<a id="ERR_ENCODING_INVALID_ENCODED_DATA"></a>

### `ERR_ENCODING_INVALID_ENCODED_DATA`

Данные предоставлены `TextDecoder()` API был недопустимым в соответствии с предоставленной кодировкой.

<a id="ERR_ENCODING_NOT_SUPPORTED"></a>

### `ERR_ENCODING_NOT_SUPPORTED`

Кодировка предоставлена `TextDecoder()` API не был одним из [WHATWG Поддерживаемые кодировки](util.md#whatwg-supported-encodings).

<a id="ERR_EVAL_ESM_CANNOT_PRINT"></a>

### `ERR_EVAL_ESM_CANNOT_PRINT`

`--print` не может использоваться с входом ESM.

<a id="ERR_EVENT_RECURSION"></a>

### `ERR_EVENT_RECURSION`

Вызывается, когда делается попытка рекурсивно отправить событие на `EventTarget`.

<a id="ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE"></a>

### `ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE`

Контекст выполнения JS не связан со средой Node.js. Это может произойти, если Node.js используется в качестве встроенной библиотеки и некоторые хуки для движка JS не настроены должным образом.

<a id="ERR_FALSY_VALUE_REJECTION"></a>

### `ERR_FALSY_VALUE_REJECTION`

А `Promise` это было выполнено обратным вызовом через `util.callbackify()` был отклонен с ложным значением.

<a id="ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"></a>

### `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM`

<!-- YAML
added: v14.0.0
-->

Используется, когда используется функция, недоступная для текущей платформы, на которой работает Node.js.

<a id="ERR_FS_CP_DIR_TO_NON_DIR"></a>

### `ERR_FS_CP_DIR_TO_NON_DIR`

<!--
added: v16.7.0
-->

Была сделана попытка скопировать каталог в не каталог (файл, символическую ссылку и т. Д.) С помощью [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_EEXIST"></a>

### `ERR_FS_CP_EEXIST`

<!--
added: v16.7.0
-->

Была сделана попытка скопировать файл, который уже существовал с [`fs.cp()`](fs.md#fscpsrc-dest-options-callback), с `force` а также `errorOnExist` установлен в `true`.

<a id="ERR_FS_CP_EINVAL"></a>

### `ERR_FS_CP_EINVAL`

<!--
added: v16.7.0
-->

Когда используешь [`fs.cp()`](fs.md#fscpsrc-dest-options-callback), `src` или `dest` указал на недопустимый путь.

<a id="ERR_FS_CP_FIFO_PIPE"></a>

### `ERR_FS_CP_FIFO_PIPE`

<!--
added: v16.7.0
-->

Была сделана попытка скопировать именованный канал с [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_NON_DIR_TO_DIR"></a>

### `ERR_FS_CP_NON_DIR_TO_DIR`

<!--
added: v16.7.0
-->

Была сделана попытка скопировать не каталог (файл, символическую ссылку и т. Д.) В каталог с помощью [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_SOCKET"></a>

### `ERR_FS_CP_SOCKET`

<!--
added: v16.7.0
-->

Была сделана попытка скопировать в сокет с [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY"></a>

### `ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY`

<!--
added: v16.7.0
-->

Когда используешь [`fs.cp()`](fs.md#fscpsrc-dest-options-callback), символическая ссылка в `dest` указал на подкаталог `src`.

<a id="ERR_FS_CP_UNKNOWN"></a>

### `ERR_FS_CP_UNKNOWN`

<!--
added: v16.7.0
-->

Была сделана попытка скопировать файл неизвестного типа с [`fs.cp()`](fs.md#fscpsrc-dest-options-callback).

<a id="ERR_FS_EISDIR"></a>

### `ERR_FS_EISDIR`

Путь - это каталог.

<a id="ERR_FS_FILE_TOO_LARGE"></a>

### `ERR_FS_FILE_TOO_LARGE`

Была сделана попытка прочитать файл, размер которого превышает максимально допустимый размер для `Buffer`.

<a id="ERR_FS_INVALID_SYMLINK_TYPE"></a>

### `ERR_FS_INVALID_SYMLINK_TYPE`

Недопустимый тип символической ссылки был передан в [`fs.symlink()`](fs.md#fssymlinktarget-path-type-callback) или [`fs.symlinkSync()`](fs.md#fssymlinksynctarget-path-type) методы.

<a id="ERR_HTTP_HEADERS_SENT"></a>

### `ERR_HTTP_HEADERS_SENT`

Была сделана попытка добавить дополнительные заголовки после того, как они уже были отправлены.

<a id="ERR_HTTP_INVALID_HEADER_VALUE"></a>

### `ERR_HTTP_INVALID_HEADER_VALUE`

Указано недопустимое значение заголовка HTTP.

<a id="ERR_HTTP_INVALID_STATUS_CODE"></a>

### `ERR_HTTP_INVALID_STATUS_CODE`

Код состояния находился за пределами обычного диапазона кодов состояния (100–999).

<a id="ERR_HTTP_REQUEST_TIMEOUT"></a>

### `ERR_HTTP_REQUEST_TIMEOUT`

Клиент не отправил весь запрос в отведенное время.

<a id="ERR_HTTP_SOCKET_ENCODING"></a>

### `ERR_HTTP_SOCKET_ENCODING`

Изменение кодировки сокета запрещено [RFC 7230, раздел 3](https://tools.ietf.org/html/rfc7230#section-3).

<a id="ERR_HTTP_TRAILER_INVALID"></a>

### `ERR_HTTP_TRAILER_INVALID`

В `Trailer` заголовок был установлен, хотя кодировка передачи не поддерживает это.

<a id="ERR_HTTP2_ALTSVC_INVALID_ORIGIN"></a>

### `ERR_HTTP2_ALTSVC_INVALID_ORIGIN`

Для фреймов HTTP / 2 ALTSVC требуется действительное происхождение.

<a id="ERR_HTTP2_ALTSVC_LENGTH"></a>

### `ERR_HTTP2_ALTSVC_LENGTH`

Кадры HTTP / 2 ALTSVC ограничены максимум 16 382 байтами полезной нагрузки.

<a id="ERR_HTTP2_CONNECT_AUTHORITY"></a>

### `ERR_HTTP2_CONNECT_AUTHORITY`

Для запросов HTTP / 2 с использованием `CONNECT` метод, `:authority` псевдозаголовок обязателен.

<a id="ERR_HTTP2_CONNECT_PATH"></a>

### `ERR_HTTP2_CONNECT_PATH`

Для запросов HTTP / 2 с использованием `CONNECT` метод, `:path` псевдозаголовок запрещен.

<a id="ERR_HTTP2_CONNECT_SCHEME"></a>

### `ERR_HTTP2_CONNECT_SCHEME`

Для запросов HTTP / 2 с использованием `CONNECT` метод, `:scheme` псевдозаголовок запрещен.

<a id="ERR_HTTP2_ERROR"></a>

### `ERR_HTTP2_ERROR`

Произошла неспецифическая ошибка HTTP / 2.

<a id="ERR_HTTP2_GOAWAY_SESSION"></a>

### `ERR_HTTP2_GOAWAY_SESSION`

Новые потоки HTTP / 2 нельзя открывать после `Http2Session` получил `GOAWAY` кадр от подключенного однорангового узла.

<a id="ERR_HTTP2_HEADER_SINGLE_VALUE"></a>

### `ERR_HTTP2_HEADER_SINGLE_VALUE`

Было предоставлено несколько значений для поля заголовка HTTP / 2, которое должно было иметь только одно значение.

<a id="ERR_HTTP2_HEADERS_AFTER_RESPOND"></a>

### `ERR_HTTP2_HEADERS_AFTER_RESPOND`

Дополнительные заголовки были указаны после того, как был инициирован ответ HTTP / 2.

<a id="ERR_HTTP2_HEADERS_SENT"></a>

### `ERR_HTTP2_HEADERS_SENT`

Была сделана попытка отправить несколько заголовков ответа.

<a id="ERR_HTTP2_INFO_STATUS_NOT_ALLOWED"></a>

### `ERR_HTTP2_INFO_STATUS_NOT_ALLOWED`

Информационные коды состояния HTTP (`1xx`) не может быть установлен в качестве кода состояния ответа в ответах HTTP / 2.

<a id="ERR_HTTP2_INVALID_CONNECTION_HEADERS"></a>

### `ERR_HTTP2_INVALID_CONNECTION_HEADERS`

Заголовки соединения HTTP / 1 запрещено использовать в запросах и ответах HTTP / 2.

<a id="ERR_HTTP2_INVALID_HEADER_VALUE"></a>

### `ERR_HTTP2_INVALID_HEADER_VALUE`

Указано недопустимое значение заголовка HTTP / 2.

<a id="ERR_HTTP2_INVALID_INFO_STATUS"></a>

### `ERR_HTTP2_INVALID_INFO_STATUS`

Указан недопустимый информационный код состояния HTTP. Информационные коды состояния должны быть целыми числами между `100` а также `199` (включительно).

<a id="ERR_HTTP2_INVALID_ORIGIN"></a>

### `ERR_HTTP2_INVALID_ORIGIN`

HTTP / 2 `ORIGIN` кадры требуют действительного происхождения.

<a id="ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH"></a>

### `ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH`

Вход `Buffer` а также `Uint8Array` экземпляры переданы в `http2.getUnpackedSettings()` API должен иметь длину, кратную шести.

<a id="ERR_HTTP2_INVALID_PSEUDOHEADER"></a>

### `ERR_HTTP2_INVALID_PSEUDOHEADER`

Только допустимые псевдозаголовки HTTP / 2 (`:status`, `:path`, `:authority`, `:scheme`, а также `:method`) может быть использовано.

<a id="ERR_HTTP2_INVALID_SESSION"></a>

### `ERR_HTTP2_INVALID_SESSION`

Действие было выполнено с `Http2Session` объект, который уже был уничтожен.

<a id="ERR_HTTP2_INVALID_SETTING_VALUE"></a>

### `ERR_HTTP2_INVALID_SETTING_VALUE`

Для параметра HTTP / 2 указано недопустимое значение.

<a id="ERR_HTTP2_INVALID_STREAM"></a>

### `ERR_HTTP2_INVALID_STREAM`

Операция была выполнена над потоком, который уже был уничтожен.

<a id="ERR_HTTP2_MAX_PENDING_SETTINGS_ACK"></a>

### `ERR_HTTP2_MAX_PENDING_SETTINGS_ACK`

Всякий раз, когда HTTP / 2 `SETTINGS` фрейм отправляется подключенному одноранговому узлу, одноранговый узел должен отправить подтверждение, что он получил и применил новый `SETTINGS`. По умолчанию максимальное количество неподтвержденных `SETTINGS` кадры могут быть отправлены в любой момент времени. Этот код ошибки используется при достижении этого предела.

<a id="ERR_HTTP2_NESTED_PUSH"></a>

### `ERR_HTTP2_NESTED_PUSH`

Была сделана попытка инициировать новый push-поток из push-потока. Вложенные push-потоки не разрешены.

<a id="ERR_HTTP2_NO_MEM"></a>

### `ERR_HTTP2_NO_MEM`

Недостаточно памяти при использовании `http2session.setLocalWindowSize(windowSize)` API.

<a id="ERR_HTTP2_NO_SOCKET_MANIPULATION"></a>

### `ERR_HTTP2_NO_SOCKET_MANIPULATION`

Была предпринята попытка напрямую манипулировать (чтение, запись, пауза, возобновление и т. Д.) Сокетом, подключенным к `Http2Session`.

<a id="ERR_HTTP2_ORIGIN_LENGTH"></a>

### `ERR_HTTP2_ORIGIN_LENGTH`

HTTP / 2 `ORIGIN` кадры ограничены длиной 16382 байта.

<a id="ERR_HTTP2_OUT_OF_STREAMS"></a>

### `ERR_HTTP2_OUT_OF_STREAMS`

Количество потоков, созданных в одном сеансе HTTP / 2, достигло максимального предела.

<a id="ERR_HTTP2_PAYLOAD_FORBIDDEN"></a>

### `ERR_HTTP2_PAYLOAD_FORBIDDEN`

Полезная нагрузка сообщения была указана для кода ответа HTTP, для которого полезная нагрузка запрещена.

<a id="ERR_HTTP2_PING_CANCEL"></a>

### `ERR_HTTP2_PING_CANCEL`

Пинг HTTP / 2 был отменен.

<a id="ERR_HTTP2_PING_LENGTH"></a>

### `ERR_HTTP2_PING_LENGTH`

Полезные данные ping HTTP / 2 должны иметь длину ровно 8 байтов.

<a id="ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED"></a>

### `ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED`

Псевдозаголовок HTTP / 2 использован ненадлежащим образом. Псевдо-заголовки - это имена ключей заголовков, которые начинаются с `:` приставка.

<a id="ERR_HTTP2_PUSH_DISABLED"></a>

### `ERR_HTTP2_PUSH_DISABLED`

Была сделана попытка создать push-поток, который был отключен клиентом.

<a id="ERR_HTTP2_SEND_FILE"></a>

### `ERR_HTTP2_SEND_FILE`

Была сделана попытка использовать `Http2Stream.prototype.responseWithFile()` API для отправки каталога.

<a id="ERR_HTTP2_SEND_FILE_NOSEEK"></a>

### `ERR_HTTP2_SEND_FILE_NOSEEK`

Была сделана попытка использовать `Http2Stream.prototype.responseWithFile()` API для отправки чего-то другого, кроме обычного файла, но `offset` или `length` были предоставлены варианты.

<a id="ERR_HTTP2_SESSION_ERROR"></a>

### `ERR_HTTP2_SESSION_ERROR`

В `Http2Session` закрывается с ненулевым кодом ошибки.

<a id="ERR_HTTP2_SETTINGS_CANCEL"></a>

### `ERR_HTTP2_SETTINGS_CANCEL`

В `Http2Session` настройки отменены.

<a id="ERR_HTTP2_SOCKET_BOUND"></a>

### `ERR_HTTP2_SOCKET_BOUND`

Была сделана попытка подключить `Http2Session` возражать против `net.Socket` или `tls.TLSSocket` который уже был привязан к другому `Http2Session` объект.

<a id="ERR_HTTP2_SOCKET_UNBOUND"></a>

### `ERR_HTTP2_SOCKET_UNBOUND`

Была сделана попытка использовать `socket` собственность `Http2Session` это уже было закрыто.

<a id="ERR_HTTP2_STATUS_101"></a>

### `ERR_HTTP2_STATUS_101`

Использование `101` Информационный код статуса запрещен в HTTP / 2.

<a id="ERR_HTTP2_STATUS_INVALID"></a>

### `ERR_HTTP2_STATUS_INVALID`

Указан недопустимый код состояния HTTP. Коды состояния должны быть целыми числами между `100` а также `599` (включительно).

<a id="ERR_HTTP2_STREAM_CANCEL"></a>

### `ERR_HTTP2_STREAM_CANCEL`

An `Http2Stream` был уничтожен до того, как какие-либо данные были переданы подключенному узлу.

<a id="ERR_HTTP2_STREAM_ERROR"></a>

### `ERR_HTTP2_STREAM_ERROR`

Ненулевой код ошибки был указан в `RST_STREAM` Рамка.

<a id="ERR_HTTP2_STREAM_SELF_DEPENDENCY"></a>

### `ERR_HTTP2_STREAM_SELF_DEPENDENCY`

При установке приоритета для потока HTTP / 2 этот поток может быть помечен как зависимость для родительского потока. Этот код ошибки используется, когда делается попытка пометить поток и зависит от него самого.

<a id="ERR_HTTP2_TOO_MANY_INVALID_FRAMES"></a>

### `ERR_HTTP2_TOO_MANY_INVALID_FRAMES`

<!--
added: v15.14.0
-->

Предел приемлемых недопустимых кадров протокола HTTP / 2, отправленных партнером, как указано в `maxSessionInvalidFrames` вариант, был превышен.

<a id="ERR_HTTP2_TRAILERS_ALREADY_SENT"></a>

### `ERR_HTTP2_TRAILERS_ALREADY_SENT`

Конечные заголовки уже отправлены на `Http2Stream`.

<a id="ERR_HTTP2_TRAILERS_NOT_READY"></a>

### `ERR_HTTP2_TRAILERS_NOT_READY`

В `http2stream.sendTrailers()` метод не может быть вызван до тех пор, пока `'wantTrailers'` событие испускается на `Http2Stream` объект. В `'wantTrailers'` событие будет сгенерировано только в том случае, если `waitForTrailers` опция установлена для `Http2Stream`.

<a id="ERR_HTTP2_UNSUPPORTED_PROTOCOL"></a>

### `ERR_HTTP2_UNSUPPORTED_PROTOCOL`

`http2.connect()` был передан URL-адрес, использующий любой протокол, кроме `http:` или `https:`.

<a id="ERR_ILLEGAL_CONSTRUCTOR"></a>

### `ERR_ILLEGAL_CONSTRUCTOR`

Была предпринята попытка построить объект с использованием закрытого конструктора.

<a id="ERR_INCOMPATIBLE_OPTION_PAIR"></a>

### `ERR_INCOMPATIBLE_OPTION_PAIR`

Пара опций несовместима друг с другом и не может использоваться одновременно.

<a id="ERR_INPUT_TYPE_NOT_ALLOWED"></a>

### `ERR_INPUT_TYPE_NOT_ALLOWED`

> Стабильность: 1 - экспериментальная

В `--input-type` Флаг использовался для попытки выполнить файл. Этот флаг можно использовать только при вводе через `--eval`, `--print` или `STDIN`.

<a id="ERR_INSPECTOR_ALREADY_ACTIVATED"></a>

### `ERR_INSPECTOR_ALREADY_ACTIVATED`

При использовании `inspector` module была предпринята попытка активировать инспектор, когда он уже начал прослушивать порт. Использовать `inspector.close()` прежде чем активировать его на другом адресе.

<a id="ERR_INSPECTOR_ALREADY_CONNECTED"></a>

### `ERR_INSPECTOR_ALREADY_CONNECTED`

При использовании `inspector` модуль, была предпринята попытка подключения, когда инспектор уже был подключен.

<a id="ERR_INSPECTOR_CLOSED"></a>

### `ERR_INSPECTOR_CLOSED`

При использовании `inspector` модуля, была предпринята попытка использовать инспектор после того, как сессия уже закрылась.

<a id="ERR_INSPECTOR_COMMAND"></a>

### `ERR_INSPECTOR_COMMAND`

Произошла ошибка при подаче команды через `inspector` модуль.

<a id="ERR_INSPECTOR_NOT_ACTIVE"></a>

### `ERR_INSPECTOR_NOT_ACTIVE`

В `inspector` не активен, когда `inspector.waitForDebugger()` называется.

<a id="ERR_INSPECTOR_NOT_AVAILABLE"></a>

### `ERR_INSPECTOR_NOT_AVAILABLE`

В `inspector` модуль недоступен для использования.

<a id="ERR_INSPECTOR_NOT_CONNECTED"></a>

### `ERR_INSPECTOR_NOT_CONNECTED`

При использовании `inspector` модуль, была предпринята попытка использовать инспектор до его подключения.

<a id="ERR_INSPECTOR_NOT_WORKER"></a>

### `ERR_INSPECTOR_NOT_WORKER`

В основном потоке был вызван API, который можно использовать только из рабочего потока.

<a id="ERR_INTERNAL_ASSERTION"></a>

### `ERR_INTERNAL_ASSERTION`

Ошибка в Node.js или некорректное использование внутренних компонентов Node.js. Чтобы исправить ошибку, откройте проблему на <https://github.com/nodejs/node/issues>.

<a id="ERR_INVALID_ADDRESS_FAMILY"></a>

### `ERR_INVALID_ADDRESS_FAMILY`

Указанное семейство адресов не распознается API Node.js.

<a id="ERR_INVALID_ARG_TYPE"></a>

### `ERR_INVALID_ARG_TYPE`

В API Node.js был передан аргумент неправильного типа.

<a id="ERR_INVALID_ARG_VALUE"></a>

### `ERR_INVALID_ARG_VALUE`

Для данного аргумента было передано недопустимое или неподдерживаемое значение.

<a id="ERR_INVALID_ASYNC_ID"></a>

### `ERR_INVALID_ASYNC_ID`

Недействительный `asyncId` или `triggerAsyncId` был передан с использованием `AsyncHooks`. Идентификатор меньше -1 никогда не должен происходить.

<a id="ERR_INVALID_BUFFER_SIZE"></a>

### `ERR_INVALID_BUFFER_SIZE`

Обмен был произведен на `Buffer` но его размер был несовместим с операцией.

<a id="ERR_INVALID_CALLBACK"></a>

### `ERR_INVALID_CALLBACK`

Требовалась функция обратного вызова, но она не была предоставлена API Node.js.

<a id="ERR_INVALID_CHAR"></a>

### `ERR_INVALID_CHAR`

В заголовках обнаружены недопустимые символы.

<a id="ERR_INVALID_CURSOR_POS"></a>

### `ERR_INVALID_CURSOR_POS`

Курсор в данном потоке нельзя переместить в указанную строку без указанного столбца.

<a id="ERR_INVALID_FD"></a>

### `ERR_INVALID_FD`

Дескриптор файла ('fd') недействителен (например, имеет отрицательное значение).

<a id="ERR_INVALID_FD_TYPE"></a>

### `ERR_INVALID_FD_TYPE`

Недопустимый тип дескриптора файла ('fd').

<a id="ERR_INVALID_FILE_URL_HOST"></a>

### `ERR_INVALID_FILE_URL_HOST`

API-интерфейс Node.js, который потребляет `file:` URL-адреса (например, определенные функции в [`fs`](fs.md) module) обнаружил URL-адрес файла с несовместимым хостом. Эта ситуация может возникнуть только в Unix-подобных системах, где только `localhost` или поддерживается пустой хост.

<a id="ERR_INVALID_FILE_URL_PATH"></a>

### `ERR_INVALID_FILE_URL_PATH`

API-интерфейс Node.js, который потребляет `file:` URL-адреса (например, определенные функции в [`fs`](fs.md) module) обнаружил URL-адрес файла с несовместимым путем. Точная семантика для определения возможности использования пути зависит от платформы.

<a id="ERR_INVALID_HANDLE_TYPE"></a>

### `ERR_INVALID_HANDLE_TYPE`

Была сделана попытка отправить неподдерживаемый «дескриптор» по каналу связи IPC дочернему процессу. Видеть [`subprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback) а также [`process.send()`](process.md#processsendmessage-sendhandle-options-callback) для дополнительной информации.

<a id="ERR_INVALID_HTTP_TOKEN"></a>

### `ERR_INVALID_HTTP_TOKEN`

Предоставлен недопустимый токен HTTP.

<a id="ERR_INVALID_IP_ADDRESS"></a>

### `ERR_INVALID_IP_ADDRESS`

IP-адрес недействителен.

<a id="ERR_INVALID_MODULE"></a>

### `ERR_INVALID_MODULE`

<!-- YAML
added:
  - v15.0.0
  - v14.18.0
-->

Была сделана попытка загрузить несуществующий или недействительный модуль.

<a id="ERR_INVALID_MODULE_SPECIFIER"></a>

### `ERR_INVALID_MODULE_SPECIFIER`

Строка импортированного модуля является недопустимым URL-адресом, именем пакета или указателем подпути пакета.

<a id="ERR_INVALID_PACKAGE_CONFIG"></a>

### `ERR_INVALID_PACKAGE_CONFIG`

Недействительный [`package.json`](packages.md#nodejs-packagejson-field-definitions) файл не прошел синтаксический анализ.

<a id="ERR_INVALID_PACKAGE_TARGET"></a>

### `ERR_INVALID_PACKAGE_TARGET`

В `package.json` [`"exports"`](packages.md#exports) Поле содержит недопустимое значение сопоставления цели для попытки разрешения модуля.

<a id="ERR_INVALID_PERFORMANCE_MARK"></a>

### `ERR_INVALID_PERFORMANCE_MARK`

При использовании Performance Timing API (`perf_hooks`), отметка о производительности недействительна.

<a id="ERR_INVALID_PROTOCOL"></a>

### `ERR_INVALID_PROTOCOL`

Недействительный `options.protocol` был передан `http.request()`.

<a id="ERR_INVALID_REPL_EVAL_CONFIG"></a>

### `ERR_INVALID_REPL_EVAL_CONFIG`

Оба `breakEvalOnSigint` а также `eval` параметры были установлены в [`REPL`](repl.md) config, который не поддерживается.

<a id="ERR_INVALID_REPL_INPUT"></a>

### `ERR_INVALID_REPL_INPUT`

Вход не может использоваться в [`REPL`](repl.md). Условия, при которых используется эта ошибка, описаны в [`REPL`](repl.md) документация.

<a id="ERR_INVALID_RETURN_PROPERTY"></a>

### `ERR_INVALID_RETURN_PROPERTY`

Выбрасывается в случае, если параметр функции не предоставляет допустимое значение для одного из свойств возвращаемого объекта при выполнении.

<a id="ERR_INVALID_RETURN_PROPERTY_VALUE"></a>

### `ERR_INVALID_RETURN_PROPERTY_VALUE`

Выбрасывается в случае, если параметр функции не предоставляет тип ожидаемого значения для одного из свойств возвращаемого объекта при выполнении.

<a id="ERR_INVALID_RETURN_VALUE"></a>

### `ERR_INVALID_RETURN_VALUE`

Вызывается в случае, если опция функции не возвращает ожидаемый тип значения при выполнении, например, когда ожидается, что функция вернет обещание.

<a id="ERR_INVALID_STATE"></a>

### `ERR_INVALID_STATE`

<!-- YAML
added: v15.0.0
-->

Указывает, что операция не может быть завершена из-за недопустимого состояния. Например, объект может быть уже уничтожен или может выполнять другую операцию.

<a id="ERR_INVALID_SYNC_FORK_INPUT"></a>

### `ERR_INVALID_SYNC_FORK_INPUT`

А `Buffer`, `TypedArray`, `DataView` или `string` был предоставлен как вход stdio для асинхронной вилки. См. Документацию по [`child_process`](child_process.md) модуль для получения дополнительной информации.

<a id="ERR_INVALID_THIS"></a>

### `ERR_INVALID_THIS`

Функция API Node.js была вызвана с несовместимым `this` ценить.

```js
const urlSearchParams = new URLSearchParams(
  'foo=bar&baz=new'
);

const buf = Buffer.alloc(1);
urlSearchParams.has.call(buf, 'foo');
// Throws a TypeError with code 'ERR_INVALID_THIS'
```

<a id="ERR_INVALID_TRANSFER_OBJECT"></a>

### `ERR_INVALID_TRANSFER_OBJECT`

Недопустимый объект передачи был передан в `postMessage()`.

<a id="ERR_INVALID_TUPLE"></a>

### `ERR_INVALID_TUPLE`

Элемент в `iterable` предоставлен [WHATWG](url.md#the-whatwg-url-api) [`URLSearchParams` конструктор](url.md#new-urlsearchparamsiterable) не представлял `[name, value]` кортеж - то есть, если элемент не повторяется или не состоит ровно из двух элементов.

<a id="ERR_INVALID_URI"></a>

### `ERR_INVALID_URI`

Передан неверный URI.

<a id="ERR_INVALID_URL"></a>

### `ERR_INVALID_URL`

Недействительный URL был передан в [WHATWG](url.md#the-whatwg-url-api) [`URL` конструктор](url.md#new-urlinput-base) или наследие [`url.parse()`](url.md#urlparseurlstring-parsequerystring-slashesdenotehost) быть разобранным. Выброшенный объект ошибки обычно имеет дополнительное свойство `'input'` который содержит URL-адрес, который не удалось проанализировать.

<a id="ERR_INVALID_URL_SCHEME"></a>

### `ERR_INVALID_URL_SCHEME`

Была сделана попытка использовать URL несовместимой схемы (протокола) для определенной цели. Он используется только в [WHATWG URL API](url.md#the-whatwg-url-api) поддержка в [`fs`](fs.md) модуль (который принимает только URL-адреса с `'file'` схема), но может использоваться и в других API Node.js в будущем.

<a id="ERR_IPC_CHANNEL_CLOSED"></a>

### `ERR_IPC_CHANNEL_CLOSED`

Была сделана попытка использовать канал связи IPC, который уже был закрыт.

<a id="ERR_IPC_DISCONNECTED"></a>

### `ERR_IPC_DISCONNECTED`

Была сделана попытка отключить уже отключенный канал связи IPC. См. Документацию по [`child_process`](child_process.md) модуль для получения дополнительной информации.

<a id="ERR_IPC_ONE_PIPE"></a>

### `ERR_IPC_ONE_PIPE`

Была предпринята попытка создать дочерний процесс Node.js, использующий более одного канала связи IPC. См. Документацию по [`child_process`](child_process.md) модуль для получения дополнительной информации.

<a id="ERR_IPC_SYNC_FORK"></a>

### `ERR_IPC_SYNC_FORK`

Была предпринята попытка открыть канал связи IPC с помощью синхронно разветвленного процесса Node.js. См. Документацию по [`child_process`](child_process.md) модуль для получения дополнительной информации.

<a id="ERR_MANIFEST_ASSERT_INTEGRITY"></a>

### `ERR_MANIFEST_ASSERT_INTEGRITY`

Была предпринята попытка загрузить ресурс, но ресурс не соответствовал целостности, определенной в манифесте политики. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MANIFEST_DEPENDENCY_MISSING"></a>

### `ERR_MANIFEST_DEPENDENCY_MISSING`

Была предпринята попытка загрузить ресурс, но ресурс не был указан как зависимость от расположения, в котором его пытались загрузить. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MANIFEST_INTEGRITY_MISMATCH"></a>

### `ERR_MANIFEST_INTEGRITY_MISMATCH`

Была сделана попытка загрузить манифест политики, но в манифесте было несколько записей для ресурса, которые не совпадали друг с другом. Обновите записи манифеста, чтобы они соответствовали, чтобы устранить эту ошибку. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MANIFEST_INVALID_RESOURCE_FIELD"></a>

### `ERR_MANIFEST_INVALID_RESOURCE_FIELD`

Ресурс манифеста политики имел недопустимое значение для одного из полей. Обновите запись манифеста, чтобы она соответствовала, чтобы устранить эту ошибку. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MANIFEST_INVALID_SPECIFIER"></a>

### `ERR_MANIFEST_INVALID_SPECIFIER`

Ресурс манифеста политики имел недопустимое значение для одного из сопоставлений зависимостей. Обновите запись манифеста, чтобы она соответствовала разрешению этой ошибки. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MANIFEST_PARSE_POLICY"></a>

### `ERR_MANIFEST_PARSE_POLICY`

Была предпринята попытка загрузить манифест политики, но не удалось проанализировать манифест. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MANIFEST_TDZ"></a>

### `ERR_MANIFEST_TDZ`

Была предпринята попытка чтения из манифеста политики, но инициализация манифеста еще не произошла. Вероятно, это ошибка в Node.js.

<a id="ERR_MANIFEST_UNKNOWN_ONERROR"></a>

### `ERR_MANIFEST_UNKNOWN_ONERROR`

Манифест политики был загружен, но для его поведения "onerror" было неизвестно значение. Документацию для [политика](policy.md) манифесты для получения дополнительной информации.

<a id="ERR_MEMORY_ALLOCATION_FAILED"></a>

### `ERR_MEMORY_ALLOCATION_FAILED`

Была предпринята попытка выделить память (обычно на уровне C ++), но она не удалась.

<a id="ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE"></a>

### `ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

Сообщение отправлено [`MessagePort`](worker_threads.md#class-messageport) не удалось десериализовать в целевой [vm](vm.md) `Context`. Не все объекты Node.js могут быть успешно созданы в любом контексте в настоящее время, и попытки передать их с помощью `postMessage()` в этом случае может выйти из строя принимающая сторона.

<a id="ERR_METHOD_NOT_IMPLEMENTED"></a>

### `ERR_METHOD_NOT_IMPLEMENTED`

Метод требуется, но не реализован.

<a id="ERR_MISSING_ARGS"></a>

### `ERR_MISSING_ARGS`

Не был передан обязательный аргумент API Node.js. Это используется только для строгого соответствия спецификации API (которая в некоторых случаях может принимать `func(undefined)` но нет `func()`). В большинстве собственных API-интерфейсов Node.js `func(undefined)` а также `func()` рассматриваются одинаково, а [`ERR_INVALID_ARG_TYPE`](#err_invalid_arg_type) вместо этого можно использовать код ошибки.

<a id="ERR_MISSING_OPTION"></a>

### `ERR_MISSING_OPTION`

Для API-интерфейсов, которые принимают объекты параметров, некоторые параметры могут быть обязательными. Этот код выдается, если отсутствует необходимая опция.

<a id="ERR_MISSING_PASSPHRASE"></a>

### `ERR_MISSING_PASSPHRASE`

Была сделана попытка прочитать зашифрованный ключ без указания ключевой фразы.

<a id="ERR_MISSING_PLATFORM_FOR_WORKER"></a>

### `ERR_MISSING_PLATFORM_FOR_WORKER`

Платформа V8, используемая этим экземпляром Node.js, не поддерживает создание рабочих. Это вызвано отсутствием поддержки Embedder для Workers. В частности, эта ошибка не возникает при использовании стандартных сборок Node.js.

<a id="ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST"></a>

### `ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`

<!-- YAML
added: v15.0.0
-->

Объект, который должен быть явно указан в `transferList` аргумент находится в объекте, переданном в [`postMessage()`](worker_threads.md#portpostmessagevalue-transferlist) звоните, но не указано в `transferList` для этого звонка. Обычно это `MessagePort`.

В версиях Node.js до v15.0.0 использованный здесь код ошибки был [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](#err_missing_message_port_in_transfer_list). Однако набор переносимых типов объектов был расширен, чтобы охватить больше типов, чем `MessagePort`.

<a id="ERR_MODULE_NOT_FOUND"></a>

### `ERR_MODULE_NOT_FOUND`

> Стабильность: 1 - экспериментальная

An [Модуль ES](esm.md) не может быть решен.

<a id="ERR_MULTIPLE_CALLBACK"></a>

### `ERR_MULTIPLE_CALLBACK`

Обратный звонок был вызван более одного раза.

Обратный вызов почти всегда предназначен для однократного вызова, поскольку запрос может быть выполнен или отклонен, но не оба одновременно. Последнее станет возможным, если вызвать обратный вызов более одного раза.

<a id="ERR_NAPI_CONS_FUNCTION"></a>

### `ERR_NAPI_CONS_FUNCTION`

При использовании `Node-API`, переданный конструктор не является функцией.

<a id="ERR_NAPI_INVALID_DATAVIEW_ARGS"></a>

### `ERR_NAPI_INVALID_DATAVIEW_ARGS`

Во время звонка `napi_create_dataview()`, данный `offset` находился за пределами окна просмотра данных или `offset + length` был больше, чем длина заданного `buffer`.

<a id="ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT"></a>

### `ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT`

Во время звонка `napi_create_typedarray()`предоставленные `offset` не был кратен размеру элемента.

<a id="ERR_NAPI_INVALID_TYPEDARRAY_LENGTH"></a>

### `ERR_NAPI_INVALID_TYPEDARRAY_LENGTH`

Во время звонка `napi_create_typedarray()`, `(length * size_of_element) + byte_offset` был больше, чем длина заданного `buffer`.

<a id="ERR_NAPI_TSFN_CALL_JS"></a>

### `ERR_NAPI_TSFN_CALL_JS`

Произошла ошибка при вызове части JavaScript поточно-ориентированной функции.

<a id="ERR_NAPI_TSFN_GET_UNDEFINED"></a>

### `ERR_NAPI_TSFN_GET_UNDEFINED`

Произошла ошибка при попытке получить код JavaScript. `undefined` ценить.

<a id="ERR_NAPI_TSFN_START_IDLE_LOOP"></a>

### `ERR_NAPI_TSFN_START_IDLE_LOOP`

В основном потоке значения удаляются из очереди, связанной с поточно-ориентированной функцией, в цикле ожидания. Эта ошибка указывает на то, что произошла ошибка при попытке запустить цикл.

<a id="ERR_NAPI_TSFN_STOP_IDLE_LOOP"></a>

### `ERR_NAPI_TSFN_STOP_IDLE_LOOP`

Если в очереди больше не осталось элементов, цикл простоя должен быть приостановлен. Эта ошибка указывает на то, что не удалось остановить цикл холостого хода.

<a id="ERR_NO_CRYPTO"></a>

### `ERR_NO_CRYPTO`

Была предпринята попытка использовать функции шифрования, пока Node.js не был скомпилирован с поддержкой шифрования OpenSSL.

<a id="ERR_NO_ICU"></a>

### `ERR_NO_ICU`

Была предпринята попытка использовать функции, требующие [ICU](intl.md#internationalization-support), но Node.js не был скомпилирован с поддержкой ICU.

<a id="ERR_NON_CONTEXT_AWARE_DISABLED"></a>

### `ERR_NON_CONTEXT_AWARE_DISABLED`

Родной аддон, не зависящий от контекста, был загружен в процессе, который их запрещает.

<a id="ERR_OUT_OF_RANGE"></a>

### `ERR_OUT_OF_RANGE`

Заданное значение выходит за пределы допустимого диапазона.

<a id="ERR_PACKAGE_IMPORT_NOT_DEFINED"></a>

### `ERR_PACKAGE_IMPORT_NOT_DEFINED`

В `package.json` [`"imports"`](packages.md#imports) поле не определяет заданное отображение спецификатора внутреннего пакета.

<a id="ERR_PACKAGE_PATH_NOT_EXPORTED"></a>

### `ERR_PACKAGE_PATH_NOT_EXPORTED`

В `package.json` [`"exports"`](packages.md#exports) не экспортирует запрошенный подпуть. Поскольку экспорт инкапсулирован, частные внутренние модули, которые не экспортируются, не могут быть импортированы через разрешение пакета, если не используется абсолютный URL-адрес.

<a id="ERR_PERFORMANCE_INVALID_TIMESTAMP"></a>

### `ERR_PERFORMANCE_INVALID_TIMESTAMP`

Для отметки производительности или показателя было предоставлено недопустимое значение метки времени.

<a id="ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS"></a>

### `ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS`

Предусмотрены недопустимые варианты измерения производительности.

<a id="ERR_PROTO_ACCESS"></a>

### `ERR_PROTO_ACCESS`

Доступ `Object.prototype.__proto__` было запрещено использовать [`--disable-proto=throw`](cli.md#--disable-protomode). [`Object.getPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf) а также [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf) следует использовать для получения и установки прототипа объекта.

<a id="ERR_REQUIRE_ESM"></a>

### `ERR_REQUIRE_ESM`

> Стабильность: 1 - экспериментальная

Была сделана попытка `require()` ан [Модуль ES](esm.md).

<a id="ERR_SCRIPT_EXECUTION_INTERRUPTED"></a>

### `ERR_SCRIPT_EXECUTION_INTERRUPTED`

Выполнение скрипта было прервано `SIGINT` (Например, <kbd>Ctrl</kbd>+<kbd>C</kbd> был нажат.)

<a id="ERR_SCRIPT_EXECUTION_TIMEOUT"></a>

### `ERR_SCRIPT_EXECUTION_TIMEOUT`

Истекло время выполнения сценария, возможно, из-за ошибок в выполняемом сценарии.

<a id="ERR_SERVER_ALREADY_LISTEN"></a>

### `ERR_SERVER_ALREADY_LISTEN`

В [`server.listen()`](net.md#serverlisten) метод был вызван в то время как `net.Server` уже слушал. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP / 2 `Server` экземпляры.

<a id="ERR_SERVER_NOT_RUNNING"></a>

### `ERR_SERVER_NOT_RUNNING`

В [`server.close()`](net.md#serverclosecallback) метод был вызван, когда `net.Server` не работал. Это относится ко всем экземплярам `net.Server`, включая HTTP, HTTPS и HTTP / 2 `Server` экземпляры.

<a id="ERR_SOCKET_ALREADY_BOUND"></a>

### `ERR_SOCKET_ALREADY_BOUND`

Была сделана попытка привязать уже связанный сокет.

<a id="ERR_SOCKET_BAD_BUFFER_SIZE"></a>

### `ERR_SOCKET_BAD_BUFFER_SIZE`

Был передан недопустимый (отрицательный) размер для `recvBufferSize` или `sendBufferSize` варианты в [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback).

<a id="ERR_SOCKET_BAD_PORT"></a>

### `ERR_SOCKET_BAD_PORT`

Функция API, ожидающая порта> = 0 и <65536, получила недопустимое значение.

<a id="ERR_SOCKET_BAD_TYPE"></a>

### `ERR_SOCKET_BAD_TYPE`

Функция API, ожидающая типа сокета (`udp4` или `udp6`) получил недопустимое значение.

<a id="ERR_SOCKET_BUFFER_SIZE"></a>

### `ERR_SOCKET_BUFFER_SIZE`

При использовании [`dgram.createSocket()`](dgram.md#dgramcreatesocketoptions-callback), размер получения или отправки `Buffer` не может быть определено.

<a id="ERR_SOCKET_CLOSED"></a>

### `ERR_SOCKET_CLOSED`

Была сделана попытка работать с уже закрытым сокетом.

<a id="ERR_SOCKET_DGRAM_IS_CONNECTED"></a>

### `ERR_SOCKET_DGRAM_IS_CONNECTED`

А [`dgram.connect()`](dgram.md#socketconnectport-address-callback) вызов был сделан на уже подключенном сокете.

<a id="ERR_SOCKET_DGRAM_NOT_CONNECTED"></a>

### `ERR_SOCKET_DGRAM_NOT_CONNECTED`

А [`dgram.disconnect()`](dgram.md#socketdisconnect) или [`dgram.remoteAddress()`](dgram.md#socketremoteaddress) звонок был сделан на отключенной розетке.

<a id="ERR_SOCKET_DGRAM_NOT_RUNNING"></a>

### `ERR_SOCKET_DGRAM_NOT_RUNNING`

Был сделан вызов, но подсистема UDP не работала.

<a id="ERR_SRI_PARSE"></a>

### `ERR_SRI_PARSE`

Строка была предоставлена для проверки целостности подресурса, но не может быть проанализирована. Проверьте формат атрибутов целостности, посмотрев на [Спецификация целостности подресурсов](https://www.w3.org/TR/SRI/#the-integrity-attribute).

<a id="ERR_STREAM_ALREADY_FINISHED"></a>

### `ERR_STREAM_ALREADY_FINISHED`

Был вызван метод потока, который не может быть завершен, поскольку поток был завершен.

<a id="ERR_STREAM_CANNOT_PIPE"></a>

### `ERR_STREAM_CANNOT_PIPE`

Была сделана попытка позвонить [`stream.pipe()`](stream.md#readablepipedestination-options) на [`Writable`](stream.md#class-streamwritable) транслировать.

<a id="ERR_STREAM_DESTROYED"></a>

### `ERR_STREAM_DESTROYED`

Был вызван метод потока, который не может быть завершен, поскольку поток был уничтожен с использованием `stream.destroy()`.

<a id="ERR_STREAM_NULL_VALUES"></a>

### `ERR_STREAM_NULL_VALUES`

Была сделана попытка позвонить [`stream.write()`](stream.md#writablewritechunk-encoding-callback) с `null` кусок.

<a id="ERR_STREAM_PREMATURE_CLOSE"></a>

### `ERR_STREAM_PREMATURE_CLOSE`

Ошибка, возвращенная `stream.finished()` а также `stream.pipeline()`, когда поток или конвейер завершаются некорректно, без явной ошибки.

<a id="ERR_STREAM_PUSH_AFTER_EOF"></a>

### `ERR_STREAM_PUSH_AFTER_EOF`

Была сделана попытка позвонить [`stream.push()`](stream.md#readablepushchunk-encoding) после `null`(EOF) был отправлен в поток.

<a id="ERR_STREAM_UNSHIFT_AFTER_END_EVENT"></a>

### `ERR_STREAM_UNSHIFT_AFTER_END_EVENT`

Была сделана попытка позвонить [`stream.unshift()`](stream.md#readableunshiftchunk-encoding) после `'end'` событие было отправлено.

<a id="ERR_STREAM_WRAP"></a>

### `ERR_STREAM_WRAP`

Предотвращает прерывание, если строковый декодер был установлен на Socket или если декодер находится в `objectMode`.

```js
const Socket = require('net').Socket;
const instance = new Socket();

instance.setEncoding('utf8');
```

<a id="ERR_STREAM_WRITE_AFTER_END"></a>

### `ERR_STREAM_WRITE_AFTER_END`

Была сделана попытка позвонить [`stream.write()`](stream.md#writablewritechunk-encoding-callback) после `stream.end()` был вызван.

<a id="ERR_STRING_TOO_LONG"></a>

### `ERR_STRING_TOO_LONG`

Была сделана попытка создать строку длиннее максимально допустимой.

<a id="ERR_SYNTHETIC"></a>

### `ERR_SYNTHETIC`

Искусственный объект ошибки, используемый для захвата стека вызовов для диагностических отчетов.

<a id="ERR_SYSTEM_ERROR"></a>

### `ERR_SYSTEM_ERROR`

В процессе Node.js произошла неопределенная или неспецифическая системная ошибка. Объект ошибки будет иметь `err.info` свойство объекта с дополнительной информацией.

<a id="ERR_TLS_CERT_ALTNAME_INVALID"></a>

### `ERR_TLS_CERT_ALTNAME_INVALID`

При использовании TLS имя хоста / IP-адрес однорангового узла не соответствует ни одному из `subjectAltNames` в его сертификате.

<a id="ERR_TLS_DH_PARAM_SIZE"></a>

### `ERR_TLS_DH_PARAM_SIZE`

При использовании TLS параметр, предлагаемый для алгоритма Диффи-Хеллмана (`DH`) протокол согласования ключей слишком мал. По умолчанию длина ключа должна быть больше или равна 1024 битам, чтобы избежать уязвимостей, хотя настоятельно рекомендуется использовать 2048 бит или больше для большей безопасности.

<a id="ERR_TLS_HANDSHAKE_TIMEOUT"></a>

### `ERR_TLS_HANDSHAKE_TIMEOUT`

Время ожидания подтверждения TLS / SSL истекло. В этом случае сервер также должен прервать соединение.

<a id="ERR_TLS_INVALID_CONTEXT"></a>

### `ERR_TLS_INVALID_CONTEXT`

<!-- YAML
added: v13.3.0
-->

Контекст должен быть `SecureContext`.

<a id="ERR_TLS_INVALID_PROTOCOL_METHOD"></a>

### `ERR_TLS_INVALID_PROTOCOL_METHOD`

Указанный `secureProtocol` метод недействителен. Он либо неизвестен, либо отключен, потому что небезопасен.

<a id="ERR_TLS_INVALID_PROTOCOL_VERSION"></a>

### `ERR_TLS_INVALID_PROTOCOL_VERSION`

Допустимые версии протокола TLS: `'TLSv1'`, `'TLSv1.1'`, или `'TLSv1.2'`.

<a id="ERR_TLS_INVALID_STATE"></a>

### `ERR_TLS_INVALID_STATE`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

Сокет TLS должен быть подключен и надежно установлен. Перед продолжением убедитесь, что «безопасное» событие запущено.

<a id="ERR_TLS_PROTOCOL_VERSION_CONFLICT"></a>

### `ERR_TLS_PROTOCOL_VERSION_CONFLICT`

Попытка установить протокол TLS `minVersion` или `maxVersion` конфликтует с попыткой установить `secureProtocol` явно. Используйте тот или иной механизм.

<a id="ERR_TLS_PSK_SET_IDENTIY_HINT_FAILED"></a>

### `ERR_TLS_PSK_SET_IDENTIY_HINT_FAILED`

Не удалось установить подсказку идентификатора PSK. Подсказка может быть слишком длинной.

<a id="ERR_TLS_RENEGOTIATION_DISABLED"></a>

### `ERR_TLS_RENEGOTIATION_DISABLED`

Была сделана попытка повторно согласовать TLS на экземпляре сокета с отключенным TLS.

<a id="ERR_TLS_REQUIRED_SERVER_NAME"></a>

### `ERR_TLS_REQUIRED_SERVER_NAME`

При использовании TLS `server.addContext()` был вызван без указания имени хоста в первом параметре.

<a id="ERR_TLS_SESSION_ATTACK"></a>

### `ERR_TLS_SESSION_ATTACK`

Обнаружено чрезмерное количество повторных согласований TLS, что является потенциальным вектором атак типа «отказ в обслуживании».

<a id="ERR_TLS_SNI_FROM_SERVER"></a>

### `ERR_TLS_SNI_FROM_SERVER`

Была предпринята попытка выдать указание имени сервера из сокета на стороне сервера TLS, который действителен только для клиента.

<a id="ERR_TRACE_EVENTS_CATEGORY_REQUIRED"></a>

### `ERR_TRACE_EVENTS_CATEGORY_REQUIRED`

В `trace_events.createTracing()` требуется по крайней мере одна категория событий трассировки.

<a id="ERR_TRACE_EVENTS_UNAVAILABLE"></a>

### `ERR_TRACE_EVENTS_UNAVAILABLE`

В `trace_events` модуль не может быть загружен, потому что Node.js был скомпилирован с `--without-v8-platform` флаг.

<a id="ERR_TRANSFORM_ALREADY_TRANSFORMING"></a>

### `ERR_TRANSFORM_ALREADY_TRANSFORMING`

А `Transform` поток завершился, пока он все еще преобразовывался.

<a id="ERR_TRANSFORM_WITH_LENGTH_0"></a>

### `ERR_TRANSFORM_WITH_LENGTH_0`

А `Transform` поток закончился с данными, все еще находящимися в буфере записи.

<a id="ERR_TTY_INIT_FAILED"></a>

### `ERR_TTY_INIT_FAILED`

Инициализация TTY не удалась из-за системной ошибки.

<a id="ERR_UNAVAILABLE_DURING_EXIT"></a>

### `ERR_UNAVAILABLE_DURING_EXIT`

Функция была вызвана в [`process.on('exit')`](process.md#event-exit) обработчик, который не должен вызываться внутри [`process.on('exit')`](process.md#event-exit) обработчик.

<a id="ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET"></a>

### `ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET`

[`process.setUncaughtExceptionCaptureCallback()`](process.md#processsetuncaughtexceptioncapturecallbackfn) был вызван дважды, без предварительного сброса обратного вызова на `null`.

Эта ошибка предназначена для предотвращения случайной перезаписи обратного вызова, зарегистрированного из другого модуля.

<a id="ERR_UNESCAPED_CHARACTERS"></a>

### `ERR_UNESCAPED_CHARACTERS`

Получена строка, содержащая неэкранированные символы.

<a id="ERR_UNHANDLED_ERROR"></a>

### `ERR_UNHANDLED_ERROR`

Произошла необработанная ошибка (например, когда `'error'` событие испускается [`EventEmitter`](events.md#class-eventemitter) но `'error'` обработчик не зарегистрирован).

<a id="ERR_UNKNOWN_BUILTIN_MODULE"></a>

### `ERR_UNKNOWN_BUILTIN_MODULE`

Используется для определения определенного вида внутренней ошибки Node.js, которая обычно не должна запускаться кодом пользователя. Экземпляры этой ошибки указывают на внутреннюю ошибку в самом двоичном файле Node.js.

<a id="ERR_UNKNOWN_CREDENTIAL"></a>

### `ERR_UNKNOWN_CREDENTIAL`

Был передан несуществующий идентификатор группы или пользователя Unix.

<a id="ERR_UNKNOWN_ENCODING"></a>

### `ERR_UNKNOWN_ENCODING`

В API передан неверный или неизвестный параметр кодировки.

<a id="ERR_UNKNOWN_FILE_EXTENSION"></a>

### `ERR_UNKNOWN_FILE_EXTENSION`

> Стабильность: 1 - экспериментальная

Была сделана попытка загрузить модуль с неизвестным или неподдерживаемым расширением файла.

<a id="ERR_UNKNOWN_MODULE_FORMAT"></a>

### `ERR_UNKNOWN_MODULE_FORMAT`

> Стабильность: 1 - экспериментальная

Была сделана попытка загрузить модуль с неизвестным или неподдерживаемым форматом.

<a id="ERR_UNKNOWN_SIGNAL"></a>

### `ERR_UNKNOWN_SIGNAL`

Неверный или неизвестный сигнал процесса был передан API, ожидающему действительного сигнала (например, [`subprocess.kill()`](child_process.md#subprocesskillsignal)).

<a id="ERR_UNSUPPORTED_DIR_IMPORT"></a>

### `ERR_UNSUPPORTED_DIR_IMPORT`

`import` URL-адрес каталога не поддерживается. Вместо, [Самостоятельная ссылка на пакет, используя его имя](packages.md#self-referencing-a-package-using-its-name) а также [определить настраиваемый подпуть](packages.md#subpath-exports) в [`"exports"`](packages.md#exports) поле [`package.json`](packages.md#nodejs-packagejson-field-definitions) файл.

<!-- eslint-skip -->

```js
import './'; // unsupported
import './index.js'; // supported
import 'package-name'; // supported
```

<a id="ERR_UNSUPPORTED_ESM_URL_SCHEME"></a>

### `ERR_UNSUPPORTED_ESM_URL_SCHEME`

`import` со схемами URL, отличными от `file` а также `data` не поддерживается.

<a id="ERR_VALID_PERFORMANCE_ENTRY_TYPE"></a>

### `ERR_VALID_PERFORMANCE_ENTRY_TYPE`

При использовании Performance Timing API (`perf_hooks`) допустимые типы записей производительности не найдены.

<a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING"></a>

### `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`

Обратный вызов динамического импорта не указан.

<a id="ERR_VM_MODULE_ALREADY_LINKED"></a>

### `ERR_VM_MODULE_ALREADY_LINKED`

Модуль, который пытались связать, не подходит для связывания по одной из следующих причин:

- Он уже был связан (`linkingStatus` является `'linked'`)
- Это связано (`linkingStatus` является `'linking'`)
- Не удалось установить связь для этого модуля (`linkingStatus` является `'errored'`)

<a id="ERR_VM_MODULE_CACHED_DATA_REJECTED"></a>

### `ERR_VM_MODULE_CACHED_DATA_REJECTED`

В `cachedData` Параметр, переданный конструктору модуля, недопустим.

<a id="ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA"></a>

### `ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA`

Кэшированные данные не могут быть созданы для модулей, которые уже были оценены.

<a id="ERR_VM_MODULE_DIFFERENT_CONTEXT"></a>

### `ERR_VM_MODULE_DIFFERENT_CONTEXT`

Модуль, возвращаемый функцией компоновщика, находится в другом контексте, чем родительский модуль. Связанные модули должны иметь общий контекст.

<a id="ERR_VM_MODULE_LINKING_ERRORED"></a>

### `ERR_VM_MODULE_LINKING_ERRORED`

Функция компоновщика вернула модуль, для которого не удалось выполнить связывание.

<a id="ERR_VM_MODULE_LINK_FAILURE"></a>

### `ERR_VM_MODULE_LINK_FAILURE`

Модуль не удалось связать из-за сбоя.

<a id="ERR_VM_MODULE_NOT_MODULE"></a>

### `ERR_VM_MODULE_NOT_MODULE`

Выполненное значение обещания связывания не является `vm.Module` объект.

<a id="ERR_VM_MODULE_STATUS"></a>

### `ERR_VM_MODULE_STATUS`

Текущий статус модуля не позволяет выполнить эту операцию. Конкретный смысл ошибки зависит от конкретной функции.

<a id="ERR_WASI_ALREADY_STARTED"></a>

### `ERR_WASI_ALREADY_STARTED`

Экземпляр WASI уже запущен.

<a id="ERR_WASI_NOT_STARTED"></a>

### `ERR_WASI_NOT_STARTED`

Экземпляр WASI не запущен.

<a id="ERR_WORKER_INIT_FAILED"></a>

### `ERR_WORKER_INIT_FAILED`

В `Worker` Ошибка инициализации.

<a id="ERR_WORKER_INVALID_EXEC_ARGV"></a>

### `ERR_WORKER_INVALID_EXEC_ARGV`

В `execArgv` вариант передан в `Worker` конструктор содержит недопустимые флаги.

<a id="ERR_WORKER_NOT_RUNNING"></a>

### `ERR_WORKER_NOT_RUNNING`

Операция завершилась неудачно, потому что `Worker` экземпляр в настоящее время не запущен.

<a id="ERR_WORKER_OUT_OF_MEMORY"></a>

### `ERR_WORKER_OUT_OF_MEMORY`

В `Worker` Экземпляр остановлен, поскольку достиг предела памяти.

<a id="ERR_WORKER_PATH"></a>

### `ERR_WORKER_PATH`

Путь для основного скрипта рабочего не является ни абсолютным, ни относительным путем, начинающимся с `./` или `../`.

<a id="ERR_WORKER_UNSERIALIZABLE_ERROR"></a>

### `ERR_WORKER_UNSERIALIZABLE_ERROR`

Все попытки сериализации неперехваченного исключения из рабочего потока завершились неудачно.

<a id="ERR_WORKER_UNSUPPORTED_OPERATION"></a>

### `ERR_WORKER_UNSUPPORTED_OPERATION`

Запрошенная функциональность не поддерживается в рабочих потоках.

<a id="ERR_ZLIB_INITIALIZATION_FAILED"></a>

### `ERR_ZLIB_INITIALIZATION_FAILED`

Создание [`zlib`](zlib.md) сбой объекта из-за неправильной конфигурации.

<a id="HPE_HEADER_OVERFLOW"></a>

### `HPE_HEADER_OVERFLOW`

<!-- YAML
changes:
  - version:
     - v11.4.0
     - v10.15.0
    commit: 186035243fad247e3955f
    pr-url: https://github.com/nodejs-private/node-private/pull/143
    description: Max header size in `http_parser` was set to 8 KB.
-->

Получено слишком много данных заголовка HTTP. Для защиты от злонамеренных или неправильно настроенных клиентов, если получено более 8 КБ данных HTTP-заголовка, анализ HTTP будет прерван без создания объекта запроса или ответа, и `Error` с этим кодом будет выпущен.

<a id="HPE_UNEXPECTED_CONTENT_LENGTH"></a>

### `HPE_UNEXPECTED_CONTENT_LENGTH`

Сервер отправляет как `Content-Length` заголовок и `Transfer-Encoding: chunked`.

`Transfer-Encoding: chunked` позволяет серверу поддерживать постоянное соединение HTTP для динамически генерируемого контента. В этом случае `Content-Length` Заголовок HTTP использовать нельзя.

Использовать `Content-Length` или `Transfer-Encoding: chunked`.

<a id="MODULE_NOT_FOUND"></a>

### `MODULE_NOT_FOUND`

<!-- YAML
changes:
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/25690
    description: Added `requireStack` property.
-->

Не удалось разрешить файл модуля при попытке [`require()`](modules.md#requireid) или `import` операция.

## Устаревшие коды ошибок Node.js

> Стабильность: 0 - Не рекомендуется. Эти коды ошибок либо несовместимы, либо были удалены.

<a id="ERR_CANNOT_TRANSFER_OBJECT"></a>

### `ERR_CANNOT_TRANSFER_OBJECT`

<!--
added: v10.5.0
removed: v12.5.0
-->

Значение, переданное в `postMessage()` содержит объект, который не поддерживается для передачи.

<a id="ERR_CRYPTO_HASH_DIGEST_NO_UTF16"></a>

### `ERR_CRYPTO_HASH_DIGEST_NO_UTF16`

<!-- YAML
added: v9.0.0
removed: v12.12.0
-->

Кодировка UTF-16 использовалась с [`hash.digest()`](crypto.md#hashdigestencoding). В то время как `hash.digest()` метод позволяет `encoding` аргумент, который должен быть передан, в результате чего метод возвращает строку, а не `Buffer`, кодировка UTF-16 (например, `ucs` или `utf16le`) не поддерживается.

<a id="ERR_HTTP2_FRAME_ERROR"></a>

### `ERR_HTTP2_FRAME_ERROR`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется при сбое отправки отдельного кадра в сеансе HTTP / 2.

<a id="ERR_HTTP2_HEADERS_OBJECT"></a>

### `ERR_HTTP2_HEADERS_OBJECT`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда ожидается объект заголовков HTTP / 2.

<a id="ERR_HTTP2_HEADER_REQUIRED"></a>

### `ERR_HTTP2_HEADER_REQUIRED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда в сообщении HTTP / 2 отсутствует требуемый заголовок.

<a id="ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND"></a>

### `ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Информационные заголовки HTTP / 2 должны отправляться только _прежний_ позвонить в `Http2Stream.prototype.respond()` метод.

<a id="ERR_HTTP2_STREAM_CLOSED"></a>

### `ERR_HTTP2_STREAM_CLOSED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда действие было выполнено над уже закрытым потоком HTTP / 2.

<a id="ERR_HTTP_INVALID_CHAR"></a>

### `ERR_HTTP_INVALID_CHAR`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда в сообщении статуса ответа HTTP (фраза причины) обнаружен недопустимый символ.

<a id="ERR_INDEX_OUT_OF_RANGE"></a>

### `ERR_INDEX_OUT_OF_RANGE`

<!-- YAML
  added: v10.0.0
  removed: v11.0.0
-->

Данный индекс был вне допустимого диапазона (например, отрицательные смещения).

<a id="ERR_INVALID_OPT_VALUE"></a>

### `ERR_INVALID_OPT_VALUE`

<!-- YAML
added: v8.0.0
removed: v15.0.0
-->

В объект опций было передано недопустимое или неожиданное значение.

<a id="ERR_INVALID_OPT_VALUE_ENCODING"></a>

### `ERR_INVALID_OPT_VALUE_ENCODING`

<!-- YAML
added: v9.0.0
removed: v15.0.0
-->

Передана неверная или неизвестная кодировка файла.

<a id="ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST"></a>

### `ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`

<!-- YAML
removed: v15.0.0
-->

Этот код ошибки был заменен на [`ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST`](#err_missing_transferable_in_transfer_list) в Node.js v15.0.0, потому что он больше не точен, поскольку теперь существуют и другие типы переносимых объектов.

<a id="ERR_NAPI_CONS_PROTOTYPE_OBJECT"></a>

### `ERR_NAPI_CONS_PROTOTYPE_OBJECT`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется `Node-API` когда `Constructor.prototype` не объект.

<a id="ERR_NO_LONGER_SUPPORTED"></a>

### `ERR_NO_LONGER_SUPPORTED`

API Node.js был вызван неподдерживаемым способом, например `Buffer.write(string, encoding, offset[, length])`.

<a id="ERR_OPERATION_FAILED"></a>

### `ERR_OPERATION_FAILED`

<!-- YAML
added: v15.0.0
-->

Не удалось выполнить операцию. Обычно это используется, чтобы сигнализировать об общем сбое асинхронной операции.

<a id="ERR_OUTOFMEMORY"></a>

### `ERR_OUTOFMEMORY`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Обычно используется для определения того, что операция вызвала нехватку памяти.

<a id="ERR_PARSE_HISTORY_DATA"></a>

### `ERR_PARSE_HISTORY_DATA`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

В `repl` модулю не удалось проанализировать данные из файла истории REPL.

<a id="ERR_SOCKET_CANNOT_SEND"></a>

### `ERR_SOCKET_CANNOT_SEND`

<!-- YAML
added: v9.0.0
removed: v14.0.0
-->

Данные не могут быть отправлены через сокет.

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

Была сделана попытка закрыть `process.stderr` транслировать. По замыслу Node.js не позволяет `stdout` или `stderr` потоки должны быть закрыты кодом пользователя.

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

Была сделана попытка закрыть `process.stdout` транслировать. По замыслу Node.js не позволяет `stdout` или `stderr` потоки должны быть закрыты кодом пользователя.

<a id="ERR_STREAM_READ_NOT_IMPLEMENTED"></a>

### `ERR_STREAM_READ_NOT_IMPLEMENTED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда делается попытка использовать читаемый поток, который не реализован [`readable._read()`](stream.md#readable_readsize).

<a id="ERR_TLS_RENEGOTIATION_FAILED"></a>

### `ERR_TLS_RENEGOTIATION_FAILED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда запрос на повторное согласование TLS завершился ошибкой неспецифическим образом.

<a id="ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER"></a>

### `ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER`

<!-- YAML
added: v10.5.0
removed: v14.0.0
-->

А `SharedArrayBuffer` чья память не управляется механизмом JavaScript или Node.js. во время сериализации. Такой `SharedArrayBuffer` не может быть сериализован.

Это может произойти только тогда, когда нативные аддоны создают `SharedArrayBuffer`s в "внешнем" режиме или поместите существующий `SharedArrayBuffer` во внешний режим.

<a id="ERR_UNKNOWN_STDIN_TYPE"></a>

### `ERR_UNKNOWN_STDIN_TYPE`

<!-- YAML
added: v8.0.0
removed: v11.7.0
-->

Была предпринята попытка запустить процесс Node.js с неизвестным `stdin` тип файла. Эта ошибка обычно указывает на ошибку в самом Node.js, хотя пользовательский код может вызвать ее.

<a id="ERR_UNKNOWN_STREAM_TYPE"></a>

### `ERR_UNKNOWN_STREAM_TYPE`

<!-- YAML
added: v8.0.0
removed: v11.7.0
-->

Была предпринята попытка запустить процесс Node.js с неизвестным `stdout` или `stderr` тип файла. Эта ошибка обычно указывает на ошибку в самом Node.js, хотя пользовательский код может вызвать ее.

<a id="ERR_V8BREAKITERATOR"></a>

### `ERR_V8BREAKITERATOR`

V8 `BreakIterator` API использовался, но не установлен полный набор данных ICU.

<a id="ERR_VALUE_OUT_OF_RANGE"></a>

### `ERR_VALUE_OUT_OF_RANGE`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда заданное значение выходит за пределы допустимого диапазона.

<a id="ERR_VM_MODULE_NOT_LINKED"></a>

### `ERR_VM_MODULE_NOT_LINKED`

Перед созданием экземпляра модуль должен быть успешно связан.

<a id="ERR_WORKER_UNSUPPORTED_EXTENSION"></a>

### `ERR_WORKER_UNSUPPORTED_EXTENSION`

<!-- YAML
added: v11.0.0
removed: v16.9.0
-->

Имя пути, используемое для основного сценария рабочего, имеет неизвестное расширение файла.

<a id="ERR_ZLIB_BINDING_CLOSED"></a>

### `ERR_ZLIB_BINDING_CLOSED`

<!-- YAML
added: v9.0.0
removed: v10.0.0
-->

Используется, когда делается попытка использовать `zlib` объект после того, как он уже был закрыт.

<a id="ERR_CPU_USAGE"></a>

### `ERR_CPU_USAGE`

<!-- YAML
removed: v15.0.0
-->

Родной звонок от `process.cpuUsage` не может быть обработано.
