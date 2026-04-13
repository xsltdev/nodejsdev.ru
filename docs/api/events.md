---
title: События
description: Модуль node:events, EventEmitter, слушатели, порядок вызова и обработка ошибок
---

# События

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/events.html)

<!--introduced_in=v0.10.0-->

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!--type=module-->

<!-- source_link=lib/events.js -->

Большая часть API ядра Node.js построена вокруг идиоматической асинхронной
событийно-ориентированной архитектуры: объекты определённых типов («эмиттеры»)
испускают именованные события, из‑за которых вызываются объекты `Function`
(«слушатели»).

Например, объект [`net.Server`][`net.Server`] испускает событие при каждом подключении пира;
[`fs.ReadStream`][`fs.ReadStream`] — когда файл открыт; [stream][stream] — когда данные доступны для чтения.

Все объекты, которые испускают события, являются экземплярами класса `EventEmitter`.
У них есть метод `eventEmitter.on()`, позволяющий привязать одну или несколько
функций к именованным событиям. Обычно имена событий — строки в camelCase, но
допустим любой корректный ключ свойства JavaScript.

Когда `EventEmitter` испускает событие, все функции, привязанные к этому событию,
вызываются _синхронно_. Возвращаемые слушателями значения _игнорируются_.

Ниже — простой экземпляр `EventEmitter` с одним слушателем: `eventEmitter.on()`
регистрирует слушателей, `eventEmitter.emit()` инициирует событие.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    
    class MyEmitter extends EventEmitter {}
    
    const myEmitter = new MyEmitter();
    myEmitter.on('event', () => {
      console.log('an event occurred!');
    });
    myEmitter.emit('event');
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    
    class MyEmitter extends EventEmitter {}
    
    const myEmitter = new MyEmitter();
    myEmitter.on('event', () => {
      console.log('an event occurred!');
    });
    myEmitter.emit('event');
    ```

## Передача аргументов и `this` слушателям

Метод `eventEmitter.emit()` может передать слушателям произвольный набор аргументов.
Для обычной функции-слушателя ключевое слово `this` намеренно указывает на экземпляр
`EventEmitter`, к которому привязан слушатель.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('event', function(a, b) {
      console.log(a, b, this, this === myEmitter);
      // Prints:
      //   a b MyEmitter {
      //     _events: [Object: null prototype] { event: [Function (anonymous)] },
      //     _eventsCount: 1,
      //     _maxListeners: undefined,
      //     Symbol(shapeMode): false,
      //     Symbol(kCapture): false
      //   } true
    });
    myEmitter.emit('event', 'a', 'b');
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('event', function(a, b) {
      console.log(a, b, this, this === myEmitter);
      // Prints:
      //   a b MyEmitter {
      //     _events: [Object: null prototype] { event: [Function (anonymous)] },
      //     _eventsCount: 1,
      //     _maxListeners: undefined,
      //     Symbol(shapeMode): false,
      //     Symbol(kCapture): false
      //   } true
    });
    myEmitter.emit('event', 'a', 'b');
    ```

В качестве слушателей можно использовать стрелочные функции ES6, но тогда `this`
уже не ссылается на экземпляр `EventEmitter`:

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('event', (a, b) => {
      console.log(a, b, this);
      // Prints: a b undefined
    });
    myEmitter.emit('event', 'a', 'b');
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('event', (a, b) => {
      console.log(a, b, this);
      // Prints: a b {}
    });
    myEmitter.emit('event', 'a', 'b');
    ```

## Асинхронность и синхронность

`EventEmitter` вызывает всех слушателей синхронно в порядке регистрации. Так
сохраняется нужный порядок событий и снижается риск гонок и логических ошибок.
При необходимости слушатель может перейти к асинхронной работе через `setImmediate()`
или `process.nextTick()`:

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('event', (a, b) => {
      setImmediate(() => {
        console.log('this happens asynchronously');
      });
    });
    myEmitter.emit('event', 'a', 'b');
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('event', (a, b) => {
      setImmediate(() => {
        console.log('this happens asynchronously');
      });
    });
    myEmitter.emit('event', 'a', 'b');
    ```

## Событие только один раз

Когда слушатель зарегистрирован с помощью метода `eventEmitter.on()`, этот
слушатель вызывается _каждый раз_, когда испускается именованное событие.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    let m = 0;
    myEmitter.on('event', () => {
      console.log(++m);
    });
    myEmitter.emit('event');
    // Prints: 1
    myEmitter.emit('event');
    // Prints: 2
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    let m = 0;
    myEmitter.on('event', () => {
      console.log(++m);
    });
    myEmitter.emit('event');
    // Prints: 1
    myEmitter.emit('event');
    // Prints: 2
    ```

Используя метод `eventEmitter.once()`, можно зарегистрировать слушатель,
который вызывается не более одного раза для данного события. Как только событие
испущено, слушатель снимается с регистрации и _затем_ вызывается.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    let m = 0;
    myEmitter.once('event', () => {
      console.log(++m);
    });
    myEmitter.emit('event');
    // Prints: 1
    myEmitter.emit('event');
    // Ignored
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    let m = 0;
    myEmitter.once('event', () => {
      console.log(++m);
    });
    myEmitter.emit('event');
    // Prints: 1
    myEmitter.emit('event');
    // Ignored
    ```

## События ошибок

Когда в экземпляре `EventEmitter` возникает ошибка, обычно испускается событие
`'error'`. В Node.js такие случаи обрабатываются особым образом.

Если у `EventEmitter` _нет_ хотя бы одного слушателя, зарегистрированного для
события `'error'`, и при этом испускается `'error'`, ошибка пробрасывается,
печатается трассировка стека и процесс Node.js завершается.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.emit('error', new Error('whoops!'));
    // Throws and crashes Node.js
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.emit('error', new Error('whoops!'));
    // Throws and crashes Node.js
    ```

Чтобы снизить риск аварийного завершения процесса Node.js, можно использовать
модуль [`domain`][`domain`]. (Однако модуль `node:domain` устарел.)

Рекомендуется всегда добавлять слушателей для событий `'error'`.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('error', (err) => {
      console.error('whoops! there was an error');
    });
    myEmitter.emit('error', new Error('whoops!'));
    // Prints: whoops! there was an error
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    const myEmitter = new MyEmitter();
    myEmitter.on('error', (err) => {
      console.error('whoops! there was an error');
    });
    myEmitter.emit('error', new Error('whoops!'));
    // Prints: whoops! there was an error
    ```

Можно отслеживать события `'error'`, не «поглощая» переданную ошибку, установив
слушателя с символом `events.errorMonitor`.

=== "MJS"

    ```js
    import { EventEmitter, errorMonitor } from 'node:events';
    
    const myEmitter = new EventEmitter();
    myEmitter.on(errorMonitor, (err) => {
      MyMonitoringTool.log(err);
    });
    myEmitter.emit('error', new Error('whoops!'));
    // Still throws and crashes Node.js
    ```

=== "CJS"

    ```js
    const { EventEmitter, errorMonitor } = require('node:events');
    
    const myEmitter = new EventEmitter();
    myEmitter.on(errorMonitor, (err) => {
      MyMonitoringTool.log(err);
    });
    myEmitter.emit('error', new Error('whoops!'));
    // Still throws and crashes Node.js
    ```

## Перехват отклонений промисов

Использование функций `async` в обработчиках событий неудобно: при выброшенном
исключении возможен необработанный отказ промиса:

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    const ee = new EventEmitter();
    ee.on('something', async (value) => {
      throw new Error('kaboom');
    });
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    const ee = new EventEmitter();
    ee.on('something', async (value) => {
      throw new Error('kaboom');
    });
    ```

Опция `captureRejections` в конструкторе `EventEmitter` или глобальная настройка
меняют это поведение, устанавливая на `Promise` обработчик `.then(undefined, handler)`.
Он асинхронно передаёт исключение в метод [`Symbol.for('nodejs.rejection')`][rejection],
если он есть, иначе — в обработчик события [`'error'`][error].

=== "MJS"

    ```js
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

=== "CJS"

    ```js
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

Установка `events.captureRejections = true` меняет значение по умолчанию для всех
новых экземпляров `EventEmitter`.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    
    EventEmitter.captureRejections = true;
    const ee1 = new EventEmitter();
    ee1.on('something', async (value) => {
      throw new Error('kaboom');
    });
    
    ee1.on('error', console.log);
    ```

