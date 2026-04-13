---
title: Таймеры
description: Глобальный API для отложенного вызова функций; реализация опирается на цикл событий Node.js
---

# Таймеры

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/timers.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/timers.js -->

Модуль таймеров предоставляет глобальный API для планирования вызова функций в будущем. Поскольку функции таймеров являются глобальными, для использования API не нужно вызывать `require('node:timers')`.

Функции таймеров в Node.js реализуют API, похожий на API таймеров в веб-браузерах, но с другой внутренней реализацией, построенной вокруг [цикла событий][Event Loop] Node.js.

## Класс: `Immediate`

Этот объект создаётся внутри и возвращается из [`setImmediate()`][`setImmediate()`]. Его можно передать в [`clearImmediate()`][`clearImmediate()`], чтобы отменить запланированные действия.

По умолчанию, когда планируется immediate, цикл событий Node.js продолжает работу, пока immediate активен. Объект `Immediate`, возвращаемый [`setImmediate()`][`setImmediate()`], предоставляет функции `immediate.ref()` и `immediate.unref()`, которыми можно управлять этим поведением по умолчанию.

### `immediate.hasRef()`

<!-- YAML
added: v11.0.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, объект `Immediate` удерживает цикл событий Node.js активным.

### `immediate.ref()`

<!-- YAML
added: v9.7.0
-->

* Возвращает: [`<Immediate>`](timers.md) ссылку на `immediate`

При вызове запрашивается, чтобы цикл событий Node.js _не_ завершался, пока активен `Immediate`. Повторные вызовы `immediate.ref()` не дают дополнительного эффекта.

По умолчанию все объекты `Immediate` «с ref», поэтому обычно не нужно вызывать `immediate.ref()`, если ранее не вызывали `immediate.unref()`.

### `immediate.unref()`

<!-- YAML
added: v9.7.0
-->

* Возвращает: [`<Immediate>`](timers.md) ссылку на `immediate`

При вызове активный объект `Immediate` не требует, чтобы цикл событий Node.js оставался активным. Если ничто другое не удерживает цикл событий, процесс может завершиться до вызова обратного вызова `Immediate`. Повторные вызовы `immediate.unref()` не дают дополнительного эффекта.

### `immediate[Symbol.dispose]()`

<!-- YAML
added:
 - v20.5.0
 - v18.18.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Отменяет immediate. Аналогично вызову `clearImmediate()`.

## Класс: `Timeout`

Этот объект создаётся внутри и возвращается из [`setTimeout()`][`setTimeout()`] и
[`setInterval()`][`setInterval()`]. Его можно передать в [`clearTimeout()`][`clearTimeout()`] или
[`clearInterval()`][`clearInterval()`], чтобы отменить запланированные действия.

По умолчанию, когда таймер планируется через [`setTimeout()`][`setTimeout()`] или
[`setInterval()`][`setInterval()`], цикл событий Node.js продолжает работу, пока таймер активен. Каждый возвращаемый этими функциями объект `Timeout` предоставляет `timeout.ref()` и `timeout.unref()` для управления этим поведением.

### `timeout.close()`

<!-- YAML
added: v0.9.1
-->

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Используйте [`clearTimeout()`][`clearTimeout()`] вместо этого.

* Возвращает: [`<Timeout>`](timers.md) ссылку на `timeout`

Отменяет таймаут.

### `timeout.hasRef()`

<!-- YAML
added: v11.0.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, объект `Timeout` удерживает цикл событий Node.js активным.

### `timeout.ref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<Timeout>`](timers.md) ссылку на `timeout`

При вызове запрашивается, чтобы цикл событий Node.js _не_ завершался, пока активен `Timeout`. Повторные вызовы `timeout.ref()` не дают дополнительного эффекта.

По умолчанию все объекты `Timeout` «с ref», поэтому обычно не нужно вызывать `timeout.ref()`, если ранее не вызывали `timeout.unref()`.

### `timeout.refresh()`

<!-- YAML
added: v10.2.0
-->

* Возвращает: [`<Timeout>`](timers.md) ссылку на `timeout`

Устанавливает время старта таймера на текущее и перепланирует вызов обратного вызова через ранее заданную длительность, скорректированную относительно текущего времени. Полезно для обновления таймера без выделения нового объекта JavaScript.

Если вызвать для таймера, который уже отработал обратный вызов, таймер снова активируется.

### `timeout.unref()`

<!-- YAML
added: v0.9.1
-->

