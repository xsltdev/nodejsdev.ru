---
title: Web Streams API
description: Реализация WHATWG Streams Standard
---

# Веб-потоки

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/webstreams.html)

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

Реализация [WHATWG Streams Standard](https://streams.spec.whatwg.org/).

## Обзор

Стандарт [WHATWG Streams Standard](https://streams.spec.whatwg.org/) (или "веб-потоки") определяет API для работы с потоковыми данными. Он похож на API Node.js [Streams](stream.md), но появился позже и стал "стандартным" API для потоковых данных во многих средах JavaScript.

Существует три основных типа объектов:

-   `ReadableStream` - Представляет источник потоковых данных.
-   `WritableStream` - Представляет место назначения для потоковых данных.
-   `TransformStream` - Представляет алгоритм преобразования потоковых данных.

### Пример `ReadableStream`

Этот пример создает простой `ReadableStream`, который выводит текущую временную метку `performance.now()` раз в секунду до бесконечности. Для чтения данных из потока используется асинхронная итерабельность.

```mjs
import { ReadableStream } from 'node:stream/web';

import { setInterval as every } from 'node:timers/promises';

import { performance } from 'node:perf_hooks';

const SECOND = 1000;

const stream = new ReadableStream({
    async start(controller) {
        for await (const _ of every(SECOND))
            controller.enqueue(performance.now());
    },
});

for await (const value of stream) console.log(value);
```

```cjs
const { ReadableStream } = require('node:stream/web');

const {
    setInterval: every,
} = require('node:timers/promises');

const { performance } = require('node:perf_hooks');

const SECOND = 1000;

const stream = new ReadableStream({
    async start(controller) {
        for await (const _ of every(SECOND))
            controller.enqueue(performance.now());
    },
});

(async () => {
    for await (const value of stream) console.log(value);
})();
```

## API

### Класс: `ReadableStream`

#### `новый ReadableStream([underlyingSource [, strategy]])`

-   `underlyingSource` {Object}
    -   `start` {Функция} Определяемая пользователем функция, которая вызывается сразу после создания `ReadableStream`.
        -   `controller` {ReadableStreamDefaultController|ReadableByteStreamController}
        -   Возвращает: `undefined` или обещание, выполненное с `undefined`.
    -   `pull` {Функция} Определяемая пользователем функция, которая вызывается многократно, когда внутренняя очередь `ReadableStream` не заполнена. Операция может быть синхронной или асинхронной. Если async, то функция не будет вызываться снова, пока не будет выполнено ранее возвращенное обещание.
        -   `controller` {ReadableStreamDefaultController|ReadableByteStreamController}
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `cancel` {Функция} Определяемая пользователем функция, которая вызывается при отмене `ReadableStream`.
        -   `reason` {любая}
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `type` {string} Должно быть `'bytes` или `undefined`.
    -   `autoAllocateChunkSize` {number} Используется только когда `type` равен `'bytes'`.
-   `strategy` {Object}
    -   `highWaterMark` {число} Максимальный размер внутренней очереди перед применением противодавления.
    -   `size` {Функция} Определяемая пользователем функция, используемая для определения размера каждого куска данных.
        -   `chunk` {любой}
        -   Возвращает: {число}

#### `readableStream.locked`

-   Тип: {boolean} Устанавливается в `true`, если существует активный читатель для данного {ReadableStream}.

По умолчанию свойство `readableStream.locked` имеет значение `false`, и переключается на `true`, если есть активный читатель, потребляющий данные потока.

#### `readableStream.cancel([reason])`

-   `reason` {любая}
-   Возвращает: Обещание, выполненное с `undefined` после завершения отмены.

#### `readableStream.getReader([options])`

-   `options` {Object}
    -   `mode` {строка} `'byob` или `undefined`
-   Возвращает: {ReadableStreamDefaultReader|ReadableStreamBYOBReader}

```mjs
import { ReadableStream } from 'node:stream/web';

const stream = new ReadableStream();
const reader = stream.getReader();

console.log(await reader.read());
```

```cjs
const { ReadableStream } = require('node:stream/web');

const stream = new ReadableStream();
const reader = stream.getReader();

reader.read().then(console.log);
```

Приводит `readableStream.locked` к значению `true`.

#### `readableStream.pipeThrough(transform[, options])`

-   `transform` {Object}
    -   `readable` {ReadableStream} `ReadableStream`, в который `transform.writable` будет пересылать потенциально измененные данные, полученные из этого `ReadableStream`.
    -   `writable` {WritableStream} `WritableStream`, в который будут записываться данные этого `ReadableStream`.
-   `options` {Object}
    -   `preventAbort` {boolean} Если `true`, ошибки в этом `ReadableStream` не приведут к прерыванию `transform.writable`.
    -   `preventCancel` {boolean} Когда `true`, ошибки в назначении `transform.writable` не приводят к отмене этого `ReadableStream`.
    -   `preventClose` {boolean} Если `true`, закрытие этого `ReadableStream` не приводит к закрытию `transform.writable`.
    -   `signal` {AbortSignal} Позволяет отменить передачу данных с помощью {AbortController}.
-   Возвращает: {ReadableStream} Из `transform.readable`.

Подключает этот {ReadableStream} к паре {ReadableStream} и {WritableStream}, указанной в аргументе `transform`, таким образом, что данные из этого {ReadableStream} записываются в `transform.writable`, возможно, трансформируются, затем выталкиваются в `transform.readable`. Когда конвейер настроен, возвращается `transform.readable`.

Заставляет `readableStream.locked` быть `true`, пока активна операция конвейера.

```mjs
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
```

```cjs
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
})();
```

#### `readableStream.pipeTo(destination[, options])`

-   `destination` {WritableStream} {WritableStream}, в который будут записаны данные этого `ReadableStream`.
-   `options` {Object}
    -   `preventAbort` {boolean} Если `true`, ошибки в этом `ReadableStream` не приведут к прерыванию `destination`.
    -   `preventCancel` {boolean} Когда `true`, ошибки в `назначении` не приведут к отмене этого `ReadableStream`.
    -   `preventClose` {boolean} Если `true`, закрытие этого `ReadableStream` не приведет к закрытию `destination`.
    -   `signal` {AbortSignal} Позволяет отменить передачу данных с помощью {AbortController}.
-   Возвращает: Обещание, выполненное с `undefined`.

Приводит `readableStream.locked` к значению `true`, пока активна операция pipe.

#### `readableStream.tee()`

-   Возвращает: {ReadableStream\[\]}

Возвращает пару новых экземпляров {ReadableStream}, которым будут переданы данные этого `ReadableStream`. Каждый из них будет получать одни и те же данные.

Приводит `readableStream.locked` к значению `true`.

#### `readableStream.values([options])`

-   `options` {Object}
    -   `preventCancel` {boolean} Если `true`, предотвращает закрытие {ReadableStream} при внезапном завершении асинхронного итератора. **По умолчанию**: `false`.

Создает и возвращает асинхронный итератор, пригодный для потребления данных этого `ReadableStream`.

Заставляет `readableStream.locked` быть `true`, пока активен асинхронный итератор.

```js
import { Buffer } from 'node:buffer';

const stream = new ReadableStream(getSomeSource());

for await (const chunk of stream.values({
    preventCancel: true,
}))
    console.log(Buffer.from(chunk).toString());
```

#### Асинхронная итерация

Объект {ReadableStream} поддерживает протокол асинхронного итератора, используя синтаксис `for await`.

```mjs
import { Buffer } from 'node:buffer';

const stream = new ReadableStream(getSomeSource());

for await (const chunk of stream)
    console.log(Buffer.from(chunk).toString());
```

Асинхронный итератор будет потреблять {ReadableStream} до тех пор, пока не завершится.

По умолчанию, если асинхронный итератор завершается раньше времени (через `break`, `return` или `throw`), {ReadableStream} будет закрыт. Чтобы предотвратить автоматическое закрытие {ReadableStream}, используйте метод `readableStream.values()` для получения асинхронного итератора и установите опцию `preventCancel` в `true`.

{ReadableStream} не должен быть заблокирован (то есть не должен иметь существующего активного читателя). Во время асинхронной итерации {ReadableStream} будет заблокирован.

#### Передача с помощью `postMessage()`

Экземпляр {ReadableStream} может быть передан с помощью {MessagePort}.

```js
const stream = new ReadableStream(
    getReadableSourceSomehow()
);

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => {
    data.getReader()
        .read()
        .then((chunk) => {
            console.log(chunk);
        });
};

port2.postMessage(stream, [stream]);
```

### Класс: `ReadableStreamDefaultReader`

По умолчанию вызов `readableStream.getReader()` без аргументов возвращает экземпляр `ReadableStreamDefaultReader`. Читатель по умолчанию рассматривает куски данных, передаваемые через поток, как непрозрачные значения, что позволяет {ReadableStream} работать с любыми значениями JavaScript.

#### `new ReadableStreamDefaultReader(stream)`

-   `stream` {ReadableStream}

Создает новый {ReadableStreamDefaultReader}, который привязан к заданному {ReadableStream}.

#### `readableStreamDefaultReader.cancel([reason])`

-   `reason` {любая}
-   Возвращает: Обещание, выполненное с `undefined`.

Отменяет {ReadableStream} и возвращает обещание, которое выполняется, если базовый поток был отменен.

#### `readableStreamDefaultReader.closed`

-   Тип: {Promise} Выполняется с `undefined`, когда связанный {ReadableStream} закрывается или отклоняется, если поток ошибается или блокировка читателя освобождается до завершения закрытия потока.

#### `readableStreamDefaultReader.read()`

-   Возвращает: Обещание, выполненное с объектом:
    -   `value` {ArrayBuffer}
    -   `done` {boolean}

Запрашивает следующий фрагмент данных из базового {ReadableStream} и возвращает обещание, которое будет выполнено с данными, как только они станут доступны.

#### `readableStreamDefaultReader.releaseLock()`

Освобождает блокировку этого читателя на базовом {ReadableStream}.

### Класс: `ReadableStreamBYOBReader`

`ReadableStreamBYOBReader` - это альтернативный потребитель для байт-ориентированных {ReadableStream} (тех, которые созданы с `underlyingSource.type`, установленным равным `'bytes'` при создании `ReadableStream`).

Аббревиатура `BYOB` означает "принеси свой собственный буфер". Это паттерн, позволяющий более эффективно читать байт-ориентированные данные, избегая лишнего копирования.

```mjs
import { open } from 'node:fs/promises';

import { ReadableStream } from 'node:stream/web';

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
        const { bytesRead } = await this.file.read({
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

-   `stream` {ReadableStream}

Создает новый `ReadableStreamBYOBReader`, который заблокирован на заданный {ReadableStream}.

#### `readableStreamBYOBReader.cancel([reason])`

-   `reason` {любая}
-   Возвращает: Обещание, выполненное с `undefined`.

Отменяет {ReadableStream} и возвращает обещание, которое выполняется, если базовый поток был отменен.

#### `readableStreamBYOBReader.closed`

-   Тип: {Promise} Выполняется с `undefined`, когда связанный {ReadableStream} закрывается или отклоняется, если поток ошибается или блокировка читателя освобождается до того, как поток завершит закрытие.

#### `readableStreamBYOBReader.read(view)`

-   `view` {Buffer|TypedArray|DataView}
-   Возвращает: Обещание, выполненное с объектом:
    -   `value` {ArrayBuffer}
    -   `done` {boolean}

Запрашивает следующий фрагмент данных из базового {ReadableStream} и возвращает обещание, которое будет выполнено с данными, как только они станут доступны.

Не передавайте в этот метод экземпляр объединенного объекта {Buffer}. Пулированные объекты `Buffer` создаются с помощью `Buffer.allocUnsafe()`, или `Buffer.from()`, или часто возвращаются различными обратными вызовами модуля `node:fs`. Эти типы `Buffer` используют общий базовый объект {ArrayBuffer}, который содержит все данные из всех объединенных экземпляров `Buffer`. Когда `Буфер`, {TypedArray} или {DataView} передается в `readableStreamBYOBReader.read()`, базовый `ArrayBuffer` представления _отсоединяется_, аннулируя все существующие представления, которые могут существовать на этом `ArrayBuffer`. Это может иметь катастрофические последствия для вашего приложения.

#### `readableStreamBYOBReader.releaseLock()`

Освобождает блокировку этого читателя на базовом {ReadableStream}.

### Класс: `ReadableStreamDefaultController`

Каждый {ReadableStream} имеет контроллер, который отвечает за внутреннее состояние и управление очередью потока. Контроллер `ReadableStreamDefaultController` является реализацией контроллера по умолчанию для `ReadableStream`, которые не являются байт-ориентированными.

#### `readableStreamDefaultController.close()`

Закрывает {ReadableStream}, с которым связан этот контроллер.

#### `readableStreamDefaultController.desiredSize`

-   Тип: {число}

Возвращает количество данных, оставшихся для заполнения очереди {ReadableStream}.

#### `readableStreamDefaultController.enqueue([chunk])`

-   `chunk` {любой}

Добавляет новый фрагмент данных в очередь {ReadableStream}.

#### `readableStreamDefaultController.error([error])`

-   `error` {любая}

Сигнализирует об ошибке, которая вызывает ошибку и закрытие {ReadableStream}.

### Класс: `ReadableByteStreamController`

Каждый {ReadableStream} имеет контроллер, который отвечает за внутреннее состояние и управление очередью потока. Контроллер `ReadableByteStreamController` предназначен для байт-ориентированных `ReadableStream`.

#### `readableByteStreamController.byobRequest`

-   Тип: {ReadableStreamBYOBRequest}

#### `readableByteStreamController.close()`

Закрывает {ReadableStream}, с которым связан этот контроллер.

#### `readableByteStreamController.desiredSize`

-   Тип: {число}

Возвращает количество данных, оставшихся для заполнения очереди {ReadableStream}.

#### `readableByteStreamController.enqueue(chunk)`

-   `chunk`: {Buffer|TypedArray|DataView}.

Добавляет новый фрагмент данных в очередь {ReadableStream}.

#### `readableByteStreamController.error([error])`

-   `error` {любая}

Сигнализирует об ошибке, которая вызывает ошибку и закрытие {ReadableStream}.

### Класс: `ReadableStreamBYOBRequest`

При использовании `ReadableByteStreamController` в байт-ориентированных потоках и при использовании `ReadableStreamBYOBReader`, свойство `readableByteStreamController.byobRequest` предоставляет доступ к экземпляру `ReadableStreamBYOBRequest`, который представляет текущий запрос на чтение. Объект используется для получения доступа к `ArrayBuffer`/`TypedArray`, который был предоставлен для заполнения запросу на чтение, и предоставляет методы для сигнализации о том, что данные были предоставлены.

#### `readableStreamBYOBRequest.respond(bytesWritten)`

-   `bytesWritten` {number}

Сигнализирует, что в `readableStreamBYOBRequest.view` было записано `bytesWritten` количество байт.

#### `readableStreamBYOBRequest.respondWithNewView(view)`

-   `view` {Buffer|TypedArray|DataView}

Сигнализирует, что запрос был выполнен с записью байтов в новый `Buffer`, `TypedArray` или `DataView`.

#### `readableStreamBYOBRequest.view`

-   Тип: {Buffer|TypedArray|DataView}

### Класс: `WritableStream`

`WritableStream` - это место назначения, куда отправляются потоковые данные.

```mjs
import { WritableStream } from 'node:stream/web';

const stream = new WritableStream({
    write(chunk) {
        console.log(chunk);
    },
});

await stream.getWriter().write('Hello World');
```

#### `new WritableStream([underlyingSink[, strategy]])`

-   `underlyingSink` {Объект}
    -   `start` {Функция} Определяемая пользователем функция, которая вызывается сразу после создания `WritableStream`.
        -   `controller` {WritableStreamDefaultController}
        -   Возвращает: `undefined` или обещание, выполненное с `undefined`.
    -   `write` {Function} Определяемая пользователем функция, которая вызывается, когда фрагмент данных был записан в `WritableStream`.
        -   `chunk` {любой}
        -   `controller` {WritableStreamDefaultController}
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `close` {Функция} Определяемая пользователем функция, которая вызывается при закрытии `WritableStream`.
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `abort` {Function} Определяемая пользователем функция, которая вызывается для резкого закрытия `WritableStream`.
        -   `reason` {любая}
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `type` {любой} Опция `type` зарезервирована для будущего использования и _должна_ быть неопределенной.
-   `strategy` {Object}
    -   `highWaterMark` {число} Максимальный размер внутренней очереди перед применением противодавления.
    -   `size` {Функция} Определяемая пользователем функция, используемая для определения размера каждого куска данных.
        -   `chunk` {любой}
        -   Возвращает: {число}

#### `writableStream.abort([reason])`

-   `reason` {любая}
-   Возвращает: Обещание, выполненное с `undefined`.

Резко завершает `WritableStream`. Все записи в очереди будут отменены, а связанные с ними обещания отклонены.

#### `writableStream.close()`

-   Возвращает: Обещание, выполненное с `undefined`.

Закрывает `WritableStream`, если не ожидается дополнительных записей.

#### `writableStream.getWriter()`

-   Возвращает: {WritableStreamDefaultWriter}.

Создает новый экземпляр писателя, который может быть использован для записи данных в `WritableStream`.

#### `writableStream.locked`

-   Тип: {boolean}

Свойство `writableStream.locked` по умолчанию имеет значение `false`, и переключается на `true`, если к данному `WritableStream` прикреплен активный писатель.

#### Передача с помощью postMessage()

Экземпляр {WritableStream} может быть передан с помощью {MessagePort}.

```js
const stream = new WritableStream(getWritableSinkSomehow());

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => {
    data.getWriter().write('hello');
};

port2.postMessage(stream, [stream]);
```

### Класс: `WritableStreamDefaultWriter`

#### `new WritableStreamDefaultWriter(stream)`

-   `поток` {WritableStream}

Создает новый `WritableStreamDefaultWriter`, который заблокирован для данного `WritableStream`.

#### `writableStreamDefaultWriter.abort([reason])`

-   `reason` {любая}
-   Возвращает: Обещание, выполненное с `undefined`.

Резко завершает `WritableStream`. Все записи в очереди будут отменены, а связанные с ними обещания отклонены.

#### `writableStreamDefaultWriter.close()`

-   Возвращает: Обещание, выполненное с `undefined`.

Закрывает `WritableStream`, если не ожидается дополнительных записей.

#### `writableStreamDefaultWriter.closed`

-   Тип: {Promise} Выполняется с `undefined`, когда связанный {WritableStream} закрывается или отклоняется, если поток ошибается или блокировка писателя освобождается до завершения закрытия потока.

#### `writableStreamDefaultWriter.desiredSize`

-   Тип: {число}

Количество данных, необходимое для заполнения очереди {WritableStream}.

#### `writableStreamDefaultWriter.ready`

-   тип: Обещание, которое выполняется с `undefined`, когда писатель готов к использованию.

#### `writableStreamDefaultWriter.releaseLock()`

Освобождает блокировку этого писателя на базовом {ReadableStream}.

#### `writableStreamDefaultWriter.write([chunk])`

-   `chunk`: {любой}
-   Возвращает: Обещание, выполненное с `undefined`.

Добавляет новый фрагмент данных в очередь {WritableStream}.

### Класс: `WritableStreamDefaultController`

Контроллер `WritableStreamDefaultController` управляет внутренним состоянием {WritableStream}.

#### `writableStreamDefaultController.error([error])`

-   `error` {любая}

Вызывается пользовательским кодом для сигнализации о том, что произошла ошибка при обработке данных `WritableStream`. После вызова {WritableStream} будет прерван, а текущие записи будут отменены.

#### `writableStreamDefaultController.signal`

-   Тип: {AbortSignal} Сигнал `AbortSignal`, который можно использовать для отмены ожидающих операций записи или закрытия, когда {WritableStream} прерывается.

### Класс: `TransformStream`

Поток `TransformStream` состоит из {ReadableStream} и {WritableStream}, которые соединены таким образом, что данные, записанные в `WritableStream`, принимаются и потенциально преобразуются, прежде чем попасть в очередь `ReadableStream`.

```mjs
import { TransformStream } from 'node:stream/web';

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

-   `transformer` {Объект}
    -   `start` {Функция} Определяемая пользователем функция, которая вызывается сразу после создания `TransformStream`.
        -   `controller` {TransformStreamDefaultController}
        -   Возвращает: `undefined` или обещание, выполненное с `undefined`.
    -   `transform` {Function} Определяемая пользователем функция, которая получает и потенциально изменяет фрагмент данных, записанный в `transformStream.writable`, перед тем как передать его в `transformStream.readable`.
        -   `chunk` {любой}
        -   `контроллер` {TransformStreamDefaultController}
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `flush` {Функция} Определяемая пользователем функция, которая вызывается непосредственно перед закрытием записываемой стороны `TransformStream`, сигнализируя об окончании процесса преобразования.
        -   `controller` {TransformStreamDefaultController}
        -   Возвращает: Обещание, выполненное с `undefined`.
    -   `readableType` {любой} Опция `readableType` зарезервирована для будущего использования и _должна_ быть `undefined`.
    -   `writableType` {любой} опция `writableType` зарезервирована для будущего использования и _должна_ быть `undefined`.
-   `writableStrategy` {Object}
    -   `highWaterMark` {число} Максимальный размер внутренней очереди перед применением противодавления.
    -   `size` {Функция} Определяемая пользователем функция, используемая для определения размера каждого куска данных.
        -   `chunk` {любой}
        -   Возвращает: {число}
-   `readableStrategy` {Object}
    -   `highWaterMark` {число} Максимальный размер внутренней очереди перед применением обратного давления.
    -   `size` {Функция} Определяемая пользователем функция, используемая для определения размера каждого куска данных.
        -   `chunk` {любой}
        -   Возвращает: {число}

#### `transformStream.readable`

-   Тип: {ReadableStream}

#### `transformStream.writable`

-   Тип: {WritableStream}

#### Передача с помощью postMessage()

Экземпляр {TransformStream} может быть передан с помощью {MessagePort}.

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

Контроллер `TransformStreamDefaultController` управляет внутренним состоянием `TransformStream`.

#### `transformStreamDefaultController.desiredSize`

-   Тип: {число}

Количество данных, необходимое для заполнения очереди читаемой стороны.

#### `transformStreamDefaultController.enqueue([chunk])`

-   `chunk` {любой}

Добавляет фрагмент данных в очередь читаемой стороны.

#### `transformStreamDefaultController.error([reason])`

-   `reason` {любая}

Сигнализирует как читаемой, так и записываемой стороне, что при обработке данных преобразования произошла ошибка, в результате чего обе стороны будут резко закрыты.

#### `transformStreamDefaultController.terminate()`

Закрывает доступную для чтения сторону транспорта и вызывает резкое закрытие доступной для записи стороны с ошибкой.

### Класс: `ByteLengthQueuingStrategy`

#### `new ByteLengthQueuingStrategy(options)`

-   `options` {Object}
    -   `highWaterMark` {number}

#### `byteLengthQueuingStrategy.highWaterMark`

-   Тип: {число}

#### `byteLengthQueuingStrategy.size`

-   Тип: {Function}
    -   `chunk` {любой}
    -   Возвращает: {число}

### Класс: `CountQueuingStrategy`

#### `new CountQueuingStrategy(options)`

-   `options` {Object}
    -   `highWaterMark` {number}

#### `countQueuingStrategy.highWaterMark`

-   Тип: {число}

#### `countQueuingStrategy.size`

-   Тип: {Function}
    -   `chunk` {любой}
    -   Возвращает: {число}

### Класс: `TextEncoderStream`

#### `new TextEncoderStream()`

Создает новый экземпляр `TextEncoderStream`.

#### `textEncoderStream.encoding`

-   Тип: {строка}

Кодировка, поддерживаемая экземпляром `TextEncoderStream`.

#### `textEncoderStream.readable`

-   Тип: {ReadableStream}

#### `textEncoderStream.writable`

-   Тип: {WritableStream}

### Класс: `TextDecoderStream`

#### `new TextDecoderStream([encoding[, options]])`

-   `encoding` {string} Определяет `кодировку`, которую поддерживает данный экземпляр `текстового декодера`. **По умолчанию:** `'utf-8'`.
-   `options` {Object}
    -   `fatal` {boolean} `true`, если сбои декодирования являются фатальными.
    -   `ignoreBOM` {boolean} Когда `true`, `TextDecoderStream` будет включать метку порядка байтов в результат декодирования. При `false` метка порядка байтов будет удалена из результата. Эта опция используется, только если `encoding` - `'utf-8'`, `'utf-16be'` или `'utf-16le'`. **По умолчанию:** `false`.

Создает новый экземпляр `TextDecoderStream`.

#### `textDecoderStream.encoding`

-   Тип: {строка}

Кодировка, поддерживаемая экземпляром `TextDecoderStream`.

#### `textDecoderStream.fatal`

-   Тип: {boolean}

Значение будет `true`, если в результате ошибок декодирования будет выброшена `TypeError`.

#### `textDecoderStream.ignoreBOM`

-   Тип: {boolean}

Значение будет `true`, если результат декодирования будет включать метку порядка байтов.

#### `textDecoderStream.readable`

-   Тип: {ReadableStream}

#### `textDecoderStream.writable`

-   Тип: {WritableStream}

### Класс: `CompressionStream`

#### `new CompressionStream(format)`

-   `format` {строка} Один из `deflate` или `gzip`.

#### `compressionStream.readable`

-   Тип: {ReadableStream}

#### `compressionStream.writable`

-   Тип: {WritableStream}

### Класс: `DecompressionStream`

#### `new DecompressionStream(format)`

-   `format` {строка} Один из `deflate` или `gzip`.

#### `decompressionStream.readable`

-   Тип: {ReadableStream}

#### `decompressionStream.writable`

-   Тип: {WritableStream}

### Утилитарные потребители

Утилитарные потребительские функции предоставляют общие возможности для потребления потоков.

Доступ к ним осуществляется с помощью:

```mjs
import {
    arrayBuffer,
    blob,
    buffer,
    json,
    text,
} from 'node:stream/consumers';
```

```cjs
const {
    arrayBuffer,
    blob,
    buffer,
    json,
    text,
} = require('node:stream/consumers');
```

#### `streamConsumers.arrayBuffer(stream)`

-   `stream` {ReadableStream|stream.Readable|AsyncIterator}
-   Возвращает: {Promise} Выполняется с `ArrayBuffer`, содержащим полное содержимое потока.

```mjs
import { buffer as arrayBuffer } from 'node:stream/consumers';
import { Readable } from 'node:stream';
import { TextEncoder } from 'node:util';

const encoder = new TextEncoder();
const dataArray = encoder.encode(
    'привет миру от потребителей!'
);

const readable = Readable.from(dataArray);
const data = await arrayBuffer(readable);
console.log(`из readable: ${data.byteLength}`);
```

```cjs
const { arrayBuffer } = require('node:stream/consumers');
const { Readable } = require('node:stream');
const { TextEncoder } = require('node:util');

const encoder = new TextEncoder();
const dataArray = encoder.encode(
    'hello world from consumers!'
);
const readable = Readable.from(dataArray);
arrayBuffer(readable).then((data) => {
    console.log(`из readable: ${data.byteLength}`);
});
```

#### `streamConsumers.blob(stream)`

-   `stream` {ReadableStream|stream.Readable|AsyncIterator}
-   Возвращает: {Promise} Выполняется с помощью {Blob}, содержащего полное содержимое потока.

```mjs
import { blob } from 'node:stream/consumers';

const dataBlob = new Blob(['hello world from consumers!']);

const readable = dataBlob.stream();
const data = await blob(readable);
console.log(`из readable: ${data.size}`);
```

```cjs
const { blob } = require('node:stream/consumers');

const dataBlob = new Blob(['hello world from consumers!']);

const readable = dataBlob.stream();
blob(readable).then((data) => {
    console.log(`из readable: ${data.size}`);
});
```

#### `streamConsumers.buffer(stream)`

-   `stream` {ReadableStream|stream.Readable|AsyncIterator}
-   Возвращает: {Promise} Выполняется с {Buffer}, содержащим полное содержимое потока.

```mjs
import { buffer } from 'node:stream/consumers';
import { Readable } from 'node:stream';
import { Buffer } from 'node:buffer';

const dataBuffer = Buffer.from(
    'hello world from consumers!'
);

const readable = Readable.from(dataBuffer);
const data = await buffer(readable);
console.log(`из readable: ${data.length}`);
```

```cjs
const { buffer } = require('node:stream/consumers');
const { Readable } = require('node:stream');
const { Buffer } = require('node:buffer');

const dataBuffer = Buffer.from(
    'привет миру от потребителей!'
);

const readable = Readable.from(dataBuffer);
buffer(readable).then((data) => {
    console.log(`из readable: ${data.length}`);
});
```

#### `streamConsumers.json(stream)`

-   `stream` {ReadableStream|stream.Readable|AsyncIterator}
-   Возвращает: {Promise} Выполняется с содержимым потока, разобранным как строка в кодировке UTF-8, которая затем передается через `JSON.parse()`.

```mjs
import { json } from 'node:stream/consumers';
import { Readable } from 'node:stream';

const items = Array.from(
    {
        length: 100,
    },
    () => ({
        сообщение: 'hello world from consumers!',
    })
);

const readable = Readable.from(JSON.stringify(items));
const data = await json(readable);
console.log(`из readable: ${data.length}`);
```

```cjs
const { json } = require('node:stream/consumers');
const { Readable } = require('node:stream');

const items = Array.from(
    {
        length: 100,
    },
    () => ({
        сообщение: 'hello world from consumers!',
    })
);

const readable = Readable.from(JSON.stringify(items));
json(readable).then((data) => {
    console.log(`из readable: ${data.length}`);
});
```

#### `streamConsumers.text(stream)`

-   `stream` {ReadableStream|stream.Readable|AsyncIterator}
-   Возвращает: {Promise} Выполняется с содержимым потока, разобранным как строка в кодировке UTF-8.

```mjs
import { text } from 'node:stream/consumers';
import { Readable } from 'node:stream';

const readable = Readable.from(
    'Hello world from consumers!'
);
const data = await text(readable);
console.log(`from readable: ${data.length}`);
```

```cjs
const { text } = require('node:stream/consumers');
const { Readable } = require('node:stream');

const readable = Readable.from(
    'Привет миру от потребителей!'
);
text(readable).then((data) => {
    console.log(`из readable: ${data.length}`);
});
```

<!-- 0104.part.md -->
