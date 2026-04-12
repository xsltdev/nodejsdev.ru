---
title: Performance hooks
description: API для измерения производительности
---

# API измерения производительности

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/perf_hooks.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Этот модуль предоставляет реализацию подмножества W3C [Web Performance APIs](https://w3c.github.io/perf-timing-primer/), а также дополнительные API для специфических для Node.js измерений производительности.

Node.js поддерживает следующие [Web Performance APIs](https://w3c.github.io/perf-timing-primer/):

-   [High Resolution Time](https://www.w3.org/TR/hr-time-2)
-   [Временная шкала производительности](https://w3c.github.io/performance-timeline/)
-   [Время пользователя](https://www.w3.org/TR/user-timing/)
-   [Временная шкала ресурсов](https://www.w3.org/TR/resource-timing-2/)

<!-- конец списка -->

```js
const {
    PerformanceObserver,
    performance,
} = require('node:perf_hooks');

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

## `perf_hooks.performance`.

Объект, который можно использовать для сбора показателей производительности текущего экземпляра Node.js. Он аналогичен [`window.performance`](https://developer.mozilla.org/en-US/docs/Web/API/Window/performance) в браузерах.

### `performance.clearMarks([name])`

-   `имя` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если `name` не указано, удаляет все объекты `PerformanceMark` с временной шкалы производительности. Если `имя` указано, удаляется только именованная метка.

### `performance.clearMeasures([name])`.

-   `имя` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если `name` не указано, удаляет все объекты `PerformanceMeasure` из временной шкалы производительности. Если `имя` указано, удаляется только названная мера.

### `performance.clearResourceTimings([name])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Если `name` не указано, удаляет все объекты `PerformanceResourceTiming` из временной шкалы ресурсов. Если `имя` указано, удаляется только именованный ресурс.

### `performance.eventLoopUtilization([utilization1[, utilization2]])`

-   `utilization1` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова `eventLoopUtilization()`.
-   `utilization2` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова `eventLoopUtilization()` перед `utilization1`.
-   Возвращает [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `active` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `использование` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `eventLoopUtilization()` возвращает объект, содержащий суммарную продолжительность времени, в течение которого цикл событий был как холост, так и активен, в виде таймера с высоким разрешением в миллисекундах. Значение `utilization` - это вычисленная утилита цикла событий (ELU).

Если загрузка еще не завершилась в основном потоке, свойства имеют значение `0`. ELU немедленно доступно на [Worker threads](worker_threads.md#worker-threads), поскольку бутстрап происходит внутри цикла событий.

Оба параметра `utilization1` и `utilization2` являются необязательными.

Если передан параметр `utilization1`, то вычисляется и возвращается дельта между временем `active` и `idle` текущего вызова, а также соответствующее значение `utilization` (аналогично [`process.hrtime()`](process.md#processhrtimetime)).

Если переданы значения `utilization1` и `utilization2`, то вычисляется дельта между двумя аргументами. Это удобная опция, поскольку, в отличие от [`process.hrtime()`](process.md#processhrtimetime), вычисление ELU сложнее, чем простое вычитание.

ELU аналогичен утилизации процессора, за исключением того, что он измеряет только статистику циклов событий, а не использование процессора. Он представляет собой процент времени, которое цикл событий провел вне провайдера событий цикла (например, `epoll_wait`). Никакое другое время простоя ЦП не учитывается. Ниже приведен пример того, как в основном простаивающий процесс будет иметь высокий ELU.

```js
'use strict';
const {
    eventLoopUtilization,
} = require('node:perf_hooks').performance;
const { spawnSync } = require('node:child_process');

setImmediate(() => {
    const elu = eventLoopUtilization();
    spawnSync('sleep', ['5']);
    console.log(eventLoopUtilization(elu).utilization);
});
```

Хотя CPU в основном простаивает во время выполнения этого сценария, значение `utilization` равно `1`. Это происходит потому, что вызов [`child_process.spawnSync()`](child_process.md#child_processspawnsyncommand-args-options) блокирует выполнение цикла событий.

Передача пользовательского объекта вместо результата предыдущего вызова `eventLoopUtilization()` приведет к неопределенному поведению. Возвращаемые значения не гарантированно отражают правильное состояние цикла событий.

### `performance.getEntries()`.

-   Возвращает: {PerformanceEntry\[\]}

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`. Если вас интересуют только записи производительности определенных типов или с определенными именами, смотрите `performance.getEntriesByType()` и `performance.getEntriesByName()`.

### `performance.getEntriesByName(name[, type])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `тип` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {PerformanceEntry\[\]}

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`, чье `performanceEntry.name` равно `name`, и, опционально, чей `performanceEntry.entryType` равен `type`.

### `performance.getEntriesByType(type)`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {PerformanceEntry\[\]}

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`, чей `performanceEntry.entryType` равен `type`.

### `performance.mark(name[, options])`

-   `имя` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `detail` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Дополнительные необязательные детали для включения в метку.
    -   `startTime` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Необязательная метка времени, которая будет использоваться в качестве времени метки. **По умолчанию**: `performance.now()`.

Создает новую запись `PerformanceMark` на временной шкале исполнения. `PerformanceMark` - это подкласс `PerformanceEntry`, чей `performanceEntry.entryType` всегда `'mark'`, а `performanceEntry.duration` всегда `0`. Метки исполнения используются для обозначения определенных значимых моментов на временной шкале исполнения.

Созданная запись `PerformanceMark` помещается в глобальную временную шкалу производительности и может быть запрошена с помощью `performance.getEntries`, `performance.getEntriesByName` и `performance.getEntriesByType`. Когда наблюдение выполнено, записи должны быть удалены из глобальной временной шкалы производительности вручную с помощью `performance.clearMarks`.

### `performance.markResourceTiming(timingInfo, requestedUrl, initiatorType, global, cacheMode)`.

-   `timingInfo` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Fetch Timing Info](https://fetch.spec.whatwg.org/#fetch-timing-info)
-   `requestedUrl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) url ресурса
-   `initiatorType` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя инициатора, например: 'fetch'.
-   `global` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `cacheMode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Режим кэширования должен быть пустой строкой ('') или 'local'.

_Это свойство является расширением Node.js. Оно недоступно в веб-браузерах._

Создает новую запись `PerformanceResourceTiming` на временной шкале ресурсов. `PerformanceResourceTiming` является подклассом `PerformanceEntry`, чей `performanceEntry.entryType` всегда `'resource'`. Ресурсы производительности используются для отметки моментов на временной шкале ресурсов.

Созданная запись `PerformanceMark` помещается в глобальную временную шкалу ресурсов и может быть запрошена с помощью `performance.getEntries`, `performance.getEntriesByName` и `performance.getEntriesByType`. Когда наблюдение выполнено, записи должны быть удалены из глобальной временной шкалы производительности вручную с помощью `performance.clearResourceTimings`.

### `performance.measure(name[, startMarkOrOptions[, endMark]])`.

-   `имя` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `startMarkOrOptions` {string|Object} Необязательно.
    -   `detail` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Дополнительная необязательная информация для включения в меру.
    -   `duration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Продолжительность между начальным и конечным временем.
    -   `end` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Временная метка, которая будет использоваться в качестве времени окончания, или строка, идентифицирующая ранее записанную метку.
    -   `start` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Временная метка, которая будет использоваться в качестве времени начала, или строка, идентифицирующая ранее записанную метку.
-   `endMark` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательно. Должен быть опущен, если `startMarkOrOptions` является [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object).

Создает новую запись `PerformanceMeasure` на временной шкале исполнения. `PerformanceMeasure` - это подкласс `PerformanceEntry`, чей `performanceEntry.entryType` всегда `'measure'`, и чья `performanceEntry.duration` измеряет количество миллисекунд, прошедших с `startMark` и `endMark`.

Аргумент `startMark` может определять любую _существующую_ `PerformanceMark` на временной шкале производительности, или _может_ определять любое из свойств временной метки, предоставляемых классом `PerformanceNodeTiming`. Если именованная `startMark` не существует, будет выдана ошибка.

Необязательный аргумент `endMark` должен идентифицировать любую _существующую_ `PerformanceMark` на временной шкале производительности или любое из свойств временной метки, предоставляемых классом `PerformanceNodeTiming`. Если параметр не передан, `endMark` будет `performance.now()`, в противном случае, если именованная `endMark` не существует, будет выдана ошибка.

Созданная запись `PerformanceMeasure` помещается в глобальную временную шкалу производительности и может быть запрошена с помощью `performance.getEntries`, `performance.getEntriesByName` и `performance.getEntriesByType`. Когда наблюдение выполнено, записи должны быть удалены из глобальной временной шкалы производительности вручную с помощью `performance.clearMeasures`.

### `performance.nodeTiming`

-   {PerformanceNodeTiming}

_Это свойство является расширением Node.js. Оно недоступно в веб-браузерах._

Экземпляр класса `PerformanceNodeTiming`, который предоставляет метрики производительности для определенных этапов работы Node.js.

### `performance.now()`.

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает текущую миллисекундную временную метку высокого разрешения, где 0 означает начало текущего процесса `node`.

### `performance.setResourceTimingBufferSize(maxSize)`.

Устанавливает размер глобального буфера синхронизации ресурсов производительности для указанного количества объектов записи производительности типа "ресурс".

По умолчанию максимальный размер буфера установлен на 250.

### `performance.timeOrigin`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

[`timeOrigin`](https://w3c.github.io/hr-time/#dom-performance-timeorigin) указывает миллисекундную метку времени высокого разрешения, с которой начался текущий процесс `node`, измеряемую в Unix-времени.

### `performance.timerify(fn[, options])`

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `histogram` {RecordableHistogram} Объект гистограммы, созданный с помощью `perf_hooks.createHistogram()`, который будет записывать длительность выполнения в наносекундах.

_Это свойство является расширением Node.js. Оно недоступно в веб-браузерах._

Обертывает функцию внутри новой функции, которая измеряет время работы обернутой функции. Чтобы получить доступ к деталям времени, на тип события `функция` должен быть подписан `PerformanceObserver`.

```js
const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');

function someFunction() {
    console.log('hello world');
}

const wrapped = performance.timerify(someFunction);

const obs = new PerformanceObserver((list) => {
    console.log(list.getEntries()[0].duration);

    performance.clearMarks();
    performance.clearMeasures();
    obs.disconnect();
});
obs.observe({ entryTypes: ['function'] });

// Будет создана запись временной шкалы производительности
wrapped();
```

Если обернутая функция возвращает обещание, к обещанию будет присоединен обработчик finally, и продолжительность будет сообщена, когда обработчик finally будет вызван.

### `performance.toJSON()`.

Объект, который является JSON-представлением объекта `performance`. Он аналогичен [`window.performance.toJSON`](https://developer.mozilla.org/en-US/docs/Web/API/Performance/toJSON) в браузерах.

#### Event: `'resourcetimingbufferfull'`

Событие `'resourcetimingbufferfull'` происходит, когда глобальный буфер синхронизации ресурсов производительности заполнен. Отрегулируйте размер буфера синхронизации ресурсов с помощью `performance.setResourceTimingBufferSize()` или очистите буфер с помощью `performance.clearResourceTimings()` в слушателе события, чтобы позволить добавить больше записей в буфер временной шкалы производительности.

## Класс: `PerformanceEntry`.

Конструктор этого класса не доступен пользователям напрямую.

### `performanceEntry.duration`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Общее количество миллисекунд, прошедших для этой записи. Это значение будет иметь смысл не для всех типов Performance Entry.

### `performanceEntry.entryType`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Тип записи выступления. Он может быть одним из:

-   `'node'` (только для Node.js)
-   `'mark'` (доступно в Интернете)
-   `'measure'` (доступно в Интернете)
-   `'gc'` (только для Node.js)
-   `'function'` (только для Node.js)
-   `'http2'` (только для Node.js)
-   `'http'` (только Node.js)

### `performanceEntry.name`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя записи производительности.

### `performanceEntry.startTime`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, отмечающая время начала записи Performance Entry.

## Класс: `PerformanceMark`

-   Расширяет: {PerformanceEntry}

Раскрывает метки, созданные с помощью метода `Performance.mark()`.

### `performanceMark.detail`

-   [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Дополнительная деталь, указанная при создании методом `Performance.mark()`.

## Класс: `PerformanceMeasure`

-   Расширяет: {PerformanceEntry}

Раскрывает меры, созданные с помощью метода `Performance.measure()`.

Конструктор этого класса не доступен пользователям напрямую.

### `performanceMeasure.detail`

-   [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Дополнительная деталь, указанная при создании методом `Performance.measure()`.

## Класс: `PerformanceNodeEntry`.

-   Расширяет: {PerformanceEntry}

_Этот класс является расширением Node.js. Он недоступен в веб-браузерах._

Предоставляет подробные данные о времени работы Node.js.

Конструктор этого класса не доступен пользователям напрямую.

### `performanceNodeEntry.detail`

-   [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Дополнительная информация, специфичная для `entryType`.

### `performanceNodeEntry.flags`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Используйте `performanceNodeEntry.detail` вместо этого.

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Когда `performanceEntry.entryType` равен `'gc'`, свойство `performance.flags` содержит дополнительную информацию об операции сборки мусора. Значение может быть одним из:

-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_NO`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_CONSTRUCT_RETAINED`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_FORCED`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SYNCHRONOUS_PHANTOM_PROCESSING`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_AVAILABLE_GARBAGE`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_EXTERNAL_MEMORY`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SCHEDULE_IDLE`

### `performanceNodeEntry.kind`.

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Используйте `performanceNodeEntry.detail` вместо этого.

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Когда `performanceEntry.entryType` равен `'gc'`, свойство `performance.kind` идентифицирует тип операции сборки мусора, которая произошла. Значение может быть одним из:

-   `perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR`.
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL`
-   `perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB`

### Детали сборки мусора ('gc')

Когда `performanceEntry.type` равен `'gc'`, свойство `performanceNodeEntry.detail` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) с двумя свойствами:

-   `kind` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одно из:
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_MAJOR`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_MINOR`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_INCREMENTAL`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_WEAKCB`
-   `флаги` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Одно из:
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_NO`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_CONSTRUCT_RETAINED`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_FORCED`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SYNCHRONOUS_PHANTOM_PROCESSING`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_AVAILABLE_GARBAGE`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_ALL_EXTERNAL_MEMORY`
    -   `perf_hooks.constants.NODE_PERFORMANCE_GC_FLAGS_SCHEDULE_IDLE`

### Детали HTTP ('http')

Если `performanceEntry.type` равен `'http'`, свойство `performanceNodeEntry.detail` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим дополнительную информацию.

Если `performanceEntry.name` равно `HttpClient`, то `detail` будет содержать следующие свойства: `req`, `res`. Причем свойство `req` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим `method`, `url`, `headers`, а свойство `res` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим `statusCode`, `statusMessage`, `headers`.

Если `performanceEntry.name` равно `HttpRequest`, то `detail` будет содержать следующие свойства: `req`, `res`. Причем свойство `req` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим `method`, `url`, `headers`, а свойство `res` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим `statusCode`, `statusMessage`, `headers`.

Это может привести к дополнительным затратам памяти и должно использоваться только в диагностических целях, а не включаться в production по умолчанию.

### Подробности HTTP/2 ('http2')

Если `performanceEntry.type` равен `'http2'`, свойство `performanceNodeEntry.detail` будет представлять собой [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащий дополнительную информацию о производительности.

Если `performanceEntry.name` равно `Http2Stream`, то `detail` будет содержать следующие свойства:

-   `bytesRead` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байтов кадра `DATA`, полученных для данного `Http2Stream`.
-   `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт кадра `DATA`, отправленных для этого `Http2Stream`.
-   `id` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор связанного `Http2Stream`.
-   `timeToFirstByte` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и получением первого `DATA` кадра.
-   `timeToFirstByteSent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и отправкой первого кадра `DATA`.
-   `timeToFirstHeader` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, прошедших между `PerformanceEntry` `startTime` и получением первого заголовка.

Если `performanceEntry.name` равно `Http2Session`, то `detail` будет содержать следующие свойства:

-   `bytesRead` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество байт, полученных для данного `Http2Session`.
-   `bytesWritten` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество отправленных байт для этой `Http2Session`.
-   `framesReceived` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество кадров HTTP/2, полученных `Http2Session`.
-   `framesSent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество кадров HTTP/2, отправленных `Http2Session`.
-   `maxConcurrentStreams` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Максимальное количество потоков, одновременно открытых во время жизни `Http2Session`.
-   `pingRTT` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество миллисекунд, прошедших с момента передачи кадра `PING` и получения его подтверждения. Присутствует, только если кадр `PING` был отправлен на `Http2Session`.
-   `streamAverageDuration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Средняя продолжительность (в миллисекундах) для всех экземпляров `Http2Stream`.
-   `streamCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество экземпляров `Http2Stream`, обработанных `Http2Session`.
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Либо `сервер`, либо `клиент` для идентификации типа `Http2Session``.

### Детали таймерификации ('функция')

Когда `performanceEntry.type` равен `'function'`, свойство `performanceNodeEntry.detail` будет представлять собой [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array), перечисляющий входные аргументы для функции с таймером.

### Net ('net') Details

Если `performanceEntry.type` равен `'net'`, свойство `performanceNodeEntry.detail` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим дополнительную информацию.

Если `performanceEntry.name` равно `connect`, то `detail` будет содержать следующие свойства: `host`, `port`.

### Детали DNS ('dns')

Когда `performanceEntry.type` равен `'dns'`, свойство `performanceNodeEntry.detail` будет [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object), содержащим дополнительную информацию.

Если `performanceEntry.name` равно `lookup`, то `detail` будет содержать следующие свойства: `hostname`, `family`, `hints`, `verbatim`, `addresses`.

Если `performanceEntry.name` равно `lookupService`, `detail` будет содержать следующие свойства: `host`, `port`, `hostname`, `service`.

Если `performanceEntry.name` равно `queryxxx` или `getHostByAddr`, `detail` будет содержать следующие свойства: `host`, `ttl`, `result`. Значение `result` совпадает с результатом `queryxxx` или `getHostByAddr`.

## Класс: `PerformanceNodeTiming`.

-   Расширяет: {PerformanceEntry}

_Это свойство является расширением Node.js. Оно недоступно в веб-браузерах._

Предоставляет сведения о тайминге для самого Node.js. Конструктор этого класса не доступен для пользователей.

### `performanceNodeTiming.bootstrapComplete`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная метка времени высокого разрешения, когда процесс Node.js завершил начальную загрузку. Если бутстраппинг еще не завершен, свойство имеет значение -1.

### `performanceNodeTiming.environment`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, в которой была инициализирована среда Node.js.

### `performanceNodeTiming.idleTime`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения количества времени, в течение которого цикл событий простаивал в провайдере событий цикла событий (например, `epoll_wait`). При этом не учитывается использование процессора. Если цикл событий еще не запущен (например, в первом тике основного скрипта), свойство имеет значение 0.

### `performanceNodeTiming.loopExit`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, в которой цикл событий Node.js завершился. Если цикл событий еще не завершился, свойство имеет значение -1. Оно может иметь значение не -1 только в обработчике события [`'exit'`](process.md#event-exit).

### `performanceNodeTiming.loopStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная метка времени высокого разрешения, с которой начался цикл событий Node.js. Если цикл событий еще не начался (например, в первом тике основного скрипта), свойство имеет значение -1.

### `performanceNodeTiming.nodeStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, в которой был инициализирован процесс Node.js.

### `performanceNodeTiming.v8Start`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, в которую была инициализирована платформа V8.

## Класс: `PerformanceResourceTiming`.

-   Расширяет: {PerformanceEntry}

Предоставляет подробные данные о сетевом времени загрузки ресурсов приложения.

Конструктор этого класса не доступен пользователям напрямую.

### `performanceResourceTiming.workerStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная метка времени высокого разрешения непосредственно перед отправкой запроса `fetch`. Если ресурс не перехвачен рабочим, свойство всегда будет возвращать 0.

### `performanceResourceTiming.redirectStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, которая представляет время начала выборки, инициирующей перенаправление.

### `performanceResourceTiming.redirectEnd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, которая будет создана сразу после получения последнего байта ответа последнего редиректа.

### `performanceResourceTiming.fetchStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Временная метка высокого разрешения в миллисекундах непосредственно перед тем, как Node.js начнет выборку ресурса.

### `performanceResourceTiming.domainLookupStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Временная метка высокого разрешения в миллисекундах непосредственно перед тем, как Node.js начнет поиск доменного имени для ресурса.

### `performanceResourceTiming.domainLookupEnd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, представляющая время сразу после того, как Node.js завершил поиск доменного имени для ресурса.

### `performanceResourceTiming.connectStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, представляющая время непосредственно перед тем, как Node.js начнет устанавливать соединение с сервером для получения ресурса.

### `performanceResourceTiming.connectEnd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, представляющая время сразу после того, как Node.js завершает установление соединения с сервером для получения ресурса.

### `performanceResourceTiming.secureConnectionStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, представляющая время непосредственно перед тем, как Node.js начнет процесс рукопожатия для защиты текущего соединения.

### `performanceResourceTiming.requestStart`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, представляющая время непосредственно перед тем, как Node.js получит первый байт ответа от сервера.

### `performanceResourceTiming.responseEnd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная временная метка высокого разрешения, представляющая время сразу после получения Node.js последнего байта ресурса или непосредственно перед закрытием транспортного соединения, в зависимости от того, что наступит раньше.

### `performanceResourceTiming.transferSize`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число, представляющее размер (в октетах) полученного ресурса. Размер включает поля заголовка ответа плюс тело полезной нагрузки ответа.

### `performanceResourceTiming.encodedBodySize`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число, представляющее размер (в октетах), полученный при выборке (HTTP или кэш), тела полезной нагрузки, до удаления любых примененных кодировок содержимого.

### `performanceResourceTiming.decodedBodySize`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Число, представляющее размер (в октетах), полученный при выборке (HTTP или кэш), тела сообщения после удаления любых примененных кодировок содержимого.

### `performanceResourceTiming.toJSON()`.

Возвращает `объект`, который является JSON-представлением объекта `PerformanceResourceTiming

## Класс: `PerformanceObserver`

### `PerformanceObserver.supportedEntryTypes`

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Получить поддерживаемые типы.

### `новый PerformanceObserver(callback)`.

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
    -   `список` {PerformanceObserverEntryList}
    -   `обсервер` {PerformanceObserver}

Объекты `PerformanceObserver` предоставляют уведомления о добавлении новых экземпляров `PerformanceEntry` на временную шкалу производительности.

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

Поскольку экземпляры `PerformanceObserver` создают свои собственные дополнительные накладные расходы на производительность, экземпляры не следует оставлять подписанными на уведомления на неопределенный срок. Пользователи должны отключать наблюдателей, как только в них отпадает необходимость.

Обратный вызов `callback` вызывается, когда `PerformanceObserver` получает уведомление о новых экземплярах `PerformanceEntry`. Обратный вызов получает экземпляр `PerformanceObserverEntryList` и ссылку на `PerformanceObserver`.

### `performanceObserver.disconnect()`.

Отключает экземпляр `PerformanceObserver` от всех уведомлений.

### `performanceObserver.observe(options)`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Один тип {PerformanceEntry}. Не должно быть задано, если `entryTypes` уже указан.
    -   `entryTypes` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Массив строк, идентифицирующих типы экземпляров {PerformanceEntry}, которые интересуют наблюдателя. Если он не указан, будет выдана ошибка.
    -   `buffered` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если true, обратный вызов наблюдателя вызывается со списком глобальных буферизованных записей `PerformanceEntry`. Если false, только `PerformanceEntry`, созданные после временной точки, передаются обратному вызову наблюдателя. **По умолчанию:** `false`.

Подписывает экземпляр {PerformanceObserver} на уведомления о новых экземплярах {PerformanceEntry}, идентифицированных либо по `options.entryTypes`, либо по `options.type`:

```js
const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');

const obs = new PerformanceObserver((list, observer) => {
    // Вызывается один раз асинхронно. `list` содержит три элемента.
});
obs.observe({ type: 'mark' });

for (let n = 0; n < 3; n++) performance.mark(`test${n}`);
```

## Класс: `PerformanceObserverEntryList`.

Класс `PerformanceObserverEntryList` используется для предоставления доступа к экземплярам `PerformanceEntry`, переданным `PerformanceObserver`. Конструктор этого класса не доступен для пользователей.

### `performanceObserverEntryList.getEntries()`

-   Возвращает: {PerformanceEntry\[\]}

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`.

```js
const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');

const obs = new PerformanceObserver(
    (perfObserverList, observer) => {
        console.log(perfObserverList.getEntries());
        /**
         * [
         * PerformanceEntry {
         * name: 'test',
         * entryType: 'mark',
         * startTime: 81.465639,
         * продолжительность: 0
         * },
         * PerformanceEntry {
         * name: 'meow',
         * entryType: 'mark',
         * startTime: 81.860064,
         * duration: 0
         * }
         * ]
         */

        performance.clearMarks();
        performance.clearMeasures();
        observer.disconnect();
    }
);
obs.observe({ type: 'mark' });

performance.mark('test');
performance.mark('meow');
```

### `performanceObserverEntryList.getEntriesByName(name[, type])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `тип` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {PerformanceEntry\[\]}

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`, чье `performanceEntry.name` равно `name`, и, опционально, чей `performanceEntry.entryType` равен `type`.

```js
const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');

const obs = new PerformanceObserver(
    (perfObserverList, observer) => {
        console.log(
            perfObserverList.getEntriesByName('meow')
        );
        /**
         * [
         * PerformanceEntry {
         * name: 'meow',
         * entryType: 'mark',
         * startTime: 98.545991,
         * продолжительность: 0
         * }
         * ]
         */
        console.log(
            perfObserverList.getEntriesByName('nope')
        ); // []

        console.log(
            perfObserverList.getEntriesByName(
                'test',
                'mark'
            )
        );
        /**
         * [
         * PerformanceEntry {
         * name: 'test',
         * entryType: 'mark',
         * startTime: 63.518931,
         * продолжительность: 0
         * }
         * ]
         */
        console.log(
            perfObserverList.getEntriesByName(
                'test',
                'measure'
            )
        ); // []

        performance.clearMarks();
        performance.clearMeasures();
        observer.disconnect();
    }
);
obs.observe({ entryTypes: ['mark', 'measure'] });

performance.mark('test');
performance.mark('meow');
```

### `performanceObserverEntryList.getEntriesByType(type)`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: {PerformanceEntry\[\]}

Возвращает список объектов `PerformanceEntry` в хронологическом порядке относительно `performanceEntry.startTime`, чей `performanceEntry.entryType` равен `type`.

```js
const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');

const obs = new PerformanceObserver(
    (perfObserverList, observer) => {
        console.log(
            perfObserverList.getEntriesByType('mark')
        );
        /**
         * [
         * PerformanceEntry {
         * name: 'test',
         * entryType: 'mark',
         * startTime: 55.897834,
         * duration: 0
         * },
         * PerformanceEntry {
         * name: 'meow',
         * entryType: 'mark',
         * startTime: 56.350146,
         * duration: 0
         * }
         * ]
         */
        performance.clearMarks();
        performance.clearMeasures();
        observer.disconnect();
    }
);
obs.observe({ type: 'mark' });

performance.mark('test');
performance.mark('meow');
```

## `perf_hooks.createHistogram([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `lowest` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Наименьшее различимое значение. Должно быть целое значение больше 0. **По умолчанию:** `1`.
    -   `highest` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Наибольшее регистрируемое значение. Должно быть целочисленным значением, которое равно или больше чем в два раза `lowest`. **По умолчанию:** `число.MAX_SAFE_INTEGER`.
    -   `фигуры` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество цифр точности. Должно быть числом от `1` до `5`. **По умолчанию:** `3`.
-   Returns {RecordableHistogram}

Возвращает {RecordableHistogram}.

## `perf_hooks.monitorEventLoopDelay([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `resolution` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Частота дискретизации в миллисекундах. Должно быть больше нуля. **По умолчанию:** `10`.
-   Возвращает: {IntervalHistogram}

\_Это свойство является расширением Node.js. Оно недоступно в веб-браузерах.

Создает объект `IntervalHistogram`, который сэмплирует и сообщает о задержке цикла события во времени. Задержки будут сообщаться в наносекундах.

Использование таймера для определения приблизительной задержки цикла событий работает потому, что выполнение таймеров привязано к жизненному циклу цикла событий libuv. То есть, задержка в цикле вызовет задержку в выполнении таймера, и именно эти задержки и призван обнаружить данный API.

```js
const {
    monitorEventLoopDelay,
} = require('node:perf_hooks');
const h = monitorEventLoopDelay({ разрешение: 20 });
h.enable();
// Сделайте что-нибудь.
h.disable();
console.log(h.min);
console.log(h.max);
console.log(h.mean);
console.log(h.stddev);
console.log(h.percentiles);
console.log(h.percentile(50));
console.log(h.percentile(99));
```

## Класс: `Гистограмма`

### `histogram.count`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество образцов, записанных гистограммой.

### `histogram.countBigInt`

-   [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Количество образцов, записанных гистограммой.

### `histogram.exceeds`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Количество раз, когда задержка цикла событий превысила максимальный порог задержки цикла событий в 1 час.

### `histogram.exceedsBigInt`

-   [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Количество раз, когда задержка цикла событий превысила максимальный порог задержки цикла событий в 1 час.

### `histogram.max`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Максимальная задержка цикла записи события.

### `histogram.maxBigInt`

-   [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Максимальная задержка цикла записанных событий.

### `histogram.mean`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Среднее значение записанных задержек циклов событий.

### `histogram.min`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Минимальная зарегистрированная задержка цикла событий.

### `histogram.minBigInt`

-   [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Минимальная зарегистрированная задержка цикла событий.

### `histogram.percentile(percentile)`

-   `percentile` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение перцентиля в диапазоне (0, 100\].
-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает значение в заданном процентиле.

### `histogram.percentileBigInt(percentile)`.

-   `percentile` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Значение перцентиля в диапазоне (0, 100\).
-   Возвращает: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Возвращает значение в заданном процентиле.

### `histogram.percentiles`

-   {Map}

Возвращает объект `Map`, детализирующий накопленное перцентильное распределение.

### `histogram.percentilesBigInt`

-   {Map}

Возвращает объект `Map`, детализирующий накопленное перцентильное распределение.

### `histogram.reset()`.

Сбрасывает собранные данные гистограммы.

### `histogram.stddev`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Стандартное отклонение записанных задержек циклов событий.

## Класс: `IntervalHistogram расширяет Histogram`.

Гистограмма, которая периодически обновляется на заданном интервале.

### `histogram.disable()`.

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Отключает таймер интервала обновления. Возвращает `true`, если таймер был остановлен, `false`, если он уже был остановлен.

### `histogram.enable()`.

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Включает таймер интервала обновления. Возвращает `true`, если таймер был запущен, `false`, если он уже был запущен.

### Клонирование `IntervalHistogram`.

Экземпляры {IntervalHistogram} могут быть клонированы через {MessagePort}. На принимающей стороне гистограмма клонируется как обычный объект {Histogram}, который не реализует методы `enable()` и `disable()`.

## Класс: `RecordableHistogram расширяет Histogram`.

### `histogram.add(other)`

-   `other` {RecordableHistogram}

Добавляет значения из `other` к этой гистограмме.

### `histogram.record(val)`

-   `val` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt) Величина для записи в гистограмму.

### `histogram.recordDelta()`

Вычисляет количество времени (в наносекундах), прошедшее с момента предыдущего вызова `recordDelta()` и записывает это количество в гистограмму.

## Примеры

### Измерение длительности асинхронных операций

Следующий пример использует API [Async Hooks](async_hooks.md) и Performance для измерения фактической продолжительности операции Timeout (включая время, необходимое для выполнения обратного вызова).

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
            performance.measure(
                `Timeout-${id}`,
                `Timeout-${id}-Init`,
                `Timeout-${id}-Destroy`
            );
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

### Измерение длительности загрузки зависимостей

Следующий пример измеряет продолжительность операций `require()` для загрузки зависимостей:

```js
'use strict';
const {
    performance,
    PerformanceObserver,
} = require('node:perf_hooks');
const mod = require('node:module');

// Обезьяний патч для функции require
mod.Module.prototype.require = performance.timerify(
    mod.Module.prototype.require
);
require = performance.timerify(require);

// Активируем наблюдатель
const obs = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
        console.log(
            `require('${entry[0]}')`,
            entry.duration
        );
    });
    performance.clearMarks();
    performance.clearMeasures();
    obs.disconnect();
});
obs.observe({ entryTypes: ['function'], buffered: true });

require('some-module');
```

### Измерение времени, затрачиваемого на один HTTP-раундтрип.

Следующий пример используется для отслеживания времени, затраченного HTTP клиентом (`OutgoingMessage`) и HTTP запросом (`IncomingMessage`). Для HTTP клиента это означает промежуток времени между отправкой запроса и получением ответа, а для HTTP запроса - промежуток времени между получением запроса и отправкой ответа:

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

### Измерение времени, которое занимает `net.connect` (только для TCP) при успешном соединении

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

### Измерение времени, которое занимает DNS при успешном выполнении запроса

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
