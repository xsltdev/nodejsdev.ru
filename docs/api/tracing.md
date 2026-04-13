---
title: События трассировки
description: Модуль node:trace_events централизует данные трассировки от V8, ядра Node.js и пользовательского кода; включается флагами CLI или API
---

# События трассировки

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/tracing.html)

<!--introduced_in=v7.7.0-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

<!-- source_link=lib/trace_events.js -->

Модуль `node:trace_events` предоставляет механизм централизации данных трассировки, генерируемых V8, ядром Node.js и кодом пользовательского пространства.

Трассировку можно включить флагом командной строки `--trace-event-categories` или модулем `node:trace_events`. Флаг `--trace-event-categories` принимает список имён категорий через запятую.

Доступны следующие категории:

* `node`: пустой заполнитель.
* `node.async_hooks`: включает захват подробных данных трассировки [`async_hooks`][`async_hooks`]. События [`async_hooks`][`async_hooks`] имеют уникальный `asyncId` и особое свойство `triggerAsyncId` (в тексте также упоминается `triggerId`).
* `node.bootstrap`: включает захват вех загрузки (bootstrap) Node.js.
* `node.console`: включает захват вывода `console.time()` и `console.count()`.
* `node.threadpoolwork.sync`: включает захват данных трассировки для синхронных операций пула потоков, например `blob`, `zlib`, `crypto` и `node_api`.
* `node.threadpoolwork.async`: включает захват данных трассировки для асинхронных операций пула потоков, например `blob`, `zlib`, `crypto` и `node_api`.
* `node.dns.native`: включает захват данных трассировки для DNS-запросов.
* `node.net.native`: включает захват данных трассировки для сети.
* `node.environment`: включает захват вех окружения Node.js.
* `node.fs.sync`: включает захват данных трассировки для синхронных методов файловой системы.
* `node.fs_dir.sync`: включает захват данных трассировки для синхронных методов работы с каталогами.
* `node.fs.async`: включает захват данных трассировки для асинхронных методов файловой системы.
* `node.fs_dir.async`: включает захват данных трассировки для асинхронных методов работы с каталогами.
* `node.perf`: включает захват измерений [Performance API][Performance API].
  * `node.perf.usertiming`: включает захват только меток и измерений User Timing API производительности.
  * `node.perf.timerify`: включает захват только измерений `timerify` Performance API.
* `node.promises.rejections`: включает захват данных трассировки о числе необработанных отклонений Promise и отклонений, обработанных после события.
* `node.vm.script`: включает захват данных трассировки для методов модуля `node:vm`: `runInNewContext()`, `runInContext()` и `runInThisContext()`.
* `v8`: события [V8][V8] связаны со сборкой мусора, компиляцией и выполнением.
* `node.http`: включает захват данных трассировки для HTTP-запросов и ответов.
* `node.module_timer`: включает захват данных трассировки при загрузке модулей CommonJS.

По умолчанию включены категории `node`, `node.async_hooks` и `v8`.

```bash
node --trace-event-categories v8,node,node.async_hooks server.js
```

В более ранних версиях Node.js для включения событий трассировки требовался флаг `--trace-events-enabled`. Это требование снято. Тем не менее флаг `--trace-events-enabled` _по-прежнему_ можно использовать: он по умолчанию включит категории `node`, `node.async_hooks` и `v8`.

```bash
node --trace-events-enabled

# эквивалентно

node --trace-event-categories v8,node,node.async_hooks
```

Кроме того, события трассировки можно включить через модуль `node:trace_events`:

=== "MJS"

    ```js
    import { createTracing } from 'node:trace_events';
    const tracing = createTracing({ categories: ['node.perf'] });
    tracing.enable();  // включить захват для категории 'node.perf'
    
    // работа
    
    tracing.disable();  // отключить захват для категории 'node.perf'
    ```

