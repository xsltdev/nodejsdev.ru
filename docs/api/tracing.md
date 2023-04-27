---
title: Trace events
description: Модуль trace_events предоставляет механизм для централизации информации о трассировке, генерируемой V8, ядром Node.js и кодом пользовательского пространства
---

# Отслеживание событий

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/tracing.html)

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

Модуль `node:trace_events` предоставляет механизм для централизации информации о трассировке, генерируемой V8, ядром Node.js и кодом пользовательского пространства.

Трассировка может быть включена с помощью флага командной строки `--trace-event-categories` или с помощью модуля `node:trace_events`. Флаг `--trace-event-categories` принимает список имен категорий, разделенных запятыми.

Доступны следующие категории:

-   `node`: Пустой заполнитель.
-   `node.async_hooks`: Включает захват подробных данных трассировки [`async_hooks`](async_hooks.md). События [`async_hooks`](async_hooks.md) имеют уникальный `asyncId` и специальное свойство `triggerId` `triggerAsyncId`.
-   `node.bootstrap`: Позволяет перехватывать вехи загрузки Node.js.
-   `node.console`: Включает захват вывода `console.time()` и `console.count()`.
-   `node.threadpoolwork.sync`: Включает захват данных трассировки для синхронных операций пула потоков, таких как `blob`, `zlib`, `crypto` и `node_api`.
-   `node.threadpoolwork.async`: Включает захват данных трассировки для асинхронных операций threadpool, таких как `blob`, `zlib`, `crypto` и `node_api`.
-   `node.dns.native`: Включает захват данных трассировки для DNS-запросов.
-   `node.net.native`: Включает захват данных трассировки для сети.
-   `node.environment`: Включает захват вех окружения Node.js.
-   `node.fs.sync`: Включает захват данных трассировки для методов синхронизации файловой системы.
-   `node.fs_dir.sync`: Включает захват данных трассировки для методов синхронизации каталогов файловой системы.
-   `node.fs.async`: Включает захват данных трассировки для асинхронных методов файловой системы.
-   `node.fs_dir.async`: Включает захват данных трассировки для асинхронных методов каталогов файловой системы.
-   `node.perf`: Включает захват измерений [Performance API](perf_hooks.md).
    -   `node.perf.usertiming`: Включает захват только мер и меток пользовательского тайминга Performance API.
    -   `node.perf.timerify`: Включает захват только измерений таймерификации API производительности.
-   `node.promises.rejections`: Включает захват данных трассировки, отслеживающих количество необработанных отказов Promise и обработанных после отказов.
-   `node.vm.script`: Позволяет перехватывать данные трассировки для методов `node:vm` модуля `runInNewContext()`, `runInContext()` и `runInThisContext()`.
-   `v8`: События [V8](v8.md) связаны с GC, компиляцией и выполнением.
-   `node.http`: Включает захват данных трассировки для http-запросов/ответов.

По умолчанию включены категории `node`, `node.async_hooks` и `v8`.

```bash
node --trace-event-categories v8,node,node.async_hooks server.js
```

Предыдущие версии Node.js требовали использования флага `--trace-events-enabled` для включения трассировки событий. Это требование было удалено. Однако флаг `--trace-events-enabled` _может_ по-прежнему использоваться и по умолчанию будет включать категории событий трассировки `node`, `node.async_hooks` и `v8`.

```bash
node --trace-events-enabled


# эквивалентно


node --trace-event-categories v8,node,node.async_hooks
```

В качестве альтернативы, трассировка событий может быть включена с помощью команды

## Модуль `node:trace_events`

### Объект `Tracing`

Объект `Tracing` используется для включения или отключения трассировки для наборов категорий. Экземпляры создаются с помощью метода `trace_events.createTracing()`.

При создании объект `Tracing` отключается. Вызов метода `tracing.enable()` добавляет категории в набор включенных категорий событий трассировки. Вызов метода `tracing.disable()` удаляет категории из набора включенных категорий событий трассировки.

#### `tracing.categories`

-   {строка}

Список категорий событий трассировки, охватываемых этим объектом `Tracing`, разделенный запятыми.

#### `tracing.disable()`

Отключает данный объект `Tracing`.

Только категории событий трассировки, _не_ охваченные другими включенными объектами `Tracing` и _не_ указанные флагом `--trace-event-categories`, будут отключены.

```js
const trace_events = require('node:trace_events');
const t1 = trace_events.createTracing({
    categories: ['node', 'v8'],
});
const t2 = trace_events.createTracing({
    categories: ['node.perf', 'node'],
});
t1.enable();
t2.enable();

// Печатает 'node,node.perf,v8'
console.log(trace_events.getEnabledCategories());

t2.disable(); // Отключит только эмиссию категории 'node.perf'

// Печатает 'node,v8'
console.log(trace_events.getEnabledCategories());
```

#### `tracing.enable()`

Включает данный объект `Tracing` для набора категорий, охватываемых объектом `Tracing`.

#### `tracing.enabled`

-   {булево} `true` только если объект `Tracing` был включен.

### `trace_events.createTracing(options)`

-   `options` {Object}
    -   `categories` {string\[\]} Массив имен категорий трассировки. Значения, включенные в массив, по возможности приводятся к строке. Если значение не может быть приведено к строке, будет выдана ошибка.
-   Возвращает: {Tracing}.

Создает и возвращает объект `Tracing` для заданного набора `категорий`.

```js
const trace_events = require('node:trace_events');
const categories = ['node.perf', 'node.async_hooks'];
const tracing = trace_events.createTracing({ categories });
tracing.enable();
// делать что-то
tracing.disable();
```

### `trace_events.getEnabledCategories()`

-   Возвращает: {строка}

Возвращает список всех включенных в данный момент категорий событий трассировки, разделенных запятыми. Текущий набор включенных категорий событий трассировки определяется _объединением_ всех включенных в данный момент объектов `Tracing` и любых категорий, включенных с помощью флага `--trace-event-categories`.

Учитывая файл `test.js` ниже, команда `node --trace-event-categories node.perf test.js` выведет `'node.async_hooks,node.perf'` на консоль.

```js
const trace_events = require('node:trace_events');
const t1 = trace_events.createTracing({
    categories: ['node.async_hooks'],
});
const t2 = trace_events.createTracing({
    categories: ['node.perf'],
});
const t3 = trace_events.createTracing({
    categories: ['v8'],
});

t1.enable();
t2.enable();

console.log(trace_events.getEnabledCategories());
```

## Примеры

### Сбор данных о событиях трассировки с помощью инспектора

```js
'use strict';

const { Session } = require('inspector');
const session = new Session();
session.connect();

function post(message, data) {
    return new Promise((resolve, reject) => {
        session.post(message, data, (err, result) => {
            if (err) reject(new Error(JSON.stringify(err)));
            else resolve(result);
        });
    });
}

async function collect() {
    const data = [];
    session.on('NodeTracing.dataCollected', (chunk) =>
        data.push(chunk)
    );
    session.on('NodeTracing.tracingComplete', () => {
        // сделано
    });
    const traceConfig = { includedCategories: ['v8'] };
    await post('NodeTracing.start', { traceConfig });
    // сделайте что-нибудь
    setTimeout(() => {
        post('NodeTracing.stop').then(() => {
            session.disconnect();
            console.log(data);
        });
    }, 1000);
}

collect();
```
