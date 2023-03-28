# Канал диагностики

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/diagnostics_channel.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:diagnostics_channel`** предоставляет API для создания именованных каналов для передачи произвольных данных сообщений в целях диагностики.

Доступ к нему можно получить с помощью:

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');
    ```

Предполагается, что автор модуля, желающий сообщать диагностические сообщения, создаст один или много каналов верхнего уровня, через которые будут передаваться сообщения. Каналы также могут быть получены во время выполнения, но это не рекомендуется из-за дополнительных накладных расходов. Для удобства каналы могут быть экспортированы, но пока известно их имя, они могут быть получены где угодно.

Если вы планируете, что ваш модуль будет выдавать диагностические данные для других пользователей, рекомендуется включить документацию о том, какие именованные каналы используются вместе с формой данных сообщений. Имена каналов, как правило, должны включать имя модуля, чтобы избежать коллизий с данными других модулей.

## Публичный API

### Обзор

Ниже приведен простой обзор публичного API.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    // Получение многократно используемого объекта канала
    const channel = diagnostics_channel.channel('my-channel');

    function onMessage(message, name) {
    	// Полученные данные
    }

    // Подписаться на канал
    diagnostics_channel.subscribe('my-channel', onMessage);

    // Проверяем, есть ли у канала активный подписчик
    if (channel.hasSubscribers) {
    	// Публикуем данные в канале
    	channel.publish({
    		some: 'data',
    	});
    }

    // Отписаться от канала
    diagnostics_channel.unsubscribe('my-channel', onMessage);
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    // Получение многократно используемого объекта канала
    const channel = diagnostics_channel.channel('my-channel');

    function onMessage(message, name) {
    	// Полученные данные
    }

    // Подписаться на канал
    diagnostics_channel.subscribe('my-channel', onMessage);

    // Проверяем, есть ли у канала активный подписчик
    if (channel.hasSubscribers) {
    	// Публикуем данные в канале
    	channel.publish({
    		some: 'data',
    	});
    }

    // Отписаться от канала
    diagnostics_channel.unsubscribe('my-channel', onMessage);
    ```

#### `diagnostics_channel.hasSubscribers(name)`

- `name` {string|symbol} Имя канала
- Возвращает: {boolean} Если есть активные подписчики

Проверьте, есть ли активные подписчики на названный канал. Это полезно, если сообщение, которое вы хотите отправить, может быть дорого подготовлено.

Этот API необязателен, но полезен при попытке публикации сообщений из очень чувствительного к производительности кода.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    if (diagnostics_channel.hasSubscribers('my-channel')) {
    	// Есть подписчики, подготовить и опубликовать сообщение
    }
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    if (diagnostics_channel.hasSubscribers('my-channel')) {
    	// Есть подписчики, подготовить и опубликовать сообщение
    }
    ```

#### `diagnostics_channel.channel(name)`

- `name` {string|symbol} Имя канала
- Возвращает: {Channel} Объект именованного канала

Это основная точка входа для тех, кто хочет опубликоваться в именованном канале. Он создает объект канала, который оптимизирован для максимального снижения накладных расходов во время публикации.

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

const channel = diagnostics_channel.channel('my-channel');
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

const channel = diagnostics_channel.channel('my-channel');
```

#### `diagnostics_channel.subscribe(name, onMessage)`

- `name` {string|symbol} Имя канала
- `onMessage` {функция} Обработчик для получения сообщений канала
  - `message` {любой} Данные сообщения
  - `name` {string|symbol} Имя канала

Зарегистрируйте обработчик сообщений для подписки на этот канал. Этот обработчик сообщений будет выполняться синхронно каждый раз, когда сообщение будет опубликовано на канале. Любые ошибки, возникающие в обработчике сообщений, будут вызывать [`'uncaughtException'`](process.md#event-uncaughtexception).

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

diagnostics_channel.subscribe(
  'my-channel',
  (message, name) => {
    // Полученные данные
  }
);
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

diagnostics_channel.subscribe(
  'my-channel',
  (message, name) => {
    // Полученные данные
  }
);
```

#### `diagnostics_channel.unsubscribe(name, onMessage)`

- `name` {string|symbol} Имя канала
- `onMessage` {функция} Предыдущий обработчик подписки для удаления
- Возвращает: {boolean} `true`, если обработчик был найден, `false` в противном случае.