=== "CJS"

    ```js
    const { createTracing } = require('node:trace_events');
    const tracing = createTracing({ categories: ['node.perf'] });
    tracing.enable();  // включить захват для категории 'node.perf'
    
    // работа
    
    tracing.disable();  // отключить захват для категории 'node.perf'
    ```

Запуск Node.js с включённой трассировкой создаёт файлы журналов, которые можно открыть на вкладке [`chrome://tracing`](https://www.chromium.org/developers/how-tos/trace-event-profiling-tool) в Chrome.

Файл журнала по умолчанию называется `node_trace.${rotation}.log`, где `${rotation}` — возрастающий идентификатор ротации. Шаблон пути задаётся флагом `--trace-event-file-pattern` (шаблонная строка с `${rotation}` и `${pid}`):

```bash
node --trace-event-categories v8 --trace-event-file-pattern '${pid}-${rotation}.log' server.js
```

Чтобы журнал корректно сформировался после сигналов вроде `SIGINT`, `SIGTERM` или `SIGBREAK`, в коде должны быть соответствующие обработчики, например:

```js
process.on('SIGINT', function onSigint() {
  console.info('Received SIGINT.');
  process.exit(130);  // или другой код выхода в зависимости от ОС и сигнала
});
```

Подсистема трассировки использует тот же источник времени, что и `process.hrtime()`. Временные метки событий трассировки выражены в микросекундах, в отличие от `process.hrtime()`, возвращающего наносекунды.

Возможности этого модуля недоступны в потоках [`Worker`][`Worker`].

## Модуль `node:trace_events`

<!-- YAML
added: v10.0.0
-->

### Объект `Tracing`

<!-- YAML
added: v10.0.0
-->

Объект `Tracing` используется для включения и отключения трассировки для наборов категорий. Экземпляры создаются методом `trace_events.createTracing()`.

При создании объект `Tracing` отключён. Вызов `tracing.enable()` добавляет категории к множеству включённых категорий событий трассировки. Вызов `tracing.disable()` удаляет категории из этого множества.

#### `tracing.categories`

<!-- YAML
added: v10.0.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Список категорий событий трассировки, разделённых запятыми, которые охватывает данный объект `Tracing`.

#### `tracing.disable()`

<!-- YAML
added: v10.0.0
-->

Отключает данный объект `Tracing`.

Будут отключены только те категории событий трассировки, которые _не_ покрыты другими включёнными объектами `Tracing` и _не_ заданы флагом `--trace-event-categories`.

=== "MJS"

    ```js
    import { createTracing, getEnabledCategories } from 'node:trace_events';
    const t1 = createTracing({ categories: ['node', 'v8'] });
    const t2 = createTracing({ categories: ['node.perf', 'node'] });
    t1.enable();
    t2.enable();
    
    // Выводит 'node,node.perf,v8'
    console.log(getEnabledCategories());
    
    t2.disable(); // Отключает только выдачу категории 'node.perf'
    
    // Выводит 'node,v8'
    console.log(getEnabledCategories());
    ```

=== "CJS"

    ```js
    const { createTracing, getEnabledCategories } = require('node:trace_events');
    const t1 = createTracing({ categories: ['node', 'v8'] });
    const t2 = createTracing({ categories: ['node.perf', 'node'] });
    t1.enable();
    t2.enable();
    
    // Выводит 'node,node.perf,v8'
    console.log(getEnabledCategories());
    
    t2.disable(); // Отключает только выдачу категории 'node.perf'
    
    // Выводит 'node,v8'
    console.log(getEnabledCategories());
    ```

#### `tracing.enable()`

<!-- YAML
added: v10.0.0
-->

Включает данный объект `Tracing` для набора категорий, заданного объектом.

#### `tracing.enabled`

<!-- YAML
added: v10.0.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true` только если объект `Tracing` был включён.

### `trace_events.createTracing(options)`

<!-- YAML
added: v10.0.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `categories` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив имён категорий трассировки. Значения при возможности приводятся к строке. При невозможности приведения будет выброшена ошибка.
* Возвращает: {Tracing}.

Создаёт и возвращает объект `Tracing` для заданного набора `categories`.

=== "MJS"

    ```js
    import { createTracing } from 'node:trace_events';
    const categories = ['node.perf', 'node.async_hooks'];
    const tracing = createTracing({ categories });
    tracing.enable();
    // работа
    tracing.disable();
    ```

=== "CJS"

    ```js
    const { createTracing } = require('node:trace_events');
    const categories = ['node.perf', 'node.async_hooks'];
    const tracing = createTracing({ categories });
    tracing.enable();
    // работа
    tracing.disable();
    ```

### `trace_events.getEnabledCategories()`

<!-- YAML
added: v10.0.0
-->

* Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает список через запятую всех в данный момент включённых категорий событий трассировки. Текущее множество определяется _объединением_ всех включённых объектов `Tracing` и категорий, заданных флагом `--trace-event-categories`.

Для файла `test.js` ниже команда `node --trace-event-categories node.perf test.js` выведет в консоль `'node.async_hooks,node.perf'`.

=== "MJS"

    ```js
    import { createTracing, getEnabledCategories } from 'node:trace_events';
    const t1 = createTracing({ categories: ['node.async_hooks'] });
    const t2 = createTracing({ categories: ['node.perf'] });
    const t3 = createTracing({ categories: ['v8'] });
    
    t1.enable();
    t2.enable();
    
    console.log(getEnabledCategories());
    ```

=== "CJS"

    ```js
    const { createTracing, getEnabledCategories } = require('node:trace_events');
    const t1 = createTracing({ categories: ['node.async_hooks'] });
    const t2 = createTracing({ categories: ['node.perf'] });
    const t3 = createTracing({ categories: ['v8'] });
    
    t1.enable();
    t2.enable();
    
    console.log(getEnabledCategories());
    ```

## Примеры

### Сбор данных событий трассировки через inspector

=== "MJS"

    ```js
    import { Session } from 'node:inspector';
    const session = new Session();
    session.connect();
    
    function post(message, data) {
      return new Promise((resolve, reject) => {
        session.post(message, data, (err, result) => {
          if (err)
            reject(new Error(JSON.stringify(err)));
          else
            resolve(result);
        });
      });
    }
    
    async function collect() {
      const data = [];
      session.on('NodeTracing.dataCollected', (chunk) => data.push(chunk));
      session.on('NodeTracing.tracingComplete', () => {
        // done
      });
      const traceConfig = { includedCategories: ['v8'] };
      await post('NodeTracing.start', { traceConfig });
      // do something
      setTimeout(() => {
        post('NodeTracing.stop').then(() => {
          session.disconnect();
          console.log(data);
        });
      }, 1000);
    }
    
    collect();
    ```

=== "CJS"

    ```js
    'use strict';
    
    const { Session } = require('node:inspector');
    const session = new Session();
    session.connect();
    
    function post(message, data) {
      return new Promise((resolve, reject) => {
        session.post(message, data, (err, result) => {
          if (err)
            reject(new Error(JSON.stringify(err)));
          else
            resolve(result);
        });
      });
    }
    
    async function collect() {
      const data = [];
      session.on('NodeTracing.dataCollected', (chunk) => data.push(chunk));
      session.on('NodeTracing.tracingComplete', () => {
        // done
      });
      const traceConfig = { includedCategories: ['v8'] };
      await post('NodeTracing.start', { traceConfig });
      // do something
      setTimeout(() => {
        post('NodeTracing.stop').then(() => {
          session.disconnect();
          console.log(data);
        });
      }, 1000);
    }
    
    collect();
    ```

[Performance API]: perf_hooks.md
[V8]: v8.md
[`Worker`]: worker_threads.md#class-worker
[`async_hooks`]: async_hooks.md
