---
description: Модуль inspector предоставляет API для взаимодействия с инспектором V8
---

# Inspector

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/inspector.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:inspector`** предоставляет API для взаимодействия с инспектором V8.

Доступ к нему можно получить с помощью:

```mjs
import * as inspector from 'node:inspector/promises';
```

```cjs
const inspector = require('node:inspector/promises');
```

или

```mjs
import * as inspector from 'node:inspector';
```

```cjs
const inspector = require('node:inspector');
```

## Promise API

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

### Класс: `inspector.Session`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Класс `inspector.Session` используется для отправки сообщений в бэкэнд инспектора V8 и получения ответов на сообщения и уведомлений.

#### `new inspector.Session()`

Создайте новый экземпляр класса `inspector.Session`. Сессия инспектора должна быть подключена через [`session.connect()`](#sessionconnect), прежде чем сообщения будут отправлены в бэкенд инспектора.

#### Событие: `inspectorNotification`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект сообщения уведомления

Выдается при получении любого уведомления от инспектора V8.

```js
session.on('inspectorNotification', (message) =>
    console.log(message.method)
);
// Debugger.paused
// Debugger.resumed
```

Также можно подписаться только на уведомления с определенным методом:

#### Событие: `<inspector-protocol-method>`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект сообщения уведомления

Выдается при получении уведомления инспектора, у которого поле method установлено в значение `<inspector-protocol-method>`.

Следующий фрагмент устанавливает слушателя на событие [`Debugger.paused`](https://chromedevtools.github.io/devtools-protocol/v8/Debugger#event-paused), и печатает причину приостановки программы всякий раз, когда выполнение программы приостанавливается (например, через точки останова):

```js
session.on('Debugger.paused', ({ params }) => {
    console.log(params.hitBreakpoints);
});
// [ [ '/the/file/that/has/the/breakpoint.js:11:0' ]
```

#### `session.connect()`

Подключает сессию к внутренней части инспектора.

#### `session.connectToMainThread()`

Подключает сессию к основному потоку инспектора back-end. Если этот API был вызван не на рабочем потоке, будет выдано исключение.

#### `session.disconnect()`

Немедленное закрытие сессии. Все ожидающие обратные вызовы сообщений будут вызваны с ошибкой. [`session.connect()`](#sessionconnect) нужно будет вызвать, чтобы снова иметь возможность отправлять сообщения. Вновь подключенная сессия потеряет все состояния инспектора, такие как включенные агенты или настроенные точки останова.

#### `session.post(method[, params])`

-   `method` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `params` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Отправляет сообщение на внутреннюю страницу инспектора.

```mjs
import { Session } from 'node:inspector/promises';
try {
    const session = new Session();
    session.connect();
    const result = await session.post('Runtime.evaluate', {
        expression: '2 + 2',
    });
    console.log(result);
} catch (error) {
    console.error(error);
}
// Output: { result: { type: 'number', value: 4, description: '4' } }
```

Последняя версия протокола инспектора V8 опубликована на [Chrome DevTools Protocol Viewer](https://chromedevtools.github.io/devtools-protocol/v8/).

Инспектор Node.js поддерживает все домены Chrome DevTools Protocol, объявленные V8. Домен Chrome DevTools Protocol предоставляет интерфейс для взаимодействия с одним из агентов времени выполнения, используемых для проверки состояния приложения и прослушивания событий времени выполнения.

#### Пример использования

Помимо отладчика, различные профилировщики V8 Profiler доступны через протокол DevTools.

##### Профилировщик процессора

Вот пример, показывающий, как использовать [CPU Profiler](https://chromedevtools.github.io/devtools-protocol/v8/Profiler):

```mjs
import { Session } from 'node:inspector/promises';
import fs from 'node:fs';
const session = new Session();
session.connect();

await session.post('Profiler.enable');
await session.post('Profiler.start');
// Вызовите бизнес-логику, которая будет измеряться здесь...

