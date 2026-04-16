---
title: Файловая система
description: Модуль node:fs позволяет работать с файловой системой по образцу стандартных функций POSIX
---

# Файловая система

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/fs.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!--name=fs-->

<!-- source_link=lib/fs.js -->

Модуль `node:fs` позволяет взаимодействовать с файловой системой по образцу стандартных функций POSIX.

Чтобы использовать API на основе промисов:

=== "MJS"

    ```js
    import * as fs from 'node:fs/promises';
    ```

=== "CJS"

    ```js
    const fs = require('node:fs/promises');
    ```

Чтобы использовать API с обратным вызовом и синхронные API:

=== "MJS"

    ```js
    import * as fs from 'node:fs';
    ```

=== "CJS"

    ```js
    const fs = require('node:fs');
    ```

Все операции с файловой системой доступны в синхронной форме, с обратным вызовом и в виде промисов, и их можно вызывать как из CommonJS, так и из модулей ES (ESM).

## Пример с промисами

Операции на промисах возвращают промис, который выполняется, когда асинхронная операция завершена.

=== "MJS"

    ```js
    import { unlink } from 'node:fs/promises';

    try {
      await unlink('/tmp/hello');
      console.log('successfully deleted /tmp/hello');
    } catch (error) {
      console.error('there was an error:', error.message);
    }
    ```

=== "CJS"

    ```js
    const { unlink } = require('node:fs/promises');

    (async function(path) {
      try {
        await unlink(path);
        console.log(`successfully deleted ${path}`);
      } catch (error) {
        console.error('there was an error:', error.message);
      }
    })('/tmp/hello');
    ```

## Пример с обратным вызовом

В форме с обратным вызовом последним аргументом передаётся функция завершения; операция выполняется асинхронно. Набор аргументов, передаваемых в эту функцию, зависит от метода, но первый аргумент всегда зарезервирован под исключение. Если операция завершилась успешно, первым аргументом будет `null` или `undefined`.

=== "MJS"

    ```js
    import { unlink } from 'node:fs';

    unlink('/tmp/hello', (err) => {
      if (err) throw err;
      console.log('successfully deleted /tmp/hello');
    });
    ```

=== "CJS"

    ```js
    const { unlink } = require('node:fs');

    unlink('/tmp/hello', (err) => {
      if (err) throw err;
      console.log('successfully deleted /tmp/hello');
    });
    ```

Варианты API модуля `node:fs` с обратным вызовом предпочтительнее промисов, когда нужна максимальная производительность (и по времени выполнения, и по выделению памяти).

## Синхронный пример

Синхронные API блокируют цикл событий Node.js и дальнейшее выполнение JavaScript до завершения операции. Исключения выбрасываются сразу; их можно обработать в `try…catch` или позволить всплыть.

=== "MJS"

    ```js
    import { unlinkSync } from 'node:fs';

    try {
      unlinkSync('/tmp/hello');
      console.log('successfully deleted /tmp/hello');
    } catch (err) {
      // handle the error
    }
    ```

=== "CJS"

    ```js
    const { unlinkSync } = require('node:fs');

    try {
      unlinkSync('/tmp/hello');
      console.log('successfully deleted /tmp/hello');
    } catch (err) {
      // handle the error
    }
    ```

## API промисов (`fs/promises`)

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

Добавлено в: v10.0.0

API `fs/promises` предоставляет асинхронные методы файловой системы, возвращающие промисы.

Эти API используют встроенный пул потоков Node.js для выполнения операций с файловой системой вне потока цикла событий. Они не синхронизированы и не рассчитаны на многопоточную безопасность. При нескольких одновременных изменениях одного и того же файла возможна порча данных — действуйте осторожно.

### Класс: `FileHandle`

<!-- YAML
added: v10.0.0
-->

Объект [FileHandle](#filehandle) — обёртка над числовым дескриптором файла.

Экземпляры [FileHandle](#filehandle) создаются методом `fsPromises.open()`.

Все объекты [FileHandle](#filehandle) являются [EventEmitter](events.md#class-eventemitter).

Если [FileHandle](#filehandle) не закрыть через `filehandle.close()`, среда попытается автоматически закрыть дескриптор и выдать предупреждение процессу, чтобы уменьшить риск утечек памяти. На такое поведение полагаться не следует: оно может сработать ненадёжно, и файл может остаться открытым. Всегда явно закрывайте [FileHandle](#filehandle). В будущем Node.js может изменить эту логику.

#### Событие: `'close'`

<!-- YAML
added: v15.4.0
-->

Событие `'close'` генерируется, когда [FileHandle](#filehandle) закрыт и больше использоваться не может.

#### `filehandle.appendFile(data[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v21.1.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50095
    description: The `flush` option is now supported.
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37490
    description: The `data` argument supports `AsyncIterable`, `Iterable`, and `Stream`.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
-->

Добавлено в: v10.0.0

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<AsyncIterable>`](https://tc39.es/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Stream>`](stream.md#stream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | undefined позволяет прервать выполняющуюся операцию `writeFile`. **По умолчанию:** `undefined`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Псевдоним [`filehandle.writeFile()`](#filehandlewritefiledata-options).

При работе с дескриптором файла режим нельзя изменить относительно того, что был задан при [`fsPromises.open()`](#fspromisesopenpath-flags-mode). Поэтому метод эквивалентен [`filehandle.writeFile()`](#filehandlewritefiledata-options).

#### `filehandle.chmod(mode)`

<!-- YAML
added: v10.0.0
-->

-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) битовая маска режима файла.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Изменяет права доступа к файлу. См. chmod(2).

#### `filehandle.chown(uid, gid)`

<!-- YAML
added: v10.0.0
-->

-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) идентификатор пользователя — нового владельца файла.
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) идентификатор группы — новой группы файла.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Меняет владельца файла. Обёртка над chown(2).

#### `filehandle.close()`

<!-- YAML
added: v10.0.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Закрывает дескриптор после завершения всех отложенных операций над ним.

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let filehandle;
    try {
      filehandle = await open('thefile.txt', 'r');
    } finally {
      await filehandle?.close();
    }
    ```

#### `filehandle.createReadStream([options])`

<!-- YAML
added: v16.11.0
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `null`
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `start` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `end` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Infinity`
    -   `highWaterMark` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `64 * 1024`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | undefined **По умолчанию:** `undefined`
-   Возвращает: [`<fs.ReadStream>`](fs.md#class-fsreadstream)

В `options` можно задать `start` и `end`, чтобы прочитать диапазон байт вместо всего файла. Оба значения включаются в диапазон, отсчёт с 0; допустимый диапазон — \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)]. Если `start` опущен или `undefined`, `filehandle.createReadStream()` читает последовательно с текущей позиции в файле. Для `encoding` допустимы те же значения, что принимает [Buffer](buffer.md#buffer).

Если `FileHandle` указывает на символьное устройство с только блокирующим чтением (например клавиатуру или звуковую карту), чтение не завершится, пока не появятся данные. Из-за этого процесс может не завершиться, а поток — не закрыться естественным образом.

По умолчанию поток сгенерирует событие `'close'` после уничтожения. Чтобы изменить поведение, установите `emitClose` в `false`.

=== "MJS"

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

Если `autoClose` равен `false`, дескриптор файла не закрывается даже при ошибке. Закрыть его и убедиться в отсутствии утечки дескрипторов — ответственность приложения. Если `autoClose` равен `true` (по умолчанию), при `'error'` или `'end'` дескриптор закрывается автоматически.

Пример: прочитать последние 10 байт файла длиной 100 байт:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    const fd = await open('sample.txt');
    fd.createReadStream({ start: 90, end: 99 });
    ```

#### `filehandle.createWriteStream([options])`

<!-- YAML
added: v16.11.0
changes:
  - version:
    - v21.0.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50093
    description: The `flush` option is now supported.
-->

Добавлено в: v16.11.0

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `start` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16384`
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при `true` базовый дескриптор файла сбрасывается на носитель перед закрытием. **По умолчанию:** `false`.
-   Возвращает: [`<fs.WriteStream>`](fs.md#fswritestream)

В `options` также может быть указан `start` для записи с позиции после начала файла; допустимые значения в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)]. Чтобы изменять файл, а не заменять его целиком, для `open` может понадобиться флаг `r+` вместо `r` по умолчанию. Для `encoding` допустимы те же значения, что принимает [Buffer](buffer.md#buffer).

Если `autoClose` равен `true` (по умолчанию), при `'error'` или `'finish'` дескриптор закрывается автоматически. Если `autoClose` равен `false`, дескриптор не закрывается даже при ошибке. Закрыть его и избежать утечки дескрипторов — задача приложения.

По умолчанию поток сгенерирует событие `'close'` после уничтожения. Чтобы изменить поведение, установите `emitClose` в `false`.

#### `filehandle.datasync()`

<!-- YAML
added: v10.0.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Переводит все отложенные операции ввода-вывода для этого файла в состояние завершённой синхронизированной записи ОС. Подробности см. в документации POSIX fdatasync(2).

В отличие от `filehandle.sync`, этот метод не сбрасывает изменённые метаданные.

#### `filehandle.fd`

<!-- YAML
added: v10.0.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) числовой дескриптор файла, которым управляет объект [FileHandle](#filehandle).

#### `filehandle.pull([...transforms][, options])`

<!-- YAML
added: v25.9.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) необязательные преобразования через [`stream/iter pull()`](stream_iter.md#pullsource-transforms-options).
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal)
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) закрыть дескриптор файла по окончании потока. **По умолчанию:** `false`.
    -   `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) смещение в байтах, с которого начинать чтение. Если задано, используется явное позиционирование (семантика `pread`). **По умолчанию:** текущая позиция в файле.
    -   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум байт для чтения до завершения итератора. Чтение останавливается, когда передано `limit` байт или достигнут конец файла — в зависимости от того, что наступит раньше. **По умолчанию:** до конца файла.
    -   `chunkSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер буфера в байтах для каждой операции чтения. **По умолчанию:** `131072` (128 КиБ).
-   Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.es/ecma262/#sec-asynciterable-interface)

Возвращает содержимое файла как асинхронный итерируемый объект по модели pull из [`node:stream/iter`](stream_iter.md). Чтение идёт блоками по `chunkSize` байт (по умолчанию 128 КиБ). Если заданы преобразования, они применяются через [`stream/iter pull()`](stream_iter.md#pullsource-transforms-options).

Пока итерируемый объект потребляется, дескриптор файла заблокирован; разблокировка — по завершении итерации, при ошибке или при прерывании потребителем.

Функция доступна только при включённом флаге `--experimental-stream-iter`.

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';
    import { text } from 'node:stream/iter';
    import { compressGzip } from 'node:zlib/iter';

    const fh = await open('input.txt', 'r');

    // Read as text
    console.log(await text(fh.pull({ autoClose: true })));

    // Read 1 KB starting at byte 100
    const fh2 = await open('input.txt', 'r');
    console.log(await text(fh2.pull({ start: 100, limit: 1024, autoClose: true })));

    // Read with compression
    const fh3 = await open('input.txt', 'r');
    const compressed = fh3.pull(compressGzip(), { autoClose: true });
    ```

=== "CJS"

    ```js
    const { open } = require('node:fs/promises');
    const { text } = require('node:stream/iter');
    const { compressGzip } = require('node:zlib/iter');

    async function run() {
      const fh = await open('input.txt', 'r');

      // Read as text
      console.log(await text(fh.pull({ autoClose: true })));

      // Read 1 KB starting at byte 100
      const fh2 = await open('input.txt', 'r');
      console.log(await text(fh2.pull({ start: 100, limit: 1024, autoClose: true })));

      // Read with compression
      const fh3 = await open('input.txt', 'r');
      const compressed = fh3.pull(compressGzip(), { autoClose: true });
    }

    run().catch(console.error);
    ```

#### `filehandle.pullSync([...transforms][, options])`

<!-- YAML
added: v25.9.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `...transforms` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) необязательные преобразования через [`stream/iter pullSync()`](stream_iter.md#pullsyncsource-transforms).
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) закрыть дескриптор файла по окончании потока. **По умолчанию:** `false`.
    -   `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) смещение в байтах для начала чтения. Если задано, используется явное позиционирование. **По умолчанию:** текущая позиция в файле.
    -   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум байт до завершения итератора. **По умолчанию:** до конца файла.
    -   `chunkSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) размер буфера в байтах для каждой операции чтения. **По умолчанию:** `131072` (128 КиБ).
-   Возвращает: [`<Iterable<Uint8Array[]>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)

