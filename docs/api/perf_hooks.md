---
title: Измерение производительности (perf_hooks)
description: Performance API, PerformanceObserver, мониторинг Event Loop и специфичные для Node.js метрики
---

# API измерения производительности

<!--introduced_in=v8.5.0-->

> Стабильность: 2 — Стабильная

<!-- source_link=lib/perf_hooks.js -->

Модуль реализует подмножество спецификации W3C
[Web Performance APIs][Web Performance APIs] и дополнительные API для
измерений производительности, специфичных для Node.js.

В Node.js поддерживаются следующие [Web Performance APIs][Web Performance APIs]:

* [High Resolution Time][High Resolution Time]
* [Performance Timeline][Performance Timeline]
* [User Timing][User Timing]
* [Resource Timing][Resource Timing]

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((items) => {
      console.log(items.getEntries()[0].duration);
      performance.clearMarks();
    });
    obs.observe({ type: 'measure' });
    performance.measure('Start to Now');
    
    performance.mark('A');
    doSomeLongRunningProcess(() => {
      performance.measure('A to Now', 'A');
    
      performance.mark('B');
      performance.measure('A to B', 'A', 'B');
    });
    ```

=== "CJS"

    ```js
    const { PerformanceObserver, performance } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((items) => {
      console.log(items.getEntries()[0].duration);
    });
    obs.observe({ type: 'measure' });
    performance.measure('Start to Now');
    
    performance.mark('A');
    (async function doSomeLongRunningProcess() {
      await new Promise((r) => setTimeout(r, 5000));
      performance.measure('A to Now', 'A');
    
      performance.mark('B');
      performance.measure('A to B', 'A', 'B');
    })();
    ```

## `perf_hooks.performance`

<!-- YAML
added: v8.5.0
-->

Объект, с помощью которого можно собирать метрики производительности текущего
экземпляра Node.js. По смыслу похож на [`window.performance`](https://developer.mozilla.org/en-US/docs/Web/API/Window/performance) в браузерах.

### `performance.clearMarks([name])`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v8.5.0

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если `name` не указано, удаляет все объекты `PerformanceMark` из временной шкалы
производительности (Performance Timeline). Если `name` указано, удаляется только
соответствующая метка.

### `performance.clearMeasures([name])`

<!-- YAML
added: v16.7.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v16.7.0

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если `name` не указано, удаляет все объекты `PerformanceMeasure` из временной шкалы
производительности. Если `name` указано, удаляется только соответствующая мера.

### `performance.clearResourceTimings([name])`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если `name` не указано, удаляет все объекты `PerformanceResourceTiming` из шкалы
ресурсов (Resource Timeline). Если `name` указано, удаляется только соответствующий ресурс.

### `performance.eventLoopUtilization([utilization1[, utilization2]])`

<!-- YAML
added:
 - v14.10.0
 - v12.19.0
changes:
  - version:
      - v25.2.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/60370
    description: Added `perf_hooks.eventLoopUtilization` alias.
-->

* `utilization1` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова
  `eventLoopUtilization()`.
* `utilization2` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова
  `eventLoopUtilization()` до момента `utilization1`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `active` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Псевдоним [`perf_hooks.eventLoopUtilization()`](#perf_hookseventlooputilizationutilization1-utilization2).

_Это свойство — расширение Node.js. В веб-браузерах недоступно._

### `performance.getEntries()`

<!-- YAML
added: v16.7.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v16.7.0

* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry)

Возвращает список объектов `PerformanceEntry` в хронологическом порядке
относительно `performanceEntry.startTime`. Если нужны только записи определённых
типов или с определёнными именами, см. `performance.getEntriesByType()` и
`performance.getEntriesByName()`.

### `performance.getEntriesByName(name[, type])`

<!-- YAML
added: v16.7.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v16.7.0

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry)

Возвращает список объектов `PerformanceEntry` в хронологическом порядке
относительно `performanceEntry.startTime`, у которых `performanceEntry.name` равен
`name`, а при необходимости и `performanceEntry.entryType` равен `type`.

### `performance.getEntriesByType(type)`

<!-- YAML
added: v16.7.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v16.7.0

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry)

Возвращает список объектов `PerformanceEntry` в хронологическом порядке
относительно `performanceEntry.startTime`, у которых `performanceEntry.entryType`
равен `type`.

### `performance.mark(name[, options])`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver. The name argument is no longer optional.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37136
    description: Updated to conform to the User Timing Level 3 specification.
-->

Добавлено в: v8.5.0

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `detail` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Дополнительные необязательные сведения для метки.
  * `startTime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательная метка времени для момента метки.
    **По умолчанию**: `performance.now()`.

Создаёт новую запись `PerformanceMark` на временной шкале производительности.
`PerformanceMark` — подкласс `PerformanceEntry`, у которого
`performanceEntry.entryType` всегда `'mark'`, а
`performanceEntry.duration` всегда `0`. Метки используются, чтобы отмечать
важные моменты на временной шкале.

Созданная запись `PerformanceMark` попадает в глобальную временную шкалу и
запрашивается через `performance.getEntries`,
`performance.getEntriesByName` и `performance.getEntriesByType`. После
наблюдения записи следует вручную очистить из глобальной шкалы вызовом
`performance.clearMarks`.

### `performance.markResourceTiming(timingInfo, requestedUrl, initiatorType, global, cacheMode, bodyInfo, responseStatus[, deliveryType])`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v22.2.0
    pr-url: https://github.com/nodejs/node/pull/51589
    description: Added bodyInfo, responseStatus, and deliveryType arguments.
-->

* `timingInfo` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Fetch Timing Info][Fetch Timing Info]
* `requestedUrl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) URL ресурса
* `initiatorType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя инициатора, например `'fetch'`
* `global` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `cacheMode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Режим кэша: пустая строка (`''`) или `'local'`
* `bodyInfo` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Fetch Response Body Info][Fetch Response Body Info]
* `responseStatus` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код статуса ответа
* `deliveryType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип доставки. **По умолчанию:** `''`.

_Это свойство — расширение Node.js. В веб-браузерах недоступно._

