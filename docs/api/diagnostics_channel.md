---
title: Diagnostics Channel
description: Модуль node:diagnostics_channel — именованные каналы для диагностических сообщений, TracingChannel и встроенные события ядра
---

# Канал диагностики

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/diagnostics_channel.html)

<!-- YAML
added:
  - v15.1.0
  - v14.17.0
changes:
  - version:
      - v19.2.0
      - v18.13.0
    pr-url: https://github.com/nodejs/node/pull/45290
    description: diagnostics_channel is now Stable.
-->

<!--introduced_in=v15.1.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/diagnostics_channel.js -->

Модуль `node:diagnostics_channel` предоставляет API для создания именованных каналов передачи произвольных данных в целях диагностики.

Подключение:

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');
    ```

Обычно автор модуля, которому нужны диагностические сообщения, создаёт один или несколько каналов верхнего уровня. Каналы можно получать и во время выполнения, но это нежелательно из‑за накладных расходов. Каналы можно экспортировать для удобства; если известно имя, канал можно получить откуда угодно.

Если модуль должен отдавать диагностические данные потребителям, задокументируйте используемые имена каналов и форму сообщений. В имена обычно включают имя модуля, чтобы избежать коллизий.

## Публичный API

### Обзор

Краткий обзор публичного API.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    // Получить переиспользуемый объект канала
    const channel = diagnostics_channel.channel('my-channel');

    function onMessage(message, name) {
      // Полученные данные
    }

    // Подписка на канал
    diagnostics_channel.subscribe('my-channel', onMessage);

    // Проверка активных подписчиков
    if (channel.hasSubscribers) {
      // Публикация в канал
      channel.publish({
        some: 'data',
      });
    }

    // Отписка
    diagnostics_channel.unsubscribe('my-channel', onMessage);
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channel = diagnostics_channel.channel('my-channel');

    function onMessage(message, name) {
      // Полученные данные
    }

    diagnostics_channel.subscribe('my-channel', onMessage);

    if (channel.hasSubscribers) {
      channel.publish({
        some: 'data',
      });
    }

    diagnostics_channel.unsubscribe('my-channel', onMessage);
    ```

#### `diagnostics_channel.hasSubscribers(name)`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) имя канала
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) есть ли активные подписчики

Проверяет наличие активных подписчиков у именованного канала. Полезно, если подготовка сообщения может быть дорогой.

API необязательно, но удобно при публикации из кода, критичного к производительности.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    if (diagnostics_channel.hasSubscribers('my-channel')) {
      // Есть подписчики — подготовить и опубликовать сообщение
    }
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    if (diagnostics_channel.hasSubscribers('my-channel')) {
      // Есть подписчики — подготовить и опубликовать сообщение
    }
    ```

#### `diagnostics_channel.channel(name)`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) имя канала
* Возвращает: [`<Channel>`](diagnostics_channel.md) объект именованного канала

Основная точка входа для публикации в именованный канал. Возвращает объект канала, оптимизированный для минимальных накладных расходов при публикации.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channel = diagnostics_channel.channel('my-channel');
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channel = diagnostics_channel.channel('my-channel');
    ```

#### `diagnostics_channel.subscribe(name, onMessage)`

<!-- YAML
added:
 - v18.7.0
 - v16.17.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) имя канала
* `onMessage` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) обработчик сообщений канала
  * `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) данные сообщения
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) имя канала

Регистрирует обработчик подписки на канал. Обработчик вызывается синхронно при каждой публикации. Ошибки в обработчике приводят к [`'uncaughtException'`](process.md#event-uncaughtexception).

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    diagnostics_channel.subscribe('my-channel', (message, name) => {
      // Полученные данные
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    diagnostics_channel.subscribe('my-channel', (message, name) => {
      // Полученные данные
    });
    ```

#### `diagnostics_channel.unsubscribe(name, onMessage)`

<!-- YAML
added:
 - v18.7.0
 - v16.17.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) имя канала
* `onMessage` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ранее зарегистрированный обработчик для удаления
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если обработчик найден, иначе `false`.

