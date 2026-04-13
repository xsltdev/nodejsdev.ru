---
title: Инспектор
description: Модуль node:inspector — API взаимодействия с инспектором V8, сессии Chrome DevTools Protocol, профилирование и интеграция с DevTools
---

# Inspector

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/inspector.html)

<!--introduced_in=v8.0.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/inspector.js -->

Модуль `node:inspector` предоставляет API для взаимодействия с инспектором V8.

Доступ:

=== "MJS"

    ```js
    import * as inspector from 'node:inspector/promises';
    ```

=== "CJS"

    ```js
    const inspector = require('node:inspector/promises');
    ```

или

=== "MJS"

    ```js
    import * as inspector from 'node:inspector';
    ```

=== "CJS"

    ```js
    const inspector = require('node:inspector');
    ```

## API на промисах

<!-- YAML
added: v19.0.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

### Класс: `inspector.Session`

* Расширяет: [EventEmitter](events.md#class-eventemitter)

Класс `inspector.Session` используется для отправки сообщений в бэкенд инспектора V8 и получения ответов и уведомлений.

#### `new inspector.Session()`

<!-- YAML
added: v8.0.0
-->

Создаёт новый экземпляр класса `inspector.Session`. Сессию нужно подключить через [`session.connect()`][`session.connect()`] до отправки сообщений в бэкенд инспектора.

При использовании `Session` объекты, выводимые консольным API, не освобождаются, пока вручную не выполнена команда `Runtime.DiscardConsoleEntries`.

#### Событие: `'inspectorNotification'`

<!-- YAML
added: v8.0.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) объект сообщения-уведомления

Генерируется при получении любого уведомления от V8 Inspector.

```js
session.on('inspectorNotification', (message) => console.log(message.method));
// Debugger.paused
// Debugger.resumed
```

> **Ограничение** Точки останова в сессии того же потока не рекомендуются, см. [поддержку точек останова][поддержку точек останова].

Можно подписаться только на уведомления с конкретным методом:

#### Событие: `<inspector-protocol-method>`

<!-- YAML
added: v8.0.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) объект сообщения-уведомления

Генерируется при получении уведомления инспектора, у которого поле `method` равно `<inspector-protocol-method>`.

Следующий фрагмент подписывается на событие [`'Debugger.paused'`][`'Debugger.paused'`] и выводит причину приостановки при каждой остановке выполнения (например из-за точек останова):

```js
session.on('Debugger.paused', ({ params }) => {
  console.log(params.hitBreakpoints);
});
// [ '/the/file/that/has/the/breakpoint.js:11:0' ]
```

> **Ограничение** Точки останова в сессии того же потока не рекомендуются, см. [поддержку точек останова][поддержку точек останова].

#### `session.connect()`

<!-- YAML
added: v8.0.0
-->

Подключает сессию к бэкенду инспектора.

#### `session.connectToMainThread()`

<!-- YAML
added: v12.11.0
-->

Подключает сессию к бэкенду инспектора основного потока. Если API вызван не в потоке `Worker`, будет выброшено исключение.

#### `session.disconnect()`

<!-- YAML
added: v8.0.0
-->

Немедленно закрывает сессию. Все ожидающие колбэки сообщений будут вызваны с ошибкой. Чтобы снова отправлять сообщения, нужно снова вызвать [`session.connect()`][`session.connect()`]. После переподключения сессия теряет состояние инспектора: включённые агенты, настроенные точки останова и т.д.

#### `session.post(method[, params])`

<!-- YAML
added: v19.0.0
-->

* `method` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* Возвращает: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Отправляет сообщение в бэкенд инспектора.

=== "MJS"

    ```js
    import { Session } from 'node:inspector/promises';
    try {
      const session = new Session();
      session.connect();
      const result = await session.post('Runtime.evaluate', { expression: '2 + 2' });
      console.log(result);
    } catch (error) {
      console.error(error);
    }
    // Output: { result: { type: 'number', value: 4, description: '4' } }
    ```

Актуальная версия протокола V8 inspector опубликована в [Chrome DevTools Protocol Viewer][Chrome DevTools Protocol Viewer].

Инспектор Node.js поддерживает все домены Chrome DevTools Protocol, объявленные V8. Домен протокола даёт интерфейс для работы с одним из агентов времени выполнения, используемых для проверки состояния приложения и прослушивания событий рантайма.