Создаёт новую запись `PerformanceResourceTiming` на шкале ресурсов.
`PerformanceResourceTiming` — подкласс `PerformanceEntry`, у которого
`performanceEntry.entryType` всегда `'resource'`. Такие записи отмечают
моменты на шкале ресурсов.

Созданная запись попадает в глобальную шкалу ресурсов и запрашивается через
`performance.getEntries`, `performance.getEntriesByName` и
`performance.getEntriesByType`. После наблюдения записи следует вручную очистить
глобальную шкалу вызовом `performance.clearResourceTimings`.

### `performance.measure(name[, startMarkOrOptions[, endMark]])`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37136
    description: Updated to conform to the User Timing Level 3 specification.
  - version:
      - v13.13.0
      - v12.16.3
    pr-url: https://github.com/nodejs/node/pull/32651
    description: Make `startMark` and `endMark` parameters optional.
-->

Добавлено в: v8.5.0

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `startMarkOrOptions` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательно.
  * `detail` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Дополнительные необязательные сведения для измерения.
  * `duration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длительность между началом и концом.
  * `end` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метка времени конца или строка с именем ранее записанной метки.
  * `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Метка времени начала или строка с именем ранее записанной метки.
* `endMark` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно. Не указывается, если `startMarkOrOptions` —
  [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object).

Создаёт новую запись `PerformanceMeasure` на временной шкале производительности.
`PerformanceMeasure` — подкласс `PerformanceEntry`, у которого
`performanceEntry.entryType` всегда `'measure'`, а
`performanceEntry.duration` — число миллисекунд между `startMark` и `endMark`.

Аргумент `startMark` может ссылаться на любую _существующую_ `PerformanceMark` на
шкале или на свойства меток времени класса `PerformanceNodeTiming`. Если метки с
указанным именем нет, выбрасывается ошибка.

Необязательный аргумент `endMark` должен ссылаться на существующую `PerformanceMark`
или на свойства меток времени `PerformanceNodeTiming`. Если параметр не передан,
`endMark` берётся как `performance.now()`; если указанное имя не существует —
ошибка.

Созданная запись попадает в глобальную временную шкалу и запрашивается через
`performance.getEntries`, `performance.getEntriesByName` и
`performance.getEntriesByType`. После наблюдения записи следует вручную очистить
шкалу вызовом `performance.clearMeasures`.

### `performance.nodeTiming`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<PerformanceNodeTiming>`](perf_hooks.md)

_Это свойство — расширение Node.js. В веб-браузерах недоступно._

Экземпляр класса `PerformanceNodeTiming` с метриками производительности для
отдельных этапов работы Node.js.

### `performance.now()`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v8.5.0

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает текущую метку времени в миллисекундах с высоким разрешением; 0
соответствует началу текущего процесса `node`.

### `performance.setResourceTimingBufferSize(maxSize)`

<!-- YAML
added: v18.8.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v18.8.0

Задаёт размер глобального буфера записей ресурсов (число объектов записей
типа `"resource"`).

По умолчанию максимальный размер буфера — 250.

### `performance.timeOrigin`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