* Возвращает: [`<Timeout>`](timers.md) ссылку на `timeout`

При вызове активный объект `Timeout` не требует, чтобы цикл событий Node.js оставался активным. Если ничто другое не удерживает цикл событий, процесс может завершиться до вызова обратного вызова `Timeout`. Повторные вызовы `timeout.unref()` не дают дополнительного эффекта.

### `timeout[Symbol.toPrimitive]()`

<!-- YAML
added:
  - v14.9.0
  - v12.19.0
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) число, по которому можно ссылаться на этот `timeout`

Приводит `Timeout` к примитиву. Примитив можно использовать для
очистки `Timeout`. Примитив можно использовать только в
том же потоке, где создан таймер. Поэтому для использования в
[`worker_threads`][`worker_threads`] его нужно сначала передать в нужный
поток. Это улучшает совместимость с браузерными реализациями
`setTimeout()` и `setInterval()`.

### `timeout[Symbol.dispose]()`

<!-- YAML
added:
 - v20.5.0
 - v18.18.0
changes:
 - version: v24.2.0
   pr-url: https://github.com/nodejs/node/pull/58467
   description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.2.0 | Больше не экспериментально. |

Отменяет таймаут.

## Планирование таймеров

Таймер в Node.js — внутренняя сущность, вызывающая заданную функцию через некоторое время. Когда именно вызывается функция таймера, зависит от способа создания таймера и от другой работы цикла событий Node.js.

### `setImmediate(callback[, ...args])`

<!-- YAML
added: v0.9.1
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.9.1

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, вызываемая в конце текущего витка [цикла событий][Event Loop] Node.js
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательные аргументы для вызова `callback`.
* Возвращает: [`<Immediate>`](timers.md) для использования с [`clearImmediate()`][`clearImmediate()`]

Планирует «немедленный» вызов `callback` после обратных вызовов событий ввода-вывода.

При нескольких вызовах `setImmediate()` функции `callback` ставятся в очередь в порядке создания. Вся очередь обрабатывается на каждой итерации цикла событий. Если immediate ставится в очередь из выполняющегося обратного вызова, он сработает только на следующей итерации цикла событий.

Если `callback` не является функцией, будет выброшен [`TypeError`][`TypeError`].

Для промисов есть отдельный вариант: [`timersPromises.setImmediate()`][`timersPromises.setImmediate()`].

### `setInterval(callback[, delay[, ...args]])`

<!-- YAML
added: v0.0.1
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.0.1

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, вызываемая при срабатывании таймера.
* `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах перед вызовом
  `callback`. **По умолчанию:** `1`.
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательные аргументы для вызова `callback`.
* Возвращает: [`<Timeout>`](timers.md) для использования с [`clearInterval()`][`clearInterval()`]

Планирует периодический вызов `callback` каждые `delay` миллисекунд.

Если `delay` больше `2147483647`, меньше `1` или `NaN`, `delay`
устанавливается в `1`. Нецелые задержки усекаются до целого.

Если `callback` не является функцией, будет выброшен [`TypeError`][`TypeError`].

Для промисов есть отдельный вариант: [`timersPromises.setInterval()`][`timersPromises.setInterval()`].

### `setTimeout(callback[, delay[, ...args]])`

<!-- YAML
added: v0.0.1
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v0.0.1

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, вызываемая при срабатывании таймера.
* `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах перед вызовом
  `callback`. **По умолчанию:** `1`.
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательные аргументы для вызова `callback`.
* Возвращает: [`<Timeout>`](timers.md) для использования с [`clearTimeout()`][`clearTimeout()`]

Планирует однократный вызов `callback` через `delay` миллисекунд.

`callback` вряд ли будет вызван ровно через `delay` миллисекунд.
Node.js не гарантирует точное время и порядок срабатывания обратных вызовов. Вызов будет максимально близок к указанному времени.

Если `delay` больше `2147483647`, меньше `1` или `NaN`, `delay`
устанавливается в `1`. Нецелые задержки усекаются до целого.

Если `callback` не является функцией, будет выброшен [`TypeError`][`TypeError`].

Для промисов есть отдельный вариант: [`timersPromises.setTimeout()`][`timersPromises.setTimeout()`].

## Отмена таймеров

Методы [`setImmediate()`][`setImmediate()`], [`setInterval()`][`setInterval()`] и [`setTimeout()`][`setTimeout()`]
возвращают объекты, представляющие запланированные таймеры. Их можно использовать для отмены и предотвращения срабатывания.