#### Примеры использования

Помимо отладчика, через протокол DevTools доступны различные профилировщики V8.

##### Профилировщик CPU

Пример использования [CPU Profiler][CPU Profiler]:

=== "MJS"

    ```js
    import { Session } from 'node:inspector/promises';
    import fs from 'node:fs';
    const session = new Session();
    session.connect();
    
    await session.post('Profiler.enable');
    await session.post('Profiler.start');
    // Здесь вызывается измеряемая бизнес-логика...
    
    // спустя время...
    const { profile } = await session.post('Profiler.stop');
    
    // Запись профиля на диск, загрузка и т.д.
    fs.writeFileSync('./profile.cpuprofile', JSON.stringify(profile));
    ```

##### Профилировщик кучи

Пример использования [Heap Profiler][Heap Profiler]:

=== "MJS"

    ```js
    import { Session } from 'node:inspector/promises';
    import fs from 'node:fs';
    const session = new Session();
    
    const fd = fs.openSync('profile.heapsnapshot', 'w');
    
    session.connect();
    
    session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
      fs.writeSync(fd, m.params.chunk);
    });
    
    const result = await session.post('HeapProfiler.takeHeapSnapshot', null);
    console.log('HeapProfiler.takeHeapSnapshot done:', result);
    session.disconnect();
    fs.closeSync(fd);
    ```

## API с колбэками

### Класс: `inspector.Session`

* Расширяет: [EventEmitter](events.md#class-eventemitter)

Класс `inspector.Session` используется для отправки сообщений в бэкенд инспектора V8 и получения ответов и уведомлений.

#### `new inspector.Session()`

<!-- YAML
added: v8.0.0
-->

Создаёт новый экземпляр класса `inspector.Session`. Сессию нужно подключить через [`session.connect()`][`session.connect()`] до отправки сообщений в бэкенд инспектора.

При использовании `Session` объекты, выводимые консольным API, не освобождаются, пока вручную не выполнена команда `Runtime.DiscardConsoleEntries`.

#### Событие: `'inspectorNotification'`

<!-- YAML
added: v8.0.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) объект сообщения-уведомления

Генерируется при получении любого уведомления от V8 Inspector.

```js
session.on('inspectorNotification', (message) => console.log(message.method));
// Debugger.paused
// Debugger.resumed
```

> **Ограничение** Точки останова в сессии того же потока не рекомендуются, см. [поддержку точек останова][поддержку точек останова].

Можно подписаться только на уведомления с конкретным методом:

#### Событие: `<inspector-protocol-method>`;

<!-- YAML
added: v8.0.0
-->

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) объект сообщения-уведомления

Генерируется при получении уведомления инспектора, у которого поле `method` равно `<inspector-protocol-method>`.

Следующий фрагмент подписывается на событие [`'Debugger.paused'`][`'Debugger.paused'`] и выводит причину приостановки при каждой остановке выполнения (например из-за точек останова):

```js
session.on('Debugger.paused', ({ params }) => {
  console.log(params.hitBreakpoints);
});
// [ '/the/file/that/has/the/breakpoint.js:11:0' ]
```

> **Ограничение** Точки останова в сессии того же потока не рекомендуются, см. [поддержку точек останова][поддержку точек останова].

#### `session.connect()`

<!-- YAML
added: v8.0.0
-->

Подключает сессию к бэкенду инспектора.

#### `session.connectToMainThread()`

<!-- YAML
added: v12.11.0
-->

Подключает сессию к бэкенду инспектора основного потока. Если API вызван не в потоке `Worker`, будет выброшено исключение.

#### `session.disconnect()`

<!-- YAML
added: v8.0.0
-->

Немедленно закрывает сессию. Все ожидающие колбэки сообщений будут вызваны с ошибкой. Чтобы снова отправлять сообщения, нужно снова вызвать [`session.connect()`][`session.connect()`]. После переподключения сессия теряет состояние инспектора: включённые агенты, настроенные точки останова и т.д.

#### `session.post(method[, params][, callback])`

<!-- YAML
added: v8.0.0
changes:
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41678
    description: Passing an invalid callback to the `callback` argument
                 now throws `ERR_INVALID_ARG_TYPE` instead of
                 `ERR_INVALID_CALLBACK`.
