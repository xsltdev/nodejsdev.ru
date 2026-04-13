---
title: Поток
description: Поток — абстрактный интерфейс для работы с потоковыми данными в Node.js
---

# Поток

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/stream.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/stream.js -->

**Поток** — это абстрактный интерфейс для работы с потоковыми данными в Node.js.
Модуль `node:stream` предоставляет API для реализации интерфейса потока.

В Node.js существует множество объектов потока. Например,
[запрос к HTTP-серверу][http-incoming-message] и [`process.stdout`][`process.stdout`]
являются экземплярами потока.

Потоки могут быть доступны для чтения, для записи или и для того, и для другого. Все потоки являются экземплярами
[`EventEmitter`][`EventEmitter`].

Чтобы получить доступ к модулю `node:stream`:

```js
const stream = require('node:stream');
```

Модуль `node:stream` полезен для создания новых типов экземпляров потоков.
Обычно нет необходимости использовать модуль `node:stream` для потребления потоков.

## Организация данного документа

Этот документ содержит два основных раздела и третий раздел для примечаний. В первом разделе объясняется, как использовать существующие потоки в приложении. Во втором разделе объясняется, как создавать новые типы потоков.

## Типы потоков

В Node.js существует четыре основных типа потоков:

* [`Writable`][`Writable`]: потоки, в которые можно записывать данные (например,
  [`fs.createWriteStream()`][`fs.createWriteStream()`]).
* [`Readable`][`Readable`]: потоки, из которых можно читать данные (например,
  [`fs.createReadStream()`][`fs.createReadStream()`]).
* [`Duplex`][`Duplex`]: потоки, которые являются одновременно `Readable` и `Writable` (например,
  [`net.Socket`][`net.Socket`]).
* [`Transform`][`Transform`]: потоки `Duplex`, которые могут изменять или преобразовывать данные по мере их записи и чтения (например, [`zlib.createDeflate()`][`zlib.createDeflate()`]).

Кроме того, в этот модуль входят служебные функции
[`stream.duplexPair()`][`stream.duplexPair()`],
[`stream.pipeline()`][`stream.pipeline()`],
[`stream.finished()`][`stream.finished()`],
[`stream.Readable.from()`][`stream.Readable.from()`] и
[`stream.addAbortSignal()`][`stream.addAbortSignal()`].

### API промисов для потоков

<!-- YAML
added: v15.0.0
-->

API `stream/promises` предоставляет альтернативный набор асинхронных служебных функций для потоков, которые возвращают объекты `Promise`, а не используют обратные вызовы. API доступен через `require('node:stream/promises')`
или `require('node:stream').promises`.

### `stream.pipeline(streams[, options])`

### `stream.pipeline(source[, ...transforms], destination[, options])`

<!-- YAML
added: v15.0.0
changes:
  - version:
      - v18.0.0
      - v17.2.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/40886
    description: Add the `end` option, which can be set to `false` to prevent
                 automatically closing the destination stream when the source
                 ends.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0, v17.2.0, v16.14.0 | Добавьте опцию `end`, для которой можно установить значение `false`, чтобы предотвратить автоматическое закрытие потока назначения при завершении источника. |

* `streams` [<Stream[]>](stream.md#stream) | [<Iterable[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [<AsyncIterable[]>](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [<Function[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `source` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
* `...transforms` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
  * Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
* `destination` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
  * Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конвейера
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
  * `end` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Завершать поток назначения, когда завершается поток-источник.
    Потоки `Transform` всегда завершаются, даже если значение `false`.
    **По умолчанию:** `true`.
* Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется, когда конвейер завершён.

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

Чтобы использовать `AbortSignal`, передайте его внутри объекта options последним аргументом.
Когда сигнал будет прерван, на базовом конвейере будет вызван `destroy`
с `AbortError`.

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
    
    run().catch(console.error); // AbortError
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
      console.error(err); // AbortError
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

Не забывайте обрабатывать аргумент `signal`, передаваемый в асинхронный генератор.
Особенно когда асинхронный генератор является источником конвейера
(то есть первым аргументом) иначе конвейер может никогда не завершиться.

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

API `pipeline` также предоставляет [версию с обратным вызовом][stream-pipeline]:

### `stream.finished(stream[, options])`

<!-- YAML
added: v15.0.0
changes:
  - version:
    - v19.5.0
    - v18.14.0
    pr-url: https://github.com/nodejs/node/pull/46205
    description: Added support for `ReadableStream` and `WritableStream`.
  - version:
    - v19.1.0
    - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/44862
    description: The `cleanup` option was added.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.5.0, v18.14.0 | Добавлена ​​поддержка ReadableStream и WritableStream. |
    | v19.1.0, v18.13.0 | Добавлена ​​опция «очистка». |

* `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | [`<WritableStream>`](webstreams.md#class-writablestream) Поток для чтения и/или записи
  или веб-поток.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `error` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined
  * `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined
  * `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) | undefined
  * `cleanup` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Если `true`, удаляет слушателей, зарегистрированных
    этой функцией, до выполнения промиса. **По умолчанию:** `false`.
* Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется, когда поток перестаёт быть
  доступным для чтения или записи.

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

API `finished` также предоставляет [версию с обратным вызовом][stream-finished].

`stream.finished()` оставляет «висящие» обработчики событий (в частности
`'error'`, `'end'`, `'finish'` и `'close'`) после того, как возвращённый промис
выполнен или отклонён. Это сделано для того, чтобы неожиданные события `'error'`
(из-за некорректных реализаций потоков) не приводили к неожиданным сбоям.
Если такое поведение нежелательно, установите `options.cleanup` в
`true`:

=== "MJS"

    ```js
    await finished(rs, { cleanup: true });
    ```

### Объектный режим

Все потоки, создаваемые API Node.js, работают исключительно со строками и объектами
[Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) и [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView):

* `String` и `Buffer` — наиболее распространённые типы для потоков.
* `TypedArray` и `DataView` позволяют обрабатывать двоичные данные с типами вроде
  `Int32Array` или `Uint8Array`. При записи TypedArray или DataView в поток
  Node.js обрабатывает
  сырые байты.

Тем не менее реализации потоков
могут работать и с другими типами значений JavaScript (за исключением `null`, который в потоках имеет особое назначение).
Такие потоки считаются работающими в «объектном режиме».

Экземпляры переводятся в объектный режим опцией `objectMode`
при создании потока. Переключить уже существующий поток в объектный режим безопасно нельзя.

### Буферизация

<!--type=misc-->

И [`Writable`][`Writable`], и [`Readable`][`Readable`] потоки хранят данные во внутреннем буфере.

Объём потенциально буферизуемых данных зависит от опции `highWaterMark`,
передаваемой в конструктор потока. Для обычных потоков `highWaterMark`
задаёт [общее число байт][hwm-gotcha]. В объектном режиме — общее число объектов. Для потоков,
работающих со строками (но не декодирующих их), — общее число кодовых единиц UTF-16.

Данные буферизуются в потоках `Readable`, когда реализация вызывает
[`stream.push(chunk)`][stream-push]. Если потребитель потока не вызывает
[`stream.read()`][stream-read], данные остаются во внутренней
очереди, пока не будут прочитаны.

Когда суммарный размер внутреннего буфера чтения достигает порога
`highWaterMark`, поток временно перестаёт читать данные из базового ресурса, пока данные в буфере не будут потреблены (то есть
перестаёт вызываться внутренний метод [`readable._read()`][`readable._read()`], которым
заполняется буфер чтения).

Данные буферизуются в потоках `Writable`, когда многократно вызывается
[`writable.write(chunk)`][stream-write]. Пока суммарный размер внутреннего буфера записи ниже порога
`highWaterMark`, вызовы `writable.write()` возвращают `true`. Когда
размер буфера достигает или превышает `highWaterMark`, возвращается `false`.

Ключевая цель API `stream`, в частности метода [`stream.pipe()`][`stream.pipe()`],
— ограничить буферизацию до приемлемого уровня, чтобы источники и приёмники с разной скоростью не исчерпывали доступную память.

Опция `highWaterMark` — это порог, а не жёсткий лимит: она задаёт объём данных,
который поток буферизует, прежде чем перестать запрашивать новые данные. В общем случае
она не гарантирует строгое ограничение памяти. Конкретные реализации
могут вводить более жёсткие ограничения, но это необязательно.

Поскольку потоки [`Duplex`][`Duplex`] и [`Transform`][`Transform`] одновременно `Readable` и
`Writable`, у каждого есть _два_ отдельных внутренних буфера для чтения и записи,
чтобы стороны работали независимо друг от друга и сохраняли
эффективный поток данных. Например, экземпляры [`net.Socket`][`net.Socket`] — это [`Duplex`][`Duplex`], у которых сторона `Readable` позволяет
читать данные, полученные _из_ сокета, а сторона `Writable` — записывать данные _в_ сокет. Поскольку запись в сокет может идти
быстрее или медленнее, чем приём, каждая сторона должна
работать (и буферизовать) независимо.

Механика внутренней буферизации — деталь реализации
и может меняться. Для продвинутых сценариев внутренние буферы доступны через `writable.writableBuffer` или
`readable.readableBuffer`. Использование этих недокументированных свойств не рекомендуется.

## API для потребителей потоков

<!--type=misc-->

Почти все приложения Node.js в той или иной форме используют потоки.
Ниже пример использования потоков в приложении с HTTP-сервером:

```js
const http = require('node:http');

const server = http.createServer((req, res) => {
  // `req` is an http.IncomingMessage, which is a readable stream.
  // `res` is an http.ServerResponse, which is a writable stream.

  let body = '';
  // Get the data as utf8 strings.
  // If an encoding is not set, Buffer objects will be received.
  req.setEncoding('utf8');

  // Readable streams emit 'data' events once a listener is added.
  req.on('data', (chunk) => {
    body += chunk;
  });

  // The 'end' event indicates that the entire body has been received.
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      // Write back something interesting to the user:
      res.write(typeof data);
      res.end();
    } catch (er) {
      // uh oh! bad json!
      res.statusCode = 400;
      return res.end(`error: ${er.message}`);
    }
  });
});

server.listen(1337);

// $ curl localhost:1337 -d "{}"
// object
// $ curl localhost:1337 -d "\"foo\""
// string
// $ curl localhost:1337 -d "not json"
// error: Unexpected token 'o', "not json" is not valid JSON
```

Потоки [`Writable`][`Writable`] (например `res` в примере) предоставляют методы вроде
`write()` и `end()` для записи данных в поток.

Потоки [`Readable`][`Readable`] используют API [`EventEmitter`][`EventEmitter`], чтобы уведомлять код
о появлении данных; их можно читать разными способами.

И [`Writable`][`Writable`], и [`Readable`][`Readable`] используют [`EventEmitter`][`EventEmitter`] для передачи
состояния потока.

Потоки [`Duplex`][`Duplex`] и [`Transform`][`Transform`] одновременно [`Writable`][`Writable`] и
[`Readable`][`Readable`].

Приложения, которые только пишут в поток или читают из него, не обязаны
реализовывать интерфейсы потоков сами и обычно не вызывают `require('node:stream')`.

Разработчикам новых типов потоков см. раздел [API для реализаторов потоков][API for stream implementers].

### Потоки Writable

Потоки Writable — абстракция _приёмника_, куда записываются данные.

Примеры потоков [`Writable`][`Writable`]:

* [HTTP requests, on the client][HTTP requests, on the client]
* [HTTP responses, on the server][HTTP responses, on the server]
* [fs write streams][fs write streams]
* [zlib streams][zlib]
* [crypto streams][crypto]
* [TCP sockets][TCP sockets]
* [child process stdin][child process stdin]
* [`process.stdout`][`process.stdout`], [`process.stderr`][`process.stderr`]

Некоторые из них на самом деле [`Duplex`][`Duplex`], реализующие интерфейс [`Writable`][`Writable`].

Все потоки [`Writable`][`Writable`] реализуют интерфейс класса `stream.Writable`.

Конкретные экземпляры [`Writable`][`Writable`] могут отличаться, но общий шаблон
использования один, как в примере:

```js
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data');
```

#### Class: `stream.Writable`

<!-- YAML
added: v0.9.4
-->

<!--type=class-->

##### Event: `'close'`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18438
    description: Add `emitClose` option to specify if `'close'` is emitted on
                 destroy.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Добавьте опцию emitClose, чтобы указать, будет ли вызываться close при уничтожении. |

Событие `'close'` испускается, когда закрыты поток и его базовые ресурсы (например
дескриптор файла). Оно означает, что больше не будет событий и дальнейших вычислений.

Поток [`Writable`][`Writable`] всегда испускает `'close'`, если создан с опцией `emitClose`.

##### Event: `'drain'`

<!-- YAML
added: v0.9.4
-->

Если [`stream.write(chunk)`][stream-write] возвращает `false`, событие `'drain'`
испускается, когда снова можно возобновлять запись в поток.

```js
// Write the data to the supplied writable stream one million times.
// Be attentive to back-pressure.
function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 1000000;
  write();
  function write() {
    let ok = true;
    do {
      i--;
      if (i === 0) {
        // Last time!
        writer.write(data, encoding, callback);
      } else {
        // See if we should continue, or wait.
        // Don't pass the callback, because we're not done yet.
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // Had to stop early!
      // Write some more once it drains.
      writer.once('drain', write);
    }
  }
}
```

##### Event: `'error'`

<!-- YAML
added: v0.9.4
-->

* Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` испускается при ошибке записи или передачи по pipe. Обработчику
передаётся один аргумент — `Error`.

Поток закрывается при `'error'`, если при создании [`autoDestroy`][writable-new]
не был `false`.

После `'error'` больше не должно быть событий, кроме `'close'` (включая повторные `'error'`).

##### Event: `'finish'`

<!-- YAML
added: v0.9.4
-->

Событие `'finish'` испускается после вызова [`stream.end()`][stream-end], когда
все данные сброшены в нижележащую систему.

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

##### Event: `'pipe'`

<!-- YAML
added: v0.9.4
-->

