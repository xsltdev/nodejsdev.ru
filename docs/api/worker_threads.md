---
title: Worker threads
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

Реализуя пул, применяйте API [`AsyncResource`][`AsyncResource`], чтобы диагностические инструменты
(например трассировки асинхронного стека) видели связь задач с результатами. Пример —
в разделе [«Использование `AsyncResource` для пула потоков `Worker`»][async-resource-worker-pool]
документации `async_hooks`.

Потоки worker по умолчанию наследуют опции, не зависящие от процесса. См.
[`Worker constructor options`][`Worker constructor options`] — настройка `argv` и `execArgv`.

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

* `key` {any} Произвольное клонируемое значение JavaScript, пригодное в качестве
  ключа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
* Возвращает: {any}

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

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Is `true` if this code is running inside of an internal [`Worker`][`Worker`] thread (e.g the loader thread).

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

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Is `true` if this code is not running inside of a [`Worker`][`Worker`] thread.

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

* `object` {any} Произвольное значение JavaScript.

Помечает объект как непередаваемый. Если `object` попадает в список передачи вызова
[`port.postMessage()`][`port.postMessage()`], выбрасывается ошибка. Для примитивных значений
`object` ничего не делает.

Это уместно для объектов, которые клонируются, а не
передаются, и используются другими объектами на стороне отправителя.
Например, Node.js помечает так `ArrayBuffer`, используемые для
[`Buffer` pool][`Buffer.allocUnsafe()`].
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

* `object` {any} Любое значение JavaScript.
* Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, помечен ли объект как непередаваемый через
[`markAsUntransferable()`][`markAsUntransferable()`].

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

* `object` {any} Произвольное значение JavaScript.

