---
title: Events
description: Большая часть API ядра Node.js построена на идиоматической асинхронной управляемой событиями архитектуре, в которой определенные виды объектов испускают именованные события, которые вызывают Function вызываемые объекты
---

# События

[:octicons-tag-24: v18.x.x](https://nodejs.org/dist/latest-v18.x/docs/api/events.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Большая часть API ядра Node.js построена вокруг идиоматической асинхронной событийно-ориентированной архитектуры, в которой определенные типы объектов (называемые "эмиттерами") испускают именованные события, которые вызывают объекты `функции` ("слушатели").

Например: объект [`net.Server`](net.md#class-netserver) излучает событие каждый раз, когда к нему подключается пир; [`fs.ReadStream`](fs.md#class-fsreadstream) излучает событие, когда открывается файл; [stream](stream.md) излучает событие каждый раз, когда данные доступны для чтения.

Все объекты, которые испускают события, являются экземплярами класса `EventEmitter`. Эти объекты открывают функцию `eventEmitter.on()`, которая позволяет прикрепить одну или несколько функций к именованным событиям, испускаемым объектом. Обычно имена событий представляют собой строки в верблюжьем регистре, но можно использовать любой допустимый ключ свойства JavaScript.

Когда объект `EventEmitter` испускает событие, все функции, присоединенные к этому конкретному событию, вызываются _синхронно_. Любые значения, возвращенные вызванными слушателями, _игнорируются_ и отбрасываются.

В следующем примере показан простой экземпляр `EventEmitter` с одним слушателем. Метод `eventEmitter.on()` используется для регистрации слушателей, а метод `eventEmitter.emit()` используется для запуска события.

```mjs
import { EventEmitter } from 'node:events';

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
    console.log('произошло событие!');
});
myEmitter.emit('event');
```

```cjs
const EventEmitter = require('node:events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
    console.log('произошло событие!');
});
myEmitter.emit('event');
```

<!-- 0000.part.md -->

## Передача аргументов и `this` слушателям

Метод `eventEmitter.emit()` позволяет передавать произвольный набор аргументов в функции слушателя. Помните, что при вызове обычной функции слушателя стандартное ключевое слово `this` намеренно устанавливается для ссылки на экземпляр `EventEmitter`, к которому прикреплен слушатель.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', function (a, b) {
    console.log(a, b, this, this === myEmitter);
    // Печатает:
    // a b MyEmitter {
    // _events: [Object: null prototype] { event: [Function (anonymous)] } }
    // _eventsCount: 1,
    // _maxListeners: undefined,
    // [Symbol(kCapture)]: false
    // } true
});
myEmitter.emit('event', 'a', 'b');
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', function (a, b) {
    console.log(a, b, this, this === myEmitter);
    // Печатает:
    // a b MyEmitter {
    // _events: [Object: null prototype] { event: [Function (anonymous)] } }
    // _eventsCount: 1,
    // _maxListeners: undefined,
    // [Symbol(kCapture)]: false
    // } true
});
myEmitter.emit('event', 'a', 'b');
```

Можно использовать стрелочные функции ES6 в качестве слушателей, однако при этом ключевое слово `this` больше не будет ссылаться на экземпляр `EventEmitter`:

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
    console.log(a, b, this);
    // Печатает: a b {}
});
myEmitter.emit('event', 'a', 'b');
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
    console.log(a, b, this);
    // Печатает: a b {}
});
myEmitter.emit('event', 'a', 'b');
```

<!-- 0001.part.md -->

## Асинхронность против синхронности

Устройство `EventEmitter` вызывает всех слушателей синхронно в том порядке, в котором они были зарегистрированы. Это обеспечивает правильную последовательность событий и помогает избежать условий гонки и логических ошибок. При необходимости функции слушателей могут переходить в асинхронный режим работы с помощью методов `setImmediate()` или `process.nextTick()`:

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
    setImmediate(() => {
        console.log('это происходит асинхронно');
    });
});
myEmitter.emit('event', 'a', 'b');
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
    setImmediate(() => {
        console.log('это происходит асинхронно');
    });
});
myEmitter.emit('event', 'a', 'b');
```

<!-- 0002.part.md -->

## Обработка событий только один раз

Когда слушатель зарегистрирован с помощью метода `eventEmitter.on()`, этот слушатель вызывается _каждый раз_, когда испускается названное событие.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
let m = 0;
myEmitter.on('event', () => {
    console.log(++m);
});
myEmitter.emit('event');
// Печатает: 1
myEmitter.emit('event');
// Печатает: 2
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
let m = 0;
myEmitter.on('event', () => {
    console.log(++m);
});
myEmitter.emit('event');
// Печатает: 1
myEmitter.emit('event');
// Печатает: 2
```

Используя метод `eventEmitter.once()`, можно зарегистрировать слушатель, который вызывается не более одного раза для определенного события. Как только событие произойдет, слушатель будет снят с регистрации и _тогда_ вызван.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
let m = 0;
myEmitter.once('event', () => {
    console.log(++m);
});
myEmitter.emit('event');
// Печатает: 1
myEmitter.emit('event');
// Игнорируется
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
let m = 0;
myEmitter.once('event', () => {
    console.log(++m);
});
myEmitter.emit('event');
// Печатает: 1
myEmitter.emit('event');
// Игнорируется
```

<!-- 0003.part.md -->

## События ошибки

Когда в экземпляре `EventEmitter` возникает ошибка, типичным действием является выдача события `'error'`. В Node.js это рассматривается как особый случай.

Если у `EventEmitter` нет _не_ хотя бы одного слушателя, зарегистрированного для события `'error'`, и событие `'error'` испускается, ошибка отбрасывается, печатается трассировка стека, и процесс Node.js завершается.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.emit('error', new Error('whoops!'));
// Выбрасывает и разрушает Node.js
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.emit('error', new Error('whoops!'));
// Выбрасывает и разрушает Node.js
```

Для защиты от сбоя процесса Node.js можно использовать модуль [`domain`](domain.md). (Заметим, однако, что модуль `node:domain` устарел).

В качестве лучшей практики всегда следует добавлять слушателей для событий `error`.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('error', (err) => {
    console.error('упс! произошла ошибка');
});
myEmitter.emit('error', new Error('whoops!'));
// Выводит: упс! произошла ошибка
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();
myEmitter.on('error', (err) => {
    console.error('упс! произошла ошибка');
});
myEmitter.emit('error', new Error('whoops!'));
// Выводит: упс! произошла ошибка
```

Можно отслеживать события `error` без потребления излучаемой ошибки, установив слушателя с помощью символа `events.errorMonitor`.

```mjs
import { EventEmitter, errorMonitor } from 'node:events';

const myEmitter = new EventEmitter();
myEmitter.on(errorMonitor, (err) => {
    MyMonitoringTool.log(err);
});
myEmitter.emit('error', new Error('whoops!'));
// Все еще бросает и рушит Node.js
```

```cjs
const {
    EventEmitter,
    errorMonitor,
} = require('node:events');

