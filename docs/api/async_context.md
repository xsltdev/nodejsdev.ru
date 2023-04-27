---
title: Asynchronous context tracking
description: Эти классы используются для связывания состояния и распространения его через обратные вызовы и цепочки обещаний
---

# Асинхронное отслеживание контекста

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/async_context.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

## Введение

Эти классы используются для связывания состояния и распространения его через обратные вызовы и цепочки обещаний. Они позволяют хранить данные в течение всего времени жизни веб-запроса или любого другого асинхронного действия. Это похоже на локальное хранение потоков в других языках.

Классы `AsyncLocalStorage` и `AsyncResource` являются частью модуля `node:async_hooks`:

```mjs
import {
    AsyncLocalStorage,
    AsyncResource,
} from 'node:async_hooks';
```

```cjs
const {
    AsyncLocalStorage,
    AsyncResource,
} = require('node:async_hooks');
```

## Класс: `AsyncLocalStorage`

Этот класс создает хранилища, которые остаются целостными благодаря асинхронным операциям.

Хотя вы можете создать свою собственную реализацию поверх модуля `node:async_hooks`, `AsyncLocalStorage` следует предпочесть, поскольку это производительная и безопасная для памяти реализация, включающая значительные оптимизации, которые неочевидны для реализации.

Следующий пример использует `AsyncLocalStorage` для создания простого регистратора, который присваивает идентификаторы входящим HTTP-запросам и включает их в сообщения, регистрируемые в каждом запросе.

```mjs
import http from 'node:http';
import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

function logWithId(msg) {
    const id = asyncLocalStorage.getStore();
    console.log(`${id !== undefined ? id : '-'}:`, msg);
}

let idSeq = 0;
http.createServer((req, res) => {
    asyncLocalStorage.run(idSeq++, () => {
        logWithId('start');
        // Представьте здесь любую цепочку асинхронных операций
        setImmediate(() => {
            logWithId('finish');
            res.end();
        });
    });
}).listen(8080);

http.get('http://localhost:8080');
http.get('http://localhost:8080');
// Печать:
// 0: старт
// 1: старт
// 0: финиш
// 1: финиш
```

```cjs
const http = require('node:http');
const { AsyncLocalStorage } = require('node:async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function logWithId(msg) {
    const id = asyncLocalStorage.getStore();
    console.log(`${id !== undefined ? id : '-'}:`, msg);
}

let idSeq = 0;
http.createServer((req, res) => {
    asyncLocalStorage.run(idSeq++, () => {
        logWithId('start');
        // Представьте здесь любую цепочку асинхронных операций
        setImmediate(() => {
            logWithId('finish');
            res.end();
        });
    });
}).listen(8080);

http.get('http://localhost:8080');
http.get('http://localhost:8080');
// Печать:
// 0: старт
// 1: старт
// 0: финиш
// 1: финиш
```

Каждый экземпляр `AsyncLocalStorage` поддерживает независимый контекст хранения. Несколько экземпляров могут безопасно существовать одновременно без риска вмешательства в данные друг друга.

### `new AsyncLocalStorage()`

Создает новый экземпляр `AsyncLocalStorage`. Хранилище предоставляется только в рамках вызова `run()` или после вызова `enterWith()`.

### Статический метод: `AsyncLocalStorage.bind(fn)`

> Стабильность: 1 - Экспериментальный

-   `fn` {Функция} Функция для привязки к текущему контексту выполнения.
-   Возвращает: {Function} Новая функция, которая вызывает `fn` в захваченном контексте выполнения.

Привязывает заданную функцию к текущему контексту выполнения.

### Статический метод: `AsyncLocalStorage.snapshot()`

> Стабильность: 1 - Экспериментальная

-   Возвращает: {Function} Новая функция с сигнатурой `(fn: (...args) : R, ...args) : R`.

Захватывает текущий контекст выполнения и возвращает функцию, принимающую функцию в качестве аргумента. Всякий раз, когда вызывается возвращаемая функция, она вызывает переданную ей функцию в захваченном контексте.

