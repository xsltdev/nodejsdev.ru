---
description: В fs модуль позволяет взаимодействовать с файловой системой способом, смоделированным на основе стандартных функций POSIX
---

# Файловая система

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!--name=fs-->

<!-- source_link=lib/fs.js -->

В `fs` модуль позволяет взаимодействовать с файловой системой способом, смоделированным на основе стандартных функций POSIX.

Чтобы использовать API на основе промисов:

```js
import * as fs from 'fs/promises';
```

```js
const fs = require('fs/promises');
```

Чтобы использовать API обратного вызова и синхронные вызовы:

```js
import * as fs from 'fs';
```

```js
const fs = require('fs');
```

Все операции файловой системы имеют синхронные формы, формы обратного вызова и формы на основе промисов и доступны с использованием синтаксиса CommonJS и модулей ES6 (ESM).

## Пример промиса

Операции на основе промисов возвращают промис, который выполняется после завершения асинхронной операции.

```js
import { unlink } from 'fs/promises';

try {
  await unlink('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (error) {
  console.error('there was an error:', error.message);
}
```

```js
const { unlink } = require('fs/promises');

(async function (path) {
  try {
    await unlink(path);
    console.log(`successfully deleted ${path}`);
  } catch (error) {
    console.error('there was an error:', error.message);
  }
})('/tmp/hello');
```

## Пример обратного вызова

Форма обратного вызова принимает функцию обратного вызова завершения в качестве последнего аргумента и вызывает операцию асинхронно. Аргументы, передаваемые обратному вызову завершения, зависят от метода, но первый аргумент всегда зарезервирован для исключения. Если операция завершена успешно, то первым аргументом будет `null` или `undefined`.

```js
import { unlink } from 'fs';

unlink('/tmp/hello', (err) => {
  if (err) throw err;
  console.log('successfully deleted /tmp/hello');
});
```

```js
const { unlink } = require('fs');

unlink('/tmp/hello', (err) => {
  if (err) throw err;
  console.log('successfully deleted /tmp/hello');
});
```

Основанные на обратном вызове версии `fs` API-интерфейсы модулей предпочтительнее, чем использование API-интерфейсов промисов, когда требуется максимальная производительность (как с точки зрения времени выполнения, так и с точки зрения выделения памяти).

## Синхронный пример

Синхронные API-интерфейсы блокируют цикл событий Node.js и дальнейшее выполнение JavaScript до завершения операции. Исключения генерируются немедленно, и их можно обрабатывать с помощью `try…catch`, или можно позволить всплывать.

```js
import { unlinkSync } from 'fs';

try {
  unlinkSync('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (err) {
  // handle the error
}
```

```js
const { unlinkSync } = require('fs');

try {
  unlinkSync('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (err) {
  // handle the error
}
```

## API промисов

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31553
    description: Exposed as `require('fs/promises')`.
  - version:
    - v11.14.0
    - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/26581
    description: This API is no longer experimental.
  - version: v10.1.0
    pr-url: https://github.com/nodejs/node/pull/20504
    description: The API is accessible via `require('fs').promises` only.
-->

В `fs/promises` API предоставляет методы асинхронной файловой системы, которые возвращают промисы.

API-интерфейсы промисов используют базовый пул потоков Node.js для выполнения операций файловой системы вне потока цикла событий. Эти операции не синхронизированы и не являются потокобезопасными. Необходимо соблюдать осторожность при выполнении нескольких одновременных изменений одного и того же файла, иначе может произойти повреждение данных.

### Класс: `FileHandle`

<!-- YAML
added: v10.0.0
-->

Объект {FileHandle} - это объект-оболочка для числового файлового дескриптора.

Экземпляры объекта {FileHandle} создаются `fsPromises.open()` метод.

Все объекты {FileHandle} являются объектами {EventEmitter}.

Если {FileHandle} не закрывается с помощью `filehandle.close()` , он попытается автоматически закрыть дескриптор файла и выдать предупреждение процесса, помогая предотвратить утечку памяти. Не полагайтесь на такое поведение, потому что оно может быть ненадежным и файл не может быть закрыт. Вместо этого всегда явно закрывайте {FileHandle}. Node.js может изменить это поведение в будущем.

#### Событие: `'close'`

<!-- YAML
added: v15.4.0
-->

В `'close'` Событие генерируется, когда {FileHandle} закрывается и больше не может использоваться.

#### `filehandle.appendFile(data[, options])`

<!-- YAML
added: v10.0.0
-->

- `data` {строка | буфер | TypedArray | DataView}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Псевдоним [`filehandle.writeFile()`](#filehandlewritefiledata-options).

При работе с файловыми дескрипторами режим не может быть изменен с того, на который он был установлен с помощью [`fsPromises.open()`](#fspromisesopenpath-flags-mode). Следовательно, это эквивалентно [`filehandle.writeFile()`](#filehandlewritefiledata-options).

#### `filehandle.chmod(mode)`

<!-- YAML
added: v10.0.0
-->

- `mode` {integer} битовая маска файлового режима.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Изменяет права доступа к файлу. См. Chmod (2).

#### `filehandle.chown(uid, gid)`

<!-- YAML
added: v10.0.0
-->

- `uid` {integer} Идентификатор пользователя нового владельца файла.
- `gid` {integer} Идентификатор группы новой группы файла.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Меняет владельца файла. Обертка для еды (2).

#### `filehandle.close()`

<!-- YAML
added: v10.0.0
-->

- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Закрывает дескриптор файла после ожидания завершения любой ожидающей операции над дескриптором.

```js
import { open } from 'fs/promises';

let filehandle;
try {
  filehandle = await open('thefile.txt', 'r');
} finally {
  await filehandle?.close();
}
```

#### `filehandle.createReadStream([options])`

<!-- YAML
added: REPLACEME
-->

- `options` {Объект}
  - `encoding` {нить} **Дефолт:** `null`
  - `autoClose` {логический} **Дефолт:** `true`
  - `emitClose` {логический} **Дефолт:** `true`
  - `start` {целое число}
  - `end` {целое число} **Дефолт:** `Infinity`
  - `highWaterMark` {целое число} **Дефолт:** `64 * 1024`
- Возвращает: {fs.ReadStream}

В отличие от 16 кб по умолчанию `highWaterMark` для {stream.Readable} поток, возвращаемый этим методом, имеет значение по умолчанию `highWaterMark` 64 кб.

`options` может включать `start` а также `end` values для чтения диапазона байтов из файла, а не всего файла. Оба `start` а также `end` являются включительными и начинают отсчет с 0, допустимые значения находятся в \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)] диапазон. Если `start` опущено или `undefined`, `filehandle.createReadStream()` читает последовательно с текущей позиции файла. В `encoding` может быть любым из одобренных {Buffer}.

Если `FileHandle` указывает на символьное устройство, которое поддерживает только блокирующее чтение (например, клавиатура или звуковая карта), операции чтения не завершаются, пока данные не станут доступными. Это может помешать завершению процесса и естественному закрытию потока.

По умолчанию поток выдаст сообщение `'close'` событие после его уничтожения. Установить `emitClose` возможность `false` чтобы изменить это поведение.

```js
import { open } from 'fs/promises';

const fd = await open('/dev/input/event0');
// Create a stream from some character device.
const stream = fd.createReadStream();
setTimeout(() => {
  stream.close(); // This may not close the stream.
  // Artificially marking end-of-stream, as if the underlying resource had
  // indicated end-of-file by itself, allows the stream to close.
  // This does not cancel pending read operations, and if there is such an
  // operation, the process may still not be able to exit successfully
  // until it finishes.
  stream.push(null);
  stream.read(0);
}, 100);
```

Если `autoClose` ложно, то дескриптор файла не закроется, даже если возникнет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора. Если `autoClose` установлено значение true (поведение по умолчанию), на `'error'` или `'end'` дескриптор файла будет закрыт автоматически.

Пример чтения последних 10 байтов файла длиной 100 байтов:

```js
import { open } from 'fs/promises';

const fd = await open('sample.txt');
fd.createReadStream({ start: 90, end: 99 });
```

#### `filehandle.createWriteStream([options])`

<!-- YAML
added: REPLACEME
-->

- `options` {Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `autoClose` {логический} **Дефолт:** `true`
  - `emitClose` {логический} **Дефолт:** `true`
  - `start` {целое число}
- Возвращает: {fs.WriteStream}

`options` может также включать `start` опция, позволяющая записывать данные в некоторой позиции после начала файла, допустимые значения находятся в \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)] диапазон. Для изменения файла вместо его замены может потребоваться `flags` `open` опция, которая должна быть установлена на `r+` а не по умолчанию `r`. В `encoding` может быть любым из одобренных {Buffer}.

Если `autoClose` установлено значение true (поведение по умолчанию) на `'error'` или `'finish'` дескриптор файла будет закрыт автоматически. Если `autoClose` ложно, то дескриптор файла не закроется, даже если возникнет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора.

По умолчанию поток выдаст сообщение `'close'` событие после его уничтожения. Установить `emitClose` возможность `false` чтобы изменить это поведение.

#### `filehandle.datasync()`

<!-- YAML
added: v10.0.0
-->

- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Принудительно переводит все операции ввода-вывода в очереди, связанные с файлом, в состояние завершения синхронизированного ввода-вывода операционной системы. За подробностями обращайтесь к документации POSIX fdatasync (2).

В отличие от `filehandle.sync` этот метод не сбрасывает измененные метаданные.

#### `filehandle.fd`

<!-- YAML
added: v10.0.0
-->

- {number} Числовой дескриптор файла, управляемый объектом {FileHandle}.

#### `filehandle.read(buffer, offset, length, position)`

<!-- YAML
added: v10.0.0
-->

- `buffer` {Buffer | TypedArray | DataView} Буфер, который будет заполнен прочитанными данными файла.
- `offset` {integer} Место в буфере, с которого начинается заполнение.
- `length` {integer} Число байтов для чтения.
- `position` {integer} Место, с которого следует начать чтение данных из файла. Если `null`, данные будут считаны из текущей позиции файла, и позиция будет обновлена. Если `position` является целым числом, текущая позиция файла останется неизменной.
- Возвращает: {Promise} Выполняется в случае успеха с объектом с двумя свойствами:
  - `bytesRead` {integer} Количество прочитанных байтов
  - `buffer` {Buffer | TypedArray | DataView} Ссылка на переданный `buffer` аргумент.

Читает данные из файла и сохраняет их в заданном буфере.

Если файл не изменяется одновременно, конец файла достигается, когда число прочитанных байтов равно нулю.

#### `filehandle.read([options])`

<!-- YAML
added:
 - v13.11.0
 - v12.17.0
-->

- `options` {Объект}
  - `buffer` {Buffer | TypedArray | DataView} Буфер, который будет заполнен прочитанными данными файла. **Дефолт:** `Buffer.alloc(16384)`
  - `offset` {integer} Место в буфере, с которого начинается заполнение. **Дефолт:** `0`
  - `length` {integer} Число байтов для чтения. **Дефолт:** `buffer.byteLength`
  - `position` {integer} Место, с которого следует начать чтение данных из файла. Если `null`, данные будут считаны из текущей позиции файла, и позиция будет обновлена. Если `position` является целым числом, текущая позиция файла останется неизменной. **Дефолт:**: `null`
- Возвращает: {Promise} Выполняется в случае успеха с объектом с двумя свойствами:
  - `bytesRead` {integer} Количество прочитанных байтов
  - `buffer` {Buffer | TypedArray | DataView} Ссылка на переданный `buffer` аргумент.

Читает данные из файла и сохраняет их в заданном буфере.

Если файл не изменяется одновременно, конец файла достигается, когда число прочитанных байтов равно нулю.

#### `filehandle.readableWebStream()`

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1 - экспериментальная

- Возвращает: {ReadableStream}

Возвращает `ReadableStream` который может использоваться для чтения данных файлов.

Будет выдана ошибка, если этот метод вызывается более одного раза или вызывается после `FileHandle` закрывается или закрывается.

```js
import { open } from 'node:fs/promises';

const file = await open('./some/file/to/read');

for await (const chunk of file.readableWebStream())
  console.log(chunk);

await file.close();
```

```js
const { open } = require('fs/promises');

(async () => {
  const file = await open('./some/file/to/read');

  for await (const chunk of file.readableWebStream())
    console.log(chunk);

  await file.close();
})();
```

В то время как `ReadableStream` прочитает файл до конца, он не закроет `FileHandle` автоматически. Код пользователя по-прежнему должен вызывать `fileHandle.close()` метод.

#### `filehandle.readFile(options)`

<!-- YAML
added: v10.0.0
-->

- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `null`
  - `signal` {AbortSignal} позволяет прервать выполнение файла чтения.
- Возвращает: {Promise} Выполняется при успешном чтении содержимого файла. Если кодировка не указана (используя `options.encoding`), данные возвращаются как объект {Buffer}. В противном случае данные будут строкой.

Асинхронно читает все содержимое файла.

Если `options` является строкой, тогда она определяет `encoding`.

{FileHandle} должен поддерживать чтение.

Если один или несколько `filehandle.read()` вызовы выполняются в дескрипторе файла, а затем `filehandle.readFile()` выполняется вызов, данные будут прочитаны с текущей позиции до конца файла. Он не всегда читается с начала файла.

#### `filehandle.readv(buffers[, position])`

<!-- YAML
added:
 - v13.13.0
 - v12.17.0
-->

- `buffers` {Буфер \[] | TypedArray \[] | DataView \[]}
- `position` {integer} Смещение от начала файла, из которого должны быть прочитаны данные. Если `position` это не `number`, данные будут считаны с текущей позиции.
- Возвращает: {Promise} В случае успеха выполняет объект, содержащий два свойства:
  - `bytesRead` {integer} количество прочитанных байтов
  - `buffers` {Buffer \[] | TypedArray \[] | DataView \[]}, содержащее ссылку на `buffers` Вход.

Чтение из файла и запись в массив {ArrayBufferView} s

#### `filehandle.stat([options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- Возвращает: {Promise} соответствует {fs.Stats} для файла.

#### `filehandle.sync()`

<!-- YAML
added: v10.0.0
-->

- Возврат: {Promise} выполняется `undefined` при успехе.

Запросите, чтобы все данные для дескриптора открытого файла были сброшены на запоминающее устройство. Конкретная реализация зависит от операционной системы и устройства. Обратитесь к документации POSIX fsync (2) для получения более подробной информации.

#### `filehandle.truncate(len)`

<!-- YAML
added: v10.0.0
-->

- `len` {целое число} **Дефолт:** `0`
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Обрезает файл.

Если файл был больше, чем `len` байтов, только первый `len` байты будут сохранены в файле.

В следующем примере сохраняются только первые четыре байта файла:

```js
import { open } from 'fs/promises';

let filehandle = null;
try {
  filehandle = await open('temp.txt', 'r+');
  await filehandle.truncate(4);
} finally {
  await filehandle?.close();
}
```

Если ранее файл был короче, чем `len` байтов, он расширяется, а расширенная часть заполняется нулевыми байтами (`'\0'`):

Если `len` отрицательно, тогда `0` будет использоваться.

#### `filehandle.utimes(atime, mtime)`

<!-- YAML
added: v10.0.0
-->

- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}
- Возврат: {Промис}

Измените временные метки файловой системы объекта, на который ссылается {FileHandle}, затем разрешает промис без аргументов в случае успеха.

#### `filehandle.write(buffer[, offset[, length[, position]]])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `buffer` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `buffer` parameter won't coerce unsupported input to
                 buffers anymore.
-->

- `buffer` {Buffer | TypedArray | DataView | строка | Объект}
- `offset` {integer} Начальная позиция изнутри `buffer` где начинаются данные для записи. **Дефолт:** `0`
- `length` {integer} Количество байтов от `buffer` написать. **Дефолт:** `buffer.byteLength`
- `position` {integer} Смещение от начала файла, в котором данные из `buffer` должно быть написано. Если `position` это не `number`, данные будут записаны в текущей позиции. См. Документацию POSIX pwrite (2) для получения более подробной информации.
- Возврат: {Промис}

Напишите `buffer` в файл.

Если `buffer` это простой объект, он должен иметь собственный (не унаследованный) `toString` свойство функции.

Промис разрешается с помощью объекта, содержащего два свойства:

- `bytesWritten` {integer} количество записанных байтов
- `buffer` {Buffer | TypedArray | DataView | string | Object} ссылка на `buffer` написано.