=== "CJS"

    ```js
    const events = require('node:events');
    events.captureRejections = true;
    const ee1 = new events.EventEmitter();
    ee1.on('something', async (value) => {
      throw new Error('kaboom');
    });
    
    ee1.on('error', console.log);
    ```

События `'error'`, порождённые поведением `captureRejections`, не получают
обработчика `catch`, чтобы избежать бесконечных циклов ошибок; рекомендуется
**не использовать функции `async` в качестве обработчиков события `'error'`**.

## Класс: `EventEmitter`

<!-- YAML
added: v0.1.26
changes:
  - version:
     - v13.4.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/27867
    description: Added captureRejections option.
-->

Добавлено в: v0.1.26

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v13.4.0, v12.16.0 | Добавлена ​​опция captureRejections. |

Класс `EventEmitter` определяется и экспортируется модулем `node:events`:

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    ```

Все экземпляры `EventEmitter` испускают событие `'newListener'` при добавлении
новых слушателей и `'removeListener'` при удалении существующих.

Поддерживается следующая опция:

* `captureRejections` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включает
  [автоматический перехват отклонений промисов][capturerejections].
  **По умолчанию:** `false`.

### Событие: `'newListener'`

<!-- YAML
added: v0.1.26
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя прослушиваемого события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обработчика события

Экземпляр `EventEmitter` испускает собственное событие `'newListener'` _до_ того,
как слушатель будет добавлен во внутренний массив слушателей.

Слушателям события `'newListener'` передаются имя события и ссылка на добавляемый
слушатель.

То, что событие срабатывает до добавления слушателя, даёт тонкий, но важный
побочный эффект: любые _дополнительные_ слушатели, зарегистрированные на то же
`name` _внутри_ обратного вызова `'newListener'`, вставляются _перед_
слушателем, который в процессе добавления.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    class MyEmitter extends EventEmitter {}
    
    const myEmitter = new MyEmitter();
    // Only do this once so we don't loop forever
    myEmitter.once('newListener', (event, listener) => {
      if (event === 'event') {
        // Insert a new listener in front
        myEmitter.on('event', () => {
          console.log('B');
        });
      }
    });
    myEmitter.on('event', () => {
      console.log('A');
    });
    myEmitter.emit('event');
    // Prints:
    //   B
    //   A
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    class MyEmitter extends EventEmitter {}
    
    const myEmitter = new MyEmitter();
    // Only do this once so we don't loop forever
    myEmitter.once('newListener', (event, listener) => {
      if (event === 'event') {
        // Insert a new listener in front
        myEmitter.on('event', () => {
          console.log('B');
        });
      }
    });
    myEmitter.on('event', () => {
      console.log('A');
    });
    myEmitter.emit('event');
    // Prints:
    //   B
    //   A
    ```

### Событие: `'removeListener'`

<!-- YAML
added: v0.9.3
changes:
  - version:
    - v6.1.0
    - v4.7.0
    pr-url: https://github.com/nodejs/node/pull/6394
    description: For listeners attached using `.once()`, the `listener` argument
                 now yields the original listener function.
-->

Добавлено в: v0.9.3

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v6.1.0, v4.7.0 | Для прослушивателей, подключенных с помощью `.once()`, аргумент `listener` теперь возвращает исходную функцию прослушивателя. |

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обработчика события

Событие `'removeListener'` испускается _после_ удаления `listener`.

### `emitter.addListener(eventName, listener)`

<!-- YAML
added: v0.1.26
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Псевдоним для `emitter.on(eventName, listener)`.

### `emitter.emit(eventName[, ...args])`

<!-- YAML
added: v0.1.26
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Синхронно вызывает каждого из слушателей, зарегистрированных для события
`eventName`, в порядке регистрации, передавая им указанные аргументы.

Возвращает `true`, если у события были слушатели, иначе `false`.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    const myEmitter = new EventEmitter();
    
    // First listener
    myEmitter.on('event', function firstListener() {
      console.log('Helloooo! first listener');
    });
    // Second listener
    myEmitter.on('event', function secondListener(arg1, arg2) {
      console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
    });
    // Third listener
    myEmitter.on('event', function thirdListener(...args) {
      const parameters = args.join(', ');
      console.log(`event with parameters ${parameters} in third listener`);
    });
    
    console.log(myEmitter.listeners('event'));
    
    myEmitter.emit('event', 1, 2, 3, 4, 5);
    
    // Prints:
    // [
    //   [Function: firstListener],
    //   [Function: secondListener],
    //   [Function: thirdListener]
    // ]
    // Helloooo! first listener
    // event with parameters 1, 2 in second listener
    // event with parameters 1, 2, 3, 4, 5 in third listener
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    const myEmitter = new EventEmitter();
    
    // First listener
    myEmitter.on('event', function firstListener() {
      console.log('Helloooo! first listener');
    });
    // Second listener
    myEmitter.on('event', function secondListener(arg1, arg2) {
      console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
    });
    // Third listener
    myEmitter.on('event', function thirdListener(...args) {
      const parameters = args.join(', ');
      console.log(`event with parameters ${parameters} in third listener`);
    });
    
    console.log(myEmitter.listeners('event'));
    
    myEmitter.emit('event', 1, 2, 3, 4, 5);
    
    // Prints:
    // [
    //   [Function: firstListener],
    //   [Function: secondListener],
    //   [Function: thirdListener]
    // ]
    // Helloooo! first listener
    // event with parameters 1, 2 in second listener
    // event with parameters 1, 2, 3, 4, 5 in third listener
    ```

### `emitter.eventNames()`

<!-- YAML
added: v6.0.0
-->

* Возвращает: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<symbol[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)

Возвращает массив имён событий, для которых у эмиттера зарегистрированы
слушатели.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    
    const myEE = new EventEmitter();
    myEE.on('foo', () => {});
    myEE.on('bar', () => {});
    
    const sym = Symbol('symbol');
    myEE.on(sym, () => {});
    
    console.log(myEE.eventNames());
    // Prints: [ 'foo', 'bar', Symbol(symbol) ]
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    
    const myEE = new EventEmitter();
    myEE.on('foo', () => {});
    myEE.on('bar', () => {});
    
    const sym = Symbol('symbol');
    myEE.on(sym, () => {});
    
    console.log(myEE.eventNames());
    // Prints: [ 'foo', 'bar', Symbol(symbol) ]
    ```

### `emitter.getMaxListeners()`

<!-- YAML
added: v1.0.0
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает текущее максимальное число слушателей для `EventEmitter` — либо
заданное через [`emitter.setMaxListeners(n)`][`emitter.setMaxListeners(n)`], либо по умолчанию
[`events.defaultMaxListeners`][`events.defaultMaxListeners`].

### `emitter.listenerCount(eventName[, listener])`

<!-- YAML
added: v3.2.0
changes:
  - version:
    - v19.8.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46523
    description: Added the `listener` argument.
-->

Добавлено в: v3.2.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.8.0, v18.16.0 | Добавлен аргумент «слушатель». |

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя прослушиваемого события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обработчика события
* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает число слушателей события `eventName`.
Если передан `listener`, возвращается, сколько раз этот обработчик встречается
в списке слушателей события.

### `emitter.listeners(eventName)`

<!-- YAML
added: v0.1.26
changes:
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/6881
    description: For listeners attached using `.once()` this returns the
                 original listeners instead of wrapper functions now.
-->