-->

Добавлено в: v8.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.0.0 | При передаче недопустимого обратного вызова в аргумент callback теперь выдается ERR_INVALID_ARG_TYPE вместо ERR_INVALID_CALLBACK. |

* `method` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
* `callback` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Отправляет сообщение в бэкенд инспектора. `callback` вызывается при получении ответа. `callback` — функция с двумя необязательными аргументами: ошибка и результат, зависящий от сообщения.

```js
session.post('Runtime.evaluate', { expression: '2 + 2' },
             (error, { result }) => console.log(result));
// Output: { type: 'number', value: 4, description: '4' }
```

Актуальная версия протокола V8 inspector опубликована в [Chrome DevTools Protocol Viewer][Chrome DevTools Protocol Viewer].

Инспектор Node.js поддерживает все домены Chrome DevTools Protocol, объявленные V8. Домен протокола даёт интерфейс для работы с одним из агентов времени выполнения, используемых для проверки состояния приложения и прослушивания событий рантайма.

Нельзя устанавливать `reportProgress` в `true` при отправке команд V8 `HeapProfiler.takeHeapSnapshot` или `HeapProfiler.stopTrackingHeapObjects`.

#### Примеры использования

Помимо отладчика, через протокол DevTools доступны различные профилировщики V8.

##### Профилировщик CPU

Пример использования [CPU Profiler][CPU Profiler]:

```js
const inspector = require('node:inspector');
const fs = require('node:fs');
const session = new inspector.Session();
session.connect();

session.post('Profiler.enable', () => {
  session.post('Profiler.start', () => {
    // Здесь вызывается измеряемая бизнес-логика...

    // спустя время...
    session.post('Profiler.stop', (err, { profile }) => {
      // Запись профиля на диск, загрузка и т.д.
      if (!err) {
        fs.writeFileSync('./profile.cpuprofile', JSON.stringify(profile));
      }
    });
  });
});
```

##### Профилировщик кучи

Пример использования [Heap Profiler][Heap Profiler]:

```js
const inspector = require('node:inspector');
const fs = require('node:fs');
const session = new inspector.Session();

const fd = fs.openSync('profile.heapsnapshot', 'w');

session.connect();

session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
  fs.writeSync(fd, m.params.chunk);
});

session.post('HeapProfiler.takeHeapSnapshot', null, (err, r) => {
  console.log('HeapProfiler.takeHeapSnapshot done:', err, r);
  session.disconnect();
  fs.closeSync(fd);
});
```

## Общие объекты

### `inspector.close()`

<!-- YAML
added: v9.0.0
changes:
  - version: v18.10.0
    pr-url: https://github.com/nodejs/node/pull/44489
    description: The API is exposed in the worker threads.
-->

Добавлено в: v9.0.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.10.0 | API представлен в рабочих потоках. |

Пытается закрыть все оставшиеся соединения, блокируя цикл событий до полного закрытия. После закрытия всех соединений деактивирует инспектор.

### `inspector.console`

* Тип: [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) объект для отправки сообщений в удалённую консоль инспектора.

```js
require('node:inspector').console.log('a message');
```

Консоль инспектора не дублирует API консоли Node.js полностью.

### `inspector.open([port[, host[, wait]]])`

<!-- YAML
changes:
  - version: v20.6.0
    pr-url: https://github.com/nodejs/node/pull/48765
    description: inspector.open() now returns a `Disposable` object.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.6.0 | инспектор.open() теперь возвращает объект «Одноразовый». |

* `port` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порт для приёма подключений инспектора. Необязательно. **По умолчанию:** как задано в командной строке.
* `host` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Хост для приёма подключений инспектора. Необязательно. **По умолчанию:** как задано в командной строке.
* `wait` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Блокировать выполнение до подключения клиента. Необязательно. **По умолчанию:** `false`.
* Возвращает: {Disposable} объект `Disposable`, вызывающий [`inspector.close()`][`inspector.close()`].

Включает инспектор на указанном хосте и порту. Эквивалентно `node --inspect=[[host:]port]`, но может быть вызвано программно после старта Node.js.

Если `wait` равен `true`, выполнение блокируется до подключения клиента к порту инспектора и передачи управления клиенту отладчика.

