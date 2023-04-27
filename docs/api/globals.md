# Глобальные объекты

<!--introduced_in=v0.10.0-->

<!-- type=misc -->

Эти объекты доступны во всех модулях. Следующие переменные могут показаться глобальными, но это не так. Они существуют только в составе модулей, см. [документация по модульной системе](modules.md):

-   [`__dirname`](modules.md#__dirname)
-   [`__filename`](modules.md#__filename)
-   [`exports`](modules.md#exports)
-   [`module`](modules.md#module)
-   [`require()`](modules.md#requireid)

Перечисленные здесь объекты относятся к Node.js. Есть [встроенные объекты](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) которые являются частью самого языка JavaScript и также доступны во всем мире.

## Класс: `AbortController`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
-->

<!-- type=global -->

Служебный класс, используемый для сигнализации отмены в выбранных `Promise`на основе API. API основан на веб-API [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

```js
const ac = new AbortController();

ac.signal.addEventListener(
    'abort',
    () => console.log('Aborted!'),
    { once: true }
);

ac.abort();

console.log(ac.signal.aborted); // Prints True
```

### `abortController.abort()`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

Запускает сигнал прерывания, вызывая `abortController.signal` испустить `'abort'` событие.

### `abortController.signal`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Тип: {AbortSignal}

### Класс: `AbortSignal`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Расширяется: {EventTarget}

В `AbortSignal` используется для уведомления наблюдателей, когда `abortController.abort()` вызывается метод.

#### Статический метод: `AbortSignal.abort()`

<!-- YAML
added:
  - v15.12.0
  - v14.17.0
-->

-   Возвращает: {AbortSignal}

Возвращает новый, уже прерванный `AbortSignal`.

#### Событие: `'abort'`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

В `'abort'` событие генерируется, когда `abortController.abort()` вызывается метод. Обратный вызов вызывается с одним аргументом объекта с одним `type` свойство установлено на `'abort'`:

```js
const ac = new AbortController();

// Use either the onabort property...
ac.signal.onabort = () => console.log('aborted!');

// Or the EventTarget API...
ac.signal.addEventListener(
    'abort',
    (event) => {
        console.log(event.type); // Prints 'abort'
    },
    { once: true }
);

ac.abort();
```

В `AbortController` с которой `AbortSignal` связан, будет запускать только `'abort'` событие один раз. Мы рекомендуем, чтобы код проверял, что `abortSignal.aborted` атрибут `false` перед добавлением `'abort'` слушатель событий.

Любые прослушиватели событий, прикрепленные к `AbortSignal` следует использовать `{ once: true }` вариант (или, если используется `EventEmitter` API для присоединения слушателя, используйте `once()` метод), чтобы гарантировать, что прослушиватель событий будет удален, как только `'abort'` событие обработано. Несоблюдение этого правила может привести к утечке памяти.

#### `abortSignal.aborted`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Тип: {логическое} Истина после `AbortController` был прерван.

#### `abortSignal.onabort`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Тип: {Функция}

Необязательная функция обратного вызова, которая может быть установлена кодом пользователя, чтобы получать уведомление, когда `abortController.abort()` функция была вызвана.

## Класс: `Buffer`

<!-- YAML
added: v0.1.103
-->

<!-- type=global -->

-   {Функция}

Используется для обработки двоичных данных. Увидеть [буферная секция](buffer.md).

## `__dirname`

Эта переменная может показаться глобальной, но это не так. Видеть [`__dirname`](modules.md#__dirname).

## `__filename`

Эта переменная может показаться глобальной, но это не так. Видеть [`__filename`](modules.md#__filename).

## `atob(data)`

<!-- YAML
added: v16.0.0
-->

> Стабильность: 3 - Наследие. Использовать `Buffer.from(data, 'base64')` вместо.

Глобальный псевдоним для [`buffer.atob()`](buffer.md#bufferatobdata).

## `btoa(data)`

<!-- YAML
added: v16.0.0
-->

> Стабильность: 3 - Наследие. Использовать `buf.toString('base64')` вместо.

Глобальный псевдоним для [`buffer.btoa()`](buffer.md#bufferbtoadata).

## `clearImmediate(immediateObject)`

<!-- YAML
added: v0.9.1
-->

<!--type=global-->

[`clearImmediate`](timers.md#clearimmediateimmediate) описывается в [таймеры](timers.md) раздел.

## `clearInterval(intervalObject)`

<!-- YAML
added: v0.0.1
-->

<!--type=global-->

[`clearInterval`](timers.md#clearintervaltimeout) описывается в [таймеры](timers.md) раздел.

## `clearTimeout(timeoutObject)`

<!-- YAML
added: v0.0.1
-->

<!--type=global-->

[`clearTimeout`](timers.md#cleartimeouttimeout) описывается в [таймеры](timers.md) раздел.

## `console`

<!-- YAML
added: v0.1.100
-->

<!-- type=global -->

-   {Объект}

Используется для печати в stdout и stderr. Увидеть [`console`](console.md) раздел.

## `Event`

<!-- YAML
added: v15.0.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
-->

<!-- type=global -->

Совместимая с браузером реализация `Event` класс. Видеть [`EventTarget` а также `Event` API](events.md#eventtarget-and-event-api) Больше подробностей.

## `EventTarget`

<!-- YAML
added: v15.0.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
-->

<!-- type=global -->

Совместимая с браузером реализация `EventTarget` класс. Видеть [`EventTarget` а также `Event` API](events.md#eventtarget-and-event-api) Больше подробностей.

## `exports`

Эта переменная может показаться глобальной, но это не так. Видеть [`exports`](modules.md#exports).

## `global`

<!-- YAML
added: v0.1.27
-->

<!-- type=global -->

-   {Object} Объект глобального пространства имен.

В браузерах область верхнего уровня - это глобальная область. Это означает, что в браузере `var something` определит новую глобальную переменную. В Node.js все по-другому. Область верхнего уровня не является глобальной областью; `var something` внутри модуля Node.js будет локальным для этого модуля.

## `MessageChannel`

<!-- YAML
added: v15.0.0
-->

<!-- type=global -->

В `MessageChannel` класс. Видеть [`MessageChannel`](worker_threads.md#class-messagechannel) Больше подробностей.

## `MessageEvent`

<!-- YAML
added: v15.0.0
-->

<!-- type=global -->

В `MessageEvent` класс. Видеть [`MessageEvent`](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent/MessageEvent) Больше подробностей.

## `MessagePort`

<!-- YAML
added: v15.0.0
-->

<!-- type=global -->

В `MessagePort` класс. Видеть [`MessagePort`](worker_threads.md#class-messageport) Больше подробностей.

## `module`

Эта переменная может показаться глобальной, но это не так. Видеть [`module`](modules.md#module).

## `performance`

В [`perf_hooks.performance`](perf_hooks.md#perf_hooksperformance) объект.

## `process`

<!-- YAML
added: v0.1.7
-->

<!-- type=global -->

-   {Объект}

Объект процесса. Увидеть [`process` объект](process.md#process) раздел.

## `queueMicrotask(callback)`

<!-- YAML
added: v11.0.0
-->

<!-- type=global -->

-   `callback` {Функция} Функция для постановки в очередь.

В `queueMicrotask()` метод ставит в очередь микрозадачу для вызова `callback`. Если `callback` выдает исключение, [`process` объект](process.md#process) `'uncaughtException'` событие будет выпущено.

Очередью микрозадач управляет V8, и ее можно использовать аналогично [`process.nextTick()`](process.md#processnexttickcallback-args) очередь, которой управляет Node.js. В `process.nextTick()` очередь всегда обрабатывается перед очередью микрозадач на каждом этапе цикла обработки событий Node.js.

```js
// Here, `queueMicrotask()` is used to ensure the 'load' event is always
// emitted asynchronously, and therefore consistently. Using
// `process.nextTick()` here would result in the 'load' event always emitting
// before any other promise jobs.

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

## `require()`

Эта переменная может показаться глобальной, но это не так. Видеть [`require()`](modules.md#requireid).

## `setImmediate(callback[, ...args])`

<!-- YAML
added: v0.9.1
-->

<!-- type=global -->

[`setImmediate`](timers.md#setimmediatecallback-args) описывается в [таймеры](timers.md) раздел.

## `setInterval(callback, delay[, ...args])`

<!-- YAML
added: v0.0.1
-->

<!-- type=global -->

[`setInterval`](timers.md#setintervalcallback-delay-args) описывается в [таймеры](timers.md) раздел.

## `setTimeout(callback, delay[, ...args])`

<!-- YAML
added: v0.0.1
-->

<!-- type=global -->

[`setTimeout`](timers.md#settimeoutcallback-delay-args) описывается в [таймеры](timers.md) раздел.

## `DOMException`

<!-- YAML
added: REPLACEME
-->

<!-- type=global -->

WHATWG `DOMException` класс. Видеть [`DOMException`](https://developer.mozilla.org/en-US/docs/Web/API/DOMException) Больше подробностей.

## `TextDecoder`

<!-- YAML
added: v11.0.0
-->

<!-- type=global -->

WHATWG `TextDecoder` класс. Увидеть [`TextDecoder`](util.md#class-utiltextdecoder) раздел.

## `TextEncoder`

<!-- YAML
added: v11.0.0
-->

<!-- type=global -->

WHATWG `TextEncoder` класс. Увидеть [`TextEncoder`](util.md#class-utiltextencoder) раздел.

## `URL`

<!-- YAML
added: v10.0.0
-->

<!-- type=global -->

WHATWG `URL` класс. Увидеть [`URL`](url.md#class-url) раздел.

## `URLSearchParams`

<!-- YAML
added: v10.0.0
-->

<!-- type=global -->

WHATWG `URLSearchParams` класс. Увидеть [`URLSearchParams`](url.md#class-urlsearchparams) раздел.

## `WebAssembly`

<!-- YAML
added: v8.0.0
-->

<!-- type=global -->

-   {Объект}

Объект, который действует как пространство имен для всех W3C [WebAssembly](https://webassembly.org) связанные функции. Увидеть [Сеть разработчиков Mozilla](https://developer.mozilla.org/en-US/docs/WebAssembly) для использования и совместимости.
