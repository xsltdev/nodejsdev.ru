# Events

!!!success "Стабильность: 2 – Стабильно"

Большая часть программного интерфейса приложения основанного на ядре Node.js строится вокруг идиоматического асинхронного события управляемого архитектурой, в которой определенные виды объектов (так называемые **"эмиттеры/источники"**) периодически создают события имеющие названия, которые вызывают функциональные объекты ( **"слушатели/обработчики событий"**).

Например: объект `net.Server` генерирует событие каждый раз, когда пир подключается к нему; `fs.ReadStream` генерирует событие при открытии файла; `stream` генерирует событие, всякий раз когда данные доступны для чтения.

Все объекты, генерирующие события, являются экземплярами класса `EventEmitter`. Эти объекты выставляют функцию `eventEmitter.on()`, что позволяет использовать одну или несколько функций, которые будут присоединены к именованным событиям, которые генерирует объект. Как правило, имена событий это строки основанные на протоколе CAMEL но может быть использован любой действительный ключ собственности JavaScript.

Когда объект `EventEmitter` генерирует событие, все функции, присоединенные к этому конкретному событию вызываются синхронно. Любые значения, возвращенные вызываемыми слушателями игнорируются и будут отброшены.

В следующем примере показан простой пример экземпляра класса `EventEmitter` с одним слушателем. Метод `eventEmitter.on()` используется для регистрации слушателей, а метод `eventEmitter.emit()` используется для запуска события.

```js
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
myEmitter.on('event', () => {
  console.log('an event occurred!');
});

myEmitter.emit('event');
```

## Передающие аргументы и this to обработчики

Метод `eventEmitter.emit()` позволяет произвольному набору аргументов быть переданным функциям слушателя. Важно иметь в виду, что, когда обычная функция слушателя вызывается с помощью `EventEmitter`, стандартное ключевое слово `this` намеренно установлено, чтобы ссылаться на `EventEmitter`, к которому прикреплен слушатель.

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', function (a, b) {
  console.log(a, b, this);
  // Prints:
  //   a b MyEmitter {
  //     domain: null,
  //     _events: { event: [Function] },
  //     _eventsCount: 1,
  //     _maxListeners: undefined }
});
myEmitter.emit('event', 'a', 'b');
```

Можно использовать ES6 Cтрелочные Функции в качестве слушателей, однако, при этом, ключевое слово `this` больше не будет ссылаться на экземпляр класса `EventEmitter`:

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', (a, b) => {
  console.log(a, b, this);
  // Prints: a b {}
});
myEmitter.emit('event', 'a', 'b');
```

## Асинхронный против Синхронный

`EventListener` вызывает всех слушателей синхронно в том порядке, в котором они были зарегистрированы. Это важно для обеспечения надлежащей последовательности событий и во избежание состояния гонки или логических ошибок. При необходимости, функции слушателя могут переключиться на асинхронный режим работы с использованием методов `setImmediate()` или `process.nextTick()`:

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

Когда обработчик событий регистрируется с помощью метода `eventEmitter.on()`, то он (обработчик событий) будет запускаться каждый раз, когда событие с названием будет сгенерировано.

```js
const myEmitter = new MyEmitter();
var m = 0;
myEmitter.on('event', () => {
  console.log(++m);
});
myEmitter.emit('event');
// Prints: 1
myEmitter.emit('event');
// Prints: 2
```

С помощью метода `eventEmitter.once()`, можно зарегистрировать обработчик событий, который вызывается всего один раз для конкретного события. После того, как событие генерируется, обработчик становится незарегистрированными, а затем вызывается.

```js
const myEmitter = new MyEmitter();
var m = 0;
myEmitter.once('event', () => {
  console.log(++m);
});
myEmitter.emit('event');
// Prints: 1
myEmitter.emit('event');
// Ignored
```

## Ошибки

При возникновении ошибки в экземпляре `EventEmitter`, для события `error` генерируется типичное действие. Такие случаи считаются особыми в Node.js.

Если `EventEmitter` не имеет по крайней мере одного обработчика событий, зарегистрированного для события `error`, и событие `error` генерируется, то выдается ошибка, печатается трассировка стека, и процесс Node.js завершается.

```js
const myEmitter = new MyEmitter();
myEmitter.emit('error', new Error('whoops!'));
// Throws and crashes Node.js
```

Для защиты от сбоев процесса Node.js, обработчик может быть зарегистрирован на событие process object's `uncaughtException` или может быть использован модуль `domain`. (Однако следует отметить, что модуль `domain` не рекомендуется)

```js
const myEmitter = new MyEmitter();

process.on('uncaughtException', (err) => {
  console.log('whoops! there was an error');
});

myEmitter.emit('error', new Error('whoops!'));
// Prints: whoops! there was an error
```

Лучше всего, чтобы обработчики всегда были добавлены к событиям `error`.

```js
const myEmitter = new MyEmitter();
myEmitter.on('error', (err) => {
  console.log('whoops! there was an error');
});
myEmitter.emit('error', new Error('whoops!'));
// Prints: whoops! there was an error
```