Для промисных вариантов [`setImmediate()`][`setImmediate()`] и [`setTimeout()`][`setTimeout()`]
для отмены можно использовать [`AbortController`][`AbortController`]. При отмене
возвращаемые промисы отклоняются с `'AbortError'`.

Для `setImmediate()`:

=== "MJS"

    ```js
    import { setImmediate as setImmediatePromise } from 'node:timers/promises';
    
    const ac = new AbortController();
    const signal = ac.signal;
    
    // Не ждём промис, чтобы `ac.abort()` выполнился параллельно.
    setImmediatePromise('foobar', { signal })
      .then(console.log)
      .catch((err) => {
        if (err.name === 'AbortError')
          console.error('The immediate was aborted');
      });
    
    ac.abort();
    ```

=== "CJS"

    ```js
    const { setImmediate: setImmediatePromise } = require('node:timers/promises');
    
    const ac = new AbortController();
    const signal = ac.signal;
    
    setImmediatePromise('foobar', { signal })
      .then(console.log)
      .catch((err) => {
        if (err.name === 'AbortError')
          console.error('The immediate was aborted');
      });
    
    ac.abort();
    ```

Для `setTimeout()`:

=== "MJS"

    ```js
    import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
    
    const ac = new AbortController();
    const signal = ac.signal;
    
    // Не ждём промис, чтобы `ac.abort()` выполнился параллельно.
    setTimeoutPromise(1000, 'foobar', { signal })
      .then(console.log)
      .catch((err) => {
        if (err.name === 'AbortError')
          console.error('The timeout was aborted');
      });
    
    ac.abort();
    ```

=== "CJS"

    ```js
    const { setTimeout: setTimeoutPromise } = require('node:timers/promises');
    
    const ac = new AbortController();
    const signal = ac.signal;
    
    setTimeoutPromise(1000, 'foobar', { signal })
      .then(console.log)
      .catch((err) => {
        if (err.name === 'AbortError')
          console.error('The timeout was aborted');
      });
    
    ac.abort();
    ```

### `clearImmediate(immediate)`

<!-- YAML
added: v0.9.1
-->

* `immediate` [`<Immediate>`](timers.md) Объект `Immediate`, возвращённый
  [`setImmediate()`][`setImmediate()`].

Отменяет объект `Immediate`, созданный [`setImmediate()`][`setImmediate()`].

### `clearInterval(timeout)`

<!-- YAML
added: v0.0.1
-->

* `timeout` [`<Timeout>`](timers.md) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Объект `Timeout`, возвращённый [`setInterval()`][`setInterval()`],
  или [примитив][primitive] объекта `Timeout` в виде строки или числа.

Отменяет объект `Timeout`, созданный [`setInterval()`][`setInterval()`].

### `clearTimeout(timeout)`

<!-- YAML
added: v0.0.1
-->

* `timeout` [`<Timeout>`](timers.md) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Объект `Timeout`, возвращённый [`setTimeout()`][`setTimeout()`],
  или [примитив][primitive] объекта `Timeout` в виде строки или числа.

Отменяет объект `Timeout`, созданный [`setTimeout()`][`setTimeout()`].

## API таймеров на промисах

<!-- YAML
added: v15.0.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/38112
    description: Graduated from experimental.
-->

Добавлено в: v15.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.0.0 | Окончил экспериментальный. |

API `timers/promises` предоставляет альтернативный набор функций таймеров,
возвращающих объекты `Promise`. Доступ через
`require('node:timers/promises')`.

=== "MJS"

    ```js
    import {
      setTimeout,
      setImmediate,
      setInterval,
    } from 'node:timers/promises';
    ```

=== "CJS"

    ```js
    const {
      setTimeout,
      setImmediate,
      setInterval,
    } = require('node:timers/promises');
    ```

### `timersPromises.setTimeout([delay[, value[, options]]])`

<!-- YAML
added: v15.0.0
-->

* `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах перед выполнением промиса. **По умолчанию:** `1`.
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение, с которым выполняется промис.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ref` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, запланированный `Timeout`
    не удерживает цикл событий Node.js активным.
    **По умолчанию:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Необязательный `AbortSignal` для отмены запланированного `Timeout`.

=== "MJS"

    ```js
    import {
      setTimeout,
    } from 'node:timers/promises';
    
    const res = await setTimeout(100, 'result');
    
    console.log(res);  // Prints 'result'
    ```

