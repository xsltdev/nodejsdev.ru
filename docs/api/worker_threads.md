---
title: Потоки worker
description: Модуль node:worker_threads — потоки выполнения JavaScript в параллели, общая память, MessagePort, Worker и BroadcastChannel
---

# Потоки worker (worker_threads)

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/worker_threads.html)

<!--introduced_in=v10.5.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/worker_threads.js -->

Модуль `node:worker_threads` позволяет использовать потоки, в которых выполняется
JavaScript параллельно. Подключение:

=== "MJS"

    ```js
    import worker_threads from 'node:worker_threads';
    ```

=== "CJS"

    ```js
    'use strict';
    
    const worker_threads = require('node:worker_threads');
    ```

Потоки worker полезны для вычислительно тяжёлого кода на JavaScript.
Для I/O-нагрузки они мало что дают: встроенные в Node.js асинхронные
операции ввода-вывода обычно эффективнее.

В отличие от `child_process` или `cluster`, `worker_threads` могут разделять память —
передавая экземпляры `ArrayBuffer` или используя общий `SharedArrayBuffer`.

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

В примере на каждый вызов `parseJSAsync()` создаётся новый поток Worker. На практике
для таких задач используйте пул worker’ов — иначе накладные расходы на создание
потоков могут перевесить пользу.