Помечает объект как неклонируемый. Если `object` используется как [`message`](#event-message) в
вызове [`port.postMessage()`][`port.postMessage()`], выбрасывается ошибка. Для примитивных значений `object` ничего не делает.

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

* `port` [<MessagePort>](worker_threads.md#class-messageport) Передаваемый порт сообщений.

* `contextifiedSandbox` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [контекстифицированный][contextified] объект, возвращённый
  методом `vm.createContext()`.

* Возвращает: [<MessagePort>](worker_threads.md#class-messageport)

Передаёт `MessagePort` в другой [`vm`][`vm`] Context. Исходный объект `port`
становится непригодным, на его месте используется возвращённый `MessagePort`.

Возвращённый `MessagePort` — объект в целевом контексте и
наследует глобальный класс `Object`. Объекты, передаваемые в слушатель
[`port.onmessage()`][`port.onmessage()`], тоже создаются в целевом контексте
и наследуют его глобальный класс `Object`.

Однако созданный `MessagePort` больше не наследует
[EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget), для получения событий можно использовать только [`port.onmessage()`][`port.onmessage()`].

## `worker_threads.parentPort`

<!-- YAML
added: v10.5.0
-->

* Тип: null | [<MessagePort>](worker_threads.md#class-messageport)

Если этот поток — [`Worker`][`Worker`], это [`MessagePort`][`MessagePort`]
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

* `threadId` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID целевого потока. Если ID недействителен,
  выбрасывается [`ERR_WORKER_MESSAGING_FAILED`][`ERR_WORKER_MESSAGING_FAILED`]. Если ID совпадает с текущим потоком,
  выбрасывается [`ERR_WORKER_MESSAGING_SAME_THREAD`][`ERR_WORKER_MESSAGING_SAME_THREAD`].
* `value` {any} Отправляемое значение.
* `transferList` [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если в `value` передаются один или несколько объектов, похожих на `MessagePort`,
  для них нужен `transferList`, иначе выбрасывается [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`][`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`].
  См. [`port.postMessage()`][`port.postMessage()`].
* `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидание доставки сообщения в миллисекундах.
  **По умолчанию:** `undefined` — ждать бесконечно. При таймауте
  выбрасывается [`ERR_WORKER_MESSAGING_TIMEOUT`][`ERR_WORKER_MESSAGING_TIMEOUT`].
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) промис выполняется, если целевой поток успешно обработал сообщение.

Отправляет значение другому worker, определяемому по ID потока.

Если в целевом потоке нет слушателя события `workerMessage`, выбрасывается
[`ERR_WORKER_MESSAGING_FAILED`][`ERR_WORKER_MESSAGING_FAILED`].

Если целевой поток выбросил ошибку при обработке `workerMessage`, выбрасывается
[`ERR_WORKER_MESSAGING_ERRORED`][`ERR_WORKER_MESSAGING_ERRORED`].

Этот метод нужен, когда целевой поток не является прямым
родителем или дочерним для текущего.
Если потоки в отношении родитель–дочерний, используйте [`require('node:worker_threads').parentPort.postMessage()`][`require('node:worker_threads').parentPort.postMessage()`]
и [`worker.postMessage()`][`worker.postMessage()`].

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

* `port` [<MessagePort>](worker_threads.md#class-messageport) | [<BroadcastChannel>](worker_threads.md)

* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined

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

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `maxYoungGenerationSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `maxOldGenerationSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `codeRangeSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `stackSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Задаёт ограничения ресурсов JS-движка в этом потоке Worker.
Если в конструктор [`Worker`][`Worker`] передавалась опция `resourceLimits`,
значения совпадают с ней.

В главном потоке значение — пустой объект.

## `worker_threads.SHARE_ENV`

<!-- YAML
added: v11.14.0
-->

* Тип: [<symbol>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)

Специальное значение для опции `env` конструктора [`Worker`][`Worker`]:
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

* `key` {any} Произвольное клонируемое значение JavaScript, пригодное в качестве
  ключа [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).
* `value` {any} Произвольное клонируемое значение; клонируется
  и автоматически передаётся всем новым `Worker`. Если передать `undefined`,
  ранее заданное значение для `key` удаляется.

API `worker.setEnvironmentData()` задаёт содержимое
`worker.getEnvironmentData()` в текущем потоке и во всех новых `Worker`,
созданных из текущего контекста.

## `worker_threads.threadId`

<!-- YAML
added: v10.5.0
-->

* Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор текущего потока. На соответствующем объекте worker
(если есть) доступен как [`worker.threadId`][`worker.threadId`].
Уникален для каждого [`Worker`][`Worker`] в одном процессе.

## `worker_threads.threadName`

<!-- YAML
added:
  - v24.6.0
  - v22.20.0
-->

* [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

Строковый идентификатор текущего потока или `null`, если поток не выполняется.
На соответствующем объекте worker (если есть) доступен как [`worker.threadName`][`worker.threadName`].

## `worker_threads.workerData`

<!-- YAML
added: v10.5.0
-->

Произвольное значение JavaScript — клон данных, переданных
в конструктор `Worker` этого потока.

Данные клонируются как при [`postMessage()`][`port.postMessage()`],
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

Экземпляр [`LockManager`][LockManager] для координации
доступа к ресурсам, общим для нескольких потоков одного
процесса. Семантика соответствует
[браузерному `LockManager`][browser `LockManager`]

### Класс: `Lock`

<!-- YAML
added: v24.5.0
-->

Интерфейс `Lock` описывает блокировку, выданную через
[`locks.request()`][locks.request()]

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

Реализация соответствует API [browser `LockManager`][browser `LockManager`].

#### `locks.request(name[, options], callback)`

<!-- YAML
added: v24.5.0
-->

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `mode` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'exclusive'` или `'shared'`. **По умолчанию:** `'exclusive'`.
  * `ifAvailable` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, запрос удовлетворяется только если
    блокировка ещё не удерживается. Иначе `callback` вызывается
    с `null` вместо `Lock`. **По умолчанию:** `false`.
  * `steal` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, существующие блокировки с тем же именем
    снимаются и запрос выполняется сразу, опережая очередь.
    **По умолчанию:** `false`.
  * `signal` [<AbortSignal>](globals.md#abortsignal) для отмены ожидающего
    (ещё не выданного) запроса блокировки.
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается после выдачи блокировки (или сразу с
  `null`, если `ifAvailable` равен `true` и блокировка недоступна). Блокировка
  снимается при возврате из функции или, если возвращается промис, после его завершения.
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) выполняется после снятия блокировки.

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

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

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

* `name` {any} Имя канала. Допустимо любое значение JavaScript,
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

* Тип: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается с одним аргументом `MessageEvent`
  при получении сообщения.

### `broadcastChannel.onmessageerror`

<!-- YAML
added: v15.4.0
-->

* Тип: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, если входящее сообщение нельзя
  десериализовать.

### `broadcastChannel.postMessage(message)`

<!-- YAML
added: v15.4.0
-->

* `message` {any} Любое клонируемое значение JavaScript.

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
экземпляры [`MessagePort`][`MessagePort`].

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

* Extends: [<EventTarget>](https://dom.spec.whatwg.org/#interface-eventtarget)

Класс `worker.MessagePort` — один конец асинхронного
двустороннего канала. Через него передают
структурированные данные, области памяти и другие `MessagePort` между
разными [`Worker`][`Worker`].

Реализация соответствует [browser `MessagePort`][browser `MessagePort`].

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

* `value` {any} Переданное значение

Событие `'message'` генерируется для каждого входящего сообщения с клоном
аргумента [`port.postMessage()`][`port.postMessage()`].

Слушатели получают клон параметра `value`, как в
`postMessage()`, без дополнительных аргументов.

### Event: `'messageerror'`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

* `error` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект Error

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

Событие [`'close'`][`'close'` event] генерируется на обоих `MessagePort`
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
    | v15.14.0, v14.18.0 | Добавьте «BlockList» в список клонируемых типов. |
    | v15.9.0, v14.18.0 | Добавьте типы «Гистограммы» в список клонируемых типов. |
    | v15.6.0 | В список клонируемых типов добавлен X509Certificate. |
    | v15.0.0 | В список клонируемых типов добавлен «CryptoKey». |
    | v14.5.0, v12.19.0 | В список клонируемых типов добавлен KeyObject. |
    | v14.5.0, v12.19.0 | В список передаваемых типов добавлен FileHandle. |

* `value` {any}
* `transferList` [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Отправляет значение JavaScript на приёмную сторону канала.
`value` передаётся совместимо с
[алгоритмом структурированного клонирования HTML][HTML structured clone algorithm].

Отличия от `JSON`:

* `value` может содержать циклические ссылки.
* `value` может содержать встроенные типы JS: `RegExp`,
  `BigInt`, `Map`, `Set` и т.д.
* `value` может содержать типизированные массивы на `ArrayBuffer`
  и `SharedArrayBuffer`.
* `value` может содержать экземпляры [`WebAssembly.Module`][`WebAssembly.Module`].
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

`transferList` — список [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`MessagePort`][`MessagePort`] и
[`FileHandle`][`FileHandle`].
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
[API сериализации модуля `node:v8`][v8.serdes].

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

`ArrayBuffer` можно пометить [`markAsUntransferable()`][`markAsUntransferable()`], чтобы
он всегда клонировался, а не передавался.

В зависимости от создания `Buffer` он может
владеть или не владеть своим `ArrayBuffer`. Передавать `ArrayBuffer` нельзя,
если неизвестно, владеет ли им `Buffer`. Для `Buffer` из внутреннего
пула (`Buffer.from()`, `Buffer.allocUnsafe()` и т.п.)
передача невозможна — всегда клонирование,
что может копировать весь пул `Buffer`.
Это ведёт к лишнему расходу памяти и рискам безопасности.

См. [`Buffer.allocUnsafe()`][`Buffer.allocUnsafe()`] о пуле `Buffer`.

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

* Возвращает: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

* Extends: [<EventEmitter>](events.md#class-eventemitter)

Класс `Worker` представляет независимый поток выполнения JavaScript.
Большинство API Node.js в нём доступно.

Отличия среды Worker:

* Потоки [`process.stdin`][`process.stdin`], [`process.stdout`][`process.stdout`], [`process.stderr`][`process.stderr`]
  могут перенаправлять родительский поток.
* Свойство [`require('node:worker_threads').isMainThread`][`require('node:worker_threads').isMainThread`] равно `false`.
* Доступен порт сообщений [`require('node:worker_threads').parentPort`][`require('node:worker_threads').parentPort`].
* [`process.exit()`][`process.exit()`] завершает только этот поток, не всю программу;
  [`process.abort()`][`process.abort()`] недоступен.
* [`process.chdir()`][`process.chdir()`] и методы `process` для смены группы/пользователя
  недоступны.
* [`process.env`][`process.env`] — копия переменных окружения родителя,
  если не указано иное. Изменения в одной копии не видны другим
  потокам и нативным аддонам (кроме случая
  [`worker.SHARE_ENV`][`worker.SHARE_ENV`] в опции `env` конструктора
  [`Worker`][`Worker`]). В Windows копия переменных, в отличие от главного потока,
  учитывает регистр.
* [`process.title`][`process.title`] нельзя изменить.
* Сигналы не доставляются через [`process.on('...')`][Signals events].
* Выполнение может прерваться в любой момент при [`worker.terminate()`][`worker.terminate()`].
* IPC-каналы родительского процесса недоступны.
* Модуль [`trace_events`][`trace_events`] не поддерживается.
* Нативные аддоны в нескольких потоках — только при выполнении
  [условий][Addons worker support].

`Worker` можно создавать внутри других `Worker`.

Как у [Web Workers][Web Workers] и модуля [`node:cluster`][`node:cluster` module], двусторонняя связь
достижима через передачу сообщений. У `Worker` внутри есть пара
связанных [`MessagePort`][`MessagePort`], созданных при инициализации. Родительский
`MessagePort` не экспонируется напрямую; функции доступны через
[`worker.postMessage()`][`worker.postMessage()`] и событие [`worker.on('message')`][`worker.on('message')`]
у объекта `Worker` в родительском потоке.

Для своих каналов связи (предпочтительнее глобального канала из‑за разделения ответственности) можно создать
`MessageChannel` в любом потоке и передать один из
`MessagePort` другому потоку через уже существующий канал, например глобальный.

Подробнее о передаче сообщений и допустимых значениях см. [`port.postMessage()`][`port.postMessage()`].

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
    | v19.8.0, v18.16.0 | Добавлена ​​поддержка опции name, которая позволяет добавлять имя к заголовку работника для отладки. |
    | v14.9.0 | Параметр filename может быть объектом URL WHATWG, использующим протокол data:. |
    | v14.9.0 | По умолчанию для параметра trackUnmanagedFds установлено значение true. |
    | v14.6.0, v12.19.0 | Была введена опция trackUnmanagedFds. |
    | v13.13.0, v12.17.0 | Была введена опция «transferList». |
    | v13.12.0, v12.17.0 | Параметр filename может быть объектом URL WHATWG, использующим протокол file:. |
    | v13.4.0, v12.16.0 | Была введена опция `argv`. |
    | v13.2.0, v12.16.0 | Была введена опция `resourceLimits`. |

* `filename` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<URL>](url.md#the-whatwg-url-api) The path to the Worker's main script or module. Must
  be either an absolute path or a relative path (i.e. relative to the
  current working directory) starting with `./` or `../`, or a WHATWG `URL`
  object using `file:` or `data:` protocol.
  When using a [`data:` URL][`data:` URL], the data is interpreted based on MIME type using
  the [ECMAScript module loader][ECMAScript module loader].
  If `options.eval` is `true`, this is a string containing JavaScript code
  rather than a path.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `argv` {any\[]} List of arguments which would be stringified and appended to
    `process.argv` in the worker. This is mostly similar to the `workerData`
    but the values are available on the global `process.argv` as if they
    were passed as CLI options to the script.
  * `env` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) If set, specifies the initial value of `process.env` inside
    the Worker thread. As a special value, [`worker.SHARE_ENV`][`worker.SHARE_ENV`] may be used
    to specify that the parent thread and the child thread should share their
    environment variables; in that case, changes to one thread's `process.env`
    object affect the other thread as well. **Default:** `process.env`.
  * `eval` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true` and the first argument is a `string`, interpret
    the first argument to the constructor as a script that is executed once the
    worker is online.
  * `execArgv` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) List of node CLI options passed to the worker.
    V8 options (such as `--max-old-space-size`) and options that affect the
    process (such as `--title`) are not supported. If set, this is provided
    as [`process.execArgv`][`process.execArgv`] inside the worker. By default, options are
    inherited from the parent thread.
  * `stdin` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If this is set to `true`, then `worker.stdin`
    provides a writable stream whose contents appear as `process.stdin`
    inside the Worker. By default, no data is provided.
  * `stdout` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If this is set to `true`, then `worker.stdout` is
    not automatically piped through to `process.stdout` in the parent.
  * `stderr` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If this is set to `true`, then `worker.stderr` is
    not automatically piped through to `process.stderr` in the parent.
  * `workerData` {any} Any JavaScript value that is cloned and made
    available as [`require('node:worker_threads').workerData`][`require('node:worker_threads').workerData`]. The cloning
    occurs as described in the [HTML structured clone algorithm][HTML structured clone algorithm], and an error
    is thrown if the object cannot be cloned (e.g. because it contains
    `function`s).
  * `trackUnmanagedFds` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If this is set to `true`, then the Worker
    tracks raw file descriptors managed through [`fs.open()`][`fs.open()`] and
    [`fs.close()`][`fs.close()`], and closes them when the Worker exits, similar to other
    resources like network sockets or file descriptors managed through
    the [`FileHandle`][`FileHandle`] API. This option is automatically inherited by all
    nested `Worker`s. **Default:** `true`.
  * `transferList` [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) If one or more `MessagePort`-like objects
    are passed in `workerData`, a `transferList` is required for those
    items or [`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`][`ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST`] is thrown.
    See [`port.postMessage()`][`port.postMessage()`] for more information.
  * `resourceLimits` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An optional set of resource limits for the new JS
    engine instance. Reaching these limits leads to termination of the `Worker`
    instance. These limits only affect the JS engine, and no external data,
    including no `ArrayBuffer`s. Even if these limits are set, the process may
    still abort if it encounters a global out-of-memory situation.
    * `maxOldGenerationSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum size of the main heap in
      MB. If the command-line argument [`--max-old-space-size`][`--max-old-space-size`] is set, it
      overrides this setting.
    * `maxYoungGenerationSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum size of a heap space for
      recently created objects. If the command-line argument
      [`--max-semi-space-size`][`--max-semi-space-size`] is set, it overrides this setting.
    * `codeRangeSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The size of a pre-allocated memory range
      used for generated code.
    * `stackSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The default maximum stack size for the thread.
      Small values may lead to unusable Worker instances. **Default:** `4`.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) An optional `name` to be replaced in the thread name
    and to the worker title for debugging/identification purposes,
    making the final title as `[worker ${id}] ${name}`.
    This parameter has a maximum allowed size, depending on the operating
    system. If the provided name exceeds the limit, it will be truncated
    * Maximum sizes:
      * Windows: 32,767 characters
      * macOS: 64 characters
      * Linux: 16 characters
      * NetBSD: limited to `PTHREAD_MAX_NAMELEN_NP`
      * FreeBSD and OpenBSD: limited to `MAXCOMLEN`
        **Default:** `'WorkerThread'`.

### Event: `'error'`

<!-- YAML
added: v10.5.0
-->

* `err` {any}

The `'error'` event is emitted if the worker thread throws an uncaught
exception. In that case, the worker is terminated.

### Event: `'exit'`

<!-- YAML
added: v10.5.0
-->

* `exitCode` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The `'exit'` event is emitted once the worker has stopped. If the worker
exited by calling [`process.exit()`][`process.exit()`], the `exitCode` parameter is the
passed exit code. If the worker was terminated, the `exitCode` parameter is
`1`.

This is the final event emitted by any `Worker` instance.

### Event: `'message'`

<!-- YAML
added: v10.5.0
-->

* `value` {any} The transmitted value

The `'message'` event is emitted when the worker thread has invoked
[`require('node:worker_threads').parentPort.postMessage()`][`require('node:worker_threads').parentPort.postMessage()`].
See the [`port.on('message')`][`port.on('message')`] event for more details.

All messages sent from the worker thread are emitted before the
[`'exit'` event][`'exit'` event] is emitted on the `Worker` object.

### Event: `'messageerror'`

<!-- YAML
added:
  - v14.5.0
  - v12.19.0
-->

* `error` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) An Error object

The `'messageerror'` event is emitted when deserializing a message failed.

### Event: `'online'`

<!-- YAML
added: v10.5.0
-->

The `'online'` event is emitted when the worker thread has started executing
JavaScript code.

### `worker.cpuUsage([prev])`

<!-- YAML
added:
 - v24.6.0
 - v22.19.0
-->

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

This method returns a `Promise` that will resolve to an object identical to [`process.threadCpuUsage()`][`process.threadCpuUsage()`],
or reject with an [`ERR_WORKER_NOT_RUNNING`][`ERR_WORKER_NOT_RUNNING`] error if the worker is no longer running.
This methods allows the statistics to be observed from outside the actual thread.

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
    | v19.1.0 | Параметры поддержки для настройки моментального снимка кучи. |

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `exposeInternals` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If true, expose internals in the heap snapshot.
    **Default:** `false`.
  * `exposeNumericValues` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If true, expose numeric values in
    artificial fields. **Default:** `false`.
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) A promise for a Readable Stream containing
  a V8 heap snapshot

Returns a readable stream for a V8 snapshot of the current state of the Worker.
See [`v8.getHeapSnapshot()`][`v8.getHeapSnapshot()`] for more details.

If the Worker thread is no longer running, which may occur before the
[`'exit'` event][`'exit'` event] is emitted, the returned `Promise` is rejected
immediately with an [`ERR_WORKER_NOT_RUNNING`][`ERR_WORKER_NOT_RUNNING`] error.

### `worker.getHeapStatistics()`

<!-- YAML
added:
- v24.0.0
- v22.16.0
-->

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

This method returns a `Promise` that will resolve to an object identical to [`v8.getHeapStatistics()`][`v8.getHeapStatistics()`],
or reject with an [`ERR_WORKER_NOT_RUNNING`][`ERR_WORKER_NOT_RUNNING`] error if the worker is no longer running.
This methods allows the statistics to be observed from outside the actual thread.

### `worker.performance`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
  - v12.22.0
-->

An object that can be used to query performance information from a worker
instance.

#### `performance.eventLoopUtilization([utilization1[, utilization2]])`

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
  - v12.22.0
-->

* `utilization1` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The result of a previous call to
  `eventLoopUtilization()`.
* `utilization2` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The result of a previous call to
  `eventLoopUtilization()` prior to `utilization1`.
* Возвращает: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `idle` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `active` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `utilization` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The same call as [`perf_hooks` `eventLoopUtilization()`][`perf_hooks` `eventLoopUtilization()`], except the values
of the worker instance are returned.

One difference is that, unlike the main thread, bootstrapping within a worker
is done within the event loop. So the event loop utilization is
immediately available once the worker's script begins execution.

An `idle` time that does not increase does not indicate that the worker is
stuck in bootstrap. The following examples shows how the worker's entire
lifetime never accumulates any `idle` time, but is still be able to process
messages.

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

The event loop utilization of a worker is available only after the [`'online'`
event][] emitted, and if called before this, or after the [`'exit'`
event][], then all properties have the value of `0`.

### `worker.postMessage(value[, transferList])`

<!-- YAML
added: v10.5.0
-->

* `value` {any}
* `transferList` [<Object[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Send a message to the worker that is received via
[`require('node:worker_threads').parentPort.on('message')`][`require('node:worker_threads').parentPort.on('message')`].
See [`port.postMessage()`][`port.postMessage()`] for more details.

### `worker.ref()`

<!-- YAML
added: v10.5.0
-->

Opposite of `unref()`, calling `ref()` on a previously `unref()`ed worker does
_not_ let the program exit if it's the only active handle left (the default
behavior). If the worker is `ref()`ed, calling `ref()` again has
no effect.

### `worker.resourceLimits`

<!-- YAML
added:
 - v13.2.0
 - v12.16.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `maxYoungGenerationSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `maxOldGenerationSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `codeRangeSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `stackSizeMb` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Provides the set of JS engine resource constraints for this Worker thread.
If the `resourceLimits` option was passed to the [`Worker`][`Worker`] constructor,
this matches its values.

If the worker has stopped, the return value is an empty object.

### `worker.startCpuProfile()`

<!-- YAML
added: v24.8.0
-->

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Starting a CPU profile then return a Promise that fulfills with an error
or an `CPUProfileHandle` object. This API supports `await using` syntax.

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

`await using` example.

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

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `sampleInterval` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The average sampling interval in bytes.
    **Default:** `524288` (512 KiB).
  * `stackDepth` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The maximum stack depth for samples.
    **Default:** `16`.
  * `forceGC` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Force garbage collection before taking the profile.
    **Default:** `false`.
  * `includeObjectsCollectedByMajorGC` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Include objects collected
    by major GC. **Default:** `false`.
  * `includeObjectsCollectedByMinorGC` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Include objects collected
    by minor GC. **Default:** `false`.
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Starting a Heap profile then return a Promise that fulfills with an error
or an `HeapProfileHandle` object. This API supports `await using` syntax.

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

`await using` example.

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

* Тип: [<stream.Readable>](stream.md#streamreadable)

This is a readable stream which contains data written to [`process.stderr`][`process.stderr`]
inside the worker thread. If `stderr: true` was not passed to the
[`Worker`][`Worker`] constructor, then data is piped to the parent thread's
[`process.stderr`][`process.stderr`] stream.

### `worker.stdin`

<!-- YAML
added: v10.5.0
-->

* Тип: null | [<stream.Writable>](stream.md#streamwritable)

If `stdin: true` was passed to the [`Worker`][`Worker`] constructor, this is a
writable stream. The data written to this stream will be made available in
the worker thread as [`process.stdin`][`process.stdin`].

### `worker.stdout`

<!-- YAML
added: v10.5.0
-->

* Тип: [<stream.Readable>](stream.md#streamreadable)

This is a readable stream which contains data written to [`process.stdout`][`process.stdout`]
inside the worker thread. If `stdout: true` was not passed to the
[`Worker`][`Worker`] constructor, then data is piped to the parent thread's
[`process.stdout`][`process.stdout`] stream.

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

* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Stop all JavaScript execution in the worker thread as soon as possible.
Returns a Promise for the exit code that is fulfilled when the
[`'exit'` event][`'exit'` event] is emitted.

### `worker.threadId`

<!-- YAML
added: v10.5.0
-->

* Тип: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

An integer identifier for the referenced thread. Inside the worker thread,
it is available as [`require('node:worker_threads').threadId`][`require('node:worker_threads').threadId`].
This value is unique for each `Worker` instance inside a single process.

### `worker.threadName`

<!-- YAML
added:
  - v24.6.0
  - v22.20.0
-->

* [string](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null

A string identifier for the referenced thread or null if the thread is not running.
Inside the worker thread, it is available as [`require('node:worker_threads').threadName`][`require('node:worker_threads').threadName`].

### `worker.unref()`

<!-- YAML
added: v10.5.0
-->

Calling `unref()` on a worker allows the thread to exit if this is the only
active handle in the event system. If the worker is already `unref()`ed calling
`unref()` again has no effect.

### `worker[Symbol.asyncDispose]()`

<!-- YAML
added:
 - v24.2.0
 - v22.18.0
-->

Calls [`worker.terminate()`][`worker.terminate()`] when the dispose scope is exited.

```js
async function example() {
  await using worker = new Worker('for (;;) {}', { eval: true });
  // Worker is automatically terminate when the scope is exited.
}
```

## Примечания

### Синхронная блокировка stdio

`Worker`s utilize message passing via [MessagePort](worker_threads.md#class-messageport) to implement interactions
with `stdio`. This means that `stdio` output originating from a `Worker` can
get blocked by synchronous code on the receiving end that is blocking the
Node.js event loop.

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

Take care when launching worker threads from preload scripts (scripts loaded
and run using the `-r` command line flag). Unless the `execArgv` option is
explicitly set, new Worker threads automatically inherit the command line flags
from the running process and will preload the same preload scripts as the main
thread. If the preload script unconditionally launches a worker thread, every
thread spawned will spawn another until the application crashes.

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