* `src` [`<stream.Readable>`](stream.md#streamreadable) читаемый поток, подключаемый к этому writable

Событие `'pipe'` испускается при вызове [`stream.pipe()`][`stream.pipe()`] на читаемом потоке,
когда этот writable добавляется в список назначений.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('pipe', (src) => {
  console.log('Something is piping into the writer.');
  assert.equal(src, reader);
});
reader.pipe(writer);
```

##### Event: `'unpipe'`

<!-- YAML
added: v0.9.4
-->

* `src` [`<stream.Readable>`](stream.md#streamreadable) исходный поток, который [отключает][`stream.unpipe()`] этот writable

Событие `'unpipe'` испускается при вызове [`stream.unpipe()`][`stream.unpipe()`] на [`Readable`][`Readable`],
когда этот [`Writable`][`Writable`] удаляется из назначений.

Также испускается, если этот [`Writable`][`Writable`] выдаёт ошибку при подключении [`Readable`][`Readable`] по pipe.

```js
const writer = getWritableStreamSomehow();
const reader = getReadableStreamSomehow();
writer.on('unpipe', (src) => {
  console.log('Something has stopped piping into the writer.');
  assert.equal(src, reader);
});
reader.pipe(writer);
reader.unpipe(writer);
```

##### `writable.cork()`

<!-- YAML
added: v0.11.2
-->

Метод `writable.cork()` буферизует все записанные данные в памяти. Сброс
происходит при вызове [`stream.uncork()`][`stream.uncork()`] или [`stream.end()`][stream-end].

`writable.cork()` рассчитан на серию мелких порций подряд: вместо немедленной
отправки вниз буфер накапливается до `writable.uncork()`, затем передаётся в
`writable._writev()`, если он есть. Это снижает риск «блокировки в голове очереди»,
когда данные ждут обработки первой порции. Без реализации `writable._writev()`
пропускная способность может страдать.

См. также: [`writable.uncork()`][`writable.uncork()`], [`writable._writev()`][stream-_writev].

##### `writable.destroy([error])`

<!-- YAML
added: v8.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29197
    description: Work as a no-op on a stream that has already been destroyed.
-->

Добавлено в: v8.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Работайте без операции над потоком, который уже уничтожен. |

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) необязательно — ошибка для события `'error'`
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает поток. Может испустить `'error'` и `'close'` (если `emitClose` не `false`).
После вызова поток завершён; дальнейшие `write()`/`end()` дают `ERR_STREAM_DESTROYED`.
Это немедленное разрушение: предыдущие `write()` могли не успеть сброситься, и
тоже приведут к `ERR_STREAM_DESTROYED`. Если нужно сначала сбросить данные, используйте
`end()` или дождитесь `'drain'` перед уничтожением.

=== "CJS"

    ```js
    const { Writable } = require('node:stream');
    
    const myStream = new Writable();
    
    const fooErr = new Error('foo error');
    myStream.destroy(fooErr);
    myStream.on('error', (fooErr) => console.error(fooErr.message)); // foo error
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
    // ERR_STREAM_DESTROYED
    ```

Once `destroy()` has been called any further calls will be a no-op and no
further errors except from `_destroy()` may be emitted as `'error'`.

Implementors should not override this method,
but instead implement [`writable._destroy()`][writable-_destroy].

##### `writable.closed`

<!-- YAML
added: v18.0.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после испускания `'close'`.

##### `writable.destroyed`

<!-- YAML
added: v8.0.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`writable.destroy()`][writable-destroy].

=== "CJS"

    ```js
    const { Writable } = require('node:stream');
    
    const myStream = new Writable();
    
    console.log(myStream.destroyed); // false
    myStream.destroy();
    console.log(myStream.destroyed); // true
    ```

##### `writable.end([chunk[, encoding]][, callback])`

<!-- YAML
added: v0.9.4
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/51866
    description: The `chunk` argument can now be a `TypedArray` or `DataView` instance.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34101
    description: The `callback` is invoked before 'finish' or on error.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29747
    description: The `callback` is invoked if 'finish' or 'error' is emitted.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18780
    description: This method now returns a reference to `writable`.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Аргументом chunk теперь может быть экземпляр TypedArray или DataView. |
    | v15.0.0 | Обратный вызов вызывается перед завершением или в случае ошибки. |
    | v14.0.0 | Обратный вызов вызывается, если выдается сообщение «finish» или «error». |
    | v10.0.0 | Этот метод теперь возвращает ссылку на `writable`. |
    | v8.0.0 | Аргумент `chunk` теперь может быть экземпляром `Uint8Array`. |

* `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | any необязательные данные для записи. Вне
  object mode `chunk` должен быть [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView).
  В object mode — любое значение JavaScript, кроме `null`.
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) кодировка, если `chunk` — строка
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается по завершении потока
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`writable.end()` сообщает, что больше данных писать не будет. Необязательные `chunk`
и `encoding` позволяют записать последнюю порцию перед закрытием.

Вызов [`stream.write()`][stream-write] после [`stream.end()`][stream-end] приведёт к ошибке.

```js
// Write 'hello, ' and then end with 'world!'.
const fs = require('node:fs');
const file = fs.createWriteStream('example.txt');
file.write('hello, ');
file.end('world!');
// Writing more now is not allowed!
```

##### `writable.setDefaultEncoding(encoding)`

<!-- YAML
added: v0.11.15
changes:
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/5040
    description: This method now returns a reference to `writable`.
-->

Добавлено в: v0.11.15

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.1.0 | Этот метод теперь возвращает ссылку на `writable`. |

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) новая кодировка по умолчанию
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`writable.setDefaultEncoding()` задаёт кодировку по умолчанию для [`Writable`][`Writable`].

##### `writable.uncork()`

<!-- YAML
added: v0.11.2
-->

`writable.uncork()` сбрасывает данные, буферизованные после [`stream.cork()`][`stream.cork()`].

При использовании [`writable.cork()`][`writable.cork()`]/`writable.uncork()` откладывайте `uncork`
через `process.nextTick()`, чтобы сгруппировать все `write()` в одной фазе цикла событий.

```js
stream.cork();
stream.write('some ');
stream.write('data ');
process.nextTick(() => stream.uncork());
```

Если [`writable.cork()`][`writable.cork()`] вызывали несколько раз, столько же раз нужно вызвать
`writable.uncork()`, чтобы сбросить буфер.

```js
stream.cork();
stream.write('some ');
stream.cork();
stream.write('data ');
process.nextTick(() => {
  stream.uncork();
  // The data will not be flushed until uncork() is called a second time.
  stream.uncork();
});
```

См. также: [`writable.cork()`][`writable.cork()`].

##### `writable.writable`

<!-- YAML
added: v11.4.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если безопасно вызывать [`writable.write()`][stream-write]: поток не уничтожен,
не в ошибке и не завершён.

##### `writable.writableAborted`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
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

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Показывает, был ли поток уничтожен или переведён в ошибку до события `'finish'`.

##### `writable.writableEnded`

<!-- YAML
added: v12.9.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`writable.end()`][`writable.end()`]. Не отражает, сброшены ли данные; для этого
см. [`writable.writableFinished`][`writable.writableFinished`].

##### `writable.writableCorked`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Сколько раз ещё нужно вызвать [`writable.uncork()`][stream-uncork], чтобы полностью снять cork.

##### `writable.errored`

<!-- YAML
added:
  v18.0.0
-->

* Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Ошибка, если поток уничтожен с ошибкой.

##### `writable.writableFinished`

<!-- YAML
added: v12.6.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Становится `true` непосредственно перед событием [`'finish'`][`'finish'`].

##### `writable.writableHighWaterMark`

<!-- YAML
added: v9.3.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Значение `highWaterMark`, переданное при создании этого `Writable`.

##### `writable.writableLength`

<!-- YAML
added: v9.4.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число байт (или объектов) в очереди на запись; показывает состояние относительно `highWaterMark`.

##### `writable.writableNeedDrain`

<!-- YAML
added:
  - v15.2.0
  - v14.17.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если буфер был заполнен и поток испустит `'drain'`.

##### `writable.writableObjectMode`

<!-- YAML
added: v12.3.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Геттер свойства `objectMode` у данного потока `Writable`.

##### `writable[Symbol.asyncDispose]()`

<!-- YAML
added:
- v22.4.0
- v20.16.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Вызывает [`writable.destroy()`][writable-destroy] с `AbortError` и возвращает
промис, который выполняется после завершения потока.

##### `writable.write(chunk[, encoding][, callback])`

<!-- YAML
added: v0.9.4
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/51866
    description: The `chunk` argument can now be a `TypedArray` or `DataView` instance.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/6170
    description: Passing `null` as the `chunk` parameter will always be
                 considered invalid now, even in object mode.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Аргументом chunk теперь может быть экземпляр TypedArray или DataView. |
    | v8.0.0 | Аргумент `chunk` теперь может быть экземпляром `Uint8Array`. |
    | v6.0.0 | Передача `null` в качестве параметра `chunk` теперь всегда будет считаться недействительной, даже в объектном режиме. |

* `chunk` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | any данные для записи. Вне object mode —
  [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView); в object mode — любое значение, кроме `null`.
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null кодировка, если `chunk` — строка. **По умолчанию:** `'utf8'`
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) вызывается после сброса этой порции
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false`, если нужно дождаться [`'drain'`][`'drain'`] перед дальнейшей записью; иначе `true`.

`writable.write()` записывает данные и вызывает `callback`, когда порция обработана.
При ошибке `callback` получает её первым аргументом; вызывается асинхронно и до `'error'`.

`true`, если после приёма `chunk` внутренний буфер ниже `highWaterMark` при создании потока.
При `false` не продолжайте запись до [`'drain'`][`'drain'`].

Пока поток не «освобождается», `write()` буферизует порции и возвращает `false`. После
сброса всех буферов в ОС испускается `'drain'`. Если `write()` вернул `false`, не пишите
дальше до `'drain'`. Повторные `write()` на неосвобождённом потоке разрешены, но Node.js
буферизует всё до исчерпания памяти и аварийного завершения. Даже до этого высокое
потребление памяти ухудшает работу GC и RSS (объём редко возвращается системе). TCP-сокет
может не «освобождаться», если удалённая сторона не читает — запись в такой сокет опасна.

Для [`Transform`][`Transform`] запись при отсутствии drain особенно критична: `Transform` по умолчанию
на паузе, пока не подключён pipe или обработчики `'data'`/`'readable'`.

Если данные можно получать по требованию, лучше оформить это как [`Readable`][`Readable`] и
[`stream.pipe()`][`stream.pipe()`]. Если нужен именно `write()`, учитывайте обратное давление через
[`'drain'`][`'drain'`]:

```js
function write(data, cb) {
  if (!stream.write(data)) {
    stream.once('drain', cb);
  } else {
    process.nextTick(cb);
  }
}

// Wait for cb to be called before doing any other write.
write('hello', () => {
  console.log('Write completed, do more writes now.');
});
```

В object mode `Writable` игнорирует аргумент `encoding`.

### Потоки Readable

Потоки Readable — абстракция _источника_, из которого потребляют данные.

Примеры потоков `Readable`:

* [HTTP responses, on the client][http-incoming-message]
* [HTTP requests, on the server][http-incoming-message]
* [fs read streams][fs read streams]
* [zlib streams][zlib]
* [crypto streams][crypto]
* [TCP sockets][TCP sockets]
* [child process stdout and stderr][child process stdout and stderr]
* [`process.stdin`][`process.stdin`]

Все потоки [`Readable`][`Readable`] реализуют интерфейс класса `stream.Readable`.

#### Два режима чтения

`Readable` работает в одном из режимов: потоковый (flowing) или приостановленный (paused).
Это не то же самое, что [object mode][object-mode]: object mode может быть включён или нет независимо.

* В потоковом режиме данные читаются из нижележащей системы автоматически и по возможности быстро
  доставляются приложению через события [`EventEmitter`][`EventEmitter`].

* В приостановленном режиме порции нужно явно забирать через [`stream.read()`][stream-read].

Изначально все [`Readable`][`Readable`] в paused, переход в flowing:

* подписка на [`'data'`][`'data'`];
* вызов [`stream.resume()`][stream-resume];
* вызов [`stream.pipe()`][`stream.pipe()`] к [`Writable`][`Writable`].

Обратно в paused:

* без назначений pipe — [`stream.pause()`][stream-pause];
* с pipe — удалить все назначения (в том числе через [`stream.unpipe()`][`stream.unpipe()`]).

Важно: `Readable` не генерирует данные, пока не задан способ потребления или игнорирования.
Если механизм потребления отключён, поток _пытается_ прекратить генерацию.

Из совместимости: удаление обработчиков [`'data'`][`'data'`] **не** ставит поток на паузу автоматически.
При наличии pipe вызов [`stream.pause()`][stream-pause] не гарантирует, что поток _останется_
на паузе, когда назначения снова запросят данные.

Если `Readable` переведён в flowing и некому обрабатывать данные, они теряются (например
`readable.resume()` без слушателя `'data'` или снятый обработчик `'data'`).

Обработчик [`'readable'`][`'readable'`] переводит поток из flowing; данные читают через
[`readable.read()`][stream-read]. Если `'readable'` снят, flowing возобновится при наличии
[`'data'`][`'data'`].

#### Три состояния

«Два режима» — упрощение для внутреннего состояния `Readable`.

В каждый момент у `Readable` одно из:

* `readable.readableFlowing === null`
* `readable.readableFlowing === false`
* `readable.readableFlowing === true`

При `null` механизм потребления не задан — поток не генерирует данные. Подписка на `'data'`,
`readable.pipe()` или `readable.resume()` ставит `readable.readableFlowing` в `true`, и поток
начинает активно выдавать события.

`readable.pause()`, `readable.unpipe()` или обратное давление ставят `readable.readableFlowing`
в `false`: события приостанавливаются, генерация данных не обязательно. В этом состоянии новый
слушатель `'data'` не переключает `readable.readableFlowing` в `true`.

```js
const { PassThrough, Writable } = require('node:stream');
const pass = new PassThrough();
const writable = new Writable();

pass.pipe(writable);
pass.unpipe(writable);
// readableFlowing is now false.

pass.on('data', (chunk) => { console.log(chunk.toString()); });
// readableFlowing is still false.
pass.write('ok');  // Will not emit 'data'.
pass.resume();     // Must be called to make stream emit 'data'.
// readableFlowing is now true.
```

При `readable.readableFlowing === false` данные могут накапливаться во внутреннем буфере потока.

#### Выберите один стиль API

API `Readable` развивался несколько версий Node.js и даёт разные способы чтения.
Обычно нужно выбрать _один_ способ потребления и _не смешивать_ несколько на одном потоке.
Сочетание `on('data')`, `on('readable')`, `pipe()` или асинхронных итераторов даёт неочевидное поведение.

#### Class: `stream.Readable`

<!-- YAML
added: v0.9.4
-->

<!--type=class-->

##### Event: `'close'`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18438
    description: Add `emitClose` option to specify if `'close'` is emitted on
                 destroy.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Добавьте опцию emitClose, чтобы указать, будет ли вызываться close при уничтожении. |

Событие `'close'` генерируется, когда поток и любой из его базовых ресурсов (например,
дескриптор файла) закрыты. Оно означает, что дальнейших событий не будет и вычислений не продолжится.

Поток [`Readable`][`Readable`] всегда испускает `'close'`, если создан с опцией `emitClose`.

##### Event: `'data'`

<!-- YAML
added: v0.9.4
-->

* `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | any Фрагмент данных. Вне объектного режима это строка или `Buffer`.
  В объектном режиме — любое значение JavaScript, кроме `null`.

Событие `'data'` генерируется всякий раз, когда поток передаёт фрагмент данных потребителю:
при переходе в потоковый режим через `readable.pipe()`, `readable.resume()` или при подписке
на `'data'`, а также при вызове `readable.read()`, когда данные готовы к выдаче.

Подписка на `'data'` у потока, который явно не приостановлен, переводит его в потоковый режим;
данные передаются по мере поступления.

Если для потока задана кодировка через `readable.setEncoding()`, в колбэк передаётся строка;
иначе — `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});
```

##### Event: `'end'`

<!-- YAML
added: v0.9.4
-->

Событие `'end'` генерируется, когда из потока больше нечего читать.

Событие `'end'` **не будет** испущено, пока данные полностью не потреблены: переведите поток
в потоковый режим или вызывайте [`stream.read()`][stream-read] до полного опустошения буфера.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});
readable.on('end', () => {
  console.log('There will be no more data.');
});
```

##### Event: `'error'`

<!-- YAML
added: v0.9.4
-->

* Type: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` реализация `Readable` может испустить в любой момент — обычно при сбое
источника данных или при попытке передать недопустимый фрагмент.

В колбэк передаётся один объект `Error`.

##### Event: `'pause'`

<!-- YAML
added: v0.9.4
-->

Событие `'pause'` генерируется при вызове [`stream.pause()`][stream-pause], если
`readableFlowing` не `false`.

