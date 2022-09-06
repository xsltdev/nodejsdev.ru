# Event

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!--type=module-->

<!-- source_link=lib/events.js -->

Большая часть API ядра Node.js построена на идиоматической асинхронной управляемой событиями архитектуре, в которой определенные виды объектов (называемые «эмиттерами») испускают именованные события, которые вызывают `Function` вызываемые объекты («слушатели»).

Например: a [`net.Server`](net.md#class-netserver) объект генерирует событие каждый раз, когда одноранговый узел подключается к нему; а [`fs.ReadStream`](fs.md#class-fsreadstream) выдает событие при открытии файла; а [транслировать](stream.md) генерирует событие всякий раз, когда данные доступны для чтения.

Все объекты, излучающие события, являются экземплярами `EventEmitter` класс. Эти объекты открывают `eventEmitter.on()` функция, которая позволяет одной или нескольким функциям быть прикрепленными к именованным событиям, испускаемым объектом. Обычно имена событий представляют собой строки в верблюжьем регистре, но можно использовать любой допустимый ключ свойства JavaScript.

Когда `EventEmitter` объект испускает событие, вызываются все функции, связанные с этим конкретным событием _синхронно_. Любые значения, возвращаемые вызываемыми слушателями, являются _игнорируется_ и выбросили.

В следующем примере показан простой `EventEmitter` экземпляр с одним слушателем. В `eventEmitter.on()` используется для регистрации слушателей, в то время как `eventEmitter.emit()` используется для запуска события.

```js
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
myEmitter.emit('event');
```

## Передача аргументов и `this` слушателям

В `eventEmitter.emit()` Метод позволяет передавать произвольный набор аргументов функциям-слушателям. Имейте в виду, что когда вызывается обычная функция слушателя, стандартная `this` ключевое слово намеренно установлено для ссылки на `EventEmitter` экземпляр, к которому прикреплен слушатель.

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', function (a, b) {
  console.log(a, b, this, this === myEmitter);
  // Prints:
  //   a b MyEmitter {
  //     domain: null,
  //     _events: { event: [Function] },
  //     _eventsCount: 1,
  //     _maxListeners: undefined } true
});
myEmitter.emit('event', 'a', 'b');
```

В качестве слушателей можно использовать стрелочные функции ES6, однако при этом `this` ключевое слово больше не будет ссылаться на `EventEmitter` пример:

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  console.log(a, b, this);
  // Prints: a b {}
});
myEmitter.emit('event', 'a', 'b');
```

## Асинхронный против синхронного

В `EventEmitter` вызывает всех слушателей синхронно в том порядке, в котором они были зарегистрированы. Это обеспечивает правильную последовательность событий и помогает избежать состояний гонки и логических ошибок. При необходимости функции слушателя могут переключаться в асинхронный режим работы с помощью `setImmediate()` или `process.nextTick()` методы:

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  setImmediate(() => {
    console.log('this happens asynchronously');
  });
});
myEmitter.emit('event', 'a', 'b');
```

## Обработка событий только один раз

Когда слушатель зарегистрирован с помощью `eventEmitter.on()` метод, этот слушатель вызывается _каждый раз_ названное событие испускается.

```js
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

С помощью `eventEmitter.once()` , можно зарегистрировать прослушиватель, который вызывается не более одного раза для определенного события. Как только событие генерируется, слушатель отменяет регистрацию и _тогда_ называется.

```js
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

## События ошибки

Когда ошибка возникает в `EventEmitter` например, типичное действие для `'error'` событие, которое будет выпущено. Они рассматриваются как особые случаи в Node.js.

Если `EventEmitter` делает _нет_ иметь хотя бы одного слушателя, зарегистрированного для `'error'` событие, и `'error'` генерируется событие, генерируется ошибка, печатается трассировка стека и процесс Node.js завершается.

```js
const myEmitter = new MyEmitter();
myEmitter.emit('error', new Error('whoops!'));
// Throws and crashes Node.js
```

Чтобы предотвратить сбой процесса Node.js, [`domain`](domain.md) модуль можно использовать. (Обратите внимание, однако, что `domain` модуль устарел.)

Рекомендуется всегда добавлять слушателей для `'error'` События.

```js
const myEmitter = new MyEmitter();
myEmitter.on('error', (err) => {
  console.error('whoops! there was an error');
});
myEmitter.emit('error', new Error('whoops!'));
// Prints: whoops! there was an error
```

Есть возможность контролировать `'error'` события без использования выданной ошибки, установив прослушиватель с помощью символа `events.errorMonitor`.

```js
const { EventEmitter, errorMonitor } = require('events');

