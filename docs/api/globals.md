---
title: Глобальные объекты
description: Глобальные объекты и API, доступные во всех модулях Node.js
---

# Глобальные объекты

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/globals.html)

<!--introduced_in=v0.10.0-->

<!-- type=misc -->

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

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
-->

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

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
changes:
  - version:
      - v17.2.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/40807
    description: Added the new optional reason argument.
-->

-   `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательная причина; доступна в свойстве `reason` у `AbortSignal`.

Инициирует сигнал отмены: у `abortController.signal` генерируется событие `'abort'`.

### `abortController.signal`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Тип: [`<AbortSignal>`](globals.md#abortsignal)

## Класс: `AbortSignal`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Расширяет: [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget)

`AbortSignal` уведомляет подписчиков о вызове метода `abortController.abort()`.

### Статический метод: `AbortSignal.abort([reason])`

<!-- YAML
added:
  - v15.12.0
  - v14.17.0
changes:
  - version:
      - v17.2.0
      - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/40807
    description: Added the new optional reason argument.
-->

-   `reason` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   Возвращает: [`<AbortSignal>`](globals.md#abortsignal)

Возвращает новый уже прерванный `AbortSignal`.

### Статический метод: `AbortSignal.timeout(delay)`

<!-- YAML
added:
  - v17.3.0
  - v16.14.0
-->

-   `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах до срабатывания `AbortSignal`.

Возвращает новый `AbortSignal`, который будет прерван через `delay` миллисекунд.

### Статический метод: `AbortSignal.any(signals)`

<!-- YAML
added:
  - v20.3.0
  - v18.17.0
-->