=== "CJS"

    ```js
    const {
      setTimeout,
    } = require('node:timers/promises');
    
    setTimeout(100, 'result').then((res) => {
      console.log(res);  // Prints 'result'
    });
    ```

### `timersPromises.setImmediate([value[, options]])`

<!-- YAML
added: v15.0.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение, с которым выполняется промис.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ref` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, запланированный `Immediate`
    не удерживает цикл событий Node.js активным.
    **По умолчанию:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Необязательный `AbortSignal` для отмены запланированного `Immediate`.

=== "MJS"

    ```js
    import {
      setImmediate,
    } from 'node:timers/promises';
    
    const res = await setImmediate('result');
    
    console.log(res);  // Prints 'result'
    ```

=== "CJS"

    ```js
    const {
      setImmediate,
    } = require('node:timers/promises');
    
    setImmediate('result').then((res) => {
      console.log(res);  // Prints 'result'
    });
    ```

### `timersPromises.setInterval([delay[, value[, options]]])`

<!-- YAML
added: v15.9.0
-->

Возвращает асинхронный итератор, выдающий значения с интервалом `delay` мс.
Если `ref` равен `true`, нужно явно или неявно вызывать `next()` у асинхронного итератора, чтобы цикл событий оставался активным.

* `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Интервал в миллисекундах между итерациями.
  **По умолчанию:** `1`.
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение, которое возвращает итератор.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ref` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, запланированный `Timeout`
    между итерациями не удерживает цикл событий Node.js
    активным.
    **По умолчанию:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Необязательный `AbortSignal` для отмены запланированного `Timeout` между операциями.

=== "MJS"

    ```js
    import {
      setInterval,
    } from 'node:timers/promises';
    
    const interval = 100;
    for await (const startTime of setInterval(interval, Date.now())) {
      const now = Date.now();
      console.log(now);
      if ((now - startTime) > 1000)
        break;
    }
    console.log(Date.now());
    ```

=== "CJS"

    ```js
    const {
      setInterval,
    } = require('node:timers/promises');
    const interval = 100;
    
    (async function() {
      for await (const startTime of setInterval(interval, Date.now())) {
        const now = Date.now();
        console.log(now);
        if ((now - startTime) > 1000)
          break;
      }
      console.log(Date.now());
    })();
    ```

### `timersPromises.scheduler.wait(delay[, options])`

<!-- YAML
added:
  - v17.3.0
  - v16.14.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

* `delay` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Задержка в миллисекундах перед разрешением промиса.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `ref` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, запланированный `Timeout`
    не удерживает цикл событий Node.js активным.
    **По умолчанию:** `true`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Необязательный `AbortSignal` для отмены ожидания.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Экспериментальный API из черновика спецификации [Scheduling APIs][Scheduling APIs], разрабатываемой как стандарт веб-платформы.

Вызов `timersPromises.scheduler.wait(delay, options)` эквивалентен
вызову `timersPromises.setTimeout(delay, undefined, options)`.

=== "MJS"

    ```js
    import { scheduler } from 'node:timers/promises';
    
    await scheduler.wait(1000); // Wait one second before continuing
    ```

### `timersPromises.scheduler.yield()`

<!-- YAML
added:
  - v17.3.0
  - v16.14.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Экспериментальный API из черновика спецификации [Scheduling APIs][Scheduling APIs], разрабатываемой как стандарт веб-платформы.

Вызов `timersPromises.scheduler.yield()` эквивалентен вызову
`timersPromises.setImmediate()` без аргументов.

[Event Loop]: https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#setimmediate-vs-settimeout
[Scheduling APIs]: https://github.com/WICG/scheduling-apis
[`AbortController`]: globals.md#class-abortcontroller
[`TypeError`]: errors.md#class-typeerror
[`clearImmediate()`]: #clearimmediateimmediate
[`clearInterval()`]: #clearintervaltimeout
[`clearTimeout()`]: #cleartimeouttimeout
[`setImmediate()`]: #setimmediatecallback-args
[`setInterval()`]: #setintervalcallback-delay-args
[`setTimeout()`]: #settimeoutcallback-delay-args
[`timersPromises.setImmediate()`]: #timerspromisessetimmediatevalue-options
[`timersPromises.setInterval()`]: #timerspromisessetintervaldelay-value-options
[`timersPromises.setTimeout()`]: #timerspromisessettimeoutdelay-value-options
[`worker_threads`]: worker_threads.md
[primitive]: #timeoutsymboltoprimitive