Синхронный аналог [`filehandle.pull()`](#filehandlepulltransforms-options). Возвращает синхронный итерируемый объект, который читает файл синхронным вводом-выводом в основном потоке. Чтение идёт блоками по `chunkSize` байт (по умолчанию 128 КиБ).

Пока итерируемый объект потребляется, дескриптор файла заблокирован. В отличие от асинхронного `pull()`, `AbortSignal` не поддерживается — все операции синхронны.

Функция доступна только при включённом флаге `--experimental-stream-iter`.

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';
    import { textSync, pipeToSync } from 'node:stream/iter';
    import { compressGzipSync, decompressGzipSync } from 'node:zlib/iter';

    const fh = await open('input.txt', 'r');

    // Read as text (sync)
    console.log(textSync(fh.pullSync({ autoClose: true })));

    // Sync compress pipeline: file -> gzip -> file
    const src = await open('input.txt', 'r');
    const dst = await open('output.gz', 'w');
    pipeToSync(src.pullSync(compressGzipSync(), { autoClose: true }), dst.writer({ autoClose: true }));
    ```

=== "CJS"

    ```js
    const { open } = require('node:fs/promises');
    const { textSync, pipeToSync } = require('node:stream/iter');
    const { compressGzipSync, decompressGzipSync } = require('node:zlib/iter');

    async function run() {
      const fh = await open('input.txt', 'r');

      // Read as text (sync)
      console.log(textSync(fh.pullSync({ autoClose: true })));

      // Sync compress pipeline: file -> gzip -> file
      const src = await open('input.txt', 'r');
      const dst = await open('output.gz', 'w');
      pipeToSync(
        src.pullSync(compressGzipSync(), { autoClose: true }),
        dst.writer({ autoClose: true }),
      );
    }

    run().catch(console.error);
    ```

#### `filehandle.read(buffer, offset, length, position)`

<!-- YAML
added: v10.0.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/42835
    description: Принимает значения bigint в качестве `position`.
-->

Добавлено в: v10.0.0

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Буфер, в который будут помещены считанные из файла данные.
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Позиция в буфере, начиная с которой нужно заполнять данные. **По умолчанию:** `0`
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт для чтения. **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null Позиция в файле, с которой следует начать чтение данных. Если `null` или `-1`, данные читаются из текущей позиции файла, и эта позиция будет обновлена. Если `position` является неотрицательным целым числом, текущая позиция файла останется неизменной. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется объектом с двумя свойствами:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество прочитанных байт
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ссылка на переданный аргумент `buffer`.

Читает данные из файла и помещает их в переданный буфер.

Если файл не изменяется параллельно, конец файла достигается, когда число прочитанных байт равно нулю.

#### `filehandle.read([options])`

<!-- YAML
added:
 - v13.11.0
 - v12.17.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/42835
    description: Принимает значения bigint в качестве `position`.
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Буфер, в который будут помещены считанные из файла данные. **По умолчанию:** `Buffer.alloc(16384)`
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Позиция в буфере, начиная с которой нужно заполнять данные. **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт для чтения. **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null Позиция в файле, с которой следует начать чтение данных. Если `null` или `-1`, данные читаются из текущей позиции файла, и эта позиция будет обновлена. Если `position` является неотрицательным целым числом, текущая позиция файла останется неизменной. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется объектом с двумя свойствами:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество прочитанных байт
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ссылка на переданный аргумент `buffer`.

Читает данные из файла и помещает их в переданный буфер.

Если файл не изменяется параллельно, конец файла достигается, когда число прочитанных байт равно нулю.

#### `filehandle.read(buffer[, options])`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/42835
    description: Принимает значения bigint в качестве `position`.
-->

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Буфер, в который будут помещены считанные из файла данные.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Позиция в буфере, начиная с которой нужно заполнять данные. **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт для чтения. **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null Позиция в файле, с которой следует начать чтение данных. Если `null` или `-1`, данные читаются из текущей позиции файла, и эта позиция будет обновлена. Если `position` является неотрицательным целым числом, текущая позиция файла останется неизменной. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется объектом с двумя свойствами:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество прочитанных байт
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ссылка на переданный аргумент `buffer`.

Читает данные из файла и помещает их в переданный буфер.

Если файл не изменяется параллельно, конец файла достигается, когда число прочитанных байт равно нулю.

#### `filehandle.readableWebStream([options])`

<!-- YAML
added: v17.0.0
changes:

  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: API отмечен как стабильный.
  - version:
    - v23.8.0
    - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/55461
    description: Удалена опция создания потока `'bytes'`. Теперь потоки всегда являются потоками `'bytes'`.
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/46933
    description: Добавлена опция создания потока `'bytes'`.
-->

Добавлено в: v17.0.0

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, [FileHandle](#filehandle) будет закрыт при закрытии потока. **По умолчанию:** `false`
-   Возвращает: [`<ReadableStream>`](webstreams.md#readablestream)

Возвращает байтовый `ReadableStream` для чтения содержимого файла.

Будет выброшена ошибка, если метод вызван более одного раза или после закрытия либо в процессе закрытия `FileHandle`.

=== "MJS"

    ```js
    import {
      open,
    } from 'node:fs/promises';

    const file = await open('./some/file/to/read');

    for await (const chunk of file.readableWebStream())
      console.log(chunk);

    await file.close();
    ```

=== "CJS"

    ```js
    const {
      open,
    } = require('node:fs/promises');

    (async () => {
      const file = await open('./some/file/to/read');

      for await (const chunk of file.readableWebStream())
        console.log(chunk);

      await file.close();
    })();
    ```

Хотя `ReadableStream` прочитает файл до конца, он не закроет `FileHandle` автоматически. Пользовательский код всё равно должен вызвать метод `fileHandle.close()`, если только опция `autoClose` не установлена в `true`.

#### `filehandle.readFile(options)`

<!-- YAML
added: v10.0.0
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать выполняющийся `readFile`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется содержимым файла. Если кодировка не указана (через `options.encoding`), данные возвращаются как объект [Buffer](buffer.md#buffer). В противном случае это будет строка.

Асинхронно читает всё содержимое файла.

Если `options` — строка, она задаёт `encoding`.

[`FileHandle`](#filehandle) должен поддерживать чтение.

Если для файлового дескриптора был выполнен один или несколько вызовов `filehandle.read()`, а затем вызывается `filehandle.readFile()`, данные будут прочитаны от текущей позиции до конца файла. Чтение не всегда начинается с начала файла.

#### `filehandle.readLines([options])`

<!-- YAML
added: v18.11.0
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `null`
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `start` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `end` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Infinity`
    -   `highWaterMark` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `64 * 1024`
-   Возвращает: [`<readline.InterfaceConstructor>`](readline.md#interfaceconstructor)

Вспомогательный метод для создания интерфейса `readline` и потокового чтения файла. Описание параметров см. в [`filehandle.createReadStream()`](#filehandlecreatereadstreamoptions).

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    const file = await open('./some/file/to/read');

    for await (const line of file.readLines()) {
      console.log(line);
    }
    ```

=== "CJS"

    ```js
    const { open } = require('node:fs/promises');

    (async () => {
      const file = await open('./some/file/to/read');

      for await (const line of file.readLines()) {
        console.log(line);
      }
    })();
    ```

#### `filehandle.readv(buffers[, position])`

<!-- YAML
added:
 - v13.13.0
 - v12.17.0
-->

-   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null Смещение от начала файла, с которого нужно читать данные. Если `position` не является `number`, данные будут читаться из текущей позиции. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется объектом с двумя свойствами:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество прочитанных байт
    -   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Свойство, содержащее ссылку на входной аргумент `buffers`.

Читает данные из файла и записывает их в массив объектов [ArrayBufferView](https://developer.mozilla.org/docs/Web/API/ArrayBufferView).

#### `filehandle.stat([options])`

<!-- YAML
added: v10.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/57775
    description: Теперь принимает дополнительное свойство `signal`, позволяющее прервать операцию.
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Принимает дополнительный объект `options`, позволяющий указать, должны ли возвращаемые числовые значения быть bigint.
-->

Добавлено в: v10.0.0

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) быть `bigint`. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) AbortSignal для отмены операции. **По умолчанию:** `undefined`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется объектом [fs.Stats](fs.md#fsstats) для файла.

#### `filehandle.sync()`

<!-- YAML
added: v10.0.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Запрашивает сброс всех данных для открытого файлового дескриптора на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. Подробнее см. документацию POSIX для `fsync(2)`.

#### `filehandle.truncate(len)`

<!-- YAML
added: v10.0.0
-->

-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Усекает файл.

Если файл был больше `len` байт, в нём будут сохранены только первые `len` байт.

Следующий пример сохраняет только первые четыре байта файла:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let filehandle = null;
    try {
      filehandle = await open('temp.txt', 'r+');
      await filehandle.truncate(4);
    } finally {
      await filehandle?.close();
    }
    ```

Если ранее файл был короче `len` байт, он будет расширен, а добавленная часть будет заполнена нулевыми байтами (`'\0'`):

Если `len` отрицателен, будет использовано значение `0`.

#### `filehandle.utimes(atime, mtime)`

<!-- YAML
added: v10.0.0
-->

-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Изменяет временные метки файловой системы для объекта, на который ссылается [FileHandle](#filehandle), и при успешном выполнении исполняет промис без аргументов.

#### `filehandle.write(buffer, offset[, length[, position]])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: Параметр `buffer` больше не приводит неподдерживаемый ввод
                 к буферам.
-->

Добавлено в: v10.0.0

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Начальная позиция внутри `buffer`, откуда начинаются данные для записи.
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт из `buffer`, которые нужно записать. **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null Смещение от начала файла, куда должны быть записаны данные из `buffer`. Если `position` не является `number`, данные будут записаны в текущую позицию. Подробнее см. POSIX `pwrite(2)`. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Записывает `buffer` в файл.

Промис выполняется объектом с двумя свойствами:

-   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество записанных байт
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ссылка на записанный `buffer`.

Небезопасно вызывать `filehandle.write()` несколько раз для одного и того же файла, не дожидаясь выполнения (или отклонения) промиса. Для такого сценария используйте [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

#### `filehandle.write(buffer[, options])`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Записывает `buffer` в файл.

Подобно описанной выше функции `filehandle.write`, эта версия принимает необязательный объект `options`. Если объект `options` не указан, используются приведённые выше значения по умолчанию.

#### `filehandle.write(string[, position[, encoding]])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: Параметр `string` больше не приводит неподдерживаемый ввод
                 к строкам.
-->

Добавлено в: v10.0.0

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null Смещение от начала файла, куда должны быть записаны данные из `string`. Если `position` не является `number`, данные будут записаны в текущую позицию. Подробнее см. POSIX `pwrite(2)`. **По умолчанию:** `null`
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Ожидаемая кодировка строки. **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Записывает `string` в файл. Если `string` не является строкой, промис будет отклонён с ошибкой.

Промис выполняется объектом с двумя свойствами:

-   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество записанных байт
-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Ссылка на записанную `string`.

Небезопасно вызывать `filehandle.write()` несколько раз для одного и того же файла, не дожидаясь выполнения (или отклонения) промиса. Для такого сценария используйте [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

#### `filehandle.writeFile(data, options)`

<!-- YAML
added: v10.0.0
changes:
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37490
    description: The `data` argument supports `AsyncIterable`, `Iterable`, and `Stream`.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
-->

Добавлено в: v10.0.0

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<AsyncIterable>`](https://tc39.es/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Stream>`](stream.md#stream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null Ожидаемая кодировка символов, когда `data` является строкой. **По умолчанию:** `'utf8'`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | undefined позволяет прервать выполняющийся `writeFile`. **По умолчанию:** `undefined`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой, буфером, объектом [AsyncIterable](https://tc39.es/ecma262/#sec-asynciterable-interface) или [Iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol). При успехе промис выполняется без аргументов.

Если `options` — строка, она задаёт `encoding`.

[`FileHandle`](#filehandle) должен поддерживать запись.

Небезопасно вызывать `filehandle.writeFile()` несколько раз для одного и того же файла, не дожидаясь выполнения (или отклонения) промиса.

Если для файлового дескриптора был выполнен один или несколько вызовов `filehandle.write()`, а затем вызывается `filehandle.writeFile()`, данные будут записаны от текущей позиции до конца файла. Запись не всегда начинается с начала файла.

#### `filehandle.writev(buffers[, position])`

<!-- YAML
added: v12.9.0
-->

-   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null Смещение от начала файла, куда должны быть записаны данные из `buffers`. Если `position` не является `number`, данные будут записаны в текущую позицию. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Записывает массив объектов [ArrayBufferView](https://developer.mozilla.org/docs/Web/API/ArrayBufferView) в файл.

Промис выполняется объектом с двумя свойствами:

-   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество записанных байт
-   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) Ссылка на входной аргумент `buffers`.

Небезопасно вызывать `writev()` несколько раз для одного и того же файла, не дожидаясь выполнения (или отклонения) промиса.

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

#### `filehandle.writer([options])`

<!-- YAML
added: v25.9.0
-->

> Стабильность: 1 - Экспериментальная

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Закрывать файловый дескриптор, когда writer завершает работу или переходит в состояние ошибки. **По умолчанию:** `false`.
    -   `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Смещение в байтах, с которого нужно начинать запись. Если указано, запись использует явное позиционирование. **По умолчанию:** текущая позиция файла.
    -   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное число байт, которое writer примет. Асинхронные записи (`write()`, `writev()`), превышающие лимит, отклоняются с `ERR_OUT_OF_RANGE`. Синхронные записи (`writeSync()`, `writevSync()`) возвращают `false`. **По умолчанию:** без ограничений.
    -   `chunkSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер чанка в байтах для синхронных операций записи. Записи больше этого порога переводятся на асинхронный ввод-вывод. Для оптимальной производительности `pipeTo()` установите значение, совпадающее с `chunkSize` у reader. **По умолчанию:** `131072` (128 KB).
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `write(chunk[, options])` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Возвращает [`<Promise<void>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). Принимает `Uint8Array`, `Buffer` или строку (в кодировке UTF-8).
        -   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
        -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
            -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Если сигнал уже прерван, запись отклоняется с `AbortError` без выполнения ввода-вывода.
    -   `writev(chunks[, options])` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Возвращает [`<Promise<void>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). Использует scatter/gather I/O через один системный вызов `writev()`. Принимает массивы с элементами смешанных типов `Uint8Array`/string.
        -   `chunks` [`<Array<Buffer|TypedArray|DataView|string>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
        -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
            -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Если сигнал уже прерван, запись отклоняется с `AbortError` без выполнения ввода-вывода.
    -   `writeSync(chunk)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Возвращает [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type). Пытается выполнить синхронную запись. Возвращает `true`, если запись успешна, и `false`, если вызывающему коду следует перейти на асинхронный `write()`. `false` возвращается, когда writer закрыт/в состоянии ошибки, когда асинхронная операция уже выполняется, когда размер чанка превышает `chunkSize` или когда запись превысила бы `limit`.
        -   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `writevSync(chunks)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Возвращает [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type). Синхронная пакетная запись. Семантика переключения на запасной вариант такая же, как у `writeSync()`.
        -   `chunks` [`<Array<Buffer|TypedArray|DataView|string>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
    -   `end([options])` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Возвращает [`<Promise<number>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) с общим числом записанных байт. Идемпотентен: возвращает `totalBytesWritten`, если уже закрыт, и возвращает ожидающий промис, если уже находится в процессе закрытия. Отклоняется, если writer находится в состоянии ошибки.
        -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
            -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Если сигнал уже прерван, `end()` отклоняется с `AbortError`, а writer остаётся открытым.
    -   `endSync()` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Возвращает [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type): общее число записанных байт при успехе или `-1`, если writer находится в состоянии ошибки либо выполняется асинхронная операция. Идемпотентен, если уже закрыт.
    -   `fail(reason)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Переводит writer в конечное состояние ошибки. Синхронный метод. Если writer уже закрыт или находится в состоянии ошибки, ничего не делает. Если `autoClose` равно `true`, синхронно закрывает файловый дескриптор.

Возвращает writer из [`node:stream/iter`](stream_iter.md), работающий поверх данного файлового дескриптора.

Writer поддерживает как `Symbol.asyncDispose`, так и `Symbol.dispose`:

-   `await using w = fh.writer()` — if the writer is still open (no `end()` called), `asyncDispose` calls `fail()`. If `end()` is pending, it waits for it to complete.
-   `using w = fh.writer()` — calls `fail()` unconditionally.

Методы `writeSync()` и `writevSync()` включают быстрый try-sync путь, используемый [`stream/iter pipeTo()`](stream_iter.md#pipetosource-transforms-writer). Когда размер чанка reader совпадает с `chunkSize` у writer, все записи в конвейере `pipeTo()` завершаются синхронно без накладных расходов на промисы.

Эта функция доступна только при включённом флаге `--experimental-stream-iter`.

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';
    import { from, pipeTo } from 'node:stream/iter';
    import { compressGzip } from 'node:zlib/iter';

    // Async pipeline
    const fh = await open('output.gz', 'w');
    await pipeTo(from('Hello!'), compressGzip(), fh.writer({ autoClose: true }));

    // Sync pipeline with limit
    const src = await open('input.txt', 'r');
    const dst = await open('output.txt', 'w');
    const w = dst.writer({ limit: 1024 * 1024 }); // Max 1 MB
    await pipeTo(src.pull({ autoClose: true }), w);
    await w.end();
    await dst.close();
    ```

=== "CJS"

    ```js
    const { open } = require('node:fs/promises');
    const { from, pipeTo } = require('node:stream/iter');
    const { compressGzip } = require('node:zlib/iter');

    async function run() {
      // Async pipeline
      const fh = await open('output.gz', 'w');
      await pipeTo(from('Hello!'), compressGzip(), fh.writer({ autoClose: true }));

      // Sync pipeline with limit
      const src = await open('input.txt', 'r');
      const dst = await open('output.txt', 'w');
      const w = dst.writer({ limit: 1024 * 1024 }); // Max 1 MB
      await pipeTo(src.pull({ autoClose: true }), w);
      await w.end();
      await dst.close();
    }

    run().catch(console.error);
    ```

#### `filehandle[Symbol.asyncDispose]()`

<!-- YAML
added:
 - v20.4.0
 - v18.18.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: Больше не является экспериментальным.
-->

Вызывает `filehandle.close()` и возвращает промис, который исполняется, когда `filehandle` закрыт.

### `fsPromises.access(path[, mode])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `fs.constants.F_OK`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Проверяет права пользователя на файл или каталог, указанный в `path`. Аргумент `mode` — необязательное целое число, задающее проверки доступности, которые нужно выполнить. `mode` должен быть либо значением `fs.constants.F_OK`, либо маской, составленной побитовым ИЛИ из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`). Возможные значения `mode` см. в [константах доступа к файлам](#file-access-constants).

Если проверка доступности успешна, промис выполняется без значения. Если какая-либо из проверок завершится неудачей, промис будет отклонён объектом [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error). Следующий пример проверяет, может ли текущий процесс читать и записывать файл `/etc/passwd`.

=== "MJS"

    ```js
    import { access, constants } from 'node:fs/promises';

    try {
      await access('/etc/passwd', constants.R_OK | constants.W_OK);
      console.log('can access');
    } catch {
      console.error('cannot access');
    }
    ```

Не рекомендуется использовать `fsPromises.access()` для проверки доступности файла перед вызовом `fsPromises.open()`. Это создаёт состояние гонки, поскольку между двумя вызовами другие процессы могут изменить состояние файла. Вместо этого пользовательский код должен сразу открывать, читать или записывать файл и обрабатывать ошибку, если файл недоступен.

### `fsPromises.appendFile(path, data[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v21.1.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50095
    description: Опция `flush` теперь поддерживается.
-->

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<FileHandle>`](#filehandle) Имя файла или [FileHandle](#filehandle)
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) См. [поддержку файловых `flags`](#file-system-flags). **По умолчанию:** `'a'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, базовый файловый дескриптор будет сброшен перед закрытием. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Асинхронно добавляет данные в файл, создавая файл, если он ещё не существует. `data` может быть строкой или [Buffer](buffer.md#buffer).

Если `options` — строка, она задаёт `encoding`.

Опция `mode` влияет только на вновь создаваемый файл. Подробнее см. [`fs.open()`](#fsopenpath-flags-mode-callback).

`path` может быть задан как [FileHandle](#filehandle), открытый для добавления (через `fsPromises.open()`).

### `fsPromises.chmod(path, mode)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Изменяет права доступа к файлу.

### `fsPromises.chown(path, uid, gid)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Изменяет владельца файла.

### `fsPromises.copyFile(src, dest[, mode])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Аргумент `flags` изменён на `mode`, а проверка типов
                 стала строже.
-->

Добавлено в: v10.0.0

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) Имя исходного файла для копирования
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) Имя файла назначения для операции копирования
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательные модификаторы, задающие поведение операции копирования. Можно создать маску, состоящую из побитового ИЛИ двух или более значений (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`) **По умолчанию:** `0`.
    -   `fs.constants.COPYFILE_EXCL`: Операция копирования завершится ошибкой, если `dest` уже существует.
    -   `fs.constants.COPYFILE_FICLONE`: Операция копирования попытается создать reflink по схеме copy-on-write. Если платформа не поддерживает copy-on-write, будет использован резервный механизм копирования.
    -   `fs.constants.COPYFILE_FICLONE_FORCE`: Операция копирования попытается создать reflink по схеме copy-on-write. Если платформа не поддерживает copy-on-write, операция завершится ошибкой.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Асинхронно копирует `src` в `dest`. По умолчанию `dest` будет перезаписан, если уже существует.

Никаких гарантий атомарности операции копирования не даётся. Если после открытия файла назначения для записи произойдёт ошибка, будет предпринята попытка удалить файл назначения.

=== "MJS"

    ```js
    import { copyFile, constants } from 'node:fs/promises';

    try {
      await copyFile('source.txt', 'destination.txt');
      console.log('source.txt was copied to destination.txt');
    } catch {
      console.error('The file could not be copied');
    }

    // By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
    try {
      await copyFile('source.txt', 'destination.txt', constants.COPYFILE_EXCL);
      console.log('source.txt was copied to destination.txt');
    } catch {
      console.error('The file could not be copied');
    }
    ```

### `fsPromises.cp(src, dest[, options])`

<!-- YAML
added: v16.7.0
changes:
  - version: v22.3.0
    pr-url: https://github.com/nodejs/node/pull/53127
    description: Этот API больше не является экспериментальным.
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47084
    description: Принимает дополнительную опцию `mode`, чтобы задавать
                 поведение копирования так же, как аргумент `mode` у `fs.copyFile()`.
  - version:
    - v17.6.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41819
    description: Принимает дополнительную опцию `verbatimSymlinks`, чтобы задавать,
                 нужно ли выполнять разрешение пути для символических ссылок.
-->

Добавлено в: v16.7.0

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Исходный путь для копирования.
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Путь назначения для копирования.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `dereference` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Разыменовывать символические ссылки. **По умолчанию:** `false`.
    -   `errorOnExist` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `force` равно `false` и место назначения существует, выбрасывать ошибку. **По умолчанию:** `false`.
    -   `filter` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция для фильтрации копируемых файлов и каталогов. Верните `true`, чтобы скопировать элемент, и `false`, чтобы его проигнорировать. Если игнорируется каталог, всё его содержимое также будет пропущено. Может также возвращать `Promise`, который разрешается в `true` или `false` **По умолчанию:** `undefined`.
        -   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Исходный путь для копирования.
        -   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь назначения для копирования.
        -   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Значение, приводимое к `boolean`, либо `Promise`, который исполняется таким значением.
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Перезаписывать существующий файл или каталог. Операция копирования будет игнорировать ошибки, если установить `false`, а место назначения уже существует. Используйте опцию `errorOnExist`, чтобы изменить это поведение. **По умолчанию:** `true`.
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Модификаторы операции копирования. **По умолчанию:** `0`. См. флаг `mode` у [`fsPromises.copyFile()`](#fspromisescopyfilesrc-dest-mode).
    -   `preserveTimestamps` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, временные метки из `src` будут сохранены. **По умолчанию:** `false`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Копировать каталоги рекурсивно. **По умолчанию:** `false`
    -   `verbatimSymlinks` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, разрешение путей для символических ссылок будет пропущено. **По умолчанию:** `false`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Асинхронно копирует всю структуру каталога из `src` в `dest`, включая подкаталоги и файлы.

При копировании одного каталога в другой globs не поддерживаются, а поведение аналогично `cp dir1/ dir2/`.

### `fsPromises.glob(pattern[, options])`

<!-- YAML
added: v22.0.0
changes:
  - version:
      - v24.1.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/58182
    description: Добавлена поддержка экземпляров `URL` для опции `cwd`.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: API отмечен как стабильный.
  - version:
    - v23.7.0
    - v22.14.0
    pr-url: https://github.com/nodejs/node/pull/56489
    description: Добавлена поддержка glob-шаблонов в опции `exclude`.
  - version: v22.2.0
    pr-url: https://github.com/nodejs/node/pull/52837
    description: Добавлена поддержка опции `withFileTypes`.
-->

Добавлено в: v22.0.0

-   `pattern` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) current working directory. **По умолчанию:** `process.cwd()`
    -   `exclude` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Function to filter out files/directories or a list of glob patterns to be excluded. If a function is provided, return `true` to exclude the item, `false` to include it. **По умолчанию:** `undefined`. If a string array is provided, each string should be a glob pattern that specifies paths to exclude. Note: Negation patterns (e.g., '!foo.js') are not supported.
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the glob should return paths as Dirents, `false` otherwise. **По умолчанию:** `false`.
-   Возвращает: [`<AsyncIterator>`](https://tc39.es/ecma262/#sec-asynciterator-interface) An AsyncIterator that yields the paths of files that match the pattern.

=== "MJS"

    ```js
    import { glob } from 'node:fs/promises';

    for await (const entry of glob('**/*.js'))
      console.log(entry);
    ```

=== "CJS"

    ```js
    const { glob } = require('node:fs/promises');

    (async () => {
      for await (const entry of glob('**/*.js'))
        console.log(entry);
    })();
    ```

### `fsPromises.lchmod(path, mode)`

<!-- YAML
deprecated: v10.0.0
-->

!!!danger "Стабильность: 0 - устарело или набрало много негативных отзывов"

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Изменяет права доступа символической ссылки.

Этот метод реализован только в macOS.

### `fsPromises.lchown(path, uid, gid)`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/21498
    description: This API is no longer deprecated.
-->

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Изменяет владельца символической ссылки.

### `fsPromises.lutimes(path, atime, mtime)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Изменяет время доступа и модификации файла так же, как [`fsPromises.utimes()`](#fspromisesutimespath-atime-mtime), с той разницей, что если путь указывает на символическую ссылку, то разыменование не выполняется: вместо этого изменяются временные метки самой символической ссылки.

### `fsPromises.link(existingPath, newPath)`

<!-- YAML
added: v10.0.0
-->

-   `existingPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Создаёт новую жёсткую ссылку с `existingPath` на `newPath`. Подробнее см. POSIX link(2).

### `fsPromises.lstat(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется объектом [fs.Stats](fs.md#fsstats) для указанной символической ссылки `path`.

Эквивалентен [`fsPromises.stat()`](#fspromisesstatpath-options), если только `path` не указывает на символическую ссылку. В этом случае статистика берётся для самой ссылки, а не для файла, на который она указывает. Подробнее см. документацию POSIX `lstat(2)`.

### `fsPromises.mkdir(path[, options])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) не поддерживается в Windows. Подробнее см. [Режимы файла](#file-modes). **По умолчанию:** `0o777`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`, если `recursive` равно `false`, или с путём первого созданного каталога, если `recursive` равно `true`.

Асинхронно создаёт каталог.

Необязательный аргумент `options` может быть целым числом, задающим `mode` (права доступа и sticky-биты), либо объектом со свойствами `mode` и `recursive`, указывающим, нужно ли создавать родительские каталоги. Вызов `fsPromises.mkdir()` с `path`, который уже существует как каталог, приводит к отклонению промиса только когда `recursive` равно `false`.

=== "MJS"

    ```js
    import { mkdir } from 'node:fs/promises';

    try {
      const projectFolder = new URL('./test/project/', import.meta.url);
      const createDir = await mkdir(projectFolder, { recursive: true });

      console.log(`created ${createDir}`);
    } catch (err) {
      console.error(err.message);
    }
    ```

=== "CJS"

    ```js
    const { mkdir } = require('node:fs/promises');
    const { join } = require('node:path');

    async function makeDirectory() {
      const projectFolder = join(__dirname, 'test', 'project');
      const dirCreation = await mkdir(projectFolder, { recursive: true });

      console.log(dirCreation);
      return dirCreation;
    }

    makeDirectory().catch(console.error);
    ```

### `fsPromises.mkdtemp(prefix[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/48828
    description: The `prefix` parameter now accepts buffers and URL.
  - version:
      - v16.5.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39028
    description: The `prefix` parameter now accepts an empty string.
-->

Добавлено в: v10.0.0

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется строкой, содержащей путь файловой системы к только что созданному временному каталогу.

Создаёт уникальный временный каталог. Уникальное имя каталога формируется добавлением шести случайных символов в конец переданного `prefix`. Из-за различий между платформами избегайте завершающих символов `X` в `prefix`. Некоторые платформы, особенно BSD, могут возвращать более шести случайных символов и заменять завершающие `X` в `prefix` случайными символами.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим используемую кодировку символов.

=== "MJS"

    ```js
    import { mkdtemp } from 'node:fs/promises';
    import { join } from 'node:path';
    import { tmpdir } from 'node:os';

    try {
      await mkdtemp(join(tmpdir(), 'foo-'));
    } catch (err) {
      console.error(err);
    }
    ```

Метод `fsPromises.mkdtemp()` добавляет шесть случайно выбранных символов непосредственно к строке `prefix`. Например, если дан каталог `/tmp` и требуется создать временный каталог _внутри_ `/tmp`, `prefix` должен заканчиваться завершающим платформенно-зависимым разделителем пути (`require('node:path').sep`).

### `fsPromises.mkdtempDisposable(prefix[, options])`

<!-- YAML
added: v24.4.0
-->

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется промисом для асинхронно освобождаемого объекта:
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) путь созданного каталога
    -   `remove` [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, удаляющая созданный каталог
    -   `[Symbol.asyncDispose]` [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) то же самое, что `remove`

Возвращаемый промис содержит асинхронно освобождаемый объект, чьё свойство `path` хранит путь к созданному каталогу. При освобождении объекта каталог и его содержимое будут удалены асинхронно, если они всё ещё существуют. Если каталог не удаётся удалить, освобождение завершится ошибкой. У объекта есть асинхронный метод `remove()`, выполняющий ту же задачу.

И эта функция, и функция освобождения у возвращаемого объекта являются асинхронными, поэтому использовать их следует через `await` + `await using`, например: `await using dir = await fsPromises.mkdtempDisposable('prefix')`.

<!-- TODO: link MDN docs for disposables once https://github.com/mdn/content/pull/38027 lands -->

For detailed information, see the documentation of [`fsPromises.mkdtemp()`](#fspromisesmkdtempprefix-options).

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим используемую кодировку символов.

### `fsPromises.open(path, flags[, mode])`

<!-- YAML
added: v10.0.0
changes:
  - version: v11.1.0
    pr-url: https://github.com/nodejs/node/pull/23767
    description: The `flags` argument is now optional and defaults to `'r'`.
-->

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
--   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) см. [поддержку файловых `flags`](#file-system-flags). **По умолчанию:** `'r'`.
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) задаёт режим файла (права доступа и sticky-биты), если файл создаётся. Подробнее см. [Режимы файла](#file-modes). **По умолчанию:** `0o666` (доступен для чтения и записи)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется объектом [FileHandle](#filehandle).

Открывает [FileHandle](#filehandle).

Подробнее см. документацию POSIX `open(2)`.

Some characters (`< > : " / \ | ? *`) are reserved under Windows as documented by [Naming Files, Paths, and Namespaces](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file). Under NTFS, if the filename contains a colon, Node.js will open a file system stream, as described by [this Microsoft Learn page](https://learn.microsoft.com/en-us/windows/win32/fileio/using-streams).

### `fsPromises.opendir(path[, options])`

<!-- YAML
added: v12.12.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/41439
    description: Added `recursive` option.
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30114
    description: The `bufferSize` option was introduced.
-->

Добавлено в: v12.12.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `bufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) число записей каталога, внутренне буферизуемых при чтении. Более высокие значения улучшают производительность, но увеличивают потребление памяти. **По умолчанию:** `32`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) возвращаемый `Dir` будет [AsyncIterable](https://tc39.es/ecma262/#sec-asynciterable-interface), содержащим все вложенные файлы и каталоги. **По умолчанию:** `false`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется объектом [fs.Dir](fs.md#class-fsdir).

Асинхронно открывает каталог для последовательного обхода. Подробнее см. POSIX opendir(3).

Создаёт [fs.Dir](fs.md#class-fsdir) со всеми методами чтения и очистки каталога.

Опция `encoding` задаёт кодировку для `path` при открытии и дальнейших операциях чтения.

Пример использования асинхронной итерации:

=== "MJS"

    ```js
    import { opendir } from 'node:fs/promises';

    try {
      const dir = await opendir('./');
      for await (const dirent of dir)
        console.log(dirent.name);
    } catch (err) {
      console.error(err);
    }
    ```

При использовании асинхронного итератора объект [fs.Dir](fs.md#class-fsdir) будет автоматически закрыт после завершения итерации.

### `fsPromises.readdir(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/41439
    description: Added `recursive` option.
  - version: v10.11.0
    pr-url: https://github.com/nodejs/node/pull/22020
    description: New option `withFileTypes` was added.
-->

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, читает содержимое каталога рекурсивно. В рекурсивном режиме будут перечислены все файлы, вложенные файлы и каталоги. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется массивом имён файлов каталога, исключая `'.'` и `'..'`.

Читает содержимое каталога.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим кодировку имён файлов. Если `encoding` установлено в `'buffer'`, возвращаемые имена файлов будут объектами [Buffer](buffer.md#buffer).

Если `options.withFileTypes` установлено в `true`, возвращаемый массив будет содержать объекты [fs.Dirent](fs.md#fsdirent).

=== "MJS"

    ```js
    import { readdir } from 'node:fs/promises';

    try {
      const files = await readdir(path);
      for (const file of files)
        console.log(file);
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

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<FileHandle>`](#filehandle) filename or `FileHandle`
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать выполняющийся `readFile`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется содержимым файла.

Асинхронно читает всё содержимое файла.

Если кодировка не указана (через `options.encoding`), данные возвращаются как объект [Buffer](buffer.md#buffer). В противном случае это будет строка.

Если `options` — строка, она задаёт кодировку.

Если `path` указывает на каталог, поведение `fsPromises.readFile()` зависит от платформы. В macOS, Linux и Windows промис будет отклонён с ошибкой. В FreeBSD будет возвращено представление содержимого каталога.

Пример чтения файла `package.json`, расположенного в том же каталоге, что и выполняемый код:

=== "MJS"

    ```js
    import { readFile } from 'node:fs/promises';
    try {
      const filePath = new URL('./package.json', import.meta.url);
      const contents = await readFile(filePath, { encoding: 'utf8' });
      console.log(contents);
    } catch (err) {
      console.error(err.message);
    }
    ```

=== "CJS"

    ```js
    const { readFile } = require('node:fs/promises');
    const { resolve } = require('node:path');
    async function logFile() {
      try {
        const filePath = resolve('./package.json');
        const contents = await readFile(filePath, { encoding: 'utf8' });
        console.log(contents);
      } catch (err) {
        console.error(err.message);
      }
    }
    logFile();
    ```

Текущий `readFile` можно прервать с помощью [AbortSignal](globals.md#abortsignal). Если запрос прерван, возвращаемый промис отклоняется с `AbortError`:

=== "MJS"

    ```js
    import { readFile } from 'node:fs/promises';

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

Прерывание текущего запроса не отменяет отдельные запросы операционной системы, а лишь внутреннюю буферизацию, которую выполняет `fs.readFile`.

Любой указанный [FileHandle](#filehandle) должен поддерживать чтение.

### `fsPromises.readlink(path[, options])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется строкой `linkString`.

Читает содержимое символьной ссылки `path`. Подробнее см. POSIX readlink(2). При успехе промис даёт строку `linkString`.

Необязательный `options` — строка с кодировкой или объект с полем `encoding`. При `encoding: 'buffer'` путь к ссылке возвращается как [Buffer](buffer.md#buffer).

### `fsPromises.realpath(path[, options])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется разрешённым путём.

Определяет фактическое расположение `path`, используя ту же семантику, что и функция `fs.realpath.native()`.

Поддерживаются только пути, которые можно преобразовать в строки UTF-8.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим кодировку символов для пути. Если `encoding` установлено в `'buffer'`, возвращаемый путь будет передан как объект [Buffer](buffer.md#buffer).

В Linux, когда Node.js слинкован с musl libc, для работы этой функции файловая система procfs должна быть смонтирована в `/proc`. У glibc такого ограничения нет.

### `fsPromises.rename(oldPath, newPath)`

<!-- YAML
added: v10.0.0
-->

-   `oldPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Переименовывает `oldPath` в `newPath`.

### `fsPromises.rmdir(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/58616
    description: Remove `recursive` option.
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

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) в настоящий момент никаких опций не предоставляется. Раньше существовали опции `recursive`, `maxBusyTries` и `emfileWait`, но они были устаревшими и удалены. Аргумент `options` по-прежнему принимается для обратной совместимости, но не используется.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Удаляет каталог, указанный в `path`.

Использование `fsPromises.rmdir()` для файла (а не каталога) приводит к отклонению промиса с ошибкой `ENOENT` в Windows и `ENOTDIR` в POSIX.

Чтобы получить поведение, аналогичное Unix-команде `rm -rf`, используйте [`fsPromises.rm()`](#fspromisesrmpath-options) с опциями `{ recursive: true, force: true }`.

### `fsPromises.rm(path[, options])`

<!-- YAML
added: v14.14.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, исключения игнорируются, если `path` не существует. **По умолчанию:** `false`.
    -   `maxRetries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) если возникает ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js повторяет операцию, линейно увеличивая ожидание на `retryDelay` миллисекунд при каждой попытке. Эта опция задаёт число повторов. Игнорируется, если `recursive` не равно `true`. **По умолчанию:** `0`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, выполняется рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при сбоях. **По умолчанию:** `false`.
    -   `retryDelay` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество миллисекунд ожидания между повторными попытками. Игнорируется, если `recursive` не равно `true`. **По умолчанию:** `100`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Удаляет файлы и каталоги (по образцу стандартной POSIX-утилиты `rm`).

### `fsPromises.stat(path[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/61178
    description: Accepts a `throwIfNoEntry` option to specify whether
                 an exception should be thrown if the entry does not exist.
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

Добавлено в: v10.0.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) следует ли выбрасывать исключение, если запись файловой системы не существует, вместо возврата `undefined`. **По умолчанию:** `true`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется объектом [fs.Stats](fs.md#fsstats) для указанного `path`.

### `fsPromises.statfs(path[, options])`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.StatFs](fs.md#fsstatfs) иметь тип `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется объектом [fs.StatFs](fs.md#fsstatfs) для указанного `path`.

### `fsPromises.symlink(target, path[, type])`

<!-- YAML
added: v10.0.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42894
    description: If the `type` argument is `null` or omitted, Node.js will
                 autodetect `target` type and automatically
                 select `dir` or `file`.

-->

Добавлено в: v10.0.0

-   `target` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Создаёт символическую ссылку.

Аргумент `type` используется только в Windows и может иметь одно из значений: `'dir'`, `'file'` или `'junction'`. Если `type` равен `null`, Node.js автоматически определит тип `target` и использует `'file'` или `'dir'`. Если `target` не существует, будет использовано `'file'`. Точки соединения Windows требуют, чтобы путь назначения был абсолютным. При использовании `'junction'` аргумент `target` автоматически нормализуется к абсолютному пути. Точки соединения на томах NTFS могут указывать только на каталоги.

### `fsPromises.truncate(path[, len])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Усекает (или увеличивает) длину содержимого по пути `path` до `len` байт.

### `fsPromises.unlink(path)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Если `path` указывает на символическую ссылку, ссылка будет удалена без влияния на файл или каталог, на который она указывает. Если `path` указывает на путь к файлу, который не является символической ссылкой, файл будет удалён. Подробнее см. POSIX `unlink(2)`.

### `fsPromises.utimes(path, atime, mtime)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) При успешном выполнении исполняется значением `undefined`.

Изменяет временные метки файловой системы для объекта, на который указывает `path`.

Аргументы `atime` и `mtime` подчиняются следующим правилам:

-   Значениями могут быть числа, представляющие время Unix epoch, объекты `Date` или числовые строки вроде `'123456789.0'`.
-   Если значение нельзя преобразовать в число либо это `NaN`, `Infinity` или `-Infinity`, будет выброшен `Error`.

### `fsPromises.watch(filename[, options])`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `persistent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, должен ли процесс продолжать работу, пока файлы отслеживаются. **По умолчанию:** `true`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, нужно ли отслеживать все подкаталоги или только текущий каталог. Применяется, когда указан каталог, и только на поддерживаемых платформах (см. [предостережения](#caveats)). **По умолчанию:** `false`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) задаёт кодировку символов, которая будет использоваться для имени файла, передаваемого слушателю. **По умолчанию:** `'utf8'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) [AbortSignal](globals.md#abortsignal), используемый для указания, когда наблюдатель должен остановиться.
    -   `maxQueue` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) задаёт число событий, которое может быть помещено в очередь между итерациями возвращаемого [AsyncIterator](https://tc39.es/ecma262/#sec-asynciterator-interface). **По умолчанию:** `2048`.
    -   `overflow` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) либо `'ignore'`, либо `'throw'`, когда событий для очереди больше, чем допускает `maxQueue`. `'ignore'` означает, что события переполнения будут отброшены и будет выдано предупреждение, а `'throw'` означает выброс исключения. **По умолчанию:** `'ignore'`.
    -   `ignore` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) шаблоны для игнорирования. Строки являются glob-шаблонами (с использованием [`minimatch`](https://github.com/isaacs/minimatch)), шаблоны `RegExp` проверяются по имени файла, а функции получают имя файла и возвращают `true`, если его нужно игнорировать. **По умолчанию:** `undefined`.
-   Возвращает: [`<AsyncIterator>`](https://tc39.es/ecma262/#sec-asynciterator-interface) объектов со свойствами:
    -   `eventType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) тип изменения
    -   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | null имя изменившегося файла

Возвращает асинхронный итератор, отслеживающий изменения для `filename`, где `filename` может быть как файлом, так и каталогом.

```js
const { watch } = require('node:fs/promises');

const ac = new AbortController();
const { signal } = ac;
setTimeout(() => ac.abort(), 10000);

(async () => {
    try {
        const watcher = watch(__filename, { signal });
        for await (const event of watcher)
            console.log(event);
    } catch (err) {
        if (err.name === 'AbortError') return;
        throw err;
    }
})();
```

На большинстве платформ событие `'rename'` генерируется всякий раз, когда имя файла появляется или исчезает в каталоге.

Все [предостережения](#caveats) для `fs.watch()` также относятся к `fsPromises.watch()`.

### `fsPromises.writeFile(file, data[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v21.0.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50009
    description: The `flush` option is now supported.
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37490
    description: The `data` argument supports `AsyncIterable`, `Iterable`, and `Stream`.
  - version:
      - v15.2.0
      - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/35993
    description: The options argument may include an AbortSignal to abort an
                 ongoing writeFile request.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `data` parameter won't coerce unsupported input to
                 strings anymore.
-->

Добавлено в: v10.0.0

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<FileHandle>`](#filehandle) filename or `FileHandle`
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<AsyncIterable>`](https://tc39.es/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Stream>`](stream.md#stream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) см. [поддержку файловых `flags`](#file-system-flags). **По умолчанию:** `'w'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если все данные успешно записаны в файл и `flush` равно `true`, для сброса данных используется `filehandle.sync()`. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать выполняющийся `writeFile`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется с `undefined`.

Асинхронно записывает данные в файл, заменяя файл, если он уже существует. `data` может быть строкой, буфером, объектом [AsyncIterable](https://tc39.es/ecma262/#sec-asynciterable-interface) или объектом [Iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol).

Опция `encoding` игнорируется, если `data` является буфером.

Если `options` — строка, она задаёт кодировку.

Параметр `mode` влияет только на вновь создаваемый файл. Подробнее см. в [`fs.open()`](#fsopenpath-flags-mode-callback).

Любой указанный [FileHandle](#filehandle) должен поддерживать запись.

Небезопасно использовать `fsPromises.writeFile()` несколько раз для одного и того же файла, не дожидаясь завершения промиса.

Как и `fsPromises.readFile`, `fsPromises.writeFile` — это удобный метод, который внутри выполняет несколько вызовов `write`, чтобы записать переданный буфер. Для кода, чувствительного к производительности, лучше использовать [`fs.createWriteStream()`](#fscreatewritestreampath-options) или [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

Можно использовать [AbortSignal](globals.md#abortsignal), чтобы отменить `fsPromises.writeFile()`. Отмена выполняется по принципу "best effort", и некоторое количество данных, вероятно, всё равно будет записано.

=== "MJS"

    ```js
    import { writeFile } from 'node:fs/promises';
    import { Buffer } from 'node:buffer';

    try {
      const controller = new AbortController();
      const { signal } = controller;
      const data = new Uint8Array(Buffer.from('Hello Node.js'));
      const promise = writeFile('message.txt', data, { signal });

      // Abort the request before the promise settles.
      controller.abort();

      await promise;
    } catch (err) {
      // When a request is aborted - err is an AbortError
      console.error(err);
    }
    ```

Прерывание выполняющегося запроса не отменяет отдельные запросы операционной системы, а лишь внутреннюю буферизацию, которую выполняет `fs.writeFile`.

### `fsPromises.constants`

<!-- YAML
added:
  - v18.4.0
  - v16.17.0
-->

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект, содержащий часто используемые константы для операций файловой системы. Этот объект совпадает с `fs.constants`. Подробнее см. в разделе [Константы FS](#fs-constants).

## API обратных вызовов

API обратных вызовов выполняют все операции асинхронно, не блокируя цикл событий, а затем вызывают функцию обратного вызова при завершении или ошибке.

API обратных вызовов используют базовый пул потоков Node.js для выполнения операций файловой системы вне потока цикла событий. Эти операции не синхронизированы и не являются потокобезопасными. При выполнении нескольких одновременных изменений одного и того же файла нужно соблюдать осторожность, иначе возможна порча данных.

### `fs.access(path[, mode], callback)`

<!-- YAML
added: v0.11.15
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/55862
    description: The constants `fs.F_OK`, `fs.R_OK`, `fs.W_OK` and `fs.X_OK`
                 which were present directly on `fs` are removed.
  - version: v20.8.0
    pr-url: https://github.com/nodejs/node/pull/49683
    description: The constants `fs.F_OK`, `fs.R_OK`, `fs.W_OK` and `fs.X_OK`
                 which were present directly on `fs` are deprecated.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.11.15

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `fs.constants.F_OK`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Проверяет права пользователя на файл или каталог, указанный в `path`. Аргумент `mode` — необязательное целое число, задающее выполняемые проверки доступности. `mode` должен быть либо значением `fs.constants.F_OK`, либо маской, составленной побитовым ИЛИ из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`). Возможные значения `mode` см. в разделе [Константы доступа к файлам](#file-access-constants).

Последний аргумент, `callback`, — это функция обратного вызова, вызываемая с возможным аргументом ошибки. Если какая-либо из проверок доступности завершается неудачей, аргумент ошибки будет объектом `Error`. В следующих примерах проверяется, существует ли `package.json` и доступен ли он для чтения или записи.

=== "MJS"

    ```js
    import { access, constants } from 'node:fs';

    const file = 'package.json';

    // Check if the file exists in the current directory.
    access(file, constants.F_OK, (err) => {
      console.log(`${file} ${err ? 'does not exist' : 'exists'}`);
    });

    // Check if the file is readable.
    access(file, constants.R_OK, (err) => {
      console.log(`${file} ${err ? 'is not readable' : 'is readable'}`);
    });

    // Check if the file is writable.
    access(file, constants.W_OK, (err) => {
      console.log(`${file} ${err ? 'is not writable' : 'is writable'}`);
    });

    // Check if the file is readable and writable.
    access(file, constants.R_OK | constants.W_OK, (err) => {
      console.log(`${file} ${err ? 'is not' : 'is'} readable and writable`);
    });
    ```

Не используйте `fs.access()` для проверки доступности файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()`. Это создаёт состояние гонки, поскольку между двумя вызовами другой процесс может изменить состояние файла. Вместо этого код пользователя должен напрямую открывать/читать/записывать файл и обрабатывать ошибку, возникающую, если файл недоступен.

**write (NOT RECOMMENDED)**

=== "MJS"

    ```js
    import { access, open, close } from 'node:fs';

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

**write (RECOMMENDED)**

=== "MJS"

    ```js
    import { open, close } from 'node:fs';

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

**read (NOT RECOMMENDED)**

=== "MJS"

    ```js
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

=== "MJS"

    ```js
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

Примеры выше с пометкой "not recommended" сначала проверяют доступность файла, а затем используют его; примеры с пометкой "recommended" лучше, потому что работают с файлом напрямую и при необходимости обрабатывают ошибку.

В общем случае проверяйте доступность файла только тогда, когда сам файл не будет использоваться напрямую, например если его доступность служит сигналом от другого процесса.

В Windows политики управления доступом (ACL) для каталога могут ограничивать доступ к файлу или каталогу. Однако функция `fs.access()` не проверяет ACL и потому может сообщить, что путь доступен, даже если ACL запрещает пользователю чтение или запись.

### `fs.appendFile(path, data[, options], callback)`

<!-- YAML
added: v0.6.7
changes:
  - version:
    - v21.1.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50095
    description: The `flush` option is now supported.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.6.7

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'a'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, the underlying file descriptor is flushed prior to closing it. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно добавляет данные в файл, создавая его, если он ещё не существует. `data` может быть строкой или [Buffer](buffer.md#buffer).

Опция `mode` влияет только на вновь создаваемый файл. Подробнее см. [`fs.open()`](#fsopenpath-flags-mode-callback).

=== "MJS"

    ```js
    import { appendFile } from 'node:fs';

    appendFile('message.txt', 'data to append', (err) => {
      if (err) throw err;
      console.log('The "data to append" was appended to file!');
    });
    ```

Если `options` — строка, она задаёт кодировку:

=== "MJS"

    ```js
    import { appendFile } from 'node:fs';

    appendFile('message.txt', 'data to append', 'utf8', callback);
    ```

`path` может быть указан как числовой файловый дескриптор, открытый для добавления (через `fs.open()` или `fs.openSync()`). Такой файловый дескриптор не закрывается автоматически.

=== "MJS"

    ```js
    import { open, close, appendFile } from 'node:fs';

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
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.30

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно изменяет права доступа к файлу. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX chmod(2).

=== "MJS"

    ```js
    import { chmod } from 'node:fs';

    chmod('my_file.txt', 0o775, (err) => {
      if (err) throw err;
      console.log('The permissions for file "my_file.txt" have been changed!');
    });
    ```

#### File modes

Аргумент `mode`, используемый в методах `fs.chmod()` и `fs.chmodSync()`, представляет собой числовую битовую маску, создаваемую с помощью побитового OR следующих констант:

| Константа | Восьмеричное значение | Описание |
| --- | --- | --- |
| `fs.constants.S_IRUSR` | `0o400` | чтение владельцем |
| `fs.constants.S_IWUSR` | `0o200` | запись владельцем |
| `fs.constants.S_IXUSR` | `0o100` | выполнение/поиск владельцем |
| `fs.constants.S_IRGRP` | `0o40` | чтение группой |
| `fs.constants.S_IWGRP` | `0o20` | запись группой |
| `fs.constants.S_IXGRP` | `0o10` | выполнение/поиск группой |
| `fs.constants.S_IROTH` | `0o4` | чтение остальными |
| `fs.constants.S_IWOTH` | `0o2` | запись остальными |
| `fs.constants.S_IXOTH` | `0o1` | выполнение/поиск остальными |

Более простой способ задать `mode` — использовать последовательность из трёх восьмеричных цифр (например, `765`). Самая левая цифра (`7` в примере) задаёт права для владельца файла. Средняя цифра (`6` в примере) задаёт права для группы. Самая правая цифра (`5` в примере) задаёт права для остальных.

| Число | Описание |
| --- | --- |
| `7` | чтение, запись и выполнение |
| `6` | чтение и запись |
| `5` | чтение и выполнение |
| `4` | только чтение |
| `3` | запись и выполнение |
| `2` | только запись |
| `1` | только выполнение |
| `0` | нет прав |

Например, восьмеричное значение `0o765` означает:

-   владелец может читать, записывать и выполнять файл;
-   группа может читать и записывать файл;
-   остальные могут читать и выполнять файл.

Если использовать необработанные числа там, где ожидаются режимы файлов, любое значение больше `0o777` может приводить к платформенно-зависимому поведению, для которого не гарантируется единообразная работа. Поэтому константы вроде `S_ISVTX`, `S_ISGID` или `S_ISUID` не экспортируются через `fs.constants`.

Предостережение: в Windows можно изменить только право на запись, а различие между правами группы, владельца и остальных не реализовано.

### `fs.chown(path, uid, gid, callback)`

<!-- YAML
added: v0.1.97
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.97

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно изменяет владельца и группу файла. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX chown(2).

### `fs.close(fd[, callback])`

<!-- YAML
added: v0.0.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Закрывает файловый дескриптор. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Вызов `fs.close()` для любого файлового дескриптора (`fd`), который в данный момент используется в какой-либо другой операции `fs`, может привести к неопределённому поведению.

Подробнее см. POSIX close(2).

### `fs.copyFile(src, dest[, mode], callback)`

<!-- YAML
added: v8.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Changed `flags` argument to `mode` and imposed
                 stricter type validation.
-->

Добавлено в: v8.5.0

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) имя исходного файла для копирования
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) имя целевого файла операции копирования
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) модификаторы операции копирования. **По умолчанию:** `0`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно копирует `src` в `dest`. По умолчанию `dest` будет перезаписан, если он уже существует. В callback не передаются никакие аргументы, кроме возможного исключения. Node.js не даёт никаких гарантий атомарности операции копирования. Если ошибка возникает после открытия целевого файла для записи, Node.js попытается удалить его.

`mode` — необязательное целое число, задающее поведение операции копирования. Можно создать маску из двух или более значений, объединённых побитовым ИЛИ (например, `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

-   `fs.constants.COPYFILE_EXCL`: операция копирования завершится ошибкой, если `dest` уже существует.
-   `fs.constants.COPYFILE_FICLONE`: операция копирования попытается создать reflink с копированием по записи. Если платформа не поддерживает copy-on-write, используется запасной механизм копирования.
-   `fs.constants.COPYFILE_FICLONE_FORCE`: операция копирования попытается создать reflink с копированием по записи. Если платформа не поддерживает copy-on-write, операция завершится ошибкой.

=== "MJS"

    ```js
    import { copyFile, constants } from 'node:fs';

    function callback(err) {
      if (err) throw err;
      console.log('source.txt was copied to destination.txt');
    }

    // destination.txt will be created or overwritten by default.
    copyFile('source.txt', 'destination.txt', callback);

    // By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
    copyFile('source.txt', 'destination.txt', constants.COPYFILE_EXCL, callback);
    ```

### `fs.cp(src, dest[, options], callback)`

<!-- YAML
added: v16.7.0
changes:
  - version: v22.3.0
    pr-url: https://github.com/nodejs/node/pull/53127
    description: This API is no longer experimental.
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47084
    description: Accept an additional `mode` option to specify
                 the copy behavior as the `mode` argument of `fs.copyFile()`.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version:
    - v17.6.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41819
    description: Accepts an additional `verbatimSymlinks` option to specify
                 whether to perform path resolution for symlinks.
-->

Добавлено в: v16.7.0

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) source path to copy.
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) destination path to copy to.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `dereference` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) dereference symlinks. **По умолчанию:** `false`.
    -   `errorOnExist` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) when `force` is `false`, and the destination exists, throw an error. **По умолчанию:** `false`.
    -   `filter` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Function to filter copied files/directories. Return `true` to copy the item, `false` to ignore it. When ignoring a directory, all of its contents will be skipped as well. Can also return a `Promise` that resolves to `true` or `false` **По умолчанию:** `undefined`.
        -   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) source path to copy.
        -   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) путь назначения для копирования
        -   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) значение, приводимое к `boolean`, либо `Promise`, который выполняется таким значением
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) перезаписывать существующий файл или каталог. Если установить `false` и назначение уже существует, операция копирования будет игнорировать ошибки. Чтобы изменить это поведение, используйте опцию `errorOnExist`. **По умолчанию:** `true`.
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) модификаторы операции копирования. **По умолчанию:** `0`. См. флаг `mode` у [`fs.copyFile()`](#fscopyfilesrc-dest-mode-callback).
    -   `preserveTimestamps` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, временные метки из `src` будут сохранены. **По умолчанию:** `false`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) копировать каталоги рекурсивно. **По умолчанию:** `false`
    -   `verbatimSymlinks` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, разрешение путей для символических ссылок будет пропущено. **По умолчанию:** `false`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно копирует всю структуру каталогов из `src` в `dest`, включая подкаталоги и файлы.

При копировании одного каталога в другой glob-шаблоны не поддерживаются, а поведение аналогично `cp dir1/ dir2/`.

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
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/36431
    description: Add support for `AbortSignal`.
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

Добавлено в: v0.1.31

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `null`
    -   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<FileHandle>`](#filehandle) **По умолчанию:** `null`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `start` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `end` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Infinity`
    -   `highWaterMark` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `64 * 1024`
    -   `fs` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | null **По умолчанию:** `null`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | null **По умолчанию:** `null`
-   Возвращает: [`<fs.ReadStream>`](fs.md#class-fsreadstream)

`options` может включать значения `start` и `end`, чтобы читать диапазон байтов файла, а не весь файл целиком. И `start`, и `end` включаются в диапазон, отсчёт начинается с 0, допустимые значения находятся в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)]. Если указан `fd`, а `start` опущен или равен `undefined`, `fs.createReadStream()` читает последовательно от текущей позиции в файле. `encoding` может быть любым из значений, принимаемых [Buffer](buffer.md#buffer).

Если указан `fd`, `ReadStream` игнорирует аргумент `path` и использует переданный файловый дескриптор. Это означает, что событие `'open'` сгенерировано не будет. `fd` должен быть блокирующим; неблокирующие `fd` следует передавать в [net.Socket](net.md#class-netsocket).

Если `fd` указывает на символьное устройство, поддерживающее только блокирующее чтение (например, клавиатуру или звуковую карту), операции чтения не завершаются, пока данные не станут доступны. Это может помешать завершению процесса и естественному закрытию потока.

По умолчанию поток генерирует событие `'close'` после уничтожения. Чтобы изменить это поведение, установите опцию `emitClose` в `false`.

Через опцию `fs` можно переопределить соответствующие реализации `fs` для `open`, `read` и `close`. При передаче опции `fs` переопределение `read` обязательно. Если `fd` не указан, обязательно также переопределение `open`. Если `autoClose` равно `true`, обязательно также переопределение `close`.

=== "MJS"

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

Если `autoClose` равно `false`, файловый дескриптор не будет закрыт даже при ошибке. Приложение само отвечает за его закрытие и за отсутствие утечек файловых дескрипторов. Если `autoClose` установлено в `true` (поведение по умолчанию), при `'error'` или `'end'` файловый дескриптор будет закрыт автоматически.

`mode` sets the file mode (permission and sticky bits), but only if the file was created.

Пример чтения последних 10 байтов файла длиной 100 байтов:

=== "MJS"

    ```js
    import { createReadStream } from 'node:fs';

    createReadStream('sample.txt', { start: 90, end: 99 });
    ```

Если `options` — строка, она задаёт кодировку.

### `fs.createWriteStream(path[, options])`

<!-- YAML
added: v0.1.31
changes:
  - version:
    - v21.0.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50093
    description: The `flush` option is now supported.
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/40013
    description: The `fs` option does not need `open` method if an `fd` was provided.
  - version: v16.10.0
    pr-url: https://github.com/nodejs/node/pull/40013
    description: The `fs` option does not need `close` method if `autoClose` is `false`.
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/36431
    description: Add support for `AbortSignal`.
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

Добавлено в: v0.1.31

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'w'`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<FileHandle>`](#filehandle) **По умолчанию:** `null`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `start` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `fs` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | null **По умолчанию:** `null`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | null **По умолчанию:** `null`
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `16384`
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, базовый файловый дескриптор будет сброшен перед закрытием. **По умолчанию:** `false`.
-   Возвращает: [`<fs.WriteStream>`](fs.md#fswritestream)

`options` также может включать опцию `start`, позволяющую писать данные в некоторую позицию после начала файла; допустимые значения лежат в диапазоне \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)]. Чтобы изменять файл, а не заменять его, может потребоваться установить `flags` в `r+`, а не использовать значение по умолчанию `w`. `encoding` может быть любым из значений, принимаемых [Buffer](buffer.md#buffer).

Если `autoClose` установлено в `true` (поведение по умолчанию), при `'error'` или `'finish'` файловый дескриптор будет закрыт автоматически. Если `autoClose` равно `false`, файловый дескриптор не будет закрыт даже при ошибке. Приложение само отвечает за его закрытие и за отсутствие утечек файловых дескрипторов.

По умолчанию поток генерирует событие `'close'` после уничтожения. Чтобы изменить это поведение, установите опцию `emitClose` в `false`.

Через опцию `fs` можно переопределить соответствующие реализации `fs` для `open`, `write`, `writev` и `close`. Переопределение `write()` без `writev()` может снизить производительность, потому что некоторые оптимизации (`_writev()`) будут отключены. При передаче опции `fs` требуется переопределить как минимум одну из функций `write` и `writev`. Если опция `fd` не передана, обязательно также переопределение `open`. Если `autoClose` равно `true`, обязательно также переопределение `close`.

Как и [fs.ReadStream](fs.md#class-fsreadstream), если указан `fd`, [fs.WriteStream](fs.md#fswritestream) игнорирует аргумент `path` и использует переданный файловый дескриптор. Это означает, что событие `'open'` сгенерировано не будет. `fd` должен быть блокирующим; неблокирующие `fd` следует передавать в [net.Socket](net.md#class-netsocket).

Если `options` — строка, она задаёт кодировку.

### `fs.exists(path, callback)`

<!-- YAML
added: v0.0.2
deprecated: v1.0.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
-->

Добавлено в: v0.0.2

!!!danger "Стабильность: 0 - устарело или набрало много негативных отзывов"

Используйте [`fs.stat()`](#fsstatpath-options-callback) или [`fs.access()`](#fsaccesspath-mode-callback).

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `exists` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет через файловую систему, существует ли элемент по указанному пути `path`. Затем вызывает `callback` со значением `true` или `false`:

=== "MJS"

    ```js
    import { exists } from 'node:fs';

    exists('/etc/passwd', (e) => {
      console.log(e ? 'it exists' : 'no passwd!');
    });
    ```

**Параметры этого callback не согласованы с другими callback Node.js.** Обычно первый параметр callback в Node.js — это `err`, за которым при необходимости следуют другие параметры. Callback `fs.exists()` имеет только один логический параметр. Это одна из причин, почему вместо `fs.exists()` рекомендуется использовать `fs.access()`.

Если `path` является символической ссылкой, она будет разыменована. Поэтому, если `path` существует, но указывает на несуществующий элемент, callback получит значение `false`.

Использовать `fs.exists()` для проверки существования файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. Это создаёт состояние гонки, поскольку между двумя вызовами другой процесс может изменить состояние файла. Вместо этого код пользователя должен напрямую открывать/читать/записывать файл и обрабатывать ошибку, возникающую, если файл не существует.

**write (NOT RECOMMENDED)**

=== "MJS"

    ```js
    import { exists, open, close } from 'node:fs';

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

**write (RECOMMENDED)**

=== "MJS"

    ```js
    import { open, close } from 'node:fs';
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

**read (NOT RECOMMENDED)**

=== "MJS"

    ```js
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

**read (RECOMMENDED)**

=== "MJS"

    ```js
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

Примеры выше с пометкой "not recommended" сначала проверяют существование файла, а затем используют его; примеры с пометкой "recommended" лучше, потому что работают с файлом напрямую и при необходимости обрабатывают ошибку.

В общем случае проверяйте существование файла только тогда, когда сам файл не будет использоваться напрямую, например если его наличие служит сигналом от другого процесса.

### `fs.fchmod(fd, mode, callback)`

<!-- YAML
added: v0.4.7
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

Добавлено в: v0.4.7

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Устанавливает права доступа к файлу. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX fchmod(2).

### `fs.fchown(fd, uid, gid, callback)`

<!-- YAML
added: v0.4.7
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

Добавлено в: v0.4.7

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Устанавливает владельца файла. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX fchown(2).

### `fs.fdatasync(fd, callback)`

<!-- YAML
added: v0.1.96
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

Добавлено в: v0.1.96

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Принудительно переводит все текущие поставленные в очередь операции ввода-вывода, связанные с файлом, в состояние синхронизированного завершения ввода-вывода на уровне операционной системы. Подробнее см. документацию POSIX `fdatasync(2)`. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.fstat(fd[, options], callback)`

<!-- YAML
added: v0.1.95
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.95

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.Stats>`](fs.md#fsstats)

Вызывает callback с объектом [fs.Stats](fs.md#fsstats) для файлового дескриптора.

Подробнее см. POSIX fstat(2).

### `fs.fsync(fd, callback)`

<!-- YAML
added: v0.1.96
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

Добавлено в: v0.1.96

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Запрашивает сброс всех данных открытого файлового дескриптора на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. Подробнее см. документацию POSIX `fsync(2)`. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.ftruncate(fd[, len], callback)`

<!-- YAML
added: v0.8.6
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/12562
    description: The `callback` parameter is no longer optional. Not passing
                 it will throw a `TypeError` at runtime.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7897
    description: The `callback` parameter is no longer optional. Not passing
                 it will emit a deprecation warning with id DEP0013.
-->

Добавлено в: v0.8.6

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Усекает файловый дескриптор. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX ftruncate(2).

Если файл, на который указывает файловый дескриптор, был длиннее `len` байт, в файле будут сохранены только первые `len` байт.

Например, следующая программа сохраняет только первые четыре байта файла:

=== "MJS"

    ```js
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

Если до этого файл был короче `len` байт, он будет расширен, а добавленная часть заполнена нулевыми байтами (`'\0'`):

Если `len` отрицательно, будет использовано значение `0`.

### `fs.futimes(fd, atime, mtime, callback)`

<!-- YAML
added: v0.4.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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
    description: Numeric strings, `NaN`, and `Infinity` are now allowed
                 time specifiers.
-->

Добавлено в: v0.4.2

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Change the file system timestamps of the object referenced by the supplied file descriptor. See [`fs.utimes()`](#fsutimespath-atime-mtime-callback).

### `fs.glob(pattern[, options], callback)`

<!-- YAML
added: v22.0.0
changes:
  - version:
      - v24.1.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/58182
    description: Add support for `URL` instances for `cwd` option.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
  - version:
    - v23.7.0
    - v22.14.0
    pr-url: https://github.com/nodejs/node/pull/56489
    description: Add support for `exclude` option to accept glob patterns.
  - version: v22.2.0
    pr-url: https://github.com/nodejs/node/pull/52837
    description: Add support for `withFileTypes` as an option.
-->

Добавлено в: v22.0.0

-   `pattern` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) current working directory. **По умолчанию:** `process.cwd()`
    -   `exclude` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Function to filter out files/directories or a list of glob patterns to be excluded. If a function is provided, return `true` to exclude the item, `false` to include it. **По умолчанию:** `undefined`.
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the glob should return paths as Dirents, `false` otherwise. **По умолчанию:** `false`.

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

-   Retrieves the files matching the specified pattern.

=== "MJS"

    ```js
    import { glob } from 'node:fs';

    glob('**/*.js', (err, matches) => {
      if (err) throw err;
      console.log(matches);
    });
    ```

=== "CJS"

    ```js
    const { glob } = require('node:fs');

    glob('**/*.js', (err, matches) => {
      if (err) throw err;
      console.log(matches);
    });
    ```

### `fs.lchmod(path, mode, callback)`

<!-- YAML
deprecated: v0.4.7
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

> Stability: 0 - Deprecated

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)

Изменяет права доступа символической ссылки. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Этот метод реализован только в macOS.

Подробнее см. POSIX lchmod(2).

### `fs.lchown(path, uid, gid, callback)`

<!-- YAML
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Устанавливает владельца символической ссылки. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX lchown(2).

### `fs.lutimes(path, atime, mtime, callback)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Изменяет время доступа и модификации файла так же, как [`fs.utimes()`](#fsutimespath-atime-mtime-callback), с той разницей, что если путь указывает на символическую ссылку, то разыменование не выполняется: вместо этого изменяются временные метки самой символической ссылки.

В callback завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.link(existingPath, newPath, callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.31

-   `existingPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Создаёт новую жёсткую ссылку с `existingPath` на `newPath`. Подробнее см. POSIX `link(2)`. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.lstat(path[, options], callback)`

<!-- YAML
added: v0.1.30
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.30

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.Stats>`](fs.md#fsstats)

Получает [fs.Stats](fs.md#fsstats) для символической ссылки, на которую указывает путь. Callback получает два аргумента `(err, stats)`, где `stats` — объект [fs.Stats](fs.md#fsstats). `lstat()` идентичен `stat()`, за исключением того, что если `path` является символической ссылкой, статистика берётся для самой ссылки, а не для файла, на который она указывает.

Подробнее см. POSIX lstat(2).

### `fs.mkdir(path[, options], callback)`

<!-- YAML
added: v0.1.8
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.8

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) не поддерживается в Windows. Подробнее см. [Режимы файла](#file-modes). **По умолчанию:** `0o777`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined присутствует только если каталог создан с `recursive`, установленным в `true`

Асинхронно создаёт каталог.

Callback получает возможное исключение и, если `recursive` равно `true`, путь к первому созданному каталогу, `(err[, path])`. `path` всё ещё может быть `undefined`, когда `recursive` равно `true`, если каталог не был создан (например, если он уже существовал).

Необязательный аргумент `options` может быть целым числом, задающим `mode` (права доступа и sticky-биты), либо объектом со свойствами `mode` и `recursive`, указывающим, нужно ли создавать родительские каталоги. Вызов `fs.mkdir()` с `path`, который уже существует как каталог, приводит к ошибке только если `recursive` равно `false`. Если `recursive` равно `false` и каталог существует, возникает ошибка `EEXIST`.

=== "MJS"

    ```js
    import { mkdir } from 'node:fs';

    // Create ./tmp/a/apple, regardless of whether ./tmp and ./tmp/a exist.
    mkdir('./tmp/a/apple', { recursive: true }, (err) => {
      if (err) throw err;
    });
    ```

В Windows использование `fs.mkdir()` для корневого каталога даже с рекурсией приведёт к ошибке:

=== "MJS"

    ```js
    import { mkdir } from 'node:fs';

    mkdir('/', { recursive: true }, (err) => {
      // => [Error: EPERM: operation not permitted, mkdir 'C:\']
    });
    ```

Подробнее см. POSIX mkdir(2).

### `fs.mkdtemp(prefix[, options], callback)`

<!-- YAML
added: v5.10.0
changes:
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/48828
    description: The `prefix` parameter now accepts buffers and URL.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v5.10.0

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `directory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Создаёт уникальный временный каталог.

Генерирует шесть случайных символов, добавляемых в конец обязательного `prefix`, чтобы создать уникальный временный каталог. Из-за различий между платформами избегайте завершающих символов `X` в `prefix`. Некоторые платформы, особенно BSD, могут возвращать более шести случайных символов и заменять завершающие `X` в `prefix` случайными символами.

Путь к созданному каталогу передаётся строкой во второй параметр callback.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим используемую кодировку символов.

=== "MJS"

    ```js
    import { mkdtemp } from 'node:fs';
    import { join } from 'node:path';
    import { tmpdir } from 'node:os';

    mkdtemp(join(tmpdir(), 'foo-'), (err, directory) => {
      if (err) throw err;
      console.log(directory);
      // Prints: /tmp/foo-itXde2 or C:\Users\...\AppData\Local\Temp\foo-itXde2
    });
    ```

Метод `fs.mkdtemp()` добавляет шесть случайно выбранных символов непосредственно к строке `prefix`. Например, если дан каталог `/tmp` и требуется создать временный каталог _внутри_ `/tmp`, `prefix` должен заканчиваться завершающим платформенно-зависимым разделителем пути (`require('node:path').sep`).

=== "MJS"

    ```js
    import { tmpdir } from 'node:os';
    import { mkdtemp } from 'node:fs';

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
    import { sep } from 'node:path';
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
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666` (readable and writable)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Асинхронное открытие файла. Подробнее см. POSIX `open(2)`.

`mode` задаёт режим файла (права доступа и sticky-биты), но только если файл был создан. В Windows можно управлять только правом на запись; см. [`fs.chmod()`](#fschmodpath-mode-callback).

Callback получает два аргумента `(err, fd)`.

Some characters (`< > : " / \ | ? *`) are reserved under Windows as documented by [Naming Files, Paths, and Namespaces](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file). Under NTFS, if the filename contains a colon, Node.js will open a file system stream, as described by [this Microsoft Learn page](https://learn.microsoft.com/en-us/windows/win32/fileio/using-streams).

Такое же поведение наблюдается и у функций, основанных на `fs.open()`: `fs.writeFile()`, `fs.readFile()` и т. д.

### `fs.openAsBlob(path[, options])`

<!-- YAML
added: v19.8.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v19.8.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) необязательный MIME-тип для blob
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) при успехе выполняется объектом [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

Возвращает [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), данные которого опираются на указанный файл.

Файл нельзя изменять после создания [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob). Любые изменения приведут к ошибке чтения данных [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) с `DOMException`. При создании `Blob` и перед каждым чтением выполняются синхронные операции stat над файлом, чтобы определить, были ли данные файла изменены на диске.

=== "MJS"

    ```js
    import { openAsBlob } from 'node:fs';

    const blob = await openAsBlob('the.file.txt');
    const ab = await blob.arrayBuffer();
    blob.stream();
    ```

=== "CJS"

    ```js
    const { openAsBlob } = require('node:fs');

    (async () => {
      const blob = await openAsBlob('the.file.txt');
      const ab = await blob.arrayBuffer();
      blob.stream();
    })();
    ```

### `fs.opendir(path[, options], callback)`

<!-- YAML
added: v12.12.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/41439
    description: Added `recursive` option.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30114
    description: The `bufferSize` option was introduced.
-->

Добавлено в: v12.12.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `bufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) число записей каталога, внутренне буферизуемых при чтении. Более высокие значения улучшают производительность, но увеличивают потребление памяти. **По умолчанию:** `32`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `dir` [`<fs.Dir>`](fs.md#class-fsdir)

Асинхронно открывает каталог. Подробнее см. POSIX opendir(3).

Создаёт [fs.Dir](fs.md#class-fsdir) со всеми методами чтения и очистки каталога.

Опция `encoding` задаёт кодировку для `path` при открытии и дальнейших операциях чтения.

### `fs.read(fd, buffer, offset, length, position, callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) буфер, в который будут записаны данные
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) позиция в `buffer`, в которую будут записаны данные
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество байтов для чтения
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null указывает, с какого места в файле начинать чтение. Если `position` равно `null` или `-1`, данные читаются с текущей позиции в файле, и позиция файла будет обновлена. Если `position` — неотрицательное целое число, позиция файла не изменится.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer)

Читает данные из файла, указанного в `fd`.

Callback получает три аргумента: `(err, bytesRead, buffer)`.

Если файл не изменяется параллельно, конец файла достигается, когда количество прочитанных байтов равно нулю.

If this method is invoked as its [`util.promisify()`](util.md#utilpromisifyoriginal)ed version, it returns a promise for an `Object` with `bytesRead` and `buffer` properties.

Метод `fs.read()` читает данные из файла, указанного файловым дескриптором (`fd`). Аргумент `length` указывает максимальное количество байтов, которое Node.js попытается прочитать из ядра. Однако фактическое количество прочитанных байтов (`bytesRead`) по разным причинам может быть меньше указанного `length`.

Например:

-   если файл короче указанного `length`, в `bytesRead` будет записано фактическое число прочитанных байтов;
-   если файл достигает EOF (конца файла) до заполнения буфера, Node.js прочитает все доступные байты до EOF, а параметр `bytesRead` в callback укажет фактическое количество прочитанных байтов, которое может быть меньше заданного `length`;
-   если файл находится в медленной сетевой файловой системе или при чтении возникает любая другая проблема, `bytesRead` может быть меньше указанного `length`.

Поэтому при использовании `fs.read()` важно проверять значение `bytesRead`, чтобы определить, сколько байтов действительно было прочитано из файла. В зависимости от логики приложения может потребоваться обработка случаев, когда `bytesRead` меньше указанного `length`, например через оборачивание вызова чтения в цикл, если требуется минимум определённого количества байтов.

Это поведение похоже на функцию POSIX `preadv2`.

### `fs.read(fd[, options], callback)`

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
                 to make buffer, offset, length, and position optional.
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) **По умолчанию:** `Buffer.alloc(16384)`
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer)

Similar to the [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback) function, this version takes an optional `options` object. If no `options` object is specified, it will default with the above values.

### `fs.read(fd, buffer[, options], callback)`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The buffer that the data will be written to.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer)

Similar to the [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback) function, this version takes an optional `options` object. If no `options` object is specified, it will default with the above values.

### `fs.readdir(path[, options], callback)`

<!-- YAML
added: v0.1.8
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/41439
    description: Added `recursive` option.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.8

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, читает содержимое каталога рекурсивно. В рекурсивном режиме будут перечислены все файлы, вложенные файлы и каталоги. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `files` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer[]>`](buffer.md#buffer) | [`<fs.Dirent[]>`](fs.md#fsdirent)

Читает содержимое каталога. Callback получает два аргумента `(err, files)`, где `files` — это массив имён файлов каталога, исключая `'.'` и `'..'`.

Подробнее см. POSIX readdir(3).

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим кодировку имён файлов, передаваемых в callback. Если `encoding` установлено в `'buffer'`, возвращаемые имена файлов будут объектами [Buffer](buffer.md#buffer).

Если `options.withFileTypes` установлено в `true`, массив `files` будет содержать объекты [fs.Dirent](fs.md#fsdirent).

### `fs.readFile(path[, options], callback)`

<!-- YAML
added: v0.1.29
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.29

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) см. [поддержку файловых `flags`](#file-system-flags). **По умолчанию:** `'r'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать выполняющийся `readFile`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
    -   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Асинхронно читает всё содержимое файла.

=== "MJS"

    ```js
    import { readFile } from 'node:fs';

    readFile('/etc/passwd', (err, data) => {
      if (err) throw err;
      console.log(data);
    });
    ```

В callback передаются два аргумента `(err, data)`, где `data` — содержимое файла.

Если кодировка не указана, возвращается исходный буфер.

Если `options` — строка, она задаёт кодировку:

=== "MJS"

    ```js
    import { readFile } from 'node:fs';

    readFile('/etc/passwd', 'utf8', callback);
    ```

Если путь указывает на каталог, поведение `fs.readFile()` и [`fs.readFileSync()`](#fsreadfilesyncpath-options) зависит от платформы. В macOS, Linux и Windows будет возвращена ошибка. В FreeBSD будет возвращено представление содержимого каталога.

=== "MJS"

    ```js
    import { readFile } from 'node:fs';

    // macOS, Linux, and Windows
    readFile('<directory>', (err, data) => {
      // => [Error: EISDIR: illegal operation on a directory, read <directory>]
    });

    //  FreeBSD
    readFile('<directory>', (err, data) => {
      // => null, <data>
    });
    ```

Текущий запрос можно прервать с помощью `AbortSignal`. Если запрос прерван, callback вызывается с `AbortError`:

=== "MJS"

    ```js
    import { readFile } from 'node:fs';

    const controller = new AbortController();
    const signal = controller.signal;
    readFile(fileInfo[0].name, { signal }, (err, buf) => {
      // ...
    });
    // When you want to abort the request
    controller.abort();
    ```

Функция `fs.readFile()` буферизует весь файл целиком. Чтобы уменьшить расходы памяти, по возможности предпочтительнее использовать потоковое чтение через `fs.createReadStream()`.

Прерывание выполняющегося запроса не отменяет отдельные запросы операционной системы, а лишь внутреннюю буферизацию, которую выполняет `fs.readFile`.

#### Файловые дескрипторы

1. Any specified file descriptor has to support reading.
2. If a file descriptor is specified as the `path`, it will not be closed automatically.
3. The reading will begin at the current position. For example, if the file already had `'Hello World'` and six bytes are read with the file descriptor, the call to `fs.readFile()` with the same file descriptor, would give `'World'`, rather than `'Hello World'`.

#### Соображения производительности

Метод `fs.readFile()` асинхронно читает содержимое файла в память по одному фрагменту за раз, позволяя циклу событий выполняться между чтениями отдельных фрагментов. Благодаря этому операция чтения меньше влияет на другую активность, которая также может использовать базовый пул потоков libuv, но полное чтение файла в память занимает больше времени.

Дополнительные накладные расходы на чтение могут сильно различаться в разных системах и зависят от типа читаемого файла. Если файл не является обычным файлом (например, это канал) и Node.js не может определить его фактический размер, каждая операция чтения будет загружать по 64 КиБ данных. Для обычных файлов каждая операция чтения обрабатывает по 512 КиБ данных.

Для приложений, которым нужно максимально быстро читать содержимое файлов, лучше использовать `fs.read()` напрямую и самостоятельно управлять чтением всего содержимого файла на уровне кода приложения.

Issue Node.js [#25741](https://github.com/nodejs/node/issues/25741) содержит дополнительную информацию и подробный анализ производительности `fs.readFile()` для файлов разных размеров в разных версиях Node.js.

### `fs.readlink(path[, options], callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.31

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `linkString` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Читает содержимое символической ссылки, на которую указывает `path`. Callback получает два аргумента: `(err, linkString)`.

Подробнее см. POSIX readlink(2).

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим кодировку символов для пути ссылки, передаваемого в callback. Если `encoding` установлено в `'buffer'`, возвращаемый путь ссылки будет передан как объект [Buffer](buffer.md#buffer).

### `fs.readv(fd, buffers[, position], callback)`

<!-- YAML
added:
  - v13.13.0
  - v12.17.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

Читает данные из файла, указанного `fd`, и записывает их в массив `ArrayBufferView` с помощью `readv()`.

`position` — это смещение от начала файла, с которого следует читать данные. Если `typeof position !== 'number'`, данные будут читаться с текущей позиции.

Callback получает три аргумента: `err`, `bytesRead` и `buffers`. `bytesRead` показывает, сколько байтов было прочитано из файла.

Если этот метод вызывается в версии, полученной через [`util.promisify()`](util.md#utilpromisifyoriginal), он возвращает промис для объекта со свойствами `bytesRead` и `buffers`.

### `fs.realpath(path[, options], callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.31

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `resolvedPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Асинхронно вычисляет канонический путь, разрешая `.`, `..` и символические ссылки.

Канонический путь не обязательно уникален. Жёсткие ссылки и bind mount могут предоставлять одну и ту же сущность файловой системы через разные пути.

Эта функция ведёт себя как `realpath(3)`, за некоторыми исключениями:

1.  На файловых системах без учёта регистра преобразование регистра не выполняется.

2.  Максимальное число символических ссылок не зависит от платформы и обычно значительно больше, чем поддерживает нативная реализация `realpath(3)`.

Callback получает два аргумента: `(err, resolvedPath)`. Для разрешения относительных путей может использоваться `process.cwd`.

Поддерживаются только пути, которые можно преобразовать в строки UTF-8.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the path passed to the callback. If the `encoding` is set to `'buffer'`, the path returned will be passed as a [Buffer](buffer.md#buffer) object.

Если `path` разрешается в сокет или канал, функция вернёт системно-зависимое имя этого объекта.

Путь, который не существует, приводит к ошибке `ENOENT`. `error.path` содержит абсолютный путь к файлу.

### `fs.realpath.native(path[, options], callback)`

<!-- YAML
added: v9.2.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v9.2.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `resolvedPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Асинхронная версия `realpath(3)`.

Callback получает два аргумента: `(err, resolvedPath)`.

Поддерживаются только пути, которые можно преобразовать в строки UTF-8.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, определяющим кодировку символов для пути, передаваемого в callback. Если `encoding` равно `'buffer'`, возвращаемый путь будет передан как объект [Buffer](buffer.md#buffer).

В Linux, когда Node.js слинкован с musl libc, для работы этой функции файловая система procfs должна быть смонтирована в `/proc`. У glibc этого ограничения нет.

### `fs.rename(oldPath, newPath, callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `oldPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно переименовывает файл из `oldPath` в путь, указанный как `newPath`. Если `newPath` уже существует, он будет перезаписан. Если по `newPath` находится каталог, вместо этого будет выброшена ошибка. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

См. также: `rename(2)`.

=== "MJS"

    ```js
    import { rename } from 'node:fs';

    rename('oldFile.txt', 'newFile.txt', (err) => {
      if (err) throw err;
      console.log('Rename complete!');
    });
    ```

### `fs.rmdir(path[, options], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/58616
    description: Remove `recursive` option.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) в настоящий момент никаких опций не предоставляется. Раньше существовали опции `recursive`, `maxBusyTries` и `emfileWait`, но они были устаревшими и удалены. Аргумент `options` по-прежнему принимается для обратной совместимости, но не используется.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронная версия `rmdir(2)`. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Использование `fs.rmdir()` для файла (а не каталога) приводит к ошибке `ENOENT` в Windows и `ENOTDIR` в POSIX.

Чтобы получить поведение, аналогичное Unix-команде `rm -rf`, используйте [`fs.rm()`](#fsrmpath-options-callback) с опциями `{ recursive: true, force: true }`.

### `fs.rm(path[, options], callback)`

<!-- YAML
added: v14.14.0
changes:
  - version:
      - v17.3.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41132
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

Добавлено в: v14.14.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, исключения будут игнорироваться, если `path` не существует. **По умолчанию:** `false`.
    -   `maxRetries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) если возникает ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js повторяет операцию, линейно увеличивая ожидание на `retryDelay` миллисекунд при каждой попытке. Эта опция задаёт число повторов. Игнорируется, если `recursive` не равно `true`. **По умолчанию:** `0`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, выполняется рекурсивное удаление. В рекурсивном режиме операции повторяются при сбоях. **По умолчанию:** `false`.
    -   `retryDelay` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество миллисекунд ожидания между повторными попытками. Игнорируется, если `recursive` не равно `true`. **По умолчанию:** `100`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно удаляет файлы и каталоги (по образцу стандартной POSIX-утилиты `rm`). В callback завершения не передаются никакие аргументы, кроме возможного исключения.

### `fs.stat(path[, options], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/61178
    description: Accepts a `throwIfNoEntry` option to specify whether
                 an exception should be thrown if the entry does not exist.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) следует ли выбрасывать исключение, если запись файловой системы не существует, вместо возврата `undefined`. **По умолчанию:** `true`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.Stats>`](fs.md#fsstats)

Асинхронная версия `stat(2)`. Callback получает два аргумента `(err, stats)`, где `stats` — объект [fs.Stats](fs.md#fsstats).

В случае ошибки `err.code` будет одним из [распространённых системных ошибок](errors.md#common-system-errors).

[`fs.stat()`](#fsstatpath-options-callback) follows symbolic links. Use [`fs.lstat()`](#fslstatpath-options-callback) to look at the links themselves.

Использовать `fs.stat()` для проверки существования файла перед вызовом `fs.open()`, `fs.readFile()` или `fs.writeFile()` не рекомендуется. Вместо этого пользовательский код должен напрямую открывать/читать/записывать файл и обрабатывать возникающую ошибку, если файл недоступен.

To check if a file exists without manipulating it afterwards, [`fs.access()`](#fsaccesspath-mode-callback) is recommended.

Например, при следующей структуре каталогов:

```text
- txtDir
-- file.txt
- app.js
```

Следующая программа проверит статистику для указанных путей:

=== "MJS"

    ```js
    import { stat } from 'node:fs';

    const pathsToCheck = ['./txtDir', './txtDir/file.txt'];

    for (let i = 0; i < pathsToCheck.length; i++) {
      stat(pathsToCheck[i], (err, stats) => {
        console.log(stats.isDirectory());
        console.log(stats);
      });
    }
    ```

Результирующий вывод будет примерно таким:

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

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.StatFs](fs.md#fsstatfs) иметь тип `bigint`. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.StatFs>`](fs.md#fsstatfs)

Асинхронная версия `statfs(2)`. Возвращает информацию о смонтированной файловой системе, содержащей `path`. Callback получает два аргумента `(err, stats)`, где `stats` — объект [fs.StatFs](fs.md#fsstatfs).

В случае ошибки `err.code` будет одним из [распространённых системных ошибок](errors.md#common-system-errors).

### `fs.symlink(target, path[, type], callback)`

<!-- YAML
added: v0.1.31
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.1.31

-   `target` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Создаёт ссылку с именем `path`, указывающую на `target`. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

Подробнее см. POSIX symlink(2).

Аргумент `type` доступен только в Windows и игнорируется на других платформах. Он может принимать значения `'dir'`, `'file'` или `'junction'`. Если `type` равно `null`, Node.js автоматически определит тип `target` и использует `'file'` или `'dir'`. Если `target` не существует, будет использовано `'file'`. Точки соединения Windows требуют, чтобы путь назначения был абсолютным. При использовании `'junction'` аргумент `target` автоматически нормализуется к абсолютному пути. Точки соединения на томах NTFS могут указывать только на каталоги.

Относительные цели рассчитываются относительно родительского каталога ссылки.

=== "MJS"

    ```js
    import { symlink } from 'node:fs';

    symlink('./mew', './mewtwo', callback);
    ```

Пример выше создаёт символическую ссылку `mewtwo`, указывающую на `mew` в том же каталоге:

```bash
$ tree .
.
├── mew
└── mewtwo -> ./mew
```

### `fs.truncate(path[, len], callback)`

<!-- YAML
added: v0.8.6
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.8.6

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)

Усекает файл. В callback завершения не передаются никакие аргументы, кроме возможного исключения. В качестве первого аргумента также можно передать файловый дескриптор. В этом случае будет вызван `fs.ftruncate()`.

=== "MJS"

    ```js
    import { truncate } from 'node:fs';
    // Assuming that 'path/file.txt' is a regular file.
    truncate('path/file.txt', (err) => {
      if (err) throw err;
      console.log('path/file.txt was truncated');
    });
    ```

=== "CJS"

    ```js
    const { truncate } = require('node:fs');
    // Assuming that 'path/file.txt' is a regular file.
    truncate('path/file.txt', (err) => {
      if (err) throw err;
      console.log('path/file.txt was truncated');
    });
    ```

Передача файлового дескриптора устарела и в будущем может приводить к выбрасыванию ошибки.

Подробнее см. POSIX truncate(2).

### `fs.unlink(path, callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно удаляет файл или символическую ссылку. В callback завершения не передаются никакие аргументы, кроме возможного исключения.

=== "MJS"

    ```js
    import { unlink } from 'node:fs';
    // Assuming that 'path/file.txt' is a regular file.
    unlink('path/file.txt', (err) => {
      if (err) throw err;
      console.log('path/file.txt was deleted');
    });
    ```

`fs.unlink()` will not work on a directory, empty or otherwise. To remove a directory, use [`fs.rmdir()`](#fsrmdirpath-options-callback).

Подробнее см. POSIX unlink(2).

### `fs.unwatchFile(filename[, listener])`

<!-- YAML
added: v0.1.31
-->

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) необязательный listener, ранее подключённый через `fs.watchFile()`

Прекращает отслеживание изменений для `filename`. Если указан `listener`, удаляется только этот конкретный listener. Иначе удаляются _все_ listeners, что фактически останавливает наблюдение за `filename`.

Вызов `fs.unwatchFile()` с именем файла, который не отслеживается, ничего не делает и не считается ошибкой.

Using [`fs.watch()`](#fswatchfilename-options-listener) is more efficient than `fs.watchFile()` and `fs.unwatchFile()`. `fs.watch()` should be used instead of `fs.watchFile()` and `fs.unwatchFile()` when possible.

### `fs.utimes(path, atime, mtime, callback)`

<!-- YAML
added: v0.4.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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
    description: Numeric strings, `NaN`, and `Infinity` are now allowed
                 time specifiers.
-->

Добавлено в: v0.4.2

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Изменяет временные метки файловой системы объекта, на который указывает `path`.

Аргументы `atime` и `mtime` подчиняются следующим правилам:

-   значения могут быть числами, представляющими Unix-время в секундах, объектами `Date` или числовой строкой вроде `'123456789.0'`;
-   если значение нельзя преобразовать в число либо оно равно `NaN`, `Infinity` или `-Infinity`, будет выброшена ошибка `Error`.

### `fs.watch(filename[, options][, listener])`

<!-- YAML
added: v0.5.10
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/61870
    description: Added `throwIfNoEntry` option.
  - version: v19.1.0
    pr-url: https://github.com/nodejs/node/pull/45098
    description: Added recursive support for Linux, AIX and IBMi.
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

Добавлено в: v0.5.10

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `persistent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, должен ли процесс продолжать работу, пока файлы отслеживаются. **По умолчанию:** `true`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, нужно ли отслеживать все подкаталоги или только текущий каталог. Применяется, когда указан каталог, и только на поддерживаемых платформах (см. [Предостережения](#caveats)). **По умолчанию:** `false`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) задаёт кодировку символов для имени файла, передаваемого в listener. **По умолчанию:** `'utf8'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет закрыть наблюдатель с помощью `AbortSignal`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, следует ли выбрасывать исключение, если путь не существует. **По умолчанию:** `true`.
    -   `ignore` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) шаблон(ы) для игнорирования. Строки трактуются как glob-шаблоны (с использованием [`minimatch`](https://github.com/isaacs/minimatch)), шаблоны `RegExp` проверяются по имени файла, а функции получают имя файла и возвращают `true`, если его нужно игнорировать. **По умолчанию:** `undefined`.
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | undefined **По умолчанию:** `undefined`
    -   `eventType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | null
-   Возвращает: [`<fs.FSWatcher>`](fs.md#fsfswatcher)

Отслеживает изменения для `filename`, где `filename` может быть либо файлом, либо каталогом.

Второй аргумент необязателен. Если `options` передан как строка, он задаёт `encoding`. В противном случае `options` следует передавать как объект.

Callback listener получает два аргумента `(eventType, filename)`. `eventType` принимает значение `'rename'` или `'change'`, а `filename` — это имя файла, вызвавшего событие.

На большинстве платформ событие `'rename'` генерируется всякий раз, когда имя файла появляется или исчезает в каталоге.

The listener callback is attached to the `'change'` event fired by [fs.FSWatcher](fs.md#fsfswatcher), but it is not the same thing as the `'change'` value of `eventType`.

If a `signal` is passed, aborting the corresponding AbortController will close the returned [fs.FSWatcher](fs.md#fsfswatcher).

#### Предостережения

<!--type=misc-->

API `fs.watch` не является полностью одинаковым на всех платформах и в некоторых ситуациях недоступно.

В Windows никакие события не будут сгенерированы, если отслеживаемый каталог был перемещён или переименован. При удалении отслеживаемого каталога сообщается об ошибке `EPERM`.

API `fs.watch` не обеспечивает никакой защиты от злонамеренных действий в файловой системе. Например, в Windows оно реализовано как мониторинг изменений в каталоге, а не в конкретных файлах. Из-за этого файл можно подменить, и `fs` будет сообщать об изменениях уже в новом файле с тем же именем.

##### Доступность

<!--type=misc-->

Эта возможность зависит от того, предоставляет ли базовая операционная система механизм уведомления об изменениях файловой системы.

-   В Linux используется [`inotify(7)`](https://man7.org/linux/man-pages/man7/inotify.7.html).
-   В BSD используется [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2).
-   В macOS для файлов используется [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2), а для каталогов — [`FSEvents`](https://developer.apple.com/documentation/coreservices/file_system_events).
-   В SunOS (включая Solaris и SmartOS) используются [`event ports`](https://illumos.org/man/port_create).
-   В Windows эта возможность зависит от [`ReadDirectoryChangesW`](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-readdirectorychangesw).
-   В AIX эта возможность зависит от [`AHAFS`](https://developer.ibm.com/articles/au-aix_event_infrastructure/), который должен быть включён.
-   В IBM i эта возможность не поддерживается.

Если по какой-либо причине базовая функциональность недоступна, `fs.watch()` не сможет работать и может выбросить исключение. Например, наблюдение за файлами или каталогами может быть ненадёжным, а в некоторых случаях невозможным, в сетевых файловых системах (NFS, SMB и т. п.) или в файловых системах хоста при использовании ПО виртуализации вроде Vagrant или Docker.

По-прежнему можно использовать `fs.watchFile()`, который применяет опрос через stat, но этот метод медленнее и менее надёжен.

##### Inode

<!--type=misc-->

В Linux и macOS `fs.watch()` разрешает путь до [inode](https://en.wikipedia.org/wiki/Inode) и отслеживает именно inode. Если отслеживаемый путь удалить и создать заново, ему будет назначен новый inode. Наблюдатель сгенерирует событие удаления, но продолжит следить за _исходным_ inode. События для нового inode сгенерированы не будут. Это ожидаемое поведение.

В AIX файлы сохраняют один и тот же inode на всём протяжении своего существования. Сохранение и закрытие отслеживаемого файла в AIX приведёт к двум уведомлениям: одному о добавлении нового содержимого и одному об усечении.

##### Аргумент `filename`

<!--type=misc-->

Передача аргумента `filename` в callback поддерживается только в Linux, macOS, Windows и AIX. Даже на поддерживаемых платформах наличие `filename` не гарантируется. Поэтому не следует предполагать, что аргумент `filename` всегда будет передан в callback; предусмотрите запасную логику на случай, если он равен `null`.

=== "MJS"

    ```js
    import { watch } from 'node:fs';
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

Добавлено в: v0.1.31

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `persistent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `interval` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `5007`
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `current` [`<fs.Stats>`](fs.md#fsstats)
    -   `previous` [`<fs.Stats>`](fs.md#fsstats)
-   Возвращает: [`<fs.StatWatcher>`](fs.md#fsstatwatcher)

Отслеживает изменения для `filename`. Callback `listener` будет вызываться каждый раз, когда к файлу происходит доступ.

Аргумент `options` можно опустить. Если он указан, это должен быть объект. Объект `options` может содержать булево свойство `persistent`, указывающее, должен ли процесс продолжать работу, пока файлы отслеживаются. Объект `options` также может задавать свойство `interval`, определяющее частоту опроса цели в миллисекундах.

`listener` получает два аргумента: текущий объект stat и предыдущий объект stat:

=== "MJS"

    ```js
    import { watchFile } from 'node:fs';

    watchFile('message.text', (curr, prev) => {
      console.log(`the current mtime is: ${curr.mtime}`);
      console.log(`the previous mtime was: ${prev.mtime}`);
    });
    ```

Эти объекты stat являются экземплярами `fs.Stat`. Если опция `bigint` равна `true`, числовые значения в этих объектах представлены как `BigInt`.

Чтобы получать уведомление именно об изменении файла, а не только о доступе к нему, необходимо сравнивать `curr.mtimeMs` и `prev.mtimeMs`.

Когда операция `fs.watchFile` приводит к ошибке `ENOENT`, listener будет вызван один раз, при этом все поля будут обнулены (а для дат будет использована Unix Epoch). Если файл позже будет создан, listener будет вызван снова, уже с актуальными объектами stat. Это изменение поведения, действующее с v0.10.

Using [`fs.watch()`](#fswatchfilename-options-listener) is more efficient than `fs.watchFile` and `fs.unwatchFile`. `fs.watch` should be used instead of `fs.watchFile` and `fs.unwatchFile` when possible.

Когда файл, отслеживаемый через `fs.watchFile()`, исчезает и затем появляется снова, содержимое `previous` во втором событии callback (повторное появление файла) будет таким же, как содержимое `previous` в первом событии callback (его исчезновение).

Это происходит, когда:

-   файл удаляется, а затем восстанавливается;
-   файл переименовывается, а затем переименовывается ещё раз обратно в исходное имя.

### `fs.write(fd, buffer, offset[, length[, position]], callback)`

<!-- YAML
added: v0.0.2
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
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

Добавлено в: v0.0.2

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)

Записывает `buffer` в файл, указанный файловым дескриптором `fd`.

`offset` определяет часть буфера, которая будет записана, а `length` — это целое число, задающее количество байтов для записи.

`position` указывает смещение от начала файла, куда следует записать эти данные. Если `typeof position !== 'number'`, данные будут записаны по текущей позиции. См. `pwrite(2)`.

Callback получает три аргумента `(err, bytesWritten, buffer)`, где `bytesWritten` указывает, сколько _байтов_ было записано из `buffer`.

Если этот метод вызывается в версии, полученной через [`util.promisify()`](util.md#utilpromisifyoriginal), он возвращает промис для объекта со свойствами `bytesWritten` и `buffer`.

Небезопасно использовать `fs.write()` несколько раз для одного и того же файла, не дожидаясь callback. Для такого сценария рекомендуется [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

### `fs.write(fd, buffer[, options], callback)`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)

Записывает `buffer` в файл, указанный файловым дескриптором `fd`.

Подобно приведённой выше функции `fs.write`, эта версия принимает необязательный объект `options`. Если `options` не указан, будут использованы значения по умолчанию, перечисленные выше.

### `fs.write(fd, string[, position[, encoding]], callback)`

<!-- YAML
added: v0.11.5
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42796
    description: Passing to the `string` parameter an object with an own
                 `toString` function is no longer supported.
  - version: v17.8.0
    pr-url: https://github.com/nodejs/node/pull/42149
    description: Passing to the `string` parameter an object with an own
                 `toString` function is deprecated.
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

Добавлено в: v0.11.5

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `written` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Записывает `string` в файл, указанный файловым дескриптором `fd`. Если `string` не является строкой, будет выброшено исключение.

`position` указывает смещение от начала файла, куда следует записать эти данные. Если `typeof position !== 'number'`, данные будут записаны по текущей позиции. См. `pwrite(2)`.

`encoding` — ожидаемая кодировка строки.

Callback получает аргументы `(err, written, string)`, где `written` указывает, сколько _байтов_ потребовалось для записи переданной строки. Количество записанных байтов не обязательно совпадает с количеством записанных символов строки. См. [`Buffer.byteLength`](buffer.md#static-method-bufferbytelengthstring-encoding).

Небезопасно вызывать `fs.write()` несколько раз для одного и того же файла, не дожидаясь обратного вызова. Для такого сценария рекомендуется [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

В Windows, если файловый дескриптор подключён к консоли (например, `fd == 1` или `stdout`), строка, содержащая не-ASCII-символы, по умолчанию не будет корректно отображаться независимо от используемой кодировки. Консоль можно настроить на корректное отображение UTF-8, изменив активную кодовую страницу командой `chcp 65001`. Подробнее см. в документации [chcp](https://ss64.com/nt/chcp.html).

### `fs.writeFile(file, data[, options], callback)`

<!-- YAML
added: v0.1.29
changes:
  - version:
    - v21.0.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50009
    description: The `flush` option is now supported.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42796
    description: Passing to the `string` parameter an object with an own
                 `toString` function is no longer supported.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v17.8.0
    pr-url: https://github.com/nodejs/node/pull/42149
    description: Passing to the `string` parameter an object with an own
                 `toString` function is deprecated.
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

Добавлено в: v0.1.29

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'w'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If all data is successfully written to the file, and `flush` is `true`, `fs.fsync()` is used to flush the data. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) allows aborting an in-progress writeFile
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)

Когда `file` — это имя файла, метод асинхронно записывает данные в файл, заменяя его, если он уже существует. `data` может быть строкой или буфером.

Когда `file` — это файловый дескриптор, поведение аналогично прямому вызову `fs.write()` (что и рекомендуется). См. примечания ниже об использовании файлового дескриптора.

Опция `encoding` игнорируется, если `data` является буфером.

Опция `mode` влияет только на вновь создаваемый файл. Подробнее см. [`fs.open()`](#fsopenpath-flags-mode-callback).

=== "MJS"

    ```js
    import { writeFile } from 'node:fs';
    import { Buffer } from 'node:buffer';

    const data = new Uint8Array(Buffer.from('Hello Node.js'));
    writeFile('message.txt', data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
    ```

Если `options` — строка, она задаёт кодировку:

=== "MJS"

    ```js
    import { writeFile } from 'node:fs';

    writeFile('message.txt', 'Hello Node.js', 'utf8', callback);
    ```

Небезопасно использовать `fs.writeFile()` несколько раз для одного и того же файла, не дожидаясь callback. Для такого сценария рекомендуется [`fs.createWriteStream()`](#fscreatewritestreampath-options).

Как и `fs.readFile`, `fs.writeFile` — это удобный метод, который внутри выполняет несколько вызовов `write`, чтобы записать переданный буфер. Для кода, чувствительного к производительности, стоит рассмотреть [`fs.createWriteStream()`](#fscreatewritestreampath-options).

Можно использовать [AbortSignal](globals.md#abortsignal), чтобы отменить `fs.writeFile()`. Отмена выполняется по принципу "best effort", и некоторое количество данных, вероятно, всё равно будет записано.

=== "MJS"

    ```js
    import { writeFile } from 'node:fs';
    import { Buffer } from 'node:buffer';

    const controller = new AbortController();
    const { signal } = controller;
    const data = new Uint8Array(Buffer.from('Hello Node.js'));
    writeFile('message.txt', data, { signal }, (err) => {
      // When a request is aborted - the callback is called with an AbortError
    });
    // When the request should be aborted
    controller.abort();
    ```

Прерывание выполняющегося запроса не отменяет отдельные запросы операционной системы, а лишь внутреннюю буферизацию, которую выполняет `fs.writeFile`.

#### Использование `fs.writeFile()` с файловыми дескрипторами

Когда `file` является файловым дескриптором, поведение почти идентично прямому вызову `fs.write()`, например:

=== "MJS"

    ```js
    import { write } from 'node:fs';
    import { Buffer } from 'node:buffer';

    write(fd, Buffer.from(data, options.encoding), callback);
    ```

Отличие от прямого вызова `fs.write()` состоит в том, что при некоторых необычных условиях `fs.write()` может записать только часть буфера, и для записи оставшихся данных потребуется повторный вызов, тогда как `fs.writeFile()` повторяет запись, пока данные не будут записаны полностью (или пока не произойдёт ошибка).

Следствия этого часто вызывают путаницу. В случае файлового дескриптора файл не заменяется! Данные не обязательно записываются в начало файла, и исходные данные файла могут остаться до и/или после вновь записанных данных.

Например, если `fs.writeFile()` вызвать два раза подряд, сначала записав строку `'Hello'`, а затем строку `', World'`, файл будет содержать `'Hello, World'` и, возможно, часть исходных данных файла (в зависимости от размера исходного файла и позиции файлового дескриптора). Если бы вместо дескриптора использовалось имя файла, гарантировалось бы, что файл содержит только `', World'`.

### `fs.writev(fd, buffers[, position], callback)`

<!-- YAML
added: v12.9.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v12.9.0

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

Записывает массив `ArrayBufferView` в файл, указанный файловым дескриптором `fd`, с помощью `writev()`.

`position` — это смещение от начала файла, куда следует записать эти данные. Если `typeof position !== 'number'`, данные будут записаны по текущей позиции.

Callback получит три аргумента: `err`, `bytesWritten` и `buffers`. `bytesWritten` показывает, сколько байт было записано из `buffers`.

Если этот метод обёрнут через [`util.promisify()`](util.md#utilpromisifyoriginal), он возвращает промис для объекта со свойствами `bytesWritten` и `buffers`.

Небезопасно использовать `fs.writev()` несколько раз для одного и того же файла, не дожидаясь callback. Для такого сценария используйте [`fs.createWriteStream()`](#fscreatewritestreampath-options).

В Linux позиционная запись не работает, если файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

## Synchronous API

Синхронные API выполняют все операции синхронно, блокируя цикл событий до тех пор, пока операция не завершится успешно или с ошибкой.

### `fs.accessSync(path[, mode])`

<!-- YAML
added: v0.11.15
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

Добавлено в: v0.11.15

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `fs.constants.F_OK`

Синхронно проверяет права пользователя для файла или каталога, указанных в `path`. Аргумент `mode` — необязательное целое число, задающее выполняемые проверки доступности. `mode` должен быть либо значением `fs.constants.F_OK`, либо маской, составленной через побитовое OR из `fs.constants.R_OK`, `fs.constants.W_OK` и `fs.constants.X_OK` (например, `fs.constants.W_OK | fs.constants.R_OK`). Возможные значения `mode` см. в разделе [Константы доступа к файлам](#file-access-constants).

Если любая из проверок доступности не проходит, будет выброшен `Error`. Иначе метод вернёт `undefined`.

=== "MJS"

    ```js
    import { accessSync, constants } from 'node:fs';

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
  - version:
    - v21.1.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50095
    description: The `flush` option is now supported.
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/7831
    description: The passed `options` object will never be modified.
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3163
    description: The `file` parameter can be a file descriptor now.
-->

Добавлено в: v0.6.7

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'a'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, the underlying file descriptor is flushed prior to closing it. **По умолчанию:** `false`.

Synchronously append data to a file, creating the file if it does not yet exist. `data` can be a string or a [Buffer](buffer.md#buffer).

The `mode` option only affects the newly created file. See [`fs.open()`](#fsopenpath-flags-mode-callback) for more details.

=== "MJS"

    ```js
    import { appendFileSync } from 'node:fs';

    try {
      appendFileSync('message.txt', 'data to append');
      console.log('The "data to append" was appended to file!');
    } catch (err) {
      /* Handle the error */
    }
    ```

Если `options` — строка, она задаёт кодировку:

=== "MJS"

    ```js
    import { appendFileSync } from 'node:fs';

    appendFileSync('message.txt', 'data to append', 'utf8');
    ```

`path` может быть задан как числовой файловый дескриптор, открытый для добавления (через `fs.open()` или `fs.openSync()`). Файловый дескриптор не будет закрыт автоматически.

=== "MJS"

    ```js
    import { openSync, closeSync, appendFileSync } from 'node:fs';

    let fd;

    try {
      fd = openSync('message.txt', 'a');
      appendFileSync(fd, 'data to append', 'utf8');
    } catch (err) {
      /* Handle the error */
    } finally {
      if (fd !== undefined)
        closeSync(fd);
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

Добавлено в: v0.6.7

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Подробности см. в документации асинхронной версии этого API: [`fs.chmod()`](#fschmodpath-mode-callback).

Подробнее см. POSIX chmod(2).

### `fs.chownSync(path, uid, gid)`

<!-- YAML
added: v0.1.97
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

Добавлено в: v0.1.97

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Синхронно изменяет владельца и группу файла. Возвращает `undefined`. Это синхронная версия [`fs.chown()`](#fschownpath-uid-gid-callback).

Подробнее см. POSIX chown(2).

### `fs.closeSync(fd)`

<!-- YAML
added: v0.1.21
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Закрывает файловый дескриптор. Возвращает `undefined`.

Вызов `fs.closeSync()` для любого файлового дескриптора (`fd`), который в данный момент используется другой операцией `fs`, может привести к неопределённому поведению.

Подробнее см. POSIX close(2).

### `fs.copyFileSync(src, dest[, mode])`

<!-- YAML
added: v8.5.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Changed `flags` argument to `mode` and imposed
                 stricter type validation.
-->

Добавлено в: v8.5.0

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) source filename to copy
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) destination filename of the copy operation
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) modifiers for copy operation. **По умолчанию:** `0`.

Синхронно копирует `src` в `dest`. По умолчанию `dest` будет перезаписан, если уже существует. Возвращает `undefined`. Node.js не даёт гарантий атомарности операции копирования. Если ошибка произойдёт после открытия файла назначения для записи, Node.js попытается удалить файл назначения.

`mode` is an optional integer that specifies the behavior of the copy operation. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

-   `fs.constants.COPYFILE_EXCL`: The copy operation will fail if `dest` already exists.
-   `fs.constants.COPYFILE_FICLONE`: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then a fallback copy mechanism is used.
-   `fs.constants.COPYFILE_FICLONE_FORCE`: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then the operation will fail.

=== "MJS"

    ```js
    import { copyFileSync, constants } from 'node:fs';

    // destination.txt will be created or overwritten by default.
    copyFileSync('source.txt', 'destination.txt');
    console.log('source.txt was copied to destination.txt');

    // By using COPYFILE_EXCL, the operation will fail if destination.txt exists.
    copyFileSync('source.txt', 'destination.txt', constants.COPYFILE_EXCL);
    ```

### `fs.cpSync(src, dest[, options])`

<!-- YAML
added: v16.7.0
changes:
  - version: v22.3.0
    pr-url: https://github.com/nodejs/node/pull/53127
    description: This API is no longer experimental.
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47084
    description: Accept an additional `mode` option to specify
                 the copy behavior as the `mode` argument of `fs.copyFile()`.
  - version:
    - v17.6.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41819
    description: Accepts an additional `verbatimSymlinks` option to specify
                 whether to perform path resolution for symlinks.
-->

Добавлено в: v16.7.0

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) source path to copy.
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) destination path to copy to.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `dereference` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) dereference symlinks. **По умолчанию:** `false`.
    -   `errorOnExist` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) when `force` is `false`, and the destination exists, throw an error. **По умолчанию:** `false`.
    -   `filter` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Function to filter copied files/directories. Return `true` to copy the item, `false` to ignore it. When ignoring a directory, all of its contents will be skipped as well. **По умолчанию:** `undefined`
        -   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) source path to copy.
        -   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) destination path to copy to.
        -   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Any non-`Promise` value that is coercible to `boolean`.
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) overwrite existing file or directory. The copy operation will ignore errors if you set this to false and the destination exists. Use the `errorOnExist` option to change this behavior. **По умолчанию:** `true`.
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) modifiers for copy operation. **По умолчанию:** `0`. See `mode` flag of [`fs.copyFileSync()`](#fscopyfilesyncsrc-dest-mode).
    -   `preserveTimestamps` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true` timestamps from `src` will be preserved. **По умолчанию:** `false`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) copy directories recursively **По умолчанию:** `false`
    -   `verbatimSymlinks` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, path resolution for symlinks will be skipped. **По умолчанию:** `false`

Синхронно копирует всю структуру каталогов из `src` в `dest`, включая подкаталоги и файлы.

При копировании каталога в другой каталог glob-шаблоны не поддерживаются, а поведение аналогично `cp dir1/ dir2/`.

### `fs.existsSync(path)`

<!-- YAML
added: v0.1.21
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
-->

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если путь существует, и `false` в противном случае.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.exists()`](#fsexistspath-callback).

`fs.exists()` is deprecated, but `fs.existsSync()` is not. The `callback` parameter to `fs.exists()` accepts parameters that are inconsistent with other Node.js callbacks. `fs.existsSync()` does not use a callback.

=== "MJS"

    ```js
    import { existsSync } from 'node:fs';

    if (existsSync('/etc/passwd'))
      console.log('The path exists.');
    ```

### `fs.fchmodSync(fd, mode)`

<!-- YAML
added: v0.4.7
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Устанавливает права доступа к файлу. Возвращает `undefined`.

Подробнее см. POSIX fchmod(2).

### `fs.fchownSync(fd, uid, gid)`

<!-- YAML
added: v0.4.7
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new owner's user id.
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new group's group id.

Устанавливает владельца файла. Возвращает `undefined`.

Подробнее см. POSIX fchown(2).

### `fs.fdatasyncSync(fd)`

<!-- YAML
added: v0.1.96
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Принудительно переводит все текущие поставленные в очередь операции ввода-вывода, связанные с файлом, в состояние синхронизированного завершения ввода-вывода на уровне операционной системы. Подробнее см. документацию POSIX `fdatasync(2)`. Возвращает `undefined`.

### `fs.fstatSync(fd[, options])`

<!-- YAML
added: v0.1.95
changes:
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether
                 the numeric values returned should be bigint.
-->

Добавлено в: v0.1.95

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<fs.Stats>`](fs.md#fsstats)

Получает [fs.Stats](fs.md#fsstats) для файлового дескриптора.

Подробнее см. POSIX fstat(2).

### `fs.fsyncSync(fd)`

<!-- YAML
added: v0.1.96
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Запрашивает сброс всех данных открытого файлового дескриптора на устройство хранения. Конкретная реализация зависит от операционной системы и устройства. Подробнее см. документацию POSIX `fsync(2)`. Возвращает `undefined`.

### `fs.ftruncateSync(fd[, len])`

<!-- YAML
added: v0.8.6
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`

Усекает файловый дескриптор. Возвращает `undefined`.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.ftruncate()`](#fsftruncatefd-len-callback).

### `fs.futimesSync(fd, atime, mtime)`

<!-- YAML
added: v0.4.2
changes:
  - version: v4.1.0
    pr-url: https://github.com/nodejs/node/pull/2387
    description: Numeric strings, `NaN`, and `Infinity` are now allowed
                 time specifiers.
-->

Добавлено в: v0.4.2

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Synchronous version of [`fs.futimes()`](#fsfutimesfd-atime-mtime-callback). Returns `undefined`.

### `fs.globSync(pattern[, options])`

<!-- YAML
added: v22.0.0
changes:
  - version:
      - v24.1.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/58182
    description: Add support for `URL` instances for `cwd` option.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
  - version:
    - v23.7.0
    - v22.14.0
    pr-url: https://github.com/nodejs/node/pull/56489
    description: Add support for `exclude` option to accept glob patterns.
  - version: v22.2.0
    pr-url: https://github.com/nodejs/node/pull/52837
    description: Add support for `withFileTypes` as an option.
-->

Добавлено в: v22.0.0

-   `pattern` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) current working directory. **По умолчанию:** `process.cwd()`
    -   `exclude` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Function to filter out files/directories or a list of glob patterns to be excluded. If a function is provided, return `true` to exclude the item, `false` to include it. **По умолчанию:** `undefined`.
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the glob should return paths as Dirents, `false` otherwise. **По умолчанию:** `false`.
-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) paths of files that match the pattern.

=== "MJS"

    ```js
    import { globSync } from 'node:fs';

    console.log(globSync('**/*.js'));
    ```

=== "CJS"

    ```js
    const { globSync } = require('node:fs');

    console.log(globSync('**/*.js'));
    ```

### `fs.lchmodSync(path, mode)`

<!-- YAML
deprecated: v0.4.7
-->

!!!danger "Стабильность: 0 - устарело или набрало много негативных отзывов"

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Изменяет права доступа символической ссылки. Возвращает `undefined`.

Этот метод реализован только в macOS.

Подробнее см. POSIX lchmod(2).

### `fs.lchownSync(path, uid, gid)`

<!-- YAML
changes:
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/21498
    description: This API is no longer deprecated.
  - version: v0.4.7
    description: Documentation-only deprecation.
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new owner's user id.
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new group's group id.

Устанавливает владельца для пути. Возвращает `undefined`.

Подробнее см. POSIX lchown(2).

### `fs.lutimesSync(path, atime, mtime)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Change the file system timestamps of the symbolic link referenced by `path`. Returns `undefined`, or throws an exception when parameters are incorrect or the operation fails. This is the synchronous version of [`fs.lutimes()`](#fslutimespath-atime-mtime-callback).

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

Добавлено в: v0.1.31

-   `existingPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)

Создаёт новую жёсткую ссылку с `existingPath` на `newPath`. Подробнее см. POSIX link(2). Returns `undefined`.

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

Добавлено в: v0.1.30

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) следует ли выбрасывать исключение, если запись файловой системы не существует, вместо возврата `undefined`. **По умолчанию:** `true`.
-   Возвращает: [`<fs.Stats>`](fs.md#fsstats)

Получает [fs.Stats](fs.md#fsstats) для символической ссылки, на которую указывает `path`.

Подробнее см. POSIX lstat(2).

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

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) не поддерживается в Windows. **По умолчанию:** `0o777`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Синхронно создаёт каталог. Возвращает `undefined`, либо, если `recursive` равно `true`, путь к первому созданному каталогу. Это синхронная версия [`fs.mkdir()`](#fsmkdirpath-options-callback).

Подробнее см. POSIX mkdir(2).

### `fs.mkdtempSync(prefix[, options])`

<!-- YAML
added: v5.10.0
changes:
  - version:
    - v20.6.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/48828
    description: The `prefix` parameter now accepts buffers and URL.
  - version:
      - v16.5.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/39028
    description: The `prefix` parameter now accepts an empty string.
-->

Добавлено в: v5.10.0

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает путь к созданному каталогу.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.mkdtemp()`](#fsmkdtempprefix-options-callback).

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим используемую кодировку символов.

### `fs.mkdtempDisposableSync(prefix[, options])`

<!-- YAML
added: v24.4.0
-->

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) A disposable object:
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The path of the created directory.
    -   `remove` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A function which removes the created directory.
    -   `[Symbol.dispose]` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) The same as `remove`.

Возвращает disposable-объект, чьё свойство `path` содержит путь к созданному каталогу. Когда объект освобождается, каталог и его содержимое будут удалены, если они всё ещё существуют. Если каталог не удаётся удалить, освобождение выбросит ошибку. У объекта есть метод `remove()`, выполняющий ту же задачу.

<!-- TODO: link MDN docs for disposables once https://github.com/mdn/content/pull/38027 lands -->

For detailed information, see the documentation of [`fs.mkdtemp()`](#fsmkdtempprefix-options-callback).

Версии этого API с callback нет, потому что он разработан для использования с синтаксисом `using`.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, задающим используемую кодировку символов.

### `fs.opendirSync(path[, options])`

<!-- YAML
added: v12.12.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/41439
    description: Added `recursive` option.
  - version:
     - v13.1.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30114
    description: The `bufferSize` option was introduced.
-->

Добавлено в: v12.12.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `bufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Number of directory entries that are buffered internally when reading from the directory. Higher values lead to better performance but higher memory usage. **По умолчанию:** `32`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
-   Возвращает: [`<fs.Dir>`](fs.md#class-fsdir)

Синхронно открывает каталог. См. `opendir(3)`.

Создаёт [fs.Dir](fs.md#class-fsdir), содержащий все последующие функции для чтения из каталога и его очистки.

Опция `encoding` задаёт кодировку для `path` при открытии каталога и последующих операциях чтения.

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

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `'r'`. See [support of file system `flags`](#file-system-flags).
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает целое число, представляющее файловый дескриптор.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.open()`](#fsopenpath-flags-mode-callback).

### `fs.readdirSync(path[, options])`

<!-- YAML
added: v0.1.21
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/41439
    description: Added `recursive` option.
  - version: v10.10.0
    pr-url: https://github.com/nodejs/node/pull/22020
    description: New option `withFileTypes` was added.
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, reads the contents of a directory recursively. In recursive mode, it will list all files, sub files, and directories. **По умолчанию:** `false`.
-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer[]>`](buffer.md#buffer) | [`<fs.Dirent[]>`](fs.md#fsdirent)

Читает содержимое каталога.

Подробнее см. POSIX readdir(3).

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the filenames returned. If the `encoding` is set to `'buffer'`, the filenames returned will be passed as [Buffer](buffer.md#buffer) objects.

If `options.withFileTypes` is set to `true`, the result will contain [fs.Dirent](fs.md#fsdirent) objects.

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

Добавлено в: v0.1.8

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Возвращает содержимое `path`.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.readFile()`](#fsreadfilepath-options-callback).

Если указана опция `encoding`, эта функция возвращает строку. В противном случае она возвращает буфер.

Similar to [`fs.readFile()`](#fsreadfilepath-options-callback), when the path is a directory, the behavior of `fs.readFileSync()` is platform-specific.

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

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

Добавлено в: v0.1.31

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Возвращает строковое значение символической ссылки.

Подробнее см. POSIX readlink(2).

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the link path returned. If the `encoding` is set to `'buffer'`, the link path returned will be passed as a [Buffer](buffer.md#buffer) object.

### `fs.readSync(fd, buffer, offset, length[, position])`

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

Добавлено в: v0.1.21

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает количество `bytesRead`.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback).

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
                 to make offset, length, and position optional.
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает количество `bytesRead`.

Подобно приведённой выше функции `fs.readSync`, эта версия принимает необязательный объект `options`. Если `options` не указан, будут использованы значения по умолчанию, перечисленные выше.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.read()`](#fsreadfd-buffer-offset-length-position-callback).

### `fs.readvSync(fd, buffers[, position])`

<!-- YAML
added:
 - v13.13.0
 - v12.17.0
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes read.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.readv()`](#fsreadvfd-buffers-position-callback).

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

Добавлено в: v0.1.31

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Возвращает разрешённый путь.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.realpath()`](#fsrealpathpath-options-callback).

### `fs.realpathSync.native(path[, options])`

<!-- YAML
added: v9.2.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Синхронная версия `realpath(3)`.

Поддерживаются только пути, которые можно преобразовать в строки UTF-8.

Необязательный аргумент `options` может быть строкой, задающей кодировку, либо объектом со свойством `encoding`, определяющим кодировку символов для возвращаемого пути. Если `encoding` равно `'buffer'`, возвращаемый путь будет передан как объект [Buffer](buffer.md#buffer).

В Linux, когда Node.js слинкован с musl libc, для работы этой функции файловая система procfs должна быть смонтирована в `/proc`. У glibc этого ограничения нет.

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

Добавлено в: v0.1.21

-   `oldPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)

Переименовывает файл из `oldPath` в `newPath`. Возвращает `undefined`.

Подробнее см. POSIX rename(2).

### `fs.rmdirSync(path[, options])`

<!-- YAML
added: v0.1.21
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/58616
    description: Remove `recursive` option.
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

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) в настоящий момент никаких опций не предоставляется. Раньше существовали опции `recursive`, `maxBusyTries` и `emfileWait`, но они были устаревшими и удалены. Аргумент `options` по-прежнему принимается для обратной совместимости, но не используется.

Синхронная версия `rmdir(2)`. Возвращает `undefined`.

Использование `fs.rmdirSync()` для файла (а не каталога) приводит к ошибке `ENOENT` в Windows и `ENOTDIR` в POSIX.

To get a behavior similar to the `rm -rf` Unix command, use [`fs.rmSync()`](#fsrmsyncpath-options) with options `{ recursive: true, force: true }`.

### `fs.rmSync(path[, options])`

<!-- YAML
added: v14.14.0
changes:
  - version:
      - v17.3.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41132
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

Добавлено в: v14.14.0

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, исключения будут игнорироваться, если `path` не существует. **По умолчанию:** `false`.
    -   `maxRetries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) если возникает ошибка `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY` или `EPERM`, Node.js повторяет операцию, линейно увеличивая ожидание на `retryDelay` миллисекунд при каждой попытке. Эта опция задаёт число повторов. Игнорируется, если `recursive` не равно `true`. **По умолчанию:** `0`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, выполняется рекурсивное удаление каталога. В рекурсивном режиме операции повторяются при сбоях. **По умолчанию:** `false`.
    -   `retryDelay` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество миллисекунд ожидания между повторными попытками. Игнорируется, если `recursive` не равно `true`. **По умолчанию:** `100`.

Синхронно удаляет файлы и каталоги (по образцу стандартной POSIX-утилиты `rm`). Возвращает `undefined`.

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

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.Stats](fs.md#fsstats) иметь тип `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) следует ли выбрасывать исключение, если запись файловой системы не существует, вместо возврата `undefined`. **По умолчанию:** `true`.
-   Возвращает: [`<fs.Stats>`](fs.md#fsstats)

Получает [fs.Stats](fs.md#fsstats) для указанного пути.

### `fs.statfsSync(path[, options])`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) должны ли числовые значения в возвращаемом объекте [fs.StatFs](fs.md#fsstatfs) иметь тип `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<fs.StatFs>`](fs.md#fsstatfs)

Синхронная версия `statfs(2)`. Возвращает информацию о смонтированной файловой системе, содержащей `path`.

В случае ошибки `err.code` будет одним из [распространённых системных ошибок](errors.md#common-system-errors).

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

Добавлено в: v0.1.31

-   `target` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
-   Возвращает: `undefined`.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.symlink()`](#fssymlinktarget-path-type-callback).

### `fs.truncateSync(path[, len])`

<!-- YAML
added: v0.8.6
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`

Усекает файл. Возвращает `undefined`. В качестве первого аргумента также можно передать файловый дескриптор. В этом случае будет вызван `fs.ftruncateSync()`.

Передача файлового дескриптора устарела и в будущем может приводить к выбрасыванию ошибки.

### `fs.unlinkSync(path)`

<!-- YAML
added: v0.1.21
changes:
  - version: v7.6.0
    pr-url: https://github.com/nodejs/node/pull/10739
    description: The `path` parameter can be a WHATWG `URL` object using `file:`
                 protocol.
-->

Добавлено в: v0.1.21

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)

Синхронная версия `unlink(2)`. Возвращает `undefined`.

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
    description: Numeric strings, `NaN`, and `Infinity` are now allowed
                 time specifiers.
-->

Добавлено в: v0.4.2

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: `undefined`.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.utimes()`](#fsutimespath-atime-mtime-callback).

### `fs.writeFileSync(file, data[, options])`

<!-- YAML
added: v0.1.29
changes:
  - version:
    - v21.0.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50009
    description: The `flush` option is now supported.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42796
    description: Passing to the `data` parameter an object with an own
                 `toString` function is no longer supported.
  - version: v17.8.0
    pr-url: https://github.com/nodejs/node/pull/42149
    description: Passing to the `data` parameter an object with an own
                 `toString` function is deprecated.
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

Добавлено в: v0.1.29

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'w'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If all data is successfully written to the file, and `flush` is `true`, `fs.fsyncSync()` is used to flush the data.
-   Возвращает: `undefined`.

The `mode` option only affects the newly created file. See [`fs.open()`](#fsopenpath-flags-mode-callback) for more details.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.writeFile()`](#fswritefilefile-data-options-callback).

### `fs.writeSync(fd, buffer, offset[, length[, position]])`

<!-- YAML
added: v0.1.21
changes:
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

Добавлено в: v0.1.21

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes written.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.write(fd, buffer...)`](#fswritefd-buffer-offset-length-position-callback).

### `fs.writeSync(fd, buffer[, options])`

<!-- YAML
added:
  - v18.3.0
  - v16.17.0
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes written.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.write(fd, buffer...)`](#fswritefd-buffer-offset-length-position-callback).

### `fs.writeSync(fd, string[, position[, encoding]])`

<!-- YAML
added: v0.11.5
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `string` parameter won't coerce unsupported input to
                 strings anymore.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/7856
    description: The `position` parameter is optional now.
-->

Добавлено в: v0.11.5

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes written.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.write(fd, string...)`](#fswritefd-string-position-encoding-callback).

### `fs.writevSync(fd, buffers[, position])`

<!-- YAML
added: v12.9.0
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes written.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.writev()`](#fswritevfd-buffers-position-callback).

## Общие объекты

Общие объекты используются всеми вариантами API файловой системы: на промисах, с обратными вызовами и синхронным.

### Класс: `fs.Dir` {#class-fsdir}

<!-- YAML
added: v12.12.0
-->

Класс, представляющий поток каталога.

Создаётся методами [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options) или [`fsPromises.opendir()`](#fspromisesopendirpath-options).

=== "MJS"

    ```js
    import { opendir } from 'node:fs/promises';

    try {
      const dir = await opendir('./');
      for await (const dirent of dir)
        console.log(dirent.name);
    } catch (err) {
      console.error(err);
    }
    ```

При использовании асинхронного итератора объект [fs.Dir](fs.md#class-fsdir) будет автоматически закрыт после завершения итерации.

#### `dir.close()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Асинхронно закрывает базовый дескриптор ресурса каталога. Последующие чтения приведут к ошибкам.

Возвращает промис, который будет выполнен после закрытия ресурса.

#### `dir.close(callback)`

<!-- YAML
added: v12.12.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v12.12.0

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Асинхронно закрывает базовый дескриптор ресурса каталога. Последующие чтения приведут к ошибкам.

`callback` будет вызван после закрытия дескриптора ресурса.

#### `dir.closeSync()`

<!-- YAML
added: v12.12.0
-->

Синхронно закрывает базовый дескриптор ресурса каталога. Последующие чтения приведут к ошибкам.

#### `dir.path`

<!-- YAML
added: v12.12.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Путь к этому каталогу только для чтения, переданный в [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options) или [`fsPromises.opendir()`](#fspromisesopendirpath-options).

#### `dir.read()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise), который выполняется с [fs.Dirent](fs.md#fsdirent) или `null`

Асинхронно читает следующую запись каталога через `readdir(3)` как [fs.Dirent](fs.md#fsdirent).

Возвращает промис, который будет выполнен с [fs.Dirent](fs.md#fsdirent) или `null`, если больше нет записей каталога для чтения.

Записи каталога, возвращаемые этой функцией, не имеют определённого порядка и зависят от базовых механизмов каталогов операционной системы. Записи, добавленные или удалённые во время итерации по каталогу, могут не попасть в результаты итерации.

#### `dir.read(callback)`

<!-- YAML
added: v12.12.0
-->

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `dirent` [`<fs.Dirent>`](fs.md#fsdirent) | null

Асинхронно читает следующую запись каталога через `readdir(3)` как [fs.Dirent](fs.md#fsdirent).

После завершения чтения `callback` будет вызван с [fs.Dirent](fs.md#fsdirent) или `null`, если больше нет записей каталога для чтения.

Записи каталога, возвращаемые этой функцией, не имеют определённого порядка и зависят от базовых механизмов каталогов операционной системы. Записи, добавленные или удалённые во время итерации по каталогу, могут не попасть в результаты итерации.

#### `dir.readSync()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<fs.Dirent>`](fs.md#fsdirent) | null

Синхронно читает следующую запись каталога как [fs.Dirent](fs.md#fsdirent). Подробнее см. документацию POSIX `readdir(3)`.

Если больше нет записей каталога для чтения, будет возвращён `null`.

Записи каталога, возвращаемые этой функцией, не имеют определённого порядка и зависят от базовых механизмов каталогов операционной системы. Записи, добавленные или удалённые во время итерации по каталогу, могут не попасть в результаты итерации.

#### `dir[Symbol.asyncIterator]()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<AsyncIterator>`](https://tc39.es/ecma262/#sec-asynciterator-interface) асинхронный итератор из [fs.Dirent](fs.md#fsdirent)

Асинхронно перебирает каталог, пока не будут прочитаны все записи. Подробнее см. документацию POSIX `readdir(3)`.

Записи, возвращаемые асинхронным итератором, всегда являются [fs.Dirent](fs.md#fsdirent). Случай `null` из `dir.read()` обрабатывается внутри.

Пример см. в разделе [fs.Dir](fs.md#class-fsdir).

Записи каталога, возвращаемые этим итератором, не имеют определённого порядка и зависят от базовых механизмов каталогов операционной системы. Записи, добавленные или удалённые во время итерации по каталогу, могут не попасть в результаты итерации.

#### `dir[Symbol.asyncDispose]()`

<!-- YAML
added:
 - v24.1.0
 - v22.1.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

Вызывает `dir.close()`, если дескриптор каталога открыт, и возвращает промис, который выполняется после завершения освобождения ресурса.

#### `dir[Symbol.dispose]()`

<!-- YAML
added:
 - v24.1.0
 - v22.1.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

Вызывает `dir.closeSync()`, если дескриптор каталога открыт, и возвращает `undefined`.

### Класс: `fs.Dirent` {#class-fsdirent}

<!-- YAML
added: v10.10.0
-->

Представление записи каталога, которая может быть файлом или подкаталогом внутри каталога и возвращается при чтении из [fs.Dir](fs.md#class-fsdir). Запись каталога сочетает имя файла и тип файла.

Кроме того, когда [`fs.readdir()`](#fsreaddirpath-options-callback) или [`fs.readdirSync()`](#fsreaddirsyncpath-options) вызываются с опцией `withFileTypes`, установленной в `true`, результирующий массив заполняется объектами [fs.Dirent](fs.md#fsdirent), а не строками или [Buffer](buffer.md#buffer).

#### `dirent.isBlockDevice()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает блочное устройство.

#### `dirent.isCharacterDevice()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает символьное устройство.

#### `dirent.isDirectory()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает каталог файловой системы.

#### `dirent.isFIFO()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает канал FIFO (first-in-first-out).

#### `dirent.isFile()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает обычный файл.

#### `dirent.isSocket()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает сокет.

#### `dirent.isSymbolicLink()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Dirent](fs.md#fsdirent) описывает символическую ссылку.

#### `dirent.name`

<!-- YAML
added: v10.10.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Имя файла, на который указывает этот объект [fs.Dirent](fs.md#fsdirent). Тип этого значения определяется `options.encoding`, переданным в [`fs.readdir()`](#fsreaddirpath-options-callback) или [`fs.readdirSync()`](#fsreaddirsyncpath-options).

#### `dirent.parentPath`

<!-- YAML
added:
  - v21.4.0
  - v20.12.0
  - v18.20.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Путь к родительскому каталогу файла, на который указывает этот объект [fs.Dirent](fs.md#fsdirent).

### Класс: `fs.FSWatcher` {#class-fsfswatcher}

<!-- YAML
added: v0.5.8
-->

-   Extends [`<EventEmitter>`](events.md#class-eventemitter)

Успешный вызов метода [`fs.watch()`](#fswatchfilename-options-listener) возвращает новый объект [fs.FSWatcher](fs.md#fsfswatcher).

Все объекты [fs.FSWatcher](fs.md#fsfswatcher) генерируют событие `'change'` всякий раз, когда изменяется конкретный отслеживаемый файл.

#### Событие: `'change'`

<!-- YAML
added: v0.5.8
-->

-   `eventType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) тип произошедшего события изменения
-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) имя изменившегося файла (если применимо/доступно)

Генерируется, когда что-то изменяется в отслеживаемом каталоге или файле. Подробнее см. в [`fs.watch()`](#fswatchfilename-options-listener).

Аргумент `filename` может отсутствовать в зависимости от поддержки со стороны операционной системы. Если `filename` передан, он будет иметь тип [Buffer](buffer.md#buffer), если `fs.watch()` вызван с опцией `encoding`, установленной в `'buffer'`, иначе `filename` будет строкой UTF-8.

=== "MJS"

    ```js
    import { watch } from 'node:fs';
    // Пример обработки через слушатель fs.watch()
    watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
      if (filename) {
        console.log(filename);
        // Выведет: <Buffer ...>
      }
    });
    ```

#### Событие: `'close'`

<!-- YAML
added: v10.0.0
-->

Генерируется, когда наблюдатель прекращает следить за изменениями. Закрытый объект [fs.FSWatcher](fs.md#fsfswatcher) больше нельзя использовать в обработчике события.

#### Событие: `'error'`

<!-- YAML
added: v0.5.8
-->

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при возникновении ошибки во время наблюдения за файлом. Объект [fs.FSWatcher](fs.md#fsfswatcher), для которого произошла ошибка, больше нельзя использовать в обработчике события.

#### `watcher.close()`

<!-- YAML
added: v0.5.8
-->

Прекращает наблюдение за изменениями для данного [fs.FSWatcher](fs.md#fsfswatcher). После остановки объект [fs.FSWatcher](fs.md#fsfswatcher) больше нельзя использовать.

#### `watcher.ref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.FSWatcher>`](fs.md#fsfswatcher)

При вызове запрашивает, чтобы цикл событий Node.js _не_ завершался, пока активен [fs.FSWatcher](fs.md#fsfswatcher). Многократный вызов `watcher.ref()` ни на что не влияет.

По умолчанию все объекты [fs.FSWatcher](fs.md#fsfswatcher) уже имеют состояние "ref", поэтому обычно вызывать `watcher.ref()` не требуется, если ранее не вызывался `watcher.unref()`.

#### `watcher.unref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.FSWatcher>`](fs.md#fsfswatcher)

При вызове активный объект [fs.FSWatcher](fs.md#fsfswatcher) перестаёт требовать, чтобы цикл событий Node.js оставался активным. Если нет другой активности, поддерживающей цикл событий, процесс может завершиться до вызова callback объекта [fs.FSWatcher](fs.md#fsfswatcher). Многократный вызов `watcher.unref()` ни на что не влияет.

### Класс: `fs.StatWatcher` {#class-fsstatwatcher}

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Extends [`<EventEmitter>`](events.md#class-eventemitter)

Успешный вызов метода `fs.watchFile()` возвращает новый объект [fs.StatWatcher](fs.md#fsstatwatcher).

#### `watcher.ref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.StatWatcher>`](fs.md#fsstatwatcher)

При вызове запрашивает, чтобы цикл событий Node.js _не_ завершался, пока активен [fs.StatWatcher](fs.md#fsstatwatcher). Многократный вызов `watcher.ref()` ни на что не влияет.

По умолчанию все объекты [fs.StatWatcher](fs.md#fsstatwatcher) уже имеют состояние "ref", поэтому обычно вызывать `watcher.ref()` не требуется, если ранее не вызывался `watcher.unref()`.

#### `watcher.unref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.StatWatcher>`](fs.md#fsstatwatcher)

При вызове активный объект [fs.StatWatcher](fs.md#fsstatwatcher) перестаёт требовать, чтобы цикл событий Node.js оставался активным. Если нет другой активности, поддерживающей цикл событий, процесс может завершиться до вызова callback объекта [fs.StatWatcher](fs.md#fsstatwatcher). Многократный вызов `watcher.unref()` ни на что не влияет.

### Класс: `fs.ReadStream` {#class-fsreadstream}

<!-- YAML
added: v0.1.93
-->

-   Extends: [`<stream.Readable>`](stream.md#streamreadable)

Экземпляры [fs.ReadStream](fs.md#class-fsreadstream) нельзя создавать напрямую. Они создаются и возвращаются функцией [`fs.createReadStream()`](#fscreatereadstreampath-options).

#### Событие: `'close'`

<!-- YAML
added: v0.1.93
-->

Генерируется, когда базовый файловый дескриптор [fs.ReadStream](fs.md#class-fsreadstream) закрыт.

#### Событие: `'open'`

<!-- YAML
added: v0.1.93
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) целочисленный файловый дескриптор, используемый [fs.ReadStream](fs.md#class-fsreadstream)

Генерируется, когда файловый дескриптор [fs.ReadStream](fs.md#class-fsreadstream) открыт.

#### Событие: `'ready'`

<!-- YAML
added: v9.11.0
-->

Генерируется, когда [fs.ReadStream](fs.md#class-fsreadstream) готов к использованию.

Срабатывает сразу после `'open'`.

#### `readStream.bytesRead`

<!-- YAML
added: v6.4.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество байтов, прочитанных на данный момент.

#### `readStream.path`

<!-- YAML
added: v0.1.93
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Путь к файлу, из которого читает поток, указанный в первом аргументе `fs.createReadStream()`. Если `path` передан как строка, `readStream.path` будет строкой. Если `path` передан как [Buffer](buffer.md#buffer), `readStream.path` будет [Buffer](buffer.md#buffer). Если указан `fd`, значение `readStream.path` будет `undefined`.

#### `readStream.pending`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Это свойство равно `true`, если базовый файл ещё не был открыт, то есть до генерации события `'ready'`.

### Класс: `fs.Stats` {#class-fsstats}

<!-- YAML
added: v0.1.21
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/51879
    description: Public constructor is deprecated.
  - version: v8.1.0
    pr-url: https://github.com/nodejs/node/pull/13173
    description: Added times as numbers.
-->

Добавлено в: v0.1.21

Объект [fs.Stats](fs.md#fsstats) содержит информацию о файле.

Объекты, возвращаемые методами [`fs.stat()`](#fsstatpath-options-callback), [`fs.lstat()`](#fslstatpath-options-callback), [`fs.fstat()`](#fsfstatfd-options-callback) и их синхронными аналогами, имеют этот тип. Если в `options`, переданных этим методам, значение `bigint` равно `true`, числовые значения будут иметь тип `bigint` вместо `number`, а объект также будет содержать дополнительные свойства с наносекундной точностью, оканчивающиеся на `Ns`. Объекты `Stat` не следует создавать напрямую через `new`.

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

Версия с `bigint`:

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

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает блочное устройство.

#### `stats.isCharacterDevice()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает символьное устройство.

#### `stats.isDirectory()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает каталог файловой системы.

Если объект [fs.Stats](fs.md#fsstats) получен вызовом [`fs.lstat()`](#fslstatpath-options-callback) для символической ссылки, которая указывает на каталог, этот метод вернёт `false`. Это связано с тем, что [`fs.lstat()`](#fslstatpath-options-callback) возвращает информацию о самой символической ссылке, а не о пути, к которому она разрешается.

#### `stats.isFIFO()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает FIFO-канал (first-in-first-out).

#### `stats.isFile()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает обычный файл.

#### `stats.isSocket()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает сокет.

#### `stats.isSymbolicLink()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает `true`, если объект [fs.Stats](fs.md#fsstats) описывает символическую ссылку.

Этот метод корректен только при использовании [`fs.lstat()`](#fslstatpath-options-callback).

#### `stats.dev`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Числовой идентификатор устройства, содержащего файл.

#### `stats.ino`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Специфичный для файловой системы номер inode файла.

#### `stats.mode`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Битовое поле, описывающее тип и режим файла.

#### `stats.nlink`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Количество жёстких ссылок, существующих для файла.

#### `stats.uid`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Числовой идентификатор пользователя, которому принадлежит файл (POSIX).

#### `stats.gid`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Числовой идентификатор группы, которой принадлежит файл (POSIX).

#### `stats.rdev`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Числовой идентификатор устройства, если файл представляет устройство.

#### `stats.size`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Размер файла в байтах.

Если базовая файловая система не поддерживает получение размера файла, значение будет равно `0`.

#### `stats.blksize`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Размер блока файловой системы для операций ввода-вывода.

#### `stats.blocks`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Количество блоков, выделенных для этого файла.

#### `stats.atimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Временная метка последнего доступа к файлу в миллисекундах с эпохи POSIX.

#### `stats.mtimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Временная метка последнего изменения файла в миллисекундах с эпохи POSIX.

#### `stats.ctimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Временная метка последнего изменения состояния файла в миллисекундах с эпохи POSIX.

#### `stats.birthtimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Временная метка времени создания файла в миллисекундах с эпохи POSIX.

#### `stats.atimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Присутствует только тогда, когда в метод, создающий объект, передано `bigint: true`. Это временная метка последнего доступа к файлу в наносекундах с эпохи POSIX.

#### `stats.mtimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Присутствует только тогда, когда в метод, создающий объект, передано `bigint: true`. Это временная метка последнего изменения файла в наносекундах с эпохи POSIX.

#### `stats.ctimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Присутствует только тогда, когда в метод, создающий объект, передано `bigint: true`. Это временная метка последнего изменения состояния файла в наносекундах с эпохи POSIX.

#### `stats.birthtimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Присутствует только тогда, когда в метод, создающий объект, передано `bigint: true`. Это временная метка времени создания файла в наносекундах с эпохи POSIX.

#### `stats.atime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Временная метка последнего доступа к этому файлу.

#### `stats.mtime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Временная метка последнего изменения этого файла.

#### `stats.ctime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Временная метка последнего изменения состояния файла.

#### `stats.birthtime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Временная метка времени создания этого файла.

#### Значения времени Stat

Свойства `atimeMs`, `mtimeMs`, `ctimeMs`, `birthtimeMs` — это числовые значения, содержащие соответствующее время в миллисекундах. Их точность зависит от платформы. Если в метод, создающий объект, передано `bigint: true`, эти свойства будут иметь тип [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt), иначе это будут [числа](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#number_type).

Свойства `atimeNs`, `mtimeNs`, `ctimeNs`, `birthtimeNs` — это значения [bigint](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt), содержащие соответствующее время в наносекундах. Они присутствуют только тогда, когда в метод, создающий объект, передано `bigint: true`. Их точность зависит от платформы.

`atime`, `mtime`, `ctime` и `birthtime` — это альтернативные представления различных моментов времени в виде объектов [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date). Значения `Date` и числовые значения не связаны между собой. Если присвоить новое числовое значение или изменить объект `Date`, это не отразится на соответствующем альтернативном представлении.

Временные поля объекта stat имеют следующую семантику:

-   `atime` "Access Time": время последнего доступа к данным файла. Изменяется системными вызовами `mknod(2)`, `utimes(2)` и `read(2)`.
-   `mtime` "Modified Time": время последнего изменения данных файла. Изменяется системными вызовами `mknod(2)`, `utimes(2)` и `write(2)`.
-   `ctime` "Change Time": время последнего изменения состояния файла (модификации данных inode). Изменяется системными вызовами `chmod(2)`, `chown(2)`, `link(2)`, `mknod(2)`, `rename(2)`, `unlink(2)`, `utimes(2)`, `read(2)` и `write(2)`.
-   `birthtime` "Birth Time": время создания файла. Устанавливается один раз при создании файла. В файловых системах, где `birthtime` недоступно, это поле может вместо этого содержать либо `ctime`, либо `1970-01-01T00:00Z` (то есть Unix-эпоху с меткой времени `0`). В таком случае это значение может быть больше, чем `atime` или `mtime`. В Darwin и других вариантах FreeBSD оно также устанавливается, если `atime` явно устанавливается в значение раньше текущего `birthtime` с помощью системного вызова `utimes(2)`.

До Node.js 0.12 в Windows поле `ctime` содержало `birthtime`. Начиная с 0.12, `ctime` не означает "время создания", и в Unix-системах оно никогда этого не означало.

### Класс: `fs.StatFs` {#class-fsstatfs}

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

Содержит информацию о смонтированной файловой системе.

Объекты, возвращаемые [`fs.statfs()`](#fsstatfspath-options-callback) и его синхронным аналогом, имеют этот тип. Если в `options`, переданных этим методам, значение `bigint` равно `true`, числовые значения будут иметь тип `bigint` вместо `number`.

```console
StatFs {
  type: 1397114950,
  bsize: 4096,
  frsize: 4096,
  blocks: 121938943,
  bfree: 61058895,
  bavail: 61058895,
  files: 999,
  ffree: 1000000
}
```

Версия с `bigint`:

```console
StatFs {
  type: 1397114950n,
  bsize: 4096n,
  frsize: 4096n,
  blocks: 121938943n,
  bfree: 61058895n,
  bavail: 61058895n,
  files: 999n,
  ffree: 1000000n
}
```

#### `statfs.bavail`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Свободные блоки, доступные непривилегированным пользователям.

#### `statfs.bfree`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Свободные блоки в файловой системе.

#### `statfs.blocks`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Общее количество блоков данных в файловой системе.

#### `statfs.bsize`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Оптимальный размер блока передачи.

#### `statfs.frsize`

<!-- YAML
added: REPLACEME
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Базовый размер блока файловой системы.

#### `statfs.ffree`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Свободные файловые узлы в файловой системе.

#### `statfs.files`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Общее количество файловых узлов в файловой системе.

#### `statfs.type`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Тип файловой системы.

### Класс: `fs.Utf8Stream` {#class-fsutf8stream}

<!-- YAML
added: v24.6.0
-->

!!!warning "Стабильность: 1 - Экспериментальная"

Оптимизированный UTF-8-писатель потока, который позволяет по запросу сбрасывать весь внутренний буфер. Корректно обрабатывает ошибки `EAGAIN`, что позволяет настраивать поведение, например отбрасывать содержимое, если диск занят.

#### Событие: `'close'`

Событие `'close'` генерируется, когда поток полностью закрыт.

#### Событие: `'drain'`

Событие `'drain'` генерируется, когда внутренний буфер достаточно освободился, чтобы можно было продолжить запись.

#### Событие: `'drop'`

Событие `'drop'` генерируется, когда достигнута максимальная длина и эти данные не будут записаны. Отброшенные данные передаются первым аргументом обработчику события.

#### Событие: `'error'`

Событие `'error'` генерируется при возникновении ошибки.

#### Событие: `'finish'`

Событие `'finish'` генерируется, когда поток завершён и все данные сброшены в базовый файл.

#### Событие: `'ready'`

Событие `'ready'` генерируется, когда поток готов принимать запись.

#### Событие: `'write'`

Событие `'write'` генерируется, когда операция записи завершена. Количество записанных байтов передаётся первым аргументом обработчику события.

#### `new fs.Utf8Stream([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `append`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) добавлять запись в файл `dest`, а не усекать его. **По умолчанию:** `true`.
    -   `contentMode`: [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) какой тип данных можно передавать в функцию записи; поддерживаются значения `'utf8'` и `'buffer'`. **По умолчанию:** `'utf8'`.
    -   `dest`: [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) путь к файлу, в который будет вестись запись (режим управляется опцией `append`).
    -   `fd`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) файловый дескриптор, например возвращаемый `fs.open()` или `fs.openSync()`.
    -   `fs`: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) объект с тем же API, что и модуль `fs`; полезен для моков, тестирования или настройки поведения потока.
    -   `fsync`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) выполнять `fs.fsyncSync()` после каждого завершённого вызова записи.
    -   `maxLength`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальная длина внутреннего буфера. Если операция записи приведёт к превышению `maxLength`, записываемые данные будут отброшены и будет сгенерировано событие `drop` с этими данными.
    -   `maxWrite`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальное число байтов, которое можно записать; **По умолчанию:** `16384`
    -   `minLength`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) минимальная длина внутреннего буфера, которую нужно набрать перед сбросом.
    -   `mkdir`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) если `true`, гарантирует существование каталога для файла `dest`. **По умолчанию:** `false`.
    -   `mode`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) режим создаваемого файла (см. `fs.open()`).
    -   `periodicFlush`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) вызывает сброс каждые `periodicFlush` миллисекунд.
    -   `retryEAGAIN` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция, вызываемая, когда `write()`, `writeSync()` или `flushSync()` сталкиваются с ошибкой `EAGAIN` или `EBUSY`. Если возвращаемое значение равно `true`, операция будет повторена, иначе ошибка всплывёт наружу. `err` — ошибка, вызвавшая этот вызов функции, `writeBufferLen` — длина буфера, который был записан, а `remainingBufferLen` — длина оставшегося буфера, который поток не пытался записать.
        -   `err` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) ошибка или `null`.
        -   `writeBufferLen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
        -   `remainingBufferLen`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `sync`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Perform writes synchronously.

#### `utf8Stream.append`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, добавляет ли поток данные в файл или усекает его.

#### `utf8Stream.contentMode`

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) тип данных, которые можно записывать в поток. Поддерживаются значения `'utf8'` и `'buffer'`. **По умолчанию:** `'utf8'`.

#### `utf8Stream.destroy()`

Немедленно закрывает поток без сброса внутреннего буфера.

#### `utf8Stream.end()`

Аккуратно закрывает поток, предварительно сбрасывая внутренний буфер.

#### `utf8Stream.fd`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) файловый дескриптор, в который выполняется запись.

#### `utf8Stream.file`

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) файл, в который выполняется запись.

#### `utf8Stream.flush(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null ошибка, если сброс завершился неудачей, иначе `null`

Записывает текущий буфер в файл, если запись в данный момент не выполняется. Ничего не делает, если `minLength` равно нулю или если поток уже пишет.

#### `utf8Stream.flushSync()`

Синхронно сбрасывает буферизованные данные. Это затратная операция.

#### `utf8Stream.fsync`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, выполняет ли поток `fs.fsyncSync()` после каждой операции записи.

#### `utf8Stream.maxLength`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальная длина внутреннего буфера. Если операция записи приведёт к превышению `maxLength`, записываемые данные будут отброшены и будет сгенерировано событие `drop` с отброшенными данными.

#### `utf8Stream.minLength`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) минимальная длина внутреннего буфера, которую нужно заполнить перед сбросом.

#### `utf8Stream.mkdir`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, должен ли поток обеспечивать существование каталога для файла `dest`. Если `true`, каталог будет создан, если он отсутствует. **По умолчанию:** `false`.

#### `utf8Stream.mode`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) режим файла, в который выполняется запись.

#### `utf8Stream.periodicFlush`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) количество миллисекунд между сбросами. Если установлено `0`, периодические сбросы выполняться не будут.

#### `utf8Stream.reopen(file)`

-   `file`: [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [Buffer](buffer.md#buffer) | [URL](url.md#the-whatwg-url-api) путь к файлу, в который будет вестись запись (режим управляется опцией `append`)

Повторно открывает файл на месте; полезно для ротации логов.

#### `utf8Stream.sync`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, пишет ли поток синхронно или асинхронно.

#### `utf8Stream.write(data)`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) данные для записи
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если при создании потока `options.contentMode` установлен в `'utf8'`, аргумент `data` должен быть строкой. Если `contentMode` установлен в `'buffer'`, аргумент `data` должен быть [Buffer](buffer.md#buffer).

#### `utf8Stream.writing`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) указывает, записывает ли поток данные в файл в данный момент.

#### `utf8Stream[Symbol.dispose]()`

Вызывает `utf8Stream.destroy()`.

### Класс: `fs.WriteStream` {#class-fswritestream}

<!-- YAML
added: v0.1.93
-->

-   Extends [`<stream.Writable>`](stream.md#streamwritable)

Экземпляры [fs.WriteStream](fs.md#fswritestream) нельзя создавать напрямую. Они создаются и возвращаются функцией [`fs.createWriteStream()`](#fscreatewritestreampath-options).

#### Событие: `'close'`

<!-- YAML
added: v0.1.93
-->

Генерируется, когда базовый файловый дескриптор [fs.WriteStream](fs.md#fswritestream) закрыт.

#### Событие: `'open'`

<!-- YAML
added: v0.1.93
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) целочисленный файловый дескриптор, используемый [fs.WriteStream](fs.md#fswritestream)

Генерируется, когда файл [fs.WriteStream](fs.md#fswritestream) открыт.

#### Событие: `'ready'`

<!-- YAML
added: v9.11.0
-->

Генерируется, когда [fs.WriteStream](fs.md#fswritestream) готов к использованию.

Срабатывает сразу после `'open'`.

#### `writeStream.bytesWritten`

<!-- YAML
added: v0.4.7
-->

Количество байтов, записанных на данный момент. Не включает данные, которые всё ещё находятся в очереди на запись.

#### `writeStream.close([callback])`

<!-- YAML
added: v0.9.4
-->

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Закрывает `writeStream`. Необязательно принимает callback, который будет выполнен после закрытия `writeStream`.

#### `writeStream.path`

<!-- YAML
added: v0.1.93
-->

Путь к файлу, в который пишет поток, указанный в первом аргументе [`fs.createWriteStream()`](#fscreatewritestreampath-options). Если `path` передан как строка, `writeStream.path` будет строкой. Если `path` передан как [Buffer](buffer.md#buffer), `writeStream.path` будет [Buffer](buffer.md#buffer).

#### `writeStream.pending`

<!-- YAML
added: v11.2.0
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Это свойство равно `true`, если базовый файл ещё не был открыт, то есть до генерации события `'ready'`.

### `fs.constants`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект, содержащий часто используемые константы для операций файловой системы.

#### Константы FS {#fs-constants}

Следующие константы экспортируются через `fs.constants` и `fsPromises.constants`.

Не каждая константа будет доступна в каждой операционной системе; особенно это важно для Windows, где многие определения, специфичные для POSIX, недоступны. Для переносимых приложений рекомендуется перед использованием проверять их наличие.

Чтобы использовать несколько констант одновременно, применяйте оператор побитового ИЛИ `|`.

Пример:

=== "MJS"

    ```js
    import { open, constants } from 'node:fs';

    const {
      O_RDWR,
      O_CREAT,
      O_EXCL,
    } = constants;

    open('/path/to/my/file', O_RDWR | O_CREAT | O_EXCL, (err, fd) => {
      // ...
    });
    ```

##### Константы доступа к файлам {#file-access-constants}

Следующие константы предназначены для использования в качестве параметра `mode`, передаваемого в [`fsPromises.access()`](#fspromisesaccesspath-mode), [`fs.access()`](#fsaccesspath-mode-callback) и [`fs.accessSync()`](#fsaccesssyncpath-mode).

| Константа | Описание |
| --- | --- |
| `F_OK` | Флаг, указывающий, что файл видим для вызывающего процесса. Полезен для проверки существования файла, но ничего не говорит о правах `rwx`. Используется по умолчанию, если режим не указан. |
| `R_OK` | Флаг, указывающий, что файл может быть прочитан вызывающим процессом. |
| `W_OK` | Флаг, указывающий, что в файл можно записывать из вызывающего процесса. |
| `X_OK` | Флаг, указывающий, что файл может быть выполнен вызывающим процессом. В Windows не оказывает эффекта (ведёт себя как `fs.constants.F_OK`). |

Эти определения также доступны в Windows.

##### Константы копирования файлов {#file-copy-constants}

Следующие константы предназначены для использования с [`fs.copyFile()`](#fscopyfilesrc-dest-mode-callback).

| Константа | Описание |
| --- | --- |
| `COPYFILE_EXCL` | Если указана, операция копирования завершится ошибкой, если целевой путь уже существует. |
| `COPYFILE_FICLONE` | Если указана, операция копирования попытается создать reflink с копированием по записи. Если базовая платформа не поддерживает copy-on-write, используется запасной механизм копирования. |
| `COPYFILE_FICLONE_FORCE` | Если указана, операция копирования попытается создать reflink с копированием по записи. Если базовая платформа не поддерживает copy-on-write, операция завершится ошибкой. |

Эти определения также доступны в Windows.

##### Константы открытия файлов {#file-open-constants}

Следующие константы предназначены для использования с `fs.open()`.

| Константа | Описание |
| --- | --- |
| `O_RDONLY` | Флаг, указывающий, что файл следует открыть только для чтения. |
| `O_WRONLY` | Флаг, указывающий, что файл следует открыть только для записи. |
| `O_RDWR` | Флаг, указывающий, что файл следует открыть для чтения и записи. |
| `O_CREAT` | Флаг, указывающий, что файл следует создать, если он ещё не существует. |
| `O_EXCL` | Флаг, указывающий, что открытие файла должно завершиться ошибкой, если установлен флаг `O_CREAT` и файл уже существует. |
| `O_NOCTTY` | Флаг, указывающий, что если path обозначает терминальное устройство, его открытие не должно делать этот терминал управляющим терминалом процесса (если у процесса его ещё нет). |
| `O_TRUNC` | Флаг, указывающий, что если файл существует и является обычным файлом, а также успешно открыт для записи, его длина будет усечена до нуля. |
| `O_APPEND` | Флаг, указывающий, что данные будут добавляться в конец файла. |
| `O_DIRECTORY` | Флаг, указывающий, что открытие должно завершиться ошибкой, если path не является каталогом. |
| `O_NOATIME` | Флаг, указывающий, что операции чтения из файловой системы больше не будут приводить к обновлению связанного с файлом значения `atime`. Этот флаг доступен только в Linux. |
| `O_NOFOLLOW` | Флаг, указывающий, что открытие должно завершиться ошибкой, если path является символической ссылкой. |
| `O_SYNC` | Флаг, указывающий, что файл открывается для синхронизированного ввода-вывода, при котором операции записи ждут сохранения целостности файла. |
| `O_DSYNC` | Флаг, указывающий, что файл открывается для синхронизированного ввода-вывода, при котором операции записи ждут сохранения целостности данных. |
| `O_SYMLINK` | Флаг, указывающий, что следует открыть саму символическую ссылку, а не ресурс, на который она указывает. |
| `O_DIRECT` | Если установлен, будет предпринята попытка минимизировать влияние кэширования на файловый ввод-вывод. |
| `O_NONBLOCK` | Флаг, указывающий, что файл следует открыть в неблокирующем режиме, если это возможно. |
| `UV_FS_O_FILEMAP` | Если установлен, для доступа к файлу используется отображение файла в память. Этот флаг доступен только в Windows. В других операционных системах он игнорируется. |

В Windows доступны только `O_APPEND`, `O_CREAT`, `O_EXCL`, `O_RDONLY`, `O_RDWR`, `O_TRUNC`, `O_WRONLY` и `UV_FS_O_FILEMAP`.

##### Константы типа файла {#file-type-constants}

Следующие константы предназначены для использования со свойством `mode` объекта [fs.Stats](fs.md#fsstats) для определения типа файла.

| Константа | Описание |
| --- | --- |
| `S_IFMT` | Битовая маска, используемая для извлечения кода типа файла. |
| `S_IFREG` | Константа типа для обычного файла. |
| `S_IFDIR` | Константа типа для каталога. |
| `S_IFCHR` | Константа типа для символьного устройства. |
| `S_IFBLK` | Константа типа для блочного устройства. |
| `S_IFIFO` | Константа типа для FIFO/канала. |
| `S_IFLNK` | Константа типа для символической ссылки. |
| `S_IFSOCK` | Константа типа для сокета. |

В Windows доступны только `S_IFCHR`, `S_IFDIR`, `S_IFLNK`, `S_IFMT` и `S_IFREG`.

##### Константы режима файла {#file-mode-constants}

Следующие константы предназначены для использования со свойством `mode` объекта [fs.Stats](fs.md#fsstats) для определения прав доступа к файлу.

| Константа | Описание |
| --- | --- |
| `S_IRWXU` | Режим файла, указывающий, что владелец может читать, записывать и выполнять файл. |
| `S_IRUSR` | Режим файла, указывающий, что владелец может читать файл. |
| `S_IWUSR` | Режим файла, указывающий, что владелец может записывать в файл. |
| `S_IXUSR` | Режим файла, указывающий, что владелец может выполнять файл. |
| `S_IRWXG` | Режим файла, указывающий, что группа может читать, записывать и выполнять файл. |
| `S_IRGRP` | Режим файла, указывающий, что группа может читать файл. |
| `S_IWGRP` | Режим файла, указывающий, что группа может записывать в файл. |
| `S_IXGRP` | Режим файла, указывающий, что группа может выполнять файл. |
| `S_IRWXO` | Режим файла, указывающий, что остальные могут читать, записывать и выполнять файл. |
| `S_IROTH` | Режим файла, указывающий, что остальные могут читать файл. |
| `S_IWOTH` | Режим файла, указывающий, что остальные могут записывать в файл. |
| `S_IXOTH` | Режим файла, указывающий, что остальные могут выполнять файл. |

В Windows доступны только `S_IRUSR` и `S_IWUSR`.

## Примечания {#notes}

### Порядок выполнения операций с обратными вызовами и промисами {#ordering-of-callback-and-promise-based-operations}

Поскольку эти операции выполняются асинхронно базовым пулом потоков, при использовании методов на основе обратных вызовов или промисов порядок их выполнения не гарантируется.

Например, следующий код подвержен ошибкам, потому что операция `fs.stat()` может завершиться раньше, чем `fs.rename()`:

```js
const fs = require('node:fs');

fs.rename('/tmp/hello', '/tmp/world', (err) => {
    if (err) throw err;
    console.log('renamed complete');
});
fs.stat('/tmp/world', (err, stats) => {
    if (err) throw err;
    console.log(`stats: ${JSON.stringify(stats)}`);
});
```

Важно правильно упорядочивать операции: дождаться результата одной, прежде чем вызывать другую:

=== "MJS"

    ```js
    import { rename, stat } from 'node:fs/promises';

    const oldPath = '/tmp/hello';
    const newPath = '/tmp/world';

    try {
      await rename(oldPath, newPath);
      const stats = await stat(newPath);
      console.log(`stats: ${JSON.stringify(stats)}`);
    } catch (error) {
      console.error('there was an error:', error.message);
    }
    ```

=== "CJS"

    ```js
    const { rename, stat } = require('node:fs/promises');

    (async function(oldPath, newPath) {
      try {
        await rename(oldPath, newPath);
        const stats = await stat(newPath);
        console.log(`stats: ${JSON.stringify(stats)}`);
      } catch (error) {
        console.error('there was an error:', error.message);
      }
    })('/tmp/hello', '/tmp/world');
    ```

Или, если используются callback API, перенести вызов `fs.stat()` внутрь обратного вызова операции `fs.rename()`:

=== "MJS"

    ```js
    import { rename, stat } from 'node:fs';

    rename('/tmp/hello', '/tmp/world', (err) => {
      if (err) throw err;
      stat('/tmp/world', (err, stats) => {
        if (err) throw err;
        console.log(`stats: ${JSON.stringify(stats)}`);
      });
    });
    ```

=== "CJS"

    ```js
    const { rename, stat } = require('node:fs/promises');

    rename('/tmp/hello', '/tmp/world', (err) => {
      if (err) throw err;
      stat('/tmp/world', (err, stats) => {
        if (err) throw err;
        console.log(`stats: ${JSON.stringify(stats)}`);
      });
    });
    ```

### Пути к файлам {#file-paths}

Большинство операций `fs` принимают пути к файлам, которые могут быть указаны в виде строки, [Buffer](buffer.md#buffer) или объекта [URL](url.md#the-whatwg-url-api) с протоколом `file:`.

#### Строковые пути {#string-paths}

Строковые пути интерпретируются как последовательности символов UTF-8, задающие абсолютное или относительное имя файла. Относительные пути разрешаются относительно текущего рабочего каталога, определяемого вызовом `process.cwd()`.

Пример использования абсолютного пути в POSIX:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let fd;
    try {
      fd = await open('/open/some/file.txt', 'r');
      // Сделать что-нибудь с файлом
    } finally {
      await fd?.close();
    }
    ```

Пример использования относительного пути в POSIX (относительно `process.cwd()`):

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let fd;
    try {
      fd = await open('file.txt', 'r');
      // Сделать что-нибудь с файлом
    } finally {
      await fd?.close();
    }
    ```

#### URL-пути к файлам {#file-url-paths}

<!-- YAML
added: v7.6.0
-->

Для большинства функций модуля `node:fs` аргумент `path` или `filename` можно передавать как объект [URL](url.md#the-whatwg-url-api) с использованием протокола `file:`.

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

    readFileSync(new URL('file:///tmp/hello'));
    ```

URL `file:` всегда являются абсолютными путями.

##### Платформенные особенности {#platform-specific-considerations}

В Windows объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` и именем хоста преобразуются в UNC-пути, а объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` и буквами дисков преобразуются в локальные абсолютные пути. Объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` без имени хоста и без буквы диска приводят к ошибке:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';
    // В Windows:

    // - URL файлов WHATWG с именем хоста преобразуются в UNC-путь
    // file://hostname/p/a/t/h/file => \\hostname\p\a\t\h\file
    readFileSync(new URL('file://hostname/p/a/t/h/file'));

    // - URL файлов WHATWG с буквами дисков преобразуются в абсолютный путь
    // file:///C:/tmp/hello => C:\tmp\hello
    readFileSync(new URL('file:///C:/tmp/hello'));

    // - URL файлов WHATWG без имени хоста должны содержать букву диска
    readFileSync(new URL('file:///notdriveletter/p/a/t/h/file'));
    readFileSync(new URL('file:///c/p/a/t/h/file'));
    // TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must be absolute
    ```

Объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` и буквами дисков должны использовать `:` как разделитель сразу после буквы диска. Использование другого разделителя приведёт к ошибке.

На всех остальных платформах объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` и именем хоста не поддерживаются и приводят к ошибке:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';
    // На других платформах:

    // - URL файлов WHATWG с именем хоста не поддерживаются
    // file://hostname/p/a/t/h/file => throw!
    readFileSync(new URL('file://hostname/p/a/t/h/file'));
    // TypeError [ERR_INVALID_FILE_URL_PATH]: must be absolute

    // - URL файлов WHATWG преобразуются в абсолютный путь
    // file:///tmp/hello => /tmp/hello
    readFileSync(new URL('file:///tmp/hello'));
    ```

Объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` и закодированными символами слеша приводят к ошибке на всех платформах:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

    // В Windows
    readFileSync(new URL('file:///C:/p/a/t/h/%2F'));
    readFileSync(new URL('file:///C:/p/a/t/h/%2f'));
    /* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
    \ or / characters */

    // В POSIX
    readFileSync(new URL('file:///p/a/t/h/%2F'));
    readFileSync(new URL('file:///p/a/t/h/%2f'));
    /* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
    / characters */
    ```

В Windows объекты [URL](url.md#the-whatwg-url-api) с протоколом `file:` и закодированной обратной косой чертой приводят к ошибке:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

    // В Windows
    readFileSync(new URL('file:///C:/path/%5C'));
    readFileSync(new URL('file:///C:/path/%5c'));
    /* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
    \ or / characters */
    ```

#### Пути через Buffer {#buffer-paths}

Пути, заданные через [Buffer](buffer.md#buffer), полезны прежде всего в некоторых POSIX-совместимых операционных системах, которые рассматривают пути к файлам как непрозрачные последовательности байтов. В таких системах один путь к файлу может содержать подпоследовательности с разными кодировками символов. Как и строковые пути, пути [Buffer](buffer.md#buffer) могут быть относительными или абсолютными:

Пример использования абсолютного пути в POSIX:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';
    import { Buffer } from 'node:buffer';

    let fd;
    try {
      fd = await open(Buffer.from('/open/some/file.txt'), 'r');
      // Сделать что-нибудь с файлом
    } finally {
      await fd?.close();
    }
    ```

#### Рабочие каталоги для каждого диска в Windows {#per-drive-working-directories-on-windows}

В Windows Node.js придерживается концепции отдельного рабочего каталога для каждого диска. Это поведение можно наблюдать при использовании пути к диску без обратной косой черты. Например, `fs.readdirSync('C:\\')` потенциально может вернуть другой результат, чем `fs.readdirSync('C:')`. Подробнее см. [на этой странице Microsoft Learn](https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#fully-qualified-vs-relative-paths).

### Файловые дескрипторы {#file-descriptors}

В POSIX-системах ядро для каждого процесса поддерживает таблицу текущих открытых файлов и ресурсов. Каждому открытому файлу присваивается простой числовой идентификатор, называемый _файловым дескриптором_. На системном уровне все операции файловой системы используют эти файловые дескрипторы для идентификации и отслеживания конкретных файлов. В Windows используется другой, но концептуально похожий механизм отслеживания ресурсов. Чтобы упростить работу пользователям, Node.js скрывает различия между операционными системами и присваивает всем открытым файлам числовой файловый дескриптор.

Методы `fs.open()` на основе обратного вызова и синхронный `fs.openSync()` открывают файл и выделяют новый файловый дескриптор. После этого дескриптор можно использовать для чтения, записи или запроса информации о файле.

Операционные системы ограничивают количество файловых дескрипторов, которые могут быть одновременно открыты, поэтому после завершения операций дескриптор критически важно закрывать. Иначе возникнет утечка памяти, которая со временем может привести к сбою приложения.

=== "MJS"

    ```js
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

API на основе промисов используют объект [FileHandle](#filehandle) вместо числового файлового дескриптора. Система лучше управляет такими объектами, чтобы предотвратить утечки ресурсов. Тем не менее, по завершении операций их всё равно необходимо закрывать:

=== "MJS"

    ```js
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

### Использование пула потоков {#threadpool-usage}

Все файловые API на основе обратных вызовов и промисов (за исключением `fs.FSWatcher()`) используют пул потоков libuv. Для некоторых приложений это может иметь неожиданные и негативные последствия для производительности. Подробнее см. документацию [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize).

### Флаги файловой системы {#file-system-flags}

Следующие флаги доступны везде, где параметр `flag` принимает строку.

-   `'a'`: Открыть файл для добавления. Если файла нет, он будет создан.

-   `'ax'`: То же, что `'a'`, но операция завершится ошибкой, если путь уже существует.

-   `'a+'`: Открыть файл для чтения и добавления. Если файла нет, он будет создан.

-   `'ax+'`: То же, что `'a+'`, но операция завершится ошибкой, если путь уже существует.

-   `'as'`: Открыть файл для добавления в синхронном режиме. Если файла нет, он будет создан.

-   `'as+'`: Открыть файл для чтения и добавления в синхронном режиме. Если файла нет, он будет создан.

-   `'r'`: Открыть файл для чтения. Если файл не существует, возникнет исключение.

-   `'rs'`: Открыть файл для чтения в синхронном режиме. Если файл не существует, возникнет исключение.

-   `'r+'`: Открыть файл для чтения и записи. Если файл не существует, возникнет исключение.

-   `'rs+'`: Открыть файл для чтения и записи в синхронном режиме. Указывает операционной системе обойти локальный кэш файловой системы.

    Это прежде всего полезно при открытии файлов на NFS-монтированиях, поскольку позволяет обойти потенциально устаревший локальный кэш. Этот флаг ощутимо влияет на производительность ввода-вывода, поэтому использовать его без необходимости не рекомендуется.

    Это не превращает `fs.open()` или `fsPromises.open()` в синхронный блокирующий вызов. Если требуется синхронная операция, следует использовать, например, `fs.openSync()`.

-   `'w'`: Открыть файл для записи. Файл создаётся (если его нет) или усекается (если он существует).

-   `'wx'`: То же, что `'w'`, но операция завершится ошибкой, если путь уже существует.

-   `'w+'`: Открыть файл для чтения и записи. Файл создаётся (если его нет) или усекается (если он существует).

-   `'wx+'`: То же, что `'w+'`, но операция завершится ошибкой, если путь уже существует.

`flag` также может быть числом, как описано в `open(2)`; часто используемые константы доступны через `fs.constants`. В Windows флаги при необходимости преобразуются в эквиваленты, например `O_WRONLY` в `FILE_GENERIC_WRITE`, а `O_EXCL|O_CREAT` в `CREATE_NEW`, который принимает `CreateFileW`.

Эксклюзивный флаг `'x'` (флаг `O_EXCL` в `open(2)`) приводит к ошибке, если путь уже существует. В POSIX, если путь является символической ссылкой, использование `O_EXCL` возвращает ошибку, даже если ссылка указывает на несуществующий путь. Эксклюзивный флаг может не работать с сетевыми файловыми системами.

В Linux позиционная запись не работает, когда файл открыт в режиме добавления. Ядро игнорирует аргумент позиции и всегда дописывает данные в конец файла.

Чтобы изменить существующий файл вместо его замены, может потребоваться установить `flag` в `'r+'`, а не использовать значение по умолчанию `'w'`.

Поведение некоторых флагов зависит от платформы. Например, открытие каталога на macOS и Linux с флагом `'a+'`, как в примере ниже, завершится ошибкой. Напротив, в Windows и FreeBSD будет возвращён файловый дескриптор или `FileHandle`.

```js
// macOS и Linux
fs.open('<directory>', 'a+', (err, fd) => {
    // => [Error: EISDIR: illegal operation on a directory, open <directory>]
});

// Windows и FreeBSD
fs.open('<directory>', 'a+', (err, fd) => {
    // => null, <fd>
});
```

В Windows открытие существующего скрытого файла с флагом `'w'` (через `fs.open()`, `fs.writeFile()` или `fsPromises.open()`) завершится ошибкой `EPERM`. Для записи в существующие скрытые файлы можно использовать флаг `'r+'`.

Для сброса содержимого файла можно вызвать `fs.ftruncate()` или `filehandle.truncate()`.
