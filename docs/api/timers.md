---
title: Timers
description: Модуль timer предоставляет глобальный API для планирования функций, которые будут вызваны в некоторый будущий период времени
---

# Таймеры

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/timers.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `timer` предоставляет глобальный API для планирования функций, которые будут вызваны в некоторый будущий период времени. Поскольку функции таймера являются глобальными, нет необходимости вызывать `require('node:timers')` для использования API.

Функции таймера в Node.js реализуют API, аналогичный API таймеров, предоставляемых веб-браузерами, но используют другую внутреннюю реализацию, построенную вокруг Node.js [Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#setimmediate-vs-settimeout).

## Класс: `Immediate`

Этот объект создается внутри системы и возвращается из [`setImmediate()`](#setimmediatecallback-args). Он может быть передан в [`clearImmediate()`](#clearimmediateimmediate), чтобы отменить запланированные действия.

По умолчанию, когда запланировано немедленное действие, цикл событий Node.js будет продолжать выполняться до тех пор, пока это немедленное действие активно. Объект `Immediate`, возвращаемый функцией [`setImmediate()`](#setimmediatecallback-args) экспортирует функции `immediate.ref()` и `immediate.unref()`, которые можно использовать для управления этим поведением по умолчанию.

### `immediate.hasRef()`

-   Возвращает: {boolean}.

Если true, то объект `Immediate` будет поддерживать цикл событий Node.js активным.

### `immediate.ref()`

-   Возвращает: {Immediate} ссылку на `immediate`.

При вызове запрашивает, чтобы цикл событий Node.js _не_ завершался, пока активен `Immediate`. Вызов `immediate.ref()` несколько раз не будет иметь никакого эффекта.

По умолчанию все объекты `Immediate` являются "ref'ed", поэтому обычно нет необходимости вызывать `immediate.ref()`, если только `immediate.unref()` не был вызван ранее.

### `immediate.unref()`

-   Возвращает: {Immediate} ссылку на `immediate`.

При вызове активный объект `Immediate` не будет требовать, чтобы цикл событий Node.js оставался активным. Если нет другой активности, поддерживающей цикл событий, процесс может завершиться до того, как будет вызван обратный вызов объекта `Immediate`. Вызов `immediate.unref()` несколько раз не будет иметь никакого эффекта.

## Класс: `Timeout`

Этот объект создается внутри и возвращается из [`setTimeout()`](#settimeoutcallback-delay-args) и [`setInterval()`](#setintervalcallback-delay-args). Его можно передать либо в [`clearTimeout()`](#cleartimeouttimeout), либо в [`clearInterval()`](#clearintervaltimeout), чтобы отменить запланированные действия.

По умолчанию, когда таймер запланирован с помощью [`setTimeout()`](#settimeoutcallback-delay-args) или [`setInterval()`](#setintervalcallback-delay-args), цикл событий Node.js будет продолжаться до тех пор, пока таймер активен. Каждый из объектов `Timeout`, возвращаемых этими функциями, экспортирует функции `timeout.ref()` и `timeout.unref()`, которые можно использовать для управления этим поведением по умолчанию.

### `timeout.close()`

> Стабильность: 3 - Наследие: Используйте [`clearTimeout()`](#cleartimeouttimeout) вместо этого.

-   Возвращает: {Timeout} ссылку на `timeout`.

Отменяет таймаут.

### `timeout.hasRef()`

-   Возвращает: {boolean}.

Если true, то объект `Timeout` будет поддерживать цикл событий Node.js активным.

### `timeout.ref()`

-   Возвращает: {Timeout} ссылку на `timeout`.

При вызове запрашивает, чтобы цикл событий Node.js _не_ завершался до тех пор, пока активен `timeout`. Вызов `timeout.ref()` несколько раз не будет иметь никакого эффекта.

По умолчанию все объекты `Timeout` являются "ссылочными", поэтому обычно нет необходимости вызывать `timeout.ref()`, если только `timeout.unref()` не был вызван ранее.

### `timeout.refresh()`

-   Возвращает: {Timeout} ссылку на `timeout`.

Устанавливает время запуска таймера на текущее время и перепланирует таймер для вызова его обратного вызова в ранее указанную продолжительность с поправкой на текущее время. Это полезно для обновления таймера без выделения нового объекта JavaScript.

Использование этой функции для таймера, который уже вызвал свой обратный вызов, приведет к повторной активации таймера.

### `timeout.unref()`

-   Возвращает: {Timeout} ссылку на `timeout`.

При вызове активный объект `Timeout` не будет требовать, чтобы цикл событий Node.js оставался активным. Если нет других действий, поддерживающих цикл событий, процесс может завершиться до того, как будет вызван обратный вызов объекта `Timeout`. Многократный вызов `timeout.unref()` не будет иметь никакого эффекта.

### `timeout[Symbol.toPrimitive]()`

-   Возвращает: {целое} число, которое может быть использовано для ссылки на этот `тайм-аут`.

Соединяет `тайм-аут` с примитивом. Примитив может быть использован для очистки `тайм-аута`. Примитив можно использовать только в том же потоке, в котором был создан таймаут. Поэтому, чтобы использовать его в [`worker_threads`](worker_threads.md), он должен быть сначала передан в нужный поток. Это позволяет улучшить совместимость с браузерными реализациями `setTimeout()` и `setInterval()`.

## Планирование таймеров

Таймер в Node.js - это внутренняя конструкция, которая вызывает заданную функцию через определенный период времени. Время вызова функции таймера зависит от того, какой метод был использован для создания таймера и какую другую работу выполняет цикл событий Node.js.

### `setImmediate(callback[, ...args])`

-   `callback` {Function} Функция, которую нужно вызвать в конце этого витка Node.js [Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#setimmediate-vs-settimeout)
-   `...args` {any} Необязательные аргументы для передачи при вызове `callback`.
-   Возвращает: {Immediate} для использования с [`clearImmediate()`](#clearimmediateimmediate)

Планирует "немедленное" выполнение `callback` после обратных вызовов событий ввода/вывода.

При многократном вызове `setImmediate()` функции `callback` ставятся в очередь на выполнение в том порядке, в котором они были созданы. Вся очередь обратных вызовов обрабатывается каждую итерацию цикла событий. Если внутри выполняющегося обратного вызова поставлен в очередь немедленный таймер, то этот таймер не будет запущен до следующей итерации цикла событий.

Если `callback` не является функцией, будет выброшен [`TypeError`](errors.md#class-typeerror).

У этого метода есть собственный вариант для обещаний, который доступен с помощью [`timersPromises.setImmediate()`](#timerspromisessetimmediatevalue-options).

### `setInterval(callback[, delay[, ...args]])`

-   `callback` {Function} Функция для вызова по истечении таймера.
-   `delay` {число} Число миллисекунд, которое нужно выждать перед вызовом `callback`. **По умолчанию:** `1`.
-   `...args` {любой} Необязательные аргументы, которые нужно передать при вызове `обратного действия`.
-   Возвращает: {Timeout} для использования с [`clearInterval()`](#clearintervaltimeout).

Планирует повторное выполнение `callback` каждые `delay` миллисекунд.

Если `delay` больше `2147483647` или меньше `1`, `delay` будет установлен в `1`. Нецелые задержки усекаются до целого числа.

Если `callback` не является функцией, будет выброшен [`TypeError`](errors.md#class-typeerror).

У этого метода есть собственный вариант для обещаний, который доступен с помощью [`timersPromises.setInterval()`](#timerspromisessetintervaldelay-value-options).

### `setTimeout(callback[, delay[, ...args]])`

-   `callback` {Function} Функция для вызова по истечении таймера.
-   `delay` {число} Число миллисекунд, которое нужно выждать перед вызовом `callback`. **По умолчанию:** `1`.
-   `...args` {любой} Необязательные аргументы, которые нужно передать при вызове `обратного действия`.
-   Возвращает: {Timeout} для использования с [`clearTimeout()`](#cleartimeouttimeout)

Планирует выполнение однократного `обратного вызова` через `задержку` миллисекунд.

Скорее всего, `обратный вызов` не будет вызван точно через `delay` миллисекунд. Node.js не дает никаких гарантий относительно точного времени срабатывания обратных вызовов, а также их порядка. Обратный вызов будет вызван как можно ближе к указанному времени.

Если `delay` больше `2147483647` или меньше `1`, `delay` будет установлен в `1`. Нецелые задержки усекаются до целого числа.

Если `callback` не является функцией, будет выброшен [`TypeError`](errors.md#class-typeerror).

У этого метода есть собственный вариант для обещаний, который доступен с помощью [`timersPromises.setTimeout()`](#timerspromisessettimeoutdelay-value-options).

## Отмена таймеров

Методы [`setImmediate()`](#setimmediatecallback-args), [`setInterval()`](#setintervalcallback-delay-args) и [`setTimeout()`](#settimeoutcallback-delay-args) возвращают объекты, представляющие запланированные таймеры. Их можно использовать для отмены таймера и предотвращения его срабатывания.

Для обещанных вариантов [`setImmediate()`](#setimmediatecallback-args) и [`setTimeout()`](#settimeoutcallback-delay-args) для отмены таймера можно использовать [`AbortController`](globals.md#class-abortcontroller). При отмене возвращаемые Promises будут отклонены с сообщением `AbortError`.

Для `setImmediate()`:

```js
const {
    setImmediate: setImmediatePromise,
} = require('node:timers/promises');

const ac = new AbortController();
const signal = ac.signal;

setImmediatePromise('foobar', { signal })
    .then(console.log)
    .catch((err) => {
        if (err.name === 'AbortError')
            console.error(
                'Немедленное выполнение было прервано'
            );
    });

ac.abort();
```

Для `setTimeout()`:

```js
const {
    setTimeout: setTimeoutPromise,
} = require('node:timers/promises');

const ac = new AbortController();
const signal = ac.signal;

setTimeoutPromise(1000, 'foobar', { signal })
    .then(console.log)
    .catch((err) => {
        if (err.name === 'AbortError')
            console.error('Таймаут был прерван');
    });

ac.abort();
```

### `clearImmediate(immediate)`

-   `immediate` {Immediate} Объект `Immediate`, возвращенный командой [`setImmediate()`](#setimmediatecallback-args).

Отменяет объект `Immediate`, созданный [`setImmediate()`](#setimmediatecallback-args).

### `clearInterval(timeout)`

-   `timeout` {Timeout|string|number} Объект `Timeout`, возвращаемый [`setInterval()`](#setintervalcallback-delay-args) или [primitive](#timeoutsymboltoprimitive) объекта `Timeout` в виде строки или числа.

Отменяет объект `Timeout`, созданный [`setInterval()`](#setintervalcallback-delay-args).

### `clearTimeout(timeout)`

-   `timeout` {Timeout|string|number} Объект `Timeout`, возвращаемый [`setTimeout()`](#settimeoutcallback-delay-args) или [primitive](#timeoutsymboltoprimitive) объекта `Timeout` в виде строки или числа.

Отменяет объект `Timeout`, созданный [`setTimeout()`](#settimeoutcallback-delay-args).

## API Timers Promises

API `timers/promises` предоставляет альтернативный набор функций таймера, которые возвращают объекты `Promise`. API доступен через `require('node:timers/promises')`.

```mjs
import {
    setTimeout,
    setImmediate,
    setInterval,
} from 'timers/promises';
```

```cjs
const {
    setTimeout,
    setImmediate,
    setInterval,
} = require('node:timers/promises');
```

### `timersPromises.setTimeout([delay[, value[, options]]])`

-   `delay` {number} Количество миллисекунд ожидания перед выполнением обещания. **По умолчанию:** `1`.
-   `value` {любое} Значение, с которым будет выполнено обещание.
-   `options` {Object}
    -   `ref` {boolean} Устанавливается в `false`, чтобы указать, что запланированный `Timeout` не должен требовать, чтобы цикл событий Node.js оставался активным. **По умолчанию:** `true`.
    -   `signal` {AbortSignal} Необязательный `AbortSignal`, который может быть использован для отмены запланированного `Timeout`.

```mjs
import { setTimeout } from 'timers/promises';

const res = await setTimeout(100, 'result');

console.log(res); // Печатает 'result'
```

```cjs
const { setTimeout } = require('node:timers/promises');

setTimeout(100, 'result').then((res) => {
    console.log(res); // Печатает 'result'
});
```

### `timersPromises.setImmediate([value[, options]])`.

-   `value` {любой} Значение, с которым обещание будет выполнено.
-   `options` {Object}
    -   `ref` {boolean} Устанавливается в `false`, чтобы указать, что запланированное `Immediate` не должно требовать, чтобы цикл событий Node.js оставался активным. **По умолчанию:** `true`.
    -   `signal` {AbortSignal} Необязательный `AbortSignal`, который может быть использован для отмены запланированного `Immediate`.

```mjs
import { setImmediate } from 'timers/promises';

const res = await setImmediate('result');

console.log(res); // Печатает 'result'
```

```cjs
const { setImmediate } = require('node:timers/promises');

setImmediate('result').then((res) => {
    console.log(res); // Печатает 'result'
});
```

### `timersPromises.setInterval([delay[, value[, options]]])`

Возвращает асинхронный итератор, который генерирует значения в интервале `delay` мс. Если `ref` равно `true`, необходимо явно или неявно вызвать `next()` асинхронного итератора, чтобы сохранить цикл событий.

-   `delay` {number} Число миллисекунд для ожидания между итерациями. **По умолчанию:** `1`.
-   `value` {любое} Значение, с которым возвращается итератор.
-   `options` {Object}
    -   `ref` {boolean} Устанавливается в `false`, чтобы указать, что запланированный `Timeout` между итерациями не должен требовать, чтобы цикл событий Node.js оставался активным. **По умолчанию:** `true`.
    -   `signal` {AbortSignal} Необязательный `AbortSignal`, который может быть использован для отмены запланированного `Timeout` между операциями.

```mjs
import { setInterval } from 'timers/promises';

const interval = 100;
for await (const startTime of setInterval(
    interval,
    Date.now()
)) {
    const now = Date.now();
    console.log(now);
    if (now - startTime > 1000) break;
}
console.log(Date.now());
```

```cjs
const { setInterval } = require('node:timers/promises');
const interval = 100;

(async function () {
    for await (const startTime of setInterval(
        interval,
        Date.now()
    )) {
        const now = Date.now();
        console.log(now);
        if (now - startTime > 1000) break;
    }
    console.log(Date.now());
})();
```

### `timersPromises.scheduler.wait(delay[, options])`

> Стабильность: 1 - Экспериментально

-   `delay` {number} Количество миллисекунд, которое нужно подождать перед разрешением обещания.
-   `options` {Object}
    -   `signal` {AbortSignal} Необязательный сигнал `AbortSignal`, который может быть использован для отмены ожидания.
-   Возвращает: {Promise}

Экспериментальный API, определенный проектом спецификации [Scheduling APIs](https://github.com/WICG/scheduling-apis), разрабатываемый как стандартный API для веб-платформы.

Вызов `timersPromises.scheduler.wait(delay, options)` примерно эквивалентен вызову `timersPromises.setTimeout(delay, undefined, options)` за исключением того, что опция `ref` не поддерживается.

```mjs
import { scheduler } from 'node:timers/promises';

await scheduler.wait(1000); // Подождите одну секунду перед продолжением
```

### `timersPromises.scheduler.yield()`

> Стабильность: 1 - Экспериментальная

-   Возвращает: {Promise}

Экспериментальный API, определенный в проекте спецификации [Scheduling APIs](https://github.com/WICG/scheduling-apis), разрабатываемой как стандартный API для веб-платформы.

Вызов `timersPromises.scheduler.yield()` эквивалентен вызову `timersPromises.setImmediate()` без аргументов.