// некоторое время спустя...
const { profile } = await session.post('Profiler.stop');

// Записываем профиль на диск, загружаем и т.д.
fs.writeFileSync(
    './profile.cpupuprofile',
    JSON.stringify(profile)
);
```

##### Heap profiler

Вот пример, показывающий, как использовать [Heap Profiler](https://chromedevtools.github.io/devtools-protocol/v8/HeapProfiler):

```mjs
import { Session } from 'node:inspector/promises';
import fs from 'node:fs';
const session = new Session();

const fd = fs.openSync('profile.heapsnapshot', 'w');

session.connect();

session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
    fs.writeSync(fd, m.params.chunk);
});

const result = await session.post(
    'HeapProfiler.takeHeapSnapshot',
    null
);
console.log('HeapProfiler.takeHeapSnapshot done:', result);
session.disconnect();
fs.closeSync(fd);
```

## API обратного вызова

### Класс: `inspector.Session`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Класс `inspector.Session` используется для отправки сообщений в бэкэнд инспектора V8 и получения ответов на сообщения и уведомлений.

#### `new inspector.Session()`

Создайте новый экземпляр класса `inspector.Session`. Сессия инспектора должна быть подключена через [`session.connect()`](#sessionconnect), прежде чем сообщения будут отправлены в бэкенд инспектора.

#### Событие: `inspectorNotification`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект сообщения уведомления

Выдается при получении любого уведомления от инспектора V8.

```js
session.on('inspectorNotification', (message) =>
    console.log(message.method)
);
// Debugger.paused
// Debugger.resumed
```

Также можно подписаться только на уведомления с определенным методом:

#### Событие: `<inspector-protocol-method>`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект сообщения уведомления

Выдается при получении уведомления инспектора, у которого поле method установлено в значение `<inspector-protocol-method>`.

Следующий фрагмент устанавливает слушателя на событие [`Debugger.paused`](https://chromedevtools.github.io/devtools-protocol/v8/Debugger#event-paused), и печатает причину приостановки программы всякий раз, когда выполнение программы приостанавливается (например, через точки останова):

```js
session.on('Debugger.paused', ({ params }) => {
    console.log(params.hitBreakpoints);
});
// [ [ '/the/file/that/has/the/breakpoint.js:11:0' ]
```

#### `session.connect()`

Подключает сессию к внутренней части инспектора.

#### `session.connectToMainThread()`

Подключает сессию к основному потоку инспектора back-end. Если этот API был вызван не на рабочем потоке, будет выдано исключение.

#### `session.disconnect()`

Немедленное закрытие сессии. Все ожидающие обратные вызовы сообщений будут вызваны с ошибкой. [`session.connect()`](#sessionconnect) нужно будет вызвать, чтобы снова иметь возможность отправлять сообщения. Вновь подключенная сессия потеряет все состояния инспектора, такие как включенные агенты или настроенные точки останова.

#### `session.post(method[, params][, callback])`

-   `method` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `params` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Отправляет сообщение на внутреннюю страницу инспектора. Функция `callback` будет уведомлена, когда будет получен ответ. `callback` - это функция, принимающая два необязательных аргумента: ошибку и результат, специфичный для сообщения.

```js
session.post(
    'Runtime.evaluate',
    { expression: '2 + 2' },
    (error, { result }) => console.log(result)
);
// Output: { type: 'number', value: 4, description: '4' }
```

Последняя версия протокола инспектора V8 опубликована на [Chrome DevTools Protocol Viewer](https://chromedevtools.github.io/devtools-protocol/v8/).

Инспектор Node.js поддерживает все домены Chrome DevTools Protocol, объявленные V8. Домен Chrome DevTools Protocol предоставляет интерфейс для взаимодействия с одним из агентов времени выполнения, используемых для проверки состояния приложения и прослушивания событий времени выполнения.

Вы не можете установить `reportProgress` в `true` при отправке команды `HeapProfiler.takeHeapSnapshot` или `HeapProfiler.stopTrackingHeapObjects` в V8.

#### Пример использования

Помимо отладчика, различные профилировщики V8 Profiler доступны через протокол DevTools.

##### Профилировщик центрального процессора

Вот пример, показывающий, как использовать [CPU Profiler](https://chromedevtools.github.io/devtools-protocol/v8/Profiler):

```js
const inspector = require('node:inspector');
const fs = require('node:fs');
const session = new inspector.Session();
session.connect();

