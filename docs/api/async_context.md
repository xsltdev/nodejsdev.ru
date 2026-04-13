---
title: Асинхронный контекст
description: Классы для связывания состояния и его распространения через обратные вызовы и цепочки промисов
---

# Асинхронное отслеживание контекста

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/async_context.html)

<!--introduced_in=v16.4.0-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/async_hooks.js -->

## Введение

Эти классы используются для связывания состояния и его распространения через обратные вызовы и цепочки промисов. Они позволяют хранить данные на протяжении всего времени жизни веб-запроса или любого другого асинхронного процесса. Это похоже на локальное хранилище потока в других языках.

Классы `AsyncLocalStorage` и `AsyncResource` являются частью модуля `node:async_hooks`:

=== "MJS"

    ```js
    import {
        AsyncLocalStorage,
        AsyncResource,
    } from 'node:async_hooks';
    ```

=== "CJS"

    ```js
    const {
        AsyncLocalStorage,
        AsyncResource,
    } = require('node:async_hooks');
    ```

## Класс: `AsyncLocalStorage`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
changes:
 - version: v16.4.0
   pr-url: https://github.com/nodejs/node/pull/37675
   description: AsyncLocalStorage is now Stable. Previously, it had been Experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.4.0 | AsyncLocalStorage теперь стабильный. Раньше это был экспериментальный вариант. |

Этот класс создаёт хранилища, которые сохраняют целостность при асинхронных операциях.

Хотя можно создать собственную реализацию поверх модуля `node:async_hooks`, предпочтительнее использовать `AsyncLocalStorage`, поскольку это производительная и безопасная с точки зрения памяти реализация со значительными оптимизациями, которые неочевидно реализовать самостоятельно.

Следующий пример использует `AsyncLocalStorage` для создания простого логгера, который присваивает идентификаторы входящим HTTP-запросам и включает их в сообщения, записываемые в журнал в рамках каждого запроса.

=== "MJS"

    ```js
    import http from 'node:http';
    import { AsyncLocalStorage } from 'node:async_hooks';

    const asyncLocalStorage = new AsyncLocalStorage();

    function logWithId(msg) {
        const id = asyncLocalStorage.getStore();
        console.log(`${id !== undefined ? id : '-'}:`, msg);
    }

    let idSeq = 0;
    http.createServer((req, res) => {
        asyncLocalStorage.run(idSeq++, () => {
            logWithId('start');
            // Представьте здесь любую цепочку асинхронных операций
            setImmediate(() => {
                logWithId('finish');
                res.end();
            });
        });
    }).listen(8080);

    http.get('http://localhost:8080');
    http.get('http://localhost:8080');
    // Выведет:
    //   0: start
    //   0: finish
    //   1: start
    //   1: finish
    ```

=== "CJS"

    ```js
    const http = require('node:http');
    const { AsyncLocalStorage } = require('node:async_hooks');

    const asyncLocalStorage = new AsyncLocalStorage();

    function logWithId(msg) {
        const id = asyncLocalStorage.getStore();
        console.log(`${id !== undefined ? id : '-'}:`, msg);
    }

    let idSeq = 0;
    http.createServer((req, res) => {
        asyncLocalStorage.run(idSeq++, () => {
            logWithId('start');
            // Представьте здесь любую цепочку асинхронных операций
            setImmediate(() => {
                logWithId('finish');
                res.end();
            });
        });
    }).listen(8080);

    http.get('http://localhost:8080');
    http.get('http://localhost:8080');
    // Выведет:
    //   0: start
    //   0: finish
    //   1: start
    //   1: finish
    ```

Каждый экземпляр `AsyncLocalStorage` поддерживает независимый контекст хранения. Несколько экземпляров могут безопасно существовать одновременно без риска вмешательства в данные друг друга.

### `new AsyncLocalStorage([options])`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
changes:
 - version: v24.0.0
   pr-url: https://github.com/nodejs/node/pull/57766
   description: Add `defaultValue` and `name` options.
 - version:
    - v19.7.0
    - v18.16.0
   pr-url: https://github.com/nodejs/node/pull/46386
   description: Removed experimental onPropagate option.
 - version:
    - v19.2.0
    - v18.13.0
   pr-url: https://github.com/nodejs/node/pull/45386
   description: Add option onPropagate.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0 | Добавьте параметры `defaultValue` и `name`. |
    | v19.7.0, v18.16.0 | Удалена экспериментальная опция onPropagate. |
    | v19.2.0, v18.13.0 | Добавьте опцию onPropagate. |

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `defaultValue` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение по умолчанию, которое будет использоваться, если хранилище не передано.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя для значения `AsyncLocalStorage`.