##### Event: `'readable'`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17979
    description: The `'readable'` is always emitted in the next tick after
                 `.push()` is called.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18994
    description: Using `'readable'` requires calling `.read()`.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | `'readable'` всегда генерируется в следующем такте после вызова `'.push()`. |
    | v10.0.0 | Использование readable требует вызова .read(). |

Событие `'readable'` генерируется, когда в потоке есть данные для чтения до порога
`highWaterMark` (`state.highWaterMark`): в буфере появилась новая порция. При наличии данных
в буфере можно вызывать [`stream.read()`][stream-read]. Также `'readable'` может прийти
при достижении конца потока.

```js
const readable = getReadableStreamSomehow();
readable.on('readable', function() {
  // Сейчас есть что прочитать.
  let data;

  while ((data = this.read()) !== null) {
    console.log(data);
  }
});
```

Если конец потока уже достигнут, вызов [`stream.read()`][stream-read] вернёт `null` и
инициирует `'end'`. То же, если данных не было вовсе: в примере `foo.txt` — пустой файл:

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

В некоторых случаях подписка на `'readable'` приводит к тому, что часть данных
читается во внутренний буфер.

Обычно проще `readable.pipe()` и событие `'data'`, чем `'readable'`, но обработка
`'readable'` иногда даёт большую пропускную способность.

Если одновременно используются `'readable'` и [`'data'`][`'data'`], потоком управляет `'readable'`:
`'data'` приходит только при вызове [`stream.read()`][stream-read], свойство
`readableFlowing` становится `false`.
Если при снятии подписки на `'readable'` остались слушатели `'data'`, поток снова
переходит в потоковый режим — `'data'` идут без вызова `.resume()`.

##### Event: `'resume'`

<!-- YAML
added: v0.9.4
-->

Событие `'resume'` генерируется при вызове [`stream.resume()`][stream-resume], если
`readableFlowing` не `true`.

##### `readable.destroy([error])`

<!-- YAML
added: v8.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29197
    description: Work as a no-op on a stream that has already been destroyed.
-->

Добавлено в: v8.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Работайте без операции над потоком, который уже уничтожен. |

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка, передаваемая в событии `'error'`
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Уничтожает поток, при необходимости испуская `'error'` и `'close'` (если `emitClose` не `false`).
После вызова освобождаются внутренние ресурсы, дальнейшие вызовы `push()` игнорируются.

После `destroy()` повторные вызовы — no-op; новые `'error'` (кроме из `_destroy()`) не ожидаются.

Реализации не должны переопределять этот метод — реализуйте
[`readable._destroy()`][readable-_destroy].

##### `readable.closed`

<!-- YAML
added: v18.0.0
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после события `'close'`.

##### `readable.destroyed`

<!-- YAML
added: v8.0.0
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после вызова [`readable.destroy()`][readable-destroy].

##### `readable.isPaused()`

<!-- YAML
added: v0.11.14
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`readable.isPaused()` возвращает текущее состояние `Readable`; в основном используется
механизмом `readable.pipe()`. В типичных сценариях вызывать напрямую не требуется.

```js
const readable = new stream.Readable();

readable.isPaused(); // === false
readable.pause();
readable.isPaused(); // === true
readable.resume();
readable.isPaused(); // === false
```

##### `readable.pause()`

<!-- YAML
added: v0.9.4
-->

* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.pause()` останавливает испускание [`'data'`][`'data'`] в потоковом режиме
и выводит поток из потокового режима. Данные остаются во внутреннем буфере.

```js
const readable = getReadableStreamSomehow();
readable.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
  readable.pause();
  console.log('There will be no additional data for 1 second.');
  setTimeout(() => {
    console.log('Now data will start flowing again.');
    readable.resume();
  }, 1000);
});
```

`readable.pause()` не действует, если есть слушатель `'readable'`.

##### `readable.pipe(destination[, options])`

<!-- YAML
added: v0.9.4
-->

* `destination` [`<stream.Writable>`](stream.md#streamwritable) Поток назначения для записи
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Опции pipe
  * `end` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Завершать writer при `'end'` reader. **По умолчанию:** `true`.
* Возвращает: [`<stream.Writable>`](stream.md#streamwritable) _destination_ — для цепочки pipe, если это [`Duplex`][`Duplex`] или [`Transform`][`Transform`]

`readable.pipe()` подключает [`Writable`][`Writable`] к `readable`, переводит его в потоковый режим
и передаёт все данные в этот [`Writable`][`Writable`]. Поток данных регулируется так, чтобы быстрый
`Readable` не перегружал приёмник.

Пример: весь вывод из `readable` — в файл `file.txt`:

```js
const fs = require('node:fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// All the data from readable goes into 'file.txt'.
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

По умолчанию на конечном `Writable` вызывается [`stream.end()`][stream-end], когда источник
`Readable` испускает [`'end'`][`'end'`], и запись завершается. Чтобы оставить поток открытым,
передайте `end: false`:

```js
reader.pipe(writer, { end: false });
reader.on('end', () => {
  writer.end('Goodbye\n');
});
```

Важно: если при обработке `Readable` возникает ошибка, `Writable` назначения _автоматически не закрывается_ —
потоки нужно закрыть _вручную_, иначе возможны утечки памяти.

[`process.stderr`][`process.stderr`] и [`process.stdout`][`process.stdout`] не закрываются до выхода процесса Node.js, независимо от опций.

##### `readable.read([size])`

<!-- YAML
added: v0.9.4
-->

* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательно — сколько байт прочитать.
* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer>`](buffer.md#buffer) | null | any

`readable.read()` читает данные из внутреннего буфера. Если данных нет — `null`.
По умолчанию возвращается `Buffer`, если не задана кодировка через `readable.setEncoding()` или объектный режим.

Аргумент `size` задаёт число байт; если их нет, вернётся `null`, _если только_ поток не завершён —
тогда отдаётся остаток буфера.

Без `size` возвращается всё содержимое буфера.

`size` не больше 1 GiB.

`readable.read()` следует вызывать у `Readable` в приостановленном режиме. В потоковом режиме
`readable.read()` вызывается автоматически до опустошения буфера.

```js
const readable = getReadableStreamSomehow();

// 'readable' может срабатывать несколько раз по мере накопления данных
readable.on('readable', () => {
  let chunk;
  console.log('Stream is readable (new data received in buffer)');
  // Цикл, чтобы прочитать все доступные сейчас данные
  while (null !== (chunk = readable.read())) {
    console.log(`Read ${chunk.length} bytes of data...`);
  }
});

// 'end' — один раз, когда данных больше нет
readable.on('end', () => {
  console.log('Reached end of stream.');
});
```

Каждый вызов `readable.read()` возвращает фрагмент или `null`, если сейчас читать нечего.
Фрагменты не склеиваются автоматически; для полного чтения часто нужен цикл `while`.
При чтении большого файла `.read()` может временно вернуть `null`, если буфер опустошен,
но данные ещё поступят — тогда снова придёт `'readable'`, а `'end'` означает конец передачи.

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

В объектном режиме `Readable` каждый вызов [`readable.read(size)`][stream-read] возвращает
ровно один элемент, независимо от `size`.

Если `readable.read()` вернул фрагмент данных, дополнительно испускается `'data'`.

После [`'end'`][`'end'`] вызов [`stream.read([size])`][stream-read] даёт `null` без исключения.

##### `readable.readable`

<!-- YAML
added: v11.4.0
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если безопасно вызывать [`readable.read()`][stream-read]: поток не уничтожен и не
испустил `'error'` или `'end'`.

##### `readable.readableAborted`

<!-- YAML
added: v16.8.0
changes:
 - version:
    - v24.0.0
    - v22.17.0
   pr-url: https://github.com/nodejs/node/pull/57513
   description: Marking the API stable.
-->

Добавлено в: v16.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, был ли поток уничтожен или завершён с ошибкой до `'end'`.

##### `readable.readableDidRead`

<!-- YAML
added:
  - v16.7.0
  - v14.18.0
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

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Возвращает, было ли испущено событие `'data'`.

##### `readable.readableEncoding`

<!-- YAML
added: v12.7.0
-->

* Type: null | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Геттер свойства `encoding` для данного `Readable`. Кодировку задаёт [`readable.setEncoding()`][`readable.setEncoding()`].

##### `readable.readableEnded`

<!-- YAML
added: v12.9.0
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Становится `true` при событии [`'end'`][`'end'`].

##### `readable.errored`

<!-- YAML
added:
  v18.0.0
-->

* Type: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Ошибка, если поток уничтожен с ошибкой.

##### `readable.readableFlowing`

<!-- YAML
added: v9.4.0
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отражает состояние `Readable`, см. раздел [Три состояния][Three states].

##### `readable.readableHighWaterMark`

<!-- YAML
added: v9.3.0
-->

* Type: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Значение `highWaterMark`, переданное при создании этого `Readable`.

##### `readable.readableLength`

<!-- YAML
added: v9.4.0
-->

* Type: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число байт (или объектов) в очереди на чтение; показывает заполнение относительно `highWaterMark`.

##### `readable.readableObjectMode`

<!-- YAML
added: v12.3.0
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Геттер свойства `objectMode` для данного `Readable`.

##### `readable.resume()`

<!-- YAML
added: v0.9.4
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18994
    description: The `resume()` has no effect if there is a `'readable'` event
                 listening.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Функцияresume() не имеет никакого эффекта, если происходит прослушивание события, доступного для чтения. |

* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.resume()` возобновляет испускание [`'data'`][`'data'`] у явно приостановленного `Readable`,
переводя поток в потоковый режим.

Можно использовать, чтобы «проглотить» данные без их обработки:

```js
getReadableStreamSomehow()
  .resume()
  .on('end', () => {
    console.log('Reached the end, but did not read anything.');
  });
```

`readable.resume()` не действует при наличии слушателя `'readable'`.

##### `readable.setEncoding(encoding)`

<!-- YAML
added: v0.9.4
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка.
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.setEncoding()` задаёт кодировку для данных, читаемых из `Readable`.

По умолчанию кодировка не задана — данные приходят как `Buffer`. При установке кодировки
строки возвращаются в этой кодировке. Например, `readable.setEncoding('utf8')` даёт строки UTF-8,
`readable.setEncoding('hex')` — шестнадцатеричные строки.

`Readable` корректно обрабатывает многобайтовые символы, которые иначе могли бы некорректно
декодироваться при чтении сырых `Buffer`.

```js
const readable = getReadableStreamSomehow();
readable.setEncoding('utf8');
readable.on('data', (chunk) => {
  assert.equal(typeof chunk, 'string');
  console.log('Got %d characters of string data:', chunk.length);
});
```

##### `readable.unpipe([destination])`

<!-- YAML
added: v0.9.4
-->

* `destination` [`<stream.Writable>`](stream.md#streamwritable) Необязательно — какой поток отсоединить
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

`readable.unpipe()` отсоединяет ранее подключённый через [`stream.pipe()`][`stream.pipe()`] `Writable`.

Если `destination` не указан — отсоединяются _все_ pipe.

Если указан `destination`, но pipe к нему не был настроен — метод ничего не делает.

```js
const fs = require('node:fs');
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// All the data from readable goes into 'file.txt',
// but only for the first second.
readable.pipe(writable);
setTimeout(() => {
  console.log('Stop writing to file.txt.');
  readable.unpipe(writable);
  console.log('Manually close the file stream.');
  writable.end();
}, 1000);
```

##### `readable.unshift(chunk[, encoding])`

<!-- YAML
added: v0.9.11
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/51866
    description: The `chunk` argument can now be a `TypedArray` or `DataView` instance.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
-->

Добавлено в: v0.9.11

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Аргументом chunk теперь может быть экземпляр TypedArray или DataView. |
    | v8.0.0 | Аргумент `chunk` теперь может быть экземпляром `Uint8Array`. |

* `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | any Фрагмент, возвращаемый во внутреннюю очередь чтения.
  Вне объектного режима — [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) или `null`.
  В объектном режиме — любое значение JavaScript.
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка строковых фрагментов; допустимая для `Buffer`, например `'utf8'` или `'ascii'`.

`chunk === null` задаёт конец потока (EOF), как `readable.push(null)`; дальше данные не пишутся.
Маркер EOF ставится в конец буфера; накопленные данные всё равно выдаются.

`readable.unshift()` возвращает фрагмент во внутренний буфер. Полезно, когда код уже прочитал
лишнее и должен «откатить» данные, чтобы передать их дальше.

После [`'end'`][`'end'`] вызвать `stream.unshift(chunk)` нельзя — будет ошибка.

Часто уместнее [`Transform`][`Transform`] вместо `stream.unshift()`; см. [API для реализаторов потоков][API for stream implementers].

```js
// Pull off a header delimited by \n\n.
// Use unshift() if we get too much.
// Call the callback with (error, header, stream).
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
        // Found the header boundary.
        const split = str.split(/\n\n/);
        header += split.shift();
        const remaining = split.join('\n\n');
        const buf = Buffer.from(remaining, 'utf8');
        stream.removeListener('error', callback);
        // Remove the 'readable' listener before unshifting.
        stream.removeListener('readable', onReadable);
        if (buf.length)
          stream.unshift(buf);
        // Now the body of the message can be read from the stream.
        callback(null, header, stream);
        return;
      }
      // Still reading the header.
      header += str;
    }
  }
}
```

В отличие от [`stream.push(chunk)`][stream-push], `stream.unshift(chunk)` не сбрасывает
внутреннее состояние чтения. Вызов `readable.unshift()` во время чтения (например из
[`stream._read()`][stream-_read]) может дать неожиданный эффект; после `unshift` иногда
ставят немедленный [`stream.push('')`][stream-push], но лучше не вызывать `unshift` в процессе `_read`.

##### `readable.wrap(stream)`

<!-- YAML
added: v0.9.4
-->

* `stream` [`<Stream>`](stream.md#stream) «Старый» readable-поток
* Возвращает: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

До Node.js 0.10 потоки не соответствовали нынешнему API `node:stream` (см. [совместимость][Compatibility]).

Если старая библиотека испускает [`'data'`][`'data'`] и [`stream.pause()`][stream-pause] лишь рекомендательный,
`readable.wrap()` оборачивает её в новый [`Readable`][`Readable`].

`wrap()` нужен редко; оставлен для работы со старым кодом.

```js
const { OldReader } = require('./old-api-module.js');
const { Readable } = require('node:stream');
const oreader = new OldReader();
const myReader = new Readable().wrap(oreader);

myReader.on('readable', () => {
  myReader.read(); // etc.
});
```

##### `readable[Symbol.asyncIterator]()`

<!-- YAML
added: v10.0.0
changes:
  - version: v11.14.0
    pr-url: https://github.com/nodejs/node/pull/26989
    description: Symbol.asyncIterator support is no longer experimental.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v11.14.0 | Поддержка Symbol.asyncIterator больше не является экспериментальной. |

* Returns: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) to fully consume the stream.

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

If the loop terminates with a `break`, `return`, or a `throw`, the stream will
be destroyed. In other terms, iterating over a stream will consume the stream
fully. The stream will be read in chunks of size equal to the `highWaterMark`
option. In the code example above, data will be in a single chunk if the file
has less then 64 KiB of data because no `highWaterMark` option is provided to
[`fs.createReadStream()`][`fs.createReadStream()`].

##### `readable[Symbol.for('Stream.toAsyncStreamable')]()`

<!-- YAML
added: REPLACEME
-->

> Stability: 1 - Experimental

* Returns: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) An `AsyncIterable<Uint8Array[]>` that yields
  batched chunks from the stream.

