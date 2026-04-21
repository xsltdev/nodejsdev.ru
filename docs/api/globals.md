---
title: Глобальные объекты
description: Глобальные объекты и API, доступные во всех модулях Node.js
---

# Глобальные объекты

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Эти объекты доступны во всех модулях.

Следующие переменные могут казаться глобальными, но таковыми не являются. Они существуют только в области видимости [модулей CommonJS](modules.md):

-   [`__dirname`](modules.md#__dirname)
-   [`__filename`](modules.md#__filename)
-   [`exports`](modules.md#exports)
-   [`module`](modules.md#module)
-   [`require()`](modules.md#requireid)

Перечисленные ниже объекты относятся к Node.js. Есть и [встроенные объекты](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects), входящие в сам язык JavaScript; они тоже доступны глобально.

## `__dirname`

Эта переменная может казаться глобальной, но таковой не является. См. [`__dirname`](modules.md#__dirname).

## `__filename`

Эта переменная может казаться глобальной, но таковой не является. См. [`__filename`](modules.md#__filename).

## Класс: `AbortController`

Вспомогательный класс для сигнализации об отмене в выбранных API на основе `Promise`. API основан на веб-API [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

```js
const ac = new AbortController();

ac.signal.addEventListener(
    'abort',
    () => console.log('Aborted!'),
    { once: true }
);

ac.abort();

console.log(ac.signal.aborted); // Выводит true
```

### `abortController.abort([reason])`

-   `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательная причина; доступна в свойстве `reason` у `AbortSignal`.

Инициирует сигнал отмены: у `abortController.signal` генерируется событие `'abort'`.

### `abortController.signal`

-   Тип: [`<AbortSignal>`](globals.md#abortsignal)

## Класс: `AbortSignal`

-   Расширяет: [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget)

`AbortSignal` уведомляет подписчиков о вызове метода `abortController.abort()`.

### Статический метод: `AbortSignal.abort([reason])`

-   `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   Возвращает: [`<AbortSignal>`](globals.md#abortsignal)

Возвращает новый уже прерванный `AbortSignal`.

### Статический метод: `AbortSignal.timeout(delay)`

-   `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах до срабатывания `AbortSignal`.

Возвращает новый `AbortSignal`, который будет прерван через `delay` миллисекунд.

### Статический метод: `AbortSignal.any(signals)`

-   `signals` [`<AbortSignal[]>`](globals.md#abortsignal) `AbortSignal`, из которых составляется новый `AbortSignal`.

Возвращает новый `AbortSignal`, который будет прерван, если прерван любой из переданных сигналов. Свойство [`abortSignal.reason`](globals.md#abortsignalreason) получит значение той причины, которая привела к прерыванию.

### Событие: `'abort'`

Событие `'abort'` генерируется при вызове `abortController.abort()`. Колбэк получает один объект-аргумент с единственным свойством `type`, равным `'abort'`:

```js
const ac = new AbortController();

// Через свойство onabort...
ac.signal.onabort = () => console.log('aborted!');

// Или через API EventTarget...
ac.signal.addEventListener(
    'abort',
    (event) => {
        console.log(event.type); // Выводит 'abort'
    },
    { once: true }
);

ac.abort();
```

`AbortController`, связанный с `AbortSignal`, может сгенерировать `'abort'` только один раз. Рекомендуется проверять, что `abortSignal.aborted` равно `false`, перед добавлением слушателя `'abort'`.

Слушатели на `AbortSignal` следует вешать с опцией `{ once: true }` (или через `once()` у `EventEmitter`), чтобы слушатель удалился сразу после обработки `'abort'`. Иначе возможны утечки памяти.

### `abortSignal.aborted`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после того, как `AbortController` был прерван.

### `abortSignal.onabort`

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Необязательный колбэк, который пользовательский код может задать для уведомления о вызове `abortController.abort()`.

### `abortSignal.reason`

-   Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Необязательная причина, указанная при срабатывании `AbortSignal`.

```js
const ac = new AbortController();
ac.abort(new Error('boom!'));
console.log(ac.signal.reason); // Error: boom!
```

### `abortSignal.throwIfAborted()`

Если `abortSignal.aborted` равно `true`, выбрасывает `abortSignal.reason`.

## `atob(data)`

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого `Buffer.from(data, 'base64')`.

Глобальный псевдоним для [`buffer.atob()`](buffer.md#bufferatobdata).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa)):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

## Класс: `Blob`

См. [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

## Класс: `BroadcastChannel`

См. [BroadcastChannel](worker_threads.md).

## `btoa(data)`

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого `buf.toString('base64')`.

Глобальный псевдоним для [`buffer.btoa()`](buffer.md#bufferbtoadata).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa)):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

## Класс: `Buffer`

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Для работы с двоичными данными. См. раздел [buffer](buffer.md).

## Класс: `ByteLengthQueuingStrategy`

Реализация [`ByteLengthQueuingStrategy`](webstreams.md#class-bytelengthqueuingstrategy), совместимая с браузером.

## `clearImmediate(immediateObject)`

[`clearImmediate`](timers.md#clearimmediateimmediate) описан в разделе [таймеры](timers.md).

## `clearInterval(intervalObject)`

[`clearInterval`](timers.md#clearintervaltimeout) описан в разделе [таймеры](timers.md).

## `clearTimeout(timeoutObject)`

[`clearTimeout`](timers.md#cleartimeouttimeout) описан в разделе [таймеры](timers.md).

## Класс: `CloseEvent`

Реализация [CloseEvent](globals.md), совместимая с браузером. Отключите это API флагом CLI [`--no-experimental-websocket`](cli.md#--no-experimental-websocket).

## Класс: `CompressionStream`

Реализация [`CompressionStream`](webstreams.md#class-compressionstream), совместимая с браузером.

## `console`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Вывод в stdout и stderr. См. раздел [`console`](console.md).

## Класс: `CountQueuingStrategy`

Реализация [`CountQueuingStrategy`](webstreams.md#class-countqueuingstrategy), совместимая с браузером.

## Класс: `Crypto`

Реализация [Crypto](crypto.md), совместимая с браузером. Глобал доступен только если бинарник Node.js собран с поддержкой модуля `node:crypto`.

## `crypto`

Реализация [Web Crypto API](webcrypto.md), совместимая с браузером.

## Класс: `CryptoKey`

Реализация [CryptoKey](webcrypto.md#class-cryptokey), совместимая с браузером. Глобал доступен только если бинарник Node.js собран с поддержкой модуля `node:crypto`.

## Класс: `CustomEvent`

Реализация [CustomEvent](globals.md), совместимая с браузером.

## Класс: `DecompressionStream`

Реализация [`DecompressionStream`](webstreams.md#class-decompressionstream), совместимая с браузером.

## Класс: `DOMException`

Класс WHATWG [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException).

## `ErrorEvent`

Реализация [ErrorEvent](globals.md), совместимая с браузером.

## Класс: `Event`

Реализация класса `Event`, совместимая с браузером. Подробнее — [API `EventTarget` и `Event`](events.md#eventtarget-and-event-api).

## Класс: `EventSource`

!!!warning "Стабильность: 1 – Экспериментальная"

    Включите это API флагом CLI [`--experimental-eventsource`](cli.md#--experimental-eventsource).

Реализация [EventSource](globals.md), совместимая с браузером.

## Класс: `EventTarget`

Реализация класса `EventTarget`, совместимая с браузером. Подробнее — [API `EventTarget` и `Event`](events.md#eventtarget-and-event-api).

## `exports`

Эта переменная может казаться глобальной, но таковой не является. См. [`exports`](modules.md#exports).

## `fetch`

Реализация функции [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch), совместимая с браузером.

=== "MJS"

    ```js
    const res = await fetch('https://nodejs.org/api/documentation.json');
    if (res.ok) {
      const data = await res.json();
      console.log(data);
    }
    ```

Реализация основана на [undici](https://undici.nodejs.org) — HTTP/1.1-клиенте для Node.js. Версию встроенного `undici` можно узнать по свойству `process.versions.undici`.

### Пользовательский dispatcher

Можно передать свой dispatcher в опциях `fetch`. Он должен быть совместим с [`Dispatcher` из undici](https://undici.nodejs.org/#/docs/api/Dispatcher.md).

```js
fetch(url, { dispatcher: new MyAgent() });
```

Глобальный dispatcher в Node.js можно сменить, установив `undici` и вызвав `setGlobalDispatcher()`. Это затронет и `undici`, и Node.js.

=== "MJS"

    ```js
    import { setGlobalDispatcher } from 'undici';
    setGlobalDispatcher(new MyAgent());
    ```

### Связанные классы

С `fetch` можно использовать глобалы:

-   [`FormData`](#class-formdata)
-   [`Headers`](#class-headers)
-   [`Request`](#class-request)
-   [`Response`](#class-response)

## Класс: `File`

См. [File](https://developer.mozilla.org/en-US/docs/Web/API/File).

## Класс: `FormData` {#class-formdata}

Реализация [FormData](#class-formdata), совместимая с браузером.

## `global`

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis).

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект глобального пространства имён.

В браузерах традиционно верхний уровень — глобальная область: `var something` создаёт глобальную переменную (кроме модулей ECMAScript). В Node.js иначе: верхний уровень модуля не совпадает с глобальной областью; `var something` в модуле Node.js локально для этого модуля — и для [CommonJS](modules.md), и для [ECMAScript](esm.md).

## Класс: `Headers` {#class-headers}

Реализация [Headers](globals.md#class-headers), совместимая с браузером.

## `localStorage`

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`](cli.md#--no-experimental-webstorage).

Реализация [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), совместимая с браузером. Данные хранятся без шифрования в файле, заданном флагом CLI [`--localstorage-file`](cli.md#--localstorage-filefile). Максимальный объём — 10 МБ. Изменение данных вне Web Storage API не поддерживается. На сервере `localStorage` не разделён по пользователям или запросам: данные общие для всех.

## Класс: `MessageChannel`

Класс `MessageChannel`. Подробнее — [`MessageChannel`](worker_threads.md#class-messagechannel).

## Класс: `MessageEvent`

Реализация [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent/MessageEvent), совместимая с браузером.

## Класс: `MessagePort`

Класс `MessagePort`. Подробнее — [`MessagePort`](worker_threads.md#class-messageport).

## `module`

Эта переменная может казаться глобальной, но таковой не является. См. [`module`](modules.md#module).

## Класс: `Navigator`

!!!warning "Стабильность: 1 – Экспериментальная"

    Отключите это API флагом [`--no-experimental-global-navigator`](cli.md#--no-experimental-global-navigator).

Частичная реализация [Navigator API](https://html.spec.whatwg.org/multipage/system-state.html#the-navigator-object).

## `navigator`

!!!warning "Стабильность: 1 – Экспериментальная"

    Отключите это API флагом [`--no-experimental-global-navigator`](cli.md#--no-experimental-global-navigator).

Частичная реализация [`window.navigator`](https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator).

### `navigator.hardwareConcurrency`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `navigator.hardwareConcurrency` только для чтения: число логических процессоров, доступных текущему экземпляру Node.js.

```js
console.log(
    `This process is running on ${navigator.hardwareConcurrency} logical processors`
);
```

### `navigator.language`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.language` только для чтения: предпочитаемый язык экземпляра Node.js. Определяется библиотекой ICU по умолчанию языка ОС.

Формат — как в [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646.txt).

Без ICU значение по умолчанию — `'en-US'`.

```js
console.log(
    `The preferred language of the Node.js instance has the tag '${navigator.language}'`
);
```

### `navigator.languages`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.languages` только для чтения: массив предпочитаемых языков. По умолчанию содержит только `navigator.language` (см. выше).

Без ICU — `['en-US']`.

```js
console.log(
    `The preferred languages are '${navigator.languages}'`
);
```

### `navigator.locks`

!!!warning "Стабильность: 1 – Экспериментальная"

Свойство `navigator.locks` только для чтения: экземпляр [`LockManager`](worker_threads.md#class-lockmanager) для координации доступа к ресурсам между потоками одного процесса. Семантика соответствует [браузерному API `LockManager`](https://developer.mozilla.org/en-US/docs/Web/API/LockManager).

=== "MJS"

    ```js
    // Эксклюзивная блокировка
    await navigator.locks.request('my_resource', async (lock) => {
      console.log(`Lock acquired: ${lock.name}`);
    });

    // Разделяемая блокировка
    await navigator.locks.request('shared_resource', { mode: 'shared' }, async (lock) => {
      console.log(`Shared lock acquired: ${lock.name}`);
    });
    ```

=== "CJS"

    ```js
    navigator.locks.request('my_resource', async (lock) => {
      console.log(`Lock acquired: ${lock.name}`);
    }).then(() => {
      console.log('Lock released');
    });

    navigator.locks.request('shared_resource', { mode: 'shared' }, async (lock) => {
      console.log(`Shared lock acquired: ${lock.name}`);
    }).then(() => {
      console.log('Shared lock released');
    });
    ```

Подробная документация — [`worker_threads.locks`](worker_threads.md#worker_threadslocks).

### `navigator.platform`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.platform` только для чтения: строка с идентификатором платформы.

```js
console.log(
    `This process is running on ${navigator.platform}`
);
```

### `navigator.userAgent`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.userAgent` только для чтения: user agent — имя среды и мажорная версия.

```js
console.log(`The user-agent is ${navigator.userAgent}`); // Выводит "Node.js/21"
```

## `performance`

Объект [`perf_hooks.performance`](perf_hooks.md#perf_hooksperformance).

## Класс: `PerformanceEntry`

Класс `PerformanceEntry`. См. [`PerformanceEntry`](perf_hooks.md#class-performanceentry).

## Класс: `PerformanceMark`

Класс `PerformanceMark`. См. [`PerformanceMark`](perf_hooks.md#class-performancemark).

## Класс: `PerformanceMeasure`

Класс `PerformanceMeasure`. См. [`PerformanceMeasure`](perf_hooks.md#class-performancemeasure).

## Класс: `PerformanceObserver`

Класс `PerformanceObserver`. См. [`PerformanceObserver`](perf_hooks.md#class-performanceobserver).

## Класс: `PerformanceObserverEntryList`

Класс `PerformanceObserverEntryList`. См. [`PerformanceObserverEntryList`](perf_hooks.md#class-performanceobserverentrylist).

## Класс: `PerformanceResourceTiming`

Класс `PerformanceResourceTiming`. См. [`PerformanceResourceTiming`](perf_hooks.md#class-performanceresourcetiming).

## `process`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект process. См. раздел [объект `process`](process.md#process).

## `queueMicrotask(callback)`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция для постановки в очередь.

`queueMicrotask()` ставит микрозадачу на вызов `callback`. Если `callback` выбрасывает исключение, генерируется событие [`process` object](process.md#process) `'uncaughtException'`.

Очередь микрозадач управляется V8; её можно сравнить с очередью [`process.nextTick()`](process.md#processnexttickcallback-args), которую управляет Node.js. Очередь `process.nextTick()` всегда обрабатывается раньше очереди микрозадач в каждом цикле событий.

```js
// `queueMicrotask()` гарантирует, что событие 'load' всегда
// эмитится асинхронно и предсказуемо. С `process.nextTick()` событие 'load'
// всегда шло бы раньше других задач с промисами.

DataHandler.prototype.load = async function load(key) {
    const hit = this._cache.get(key);
    if (hit !== undefined) {
        queueMicrotask(() => {
            this.emit('load', hit);
        });
        return;
    }

    const data = await fetchData(key);
    this._cache.set(key, data);
    this.emit('load', data);
};
```

## Класс: `QuotaExceededError`

Класс WHATWG [QuotaExceededError](globals.md). Наследует [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException).

## Класс: `ReadableByteStreamController`

Реализация [`ReadableByteStreamController`](webstreams.md#class-readablebytestreamcontroller), совместимая с браузером.

## Класс: `ReadableStream`

Реализация [`ReadableStream`](webstreams.md#class-readablestream), совместимая с браузером.

## Класс: `ReadableStreamBYOBReader`

Реализация [`ReadableStreamBYOBReader`](webstreams.md#class-readablestreambyobreader), совместимая с браузером.

## Класс: `ReadableStreamBYOBRequest`

Реализация [`ReadableStreamBYOBRequest`](webstreams.md#class-readablestreambyobrequest), совместимая с браузером.

## Класс: `ReadableStreamDefaultController`

Реализация [`ReadableStreamDefaultController`](webstreams.md#class-readablestreamdefaultcontroller), совместимая с браузером.

## Класс: `ReadableStreamDefaultReader`

Реализация [`ReadableStreamDefaultReader`](webstreams.md#class-readablestreamdefaultreader), совместимая с браузером.

## Класс: `Request` {#class-request}

Реализация [Request](#class-request), совместимая с браузером.

## `require()`

Эта переменная может казаться глобальной, но таковой не является. См. [`require()`](modules.md#requireid).

## Класс: `Response` {#class-response}

Реализация [Response](#class-response), совместимая с браузером.

## `sessionStorage`

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`](cli.md#--no-experimental-webstorage).

Реализация [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), совместимая с браузером. Данные в памяти, квота 10 МБ. `sessionStorage` живёт только в текущем процессе и не разделяется между worker.

## `setImmediate(callback[, ...args])`

[`setImmediate`](timers.md#setimmediatecallback-args) описан в разделе [таймеры](timers.md).

## `setInterval(callback, delay[, ...args])`

[`setInterval`](timers.md#setintervalcallback-delay-args) описан в разделе [таймеры](timers.md).

## `setTimeout(callback, delay[, ...args])`

[`setTimeout`](timers.md#settimeoutcallback-delay-args) описан в разделе [таймеры](timers.md).

## Класс: `Storage`

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`](cli.md#--no-experimental-webstorage).

Реализация [Storage](globals.md), совместимая с браузером.

## `structuredClone(value[, options])`

Метод WHATWG [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone).

## Класс: `SubtleCrypto`

Реализация [SubtleCrypto](webcrypto.md), совместимая с браузером. Глобал доступен только если бинарник Node.js собран с поддержкой модуля `node:crypto`.

## Класс: `TextDecoder`

Класс WHATWG `TextDecoder`. См. раздел [`TextDecoder`](util.md#class-utiltextdecoder).

## Класс: `TextDecoderStream`

Реализация [`TextDecoderStream`](webstreams.md#class-textdecoderstream), совместимая с браузером.

## Класс: `TextEncoder`

Класс WHATWG `TextEncoder`. См. раздел [`TextEncoder`](util.md#class-utiltextencoder).

## Класс: `TextEncoderStream`

Реализация [`TextEncoderStream`](webstreams.md#class-textencoderstream), совместимая с браузером.

## Класс: `TransformStream`

Реализация [`TransformStream`](webstreams.md#class-transformstream), совместимая с браузером.

## Класс: `TransformStreamDefaultController`

Реализация [`TransformStreamDefaultController`](webstreams.md#class-transformstreamdefaultcontroller), совместимая с браузером.

## Класс: `URL`

Класс WHATWG `URL`. См. раздел [`URL`](url.md#class-url).

## Класс: `URLPattern`

!!!warning "Стабильность: 1 – Экспериментальная"

Класс WHATWG `URLPattern`. См. раздел [`URLPattern`](url.md#class-urlpattern).

## Класс: `URLSearchParams`

Класс WHATWG `URLSearchParams`. См. раздел [`URLSearchParams`](url.md#class-urlsearchparams).

## Класс: `WebAssembly`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Пространство имён для функциональности W3C [WebAssembly](https://webassembly.org). Использование и совместимость — на [MDN](https://developer.mozilla.org/en-US/docs/WebAssembly).

## Класс: `WebSocket`

Реализация [WebSocket](globals.md), совместимая с браузером. Отключите API флагом [`--no-experimental-websocket`](cli.md#--no-experimental-websocket).

## Класс: `WritableStream`

Реализация [`WritableStream`](webstreams.md#class-writablestream), совместимая с браузером.

## Класс: `WritableStreamDefaultController`

Реализация [`WritableStreamDefaultController`](webstreams.md#class-writablestreamdefaultcontroller), совместимая с браузером.

## Класс: `WritableStreamDefaultWriter`

Реализация [`WritableStreamDefaultWriter`](webstreams.md#class-writablestreamdefaultwriter), совместимая с браузером.