```js
const asyncLocalStorage = new AsyncLocalStorage();
const runInAsyncScope = asyncLocalStorage.run(123, () => asyncLocalStorage.snapshot());
const result = asyncLocalStorage.run(321, () => runInAsyncScope(() => asyncLocalStorage.getStore())));
console.log(result); // возвращает 123
```

`AsyncLocalStorage.snapshot()` может заменить использование `AsyncResource` для простых целей отслеживания асинхронного контекста, например:

```js
class Foo {
    #runInAsyncScope = AsyncLocalStorage.snapshot();

    get() {
        return this.#runInAsyncScope(() =>
            asyncLocalStorage.getStore()
        );
    }
}

const foo = asyncLocalStorage.run(123, () => new Foo());
console.log(asyncLocalStorage.run(321, () => foo.get())); // возвращает 123
```

### `asyncLocalStorage.disable()`

> Стабильность: 1 - Экспериментальный

Отключает экземпляр `AsyncLocalStorage`. Все последующие вызовы `asyncLocalStorage.getStore()` будут возвращать `undefined`, пока `asyncLocalStorage.run()` или `asyncLocalStorage.enterWith()` не будут вызваны снова.

При вызове `asyncLocalStorage.disable()`, все текущие контексты, связанные с экземпляром, будут выведены.

Вызов `asyncLocalStorage.disable()` необходим перед тем, как `asyncLocalStorage` может быть собран в мусор. Это не относится к хранилищам, предоставляемым `asyncLocalStorage`, так как эти объекты собираются вместе с соответствующими асинхронными ресурсами.

Используйте этот метод, когда `asyncLocalStorage` больше не используется в текущем процессе.

### `asyncLocalStorage.getStore()`

-   Возвращает: {любой}

Возвращает текущее хранилище. Если вызывается вне асинхронного контекста, инициализированного вызовом `asyncLocalStorage.run()` или `asyncLocalStorage.enterWith()`, возвращает `undefined`.

### `asyncLocalStorage.enterWith(store)`

> Стабильность: 1 - Экспериментальный

-   `store` {любой}

Переходит в контекст на оставшуюся часть текущего синхронного выполнения, а затем сохраняет хранилище в любых последующих асинхронных вызовах.

Пример:

```js
const store = { id: 1 };
// Заменяет предыдущее хранилище на заданный объект хранилища
asyncLocalStorage.enterWith(store);
asyncLocalStorage.getStore(); // Возвращает объект магазина
someAsyncOperation(() => {
    asyncLocalStorage.getStore(); // Возвращает тот же объект
});
```

Этот переход будет продолжаться в течение всего синхронного выполнения. Это означает, что если, например, контекст введен в обработчике событий, то последующие обработчики событий также будут выполняться в этом контексте, если только они специально не привязаны к другому контексту с помощью `AsyncResource`. Вот почему `run()` следует предпочесть `enterWith()`, если только нет веских причин использовать последний метод.

```js
const store = { id: 1 };

emitter.on('my-event', () => {
    asyncLocalStorage.enterWith(store);
});
emitter.on('my-event', () => {
    asyncLocalStorage.getStore(); // Возвращает тот же объект
});

asyncLocalStorage.getStore(); // Возвращает неопределенный объект
emitter.emit('my-event');
asyncLocalStorage.getStore(); // Возвращает тот же объект
```

### `asyncLocalStorage.run(store, callback[, ...args])`

-   `store` {любой}
-   `callback` {функция}
-   `...args` {any}

Выполняет функцию синхронно в контексте и возвращает ее возвращаемое значение. Хранилище недоступно за пределами функции обратного вызова. Хранилище доступно для любых асинхронных операций, созданных внутри обратного вызова.

Необязательные `args` передаются в функцию обратного вызова.

Если функция обратного вызова выдает ошибку, то она также выдает и `run()`. Этот вызов не влияет на трассировку стека, и контекст выходит из него.

Пример:

```js
const store = { id: 2 };
try {
    asyncLocalStorage.run(store, () => {
        asyncLocalStorage.getStore(); // Возвращает объект магазина
        setTimeout(() => {
            asyncLocalStorage.getStore(); // Возвращает объект магазина
        }, 200);
        throw new Error();
    });
} catch (e) {
    asyncLocalStorage.getStore(); // Возвращает неопределенное значение
    // Ошибка будет поймана здесь
}
```