Небезопасно использовать `filehandle.write()` несколько раз в одном файле, не дожидаясь выполнения (или отклонения) промиса. Для этого сценария используйте [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

#### `filehandle.write(string[, position[, encoding]])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `string` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `string` parameter won't coerce unsupported input to
                 strings anymore.
-->

- `string` {строка | Объект}
- `position` {integer} Смещение от начала файла, в котором данные из `string` должно быть написано. Если `position` это не `number` данные будут записаны в текущей позиции. См. Документацию POSIX pwrite (2) для получения более подробной информации.
- `encoding` {строка} Ожидаемая кодировка строки. **Дефолт:** `'utf8'`
- Возврат: {Промис}

Напишите `string` в файл. Если `string` не строка или объект с собственным `toString` функция, промис отклоняется с ошибкой.

Промис разрешается с помощью объекта, содержащего два свойства:

- `bytesWritten` {integer} количество записанных байтов
- `buffer` {string | Object} ссылка на `string` написано.

Небезопасно использовать `filehandle.write()` несколько раз в одном файле, не дожидаясь выполнения (или отклонения) промиса. Для этого сценария используйте [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

#### `filehandle.writeFile(data, options)`

<!-- YAML
added: v10.0.0
changes:
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37490
    description: The `data` argument supports `AsyncIterable`, `Iterable` and `Stream`.
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `data` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
-->

- `data` {строка | Buffer | TypedArray | DataView | Object | AsyncIterable | Iterable | Stream}
- `options` {Объект | строка}
  - `encoding` {string | null} Ожидаемая кодировка символов, когда `data` это строка. **Дефолт:** `'utf8'`
- Возврат: {Промис}

Асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой, буфером, объектом {AsyncIterable} или {Iterable} или объектом с собственным `toString` свойство функции. Промис выполняется без аргументов в случае успеха.

Если `options` является строкой, тогда она определяет `encoding`.

{FileHandle} должен поддерживать запись.

Небезопасно использовать `filehandle.writeFile()` несколько раз в одном файле, не дожидаясь выполнения (или отклонения) промиса.

Если один или несколько `filehandle.write()` вызовы выполняются в дескрипторе файла, а затем `filehandle.writeFile()` выполняется вызов, данные будут записаны с текущей позиции до конца файла. Он не всегда записывает с начала файла.

#### `filehandle.writev(buffers[, position])`

<!-- YAML
added: v12.9.0
-->

- `buffers` {Буфер \[] | TypedArray \[] | DataView \[]}
- `position` {integer} Смещение от начала файла, в котором данные из `buffers` должно быть написано. Если `position` это не `number`, данные будут записаны в текущей позиции.
- Возврат: {Промис}

Запишите в файл массив {ArrayBufferView}.

Промис разрешается с помощью объекта, содержащего два свойства:

- `bytesWritten` {integer} количество записанных байтов
- `buffers` {Buffer \[] | TypedArray \[] | DataView \[]} ссылка на `buffers` Вход.

Звонить небезопасно `writev()` несколько раз в одном файле, не дожидаясь выполнения (или отклонения) промиса.

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

### `fsPromises.access(path[, mode])`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `mode` {целое число} **Дефолт:** `fs.constants.F_OK`
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Проверяет права пользователя для файла или каталога, указанного в `path`. В `mode` Аргумент - необязательное целое число, указывающее, какие проверки доступности необходимо выполнить. Проверять [Константы доступа к файлам](#file-access-constants) для возможных значений `mode`. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.W_OK | fs.constants.R_OK`).

Если проверка доступности прошла успешно, промис разрешается без значения. Если какая-либо из проверок доступности завершается неудачно, промис отклоняется с помощью объекта {Error}. В следующем примере проверяется, `/etc/passwd` может быть прочитан и записан текущим процессом.

```js
import { access } from 'fs/promises';
import { constants } from 'fs';

try {
  await access(
    '/etc/passwd',
    constants.R_OK | constants.W_OK
  );
  console.log('can access');
} catch {
  console.error('cannot access');
}
```

С использованием `fsPromises.access()` чтобы проверить доступность файла перед вызовом `fsPromises.open()` не рекомендуется. Это приводит к возникновению состояния гонки, поскольку другие процессы могут изменять состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать / читать / записывать файл напрямую и обрабатывать возникшую ошибку, если файл недоступен.

### `fsPromises.appendFile(path, data[, options])`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL | FileHandle} имя файла или {FileHandle}
- `data` {строка | буфер}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'a'`.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Асинхронно добавлять данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или {буфером}.

Если `options` является строкой, тогда она определяет `encoding`.

В `mode` опция влияет только на вновь созданный файл. Видеть [`fs.open()`](#fsopenpath-flags-mode-callback) Больше подробностей.

В `path` можно указать как {FileHandle}, который был открыт для добавления (с использованием `fsPromises.open()`).

### `fsPromises.chmod(path, mode)`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `mode` {строка | целое число}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Изменяет права доступа к файлу.

### `fsPromises.chown(path, uid, gid)`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `uid` {целое число}
- `gid` {целое число}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Меняет владельца файла.

### `fsPromises.copyFile(src, dest[, mode])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Changed 'flags' argument to 'mode' and imposed
                 stricter type validation.
-->

- `src` {string | Buffer | URL} имя исходного файла для копирования
- `dest` {string | Buffer | URL} имя файла назначения для операции копирования
- `mode` {integer} Необязательные модификаторы, определяющие поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`) **Дефолт:** `0`.
  - `fs.constants.COPYFILE_EXCL`: Операция копирования завершится неудачно, если `dest` уже существует.
  - `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать рефссылку для копирования при записи. Если платформа не поддерживает копирование при записи, то используется резервный механизм копирования.
  - `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать рефссылку для копирования при записи. Если платформа не поддерживает копирование при записи, операция завершится ошибкой.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Асинхронно копирует `src` к `dest`. По умолчанию, `dest` перезаписывается, если он уже существует.

Не дается никаких гарантий относительно атомарности операции копирования. Если ошибка возникает после того, как целевой файл был открыт для записи, будет предпринята попытка удалить место назначения.

```js
import { constants } from 'fs';
import { copyFile } from 'fs/promises';

try {
  await copyFile('source.txt', 'destination.txt');
  console.log('source.txt was copied to destination.txt');
} catch {
  console.log('The file could not be copied');
}

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
try {
  await copyFile(
    'source.txt',
    'destination.txt',
    constants.COPYFILE_EXCL
  );
  console.log('source.txt was copied to destination.txt');
} catch {
  console.log('The file could not be copied');
}
```

### `fsPromises.cp(src, dest[, options])`

<!-- YAML
added: v16.7.0
-->

> Стабильность: 1 - экспериментальная

- `src` {строка | URL} исходный путь для копирования.
- `dest` {string | URL} целевой путь для копирования.
- `options` {Объект}
  - `dereference` {boolean} разыменование символических ссылок. **Дефолт:** `false`.
  - `errorOnExist` {логическое} когда `force` является `false`, и место назначения существует, выдает ошибку. **Дефолт:** `false`.
  - `filter` {Функция} Функция для фильтрации скопированных файлов / каталогов. Возвращение `true` чтобы скопировать элемент, `false` игнорировать это. Также может вернуть `Promise` что решает `true` или `false` **Дефолт:** `undefined`.
  - `force` {boolean} перезаписать существующий файл или каталог. \_Операция копирования будет игнорировать ошибки, если вы установите значение false и адресат существует. Использовать `errorOnExist` возможность изменить это поведение. **Дефолт:** `true`.
  - `preserveTimestamps` {boolean} Когда `true` отметки времени от `src` будут сохранены. **Дефолт:** `false`.
  - `recursive` {boolean} рекурсивное копирование каталогов **Дефолт:** `false`
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Асинхронно копирует всю структуру каталогов из `src` к `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог глобусы не поддерживаются и поведение аналогично `cp dir1/ dir2/`.

### `fsPromises.lchmod(path, mode)`

<!-- YAML
deprecated: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `mode` {целое число}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Изменяет права доступа к символьной ссылке.

Этот метод реализован только в macOS.

### `fsPromises.lchown(path, uid, gid)`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/21498
    description: This API is no longer deprecated.
-->

- `path` {строка | Буфер | URL}
- `uid` {целое число}
- `gid` {целое число}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Меняет владельца символьной ссылки.

### `fsPromises.lutimes(path, atime, mtime)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

- `path` {строка | Буфер | URL}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Изменяет время доступа и модификации файла так же, как [`fsPromises.utimes()`](#fspromisesutimespath-atime-mtime), с той разницей, что если путь относится к символической ссылке, то ссылка не разыменовывается: вместо этого изменяются временные метки самой символической ссылки.

### `fsPromises.link(existingPath, newPath)`

<!-- YAML
added: v10.0.0
-->

- `existingPath` {строка | Буфер | URL}
- `newPath` {строка | Буфер | URL}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Создает новую ссылку из `existingPath` к `newPath`. См. Документацию POSIX link (2) для получения более подробной информации.

### `fsPromises.lstat(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- Возвращает: {Promise} соответствует объекту {fs.Stats} для данной символической ссылки. `path`.

Эквивалентно [`fsPromises.stat()`](#fspromisesstatpath-options) пока не `path` относится к символической ссылке, и в этом случае указывается сама ссылка, а не файл, на который она ссылается. Обратитесь к документу POSIX lstat (2) для получения более подробной информации.

### `fsPromises.mkdir(path[, options])`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `options` {Объект | целое число}
  - `recursive` {логический} **Дефолт:** `false`
  - `mode` {string | integer} Не поддерживается в Windows. **Дефолт:** `0o777`.
- Возврат: {Промис} В случае успеха выполняет с `undefined` если `recursive` является `false`, или первый путь к каталогу, созданный, если `recursive` является `true`.

Асинхронно создает каталог.

Необязательный `options` аргумент может быть целым числом, определяющим `mode` (разрешение и липкие биты) или объект с `mode` собственность и `recursive` свойство, указывающее, следует ли создавать родительские каталоги. Вызов `fsPromises.mkdir()` когда `path` каталог, который существует, приводит к отклонению только в том случае, если `recursive` ложно.

### `fsPromises.mkdtemp(prefix[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
      - v16.5.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39028
    description: The `prefix` parameter now accepts an empty string.
-->

- `prefix` {нить}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возвращает: {Promise} Заполняется строкой, содержащей путь файловой системы к вновь созданному временному каталогу.

Создает уникальный временный каталог. Уникальное имя каталога создается путем добавления шести случайных символов в конец предоставленного `prefix`. Из-за несоответствий платформы избегайте трейлинга `X` персонажи в `prefix`. Некоторые платформы, особенно BSD, могут возвращать более шести случайных символов и заменять завершающие символы. `X` персонажи в `prefix` со случайными символами.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее используемую кодировку символов.

```js
import { mkdtemp } from 'fs/promises';

try {
  await mkdtemp(path.join(os.tmpdir(), 'foo-'));
} catch (err) {
  console.error(err);
}
```

В `fsPromises.mkdtemp()` метод добавит шесть случайно выбранных символов непосредственно в `prefix` нить. Например, учитывая каталог `/tmp`, если намерение состоит в том, чтобы создать временный каталог _в_ `/tmp`, то `prefix` должен заканчиваться концевым разделителем пути, зависящим от платформы (`require('path').sep`).

### `fsPromises.open(path, flags[, mode])`

<!-- YAML
added: v10.0.0
changes:
  - version: v11.1.0
    pr-url: https://github.com/nodejs/node/pull/23767
    description: The `flags` argument is now optional and defaults to `'r'`.
-->

- `path` {строка | Буфер | URL}
- `flags` {string | number} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'r'`.
- `mode` {string | integer} Устанавливает режим файла (права доступа и липкие биты), если файл создается. **Дефолт:** `0o666` (читаемый и записываемый)
- Возвращает: {Promise} выполняется с объектом {FileHandle}.

Открывает {FileHandle}.

Обратитесь к документации POSIX open (2) для получения более подробной информации.

Некоторые персонажи (`< > : " / \ | ? *`) зарезервированы под Windows, как указано в документации [Именование файлов, путей и пространств имен](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file). В NTFS, если имя файла содержит двоеточие, Node.js откроет поток файловой системы, как описано в [эта страница MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams).

### `fsPromises.opendir(path[, options])`

<!-- YAML
added: v12.12.0
changes:
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30114
    description: The `bufferSize` option was introduced.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `bufferSize` {number} Количество записей каталога, которые сохраняются во внутренней буфере при чтении из каталога. Более высокие значения приводят к лучшей производительности, но большему использованию памяти. **Дефолт:** `32`
- Возвращает: {Promise} соответствует {fs.Dir}.

Асинхронно открыть каталог для итеративного сканирования. См. Документацию по POSIX opendir (3) для получения более подробной информации.

Создает {fs.Dir}, который содержит все дальнейшие функции для чтения и очистки каталога.

В `encoding` опция устанавливает кодировку для `path` при открытии каталога и последующих операциях чтения.

Пример использования асинхронной итерации:

```js
import { opendir } from 'fs/promises';

try {
  const dir = await opendir('./');
  for await (const dirent of dir) console.log(dirent.name);
} catch (err) {
  console.error(err);
}
```

При использовании асинхронного итератора объект {fs.Dir} будет автоматически закрыт после выхода из итератора.

### `fsPromises.readdir(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.11.0
    pr-url: https://github.com/nodejs/node/pull/22020
    description: New option `withFileTypes` was added.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `withFileTypes` {логический} **Дефолт:** `false`
- Возвращает: {Promise} Заполняет массив имен файлов в каталоге, исключая `'.'` а также `'..'`.

Читает содержимое каталога.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов для использования в именах файлов. Если `encoding` установлен на `'buffer'`, возвращенные имена файлов будут переданы как объекты {Buffer}.

Если `options.withFileTypes` установлен на `true`, разрешенный массив будет содержать объекты {fs.Dirent}.

```js
import { readdir } from 'fs/promises';

try {
  const files = await readdir(path);
  for (const file of files) console.log(file);
} catch (err) {
  console.error(err);
}
```

### `fsPromises.readFile(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v15.2.0
    - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/35911
    description: The options argument may include an AbortSignal to abort an
                 ongoing readFile request.
-->

- `path` {строка | Буфер | URL | FileHandle} имя файла или `FileHandle`
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `null`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'r'`.
  - `signal` {AbortSignal} позволяет прервать выполнение файла чтения.
- Возвращает: {Promise} соответствует содержимому файла.

Асинхронно читает все содержимое файла.

Если кодировка не указана (используя `options.encoding`), данные возвращаются как объект {Buffer}. В противном случае данные будут строкой.

Если `options` является строкой, то в ней указывается кодировка.

Когда `path` это каталог, поведение `fsPromises.readFile()` зависит от платформы. В macOS, Linux и Windows промис будет отклонено с ошибкой. Во FreeBSD будет возвращено представление содержимого каталога.

Можно прервать текущий `readFile` используя {AbortSignal}. Если запрос прерван, возвращенное промис отклоняется с `AbortError`:

```js
import { readFile } from 'fs/promises';

try {
  const controller = new AbortController();
  const { signal } = controller;
  const promise = readFile(fileName, { signal });

  // Abort the request before the promise settles.
  controller.abort();

  await promise;
} catch (err) {
  // When a request is aborted - err is an AbortError
  console.error(err);
}
```

Прерывание текущего запроса прерывает не отдельные запросы операционной системы, а внутреннюю буферизацию. `fs.readFile` выполняет.

Любой указанный {FileHandle} должен поддерживать чтение.

### `fsPromises.readlink(path[, options])`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возврат: {Promise} соответствует требованиям `linkString` при успехе.

Читает содержимое символической ссылки, на которую ссылается `path`. См. Дополнительную информацию в документации POSIX readlink (2). Промис разрешено `linkString` при успехе.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, которая будет использоваться для возвращаемого пути ссылки. Если `encoding` установлен на `'buffer'`, возвращенный путь ссылки будет передан как объект {Buffer}.

### `fsPromises.realpath(path[, options])`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возвращает: {Промис} Выполняется с разрешенным путем в случае успеха.

Определяет фактическое местонахождение `path` используя ту же семантику, что и `fs.realpath.native()` функция.

Поддерживаются только пути, которые можно преобразовать в строки UTF8.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для пути. Если `encoding` установлен на `'buffer'`, возвращенный путь будет передан как объект {Buffer}.

В Linux, когда Node.js связан с musl libc, файловая система procfs должна быть смонтирована на `/proc` чтобы эта функция работала. Glibc не имеет этого ограничения.

### `fsPromises.rename(oldPath, newPath)`

<!-- YAML
added: v10.0.0
-->

- `oldPath` {строка | Буфер | URL}
- `newPath` {строка | Буфер | URL}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Переименовать `oldPath` к `newPath`.

### `fsPromises.rmdir(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37216
    description: "Using `fsPromises.rmdir(path, { recursive: true })` on a `path`
                 that is a file is no longer permitted and results in an
                 `ENOENT` error on Windows and an `ENOTDIR` error on POSIX."
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37216
    description: "Using `fsPromises.rmdir(path, { recursive: true })` on a `path`
                 that does not exist is no longer permitted and results in a
                 `ENOENT` error."
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37302
    description: The `recursive` option is deprecated, using it triggers a
                 deprecation warning.
  - version: v14.14.0
    pr-url: https://github.com/nodejs/node/pull/35579
    description: The `recursive` option is deprecated, use `fsPromises.rm` instead.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30644
    description: The `maxBusyTries` option is renamed to `maxRetries`, and its
                 default is 0. The `emfileWait` option has been removed, and
                 `EMFILE` errors use the same retry logic as other errors. The
                 `retryDelay` option is now supported. `ENFILE` errors are now
                 retried.
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/29168
    description: The `recursive`, `maxBusyTries`, and `emfileWait` options are
                  now supported.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `maxRetries` {integer} Если `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, или `EPERM` обнаружена ошибка, Node.js повторяет операцию с линейным ожиданием отсрочки `retryDelay` на миллисекунды дольше с каждой попыткой. Этот параметр представляет количество повторных попыток. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `0`.
  - `recursive` {boolean} Если `true`, выполните рекурсивное удаление каталога. В рекурсивном режиме операции повторяются в случае сбоя. **Дефолт:** `false`. **Устарело.**
  - `retryDelay` {integer} Время ожидания между повторными попытками в миллисекундах. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `100`.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Удаляет каталог, обозначенный `path`.

С использованием `fsPromises.rmdir()` в файле (а не в каталоге) приводит к тому, что промис отклоняется с `ENOENT` ошибка в Windows и `ENOTDIR` ошибка в POSIX.

Чтобы получить поведение, подобное `rm -rf` Команда Unix, используйте [`fsPromises.rm()`](#fspromisesrmpath-options) с опциями `{ recursive: true, force: true }`.

### `fsPromises.rm(path[, options])`

<!-- YAML
added: v14.14.0
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `force` {boolean} Когда `true`, исключения будут игнорироваться, если `path` не существует. **Дефолт:** `false`.
  - `maxRetries` {integer} Если `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, или `EPERM` обнаружена ошибка, Node.js повторит операцию с линейным ожиданием отсрочки `retryDelay` на миллисекунды дольше с каждой попыткой. Этот параметр представляет количество повторных попыток. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `0`.
  - `recursive` {boolean} Если `true`, выполните рекурсивное удаление каталога. В рекурсивном режиме операции повторяются в случае сбоя. **Дефолт:** `false`.
  - `retryDelay` {integer} Время ожидания между повторными попытками в миллисекундах. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `100`.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Удаляет файлы и каталоги (по образцу стандарта POSIX `rm` утилита).

### `fsPromises.stat(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- Возвращает: {Promise} соответствует объекту {fs.Stats} для данного `path`.

### `fsPromises.symlink(target, path[, type])`

<!-- YAML
added: v10.0.0
-->

- `target` {строка | Буфер | URL}
- `path` {строка | Буфер | URL}
- `type` {нить} **Дефолт:** `'file'`
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Создает символическую ссылку.

В `type` аргумент используется только на платформах Windows и может быть одним из `'dir'`, `'file'`, или `'junction'`. Точки соединения Windows требуют, чтобы конечный путь был абсолютным. Когда используешь `'junction'`, то `target` Аргумент будет автоматически нормализован до абсолютного пути.

### `fsPromises.truncate(path[, len])`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `len` {целое число} **Дефолт:** `0`
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Обрезает (укорачивает или увеличивает длину) содержимого на `path` к `len` байтов.

### `fsPromises.unlink(path)`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Если `path` ссылается на символическую ссылку, то ссылка удаляется, не затрагивая файл или каталог, на который она ссылается. Если `path` относится к пути к файлу, который не является символической ссылкой, файл удаляется. См. Документацию POSIX unlink (2) для получения более подробной информации.

### `fsPromises.utimes(path, atime, mtime)`

<!-- YAML
added: v10.0.0
-->

- `path` {строка | Буфер | URL}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Измените временные метки файловой системы объекта, на который ссылается `path`.

В `atime` а также `mtime` аргументы следуют этим правилам:

- Значения могут быть либо числами, представляющими эпоху Unix, либо `Date`s или числовая строка, например `'123456789.0'`.
- Если значение не может быть преобразовано в число, или `NaN`, `Infinity` или `-Infinity`, `Error` будет брошен.

### `fsPromises.watch(filename[, options])`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

- `filename` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `persistent` {boolean} Указывает, должен ли процесс продолжать работу, пока отслеживаются файлы. **Дефолт:** `true`.
  - `recursive` {boolean} Указывает, следует ли отслеживать все подкаталоги или только текущий каталог. Это применимо, когда указан каталог, и только на поддерживаемых платформах (см. [предостережения](#caveats)). **Дефолт:** `false`.
  - `encoding` {строка} Определяет кодировку символов, которая будет использоваться для имени файла, передаваемого слушателю. **Дефолт:** `'utf8'`.
  - `signal` {AbortSignal} {AbortSignal}, используемый для сигнализации, когда наблюдатель должен остановиться.
- Возвращает: {AsyncIterator} объектов со свойствами:
  - `eventType` {строка} Тип изменения
  - `filename` {string | Buffer} Имя файла изменено.

Возвращает асинхронный итератор, отслеживающий изменения на `filename`, куда `filename` является либо файлом, либо каталогом.

```js
const { watch } = require('fs/promises');

const ac = new AbortController();
const { signal } = ac;
setTimeout(() => ac.abort(), 10000);

(async () => {
  try {
    const watcher = watch(__filename, { signal });
    for await (const event of watcher) console.log(event);
  } catch (err) {
    if (err.name === 'AbortError') return;
    throw err;
  }
})();
```

На большинстве платформ `'rename'` генерируется всякий раз, когда имя файла появляется или исчезает в каталоге.

Все [предостережения](#caveats) для `fs.watch()` также относятся к `fsPromises.watch()`.

### `fsPromises.writeFile(file, data[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37490
    description: The `data` argument supports `AsyncIterable`, `Iterable` and `Stream`.
  - version:
      - v15.2.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/35993
    description: The options argument may include an AbortSignal to abort an
                 ongoing writeFile request.
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `data` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
-->

- `file` {строка | Буфер | URL | FileHandle} имя файла или `FileHandle`
- `data` {строка | Buffer | TypedArray | DataView | Object | AsyncIterable | Iterable | Stream}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'w'`.
  - `signal` {AbortSignal} позволяет прервать выполнение файла записи.
- Возврат: {Promise} соответствует требованиям `undefined` при успехе.

Асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой, {Buffer} или объектом с собственным (не унаследованным) `toString` свойство функции.

В `encoding` опция игнорируется, если `data` это буфер.

Если `options` является строкой, то в ней указывается кодировка.

В `mode` опция влияет только на вновь созданный файл. Видеть [`fs.open()`](#fsopenpath-flags-mode-callback) Больше подробностей.

Любой указанный {FileHandle} должен поддерживать запись.

Небезопасно использовать `fsPromises.writeFile()` несколько раз в одном файле, не дожидаясь выполнения промиса.

Аналогично `fsPromises.readFile` - `fsPromises.writeFile` это удобный метод, который выполняет несколько `write` вызывает внутренние вызовы для записи переданного ему буфера. Для кода, чувствительного к производительности, рассмотрите возможность использования [`fs.createWriteStream()`](#fscreatewritestreampath-options).

Можно использовать {AbortSignal} для отмены `fsPromises.writeFile()`. Отмена - это «лучший способ», и, вероятно, еще предстоит записать некоторый объем данных.

```js
import { writeFile } from 'fs/promises';
import { Buffer } from 'buffer';

try {
  const controller = new AbortController();
  const { signal } = controller;
  const data = new Uint8Array(Buffer.from('Hello Node.js'));
  const promise = writeFile('message.txt', data, {
    signal,
  });

  // Abort the request before the promise settles.
  controller.abort();

  await promise;
} catch (err) {
  // When a request is aborted - err is an AbortError
  console.error(err);
}
```

Прерывание текущего запроса прерывает не отдельные запросы операционной системы, а внутреннюю буферизацию. `fs.writeFile` выполняет.

## Обратный вызов API

API обратного вызова выполняют все операции асинхронно, не блокируя цикл событий, а затем вызывают функцию обратного вызова после завершения или ошибки.

API обратного вызова используют базовый пул потоков Node.js для выполнения операций файловой системы вне потока цикла событий. Эти операции не синхронизированы и не являются потокобезопасными. Необходимо соблюдать осторожность при выполнении нескольких одновременных изменений одного и того же файла, иначе может произойти повреждение данных.

### `fs.access(path[, mode], callback)`

<!-- YAML
added: v0.11.15
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/6534
    description: The constants like `fs.R_OK`, etc which were present directly
                 on `fs` were moved into `fs.constants` as a soft deprecation.
                 Thus for Node.js `< v6.3.0` use `fs`
                 to access those constants, or
                 do something like `(fs.constants || fs).R_OK` to work with all
                 versions.
-->

- `path` {строка | Буфер | URL}
- `mode` {целое число} **Дефолт:** `fs.constants.F_OK`
- `callback` {Функция}
  - `err` {Ошибка}

Проверяет права пользователя для файла или каталога, указанного в `path`. В `mode` Аргумент - необязательное целое число, указывающее, какие проверки доступности необходимо выполнить. Проверять [Константы доступа к файлам](#file-access-constants) для возможных значений `mode`. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.W_OK | fs.constants.R_OK`).

Последний аргумент, `callback`, это функция обратного вызова, которая вызывается с аргументом возможной ошибки. Если какая-либо из проверок доступности завершится неудачно, аргумент ошибки будет `Error` объект. Следующие примеры проверяют, `package.json` существует, и если он доступен для чтения или записи.

```js
import { access, constants } from 'fs';

const file = 'package.json';

// Check if the file exists in the current directory.
access(file, constants.F_OK, (err) => {
  console.log(
    `${file} ${err ? 'does not exist' : 'exists'}`
  );
});

// Check if the file is readable.
access(file, constants.R_OK, (err) => {
  console.log(
    `${file} ${err ? 'is not readable' : 'is readable'}`
  );
});

// Check if the file is writable.
access(file, constants.W_OK, (err) => {
  console.log(
    `${file} ${err ? 'is not writable' : 'is writable'}`
  );
});

// Check if the file exists in the current directory, and if it is writable.
access(file, constants.F_OK | constants.W_OK, (err) => {
  if (err) {
    console.error(
      `${file} ${
        err.code === 'ENOENT'
          ? 'does not exist'
          : 'is read-only'
      }`
    );
  } else {
    console.log(`${file} exists, and it is writable`);
  }
});
```

Не используйте `fs.access()` чтобы проверить доступность файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()`. Это приводит к возникновению состояния гонки, поскольку другие процессы могут изменять состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать / читать / записывать файл напрямую и обрабатывать возникшую ошибку, если файл недоступен.

**написать (НЕ РЕКОМЕНДУЕТСЯ)**

```js
import { access, open, close } from 'fs';

access('myfile', (err) => {
  if (!err) {
    console.error('myfile already exists');
    return;
  }

  open('myfile', 'wx', (err, fd) => {
    if (err) throw err;

    try {
      writeMyData(fd);
    } finally {
      close(fd, (err) => {
        if (err) throw err;
      });
    }
  });
});
```

**написать (РЕКОМЕНДУЕТСЯ)**

```js
import { open, close } from 'fs';

open('myfile', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('myfile already exists');
      return;
    }

    throw err;
  }

  try {
    writeMyData(fd);
  } finally {
    close(fd, (err) => {
      if (err) throw err;
    });
  }
});
```

**читать (НЕ РЕКОМЕНДУЕТСЯ)**

```js
import { access, open, close } from 'fs';
access('myfile', (err) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('myfile does not exist');
      return;
    }

    throw err;
  }

  open('myfile', 'r', (err, fd) => {
    if (err) throw err;

    try {
      readMyData(fd);
    } finally {
      close(fd, (err) => {
        if (err) throw err;
      });
    }
  });
});
```

**читать (РЕКОМЕНДУЕТСЯ)**

```js
import { open, close } from 'fs';

open('myfile', 'r', (err, fd) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('myfile does not exist');
      return;
    }

    throw err;
  }

  try {
    readMyData(fd);
  } finally {
    close(fd, (err) => {
      if (err) throw err;
    });
  }
});
```

В приведенных выше «не рекомендуемых» примерах проверяется доступность и затем используется файл; «Рекомендуемые» примеры лучше, потому что они используют файл напрямую и обрабатывают ошибку, если таковая имеется.

В общем, проверяйте доступность файла только в том случае, если файл не будет использоваться напрямую, например, когда его доступность является сигналом от другого процесса.

В Windows политики управления доступом (ACL) к каталогу могут ограничивать доступ к файлу или каталогу. В `fs.access()` функция, однако, не проверяет ACL и, следовательно, может сообщить, что путь доступен, даже если ACL запрещает пользователю читать или писать в него.

### `fs.appendFile(path, data[, options], callback)`

<!-- YAML
added: v0.6.7
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7831
    description: The passed `options` object will never be modified.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `file` parameter can be a file descriptor now.
-->

- `path` {строка | Буфер | URL | номер} имя файла или дескриптор файла
- `data` {строка | буфер}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'a'`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно добавлять данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или {буфером}.