const myEmitter = new EventEmitter();
myEmitter.on(errorMonitor, (err) => {
  MyMonitoringTool.log(err);
});
myEmitter.emit('error', new Error('whoops!'));
// Still throws and crashes Node.js
```

## Улавливайте отказ от обещаний

> Стабильность: 1 - захват отклонений экспериментальный.

С использованием `async` функции с обработчиками событий проблематичны, потому что это может привести к необработанному отклонению в случае сгенерированного исключения:

```js
const ee = new EventEmitter();
ee.on('something', async (value) => {
  throw new Error('kaboom');
});
```

В `captureRejections` вариант в `EventEmitter` конструктор или глобальный параметр изменяют это поведение, устанавливая `.then(undefined, handler)` обработчик на `Promise`. Этот обработчик асинхронно направляет исключение в [`Symbol.for('nodejs.rejection')`](#emittersymbolfornodejsrejectionerr-eventname-args) метод, если он есть, или [`'error'`](#error-events) обработчик событий, если его нет.

```js
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

Параметр `events.captureRejections = true` изменит значение по умолчанию для всех новых экземпляров `EventEmitter`.

```js
const events = require('events');
events.captureRejections = true;
const ee1 = new events.EventEmitter();
ee1.on('something', async (value) => {
  throw new Error('kaboom');
});

ee1.on('error', console.log);
```

В `'error'` события, которые генерируются `captureRejections` поведение не имеет обработчика catch, чтобы избежать бесконечных циклов ошибок: рекомендуется **не использовать `async` функционирует как `'error'` обработчики событий**.

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

В `EventEmitter` класс определяется и предоставляется `events` модуль:

```js
const EventEmitter = require('events');
```

Все `EventEmitter`s испустить событие `'newListener'` когда добавляются новые слушатели и `'removeListener'` когда существующие слушатели удалены.

Он поддерживает следующий вариант:

- `captureRejections` {boolean} Это позволяет [автоматический захват отказа от обещания](#capture-rejections-of-promises). **Дефолт:** `false`.

### Событие: `'newListener'`

<!-- YAML
added: v0.1.26
-->

- `eventName` {строка | символ} Имя события, которое прослушивается
- `listener` {Function} Функция обработчика событий

В `EventEmitter` экземпляр испустит свой собственный `'newListener'` событие _до_ слушатель добавляется к его внутреннему массиву слушателей.

Слушатели зарегистрировались на `'newListener'` event передаются имя события и ссылка на добавляемого слушателя.

Тот факт, что событие запускается до добавления слушателя, имеет тонкий, но важный побочный эффект: любой _дополнительный_ слушатели зарегистрировались на то же `name` _в_ в `'newListener'` обратный вызов вставлен _до_ слушатель, который находится в процессе добавления.

```js
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

- `eventName` {строка | символ} Название события
- `listener` {Function} Функция обработчика событий

В `'removeListener'` событие испускается _после_ в `listener` удален.

### `emitter.addListener(eventName, listener)`

<!-- YAML
added: v0.1.26
-->

- `eventName` {строка | символ}
- `listener` {Функция}

Псевдоним для `emitter.on(eventName, listener)`.

### `emitter.emit(eventName[, ...args])`

<!-- YAML
added: v0.1.26
-->

- `eventName` {строка | символ}
- `...args` {любой}
- Возвращает: {логическое}

Синхронно вызывает каждого из слушателей, зарегистрированных для события с именем `eventName`в том порядке, в котором они были зарегистрированы, передавая каждому из них предоставленные аргументы.

Возврат `true` если у события были слушатели, `false` иначе.

```js
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(
    `event with parameters ${arg1}, ${arg2} in second listener`
  );
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(
    `event with parameters ${parameters} in third listener`
  );
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

- Возвращает: {Array}

Возвращает массив со списком событий, для которых эмиттер зарегистрировал слушателей. Значения в массиве - это строки или `Symbol`с.

```js
const EventEmitter = require('events');
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

- Возвращает: {целое число}

Возвращает текущее максимальное значение слушателя для `EventEmitter` который либо устанавливается [`emitter.setMaxListeners(n)`](#emittersetmaxlistenersn) или по умолчанию [`events.defaultMaxListeners`](#eventsdefaultmaxlisteners).

### `emitter.listenerCount(eventName)`

<!-- YAML
added: v3.2.0
-->

- `eventName` {строка | символ} Имя события, которое прослушивается
- Возвращает: {целое число}

Возвращает количество слушателей, слушающих событие с именем `eventName`.

### `emitter.listeners(eventName)`

<!-- YAML
added: v0.1.26
changes:
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/6881
    description: For listeners attached using `.once()` this returns the
                 original listeners instead of wrapper functions now.
-->

- `eventName` {строка | символ}
- Возвращает: {Функция \[]}

Возвращает копию массива слушателей для события с именем `eventName`.

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

- `eventName` {строка | символ}
- `listener` {Функция}
- Возвращает: {EventEmitter}

Псевдоним для [`emitter.removeListener()`](#emitterremovelistenereventname-listener).

### `emitter.on(eventName, listener)`

<!-- YAML
added: v0.1.101
-->

- `eventName` {строка | символ} Название события.
- `listener` {Function} Функция обратного вызова
- Возвращает: {EventEmitter}

Добавляет `listener` в конец массива слушателей для события с именем `eventName`. Никаких проверок на предмет наличия `listener` уже добавлен. Несколько вызовов, передающих одну и ту же комбинацию `eventName` а также `listener` приведет к `listener` добавляется и вызывается несколько раз.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

По умолчанию прослушиватели событий вызываются в порядке добавления. В `emitter.prependListener()` может использоваться как альтернатива для добавления прослушивателя событий в начало массива слушателей.

```js
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

- `eventName` {строка | символ} Название события.
- `listener` {Function} Функция обратного вызова
- Возвращает: {EventEmitter}

Добавляет **один раз** `listener` функция для события с именем `eventName`. В следующий раз `eventName` запускается, этот слушатель удаляется, а затем вызывается.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

По умолчанию прослушиватели событий вызываются в порядке добавления. В `emitter.prependOnceListener()` может использоваться как альтернатива для добавления прослушивателя событий в начало массива слушателей.

```js
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

- `eventName` {строка | символ} Название события.
- `listener` {Function} Функция обратного вызова
- Возвращает: {EventEmitter}

Добавляет `listener` функция для _начало_ массива слушателей для события с именем `eventName`. Никаких проверок на предмет наличия `listener` уже добавлен. Несколько вызовов, передающих одну и ту же комбинацию `eventName` а также `listener` приведет к `listener` добавляется и вызывается несколько раз.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

### `emitter.prependOnceListener(eventName, listener)`

<!-- YAML
added: v6.0.0
-->

- `eventName` {строка | символ} Название события.
- `listener` {Function} Функция обратного вызова
- Возвращает: {EventEmitter}

Добавляет **один раз** `listener` функция для события с именем `eventName` к _начало_ массива слушателей. В следующий раз `eventName` запускается, этот слушатель удаляется, а затем вызывается.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

### `emitter.removeAllListeners([eventName])`

<!-- YAML
added: v0.1.26
-->

- `eventName` {строка | символ}
- Возвращает: {EventEmitter}

Удаляет всех слушателей или тех из указанных `eventName`.

Плохая практика - удалять слушателей, добавленных в другом месте кода, особенно когда `EventEmitter` Экземпляр был создан каким-либо другим компонентом или модулем (например, сокетами или файловыми потоками).

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

### `emitter.removeListener(eventName, listener)`

<!-- YAML
added: v0.1.26
-->

- `eventName` {строка | символ}
- `listener` {Функция}
- Возвращает: {EventEmitter}

Удаляет указанный `listener` из массива слушателей для события с именем `eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` удалит не более одного экземпляра слушателя из массива слушателей. Если какой-либо отдельный слушатель был добавлен несколько раз в массив слушателей для указанного `eventName`, тогда `removeListener()` должен вызываться несколько раз для удаления каждого экземпляра.

Как только событие генерируется, все слушатели, прикрепленные к нему во время генерации, вызываются по порядку. Это означает, что любой `removeListener()` или `removeAllListeners()` звонки _после_ испускающий и _до_ последний слушатель завершает выполнение не удаляет их из `emit()` в ходе выполнения. Последующие события ведут себя так, как ожидалось.

```js
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

Поскольку слушатели управляются с помощью внутреннего массива, его вызов изменит индексы положения любого зарегистрированного слушателя. _после_ слушатель удаляется. Это не повлияет на порядок, в котором вызываются слушатели, но это означает, что любые копии массива слушателей, возвращенные `emitter.listeners()` метод необходимо будет воссоздать.

Когда одна функция была добавлена в качестве обработчика несколько раз для одного события (как в примере ниже), `removeListener()` удалит последний добавленный экземпляр. В примере `once('ping')` слушатель удален:

```js
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

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

### `emitter.setMaxListeners(n)`

<!-- YAML
added: v0.3.5
-->

- `n` {целое число}
- Возвращает: {EventEmitter}

По умолчанию `EventEmitter`s напечатает предупреждение, если больше, чем `10` слушатели добавляются для определенного события. Это полезное значение по умолчанию, которое помогает находить утечки памяти. В `emitter.setMaxListeners()` позволяет изменить предел для этого конкретного `EventEmitter` пример. Значение может быть установлено на `Infinity` (или `0`) для обозначения неограниченного количества слушателей.

Возвращает ссылку на `EventEmitter`, так что вызовы можно связывать.

### `emitter.rawListeners(eventName)`

<!-- YAML
added: v9.4.0
-->

- `eventName` {строка | символ}
- Возвращает: {Функция \[]}

Возвращает копию массива слушателей для события с именем `eventName`, включая любые оболочки (например, созданные `.once()`).

```js
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
-->

> Стабильность: 1 - захват отклонений экспериментальный.

- `err` Ошибка
- `eventName` {строка | символ}
- `...args` {любой}

В `Symbol.for('nodejs.rejection')` вызывается в случае отклонения обещания при генерации события и [`captureRejections`](#capture-rejections-of-promises) включен на эмиттере. Можно использовать [`events.captureRejectionSymbol`](#eventscapturerejectionsymbol) на месте `Symbol.for('nodejs.rejection')`.

```js
const {
  EventEmitter,
  captureRejectionSymbol,
} = require('events');

class MyClass extends EventEmitter {
  constructor() {
    super({ captureRejections: true });
  }

  [captureRejectionSymbol](err, event, ...args) {
    console.log(
      'rejection happened for',
      event,
      'with',
      err,
      ...args
    );
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

По умолчанию максимум `10` слушатели могут быть зарегистрированы для любого отдельного события. Этот лимит может быть изменен для индивидуального `EventEmitter` экземпляры, использующие [`emitter.setMaxListeners(n)`](#emittersetmaxlistenersn) метод. Чтобы изменить значение по умолчанию для _все_ `EventEmitter` экземпляры, `events.defaultMaxListeners` свойство можно использовать. Если это значение не является положительным числом, `RangeError` брошен.

Будьте осторожны при установке `events.defaultMaxListeners` потому что изменение влияет _все_ `EventEmitter` экземпляры, в том числе созданные до внесения изменений. Однако вызов [`emitter.setMaxListeners(n)`](#emittersetmaxlistenersn) все еще имеет приоритет перед `events.defaultMaxListeners`.

Это не жесткий предел. В `EventEmitter` instance позволит добавить больше слушателей, но выведет на stderr предупреждение о трассировке, указывающее, что была обнаружена «возможная утечка памяти EventEmitter». Для любого сингла `EventEmitter`, то `emitter.getMaxListeners()` а также `emitter.setMaxListeners()` можно использовать методы, чтобы временно избежать этого предупреждения:

```js
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
  // do stuff
  emitter.setMaxListeners(
    Math.max(emitter.getMaxListeners() - 1, 0)
  );
});
```

В [`--trace-warnings`](cli.md#--trace-warnings) Флаг командной строки может использоваться для отображения трассировки стека для таких предупреждений.

Выданное предупреждение можно проверить с помощью [`process.on('warning')`](process.md#event-warning) и будет иметь дополнительные `emitter`, `type` а также `count` properties, ссылаясь на экземпляр генератора событий, имя события и количество подключенных слушателей соответственно. Его `name` свойство установлено на `'MaxListenersExceededWarning'`.

## `events.errorMonitor`

<!-- YAML
added:
 - v13.6.0
 - v12.17.0
-->

Этот символ должен использоваться для установки слушателя только для мониторинга. `'error'` События. Слушатели, установленные с использованием этого символа, вызываются перед обычным `'error'` слушатели вызываются.

Установка слушателя с использованием этого символа не меняет поведения после `'error'` генерируется событие, поэтому процесс все равно выйдет из строя, если не будет регулярных `'error'` слушатель установлен.

## `events.getEventListeners(emitterOrTarget, eventName)`

<!-- YAML
added:
 - v15.2.0
 - v14.17.0
-->

- `emitterOrTarget` {EventEmitter | EventTarget}
- `eventName` {строка | символ}
- Возвращает: {Функция \[]}

Возвращает копию массива слушателей для события с именем `eventName`.

Для `EventEmitter`s это ведет себя точно так же, как вызов `.listeners` на эмиттере.

Для `EventTarget`s это единственный способ получить прослушиватели событий для цели события. Это полезно для отладки и диагностики.

```js
const {
  getEventListeners,
  EventEmitter,
} = require('events');