const myEmitter = new EventEmitter();
myEmitter.on(errorMonitor, (err) => {
    MyMonitoringTool.log(err);
});
myEmitter.emit('error', new Error('whoops!'));
// Все еще бросает и рушит Node.js
```

<!-- 0004.part.md -->

## Перехват отказов обещаний

Использование функций `async` с обработчиками событий проблематично, поскольку может привести к необработанному отказу в случае брошенного исключения:

```mjs
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();
ee.on('something', async (value) => {
    throw new Error('kaboom');
});
```

```cjs
const EventEmitter = require('node:events');
const ee = new EventEmitter();
ee.on('something', async (value) => {
    throw new Error('kaboom');
});
```

Опция `captureRejections` в конструкторе `EventEmitter` или глобальная настройка изменяют это поведение, устанавливая обработчик `.then(undefined, handler)` на `Promise`. Этот обработчик направляет исключение асинхронно в метод [`Symbol.for('nodejs.rejection')`](#emittersymbolfornodejsrejectionerr-eventname-args), если он есть, или в обработчик событий [`'error'`](#error-events), если его нет.

```mjs
import { EventEmitter } from 'node:events';
const ee1 = new EventEmitter({ captureRejections: true });
ee1.on('something', async (value) => {
    throw new Error('kaboom');
});

ee1.on('error', console.log);

const ee2 = new EventEmitter({ captureRejections: true });
ee2.on('something', async (value) => {
    throw new Error('kaboom');
});

ee2[Symbol.for('nodejs.rejection')] = console.log;
```

```cjs
const EventEmitter = require('node:events');
const ee1 = new EventEmitter({ captureRejections: true });
ee1.on('something', async (value) => {
    throw new Error('kaboom');
});

ee1.on('error', console.log);

const ee2 = new EventEmitter({ captureRejections: true });
ee2.on('something', async (value) => {
    throw new Error('kaboom');
});

ee2[Symbol.for('nodejs.rejection')] = console.log;
```

Установка `events.captureRejections = true` изменит значение по умолчанию для всех новых экземпляров `EventEmitter`.

```mjs
import { EventEmitter } from 'node:events';

EventEmitter.captureRejections = true;
const ee1 = new EventEmitter();
ee1.on('something', async (value) => {
    throw new Error('kaboom');
});

ee1.on('error', console.log);
```

```cjs
const events = require('node:events');
events.captureRejections = true;
const ee1 = new events.EventEmitter();
ee1.on('something', async (value) => {
    throw new Error('kaboom');
});

ee1.on('error', console.log);
```

События `'error'`, которые генерируются поведением `captureRejections`, не имеют обработчика `catch`, чтобы избежать бесконечных циклов ошибок: рекомендуется **не использовать функции `async` в качестве обработчиков событий `'error'`**.

<!-- 0005.part.md -->

## Класс: `EventEmitter`

Класс `EventEmitter` определяется и раскрывается модулем `node:events`:

```mjs
import { EventEmitter } from 'node:events';
```

```cjs
const EventEmitter = require('node:events');
```

Все `EventEmitter` испускают событие `'newListener'` при добавлении новых слушателей и `'removeListener'` при удалении существующих слушателей.

Он поддерживает следующую опцию:

-   `captureRejections` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включает [автоматический перехват отказов обещаний](#capture-rejections-of-promises). **По умолчанию:** `false`.

<!-- 0006.part.md -->

### Событие: `'newListener'`

-   `eventName` {string|symbol} Имя события, которое прослушивается
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обработчика события

Экземпляр `EventEmitter` будет испускать свое собственное событие `'newListener'` _до_ того, как слушатель будет добавлен в его внутренний массив слушателей.

Слушателям, зарегистрированным для события `'newListener'`, передается имя события и ссылка на добавляемый слушатель.

Тот факт, что событие запускается до добавления слушателя, имеет тонкий, но важный побочный эффект: любые _дополнительные_ слушатели, зарегистрированные на то же `имя` _в рамках_ обратного вызова `'newListener'`, вставляются _перед_ слушателем, который находится в процессе добавления.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
// Делаем это только один раз, чтобы не циклиться вечно
myEmitter.once('newListener', (event, listener) => {
    if (event === 'event') {
        // Вставляем новый слушатель
        myEmitter.on('event', () => {
            console.log('B');
        });
    }
});
myEmitter.on('event', () => {
    console.log('A');
});
myEmitter.emit('event');
// Печатает:
// B
// A
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
// Делаем это только один раз, чтобы не циклиться вечно
myEmitter.once('newListener', (event, listener) => {
    if (event === 'event') {
        // Вставляем новый слушатель
        myEmitter.on('event', () => {
            console.log('B');
        });
    }
});
myEmitter.on('event', () => {
    console.log('A');
});
myEmitter.emit('event');
// Печатает:
// B
// A
```

<!-- 0007.part.md -->

### Событие: `'removeListener'`

-   `eventName` {string|symbol} Имя события
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обработчика события

Событие `'removeListener'` испускается _после_ удаления `listener'`.

<!-- 0008.part.md -->

### `emitter.addListener(eventName, listener)`

-   `eventName` {string|symbol}
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Псевдоним для `emitter.on(eventName, listener)`.

<!-- 0009.part.md -->

### `emitter.emit(eventName[, ...args])`

-   `eventName` {string|symbol}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Синхронно вызывает каждый из слушателей, зарегистрированных для события с именем `eventName`, в порядке их регистрации, передавая каждому из них указанные аргументы.

Возвращает `true`, если у события были слушатели, `false` в противном случае.

```mjs
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// Первый слушатель
myEmitter.on('event', function firstListener() {
    console.log('Helloooooo! первый слушатель');
});
// Второй слушатель
myEmitter.on('event', function secondListener(arg1, arg2) {
    console.log(
        `событие с параметрами ${arg1}, ${arg2} во втором слушателе`
    );
});
// Третий слушатель
myEmitter.on('event', function thirdListener(...args) {
    const parameters = args.join(', ');
    console.log(
        `событие с параметрами ${параметры} в третьем слушателе`
    );
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Печатает:
// [
// [Функция: firstListener],
// [Function: secondListener],
// [Function: thirdListener]
// ]
// первый слушатель
// событие с параметрами 1, 2 во втором слушателе
// событие с параметрами 1, 2, 3, 4, 5 в третьем слушателе
```

```cjs
const EventEmitter = require('node:events');
const myEmitter = new EventEmitter();

// Первый слушатель
myEmitter.on('event', function firstListener() {
    console.log('Helloooooo! первый слушатель');
});
// Второй слушатель
myEmitter.on('event', function secondListener(arg1, arg2) {
    console.log(
        `событие с параметрами ${arg1}, ${arg2} во втором слушателе`
    );
});
// Третий слушатель
myEmitter.on('event', function thirdListener(...args) {
    const parameters = args.join(', ');
    console.log(
        `событие с параметрами ${параметры} в третьем слушателе`
    );
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Печатает:
// [
// [Функция: firstListener],
// [Function: secondListener],
// [Function: thirdListener]
// ]
// первый слушатель
// событие с параметрами 1, 2 во втором слушателе
// событие с параметрами 1, 2, 3, 4, 5 в третьем слушателе
```

<!-- 0010.part.md -->

### `emitter.eventNames()`

-   Возвращает: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Возвращает массив, содержащий список событий, для которых эмиттер зарегистрировал слушателей. Значения в массиве - это строки или `символы`.

```mjs
import { EventEmitter } from 'node:events';

const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Печатает: [ 'foo', 'bar', Symbol(symbol) ]
```

