---
title: File system
description: В fs модуль позволяет взаимодействовать с файловой системой способом, смоделированным на основе стандартных функций POSIX
---

# Файловая система

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/fs.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:fs`** позволяет взаимодействовать с файловой системой по образцу стандартных функций POSIX.

Чтобы использовать API, основанные на обещаниях:

```mjs
import * as fs from 'node:fs/promises';
```

```cjs
const fs = require('node:fs/promises');
```

Чтобы использовать API обратного вызова и синхронизации:

```mjs
import * as fs from 'node:fs';
```

```cjs
const fs = require('node:fs');
```

Все операции с файловой системой имеют синхронную, обратную и основанную на обещаниях формы, и доступны как с помощью синтаксиса CommonJS, так и с помощью модулей ES6 (ESM).

## Пример обещания

Операции, основанные на обещаниях, возвращают обещание, которое выполняется, когда асинхронная операция завершена.

```mjs
import { unlink } from 'node:fs/promises';

try {
  await unlink('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (error) {
  console.error('произошла ошибка:', error.message);
}
```

```cjs
const { unlink } = require('node:fs/promises');

(async function (path) {
  try {
    await unlink(path);
    console.log(`successfully deleted ${path}`);
  } catch (error) {
    console.error('произошла ошибка:', error.message);
  }
})('/tmp/hello');
```

## Пример обратного вызова

Форма обратного вызова принимает функцию обратного вызова завершения в качестве последнего аргумента и вызывает операцию асинхронно. Аргументы, передаваемые обратному вызову завершения, зависят от метода, но первый аргумент всегда резервируется для исключения. Если операция завершена успешно, то первым аргументом будет `null` или `undefined`.

```mjs
import { unlink } from 'node:fs';

unlink('/tmp/hello', (err) => {
  if (err) throw err;
  console.log('успешно удалено /tmp/hello');
});
```

```cjs
const { unlink } = require('node:fs');

unlink('/tmp/hello', (err) => {
  if (err) throw err;
  console.log('successfully deleted /tmp/hello');
});
```

Версии API модуля `node:fs`, основанные на обратных вызовах, предпочтительнее использования API модуля promise, когда требуется максимальная производительность (как с точки зрения времени выполнения, так и с точки зрения выделения памяти).

## Синхронный пример

Синхронные API блокируют цикл событий Node.js и дальнейшее выполнение JavaScript до завершения операции. Исключения отбрасываются немедленно и могут быть обработаны с помощью `try...catch`, либо могут быть разрешены в виде пузырька.

```mjs
import { unlinkSync } from 'node:fs';

try {
  unlinkSync('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (err) {
  // обрабатываем ошибку
}
```

```cjs
const { unlinkSync } = require('node:fs');

try {
  unlinkSync('/tmp/hello');
  console.log('successfully deleted /tmp/hello');
} catch (err) {
  // обрабатываем ошибку
}
```

## Promises API

API `fs/promises` предоставляет асинхронные методы файловой системы, которые возвращают обещания.

API обещаний использует базовый пул потоков Node.js для выполнения операций с файловой системой вне потока цикла событий. Эти операции не синхронизированы и не безопасны для потоков. Необходимо соблюдать осторожность при выполнении нескольких одновременных модификаций одного и того же файла, иначе может произойти повреждение данных.

### Класс: `FileHandle`

Объект {FileHandle} является объектной оберткой для числового дескриптора файла.

Экземпляры объекта {FileHandle} создаются методом `fsPromises.open()`.

Все объекты {FileHandle} являются {EventEmitter}.

Если {FileHandle} не закрыт с помощью метода `filehandle.close()`, он попытается автоматически закрыть дескриптор файла и выдать предупреждение процессу, помогая предотвратить утечку памяти. Пожалуйста, не полагайтесь на это поведение, поскольку оно может быть ненадежным, и файл может быть не закрыт. Вместо этого всегда явно закрывайте {FileHandle}s. Node.js может изменить это поведение в будущем.

#### Событие: `'close'`

Событие `'close'` происходит, когда {FileHandle} был закрыт и больше не может быть использован.

#### `filehandle.appendFile(data[, options])`

- `data` {string|Buffer|TypedArray|DataView|AsyncIterable|Iterable|Stream}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `'utf8'`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Псевдоним [`filehandle.writeFile()`](#filehandlewritefiledata-options).

При работе с файловыми дескрипторами режим не может быть изменен с того, который был установлен с помощью [`fsPromises.open()`](#fspromisesopenpath-flags-mode). Поэтому это эквивалентно [`filehandle.writeFile()`](#filehandlewritefiledata-options).

#### `filehandle.chmod(mode)`

- `mode` {целое число} битовая маска режима файла.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Изменяет права доступа к файлу. См. chmod(2).

#### `filehandle.chown(uid, gid)`

- `uid` {целое число} Идентификатор пользователя нового владельца файла.
- `gid` {целое число} Идентификатор группы новой группы файла.
- Возвращает: {Promise} Выполняется с `undefined` в случае успеха.

Изменяет право собственности на файл. Обертка для chown(2).

#### `filehandle.close()`

- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Закрывает хэндл файла после ожидания завершения любой ожидающей операции над ним.

```mjs
import { open } from 'node:fs/promises';

let filehandle;
try {
  filehandle = await open('thefile.txt', 'r');
} finally {
  await filehandle?.close();
}
```

#### `filehandle.createReadStream([options])`

- `options` {Object}
  - `encoding` {string} **По умолчанию:** `null`
  - `autoClose` {boolean} **По умолчанию:** `true`
  - `emitClose` {boolean} **По умолчанию:** `true`
  - `start` {integer}
  - `end` {integer} **По умолчанию:** `бесконечность`
  - `highWaterMark` {integer} **По умолчанию:** `64 * 1024`.
- Возвращает: {fs.ReadStream}

В отличие от 16 KiB по умолчанию `highWaterMark` для {stream.Readable}, поток, возвращаемый этим методом, имеет `highWaterMark` по умолчанию 64 KiB.

`options` может включать значения `start` и `end` для чтения диапазона байт из файла, а не всего файла. Оба значения `start` и `end` являются инклюзивными и начинают отсчет с 0, допустимые значения находятся в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)\]. Если `start` опущено или `не определено`, `filehandle.createReadStream()` читает последовательно с текущей позиции файла. Кодировка `encoding` может быть любой из тех, которые принимаются {Buffer}.

Если `FileHandle` указывает на символьное устройство, которое поддерживает только блокирующее чтение (например, клавиатура или звуковая карта), операции чтения не завершаются до тех пор, пока данные не станут доступны. Это может помешать завершению процесса и естественному закрытию потока.

По умолчанию поток будет выдавать событие `закрытие` после его уничтожения. Установите опцию `emitClose` в `false`, чтобы изменить это поведение.

```mjs
import { open } from 'node:fs/promises';

const fd = await open('/dev/input/event0');
// Создаем поток из некоторого символьного устройства.
const stream = fd.createReadStream();
setTimeout(() => {
  stream.close(); // Это может не закрыть поток.
  // Искусственное обозначение конца потока, как если бы базовый ресурс сам по себе
  // сам по себе указал конец файла, позволяет потоку закрыться.
  // Это не отменяет ожидающие операции чтения, и если такая операция есть, то процесс может не закрыть поток.
  // операция, процесс все равно не сможет успешно завершиться.
  // пока она не завершится.
  stream.push(null);
  stream.read(0);
}, 100);
```

Если `autoClose` равно false, то дескриптор файла не будет закрыт, даже если произошла ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора. Если `autoClose` установлено в true (поведение по умолчанию), при `ошибке` или `завершении` дескриптор файла будет закрыт автоматически.

Пример для чтения последних 10 байт файла длиной 100 байт:

```mjs
import { open } from 'node:fs/promises';

const fd = await open('sample.txt');
fd.createReadStream({ start: 90, end: 99 });
```

#### `filehandle.createWriteStream([options])`

- `options` {Object}
  - `encoding` {string} **По умолчанию:** `'utf8'\*\*.
  - `autoClose` {boolean} **По умолчанию:** `true`
  - `emitClose` {boolean} **По умолчанию:** `true`
  - `start` {integer}
- Возвращает: {fs.WriteStream}

`options` может также включать опцию `start`, чтобы разрешить запись данных в некоторую позицию после начала файла, допустимые значения находятся в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)\]. Модификация файла, а не его замена может потребовать, чтобы опция `flags` `open` была установлена в `r+`, а не в `r` по умолчанию. Кодировка `encoding` может быть любой из тех, которые принимаются {Buffer}.

Если `autoClose` установлен в true (поведение по умолчанию) при `ошибке` или `завершении`, дескриптор файла будет закрыт автоматически. Если `autoClose` имеет значение false, то дескриптор файла не будет закрыт, даже если произошла ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора.

По умолчанию поток будет испускать событие `закрытие` после его уничтожения. Установите опцию `emitClose` в `false`, чтобы изменить это поведение.

#### `filehandle.datasync()`

- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Переводит все текущие операции ввода-вывода, связанные с файлом, в состояние синхронизированного завершения ввода-вывода операционной системы. Подробности см. в документации POSIX fdatasync(2).

В отличие от `filehandle.sync`, этот метод не сбрасывает измененные метаданные.

#### `filehandle.fd`

- {number} Числовой дескриптор файла, управляемый объектом {FileHandle}.

#### `filehandle.read(buffer, offset, length, position)`

- `buffer` {Buffer|TypedArray|DataView} Буфер, который будет заполнен прочитанными данными файла.
- `offset` {integer} Место в буфере, с которого начнется заполнение.
- `length` {integer} Количество байт для чтения.
- `position` {integer|null} Место, с которого следует начать чтение данных из файла. Если `null`, данные будут считаны из текущей позиции файла, и позиция будет обновлена. Если `position` - целое число, текущая позиция файла останется неизменной.
- Возвращает: {Promise} Выполняется при успехе с объектом с двумя свойствами:
  - `bytesRead` {integer} Количество прочитанных байтов
  - `buffer` {Buffer|TypedArray|DataView} Ссылка на переданный аргумент `buffer`.

Считывает данные из файла и сохраняет их в заданном буфере.

Если файл не модифицируется параллельно, конец файла будет достигнут, когда количество прочитанных байт будет равно нулю.

#### `filehandle.read([options])`

- `options` {Object}
  - `buffer` {Buffer|TypedArray|DataView} Буфер, который будет заполнен прочитанными данными файла. **По умолчанию:** `Buffer.alloc(16384)`.
  - `offset` {integer} Место в буфере, с которого начнется заполнение. **По умолчанию:** `0`.
  - `length` {integer} Количество байт для чтения. **По умолчанию:** `buffer.byteLength - offset`.
  - `позиция` {integer|null} Место, с которого следует начать чтение данных из файла. Если `null`, данные будут считываться из текущей позиции файла, и позиция будет обновляться. Если `position` - целое число, текущая позиция файла останется неизменной. **По умолчанию:**: `null`.
- Возвращает: {Promise} Выполняется при успехе с объектом с двумя свойствами:
  - `bytesRead` {integer} Количество прочитанных байтов
  - `buffer` {Buffer|TypedArray|DataView} Ссылка на переданный аргумент `buffer`.

Считывает данные из файла и сохраняет их в заданном буфере.

Если файл не модифицируется параллельно, конец файла будет достигнут, когда количество прочитанных байт будет равно нулю.

#### `filehandle.read(buffer[, options])`

- `buffer` {Buffer|TypedArray|DataView} Буфер, который будет заполнен прочитанными данными файла.
- `options` {Object}
  - `offset` {integer} Место в буфере, с которого начнется заполнение. **По умолчанию:** `0`.
  - `length` {integer} Количество байт для чтения. **По умолчанию:** `buffer.byteLength - offset`.
  - `позиция` {целое число} Место, с которого следует начать чтение данных из файла. Если `null`, данные будут считываться из текущей позиции файла, и позиция будет обновляться. Если `position` - целое число, текущая позиция файла останется неизменной. **По умолчанию:**: `null`.
- Возвращает: {Promise} Выполняется при успехе с объектом с двумя свойствами:
  - `bytesRead` {integer} Количество прочитанных байтов
  - `buffer` {Buffer|TypedArray|DataView} Ссылка на переданный аргумент `buffer`.

Считывает данные из файла и сохраняет их в заданном буфере.

Если файл не модифицируется параллельно, конец файла будет достигнут, когда количество прочитанных байт будет равно нулю.

#### `filehandle.readableWebStream()`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- Возвращает: {ReadableStream}

Возвращает `ReadableStream`, который может быть использован для чтения данных файла.

Если этот метод вызывается более одного раза или вызывается после закрытия или завершения `FileHandle`, будет выдана ошибка.

```mjs
import { open } from 'node:fs/promises';

const file = await open('./some/file/to/read');

for await (const chunk of file.readableWebStream())
  console.log(chunk);

await file.close();
```

```cjs
const { open } = require('node:fs/promises');

(async () => {
  const file = await open('./some/file/to/read');

  for await (const chunk of file.readableWebStream())
    console.log(chunk);

  await file.close();
})();
```

Хотя `ReadableStream` прочитает файл до конца, он не закроет `FileHandle` автоматически. Пользовательский код все равно должен вызвать метод `fileHandle.close()`.

#### `filehandle.readFile(options)`

- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `null`.
  - `signal` {AbortSignal} позволяет прервать выполняющееся чтение файла.
- Возвращает: {Promise} Выполняется после успешного чтения с содержимым файла. Если кодировка не указана (с помощью `options.encoding`), данные возвращаются в виде объекта {Buffer}. В противном случае данные будут строкой.

Асинхронно считывает все содержимое файла.

Если `options` - строка, то она определяет `кодировку`.

Файл {FileHandle} должен поддерживать чтение.

Если для файлового хэндла выполняется один или несколько вызовов `filehandle.read()`, а затем вызов `filehandle.readFile()`, данные будут прочитаны с текущей позиции до конца файла. Не всегда чтение происходит с начала файла.

#### `filehandle.readLines([options])`

- `options` {Object}
  - `encoding` {string} **По умолчанию:** `null`
  - `autoClose` {boolean} **По умолчанию:** `true`
  - `emitClose` {boolean} **По умолчанию:** `true`
  - `start` {integer}
  - `end` {integer} **По умолчанию:** `бесконечность`
  - `highWaterMark` {integer} **По умолчанию:** `64 * 1024`.
- Возвращает: {readline.InterfaceConstructor}

