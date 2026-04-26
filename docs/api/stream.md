---
title: Поток
description: Поток — абстрактный интерфейс для работы с потоковыми данными в Node.js
---

# Поток {#stream}

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

**Поток** — это абстрактный интерфейс для работы с потоковыми данными в Node.js. Модуль `node:stream` предоставляет API для реализации интерфейса потока.

В Node.js существует множество объектов потока. Например, [запрос к HTTP-серверу](http.md#class-httpincomingmessage) и [`process.stdout`](process.md#processstdout) являются экземплярами потока.

Потоки могут быть доступны для чтения, для записи или и для того, и для другого. Все потоки являются экземплярами [`EventEmitter`](events.md#class-eventemitter).

Чтобы получить доступ к модулю `node:stream`:

```js
const stream = require('node:stream');
```

Модуль `node:stream` полезен для создания новых типов экземпляров потоков. Обычно нет необходимости использовать модуль `node:stream` для потребления потоков.

## Организация данного документа

Этот документ содержит два основных раздела и третий раздел для примечаний. В первом разделе объясняется, как использовать существующие потоки в приложении. Во втором разделе объясняется, как создавать новые типы потоков.

## Типы потоков

В Node.js существует четыре основных типа потоков:

-   [`Writable`](#class-streamwritable): потоки, в которые можно записывать данные (например, [`fs.createWriteStream()`](fs.md#fscreatewritestreampath-options)).
-   [`Readable`](#class-streamreadable): потоки, из которых можно читать данные (например, [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options)).
-   [`Duplex`](#class-streamduplex): потоки, которые являются одновременно `Readable` и `Writable` (например, [`net.Socket`](net.md#class-netsocket)).
-   [`Transform`](#class-streamtransform): потоки `Duplex`, которые могут изменять или преобразовывать данные по мере их записи и чтения (например, [`zlib.createDeflate()`](zlib.md#zlibcreatedeflateoptions)).

Кроме того, в этот модуль входят служебные функции [`stream.duplexPair()`](#streamduplexpairoptions), [`stream.pipeline()`](#streampipelinesource-transforms-destination-callback), [`stream.finished()`](#streamfinishedstream-options-callback), [`stream.Readable.from()`](#streamreadablefromiterable-options) и [`stream.addAbortSignal()`](#streamaddabortsignalsignal-stream).

### API промисов для потоков

API `stream/promises` предоставляет альтернативный набор асинхронных служебных функций для потоков, которые возвращают объекты `Promise`, а не используют обратные вызовы. API доступен через `require('node:stream/promises')` или `require('node:stream').promises`.

### `stream.pipeline(streams[, options])`

### `stream.pipeline(source[, ...transforms], destination[, options])`

-   `streams` [`<Stream[]>`](stream.md#stream) | [`<Iterable[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable[]>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `source` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `...transforms` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `destination` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конвейера
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal)
    -   `end` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Завершать поток назначения, когда завершается поток-источник. Потоки `Transform` всегда завершаются, даже если значение `false`. **По умолчанию:** `true`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется, когда конвейер завершён.

=== "CJS"

    ```js
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');
    const zlib = require('node:zlib');

    async function run() {
      await pipeline(
        fs.createReadStream('archive.tar'),
        zlib.createGzip(),
        fs.createWriteStream('archive.tar.gz'),
      );
      console.log('Pipeline succeeded.');
    }

    run().catch(console.error);
    ```

=== "MJS"

    ```js
    import { pipeline } from 'node:stream/promises';
    import { createReadStream, createWriteStream } from 'node:fs';
    import { createGzip } from 'node:zlib';

    await pipeline(
      createReadStream('archive.tar'),
      createGzip(),
      createWriteStream('archive.tar.gz'),
    );
    console.log('Pipeline succeeded.');
    ```

Чтобы использовать `AbortSignal`, передайте его внутри объекта `options` последним аргументом. Когда сигнал будет прерван, на базовом конвейере будет вызван `destroy` с `AbortError`.

=== "CJS"

    ```js
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');
    const zlib = require('node:zlib');

    async function run() {
      const ac = new AbortController();
      const signal = ac.signal;

      setImmediate(() => ac.abort());
      await pipeline(
        fs.createReadStream('archive.tar'),
        zlib.createGzip(),
        fs.createWriteStream('archive.tar.gz'),
        { signal },
      );
    }

    run().catch(console.error); // ожидается AbortError
    ```

=== "MJS"

    ```js
    import { pipeline } from 'node:stream/promises';
    import { createReadStream, createWriteStream } from 'node:fs';
    import { createGzip } from 'node:zlib';

    const ac = new AbortController();
    const { signal } = ac;
    setImmediate(() => ac.abort());
    try {
      await pipeline(
        createReadStream('archive.tar'),
        createGzip(),
        createWriteStream('archive.tar.gz'),
        { signal },
      );
    } catch (err) {
      console.error(err); // ожидается AbortError
    }
    ```

API `pipeline` также поддерживает асинхронные генераторы:

=== "CJS"

    ```js
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');

    async function run() {
      await pipeline(
        fs.createReadStream('lowercase.txt'),
        async function* (source, { signal }) {
          source.setEncoding('utf8');  // Работаем со строками, а не с `Buffer`.
          for await (const chunk of source) {
            yield await processChunk(chunk, { signal });
          }
        },
        fs.createWriteStream('uppercase.txt'),
      );
      console.log('Pipeline succeeded.');
    }

    run().catch(console.error);
    ```

=== "MJS"

    ```js
    import { pipeline } from 'node:stream/promises';
    import { createReadStream, createWriteStream } from 'node:fs';

    await pipeline(
      createReadStream('lowercase.txt'),
      async function* (source, { signal }) {
        source.setEncoding('utf8');  // Строки вместо `Buffer`.
        for await (const chunk of source) {
          yield await processChunk(chunk, { signal });
        }
      },
      createWriteStream('uppercase.txt'),
    );
    console.log('Pipeline succeeded.');
    ```

Не забывайте обрабатывать аргумент `signal`, передаваемый в асинхронный генератор. Особенно когда асинхронный генератор является источником конвейера (то есть первым аргументом) иначе конвейер может никогда не завершиться.

=== "CJS"

    ```js
    const { pipeline } = require('node:stream/promises');
    const fs = require('node:fs');

    async function run() {
      await pipeline(
        async function* ({ signal }) {
          await someLongRunningfn({ signal });
          yield 'asd';
        },
        fs.createWriteStream('uppercase.txt'),
      );
      console.log('Pipeline succeeded.');
    }

    run().catch(console.error);
    ```

=== "MJS"

    ```js
    import { pipeline } from 'node:stream/promises';
    import fs from 'node:fs';
    await pipeline(
      async function* ({ signal }) {
        await someLongRunningfn({ signal });
        yield 'asd';
      },
      fs.createWriteStream('uppercase.txt'),
    );
    console.log('Pipeline succeeded.');
    ```

API `pipeline` также предоставляет [версию с обратным вызовом](#streampipelinesource-transforms-destination-callback):

### `stream.finished(stream[, options])`

-   `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | [`<WritableStream>`](webstreams.md#class-writablestream) Поток для чтения и/или записи или веб-поток.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `error` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | `undefined`
    -   `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | `undefined`
    -   `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | `undefined`
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) | `undefined`
    -   `cleanup` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | `undefined` Если `true`, удаляет слушателей, зарегистрированных этой функцией, до выполнения промиса. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется, когда поток перестаёт быть доступным для чтения или записи.

=== "CJS"

    ```js
    const { finished } = require('node:stream/promises');
    const fs = require('node:fs');

    const rs = fs.createReadStream('archive.tar');

    async function run() {
      await finished(rs);
      console.log('Stream is done reading.');
    }

    run().catch(console.error);
    rs.resume(); // Слить буфер потока.
    ```

=== "MJS"

    ```js
    import { finished } from 'node:stream/promises';
    import { createReadStream } from 'node:fs';

    const rs = createReadStream('archive.tar');

    async function run() {
      await finished(rs);
      console.log('Stream is done reading.');
    }

    run().catch(console.error);
    rs.resume(); // Слить буфер потока.
    ```

API `finished` также предоставляет [версию с обратным вызовом](#streamfinishedstream-options-callback).

`stream.finished()` оставляет «висящие» обработчики событий (в частности `'error'`, `'end'`, `'finish'` и `'close'`) после того, как возвращённый промис выполнен или отклонён. Это сделано для того, чтобы неожиданные события `'error'` (из-за некорректных реализаций потоков) не приводили к неожиданным сбоям. Если такое поведение нежелательно, установите `options.cleanup` в `true`:

=== "MJS"

    ```js
    await finished(rs, { cleanup: true });
    ```

### Объектный режим {#object-mode}

Все потоки, создаваемые API Node.js, работают исключительно со строками и объектами [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) и [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView):

-   `String` и `Buffer` — наиболее распространённые типы для потоков.
-   `TypedArray` и `DataView` позволяют обрабатывать двоичные данные с типами вроде `Int32Array` или `Uint8Array`. При записи TypedArray или DataView в поток Node.js обрабатывает сырые байты.

Тем не менее реализации потоков могут работать и с другими типами значений JavaScript (за исключением `null`, который в потоках имеет особое назначение). Такие потоки считаются работающими в «объектном режиме».

Экземпляры переводятся в объектный режим опцией `objectMode` при создании потока. Переключить уже существующий поток в объектный режим безопасно нельзя.

### Буферизация

И [`Writable`](#class-streamwritable), и [`Readable`](#class-streamreadable) потоки хранят данные во внутреннем буфере.

Объём потенциально буферизуемых данных зависит от опции `highWaterMark`, передаваемой в конструктор потока. Для обычных потоков `highWaterMark` задаёт [общее число байт](#highwatermark-discrepancy-after-calling-readablesetencoding). В объектном режиме — общее число объектов. Для потоков, работающих со строками (но не декодирующих их), — общее число кодовых единиц UTF-16.

Данные буферизуются в потоках `Readable`, когда реализация вызывает [`stream.push(chunk)`](#readablepushchunk-encoding). Если потребитель потока не вызывает [`stream.read()`](#readablereadsize), данные остаются во внутренней очереди, пока не будут прочитаны.

Когда суммарный размер внутреннего буфера чтения достигает порога `highWaterMark`, поток временно перестаёт читать данные из базового ресурса, пока данные в буфере не будут потреблены (то есть перестаёт вызываться внутренний метод [`readable._read()`](#readable_readsize), которым заполняется буфер чтения).

Данные буферизуются в потоках `Writable`, когда многократно вызывается [`writable.write(chunk)`](#writablewritechunk-encoding-callback). Пока суммарный размер внутреннего буфера записи ниже порога `highWaterMark`, вызовы `writable.write()` возвращают `true`. Когда размер буфера достигает или превышает `highWaterMark`, возвращается `false`.

Ключевая цель API `stream`, в частности метода [`stream.pipe()`](#readablepipedestination-options), — ограничить буферизацию до приемлемого уровня, чтобы источники и приёмники с разной скоростью не исчерпывали доступную память.

Опция `highWaterMark` — это порог, а не жёсткий лимит: она задаёт объём данных, который поток буферизует, прежде чем перестать запрашивать новые данные. В общем случае она не гарантирует строгое ограничение памяти. Конкретные реализации могут вводить более жёсткие ограничения, но это необязательно.

Поскольку потоки [`Duplex`](#class-streamduplex) и [`Transform`](#class-streamtransform) одновременно `Readable` и `Writable`, у каждого есть _два_ отдельных внутренних буфера для чтения и записи, чтобы стороны работали независимо друг от друга и сохраняли эффективный поток данных. Например, экземпляры [`net.Socket`](net.md#class-netsocket) — это [`Duplex`](#class-streamduplex), у которых сторона `Readable` позволяет читать данные, полученные _из_ сокета, а сторона `Writable` — записывать данные _в_ сокет. Поскольку запись в сокет может идти быстрее или медленнее, чем приём, каждая сторона должна работать (и буферизовать) независимо.

Механика внутренней буферизации — деталь реализации и может меняться. Для продвинутых сценариев внутренние буферы доступны через `writable.writableBuffer` или `readable.readableBuffer`. Использование этих недокументированных свойств не рекомендуется.

## API для потребителей потоков {#api-for-stream-consumers}

Почти все приложения Node.js в той или иной форме используют потоки. Ниже пример использования потоков в приложении с HTTP-сервером:

```js
const http = require('node:http');

const server = http.createServer((req, res) => {
    // `req` — http.IncomingMessage, читаемый поток.
    // `res` — http.ServerResponse, записываемый поток.

    let body = '';
    // Данные в виде строк UTF-8.
    // Если кодировку не задать, в колбэк придут объекты Buffer.
    req.setEncoding('utf8');

    // У Readable после добавления слушателя идут события 'data'.
    req.on('data', (chunk) => {
        body += chunk;
    });

    // Событие 'end' — тело запроса полностью получено.
    req.on('end', () => {
        try {
            const data = JSON.parse(body);
            // Ответ пользователю: тип распарсенного JSON.
            res.write(typeof data);
            res.end();
        } catch (er) {
            // Невалидный JSON.
            res.statusCode = 400;
            return res.end(`error: ${er.message}`);
        }
    });
});

server.listen(1337);

// $ curl localhost:1337 -d "{}"
// ожидаемый вывод: object
// $ curl localhost:1337 -d "\"foo\""
// ожидаемый вывод: string
// $ curl localhost:1337 -d "not json"
// ожидаемый вывод: error: Unexpected token 'o', "not json" is not valid JSON
```

Потоки [`Writable`](#class-streamwritable) (например `res` в примере) предоставляют методы вроде `write()` и `end()` для записи данных в поток.

Потоки [`Readable`](#class-streamreadable) используют API [`EventEmitter`](events.md#class-eventemitter), чтобы уведомлять код о появлении данных; их можно читать разными способами.

И [`Writable`](#class-streamwritable), и [`Readable`](#class-streamreadable) используют [`EventEmitter`](events.md#class-eventemitter) для передачи состояния потока.

Потоки [`Duplex`](#class-streamduplex) и [`Transform`](#class-streamtransform) одновременно [`Writable`](#class-streamwritable) и [`Readable`](#class-streamreadable).

Приложения, которые только пишут в поток или читают из него, не обязаны реализовывать интерфейсы потоков сами и обычно не вызывают `require('node:stream')`.

Разработчикам новых типов потоков см. раздел [API для реализаторов потоков](#api-for-stream-implementers).

### Потоки Writable {#writable-streams}

Потоки Writable — абстракция _приёмника_, куда записываются данные.

Примеры потоков [`Writable`](#class-streamwritable):

-   [HTTP-запросы на клиенте](http.md#class-httpclientrequest)
-   [HTTP-ответы на сервере](http.md#class-httpserverresponse)
-   [потоки записи в файлы](fs.md#class-fswritestream)
-   [потоки zlib](zlib.md)
-   [потоки crypto](crypto.md)
-   [TCP-сокеты](net.md#class-netsocket)
-   [stdin дочернего процесса](child_process.md#subprocessstdin)
-   [`process.stdout`](process.md#processstdout), [`process.stderr`](process.md#processstderr)

Некоторые из них на самом деле [`Duplex`](#class-streamduplex), реализующие интерфейс [`Writable`](#class-streamwritable).

Все потоки [`Writable`](#class-streamwritable) реализуют интерфейс класса `stream.Writable`.

Конкретные экземпляры [`Writable`](#class-streamwritable) могут отличаться, но общий шаблон использования один, как в примере:

```js
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data');
```

#### Класс: `stream.Writable` {#class-streamwritable}

##### Событие: `'close'` (`stream.Writable`)

Событие `'close'` испускается, когда закрыты поток и его базовые ресурсы (например дескриптор файла). Оно означает, что больше не будет событий и дальнейших вычислений.

Поток [`Writable`](#class-streamwritable) всегда испускает `'close'`, если создан с опцией `emitClose`.

##### Событие: `'drain'` {#event-drain}

Если [`stream.write(chunk)`](#writablewritechunk-encoding-callback) возвращает `false`, событие `'drain'` испускается, когда снова можно возобновлять запись в поток.

```js
// Записать данные в переданный writable поток миллион раз.
// Учитывайте обратное давление (backpressure).
function writeOneMillionTimes(
    writer,
    data,
    encoding,
    callback
) {
    let i = 1000000;
    write();
    function write() {
        let ok = true;
        do {
            i--;
            if (i === 0) {
                // Последняя итерация.
                writer.write(data, encoding, callback);
            } else {
                // Продолжаем или ждём.
                // Колбэк не передаём — работа ещё не закончена.
                ok = writer.write(data, encoding);
            }
        } while (i > 0 && ok);
        if (i > 0) {
            // Остановились раньше — дописать после события drain.
            writer.once('drain', write);
        }
    }
}
```

##### Событие: `'error'` (`stream.Writable`)

-   Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` испускается при ошибке записи или передачи по каналу `pipe`. Обработчику передаётся один аргумент — `Error`.

Поток закрывается при `'error'`, если при создании [`autoDestroy`](#new-streamwritableoptions) не был `false`.

После `'error'` больше не должно быть событий, кроме `'close'` (включая повторные `'error'`).

##### Событие: `'finish'` {#event-finish}

Событие `'finish'` испускается после вызова [`stream.end()`](#writableendchunk-encoding-callback), когда все данные сброшены в нижележащую систему.

```js
const writer = getWritableStreamSomehow();
for (let i = 0; i < 100; i++) {
    writer.write(`hello, #${i}!\n`);
}
writer.on('finish', () => {
    console.log('All writes are now complete.');
});
writer.end('This is the end\n');
```

##### Событие: `'pipe'`

-   `src` [`<stream.Readable>`](stream.md#class-streamreadable) читаемый поток, подключаемый к этому `Writable`

Событие `'pipe'` испускается при вызове [`stream.pipe()`](#readablepipedestination-options) на читаемом потоке, когда этот `Writable` добавляется в список назначений.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('pipe', (src) => {
    console.log('Something is piping into the writer.');
    assert.equal(src, reader);
});
reader.pipe(writer);
```

##### Событие: `'unpipe'`

-   `src` [`<stream.Readable>`](stream.md#class-streamreadable) исходный поток, который [отключает](#readableunpipedestination) этот `Writable`

Событие `'unpipe'` испускается при вызове [`stream.unpipe()`](#readableunpipedestination) на [`Readable`](#class-streamreadable), когда этот [`Writable`](#class-streamwritable) удаляется из назначений.

Также испускается, если этот [`Writable`](#class-streamwritable) выдаёт ошибку при подключении [`Readable`](#class-streamreadable) через `pipe`.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('unpipe', (src) => {
    console.log(
        'Something has stopped piping into the writer.'
    );
    assert.equal(src, reader);
});
reader.pipe(writer);
reader.unpipe(writer);
```

##### `writable.cork()`

Метод `writable.cork()` буферизует все записанные данные в памяти. Сброс происходит при вызове [`stream.uncork()`](#writableuncork) или [`stream.end()`](#writableendchunk-encoding-callback).

`writable.cork()` рассчитан на серию мелких порций подряд: вместо немедленной отправки вниз буфер накапливается до `writable.uncork()`, затем передаётся в `writable._writev()`, если он есть. Это снижает риск «блокировки в голове очереди», когда данные ждут обработки первой порции. Без реализации `writable._writev()` пропускная способность может страдать.

См. также: [`writable.uncork()`](#writableuncork), [`writable._writev()`](#writable_writevchunks-callback).

##### `writable.destroy([error])`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) необязательно — ошибка для события `'error'`
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает поток. Может испустить `'error'` и `'close'` (если `emitClose` не `false`). После вызова поток завершён; дальнейшие `write()`/`end()` дают `ERR_STREAM_DESTROYED`. Это немедленное разрушение: предыдущие `write()` могли не успеть сброситься, и тоже приведут к `ERR_STREAM_DESTROYED`. Если нужно сначала сбросить данные, используйте `end()` или дождитесь `'drain'` перед уничтожением.

=== "CJS"

    ```js
    const { Writable } = require('node:stream');

    const myStream = new Writable();

    const fooErr = new Error('foo error');
    myStream.destroy(fooErr);
    myStream.on('error', (fooErr) => console.error(fooErr.message)); // ошибка foo
    ```

=== "CJS"

    ```js
    const { Writable } = require('node:stream');

    const myStream = new Writable();

    myStream.destroy();
    myStream.on('error', function wontHappen() {});
    ```

=== "CJS"

    ```js
    const { Writable } = require('node:stream');

    const myStream = new Writable();
    myStream.destroy();

    myStream.write('foo', (error) => console.error(error.code));
    // код ошибки: ERR_STREAM_DESTROYED
    ```

После вызова `destroy()` любые дальнейшие вызовы не выполняют действий, а в виде `'error'` могут испускаться только ошибки из `_destroy()`.

Реализаторам не следует переопределять этот метод; вместо этого нужно реализовать [`writable._destroy()`](#writable_destroyerr-callback).

##### `writable.closed`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после испускания `'close'`.

##### `writable.destroyed`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`writable.destroy()`](#writabledestroyerror).

=== "CJS"

    ```js
    const { Writable } = require('node:stream');

    const myStream = new Writable();

    console.log(myStream.destroyed); // в консоли: false
    myStream.destroy();
    console.log(myStream.destroyed); // в консоли: true
    ```

##### `writable.end([chunk[, encoding]][, callback])`

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | any необязательные данные для записи. Вне объектного режима `chunk` должен быть [строкой](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView). В объектном режиме — любое значение JavaScript, кроме `null`.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) кодировка, если `chunk` — строка
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается по завершении потока
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`writable.end()` сообщает, что больше данных писать не будет. Необязательные `chunk` и `encoding` позволяют записать последнюю порцию перед закрытием.

Вызов [`stream.write()`](#writablewritechunk-encoding-callback) после [`stream.end()`](#writableendchunk-encoding-callback) приведёт к ошибке.

```js
// Записать 'hello, ' и завершить строкой 'world!'.
const fs = require('node:fs');
const file = fs.createWriteStream('example.txt');
file.write('hello, ');
file.end('world!');
// Дальше писать нельзя.
```

##### `writable.setDefaultEncoding(encoding)`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) новая кодировка по умолчанию
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`writable.setDefaultEncoding()` задаёт кодировку по умолчанию для [`Writable`](#class-streamwritable).

##### `writable.uncork()`

`writable.uncork()` сбрасывает данные, буферизованные после [`stream.cork()`](#writablecork).

При использовании [`writable.cork()`](#writablecork)/`writable.uncork()` откладывайте `uncork` через `process.nextTick()`, чтобы сгруппировать все `write()` в одной фазе цикла событий.

```js
stream.cork();
stream.write('some ');
stream.write('data ');
process.nextTick(() => stream.uncork());
```

Если [`writable.cork()`](#writablecork) вызывали несколько раз, столько же раз нужно вызвать `writable.uncork()`, чтобы сбросить буфер.

```js
stream.cork();
stream.write('some ');
stream.cork();
stream.write('data ');
process.nextTick(() => {
    stream.uncork();
    // Данные не сбросятся, пока uncork() не вызовут второй раз.
    stream.uncork();
});
```

См. также: [`writable.cork()`](#writablecork).

##### `writable.writable`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если безопасно вызывать [`writable.write()`](#writablewritechunk-encoding-callback): поток не уничтожен, не в ошибке и не завершён.

##### `writable.writableAborted`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Показывает, был ли поток уничтожен или переведён в ошибку до события `'finish'`.

##### `writable.writableEnded`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`writable.end()`](#writableendchunk-encoding-callback). Не отражает, сброшены ли данные; для этого см. [`writable.writableFinished`](#writablewritablefinished).

##### `writable.writableCorked`

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Сколько раз ещё нужно вызвать [`writable.uncork()`](#writableuncork), чтобы полностью снять cork.

##### `writable.errored`

-   Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Ошибка, если поток уничтожен с ошибкой.

##### `writable.writableFinished`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Становится `true` непосредственно перед событием [`'finish'`](#event-finish).

##### `writable.writableHighWaterMark`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Значение `highWaterMark`, переданное при создании этого `Writable`.

##### `writable.writableLength`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число байт (или объектов) в очереди на запись; показывает состояние относительно `highWaterMark`.

##### `writable.writableNeedDrain`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если буфер был заполнен и поток испустит `'drain'`.

##### `writable.writableObjectMode`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Геттер свойства `objectMode` у данного потока `Writable`.

##### `writable[Symbol.asyncDispose]()`

Вызывает [`writable.destroy()`](#writabledestroyerror) с `AbortError` и возвращает промис, который выполняется после завершения потока.

##### `writable.write(chunk[, encoding][, callback])`

-   `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | любые данные для записи. Вне объектного режима — [строка](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView); в объектном режиме — любое значение, кроме `null`.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null кодировка, если `chunk` — строка. **По умолчанию:** `'utf8'`
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается после сброса этой порции
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если нужно дождаться [`'drain'`](#event-drain) перед дальнейшей записью; иначе `true`.

`writable.write()` записывает данные и вызывает `callback`, когда порция обработана. При ошибке `callback` получает её первым аргументом; вызывается асинхронно и до `'error'`.

`true`, если после приёма `chunk` внутренний буфер ниже `highWaterMark` при создании потока. При `false` не продолжайте запись до [`'drain'`](#event-drain).

Пока поток не «освобождается», `write()` буферизует порции и возвращает `false`. После сброса всех буферов в ОС испускается `'drain'`. Если `write()` вернул `false`, не пишите дальше до `'drain'`. Повторные `write()` на неосвобождённом потоке разрешены, но Node.js буферизует всё до исчерпания памяти и аварийного завершения. Даже до этого высокое потребление памяти ухудшает работу GC и RSS (объём редко возвращается системе). TCP-сокет может не «освобождаться», если удалённая сторона не читает — запись в такой сокет опасна.

Для [`Transform`](#class-streamtransform) запись при отсутствии `'drain'` особенно критична: `Transform` по умолчанию на паузе, пока не подключён канал `pipe` или обработчики `'data'`/`'readable'`.

Если данные можно получать по требованию, лучше оформить это как [`Readable`](#class-streamreadable) и [`stream.pipe()`](#readablepipedestination-options). Если нужен именно `write()`, учитывайте обратное давление через [`'drain'`](#event-drain):

```js
function write(data, cb) {
    if (!stream.write(data)) {
        stream.once('drain', cb);
    } else {
        process.nextTick(cb);
    }
}

// Ждать вызова cb перед следующей записью.
write('hello', () => {
    console.log('Write completed, do more writes now.');
});
```

В объектном режиме `Writable` игнорирует аргумент `encoding`.

### Потоки Readable {#readable-streams}

Потоки Readable — абстракция _источника_, из которого потребляют данные.

Примеры потоков `Readable`:

-   [HTTP-ответы на клиенте](http.md#class-httpincomingmessage)
-   [HTTP-запросы на сервере](http.md#class-httpincomingmessage)
-   [потоки чтения из файлов](fs.md#class-fsreadstream)
-   [потоки zlib](zlib.md)
-   [потоки crypto](crypto.md)
-   [TCP-сокеты](net.md#class-netsocket)
-   [stdout и stderr дочернего процесса](child_process.md#subprocessstdout)
-   [`process.stdin`](process.md#processstdin)

Все потоки [`Readable`](#class-streamreadable) реализуют интерфейс класса `stream.Readable`.

#### Два режима чтения

`Readable` работает в одном из режимов: потоковом (`flowing`) или приостановленном (`paused`). Это не то же самое, что [объектный режим](#object-mode): объектный режим может быть включён или нет независимо.

-   В потоковом режиме данные читаются из нижележащей системы автоматически и по возможности быстро доставляются приложению через события [`EventEmitter`](events.md#class-eventemitter).

-   В приостановленном режиме порции нужно явно забирать через [`stream.read()`](#readablereadsize).

Изначально все [`Readable`](#class-streamreadable) находятся в режиме `paused`; переход в `flowing` происходит при:

-   подписка на [`'data'`](#event-data);
-   вызов [`stream.resume()`](#readableresume);
-   вызов [`stream.pipe()`](#readablepipedestination-options) к [`Writable`](#class-streamwritable).

Обратно в режим `paused`:

-   без назначений `pipe` — [`stream.pause()`](#readablepause);
-   с `pipe` — удалить все назначения (в том числе через [`stream.unpipe()`](#readableunpipedestination)).

Важно: `Readable` не генерирует данные, пока не задан способ потребления или игнорирования. Если механизм потребления отключён, поток _пытается_ прекратить генерацию.

Из соображений совместимости удаление обработчиков [`'data'`](#event-data) **не** ставит поток на паузу автоматически. При наличии `pipe` вызов [`stream.pause()`](#readablepause) не гарантирует, что поток _останется_ на паузе, когда назначения снова запросят данные.

Если `Readable` переведён в режим `flowing` и некому обрабатывать данные, они теряются (например `readable.resume()` без слушателя `'data'` или снятый обработчик `'data'`).

Обработчик [`'readable'`](#event-readable) выводит поток из режима `flowing`; данные читают через [`readable.read()`](#readablereadsize). Если `'readable'` снят, режим `flowing` возобновится при наличии [`'data'`](#event-data).

#### Три состояния {#three-states}

«Два режима» — упрощение для внутреннего состояния `Readable`.

В каждый момент у `Readable` одно из:

-   `readable.readableFlowing === null`
-   `readable.readableFlowing === false`
-   `readable.readableFlowing === true`

При `null` механизм потребления не задан — поток не генерирует данные. Подписка на `'data'`, `readable.pipe()` или `readable.resume()` ставит `readable.readableFlowing` в `true`, и поток начинает активно выдавать события.

`readable.pause()`, `readable.unpipe()` или обратное давление ставят `readable.readableFlowing` в `false`: события приостанавливаются, генерация данных не обязательно. В этом состоянии новый слушатель `'data'` не переключает `readable.readableFlowing` в `true`.

```js
const { PassThrough, Writable } = require('node:stream');
const pass = new PassThrough();
const writable = new Writable();

pass.pipe(writable);
pass.unpipe(writable);
// readableFlowing сейчас false.

pass.on('data', (chunk) => {
    console.log(chunk.toString());
});
// readableFlowing по-прежнему false.
pass.write('ok'); // событие 'data' не уйдёт.
pass.resume(); // нужно вызвать, чтобы пошли 'data'.
// readableFlowing стал true.
```

При `readable.readableFlowing === false` данные могут накапливаться во внутреннем буфере потока.

#### Выберите один стиль API

API `Readable` развивался несколько версий Node.js и даёт разные способы чтения. Обычно нужно выбрать _один_ способ потребления и _не смешивать_ несколько на одном потоке. Сочетание `on('data')`, `on('readable')`, `pipe()` или асинхронных итераторов даёт неочевидное поведение.

#### Класс: `stream.Readable` {#class-streamreadable}

##### Событие: `'close'` (`stream.Readable`)

Событие `'close'` генерируется, когда поток и любой из его базовых ресурсов (например, дескриптор файла) закрыты. Оно означает, что дальнейших событий не будет и вычислений не продолжится.

Поток [`Readable`](#class-streamreadable) всегда испускает `'close'`, если создан с опцией `emitClose`.

##### Событие: `'data'` {#event-data}

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | any Фрагмент данных. Вне объектного режима это строка или `Buffer`. В объектном режиме — любое значение JavaScript, кроме `null`.

Событие `'data'` генерируется всякий раз, когда поток передаёт фрагмент данных потребителю: при переходе в потоковый режим через `readable.pipe()`, `readable.resume()` или при подписке на `'data'`, а также при вызове `readable.read()`, когда данные готовы к выдаче.

Подписка на `'data'` у потока, который явно не приостановлен, переводит его в потоковый режим; данные передаются по мере поступления.

Если для потока задана кодировка через `readable.setEncoding()`, в колбэк передаётся строка; иначе — `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes of data.`);
});
```

##### Событие: `'end'` {#event-end}

Событие `'end'` генерируется, когда из потока больше нечего читать.

Событие `'end'` **не будет** испущено, пока данные полностью не потреблены: переведите поток в потоковый режим или вызывайте [`stream.read()`](#readablereadsize) до полного опустошения буфера.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes of data.`);
});
readable.on('end', () => {
    console.log('There will be no more data.');
});
```

##### Событие: `'error'` (`stream.Readable`)

-   Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` реализация `Readable` может испустить в любой момент — обычно при сбое источника данных или при попытке передать недопустимый фрагмент.

В колбэк передаётся один объект `Error`.

##### Событие: `'pause'`

Событие `'pause'` генерируется при вызове [`stream.pause()`](#readablepause), если `readableFlowing` не `false`.

##### Событие: `'readable'` {#event-readable}

Событие `'readable'` генерируется, когда в потоке есть данные для чтения до порога `highWaterMark` (`state.highWaterMark`): в буфере появилась новая порция. При наличии данных в буфере можно вызывать [`stream.read()`](#readablereadsize). Также `'readable'` может прийти при достижении конца потока.

```js
const readable = getReadableStreamSomehow();
readable.on('readable', function () {
    // Сейчас есть что прочитать.
    let data;

    while ((data = this.read()) !== null) {
        console.log(data);
    }
});
```

Если конец потока уже достигнут, вызов [`stream.read()`](#readablereadsize) вернёт `null` и инициирует `'end'`. То же, если данных не было вовсе: в примере `foo.txt` — пустой файл:

```js
const fs = require('node:fs');
const rr = fs.createReadStream('foo.txt');
rr.on('readable', () => {
    console.log(`readable: ${rr.read()}`);
});
rr.on('end', () => {
    console.log('end');
});
```

Вывод скрипта:

```console
$ node test.js
readable: null
end
```

В некоторых случаях подписка на `'readable'` приводит к тому, что часть данных читается во внутренний буфер.

Обычно проще `readable.pipe()` и событие `'data'`, чем `'readable'`, но обработка `'readable'` иногда даёт большую пропускную способность.

Если одновременно используются `'readable'` и [`'data'`](#event-data), потоком управляет `'readable'`: `'data'` приходит только при вызове [`stream.read()`](#readablereadsize), свойство `readableFlowing` становится `false`. Если при снятии подписки на `'readable'` остались слушатели `'data'`, поток снова переходит в потоковый режим — `'data'` идут без вызова `.resume()`.

##### Событие: `'resume'`

Событие `'resume'` генерируется при вызове [`stream.resume()`](#readableresume), если `readableFlowing` не `true`.

##### `readable.destroy([error])`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка, передаваемая в событии `'error'`
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает поток, при необходимости испуская `'error'` и `'close'` (если `emitClose` не `false`). После вызова освобождаются внутренние ресурсы, дальнейшие вызовы `push()` игнорируются.

После `destroy()` повторные вызовы — no-op; новые `'error'` (кроме из `_destroy()`) не ожидаются.

Реализации не должны переопределять этот метод — реализуйте [`readable._destroy()`](#readable_destroyerr-callback).

##### `readable.closed`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после события `'close'`.

##### `readable.destroyed`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`readable.destroy()`](#readabledestroyerror).

##### `readable.isPaused()`

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`readable.isPaused()` возвращает текущее состояние `Readable`; в основном используется механизмом `readable.pipe()`. В типичных сценариях вызывать напрямую не требуется.

```js
const readable = new stream.Readable();

readable.isPaused(); // === false (не на паузе)
readable.pause();
readable.isPaused(); // === true (на паузе)
readable.resume();
readable.isPaused(); // === false (снова не на паузе)
```

##### `readable.pause()`

-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.pause()` останавливает испускание [`'data'`](#event-data) в потоковом режиме и выводит поток из потокового режима. Данные остаются во внутреннем буфере.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
    console.log(`Received ${chunk.length} bytes of data.`);
    readable.pause();
    console.log(
        'There will be no additional data for 1 second.'
    );
    setTimeout(() => {
        console.log('Now data will start flowing again.');
        readable.resume();
    }, 1000);
});
```

`readable.pause()` не действует, если есть слушатель `'readable'`.

##### `readable.pipe(destination[, options])`

-   `destination` [`<stream.Writable>`](stream.md#class-streamwritable) Поток назначения для записи
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры `pipe`
-   `end` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Завершать поток записи при `'end'` потока чтения. **По умолчанию:** `true`.
-   Возвращает: [`<stream.Writable>`](stream.md#class-streamwritable) `destination` для цепочки `pipe`, если это [`Duplex`](#class-streamduplex) или [`Transform`](#class-streamtransform)

`readable.pipe()` подключает [`Writable`](#class-streamwritable) к `readable`, переводит его в потоковый режим и передаёт все данные в этот [`Writable`](#class-streamwritable). Поток данных регулируется так, чтобы быстрый `Readable` не перегружал приёмник.

Пример: весь вывод из `readable` — в файл `file.txt`:

```js
const fs = require('node:fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// Весь вывод readable попадает в 'file.txt'.
readable.pipe(writable);
```

К одному `Readable` можно подключить несколько `Writable`.

`readable.pipe()` возвращает ссылку на _destination_, что позволяет строить цепочки:

```js
const fs = require('node:fs');
const zlib = require('node:zlib');
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```

По умолчанию на конечном `Writable` вызывается [`stream.end()`](#writableendchunk-encoding-callback), когда источник `Readable` испускает [`'end'`](#event-end), и запись завершается. Чтобы оставить поток открытым, передайте `end: false`:

```js
reader.pipe(writer, { end: false });
reader.on('end', () => {
    writer.end('Goodbye\n');
});
```

Важно: если при обработке `Readable` возникает ошибка, `Writable` назначения _автоматически не закрывается_ — потоки нужно закрыть _вручную_, иначе возможны утечки памяти.

[`process.stderr`](process.md#processstderr) и [`process.stdout`](process.md#processstdout) не закрываются до выхода процесса Node.js, независимо от опций.

##### `readable.read([size])`

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательно — сколько байт прочитать.
-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | null | any

`readable.read()` читает данные из внутреннего буфера. Если данных нет — `null`. По умолчанию возвращается `Buffer`, если не задана кодировка через `readable.setEncoding()` или объектный режим.

Аргумент `size` задаёт число байт; если их нет, вернётся `null`, _если только_ поток не завершён — тогда отдаётся остаток буфера.

Без `size` возвращается всё содержимое буфера.

`size` не больше 1 GiB.

`readable.read()` следует вызывать у `Readable` в приостановленном режиме. В потоковом режиме `readable.read()` вызывается автоматически до опустошения буфера.

```js
const readable = getReadableStreamSomehow();

// 'readable' может срабатывать несколько раз по мере накопления данных
readable.on('readable', () => {
    let chunk;
    console.log(
        'Stream is readable (new data received in buffer)'
    );
    // Цикл, чтобы прочитать все доступные сейчас данные
    while (null !== (chunk = readable.read())) {
        console.log(
            `Read ${chunk.length} bytes of data...`
        );
    }
});

// 'end' — один раз, когда данных больше нет
readable.on('end', () => {
    console.log('Reached end of stream.');
});
```

Каждый вызов `readable.read()` возвращает фрагмент или `null`, если сейчас читать нечего. Фрагменты не склеиваются автоматически; для полного чтения часто нужен цикл `while`. При чтении большого файла `.read()` может временно вернуть `null`, если буфер опустошен, но данные ещё поступят — тогда снова придёт `'readable'`, а `'end'` означает конец передачи.

Чтобы прочитать файл целиком, собирайте фрагменты за несколько событий `'readable'`:

```js
const chunks = [];

readable.on('readable', () => {
    let chunk;
    while (null !== (chunk = readable.read())) {
        chunks.push(chunk);
    }
});

readable.on('end', () => {
    const content = chunks.join('');
});
```

В объектном режиме `Readable` каждый вызов [`readable.read(size)`](#readablereadsize) возвращает ровно один элемент, независимо от `size`.

Если `readable.read()` вернул фрагмент данных, дополнительно испускается `'data'`.

После [`'end'`](#event-end) вызов [`stream.read([size])`](#readablereadsize) даёт `null` без исключения.

##### `readable.readable`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если безопасно вызывать [`readable.read()`](#readablereadsize): поток не уничтожен и не испустил `'error'` или `'end'`.

##### `readable.readableAborted`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, был ли поток уничтожен или завершён с ошибкой до `'end'`.

##### `readable.readableDidRead`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, было ли испущено событие `'data'`.

##### `readable.readableEncoding`

-   Тип: null | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Геттер свойства `encoding` для данного `Readable`. Кодировку задаёт [`readable.setEncoding()`](#readablesetencodingencoding).

##### `readable.readableEnded`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Становится `true` при событии [`'end'`](#event-end).

##### `readable.errored`

-   Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Ошибка, если поток уничтожен с ошибкой.

##### `readable.readableFlowing`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отражает состояние `Readable`, см. раздел [Три состояния](#three-states).

##### `readable.readableHighWaterMark`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Значение `highWaterMark`, переданное при создании этого `Readable`.

##### `readable.readableLength`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число байт (или объектов) в очереди на чтение; показывает заполнение относительно `highWaterMark`.

##### `readable.readableObjectMode`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Геттер свойства `objectMode` для данного `Readable`.

##### `readable.resume()`

-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.resume()` возобновляет испускание [`'data'`](#event-data) у явно приостановленного `Readable`, переводя поток в потоковый режим.

Можно использовать, чтобы «проглотить» данные без их обработки:

```js
getReadableStreamSomehow()
    .resume()
    .on('end', () => {
        console.log(
            'Reached the end, but did not read anything.'
        );
    });
```

`readable.resume()` не действует при наличии слушателя `'readable'`.

##### `readable.setEncoding(encoding)`

-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка.
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.setEncoding()` задаёт кодировку для данных, читаемых из `Readable`.

По умолчанию кодировка не задана — данные приходят как `Buffer`. При установке кодировки строки возвращаются в этой кодировке. Например, `readable.setEncoding('utf8')` даёт строки UTF-8, `readable.setEncoding('hex')` — шестнадцатеричные строки.

`Readable` корректно обрабатывает многобайтовые символы, которые иначе могли бы некорректно декодироваться при чтении сырых `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.setEncoding('utf8');
readable.on('data', (chunk) => {
    assert.equal(typeof chunk, 'string');
    console.log(
        'Got %d characters of string data:',
        chunk.length
    );
});
```

##### `readable.unpipe([destination])`

-   `destination` [`<stream.Writable>`](stream.md#class-streamwritable) Необязательно — какой поток отсоединить
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.unpipe()` отсоединяет ранее подключённый через [`stream.pipe()`](#readablepipedestination-options) `Writable`.

Если `destination` не указан, отсоединяются все подключения `pipe`.

Если указан `destination`, но подключение `pipe` к нему не было настроено, метод ничего не делает.

```js
const fs = require('node:fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// Данные из readable идут в 'file.txt',
// но только в течение первой секунды.
readable.pipe(writable);
setTimeout(() => {
    console.log('Stop writing to file.txt.');
    readable.unpipe(writable);
    console.log('Manually close the file stream.');
    writable.end();
}, 1000);
```

##### `readable.unshift(chunk[, encoding])`

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | any Фрагмент, помещаемый во внутреннюю очередь чтения. Вне объектного режима — [строка](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) или `null`. В объектном режиме — любое значение JavaScript.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строковых фрагментов; допустимая для `Buffer`, например `'utf8'` или `'ascii'`.

`chunk === null` задаёт конец потока (EOF), как `readable.push(null)`; дальше данные не пишутся. Маркер EOF ставится в конец буфера; накопленные данные всё равно выдаются.

`readable.unshift()` возвращает фрагмент во внутренний буфер. Полезно, когда код уже прочитал лишнее и должен «откатить» данные, чтобы передать их дальше.

После [`'end'`](#event-end) вызвать `stream.unshift(chunk)` нельзя — будет ошибка.

Часто уместнее [`Transform`](#class-streamtransform) вместо `stream.unshift()`; см. [API для реализаторов потоков](#api-for-stream-implementers).

```js
// Снять заголовок, разделённый от тела последовательностью \n\n.
// Если прочитали лишнее — вернуть через unshift().
// Вызвать callback с аргументами (error, header, stream).
const { StringDecoder } = require('node:string_decoder');
function parseHeader(stream, callback) {
    stream.on('error', callback);
    stream.on('readable', onReadable);
    const decoder = new StringDecoder('utf8');
    let header = '';
    function onReadable() {
        let chunk;
        while (null !== (chunk = stream.read())) {
            const str = decoder.write(chunk);
            if (str.includes('\n\n')) {
                // Найдена граница заголовка.
                const split = str.split(/\n\n/);
                header += split.shift();
                const remaining = split.join('\n\n');
                const buf = Buffer.from(remaining, 'utf8');
                stream.removeListener('error', callback);
                // Снять слушатель 'readable' до unshift.
                stream.removeListener(
                    'readable',
                    onReadable
                );
                if (buf.length) stream.unshift(buf);
                // Дальше из потока можно читать тело сообщения.
                callback(null, header, stream);
                return;
            }
            // Продолжаем читать заголовок.
            header += str;
        }
    }
}
```

В отличие от [`stream.push(chunk)`](#readablepushchunk-encoding), `stream.unshift(chunk)` не сбрасывает внутреннее состояние чтения. Вызов `readable.unshift()` во время чтения (например из [`stream._read()`](#readable_readsize)) может дать неожиданный эффект; после `unshift` иногда ставят немедленный [`stream.push('')`](#readablepushchunk-encoding), но лучше не вызывать `unshift` в процессе `_read`.

##### `readable.wrap(stream)`

-   `stream` [`<Stream>`](stream.md#stream) «Старый» readable-поток
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

До Node.js 0.10 потоки не соответствовали нынешнему API `node:stream` (см. [совместимость](#compatibility-with-older-nodejs-versions)).

Если старая библиотека испускает [`'data'`](#event-data) и [`stream.pause()`](#readablepause) лишь рекомендательный, `readable.wrap()` оборачивает её в новый [`Readable`](#class-streamreadable).

`wrap()` нужен редко; оставлен для работы со старым кодом.

```js
const { OldReader } = require('./old-api-module.js');
const { Readable } = require('node:stream');
const oreader = new OldReader();
const myReader = new Readable().wrap(oreader);

myReader.on('readable', () => {
    myReader.read(); // и т. д.
});
```

##### `readable[Symbol.asyncIterator]()`

-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) для полного потребления потока.

```js
const fs = require('node:fs');

async function print(readable) {
    readable.setEncoding('utf8');
    let data = '';
    for await (const chunk of readable) {
        data += chunk;
    }
    console.log(data);
}

print(fs.createReadStream('file')).catch(console.error);
```

Если цикл завершается через `break`, `return` или `throw`, поток будет уничтожен. Иными словами, итерация по потоку полностью его потребляет. Данные читаются порциями размера, задаваемого опцией `highWaterMark`. В примере выше данные окажутся в одной порции, если файл меньше 64 КиБ, потому что [`fs.createReadStream()`](fs.md#fscreatereadstreampath-options) вызывается без `highWaterMark`.

##### `readable[Symbol.for('Stream.toAsyncStreamable')]()`

> Стабильность: 1 – Экспериментальная

-   Возвращает: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) `AsyncIterable<Uint8Array[]>`, отдающий батчи фрагментов из потока.

При включённом флаге `--experimental-stream-iter` потоки `Readable` реализуют протокол [`Stream.toAsyncStreamable`](stream_iter.md#streamtoasyncstreamable), что позволяет эффективно потреблять их через API [`stream/iter`](stream_iter.md).

Это даёт батчевый асинхронный итератор: внутренний буфер потока сливается в батчи `Uint8Array[]`, распределяя накладные расходы `Promise` на фрагмент по сравнению со стандартным путём `Symbol.asyncIterator`. Для потоков в байтовом режиме фрагменты отдаются как экземпляры `Buffer` (они являются подклассами `Uint8Array`). В объектном режиме или при кодировке каждый фрагмент перед батчированием нормализуется в `Uint8Array`.

Возвращаемый итератор помечается как проверенный источник, поэтому [`from()`](stream_iter.md#frominput) передаёт его дальше без дополнительной нормализации.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { text, from } from 'node:stream/iter';

    const readable = new Readable({
      read() { this.push('hello'); this.push(null); },
    });

    // Readable автоматически потребляется через toAsyncStreamable
    console.log(await text(from(readable))); // вывод: 'hello'
    ```

=== "CJS"

    ```js
    const { Readable } = require('node:stream');
    const { text, from } = require('node:stream/iter');

    async function run() {
      const readable = new Readable({
        read() { this.push('hello'); this.push(null); },
      });

      console.log(await text(from(readable))); // вывод: 'hello'
    }

    run().catch(console.error);
    ```

Без флага `--experimental-stream-iter` вызов этого метода выбрасывает [`ERR_STREAM_ITER_MISSING_FLAG`](errors.md#err_stream_iter_missing_flag).

##### `readable[Symbol.asyncDispose]()`

Вызывает [`readable.destroy()`](#readabledestroyerror) с `AbortError` и возвращает промис, который выполняется, когда поток завершён.

##### `readable.compose(stream[, options])`

-   `stream` [`<Writable>`](stream.md#class-streamwritable) | [`<Duplex>`](stream.md#class-streamduplex) | [`<WritableStream>`](webstreams.md#class-writablestream) | [`<TransformStream>`](webstreams.md#class-transformstream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Duplex>`](stream.md#class-streamduplex) поток, составленный с потоком `stream`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';

    async function* splitToWords(source) {
      for await (const chunk of source) {
        const words = String(chunk).split(' ');

        for (const word of words) {
          yield word;
        }
      }
    }

    const wordsStream = Readable.from(['text passed through', 'composed stream']).compose(splitToWords);
    const words = await wordsStream.toArray();

    console.log(words); // вывод: ['text', 'passed', 'through', 'composed', 'stream']
    ```

`readable.compose(s)` эквивалентно `stream.compose(readable, s)`.

Также можно передать [AbortSignal](globals.md#abortsignal): при прерывании будет уничтожен составной поток.

Подробнее см. [`stream.compose(...streams)`](#streamcomposestreams).

##### `readable.iterator([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `destroyOnReturn` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при значении `false` вызов `return` у асинхронного итератора или выход из `for await...of` через `break`, `return` или `throw` не уничтожает поток. **По умолчанию:** `true`.
-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) для потребления потока.

Итератор, созданный этим методом, позволяет отменить уничтожение потока при выходе из цикла `for await...of` через `return`, `break` или `throw`, либо наоборот уничтожать поток при ошибке в ходе итерации — в зависимости от настроек.

```js
const { Readable } = require('node:stream');

async function printIterator(readable) {
    for await (const chunk of readable.iterator({
        destroyOnReturn: false,
    })) {
        console.log(chunk); // 1
        break;
    }

    console.log(readable.destroyed); // false — при break поток не уничтожен

    for await (const chunk of readable.iterator({
        destroyOnReturn: false,
    })) {
        console.log(chunk); // сначала 2, затем 3
    }

    console.log(readable.destroyed); // true — поток полностью прочитан
}

async function printSymbolAsyncIterator(readable) {
    for await (const chunk of readable) {
        console.log(chunk); // 1
        break;
    }

    console.log(readable.destroyed); // true — стандартный for await...of уничтожает поток
}

async function showBoth() {
    await printIterator(Readable.from([1, 2, 3]));
    await printSymbolAsyncIterator(
        Readable.from([1, 2, 3])
    );
}

showBoth();
```

##### `readable.map(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, применяемая к каждому фрагменту потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) сколько элементов буферизовать в ожидании потребления отображённых. **По умолчанию:** `concurrency * 2 - 1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Readable>`](stream.md#readable-streams) поток, полученный отображением через `fn`.

Отображает поток: `fn` вызывается для каждого фрагмента. Если `fn` возвращает промис, он ожидается перед передачей в результирующий поток.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';

    // Синхронное отображение.
    for await (const chunk of Readable.from([1, 2, 3, 4]).map((x) => x * 2)) {
      console.log(chunk); // 2, 4, 6, 8
    }
    // Асинхронное отображение, не более 2 параллельных запросов.
    const resolver = new Resolver();
    const dnsResults = Readable.from([
      'nodejs.org',
      'openjsf.org',
      'www.linuxfoundation.org',
    ]).map((domain) => resolver.resolve4(domain), { concurrency: 2 });
    for await (const result of dnsResults) {
      console.log(result); // результат resolver.resolve4 для домена
    }
    ```

##### `readable.filter(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция фильтрации фрагментов потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) сколько элементов буферизовать в ожидании потребления отфильтрованных. **По умолчанию:** `concurrency * 2 - 1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Readable>`](stream.md#readable-streams) поток после фильтрации предикатом `fn`.

Фильтрует поток: для каждого фрагмента вызывается `fn`; при истинном результате фрагмент попадает в выходной поток. Промисы от `fn` ожидаются.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';

    // Синхронный предикат.
    for await (const chunk of Readable.from([1, 2, 3, 4]).filter((x) => x > 2)) {
      console.log(chunk); // 3, 4
    }
    // Асинхронный предикат, не более 2 параллельных запросов.
    const resolver = new Resolver();
    const dnsResults = Readable.from([
      'nodejs.org',
      'openjsf.org',
      'www.linuxfoundation.org',
    ]).filter(async (domain) => {
      const { address } = await resolver.resolve4(domain, { ttl: true });
      return address.ttl > 60;
    }, { concurrency: 2 });
    for await (const result of dnsResults) {
      // домены, у записи DNS TTL больше 60 с
      console.log(result);
    }
    ```

##### `readable.forEach(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, вызываемая для каждого фрагмента потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис завершения обхода.

Обходит поток и вызывает `fn` для каждого фрагмента; промисы от `fn` ожидаются.

В отличие от `for await...of`, допускается параллельная обработка фрагментов. Остановить `forEach` можно через `signal` и `AbortController`; `for await...of` — через `break`/`return`. В обоих случаях поток уничтожается.

В отличие от подписки на [`'data'`](#event-data), опирается на механизм [`readable`](#class-streamreadable) и может ограничивать число параллельных вызовов `fn`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';

    // Синхронный предикат.
    for await (const chunk of Readable.from([1, 2, 3, 4]).filter((x) => x > 2)) {
      console.log(chunk); // 3, 4
    }
    // Асинхронный предикат, не более 2 параллельных запросов.
    const resolver = new Resolver();
    const dnsResults = Readable.from([
      'nodejs.org',
      'openjsf.org',
      'www.linuxfoundation.org',
    ]).map(async (domain) => {
      const { address } = await resolver.resolve4(domain, { ttl: true });
      return address;
    }, { concurrency: 2 });
    await dnsResults.forEach((result) => {
      // как `for await (const result of dnsResults)`
      console.log(result);
    });
    console.log('done'); // поток обработан
    ```

##### `readable.toArray([options])`

> Стабильность: 1 – Экспериментальная

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет отменить операцию `toArray`, если сигнал прерван.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с массивом всех элементов потока.

Упрощает получение всех данных из потока.

Читает весь поток в память, сводя на нет преимущества потоковой обработки; для удобства и стыковки с API, не как основной способ потребления.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';

    await Readable.from([1, 2, 3, 4]).toArray(); // [1, 2, 3, 4]

    const resolver = new Resolver();

    // Параллельные DNS-запросы через .map и сбор результатов в массив через toArray
    const dnsResults = await Readable.from([
      'nodejs.org',
      'openjsf.org',
      'www.linuxfoundation.org',
    ]).map(async (domain) => {
      const { address } = await resolver.resolve4(domain, { ttl: true });
      return address;
    }, { concurrency: 2 }).toArray();
    ```

##### `readable.some(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, вызываемая для каждого фрагмента потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) `true`, если для хотя бы одного фрагмента `fn` дал истинное значение.

Аналог `Array.prototype.some`: `fn` вызывается для фрагментов, пока не получится истинный результат после `await`; тогда поток уничтожается и промис выполняется с `true`. Если ни один фрагмент не подошёл — `false`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { stat } from 'node:fs/promises';

    // Синхронный предикат.
    await Readable.from([1, 2, 3, 4]).some((x) => x > 2); // true
    await Readable.from([1, 2, 3, 4]).some((x) => x < 0); // false

    // Асинхронный предикат, не более 2 параллельных проверок файлов.
    const anyBigFile = await Readable.from([
      'file1',
      'file2',
      'file3',
    ]).some(async (fileName) => {
      const stats = await stat(fileName);
      return stats.size > 1024 * 1024;
    }, { concurrency: 2 });
    console.log(anyBigFile); // true, если хотя бы один файл в списке больше 1 МБ
    console.log('done'); // поток обработан
    ```

##### `readable.find(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, вызываемая для каждого фрагмента потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с первым фрагментом, для которого `fn` дала истинное значение, или `undefined`, если такого нет.

Поведение близко к `Array.prototype.find`: для каждого фрагмента вызывается `fn`. Как только ожидаемое значение от `fn` истинно, поток уничтожается и промис выполняется этим значением. Если для всех фрагментов `fn` дала ложное значение, промис выполняется с `undefined`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { stat } from 'node:fs/promises';

    // Синхронный предикат.
    await Readable.from([1, 2, 3, 4]).find((x) => x > 2); // 3
    await Readable.from([1, 2, 3, 4]).find((x) => x > 0); // 1
    await Readable.from([1, 2, 3, 4]).find((x) => x > 10); // undefined

    // Асинхронный предикат, не более 2 параллельных проверок файлов.
    const foundBigFile = await Readable.from([
      'file1',
      'file2',
      'file3',
    ]).find(async (fileName) => {
      const stats = await stat(fileName);
      return stats.size > 1024 * 1024;
    }, { concurrency: 2 });
    console.log(foundBigFile); // имя большого файла, если в списке есть файл > 1 МБ
    console.log('done'); // поток обработан
    ```

##### `readable.every(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, вызываемая для каждого фрагмента потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис со значением `true`, если для всех фрагментов `fn` дала истинное значение.

Поведение близко к `Array.prototype.every`: для каждого фрагмента проверяется ожидаемое значение `fn`. Если для какого-то фрагмента оно ложно, поток уничтожается и промис выполняется с `false`. Если для всех фрагментов значение истинно — промис выполняется с `true`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { stat } from 'node:fs/promises';

    // Синхронный предикат.
    await Readable.from([1, 2, 3, 4]).every((x) => x > 2); // false
    await Readable.from([1, 2, 3, 4]).every((x) => x > 0); // true

    // Асинхронный предикат, не более 2 параллельных проверок файлов.
    const allBigFiles = await Readable.from([
      'file1',
      'file2',
      'file3',
    ]).every(async (fileName) => {
      const stats = await stat(fileName);
      return stats.size > 1024 * 1024;
    }, { concurrency: 2 });
    // true, если все файлы в списке больше 1 МиБ
    console.log(allBigFiles);
    console.log('done'); // поток обработан
    ```

##### `readable.flatMap(fn[, options])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncGeneratorFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AsyncGeneratorFunction) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция, применяемая к каждому фрагменту потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум одновременных вызовов `fn` для потока. **По умолчанию:** `1`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Readable>`](stream.md#readable-streams) поток после `flatMap` с функцией `fn`.

Метод возвращает новый поток: к каждому фрагменту применяется переданная функция, результат сплющивается (flatten).

Из `fn` можно вернуть поток, итерируемый или асинхронно итерируемый объект — такие потоки сливаются в возвращаемый поток.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { createReadStream } from 'node:fs';

    // Синхронное отображение.
    for await (const chunk of Readable.from([1, 2, 3, 4]).flatMap((x) => [x, x])) {
      console.log(chunk); // 1, 1, 2, 2, 3, 3, 4, 4
    }
    // Асинхронно: объединить содержимое четырёх файлов
    const concatResult = Readable.from([
      './1.mjs',
      './2.mjs',
      './3.mjs',
      './4.mjs',
    ]).flatMap((fileName) => createReadStream(fileName));
    for await (const result of concatResult) {
      // здесь по очереди все фрагменты данных из четырёх файлов
      console.log(result);
    }
    ```

##### `readable.drop(limit[, options])`

> Стабильность: 1 – Экспериментальная

-   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) сколько начальных фрагментов отбросить.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Readable>`](stream.md#readable-streams) поток без первых `limit` фрагментов.

Метод возвращает новый поток: сброшены первые `limit` фрагментов.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';

    await Readable.from([1, 2, 3, 4]).drop(2).toArray(); // [3, 4]
    ```

##### `readable.take(limit[, options])`

> Стабильность: 1 – Экспериментальная

-   `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) сколько фрагментов взять с начала.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Readable>`](stream.md#readable-streams) поток из первых `limit` фрагментов.

Метод возвращает новый поток, содержащий только первые `limit` фрагментов.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';

    await Readable.from([1, 2, 3, 4]).take(2).toArray(); // [1, 2]
    ```

##### `readable.reduce(fn[, initial[, options]])`

> Стабильность: 1 – Экспериментальная

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) функция свёртки для каждого фрагмента потока.
    -   `previous` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение из предыдущего вызова `fn`, либо `initial`, если задано, иначе первый фрагмент потока.
    -   `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) фрагмент данных из потока.
    -   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `signal` [`<AbortSignal>`](globals.md#abortsignal) при уничтожении потока прерывается, что позволяет прервать вызов `fn` досрочно.
-   `initial` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) начальное значение свёртки.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет уничтожить поток при прерывании сигнала.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с итоговым значением свёртки.

Метод последовательно вызывает `fn` для каждого фрагмента, передавая результат предыдущего шага. Возвращает промис с финальным значением.

Если `initial` не задан, начальным значением становится первый фрагмент. Если поток пуст, промис отклоняется с `TypeError` и свойством кода `ERR_INVALID_ARGS`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { readdir, stat } from 'node:fs/promises';
    import { join } from 'node:path';

    const directoryPath = './src';
    const filesInDir = await readdir(directoryPath);

    const folderSize = await Readable.from(filesInDir)
      .reduce(async (totalSize, file) => {
        const { size } = await stat(join(directoryPath, file));
        return totalSize + size;
      }, 0);

    console.log(folderSize);
    ```

Свёртка идёт по одному элементу за раз — параметра `concurrency` и параллелизма нет. Чтобы сначала обработать фрагменты параллельно, используйте [`readable.map`](#readablemapfn-options), а затем `reduce`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { readdir, stat } from 'node:fs/promises';
    import { join } from 'node:path';

    const directoryPath = './src';
    const filesInDir = await readdir(directoryPath);

    const folderSize = await Readable.from(filesInDir)
      .map((file) => stat(join(directoryPath, file)), { concurrency: 2 })
      .reduce((totalSize, { size }) => totalSize + size, 0);

    console.log(folderSize);
    ```

### Потоки Duplex и Transform {#duplex-and-transform-streams}

#### Класс: `stream.Duplex` {#class-streamduplex}

Потоки `Duplex` реализуют и [`Readable`](#class-streamreadable), и [`Writable`](#class-streamwritable).

Примеры потоков `Duplex`:

-   [TCP-сокеты](net.md#class-netsocket)
-   [потоки zlib](zlib.md)
-   [потоки crypto](crypto.md)

##### `duplex.allowHalfOpen`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

При значении `false` запись на потоке завершается автоматически, когда заканчивается чтение. Задаётся опцией конструктора `allowHalfOpen` (**по умолчанию** `true`).

Значение можно изменить вручную для уже существующего `Duplex`, но только до испускания события `'end'`.

#### Класс: `stream.Transform` {#class-streamtransform}

Потоки `Transform` — это [`Duplex`](#class-streamduplex), выход которых тем или иным образом связан со входом. Как и у любого [`Duplex`](#class-streamduplex), у `Transform` есть и [`Readable`](#class-streamreadable), и [`Writable`](#class-streamwritable).

Примеры потоков `Transform`:

-   [потоки zlib](zlib.md)
-   [потоки crypto](crypto.md)

##### `transform.destroy([error])`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает поток и при необходимости испускает `'error'`. После вызова поток `Transform` освобождает внутренние ресурсы. Реализаторам не следует переопределять этот метод; нужно реализовать [`readable._destroy()`](#readable_destroyerr-callback). Реализация `_destroy()` для `Transform` по умолчанию также испускает `'close'`, если `emitClose` не `false`.

После `destroy()` дальнейшие вызовы не выполняют действий; в виде `'error'` могут исходить только ошибки из `_destroy()`.

#### `stream.duplexPair([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) значение, передаваемое в оба конструктора [`Duplex`](#class-streamduplex), например для настройки буферизации.
-   Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) из двух экземпляров [`Duplex`](#class-streamduplex).

Функция `duplexPair` возвращает массив из двух элементов — каждый это `Duplex`, связанный с другой стороной:

```js
const [sideA, sideB] = duplexPair();
```

Запись в один поток становится читаемой из другого — по смыслу это похоже на сеть: то, что отправляет клиент, читает сервер, и наоборот.

Оба `Duplex` симметричны: можно использовать любой из пары — поведение эквивалентно.

### `stream.finished(stream[, options], callback)`

-   `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | [`<WritableStream>`](webstreams.md#class-writablestream) поток чтения и/или записи или веб-поток.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `error` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при `false` вызов `emit('error', err)` не считается завершением. **По умолчанию:** `true`.
    -   `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при `false` колбэк вызывается по завершении потока, даже если чтение ещё возможно. **По умолчанию:** `true`.
    -   `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при `false` колбэк вызывается по завершении потока, даже если запись ещё возможна. **По умолчанию:** `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) позволяет прервать ожидание завершения. Сам поток при этом _не_ прерывается; колбэк получит `AbortError`. Слушатели, зарегистрированные этой функцией, будут сняты.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция с необязательным аргументом ошибки.
-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция очистки, снимающая зарегистрированные слушатели.

Уведомляет, когда поток перестаёт быть доступным для чтения или записи, завершился с ошибкой или преждевременно закрылся.

```js
const { finished } = require('node:stream');
const fs = require('node:fs');

const rs = fs.createReadStream('archive.tar');

finished(rs, (err) => {
    if (err) {
        console.error('Stream failed.', err);
    } else {
        console.log('Stream is done reading.');
    }
});

rs.resume(); // Слить буфер потока.
```

Особенно полезно при обработке ошибок, когда поток уничтожен преждевременно (например отменённый HTTP-запрос) и не испустит `'end'` или `'finish'`.

См. также [промис-версию](#streamfinishedstream-options) API `finished`.

`stream.finished()` оставляет «висящие» слушатели (`'error'`, `'end'`, `'finish'`, `'close'`) после вызова `callback`, чтобы неожиданные `'error'` (из-за некорректных реализаций потоков) не валили процесс. Если это нежелательно, вызовите возвращаемую функцию очистки внутри колбэка:

```js
const cleanup = finished(rs, (err) => {
    cleanup();
    // ...
});
```

### `stream.pipeline(source[, ...transforms], destination, callback)`

### `stream.pipeline(streams, callback)`

-   `streams` {Stream\[]|Iterable\[]|AsyncIterable\[]|Function\[]| ReadableStream\[]|WritableStream\[]|TransformStream\[]}
-   `source` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<ReadableStream>`](webstreams.md#readablestream)
    -   Возвращает: [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `...transforms` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<TransformStream>`](webstreams.md#class-transformstream)
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
-   `destination` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<WritableStream>`](webstreams.md#class-writablestream)
    -   `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
    -   Возвращает: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается по полному завершении конвейера.
    -   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    -   `val` разрешённое значение `Promise`, возвращённого `destination`.
-   Возвращает: [`<Stream>`](stream.md#stream)

Связывает потоки и генераторы, передаёт ошибки, корректно освобождает ресурсы и вызывает колбэк по завершении конвейера.

```js
const { pipeline } = require('node:stream');
const fs = require('node:fs');
const zlib = require('node:zlib');

// API pipeline связывает цепочку потоков
// и вызывает колбэк, когда конвейер полностью завершён.

// Пример: сжать большой tar-архив в gzip:

pipeline(
    fs.createReadStream('archive.tar'),
    zlib.createGzip(),
    fs.createWriteStream('archive.tar.gz'),
    (err) => {
        if (err) {
            console.error('Pipeline failed.', err);
        } else {
            console.log('Pipeline succeeded.');
        }
    }
);
```

См. также [промис-версию](#streampipelinesource-transforms-destination-options) API `pipeline`.

`stream.pipeline()` вызывает `stream.destroy(err)` для всех потоков, кроме:

-   `Readable`, уже испустивших `'end'` или `'close'`.
-   `Writable`, уже испустивших `'finish'` или `'close'`.

После вызова `callback` на потоках могут оставаться зарегистрированные слушатели. При повторном использовании потоков после ошибки это может давать утечки слушателей и «проглатывание» ошибок. Если последний поток — читаемый, лишние слушатели снимаются, чтобы поток можно было позже потребить снова.

При ошибке `stream.pipeline()` закрывает все участки конвейера. Сочетание `IncomingRequest` с `pipeline` может привести к неожиданному поведению: сокет уничтожается без отправки ожидаемого ответа. См. пример:

```js
const fs = require('node:fs');
const http = require('node:http');
const { pipeline } = require('node:stream');

const server = http.createServer((req, res) => {
    const fileStream = fs.createReadStream(
        './fileNotExist.txt'
    );
    pipeline(fileStream, res, (err) => {
        if (err) {
            console.log(err); // например ENOENT (файл не найден)
            // ответ уже не отправить: pipeline уничтожил сокет
            return res.end('error!!!');
        }
    });
});
```

### `stream.compose(...streams)`

> Стабильность: 1 – `stream.compose` экспериментальный.

-   `streams` {Stream\[]|Iterable\[]|AsyncIterable\[]|Function\[]| ReadableStream\[]|WritableStream\[]|TransformStream\[]|Duplex\[]|Function}
-   Возвращает: [`<stream.Duplex>`](stream.md#class-streamduplex)

Объединяет два и более потоков в один `Duplex`: запись идёт в первый, чтение — из последнего. Каждый переданный поток соединяется со следующим через `stream.pipeline`. При ошибке в любом из участников уничтожаются все, включая внешний `Duplex`.

`stream.compose` возвращает новый поток, который сам можно подключать к другим — так строится композиция. В отличие от этого, в `stream.pipeline` обычно первый поток — только чтение, а последний — только запись, замкнутая цепочка.

Если передана `Function`, это должна быть фабрика с аргументом `source` — `Iterable`.

=== "MJS"

    ```js
    import { compose, Transform } from 'node:stream';

    const removeSpaces = new Transform({
      transform(chunk, encoding, callback) {
        callback(null, String(chunk).replace(' ', ''));
      },
    });

    async function* toUpper(source) {
      for await (const chunk of source) {
        yield String(chunk).toUpperCase();
      }
    }

    let res = '';
    for await (const buf of compose(removeSpaces, toUpper).end('hello world')) {
      res += buf;
    }

    console.log(res); // вывод: 'HELLOWORLD'
    ```

`stream.compose` можно использовать, чтобы превратить async-итерируемые объекты, генераторы и функции в потоки.

-   `AsyncIterable` — в читаемый `Duplex`; нельзя отдавать `null`.
-   `AsyncGeneratorFunction` — в transform `Duplex` с чтением и записью; первый параметр — исходный `AsyncIterable`; нельзя отдавать `null`.
-   `AsyncFunction` — в записываемый `Duplex`; должна возвращать `null` или `undefined`.

=== "MJS"

    ```js
    import { compose } from 'node:stream';
    import { finished } from 'node:stream/promises';

    // AsyncIterable → читаемый Duplex.
    const s1 = compose(async function*() {
      yield 'Hello';
      yield 'World';
    }());

    // AsyncGenerator → transform Duplex.
    const s2 = compose(async function*(source) {
      for await (const chunk of source) {
        yield String(chunk).toUpperCase();
      }
    });

    let res = '';

    // AsyncFunction → записываемый Duplex.
    const s3 = compose(async function(source) {
      for await (const chunk of source) {
        res += chunk;
      }
    });

    await finished(compose(s1, s2, s3));

    console.log(res); // вывод: 'HELLOWORLD'
    ```

Для удобства на [Readable](stream.md#readable-streams) и [Duplex](stream.md#class-streamduplex) доступен метод [`readable.compose(stream)`](#readablecomposestream-options) как обёртка над этой функцией.

### `stream.isErrored(stream)`

-   `stream` [`<Readable>`](stream.md#readable-streams) | [`<Writable>`](stream.md#class-streamwritable) | [`<Duplex>`](stream.md#class-streamduplex) | [`<WritableStream>`](webstreams.md#class-writablestream) | [`<ReadableStream>`](webstreams.md#readablestream)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, встретила ли поток ошибка.

### `stream.isReadable(stream)`

-   `stream` [`<Readable>`](stream.md#readable-streams) | [`<Duplex>`](stream.md#class-streamduplex) | [`<ReadableStream>`](webstreams.md#readablestream)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | null — `null` только если `stream` не является допустимым `Readable`, `Duplex` или `ReadableStream`.

Возвращает, доступен ли поток для чтения.

### `stream.isWritable(stream)`

-   `stream` [`<Writable>`](stream.md#class-streamwritable) | [`<Duplex>`](stream.md#class-streamduplex) | [`<WritableStream>`](webstreams.md#class-writablestream)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | null — `null` только если `stream` не является допустимым `Writable`, `Duplex` или `WritableStream`.

Возвращает, доступен ли поток для записи.

### `stream.Readable.from(iterable[, options])`

-   `iterable` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) объект с протоколом `Symbol.asyncIterator` или `Symbol.iterator`. Испускает `'error'`, если передано значение `null`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) опции для `new stream.Readable([options])`. По умолчанию `Readable.from()` выставляет `options.objectMode` в `true`, если явно не задать `options.objectMode: false`.
-   Возвращает: [`<stream.Readable>`](stream.md#class-streamreadable)

Служебный метод создания читаемых потоков из итераторов.

```js
const { Readable } = require('node:stream');

async function* generate() {
    yield 'hello';
    yield 'streams';
}

const readable = Readable.from(generate());

readable.on('data', (chunk) => {
    console.log(chunk);
});
```

`Readable.from(string)` и `Readable.from(buffer)` не разбивают строку или буфер на элементы итератора — для согласованности с другими потоками и производительности.

Если в `Iterable` попадают промисы, возможны необработанные отклонения.

```js
const { Readable } = require('node:stream');

Readable.from([
    new Promise((resolve) =>
        setTimeout(resolve('1'), 1500)
    ),
    new Promise((_, reject) =>
        setTimeout(reject(new Error('2')), 1000)
    ), // необработанное отклонение промиса
]);
```

### `stream.Readable.fromWeb(readableStream[, options])` {#class-streamreadablefromwebreadablestream-options}

-   `readableStream` [`<ReadableStream>`](webstreams.md#readablestream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal)
-   Возвращает: [`<stream.Readable>`](stream.md#class-streamreadable)

### `stream.Readable.isDisturbed(stream)`

-   `stream` [`<stream.Readable>`](stream.md#class-streamreadable) | [`<ReadableStream>`](webstreams.md#readablestream)
-   Возвращает: `boolean`

Возвращает, было ли чтение из потока или он отменён.

### `stream.Readable.toWeb(streamReadable[, options])` {#class-streamreadabletowebstreamreadable-options}

-   `streamReadable` [`<stream.Readable>`](stream.md#class-streamreadable)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `strategy` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
        -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимальный размер внутренней очереди создаваемого `ReadableStream` до применения обратного давления при чтении из исходного `stream.Readable`. Если не задано, берётся из переданного `stream.Readable`.
        -   `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция размера фрагмента данных. Если не задана, для всех фрагментов размер считается равным `1`.
            -   `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
            -   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) тип создаваемого `ReadableStream`: `'bytes'` или `undefined`.
-   Возвращает: [`<ReadableStream>`](webstreams.md#readablestream)

### `stream.Writable.fromWeb(writableStream[, options])` {#class-streamwritablefromwebwritablestream-options}

-   `writableStream` [`<WritableStream>`](webstreams.md#class-writablestream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal)
-   Возвращает: [`<stream.Writable>`](stream.md#class-streamwritable)

### `stream.Writable.toWeb(streamWritable)` {#class-streamwritabletowebstreamwritable}

-   `streamWritable` [`<stream.Writable>`](stream.md#class-streamwritable)
-   Возвращает: [`<WritableStream>`](webstreams.md#class-writablestream)

### `stream.Duplex.from(src)`

-   `src` {Stream|Blob|ArrayBuffer|string|Iterable|AsyncIterable| AsyncGeneratorFunction|AsyncFunction|Promise|Object| ReadableStream|WritableStream}

Служебный метод создания потоков `Duplex`.

-   `Stream` — записываемый поток превращается в записываемый `Duplex`, читаемый — в читаемый `Duplex`.
-   `Blob` — в читаемый `Duplex`.
-   `string` — в читаемый `Duplex`.
-   `ArrayBuffer` — в читаемый `Duplex`.
-   `AsyncIterable` — в читаемый `Duplex`; нельзя отдавать `null`.
-   `AsyncGeneratorFunction` — в transform `Duplex` с чтением и записью; первый параметр — исходный `AsyncIterable`; нельзя отдавать `null`.
-   `AsyncFunction` — в записываемый `Duplex`; должна возвращать `null` или `undefined`.
-   `Object ({ writable, readable })` — `readable` и `writable` приводятся к `Stream` и объединяются в `Duplex`: запись идёт в `writable`, чтение — из `readable`.
-   `Promise` — в читаемый `Duplex`; значение `null` игнорируется.
-   `ReadableStream` — в читаемый `Duplex`.
-   `WritableStream` — в записываемый `Duplex`.
-   Возвращает: [`<stream.Duplex>`](stream.md#class-streamduplex)

Если в `Iterable` попадают промисы, возможны необработанные отклонения.

```js
const { Duplex } = require('node:stream');

Duplex.from([
    new Promise((resolve) =>
        setTimeout(resolve('1'), 1500)
    ),
    new Promise((_, reject) =>
        setTimeout(reject(new Error('2')), 1000)
    ), // необработанное отклонение промиса
]);
```

### `stream.Duplex.fromWeb(pair[, options])`

-   `pair` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `readable` [`<ReadableStream>`](webstreams.md#readablestream)
    -   `writable` [`<WritableStream>`](webstreams.md#class-writablestream)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal)
-   Возвращает: [`<stream.Duplex>`](stream.md#class-streamduplex)

=== "MJS"

    ```js
    import { Duplex } from 'node:stream';
    import {
      ReadableStream,
      WritableStream,
    } from 'node:stream/web';

    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue('world');
      },
    });

    const writable = new WritableStream({
      write(chunk) {
        console.log('writable', chunk);
      },
    });

    const pair = {
      readable,
      writable,
    };
    const duplex = Duplex.fromWeb(pair, { encoding: 'utf8', objectMode: true });

    duplex.write('hello');

    for await (const chunk of duplex) {
      console.log('readable', chunk);
    }
    ```

=== "CJS"

    ```js
    const { Duplex } = require('node:stream');
    const {
      ReadableStream,
      WritableStream,
    } = require('node:stream/web');

    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue('world');
      },
    });

    const writable = new WritableStream({
      write(chunk) {
        console.log('writable', chunk);
      },
    });

    const pair = {
      readable,
      writable,
    };
    const duplex = Duplex.fromWeb(pair, { encoding: 'utf8', objectMode: true });

    duplex.write('hello');
    duplex.once('readable', () => console.log('readable', duplex.read()));
    ```

### `stream.Duplex.toWeb(streamDuplex[, options])`

-   `streamDuplex` [`<stream.Duplex>`](stream.md#class-streamduplex)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `readableType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) тип половины `ReadableStream` в создаваемой паре чтение–запись: `'bytes'` или `undefined`. (`options.type` — устаревший синоним этой опции.)
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `readable` [`<ReadableStream>`](webstreams.md#readablestream)
    -   `writable` [`<WritableStream>`](webstreams.md#class-writablestream)

=== "MJS"

    ```js
    import { Duplex } from 'node:stream';

    const duplex = Duplex({
      objectMode: true,
      read() {
        this.push('world');
        this.push(null);
      },
      write(chunk, encoding, callback) {
        console.log('writable', chunk);
        callback();
      },
    });

    const { readable, writable } = Duplex.toWeb(duplex);
    writable.getWriter().write('hello');

    const { value } = await readable.getReader().read();
    console.log('readable', value);
    ```

=== "CJS"

    ```js
    const { Duplex } = require('node:stream');

    const duplex = Duplex({
      objectMode: true,
      read() {
        this.push('world');
        this.push(null);
      },
      write(chunk, encoding, callback) {
        console.log('writable', chunk);
        callback();
      },
    });

    const { readable, writable } = Duplex.toWeb(duplex);
    writable.getWriter().write('hello');

    readable.getReader().read().then((result) => {
      console.log('readable', result.value);
    });
    ```

### `stream.addAbortSignal(signal, stream)`

-   `signal` [`<AbortSignal>`](globals.md#abortsignal) сигнал возможной отмены
-   `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | [`<WritableStream>`](webstreams.md#class-writablestream) поток, к которому подключается сигнал

Привязывает `AbortSignal` к читаемому или записываемому потоку и позволяет управлять уничтожением через `AbortController`.

Вызов `abort` у `AbortController`, соответствующего переданному `AbortSignal`, эквивалентен `.destroy(new AbortError())` на потоке Node.js и `controller.error(new AbortError())` для веб-потоков.

```js
const fs = require('node:fs');

const controller = new AbortController();
const read = addAbortSignal(
    controller.signal,
    fs.createReadStream('object.json')
);
// Позже: прервать операцию и закрыть поток
controller.abort();
```

Или с `AbortSignal` и читаемым потоком как async-итерируемым объектом:

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 10_000); // таймаут отмены
const stream = addAbortSignal(
    controller.signal,
    fs.createReadStream('object.json')
);
(async () => {
    try {
        for await (const chunk of stream) {
            await process(chunk);
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            // операция отменена
        } else {
            throw e;
        }
    }
})();
```

Или с `AbortSignal` и `ReadableStream`:

```js
const controller = new AbortController();
const rs = new ReadableStream({
    start(controller) {
        controller.enqueue('hello');
        controller.enqueue('world');
        controller.close();
    },
});

addAbortSignal(controller.signal, rs);

finished(rs, (err) => {
    if (err) {
        if (err.name === 'AbortError') {
            // операция отменена
        }
    }
});

const reader = rs.getReader();

reader.read().then(({ value, done }) => {
    console.log(value); // вывод: hello
    console.log(done); // вывод: false
    controller.abort();
});
```

### `stream.getDefaultHighWaterMark(objectMode)`

-   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает значение `highWaterMark` по умолчанию для потоков. По умолчанию `65536` (64 КиБ) или `16` в `objectMode`.

### `stream.setDefaultHighWaterMark(objectMode, value)`

-   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   `value` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) значение `highWaterMark`

Задаёт значение `highWaterMark` по умолчанию для потоков.

## API для реализаторов потоков {#api-for-stream-implementers}

API модуля `node:stream` устроено так, чтобы удобно реализовывать потоки на прототипном наследовании JavaScript.

Сначала объявляют класс, расширяющий один из четырёх базовых (`stream.Writable`, `stream.Readable`, `stream.Duplex` или `stream.Transform`), и вызывают соответствующий конструктор родителя:

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
    constructor({ highWaterMark, ...options }) {
        super({ highWaterMark });
        // ...
    }
}
```

Расширяя потоки, решите, какие опции пользователь может и должен передавать, прежде чем пробрасывать их в базовый конструктор. Например, если реализация полагается на `autoDestroy` и `emitClose`, не давайте пользователю переопределять их. Явно указывайте, какие опции пробрасываются, вместо неявной передачи всех подряд.

Далее класс должен реализовать один или несколько методов в зависимости от типа потока:

| Сценарий | Класс | Методы для реализации |
| --- | --- | --- |
| Только чтение | [`Readable`](#class-streamreadable) | [`_read()`](#readable_readsize) |
| Только запись | [`Writable`](#class-streamwritable) | [`_write()`](#writable_writechunk-encoding-callback), [`_writev()`](#writable_writevchunks-callback), [`_final()`](#writable_finalcallback) |
| Чтение и запись | [`Duplex`](#class-streamduplex) | [`_read()`](#readable_readsize), [`_write()`](#writable_writechunk-encoding-callback), [`_writev()`](#writable_writevchunks-callback), [`_final()`](#writable_finalcallback) |
| Обработка записанного и чтение результата | [`Transform`](#class-streamtransform) | [`_transform()`](#transform_transformchunk-encoding-callback), [`_flush()`](#transform_flushcallback), [`_final()`](#writable_finalcallback) |

Код реализации потока не должен _никогда_ вызывать «публичные» методы, предназначенные для потребителей (см. раздел [API для потребителей потоков](#api-for-stream-consumers)). Иначе возможны побочные эффекты в коде приложения.

Не переопределяйте публичные методы вроде `write()`, `end()`, `cork()`, `uncork()`, `read()` и `destroy()` и не испускайте внутренние события `'error'`, `'data'`, `'end'`, `'finish'` и `'close'` через `.emit()` в обход контракта. Это ломает инварианты потоков и может дать несовместимость с другими потоками, утилитами и ожиданиями пользователей.

### Упрощённое создание

Во многих простых случаях поток создаётся без наследования: достаточно экземпляра `stream.Writable`, `stream.Readable`, `stream.Duplex` или `stream.Transform` с методами в опциях конструктора.

```js
const { Writable } = require('node:stream');

const myWritable = new Writable({
    construct(callback) {
        // Инициализация состояния и ресурсов…
    },
    write(chunk, encoding, callback) {
        // ...
    },
    destroy() {
        // Освободить ресурсы…
    },
});
```

### Реализация записываемого потока

Класс `stream.Writable` расширяют, чтобы получить [`Writable`](#class-streamwritable).

Собственный `Writable` _обязан_ вызывать `new stream.Writable([options])` и реализовать `writable._write()` и/или `writable._writev()`.

#### `new stream.Writable([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) уровень буфера, при котором [`stream.write()`](#writablewritechunk-encoding-callback) начинает возвращать `false`. **По умолчанию:** `65536` (64 КиБ) или `16` для потоков в `objectMode`.
    -   `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) кодировать ли строки, переданные в [`stream.write()`](#writablewritechunk-encoding-callback), в `Buffer` (с кодировкой из вызова [`stream.write()`](#writablewritechunk-encoding-callback)) перед передачей в [`stream._write()`](#writable_writechunk-encoding-callback). Прочие типы не преобразуются (т.е. `Buffer` не декодируются в строки). Значение `false` отключает преобразование строк. **По умолчанию:** `true`.
    -   `defaultEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) кодировка по умолчанию, если в [`stream.write()`](#writablewritechunk-encoding-callback) кодировка не указана. **По умолчанию:** `'utf8'`.
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) допустима ли операция [`stream.write(anyObj)`](#writablewritechunk-encoding-callback). При `true` можно писать произвольные значения JavaScript, не только строку, [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView), если это поддерживает реализация. **По умолчанию:** `false`.
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) испускать ли `'close'` после уничтожения потока. **По умолчанию:** `true`.
    -   `write` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация метода [`stream._write()`](#writable_writechunk-encoding-callback).
    -   `writev` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация метода [`stream._writev()`](#writable_writevchunks-callback).
    -   `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация метода [`stream._destroy()`](#writable_destroyerr-callback).
    -   `final` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация метода [`stream._final()`](#writable_finalcallback).
    -   `construct` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация метода [`stream._construct()`](#writable_constructcallback).
    -   `autoDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) вызывать ли по завершении записи автоматически `.destroy()` для этого потока. **По умолчанию:** `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) сигнал возможной отмены.

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
    constructor(options) {
        // Вызов конструктора stream.Writable().
        super(options);
        // ...
    }
}
```

Или в стиле конструкторов до ES6:

```js
const { Writable } = require('node:stream');
const util = require('node:util');

function MyWritable(options) {
    if (!(this instanceof MyWritable))
        return new MyWritable(options);
    Writable.call(this, options);
}
util.inherits(MyWritable, Writable);
```

Или через упрощённый конструктор с методами в опциях:

```js
const { Writable } = require('node:stream');

const myWritable = new Writable({
    write(chunk, encoding, callback) {
        // ...
    },
    writev(chunks, callback) {
        // ...
    },
});
```

Вызов `abort` у `AbortController`, соответствующего переданному `AbortSignal`, эквивалентен `.destroy(new AbortError())` на записываемом потоке.

```js
const { Writable } = require('node:stream');

const controller = new AbortController();
const myWritable = new Writable({
    write(chunk, encoding, callback) {
        // ...
    },
    writev(chunks, callback) {
        // ...
    },
    signal: controller.signal,
});
// Позже: прервать операцию и закрыть поток
controller.abort();
```

#### `writable._construct(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой) по завершении инициализации потока.

Метод `_construct()` нельзя вызывать напрямую. Его могут реализовать дочерние классы; тогда он вызывается только внутренними методами `Writable`.

Эта необязательная функция вызывается в следующем тике после возврата из конструктора и откладывает `_write()`, `_final()` и `_destroy()` до вызова `callback`. Удобно для инициализации состояния или асинхронной подготовки ресурсов.

```js
const { Writable } = require('node:stream');
const fs = require('node:fs');

class WriteStream extends Writable {
    constructor(filename) {
        super();
        this.filename = filename;
        this.fd = null;
    }
    _construct(callback) {
        fs.open(this.filename, 'w', (err, fd) => {
            if (err) {
                callback(err);
            } else {
                this.fd = fd;
                callback();
            }
        });
    }
    _write(chunk, encoding, callback) {
        fs.write(this.fd, chunk, callback);
    }
    _destroy(err, callback) {
        if (this.fd) {
            fs.close(this.fd, (er) => callback(er || err));
        } else {
            callback(err);
        }
    }
}
```

#### `writable._write(chunk, encoding, callback)`

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | any `Buffer` для записи, полученный из строки, переданной в [`stream.write()`](#writablewritechunk-encoding-callback). Если у потока `decodeStrings` равен `false` или включён объектный режим, фрагмент не преобразуется и остаётся тем, что передали в [`stream.write()`](#writablewritechunk-encoding-callback).
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) для строки — кодировка символов; для `Buffer` или объектного режима может игнорироваться.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой) по завершении обработки фрагмента.

Любая реализация `Writable` должна предоставить метод [`writable._write()`](#writable_writechunk-encoding-callback) и/или [`writable._writev()`](#writable_writevchunks-callback) для передачи данных нижележащему ресурсу.

[`Transform`](#class-streamtransform) задаёт собственную реализацию [`writable._write()`](#writable_writechunk-encoding-callback).

Прикладной код не должен вызывать эту функцию напрямую — только дочерние классы, и только из внутренней логики `Writable`.

`callback` нужно вызвать синхронно внутри `writable._write()` или асинхронно (в другом тике), сигнализируя об успехе (`null`) или передавая `Error` при сбое.

Все вызовы `writable.write()` между началом `writable._write()` и вызовом `callback` буферизуются. После `callback` поток может испустить [`'drain'`](#event-drain). Если реализация может обрабатывать несколько фрагментов за раз, следует реализовать `writable._writev()`.

Если в конструкторе явно задано `decodeStrings: false`, `chunk` остаётся тем же объектом, что в `.write()`, и может быть строкой, а не `Buffer` — для оптимизированной обработки кодировок. Тогда `encoding` отражает кодировку строки; иначе `encoding` можно не учитывать.

Префикс `_` у `writable._write()` означает, что метод внутренний и не предназначен для прямых вызовов из прикладного кода.

#### `writable._writev(chunks, callback)`

-   `chunks` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) данные для записи: массив [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), каждый элемент — отдельный фрагмент. Поля:
    -   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) буфер или строка. Строка бывает, если `Writable` создан с `decodeStrings: false` и в `write()` передали строку.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) кодировка `chunk`; для `Buffer` — `'buffer'`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой) по завершении обработки всех переданных фрагментов.

Не вызывать из прикладного кода — только из реализации дочернего класса и внутренней логики `Writable`.

`writable._writev()` добавляют вместо или вместе с `writable._write()`, если можно обработать несколько фрагментов за раз. При наличии буферизованных данных от предыдущих записей вызовут `_writev()` вместо `_write()`.

Префикс `_` означает внутренний метод, не для прямых вызовов из прикладного кода.

#### `writable._destroy(err, callback)`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) возможная ошибка.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) колбэк с необязательным аргументом ошибки.

`_destroy()` вызывается из [`writable.destroy()`](#writabledestroyerror). Его можно переопределить в дочернем классе, но **нельзя** вызывать напрямую.

#### `writable._final(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой) после записи оставшихся данных.

`_final()` **нельзя** вызывать напрямую. Дочерние классы могут реализовать метод; тогда он вызывается только внутренней логикой `Writable`.

Необязательная функция вызывается перед закрытием потока и откладывает `'finish'` до `callback`. Подходит, чтобы закрыть ресурсы или дописать буфер перед концом потока.

#### Ошибки при записи

Ошибки в [`writable._write()`](#writable_writechunk-encoding-callback), [`writable._writev()`](#writable_writevchunks-callback) и [`writable._final()`](#writable_finalcallback) нужно передавать в колбэк первым аргументом. `throw` из этих методов или ручной `emit('error')` дают неопределённое поведение.

Если `Readable` подключён по pipe к `Writable`, а `Writable` выдаёт ошибку, pipe с `Readable` снимается.

```js
const { Writable } = require('node:stream');

const myWritable = new Writable({
    write(chunk, encoding, callback) {
        if (chunk.toString().indexOf('a') >= 0) {
            callback(new Error('chunk is invalid'));
        } else {
            callback();
        }
    },
});
```

#### Пример записываемого потока

Ниже — намеренно упрощённая (и мало полезная сама по себе) реализация пользовательского `Writable`; она показывает обязательные элементы [`Writable`](#class-streamwritable):

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
    _write(chunk, encoding, callback) {
        if (chunk.toString().indexOf('a') >= 0) {
            callback(new Error('chunk is invalid'));
        } else {
            callback();
        }
    }
}
```

#### Декодирование буферов в записываемом потоке

Декодирование буферов часто нужно, например, когда на вход трансформера подаётся строка. При многобайтовых кодировках (например UTF-8) это нетривиально. Ниже — пример с `StringDecoder` и [`Writable`](#class-streamwritable).

```js
const { Writable } = require('node:stream');
const { StringDecoder } = require('node:string_decoder');

class StringWritable extends Writable {
    constructor(options) {
        super(options);
        this._decoder = new StringDecoder(
            options?.defaultEncoding
        );
        this.data = '';
    }
    _write(chunk, encoding, callback) {
        if (encoding === 'buffer') {
            chunk = this._decoder.write(chunk);
        }
        this.data += chunk;
        callback();
    }
    _final(callback) {
        this.data += this._decoder.end();
        callback();
    }
}

const euro = [[0xe2, 0x82], [0xac]].map(Buffer.from);
const w = new StringWritable();

w.write('currency: ');
w.write(euro[0]);
w.end(euro[1]);

console.log(w.data); // вывод: currency: €
```

### Реализация читаемого потока

Класс `stream.Readable` расширяют для реализации [`Readable`](#class-streamreadable).

Пользовательский `Readable` _обязан_ вызывать `new stream.Readable([options])` и реализовать [`readable._read()`](#readable_readsize).

#### `new stream.Readable([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) максимум [байт в буфере](#highwatermark-discrepancy-after-calling-readablesetencoding) до приостановки чтения из нижележащего ресурса. **По умолчанию:** `65536` (64 КиБ) или `16` для `objectMode`.
    -   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если задано, буферы декодируются в строки в этой кодировке. **По умолчанию:** `null`.
    -   `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) поток объектов: [`stream.read(n)`](#readablereadsize) возвращает одно значение, а не `Buffer` длины `n`. **По умолчанию:** `false`.
    -   `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) испускать ли `'close'` после уничтожения. **По умолчанию:** `true`.
    -   `read` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация [`stream._read()`](#readable_readsize).
    -   `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация [`stream._destroy()`](#readable_destroyerr-callback).
    -   `construct` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация [`stream._construct()`](#readable_constructcallback).
    -   `autoDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) вызывать ли по завершении автоматически `.destroy()` для этого потока. **По умолчанию:** `true`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) сигнал возможной отмены.

```js
const { Readable } = require('node:stream');

class MyReadable extends Readable {
    constructor(options) {
        // Вызов конструктора stream.Readable(options).
        super(options);
        // ...
    }
}
```

Или в стиле конструкторов до ES6:

```js
const { Readable } = require('node:stream');
const util = require('node:util');

function MyReadable(options) {
    if (!(this instanceof MyReadable))
        return new MyReadable(options);
    Readable.call(this, options);
}
util.inherits(MyReadable, Readable);
```

Или через упрощённый конструктор с методами в опциях:

```js
const { Readable } = require('node:stream');

const myReadable = new Readable({
    read(size) {
        // ...
    },
});
```

Вызов `abort` у `AbortController`, соответствующего переданному `AbortSignal`, эквивалентен `.destroy(new AbortError())` на созданном читаемом потоке.

```js
const { Readable } = require('node:stream');
const controller = new AbortController();
const read = new Readable({
    read(size) {
        // ...
    },
    signal: controller.signal,
});
// Позже: прервать операцию и закрыть поток
controller.abort();
```

#### `readable._construct(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой) по завершении инициализации потока.

`_construct()` нельзя вызывать напрямую. Дочерние классы могут реализовать метод; тогда он вызывается только внутренней логикой `Readable`.

Функция планируется на следующий тик после конструктора и откладывает `_read()` и `_destroy()` до `callback` — для инициализации состояния или асинхронной подготовки ресурсов.

```js
const { Readable } = require('node:stream');
const fs = require('node:fs');

class ReadStream extends Readable {
    constructor(filename) {
        super();
        this.filename = filename;
        this.fd = null;
    }
    _construct(callback) {
        fs.open(this.filename, (err, fd) => {
            if (err) {
                callback(err);
            } else {
                this.fd = fd;
                callback();
            }
        });
    }
    _read(n) {
        const buf = Buffer.alloc(n);
        fs.read(
            this.fd,
            buf,
            0,
            n,
            null,
            (err, bytesRead) => {
                if (err) {
                    this.destroy(err);
                } else {
                    this.push(
                        bytesRead > 0
                            ? buf.slice(0, bytesRead)
                            : null
                    );
                }
            }
        );
    }
    _destroy(err, callback) {
        if (this.fd) {
            fs.close(this.fd, (er) => callback(er || err));
        } else {
            callback(err);
        }
    }
}
```

#### `readable._read(size)`

-   `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) рекомендуемое число байт для асинхронного чтения

Не вызывать из прикладного кода — только реализация дочернего класса и внутренняя логика `Readable`.

Любой `Readable` должен реализовать [`readable._read()`](#readable_readsize) для получения данных из ресурса.

Когда вызывается [`readable._read()`](#readable_readsize) и данные доступны, их следует помещать в очередь через [`this.push(dataChunk)`](#readablepushchunk-encoding). `_read()` вызовут снова после каждого [`this.push(dataChunk)`](#readablepushchunk-encoding), когда поток готов принять ещё данные. Можно продолжать читать и вызывать `push`, пока `readable.push()` не вернёт `false`. Дополнительные данные в очередь — только после следующего вызова `_read()`.

После вызова [`readable._read()`](#readable_readsize) он не повторится, пока снова не будет данных через [`readable.push()`](#readablepushchunk-encoding). Пустые буферы и строки не приводят к повторному [`readable._read()`](#readable_readsize).

Аргумент `size` носит рекомендательный характер: если «чтение» — одна операция, по нему можно оценить объём; иначе аргумент можно игнорировать и отдавать данные по мере готовности. Не обязательно копить ровно `size` байт перед [`stream.push(chunk)`](#readablepushchunk-encoding).

Префикс `_` означает внутренний метод, не для прямых вызовов из прикладного кода.

#### `readable._destroy(err, callback)`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) возможная ошибка.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) колбэк с необязательным аргументом ошибки.

`_destroy()` вызывается из [`readable.destroy()`](#readabledestroyerror). Переопределение в дочернем классе допустимо, прямой вызов **запрещён**.

#### `readable.push(chunk[, encoding])`

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | any фрагмент для помещения в очередь чтения. Вне объектного режима — [строка](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView). В объектном режиме — любое значение JavaScript.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) кодировка строковых фрагментов; допустимая для `Buffer`, например `'utf8'` или `'ascii'`.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если можно продолжать вызывать `push`; иначе `false`.

Если `chunk` — [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) или [строка](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), данные попадают во внутреннюю очередь. `chunk === null` означает конец потока (EOF), после этого передавать данные нельзя.

В приостановленном режиме данные из `readable.push()` забирают через [`readable.read()`](#readablereadsize) при [`'readable'`](#event-readable).

В потоковом режиме данные из `readable.push()` доставляются через событие `'data'`.

`readable.push()` рассчитан на гибкое использование, например при обёртке низкоуровневого источника с pause/resume и колбэком данных:

```js
// Предполагается, что `_source` — объект с методами readStop() и readStart(),
// полем `ondata`, вызываемым при появлении данных,
// и полем `onend`, вызываемым по окончании данных.

class SourceWrapper extends Readable {
    constructor(options) {
        super(options);

        this._source = getLowLevelSourceObject();

        // При появлении данных — в очередь чтения.
        this._source.ondata = (chunk) => {
            // Если push() вернул false — остановить чтение у источника.
            if (!this.push(chunk)) this._source.readStop();
        };

        // Конец источника — передать маркер EOF (`null`).
        this._source.onend = () => {
            this.push(null);
        };
    }
    // _read() вызовут, когда потоку нужны новые данные;
    // аргумент size здесь не используется.
    _read(size) {
        this._source.readStart();
    }
}
```

`readable.push()` наполняет внутренний буфер; его обычно драйвит [`readable._read()`](#readable_readsize).

Вне объектного режима `chunk === undefined` трактуется как пустая строка или буфер. Подробнее — [`readable.push('')`](#readablepush).

#### Ошибки при чтении

Ошибки при выполнении [`readable._read()`](#readable_readsize) передают через [`readable.destroy(err)`](#readable_destroyerr-callback). `throw` из [`readable._read()`](#readable_readsize) или ручной `emit('error')` дают неопределённое поведение.

```js
const { Readable } = require('node:stream');

const myReadable = new Readable({
    read(size) {
        const err = checkSomeErrorCondition();
        if (err) {
            this.destroy(err);
        } else {
            // обычная работа _read
        }
    },
});
```

#### Пример потока-счётчика

Базовый пример `Readable`, испускающего числа от 1 до 1 000 000 по возрастанию, затем завершающегося.

```js
const { Readable } = require('node:stream');

class Counter extends Readable {
    constructor(opt) {
        super(opt);
        this._max = 1000000;
        this._index = 1;
    }

    _read() {
        const i = this._index++;
        if (i > this._max) this.push(null);
        else {
            const str = String(i);
            const buf = Buffer.from(str, 'ascii');
            this.push(buf);
        }
    }
}
```

### Реализация потока Duplex

[`Duplex`](#class-streamduplex) сочетает [`Readable`](#class-streamreadable) и [`Writable`](#class-streamwritable), как TCP-сокет.

В JavaScript нет множественного наследования, поэтому [`Duplex`](#class-streamduplex) получают расширением `stream.Duplex`, а не одновременным наследованием от `stream.Readable` и `stream.Writable`.

`stream.Duplex` прототипно наследует `stream.Readable` и подмешивает `stream.Writable`; `instanceof` для обоих базовых типов работает за счёт переопределения [`Symbol.hasInstance`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance) у `stream.Writable`.

Пользовательский `Duplex` _обязан_ вызывать `new stream.Duplex([options])` и реализовать и [`readable._read()`](#readable_readsize), и `writable._write()`.

#### `new stream.Duplex(options)`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) передаётся в конструкторы `Writable` и `Readable`. Дополнительные поля:
    -   `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при `false` запись завершается вместе с чтением. **По умолчанию:** `true`.
    -   `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) будет ли сторона чтения. **По умолчанию:** `true`.
    -   `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) будет ли сторона записи. **По умолчанию:** `true`.
    -   `readableObjectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `objectMode` для стороны чтения. Не действует, если задан общий `objectMode`. **По умолчанию:** `false`.
    -   `writableObjectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `objectMode` для стороны записи. Не действует, если задан общий `objectMode`. **По умолчанию:** `false`.
    -   `readableHighWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `highWaterMark` для стороны чтения. Не действует, если задан общий `highWaterMark`.
    -   `writableHighWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `highWaterMark` для стороны записи. Не действует, если задан общий `highWaterMark`.

```js
const { Duplex } = require('node:stream');

class MyDuplex extends Duplex {
    constructor(options) {
        super(options);
        // ...
    }
}
```

Или в стиле конструкторов до ES6:

```js
const { Duplex } = require('node:stream');
const util = require('node:util');

function MyDuplex(options) {
    if (!(this instanceof MyDuplex))
        return new MyDuplex(options);
    Duplex.call(this, options);
}
util.inherits(MyDuplex, Duplex);
```

Или через упрощённый конструктор с методами в опциях:

```js
const { Duplex } = require('node:stream');

const myDuplex = new Duplex({
    read(size) {
        // ...
    },
    write(chunk, encoding, callback) {
        // ...
    },
});
```

При использовании `pipeline`:

```js
const { Transform, pipeline } = require('node:stream');
const fs = require('node:fs');

pipeline(
    fs.createReadStream('object.json').setEncoding('utf8'),
    new Transform({
        decodeStrings: false, // на входе строки, без преобразования в Buffer
        construct(callback) {
            this.data = '';
            callback();
        },
        transform(chunk, encoding, callback) {
            this.data += chunk;
            callback();
        },
        flush(callback) {
            try {
                // проверка: валидный JSON
                JSON.parse(this.data);
                this.push(this.data);
                callback();
            } catch (err) {
                callback(err);
            }
        },
    }),
    fs.createWriteStream('valid-object.json'),
    (err) => {
        if (err) {
            console.error('failed', err);
        } else {
            console.log('completed');
        }
    }
);
```

#### Пример потока Duplex

Первый пример — обёртка над условным низкоуровневым источником: в него пишут и из него читают, хотя API источника не совместим с потоками Node.js.

Второй пример — `Duplex`, который буферизует входящие данные через [`Writable`](#class-streamwritable), а читает их через [`Readable`](#class-streamreadable).

```js
const { Duplex } = require('node:stream');
const kSource = Symbol('source');

class MyDuplex extends Duplex {
    constructor(source, options) {
        super(options);
        this[kSource] = source;
    }

    _write(chunk, encoding, callback) {
        // Нижележащий источник работает только со строками.
        if (Buffer.isBuffer(chunk))
            chunk = chunk.toString();
        this[kSource].writeSomeData(chunk);
        callback();
    }

    _read(size) {
        this[kSource].fetchSomeData(
            size,
            (data, encoding) => {
                this.push(Buffer.from(data, encoding));
            }
        );
    }
}
```

Важно: стороны `Readable` и `Writable` у одного `Duplex` работают независимо, хотя объект один.

#### Объектный режим для `Duplex`

Для `Duplex` `objectMode` можно задать отдельно для чтения или записи через `readableObjectMode` и `writableObjectMode`.

В примере ниже создаётся `Transform` (вид [`Duplex`](#class-streamduplex)): сторона записи в объектном режиме принимает числа, на стороне чтения они превращаются в шестнадцатеричные строки.

```js
const { Transform } = require('node:stream');

// Все Transform — частный случай Duplex.
const myTransform = new Transform({
    writableObjectMode: true,

    transform(chunk, encoding, callback) {
        // Привести фрагмент к числу при необходимости.
        chunk |= 0;

        // Преобразовать фрагмент (здесь — в hex-строку).
        const data = chunk.toString(16);

        // Передать результат в очередь читаемой стороны.
        callback(null, '0'.repeat(data.length % 2) + data);
    },
});

myTransform.setEncoding('ascii');
myTransform.on('data', (chunk) => console.log(chunk));

myTransform.write(1);
// вывод: 01
myTransform.write(10);
// вывод: 0a
myTransform.write(100);
// вывод: 64
```

### Реализация потока Transform

[`Transform`](#class-streamtransform) — это [`Duplex`](#class-streamduplex), выход которого как-то вычисляется из входа. Примеры: [zlib](zlib.md) и [crypto](crypto.md) для сжатия, шифрования и расшифровки.

Не требуется совпадения размера или числа фрагментов на входе и выходе, ни синхронной доставки. Например, у потока `Hash` на выходе один фрагмент после окончания входа; у `zlib` выход может быть сильно меньше или больше входа.

Класс `stream.Transform` расширяют для [`Transform`](#class-streamtransform).

`stream.Transform` наследует `stream.Duplex` и подставляет свои `writable._write()` и [`readable._read()`](#readable_readsize). Пользовательская реализация _обязана_ задать [`transform._transform()`](#transform_transformchunk-encoding-callback) и _может_ задать [`transform._flush()`](#transform_flushcallback).

Имейте в виду: при `Transform` запись может приостановить сторону `Writable`, если выход на `Readable` не потребляют.

#### `new stream.Transform([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) передаётся в конструкторы `Writable` и `Readable`, плюс поля:
    -   `transform` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация [`stream._transform()`](#transform_transformchunk-encoding-callback).
    -   `flush` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) реализация [`stream._flush()`](#transform_flushcallback).

```js
const { Transform } = require('node:stream');

class MyTransform extends Transform {
    constructor(options) {
        super(options);
        // ...
    }
}
```

Или в стиле конструкторов до ES6:

```js
const { Transform } = require('node:stream');
const util = require('node:util');

function MyTransform(options) {
    if (!(this instanceof MyTransform))
        return new MyTransform(options);
    Transform.call(this, options);
}
util.inherits(MyTransform, Transform);
```

Или через упрощённый конструктор с методами в опциях:

```js
const { Transform } = require('node:stream');

const myTransform = new Transform({
    transform(chunk, encoding, callback) {
        // ...
    },
});
```

#### Событие: `'end'`

Событие [`'end'`](#event-end) относится к `stream.Readable`. Оно испускается после вывода всех данных, то есть после колбэка [`transform._flush()`](#transform_flushcallback). При ошибке `'end'` не должен испускаться.

#### Событие: `'finish'`

Событие [`'finish'`](#event-finish) относится к `stream.Writable`. Оно испускается после [`stream.end()`](#writableendchunk-encoding-callback), когда все фрагменты обработаны [`stream._transform()`](#transform_transformchunk-encoding-callback). При ошибке `'finish'` не должен испускаться.

#### `transform._flush(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой и данными) после сброса остатка.

Не вызывать из прикладного кода — только реализация дочернего класса и внутренняя логика `Readable`.

Иногда в конце потока нужно выдать ещё данные: например, у `zlib` есть внутреннее состояние для сжатия, и при завершении его нужно сбросить, чтобы выход был полным.

Реализации [`Transform`](#class-streamtransform) _могут_ определить `transform._flush()`: вызывается, когда входящих данных больше нет, но до [`'end'`](#event-end) на [`Readable`](#class-streamreadable).

Внутри `transform._flush()` можно вызвать `transform.push()` ноль или несколько раз. По завершении сброса нужно вызвать `callback`.

Префикс `_` — внутренний метод, не для прямых вызовов из прикладного кода.

#### `transform._transform(chunk, encoding, callback)`

-   `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | any `Buffer` для преобразования из строки, переданной в [`stream.write()`](#writablewritechunk-encoding-callback). При `decodeStrings: false` или объектном режиме фрагмент не преобразуется.
-   `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) для строки — тип кодировки; для буфера — `'buffer'` (можно игнорировать).
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызвать (при необходимости с ошибкой и данными) после обработки фрагмента.

Не вызывать из прикладного кода — только дочерний класс и внутренняя логика `Readable`.

Любой `Transform` должен реализовать `_transform()`: обрабатывает входящие байты, считает выход и передаёт его в читаемую часть через `transform.push()`.

`transform.push()` можно вызывать несколько раз на один входной фрагмент или ни разу.

`callback` вызывают только после полного разбора текущего фрагмента. Первый аргумент — `Error` или `null`. Второй аргумент, если есть и первый аргумент ложный, передаётся в `transform.push()`. Эквивалентны записи:

```js
transform.prototype._transform = function (
    data,
    encoding,
    callback
) {
    this.push(data);
    callback();
};

transform.prototype._transform = function (
    data,
    encoding,
    callback
) {
    callback(null, data);
};
```

Префикс `_` — внутренний метод; не вызывать из прикладного кода.

`transform._transform()` не выполняется параллельно: очередь в потоке, следующий фрагмент после вызова `callback` (синхронно или асинхронно).

#### Класс: `stream.PassThrough`

`stream.PassThrough` — тривиальная реализация [`Transform`](#class-streamtransform), пробрасывающая байты с входа на выход. Чаще всего для примеров и тестов, но иногда служит кирпичиком для нестандартных потоков.

## Дополнительные примечания {#additional-notes}

### Совместимость потоков с асинхронными генераторами и итераторами

В JavaScript есть асинхронные генераторы и итераторы — по сути полноценная языковая модель потоков.

Ниже типичные сценарии совместного использования потоков Node.js с ними.

#### Потребление читаемых потоков через async-итераторы

```js
(async function () {
    for await (const chunk of readable) {
        console.log(chunk);
    }
})();
```

Async-итераторы регистрируют постоянный обработчик ошибок на потоке, чтобы не ловить необработанные ошибки после уничтожения.

#### Создание читаемых потоков через асинхронные генераторы

Читаемый поток Node.js можно получить из асинхронного генератора через `Readable.from()`:

```js
const { Readable } = require('node:stream');

const ac = new AbortController();
const signal = ac.signal;

async function* generate() {
    yield 'a';
    await someLongRunningFn({ signal });
    yield 'b';
    yield 'c';
}

const readable = Readable.from(generate());
readable.on('close', () => {
    ac.abort();
});

readable.on('data', (chunk) => {
    console.log(chunk);
});
```

#### Pipe в записываемый поток из async-итератора

При записи из async-итератора важно учитывать обратное давление и ошибки. [`stream.pipeline()`](#streampipelinesource-transforms-destination-callback) скрывает эту логику:

```js
const fs = require('node:fs');
const { pipeline } = require('node:stream');
const {
    pipeline: pipelinePromise,
} = require('node:stream/promises');

const writable = fs.createWriteStream('./file');

const ac = new AbortController();
const signal = ac.signal;

const iterator = createIterator({ signal });

// Вариант с колбэком
pipeline(iterator, writable, (err, value) => {
    if (err) {
        console.error(err);
    } else {
        console.log(value, 'value returned');
    }
}).on('close', () => {
    ac.abort();
});

// Вариант с промисом
pipelinePromise(iterator, writable)
    .then((value) => {
        console.log(value, 'value returned');
    })
    .catch((err) => {
        console.error(err);
        ac.abort();
    });
```

### Совместимость со старыми версиями Node.js {#compatibility-with-older-nodejs-versions}

До Node.js 0.10 интерфейс `Readable` был проще, но слабее.

-   Вместо ожидания [`stream.read()`](#readablereadsize) события [`'data'`](#event-data) шли сразу. Если обработка требовала работы, данные приходилось буферизовать, чтобы не потерять.
-   [`stream.pause()`](#readablepause) был лишь рекомендацией: [`'data'`](#event-data) всё равно могли приходить _даже в «приостановленном» состоянии_.

В Node.js 0.10 добавили класс [`Readable`](#class-streamreadable). Для совместимости со старым кодом поток переходит в «потоковый режим» при подписке на [`'data'`](#event-data) или вызове [`stream.resume()`](#readableresume). Поэтому даже без [`stream.read()`](#readablereadsize) и [`'readable'`](#event-readable) фрагменты [`'data'`](#event-data) обычно не теряются.

В большинстве случаев всё работает, но есть пограничный случай:

-   нет подписчика на [`'data'`](#event-data);
-   не вызывается [`stream.resume()`](#readableresume);
-   поток ни к чему не подключён по pipe.

Пример:

```js
// ВНИМАНИЕ: сломанный пример!
net.createServer((socket) => {
    // Подписались на 'end', но данные из сокета не читаем.
    socket.on('end', () => {
        // Сюда выполнение не дойдёт.
        socket.end(
            'The message was received but was not processed.\n'
        );
    });
}).listen(1337);
```

До Node.js 0.10 входящие данные просто отбрасывались. С 0.10 сокет остаётся на паузе бесконечно.

Обходной путь — вызвать [`stream.resume()`](#readableresume), чтобы запустить поток данных:

```js
// Обходной путь.
net.createServer((socket) => {
    socket.on('end', () => {
        socket.end(
            'The message was received but was not processed.\n'
        );
    });

    // Запустить поток данных и сбросить его (не обрабатывая).
    socket.resume();
}).listen(1337);
```

Кроме того, старые потоки до 0.10 можно обернуть в класс `Readable` через [`readable.wrap()`](#readablewrapstream).

### `readable.read(0)`

Иногда нужно «подтолкнуть» механизм чтения, не потребляя данные — тогда вызывают `readable.read(0)`; результат всегда `null`.

Если внутренний буфер ниже `highWaterMark` и поток сейчас не читает, `stream.read(0)` инициирует низкоуровневый вызов [`stream._read()`](#readable_readsize).

Прикладному коду это редко нужно; так делают внутри Node.js, в частности в реализации `Readable`.

### `readable.push('')`

`readable.push('')` не рекомендуется.

Пустая [строка](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) вне объектного режима даёт особый эффект: это всё равно вызов [`readable.push()`](#readablepushchunk-encoding), завершающий чтение, но в буфер не попадает данных — потребителю нечего читать.

### Расхождение `highWaterMark` после `readable.setEncoding()` {#highwatermark-discrepancy-after-calling-readablesetencoding}

`readable.setEncoding()` меняет то, как вне объектного режима сравнивают заполнение с `highWaterMark`.

Обычно размер буфера считается в _байтах_. После `setEncoding()` сравнение идёт в _символах_.

Для `latin1` или `ascii` это редко заметно; при многобайтовых символах учитывайте это поведение.