```cjs
const EventEmitter = require('node:events');

const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Печатает: [ 'foo', 'bar', Symbol(symbol) ]
```

<!-- 0011.part.md -->

### `emitter.getMaxListeners()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает текущее максимальное значение слушателя для `EventEmitter`, которое либо установлено [`emitter.setMaxListeners(n)`](#emittersetmaxlistenersn), либо по умолчанию равно [`events.defaultMaxListeners`](#eventsdefaultmaxlisteners).

<!-- 0012.part.md -->

### `emitter.listenerCount(eventName)`

-   `eventName` {string|symbol} Имя события, которое прослушивается
-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает количество слушателей, прослушивающих событие с именем `eventName`.

<!-- 0013.part.md -->

### `emitter.listeners(eventName)`

-   `eventName` {string|symbol}
-   Возвращает: {функция\[\]}

Возвращает копию массива слушателей для события с именем `eventName`.

```js
server.on('connection', (stream) => {
    console.log('кто-то подключился!');
});
console.log(util.inspect(server.listeners('connection')));
// Выводит: [ [Функция]]
```

<!-- 0014.part.md -->

### `emitter.off(eventName, listener)`

-   `eventName` {string|symbol}
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Псевдоним для [`emitter.removeListener()`](#emitterremovelistenereventname-listener).

<!-- 0015.part.md -->

### `emitter.on(eventName, listener)`

-   `eventName` {string|symbol} Имя события.
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова.
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Добавляет функцию `listener` в конец массива слушателей для события с именем `eventName`. Не проверяется, не был ли `listener` уже добавлен. Многократные вызовы, передающие одну и ту же комбинацию `eventName` и `listener`, приведут к тому, что `listener` будет добавлен и вызван несколько раз.

```js
server.on('connection', (stream) => {
    console.log('кто-то подключился!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть объединены в цепочку.

По умолчанию слушатели событий вызываются в порядке их добавления. В качестве альтернативы можно использовать метод `emitter.prependListener()` для добавления слушателя события в начало массива слушателей.

```mjs
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Печатает:
// b
// a
```

```cjs
const EventEmitter = require('node:events');
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Печатает:
// b
// a
```

<!-- 0016.part.md -->

### `emitter.once(eventName, listener)`

-   `eventName` {string|symbol} Имя события.
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова.
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Добавляет **одноразовую** функцию `слушателя` для события с именем `eventName`. При следующем срабатывании `eventName` этот слушатель удаляется, а затем вызывается.

```js
server.once('connection', (stream) => {
    console.log('Ах, у нас есть наш первый пользователь!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть объединены в цепочку.

По умолчанию слушатели событий вызываются в порядке их добавления. В качестве альтернативы можно использовать метод `emitter.prependOnceListener()` для добавления слушателя события в начало массива слушателей.

```mjs
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Печатает:
// b
// a
```

```cjs
const EventEmitter = require('node:events');
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Печатает:
// b
// a
```

<!-- 0017.part.md -->

### `emitter.prependListener(eventName, listener)`

-   `eventName` {string|symbol} Имя события.
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова.
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Добавляет функцию `listener` в _начало_ массива слушателей для события с именем `eventName`. Не проверяется, не был ли `слушатель` уже добавлен. Многократные вызовы, передающие одну и ту же комбинацию `eventName` и `listener`, приведут к тому, что `listener` будет добавлен и вызван несколько раз.

```js
server.prependListener('connection', (stream) => {
    console.log('кто-то подключился!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть соединены в цепочку.

<!-- 0018.part.md -->

### `emitter.prependOnceListener(eventName, listener)`

-   `eventName` {string|symbol} Имя события.
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова.
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Добавляет **одноразовую** функцию `слушателя` для события с именем `eventName` в _начало_ массива слушателей. При следующем срабатывании `eventName` этот слушатель удаляется, а затем вызывается.

```js
server.prependOnceListener('connection', (stream) => {
    console.log('Ах, у нас есть наш первый пользователь!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть объединены в цепочку.

<!-- 0019.part.md -->

### `emitter.removeAllListeners([eventName])`

-   `eventName` {string|symbol}
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Удаляет всех слушателей или слушателей указанного `eventName`.

Плохой практикой является удаление слушателей, добавленных в другом месте кода, особенно если экземпляр `EventEmitter` был создан каким-либо другим компонентом или модулем (например, сокеты или файловые потоки).

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть объединены в цепочку.

<!-- 0020.part.md -->

### `emitter.removeListener(eventName, listener)`

-   `eventName` {string|symbol}
-   `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

Удаляет указанный `listener` из массива слушателей для события с именем `eventName`.

```js
const callback = (stream) => {
    console.log('кто-то подключился!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

Функция `removeListener()` удалит из массива слушателей не более одного экземпляра слушателя. Если какой-либо один слушатель был добавлен в массив слушателей несколько раз для указанного `eventName`, то `removeListener()` должен быть вызван несколько раз для удаления каждого экземпляра.

Как только событие испущено, все слушатели, прикрепленные к нему на момент испускания, вызываются по порядку. Это означает, что любые вызовы `removeListener()` или `removeAllListeners()` _после_ испускания и _до_ завершения выполнения последнего слушателя не удалят их из `emit()` в процессе выполнения. Последующие события ведут себя так, как ожидалось.

```mjs
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
    console.log('A');
    myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
    console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA удаляет слушателя callbackB, но он все равно будет вызван.
// Внутренний массив слушателей во время испускания [callbackA, callbackB].
myEmitter.emit('event');
// Печатает:
// A
// B

// callbackB теперь удален.
// Внутренний массив слушателей [callbackA].
myEmitter.emit('event');
// Печатает:
// A
```

```cjs
const EventEmitter = require('node:events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
    console.log('A');
    myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
    console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA удаляет слушателя callbackB, но он все равно будет вызван.
// Внутренний массив слушателей во время испускания [callbackA, callbackB].
myEmitter.emit('event');
// Печатает:
// A
// B

// callbackB теперь удален.
// Внутренний массив слушателей [callbackA].
myEmitter.emit('event');
// Печатает:
// A
```

Поскольку управление слушателями осуществляется с помощью внутреннего массива, вызов этой функции изменит индексы позиций всех слушателей, зарегистрированных _после_ удаляемого слушателя. Это не повлияет на порядок вызова слушателей, но это означает, что все копии массива слушателей, возвращаемые методом `emitter.listeners()`, должны быть созданы заново.

Когда одна функция была добавлена в качестве обработчика несколько раз для одного события (как в примере ниже), `removeListener()` удалит последний добавленный экземпляр. В примере удаляется слушатель `once('ping')`:

```mjs
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();

function pong() {
    console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

```cjs
const EventEmitter = require('node:events');
const ee = new EventEmitter();

function pong() {
    console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть объединены в цепочку.

### `emitter.setMaxListeners(n)`

-   `n` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
-   Возвращает: [`<EventEmitter>`](events.md#eventemitter)

По умолчанию `EventEmitter` выводит предупреждение, если для определенного события добавлено более `10` слушателей. Это полезное значение по умолчанию, которое помогает найти утечки памяти. Метод `emitter.setMaxListeners()` позволяет изменить это ограничение для данного экземпляра `EventEmitter`. Значение может быть установлено в `бесконечность` (или `0`), чтобы указать неограниченное количество слушателей.

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть объединены в цепочку.

<!-- 0022.part.md -->

### `emitter.rawListeners(eventName)`

-   `eventName` {string|symbol}
-   Возвращает: {функция\[\]}

Возвращает копию массива слушателей для события с именем `eventName`, включая любые обертки (например, созданные `.once()`).

```mjs
import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Возвращает новый массив с функцией `onceWrapper`, которая имеет свойство
// `listener`, которое содержит исходный слушатель, связанный выше
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Выводит "log once" в консоль и не отвязывает событие `once`.
logFnWrapper.listener();

// Выводит в консоль сообщение "log once" и удаляет слушателя
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Вернет новый массив с единственной функцией, связанной `.on()` выше
const newListeners = emitter.rawListeners('log');

// Записывает "log persistently" дважды
newListeners[0]();
emitter.emit('log');
```

```cjs
const EventEmitter = require('node:events');
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Возвращает новый массив с функцией `onceWrapper`, которая имеет свойство
// `listener`, которое содержит исходный слушатель, связанный выше
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Выводит "log once" в консоль и не отвязывает событие `once`.
logFnWrapper.listener();

// Выводит в консоль сообщение "log once" и удаляет слушателя
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Вернет новый массив с единственной функцией, связанной `.on()` выше
const newListeners = emitter.rawListeners('log');

// Записывает "log persistently" дважды
newListeners[0]();
emitter.emit('log');
```

<!-- 0023.part.md -->

### `emitter[Symbol.for('nodejs.rejection')](err, eventName[, ...args])`

-   `err` Ошибка
-   `eventName` {string|symbol}
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Метод `Symbol.for('nodejs.rejection')` вызывается в том случае, если при эмиссии события происходит отказ от обещания и на эмиттере включена функция [`captureRejections`](#capture-rejections-of-promises). Можно использовать [`events.captureRejectionSymbol`](#eventscapturerejectionsymbol) вместо `Symbol.for('nodejs.rejection')`.

```mjs
import {
    EventEmitter,
    captureRejectionSymbol,
} from 'node:events';

class MyClass extends EventEmitter {
    constructor() {
        super({ captureRejections: true });
    }

    [captureRejectionSymbol](err, event, ...args) {
        console.log(
            'отклонение произошло для',
            event,
            'с',
            err,
            ...args
        );
        this.destroy(err);
    }

    destroy(err) {
        // Уничтожаем ресурс здесь.
    }
}
```

```cjs
const {
    EventEmitter,
    captureRejectionSymbol,
} = require('node:events');

class MyClass extends EventEmitter {
    constructor() {
        super({ captureRejections: true });
    }

    [captureRejectionSymbol](err, event, ...args) {
        console.log(
            'отклонение произошло для',
            event,
            'с',
            err,
            ...args
        );
        this.destroy(err);
    }

    destroy(err) {
        // Уничтожаем ресурс здесь.
    }
}
```

<!-- 0024.part.md -->

## `events.defaultMaxListeners`

По умолчанию для любого отдельного события может быть зарегистрировано не более `10` слушателей. Это ограничение можно изменить для отдельных экземпляров `EventEmitter` с помощью метода [`emitter.setMaxListeners(n)`](#emittersetmaxlistenersn). Чтобы изменить значение по умолчанию для _всех_ экземпляров `EventEmitter`, можно использовать свойство `events.defaultMaxListeners`. Если это значение не является положительным числом, будет выдана ошибка `RangeError`.

Будьте осторожны при установке `events.defaultMaxListeners`, поскольку изменение влияет на _все_ экземпляры `EventEmitter`, включая те, которые были созданы до внесения изменения. Однако вызов [`emitter.setMaxListeners(n)`](#emittersetmaxlistenersn) по-прежнему имеет приоритет над `events.defaultMaxListeners`.

Это не жесткое ограничение. Экземпляр `EventEmitter` позволит добавить больше слушателей, но выведет предупреждение в stderr о том, что была обнаружена "возможная утечка памяти EventEmitter". Для любого отдельного `EventEmitter` можно использовать методы `emitter.getMaxListeners()` и `emitter.setMaxListeners()`, чтобы временно избежать этого предупреждения:

```mjs
import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
    // делать что-то
    emitter.setMaxListeners(
        Math.max(emitter.getMaxListeners() - 1, 0)
    );
});
```

```cjs
const EventEmitter = require('node:events');
const emitter = new EventEmitter();
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
    // делать что-то
    emitter.setMaxListeners(
        Math.max(emitter.getMaxListeners() - 1, 0)
    );
});
```

Флаг командной строки [`--trace-warnings`](cli.md#--trace-warnings) может быть использован для отображения стековой трассировки таких предупреждений.

Выданное предупреждение может быть проверено с помощью [`process.on('warning')`](process.md#event-warning) и будет иметь дополнительные свойства `emitter`, `type` и `count`, ссылающиеся на экземпляр эмиттера события, имя события и количество подключенных слушателей, соответственно. Его свойство `name` устанавливается в `'MaxListenersExceededWarning'`.

<!-- 0025.part.md -->

## `events.errorMonitor`

Этот символ используется для установки слушателя только для мониторинга событий `'error'`. Слушатели, установленные с помощью этого символа, вызываются до вызова обычных слушателей `'error'`.

Установка слушателя с помощью этого символа не изменяет поведение процесса после возникновения события `'error'`. Поэтому процесс все равно завершится, если не установлен обычный `'error'``прослушиватель.

<!-- 0026.part.md -->

## `events.getEventListeners(emitterOrTarget, eventName)`

-   `emitterOrTarget` {EventEmitter|EventTarget}
-   `eventName` {string|symbol}
-   Возвращает: {функция\[\]}

Возвращает копию массива слушателей для события с именем `eventName`.

Для `EventEmitter` это ведет себя точно так же, как вызов `.listeners` для эмиттера.

Для `EventTarget` это единственный способ получить слушателей события для цели события. Это полезно для отладки и диагностики.

```mjs
import {
    getEventListeners,
    EventEmitter,
} from 'node:events';

{
    const ee = new EventEmitter();
    const listener = () =>
        console.log('События - это весело');
    ee.on('foo', listener);
    console.log(getEventListeners(ee, 'foo')); // [ [Функция: listener] ]
}
{
    const et = new EventTarget();
    const listener = () =>
        console.log('События - это весело');
    et.addEventListener('foo', listener);
    console.log(getEventListeners(et, 'foo')); // [ [Функция: listener] ]
}
```

```cjs
const {
    getEventListeners,
    EventEmitter,
} = require('node:events');

{
    const ee = new EventEmitter();
    const listener = () =>
        console.log('События - это весело');
    ee.on('foo', listener);
    console.log(getEventListeners(ee, 'foo')); // [ [Функция: listener] ]
}
{
    const et = new EventTarget();
    const listener = () =>
        console.log('События - это весело');
    et.addEventListener('foo', listener);
    console.log(getEventListeners(et, 'foo')); // [ [Функция: listener] ]
}
```

<!-- 0027.part.md -->

## `events.once(emitter, name[, options])`

-   `emitter` [`<EventEmitter>`](events.md#eventemitter)
-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Может использоваться для отмены ожидания события.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Создает `Promise`, которое будет выполнено, когда `EventEmitter` испустит данное событие, или которое будет отклонено, если `EventEmitter` испустит `'error'` во время ожидания. Обещание `Promise` будет разрешено массивом всех аргументов, испущенных для данного события.

Этот метод намеренно является общим и работает с интерфейсом веб-платформы [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget), который не имеет специальной семантики события `'error'` и не прослушивает событие `'error'`.

```mjs
import { once, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

process.nextTick(() => {
    ee.emit('myevent', 42);
});

const [value] = await once(ee, 'myevent');
console.log(value);

const err = new Error('kaboom');
process.nextTick(() => {
    ee.emit('error', err);
});

try {
    await once(ee, 'myevent');
} catch (err) {
    console.error('произошла ошибка', err);
}
```

```cjs
const { once, EventEmitter } = require('node:events');

async function run() {
    const ee = new EventEmitter();

    process.nextTick(() => {
        ee.emit('myevent', 42);
    });

    const [value] = await once(ee, 'myevent');
    console.log(value);

    const err = new Error('kaboom');
    process.nextTick(() => {
        ee.emit('error', err);
    });

    try {
        await once(ee, 'myevent');
    } catch (err) {
        console.error('произошла ошибка', err);
    }
}

run();
```

Специальная обработка события `'error'` используется только тогда, когда `events.once()` используется для ожидания другого события. Если `events.once()` используется для ожидания самого события '`error'`, то оно рассматривается как любое другое событие без специальной обработки:

```mjs
import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();

once(ee, 'error')
    .then(([err]) => console.log('ok', err.message))
    .catch((err) => console.error('error', err.message));

ee.emit('error', new Error('boom'));

// Выводит: ok boom
```

```cjs
const { EventEmitter, once } = require('node:events');

const ee = new EventEmitter();

once(ee, 'error')
    .then(([err]) => console.log('ok', err.message))
    .catch((err) => console.error('error', err.message));

ee.emit('error', new Error('boom'));

// Выводит: ok boom
```

Для отмены ожидания события можно использовать [`<AbortSignal>`](globals.md#abortsignal):

```mjs
import { EventEmitter, once } from 'node:events';

const ee = new EventEmitter();
const ac = new AbortController();

async function foo(emitter, event, signal) {
    try {
        await once(emitter, event, { signal });
        console.log('event emitted!');
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(
                'Waiting for the event was canceled!'
            );
        } else {
            console.error(
                'There was an error',
                error.message
            );
        }
    }
}

foo(ee, 'foo', ac.signal);
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

```cjs
const { EventEmitter, once } = require('node:events');

const ee = new EventEmitter();
const ac = new AbortController();

async function foo(emitter, event, signal) {
    try {
        await once(emitter, event, { signal });
        console.log('event emitted!');
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(
                'Waiting for the event was canceled!'
            );
        } else {
            console.error(
                'There was an error',
                error.message
            );
        }
    }
}

foo(ee, 'foo', ac.signal);
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

### Ожидание нескольких событий, испускаемых на `process.nextTick()`

При использовании функции `events.once()` для ожидания нескольких событий, испускаемых в одной и той же партии операций `process.nextTick()`, или когда несколько событий испускаются синхронно, стоит обратить внимание на один крайний случай. В частности, поскольку очередь `process.nextTick()` осушается перед очередью микрозадачи `Promise`, и поскольку `EventEmitter` испускает все события синхронно, возможно, что `events.once()` пропустит событие.

```mjs
import { EventEmitter, once } from 'node:events';
import process from 'node:process';

const myEE = new EventEmitter();

async function foo() {
    await once(myEE, 'bar');
    console.log('bar');

    // Это обещание никогда не будет разрешено, потому что событие 'foo' будет
    // уже было вызвано до создания Promise.
    await once(myEE, 'foo');
    console.log('foo');
}

process.nextTick(() => {
    myEE.emit('bar');
    myEE.emit('foo');
});

foo().then(() => console.log('done'));
```

```cjs
const { EventEmitter, once } = require('node:events');

const myEE = new EventEmitter();

async function foo() {
    await once(myEE, 'bar');
    console.log('bar');

    // Это обещание никогда не будет разрешено, потому что событие 'foo' будет
    // уже было вызвано до создания Promise.
    await once(myEE, 'foo');
    console.log('foo');
}

process.nextTick(() => {
    myEE.emit('bar');
    myEE.emit('foo');
});

foo().then(() => console.log('done'));
```

Чтобы поймать оба события, создайте каждое из обещаний _перед_ ожиданием любого из них, тогда станет возможным использовать `Promise.all()`, `Promise.race()` или `Promise.allSettled()`:

```mjs
import { EventEmitter, once } from 'node:events';
import process from 'node:process';

const myEE = new EventEmitter();

async function foo() {
    await Promise.all([
        once(myEE, 'bar'),
        once(myEE, 'foo'),
    ]);
    console.log('foo', 'bar');
}

process.nextTick(() => {
    myEE.emit('bar');
    myEE.emit('foo');
});

foo().then(() => console.log('done'));
```

```cjs
const { EventEmitter, once } = require('node:events');

const myEE = new EventEmitter();

async function foo() {
    await Promise.all([
        once(myEE, 'bar'),
        once(myEE, 'foo'),
    ]);
    console.log('foo', 'bar');
}

process.nextTick(() => {
    myEE.emit('bar');
    myEE.emit('foo');
});

foo().then(() => console.log('done'));
```

<!-- 0029.part.md -->

## `events.captureRejections`

Значение: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Изменение параметра по умолчанию `captureRejections` для всех новых объектов `EventEmitter`.

<!-- 0030.part.md -->

## `events.captureRejectionSymbol`

Значение: `Symbol.for('nodejs.rejection')`.

Посмотрите, как написать пользовательский обработчик [отказа](#emittersymbolfornodejsrejectionerr-eventname-args).

<!-- 0031.part.md -->

## `events.listenerCount(emitter, eventName)`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вместо этого используйте [`emitter.listenerCount()`](#emitterlistenercounteventname).

-   `emitter` [`<EventEmitter>`](events.md#eventemitter) Эмиттер для запроса
-   `eventName` {string|symbol} Имя события

Метод класса, который возвращает количество слушателей для данного `eventName`, зарегистрированных на данном `emitter`.

```mjs
import { EventEmitter, listenerCount } from 'node:events';

const myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(listenerCount(myEmitter, 'event'));
// Печатает: 2
```

```cjs
const {
    EventEmitter,
    listenerCount,
} = require('node:events');

const myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(listenerCount(myEmitter, 'event'));
// Печатает: 2
```

<!-- 0032.part.md -->

## `events.on(emitter, eventName[, options])`

-   `emitter` [`<EventEmitter>`](events.md#eventemitter)
-   `eventName` {string|symbol} Имя события, которое прослушивается
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Может использоваться для отмены ожидающих событий.
-   Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface), итератор событий `eventName`, испускаемых `emitter`.

<!-- конец списка -->

```mjs
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ee = new EventEmitter();

// Эмиттировать позже
process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
});

for await (const event of on(ee, 'foo')) {
    // Выполнение этого внутреннего блока синхронно, и он
    // обрабатывает одно событие за раз (даже с await). Не используйте.
    // если требуется одновременное выполнение.
    console.log(event); // печатает ['bar'] [42]
}
// Недоступно здесь
```

```cjs
const { on, EventEmitter } = require('node:events');

(async () => {
    const ee = new EventEmitter();

    // Эмиттировать позже
    process.nextTick(() => {
        ee.emit('foo', 'bar');
        ee.emit('foo', 42);
    });

    for await (const event of on(ee, 'foo')) {
        // Выполнение этого внутреннего блока синхронно, и он
        // обрабатывает одно событие за раз (даже с await). Не используйте.
        // если требуется одновременное выполнение.
        console.log(event); // печатает ['bar'] [42]
    }
    // недоступно здесь
})();
```

Возвращает `AsyncIterator`, который итерирует события `eventName`. Если `EventEmitter` выдает `'error'`, он будет выброшен. Он удаляет всех слушателей при выходе из цикла. Значение `value`, возвращаемое каждой итерацией, представляет собой массив, состоящий из аргументов испускаемых событий.

Для отмены ожидания событий можно использовать [`<AbortSignal>`](globals.md#abortsignal):

```mjs
import { on, EventEmitter } from 'node:events';
import process from 'node:process';

const ac = new AbortController();

(async () => {
    const ee = new EventEmitter();

    // Эмиттировать позже
    process.nextTick(() => {
        ee.emit('foo', 'bar');
        ee.emit('foo', 42);
    });

    for await (const event of on(ee, 'foo', {
        signal: ac.signal,
    })) {
        // Выполнение этого внутреннего блока синхронно и он
        // обрабатывает одно событие за раз (даже с await). Не используйте.
        // если требуется одновременное выполнение.
        console.log(event); // печатает ['bar'] [42]
    }
    // недоступно здесь
})();

process.nextTick(() => ac.abort());
```

```cjs
const { on, EventEmitter } = require('node:events');

const ac = new AbortController();

(async () => {
    const ee = new EventEmitter();

    // Эмиттировать позже
    process.nextTick(() => {
        ee.emit('foo', 'bar');
        ee.emit('foo', 42);
    });

    for await (const event of on(ee, 'foo', {
        signal: ac.signal,
    })) {
        // Выполнение этого внутреннего блока синхронно и он
        // обрабатывает одно событие за раз (даже с await). Не используйте.
        // если требуется одновременное выполнение.
        console.log(event); // печатает ['bar'] [42]
    }
    // недоступно здесь
})();

process.nextTick(() => ac.abort());
```

<!-- 0033.part.md -->

## `events.setMaxListeners(n[, ...eventTargets])`

-   `n` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Неотрицательное число. Максимальное количество слушателей для каждого события `EventTarget`.
-   `...eventsTargets` {EventTarget\[\]|EventEmitter\[\]} Ноль или более экземпляров {EventTarget} или [`<EventEmitter>`](events.md#eventemitter). Если ни один из них не указан, `n` устанавливается как максимальное значение по умолчанию для всех вновь создаваемых объектов {EventTarget} и [`<EventEmitter>`](events.md#eventemitter).

<!-- конец списка -->

```mjs
import { setMaxListeners, EventEmitter } from 'node:events';

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(5, target, emitter);
```

```cjs
const {
    setMaxListeners,
    EventEmitter,
} = require('node:events');

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(5, target, emitter);
```

<!-- 0034.part.md -->

## Класс: `events.EventEmitterAsyncResource extends EventEmitter`

Интегрирует `EventEmitter` с [`<AsyncResource>`](async_hooks.md#asyncresource) для `EventEmitter`, которые требуют ручного асинхронного отслеживания. В частности, все события, испускаемые экземплярами `events.EventEmitterAsyncResource`, будут выполняться внутри его [async контекста](async_context.md).

```mjs
import {
    EventEmitterAsyncResource,
    EventEmitter,
} from 'node:events';
import { notStrictEqual, strictEqual } from 'node:assert';
import {
    executionAsyncId,
    triggerAsyncId,
} from 'node:async_hooks';

// Инструментарий отслеживания асинхронных процессов определит это как 'Q'.
const ee1 = new EventEmitterAsyncResource({ name: 'Q' });

// Слушатели 'foo' будут запускаться в асинхронном контексте EventEmitters.
ee1.on('foo', () => {
    strictEqual(executionAsyncId(), ee1.asyncId);
    strictEqual(triggerAsyncId(), ee1.triggerAsyncId);
});

const ee2 = new EventEmitter();

// Слушатели 'foo' на обычных EventEmitters, которые не отслеживают async
// контекст, однако, запускаются в том же async контексте, что и emit().
ee2.on('foo', () => {
    notStrictEqual(executionAsyncId(), ee2.asyncId);
    notStrictEqual(triggerAsyncId(), ee2.triggerAsyncId);
});

Promise.resolve().then(() => {
    ee1.emit('foo');
    ee2.emit('foo');
});
```

```cjs
const {
    EventEmitterAsyncResource,
    EventEmitter,
} = require('node:events');
const {
    notStrictEqual,
    strictEqual,
} = require('node:assert');
const {
    executionAsyncId,
    triggerAsyncId,
} = require('node:async_hooks');

// Инструментарий отслеживания асинхронных событий идентифицирует это как 'Q'.
const ee1 = new EventEmitterAsyncResource({ name: 'Q' });

// Слушатели 'foo' будут запускаться в асинхронном контексте EventEmitters.
ee1.on('foo', () => {
    strictEqual(executionAsyncId(), ee1.asyncId);
    strictEqual(triggerAsyncId(), ee1.triggerAsyncId);
});

const ee2 = new EventEmitter();

// Слушатели 'foo' на обычных EventEmitters, которые не отслеживают async
// контекст, однако, запускаются в том же async контексте, что и emit().
ee2.on('foo', () => {
    notStrictEqual(executionAsyncId(), ee2.asyncId);
    notStrictEqual(triggerAsyncId(), ee2.triggerAsyncId);
});

Promise.resolve().then(() => {
    ee1.emit('foo');
    ee2.emit('foo');
});
```

Класс `EventEmitterAsyncResource` имеет те же методы и принимает те же опции, что и `EventEmitter` и `AsyncResource`.

<!-- 0035.part.md -->

### `new events.EventEmitterAsyncResource([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `captureRejections` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включает [автоматическое фиксирование отказов от обещаний](#capture-rejections-of-promises). **По умолчанию:** `false`.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип асинхронного события. **По умолчанию::** [`new.target.name`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target).
    -   `triggerAsyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID контекста выполнения, который создал это асинхронное событие. **По умолчанию:** `executionAsyncId()`.
    -   `requireManualDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `true`, отключает `emitDestroy`, когда объект собирается в мусор. Обычно это значение не нужно устанавливать (даже если `emitDestroy` вызывается вручную), если только не получен `asyncId` ресурса и с ним не вызывается `emitDestroy` чувствительного API. Если установлено значение `false`, вызов `emitDestroy` на сборку мусора будет происходить только при наличии хотя бы одного активного хука `destroy`. **По умолчанию:** `false`.

<!-- 0036.part.md -->

### `eventemitterasyncresource.asyncId`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уникальный `asyncId`, присвоенный ресурсу.

<!-- 0037.part.md -->

### `eventemitterasyncresource.asyncResource`

-   Тип: Базовый [`<AsyncResource>`](async_hooks.md#asyncresource).

Возвращаемый объект `AsyncResource` имеет дополнительное свойство `eventEmitter`, которое предоставляет ссылку на этот `EventEmitterAsyncResource`.

<!-- 0038.part.md -->

### `eventemitterasyncresource.emitDestroy()`.

Вызывает все крючки `destroy`. Эта функция должна быть вызвана только один раз. Если он будет вызван более одного раза, будет выдана ошибка. Это **должно** быть вызвано вручную. Если ресурс оставлен для сбора GC, то крючки `destroy` никогда не будут вызваны.

<!-- 0039.part.md -->

### `eventemitterasyncresource.triggerAsyncId`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тот же `triggerAsyncId`, который передается конструктору `AsyncResource`.

<!-- 0040.part.md -->

## `EventTarget` и `Event` API

Объекты `EventTarget` и `Event` являются специфической для Node.js реализацией [`EventTarget` Web API](https://dom.spec.whatwg.org/#eventtarget), которые открываются некоторыми API ядра Node.js.

```js
const target = new EventTarget();

target.addEventListener('foo', (event) => {
    console.log('событие foo произошло!');
});
```

<!-- 0041.part.md -->

### Node.js `EventTarget` vs. DOM `EventTarget`

Есть два ключевых различия между Node.js `EventTarget` и [`EventTarget` Web API](https://dom.spec.whatwg.org/#eventtarget):

1.  В то время как экземпляры DOM `EventTarget` _могут_ быть иерархическими, в Node.js нет концепции иерархии и распространения событий. То есть, событие, отправленное на `EventTarget`, не распространяется через иерархию вложенных целевых объектов, каждый из которых может иметь свой собственный набор обработчиков для этого события.
2.  В Node.js `EventTarget`, если слушатель события является асинхронной функцией или возвращает `Promise`, и возвращенный `Promise` отклоняется, отказ автоматически перехватывается и обрабатывается так же, как и слушатель, который бросает синхронно (подробности см. в [`EventTarget` error handling](#eventtarget-error-handling)).

<!-- 0042.part.md -->

### `NodeEventTarget` vs. `EventEmitter`

Объект `NodeEventTarget` реализует модифицированное подмножество API `EventEmitter`, что позволяет ему в определенных ситуациях близко _подражать_ `EventEmitter`. Объект `NodeEventTarget` не является экземпляром `EventEmitter` и не может быть использован вместо `EventEmitter` в большинстве случаев.

1.  В отличие от `EventEmitter`, любой данный `listener` может быть зарегистрирован не более одного раза для каждого `типа события`. Попытки зарегистрировать `слушателя` несколько раз игнорируются.
2.  `NodeEventTarget` не эмулирует полный API `EventEmitter`. В частности, не эмулируются API `prependListener()`, `prependOnceListener()`, `rawListeners()` и `errorMonitor`. События `'newListener'` и `'removeListener'` также не будут эмулироваться.
3.  В `NodeEventTarget` не реализовано никакого специального поведения по умолчанию для событий с типом `'error'`.
4.  Цель `NodeEventTarget` поддерживает объекты `EventListener`, а также функции в качестве обработчиков для всех типов событий.

<!-- 0043.part.md -->

### Слушатель события

Слушатели событий, зарегистрированные для события `типа`, могут быть либо функциями JavaScript, либо объектами со свойством `handleEvent`, значением которого является функция.

В любом случае функция-обработчик вызывается с аргументом `event`, переданным в функцию `eventTarget.dispatchEvent()`.

Асинхронные функции могут использоваться в качестве слушателей событий. Если функция-обработчик async отклоняется, отказ фиксируется и обрабатывается, как описано в [`EventTarget` error handling](#eventtarget-error-handling).

Ошибка, вызванная одной функцией-обработчиком, не препятствует вызову других обработчиков.

Возвращаемое значение функции-обработчика игнорируется.

Обработчики всегда вызываются в том порядке, в котором они были добавлены.

Функции обработчика могут изменять объект `event`.

```js
function handler1(event) {
    console.log(event.type); // Выводит 'foo'
    event.a = 1;
}

async function handler2(event) {
    console.log(event.type); // Печатает 'foo'
    console.log(event.a); // Печатает 1
}

const handler3 = {
    handleEvent(event) {
        console.log(event.type); // Печатает 'foo'
    },
};

const handler4 = {
    async handleEvent(event) {
        console.log(event.type); // Печатает 'foo'
    },
};

const target = new EventTarget();

target.addEventListener('foo', handler1);
target.addEventListener('foo', handler2);
target.addEventListener('foo', обработчик3);
target.addEventListener('foo', handler4, { once: true });
```

<!-- 0044.part.md -->

### `EventTarget` обработка ошибок

Когда зарегистрированный слушатель событий бросает (или возвращает Promise, который отклоняет), по умолчанию ошибка рассматривается как не пойманное исключение на `process.nextTick()`. Это означает, что не пойманные исключения в `EventTarget` будут завершать процесс Node.js по умолчанию.

Бросок внутри слушателя события _не_ остановит вызов других зарегистрированных обработчиков.

В `EventTarget` не реализована какая-либо специальная обработка по умолчанию для событий типа `'error'`, как в `EventEmitter`.

В настоящее время ошибки сначала направляются в событие `process.on('error')`, прежде чем достигнут `process.on('uncaughtException')`. Это поведение устарело и будет изменено в будущем выпуске, чтобы привести `EventTarget` в соответствие с другими API Node.js. Любой код, полагающийся на событие `process.on('error')`, должен быть приведен в соответствие с новым поведением.

<!-- 0045.part.md -->

### Класс: `Event`

Объект `Event` является адаптацией [`Event` Web API](https://dom.spec.whatwg.org/#event). Экземпляры создаются внутри Node.js.

<!-- 0046.part.md -->

#### `event.bubbles`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Всегда возвращает `false`.

Этот параметр не используется в Node.js и приведен исключительно для полноты картины.

<!-- 0047.part.md -->

#### `event.cancelBubble`

> Стабильность: 3 - Наследие: Вместо этого используйте [`event.stopPropagation()`](#eventstoppropagation).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Псевдоним для `event.stopPropagation()`, если установлено значение `true`. Он не используется в Node.js и приведен исключительно для полноты.

<!-- 0048.part.md -->

#### `event.cancelable`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Истина, если событие было создано с опцией `cancelable`.

<!-- 0049.part.md -->

#### `event.composed`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Всегда возвращает `false`.

Этот параметр не используется в Node.js и приведен исключительно для полноты картины.

<!-- 0050.part.md -->

#### `event.composedPath()`

Возвращает массив, содержащий текущую `EventTarget` в качестве единственного элемента или пустой, если событие не отправляется. Этот параметр не используется в Node.js и приводится исключительно для полноты картины.

<!-- 0051.part.md -->

#### `event.currentTarget`

-   Тип: {EventTarget} Цель `EventTarget`, диспетчеризирующая событие.

Псевдоним для `event.target`.

<!-- 0052.part.md -->

#### `event.defaultPrevented`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если `cancelable` является `true` и `event.preventDefault()` был вызван.

<!-- 0053.part.md -->

#### `event.eventPhase`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Возвращает `0`, если событие не отправляется, `2`, если отправляется.

Этот параметр не используется в Node.js и приводится исключительно для полноты картины.

<!-- 0054.part.md -->

#### `event.isTrusted`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Событие [`<AbortSignal>`](globals.md#abortsignal) `abort` испускается, если значение `isTrusted` установлено в `true`. Во всех остальных случаях значение `false`.

<!-- 0055.part.md -->

#### `event.preventDefault()`

Устанавливает свойство `defaultPrevented` в `true`, если `cancelable` равно `true`.

<!-- 0056.part.md -->

#### `event.returnValue`

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`event.defaultPrevented`](#eventdefaultprevented).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Истинно, если событие не было отменено.

Значение `event.returnValue` всегда противоположно `event.defaultPrevented`. Этот параметр не используется в Node.js и приводится исключительно для полноты картины.

<!-- 0057.part.md -->

#### `event.srcElement`

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`event.target`](#eventtarget).

-   Тип: {EventTarget} Цель `EventTarget`, диспетчеризирующая событие.

Псевдоним для `event.target`.

<!-- 0058.part.md -->

#### `event.stopImmediatePropagation()`

Останавливает вызов слушателей событий после завершения текущего.

<!-- 0059.part.md -->

#### `event.stopPropagation()`

Это не используется в Node.js и приводится исключительно для полноты картины.

<!-- 0060.part.md -->

#### `event.target`

-   Тип: {EventTarget} Цель `EventTarget`, диспетчеризирующая событие.

<!-- 0061.part.md -->

#### `event.timeStamp`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Миллисекундная метка времени, когда был создан объект `Event`.

<!-- 0062.part.md -->

#### `event.type`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Идентификатор типа события.

<!-- 0063.part.md -->

### Класс: `EventTarget`

<!-- 0064.part.md -->

#### `eventTarget.addEventListener(type, listener[, options])`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `listener` {Function|EventListener}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `once` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, слушатель автоматически удаляется при первом вызове. **По умолчанию:** `false`.
    -   `passive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Когда `true`, служит подсказкой, что слушатель не будет вызывать метод `preventDefault()` объекта `Event`. **По умолчанию:** `false`.
    -   `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Не используется непосредственно в Node.js. Добавлен для полноты API. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Слушатель будет удален при вызове метода `abort()` данного объекта AbortSignal.

Добавляет новый обработчик для события `type`. Любой заданный `listener` добавляется только один раз для каждого `type` и для каждого значения опции `capture`.

Если опция `once` имеет значение `true`, то `слушатель` будет удален после следующего отправления события `type`.

Опция `capture` не используется Node.js каким-либо функциональным образом, кроме отслеживания зарегистрированных слушателей событий в соответствии со спецификацией `EventTarget`. В частности, опция `capture` используется как часть ключа при регистрации `слушателя`. Любой отдельный `слушатель` может быть добавлен один раз с `capture = false` и один раз с `capture = true`.

```js
function handler(event) {}

const target = new EventTarget();
target.addEventListener('foo', handler, { capture: true }); // сначала
target.addEventListener('foo', handler, { capture: false }); // второй

// Удаляет второй экземпляр обработчика
target.removeEventListener('foo', handler);

// Удаляет первый экземпляр обработчика
target.removeEventListener('foo', handler, {
    capture: true,
});
```

<!-- 0065.part.md -->

#### `eventTarget.dispatchEvent(event)`

-   `event` {Event}
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если либо значение атрибута `cancelable` события равно false, либо его метод `preventDefault()` не был вызван, иначе `false`.

Отправляет `событие` в список обработчиков для `event.type`.

Зарегистрированные обработчики событий синхронно вызываются в том порядке, в котором они были зарегистрированы.

<!-- 0066.part.md -->

#### `eventTarget.removeEventListener(type, listener[, options])`

-   `тип` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `listener` {Function|EventListener}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Удаляет `listener` из списка обработчиков события `type`.

<!-- 0067.part.md -->

### Класс: `CustomEvent`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   Расширяет: {Event}

Объект `CustomEvent` является адаптацией [`CustomEvent` Web API](https://dom.spec.whatwg.org/#customevent). Экземпляры создаются внутри Node.js.

<!-- 0068.part.md -->

#### `event.detail`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Возвращает пользовательские данные, переданные при инициализации.

Только для чтения.

<!-- 0069.part.md -->

### Класс: `NodeEventTarget`

-   Расширяет: {EventTarget}

`NodeEventTarget` - это специфическое для Node.js расширение `EventTarget`, которое эмулирует часть API `EventEmitter`.

<!-- 0070.part.md -->

#### `nodeEventTarget.addListener(type, listener)`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   `listener` {Function|EventListener}

-   Возвращает: {EventTarget} this

Node.js-специфическое расширение класса `EventTarget`, которое эмулирует эквивалентный API `EventEmitter`. Единственное различие между `addListener()` и `addEventListener()` заключается в том, что `addListener()` возвращает ссылку на `EventTarget`.

<!-- 0071.part.md -->

#### `nodeEventTarget.eventNames()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Node.js-специфическое расширение класса `EventTarget`, которое возвращает массив имен событий `типа`, для которых зарегистрированы слушатели событий.

<!-- 0072.part.md -->

#### `nodeEventTarget.listenerCount(type)`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Node.js-специфическое расширение класса `EventTarget`, которое возвращает количество слушателей событий, зарегистрированных для `type`.

<!-- 0073.part.md -->

#### `nodeEventTarget.setMaxListeners(n)`

-   `n` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Node.js-специфическое расширение класса `EventTarget`, которое устанавливает число максимальных слушателей событий как `n`.

<!-- 0074.part.md -->

#### `nodeEventTarget.getMaxListeners()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Node.js-специфическое расширение класса `EventTarget`, которое возвращает количество максимальных слушателей событий.

<!-- 0075.part.md -->

#### `nodeEventTarget.off(type, listener[, options])`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `listener` {Function|EventListener}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
-   Возвращает: {EventTarget} this

Node.js-специфический псевдоним для `eventTarget.removeListener()`.

<!-- 0076.part.md -->

#### `nodeEventTarget.on(type, listener)`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   `listener` {Function|EventListener}

-   Возвращает: {EventTarget} this

Node.js-специфический псевдоним для `eventTarget.addListener()`.

<!-- 0077.part.md -->

#### `nodeEventTarget.once(type, listener)`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   `listener` {Function|EventListener}

-   Возвращает: {EventTarget} this

Node.js-специфическое расширение класса `EventTarget`, которое добавляет `once` слушателя для заданного `type` события. Это эквивалентно вызову `on` с опцией `once`, установленной в `true`.

<!-- 0078.part.md -->

#### `nodeEventTarget.removeAllListeners([type])`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   Возвращает: {EventTarget} this

Специфическое для Node.js расширение класса `EventTarget`. Если указан `type`, удаляет всех зарегистрированных слушателей для `type`, в противном случае удаляет всех зарегистрированных слушателей.

<!-- 0079.part.md -->

#### `nodeEventTarget.removeListener(type, listener[, options])`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

-   `listener` {Function|EventListener}

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

    -   `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

-   Возвращает: {EventTarget} this

Node.js-специфическое расширение класса `EventTarget`, которое удаляет `слушателя` для заданного `типа`. Единственная разница между `removeListener()` и `removeEventListener()` заключается в том, что `removeListener()` возвращает ссылку на `EventTarget`.

<!-- 0080.part.md -->