### `asyncLocalStorage.exit(callback[, ...args])`

> Стабильность: 1 - Экспериментальная

-   `callback` {функция}
-   `...args` {любой}

Запускает функцию синхронно вне контекста и возвращает ее возвращаемое значение. Хранилище недоступно в функции обратного вызова или асинхронных операциях, созданных в рамках обратного вызова. Любой вызов `getStore()`, выполненный внутри функции обратного вызова, всегда будет возвращать `undefined`.

Необязательные `args` передаются в функцию обратного вызова.

Если функция обратного вызова выдает ошибку, то она также выдается функцией `exit()`. Этот вызов не влияет на трассировку стека, а контекст вводится заново.

Пример:

```js
// Внутри вызова для выполнения
try {
    asyncLocalStorage.getStore(); // Возвращает объект или значение магазина
    asyncLocalStorage.exit(() => {
        asyncLocalStorage.getStore(); // Возвращает неопределенное значение
        throw new Error();
    });
} catch (e) {
    asyncLocalStorage.getStore(); // Возвращает тот же объект или значение
    // Ошибка будет поймана здесь
}
```

### Использование с `async/await`

Если в рамках асинхронной функции в контексте должен выполняться только один вызов `await`, следует использовать следующий шаблон:

```js
async function fn() {
    await asyncLocalStorage.run(new Map(), () => {
        asyncLocalStorage.getStore().set('key', value);
        return foo(); // Будет ожидаться возвращаемое значение foo
    });
}
```

В этом примере хранилище доступно только в функции обратного вызова и в функциях, вызываемых `foo`. Вне `run` вызов `getStore` вернет `undefined`.

### Устранение неполадок: Потеря контекста

В большинстве случаев `AsyncLocalStorage` работает без проблем. В редких ситуациях текущее хранилище теряется в одной из асинхронных операций.