-   `signals` [`<AbortSignal[]>`](globals.md#abortsignal) `AbortSignal`, из которых составляется новый `AbortSignal`.

Возвращает новый `AbortSignal`, который будет прерван, если прерван любой из переданных сигналов. Свойство [`abortSignal.reason`](globals.md#abortsignalreason) получит значение той причины, которая привела к прерыванию.

### Событие: `'abort'`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

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

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после того, как `AbortController` был прерван.

### `abortSignal.onabort`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Необязательный колбэк, который пользовательский код может задать для уведомления о вызове `abortController.abort()`.

### `abortSignal.reason`

<!-- YAML
added:
  - v17.2.0
  - v16.14.0
-->

-   Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Необязательная причина, указанная при срабатывании `AbortSignal`.

```js
const ac = new AbortController();
ac.abort(new Error('boom!'));
console.log(ac.signal.reason); // Error: boom!
```

### `abortSignal.throwIfAborted()`

<!-- YAML
added:
  - v17.3.0
  - v16.17.0
-->

Если `abortSignal.aborted` равно `true`, выбрасывает `abortSignal.reason`.

## `atob(data)`

<!-- YAML
added: v16.0.0
-->

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого `Buffer.from(data, 'base64')`.

Глобальный псевдоним для [`buffer.atob()`](buffer.md#bufferatobdata).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa)):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

## Класс: `Blob`

<!-- YAML
added: v18.0.0
-->

См. [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

## Класс: `BroadcastChannel`

<!-- YAML
added: v18.0.0
-->

См. [BroadcastChannel](worker_threads.md).

## `btoa(data)`

<!-- YAML
added: v16.0.0
-->

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого `buf.toString('base64')`.

Глобальный псевдоним для [`buffer.btoa()`](buffer.md#bufferbtoadata).

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa)):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

## Класс: `Buffer`

<!-- YAML
added: v0.1.103
-->

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Для работы с двоичными данными. См. раздел [buffer](buffer.md).

## Класс: `ByteLengthQueuingStrategy`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ByteLengthQueuingStrategy`](webstreams.md#class-bytelengthqueuingstrategy), совместимая с браузером.

## `clearImmediate(immediateObject)`

<!-- YAML
added: v0.9.1
-->

[`clearImmediate`](timers.md#clearimmediateimmediate) описан в разделе [таймеры](timers.md).

## `clearInterval(intervalObject)`

<!-- YAML
added: v0.0.1
-->

[`clearInterval`](timers.md#clearintervaltimeout) описан в разделе [таймеры](timers.md).

## `clearTimeout(timeoutObject)`

<!-- YAML
added: v0.0.1
-->

[`clearTimeout`](timers.md#cleartimeouttimeout) описан в разделе [таймеры](timers.md).

## Класс: `CloseEvent`

<!-- YAML
added: v23.0.0
-->

Реализация [CloseEvent](globals.md), совместимая с браузером. Отключите это API флагом CLI [`--no-experimental-websocket`](cli.md#--no-experimental-websocket).

## Класс: `CompressionStream`

<!-- YAML
added: v18.0.0
changes:
 - version:
   - v24.7.0
   - v22.20.0
   pr-url: https://github.com/nodejs/node/pull/59464
   description: format now accepts `brotli` value.
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`CompressionStream`](webstreams.md#class-compressionstream), совместимая с браузером.

## `console`

<!-- YAML
added: v0.1.100
-->

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Вывод в stdout и stderr. См. раздел [`console`](console.md).

## Класс: `CountQueuingStrategy`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`CountQueuingStrategy`](webstreams.md#class-countqueuingstrategy), совместимая с браузером.

## Класс: `Crypto`

<!-- YAML
added:
  - v17.6.0
  - v16.15.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/52564
    description: No longer experimental.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42083
    description: No longer behind `--experimental-global-webcrypto` CLI flag.
-->

Реализация [Crypto](crypto.md), совместимая с браузером. Глобал доступен только если бинарник Node.js собран с поддержкой модуля `node:crypto`.

## `crypto`

<!-- YAML
added:
  - v17.6.0
  - v16.15.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/52564
    description: No longer experimental.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42083
    description: No longer behind `--experimental-global-webcrypto` CLI flag.
-->

Реализация [Web Crypto API][web crypto api], совместимая с браузером.

## Класс: `CryptoKey`

<!-- YAML
added:
  - v17.6.0
  - v16.15.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/52564
    description: No longer experimental.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42083
    description: No longer behind `--experimental-global-webcrypto` CLI flag.
-->

Реализация [CryptoKey](webcrypto.md#class-cryptokey), совместимая с браузером. Глобал доступен только если бинарник Node.js собран с поддержкой модуля `node:crypto`.

## Класс: `CustomEvent`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/52723
    description: No longer experimental.
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52618
    description: CustomEvent is now stable.
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/44860
    description: No longer behind `--experimental-global-customevent` CLI flag.
-->

Реализация [CustomEvent](globals.md), совместимая с браузером.

## Класс: `DecompressionStream`

<!-- YAML
added: v18.0.0
changes:
  - version:
    - v24.7.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59464
    description: format now accepts `brotli` value.
  - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`DecompressionStream`](webstreams.md#class-decompressionstream), совместимая с браузером.

## Класс: `DOMException`

<!-- YAML
added: v17.0.0
-->

Класс WHATWG [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException).

## `ErrorEvent`

<!-- YAML
added: v25.0.0
-->

Реализация [ErrorEvent](globals.md), совместимая с браузером.

## Класс: `Event`

<!-- YAML
added: v15.0.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
-->

Добавлено в: v15.0.0

Реализация класса `Event`, совместимая с браузером. Подробнее — [API `EventTarget` и `Event`](events.md#eventtarget-and-event-api).

## Класс: `EventSource`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Включите это API флагом CLI [`--experimental-eventsource`](cli.md#--experimental-eventsource).

Реализация [EventSource](globals.md), совместимая с браузером.

## Класс: `EventTarget`

<!-- YAML
added: v15.0.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
-->

Добавлено в: v15.0.0

Реализация класса `EventTarget`, совместимая с браузером. Подробнее — [API `EventTarget` и `Event`](events.md#eventtarget-and-event-api).

## `exports`

Эта переменная может казаться глобальной, но таковой не является. См. [`exports`](modules.md#exports).

## `fetch`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
changes:
  - version:
    - v21.0.0
    pr-url: https://github.com/nodejs/node/pull/45684
    description: No longer experimental.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41811
    description: No longer behind `--experimental-fetch` CLI flag.
-->

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

<!-- YAML
added: v20.0.0
-->

См. [File](https://developer.mozilla.org/en-US/docs/Web/API/File).

## Класс: `FormData`

<!-- YAML
added:
  - v17.6.0
  - v16.15.0
changes:
  - version:
    - v21.0.0
    pr-url: https://github.com/nodejs/node/pull/45684
    description: No longer experimental.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41811
    description: No longer behind `--experimental-fetch` CLI flag.
-->

Реализация [FormData](#class-formdata), совместимая с браузером.

## `global`

<!-- YAML
added: v0.1.27
-->

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого [`globalThis`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis).

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект глобального пространства имён.

В браузерах традиционно верхний уровень — глобальная область: `var something` создаёт глобальную переменную (кроме модулей ECMAScript). В Node.js иначе: верхний уровень модуля не совпадает с глобальной областью; `var something` в модуле Node.js локально для этого модуля — и для [CommonJS][commonjs module], и для [ECMAScript][ecmascript module].

## Класс: `Headers`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
changes:
  - version:
    - v21.0.0
    pr-url: https://github.com/nodejs/node/pull/45684
    description: No longer experimental.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41811
    description: No longer behind `--experimental-fetch` CLI flag.
-->

Реализация [Headers](globals.md#class-headers), совместимая с браузером.

## `localStorage`

<!-- YAML
added: v22.4.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/60351
    description: Accessing the `localStorage` global without providing
                 `--localstorage-file` now throws a `DOMException`, for
                 compliance with the Web Storage specification.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57666
    description: When webstorage is enabled and `--localstorage-file` is not
                 provided, accessing the `localStorage` global now returns an
                 empty object.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57666
    description: This API is no longer behind `--experimental-webstorage` runtime flag.
-->

Добавлено в: v22.4.0

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`](cli.md#--no-experimental-webstorage).

Реализация [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), совместимая с браузером. Данные хранятся без шифрования в файле, заданном флагом CLI [`--localstorage-file`](cli.md#--localstorage-filefile). Максимальный объём — 10 МБ. Изменение данных вне Web Storage API не поддерживается. На сервере `localStorage` не разделён по пользователям или запросам: данные общие для всех.

## Класс: `MessageChannel`

<!-- YAML
added: v15.0.0
-->

Класс `MessageChannel`. Подробнее — [`MessageChannel`](worker_threads.md#class-messagechannel).

## Класс: `MessageEvent`

<!-- YAML
added: v15.0.0
-->

Реализация [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent/MessageEvent), совместимая с браузером.

## Класс: `MessagePort`

<!-- YAML
added: v15.0.0
-->

Класс `MessagePort`. Подробнее — [`MessagePort`](worker_threads.md#class-messageport).

## `module`

Эта переменная может казаться глобальной, но таковой не является. См. [`module`](modules.md#module).

## Класс: `Navigator`

<!-- YAML
added: v21.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Отключите это API флагом [`--no-experimental-global-navigator`](cli.md#--no-experimental-global-navigator).

Частичная реализация [Navigator API][navigator api].

## `navigator`

<!-- YAML
added: v21.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Отключите это API флагом [`--no-experimental-global-navigator`](cli.md#--no-experimental-global-navigator).

Частичная реализация [`window.navigator`](https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator).

### `navigator.hardwareConcurrency`

<!-- YAML
added: v21.0.0
-->

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `navigator.hardwareConcurrency` только для чтения: число логических процессоров, доступных текущему экземпляру Node.js.

```js
console.log(
    `This process is running on ${navigator.hardwareConcurrency} logical processors`
);
```

### `navigator.language`

<!-- YAML
added: v21.2.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.language` только для чтения: предпочитаемый язык экземпляра Node.js. Определяется библиотекой ICU по умолчанию языка ОС.

Формат — как в [RFC 5646][rfc 5646].

Без ICU значение по умолчанию — `'en-US'`.

```js
console.log(
    `The preferred language of the Node.js instance has the tag '${navigator.language}'`
);
```

### `navigator.languages`

<!-- YAML
added: v21.2.0
-->

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.languages` только для чтения: массив предпочитаемых языков. По умолчанию содержит только `navigator.language` (см. выше).

Без ICU — `['en-US']`.

```js
console.log(
    `The preferred languages are '${navigator.languages}'`
);
```

### `navigator.locks`

<!-- YAML
added: v24.5.0
-->

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

<!-- YAML
added: v21.2.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.platform` только для чтения: строка с идентификатором платформы.

```js
console.log(
    `This process is running on ${navigator.platform}`
);
```

### `navigator.userAgent`

<!-- YAML
added: v21.1.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.userAgent` только для чтения: user agent — имя среды и мажорная версия.

```js
console.log(`The user-agent is ${navigator.userAgent}`); // Выводит "Node.js/21"
```

## `performance`

<!-- YAML
added: v16.0.0
-->

Объект [`perf_hooks.performance`](perf_hooks.md#perf_hooksperformance).

## Класс: `PerformanceEntry`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceEntry`. См. [`PerformanceEntry`](perf_hooks.md#class-performanceentry).

## Класс: `PerformanceMark`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceMark`. См. [`PerformanceMark`](perf_hooks.md#class-performancemark).

## Класс: `PerformanceMeasure`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceMeasure`. См. [`PerformanceMeasure`](perf_hooks.md#class-performancemeasure).

## Класс: `PerformanceObserver`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceObserver`. См. [`PerformanceObserver`](perf_hooks.md#class-performanceobserver).

## Класс: `PerformanceObserverEntryList`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceObserverEntryList`. См. [`PerformanceObserverEntryList`](perf_hooks.md#class-performanceobserverentrylist).

## Класс: `PerformanceResourceTiming`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceResourceTiming`. См. [`PerformanceResourceTiming`](perf_hooks.md#class-performanceresourcetiming).

## `process`

<!-- YAML
added: v0.1.7
-->

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект process. См. раздел [объект `process`](process.md#process).

## `queueMicrotask(callback)`

<!-- YAML
added: v11.0.0
-->

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

<!-- YAML
added: REPLACEME
-->

Класс WHATWG [QuotaExceededError](globals.md). Наследует [DOMException](https://developer.mozilla.org/en-US/docs/Web/API/DOMException).

## Класс: `ReadableByteStreamController`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ReadableByteStreamController`](webstreams.md#class-readablebytestreamcontroller), совместимая с браузером.

## Класс: `ReadableStream`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ReadableStream`](webstreams.md#class-readablestream), совместимая с браузером.

## Класс: `ReadableStreamBYOBReader`

<!-- YAML
added: v18.0.0
changes:
- version:
  - v23.11.0
  - v22.15.0
  pr-url: https://github.com/nodejs/node/pull/57510
  description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ReadableStreamBYOBReader`](webstreams.md#class-readablestreambyobreader), совместимая с браузером.

## Класс: `ReadableStreamBYOBRequest`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ReadableStreamBYOBRequest`](webstreams.md#class-readablestreambyobrequest), совместимая с браузером.

## Класс: `ReadableStreamDefaultController`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ReadableStreamDefaultController`](webstreams.md#class-readablestreamdefaultcontroller), совместимая с браузером.

## Класс: `ReadableStreamDefaultReader`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`ReadableStreamDefaultReader`](webstreams.md#class-readablestreamdefaultreader), совместимая с браузером.

## Класс: `Request`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
changes:
  - version:
    - v21.0.0
    pr-url: https://github.com/nodejs/node/pull/45684
    description: No longer experimental.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41811
    description: No longer behind `--experimental-fetch` CLI flag.
-->

Реализация [Request](#class-request), совместимая с браузером.

## `require()`

Эта переменная может казаться глобальной, но таковой не является. См. [`require()`](modules.md#requireid).

## Класс: `Response`

<!-- YAML
added:
  - v17.5.0
  - v16.15.0
changes:
  - version:
    - v21.0.0
    pr-url: https://github.com/nodejs/node/pull/45684
    description: No longer experimental.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41811
    description: No longer behind `--experimental-fetch` CLI flag.
-->

Реализация [Response](#class-response), совместимая с браузером.

## `sessionStorage`

<!-- YAML
added: v22.4.0
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57666
    description: This API is no longer behind `--experimental-webstorage` runtime flag.
-->

Добавлено в: v22.4.0

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`](cli.md#--no-experimental-webstorage).

Реализация [`sessionStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), совместимая с браузером. Данные в памяти, квота 10 МБ. `sessionStorage` живёт только в текущем процессе и не разделяется между worker.

## `setImmediate(callback[, ...args])`

<!-- YAML
added: v0.9.1
-->

[`setImmediate`](timers.md#setimmediatecallback-args) описан в разделе [таймеры][timers].

## `setInterval(callback, delay[, ...args])`

<!-- YAML
added: v0.0.1
-->

[`setInterval`](timers.md#setintervalcallback-delay-args) описан в разделе [таймеры][timers].

## `setTimeout(callback, delay[, ...args])`

<!-- YAML
added: v0.0.1
-->

[`setTimeout`](timers.md#settimeoutcallback-delay-args) описан в разделе [таймеры][timers].

## Класс: `Storage`

<!-- YAML
added: v22.4.0
-->

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`](cli.md#--no-experimental-webstorage).

Реализация [Storage](globals.md), совместимая с браузером.

## `structuredClone(value[, options])`

<!-- YAML
added: v17.0.0
-->

Метод WHATWG [`structuredClone`](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone).

## Класс: `SubtleCrypto`

<!-- YAML
added:
  - v17.6.0
  - v16.15.0
changes:
  - version: v19.0.0
    pr-url: https://github.com/nodejs/node/pull/42083
    description: No longer behind `--experimental-global-webcrypto` CLI flag.
-->

Реализация [SubtleCrypto](webcrypto.md), совместимая с браузером. Глобал доступен только если бинарник Node.js собран с поддержкой модуля `node:crypto`.

## Класс: `TextDecoder`

<!-- YAML
added: v11.0.0
-->

Класс WHATWG `TextDecoder`. См. раздел [`TextDecoder`](util.md#class-utiltextdecoder).

## Класс: `TextDecoderStream`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`TextDecoderStream`](webstreams.md#class-textdecoderstream), совместимая с браузером.

## Класс: `TextEncoder`

<!-- YAML
added: v11.0.0
-->

Класс WHATWG `TextEncoder`. См. раздел [`TextEncoder`](util.md#class-utiltextencoder).

## Класс: `TextEncoderStream`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`TextEncoderStream`](webstreams.md#class-textencoderstream), совместимая с браузером.

## Класс: `TransformStream`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`TransformStream`](webstreams.md#class-transformstream), совместимая с браузером.

## Класс: `TransformStreamDefaultController`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`TransformStreamDefaultController`](webstreams.md#class-transformstreamdefaultcontroller), совместимая с браузером.

## Класс: `URL`

<!-- YAML
added: v10.0.0
-->

Класс WHATWG `URL`. См. раздел [`URL`](url.md#class-url).

## Класс: `URLPattern`

<!-- YAML
added: v24.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

Класс WHATWG `URLPattern`. См. раздел [`URLPattern`](url.md#class-urlpattern).

## Класс: `URLSearchParams`

<!-- YAML
added: v10.0.0
-->

Класс WHATWG `URLSearchParams`. См. раздел [`URLSearchParams`](url.md#class-urlsearchparams).

## Класс: `WebAssembly`

<!-- YAML
added: v8.0.0
-->

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Пространство имён для функциональности W3C [WebAssembly][webassembly-org]. Использование и совместимость — на [MDN][webassembly-mdn].

## Класс: `WebSocket`

<!-- YAML
added:
  - v21.0.0
  - v20.10.0
changes:
  - version: v22.4.0
    pr-url: https://github.com/nodejs/node/pull/53352
    description: No longer experimental.
  - version: v22.0.0
    pr-url: https://github.com/nodejs/node/pull/51594
    description: No longer behind `--experimental-websocket` CLI flag.
-->

Реализация [WebSocket](globals.md), совместимая с браузером. Отключите API флагом [`--no-experimental-websocket`](cli.md#--no-experimental-websocket).

## Класс: `WritableStream`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`WritableStream`](webstreams.md#class-writablestream), совместимая с браузером.

## Класс: `WritableStreamDefaultController`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`WritableStreamDefaultController`](webstreams.md#class-writablestreamdefaultcontroller), совместимая с браузером.

## Класс: `WritableStreamDefaultWriter`

<!-- YAML
added: v18.0.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

Добавлено в: v18.0.0

Реализация [`WritableStreamDefaultWriter`](webstreams.md#class-writablestreamdefaultwriter), совместимая с браузером.

[commonjs module]: modules.md
[commonjs modules]: modules.md
[ecmascript module]: esm.md
[navigator api]: https://html.spec.whatwg.org/multipage/system-state.html#the-navigator-object
[rfc 5646]: https://www.rfc-editor.org/rfc/rfc5646.txt
[web crypto api]: webcrypto.md
[`--experimental-eventsource`]: cli.md#--experimental-eventsource
[`--localstorage-file`]: cli.md#--localstorage-filefile
[`--no-experimental-global-navigator`]: cli.md#--no-experimental-global-navigator
[`--no-experimental-websocket`]: cli.md#--no-experimental-websocket
[`--no-experimental-webstorage`]: cli.md#--no-experimental-webstorage
[`bytelengthqueuingstrategy`]: webstreams.md#class-bytelengthqueuingstrategy
[`compressionstream`]: webstreams.md#class-compressionstream
[`countqueuingstrategy`]: webstreams.md#class-countqueuingstrategy
[`decompressionstream`]: webstreams.md#class-decompressionstream
[API `EventTarget` и `Event`]: events.md#eventtarget-and-event-api
[`formdata`]: #class-formdata
[`headers`]: #class-headers
[`lockmanager`]: worker_threads.md#class-lockmanager
[`messagechannel`]: worker_threads.md#class-messagechannel
[`messageport`]: worker_threads.md#class-messageport
[`performanceentry`]: perf_hooks.md#class-performanceentry
[`performancemark`]: perf_hooks.md#class-performancemark
[`performancemeasure`]: perf_hooks.md#class-performancemeasure
[`performanceobserverentrylist`]: perf_hooks.md#class-performanceobserverentrylist
[`performanceobserver`]: perf_hooks.md#class-performanceobserver
[`performanceresourcetiming`]: perf_hooks.md#class-performanceresourcetiming
[`readablebytestreamcontroller`]: webstreams.md#class-readablebytestreamcontroller
[`readablestreambyobreader`]: webstreams.md#class-readablestreambyobreader
[`readablestreambyobrequest`]: webstreams.md#class-readablestreambyobrequest
[`readablestreamdefaultcontroller`]: webstreams.md#class-readablestreamdefaultcontroller
[`readablestreamdefaultreader`]: webstreams.md#class-readablestreamdefaultreader
[`readablestream`]: webstreams.md#class-readablestream
[`request`]: #class-request
[`response`]: #class-response
[`textdecoderstream`]: webstreams.md#class-textdecoderstream
[`textdecoder`]: util.md#class-utiltextdecoder
[`textencoderstream`]: webstreams.md#class-textencoderstream
[`textencoder`]: util.md#class-utiltextencoder
[`transformstreamdefaultcontroller`]: webstreams.md#class-transformstreamdefaultcontroller
[`transformstream`]: webstreams.md#class-transformstream
[`urlpattern`]: url.md#class-urlpattern
[`urlsearchparams`]: url.md#class-urlsearchparams
[`url`]: url.md#class-url
[`writablestreamdefaultcontroller`]: webstreams.md#class-writablestreamdefaultcontroller
[`writablestreamdefaultwriter`]: webstreams.md#class-writablestreamdefaultwriter
[`writablestream`]: webstreams.md#class-writablestream
[`__dirname`]: modules.md#__dirname
[`__filename`]: modules.md#__filename
[`abortsignal.reason`]: #abortsignalreason
[`buffer.atob()`]: buffer.md#bufferatobdata
[`buffer.btoa()`]: buffer.md#bufferbtoadata
[`clearimmediate`]: timers.md#clearimmediateimmediate
[`clearinterval`]: timers.md#clearintervaltimeout
[`cleartimeout`]: timers.md#cleartimeouttimeout
[`console`]: console.md
[`exports`]: modules.md#exports
[`fetch()`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
[`globalthis`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
[`localstorage`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[`module`]: modules.md#module
[`perf_hooks.performance`]: perf_hooks.md#perf_hooksperformance
[`process.nexttick()`]: process.md#processnexttickcallback-args
[`process` object]: process.md#process
[`require()`]: modules.md#requireid
[`sessionstorage`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[`setimmediate`]: timers.md#setimmediatecallback-args
[`setinterval`]: timers.md#setintervalcallback-delay-args
[`settimeout`]: timers.md#settimeoutcallback-delay-args
[`structuredclone`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
[`window.navigator`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
[`worker_threads.locks`]: worker_threads.md#worker_threadslocks
[browser `lockmanager`]: https://developer.mozilla.org/en-US/docs/Web/API/LockManager
[buffer section]: buffer.md
[built-in objects]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
[timers]: timers.md
[webassembly-mdn]: https://developer.mozilla.org/en-US/docs/WebAssembly
[webassembly-org]: https://webassembly.org