[`timeOrigin`](https://w3c.github.io/hr-time/#dom-performance-timeorigin) — метка времени в миллисекундах с высоким разрешением момента
запуска текущего процесса `node` в Unix-времени.

### `performance.timerify(fn[, options])`

<!-- YAML
added: v8.5.0
changes:
  - version:
      - v25.2.0
      - v24.12.0
    pr-url: https://github.com/nodejs/node/pull/60370
    description: Added `perf_hooks.timerify` alias.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37475
    description: Added the histogram option.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37136
    description: Re-implemented to use pure-JavaScript and the ability
                 to time async functions.
-->

Добавлено в: v8.5.0

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `histogram` [`<RecordableHistogram>`](perf_hooks.md) Гистограмма, созданная через
    `perf_hooks.createHistogram()`; записывает длительности выполнения в наносекундах.

Псевдоним [`perf_hooks.timerify()`](#perf_hookstimerifyfn-options).

_Это свойство — расширение Node.js. В веб-браузерах недоступно._

### `performance.toJSON()`

<!-- YAML
added: v16.1.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the `performance` object as
                 the receiver.
-->

Добавлено в: v16.1.0

Объект — JSON-представление `performance`. По смыслу похож на
[`window.performance.toJSON`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/toJSON) в браузерах.

#### Событие: `'resourcetimingbufferfull'`

<!-- YAML
added: v18.8.0
-->

Событие `'resourcetimingbufferfull'` возникает, когда глобальный буфер записей
ресурсов заполнен. Измените размер буфера через
`performance.setResourceTimingBufferSize()` или очистите его через
`performance.clearResourceTimings()` в обработчике, чтобы можно было добавить
новые записи на временную шкалу.

## Класс: `PerformanceEntry`

<!-- YAML
added: v8.5.0
-->

Конструктор этого класса пользователям напрямую недоступен.

### `performanceEntry.duration`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceEntry` object as the receiver.
-->

Добавлено в: v8.5.0

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Общее число миллисекунд для этой записи. Для не всех типов записей значение
осмысленно.

### `performanceEntry.entryType`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceEntry` object as the receiver.
-->

Добавлено в: v8.5.0

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Тип записи производительности. Возможные значения:

* `'dns'` (только Node.js)
* `'function'` (только Node.js)
* `'gc'` (только Node.js)
* `'http2'` (только Node.js)
* `'http'` (только Node.js)
* `'mark'` (доступно в вебе)
* `'measure'` (доступно в вебе)
* `'net'` (только Node.js)
* `'node'` (только Node.js)
* `'resource'` (доступно в вебе)

### `performanceEntry.name`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceEntry` object as the receiver.
-->

Добавлено в: v8.5.0

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя записи производительности.

### `performanceEntry.startTime`

<!-- YAML
added: v8.5.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceEntry` object as the receiver.
-->

Добавлено в: v8.5.0

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент начала записи
Performance Entry.

## Класс: `PerformanceMark`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
-->

* Наследует: [`<PerformanceEntry>`](perf_hooks.md#class-performanceentry)

Представляет метки, созданные методом `Performance.mark()`.

### `performanceMark.detail`

<!-- YAML
added: v16.0.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceMark` object as the receiver.
-->

Добавлено в: v16.0.0

* Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Дополнительные сведения, заданные при создании через `Performance.mark()`.

## Класс: `PerformanceMeasure`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
-->

* Наследует: [`<PerformanceEntry>`](perf_hooks.md#class-performanceentry)

Представляет измерения, созданные методом `Performance.measure()`.

Конструктор этого класса пользователям напрямую недоступен.

### `performanceMeasure.detail`

<!-- YAML
added: v16.0.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceMeasure` object as the receiver.
-->

Добавлено в: v16.0.0

* Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Дополнительные сведения, заданные при создании через `Performance.measure()`.

## Класс: `PerformanceNodeEntry`

<!-- YAML
added: v19.0.0
-->

* Наследует: [`<PerformanceEntry>`](perf_hooks.md#class-performanceentry)

_Этот класс — расширение Node.js. В веб-браузерах недоступен._

Подробные данные о тайминге Node.js.

Конструктор этого класса пользователям напрямую недоступен.

### `performanceNodeEntry.detail`

<!-- YAML
added: v16.0.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceNodeEntry` object as the receiver.
-->

Добавлено в: v16.0.0

* Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Дополнительные сведения, зависящие от `entryType`.

### `performanceNodeEntry.flags`

<!-- YAML
added:
 - v13.9.0
 - v12.17.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37136
    description: Runtime deprecated. Now moved to the detail property
                 when entryType is 'gc'.
-->

> Стабильность: 0 — устарело: вместо этого используйте `performanceNodeEntry.detail`.

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Когда `performanceEntry.entryType` равен `'gc'`, свойство `performance.flags`
содержит дополнительные сведения об операции сборки мусора.
Возможные значения:

* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_NO`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_CONSTRUCT_RETAINED`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_FORCED`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SYNCHRONOUS_PHANTOM_PROCESSING`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_AVAILABLE_GARBAGE`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_EXTERNAL_MEMORY`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SCHEDULE_IDLE`

### `performanceNodeEntry.kind`

<!-- YAML
added: v8.5.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37136
    description: Runtime deprecated. Now moved to the detail property
                 when entryType is 'gc'.
-->

Добавлено в: v8.5.0

> Стабильность: 0 — устарело: вместо этого используйте `performanceNodeEntry.detail`.

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Когда `performanceEntry.entryType` равен `'gc'`, свойство `performance.kind`
задаёт тип операции сборки мусора.
Возможные значения:

* `perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL`
* `perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB`

### Сборка мусора ('gc'): подробности

Когда `performanceEntry.type` равен `'gc'`, свойство
`performanceNodeEntry.detail` будет [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с двумя полями:

* `kind` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одно из:
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB`
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одно из:
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_NO`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_CONSTRUCT_RETAINED`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_FORCED`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SYNCHRONOUS_PHANTOM_PROCESSING`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_AVAILABLE_GARBAGE`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_EXTERNAL_MEMORY`
  * `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SCHEDULE_IDLE`

### HTTP ('http'): подробности

Когда `performanceEntry.type` равен `'http'`, свойство
`performanceNodeEntry.detail` — это [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с дополнительной информацией.

Если `performanceEntry.name` равен `HttpClient`, в `detail` будут поля `req`, `res`:
`req` — [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с `method`, `url`, `headers`; `res` — [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с
`statusCode`, `statusMessage`, `headers`.

Если `performanceEntry.name` равен `HttpRequest`, структура такая же: `req`, `res` с теми же полями.

Это может увеличить расход памяти; используйте только для диагностики, не оставляйте
включённым в production по умолчанию.

### HTTP/2 ('http2'): подробности

Когда `performanceEntry.type` равен `'http2'`, `performanceNodeEntry.detail` —
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с дополнительными сведениями о производительности.

Если `performanceEntry.name` равен `Http2Stream`, в `detail` будут поля:

* `bytesRead` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт кадров `DATA`, полученных для этого `Http2Stream`.
* `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт кадров `DATA`, отправленных для этого `Http2Stream`.
* `id` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор связанного `Http2Stream`
* `timeToFirstByte` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды между `PerformanceEntry.startTime` и приёмом первого кадра `DATA`.
* `timeToFirstByteSent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды между `PerformanceEntry.startTime` и отправкой первого кадра `DATA`.
* `timeToFirstHeader` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды между `PerformanceEntry.startTime` и приёмом первого заголовка.

Если `performanceEntry.name` равен `Http2Session`, в `detail` будут поля:

* `bytesRead` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт, полученных для этого `Http2Session`.
* `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число байт, отправленных для этого `Http2Session`.
* `framesReceived` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число кадров HTTP/2, принятых `Http2Session`.
* `framesSent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число кадров HTTP/2, отправленных `Http2Session`.
* `maxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимум одновременно открытых потоков за время жизни `Http2Session`.
* `pingRTT` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Миллисекунды от отправки кадра `PING` до подтверждения; есть только если `PING` отправлялся на `Http2Session`.
* `streamAverageDuration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Средняя длительность (мс) по всем `Http2Stream`.
* `streamCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число обработанных `Http2Stream` в `Http2Session`.
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'server'` или `'client'` — тип `Http2Session`.

### Timerify ('function'): подробности

Когда `performanceEntry.type` равен `'function'`, `performanceNodeEntry.detail`
— это [Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) с аргументами измеряемой функции.

### Сеть ('net'): подробности

Когда `performanceEntry.type` равен `'net'`, `performanceNodeEntry.detail` —
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с дополнительной информацией.

Если `performanceEntry.name` равен `connect`, в `detail` будут `host`, `port`.

### DNS ('dns'): подробности

Когда `performanceEntry.type` равен `'dns'`, `performanceNodeEntry.detail` —
[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с дополнительной информацией.

Если `performanceEntry.name` равен `lookup`, в `detail` будут `hostname`, `family`, `hints`, `verbatim`, `addresses`.

Если `performanceEntry.name` равен `lookupService`, в `detail` будут `host`, `port`, `hostname`, `service`.

Если `performanceEntry.name` равен `queryxxx` или `getHostByAddr`, в `detail` будут `host`, `ttl`, `result`; значение `result` совпадает с результатом `queryxxx` или `getHostByAddr`.

## Класс: `PerformanceNodeTiming`

<!-- YAML
added: v8.5.0
-->

* Наследует: [`<PerformanceEntry>`](perf_hooks.md#class-performanceentry)

_Это свойство — расширение Node.js. В веб-браузерах недоступно._

Сведения о тайминге самого Node.js. Конструктор класса пользователям недоступен.

### `performanceNodeTiming.bootstrapComplete`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент завершения
начальной загрузки процесса Node.js. Если загрузка ещё не завершена, значение −1.

### `performanceNodeTiming.environment`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент инициализации среды Node.js.

### `performanceNodeTiming.idleTime`

<!-- YAML
added:
  - v14.10.0
  - v12.19.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — время простоя цикла событий
в провайдере событий (например `epoll_wait`). Загрузка CPU не учитывается. Если
цикл событий ещё не запущен (например, в первом тике основного скрипта), значение 0.

### `performanceNodeTiming.loopExit`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент выхода из цикла
событий Node.js. Если цикл ещё не завершён, значение −1. Значение, отличное от −1,
возможно только в обработчике события [`'exit'`](process.md#event-exit).

### `performanceNodeTiming.loopStart`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент запуска цикла событий
Node.js. Если цикл ещё не начался (например, в первом тике основного скрипта), значение −1.

### `performanceNodeTiming.nodeStart`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент инициализации процесса Node.js.

### `performanceNodeTiming.uvMetricsInfo`

<!-- YAML
added:
  - v22.8.0
  - v20.18.0
-->

* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `loopCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число итераций цикла событий.
  * `events` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число событий, обработанных обработчиком.
  * `eventsWaiting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число событий, ожидавших обработки при вызове провайдера.

Обёртка над функцией `uv_metrics_info`; возвращает текущие метрики цикла событий.

Рекомендуется читать это свойство внутри функции, запланированной через `setImmediate`,
чтобы не собирать метрики до завершения всех операций, запланированных в текущей итерации цикла.

=== "CJS"

    ```js
    const { performance } = require('node:perf_hooks');
    
    setImmediate(() => {
      console.log(performance.nodeTiming.uvMetricsInfo);
    });
    ```

=== "MJS"

    ```js
    import { performance } from 'node:perf_hooks';
    
    setImmediate(() => {
      console.log(performance.nodeTiming.uvMetricsInfo);
    });
    ```

### `performanceNodeTiming.v8Start`

<!-- YAML
added: v8.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент инициализации платформы V8.

## Класс: `PerformanceResourceTiming`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
-->

* Наследует: [`<PerformanceEntry>`](perf_hooks.md#class-performanceentry)

Подробные сетевые метрики времени загрузки ресурсов приложения.

Конструктор этого класса пользователям напрямую недоступен.

### `performanceResourceTiming.workerStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — момент непосредственно перед
отправкой запроса `fetch`. Если ресурс не перехвачен worker, свойство всегда 0.

### `performanceResourceTiming.redirectStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — начало выборки, инициировавшей редирект.

### `performanceResourceTiming.redirectEnd`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — сразу после получения последнего байта ответа последнего редиректа.

### `performanceResourceTiming.fetchStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — непосредственно перед началом выборки ресурса в Node.js.

### `performanceResourceTiming.domainLookupStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — непосредственно перед началом DNS-запроса для ресурса.

### `performanceResourceTiming.domainLookupEnd`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — сразу после завершения DNS-поиска для ресурса.

### `performanceResourceTiming.connectStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — непосредственно перед установлением соединения с сервером для получения ресурса.

### `performanceResourceTiming.connectEnd`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — сразу после установления соединения с сервером для получения ресурса.

### `performanceResourceTiming.secureConnectionStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — непосредственно перед началом рукопожатия для защиты текущего соединения.

### `performanceResourceTiming.requestStart`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — непосредственно перед получением первого байта ответа от сервера.

### `performanceResourceTiming.responseEnd`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах с высоким разрешением — сразу после получения последнего байта ресурса или непосредственно перед закрытием транспортного соединения, в зависимости от того, что наступит раньше.

### `performanceResourceTiming.transferSize`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число — размер (в октетах) полученного ресурса: поля заголовка ответа плюс тело полезной нагрузки.

### `performanceResourceTiming.encodedBodySize`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число — размер (в октетах) тела полезной нагрузки, полученного при выборке (HTTP или кэш), до снятия кодирований содержимого.

### `performanceResourceTiming.decodedBodySize`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This property getter must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число — размер (в октетах) тела сообщения, полученного при выборке (HTTP или кэш), после снятия кодирований содержимого.

### `performanceResourceTiming.toJSON()`

<!-- YAML
added:
  - v18.2.0
  - v16.17.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44483
    description: This method must be called with the
                 `PerformanceResourceTiming` object as the receiver.
-->

Возвращает объект — JSON-представление `PerformanceResourceTiming`.

## Класс: `PerformanceObserver`

<!-- YAML
added: v8.5.0
-->

### `PerformanceObserver.supportedEntryTypes`

<!-- YAML
added: v16.0.0
-->

* Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Возвращает поддерживаемые типы.

### `new PerformanceObserver(callback)`

<!-- YAML
added: v8.5.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.5.0

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
  * `list` [`<PerformanceObserverEntryList>`](perf_hooks.md#class-performanceobserverentrylist)
  * `observer` [`<PerformanceObserver>`](perf_hooks.md#class-performanceobserver)

Объекты `PerformanceObserver` уведомляют о появлении новых экземпляров `PerformanceEntry` на временной шкале производительности.

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((list, observer) => {
      console.log(list.getEntries());
    
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ entryTypes: ['mark'], buffered: true });
    
    performance.mark('test');
    ```

=== "CJS"

    ```js
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((list, observer) => {
      console.log(list.getEntries());
    
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ entryTypes: ['mark'], buffered: true });
    
    performance.mark('test');
    ```

Так как экземпляры `PerformanceObserver` добавляют собственные накладные расходы, их не следует оставлять подписанными бесконечно. Отключайте наблюдателей, как только они не нужны.

Колбэк вызывается, когда `PerformanceObserver` получает уведомление о новых экземплярах `PerformanceEntry`. В колбэк передаются экземпляр `PerformanceObserverEntryList` и ссылка на `PerformanceObserver`.

### `performanceObserver.disconnect()`

<!-- YAML
added: v8.5.0
-->

Отключает экземпляр `PerformanceObserver` от всех уведомлений.

### `performanceObserver.observe(options)`

<!-- YAML
added: v8.5.0
changes:
  - version: v16.7.0
    pr-url: https://github.com/nodejs/node/pull/39297
    description: Updated to conform to Performance Timeline Level 2. The
                 buffered option has been added back.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37136
    description: Updated to conform to User Timing Level 3. The
                 buffered option has been removed.
-->

Добавлено в: v8.5.0

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Один тип [PerformanceEntry](perf_hooks.md#class-performanceentry). Не указывайте, если уже задан `entryTypes`.
  * `entryTypes` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив строк с типами [PerformanceEntry](perf_hooks.md#class-performanceentry), которые интересуют наблюдателя. Если не указан — ошибка.
  * `buffered` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если true, колбэк вызывается со списком глобальных буферизованных записей `PerformanceEntry`. Если false — только записи, созданные после момента времени. **По умолчанию:** `false`.

Подписывает [PerformanceObserver](perf_hooks.md#class-performanceobserver) на уведомления о новых [PerformanceEntry](perf_hooks.md#class-performanceentry), выбранных через `options.entryTypes` или `options.type`:

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((list, observer) => {
      // Called once asynchronously. `list` contains three items.
    });
    obs.observe({ type: 'mark' });
    
    for (let n = 0; n < 3; n++)
      performance.mark(`test${n}`);
    ```

=== "CJS"

    ```js
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((list, observer) => {
      // Called once asynchronously. `list` contains three items.
    });
    obs.observe({ type: 'mark' });
    
    for (let n = 0; n < 3; n++)
      performance.mark(`test${n}`);
    ```

### `performanceObserver.takeRecords()`

<!-- YAML
added: v16.0.0
-->

* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry) Текущий список записей в наблюдателе; после вызова список очищается.

## Класс: `PerformanceObserverEntryList`

<!-- YAML
added: v8.5.0
-->

Класс `PerformanceObserverEntryList` даёт доступ к экземплярам `PerformanceEntry`, переданным в `PerformanceObserver`. Конструктор класса пользователям недоступен.

### `performanceObserverEntryList.getEntries()`

<!-- YAML
added: v8.5.0
-->

* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry)

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`.

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((perfObserverList, observer) => {
      console.log(perfObserverList.getEntries());
      /**
       * [
       *   PerformanceEntry {
       *     name: 'test',
       *     entryType: 'mark',
       *     startTime: 81.465639,
       *     duration: 0,
       *     detail: null
       *   },
       *   PerformanceEntry {
       *     name: 'meow',
       *     entryType: 'mark',
       *     startTime: 81.860064,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
    
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ type: 'mark' });
    
    performance.mark('test');
    performance.mark('meow');
    ```

=== "CJS"

    ```js
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((perfObserverList, observer) => {
      console.log(perfObserverList.getEntries());
      /**
       * [
       *   PerformanceEntry {
       *     name: 'test',
       *     entryType: 'mark',
       *     startTime: 81.465639,
       *     duration: 0,
       *     detail: null
       *   },
       *   PerformanceEntry {
       *     name: 'meow',
       *     entryType: 'mark',
       *     startTime: 81.860064,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
    
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ type: 'mark' });
    
    performance.mark('test');
    performance.mark('meow');
    ```

### `performanceObserverEntryList.getEntriesByName(name[, type])`

<!-- YAML
added: v8.5.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry)

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`, у которых `performanceEntry.name` равен `name`, а при необходимости и `performanceEntry.entryType` равен `type`.

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((perfObserverList, observer) => {
      console.log(perfObserverList.getEntriesByName('meow'));
      /**
       * [
       *   PerformanceEntry {
       *     name: 'meow',
       *     entryType: 'mark',
       *     startTime: 98.545991,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
      console.log(perfObserverList.getEntriesByName('nope')); // []
    
      console.log(perfObserverList.getEntriesByName('test', 'mark'));
      /**
       * [
       *   PerformanceEntry {
       *     name: 'test',
       *     entryType: 'mark',
       *     startTime: 63.518931,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
      console.log(perfObserverList.getEntriesByName('test', 'measure')); // []
    
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ entryTypes: ['mark', 'measure'] });
    
    performance.mark('test');
    performance.mark('meow');
    ```

=== "CJS"

    ```js
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((perfObserverList, observer) => {
      console.log(perfObserverList.getEntriesByName('meow'));
      /**
       * [
       *   PerformanceEntry {
       *     name: 'meow',
       *     entryType: 'mark',
       *     startTime: 98.545991,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
      console.log(perfObserverList.getEntriesByName('nope')); // []
    
      console.log(perfObserverList.getEntriesByName('test', 'mark'));
      /**
       * [
       *   PerformanceEntry {
       *     name: 'test',
       *     entryType: 'mark',
       *     startTime: 63.518931,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
      console.log(perfObserverList.getEntriesByName('test', 'measure')); // []
    
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ entryTypes: ['mark', 'measure'] });
    
    performance.mark('test');
    performance.mark('meow');
    ```

### `performanceObserverEntryList.getEntriesByType(type)`

<!-- YAML
added: v8.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* Возвращает: [`<PerformanceEntry[]>`](perf_hooks.md#class-performanceentry)

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`, у которых `performanceEntry.entryType` равен `type`.

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const obs = new PerformanceObserver((perfObserverList, observer) => {
      console.log(perfObserverList.getEntriesByType('mark'));
      /**
       * [
       *   PerformanceEntry {
       *     name: 'test',
       *     entryType: 'mark',
       *     startTime: 55.897834,
       *     duration: 0,
       *     detail: null
       *   },
       *   PerformanceEntry {
       *     name: 'meow',
       *     entryType: 'mark',
       *     startTime: 56.350146,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ type: 'mark' });
    
    performance.mark('test');
    performance.mark('meow');
    ```

=== "CJS"

    ```js
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    const obs = new PerformanceObserver((perfObserverList, observer) => {
      console.log(perfObserverList.getEntriesByType('mark'));
      /**
       * [
       *   PerformanceEntry {
       *     name: 'test',
       *     entryType: 'mark',
       *     startTime: 55.897834,
       *     duration: 0,
       *     detail: null
       *   },
       *   PerformanceEntry {
       *     name: 'meow',
       *     entryType: 'mark',
       *     startTime: 56.350146,
       *     duration: 0,
       *     detail: null
       *   }
       * ]
       */
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ type: 'mark' });
    
    performance.mark('test');
    performance.mark('meow');
    ```

## `perf_hooks.createHistogram([options])`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `lowest` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Минимальное различимое значение; целое число > 0. **По умолчанию:** `1`.
  * `highest` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Максимальная записываемая величина; целое ≥ 2×`lowest`. **По умолчанию:** `Number.MAX_SAFE_INTEGER`.
  * `figures` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число значащих цифр; от `1` до `5`. **По умолчанию:** `3`.
* Возвращает: [`<RecordableHistogram>`](perf_hooks.md)

Возвращает [RecordableHistogram](perf_hooks.md).

## `perf_hooks.eventLoopUtilization([utilization1[, utilization2]])`

<!-- YAML
added:
  - v25.2.0
  - v24.12.0
-->

* `utilization1` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова
  `eventLoopUtilization()`.
* `utilization2` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова
  `eventLoopUtilization()` до момента `utilization1`.
* Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `active` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
  * `utilization` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Функция `eventLoopUtilization()` возвращает объект с суммарной длительностью времени, когда цикл событий был и простаивал, и активен, в виде таймера с высоким разрешением в миллисекундах. Поле `utilization` — рассчитанная утилизация цикла событий (ELU).

Если на главном потоке загрузка ещё не завершена, свойства равны `0`. ELU сразу доступен в [Worker threads][Worker threads], так как загрузка происходит внутри цикла событий.

Оба параметра `utilization1` и `utilization2` необязательны.

Если передан `utilization1`, вычисляется и возвращается дельта между текущими `active` и `idle` и соответствующее `utilization` (аналогично [`process.hrtime()`](process.md#processhrtimetime)).

Если переданы оба — `utilization1` и `utilization2`, дельта считается между ними. Это удобно, потому что для ELU недостаточно простого вычитания, в отличие от [`process.hrtime()`](process.md#processhrtimetime).

ELU похожа на загрузку CPU, но измеряет только статистику цикла событий, а не CPU. Это доля времени, которую цикл провёл вне провайдера событий (например `epoll_wait`). Иное время простоя CPU не учитывается. Ниже — пример: в основном простаивающий процесс может иметь высокий ELU.

=== "MJS"

    ```js
    import { eventLoopUtilization } from 'node:perf_hooks';
    import { spawnSync } from 'node:child_process';
    
    setImmediate(() => {
      const elu = eventLoopUtilization();
      spawnSync('sleep', ['5']);
      console.log(eventLoopUtilization(elu).utilization);
    });
    ```

=== "CJS"

    ```js
    'use strict';
    const { eventLoopUtilization } = require('node:perf_hooks');
    const { spawnSync } = require('node:child_process');
    
    setImmediate(() => {
      const elu = eventLoopUtilization();
      spawnSync('sleep', ['5']);
      console.log(eventLoopUtilization(elu).utilization);
    });
    ```

Хотя при выполнении этого сценария CPU в основном простаивает, `utilization` равен `1`, потому что [`child_process.spawnSync()`](child_process.md#child_processspawnsynccommand-args-options) блокирует цикл событий.

Передача произвольного объекта вместо результата предыдущего вызова `eventLoopUtilization()` даёт неопределённое поведение; возвращаемые значения не гарантируют корректное состояние цикла событий.

## `perf_hooks.monitorEventLoopDelay([options])`

<!-- YAML
added: v11.10.0
-->

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `resolution` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Период выборки в миллисекундах; должен быть > 0. **По умолчанию:** `10`.
* Возвращает: [`<IntervalHistogram>`](perf_hooks.md)

_This property is an extension by Node.js. It is not available in Web browsers._

Создаёт объект `IntervalHistogram`, который снимает и сообщает задержку цикла событий во времени; задержки в наносекундах.

Таймер подходит для оценки задержки цикла, потому что выполнение таймеров привязано к жизненному циклу цикла событий libuv: задержка в цикле задерживает таймер — именно это и предназначено измерять этому API.

=== "MJS"

    ```js
    import { monitorEventLoopDelay } from 'node:perf_hooks';
    
    const h = monitorEventLoopDelay({ resolution: 20 });
    h.enable();
    // Do something.
    h.disable();
    console.log(h.min);
    console.log(h.max);
    console.log(h.mean);
    console.log(h.stddev);
    console.log(h.percentiles);
    console.log(h.percentile(50));
    console.log(h.percentile(99));
    ```

=== "CJS"

    ```js
    const { monitorEventLoopDelay } = require('node:perf_hooks');
    const h = monitorEventLoopDelay({ resolution: 20 });
    h.enable();
    // Do something.
    h.disable();
    console.log(h.min);
    console.log(h.max);
    console.log(h.mean);
    console.log(h.stddev);
    console.log(h.percentiles);
    console.log(h.percentile(50));
    console.log(h.percentile(99));
    ```

## `perf_hooks.timerify(fn[, options])`

<!-- YAML
added:
  - v25.2.0
  - v24.12.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `histogram` [`<RecordableHistogram>`](perf_hooks.md) Гистограмма, созданная через `perf_hooks.createHistogram()`; записывает длительности выполнения в наносекундах.

_Это свойство — расширение Node.js. В веб-браузерах недоступно._

Оборачивает функцию в новую, измеряющую время выполнения обёрнутой функции. Чтобы получить детали времени, нужно подписать `PerformanceObserver` на тип события `'function'`.

=== "MJS"

    ```js
    import { timerify, performance, PerformanceObserver } from 'node:perf_hooks';
    
    function someFunction() {
      console.log('hello world');
    }
    
    const wrapped = timerify(someFunction);
    
    const obs = new PerformanceObserver((list) => {
      console.log(list.getEntries()[0].duration);
    
      performance.clearMarks();
      performance.clearMeasures();
      obs.disconnect();
    });
    obs.observe({ entryTypes: ['function'] });
    
    // A performance timeline entry will be created
    wrapped();
    ```

=== "CJS"

    ```js
    const {
      timerify,
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    function someFunction() {
      console.log('hello world');
    }
    
    const wrapped = timerify(someFunction);
    
    const obs = new PerformanceObserver((list) => {
      console.log(list.getEntries()[0].duration);
    
      performance.clearMarks();
      performance.clearMeasures();
      obs.disconnect();
    });
    obs.observe({ entryTypes: ['function'] });
    
    // A performance timeline entry will be created
    wrapped();
    ```

Если обёрнутая функция возвращает промис, к нему добавляется обработчик `finally`; длительность сообщается после его вызова.

## Класс: `Histogram`

<!-- YAML
added: v11.10.0
-->

### `histogram.count`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число образцов, записанных в гистограмму.

### `histogram.countBigInt`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Число образцов, записанных в гистограмму.

### `histogram.exceeds`

<!-- YAML
added: v11.10.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Сколько раз задержка цикла событий превысила порог максимальной задержки 1 час.

### `histogram.exceedsBigInt`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Сколько раз задержка цикла событий превысила порог максимальной задержки 1 час.

### `histogram.max`

<!-- YAML
added: v11.10.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальная зафиксированная задержка цикла событий.

### `histogram.maxBigInt`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Максимальная зафиксированная задержка цикла событий.

### `histogram.mean`

<!-- YAML
added: v11.10.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Среднее зафиксированных задержек цикла событий.

### `histogram.min`

<!-- YAML
added: v11.10.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Минимальная зафиксированная задержка цикла событий.

### `histogram.minBigInt`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* Тип: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Минимальная зафиксированная задержка цикла событий.

### `histogram.percentile(percentile)`

<!-- YAML
added: v11.10.0
-->

* `percentile` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Перцентиль в диапазоне (0, 100].
* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает значение для заданного перцентиля.

### `histogram.percentileBigInt(percentile)`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* `percentile` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Перцентиль в диапазоне (0, 100].
* Возвращает: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Возвращает значение для заданного перцентиля.

### `histogram.percentiles`

<!-- YAML
added: v11.10.0
-->

* Тип: [`<Map>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

Возвращает объект `Map` с накопленным распределением по перцентилям.

### `histogram.percentilesBigInt`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* Тип: [`<Map>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)

Возвращает объект `Map` с накопленным распределением по перцентилям.

### `histogram.reset()`

<!-- YAML
added: v11.10.0
-->

Сбрасывает накопленные данные гистограммы.

### `histogram.stddev`

<!-- YAML
added: v11.10.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Стандартное отклонение зафиксированных задержек цикла событий.

## Класс: `IntervalHistogram extends Histogram`

`Histogram`, периодически обновляемый с заданным интервалом.

### `histogram.disable()`

<!-- YAML
added: v11.10.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отключает таймер обновления. Возвращает `true`, если таймер остановлен, `false`, если уже был остановлен.

### `histogram.enable()`

<!-- YAML
added: v11.10.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Включает таймер обновления. Возвращает `true`, если таймер запущен, `false`, если уже был запущен.

### `histogram[Symbol.dispose]()`

<!-- YAML
added: v24.2.0
-->

Отключает таймер обновления при освобождении гистограммы.

```js
const { monitorEventLoopDelay } = require('node:perf_hooks');
{
  using hist = monitorEventLoopDelay({ resolution: 20 });
  hist.enable();
  // The histogram will be disabled when the block is exited.
}
```

### Клонирование `IntervalHistogram`

Экземпляры [IntervalHistogram](perf_hooks.md) можно клонировать через [MessagePort](worker_threads.md#class-messageport). На приёмной стороне гистограмма клонируется как обычный [Histogram](perf_hooks.md) без методов `enable()` и `disable()`.

## Класс: `RecordableHistogram extends Histogram`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

### `histogram.add(other)`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

* `other` [`<RecordableHistogram>`](perf_hooks.md)

Добавляет значения из `other` в эту гистограмму.

### `histogram.record(val)`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

* `val` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Величина для записи в гистограмму.

### `histogram.recordDelta()`

<!-- YAML
added:
  - v15.9.0
  - v14.18.0
-->

Вычисляет время (в наносекундах) с предыдущего вызова `recordDelta()` и записывает его в гистограмму.

## Примеры

### Измерение длительности асинхронных операций

В примере используются [Async Hooks][Async Hooks] и Performance API, чтобы измерить фактическую длительность операции `Timeout` (включая время выполнения колбэка).

=== "MJS"

    ```js
    import { createHook } from 'node:async_hooks';
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    const set = new Set();
    const hook = createHook({
      init(id, type) {
        if (type === 'Timeout') {
          performance.mark(`Timeout-${id}-Init`);
          set.add(id);
        }
      },
      destroy(id) {
        if (set.has(id)) {
          set.delete(id);
          performance.mark(`Timeout-${id}-Destroy`);
          performance.measure(`Timeout-${id}`,
                              `Timeout-${id}-Init`,
                              `Timeout-${id}-Destroy`);
        }
      },
    });
    hook.enable();
    
    const obs = new PerformanceObserver((list, observer) => {
      console.log(list.getEntries()[0]);
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ entryTypes: ['measure'], buffered: true });
    
    setTimeout(() => {}, 1000);
    ```

=== "CJS"

    ```js
    'use strict';
    const async_hooks = require('node:async_hooks');
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    
    const set = new Set();
    const hook = async_hooks.createHook({
      init(id, type) {
        if (type === 'Timeout') {
          performance.mark(`Timeout-${id}-Init`);
          set.add(id);
        }
      },
      destroy(id) {
        if (set.has(id)) {
          set.delete(id);
          performance.mark(`Timeout-${id}-Destroy`);
          performance.measure(`Timeout-${id}`,
                              `Timeout-${id}-Init`,
                              `Timeout-${id}-Destroy`);
        }
      },
    });
    hook.enable();
    
    const obs = new PerformanceObserver((list, observer) => {
      console.log(list.getEntries()[0]);
      performance.clearMarks();
      performance.clearMeasures();
      observer.disconnect();
    });
    obs.observe({ entryTypes: ['measure'] });
    
    setTimeout(() => {}, 1000);
    ```

### Сколько времени уходит на загрузку зависимостей

Пример измеряет длительность операций `require()` при загрузке зависимостей:

<!-- eslint-disable no-global-assign -->

=== "MJS"

    ```js
    import { performance, PerformanceObserver } from 'node:perf_hooks';
    
    // Activate the observer
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`import('${entry[0]}')`, entry.duration);
      });
      performance.clearMarks();
      performance.clearMeasures();
      obs.disconnect();
    });
    obs.observe({ entryTypes: ['function'], buffered: true });
    
    const timedImport = performance.timerify(async (module) => {
      return await import(module);
    });
    
    await timedImport('some-module');
    ```

<!-- eslint-disable no-global-assign -->

=== "CJS"

    ```js
    'use strict';
    const {
      performance,
      PerformanceObserver,
    } = require('node:perf_hooks');
    const mod = require('node:module');
    
    // Monkey patch the require function
    mod.Module.prototype.require =
      performance.timerify(mod.Module.prototype.require);
    require = performance.timerify(require);
    
    // Activate the observer
    const obs = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        console.log(`require('${entry[0]}')`, entry.duration);
      });
      performance.clearMarks();
      performance.clearMeasures();
      obs.disconnect();
    });
    obs.observe({ entryTypes: ['function'] });
    
    require('some-module');
    ```

### Длительность одного HTTP round-trip

Пример показывает время для HTTP-клиента (`OutgoingMessage`) и HTTP-запроса
(`IncomingMessage`): для клиента — интервал от начала запроса до получения ответа;
для запроса — от получения запроса до отправки ответа:

=== "MJS"

    ```js
    import { PerformanceObserver } from 'node:perf_hooks';
    import { createServer, get } from 'node:http';
    
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((item) => {
        console.log(item);
      });
    });
    
    obs.observe({ entryTypes: ['http'] });
    
    const PORT = 8080;
    
    createServer((req, res) => {
      res.end('ok');
    }).listen(PORT, () => {
      get(`http://127.0.0.1:${PORT}`);
    });
    ```

=== "CJS"

    ```js
    'use strict';
    const { PerformanceObserver } = require('node:perf_hooks');
    const http = require('node:http');
    
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((item) => {
        console.log(item);
      });
    });
    
    obs.observe({ entryTypes: ['http'] });
    
    const PORT = 8080;
    
    http.createServer((req, res) => {
      res.end('ok');
    }).listen(PORT, () => {
      http.get(`http://127.0.0.1:${PORT}`);
    });
    ```

### Измерение времени `net.connect` (только для TCP) при успешном подключении

=== "MJS"

    ```js
    import { PerformanceObserver } from 'node:perf_hooks';
    import { connect, createServer } from 'node:net';
    
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((item) => {
        console.log(item);
      });
    });
    obs.observe({ entryTypes: ['net'] });
    const PORT = 8080;
    createServer((socket) => {
      socket.destroy();
    }).listen(PORT, () => {
      connect(PORT);
    });
    ```

=== "CJS"

    ```js
    'use strict';
    const { PerformanceObserver } = require('node:perf_hooks');
    const net = require('node:net');
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((item) => {
        console.log(item);
      });
    });
    obs.observe({ entryTypes: ['net'] });
    const PORT = 8080;
    net.createServer((socket) => {
      socket.destroy();
    }).listen(PORT, () => {
      net.connect(PORT);
    });
    ```

### Измерение времени DNS при успешном запросе

=== "MJS"

    ```js
    import { PerformanceObserver } from 'node:perf_hooks';
    import { lookup, promises } from 'node:dns';
    
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((item) => {
        console.log(item);
      });
    });
    obs.observe({ entryTypes: ['dns'] });
    lookup('localhost', () => {});
    promises.resolve('localhost');
    ```

=== "CJS"

    ```js
    'use strict';
    const { PerformanceObserver } = require('node:perf_hooks');
    const dns = require('node:dns');
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((item) => {
        console.log(item);
      });
    });
    obs.observe({ entryTypes: ['dns'] });
    dns.lookup('localhost', () => {});
    dns.promises.resolve('localhost');
    ```

[Async Hooks]: async_hooks.md
[Fetch Response Body Info]: https://fetch.spec.whatwg.org/#response-body-info
[Fetch Timing Info]: https://fetch.spec.whatwg.org/#fetch-timing-info
[High Resolution Time]: https://www.w3.org/TR/hr-time-2
[Performance Timeline]: https://w3c.github.io/performance-timeline/
[Resource Timing]: https://www.w3.org/TR/resource-timing-2/
[User Timing]: https://www.w3.org/TR/user-timing/
[Web Performance APIs]: https://w3c.github.io/perf-timing-primer/
[Worker threads]: worker_threads.md#worker-threads
[`'exit'`]: process.md#event-exit
[`child_process.spawnSync()`]: child_process.md#child_processspawnsynccommand-args-options
[`perf_hooks.eventLoopUtilization()`]: #perf_hookseventlooputilizationutilization1-utilization2
[`perf_hooks.timerify()`]: #perf_hookstimerifyfn-options
[`process.hrtime()`]: process.md#processhrtimetime
[`timeOrigin`]: https://w3c.github.io/hr-time/#dom-performance-timeorigin
[`window.performance.toJSON`]: https://developer.mozilla.org/en-US/docs/Web/API/Performance/toJSON
[`window.performance`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/performance
