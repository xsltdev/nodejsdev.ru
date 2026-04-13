---
title: Web Streams API
description: Реализация стандарта WHATWG Streams — ReadableStream, WritableStream, TransformStream и совместимость с потоками Node.js
---

# Web Streams API

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/webstreams.html)

<!--introduced_in=v16.5.0-->

<!-- YAML
added: v16.5.0
changes:
  - version:
    - v21.0.0
    pr-url: https://github.com/nodejs/node/pull/45684
    description: Больше не экспериментально.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Использование этого API больше не выводит предупреждение времени выполнения.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Больше не экспериментально. |
    | v18.0.0 | Использование этого API больше не выводит предупреждение времени выполнения. |

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Реализация [стандарта WHATWG Streams][WHATWG Streams Standard].

## Обзор

[Стандарт WHATWG Streams][WHATWG Streams Standard] («веб-потоки») задаёт API для работы с
потоковыми данными. Он близок к API [Streams][Streams] в Node.js, но появился позже
и стал распространённым «стандартным» API потоков во многих средах JavaScript.

Три основных типа объектов:

* `ReadableStream` — источник потоковых данных.
* `WritableStream` — приёмник потоковых данных.
* `TransformStream` — алгоритм преобразования потоковых данных.

### Пример `ReadableStream`

Пример создаёт простой `ReadableStream`, который каждую секунду помещает в очередь текущее значение
`performance.now()`. Для чтения используется асинхронный итератор.

=== "MJS"

    ```js
    import {
      ReadableStream,
    } from 'node:stream/web';
    
    import {
      setInterval as every,
    } from 'node:timers/promises';
    
    import {
      performance,
    } from 'node:perf_hooks';
    
    const SECOND = 1000;
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const _ of every(SECOND))
          controller.enqueue(performance.now());
      },
    });
    
    for await (const value of stream)
      console.log(value);
    ```

=== "CJS"

    ```js
    const {
      ReadableStream,
    } = require('node:stream/web');
    
    const {
      setInterval: every,
    } = require('node:timers/promises');
    
    const {
      performance,
    } = require('node:perf_hooks');
    
    const SECOND = 1000;
    
    const stream = new ReadableStream({
      async start(controller) {
        for await (const _ of every(SECOND))
          controller.enqueue(performance.now());
      },
    });
    
    (async () => {
      for await (const value of stream)
        console.log(value);
    })();
    ```

### Совместимость с потоками Node.js

Потоки Node.js можно преобразовать в веб-потоки и обратно методами `toWeb` и `fromWeb` у [`stream.Readable`][`stream.Readable`], [`stream.Writable`][`stream.Writable`] и [`stream.Duplex`][`stream.Duplex`].

Подробнее в соответствующих разделах:

* [`stream.Readable.toWeb`][`stream.Readable.toWeb`]
* [`stream.Readable.fromWeb`][`stream.Readable.fromWeb`]
* [`stream.Writable.toWeb`][`stream.Writable.toWeb`]
* [`stream.Writable.fromWeb`][`stream.Writable.fromWeb`]
* [`stream.Duplex.toWeb`][`stream.Duplex.toWeb`]
* [`stream.Duplex.fromWeb`][`stream.Duplex.fromWeb`]

## API

### Класс: `ReadableStream`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new ReadableStream([underlyingSource [, strategy]])`

<!-- YAML
added: v16.5.0
-->

<!--lint disable maximum-line-length remark-lint-->

