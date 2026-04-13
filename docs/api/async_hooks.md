---
title: Асинхронные хуки (async_hooks)
description: Модуль async_hooks — API для отслеживания асинхронных ресурсов
---

# Асинхронные хуки

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/async_hooks.html)

<!--introduced_in=v8.1.0-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Пожалуйста, мигрируйте от этого API, если можете. Мы не рекомендуем использовать API [`createHook`](#async_hookscreatehookoptions), [`AsyncHook`](#class-asynchook) и [`executionAsyncResource`](#async_hooksexecutionasyncresource), так как они имеют проблемы с удобством использования, риски для безопасности и влияют на производительность. Для случаев использования отслеживания асинхронного контекста лучше использовать стабильный API [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage). Если у вас есть сценарий использования `createHook`, `AsyncHook` или `executionAsyncResource`, выходящий за рамки потребностей отслеживания контекста, решаемых [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage) или диагностических данных, предоставляемых в настоящее время [Diagnostics Channel](diagnostics_channel.md), пожалуйста, откройте проблему по адресу <https://github.com/nodejs/node/issues>, описав ваш сценарий использования, чтобы мы могли создать API, более ориентированный на конкретные цели.

<!-- source_link=lib/async_hooks.js -->

Мы настоятельно не рекомендуем использовать API `async_hooks`. Другие API, которые могут покрыть большинство случаев использования, включают:

-   [AsyncLocalStorage](async_context.md#class-asynclocalstorage) — отслеживание async-контекста
-   [process.getActiveResourcesInfo()](process.md#processgetactiveresourcesinfo) — отслеживание активных ресурсов

Модуль `node:async_hooks` предоставляет API для отслеживания асинхронных ресурсов. Доступ к нему можно получить так:

=== "MJS"

    ```js
    import async_hooks from 'node:async_hooks';
    ```

=== "CJS"

    ```js
    const async_hooks = require('node:async_hooks');
    ```

## Терминология

Асинхронный ресурс представляет собой объект с ассоциированным обратным вызовом. Этот обратный вызов может вызываться несколько раз, например, для события `'connection'` в `net.createServer()`, или только один раз, как в `fs.open()`. Ресурс также может быть закрыт до вызова обратного вызова. `AsyncHook` не делает явного различия между этими случаями, но представляет их как абстрактную концепцию ресурса.

Если используются [Worker](worker_threads.md#class-worker), у каждого потока независимый интерфейс `async_hooks`, и каждый поток использует новый набор async ID.

## Обзор

Ниже приведён краткий обзор публичного API.

=== "MJS"

    ```js
    import async_hooks from 'node:async_hooks';

    // Возвращает ID текущего контекста выполнения.
    const eid = async_hooks.executionAsyncId();

    // Возвращает ID дескриптора, который инициировал вызов обратного вызова
    // текущей области выполнения.
    const tid = async_hooks.triggerAsyncId();

    // Создаёт новый экземпляр AsyncHook. Все эти обратные вызовы необязательны.
    const asyncHook =
        async_hooks.createHook({ init, before, after, destroy, promiseResolve });

    // Разрешает вызов обратных вызовов этого экземпляра AsyncHook. Это не неявное
    // действие после конструктора — его нужно явно вызвать, чтобы начать
    // выполнять обратные вызовы.
    asyncHook.enable();

    // Отключает прослушивание новых асинхронных событий.
    asyncHook.disable();

    //
    // Ниже перечислены обратные вызовы, которые можно передать в createHook().
    //

    // init() вызывается при создании объекта. Ресурс может быть ещё не
    // полностью сконструирован, когда выполняется этот обратный вызов. Поэтому все поля
    // ресурса, на которые ссылается «asyncId», могут быть ещё не заполнены.
    function init(asyncId, type, triggerAsyncId, resource) { }

    // before() вызывается непосредственно перед вызовом обратного вызова ресурса. Может
    // вызываться 0–N раз для дескрипторов (например, TCPWrap) и ровно 1 раз
    // для запросов (например, FSReqCallback).
    function before(asyncId) { }

    // after() вызывается сразу после завершения обратного вызова ресурса.
    function after(asyncId) { }

    // destroy() вызывается при уничтожении ресурса.
    function destroy(asyncId) { }

    // promiseResolve() вызывается только для ресурсов промиса, когда вызывается
    // функция resolve(), переданная конструктору Promise
    // (напрямую или через другие способы разрешения промиса).
    function promiseResolve(asyncId) { }
    ```

=== "CJS"

    ```js
    const async_hooks = require('node:async_hooks');

    // Возвращает ID текущего контекста выполнения.
    const eid = async_hooks.executionAsyncId();

    // Возвращает ID дескриптора, который инициировал вызов обратного вызова
    // текущей области выполнения.
    const tid = async_hooks.triggerAsyncId();

    // Создаёт новый экземпляр AsyncHook. Все эти обратные вызовы необязательны.
    const asyncHook =
        async_hooks.createHook({ init, before, after, destroy, promiseResolve });

    // Разрешает вызов обратных вызовов этого экземпляра AsyncHook. Это не неявное
    // действие после конструктора — его нужно явно вызвать, чтобы начать
    // выполнять обратные вызовы.
    asyncHook.enable();

    // Отключает прослушивание новых асинхронных событий.
    asyncHook.disable();

    //
    // Ниже перечислены обратные вызовы, которые можно передать в createHook().
    //

    // init() вызывается при создании объекта. Ресурс может быть ещё не
    // полностью сконструирован, когда выполняется этот обратный вызов. Поэтому все поля
    // ресурса, на которые ссылается «asyncId», могут быть ещё не заполнены.
    function init(asyncId, type, triggerAsyncId, resource) { }

    // before() вызывается непосредственно перед вызовом обратного вызова ресурса. Может
    // вызываться 0–N раз для дескрипторов (например, TCPWrap) и ровно 1 раз
    // для запросов (например, FSReqCallback).
    function before(asyncId) { }

    // after() вызывается сразу после завершения обратного вызова ресурса.
    function after(asyncId) { }

    // destroy() вызывается при уничтожении ресурса.
    function destroy(asyncId) { }

    // promiseResolve() вызывается только для ресурсов промиса, когда вызывается
    // функция resolve(), переданная конструктору Promise
    // (напрямую или через другие способы разрешения промиса).
    function promiseResolve(asyncId) { }
    ```

## `async_hooks.createHook(options)` {#async_hookscreatehookoptions}

<!-- YAML
added: v8.1.0
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) [Обратные вызовы хука](#hook-callbacks) для регистрации
    -   `init` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов [init](#initasyncid-type-triggerasyncid-resource).
    -   `before` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов [before](#beforeasyncid).
    -   `after` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов [after](#afterasyncid).
    -   `destroy` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов [destroy](#destroyasyncid).
    -   `promiseResolve` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Обратный вызов [promiseResolve](#promiseresolveasyncid).
    -   `trackPromises` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Должен ли хук отслеживать `Promise`. Не может быть `false`, если задан `promiseResolve`. **По умолчанию**: `true`.
-   Возвращает: [`<AsyncHook>`](#class-asynchook) Экземпляр для отключения и включения хуков

Регистрирует функции, вызываемые при различных событиях жизненного цикла каждой асинхронной операции.

Обратные вызовы `init()` / `before()` / `after()` / `destroy()` вызываются для соответствующего асинхронного события в течение жизни ресурса.

Все обратные вызовы необязательны. Например, если нужно отслеживать только очистку ресурса, достаточно передать только `destroy`. Подробности по всем функциям, которые можно передать в `options`, см. в разделе [Обратные вызовы хука](#hook-callbacks).

=== "MJS"

    ```js
    import { createHook } from 'node:async_hooks';

    const asyncHook = createHook({
      init(asyncId, type, triggerAsyncId, resource) { },
      destroy(asyncId) { },
    });
    ```

=== "CJS"

    ```js
    const async_hooks = require('node:async_hooks');

    const asyncHook = async_hooks.createHook({
      init(asyncId, type, triggerAsyncId, resource) { },
      destroy(asyncId) { },
    });
    ```

Обратные вызовы наследуются по цепочке прототипов:

```js
class MyAsyncCallbacks {
    init(asyncId, type, triggerAsyncId, resource) {}
    destroy(asyncId) {}
}

class MyAddedCallbacks extends MyAsyncCallbacks {
    before(asyncId) {}
    after(asyncId) {}
}

const asyncHook = async_hooks.createHook(
    new MyAddedCallbacks()
);
```

Поскольку промисы — асинхронные ресурсы, жизненный цикл которых отслеживается механизмом async hooks, обратные вызовы `init()`, `before()`, `after()` и `destroy()` _не должны_ быть async-функциями, возвращающими промисы.

### Обработка ошибок

Если любой из обратных вызовов `AsyncHook` выбрасывает исключение, приложение выводит трассировку стека и завершает работу. Путь завершения соответствует неперехваченному исключению, но все слушатели `'uncaughtException'` удаляются, тем самым принудительно завершая процесс. Обратные вызовы `'exit'` по-прежнему вызываются, если только приложение не запущено с `--abort-on-uncaught-exception` — в этом случае выводится трассировка стека и приложение завершается, оставляя core dump.

Такое поведение обусловлено тем, что эти обратные вызовы выполняются в потенциально нестабильные моменты жизни объекта, например при создании и уничтожении класса. Поэтому считается необходимым быстро завершить процесс, чтобы предотвратить непреднамеренный сбой в будущем. Это может измениться после всестороннего анализа, подтверждающего, что исключение может следовать обычному потоку управления без непреднамеренных побочных эффектов.

### Вывод в обратных вызовах `AsyncHook`

Поскольку вывод на консоль — асинхронная операция, `console.log()` приведёт к вызову обратных вызовов `AsyncHook`. Использование `console.log()` или подобных асинхронных операций внутри обратного вызова `AsyncHook` вызовет бесконечную рекурсию. Простой обходной путь при отладке — синхронное логирование, например `fs.writeFileSync(file, msg, flag)`. Запись идёт в файл и не вызывает `AsyncHook` рекурсивно, так как операция синхронная.

=== "MJS"

    ```js
    import { writeFileSync } from 'node:fs';
    import { format } from 'node:util';

    function debug(...args) {
      // При отладке внутри обратного вызова AsyncHook используйте подобную функцию
      writeFileSync('log.out', `${format(...args)}\n`, { flag: 'a' });
    }
    ```

=== "CJS"

    ```js
    const fs = require('node:fs');
    const util = require('node:util');

    function debug(...args) {
      // При отладке внутри обратного вызова AsyncHook используйте подобную функцию
      fs.writeFileSync('log.out', `${util.format(...args)}\n`, { flag: 'a' });
    }
    ```

Если для логирования нужна асинхронная операция, можно отслеживать, что её вызвало, по информации из самого `AsyncHook`. Логирование следует пропускать, если обратный вызов `AsyncHook` был вызван именно логированием. Так разрывается бесконечная рекурсия.

## Класс: `AsyncHook` {#class-asynchook}

Класс `AsyncHook` предоставляет интерфейс для отслеживания событий жизненного цикла асинхронных операций.

### `asyncHook.enable()`

-   Возвращает: [`<AsyncHook>`](#class-asynchook) Ссылка на `asyncHook`.

Включает обратные вызовы для данного экземпляра `AsyncHook`. Если обратные вызовы не заданы, включение не делает ничего.

Экземпляр `AsyncHook` по умолчанию отключён. Чтобы включить его сразу после создания, можно использовать такой шаблон:

=== "MJS"

    ```js
    import { createHook } from 'node:async_hooks';

    const hook = createHook(callbacks).enable();
    ```

=== "CJS"

    ```js
    const async_hooks = require('node:async_hooks');

    const hook = async_hooks.createHook(callbacks).enable();
    ```

### `asyncHook.disable()`

-   Возвращает: [`<AsyncHook>`](#class-asynchook) Ссылка на `asyncHook`.

Отключает обратные вызовы данного экземпляра `AsyncHook` в глобальном пуле обратных вызовов `AsyncHook`. После отключения хук не будет вызываться, пока снова не включён.

Для согласованности API `disable()` также возвращает экземпляр `AsyncHook`.

### Обратные вызовы хука {#hook-callbacks}

Ключевые события жизни асинхронных операций сгруппированы в четыре области: создание, до и после вызова обратного вызова, уничтожение экземпляра.

#### `init(asyncId, type, triggerAsyncId, resource)` {#initasyncid-type-triggerasyncid-resource}

-   `asyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уникальный ID асинхронного ресурса.
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип асинхронного ресурса.
-   `triggerAsyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уникальный ID асинхронного ресурса, в контексте выполнения которого создан этот ресурс.
-   `resource` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Ссылка на ресурс, представляющий асинхронную операцию; должен быть освобождён при _destroy_.

Вызывается при конструировании класса, у которого _есть возможность_ инициировать асинхронное событие. Это _не_ означает, что экземпляр обязан вызвать `before`/`after` до `destroy` — только лишь то, что такая возможность существует.

Такое поведение видно, если открыть ресурс и закрыть его до использования. Ниже — пример.

=== "MJS"

    ```js
    import { createServer } from 'node:net';

    createServer().listen(function() { this.close(); });
    // или
    clearTimeout(setTimeout(() => {}, 10));
    ```

=== "CJS"

    ```js
    require('node:net').createServer().listen(function() { this.close(); });
    // или
    clearTimeout(setTimeout(() => {}, 10));
    ```

Каждому новому ресурсу присваивается ID, уникальный в пределах текущего экземпляра Node.js.

##### `type`

`type` — строка, обозначающая тип ресурса, из-за которого вызван `init`. Обычно она совпадает с именем конструктора ресурса.

Типы ресурсов, создаваемых самим Node.js, могут меняться в любом релизе. Допустимые значения включают `TLSWRAP`, `TCPWRAP`, `TCPSERVERWRAP`, `GETADDRINFOREQWRAP`, `FSREQCALLBACK`, `Microtask` и `Timeout`. Полный список смотрите в исходном коде используемой версии Node.js.

Кроме того, пользователи [AsyncResource](async_context.md#class-asyncresource) создают асинхронные ресурсы независимо от Node.js.

Есть также тип ресурса `PROMISE` для отслеживания экземпляров `Promise` и асинхронной работы, запланированной ими. `Promise` отслеживаются только если опция `trackPromises` равна `true`.

Пользователи могут задавать собственный `type` через публичный API встраивания.

Возможны коллизии имён типов. Встраивателям рекомендуется использовать уникальные префиксы (например, имя npm-пакета), чтобы избежать конфликтов при подписке на хуки.

##### `triggerAsyncId`

`triggerAsyncId` — это `asyncId` ресурса, который вызвал («запустил») инициализацию нового ресурса и из-за которого вызван `init`. Это отличается от `async_hooks.executionAsyncId()`, который показывает только _когда_ ресурс создан, тогда как `triggerAsyncId` показывает _почему_ он создан.

Ниже — простая демонстрация `triggerAsyncId`:

=== "MJS"

    ```js
    import { createHook, executionAsyncId } from 'node:async_hooks';
    import { stdout } from 'node:process';
    import net from 'node:net';
    import fs from 'node:fs';

    createHook({
      init(asyncId, type, triggerAsyncId) {
        const eid = executionAsyncId();
        fs.writeSync(
          stdout.fd,
          `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`);
      },
    }).enable();

    net.createServer((conn) => {}).listen(8080);
    ```

=== "CJS"

    ```js
    const { createHook, executionAsyncId } = require('node:async_hooks');
    const { stdout } = require('node:process');
    const net = require('node:net');
    const fs = require('node:fs');

    createHook({
      init(asyncId, type, triggerAsyncId) {
        const eid = executionAsyncId();
        fs.writeSync(
          stdout.fd,
          `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`);
      },
    }).enable();

    net.createServer((conn) => {}).listen(8080);
    ```

Вывод при обращении к серверу командой `nc localhost 8080`:

```console
TCPSERVERWRAP(5): trigger: 1 execution: 1
TCPWRAP(7): trigger: 5 execution: 0
```

`TCPSERVERWRAP` — сервер, принимающий соединения.

`TCPWRAP` — новое соединение от клиента. При новом соединении сразу создаётся экземпляр `TCPWrap`. Это происходит вне любого стека JavaScript. (`executionAsyncId()` равный `0` означает выполнение из C++ без стека JavaScript над ним.) Одной этой информации недостаточно, чтобы связать ресурсы по причине их появления, поэтому `triggerAsyncId` передаёт, какой ресурс отвечает за появление нового.

##### `resource`

`resource` — объект, представляющий фактический инициализированный асинхронный ресурс. API доступа к объекту определяется создателем ресурса. Ресурсы, созданные Node.js, внутренние и могут меняться в любой момент; для них API не фиксируется.

В некоторых случаях объект ресурса переиспользуется из соображений производительности; использовать его как ключ в `WeakMap` или добавлять свойства небезопасно.

##### Пример асинхронного контекста

Сценарий отслеживания контекста покрывает стабильный API [AsyncLocalStorage](async_context.md#class-asynclocalstorage). Этот пример иллюстрирует работу async hooks, но для этого случая лучше подходит [AsyncLocalStorage](async_context.md#class-asynclocalstorage).

Ниже — пример с дополнительной информацией о вызовах `init` между `before` и `after`, в частности о том, как выглядит обратный вызов `listen()`. Форматирование вывода чуть подробнее, чтобы проще было видеть контекст вызова.

=== "MJS"

    ```js
    import async_hooks from 'node:async_hooks';
    import fs from 'node:fs';
    import net from 'node:net';
    import { stdout } from 'node:process';
    const { fd } = stdout;

    let indent = 0;
    async_hooks.createHook({
      init(asyncId, type, triggerAsyncId) {
        const eid = async_hooks.executionAsyncId();
        const indentStr = ' '.repeat(indent);
        fs.writeSync(
          fd,
          `${indentStr}${type}(${asyncId}):` +
          ` trigger: ${triggerAsyncId} execution: ${eid}\n`);
      },
      before(asyncId) {
        const indentStr = ' '.repeat(indent);
        fs.writeSync(fd, `${indentStr}before:  ${asyncId}\n`);
        indent += 2;
      },
      after(asyncId) {
        indent -= 2;
        const indentStr = ' '.repeat(indent);
        fs.writeSync(fd, `${indentStr}after:  ${asyncId}\n`);
      },
      destroy(asyncId) {
        const indentStr = ' '.repeat(indent);
        fs.writeSync(fd, `${indentStr}destroy:  ${asyncId}\n`);
      },
    }).enable();

    net.createServer(() => {}).listen(8080, () => {
      // Подождём 10 мс перед логом о запуске сервера
      setTimeout(() => {
        console.log('>>>', async_hooks.executionAsyncId());
      }, 10);
    });
    ```

=== "CJS"

    ```js
    const async_hooks = require('node:async_hooks');
    const fs = require('node:fs');
    const net = require('node:net');
    const { fd } = process.stdout;

    let indent = 0;
    async_hooks.createHook({
      init(asyncId, type, triggerAsyncId) {
        const eid = async_hooks.executionAsyncId();
        const indentStr = ' '.repeat(indent);
        fs.writeSync(
          fd,
          `${indentStr}${type}(${asyncId}):` +
          ` trigger: ${triggerAsyncId} execution: ${eid}\n`);
      },
      before(asyncId) {
        const indentStr = ' '.repeat(indent);
        fs.writeSync(fd, `${indentStr}before:  ${asyncId}\n`);
        indent += 2;
      },
      after(asyncId) {
        indent -= 2;
        const indentStr = ' '.repeat(indent);
        fs.writeSync(fd, `${indentStr}after:  ${asyncId}\n`);
      },
      destroy(asyncId) {
        const indentStr = ' '.repeat(indent);
        fs.writeSync(fd, `${indentStr}destroy:  ${asyncId}\n`);
      },
    }).enable();

    net.createServer(() => {}).listen(8080, () => {
      // Подождём 10 мс перед логом о запуске сервера
      setTimeout(() => {
        console.log('>>>', async_hooks.executionAsyncId());
      }, 10);
    });
    ```

Вывод при одном только запуске сервера:

```console
TCPSERVERWRAP(5): trigger: 1 execution: 1
TickObject(6): trigger: 5 execution: 1
before:  6
  Timeout(7): trigger: 6 execution: 6
after:   6
destroy: 6
before:  7
>>> 7
  TickObject(8): trigger: 7 execution: 7
after:   7
before:  8
after:   8
```

Как видно из примера, `executionAsyncId()` и `execution` задают значение текущего контекста выполнения; его границы определяются вызовами `before` и `after`.

Если строить граф только по `execution`, получится следующее:

```console
  root(1)
     ^
     |
TickObject(6)
     ^
     |
 Timeout(7)
```

`TCPSERVERWRAP` не входит в этот граф, хотя именно из-за него вызывается `console.log()`. Привязка к порту без имени хоста — _синхронная_ операция, но чтобы API оставалось полностью асинхронным, обратный вызов пользователя помещается в `process.nextTick()`. Поэтому в выводе есть `TickObject` как «родитель» обратного вызова `.listen()`.

Граф показывает только _когда_ ресурс создан, но не _почему_; для _почему_ используйте `triggerAsyncId`. Это можно представить так:

```console
 bootstrap(1)
     |
     ˅
TCPSERVERWRAP(5)
     |
     ˅
 TickObject(6)
     |
     ˅
  Timeout(7)
```

#### `before(asyncId)` {#beforeasyncid}

-   `asyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Когда инициируется асинхронная операция (например, TCP-сервер принимает соединение) или она завершается (например, запись на диск), вызывается обратный вызов для уведомления. `before` вызывается непосредственно перед его выполнением. `asyncId` — уникальный идентификатор ресурса, который собирается выполнить обратный вызов.

`before` может вызываться от 0 до N раз. Обычно 0 раз, если операция отменена или, например, TCP-сервер не получил соединений. Долгоживущие ресурсы вроде TCP-сервера обычно вызывают `before` несколько раз, а операции вроде `fs.open()` — один раз.

#### `after(asyncId)` {#afterasyncid}

-   `asyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Вызывается сразу после завершения обратного вызова, указанного в `before`.

Если при выполнении обратного вызова возникает неперехваченное исключение, `after` выполняется _после_ события `'uncaughtException'` или обработчика `domain`.

#### `destroy(asyncId)` {#destroyasyncid}

-   `asyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Вызывается после уничтожения ресурса, соответствующего `asyncId`. Также вызывается асинхронно из API встраивания `emitDestroy()`.

Некоторые ресурсы очищаются через сборку мусора: если сохранить ссылку на объект `resource` из `init`, `destroy` может никогда не вызваться, что приведёт к утечке памяти. Если ресурс не зависит от GC, проблемы не будет.

Хук `destroy` добавляет накладные расходы, так как включает отслеживание экземпляров `Promise` через сборщик мусора.

#### `promiseResolve(asyncId)` {#promiseresolveasyncid}

<!-- YAML
added: v8.6.0
-->

-   `asyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Вызывается, когда вызывается функция `resolve`, переданная конструктору `Promise` (напрямую или через другие способы разрешения промиса).

`resolve()` не выполняет наблюдаемой синхронной работы.

На этом этапе `Promise` ещё не обязательно выполнен или отклонён, если он был разрешён через принятие состояния другого `Promise`.

```js
new Promise((resolve) => resolve(true)).then((a) => {});
```

вызывает следующие обратные вызовы:

```text
init for PROMISE with id 5, trigger id: 1
  promise resolve 5      # соответствует resolve(true)
init for PROMISE with id 6, trigger id: 5  # Promise, возвращённый then()
  before 6               # вход в обратный вызов then()
  promise resolve 6      # обратный вызов then() разрешает промис возвратом значения
  after 6
```

### `async_hooks.executionAsyncResource()` {#async_hooksexecutionasyncresource}

<!-- YAML
added:
 - v13.9.0
 - v12.17.0
-->

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Ресурс, представляющий текущее выполнение. Удобно хранить данные в ресурсе.

Объекты, возвращаемые `executionAsyncResource()`, чаще всего — внутренние handle-объекты Node.js с недокументированным API. Вызовы методов и обращение к полям могут привести к падению приложения; этого следует избегать.

В контексте выполнения верхнего уровня `executionAsyncResource()` возвращает пустой объект — нет handle или request, но наличие объекта для верхнего уровня может быть полезно.

=== "MJS"

    ```js
    import { open } from 'node:fs';
    import { executionAsyncId, executionAsyncResource } from 'node:async_hooks';

    console.log(executionAsyncId(), executionAsyncResource());  // 1 {}
    open(new URL(import.meta.url), 'r', (err, fd) => {
      console.log(executionAsyncId(), executionAsyncResource());  // 7 FSReqWrap
    });
    ```

=== "CJS"

    ```js
    const { open } = require('node:fs');
    const { executionAsyncId, executionAsyncResource } = require('node:async_hooks');

    console.log(executionAsyncId(), executionAsyncResource());  // 1 {}
    open(__filename, 'r', (err, fd) => {
      console.log(executionAsyncId(), executionAsyncResource());  // 7 FSReqWrap
    });
    ```

Так можно реализовать continuation local storage без отслеживающей `Map` для метаданных:

=== "MJS"

    ```js
    import { createServer } from 'node:http';
    import {
      executionAsyncId,
      executionAsyncResource,
      createHook,
    } from 'node:async_hooks';
    const sym = Symbol('state'); // приватный символ, чтобы не засорять объект

    createHook({
      init(asyncId, type, triggerAsyncId, resource) {
        const cr = executionAsyncResource();
        if (cr) {
          resource[sym] = cr[sym];
        }
      },
    }).enable();

    const server = createServer((req, res) => {
      executionAsyncResource()[sym] = { state: req.url };
      setTimeout(function() {
        res.end(JSON.stringify(executionAsyncResource()[sym]));
      }, 100);
    }).listen(3000);
    ```

=== "CJS"

    ```js
    const { createServer } = require('node:http');
    const {
      executionAsyncId,
      executionAsyncResource,
      createHook,
    } = require('node:async_hooks');
    const sym = Symbol('state'); // приватный символ, чтобы не засорять объект

    createHook({
      init(asyncId, type, triggerAsyncId, resource) {
        const cr = executionAsyncResource();
        if (cr) {
          resource[sym] = cr[sym];
        }
      },
    }).enable();

    const server = createServer((req, res) => {
      executionAsyncResource()[sym] = { state: req.url };
      setTimeout(function() {
        res.end(JSON.stringify(executionAsyncResource()[sym]));
      }, 100);
    }).listen(3000);
    ```

### `async_hooks.executionAsyncId()`

<!-- YAML
added: v8.1.0
changes:
  - version: v8.2.0
    pr-url: https://github.com/nodejs/node/pull/13490
    description: Renamed from `currentId`.
-->

Добавлено в: v8.1.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v8.2.0 | Переименован из `currentId`. |

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) `asyncId` текущего контекста выполнения. Удобно отслеживать, кто что вызывает.

=== "MJS"

    ```js
    import { executionAsyncId } from 'node:async_hooks';
    import fs from 'node:fs';

    console.log(executionAsyncId());  // 1 - bootstrap
    const path = '.';
    fs.open(path, 'r', (err, fd) => {
      console.log(executionAsyncId());  // 6 - open()
    });
    ```

=== "CJS"

    ```js
    const async_hooks = require('node:async_hooks');
    const fs = require('node:fs');

    console.log(async_hooks.executionAsyncId());  // 1 - bootstrap
    const path = '.';
    fs.open(path, 'r', (err, fd) => {
      console.log(async_hooks.executionAsyncId());  // 6 - open()
    });
    ```

ID из `executionAsyncId()` связан со временем выполнения, а не с причинностью (её даёт `triggerAsyncId()`):

```js
const server = net
    .createServer((conn) => {
        // Возвращает ID сервера, а не нового соединения: обратный вызов
        // выполняется в области MakeCallback() сервера.
        async_hooks.executionAsyncId();
    })
    .listen(port, () => {
        // Возвращает ID TickObject (process.nextTick()): все обратные вызовы
        // для .listen() обёрнуты в nextTick().
        async_hooks.executionAsyncId();
    });
```

Контексты промисов по умолчанию могут не получать точные `executionAsyncId`. См. раздел [отслеживание выполнения промисов](#promise-execution-tracking).

### `async_hooks.triggerAsyncId()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID ресурса, из-за которого вызван выполняемый сейчас обратный вызов.

```js
const server = net
    .createServer((conn) => {
        // Ресурс, из-за которого вызван этот обратный вызов, —
        // новое соединение. Значит triggerAsyncId() даёт asyncId «conn».
        async_hooks.triggerAsyncId();
    })
    .listen(port, () => {
        // Хотя обратные вызовы .listen() обёрнуты в nextTick(),
        // сам обратный вызов существует из-за вызова .listen() на сервере.
        // Значит вернётся ID сервера.
        async_hooks.triggerAsyncId();
    });
```

Контексты промисов по умолчанию могут не получать корректные `triggerAsyncId`. См. раздел [отслеживание выполнения промисов](#promise-execution-tracking).

### `async_hooks.asyncWrapProviders`

<!-- YAML
added:
  - v17.2.0
  - v16.14.0
-->

-   Возвращает: Отображение типов провайдеров на числовые id. Содержит все типы событий, которые может порождать событие `async_hooks.init()`.

Подавляет устаревшее использование `process.binding('async_wrap').Providers`. См.: [DEP0111](deprecations.md#DEP0111)

## Отслеживание выполнения промисов {#promise-execution-tracking}

По умолчанию выполнениям промисов не назначаются `asyncId` из-за относительно высокой стоимости [promise introspection API](v8.md) в V8. Программы на промисах или `async`/`await` по умолчанию не получают корректные execution и trigger id для контекстов обратных вызовов промисов.

=== "MJS"

    ```js
    import { executionAsyncId, triggerAsyncId } from 'node:async_hooks';

    Promise.resolve(1729).then(() => {
      console.log(`eid ${executionAsyncId()} tid ${triggerAsyncId()}`);
    });
    // вывод:
    // eid 1 tid 0
    ```

=== "CJS"

    ```js
    const { executionAsyncId, triggerAsyncId } = require('node:async_hooks');

    Promise.resolve(1729).then(() => {
      console.log(`eid ${executionAsyncId()} tid ${triggerAsyncId()}`);
    });
    // вывод:
    // eid 1 tid 0
    ```

Обратный вызов `then()` как будто выполняется во внешней области, хотя был асинхронный переход. `triggerAsyncId` равен `0` — не хватает контекста о ресурсе, который вызвал обратный вызов `then()`.

Установка async hooks через `async_hooks.createHook` включает отслеживание выполнения промисов:

=== "MJS"

    ```js
    import { createHook, executionAsyncId, triggerAsyncId } from 'node:async_hooks';
    createHook({ init() {} }).enable(); // включает PromiseHooks
    Promise.resolve(1729).then(() => {
      console.log(`eid ${executionAsyncId()} tid ${triggerAsyncId()}`);
    });
    // вывод:
    // eid 7 tid 6
    ```

=== "CJS"

    ```js
    const { createHook, executionAsyncId, triggerAsyncId } = require('node:async_hooks');

    createHook({ init() {} }).enable(); // включает PromiseHooks
    Promise.resolve(1729).then(() => {
      console.log(`eid ${executionAsyncId()} tid ${triggerAsyncId()}`);
    });
    // вывод:
    // eid 7 tid 6
    ```

В этом примере достаточно любой реальной функции хука, чтобы включилось отслеживание промисов. В примере два промиса: созданный `Promise.resolve()` и возвращённый `then()`. Первому присвоен `asyncId` `6`, второму — `7`. Во время обратного вызова `then()` выполнение идёт в контексте промиса с `asyncId` `7`; его вызвал ресурс `6`.

Ещё нюанс: `before` и `after` вызываются только для цепочек промисов. Промисы не из `then()`/`catch()` не получат `before` и `after`. Подробнее — в документации V8 [PromiseHooks](v8.md).

### Отключение отслеживания выполнения промисов

Отслеживание выполнения промисов может сильно снижать производительность. Чтобы отключить его, задайте `trackPromises: false`:

=== "CJS"

    ```js
    const { createHook } = require('node:async_hooks');
    const { writeSync } = require('node:fs');
    createHook({
      init(asyncId, type, triggerAsyncId, resource) {
        // При trackPromises: false этот init не вызывается для промисов
        writeSync(1, `init hook triggered for ${type}\n`);
      },
      trackPromises: false,  // не отслеживать промисы
    }).enable();
    Promise.resolve(1729);
    ```

=== "MJS"

    ```js
    import { createHook } from 'node:async_hooks';
    import { writeSync } from 'node:fs';

    createHook({
      init(asyncId, type, triggerAsyncId, resource) {
        // При trackPromises: false этот init не вызывается для промисов
        writeSync(1, `init hook triggered for ${type}\n`);
      },
      trackPromises: false,  // не отслеживать промисы
    }).enable();
    Promise.resolve(1729);
    ```

## JavaScript API встраивания

Разработчики библиотек, которые сами управляют асинхронными ресурсами (I/O, пулы соединений, очереди обратных вызовов), могут использовать JavaScript API `AsyncResource`, чтобы вызывались все нужные обратные вызовы.

### Класс: `AsyncResource`

Документация по этому классу перенесена: [AsyncResource](async_context.md#class-asyncresource).

## Класс: `AsyncLocalStorage`

Документация по этому классу перенесена: [AsyncLocalStorage](async_context.md#class-asynclocalstorage).