В `mode` опция влияет только на вновь созданный файл. Видеть [`fs.open()`](#fsopenpath-flags-mode-callback) Больше подробностей.

```js
import { appendFile } from 'fs';

appendFile('message.txt', 'data to append', (err) => {
  if (err) throw err;
  console.log('The "data to append" was appended to file!');
});
```

Если `options` является строкой, то в ней указывается кодировка:

```js
import { appendFile } from 'fs';

appendFile(
  'message.txt',
  'data to append',
  'utf8',
  callback
);
```

В `path` может быть указан как числовой дескриптор файла, который был открыт для добавления (используя `fs.open()` или `fs.openSync()`). Дескриптор файла не будет закрыт автоматически.

```js
import { open, close, appendFile } from 'fs';

function closeFd(fd) {
  close(fd, (err) => {
    if (err) throw err;
  });
}

open('message.txt', 'a', (err, fd) => {
  if (err) throw err;

  try {
    appendFile(fd, 'data to append', 'utf8', (err) => {
      closeFd(fd);
      if (err) throw err;
    });
  } catch (err) {
    closeFd(fd);
    throw err;
  }
});
```

### `fs.chmod(path, mode, callback)`

<!-- YAML
added: v0.1.30
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `mode` {строка | целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно изменяет права доступа к файлу. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Документацию POSIX chmod (2) для получения более подробной информации.

```js
import { chmod } from 'fs';

chmod('my_file.txt', 0o775, (err) => {
  if (err) throw err;
  console.log(
    'The permissions for file "my_file.txt" have been changed!'
  );
});
```

#### Файловые режимы

В `mode` аргумент, используемый как в `fs.chmod()` а также `fs.chmodSync()` Методы - это числовая битовая маска, созданная с помощью логического ИЛИ следующих констант:

| Постоянный | Восьмеричный | Описание | | ---------------------- | ------- | ------------------------ | | `fs.constants.S_IRUSR` | `0o400` | прочитано владельцем | | `fs.constants.S_IWUSR` | `0o200` | написать владельцем | | `fs.constants.S_IXUSR` | `0o100` | оформить / поиск по собственнику | | `fs.constants.S_IRGRP` | `0o40` | прочитано группой | | `fs.constants.S_IWGRP` | `0o20` | написать по группе | | `fs.constants.S_IXGRP` | `0o10` | выполнить / поиск по группе | | `fs.constants.S_IROTH` | `0o4` | читают другие | | `fs.constants.S_IWOTH` | `0o2` | написать другие | | `fs.constants.S_IXOTH` | `0o1` | выполнить / поиск другими |

Более простой способ построения `mode` - использовать последовательность из трех восьмеричных цифр (например, `765`). Самая левая цифра (`7` в примере), указывает разрешения для владельца файла. Средняя цифра (`6` в примере) указывает разрешения для группы. Самая правая цифра (`5` в примере) указывает разрешения для других.

| Номер | Описание | | ------ | ------------------------ | | `7` | читать, писать и выполнять | | `6` | читать и писать | | `5` | прочитать и выполнить | | `4` | только чтение | | `3` | написать и выполнить | | `2` | только писать | | `1` | только выполнить | | `0` | нет разрешения |

Например, восьмеричное значение `0o765` средства:

- Владелец может читать, писать и выполнять файл.
- Группа может читать и записывать файл.
- Другие могут читать и выполнять файл.

При использовании необработанных чисел там, где ожидаются режимы файлов, любое значение больше, чем `0o777` может привести к тому, что поведение, зависящее от платформы, не поддерживается для постоянной работы. Поэтому такие константы, как `S_ISVTX`, `S_ISGID` или `S_ISUID` не выставлены в `fs.constants`.

Предостережения: в Windows можно изменить только разрешение на запись, а различие между разрешениями группы, владельца или других не реализовано.

### `fs.chown(path, uid, gid, callback)`

<!-- YAML
added: v0.1.97
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `uid` {целое число}
- `gid` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно меняет владельца и группу файла. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Документацию POSIX chown (2) для получения более подробной информации.

### `fs.close(fd[, callback])`

<!-- YAML
added: v0.0.2
changes:
  - version:
      - v15.9.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37174
    description: A default callback is now used if one is not provided.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Закрывает файловый дескриптор. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

Вызов `fs.close()` на любом дескрипторе файла (`fd`), который в настоящее время используется другими `fs` операция может привести к неопределенному поведению.

См. Документацию POSIX close (2) для получения более подробной информации.

### `fs.copyFile(src, dest[, mode], callback)`

<!-- YAML
added: v8.5.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Changed 'flags' argument to 'mode' and imposed
                 stricter type validation.
-->

- `src` {string | Buffer | URL} имя исходного файла для копирования
- `dest` {string | Buffer | URL} имя файла назначения для операции копирования
- `mode` Модификаторы {integer} для операции копирования. **Дефолт:** `0`.
- `callback` {Функция}

Асинхронно копирует `src` к `dest`. По умолчанию, `dest` перезаписывается, если он уже существует. Функции обратного вызова не передаются никакие аргументы, кроме возможного исключения. Node.js не дает никаких гарантий относительно атомарности операции копирования. Если ошибка возникает после того, как целевой файл был открыт для записи, Node.js попытается удалить место назначения.

`mode` - необязательное целое число, определяющее поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

- `fs.constants.COPYFILE_EXCL`: Операция копирования завершится неудачно, если `dest` уже существует.
- `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать рефссылку для копирования при записи. Если платформа не поддерживает копирование при записи, то используется резервный механизм копирования.
- `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать рефссылку для копирования при записи. Если платформа не поддерживает копирование при записи, операция завершится ошибкой.

```js
import { copyFile, constants } from 'fs';

function callback(err) {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
}

// destination.txt will be created or overwritten by default.
copyFile('source.txt', 'destination.txt', callback);

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
copyFile(
  'source.txt',
  'destination.txt',
  constants.COPYFILE_EXCL,
  callback
);
```

### `fs.cp(src, dest[, options], callback)`

<!-- YAML
added: v16.7.0
-->

> Стабильность: 1 - экспериментальная

- `src` {строка | URL} исходный путь для копирования.
- `dest` {string | URL} целевой путь для копирования.
- `options` {Объект}
  - `dereference` {boolean} разыменование символических ссылок. **Дефолт:** `false`.
  - `errorOnExist` {логическое} когда `force` является `false`, и место назначения существует, выдает ошибку. **Дефолт:** `false`.
  - `filter` {Функция} Функция для фильтрации скопированных файлов / каталогов. Возвращение `true` чтобы скопировать элемент, `false` игнорировать это. Также может вернуть `Promise` что решает `true` или `false` **Дефолт:** `undefined`.
  - `force` {boolean} перезаписать существующий файл или каталог. \_Операция копирования будет игнорировать ошибки, если вы установите значение false и адресат существует. Использовать `errorOnExist` возможность изменить это поведение. **Дефолт:** `true`.
  - `preserveTimestamps` {boolean} Когда `true` отметки времени от `src` будут сохранены. **Дефолт:** `false`.
  - `recursive` {boolean} рекурсивное копирование каталогов **Дефолт:** `false`
- `callback` {Функция}

Асинхронно копирует всю структуру каталогов из `src` к `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог глобусы не поддерживаются и поведение аналогично `cp dir1/ dir2/`.

### `fs.createReadStream(path[, options])`

<!-- YAML
added: v0.1.31
changes:
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/40013
    description: The `fs` option does not need `open` method if an `fd` was provided.
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/40013
    description: The `fs` option does not need `close` method if `autoClose` is `false`.
  - version:
     - v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35922
    description: The `fd` option accepts FileHandle arguments.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31408
    description: Change `emitClose` default to `true`.
  - version:
     - v13.6.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/29083
    description: The `fs` options allow overriding the used `fs`
                 implementation.
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/29212
    description: Enable `emitClose` option.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/19898
    description: Impose new restrictions on `start` and `end`, throwing
                 more appropriate errors in cases when we cannot reasonably
                 handle the input values.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7831
    description: The passed `options` object will never be modified.
  - version: v2.3.0
    pr-url: https://github.com/nodejs/node/pull/1845
    description: The passed `options` object can be a string now.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `flags` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'r'`.
  - `encoding` {нить} **Дефолт:** `null`
  - `fd` {integer | FileHandle} **Дефолт:** `null`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `autoClose` {логический} **Дефолт:** `true`
  - `emitClose` {логический} **Дефолт:** `true`
  - `start` {целое число}
  - `end` {целое число} **Дефолт:** `Infinity`
  - `highWaterMark` {целое число} **Дефолт:** `64 * 1024`
  - `fs` {Object | null} **Дефолт:** `null`
- Возвращает: {fs.ReadStream}

В отличие от 16 кб по умолчанию `highWaterMark` для {stream.Readable} поток, возвращаемый этим методом, имеет значение по умолчанию `highWaterMark` 64 кб.

`options` может включать `start` а также `end` values для чтения диапазона байтов из файла, а не всего файла. Оба `start` а также `end` являются включительными и начинают отсчет с 0, допустимые значения находятся в \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)] диапазон. Если `fd` указано и `start` опущено или `undefined`, `fs.createReadStream()` читает последовательно с текущей позиции файла. В `encoding` может быть любым из одобренных {Buffer}.

Если `fd` указано, `ReadStream` проигнорирует `path` аргумент и будет использовать указанный файловый дескриптор. Это означает, что нет `'open'` событие будет выпущено. `fd` должен быть блокирующий; неблокирующий `fd`s следует передать в {net.Socket}.

Если `fd` указывает на символьное устройство, которое поддерживает только блокирующее чтение (например, клавиатура или звуковая карта), операции чтения не завершаются, пока данные не станут доступными. Это может помешать завершению процесса и естественному закрытию потока.

По умолчанию поток выдаст сообщение `'close'` событие после его уничтожения. Установить `emitClose` возможность `false` чтобы изменить это поведение.

Предоставляя `fs` вариант, можно отменить соответствующий `fs` реализации для `open`, `read`, а также `close`. При предоставлении `fs` вариант, переопределение для `read` требуется для. Если нет `fd` предоставляется, переопределение для `open` также требуется. Если `autoClose` является `true`, переопределение для `close` также требуется.

```js
import { createReadStream } from 'fs';

// Create a stream from some character device.
const stream = createReadStream('/dev/input/event0');
setTimeout(() => {
  stream.close(); // This may not close the stream.
  // Artificially marking end-of-stream, as if the underlying resource had
  // indicated end-of-file by itself, allows the stream to close.
  // This does not cancel pending read operations, and if there is such an
  // operation, the process may still not be able to exit successfully
  // until it finishes.
  stream.push(null);
  stream.read(0);
}, 100);
```

Если `autoClose` ложно, то дескриптор файла не закроется, даже если возникнет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора. Если `autoClose` установлено значение true (поведение по умолчанию), на `'error'` или `'end'` дескриптор файла будет закрыт автоматически.

`mode` устанавливает режим файла (права доступа и липкие биты), но только если файл был создан.

Пример чтения последних 10 байтов файла длиной 100 байтов:

```js
import { createReadStream } from 'fs';

createReadStream('sample.txt', { start: 90, end: 99 });
```

Если `options` является строкой, то в ней указывается кодировка.

### `fs.createWriteStream(path[, options])`

<!-- YAML
added: v0.1.31
changes:
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/40013
    description: The `fs` option does not need `open` method if an `fd` was provided.
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/40013
    description: The `fs` option does not need `close` method if `autoClose` is `false`.
  - version:
     - v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35922
    description: The `fd` option accepts FileHandle arguments.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31408
    description: Change `emitClose` default to `true`.
  - version:
     - v13.6.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/29083
    description: The `fs` options allow overriding the used `fs`
                 implementation.
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/29212
    description: Enable `emitClose` option.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7831
    description: The passed `options` object will never be modified.
  - version: v5.5.0
    pr-url: https://github.com/nodejs/node/pull/3679
    description: The `autoClose` option is supported now.
  - version: v2.3.0
    pr-url: https://github.com/nodejs/node/pull/1845
    description: The passed `options` object can be a string now.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `flags` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'w'`.
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `fd` {integer | FileHandle} **Дефолт:** `null`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `autoClose` {логический} **Дефолт:** `true`
  - `emitClose` {логический} **Дефолт:** `true`
  - `start` {целое число}
  - `fs` {Object | null} **Дефолт:** `null`
- Возвращает: {fs.WriteStream}

`options` может также включать `start` опция, позволяющая записывать данные в некоторой позиции после начала файла, допустимые значения находятся в \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)] диапазон. Для изменения файла вместо его замены может потребоваться `flags` опция, которая должна быть установлена на `r+` а не по умолчанию `w`. В `encoding` может быть любым из одобренных {Buffer}.

Если `autoClose` установлено значение true (поведение по умолчанию) на `'error'` или `'finish'` дескриптор файла будет закрыт автоматически. Если `autoClose` ложно, то дескриптор файла не закроется, даже если возникнет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора.

По умолчанию поток выдаст сообщение `'close'` событие после его уничтожения. Установить `emitClose` возможность `false` чтобы изменить это поведение.

Предоставляя `fs` опцию можно отменить соответствующий `fs` реализации для `open`, `write`, `writev` а также `close`. Переопределение `write()` без `writev()` может снизить производительность, так как некоторые оптимизации (`_writev()`) будет отключен. При предоставлении `fs` вариант, отменяет по крайней мере один из `write` а также `writev` являются обязательными. Если нет `fd` опция поставляется, переопределение для `open` также требуется. Если `autoClose` является `true`, переопределение для `close` также требуется.

Как {fs.ReadStream}, если `fd` указан, {fs.WriteStream} проигнорирует `path` аргумент и будет использовать указанный файловый дескриптор. Это означает, что нет `'open'` событие будет выпущено. `fd` должен быть блокирующий; неблокирующий `fd`s следует передать в {net.Socket}.

Если `options` является строкой, то в ней указывается кодировка.

### `fs.exists(path, callback)`

<!-- YAML
added: v0.0.2
deprecated: v1.0.0
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
-->

> Стабильность: 0 - Не рекомендуется: использовать [`fs.stat()`](#fsstatpath-options-callback) или [`fs.access()`](#fsaccesspath-mode-callback) вместо.

- `path` {строка | Буфер | URL}
- `callback` {Функция}
  - `exists` {логический}

Проверьте, существует ли указанный путь, проверив файловую систему. Затем позвоните в `callback` аргумент с истинным или ложным:

```js
import { exists } from 'fs';

exists('/etc/passwd', (e) => {
  console.log(e ? 'it exists' : 'no passwd!');
});
```

**Параметры этого обратного вызова несовместимы с другими обратными вызовами Node.js.** Обычно первым параметром обратного вызова Node.js является `err` параметр, за которым могут следовать другие параметры. В `fs.exists()` обратный вызов имеет только один логический параметр. Это одна из причин `fs.access()` рекомендуется вместо `fs.exists()`.

С использованием `fs.exists()` чтобы проверить наличие файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. Это приводит к возникновению состояния гонки, поскольку другие процессы могут изменять состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать / читать / записывать файл напрямую и обрабатывать возникшую ошибку, если файл не существует.

**написать (НЕ РЕКОМЕНДУЕТСЯ)**

```js
import { exists, open, close } from 'fs';

exists('myfile', (e) => {
  if (e) {
    console.error('myfile already exists');
  } else {
    open('myfile', 'wx', (err, fd) => {
      if (err) throw err;

      try {
        writeMyData(fd);
      } finally {
        close(fd, (err) => {
          if (err) throw err;
        });
      }
    });
  }
});
```

**написать (РЕКОМЕНДУЕТСЯ)**

```js
import { open, close } from 'fs';
open('myfile', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('myfile already exists');
      return;
    }

    throw err;
  }

  try {
    writeMyData(fd);
  } finally {
    close(fd, (err) => {
      if (err) throw err;
    });
  }
});
```

**читать (НЕ РЕКОМЕНДУЕТСЯ)**

```js
import { open, close, exists } from 'fs';

exists('myfile', (e) => {
  if (e) {
    open('myfile', 'r', (err, fd) => {
      if (err) throw err;

      try {
        readMyData(fd);
      } finally {
        close(fd, (err) => {
          if (err) throw err;
        });
      }
    });
  } else {
    console.error('myfile does not exist');
  }
});
```

**читать (РЕКОМЕНДУЕТСЯ)**

```js
import { open, close } from 'fs';

open('myfile', 'r', (err, fd) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('myfile does not exist');
      return;
    }

    throw err;
  }

  try {
    readMyData(fd);
  } finally {
    close(fd, (err) => {
      if (err) throw err;
    });
  }
});
```

В приведенных выше «не рекомендуемых» примерах проверяется существование файла, а затем используется; «Рекомендуемые» примеры лучше, потому что они используют файл напрямую и обрабатывают ошибку, если таковая имеется.

В общем, проверяйте наличие файла только в том случае, если файл не будет использоваться напрямую, например, когда его существование является сигналом от другого процесса.

### `fs.fchmod(fd, mode, callback)`

<!-- YAML
added: v0.4.7
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `mode` {строка | целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Устанавливает права доступа к файлу. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Дополнительную информацию в документации POSIX fchmod (2).

### `fs.fchown(fd, uid, gid, callback)`

<!-- YAML
added: v0.4.7
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `uid` {целое число}
- `gid` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Устанавливает владельца файла. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Дополнительную информацию в документации POSIX fchown (2).

### `fs.fdatasync(fd, callback)`

<!-- YAML
added: v0.1.96
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Принудительно переводит все операции ввода-вывода в очереди, связанные с файлом, в состояние завершения синхронизированного ввода-вывода операционной системы. За подробностями обращайтесь к документации POSIX fdatasync (2). Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.fstat(fd[, options], callback)`

<!-- YAML
added: v0.1.95
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.Stats}

Вызывает обратный вызов с {fs.Stats} для дескриптора файла.

См. Дополнительную информацию в документации POSIX fstat (2).

### `fs.fsync(fd, callback)`

<!-- YAML
added: v0.1.96
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Запросите, чтобы все данные для дескриптора открытого файла были сброшены на запоминающее устройство. Конкретная реализация зависит от операционной системы и устройства. Обратитесь к документации POSIX fsync (2) для получения более подробной информации. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.ftruncate(fd[, len], callback)`

<!-- YAML
added: v0.8.6
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `len` {целое число} **Дефолт:** `0`
- `callback` {Функция}
  - `err` {Ошибка}

Обрезает файловый дескриптор. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Дополнительную информацию в документации POSIX ftruncate (2).

Если файл, на который ссылается файловый дескриптор, был больше, чем `len` байтов, только первый `len` байты будут сохранены в файле.

Например, следующая программа сохраняет только первые четыре байта файла:

```js
import { open, close, ftruncate } from 'fs';

function closeFd(fd) {
  close(fd, (err) => {
    if (err) throw err;
  });
}

open('temp.txt', 'r+', (err, fd) => {
  if (err) throw err;

  try {
    ftruncate(fd, 4, (err) => {
      closeFd(fd);
      if (err) throw err;
    });
  } catch (err) {
    closeFd(fd);
    if (err) throw err;
  }
});
```

Если ранее файл был короче, чем `len` байтов, он расширяется, а расширенная часть заполняется нулевыми байтами (`'\0'`):

Если `len` отрицательно, тогда `0` будет использоваться.

### `fs.futimes(fd, atime, mtime, callback)`

<!-- YAML
added: v0.4.2
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v4.1.0
    pr-url: https://github.com/nodejs/node/pull/2387
    description: Numeric strings, `NaN` and `Infinity` are now allowed
                 time specifiers.
-->

- `fd` {целое число}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}
- `callback` {Функция}
  - `err` {Ошибка}

Измените временные метки файловой системы объекта, на который ссылается предоставленный файловый дескриптор. Видеть [`fs.utimes()`](#fsutimespath-atime-mtime-callback).

### `fs.lchmod(path, mode, callback)`

<!-- YAML
deprecated: v0.4.7
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37460
    description: The error returned may be an `AggregateError` if more than one
                 error is returned.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `mode` {целое число}
- `callback` {Функция}
  - `err` {Error | AggregateError}

Изменяет права доступа к символьной ссылке. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

Этот метод реализован только в macOS.

См. Дополнительную информацию в документации POSIX lchmod (2).

### `fs.lchown(path, uid, gid, callback)`

<!-- YAML
changes:
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/21498
    description: This API is no longer deprecated.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v0.4.7
    description: Documentation-only deprecation.
-->

- `path` {строка | Буфер | URL}
- `uid` {целое число}
- `gid` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}

Установите владельца символической ссылки. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Документацию POSIX lchown (2) для получения более подробной информации.

### `fs.lutimes(path, atime, mtime, callback)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