Реализуя пул, применяйте API [`AsyncResource`](async_hooks.md#class-asyncresource), чтобы диагностические инструменты
(например трассировки асинхронного стека) видели связь задач с результатами. Пример —
в разделе [«Использование `AsyncResource` для пула потоков `Worker`»](async_context.md#using-asyncresource-for-a-worker-thread-pool)
документации `async_hooks`.

Потоки worker по умолчанию наследуют опции, не зависящие от процесса. См.
[параметры конструктора `Worker`](#new-workerfilename-options) — настройка `argv` и `execArgv`.

## `worker_threads.getEnvironmentData(key)`

<!-- YAML
added:
  - v15.12.0
  - v14.18.0
changes:
  - version:
    - v17.5.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41272
    description: Больше не экспериментально.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.5.0, v16.15.0 | Больше не экспериментально. |

* `key` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение JavaScript, пригодное в качестве
  ключа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

В потоке worker `worker.getEnvironmentData()` возвращает клон
данных, переданных через `worker.setEnvironmentData()` породившего потока.
Каждый новый `Worker` автоматически получает свою копию этих данных.

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
      console.log(getEnvironmentData('Hello'));  // Prints 'World!'.
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
      console.log(getEnvironmentData('Hello'));  // Prints 'World!'.
    }
    ```

## `worker_threads.isInternalThread`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если этот код выполняется во внутреннем потоке [`Worker`](#class-worker) (например, в потоке загрузчика).

```bash
node --experimental-loader ./loader.js main.js
```

=== "MJS"

    ```js
    // loader.js
    import { isInternalThread } from 'node:worker_threads';
    console.log(isInternalThread);  // true
    ```

=== "CJS"

    ```js
    // loader.js
    'use strict';
    
    const { isInternalThread } = require('node:worker_threads');
    console.log(isInternalThread);  // true
    ```

=== "MJS"

    ```js
    // main.js
    import { isInternalThread } from 'node:worker_threads';
    console.log(isInternalThread);  // false
    ```

=== "CJS"

    ```js
    // main.js
    'use strict';
    
    const { isInternalThread } = require('node:worker_threads');
    console.log(isInternalThread);  // false
    ```

## `worker_threads.isMainThread`

<!-- YAML
added: v10.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если этот код выполняется не в потоке [`Worker`](#class-worker).

=== "MJS"

    ```js
    import { Worker, isMainThread } from 'node:worker_threads';
    
    if (isMainThread) {
      // This re-loads the current file inside a Worker instance.
      new Worker(new URL(import.meta.url));
    } else {
      console.log('Inside Worker!');
      console.log(isMainThread);  // Prints 'false'.
    }
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { Worker, isMainThread } = require('node:worker_threads');
    
    if (isMainThread) {
      // This re-loads the current file inside a Worker instance.
      new Worker(__filename);
    } else {
      console.log('Inside Worker!');
      console.log(isMainThread);  // Prints 'false'.
    }
    ```

## `worker_threads.markAsUntransferable(object)`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

* `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное значение JavaScript.

Помечает объект как непередаваемый. Если `object` попадает в список передачи вызова
[`port.postMessage()`](#portpostmessagevalue-transferlist), выбрасывается ошибка. Для примитивных значений
`object` ничего не делает.

Это уместно для объектов, которые клонируются, а не
передаются, и используются другими объектами на стороне отправителя.
Например, Node.js помечает так `ArrayBuffer`, используемые для
[`Buffer` pool](buffer.md#static-method-bufferallocunsafesize).
`ArrayBuffer.prototype.transfer()` для таких буферов запрещён.

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
      // This will throw an error, because pooledBuffer is not transferable.
      port1.postMessage(typedArray1, [ typedArray1.buffer ]);
    } catch (error) {
      // error.name === 'DataCloneError'
    }
    
    // The following line prints the contents of typedArray1 -- it still owns
    // its memory and has not been transferred. Without
    // `markAsUntransferable()`, this would print an empty Uint8Array and the
    // postMessage call would have succeeded.
    // typedArray2 is intact as well.
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
      // This will throw an error, because pooledBuffer is not transferable.
      port1.postMessage(typedArray1, [ typedArray1.buffer ]);
    } catch (error) {
      // error.name === 'DataCloneError'
    }
    
    // The following line prints the contents of typedArray1 -- it still owns
    // its memory and has not been transferred. Without
    // `markAsUntransferable()`, this would print an empty Uint8Array and the
    // postMessage call would have succeeded.
    // typedArray2 is intact as well.
    console.log(typedArray1);
    console.log(typedArray2);
    ```

В браузерах аналога этого API нет.

## `worker_threads.isMarkedAsUntransferable(object)`

<!-- YAML
added: v21.0.0
-->

* `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое значение JavaScript.
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, помечен ли объект как непередаваемый через
[`markAsUntransferable()`](#worker_threadsmarkasuntransferableobject).

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

<!-- YAML
added:
 - v23.0.0
 - v22.10.0
-->

* `object` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное значение JavaScript.

Помечает объект как неклонируемый. Если `object` используется как [`message`](#event-message) в
вызове [`port.postMessage()`](#portpostmessagevalue-transferlist), выбрасывается ошибка. Для примитивных значений `object` ничего не делает.

Это не действует на `ArrayBuffer` и объекты, похожие на `Buffer`.

Эту операцию нельзя отменить.

=== "MJS"

    ```js
    import { markAsUncloneable } from 'node:worker_threads';
    
    const anyObject = { foo: 'bar' };
    markAsUncloneable(anyObject);
    const { port1 } = new MessageChannel();
    try {
      // This will throw an error, because anyObject is not cloneable.
      port1.postMessage(anyObject);
    } catch (error) {
      // error.name === 'DataCloneError'
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
      // This will throw an error, because anyObject is not cloneable.
      port1.postMessage(anyObject);
    } catch (error) {
      // error.name === 'DataCloneError'
    }
    ```

В браузерах аналога этого API нет.

## `worker_threads.moveMessagePortToContext(port, contextifiedSandbox)`

<!-- YAML
added: v11.13.0
-->

* `port` [`<MessagePort>`](worker_threads.md#class-messageport) Передаваемый порт сообщений.

* `contextifiedSandbox` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [контекстифицированный][contextified] объект, возвращённый
  методом `vm.createContext()`.

* Возвращает: [`<MessagePort>`](worker_threads.md#class-messageport)

Передаёт `MessagePort` в другой [`vm`](vm.md) Context. Исходный объект `port`
становится непригодным, на его месте используется возвращённый `MessagePort`.

Возвращённый `MessagePort` — объект в целевом контексте и
наследует глобальный класс `Object`. Объекты, передаваемые в слушатель
[`port.onmessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event), тоже создаются в целевом контексте
и наследуют его глобальный класс `Object`.

Однако созданный `MessagePort` больше не наследует
[EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget), для получения событий можно использовать только [`port.onmessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event).

## `worker_threads.parentPort`

<!-- YAML
added: v10.5.0
-->

* Тип: null | [`<MessagePort>`](worker_threads.md#class-messageport)

Если этот поток — [`Worker`](#class-worker), это [`MessagePort`](#class-messageport)
для связи с родительским потоком. Сообщения, отправленные через
`parentPort.postMessage()`, доступны родителю в
`worker.on('message')`, а сообщения от родителя через
`worker.postMessage()` — в этом потоке в
`parentPort.on('message')`.

=== "MJS"

    ```js
    import { Worker, isMainThread, parentPort } from 'node:worker_threads';
    
    if (isMainThread) {
      const worker = new Worker(new URL(import.meta.url));
      worker.once('message', (message) => {
        console.log(message);  // Prints 'Hello, world!'.
      });
      worker.postMessage('Hello, world!');
    } else {
      // When a message from the parent thread is received, send it back:
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
        console.log(message);  // Prints 'Hello, world!'.
      });
      worker.postMessage('Hello, world!');
    } else {
      // When a message from the parent thread is received, send it back:
      parentPort.once('message', (message) => {
        parentPort.postMessage(message);
      });
    }
    ```

## `worker_threads.postMessageToThread(threadId, value[, transferList][, timeout])`

<!-- YAML
added:
- v22.5.0
- v20.19.0
-->

> Стабильность: 1.1 – Активная разработка

* `threadId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID целевого потока. Если ID недействителен,
  выбрасывается [`ERR_WORKER_MESSAGING_FAILED`](errors.md#err_worker_messaging_failed). Если ID совпадает с текущим потоком,
  выбрасывается [`ERR_WORKER_MESSAGING_SAME_THREAD`](errors.md#err_worker_messaging_same_thread).
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Отправляемое значение.
* `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если в `value` передаются один или несколько объектов, похожих на `MessagePort`,
  для них нужен `transferList`, иначе выбрасывается [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](errors.md#err_missing_message_port_in_transfer_list).
  См. [`port.postMessage()`](#portpostmessagevalue-transferlist).
* `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидание доставки сообщения в миллисекундах.
  **По умолчанию:** `undefined` — ждать бесконечно. При таймауте
  выбрасывается [`ERR_WORKER_MESSAGING_TIMEOUT`](errors.md#err_worker_messaging_timeout).
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис выполняется, если целевой поток успешно обработал сообщение.

Отправляет значение другому worker, определяемому по ID потока.

Если в целевом потоке нет слушателя события `workerMessage`, выбрасывается
[`ERR_WORKER_MESSAGING_FAILED`](errors.md#err_worker_messaging_failed).

Если целевой поток выбросил ошибку при обработке `workerMessage`, выбрасывается
[`ERR_WORKER_MESSAGING_ERRORED`](errors.md#err_worker_messaging_errored).

Этот метод нужен, когда целевой поток не является прямым
родителем или дочерним для текущего.
Если потоки в отношении родитель–дочерний, используйте [`require('node:worker_threads').parentPort.postMessage()`](#workerpostmessagevalue-transferlist)
и [`worker.postMessage()`](#workerpostmessagevalue-transferlist).

Ниже пример `postMessageToThread`: создаётся 10 вложенных потоков,
последний пытается связаться с главным потоком.

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

<!-- YAML
added: v12.3.0
changes:
  - version: v15.12.0
    pr-url: https://github.com/nodejs/node/pull/37535
    description: аргумент port может ссылаться и на `BroadcastChannel`.
-->

Добавлено в: v12.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.12.0 | аргумент port может ссылаться и на `BroadcastChannel`. |

* `port` [`<MessagePort>`](worker_threads.md#class-messageport) | [`<BroadcastChannel>`](worker_threads.md)

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined

Принимает одно сообщение из `MessagePort`. Если сообщений нет,
возвращается `undefined`, иначе объект с полем `message` с полезной нагрузкой —
самое старое сообщение в очереди `MessagePort`.

=== "MJS"

    ```js
    import { MessageChannel, receiveMessageOnPort } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();
    port1.postMessage({ hello: 'world' });
    
    console.log(receiveMessageOnPort(port2));
    // Prints: { message: { hello: 'world' } }
    console.log(receiveMessageOnPort(port2));
    // Prints: undefined
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { MessageChannel, receiveMessageOnPort } = require('node:worker_threads');
    const { port1, port2 } = new MessageChannel();
    port1.postMessage({ hello: 'world' });
    
    console.log(receiveMessageOnPort(port2));
    // Prints: { message: { hello: 'world' } }
    console.log(receiveMessageOnPort(port2));
    // Prints: undefined
    ```

При использовании этой функции событие `'message'` не генерируется и
слушатель `onmessage` не вызывается.

## `worker_threads.resourceLimits`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт ограничения ресурсов JS-движка в этом потоке Worker.
Если в конструктор [`Worker`](#class-worker) передавалась опция `resourceLimits`,
значения совпадают с ней.

В главном потоке значение — пустой объект.

## `worker_threads.SHARE_ENV`

<!-- YAML
added: v11.14.0
-->

* Тип: [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)

Специальное значение для опции `env` конструктора [`Worker`](#class-worker):
текущий поток и поток Worker совместно читают и изменяют
один и тот же набор переменных окружения.

=== "MJS"

    ```js
    import process from 'node:process';
    import { Worker, SHARE_ENV } from 'node:worker_threads';
    new Worker('process.env.SET_IN_WORKER = "foo"', { eval: true, env: SHARE_ENV })
      .once('exit', () => {
        console.log(process.env.SET_IN_WORKER);  // Prints 'foo'.
      });
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { Worker, SHARE_ENV } = require('node:worker_threads');
    new Worker('process.env.SET_IN_WORKER = "foo"', { eval: true, env: SHARE_ENV })
      .once('exit', () => {
        console.log(process.env.SET_IN_WORKER);  // Prints 'foo'.
      });
    ```

## `worker_threads.setEnvironmentData(key[, value])`

<!-- YAML
added:
  - v15.12.0
  - v14.18.0
changes:
  - version:
    - v17.5.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/41272
    description: Больше не экспериментально.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.5.0, v16.15.0 | Больше не экспериментально. |

* `key` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение JavaScript, пригодное в качестве
  ключа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Произвольное клонируемое значение; клонируется
  и автоматически передаётся всем новым `Worker`. Если передать `undefined`,
  ранее заданное значение для `key` удаляется.

API `worker.setEnvironmentData()` задаёт содержимое
`worker.getEnvironmentData()` в текущем потоке и во всех новых `Worker`,
созданных из текущего контекста.

## `worker_threads.threadId`

<!-- YAML
added: v10.5.0
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор текущего потока. На соответствующем объекте worker
(если есть) доступен как [`worker.threadId`](#workerthreadid).
Уникален для каждого [`Worker`](#class-worker) в одном процессе.

## `worker_threads.threadName`

<!-- YAML
added:
  - v24.6.0
  - v22.20.0
-->

* [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строковый идентификатор текущего потока или `null`, если поток не выполняется.
На соответствующем объекте worker (если есть) доступен как [`worker.threadName`](#workerthreadname).

## `worker_threads.workerData`

<!-- YAML
added: v10.5.0
-->

Произвольное значение JavaScript — клон данных, переданных
в конструктор `Worker` этого потока.

Данные клонируются как при [`postMessage()`](#portpostmessagevalue-transferlist),
по [алгоритму структурированного клонирования HTML][HTML structured clone algorithm].

=== "MJS"

    ```js
    import { Worker, isMainThread, workerData } from 'node:worker_threads';
    
    if (isMainThread) {
      const worker = new Worker(new URL(import.meta.url), { workerData: 'Hello, world!' });
    } else {
      console.log(workerData);  // Prints 'Hello, world!'.
    }
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { Worker, isMainThread, workerData } = require('node:worker_threads');
    
    if (isMainThread) {
      const worker = new Worker(__filename, { workerData: 'Hello, world!' });
    } else {
      console.log(workerData);  // Prints 'Hello, world!'.
    }
    ```

## `worker_threads.locks`

<!-- YAML
added: v24.5.0
-->

> Стабильность: 1 – Экспериментальная

* [LockManager](worker_threads.md#class-lockmanager)

Экземпляр [`LockManager`](#class-lockmanager) для координации
доступа к ресурсам, общим для нескольких потоков одного
процесса. Семантика соответствует
[браузерному `LockManager`](https://developer.mozilla.org/en-US/docs/Web/API/LockManager)

### Класс: `Lock`

<!-- YAML
added: v24.5.0
-->

Интерфейс `Lock` описывает блокировку, выданную через
[`locks.request()`](#locksrequestname-options-callback)

#### `lock.name`

<!-- YAML
added: v24.5.0
-->

* [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя блокировки.

#### `lock.mode`

<!-- YAML
added: v24.5.0
-->

* [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Режим блокировки: `shared` или `exclusive`.

### Класс: `LockManager`

<!-- YAML
added: v24.5.0
-->

Интерфейс `LockManager` предоставляет методы запроса и просмотра
блокировок. Экземпляр `LockManager` получают так:

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

#### `locks.request(name[, options], callback)`

<!-- YAML
added: v24.5.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'exclusive'` или `'shared'`. **По умолчанию:** `'exclusive'`.
  * `ifAvailable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, запрос удовлетворяется только если
    блокировка ещё не удерживается. Иначе `callback` вызывается
    с `null` вместо `Lock`. **По умолчанию:** `false`.
  * `steal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, существующие блокировки с тем же именем
    снимаются и запрос выполняется сразу, опережая очередь.
    **По умолчанию:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) для отмены ожидающего
    (ещё не выданного) запроса блокировки.
* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после выдачи блокировки (или сразу с
  `null`, если `ifAvailable` равен `true` и блокировка недоступна). Блокировка
  снимается при возврате из функции или, если возвращается промис, после его завершения.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется после снятия блокировки.

=== "MJS"

    ```js
    import { locks } from 'node:worker_threads';
    
    await locks.request('my_resource', async (lock) => {
      // The lock has been acquired.
    });
    // The lock has been released here.
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { locks } = require('node:worker_threads');
    
    locks.request('my_resource', async (lock) => {
      // The lock has been acquired.
    }).then(() => {
      // The lock has been released here.
    });
    ```

#### `locks.query()`

<!-- YAML
added: v24.5.0
-->

* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Выполняется с `LockManagerSnapshot` с текущими удерживаемыми и ожидающими
блокировками для процесса.

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

<!-- YAML
added: v15.4.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41271
    description: Больше не экспериментально.
-->

Добавлено в: v15.4.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | Больше не экспериментально. |

Экземпляры `BroadcastChannel` обеспечивают асинхронную связь «один ко многим»
со всеми `BroadcastChannel` с тем же именем канала.

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

<!-- YAML
added: v15.4.0
-->

* `name` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Имя канала. Допустимо любое значение JavaScript,
  приводимое к строке через `` `${name}` ``.

### `broadcastChannel.close()`

<!-- YAML
added: v15.4.0
-->

Закрывает соединение `BroadcastChannel`.

### `broadcastChannel.onmessage`

<!-- YAML
added: v15.4.0
-->

* Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается с одним аргументом `MessageEvent`
  при получении сообщения.

### `broadcastChannel.onmessageerror`

<!-- YAML
added: v15.4.0
-->

* Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, если входящее сообщение нельзя
  десериализовать.

### `broadcastChannel.postMessage(message)`

<!-- YAML
added: v15.4.0
-->

* `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое клонируемое значение JavaScript.

### `broadcastChannel.ref()`

<!-- YAML
added: v15.4.0
-->

Противоположность `unref()`. Вызов `ref()` у ранее `unref()`ed
BroadcastChannel _не_ позволяет завершить процесс, если это единственный активный handle
(поведение по умолчанию). Если порт уже `ref()`ed, повторный `ref()`
ничего не меняет.

### `broadcastChannel.unref()`

<!-- YAML
added: v15.4.0
-->

Вызов `unref()` у BroadcastChannel позволяет потоку завершиться, если это
единственный активный handle в системе событий. Если BroadcastChannel уже
`unref()`ed, повторный `unref()` не действует.

## Класс: `MessageChannel`

<!-- YAML
added: v10.5.0
-->

Класс `worker.MessageChannel` представляет асинхронный
двусторонний канал связи.
У `MessageChannel` нет собственных методов. `new MessageChannel()`
возвращает объект с полями `port1` и `port2` — связанные
экземпляры [`MessagePort`](#class-messageport).

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    
    const { port1, port2 } = new MessageChannel();
    port1.on('message', (message) => console.log('received', message));
    port2.postMessage({ foo: 'bar' });
    // Prints: received { foo: 'bar' } from the `port1.on('message')` listener
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { MessageChannel } = require('node:worker_threads');
    
    const { port1, port2 } = new MessageChannel();
    port1.on('message', (message) => console.log('received', message));
    port2.postMessage({ foo: 'bar' });
    // Prints: received { foo: 'bar' } from the `port1.on('message')` listener
    ```

## Класс: `MessagePort`

<!-- YAML
added: v10.5.0
changes:
  - version:
    - v14.7.0
    pr-url: https://github.com/nodejs/node/pull/34057
    description: класс теперь наследует `EventTarget`, а не
                 `EventEmitter`.
-->

Добавлено в: v10.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v14.7.0 | класс теперь наследует `EventTarget`, а не `EventEmitter`. |

* Наследует: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget)

Класс `worker.MessagePort` — один конец асинхронного
двустороннего канала. Через него передают
структурированные данные, области памяти и другие `MessagePort` между
разными [`Worker`](#class-worker).

Реализация соответствует [browser `MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort).

### Event: `'close'`

<!-- YAML
added: v10.5.0
-->

Событие `'close'` генерируется, когда любая сторона канала
отключена.

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();
    
    // Prints:
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
    
    // Prints:
    //   foobar
    //   closed!
    port2.on('message', (message) => console.log(message));
    port2.once('close', () => console.log('closed!'));
    
    port1.postMessage('foobar');
    port1.close();
    ```

### Event: `'message'`

<!-- YAML
added: v10.5.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Переданное значение

Событие `'message'` генерируется для каждого входящего сообщения с клоном
аргумента [`port.postMessage()`](#portpostmessagevalue-transferlist).

Слушатели получают клон параметра `value`, как в
`postMessage()`, без дополнительных аргументов.

### Event: `'messageerror'`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект Error

Событие `'messageerror'` генерируется при ошибке десериализации сообщения.

Обычно оно возникает при ошибке создания переданного JS-объекта на приёмной стороне. Такое
редко, но возможно, например, если объекты API Node.js
попадают в `vm.Context` (где API Node.js сейчас
недоступны).

### `port.close()`

<!-- YAML
added: v10.5.0
-->

Отключает дальнейшую отправку сообщений с обеих сторон соединения.
Вызывают, когда обмен по этому `MessagePort` больше не нужен.

Событие [`'close'`](#event-close) генерируется на обоих `MessagePort`
этого канала.

### `port.postMessage(value[, transferList])`

<!-- YAML
added: v10.5.0
changes:
  - version: v21.0.0
    pr-url: https://github.com/nodejs/node/pull/47604
    description: ошибка, если в списке передачи есть непередаваемый объект.
  - version:
      - v15.14.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37917
    description: Add 'BlockList' to the list of cloneable types.
  - version:
      - v15.9.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/37155
    description: Add 'Histogram' types to the list of cloneable types.
  - version: v15.6.0
    pr-url: https://github.com/nodejs/node/pull/36804
    description: Added `X509Certificate` to the list of cloneable types.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35093
    description: Added `CryptoKey` to the list of cloneable types.
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33360
    description: Added `KeyObject` to the list of cloneable types.
  - version:
    - v14.5.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33772
    description: Added `FileHandle` to the list of transferable types.
-->

Добавлено в: v10.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | ошибка, если в списке передачи есть непередаваемый объект. |
    | v15.14.0, v14.18.0 | В список клонируемых типов добавлен `BlockList`. |
    | v15.9.0, v14.18.0 | В список клонируемых типов добавлены типы `Histogram`. |
    | v15.6.0 | В список клонируемых типов добавлен X509Certificate. |
    | v15.0.0 | В список клонируемых типов добавлен «CryptoKey». |
    | v14.5.0, v12.19.0 | В список клонируемых типов добавлен KeyObject. |
    | v14.5.0, v12.19.0 | В список передаваемых типов добавлен FileHandle. |

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Отправляет значение JavaScript на приёмную сторону канала.
`value` передаётся совместимо с
[алгоритмом структурированного клонирования HTML][HTML structured clone algorithm].

Отличия от `JSON`:

* `value` может содержать циклические ссылки.
* `value` может содержать встроенные типы JS: `RegExp`,
  `BigInt`, `Map`, `Set` и т.д.
* `value` может содержать типизированные массивы на `ArrayBuffer`
  и `SharedArrayBuffer`.
* `value` может содержать экземпляры [`WebAssembly.Module`](https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Module).
* нельзя передавать нативные (C++) объекты, кроме:
  * [CryptoKey](webcrypto.md#class-cryptokey)s,
  * [FileHandle](#filehandle)s,
  * [Histogram](perf_hooks.md)s,
  * [KeyObject](#class-keyobject)s,
  * [MessagePort](worker_threads.md#class-messageport)s,
  * [net.BlockList](net.md)s,
  * [net.SocketAddress](net.md)es,
  * [X509Certificate](crypto.md)s.

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();
    
    port1.on('message', (message) => console.log(message));
    
    const circularData = {};
    circularData.foo = circularData;
    // Prints: { foo: [Circular] }
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
    // Prints: { foo: [Circular] }
    port2.postMessage(circularData);
    ```

`transferList` — список [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`MessagePort`](#class-messageport) и
[`FileHandle`](fs.md#class-filehandle).
После передачи они недоступны на стороне отправителя
(даже если не входят в `value`). В отличие от
[дочерних процессов][child processes], передача сокетов и подобных handle сейчас
не поддерживается.

Если `value` содержит [SharedArrayBuffer](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), память доступна
из любого потока. Их нельзя указывать в `transferList`.

`value` может включать `ArrayBuffer`, не перечисленные в
`transferList`; тогда память копируется, а не переносится.

=== "MJS"

    ```js
    import { MessageChannel } from 'node:worker_threads';
    const { port1, port2 } = new MessageChannel();
    
    port1.on('message', (message) => console.log(message));
    
    const uint8Array = new Uint8Array([ 1, 2, 3, 4 ]);
    // This posts a copy of `uint8Array`:
    port2.postMessage(uint8Array);
    // This does not copy data, but renders `uint8Array` unusable:
    port2.postMessage(uint8Array, [ uint8Array.buffer ]);
    
    // The memory for the `sharedUint8Array` is accessible from both the
    // original and the copy received by `.on('message')`:
    const sharedUint8Array = new Uint8Array(new SharedArrayBuffer(4));
    port2.postMessage(sharedUint8Array);
    
    // This transfers a freshly created message port to the receiver.
    // This can be used, for example, to create communication channels between
    // multiple `Worker` threads that are children of the same parent thread.
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
    // This posts a copy of `uint8Array`:
    port2.postMessage(uint8Array);
    // This does not copy data, but renders `uint8Array` unusable:
    port2.postMessage(uint8Array, [ uint8Array.buffer ]);
    
    // The memory for the `sharedUint8Array` is accessible from both the
    // original and the copy received by `.on('message')`:
    const sharedUint8Array = new Uint8Array(new SharedArrayBuffer(4));
    port2.postMessage(sharedUint8Array);
    
    // This transfers a freshly created message port to the receiver.
    // This can be used, for example, to create communication channels between
    // multiple `Worker` threads that are children of the same parent thread.
    const otherChannel = new MessageChannel();
    port2.postMessage({ port: otherChannel.port1 }, [ otherChannel.port1 ]);
    ```

Объект сообщения клонируется сразу; после отправки исходный можно менять
без побочных эффектов.

Подробнее о сериализации и десериализации см.
[API сериализации модуля `node:v8`](v8.md#serialization-api).

#### Передача TypedArray и Buffer

Все [TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) | [Buffer](buffer.md#buffer) — представления над
[ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer): сырые данные хранит `ArrayBuffer`, а объекты `TypedArray` и `Buffer`
дают доступ к ним. Часто несколько представлений ссылаются на один `ArrayBuffer`.
При передаче `ArrayBuffer` через transfer list нужна осторожность: все `TypedArray` и `Buffer`,
разделяющие этот буфер, становятся недействительными.

```js
const ab = new ArrayBuffer(10);

const u1 = new Uint8Array(ab);
const u2 = new Uint16Array(ab);

console.log(u2.length);  // prints 5

port.postMessage(u1, [u1.buffer]);

console.log(u2.length);  // prints 0
```

Для `Buffer` возможность передать или клонировать базовый
`ArrayBuffer` зависит от способа создания, который не всегда можно надёжно определить.

`ArrayBuffer` можно пометить [`markAsUntransferable()`](#worker_threadsmarkasuntransferableobject), чтобы
он всегда клонировался, а не передавался.

В зависимости от создания `Buffer` он может
владеть или не владеть своим `ArrayBuffer`. Передавать `ArrayBuffer` нельзя,
если неизвестно, владеет ли им `Buffer`. Для `Buffer` из внутреннего
пула (`Buffer.from()`, `Buffer.allocUnsafe()` и т.п.)
передача невозможна — всегда клонирование,
что может копировать весь пул `Buffer`.
Это ведёт к лишнему расходу памяти и рискам безопасности.

См. [`Buffer.allocUnsafe()`](buffer.md#static-method-bufferallocunsafesize) о пуле `Buffer`.

`ArrayBuffer` у `Buffer`, созданных через
`Buffer.alloc()` или `Buffer.allocUnsafeSlow()`, можно
передавать, но тогда все остальные представления этого буфера
становятся недействительными.

#### Клонирование объектов с прототипами, классами и аксессорами

Клонирование следует [алгоритму структурированного клонирования HTML][HTML structured clone algorithm]:
неперечислимые свойства, аксессоры и прототипы не сохраняются.
[Buffer](buffer.md#buffer) на приёмной стороне станет обычным [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array), экземпляры классов —
простыми объектами.

<!-- eslint-disable no-unused-private-class-members -->

```js
const b = Symbol('b');

class Foo {
  #a = 1;
  constructor() {
    this[b] = 2;
    this.c = 3;
  }

  get d() { return 4; }
}

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => console.log(data);

port2.postMessage(new Foo());

// Prints: { c: 3 }
```

То же касается многих встроенных объектов, например глобального `URL`:

```js
const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => console.log(data);

port2.postMessage(new URL('https://example.org'));

// Prints: { }
```

### `port.hasRef()`

<!-- YAML
added:
  - v18.1.0
  - v16.17.0
changes:
 - version:
    - v24.0.0
    - v22.17.0
   pr-url: https://github.com/nodejs/node/pull/57513
   description: API помечен стабильным.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | API помечен стабильным. |

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если истина, `MessagePort` удерживает цикл событий Node.js активным.

### `port.ref()`

<!-- YAML
added: v10.5.0
-->

Противоположность `unref()`. Вызов `ref()` у ранее `unref()`ed порта _не_
завершает процесс, если это единственный handle (поведение
по умолчанию). Если порт уже `ref()`ed, повторный `ref()` не действует.

При подключении или снятии слушателей через `.on('message')` порт
автоматически `ref()` и `unref()` в зависимости от наличия
слушателей.

### `port.start()`

<!-- YAML
added: v10.5.0
-->

Начинает приём сообщений на этом `MessagePort`. При использовании порта
как event emitter вызывается автоматически при появлении слушателей `'message'`.

Метод нужен для совместимости с Web `MessagePort` API. В Node.js
полезен, чтобы игнорировать сообщения без слушателя.
Поведение `.onmessage` отличается: установка
вызывает `.start()`, снятие оставляет сообщения в очереди
до нового обработчика или уничтожения порта.

### `port.unref()`

<!-- YAML
added: v10.5.0
-->

`unref()` у порта позволяет потоку завершиться, если это единственный
активный handle. Если порт уже `unref()`ed, повторный вызов не действует.

При подключении или снятии слушателей через `.on('message')` порт
автоматически `ref()` и `unref()` в зависимости от наличия
слушателей.

## Класс: `Worker`

<!-- YAML
added: v10.5.0
-->

* Наследует: [`<EventEmitter>`](events.md#class-eventemitter)

Класс `Worker` представляет независимый поток выполнения JavaScript.
Большинство API Node.js в нём доступно.

Отличия среды Worker:

* Потоки [`process.stdin`](process.md#processstdin), [`process.stdout`](process.md#processstdout), [`process.stderr`](process.md#processstderr)
  могут перенаправлять родительский поток.
* Свойство [`require('node:worker_threads').isMainThread`](#worker_threadsismainthread) равно `false`.
* Доступен порт сообщений [`require('node:worker_threads').parentPort`](#worker_threadsparentport).
* [`process.exit()`](process.md#processexitcode) завершает только этот поток, не всю программу;
  [`process.abort()`](process.md#processabort) недоступен.
* [`process.chdir()`](process.md#processchdirdirectory) и методы `process` для смены группы/пользователя
  недоступны.
* [`process.env`](process.md#processenv) — копия переменных окружения родителя,
  если не указано иное. Изменения в одной копии не видны другим
  потокам и нативным аддонам (кроме случая
  [`worker.SHARE_ENV`](#worker_threadsshare_env) в опции `env` конструктора
  [`Worker`](#class-worker)). В Windows копия переменных, в отличие от главного потока,
  учитывает регистр.
* [`process.title`](process.md#processtitle) нельзя изменить.
* Сигналы не доставляются через [`process.on('...')`](process.md#signal-events).
* Выполнение может прерваться в любой момент при [`worker.terminate()`](#workerterminate).
* IPC-каналы родительского процесса недоступны.
* Модуль [`trace_events`](tracing.md) не поддерживается.
* Нативные аддоны в нескольких потоках — только при выполнении
  [условий][Addons worker support].

`Worker` можно создавать внутри других `Worker`.

Как у [Web Workers][Web Workers] и модуля [`node:cluster`](cluster.md), двусторонняя связь
достижима через передачу сообщений. У `Worker` внутри есть пара
связанных [`MessagePort`](#class-messageport), созданных при инициализации. Родительский
`MessagePort` не экспонируется напрямую; функции доступны через
[`worker.postMessage()`](#workerpostmessagevalue-transferlist) и событие [`worker.on('message')`](#event-message_1)
у объекта `Worker` в родительском потоке.

Для своих каналов связи (предпочтительнее глобального канала из‑за разделения ответственности) можно создать
`MessageChannel` в любом потоке и передать один из
`MessagePort` другому потоку через уже существующий канал, например глобальный.

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

### `new Worker(filename[, options])`

<!-- YAML
added: v10.5.0
changes:
  - version:
    - v19.8.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46832
    description: Added support for a `name` option, which allows
                 adding a name to worker title for debugging.
  - version: v14.9.0
    pr-url: https://github.com/nodejs/node/pull/34584
    description: The `filename` parameter can be a WHATWG `URL` object using
                 `data:` protocol.
  - version: v14.9.0
    pr-url: https://github.com/nodejs/node/pull/34394
    description: The `trackUnmanagedFds` option was set to `true` by default.
  - version:
    - v14.6.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/34303
    description: The `trackUnmanagedFds` option was introduced.
  - version:
     - v13.13.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32278
    description: The `transferList` option was introduced.
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31664
    description: The `filename` parameter can be a WHATWG `URL` object using
                 `file:` protocol.
  - version:
     - v13.4.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30559
    description: The `argv` option was introduced.
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/26628
    description: The `resourceLimits` option was introduced.
-->

Добавлено в: v10.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.8.0, v18.16.0 | Добавлена поддержка опции `name` для отладки (имя в заголовке worker). |
    | v14.9.0 | Параметр filename может быть объектом URL WHATWG, использующим протокол data:. |
    | v14.9.0 | По умолчанию для параметра trackUnmanagedFds установлено значение true. |
    | v14.6.0, v12.19.0 | Была введена опция trackUnmanagedFds. |
    | v13.13.0, v12.17.0 | Была введена опция «transferList». |
    | v13.12.0, v12.17.0 | Параметр filename может быть объектом URL WHATWG, использующим протокол file:. |
    | v13.4.0, v12.16.0 | Была введена опция `argv`. |
    | v13.2.0, v12.16.0 | Была введена опция `resourceLimits`. |

* `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Путь к основному скрипту или модулю Worker. Должен быть либо абсолютным путём, либо относительным (относительно текущего рабочего каталога) с префиксом `./` или `../`, либо объектом WHATWG `URL` с протоколом `file:` или `data:`.
  При использовании [`data:` URL](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data) данные интерпретируются по MIME-типу с помощью [загрузчика модулей ECMAScript][ECMAScript module loader].
  Если `options.eval` равен `true`, это строка с кодом JavaScript, а не путь.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `argv` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Список аргументов, которые преобразуются в строки и добавляются к `process.argv` в worker. По смыслу близко к `workerData`, но значения доступны в глобальном `process.argv`, как если бы они были переданы скрипту в командной строке.
  * `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если задано, задаёт начальное значение `process.env` в потоке Worker. В качестве особого значения можно указать [`worker.SHARE_ENV`](#worker_threadsshare_env), чтобы родительский и дочерний потоки разделяли переменные окружения; тогда изменения объекта `process.env` в одном потоке видны и в другом. **По умолчанию:** `process.env`.
  * `eval` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true` и первый аргумент — строка, первый аргумент конструктора трактуется как скрипт, выполняемый после перехода worker в состояние online.
  * `execArgv` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список опций CLI Node.js, передаваемых worker. Опции V8 (например `--max-old-space-size`) и опции, влияющие на процесс (например `--title`), не поддерживаются. Если задано, внутри worker доступно как [`process.execArgv`](process.md#processexecargv). По умолчанию опции наследуются от родительского потока.
  * `stdin` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `worker.stdin` — поток записи, содержимое которого попадает в `process.stdin` внутри Worker. По умолчанию данные не подаются.
  * `stdout` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `worker.stdout` не перенаправляется автоматически в `process.stdout` родителя.
  * `stderr` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `worker.stderr` не перенаправляется автоматически в `process.stderr` родителя.
  * `workerData` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое значение JavaScript, клонируемое и доступное как [`require('node:worker_threads').workerData`](#worker_threadsworkerdata). Клонирование выполняется по [алгоритму структурированного клонирования HTML][HTML structured clone algorithm]; если объект клонировать нельзя (например, из‑за наличия `function`), выбрасывается ошибка.
  * `trackUnmanagedFds` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, Worker отслеживает «сырые» дескрипторы файлов, открытые через [`fs.open()`](fs.md#fsopenpath-flags-mode-callback) и [`fs.close()`](fs.md#fsclosefd-callback), и закрывает их при завершении Worker, аналогично другим ресурсам (сетевые сокеты, дескрипторы через API [`FileHandle`](fs.md#class-filehandle)). Опция автоматически наследуется всеми вложенными `Worker`. **По умолчанию:** `true`.
  * `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если в `workerData` передан один или несколько объектов, похожих на `MessagePort`, для них нужен `transferList`, иначе выбрасывается [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`](errors.md#err_missing_message_port_in_transfer_list). Подробнее см. [`port.postMessage()`](#portpostmessagevalue-transferlist).
  * `resourceLimits` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный набор ограничений ресурсов для нового экземпляра JS-движка. При достижении лимитов экземпляр `Worker` завершается. Ограничения действуют только на движок JS, не на внешние данные, в том числе на `ArrayBuffer`. Даже при заданных лимитах процесс может аварийно завершиться при глобальной нехватке памяти.
    * `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер основной кучи в МБ. Если задан аргумент командной строки [`--max-old-space-size`](cli.md#--max-old-space-sizesize-in-mib), он переопределяет это значение.
    * `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер области кучи для недавно созданных объектов. Если задан аргумент [`--max-semi-space-size`](cli.md#--max-semi-space-sizesize-in-mib), он переопределяет это значение.
    * `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Размер заранее выделенного диапазона памяти для сгенерированного кода.
    * `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальный размер стека потока по умолчанию. Слишком малые значения могут сделать экземпляры Worker непригодными. **По умолчанию:** `4`.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное имя `name`, подставляемое в имя потока и заголовок worker для отладки и идентификации; итоговый заголовок вида `[worker ${id}] ${name}`.
    Максимальная длина зависит от ОС. Если имя длиннее допустимого, оно обрезается.
    * Максимальные размеры:
      * Windows: 32 767 символов
      * macOS: 64 символа
      * Linux: 16 символов
      * NetBSD: ограничено `PTHREAD_MAX_NAMELEN_NP`
      * FreeBSD и OpenBSD: ограничено `MAXCOMLEN`
        **По умолчанию:** `'WorkerThread'`.

### Event: `'error'`

<!-- YAML
added: v10.5.0
-->

* `err` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Событие `'error'` генерируется, если в потоке worker выброшено необработанное
исключение. В этом случае worker завершается.

### Event: `'exit'`

<!-- YAML
added: v10.5.0
-->

* `exitCode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'exit'` генерируется после остановки worker. Если worker завершился
вызовом [`process.exit()`](process.md#processexitcode), параметр `exitCode` — переданный код выхода.
Если worker был принудительно завершён, `exitCode` равен `1`.

Это последнее событие, которое генерирует любой экземпляр `Worker`.

### Event: `'message'`

<!-- YAML
added: v10.5.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Переданное значение

Событие `'message'` генерируется, когда поток worker вызывает
[`require('node:worker_threads').parentPort.postMessage()`](#workerpostmessagevalue-transferlist).
Подробнее см. событие [`port.on('message')`](#event-message).

Все сообщения, отправленные из потока worker, доставляются до генерации
события [`'exit'`](#event-exit) на объекте `Worker`.

### Event: `'messageerror'`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект Error

Событие `'messageerror'` генерируется при ошибке десериализации сообщения.

### Event: `'online'`

<!-- YAML
added: v10.5.0
-->

Событие `'online'` генерируется, когда поток worker начал выполнение
кода JavaScript.

### `worker.cpuUsage([prev])`

<!-- YAML
added:
 - v24.6.0
 - v22.19.0
-->

* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Метод возвращает `Promise`, который выполнится объектом, совпадающим с [`process.threadCpuUsage()`](process.md#processthreadcpuusagepreviousvalue),
или будет отклонён с [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running), если worker уже не работает.
Позволяет получать статистику использования CPU потока извне, не находясь в нём.

### `worker.getHeapSnapshot([options])`

<!-- YAML
added:
 - v13.9.0
 - v12.17.0
changes:
  - version: v19.1.0
    pr-url: https://github.com/nodejs/node/pull/44989
    description: Support options to configure the heap snapshot.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.1.0 | Поддержка параметров настройки снимка кучи. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `exposeInternals` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, в снимок кучи включаются внутренности движка.
    **По умолчанию:** `false`.
  * `exposeNumericValues` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, числовые значения попадают в
    искусственные поля. **По умолчанию:** `false`.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Промис с потоком чтения (`Readable`), содержащим
  снимок кучи V8

Возвращает поток чтения со снимком V8 текущего состояния Worker.
Подробнее см. [`v8.getHeapSnapshot()`](v8.md#v8getheapsnapshotoptions).

Если поток Worker уже не выполняется (это возможно до генерации
события [`'exit'`](#event-exit)), возвращённый `Promise` сразу отклоняется
с ошибкой [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running).

### `worker.getHeapStatistics()`

<!-- YAML
added:
- v24.0.0
- v22.16.0
-->

* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Метод возвращает `Promise`, который выполнится объектом, совпадающим с [`v8.getHeapStatistics()`](v8.md#v8getheapstatistics),
или будет отклонён с [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running), если worker уже не работает.
Позволяет получать статистику кучи извне, не находясь в потоке worker.

### `worker.performance`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
  - v12.22.0
-->

Объект для запроса сведений о производительности экземпляра worker.

#### `performance.eventLoopUtilization([utilization1[, utilization2]])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
  - v12.22.0
-->

* `utilization1` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова
  `eventLoopUtilization()`.
* `utilization2` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова
  `eventLoopUtilization()` до момента `utilization1`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `active` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Тот же вызов, что и [`perf_hooks` `eventLoopUtilization()`](perf_hooks.md#perf_hookseventlooputilizationutilization1-utilization2), но возвращаются значения
для экземпляра worker.

Отличие: в отличие от главного потока, инициализация в worker выполняется
внутри цикла событий, поэтому загрузку цикла событий можно измерить сразу
после начала выполнения скрипта worker.

Если время `idle` не растёт, это не значит, что worker «застрял» в
инициализации. Ниже показано, как за всё время жизни worker не накапливается
`idle`, но сообщения всё равно обрабатываются.

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

Загрузку цикла событий worker можно получить только после генерации события [`'online'`](#event-online); при вызове до этого или после события [`'exit'`](#event-exit)
все свойства равны `0`.

### `worker.postMessage(value[, transferList])`

<!-- YAML
added: v10.5.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* `transferList` [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Отправляет сообщение worker; оно принимается в
[`require('node:worker_threads').parentPort.on('message')`](#event-message).
Подробнее см. [`port.postMessage()`](#portpostmessagevalue-transferlist).

### `worker.ref()`

<!-- YAML
added: v10.5.0
-->

Противоположность `unref()`: вызов `ref()` у ранее `unref()`ed worker _не_
даёт процессу завершиться, если это единственный активный handle (поведение
по умолчанию). Если worker уже `ref()`ed, повторный `ref()` не действует.

### `worker.resourceLimits`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

* Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт ограничения ресурсов JS-движка для этого потока Worker.
Если в конструктор [`Worker`](#class-worker) передавалась опция `resourceLimits`,
значения совпадают с ней.

Если worker остановлен, возвращается пустой объект.

### `worker.startCpuProfile()`

<!-- YAML
added: v24.8.0
-->

* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Запускает профиль CPU и возвращает `Promise`, который выполняется с ошибкой
или объектом `CPUProfileHandle`. Этот API поддерживает синтаксис `await using`.

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
      // Stop profile automatically when return and profile will be discarded
      await using handle = await w.startCpuProfile();
    });
    ```

### `worker.startHeapProfile([options])`

<!-- YAML
added:
  - v24.9.0
  - v22.20.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `sampleInterval` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Средний интервал выборки в байтах.
    **По умолчанию:** `524288` (512 KiB).
  * `stackDepth` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальная глубина стека для образцов.
    **По умолчанию:** `16`.
  * `forceGC` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Принудительная сборка мусора перед снятием профиля.
    **По умолчанию:** `false`.
  * `includeObjectsCollectedByMajorGC` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включать объекты, собранные
    major GC. **По умолчанию:** `false`.
  * `includeObjectsCollectedByMinorGC` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включать объекты, собранные
    minor GC. **По умолчанию:** `false`.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Запускает профиль кучи и возвращает `Promise`, который выполняется с ошибкой
или объектом `HeapProfileHandle`. Этот API поддерживает синтаксис `await using`.

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
      // Stop profile automatically when return and profile will be discarded
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
      // Stop profile automatically when return and profile will be discarded
      await using handle = await w.startHeapProfile();
    });
    ```

### `worker.stderr`

<!-- YAML
added: v10.5.0
-->

* Тип: [`<stream.Readable>`](stream.md#streamreadable)

Поток чтения с данными, записанными в [`process.stderr`](process.md#processstderr)
внутри потока worker. Если в конструктор [`Worker`](#class-worker) не передано `stderr: true`,
данные перенаправляются в [`process.stderr`](process.md#processstderr) родительского потока.

### `worker.stdin`

<!-- YAML
added: v10.5.0
-->

* Тип: null | [`<stream.Writable>`](stream.md#streamwritable)

Если в конструктор [`Worker`](#class-worker) передано `stdin: true`, это поток
записи. Данные, записанные в него, доступны в потоке worker как [`process.stdin`](process.md#processstdin).

### `worker.stdout`

<!-- YAML
added: v10.5.0
-->

* Тип: [`<stream.Readable>`](stream.md#streamreadable)

Поток чтения с данными, записанными в [`process.stdout`](process.md#processstdout)
внутри потока worker. Если в конструктор [`Worker`](#class-worker) не передано `stdout: true`,
данные перенаправляются в [`process.stdout`](process.md#processstdout) родительского потока.

### `worker.terminate()`

<!-- YAML
added: v10.5.0
changes:
  - version: v12.5.0
    pr-url: https://github.com/nodejs/node/pull/28021
    description: This function now returns a Promise.
                 Passing a callback is deprecated, and was useless up to this
                 version, as the Worker was actually terminated synchronously.
                 Terminating is now a fully asynchronous operation.
-->

Добавлено в: v10.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v12.5.0 | Эта функция теперь возвращает обещание. Передача обратного вызова устарела и была бесполезна до этой версии, поскольку Worker фактически завершался синхронно. Завершение теперь является полностью асинхронной операцией. |

* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Останавливает выполнение JavaScript в потоке worker как можно скорее.
Возвращает `Promise` с кодом выхода, который выполняется при генерации
события [`'exit'`](#event-exit).

### `worker.threadId`

<!-- YAML
added: v10.5.0
-->

* Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор соответствующего потока. В потоке worker
доступен как [`require('node:worker_threads').threadId`](#worker_threadsthreadid).
Уникален для каждого экземпляра `Worker` в одном процессе.

### `worker.threadName`

<!-- YAML
added:
  - v24.6.0
  - v22.20.0
-->

* [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строковый идентификатор потока или `null`, если поток не выполняется.
В потоке worker доступен как [`require('node:worker_threads').threadName`](#worker_threadsthreadname).

### `worker.unref()`

<!-- YAML
added: v10.5.0
-->

Вызов `unref()` у worker позволяет потоку завершиться, если это единственный
активный handle в системе событий. Если worker уже `unref()`ed, повторный
`unref()` не действует.

### `worker[Symbol.asyncDispose]()`

<!-- YAML
added:
 - v24.2.0
 - v22.18.0
-->

Вызывает [`worker.terminate()`](#workerterminate) при выходе из области dispose.

```js
async function example() {
  await using worker = new Worker('for (;;) {}', { eval: true });
  // Worker is automatically terminate when the scope is exited.
}
```

## Примечания

### Синхронная блокировка stdio

Экземпляры `Worker` используют передачу сообщений через [MessagePort](worker_threads.md#class-messageport) для взаимодействия
со `stdio`. Поэтому вывод `stdio` из worker может блокироваться синхронным кодом на принимающей стороне,
который удерживает цикл событий Node.js.

=== "MJS"

    ```js
    import {
      Worker,
      isMainThread,
    } from 'node:worker_threads';
    
    if (isMainThread) {
      new Worker(new URL(import.meta.url));
      for (let n = 0; n < 1e10; n++) {
        // Looping to simulate work.
      }
    } else {
      // This output will be blocked by the for loop in the main thread.
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
        // Looping to simulate work.
      }
    } else {
      // This output will be blocked by the for loop in the main thread.
      console.log('foo');
    }
    ```

### Запуск потоков worker из preload-скриптов

Будьте осторожны при запуске потоков worker из preload-скриптов (скриптов, подключаемых
флагом `-r`). Пока явно не задана опция `execArgv`, новые потоки Worker наследуют флаги командной строки
текущего процесса и подгружают те же preload-скрипты, что и главный поток. Если preload-скрипт безусловно
создаёт поток worker, каждый новый поток породит ещё один, пока приложение не упадёт.

[Addons worker support]: addons.md#worker-support
[ECMAScript module loader]: esm.md#data-imports
[HTML structured clone algorithm]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm
[LockManager]: #class-lockmanager
[Signals events]: process.md#signal-events
[Web Workers]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
[`'close'` event]: #event-close
[`'exit'` event]: #event-exit
[`'online'` event]: #event-online
[`--max-old-space-size`]: cli.md#--max-old-space-sizesize-in-mib
[`--max-semi-space-size`]: cli.md#--max-semi-space-sizesize-in-mib
[`AsyncResource`]: async_hooks.md#class-asyncresource
[`Buffer.allocUnsafe()`]: buffer.md#static-method-bufferallocunsafesize
[`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`]: errors.md#err_missing_message_port_in_transfer_list
[`ERR_WORKER_MESSAGING_ERRORED`]: errors.md#err_worker_messaging_errored
[`ERR_WORKER_MESSAGING_FAILED`]: errors.md#err_worker_messaging_failed
[`ERR_WORKER_MESSAGING_SAME_THREAD`]: errors.md#err_worker_messaging_same_thread
[`ERR_WORKER_MESSAGING_TIMEOUT`]: errors.md#err_worker_messaging_timeout
[`ERR_WORKER_NOT_RUNNING`]: errors.md#err_worker_not_running
[`FileHandle`]: fs.md#class-filehandle
[`MessagePort`]: #class-messageport
[`WebAssembly.Module`]: https://developer.mozilla.org/en-US/docs/WebAssembly/Reference/JavaScript_interface/Module
[`Worker constructor options`]: #new-workerfilename-options
[`Worker`]: #class-worker
[`data:` URL]: https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data
[`fs.close()`]: fs.md#fsclosefd-callback
[`fs.open()`]: fs.md#fsopenpath-flags-mode-callback
[`markAsUntransferable()`]: #worker_threadsmarkasuntransferableobject
[`node:cluster` module]: cluster.md
[`perf_hooks` `eventLoopUtilization()`]: perf_hooks.md#perf_hookseventlooputilizationutilization1-utilization2
[`port.on('message')`]: #event-message
[`port.onmessage()`]: https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/message_event
[`port.postMessage()`]: #portpostmessagevalue-transferlist
[`process.abort()`]: process.md#processabort
[`process.chdir()`]: process.md#processchdirdirectory
[`process.env`]: process.md#processenv
[`process.execArgv`]: process.md#processexecargv
[`process.exit()`]: process.md#processexitcode
[`process.stderr`]: process.md#processstderr
[`process.stdin`]: process.md#processstdin
[`process.stdout`]: process.md#processstdout
[`process.threadCpuUsage()`]: process.md#processthreadcpuusagepreviousvalue
[`process.title`]: process.md#processtitle
[`require('node:worker_threads').isMainThread`]: #worker_threadsismainthread
[`require('node:worker_threads').parentPort.on('message')`]: #event-message
[`require('node:worker_threads').parentPort.postMessage()`]: #workerpostmessagevalue-transferlist
[`require('node:worker_threads').parentPort`]: #worker_threadsparentport
[`require('node:worker_threads').threadId`]: #worker_threadsthreadid
[`require('node:worker_threads').threadName`]: #worker_threadsthreadname
[`require('node:worker_threads').workerData`]: #worker_threadsworkerdata
[`trace_events`]: tracing.md
[`v8.getHeapSnapshot()`]: v8.md#v8getheapsnapshotoptions
[`v8.getHeapStatistics()`]: v8.md#v8getheapstatistics
[`vm`]: vm.md
[`worker.SHARE_ENV`]: #worker_threadsshare_env
[`worker.on('message')`]: #event-message_1
[`worker.postMessage()`]: #workerpostmessagevalue-transferlist
[`worker.terminate()`]: #workerterminate
[`worker.threadId`]: #workerthreadid
[`worker.threadName`]: #workerthreadname
[async-resource-worker-pool]: async_context.md#using-asyncresource-for-a-worker-thread-pool
[browser `LockManager`]: https://developer.mozilla.org/en-US/docs/Web/API/LockManager
[browser `MessagePort`]: https://developer.mozilla.org/en-US/docs/Web/API/MessagePort
[child processes]: child_process.md
[contextified]: vm.md#what-does-it-mean-to-contextify-an-object
[locks.request()]: #locksrequestname-options-callback
[v8.serdes]: v8.md#serialization-api