Добавлено в: v0.1.26

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v7.0.0 | Для прослушивателей, подключенных с помощью .once(), теперь возвращаются исходные прослушиватели вместо функций-оболочек. |

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* Возвращает: [<Function[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Возвращает копию массива слушателей для события `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

### `emitter.off(eventName, listener)`

<!-- YAML
added: v10.0.0
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Псевдоним для [`emitter.removeListener()`][`emitter.removeListener()`].

### `emitter.on(eventName, listener)`

<!-- YAML
added: v0.1.101
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Добавляет функцию `listener` в конец массива слушателей для события `eventName`.
Проверка, не добавлен ли `listener` ранее, не выполняется. Повторные вызовы с той
же парой `eventName` и `listener` приведут к многократному добавлению и вызову
обработчика.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

По умолчанию слушатели вызываются в порядке добавления. Альтернатива —
`emitter.prependListener()`, чтобы добавить слушателя в начало массива.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    const myEE = new EventEmitter();
    myEE.on('foo', () => console.log('a'));
    myEE.prependListener('foo', () => console.log('b'));
    myEE.emit('foo');
    // Prints:
    //   b
    //   a
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    const myEE = new EventEmitter();
    myEE.on('foo', () => console.log('a'));
    myEE.prependListener('foo', () => console.log('b'));
    myEE.emit('foo');
    // Prints:
    //   b
    //   a
    ```

### `emitter.once(eventName, listener)`

<!-- YAML
added: v0.3.0
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Добавляет **одноразовую** функцию `listener` для события `eventName`. При
следующем срабатывании `eventName` этот слушатель удаляется, затем вызывается.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

По умолчанию слушатели вызываются в порядке добавления. Альтернатива —
`emitter.prependOnceListener()`, чтобы добавить одноразового слушателя в начало
массива.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    const myEE = new EventEmitter();
    myEE.once('foo', () => console.log('a'));
    myEE.prependOnceListener('foo', () => console.log('b'));
    myEE.emit('foo');
    // Prints:
    //   b
    //   a
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    const myEE = new EventEmitter();
    myEE.once('foo', () => console.log('a'));
    myEE.prependOnceListener('foo', () => console.log('b'));
    myEE.emit('foo');
    // Prints:
    //   b
    //   a
    ```

### `emitter.prependListener(eventName, listener)`

<!-- YAML
added: v6.0.0
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Добавляет функцию `listener` в _начало_ массива слушателей для события
`eventName`. Проверка, не добавлен ли `listener` ранее, не выполняется.
Повторные вызовы с той же парой `eventName` и `listener` приведут к многократному
добавлению и вызову обработчика.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

### `emitter.prependOnceListener(eventName, listener)`

<!-- YAML
added: v6.0.0
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя события
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция обратного вызова
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Добавляет **одноразовую** функцию `listener` для события `eventName` в _начало_
массива слушателей. При следующем срабатывании `eventName` этот слушатель
удаляется, затем вызывается.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

### `emitter.removeAllListeners([eventName])`

<!-- YAML
added: v0.1.26
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Удаляет всех слушателей или только слушателей указанного `eventName`.

Плохая практика — удалять слушателей, добавленных в другом месте кода, особенно
если экземпляр `EventEmitter` создан другим компонентом или модулем (например
сокеты или файловые потоки).

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

### `emitter.removeListener(eventName, listener)`

<!-- YAML
added: v0.1.26
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

Удаляет указанный `listener` из массива слушателей события `eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` удаляет не более одного вхождения слушателя из массива.
Если один и тот же обработчик был добавлен несколько раз для `eventName`,
`removeListener()` нужно вызывать столько раз, сколько раз он был добавлен.

Когда событие испускается, вызываются все слушатели, привязанные к нему на момент
вызова `emit()`, по порядку. Это значит, что вызовы `removeListener()` или
`removeAllListeners()` _после_ начала `emit()`, но _до_ завершения последнего
слушателя, не уберут их из текущего `emit()`. Последующие события ведут себя как
ожидается.

=== "MJS"

    ```js
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
    
    // callbackA removes listener callbackB but it will still be called.
    // Internal listener array at time of emit [callbackA, callbackB]
    myEmitter.emit('event');
    // Prints:
    //   A
    //   B
    
    // callbackB is now removed.
    // Internal listener array [callbackA]
    myEmitter.emit('event');
    // Prints:
    //   A
    ```

=== "CJS"

    ```js
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
    
    // callbackA removes listener callbackB but it will still be called.
    // Internal listener array at time of emit [callbackA, callbackB]
    myEmitter.emit('event');
    // Prints:
    //   A
    //   B
    
    // callbackB is now removed.
    // Internal listener array [callbackA]
    myEmitter.emit('event');
    // Prints:
    //   A
    ```

Так как слушатели хранятся во внутреннем массиве, этот вызов меняет индексы
любых слушателей, зарегистрированных _после_ удаляемого. На порядок вызова это
не влияет, но копии массива, возвращённые `emitter.listeners()`, нужно получить
заново.

Если одна и та же функция добавлена несколько раз как обработчик одного события
(как в примере ниже), `removeListener()` удалит самое недавно добавленное
вхождение. В примере снимается слушатель `once('ping')`:

=== "MJS"

    ```js
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

=== "CJS"

    ```js
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

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

### `emitter.setMaxListeners(n)`

<!-- YAML
added: v0.3.5
-->

* `n` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
* Возвращает: [`<EventEmitter>`](events.md#class-eventemitter)

По умолчанию у `EventEmitter` выводится предупреждение, если для одного события
добавлено более `10` слушателей. Это удобное ограничение для поиска утечек
памяти. `emitter.setMaxListeners()` позволяет изменить лимит для данного
экземпляра. Значение `Infinity` (или `0`) означает неограниченное число
слушателей.

Возвращает ссылку на `EventEmitter`, чтобы можно было вызывать методы цепочкой.

### `emitter.rawListeners(eventName)`

<!-- YAML
added: v9.4.0
-->

* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* Возвращает: [<Function[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Возвращает копию массива слушателей для события `eventName`, включая обёртки
(например созданные `.once()`).

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    const emitter = new EventEmitter();
    emitter.once('log', () => console.log('log once'));
    
    // Returns a new Array with a function `onceWrapper` which has a property
    // `listener` which contains the original listener bound above
    const listeners = emitter.rawListeners('log');
    const logFnWrapper = listeners[0];
    
    // Logs "log once" to the console and does not unbind the `once` event
    logFnWrapper.listener();
    
    // Logs "log once" to the console and removes the listener
    logFnWrapper();
    
    emitter.on('log', () => console.log('log persistently'));
    // Will return a new Array with a single function bound by `.on()` above
    const newListeners = emitter.rawListeners('log');
    
    // Logs "log persistently" twice
    newListeners[0]();
    emitter.emit('log');
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    const emitter = new EventEmitter();
    emitter.once('log', () => console.log('log once'));
    
    // Returns a new Array with a function `onceWrapper` which has a property
    // `listener` which contains the original listener bound above
    const listeners = emitter.rawListeners('log');
    const logFnWrapper = listeners[0];
    
    // Logs "log once" to the console and does not unbind the `once` event
    logFnWrapper.listener();
    
    // Logs "log once" to the console and removes the listener
    logFnWrapper();
    
    emitter.on('log', () => console.log('log persistently'));
    // Will return a new Array with a single function bound by `.on()` above
    const newListeners = emitter.rawListeners('log');
    
    // Logs "log persistently" twice
    newListeners[0]();
    emitter.emit('log');
    ```

### `emitter[Symbol.for('nodejs.rejection')](err, eventName[, ...args])`

<!-- YAML
added:
 - v13.4.0
 - v12.16.0
changes:
  - version:
    - v17.4.0
    - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41267
    description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.4.0, v16.14.0 | Больше не экспериментально. |

* `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Метод `Symbol.for('nodejs.rejection')` вызывается при отклонении промиса при
испускании события, если у эмиттера включён [`captureRejections`][capturerejections].
Вместо `Symbol.for('nodejs.rejection')` можно использовать
[`events.captureRejectionSymbol`][rejectionsymbol].

=== "MJS"

    ```js
    import { EventEmitter, captureRejectionSymbol } from 'node:events';
    
    class MyClass extends EventEmitter {
      constructor() {
        super({ captureRejections: true });
      }
    
      [captureRejectionSymbol](err, event, ...args) {
        console.log('rejection happened for', event, 'with', err, ...args);
        this.destroy(err);
      }
    
      destroy(err) {
        // Tear the resource down here.
      }
    }
    ```

=== "CJS"

    ```js
    const { EventEmitter, captureRejectionSymbol } = require('node:events');
    
    class MyClass extends EventEmitter {
      constructor() {
        super({ captureRejections: true });
      }
    
      [captureRejectionSymbol](err, event, ...args) {
        console.log('rejection happened for', event, 'with', err, ...args);
        this.destroy(err);
      }
    
      destroy(err) {
        // Tear the resource down here.
      }
    }
    ```

## `events.defaultMaxListeners`

<!-- YAML
added: v0.11.2
-->

По умолчанию для любого одного события можно зарегистрировать не более `10`
слушателей. Лимит для отдельных экземпляров `EventEmitter` меняется методом
[`emitter.setMaxListeners(n)`][`emitter.setMaxListeners(n)`]. Чтобы изменить значение по умолчанию для всех
экземпляров `EventEmitter`, используется свойство `events.defaultMaxListeners`.
Если оно не положительное число, выбрасывается `RangeError`.

Будьте осторожны при изменении `events.defaultMaxListeners`: это затрагивает
все экземпляры `EventEmitter`, в том числе созданные до изменения. Вызов
[`emitter.setMaxListeners(n)`][`emitter.setMaxListeners(n)`] по-прежнему имеет приоритет над
`events.defaultMaxListeners`.

Это не жёсткий предел: экземпляр `EventEmitter` позволит добавить больше
слушателей, но выведет в stderr предупреждение с трассировкой о возможной утечке
памяти `EventEmitter`. Для одного `EventEmitter` временно обойти предупреждение
можно через `emitter.getMaxListeners()` и `emitter.setMaxListeners()`:

`defaultMaxListeners` не действует на экземпляры `AbortSignal`. Для отдельных
`AbortSignal` по-прежнему можно задать порог через [`emitter.setMaxListeners(n)`][`emitter.setMaxListeners(n)`],
но по умолчанию `AbortSignal` предупреждения не выводят.

=== "MJS"

    ```js
    import { EventEmitter } from 'node:events';
    const emitter = new EventEmitter();
    emitter.setMaxListeners(emitter.getMaxListeners() + 1);
    emitter.once('event', () => {
      // do stuff
      emitter.setMaxListeners(Math.max(emitter.getMaxListeners() - 1, 0));
    });
    ```

=== "CJS"

    ```js
    const EventEmitter = require('node:events');
    const emitter = new EventEmitter();
    emitter.setMaxListeners(emitter.getMaxListeners() + 1);
    emitter.once('event', () => {
      // do stuff
      emitter.setMaxListeners(Math.max(emitter.getMaxListeners() - 1, 0));
    });
    ```

Флаг командной строки [`--trace-warnings`][`--trace-warnings`] включает вывод трассировки стека для
таких предупреждений.

Испущенное предупреждение можно разобрать в [`process.on('warning')`][`process.on('warning')`]: у него
дополнительно есть свойства `emitter`, `type` и `count` — соответственно
эмиттер, имя события и число подключённых слушателей.
Свойство `name` равно `'MaxListenersExceededWarning'`.

## `events.errorMonitor`

<!-- YAML
added:
 - v13.6.0
 - v12.17.0
-->

Этот символ предназначен для установки слушателя, который только наблюдает за
событиями `'error'`. Такие слушатели вызываются до обычных обработчиков `'error'`.

Установка слушателя с этим символом не меняет поведение при испускании `'error'`:
если нет обычного слушателя `'error'`, процесс по-прежнему завершится с ошибкой.

## `events.getEventListeners(emitterOrTarget, eventName)`

<!-- YAML
added:
 - v15.2.0
 - v14.17.0
-->

* `emitterOrTarget` [`<EventEmitter>`](events.md#class-eventemitter) | [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget)
* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* Возвращает: [<Function[]>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Возвращает копию массива слушателей для события `eventName`.

Для `EventEmitter` это эквивалентно вызову `.listeners` у эмиттера.

Для `EventTarget` это единственный способ получить список слушателей цели
событий; удобно для отладки и диагностики.

=== "MJS"

    ```js
    import { getEventListeners, EventEmitter } from 'node:events';
    
    {
      const ee = new EventEmitter();
      const listener = () => console.log('Events are fun');
      ee.on('foo', listener);
      console.log(getEventListeners(ee, 'foo')); // [ [Function: listener] ]
    }
    {
      const et = new EventTarget();
      const listener = () => console.log('Events are fun');
      et.addEventListener('foo', listener);
      console.log(getEventListeners(et, 'foo')); // [ [Function: listener] ]
    }
    ```

=== "CJS"

    ```js
    const { getEventListeners, EventEmitter } = require('node:events');
    
    {
      const ee = new EventEmitter();
      const listener = () => console.log('Events are fun');
      ee.on('foo', listener);
      console.log(getEventListeners(ee, 'foo')); // [ [Function: listener] ]
    }
    {
      const et = new EventTarget();
      const listener = () => console.log('Events are fun');
      et.addEventListener('foo', listener);
      console.log(getEventListeners(et, 'foo')); // [ [Function: listener] ]
    }
    ```

## `events.getMaxListeners(emitterOrTarget)`

<!-- YAML
added:
  - v19.9.0
  - v18.17.0
-->

* `emitterOrTarget` [`<EventEmitter>`](events.md#class-eventemitter) | [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget)
* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает текущее максимальное число слушателей.

Для `EventEmitter` это эквивалентно вызову `.getMaxListeners` у эмиттера.

Для `EventTarget` это единственный способ узнать лимит слушателей. Если число
обработчиков у одного `EventTarget` превышает установленный максимум, выводится
предупреждение.

=== "MJS"

    ```js
    import { getMaxListeners, setMaxListeners, EventEmitter } from 'node:events';
    
    {
      const ee = new EventEmitter();
      console.log(getMaxListeners(ee)); // 10
      setMaxListeners(11, ee);
      console.log(getMaxListeners(ee)); // 11
    }
    {
      const et = new EventTarget();
      console.log(getMaxListeners(et)); // 10
      setMaxListeners(11, et);
      console.log(getMaxListeners(et)); // 11
    }
    ```

=== "CJS"

    ```js
    const { getMaxListeners, setMaxListeners, EventEmitter } = require('node:events');
    
    {
      const ee = new EventEmitter();
      console.log(getMaxListeners(ee)); // 10
      setMaxListeners(11, ee);
      console.log(getMaxListeners(ee)); // 11
    }
    {
      const et = new EventTarget();
      console.log(getMaxListeners(et)); // 10
      setMaxListeners(11, et);
      console.log(getMaxListeners(et)); // 11
    }
    ```

## `events.once(emitter, name[, options])`

<!-- YAML
added:
 - v11.13.0
 - v10.16.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34912
    description: The `signal` option is supported now.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Опция `signal` теперь поддерживается. |

* `emitter` [`<EventEmitter>`](events.md#class-eventemitter)
* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Можно использовать для отмены ожидания события.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Создаёт `Promise`, который выполняется, когда `EventEmitter` испускает указанное
событие, или отклоняется, если при ожидании испускается `'error'`.
`Promise` разрешается массивом всех аргументов, переданных событию.

Метод намеренно универсален и работает с веб-интерфейсом
[EventTarget][WHATWG-EventTarget], у которого нет особой семантики `'error'` и
нет прослушивания `'error'` по умолчанию.

=== "MJS"

    ```js
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
      console.error('error happened', err);
    }
    ```

=== "CJS"

    ```js
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
        console.error('error happened', err);
      }
    }
    
    run();
    ```

Особая обработка `'error'` применяется только когда `events.once()` ждёт другое
событие. Если `events.once()` ждёт само событие `'error'`, оно обрабатывается
как обычное событие, без особых правил:

=== "MJS"

    ```js
    import { EventEmitter, once } from 'node:events';
    
    const ee = new EventEmitter();
    
    once(ee, 'error')
      .then(([err]) => console.log('ok', err.message))
      .catch((err) => console.error('error', err.message));
    
    ee.emit('error', new Error('boom'));
    
    // Prints: ok boom
    ```

=== "CJS"

    ```js
    const { EventEmitter, once } = require('node:events');
    
    const ee = new EventEmitter();
    
    once(ee, 'error')
      .then(([err]) => console.log('ok', err.message))
      .catch((err) => console.error('error', err.message));
    
    ee.emit('error', new Error('boom'));
    
    // Prints: ok boom
    ```

An [AbortSignal](globals.md#abortsignal) can be used to cancel waiting for the event:

=== "MJS"

    ```js
    import { EventEmitter, once } from 'node:events';
    
    const ee = new EventEmitter();
    const ac = new AbortController();
    
    async function foo(emitter, event, signal) {
      try {
        await once(emitter, event, { signal });
        console.log('event emitted!');
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Waiting for the event was canceled!');
        } else {
          console.error('There was an error', error.message);
        }
      }
    }
    
    foo(ee, 'foo', ac.signal);
    ac.abort(); // Prints: Waiting for the event was canceled!
    ```

=== "CJS"

    ```js
    const { EventEmitter, once } = require('node:events');
    
    const ee = new EventEmitter();
    const ac = new AbortController();
    
    async function foo(emitter, event, signal) {
      try {
        await once(emitter, event, { signal });
        console.log('event emitted!');
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Waiting for the event was canceled!');
        } else {
          console.error('There was an error', error.message);
        }
      }
    }
    
    foo(ee, 'foo', ac.signal);
    ac.abort(); // Prints: Waiting for the event was canceled!
    ```

### Осторожно при ожидании нескольких событий

При нескольких `await` с `events.once()` важен порядок выполнения.

Обычные слушатели вызываются синхронно при испускании события: выполнение не
пойдёт дальше, пока не завершатся все слушатели этого события.

С промисами, возвращаемыми `events.once()`, это _не_ так: задачи промисов
обрабатываются после завершения текущего стека, поэтому до продолжения после
`await` может успеть испуститься несколько событий.

Из-за этого события могут «потеряться», если подряд идут несколько
`await events.once()` — в одной фазе цикла событий может произойти больше одного
события. (То же при испускании через `process.nextTick()`: его задачи выполняются
раньше задач промисов.)

=== "MJS"

    ```js
    import { EventEmitter, once } from 'node:events';
    import process from 'node:process';
    
    const myEE = new EventEmitter();
    
    async function listen() {
      await once(myEE, 'foo');
      console.log('foo');
    
      // This Promise will never resolve, because the 'bar' event will
      // have already been emitted before the next line is executed.
      await once(myEE, 'bar');
      console.log('bar');
    }
    
    process.nextTick(() => {
      myEE.emit('foo');
      myEE.emit('bar');
    });
    
    listen().then(() => console.log('done'));
    ```

=== "CJS"

    ```js
    const { EventEmitter, once } = require('node:events');
    
    const myEE = new EventEmitter();
    
    async function listen() {
      await once(myEE, 'foo');
      console.log('foo');
    
      // This Promise will never resolve, because the 'bar' event will
      // have already been emitted before the next line is executed.
      await once(myEE, 'bar');
      console.log('bar');
    }
    
    process.nextTick(() => {
      myEE.emit('foo');
      myEE.emit('bar');
    });
    
    listen().then(() => console.log('done'));
    ```

Чтобы поймать несколько событий, создайте все промисы _до_ первого `await`.
Обычно удобнее через `Promise.all()`, `Promise.race()` или `Promise.allSettled()`:

=== "MJS"

    ```js
    import { EventEmitter, once } from 'node:events';
    import process from 'node:process';
    
    const myEE = new EventEmitter();
    
    async function listen() {
      await Promise.all([
        once(myEE, 'foo'),
        once(myEE, 'bar'),
      ]);
      console.log('foo', 'bar');
    }
    
    process.nextTick(() => {
      myEE.emit('foo');
      myEE.emit('bar');
    });
    
    listen().then(() => console.log('done'));
    ```

=== "CJS"

    ```js
    const { EventEmitter, once } = require('node:events');
    
    const myEE = new EventEmitter();
    
    async function listen() {
      await Promise.all([
        once(myEE, 'bar'),
        once(myEE, 'foo'),
      ]);
      console.log('foo', 'bar');
    }
    
    process.nextTick(() => {
      myEE.emit('foo');
      myEE.emit('bar');
    });
    
    listen().then(() => console.log('done'));
    ```

## `events.captureRejections`

<!-- YAML
added:
 - v13.4.0
 - v12.16.0
changes:
  - version:
    - v17.4.0
    - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41267
    description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.4.0, v16.14.0 | Больше не экспериментально. |

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Меняет значение по умолчанию опции `captureRejections` для всех новых объектов
`EventEmitter`.

## `events.captureRejectionSymbol`

<!-- YAML
added:
  - v13.4.0
  - v12.16.0
changes:
  - version:
    - v17.4.0
    - v16.14.0
    pr-url: https://github.com/nodejs/node/pull/41267
    description: No longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v17.4.0, v16.14.0 | Больше не экспериментально. |

* Тип: [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) `Symbol.for('nodejs.rejection')`

См. раздел о написании пользовательского [обработчика отклонений][rejection].

## `events.listenerCount(emitterOrTarget, eventName)`

<!-- YAML
added: v0.9.12
changes:
  - version:
     - v25.4.0
     - v24.14.0
    pr-url: https://github.com/nodejs/node/pull/60214
    description: Now accepts EventTarget arguments.
  - version:
     - v25.4.0
     - v24.14.0
    pr-url: https://github.com/nodejs/node/pull/60214
    description: Deprecation revoked.
  - version: v3.2.0
    pr-url: https://github.com/nodejs/node/pull/2349
    description: Documentation-only deprecation.
-->

Добавлено в: v0.9.12

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.4.0, v24.14.0 | Теперь принимает аргументы EventTarget. |
    | v25.4.0, v24.14.0 | Устаревание отменено. |
    | v3.2.0 | Прекращение поддержки только документации. |

* `emitterOrTarget` [`<EventEmitter>`](events.md#class-eventemitter) | [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget)
* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type)
* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает число зарегистрированных слушателей для события `eventName`.

Для `EventEmitter` это эквивалентно вызову `.listenerCount` у эмиттера.

Для `EventTarget` это единственный способ получить число слушателей; удобно для
отладки и диагностики.

=== "MJS"

    ```js
    import { EventEmitter, listenerCount } from 'node:events';
    
    {
      const ee = new EventEmitter();
      ee.on('event', () => {});
      ee.on('event', () => {});
      console.log(listenerCount(ee, 'event')); // 2
    }
    {
      const et = new EventTarget();
      et.addEventListener('event', () => {});
      et.addEventListener('event', () => {});
      console.log(listenerCount(et, 'event')); // 2
    }
    ```

=== "CJS"

    ```js
    const { EventEmitter, listenerCount } = require('node:events');
    
    {
      const ee = new EventEmitter();
      ee.on('event', () => {});
      ee.on('event', () => {});
      console.log(listenerCount(ee, 'event')); // 2
    }
    {
      const et = new EventTarget();
      et.addEventListener('event', () => {});
      et.addEventListener('event', () => {});
      console.log(listenerCount(et, 'event')); // 2
    }
    ```

## `events.on(emitter, eventName[, options])`

<!-- YAML
added:
 - v13.6.0
 - v12.16.0
changes:
  - version:
    - v22.0.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52080
    description: Support `highWaterMark` and `lowWaterMark` options,
                 For consistency. Old options are still supported.
  - version:
    - v20.0.0
    pr-url: https://github.com/nodejs/node/pull/41276
    description: The `close`, `highWatermark`, and `lowWatermark`
                 options are supported now.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.0.0, v20.13.0 | Поддержка опций highWaterMark и lowWaterMark для обеспечения единообразия. Старые варианты по-прежнему поддерживаются. |
    | v20.0.0 | Параметры close, highWatermark и lowWatermark теперь поддерживаются. |

* `emitter` [`<EventEmitter>`](events.md#class-eventemitter)
* `eventName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя прослушиваемого события
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Можно использовать для отмены ожидания событий.
  * `close` [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имена событий, завершающих итерацию.
  * `highWaterMark` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `Number.MAX_SAFE_INTEGER`
    Верхняя отметка: эмиттер ставится на паузу, когда буфер событий больше этого
    значения. Только для эмиттеров с методами `pause()` и `resume()`.
  * `lowWaterMark` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) **По умолчанию:** `1`
    Нижняя отметка: эмиттер возобновляется, когда буфер меньше этого значения.
    Только для эмиттеров с методами `pause()` и `resume()`.