Если ваш код основан на обратных вызовах, достаточно промисифицировать его с помощью [`util.promisify()`](util.md#utilpromisifyoriginal), чтобы он начал работать с родными обещаниями.

Если вам необходимо использовать API на основе обратного вызова или ваш код предполагает пользовательскую реализацию thenable, используйте класс `AsyncResource`, чтобы связать асинхронную операцию с правильным контекстом выполнения. Найдите вызов функции, ответственный за потерю контекста, записывая в журнал содержимое `asyncLocalStorage.getStore()` после вызовов, которые, как вы подозреваете, ответственны за потерю. Если код регистрирует `undefined`, то, вероятно, за потерю контекста отвечает последний вызванный обратный вызов.

## Класс: `AsyncResource`

Класс `AsyncResource` предназначен для расширения асинхронных ресурсов embedder'а. Используя его, пользователи могут легко запускать события времени жизни своих собственных ресурсов.

Хук `init` срабатывает при инстанцировании `AsyncResource`.

Ниже приведен обзор API `AsyncResource`.

```mjs
import {
    AsyncResource,
    executionAsyncId,
} from 'node:async_hooks';

// AsyncResource() предназначен для расширения. Инстанцирование
// нового AsyncResource() также запускает init. Если triggerAsyncId опущен, то.
// используется async_hook.executionAsyncId().
const asyncResource = new AsyncResource(type, {
    triggerAsyncId: executionAsyncId(),
    requireManualDestroy: false,
});

// Запустите функцию в контексте выполнения ресурса. Это позволит.
// * установит контекст ресурса
// * запустит AsyncHooks перед обратными вызовами.
// * вызов предоставленной функции `fn` с предоставленными аргументами
// * запуск AsyncHooks после обратных вызовов // * восстановление исходного контекста выполнения ресурса.
// * восстановление исходного контекста выполнения
asyncResource.runInAsyncScope(fn, thisArg, ...args);

// Вызов AsyncHooks уничтожает обратные вызовы.
asyncResource.emitDestroy();

// Возвращаем уникальный идентификатор, присвоенный экземпляру AsyncResource.
asyncResource.asyncId();

// Возвращаем идентификатор триггера для экземпляра AsyncResource.
asyncResource.triggerAsyncId();
```

```cjs
const {
    AsyncResource,
    executionAsyncId,
} = require('node:async_hooks');

// AsyncResource() предназначен для расширения. Создание
// нового AsyncResource() также запускает init. Если triggerAsyncId опущен, то.
// используется async_hook.executionAsyncId().
const asyncResource = new AsyncResource(type, {
    triggerAsyncId: executionAsyncId(),
    requireManualDestroy: false,
});

// Запустите функцию в контексте выполнения ресурса. Это позволит.
// * установит контекст ресурса
// * запустит AsyncHooks перед обратными вызовами.
// * вызов предоставленной функции `fn` с предоставленными аргументами
// * запуск AsyncHooks после обратных вызовов // * восстановление исходного контекста выполнения ресурса.
// * восстановление исходного контекста выполнения
asyncResource.runInAsyncScope(fn, thisArg, ...args);

// Вызов AsyncHooks уничтожает обратные вызовы.
asyncResource.emitDestroy();

// Возвращаем уникальный идентификатор, присвоенный экземпляру AsyncResource.
asyncResource.asyncId();

// Возвращаем идентификатор триггера для экземпляра AsyncResource.
asyncResource.triggerAsyncId();
```

### `новый AsyncResource(type[, options])`

-   `type` {string} Тип асинхронного события.
-   `options` {Object}
    -   `triggerAsyncId` {number} ID контекста выполнения, который создал это асинхронное событие. **По умолчанию:** `executionAsyncId()`.
    -   `requireManualDestroy` {boolean} Если установлено значение `true`, отключает `emitDestroy`, когда объект собирается в мусор. Обычно это значение не нужно устанавливать (даже если `emitDestroy` вызывается вручную), если только не получен `asyncId` ресурса и с ним не вызывается `emitDestroy` чувствительного API. Если установлено значение `false`, вызов `emitDestroy` на сборку мусора будет происходить только при наличии хотя бы одного активного хука `destroy`. **По умолчанию:** `false`.

Пример использования:

```js
class DBQuery extends AsyncResource {
    constructor(db) {
        super('DBQuery');
        this.db = db;
    }

    getInfo(query, callback) {
        this.db.get(query, (err, data) => {
            this.runInAsyncScope(callback, null, err, data);
        });
    }

    close() {
        this.db = null;
        this.emitDestroy();
    }
}
```

### Статический метод: `AsyncResource.bind(fn[, type[, thisArg]])`

-   `fn` {Функция} Функция для привязки к текущему контексту выполнения.
-   `type` {string} Необязательное имя, которое нужно связать с базовым `AsyncResource`.
-   `thisArg` {любой}

Привязывает данную функцию к текущему контексту выполнения.

### `asyncResource.bind(fn[, thisArg])`

-   `fn` {Функция} Функция для привязки к текущему `AsyncResource`.
-   `thisArg` {любой}

Привязывает данную функцию для выполнения к области видимости этого `AsyncResource`.

### `asyncResource.runInAsyncScope(fn[, thisArg, ...args])`

-   `fn` {Функция} Функция для вызова в контексте выполнения этого асинхронного ресурса.
-   `thisArg` {any} Приемник, который будет использоваться для вызова функции.
-   `...args` {any} Необязательные аргументы для передачи функции.

Вызов предоставленной функции с предоставленными аргументами в контексте выполнения асинхронного ресурса. Это установит контекст, запустит AsyncHooks до обратных вызовов, вызовет функцию, запустит AsyncHooks после обратных вызовов, а затем восстановит исходный контекст выполнения.

### `asyncResource.emitDestroy()`

-   Возвращает: {AsyncResource} Ссылка на `asyncResource`.

Вызывает все хуки `destroy`. Это должно быть вызвано только один раз. Если он будет вызван более одного раза, будет выдана ошибка. Это **должно** быть вызвано вручную. Если ресурс оставлен для сбора GC, то хуки `destroy` никогда не будут вызваны.

### `asyncResource.asyncId()`

-   Возвращает: {number} Уникальный `asyncId`, присвоенный ресурсу.

### `asyncResource.triggerAsyncId()`

-   Возвращает: {число} Тот же `triggerAsyncId`, который передается в конструктор `AsyncResource`.

### Использование `AsyncResource` для пула потоков `Worker`

Следующий пример показывает, как использовать класс `AsyncResource` для правильного обеспечения асинхронного отслеживания для пула [`Worker`](worker_threads.md#class-worker). Другие пулы ресурсов, такие как пулы соединений с базами данных, могут следовать аналогичной модели.

Предположим, что задачей является сложение двух чисел, используя файл с именем `task_processor.js` со следующим содержимым:

```mjs
import { parentPort } from 'node:worker_threads';
parentPort.on('message', (task) => {
    parentPort.postMessage(task.a + task.b);
});
```

```cjs
const { parentPort } = require('node:worker_threads');
parentPort.on('message', (task) => {
    parentPort.postMessage(task.a + task.b);
});
```

Пул рабочих вокруг него может использовать следующую структуру:

```mjs
import { AsyncResource } from 'node:async_hooks';
import { EventEmitter } from 'node:events';
import path from 'node:path';
import { Worker } from 'node:worker_threads';

const kTaskInfo = Symbol('kTaskInfo');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class WorkerPoolTaskInfo extends AsyncResource {
    constructor(callback) {
        super('WorkerPoolTaskInfo');
        this.callback = callback;
    }

    done(err, result) {
        this.runInAsyncScope(
            this.callback,
            null,
            err,
            result
        );
        this.emitDestroy(); // `TaskInfo`s are used only once.
    }
}

export default class WorkerPool extends EventEmitter {
    constructor(numThreads) {
        super();
        this.numThreads = numThreads;
        this.workers = [];
        this.freeWorkers = [];
        this.tasks = [];

        for (let i = 0; i < numThreads; i++)
            this.addNewWorker();

        // Any time the kWorkerFreedEvent is emitted, dispatch
        // the next task pending in the queue, if any.
        this.on(kWorkerFreedEvent, () => {
            if (this.tasks.length > 0) {
                const {
                    task,
                    callback,
                } = this.tasks.shift();
                this.runTask(task, callback);
            }
        });
    }

    addNewWorker() {
        const worker = new Worker(
            new URL('task_processor.js', import.meta.url)
        );
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            worker[kTaskInfo].done(null, result);
            worker[kTaskInfo] = null;
            this.freeWorkers.push(worker);
            this.emit(kWorkerFreedEvent);
        });
        worker.on('error', (err) => {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker[kTaskInfo])
                worker[kTaskInfo].done(err, null);
            else this.emit('error', err);
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            this.workers.splice(
                this.workers.indexOf(worker),
                1
            );
            this.addNewWorker();
        });
        this.workers.push(worker);
        this.freeWorkers.push(worker);
        this.emit(kWorkerFreedEvent);
    }

    runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
            // No free threads, wait until a worker thread becomes free.
            this.tasks.push({ task, callback });
            return;
        }

        const worker = this.freeWorkers.pop();
        worker[kTaskInfo] = new WorkerPoolTaskInfo(
            callback
        );
        worker.postMessage(task);
    }

    close() {
        for (const worker of this.workers)
            worker.terminate();
    }
}
```

```cjs
const { AsyncResource } = require('node:async_hooks');
const { EventEmitter } = require('node:events');
const path = require('node:path');
const { Worker } = require('node:worker_threads');

const kTaskInfo = Symbol('kTaskInfo');
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

class WorkerPoolTaskInfo extends AsyncResource {
    constructor(callback) {
        super('WorkerPoolTaskInfo');
        this.callback = callback;
    }

    done(err, result) {
        this.runInAsyncScope(
            this.callback,
            null,
            err,
            result
        );
        this.emitDestroy(); // `TaskInfo`s are used only once.
    }
}

class WorkerPool extends EventEmitter {
    constructor(numThreads) {
        super();
        this.numThreads = numThreads;
        this.workers = [];
        this.freeWorkers = [];
        this.tasks = [];

        for (let i = 0; i < numThreads; i++)
            this.addNewWorker();

        // Any time the kWorkerFreedEvent is emitted, dispatch
        // the next task pending in the queue, if any.
        this.on(kWorkerFreedEvent, () => {
            if (this.tasks.length > 0) {
                const {
                    task,
                    callback,
                } = this.tasks.shift();
                this.runTask(task, callback);
            }
        });
    }

    addNewWorker() {
        const worker = new Worker(
            path.resolve(__dirname, 'task_processor.js')
        );
        worker.on('message', (result) => {
            // In case of success: Call the callback that was passed to `runTask`,
            // remove the `TaskInfo` associated with the Worker, and mark it as free
            // again.
            worker[kTaskInfo].done(null, result);
            worker[kTaskInfo] = null;
            this.freeWorkers.push(worker);
            this.emit(kWorkerFreedEvent);
        });
        worker.on('error', (err) => {
            // In case of an uncaught exception: Call the callback that was passed to
            // `runTask` with the error.
            if (worker[kTaskInfo])
                worker[kTaskInfo].done(err, null);
            else this.emit('error', err);
            // Remove the worker from the list and start a new Worker to replace the
            // current one.
            this.workers.splice(
                this.workers.indexOf(worker),
                1
            );
            this.addNewWorker();
        });
        this.workers.push(worker);
        this.freeWorkers.push(worker);
        this.emit(kWorkerFreedEvent);
    }

    runTask(task, callback) {
        if (this.freeWorkers.length === 0) {
            // No free threads, wait until a worker thread becomes free.
            this.tasks.push({ task, callback });
            return;
        }

        const worker = this.freeWorkers.pop();
        worker[kTaskInfo] = new WorkerPoolTaskInfo(
            callback
        );
        worker.postMessage(task);
    }

    close() {
        for (const worker of this.workers)
            worker.terminate();
    }
}

module.exports = WorkerPool;
```

Без явного отслеживания, добавляемого объектами `WorkerPoolTaskInfo`, может показаться, что обратные вызовы связаны с отдельными объектами `Worker`. Однако, создание `Worker` не связано с созданием задач и не предоставляет информацию о том, когда задачи были запланированы.

Этот пул можно использовать следующим образом:

```mjs
import WorkerPool from './worker_pool.js';
import os from 'node:os';

const pool = new WorkerPool(os.availableParallelism());

let finished = 0;
for (let i = 0; i < 10; i++) {
    pool.runTask({ a: 42, b: 100 }, (err, result) => {
        console.log(i, err, result);
        if (++finished === 10) pool.close();
    });
}
```

```cjs
const WorkerPool = require('./worker_pool.js');
const os = require('node:os');

const pool = new WorkerPool(os.availableParallelism());

let finished = 0;
for (let i = 0; i < 10; i++) {
    pool.runTask({ a: 42, b: 100 }, (err, result) => {
        console.log(i, err, result);
        if (++finished === 10) pool.close();
    });
}
```

### Интеграция `AsyncResource` с `EventEmitter`

Слушатели событий, запускаемые [`EventEmitter`](events.md#class-eventemitter), могут быть запущены в другом контексте выполнения, чем тот, который был активен при вызове `eventEmitter.on()`.

В следующем примере показано, как использовать класс `AsyncResource` для правильного связывания слушателя событий с правильным контекстом выполнения. Тот же подход можно применить к [`Stream`](stream.md#stream) или аналогичному классу, управляемому событиями.

```mjs
import { createServer } from 'node:http';
import {
    AsyncResource,
    executionAsyncId,
} from 'node:async_hooks';

const server = createServer((req, res) => {
    req.on(
        'close',
        AsyncResource.bind(() => {
            // Контекст выполнения привязывается к текущей внешней области видимости.
        })
    );
    req.on('close', () => {
        // Контекст выполнения привязывается к области видимости, которая вызвала выброс 'close'.
    });
    res.end();
}).listen(3000);
```

```cjs
const { createServer } = require('node:http');
const {
    AsyncResource,
    executionAsyncId,
} = require('node:async_hooks');

const server = createServer((req, res) => {
    req.on(
        'close',
        AsyncResource.bind(() => {
            // Контекст выполнения привязывается к текущей внешней области видимости.
        })
    );
    req.on('close', () => {
        // Контекст выполнения привязывается к области видимости, которая вызвала выброс 'close'.
    });
    res.end();
}).listen(3000);
```
