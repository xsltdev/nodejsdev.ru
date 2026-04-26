---
title: Потоки worker
description: Модуль node:worker_threads — потоки выполнения JavaScript в параллели, общая память, MessagePort, Worker и BroadcastChannel
---

# Потоки worker (worker_threads) {#worker-threads}

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:worker_threads` позволяет использовать потоки, в которых выполняется JavaScript параллельно. Подключение:

=== "MJS"

    ```js
    import worker_threads from 'node:worker_threads';
    ```

=== "CJS"

    ```js
    'use strict';

    const worker_threads = require('node:worker_threads');
    ```

Потоки worker полезны для вычислительно тяжёлого кода на JavaScript. Для I/O-нагрузки они мало что дают: встроенные в Node.js асинхронные операции ввода-вывода обычно эффективнее.

В отличие от `child_process` или `cluster`, `worker_threads` могут разделять память — передавая экземпляры `ArrayBuffer` или используя общий `SharedArrayBuffer`.

=== "MJS"

    ```js
    import {
      Worker,
      isMainThread,
      parentPort,
      workerData,
    } from 'node:worker_threads';

    if (!isMainThread) {
      const { parse } = await import('some-js-parsing-library');
      const script = workerData;
      parentPort.postMessage(parse(script));
    }

    export default function parseJSAsync(script) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(new URL(import.meta.url), {
          workerData: script,
        });
        worker.on('message', resolve);
        worker.once('error', reject);
        worker.once('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    };
    ```

=== "CJS"

    ```js
    'use strict';

    const {
      Worker,
      isMainThread,
      parentPort,
      workerData,
    } = require('node:worker_threads');

    if (isMainThread) {
      module.exports = function parseJSAsync(script) {
        return new Promise((resolve, reject) => {
          const worker = new Worker(__filename, {
            workerData: script,
          });
          worker.on('message', resolve);
          worker.once('error', reject);
          worker.once('exit', (code) => {
            if (code !== 0)
              reject(new Error(`Worker stopped with exit code ${code}`));
          });
        });
      };
    } else {
      const { parse } = require('some-js-parsing-library');
      const script = workerData;
      parentPort.postMessage(parse(script));
    }
    ```

В примере на каждый вызов `parseJSAsync()` создаётся новый поток Worker. На практике для таких задач используйте пул worker’ов — иначе накладные расходы на создание потоков могут перевесить пользу.

Реализуя пул, применяйте API [`AsyncResource`](async_hooks.md#class-asyncresource), чтобы диагностические инструменты (например трассировки асинхронного стека) видели связь задач с результатами. Пример — в разделе [«Использование `AsyncResource` для пула потоков `Worker`»](async_context.md#using-asyncresource-for-a-worker-thread-pool) документации `async_hooks`.

Потоки worker по умолчанию наследуют опции, не зависящие от процесса. См. [параметры конструктора `Worker`](#new-workerfilename-options) — настройка `argv` и `execArgv`.

## `worker_threads.getEnvironmentData(key)`

-   `key` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение JavaScript, пригодное в качестве ключа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

В потоке worker `worker.getEnvironmentData()` возвращает клон данных, переданных через `worker.setEnvironmentData()` породившего потока. Каждый новый `Worker` автоматически получает свою копию этих данных.

=== "MJS"

    ```js
    import {
      Worker,
      isMainThread,
      setEnvironmentData,
      getEnvironmentData,
    } from 'node:worker_threads';

    if (isMainThread) {
      setEnvironmentData('Hello', 'World!');
      const worker = new Worker(new URL(import.meta.url));
    } else {
      console.log(getEnvironmentData('Hello'));  // Выводит 'World!'.
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const {
      Worker,
      isMainThread,
      setEnvironmentData,
      getEnvironmentData,
    } = require('node:worker_threads');

    if (isMainThread) {
      setEnvironmentData('Hello', 'World!');
      const worker = new Worker(__filename);
    } else {
      console.log(getEnvironmentData('Hello'));  // Выводит 'World!'.
    }
    ```

## `worker_threads.isInternalThread`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если этот код выполняется во внутреннем потоке [`Worker`](#class-worker) (например, в потоке загрузчика).

```bash
node --experimental-loader ./loader.js main.js
```

=== "MJS"

    ```js
    // файл loader.js
    import { isInternalThread } from 'node:worker_threads';
    console.log(isInternalThread);  // выводит true
    ```

=== "CJS"

    ```js
    // файл loader.js
    'use strict';

    const { isInternalThread } = require('node:worker_threads');
    console.log(isInternalThread);  // выводит true
    ```

---

=== "MJS"

    ```js
    // файл main.js
    import { isInternalThread } from 'node:worker_threads';
    console.log(isInternalThread);  // выводит false
    ```

=== "CJS"

    ```js
    // файл main.js
    'use strict';

    const { isInternalThread } = require('node:worker_threads');
    console.log(isInternalThread);  // выводит false
    ```

## `worker_threads.isMainThread` {#worker_threadsismainthread}

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если этот код выполняется не в потоке [`Worker`](#class-worker).

=== "MJS"

    ```js
    import { Worker, isMainThread } from 'node:worker_threads';

    if (isMainThread) {
      // Снова загружает текущий файл внутри экземпляра Worker.
      new Worker(new URL(import.meta.url));
    } else {
      console.log('Inside Worker!');
      console.log(isMainThread);  // Выводит 'false'.
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const { Worker, isMainThread } = require('node:worker_threads');

    if (isMainThread) {
      // Снова загружает текущий файл внутри экземпляра Worker.
      new Worker(__filename);
    } else {
      console.log('Inside Worker!');
      console.log(isMainThread);  // Выводит 'false'.
    }
    ```

## `worker_threads.markAsUntransferable(object)` {#worker_threadsmarkasuntransferableobject}

-   `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное значение JavaScript.

Помечает объект как непередаваемый. Если `object` попадает в список передачи вызова [`port.postMessage()`](#portpostmessagevalue-transferlist), выбрасывается ошибка. Для примитивных значений `object` ничего не делает.

Это уместно для объектов, которые клонируются, а не передаются, и используются другими объектами на стороне отправителя. Например, Node.js помечает так `ArrayBuffer`, используемые для [`Buffer` pool](buffer.md#static-method-bufferallocunsafesize). `ArrayBuffer.prototype.transfer()` для таких буферов запрещён.

Эту операцию нельзя отменить.

=== "MJS"

    ```js
    import { MessageChannel, markAsUntransferable } from 'node:worker_threads';

    const pooledBuffer = new ArrayBuffer(8);
    const typedArray1 = new Uint8Array(pooledBuffer);
    const typedArray2 = new Float64Array(pooledBuffer);

    markAsUntransferable(pooledBuffer);

    const { port1 } = new MessageChannel();
    try {
      // Здесь будет ошибка: pooledBuffer нельзя передать (transfer).
      port1.postMessage(typedArray1, [ typedArray1.buffer ]);
    } catch (error) {
      // у ошибки: error.name === 'DataCloneError'
    }

    // Следующая строка выводит содержимое typedArray1 — буфер по-прежнему
    // принадлежит ему и не был передан. Без markAsUntransferable() здесь
    // вывелся бы пустой Uint8Array, а вызов postMessage прошёл бы успешно.
    // typedArray2 тоже остаётся в порядке.
    console.log(typedArray1);
    console.log(typedArray2);
    ```

=== "CJS"

    ```js
    'use strict';

    const { MessageChannel, markAsUntransferable } = require('node:worker_threads');

    const pooledBuffer = new ArrayBuffer(8);
    const typedArray1 = new Uint8Array(pooledBuffer);
    const typedArray2 = new Float64Array(pooledBuffer);

    markAsUntransferable(pooledBuffer);

    const { port1 } = new MessageChannel();
    try {
      // Здесь будет ошибка: pooledBuffer нельзя передать (transfer).
      port1.postMessage(typedArray1, [ typedArray1.buffer ]);
    } catch (error) {
      // у ошибки: error.name === 'DataCloneError'
    }

    // Следующая строка выводит содержимое typedArray1 — буфер по-прежнему
    // принадлежит ему и не был передан. Без markAsUntransferable() здесь
    // вывелся бы пустой Uint8Array, а вызов postMessage прошёл бы успешно.
    // typedArray2 тоже остаётся в порядке.
    console.log(typedArray1);
    console.log(typedArray2);
    ```

В браузерах аналога этого API нет.

## `worker_threads.isMarkedAsUntransferable(object)`

-   `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое значение JavaScript.
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, помечен ли объект как непередаваемый через [`markAsUntransferable()`](#worker_threadsmarkasuntransferableobject).

=== "MJS"

    ```js
    import { markAsUntransferable, isMarkedAsUntransferable } from 'node:worker_threads';

    const pooledBuffer = new ArrayBuffer(8);
    markAsUntransferable(pooledBuffer);

    isMarkedAsUntransferable(pooledBuffer);  // возвращает true.
    ```

=== "CJS"

    ```js
    'use strict';

    const { markAsUntransferable, isMarkedAsUntransferable } = require('node:worker_threads');

    const pooledBuffer = new ArrayBuffer(8);
    markAsUntransferable(pooledBuffer);

    isMarkedAsUntransferable(pooledBuffer);  // возвращает true.
    ```

В браузерах аналога этого API нет.

## `worker_threads.markAsUncloneable(object)`

-   `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное значение JavaScript.

Помечает объект как неклонируемый. Если `object` используется как [`message`](#event-message) в вызове [`port.postMessage()`](#portpostmessagevalue-transferlist), выбрасывается ошибка. Для примитивных значений `object` ничего не делает.

Это не действует на `ArrayBuffer` и объекты, похожие на `Buffer`.

Эту операцию нельзя отменить.

=== "MJS"

    ```js
    import { markAsUncloneable } from 'node:worker_threads';

    const anyObject = { foo: 'bar' };
    markAsUncloneable(anyObject);
    const { port1 } = new MessageChannel();
    try {
      // Здесь будет ошибка: anyObject нельзя клонировать.
      port1.postMessage(anyObject);
    } catch (error) {
      // у ошибки: error.name === 'DataCloneError'
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const { markAsUncloneable } = require('node:worker_threads');

    const anyObject = { foo: 'bar' };
    markAsUncloneable(anyObject);
    const { port1 } = new MessageChannel();
    try {
      // Здесь будет ошибка: anyObject нельзя клонировать.
      port1.postMessage(anyObject);
    } catch (error) {
      // у ошибки: error.name === 'DataCloneError'
    }
    ```

В браузерах аналога этого API нет.

## `worker_threads.moveMessagePortToContext(port, contextifiedSandbox)`

-   `port` [`<MessagePort>`](worker_threads.md#class-messageport) Передаваемый порт сообщений.

-   `contextifiedSandbox` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [контекстифицированный](vm.md#what-does-it-mean-to-contextify-an-object) объект, возвращённый методом `vm.createContext()`.

-   Возвращает: [`<MessagePort>`](worker_threads.md#class-messageport)

Передаёт `MessagePort` в другой [`vm`](vm.md) Context. Исходный объект `port` становится непригодным, на его месте используется возвращённый `MessagePort`.

Возвращённый `MessagePort` — объект в целевом контексте и наследует глобальный класс `Object`. Объекты, передаваемые в слушатель [`port.onmessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event), тоже создаются в целевом контексте и наследуют его глобальный класс `Object`.

Однако созданный `MessagePort` больше не наследует [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget), для получения событий можно использовать только [`port.onmessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event).

## `worker_threads.parentPort` {#worker_threadsparentport}

-   Тип: null | [`<MessagePort>`](worker_threads.md#class-messageport)

Если этот поток — [`Worker`](#class-worker), это [`MessagePort`](#class-messageport) для связи с родительским потоком. Сообщения, отправленные через `parentPort.postMessage()`, доступны родителю в `worker.on('message')`, а сообщения от родителя через `worker.postMessage()` — в этом потоке в `parentPort.on('message')`.

=== "MJS"

    ```js
    import { Worker, isMainThread, parentPort } from 'node:worker_threads';

    if (isMainThread) {
      const worker = new Worker(new URL(import.meta.url));
      worker.once('message', (message) => {
        console.log(message);  // Выводит 'Hello, world!'.
      });
      worker.postMessage('Hello, world!');
    } else {
      // При сообщении от родительского потока отправляем его обратно:
      parentPort.once('message', (message) => {
        parentPort.postMessage(message);
      });
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const { Worker, isMainThread, parentPort } = require('node:worker_threads');

    if (isMainThread) {
      const worker = new Worker(__filename);
      worker.once('message', (message) => {
        console.log(message);  // Выводит 'Hello, world!'.
      });
      worker.postMessage('Hello, world!');
    } else {
      // При сообщении от родительского потока отправляем его обратно:
      parentPort.once('message', (message) => {
        parentPort.postMessage(message);
      });
    }
    ```

## `worker_threads.postMessageToThread(threadId, value[, transferList][, timeout])`

> Стабильность: 1.1 – Активная разработка

-   `threadId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID целевого потока. Если ID недействителен, выбрасывается [`ERR_WORKER_MESSAGING_FAILED`](errors.md#err_worker_messaging_failed). Если ID совпадает с текущим потоком, выбрасывается [`ERR_WORKER_MESSAGING_SAME_THREAD`](errors.md#err_worker_messaging_same_thread).
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Отправляемое значение.
-   `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если в `value` передаются один или несколько объектов, похожих на `MessagePort`, для них нужен `transferList`, иначе выбрасывается [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](errors.md#err_missing_message_port_in_transfer_list). См. [`port.postMessage()`](#portpostmessagevalue-transferlist).
-   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидание доставки сообщения в миллисекундах. **По умолчанию:** `undefined` — ждать бесконечно. При таймауте выбрасывается [`ERR_WORKER_MESSAGING_TIMEOUT`](errors.md#err_worker_messaging_timeout).
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис выполняется, если целевой поток успешно обработал сообщение.

Отправляет значение другому worker, определяемому по ID потока.

Если в целевом потоке нет слушателя события `workerMessage`, выбрасывается [`ERR_WORKER_MESSAGING_FAILED`](errors.md#err_worker_messaging_failed).

Если целевой поток выбросил ошибку при обработке `workerMessage`, выбрасывается [`ERR_WORKER_MESSAGING_ERRORED`](errors.md#err_worker_messaging_errored).

Этот метод нужен, когда целевой поток не является прямым родителем или дочерним для текущего. Если потоки в отношении родитель–дочерний, используйте [`require('node:worker_threads').parentPort.postMessage()`](#workerpostmessagevalue-transferlist) и [`worker.postMessage()`](#workerpostmessagevalue-transferlist).

Ниже пример `postMessageToThread`: создаётся 10 вложенных потоков, последний пытается связаться с главным потоком.

=== "MJS"

    ```js
    import process from 'node:process';
    import {
      postMessageToThread,
      threadId,
      workerData,
      Worker,
    } from 'node:worker_threads';

    const channel = new BroadcastChannel('sync');
    const level = workerData?.level ?? 0;

    if (level < 10) {
      const worker = new Worker(new URL(import.meta.url), {
        workerData: { level: level + 1 },
      });
    }

    if (level === 0) {
      process.on('workerMessage', (value, source) => {
        console.log(`${source} -> ${threadId}:`, value);
        postMessageToThread(source, { message: 'pong' });
      });
    } else if (level === 10) {
      process.on('workerMessage', (value, source) => {
        console.log(`${source} -> ${threadId}:`, value);
        channel.postMessage('done');
        channel.close();
      });

      await postMessageToThread(0, { message: 'ping' });
    }

    channel.onmessage = channel.close;
    ```

=== "CJS"

    ```js
    'use strict';

    const process = require('node:process');
    const {
      postMessageToThread,
      threadId,
      workerData,
      Worker,
    } = require('node:worker_threads');

    const channel = new BroadcastChannel('sync');
    const level = workerData?.level ?? 0;

    if (level < 10) {
      const worker = new Worker(__filename, {
        workerData: { level: level + 1 },
      });
    }

    if (level === 0) {
      process.on('workerMessage', (value, source) => {
        console.log(`${source} -> ${threadId}:`, value);
        postMessageToThread(source, { message: 'pong' });
      });
    } else if (level === 10) {
      process.on('workerMessage', (value, source) => {
        console.log(`${source} -> ${threadId}:`, value);
        channel.postMessage('done');
        channel.close();
      });

      postMessageToThread(0, { message: 'ping' });
    }

    channel.onmessage = channel.close;
    ```

## `worker_threads.receiveMessageOnPort(port)`

-   `port` [`<MessagePort>`](worker_threads.md#class-messageport) | [`<BroadcastChannel>`](worker_threads.md)

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined

Принимает одно сообщение из `MessagePort`. Если сообщений нет, возвращается `undefined`, иначе объект с полем `message` с полезной нагрузкой — самое старое сообщение в очереди `MessagePort`.

=== "MJS"

    ```js
    import { MessageChannel, receiveMessageOnPort } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();
    port1.postMessage({ hello: 'world' });

    console.log(receiveMessageOnPort(port2));
    // Вывод: { message: { hello: 'world' } }
    console.log(receiveMessageOnPort(port2));
    // Вывод: undefined
    ```

=== "CJS"

    ```js
    'use strict';

    const { MessageChannel, receiveMessageOnPort } = require('node:worker_threads');
    const { port1, port2 } = new MessageChannel();
    port1.postMessage({ hello: 'world' });

    console.log(receiveMessageOnPort(port2));
    // Вывод: { message: { hello: 'world' } }
    console.log(receiveMessageOnPort(port2));
    // Вывод: undefined
    ```

При использовании этой функции событие `'message'` не генерируется и слушатель `onmessage` не вызывается.

## `worker_threads.resourceLimits`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт ограничения ресурсов JS-движка в этом потоке Worker. Если в конструктор [`Worker`](#class-worker) передавалась опция `resourceLimits`, значения совпадают с ней.

В главном потоке значение — пустой объект.

## `worker_threads.SHARE_ENV` {#worker_threadsshare_env}

-   Тип: [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)

Специальное значение для опции `env` конструктора [`Worker`](#class-worker): текущий поток и поток Worker совместно читают и изменяют один и тот же набор переменных окружения.

=== "MJS"

    ```js
    import process from 'node:process';
    import { Worker, SHARE_ENV } from 'node:worker_threads';
    new Worker('process.env.SET_IN_WORKER = "foo"', { eval: true, env: SHARE_ENV })
      .once('exit', () => {
        console.log(process.env.SET_IN_WORKER);  // Выводит 'foo'.
      });
    ```

=== "CJS"

    ```js
    'use strict';

    const { Worker, SHARE_ENV } = require('node:worker_threads');
    new Worker('process.env.SET_IN_WORKER = "foo"', { eval: true, env: SHARE_ENV })
      .once('exit', () => {
        console.log(process.env.SET_IN_WORKER);  // Выводит 'foo'.
      });
    ```

## `worker_threads.setEnvironmentData(key[, value])`

-   `key` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение JavaScript, пригодное в качестве ключа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение; клонируется и автоматически передаётся всем новым `Worker`. Если передать `undefined`, ранее заданное значение для `key` удаляется.

API `worker.setEnvironmentData()` задаёт содержимое `worker.getEnvironmentData()` в текущем потоке и во всех новых `Worker`, созданных из текущего контекста.

## `worker_threads.threadId` {#worker_threadsthreadid}

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор текущего потока. На соответствующем объекте worker (если есть) доступен как [`worker.threadId`](#workerthreadid). Уникален для каждого [`Worker`](#class-worker) в одном процессе.

## `worker_threads.threadName` {#worker_threadsthreadname}

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строковый идентификатор текущего потока или `null`, если поток не выполняется. На соответствующем объекте worker (если есть) доступен как [`worker.threadName`](#workerthreadname).

## `worker_threads.workerData` {#worker_threadsworkerdata}

Произвольное значение JavaScript — клон данных, переданных в конструктор `Worker` этого потока.

Данные клонируются как при [`postMessage()`](#portpostmessagevalue-transferlist), по [алгоритму структурированного клонирования HTML](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

=== "MJS"

    ```js
    import { Worker, isMainThread, workerData } from 'node:worker_threads';

    if (isMainThread) {
      const worker = new Worker(new URL(import.meta.url), { workerData: 'Hello, world!' });
    } else {
      console.log(workerData);  // Выводит 'Hello, world!'.
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const { Worker, isMainThread, workerData } = require('node:worker_threads');

    if (isMainThread) {
      const worker = new Worker(__filename, { workerData: 'Hello, world!' });
    } else {
      console.log(workerData);  // Выводит 'Hello, world!'.
    }
    ```

## `worker_threads.locks`

> Стабильность: 1 – Экспериментальная

-   [LockManager](worker_threads.md#class-lockmanager)

Экземпляр [`LockManager`](#class-lockmanager) для координации доступа к ресурсам, общим для нескольких потоков одного процесса. Семантика соответствует [браузерному `LockManager`](https://developer.mozilla.org/en-US/docs/Web/API/LockManager)

### Класс: `Lock`

Интерфейс `Lock` описывает блокировку, выданную через [`locks.request()`](#locksrequestname-options-callback)

#### `lock.name`

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя блокировки.

#### `lock.mode`

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Режим блокировки: `shared` или `exclusive`.

### Класс: `LockManager` {#class-lockmanager}

Интерфейс `LockManager` предоставляет методы запроса и просмотра блокировок. Экземпляр `LockManager` получают так:

=== "MJS"

    ```js
    import { locks } from 'node:worker_threads';
    ```

=== "CJS"

    ```js
    'use strict';

    const { locks } = require('node:worker_threads');
    ```

Реализация соответствует API [browser `LockManager`](https://developer.mozilla.org/en-US/docs/Web/API/LockManager).

#### `locks.request(name[, options], callback)` {#locksrequestname-options-callback}

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'exclusive'` или `'shared'`. **По умолчанию:** `'exclusive'`.
    -   `ifAvailable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, запрос удовлетворяется только если блокировка ещё не удерживается. Иначе `callback` вызывается с `null` вместо `Lock`. **По умолчанию:** `false`.
    -   `steal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, существующие блокировки с тем же именем снимаются и запрос выполняется сразу, опережая очередь. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) для отмены ожидающего (ещё не выданного) запроса блокировки.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после выдачи блокировки (или сразу с `null`, если `ifAvailable` равен `true` и блокировка недоступна). Блокировка снимается при возврате из функции или, если возвращается промис, после его завершения.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется после снятия блокировки.

=== "MJS"

    ```js
    import { locks } from 'node:worker_threads';

    await locks.request('my_resource', async (lock) => {
      // Блокировка получена.
    });
    // Здесь блокировка уже снята.
    ```

=== "CJS"

    ```js
    'use strict';

    const { locks } = require('node:worker_threads');

    locks.request('my_resource', async (lock) => {
      // Блокировка получена.
    }).then(() => {
      // Здесь блокировка уже снята.
    });
    ```

#### `locks.query()`

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Выполняется с `LockManagerSnapshot` с текущими удерживаемыми и ожидающими блокировками для процесса.

=== "MJS"

    ```js
    import { locks } from 'node:worker_threads';

    const snapshot = await locks.query();
    for (const lock of snapshot.held) {
      console.log(`held lock: name ${lock.name}, mode ${lock.mode}`);
    }
    for (const pending of snapshot.pending) {
      console.log(`pending lock: name ${pending.name}, mode ${pending.mode}`);
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const { locks } = require('node:worker_threads');

    locks.query().then((snapshot) => {
      for (const lock of snapshot.held) {
        console.log(`held lock: name ${lock.name}, mode ${lock.mode}`);
      }
      for (const pending of snapshot.pending) {
        console.log(`pending lock: name ${pending.name}, mode ${pending.mode}`);
      }
    });
    ```

## Класс: `BroadcastChannel extends EventTarget`

Экземпляры `BroadcastChannel` обеспечивают асинхронную связь «один ко многим» со всеми `BroadcastChannel` с тем же именем канала.

=== "MJS"

    ```js
    import {
      isMainThread,
      BroadcastChannel,
      Worker,
    } from 'node:worker_threads';

    const bc = new BroadcastChannel('hello');

    if (isMainThread) {
      let c = 0;
      bc.onmessage = (event) => {
        console.log(event.data);
        if (++c === 10) bc.close();
      };
      for (let n = 0; n < 10; n++)
        new Worker(new URL(import.meta.url));
    } else {
      bc.postMessage('hello from every worker');
      bc.close();
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const {
      isMainThread,
      BroadcastChannel,
      Worker,
    } = require('node:worker_threads');

    const bc = new BroadcastChannel('hello');

    if (isMainThread) {
      let c = 0;
      bc.onmessage = (event) => {
        console.log(event.data);
        if (++c === 10) bc.close();
      };
      for (let n = 0; n < 10; n++)
        new Worker(__filename);
    } else {
      bc.postMessage('hello from every worker');
      bc.close();
    }
    ```

### `new BroadcastChannel(name)`

-   `name` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Имя канала. Допустимо любое значение JavaScript, приводимое к строке через `` `${name}` ``.

### `broadcastChannel.close()`

Закрывает соединение `BroadcastChannel`.

### `broadcastChannel.onmessage`

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается с одним аргументом `MessageEvent` при получении сообщения.

### `broadcastChannel.onmessageerror`

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, если входящее сообщение нельзя десериализовать.

### `broadcastChannel.postMessage(message)`

-   `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое клонируемое значение JavaScript.

### `broadcastChannel.ref()`

Противоположность `unref()`. Вызов `ref()` у ранее `unref()`ed BroadcastChannel _не_ позволяет завершить процесс, если это единственный активный handle (поведение по умолчанию). Если порт уже `ref()`ed, повторный `ref()` ничего не меняет.

### `broadcastChannel.unref()`

Вызов `unref()` у BroadcastChannel позволяет потоку завершиться, если это единственный активный handle в системе событий. Если BroadcastChannel уже `unref()`ed, повторный `unref()` не действует.

## Класс: `MessageChannel` {#class-messagechannel}

Класс `worker.MessageChannel` представляет асинхронный двусторонний канал связи. У `MessageChannel` нет собственных методов. `new MessageChannel()` возвращает объект с полями `port1` и `port2` — связанные экземпляры [`MessagePort`](#class-messageport).

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';

    const { port1, port2 } = new MessageChannel();
    port1.on('message', (message) => console.log('received', message));
    port2.postMessage({ foo: 'bar' });
    // Вывод: получено { foo: 'bar' } в слушателе port1.on('message')
    ```

=== "CJS"

    ```js
    'use strict';

    const { MessageChannel } = require('node:worker_threads');

    const { port1, port2 } = new MessageChannel();
    port1.on('message', (message) => console.log('received', message));
    port2.postMessage({ foo: 'bar' });
    // Вывод: получено { foo: 'bar' } в слушателе port1.on('message')
    ```

## Класс: `MessagePort` {#class-messageport}

-   Наследует: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget)

Класс `worker.MessagePort` — один конец асинхронного двустороннего канала. Через него передают структурированные данные, области памяти и другие `MessagePort` между разными [`Worker`](#class-worker).

Реализация соответствует [browser `MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort).

### Событие: `'close'` {#event-close}

Событие `'close'` генерируется, когда любая сторона канала отключена.

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();

    // Вывод:
    //   foobar
    //   closed!
    port2.on('message', (message) => console.log(message));
    port2.once('close', () => console.log('closed!'));

    port1.postMessage('foobar');
    port1.close();
    ```

=== "CJS"

    ```js
    'use strict';

    const { MessageChannel } = require('node:worker_threads');
    const { port1, port2 } = new MessageChannel();

    // Вывод:
    //   foobar
    //   closed!
    port2.on('message', (message) => console.log(message));
    port2.once('close', () => console.log('closed!'));

    port1.postMessage('foobar');
    port1.close();
    ```

### Событие: `'message'` {#event-message}

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Переданное значение

Событие `'message'` генерируется для каждого входящего сообщения с клоном аргумента [`port.postMessage()`](#portpostmessagevalue-transferlist).

Слушатели получают клон параметра `value`, как в `postMessage()`, без дополнительных аргументов.

### Событие: `'messageerror'`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект Error

Событие `'messageerror'` генерируется при ошибке десериализации сообщения.

Обычно оно возникает при ошибке создания переданного JS-объекта на приёмной стороне. Такое редко, но возможно, например, если объекты API Node.js попадают в `vm.Context` (где API Node.js сейчас недоступны).

### `port.close()`

Отключает дальнейшую отправку сообщений с обеих сторон соединения. Вызывают, когда обмен по этому `MessagePort` больше не нужен.

Событие [`'close'`](#event-close) генерируется на обоих `MessagePort` этого канала.

### `port.postMessage(value[, transferList])` {#portpostmessagevalue-transferlist}

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Отправляет значение JavaScript на приёмную сторону канала. `value` передаётся совместимо с [алгоритмом структурированного клонирования HTML](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

Отличия от `JSON`:

-   `value` может содержать циклические ссылки.
-   `value` может содержать встроенные типы JS: `RegExp`, `BigInt`, `Map`, `Set` и т.д.
-   `value` может содержать типизированные массивы на `ArrayBuffer` и `SharedArrayBuffer`.
-   `value` может содержать экземпляры [`WebAssembly.Module`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Module).
-   нельзя передавать нативные (C++) объекты, кроме:
    -   [CryptoKey](webcrypto.md#class-cryptokey)s,
    -   [FileHandle](fs.md#class-filehandle)s,
    -   [Histogram](perf_hooks.md)s,
    -   [KeyObject](crypto.md#class-keyobject)s,
    -   [MessagePort](worker_threads.md#class-messageport)s,
    -   [net.BlockList](net.md)s,
    -   [net.SocketAddress](net.md)es,
    -   [X509Certificate](crypto.md)s.

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();

    port1.on('message', (message) => console.log(message));

    const circularData = {};
    circularData.foo = circularData;
    // Вывод: { foo: [Circular] }
    port2.postMessage(circularData);
    ```

=== "CJS"

    ```js
    'use strict';

    const { MessageChannel } = require('node:worker_threads');
    const { port1, port2 } = new MessageChannel();

    port1.on('message', (message) => console.log(message));

    const circularData = {};
    circularData.foo = circularData;
    // Вывод: { foo: [Circular] }
    port2.postMessage(circularData);
    ```

`transferList` — список [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`MessagePort`](#class-messageport) и [`FileHandle`](fs.md#class-filehandle). После передачи они недоступны на стороне отправителя (даже если не входят в `value`). В отличие от [дочерних процессов](child_process.md), передача сокетов и подобных handle сейчас не поддерживается.

Если `value` содержит [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), память доступна из любого потока. Их нельзя указывать в `transferList`.

`value` может включать `ArrayBuffer`, не перечисленные в `transferList`; тогда память копируется, а не переносится.

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();

    port1.on('message', (message) => console.log(message));

    const uint8Array = new Uint8Array([ 1, 2, 3, 4 ]);
    // Отправляет копию uint8Array:
    port2.postMessage(uint8Array);
    // Данные не копируются, но uint8Array на этой стороне становится недействительным:
    port2.postMessage(uint8Array, [ uint8Array.buffer ]);

    // Память sharedUint8Array доступна и здесь, и в копии на стороне
    // обработчика .on('message'):
    const sharedUint8Array = new Uint8Array(new SharedArrayBuffer(4));
    port2.postMessage(sharedUint8Array);

    // Передаёт только что созданный порт сообщений получателю.
    // Так, например, можно связать несколько потоков Worker — детей одного родителя.
    const otherChannel = new MessageChannel();
    port2.postMessage({ port: otherChannel.port1 }, [ otherChannel.port1 ]);
    ```

=== "CJS"

    ```js
    'use strict';

    const { MessageChannel } = require('node:worker_threads');
    const { port1, port2 } = new MessageChannel();

    port1.on('message', (message) => console.log(message));

    const uint8Array = new Uint8Array([ 1, 2, 3, 4 ]);
    // Отправляет копию uint8Array:
    port2.postMessage(uint8Array);
    // Данные не копируются, но uint8Array на этой стороне становится недействительным:
    port2.postMessage(uint8Array, [ uint8Array.buffer ]);

    // Память sharedUint8Array доступна и здесь, и в копии на стороне
    // обработчика .on('message'):
    const sharedUint8Array = new Uint8Array(new SharedArrayBuffer(4));
    port2.postMessage(sharedUint8Array);

    // Передаёт только что созданный порт сообщений получателю.
    // Так, например, можно связать несколько потоков Worker — детей одного родителя.
    const otherChannel = new MessageChannel();
    port2.postMessage({ port: otherChannel.port1 }, [ otherChannel.port1 ]);
    ```

Объект сообщения клонируется сразу; после отправки исходный можно менять без побочных эффектов.

Подробнее о сериализации и десериализации см. [API сериализации модуля `node:v8`](v8.md#serialization-api).

#### Передача TypedArray и Buffer

Все [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [Buffer](buffer.md#buffer) — представления над [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer): сырые данные хранит `ArrayBuffer`, а объекты `TypedArray` и `Buffer` дают доступ к ним. Часто несколько представлений ссылаются на один `ArrayBuffer`. При передаче `ArrayBuffer` через transfer list нужна осторожность: все `TypedArray` и `Buffer`, разделяющие этот буфер, становятся недействительными.

```js
const ab = new ArrayBuffer(10);

const u1 = new Uint8Array(ab);
const u2 = new Uint16Array(ab);

console.log(u2.length); // выводит 5

port.postMessage(u1, [u1.buffer]);

console.log(u2.length); // выводит 0
```

Для `Buffer` возможность передать или клонировать базовый `ArrayBuffer` зависит от способа создания, который не всегда можно надёжно определить.

`ArrayBuffer` можно пометить [`markAsUntransferable()`](#worker_threadsmarkasuntransferableobject), чтобы он всегда клонировался, а не передавался.

В зависимости от создания `Buffer` он может владеть или не владеть своим `ArrayBuffer`. Передавать `ArrayBuffer` нельзя, если неизвестно, владеет ли им `Buffer`. Для `Buffer` из внутреннего пула (`Buffer.from()`, `Buffer.allocUnsafe()` и т.п.) передача невозможна — всегда клонирование, что может копировать весь пул `Buffer`. Это ведёт к лишнему расходу памяти и рискам безопасности.

См. [`Buffer.allocUnsafe()`](buffer.md#static-method-bufferallocunsafesize) о пуле `Buffer`.

`ArrayBuffer` у `Buffer`, созданных через `Buffer.alloc()` или `Buffer.allocUnsafeSlow()`, можно передавать, но тогда все остальные представления этого буфера становятся недействительными.

#### Клонирование объектов с прототипами, классами и аксессорами

Клонирование следует [алгоритму структурированного клонирования HTML](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm): неперечислимые свойства, аксессоры и прототипы не сохраняются. [Buffer](buffer.md#buffer) на приёмной стороне станет обычным [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), экземпляры классов — простыми объектами.

```js
const b = Symbol('b');

class Foo {
    #a = 1;
    constructor() {
        this[b] = 2;
        this.c = 3;
    }

    get d() {
        return 4;
    }
}

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => console.log(data);

port2.postMessage(new Foo());

// Вывод: { c: 3 }
```

То же касается многих встроенных объектов, например глобального `URL`:

```js
const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => console.log(data);

port2.postMessage(new URL('https://example.org'));

// Вывод: { }
```

### `port.hasRef()`

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если истина, `MessagePort` удерживает цикл событий Node.js активным.

### `port.ref()`

Противоположность `unref()`. Вызов `ref()` у ранее `unref()`ed порта _не_ завершает процесс, если это единственный handle (поведение по умолчанию). Если порт уже `ref()`ed, повторный `ref()` не действует.

При подключении или снятии слушателей через `.on('message')` порт автоматически `ref()` и `unref()` в зависимости от наличия слушателей.

### `port.start()`

Начинает приём сообщений на этом `MessagePort`. При использовании порта как event emitter вызывается автоматически при появлении слушателей `'message'`.

Метод нужен для совместимости с Web `MessagePort` API. В Node.js полезен, чтобы игнорировать сообщения без слушателя. Поведение `.onmessage` отличается: установка вызывает `.start()`, снятие оставляет сообщения в очереди до нового обработчика или уничтожения порта.

### `port.unref()`

`unref()` у порта позволяет потоку завершиться, если это единственный активный handle. Если порт уже `unref()`ed, повторный вызов не действует.

При подключении или снятии слушателей через `.on('message')` порт автоматически `ref()` и `unref()` в зависимости от наличия слушателей.

## Класс: `Worker` {#class-worker}

-   Наследует: [`<EventEmitter>`](events.md#class-eventemitter)

Класс `Worker` представляет независимый поток выполнения JavaScript. Большинство API Node.js в нём доступно.

Отличия среды Worker:

-   Потоки [`process.stdin`](process.md#processstdin), [`process.stdout`](process.md#processstdout), [`process.stderr`](process.md#processstderr) могут перенаправлять родительский поток.
-   Свойство [`require('node:worker_threads').isMainThread`](#worker_threadsismainthread) равно `false`.
-   Доступен порт сообщений [`require('node:worker_threads').parentPort`](#worker_threadsparentport).
-   [`process.exit()`](process.md#processexitcode) завершает только этот поток, не всю программу; [`process.abort()`](process.md#processabort) недоступен.
-   [`process.chdir()`](process.md#processchdirdirectory) и методы `process` для смены группы/пользователя недоступны.
-   [`process.env`](process.md#processenv) — копия переменных окружения родителя, если не указано иное. Изменения в одной копии не видны другим потокам и нативным аддонам (кроме случая [`worker.SHARE_ENV`](#worker_threadsshare_env) в опции `env` конструктора [`Worker`](#class-worker)). В Windows копия переменных, в отличие от главного потока, учитывает регистр.
-   [`process.title`](process.md#processtitle) нельзя изменить.
-   Сигналы не доставляются через [`process.on('...')`](process.md#signal-events).
-   Выполнение может прерваться в любой момент при [`worker.terminate()`](#workerterminate).
-   IPC-каналы родительского процесса недоступны.
-   Модуль [`trace_events`](tracing.md) не поддерживается.
-   Нативные аддоны в нескольких потоках — только при выполнении [условий](addons.md#worker-support).

`Worker` можно создавать внутри других `Worker`.

Как у [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) и модуля [`node:cluster`](cluster.md), двусторонняя связь достижима через передачу сообщений. У `Worker` внутри есть пара связанных [`MessagePort`](#class-messageport), созданных при инициализации. Родительский `MessagePort` не экспонируется напрямую; функции доступны через [`worker.postMessage()`](#workerpostmessagevalue-transferlist) и событие [`worker.on('message')`](#event-message_1) у объекта `Worker` в родительском потоке.

Для своих каналов связи (предпочтительнее глобального канала из‑за разделения ответственности) можно создать `MessageChannel` в любом потоке и передать один из `MessagePort` другому потоку через уже существующий канал, например глобальный.

Подробнее о передаче сообщений и допустимых значениях см. [`port.postMessage()`](#portpostmessagevalue-transferlist).

=== "MJS"

    ```js
    import assert from 'node:assert';
    import {
      Worker, MessageChannel, MessagePort, isMainThread, parentPort,
    } from 'node:worker_threads';
    if (isMainThread) {
      const worker = new Worker(new URL(import.meta.url));
      const subChannel = new MessageChannel();
      worker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);
      subChannel.port2.on('message', (value) => {
        console.log('received:', value);
      });
    } else {
      parentPort.once('message', (value) => {
        assert(value.hereIsYourPort instanceof MessagePort);
        value.hereIsYourPort.postMessage('the worker is sending this');
        value.hereIsYourPort.close();
      });
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const assert = require('node:assert');
    const {
      Worker, MessageChannel, MessagePort, isMainThread, parentPort,
    } = require('node:worker_threads');
    if (isMainThread) {
      const worker = new Worker(__filename);
      const subChannel = new MessageChannel();
      worker.postMessage({ hereIsYourPort: subChannel.port1 }, [subChannel.port1]);
      subChannel.port2.on('message', (value) => {
        console.log('received:', value);
      });
    } else {
      parentPort.once('message', (value) => {
        assert(value.hereIsYourPort instanceof MessagePort);
        value.hereIsYourPort.postMessage('the worker is sending this');
        value.hereIsYourPort.close();
      });
    }
    ```

### `new Worker(filename[, options])` {#new-workerfilename-options}

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Путь к основному скрипту или модулю Worker. Должен быть либо абсолютным путём, либо относительным (относительно текущего рабочего каталога) с префиксом `./` или `../`, либо объектом WHATWG `URL` с протоколом `file:` или `data:`. При использовании [`data:` URL](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) данные интерпретируются по MIME-типу с помощью [загрузчика модулей ECMAScript](esm.md#data-imports). Если `options.eval` равен `true`, это строка с кодом JavaScript, а не путь.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `argv` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Список аргументов, которые преобразуются в строки и добавляются к `process.argv` в worker. По смыслу близко к `workerData`, но значения доступны в глобальном `process.argv`, как если бы они были переданы скрипту в командной строке.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если задано, задаёт начальное значение `process.env` в потоке Worker. В качестве особого значения можно указать [`worker.SHARE_ENV`](#worker_threadsshare_env), чтобы родительский и дочерний потоки разделяли переменные окружения; тогда изменения объекта `process.env` в одном потоке видны и в другом. **По умолчанию:** `process.env`.
    -   `eval` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true` и первый аргумент — строка, первый аргумент конструктора трактуется как скрипт, выполняемый после перехода worker в состояние online.
    -   `execArgv` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список опций CLI Node.js, передаваемых worker. Опции V8 (например `--max-old-space-size`) и опции, влияющие на процесс (например `--title`), не поддерживаются. Если задано, внутри worker доступно как [`process.execArgv`](process.md#processexecargv). По умолчанию опции наследуются от родительского потока.
    -   `stdin` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `worker.stdin` — поток записи, содержимое которого попадает в `process.stdin` внутри Worker. По умолчанию данные не подаются.
    -   `stdout` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `worker.stdout` не перенаправляется автоматически в `process.stdout` родителя.
    -   `stderr` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `worker.stderr` не перенаправляется автоматически в `process.stderr` родителя.
    -   `workerData` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое значение JavaScript, клонируемое и доступное как [`require('node:worker_threads').workerData`](#worker_threadsworkerdata). Клонирование выполняется по [алгоритму структурированного клонирования HTML](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm); если объект клонировать нельзя (например, из‑за наличия `function`), выбрасывается ошибка.
    -   `trackUnmanagedFds` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, Worker отслеживает «сырые» дескрипторы файлов, открытые через [`fs.open()`](fs.md#fsopenpath-flags-mode-callback) и [`fs.close()`](fs.md#fsclosefd-callback), и закрывает их при завершении Worker, аналогично другим ресурсам (сетевые сокеты, дескрипторы через API [`FileHandle`](fs.md#class-filehandle)). Опция автоматически наследуется всеми вложенными `Worker`. **По умолчанию:** `true`.
    -   `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если в `workerData` передан один или несколько объектов, похожих на `MessagePort`, для них нужен `transferList`, иначе выбрасывается [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](errors.md#err_missing_message_port_in_transfer_list). Подробнее см. [`port.postMessage()`](#portpostmessagevalue-transferlist).
    -   `resourceLimits` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный набор ограничений ресурсов для нового экземпляра JS-движка. При достижении лимитов экземпляр `Worker` завершается. Ограничения действуют только на движок JS, не на внешние данные, в том числе на `ArrayBuffer`. Даже при заданных лимитах процесс может аварийно завершиться при глобальной нехватке памяти.
        -   `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер основной кучи в МБ. Если задан аргумент командной строки [`--max-old-space-size`](cli.md#--max-old-space-sizesize-in-megabytes), он переопределяет это значение.
        -   `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер области кучи для недавно созданных объектов. Если задан аргумент [`--max-semi-space-size`](cli.md#--max-semi-space-sizesize-in-megabytes), он переопределяет это значение.
        -   `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер заранее выделенного диапазона памяти для сгенерированного кода.
        -   `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер стека потока по умолчанию. Слишком малые значения могут сделать экземпляры Worker непригодными. **По умолчанию:** `4`.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное имя `name`, подставляемое в имя потока и заголовок worker для отладки и идентификации; итоговый заголовок вида `[worker ${id}] ${name}`. Максимальная длина зависит от ОС. Если имя длиннее допустимого, оно обрезается.
        -   Максимальные размеры:
            -   Windows: 32 767 символов
            -   macOS: 64 символа
            -   Linux: 16 символов
            -   NetBSD: ограничено `PTHREAD_MAX_NAMELEN_NP`
            -   FreeBSD и OpenBSD: ограничено `MAXCOMLEN` **По умолчанию:** `'WorkerThread'`.

### Событие: `'error'`

-   `err` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Событие `'error'` генерируется, если в потоке worker выброшено необработанное исключение. В этом случае worker завершается.

### Событие: `'exit'` {#event-exit}

-   `exitCode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'exit'` генерируется после остановки worker. Если worker завершился вызовом [`process.exit()`](process.md#processexitcode), параметр `exitCode` — переданный код выхода. Если worker был принудительно завершён, `exitCode` равен `1`.

Это последнее событие, которое генерирует любой экземпляр `Worker`.

### Событие: `'message'` {#event-message_1}

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Переданное значение

Событие `'message'` генерируется, когда поток worker вызывает [`require('node:worker_threads').parentPort.postMessage()`](#workerpostmessagevalue-transferlist). Подробнее см. событие [`port.on('message')`](#event-message).

Все сообщения, отправленные из потока worker, доставляются до генерации события [`'exit'`](#event-exit) на объекте `Worker`.

### Событие: `'messageerror'`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект Error

Событие `'messageerror'` генерируется при ошибке десериализации сообщения.

### Событие: `'online'` {#event-online}

Событие `'online'` генерируется, когда поток worker начал выполнение кода JavaScript.

### `worker.cpuUsage([prev])`

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Метод возвращает `Promise`, который выполнится объектом, совпадающим с [`process.threadCpuUsage()`](process.md#processthreadcpuusagepreviousvalue), или будет отклонён с [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running), если worker уже не работает. Позволяет получать статистику использования CPU потока извне, не находясь в нём.

### `worker.getHeapSnapshot([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `exposeInternals` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, в снимок кучи включаются внутренности движка. **По умолчанию:** `false`.
    -   `exposeNumericValues` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, числовые значения попадают в искусственные поля. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Промис с потоком чтения (`Readable`), содержащим снимок кучи V8

Возвращает поток чтения со снимком V8 текущего состояния Worker. Подробнее см. [`v8.getHeapSnapshot()`](v8.md#v8getheapsnapshotoptions).

Если поток Worker уже не выполняется (это возможно до генерации события [`'exit'`](#event-exit)), возвращённый `Promise` сразу отклоняется с ошибкой [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running).

### `worker.getHeapStatistics()`

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Метод возвращает `Promise`, который выполнится объектом, совпадающим с [`v8.getHeapStatistics()`](v8.md#v8getheapstatistics), или будет отклонён с [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running), если worker уже не работает. Позволяет получать статистику кучи извне, не находясь в потоке worker.

### `worker.performance`

Объект для запроса сведений о производительности экземпляра worker.

#### `performance.eventLoopUtilization([utilization1[, utilization2]])`

-   `utilization1` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова `eventLoopUtilization()`.
-   `utilization2` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова `eventLoopUtilization()` до момента `utilization1`.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `active` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Тот же вызов, что и [`perf_hooks` `eventLoopUtilization()`](perf_hooks.md#perf_hookseventlooputilizationutilization1-utilization2), но возвращаются значения для экземпляра worker.

Отличие: в отличие от главного потока, инициализация в worker выполняется внутри цикла событий, поэтому загрузку цикла событий можно измерить сразу после начала выполнения скрипта worker.

Если время `idle` не растёт, это не значит, что worker «застрял» в инициализации. Ниже показано, как за всё время жизни worker не накапливается `idle`, но сообщения всё равно обрабатываются.

=== "MJS"

    ```js
    import { Worker, isMainThread, parentPort } from 'node:worker_threads';

    if (isMainThread) {
      const worker = new Worker(new URL(import.meta.url));
      setInterval(() => {
        worker.postMessage('hi');
        console.log(worker.performance.eventLoopUtilization());
      }, 100).unref();
    } else {
      parentPort.on('message', () => console.log('msg')).unref();
      (function r(n) {
        if (--n < 0) return;
        const t = Date.now();
        while (Date.now() - t < 300);
        setImmediate(r, n);
      })(10);
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const { Worker, isMainThread, parentPort } = require('node:worker_threads');

    if (isMainThread) {
      const worker = new Worker(__filename);
      setInterval(() => {
        worker.postMessage('hi');
        console.log(worker.performance.eventLoopUtilization());
      }, 100).unref();
    } else {
      parentPort.on('message', () => console.log('msg')).unref();
      (function r(n) {
        if (--n < 0) return;
        const t = Date.now();
        while (Date.now() - t < 300);
        setImmediate(r, n);
      })(10);
    }
    ```

Загрузку цикла событий worker можно получить только после генерации события [`'online'`](#event-online); при вызове до этого или после события [`'exit'`](#event-exit) все свойства равны `0`.

### `worker.postMessage(value[, transferList])` {#workerpostmessagevalue-transferlist}

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Отправляет сообщение worker; оно принимается в [`require('node:worker_threads').parentPort.on('message')`](#event-message). Подробнее см. [`port.postMessage()`](#portpostmessagevalue-transferlist).

### `worker.ref()`

Противоположность `unref()`: вызов `ref()` у ранее `unref()`ed worker _не_ даёт процессу завершиться, если это единственный активный handle (поведение по умолчанию). Если worker уже `ref()`ed, повторный `ref()` не действует.

### `worker.resourceLimits`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт ограничения ресурсов JS-движка для этого потока Worker. Если в конструктор [`Worker`](#class-worker) передавалась опция `resourceLimits`, значения совпадают с ней.

Если worker остановлен, возвращается пустой объект.

### `worker.startCpuProfile()`

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Запускает профиль CPU и возвращает `Promise`, который выполняется с ошибкой или объектом `CPUProfileHandle`. Этот API поддерживает синтаксис `await using`.

=== "CJS"

    ```js
    const { Worker } = require('node:worker_threads');

    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      parentPort.on('message', () => {});
      `, { eval: true });

    worker.on('online', async () => {
      const handle = await worker.startCpuProfile();
      const profile = await handle.stop();
      console.log(profile);
      worker.terminate();
    });
    ```

Пример с `await using`.

=== "CJS"

    ```js
    const { Worker } = require('node:worker_threads');

    const w = new Worker(`
      const { parentPort } = require('node:worker_threads');
      parentPort.on('message', () => {});
      `, { eval: true });

    w.on('online', async () => {
      // При выходе из области видимости профиль останавливается и отбрасывается
      await using handle = await w.startCpuProfile();
    });
    ```

### `worker.startHeapProfile([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `sampleInterval` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Средний интервал выборки в байтах. **По умолчанию:** `524288` (512 KiB).
    -   `stackDepth` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная глубина стека для образцов. **По умолчанию:** `16`.
    -   `forceGC` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Принудительная сборка мусора перед снятием профиля. **По умолчанию:** `false`.
    -   `includeObjectsCollectedByMajorGC` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включать объекты, собранные major GC. **По умолчанию:** `false`.
    -   `includeObjectsCollectedByMinorGC` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включать объекты, собранные minor GC. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Запускает профиль кучи и возвращает `Promise`, который выполняется с ошибкой или объектом `HeapProfileHandle`. Этот API поддерживает синтаксис `await using`.

=== "CJS"

    ```js
    const { Worker } = require('node:worker_threads');

    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      parentPort.on('message', () => {});
      `, { eval: true });

    worker.on('online', async () => {
      const handle = await worker.startHeapProfile();
      const profile = await handle.stop();
      console.log(profile);
      worker.terminate();
    });
    ```

=== "MJS"

    ```js
    import { Worker } from 'node:worker_threads';

    const worker = new Worker(`
      const { parentPort } = require('node:worker_threads');
      parentPort.on('message', () => {});
      `, { eval: true });

    worker.on('online', async () => {
      const handle = await worker.startHeapProfile();
      const profile = await handle.stop();
      console.log(profile);
      worker.terminate();
    });
    ```

Пример с `await using`.

=== "CJS"

    ```js
    const { Worker } = require('node:worker_threads');

    const w = new Worker(`
      const { parentPort } = require('node:worker_threads');
      parentPort.on('message', () => {});
      `, { eval: true });

    w.on('online', async () => {
      // При выходе из области видимости профиль останавливается и отбрасывается
      await using handle = await w.startHeapProfile();
    });
    ```

=== "MJS"

    ```js
    import { Worker } from 'node:worker_threads';

    const w = new Worker(`
      const { parentPort } = require('node:worker_threads');
      parentPort.on('message', () => {});
      `, { eval: true });

    w.on('online', async () => {
      // При выходе из области видимости профиль останавливается и отбрасывается
      await using handle = await w.startHeapProfile();
    });
    ```

### `worker.stderr`

-   Тип: [`<stream.Readable>`](stream.md#class-streamreadable)

Поток чтения с данными, записанными в [`process.stderr`](process.md#processstderr) внутри потока worker. Если в конструктор [`Worker`](#class-worker) не передано `stderr: true`, данные перенаправляются в [`process.stderr`](process.md#processstderr) родительского потока.

### `worker.stdin`

-   Тип: null | [`<stream.Writable>`](stream.md#class-streamwritable)

Если в конструктор [`Worker`](#class-worker) передано `stdin: true`, это поток записи. Данные, записанные в него, доступны в потоке worker как [`process.stdin`](process.md#processstdin).

### `worker.stdout`

-   Тип: [`<stream.Readable>`](stream.md#class-streamreadable)

Поток чтения с данными, записанными в [`process.stdout`](process.md#processstdout) внутри потока worker. Если в конструктор [`Worker`](#class-worker) не передано `stdout: true`, данные перенаправляются в [`process.stdout`](process.md#processstdout) родительского потока.

### `worker.terminate()` {#workerterminate}

-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Останавливает выполнение JavaScript в потоке worker как можно скорее. Возвращает `Promise` с кодом выхода, который выполняется при генерации события [`'exit'`](#event-exit).

### `worker.threadId` {#workerthreadid}

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор соответствующего потока. В потоке worker доступен как [`require('node:worker_threads').threadId`](#worker_threadsthreadid). Уникален для каждого экземпляра `Worker` в одном процессе.

### `worker.threadName` {#workerthreadname}

-   [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строковый идентификатор потока или `null`, если поток не выполняется. В потоке worker доступен как [`require('node:worker_threads').threadName`](#worker_threadsthreadname).

### `worker.unref()`

Вызов `unref()` у worker позволяет потоку завершиться, если это единственный активный handle в системе событий. Если worker уже `unref()`ed, повторный `unref()` не действует.

### `worker[Symbol.asyncDispose]()`

Вызывает [`worker.terminate()`](#workerterminate) при выходе из области dispose.

```js
async function example() {
  await using worker = new Worker('for (;;) {}', { eval: true });
  // Worker автоматически завершается при выходе из области видимости.
}
```

## Примечания

### Синхронная блокировка stdio

Экземпляры `Worker` используют передачу сообщений через [MessagePort](worker_threads.md#class-messageport) для взаимодействия со `stdio`. Поэтому вывод `stdio` из worker может блокироваться синхронным кодом на принимающей стороне, который удерживает цикл событий Node.js.

=== "MJS"

    ```js
    import {
      Worker,
      isMainThread,
    } from 'node:worker_threads';

    if (isMainThread) {
      new Worker(new URL(import.meta.url));
      for (let n = 0; n < 1e10; n++) {
        // Долгий цикл — имитация работы.
      }
    } else {
      // Этот вывод заблокирован циклом for в главном потоке.
      console.log('foo');
    }
    ```

=== "CJS"

    ```js
    'use strict';

    const {
      Worker,
      isMainThread,
    } = require('node:worker_threads');

    if (isMainThread) {
      new Worker(__filename);
      for (let n = 0; n < 1e10; n++) {
        // Долгий цикл — имитация работы.
      }
    } else {
      // Этот вывод заблокирован циклом for в главном потоке.
      console.log('foo');
    }
    ```

### Запуск потоков worker из preload-скриптов

Будьте осторожны при запуске потоков worker из preload-скриптов (скриптов, подключаемых флагом `-r`). Пока явно не задана опция `execArgv`, новые потоки Worker наследуют флаги командной строки текущего процесса и подгружают те же preload-скрипты, что и главный поток. Если preload-скрипт безусловно создаёт поток worker, каждый новый поток породит ещё один, пока приложение не упадёт.