Создаёт новый экземпляр `AsyncLocalStorage`. Хранилище доступно только внутри вызова `run()` или после вызова `enterWith()`.

### Статический метод: `AsyncLocalStorage.bind(fn)`

<!-- YAML
added:
 - v19.8.0
 - v18.16.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую нужно привязать к текущему контексту выполнения.
-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Новую функцию, которая вызывает `fn` в захваченном контексте выполнения.

Привязывает переданную функцию к текущему контексту выполнения.

### Статический метод: `AsyncLocalStorage.snapshot()`

<!-- YAML
added:
 - v19.8.0
 - v18.16.0
changes:
 - version:
    - v23.11.0
    - v22.15.0
   pr-url: https://github.com/nodejs/node/pull/57510
   description: Marking the API stable.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.11.0, v22.15.0 | Маркировка стабильного API. |

-   Возвращает: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Новую функцию с сигнатурой `(fn: (...args) : R, ...args) : R`.

Захватывает текущий контекст выполнения и возвращает функцию, принимающую другую функцию в качестве аргумента. Каждый раз, когда вызывается возвращённая функция, она вызывает переданную ей функцию в захваченном контексте.

```js
const asyncLocalStorage = new AsyncLocalStorage();
const runInAsyncScope = asyncLocalStorage.run(123, () =>
    AsyncLocalStorage.snapshot()
);
const result = asyncLocalStorage.run(321, () =>
    runInAsyncScope(() => asyncLocalStorage.getStore())
);
console.log(result); // returns 123
```

`AsyncLocalStorage.snapshot()` может заменить использование `AsyncResource` для простых задач отслеживания асинхронного контекста, например:

```js
class Foo {
    #runInAsyncScope = AsyncLocalStorage.snapshot();

    get() {
        return this.#runInAsyncScope(() =>
            asyncLocalStorage.getStore()
        );
    }
}

const foo = asyncLocalStorage.run(123, () => new Foo());
console.log(asyncLocalStorage.run(321, () => foo.get())); // returns 123
```

### `asyncLocalStorage.disable()`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

Отключает экземпляр `AsyncLocalStorage`. Все последующие вызовы `asyncLocalStorage.getStore()` будут возвращать `undefined`, пока снова не будет вызван `asyncLocalStorage.run()` или `asyncLocalStorage.enterWith()`.

При вызове `asyncLocalStorage.disable()` будут завершены все текущие контексты, связанные с этим экземпляром.

Вызов `asyncLocalStorage.disable()` обязателен перед тем, как `asyncLocalStorage` сможет быть освобождён сборщиком мусора. Это не относится к хранилищам, предоставляемым `asyncLocalStorage`, поскольку эти объекты собираются вместе с соответствующими асинхронными ресурсами.

Используйте этот метод, когда `asyncLocalStorage` больше не используется в текущем процессе.

### `asyncLocalStorage.getStore()`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

