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

Следующие переменные могут казаться глобальными, но таковыми не являются. Они существуют только в
области видимости [модулей CommonJS][CommonJS modules]:

* [`__dirname`][]
* [`__filename`][]
* [`exports`][]
* [`module`][]
* [`require()`][]

Перечисленные ниже объекты относятся к Node.js. Есть и [встроенные объекты][built-in objects],
входящие в сам язык JavaScript; они тоже доступны глобально.

## `__dirname`

Эта переменная может казаться глобальной, но таковой не является. См. [`__dirname`][].

## `__filename`

Эта переменная может казаться глобальной, но таковой не является. См. [`__filename`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v15.4.0 | Больше не экспериментально. |

Вспомогательный класс для сигнализации об отмене в выбранных API на основе `Promise`.
API основан на веб-API [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

```js
const ac = new AbortController();

ac.signal.addEventListener('abort', () => console.log('Aborted!'),
                           { once: true });

ac.abort();

console.log(ac.signal.aborted);  // Выводит true
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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v17.2.0, v16.14.0 | Добавлен новый необязательный аргумент причины. |

* `reason` {any} Необязательная причина; доступна в свойстве `reason` у `AbortSignal`.

Инициирует сигнал отмены: у `abortController.signal` генерируется
событие `'abort'`.

### `abortController.signal`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

* Тип: [<AbortSignal>](globals.md#abortsignal)

## Класс: `AbortSignal`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

* Расширяет: [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget)

`AbortSignal` уведомляет подписчиков о вызове метода
`abortController.abort()`.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v17.2.0, v16.14.0 | Добавлен новый необязательный аргумент причины. |

* `reason` {any}
* Возвращает: [<AbortSignal>](globals.md#abortsignal)

Возвращает новый уже прерванный `AbortSignal`.

### Статический метод: `AbortSignal.timeout(delay)`

<!-- YAML
added:
  - v17.3.0
  - v16.14.0
-->

* `delay` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах до срабатывания
  `AbortSignal`.

Возвращает новый `AbortSignal`, который будет прерван через `delay` миллисекунд.

### Статический метод: `AbortSignal.any(signals)`

<!-- YAML
added:
  - v20.3.0
  - v18.17.0
-->

* `signals` [<AbortSignal[]>](globals.md#abortsignal) `AbortSignal`, из которых составляется новый `AbortSignal`.

Возвращает новый `AbortSignal`, который будет прерван, если прерван любой из переданных
сигналов. Свойство [`abortSignal.reason`][] получит значение той причины,
которая привела к прерыванию.

### Событие: `'abort'`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

Событие `'abort'` генерируется при вызове `abortController.abort()`.
Колбэк получает один объект-аргумент с единственным свойством `type`, равным `'abort'`:

```js
const ac = new AbortController();

// Через свойство onabort...
ac.signal.onabort = () => console.log('aborted!');

// Или через API EventTarget...
ac.signal.addEventListener('abort', (event) => {
  console.log(event.type);  // Выводит 'abort'
}, { once: true });

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

* Тип: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true` после того, как `AbortController` был прерван.

### `abortSignal.onabort`

<!-- YAML
added:
  - v15.0.0
  - v14.17.0
-->

* Тип: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Необязательный колбэк, который пользовательский код может задать для уведомления
о вызове `abortController.abort()`.

### `abortSignal.reason`

<!-- YAML
added:
  - v17.2.0
  - v16.14.0
-->

* Тип: {any}

Необязательная причина, указанная при срабатывании `AbortSignal`.

```js
const ac = new AbortController();
ac.abort(new Error('boom!'));
console.log(ac.signal.reason);  // Error: boom!
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

Глобальный псевдоним для [`buffer.atob()`][].

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

Глобальный псевдоним для [`buffer.btoa()`][].

Доступна автоматическая миграция ([исходники](https://github.com/nodejs/userland-migrations/tree/main/recipes/buffer-atob-btoa)):

```bash
npx codemod@latest @nodejs/buffer-atob-btoa
```

## Класс: `Buffer`

<!-- YAML
added: v0.1.103
-->

* Тип: [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Для работы с двоичными данными. См. раздел [buffer][buffer section].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ByteLengthQueuingStrategy`][], совместимая с браузером.

## `clearImmediate(immediateObject)`

<!-- YAML
added: v0.9.1
-->

[`clearImmediate`][] описан в разделе [таймеры][timers].

## `clearInterval(intervalObject)`

<!-- YAML
added: v0.0.1
-->

[`clearInterval`][] описан в разделе [таймеры][timers].

## `clearTimeout(timeoutObject)`

<!-- YAML
added: v0.0.1
-->

[`clearTimeout`][] описан в разделе [таймеры][timers].

## Класс: `CloseEvent`

<!-- YAML
added: v23.0.0
-->

Реализация [CloseEvent](globals.md), совместимая с браузером. Отключите это API
флагом CLI [`--no-experimental-websocket`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v24.7.0, v22.20.0 | формат теперь принимает значение `brotli`. |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`CompressionStream`][], совместимая с браузером.

## `console`

<!-- YAML
added: v0.1.100
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Вывод в stdout и stderr. См. раздел [`console`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`CountQueuingStrategy`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Больше не экспериментально. |
    | v19.0.0 | Флаг CLI `--experimental-global-webcrypto` больше не используется. |

Реализация [Crypto](crypto.md), совместимая с браузером. Глобал доступен
только если бинарник Node.js собран с поддержкой модуля
`node:crypto`.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Больше не экспериментально. |
    | v19.0.0 | Флаг CLI `--experimental-global-webcrypto` больше не используется. |

Реализация [Web Crypto API][Web Crypto API], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Больше не экспериментально. |
    | v19.0.0 | Флаг CLI `--experimental-global-webcrypto` больше не используется. |

Реализация [CryptoKey](webcrypto.md#class-cryptokey), совместимая с браузером. Глобал доступен
только если бинарник Node.js собран с поддержкой модуля
`node:crypto`.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Больше не экспериментально. |
    | v22.1.0, v20.13.0 | CustomEvent теперь стабилен. |
    | v19.0.0 | Флаг CLI `--experimental-global-customevent` больше не используется. |

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v24.7.0, v22.20.0 | формат теперь принимает значение `brotli`. |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`DecompressionStream`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v15.4.0 | Больше не экспериментально. |

Реализация класса `Event`, совместимая с браузером. Подробнее —
[`EventTarget` and `Event` API][].

## Класс: `EventSource`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Включите это API флагом CLI [`--experimental-eventsource`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v15.4.0 | Больше не экспериментально. |

Реализация класса `EventTarget`, совместимая с браузером. Подробнее —
[`EventTarget` and `Event` API][].

## `exports`

Эта переменная может казаться глобальной, но таковой не является. См. [`exports`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Больше не экспериментально. |
    | v18.0.0 | Больше нет флага CLI `--experimental-fetch`. |

Реализация функции [`fetch()`][], совместимая с браузером.

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

Можно передать свой dispatcher в опциях `fetch`. Он должен быть совместим с
[`Dispatcher` из undici](https://undici.nodejs.org/#/docs/api/Dispatcher.md).

```js
fetch(url, { dispatcher: new MyAgent() });
```

Глобальный dispatcher в Node.js можно сменить, установив `undici` и вызвав
`setGlobalDispatcher()`. Это затронет и `undici`, и Node.js.

=== "MJS"

    ```js
    import { setGlobalDispatcher } from 'undici';
    setGlobalDispatcher(new MyAgent());
    ```

### Связанные классы

С `fetch` можно использовать глобалы:

* [`FormData`][]
* [`Headers`][]
* [`Request`][]
* [`Response`][]

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Больше не экспериментально. |
    | v18.0.0 | Больше нет флага CLI `--experimental-fetch`. |

Реализация [FormData](#class-formdata), совместимая с браузером.

## `global`

<!-- YAML
added: v0.1.27
-->

!!!note "Стабильность: 3 – Закрыто"

    Используйте вместо этого [`globalThis`][].

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект глобального пространства имён.

В браузерах традиционно верхний уровень — глобальная область: `var something` создаёт глобальную переменную (кроме модулей ECMAScript). В Node.js иначе: верхний уровень модуля не совпадает с глобальной областью; `var something` в модуле Node.js локально для этого модуля — и для [CommonJS][CommonJS module], и для [ECMAScript][ECMAScript module].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Больше не экспериментально. |
    | v18.0.0 | Больше нет флага CLI `--experimental-fetch`. |

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Доступ к глобальному объекту localStorage без указания --localstorage-file теперь вызывает исключение DOMException для соответствия спецификации веб-хранилища. |
    | v25.0.0 | Если веб-хранилище включено и `--localstorage-file` не указан, доступ к глобальному объекту `localStorage` теперь возвращает пустой объект. |
    | v25.0.0 | Этот API больше не находится за флагом времени выполнения `--experimental-webstorage`. |

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`][].

Реализация [`localStorage`][], совместимая с браузером. Данные хранятся
без шифрования в файле, заданном флагом CLI [`--localstorage-file`][].
Максимальный объём — 10 МБ.
Изменение данных вне Web Storage API не поддерживается.
На сервере `localStorage` не разделён по пользователям или запросам: данные общие для всех.

## Класс: `MessageChannel`

<!-- YAML
added: v15.0.0
-->

Класс `MessageChannel`. Подробнее — [`MessageChannel`][].

## Класс: `MessageEvent`

<!-- YAML
added: v15.0.0
-->

Реализация [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent/MessageEvent), совместимая с браузером.

## Класс: `MessagePort`

<!-- YAML
added: v15.0.0
-->

Класс `MessagePort`. Подробнее — [`MessagePort`][].

## `module`

Эта переменная может казаться глобальной, но таковой не является. См. [`module`][].

## Класс: `Navigator`

<!-- YAML
added: v21.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Отключите это API флагом [`--no-experimental-global-navigator`][].

Частичная реализация [Navigator API][Navigator API].

## `navigator`

<!-- YAML
added: v21.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Отключите это API флагом [`--no-experimental-global-navigator`][].

Частичная реализация [`window.navigator`][].

### `navigator.hardwareConcurrency`

<!-- YAML
added: v21.0.0
-->

* Тип: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `navigator.hardwareConcurrency` только для чтения: число
логических процессоров, доступных текущему экземпляру Node.js.

```js
console.log(`This process is running on ${navigator.hardwareConcurrency} logical processors`);
```

### `navigator.language`

<!-- YAML
added: v21.2.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.language` только для чтения: предпочитаемый язык экземпляра Node.js. Определяется библиотекой ICU по умолчанию языка ОС.

Формат — как в [RFC 5646][].

Без ICU значение по умолчанию — `'en-US'`.

```js
console.log(`The preferred language of the Node.js instance has the tag '${navigator.language}'`);
```

### `navigator.languages`

<!-- YAML
added: v21.2.0
-->

* Тип: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.languages` только для чтения: массив предпочитаемых языков.
По умолчанию содержит только `navigator.language` (см. выше).

Без ICU — `['en-US']`.

```js
console.log(`The preferred languages are '${navigator.languages}'`);
```

### `navigator.locks`

<!-- YAML
added: v24.5.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

Свойство `navigator.locks` только для чтения: экземпляр [`LockManager`][] для координации доступа к ресурсам между потоками одного процесса. Семантика соответствует [браузерному API `LockManager`][browser `LockManager`].

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

Подробная документация — [`worker_threads.locks`][].

### `navigator.platform`

<!-- YAML
added: v21.2.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.platform` только для чтения: строка с идентификатором платформы.

```js
console.log(`This process is running on ${navigator.platform}`);
```

### `navigator.userAgent`

<!-- YAML
added: v21.1.0
-->

* Тип: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `navigator.userAgent` только для чтения: user agent — имя среды и мажорная версия.

```js
console.log(`The user-agent is ${navigator.userAgent}`); // Выводит "Node.js/21"
```

## `performance`

<!-- YAML
added: v16.0.0
-->

Объект [`perf_hooks.performance`][].

## Класс: `PerformanceEntry`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceEntry`. См. [`PerformanceEntry`][].

## Класс: `PerformanceMark`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceMark`. См. [`PerformanceMark`][].

## Класс: `PerformanceMeasure`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceMeasure`. См. [`PerformanceMeasure`][].

## Класс: `PerformanceObserver`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceObserver`. См. [`PerformanceObserver`][].

## Класс: `PerformanceObserverEntryList`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceObserverEntryList`. См.
[`PerformanceObserverEntryList`][].

## Класс: `PerformanceResourceTiming`

<!-- YAML
added: v19.0.0
-->

Класс `PerformanceResourceTiming`. См. [`PerformanceResourceTiming`][].

## `process`

<!-- YAML
added: v0.1.7
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Объект process. См. раздел [объект `process`][`process` object].

## `queueMicrotask(callback)`

<!-- YAML
added: v11.0.0
-->

* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция для постановки в очередь.

`queueMicrotask()` ставит микрозадачу на вызов `callback`. Если
`callback` выбрасывает исключение, генерируется событие [`process` object][] `'uncaughtException'`.

Очередь микрозадач управляется V8; её можно сравнить с очередью [`process.nextTick()`][], которую управляет Node.js. Очередь `process.nextTick()` всегда обрабатывается раньше очереди микрозадач в каждом цикле событий.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ReadableByteStreamController`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ReadableStream`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ReadableStreamBYOBReader`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ReadableStreamBYOBRequest`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ReadableStreamDefaultController`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`ReadableStreamDefaultReader`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Больше не экспериментально. |
    | v18.0.0 | Больше нет флага CLI `--experimental-fetch`. |

Реализация [Request](#class-request), совместимая с браузером.

## `require()`

Эта переменная может казаться глобальной, но таковой не является. См. [`require()`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.0.0 | Больше не экспериментально. |
    | v18.0.0 | Больше нет флага CLI `--experimental-fetch`. |

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Этот API больше не находится за флагом времени выполнения `--experimental-webstorage`. |

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`][].

Реализация [`sessionStorage`][], совместимая с браузером. Данные в памяти, квота 10 МБ. `sessionStorage` живёт только в текущем процессе и не разделяется между worker.

## `setImmediate(callback[, ...args])`

<!-- YAML
added: v0.9.1
-->

[`setImmediate`][] описан в разделе [таймеры][timers].

## `setInterval(callback, delay[, ...args])`

<!-- YAML
added: v0.0.1
-->

[`setInterval`][] описан в разделе [таймеры][timers].

## `setTimeout(callback, delay[, ...args])`

<!-- YAML
added: v0.0.1
-->

[`setTimeout`][] описан в разделе [таймеры][timers].

## Класс: `Storage`

<!-- YAML
added: v22.4.0
-->

!!!warning "Кандидат в релиз"

    Отключите это API флагом [`--no-experimental-webstorage`][].

Реализация [Storage](globals.md), совместимая с браузером.

## `structuredClone(value[, options])`

<!-- YAML
added: v17.0.0
-->

Метод WHATWG [`structuredClone`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v19.0.0 | Флаг CLI `--experimental-global-webcrypto` больше не используется. |

Реализация [SubtleCrypto](webcrypto.md), совместимая с браузером. Глобал доступен
только если бинарник Node.js собран с поддержкой модуля
`node:crypto`.

## Класс: `TextDecoder`

<!-- YAML
added: v11.0.0
-->

Класс WHATWG `TextDecoder`. См. раздел [`TextDecoder`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`TextDecoderStream`][], совместимая с браузером.

## Класс: `TextEncoder`

<!-- YAML
added: v11.0.0
-->

Класс WHATWG `TextEncoder`. См. раздел [`TextEncoder`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`TextEncoderStream`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`TransformStream`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`TransformStreamDefaultController`][], совместимая с браузером.

## Класс: `URL`

<!-- YAML
added: v10.0.0
-->

Класс WHATWG `URL`. См. раздел [`URL`][].

## Класс: `URLPattern`

<!-- YAML
added: v24.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

Класс WHATWG `URLPattern`. См. раздел [`URLPattern`][].

## Класс: `URLSearchParams`

<!-- YAML
added: v10.0.0
-->

Класс WHATWG `URLSearchParams`. См. раздел [`URLSearchParams`][].

## Класс: `WebAssembly`

<!-- YAML
added: v8.0.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Пространство имён для функциональности W3C
[WebAssembly][webassembly-org]. Использование и совместимость — на
[MDN][webassembly-mdn].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v22.4.0 | Больше не экспериментально. |
    | v22.0.0 | Больше нет флага CLI `--experimental-websocket`. |

Реализация [WebSocket](globals.md), совместимая с браузером. Отключите API
флагом [`--no-experimental-websocket`][].

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`WritableStream`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`WritableStreamDefaultController`][], совместимая с браузером.

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

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

Реализация [`WritableStreamDefaultWriter`][], совместимая с браузером.

[CommonJS module]: modules.md
[CommonJS modules]: modules.md
[ECMAScript module]: esm.md
[Navigator API]: https://html.spec.whatwg.org/multipage/system-state.html#the-navigator-object
[RFC 5646]: https://www.rfc-editor.org/rfc/rfc5646.txt
[Web Crypto API]: webcrypto.md
[`--experimental-eventsource`]: cli.md#--experimental-eventsource
[`--localstorage-file`]: cli.md#--localstorage-filefile
[`--no-experimental-global-navigator`]: cli.md#--no-experimental-global-navigator
[`--no-experimental-websocket`]: cli.md#--no-experimental-websocket
[`--no-experimental-webstorage`]: cli.md#--no-experimental-webstorage
[`ByteLengthQueuingStrategy`]: webstreams.md#class-bytelengthqueuingstrategy
[`CompressionStream`]: webstreams.md#class-compressionstream
[`CountQueuingStrategy`]: webstreams.md#class-countqueuingstrategy
[`DecompressionStream`]: webstreams.md#class-decompressionstream
[`EventTarget` and `Event` API]: events.md#eventtarget-and-event-api
[`FormData`]: #class-formdata
[`Headers`]: #class-headers
[`LockManager`]: worker_threads.md#class-lockmanager
[`MessageChannel`]: worker_threads.md#class-messagechannel
[`MessagePort`]: worker_threads.md#class-messageport
[`PerformanceEntry`]: perf_hooks.md#class-performanceentry
[`PerformanceMark`]: perf_hooks.md#class-performancemark
[`PerformanceMeasure`]: perf_hooks.md#class-performancemeasure
[`PerformanceObserverEntryList`]: perf_hooks.md#class-performanceobserverentrylist
[`PerformanceObserver`]: perf_hooks.md#class-performanceobserver
[`PerformanceResourceTiming`]: perf_hooks.md#class-performanceresourcetiming
[`ReadableByteStreamController`]: webstreams.md#class-readablebytestreamcontroller
[`ReadableStreamBYOBReader`]: webstreams.md#class-readablestreambyobreader
[`ReadableStreamBYOBRequest`]: webstreams.md#class-readablestreambyobrequest
[`ReadableStreamDefaultController`]: webstreams.md#class-readablestreamdefaultcontroller
[`ReadableStreamDefaultReader`]: webstreams.md#class-readablestreamdefaultreader
[`ReadableStream`]: webstreams.md#class-readablestream
[`Request`]: #class-request
[`Response`]: #class-response
[`TextDecoderStream`]: webstreams.md#class-textdecoderstream
[`TextDecoder`]: util.md#class-utiltextdecoder
[`TextEncoderStream`]: webstreams.md#class-textencoderstream
[`TextEncoder`]: util.md#class-utiltextencoder
[`TransformStreamDefaultController`]: webstreams.md#class-transformstreamdefaultcontroller
[`TransformStream`]: webstreams.md#class-transformstream
[`URLPattern`]: url.md#class-urlpattern
[`URLSearchParams`]: url.md#class-urlsearchparams
[`URL`]: url.md#class-url
[`WritableStreamDefaultController`]: webstreams.md#class-writablestreamdefaultcontroller
[`WritableStreamDefaultWriter`]: webstreams.md#class-writablestreamdefaultwriter
[`WritableStream`]: webstreams.md#class-writablestream
[`__dirname`]: modules.md#__dirname
[`__filename`]: modules.md#__filename
[`abortSignal.reason`]: #abortsignalreason
[`buffer.atob()`]: buffer.md#bufferatobdata
[`buffer.btoa()`]: buffer.md#bufferbtoadata
[`clearImmediate`]: timers.md#clearimmediateimmediate
[`clearInterval`]: timers.md#clearintervaltimeout
[`clearTimeout`]: timers.md#cleartimeouttimeout
[`console`]: console.md
[`exports`]: modules.md#exports
[`fetch()`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch
[`globalThis`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis
[`localStorage`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[`module`]: modules.md#module
[`perf_hooks.performance`]: perf_hooks.md#perf_hooksperformance
[`process.nextTick()`]: process.md#processnexttickcallback-args
[`process` object]: process.md#process
[`require()`]: modules.md#requireid
[`sessionStorage`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[`setImmediate`]: timers.md#setimmediatecallback-args
[`setInterval`]: timers.md#setintervalcallback-delay-args
[`setTimeout`]: timers.md#settimeoutcallback-delay-args
[`structuredClone`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone
[`window.navigator`]: https://developer.mozilla.org/en-US/docs/Web/API/Window/navigator
[`worker_threads.locks`]: worker_threads.md#worker_threadslocks
[browser `LockManager`]: https://developer.mozilla.org/en-US/docs/Web/API/LockManager
[buffer section]: buffer.md
[built-in objects]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
[timers]: timers.md
[webassembly-mdn]: https://developer.mozilla.org/en-US/docs/WebAssembly
[webassembly-org]: https://webassembly.org