## Класс EventEmitter (Генератор событий)

Лобавлен в: v0.1.26

Класс `EventEmitter` определяется и показывается модулем `events`:

```js
const EventEmitter = require('events');
```

Все `EventEmitter` (генераторы событий) создают событие `newListener`, когда новые обработчики добавляются, а когда существующие обработчики удаляются, то генерируеся событие `removeListener`.

### Событие newListener

`eventName` `<String>` | `<Symbol>`
: Имя события

`listener` `<Function>`
: Функции обработчика

Экземпляр класса `EventEmitter` будет содавать свое собственное событие `NewListener` до того как обработчик будет добавлен в свой внутренний массив обработчиков событий.

Обработчикам, зарегистрированным для события `NewListener` будет передано название события и добавляется ссылка на обработчик события.

Тот факт, что событие запускается перед добавлением обработчика имеет тонкий, но важный побочный эффект: любые дополнительные обработчики, зарегистрированные на это же название (`name`) события в рамках обратного вызова `newListener` будут поставлены перед обработчиком, который находится в процессе добавления.

```js
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

### Событие removeListener

`eventName` `<String>` | `<Symbol>`
: Имя события

`listener` `<Function>`
: Функция обработчика события

Событие `removeListener` создается после того как обработчик `listener` удален.

## EventEmitter.listenerCount()

!!!danger "Stability: 0"

    НЕ РЕКОМЕНДУЕТСЯ.: Используйте вместо этого `emitter.listenerCount()`.

```
EventEmitter.listenerCount(emitter, eventName)
```

Метод, который возвращает количество обработчиков для данного `eventName` (имени события), регистрируется на данный генератор событий.

```js
const myEmitter = new MyEmitter();
myEmitter.on('event', () => {});
myEmitter.on('event', () => {});
console.log(EventEmitter.listenerCount(myEmitter, 'event'));
// Prints: 2
```

## EventEmitter.defaultMaxListeners

По умолчанию, можно зарегистрировать максимум `10` обработчиков для любого отдельного события.

Это ограничение может быть изменено для отдельных экземпляров класса `EventEmitter` с использованием метода `emitter.setMaxListeners(n)`. Чтобы изменить значение по умолчанию для всех экземпляров `EventEmitter`, может быть использовано свойство `EventEmitter.defaultMaxListeners`.

Соблюдайте осторожность при установке `EventEmitter.defaultMaxListeners`, поскольку это изменение влияет на все экземпляры класса `EventEmitter`, в том числе созданные до применения этого изменения. Тем не менее, вызов `emitter.setMaxListeners(n)` по-прежнему имеет больший приоритет над `EventEmitter.defaultMaxListeners`.

Обратите внимание, что это не жесткое ограничение. Экземпляр `EventEmitter` позволит добавление большего количества обработчиков, но выдаст предупреждение на стандартный поток ошибок `stderr`, указывающее, что «возможная утечка памяти генератора события» была обнаружена.

Для любого отдельного `EventEmitter` (генератора событий), могут быть использованы методы `emitter.getMaxListeners()` и `emitter.setMaxListeners()` чтобы временно избежать этого предупреждения:

```js
emitter.setMaxListeners(emitter.getMaxListeners() + 1);
emitter.once('event', () => {
  // do stuff
  emitter.setMaxListeners(
    Math.max(emitter.getMaxListeners() - 1, 0)
  );
});
```

## emitter.addListener()

```
emitter.addListener(eventName, listener)
```

Дополнительные названия `emitter.on(eventName, listener)`.

## emitter.emit(eventName[, arg1][, arg2][, ...])

```
emitter.emit(eventName[, arg1][, arg2][, ...])
```

`emitter.emit(eventName[, arg1][, arg2][, ...])` синхронно вызывает каждого из обработчиков, зарегистрированных на событие под названием `eventName`, в том порядке, они были зарегистрированы, передавая аргументы каждому из них.

Выдает `true` (верно), если у события были обработчики, в ином случае `false` (ложь).

## emitter.eventNames()

Показывает массив со списком событий, на которые генератор событий зарегистрировал обработчиков. Значения в массиве будут строками или символами.

```js
const EventEmitter = require('events');
const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints [ 'foo', 'bar', Symbol(symbol) ]
```

## emitter.getMaxListeners()

Показывает текущее значение максимального количества обработчиков для `EventEmitter` ,которое либо задается с помощью `emitter.setMaxListeners(n)` либо устанавливается по умолчанию с помощью `EventEmitter.defaultMaxListeners`.

## emitter.listenerCount()

```
emitter.listenerCount(eventName)
```

`eventName` `<String>` | `<Symbol>`
: Имя события, которое обрабатывается

Показывает количество обработчиков событий, которые обрабатывают событие под названием `eventName`.

## emitter.listeners()

```
emitter.listeners(eventName)
```

Возвращает копию массива обработчиков для события с названием `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

## emitter.on()

```
emitter.on(eventName, listener)
```