session.post('Profiler.enable', () => {
    session.post('Profiler.start', () => {
        // Вызовите бизнес-логику измерения здесь...

        // некоторое время спустя...
        session.post(
            'Profiler.stop',
            (err, { profile }) => {
                // Запись профиля на диск, выгрузка и т.д.
                if (!err) {
                    fs.writeFileSync(
                        './profile.cpupuprofile',
                        JSON.stringify(profile)
                    );
                }
            }
        );
    });
});
```

##### Heap profiler

Вот пример, показывающий, как использовать [Heap Profiler](https://chromedevtools.github.io/devtools-protocol/v8/HeapProfiler):

```js
const inspector = require('node:inspector');
const fs = require('node:fs');
const session = new inspector.Session();

const fd = fs.openSync('profile.heapsnapshot', 'w');

session.connect();

session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
    fs.writeSync(fd, m.params.chunk);
});

session.post(
    'HeapProfiler.takeHeapSnapshot',
    null,
    (err, r) => {
        console.log(
            'HeapProfiler.takeHeapSnapshot done:',
            err,
            r
        );
        session.disconnect();
        fs.closeSync(fd);
    }
);
```

## Общие объекты

### `inspector.close()`

Деактивирует инспектор. Блокируется до тех пор, пока не будет активных соединений.

### `inspector.console`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект для отправки сообщений на консоль удаленного инспектора.

```js
require('node:inspector').console.log('сообщение');
```

Консоль инспектора не имеет API паритета с консолью Node.js.

### `inspector.open([port[, host[, wait]]])`

-   `port` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт для прослушивания соединений инспектора. Необязательно. **По умолчанию:** то, что было указано в CLI.
-   `host` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост, на котором будут прослушиваться соединения инспектора. Необязательно. **По умолчанию:** то, что было указано в CLI.
-   `wait` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Блокировать до тех пор, пока клиент не подключится. Необязательно. **По умолчанию:** `false`.

Активировать инспектора на хосте и порту. Эквивалентно `node --inspect=[[host:]port]`, но может быть выполнено программно после запуска узла.

Если wait имеет значение `true`, будет блокироваться, пока клиент не подключится к порту инспекции и управление потоком не будет передано клиенту отладчика.

Смотрите [предупреждение о безопасности](cli.md#warning-binding-inspector-to-a-public-ipport-combination-is-insecure) относительно использования параметра `host`.

### `inspector.url()`

-   Возвращает: {string|undefined}

Возвращает URL активного инспектора, или `undefined`, если его нет.

```console
$ node --inspect -p 'inspector.url()'
Debugger listening on ws://127.0.0.1:9229/166e272e-7a30-4d09-97ce-f1c012b43c34
For help, see: https://nodejs.org/en/docs/inspector
ws://127.0.0.1:9229/166e272e-7a30-4d09-97ce-f1c012b43c34

$ node --inspect=localhost:3000 -p 'inspector.url()'
Debugger listening on ws://localhost:3000/51cf8d0e-3c36-4c59-8efd-54519839e56a
For help, see: https://nodejs.org/en/docs/inspector
ws://localhost:3000/51cf8d0e-3c36-4c59-8efd-54519839e56a

$ node -p 'inspector.url()'
undefined
```

### `inspector.waitForDebugger()`

Блокирует до тех пор, пока клиент (существующий или подключенный позже) не отправит команду `Runtime.runIfWaitingForDebugger`.

Если нет активного инспектора, будет выдано исключение.