When the `--experimental-stream-iter` flag is enabled, `Readable` streams
implement the [`Stream.toAsyncStreamable`][`Stream.toAsyncStreamable`] protocol, enabling efficient
consumption by the [`stream/iter`][`stream/iter`] API.

This provides a batched async iterator that drains the stream's internal
buffer into `Uint8Array[]` batches, amortizing the per-chunk Promise overhead
of the standard `Symbol.asyncIterator` path. For byte-mode streams, chunks
are yielded directly as `Buffer` instances (which are `Uint8Array` subclasses).
For object-mode or encoded streams, each chunk is normalized to `Uint8Array`
before batching.

The returned iterator is tagged as a validated source, so [`from()`][stream-iter-from]
passes it through without additional normalization.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { text, from } from 'node:stream/iter';
    
    const readable = new Readable({
      read() { this.push('hello'); this.push(null); },
    });
    
    // Readable is automatically consumed via toAsyncStreamable
    console.log(await text(from(readable))); // 'hello'
    ```

=== "CJS"

    ```js
    const { Readable } = require('node:stream');
    const { text, from } = require('node:stream/iter');
    
    async function run() {
      const readable = new Readable({
        read() { this.push('hello'); this.push(null); },
      });
    
      console.log(await text(from(readable))); // 'hello'
    }
    
    run().catch(console.error);
    ```

Without the `--experimental-stream-iter` flag, calling this method throws
[`ERR_STREAM_ITER_MISSING_FLAG`][`ERR_STREAM_ITER_MISSING_FLAG`].

##### `readable[Symbol.asyncDispose]()`

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

Calls [`readable.destroy()`][readable-destroy] with an `AbortError` and returns
a promise that fulfills when the stream is finished.

##### `readable.compose(stream[, options])`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
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

* `stream` [`<Writable>`](stream.md#class-streamwritable) | [`<Duplex>`](stream.md#class-streamduplex) | [`<WritableStream>`](webstreams.md#class-writablestream) | [`<TransformStream>`](webstreams.md#class-transformstream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Duplex>`](stream.md#class-streamduplex) a stream composed with the stream `stream`.

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
    
    console.log(words); // prints ['text', 'passed', 'through', 'composed', 'stream']
    ```

`readable.compose(s)` is equivalent to `stream.compose(readable, s)`.

This method also allows for an [AbortSignal](globals.md#abortsignal) to be provided, which will destroy
the composed stream when aborted.

See [`stream.compose(...streams)`][`stream.compose(...streams)`] for more information.

##### `readable.iterator([options])`

<!-- YAML
added: v16.3.0
changes:
 - version:
    - v24.0.0
    - v22.17.0
   pr-url: https://github.com/nodejs/node/pull/57513
   description: Marking the API stable.
-->

Добавлено в: v16.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `destroyOnReturn` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When set to `false`, calling `return` on the
    async iterator, or exiting a `for await...of` iteration using a `break`,
    `return`, or `throw` will not destroy the stream. **Default:** `true`.
* Returns: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) to consume the stream.

The iterator created by this method gives users the option to cancel the
destruction of the stream if the `for await...of` loop is exited by `return`,
`break`, or `throw`, or if the iterator should destroy the stream if the stream
emitted an error during iteration.

```js
const { Readable } = require('node:stream');

async function printIterator(readable) {
  for await (const chunk of readable.iterator({ destroyOnReturn: false })) {
    console.log(chunk); // 1
    break;
  }

  console.log(readable.destroyed); // false

  for await (const chunk of readable.iterator({ destroyOnReturn: false })) {
    console.log(chunk); // Will print 2 and then 3
  }

  console.log(readable.destroyed); // True, stream was totally consumed
}

async function printSymbolAsyncIterator(readable) {
  for await (const chunk of readable) {
    console.log(chunk); // 1
    break;
  }

  console.log(readable.destroyed); // true
}

async function showBoth() {
  await printIterator(Readable.from([1, 2, 3]));
  await printSymbolAsyncIterator(Readable.from([1, 2, 3]));
}

showBoth();
```

##### `readable.map(fn[, options])`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
changes:
  - version:
    - v20.7.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/49249
    description: added `highWaterMark` in options.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.7.0, v18.19.0 | в настройках добавлен highWaterMark. |

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to map over every chunk in the
  stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) how many items to buffer while waiting for user
    consumption of the mapped items. **Default:** `concurrency * 2 - 1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Возвращает: [`<Readable>`](stream.md#readable-streams) поток, полученный отображением через `fn`.

Отображает поток: `fn` вызывается для каждого фрагмента. Если `fn` возвращает промис,
он ожидается перед передачей в результирующий поток.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';
    
    // With a synchronous mapper.
    for await (const chunk of Readable.from([1, 2, 3, 4]).map((x) => x * 2)) {
      console.log(chunk); // 2, 4, 6, 8
    }
    // With an asynchronous mapper, making at most 2 queries at a time.
    const resolver = new Resolver();
    const dnsResults = Readable.from([
      'nodejs.org',
      'openjsf.org',
      'www.linuxfoundation.org',
    ]).map((domain) => resolver.resolve4(domain), { concurrency: 2 });
    for await (const result of dnsResults) {
      console.log(result); // Logs the DNS result of resolver.resolve4.
    }
    ```

##### `readable.filter(fn[, options])`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
changes:
  - version:
    - v20.7.0
    - v18.19.0
    pr-url: https://github.com/nodejs/node/pull/49249
    description: added `highWaterMark` in options.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.7.0, v18.19.0 | в настройках добавлен highWaterMark. |

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to filter chunks from the stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) how many items to buffer while waiting for user
    consumption of the filtered items. **Default:** `concurrency * 2 - 1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Возвращает: [`<Readable>`](stream.md#readable-streams) поток после фильтрации предикатом `fn`.

Фильтрует поток: для каждого фрагмента вызывается `fn`; при истинном результате фрагмент
попадает в выходной поток. Промисы от `fn` ожидаются.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';
    
    // With a synchronous predicate.
    for await (const chunk of Readable.from([1, 2, 3, 4]).filter((x) => x > 2)) {
      console.log(chunk); // 3, 4
    }
    // With an asynchronous predicate, making at most 2 queries at a time.
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
      // Logs domains with more than 60 seconds on the resolved dns record.
      console.log(result);
    }
    ```

##### `readable.forEach(fn[, options])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to call on each chunk of the stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис завершения обхода.

Обходит поток и вызывает `fn` для каждого фрагмента; промисы от `fn` ожидаются.

В отличие от `for await...of`, допускается параллельная обработка фрагментов. Остановить `forEach`
можно через `signal` и `AbortController`; `for await...of` — через `break`/`return`. В обоих случаях поток уничтожается.

В отличие от подписки на [`'data'`][`'data'`], опирается на механизм [`readable`][`Readable`] и может ограничивать число параллельных вызовов `fn`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';
    
    // With a synchronous predicate.
    for await (const chunk of Readable.from([1, 2, 3, 4]).filter((x) => x > 2)) {
      console.log(chunk); // 3, 4
    }
    // With an asynchronous predicate, making at most 2 queries at a time.
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
      // Logs result, similar to `for await (const result of dnsResults)`
      console.log(result);
    });
    console.log('done'); // Stream has finished
    ```

##### `readable.toArray([options])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows cancelling the toArray operation if the
    signal is aborted.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис с массивом всех элементов потока.

Упрощает получение всех данных из потока.

Читает весь поток в память, сводя на нет преимущества потоковой обработки; для удобства и стыковки с API, не как основной способ потребления.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { Resolver } from 'node:dns/promises';
    
    await Readable.from([1, 2, 3, 4]).toArray(); // [1, 2, 3, 4]
    
    const resolver = new Resolver();
    
    // Make dns queries concurrently using .map and collect
    // the results into an array using toArray
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

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to call on each chunk of the stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) `true`, если для хотя бы одного фрагмента `fn` дал истинное значение.

Аналог `Array.prototype.some`: `fn` вызывается для фрагментов, пока не получится истинный результат после `await`;
тогда поток уничтожается и промис выполняется с `true`. Если ни один фрагмент не подошёл — `false`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { stat } from 'node:fs/promises';
    
    // With a synchronous predicate.
    await Readable.from([1, 2, 3, 4]).some((x) => x > 2); // true
    await Readable.from([1, 2, 3, 4]).some((x) => x < 0); // false
    
    // With an asynchronous predicate, making at most 2 file checks at a time.
    const anyBigFile = await Readable.from([
      'file1',
      'file2',
      'file3',
    ]).some(async (fileName) => {
      const stats = await stat(fileName);
      return stats.size > 1024 * 1024;
    }, { concurrency: 2 });
    console.log(anyBigFile); // `true` if any file in the list is bigger than 1MB
    console.log('done'); // Stream has finished
    ```

##### `readable.find(fn[, options])`

<!-- YAML
added:
  - v17.5.0
  - v16.17.0
-->

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to call on each chunk of the stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) a promise evaluating to the first chunk for which `fn`
  evaluated with a truthy value, or `undefined` if no element was found.

This method is similar to `Array.prototype.find` and calls `fn` on each chunk
in the stream to find a chunk with a truthy value for `fn`. Once an `fn` call's
awaited return value is truthy, the stream is destroyed and the promise is
fulfilled with value for which `fn` returned a truthy value. If all of the
`fn` calls on the chunks return a falsy value, the promise is fulfilled with
`undefined`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { stat } from 'node:fs/promises';
    
    // With a synchronous predicate.
    await Readable.from([1, 2, 3, 4]).find((x) => x > 2); // 3
    await Readable.from([1, 2, 3, 4]).find((x) => x > 0); // 1
    await Readable.from([1, 2, 3, 4]).find((x) => x > 10); // undefined
    
    // With an asynchronous predicate, making at most 2 file checks at a time.
    const foundBigFile = await Readable.from([
      'file1',
      'file2',
      'file3',
    ]).find(async (fileName) => {
      const stats = await stat(fileName);
      return stats.size > 1024 * 1024;
    }, { concurrency: 2 });
    console.log(foundBigFile); // File name of large file, if any file in the list is bigger than 1MB
    console.log('done'); // Stream has finished
    ```

##### `readable.every(fn[, options])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to call on each chunk of the stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) a promise evaluating to `true` if `fn` returned a truthy
  value for all of the chunks.

This method is similar to `Array.prototype.every` and calls `fn` on each chunk
in the stream to check if all awaited return values are truthy value for `fn`.
Once an `fn` call on a chunk awaited return value is falsy, the stream is
destroyed and the promise is fulfilled with `false`. If all of the `fn` calls
on the chunks return a truthy value, the promise is fulfilled with `true`.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { stat } from 'node:fs/promises';
    
    // With a synchronous predicate.
    await Readable.from([1, 2, 3, 4]).every((x) => x > 2); // false
    await Readable.from([1, 2, 3, 4]).every((x) => x > 0); // true
    
    // With an asynchronous predicate, making at most 2 file checks at a time.
    const allBigFiles = await Readable.from([
      'file1',
      'file2',
      'file3',
    ]).every(async (fileName) => {
      const stats = await stat(fileName);
      return stats.size > 1024 * 1024;
    }, { concurrency: 2 });
    // `true` if all files in the list are bigger than 1MiB
    console.log(allBigFiles);
    console.log('done'); // Stream has finished
    ```

##### `readable.flatMap(fn[, options])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncGeneratorFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/AsyncGeneratorFunction) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a function to map over
  every chunk in the stream.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the maximum concurrent invocation of `fn` to call
    on the stream at once. **Default:** `1`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Readable>`](stream.md#readable-streams) a stream flat-mapped with the function `fn`.

This method returns a new stream by applying the given callback to each
chunk of the stream and then flattening the result.

It is possible to return a stream or another iterable or async iterable from
`fn` and the result streams will be merged (flattened) into the returned
stream.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    import { createReadStream } from 'node:fs';
    
    // With a synchronous mapper.
    for await (const chunk of Readable.from([1, 2, 3, 4]).flatMap((x) => [x, x])) {
      console.log(chunk); // 1, 1, 2, 2, 3, 3, 4, 4
    }
    // With an asynchronous mapper, combine the contents of 4 files
    const concatResult = Readable.from([
      './1.mjs',
      './2.mjs',
      './3.mjs',
      './4.mjs',
    ]).flatMap((fileName) => createReadStream(fileName));
    for await (const result of concatResult) {
      // This will contain the contents (all chunks) of all 4 files
      console.log(result);
    }
    ```

##### `readable.drop(limit[, options])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the number of chunks to drop from the readable.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Readable>`](stream.md#readable-streams) a stream with `limit` chunks dropped.

This method returns a new stream with the first `limit` chunks dropped.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    
    await Readable.from([1, 2, 3, 4]).drop(2).toArray(); // [3, 4]
    ```

##### `readable.take(limit[, options])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `limit` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) the number of chunks to take from the readable.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Readable>`](stream.md#readable-streams) a stream with `limit` chunks taken.

This method returns a new stream with the first `limit` chunks.

=== "MJS"

    ```js
    import { Readable } from 'node:stream';
    
    await Readable.from([1, 2, 3, 4]).take(2).toArray(); // [1, 2]
    ```

##### `readable.reduce(fn[, initial[, options]])`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
-->

> Stability: 1 - Experimental

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) a reducer function to call over every chunk
  in the stream.
  * `previous` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) the value obtained from the last call to `fn` or the
    `initial` value if specified or the first chunk of the stream otherwise.
  * `data` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) a chunk of data from the stream.
  * `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `signal` [`<AbortSignal>`](globals.md#abortsignal) aborted if the stream is destroyed allowing to
      abort the `fn` call early.
* `initial` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) the initial value to use in the reduction.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows destroying the stream if the signal is
    aborted.
* Returns: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) a promise for the final value of the reduction.

This method calls `fn` on each chunk of the stream in order, passing it the
result from the calculation on the previous element. It returns a promise for
the final value of the reduction.

If no `initial` value is supplied the first chunk of the stream is used as the
initial value. If the stream is empty, the promise is rejected with a
`TypeError` with the `ERR_INVALID_ARGS` code property.

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

The reducer function iterates the stream element-by-element which means that
there is no `concurrency` parameter or parallelism. To perform a `reduce`
concurrently, you can extract the async function to [`readable.map`][`readable.map`] method.

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

### Duplex and transform streams

#### Class: `stream.Duplex`

<!-- YAML
added: v0.9.4
changes:
  - version: v6.8.0
    pr-url: https://github.com/nodejs/node/pull/8834
    description: Instances of `Duplex` now return `true` when
                 checking `instanceof stream.Writable`.
-->

Добавлено в: v0.9.4

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.8.0 | Экземпляры Duplex теперь возвращают true при проверке экземпляра потока.Writable. |

<!--type=class-->

Duplex streams are streams that implement both the [`Readable`][`Readable`] and
[`Writable`][`Writable`] interfaces.

Examples of `Duplex` streams include:

* [TCP sockets][TCP sockets]
* [zlib streams][zlib]
* [crypto streams][crypto]

##### `duplex.allowHalfOpen`

<!-- YAML
added: v0.9.4
-->

* Type: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

If `false` then the stream will automatically end the writable side when the
readable side ends. Set initially by the `allowHalfOpen` constructor option,
which defaults to `true`.

This can be changed manually to change the half-open behavior of an existing
`Duplex` stream instance, but must be changed before the `'end'` event is
emitted.

#### Class: `stream.Transform`

<!-- YAML
added: v0.9.4
-->

<!--type=class-->

