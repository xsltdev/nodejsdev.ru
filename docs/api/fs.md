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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Представлено как `require('fs/promises')`. |
    | v11.14.0, v10.17.0 | Этот API больше не является экспериментальным. |
    | v10.1.0 | API доступен только через `require('fs').promises`. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.1.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v15.14.0, v14.18.0 | Аргумент data поддерживает AsyncIterable, Iterable и Stream. |
    | v14.0.0 | Параметр data больше не будет принуждать неподдерживаемый ввод к строкам. |

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Stream>`](stream.md#stream)
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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0 | Опция `flush` теперь поддерживается. |

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
-   Возвращает: [`<AsyncIterable<Uint8Array[]>>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)

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
    description: Accepts bigint values as `position`.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Принимает значения bigint как позицию. |

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A buffer that will be filled with the file data read.
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The location in the buffer at which to start filling. **По умолчанию:** `0`
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes to read. **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null The location where to begin reading data from the file. If `null` or `-1`, data will be read from the current file position, and the position will be updated. If `position` is a non-negative integer, the current file position will remain unchanged. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills upon success with an object with two properties:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes read
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A reference to the passed in `buffer` argument.

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
    description: Accepts bigint values as `position`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Принимает значения bigint как позицию. |

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A buffer that will be filled with the file data read. **По умолчанию:** `Buffer.alloc(16384)`
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The location in the buffer at which to start filling. **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes to read. **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null The location where to begin reading data from the file. If `null` or `-1`, data will be read from the current file position, and the position will be updated. If `position` is a non-negative integer, the current file position will remain unchanged. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills upon success with an object with two properties:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes read
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A reference to the passed in `buffer` argument.

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
    description: Accepts bigint values as `position`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Принимает значения bigint как позицию. |

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A buffer that will be filled with the file data read.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The location in the buffer at which to start filling. **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes to read. **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null The location where to begin reading data from the file. If `null` or `-1`, data will be read from the current file position, and the position will be updated. If `position` is a non-negative integer, the current file position will remain unchanged. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills upon success with an object with two properties:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes read
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) A reference to the passed in `buffer` argument.

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
    description: Marking the API stable.
  - version:
    - v23.8.0
    - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/55461
    description: Removed option to create a 'bytes' stream. Streams are now always 'bytes' streams.
  - version:
    - v20.0.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/46933
    description: Added option to create a 'bytes' stream.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |
    | v23.8.0, v22.15.0 | Удалена опция создания потока «байтов». Потоки теперь всегда являются «байтовыми» потоками. |
    | v20.0.0, v18.17.0 | Добавлена ​​возможность создания потока «байтов». |

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When true, causes the [FileHandle](#filehandle) to be closed when the stream is closed. **По умолчанию:** `false`
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

While the `ReadableStream` will read the file to completion, it will not close the `FileHandle` automatically. User code must still call the `fileHandle.close()` method unless the `autoClose` option is set to `true`.

#### `filehandle.readFile(options)`

<!-- YAML
added: v10.0.0
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) allows aborting an in-progress readFile
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills upon a successful read with the contents of the file. If no encoding is specified (using `options.encoding`), the data is returned as a [Buffer](buffer.md#buffer) object. Otherwise, the data will be a string.

Asynchronously reads the entire contents of a file.

Если `options` — строка, она задаёт `encoding`.

The [FileHandle](#filehandle) has to support reading.

If one or more `filehandle.read()` calls are made on a file handle and then a `filehandle.readFile()` call is made, the data will be read from the current position till the end of the file. It doesn't always read from the beginning of the file.

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

Convenience method to create a `readline` interface and stream over the file. See [`filehandle.createReadStream()`](#filehandlecreatereadstreamoptions) for the options.

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
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null The offset from the beginning of the file where the data should be read from. If `position` is not a `number`, the data will be read from the current position. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills upon success an object containing two properties:
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the number of bytes read
    -   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) property containing a reference to the `buffers` input.

Read from a file and write to an array of [ArrayBufferView](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)s

#### `filehandle.stat([options])`

<!-- YAML
added: v10.0.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/57775
    description: Now accepts an additional `signal` property to allow aborting the operation.
  - version: v10.5.0
    pr-url: https://github.com/nodejs/node/pull/20220
    description: Accepts an additional `options` object to specify whether the numeric values returned should be bigint.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Теперь принимает дополнительное свойство signal, позволяющее прервать операцию. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) An AbortSignal to cancel the operation. **По умолчанию:** `undefined`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with an [fs.Stats](fs.md#fsstats) for the file.

#### `filehandle.sync()`

<!-- YAML
added: v10.0.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Request that all data for the open file descriptor is flushed to the storage device. The specific implementation is operating system and device specific. Refer to the POSIX fsync(2) documentation for more detail.

#### `filehandle.truncate(len)`

<!-- YAML
added: v10.0.0
-->

-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Truncates the file.

If the file was larger than `len` bytes, only the first `len` bytes will be retained in the file.

The following example retains only the first four bytes of the file:

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

If the file previously was shorter than `len` bytes, it is extended, and the extended part is filled with null bytes (`'\0'`):

If `len` is negative then `0` will be used.

#### `filehandle.utimes(atime, mtime)`

<!-- YAML
added: v10.0.0
-->

-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Change the file system timestamps of the object referenced by the [FileHandle](#filehandle) then fulfills the promise with no arguments upon success.

#### `filehandle.write(buffer, offset[, length[, position]])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `buffer` parameter won't coerce unsupported input to
                 buffers anymore.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Параметр `buffer` больше не будет принудительно помещать неподдерживаемый ввод в буферы. |

-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The start position from within `buffer` where the data to write begins.
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes from `buffer` to write. **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null The offset from the beginning of the file where the data from `buffer` should be written. If `position` is not a `number`, the data will be written at the current position. Подробнее см. POSIX pwrite(2). **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Write `buffer` to the file.

Промис выполняется объектом с двумя свойствами:

-   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the number of bytes written
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) a reference to the `buffer` written.

It is unsafe to use `filehandle.write()` multiple times on the same file without waiting for the promise to be fulfilled (or rejected). For this scenario, use [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

On Linux, positional writes do not work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

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

Write `buffer` to the file.

Similar to the above `filehandle.write` function, this version takes an optional `options` object. If no `options` object is specified, it will default with the above values.

#### `filehandle.write(string[, position[, encoding]])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31030
    description: The `string` parameter won't coerce unsupported input to
                 strings anymore.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Параметр `string` больше не будет приводить к строкам неподдерживаемый ввод. |

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null The offset from the beginning of the file where the data from `string` should be written. If `position` is not a `number` the data will be written at the current position. Подробнее см. POSIX pwrite(2). **По умолчанию:** `null`
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The expected string encoding. **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Write `string` to the file. If `string` is not a string, the promise is rejected with an error.

Промис выполняется объектом с двумя свойствами:

-   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the number of bytes written
-   `buffer` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) a reference to the `string` written.

It is unsafe to use `filehandle.write()` multiple times on the same file without waiting for the promise to be fulfilled (or rejected). For this scenario, use [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

On Linux, positional writes do not work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.14.0, v14.18.0 | Аргумент `data` поддерживает `AsyncIterable`, `Iterable` и `Stream`. |
    | v14.0.0 | Параметр `data` больше не будет принуждать неподдерживаемый ввод к строкам. |

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Stream>`](stream.md#stream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null The expected character encoding when `data` is a string. **По умолчанию:** `'utf8'`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | undefined allows aborting an in-progress writeFile. **По умолчанию:** `undefined`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Asynchronously writes data to a file, replacing the file if it already exists. `data` can be a string, a buffer, an [AsyncIterable](https://tc39.github.io/ecma262/#sec-asynciterable-interface), or an [Iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) object. При успехе промис выполняется без аргументов.

Если `options` — строка, она задаёт `encoding`.

The [FileHandle](#filehandle) has to support writing.

It is unsafe to use `filehandle.writeFile()` multiple times on the same file without waiting for the promise to be fulfilled (or rejected).

If one or more `filehandle.write()` calls are made on a file handle and then a `filehandle.writeFile()` call is made, the data will be written from the current position till the end of the file. It doesn't always write from the beginning of the file.

#### `filehandle.writev(buffers[, position])`

<!-- YAML
added: v12.9.0
-->

-   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null The offset from the beginning of the file where the data from `buffers` should be written. If `position` is not a `number`, the data will be written at the current position. **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Write an array of [ArrayBufferView](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)s to the file.

Промис выполняется объектом с двумя свойствами:

-   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the number of bytes written
-   `buffers` [`<Buffer[]>`](buffer.md#buffer) | [`<TypedArray[]>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) a reference to the `buffers` input.

It is unsafe to call `writev()` multiple times on the same file without waiting for the promise to be fulfilled (or rejected).

On Linux, positional writes don't work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

#### `filehandle.writer([options])`

<!-- YAML
added: v25.9.0
-->

> Stability: 1 - Experimental

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `autoClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Close the file handle when the writer ends or fails. **По умолчанию:** `false`.
    -   `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Byte offset to start writing at. When specified, writes use explicit positioning. **По умолчанию:** current file position.
    -   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Maximum number of bytes the writer will accept. Async writes (`write()`, `writev()`) that would exceed the limit reject with `ERR_OUT_OF_RANGE`. Sync writes (`writeSync()`, `writevSync()`) return `false`. **По умолчанию:** no limit.
    -   `chunkSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Maximum chunk size in bytes for synchronous write operations. Writes larger than this threshold fall back to async I/O. Set this to match the reader's `chunkSize` for optimal `pipeTo()` performance. **По умолчанию:** `131072` (128 KB).
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `write(chunk[, options])` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Returns [`Promise<void>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). Accepts `Uint8Array`, `Buffer`, or string (UTF-8 encoded).
        -   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
        -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
            -   `signal` [`<AbortSignal>`](globals.md#abortsignal) If the signal is already aborted, the write rejects with `AbortError` without performing I/O.
    -   `writev(chunks[, options])` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Returns [`Promise<void>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). Uses scatter/gather I/O via a single `writev()` syscall. Accepts mixed `Uint8Array`/string arrays.
        -   `chunks` [`<Array<Buffer|TypedArray|DataView|string>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
        -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
            -   `signal` [`<AbortSignal>`](globals.md#abortsignal) If the signal is already aborted, the write rejects with `AbortError` without performing I/O.
    -   `writeSync(chunk)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Returns [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type). Attempts a synchronous write. Returns `true` if the write succeeded, `false` if the caller should fall back to async `write()`. Returns `false` when: the writer is closed/errored, an async operation is in flight, the chunk exceeds `chunkSize`, or the write would exceed `limit`.
        -   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `writevSync(chunks)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Returns [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type). Synchronous batch write. Same fallback semantics as `writeSync()`.
        -   `chunks` [`<Array<Buffer|TypedArray|DataView|string>>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
    -   `end([options])` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Returns [`Promise<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) total bytes written. Idempotent: returns `totalBytesWritten` if already closed, returns the pending promise if already closing. Rejects if the writer is in an errored state.
        -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
            -   `signal` [`<AbortSignal>`](globals.md#abortsignal) If the signal is already aborted, `end()` rejects with `AbortError` and the writer remains open.
    -   `endSync()` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Returns [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) total bytes written on success, `-1` if the writer is errored or an async operation is in flight. Idempotent when already closed.
    -   `fail(reason)` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Puts the writer into a terminal error state. Synchronous. If the writer is already closed or errored, this is a no-op. If `autoClose` is true, closes the file handle synchronously.

Return a [`node:stream/iter`](stream_iter.md) writer backed by this file handle.

The writer supports both `Symbol.asyncDispose` and `Symbol.dispose`:

-   `await using w = fh.writer()` — if the writer is still open (no `end()` called), `asyncDispose` calls `fail()`. If `end()` is pending, it waits for it to complete.
-   `using w = fh.writer()` — calls `fail()` unconditionally.

The `writeSync()` and `writevSync()` methods enable the try-sync fast path used by [`stream/iter pipeTo()`](stream_iter.md#pipetosource-transforms-writer). When the reader's chunk size matches the writer's `chunkSize`, all writes in a `pipeTo()` pipeline complete synchronously with zero promise overhead.

This function is only available when the `--experimental-stream-iter` flag is enabled.

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
   description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Calls `filehandle.close()` and returns a promise that fulfills when the filehandle is closed.

### `fsPromises.access(path[, mode])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `fs.constants.F_OK`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Tests a user's permissions for the file or directory specified by `path`. The `mode` argument is an optional integer that specifies the accessibility checks to be performed. `mode` should be either the value `fs.constants.F_OK` or a mask consisting of the bitwise OR of any of `fs.constants.R_OK`, `fs.constants.W_OK`, and `fs.constants.X_OK` (e.g. `fs.constants.W_OK | fs.constants.R_OK`). Check [File access constants][file access constants] for possible values of `mode`.

If the accessibility check is successful, the promise is fulfilled with no value. If any of the accessibility checks fail, the promise is rejected with an [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) object. The following example checks if the file `/etc/passwd` can be read and written by the current process.

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

Using `fsPromises.access()` to check for the accessibility of a file before calling `fsPromises.open()` is not recommended. Doing so introduces a race condition, since other processes may change the file's state between the two calls. Instead, user code should open/read/write the file directly and handle the error raised if the file is not accessible.

### `fsPromises.appendFile(path, data[, options])`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v21.1.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50095
    description: The `flush` option is now supported.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.1.0, v20.10.0 | Опция `flush` теперь поддерживается. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<FileHandle>`](#filehandle) filename or [FileHandle](#filehandle)
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'a'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, the underlying file descriptor is flushed prior to closing it. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Asynchronously append data to a file, creating the file if it does not yet exist. `data` can be a string or a [Buffer](buffer.md#buffer).

Если `options` — строка, она задаёт `encoding`.

The `mode` option only affects the newly created file. See [`fs.open()`](#fsopenpath-flags-mode-callback) for more details.

The `path` may be specified as a [FileHandle](#filehandle) that has been opened for appending (using `fsPromises.open()`).

### `fsPromises.chmod(path, mode)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Changes the permissions of a file.

### `fsPromises.chown(path, uid, gid)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Changes the ownership of a file.

### `fsPromises.copyFile(src, dest[, mode])`

<!-- YAML
added: v10.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/27044
    description: Changed `flags` argument to `mode` and imposed
                 stricter type validation.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Аргумент flags изменен на mode и введена более строгая проверка типов. |

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) source filename to copy
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) destination filename of the copy operation
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Optional modifiers that specify the behavior of the copy operation. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`) **По умолчанию:** `0`.
    -   `fs.constants.COPYFILE_EXCL`: The copy operation will fail if `dest` already exists.
    -   `fs.constants.COPYFILE_FICLONE`: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then a fallback copy mechanism is used.
    -   `fs.constants.COPYFILE_FICLONE_FORCE`: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then the operation will fail.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Asynchronously copies `src` to `dest`. By default, `dest` is overwritten if it already exists.

No guarantees are made about the atomicity of the copy operation. If an error occurs after the destination file has been opened for writing, an attempt will be made to remove the destination.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.3.0 | Этот API больше не является экспериментальным. |
    | v20.1.0, v18.17.0 | Примите дополнительную опцию `mode`, чтобы указать поведение копирования в качестве аргумента `mode` функции `fs.copyFile()`. |
    | v17.6.0, v16.15.0 | Принимает дополнительную опцию `verbatimSymlinks`, чтобы указать, следует ли выполнять разрешение пути для символических ссылок. |

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) source path to copy.
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) destination path to copy to.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `dereference` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) dereference symlinks. **По умолчанию:** `false`.
    -   `errorOnExist` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) when `force` is `false`, and the destination exists, throw an error. **По умолчанию:** `false`.
    -   `filter` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Function to filter copied files/directories. Return `true` to copy the item, `false` to ignore it. When ignoring a directory, all of its contents will be skipped as well. Can also return a `Promise` that resolves to `true` or `false` **По умолчанию:** `undefined`.
        -   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) source path to copy.
        -   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) destination path to copy to.
        -   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) A value that is coercible to `boolean` or a `Promise` that fulfils with such value.
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) overwrite existing file or directory. The copy operation will ignore errors if you set this to false and the destination exists. Use the `errorOnExist` option to change this behavior. **По умолчанию:** `true`.
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) modifiers for copy operation. **По умолчанию:** `0`. See `mode` flag of [`fsPromises.copyFile()`](#fspromisescopyfilesrc-dest-mode).
    -   `preserveTimestamps` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true` timestamps from `src` will be preserved. **По умолчанию:** `false`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) copy directories recursively **По умолчанию:** `false`
    -   `verbatimSymlinks` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, path resolution for symlinks will be skipped. **По умолчанию:** `false`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Asynchronously copies the entire directory structure from `src` to `dest`, including subdirectories and files.

When copying a directory to another directory, globs are not supported and behavior is similar to `cp dir1/ dir2/`.

### `fsPromises.glob(pattern[, options])`

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.1.0, v22.17.0 | Добавлена ​​поддержка экземпляров URL для опции cwd. |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |
    | v23.7.0, v22.14.0 | Добавьте поддержку опции «исключить», чтобы принимать шаблоны glob. |
    | v22.2.0 | Добавьте поддержку withFileTypes в качестве опции. |

-   `pattern` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) current working directory. **По умолчанию:** `process.cwd()`
    -   `exclude` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Function to filter out files/directories or a list of glob patterns to be excluded. If a function is provided, return `true` to exclude the item, `false` to include it. **По умолчанию:** `undefined`. If a string array is provided, each string should be a glob pattern that specifies paths to exclude. Note: Negation patterns (e.g., '!foo.js') are not supported.
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if the glob should return paths as Dirents, `false` otherwise. **По умолчанию:** `false`.
-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) An AsyncIterator that yields the paths of files that match the pattern.

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

> Stability: 0 - Deprecated

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Changes the permissions on a symbolic link.

This method is only implemented on macOS.

### `fsPromises.lchown(path, uid, gid)`

<!-- YAML
added: v10.0.0
changes:
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/21498
    description: This API is no longer deprecated.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.6.0 | Этот API больше не устарел. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Changes the ownership on a symbolic link.

### `fsPromises.lutimes(path, atime, mtime)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Changes the access and modification times of a file in the same way as [`fsPromises.utimes()`](#fspromisesutimespath-atime-mtime), with the difference that if the path refers to a symbolic link, then the link is not dereferenced: instead, the timestamps of the symbolic link itself are changed.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with the [fs.Stats](fs.md#fsstats) object for the given symbolic link `path`.

Equivalent to [`fsPromises.stat()`](#fspromisesstatpath-options) unless `path` refers to a symbolic link, in which case the link itself is stat-ed, not the file that it refers to. Refer to the POSIX lstat(2) document for more detail.

### `fsPromises.mkdir(path[, options])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Not supported on Windows. See [File modes][file modes] for more details. **По умолчанию:** `0o777`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Upon success, fulfills with `undefined` if `recursive` is `false`, or the first directory path created if `recursive` is `true`.

Asynchronously creates a directory.

The optional `options` argument can be an integer specifying `mode` (permission and sticky bits), or an object with a `mode` property and a `recursive` property indicating whether parent directories should be created. Calling `fsPromises.mkdir()` when `path` is a directory that exists results in a rejection only when `recursive` is false.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0, v18.19.0 | Параметр `prefix` теперь принимает буферы и URL. |
    | v16.5.0, v14.18.0 | Параметр `prefix` теперь принимает пустую строку. |

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with a string containing the file system path of the newly created temporary directory.

Creates a unique temporary directory. A unique directory name is generated by appending six random characters to the end of the provided `prefix`. Due to platform inconsistencies, avoid trailing `X` characters in `prefix`. Some platforms, notably the BSDs, can return more than six random characters, and replace trailing `X` characters in `prefix` with random characters.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use.

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

The `fsPromises.mkdtemp()` method will append the six randomly selected characters directly to the `prefix` string. For instance, given a directory `/tmp`, if the intention is to create a temporary directory _within_ `/tmp`, the `prefix` must end with a trailing platform-specific path separator (`require('node:path').sep`).

### `fsPromises.mkdtempDisposable(prefix[, options])`

<!-- YAML
added: v24.4.0
-->

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with a Promise for an async-disposable Object:
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The path of the created directory.
    -   `remove` [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) A function which removes the created directory.
    -   `[Symbol.asyncDispose]` [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The same as `remove`.

The resulting Promise holds an async-disposable object whose `path` property holds the created directory path. When the object is disposed, the directory and its contents will be removed asynchronously if it still exists. If the directory cannot be deleted, disposal will throw an error. The object has an async `remove()` method which will perform the same task.

Both this function and the disposal function on the resulting object are async, so it should be used with `await` + `await using` as in `await using dir = await fsPromises.mkdtempDisposable('prefix')`.

<!-- TODO: link MDN docs for disposables once https://github.com/mdn/content/pull/38027 lands -->

For detailed information, see the documentation of [`fsPromises.mkdtemp()`](#fspromisesmkdtempprefix-options).

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use.

### `fsPromises.open(path, flags[, mode])`

<!-- YAML
added: v10.0.0
changes:
  - version: v11.1.0
    pr-url: https://github.com/nodejs/node/pull/23767
    description: The `flags` argument is now optional and defaults to `'r'`.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v11.1.0 | Аргумент `flags` теперь является необязательным и по умолчанию имеет значение `r`. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Sets the file mode (permission and sticky bits) if the file is created. See [File modes][file modes] for more details. **По умолчанию:** `0o666` (readable and writable)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with a [FileHandle](#filehandle) object.

Opens a [FileHandle](#filehandle).

Refer to the POSIX open(2) documentation for more detail.

Some characters (`< > : " / \ | ? *`) are reserved under Windows as documented by [Naming Files, Paths, and Namespaces][naming files, paths, and namespaces]. Under NTFS, if the filename contains a colon, Node.js will open a file system stream, as described by [this MSDN page][msdn-using-streams].

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Добавлена ​​опция «рекурсивный». |
    | v13.1.0, v12.16.0 | Была введена опция `bufferSize`. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `bufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Number of directory entries that are buffered internally when reading from the directory. Higher values lead to better performance but higher memory usage. **По умолчанию:** `32`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Resolved `Dir` will be an [AsyncIterable](https://tc39.github.io/ecma262/#sec-asynciterable-interface) containing all sub files and directories. **По умолчанию:** `false`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with an [fs.Dir](fs.md#class-fsdir).

Асинхронно открывает каталог для последовательного обхода. Подробнее см. POSIX opendir(3).

Создаёт [fs.Dir](fs.md#class-fsdir) со всеми методами чтения и очистки каталога.

Опция `encoding` задаёт кодировку для `path` при открытии и дальнейших операциях чтения.

Example using async iteration:

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

When using the async iterator, the [fs.Dir](fs.md#class-fsdir) object will be automatically closed after the iterator exits.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Добавлена ​​опция «рекурсивный». |
    | v10.11.0 | Добавлена ​​новая опция withFileTypes. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, reads the contents of a directory recursively. In recursive mode, it will list all files, sub files, and directories. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with an array of the names of the files in the directory excluding `'.'` and `'..'`.

Reads the contents of a directory.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the filenames. If the `encoding` is set to `'buffer'`, the filenames returned will be passed as [Buffer](buffer.md#buffer) objects.

If `options.withFileTypes` is set to `true`, the returned array will contain [fs.Dirent](fs.md#fsdirent) objects.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.2.0, v14.17.0 | Аргумент options может включать AbortSignal для прерывания текущего запроса readFile. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<FileHandle>`](#filehandle) filename or `FileHandle`
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) allows aborting an in-progress readFile
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with the contents of the file.

Asynchronously reads the entire contents of a file.

If no encoding is specified (using `options.encoding`), the data is returned as a [Buffer](buffer.md#buffer) object. Otherwise, the data will be a string.

Если `options` — строка, она задаёт кодировку.

When the `path` is a directory, the behavior of `fsPromises.readFile()` is platform-specific. On macOS, Linux, and Windows, the promise will be rejected with an error. On FreeBSD, a representation of the directory's contents will be returned.

An example of reading a `package.json` file located in the same directory of the running code:

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

It is possible to abort an ongoing `readFile` using an [AbortSignal](globals.md#abortsignal). If a request is aborted the promise returned is rejected with an `AbortError`:

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

Aborting an ongoing request does not abort individual operating system requests but rather the internal buffering `fs.readFile` performs.

Any specified [FileHandle](#filehandle) has to support reading.

### `fsPromises.readlink(path[, options])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with the `linkString` upon success.

Читает содержимое символьной ссылки `path`. Подробнее см. POSIX readlink(2). При успехе промис даёт строку `linkString`.

Необязательный `options` — строка с кодировкой или объект с полем `encoding`. При `encoding: 'buffer'` путь к ссылке возвращается как [Buffer](buffer.md#buffer).

### `fsPromises.realpath(path[, options])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with the resolved path upon success.

Determines the actual location of `path` using the same semantics as the `fs.realpath.native()` function.

Only paths that can be converted to UTF8 strings are supported.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the path. If the `encoding` is set to `'buffer'`, the path returned will be passed as a [Buffer](buffer.md#buffer) object.

On Linux, when Node.js is linked against musl libc, the procfs file system must be mounted on `/proc` in order for this function to work. Glibc does not have this restriction.

### `fsPromises.rename(oldPath, newPath)`

<!-- YAML
added: v10.0.0
-->

-   `oldPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Renames `oldPath` to `newPath`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Удалите опцию «рекурсивный». |
    | v16.0.0 | «Использование `fsPromises.rmdir(path, { recursive: true })` по `path`, который является файлом, больше не разрешено и приводит к ошибке `ENOENT` в Windows и ошибке `ENOTDIR` в POSIX. |
    | v16.0.0 | «Использование `fsPromises.rmdir(path, {recursive: true })` для несуществующего `пути` больше не разрешено и приводит к ошибке `ENOENT`. |
    | v16.0.0 | Опция `recursive` устарела, ее использование вызывает предупреждение об устаревании. |
    | v14.14.0 | Параметр «рекурсивный» устарел, вместо него используйте «fsPromises.rm». |
    | v13.3.0, v12.16.0 | Параметр maxBusyTries переименован в maxRetries, и его значение по умолчанию равно 0. Параметр emfileWait удален, а ошибки EMFILE используют ту же логику повтора, что и другие ошибки. Опция `retryDelay` теперь поддерживается. Ошибки `ENFILE` теперь повторяются. |
    | v12.10.0 | Параметры recursive, maxBusyTries и emfileWait теперь поддерживаются. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) There are currently no options exposed. There used to be options for `recursive`, `maxBusyTries`, and `emfileWait` but they were deprecated and removed. The `options` argument is still accepted for backwards compatibility but it is not used.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Removes the directory identified by `path`.

Using `fsPromises.rmdir()` on a file (not a directory) results in the promise being rejected with an `ENOENT` error on Windows and an `ENOTDIR` error on POSIX.

To get a behavior similar to the `rm -rf` Unix command, use [`fsPromises.rm()`](#fspromisesrmpath-options) with options `{ recursive: true, force: true }`.

### `fsPromises.rm(path[, options])`

<!-- YAML
added: v14.14.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, exceptions will be ignored if `path` does not exist. **По умолчанию:** `false`.
    -   `maxRetries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If an `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, or `EPERM` error is encountered, Node.js will retry the operation with a linear backoff wait of `retryDelay` milliseconds longer on each try. This option represents the number of retries. This option is ignored if the `recursive` option is not `true`. **По умолчанию:** `0`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, perform a recursive directory removal. In recursive mode operations are retried on failure. **По умолчанию:** `false`.
    -   `retryDelay` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The amount of time in milliseconds to wait between retries. This option is ignored if the `recursive` option is not `true`. **По умолчанию:** `100`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Removes files and directories (modeled on the standard POSIX `rm` utility).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.7.0 | Принимает опцию `throwIfNoEntry`, чтобы указать, должно ли создаваться исключение, если запись не существует. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether an exception will be thrown if no file system entry exists, rather than returning `undefined`. **По умолчанию:** `true`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with the [fs.Stats](fs.md#fsstats) object for the given `path`.

### `fsPromises.statfs(path[, options])`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.StatFs](fs.md#fsstatfs) object should be `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with the [fs.StatFs](fs.md#fsstatfs) object for the given `path`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.0.0 | Если аргумент `type` имеет значение null или опущен, Node.js автоматически определит тип `target` и автоматически выберет `dir` или `file`. |

-   `target` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Creates a symbolic link.

The `type` argument is only used on Windows platforms and can be one of `'dir'`, `'file'`, or `'junction'`. If the `type` argument is `null`, Node.js will autodetect `target` type and use `'file'` or `'dir'`. If the `target` does not exist, `'file'` will be used. Windows junction points require the destination path to be absolute. When using `'junction'`, the `target` argument will automatically be normalized to absolute path. Junction points on NTFS volumes can only point to directories.

### `fsPromises.truncate(path[, len])`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Truncates (shortens or extends the length) of the content at `path` to `len` bytes.

### `fsPromises.unlink(path)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

If `path` refers to a symbolic link, then the link is removed without affecting the file or directory to which that link refers. If the `path` refers to a file path that is not a symbolic link, the file is deleted. Подробнее см. POSIX unlink(2).

### `fsPromises.utimes(path, atime, mtime)`

<!-- YAML
added: v10.0.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Change the file system timestamps of the object referenced by `path`.

The `atime` and `mtime` arguments follow these rules:

-   Values can be either numbers representing Unix epoch time, `Date`s, or a numeric string like `'123456789.0'`.
-   If the value can not be converted to a number, or is `NaN`, `Infinity`, or `-Infinity`, an `Error` will be thrown.

### `fsPromises.watch(filename[, options])`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `persistent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether the process should continue to run as long as files are being watched. **По умолчанию:** `true`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether all subdirectories should be watched, or only the current directory. This applies when a directory is specified, and only on supported platforms (See [caveats][caveats]). **По умолчанию:** `false`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Specifies the character encoding to be used for the filename passed to the listener. **По умолчанию:** `'utf8'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) An [AbortSignal](globals.md#abortsignal) used to signal when the watcher should stop.
    -   `maxQueue` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Specifies the number of events to queue between iterations of the [AsyncIterator](https://tc39.github.io/ecma262/#sec-asynciterator-interface) returned. **По умолчанию:** `2048`.
    -   `overflow` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Either `'ignore'` or `'throw'` when there are more events to be queued than `maxQueue` allows. `'ignore'` means overflow events are dropped and a warning is emitted, while `'throw'` means to throw an exception. **По умолчанию:** `'ignore'`.
    -   `ignore` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Pattern(s) to ignore. Strings are glob patterns (using [`minimatch`](https://github.com/isaacs/minimatch)), RegExp patterns are tested against the filename, and functions receive the filename and return `true` to ignore. **По умолчанию:** `undefined`.
-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) of objects with the properties:
    -   `eventType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The type of change
    -   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | null The name of the file changed.

Returns an async iterator that watches for changes on `filename`, where `filename` is either a file or a directory.

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

On most platforms, `'rename'` is emitted whenever a filename appears or disappears in the directory.

All the [caveats][caveats] for `fs.watch()` also apply to `fsPromises.watch()`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v15.14.0, v14.18.0 | Аргумент data поддерживает AsyncIterable, Iterable и Stream. |
    | v15.2.0, v14.17.0 | Аргумент options может включать AbortSignal для прерывания текущего запроса writeFile. |
    | v14.0.0 | Параметр data больше не будет принуждать неподдерживаемый ввод к строкам. |

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<FileHandle>`](#filehandle) filename or `FileHandle`
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<Stream>`](stream.md#stream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'w'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If all data is successfully written to the file, and `flush` is `true`, `filehandle.sync()` is used to flush the data. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) allows aborting an in-progress writeFile
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with `undefined` upon success.

Asynchronously writes data to a file, replacing the file if it already exists. `data` can be a string, a buffer, an [AsyncIterable](https://tc39.github.io/ecma262/#sec-asynciterable-interface), or an [Iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) object.

The `encoding` option is ignored if `data` is a buffer.

Если `options` — строка, она задаёт кодировку.

The `mode` option only affects the newly created file. See [`fs.open()`](#fsopenpath-flags-mode-callback) for more details.

Any specified [FileHandle](#filehandle) has to support writing.

It is unsafe to use `fsPromises.writeFile()` multiple times on the same file without waiting for the promise to be settled.

Similarly to `fsPromises.readFile` - `fsPromises.writeFile` is a convenience method that performs multiple `write` calls internally to write the buffer passed to it. For performance sensitive code consider using [`fs.createWriteStream()`](#fscreatewritestreampath-options) or [`filehandle.createWriteStream()`](#filehandlecreatewritestreamoptions).

It is possible to use an [AbortSignal](globals.md#abortsignal) to cancel an `fsPromises.writeFile()`. Cancelation is "best effort", and some amount of data is likely still to be written.

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

Aborting an ongoing request does not abort individual operating system requests but rather the internal buffering `fs.writeFile` performs.

### `fsPromises.constants`

<!-- YAML
added:
  - v18.4.0
  - v16.17.0
-->

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Returns an object containing commonly used constants for file system operations. The object is the same as `fs.constants`. See [FS constants][fs constants] for more details.

## Callback API

The callback APIs perform all operations asynchronously, without blocking the event loop, then invoke a callback function upon completion or error.

The callback APIs use the underlying Node.js threadpool to perform file system operations off the event loop thread. These operations are not synchronized or threadsafe. Care must be taken when performing multiple concurrent modifications on the same file or data corruption may occur.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Константы `fs.F_OK`, `fs.R_OK`, `fs.W_OK` и `fs.X_OK`, которые присутствовали непосредственно в `fs`, удалены. |
    | v20.8.0 | Константы `fs.F_OK`, `fs.R_OK`, `fs.W_OK` и `fs.X_OK`, которые присутствовали непосредственно в `fs`, считаются устаревшими. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v6.3.0 | Константы типа fs.R_OK и т. д., которые присутствовали непосредственно в fs, были перенесены в fs.constants в качестве мягкого устаревания. Таким образом, для Node.js `< v6.3.0` используйте `fs` для доступа к этим константам или сделайте что-то вроде `(fs.constants \|\| fs).R_OK` для работы со всеми версиями. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `fs.constants.F_OK`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Tests a user's permissions for the file or directory specified by `path`. The `mode` argument is an optional integer that specifies the accessibility checks to be performed. `mode` should be either the value `fs.constants.F_OK` or a mask consisting of the bitwise OR of any of `fs.constants.R_OK`, `fs.constants.W_OK`, and `fs.constants.X_OK` (e.g. `fs.constants.W_OK | fs.constants.R_OK`). Check [File access constants][file access constants] for possible values of `mode`.

The final argument, `callback`, is a callback function that is invoked with a possible error argument. If any of the accessibility checks fail, the error argument will be an `Error` object. The following examples check if `package.json` exists, and if it is readable or writable.

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

Do not use `fs.access()` to check for the accessibility of a file before calling `fs.open()`, `fs.readFile()`, or `fs.writeFile()`. Doing so introduces a race condition, since other processes may change the file's state between the two calls. Instead, user code should open/read/write the file directly and handle the error raised if the file is not accessible.

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

The "not recommended" examples above check for accessibility and then use the file; the "recommended" examples are better because they use the file directly and handle the error, if any.

In general, check for the accessibility of a file only if the file will not be used directly, for example when its accessibility is a signal from another process.

On Windows, access-control policies (ACLs) on a directory may limit access to a file or directory. The `fs.access()` function, however, does not check the ACL and therefore may report that a path is accessible even if the ACL restricts the user from reading or writing to it.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.1.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v7.0.0 | Переданный объект `options` никогда не будет изменен. |
    | v5.0.0 | Параметр `file` теперь может быть дескриптором файла. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'a'`.
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, the underlying file descriptor is flushed prior to closing it. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously append data to a file, creating the file if it does not yet exist. `data` can be a string or a [Buffer](buffer.md#buffer).

The `mode` option only affects the newly created file. See [`fs.open()`](#fsopenpath-flags-mode-callback) for more details.

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

The `path` may be specified as a numeric file descriptor that has been opened for appending (using `fs.open()` or `fs.openSync()`). The file descriptor will not be closed automatically.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously changes the permissions of a file. No arguments other than a possible exception are given to the completion callback.

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

The `mode` argument used in both the `fs.chmod()` and `fs.chmodSync()` methods is a numeric bitmask created using a logical OR of the following constants:

| Constant | Octal | Description |
| --- | --- | --- |
| `fs.constants.S_IRUSR` | `0o400` | read by owner |
| `fs.constants.S_IWUSR` | `0o200` | write by owner |
| `fs.constants.S_IXUSR` | `0o100` | execute/search by owner |
| `fs.constants.S_IRGRP` | `0o40` | read by group |
| `fs.constants.S_IWGRP` | `0o20` | write by group |
| `fs.constants.S_IXGRP` | `0o10` | execute/search by group |
| `fs.constants.S_IROTH` | `0o4` | read by others |
| `fs.constants.S_IWOTH` | `0o2` | write by others |
| `fs.constants.S_IXOTH` | `0o1` | execute/search by others |

An easier method of constructing the `mode` is to use a sequence of three octal digits (e.g. `765`). The left-most digit (`7` in the example), specifies the permissions for the file owner. The middle digit (`6` in the example), specifies permissions for the group. The right-most digit (`5` in the example), specifies the permissions for others.

| Number | Description              |
| ------ | ------------------------ |
| `7`    | read, write, and execute |
| `6`    | read and write           |
| `5`    | read and execute         |
| `4`    | read only                |
| `3`    | write and execute        |
| `2`    | write only               |
| `1`    | execute only             |
| `0`    | no permission            |

For example, the octal value `0o765` means:

-   The owner may read, write, and execute the file.
-   The group may read and write the file.
-   Others may read and execute the file.

When using raw numbers where file modes are expected, any value larger than `0o777` may result in platform-specific behaviors that are not supported to work consistently. Therefore constants like `S_ISVTX`, `S_ISGID`, or `S_ISUID` are not exposed in `fs.constants`.

Caveats: on Windows only the write permission can be changed, and the distinction among the permissions of group, owner, or others is not implemented.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously changes owner and group of a file. No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v15.9.0, v14.17.0 | Обратный вызов по умолчанию теперь используется, если он не указан. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Closes the file descriptor. No arguments other than a possible exception are given to the completion callback.

Calling `fs.close()` on any file descriptor (`fd`) that is currently in use through any other `fs` operation may lead to undefined behavior.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v14.0.0 | Аргумент flags изменен на mode и введена более строгая проверка типов. |

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) source filename to copy
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) destination filename of the copy operation
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) modifiers for copy operation. **По умолчанию:** `0`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously copies `src` to `dest`. By default, `dest` is overwritten if it already exists. No arguments other than a possible exception are given to the callback function. Node.js makes no guarantees about the atomicity of the copy operation. If an error occurs after the destination file has been opened for writing, Node.js will attempt to remove the destination.

`mode` is an optional integer that specifies the behavior of the copy operation. It is possible to create a mask consisting of the bitwise OR of two or more values (e.g. `fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE`).

-   `fs.constants.COPYFILE_EXCL`: The copy operation will fail if `dest` already exists.
-   `fs.constants.COPYFILE_FICLONE`: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then a fallback copy mechanism is used.
-   `fs.constants.COPYFILE_FICLONE_FORCE`: The copy operation will attempt to create a copy-on-write reflink. If the platform does not support copy-on-write, then the operation will fail.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.3.0 | Этот API больше не является экспериментальным. |
    | v20.1.0, v18.17.0 | Примите дополнительную опцию `mode`, чтобы указать поведение копирования в качестве аргумента `mode` функции `fs.copyFile()`. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v17.6.0, v16.15.0 | Принимает дополнительную опцию `verbatimSymlinks`, чтобы указать, следует ли выполнять разрешение пути для символических ссылок. |

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) source path to copy.
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) destination path to copy to.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `dereference` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) dereference symlinks. **По умолчанию:** `false`.
    -   `errorOnExist` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) when `force` is `false`, and the destination exists, throw an error. **По умолчанию:** `false`.
    -   `filter` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Function to filter copied files/directories. Return `true` to copy the item, `false` to ignore it. When ignoring a directory, all of its contents will be skipped as well. Can also return a `Promise` that resolves to `true` or `false` **По умолчанию:** `undefined`.
        -   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) source path to copy.
        -   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) destination path to copy to.
        -   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) A value that is coercible to `boolean` or a `Promise` that fulfils with such value.
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) overwrite existing file or directory. The copy operation will ignore errors if you set this to false and the destination exists. Use the `errorOnExist` option to change this behavior. **По умолчанию:** `true`.
    -   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) modifiers for copy operation. **По умолчанию:** `0`. See `mode` flag of [`fs.copyFile()`](#fscopyfilesrc-dest-mode-callback).
    -   `preserveTimestamps` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true` timestamps from `src` will be preserved. **По умолчанию:** `false`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) copy directories recursively **По умолчанию:** `false`
    -   `verbatimSymlinks` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, path resolution for symlinks will be skipped. **По умолчанию:** `false`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously copies the entire directory structure from `src` to `dest`, including subdirectories and files.

When copying a directory to another directory, globs are not supported and behavior is similar to `cp dir1/ dir2/`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.10.0 | Опция `fs` не требует метода `open`, если был предоставлен `fd`. |
    | v16.10.0 | Опция `fs` не требует метода close, если `autoClose` имеет значение false. |
    | v15.5.0 | Добавьте поддержку AbortSignal. |
    | v15.4.0 | Опция `fd` принимает аргументы FileHandle. |
    | v14.0.0 | Измените значение по умолчанию `emitClose` на `true`. |
    | v13.6.0, v12.17.0 | Опции `fs` позволяют переопределить используемую реализацию `fs`. |
    | v12.10.0 | Включите опцию emitClose. |
    | v11.0.0 | Наложите новые ограничения на «начало» и «конец», выдавая более подходящие ошибки в тех случаях, когда мы не можем разумно обработать входные значения. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Переданный объект `options` никогда не будет изменен. |
    | v2.3.0 | Передаваемый объект `options` теперь может быть строкой. |

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

`options` can include `start` and `end` values to read a range of bytes from the file instead of the entire file. Both `start` and `end` are inclusive and start counting at 0, allowed values are in the \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)] range. If `fd` is specified and `start` is omitted or `undefined`, `fs.createReadStream()` reads sequentially from the current file position. The `encoding` can be any one of those accepted by [Buffer](buffer.md#buffer).

If `fd` is specified, `ReadStream` will ignore the `path` argument and will use the specified file descriptor. This means that no `'open'` event will be emitted. `fd` should be blocking; non-blocking `fd`s should be passed to [net.Socket](net.md#class-netsocket).

If `fd` points to a character device that only supports blocking reads (such as keyboard or sound card), read operations do not finish until data is available. This can prevent the process from exiting and the stream from closing naturally.

By default, the stream will emit a `'close'` event after it has been destroyed. Set the `emitClose` option to `false` to change this behavior.

By providing the `fs` option, it is possible to override the corresponding `fs` implementations for `open`, `read`, and `close`. When providing the `fs` option, an override for `read` is required. If no `fd` is provided, an override for `open` is also required. If `autoClose` is `true`, an override for `close` is also required.

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

If `autoClose` is false, then the file descriptor won't be closed, even if there's an error. It is the application's responsibility to close it and make sure there's no file descriptor leak. If `autoClose` is set to true (default behavior), on `'error'` or `'end'` the file descriptor will be closed automatically.

`mode` sets the file mode (permission and sticky bits), but only if the file was created.

An example to read the last 10 bytes of a file which is 100 bytes long:

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v16.10.0 | Опция `fs` не требует метода `open`, если был предоставлен `fd`. |
    | v16.10.0 | Опция `fs` не требует метода close, если `autoClose` имеет значение false. |
    | v15.5.0 | Добавьте поддержку AbortSignal. |
    | v15.4.0 | Опция `fd` принимает аргументы FileHandle. |
    | v14.0.0 | Измените значение по умолчанию `emitClose` на `true`. |
    | v13.6.0, v12.17.0 | Опции `fs` позволяют переопределить используемую реализацию `fs`. |
    | v12.10.0 | Включите опцию emitClose. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Переданный объект `options` никогда не будет изменен. |
    | v5.5.0 | Опция `autoClose` теперь поддерживается. |
    | v2.3.0 | Передаваемый объект `options` теперь может быть строкой. |

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
    -   `flush` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, the underlying file descriptor is flushed prior to closing it. **По умолчанию:** `false`.
-   Возвращает: [`<fs.WriteStream>`](fs.md#fswritestream)

`options` may also include a `start` option to allow writing data at some position past the beginning of the file, allowed values are in the \[0, [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)] range. Modifying a file rather than replacing it may require the `flags` option to be set to `r+` rather than the default `w`. The `encoding` can be any one of those accepted by [Buffer](buffer.md#buffer).

If `autoClose` is set to true (default behavior) on `'error'` or `'finish'` the file descriptor will be closed automatically. If `autoClose` is false, then the file descriptor won't be closed, even if there's an error. It is the application's responsibility to close it and make sure there's no file descriptor leak.

By default, the stream will emit a `'close'` event after it has been destroyed. Set the `emitClose` option to `false` to change this behavior.

By providing the `fs` option it is possible to override the corresponding `fs` implementations for `open`, `write`, `writev`, and `close`. Overriding `write()` without `writev()` can reduce performance as some optimizations (`_writev()`) will be disabled. When providing the `fs` option, overrides for at least one of `write` and `writev` are required. If no `fd` option is supplied, an override for `open` is also required. If `autoClose` is `true`, an override for `close` is also required.

Like [fs.ReadStream](fs.md#class-fsreadstream), if `fd` is specified, [fs.WriteStream](fs.md#fswritestream) will ignore the `path` argument and will use the specified file descriptor. This means that no `'open'` event will be emitted. `fd` should be blocking; non-blocking `fd`s should be passed to [net.Socket](net.md#class-netsocket).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

> Stability: 0 - Deprecated: Use [`fs.stat()`](#fsstatpath-options-callback) or [`fs.access()`](#fsaccesspath-mode-callback) instead.

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `exists` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Test whether or not the element at the given `path` exists by checking with the file system. Then call the `callback` argument with either true or false:

=== "MJS"

    ```js
    import { exists } from 'node:fs';

    exists('/etc/passwd', (e) => {
      console.log(e ? 'it exists' : 'no passwd!');
    });
    ```

**The parameters for this callback are not consistent with other Node.js callbacks.** Normally, the first parameter to a Node.js callback is an `err` parameter, optionally followed by other parameters. The `fs.exists()` callback has only one boolean parameter. This is one reason `fs.access()` is recommended instead of `fs.exists()`.

If `path` is a symbolic link, it is followed. Thus, if `path` exists but points to a non-existent element, the callback will receive the value `false`.

Using `fs.exists()` to check for the existence of a file before calling `fs.open()`, `fs.readFile()`, or `fs.writeFile()` is not recommended. Doing so introduces a race condition, since other processes may change the file's state between the two calls. Instead, user code should open/read/write the file directly and handle the error raised if the file does not exist.

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

The "not recommended" examples above check for existence and then use the file; the "recommended" examples are better because they use the file directly and handle the error, if any.

In general, check for the existence of a file only if the file won't be used directly, for example when its existence is a signal from another process.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Sets the permissions on the file. No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Sets the owner of the file. No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Forces all currently queued I/O operations associated with the file to the operating system's synchronized I/O completion state. Refer to the POSIX fdatasync(2) documentation for details. No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.Stats>`](fs.md#fsstats)

Invokes the callback with the [fs.Stats](fs.md#fsstats) for the file descriptor.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Request that all data for the open file descriptor is flushed to the storage device. The specific implementation is operating system and device specific. Refer to the POSIX fsync(2) documentation for more detail. No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Truncates the file descriptor. No arguments other than a possible exception are given to the completion callback.

Подробнее см. POSIX ftruncate(2).

If the file referred to by the file descriptor was larger than `len` bytes, only the first `len` bytes will be retained in the file.

For example, the following program retains only the first four bytes of the file:

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

If the file previously was shorter than `len` bytes, it is extended, and the extended part is filled with null bytes (`'\0'`):

If `len` is negative then `0` will be used.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v4.1.0 | Числовые строки, NaN и Infinity теперь разрешены как спецификаторы времени. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.1.0, v22.17.0 | Добавлена ​​поддержка экземпляров URL для опции cwd. |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |
    | v23.7.0, v22.14.0 | Добавьте поддержку опции «исключить», чтобы принимать шаблоны glob. |
    | v22.2.0 | Добавьте поддержку withFileTypes в качестве опции. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v16.0.0 | Возвращаемая ошибка может быть AggregateError, если возвращается более одной ошибки. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

> Stability: 0 - Deprecated

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)

Changes the permissions on a symbolic link. No arguments other than a possible exception are given to the completion callback.

This method is only implemented on macOS.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.6.0 | Этот API больше не устарел. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v0.4.7 | Прекращение поддержки только документации. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Set the owner of the symbolic link. No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Changes the access and modification times of a file in the same way as [`fs.utimes()`](#fsutimespath-atime-mtime-callback), with the difference that if the path refers to a symbolic link, then the link is not dereferenced: instead, the timestamps of the symbolic link itself are changed.

No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметры existingPath и newPath могут быть объектами URL WHATWG, использующими протокол file:. В настоящее время поддержка все еще _экспериментальная_. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `existingPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Создаёт новую жёсткую ссылку с `existingPath` на `newPath`. Подробнее см. POSIX link(2). No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.Stats>`](fs.md#fsstats)

Retrieves the [fs.Stats](fs.md#fsstats) for the symbolic link referred to by the path. The callback gets two arguments `(err, stats)` where `stats` is a [fs.Stats](fs.md#fsstats) object. `lstat()` is identical to `stat()`, except that if `path` is a symbolic link, then the link itself is stat-ed, not the file that it refers to.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v13.11.0, v12.17.0 | В рекурсивном режиме обратный вызов теперь получает в качестве аргумента первый созданный путь. |
    | v10.12.0 | Вторым аргументом теперь может быть объект options со свойствами recursive и mode. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Not supported on Windows. See [File modes][file modes] for more details. **По умолчанию:** `0o777`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Present only if a directory is created with `recursive` set to `true`.

Asynchronously creates a directory.

The callback is given a possible exception and, if `recursive` is `true`, the first directory path created, `(err[, path])`. `path` can still be `undefined` when `recursive` is `true`, if no directory was created (for instance, if it was previously created).

The optional `options` argument can be an integer specifying `mode` (permission and sticky bits), or an object with a `mode` property and a `recursive` property indicating whether parent directories should be created. Calling `fs.mkdir()` when `path` is a directory that exists results in an error only when `recursive` is false. If `recursive` is false and the directory exists, an `EEXIST` error occurs.

=== "MJS"

    ```js
    import { mkdir } from 'node:fs';

    // Create ./tmp/a/apple, regardless of whether ./tmp and ./tmp/a exist.
    mkdir('./tmp/a/apple', { recursive: true }, (err) => {
      if (err) throw err;
    });
    ```

On Windows, using `fs.mkdir()` on the root directory even with recursion will result in an error:

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0, v18.19.0 | Параметр `prefix` теперь принимает буферы и URL. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v16.5.0, v14.18.0 | Параметр `prefix` теперь принимает пустую строку. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v6.2.1 | Параметр `callback` теперь является необязательным. |

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `directory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Creates a unique temporary directory.

Generates six random characters to be appended behind a required `prefix` to create a unique temporary directory. Due to platform inconsistencies, avoid trailing `X` characters in `prefix`. Some platforms, notably the BSDs, can return more than six random characters, and replace trailing `X` characters in `prefix` with random characters.

The created directory path is passed as a string to the callback's second parameter.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use.

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

The `fs.mkdtemp()` method will append the six randomly selected characters directly to the `prefix` string. For instance, given a directory `/tmp`, if the intention is to create a temporary directory _within_ `/tmp`, the `prefix` must end with a trailing platform-specific path separator (`require('node:path').sep`).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v11.1.0 | Аргумент flags теперь является необязательным и по умолчанию имеет значение r. |
    | v9.9.0 | Флаги `as` и `as+` теперь поддерживаются. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666` (readable and writable)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Asynchronous file open. Подробнее см. POSIX open(2).

`mode` sets the file mode (permission and sticky bits), but only if the file was created. On Windows, only the write permission can be manipulated; see [`fs.chmod()`](#fschmodpath-mode-callback).

The callback gets two arguments `(err, fd)`.

Some characters (`< > : " / \ | ? *`) are reserved under Windows as documented by [Naming Files, Paths, and Namespaces][naming files, paths, and namespaces]. Under NTFS, if the filename contains a colon, Node.js will open a file system stream, as described by [this MSDN page][msdn-using-streams].

Functions based on `fs.open()` exhibit this behavior as well: `fs.writeFile()`, `fs.readFile()`, etc.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An optional mime type for the blob.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) upon success.

Returns a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) whose data is backed by the given file.

The file must not be modified after the [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) is created. Any modifications will cause reading the [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) data to fail with a `DOMException` error. Synchronous stat operations on the file when the `Blob` is created, and before each read in order to detect whether the file data has been modified on disk.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Добавлена ​​опция «рекурсивный». |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v13.1.0, v12.16.0 | Была введена опция `bufferSize`. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `bufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Number of directory entries that are buffered internally when reading from the directory. Higher values lead to better performance but higher memory usage. **По умолчанию:** `32`
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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.10.0 | Параметром `buffer` теперь может быть любой `TypedArray` или `DataView`. |
    | v7.4.0 | Параметр `buffer` теперь может быть `Uint8Array`. |
    | v6.0.0 | Параметр length теперь может быть равен 0. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) The buffer that the data will be written to.
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The position in `buffer` to write the data to.
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of bytes to read.
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null Specifies where to begin reading from in the file. If `position` is `null` or `-1 `, data will be read from the current file position, and the file position will be updated. If `position` is a non-negative integer, the file position will be unchanged.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer)

Read data from the file specified by `fd`.

The callback is given the three arguments, `(err, bytesRead, buffer)`.

If the file is not modified concurrently, the end-of-file is reached when the number of bytes read is zero.

If this method is invoked as its [`util.promisify()`](util.md#utilpromisifyoriginal)ed version, it returns a promise for an `Object` with `bytesRead` and `buffer` properties.

The `fs.read()` method reads data from the file specified by the file descriptor (`fd`). The `length` argument indicates the maximum number of bytes that Node.js will attempt to read from the kernel. However, the actual number of bytes read (`bytesRead`) can be lower than the specified `length` for various reasons.

For example:

-   If the file is shorter than the specified `length`, `bytesRead` will be set to the actual number of bytes read.
-   If the file encounters EOF (End of File) before the buffer could be filled, Node.js will read all available bytes until EOF is encountered, and the `bytesRead` parameter in the callback will indicate the actual number of bytes read, which may be less than the specified `length`.
-   If the file is on a slow network `filesystem` or encounters any other issue during reading, `bytesRead` can be lower than the specified `length`.

Therefore, when using `fs.read()`, it's important to check the `bytesRead` value to determine how many bytes were actually read from the file. Depending on your application logic, you may need to handle cases where `bytesRead` is lower than the specified `length`, such as by wrapping the read call in a loop if you require a minimum amount of bytes.

This behavior is similar to the POSIX `preadv2` function.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.11.0, v12.17.0 | Можно передать объект параметров, чтобы сделать буфер, смещение, длину и позицию необязательными. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Добавлена ​​опция «рекурсивный». |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.10.0 | Добавлена ​​новая опция withFileTypes. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v6.0.0 | Добавлен параметр `options`. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, reads the contents of a directory recursively. In recursive mode, it will list all files, sub files and directories. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `files` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer[]>`](buffer.md#buffer) | [`<fs.Dirent[]>`](fs.md#fsdirent)

Reads the contents of a directory. The callback gets two arguments `(err, files)` where `files` is an array of the names of the files in the directory excluding `'.'` and `'..'`.

Подробнее см. POSIX readdir(3).

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the filenames passed to the callback. If the `encoding` is set to `'buffer'`, the filenames returned will be passed as [Buffer](buffer.md#buffer) objects.

If `options.withFileTypes` is set to `true`, the `files` array will contain [fs.Dirent](fs.md#fsdirent) objects.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v16.0.0 | Возвращаемая ошибка может быть AggregateError, если возвращается более одной ошибки. |
    | v15.2.0, v14.17.0 | Аргумент options может включать AbortSignal для прерывания текущего запроса readFile. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v5.1.0 | В случае успеха обратный вызов всегда будет вызываться с нулевым значением параметра error. |
    | v5.0.0 | Параметр `path` теперь может быть дескриптором файла. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) allows aborting an in-progress readFile
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)
    -   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Asynchronously reads the entire contents of a file.

=== "MJS"

    ```js
    import { readFile } from 'node:fs';

    readFile('/etc/passwd', (err, data) => {
      if (err) throw err;
      console.log(data);
    });
    ```

The callback is passed two arguments `(err, data)`, where `data` is the contents of the file.

If no encoding is specified, then the raw buffer is returned.

Если `options` — строка, она задаёт кодировку:

=== "MJS"

    ```js
    import { readFile } from 'node:fs';

    readFile('/etc/passwd', 'utf8', callback);
    ```

When the path is a directory, the behavior of `fs.readFile()` and [`fs.readFileSync()`](#fsreadfilesyncpath-options) is platform-specific. On macOS, Linux, and Windows, an error will be returned. On FreeBSD, a representation of the directory's contents will be returned.

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

It is possible to abort an ongoing request using an `AbortSignal`. If a request is aborted the callback is called with an `AbortError`:

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

The `fs.readFile()` function buffers the entire file. To minimize memory costs, when possible prefer streaming via `fs.createReadStream()`.

Aborting an ongoing request does not abort individual operating system requests but rather the internal buffering `fs.readFile` performs.

#### File descriptors

1. Any specified file descriptor has to support reading.
2. If a file descriptor is specified as the `path`, it will not be closed automatically.
3. The reading will begin at the current position. For example, if the file already had `'Hello World'` and six bytes are read with the file descriptor, the call to `fs.readFile()` with the same file descriptor, would give `'World'`, rather than `'Hello World'`.

#### Performance Considerations

The `fs.readFile()` method asynchronously reads the contents of a file into memory one chunk at a time, allowing the event loop to turn between each chunk. This allows the read operation to have less impact on other activity that may be using the underlying libuv thread pool but means that it will take longer to read a complete file into memory.

The additional read overhead can vary broadly on different systems and depends on the type of file being read. If the file type is not a regular file (a pipe for instance) and Node.js is unable to determine an actual file size, each read operation will load on 64 KiB of data. For regular files, each read will process 512 KiB of data.

For applications that require as-fast-as-possible reading of file contents, it is better to use `fs.read()` directly and for application code to manage reading the full contents of the file itself.

The Node.js GitHub issue [#25741][#25741] provides more information and a detailed analysis on the performance of `fs.readFile()` for multiple file sizes in different Node.js versions.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `linkString` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Reads the contents of the symbolic link referred to by `path`. The callback gets two arguments `(err, linkString)`.

Подробнее см. POSIX readlink(2).

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the link path passed to the callback. If the `encoding` is set to `'buffer'`, the link path returned will be passed as a [Buffer](buffer.md#buffer) object.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

Read from a file specified by `fd` and write to an array of `ArrayBufferView`s using `readv()`.

`position` is the offset from the beginning of the file from where data should be read. If `typeof position !== 'number'`, the data will be read from the current position.

The callback will be given three arguments: `err`, `bytesRead`, and `buffers`. `bytesRead` is how many bytes were read from the file.

If this method is invoked as its [`util.promisify()`](util.md#utilpromisifyoriginal)ed version, it returns a promise for an `Object` with `bytesRead` and `buffers` properties.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v8.0.0 | Была добавлена ​​поддержка разрешения труб/сокетов. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v6.4.0 | Вызов Realpath теперь снова работает в различных крайних случаях в Windows. |
    | v6.0.0 | Параметр `cache` был удален. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `resolvedPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Asynchronously computes the canonical pathname by resolving `.`, `..`, and symbolic links.

A canonical pathname is not necessarily unique. Hard links and bind mounts can expose a file system entity through many pathnames.

This function behaves like realpath(3), with some exceptions:

1. No case conversion is performed on case-insensitive file systems.

2. The maximum number of symbolic links is platform-independent and generally (much) higher than what the native realpath(3) implementation supports.

The `callback` gets two arguments `(err, resolvedPath)`. May use `process.cwd` to resolve relative paths.

Only paths that can be converted to UTF8 strings are supported.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the path passed to the callback. If the `encoding` is set to `'buffer'`, the path returned will be passed as a [Buffer](buffer.md#buffer) object.

If `path` resolves to a socket or a pipe, the function will return a system dependent name for that object.

A path that does not exist results in an ENOENT error. `error.path` is the absolute file path.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `resolvedPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Asynchronous realpath(3).

The `callback` gets two arguments `(err, resolvedPath)`.

Only paths that can be converted to UTF8 strings are supported.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the path passed to the callback. If the `encoding` is set to `'buffer'`, the path returned will be passed as a [Buffer](buffer.md#buffer) object.

On Linux, when Node.js is linked against musl libc, the procfs file system must be mounted on `/proc` in order for this function to work. Glibc does not have this restriction.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметры oldPath и newPath могут быть объектами URL WHATWG, использующими протокол file:. В настоящее время поддержка все еще _экспериментальная_. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `oldPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously rename file at `oldPath` to the pathname provided as `newPath`. In the case that `newPath` already exists, it will be overwritten. If there is a directory at `newPath`, an error will be raised instead. No arguments other than a possible exception are given to the completion callback.

See also: rename(2).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Удалите опцию «рекурсивный». |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v16.0.0 | «Использование `fs.rmdir(path, {recursive: true })` по `path`, который является файлом, больше не разрешено и приводит к ошибке `ENOENT` в Windows и ошибке `ENOTDIR` в POSIX. |
    | v16.0.0 | «Использование `fs.rmdir(path, {recursive: true })` для несуществующего `пути` больше не разрешено и приводит к ошибке `ENOENT`. |
    | v16.0.0 | Опция `recursive` устарела, ее использование вызывает предупреждение об устаревании. |
    | v14.14.0 | Параметр «рекурсивный» устарел, вместо него используйте «fs.rm». |
    | v13.3.0, v12.16.0 | Параметр maxBusyTries переименован в maxRetries, и его значение по умолчанию равно 0. Параметр emfileWait удален, а ошибки EMFILE используют ту же логику повтора, что и другие ошибки. Опция `retryDelay` теперь поддерживается. Ошибки `ENFILE` теперь повторяются. |
    | v12.10.0 | Параметры recursive, maxBusyTries и emfileWait теперь поддерживаются. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметры `path` могут быть объектом `URL` WHATWG, использующим протокол `file:`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) There are currently no options exposed. There used to be options for `recursive`, `maxBusyTries`, and `emfileWait` but they were deprecated and removed. The `options` argument is still accepted for backwards compatibility but it is not used.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronous rmdir(2). No arguments other than a possible exception are given to the completion callback.

Using `fs.rmdir()` on a file (not a directory) results in an `ENOENT` error on Windows and an `ENOTDIR` error on POSIX.

To get a behavior similar to the `rm -rf` Unix command, use [`fs.rm()`](#fsrmpath-options-callback) with options `{ recursive: true, force: true }`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.3.0, v16.14.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, exceptions will be ignored if `path` does not exist. **По умолчанию:** `false`.
    -   `maxRetries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If an `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, or `EPERM` error is encountered, Node.js will retry the operation with a linear backoff wait of `retryDelay` milliseconds longer on each try. This option represents the number of retries. This option is ignored if the `recursive` option is not `true`. **По умолчанию:** `0`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, perform a recursive removal. In recursive mode operations are retried on failure. **По умолчанию:** `false`.
    -   `retryDelay` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The amount of time in milliseconds to wait between retries. This option is ignored if the `recursive` option is not `true`. **По умолчанию:** `100`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously removes files and directories (modeled on the standard POSIX `rm` utility). No arguments other than a possible exception are given to the completion callback.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.7.0 | Принимает опцию `throwIfNoEntry`, чтобы указать, должно ли создаваться исключение, если запись не существует. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether an exception will be thrown if no file system entry exists, rather than returning `undefined`. **По умолчанию:** `true`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.Stats>`](fs.md#fsstats)

Asynchronous stat(2). The callback gets two arguments `(err, stats)` where `stats` is an [fs.Stats](fs.md#fsstats) object.

In case of an error, the `err.code` will be one of [Common System Errors][common system errors].

[`fs.stat()`](#fsstatpath-options-callback) follows symbolic links. Use [`fs.lstat()`](#fslstatpath-options-callback) to look at the links themselves.

Using `fs.stat()` to check for the existence of a file before calling `fs.open()`, `fs.readFile()`, or `fs.writeFile()` is not recommended. Instead, user code should open/read/write the file directly and handle the error raised if the file is not available.

To check if a file exists without manipulating it afterwards, [`fs.access()`](#fsaccesspath-mode-callback) is recommended.

For example, given the following directory structure:

```text
- txtDir
-- file.txt
- app.js
```

The next program will check for the stats of the given paths:

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

The resulting output will resemble:

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
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.StatFs](fs.md#fsstatfs) object should be `bigint`. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `stats` [`<fs.StatFs>`](fs.md#fsstatfs)

Asynchronous statfs(2). Returns information about the mounted file system which contains `path`. The callback gets two arguments `(err, stats)` where `stats` is an [fs.StatFs](fs.md#fsstatfs) object.

In case of an error, the `err.code` will be one of [Common System Errors][common system errors].

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v12.0.0 | Если аргумент `type` не определён, Node автоматически определит `target` тип и автоматически выберет `dir` или `file`. |
    | v7.6.0 | Параметры target и path могут быть объектами URL WHATWG, использующими протокол file:. В настоящее время поддержка все еще _экспериментальная_. |

-   `target` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Creates the link called `path` pointing to `target`. No arguments other than a possible exception are given to the completion callback.

Подробнее см. POSIX symlink(2).

The `type` argument is only available on Windows and ignored on other platforms. It can be set to `'dir'`, `'file'`, or `'junction'`. If the `type` argument is `null`, Node.js will autodetect `target` type and use `'file'` or `'dir'`. If the `target` does not exist, `'file'` will be used. Windows junction points require the destination path to be absolute. When using `'junction'`, the `target` argument will automatically be normalized to absolute path. Junction points on NTFS volumes can only point to directories.

Relative targets are relative to the link's parent directory.

=== "MJS"

    ```js
    import { symlink } from 'node:fs';

    symlink('./mew', './mewtwo', callback);
    ```

The above example creates a symbolic link `mewtwo` which points to `mew` in the same directory:

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v16.0.0 | Возвращаемая ошибка может быть AggregateError, если возвращается более одной ошибки. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<AggregateError>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AggregateError)

Truncates the file. No arguments other than a possible exception are given to the completion callback. A file descriptor can also be passed as the first argument. In this case, `fs.ftruncate()` is called.

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

Passing a file descriptor is deprecated and may result in an error being thrown in the future.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously removes a file or symbolic link. No arguments other than a possible exception are given to the completion callback.

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
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Optional, a listener previously attached using `fs.watchFile()`

Stop watching for changes on `filename`. If `listener` is specified, only that particular listener is removed. Otherwise, _all_ listeners are removed, effectively stopping watching of `filename`.

Calling `fs.unwatchFile()` with a filename that is not being watched is a no-op, not an error.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v8.0.0 | «`NaN`, `Infinity` и `-Infinity` больше не являются допустимыми спецификаторами времени». |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v4.1.0 | Числовые строки, NaN и Infinity теперь разрешены как спецификаторы времени. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `atime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `mtime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Change the file system timestamps of the object referenced by `path`.

The `atime` and `mtime` arguments follow these rules:

-   Values can be either numbers representing Unix epoch time in seconds, `Date`s, or a numeric string like `'123456789.0'`.
-   If the value can not be converted to a number, or is `NaN`, `Infinity`, or `-Infinity`, an `Error` will be thrown.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Добавлена ​​опция throwIfNoEntry. |
    | v19.1.0 | Добавлена ​​рекурсивная поддержка для Linux, AIX и IBMi. |
    | v15.9.0, v14.17.0 | Добавлена ​​поддержка закрытия наблюдателя с помощью AbortSignal. |
    | v7.6.0 | Параметр filename может быть объектом URL WHATWG, использующим протокол file:. |
    | v7.0.0 | Переданный объект `options` никогда не будет изменен. |

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `persistent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether the process should continue to run as long as files are being watched. **По умолчанию:** `true`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether all subdirectories should be watched, or only the current directory. This applies when a directory is specified, and only on supported platforms (See [caveats][caveats]). **По умолчанию:** `false`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Specifies the character encoding to be used for the filename passed to the listener. **По умолчанию:** `'utf8'`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) allows closing the watcher with an AbortSignal.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether an exception should be thrown when the path does not exist. **По умолчанию:** `true`.
    -   `ignore` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Pattern(s) to ignore. Strings are glob patterns (using [`minimatch`](https://github.com/isaacs/minimatch)), RegExp patterns are tested against the filename, and functions receive the filename and return `true` to ignore. **По умолчанию:** `undefined`.
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | undefined **По умолчанию:** `undefined`
    -   `eventType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | null
-   Возвращает: [`<fs.FSWatcher>`](fs.md#fsfswatcher)

Watch for changes on `filename`, where `filename` is either a file or a directory.

The second argument is optional. If `options` is provided as a string, it specifies the `encoding`. Otherwise `options` should be passed as an object.

The listener callback gets two arguments `(eventType, filename)`. `eventType` is either `'rename'` or `'change'`, and `filename` is the name of the file which triggered the event.

On most platforms, `'rename'` is emitted whenever a filename appears or disappears in the directory.

The listener callback is attached to the `'change'` event fired by [fs.FSWatcher](fs.md#fsfswatcher), but it is not the same thing as the `'change'` value of `eventType`.

If a `signal` is passed, aborting the corresponding AbortController will close the returned [fs.FSWatcher](fs.md#fsfswatcher).

#### Caveats

<!--type=misc-->

The `fs.watch` API is not 100% consistent across platforms, and is unavailable in some situations.

On Windows, no events will be emitted if the watched directory is moved or renamed. An `EPERM` error is reported when the watched directory is deleted.

The `fs.watch` API does not provide any protection with respect to malicious actions on the file system. For example, on Windows it is implemented by monitoring changes in a directory versus specific files. This allows substitution of a file and fs reporting changes on the new file with the same filename.

##### Availability

<!--type=misc-->

This feature depends on the underlying operating system providing a way to be notified of file system changes.

-   On Linux systems, this uses [`inotify(7)`](https://man7.org/linux/man-pages/man7/inotify.7.html).
-   On BSD systems, this uses [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2).
-   On macOS, this uses [`kqueue(2)`](https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2) for files and [`FSEvents`](https://developer.apple.com/documentation/coreservices/file_system_events) for directories.
-   On SunOS systems (including Solaris and SmartOS), this uses [`event ports`](https://illumos.org/man/port_create).
-   On Windows systems, this feature depends on [`ReadDirectoryChangesW`](https://docs.microsoft.com/en-us/windows/desktop/api/winbase/nf-winbase-readdirectorychangesw).
-   On AIX systems, this feature depends on [`AHAFS`](https://developer.ibm.com/articles/au-aix_event_infrastructure/), which must be enabled.
-   On IBM i systems, this feature is not supported.

If the underlying functionality is not available for some reason, then `fs.watch()` will not be able to function and may throw an exception. For example, watching files or directories can be unreliable, and in some cases impossible, on network file systems (NFS, SMB, etc) or host file systems when using virtualization software such as Vagrant or Docker.

It is still possible to use `fs.watchFile()`, which uses stat polling, but this method is slower and less reliable.

##### Inodes

<!--type=misc-->

On Linux and macOS systems, `fs.watch()` resolves the path to an [inode][inode] and watches the inode. If the watched path is deleted and recreated, it is assigned a new inode. The watch will emit an event for the delete but will continue watching the _original_ inode. Events for the new inode will not be emitted. This is expected behavior.

AIX files retain the same inode for the lifetime of a file. Saving and closing a watched file on AIX will result in two notifications (one for adding new content, and one for truncation).

##### Filename argument

<!--type=misc-->

Providing `filename` argument in the callback is only supported on Linux, macOS, Windows, and AIX. Even on supported platforms, `filename` is not always guaranteed to be provided. Therefore, don't assume that `filename` argument is always provided in the callback, and have some fallback logic if it is `null`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.5.0 | Опция bigint теперь поддерживается. |
    | v7.6.0 | Параметр filename может быть объектом URL WHATWG, использующим протокол file:. |

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `persistent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `true`
    -   `interval` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `5007`
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `current` [`<fs.Stats>`](fs.md#fsstats)
    -   `previous` [`<fs.Stats>`](fs.md#fsstats)
-   Возвращает: [`<fs.StatWatcher>`](fs.md#fsstatwatcher)

Watch for changes on `filename`. The callback `listener` will be called each time the file is accessed.

The `options` argument may be omitted. If provided, it should be an object. The `options` object may contain a boolean named `persistent` that indicates whether the process should continue to run as long as files are being watched. The `options` object may specify an `interval` property indicating how often the target should be polled in milliseconds.

The `listener` gets two arguments the current stat object and the previous stat object:

=== "MJS"

    ```js
    import { watchFile } from 'node:fs';

    watchFile('message.text', (curr, prev) => {
      console.log(`the current mtime is: ${curr.mtime}`);
      console.log(`the previous mtime was: ${prev.mtime}`);
    });
    ```

These stat objects are instances of `fs.Stat`. If the `bigint` option is `true`, the numeric values in these objects are specified as `BigInt`s.

To be notified when the file was modified, not just accessed, it is necessary to compare `curr.mtimeMs` and `prev.mtimeMs`.

When an `fs.watchFile` operation results in an `ENOENT` error, it will invoke the listener once, with all the fields zeroed (or, for dates, the Unix Epoch). If the file is created later on, the listener will be called again, with the latest stat objects. This is a change in functionality since v0.10.

Using [`fs.watch()`](#fswatchfilename-options-listener) is more efficient than `fs.watchFile` and `fs.unwatchFile`. `fs.watch` should be used instead of `fs.watchFile` and `fs.unwatchFile` when possible.

When a file being watched by `fs.watchFile()` disappears and reappears, then the contents of `previous` in the second callback event (the file's reappearance) will be the same as the contents of `previous` in the first callback event (its disappearance).

This happens when:

-   the file is deleted, followed by a restore
-   the file is renamed and then renamed a second time back to its original name

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v14.0.0 | Параметр `buffer` больше не будет приводить к строкам неподдерживаемый ввод. |
    | v10.10.0 | Параметром `buffer` теперь может быть любой `TypedArray` или `DataView`. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.4.0 | Параметр `buffer` теперь может быть `Uint8Array`. |
    | v7.2.0 | Параметры offset и length теперь необязательны. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)

Write `buffer` to the file specified by `fd`.

`offset` determines the part of the buffer to be written, and `length` is an integer specifying the number of bytes to write.

`position` refers to the offset from the beginning of the file where this data should be written. If `typeof position !== 'number'`, the data will be written at the current position. See pwrite(2).

The callback will be given three arguments `(err, bytesWritten, buffer)` where `bytesWritten` specifies how many _bytes_ were written from `buffer`.

If this method is invoked as its [`util.promisify()`](util.md#utilpromisifyoriginal)ed version, it returns a promise for an `Object` with `bytesWritten` and `buffer` properties.

It is unsafe to use `fs.write()` multiple times on the same file without waiting for the callback. For this scenario, [`fs.createWriteStream()`](#fscreatewritestreampath-options) is recommended.

On Linux, positional writes don't work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

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

Write `buffer` to the file specified by `fd`.

Similar to the above `fs.write` function, this version takes an optional `options` object. If no `options` object is specified, it will default with the above values.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.0.0 | Передача в параметр string объекта с собственной функцией toString больше не поддерживается. |
    | v17.8.0 | Передача в параметр `string` объекта с собственной функцией `toString` считается устаревшей. |
    | v14.12.0 | Параметр string преобразует объект в строку с помощью явной функции toString. |
    | v14.0.0 | Параметр `string` больше не будет приводить к строкам неподдерживаемый ввод. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.2.0 | Параметр `position` теперь является необязательным. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `written` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Write `string` to the file specified by `fd`. If `string` is not a string, an exception is thrown.

`position` refers to the offset from the beginning of the file where this data should be written. If `typeof position !== 'number'` the data will be written at the current position. See pwrite(2).

`encoding` is the expected string encoding.

The callback will receive the arguments `(err, written, string)` where `written` specifies how many _bytes_ the passed string required to be written. Bytes written is not necessarily the same as string characters written. See [`Buffer.byteLength`](buffer.md#static-method-bufferbytelengthstring-encoding).

It is unsafe to use `fs.write()` multiple times on the same file without waiting for the callback. For this scenario, [`fs.createWriteStream()`](#fscreatewritestreampath-options) is recommended.

On Linux, positional writes don't work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

On Windows, if the file descriptor is connected to the console (e.g. `fd == 1` or `stdout`) a string containing non-ASCII characters will not be rendered properly by default, regardless of the encoding used. It is possible to configure the console to render UTF-8 properly by changing the active codepage with the `chcp 65001` command. See the [chcp][chcp] docs for more details.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v19.0.0 | Передача в параметр string объекта с собственной функцией toString больше не поддерживается. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v17.8.0 | Передача в параметр `string` объекта с собственной функцией `toString` считается устаревшей. |
    | v16.0.0 | Возвращаемая ошибка может быть AggregateError, если возвращается более одной ошибки. |
    | v15.2.0, v14.17.0 | Аргумент options может включать AbortSignal для прерывания текущего запроса writeFile. |
    | v14.12.0 | Параметр data преобразует объект в строку с помощью явной функции toString. |
    | v14.0.0 | Параметр data больше не будет принуждать неподдерживаемый ввод к строкам. |
    | v10.10.0 | Параметр data теперь может быть любым TypedArray или DataView. |
    | v10.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, во время выполнения будет выброшено `TypeError`. |
    | v7.4.0 | Параметр data теперь может быть Uint8Array. |
    | v7.0.0 | Параметр `callback` больше не является необязательным. Если его не передать, будет выдано предупреждение об устаревании с идентификатором DEP0013. |
    | v5.0.0 | Параметр `file` теперь может быть дескриптором файла. |

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

When `file` is a filename, asynchronously writes data to the file, replacing the file if it already exists. `data` can be a string or a buffer.

When `file` is a file descriptor, the behavior is similar to calling `fs.write()` directly (which is recommended). See the notes below on using a file descriptor.

The `encoding` option is ignored if `data` is a buffer.

The `mode` option only affects the newly created file. See [`fs.open()`](#fsopenpath-flags-mode-callback) for more details.

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

It is unsafe to use `fs.writeFile()` multiple times on the same file without waiting for the callback. For this scenario, [`fs.createWriteStream()`](#fscreatewritestreampath-options) is recommended.

Similarly to `fs.readFile` - `fs.writeFile` is a convenience method that performs multiple `write` calls internally to write the buffer passed to it. For performance sensitive code consider using [`fs.createWriteStream()`](#fscreatewritestreampath-options).

It is possible to use an [AbortSignal](globals.md#abortsignal) to cancel an `fs.writeFile()`. Cancelation is "best effort", and some amount of data is likely still to be written.

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

Aborting an ongoing request does not abort individual operating system requests but rather the internal buffering `fs.writeFile` performs.

#### Using `fs.writeFile()` with file descriptors

When `file` is a file descriptor, the behavior is almost identical to directly calling `fs.write()` like:

=== "MJS"

    ```js
    import { write } from 'node:fs';
    import { Buffer } from 'node:buffer';

    write(fd, Buffer.from(data, options.encoding), callback);
    ```

The difference from directly calling `fs.write()` is that under some unusual conditions, `fs.write()` might write only part of the buffer and need to be retried to write the remaining data, whereas `fs.writeFile()` retries until the data is entirely written (or an error occurs).

The implications of this are a common source of confusion. In the file descriptor case, the file is not replaced! The data is not necessarily written to the beginning of the file, and the file's original data may remain before and/or after the newly written data.

For example, if `fs.writeFile()` is called twice in a row, first to write the string `'Hello'`, then to write the string `', World'`, the file would contain `'Hello, World'`, and might contain some of the file's original data (depending on the size of the original file, and the position of the file descriptor). If a file name had been used instead of a descriptor, the file would be guaranteed to contain only `', World'`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | null **По умолчанию:** `null`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `bytesWritten` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `buffers` [`<ArrayBufferView[]>`](https://developer.mozilla.org/docs/Web/API/ArrayBufferView)

Write an array of `ArrayBufferView`s to the file specified by `fd` using `writev()`.

`position` is the offset from the beginning of the file where this data should be written. If `typeof position !== 'number'`, the data will be written at the current position.

The callback will be given three arguments: `err`, `bytesWritten`, and `buffers`. `bytesWritten` is how many bytes were written from `buffers`.

If this method is [`util.promisify()`](util.md#utilpromisifyoriginal)ed, it returns a promise for an `Object` with `bytesWritten` and `buffers` properties.

It is unsafe to use `fs.writev()` multiple times on the same file without waiting for the callback. For this scenario, use [`fs.createWriteStream()`](#fscreatewritestreampath-options).

On Linux, positional writes don't work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

## Synchronous API

The synchronous APIs perform all operations synchronously, blocking the event loop until the operation completes or fails.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `fs.constants.F_OK`

Synchronously tests a user's permissions for the file or directory specified by `path`. The `mode` argument is an optional integer that specifies the accessibility checks to be performed. `mode` should be either the value `fs.constants.F_OK` or a mask consisting of the bitwise OR of any of `fs.constants.R_OK`, `fs.constants.W_OK`, and `fs.constants.X_OK` (e.g. `fs.constants.W_OK | fs.constants.R_OK`). Check [File access constants][file access constants] for possible values of `mode`.

If any of the accessibility checks fail, an `Error` will be thrown. Otherwise, the method will return `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.1.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v7.0.0 | Переданный объект `options` никогда не будет изменен. |
    | v5.0.0 | Параметр `file` теперь может быть дескриптором файла. |

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

The `path` may be specified as a numeric file descriptor that has been opened for appending (using `fs.open()` or `fs.openSync()`). The file descriptor will not be closed automatically.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

For detailed information, see the documentation of the asynchronous version of this API: [`fs.chmod()`](#fschmodpath-mode-callback).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Synchronously changes owner and group of a file. Returns `undefined`. This is the synchronous version of [`fs.chown()`](#fschownpath-uid-gid-callback).

Подробнее см. POSIX chown(2).

### `fs.closeSync(fd)`

<!-- YAML
added: v0.1.21
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Closes the file descriptor. Returns `undefined`.

Calling `fs.closeSync()` on any file descriptor (`fd`) that is currently in use through any other `fs` operation may lead to undefined behavior.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Аргумент flags изменен на mode и введена более строгая проверка типов. |

-   `src` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) source filename to copy
-   `dest` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) destination filename of the copy operation
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) modifiers for copy operation. **По умолчанию:** `0`.

Synchronously copies `src` to `dest`. By default, `dest` is overwritten if it already exists. Returns `undefined`. Node.js makes no guarantees about the atomicity of the copy operation. If an error occurs after the destination file has been opened for writing, Node.js will attempt to remove the destination.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.3.0 | Этот API больше не является экспериментальным. |
    | v20.1.0, v18.17.0 | Примите дополнительную опцию `mode`, чтобы указать поведение копирования в качестве аргумента `mode` функции `fs.copyFile()`. |
    | v17.6.0, v16.15.0 | Принимает дополнительную опцию `verbatimSymlinks`, чтобы указать, следует ли выполнять разрешение пути для символических ссылок. |

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

Synchronously copies the entire directory structure from `src` to `dest`, including subdirectories and files.

When copying a directory to another directory, globs are not supported and behavior is similar to `cp dir1/ dir2/`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the path exists, `false` otherwise.

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

Sets the permissions on the file. Returns `undefined`.

Подробнее см. POSIX fchmod(2).

### `fs.fchownSync(fd, uid, gid)`

<!-- YAML
added: v0.4.7
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new owner's user id.
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new group's group id.

Sets the owner of the file. Returns `undefined`.

Подробнее см. POSIX fchown(2).

### `fs.fdatasyncSync(fd)`

<!-- YAML
added: v0.1.96
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Forces all currently queued I/O operations associated with the file to the operating system's synchronized I/O completion state. Refer to the POSIX fdatasync(2) documentation for details. Returns `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<fs.Stats>`](fs.md#fsstats)

Retrieves the [fs.Stats](fs.md#fsstats) for the file descriptor.

Подробнее см. POSIX fstat(2).

### `fs.fsyncSync(fd)`

<!-- YAML
added: v0.1.96
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Request that all data for the open file descriptor is flushed to the storage device. The specific implementation is operating system and device specific. Refer to the POSIX fsync(2) documentation for more detail. Returns `undefined`.

### `fs.ftruncateSync(fd[, len])`

<!-- YAML
added: v0.8.6
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `len` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`

Truncates the file descriptor. Returns `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v4.1.0 | Числовые строки, NaN и Infinity теперь разрешены как спецификаторы времени. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.1.0, v22.17.0 | Добавлена ​​поддержка экземпляров URL для опции cwd. |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |
    | v23.7.0, v22.14.0 | Добавьте поддержку опции «исключить», чтобы принимать шаблоны glob. |
    | v22.2.0 | Добавьте поддержку withFileTypes в качестве опции. |

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

> Stability: 0 - Deprecated

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `mode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Changes the permissions on a symbolic link. Returns `undefined`.

This method is only implemented on macOS.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.6.0 | Этот API больше не устарел. |
    | v0.4.7 | Прекращение поддержки только документации. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `uid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new owner's user id.
-   `gid` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file's new group's group id.

Set the owner for the path. Returns `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметры existingPath и newPath могут быть объектами URL WHATWG, использующими протокол file:. В настоящее время поддержка все еще _экспериментальная_. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.3.0, v14.17.0 | Принимает опцию `throwIfNoEntry`, чтобы указать, должно ли создаваться исключение, если запись не существует. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether an exception will be thrown if no file system entry exists, rather than returning `undefined`. **По умолчанию:** `true`.
-   Возвращает: [`<fs.Stats>`](fs.md#fsstats)

Retrieves the [fs.Stats](fs.md#fsstats) for the symbolic link referred to by `path`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.11.0, v12.17.0 | В «рекурсивном» режиме теперь возвращается первый созданный путь. |
    | v10.12.0 | Вторым аргументом теперь может быть объект options со свойствами recursive и mode. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Not supported on Windows. **По умолчанию:** `0o777`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Synchronously creates a directory. Returns `undefined`, or if `recursive` is `true`, the first directory path created. This is the synchronous version of [`fs.mkdir()`](#fsmkdirpath-options-callback).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0, v18.19.0 | Параметр `prefix` теперь принимает буферы и URL. |
    | v16.5.0, v14.18.0 | Параметр `prefix` теперь принимает пустую строку. |

-   `prefix` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Returns the created directory path.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.mkdtemp()`](#fsmkdtempprefix-options-callback).

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use.

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

Returns a disposable object whose `path` property holds the created directory path. When the object is disposed, the directory and its contents will be removed if it still exists. If the directory cannot be deleted, disposal will throw an error. The object has a `remove()` method which will perform the same task.

<!-- TODO: link MDN docs for disposables once https://github.com/mdn/content/pull/38027 lands -->

For detailed information, see the documentation of [`fs.mkdtemp()`](#fsmkdtempprefix-options-callback).

There is no callback-based version of this API because it is designed for use with the `using` syntax.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Добавлена ​​опция «рекурсивный». |
    | v13.1.0, v12.16.0 | Была введена опция `bufferSize`. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `'utf8'`
    -   `bufferSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Number of directory entries that are buffered internally when reading from the directory. Higher values lead to better performance but higher memory usage. **По умолчанию:** `32`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
-   Возвращает: [`<fs.Dir>`](fs.md#class-fsdir)

Synchronously open a directory. See opendir(3).

Creates an [fs.Dir](fs.md#class-fsdir), which contains all further functions for reading from and cleaning up the directory.

The `encoding` option sets the encoding for the `path` while opening the directory and subsequent read operations.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v11.1.0 | Аргумент flags теперь является необязательным и по умолчанию имеет значение r. |
    | v9.9.0 | Флаги `as` и `as+` теперь поддерживаются. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `flags` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `'r'`. See [support of file system `flags`](#file-system-flags).
-   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0o666`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Returns an integer representing the file descriptor.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | Добавлена ​​опция «рекурсивный». |
    | v10.10.0 | Добавлена ​​новая опция withFileTypes. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
    -   `withFileTypes` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) **По умолчанию:** `false`
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, reads the contents of a directory recursively. In recursive mode, it will list all files, sub files, and directories. **По умолчанию:** `false`.
-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer[]>`](buffer.md#buffer) | [`<fs.Dirent[]>`](fs.md#fsdirent)

Reads the contents of the directory.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v5.0.0 | Параметр `path` теперь может быть дескриптором файла. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) filename or file descriptor
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null **По умолчанию:** `null`
    -   `flag` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) See [support of file system `flags`](#file-system-flags). **По умолчанию:** `'r'`.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Returns the contents of the `path`.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.readFile()`](#fsreadfilepath-options-callback).

If the `encoding` option is specified then this function returns a string. Otherwise it returns a buffer.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Returns the symbolic link's string value.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.10.0 | Параметром `buffer` теперь может быть любой `TypedArray` или `DataView`. |
    | v6.0.0 | Параметр length теперь может быть равен 0. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Returns the number of `bytesRead`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.13.0, v12.17.0 | Можно передать объект Options, чтобы сделать смещение, длину и положение необязательными. |

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   `buffer` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `offset` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `0`
    -   `length` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `buffer.byteLength - offset`
    -   `position` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) | null **По умолчанию:** `null`
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Returns the number of `bytesRead`.

Similar to the above `fs.readSync` function, this version takes an optional `options` object. If no `options` object is specified, it will default with the above values.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | Была добавлена ​​поддержка разрешения труб/сокетов. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v6.4.0 | Вызов RealpathSync теперь снова работает в различных крайних случаях в Windows. |
    | v6.0.0 | Параметр `cache` был удален. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Returns the resolved pathname.

For detailed information, see the documentation of the asynchronous version of this API: [`fs.realpath()`](#fsrealpathpath-options-callback).

### `fs.realpathSync.native(path[, options])`

<!-- YAML
added: v9.2.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) **По умолчанию:** `'utf8'`
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

Synchronous realpath(3).

Only paths that can be converted to UTF8 strings are supported.

The optional `options` argument can be a string specifying an encoding, or an object with an `encoding` property specifying the character encoding to use for the path returned. If the `encoding` is set to `'buffer'`, the path returned will be passed as a [Buffer](buffer.md#buffer) object.

On Linux, when Node.js is linked against musl libc, the procfs file system must be mounted on `/proc` in order for this function to work. Glibc does not have this restriction.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметры oldPath и newPath могут быть объектами URL WHATWG, использующими протокол file:. В настоящее время поддержка все еще _экспериментальная_. |

-   `oldPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `newPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)

Renames the file from `oldPath` to `newPath`. Returns `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Удалите опцию «рекурсивный». |
    | v16.0.0 | «Использование `fs.rmdirSync(path, {recursive: true })` по `path`, который является файлом, больше не разрешено и приводит к ошибке `ENOENT` в Windows и ошибке `ENOTDIR` в POSIX. |
    | v16.0.0 | «Использование `fs.rmdirSync(path, {recursive: true })` для несуществующего `пути` больше не разрешено и приводит к ошибке `ENOENT`. |
    | v16.0.0 | Опция `recursive` устарела, ее использование вызывает предупреждение об устаревании. |
    | v14.14.0 | Параметр «рекурсивный» устарел, вместо него используйте «fs.rmSync». |
    | v13.3.0, v12.16.0 | Параметр maxBusyTries переименован в maxRetries, и его значение по умолчанию равно 0. Параметр emfileWait удален, а ошибки EMFILE используют ту же логику повтора, что и другие ошибки. Опция `retryDelay` теперь поддерживается. Ошибки `ENFILE` теперь повторяются. |
    | v12.10.0 | Параметры recursive, maxBusyTries и emfileWait теперь поддерживаются. |
    | v7.6.0 | Параметры `path` могут быть объектом `URL` WHATWG, использующим протокол `file:`. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) There are currently no options exposed. There used to be options for `recursive`, `maxBusyTries`, and `emfileWait` but they were deprecated and removed. The `options` argument is still accepted for backwards compatibility but it is not used.

Synchronous rmdir(2). Returns `undefined`.

Using `fs.rmdirSync()` on a file (not a directory) results in an `ENOENT` error on Windows and an `ENOTDIR` error on POSIX.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.3.0, v16.14.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `force` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When `true`, exceptions will be ignored if `path` does not exist. **По умолчанию:** `false`.
    -   `maxRetries` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) If an `EBUSY`, `EMFILE`, `ENFILE`, `ENOTEMPTY`, or `EPERM` error is encountered, Node.js will retry the operation with a linear backoff wait of `retryDelay` milliseconds longer on each try. This option represents the number of retries. This option is ignored if the `recursive` option is not `true`. **По умолчанию:** `0`.
    -   `recursive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, perform a recursive directory removal. In recursive mode operations are retried on failure. **По умолчанию:** `false`.
    -   `retryDelay` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The amount of time in milliseconds to wait between retries. This option is ignored if the `recursive` option is not `true`. **По умолчанию:** `100`.

Synchronously removes files and directories (modeled on the standard POSIX `rm` utility). Returns `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.3.0, v14.17.0 | Принимает опцию `throwIfNoEntry`, чтобы указать, должно ли создаваться исключение, если запись не существует. |
    | v10.5.0 | Принимает дополнительный объект options, чтобы указать, должны ли возвращаемые числовые значения быть bigint. |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.Stats](fs.md#fsstats) object should be `bigint`. **По умолчанию:** `false`.
    -   `throwIfNoEntry` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether an exception will be thrown if no file system entry exists, rather than returning `undefined`. **По умолчанию:** `true`.
-   Возвращает: [`<fs.Stats>`](fs.md#fsstats)

Retrieves the [fs.Stats](fs.md#fsstats) for the path.

### `fs.statfsSync(path[, options])`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `bigint` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the numeric values in the returned [fs.StatFs](fs.md#fsstatfs) object should be `bigint`. **По умолчанию:** `false`.
-   Возвращает: [`<fs.StatFs>`](fs.md#fsstatfs)

Synchronous statfs(2). Returns information about the mounted file system which contains `path`.

In case of an error, the `err.code` will be one of [Common System Errors][common system errors].

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v12.0.0 | Если аргумент `type` не определён, Node автоматически определит `target` тип и автоматически выберет `dir` или `file`. |
    | v7.6.0 | Параметры target и path могут быть объектами URL WHATWG, использующими протокол file:. В настоящее время поддержка все еще _экспериментальная_. |

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

Truncates the file. Returns `undefined`. A file descriptor can also be passed as the first argument. In this case, `fs.ftruncateSync()` is called.

Passing a file descriptor is deprecated and may result in an error being thrown in the future.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<URL>`](url.md#the-whatwg-url-api)

Synchronous unlink(2). Returns `undefined`.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.0.0 | «`NaN`, `Infinity` и `-Infinity` больше не являются допустимыми спецификаторами времени». |
    | v7.6.0 | Параметр path может быть объектом URL WHATWG, использующим протокол file:. |
    | v4.1.0 | Числовые строки, NaN и Infinity теперь разрешены как спецификаторы времени. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0, v20.10.0 | Опция `flush` теперь поддерживается. |
    | v19.0.0 | Передача в параметр data объекта с собственной функцией toString больше не поддерживается. |
    | v17.8.0 | Передача в параметр data объекта с собственной функцией toString считается устаревшей. |
    | v14.12.0 | Параметр data преобразует объект в строку с помощью явной функции toString. |
    | v14.0.0 | Параметр data больше не будет принуждать неподдерживаемый ввод к строкам. |
    | v10.10.0 | Параметр data теперь может быть любым TypedArray или DataView. |
    | v7.4.0 | Параметр data теперь может быть Uint8Array. |
    | v5.0.0 | Параметр `file` теперь может быть дескриптором файла. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Параметр `buffer` больше не будет приводить к строкам неподдерживаемый ввод. |
    | v10.10.0 | Параметром `buffer` теперь может быть любой `TypedArray` или `DataView`. |
    | v7.4.0 | Параметр `buffer` теперь может быть `Uint8Array`. |
    | v7.2.0 | Параметры offset и length теперь необязательны. |

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Параметр `string` больше не будет приводить к строкам неподдерживаемый ввод. |
    | v7.2.0 | Параметр `position` теперь является необязательным. |

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

## Common Objects

The common objects are shared by all of the file system API variants (promise, callback, and synchronous).

### Class: `fs.Dir`

<!-- YAML
added: v12.12.0
-->

A class representing a directory stream.

Created by [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options), or [`fsPromises.opendir()`](#fspromisesopendirpath-options).

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

When using the async iterator, the [fs.Dir](fs.md#class-fsdir) object will be automatically closed after the iterator exits.

#### `dir.close()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Asynchronously close the directory's underlying resource handle. Subsequent reads will result in errors.

A promise is returned that will be fulfilled after the resource has been closed.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Asynchronously close the directory's underlying resource handle. Subsequent reads will result in errors.

The `callback` will be called after the resource handle has been closed.

#### `dir.closeSync()`

<!-- YAML
added: v12.12.0
-->

Synchronously close the directory's underlying resource handle. Subsequent reads will result in errors.

#### `dir.path`

<!-- YAML
added: v12.12.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The read-only path of this directory as was provided to [`fs.opendir()`](#fsopendirpath-options-callback), [`fs.opendirSync()`](#fsopendirsyncpath-options), or [`fsPromises.opendir()`](#fspromisesopendirpath-options).

#### `dir.read()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfills with a [fs.Dirent](fs.md#fsdirent) | null

Asynchronously read the next directory entry via readdir(3) as an [fs.Dirent](fs.md#fsdirent).

A promise is returned that will be fulfilled with an [fs.Dirent](fs.md#fsdirent), or `null` if there are no more directory entries to read.

Directory entries returned by this function are in no particular order as provided by the operating system's underlying directory mechanisms. Entries added or removed while iterating over the directory might not be included in the iteration results.

#### `dir.read(callback)`

<!-- YAML
added: v12.12.0
-->

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `dirent` [`<fs.Dirent>`](fs.md#fsdirent) | null

Asynchronously read the next directory entry via readdir(3) as an [fs.Dirent](fs.md#fsdirent).

After the read is completed, the `callback` will be called with an [fs.Dirent](fs.md#fsdirent), or `null` if there are no more directory entries to read.

Directory entries returned by this function are in no particular order as provided by the operating system's underlying directory mechanisms. Entries added or removed while iterating over the directory might not be included in the iteration results.

#### `dir.readSync()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<fs.Dirent>`](fs.md#fsdirent) | null

Synchronously read the next directory entry as an [fs.Dirent](fs.md#fsdirent). See the POSIX readdir(3) documentation for more detail.

If there are no more directory entries to read, `null` will be returned.

Directory entries returned by this function are in no particular order as provided by the operating system's underlying directory mechanisms. Entries added or removed while iterating over the directory might not be included in the iteration results.

#### `dir[Symbol.asyncIterator]()`

<!-- YAML
added: v12.12.0
-->

-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) An AsyncIterator of [fs.Dirent](fs.md#fsdirent)

Asynchronously iterates over the directory until all entries have been read. Refer to the POSIX readdir(3) documentation for more detail.

Entries returned by the async iterator are always an [fs.Dirent](fs.md#fsdirent). The `null` case from `dir.read()` is handled internally.

See [fs.Dir](fs.md#class-fsdir) for an example.

Directory entries returned by this iterator are in no particular order as provided by the operating system's underlying directory mechanisms. Entries added or removed while iterating over the directory might not be included in the iteration results.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Calls `dir.close()` if the directory handle is open, and returns a promise that fulfills when disposal is complete.

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Calls `dir.closeSync()` if the directory handle is open, and returns `undefined`.

### Class: `fs.Dirent`

<!-- YAML
added: v10.10.0
-->

A representation of a directory entry, which can be a file or a subdirectory within the directory, as returned by reading from an [fs.Dir](fs.md#class-fsdir). The directory entry is a combination of the file name and file type pairs.

Additionally, when [`fs.readdir()`](#fsreaddirpath-options-callback) or [`fs.readdirSync()`](#fsreaddirsyncpath-options) is called with the `withFileTypes` option set to `true`, the resulting array is filled with [fs.Dirent](fs.md#fsdirent) objects, rather than strings or [Buffer](buffer.md#buffer)s.

#### `dirent.isBlockDevice()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a block device.

#### `dirent.isCharacterDevice()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a character device.

#### `dirent.isDirectory()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a file system directory.

#### `dirent.isFIFO()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a first-in-first-out (FIFO) pipe.

#### `dirent.isFile()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a regular file.

#### `dirent.isSocket()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a socket.

#### `dirent.isSymbolicLink()`

<!-- YAML
added: v10.10.0
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Dirent](fs.md#fsdirent) object describes a symbolic link.

#### `dirent.name`

<!-- YAML
added: v10.10.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

The file name that this [fs.Dirent](fs.md#fsdirent) object refers to. The type of this value is determined by the `options.encoding` passed to [`fs.readdir()`](#fsreaddirpath-options-callback) or [`fs.readdirSync()`](#fsreaddirsyncpath-options).

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

The path to the parent directory of the file this [fs.Dirent](fs.md#fsdirent) object refers to.

### Class: `fs.FSWatcher`

<!-- YAML
added: v0.5.8
-->

-   Extends [`<EventEmitter>`](events.md#class-eventemitter)

A successful call to [`fs.watch()`](#fswatchfilename-options-listener) method will return a new [fs.FSWatcher](fs.md#fsfswatcher) object.

All [fs.FSWatcher](fs.md#fsfswatcher) objects emit a `'change'` event whenever a specific watched file is modified.

#### Event: `'change'`

<!-- YAML
added: v0.5.8
-->

-   `eventType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The type of change event that has occurred
-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) The filename that changed (if relevant/available)

Emitted when something changes in a watched directory or file. See more details in [`fs.watch()`](#fswatchfilename-options-listener).

The `filename` argument may not be provided depending on operating system support. If `filename` is provided, it will be provided as a [Buffer](buffer.md#buffer) if `fs.watch()` is called with its `encoding` option set to `'buffer'`, otherwise `filename` will be a UTF-8 string.

=== "MJS"

    ```js
    import { watch } from 'node:fs';
    // Example when handled through fs.watch() listener
    watch('./tmp', { encoding: 'buffer' }, (eventType, filename) => {
      if (filename) {
        console.log(filename);
        // Prints: <Buffer ...>
      }
    });
    ```

#### Event: `'close'`

<!-- YAML
added: v10.0.0
-->

Emitted when the watcher stops watching for changes. The closed [fs.FSWatcher](fs.md#fsfswatcher) object is no longer usable in the event handler.

#### Event: `'error'`

<!-- YAML
added: v0.5.8
-->

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Emitted when an error occurs while watching the file. The errored [fs.FSWatcher](fs.md#fsfswatcher) object is no longer usable in the event handler.

#### `watcher.close()`

<!-- YAML
added: v0.5.8
-->

Stop watching for changes on the given [fs.FSWatcher](fs.md#fsfswatcher). Once stopped, the [fs.FSWatcher](fs.md#fsfswatcher) object is no longer usable.

#### `watcher.ref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.FSWatcher>`](fs.md#fsfswatcher)

When called, requests that the Node.js event loop _not_ exit so long as the [fs.FSWatcher](fs.md#fsfswatcher) is active. Calling `watcher.ref()` multiple times will have no effect.

By default, all [fs.FSWatcher](fs.md#fsfswatcher) objects are "ref'ed", making it normally unnecessary to call `watcher.ref()` unless `watcher.unref()` had been called previously.

#### `watcher.unref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.FSWatcher>`](fs.md#fsfswatcher)

When called, the active [fs.FSWatcher](fs.md#fsfswatcher) object will not require the Node.js event loop to remain active. If there is no other activity keeping the event loop running, the process may exit before the [fs.FSWatcher](fs.md#fsfswatcher) object's callback is invoked. Calling `watcher.unref()` multiple times will have no effect.

### Class: `fs.StatWatcher`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Extends [`<EventEmitter>`](events.md#class-eventemitter)

A successful call to `fs.watchFile()` method will return a new [fs.StatWatcher](fs.md#fsstatwatcher) object.

#### `watcher.ref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.StatWatcher>`](fs.md#fsstatwatcher)

When called, requests that the Node.js event loop _not_ exit so long as the [fs.StatWatcher](fs.md#fsstatwatcher) is active. Calling `watcher.ref()` multiple times will have no effect.

By default, all [fs.StatWatcher](fs.md#fsstatwatcher) objects are "ref'ed", making it normally unnecessary to call `watcher.ref()` unless `watcher.unref()` had been called previously.

#### `watcher.unref()`

<!-- YAML
added:
  - v14.3.0
  - v12.20.0
-->

-   Возвращает: [`<fs.StatWatcher>`](fs.md#fsstatwatcher)

When called, the active [fs.StatWatcher](fs.md#fsstatwatcher) object will not require the Node.js event loop to remain active. If there is no other activity keeping the event loop running, the process may exit before the [fs.StatWatcher](fs.md#fsstatwatcher) object's callback is invoked. Calling `watcher.unref()` multiple times will have no effect.

### Class: `fs.ReadStream`

<!-- YAML
added: v0.1.93
-->

-   Extends: [`<stream.Readable>`](stream.md#streamreadable)

Instances of [fs.ReadStream](fs.md#class-fsreadstream) cannot be constructed directly. They are created and returned using the [`fs.createReadStream()`](#fscreatereadstreampath-options) function.

#### Event: `'close'`

<!-- YAML
added: v0.1.93
-->

Emitted when the [fs.ReadStream](fs.md#class-fsreadstream)'s underlying file descriptor has been closed.

#### Event: `'open'`

<!-- YAML
added: v0.1.93
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Integer file descriptor used by the [fs.ReadStream](fs.md#class-fsreadstream).

Emitted when the [fs.ReadStream](fs.md#class-fsreadstream)'s file descriptor has been opened.

#### Event: `'ready'`

<!-- YAML
added: v9.11.0
-->

Emitted when the [fs.ReadStream](fs.md#class-fsreadstream) is ready to be used.

Fires immediately after `'open'`.

#### `readStream.bytesRead`

<!-- YAML
added: v6.4.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The number of bytes that have been read so far.

#### `readStream.path`

<!-- YAML
added: v0.1.93
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer)

The path to the file the stream is reading from as specified in the first argument to `fs.createReadStream()`. If `path` is passed as a string, then `readStream.path` will be a string. If `path` is passed as a [Buffer](buffer.md#buffer), then `readStream.path` will be a [Buffer](buffer.md#buffer). If `fd` is specified, then `readStream.path` will be `undefined`.

#### `readStream.pending`

<!-- YAML
added:
 - v11.2.0
 - v10.16.0
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

This property is `true` if the underlying file has not been opened yet, i.e. before the `'ready'` event is emitted.

### Class: `fs.Stats`

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

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Публичный конструктор устарел. |
    | v8.1.0 | Добавлено время в виде чисел. |

A [fs.Stats](fs.md#fsstats) object provides information about a file.

Objects returned from [`fs.stat()`](#fsstatpath-options-callback), [`fs.lstat()`](#fslstatpath-options-callback), [`fs.fstat()`](#fsfstatfd-options-callback), and their synchronous counterparts are of this type. If `bigint` in the `options` passed to those methods is true, the numeric values will be `bigint` instead of `number`, and the object will contain additional nanosecond-precision properties suffixed with `Ns`. `Stat` objects are not to be created directly using the `new` keyword.

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

`bigint` version:

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

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a block device.

#### `stats.isCharacterDevice()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a character device.

#### `stats.isDirectory()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a file system directory.

If the [fs.Stats](fs.md#fsstats) object was obtained from calling [`fs.lstat()`](#fslstatpath-options-callback) on a symbolic link which resolves to a directory, this method will return `false`. This is because [`fs.lstat()`](#fslstatpath-options-callback) returns information about a symbolic link itself and not the path it resolves to.

#### `stats.isFIFO()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a first-in-first-out (FIFO) pipe.

#### `stats.isFile()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a regular file.

#### `stats.isSocket()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a socket.

#### `stats.isSymbolicLink()`

<!-- YAML
added: v0.1.10
-->

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns `true` if the [fs.Stats](fs.md#fsstats) object describes a symbolic link.

This method is only valid when using [`fs.lstat()`](#fslstatpath-options-callback).

#### `stats.dev`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The numeric identifier of the device containing the file.

#### `stats.ino`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The file system specific "Inode" number for the file.

#### `stats.mode`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

A bit-field describing the file type and mode.

#### `stats.nlink`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The number of hard-links that exist for the file.

#### `stats.uid`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The numeric user identifier of the user that owns the file (POSIX).

#### `stats.gid`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The numeric group identifier of the group that owns the file (POSIX).

#### `stats.rdev`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

A numeric device identifier if the file represents a device.

#### `stats.size`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The size of the file in bytes.

If the underlying file system does not support getting the size of the file, this will be `0`.

#### `stats.blksize`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The file system block size for i/o operations.

#### `stats.blocks`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The number of blocks allocated for this file.

#### `stats.atimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The timestamp indicating the last time this file was accessed expressed in milliseconds since the POSIX Epoch.

#### `stats.mtimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The timestamp indicating the last time this file was modified expressed in milliseconds since the POSIX Epoch.

#### `stats.ctimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The timestamp indicating the last time the file status was changed expressed in milliseconds since the POSIX Epoch.

#### `stats.birthtimeMs`

<!-- YAML
added: v8.1.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

The timestamp indicating the creation time of this file expressed in milliseconds since the POSIX Epoch.

#### `stats.atimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Only present when `bigint: true` is passed into the method that generates the object. The timestamp indicating the last time this file was accessed expressed in nanoseconds since the POSIX Epoch.

#### `stats.mtimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Only present when `bigint: true` is passed into the method that generates the object. The timestamp indicating the last time this file was modified expressed in nanoseconds since the POSIX Epoch.

#### `stats.ctimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Only present when `bigint: true` is passed into the method that generates the object. The timestamp indicating the last time the file status was changed expressed in nanoseconds since the POSIX Epoch.

#### `stats.birthtimeNs`

<!-- YAML
added: v12.10.0
-->

-   Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Only present when `bigint: true` is passed into the method that generates the object. The timestamp indicating the creation time of this file expressed in nanoseconds since the POSIX Epoch.

#### `stats.atime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

The timestamp indicating the last time this file was accessed.

#### `stats.mtime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

The timestamp indicating the last time this file was modified.

#### `stats.ctime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

The timestamp indicating the last time the file status was changed.

#### `stats.birthtime`

<!-- YAML
added: v0.11.13
-->

-   Тип: [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

The timestamp indicating the creation time of this file.

#### Stat time values

The `atimeMs`, `mtimeMs`, `ctimeMs`, `birthtimeMs` properties are numeric values that hold the corresponding times in milliseconds. Their precision is platform specific. When `bigint: true` is passed into the method that generates the object, the properties will be [bigints][bigints], otherwise they will be [numbers][mdn-number].

The `atimeNs`, `mtimeNs`, `ctimeNs`, `birthtimeNs` properties are [bigints][bigints] that hold the corresponding times in nanoseconds. They are only present when `bigint: true` is passed into the method that generates the object. Their precision is platform specific.

`atime`, `mtime`, `ctime`, and `birthtime` are [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object alternate representations of the various times. The `Date` and number values are not connected. Assigning a new number value, or mutating the `Date` value, will not be reflected in the corresponding alternate representation.

The times in the stat object have the following semantics:

-   `atime` "Access Time": Time when file data last accessed. Changed by the mknod(2), utimes(2), and read(2) system calls.
-   `mtime` "Modified Time": Time when file data last modified. Changed by the mknod(2), utimes(2), and write(2) system calls.
-   `ctime` "Change Time": Time when file status was last changed (inode data modification). Changed by the chmod(2), chown(2), link(2), mknod(2), rename(2), unlink(2), utimes(2), read(2), and write(2) system calls.
-   `birthtime` "Birth Time": Time of file creation. Set once when the file is created. On file systems where birthtime is not available, this field may instead hold either the `ctime` or `1970-01-01T00:00Z` (ie, Unix epoch timestamp `0`). This value may be greater than `atime` or `mtime` in this case. On Darwin and other FreeBSD variants, also set if the `atime` is explicitly set to an earlier value than the current `birthtime` using the utimes(2) system call.

Prior to Node.js 0.12, the `ctime` held the `birthtime` on Windows systems. As of 0.12, `ctime` is not "creation time", and on Unix systems, it never was.

### Class: `fs.StatFs`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

Provides information about a mounted file system.

Objects returned from [`fs.statfs()`](#fsstatfspath-options-callback) and its synchronous counterpart are of this type. If `bigint` in the `options` passed to those methods is `true`, the numeric values will be `bigint` instead of `number`.

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

`bigint` version:

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

Free blocks available to unprivileged users.

#### `statfs.bfree`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Free blocks in file system.

#### `statfs.blocks`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Total data blocks in file system.

#### `statfs.bsize`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Optimal transfer block size.

#### `statfs.frsize`

<!-- YAML
added: REPLACEME
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Fundamental file system block size.

#### `statfs.ffree`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Free file nodes in file system.

#### `statfs.files`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Total file nodes in file system.

#### `statfs.type`

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Type of file system.

### Class: `fs.Utf8Stream`

<!-- YAML
added: v24.6.0
-->

> Stability: 1 - Experimental

An optimized UTF-8 stream writer that allows for flushing all the internal buffering on demand. It handles `EAGAIN` errors correctly, allowing for customization, for example, by dropping content if the disk is busy.

#### Event: `'close'`

The `'close'` event is emitted when the stream is fully closed.

#### Event: `'drain'`

The `'drain'` event is emitted when the internal buffer has drained sufficiently to allow continued writing.

#### Event: `'drop'`

The `'drop'` event is emitted when the maximal length is reached and that data will not be written. The data that was dropped is passed as the first argument to the event handler.

#### Event: `'error'`

The `'error'` event is emitted when an error occurs.

#### Event: `'finish'`

The `'finish'` event is emitted when the stream has been ended and all data has been flushed to the underlying file.

#### Event: `'ready'`

The `'ready'` event is emitted when the stream is ready to accept writes.

#### Event: `'write'`

The `'write'` event is emitted when a write operation has completed. The number of bytes written is passed as the first argument to the event handler.

#### `new fs.Utf8Stream([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `append`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Appends writes to dest file instead of truncating it. **Default**: `true`.
    -   `contentMode`: [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Which type of data you can send to the write function, supported values are `'utf8'` or `'buffer'`. **Default**: `'utf8'`.
    -   `dest`: [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) A path to a file to be written to (mode controlled by the append option).
    -   `fd`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A file descriptor, something that is returned by `fs.open()` or `fs.openSync()`.
    -   `fs`: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An object that has the same API as the `fs` module, useful for mocking, testing, or customizing the behavior of the stream.
    -   `fsync`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Perform a `fs.fsyncSync()` every time a write is completed.
    -   `maxLength`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum length of the internal buffer. If a write operation would cause the buffer to exceed `maxLength`, the data written is dropped and a drop event is emitted with the dropped data
    -   `maxWrite`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum number of bytes that can be written; **Default**: `16384`
    -   `minLength`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The minimum length of the internal buffer that is required to be full before flushing.
    -   `mkdir`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Ensure directory for `dest` file exists when true. **Default**: `false`.
    -   `mode`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Specify the creating file mode (see `fs.open()`).
    -   `periodicFlush`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Calls flush every `periodicFlush` milliseconds.
    -   `retryEAGAIN` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A function that will be called when `write()`, `writeSync()`, or `flushSync()` encounters an `EAGAIN` or `EBUSY` error. If the return value is `true` the operation will be retried, otherwise it will bubble the error. The `err` is the error that caused this function to be called, `writeBufferLen` is the length of the buffer that was written, and `remainingBufferLen` is the length of the remaining buffer that the stream did not try to write.
        -   `err` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) An error or `null`.
        -   `writeBufferLen` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
        -   `remainingBufferLen`: [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `sync`: [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Perform writes synchronously.

#### `utf8Stream.append`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the stream is appending to the file or truncating it.

#### `utf8Stream.contentMode`

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The type of data that can be written to the stream. Supported values are `'utf8'` or `'buffer'`. **Default**: `'utf8'`.

#### `utf8Stream.destroy()`

Close the stream immediately, without flushing the internal buffer.

#### `utf8Stream.end()`

Close the stream gracefully, flushing the internal buffer before closing.

#### `utf8Stream.fd`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The file descriptor that is being written to.

#### `utf8Stream.file`

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The file that is being written to.

#### `utf8Stream.flush(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null An error if the flush failed, otherwise `null`.

Writes the current buffer to the file if a write was not in progress. Do nothing if `minLength` is zero or if it is already writing.

#### `utf8Stream.flushSync()`

Flushes the buffered data synchronously. This is a costly operation.

#### `utf8Stream.fsync`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the stream is performing a `fs.fsyncSync()` after every write operation.

#### `utf8Stream.maxLength`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum length of the internal buffer. If a write operation would cause the buffer to exceed `maxLength`, the data written is dropped and a drop event is emitted with the dropped data.

#### `utf8Stream.minLength`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The minimum length of the internal buffer that is required to be full before flushing.

#### `utf8Stream.mkdir`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the stream should ensure that the directory for the `dest` file exists. If `true`, it will create the directory if it does not exist. **Default**: `false`.

#### `utf8Stream.mode`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The mode of the file that is being written to.

#### `utf8Stream.periodicFlush`

-   [number](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of milliseconds between flushes. If set to `0`, no periodic flushes will be performed.

#### `utf8Stream.reopen(file)`

-   `file`: [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [Buffer](buffer.md#buffer) | [URL](url.md#the-whatwg-url-api) A path to a file to be written to (mode controlled by the append option).

Reopen the file in place, useful for log rotation.

#### `utf8Stream.sync`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the stream is writing synchronously or asynchronously.

#### `utf8Stream.write(data)`

-   `data` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) The data to write.
-   Returns [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

When the `options.contentMode` is set to `'utf8'` when the stream is created, the `data` argument must be a string. If the `contentMode` is set to `'buffer'`, the `data` argument must be a [Buffer](buffer.md#buffer).

#### `utf8Stream.writing`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the stream is currently writing data to the file.

#### `utf8Stream[Symbol.dispose]()`

Calls `utf8Stream.destroy()`.

### Class: `fs.WriteStream`

<!-- YAML
added: v0.1.93
-->

-   Extends [`<stream.Writable>`](stream.md#streamwritable)

Instances of [fs.WriteStream](fs.md#fswritestream) cannot be constructed directly. They are created and returned using the [`fs.createWriteStream()`](#fscreatewritestreampath-options) function.

#### Event: `'close'`

<!-- YAML
added: v0.1.93
-->

Emitted when the [fs.WriteStream](fs.md#fswritestream)'s underlying file descriptor has been closed.

#### Event: `'open'`

<!-- YAML
added: v0.1.93
-->

-   `fd` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Integer file descriptor used by the [fs.WriteStream](fs.md#fswritestream).

Emitted when the [fs.WriteStream](fs.md#fswritestream)'s file is opened.

#### Event: `'ready'`

<!-- YAML
added: v9.11.0
-->

Emitted when the [fs.WriteStream](fs.md#fswritestream) is ready to be used.

Fires immediately after `'open'`.

#### `writeStream.bytesWritten`

<!-- YAML
added: v0.4.7
-->

The number of bytes written so far. Does not include data that is still queued for writing.

#### `writeStream.close([callback])`

<!-- YAML
added: v0.9.4
-->

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Closes `writeStream`. Optionally accepts a callback that will be executed once the `writeStream` is closed.

#### `writeStream.path`

<!-- YAML
added: v0.1.93
-->

The path to the file the stream is writing to as specified in the first argument to [`fs.createWriteStream()`](#fscreatewritestreampath-options). If `path` is passed as a string, then `writeStream.path` will be a string. If `path` is passed as a [Buffer](buffer.md#buffer), then `writeStream.path` will be a [Buffer](buffer.md#buffer).

#### `writeStream.pending`

<!-- YAML
added: v11.2.0
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

This property is `true` if the underlying file has not been opened yet, i.e. before the `'ready'` event is emitted.

### `fs.constants`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Returns an object containing commonly used constants for file system operations.

#### FS constants

The following constants are exported by `fs.constants` and `fsPromises.constants`.

Not every constant will be available on every operating system; this is especially important for Windows, where many of the POSIX specific definitions are not available. For portable applications it is recommended to check for their presence before use.

To use more than one constant, use the bitwise OR `|` operator.

Example:

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

##### File access constants

The following constants are meant for use as the `mode` parameter passed to [`fsPromises.access()`](#fspromisesaccesspath-mode), [`fs.access()`](#fsaccesspath-mode-callback), and [`fs.accessSync()`](#fsaccesssyncpath-mode).

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

The definitions are also available on Windows.

##### File copy constants

The following constants are meant for use with [`fs.copyFile()`](#fscopyfilesrc-dest-mode-callback).

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

The definitions are also available on Windows.

##### File open constants

The following constants are meant for use with `fs.open()`.

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

On Windows, only `O_APPEND`, `O_CREAT`, `O_EXCL`, `O_RDONLY`, `O_RDWR`, `O_TRUNC`, `O_WRONLY`, and `UV_FS_O_FILEMAP` are available.

##### File type constants

The following constants are meant for use with the [fs.Stats](fs.md#fsstats) object's `mode` property for determining a file's type.

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

On Windows, only `S_IFCHR`, `S_IFDIR`, `S_IFLNK`, `S_IFMT`, and `S_IFREG`, are available.

##### File mode constants

The following constants are meant for use with the [fs.Stats](fs.md#fsstats) object's `mode` property for determining the access permissions for a file.

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

On Windows, only `S_IRUSR` and `S_IWUSR` are available.

## Notes

### Ordering of callback and promise-based operations

Because they are executed asynchronously by the underlying thread pool, there is no guaranteed ordering when using either the callback or promise-based methods.

For example, the following is prone to error because the `fs.stat()` operation might complete before the `fs.rename()` operation:

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

It is important to correctly order the operations by awaiting the results of one before invoking the other:

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

Or, when using the callback APIs, move the `fs.stat()` call into the callback of the `fs.rename()` operation:

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

### File paths

Most `fs` operations accept file paths that may be specified in the form of a string, a [Buffer](buffer.md#buffer), or a [URL](url.md#the-whatwg-url-api) object using the `file:` protocol.

#### String paths

String paths are interpreted as UTF-8 character sequences identifying the absolute or relative filename. Relative paths will be resolved relative to the current working directory as determined by calling `process.cwd()`.

Example using an absolute path on POSIX:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let fd;
    try {
      fd = await open('/open/some/file.txt', 'r');
      // Do something with the file
    } finally {
      await fd?.close();
    }
    ```

Example using a relative path on POSIX (relative to `process.cwd()`):

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let fd;
    try {
      fd = await open('file.txt', 'r');
      // Do something with the file
    } finally {
      await fd?.close();
    }
    ```

#### File URL paths

<!-- YAML
added: v7.6.0
-->

For most `node:fs` module functions, the `path` or `filename` argument may be passed as a [URL](url.md#the-whatwg-url-api) object using the `file:` protocol.

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

    readFileSync(new URL('file:///tmp/hello'));
    ```

`file:` URLs are always absolute paths.

##### Platform-specific considerations

On Windows, `file:` [URL](url.md#the-whatwg-url-api)s with a host name convert to UNC paths, while `file:` [URL](url.md#the-whatwg-url-api)s with drive letters convert to local absolute paths. `file:` [URL](url.md#the-whatwg-url-api)s with no host name and no drive letter will result in an error:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';
    // On Windows :

    // - WHATWG file URLs with hostname convert to UNC path
    // file://hostname/p/a/t/h/file => \\hostname\p\a\t\h\file
    readFileSync(new URL('file://hostname/p/a/t/h/file'));

    // - WHATWG file URLs with drive letters convert to absolute path
    // file:///C:/tmp/hello => C:\tmp\hello
    readFileSync(new URL('file:///C:/tmp/hello'));

    // - WHATWG file URLs without hostname must have a drive letters
    readFileSync(new URL('file:///notdriveletter/p/a/t/h/file'));
    readFileSync(new URL('file:///c/p/a/t/h/file'));
    // TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must be absolute
    ```

`file:` [URL](url.md#the-whatwg-url-api)s with drive letters must use `:` as a separator just after the drive letter. Using another separator will result in an error.

On all other platforms, `file:` [URL](url.md#the-whatwg-url-api)s with a host name are unsupported and will result in an error:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';
    // On other platforms:

    // - WHATWG file URLs with hostname are unsupported
    // file://hostname/p/a/t/h/file => throw!
    readFileSync(new URL('file://hostname/p/a/t/h/file'));
    // TypeError [ERR_INVALID_FILE_URL_PATH]: must be absolute

    // - WHATWG file URLs convert to absolute path
    // file:///tmp/hello => /tmp/hello
    readFileSync(new URL('file:///tmp/hello'));
    ```

A `file:` [URL](url.md#the-whatwg-url-api) having encoded slash characters will result in an error on all platforms:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

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

On Windows, `file:` [URL](url.md#the-whatwg-url-api)s having encoded backslash will result in an error:

=== "MJS"

    ```js
    import { readFileSync } from 'node:fs';

    // On Windows
    readFileSync(new URL('file:///C:/path/%5C'));
    readFileSync(new URL('file:///C:/path/%5c'));
    /* TypeError [ERR_INVALID_FILE_URL_PATH]: File URL path must not include encoded
    \ or / characters */
    ```

#### Buffer paths

Paths specified using a [Buffer](buffer.md#buffer) are useful primarily on certain POSIX operating systems that treat file paths as opaque byte sequences. On such systems, it is possible for a single file path to contain sub-sequences that use multiple character encodings. As with string paths, [Buffer](buffer.md#buffer) paths may be relative or absolute:

Example using an absolute path on POSIX:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';
    import { Buffer } from 'node:buffer';

    let fd;
    try {
      fd = await open(Buffer.from('/open/some/file.txt'), 'r');
      // Do something with the file
    } finally {
      await fd?.close();
    }
    ```

#### Per-drive working directories on Windows

On Windows, Node.js follows the concept of per-drive working directory. This behavior can be observed when using a drive path without a backslash. For example `fs.readdirSync('C:\\')` can potentially return a different result than `fs.readdirSync('C:')`. For more information, see [this MSDN page][msdn-rel-path].

### File descriptors

On POSIX systems, for every process, the kernel maintains a table of currently open files and resources. Each open file is assigned a simple numeric identifier called a _file descriptor_. At the system-level, all file system operations use these file descriptors to identify and track each specific file. Windows systems use a different but conceptually similar mechanism for tracking resources. To simplify things for users, Node.js abstracts away the differences between operating systems and assigns all open files a numeric file descriptor.

The callback-based `fs.open()`, and synchronous `fs.openSync()` methods open a file and allocate a new file descriptor. Once allocated, the file descriptor may be used to read data from, write data to, or request information about the file.

Operating systems limit the number of file descriptors that may be open at any given time so it is critical to close the descriptor when operations are completed. Failure to do so will result in a memory leak that will eventually cause an application to crash.

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

          // use stat

          closeFd(fd);
        });
      } catch (err) {
        closeFd(fd);
        throw err;
      }
    });
    ```

The promise-based APIs use a [FileHandle](#filehandle) object in place of the numeric file descriptor. These objects are better managed by the system to ensure that resources are not leaked. However, it is still required that they are closed when operations are completed:

=== "MJS"

    ```js
    import { open } from 'node:fs/promises';

    let file;
    try {
      file = await open('/open/some/file.txt', 'r');
      const stat = await file.stat();
      // use stat
    } finally {
      await file.close();
    }
    ```

### Threadpool usage

All callback and promise-based file system APIs (with the exception of `fs.FSWatcher()`) use libuv's threadpool. This can have surprising and negative performance implications for some applications. See the [`UV_THREADPOOL_SIZE`](cli.md#uv_threadpool_sizesize) documentation for more information.

### File system flags

The following flags are available wherever the `flag` option takes a string.

-   `'a'`: Open file for appending. The file is created if it does not exist.

-   `'ax'`: Like `'a'` but fails if the path exists.

-   `'a+'`: Open file for reading and appending. The file is created if it does not exist.

-   `'ax+'`: Like `'a+'` but fails if the path exists.

-   `'as'`: Open file for appending in synchronous mode. The file is created if it does not exist.

-   `'as+'`: Open file for reading and appending in synchronous mode. The file is created if it does not exist.

-   `'r'`: Open file for reading. An exception occurs if the file does not exist.

-   `'rs'`: Open file for reading in synchronous mode. An exception occurs if the file does not exist.

-   `'r+'`: Open file for reading and writing. An exception occurs if the file does not exist.

-   `'rs+'`: Open file for reading and writing in synchronous mode. Instructs the operating system to bypass the local file system cache.

    This is primarily useful for opening files on NFS mounts as it allows skipping the potentially stale local cache. It has a very real impact on I/O performance so using this flag is not recommended unless it is needed.

    This doesn't turn `fs.open()` or `fsPromises.open()` into a synchronous blocking call. If synchronous operation is desired, something like `fs.openSync()` should be used.

-   `'w'`: Open file for writing. The file is created (if it does not exist) or truncated (if it exists).

-   `'wx'`: Like `'w'` but fails if the path exists.

-   `'w+'`: Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).

-   `'wx+'`: Like `'w+'` but fails if the path exists.

`flag` can also be a number as documented by open(2); commonly used constants are available from `fs.constants`. On Windows, flags are translated to their equivalent ones where applicable, e.g. `O_WRONLY` to `FILE_GENERIC_WRITE`, or `O_EXCL|O_CREAT` to `CREATE_NEW`, as accepted by `CreateFileW`.

The exclusive flag `'x'` (`O_EXCL` flag in open(2)) causes the operation to return an error if the path already exists. On POSIX, if the path is a symbolic link, using `O_EXCL` returns an error even if the link is to a path that does not exist. The exclusive flag might not work with network file systems.

On Linux, positional writes don't work when the file is opened in append mode. The kernel ignores the position argument and always appends the data to the end of the file.

Modifying a file rather than replacing it may require the `flag` option to be set to `'r+'` rather than the default `'w'`.

The behavior of some flags are platform-specific. As such, opening a directory on macOS and Linux with the `'a+'` flag, as in the example below, will return an error. In contrast, on Windows and FreeBSD, a file descriptor or a `FileHandle` will be returned.

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

On Windows, opening an existing hidden file using the `'w'` flag (either through `fs.open()`, `fs.writeFile()`, or `fsPromises.open()`) will fail with `EPERM`. Existing hidden files can be opened for writing with the `'r+'` flag.

A call to `fs.ftruncate()` or `filehandle.truncate()` can be used to reset the file contents.

[#25741]: https://github.com/nodejs/node/issues/25741
[common system errors]: errors.md#common-system-errors
[fs constants]: #fs-constants
[file access constants]: #file-access-constants
[file modes]: #file-modes
[mdn-date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
[mdn-number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#number_type
[msdn-rel-path]: https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file#fully-qualified-vs-relative-paths
[msdn-using-streams]: https://docs.microsoft.com/en-us/windows/desktop/FileIO/using-streams
[naming files, paths, and namespaces]: https://docs.microsoft.com/en-us/windows/desktop/FileIO/naming-a-file
[`ahafs`]: https://developer.ibm.com/articles/au-aix_event_infrastructure/
[`buffer.bytelength`]: buffer.md#static-method-bufferbytelengthstring-encoding
[`fsevents`]: https://developer.apple.com/documentation/coreservices/file_system_events
[`number.max_safe_integer`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER
[`readdirectorychangesw`]: https://docs.microsoft.com/en-us/windows/desktop/api/winbase/nf-winbase-readdirectorychangesw
[`uv_threadpool_size`]: cli.md#uv_threadpool_sizesize
[`event ports`]: https://illumos.org/man/port_create
[`filehandle.createreadstream()`]: #filehandlecreatereadstreamoptions
[`filehandle.createwritestream()`]: #filehandlecreatewritestreamoptions
[`filehandle.pull()`]: #filehandlepulltransforms-options
[`filehandle.writefile()`]: #filehandlewritefiledata-options
[`fs.access()`]: #fsaccesspath-mode-callback
[`fs.accesssync()`]: #fsaccesssyncpath-mode
[`fs.chmod()`]: #fschmodpath-mode-callback
[`fs.chown()`]: #fschownpath-uid-gid-callback
[`fs.copyfile()`]: #fscopyfilesrc-dest-mode-callback
[`fs.copyfilesync()`]: #fscopyfilesyncsrc-dest-mode
[`fs.createreadstream()`]: #fscreatereadstreampath-options
[`fs.createwritestream()`]: #fscreatewritestreampath-options
[`fs.exists()`]: #fsexistspath-callback
[`fs.fstat()`]: #fsfstatfd-options-callback
[`fs.ftruncate()`]: #fsftruncatefd-len-callback
[`fs.futimes()`]: #fsfutimesfd-atime-mtime-callback
[`fs.lstat()`]: #fslstatpath-options-callback
[`fs.lutimes()`]: #fslutimespath-atime-mtime-callback
[`fs.mkdir()`]: #fsmkdirpath-options-callback
[`fs.mkdtemp()`]: #fsmkdtempprefix-options-callback
[`fs.open()`]: #fsopenpath-flags-mode-callback
[`fs.opendir()`]: #fsopendirpath-options-callback
[`fs.opendirsync()`]: #fsopendirsyncpath-options
[`fs.read()`]: #fsreadfd-buffer-offset-length-position-callback
[`fs.readfile()`]: #fsreadfilepath-options-callback
[`fs.readfilesync()`]: #fsreadfilesyncpath-options
[`fs.readdir()`]: #fsreaddirpath-options-callback
[`fs.readdirsync()`]: #fsreaddirsyncpath-options
[`fs.readv()`]: #fsreadvfd-buffers-position-callback
[`fs.realpath()`]: #fsrealpathpath-options-callback
[`fs.rm()`]: #fsrmpath-options-callback
[`fs.rmsync()`]: #fsrmsyncpath-options
[`fs.rmdir()`]: #fsrmdirpath-options-callback
[`fs.stat()`]: #fsstatpath-options-callback
[`fs.statfs()`]: #fsstatfspath-options-callback
[`fs.symlink()`]: #fssymlinktarget-path-type-callback
[`fs.utimes()`]: #fsutimespath-atime-mtime-callback
[`fs.watch()`]: #fswatchfilename-options-listener
[`fs.write(fd, buffer...)`]: #fswritefd-buffer-offset-length-position-callback
[`fs.write(fd, string...)`]: #fswritefd-string-position-encoding-callback
[`fs.writefile()`]: #fswritefilefile-data-options-callback
[`fs.writev()`]: #fswritevfd-buffers-position-callback
[`fspromises.access()`]: #fspromisesaccesspath-mode
[`fspromises.copyfile()`]: #fspromisescopyfilesrc-dest-mode
[`fspromises.mkdtemp()`]: #fspromisesmkdtempprefix-options
[`fspromises.open()`]: #fspromisesopenpath-flags-mode
[`fspromises.opendir()`]: #fspromisesopendirpath-options
[`fspromises.rm()`]: #fspromisesrmpath-options
[`fspromises.stat()`]: #fspromisesstatpath-options
[`fspromises.utimes()`]: #fspromisesutimespath-atime-mtime
[`inotify(7)`]: https://man7.org/linux/man-pages/man7/inotify.7.html
[`kqueue(2)`]: https://www.freebsd.org/cgi/man.cgi?query=kqueue&sektion=2
[`minimatch`]: https://github.com/isaacs/minimatch
[`node:stream/iter`]: stream_iter.md
[`stream/iter pipeto()`]: stream_iter.md#pipetosource-transforms-writer
[`stream/iter pull()`]: stream_iter.md#pullsource-transforms-options
[`stream/iter pullsync()`]: stream_iter.md#pullsyncsource-transforms
[`util.promisify()`]: util.md#utilpromisifyoriginal
[bigints]: https://tc39.github.io/proposal-bigint
[caveats]: #caveats
[chcp]: https://ss64.com/nt/chcp.html
[inode]: https://en.wikipedia.org/wiki/Inode
[support of file system `flags`]: #file-system-flags