См. [предупреждение о безопасности][предупреждение о безопасности] по использованию параметра `host`.

### `inspector.url()`

* Возвращает: [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined

Возвращает URL активного инспектора или `undefined`, если инспектор не активен.

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

<!-- YAML
added: v12.7.0
-->

Блокирует выполнение до тех пор, пока клиент (уже подключённый или подключившийся позже) не отправит команду `Runtime.runIfWaitingForDebugger`.

Если активного инспектора нет, будет выброшено исключение.

## Интеграция с DevTools

!!!warning "Стабильность: 1.1 – активная разработка"

    API может существенно меняться между минорными версиями. Используйте с осторожностью.

Модуль `node:inspector` предоставляет API для интеграции с инструментами разработки, поддерживающими Chrome DevTools Protocol.
Подключённые к работающему процессу Node.js клиенты DevTools могут получать события протокола и отображать их для упрощения отладки.
Следующие методы рассылают событие протокола всем подключённым клиентам.
Параметр `params` у методов может быть необязательным в зависимости от протокола.

```js
// Будет сгенерировано событие `Network.requestWillBeSent`.
inspector.Network.requestWillBeSent({
  requestId: 'request-id-1',
  timestamp: Date.now() / 1000,
  wallTime: Date.now(),
  request: {
    url: 'https://nodejs.org/en',
    method: 'GET',
  },
});
```

### `inspector.Network.dataReceived([params])`

<!-- YAML
added:
 - v24.2.0
 - v22.17.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.dataReceived` подключённым клиентам или буферизует данные, если для данного запроса ещё не вызывалась команда `Network.streamResourceContent`.

Также включает команду `Network.getResponseBody` для получения тела ответа.

### `inspector.Network.dataSent([params])`

<!-- YAML
added:
  - v24.3.0
  - v22.18.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Включает команду `Network.getRequestPostData` для получения данных запроса.

### `inspector.Network.requestWillBeSent([params])`

<!-- YAML
added:
 - v22.6.0
 - v20.18.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.requestWillBeSent` подключённым клиентам. Событие означает, что приложение собирается отправить HTTP-запрос.

### `inspector.Network.responseReceived([params])`

<!-- YAML
added:
 - v22.6.0
 - v20.18.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.responseReceived` подключённым клиентам. Событие означает, что HTTP-ответ доступен.

### `inspector.Network.loadingFinished([params])`

<!-- YAML
added:
 - v22.6.0
 - v20.18.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.loadingFinished` подключённым клиентам. Событие означает, что загрузка HTTP-запроса завершена.

### `inspector.Network.loadingFailed([params])`

<!-- YAML
added:
 - v22.7.0
 - v20.18.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.loadingFailed` подключённым клиентам. Событие означает, что загрузка HTTP-запроса не удалась.

### `inspector.Network.webSocketCreated([params])`

<!-- YAML
added:
  - v24.7.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.webSocketCreated` подключённым клиентам. Событие означает, что инициировано соединение WebSocket.

### `inspector.Network.webSocketHandshakeResponseReceived([params])`

<!-- YAML
added:
  - v24.7.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.webSocketHandshakeResponseReceived` подключённым клиентам.
Событие означает, что получен ответ рукопожатия WebSocket.

### `inspector.Network.webSocketClosed([params])`

<!-- YAML
added:
  - v24.7.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-network-inspection`.

Рассылает событие `Network.webSocketClosed` подключённым клиентам.
Событие означает, что соединение WebSocket закрыто.

### `inspector.NetworkResources.put`

<!-- YAML
added:
  - v24.5.0
  - v22.19.0
-->

!!!warning "Стабильность: 1.1 – активная разработка"

    API может существенно меняться между минорными версиями. Используйте с осторожностью.

Доступно только при включённом флаге `--experimental-inspector-network-resource`.

Метод `inspector.NetworkResources.put` используется, чтобы ответить на запрос `loadNetworkResource` по Chrome DevTools Protocol (CDP).
Обычно это происходит, когда карта источников задана по URL и клиент DevTools (например Chrome) запрашивает ресурс для её загрузки.

Метод позволяет заранее задать содержимое ресурса для таких запросов CDP.

```js
const inspector = require('node:inspector');
// Заранее вызвав put и зарегистрировав ресурс, можно разрешить карту источников при
// запросе loadNetworkResource с фронтенда.
async function setNetworkResources() {
  const mapUrl = 'http://localhost:3000/dist/app.js.map';
  const tsUrl = 'http://localhost:3000/src/app.ts';
  const distAppJsMap = await fetch(mapUrl).then((res) => res.text());
  const srcAppTs = await fetch(tsUrl).then((res) => res.text());
  inspector.NetworkResources.put(mapUrl, distAppJsMap);
  inspector.NetworkResources.put(tsUrl, srcAppTs);
};
setNetworkResources().then(() => {
  require('./dist/app');
});
```

Подробнее в официальной документации CDP: [Network.loadNetworkResource](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-loadNetworkResource)

### `inspector.DOMStorage.domStorageItemAdded`

<!-- YAML
added:
  - v25.5.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `storageId` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `securityOrigin` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `storageKey` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `isLocalStorage` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `key` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `newValue` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Доступно только при включённом флаге `--experimental-storage-inspection`.

Рассылает событие `DOMStorage.domStorageItemAdded` подключённым клиентам.
Событие означает, что в хранилище добавлен новый элемент.

### `inspector.DOMStorage.domStorageItemRemoved`

<!-- YAML
added:
  - v25.5.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `storageId` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `securityOrigin` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `storageKey` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `isLocalStorage` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `key` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Доступно только при включённом флаге `--experimental-storage-inspection`.

Рассылает событие `DOMStorage.domStorageItemRemoved` подключённым клиентам.
Событие означает, что элемент удалён из хранилища.

### `inspector.DOMStorage.domStorageItemUpdated`

<!-- YAML
added:
  - v25.5.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `storageId` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `securityOrigin` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `storageKey` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `isLocalStorage` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `key` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `oldValue` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `newValue` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Доступно только при включённом флаге `--experimental-storage-inspection`.

Рассылает событие `DOMStorage.domStorageItemUpdated` подключённым клиентам.
Событие означает, что элемент хранилища обновлён.

### `inspector.DOMStorage.domStorageItemsCleared`

<!-- YAML
added:
  - v25.5.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `storageId` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    * `securityOrigin` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `storageKey` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
    * `isLocalStorage` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Доступно только при включённом флаге `--experimental-storage-inspection`.

Рассылает событие `DOMStorage.domStorageItemsCleared` подключённым клиентам. Событие означает, что все элементы в хранилище очищены.

### `inspector.DOMStorage.registerStorage`

<!-- YAML
added:
  - v25.5.0
-->

* `params` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `isLocalStorage` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
  * `storageMap` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Доступно только при включённом флаге `--experimental-storage-inspection`.

## Поддержка точек останова

Домен [`Debugger` domain][`Debugger` domain] протокола Chrome DevTools позволяет объекту `inspector.Session` подключаться к программе и задавать точки останова для пошагового прохода по коду.

Однако задавать точки останова в `inspector.Session` того же потока, подключённом через [`session.connect()`][`session.connect()`], не следует: приостанавливается та же программа, что и сам отладчик. Вместо этого подключайтесь к основному потоку через [`session.connectToMainThread()`][`session.connectToMainThread()`] и задавайте точки останова в потоке `Worker`, либо используйте отдельную программу [Debugger][Debugger] по WebSocket.

[CPU Profiler]: https://chromedevtools.github.io/devtools-protocol/v8/Profiler
[Chrome DevTools Protocol Viewer]: https://chromedevtools.github.io/devtools-protocol/v8/
[Debugger]: debugger.md
[Heap Profiler]: https://chromedevtools.github.io/devtools-protocol/v8/HeapProfiler
[`'Debugger.paused'`]: https://chromedevtools.github.io/devtools-protocol/v8/Debugger#event-paused
[`Debugger` domain]: https://chromedevtools.github.io/devtools-protocol/v8/Debugger
[`inspector.close()`]: #inspectorclose
[`session.connect()`]: #sessionconnect
[`session.connectToMainThread()`]: #sessionconnecttomainthread
[предупреждение о безопасности]: cli.md#warning-binding-inspector-to-a-public-ipport-combination-is-insecure
[поддержку точек останова]: #support-of-breakpoints
