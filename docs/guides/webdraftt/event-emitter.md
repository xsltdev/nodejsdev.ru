# События и модуль events

Для построения более гибкой и масштабируемой архитектуры приложения можно использовать Node.js события, которые представлены классом `EventEmitter` встроенного модуля `events`.

Перейдем сразу к примеру.

_app.js_

```js
const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('message', (message) =>
    console.log('Message: ', message)
);
emitter.on('error', (error) =>
    console.log('Error: ', error)
);

emitter.emit('message', 'Node js EventEmitter in action.');
```

Генерация Node.js события осуществляется с помощью метода `emit()` объекта экземпляра класса `EventEmitter`, который первым аргументом принимает название события, а всеми необязательными остальными - передаваемые данные.

Обработчик регистрируется с использованием метода `on()`, которому передается два параметра:

-   имя Node.js события;
-   callback-функция, принимающая в качестве параметров указанные в `emit()` данные.

!!! note ""

    Если в процессе генерации события произойдет ошибка, то Node.js самостоятельно инициирует возникновение события `error`, и если для него не будет найден обработчик, то будет сгенерировано исключение.

## Экземпляры EventEmitter

Обычно в приложении создаются несколько экземпляров класса `EventEmitter` для логического разграничения типов Node.js событий.

_app.js_

```js
const EventEmitter = require('events');

class EmitterOne extends EventEmitter {}
class EmitterTwo extends EventEmitter {}

const emitterOneInstance = new EmitterOne();
const emitterTwoInstance = new EmitterTwo();

emitterOneInstance.on('message', (message) =>
    console.log('Emitter one message: ', message)
);
emitterOneInstance.on('error', (error) =>
    console.log('Emitter one error: ', error)
);

emitterTwoInstance.on('message', (message) =>
    console.log('Emitter two message: ', message)
);
emitterTwoInstance.on('error', (error) =>
    console.log('Emitter two error: ', error)
);

emitterOneInstance.emit(
    'message',
    'Node js EventEmitter in action.'
);
```

!!! note ""

    Работа напрямую с базовым классом `EventEmitter` будет регистрировать все обработчики глобально и при последующем создании нового экземпляра он унаследует все события базового класса. Поэтому работайте либо только с экземплярами, либо только с базовым классом.

## EventEmitter API

Для однократного выполнения регистрируемого обработчика вместо метода `on()` используйте `once()`, который перед вызовом callback-функции удаляет его из памяти.

_app.js_

```js
const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.once('message', (message) =>
    console.log('Message: ', message)
); //выполнится один раз

emitter.emit('message', 'First');
emitter.emit('message', 'Second');
```

По умолчанию для каждого отдельного события можно максимально зарегистрировать 10 функций обработчиков. Чтобы снять это ограничение для всех событий всех созданных экземпляров, измените значение свойства `EventEmitter.defaultMaxListeners`.

_app.js_

```js
const EventEmitter = require('events');

EventEmitter.defaultMaxListeners = 1;

const emitter = new EventEmitter();

emitter.on('message', (message) =>
    console.log('Listener 1: ', message)
);
emitter.on('message', (message) =>
    console.log('Listener 2: ', message)
);

emitter.emit('message', 'Message');
```

Чтобы изменить ограничение для отдельного экземпляра, используйте применительно к нему метод `setMaxListeners()`.

```js
const emitter = new EventEmitter();

emitter.setMaxListeners(1);
```

!!! note ""

    В случае превышения максимального количества обработчиков Node.js события будет выдано предупреждение.

Чтобы узнать, сколько обрабатывающих функций уже зарегистрировано на конкретное событие, используйте метод `EventEmitter.listenerCount()`, которому передаются два параметра:

-   экземпляр `EventEmitter`, относительно которого было зарегистрировано событие;
-   имя события.

_app.js_

```js
const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('message', (message) =>
    console.log('Listener 1: ', message)
);
emitter.on('message', (message) =>
    console.log('Listener 2: ', message)
);

console.log(EventEmitter.listenerCount(emitter, 'message')); //2
```

Получить все зарегистрированные события позволяет метод `eventNames()`.

```js
emitter.on('message', (message) =>
    console.log('Message: ', message)
);
emitter.on('error', (error) =>
    console.log('Error: ', error)
);

console.log(emitter.eventNames()); //['message', 'error']
```

Для удаления определенного обработчика у отдельного события используйте метод `removeListener()`, принимающий в качестве параметров имя Node.js события и сам обработчик.

```js
const messageListener = (message) =>
    console.log('Message: ', message);

emitter.on('message', messageListener);

emitter.emit('message', 'First');

emitter.removeListener('message', messageListener);

emitter.emit('message', 'Second'); //на этом этапе обработичка уже нет
```

Для удаления всех обработчиков события или сразу нескольких событий, используйте метод `removeAllListeners()`, который принимает массив событий, обработчики которых необходимо удалить.

```js
const messageListener1 = (message) =>
    console.log('Message listener 1: ', message);
const messageListener2 = (message) =>
    console.log('Message listener 2: ', message);
const errorListener = (error) =>
    console.log('Error: ', error);

emitter.on('message', messageListener1);
emitter.on('message', messageListener2);
emitter.on('error', errorListener);

emitter.emit('message', 'First');

emitter.removeAllListeners(['message']);

emitter.emit('message', 'Second'); //на этом этапе обработичков уже нет
```