`eventName` `<String>` | `<Symbol>`
: Имя события.

`listener` `<Function>`
: Функция обратного вызова.

Добавляет функцию `listener` в конец массива обработчиковдля события с именем `eventName`. Никаких проверок не делается, чтобы увидеть добавлен ли `listener` (обработчик). Несколько вызовов передающих ту же комбинацию `eventName` и `listener` приведут к тому, что `listener` будет добавлен и вызван множество раз.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Показывает ссылку на `EventEmitter` и таким образом вызовы могут быть выстроены в цепочку.

По умолчанию, обработчики событий вызываются в порядке их добавления. Метод `emitter.prependListener()` может быть использован в качестве альтернативы, чтобы добавить обработчика событий в начало массива слушателей.

```js
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

## emitter.once()

```
emitter.once(eventName, listener)
```

`eventName` `<String>` | `<Symbol>`
: Имя события.

`listener` `<Function>`
: Функция обратного вызова.

Добавляет функцию обработчика единоразово для события с именем `eventName`. В следующий раз когда `eventName` срабатывает, этот обработчик удаляется, а затем вызывается.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть выстроены в цепочку. По умолчанию, обработчики событий вызываются в порядке их добавления. Метод `emitter.prependOnceListener()` может быть использован в качестве альтернативы, чтобы добавить слушателя событий в начало массива слушателей.

```js
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

## emitter.prependListener()

```
emitter.prependListener(eventName, listener)
```

`eventName` `<String>` | `<Symbol>`
: Имя события.

`listener` `<Function>`
: Функция обратного вызова.

Добавляет функцию `listener` (обработчика) к началу массива обработчиков события для события с именем `eventName`. Не делается никаких проверок, чтобы увидеть добавлен ли уже `listener`. Несколько вызовов передающих ту же комбинацию `eventName` и `listener` приведут к тому, что `listener` будет добавлен и вызван множество раз.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Возвращает ссылку на `EventEmitter` и таким образом вызовы могут быть выстроены в цепочку.

## emitter.prependOnceListener()

```
emitter.prependOnceListener(eventName, listener)
```

`eventName` `<String>` | `<Symbol>`
: Имя события.

`listener` `<Function>`
: Функция обратного вызова.

Добавляет функцию обработчика единожды для события с именем `eventName` в начало массива обработчиков. В следующий раз когда `eventName` срабатывает, этот обработчик удаляется, а затем вызывается.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Возвращает ссылку на `EventEmitter` и таким образом вызовы могут быть выстроены в цепочку.

## emitter.removeAllListeners()

```
emitter.removeAllListeners([eventName])
```

Удаляет всех, или конкретных обработчиков из указанного `eventName`. Обратите внимание, что неправильно удалять обработчиков где-либо, в коде особенно, когда экземпляр класса `EventEmitter` был создан каким-либо другим компонентом или модулем (например, сокеты или файловые потоки).

Возвращает ссылку на `EventEmitter` и таким образом вызовы могут быть выстроены в цепочку.

## emitter.removeListener()

```
emitter.removeListener(eventName, listener)
```

Удаляет указанный обработчик из массива обработчиков для события с названием `eventName`.

```js
var callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener` удалит не больше чем один экземпляр обработчика из массива обработчиков. Если какой-либо один обработчик был добавлен несколько раз в массив обработчиков для определенного `eventName` то `removeListener` должен быть вызван несколько раз, чтобы удалить каждый экземпляр.

Обратите внимание, что, как только событие было сгенерировано, все обработчики прикрепленные к нему во время создания события будут вызываться поочереди.

Это означает, что любые запросы `removeListener()` или `removeAllListeners()` после создания события и до завершения работы последнего обрабочика не удалит их из запущенного `Emit()`. Более поздние события будут вести себя, как ожидалось.

```js
const myEmitter = new MyEmitter();

var callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

var callbackB = () => {
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

Поскольку слушатели управляются с помощью внутреннего массива,то этот вызов изменит индексы позиций любого обработчика, зарегистрированного после того, как слушатель удаляется. Это не влияет на порядок, в котором вызываются обработчики, но это означает, что любые копии массива обработчиков, возвращаемые методом `emitter.listeners()` необходимо будет заново создавать.

Возвращает ссылку на `EventEmitter`, так что вызовы могут быть выстроены в цепочку.

## emitter.setMaxListeners()

```
emitter.setMaxListeners(n)
```

По умолчанию `EventEmitters` будет выдавать предупреждение, если добавляются более `10` слушателей для конкретного события.

Это полезное значение по умолчанию, которое помогает находить утечки памяти. Очевидно, что не все события должны быть ограничены только 10 обработчиками. Метод `emitter.setMaxListeners()` позволяет изменить ограничение для конкретного экземпляра `EventEmitter`. Значение может быть установлено до `Infinity` (бесконечности) (или `0`), чтобы указать, неограниченное количество обработчиков. Возвращает ссылку на `EventEmitter`, так что вызовы могут быть выстроены в цепочку.