Удаляет обработчик сообщений, ранее зарегистрированный на этот канал с помощью [`diagnostics_channel.subscribe(name, onMessage)`](#diagnostics_channelsubscribename-onmessage).

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

function onMessage(message, name) {
  // Полученные данные
}

diagnostics_channel.subscribe('my-channel', onMessage);

diagnostics_channel.unsubscribe('my-channel', onMessage);
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

function onMessage(message, name) {
  // Полученные данные
}

diagnostics_channel.subscribe('my-channel', onMessage);

diagnostics_channel.unsubscribe('my-channel', onMessage);
```

### Класс: `Channel`

Класс `Channel` представляет индивидуальный именованный канал в конвейере данных. Он используется для отслеживания подписчиков и публикации сообщений при наличии подписчиков. Он существует как отдельный объект, чтобы избежать поиска канала во время публикации, обеспечивая очень высокую скорость публикации и возможность интенсивного использования при минимальных затратах. Каналы создаются с помощью [`diagnostics_channel.channel(name)`](#diagnostics_channelchannelname), создание канала напрямую с помощью `new Channel(name)` не поддерживается.

#### `channel.hasSubscribers`

- Возвращает: {boolean} Если есть активные подписчики

Проверяет, есть ли активные подписчики у этого канала. Это полезно, если сообщение, которое вы хотите отправить, может быть дорогостоящим в подготовке.

Этот API необязателен, но полезен при попытке публикации сообщений из очень чувствительного к производительности кода.

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

const channel = diagnostics_channel.channel('my-channel');

if (channel.hasSubscribers) {
  // Подписчики есть, подготавливаем и публикуем сообщение
}
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

const channel = diagnostics_channel.channel('my-channel');

if (channel.hasSubscribers) {
  // Подписчики есть, подготавливаем и публикуем сообщение
}
```

#### `channel.publish(message)`

- `message` {any} Сообщение для отправки подписчикам канала

Публикует сообщение всем подписчикам канала. При этом обработчики сообщений будут запускаться синхронно, поэтому они будут выполняться в одном и том же контексте.

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

const channel = diagnostics_channel.channel('my-channel');

channel.publish({
  some: 'message',
});
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

const channel = diagnostics_channel.channel('my-channel');

channel.publish({
  some: 'message',
});
```

#### `channel.subscribe(onMessage)`

> Стабильность: 0 - Исправлено: Используйте [`diagnostics_channel.subscribe(name, onMessage)`](#diagnostics_channelsubscribename-onmessage)

- `onMessage` {Функция} Обработчик для получения сообщений канала
  - `message` {любой} Данные сообщения
  - `name` {string|symbol} Имя канала

Зарегистрируйте обработчик сообщений для подписки на этот канал. Этот обработчик сообщений будет выполняться синхронно каждый раз, когда сообщение будет опубликовано на канале. Любые ошибки, возникающие в обработчике сообщений, будут вызывать [`'uncaughtException'`](process.md#event-uncaughtexception).

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

const channel = diagnostics_channel.channel('my-channel');

channel.subscribe((message, name) => {
  // Полученные данные
});
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

const channel = diagnostics_channel.channel('my-channel');

channel.subscribe((message, name) => {
  // Полученные данные
});
```

#### `channel.unsubscribe(onMessage)`

> Стабильность: 0 - Исправлено: Используйте [`diagnostics_channel.unsubscribe(name, onMessage)`](#diagnostics_channelunsubscribename-onmessage)

- `onMessage` {Function} Предыдущий обработчик подписки для удаления
- Возвращает: {boolean} `true`, если обработчик был найден, `false` в противном случае.

Удаление обработчика сообщений, ранее зарегистрированного на этот канал с помощью [`channel.subscribe(onMessage)`](#channelsubscribeonmessage).

```mjs
import diagnostics_channel from 'node:diagnostics_channel';

const channel = diagnostics_channel.channel('my-channel');

function onMessage(message, name) {
  // Полученные данные
}

channel.subscribe(onMessage);

channel.unsubscribe(onMessage);
```

```cjs
const diagnostics_channel = require('node:diagnostics_channel');

const channel = diagnostics_channel.channel('my-channel');

function onMessage(message, name) {
  // Полученные данные
}

channel.subscribe(onMessage);

channel.unsubscribe(onMessage);
```

### Встроенные каналы

> Стабильность: 1 - Экспериментальный

В то время как API diagnostics_channel теперь считается стабильным, встроенные каналы, доступные в настоящее время, таковыми не являются. Каждый канал должен быть объявлен стабильным независимо.

#### HTTP

`http.client.request.start`

- `запрос` {http.ClientRequest}

Выдается, когда клиент начинает запрос.

`http.client.response.finish`

- `запрос` {http.ClientRequest}
- `response` {http.IncomingMessage}

Выдается, когда клиент получает ответ.

`http.server.request.start`

- `запрос` {http.IncomingMessage}
- `response` {http.ServerResponse}
- `сокет` {net.Socket}
- `server` {http.Server}

Выдается, когда сервер получает запрос.

`http.server.response.finish`

- `запрос` {http.IncomingMessage}
- `ответ` {http.ServerResponse}
- `socket` {net.Socket}
- `server` {http.Server}

Выдается, когда сервер посылает ответ.

#### NET

`net.client.socket`

- `socket` {net.Socket}

Выдается при создании нового клиентского сокета TCP или pipe.

`net.server.socket`

- `socket` {net.Socket}

Выдается при получении нового TCP- или pipe-соединения.

#### UDP

`udp.socket`

- `socket` {dgram.Socket}

Выдается при создании нового UDP сокета.

#### Процесс

`детский_процесс`

- `process` {ChildProcess}

Выдается при создании нового процесса.

#### Рабочий поток

`worker_threads`

- `worker` [`Worker`](worker_threads.md#class-worker)

Выдается при создании нового потока.