Transform streams are [`Duplex`][`Duplex`] streams where the output is in some way
related to the input. Like all [`Duplex`][`Duplex`] streams, `Transform` streams
implement both the [`Readable`][`Readable`] and [`Writable`][`Writable`] interfaces.

Examples of `Transform` streams include:

* [zlib streams][zlib]
* [crypto streams][crypto]

##### `transform.destroy([error])`

<!-- YAML
added: v8.0.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/29197
    description: Work as a no-op on a stream that has already been destroyed.
-->

Добавлено в: v8.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.0.0 | Работайте без операции над потоком, который уже уничтожен. |

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
* Returns: [`<this>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/this)

Destroy the stream, and optionally emit an `'error'` event. After this call, the
transform stream would release any internal resources.
Implementors should not override this method, but instead implement
[`readable._destroy()`][readable-_destroy].
The default implementation of `_destroy()` for `Transform` also emit `'close'`
unless `emitClose` is set in false.

Once `destroy()` has been called, any further calls will be a no-op and no
further errors except from `_destroy()` may be emitted as `'error'`.

#### `stream.duplexPair([options])`

<!-- YAML
added:
  - v22.6.0
  - v20.17.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) A value to pass to both [`Duplex`][`Duplex`] constructors,
  to set options such as buffering.
* Returns: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) of two [`Duplex`][`Duplex`] instances.

The utility function `duplexPair` returns an Array with two items,
each being a `Duplex` stream connected to the other side:

```js
const [ sideA, sideB ] = duplexPair();
```

Whatever is written to one stream is made readable on the other. It provides
behavior analogous to a network connection, where the data written by the client
becomes readable by the server, and vice-versa.

The Duplex streams are symmetrical; one or the other may be used without any
difference in behavior.

### `stream.finished(stream[, options], callback)`

<!-- YAML
added: v10.0.0
changes:
  - version: v19.5.0
    pr-url: https://github.com/nodejs/node/pull/46205
    description: Added support for `ReadableStream` and `WritableStream`.
  - version: v15.11.0
    pr-url: https://github.com/nodejs/node/pull/37354
    description: The `signal` option was added.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/32158
    description: The `finished(stream, cb)` will wait for the `'close'` event
                 before invoking the callback. The implementation tries to
                 detect legacy streams and only apply this behavior to streams
                 which are expected to emit `'close'`.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31545
    description: Emitting `'close'` before `'end'` on a `Readable` stream
                 will cause an `ERR_STREAM_PREMATURE_CLOSE` error.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/31509
    description: Callback will be invoked on streams which have already
                 finished before the call to `finished(stream, cb)`.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.5.0 | Добавлена ​​поддержка ReadableStream и WritableStream. |
    | v15.11.0 | Добавлена ​​опция «сигнал». |
    | v14.0.0 | `finished(stream, cb)` будет ждать события ``close'` перед вызовом обратного вызова. Реализация пытается обнаружить устаревшие потоки и применить это поведение только к потокам, которые, как ожидается, будут выдавать сообщение «закрыть». |
    | v14.0.0 | Выдача `'close'` до `'end'` в потоке `'Readable` вызовет ошибку `'ERR_STREAM_PREMATURE_CLOSE`. |
    | v14.0.0 | Обратный вызов будет вызван для потоков, которые уже завершились до вызова `finished(stream, cb)`. |

* `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | [`<WritableStream>`](webstreams.md#class-writablestream) A readable and/or writable
  stream/webstream.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `error` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `false`, then a call to `emit('error', err)` is
    not treated as finished. **Default:** `true`.
  * `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When set to `false`, the callback will be called when
    the stream ends even though the stream might still be readable.
    **Default:** `true`.
  * `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) When set to `false`, the callback will be called when
    the stream ends even though the stream might still be writable.
    **Default:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) allows aborting the wait for the stream finish. The
    underlying stream will _not_ be aborted if the signal is aborted. The
    callback will get called with an `AbortError`. All registered
    listeners added by this function will also be removed.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function that takes an optional error
  argument.
* Returns: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A cleanup function which removes all registered
  listeners.

A function to get notified when a stream is no longer readable, writable
or has experienced an error or a premature close event.

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

Especially useful in error handling scenarios where a stream is destroyed
prematurely (like an aborted HTTP request), and will not emit `'end'`
or `'finish'`.

The `finished` API provides [promise version][stream-finished-promise].

`stream.finished()` leaves dangling event listeners (in particular
`'error'`, `'end'`, `'finish'` and `'close'`) after `callback` has been
invoked. The reason for this is so that unexpected `'error'` events (due to
incorrect stream implementations) do not cause unexpected crashes.
If this is unwanted behavior then the returned cleanup function needs to be
invoked in the callback:

```js
const cleanup = finished(rs, (err) => {
  cleanup();
  // ...
});
```

### `stream.pipeline(source[, ...transforms], destination, callback)`

### `stream.pipeline(streams, callback)`

<!-- YAML
added: v10.0.0
changes:
  - version:
    - v19.7.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46307
    description: Added support for webstreams.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/32158
    description: The `pipeline(..., cb)` will wait for the `'close'` event
                 before invoking the callback. The implementation tries to
                 detect legacy streams and only apply this behavior to streams
                 which are expected to emit `'close'`.
  - version: v13.10.0
    pr-url: https://github.com/nodejs/node/pull/31223
    description: Add support for async generators.
-->

Добавлено в: v10.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.7.0, v18.16.0 | Добавлена ​​поддержка веб-потоков. |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |
    | v14.0.0 | Pipeline(..., cb) будет ждать события close перед вызовом обратного вызова. Реализация пытается обнаружить устаревшие потоки и применить это поведение только к потокам, которые, как ожидается, будут выдавать сообщение «закрыть». |
    | v13.10.0 | Добавьте поддержку асинхронных генераторов. |

* `streams` {Stream\[]|Iterable\[]|AsyncIterable\[]|Function\[]|
  ReadableStream\[]|WritableStream\[]|TransformStream\[]}
* `source` [`<Stream>`](stream.md#stream) | [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<ReadableStream>`](webstreams.md#readablestream)
  * Returns: [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) | [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
* `...transforms` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<TransformStream>`](webstreams.md#class-transformstream)
  * `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
  * Returns: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
* `destination` [`<Stream>`](stream.md#stream) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<WritableStream>`](webstreams.md#class-writablestream)
  * `source` [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface)
  * Returns: [`<AsyncIterable>`](https://tc39.github.io/ecma262/#sec-asynciterable-interface) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Called when the pipeline is fully done.
  * `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
  * `val` Resolved value of `Promise` returned by `destination`.
* Returns: [`<Stream>`](stream.md#stream)

A module method to pipe between streams and generators forwarding errors and
properly cleaning up and provide a callback when the pipeline is complete.

```js
const { pipeline } = require('node:stream');
const fs = require('node:fs');
const zlib = require('node:zlib');

// Use the pipeline API to easily pipe a series of streams
// together and get notified when the pipeline is fully done.

// A pipeline to gzip a potentially huge tar file efficiently:

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
  },
);
```

The `pipeline` API provides a [promise version][stream-pipeline-promise].

`stream.pipeline()` will call `stream.destroy(err)` on all streams except:

* `Readable` streams which have emitted `'end'` or `'close'`.
* `Writable` streams which have emitted `'finish'` or `'close'`.

`stream.pipeline()` leaves dangling event listeners on the streams
after the `callback` has been invoked. In the case of reuse of streams after
failure, this can cause event listener leaks and swallowed errors. If the last
stream is readable, dangling event listeners will be removed so that the last
stream can be consumed later.

`stream.pipeline()` closes all the streams when an error is raised.
The `IncomingRequest` usage with `pipeline` could lead to an unexpected behavior
once it would destroy the socket without sending the expected response.
See the example below:

```js
const fs = require('node:fs');
const http = require('node:http');
const { pipeline } = require('node:stream');

const server = http.createServer((req, res) => {
  const fileStream = fs.createReadStream('./fileNotExist.txt');
  pipeline(fileStream, res, (err) => {
    if (err) {
      console.log(err); // No such file
      // this message can't be sent once `pipeline` already destroyed the socket
      return res.end('error!!!');
    }
  });
});
```

### `stream.compose(...streams)`

<!-- YAML
added: v16.9.0
changes:
  - version:
    - v21.1.0
    - v20.10.0
    pr-url: https://github.com/nodejs/node/pull/50187
    description: Added support for stream class.
  - version:
    - v19.8.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46675
    description: Added support for webstreams.
-->

Добавлено в: v16.9.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.1.0, v20.10.0 | Добавлена ​​поддержка класса потока. |
    | v19.8.0, v18.16.0 | Добавлена ​​поддержка веб-потоков. |

> Stability: 1 - `stream.compose` is experimental.

* `streams` {Stream\[]|Iterable\[]|AsyncIterable\[]|Function\[]|
  ReadableStream\[]|WritableStream\[]|TransformStream\[]|Duplex\[]|Function}
* Returns: [`<stream.Duplex>`](stream.md#class-streamduplex)

Combines two or more streams into a `Duplex` stream that writes to the
first stream and reads from the last. Each provided stream is piped into
the next, using `stream.pipeline`. If any of the streams error then all
are destroyed, including the outer `Duplex` stream.

Because `stream.compose` returns a new stream that in turn can (and
should) be piped into other streams, it enables composition. In contrast,
when passing streams to `stream.pipeline`, typically the first stream is
a readable stream and the last a writable stream, forming a closed
circuit.

If passed a `Function` it must be a factory method taking a `source`
`Iterable`.

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
    
    console.log(res); // prints 'HELLOWORLD'
    ```

`stream.compose` can be used to convert async iterables, generators and
functions into streams.

* `AsyncIterable` converts into a readable `Duplex`. Cannot yield
  `null`.
* `AsyncGeneratorFunction` converts into a readable/writable transform `Duplex`.
  Must take a source `AsyncIterable` as first parameter. Cannot yield
  `null`.
* `AsyncFunction` converts into a writable `Duplex`. Must return
  either `null` or `undefined`.

=== "MJS"

    ```js
    import { compose } from 'node:stream';
    import { finished } from 'node:stream/promises';
    
    // Convert AsyncIterable into readable Duplex.
    const s1 = compose(async function*() {
      yield 'Hello';
      yield 'World';
    }());
    
    // Convert AsyncGenerator into transform Duplex.
    const s2 = compose(async function*(source) {
      for await (const chunk of source) {
        yield String(chunk).toUpperCase();
      }
    });
    
    let res = '';
    
    // Convert AsyncFunction into writable Duplex.
    const s3 = compose(async function(source) {
      for await (const chunk of source) {
        res += chunk;
      }
    });
    
    await finished(compose(s1, s2, s3));
    
    console.log(res); // prints 'HELLOWORLD'
    ```

For convenience, the [`readable.compose(stream)`][`readable.compose(stream)`] method is available on
[Readable](stream.md#readable-streams) and [Duplex](stream.md#class-streamduplex) streams as a wrapper for this function.

### `stream.isErrored(stream)`

<!-- YAML
added:
  - v17.3.0
  - v16.14.0
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

* `stream` [`<Readable>`](stream.md#readable-streams) | [`<Writable>`](stream.md#class-streamwritable) | [`<Duplex>`](stream.md#class-streamduplex) | [`<WritableStream>`](webstreams.md#class-writablestream) | [`<ReadableStream>`](webstreams.md#readablestream)
* Returns: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Returns whether the stream has encountered an error.

### `stream.isReadable(stream)`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
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

* `stream` [`<Readable>`](stream.md#readable-streams) | [`<Duplex>`](stream.md#class-streamduplex) | [`<ReadableStream>`](webstreams.md#readablestream)
* Returns: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | null - Only returns `null` if `stream` is not a valid `Readable`, `Duplex` or `ReadableStream`.

Returns whether the stream is readable.

### `stream.isWritable(stream)`

* `stream` [`<Writable>`](stream.md#class-streamwritable) | [`<Duplex>`](stream.md#class-streamduplex) | [`<WritableStream>`](webstreams.md#class-writablestream)
* Returns: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | null - Only returns `null` if `stream` is not a valid `Writable`, `Duplex` or `WritableStream`.

Returns whether the stream is writable.

### `stream.Readable.from(iterable[, options])`

<!-- YAML
added:
  - v12.3.0
  - v10.17.0
-->

* `iterable` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Object implementing the `Symbol.asyncIterator` or
  `Symbol.iterator` iterable protocol. Emits an 'error' event if a null
  value is passed.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Options provided to `new stream.Readable([options])`.
  By default, `Readable.from()` will set `options.objectMode` to `true`, unless
  this is explicitly opted out by setting `options.objectMode` to `false`.
* Returns: [`<stream.Readable>`](stream.md#streamreadable)

A utility method for creating readable streams out of iterators.

```js
const { Readable } = require('node:stream');

async function * generate() {
  yield 'hello';
  yield 'streams';
}

const readable = Readable.from(generate());

readable.on('data', (chunk) => {
  console.log(chunk);
});
```

Calling `Readable.from(string)` or `Readable.from(buffer)` will not have
the strings or buffers be iterated to match the other streams semantics
for performance reasons.

If an `Iterable` object containing promises is passed as an argument,
it might result in unhandled rejection.

```js
const { Readable } = require('node:stream');

Readable.from([
  new Promise((resolve) => setTimeout(resolve('1'), 1500)),
  new Promise((_, reject) => setTimeout(reject(new Error('2')), 1000)), // Unhandled rejection
]);
```

### `stream.Readable.fromWeb(readableStream[, options])`

<!-- YAML
added: v17.0.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `readableStream` [`<ReadableStream>`](webstreams.md#readablestream)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Returns: [`<stream.Readable>`](stream.md#streamreadable)

### `stream.Readable.isDisturbed(stream)`

<!-- YAML
added: v16.8.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v16.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `stream` [`<stream.Readable>`](stream.md#streamreadable) | [`<ReadableStream>`](webstreams.md#readablestream)
* Returns: `boolean`

Returns whether the stream has been read from or cancelled.

### `stream.Readable.toWeb(streamReadable[, options])`

<!-- YAML
added: v17.0.0
changes:
  - version:
     - v25.4.0
     - v24.14.0
    pr-url: https://github.com/nodejs/node/pull/58664
    description: Add 'type' option to specify 'bytes'.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
  - version:
    - v18.7.0
    pr-url: https://github.com/nodejs/node/pull/43515
    description: include strategy options on Readable.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.14.0 | Добавьте опцию «тип», чтобы указать «байты». |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |
    | v18.7.0 | включить варианты стратегии в Readable. |

* `streamReadable` [`<stream.Readable>`](stream.md#streamreadable)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `strategy` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum internal queue size (of the created
      `ReadableStream`) before backpressure is applied in reading from the given
      `stream.Readable`. If no value is provided, it will be taken from the
      given `stream.Readable`.
    * `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A function that size of the given chunk of data.
      If no value is provided, the size will be `1` for all the chunks.
      * `chunk` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
      * Returns: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Specifies the type of the created `ReadableStream`. Must be
    `'bytes'` or undefined.
* Returns: [`<ReadableStream>`](webstreams.md#readablestream)

### `stream.Writable.fromWeb(writableStream[, options])`

<!-- YAML
added: v17.0.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `writableStream` [`<WritableStream>`](webstreams.md#class-writablestream)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Returns: [`<stream.Writable>`](stream.md#streamwritable)

### `stream.Writable.toWeb(streamWritable)`

<!-- YAML
added: v17.0.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `streamWritable` [`<stream.Writable>`](stream.md#streamwritable)
* Returns: [`<WritableStream>`](webstreams.md#class-writablestream)

### `stream.Duplex.from(src)`

<!-- YAML
added: v16.8.0
changes:
  - version:
    - v19.5.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/46190
    description: The `src` argument can now be a `ReadableStream` or
                 `WritableStream`.
-->

Добавлено в: v16.8.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.5.0, v18.17.0 | Аргумент src теперь может быть ReadableStream или WritableStream. |

* `src` {Stream|Blob|ArrayBuffer|string|Iterable|AsyncIterable|
  AsyncGeneratorFunction|AsyncFunction|Promise|Object|
  ReadableStream|WritableStream}

A utility method for creating duplex streams.

* `Stream` converts writable stream into writable `Duplex` and readable stream
  to `Duplex`.
* `Blob` converts into readable `Duplex`.
* `string` converts into readable `Duplex`.
* `ArrayBuffer` converts into readable `Duplex`.
* `AsyncIterable` converts into a readable `Duplex`. Cannot yield
  `null`.
* `AsyncGeneratorFunction` converts into a readable/writable transform
  `Duplex`. Must take a source `AsyncIterable` as first parameter. Cannot yield
  `null`.
* `AsyncFunction` converts into a writable `Duplex`. Must return
  either `null` or `undefined`
* `Object ({ writable, readable })` converts `readable` and
  `writable` into `Stream` and then combines them into `Duplex` where the
  `Duplex` will write to the `writable` and read from the `readable`.
* `Promise` converts into readable `Duplex`. Value `null` is ignored.
* `ReadableStream` converts into readable `Duplex`.
* `WritableStream` converts into writable `Duplex`.
* Returns: [`<stream.Duplex>`](stream.md#class-streamduplex)

If an `Iterable` object containing promises is passed as an argument,
it might result in unhandled rejection.

```js
const { Duplex } = require('node:stream');

Duplex.from([
  new Promise((resolve) => setTimeout(resolve('1'), 1500)),
  new Promise((_, reject) => setTimeout(reject(new Error('2')), 1000)), // Unhandled rejection
]);
```

### `stream.Duplex.fromWeb(pair[, options])`

<!-- YAML
added: v17.0.0
changes:
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `pair` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `readable` [`<ReadableStream>`](webstreams.md#readablestream)
  * `writable` [`<WritableStream>`](webstreams.md#class-writablestream)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal)
* Returns: [`<stream.Duplex>`](stream.md#class-streamduplex)

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

<!-- YAML
added: v17.0.0
changes:
  - version: v25.7.0
    pr-url: https://github.com/nodejs/node/pull/61632
    description: Added the 'readableType' option to specify the ReadableStream
                 type. The 'type' option is deprecated.
  - version:
     - v25.4.0
     - v24.14.0
    pr-url: https://github.com/nodejs/node/pull/58664
    description: Added the 'type' option to specify the ReadableStream type.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57513
    description: Marking the API stable.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.7.0 | Добавлен параметр readableType для указания типа ReadableStream. Опция «тип» устарела. |
    | v25.4.0, v24.14.0 | Добавлен параметр type для указания типа ReadableStream. |
    | v24.0.0, v22.17.0 | Маркировка стабильного API. |

* `streamDuplex` [`<stream.Duplex>`](stream.md#class-streamduplex)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `readableType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Specifies the type of the `ReadableStream` half of
    the created readable-writable pair. Must be `'bytes'` or undefined.
    (`options.type` is a deprecated alias for this option.)
* Returns: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `readable` [`<ReadableStream>`](webstreams.md#readablestream)
  * `writable` [`<WritableStream>`](webstreams.md#class-writablestream)

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

<!-- YAML
added: v15.4.0
changes:
  - version:
    - v19.7.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46273
    description: Added support for `ReadableStream` and
                 `WritableStream`.
-->

Добавлено в: v15.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.7.0, v18.16.0 | Добавлена ​​поддержка ReadableStream и WritableStream. |

* `signal` [`<AbortSignal>`](globals.md#abortsignal) A signal representing possible cancellation
* `stream` [`<Stream>`](stream.md#stream) | [`<ReadableStream>`](webstreams.md#readablestream) | [`<WritableStream>`](webstreams.md#class-writablestream) A stream to attach a signal
  to.

Attaches an AbortSignal to a readable or writeable stream. This lets code
control stream destruction using an `AbortController`.

Calling `abort` on the `AbortController` corresponding to the passed
`AbortSignal` will behave the same way as calling `.destroy(new AbortError())`
on the stream, and `controller.error(new AbortError())` for webstreams.

```js
const fs = require('node:fs');

const controller = new AbortController();
const read = addAbortSignal(
  controller.signal,
  fs.createReadStream(('object.json')),
);
// Later, abort the operation closing the stream
controller.abort();
```

Or using an `AbortSignal` with a readable stream as an async iterable:

```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 10_000); // set a timeout
const stream = addAbortSignal(
  controller.signal,
  fs.createReadStream(('object.json')),
);
(async () => {
  try {
    for await (const chunk of stream) {
      await process(chunk);
    }
  } catch (e) {
    if (e.name === 'AbortError') {
      // The operation was cancelled
    } else {
      throw e;
    }
  }
})();
```

Or using an `AbortSignal` with a ReadableStream:

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
      // The operation was cancelled
    }
  }
});

const reader = rs.getReader();

reader.read().then(({ value, done }) => {
  console.log(value); // hello
  console.log(done); // false
  controller.abort();
});
```

### `stream.getDefaultHighWaterMark(objectMode)`

<!-- YAML
added:
  - v19.9.0
  - v18.17.0
-->

* `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* Returns: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Returns the default highWaterMark used by streams.
Defaults to `65536` (64 KiB), or `16` for `objectMode`.

### `stream.setDefaultHighWaterMark(objectMode, value)`

<!-- YAML
added:
  - v19.9.0
  - v18.17.0
-->

* `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `value` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) highWaterMark value

Sets the default highWaterMark used by streams.

## API for stream implementers

<!--type=misc-->

The `node:stream` module API has been designed to make it possible to easily
implement streams using JavaScript's prototypal inheritance model.

First, a stream developer would declare a new JavaScript class that extends one
of the four basic stream classes (`stream.Writable`, `stream.Readable`,
`stream.Duplex`, or `stream.Transform`), making sure they call the appropriate
parent class constructor:

<!-- eslint-disable no-useless-constructor -->

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
  constructor({ highWaterMark, ...options }) {
    super({ highWaterMark });
    // ...
  }
}
```

When extending streams, keep in mind what options the user
can and should provide before forwarding these to the base constructor. For
example, if the implementation makes assumptions in regard to the
`autoDestroy` and `emitClose` options, do not allow the
user to override these. Be explicit about what
options are forwarded instead of implicitly forwarding all options.

The new stream class must then implement one or more specific methods, depending
on the type of stream being created, as detailed in the chart below:

| Use-case                                      | Class           | Method(s) to implement                                                                                             |
| --------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Reading only                                  | [`Readable`][`Readable`]  | [`_read()`][stream-_read]                                                                                          |
| Writing only                                  | [`Writable`][`Writable`]  | [`_write()`][stream-_write], [`_writev()`][stream-_writev], [`_final()`][stream-_final]                            |
| Reading and writing                           | [`Duplex`][`Duplex`]    | [`_read()`][stream-_read], [`_write()`][stream-_write], [`_writev()`][stream-_writev], [`_final()`][stream-_final] |
| Operate on written data, then read the result | [`Transform`][`Transform`] | [`_transform()`][stream-_transform], [`_flush()`][stream-_flush], [`_final()`][stream-_final]                      |

The implementation code for a stream should _never_ call the "public" methods
of a stream that are intended for use by consumers (as described in the
[API for stream consumers][API for stream consumers] section). Doing so may lead to adverse side effects
in application code consuming the stream.

Avoid overriding public methods such as `write()`, `end()`, `cork()`,
`uncork()`, `read()` and `destroy()`, or emitting internal events such
as `'error'`, `'data'`, `'end'`, `'finish'` and `'close'` through `.emit()`.
Doing so can break current and future stream invariants leading to behavior
and/or compatibility issues with other streams, stream utilities, and user
expectations.

### Simplified construction

<!-- YAML
added: v1.2.0
-->

For many simple cases, it is possible to create a stream without relying on
inheritance. This can be accomplished by directly creating instances of the
`stream.Writable`, `stream.Readable`, `stream.Duplex`, or `stream.Transform`
objects and passing appropriate methods as constructor options.

```js
const { Writable } = require('node:stream');

const myWritable = new Writable({
  construct(callback) {
    // Initialize state and load resources...
  },
  write(chunk, encoding, callback) {
    // ...
  },
  destroy() {
    // Free resources...
  },
});
```

### Implementing a writable stream

The `stream.Writable` class is extended to implement a [`Writable`][`Writable`] stream.

Custom `Writable` streams _must_ call the `new stream.Writable([options])`
constructor and implement the `writable._write()` and/or `writable._writev()`
method.

#### `new stream.Writable([options])`

<!-- YAML
changes:
  - version: v22.0.0
    pr-url: https://github.com/nodejs/node/pull/52037
    description: bump default highWaterMark.
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/36431
    description: support passing in an AbortSignal.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30623
    description: Change `autoDestroy` option default to `true`.
  - version:
     - v11.2.0
     - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/22795
    description: Add `autoDestroy` option to automatically `destroy()` the
                 stream when it emits `'finish'` or errors.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18438
    description: Add `emitClose` option to specify if `'close'` is emitted on
                 destroy.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0 | поднять по умолчанию highWaterMark. |
    | v15.5.0 | поддержка передачи AbortSignal. |
    | v14.0.0 | Измените параметр autoDestroy по умолчанию на true. |
    | v11.2.0, v10.16.0 | Добавьте опцию autoDestroy для автоматического уничтожения потока, когда он выдает сообщение Finish или ошибки. |
    | v10.0.0 | Добавьте опцию emitClose, чтобы указать, будет ли вызываться close при уничтожении. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Buffer level when
    [`stream.write()`][stream-write] starts returning `false`. **Default:**
    `65536` (64 KiB), or `16` for `objectMode` streams.
  * `decodeStrings` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether to encode `string`s passed to
    [`stream.write()`][stream-write] to `Buffer`s (with the encoding
    specified in the [`stream.write()`][stream-write] call) before passing
    them to [`stream._write()`][stream-_write]. Other types of data are not
    converted (i.e. `Buffer`s are not decoded into `string`s). Setting to
    false will prevent `string`s from being converted. **Default:** `true`.
  * `defaultEncoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The default encoding that is used when no
    encoding is specified as an argument to [`stream.write()`][stream-write].
    **Default:** `'utf8'`.
  * `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether or not the
    [`stream.write(anyObj)`][stream-write] is a valid operation. When set,
    it becomes possible to write JavaScript values other than string, [Buffer](buffer.md#buffer),
    [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) or [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) if supported by the stream implementation.
    **Default:** `false`.
  * `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether or not the stream should emit `'close'`
    after it has been destroyed. **Default:** `true`.
  * `write` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._write()`][stream-_write] method.
  * `writev` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._writev()`][stream-_writev] method.
  * `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._destroy()`][writable-_destroy] method.
  * `final` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._final()`][stream-_final] method.
  * `construct` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._construct()`][writable-_construct] method.
  * `autoDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this stream should automatically call
    `.destroy()` on itself after ending. **Default:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) A signal representing possible cancellation.

<!-- eslint-disable no-useless-constructor -->

```js
const { Writable } = require('node:stream');

class MyWritable extends Writable {
  constructor(options) {
    // Calls the stream.Writable() constructor.
    super(options);
    // ...
  }
}
```

Or, when using pre-ES6 style constructors:

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

Or, using the simplified constructor approach:

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

Calling `abort` on the `AbortController` corresponding to the passed
`AbortSignal` will behave the same way as calling `.destroy(new AbortError())`
on the writeable stream.

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
// Later, abort the operation closing the stream
controller.abort();
```

#### `writable._construct(callback)`

<!-- YAML
added: v15.0.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Call this function (optionally with an error
  argument) when the stream has finished initializing.

The `_construct()` method MUST NOT be called directly. It may be implemented
by child classes, and if so, will be called by the internal `Writable`
class methods only.

This optional function will be called in a tick after the stream constructor
has returned, delaying any `_write()`, `_final()` and `_destroy()` calls until
`callback` is called. This is useful to initialize state or asynchronously
initialize resources before the stream can be used.

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

<!-- YAML
changes:
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29639
    description: _write() is optional when providing _writev().
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v12.11.0 | _write() не является обязательным при использовании _writev(). |

* `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | any The `Buffer` to be written, converted from the
  `string` passed to [`stream.write()`][stream-write]. If the stream's
  `decodeStrings` option is `false` or the stream is operating in object mode,
  the chunk will not be converted & will be whatever was passed to
  [`stream.write()`][stream-write].
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If the chunk is a string, then `encoding` is the
  character encoding of that string. If chunk is a `Buffer`, or if the
  stream is operating in object mode, `encoding` may be ignored.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Call this function (optionally with an error
  argument) when processing is complete for the supplied chunk.

All `Writable` stream implementations must provide a
[`writable._write()`][stream-_write] and/or
[`writable._writev()`][stream-_writev] method to send data to the underlying
resource.

[`Transform`][`Transform`] streams provide their own implementation of the
[`writable._write()`][stream-_write].

This function MUST NOT be called by application code directly. It should be
implemented by child classes, and called by the internal `Writable` class
methods only.

The `callback` function must be called synchronously inside of
`writable._write()` or asynchronously (i.e. different tick) to signal either
that the write completed successfully or failed with an error.
The first argument passed to the `callback` must be the `Error` object if the
call failed or `null` if the write succeeded.

All calls to `writable.write()` that occur between the time `writable._write()`
is called and the `callback` is called will cause the written data to be
buffered. When the `callback` is invoked, the stream might emit a [`'drain'`][`'drain'`]
event. If a stream implementation is capable of processing multiple chunks of
data at once, the `writable._writev()` method should be implemented.

If the `decodeStrings` property is explicitly set to `false` in the constructor
options, then `chunk` will remain the same object that is passed to `.write()`,
and may be a string rather than a `Buffer`. This is to support implementations
that have an optimized handling for certain string data encodings. In that case,
the `encoding` argument will indicate the character encoding of the string.
Otherwise, the `encoding` argument can be safely ignored.

The `writable._write()` method is prefixed with an underscore because it is
internal to the class that defines it, and should never be called directly by
user programs.

#### `writable._writev(chunks, callback)`

* `chunks` [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The data to be written. The value is an array of [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  that each represent a discrete chunk of data to write. The properties of
  these objects are:
  * `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) A buffer instance or string containing the data to
    be written. The `chunk` will be a string if the `Writable` was created with
    the `decodeStrings` option set to `false` and a string was passed to `write()`.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The character encoding of the `chunk`. If `chunk` is
    a `Buffer`, the `encoding` will be `'buffer'`.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function (optionally with an error
  argument) to be invoked when processing is complete for the supplied chunks.

This function MUST NOT be called by application code directly. It should be
implemented by child classes, and called by the internal `Writable` class
methods only.

The `writable._writev()` method may be implemented in addition or alternatively
to `writable._write()` in stream implementations that are capable of processing
multiple chunks of data at once. If implemented and if there is buffered data
from previous writes, `_writev()` will be called instead of `_write()`.

The `writable._writev()` method is prefixed with an underscore because it is
internal to the class that defines it, and should never be called directly by
user programs.

#### `writable._destroy(err, callback)`

<!-- YAML
added: v8.0.0
-->

* `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) A possible error.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function that takes an optional error
  argument.

The `_destroy()` method is called by [`writable.destroy()`][writable-destroy].
It can be overridden by child classes but it **must not** be called directly.

#### `writable._final(callback)`

<!-- YAML
added: v8.0.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Call this function (optionally with an error
  argument) when finished writing any remaining data.

The `_final()` method **must not** be called directly. It may be implemented
by child classes, and if so, will be called by the internal `Writable`
class methods only.

This optional function will be called before the stream closes, delaying the
`'finish'` event until `callback` is called. This is useful to close resources
or write buffered data before a stream ends.

#### Errors while writing

Errors occurring during the processing of the [`writable._write()`][`writable._write()`],
[`writable._writev()`][`writable._writev()`] and [`writable._final()`][`writable._final()`] methods must be propagated
by invoking the callback and passing the error as the first argument.
Throwing an `Error` from within these methods or manually emitting an `'error'`
event results in undefined behavior.

If a `Readable` stream pipes into a `Writable` stream when `Writable` emits an
error, the `Readable` stream will be unpiped.

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

#### An example writable stream

The following illustrates a rather simplistic (and somewhat pointless) custom
`Writable` stream implementation. While this specific `Writable` stream instance
is not of any real particular usefulness, the example illustrates each of the
required elements of a custom [`Writable`][`Writable`] stream instance:

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

#### Decoding buffers in a writable stream

Decoding buffers is a common task, for instance, when using transformers whose
input is a string. This is not a trivial process when using multi-byte
characters encoding, such as UTF-8. The following example shows how to decode
multi-byte strings using `StringDecoder` and [`Writable`][`Writable`].

```js
const { Writable } = require('node:stream');
const { StringDecoder } = require('node:string_decoder');

class StringWritable extends Writable {
  constructor(options) {
    super(options);
    this._decoder = new StringDecoder(options?.defaultEncoding);
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

const euro = [[0xE2, 0x82], [0xAC]].map(Buffer.from);
const w = new StringWritable();

w.write('currency: ');
w.write(euro[0]);
w.end(euro[1]);

console.log(w.data); // currency: €
```

### Implementing a readable stream

The `stream.Readable` class is extended to implement a [`Readable`][`Readable`] stream.

Custom `Readable` streams _must_ call the `new stream.Readable([options])`
constructor and implement the [`readable._read()`][`readable._read()`] method.

#### `new stream.Readable([options])`

<!-- YAML
changes:
  - version: v22.0.0
    pr-url: https://github.com/nodejs/node/pull/52037
    description: bump default highWaterMark.
  - version: v15.5.0
    pr-url: https://github.com/nodejs/node/pull/36431
    description: support passing in an AbortSignal.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30623
    description: Change `autoDestroy` option default to `true`.
  - version:
     - v11.2.0
     - v10.16.0
    pr-url: https://github.com/nodejs/node/pull/22795
    description: Add `autoDestroy` option to automatically `destroy()` the
                 stream when it emits `'end'` or errors.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0 | поднять по умолчанию highWaterMark. |
    | v15.5.0 | поддержка передачи AbortSignal. |
    | v14.0.0 | Измените параметр autoDestroy по умолчанию на true. |
    | v11.2.0, v10.16.0 | Добавьте опцию autoDestroy для автоматического уничтожения потока, когда он выдает сообщение end или ошибки. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum [number of bytes][hwm-gotcha] to store
    in the internal buffer before ceasing to read from the underlying resource.
    **Default:** `65536` (64 KiB), or `16` for `objectMode` streams.
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If specified, then buffers will be decoded to
    strings using the specified encoding. **Default:** `null`.
  * `objectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this stream should behave
    as a stream of objects. Meaning that [`stream.read(n)`][stream-read] returns
    a single value instead of a `Buffer` of size `n`. **Default:** `false`.
  * `emitClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether or not the stream should emit `'close'`
    after it has been destroyed. **Default:** `true`.
  * `read` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the [`stream._read()`][stream-_read]
    method.
  * `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._destroy()`][readable-_destroy] method.
  * `construct` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._construct()`][readable-_construct] method.
  * `autoDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether this stream should automatically call
    `.destroy()` on itself after ending. **Default:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) A signal representing possible cancellation.

<!-- eslint-disable no-useless-constructor -->

```js
const { Readable } = require('node:stream');

class MyReadable extends Readable {
  constructor(options) {
    // Calls the stream.Readable(options) constructor.
    super(options);
    // ...
  }
}
```

Or, when using pre-ES6 style constructors:

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

Or, using the simplified constructor approach:

```js
const { Readable } = require('node:stream');

const myReadable = new Readable({
  read(size) {
    // ...
  },
});
```

Calling `abort` on the `AbortController` corresponding to the passed
`AbortSignal` will behave the same way as calling `.destroy(new AbortError())`
on the readable created.

```js
const { Readable } = require('node:stream');
const controller = new AbortController();
const read = new Readable({
  read(size) {
    // ...
  },
  signal: controller.signal,
});
// Later, abort the operation closing the stream
controller.abort();
```

#### `readable._construct(callback)`

<!-- YAML
added: v15.0.0
-->

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Call this function (optionally with an error
  argument) when the stream has finished initializing.

The `_construct()` method MUST NOT be called directly. It may be implemented
by child classes, and if so, will be called by the internal `Readable`
class methods only.

This optional function will be scheduled in the next tick by the stream
constructor, delaying any `_read()` and `_destroy()` calls until `callback` is
called. This is useful to initialize state or asynchronously initialize
resources before the stream can be used.

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
    fs.read(this.fd, buf, 0, n, null, (err, bytesRead) => {
      if (err) {
        this.destroy(err);
      } else {
        this.push(bytesRead > 0 ? buf.slice(0, bytesRead) : null);
      }
    });
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

<!-- YAML
added: v0.9.4
-->

* `size` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Number of bytes to read asynchronously

This function MUST NOT be called by application code directly. It should be
implemented by child classes, and called by the internal `Readable` class
methods only.

All `Readable` stream implementations must provide an implementation of the
[`readable._read()`][`readable._read()`] method to fetch data from the underlying resource.

When [`readable._read()`][`readable._read()`] is called, if data is available from the resource,
the implementation should begin pushing that data into the read queue using the
[`this.push(dataChunk)`][stream-push] method. `_read()` will be called again
after each call to [`this.push(dataChunk)`][stream-push] once the stream is
ready to accept more data. `_read()` may continue reading from the resource and
pushing data until `readable.push()` returns `false`. Only when `_read()` is
called again after it has stopped should it resume pushing additional data into
the queue.

Once the [`readable._read()`][`readable._read()`] method has been called, it will not be called
again until more data is pushed through the [`readable.push()`][stream-push]
method. Empty data such as empty buffers and strings will not cause
[`readable._read()`][`readable._read()`] to be called.

The `size` argument is advisory. For implementations where a "read" is a
single operation that returns data can use the `size` argument to determine how
much data to fetch. Other implementations may ignore this argument and simply
provide data whenever it becomes available. There is no need to "wait" until
`size` bytes are available before calling [`stream.push(chunk)`][stream-push].

The [`readable._read()`][`readable._read()`] method is prefixed with an underscore because it is
internal to the class that defines it, and should never be called directly by
user programs.

#### `readable._destroy(err, callback)`

<!-- YAML
added: v8.0.0
-->

* `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) A possible error.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function that takes an optional error
  argument.

The `_destroy()` method is called by [`readable.destroy()`][readable-destroy].
It can be overridden by child classes but it **must not** be called directly.

#### `readable.push(chunk[, encoding])`

<!-- YAML
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/51866
    description: The `chunk` argument can now be a `TypedArray` or `DataView` instance.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/11608
    description: The `chunk` argument can now be a `Uint8Array` instance.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Аргументом chunk теперь может быть экземпляр TypedArray или DataView. |
    | v8.0.0 | Аргумент `chunk` теперь может быть экземпляром `Uint8Array`. |

* `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | any Chunk of data to push
  into the read queue. For streams not operating in object mode, `chunk` must
  be a [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) or [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView). For object mode streams,
  `chunk` may be any JavaScript value.
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Encoding of string chunks. Must be a valid
  `Buffer` encoding, such as `'utf8'` or `'ascii'`.
* Returns: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` if additional chunks of data may continue to be
  pushed; `false` otherwise.

When `chunk` is a [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) or [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), the `chunk`
of data will be added to the internal queue for users of the stream to consume.
Passing `chunk` as `null` signals the end of the stream (EOF), after which no
more data can be written.

When the `Readable` is operating in paused mode, the data added with
`readable.push()` can be read out by calling the
[`readable.read()`][stream-read] method when the [`'readable'`][`'readable'`] event is
emitted.

When the `Readable` is operating in flowing mode, the data added with
`readable.push()` will be delivered by emitting a `'data'` event.

The `readable.push()` method is designed to be as flexible as possible. For
example, when wrapping a lower-level source that provides some form of
pause/resume mechanism, and a data callback, the low-level source can be wrapped
by the custom `Readable` instance:

```js
// `_source` is an object with readStop() and readStart() methods,
// and an `ondata` member that gets called when it has data, and
// an `onend` member that gets called when the data is over.

class SourceWrapper extends Readable {
  constructor(options) {
    super(options);

    this._source = getLowLevelSourceObject();

    // Every time there's data, push it into the internal buffer.
    this._source.ondata = (chunk) => {
      // If push() returns false, then stop reading from source.
      if (!this.push(chunk))
        this._source.readStop();
    };

    // When the source ends, push the EOF-signaling `null` chunk.
    this._source.onend = () => {
      this.push(null);
    };
  }
  // _read() will be called when the stream wants to pull more data in.
  // The advisory size argument is ignored in this case.
  _read(size) {
    this._source.readStart();
  }
}
```

The `readable.push()` method is used to push the content
into the internal buffer. It can be driven by the [`readable._read()`][`readable._read()`] method.

For streams not operating in object mode, if the `chunk` parameter of
`readable.push()` is `undefined`, it will be treated as empty string or
buffer. See [`readable.push('')`][`readable.push('')`] for more information.

#### Errors while reading

Errors occurring during processing of the [`readable._read()`][`readable._read()`] must be
propagated through the [`readable.destroy(err)`][readable-_destroy] method.
Throwing an `Error` from within [`readable._read()`][`readable._read()`] or manually emitting an
`'error'` event results in undefined behavior.

```js
const { Readable } = require('node:stream');

const myReadable = new Readable({
  read(size) {
    const err = checkSomeErrorCondition();
    if (err) {
      this.destroy(err);
    } else {
      // Do some work.
    }
  },
});
```

#### An example counting stream

<!--type=example-->

The following is a basic example of a `Readable` stream that emits the numerals
from 1 to 1,000,000 in ascending order, and then ends.

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
    if (i > this._max)
      this.push(null);
    else {
      const str = String(i);
      const buf = Buffer.from(str, 'ascii');
      this.push(buf);
    }
  }
}
```

### Implementing a duplex stream

A [`Duplex`][`Duplex`] stream is one that implements both [`Readable`][`Readable`] and
[`Writable`][`Writable`], such as a TCP socket connection.

Because JavaScript does not have support for multiple inheritance, the
`stream.Duplex` class is extended to implement a [`Duplex`][`Duplex`] stream (as opposed
to extending the `stream.Readable` _and_ `stream.Writable` classes).

The `stream.Duplex` class prototypically inherits from `stream.Readable` and
parasitically from `stream.Writable`, but `instanceof` will work properly for
both base classes due to overriding [`Symbol.hasInstance`][`Symbol.hasInstance`] on
`stream.Writable`.

Custom `Duplex` streams _must_ call the `new stream.Duplex([options])`
constructor and implement _both_ the [`readable._read()`][`readable._read()`] and
`writable._write()` methods.

#### `new stream.Duplex(options)`

<!-- YAML
changes:
  - version: v8.4.0
    pr-url: https://github.com/nodejs/node/pull/14636
    description: The `readableHighWaterMark` and `writableHighWaterMark` options
                 are supported now.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.4.0 | Параметры `readableHighWaterMark` и `writableHighWaterMark` теперь поддерживаются. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Passed to both `Writable` and `Readable`
  constructors. Also has the following fields:
  * `allowHalfOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If set to `false`, then the stream will
    automatically end the writable side when the readable side ends.
    **Default:** `true`.
  * `readable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Sets whether the `Duplex` should be readable.
    **Default:** `true`.
  * `writable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Sets whether the `Duplex` should be writable.
    **Default:** `true`.
  * `readableObjectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Sets `objectMode` for readable side of the
    stream. Has no effect if `objectMode` is `true`. **Default:** `false`.
  * `writableObjectMode` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Sets `objectMode` for writable side of the
    stream. Has no effect if `objectMode` is `true`. **Default:** `false`.
  * `readableHighWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Sets `highWaterMark` for the readable side
    of the stream. Has no effect if `highWaterMark` is provided.
  * `writableHighWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Sets `highWaterMark` for the writable side
    of the stream. Has no effect if `highWaterMark` is provided.

<!-- eslint-disable no-useless-constructor -->

```js
const { Duplex } = require('node:stream');

class MyDuplex extends Duplex {
  constructor(options) {
    super(options);
    // ...
  }
}
```

Or, when using pre-ES6 style constructors:

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

Or, using the simplified constructor approach:

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

When using pipeline:

```js
const { Transform, pipeline } = require('node:stream');
const fs = require('node:fs');

pipeline(
  fs.createReadStream('object.json')
    .setEncoding('utf8'),
  new Transform({
    decodeStrings: false, // Accept string input rather than Buffers
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
        // Make sure is valid json.
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
  },
);
```

#### An example duplex stream

The following illustrates a simple example of a `Duplex` stream that wraps a
hypothetical lower-level source object to which data can be written, and
from which data can be read, albeit using an API that is not compatible with
Node.js streams.
The following illustrates a simple example of a `Duplex` stream that buffers
incoming written data via the [`Writable`][`Writable`] interface that is read back out
via the [`Readable`][`Readable`] interface.

```js
const { Duplex } = require('node:stream');
const kSource = Symbol('source');

class MyDuplex extends Duplex {
  constructor(source, options) {
    super(options);
    this[kSource] = source;
  }

  _write(chunk, encoding, callback) {
    // The underlying source only deals with strings.
    if (Buffer.isBuffer(chunk))
      chunk = chunk.toString();
    this[kSource].writeSomeData(chunk);
    callback();
  }

  _read(size) {
    this[kSource].fetchSomeData(size, (data, encoding) => {
      this.push(Buffer.from(data, encoding));
    });
  }
}
```

The most important aspect of a `Duplex` stream is that the `Readable` and
`Writable` sides operate independently of one another despite co-existing within
a single object instance.

#### Object mode duplex streams

For `Duplex` streams, `objectMode` can be set exclusively for either the
`Readable` or `Writable` side using the `readableObjectMode` and
`writableObjectMode` options respectively.

In the following example, for instance, a new `Transform` stream (which is a
type of [`Duplex`][`Duplex`] stream) is created that has an object mode `Writable` side
that accepts JavaScript numbers that are converted to hexadecimal strings on
the `Readable` side.

```js
const { Transform } = require('node:stream');

// All Transform streams are also Duplex Streams.
const myTransform = new Transform({
  writableObjectMode: true,

  transform(chunk, encoding, callback) {
    // Coerce the chunk to a number if necessary.
    chunk |= 0;

    // Transform the chunk into something else.
    const data = chunk.toString(16);

    // Push the data onto the readable queue.
    callback(null, '0'.repeat(data.length % 2) + data);
  },
});

myTransform.setEncoding('ascii');
myTransform.on('data', (chunk) => console.log(chunk));

myTransform.write(1);
// Prints: 01
myTransform.write(10);
// Prints: 0a
myTransform.write(100);
// Prints: 64
```

### Implementing a transform stream

A [`Transform`][`Transform`] stream is a [`Duplex`][`Duplex`] stream where the output is computed
in some way from the input. Examples include [zlib][zlib] streams or [crypto][crypto]
streams that compress, encrypt, or decrypt data.

There is no requirement that the output be the same size as the input, the same
number of chunks, or arrive at the same time. For example, a `Hash` stream will
only ever have a single chunk of output which is provided when the input is
ended. A `zlib` stream will produce output that is either much smaller or much
larger than its input.

The `stream.Transform` class is extended to implement a [`Transform`][`Transform`] stream.

The `stream.Transform` class prototypically inherits from `stream.Duplex` and
implements its own versions of the `writable._write()` and
[`readable._read()`][`readable._read()`] methods. Custom `Transform` implementations _must_
implement the [`transform._transform()`][stream-_transform] method and _may_
also implement the [`transform._flush()`][stream-_flush] method.

Care must be taken when using `Transform` streams in that data written to the
stream can cause the `Writable` side of the stream to become paused if the
output on the `Readable` side is not consumed.

#### `new stream.Transform([options])`

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Passed to both `Writable` and `Readable`
  constructors. Also has the following fields:
  * `transform` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the
    [`stream._transform()`][stream-_transform] method.
  * `flush` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Implementation for the [`stream._flush()`][stream-_flush]
    method.

<!-- eslint-disable no-useless-constructor -->

```js
const { Transform } = require('node:stream');

class MyTransform extends Transform {
  constructor(options) {
    super(options);
    // ...
  }
}
```

Or, when using pre-ES6 style constructors:

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

Or, using the simplified constructor approach:

```js
const { Transform } = require('node:stream');

const myTransform = new Transform({
  transform(chunk, encoding, callback) {
    // ...
  },
});
```

#### Event: `'end'`

The [`'end'`][`'end'`] event is from the `stream.Readable` class. The `'end'` event is
emitted after all data has been output, which occurs after the callback in
[`transform._flush()`][stream-_flush] has been called. In the case of an error,
`'end'` should not be emitted.

#### Event: `'finish'`

The [`'finish'`][`'finish'`] event is from the `stream.Writable` class. The `'finish'`
event is emitted after [`stream.end()`][stream-end] is called and all chunks
have been processed by [`stream._transform()`][stream-_transform]. In the case
of an error, `'finish'` should not be emitted.

#### `transform._flush(callback)`

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function (optionally with an error
  argument and data) to be called when remaining data has been flushed.

This function MUST NOT be called by application code directly. It should be
implemented by child classes, and called by the internal `Readable` class
methods only.

In some cases, a transform operation may need to emit an additional bit of
data at the end of the stream. For example, a `zlib` compression stream will
store an amount of internal state used to optimally compress the output. When
the stream ends, however, that additional data needs to be flushed so that the
compressed data will be complete.

Custom [`Transform`][`Transform`] implementations _may_ implement the `transform._flush()`
method. This will be called when there is no more written data to be consumed,
but before the [`'end'`][`'end'`] event is emitted signaling the end of the
[`Readable`][`Readable`] stream.

Within the `transform._flush()` implementation, the `transform.push()` method
may be called zero or more times, as appropriate. The `callback` function must
be called when the flush operation is complete.

The `transform._flush()` method is prefixed with an underscore because it is
internal to the class that defines it, and should never be called directly by
user programs.

#### `transform._transform(chunk, encoding, callback)`

* `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | any The `Buffer` to be transformed, converted from
  the `string` passed to [`stream.write()`][stream-write]. If the stream's
  `decodeStrings` option is `false` or the stream is operating in object mode,
  the chunk will not be converted & will be whatever was passed to
  [`stream.write()`][stream-write].
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If the chunk is a string, then this is the
  encoding type. If chunk is a buffer, then this is the special
  value `'buffer'`. Ignore it in that case.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A callback function (optionally with an error
  argument and data) to be called after the supplied `chunk` has been
  processed.

This function MUST NOT be called by application code directly. It should be
implemented by child classes, and called by the internal `Readable` class
methods only.

All `Transform` stream implementations must provide a `_transform()`
method to accept input and produce output. The `transform._transform()`
implementation handles the bytes being written, computes an output, then passes
that output off to the readable portion using the `transform.push()` method.

The `transform.push()` method may be called zero or more times to generate
output from a single input chunk, depending on how much is to be output
as a result of the chunk.

It is possible that no output is generated from any given chunk of input data.

The `callback` function must be called only when the current chunk is completely
consumed. The first argument passed to the `callback` must be an `Error` object
if an error occurred while processing the input or `null` otherwise. If a second
argument is passed to the `callback`, it will be forwarded on to the
`transform.push()` method, but only if the first argument is falsy. In other
words, the following are equivalent:

```js
transform.prototype._transform = function(data, encoding, callback) {
  this.push(data);
  callback();
};

transform.prototype._transform = function(data, encoding, callback) {
  callback(null, data);
};
```

The `transform._transform()` method is prefixed with an underscore because it
is internal to the class that defines it, and should never be called directly by
user programs.

`transform._transform()` is never called in parallel; streams implement a
queue mechanism, and to receive the next chunk, `callback` must be
called, either synchronously or asynchronously.

#### Class: `stream.PassThrough`

The `stream.PassThrough` class is a trivial implementation of a [`Transform`][`Transform`]
stream that simply passes the input bytes across to the output. Its purpose is
primarily for examples and testing, but there are some use cases where
`stream.PassThrough` is useful as a building block for novel sorts of streams.

## Additional notes

<!--type=misc-->

### Streams compatibility with async generators and async iterators

With the support of async generators and iterators in JavaScript, async
generators are effectively a first-class language-level stream construct at
this point.

Some common interop cases of using Node.js streams with async generators
and async iterators are provided below.

#### Consuming readable streams with async iterators

```js
(async function() {
  for await (const chunk of readable) {
    console.log(chunk);
  }
})();
```

Async iterators register a permanent error handler on the stream to prevent any
unhandled post-destroy errors.

#### Creating readable streams with async generators

A Node.js readable stream can be created from an asynchronous generator using
the `Readable.from()` utility method:

```js
const { Readable } = require('node:stream');

const ac = new AbortController();
const signal = ac.signal;

async function * generate() {
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

#### Piping to writable streams from async iterators

When writing to a writable stream from an async iterator, ensure correct
handling of backpressure and errors. [`stream.pipeline()`][`stream.pipeline()`] abstracts away
the handling of backpressure and backpressure-related errors:

```js
const fs = require('node:fs');
const { pipeline } = require('node:stream');
const { pipeline: pipelinePromise } = require('node:stream/promises');

const writable = fs.createWriteStream('./file');

const ac = new AbortController();
const signal = ac.signal;

const iterator = createIterator({ signal });

// Callback Pattern
pipeline(iterator, writable, (err, value) => {
  if (err) {
    console.error(err);
  } else {
    console.log(value, 'value returned');
  }
}).on('close', () => {
  ac.abort();
});

// Promise Pattern
pipelinePromise(iterator, writable)
  .then((value) => {
    console.log(value, 'value returned');
  })
  .catch((err) => {
    console.error(err);
    ac.abort();
  });
```

<!--type=misc-->

### Compatibility with older Node.js versions

<!--type=misc-->

Prior to Node.js 0.10, the `Readable` stream interface was simpler, but also
less powerful and less useful.

* Rather than waiting for calls to the [`stream.read()`][stream-read] method,
  [`'data'`][`'data'`] events would begin emitting immediately. Applications that
  would need to perform some amount of work to decide how to handle data
  were required to store read data into buffers so the data would not be lost.
* The [`stream.pause()`][stream-pause] method was advisory, rather than
  guaranteed. This meant that it was still necessary to be prepared to receive
  [`'data'`][`'data'`] events _even when the stream was in a paused state_.

In Node.js 0.10, the [`Readable`][`Readable`] class was added. For backward
compatibility with older Node.js programs, `Readable` streams switch into
"flowing mode" when a [`'data'`][`'data'`] event handler is added, or when the
[`stream.resume()`][stream-resume] method is called. The effect is that, even
when not using the new [`stream.read()`][stream-read] method and
[`'readable'`][`'readable'`] event, it is no longer necessary to worry about losing
[`'data'`][`'data'`] chunks.

While most applications will continue to function normally, this introduces an
edge case in the following conditions:

* No [`'data'`][`'data'`] event listener is added.
* The [`stream.resume()`][stream-resume] method is never called.
* The stream is not piped to any writable destination.

For example, consider the following code:

```js
// WARNING!  BROKEN!
net.createServer((socket) => {

  // We add an 'end' listener, but never consume the data.
  socket.on('end', () => {
    // It will never get here.
    socket.end('The message was received but was not processed.\n');
  });

}).listen(1337);
```

Prior to Node.js 0.10, the incoming message data would be simply discarded.
However, in Node.js 0.10 and beyond, the socket remains paused forever.

The workaround in this situation is to call the
[`stream.resume()`][stream-resume] method to begin the flow of data:

```js
// Workaround.
net.createServer((socket) => {
  socket.on('end', () => {
    socket.end('The message was received but was not processed.\n');
  });

  // Start the flow of data, discarding it.
  socket.resume();
}).listen(1337);
```

In addition to new `Readable` streams switching into flowing mode,
pre-0.10 style streams can be wrapped in a `Readable` class using the
[`readable.wrap()`][`stream.wrap()`] method.

### `readable.read(0)`

There are some cases where it is necessary to trigger a refresh of the
underlying readable stream mechanisms, without actually consuming any
data. In such cases, it is possible to call `readable.read(0)`, which will
always return `null`.

If the internal read buffer is below the `highWaterMark`, and the
stream is not currently reading, then calling `stream.read(0)` will trigger
a low-level [`stream._read()`][stream-_read] call.

While most applications will almost never need to do this, there are
situations within Node.js where this is done, particularly in the
`Readable` stream class internals.

### `readable.push('')`

Use of `readable.push('')` is not recommended.

Pushing a zero-byte [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type), [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) or [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView) to a stream
that is not in object mode has an interesting side effect.
Because it _is_ a call to
[`readable.push()`][stream-push], the call will end the reading process.
However, because the argument is an empty string, no data is added to the
readable buffer so there is nothing for a user to consume.

### `highWaterMark` discrepancy after calling `readable.setEncoding()`

The use of `readable.setEncoding()` will change the behavior of how the
`highWaterMark` operates in non-object mode.

Typically, the size of the current buffer is measured against the
`highWaterMark` in _bytes_. However, after `setEncoding()` is called, the
comparison function will begin to measure the buffer's size in _characters_.

This is not a problem in common cases with `latin1` or `ascii`. But it is
advised to be mindful about this behavior when working with strings that could
contain multi-byte characters.

[API for stream consumers]: #api-for-stream-consumers
[API for stream implementers]: #api-for-stream-implementers
[Compatibility]: #compatibility-with-older-nodejs-versions
[HTTP requests, on the client]: http.md#class-httpclientrequest
[HTTP responses, on the server]: http.md#class-httpserverresponse
[TCP sockets]: net.md#class-netsocket
[Three states]: #three-states
[`'data'`]: #event-data
[`'drain'`]: #event-drain
[`'end'`]: #event-end
[`'finish'`]: #event-finish
[`'readable'`]: #event-readable
[`Duplex`]: #class-streamduplex
[`ERR_STREAM_ITER_MISSING_FLAG`]: errors.md#err_stream_iter_missing_flag
[`EventEmitter`]: events.md#class-eventemitter
[`Readable`]: #class-streamreadable
[`Stream.toAsyncStreamable`]: stream_iter.md#streamtoasyncstreamable
[`Symbol.hasInstance`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/hasInstance
[`Transform`]: #class-streamtransform
[`Writable`]: #class-streamwritable
[`fs.createReadStream()`]: fs.md#fscreatereadstreampath-options
[`fs.createWriteStream()`]: fs.md#fscreatewritestreampath-options
[`net.Socket`]: net.md#class-netsocket
[`process.stderr`]: process.md#processstderr
[`process.stdin`]: process.md#processstdin
[`process.stdout`]: process.md#processstdout
[`readable._read()`]: #readable_readsize
[`readable.compose(stream)`]: #readablecomposestream-options
[`readable.map`]: #readablemapfn-options
[`readable.push('')`]: #readablepush
[`readable.setEncoding()`]: #readablesetencodingencoding
[`stream.Readable.from()`]: #streamreadablefromiterable-options
[`stream.addAbortSignal()`]: #streamaddabortsignalsignal-stream
[`stream.compose(...streams)`]: #streamcomposestreams
[`stream.cork()`]: #writablecork
[`stream.duplexPair()`]: #streamduplexpairoptions
[`stream.finished()`]: #streamfinishedstream-options-callback
[`stream.pipe()`]: #readablepipedestination-options
[`stream.pipeline()`]: #streampipelinesource-transforms-destination-callback
[`stream.uncork()`]: #writableuncork
[`stream.unpipe()`]: #readableunpipedestination
[`stream.wrap()`]: #readablewrapstream
[`stream/iter`]: stream_iter.md
[`writable._final()`]: #writable_finalcallback
[`writable._write()`]: #writable_writechunk-encoding-callback
[`writable._writev()`]: #writable_writevchunks-callback
[`writable.cork()`]: #writablecork
[`writable.end()`]: #writableendchunk-encoding-callback
[`writable.uncork()`]: #writableuncork
[`writable.writableFinished`]: #writablewritablefinished
[`zlib.createDeflate()`]: zlib.md#zlibcreatedeflateoptions
[child process stdin]: child_process.md#subprocessstdin
[child process stdout and stderr]: child_process.md#subprocessstdout
[crypto]: crypto.md
[fs read streams]: fs.md#class-fsreadstream
[fs write streams]: fs.md#class-fswritestream
[http-incoming-message]: http.md#class-httpincomingmessage
[hwm-gotcha]: #highwatermark-discrepancy-after-calling-readablesetencoding
[object-mode]: #object-mode
[readable-_construct]: #readable_constructcallback
[readable-_destroy]: #readable_destroyerr-callback
[readable-destroy]: #readabledestroyerror
[stream-_final]: #writable_finalcallback
[stream-_flush]: #transform_flushcallback
[stream-_read]: #readable_readsize
[stream-_transform]: #transform_transformchunk-encoding-callback
[stream-_write]: #writable_writechunk-encoding-callback
[stream-_writev]: #writable_writevchunks-callback
[stream-end]: #writableendchunk-encoding-callback
[stream-finished]: #streamfinishedstream-options-callback
[stream-finished-promise]: #streamfinishedstream-options
[stream-iter-from]: stream_iter.md#frominput
[stream-pause]: #readablepause
[stream-pipeline]: #streampipelinesource-transforms-destination-callback
[stream-pipeline-promise]: #streampipelinesource-transforms-destination-options
[stream-push]: #readablepushchunk-encoding
[stream-read]: #readablereadsize
[stream-resume]: #readableresume
[stream-uncork]: #writableuncork
[stream-write]: #writablewritechunk-encoding-callback
[writable-_construct]: #writable_constructcallback
[writable-_destroy]: #writable_destroyerr-callback
[writable-destroy]: #writabledestroyerror
[writable-new]: #new-streamwritableoptions
[zlib]: zlib.md