{
  const ee = new EventEmitter();
  const listener = () => console.log('Events are fun');
  ee.on('foo', listener);
  getEventListeners(ee, 'foo'); // [listener]
}
{
  const et = new EventTarget();
  const listener = () => console.log('Events are fun');
  et.addEventListener('foo', listener);
  getEventListeners(et, 'foo'); // [listener]
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

- `emitter` {EventEmitter}
- `name` {нить}
- `options` {Объект}
  - `signal` {AbortSignal} Может использоваться для отмены ожидания события.
- Возврат: {Обещание}

Создает `Promise` это выполняется, когда `EventEmitter` испускает данное событие или отклоняется, если `EventEmitter` испускает `'error'` пока жду. В `Promise` разрешится массивом всех аргументов, переданных данному событию.

Этот метод намеренно общий и работает с веб-платформой. [EventTarget](https://dom.spec.whatwg.org/#interface-eventtarget) интерфейс, в котором нет специальных `'error'` семантика событий и не слушает `'error'` событие.

```js
const { once, EventEmitter } = require('events');

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
    console.log('error happened', err);
  }
}

run();
```

Особое обращение с `'error'` событие используется только когда `events.once()` используется для ожидания другого события. Если `events.once()` используется для ожидания '`error'` само событие, то оно обрабатывается как любое другое событие без специальной обработки:

```js
const { EventEmitter, once } = require('events');

const ee = new EventEmitter();

once(ee, 'error')
  .then(([err]) => console.log('ok', err.message))
  .catch((err) => console.log('error', err.message));

ee.emit('error', new Error('boom'));

// Prints: ok boom
```

{AbortSignal} может использоваться для отмены ожидания события:

```js
const { EventEmitter, once } = require('events');

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
ac.abort(); // Abort waiting for the event
ee.emit('foo'); // Prints: Waiting for the event was canceled!
```

### Ожидание нескольких событий, отправленных на `process.nextTick()`

Стоит отметить крайний случай при использовании `events.once()` функция для ожидания нескольких событий, сгенерированных в одном пакете `process.nextTick()` операций, или когда несколько событий генерируются синхронно. В частности, потому что `process.nextTick()` очередь опорожняется до того, как `Promise` очередь микрозадач, а потому `EventEmitter` излучает все события синхронно, возможно `events.once()` пропустить событие.

```js
const { EventEmitter, once } = require('events');

const myEE = new EventEmitter();

async function foo() {
  await once(myEE, 'bar');
  console.log('bar');

  // This Promise will never resolve because the 'foo' event will
  // have already been emitted before the Promise is created.
  await once(myEE, 'foo');
  console.log('foo');
}

process.nextTick(() => {
  myEE.emit('bar');
  myEE.emit('foo');
});

foo().then(() => console.log('done'));
```

Чтобы поймать оба события, создайте каждое из обещаний _до_ ожидая любого из них, становится возможным использовать `Promise.all()`, `Promise.race()`, или `Promise.allSettled()`:

```js
const { EventEmitter, once } = require('events');

const myEE = new EventEmitter();

async function foo() {
  await Promise.all([once(myEE, 'bar'), once(myEE, 'foo')]);
  console.log('foo', 'bar');
}

process.nextTick(() => {
  myEE.emit('bar');
  myEE.emit('foo');
});

foo().then(() => console.log('done'));
```

## `events.captureRejections`

<!-- YAML
added:
 - v13.4.0
 - v12.16.0
-->

> Стабильность: 1 - захват отклонений экспериментальный.

Значение: {логическое}

Измените значение по умолчанию `captureRejections` опция на все новые `EventEmitter` объекты.

## `events.captureRejectionSymbol`

<!-- YAML
added:
 - v13.4.0
 - v12.16.0
-->

> Стабильность: 1 - захват отклонений экспериментальный.

Ценить: `Symbol.for('nodejs.rejection')`

Посмотрите, как написать кастом [обработчик отклонения](#emittersymbolfornodejsrejectionerr-eventname-args).

## `events.listenerCount(emitter, eventName)`

<!-- YAML
added: v0.9.12
deprecated: v3.2.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`emitter.listenerCount()`](#emitterlistenercounteventname) вместо.

- `emitter` {EventEmitter} Эмиттер для запроса
- `eventName` {строка | символ} Название события

Метод класса, который возвращает количество слушателей для данного `eventName` зарегистрирован на данном `emitter`.

```js
const { EventEmitter, listenerCount } = require('events');
const myEmitter = new EventEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(listenerCount(myEmitter, 'event'));
// Prints: 2
```

## `events.on(emitter, eventName[, options])`

<!-- YAML
added:
 - v13.6.0
 - v12.16.0
-->

- `emitter` {EventEmitter}
- `eventName` {строка | символ} Имя события, которое прослушивается
- `options` {Объект}
  - `signal` {AbortSignal} Может использоваться для отмены ожидающих событий.
- Возвращает: {AsyncIterator}, который выполняет итерацию `eventName` события, испускаемые `emitter`

```js
const { on, EventEmitter } = require('events');

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

Возвращает `AsyncIterator` это повторяет `eventName` События. Это бросит, если `EventEmitter` испускает `'error'`. Он удаляет всех слушателей при выходе из цикла. В `value` Каждая итерация возвращает массив, состоящий из переданных аргументов события.

{AbortSignal} может использоваться для отмены ожидания событий:

```js
const { on, EventEmitter } = require('events');
const ac = new AbortController();

(async () => {
  const ee = new EventEmitter();

  // Emit later on
  process.nextTick(() => {
    ee.emit('foo', 'bar');
    ee.emit('foo', 42);
  });

  for await (const event of on(ee, 'foo', {
    signal: ac.signal,
  })) {
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

- `n` {число} Неотрицательное число. Максимальное количество слушателей на `EventTarget` событие.
- `...eventsTargets` {EventTarget \[] | EventEmitter \[]} Ноль или более экземпляров {EventTarget} или {EventEmitter}. Если ничего не указано, `n` устанавливается как максимальное значение по умолчанию для всех вновь создаваемых объектов {EventTarget} и {EventEmitter}.

```js
const { setMaxListeners, EventEmitter } = require('events');

const target = new EventTarget();
const emitter = new EventEmitter();

setMaxListeners(5, target, emitter);
```

<a id="event-target-and-event-api"></a>

## `EventTarget` а также `Event` API

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

В `EventTarget` а также `Event` объекты являются специфичной для Node.js реализацией [`EventTarget` Веб-API](https://dom.spec.whatwg.org/#eventtarget) которые предоставляются некоторыми основными API-интерфейсами Node.js.

```js
const target = new EventTarget();

target.addEventListener('foo', (event) => {
  console.log('foo event happened!');
});
```

### Node.js `EventTarget` против DOM `EventTarget`

Между Node.js есть два ключевых различия. `EventTarget` и [`EventTarget` Веб-API](https://dom.spec.whatwg.org/#eventtarget):

1.  В то время как DOM `EventTarget` экземпляры _мая_ быть иерархическим, в Node.js. нет концепции иерархии и распространения событий. То есть событие, отправленное `EventTarget` не распространяется через иерархию вложенных целевых объектов, каждый из которых может иметь свой собственный набор обработчиков для события.
2.  В Node.js `EventTarget`, если прослушиватель событий является асинхронной функцией или возвращает `Promise`, а возвращенный `Promise` отклоняет, отклонение автоматически фиксируется и обрабатывается так же, как и слушатель, который выбрасывает синхронно (см. [`EventTarget` обработка ошибок](#eventtarget-error-handling) для подробностей).

### `NodeEventTarget` против. `EventEmitter`

В `NodeEventTarget` объект реализует измененное подмножество `EventEmitter` API, позволяющий вплотную _подражать_ ан `EventEmitter` в определенных ситуациях. А `NodeEventTarget` является _нет_ экземпляр `EventEmitter` и не может использоваться вместо `EventEmitter` в большинстве случаев.

1.  В отличие от `EventEmitter`, любой данный `listener` можно зарегистрировать не более одного раза на событие `type`. Попытки зарегистрировать `listener` несколько раз игнорируются.
2.  В `NodeEventTarget` не эмулирует полную `EventEmitter` API. В частности, `prependListener()`, `prependOnceListener()`, `rawListeners()`, `setMaxListeners()`, `getMaxListeners()`, а также `errorMonitor` API не эмулируются. В `'newListener'` а также `'removeListener'` события также не будут отправляться.
3.  В `NodeEventTarget` не реализует никакого специального поведения по умолчанию для событий с типом `'error'`.
4.  В `NodeEventTarget` поддерживает `EventListener` объекты, а также функции как обработчики для всех типов событий.

### Слушатель событий

Слушатели событий, зарегистрированные на событие `type` могут быть функциями JavaScript или объектами с `handleEvent` свойство, значение которого является функцией.

В любом случае функция-обработчик вызывается с `event` аргумент передан в `eventTarget.dispatchEvent()` функция.

Асинхронные функции могут использоваться как прослушиватели событий. Если функция асинхронного обработчика отклоняет, отклонение фиксируется и обрабатывается, как описано в [`EventTarget` обработка ошибок](#eventtarget-error-handling).

Ошибка, вызванная одной функцией-обработчиком, не препятствует вызову других обработчиков.

Возвращаемое значение функции-обработчика игнорируется.

Обработчики всегда вызываются в том порядке, в котором они были добавлены.

Функции-обработчики могут изменять `event` объект.

```js
function handler1(event) {
  console.log(event.type); // Prints 'foo'
  event.a = 1;
}

async function handler2(event) {
  console.log(event.type); // Prints 'foo'
  console.log(event.a); // Prints 1
}

const handler3 = {
  handleEvent(event) {
    console.log(event.type); // Prints 'foo'
  },
};

const handler4 = {
  async handleEvent(event) {
    console.log(event.type); // Prints 'foo'
  },
};

const target = new EventTarget();

target.addEventListener('foo', handler1);
target.addEventListener('foo', handler2);
target.addEventListener('foo', handler3);
target.addEventListener('foo', handler4, { once: true });
```

### `EventTarget` обработка ошибок

Когда зарегистрированный прослушиватель событий выдает (или возвращает обещание, которое отклоняет), по умолчанию ошибка обрабатывается как неперехваченное исключение на `process.nextTick()`. Это означает неперехваченные исключения в `EventTarget`s по умолчанию завершит процесс Node.js.

Добавление в прослушиватель событий приведет к _нет_ остановить вызов других зарегистрированных обработчиков.

В `EventTarget` не реализует никакой специальной обработки по умолчанию для `'error'` введите такие события, как `EventEmitter`.

В настоящее время ошибки сначала передаются в `process.on('error')` событие до достижения `process.on('uncaughtException')`. Это поведение устарело и будет изменено в следующем выпуске, чтобы согласовать `EventTarget` с другими API-интерфейсами Node.js. Любой код, основанный на `process.on('error')` событие должно быть согласовано с новым поведением.

### Класс: `Event`

<!-- YAML
added: v14.5.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/35496
    description: The `Event` class is now available through the global object.
-->

В `Event` объект является адаптацией [`Event` Веб-API](https://dom.spec.whatwg.org/#event). Экземпляры создаются внутри Node.js.

#### `event.bubbles`

<!-- YAML
added: v14.5.0
-->

- Тип: {boolean} Всегда возвращается `false`.

Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.cancelBubble()`

<!-- YAML
added: v14.5.0
-->

Псевдоним для `event.stopPropagation()`. Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.cancelable`

<!-- YAML
added: v14.5.0
-->

- Тип: {boolean} Истина, если событие было создано с `cancelable` вариант.

#### `event.composed`

<!-- YAML
added: v14.5.0
-->

- Тип: {boolean} Всегда возвращается `false`.

Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.composedPath()`

<!-- YAML
added: v14.5.0
-->

Возвращает массив, содержащий текущий `EventTarget` как единственная запись или пустая, если событие не отправляется. Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.currentTarget`

<!-- YAML
added: v14.5.0
-->

- Тип: {EventTarget} `EventTarget` отправка события.

Псевдоним для `event.target`.

#### `event.defaultPrevented`

<!-- YAML
added: v14.5.0
-->

- Тип: {логическое}

Является `true` если `cancelable` является `true` а также `event.preventDefault()` был вызван.

#### `event.eventPhase`

<!-- YAML
added: v14.5.0
-->

- Тип: {number} Возврат `0` пока событие не отправляется, `2` пока он отправляется.

Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.isTrusted`

<!-- YAML
added: v14.5.0
-->

- Тип: {логическое}

{AbortSignal} `"abort"` событие испускается с `isTrusted` установлен в `true`. Ценность `false` во всех остальных случаях.

#### `event.preventDefault()`

<!-- YAML
added: v14.5.0
-->

Устанавливает `defaultPrevented` собственность на `true` если `cancelable` является `true`.

#### `event.returnValue`

<!-- YAML
added: v14.5.0
-->

- Тип: {boolean} Истина, если событие не было отменено.

Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.srcElement`

<!-- YAML
added: v14.5.0
-->

- Тип: {EventTarget} `EventTarget` отправка события.

Псевдоним для `event.target`.

#### `event.stopImmediatePropagation()`

<!-- YAML
added: v14.5.0
-->

Останавливает вызов слушателей событий после завершения текущего.

#### `event.stopPropagation()`

<!-- YAML
added: v14.5.0
-->

Это не используется в Node.js и предоставляется исключительно для полноты картины.

#### `event.target`

<!-- YAML
added: v14.5.0
-->

- Тип: {EventTarget} `EventTarget` отправка события.

#### `event.timeStamp`

<!-- YAML
added: v14.5.0
-->

- Тип: {номер}

Метка времени в миллисекундах, когда `Event` объект был создан.

#### `event.type`

<!-- YAML
added: v14.5.0
-->

- Тип: {строка}

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

#### `eventTarget.addEventListener(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}
- `listener` {Функция | EventListener}
- `options` {Объект}
  - `once` {boolean} Когда `true`, слушатель автоматически удаляется при первом вызове. **Дефолт:** `false`.
  - `passive` {boolean} Когда `true`, служит намеком на то, что слушатель не будет вызывать `Event` объекты `preventDefault()` метод. **Дефолт:** `false`.
  - `capture` {boolean} Не используется напрямую в Node.js. Добавлено для полноты API. **Дефолт:** `false`.

Добавляет новый обработчик для `type` событие. Любой данный `listener` добавляется только один раз за `type` и за `capture` значение опциона.

Если `once` вариант `true`, то `listener` удаляется после следующего раза `type` событие отправлено.

В `capture` опция не используется Node.js каким-либо функциональным образом, кроме отслеживания зарегистрированных прослушивателей событий для `EventTarget` Технические характеристики. В частности, `capture` опция используется как часть ключа при регистрации `listener`. Любой человек `listener` может быть добавлен один раз с `capture = false`, и один раз с `capture = true`.

```js
function handler(event) {}

const target = new EventTarget();
target.addEventListener('foo', handler, { capture: true }); // first
target.addEventListener('foo', handler, { capture: false }); // second

// Removes the second instance of handler
target.removeEventListener('foo', handler);

// Removes the first instance of handler
target.removeEventListener('foo', handler, {
  capture: true,
});
```

#### `eventTarget.dispatchEvent(event)`

<!-- YAML
added: v14.5.0
-->

- `event` {Мероприятие}
- Возвращает: {логическое} `true` если любое событие `cancelable` значение атрибута false или его `preventDefault()` метод не был вызван, иначе `false`.

Отправляет `event` в список обработчиков для `event.type`.

Зарегистрированные прослушиватели событий вызываются синхронно в том порядке, в котором они были зарегистрированы.

#### `eventTarget.removeEventListener(type, listener)`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}
- `listener` {Функция | EventListener}
- `options` {Объект}
  - `capture` {логический}

Удаляет `listener` из списка обработчиков события `type`.

### Класс: `NodeEventTarget`

<!-- YAML
added: v14.5.0
-->

- Расширяется: {EventTarget}

В `NodeEventTarget` является специфичным для Node.js расширением для `EventTarget` который имитирует подмножество `EventEmitter` API.

#### `nodeEventTarget.addListener(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- `listener` {Функция | EventListener}

- `options` {Объект}

  - `once` {логический}

- Возвращает: {EventTarget} это

Специфичное для Node.js расширение для `EventTarget` класс, который имитирует эквивалент `EventEmitter` API. Единственная разница между `addListener()` а также `addEventListener()` в том, что `addListener()` вернет ссылку на `EventTarget`.

#### `nodeEventTarget.eventNames()`

<!-- YAML
added: v14.5.0
-->

- Возвращает: {строка \[]}

Специфичное для Node.js расширение для `EventTarget` класс, который возвращает массив событий `type` имена, для которых зарегистрированы слушатели событий.

#### `nodeEventTarget.listenerCount(type)`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- Возврат: {number}

Специфичное для Node.js расширение для `EventTarget` класс, который возвращает количество прослушивателей событий, зарегистрированных для `type`.

#### `nodeEventTarget.off(type, listener)`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- `listener` {Функция | EventListener}

- Возвращает: {EventTarget} это

Псевдоним для Node.js для `eventTarget.removeListener()`.

#### `nodeEventTarget.on(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- `listener` {Функция | EventListener}

- `options` {Объект}

  - `once` {логический}

- Возвращает: {EventTarget} это

Псевдоним для Node.js для `eventTarget.addListener()`.

#### `nodeEventTarget.once(type, listener[, options])`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- `listener` {Функция | EventListener}

- `options` {Объект}

- Возвращает: {EventTarget} это

Специфичное для Node.js расширение для `EventTarget` класс, который добавляет `once` слушатель для данного события `type`. Это эквивалентно вызову `on` с `once` опция установлена на `true`.

#### `nodeEventTarget.removeAllListeners([type])`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- Возвращает: {EventTarget} это

Специфичное для Node.js расширение для `EventTarget` класс. Если `type` указан, удаляет всех зарегистрированных слушателей для `type`, в противном случае удаляет всех зарегистрированных слушателей.

#### `nodeEventTarget.removeListener(type, listener)`

<!-- YAML
added: v14.5.0
-->

- `type` {нить}

- `listener` {Функция | EventListener}

- Возвращает: {EventTarget} это

Специфичное для Node.js расширение для `EventTarget` класс, который удаляет `listener` для данного `type`. Единственная разница между `removeListener()` а также `removeEventListener()` в том, что `removeListener()` вернет ссылку на `EventTarget`.