Удобный метод для создания интерфейса `readline` и потоковой передачи файла. Параметры см. в [`filehandle.createReadStream()`](#filehandlecreatereadstreamoptions).

```mjs
import { open } from 'node:fs/promises';

const file = await open('./some/file/to/read');

for await (const line of file.readLines()) {
  console.log(line);
}
```

```cjs
const { open } = require('node:fs/promises');

(async () => {
  const file = await open('./some/file/to/read');

  for await (const line of file.readLines()) {
    console.log(line);
  }
})();
```

#### `filehandle.readv(buffers[, position])`

- `buffers` {Buffer\[\]|TypedArray\[\]|DataView\[\]}
- `position` {integer|null} Смещение от начала файла, из которого должны быть считаны данные. Если `position` не является `число`, данные будут считаны из текущей позиции. **По умолчанию:** `null`.
- Возвращает: {Promise} В случае успеха создает объект, содержащий два свойства:
  - `bytesRead` {целое число} количество прочитанных байт.
  - `buffers` {Buffer\[\]|TypedArray\[\]|DataView\[\]} свойство, содержащее ссылку на вход `buffers`.

Чтение из файла и запись в массив {ArrayBufferView}

#### `filehandle.stat([options])`

- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- Возвращает: {Promise} Выполняется с объектом {fs.Stats} для файла.

#### `filehandle.sync()`

- Возвращает: {Promise} Выполняется с `undefined` в случае успеха.

Запрос на сброс всех данных для открытого дескриптора файла на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. Более подробную информацию см. в документации POSIX fsync(2).

#### `filehandle.truncate(len)`

- `len` {целое число} **По умолчанию:** `0`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Усекает файл.

Если файл был больше, чем `len` байт, в файле будут сохранены только первые `len` байт.

Следующий пример сохраняет только первые четыре байта файла:

```mjs
import { open } from 'node:fs/promises';

let filehandle = null;
try {
  filehandle = await open('temp.txt', 'r+');
  await filehandle.truncate(4);
} finally {
  await filehandle.close();
}
```

Если файл ранее был короче `len` байт, он расширяется, а расширенная часть заполняется нулевыми байтами (`'\0'`):

Если `len` отрицательно, то будет использоваться `0`.

#### `filehandle.utimes(atime, mtime)`

- `atime` {number|string|Date}
- `mtime` {number|string|Date}
- Возвращает: {Promise}

Изменяет временные метки файловой системы объекта, на который ссылается {FileHandle}, затем разрешает обещание без аргументов в случае успеха.

#### `filehandle.write(buffer, offset[, length[, position]])`

- `buffer` {Buffer|TypedArray|DataView}
- `offset` {integer} Начальная позиция в `буфере`, с которой начинается запись данных.
- `length` {integer} Количество байт из `буфера` для записи. **По умолчанию:** `buffer.byteLength - offset`.
- `позиция` {integer|null} Смещение от начала файла, куда должны быть записаны данные из `буфера`. Если `position` не является `число`, данные будут записаны в текущую позицию. Более подробно см. документацию POSIX pwrite(2). **По умолчанию:** `null`.
- Возвращает: {обещание}

Записать `буфер` в файл.

Обещание разрешается в объект, содержащий два свойства:

- `bytesWritten` {целое число} количество записанных байт.
- `buffer` {Buffer|TypedArray|DataView} ссылка на записанный `буфер`.

Небезопасно использовать `filehandle.write()` несколько раз для одного и того же файла, не дожидаясь разрешения (или отклонения) обещания. Для этого сценария используйте [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

#### `filehandle.write(buffer[, options])`

- `buffer` {Buffer|TypedArray|DataView}
- `options` {Object}
  - `offset` {integer} **По умолчанию:** `0`
  - `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
  - `позиция` {целое число} **По умолчанию:** `null`.
- Возвращает: { Обещание}

Записывает `буфер` в файл.

Подобно описанной выше функции `filehandle.write`, эта версия принимает необязательный объект `options`. Если объект `options` не указан, то по умолчанию будут использоваться вышеуказанные значения.

#### `filehandle.write(string[, position[, encoding]])`

- `строка` {строка}
- `position` {integer|null} Смещение от начала файла, куда должны быть записаны данные из `string`. Если `position` не является `число`, то данные будут записаны в текущей позиции. Более подробно см. документацию POSIX pwrite(2). **По умолчанию:** `null`.
- `encoding` {string} Ожидаемая кодировка строки. **По умолчанию:** `'utf8'`.
- Возвращает: {обещание}

Записать `строку` в файл. Если `string` не является строкой, обещание будет отклонено с ошибкой.

Обещание разрешается в объект, содержащий два свойства:

- `bytesWritten` {целое число} количество записанных байт.
- `buffer` {строка} ссылка на записанную `строку`.

Небезопасно использовать `filehandle.write()` несколько раз на одном и том же файле, не дожидаясь разрешения (или отклонения) обещания. Для этого сценария используйте [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

#### `filehandle.writeFile(data, options)`

- `data` {string|Buffer|TypedArray|DataView|AsyncIterable|Iterable|Stream}
- `options` {Object|string}
  - `encoding` {string|null} Ожидаемая кодировка символов, когда `data` является строкой. **По умолчанию:** `'utf8'`.
- Возвращает: {Promise}

Асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой, буфером, объектом {AsyncIterable} или {Iterable}. Обещание разрешается без аргументов в случае успеха.

Если `options` - строка, то она определяет `кодировку`.

Объект {FileHandle} должен поддерживать запись.

Небезопасно использовать `filehandle.writeFile()` несколько раз для одного и того же файла, не дождавшись разрешения (или отклонения) обещания.

Если для файлового хэндла выполняется один или несколько вызовов `filehandle.write()`, а затем вызов `filehandle.writeFile()`, данные будут записаны с текущей позиции до конца файла. Не всегда запись производится с начала файла.

#### `filehandle.writev(buffers[, position])`

- `buffers` {Buffer\[\]|TypedArray\[\]|DataView\[\]}
- `position` {integer|null} Смещение от начала файла, куда должны быть записаны данные из `буферов`. Если `position` не является `число`, данные будут записаны в текущую позицию. **По умолчанию:** `null`.
- Возвращает: {Promise}

Записать массив {ArrayBufferView}s в файл.

Обещание разрешается в объект, содержащий два свойства:

- `bytesWritten` {целое число} количество записанных байт.
- `buffers` {Buffer\[\]|TypedArray\[\]|DataView\[\]} ссылку на вход `buffers`.

Небезопасно вызывать `writev()` несколько раз для одного и того же файла, не дожидаясь разрешения (или отказа) обещания.

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

### `fsPromises.access(path[, mode])`

- `path` {string|Buffer|URL}
- `mode` {integer} **По умолчанию:** `fs.constants.F_OK`.
- Возвращает: {Promise} Выполняется с `undefined` в случае успеха.

Проверяет права доступа пользователя к файлу или каталогу, указанному в `path`. Аргумент `mode` является необязательным целым числом, которое определяет проверку доступности, которая должна быть выполнена. `mode` должно быть либо значением `fs.constants.F_OK`, либо маской, состоящей из побитового OR любого из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`). Проверьте [File access constants](#file-access-constants) на возможные значения `mode`.

Если проверка доступности прошла успешно, обещание разрешается без значения. Если какая-либо из проверок доступности не прошла, обещание отклоняется с объектом {Error}. Следующий пример проверяет, может ли файл `/etc/passwd` быть прочитан и записан текущим процессом.

```mjs
import { access, constants } from 'node:fs/promises';

try {
  await access(
    '/etc/passwd',
    constants.R_OK | constants.W_OK
  );
  console.log('can access');
} catch {
  console.error('невозможно получить доступ');
}
```

Использование `fsPromises.access()` для проверки доступности файла перед вызовом `fsPromises.open()` не рекомендуется. Это создает условия гонки, поскольку другие процессы могут изменить состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать/читать/писать файл напрямую и обрабатывать ошибку, возникающую, если файл недоступен.

### `fsPromises.appendFile(path, data[, options])`

- `path` {string|Buffer|URL|FileHandle} имя файла или {FileHandle}
- `данные` {string|Buffer}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `utf8`
  - `mode` {integer} **По умолчанию:** `0o666`
  - `флаг` {строка} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'a'`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Асинхронно добавляет данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или {Buffer}.

Если `options` - строка, то она определяет `кодировку`.

Опция `mode` влияет только на вновь созданный файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

Путь может быть указан как {FileHandle}, который был открыт для добавления (с помощью `fsPromises.open()`).

### `fsPromises.chmod(path, mode)`

- `path` {string|Buffer|URL}
- `mode` {string|integer}
- Возвращает: {обещание} Выполняется с `undefined` при успехе.

Изменяет права доступа к файлу.

### `fsPromises.chown(path, uid, gid)`

- `path` {string|Buffer|URL}
- `uid` {целое число}
- `gid` {целое число}
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Изменяет право собственности на файл.

### `fsPromises.copyFile(src, dest[, mode])`

- `src` {string|Buffer|URL} имя исходного файла для копирования
- `dest` {string|Buffer|URL} имя файла назначения операции копирования
- `mode` {integer} Необязательные модификаторы, определяющие поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`) **По умолчанию:** `0`.
  - `fs.constants.COPYFILE_EXCL`: Операция копирования завершится неудачно, если `dest` уже существует.
  - `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать ссылку "копия на запись". Если платформа не поддерживает копирование при записи, то используется механизм резервного копирования.
  - `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования будет пытаться создать ссылку "копия на запись". Если платформа не поддерживает копирование по записи, то операция завершится неудачей.
- Возвращает: {Promise}. Выполняется с `undefined` в случае успеха.

Асинхронно копирует `src` в `dest`. По умолчанию `dest` перезаписывается, если он уже существует.

Не дается никаких гарантий относительно атомарности операции копирования. Если после открытия файла назначения для записи произошла ошибка, будет предпринята попытка удалить его.

```mjs
import { copyFile, constants } from 'node:fs/promises';

try {
  await copyFile('source.txt', 'destination.txt');
  console.log(
    'source.txt был скопирован в destination.txt'
  );
} catch {
  console.error('Файл не удалось скопировать');
}

// При использовании COPYFILE_EXCL операция завершится неудачей, если файл destination.txt существует.
try {
  await copyFile(
    'source.txt',
    'destination.txt',
    constants.COPYFILE_EXCL
  );
  console.log(
    'source.txt был скопирован в destination.txt'
  );
} catch {
  console.error('Файл не удалось скопировать');
}
```

### `fsPromises.cp(src, dest[, options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- `src` {string|URL} путь к источнику для копирования.
- `dest` {string|URL} путь назначения для копирования.
- `options` {Object}
  - `dereference` {boolean} разыменовывать симлинки. **По умолчанию:** `false`.
  - `errorOnExist` {boolean} если `force` равно `false`, а место назначения существует, выдать ошибку. **По умолчанию:** `false`.
  - `filter` {Function} Функция для фильтрации скопированных файлов/каталогов. Возвращает `true` для копирования элемента, `false` для его игнорирования. Может также возвращать `Promise`, который разрешается в `true` или `false` **По умолчанию:** `undefined`.
    - `src` {string} путь к источнику для копирования.
    - `dest` {строка} путь назначения для копирования.
    - Возвращает: {boolean|Promise}
  - `force` {boolean} перезаписать существующий файл или каталог. Операция копирования будет игнорировать ошибки, если вы установите значение false, а место назначения существует. Используйте опцию `errorOnExist`, чтобы изменить это поведение. **По умолчанию:** `true`.
  - `preserveTimestamps` {boolean} При значении `true` временные метки из `src` будут сохранены. **По умолчанию:** `false`.
  - `recursive` {boolean} копировать каталоги рекурсивно **По умолчанию:** `false`.
  - `verbatimSymlinks` {boolean} Если `true`, разрешение путей для симлинков будет пропущено. **По умолчанию:** `false`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Асинхронно копирует всю структуру каталога из `src` в `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог глобы не поддерживаются, и поведение аналогично `cp dir1/ dir2/`.

### `fsPromises.lchmod(path, mode)`

- `path` {string|Buffer|URL}
- `mode` {целое число}
- Возвращает: {обещание} Выполняется с `undefined` при успехе.

Изменяет разрешения на символическую ссылку.

Этот метод реализован только на macOS.

### `fsPromises.lchown(path, uid, gid)`

- `path` {string|Buffer|URL}
- `uid` {целое число}
- `gid` {целое число}
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Изменяет права собственности на символическую ссылку.

### `fsPromises.lutimes(path, atime, mtime)`

- `path` {string|Buffer|URL}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Изменяет время доступа и модификации файла так же, как [`fsPromises.utimes()`](#fspromisesutimespath-atime-mtime), с той разницей, что если путь ссылается на символическую ссылку, то ссылка не разыменовывается: вместо этого изменяются временные метки самой символической ссылки.

### `fsPromises.link(existingPath, newPath)`

- `existingPath` {string|Buffer|URL}
- `newPath` {string|Buffer|URL}
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Создает новую ссылку с `existingPath` на `newPath`. Более подробную информацию см. в документации POSIX link(2).

### `fsPromises.lstat(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- Возвращает: {Promise} Выполняется с объектом {fs.Stats} для заданной символической ссылки `path`.

Эквивалентен [`fsPromises.stat()`](#fspromisesstatpath-options), если только `path` не ссылается на символическую ссылку, в этом случае статизируется сама ссылка, а не файл, на который она ссылается. Более подробную информацию см. в документе POSIX lstat(2).

### `fsPromises.mkdir(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object|integer}
  - `recursive` {boolean} **По умолчанию:** `false`
  - `mode` {string|integer} Не поддерживается в Windows. **По умолчанию:** `0o777`.
- Возвращает: {Promise} При успехе выполняет `undefined`, если `recursive` равно `false`, или первый созданный путь к каталогу, если `recursive` равно `true`.

Асинхронно создает каталог.

Необязательный аргумент `options` может быть целым числом, определяющим `режим` (разрешение и липкие биты), или объектом со свойством `режим` и свойством `recursive`, указывающим, следует ли создавать родительские каталоги. Вызов `fsPromises.mkdir()`, когда `path` является существующим каталогом, приводит к отказу только в том случае, если `recursive` равно false.

```mjs
import { mkdir } from 'node:fs/promises';

try {
  const projectFolder = new URL(
    './test/project/',
    import.meta.url
  );
  const createDir = await mkdir(projectFolder, {
    recursive: true,
  });

  console.log(`created ${createDir}`);
} catch (err) {
  console.error(err.message);
}
```

```cjs
const { mkdir } = require('node:fs/promises');
const { join } = require('node:path');

async function makeDirectory() {
  const projectFolder = join(__dirname, 'test', 'project');
  const dirCreation = await mkdir(projectFolder, {
    recursive: true,
  });

  console.log(dirCreation);
  return dirCreation;
}

makeDirectory().catch(console.error);
```

### `fsPromises.mkdtemp(prefix[, options])`

- `prefix` {string}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {Promise} Выполняется строкой, содержащей путь к файловой системе вновь созданного временного каталога.

Создает уникальный временный каталог. Уникальное имя каталога генерируется путем добавления шести случайных символов к концу предоставленного `префикса`. Из-за несоответствия платформ избегайте символов `X` в `prefix`. Некоторые платформы, в частности BSD, могут возвращать более шести случайных символов и заменять символы `X` в `prefix` случайными символами.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим используемую кодировку.

```mjs
import { mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

try {
  await mkdtemp(join(tmpdir(), 'foo-'));
} catch (err) {
  console.error(err);
}
```

Метод `fsPromises.mkdtemp()` добавит шесть случайно выбранных символов непосредственно к строке `prefix`. Например, при заданном каталоге `/tmp`, если предполагается создать временный каталог _внутри_ `/tmp`, то `префикс` должен заканчиваться идущим в конце разделителем путей, специфичным для платформы (`require('node:path').sep`).

### `fsPromises.open(path, flags[, mode])`

- `path` {string|Buffer|URL}
- `flags` {string|number} См. [поддержка файловой системы `flags`](#file-system-flags). **По умолчанию:** `'r'`.
- `mode` {string|integer} Устанавливает режим файла (разрешение и биты залипания) при создании файла. **По умолчанию:** `0o666` (доступен для чтения и записи).
- Возвращает: {Promise} Выполняется с объектом {FileHandle}.

Открывает {FileHandle}.

Более подробную информацию см. в документации POSIX open(2).

Некоторые символы (`< > : " / \ | ? *`) зарезервированы в Windows, как описано в [Naming Files, Paths, and Namespaces](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file). В NTFS, если имя файла содержит двоеточие, Node.js откроет поток файловой системы, как описано на [этой странице MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams).

### `fsPromises.opendir(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `bufferSize` {number} Количество записей каталога, которые буферизируются внутри каталога при чтении из него. Большие значения приводят к лучшей производительности, но увеличивают потребление памяти. **По умолчанию:** `32`.
- Возвращает: {Promise} Выполняется с помощью {fs.Dir}.

Асинхронно открывает каталог для итеративного сканирования. Более подробно см. документацию POSIX opendir(3).

Создает {fs.Dir}, который содержит все дальнейшие функции для чтения из каталога и его очистки.

Опция `encoding` устанавливает кодировку для `пути` при открытии каталога и последующих операциях чтения.

Пример с использованием асинхронной итерации:

```mjs
import { opendir } from 'node:fs/promises';

try {
  const dir = await opendir('./');
  for await (const dirent of dir) console.log(dirent.name);
} catch (err) {
  console.error(err);
}
```

При использовании асинхронного итератора объект {fs.Dir} будет автоматически закрыт после выхода итератора.

### `fsPromises.readdir(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
  - `withFileTypes` {boolean} **По умолчанию:** `false`.
- Возвращает: {Promise} Выполняется с массивом имен файлов в каталоге, исключая `...` и `...`.

Считывает содержимое каталога.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для имен файлов. Если `encoding` имеет значение `'buffer'`, возвращаемые имена файлов будут передаваться как объекты {Buffer}.

Если `options.withFileTypes` имеет значение `true`, разрешаемый массив будет содержать объекты {fs.Dirent}.

```mjs
import { readdir } from 'node:fs/promises';

try {
  const files = await readdir(path);
  for (const file of files) console.log(file);
} catch (err) {
  console.error(err);
}
```

### `fsPromises.readFile(path[, options])`

- `path` {string|Buffer|URL|FileHandle} имя файла или `FileHandle`
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `null`
  - `flag` {string} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'r'`.
  - `signal` {AbortSignal} позволяет прервать выполняющееся чтение файла.
- Возвращает: {Promise} Выполняется с содержимым файла.

Асинхронно считывает все содержимое файла.

Если кодировка не указана (с помощью `options.encoding`), данные возвращаются в виде объекта {Buffer}. В противном случае данные будут строкой.

Если `options` - строка, то она указывает кодировку.

Когда `path` является каталогом, поведение `fsPromises.readFile()` зависит от платформы. В macOS, Linux и Windows обещание будет отклонено с ошибкой. На FreeBSD будет возвращено представление содержимого каталога.

Пример чтения файла `package.json`, расположенного в той же директории, что и запущенный код:

```mjs
import { readFile } from 'node:fs/promises';
try {
  const filePath = new URL(
    './package.json',
    import.meta.url
  );
  const contents = await readFile(filePath, {
    encoding: 'utf8',
  });
  console.log(contents);
} catch (err) {
  console.error(err.message);
}
```

```cjs
const { readFile } = require('node:fs/promises');
const { resolve } = require('node:path');
async function logFile() {
  try {
    const filePath = resolve('./package.json');
    const contents = await readFile(filePath, {
      encoding: 'utf8',
    });
    console.log(contents);
  } catch (err) {
    console.error(err.message);
  }
}
logFile();
```

Можно прервать текущий `readFile`, используя {AbortSignal}. Если запрос прерывается, то возвращаемое обещание отклоняется с `AbortError`:

```mjs
import { readFile } from 'node:fs/promises';

try {
  const controller = new AbortController();
  const { signal } = controller;
  const promise = readFile(fileName, { signal });

  // Прервать запрос до того, как обещание исполнится.
  controller.abort();

  await promise;
} catch (err) {
  // Когда запрос прерывается - err является AbortError
  console.error(err);
}
```

Прерывание текущего запроса не прерывает отдельные запросы операционной системы, а скорее внутреннюю буферизацию, которую выполняет `fs.readFile`.

Любой указанный {FileHandle} должен поддерживать чтение.

### `fsPromises.readlink(path[, options])`

- `путь` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {Promise} Выполняется с `linkString` при успехе.

Читает содержимое символической ссылки, на которую ссылается `path`. Более подробно см. документацию POSIX readlink(2). Обещание выполняется с `linkString` после успеха.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для возвращаемого пути к ссылке. Если `encoding` имеет значение `'buffer'`, то возвращаемый путь по ссылке будет передан как объект {Buffer}.

### `fsPromises.realpath(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {Promise} Выполняется с разрешенным путем при успехе.

Определяет фактическое местоположение `path`, используя ту же семантику, что и функция `fs.realpath.native()`.

Поддерживаются только пути, которые могут быть преобразованы в строки UTF8.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для пути. Если `encoding` имеет значение `'buffer'`, возвращаемый путь будет передан как объект {Buffer}.

В Linux, когда Node.js слинкован с musl libc, файловая система procfs должна быть смонтирована на `/proc`, чтобы эта функция работала. В Glibc такого ограничения нет.

### `fsPromises.rename(oldPath, newPath)`

- `oldPath` {string|Buffer|URL}
- `newPath` {string|Buffer|URL}
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Переименовывает `oldPath` в `newPath`.

### `fsPromises.rmdir(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `maxRetries` {integer} Если встречается ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js повторяет операцию с линейным ожиданием обратного хода на `retryDelay` миллисекунд дольше при каждой попытке. Этот параметр представляет собой количество повторных попыток. Этот параметр игнорируется, если параметр `recursive` не равен `true`. **По умолчанию:** `0`.
  - `recursive` {boolean} Если `true`, выполнить рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при неудаче. **По умолчанию:** `false`. **удалено.**
  - `retryDelay` {integer} Количество времени в миллисекундах для ожидания между повторными попытками. Эта опция игнорируется, если опция `recursive` не является `true`. **По умолчанию:** `100`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Удаляет каталог, идентифицированный `path`.

Использование `fsPromises.rmdir()` для файла (не каталога) приводит к тому, что обещание будет отклонено с ошибкой `ENOENT` в Windows и ошибкой `ENOTDIR` в POSIX.

Чтобы получить поведение, аналогичное Unix-команде `rm -rf`, используйте [`fsPromises.rm()`](#fspromisesrmpath-options) с опциями `{ recursive: true, force: true }`.

### `fsPromises.rm(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `force` {boolean} Если `true`, исключения будут игнорироваться, если `path` не существует. **По умолчанию:** `false`.
  - `maxRetries` {integer} Если возникла ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js будет повторять операцию с линейным ожиданием обратного хода на `retryDelay` миллисекунд дольше при каждой попытке. Этот параметр представляет собой количество повторных попыток. Этот параметр игнорируется, если параметр `recursive` не является `true`. **По умолчанию:** `0`.
  - `recursive` {boolean} Если `true`, выполнить рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при неудаче. **По умолчанию:** `false`.
  - `retryDelay` {integer} Количество времени в миллисекундах для ожидания между повторными попытками. Эта опция игнорируется, если опция `recursive` не является `true`. **По умолчанию:** `100`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Удаляет файлы и каталоги (по образцу стандартной утилиты POSIX `rm`).

### `fsPromises.stat(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- Возвращает: {Promise} Выполняется с объектом {fs.Stats} для заданного `пути`.

### `fsPromises.statfs(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.StatFs} быть `bigint`. **По умолчанию:** `false`.
- Возвращает: {Promise} Выполняется с объектом {fs.StatFs} для заданного `пути`.

### `fsPromises.symlink(target, path[, type])`

- `target` {string|Buffer|URL}
- `path` {string|Buffer|URL}
- `type` {string|null} **По умолчанию:** `null`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Создает символическую ссылку.

Аргумент `type` используется только на платформах Windows и может быть одним из `'dir'`, `'file'` или `'junction'`. Если аргумент `type` не является строкой, Node.js автоматически определит тип `target` и использует `'file'` или `'dir'`. Если `target` не существует, будет использован `'file'`. Точки пересечения Windows требуют, чтобы путь назначения был абсолютным. При использовании `'junction'` аргумент `target` будет автоматически нормализован к абсолютному пути.

### `fsPromises.truncate(path[, len])`

- `path` {string|Buffer|URL}
- `len` {целое число} **По умолчанию:** `0`.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Усекает (сокращает или увеличивает длину) содержимое по адресу `path` до `len` байт.

### `fsPromises.unlink(path)`

- `path` {string|Buffer|URL}
- Возвращает: {обещание} Выполняется с `undefined` при успехе.

Если `path` ссылается на символическую ссылку, то ссылка удаляется, не затрагивая файл или каталог, на который ссылается эта ссылка. Если `path` ссылается на путь к файлу, который не является символической ссылкой, то файл удаляется. Более подробно см. документацию POSIX unlink(2).

### `fsPromises.utimes(path, atime, mtime)`

- `path` {string|Buffer|URL}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Изменяет временные метки файловой системы объекта, на который ссылается `path`.

Аргументы `atime` и `mtime` следуют этим правилам:

- Значения могут быть либо числами, представляющими время эпохи Unix, либо `Date`, либо числовой строкой типа `'123456789.0'`.
- Если значение не может быть преобразовано в число, или является `NaN`, `Infinity`, или `-Infinity`, будет выдана `ошибка`.

### `fsPromises.watch(filename[, options])`

- `filename` {string|Buffer|URL}
- `options` {string|Object}
  - `persistent` {boolean} Указывает, должен ли процесс продолжать выполняться, пока ведется наблюдение за файлами. **По умолчанию:** `true`.
  - `recursive` {boolean} Указывает, должны ли просматриваться все подкаталоги или только текущий каталог. Применяется, если указан каталог, и только на поддерживаемых платформах (см. [caveats](#caveats)). **По умолчанию:** `false`.
  - `encoding` {string} Указывает кодировку символов, которая будет использоваться для имени файла, передаваемого слушателю. **По умолчанию:** `'utf8'`.
  - `signal` {AbortSignal} Сигнал {AbortSignal}, используемый для сигнализации о том, что наблюдатель должен остановиться.
- Возвращает: {AsyncIterator} объектов со свойствами:
  - `eventType` {string} Тип изменения
  - `filename` {string|Buffer} Имя измененного файла.

Возвращает асинхронный итератор, который отслеживает изменения в `filename`, где `filename` - это либо файл, либо каталог.

```js
const { watch } = require('node:fs/promises');

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

На большинстве платформ функция `'rename'` выдается всякий раз, когда имя файла появляется или исчезает в каталоге.

Все [caveats](#caveats) для `fs.watch()` также применимы к `fsPromises.watch()`.

### `fsPromises.writeFile(file, data[, options])`

- `file` {string|Buffer|URL|FileHandle} имя файла или `FileHandle`
- `data` {string|Buffer|TypedArray|DataView|AsyncIterable|Iterable|Stream}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `mode` {integer} **По умолчанию:** `0o666`
  - `флаг` {строка} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'w'`.
  - `signal` {AbortSignal} позволяет прервать текущую запись файла.
- Возвращает: {Promise} Выполняется с `undefined` при успехе.

Асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой, буфером, объектом {AsyncIterable} или {Iterable}.

Опция `encoding` игнорируется, если `data` является буфером.

Если `options` - строка, то она определяет кодировку.

Опция `mode` влияет только на вновь созданный файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

Любой указанный {FileHandle} должен поддерживать запись.

Небезопасно использовать `fsPromises.writeFile()` несколько раз на одном и том же файле, не дожидаясь выполнения обещания.

Аналогично `fsPromises.readFile` - `fsPromises.writeFile` является удобным методом, который выполняет несколько внутренних вызовов `write` для записи переданного ему буфера. Для кода, чувствительного к производительности, используйте [`fs.createWriteStream()`](#fscreatewritestreampath-options) или [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

Можно использовать {AbortSignal} для отмены `fsPromises.writeFile()`. Отмена происходит "из лучших побуждений", и некоторое количество данных, вероятно, все еще будет записано.

```mjs
import { writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

try {
  const controller = new AbortController();
  const { signal } = controller;
  const data = new Uint8Array(Buffer.from('Hello Node.js'));
  const promise = writeFile('message.txt', data, {
    signal,
  });

  // Прервите запрос до того, как обещание установится.
  controller.abort();

  await promise;
} catch (err) {
  // Когда запрос прерывается - err является AbortError
  console.error(err);
}
```

Прерывание текущего запроса не прерывает отдельные запросы операционной системы, а скорее внутреннюю буферизацию, которую выполняет `fs.writeFile`.

### `fsPromises.constants`

- {Object}

Возвращает объект, содержащий часто используемые константы для операций с файловой системой. Объект аналогичен `fs.constants`. Более подробную информацию смотрите в [FS constants](#fs-constants).

## API обратного вызова

API обратного вызова выполняют все операции асинхронно, не блокируя цикл событий, а затем вызывают функцию обратного вызова после завершения или ошибки.

API обратного вызова используют базовый пул потоков Node.js для выполнения операций с файловой системой вне потока цикла событий. Эти операции не синхронизированы и не безопасны для потоков. Необходимо соблюдать осторожность при выполнении нескольких одновременных модификаций одного и того же файла, иначе может произойти повреждение данных.

### `fs.access(path[, mode], callback)`

- `path` {string|Buffer|URL}
- `mode` {integer} **По умолчанию:** `fs.constants.F_OK`
- `callback` {Функция}
  - `err` {Ошибка}

Проверяет права доступа пользователя к файлу или каталогу, указанному в `path`. Аргумент `mode` является необязательным целым числом, которое указывает, какие проверки доступности должны быть выполнены. `mode` должно быть либо значением `fs.constants.F_OK`, либо маской, состоящей из побитового OR любого из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`). Возможные значения `mode` смотрите в [File access constants](#file-access-constants).

Последний аргумент, `callback`, представляет собой функцию обратного вызова, которая вызывается с возможным аргументом ошибки. Если какая-либо из проверок доступности не прошла, аргументом ошибки будет объект `Error`. Следующие примеры проверяют, существует ли файл `package.json`, а также доступен ли он для чтения или записи.

```mjs
import { access, constants } from 'node:fs';

const file = 'package.json';

// Проверяем, существует ли файл в текущем каталоге.
access(file, constants.F_OK, (err) => {
  console.log(
    `${файл} ${err ? 'не существует' : 'существует'}`
  );
});

// Проверяем, доступен ли файл для чтения.
access(file, constants.R_OK, (err) => {
  console.log(
    `${file} ${err ? 'is not readable' : 'is readable'}`
  );
});

// Проверьте, доступен ли файл для записи.
access(file, constants.W_OK, (err) => {
  console.log(
    `${file} ${err ? 'is not writable' : 'is writable'}`
  );
});

// Проверьте, доступен ли файл для чтения и записи.
access(file, constants.R_OK | constants.W_OK, (err) => {
  console.log(
    `${file} ${err ? 'is not' : 'is'} readable and writable`
  );
});
```

Не используйте `fs.access()` для проверки доступности файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()`. Это создает условия гонки, поскольку другие процессы могут изменить состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать/читать/записывать файл напрямую и обрабатывать ошибку, возникающую, если файл недоступен.

**запись (НЕ РЕКОМЕНДУЕТСЯ)**.

```mjs
import { access, open, close } from 'node:fs';

access('myfile', (err) => {
  if (!err) {
    console.error('myfile уже существует');
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

**запись (РЕКОМЕНДУЕТСЯ)**.

```mjs
import { open, close } from 'node:fs';

open('myfile', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('myfile уже существует');
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

**читать (НЕ РЕКОМЕНДУЕТСЯ)**.

```mjs
import { access, open, close } from 'node:fs';
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

**read (RECOMMENDED)**

```mjs
import { open, close } from 'node:fs';

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

Примеры "не рекомендуется" выше проверяют доступность, а затем используют файл; примеры "рекомендуется" лучше, поскольку они используют файл напрямую и обрабатывают ошибку, если она возникла.

В целом, проверяйте доступность файла только в том случае, если файл не будет использоваться напрямую, например, когда его доступность является сигналом от другого процесса.

В Windows политики контроля доступа (ACL) в каталоге могут ограничивать доступ к файлу или каталогу. Функция `fs.access()`, однако, не проверяет ACL и поэтому может сообщить, что путь доступен, даже если ACL ограничивает пользователю чтение или запись в него.

### `fs.appendFile(path, data[, options], callback)`

- `path` {string|Buffer|URL|number} имя файла или дескриптор файла
- `data` {string|Buffer}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `mode` {integer} **По умолчанию:** `0o666`
  - `флаг` {строка} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'a'`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно добавляет данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или {Buffer}.

Опция `mode` влияет только на вновь созданный файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

```mjs
import { appendFile } from 'node:fs';

appendFile(
  'message.txt',
  'данные для добавления',
  (err) => {
    if (err) throw err;
    console.log(
      'Данные "data to append" были добавлены в файл!'
    );
  }
);
```

Если `options` - строка, то она определяет кодировку:

```mjs
import { appendFile } from 'node:fs';

appendFile(
  'message.txt',
  'data to append',
  'utf8',
  callback
);
```

Путь может быть указан как числовой дескриптор файла, который был открыт для добавления (с помощью `fs.open()` или `fs.openSync()`). Дескриптор файла не будет закрыт автоматически.

```mjs
import { open, close, appendFile } from 'node:fs';

function closeFd(fd) {
  close(fd, (err) => {
    if (err) throw err;
  });
}

open('message.txt', 'a', (err, fd) => {
  if (err) throw err;

  try {
    appendFile(
      fd,
      'данные для добавления',
      'utf8',
      (err) => {
        closeFd(fd);
        if (err) throw err;
      }
    );
  } catch (err) {
    closeFd(fd);
    throw err;
  }
});
```

### `fs.chmod(path, mode, callback)`

- `path` {string|Buffer|URL}
- `mode` {string|integer}
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно изменяет разрешения файла. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробно см. документацию POSIX chmod(2).

```mjs
import { chmod } from 'node:fs';

chmod('my_file.txt', 0o775, (err) => {
  if (err) throw err;
  console.log(
    'Разрешения для файла "my_file.txt" были изменены!'
  );
});
```

#### File modes

The `mode` argument used in both the `fs.chmod()` and `fs.chmodSync()` methods is a numeric bitmask created using a logical OR of the following constants:

<table>
<thead>
<tr class="header">
<th>Constant</th>
<th>Octal</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>fs.constants.S_IRUSR</code></td>
<td><code>0o400</code></td>
<td>read by owner</td>
</tr>
<tr class="even">
<td><code>fs.constants.S_IWUSR</code></td>
<td><code>0o200</code></td>
<td>write by owner</td>
</tr>
<tr class="odd">
<td><code>fs.constants.S_IXUSR</code></td>
<td><code>0o100</code></td>
<td>execute/search by owner</td>
</tr>
<tr class="even">
<td><code>fs.constants.S_IRGRP</code></td>
<td><code>0o40</code></td>
<td>read by group</td>
</tr>
<tr class="odd">
<td><code>fs.constants.S_IWGRP</code></td>
<td><code>0o20</code></td>
<td>write by group</td>
</tr>
<tr class="even">
<td><code>fs.constants.S_IXGRP</code></td>
<td><code>0o10</code></td>
<td>execute/search by group</td>
</tr>
<tr class="odd">
<td><code>fs.constants.S_IROTH</code></td>
<td><code>0o4</code></td>
<td>read by others</td>
</tr>
<tr class="even">
<td><code>fs.constants.S_IWOTH</code></td>
<td><code>0o2</code></td>
<td>write by others</td>
</tr>
<tr class="odd">
<td><code>fs.constants.S_IXOTH</code></td>
<td><code>0o1</code></td>
<td>execute/search by others</td>
</tr>
</tbody>
</table>

Более простой метод построения `режима` заключается в использовании последовательности из трех восьмеричных цифр (например, `765`). Крайняя левая цифра (`7` в примере) определяет разрешения для владельца файла. Средняя цифра (`6` в примере) определяет права доступа для группы. Крайняя правая цифра (`5` в примере) указывает разрешения для других.

<table>
<thead>
<tr class="header">
<th>Number</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr class="odd">
<td><code>7</code></td>
<td>read, write, and execute</td>
</tr>
<tr class="even">
<td><code>6</code></td>
<td>read and write</td>
</tr>
<tr class="odd">
<td><code>5</code></td>
<td>read and execute</td>
</tr>
<tr class="even">
<td><code>4</code></td>
<td>read only</td>
</tr>
<tr class="odd">
<td><code>3</code></td>
<td>write and execute</td>
</tr>
<tr class="even">
<td><code>2</code></td>
<td>write only</td>
</tr>
<tr class="odd">
<td><code>1</code></td>
<td>execute only</td>
</tr>
<tr class="even">
<td><code>0</code></td>
<td>no permission</td>
</tr>
</tbody>
</table>

Например, восьмеричное значение `0o765` означает:

- Владелец может читать, записывать и выполнять файл.
- Группа может читать и записывать файл.
- Другие могут читать и исполнять файл.

При использовании необработанных чисел, где ожидаются файловые режимы, любое значение больше `0o777` может привести к специфическому для платформы поведению, которое не поддерживается для последовательной работы. Поэтому константы типа `S_ISVTX`, `S_ISGID` или `S_ISUID` не раскрываются в `fs.constants`.

Предостережения: в Windows можно изменить только разрешение на запись, а различие между разрешениями группы, владельца или других не реализовано.

Переведено с помощью www.DeepL.com/Translator (бесплатная версия)

### `fs.chown(path, uid, gid, callback)`

- `path` {string|Buffer|URL}
- `uid` {целое число}
- `gid` {целое число}
- `callback` {Function}
  - `err` {Ошибка}

Асинхронно изменяет владельца и группу файла. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробно см. документацию POSIX chown(2).

### `fs.close(fd[, callback])`

- `fd` {целое число}
- `callback` {функция}
  - `err` {Ошибка}

Закрывает дескриптор файла. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Вызов `fs.close()` на любом файловом дескрипторе (`fd`), который в настоящее время используется через любую другую операцию `fs`, может привести к неопределенному поведению.

Более подробную информацию смотрите в документации POSIX close(2).

### `fs.copyFile(src, dest[, mode], callback)`

- `src` {string|Buffer|URL} имя исходного файла для копирования
- `dest` {string|Buffer|URL} имя файла назначения операции копирования
- `mode` {целое число} модификаторы для операции копирования. **По умолчанию:** `0`.
- `callback` {функция}

Асинхронно копирует `src` в `dest`. По умолчанию, `dest` перезаписывается, если он уже существует. Никаких аргументов, кроме возможного исключения, функции обратного вызова не передается. Node.js не дает никаких гарантий относительно атомарности операции копирования. Если после открытия файла назначения для записи произошла ошибка, Node.js попытается удалить его.

`mode` - необязательное целое число, определяющее поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

- `fs.constants.COPYFILE_EXCL`: Операция копирования завершится неудачно, если `dest` уже существует.
- `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать ссылку "копия на запись". Если платформа не поддерживает копирование при записи, то используется механизм резервного копирования.
- `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования будет пытаться создать ссылку "копия на запись". Если платформа не поддерживает копирование по записи, то операция завершится неудачей.

```mjs
import { copyFile, constants } from 'node:fs';

function callback(err) {
  if (err) throw err;
  console.log(
    'source.txt был скопирован в destination.txt'
  );
}

// destination.txt будет создан или перезаписан по умолчанию.
copyFile('source.txt', 'destination.txt', callback);

// При использовании COPYFILE_EXCL операция завершится неудачно, если файл destination.txt существует.
copyFile(
  'source.txt',
  'destination.txt',
  constants.COPYFILE_EXCL,
  callback
);
```

### `fs.cp(src, dest[, options], callback)`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- `src` {string|URL} путь к источнику для копирования.
- `dest` {string|URL} путь назначения для копирования.
- `options` {Object}
  - `dereference` {boolean} разыменовывать симлинки. **По умолчанию:** `false`.
  - `errorOnExist` {boolean} если `force` равно `false`, а место назначения существует, выдать ошибку. **По умолчанию:** `false`.
  - `filter` {Function} Функция для фильтрации скопированных файлов/каталогов. Возвращает `true` для копирования элемента, `false` для его игнорирования. Может также возвращать `Promise`, который разрешается в `true` или `false` **По умолчанию:** `undefined`.
    - `src` {string} путь к источнику для копирования.
    - `dest` {строка} путь назначения для копирования.
    - Возвращает: {boolean|Promise}
  - `force` {boolean} перезаписать существующий файл или каталог. Операция копирования будет игнорировать ошибки, если вы установите значение false, а место назначения существует. Используйте опцию `errorOnExist`, чтобы изменить это поведение. **По умолчанию:** `true`.
  - `preserveTimestamps` {boolean} При значении `true` временные метки из `src` будут сохранены. **По умолчанию:** `false`.
  - `recursive` {boolean} копировать каталоги рекурсивно **По умолчанию:** `false`.
  - `verbatimSymlinks` {boolean} Если `true`, разрешение путей для симлинков будет пропущено. **По умолчанию:** `false`.
- `callback` {Функция}

Асинхронно копирует всю структуру каталога из `src` в `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог глобы не поддерживаются, и поведение аналогично `cp dir1/ dir2/`.

### `fs.createReadStream(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `flags` {string} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'r'`.
  - `encoding` {string} **По умолчанию:** `null`.
  - `fd` {integer|FileHandle} **По умолчанию:** `null`.
  - `mode` {integer} **По умолчанию:** `0o666`
  - `autoClose` {boolean} **По умолчанию:** `true`
  - `emitClose` {boolean} **По умолчанию:** `true`
  - `start` {integer}
  - `end` {integer} **По умолчанию:** `бесконечность`
  - `highWaterMark` {integer} **По умолчанию:** `64 * 1024`
  - `fs` {Object|null} **По умолчанию:** `null`.
  - `signal` {AbortSignal|null} **По умолчанию:** `null`.
- Возвращает: {fs.ReadStream}

В отличие от 16 KiB по умолчанию `highWaterMark` для {stream.Readable}, поток, возвращаемый этим методом, имеет `highWaterMark` по умолчанию 64 KiB.

`options` может включать значения `start` и `end` для чтения диапазона байт из файла, а не всего файла. Оба значения `start` и `end` являются инклюзивными и начинают отсчет с 0, допустимые значения находятся в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)\]. Если указано `fd` и `start` опущено или `не определено`, `fs.createReadStream()` читает последовательно с текущей позиции файла. Кодировка `encoding` может быть любой из тех, которые принимаются {Buffer}.

Если указано `fd`, `ReadStream` будет игнорировать аргумент `path` и будет использовать указанный дескриптор файла. Это означает, что событие `'open'' не будет выдано. `fd`должен быть блокирующим; неблокирующие`fd` должны быть переданы в {net.Socket}.

Если `fd` указывает на символьное устройство, которое поддерживает только блокирующие чтения (например, клавиатура или звуковая карта), операции чтения не завершатся, пока данные не станут доступны. Это может помешать завершению процесса и естественному закрытию потока.

По умолчанию поток будет выдавать событие `закрытие` после его уничтожения. Установите опцию `emitClose` в `false`, чтобы изменить это поведение.

Предоставив опцию `fs`, можно переопределить соответствующие реализации `fs` для `open`, `read` и `close`. При указании опции `fs` требуется переопределение для `read`. Если опция `fd` не предоставлена, также требуется переопределение для `open`. Если `autoClose` имеет значение `true`, также требуется переопределение для `close`.

```mjs
import { createReadStream } from 'node:fs';

// Создаем поток из некоторого символьного устройства.
const stream = createReadStream('/dev/input/event0');
setTimeout(() => {
  stream.close(); // Это может не закрыть поток.
  // Искусственное обозначение конца потока, как если бы базовый ресурс сам по себе
  // сам по себе обозначил конец файла, позволяет потоку закрыться.
  // Это не отменяет ожидающие операции чтения, и если такая операция есть, то процесс может не закрыть поток.
  // операция, процесс все равно не сможет успешно завершиться.
  // пока она не завершится.
  stream.push(null);
  stream.read(0);
}, 100);
```

Если `autoClose` равно false, то дескриптор файла не будет закрыт, даже если произошла ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора. Если `autoClose` установлено в true (поведение по умолчанию), при `ошибке` или `завершении` дескриптор файла будет закрыт автоматически.

`mode` устанавливает режим файла (разрешение и липкие биты), но только если файл был создан.

Пример для чтения последних 10 байт файла длиной 100 байт:

```mjs
import { createReadStream } from 'node:fs';

createReadStream('sample.txt', { start: 90, end: 99 });
```

Если `options` - строка, то она определяет кодировку.

### `fs.createWriteStream(path[, options])`

- `путь` {string|Buffer|URL}
- `options` {string|Object}
  - `flags` {string} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'w'`.
  - `encoding` {string} **По умолчанию:** `'utf8'`.
  - `fd` {integer|FileHandle} **По умолчанию:** `null`.
  - `mode` {integer} **По умолчанию:** `0o666`
  - `autoClose` {boolean} **По умолчанию:** `true`
  - `emitClose` {boolean} **По умолчанию:** `true`
  - `start` {integer}
  - `fs` {Object|null} **По умолчанию:** `null`.
  - `signal` {AbortSignal|null} **По умолчанию:** `null`.
- Возвращает: {fs.WriteStream}

`options` может также включать опцию `start`, чтобы разрешить запись данных в некоторой позиции после начала файла, допустимые значения находятся в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)\]. Модификация файла, а не его замена может потребовать установки опции `flags` в значение `r+`, а не `w` по умолчанию. Кодировка `encoding` может быть любой из тех, которые принимает {Buffer}.

Если `autoClose` установлен в true (поведение по умолчанию) при `ошибке` или `завершении`, дескриптор файла будет закрыт автоматически. Если `autoClose` имеет значение false, то дескриптор файла не будет закрыт, даже если произошла ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки файлового дескриптора.

По умолчанию поток будет испускать событие `закрытие` после его уничтожения. Установите опцию `emitClose` в `false`, чтобы изменить это поведение.

Предоставив опцию `fs`, можно переопределить соответствующие реализации `fs` для `open`, `write`, `writev` и `close`. Переопределение `write()` без `writev()` может снизить производительность, так как некоторые оптимизации (`_writev()`) будут отключены. При предоставлении опции `fs` требуется переопределение хотя бы одной из `write` и `writev`. Если опция `fd` не указана, то также требуется переопределение для `open`. Если `autoClose` имеет значение `true`, также требуется переопределение для `close`.

Как и {fs.ReadStream}, если указан `fd`, {fs.WriteStream} будет игнорировать аргумент `path` и будет использовать указанный дескриптор файла. Это означает, что событие `'open'' не будет выдано. `fd`должен быть блокирующим; неблокирующие`fd` должны быть переданы в {net.Socket}.

Если `options` - строка, то она указывает кодировку.

### `fs.exists(path, callback)`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого используйте [`fs.stat()`](#fsstatpath-options-callback) или [`fs.access()`](#fsaccesspath-mode-callback).

- `path` {string|Buffer|URL}
- `callback` {Function}
  - `exists` {boolean}

Проверяет, существует ли заданный путь, сверяясь с файловой системой. Затем вызовите аргумент `callback`, указав true или false:

```mjs
import { exists } from 'node:fs';

exists('/etc/passwd', (e) => {
  console.log(e ? 'он существует' : 'нет passwd!');
});
```

**Параметры этого обратного вызова не соответствуют другим обратным вызовам Node.js.** Обычно первым параметром обратного вызова Node.js является параметр `err`, за которым по желанию следуют другие параметры. Обратный вызов `fs.exists()` имеет только один параметр boolean. Это одна из причин, по которой рекомендуется использовать `fs.access()` вместо `fs.exists()`.

Использование `fs.exists()` для проверки существования файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. Это создает условия гонки, поскольку другие процессы могут изменить состояние файла между двумя вызовами. Вместо этого пользовательский код должен открывать/читать/записывать файл напрямую и обрабатывать ошибку, возникающую, если файл не существует.

**запись (НЕ РЕКОМЕНДУЕТСЯ)**.

```mjs
import { exists, open, close } from 'node:fs';

exists('myfile', (e) => {
  if (e) {
    console.error('myfile уже существует');
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

**запись (РЕКОМЕНДУЕТСЯ)**.

```mjs
import { open, close } from 'node:fs';
open('myfile', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('myfile уже существует');
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

**читать (НЕ РЕКОМЕНДУЕТСЯ)**.

```mjs
import { open, close, exists } from 'node:fs';

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

**читать (РЕКОМЕНДУЕТСЯ)**.

```mjs
import { open, close } from 'node:fs';

open('myfile', 'r', (err, fd) => {
  if (err) {
    if (err.code === 'ENOENT') {
      console.error('myfile не существует');
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

Приведенные выше "не рекомендуемые" примеры проверяют существование, а затем используют файл; "рекомендуемые" примеры лучше, поскольку они используют файл напрямую и обрабатывают ошибку, если таковая возникла.

Вообще, проверяйте существование файла только в том случае, если файл не будет использоваться напрямую, например, если его существование является сигналом от другого процесса.

### `fs.fchmod(fd, mode, callback)`

- `fd` {целое число}
- `mode` {string|integer}
- `callback` {функция}
  - `err` {Ошибка}

Устанавливает разрешения на файл. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробно см. документацию POSIX fchmod(2).

### `fs.fchown(fd, uid, gid, callback)`

- `fd` {целое число}
- `uid` {integer}
- `gid` {integer}
- `callback` {Function}
  - `err` {Ошибка}

Устанавливает владельца файла. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробно см. документацию POSIX fchown(2).

### `fs.fdatasync(fd, callback)`

- `fd` {целое число}
- `callback` {функция}
  - `err` {Ошибка}

Переводит все текущие операции ввода-вывода, связанные с файлом, в состояние синхронизированного завершения ввода-вывода операционной системы. Подробности см. в документации POSIX fdatasync(2). Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

### `fs.fstat(fd[, options], callback)`

- `fd` {integer}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.Stats}

Вызывает обратный вызов с {fs.Stats} для дескриптора файла.

Более подробно см. документацию POSIX fstat(2).

### `fs.fsync(fd, callback)`

- `fd` {целое число}
- `callback` {функция}
  - `err` {Ошибка}

Запрос на то, чтобы все данные для открытого файлового дескриптора были сброшены на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. За более подробной информацией обратитесь к документации POSIX fsync(2). Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

### `fs.ftruncate(fd[, len], callback)`

- `fd` {целое число}
- `len` {целое число} **По умолчанию:** `0`
- `callback` {Функция}
  - `err` {Ошибка}

Усекает дескриптор файла. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробно см. документацию POSIX ftruncate(2).

Если файл, на который ссылается дескриптор файла, был больше `len` байт, то в файле будут сохранены только первые `len` байт.

Например, следующая программа сохраняет только первые четыре байта файла:

```mjs
import { open, close, ftruncate } from 'node:fs';

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

Если файл ранее был короче `len` байт, то он расширяется, а расширенная часть заполняется нулевыми байтами (`'\0'`):

Если `len` отрицательно, то будет использоваться `0`.

### `fs.futimes(fd, atime, mtime, callback)`

- `fd` {целое число}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}
- `callback` {Function}
  - `err` {Ошибка}

Изменяет временные метки файловой системы объекта, на который ссылается предоставленный файловый дескриптор. См. [`fs.utimes()`](#fsutimespath-atime-mtime-callback).

### `fs.lchmod(path, mode, callback)`

- `path` {string|Buffer|URL}
- `mode` {integer}
- `callback` {функция}
  - `err` {Error|AggregateError}

Изменяет права доступа к символической ссылке. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Этот метод реализован только в macOS.

Более подробную информацию см. в документации POSIX lchmod(2).

### `fs.lchown(path, uid, gid, callback)`

- `path` {string|Buffer|URL}
- `uid` {integer}
- `gid` {целое число}
- `callback` {Function}
  - `err` {Ошибка}

Установить владельца символической ссылки. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробно см. документацию POSIX lchown(2).

### `fs.lutimes(path, atime, mtime, callback)`

- `path` {string|Buffer|URL}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}
- `callback` {Function}
  - `err` {Ошибка}

Изменяет время доступа и модификации файла так же, как [`fs.utimes()`](#fsutimespath-atime-mtime-callback), с той разницей, что если путь ссылается на символическую ссылку, то ссылка не разыменовывается: вместо этого изменяются временные метки самой символической ссылки.

Обратному вызову завершения не передается никаких аргументов, кроме возможного исключения.

### `fs.link(existingPath, newPath, callback)`

- `existingPath` {string|Buffer|URL}
- `newPath` {string|Buffer|URL}
- `callback` {Function}
  - `err` {Ошибка}

Создает новую ссылку с `existingPath` на `newPath`. Более подробно см. документацию POSIX link(2). Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

### `fs.lstat(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.Stats}

Получает {fs.Stats} для символической ссылки, на которую ссылается путь. Обратный вызов получает два аргумента `(err, stats)`, где `stats` - объект {fs.Stats}. `lstat()` идентичен `stat()`, за исключением того, что если `path` является символической ссылкой, то статизируется сама ссылка, а не файл, на который она ссылается.

Более подробно см. документацию POSIX lstat(2).

### `fs.mkdir(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object|integer}
  - `recursive` {boolean} **По умолчанию:** `false`
  - `mode` {string|integer} Не поддерживается в Windows. **По умолчанию:** `0o777`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `path` {string|undefined} Присутствует, только если каталог создается с `recursive`, установленным в `true`.

Асинхронно создает каталог.

В обратный вызов передается возможное исключение и, если `recursive` - `true`, первый созданный путь к каталогу, `(err[, path])`. Если `recursive` равно `true`, то `path` может быть `undefined`, если каталог не был создан.

Необязательный аргумент `options` может быть целым числом, определяющим `режим` (разрешение и липкие биты), или объектом со свойством `режим` и свойством `recursive`, указывающим, следует ли создавать родительские каталоги. Вызов `fs.mkdir()`, когда `path` является существующим каталогом, приводит к ошибке, только если `recursive` равно false.

```mjs
import { mkdir } from 'node:fs';

// Создает /tmp/a/apple, независимо от того, существуют ли `/tmp` и /tmp/a.
mkdir('/tmp/a/apple', { recursive: true }, (err) => {
  if (err) throw err;
});
```

В Windows использование `fs.mkdir()` для корневого каталога даже с рекурсией приведет к ошибке:

```mjs
import { mkdir } from 'node:fs';

mkdir('/', { recursive: true }, (err) => {
  // => [Error: EPERM: операция не разрешена, mkdir 'C:\']
});
```

Более подробную информацию смотрите в документации POSIX mkdir(2).

### `fs.mkdtemp(prefix[, options], callback)`

- `prefix` {string}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
- `callback` {Function}
  - `err` {Ошибка}
  - `directory` {string}

Создает уникальный временный каталог.

Генерирует шесть случайных символов, которые будут добавлены после требуемого `префикса` для создания уникального временного каталога. Из-за несоответствия платформ избегайте символов `X` в `prefix`. Некоторые платформы, в частности BSD, могут возвращать более шести случайных символов и заменять символы `X` в `prefix` случайными символами.

Созданный путь к каталогу передается в виде строки во второй параметр обратного вызова.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим используемую кодировку.

```mjs
import { mkdtemp } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

mkdtemp(join(tmpdir(), 'foo-'), (err, directory) => {
  if (err) throw err;
  console.log(directory);
  // Печатает: /tmp/foo-itXde2 или C:\Users\...\AppData\Local\Temp\foo-itXde2
});
```

Метод `fs.mkdtemp()` добавит шесть случайно выбранных символов непосредственно к строке `prefix`. Например, при заданном каталоге `/tmp`, если предполагается создать временный каталог _внутри_ `/tmp`, то `префикс` должен заканчиваться идущим в конце разделителем путей, специфичным для платформы (`require('node:path').sep`).

```mjs
import { tmpdir } from 'node:os';
import { mkdtemp } from 'node:fs';

// Родительский каталог для нового временного каталога
const tmpDir = tmpdir();

// Этот метод *НЕПРАВИЛЬНЫЙ*:
mkdtemp(tmpDir, (err, directory) => {
  if (err) throw err;
  console.log(directory);
  // Будет выведено что-то похожее на `/tmpabc123`.
  // Новый временный каталог создается в корне файловой системы.
  // а не *внутри* каталога /tmp.
});

// Этот метод является *КОРРЕКТНЫМ*:
import { sep } from 'node:path';
mkdtemp(`${tmpDir}${sep}`, (err, directory) => {
  if (err) throw err;
  console.log(directory);
  // Будет выведено что-то похожее на `/tmp/abc123`.
  // Создается новый временный каталог внутри
  // каталога /tmp.
});
```

### `fs.open(path[, flags[, mode]], callback)`

- `path` {string|Buffer|URL}
- `flags` {string|number} См. [поддержка файловой системы `flags`](#file-system-flags). **По умолчанию:** `'r'`.
- `mode` {string|integer} **По умолчанию:** `0o666` (доступен для чтения и записи).
- `callback` {Функция}
  - `err` {Ошибка}
  - `fd` {integer}

Асинхронное открытие файла. Подробнее см. документацию POSIX open(2).

`mode` устанавливает режим файла (разрешение и липкие биты), но только если файл был создан. В Windows можно управлять только разрешением на запись; см. [`fs.chmod()`](#fschmodpath-mode-callback).

Обратный вызов получает два аргумента `(err, fd)`.

Некоторые символы (`< > : " / \ | ? *`) зарезервированы в Windows, как описано в [Naming Files, Paths, and Namespaces](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file). В NTFS, если имя файла содержит двоеточие, Node.js откроет поток файловой системы, как описано на [этой странице MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams).

Функции, основанные на `fs.open()`, также демонстрируют такое поведение: `fs.writeFile()`, `fs.readFile()` и т.д.

### `fs.openAsBlob(path[, options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- `path` {string|Buffer|URL}
- `options` {Object}
  - `type` {string} Необязательный тип mime для блоба.
- Возвращает: {Promise}, содержащий {Blob}.

Возвращает {Blob}, данные которого хранятся в указанном файле.

Файл не должен быть изменен после создания {Blob}. Любые изменения приведут к тому, что чтение данных {Blob} завершится с ошибкой `DOMException`. Синхронные stat-операции над файлом при создании `Blob` и перед каждым чтением, чтобы определить, были ли данные файла изменены на диске.

```mjs
import { openAsBlob } from 'node:fs';

const blob = await openAsBlob('the.file.txt');
const ab = await blob.arrayBuffer();
blob.stream();
```

```cjs
const { openAsBlob } = require('node:fs');

(async () => {
  const blob = await openAsBlob('the.file.txt');
  const ab = await blob.arrayBuffer();
  blob.stream();
})();
```

### `fs.opendir(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `bufferSize` {number} Количество записей каталога, которые буферизируются внутри каталога при чтении из него. Большие значения приводят к лучшей производительности, но увеличивают потребление памяти. **По умолчанию:** `32`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `dir` {fs.Dir}

Асинхронно открыть каталог. Подробнее см. документацию POSIX opendir(3).

Создает {fs.Dir}, который содержит все дальнейшие функции для чтения из каталога и его очистки.

Опция `encoding` устанавливает кодировку для `пути` при открытии каталога и последующих операциях чтения.

### `fs.read(fd, buffer, offset, length, position, callback)`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView} Буфер, в который будут записаны данные.
- `offset` {integer} Позиция в `buffer` для записи данных.
- `length` {integer} Количество байтов для чтения.
- `position` {integer|bigint|null} Указывает, с какого места в файле начинать чтение. Если `position` равно `null` или `-1`, данные будут прочитаны из текущей позиции файла, а позиция файла будет обновлена. Если `position` - целое число, позиция файла останется неизменной.
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {целое число}
  - `buffer` {Буфер}

Чтение данных из файла, указанного `fd`.

Обратный вызов получает три аргумента, `(err, bytesRead, buffer)`.

Если файл не модифицируется параллельно, то конец файла будет достигнут, когда количество прочитанных байт будет равно нулю.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает обещание для `Object` со свойствами `bytesRead` и `buffer`.

### `fs.read(fd[, options], callback)`

- `fd` {integer}
- `options` {Object}
  - `buffer` {Buffer|TypedArray|DataView} **По умолчанию:** `Buffer.alloc(16384)`
  - `offset` {integer} **По умолчанию:** `0`
  - `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
  - `позиция` {integer|bigint|null} **По умолчанию:** `null`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {integer}
  - `buffer` {Буфер}

Подобно функции [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback), эта версия принимает необязательный объект `options`. Если объект `options` не указан, то по умолчанию будут использоваться вышеуказанные значения.

### `fs.read(fd, buffer[, options], callback)`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView} Буфер, в который будут записаны данные.
- `options` {Object}
  - `offset` {integer} **По умолчанию:** `0`.
  - `length` {integer} **По умолчанию:** `buffer.byteLength - offset`.
  - `позиция` {integer|bigint} **По умолчанию:** `null`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {integer}
  - `buffer` {Буфер}

Подобно функции [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback), эта версия принимает необязательный объект `options`. Если объект `options` не указан, то по умолчанию будут использоваться вышеуказанные значения.

### `fs.readdir(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
  - `withFileTypes` {boolean} **По умолчанию:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `files` {string\[\]|Buffer\[\]|fs.Dirent\[\]}

Читает содержимое каталога. Обратный вызов получает два аргумента `(err, files)`, где `files` - массив имен файлов в каталоге, исключая `'.'` и `...`.

Подробнее см. документацию POSIX readdir(3).

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для имен файлов, передаваемых обратному вызову. Если `encoding` имеет значение `'buffer'`, возвращаемые имена файлов будут передаваться как объекты {Buffer}.

Если `options.withFileTypes` имеет значение `true`, массив `files` будет содержать объекты {fs.Dirent}.

### `fs.readFile(path[, options], callback)`

- `path` {string|Buffer|URL|integer} имя файла или дескриптор файла
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `null`
  - `flag` {string} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'r'`.
  - `signal` {AbortSignal} позволяет прервать выполняющийся readFile
- `callback` {Функция}
  - `err` {Error|AggregateError}
  - `data` {string|Buffer}

Асинхронно считывает все содержимое файла.

```mjs
import { readFile } from 'node:fs';

readFile('/etc/passwd', (err, data) => {
  if (err) throw err;
  console.log(data);
});
```

Обратному вызову передаются два аргумента `(err, data)`, где `data` - содержимое файла.

Если кодировка не указана, то возвращается необработанный буфер.

Если `options` - строка, то она определяет кодировку:

```mjs
import { readFile } from 'node:fs';

readFile('/etc/passwd', 'utf8', callback);
```

Когда путь является каталогом, поведение `fs.readFile()` и [`fs.readFileSync()`](#fsreadfilesyncpath-options) зависит от платформы. В macOS, Linux и Windows будет возвращена ошибка. На FreeBSD будет возвращено представление содержимого каталога.

```mjs
import { readFile } from 'node:fs';

// macOS, Linux и Windows
readFile('<директория>', (err, data) => {
  // => [Error: EISDIR: недопустимая операция над каталогом, read <directory>]
});

// FreeBSD
readFile('<директория>', (err, data) => {
  // => null, <data>
});
```

Можно прервать текущий запрос, используя `AbortSignal`. При прерывании запроса вызывается обратный вызов с `AbortError`:

```mjs
import { readFile } from 'node:fs';

const controller = new AbortController();
const signal = controller.signal;
readFile(fileInfo[0].name, { signal }, (err, buf) => {
  // ...
});
// Когда вы хотите прервать запрос
controller.abort();
```

Функция `fs.readFile()` буферизирует весь файл. Для минимизации затрат памяти, когда это возможно, предпочитайте потоковую передачу через `fs.createReadStream()`.

Прерывание текущего запроса прерывает не отдельные запросы операционной системы, а внутреннюю буферизацию, которую выполняет `fs.readFile`.

#### Дескрипторы файлов

1.  Любой указанный дескриптор файла должен поддерживать чтение.
2.  Если дескриптор файла указан в качестве `пути`, он не будет закрыт автоматически.
3.  Чтение начнется с текущей позиции. Например, если в файле уже есть `'Hello World'' и шесть байт прочитаны с помощью дескриптора файла, вызов `fs.readFile()`с тем же дескриптором файла выдаст`'World'', а не `'Hello World''.

#### Соображения по производительности

Метод `fs.readFile()` асинхронно считывает содержимое файла в память по одному куску за раз, позволяя циклу событий обращаться между каждым куском. Это позволяет операции чтения меньше влиять на другие действия, которые могут использовать базовый пул потоков libuv, но означает, что чтение всего файла в память займет больше времени.

Дополнительные накладные расходы на чтение могут сильно отличаться на разных системах и зависят от типа считываемого файла. Если тип файла не является обычным (например, pipe) и Node.js не может определить фактический размер файла, каждая операция чтения будет загружать 64 КиБ данных. Для обычных файлов каждая операция чтения будет обрабатывать 512 KiB данных.

Для приложений, требующих максимально быстрого чтения содержимого файла, лучше использовать `fs.read()` напрямую, и чтобы код приложения сам управлял чтением полного содержимого файла.

Выпуск Node.js GitHub [\#25741](https://github.com/nodejs/node/issues/25741) предоставляет больше информации и подробный анализ производительности `fs.readFile()` для файлов различных размеров в различных версиях Node.js.

### `fs.readlink(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
- `callback` {Function}
  - `err` {Ошибка}
  - `linkString` {string|Buffer}

Читает содержимое символической ссылки, на которую ссылается `path`. Обратный вызов получает два аргумента `(err, linkString)`.

Более подробную информацию смотрите в документации POSIX readlink(2).

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для пути к ссылке, переданной обратному вызову. Если `encoding` имеет значение `'buffer'`, возвращаемый путь к ссылке будет передан в виде объекта {Buffer}.

### `fs.readv(fd, buffers[, position], callback)`

- `fd` {целое число}
- `buffers` {ArrayBufferView\[\]}
- `position` {integer|null} **По умолчанию:** `null`
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesRead` {integer}
  - `buffers` {ArrayBufferView\[\]}

Чтение из файла, указанного `fd`, и запись в массив `ArrayBufferView` с помощью `readv()`.

`position` - это смещение от начала файла, откуда должны быть считаны данные. Если `typeof position !== 'number'`, данные будут считаны с текущей позиции.

Обратный вызов будет иметь три аргумента: `err`, `bytesRead` и `buffers`. `bytesRead` - это сколько байт было прочитано из файла.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает обещание для `Object` со свойствами `bytesRead` и `buffers`.

### `fs.realpath(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
- `callback` {Function}
  - `err` {Ошибка}
  - `resolvedPath` {string|Buffer}

Асинхронно вычисляет каноническое имя пути, разрешая `.`, `..` и символические ссылки.

Каноническое имя пути не обязательно уникально. Жесткие ссылки и связывающее монтирование могут открывать объект файловой системы через множество имен путей.

Эта функция ведет себя подобно realpath(3), за некоторыми исключениями:

1.  В файловых системах, нечувствительных к регистру, преобразование регистра не выполняется.

2.  Максимальное количество символических ссылок не зависит от платформы и обычно (намного) больше, чем поддерживает родная реализация realpath(3).

Функция `callback` получает два аргумента `(err, resolvedPath)`. Может использовать `process.cwd` для разрешения относительных путей.

Поддерживаются только пути, которые могут быть преобразованы в строки UTF8.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для пути, переданного обратному вызову. Если `encoding` имеет значение `'buffer'`, то возвращаемый путь будет передан как объект {Buffer}.

Если `путь` разрешается в сокет или трубу, функция вернет системно-зависимое имя для этого объекта.

### `fs.realpath.native(path[, options], callback)`

- `путь` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
- `callback` {Function}
  - `err` {Ошибка}
  - `resolvedPath` {string|Buffer}

Асинхронный realpath(3).

Функция `callback` получает два аргумента `(err, resolvedPath)`.

Поддерживаются только пути, которые могут быть преобразованы в строки UTF8.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для пути, переданного обратному вызову. Если `encoding` имеет значение `'buffer'`, возвращаемый путь будет передан в виде объекта {Buffer}.

В Linux, когда Node.js слинкован с musl libc, файловая система procfs должна быть смонтирована на `/proc`, чтобы эта функция работала. В Glibc такого ограничения нет.

### `fs.rename(oldPath, newPath, callback)`

- `oldPath` {string|Buffer|URL}
- `newPath` {string|Buffer|URL}
- `callback` {Function}
  - `err` {Ошибка}

Асинхронно переименовать файл по адресу `oldPath` в имя пути, указанное как `newPath`. В случае, если `newPath` уже существует, он будет перезаписан. Если по адресу `newPath` существует каталог, то вместо этого будет выдана ошибка. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

См. также: rename(2).

```mjs
import { rename } from 'node:fs';

rename('oldFile.txt', 'newFile.txt', (err) => {
  if (err) throw err;
  console.log('Переименование завершено!');
});
```

### `fs.rmdir(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `maxRetries` {целое число} Если встречается ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js повторяет операцию с линейным ожиданием обратного хода на `retryDelay` миллисекунд дольше при каждой попытке. Этот параметр представляет собой количество повторных попыток. Этот параметр игнорируется, если параметр `recursive` не равен `true`. **По умолчанию:** `0`.
  - `recursive` {boolean} Если `true`, выполнить рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при неудаче. **По умолчанию:** `false`. **удалено.**
  - `retryDelay` {integer} Количество времени в миллисекундах для ожидания между повторными попытками. Эта опция игнорируется, если опция `recursive` не является `true`. **По умолчанию:** `100`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронный rmdir(2). Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Использование `fs.rmdir()` для файла (не каталога) приводит к ошибке `ENOENT` в Windows и ошибке `ENOTDIR` в POSIX.

Чтобы получить поведение, аналогичное Unix-команде `rm -rf`, используйте [`fs.rm()`](#fsrmpath-options-callback) с опциями `{ recursive: true, force: true }`.

### `fs.rm(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `force` {boolean} Если `true`, исключения будут игнорироваться, если `path` не существует. **По умолчанию:** `false`.
  - `maxRetries` {integer} Если возникла ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js будет повторять операцию с линейным ожиданием обратного хода на `retryDelay` миллисекунд дольше при каждой попытке. Этот параметр представляет собой количество повторных попыток. Этот параметр игнорируется, если параметр `recursive` не является `true`. **По умолчанию:** `0`.
  - `recursive` {boolean} Если `true`, выполнить рекурсивное удаление. В рекурсивном режиме операции повторяются при неудаче. **По умолчанию:** `false`.
  - `retryDelay` {integer} Количество времени в миллисекундах для ожидания между повторными попытками. Эта опция игнорируется, если опция `recursive` не является `true`. **По умолчанию:** `100`.
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно удаляет файлы и каталоги (по образцу стандартной утилиты POSIX `rm`). Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

### `fs.stat(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.Stats}

Асинхронный stat(2). Обратный вызов получает два аргумента `(err, stats)`, где `stats` - объект {fs.Stats}.

В случае ошибки, `err.code` будет одним из [Common System Errors](errors.md#common-system-errors).

Использование `fs.stat()` для проверки существования файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. Вместо этого пользовательский код должен открывать/читать/записывать файл напрямую и обрабатывать ошибку, возникающую при отсутствии файла.

Для проверки существования файла без последующих манипуляций с ним рекомендуется использовать [`fs.access()`](#fsaccesspath-mode-callback).

Например, дана следующая структура каталогов:

```text
- txtDir
-- file.txt
- app.js
```

Следующая программа проверит статистику заданных путей:

```mjs
import { stat } from 'node:fs';

const pathsToCheck = ['./txtDir', './txtDir/file.txt'];

for (let i = 0; i < pathsToCheck.length; i++) {
  stat(pathsToCheck[i], (err, stats) => {
    console.log(stats.isDirectory());
    console.log(stats);
  });
}
```

Результирующий вывод будет выглядеть следующим образом:

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

### `fs.statfs(path[, options], callback)`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.StatFs} быть `bigint`. **По умолчанию:** `false`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `stats` {fs.StatFs}

Асинхронный statfs(2). Возвращает информацию о смонтированной файловой системе, содержащей `path`. Обратный вызов получает два аргумента `(err, stats)`, где `stats` - объект {fs.StatFs}.

В случае ошибки, `err.code` будет одним из [Common System Errors](errors.md#common-system-errors).

### `fs.symlink(target, path[, type], callback)`

- `target` {string|Buffer|URL}
- `path` {string|Buffer|URL}
- `type` {string|null} **По умолчанию:** `null`
- `callback` {Функция}
  - `err` {Ошибка}

Создает ссылку с именем `path`, указывающую на `target`. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

Более подробную информацию см. в документации POSIX symlink(2).

Аргумент `type` доступен только в Windows и игнорируется на других платформах. Он может быть установлен в `'dir'`, `'file'` или `'junction'`. Если аргумент `type` не является строкой, Node.js будет автоматически определять тип `target` и использовать `'file'` или `'dir'`. Если `target` не существует, будет использован `'file'`. Точки пересечения Windows требуют, чтобы путь назначения был абсолютным. При использовании `'junction'` аргумент `target` будет автоматически нормализован к абсолютному пути.

Относительные цели являются относительными по отношению к родительскому каталогу ссылки.

```mjs
import { symlink } from 'node:fs';

symlink('./mew', './mewtwo', callback);
```

Приведенный выше пример создает символическую ссылку `mewtwo`, которая указывает на `mew` в том же каталоге:

```bash
$ tree .
.
├── mew
└── mewtwo -> ./mew
```

### `fs.truncate(path[, len], callback)`

- `path` {string|Buffer|URL}
- `len` {целое число} **По умолчанию:** `0`
- `callback` {Function}
  - `err` {Error|AggregateError}

Усекает файл. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения. В качестве первого аргумента может быть передан дескриптор файла. В этом случае вызывается `fs.ftruncate()`.

```mjs
import { truncate } from 'node:fs';
// Предполагаем, что 'path/file.txt' - обычный файл.
truncate('path/file.txt', (err) => {
  if (err) throw err;
  console.log('path/file.txt was truncated');
});
```

```cjs
const { truncate } = require('node:fs');
// Предполагаем, что 'path/file.txt' - обычный файл.
truncate('path/file.txt', (err) => {
  if (err) throw err;
  console.log('path/file.txt was truncated');
});
```

Передача дескриптора файла является устаревшей и в будущем может привести к ошибке.

Более подробную информацию смотрите в документации по POSIX truncate(2).

### `fs.unlink(path, callback)`

- `path` {string|Buffer|URL}
- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно удаляет файл или символическую ссылку. Никакие аргументы, кроме возможного исключения, не передаются обратному вызову завершения.

```mjs
import { unlink } from 'node:fs';
// Предполагается, что 'path/file.txt' - обычный файл.
unlink('path/file.txt', (err) => {
  if (err) throw err;
  console.log('path/file.txt был удален');
});
```

`fs.unlink()` не будет работать с каталогом, пустым или иным. Чтобы удалить каталог, используйте [`fs.rmdir()`](#fsrmdirpath-options-callback).

Более подробную информацию смотрите в документации POSIX unlink(2).

### `fs.unwatchFile(filename[, listener])`

- `filename` {string|Buffer|URL}
- `listener` {Function} Необязательно, слушатель, ранее подключенный с помощью `fs.watchFile()`.

Прекратить наблюдение за изменениями в `filename`. Если указан `listener`, то удаляется только этот конкретный слушатель. В противном случае удаляются _все_ слушатели, фактически прекращая наблюдение за `filename`.

Вызов `fs.unwatchFile()` с именем файла, за которым не ведется наблюдение, - это отказ, а не ошибка.

Использование [`fs.watch()`](#fswatchfilename-options-listener) более эффективно, чем `fs.watchFile()` и `fs.unwatchFile()`. По возможности следует использовать `fs.watch()` вместо `fs.watchFile()` и `fs.unwatchFile()`.

### `fs.utimes(path, atime, mtime, callback)`

- `path` {string|Buffer|URL}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}
- `callback` {Function}
  - `err` {Ошибка}

Изменение временных меток файловой системы объекта, на который ссылается `path`.

Аргументы `atime` и `mtime` следуют этим правилам:

- Значения могут быть либо числами, представляющими время эпохи Unix в секундах, `Date`, либо числовой строкой типа `'123456789.0'`.
- Если значение не может быть преобразовано в число, или является `NaN`, `Infinity`, или `-Infinity`, будет выдана ошибка `Error`.

### `fs.watch(filename[, options][, listener])`

- `filename` {string|Buffer|URL}
- `options` {string|Object}
  - `persistent` {boolean} Указывает, должен ли процесс продолжать выполняться, пока просматриваются файлы. **По умолчанию:** `true`.
  - `recursive` {boolean} Указывает, должны ли просматриваться все подкаталоги или только текущий каталог. Применяется, если указан каталог, и только на поддерживаемых платформах (см. [caveats](#caveats)). **По умолчанию:** `false`.
  - `encoding` {string} Указывает кодировку символов, которая будет использоваться для имени файла, передаваемого слушателю. **По умолчанию:** `'utf8'`.
  - `signal` {AbortSignal} позволяет закрыть наблюдатель с помощью сигнала AbortSignal.
- `listener` {Function|undefined} **По умолчанию:** `undefined`.
  - `eventType` {string}
  - `filename` {string|Buffer}
- Возвращает: {fs.FSWatcher}

Следит за изменениями в `filename`, где `filename` - это либо файл, либо каталог.

Второй аргумент необязателен. Если `options` предоставлен как строка, то он определяет `кодировку`. В противном случае `options` следует передать как объект.

Обратный вызов слушателя получает два аргумента `(eventType, filename)`. `eventType` - это либо `переименование`, либо `изменение`, а `filename` - это имя файла, вызвавшего событие.

На большинстве платформ событие `'rename'` происходит всякий раз, когда имя файла появляется или исчезает в каталоге.

Обратный вызов слушателя прикрепляется к событию `'change'`, запускаемому {fs.FSWatcher}, но это не то же самое, что значение `'change'` в `eventType`.

Если передан `signal`, прерывание соответствующего AbortController закроет возвращенный {fs.FSWatcher}.

#### Предостережения

API `fs.watch` не на 100% совместим на разных платформах и в некоторых ситуациях недоступен.

В Windows не будет выдаваться никаких событий, если наблюдаемый каталог перемещен или переименован. При удалении наблюдаемого каталога будет выдана ошибка `EPERM`.

##### Доступность

Эта возможность зависит от того, предоставляет ли базовая операционная система способ уведомления об изменениях в файловой системе.

- В системах Linux для этого используется [`inotify(7)`](https://man7.org/linux/man-pages/man7/inotify.7.html).
- В системах BSD для этого используется [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2).
- В macOS используется [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2) для файлов и [`FSEvents`](https://developer.apple.com/documentation/coreservices/file_system_events) для каталогов.
- В системах SunOS (включая Solaris и SmartOS) для этого используется [`event ports`](https://illumos.org/man/port_create).
- В системах Windows эта функция зависит от [`ReadDirectoryChangesW`](https://docs.microsoft.com/en-us/windows/desktop/api/winbase/nf-winbase-readdirectorychangesw).
- В системах AIX эта функция зависит от [`AHAFS`](https://developer.ibm.com/articles/au-aix_event_infrastructure/), который должен быть включен.
- В системах IBM i эта функция не поддерживается.

Если базовая функциональность по какой-то причине недоступна, то `fs.watch()` не сможет работать и может выдать исключение. Например, наблюдение за файлами или каталогами может быть ненадежным, а в некоторых случаях невозможным, на сетевых файловых системах (NFS, SMB и т.д.) или файловых системах хостов при использовании программ виртуализации, таких как Vagrant или Docker.

Все еще можно использовать `fs.watchFile()`, который использует stat polling, но этот метод медленнее и менее надежен.

##### Иноды

В системах Linux и macOS функция `fs.watch()` разрешает путь к [inode](https://en.wikipedia.org/wiki/Inode) и следит за этим inode. Если наблюдаемый путь удаляется и создается заново, ему присваивается новый inode. Часы выдадут событие для удаления, но продолжат наблюдать за _оригинальным_ inode. События для нового inode не будут испускаться. Это ожидаемое поведение.

Файлы AIX сохраняют один и тот же инод в течение всего времени существования файла. Сохранение и закрытие просматриваемого файла на AIX приведет к двум уведомлениям (одно для добавления нового содержимого и одно для усечения).

##### Аргумент имя файла

Предоставление аргумента `filename` в обратном вызове поддерживается только в Linux, macOS, Windows и AIX. Даже на поддерживаемых платформах не всегда гарантируется, что аргумент `filename` будет предоставлен. Поэтому не стоит полагать, что аргумент `filename` всегда будет предоставлен в обратном вызове, и иметь некоторую логику отката, если он `null`.

```mjs
import { watch } from 'node:fs';
watch('somedir', (eventType, filename) => {
  console.log(`тип события: ${eventType}`);
  if (filename) {
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});
```

### `fs.watchFile(filename[, options], listener)`

- `filename` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} **По умолчанию:** `false`
  - `persistent` {boolean} **По умолчанию:** `true`
  - `интервал` {целое число} **По умолчанию:** `5007`.
- `слушатель` {функция}
  - `текущий` {fs.Stats}
  - `предыдущий` {fs.Stats}
- Возвращает: {fs.StatWatcher}

Следит за изменениями в `filename`. Обратный вызов `listener` будет вызываться каждый раз при обращении к файлу.

Аргумент `options` может быть опущен. Если он указан, то должен быть объектом. Объект `options` может содержать булево значение `persistent`, которое указывает, должен ли процесс продолжать выполняться, пока ведется наблюдение за файлами. Объект `options` может содержать свойство `interval`, указывающее на частоту опроса цели в миллисекундах.

Слушатель получает два аргумента: текущий объект stat и предыдущий объект stat:

```mjs
import { watchFile } from 'node:fs';

watchFile('message.text', (curr, prev) => {
  console.log(`the current mtime is: ${curr.mtime}`);
  console.log(`предыдущее время было: ${prev.mtime}`);
});
```

Эти объекты stat являются экземплярами `fs.Stat`. Если опция `bigint` имеет значение `true`, числовые значения в этих объектах задаются как `BigInt`.

Чтобы получить уведомление о том, что файл был изменен, а не просто получен доступ, необходимо сравнить `curr.mtimeMs` и `prev.mtimeMs`.

Когда операция `fs.watchFile` приводит к ошибке `ENOENT`, она вызывает слушателя один раз, со всеми обнуленными полями (или, для дат, эпохой Unix). Если файл будет создан позже, слушатель будет вызван снова, с последними объектами stat. Это изменение в функциональности по сравнению с v0.10.

Использование [`fs.watch()`](#fswatchfilename-options-listener) более эффективно, чем `fs.watchFile` и `fs.unwatchFile`. По возможности, `fs.watch` следует использовать вместо `fs.watchFile` и `fs.unwatchFile`.

Когда файл, за которым следит `fs.watchFile()`, исчезает и появляется вновь, то содержимое `previous` во втором событии обратного вызова (появление файла вновь) будет таким же, как и содержимое `previous` в первом событии обратного вызова (его исчезновение).

Это происходит, когда:

- файл удаляется, а затем восстанавливается
- файл переименовывается, а затем переименовывается во второй раз, возвращаясь к своему первоначальному имени

### `fs.write(fd, buffer, offset[, length[, position]], callback)`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView}
- `offset` {integer} **По умолчанию:** `0`
- `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
- `позиция` {integer|null} **По умолчанию:** `null`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesWritten` {integer}
  - `buffer` {Buffer|TypedArray|DataView}

Записывает `buffer` в файл, указанный `fd`.

`offset` определяет часть буфера, которая будет записана, а `length` - целое число, указывающее количество байт для записи.

`position` указывает на смещение от начала файла, куда должны быть записаны эти данные. Если `typeof position !== 'number'`, данные будут записаны в текущей позиции. См. pwrite(2).

Обратный вызов получит три аргумента `(err, bytesWritten, buffer)`, где `bytesWritten` указывает, сколько _байтов_ было записано из `buffer`.

Если этот метод вызывается как его [`util.promisify()`](util.md#utilpromisifyoriginal)ed версия, он возвращает обещание для `Object` со свойствами `bytesWritten` и `buffer`.

Небезопасно использовать `fs.write()` несколько раз на одном и том же файле, не дожидаясь обратного вызова. Для этого сценария рекомендуется использовать [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

### `fs.write(fd, buffer[, options], callback)`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView}
- `options` {Object}
  - `offset` {integer} **По умолчанию:** `0`
  - `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
  - `позиция` {целое число} **По умолчанию:** `null`.
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesWritten` {integer}
  - `buffer` {Buffer|TypedArray|DataView}

Запись `buffer` в файл, указанный `fd`.

Подобно описанной выше функции `fs.write`, эта версия принимает необязательный объект `options`. Если объект `options` не указан, то по умолчанию будут использоваться указанные выше значения.

### `fs.write(fd, string[, position[, encoding]], callback)`

- `fd` {целое}
- `строка` {строка}
- `position` {integer|null} **По умолчанию:** `null`
- `encoding` {string} **По умолчанию:** `'utf8'`.
- `callback` {Function}
  - `err` {Ошибка}
  - `written` {integer}
  - `string` {string}

Записывает `string` в файл, указанный `fd`. Если `string` не является строкой, будет выдано исключение.

`position` означает смещение от начала файла, куда должны быть записаны эти данные. Если `typeof position !== 'number'`, то данные будут записаны в текущей позиции. См. pwrite(2).

`encoding` - ожидаемая кодировка строки.

Обратный вызов получает аргументы `(err, written, string)`, где `written` указывает, сколько _байт_ переданной строки требуется записать. Записанные байты не обязательно совпадают с записанными символами строки. См. [`Buffer.byteLength`](buffer.md#static-method-bufferbytelengthstring-encoding).

Небезопасно использовать `fs.write()` несколько раз на одном и том же файле, не дожидаясь обратного вызова. Для этого сценария рекомендуется использовать [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

В Windows, если дескриптор файла подключен к консоли (например, `fd == 1` или `stdout`), строка, содержащая символы, не являющиеся символами ASCII, по умолчанию не будет отображаться должным образом, независимо от используемой кодировки. Можно настроить консоль на правильное отображение UTF-8, изменив активную кодовую страницу с помощью команды `chcp 65001`. Более подробную информацию смотрите в документации [chcp](https://ss64.com/nt/chcp.html).

### `fs.writeFile(file, data[, options], callback)`

- `file` {string|Buffer|URL|integer} имя файла или дескриптор файла
- `data` {string|Buffer|TypedArray|DataView}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `mode` {integer} **По умолчанию:** `0o666`
  - `флаг` {строка} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'w'`.
  - `signal` {AbortSignal} позволяет прервать выполняющуюся записьFile
- `callback` {Function}
  - `err` {Error|AggregateError}

Если `file` - имя файла, асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой или буфером.

Когда `file` является дескриптором файла, поведение аналогично вызову `fs.write()` напрямую (что рекомендуется). См. примечания ниже об использовании файлового дескриптора.

Опция `encoding` игнорируется, если `data` является буфером.

Опция `mode` влияет только на вновь созданный файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

```mjs
import { writeFile } from 'node:fs';
import { Buffer } from 'node:buffer';

const data = new Uint8Array(Buffer.from('Hello Node.js'));
writeFile('message.txt', data, (err) => {
  if (err) throw err;
  console.log('Файл был сохранен!');
});
```

Если `options` - строка, то она определяет кодировку:

```mjs
import { writeFile } from 'node:fs';

writeFile('message.txt', 'Hello Node.js', 'utf8', callback);
```

Небезопасно использовать `fs.writeFile()` несколько раз на одном и том же файле, не дожидаясь обратного вызова. Для этого сценария рекомендуется использовать [`fs.createWriteStream()`](#fscreatewritestreampath-options).

Аналогично `fs.readFile` - `fs.writeFile` является удобным методом, который выполняет несколько внутренних вызовов `write` для записи переданного ему буфера. Для кода, чувствительного к производительности, следует использовать [`fs.createWriteStream()`](#fscreatewritestreampath-options).

Можно использовать {AbortSignal} для отмены `fs.writeFile()`. Отмена происходит "из лучших побуждений", и некоторое количество данных, вероятно, все еще будет записано.

```mjs
import { writeFile } from 'node:fs';
import { Buffer } from 'node:buffer';

const controller = new AbortController();
const { signal } = controller;
const data = new Uint8Array(Buffer.from('Hello Node.js'));
writeFile('message.txt', data, { signal }, (err) => {
  // Когда запрос прерывается - обратный вызов вызывается с AbortError
});
// Когда запрос должен быть прерван
controller.abort();
```

Прерывание текущего запроса не прерывает отдельные запросы операционной системы, а скорее внутреннюю буферизацию, которую выполняет `fs.writeFile`.

#### Использование `fs.writeFile()` с файловыми дескрипторами

Когда `file` является дескриптором файла, поведение почти идентично прямому вызову `fs.write()`, например:

```mjs
import { write } from 'node:fs';
import { Buffer } from 'node:buffer';

write(fd, Buffer.from(data, options.encoding), callback);
```

Отличие от прямого вызова `fs.write()` заключается в том, что при некоторых необычных условиях `fs.write()` может записать только часть буфера и потребуется повторная попытка записи оставшихся данных, тогда как `fs.writeFile()` повторяет попытки до тех пор, пока данные не будут записаны полностью (или не произойдет ошибка).

Последствия этого являются частым источником путаницы. В случае с файловым дескриптором файл не заменяется\! Данные не обязательно записываются в начало файла, и исходные данные файла могут оставаться до и/или после вновь записанных данных.

Например, если `fs.writeFile()` вызывается дважды подряд, сначала для записи строки `'Hello'`, затем для записи строки `', World'`, файл будет содержать `'Hello, World'`, и может содержать часть исходных данных файла (в зависимости от размера исходного файла и положения дескриптора файла). Если бы вместо дескриптора использовалось имя файла, то файл гарантированно содержал бы только `', World'`.

### `fs.writev(fd, buffers[, position], callback)`

- `fd` {целое число}
- `buffers` {ArrayBufferView\[\]}
- `position` {integer|null} **По умолчанию:** `null`
- `callback` {Функция}
  - `err` {Ошибка}
  - `bytesWritten` {integer}
  - `буферы` {ArrayBufferView\[\]}

Запись массива `ArrayBufferView` в файл, указанный `fd`, с помощью `writev()`.

`position` - это смещение от начала файла, куда должны быть записаны эти данные. Если `typeof position !== 'number'`, данные будут записаны на текущей позиции.

Обратный вызов будет иметь три аргумента: `err`, `bytesWritten` и `buffers`. `bytesWritten` - это сколько байт было записано из `buffers`.

Если этот метод [`util.promisify()`](util.md#utilpromisifyoriginal)ed, он возвращает обещание для `Object` со свойствами `bytesWritten` и `buffers`.

Небезопасно использовать `fs.writev()` несколько раз на одном и том же файле, не дожидаясь обратного вызова. Для этого сценария используйте [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

## Синхронный API

Синхронные API выполняют все операции синхронно, блокируя цикл событий до тех пор, пока операция не завершится или не завершится неудачно.

### `fs.accessSync(path[, mode])`

- `path` {string|Buffer|URL}
- `mode` {integer} **По умолчанию:** `fs.constants.F_OK`.

Синхронно проверяет разрешения пользователя для файла или каталога, указанного `path`. Аргумент `mode` является необязательным целым числом, которое указывает, какие проверки доступности должны быть выполнены. `mode` должно быть либо значением `fs.constants.F_OK`, либо маской, состоящей из побитового OR любого из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`). Проверьте [File access constants](#file-access-constants) на возможные значения `mode`.

Если какая-либо из проверок доступности не прошла, будет выброшена `ошибка`. В противном случае метод вернет `undefined`.

```mjs
import { accessSync, constants } from 'node:fs';

try {
  accessSync('etc/passwd', constants.R_OK | constants.W_OK);
  console.log('can read/write');
} catch (err) {
  console.error('нет доступа!');
}
```

### `fs.appendFileSync(path, data[, options])`

- `path` {string|Buffer|URL|number} имя файла или дескриптор файла
- `data` {string|Buffer}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `mode` {integer} **По умолчанию:** `0o666`
  - `флаг` {строка} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'a'`.

Синхронно добавлять данные в файл, создавая файл, если он еще не существует. `data` может быть строкой или {Buffer}.

Опция `mode` влияет только на вновь созданный файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

```mjs
import { appendFileSync } from 'node:fs';

try {
  appendFileSync('message.txt', 'данные для добавления');
  console.log(
    'Данные "data to append" были добавлены в файл!'
  );
} catch (err) {
  /* Обработка ошибки */
}
```

Если `options` - строка, то она указывает кодировку:

```mjs
import { appendFileSync } from 'node:fs';

appendFileSync('message.txt', 'data to append', 'utf8');
```

Путь" может быть указан как числовой дескриптор файла, который был открыт для добавления (с помощью `fs.open()` или `fs.openSync()`). Дескриптор файла не будет закрыт автоматически.

```mjs
import {
  openSync,
  closeSync,
  appendFileSync,
} from 'node:fs';

let fd;

try {
  fd = openSync('message.txt', 'a');
  appendFileSync(fd, 'data to append', 'utf8');
} catch (err) {
  /* Обработка ошибки */
} finally {
  if (fd !== undefined) closeSync(fd);
}
```

### `fs.chmodSync(path, mode)`

- `path` {string|Buffer|URL}
- `mode` {string|integer}

За подробной информацией обратитесь к документации асинхронной версии этого API: [`fs.chmod()`](#fschmodpath-mode-callback).

Более подробную информацию смотрите в документации POSIX chmod(2).

### `fs.chownSync(path, uid, gid)`

- `path` {string|Buffer|URL}
- `uid` {целое число}
- `gid` {целое число}

Синхронно изменяет владельца и группу файла. Возвращает `undefined`. Это синхронная версия [`fs.chown()`](#fschownpath-uid-gid-callback).

Более подробно см. документацию POSIX chown(2).

### `fs.closeSync(fd)`

- `fd` {целое число}

Закрывает дескриптор файла. Возвращает `undefined`.

Вызов `fs.closeSync()` на любом файловом дескрипторе (`fd`), который в настоящее время используется через любую другую операцию `fs`, может привести к неопределенному поведению.

Более подробную информацию смотрите в документации POSIX close(2).

### `fs.copyFileSync(src, dest[, mode])`

- `src` {string|Buffer|URL} имя исходного файла для копирования
- `dest` {string|Buffer|URL} имя файла назначения операции копирования
- `mode` {целое число} модификаторы для операции копирования. **По умолчанию:** `0`.

Синхронно копирует `src` в `dest`. По умолчанию `dest` перезаписывается, если он уже существует. Возвращает `undefined`. Node.js не дает никаких гарантий относительно атомарности операции копирования. Если после открытия файла назначения для записи произошла ошибка, Node.js попытается удалить его.

`mode` - необязательное целое число, определяющее поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

- `fs.constants.COPYFILE_EXCL`: Операция копирования завершится неудачно, если `dest` уже существует.
- `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать ссылку "копия на запись". Если платформа не поддерживает копирование при записи, то используется механизм резервного копирования.
- `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования будет пытаться создать ссылку "копия на запись". Если платформа не поддерживает копирование по записи, то операция завершится неудачей.

```mjs
import { copyFileSync, constants } from 'node:fs';

// destination.txt будет создан или перезаписан по умолчанию.
copyFileSync('source.txt', 'destination.txt');
console.log('source.txt был скопирован в destination.txt');

// При использовании COPYFILE_EXCL операция завершится неудачей, если файл destination.txt существует.
copyFileSync(
  'source.txt',
  'destination.txt',
  constants.COPYFILE_EXCL
);
```

### `fs.cpSync(src, dest[, options])`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

- `src` {string|URL} путь к источнику для копирования.
- `dest` {string|URL} путь назначения для копирования.
- `options` {Object}
  - `dereference` {boolean} разыменовывать симлинки. **По умолчанию:** `false`.
  - `errorOnExist` {boolean} если `force` равно `false`, а место назначения существует, выдать ошибку. **По умолчанию:** `false`.
  - `filter` {Function} Функция для фильтрации скопированных файлов/каталогов. Возвращает `true` для копирования элемента, `false` для его игнорирования. **По умолчанию:** `undefined`.
    - `src` {string} путь к источнику для копирования.
    - `dest` {строка} путь назначения для копирования.
    - Возвращает: {boolean}
  - `force` {boolean} перезаписать существующий файл или каталог. Операция копирования будет игнорировать ошибки, если вы установите значение false, а место назначения существует. Используйте опцию `errorOnExist`, чтобы изменить это поведение. **По умолчанию:** `true`.
  - `preserveTimestamps` {boolean} При значении `true` временные метки из `src` будут сохранены. **По умолчанию:** `false`.
  - `recursive` {boolean} копировать каталоги рекурсивно **По умолчанию:** `false`.
  - `verbatimSymlinks` {boolean} Если `true`, разрешение путей для симлинков будет пропущено. **По умолчанию:** `false`.

Синхронно копирует всю структуру каталога из `src` в `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог глобы не поддерживаются, и поведение аналогично `cp dir1/ dir2/`.

### `fs.existsSync(path)`

- `path` {string|Buffer|URL}
- Возвращает: {boolean}

Возвращает `true`, если путь существует, `false` в противном случае.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.exists()`](#fsexistspath-callback).

Функция `fs.exists()` устарела, а `fs.existsSync()` - нет. Параметр `callback` в `fs.exists()` принимает параметры, которые несовместимы с другими обратными вызовами Node.js. `fs.existsSync()` не использует обратный вызов.

```mjs
import { existsSync } from 'node:fs';

if (existsSync('/etc/passwd'))
  console.log('Путь существует.');
```

### `fs.fchmodSync(fd, mode)`

- `fd` {целое число}
- `mode` {string|integer}

Устанавливает разрешения на файл. Возвращает `неопределенное`.

Более подробную информацию смотрите в документации POSIX fchmod(2).

### `fs.fchownSync(fd, uid, gid)`

- `fd` {целое число}
- `uid` {целое число} Идентификатор пользователя нового владельца файла.
- `gid` {целое число} Идентификатор группы новой группы файла.

Устанавливает владельца файла. Возвращает `неопределено`.

Более подробно см. документацию POSIX fchown(2).

### `fs.fdatasyncSync(fd)`

- `fd` {целое число}

Переводит все текущие операции ввода-вывода, связанные с файлом, в состояние синхронизированного завершения ввода-вывода операционной системы. Подробности см. в документации POSIX fdatasync(2). Возвращает `undefined`.

### `fs.fstatSync(fd[, options])`

- `fd` {integer}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
- Возвращает: {fs.Stats}

Получает {fs.Stats} для дескриптора файла.

Более подробно см. документацию POSIX fstat(2).

### `fs.fsyncSync(fd)`

- `fd` {целое число}

Запрос на то, чтобы все данные для открытого дескриптора файла были сброшены на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. За более подробной информацией обратитесь к документации POSIX fsync(2). Возвращает `undefined`.

### `fs.ftruncateSync(fd[, len])`

- `fd` {целое число}
- `len` {целое число} **По умолчанию:** `0`.

Усекает дескриптор файла. Возвращает `undefined`.

Подробную информацию смотрите в документации асинхронной версии этого API: [`fs.ftruncate()`](#fsftruncatefd-len-callback).

### `fs.futimesSync(fd, atime, mtime)`

- `fd` {целое число}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}

Синхронная версия [`fs.futimes()`](#fsfutimesfd-atime-mtime-callback). Возвращает `undefined`.

### `fs.lchmodSync(path, mode)`

- `path` {string|Buffer|URL}
- `mode` {integer}

Изменяет разрешения на символическую ссылку. Возвращает `не определено`.

Этот метод реализован только на macOS.

Более подробную информацию смотрите в документации POSIX lchmod(2).

### `fs.lchownSync(path, uid, gid)`

- `path` {string|Buffer|URL}
- `uid` {integer} Идентификатор пользователя нового владельца файла.
- `gid` {целое число} Идентификатор группы новой группы файла.

Установить владельца для пути. Возвращает `неопределено`.

Подробнее см. документацию POSIX lchown(2).

### `fs.lutimesSync(path, atime, mtime)`

- `path` {string|Buffer|URL}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}

Изменение временных меток файловой системы символической ссылки, на которую ссылается `path`. Возвращает `undefined`, или выбрасывает исключение, если параметры неверны или операция не удалась. Это синхронная версия [`fs.lutimes()`](#fslutimespath-atime-mtime-callback).

### `fs.linkSync(existingPath, newPath)`

- `existingPath` {string|Buffer|URL}
- `newPath` {string|Buffer|URL}

Создает новую ссылку с `existingPath` на `newPath`. Более подробно см. документацию POSIX link(2). Возвращает `undefined`.

### `fs.lstatSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
  - `throwIfNoEntry` {boolean} Будет ли выбрасываться исключение при отсутствии записи в файловой системе, а не возвращать `undefined`. **По умолчанию:** `true`.
- Возвращает: {fs.Stats}

Получает {fs.Stats} для символической ссылки, на которую ссылается `path`.

Более подробную информацию смотрите в документации POSIX lstat(2).

### `fs.mkdirSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object|integer}
  - `recursive` {boolean} **По умолчанию:** `false`
  - `mode` {string|integer} Не поддерживается в Windows. **По умолчанию:** `0o777`.
- Возвращает: {string|undefined}

Синхронно создает каталог. Возвращает `undefined`, или, если `recursive` равно `true`, первый созданный путь к каталогу. Это синхронная версия [`fs.mkdir()`](#fsmkdirpath-options-callback).

Более подробную информацию смотрите в документации POSIX mkdir(2).

### `fs.mkdtempSync(prefix[, options])`

- `prefix` {string}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {string}

Возвращает путь к созданной директории.

Подробную информацию смотрите в документации асинхронной версии этого API: [`fs.mkdtemp()`](#fsmkdtempprefix-options-callback).

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим используемую кодировку символов.

### `fs.opendirSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `bufferSize` {number} Количество записей каталога, которые буферизируются внутри каталога при чтении из него. Большие значения приводят к лучшей производительности, но увеличивают потребление памяти. **По умолчанию:** `32`.
- Возвращает: {fs.Dir}

Синхронно открывает каталог. См. opendir(3).

Создает {fs.Dir}, который содержит все дальнейшие функции для чтения из каталога и его очистки.

Опция `encoding` устанавливает кодировку для `пути` при открытии каталога и последующих операциях чтения.

### `fs.openSync(path[, flags[, mode]])`

- `path` {string|Buffer|URL}
- `flags` {string|number} **По умолчанию:** `'r'`. См. [поддержка `флагов файловой системы`](#file-system-flags).
- `mode` {string|integer} **По умолчанию:** `0o666`.
- Возвращает: {число}

Возвращает целое число, представляющее дескриптор файла.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.open()`](#fsopenpath-flags-mode-callback).

### `fs.readdirSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8''
  - `withFileTypes` {boolean} **По умолчанию:** `false`.
- Возвращает: {string\[\]|Buffer\[\]|fs.Dirent\[\]}

Читает содержимое каталога.

Более подробно смотрите документацию POSIX readdir(3).

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для возвращаемых имен файлов. Если `encoding` имеет значение `'buffer'`, возвращаемые имена файлов будут передаваться как объекты {Buffer}.

Если `options.withFileTypes` имеет значение `true`, результат будет содержать объекты {fs.Dirent}.

### `fs.readFileSync(path[, options])`

- `path` {string|Buffer|URL|integer} имя файла или дескриптор файла
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `null`
  - `flag` {string} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'r'`.
- Возвращает: {string|Buffer}

Возвращает содержимое `пути`.

За подробной информацией обратитесь к документации асинхронной версии этого API: [`fs.readFile()`](#fsreadfilepath-options-callback).

Если указана опция `encoding`, то эта функция возвращает строку. В противном случае возвращается буфер.

Аналогично [`fs.readFile()`](#fsreadfilepath-options-callback), когда путь является каталогом, поведение `fs.readFileSync()` зависит от платформы.

```mjs
import { readFileSync } from 'node:fs';

// macOS, Linux и Windows
readFileSync('<directory>');
// => [Error: EISDIR: illegal operation on a directory, read <directory>]

// FreeBSD
readFileSync('<директория>'); // => <данные>
```

### `fs.readlinkSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {string|Buffer}

Возвращает строковое значение символической ссылки.

Более подробную информацию смотрите в документации POSIX readlink(2).

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для возвращаемого пути к ссылке. Если `encoding` имеет значение `'buffer'`, то возвращаемый путь по ссылке будет передан как объект {Buffer}.

### `fs.readSync(fd, buffer, offset, length[, position])`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView}
- `offset` {integer}
- `length` {integer}
- `позиция` {integer|bigint|null} **По умолчанию:** `null`.
- Возвращает: {number}

Возвращает количество `bytesRead`.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback).

### `fs.readSync(fd, buffer[, options])`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView}
- `options` {Object}
  - `offset` {integer} **По умолчанию:** `0`
  - `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
  - `позиция` {integer|bigint|null} **По умолчанию:** `null`.
- Возвращает: {number}

Возвращает количество `bytesRead`.

Подобно описанной выше функции `fs.readSync`, эта версия принимает необязательный объект `options`. Если объект `options` не указан, то по умолчанию будут использоваться вышеуказанные значения.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback).

### `fs.readvSync(fd, buffers[, position])`

- `fd` {целое число}
- `buffers` {ArrayBufferView\[\]}
- `position` {integer|null} **По умолчанию:** `null`.
- Возвращает: {number} Количество прочитанных байтов.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.readv()`](#fsreadvfd-buffers-position-callback).

### `fs.realpathSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {string|Buffer}

Возвращает разрешенное имя пути.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.realpath()`](#fsrealpathpath-options-callback).

### `fs.realpathSync.native(path[, options])`

- `path` {string|Buffer|URL}
- `options` {string|Object}
  - `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {string|Buffer}

Синхронный realpath(3).

Поддерживаются только пути, которые могут быть преобразованы в строки UTF8.

Необязательный аргумент `options` может быть строкой, указывающей кодировку, или объектом со свойством `encoding`, указывающим кодировку символов, которую следует использовать для возвращаемого пути. Если `encoding` имеет значение `'buffer'`, возвращаемый путь будет передан как объект {Buffer}.

В Linux, когда Node.js компонуется с musl libc, файловая система procfs должна быть смонтирована на `/proc`, чтобы эта функция работала. В Glibc такого ограничения нет.

### `fs.renameSync(oldPath, newPath)`

- `oldPath` {string|Buffer|URL}
- `newPath` {string|Buffer|URL}

Переименовывает файл из `oldPath` в `newPath`. Возвращает `undefined`.

Более подробную информацию смотрите в документации POSIX rename(2).

### `fs.rmdirSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `maxRetries` {integer} Если встречается ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js повторяет операцию с линейным ожиданием обратного хода на `retryDelay` миллисекунд дольше при каждой попытке. Этот параметр представляет собой количество повторных попыток. Этот параметр игнорируется, если параметр `recursive` не равен `true`. **По умолчанию:** `0`.
  - `recursive` {boolean} Если `true`, выполнить рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при неудаче. **По умолчанию:** `false`. **удалено.**
  - `retryDelay` {integer} Количество времени в миллисекундах для ожидания между повторными попытками. Эта опция игнорируется, если опция `recursive` не является `true`. **По умолчанию:** `100`.

Синхронный rmdir(2). Возвращает `undefined`.

Использование `fs.rmdirSync()` для файла (не каталога) приводит к ошибке `ENOENT` в Windows и ошибке `ENOTDIR` в POSIX.

Чтобы получить поведение, аналогичное Unix-команде `rm -rf`, используйте [`fs.rmSync()`](#fsrmsyncpath-options) с опциями `{ recursive: true, force: true }`.

### `fs.rmSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `force` {boolean} Если `true`, исключения будут игнорироваться, если `path` не существует. **По умолчанию:** `false`.
  - `maxRetries` {integer} При возникновении ошибки `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js будет повторять операцию с линейным ожиданием обратного хода на `retryDelay` миллисекунд дольше при каждой попытке. Этот параметр представляет собой количество повторных попыток. Этот параметр игнорируется, если параметр `recursive` не является `true`. **По умолчанию:** `0`.
  - `recursive` {boolean} Если `true`, выполнить рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при неудаче. **По умолчанию:** `false`.
  - `retryDelay` {integer} Количество времени в миллисекундах для ожидания между повторными попытками. Эта опция игнорируется, если опция `recursive` не является `true`. **По умолчанию:** `100`.

Синхронно удаляет файлы и каталоги (по образцу стандартной утилиты POSIX `rm`). Возвращает `undefined`.

### `fs.statSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.Stats} быть `bigint`. **По умолчанию:** `false`.
  - `throwIfNoEntry` {boolean} Будет ли выбрасываться исключение при отсутствии записи в файловой системе, а не возвращать `undefined`. **По умолчанию:** `true`.
- Возвращает: {fs.Stats}

Получает {fs.Stats} для пути.

### `fs.statfsSync(path[, options])`

- `path` {string|Buffer|URL}
- `options` {Object}
  - `bigint` {boolean} Должны ли числовые значения в возвращаемом объекте {fs.StatFs} быть `bigint`. **По умолчанию:** `false`.
- Возвращает: {fs.StatFs}

Синхронный statfs(2). Возвращает информацию о смонтированной файловой системе, содержащей `path`.

В случае ошибки, `err.code` будет одним из [Common System Errors](errors.md#common-system-errors).

### `fs.symlinkSync(target, path[, type])`

- `target` {string|Buffer|URL}
- `path` {string|Buffer|URL}
- `type` {string|null} **По умолчанию:** `null`.

Возвращает `undefined`.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.symlink()`](#fssymlinktarget-path-type-callback).

### `fs.truncateSync(path[, len])`

- `path` {string|Buffer|URL}
- `len` {целое число} **По умолчанию:** `0`.

Усекает файл. Возвращает `undefined`. В качестве первого аргумента можно также передать дескриптор файла. В этом случае вызывается `fs.ftruncateSync()`.

Передача дескриптора файла является устаревшей и в будущем может привести к ошибке.

### `fs.unlinkSync(path)`

- `path` {string|Buffer|URL}

Синхронная развязка(2). Возвращает `undefined`.

### `fs.utimesSync(path, atime, mtime)`

- `path` {string|Buffer|URL}
- `atime` {number|string|Date}
- `mtime` {number|string|Date}

Возвращает `неопределенное`.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.utimes()`](#fsutimespath-atime-mtime-callback).

### `fs.writeFileSync(file, data[, options])`

- `file` {string|Buffer|URL|integer} имя файла или дескриптор файла
- `data` {string|Buffer|TypedArray|DataView}
- `options` {Object|string}
  - `encoding` {string|null} **По умолчанию:** `'utf8''
  - `mode` {integer} **По умолчанию:** `0o666`
  - `флаг` {строка} См. [поддержка `флагов файловой системы`](#file-system-flags). **По умолчанию:** `'w'`.

Возвращает `undefined`.

Опция `mode` влияет только на вновь созданный файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

Подробную информацию смотрите в документации асинхронной версии этого API: [`fs.writeFile()`](#fswritefilefile-data-options-callback).

### `fs.writeSync(fd, buffer, offset[, length[, position]])`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView}
- `offset` {integer} **По умолчанию:** `0`
- `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
- `позиция` {integer|null} **По умолчанию:** `null`.
- Возвращает: {number} Количество записанных байт.

Подробную информацию смотрите в документации асинхронной версии этого API: [`fs.write(fd, buffer...)`](#fswritefd-buffer-offset-length-position-callback).

### `fs.writeSync(fd, buffer[, options])`

- `fd` {integer}
- `buffer` {Buffer|TypedArray|DataView}
- `options` {Object}
  - `offset` {integer} **По умолчанию:** `0`
  - `length` {integer} **По умолчанию:** `buffer.byteLength - offset`
  - `позиция` {целое число} **По умолчанию:** `null`.
- Возвращает: {number} Количество записанных байтов.

Подробную информацию смотрите в документации асинхронной версии этого API: [`fs.write(fd, buffer...)`](#fswritefd-buffer-offset-length-position-callback).

### `fs.writeSync(fd, string[, position[, encoding]])`

- `fd` {целое число}
- `строка` {строка}
- `position` {integer|null} **По умолчанию:** `null`
- `encoding` {string} **По умолчанию:** `'utf8'`.
- Возвращает: {number} Количество записанных байт.

Подробную информацию смотрите в документации асинхронной версии этого API: [`fs.write(fd, string...)`](#fswritefd-string-position-encoding-callback).

### `fs.writevSync(fd, buffers[, position])`

- `fd` {целое число}
- `buffers` {ArrayBufferView\[\]}
- `position` {integer|null} **По умолчанию:** `null`.
- Возвращает: {number} Количество записанных байт.

Для получения подробной информации смотрите документацию асинхронной версии этого API: [`fs.writev()`](#fswritevfd-buffers-position-callback).

## Общие объекты

Общие объекты являются общими для всех вариантов API файловой системы (promise, callback и synchronous).

### Класс: `fs.Dir`

Класс, представляющий поток каталогов.

Создается [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options), или [`fsPromises.opendir()`](#fspromisesopendirpath-options).

```mjs
import { opendir } from 'node:fs/promises';

try {
  const dir = await opendir('./');
  for await (const dirent of dir) console.log(dirent.name);
} catch (err) {
  console.error(err);
}
```

При использовании асинхронного итератора объект {fs.Dir} будет автоматически закрыт после выхода итератора.

#### `dir.close()`

- Возвращает: {Promise}

Асинхронно закрывает хэндл ресурса, лежащего в основе каталога. Последующие чтения приведут к ошибкам.

Возвращается обещание, которое будет разрешено после закрытия ресурса.

#### `dir.close(callback)`

- `callback` {Функция}
  - `err` {Ошибка}

Асинхронно закрывает базовый ресурс каталога. Последующие чтения приведут к ошибкам.

Функция `callback` будет вызвана после закрытия дескриптора ресурса.

#### `dir.closeSync()`

Синхронно закрывает базовый хэндл ресурса каталога. Последующие чтения приведут к ошибкам.

#### `dir.path`

- {строка}

Путь к этой директории, доступный только для чтения, как было указано в [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options) или [`fsPromises.opendir()`](#fspromisesopendirpath-options).

#### `dir.read()`

- Возвращает: {Promise}, содержащий {fs.Dirent|null}.

Асинхронно считывает следующую запись каталога через readdir(3) как {fs.Dirent}.

Возвращается обещание, которое будет разрешено с {fs.Dirent}, или `null`, если больше нет записей каталога для чтения.

Записи каталога, возвращаемые этой функцией, не имеют определенного порядка, как это предусмотрено механизмами каталога, лежащими в основе операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут быть не включены в результаты итерации.

#### `dir.read(callback)`

- `callback` {Функция}
  - `err` {Ошибка}
  - `dirent` {fs.Dirent|null}

Асинхронно считывает следующую запись каталога через readdir(3) как {fs.Dirent}.

После завершения чтения будет вызван `callback` с {fs.Dirent}, или `null`, если больше нет записей каталога для чтения.

Записи каталога, возвращаемые этой функцией, располагаются в порядке, не предусмотренном механизмами каталогов операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут быть не включены в результаты итерации.

#### `dir.readSync()`

- Возвращает: {fs.Dirent|null}

Синхронно считывает следующую запись каталога как {fs.Dirent}. Более подробно см. документацию POSIX readdir(3).

Если больше нет записей каталога для чтения, будет возвращен `null`.

Записи каталога, возвращаемые этой функцией, располагаются в порядке, не предусмотренном механизмами каталогов операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут быть не включены в результаты итерации.

#### `dir[Symbol.asyncIterator]()`

- Возвращает: {AsyncIterator} из {fs.Dirent}.

Асинхронно перебирает каталог, пока не будут прочитаны все записи. Более подробную информацию см. в документации POSIX readdir(3).

Записи, возвращаемые асинхронным итератором, всегда являются {fs.Dirent}. Случай `null` из `dir.read()` обрабатывается внутренне.

Пример см. в разделе {fs.Dir}.

Записи каталога, возвращаемые этим итератором, располагаются без определенного порядка, предусмотренного механизмами каталога, лежащими в основе операционной системы. Записи, добавленные или удаленные во время итерации по каталогу, могут быть не включены в результаты итерации.

### Класс: `fs.Dirent`

Представление записи каталога, которая может быть файлом или подкаталогом в каталоге, возвращаемое при чтении из {fs.Dir}. Запись каталога представляет собой комбинацию пар имени файла и типа файла.

Кроме того, когда вызывается [`fs.readdir()`](#fsreaddirpath-options-callback) или [`fs.readdirSync()`](#fsreaddirsyncpath-options) с опцией `withFileTypes`, установленной в `true`, результирующий массив заполняется объектами {fs.Dirent}, а не строками или {Buffer}.

#### `dirent.isBlockDevice()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает блочное устройство.

#### `dirent.isCharacterDevice()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает символьное устройство.

#### `dirent.isDirectory()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает каталог файловой системы.

#### `dirent.isFIFO()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает трубу типа "первый-первый-выход" (FIFO).

#### `dirent.isFile()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает обычный файл.

#### `dirent.isSocket()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает сокет.

#### `dirent.isSymbolicLink()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Dirent} описывает символическую ссылку.

#### `dirent.name`

- {string|Buffer}

Имя файла, на который ссылается данный объект {fs.Dirent}. Тип этого значения определяется `options.encoding`, переданным в [`fs.readdir()`](#fsreaddirpath-options-callback) или [`fs.readdirSync()`](#fsreaddirsyncpath-options).

### Класс: `fs.FSWatcher`

- Расширяет {EventEmitter}

Успешный вызов метода [`fs.watch()`](#fswatchfilename-options-listener) вернет новый объект {fs.FSWatcher}.

Все объекты {fs.FSWatcher} испускают событие `'change'` всякий раз, когда определенный наблюдаемый файл изменяется.

#### Событие: `change`

- `eventType` {string} Тип произошедшего события изменения
- `filename` {string|Buffer} Имя файла, которое изменилось (если уместно/доступно).

Выдается, когда что-то меняется в просматриваемом каталоге или файле. Подробнее см. в [`fs.watch()`](#fswatchfilename-options-listener).

Аргумент `filename` может не указываться в зависимости от поддержки операционной системы. Если `filename` указан, он будет предоставлен как {Buffer}, если `fs.watch()` вызван с опцией `encoding`, установленной в `'buffer'`, в противном случае `filename` будет строкой UTF-8.

```mjs
import { watch } from 'node:fs';
// Пример обработки через слушатель fs.watch()
watch(
  './tmp',
  { encoding: 'buffer' },
  (eventType, filename) => {
    if (filename) {
      console.log(filename);
      // Печатает: <Буфер ...>
    }
  }
);
```

#### Событие: `close`

Выдается, когда наблюдатель перестает следить за изменениями. Закрытый объект {fs.FSWatcher} больше не может использоваться в обработчике события.

#### Событие: `error`

- `error` {Ошибка}

Выдается при возникновении ошибки во время просмотра файла. Объект {fs.FSWatcher} с ошибкой больше не используется в обработчике события.

#### `watcher.close()`

Прекращает наблюдение за изменениями на данном {fs.FSWatcher}. После остановки объект {fs.FSWatcher} больше не может использоваться.

#### `watcher.ref()`

- Возвращает: {fs.FSWatcher}

При вызове запрашивает, чтобы цикл событий Node.js _не_ завершался, пока {fs.FSWatcher} активен. Вызов `watcher.ref()` несколько раз не будет иметь никакого эффекта.

По умолчанию все объекты {fs.FSWatcher} являются "ref", поэтому обычно нет необходимости вызывать `watcher.ref()`, если только `watcher.unref()` не был вызван ранее.

#### `watcher.unref()`

- Возвращает: {fs.FSWatcher}.

При вызове активный объект {fs.FSWatcher} не будет требовать, чтобы цикл событий Node.js оставался активным. Если нет другой активности, поддерживающей цикл событий, процесс может завершиться до того, как будет вызван обратный вызов объекта {fs.FSWatcher}. Многократный вызов `watcher.unref()` не будет иметь никакого эффекта.

### Класс: `fs.StatWatcher`

- Расширяет {EventEmitter}

Успешный вызов метода `fs.watchFile()` вернет новый объект {fs.StatWatcher}.

#### `watcher.ref()`

- Возвращает: {fs.StatWatcher}

При вызове запрашивает, чтобы цикл событий Node.js _не_ завершался до тех пор, пока {fs.StatWatcher} активен. Вызов `watcher.ref()` несколько раз не будет иметь никакого эффекта.

По умолчанию все объекты {fs.StatWatcher} являются "ref'ed", поэтому обычно нет необходимости вызывать `watcher.ref()`, если только `watcher.unref()` не был вызван ранее.

#### `watcher.unref()`

- Возвращает: {fs.StatWatcher}.

При вызове активный объект {fs.StatWatcher} не будет требовать, чтобы цикл событий Node.js оставался активным. Если нет другой активности, поддерживающей цикл событий, процесс может завершиться до того, как будет вызван обратный вызов объекта {fs.StatWatcher}. Многократный вызов `watcher.unref()` не будет иметь никакого эффекта.

### Класс: `fs.ReadStream`

- Расширяет: {stream.Readable}

Экземпляры {fs.ReadStream} создаются и возвращаются с помощью функции [`fs.createReadStream()`](#fscreatereadstreampath-options).

#### Событие: `close`

Выдается, когда базовый файловый дескриптор {fs.ReadStream} был закрыт.

#### Событие: `open`

- `fd` {integer} Целочисленный файловый дескриптор, используемый {fs.ReadStream}.

Выдается, когда дескриптор файла {fs.ReadStream} был открыт.

#### Событие: `ready`

Вызывается, когда {fs.ReadStream} готов к использованию.

Вызывается сразу после `'open'`.

#### `readStream.bytesRead`

- {число}

Количество байтов, которые были прочитаны на данный момент.

#### `readStream.path`

- {string|Buffer}

Путь к файлу, из которого читается поток, указанный в первом аргументе `fs.createReadStream()`. Если `path` передан как строка, то `readStream.path` будет строкой. Если `path` передан как {Buffer}, то `readStream.path` будет {Buffer}. Если указано `fd`, то `readStream.path` будет `undefined`.

#### `readStream.pending`

- {boolean}

Это свойство равно `true`, если базовый файл еще не был открыт, т.е. до того, как будет выдано событие `'ready'`.

### Класс: `fs.Stats`

Объект {fs.Stats} предоставляет информацию о файле.

Объекты, возвращаемые из [`fs.stat()`](#fsstatpath-options-callback), [`fs.lstat()`](#fslstatpath-options-callback), [`fs.fstat()`](#fsfstatfd-options-callback), и их синхронные аналоги имеют этот тип. Если `bigint` в `options`, передаваемых этим методам, равно true, числовые значения будут `bigint` вместо `number`, и объект будет содержать дополнительные свойства с наносекундной точностью с суффиксом `Ns`.

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

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Stats} описывает блочное устройство.

#### `stats.isCharacterDevice()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Stats} описывает символьное устройство.

#### `stats.isDirectory()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Stats} описывает каталог файловой системы.

Если объект {fs.Stats} был получен из [`fs.lstat()`](#fslstatpath-options-callback), этот метод всегда будет возвращать `false`. Это происходит потому, что [`fs.lstat()`](#fslstatpath-options-callback) возвращает информацию о самой символической ссылке, а не о пути, к которому она разрешается.

#### `stats.isFIFO()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Stats} описывает трубу типа "первый вошел - первый вышел" (FIFO).

#### `stats.isFile()`

- Возвращает: {boolean}

Возвращает `true`, если объект {fs.Stats} описывает обычный файл.

#### `stats.isSocket()`

- Возвращает: {boolean}

Возвращает `true`, если объект {fs.Stats} описывает сокет.

#### `stats.isSymbolicLink()`

- Возвращает: {булево}

Возвращает `true`, если объект {fs.Stats} описывает символическую ссылку.

Этот метод действителен только при использовании [`fs.lstat()`](#fslstatpath-options-callback).

#### `stats.dev`

- {number|bigint}

Числовой идентификатор устройства, содержащего файл.

#### `stats.ino`

- {number|bigint}

Номер "Inode" файла, специфичный для файловой системы.

#### `stats.mode`

- {number|bigint}

Битовое поле, описывающее тип и режим файла.

#### `stats.nlink`

- {number|bigint}

Количество жестких ссылок, существующих для данного файла.

#### `stats.uid`

- {number|bigint}

Числовой идентификатор пользователя, которому принадлежит файл (POSIX).

#### `stats.gid`

- {number|bigint}

Числовой идентификатор группы, которой принадлежит файл (POSIX).

#### `stats.rdev`

- {number|bigint}

Числовой идентификатор устройства, если файл представляет устройство.

#### `stats.size`

- {number|bigint}

Размер файла в байтах.

Если базовая файловая система не поддерживает получение размера файла, это значение будет равно `0`.

#### `stats.blksize`

- {number|bigint}

Размер блока файловой системы для операций ввода-вывода.

#### `stats.blocks`

- {number|bigint}

Количество блоков, выделенных для этого файла.

#### `stats.atimeMs`

- {number|bigint}

Временная метка, указывающая на последнее обращение к этому файлу, выраженная в миллисекундах с момента наступления эпохи POSIX.

#### `stats.mtimeMs`

- {number|bigint}

Временная метка, указывающая на последнее изменение этого файла, выраженная в миллисекундах с момента наступления эпохи POSIX.

#### `stats.ctimeMs`

- {number|bigint}

Временная метка, указывающая на последнее изменение статуса файла, выраженная в миллисекундах с эпохи POSIX.

#### `stats.birthtimeMs`

- {number|bigint}

Временная метка, указывающая на время создания этого файла, выраженная в миллисекундах от эпохи POSIX.

#### `stats.atimeNs`

- {bigint}

Присутствует только тогда, когда `bigint: true` передается в метод, создающий объект. Временная метка, указывающая на последнее обращение к этому файлу, выраженная в наносекундах с момента наступления эпохи POSIX.

#### `stats.mtimeNs`

- {bigint}

Присутствует только тогда, когда `bigint: true` передается в метод, создающий объект. Временная метка, указывающая на последнее изменение этого файла, выраженная в наносекундах от эпохи POSIX.

#### `stats.ctimeNs`

- {bigint}

Присутствует только тогда, когда `bigint: true` передано в метод, создающий объект. Временная метка, указывающая на последнее изменение статуса файла, выраженная в наносекундах от эпохи POSIX.

#### `stats.birthtimeNs`

- {bigint}

Присутствует только тогда, когда `bigint: true` передается в метод, создающий объект. Временная метка, указывающая на время создания этого файла, выраженная в наносекундах от эпохи POSIX.

#### `stats.atime`

- {Дата}

Временная метка, указывающая на последнее обращение к этому файлу.

#### `stats.mtime`

- {Дата}

Временная метка, указывающая на последнее изменение этого файла.

#### `stats.ctime`

- {Дата}

Временная метка, указывающая на последнее изменение статуса файла.

#### `stats.birthtime`

- {Дата}

Временная метка, указывающая на время создания этого файла.

#### Значения времени Stat

Свойства `atimeMs`, `mtimeMs`, `ctimeMs`, `birthtimeMs` - это числовые значения, которые показывают соответствующее время в миллисекундах. Их точность зависит от платформы. Когда `bigint: true` передается в метод, создающий объект, свойства будут [bigints](https://tc39.github.io/proposal-bigint), в противном случае они будут [numbers](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type).

Свойства `atimeNs`, `mtimeNs`, `ctimeNs`, `birthtimeNs` - это [bigints](https://tc39.github.io/proposal-bigint), которые содержат соответствующее время в наносекундах. Они присутствуют только тогда, когда `bigint: true` передано в метод, создающий объект. Их точность зависит от платформы.

`atime`, `mtime`, `ctime` и `birthtime` - это альтернативные представления различных времен в объекте [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Значения `Date` и числа не связаны. Присвоение нового значения числа или изменение значения `Date` не будет отражено в соответствующем альтернативном представлении.

Времена в объекте stat имеют следующую семантику:

- `atime` "Время доступа": Время последнего обращения к данным файла. Изменяется системными вызовами mknod(2), utimes(2) и read(2).
- `mtime` "Modified Time": Время последнего изменения данных файла. Изменяется системными вызовами mknod(2), utimes(2) и write(2).
- `ctime` "Время изменения": Время последнего изменения статуса файла (модификация данных inode). Изменяется системными вызовами chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2), read(2) и write(2).
- `birthtime` "Время рождения": Время создания файла. Устанавливается один раз при создании файла. На файловых системах, где время рождения недоступно, это поле может содержать либо `ctime`, либо `1970-01-01T00:00Z` (т.е. временная метка эпохи Unix `0`). В этом случае это значение может быть больше, чем `atime` или `mtime`. На Darwin и других вариантах FreeBSD также устанавливается, если `atime` явно установлено в более раннее значение, чем текущее `birthtime` с помощью системного вызова utimes(2).

До версии Node.js 0.12 `ctime` хранил время рождения в системах Windows. Начиная с версии 0.12, `ctime` не является "временем создания", а в Unix-системах оно никогда им не было.

### Класс: `fs.StatFs`

Предоставляет информацию о смонтированной файловой системе.

Объекты, возвращаемые из [`fs.statfs()`](#fsstatfspath-options-callback) и его синхронного аналога, относятся к этому типу. Если `bigint` в `options`, передаваемых этим методам, равно `true`, то числовые значения будут `bigint` вместо `number`.

```console
StatFs {
  type: 1397114950,
  bsize: 4096,
  blocks: 121938943,
  bfree: 61058895,
  bavail: 61058895,
  files: 999,
  ffree: 1000000
}
```

`bigint` версия:

```console
StatFs {
  type: 1397114950n,
  bsize: 4096n,
  blocks: 121938943n,
  bfree: 61058895n,
  bavail: 61058895n,
  files: 999n,
  ffree: 1000000n
}
```

#### `statfs.bavail`

- {number|bigint}

Свободные блоки, доступные непривилегированным пользователям.

#### `statfs.bfree`

- {number|bigint}

Свободные блоки в файловой системе.

#### `statfs.blocks`

- {number|bigint}

Общее количество блоков данных в файловой системе.

#### `statfs.bsize`

- {number|bigint}

Оптимальный размер блока переноса.

#### `statfs.ffree`

- {number|bigint}

Свободные файловые узлы в файловой системе.

#### `statfs.files`

- {number|bigint}

Общее количество файловых узлов в файловой системе.

#### `statfs.type`

- {number|bigint}

Тип файловой системы.

### Класс: `fs.WriteStream`

- Расширяет {stream.Writable}

Экземпляры {fs.WriteStream} создаются и возвращаются с помощью функции [`fs.createWriteStream()`](#fscreatewritestreampath-options).

#### Событие: `close`

Выдается, когда базовый файловый дескриптор {fs.WriteStream} был закрыт.

#### Событие: `open`

- `fd` {integer} Целочисленный дескриптор файла, используемый {fs.WriteStream}.

Выдается при открытии файла {fs.WriteStream}.

#### Событие: `ready`

Вызывается, когда {fs.WriteStream} готов к использованию.

Вызывается сразу после `'open'`.

#### `writeStream.bytesWritten`

Количество байтов, записанных на данный момент. Не включает данные, которые все еще находятся в очереди на запись.

#### `writeStream.close([callback])`

- `callback` {Функция}
  - `err` {Ошибка}

Закрывает `writeStream`. Опционально принимает обратный вызов, который будет выполнен после закрытия `writeStream`.

#### `writeStream.path`

Путь к файлу, в который записывается поток, указанный в первом аргументе [`fs.createWriteStream()`](#fscreatewritestreampath-options). Если `path` передан как строка, то `writeStream.path` будет строкой. Если `path` передан как {Buffer}, то `writeStream.path` будет {Buffer}.

#### `writeStream.pending`

- {boolean}

Это свойство равно `true`, если базовый файл еще не был открыт, т.е. до того, как будет выдано событие `'ready'`.

### `fs.constants`

- {Object}

Возвращает объект, содержащий часто используемые константы для операций с файловой системой.

#### Константы FS

Следующие константы экспортируются в `fs.constants` и `fsPromises.constants`.

Не все константы будут доступны в каждой операционной системе; это особенно важно для Windows, где многие определения, специфичные для POSIX, недоступны. Для переносимых приложений рекомендуется проверять их наличие перед использованием.

Чтобы использовать более одной константы, используйте оператор побитового ИЛИ `|`.

Пример:

```mjs
import { open, constants } from 'node:fs';

const { O_RDWR, O_CREAT, O_EXCL } = constants;

open(
  '/path/to/my/file',
  O_RDWR | O_CREAT | O_EXCL,
  (err, fd) => {
    // ...
  }
);
```

##### File access constants

Следующие константы предназначены для использования в качестве параметра `mode`, передаваемого в [`fsPromises.access()`](#fspromisesaccesspath-mode), [`fs.access()`](#fsaccesspath-mode-callback) и [`fs.accessSync()`](#fsaccesssyncpath-mode).

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>F_OK</code>

</td>

<td>

Flag indicating that the file is visible to the calling process. This is useful for determining if a file exists, but says nothing about <code>rwx</code> permissions. Default if no mode is specified.

</td>

</tr>

<tr>

<td>

<code>R_OK</code>

</td>

<td>

Flag indicating that the file can be read by the calling process.

</td>

</tr>

<tr>

<td>

<code>W_OK</code>

</td>

<td>

Flag indicating that the file can be written by the calling process.

</td>

</tr>

<tr>

<td>

<code>X_OK</code>

</td>

<td>

Flag indicating that the file can be executed by the calling process. This has no effect on Windows (will behave like <code>fs.constants.F_OK</code>).

</td>

</tr>

</table>

The definitions are also available on Windows.

##### Константы копирования файлов

Следующие константы предназначены для использования с [`fs.copyFile()`](#fscopyfilesrc-dest-mode-callback).

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>COPYFILE_EXCL</code>

</td>

<td>

If present, the copy operation will fail with an error if the destination path already exists.

</td>

</tr>

<tr>

<td>

<code>COPYFILE_FICLONE</code>

</td>

<td>

If present, the copy operation will attempt to create a copy-on-write reflink. If the underlying platform does not support copy-on-write, then a fallback copy mechanism is used.

</td>

</tr>

<tr>

<td>

<code>COPYFILE_FICLONE_FORCE</code>

</td>

<td>

If present, the copy operation will attempt to create a copy-on-write reflink. Если базовая платформа не поддерживает копирование по записи, то операция завершится с ошибкой.

</td>

</tr>

</table>

Определения также доступны для Windows.

##### Константы открытия файлов

Следующие константы предназначены для использования с `fs.open()`.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>O_RDONLY</code>

</td>

<td>

Flag indicating to open a file for read-only access.

</td>

</tr>

<tr>

<td>

<code>O_WRONLY</code>

</td>

<td>

Flag indicating to open a file for write-only access.

</td>

</tr>

<tr>

<td>

<code>O_RDWR</code>

</td>

<td>

Flag indicating to open a file for read-write access.

</td>

</tr>

<tr>

<td>

<code>O_CREAT</code>

</td>

<td>

Flag indicating to create the file if it does not already exist.

</td>

</tr>

<tr>

<td>

<code>O_EXCL</code>

</td>

<td>

Flag indicating that opening a file should fail if the <code>O_CREAT</code> flag is set and the file already exists.

</td>

</tr>

<tr>

<td>

<code>O_NOCTTY</code>

</td>

<td>

Flag indicating that if path identifies a terminal device, opening the path shall not cause that terminal to become the controlling terminal for the process (if the process does not already have one).

</td>

</tr>

<tr>

<td>

<code>O_TRUNC</code>

</td>

<td>

Flag indicating that if the file exists and is a regular file, and the file is opened successfully for write access, its length shall be truncated to zero.

</td>

</tr>

<tr>

<td>

<code>O_APPEND</code>

</td>

<td>

Flag indicating that data will be appended to the end of the file.

</td>

</tr>

<tr>

<td>

<code>O_DIRECTORY</code>

</td>

<td>

Flag indicating that the open should fail if the path is not a directory.

</td>

</tr>

<tr>

<td>

<code>O_NOATIME</code>

</td>

<td>

Flag indicating reading accesses to the file system will no longer result in an update to the <code>atime</code> information associated with the file. This flag is available on Linux operating systems only.

</td>

</tr>

<tr>

<td>

<code>O_NOFOLLOW</code>

</td>

<td>

Flag indicating that the open should fail if the path is a symbolic link.

</td>

</tr>

<tr>

<td>

<code>O_SYNC</code>

</td>

<td>

Flag indicating that the file is opened for synchronized I/O with write operations waiting for file integrity.

</td>

</tr>

<tr>

<td>

<code>O_DSYNC</code>

</td>

<td>

Flag indicating that the file is opened for synchronized I/O with write operations waiting for data integrity.

</td>

</tr>

<tr>

<td>

<code>O_SYMLINK</code>

</td>

<td>

Flag indicating to open the symbolic link itself rather than the resource it is pointing to.

</td>

</tr>

<tr>

<td>

<code>O_DIRECT</code>

</td>

<td>

When set, an attempt will be made to minimize caching effects of file I/O.

</td>

</tr>

<tr>

<td>

<code>O_NONBLOCK</code>

</td>

<td>

Flag indicating to open the file in nonblocking mode when possible.

</td>

</tr>

<tr>

<td>

<code>UV_FS_O_FILEMAP</code>

</td>

<td>

When set, a memory file mapping is used to access the file. This flag is available on Windows operating systems only. On other operating systems, this flag is ignored.

</td>

</tr>

</table>

В Windows доступны только `O_APPEND`, `O_CREAT`, `O_EXCL`, `O_RDONLY`, `O_RDWR`, `O_TRUNC`, `O_WRONLY` и `UV_FS_O_FILEMAP`.

##### Константы типа файла

Следующие константы предназначены для использования со свойством `mode` объекта {fs.Stats} для определения типа файла.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>S_IFMT</code>

</td>

<td>

Bit mask used to extract the file type code.

</td>

</tr>

<tr>

<td>

<code>S_IFREG</code>

</td>

<td>

File type constant for a regular file.

</td>

</tr>

<tr>

<td>

<code>S_IFDIR</code>

</td>

<td>

File type constant for a directory.

</td>

</tr>

<tr>

<td>

<code>S_IFCHR</code>

</td>

<td>

File type constant for a character-oriented device file.

</td>

</tr>

<tr>

<td>

<code>S_IFBLK</code>

</td>

<td>

File type constant for a block-oriented device file.

</td>

</tr>

<tr>

<td>

<code>S_IFIFO</code>

</td>

<td>

File type constant for a FIFO/pipe.

</td>

</tr>

<tr>

<td>

<code>S_IFLNK</code>

</td>

<td>

File type constant for a symbolic link.

</td>

</tr>

<tr>

<td>

<code>S_IFSOCK</code>

</td>

<td>

File type constant for a socket.

</td>

</tr>

</table>

В Windows доступны только `S_IFCHR`, `S_IFDIR`, `S_IFLNK`, `S_IFMT` и `S_IFREG`.

<!-- 0259.part.md -->

##### Константы режима файла

Следующие константы предназначены для использования со свойством `mode` объекта {fs.Stats} для определения разрешений доступа к файлу.

<table>

<tr>

<th>

Constant

</th>

<th>

Description

</th>

</tr>

<tr>

<td>

<code>S_IRWXU</code>

</td>

<td>

File mode indicating readable, writable, and executable by owner.

</td>

</tr>

<tr>

<td>

<code>S_IRUSR</code>

</td>

<td>

File mode indicating readable by owner.

</td>

</tr>

<tr>

<td>

<code>S_IWUSR</code>

</td>

<td>

File mode indicating writable by owner.

</td>

</tr>

<tr>

<td>

<code>S_IXUSR</code>

</td>

<td>

File mode indicating executable by owner.

</td>

</tr>

<tr>

<td>

<code>S_IRWXG</code>

</td>

<td>

File mode indicating readable, writable, and executable by group.

</td>

</tr>

<tr>

<td>

<code>S_IRGRP</code>

</td>

<td>

File mode indicating readable by group.

</td>

</tr>

<tr>

<td>

<code>S_IWGRP</code>

</td>

<td>

File mode indicating writable by group.

</td>

</tr>

<tr>

<td>

<code>S_IXGRP</code>

</td>

<td>

File mode indicating executable by group.

</td>

</tr>

<tr>

<td>

<code>S_IRWXO</code>

</td>

<td>

File mode indicating readable, writable, and executable by others.

</td>

</tr>

<tr>

<td>

<code>S_IROTH</code>

</td>

<td>

File mode indicating readable by others.

</td>

</tr>

<tr>

<td>

<code>S_IWOTH</code>

</td>

<td>

File mode indicating writable by others.

</td>

</tr>

<tr>

<td>

<code>S_IXOTH</code>

</td>

<td>

File mode indicating executable by others.

</td>

</tr>

</table>

В Windows доступны только `S_IRUSR` и `S_IWUSR`.

## Примечания

### Упорядочивание операций, основанных на обратном вызове и обещании

Поскольку они выполняются асинхронно базовым пулом потоков, не существует гарантированного порядка при использовании методов, основанных на обратном вызове или обещании.

Например, следующий пример чреват ошибками, поскольку операция `fs.stat()` может завершиться раньше, чем операция `fs.rename()`:

```js
const fs = require('node:fs');

fs.rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  console.log('переименование завершено');
});
fs.stat('/tmp/world', (err, stats) => {
  if (err) throw err;
  console.log(`stats: ${JSON.stringify(stats)}`);
});
```

Важно правильно упорядочить операции, ожидая результатов одной из них перед вызовом другой:

```mjs
import { rename, stat } from 'node:fs/promises';

const oldPath = '/tmp/hello';
const newPath = '/tmp/world';

try {
  await rename(oldPath, newPath);
  const stats = await stat(newPath);
  console.log(`stats: ${JSON.stringify(stats)}`);
} catch (error) {
  console.error('произошла ошибка:', error.message);
}
```

```cjs
const { rename, stat } = require('node:fs/promises');

(async function (oldPath, newPath) {
  try {
    await rename(oldPath, newPath);
    const stats = await stat(newPath);
    console.log(`stats: ${JSON.stringify(stats)}`);
  } catch (error) {
    console.error('произошла ошибка:', error.message);
  }
})('/tmp/hello', '/tmp/world');
```

Или, при использовании API обратного вызова, переместите вызов `fs.stat()` в обратный вызов операции `fs.rename()`:

```mjs
import { rename, stat } from 'node:fs';

rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  stat('/tmp/world', (err, stats) => {
    if (err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
  });
});
```

```cjs
const { rename, stat } = require('node:fs/promises');

rename('/tmp/hello', '/tmp/world', (err) => {
  if (err) throw err;
  stat('/tmp/world', (err, stats) => {
    if (err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
  });
});
```

### Пути к файлам

Большинство операций `fs` принимают пути к файлам, которые могут быть указаны в виде строки, {Buffer} или объекта {URL} с использованием протокола `file:`.

#### Строковые пути

Строковые пути интерпретируются как последовательности символов UTF-8, идентифицирующие абсолютное или относительное имя файла. Относительные пути будут определены относительно текущего рабочего каталога, как определено вызовом `process.cwd()`.

Пример использования абсолютного пути на POSIX:

```mjs
import { open } from 'node:fs/promises';

let fd;
try {
  fd = await open('/open/some/file.txt', 'r');
  // Делаем что-нибудь с файлом
} finally {
  await fd?.close();
}
```

Пример использования относительного пути на POSIX (относительно `process.cwd()`):

```mjs
import { open } from 'node:fs/promises';

let fd;
try {
  fd = await open('file.txt', 'r');
  // Делаем что-нибудь с файлом
} finally {
  await fd?.close();
}
```

#### URL-пути к файлам

Для большинства функций модуля `node:fs` аргумент `path` или `filename` может быть передан как объект {URL} с использованием протокола `file:`.

```mjs
import { readFileSync } from 'node:fs';

readFileSync(new URL('file:///tmp/hello'));
```

URL-адреса `file:` всегда являются абсолютными путями.

##### Соображения, относящиеся к конкретной платформе

В Windows `file:` {URL} с именем хоста преобразуются в UNC-пути, а `file:` {URL} с буквами дисков преобразуются в локальные абсолютные пути. Файлы `file:` {URL} без имени хоста и буквы диска приводят к ошибке:

```mjs
import { readFileSync } from 'node:fs';
// В Windows :

// - URL-адреса файлов WHATWG с именем хоста преобразуются в UNC-путь.
// file://hostname/p/a/t/h/file => \hostname\p\a\t\h\file
readFileSync(new URL('file://hostname/p/a/t/h/file'));

// - URL-адреса файлов WHATWG с буквами дисков преобразуются в абсолютный путь
// file:///C:/tmp/hello => C:\tmp\hello
readFileSync(new URL('file:///C:/tmp/hello'));

// - URL-адреса файлов WHATWG без имени хоста должны содержать буквы дисков
readFileSync(
  new URL('file:///notdriveletter/p/a/t/h/file')
);
readFileSync(new URL('file:///c/p/a/t/h/file'));
// TypeError [ERR_INVALID_FILE_URL_PATH]: Путь к URL файла должен быть абсолютным
```

В `file:` {URL}s с буквами дисков необходимо использовать `:` в качестве разделителя сразу после буквы диска. Использование другого разделителя приведет к ошибке.

На всех других платформах `file:` {URL} с именем хоста не поддерживаются и приведут к ошибке:

```mjs
import { readFileSync } from 'node:fs';
// На других платформах:

// - URL-адреса файлов WHATWG с именем хоста не поддерживаются.
// file://hostname/p/a/t/h/file => throw!
readFileSync(new URL('file://hostname/p/a/t/h/file'));
// TypeError [ERR_INVALID_FILE_URL_PATH]: должен быть абсолютным

// - URL-адреса файлов WHATWG преобразуются в абсолютный путь
// file:///tmp/hello => /tmp/hello
readFileSync(new URL('file:///tmp/hello'));
```

Если `файл:` {URL} имеет кодированные символы слэша, это приведет к ошибке на всех платформах:

```mjs
import { readFileSync } from 'node:fs';

// В Windows
readFileSync(new URL('file:///C:/p/a/t/h/%2F'));
readFileSync(new URL('file:///C:/p/a/t/h/%2f'));
/* TypeError [ERR_INVALID_FILE_URL_PATH]: Путь URL файла не должен включать кодированные
\ или / символов */

// На POSIX
readFileSync(new URL('file:///p/a/t/h/%2F'));
readFileSync(new URL('file:///p/a/t/h/%2f'));
/* TypeError [ERR_INVALID_FILE_URL_PATH]: Путь URL файла не должен включать кодированные
/ символы */
```

В Windows, `file:` {URL}s, имеющие закодированный обратный слеш, приведут к ошибке:

```mjs
import { readFileSync } from 'node:fs';

// В Windows
readFileSync(new URL('file:///C:/path/%5C'));
readFileSync(new URL('file:///C:/path/%5c'));
/* TypeError [ERR_INVALID_FILE_URL_PATH]: Путь URL файла не должен включать кодированные
\ или / символов */
```

<!-- 0266.part.md -->

#### Буферные пути

Пути, заданные с помощью {Buffer}, полезны прежде всего в некоторых операционных системах POSIX, которые рассматривают пути к файлам как непрозрачные последовательности байтов. В таких системах возможно, что один путь к файлу содержит подпоследовательности, использующие несколько кодировок символов. Как и в случае строковых путей, пути {Buffer} могут быть относительными или абсолютными:

Пример использования абсолютного пути на POSIX:

```mjs
import { open } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

let fd;
try {
  fd = await open(Buffer.from('/open/some/file.txt'), 'r');
  // Делаем что-нибудь с файлом
} finally {
  await fd?.close();
}
```

#### Рабочие каталоги на каждом диске в Windows

В Windows Node.js следует концепции рабочих каталогов на каждом диске. Такое поведение можно наблюдать при использовании пути к диску без обратной косой черты. Например, `fs.readdirSync('C:\')` потенциально может вернуть другой результат, чем `fs.readdirSync('C:')`. Для получения дополнительной информации смотрите [эту страницу MSDN](https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#fully-qualified-vs-relative-paths).

### Дескрипторы файлов

В POSIX-системах для каждого процесса ядро ведет таблицу открытых в данный момент файлов и ресурсов. Каждому открытому файлу присваивается простой числовой идентификатор, называемый _файловым дескриптором_. На системном уровне все операции файловой системы используют эти файловые дескрипторы для идентификации и отслеживания каждого конкретного файла. В системах Windows для отслеживания ресурсов используется другой, но концептуально похожий механизм. Чтобы упростить работу пользователей, Node.js абстрагируется от различий между операционными системами и присваивает всем открытым файлам числовой файловый дескриптор.

Методы `fs.open()`, основанные на обратном вызове, и синхронный `fs.openSync()` открывают файл и выделяют новый файловый дескриптор. После выделения дескриптор файла может использоваться для чтения данных из файла, записи данных в файл или запроса информации о файле.

Операционные системы ограничивают количество файловых дескрипторов, которые могут быть открыты в любой момент времени, поэтому очень важно закрыть дескриптор после завершения операций. Если этого не сделать, произойдет утечка памяти, которая в конечном итоге приведет к аварийному завершению работы приложения.

```mjs
import { open, close, fstat } from 'node:fs';

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

      // использовать stat

      closeFd(fd);
    });
  } catch (err) {
    closeFd(fd);
    throw err;
  }
});
```

API, основанные на обещаниях, используют объект {FileHandle} вместо числового дескриптора файла. Эти объекты лучше управляются системой, чтобы исключить утечку ресурсов. Однако, по-прежнему требуется, чтобы они закрывались по завершении операций:

```mjs
import { open } from 'node:fs/promises';

let file;
try {
  file = await open('/open/some/file.txt', 'r');
  const stat = await file.stat();
  // использовать stat
} finally {
  await file.close();
}
```

### Использование пула потоков

Все API файловой системы, основанные на обратных вызовах и обещаниях (за исключением `fs.FSWatcher()`), используют пул потоков libuv. Это может иметь неожиданные и негативные последствия для производительности некоторых приложений. Дополнительную информацию смотрите в документации [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize).

### Флаги файловой системы

Следующие флаги доступны везде, где опция `flag` принимает строку.

- `'a'`: Открыть файл для добавления. Файл создается, если он не существует.

- `'ax'`: Аналогично `'a'`, но не работает, если путь существует.

- `'a+'`: Открыть файл для чтения и добавления. Файл создается, если он не существует.

- `'ax+'`: Аналогично `'a+'`, но не работает, если путь существует.

- `'as'`: Открыть файл для добавления в синхронном режиме. Файл создается, если он не существует.

- `'as+'`: Открыть файл для чтения и добавления в синхронном режиме. Файл создается, если он не существует.

- `'r'`: Открыть файл для чтения. Возникает исключение, если файл не существует.

- `'r+'`: Открыть файл для чтения и записи. Возникает исключение, если файл не существует.

- `'rs+'`: Открыть файл для чтения и записи в синхронном режиме. Указывает операционной системе обойти кэш локальной файловой системы.

  Это в первую очередь полезно при открытии файлов на монтировании NFS, так как позволяет обойти потенциально устаревший локальный кэш. Это очень сильно влияет на производительность ввода-вывода, поэтому использовать этот флаг не рекомендуется, если в этом нет необходимости.

  Это не превращает `fs.open()` или `fsPromises.open()` в синхронный блокирующий вызов. Если требуется синхронная работа, следует использовать что-то вроде `fs.openSync()`.

- `'w'`: Открыть файл для записи. Файл создается (если он не существует) или усекается (если он существует).

- `'wx'`: Аналогично `'w'`, но не работает, если путь существует.

- `'w+'`: Открыть файл для чтения и записи. Файл создается (если он не существует) или усекается (если он существует).

- `'wx+'`: Аналогично `'w+'`, но не работает, если путь существует.

`flag` также может быть числом, как документировано в open(2); часто используемые константы доступны из `fs.constants`. В Windows флаги переводятся в их эквиваленты, где это применимо, например, `O_WRONLY` в `FILE_GENERIC_WRITE`, или `O_EXCL|O_CREAT` в `CREATE_NEW`, что принимается `CreateFileW`.

Эксклюзивный флаг `'x'` (флаг `O_EXCL` в open(2)) заставляет операцию возвращать ошибку, если путь уже существует. В POSIX, если путь является символической ссылкой, использование `O_EXCL` возвращает ошибку, даже если ссылка ведет на несуществующий путь. Флаг exclusive может не работать с сетевыми файловыми системами.

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда добавляет данные в конец файла.

Для модификации файла вместо его замены может потребоваться установить параметр `flag` в значение `'r+'`, а не по умолчанию `'w'`.

Поведение некоторых флагов зависит от конкретной платформы. Так, открытие каталога на macOS и Linux с флагом `'a+'`, как в примере ниже, приведет к ошибке. Напротив, в Windows и FreeBSD будет возвращен дескриптор файла или `FileHandle`.

```js
// macOS и Linux
fs.open('<директория>', 'a+', (err, fd) => {
  // => [Ошибка: EISDIR: недопустимая операция над каталогом, открыть <каталог>]
});

// Windows и FreeBSD
fs.open('<directory>', 'a+', (err, fd) => {
  // => null, <fd>
});
```

В Windows открытие существующего скрытого файла с помощью флага `'w'` (либо через `fs.open()`, `fs.writeFile()`, либо `fsPromises.open()`) завершится неудачей с `EPERM`. Существующие скрытые файлы могут быть открыты для записи с помощью флага `'r+'`.

Вызов `fs.ftruncate()` или `filehandle.truncate()` может быть использован для сброса содержимого файла.