-   Возвращает: [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Возвращает текущее хранилище. Если метод вызывается вне асинхронного контекста, инициализированного вызовом `asyncLocalStorage.run()` или `asyncLocalStorage.enterWith()`, он возвращает `undefined`.

### `asyncLocalStorage.enterWith(store)`

<!-- YAML
added:
 - v13.11.0
 - v12.17.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

-   `store` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Переходит в контекст на оставшуюся часть текущего синхронного выполнения, а затем сохраняет хранилище во всех последующих асинхронных вызовах.

Пример:

```js
const store = { id: 1 };
// Заменяет предыдущее хранилище переданным объектом store
asyncLocalStorage.enterWith(store);
asyncLocalStorage.getStore(); // Returns the store object
someAsyncOperation(() => {
    asyncLocalStorage.getStore(); // Returns the same object
});
```

Этот переход продолжается в течение _всего_ синхронного выполнения. Это означает, что, например, если войти в контекст внутри обработчика события, то последующие обработчики этого события также будут выполняться в данном контексте, если только они явно не привязаны к другому контексту через `AsyncResource`. Поэтому `run()` следует предпочитать `enterWith()`, если только нет серьёзных причин использовать именно этот метод.

```js
const store = { id: 1 };

emitter.on('my-event', () => {
    asyncLocalStorage.enterWith(store);
});
emitter.on('my-event', () => {
    asyncLocalStorage.getStore(); // Returns the same object
});

asyncLocalStorage.getStore(); // Returns undefined
emitter.emit('my-event');
asyncLocalStorage.getStore(); // Returns the same object
```

### `asyncLocalStorage.name`

<!-- YAML
added: v24.0.0
-->

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя экземпляра `AsyncLocalStorage`, если оно задано.

### `asyncLocalStorage.run(store, callback[, ...args])`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

-   `store` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `...args` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Синхронно выполняет функцию внутри контекста и возвращает её возвращаемое значение. Хранилище недоступно вне callback-функции. Хранилище доступно для любых асинхронных операций, созданных внутри callback.

Необязательные `args` передаются в callback-функцию.

Если callback-функция выбрасывает ошибку, `run()` тоже выбрасывает её. Этот вызов не влияет на stack trace, и контекст завершается.

Пример:

```js
const store = { id: 2 };
try {
    asyncLocalStorage.run(store, () => {
        asyncLocalStorage.getStore(); // Returns the store object
        setTimeout(() => {
            asyncLocalStorage.getStore(); // Returns the store object
        }, 200);
        throw new Error();
    });
} catch (e) {
    asyncLocalStorage.getStore(); // Returns undefined
    // Ошибка будет поймана здесь
}
```

### `asyncLocalStorage.exit(callback[, ...args])`

<!-- YAML
added:
 - v13.10.0
 - v12.17.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `...args` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Синхронно выполняет функцию вне контекста и возвращает её возвращаемое значение. Хранилище недоступно внутри callback-функции или асинхронных операций, созданных в её рамках. Любой вызов `getStore()`, выполненный внутри callback-функции, всегда будет возвращать `undefined`.

Необязательные `args` передаются в callback-функцию.

Если callback-функция выбрасывает ошибку, `exit()` тоже выбрасывает её. Этот вызов не влияет на stack trace, а контекст затем восстанавливается.

Пример:

```js
// Внутри вызова run
try {
    asyncLocalStorage.getStore(); // Returns the store object or value
    asyncLocalStorage.exit(() => {
        asyncLocalStorage.getStore(); // Returns undefined
        throw new Error();
    });
} catch (e) {
    asyncLocalStorage.getStore(); // Returns the same object or value
    // Ошибка будет поймана здесь
}
```

### `asyncLocalStorage.withScope(store)`

{: #asynclocalstoragewithscopestore}

<!-- YAML
added: v25.9.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

-   `store` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   Возвращает: [`<RunScope>`](async_context.md)

Создаёт освобождаемый scope, который входит в переданное хранилище и автоматически восстанавливает предыдущее значение хранилища при освобождении scope. Этот метод предназначен для работы с механизмом явного управления ресурсами в JavaScript (синтаксис `using`).

Пример:

=== "MJS"

    ```js
    import { AsyncLocalStorage } from 'node:async_hooks';

    const asyncLocalStorage = new AsyncLocalStorage();

    {
      using _ = asyncLocalStorage.withScope('my-store');
      console.log(asyncLocalStorage.getStore()); // Prints: my-store
    }

    console.log(asyncLocalStorage.getStore()); // Prints: undefined
    ```

=== "CJS"

    ```js
    const { AsyncLocalStorage } = require('node:async_hooks');

    const asyncLocalStorage = new AsyncLocalStorage();

    {
      using _ = asyncLocalStorage.withScope('my-store');
      console.log(asyncLocalStorage.getStore()); // Prints: my-store
    }

    console.log(asyncLocalStorage.getStore()); // Prints: undefined
    ```

Метод `withScope()` особенно полезен для управления контекстом в синхронном коде, когда нужно гарантировать восстановление предыдущего значения хранилища при выходе из блока, даже если была выброшена ошибка.

=== "MJS"

    ```js
    import { AsyncLocalStorage } from 'node:async_hooks';

    const asyncLocalStorage = new AsyncLocalStorage();

    try {
      using _ = asyncLocalStorage.withScope('my-store');
      console.log(asyncLocalStorage.getStore()); // Prints: my-store
      throw new Error('test');
    } catch (e) {
      // Хранилище автоматически восстанавливается даже после ошибки
      console.log(asyncLocalStorage.getStore()); // Prints: undefined
    }
    ```

=== "CJS"

    ```js
    const { AsyncLocalStorage } = require('node:async_hooks');

    const asyncLocalStorage = new AsyncLocalStorage();

    try {
      using _ = asyncLocalStorage.withScope('my-store');
      console.log(asyncLocalStorage.getStore()); // Prints: my-store
      throw new Error('test');
    } catch (e) {
      // Хранилище автоматически восстанавливается даже после ошибки
      console.log(asyncLocalStorage.getStore()); // Prints: undefined
    }
    ```

**Важно:** при использовании `withScope()` в async-функциях до первого `await` учитывайте, что изменение scope повлияет на контекст вызывающего кода. Синхронная часть async-функции (до первого `await`) выполняется немедленно при вызове, а при достижении первого `await` она возвращает вызывающему промис. В этот момент изменение scope становится видимым в контексте вызывающего кода и будет сохраняться в последующем синхронном коде, пока что-то ещё не изменит значение scope. Для асинхронных операций предпочтительнее использовать `run()`, поскольку он корректно изолирует контекст на границах асинхронности.

=== "MJS"

    ```js
    import { AsyncLocalStorage } from 'node:async_hooks';

    const asyncLocalStorage = new AsyncLocalStorage();

    async function example() {
      using _ = asyncLocalStorage.withScope('my-store');
      console.log(asyncLocalStorage.getStore()); // Prints: my-store
      await someAsyncOperation(); // Функция приостанавливается здесь и возвращает промис
      console.log(asyncLocalStorage.getStore()); // Prints: my-store
    }

    // Вызов без await
    example(); // Синхронная часть выполняется и приостанавливается на первом await
    // После возврата промиса scope 'my-store' становится активным у вызывающего кода!
    console.log(asyncLocalStorage.getStore()); // Prints: my-store (unexpected!)
    ```

### Использование с `async/await`

Если внутри async-функции только один вызов `await` должен выполняться в контексте, следует использовать следующий шаблон:

```js
async function fn() {
    await asyncLocalStorage.run(new Map(), () => {
        asyncLocalStorage.getStore().set('key', value);
        return foo(); // The return value of foo will be awaited
    });
}
```

В этом примере хранилище доступно только в callback-функции и в функциях, вызываемых `foo`. Вне `run` вызов `getStore` вернёт `undefined`.

### Устранение неполадок: потеря контекста

В большинстве случаев `AsyncLocalStorage` работает без проблем. В редких ситуациях текущее хранилище теряется в одной из асинхронных операций.

Если ваш код основан на callback-функциях, достаточно промисифицировать его с помощью [`util.promisify()`](util.md#utilpromisifyoriginal), чтобы он начал работать с нативными промисами.

Если вам нужно использовать API на основе callback-функций или ваш код предполагает пользовательскую реализацию thenable, используйте класс [`AsyncResource`](#класс-asyncresource) для связывания асинхронной операции с правильным контекстом выполнения. Найдите вызов функции, ответственный за потерю контекста, логируя содержимое `asyncLocalStorage.getStore()` после вызовов, которые вы подозреваете в этой потере. Когда в логе появляется `undefined`, вероятнее всего, за потерю контекста отвечает последний вызванный callback.

## Класс: `RunScope`

<!-- YAML
added: v25.9.0
-->

!!!warning "Стабильность: 1 – Экспериментальная"

    Экспериментальный

Освобождаемый scope, возвращаемый [`asyncLocalStorage.withScope()`](#asynclocalstoragewithscopestore), который автоматически восстанавливает предыдущее значение хранилища при освобождении. Этот класс реализует протокол [явного управления ресурсами](https://github.com/tc39/proposal-explicit-resource-management) и предназначен для работы с синтаксисом `using` в JavaScript.

Scope автоматически восстанавливает предыдущее значение хранилища при выходе из блока `using` как при обычном завершении, так и при выбрасывании ошибки.

### `scope.dispose()`

<!-- YAML
added: v25.9.0
-->

Явно завершает scope и восстанавливает предыдущее значение хранилища. Этот метод идемпотентен: многократный вызов имеет тот же эффект, что и однократный.

Метод `[Symbol.dispose]()` делегирует `dispose()`.

Если `withScope()` вызывается без ключевого слова `using`, для восстановления предыдущего значения хранилища необходимо вручную вызвать `dispose()`. Если забыть вызвать `dispose()`, значение хранилища сохранится на оставшуюся часть текущего контекста выполнения:

=== "MJS"

    ```js
    import { AsyncLocalStorage } from 'node:async_hooks';

    const storage = new AsyncLocalStorage();

    // Без using scope нужно освобождать вручную
    const scope = storage.withScope('my-store');
    // storage.getStore() === 'my-store' here

    scope.dispose(); // Восстанавливаем предыдущее значение
    // storage.getStore() === undefined here
    ```

=== "CJS"

    ```js
    const { AsyncLocalStorage } = require('node:async_hooks');

    const storage = new AsyncLocalStorage();

    // Без using scope нужно освобождать вручную
    const scope = storage.withScope('my-store');
    // storage.getStore() === 'my-store' here

    scope.dispose(); // Восстанавливаем предыдущее значение
    // storage.getStore() === undefined here
    ```

## Класс: `AsyncResource`

{: #class-asyncresource}

<!-- YAML
changes:
 - version: v16.4.0
   pr-url: https://github.com/nodejs/node/pull/37675
   description: AsyncResource is now Stable. Previously, it had been Experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v16.4.0 | AsyncResource теперь стабильный. Раньше это был экспериментальный вариант. |

Класс `AsyncResource` предназначен для расширения асинхронными ресурсами, создаваемыми embedder-ом. С его помощью пользователи могут легко инициировать события жизненного цикла собственных ресурсов.

Хук `init` срабатывает при создании экземпляра `AsyncResource`.

Ниже приведён обзор API `AsyncResource`.

=== "MJS"

    ```js
    import {
        AsyncResource,
        executionAsyncId,
    } from 'node:async_hooks';

    // AsyncResource() предназначен для расширения. Создание
    // нового AsyncResource() также вызывает init. Если triggerAsyncId опущен,
    // используется async_hook.executionAsyncId().
    const asyncResource = new AsyncResource(type, {
        triggerAsyncId: executionAsyncId(),
        requireManualDestroy: false,
    });

    // Выполнить функцию в контексте выполнения ресурса. Это:
    // * установит контекст ресурса
    // * вызовет AsyncHooks before для callback-функций
    // * вызовет переданную функцию `fn` с указанными аргументами
    // * вызовет AsyncHooks after для callback-функций
    // * восстановит исходный контекст выполнения
    asyncResource.runInAsyncScope(fn, thisArg, ...args);

    // Вызвать destroy-callback-функции AsyncHooks.
    asyncResource.emitDestroy();

    // Вернуть уникальный ID, присвоенный экземпляру AsyncResource.
    asyncResource.asyncId();

    // Вернуть trigger ID для экземпляра AsyncResource.
    asyncResource.triggerAsyncId();
    ```

=== "CJS"

    ```js
    const {
        AsyncResource,
        executionAsyncId,
    } = require('node:async_hooks');

    // AsyncResource() предназначен для расширения. Создание
    // нового AsyncResource() также вызывает init. Если triggerAsyncId опущен,
    // используется async_hook.executionAsyncId().
    const asyncResource = new AsyncResource(type, {
        triggerAsyncId: executionAsyncId(),
        requireManualDestroy: false,
    });

    // Выполнить функцию в контексте выполнения ресурса. Это:
    // * установит контекст ресурса
    // * вызовет AsyncHooks before для callback-функций
    // * вызовет переданную функцию `fn` с указанными аргументами
    // * вызовет AsyncHooks after для callback-функций
    // * восстановит исходный контекст выполнения
    asyncResource.runInAsyncScope(fn, thisArg, ...args);

    // Вызвать destroy-callback-функции AsyncHooks.
    asyncResource.emitDestroy();

    // Вернуть уникальный ID, присвоенный экземпляру AsyncResource.
    asyncResource.asyncId();

    // Вернуть trigger ID для экземпляра AsyncResource.
    asyncResource.triggerAsyncId();
    ```

### `new AsyncResource(type[, options])`

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип асинхронного события.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `triggerAsyncId` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) ID контекста выполнения, создавшего это асинхронное событие. **По умолчанию:** `executionAsyncId()`.
    -   `requireManualDestroy` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено в `true`, отключает `emitDestroy` при сборке объекта мусорщиком. Обычно это значение задавать не требуется (даже если `emitDestroy` вызывается вручную), кроме случая, когда был получен `asyncId` ресурса и с ним вызывается `emitDestroy` чувствительного API. Если установлено в `false`, вызов `emitDestroy` при сборке мусора произойдёт только при наличии хотя бы одного активного хука `destroy`. **По умолчанию:** `false`.

Пример использования:

```js
class DBQuery extends AsyncResource {
    constructor(db) {
        super('DBQuery');
        this.db = db;
    }

    getInfo(query, callback) {
        this.db.get(query, (err, data) => {
            this.runInAsyncScope(callback, null, err, data);
        });
    }

    close() {
        this.db = null;
        this.emitDestroy();
    }
}
```

### Статический метод: `AsyncResource.bind(fn[, type[, thisArg]])`

<!-- YAML
added:
  - v14.8.0
  - v12.19.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46432
    description: The `asyncResource` property added to the bound function
                 has been deprecated and will be removed in a future
                 version.
  - version:
    - v17.8.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/42177
    description: Changed the default when `thisArg` is undefined to use `this`
                 from the caller.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/36782
    description: Added optional thisArg.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Свойство asyncResource, добавленное к связанной функции, устарело и будет удалено в будущей версии. |
    | v17.8.0, v16.15.0 | Изменено значение по умолчанию, когда thisArg не определен, чтобы использовать this от вызывающего объекта. |
    | v16.0.0 | Добавлен необязательный thisArg. |

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую нужно привязать к текущему контексту выполнения.
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное имя, связанное с базовым `AsyncResource`.
-   `thisArg` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Привязывает переданную функцию к текущему контексту выполнения.

### `asyncResource.bind(fn[, thisArg])`

<!-- YAML
added:
  - v14.8.0
  - v12.19.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46432
    description: The `asyncResource` property added to the bound function
                 has been deprecated and will be removed in a future
                 version.
  - version:
    - v17.8.0
    - v16.15.0
    pr-url: https://github.com/nodejs/node/pull/42177
    description: Changed the default when `thisArg` is undefined to use `this`
                 from the caller.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/36782
    description: Added optional thisArg.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Свойство asyncResource, добавленное к связанной функции, устарело и будет удалено в будущей версии. |
    | v17.8.0, v16.15.0 | Изменено значение по умолчанию, когда thisArg не определен, чтобы использовать this от вызывающего объекта. |
    | v16.0.0 | Добавлен необязательный thisArg. |

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую нужно привязать к текущему `AsyncResource`.
-   `thisArg` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Привязывает переданную функцию к выполнению в scope этого `AsyncResource`.

### `asyncResource.runInAsyncScope(fn[, thisArg, ...args])`

<!-- YAML
added: v9.6.0
-->

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которую нужно вызвать в контексте выполнения этого асинхронного ресурса.
-   `thisArg` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Получатель, который будет использован при вызове функции.
-   `...args` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательные аргументы, передаваемые в функцию.

Вызывает переданную функцию с указанными аргументами в контексте выполнения асинхронного ресурса. Это установит контекст, вызовет AsyncHooks before для callback-функций, вызовет функцию, затем AsyncHooks after и после этого восстановит исходный контекст выполнения.

### `asyncResource.emitDestroy()`

-   Возвращает: [`<AsyncResource>`](async_hooks.md#asyncresource) Ссылку на `asyncResource`.

Вызывает все хуки `destroy`. Этот метод должен вызываться только один раз. Если вызвать его более одного раза, будет выброшена ошибка. Его **необходимо** вызывать вручную. Если ресурс будет просто собран GC, хуки `destroy` никогда не будут вызваны.

### `asyncResource.asyncId()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уникальный `asyncId`, присвоенный ресурсу.

### `asyncResource.triggerAsyncId()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тот же `triggerAsyncId`, который передаётся в конструктор `AsyncResource`.

### Использование `AsyncResource` для пула потоков `Worker` {#async-resource-worker-pool}

Следующий пример показывает, как использовать класс `AsyncResource` для корректного асинхронного отслеживания в пуле [`Worker`](worker_threads.md#class-worker). Другие пулы ресурсов, например пулы подключений к базам данных, могут использовать аналогичную модель.

Предположим, задача состоит в сложении двух чисел, а файл `task_processor.js` содержит следующий код:

=== "MJS"

    ```js
    import { parentPort } from 'node:worker_threads';
    parentPort.on('message', (task) => {
        parentPort.postMessage(task.a + task.b);
    });
    ```

=== "CJS"

    ```js
    const { parentPort } = require('node:worker_threads');
    parentPort.on('message', (task) => {
        parentPort.postMessage(task.a + task.b);
    });
    ```

Пул `Worker` вокруг него мог бы использовать следующую структуру:

=== "MJS"

    ```js
    import { AsyncResource } from 'node:async_hooks';
    import { EventEmitter } from 'node:events';
    import { Worker } from 'node:worker_threads';

    const kTaskInfo = Symbol('kTaskInfo');
    const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

    class WorkerPoolTaskInfo extends AsyncResource {
        constructor(callback) {
            super('WorkerPoolTaskInfo');
            this.callback = callback;
        }

        done(err, result) {
            this.runInAsyncScope(
                this.callback,
                null,
                err,
                result
            );
            this.emitDestroy(); // `TaskInfo` используются только один раз.
        }
    }

    export default class WorkerPool extends EventEmitter {
        constructor(numThreads) {
            super();
            this.numThreads = numThreads;
            this.workers = [];
            this.freeWorkers = [];
            this.tasks = [];

            for (let i = 0; i < numThreads; i++)
                this.addNewWorker();

            // Каждый раз, когда выбрасывается kWorkerFreedEvent, отправляем
            // следующую задачу, ожидающую в очереди, если она есть.
            this.on(kWorkerFreedEvent, () => {
                if (this.tasks.length > 0) {
                    const {
                        task,
                        callback,
                    } = this.tasks.shift();
                    this.runTask(task, callback);
                }
            });
        }

        addNewWorker() {
            const worker = new Worker(
                new URL('task_processor.js', import.meta.url)
            );
            worker.on('message', (result) => {
                // В случае успеха вызываем callback, переданный в `runTask`,
                // удаляем `TaskInfo`, связанный с Worker, и снова помечаем
                // его как свободный.
                worker[kTaskInfo].done(null, result);
                worker[kTaskInfo] = null;
                this.freeWorkers.push(worker);
                this.emit(kWorkerFreedEvent);
            });
            worker.on('error', (err) => {
                // В случае неперехваченного исключения вызываем callback,
                // переданный в `runTask`, с ошибкой.
                if (worker[kTaskInfo])
                    worker[kTaskInfo].done(err, null);
                else this.emit('error', err);
                // Удаляем worker из списка и запускаем новый Worker,
                // чтобы заменить текущий.
                this.workers.splice(
                    this.workers.indexOf(worker),
                    1
                );
                this.addNewWorker();
            });
            this.workers.push(worker);
            this.freeWorkers.push(worker);
            this.emit(kWorkerFreedEvent);
        }

        runTask(task, callback) {
            if (this.freeWorkers.length === 0) {
                // Свободных потоков нет, ждём, пока поток Worker не освободится.
                this.tasks.push({ task, callback });
                return;
            }

            const worker = this.freeWorkers.pop();
            worker[kTaskInfo] = new WorkerPoolTaskInfo(
                callback
            );
            worker.postMessage(task);
        }

        close() {
            for (const worker of this.workers)
                worker.terminate();
        }
    }
    ```

=== "CJS"

    ```js
    const { AsyncResource } = require('node:async_hooks');
    const { EventEmitter } = require('node:events');
    const path = require('node:path');
    const { Worker } = require('node:worker_threads');

    const kTaskInfo = Symbol('kTaskInfo');
    const kWorkerFreedEvent = Symbol('kWorkerFreedEvent');

    class WorkerPoolTaskInfo extends AsyncResource {
        constructor(callback) {
            super('WorkerPoolTaskInfo');
            this.callback = callback;
        }

        done(err, result) {
            this.runInAsyncScope(
                this.callback,
                null,
                err,
                result
            );
            this.emitDestroy(); // `TaskInfo` используются только один раз.
        }
    }

    class WorkerPool extends EventEmitter {
        constructor(numThreads) {
            super();
            this.numThreads = numThreads;
            this.workers = [];
            this.freeWorkers = [];
            this.tasks = [];

            for (let i = 0; i < numThreads; i++)
                this.addNewWorker();

            // Каждый раз, когда выбрасывается kWorkerFreedEvent, отправляем
            // следующую задачу, ожидающую в очереди, если она есть.
            this.on(kWorkerFreedEvent, () => {
                if (this.tasks.length > 0) {
                    const {
                        task,
                        callback,
                    } = this.tasks.shift();
                    this.runTask(task, callback);
                }
            });
        }

        addNewWorker() {
            const worker = new Worker(
                path.resolve(__dirname, 'task_processor.js')
            );
            worker.on('message', (result) => {
                // В случае успеха вызываем callback, переданный в `runTask`,
                // удаляем `TaskInfo`, связанный с Worker, и снова помечаем
                // его как свободный.
                worker[kTaskInfo].done(null, result);
                worker[kTaskInfo] = null;
                this.freeWorkers.push(worker);
                this.emit(kWorkerFreedEvent);
            });
            worker.on('error', (err) => {
                // В случае неперехваченного исключения вызываем callback,
                // переданный в `runTask`, с ошибкой.
                if (worker[kTaskInfo])
                    worker[kTaskInfo].done(err, null);
                else this.emit('error', err);
                // Удаляем worker из списка и запускаем новый Worker,
                // чтобы заменить текущий.
                this.workers.splice(
                    this.workers.indexOf(worker),
                    1
                );
                this.addNewWorker();
            });
            this.workers.push(worker);
            this.freeWorkers.push(worker);
            this.emit(kWorkerFreedEvent);
        }

        runTask(task, callback) {
            if (this.freeWorkers.length === 0) {
                // Свободных потоков нет, ждём, пока поток Worker не освободится.
                this.tasks.push({ task, callback });
                return;
            }

            const worker = this.freeWorkers.pop();
            worker[kTaskInfo] = new WorkerPoolTaskInfo(
                callback
            );
            worker.postMessage(task);
        }

        close() {
            for (const worker of this.workers)
                worker.terminate();
        }
    }

    module.exports = WorkerPool;
    ```

Без явного отслеживания, которое добавляют объекты `WorkerPoolTaskInfo`, могло бы показаться, что callback-функции связаны с отдельными объектами `Worker`. Однако создание `Worker` не связано с созданием задач и не даёт информации о том, когда эти задачи были запланированы.

Этот пул можно использовать следующим образом:

=== "MJS"

    ```js
    import WorkerPool from './worker_pool.js';
    import os from 'node:os';

    const pool = new WorkerPool(os.availableParallelism());

    let finished = 0;
    for (let i = 0; i < 10; i++) {
        pool.runTask({ a: 42, b: 100 }, (err, result) => {
            console.log(i, err, result);
            if (++finished === 10) pool.close();
        });
    }
    ```

=== "CJS"

    ```js
    const WorkerPool = require('./worker_pool.js');
    const os = require('node:os');

    const pool = new WorkerPool(os.availableParallelism());

    let finished = 0;
    for (let i = 0; i < 10; i++) {
        pool.runTask({ a: 42, b: 100 }, (err, result) => {
            console.log(i, err, result);
            if (++finished === 10) pool.close();
        });
    }
    ```

### Интеграция `AsyncResource` с `EventEmitter`

Слушатели событий, запускаемые [`EventEmitter`](events.md#class-eventemitter), могут выполняться в другом контексте выполнения, чем тот, который был активен во время вызова `eventEmitter.on()`.

Следующий пример показывает, как использовать класс `AsyncResource` для правильного связывания слушателя события с корректным контекстом выполнения. Тот же подход можно применить к [`Stream`](stream.md#stream) или аналогичному классу, управляемому событиями.

=== "MJS"

    ```js
    import { createServer } from 'node:http';
    import {
        AsyncResource,
        executionAsyncId,
    } from 'node:async_hooks';

    const server = createServer((req, res) => {
        req.on(
            'close',
            AsyncResource.bind(() => {
                // Контекст выполнения привязан к текущей внешней области видимости.
            })
        );
        req.on('close', () => {
            // Контекст выполнения привязан к области видимости, вызвавшей 'close'.
        });
        res.end();
    }).listen(3000);
    ```

=== "CJS"

    ```js
    const { createServer } = require('node:http');
    const {
        AsyncResource,
        executionAsyncId,
    } = require('node:async_hooks');

    const server = createServer((req, res) => {
        req.on(
            'close',
            AsyncResource.bind(() => {
                // Контекст выполнения привязан к текущей внешней области видимости.
            })
        );
        req.on('close', () => {
            // Контекст выполнения привязан к области видимости, вызвавшей 'close'.
        });
        res.end();
    }).listen(3000);
    ```
