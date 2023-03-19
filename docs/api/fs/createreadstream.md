# createReadStream

## Callback

```js
fs.createReadStream(path[, options])
```

???quote "История"

    | Version           | Changes                                                                                                                                |
    | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
    | v16.10.0          | The fs option does not need open method if an fd was provided.                                                                         |
    | v16.10.0          | The fs option does not need close method if autoClose is false.                                                                        |
    | v15.4.0           | The fd option accepts FileHandle arguments.                                                                                            |
    | v14.0.0           | Change emitClose default to true.                                                                                                      |
    | v13.6.0, v12.17.0 | The fs options allow overriding the used fs implementation.                                                                            |
    | v12.10.0          | Enable emitClose option.                                                                                                               |
    | v11.0.0           | Impose new restrictions on start and end, throwing more appropriate errors in cases when we cannot reasonably handle the input values. |
    | v7.6.0            | The path parameter can be a WHATWG URL object using file: protocol.                                                                    |
    | v7.0.0            | The passed options object will never be modified.                                                                                      |
    | v2.3.0            | The passed options object can be a string now.                                                                                         |
    | v0.1.31           | Added in: v0.1.31                                                                                                                      |

**Параметры:**

-   `path` : `<string>` | `<Buffer>` | `<URL>`
-   `options` : `<string>` | `<Object>`
    -   `flags` = `'r'` : `<string>`
    -   `encoding` = `null` : `<string>`
    -   `fd` = `null` : `<integer>` | `<FileHandle>`
    -   `mode` = `0o666` : `<integer>`
    -   `autoClose` = `true` : `<boolean>`
    -   `emitClose` = `true` : `<boolean>`
    -   `start` : `<integer>`
    -   `end` = `Infinity` : `<integer>`
    -   `highWaterMark` = `64 * 1024` : `<integer>`
    -   `fs` = `null` : `<Object>` | `<null>`

**Возвращает:**

-   `<fs.ReadStream>`

В отличие от `highWaterMark` по умолчанию размером 16 КБ для `<stream.Readable>`, поток, возвращаемый этим методом, имеет значение `highWaterMark` по умолчанию, равное 64 КБ.

Параметры могут включать `start` и `end` значения для чтения диапазона байтов из файла, а не всего файла. И `start`, и `end` включаются и начинают отсчет с `0`, допустимые значения находятся в диапазоне `[0, Number.MAX_SAFE_INTEGER]`. Если указан `fd`, а `start` опущен или `undefined`, `fs.createReadStream()` последовательно читает с текущей позиции в файле. Кодировка может быть любой из принятых `<Buffer>`.

Если указан `fd`, `ReadStream` проигнорирует аргумент `path` и будет использовать указанный файловый дескриптор. Это означает, что никакое событие `open` не будет сгенерировано. `fd` должен блокировать; неблокирующие `fd` должны передаваться в `<net.Socket>`.

Если `fd` указывает на символьное устройство, которое поддерживает только блокировку чтения (например, клавиатуру или звуковую карту), операции чтения не завершатся до тех пор, пока данные не будут доступны. Это может предотвратить завершение процесса и естественное закрытие потока.

По умолчанию поток будет генерировать событие `close` после того, как он будет уничтожен. Установите для параметра `emitClose` значение `false`, чтобы изменить это поведение.

Предоставляя опцию `fs`, можно переопределить соответствующие реализации `fs` для `open`, `read` и `close`. При предоставлении опции `fs` требуется переопределение для чтения. Если `fd` не указан, также требуется переопределение для открытия. Если `autoClose` имеет значение `true`, также требуется переопределение для закрытия.

```js
import { createReadStream } from 'node:fs';

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

Если `autoClose` имеет значение `false`, то файловый дескриптор не будет закрыт, даже если произойдет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки дескриптора файла. Если для параметра `autoClose` установлено значение `true` (поведение по умолчанию), при `error` или `end` дескриптор файла будет автоматически закрыт.

`mode` устанавливает режим файла (разрешение и липкие биты), но только если файл был создан.

Пример чтения последних 10 байтов файла длиной 100 байтов:

```js
import { createReadStream } from 'node:fs';

createReadStream('sample.txt', { start: 90, end: 99 });
```

Если `options` является строкой, то она определяет кодировку.

## FileHandle

```js
filehandle.createReadStream([options]);
```

???quote "История"

    Добавлено в: v16.11.0

**Параметры:**

-   `options` : `<Object>`
    -   `encoding` = `null` : `<string>`
    -   `autoClose` = `true` : `<boolean>`
    -   `emitClose` = `true` : `<boolean>`
    -   `start` : `<integer>`
    -   `end` = `Infinity` : `<integer>`
    -   `highWaterMark` = `64 * 1024` : `<integer>`

**Возвращает:**

-   `<fs.ReadStream>`

В отличие от `highWaterMark` по умолчанию размером 16 КБ для `<stream.Readable>`, поток, возвращаемый этим методом, имеет значение `highWaterMark` по умолчанию, равное 64 КБ.

Параметры могут включать `start` и `end` значения для чтения диапазона байтов из файла, а не всего файла. И `start`, и `end` включаются и начинают отсчет с `0`, допустимые значения находятся в диапазоне `[0, Number.MAX_SAFE_INTEGER]`. Если указан `fd`, а `start` опущен или `undefined`, `fs.createReadStream()` последовательно читает с текущей позиции в файле. Кодировка может быть любой из принятых `<Buffer>`.

Если `FileHandle` указывает на символьное устройство, которое поддерживает только блокировку чтения (например, клавиатуру или звуковую карту), операции чтения не завершатся до тех пор, пока данные не будут доступны. Это может предотвратить завершение процесса и естественное закрытие потока.

По умолчанию поток будет генерировать событие `close` после того, как он будет уничтожен. Установите для параметра `emitClose` значение `false`, чтобы изменить это поведение.

```js
import { open } from 'node:fs/promises';

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

Если `autoClose` имеет значение `false`, то файловый дескриптор не будет закрыт, даже если произойдет ошибка. Приложение обязано закрыть его и убедиться в отсутствии утечки дескриптора файла. Если для параметра `autoClose` установлено значение `true` (поведение по умолчанию), при `error` или `end` дескриптор файла будет автоматически закрыт.

Пример чтения последних 10 байтов файла длиной 100 байтов:

```js
import { open } from 'node:fs/promises';

const fd = await open('sample.txt');
fd.createReadStream({ start: 90, end: 99 });
```