- `path` {строка | Буфер | URL}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}
- `callback` {Функция}
  - `err` {Ошибка}

Изменяет время доступа и модификации файла так же, как [`fs.utimes()`](#fsutimespath-atime-mtime-callback), с той разницей, что если путь относится к символической ссылке, то ссылка не разыменовывается: вместо этого изменяются временные метки самой символической ссылки.

Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.link(existingPath, newPath, callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `existingPath` and `newPath` parameters can be WHATWG
                 `URL` objects using `file:` protocol. Support is currently
                 still *experimental*.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `existingPath` {строка | Буфер | URL}
- `newPath` {строка | Буфер | URL}
- `callback` {Функция}
  - `err` {Ошибка}

Создает новую ссылку из `existingPath` к `newPath`. См. Документацию POSIX link (2) для получения более подробной информации. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.lstat(path[, options], callback)`

<!-- YAML
added: v0.1.30
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.Stats}

Получает {fs.Stats} для символической ссылки, на которую указывает путь. Обратный вызов получает два аргумента `(err, stats)` куда `stats` является объектом {fs.Stats}. `lstat()` идентичен `stat()`, за исключением того, что если `path` является символической ссылкой, тогда указывается сама ссылка, а не файл, на который она ссылается.

Дополнительную информацию см. В документации POSIX lstat (2).

### `fs.mkdir(path[, options], callback)`

<!-- YAML
added: v0.1.8
changes:
  - version:
     - v13.11.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31530
    description: In `recursive` mode, the callback now receives the first
                 created path as an argument.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/21875
    description: The second argument can now be an `options` object with
                 `recursive` and `mode` properties.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект | целое число}
  - `recursive` {логический} **Дефолт:** `false`
  - `mode` {string | integer} Не поддерживается в Windows. **Дефолт:** `0o777`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно создает каталог.

Обратному вызову дается возможное исключение и, если `recursive` является `true`, первый путь к каталогу создан, `(err[, path])`. `path` все еще может быть `undefined` когда `recursive` является `true`, если каталог не был создан.

Необязательный `options` аргумент может быть целым числом, определяющим `mode` (разрешение и липкие биты) или объект с `mode` собственность и `recursive` свойство, указывающее, следует ли создавать родительские каталоги. Вызов `fs.mkdir()` когда `path` каталог, который существует, приводит к ошибке только тогда, когда `recursive` ложно.

```js
import { mkdir } from 'fs';

// Creates /tmp/a/apple, regardless of whether `/tmp` and /tmp/a exist.
mkdir('/tmp/a/apple', { recursive: true }, (err) => {
  if (err) throw err;
});
```

В Windows с помощью `fs.mkdir()` в корневом каталоге даже с рекурсией приведет к ошибке:

```js
import { mkdir } from 'fs';

mkdir('/', { recursive: true }, (err) => {
  // => [Error: EPERM: operation not permitted, mkdir 'C:\']
});
```

Дополнительную информацию см. В документации POSIX mkdir (2).

### `fs.mkdtemp(prefix[, options], callback)`

<!-- YAML
added: v5.10.0
changes:
  - version:
      - v16.5.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39028
    description: The `prefix` parameter now accepts an empty string.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v6.2.1
    pr-url: https://github.com/nodejs/node/pull/6828
    description: The `callback` parameter is optional now.
-->

- `prefix` {нить}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- `callback` {Функция}
  - `err` {Ошибка}
  - `directory` {нить}

Создает уникальный временный каталог.

Создает шесть случайных символов, которые нужно добавить после требуемого `prefix` для создания уникального временного каталога. Из-за несоответствий платформы избегайте трейлинга `X` персонажи в `prefix`. Некоторые платформы, особенно BSD, могут возвращать более шести случайных символов и заменять завершающие символы. `X` персонажи в `prefix` со случайными символами.

Созданный путь к каталогу передается в виде строки второму параметру обратного вызова.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее используемую кодировку символов.

```js
import { mkdtemp } from 'fs';

mkdtemp(
  path.join(os.tmpdir(), 'foo-'),
  (err, directory) => {
    if (err) throw err;
    console.log(directory);
    // Prints: /tmp/foo-itXde2 or C:\Users\...\AppData\Local\Temp\foo-itXde2
  }
);
```

В `fs.mkdtemp()` метод добавит шесть случайно выбранных символов непосредственно в `prefix` нить. Например, учитывая каталог `/tmp`, если намерение состоит в том, чтобы создать временный каталог _в_ `/tmp`, то `prefix` должен заканчиваться концевым разделителем пути, зависящим от платформы (`require('path').sep`).

```js
import { tmpdir } from 'os';
import { mkdtemp } from 'fs';

// The parent directory for the new temporary directory
const tmpDir = tmpdir();

// This method is *INCORRECT*:
mkdtemp(tmpDir, (err, directory) => {
  if (err) throw err;
  console.log(directory);
  // Will print something similar to `/tmpabc123`.
  // A new temporary directory is created at the file system root
  // rather than *within* the /tmp directory.
});

// This method is *CORRECT*:
import { sep } from 'path';
mkdtemp(`${tmpDir}${sep}`, (err, directory) => {
  if (err) throw err;
  console.log(directory);
  // Will print something similar to `/tmp/abc123`.
  // A new temporary directory is created within
  // the /tmp directory.
});
```

### `fs.open(path[, flags[, mode]], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v11.1.0
    pr-url: https://github.com/nodejs/node/pull/23767
    description: The `flags` argument is now optional and defaults to `'r'`.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/18801
    description: The `as` and `as+` flags are supported now.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `flags` {string | number} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'r'`.
- `mode` {строка | целое число} **Дефолт:** `0o666` (читаемый и записываемый)
- `callback` {Функция}
  - `err` {Ошибка}
  - `fd` {целое число}

Асинхронный файл открыт. Дополнительную информацию см. В документации POSIX open (2).

`mode` устанавливает режим файла (права доступа и липкие биты), но только если файл был создан. В Windows можно управлять только разрешением на запись; видеть [`fs.chmod()`](#fschmodpath-mode-callback).

Обратный вызов получает два аргумента `(err, fd)`.

Некоторые персонажи (`< > : " / \ | ? *`) зарезервированы под Windows, как указано в документации [Именование файлов, путей и пространств имен](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file). В NTFS, если имя файла содержит двоеточие, Node.js откроет поток файловой системы, как описано в [эта страница MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams).

Функции на основе `fs.open()` также демонстрируют такое поведение: `fs.writeFile()`, `fs.readFile()`, так далее.

### `fs.opendir(path[, options], callback)`

<!-- YAML
added: v12.12.0
changes:
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30114
    description: The `bufferSize` option was introduced.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `bufferSize` {number} Количество записей каталога, которые сохраняются во внутренней буфере при чтении из каталога. Более высокие значения приводят к лучшей производительности, но большему использованию памяти. **Дефолт:** `32`
- `callback` {Функция}
  - `err` {Ошибка}
  - `dir` {fs.Dir}

Асинхронно открыть каталог. Дополнительную информацию см. В документации по POSIX opendir (3).

Создает {fs.Dir}, который содержит все дальнейшие функции для чтения и очистки каталога.

В `encoding` опция устанавливает кодировку для `path` при открытии каталога и последующих операциях чтения.

### `fs.read(fd, buffer, offset, length, position, callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22150
    description: The `buffer` parameter can now be any `TypedArray`, or a
                 `DataView`.
  - version: v7.4.0
    pr-url: https://github.com/nodejs/node/pull/10382
    description: The `buffer` parameter can now be a `Uint8Array`.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/4518
    description: The `length` parameter can now be `0`.
-->

- `fd` {целое число}
- `buffer` {Buffer | TypedArray | DataView} Буфер, в который будут записываться данные.
- `offset` {integer} Позиция в `buffer` для записи данных.
- `length` {integer} Число байтов для чтения.
- `position` {integer | bigint} Определяет, откуда начать чтение в файле. Если `position` является `null` или `-1 `, данные будут считаны из текущей позиции файла, и позиция файла будет обновлена. Если `position` является целым числом, позиция файла не изменится.
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {целое число}
  - `buffer` {Буфер}

Прочитать данные из файла, указанного `fd`.

Обратному вызову передаются три аргумента: `(err, bytesRead, buffer)`.

Если файл не изменяется одновременно, конец файла достигается, когда число прочитанных байтов равно нулю.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed, он возвращает промис для `Object` с участием `bytesRead` а также `buffer` характеристики.

### `fs.read(fd, [options,] callback)`

<!-- YAML
added:
 - v13.11.0
 - v12.17.0
changes:
  - version:
     - v13.11.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31402
    description: Options object can be passed in
                 to make Buffer, offset, length and position optional.
-->

- `fd` {целое число}
- `options` {Объект}
  - `buffer` {Buffer | TypedArray | DataView} **Дефолт:** `Buffer.alloc(16384)`
  - `offset` {целое число} **Дефолт:** `0`
  - `length` {целое число} **Дефолт:** `buffer.byteLength`
  - `position` {целое число | bigint} **Дефолт:** `null`
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {целое число}
  - `buffer` {Буфер}

Подобно [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback) функция, эта версия принимает необязательный `options` объект. Если нет `options` указан объект, он будет по умолчанию с указанными выше значениями.

### `fs.readdir(path[, options], callback)`

<!-- YAML
added: v0.1.8
changes:
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22020
    description: New option `withFileTypes` was added.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5616
    description: The `options` parameter was added.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `withFileTypes` {логический} **Дефолт:** `false`
- `callback` {Функция}
  - `err` {Ошибка}
  - `files` {строка \[] | Буфер \[] | fs.Dirent \[]}

Читает содержимое каталога. Обратный вызов получает два аргумента `(err, files)` куда `files` представляет собой массив имен файлов в каталоге, исключая `'.'` а также `'..'`.

Дополнительную информацию см. В документации POSIX readdir (3).

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для имен файлов, передаваемых в функцию обратного вызова. Если `encoding` установлен на `'buffer'`, возвращенные имена файлов будут переданы как объекты {Buffer}.

Если `options.withFileTypes` установлен на `true`, то `files` массив будет содержать объекты {fs.Dirent}.

### `fs.readFile(path[, options], callback)`

<!-- YAML
added: v0.1.29
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37460
    description: The error returned may be an `AggregateError` if more than one
                 error is returned.
  - version:
      - v15.2.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/35911
    description: The options argument may include an AbortSignal to abort an
                 ongoing readFile request.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v5.1.0
    pr-url: https://github.com/nodejs/node/pull/3740
    description: The `callback` will always be called with `null` as the `error`
                 parameter in case of success.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `path` parameter can be a file descriptor now.
-->

- `path` {строка | буфер | URL | целое число} имя файла или дескриптор файла
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `null`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'r'`.
  - `signal` {AbortSignal} позволяет прервать выполнение файла чтения.
- `callback` {Функция}
  - `err` {Error | AggregateError}
  - `data` {строка | буфер}

Асинхронно читает все содержимое файла.

```js
import { readFile } from 'fs';

readFile('/etc/passwd', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

Обратному вызову передаются два аргумента `(err, data)`, куда `data` - это содержимое файла.

Если кодировка не указана, возвращается необработанный буфер.

Если `options` является строкой, то в ней указывается кодировка:

```js
import { readFile } from 'fs';

readFile('/etc/passwd', 'utf8', callback);
```

Когда путь - это каталог, поведение `fs.readFile()` а также [`fs.readFileSync()`](#fsreadfilesyncpath-options) зависит от платформы. В macOS, Linux и Windows будет возвращена ошибка. Во FreeBSD будет возвращено представление содержимого каталога.

```js
import { readFile } from 'fs';

// macOS, Linux, and Windows
readFile('<directory>', (err, data) => {
  // => [Error: EISDIR: illegal operation on a directory, read <directory>]
});

//  FreeBSD
readFile('<directory>', (err, data) => {
  // => null, <data>
});
```

Можно прервать текущий запрос, используя `AbortSignal`. Если запрос прерывается, обратный вызов вызывается с `AbortError`:

```js
import { readFile } from 'fs';

const controller = new AbortController();
const signal = controller.signal;
readFile(fileInfo[0].name, { signal }, (err, buf) => {
  // ...
});
// When you want to abort the request
controller.abort();
```

В `fs.readFile()` функция буферизует весь файл. Чтобы минимизировать затраты на память, по возможности предпочитайте потоковую передачу через `fs.createReadStream()`.

Прерывание текущего запроса прерывает не отдельные запросы операционной системы, а внутреннюю буферизацию. `fs.readFile` выполняет.

#### Дескрипторы файлов

1.  Любой указанный файловый дескриптор должен поддерживать чтение.
2.  Если дескриптор файла указан как `path`, он не будет закрыт автоматически.
3.  Чтение начнется с текущей позиции. Например, если в файле уже есть `'Hello World`'и шесть байтов считываются дескриптором файла, вызов `fs.readFile()` с тем же дескриптором файла даст `'World'`, скорее, чем `'Hello World'`.

#### Соображения производительности

В `fs.readFile()` метод асинхронно считывает содержимое файла в память по одному фрагменту за раз, позволяя циклу обработки событий переключаться между каждым фрагментом. Это позволяет операции чтения оказывать меньшее влияние на другие действия, которые могут использовать базовый пул потоков libuv, но означает, что чтение всего файла в память займет больше времени.

Дополнительные накладные расходы на чтение могут сильно различаться в разных системах и зависят от типа читаемого файла. Если тип файла не является обычным файлом (например, конвейер) и Node.js не может определить фактический размер файла, каждая операция чтения будет загружать 64 КБ данных. Для обычных файлов при каждом чтении обрабатывается 512 КБ данных.

Для приложений, требующих максимально быстрого чтения содержимого файлов, лучше использовать `fs.read()` напрямую и для кода приложения, чтобы управлять чтением всего содержимого самого файла.

Проблема с Node.js на GitHub [# 25741](https://github.com/nodejs/node/issues/25741) предоставляет дополнительную информацию и подробный анализ эффективности `fs.readFile()` для файлов разных размеров в разных версиях Node.js.

### `fs.readlink(path[, options], callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- `callback` {Функция}
  - `err` {Ошибка}
  - `linkString` {строка | буфер}

Читает содержимое символической ссылки, на которую ссылается `path`. Обратный вызов получает два аргумента `(err, linkString)`.

Дополнительную информацию см. В документации POSIX readlink (2).

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для пути ссылки, передаваемой в обратный вызов. Если `encoding` установлен на `'buffer'`, возвращенный путь ссылки будет передан как объект {Buffer}.

### `fs.readv(fd, buffers[, position], callback)`

<!-- YAML
added:
 - v13.13.0
 - v12.17.0
-->

- `fd` {целое число}
- `buffers` {ArrayBufferView \[]}
- `position` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {целое число}
  - `buffers` {ArrayBufferView \[]}

Читать из файла, указанного `fd` и напишите в массив `ArrayBufferView`с использованием `readv()`.

`position` это смещение от начала файла, откуда следует читать данные. Если `typeof position !== 'number'`, данные будут считаны с текущей позиции.

Обратному вызову будут предоставлены три аргумента: `err`, `bytesRead`, а также `buffers`. `bytesRead` сколько байтов было прочитано из файла.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed, он возвращает промис для `Object` с участием `bytesRead` а также `buffers` характеристики.

### `fs.realpath(path[, options], callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/13028
    description: Pipe/Socket resolve support was added.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7899
    description: Calling `realpath` now works again for various edge cases
                 on Windows.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/3594
    description: The `cache` parameter was removed.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- `callback` {Функция}
  - `err` {Ошибка}
  - `resolvedPath` {строка | буфер}

Асинхронно вычисляет канонический путь путем разрешения `.`, `..` и символические ссылки.

Канонический путь не обязательно уникален. Жесткие ссылки и привязки могут открывать объект файловой системы через множество путей.

Эта функция ведет себя как realpath (3), за некоторыми исключениями:

1.  Преобразование регистра не выполняется в файловых системах без учета регистра.

2.  Максимальное количество символических ссылок не зависит от платформы и обычно (намного) превышает то, что поддерживает собственная реализация realpath (3).

В `callback` получает два аргумента `(err, resolvedPath)`. Может использовать `process.cwd` для разрешения относительных путей.

Поддерживаются только пути, которые можно преобразовать в строки UTF8.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для пути, переданного в обратный вызов. Если `encoding` установлен на `'buffer'`, возвращенный путь будет передан как объект {Buffer}.

Если `path` разрешается в сокет или канал, функция вернет системно-зависимое имя для этого объекта.

### `fs.realpath.native(path[, options], callback)`

<!-- YAML
added: v9.2.0
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- `callback` {Функция}
  - `err` {Ошибка}
  - `resolvedPath` {строка | буфер}

Асинхронный реальный путь (3).

В `callback` получает два аргумента `(err, resolvedPath)`.

Поддерживаются только пути, которые можно преобразовать в строки UTF8.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для пути, переданного в обратный вызов. Если `encoding` установлен на `'buffer'`, возвращенный путь будет передан как объект {Buffer}.

В Linux, когда Node.js связан с musl libc, файловая система procfs должна быть смонтирована на `/proc` чтобы эта функция работала. Glibc не имеет этого ограничения.

### `fs.rename(oldPath, newPath, callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `oldPath` and `newPath` parameters can be WHATWG `URL`
                 objects using `file:` protocol. Support is currently still
                 *experimental*.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `oldPath` {строка | Буфер | URL}
- `newPath` {строка | Буфер | URL}
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно переименовать файл в `oldPath` к имени пути, указанному как `newPath`. В случае, если `newPath` уже существует, он будет перезаписан. Если есть каталог в `newPath`, вместо этого будет вызвана ошибка. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Также: rename (2).

```js
import { rename } from 'fs';

rename('oldFile.txt', 'newFile.txt', (err) => {
  if (err) throw err;
  console.log('Rename complete!');
});
```

### `fs.rmdir(path[, options], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37216
    description: "Using `fs.rmdir(path, { recursive: true })` on a `path` that is
                 a file is no longer permitted and results in an `ENOENT` error
                 on Windows and an `ENOTDIR` error on POSIX."
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37216
    description: "Using `fs.rmdir(path, { recursive: true })` on a `path` that
                 does not exist is no longer permitted and results in a `ENOENT`
                 error."
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37302
    description: The `recursive` option is deprecated, using it triggers a
                 deprecation warning.
  - version: v14.14.0
    pr-url: https://github.com/nodejs/node/pull/35579
    description: The `recursive` option is deprecated, use `fs.rm` instead.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30644
    description: The `maxBusyTries` option is renamed to `maxRetries`, and its
                 default is 0. The `emfileWait` option has been removed, and
                 `EMFILE` errors use the same retry logic as other errors. The
                 `retryDelay` option is now supported. `ENFILE` errors are now
                 retried.
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/29168
    description: The `recursive`, `maxBusyTries`, and `emfileWait` options are
                 now supported.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameters can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `maxRetries` {integer} Если `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, или `EPERM` обнаружена ошибка, Node.js повторяет операцию с линейным ожиданием отсрочки `retryDelay` на миллисекунды дольше с каждой попыткой. Этот параметр представляет количество повторных попыток. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `0`.
  - `recursive` {boolean} Если `true`, выполните рекурсивное удаление каталога. В рекурсивном режиме операции повторяются в случае сбоя. **Дефолт:** `false`. **Устарело.**
  - `retryDelay` {integer} Время ожидания между повторными попытками в миллисекундах. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `100`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронный rmdir (2). Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

С использованием `fs.rmdir()` в файле (не в каталоге) приводит к `ENOENT` ошибка в Windows и `ENOTDIR` ошибка в POSIX.

Чтобы получить поведение, подобное `rm -rf` Команда Unix, используйте [`fs.rm()`](#fsrmpath-options-callback) с опциями `{ recursive: true, force: true }`.

### `fs.rm(path[, options], callback)`

<!-- YAML
added: v14.14.0
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `force` {boolean} Когда `true`, исключения будут игнорироваться, если `path` не существует. **Дефолт:** `false`.
  - `maxRetries` {integer} Если `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, или `EPERM` обнаружена ошибка, Node.js повторит операцию с линейным ожиданием отсрочки `retryDelay` на миллисекунды дольше с каждой попыткой. Этот параметр представляет количество повторных попыток. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `0`.
  - `recursive` {boolean} Если `true`, выполните рекурсивное удаление. В рекурсивном режиме операции повторяются в случае сбоя. **Дефолт:** `false`.
  - `retryDelay` {integer} Время ожидания между повторными попытками в миллисекундах. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `100`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно удаляет файлы и каталоги (по образцу стандарта POSIX `rm` утилита). Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.stat(path[, options], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.Stats}

Асинхронная статистика (2). Обратный вызов получает два аргумента `(err, stats)` куда `stats` является объектом {fs.Stats}.

В случае ошибки `err.code` будет одним из [Общие системные ошибки](errors.md#common-system-errors).

С использованием `fs.stat()` чтобы проверить наличие файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. Вместо этого пользовательский код должен открывать / читать / записывать файл напрямую и обрабатывать возникшую ошибку, если файл недоступен.

Чтобы проверить, существует ли файл, не изменяя его впоследствии, [`fs.access()`](#fsaccesspath-mode-callback) Рекомендовано.

Например, учитывая следующую структуру каталогов:

```text
- txtDir
-- file.txt
- app.js
```

Следующая программа проверит статистику указанных путей:

```js
import { stat } from 'fs';

const pathsToCheck = ['./txtDir', './txtDir/file.txt'];

for (let i = 0; i < pathsToCheck.length; i++) {
  stat(pathsToCheck[i], (err, stats) => {
    console.log(stats.isDirectory());
    console.log(stats);
  });
}
```

Результат будет напоминать:

```console
true
Stats {
  dev: 16777220,
  mode: 16877,
  nlink: 3,
  uid: 501,
  gid: 20,
  rdev: 0,
  blksize: 4096,
  ino: 14214262,
  size: 96,
  blocks: 0,
  atimeMs: 1561174653071.963,
  mtimeMs: 1561174614583.3518,
  ctimeMs: 1561174626623.5366,
  birthtimeMs: 1561174126937.2893,
  atime: 2019-06-22T03:37:33.072Z,
  mtime: 2019-06-22T03:36:54.583Z,
  ctime: 2019-06-22T03:37:06.624Z,
  birthtime: 2019-06-22T03:28:46.937Z
}
false
Stats {
  dev: 16777220,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 20,
  rdev: 0,
  blksize: 4096,
  ino: 14214074,
  size: 8,
  blocks: 8,
  atimeMs: 1561174616618.8555,
  mtimeMs: 1561174614584,
  ctimeMs: 1561174614583.8145,
  birthtimeMs: 1561174007710.7478,
  atime: 2019-06-22T03:36:56.619Z,
  mtime: 2019-06-22T03:36:54.584Z,
  ctime: 2019-06-22T03:36:54.584Z,
  birthtime: 2019-06-22T03:26:47.711Z
}
```

### `fs.symlink(target, path[, type], callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/23724
    description: If the `type` argument is left undefined, Node will autodetect
                 `target` type and automatically select `dir` or `file`.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `target` and `path` parameters can be WHATWG `URL` objects
                 using `file:` protocol. Support is currently still
                 *experimental*.
-->

- `target` {строка | Буфер | URL}
- `path` {строка | Буфер | URL}
- `type` {нить}
- `callback` {Функция}
  - `err` {Ошибка}

Создает ссылку под названием `path` указывая на `target`. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

См. Документацию по символической ссылке POSIX (2) для получения более подробной информации.

В `type` Аргумент доступен только в Windows и игнорируется на других платформах. Его можно установить на `'dir'`, `'file'`, или `'junction'`. Если `type` аргумент не установлен, Node.js определит автоматически `target` тип и использование `'file'` или `'dir'`. Если `target` не существует, `'file'` будет использоваться. Точки соединения Windows требуют, чтобы конечный путь был абсолютным. Когда используешь `'junction'`, то `target` Аргумент будет автоматически нормализован до абсолютного пути.

Относительные цели относятся к родительскому каталогу ссылки.

```js
import { symlink } from 'fs';

symlink('./mew', './example/mewtwo', callback);
```

В приведенном выше примере создается символическая ссылка `mewtwo` в `example` что указывает на `mew` в том же каталоге:

```bash
$ tree example/
example/
├── mew
└── mewtwo -> ./mew
```

### `fs.truncate(path[, len], callback)`

<!-- YAML
added: v0.8.6
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37460
    description: The error returned may be an `AggregateError` if more than one
                 error is returned.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `len` {целое число} **Дефолт:** `0`
- `callback` {Функция}
  - `err` {Error | AggregateError}

Обрезает файл. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения. Дескриптор файла также может быть передан в качестве первого аргумента. В этом случае, `fs.ftruncate()` называется.

```js
import { truncate } from 'fs';
// Assuming that 'path/file.txt' is a regular file.
truncate('path/file.txt', (err) => {
  if (err) throw err;
  console.log('path/file.txt was truncated');
});
```

```js
const { truncate } = require('fs');
// Assuming that 'path/file.txt' is a regular file.
truncate('path/file.txt', (err) => {
  if (err) throw err;
  console.log('path/file.txt was truncated');
});
```

Передача дескриптора файла устарела и может привести к возникновению ошибки в будущем.

Дополнительную информацию см. В документации POSIX truncate (2).

### `fs.unlink(path, callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `path` {строка | Буфер | URL}
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно удаляет файл или символическую ссылку. Обратному вызову завершения не передаются никакие аргументы, кроме возможного исключения.

```js
import { unlink } from 'fs';
// Assuming that 'path/file.txt' is a regular file.
unlink('path/file.txt', (err) => {
  if (err) throw err;
  console.log('path/file.txt was deleted');
});
```

`fs.unlink()` не будет работать с каталогом, пустым или каким-либо другим. Чтобы удалить каталог, используйте [`fs.rmdir()`](#fsrmdirpath-options-callback).

Дополнительную информацию см. В документации POSIX unlink (2).

### `fs.unwatchFile(filename[, listener])`

<!-- YAML
added: v0.1.31
-->

- `filename` {строка | Буфер | URL}
- `listener` {Function} Необязательно, прослушиватель, ранее прикрепленный с помощью `fs.watchFile()`

Перестань следить за изменениями на `filename`. Если `listener` указан, удаляется только этот конкретный слушатель. Иначе, _все_ слушатели удаляются, фактически прекращая просмотр `filename`.

Вызов `fs.unwatchFile()` с именем файла, которое не отслеживается, - это бездействие, а не ошибка.

С использованием [`fs.watch()`](#fswatchfilename-options-listener) более эффективен, чем `fs.watchFile()` а также `fs.unwatchFile()`. `fs.watch()` следует использовать вместо `fs.watchFile()` а также `fs.unwatchFile()` когда возможно.

### `fs.utimes(path, atime, mtime, callback)`

<!-- YAML
added: v0.4.2
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11919
    description: "`NaN`, `Infinity`, and `-Infinity` are no longer valid time
                 specifiers."
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v4.1.0
    pr-url: https://github.com/nodejs/node/pull/2387
    description: Numeric strings, `NaN` and `Infinity` are now allowed
                 time specifiers.
-->

- `path` {строка | Буфер | URL}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}
- `callback` {Функция}
  - `err` {Ошибка}

Измените временные метки файловой системы объекта, на который ссылается `path`.

В `atime` а также `mtime` аргументы следуют этим правилам:

- Значения могут быть либо числами, представляющими эпоху Unix в секундах, либо `Date`s или числовая строка, например `'123456789.0'`.
- Если значение не может быть преобразовано в число, или `NaN`, `Infinity` или `-Infinity`, `Error` будет брошен.

### `fs.watch(filename[, options][, listener])`

<!-- YAML
added: v0.5.10
changes:
  - version:
      - v15.9.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/37190
    description: Added support for closing the watcher with an AbortSignal.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `filename` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7831
    description: The passed `options` object will never be modified.
-->

- `filename` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `persistent` {boolean} Указывает, должен ли процесс продолжать работу, пока отслеживаются файлы. **Дефолт:** `true`.
  - `recursive` {boolean} Указывает, следует ли отслеживать все подкаталоги или только текущий каталог. Это применимо, когда указан каталог, и только на поддерживаемых платформах (см. [предостережения](#caveats)). **Дефолт:** `false`.
  - `encoding` {строка} Определяет кодировку символов, которая будет использоваться для имени файла, передаваемого слушателю. **Дефолт:** `'utf8'`.
  - `signal` {AbortSignal} позволяет закрыть наблюдатель с помощью AbortSignal.
- `listener` {Функция | undefined} **Дефолт:** `undefined`
  - `eventType` {нить}
  - `filename` {строка | буфер}
- Возвращает: {fs.FSWatcher}

Следите за изменениями на `filename`, куда `filename` является либо файлом, либо каталогом.

Второй аргумент не обязателен. Если `options` предоставляется в виде строки, она определяет `encoding`. Иначе `options` следует передавать как объект.

Обратный вызов слушателя получает два аргумента `(eventType, filename)`. `eventType` либо `'rename'` или `'change'`, а также `filename` - это имя файла, вызвавшего событие.

На большинстве платформ `'rename'` генерируется всякий раз, когда имя файла появляется или исчезает в каталоге.

Обратный вызов слушателя прикреплен к `'change'` событие запускается {fs.FSWatcher}, но это не то же самое, что `'change'` значение `eventType`.

Если `signal` передан, прерывание соответствующего AbortController закроет возвращенный {fs.FSWatcher}.

#### Предостережения

<!--type=misc-->

В `fs.watch` API не на 100% согласован для разных платформ и недоступен в некоторых ситуациях.

Рекурсивный вариант поддерживается только в macOS и Windows. An `ERR_FEATURE_UNAVAILABLE_ON_PLATFORM` исключение будет сгенерировано, если параметр используется на платформе, которая его не поддерживает.

В Windows события не будут генерироваться, если наблюдаемый каталог перемещен или переименован. An `EPERM` об ошибке сообщается при удалении наблюдаемого каталога.

##### Доступность

<!--type=misc-->

Эта функция зависит от базовой операционной системы, позволяющей получать уведомления об изменениях файловой системы.

- В системах Linux это использует [`inotify(7)`](https://man7.org/linux/man-pages/man7/inotify.7.html).
- В системах BSD это использует [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2).
- В macOS это использует [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2) для файлов и [`FSEvents`](https://developer.apple.com/documentation/coreservices/file_system_events) для справочников.
- В системах SunOS (включая Solaris и SmartOS) это использует [`event ports`](https://illumos.org/man/port_create).
- В системах Windows эта функция зависит от [`ReadDirectoryChangesW`](https://docs.microsoft.com/en-us/windows/desktop/api/winbase/nf-winbase-readdirectorychangesw).
- В системах AIX эта функция зависит от [`AHAFS`](https://developer.ibm.com/articles/au-aix_event_infrastructure/), который должен быть включен.
- В системах IBM i эта функция не поддерживается.

Если базовая функциональность недоступна по какой-либо причине, тогда `fs.watch()` не сможет работать и может вызвать исключение. Например, просмотр файлов или каталогов может быть ненадежным, а в некоторых случаях невозможным в сетевых файловых системах (NFS, SMB и т. Д.) Или файловых системах хоста при использовании программного обеспечения для виртуализации, такого как Vagrant или Docker.

Еще можно использовать `fs.watchFile()`, который использует опрос статистики, но этот метод более медленный и менее надежный.

##### Inodes

<!--type=misc-->

В системах Linux и macOS `fs.watch()` решает путь к [индекс](https://en.wikipedia.org/wiki/Inode) и наблюдает за индексом. Если отслеживаемый путь удаляется и создается заново, ему назначается новый индексный дескриптор. Часы выдадут событие для удаления, но продолжат просмотр _оригинал_ индексный дескриптор. События для нового индексного дескриптора не генерируются. Это ожидаемое поведение.

Файлы AIX сохраняют один и тот же индексный дескриптор в течение всего времени существования файла. Сохранение и закрытие отслеживаемого файла в AIX приведет к появлению двух уведомлений (одно для добавления нового содержимого, а другое для усечения).

##### Аргумент имени файла

<!--type=misc-->

Предоставление `filename` Аргумент обратного вызова поддерживается только в Linux, macOS, Windows и AIX. Даже на поддерживаемых платформах `filename` не всегда гарантируется. Поэтому не думайте, что `filename` аргумент всегда предоставляется в обратном вызове и имеет некоторую резервную логику, если он `null`.

```js
import { watch } from 'fs';
watch('somedir', (eventType, filename) => {
  console.log(`event type is: ${eventType}`);
  if (filename) {
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});
```

### `fs.watchFile(filename[, options], listener)`

<!-- YAML
added: v0.1.31
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: The `bigint` option is now supported.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `filename` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
-->

- `filename` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {логический} **Дефолт:** `false`
  - `persistent` {логический} **Дефолт:** `true`
  - `interval` {целое число} **Дефолт:** `5007`
- `listener` {Функция}
  - `current` {fs.Stats}
  - `previous` {fs.Stats}
- Возвращает: {fs.StatWatcher}

Следите за изменениями на `filename`. Обратный звонок `listener` будет вызываться каждый раз при доступе к файлу.

В `options` аргумент может быть опущен. Если предоставлено, это должен быть объект. В `options` объект может содержать логическое значение с именем `persistent` это указывает, следует ли продолжать выполнение процесса, пока отслеживаются файлы. В `options` объект может указывать `interval` свойство, указывающее, как часто цель должна опрашиваться в миллисекундах.

В `listener` получает два аргумента: текущий объект stat и предыдущий объект stat:

```js
import { watchFile } from 'fs';

watchFile('message.text', (curr, prev) => {
  console.log(`the current mtime is: ${curr.mtime}`);
  console.log(`the previous mtime was: ${prev.mtime}`);
});
```

Эти стат-объекты являются экземплярами `fs.Stat`. Если `bigint` вариант `true`, числовые значения в этих объектах указываются как `BigInt`с.

Чтобы получать уведомления о том, что файл был изменен, а не просто открылся, необходимо сравнить `curr.mtimeMs` а также `prev.mtimeMs`.

Когда `fs.watchFile` операция приводит к `ENOENT` ошибка, он вызовет прослушиватель один раз со всеми обнуленными полями (или, для дат, Unix Epoch). Если файл будет создан позже, прослушиватель будет вызван снова с последними объектами статистики. Это изменение функциональности по сравнению с v0.10.

С использованием [`fs.watch()`](#fswatchfilename-options-listener) более эффективен, чем `fs.watchFile` а также `fs.unwatchFile`. `fs.watch` следует использовать вместо `fs.watchFile` а также `fs.unwatchFile` когда возможно.

Когда файл просматривает `fs.watchFile()` исчезает и появляется снова, затем содержимое `previous` во втором событии обратного вызова (повторное появление файла) будет таким же, как и содержимое `previous` в первом событии обратного вызова (его исчезновении).

Это случается, когда:

- файл удаляется с последующим восстановлением
- файл переименовывается, а затем снова переименовывается в его исходное имя

### `fs.write(fd, buffer[, offset[, length[, position]]], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `buffer` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `buffer` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22150
    description: The `buffer` parameter can now be any `TypedArray` or a
                 `DataView`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.4.0
    pr-url: https://github.com/nodejs/node/pull/10382
    description: The `buffer` parameter can now be a `Uint8Array`.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/7856
    description: The `offset` and `length` parameters are optional now.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `buffer` {Buffer | TypedArray | DataView | строка | Объект}
- `offset` {целое число}
- `length` {целое число}
- `position` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesWritten` {целое число}
  - `buffer` {Buffer | TypedArray | DataView}

Напишите `buffer` в файл, указанный `fd`. Если `buffer` это нормальный объект, у него должен быть свой `toString` свойство функции.

`offset` определяет часть буфера для записи, и `length` целое число, определяющее количество байтов для записи.

`position` относится к смещению от начала файла, куда должны быть записаны эти данные. Если `typeof position !== 'number'`, данные будут записаны в текущей позиции. Смотрите pwrite (2).

Обратному вызову будут переданы три аргумента `(err, bytesWritten, buffer)` куда `bytesWritten` указывает, сколько _байты_ были написаны из `buffer`.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed, он возвращает промис для `Object` с участием `bytesWritten` а также `buffer` характеристики.

Небезопасно использовать `fs.write()` несколько раз в одном файле, не дожидаясь обратного вызова. Для этого сценария [`fs.createWriteStream()`](#fscreatewritestreampath-options) Рекомендовано.

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

### `fs.write(fd, string[, position[, encoding]], callback)`

<!-- YAML
added: v0.11.5
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `string` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `string` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/7856
    description: The `position` parameter is optional now.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

- `fd` {целое число}
- `string` {строка | Объект}
- `position` {целое число}
- `encoding` {нить} **Дефолт:** `'utf8'`
- `callback` {Функция}
  - `err` {Ошибка}
  - `written` {целое число}
  - `string` {нить}

Напишите `string` в файл, указанный `fd`. Если `string` не строка или объект с собственным `toString` функция, то генерируется исключение.

`position` относится к смещению от начала файла, куда должны быть записаны эти данные. Если `typeof position !== 'number'` данные будут записаны в текущей позиции. Смотрите pwrite (2).

`encoding` - ожидаемая кодировка строки.

Обратный вызов получит аргументы `(err, written, string)` куда `written` указывает, сколько _байты_ переданная строка, которую необходимо записать. Записанные байты не обязательно совпадают с записанными строковыми символами. Видеть [`Buffer.byteLength`](buffer.md#static-method-bufferbytelengthstring-encoding).

Небезопасно использовать `fs.write()` несколько раз в одном файле, не дожидаясь обратного вызова. Для этого сценария [`fs.createWriteStream()`](#fscreatewritestreampath-options) Рекомендовано.

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

В Windows, если дескриптор файла подключен к консоли (например, `fd == 1` или `stdout`) строка, содержащая символы, отличные от ASCII, по умолчанию не будет правильно отображаться, независимо от используемой кодировки. Можно настроить консоль для правильного рендеринга UTF-8, изменив активную кодовую страницу с помощью `chcp 65001` команда. Увидеть [chcp](https://ss64.com/nt/chcp.html) документы для более подробной информации.

### `fs.writeFile(file, data[, options], callback)`

<!-- YAML
added: v0.1.29
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37460
    description: The error returned may be an `AggregateError` if more than one
                 error is returned.
  - version:
      - v15.2.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/35993
    description: The options argument may include an AbortSignal to abort an
                 ongoing writeFile request.
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `data` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22150
    description: The `data` parameter can now be any `TypedArray` or a
                 `DataView`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.4.0
    pr-url: https://github.com/nodejs/node/pull/10382
    description: The `data` parameter can now be a `Uint8Array`.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `file` parameter can be a file descriptor now.
-->

- `file` {строка | буфер | URL | целое число} имя файла или дескриптор файла
- `data` {строка | Буфер | TypedArray | DataView | Объект}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'w'`.
  - `signal` {AbortSignal} позволяет прервать выполнение файла записи.
- `callback` {Функция}
  - `err` {Error | AggregateError}

Когда `file` является именем файла, асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой или буфером.

Когда `file` дескриптор файла, поведение аналогично вызову `fs.write()` напрямую (что рекомендуется). См. Примечания ниже по использованию дескриптора файла.

В `encoding` опция игнорируется, если `data` это буфер.

В `mode` опция влияет только на вновь созданный файл. Видеть [`fs.open()`](#fsopenpath-flags-mode-callback) Больше подробностей.

Если `data` это простой объект, он должен иметь собственный (не унаследованный) `toString` свойство функции.

```js
import { writeFile } from 'fs';
import { Buffer } from 'buffer';

const data = new Uint8Array(Buffer.from('Hello Node.js'));
writeFile('message.txt', data, (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
```

Если `options` является строкой, то в ней указывается кодировка:

```js
import { writeFile } from 'fs';

writeFile('message.txt', 'Hello Node.js', 'utf8', callback);
```

Небезопасно использовать `fs.writeFile()` несколько раз в одном файле, не дожидаясь обратного вызова. Для этого сценария [`fs.createWriteStream()`](#fscreatewritestreampath-options) Рекомендовано.

Аналогично `fs.readFile` - `fs.writeFile` это удобный метод, который выполняет несколько `write` вызывает внутренние вызовы для записи переданного ему буфера. Для кода, чувствительного к производительности, рассмотрите возможность использования [`fs.createWriteStream()`](#fscreatewritestreampath-options).

Можно использовать {AbortSignal} для отмены `fs.writeFile()`. Отмена - это «лучший способ», и, вероятно, еще предстоит записать некоторый объем данных.

```js
import { writeFile } from 'fs';
import { Buffer } from 'buffer';

const controller = new AbortController();
const { signal } = controller;
const data = new Uint8Array(Buffer.from('Hello Node.js'));
writeFile('message.txt', data, { signal }, (err) => {
  // When a request is aborted - the callback is called with an AbortError
});
// When the request should be aborted
controller.abort();
```

Прерывание текущего запроса прерывает не отдельные запросы операционной системы, а внутреннюю буферизацию. `fs.writeFile` выполняет.

#### С использованием `fs.writeFile()` с файловыми дескрипторами

Когда `file` дескриптор файла, поведение почти идентично прямому вызову `fs.write()` нравиться:

```js
import { write } from 'fs';
import { Buffer } from 'buffer';

write(fd, Buffer.from(data, options.encoding), callback);
```

Отличие от прямого звонка `fs.write()` в том, что при каких-то необычных условиях `fs.write()` может записать только часть буфера и потребуется повторить попытку записи оставшихся данных, тогда как `fs.writeFile()` повторяет попытки до тех пор, пока данные не будут полностью записаны (или пока не возникнет ошибка).

Последствия этого - распространенный источник путаницы. В случае файлового дескриптора файл не заменяется! Данные не обязательно записываются в начало файла, и исходные данные файла могут оставаться до и / или после вновь записанных данных.

Например, если `fs.writeFile()` вызывается дважды подряд, сначала для записи строки `'Hello'`, затем записать строку `', World'`, файл будет содержать `'Hello, World'`, и может содержать некоторые исходные данные файла (в зависимости от размера исходного файла и положения файлового дескриптора). Если бы вместо дескриптора использовалось имя файла, файл гарантированно содержал бы только `', World'`.

### `fs.writev(fd, buffers[, position], callback)`

<!-- YAML
added: v12.9.0
-->

- `fd` {целое число}
- `buffers` {ArrayBufferView \[]}
- `position` {целое число}
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesWritten` {целое число}
  - `buffers` {ArrayBufferView \[]}

Напишите массив `ArrayBufferView`s в файл, указанный `fd` с использованием `writev()`.

`position` это смещение от начала файла, в которое должны быть записаны эти данные. Если `typeof position !== 'number'`, данные будут записаны в текущей позиции.

Обратному вызову будут предоставлены три аргумента: `err`, `bytesWritten`, а также `buffers`. `bytesWritten` сколько байтов было записано из `buffers`.

Если этот метод [`util.promisify()`](util.md#utilpromisifyoriginal)ed, он возвращает промис для `Object` с участием `bytesWritten` а также `buffers` характеристики.

Небезопасно использовать `fs.writev()` несколько раз в одном файле, не дожидаясь обратного вызова. Для этого сценария используйте [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

## Синхронный API

Синхронные API выполняют все операции синхронно, блокируя цикл событий до тех пор, пока операция не завершится или не завершится ошибкой.

### `fs.accessSync(path[, mode])`

<!-- YAML
added: v0.11.15
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `mode` {целое число} **Дефолт:** `fs.constants.F_OK`

Синхронно проверяет разрешения пользователя для файла или каталога, указанного в `path`. В `mode` Аргумент - необязательное целое число, указывающее, какие проверки доступности необходимо выполнить. Проверять [Константы доступа к файлам](#file-access-constants) для возможных значений `mode`. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.W_OK | fs.constants.R_OK`).

Если какая-либо из проверок доступности завершится неудачно, `Error` будет брошен. В противном случае метод вернет `undefined`.

```js
import { accessSync, constants } from 'fs';

try {
  accessSync('etc/passwd', constants.R_OK | constants.W_OK);
  console.log('can read/write');
} catch (err) {
  console.error('no access!');
}
```

### `fs.appendFileSync(path, data[, options])`

<!-- YAML
added: v0.6.7
changes:
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7831
    description: The passed `options` object will never be modified.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `file` parameter can be a file descriptor now.
-->

- `path` {строка | Буфер | URL | номер} имя файла или дескриптор файла
- `data` {строка | буфер}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'a'`.

Синхронно добавлять данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или {буфером}.

В `mode` опция влияет только на вновь созданный файл. Видеть [`fs.open()`](#fsopenpath-flags-mode-callback) Больше подробностей.

```js
import { appendFileSync } from 'fs';

try {
  appendFileSync('message.txt', 'data to append');
  console.log('The "data to append" was appended to file!');
} catch (err) {
  /* Handle the error */
}
```

Если `options` является строкой, то в ней указывается кодировка:

```js
import { appendFileSync } from 'fs';

appendFileSync('message.txt', 'data to append', 'utf8');
```

В `path` может быть указан как числовой дескриптор файла, который был открыт для добавления (используя `fs.open()` или `fs.openSync()`). Дескриптор файла не будет закрыт автоматически.

```js
import { openSync, closeSync, appendFileSync } from 'fs';

let fd;

try {
  fd = openSync('message.txt', 'a');
  appendFileSync(fd, 'data to append', 'utf8');
} catch (err) {
  /* Handle the error */
} finally {
  if (fd !== undefined) closeSync(fd);
}
```

### `fs.chmodSync(path, mode)`

<!-- YAML
added: v0.6.7
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `mode` {строка | целое число}

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.chmod()`](#fschmodpath-mode-callback).

См. Документацию POSIX chmod (2) для получения более подробной информации.

### `fs.chownSync(path, uid, gid)`

<!-- YAML
added: v0.1.97
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `uid` {целое число}
- `gid` {целое число}

Синхронно меняет владельца и группу файла. Возврат `undefined`. Это синхронная версия [`fs.chown()`](#fschownpath-uid-gid-callback).

См. Документацию POSIX chown (2) для получения более подробной информации.

### `fs.closeSync(fd)`

<!-- YAML
added: v0.1.21
-->

- `fd` {целое число}

Закрывает файловый дескриптор. Возврат `undefined`.

Вызов `fs.closeSync()` на любом дескрипторе файла (`fd`), который в настоящее время используется другими `fs` операция может привести к неопределенному поведению.

См. Документацию POSIX close (2) для получения более подробной информации.

### `fs.copyFileSync(src, dest[, mode])`

<!-- YAML
added: v8.5.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Changed 'flags' argument to 'mode' and imposed
                 stricter type validation.
-->

- `src` {string | Buffer | URL} имя исходного файла для копирования
- `dest` {string | Buffer | URL} имя файла назначения для операции копирования
- `mode` Модификаторы {integer} для операции копирования. **Дефолт:** `0`.

Синхронно копирует `src` к `dest`. По умолчанию, `dest` перезаписывается, если он уже существует. Возврат `undefined`. Node.js не дает никаких гарантий относительно атомарности операции копирования. Если ошибка возникает после того, как целевой файл был открыт для записи, Node.js попытается удалить место назначения.

`mode` - необязательное целое число, определяющее поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

- `fs.constants.COPYFILE_EXCL`: Операция копирования завершится неудачно, если `dest` уже существует.
- `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать рефссылку для копирования при записи. Если платформа не поддерживает копирование при записи, то используется резервный механизм копирования.
- `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать рефссылку для копирования при записи. Если платформа не поддерживает копирование при записи, операция завершится ошибкой.

```js
import { copyFileSync, constants } from 'fs';

// destination.txt will be created or overwritten by default.
copyFileSync('source.txt', 'destination.txt');
console.log('source.txt was copied to destination.txt');

// By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
copyFileSync(
  'source.txt',
  'destination.txt',
  constants.COPYFILE_EXCL
);
```

### `fs.cpSync(src, dest[, options])`

<!-- YAML
added: v16.7.0
-->

> Стабильность: 1 - экспериментальная

- `src` {строка | URL} исходный путь для копирования.
- `dest` {string | URL} целевой путь для копирования.
- `options` {Объект}
  - `dereference` {boolean} разыменование символических ссылок. **Дефолт:** `false`.
  - `errorOnExist` {логическое} когда `force` является `false`, и место назначения существует, выдает ошибку. **Дефолт:** `false`.
  - `filter` {Функция} Функция для фильтрации скопированных файлов / каталогов. Возвращение `true` чтобы скопировать элемент, `false` игнорировать это. **Дефолт:** `undefined`
  - `force` {boolean} перезаписать существующий файл или каталог. \_Операция копирования будет игнорировать ошибки, если вы установите значение false и адресат существует. Использовать `errorOnExist` возможность изменить это поведение. **Дефолт:** `true`.
  - `preserveTimestamps` {boolean} Когда `true` отметки времени от `src` будут сохранены. **Дефолт:** `false`.
  - `recursive` {boolean} рекурсивное копирование каталогов **Дефолт:** `false`

Синхронно копирует всю структуру каталогов из `src` к `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог глобусы не поддерживаются и поведение аналогично `cp dir1/ dir2/`.

### `fs.existsSync(path)`

<!-- YAML
added: v0.1.21
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
-->

- `path` {строка | Буфер | URL}
- Возвращает: {логическое}

Возврат `true` если путь существует, `false` иначе.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.exists()`](#fsexistspath-callback).

`fs.exists()` устарело, но `fs.existsSync()` не является. В `callback` параметр для `fs.exists()` принимает параметры, несовместимые с другими обратными вызовами Node.js. `fs.existsSync()` не использует обратный вызов.

```js
import { existsSync } from 'fs';

if (existsSync('/etc/passwd'))
  console.log('The path exists.');
```

### `fs.fchmodSync(fd, mode)`

<!-- YAML
added: v0.4.7
-->

- `fd` {целое число}
- `mode` {строка | целое число}

Устанавливает права доступа к файлу. Возврат `undefined`.

См. Дополнительную информацию в документации POSIX fchmod (2).

### `fs.fchownSync(fd, uid, gid)`

<!-- YAML
added: v0.4.7
-->

- `fd` {целое число}
- `uid` {integer} Идентификатор пользователя нового владельца файла.
- `gid` {integer} Идентификатор группы новой группы файла.

Устанавливает владельца файла. Возврат `undefined`.

См. Дополнительную информацию в документации POSIX fchown (2).

### `fs.fdatasyncSync(fd)`

<!-- YAML
added: v0.1.96
-->

- `fd` {целое число}

Принудительно переводит все операции ввода-вывода в очереди, связанные с файлом, в состояние завершения синхронизированного ввода-вывода операционной системы. За подробностями обращайтесь к документации POSIX fdatasync (2). Возврат `undefined`.

### `fs.fstatSync(fd[, options])`

<!-- YAML
added: v0.1.95
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

- `fd` {целое число}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
- Возвращает: {fs.Stats}

Получает {fs.Stats} для дескриптора файла.

См. Дополнительную информацию в документации POSIX fstat (2).

### `fs.fsyncSync(fd)`

<!-- YAML
added: v0.1.96
-->

- `fd` {целое число}

Запросите, чтобы все данные для дескриптора открытого файла были сброшены на запоминающее устройство. Конкретная реализация зависит от операционной системы и устройства. Обратитесь к документации POSIX fsync (2) для получения более подробной информации. Возврат `undefined`.

### `fs.ftruncateSync(fd[, len])`

<!-- YAML
added: v0.8.6
-->

- `fd` {целое число}
- `len` {целое число} **Дефолт:** `0`

Обрезает файловый дескриптор. Возврат `undefined`.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.ftruncate()`](#fsftruncatefd-len-callback).

### `fs.futimesSync(fd, atime, mtime)`

<!-- YAML
added: v0.4.2
changes:
  - version: v4.1.0
    pr-url: https://github.com/nodejs/node/pull/2387
    description: Numeric strings, `NaN` and `Infinity` are now allowed
                 time specifiers.
-->

- `fd` {целое число}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}

Синхронная версия [`fs.futimes()`](#fsfutimesfd-atime-mtime-callback). Возврат `undefined`.

### `fs.lchmodSync(path, mode)`

<!-- YAML
deprecated: v0.4.7
-->

- `path` {строка | Буфер | URL}
- `mode` {целое число}

Изменяет права доступа к символьной ссылке. Возврат `undefined`.

Этот метод реализован только в macOS.

См. Дополнительную информацию в документации POSIX lchmod (2).

### `fs.lchownSync(path, uid, gid)`

<!-- YAML
changes:
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/21498
    description: This API is no longer deprecated.
  - version: v0.4.7
    description: Documentation-only deprecation.
-->

- `path` {строка | Буфер | URL}
- `uid` {integer} Идентификатор пользователя нового владельца файла.
- `gid` {integer} Идентификатор группы новой группы файла.

Задайте владельца пути. Возврат `undefined`.

Дополнительную информацию см. В документации POSIX lchown (2).

### `fs.lutimesSync(path, atime, mtime)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

- `path` {строка | Буфер | URL}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}

Измените временные метки файловой системы символьной ссылки, на которую ссылается `path`. Возврат `undefined`, или выдает исключение, если параметры неверны или операция не выполняется. Это синхронная версия [`fs.lutimes()`](#fslutimespath-atime-mtime-callback).

### `fs.linkSync(existingPath, newPath)`

<!-- YAML
added: v0.1.31
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `existingPath` and `newPath` parameters can be WHATWG
                 `URL` objects using `file:` protocol. Support is currently
                 still *experimental*.
-->

- `existingPath` {строка | Буфер | URL}
- `newPath` {строка | Буфер | URL}

Создает новую ссылку из `existingPath` к `newPath`. См. Документацию POSIX link (2) для получения более подробной информации. Возврат `undefined`.

### `fs.lstatSync(path[, options])`

<!-- YAML
added: v0.1.30
changes:
  - version:
    - v15.3.0
    - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/33716
    description: Accepts a `throwIfNoEntry` option to specify whether
                 an exception should be thrown if the entry does not exist.
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
  - `throwIfNoEntry` {boolean} Будет ли генерироваться исключение, если запись в файловой системе не существует, вместо возврата `undefined`. **Дефолт:** `true`.
- Возвращает: {fs.Stats}

Получает {fs.Stats} для символической ссылки, на которую ссылается `path`.

Дополнительную информацию см. В документации POSIX lstat (2).

### `fs.mkdirSync(path[, options])`

<!-- YAML
added: v0.1.21
changes:
  - version:
     - v13.11.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31530
    description: In `recursive` mode, the first created path is returned now.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/21875
    description: The second argument can now be an `options` object with
                 `recursive` and `mode` properties.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект | целое число}
  - `recursive` {логический} **Дефолт:** `false`
  - `mode` {string | integer} Не поддерживается в Windows. **Дефолт:** `0o777`.
- Возвращает: {строка | undefined}

Синхронно создает каталог. Возврат `undefined`, или если `recursive` является `true`, путь к первому каталогу создан. Это синхронная версия [`fs.mkdir()`](#fsmkdirpath-options-callback).

Дополнительную информацию см. В документации POSIX mkdir (2).

### `fs.mkdtempSync(prefix[, options])`

<!-- YAML
added: v5.10.0
changes:
  - version:
      - v16.5.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39028
    description: The `prefix` parameter now accepts an empty string.
-->

- `prefix` {нить}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возвращает: {строка}

Возвращает созданный путь к каталогу.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.mkdtemp()`](#fsmkdtempprefix-options-callback).

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее используемую кодировку символов.

### `fs.opendirSync(path[, options])`

<!-- YAML
added: v12.12.0
changes:
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30114
    description: The `bufferSize` option was introduced.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `bufferSize` {number} Количество записей каталога, которые сохраняются во внутренней буфере при чтении из каталога. Более высокие значения приводят к лучшей производительности, но большему использованию памяти. **Дефолт:** `32`
- Возвращает: {fs.Dir}

Синхронно открыть каталог. См. Opendir (3).

Создает {fs.Dir}, который содержит все дальнейшие функции для чтения и очистки каталога.

В `encoding` опция устанавливает кодировку для `path` при открытии каталога и последующих операциях чтения.

### `fs.openSync(path[, flags[, mode]])`

<!-- YAML
added: v0.1.21
changes:
  - version: v11.1.0
    pr-url: https://github.com/nodejs/node/pull/23767
    description: The `flags` argument is now optional and defaults to `'r'`.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/18801
    description: The `as` and `as+` flags are supported now.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `flags` {строка | число} **Дефолт:** `'r'`. Видеть [поддержка файловой системы `flags`](#file-system-flags).
- `mode` {строка | целое число} **Дефолт:** `0o666`
- Возврат: {number}

Возвращает целое число, представляющее дескриптор файла.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.open()`](#fsopenpath-flags-mode-callback).

### `fs.readdirSync(path[, options])`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22020
    description: New option `withFileTypes` was added.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
  - `withFileTypes` {логический} **Дефолт:** `false`
- Возвращает: {строка \[] | Buffer \[] | fs.Dirent \[]}.

Читает содержимое каталога.

Дополнительную информацию см. В документации POSIX readdir (3).

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для возвращаемых имен файлов. Если `encoding` установлен на `'buffer'`, возвращенные имена файлов будут переданы как объекты {Buffer}.

Если `options.withFileTypes` установлен на `true`, результат будет содержать объекты {fs.Dirent}.

### `fs.readFileSync(path[, options])`

<!-- YAML
added: v0.1.8
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `path` parameter can be a file descriptor now.
-->

- `path` {строка | буфер | URL | целое число} имя файла или дескриптор файла
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `null`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'r'`.
- Возвращает: {строка | буфер}

Возвращает содержимое `path`.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.readFile()`](#fsreadfilepath-options-callback).

Если `encoding` указана опция, тогда эта функция возвращает строку. В противном случае он возвращает буфер.

Похожий на [`fs.readFile()`](#fsreadfilepath-options-callback), когда путь - это каталог, поведение `fs.readFileSync()` зависит от платформы.

```js
import { readFileSync } from 'fs';

// macOS, Linux, and Windows
readFileSync('<directory>');
// => [Error: EISDIR: illegal operation on a directory, read <directory>]

//  FreeBSD
readFileSync('<directory>'); // => <data>
```

### `fs.readlinkSync(path[, options])`

<!-- YAML
added: v0.1.31
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возвращает: {строка | буфер}

Возвращает строковое значение символьной ссылки.

Дополнительную информацию см. В документации POSIX readlink (2).

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, которая будет использоваться для возвращаемого пути ссылки. Если `encoding` установлен на `'buffer'`, возвращенный путь ссылки будет передан как объект {Buffer}.

### `fs.readSync(fd, buffer, offset, length, position)`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22150
    description: The `buffer` parameter can now be any `TypedArray` or a
                 `DataView`.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/4518
    description: The `length` parameter can now be `0`.
-->

- `fd` {целое число}
- `buffer` {Buffer | TypedArray | DataView}
- `offset` {целое число}
- `length` {целое число}
- `position` {целое число | bigint}
- Возврат: {number}

Возвращает количество `bytesRead`.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback).

### `fs.readSync(fd, buffer[, options])`

<!-- YAML
added:
 - v13.13.0
 - v12.17.0
changes:
  - version:
     - v13.13.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32460
    description: Options object can be passed in
                 to make offset, length and position optional.
-->

- `fd` {целое число}
- `buffer` {Buffer | TypedArray | DataView}
- `options` {Объект}
  - `offset` {целое число} **Дефолт:** `0`
  - `length` {целое число} **Дефолт:** `buffer.byteLength`
  - `position` {целое число | bigint} **Дефолт:** `null`
- Возврат: {number}

Возвращает количество `bytesRead`.

Аналогично приведенному выше `fs.readSync` функция, эта версия принимает необязательный `options` объект. Если нет `options` указан объект, он будет по умолчанию с указанными выше значениями.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback).

### `fs.readvSync(fd, buffers[, position])`

<!-- YAML
added:
 - v13.13.0
 - v12.17.0
-->

- `fd` {целое число}
- `buffers` {ArrayBufferView \[]}
- `position` {целое число}
- Возвращает: {число} количество прочитанных байтов.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.readv()`](#fsreadvfd-buffers-position-callback).

### `fs.realpathSync(path[, options])`

<!-- YAML
added: v0.1.31
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/13028
    description: Pipe/Socket resolve support was added.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7899
    description: Calling `realpathSync` now works again for various edge cases
                 on Windows.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/3594
    description: The `cache` parameter was removed.
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возвращает: {строка | буфер}

Возвращает разрешенный путь.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.realpath()`](#fsrealpathpath-options-callback).

### `fs.realpathSync.native(path[, options])`

<!-- YAML
added: v9.2.0
-->

- `path` {строка | Буфер | URL}
- `options` {строка | Объект}
  - `encoding` {нить} **Дефолт:** `'utf8'`
- Возвращает: {строка | буфер}

Синхронный реальный путь (3).

Поддерживаются только пути, которые можно преобразовать в строки UTF8.

Необязательный `options` аргумент может быть строкой, определяющей кодировку, или объектом с `encoding` свойство, определяющее кодировку символов, используемую для возвращаемого пути. Если `encoding` установлен на `'buffer'`, возвращенный путь будет передан как объект {Buffer}.

В Linux, когда Node.js связан с musl libc, файловая система procfs должна быть смонтирована на `/proc` чтобы эта функция работала. Glibc не имеет этого ограничения.

### `fs.renameSync(oldPath, newPath)`

<!-- YAML
added: v0.1.21
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `oldPath` and `newPath` parameters can be WHATWG `URL`
                 objects using `file:` protocol. Support is currently still
                 *experimental*.
-->

- `oldPath` {строка | Буфер | URL}
- `newPath` {строка | Буфер | URL}

Переименовывает файл из `oldPath` к `newPath`. Возврат `undefined`.

Дополнительную информацию см. В документации POSIX rename (2).

### `fs.rmdirSync(path[, options])`

<!-- YAML
added: v0.1.21
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37216
    description: "Using `fs.rmdirSync(path, { recursive: true })` on a `path`
                 that is a file is no longer permitted and results in an
                 `ENOENT` error on Windows and an `ENOTDIR` error on POSIX."
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37216
    description: "Using `fs.rmdirSync(path, { recursive: true })` on a `path`
                 that does not exist is no longer permitted and results in a
                 `ENOENT` error."
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37302
    description: The `recursive` option is deprecated, using it triggers a
                 deprecation warning.
  - version: v14.14.0
    pr-url: https://github.com/nodejs/node/pull/35579
    description: The `recursive` option is deprecated, use `fs.rmSync` instead.
  - version:
     - v13.3.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30644
    description: The `maxBusyTries` option is renamed to `maxRetries`, and its
                 default is 0. The `emfileWait` option has been removed, and
                 `EMFILE` errors use the same retry logic as other errors. The
                 `retryDelay` option is now supported. `ENFILE` errors are now
                 retried.
  - version: v12.10.0
    pr-url: https://github.com/nodejs/node/pull/29168
    description: The `recursive`, `maxBusyTries`, and `emfileWait` options are
                 now supported.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameters can be a WHATWG `URL` object using
                 `file:` protocol.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `maxRetries` {integer} Если `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, или `EPERM` обнаружена ошибка, Node.js повторяет операцию с линейным ожиданием отсрочки `retryDelay` на миллисекунды дольше с каждой попыткой. Этот параметр представляет количество повторных попыток. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `0`.
  - `recursive` {boolean} Если `true`, выполните рекурсивное удаление каталога. В рекурсивном режиме операции повторяются в случае сбоя. **Дефолт:** `false`. **Устарело.**
  - `retryDelay` {integer} Время ожидания между повторными попытками в миллисекундах. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `100`.

Синхронный rmdir (2). Возврат `undefined`.

С использованием `fs.rmdirSync()` в файле (не в каталоге) приводит к `ENOENT` ошибка в Windows и `ENOTDIR` ошибка в POSIX.

Чтобы получить поведение, подобное `rm -rf` Команда Unix, используйте [`fs.rmSync()`](#fsrmsyncpath-options) с опциями `{ recursive: true, force: true }`.

### `fs.rmSync(path[, options])`

<!-- YAML
added: v14.14.0
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `force` {boolean} Когда `true`, исключения будут игнорироваться, если `path` не существует. **Дефолт:** `false`.
  - `maxRetries` {integer} Если `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, или `EPERM` обнаружена ошибка, Node.js повторит операцию с линейным ожиданием отсрочки `retryDelay` на миллисекунды дольше с каждой попыткой. Этот параметр представляет количество повторных попыток. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `0`.
  - `recursive` {boolean} Если `true`, выполните рекурсивное удаление каталога. В рекурсивном режиме операции повторяются в случае сбоя. **Дефолт:** `false`.
  - `retryDelay` {integer} Время ожидания между повторными попытками в миллисекундах. Эта опция игнорируется, если `recursive` вариант нет `true`. **Дефолт:** `100`.

Синхронно удаляет файлы и каталоги (по образцу стандарта POSIX `rm` утилита). Возврат `undefined`.

### `fs.statSync(path[, options])`

<!-- YAML
added: v0.1.21
changes:
  - version:
    - v15.3.0
    - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/33716
    description: Accepts a `throwIfNoEntry` option to specify whether
                 an exception should be thrown if the entry does not exist.
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}
- `options` {Объект}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **Дефолт:** `false`.
  - `throwIfNoEntry` {boolean} Будет ли генерироваться исключение, если запись в файловой системе не существует, вместо возврата `undefined`. **Дефолт:** `true`.
- Возвращает: {fs.Stats}

Получает {fs.Stats} для пути.

### `fs.symlinkSync(target, path[, type])`

<!-- YAML
added: v0.1.31
changes:
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/23724
    description: If the `type` argument is left undefined, Node will autodetect
                 `target` type and automatically select `dir` or `file`.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `target` and `path` parameters can be WHATWG `URL` objects
                 using `file:` protocol. Support is currently still
                 *experimental*.
-->

- `target` {строка | Буфер | URL}
- `path` {строка | Буфер | URL}
- `type` {нить}

Возврат `undefined`.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.symlink()`](#fssymlinktarget-path-type-callback).

### `fs.truncateSync(path[, len])`

<!-- YAML
added: v0.8.6
-->

- `path` {строка | Буфер | URL}
- `len` {целое число} **Дефолт:** `0`

Обрезает файл. Возврат `undefined`. Дескриптор файла также может быть передан в качестве первого аргумента. В этом случае, `fs.ftruncateSync()` называется.

Передача дескриптора файла устарела и может привести к возникновению ошибки в будущем.

### `fs.unlinkSync(path)`

<!-- YAML
added: v0.1.21
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

- `path` {строка | Буфер | URL}

Синхронное отключение (2). Возврат `undefined`.

### `fs.utimesSync(path, atime, mtime)`

<!-- YAML
added: v0.4.2
changes:
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11919
    description: "`NaN`, `Infinity`, and `-Infinity` are no longer valid time
                 specifiers."
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
  - version: v4.1.0
    pr-url: https://github.com/nodejs/node/pull/2387
    description: Numeric strings, `NaN` and `Infinity` are now allowed
                 time specifiers.
-->

- `path` {строка | Буфер | URL}
- `atime` {число | строка | Дата}
- `mtime` {число | строка | Дата}

Возврат `undefined`.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.utimes()`](#fsutimespath-atime-mtime-callback).

### `fs.writeFileSync(file, data[, options])`

<!-- YAML
added: v0.1.29
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `data` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22150
    description: The `data` parameter can now be any `TypedArray` or a
                 `DataView`.
  - version: v7.4.0
    pr-url: https://github.com/nodejs/node/pull/10382
    description: The `data` parameter can now be a `Uint8Array`.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `file` parameter can be a file descriptor now.
-->

- `file` {строка | буфер | URL | целое число} имя файла или дескриптор файла
- `data` {строка | Буфер | TypedArray | DataView | Объект}
- `options` {Объект | строка}
  - `encoding` {строка | ноль} **Дефолт:** `'utf8'`
  - `mode` {целое число} **Дефолт:** `0o666`
  - `flag` {string} См. [поддержка файловой системы `flags`](#file-system-flags). **Дефолт:** `'w'`.

Возврат `undefined`.

Если `data` это простой объект, он должен иметь собственный (не унаследованный) `toString` свойство функции.

В `mode` опция влияет только на вновь созданный файл. Видеть [`fs.open()`](#fsopenpath-flags-mode-callback) Больше подробностей.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.writeFile()`](#fswritefilefile-data-options-callback).

### `fs.writeSync(fd, buffer[, offset[, length[, position]]])`

<!-- YAML
added: v0.1.21
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `buffer` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `buffer` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22150
    description: The `buffer` parameter can now be any `TypedArray` or a
                 `DataView`.
  - version: v7.4.0
    pr-url: https://github.com/nodejs/node/pull/10382
    description: The `buffer` parameter can now be a `Uint8Array`.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/7856
    description: The `offset` and `length` parameters are optional now.
-->

- `fd` {целое число}
- `buffer` {Buffer | TypedArray | DataView | строка | Объект}
- `offset` {целое число}
- `length` {целое число}
- `position` {целое число}
- Возвращает: {число} количество записанных байтов.

Если `buffer` это простой объект, он должен иметь собственный (не унаследованный) `toString` свойство функции.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.write(fd, buffer...)`](#fswritefd-buffer-offset-length-position-callback).

### `fs.writeSync(fd, string[, position[, encoding]])`

<!-- YAML
added: v0.11.5
changes:
  - version: v14.12.0
    pr-url: https://github.com/nodejs/node/pull/34993
    description: The `string` parameter will stringify an object with an
                 explicit `toString` function.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `string` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/7856
    description: The `position` parameter is optional now.
-->

- `fd` {целое число}
- `string` {строка | Объект}
- `position` {целое число}
- `encoding` {нить}
- Возвращает: {число} количество записанных байтов.

Если `string` это простой объект, он должен иметь собственный (не унаследованный) `toString` свойство функции.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.write(fd, string...)`](#fswritefd-string-position-encoding-callback).

### `fs.writevSync(fd, buffers[, position])`

<!-- YAML
added: v12.9.0
-->

- `fd` {целое число}
- `buffers` {ArrayBufferView \[]}
- `position` {целое число}
- Возвращает: {число} количество записанных байтов.

Для получения подробной информации см. Документацию асинхронной версии этого API: [`fs.writev()`](#fswritevfd-buffers-position-callback).

## Общие объекты

Общие объекты используются всеми вариантами API файловой системы (промис, обратный вызов и синхронный).

### Класс: `fs.Dir`

<!-- YAML
added: v12.12.0
-->

Класс, представляющий поток каталога.

Создан [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options), или [`fsPromises.opendir()`](#fspromisesopendirpath-options).

```js
import { opendir } from 'fs/promises';

try {
  const dir = await opendir('./');
  for await (const dirent of dir) console.log(dirent.name);
} catch (err) {
  console.error(err);
}
```

При использовании асинхронного итератора объект {fs.Dir} будет автоматически закрыт после выхода из итератора.

#### `dir.close()`

<!-- YAML
added: v12.12.0
-->

- Возврат: {Промис}

Асинхронно закройте базовый дескриптор ресурса каталога. Последующие чтения приведут к ошибкам.

Возвращается промис, которое будет выполнено после закрытия ресурса.

#### `dir.close(callback)`

<!-- YAML
added: v12.12.0
-->

- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно закройте базовый дескриптор ресурса каталога. Последующие чтения приведут к ошибкам.

В `callback` будет вызываться после закрытия дескриптора ресурса.

#### `dir.closeSync()`

<!-- YAML
added: v12.12.0
-->

Синхронно закройте дескриптор базового ресурса каталога. Последующие чтения приведут к ошибкам.

#### `dir.path`

<!-- YAML
added: v12.12.0
-->

- {нить}

Путь только для чтения к этому каталогу, как было предоставлено [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options), или [`fsPromises.opendir()`](#fspromisesopendirpath-options).

#### `dir.read()`

<!-- YAML
added: v12.12.0
-->

- Возвращает: {Promise}, содержащий {fs.Dirent | null}

Асинхронно прочитать следующую запись каталога через readdir (3) как {fs.Dirent}.

Возвращается промис, которое будет разрешено с помощью {fs.Dirent}, или `null` если в каталоге больше нет записей для чтения.

Записи каталога, возвращаемые этой функцией, не имеют определенного порядка, как это предусмотрено базовыми механизмами каталогов операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут не включаться в результаты итерации.

#### `dir.read(callback)`

<!-- YAML
added: v12.12.0
-->

- `callback` {Функция}
  - `err` {Ошибка}
  - `dirent` {fs.Dirent | null}

Асинхронно прочитать следующую запись каталога через readdir (3) как {fs.Dirent}.

После завершения чтения `callback` будет вызываться с {fs.Dirent}, или `null` если в каталоге больше нет записей для чтения.

Записи каталога, возвращаемые этой функцией, не имеют определенного порядка, как это предусмотрено базовыми механизмами каталогов операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут не включаться в результаты итерации.

#### `dir.readSync()`

<!-- YAML
added: v12.12.0
-->

- Возвращает: {fs.Dirent | null}

Синхронно читать следующую запись каталога как {fs.Dirent}. См. Документацию POSIX readdir (3) для получения более подробной информации.

Если в каталоге больше нет записей для чтения, `null` будет возвращен.

Записи каталога, возвращаемые этой функцией, не имеют определенного порядка, как это предусмотрено базовыми механизмами каталогов операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут не включаться в результаты итерации.

#### `dir[Symbol.asyncIterator]()`

<!-- YAML
added: v12.12.0
-->

- Возвращает: {AsyncIterator} из {fs.Dirent}.

Асинхронно выполняет итерацию по каталогу, пока не будут прочитаны все записи. Обратитесь к документации POSIX readdir (3) для получения более подробной информации.

Записи, возвращаемые асинхронным итератором, всегда являются {fs.Dirent}. В `null` дело от `dir.read()` обрабатывается внутри.

См. Пример в {fs.Dir}.

Записи каталога, возвращаемые этим итератором, не имеют определенного порядка, как это предусмотрено базовыми механизмами каталогов операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут не включаться в результаты итерации.

### Класс: `fs.Dirent`

<!-- YAML
added: v10.10.0
-->

Представление записи каталога, которое может быть файлом или подкаталогом в каталоге, полученное при чтении из {fs.Dir}. Запись каталога представляет собой комбинацию пар имени файла и типа файла.

Кроме того, когда [`fs.readdir()`](#fsreaddirpath-options-callback) или [`fs.readdirSync()`](#fsreaddirsyncpath-options) называется с `withFileTypes` опция установлена на `true`, результирующий массив заполняется объектами {fs.Dirent}, а не строками или {Buffer} s.

#### `dirent.isBlockDevice()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает блочное устройство.

#### `dirent.isCharacterDevice()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает символьное устройство.

#### `dirent.isDirectory()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает каталог файловой системы.

#### `dirent.isFIFO()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает канал «первым пришел - первым обслужен» (FIFO).

#### `dirent.isFile()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает обычный файл.

#### `dirent.isSocket()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает сокет.

#### `dirent.isSymbolicLink()`

<!-- YAML
added: v10.10.0
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Dirent} описывает символическую ссылку.

#### `dirent.name`

<!-- YAML
added: v10.10.0
-->

- {строка | буфер}

Имя файла, на который ссылается этот объект {fs.Dirent}. Тип этого значения определяется `options.encoding` перешел к [`fs.readdir()`](#fsreaddirpath-options-callback) или [`fs.readdirSync()`](#fsreaddirsyncpath-options).

### Класс: `fs.FSWatcher`

<!-- YAML
added: v0.5.8
-->

- Расширяет {EventEmitter}

Успешный звонок [`fs.watch()`](#fswatchfilename-options-listener) метод вернет новый объект {fs.FSWatcher}.

Все объекты {fs.FSWatcher} испускают `'change'` событие всякий раз, когда изменяется конкретный наблюдаемый файл.

#### Событие: `'change'`

<!-- YAML
added: v0.5.8
-->

- `eventType` {строка} Тип произошедшего события изменения
- `filename` {string | Buffer} Имя файла, которое изменилось (если актуально / доступно)

Выдается, когда что-то изменяется в наблюдаемом каталоге или файле. Подробнее см. [`fs.watch()`](#fswatchfilename-options-listener).

В `filename` аргумент может не указываться в зависимости от поддержки операционной системы. Если `filename` предоставляется, он будет предоставлен как {Buffer}, если `fs.watch()` называется с его `encoding` опция установлена на `'buffer'`, иначе `filename` будет строкой UTF-8.

```js
import { watch } from 'fs';
// Example when handled through fs.watch() listener
watch(
  './tmp',
  { encoding: 'buffer' },
  (eventType, filename) => {
    if (filename) {
      console.log(filename);
      // Prints: <Buffer ...>
    }
  }
);
```

#### Событие: `'close'`

<!-- YAML
added: v10.0.0
-->

Выдается, когда наблюдатель перестает следить за изменениями. Закрытый объект {fs.FSWatcher} больше не может использоваться в обработчике событий.

#### Событие: `'error'`

<!-- YAML
added: v0.5.8
-->

- `error` {Ошибка}

Выдается, когда при просмотре файла возникает ошибка. Ошибочный объект {fs.FSWatcher} больше не может использоваться в обработчике событий.

#### `watcher.close()`

<!-- YAML
added: v0.5.8
-->

Прекратите следить за изменениями в данном {fs.FSWatcher}. После остановки объект {fs.FSWatcher} больше не может использоваться.

#### `watcher.ref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

- Возвращает: {fs.FSWatcher}

При вызове запрашивает, чтобы цикл событий Node.js _нет_ выйти, пока активен {fs.FSWatcher}. Вызов `watcher.ref()` несколько раз не повлияет.

По умолчанию все объекты {fs.FSWatcher} "обновлены", поэтому обычно нет необходимости вызывать `watcher.ref()` пока не `watcher.unref()` был вызван ранее.

#### `watcher.unref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

- Возвращает: {fs.FSWatcher}

При вызове активному объекту {fs.FSWatcher} не требуется, чтобы цикл обработки событий Node.js оставался активным. Если нет других действий, поддерживающих цикл событий, процесс может завершиться до того, как будет вызван обратный вызов объекта {fs.FSWatcher}. Вызов `watcher.unref()` несколько раз не повлияет.

### Класс: `fs.StatWatcher`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

- Расширяет {EventEmitter}

Успешный звонок `fs.watchFile()` метод вернет новый объект {fs.StatWatcher}.

#### `watcher.ref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

- Возвращает: {fs.StatWatcher}

При вызове запрашивает, чтобы цикл событий Node.js _нет_ выйти, пока активен {fs.StatWatcher}. Вызов `watcher.ref()` несколько раз не повлияет.

По умолчанию все объекты {fs.StatWatcher} "обновлены", поэтому обычно нет необходимости вызывать `watcher.ref()` пока не `watcher.unref()` был вызван ранее.

#### `watcher.unref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

- Возвращает: {fs.StatWatcher}

При вызове активному объекту {fs.StatWatcher} не требуется, чтобы цикл событий Node.js оставался активным. Если нет других действий, поддерживающих цикл событий, процесс может завершиться до того, как будет вызван обратный вызов объекта {fs.StatWatcher}. Вызов `watcher.unref()` несколько раз не повлияет.

### Класс: `fs.ReadStream`

<!-- YAML
added: v0.1.93
-->

- Расширяется: {stream.Readable}

Экземпляры {fs.ReadStream} создаются и возвращаются с использованием [`fs.createReadStream()`](#fscreatereadstreampath-options) функция.

#### Событие: `'close'`

<!-- YAML
added: v0.1.93
-->

Генерируется, когда базовый дескриптор файла {fs.ReadStream} закрыт.

#### Событие: `'open'`

<!-- YAML
added: v0.1.93
-->

- `fd` {integer} Целочисленный файловый дескриптор, используемый {fs.ReadStream}.

Генерируется при открытии дескриптора файла {fs.ReadStream}.

#### Событие: `'ready'`

<!-- YAML
added: v9.11.0
-->

Генерируется, когда {fs.ReadStream} готов к использованию.

Срабатывает сразу после `'open'`.

#### `readStream.bytesRead`

<!-- YAML
added: v6.4.0
-->

- {количество}

Количество байтов, которые были прочитаны на данный момент.

#### `readStream.path`

<!-- YAML
added: v0.1.93
-->

- {строка | буфер}

Путь к файлу, из которого выполняется чтение потока, как указано в первом аргументе для `fs.createReadStream()`. Если `path` передается как строка, затем `readStream.path` будет строкой. Если `path` передается как {Buffer}, затем `readStream.path` будет {Buffer}.

#### `readStream.pending`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

- {логический}

Это свойство `true` если базовый файл еще не был открыт, т.е. до `'ready'` событие испускается.

### Класс: `fs.Stats`

<!-- YAML
added: v0.1.21
changes:
  - version: v8.1.0
    pr-url: https://github.com/nodejs/node/pull/13173
    description: Added times as numbers.
-->

Объект {fs.Stats} предоставляет информацию о файле.

Объекты, возвращенные из [`fs.stat()`](#fsstatpath-options-callback), [`fs.lstat()`](#fslstatpath-options-callback) а также [`fs.fstat()`](#fsfstatfd-options-callback) и их синхронные аналоги относятся к этому типу. Если `bigint` в `options` передано этим методам верно, числовые значения будут `bigint` вместо того `number`, и объект будет содержать дополнительные свойства с точностью до наносекунды с суффиксом `Ns`.

```console
Stats {
  dev: 2114,
  ino: 48064969,
  mode: 33188,
  nlink: 1,
  uid: 85,
  gid: 100,
  rdev: 0,
  size: 527,
  blksize: 4096,
  blocks: 8,
  atimeMs: 1318289051000.1,
  mtimeMs: 1318289051000.1,
  ctimeMs: 1318289051000.1,
  birthtimeMs: 1318289051000.1,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT,
  birthtime: Mon, 10 Oct 2011 23:24:11 GMT }
```

`bigint` версия:

```console
BigIntStats {
  dev: 2114n,
  ino: 48064969n,
  mode: 33188n,
  nlink: 1n,
  uid: 85n,
  gid: 100n,
  rdev: 0n,
  size: 527n,
  blksize: 4096n,
  blocks: 8n,
  atimeMs: 1318289051000n,
  mtimeMs: 1318289051000n,
  ctimeMs: 1318289051000n,
  birthtimeMs: 1318289051000n,
  atimeNs: 1318289051000000000n,
  mtimeNs: 1318289051000000000n,
  ctimeNs: 1318289051000000000n,
  birthtimeNs: 1318289051000000000n,
  atime: Mon, 10 Oct 2011 23:24:11 GMT,
  mtime: Mon, 10 Oct 2011 23:24:11 GMT,
  ctime: Mon, 10 Oct 2011 23:24:11 GMT,
  birthtime: Mon, 10 Oct 2011 23:24:11 GMT }
```

#### `stats.isBlockDevice()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает блочное устройство.

#### `stats.isCharacterDevice()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает символьное устройство.

#### `stats.isDirectory()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает каталог файловой системы.

Если объект {fs.Stats} был получен из [`fs.lstat()`](#fslstatpath-options-callback), этот метод всегда будет возвращать `false`. Это потому что [`fs.lstat()`](#fslstatpath-options-callback) возвращает информацию о самой символической ссылке, а не о пути, по которому она разрешается.

#### `stats.isFIFO()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает канал «первым пришел - первым обслужен» (FIFO).

#### `stats.isFile()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает обычный файл.

#### `stats.isSocket()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает сокет.

#### `stats.isSymbolicLink()`

<!-- YAML
added: v0.1.10
-->

- Возвращает: {логическое}

Возврат `true` если объект {fs.Stats} описывает символическую ссылку.

Этот метод действителен только при использовании [`fs.lstat()`](#fslstatpath-options-callback).

#### `stats.dev`

- {number | bigint}

Числовой идентификатор устройства, содержащего файл.

#### `stats.ino`

- {number | bigint}

Номер "Inode" файла, относящийся к файловой системе.

#### `stats.mode`

- {number | bigint}

Битовое поле, описывающее тип и режим файла.

#### `stats.nlink`

- {number | bigint}

Количество жестких ссылок, существующих для файла.

#### `stats.uid`

- {number | bigint}

Числовой идентификатор пользователя, владеющего файлом (POSIX).

#### `stats.gid`

- {number | bigint}

Числовой идентификатор группы, которой принадлежит файл (POSIX).

#### `stats.rdev`

- {number | bigint}

Числовой идентификатор устройства, если файл представляет устройство.

#### `stats.size`

- {number | bigint}

Размер файла в байтах.

#### `stats.blksize`

- {number | bigint}

Размер блока файловой системы для операций ввода-вывода.

#### `stats.blocks`

- {number | bigint}

Количество блоков, выделенных для этого файла.

#### `stats.atimeMs`

<!-- YAML
added: v8.1.0
-->

- {number | bigint}

Отметка времени, указывающая последний раз доступ к этому файлу, выраженная в миллисекундах с момента POSIX Epoch.

#### `stats.mtimeMs`

<!-- YAML
added: v8.1.0
-->

- {number | bigint}

Отметка времени, указывающая последний раз, когда этот файл был изменен, выраженный в миллисекундах с момента POSIX Epoch.

#### `stats.ctimeMs`

<!-- YAML
added: v8.1.0
-->

- {number | bigint}

Отметка времени, указывающая последний раз, когда статус файла был изменен, выраженный в миллисекундах с момента POSIX Epoch.

#### `stats.birthtimeMs`

<!-- YAML
added: v8.1.0
-->

- {number | bigint}

Метка времени, указывающая время создания этого файла, выраженное в миллисекундах, начиная с эпохи POSIX.

#### `stats.atimeNs`

<!-- YAML
added: v12.10.0
-->

- {bigint}

Присутствует только когда `bigint: true` передается в метод, который генерирует объект. Отметка времени, указывающая последний раз доступ к этому файлу, выраженная в наносекундах с момента POSIX Epoch.

#### `stats.mtimeNs`

<!-- YAML
added: v12.10.0
-->

- {bigint}

Присутствует только когда `bigint: true` передается в метод, который генерирует объект. Отметка времени, указывающая, когда в последний раз этот файл был изменен, выраженная в наносекундах с момента POSIX Epoch.

#### `stats.ctimeNs`

<!-- YAML
added: v12.10.0
-->

- {bigint}

Присутствует только когда `bigint: true` передается в метод, который генерирует объект. Отметка времени, указывающая последний раз, когда статус файла был изменен, выраженный в наносекундах с момента POSIX Epoch.

#### `stats.birthtimeNs`

<!-- YAML
added: v12.10.0
-->

- {bigint}

Присутствует только когда `bigint: true` передается в метод, который генерирует объект. Метка времени, указывающая время создания этого файла, выраженное в наносекундах, начиная с эпохи POSIX.

#### `stats.atime`

<!-- YAML
added: v0.11.13
-->

- {Дата}

Отметка времени, указывающая время последнего доступа к этому файлу.

#### `stats.mtime`

<!-- YAML
added: v0.11.13
-->

- {Дата}

Отметка времени, указывающая время последнего изменения этого файла.

#### `stats.ctime`

<!-- YAML
added: v0.11.13
-->

- {Дата}

Отметка времени, указывающая последний раз, когда статус файла был изменен.

#### `stats.birthtime`

<!-- YAML
added: v0.11.13
-->

- {Дата}

Отметка времени, указывающая время создания этого файла.

#### Значения времени статистики

В `atimeMs`, `mtimeMs`, `ctimeMs`, `birthtimeMs` Свойства - это числовые значения, которые содержат соответствующее время в миллисекундах. Их точность зависит от платформы. Когда `bigint: true` передается в метод, который генерирует объект, свойства будут [Bigints](https://tc39.github.io/proposal-bigint), иначе они будут [числа](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type).

В `atimeNs`, `mtimeNs`, `ctimeNs`, `birthtimeNs` свойства [Bigints](https://tc39.github.io/proposal-bigint) которые содержат соответствующие времена в наносекундах. Они присутствуют только тогда, когда `bigint: true` передается в метод, который генерирует объект. Их точность зависит от платформы.

`atime`, `mtime`, `ctime`, а также `birthtime` находятся [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) альтернативные представления объекта в разные времена. В `Date` и числовые значения не связаны. Назначение нового числового значения или изменение `Date` значение, не будет отражено в соответствующем альтернативном представлении.

Время в объекте stat имеет следующую семантику:

- `atime` «Время доступа»: время последнего доступа к данным файла. Изменяется системными вызовами mknod (2), utimes (2) и read (2).
- `mtime` «Время изменения»: время последнего изменения данных файла. Изменяется системными вызовами mknod (2), utimes (2) и write (2).
- `ctime` «Время изменения»: время последнего изменения статуса файла (изменение данных inode). Изменено системными вызовами chmod (2), chown (2), link (2), mknod (2), rename (2), unlink (2), utimes (2), read (2) и write (2) .
- `birthtime` «Время рождения»: время создания файла. Устанавливается один раз при создании файла. В файловых системах, где время рождения недоступно, это поле может содержать либо `ctime` или `1970-01-01T00:00Z` (т.е. временная метка эпохи Unix `0`). Это значение может быть больше, чем `atime` или `mtime` в этом случае. В Darwin и других вариантах FreeBSD также установите, если `atime` явно устанавливается на более раннее значение, чем текущее `birthtime` с помощью системного вызова utimes (2).

До Node.js 0.12 `ctime` провел `birthtime` в системах Windows. По состоянию на 0,12 `ctime` это не «время создания», и в системах Unix его никогда не было.

### Класс: `fs.WriteStream`

<!-- YAML
added: v0.1.93
-->

- Расширяет {stream.Writable}

Экземпляры {fs.WriteStream} создаются и возвращаются с использованием [`fs.createWriteStream()`](#fscreatewritestreampath-options) функция.

#### Событие: `'close'`

<!-- YAML
added: v0.1.93
-->

Генерируется, когда базовый дескриптор файла {fs.WriteStream} закрыт.

#### Событие: `'open'`

<!-- YAML
added: v0.1.93
-->

- `fd` {integer} Целочисленный файловый дескриптор, используемый {fs.WriteStream}.

Генерируется при открытии файла {fs.WriteStream}.

#### Событие: `'ready'`

<!-- YAML
added: v9.11.0
-->

Генерируется, когда {fs.WriteStream} готов к использованию.

Срабатывает сразу после `'open'`.

#### `writeStream.bytesWritten`

<!-- YAML
added: v0.4.7
-->

Количество байтов, записанных на данный момент. Не включает данные, которые все еще находятся в очереди на запись.

#### `writeStream.close([callback])`

<!-- YAML
added: v0.9.4
-->

- `callback` {Функция}
  - `err` {Ошибка}

Закрывается `writeStream`. При желании принимает обратный вызов, который будет выполнен после того, как `writeStream` закрыто.

#### `writeStream.path`

<!-- YAML
added: v0.1.93
-->

Путь к файлу, в который записывается поток, как указано в первом аргументе для [`fs.createWriteStream()`](#fscreatewritestreampath-options). Если `path` передается как строка, затем `writeStream.path` будет строкой. Если `path` передается как {Buffer}, затем `writeStream.path` будет {Buffer}.

#### `writeStream.pending`

<!-- YAML
added: v11.2.0
-->

- {логический}

Это свойство `true` если базовый файл еще не был открыт, т.е. до `'ready'` событие испускается.

### `fs.constants`

- {Объект}

Возвращает объект, содержащий часто используемые константы для операций файловой системы.

#### Константы FS

Следующие константы экспортируются `fs.constants`.

Не все константы будут доступны в каждой операционной системе.

Чтобы использовать более одной константы, используйте побитовое ИЛИ `|` оператор.

Пример:

```js
import { open, constants } from 'fs';

const { O_RDWR, O_CREAT, O_EXCL } = constants;

open(
  '/path/to/my/file',
  O_RDWR | O_CREAT | O_EXCL,
  (err, fd) => {
    // ...
  }
);
```

##### Константы доступа к файлам

Следующие константы предназначены для использования с [`fs.access()`](#fsaccesspath-mode-callback).

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>F_OK</code></td>
    <td>Flag indicating that the file is visible to the calling process.
     This is useful for determining if a file exists, but says nothing
     about <code>rwx</code> permissions. Default if no mode is specified.</td>
  </tr>
  <tr>
    <td><code>R_OK</code></td>
    <td>Flag indicating that the file can be read by the calling process.</td>
  </tr>
  <tr>
    <td><code>W_OK</code></td>
    <td>Flag indicating that the file can be written by the calling
    process.</td>
  </tr>
  <tr>
    <td><code>X_OK</code></td>
    <td>Flag indicating that the file can be executed by the calling
    process. This has no effect on Windows
    (will behave like <code>fs.constants.F_OK</code>).</td>
  </tr>
</table>

##### Константы копирования файлов

Следующие константы предназначены для использования с [`fs.copyFile()`](#fscopyfilesrc-dest-mode-callback).

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>COPYFILE_EXCL</code></td>
    <td>If present, the copy operation will fail with an error if the
    destination path already exists.</td>
  </tr>
  <tr>
    <td><code>COPYFILE_FICLONE</code></td>
    <td>If present, the copy operation will attempt to create a
    copy-on-write reflink. If the underlying platform does not support
    copy-on-write, then a fallback copy mechanism is used.</td>
  </tr>
  <tr>
    <td><code>COPYFILE_FICLONE_FORCE</code></td>
    <td>If present, the copy operation will attempt to create a
    copy-on-write reflink. If the underlying platform does not support
    copy-on-write, then the operation will fail with an error.</td>
  </tr>
</table>

##### Константы открытия файлов

Следующие константы предназначены для использования с `fs.open()`.

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>O_RDONLY</code></td>
    <td>Flag indicating to open a file for read-only access.</td>
  </tr>
  <tr>
    <td><code>O_WRONLY</code></td>
    <td>Flag indicating to open a file for write-only access.</td>
  </tr>
  <tr>
    <td><code>O_RDWR</code></td>
    <td>Flag indicating to open a file for read-write access.</td>
  </tr>
  <tr>
    <td><code>O_CREAT</code></td>
    <td>Flag indicating to create the file if it does not already exist.</td>
  </tr>
  <tr>
    <td><code>O_EXCL</code></td>
    <td>Flag indicating that opening a file should fail if the
    <code>O_CREAT</code> flag is set and the file already exists.</td>
  </tr>
  <tr>
    <td><code>O_NOCTTY</code></td>
    <td>Flag indicating that if path identifies a terminal device, opening the
    path shall not cause that terminal to become the controlling terminal for
    the process (if the process does not already have one).</td>
  </tr>
  <tr>
    <td><code>O_TRUNC</code></td>
    <td>Flag indicating that if the file exists and is a regular file, and the
    file is opened successfully for write access, its length shall be truncated
    to zero.</td>
  </tr>
  <tr>
    <td><code>O_APPEND</code></td>
    <td>Flag indicating that data will be appended to the end of the file.</td>
  </tr>
  <tr>
    <td><code>O_DIRECTORY</code></td>
    <td>Flag indicating that the open should fail if the path is not a
    directory.</td>
  </tr>
  <tr>
  <td><code>O_NOATIME</code></td>
    <td>Flag indicating reading accesses to the file system will no longer
    result in an update to the <code>atime</code> information associated with
    the file. This flag is available on Linux operating systems only.</td>
  </tr>
  <tr>
    <td><code>O_NOFOLLOW</code></td>
    <td>Flag indicating that the open should fail if the path is a symbolic
    link.</td>
  </tr>
  <tr>
    <td><code>O_SYNC</code></td>
    <td>Flag indicating that the file is opened for synchronized I/O with write
    operations waiting for file integrity.</td>
  </tr>
  <tr>
    <td><code>O_DSYNC</code></td>
    <td>Flag indicating that the file is opened for synchronized I/O with write
    operations waiting for data integrity.</td>
  </tr>
  <tr>
    <td><code>O_SYMLINK</code></td>
    <td>Flag indicating to open the symbolic link itself rather than the
    resource it is pointing to.</td>
  </tr>
  <tr>
    <td><code>O_DIRECT</code></td>
    <td>When set, an attempt will be made to minimize caching effects of file
    I/O.</td>
  </tr>
  <tr>
    <td><code>O_NONBLOCK</code></td>
    <td>Flag indicating to open the file in nonblocking mode when possible.</td>
  </tr>
  <tr>
    <td><code>UV_FS_O_FILEMAP</code></td>
    <td>When set, a memory file mapping is used to access the file. This flag
    is available on Windows operating systems only. On other operating systems,
    this flag is ignored.</td>
  </tr>
</table>

##### Константы типов файлов

Следующие константы предназначены для использования с объектом {fs.Stats} `mode` свойство для определения типа файла.

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>S_IFMT</code></td>
    <td>Bit mask used to extract the file type code.</td>
  </tr>
  <tr>
    <td><code>S_IFREG</code></td>
    <td>File type constant for a regular file.</td>
  </tr>
  <tr>
    <td><code>S_IFDIR</code></td>
    <td>File type constant for a directory.</td>
  </tr>
  <tr>
    <td><code>S_IFCHR</code></td>
    <td>File type constant for a character-oriented device file.</td>
  </tr>
  <tr>
    <td><code>S_IFBLK</code></td>
    <td>File type constant for a block-oriented device file.</td>
  </tr>
  <tr>
    <td><code>S_IFIFO</code></td>
    <td>File type constant for a FIFO/pipe.</td>
  </tr>
  <tr>
    <td><code>S_IFLNK</code></td>
    <td>File type constant for a symbolic link.</td>
  </tr>
  <tr>
    <td><code>S_IFSOCK</code></td>
    <td>File type constant for a socket.</td>
  </tr>
</table>

##### Константы файлового режима

Следующие константы предназначены для использования с объектом {fs.Stats} `mode` свойство для определения прав доступа к файлу.

<table>
  <tr>
    <th>Constant</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>S_IRWXU</code></td>
    <td>File mode indicating readable, writable, and executable by owner.</td>
  </tr>
  <tr>
    <td><code>S_IRUSR</code></td>
    <td>File mode indicating readable by owner.</td>
  </tr>
  <tr>
    <td><code>S_IWUSR</code></td>
    <td>File mode indicating writable by owner.</td>
  </tr>
  <tr>
    <td><code>S_IXUSR</code></td>
    <td>File mode indicating executable by owner.</td>
  </tr>
  <tr>
    <td><code>S_IRWXG</code></td>
    <td>File mode indicating readable, writable, and executable by group.</td>
  </tr>
  <tr>
    <td><code>S_IRGRP</code></td>
    <td>File mode indicating readable by group.</td>
  </tr>
  <tr>
    <td><code>S_IWGRP</code></td>
    <td>File mode indicating writable by group.</td>
  </tr>
  <tr>
    <td><code>S_IXGRP</code></td>
    <td>File mode indicating executable by group.</td>
  </tr>
  <tr>
    <td><code>S_IRWXO</code></td>
    <td>File mode indicating readable, writable, and executable by others.</td>
  </tr>
  <tr>
    <td><code>S_IROTH</code></td>
    <td>File mode indicating readable by others.</td>
  </tr>
  <tr>
    <td><code>S_IWOTH</code></td>
    <td>File mode indicating writable by others.</td>
  </tr>
  <tr>
    <td><code>S_IXOTH</code></td>
    <td>File mode indicating executable by others.</td>
  </tr>
</table>

## Примечания

### Упорядочивание обратных вызовов и операций на основе промисов

Поскольку они выполняются асинхронно базовым пулом потоков, при использовании методов обратного вызова или методов на основе промисов не существует гарантированного порядка.

Например, следующее может привести к ошибке, потому что `fs.stat()` операция может завершиться до `fs.rename()` операции:

```js
fs.rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  console.log('renamed complete');
});
fs.stat('/tmp/world', (err, stats) => {
  if (err) throw err;
  console.log(`stats: ${JSON.stringify(stats)}`);
});
```

Важно правильно упорядочить операции, ожидая результатов одной перед вызовом другой:

```js
import { rename, stat } from 'fs/promises';

const from = '/tmp/hello';
const to = '/tmp/world';

try {
  await rename(from, to);
  const stats = await stat(to);
  console.log(`stats: ${JSON.stringify(stats)}`);
} catch (error) {
  console.error('there was an error:', error.message);
}
```

```js
const { rename, stat } = require('fs/promises');

(async function (from, to) {
  try {
    await rename(from, to);
    const stats = await stat(to);
    console.log(`stats: ${JSON.stringify(stats)}`);
  } catch (error) {
    console.error('there was an error:', error.message);
  }
})('/tmp/hello', '/tmp/world');
```

Или при использовании API обратного вызова переместите `fs.stat()` вызов в обратный вызов `fs.rename()` операции:

```js
import { rename, stat } from 'fs';

rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  stat('/tmp/world', (err, stats) => {
    if (err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
  });
});
```

```js
const { rename, stat } = require('fs/promises');

rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  stat('/tmp/world', (err, stats) => {
    if (err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
  });
});
```

### Пути к файлам

Самый `fs` операции принимают пути к файлам, которые могут быть указаны в форме строки, объекта {Buffer} или {URL} с использованием `file:` протокол.

#### Строковые пути

Пути к строкам интерпретируются как последовательности символов UTF-8, идентифицирующие абсолютное или относительное имя файла. Относительные пути будут разрешены относительно текущего рабочего каталога, как определено вызовом `process.cwd()`.

Пример использования абсолютного пути в POSIX:

```js
import { open } from 'fs/promises';

let fd;
try {
  fd = await open('/open/some/file.txt', 'r');
  // Do something with the file
} finally {
  await fd.close();
}
```

Пример использования относительного пути в POSIX (относительно `process.cwd()`):

```js
import { open } from 'fs/promises';

let fd;
try {
  fd = await open('file.txt', 'r');
  // Do something with the file
} finally {
  await fd.close();
}
```

#### Пути URL-адресов файлов

<!-- YAML
added: v7.6.0
-->

Для большинства `fs` функции модуля, `path` или `filename` аргумент может быть передан как объект {URL} с помощью `file:` протокол.

```js
import { readFileSync } from 'fs';

readFileSync(new URL('file:///tmp/hello'));
```

`file:` URL-адреса всегда являются абсолютными путями.

##### Особенности платформы

В Windows `file:` {URL} с именем хоста преобразуются в пути UNC, а `file:` {URL} с буквами дисков преобразуются в локальные абсолютные пути. `file:` {URL} без имени хоста или буквы диска приведет к ошибке:

```js
import { readFileSync } from 'fs';
// On Windows :

// - WHATWG file URLs with hostname convert to UNC path
// file://hostname/p/a/t/h/file => \\hostname\p\a\t\h\file
readFileSync(new URL('file://hostname/p/a/t/h/file'));

// - WHATWG file URLs with drive letters convert to absolute path
// file:///C:/tmp/hello => C:\tmp\hello
readFileSync(new URL('file:///C:/tmp/hello'));

// - WHATWG file URLs without hostname must have a drive letters
readFileSync(
  new URL('file:///notdriveletter/p/a/t/h/file')
);
readFileSync(new URL('file:///c/p/a/t/h/file'));
// TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must be absolute
```

`file:` {URL} с буквами дисков должны использовать `:` как разделитель сразу после буквы диска. Использование другого разделителя приведет к ошибке.

На всех других платформах `file:` {URL} с именем хоста не поддерживаются и приведут к ошибке:

```js
import { readFileSync } from 'fs';
// On other platforms:

// - WHATWG file URLs with hostname are unsupported
// file://hostname/p/a/t/h/file => throw!
readFileSync(new URL('file://hostname/p/a/t/h/file'));
// TypeError [ERR_INVALID_FILE_URL_PATH]: must be absolute

// - WHATWG file URLs convert to absolute path
// file:///tmp/hello => /tmp/hello
readFileSync(new URL('file:///tmp/hello'));
```

А `file:` {URL} с закодированными символами косой черты приведет к ошибке на всех платформах:

```js
import { readFileSync } from 'fs';

// On Windows
readFileSync(new URL('file:///C:/p/a/t/h/%2F'));
readFileSync(new URL('file:///C:/p/a/t/h/%2f'));
/* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
\ or / characters */

// On POSIX
readFileSync(new URL('file:///p/a/t/h/%2F'));
readFileSync(new URL('file:///p/a/t/h/%2f'));
/* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
/ characters */
```

В Windows `file:` Кодирование обратной косой черты в {URL} приведет к ошибке:

```js
import { readFileSync } from 'fs';

// On Windows
readFileSync(new URL('file:///C:/path/%5C'));
readFileSync(new URL('file:///C:/path/%5c'));
/* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
\ or / characters */
```

#### Буферные пути

Пути, указанные с помощью {Buffer}, полезны в первую очередь в некоторых операционных системах POSIX, которые обрабатывают пути к файлам как непрозрачные последовательности байтов. В таких системах один путь к файлу может содержать подпоследовательности, использующие несколько кодировок символов. Как и в случае строковых путей, пути {Buffer} могут быть относительными или абсолютными:

Пример использования абсолютного пути в POSIX:

```js
import { open } from 'fs/promises';
import { Buffer } from 'buffer';

let fd;
try {
  fd = await open(Buffer.from('/open/some/file.txt'), 'r');
  // Do something with the file
} finally {
  await fd.close();
}
```

#### Рабочие каталоги на диске в Windows

В Windows Node.js следует концепции рабочего каталога для каждого диска. Такое поведение наблюдается при использовании пути к диску без обратной косой черты. Например `fs.readdirSync('C:\\')` потенциально может вернуть другой результат, чем `fs.readdirSync('C:')`. Для получения дополнительной информации см. [эта страница MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#fully-qualified-vs-relative-paths).

### Дескрипторы файлов

В системах POSIX для каждого процесса ядро поддерживает таблицу открытых в данный момент файлов и ресурсов. Каждому открытому файлу присваивается простой числовой идентификатор, называемый _дескриптор файла_. На системном уровне все операции с файловой системой используют эти файловые дескрипторы для идентификации и отслеживания каждого конкретного файла. В системах Windows используется другой, но концептуально схожий механизм отслеживания ресурсов. Чтобы упростить пользователям задачу, Node.js абстрагирует различия между операционными системами и назначает всем открытым файлам числовой файловый дескриптор.

На основе обратного вызова `fs.open()`, и синхронный `fs.openSync()` методы открывают файл и выделяют новый файловый дескриптор. После выделения файловый дескриптор может использоваться для чтения, записи данных или запроса информации о файле.

Операционные системы ограничивают количество файловых дескрипторов, которые могут быть открыты в любой момент времени, поэтому очень важно закрыть дескриптор после завершения операций. Невыполнение этого требования приведет к утечке памяти, что в конечном итоге приведет к сбою приложения.

```js
import { open, close, fstat } from 'fs';

function closeFd(fd) {
  close(fd, (err) => {
    if (err) throw err;
  });
}

open('/open/some/file.txt', 'r', (err, fd) => {
  if (err) throw err;
  try {
    fstat(fd, (err, stat) => {
      if (err) {
        closeFd(fd);
        throw err;
      }

      // use stat

      closeFd(fd);
    });
  } catch (err) {
    closeFd(fd);
    throw err;
  }
});
```

API на основе промисов используют объект {FileHandle} вместо числового дескриптора файла. Эти объекты лучше управляются системой, чтобы не допустить утечки ресурсов. Однако по-прежнему требуется, чтобы они закрывались после завершения операций:

```js
import { open } from 'fs/promises';

let file;
try {
  file = await open('/open/some/file.txt', 'r');
  const stat = await file.stat();
  // use stat
} finally {
  await file.close();
}
```

### Использование Threadpool

Все API-интерфейсы файловой системы на основе обратных вызовов и промисов (за исключением `fs.FSWatcher()`) используйте пул потоков libuv. Это может иметь неожиданные и отрицательные последствия для производительности некоторых приложений. Смотрите [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) документацию для получения дополнительной информации.

### Флаги файловой системы

Следующие флаги доступны везде, где `flag` option принимает строку.

- `'a'`: Открыть файл для добавления. Если файл не существует, он создается.

- `'ax'`: Аналогично `'a'` но терпит неудачу, если путь существует.

- `'a+'`: Открыть файл для чтения и добавления. Если файл не существует, он создается.

- `'ax+'`: Аналогично `'a+'` но терпит неудачу, если путь существует.

- `'as'`: Открыть файл для добавления в синхронном режиме. Если файл не существует, он создается.

- `'as+'`: Открыть файл для чтения и добавления в синхронном режиме. Если файл не существует, он создается.

- `'r'`: Открыть файл для чтения. Исключение возникает, если файл не существует.

- `'r+'`: Открыть файл для чтения и записи. Исключение возникает, если файл не существует.

- `'rs+'`: Открыть файл для чтения и записи в синхронном режиме. Указывает операционной системе обходить кеш локальной файловой системы.

  Это в первую очередь полезно для открытия файлов при монтировании NFS, поскольку позволяет пропустить потенциально устаревший локальный кеш. Он очень сильно влияет на производительность ввода-вывода, поэтому использование этого флага не рекомендуется, если в нем нет необходимости.

  Это не поворачивается `fs.open()` или `fsPromises.open()` в синхронный блокирующий вызов. Если требуется синхронная работа, что-то вроде `fs.openSync()` должен быть использован.

- `'w'`: Открыть файл для записи. Файл создается (если он не существует) или усекается (если он существует).

- `'wx'`: Аналогично `'w'` но терпит неудачу, если путь существует.

- `'w+'`: Открыть файл для чтения и записи. Файл создается (если он не существует) или усекается (если он существует).

- `'wx+'`: Аналогично `'w+'` но терпит неудачу, если путь существует.

`flag` также может быть числом, задокументированным open (2); часто используемые константы доступны из `fs.constants`. В Windows флаги переводятся в их эквивалентные, где это применимо, например `O_WRONLY` к `FILE_GENERIC_WRITE`, или `O_EXCL|O_CREAT` к `CREATE_NEW`, как принято `CreateFileW`.

Эксклюзивный флаг `'x'` (`O_EXCL` флаг в open (2)) заставляет операцию возвращать ошибку, если путь уже существует. В POSIX, если путь является символической ссылкой, используя `O_EXCL` возвращает ошибку, даже если ссылка ведет на несуществующий путь. Флаг эксклюзивности может не работать с сетевыми файловыми системами.

В Linux позиционная запись не работает, когда файл открывается в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

Для изменения файла вместо его замены может потребоваться `flag` опция, которая должна быть установлена на `'r+'` а не по умолчанию `'w'`.

Поведение некоторых флагов зависит от платформы. Таким образом, открытие каталога в macOS и Linux с `'a+'` flag, как в примере ниже, вернет ошибку. Напротив, в Windows и FreeBSD дескриптор файла или `FileHandle` будет возвращен.

```js
// macOS and Linux
fs.open('<directory>', 'a+', (err, fd) => {
  // => [Error: EISDIR: illegal operation on a directory, open <directory>]
});

// Windows and FreeBSD
fs.open('<directory>', 'a+', (err, fd) => {
  // => null, <fd>
});
```

В Windows открытие существующего скрытого файла с помощью `'w'` флаг (либо через `fs.open()` или `fs.writeFile()` или `fsPromises.open()`) потерпит неудачу с `EPERM`. Существующие скрытые файлы можно открывать для записи с помощью `'r+'` флаг.

Звонок в `fs.ftruncate()` или `filehandle.truncate()` может использоваться для сброса содержимого файла.