* Возвращает: [`<AsyncIterator>`](https://tc39.github.io/ecma262/#sec-asynciterator-interface) — асинхронный итератор по событиям `eventName` от `emitter`

=== "MJS"

    ```js
    import { on, EventEmitter } from 'node:events';
    import process from 'node:process';
    
    const ee = new EventEmitter();
    
    // Emit later on
    process.nextTick(() => {
      ee.emit('foo', 'bar');
      ee.emit('foo', 42);
    });
    
    for await (const event of on(ee, 'foo')) {
      // The execution of this inner block is synchronous and it
      // processes one event at a time (even with await). Do not use
      // if concurrent execution is required.
      console.log(event); // prints ['bar'] [42]
    }
    // Unreachable here
    ```

=== "CJS"

    ```js
    const { on, EventEmitter } = require('node:events');
    
    (async () => {
      const ee = new EventEmitter();
    
      // Emit later on
      process.nextTick(() => {
        ee.emit('foo', 'bar');
        ee.emit('foo', 42);
      });
    
      for await (const event of on(ee, 'foo')) {
        // The execution of this inner block is synchronous and it
        // processes one event at a time (even with await). Do not use
        // if concurrent execution is required.
        console.log(event); // prints ['bar'] [42]
      }
      // Unreachable here
    })();
    ```

Возвращает `AsyncIterator` по событиям `eventName`. Выбросит ошибку, если
`EventEmitter` испускает `'error'`. При выходе из цикла снимает все слушатели.
Значение каждой итерации — массив аргументов, переданных событию.

[AbortSignal](globals.md#abortsignal) можно использовать для отмены ожидания событий:

=== "MJS"

    ```js
    import { on, EventEmitter } from 'node:events';
    import process from 'node:process';
    
    const ac = new AbortController();
    
    (async () => {
      const ee = new EventEmitter();
    
      // Emit later on
      process.nextTick(() => {
        ee.emit('foo', 'bar');
        ee.emit('foo', 42);
      });
    
      for await (const event of on(ee, 'foo', { signal: ac.signal })) {
        // The execution of this inner block is synchronous and it
        // processes one event at a time (even with await). Do not use
        // if concurrent execution is required.
        console.log(event); // prints ['bar'] [42]
      }
      // Unreachable here
    })();
    
    process.nextTick(() => ac.abort());
    ```

=== "CJS"

    ```js
    const { on, EventEmitter } = require('node:events');
    
    const ac = new AbortController();
    
    (async () => {
      const ee = new EventEmitter();
    
      // Emit later on
      process.nextTick(() => {
        ee.emit('foo', 'bar');
        ee.emit('foo', 42);
      });
    
      for await (const event of on(ee, 'foo', { signal: ac.signal })) {
        // The execution of this inner block is synchronous and it
        // processes one event at a time (even with await). Do not use
        // if concurrent execution is required.
        console.log(event); // prints ['bar'] [42]
      }
      // Unreachable here
    })();
    
    process.nextTick(() => ac.abort());
    ```

## `events.setMaxListeners(n[, ...eventTargets])`

<!-- YAML
added: v15.4.0
-->

* `n` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Неотрицательное число — максимум слушателей на одно событие
  `EventTarget`.
* `...eventsTargets` [<EventTarget[]>](https://dom.spec.whatwg.org/#interface-eventtarget) | [<EventEmitter[]>](events.md#class-eventemitter) Ноль или больше экземпляров
  [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) или [EventEmitter](events.md#class-eventemitter). Если не указано, `n` задаётся по умолчанию для
  всех вновь создаваемых [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) и [EventEmitter](events.md#class-eventemitter).

=== "MJS"

    ```js
    import { setMaxListeners, EventEmitter } from 'node:events';
    
    const target = new EventTarget();
    const emitter = new EventEmitter();
    
    setMaxListeners(5, target, emitter);
    ```

=== "CJS"

    ```js
    const {
      setMaxListeners,
      EventEmitter,
    } = require('node:events');
    
    const target = new EventTarget();
    const emitter = new EventEmitter();
    
    setMaxListeners(5, target, emitter);
    ```

## `events.addAbortListener(signal, listener)`

<!-- YAML
added:
 - v20.5.0
 - v18.18.0
changes:
 - version:
   - v24.0.0
   - v22.16.0
   pr-url: https://github.com/nodejs/node/pull/57765
   description: Change stability index for this feature from Experimental to Stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.16.0 | Измените индекс стабильности для этой функции с «Экспериментального» на «Стабильный». |

* `signal` [`<AbortSignal>`](globals.md#abortsignal)
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)
* Возвращает: [`<Disposable>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol/dispose) Объект, снимающий слушатель `abort` при утилизации.

Подписывается один раз на событие `abort` у переданного `signal`.

Прослушивание `abort` у сигналов прерывания небезопасно и может приводить к
утечкам: другой код с тем же сигналом может вызвать [`e.stopImmediatePropagation()`][`e.stopImmediatePropagation()`].
Node.js не может менять это без нарушения веб-стандарта; к тому же легко забыть
снять слушателя.

Этот API позволяет безопаснее использовать `AbortSignal` в Node.js: слушатель
всё равно выполнится, даже если вызвали `stopImmediatePropagation`.

Возвращает disposable для удобной отписки.

=== "CJS"

    ```js
    const { addAbortListener } = require('node:events');
    
    function example(signal) {
      signal.addEventListener('abort', (e) => e.stopImmediatePropagation());
      // addAbortListener() returns a disposable, so the `using` keyword ensures
      // the abort listener is automatically removed when this scope exits.
      using _ = addAbortListener(signal, (e) => {
        // Do something when signal is aborted.
      });
    }
    ```

=== "MJS"

    ```js
    import { addAbortListener } from 'node:events';
    
    function example(signal) {
      signal.addEventListener('abort', (e) => e.stopImmediatePropagation());
      // addAbortListener() returns a disposable, so the `using` keyword ensures
      // the abort listener is automatically removed when this scope exits.
      using _ = addAbortListener(signal, (e) => {
        // Do something when signal is aborted.
      });
    }
    ```

## Класс: `events.EventEmitterAsyncResource extends EventEmitter`

<!-- YAML
added:
  - v17.4.0
  - v16.14.0
-->

Связывает `EventEmitter` с [AsyncResource](async_hooks.md#asyncresource) для случаев, где нужен явный учёт
асинхронности. Все события, испускаемые `events.EventEmitterAsyncResource`,
выполняются в его [асинхронном контексте][async context].

=== "MJS"

    ```js
    import { EventEmitterAsyncResource, EventEmitter } from 'node:events';
    import { notStrictEqual, strictEqual } from 'node:assert';
    import { executionAsyncId, triggerAsyncId } from 'node:async_hooks';
    
    // Async tracking tooling will identify this as 'Q'.
    const ee1 = new EventEmitterAsyncResource({ name: 'Q' });
    
    // 'foo' listeners will run in the EventEmitters async context.
    ee1.on('foo', () => {
      strictEqual(executionAsyncId(), ee1.asyncId);
      strictEqual(triggerAsyncId(), ee1.triggerAsyncId);
    });
    
    const ee2 = new EventEmitter();
    
    // 'foo' listeners on ordinary EventEmitters that do not track async
    // context, however, run in the same async context as the emit().
    ee2.on('foo', () => {
      notStrictEqual(executionAsyncId(), ee2.asyncId);
      notStrictEqual(triggerAsyncId(), ee2.triggerAsyncId);
    });
    
    Promise.resolve().then(() => {
      ee1.emit('foo');
      ee2.emit('foo');
    });
    ```

=== "CJS"

    ```js
    const { EventEmitterAsyncResource, EventEmitter } = require('node:events');
    const { notStrictEqual, strictEqual } = require('node:assert');
    const { executionAsyncId, triggerAsyncId } = require('node:async_hooks');
    
    // Async tracking tooling will identify this as 'Q'.
    const ee1 = new EventEmitterAsyncResource({ name: 'Q' });
    
    // 'foo' listeners will run in the EventEmitters async context.
    ee1.on('foo', () => {
      strictEqual(executionAsyncId(), ee1.asyncId);
      strictEqual(triggerAsyncId(), ee1.triggerAsyncId);
    });
    
    const ee2 = new EventEmitter();
    
    // 'foo' listeners on ordinary EventEmitters that do not track async
    // context, however, run in the same async context as the emit().
    ee2.on('foo', () => {
      notStrictEqual(executionAsyncId(), ee2.asyncId);
      notStrictEqual(triggerAsyncId(), ee2.triggerAsyncId);
    });
    
    Promise.resolve().then(() => {
      ee1.emit('foo');
      ee2.emit('foo');
    });
    ```

У класса `EventEmitterAsyncResource` те же методы и опции, что у `EventEmitter`
и `AsyncResource`.

### `new events.EventEmitterAsyncResource([options])`

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `captureRejections` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включает
    [автоматический перехват отклонений промисов][capturerejections].
    **По умолчанию:** `false`.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип асинхронного события. **По умолчанию:** [`new.target.name`][`new.target.name`].
  * `triggerAsyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор контекста, создавшего это асинхронное
    событие. **По умолчанию:** `executionAsyncId()`.
  * `requireManualDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` отключает `emitDestroy` при
    сборке мусора. Обычно не нужно (даже при ручном `emitDestroy`), если только
    не получают `asyncId` ресурса и вызывают с ним `emitDestroy` из чувствительного API.
    При `false` вызов `emitDestroy` при GC произойдёт только если есть хотя бы один
    активный хук `destroy`. **По умолчанию:** `false`.

### `eventemitterasyncresource.asyncId`

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уникальный `asyncId` ресурса.

### `eventemitterasyncresource.asyncResource`

* Тип: [`<AsyncResource>`](async_hooks.md#asyncresource) Базовый [AsyncResource](async_hooks.md#asyncresource).

У возвращённого `AsyncResource` есть дополнительное свойство `eventEmitter` —
ссылка на этот `EventEmitterAsyncResource`.

### `eventemitterasyncresource.emitDestroy()`

Вызывает все хуки `destroy`. Должен вызываться только один раз; повторный вызов
выбросит ошибку. Вызывать **нужно** вручную. Если оставить ресурс на сборщик мусора,
хуки `destroy` не выполнятся.

### `eventemitterasyncresource.triggerAsyncId`

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тот же `triggerAsyncId`, что передаётся в конструктор `AsyncResource`.

## API `EventTarget` и `Event` {#event-target-and-event-api}

<!-- YAML
added: v14.5.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/37237
    description: changed EventTarget error handling.
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/35949
    description: No longer experimental.
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35496
    description:
      The `EventTarget` and `Event` classes are now available as globals.
-->

Добавлено в: v14.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.0.0 | изменена обработка ошибок EventTarget. |
    | v15.4.0 | Больше не экспериментально. |
    | v15.0.0 | Классы EventTarget и Event теперь доступны как глобальные. |

Объекты `EventTarget` и `Event` — реализация в Node.js для
[`EventTarget` Web API][`EventTarget` Web API], используемая частью встроенных API.

```js
const target = new EventTarget();

target.addEventListener('foo', (event) => {
  console.log('foo event happened!');
});
```

### `EventTarget` в Node.js и в DOM

Два отличия Node.js `EventTarget` от [`EventTarget` Web API][`EventTarget` Web API]:

1. В DOM экземпляры `EventTarget` _могут_ быть иерархическими; в Node.js нет
   иерархии и всплытия: событие, отправленное на `EventTarget`, не проходит по
   цепочке вложенных целей с отдельными обработчиками.
2. В Node.js `EventTarget`, если слушатель — `async` или возвращает `Promise`,
   и промис отклоняется, отклонение перехватывается так же, как синхронное
   исключение в слушателе (см. [обработку ошибок `EventTarget`][EventTarget error handling]).

### `NodeEventTarget` и `EventEmitter`

`NodeEventTarget` реализует урезанный вариант API `EventEmitter` и может
_подражать_ `EventEmitter` в отдельных сценариях. Это _не_ экземпляр `EventEmitter`
и в большинстве случаев не подставляется вместо него.

1. В отличие от `EventEmitter`, один и тот же `listener` на тип события `type`
   регистрируется не более одного раза; повторные попытки игнорируются.
2. `NodeEventTarget` не эмулирует весь API `EventEmitter`. В частности, не
   эмулируются `prependListener()`, `prependOnceListener()`, `rawListeners()` и
   `errorMonitor`; события `'newListener'` и `'removeListener'` не испускаются.
3. У `NodeEventTarget` нет особого поведения по умолчанию для событий типа `'error'`.
4. `NodeEventTarget` принимает и объекты `EventListener`, и функции как обработчики
   для всех типов событий.

### Слушатель события

Слушатели для типа `type` могут быть функциями JavaScript или объектами с полем
`handleEvent`, значением которого является функция.

В обоих случаях обработчик вызывается с аргументом `event`, переданным в
`eventTarget.dispatchEvent()`.

Допустимы `async`-слушатели: при отклонении промиса отклонение обрабатывается, как
описано в [`EventTarget` error handling][`EventTarget` error handling].

Ошибка в одном обработчике не отменяет вызов остальных.

Возвращаемое значение обработчика игнорируется.

Обработчики вызываются в порядке добавления.

Обработчики могут изменять объект `event`.

```js
function handler1(event) {
  console.log(event.type);  // Prints 'foo'
  event.a = 1;
}

async function handler2(event) {
  console.log(event.type);  // Prints 'foo'
  console.log(event.a);  // Prints 1
}

const handler3 = {
  handleEvent(event) {
    console.log(event.type);  // Prints 'foo'
  },
};

const handler4 = {
  async handleEvent(event) {
    console.log(event.type);  // Prints 'foo'
  },
};

const target = new EventTarget();

target.addEventListener('foo', handler1);
target.addEventListener('foo', handler2);
target.addEventListener('foo', handler3);
target.addEventListener('foo', handler4, { once: true });
```

### Обработка ошибок `EventTarget`

Если зарегистрированный слушатель выбрасывает ошибку (или возвращает промис,
который отклоняется), по умолчанию это считается необработанным исключением на
`process.nextTick()`, то есть необработанные исключения в `EventTarget` по
умолчанию завершают процесс Node.js.

Исключение в одном слушателе _не_ останавливает вызов остальных зарегистрированных
обработчиков.

`EventTarget` не реализует особую обработку событий типа `'error'`, в отличие от
`EventEmitter`.

Сейчас ошибки сначала попадают в `process.on('error')`, затем в
`process.on('uncaughtException')`. Такое поведение устарело и в будущем изменится,
чтобы согласовать `EventTarget` с другими API Node.js. Код, рассчитывающий на
`process.on('error')`, стоит привести в соответствие.

### Класс: `Event`

<!-- YAML
added: v14.5.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35496
    description: The `Event` class is now available through the global object.
-->

Добавлено в: v14.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Класс Event теперь доступен через глобальный объект. |

Объект `Event` — адаптация [`Event` Web API][`Event` Web API]. Экземпляры создаются внутри Node.js.

#### `event.bubbles`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Всегда возвращает `false`.

В Node.js не используется, оставлено для полноты совместимости.

#### `event.cancelBubble`

<!-- YAML
added: v14.5.0
-->

> Stability: 3 - Legacy: Use [`event.stopPropagation()`][`event.stopPropagation()`] instead.

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Псевдоним для `event.stopPropagation()` при значении `true`. В Node.js не
используется, оставлено для полноты.

#### `event.cancelable`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если событие создано с опцией `cancelable`.

#### `event.composed`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Всегда возвращает `false`.

В Node.js не используется, оставлено для полноты.

#### `event.composedPath()`

<!-- YAML
added: v14.5.0
-->

Возвращает массив с текущим `EventTarget` как единственным элементом или пустой
массив, если событие не диспетчеризуется. В Node.js не используется, оставлено для
полноты.

#### `event.currentTarget`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) `EventTarget`, диспетчеризующий событие.

Псевдоним для `event.target`.

#### `event.defaultPrevented`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

`true`, если `cancelable` равен `true` и вызван `event.preventDefault()`.

#### `event.eventPhase`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Возвращает `0`, пока событие не диспетчеризуется, и `2` во время
  диспетчеризации.

В Node.js не используется, оставлено для полноты.

#### `event.initEvent(type[, bubbles[, cancelable]])`

<!-- YAML
added: v19.5.0
-->

> Stability: 3 - Legacy: The WHATWG spec considers it deprecated and users
> shouldn't use it at all.

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `bubbles` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `cancelable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Избыточно при наличии конструкторов событий и не задаёт `composed`. В Node.js не
используется, оставлено для полноты.

#### `event.isTrusted`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Для события `"abort"` у [AbortSignal](globals.md#abortsignal) `isTrusted` равен `true`. В остальных
случаях — `false`.

#### `event.preventDefault()`

<!-- YAML
added: v14.5.0
-->

Устанавливает `defaultPrevented` в `true`, если `cancelable` равен `true`.

#### `event.returnValue`

<!-- YAML
added: v14.5.0
-->

> Stability: 3 - Legacy: Use [`event.defaultPrevented`][`event.defaultPrevented`] instead.

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если событие не отменено.

Значение `event.returnValue` всегда противоположно `event.defaultPrevented`.
В Node.js не используется, оставлено для полноты.

#### `event.srcElement`

<!-- YAML
added: v14.5.0
-->

> Stability: 3 - Legacy: Use [`event.target`][`event.target`] instead.

* Тип: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) `EventTarget`, диспетчеризующий событие.

Псевдоним для `event.target`.

#### `event.stopImmediatePropagation()`

<!-- YAML
added: v14.5.0
-->

Прекращает вызов слушателей после завершения текущего.

#### `event.stopPropagation()`

<!-- YAML
added: v14.5.0
-->

В Node.js не используется, оставлено для полноты.

#### `event.target`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) `EventTarget`, диспетчеризующий событие.

#### `event.timeStamp`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метка времени в миллисекундах на момент создания объекта `Event`.

#### `event.type`

<!-- YAML
added: v14.5.0
-->

* Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Идентификатор типа события.

### Класс: `EventTarget`

<!-- YAML
added: v14.5.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35496
    description:
      The `EventTarget` class is now available through the global object.
-->

Добавлено в: v14.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Класс EventTarget теперь доступен через глобальный объект. |

#### `eventTarget.addEventListener(type, listener[, options])`

<!-- YAML
added: v14.5.0
changes:
  - version: v15.4.0
    pr-url: https://github.com/nodejs/node/pull/36258
    description: add support for `signal` option.
-->

Добавлено в: v14.5.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.4.0 | добавить поддержку опции «сигнал». |

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `once` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` слушатель автоматически снимается после первого
    вызова. **По умолчанию:** `false`.
  * `passive` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` намекает, что слушатель не будет вызывать
    `preventDefault()` у объекта `Event`. **По умолчанию:** `false`.
  * `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) В Node.js напрямую не используется; добавлено для полноты API.
    **По умолчанию:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Слушатель снимается при вызове `abort()` у указанного
    `AbortSignal`.

Добавляет обработчик для события `type`. Один и тот же `listener` добавляется не
более одного раза для пары (`type`, значение `capture`).

Если `once` равен `true`, слушатель удаляется после следующей диспетчеризации
события `type`.

Опция `capture` в Node.js не влияет на поведение иначе как на учёт регистраций по
спецификации `EventTarget`: она входит в ключ при регистрации. Один слушатель
можно добавить с `capture = false` и отдельно с `capture = true`.

```js
function handler(event) {}

const target = new EventTarget();
target.addEventListener('foo', handler, { capture: true });  // first
target.addEventListener('foo', handler, { capture: false }); // second

// Removes the second instance of handler
target.removeEventListener('foo', handler);

// Removes the first instance of handler
target.removeEventListener('foo', handler, { capture: true });
```

#### `eventTarget.dispatchEvent(event)`

<!-- YAML
added: v14.5.0
-->

* `event` [`<Event>`](globals.md)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если у события `cancelable` равен `false` или
  `preventDefault()` не вызывался, иначе `false`.

Диспетчеризует `event` списку обработчиков для `event.type`.

Зарегистрированные слушатели вызываются синхронно в порядке регистрации.

#### `eventTarget.removeEventListener(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Удаляет `listener` из списка обработчиков для события `type`.

### Класс: `CustomEvent`

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

* Extends: [`<Event>`](globals.md)

Объект `CustomEvent` — адаптация [`CustomEvent` Web API][`CustomEvent` Web API]. Экземпляры создаются
внутри Node.js.

#### `event.detail`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
changes:
  - version:
    - v22.1.0
    - v20.13.0
    pr-url: https://github.com/nodejs/node/pull/52618
    description: CustomEvent is now stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v22.1.0, v20.13.0 | CustomEvent теперь стабилен. |

* Тип: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Пользовательские данные, переданные при инициализации.

Только для чтения.

### Класс: `NodeEventTarget`

<!-- YAML
added: v14.5.0
-->

* Расширяет: [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget)

`NodeEventTarget` — расширение Node.js для `EventTarget`, подражающее части API
`EventEmitter`.

#### `nodeEventTarget.addListener(type, listener)`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)

* Возвращает: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) this

Расширение Node.js для `EventTarget`, аналог соответствующего API `EventEmitter`.
Отличие от `addEventListener()` в том, что `addListener()` возвращает ссылку на
`EventTarget`.

#### `nodeEventTarget.emit(type, arg)`

<!-- YAML
added: v15.2.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `arg` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если для `type` есть слушатели, иначе `false`.

Расширение Node.js: передаёт `arg` списку обработчиков для `type`.

#### `nodeEventTarget.eventNames()`

<!-- YAML
added: v14.5.0
-->

* Возвращает: [<string[]>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Расширение Node.js: возвращает массив имён типов событий, для которых есть
слушатели.

#### `nodeEventTarget.listenerCount(type)`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Расширение Node.js: число слушателей для `type`.

#### `nodeEventTarget.setMaxListeners(n)`

<!-- YAML
added: v14.5.0
-->

* `n` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Расширение Node.js: задаёт максимальное число слушателей равным `n`.

#### `nodeEventTarget.getMaxListeners()`

<!-- YAML
added: v14.5.0
-->

* Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Расширение Node.js: возвращает максимальное число слушателей.

#### `nodeEventTarget.off(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

* Возвращает: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) this

Псевдоним Node.js для `eventTarget.removeEventListener()`.

#### `nodeEventTarget.on(type, listener)`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)

* Возвращает: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) this

Псевдоним Node.js для `eventTarget.addEventListener()`.

#### `nodeEventTarget.once(type, listener)`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)

* Возвращает: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) this

Расширение Node.js: добавляет одноразового слушателя для `type`. Эквивалентно
`on` с опцией `once: true`.

#### `nodeEventTarget.removeAllListeners([type])`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* Возвращает: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) this

Расширение Node.js: если указан `type`, снимает всех слушателей для него, иначе —
всех слушателей.

#### `nodeEventTarget.removeListener(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

* `listener` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<EventListener>`](https://developer.mozilla.org/docs/Web/API/EventListener)

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `capture` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

* Возвращает: [`<EventTarget>`](https://dom.spec.whatwg.org/#interface-eventtarget) this

Расширение Node.js: удаляет `listener` для `type`. Отличие от
`removeEventListener()` в том, что `removeListener()` возвращает ссылку на
`EventTarget`.

[WHATWG-EventTarget]: https://dom.spec.whatwg.org/#interface-eventtarget
[`--trace-warnings`]: cli.md#--trace-warnings
[`CustomEvent` Web API]: https://dom.spec.whatwg.org/#customevent
[`EventTarget` Web API]: https://dom.spec.whatwg.org/#eventtarget
[`EventTarget` error handling]: #eventtarget-error-handling
[`Event` Web API]: https://dom.spec.whatwg.org/#event
[`domain`]: domain.md
[`e.stopImmediatePropagation()`]: #eventstopimmediatepropagation
[`emitter.removeListener()`]: #emitterremovelistenereventname-listener
[`emitter.setMaxListeners(n)`]: #emittersetmaxlistenersn
[`event.defaultPrevented`]: #eventdefaultprevented
[`event.stopPropagation()`]: #eventstoppropagation
[`event.target`]: #eventtarget
[`events.defaultMaxListeners`]: #eventsdefaultmaxlisteners
[`fs.ReadStream`]: fs.md#class-fsreadstream
[`net.Server`]: net.md#class-netserver
[`new.target.name`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target
[`process.on('warning')`]: process.md#event-warning
[async context]: async_context.md
[capturerejections]: #capture-rejections-of-promises
[error]: #error-events
[rejection]: #emittersymbolfornodejsrejectionerr-eventname-args
[rejectionsymbol]: #eventscapturerejectionsymbol
[stream]: stream.md