Удаляет обработчик, ранее зарегистрированный через [`diagnostics_channel.subscribe(name, onMessage)`](#diagnostics_channelsubscribename-onmessage).

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    function onMessage(message, name) {
      // Полученные данные
    }

    diagnostics_channel.subscribe('my-channel', onMessage);

    diagnostics_channel.unsubscribe('my-channel', onMessage);
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    function onMessage(message, name) {
      // Полученные данные
    }

    diagnostics_channel.subscribe('my-channel', onMessage);

    diagnostics_channel.unsubscribe('my-channel', onMessage);
    ```

#### `diagnostics_channel.tracingChannel(nameOrChannels)`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

* `nameOrChannels` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<TracingChannel>`](#class-tracingchannel) имя канала или объект со всеми [каналами TracingChannel][TracingChannel Channels]
* Возвращает: [`<TracingChannel>`](#class-tracingchannel) набор каналов для трассировки

Создаёт обёртку [`TracingChannel`](#class-tracingchannel) для заданных [каналов TracingChannel][TracingChannel Channels]. Если передано имя, соответствующие каналы трассировки создаются в виде `tracing:${name}:${eventType}`, где `eventType` соответствует типам [каналов TracingChannel][TracingChannel Channels].

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channelsByName = diagnostics_channel.tracingChannel('my-channel');

    // или...

    const channelsByCollection = diagnostics_channel.tracingChannel({
      start: diagnostics_channel.channel('tracing:my-channel:start'),
      end: diagnostics_channel.channel('tracing:my-channel:end'),
      asyncStart: diagnostics_channel.channel('tracing:my-channel:asyncStart'),
      asyncEnd: diagnostics_channel.channel('tracing:my-channel:asyncEnd'),
      error: diagnostics_channel.channel('tracing:my-channel:error'),
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channelsByName = diagnostics_channel.tracingChannel('my-channel');

    // или...

    const channelsByCollection = diagnostics_channel.tracingChannel({
      start: diagnostics_channel.channel('tracing:my-channel:start'),
      end: diagnostics_channel.channel('tracing:my-channel:end'),
      asyncStart: diagnostics_channel.channel('tracing:my-channel:asyncStart'),
      asyncEnd: diagnostics_channel.channel('tracing:my-channel:asyncEnd'),
      error: diagnostics_channel.channel('tracing:my-channel:error'),
    });
    ```

#### `diagnostics_channel.boundedChannel(nameOrChannels)`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

* `nameOrChannels` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<BoundedChannel>`](#class-boundedchannel) имя канала или объект со всеми [каналами BoundedChannel][BoundedChannel Channels]
* Возвращает: [`<BoundedChannel>`](#class-boundedchannel) набор каналов для трассировки

Создаёт обёртку [`BoundedChannel`](#class-boundedchannel) для заданных каналов. Если передано имя, каналы создаются в виде `tracing:${name}:${eventType}`, где `eventType` — `start` или `end`.

`BoundedChannel` — упрощённый вариант [`TracingChannel`](#class-tracingchannel): трассируются только синхронные операции; есть только события `start` и `end` без `asyncStart`, `asyncEnd` и `error`, что подходит для операций без асинхронных продолжений и отдельной обработки ошибок.

=== "MJS"

    ```js
    import { boundedChannel, channel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    // или...

    const wc2 = boundedChannel({
      start: channel('tracing:my-operation:start'),
      end: channel('tracing:my-operation:end'),
    });
    ```

=== "CJS"

    ```js
    const { boundedChannel, channel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    // или...

    const wc2 = boundedChannel({
      start: channel('tracing:my-operation:start'),
      end: channel('tracing:my-operation:end'),
    });
    ```

### Класс: `Channel`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
-->

Класс `Channel` представляет отдельный именованный канал в конвейере данных. Отслеживает подписчиков и публикует сообщения при их наличии. Отдельный объект нужен, чтобы не выполнять поиск канала при публикации — это даёт высокую скорость публикации и низкую стоимость при активном использовании. Каналы создаются через [`diagnostics_channel.channel(name)`](#diagnostics_channelchannelname); прямой вызов `new Channel(name)` не поддерживается.

#### `channel.hasSubscribers`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) есть ли активные подписчики

Проверяет наличие активных подписчиков у этого канала. Полезно, если подготовка сообщения может быть дорогой.

API необязательно, но удобно при публикации из кода, критичного к производительности.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channel = diagnostics_channel.channel('my-channel');

    if (channel.hasSubscribers) {
      // Есть подписчики — подготовить и опубликовать сообщение
    }
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channel = diagnostics_channel.channel('my-channel');

    if (channel.hasSubscribers) {
      // Есть подписчики — подготовить и опубликовать сообщение
    }
    ```

#### `channel.publish(message)`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
-->

* `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) сообщение для подписчиков канала

Публикует сообщение всем подписчикам канала. Обработчики вызываются синхронно в том же контексте.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channel = diagnostics_channel.channel('my-channel');

    channel.publish({
      some: 'message',
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channel = diagnostics_channel.channel('my-channel');

    channel.publish({
      some: 'message',
    });
    ```

#### `channel.subscribe(onMessage)`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
changes:
  - version:
    - v24.8.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59758
    description: Deprecation revoked.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/44943
    description: Documentation-only deprecation.
-->

* `onMessage` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) обработчик сообщений канала
  * `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) данные сообщения
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) имя канала

Регистрирует обработчик подписки на этот канал. Обработчик выполняется синхронно при каждой публикации. Ошибки в обработчике приводят к [`'uncaughtException'`](process.md#event-uncaughtexception).

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channel = diagnostics_channel.channel('my-channel');

    channel.subscribe((message, name) => {
      // Полученные данные
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channel = diagnostics_channel.channel('my-channel');

    channel.subscribe((message, name) => {
      // Полученные данные
    });
    ```

#### `channel.unsubscribe(onMessage)`

<!-- YAML
added:
 - v15.1.0
 - v14.17.0
changes:
  - version:
    - v24.8.0
    - v22.20.0
    pr-url: https://github.com/nodejs/node/pull/59758
    description: Deprecation revoked.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/44943
    description: Documentation-only deprecation.
  - version:
    - v17.1.0
    - v16.14.0
    - v14.19.0
    pr-url: https://github.com/nodejs/node/pull/40433
    description: Added return value. Added to channels without subscribers.
-->

* `onMessage` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ранее зарегистрированный обработчик для удаления
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если обработчик найден, иначе `false`.

Удаляет обработчик, ранее зарегистрированный через [`channel.subscribe(onMessage)`](#channelsubscribeonmessage).

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channel = diagnostics_channel.channel('my-channel');

    function onMessage(message, name) {
      // Полученные данные
    }

    channel.subscribe(onMessage);

    channel.unsubscribe(onMessage);
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channel = diagnostics_channel.channel('my-channel');

    function onMessage(message, name) {
      // Полученные данные
    }

    channel.subscribe(onMessage);

    channel.unsubscribe(onMessage);
    ```

#### `channel.bindStore(store[, transform])`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


* `store` [`<AsyncLocalStorage>`](async_context.md#class-asynclocalstorage) хранилище для привязки контекста
* `transform` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) преобразование данных контекста перед установкой в хранилище

При вызове [`channel.runStores(context, ...)`](#channelrunstorescontext-fn-thisarg-args) указанные данные контекста применяются ко всем хранилищам, привязанным к каналу. Если хранилище уже было привязано, предыдущая функция `transform` заменяется новой. Функцию `transform` можно опустить — тогда данные контекста задают контекст хранилища напрямую.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';
    import { AsyncLocalStorage } from 'node:async_hooks';

    const store = new AsyncLocalStorage();

    const channel = diagnostics_channel.channel('my-channel');

    channel.bindStore(store, (data) => {
      return { data };
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');
    const { AsyncLocalStorage } = require('node:async_hooks');

    const store = new AsyncLocalStorage();

    const channel = diagnostics_channel.channel('my-channel');

    channel.bindStore(store, (data) => {
      return { data };
    });
    ```

#### `channel.unbindStore(store)`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


* `store` [`<AsyncLocalStorage>`](async_context.md#class-asynclocalstorage) хранилище для отвязки от канала
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если хранилище найдено, иначе `false`.

Удаляет привязку хранилища, ранее созданную [`channel.bindStore(store)`](#channelbindstorestore-transform).

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';
    import { AsyncLocalStorage } from 'node:async_hooks';

    const store = new AsyncLocalStorage();

    const channel = diagnostics_channel.channel('my-channel');

    channel.bindStore(store);
    channel.unbindStore(store);
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');
    const { AsyncLocalStorage } = require('node:async_hooks');

    const store = new AsyncLocalStorage();

    const channel = diagnostics_channel.channel('my-channel');

    channel.bindStore(store);
    channel.unbindStore(store);
    ```

#### `channel.runStores(context, fn[, thisArg[, ...args]])`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


* `context` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) сообщение для подписчиков и привязки к хранилищам
* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция, выполняемая во введённом контексте хранилища
* `thisArg` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение `this` для вызова функции
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) необязательные аргументы функции

Применяет данные ко всем экземплярам `AsyncLocalStorage`, привязанным к каналу, на время выполнения `fn`, затем публикует в канал в области, где данные применены к хранилищам.

Если в [`channel.bindStore(store)`](#channelbindstorestore-transform) задана функция преобразования, она применяется к данным сообщения до того, как они станут контекстом хранилища. Предыдущий контекст хранилища доступен внутри `transform`, если нужна связка контекстов.

Контекст хранилища должен быть доступен в асинхронном коде, продолжающем выполнение, начатое в `fn`; однако возможна [потеря контекста][context loss].

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';
    import { AsyncLocalStorage } from 'node:async_hooks';

    const store = new AsyncLocalStorage();

    const channel = diagnostics_channel.channel('my-channel');

    channel.bindStore(store, (message) => {
      const parent = store.getStore();
      return new Span(message, parent);
    });
    channel.runStores({ some: 'message' }, () => {
      store.getStore(); // Span({ some: 'message' })
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');
    const { AsyncLocalStorage } = require('node:async_hooks');

    const store = new AsyncLocalStorage();

    const channel = diagnostics_channel.channel('my-channel');

    channel.bindStore(store, (message) => {
      const parent = store.getStore();
      return new Span(message, parent);
    });
    channel.runStores({ some: 'message' }, () => {
      store.getStore(); // Span({ some: 'message' })
    });
    ```

#### `channel.withStoreScope(data)`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


* `data` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) данные для привязки к хранилищам
* Возвращает: [`<RunStoresScope>`](diagnostics_channel.md) объект области видимости с `Disposable`

Создаёт область с автоматическим освобождением: привязывает данные к экземплярам `AsyncLocalStorage`, привязанным к каналу, и публикует их подписчикам. При освобождении восстанавливает предыдущие контексты хранилищ.

Позволяет использовать явное управление ресурсами в JavaScript (синтаксис `using` и `Symbol.dispose`) без обёртки в замыкание.

=== "MJS"

    ```js
    import { channel } from 'node:diagnostics_channel';
    import { AsyncLocalStorage } from 'node:async_hooks';

    const store = new AsyncLocalStorage();
    const ch = channel('my-channel');

    ch.bindStore(store, (message) => {
      return { ...message, timestamp: Date.now() };
    });

    {
      using scope = ch.withStoreScope({ request: 'data' });
      // Store is entered, data is published
      console.log(store.getStore()); // { request: 'data', timestamp: ... }
    }
    // Store is automatically restored on scope exit
    ```

=== "CJS"

    ```js
    const { channel } = require('node:diagnostics_channel');
    const { AsyncLocalStorage } = require('node:async_hooks');

    const store = new AsyncLocalStorage();
    const ch = channel('my-channel');

    ch.bindStore(store, (message) => {
      return { ...message, timestamp: Date.now() };
    });

    {
      using scope = ch.withStoreScope({ request: 'data' });
      // Store is entered, data is published
      console.log(store.getStore()); // { request: 'data', timestamp: ... }
    }
    // Store is automatically restored on scope exit
    ```

### Класс: `RunStoresScope`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


Класс `RunStoresScope` — область с `Disposable`, создаваемая [`channel.withStoreScope(data)`](#channelwithstorescopedata). Управляет жизненным циклом контекстов хранилищ и восстанавливает их при выходе из области.

Область нужно использовать с синтаксисом `using`, чтобы гарантировать освобождение.

### Класс: `TracingChannel`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


Класс `TracingChannel` объединяет [каналы TracingChannel][TracingChannel Channels], описывающие одно трассируемое действие. Формализует и упрощает генерацию событий для трассировки потока выполнения. Экземпляр создаётся через [`diagnostics_channel.tracingChannel()`](#diagnostics_channeltracingchannelnameorchannels). Как и для `Channel`, рекомендуется создавать один `TracingChannel` на уровне модуля и переиспользовать, а не создавать динамически.

#### `tracingChannel.subscribe(subscribers)`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

* `subscribers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) набор подписчиков [каналов TracingChannel][TracingChannel Channels]
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события [`событие start`](#startevent)
  * `end` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события [`событие end`](#endevent)
  * `asyncStart` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события [`событие asyncStart`](#asyncstartevent)
  * `asyncEnd` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события [`событие asyncEnd`](#asyncendevent)
  * `error` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события [`событие error`](#errorevent)

Вспомогательный метод подписки набора функций на соответствующие каналы. Эквивалентно вызову [`channel.subscribe(onMessage)`](#channelsubscribeonmessage) для каждого канала по отдельности.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.subscribe({
      start(message) {
        // Handle start message
      },
      end(message) {
        // Handle end message
      },
      asyncStart(message) {
        // Handle asyncStart message
      },
      asyncEnd(message) {
        // Handle asyncEnd message
      },
      error(message) {
        // Handle error message
      },
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.subscribe({
      start(message) {
        // Handle start message
      },
      end(message) {
        // Handle end message
      },
      asyncStart(message) {
        // Handle asyncStart message
      },
      asyncEnd(message) {
        // Handle asyncEnd message
      },
      error(message) {
        // Handle error message
      },
    });
    ```

#### `tracingChannel.unsubscribe(subscribers)`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

* `subscribers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) набор подписчиков [каналов TracingChannel][TracingChannel Channels]
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик [`событие start`](#startevent)
  * `end` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик [`событие end`](#endevent)
  * `asyncStart` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик [`событие asyncStart`](#asyncstartevent)
  * `asyncEnd` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик [`событие asyncEnd`](#asyncendevent)
  * `error` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик [`событие error`](#errorevent)
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если все обработчики сняты, иначе `false`.

Отписка набора функций от соответствующих каналов. Эквивалентно [`channel.unsubscribe(onMessage)`](#channelunsubscribeonmessage) на каждом канале отдельно.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.unsubscribe({
      start(message) {
        // Handle start message
      },
      end(message) {
        // Handle end message
      },
      asyncStart(message) {
        // Handle asyncStart message
      },
      asyncEnd(message) {
        // Handle asyncEnd message
      },
      error(message) {
        // Handle error message
      },
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.unsubscribe({
      start(message) {
        // Handle start message
      },
      end(message) {
        // Handle end message
      },
      asyncStart(message) {
        // Handle asyncStart message
      },
      asyncEnd(message) {
        // Handle asyncEnd message
      },
      error(message) {
        // Handle error message
      },
    });
    ```

#### `tracingChannel.traceSync(fn[, context[, thisArg[, ...args]]])`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция для обёртки трассировкой
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) общий объект для корреляции событий
* `thisArg` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение `this` для вызова
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) необязательные аргументы функции
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат вызова `fn`

Трассирует синхронный вызов: всегда генерируются [`событие start`](#startevent) и [`событие end`](#endevent) вокруг выполнения и при необходимости [`событие error`](#errorevent), если функция выбросила ошибку. Функция выполняется через [`channel.runStores(context, ...)`](#channelrunstorescontext-fn-thisarg-args) на канале `start`, чтобы привязанные хранилища соответствовали контексту трассировки.

События публикуются только если подписчики есть до начала трассировки; подписки после старта не получат события этой трассировки.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.traceSync(() => {
      // Do something
    }, {
      some: 'thing',
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.traceSync(() => {
      // Do something
    }, {
      some: 'thing',
    });
    ```

#### `tracingChannel.tracePromise(fn[, context[, thisArg[, ...args]]])`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/61766
    description: Custom thenables will no longer be wrapped in native Promises.
                 Non-thenables will be returned with a warning.
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция для обёртки трассировкой
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) общий объект для корреляции событий трассировки
* `thisArg` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение `this` для вызова
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) необязательные аргументы функции
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат `fn` или результат `.then(...)`, если у канала трассировки есть активные подписчики. Если значение не `Promise` и не thenable, оно возвращается как есть и выводится предупреждение.

Трассирует асинхронный вызов, возвращающий [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) или [thenable-объект][thenable-объект]. Всегда генерируются [`событие start`](#startevent) и [`событие end`](#endevent) вокруг синхронной части; при разрешении или отклонении промиса — [`событие asyncStart`](#asyncstartevent) и [`событие asyncEnd`](#asyncendevent). Возможен [`событие error`](#errorevent), если функция выбросила ошибку или промис отклонён. Выполнение идёт через [`channel.runStores(context, ...)`](#channelrunstorescontext-fn-thisarg-args) на канале `start`.

Если `fn` вернула не промис и не thenable, значение возвращается с предупреждением, без событий `asyncStart` и `asyncEnd`.

События публикуются только если подписчики есть до начала трассировки.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.tracePromise(async () => {
      // Do something
    }, {
      some: 'thing',
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.tracePromise(async () => {
      // Do something
    }, {
      some: 'thing',
    });
    ```

#### `tracingChannel.traceCallback(fn[, position[, context[, thisArg[, ...args]]]])`

<!-- YAML
added:
 - v19.9.0
 - v18.19.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция, принимающая колбэк, для обёртки трассировкой
* `position` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) индекс (с нуля) аргумента с ожидаемым колбэком (по умолчанию — последний аргумент, если передан `undefined`)
* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) общий объект корреляции (по умолчанию `{}`, если `undefined`)
* `thisArg` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение `this` для вызова
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) аргументы вызова (должен включать колбэк)
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат вызова `fn`

Трассирует вызов функции с колбэком в типичной конвенции «ошибка первым аргументом». Всегда даёт [`событие start`](#startevent) и [`событие end`](#endevent) вокруг синхронной части и [`событие asyncStart`](#asyncstartevent) с [`событие asyncEnd`](#asyncendevent) вокруг выполнения колбэка. Возможен [`событие error`](#errorevent), если функция выбросила ошибку или в колбэк передан первый аргумент (ошибка). Выполнение через [`channel.runStores(context, ...)`](#channelrunstorescontext-fn-thisarg-args) на канале `start`.

События публикуются только если подписчики есть до начала трассировки.

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.traceCallback((arg1, callback) => {
      // Do something
      callback(null, 'result');
    }, 1, {
      some: 'thing',
    }, thisArg, arg1, callback);
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channels = diagnostics_channel.tracingChannel('my-channel');

    channels.traceCallback((arg1, callback) => {
      // Do something
      callback(null, 'result');
    }, 1, {
      some: 'thing',
    }, thisArg, arg1, callback);
    ```

Колбэк также выполняется внутри [`channel.runStores(context, ...)`](#channelrunstorescontext-fn-thisarg-args), что в ряде случаев помогает восстановить контекст после [потери контекста][context loss].

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';
    import { AsyncLocalStorage } from 'node:async_hooks';

    const channels = diagnostics_channel.tracingChannel('my-channel');
    const myStore = new AsyncLocalStorage();

    // Канал start задаёт начальные данные хранилища и сохраняет значение в объекте контекста трассировки
    channels.start.bindStore(myStore, (data) => {
      const span = new Span(data);
      data.span = span;
      return span;
    });

    // asyncStart может восстановить контекст из ранее сохранённых данных
    channels.asyncStart.bindStore(myStore, (data) => {
      return data.span;
    });
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');
    const { AsyncLocalStorage } = require('node:async_hooks');

    const channels = diagnostics_channel.tracingChannel('my-channel');
    const myStore = new AsyncLocalStorage();

    channels.start.bindStore(myStore, (data) => {
      const span = new Span(data);
      data.span = span;
      return span;
    });

    channels.asyncStart.bindStore(myStore, (data) => {
      return data.span;
    });
    ```

#### `tracingChannel.hasSubscribers`

<!-- YAML
added:
 - v22.0.0
 - v20.13.0
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если хотя бы у одного из каналов есть подписчик, иначе `false`.

Вспомогательное свойство экземпляра [`TracingChannel`](#class-tracingchannel): есть ли подписчики у любого из [каналов TracingChannel][TracingChannel Channels].

=== "MJS"

    ```js
    import diagnostics_channel from 'node:diagnostics_channel';

    const channels = diagnostics_channel.tracingChannel('my-channel');

    if (channels.hasSubscribers) {
      // Do something
    }
    ```

=== "CJS"

    ```js
    const diagnostics_channel = require('node:diagnostics_channel');

    const channels = diagnostics_channel.tracingChannel('my-channel');

    if (channels.hasSubscribers) {
      // Do something
    }
    ```

### Класс: `BoundedChannel`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


Класс `BoundedChannel` — упрощённый [`TracingChannel`](#class-tracingchannel): трассируются только синхронные операции; два канала (`start` и `end`) вместо пяти, без `asyncStart`, `asyncEnd` и `error`. Подходит для операций без асинхронных продолжений и отдельной обработки ошибок.

Как и для `TracingChannel`, рекомендуется один экземпляр на уровне модуля.

#### `boundedChannel.hasSubscribers`

<!-- YAML
added: REPLACEME
-->

* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если у одного из каналов есть подписчик, иначе `false`.

Проверяет наличие подписчиков у каналов `start` или `end`.

=== "MJS"

    ```js
    import { boundedChannel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    if (wc.hasSubscribers) {
      // Есть подписчики — выполнить трассируемую операцию
    }
    ```

=== "CJS"

    ```js
    const { boundedChannel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    if (wc.hasSubscribers) {
      // Есть подписчики — выполнить трассируемую операцию
    }
    ```

#### `boundedChannel.subscribe(handlers)`

<!-- YAML
added: REPLACEME
-->

* `handlers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) подписчики каналов
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события start
  * `end` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события end

Подписка на события bounded-канала. Эквивалентно [`channel.subscribe(onMessage)`](#channelsubscribeonmessage) для каждого канала.

=== "MJS"

    ```js
    import { boundedChannel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    wc.subscribe({
      start(message) {
        // Handle start
      },
      end(message) {
        // Handle end
      },
    });
    ```

=== "CJS"

    ```js
    const { boundedChannel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    wc.subscribe({
      start(message) {
        // Handle start
      },
      end(message) {
        // Handle end
      },
    });
    ```

#### `boundedChannel.unsubscribe(handlers)`

<!-- YAML
added: REPLACEME
-->

* `handlers` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) подписчики каналов
  * `start` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события start
  * `end` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) подписчик события end
* Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `true`, если все обработчики сняты, иначе `false`.

Отписка от событий bounded-канала. Эквивалентно [`channel.unsubscribe(onMessage)`](#channelunsubscribeonmessage) на каждом канале.

=== "MJS"

    ```js
    import { boundedChannel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    const handlers = {
      start(message) {},
      end(message) {},
    };

    wc.subscribe(handlers);
    wc.unsubscribe(handlers);
    ```

=== "CJS"

    ```js
    const { boundedChannel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    const handlers = {
      start(message) {},
      end(message) {},
    };

    wc.subscribe(handlers);
    wc.unsubscribe(handlers);
    ```

#### `boundedChannel.run(context, fn[, thisArg[, ...args]])`

<!-- YAML
added: REPLACEME
-->

* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) общий объект корреляции событий
* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция для обёртки трассировкой
* `thisArg` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение `this` для вызова
* `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) необязательные аргументы функции
* Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) результат вызова `fn`

Трассирует синхронный вызов: события `start` и `end` вокруг выполнения. Функция выполняется через [`channel.runStores(context, ...)`](#channelrunstorescontext-fn-thisarg-args) на канале `start`.

=== "MJS"

    ```js
    import { boundedChannel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    const result = wc.run({ operationId: '123' }, () => {
      // Perform operation
      return 42;
    });
    ```

=== "CJS"

    ```js
    const { boundedChannel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    const result = wc.run({ operationId: '123' }, () => {
      // Perform operation
      return 42;
    });
    ```

#### `boundedChannel.withScope([context])`

<!-- YAML
added: REPLACEME
-->

* `context` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) общий объект корреляции событий
* Возвращает: [`<BoundedChannelScope>`](diagnostics_channel.md) объект области с `Disposable`

Создаёт область для трассировки синхронной операции с явным управлением ресурсами (синтаксис `using`). Публикует события `start` и `end`, входит в привязанные хранилища и выполняет очистку при освобождении.

=== "MJS"

    ```js
    import { boundedChannel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    const context = { operationId: '123' };
    {
      using scope = wc.withScope(context);
      // Stores are entered, start event is published

      // Perform work and set result on context
      context.result = 42;
    }
    // End event is published, stores are restored automatically
    ```

=== "CJS"

    ```js
    const { boundedChannel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    const context = { operationId: '123' };
    {
      using scope = wc.withScope(context);
      // Stores are entered, start event is published

      // Perform work and set result on context
      context.result = 42;
    }
    // End event is published, stores are restored automatically
    ```

### Класс: `BoundedChannelScope`

<!-- YAML
added: REPLACEME
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


Класс `BoundedChannelScope` — область с `Disposable`, создаваемая [`boundedChannel.withScope(context)`](#boundedchannelwithscopecontext). Управляет жизненным циклом трассируемой операции, публикует события и контексты хранилищ.

Использовать только с синтаксисом `using`.

=== "MJS"

    ```js
    import { boundedChannel } from 'node:diagnostics_channel';

    const wc = boundedChannel('my-operation');

    const context = {};
    {
      using scope = wc.withScope(context);
      // Start event is published, stores are entered
      context.result = performOperation();
      // End event is automatically published at end of block
    }
    ```

=== "CJS"

    ```js
    const { boundedChannel } = require('node:diagnostics_channel');

    const wc = boundedChannel('my-operation');

    const context = {};
    {
      using scope = wc.withScope(context);
      // Start event is published, stores are entered
      context.result = performOperation();
      // End event is automatically published at end of block
    }
    ```

### Каналы BoundedChannel {: #boundedchannel-channels}

`BoundedChannel` состоит из двух каналов диагностики, описывающих жизненный цикл области, созданной синтаксисом `using`:

* `tracing:${name}:start` — публикуется при выполнении оператора `using` (создание области)
* `tracing:${name}:end` — публикуется при выходе из блока (освобождение области)

При использовании `using` с [`boundedChannel.withScope([context])`][] событие `start` публикуется сразу при входе в оператор, а `end` — автоматически при освобождении в конце блока. Все события разделяют один объект контекста, который при выполнении области можно дополнять полями вроде `result`.

### Каналы TracingChannel {: #tracingchannel-channels}

`TracingChannel` — набор нескольких `diagnostics_channel`, соответствующих этапам жизненного цикла одного трассируемого действия. Поведение разбито на пять каналов: `start`, `end`, `asyncStart`, `asyncEnd` и `error`. Одно трассируемое действие использует один и тот же объект события во всех точках — это удобно для корреляции (например через `WeakMap`).

При «завершении» задачи объект события дополняется полями `result` или `error`. Для синхронной задачи `result` — возвращаемое значение, `error` — исключение из функции. Для асинхронных функций с колбэком `result` — второй аргумент колбэка, а `error` — либо исключение, видимое в событии `end`, либо первый аргумент колбэка в событиях `asyncStart` или `asyncEnd`.

Чтобы граф трассировки был корректным, события следует публиковать только если подписчики уже есть до начала трассировки. Подписки, добавленные после старта, не получат события текущей трассировки — только последующих.

Имена каналов трассировки рекомендуется задавать по шаблону:

* `tracing:module.class.method:start` или `tracing:module.function:start`
* `tracing:module.class.method:end` или `tracing:module.function:end`
* `tracing:module.class.method:asyncStart` или `tracing:module.function:asyncStart`
* `tracing:module.class.method:asyncEnd` или `tracing:module.function:asyncEnd`
* `tracing:module.class.method:error` или `tracing:module.function:error`

#### `start(event)`

* Имя: `tracing:${name}:start`

Событие `start` — момент вызова функции. В данных события могут быть аргументы функции или любая информация, доступная в самом начале выполнения.

#### `end(event)`

* Имя: `tracing:${name}:end`

Событие `end` — момент возврата значения из вызова функции. Для асинхронной функции это момент возврата промиса, а не внутреннего `return` в теле. Если трассируемая функция синхронна, поле `result` содержит возвращаемое значение; при ошибке может быть поле `error`.

Рекомендуется отдельно слушать событие `error`: одно трассируемое действие может породить несколько ошибок (например внутренняя асинхронная задача завершилась ошибкой до того, как синхронная часть выбросила исключение).

#### `asyncStart(event)`

* Имя: `tracing:${name}:asyncStart`

Событие `asyncStart` — достижение колбэка или продолжения трассируемой функции. Здесь доступны аргументы колбэка и др., описывающие «результат» действия.

Для функций с колбэком первый аргумент присваивается полю `error`, если он не `undefined` и не `null`, второй — полю `result`.

Для промисов аргумент `resolve` попадает в `result`, аргумент `reject` — в `error`.

Снова рекомендуется слушать `error` отдельно по тем же причинам, что и для `end`.

#### `asyncEnd(event)`

* Имя: `tracing:${name}:asyncEnd`

Событие `asyncEnd` — завершение колбэка асинхронной функции. Данные после `asyncStart` обычно не меняются, но полезно зафиксировать момент окончания колбэка.

#### `error(event)`

* Имя: `tracing:${name}:error`

Событие `error` — любая ошибка трассируемой функции, синхронная или асинхронная. Исключение в синхронной части попадает в поле `error` и вызывает событие `error`. Ошибка из колбэка или отклонение промиса также попадают в `error` и вызывают событие.

Один вызов может сгенерировать несколько событий `error` — учитывайте это при обработке. Например, внутренняя асинхронная задача упала, затем синхронная часть выбросила исключение — будет два события `error`.

### Встроенные каналы

#### Консоль

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


##### Событие: `'console.log'`

* `args` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Генерируется при вызове `console.log()`. Передаётся массив аргументов вызова `console.log()`.

##### Событие: `'console.info'`

* `args` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Генерируется при вызове `console.info()`. Передаётся массив аргументов вызова `console.info()`.

##### Событие: `'console.debug'`

* `args` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Генерируется при вызове `console.debug()`. Передаётся массив аргументов вызова `console.debug()`.

##### Событие: `'console.warn'`

* `args` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Генерируется при вызове `console.warn()`. Передаётся массив аргументов вызова `console.warn()`.

##### Событие: `'console.error'`

* `args` [`<any[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Генерируется при вызове `console.error()`. Передаётся массив аргументов вызова `console.error()`.

#### HTTP

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


##### Событие: `'http.client.request.created'`

* `request` [`<http.ClientRequest>`](#httpclientrequest)

Генерируется, когда клиент создаёт объект запроса. В отличие от `http.client.request.start`, событие до отправки запроса.

##### Событие: `'http.client.request.start'`

* `request` [`<http.ClientRequest>`](#httpclientrequest)

Генерируется, когда клиент начинает запрос.

##### Событие: `'http.client.request.error'`

* `request` [`<http.ClientRequest>`](#httpclientrequest)
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке клиентского запроса.

##### Событие: `'http.client.response.finish'`

* `request` [`<http.ClientRequest>`](#httpclientrequest)
* `response` [`<http.IncomingMessage>`](#httpincomingmessage)

Генерируется, когда клиент получил ответ.

##### Событие: `'http.server.request.start'`

* `request` [`<http.IncomingMessage>`](#httpincomingmessage)
* `response` [`<http.ServerResponse>`](#httpserverresponse)
* `socket` [`<net.Socket>`](net.md#class-netsocket)
* `server` [`<http.Server>`](#httpserver)

Генерируется, когда сервер получил запрос.

##### Событие: `'http.server.response.created'`

* `request` [`<http.IncomingMessage>`](#httpincomingmessage)
* `response` [`<http.ServerResponse>`](#httpserverresponse)

Генерируется, когда сервер создал объект ответа. Событие до отправки ответа.

##### Событие: `'http.server.response.finish'`

* `request` [`<http.IncomingMessage>`](#httpincomingmessage)
* `response` [`<http.ServerResponse>`](#httpserverresponse)
* `socket` [`<net.Socket>`](net.md#class-netsocket)
* `server` [`<http.Server>`](#httpserver)

Генерируется, когда сервер отправил ответ.

#### HTTP/2

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


##### Событие: `'http2.client.stream.created'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)

Генерируется при создании потока на клиенте.

##### Событие: `'http2.client.stream.start'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)

Генерируется при старте потока на клиенте.

##### Событие: `'http2.client.stream.error'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке обработки потока на клиенте.

##### Событие: `'http2.client.stream.finish'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Генерируется при получении потока на клиенте.

##### Событие: `'http2.client.stream.bodyChunkSent'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)
* `writev` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)
* `data` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Buffer[]>`](buffer.md#buffer) | [`<Object[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `chunk` [`<Buffer>`](buffer.md#buffer) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
  * `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `encoding` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерируется при отправке фрагмента тела потока клиента.

##### Событие: `'http2.client.stream.bodySent'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)

Генерируется после полной отправки тела потока клиента.

##### Событие: `'http2.client.stream.close'`

* `stream` [`<ClientHttp2Stream>`](#class-clienthttp2stream)

Генерируется при закрытии потока на клиенте. Код ошибки HTTP/2 при закрытии доступен в `stream.rstCode`.

##### Событие: `'http2.server.stream.created'`

* `stream` [`<ServerHttp2Stream>`](#class-serverhttp2stream)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)

Генерируется при создании потока на сервере.

##### Событие: `'http2.server.stream.start'`

* `stream` [`<ServerHttp2Stream>`](#class-serverhttp2stream)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)

Генерируется при старте потока на сервере.

##### Событие: `'http2.server.stream.error'`

* `stream` [`<ServerHttp2Stream>`](#class-serverhttp2stream)
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке обработки потока на сервере.

##### Событие: `'http2.server.stream.finish'`

* `stream` [`<ServerHttp2Stream>`](#class-serverhttp2stream)
* `headers` [`<HTTP/2 Headers Object>`](#headers-object)
* `flags` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Генерируется при отправке потока с сервера.

##### Событие: `'http2.server.stream.close'`

* `stream` [`<ServerHttp2Stream>`](#class-serverhttp2stream)

Генерируется при закрытии потока на сервере. Код ошибки HTTP/2 при закрытии доступен в `stream.rstCode`.

#### Модули

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


##### Событие: `'module.require.start'`

* `event` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
  * `id` — аргумент `require()`, имя модуля.
  * `parentFilename` — файл модуля, вызвавшего `require(id)`.

Генерируется при выполнении `require()`. См. [`событие start`](#startevent).

##### Событие: `'module.require.end'`

* `event` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
  * `id` — аргумент `require()`, имя модуля.
  * `parentFilename` — файл модуля, вызвавшего `require(id)`.

Генерируется при возврате из `require()`. См. [`событие end`](#endevent).

##### Событие: `'module.require.error'`

* `event` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
  * `id` — аргумент `require()`, имя модуля.
  * `parentFilename` — файл модуля, вызвавшего `require(id)`.
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке `require()`. См. [`событие error`](#errorevent).

##### Событие: `'module.import.asyncStart'`

* `event` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
  * `id` — аргумент `import()`, имя модуля.
  * `parentURL` — URL модуля, вызвавшего `import(id)`.

Генерируется при вызове `import()`. См. [`событие asyncStart`](#asyncstartevent).

##### Событие: `'module.import.asyncEnd'`

* `event` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
  * `id` — аргумент `import()`, имя модуля.
  * `parentURL` — URL модуля, вызвавшего `import(id)`.

Генерируется по завершении `import()`. См. [`событие asyncEnd`](#asyncendevent).

##### Событие: `'module.import.error'`

* `event` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) со свойствами:
  * `id` — аргумент `import()`, имя модуля.
  * `parentURL` — URL модуля, вызвавшего `import(id)`.
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке `import()`. См. [`событие error`](#errorevent).

#### Сеть

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


##### Событие: `'net.client.socket'`

* `socket` [`<net.Socket>`](net.md#class-netsocket) | [`<tls.TLSSocket>`](tls.md#class-tlstlssocket)

Генерируется при создании нового клиентского TCP- или pipe-сокета.

##### Событие: `'net.server.socket'`

* `socket` [`<net.Socket>`](net.md#class-netsocket)

Генерируется при приёме нового TCP- или pipe-подключения.

##### Событие: `'tracing:net.server.listen:asyncStart'`

* `server` [`<net.Server>`](net.md#class-netserver)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Генерируется при вызове [`net.Server.listen()`](net.md#serverlisten), до настройки порта или pipe.

##### Событие: `'tracing:net.server.listen:asyncEnd'`

* `server` [`<net.Server>`](net.md#class-netserver)

Генерируется после завершения [`net.Server.listen()`](net.md#serverlisten) — сервер готов принимать соединения.

##### Событие: `'tracing:net.server.listen:error'`

* `server` [`<net.Server>`](net.md#class-netserver)
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке [`net.Server.listen()`](net.md#serverlisten).

#### UDP

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


##### Событие: `'udp.socket'`

* `socket` [`<dgram.Socket>`](dgram.md#class-dgramsocket)

Генерируется при создании нового UDP-сокета.

#### Процесс

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


<!-- YAML
added: v16.18.0
-->

##### Событие: `'child_process'`

* `process` [`<ChildProcess>`](child_process.md#class-childprocess)

Генерируется при создании нового дочернего процесса.

`tracing:child_process.spawn:start`

* `process` [`<ChildProcess>`](child_process.md#class-childprocess)
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Генерируется при вызове [`child_process.spawn()`](child_process.md#child_processspawncommand-args-options), до фактического запуска процесса.

`tracing:child_process.spawn:end`

* `process` [`<ChildProcess>`](child_process.md#class-childprocess)

Генерируется после успешного завершения [`child_process.spawn()`](child_process.md#child_processspawncommand-args-options) — процесс создан.

`tracing:child_process.spawn:error`

* `process` [`<ChildProcess>`](child_process.md#class-childprocess)
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Генерируется при ошибке [`child_process.spawn()`](child_process.md#child_processspawncommand-args-options).

##### Событие: `'execve'`

* `execPath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
* `env` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Генерируется при вызове [`process.execve()`](process.md#processexecvefile-args-env).

#### Веб-блокировки

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


<!-- YAML
added: v25.9.0
-->

Эти каналы генерируются при каждом вызове [`locks.request()`](worker_threads.md#locksrequestname-options-callback). Подробнее о механизме веб-блокировок — [`worker_threads.locks`](worker_threads.md#worker_threadslocks).

##### Событие: `'locks.request.start'`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя ресурса блокировки
* `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) режим: `'exclusive'` или `'shared'`

Генерируется при инициации запроса блокировки, до её выдачи.

##### Событие: `'locks.request.grant'`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя ресурса блокировки
* `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) режим: `'exclusive'` или `'shared'`

Генерируется при успешной выдаче блокировки, непосредственно перед запуском колбэка.

##### Событие: `'locks.request.miss'`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя ресурса блокировки
* `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) режим: `'exclusive'` или `'shared'`

Генерируется, если `ifAvailable` равен `true`, блокировка сразу недоступна и колбэк вызывается с `null` вместо объекта `Lock`.

##### Событие: `'locks.request.end'`

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя ресурса блокировки
* `mode` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) режим: `'exclusive'` или `'shared'`
* `steal` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) используется ли семантика steal
* `ifAvailable` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) используется ли семантика ifAvailable
* `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | undefined ошибка из колбэка, если была

Генерируется по завершении запроса блокировки: успех колбэка, исключение или украденная блокировка.

#### Поток Worker

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.


<!-- YAML
added: v16.18.0
-->

##### Событие: `'worker_threads'`

* `worker` [`<Worker>`](worker_threads.md#class-worker)

Генерируется при создании нового потока worker.

[BoundedChannel Channels]: #boundedchannel-channels
[TracingChannel Channels]: #tracingchannel-channels
[`'uncaughtException'`]: process.md#event-uncaughtexception
[`BoundedChannel`]: #class-boundedchannel
[`TracingChannel`]: #class-tracingchannel
[`событие asyncEnd`]: #asyncendevent
[`событие asyncStart`]: #asyncstartevent
[`boundedChannel.withScope(context)`]: #boundedchannelwithscopecontext
[`channel.bindStore(store)`]: #channelbindstorestore-transform
[`channel.runStores(context, ...)`]: #channelrunstorescontext-fn-thisarg-args
[`channel.subscribe(onMessage)`]: #channelsubscribeonmessage
[`channel.unsubscribe(onMessage)`]: #channelunsubscribeonmessage
[`channel.withStoreScope(data)`]: #channelwithstorescopedata
[`child_process.spawn()`]: child_process.md#child_processspawncommand-args-options
[`diagnostics_channel.channel(name)`]: #diagnostics_channelchannelname
[`diagnostics_channel.subscribe(name, onMessage)`]: #diagnostics_channelsubscribename-onmessage
[`diagnostics_channel.tracingChannel()`]: #diagnostics_channeltracingchannelnameorchannels
[`событие end`]: #endevent
[`событие error`]: #errorevent
[`locks.request()`]: worker_threads.md#locksrequestname-options-callback
[`net.Server.listen()`]: net.md#serverlisten
[`process.execve()`]: process.md#processexecvefile-args-env
[`событие start`]: #startevent
[`worker_threads.locks`]: worker_threads.md#worker_threadslocks
[context loss]: async_context.md#troubleshooting-context-loss
[thenable-объект]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#thenables