* `underlyingSource` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая сразу при создании
    `ReadableStream`.
    * `controller` [`<ReadableStreamDefaultController>`](webstreams.md#class-readablestreamdefaultcontroller) | [`<ReadableByteStreamController>`](webstreams.md#class-readablebytestreamcontroller)
    * Возвращает: `undefined` или промис, выполняемый с `undefined`.
  * `pull` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая повторно, пока
    внутренняя очередь `ReadableStream` не заполнена. Операция может быть синхронной или
    асинхронной. Если асинхронная, функция не вызывается снова, пока не выполнится
    ранее возвращённый промис.
    * `controller` [`<ReadableStreamDefaultController>`](webstreams.md#class-readablestreamdefaultcontroller) | [`<ReadableByteStreamController>`](webstreams.md#class-readablebytestreamcontroller)
    * Возвращает: промис, выполняемый с `undefined`.
  * `cancel` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая при отмене
    `ReadableStream`.
    * `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: промис, выполняемый с `undefined`.
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Должно быть `'bytes'` или `undefined`.
  * `autoAllocateChunkSize` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Используется только при `type`, равном
    `'bytes'`. При ненулевом значении буфер представления автоматически
    выделяется для `ReadableByteStreamController.byobRequest`. Если не задано,
    данные передаются через внутренние очереди потока и обычный
    читатель `ReadableStreamDefaultReader`.
* `strategy` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер внутренней очереди до срабатывания обратного давления.
  * `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция для определения размера каждого
    фрагмента данных.
    * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

<!--lint enable maximum-line-length remark-lint-->

#### `readableStream.locked`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если для этого [ReadableStream](webstreams.md#readablestream) есть активный читатель.

Свойство `readableStream.locked` по умолчанию `false` и становится
`true`, пока активный читатель потребляет данные потока.

#### `readableStream.cancel([reason])`

<!-- YAML
added: v16.5.0
-->

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: промис, выполняемый с `undefined` после завершения отмены.

#### `readableStream.getReader([options])`

<!-- YAML
added: v16.5.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'byob'` или `undefined`
* Возвращает: [`<ReadableStreamDefaultReader>`](webstreams.md#class-readablestreamdefaultreader) | [`<ReadableStreamBYOBReader>`](webstreams.md#class-readablestreambyobreader)

=== "MJS"

    ```js
    import { ReadableStream } from 'node:stream/web';
    
    const stream = new ReadableStream();
    
    const reader = stream.getReader();
    
    console.log(await reader.read());
    ```

=== "CJS"

    ```js
    const { ReadableStream } = require('node:stream/web');
    
    const stream = new ReadableStream();
    
    const reader = stream.getReader();
    
    reader.read().then(console.log);
    ```

Устанавливает `readableStream.locked` в `true`.

#### `readableStream.pipeThrough(transform[, options])`

<!-- YAML
added: v16.5.0
-->

* `transform` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `readable` [`<ReadableStream>`](webstreams.md#readablestream) `ReadableStream`, в который
    `transform.writable` помещает возможно изменённые данные,
    полученные из этого `ReadableStream`.
  * `writable` [`<WritableStream>`](webstreams.md#class-writablestream) `WritableStream`, в который записываются
    данные этого `ReadableStream`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `preventAbort` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, ошибки в этом `ReadableStream`
    не приводят к прерыванию `transform.writable`.
  * `preventCancel` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, ошибки в целевом
    `transform.writable` не отменяют этот `ReadableStream`.
  * `preventClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, закрытие этого `ReadableStream`
    не закрывает `transform.writable`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет отменить передачу данных через [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
* Возвращает: [`<ReadableStream>`](webstreams.md#readablestream) из `transform.readable`.

Соединяет этот [ReadableStream](webstreams.md#readablestream) с парой [ReadableStream](webstreams.md#readablestream) и
[WritableStream](webstreams.md#class-writablestream) из аргумента `transform`: данные из этого [ReadableStream](webstreams.md#readablestream) записываются в `transform.writable`,
при необходимости преобразуются и попадают в `transform.readable`. После настройки
конвейера возвращается `transform.readable`.

Пока активна операция pipe, `readableStream.locked` равен `true`.

=== "MJS"

    ```js
    import {
      ReadableStream,
      TransformStream,
    } from 'node:stream/web';
    
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('a');
      },
    });
    
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase());
      },
    });
    
    const transformedStream = stream.pipeThrough(transform);
    
    for await (const chunk of transformedStream)
      console.log(chunk);
      // Prints: A
    ```

=== "CJS"

    ```js
    const {
      ReadableStream,
      TransformStream,
    } = require('node:stream/web');
    
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('a');
      },
    });
    
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase());
      },
    });
    
    const transformedStream = stream.pipeThrough(transform);
    
    (async () => {
      for await (const chunk of transformedStream)
        console.log(chunk);
        // Prints: A
    })();
    ```

#### `readableStream.pipeTo(destination[, options])`

<!-- YAML
added: v16.5.0
-->

* `destination` [`<WritableStream>`](webstreams.md#class-writablestream) [WritableStream](webstreams.md#class-writablestream), в который записываются
  данные этого `ReadableStream`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `preventAbort` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, ошибки в этом `ReadableStream`
    не приводят к прерыванию `destination`.
  * `preventCancel` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, ошибки в `destination`
    не отменяют этот `ReadableStream`.
  * `preventClose` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, закрытие этого `ReadableStream`
    не закрывает `destination`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет отменить передачу данных через [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
* Возвращает: промис, выполняемый с `undefined`

Пока активна операция pipe, `readableStream.locked` равен `true`.

#### `readableStream.tee()`

<!-- YAML
added: v16.5.0
changes:
  - version:
    - v18.10.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/44505
    description: Поддержка tee для байтового читаемого потока.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.10.0, v16.18.0 | Поддержка tee для байтового читаемого потока. |

* Возвращает: [<ReadableStream[]>](webstreams.md#readablestream)

Возвращает пару новых экземпляров [ReadableStream](webstreams.md#readablestream), в которые пересылаются
данные этого `ReadableStream`. Оба получают одинаковые данные.

Устанавливает `readableStream.locked` в `true`.

#### `readableStream.values([options])`

<!-- YAML
added: v16.5.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `preventCancel` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, [ReadableStream](webstreams.md#readablestream) не закрывается
    при резком завершении асинхронного итератора.
    **По умолчанию**: `false`.

Создаёт и возвращает асинхронный итератор для чтения данных этого
`ReadableStream`.

Пока активен асинхронный итератор, `readableStream.locked` равен `true`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    
    const stream = new ReadableStream(getSomeSource());
    
    for await (const chunk of stream.values({ preventCancel: true }))
      console.log(Buffer.from(chunk).toString());
    ```

#### Асинхронная итерация

Объект [ReadableStream](webstreams.md#readablestream) поддерживает протокол асинхронного итератора через
синтаксис `for await`.

=== "MJS"

    ```js
    import { Buffer } from 'node:buffer';
    
    const stream = new ReadableStream(getSomeSource());
    
    for await (const chunk of stream)
      console.log(Buffer.from(chunk).toString());
    ```

Асинхронный итератор читает [ReadableStream](webstreams.md#readablestream) до его завершения.

По умолчанию при раннем выходе из итератора (`break`,
`return` или `throw`) [ReadableStream](webstreams.md#readablestream) закрывается. Чтобы не закрывать
[ReadableStream](webstreams.md#readablestream) автоматически, получите итератор через `readableStream.values()`
и установите опцию `preventCancel` в
`true`.

[ReadableStream](webstreams.md#readablestream) не должен быть заблокирован (не должно быть активного
читателя). На время асинхронной итерации [ReadableStream](webstreams.md#readablestream) блокируется.

#### Передача через `postMessage()`

Экземпляр [ReadableStream](webstreams.md#readablestream) можно передать через [MessagePort](worker_threads.md#class-messageport).

```js
const stream = new ReadableStream(getReadableSourceSomehow());

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => {
  data.getReader().read().then((chunk) => {
    console.log(chunk);
  });
};

port2.postMessage(stream, [stream]);
```

### `ReadableStream.from(iterable)`

<!-- YAML
added: v20.6.0
-->

* `iterable` [`<Iterable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol) Объект, реализующий протокол итерируемости `Symbol.asyncIterator` или
  `Symbol.iterator`.

Вспомогательный метод создаёт новый [ReadableStream](webstreams.md#readablestream) из итерируемого объекта.

=== "MJS"

    ```js
    import { ReadableStream } from 'node:stream/web';
    
    async function* asyncIterableGenerator() {
      yield 'a';
      yield 'b';
      yield 'c';
    }
    
    const stream = ReadableStream.from(asyncIterableGenerator());
    
    for await (const chunk of stream)
      console.log(chunk); // Prints: 'a', 'b', 'c'
    ```

=== "CJS"

    ```js
    const { ReadableStream } = require('node:stream/web');
    
    async function* asyncIterableGenerator() {
      yield 'a';
      yield 'b';
      yield 'c';
    }
    
    (async () => {
      const stream = ReadableStream.from(asyncIterableGenerator());
    
      for await (const chunk of stream)
        console.log(chunk); // Prints: 'a', 'b', 'c'
    })();
    ```

Чтобы направить получившийся [ReadableStream](webstreams.md#readablestream) в [WritableStream](webstreams.md#class-writablestream), [Iterable](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol)
должен отдавать последовательность объектов [Buffer](buffer.md#buffer), [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView).

=== "MJS"

    ```js
    import { ReadableStream } from 'node:stream/web';
    import { Buffer } from 'node:buffer';
    
    async function* asyncIterableGenerator() {
      yield Buffer.from('a');
      yield Buffer.from('b');
      yield Buffer.from('c');
    }
    
    const stream = ReadableStream.from(asyncIterableGenerator());
    
    await stream.pipeTo(createWritableStreamSomehow());
    ```

=== "CJS"

    ```js
    const { ReadableStream } = require('node:stream/web');
    const { Buffer } = require('node:buffer');
    
    async function* asyncIterableGenerator() {
      yield Buffer.from('a');
      yield Buffer.from('b');
      yield Buffer.from('c');
    }
    
    const stream = ReadableStream.from(asyncIterableGenerator());
    
    (async () => {
      await stream.pipeTo(createWritableStreamSomehow());
    })();
    ```

### Класс: `ReadableStreamDefaultReader`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

По умолчанию вызов `readableStream.getReader()` без аргументов
возвращает экземпляр `ReadableStreamDefaultReader`. Обычный
читатель обрабатывает фрагменты данных как непрозрачные
значения, поэтому [ReadableStream](webstreams.md#readablestream) может работать с любыми
значениями JavaScript.

#### `new ReadableStreamDefaultReader(stream)`

<!-- YAML
added: v16.5.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream)

Создаёт новый [ReadableStreamDefaultReader](webstreams.md#class-readablestreamdefaultreader), привязанный к
заданному [ReadableStream](webstreams.md#readablestream).

#### `readableStreamDefaultReader.cancel([reason])`

<!-- YAML
added: v16.5.0
-->

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: промис, выполняемый с `undefined`.

Отменяет [ReadableStream](webstreams.md#readablestream) и возвращает промис, выполняемый
после отмены нижележащего потока.

#### `readableStreamDefaultReader.closed`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется с `undefined`, когда связанный
  [ReadableStream](webstreams.md#readablestream) закрыт, или отклоняется при ошибке потока или снятии
  блокировки читателя до завершения закрытия.

#### `readableStreamDefaultReader.read()`

<!-- YAML
added: v16.5.0
-->

* Возвращает: промис, выполняемый с объектом:
  * `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
  * `done` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Запрашивает следующий фрагмент данных из нижележащего [ReadableStream](webstreams.md#readablestream)
и возвращает промис, выполняемый, когда данные доступны.

#### `readableStreamDefaultReader.releaseLock()`

<!-- YAML
added: v16.5.0
-->

Снимает блокировку этого читателя с нижележащего [ReadableStream](webstreams.md#readablestream).

### Класс: `ReadableStreamBYOBReader`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

`ReadableStreamBYOBReader` — альтернативный потребитель для
байто-ориентированных [ReadableStream](webstreams.md#readablestream) (создаются с
`underlyingSource.type`, равным `'bytes'` при создании
`ReadableStream`).

`BYOB` — сокращение от «bring your own buffer». Это
шаблон более эффективного чтения байтовых данных
без лишнего копирования.

=== "MJS"

    ```js
    import {
      open,
    } from 'node:fs/promises';
    
    import {
      ReadableStream,
    } from 'node:stream/web';
    
    import { Buffer } from 'node:buffer';
    
    class Source {
      type = 'bytes';
      autoAllocateChunkSize = 1024;
    
      async start(controller) {
        this.file = await open(new URL(import.meta.url));
        this.controller = controller;
      }
    
      async pull(controller) {
        const view = controller.byobRequest?.view;
        const {
          bytesRead,
        } = await this.file.read({
          buffer: view,
          offset: view.byteOffset,
          length: view.byteLength,
        });
    
        if (bytesRead === 0) {
          await this.file.close();
          this.controller.close();
        }
        controller.byobRequest.respond(bytesRead);
      }
    }
    
    const stream = new ReadableStream(new Source());
    
    async function read(stream) {
      const reader = stream.getReader({ mode: 'byob' });
    
      const chunks = [];
      let result;
      do {
        result = await reader.read(Buffer.alloc(100));
        if (result.value !== undefined)
          chunks.push(Buffer.from(result.value));
      } while (!result.done);
    
      return Buffer.concat(chunks);
    }
    
    const data = await read(stream);
    console.log(Buffer.from(data).toString());
    ```

#### `new ReadableStreamBYOBReader(stream)`

<!-- YAML
added: v16.5.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream)

Создаёт новый `ReadableStreamBYOBReader`, привязанный к
заданному [ReadableStream](webstreams.md#readablestream).

#### `readableStreamBYOBReader.cancel([reason])`

<!-- YAML
added: v16.5.0
-->

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: промис, выполняемый с `undefined`.

Отменяет [ReadableStream](webstreams.md#readablestream) и возвращает промис, выполняемый
после отмены нижележащего потока.

#### `readableStreamBYOBReader.closed`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется с `undefined`, когда связанный
  [ReadableStream](webstreams.md#readablestream) закрыт, или отклоняется при ошибке потока или снятии
  блокировки читателя до завершения закрытия.

#### `readableStreamBYOBReader.read(view[, options])`

<!-- YAML
added: v16.5.0
changes:
  - version:
    - v21.7.0
    - v20.17.0
    pr-url: https://github.com/nodejs/node/pull/50888
    description: Добавлена опция `min`.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.7.0, v20.17.0 | Добавлена опция `min`. |

* `view` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `min` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Если задано, промис выполнится только когда доступно
    не менее `min` элементов.
    Если не задано, промис выполняется, когда доступен хотя бы один элемент.
* Возвращает: промис, выполняемый с объектом:
  * `value` [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)
  * `done` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Запрашивает следующий фрагмент данных из нижележащего [ReadableStream](webstreams.md#readablestream)
и возвращает промис, выполняемый, когда данные доступны.

Не передавайте в этот метод pooled-экземпляр [Buffer](buffer.md#buffer).
Pooled-`Buffer` создаются через `Buffer.allocUnsafe()`,
`Buffer.from()` или часто возвращаются колбэками модуля `node:fs`.
Такие `Buffer` разделяют общий
[ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), в котором лежат данные всех pooled-`Buffer`.
Когда в `readableStreamBYOBReader.read()` передаётся `Buffer`, [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)
или [DataView](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView),
у представления отсоединяется (`detach`) базовый `ArrayBuffer`, с чего
снимается действительность всех существующих представлений на этом `ArrayBuffer`. Это
может привести к серьёзным сбоям в приложении.

#### `readableStreamBYOBReader.releaseLock()`

<!-- YAML
added: v16.5.0
-->

Снимает блокировку этого читателя с нижележащего [ReadableStream](webstreams.md#readablestream).

### Класс: `ReadableStreamDefaultController`

<!-- YAML
added: v16.5.0
-->

У каждого [ReadableStream](webstreams.md#readablestream) есть контроллер, отвечающий за
внутреннее состояние и очередь потока.
`ReadableStreamDefaultController` — контроллер по умолчанию
для не байто-ориентированных `ReadableStream`.

#### `readableStreamDefaultController.close()`

<!-- YAML
added: v16.5.0
-->

Закрывает [ReadableStream](webstreams.md#readablestream), с которым связан этот контроллер.

#### `readableStreamDefaultController.desiredSize`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает объём данных, которого не хватает до заполнения очереди [ReadableStream](webstreams.md#readablestream).

#### `readableStreamDefaultController.enqueue([chunk])`

<!-- YAML
added: v16.5.0
-->

* `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Добавляет новый фрагмент данных в очередь [ReadableStream](webstreams.md#readablestream).

#### `readableStreamDefaultController.error([error])`

<!-- YAML
added: v16.5.0
-->

* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Сообщает об ошибке: [ReadableStream](webstreams.md#readablestream) переходит в ошибку и закрывается.

### Класс: `ReadableByteStreamController`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.10.0
    pr-url: https://github.com/nodejs/node/pull/44702
    description: Поддержка BYOB pull-запроса от освобождённого читателя.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.10.0 | Поддержка BYOB pull-запроса от освобождённого читателя. |

У каждого [ReadableStream](webstreams.md#readablestream) есть контроллер, отвечающий за
внутреннее состояние и очередь потока.
`ReadableByteStreamController` — для байто-ориентированных `ReadableStream`.

#### `readableByteStreamController.byobRequest`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<ReadableStreamBYOBRequest>`](webstreams.md#class-readablestreambyobrequest)

#### `readableByteStreamController.close()`

<!-- YAML
added: v16.5.0
-->

Закрывает [ReadableStream](webstreams.md#readablestream), с которым связан этот контроллер.

#### `readableByteStreamController.desiredSize`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает объём данных, которого не хватает до заполнения очереди [ReadableStream](webstreams.md#readablestream).

#### `readableByteStreamController.enqueue(chunk)`

<!-- YAML
added: v16.5.0
-->

* `chunk` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)

Добавляет новый фрагмент данных в очередь [ReadableStream](webstreams.md#readablestream).

#### `readableByteStreamController.error([error])`

<!-- YAML
added: v16.5.0
-->

* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Сообщает об ошибке: [ReadableStream](webstreams.md#readablestream) переходит в ошибку и закрывается.

### Класс: `ReadableStreamBYOBRequest`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

При использовании `ReadableByteStreamController` в байто-ориентированных
потоках и при использовании `ReadableStreamBYOBReader`
свойство `readableByteStreamController.byobRequest`
даёт доступ к экземпляру `ReadableStreamBYOBRequest`,
соответствующему текущему запросу чтения. Объект
нужен для доступа к `ArrayBuffer`/`TypedArray`,
выделенным под заполнение при чтении,
и содержит методы сигнализации о том, что данные
уже записаны.

#### `readableStreamBYOBRequest.respond(bytesWritten)`

<!-- YAML
added: v16.5.0
-->

* `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Сообщает, что в `readableStreamBYOBRequest.view` записано `bytesWritten` байт.

#### `readableStreamBYOBRequest.respondWithNewView(view)`

<!-- YAML
added: v16.5.0
-->

* `view` [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)

Сообщает, что запрос выполнен: данные записаны в новый `Buffer`, `TypedArray` или `DataView`.

#### `readableStreamBYOBRequest.view`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Buffer>`](buffer.md#buffer) | [`<TypedArray>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [`<DataView>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/DataView)

### Класс: `WritableStream`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

`WritableStream` — приёмник, в который отправляются данные потока.

=== "MJS"

    ```js
    import {
      WritableStream,
    } from 'node:stream/web';
    
    const stream = new WritableStream({
      write(chunk) {
        console.log(chunk);
      },
    });
    
    await stream.getWriter().write('Hello World');
    ```

#### `new WritableStream([underlyingSink[, strategy]])`

<!-- YAML
added: v16.5.0
-->

* `underlyingSink` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая сразу при создании
    `WritableStream`.
    * `controller` [`<WritableStreamDefaultController>`](webstreams.md#class-writablestreamdefaultcontroller)
    * Возвращает: `undefined` или промис, выполняемый с `undefined`.
  * `write` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая при записи фрагмента
    данных в `WritableStream`.
    * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * `controller` [`<WritableStreamDefaultController>`](webstreams.md#class-writablestreamdefaultcontroller)
    * Возвращает: промис, выполняемый с `undefined`.
  * `close` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая при закрытии
    `WritableStream`.
    * Возвращает: промис, выполняемый с `undefined`.
  * `abort` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция для немедленного закрытия
    `WritableStream`.
    * `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: промис, выполняемый с `undefined`.
  * `type` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Опция `type` зарезервирована и _должна_ быть
    `undefined`.
* `strategy` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер внутренней очереди до срабатывания обратного давления.
  * `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция для определения размера каждого
    фрагмента данных.
    * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `writableStream.abort([reason])`

<!-- YAML
added: v16.5.0
-->

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: промис, выполняемый с `undefined`.

Немедленно завершает `WritableStream`. Все запросы записи в очереди
отменяются, связанные с ними промисы отклоняются.

#### `writableStream.close()`

<!-- YAML
added: v16.5.0
-->

* Возвращает: промис, выполняемый с `undefined`.

Закрывает `WritableStream`, когда дальнейшая запись не ожидается.

#### `writableStream.getWriter()`

<!-- YAML
added: v16.5.0
-->

* Возвращает: [`<WritableStreamDefaultWriter>`](webstreams.md#class-writablestreamdefaultwriter)

Создаёт и возвращает новый writer для записи
данных в `WritableStream`.

#### `writableStream.locked`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `writableStream.locked` по умолчанию `false` и становится
`true`, пока к этому `WritableStream` привязан активный writer.

#### Передача через postMessage()

Экземпляр [WritableStream](webstreams.md#class-writablestream) можно передать через [MessagePort](worker_threads.md#class-messageport).

```js
const stream = new WritableStream(getWritableSinkSomehow());

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => {
  data.getWriter().write('hello');
};

port2.postMessage(stream, [stream]);
```

### Класс: `WritableStreamDefaultWriter`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new WritableStreamDefaultWriter(stream)`

<!-- YAML
added: v16.5.0
-->

* `stream` [`<WritableStream>`](webstreams.md#class-writablestream)

Создаёт новый `WritableStreamDefaultWriter`, привязанный к заданному
`WritableStream`.

#### `writableStreamDefaultWriter.abort([reason])`

<!-- YAML
added: v16.5.0
-->

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: промис, выполняемый с `undefined`.

Немедленно завершает `WritableStream`. Все запросы записи в очереди
отменяются, связанные с ними промисы отклоняются.

#### `writableStreamDefaultWriter.close()`

<!-- YAML
added: v16.5.0
-->

* Возвращает: промис, выполняемый с `undefined`.

Закрывает `WritableStream`, когда дальнейшая запись не ожидается.

#### `writableStreamDefaultWriter.closed`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется с `undefined`, когда связанный
  [WritableStream](webstreams.md#class-writablestream) закрыт, или отклоняется при ошибке потока или снятии
  блокировки writer до завершения закрытия.

#### `writableStreamDefaultWriter.desiredSize`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Объём данных, необходимый для заполнения очереди [WritableStream](webstreams.md#class-writablestream).

#### `writableStreamDefaultWriter.ready`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfilled with `undefined` when the writer is ready
  to be used.

#### `writableStreamDefaultWriter.releaseLock()`

<!-- YAML
added: v16.5.0
-->

Снимает блокировку этого writer с нижележащего [WritableStream](webstreams.md#class-writablestream).

#### `writableStreamDefaultWriter.write([chunk])`

<!-- YAML
added: v16.5.0
-->

* `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: промис, выполняемый с `undefined`.

Ставит в очередь новый фрагмент данных для записи в [WritableStream](webstreams.md#class-writablestream).

### Класс: `WritableStreamDefaultController`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

`WritableStreamDefaultController` управляет внутренним состоянием
[WritableStream](webstreams.md#class-writablestream).

#### `writableStreamDefaultController.error([error])`

<!-- YAML
added: v16.5.0
-->

* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Вызывается из кода пользователя, чтобы сообщить об ошибке при обработке
данных `WritableStream`. При вызове [WritableStream](webstreams.md#class-writablestream) прерывается,
текущие запросы записи отменяются.

#### `writableStreamDefaultController.signal`

* Тип: [`<AbortSignal>`](globals.md#abortsignal) `AbortSignal` для отмены ожидающих
  операций записи или закрытия при прерывании [WritableStream](webstreams.md#class-writablestream).

### Класс: `TransformStream`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

`TransformStream` объединяет [ReadableStream](webstreams.md#readablestream) и [WritableStream](webstreams.md#class-writablestream),
соединённые так, что данные, записанные в `WritableStream`, поступают
и при необходимости преобразуются перед помещением в очередь `ReadableStream`.

=== "MJS"

    ```js
    import {
      TransformStream,
    } from 'node:stream/web';
    
    const transform = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase());
      },
    });
    
    await Promise.all([
      transform.writable.getWriter().write('A'),
      transform.readable.getReader().read(),
    ]);
    ```

#### `new TransformStream([transformer[, writableStrategy[, readableStrategy]]])`

<!-- YAML
added: v16.5.0
changes:
  - version:
    - v21.5.0
    - v20.14.0
    pr-url: https://github.com/nodejs/node/pull/50126
    description: Поддержка колбэка `cancel` у трансформера.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.5.0, v20.14.0 | Поддержка колбэка `cancel` у трансформера. |

* `transformer` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая сразу при создании
    `TransformStream`.
    * `controller` [`<TransformStreamDefaultController>`](webstreams.md#class-transformstreamdefaultcontroller)
    * Возвращает: `undefined` или промис, выполняемый с `undefined`
  * `transform` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция: получает и при необходимости изменяет
    фрагмент данных, записанный в `transformStream.writable`,
    затем передаёт его в `transformStream.readable`.
    * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * `controller` [`<TransformStreamDefaultController>`](webstreams.md#class-transformstreamdefaultcontroller)
    * Возвращает: промис, выполняемый с `undefined`.
  * `flush` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция, вызываемая непосредственно перед
    закрытием записывающей стороны `TransformStream`, сигнализируя о завершении
    преобразования.
    * `controller` [`<TransformStreamDefaultController>`](webstreams.md#class-transformstreamdefaultcontroller)
    * Возвращает: промис, выполняемый с `undefined`.
  * `cancel` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция при отмене читающей стороны
    `TransformStream` или прерывании записывающей.
    * `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: промис, выполняемый с `undefined`.
  * `readableType` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) опция `readableType` зарезервирована
    и _должна_ быть `undefined`.
  * `writableType` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) опция `writableType` зарезервирована
    и _должна_ быть `undefined`.
* `writableStrategy` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер внутренней очереди до срабатывания обратного давления.
  * `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция для определения размера каждого
    фрагмента данных.
    * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* `readableStrategy` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер внутренней очереди до срабатывания обратного давления.
  * `size` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Пользовательская функция для определения размера каждого
    фрагмента данных.
    * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
    * Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `transformStream.readable`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<ReadableStream>`](webstreams.md#readablestream)

#### `transformStream.writable`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<WritableStream>`](webstreams.md#class-writablestream)

#### Передача через postMessage()

Экземпляр [TransformStream](webstreams.md#class-transformstream) можно передать через [MessagePort](worker_threads.md#class-messageport).

```js
const stream = new TransformStream();

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => {
  const { writable, readable } = data;
  // ...
};

port2.postMessage(stream, [stream]);
```

### Класс: `TransformStreamDefaultController`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

`TransformStreamDefaultController` управляет внутренним состоянием
`TransformStream`.

#### `transformStreamDefaultController.desiredSize`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Объём данных, необходимый для заполнения очереди читающей стороны.

#### `transformStreamDefaultController.enqueue([chunk])`

<!-- YAML
added: v16.5.0
-->

* `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Добавляет фрагмент данных в очередь читающей стороны.

#### `transformStreamDefaultController.error([reason])`

<!-- YAML
added: v16.5.0
-->

* `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Сообщает об ошибке на читающей и записывающей сторонах при обработке
данных трансформации; обе стороны немедленно закрываются.

#### `transformStreamDefaultController.terminate()`

<!-- YAML
added: v16.5.0
-->

Закрывает читающую сторону и приводит к немедленному закрытию записывающей стороны
с ошибкой.

### Класс: `ByteLengthQueuingStrategy`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new ByteLengthQueuingStrategy(init)`

<!-- YAML
added: v16.5.0
-->

* `init` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `byteLengthQueuingStrategy.highWaterMark`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `byteLengthQueuingStrategy.size`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
  * Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

### Класс: `CountQueuingStrategy`

<!-- YAML
added: v16.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new CountQueuingStrategy(init)`

<!-- YAML
added: v16.5.0
-->

* `init` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `highWaterMark` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `countQueuingStrategy.highWaterMark`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

#### `countQueuingStrategy.size`

<!-- YAML
added: v16.5.0
-->

* Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `chunk` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
  * Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

### Класс: `TextEncoderStream`

<!-- YAML
added: v16.6.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new TextEncoderStream()`

<!-- YAML
added: v16.6.0
-->

Создаёт новый экземпляр `TextEncoderStream`.

#### `textEncoderStream.encoding`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Кодировка, поддерживаемая экземпляром `TextEncoderStream`.

#### `textEncoderStream.readable`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<ReadableStream>`](webstreams.md#readablestream)

#### `textEncoderStream.writable`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<WritableStream>`](webstreams.md#class-writablestream)

### Класс: `TextDecoderStream`

<!-- YAML
added: v16.6.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v16.6.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new TextDecoderStream([encoding[, options]])`

<!-- YAML
added: v16.6.0
-->

* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Кодировка, которую поддерживает этот `TextDecoder`.
  **По умолчанию:** `'utf-8'`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `fatal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если ошибки декодирования фатальны.
  * `ignoreBOM` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `TextDecoderStream` включает
    метку порядка байтов в результат. Если `false`, метка
    удаляется из вывода. Опция используется только при `encoding`
    `'utf-8'`, `'utf-16be'` или `'utf-16le'`. **По умолчанию:** `false`.

Создаёт новый экземпляр `TextDecoderStream`.

#### `textDecoderStream.encoding`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Кодировка, поддерживаемая экземпляром `TextDecoderStream`.

#### `textDecoderStream.fatal`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если при ошибках декодирования выбрасывается `TypeError`.

#### `textDecoderStream.ignoreBOM`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если в результат декодирования включается метка порядка байтов.

#### `textDecoderStream.readable`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<ReadableStream>`](webstreams.md#readablestream)

#### `textDecoderStream.writable`

<!-- YAML
added: v16.6.0
-->

* Тип: [`<WritableStream>`](webstreams.md#class-writablestream)

### Класс: `CompressionStream`

<!-- YAML
added: v17.0.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new CompressionStream(format)`

<!-- YAML
added: v17.0.0
changes:
  - version:
    - v24.7.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59464
    description: для format теперь допустимо значение `brotli`.
  - version:
    - v21.2.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/50097
    description: для format теперь допустимо значение `deflate-raw`.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0, v22.20.0 | для format теперь допустимо значение `brotli`. |
    | v21.2.0, v20.12.0 | для format теперь допустимо значение `deflate-raw`. |

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из `'deflate'`, `'deflate-raw'`, `'gzip'` или `'brotli'`.

#### `compressionStream.readable`

<!-- YAML
added: v17.0.0
-->

* Тип: [`<ReadableStream>`](webstreams.md#readablestream)

#### `compressionStream.writable`

<!-- YAML
added: v17.0.0
-->

* Тип: [`<WritableStream>`](webstreams.md#class-writablestream)

### Класс: `DecompressionStream`

<!-- YAML
added: v17.0.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/42225
    description: Класс теперь доступен в глобальном объекте.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Класс теперь доступен в глобальном объекте. |

#### `new DecompressionStream(format)`

<!-- YAML
added: v17.0.0
changes:
  - version:
    - v24.7.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59464
    description: для format теперь допустимо значение `brotli`.
  - version:
    - v21.2.0
    - v20.12.0
    pr-url: https://github.com/nodejs/node/pull/50097
    description: для format теперь допустимо значение `deflate-raw`.
-->

Добавлено в: v17.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.7.0, v22.20.0 | для format теперь допустимо значение `brotli`. |
    | v21.2.0, v20.12.0 | для format теперь допустимо значение `deflate-raw`. |

* `format` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Одно из `'deflate'`, `'deflate-raw'`, `'gzip'` или `'brotli'`.

#### `decompressionStream.readable`

<!-- YAML
added: v17.0.0
-->

* Тип: [`<ReadableStream>`](webstreams.md#readablestream)

#### `decompressionStream.writable`

<!-- YAML
added: v17.0.0
-->

* Тип: [`<WritableStream>`](webstreams.md#class-writablestream)

### Утилиты-потребители

<!-- YAML
added: v16.7.0
-->

Вспомогательные функции-потребители задают общие варианты чтения
потоков.

Импорт:

=== "MJS"

    ```js
    import {
      arrayBuffer,
      blob,
      buffer,
      json,
      text,
    } from 'node:stream/consumers';
    ```

=== "CJS"

    ```js
    const {
      arrayBuffer,
      blob,
      buffer,
      json,
      text,
    } = require('node:stream/consumers');
    ```

#### `streamConsumers.arrayBuffer(stream)`

<!-- YAML
added: v16.7.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream) | [`<stream.Readable>`](stream.md#streamreadable) | [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется с `ArrayBuffer`, содержащим полное
  содержимое потока.

=== "MJS"

    ```js
    import { arrayBuffer } from 'node:stream/consumers';
    import { Readable } from 'node:stream';
    import { TextEncoder } from 'node:util';
    
    const encoder = new TextEncoder();
    const dataArray = encoder.encode('hello world from consumers!');
    
    const readable = Readable.from(dataArray);
    const data = await arrayBuffer(readable);
    console.log(`from readable: ${data.byteLength}`);
    // Prints: from readable: 76
    ```

=== "CJS"

    ```js
    const { arrayBuffer } = require('node:stream/consumers');
    const { Readable } = require('node:stream');
    const { TextEncoder } = require('node:util');
    
    const encoder = new TextEncoder();
    const dataArray = encoder.encode('hello world from consumers!');
    const readable = Readable.from(dataArray);
    arrayBuffer(readable).then((data) => {
      console.log(`from readable: ${data.byteLength}`);
      // Prints: from readable: 76
    });
    ```

#### `streamConsumers.blob(stream)`

<!-- YAML
added: v16.7.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream) | [`<stream.Readable>`](stream.md#streamreadable) | [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется с [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob), содержащим полное содержимое
  потока.

=== "MJS"

    ```js
    import { blob } from 'node:stream/consumers';
    
    const dataBlob = new Blob(['hello world from consumers!']);
    
    const readable = dataBlob.stream();
    const data = await blob(readable);
    console.log(`from readable: ${data.size}`);
    // Prints: from readable: 27
    ```

=== "CJS"

    ```js
    const { blob } = require('node:stream/consumers');
    
    const dataBlob = new Blob(['hello world from consumers!']);
    
    const readable = dataBlob.stream();
    blob(readable).then((data) => {
      console.log(`from readable: ${data.size}`);
      // Prints: from readable: 27
    });
    ```

#### `streamConsumers.buffer(stream)`

<!-- YAML
added: v16.7.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream) | [`<stream.Readable>`](stream.md#streamreadable) | [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется с [Buffer](buffer.md#buffer), содержащим полное
  содержимое потока.

=== "MJS"

    ```js
    import { buffer } from 'node:stream/consumers';
    import { Readable } from 'node:stream';
    import { Buffer } from 'node:buffer';
    
    const dataBuffer = Buffer.from('hello world from consumers!');
    
    const readable = Readable.from(dataBuffer);
    const data = await buffer(readable);
    console.log(`from readable: ${data.length}`);
    // Prints: from readable: 27
    ```

=== "CJS"

    ```js
    const { buffer } = require('node:stream/consumers');
    const { Readable } = require('node:stream');
    const { Buffer } = require('node:buffer');
    
    const dataBuffer = Buffer.from('hello world from consumers!');
    
    const readable = Readable.from(dataBuffer);
    buffer(readable).then((data) => {
      console.log(`from readable: ${data.length}`);
      // Prints: from readable: 27
    });
    ```

#### `streamConsumers.bytes(stream)`

<!-- YAML
added:
 - v25.6.0
 - v24.14.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream) | [`<stream.Readable>`](stream.md#streamreadable) | [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется с [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), содержащим полное
  содержимое потока.

=== "MJS"

    ```js
    import { bytes } from 'node:stream/consumers';
    import { Readable } from 'node:stream';
    import { Buffer } from 'node:buffer';
    
    const dataBuffer = Buffer.from('hello world from consumers!');
    
    const readable = Readable.from(dataBuffer);
    const data = await bytes(readable);
    console.log(`from readable: ${data.length}`);
    // Prints: from readable: 27
    ```

=== "CJS"

    ```js
    const { bytes } = require('node:stream/consumers');
    const { Readable } = require('node:stream');
    const { Buffer } = require('node:buffer');
    
    const dataBuffer = Buffer.from('hello world from consumers!');
    
    const readable = Readable.from(dataBuffer);
    bytes(readable).then((data) => {
      console.log(`from readable: ${data.length}`);
      // Prints: from readable: 27
    });
    ```

#### `streamConsumers.json(stream)`

<!-- YAML
added: v16.7.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream) | [`<stream.Readable>`](stream.md#streamreadable) | [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) содержимое потока как UTF-8 строка, затем результат `JSON.parse()`.

=== "MJS"

    ```js
    import { json } from 'node:stream/consumers';
    import { Readable } from 'node:stream';
    
    const items = Array.from(
      {
        length: 100,
      },
      () => ({
        message: 'hello world from consumers!',
      }),
    );
    
    const readable = Readable.from(JSON.stringify(items));
    const data = await json(readable);
    console.log(`from readable: ${data.length}`);
    // Prints: from readable: 100
    ```

=== "CJS"

    ```js
    const { json } = require('node:stream/consumers');
    const { Readable } = require('node:stream');
    
    const items = Array.from(
      {
        length: 100,
      },
      () => ({
        message: 'hello world from consumers!',
      }),
    );
    
    const readable = Readable.from(JSON.stringify(items));
    json(readable).then((data) => {
      console.log(`from readable: ${data.length}`);
      // Prints: from readable: 100
    });
    ```

#### `streamConsumers.text(stream)`

<!-- YAML
added: v16.7.0
-->

* `stream` [`<ReadableStream>`](webstreams.md#readablestream) | [`<stream.Readable>`](stream.md#streamreadable) | [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface)
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) содержимое потока как UTF-8 строка.

=== "MJS"

    ```js
    import { text } from 'node:stream/consumers';
    import { Readable } from 'node:stream';
    
    const readable = Readable.from('Hello world from consumers!');
    const data = await text(readable);
    console.log(`from readable: ${data.length}`);
    // Prints: from readable: 27
    ```

=== "CJS"

    ```js
    const { text } = require('node:stream/consumers');
    const { Readable } = require('node:stream');
    
    const readable = Readable.from('Hello world from consumers!');
    text(readable).then((data) => {
      console.log(`from readable: ${data.length}`);
      // Prints: from readable: 27
    });
    ```

[Streams]: stream.md
[WHATWG Streams Standard]: https://streams.spec.whatwg.org/
[`stream.Duplex.fromWeb`]: stream.md#streamduplexfromwebpair-options
[`stream.Duplex.toWeb`]: stream.md#streamduplextowebstreamduplex-options
[`stream.Duplex`]: stream.md#class-streamduplex
[`stream.Readable.fromWeb`]: stream.md#streamreadablefromwebreadablestream-options
[`stream.Readable.toWeb`]: stream.md#streamreadabletowebstreamreadable-options
[`stream.Readable`]: stream.md#class-streamreadable
[`stream.Writable.fromWeb`]: stream.md#streamwritablefromwebwritablestream-options
[`stream.Writable.toWeb`]: stream.md#streamwritabletowebstreamwritable
[`stream.Writable`]: stream.md#class-streamwritable
