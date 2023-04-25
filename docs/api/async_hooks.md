---
title: Async hooks
description: Модуль async_hooks предоставляет API для отслеживания асинхронных ресурсов
---

# Асинхронные хуки

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/async_hooks.html)

!!!warning "Стабильность: 1 – Экспериментальная"

    Пожалуйста, мигрируйте от этого API, если можете. Мы не рекомендуем использовать API [`createHook`](#async_hookscreatehookcallbacks), [`AsyncHook`](#class-asynchook) и [`executionAsyncResource`](#async_hooksexecutionasyncresource), так как они имеют проблемы с удобством использования, риски для безопасности и влияют на производительность. Для случаев использования отслеживания асинхронного контекста лучше использовать стабильный API [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage). Если у вас есть сценарий использования `createHook`, `AsyncHook` или `executionAsyncResource`, выходящий за рамки потребностей отслеживания контекста, решаемых [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage) или диагностических данных, предоставляемых в настоящее время [Diagnostics Channel](diagnostics_channel.md), пожалуйста, откройте проблему по адресу <https://github.com/nodejs/node/issues>, описав ваш сценарий использования, чтобы мы могли создать API, более ориентированный на конкретные цели.

Мы настоятельно не рекомендуем использовать API `async_hooks`. Другие API, которые могут покрыть большинство случаев использования, включают:

- [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage) пути async контекста
- [`process.getActiveResourcesInfo()`](process.md#processgetactiveresourcesinfo) отслеживает активные ресурсы

Модуль `node:async_hooks` предоставляет API для отслеживания асинхронных ресурсов. Доступ к нему можно получить, используя:

```mjs
import async_hooks from 'node:async_hooks';
```

```cjs
const async_hooks = require('node:async_hooks');
```

## Терминология

Асинхронный ресурс представляет собой объект с ассоциированным обратным вызовом. Этот обратный вызов может быть вызван несколько раз, например, событие `'connection'` в `net.createServer()`, или только один раз, как в `fs.open()`. Ресурс также может быть закрыт до вызова обратного вызова. `AsyncHook` не делает явного различия между этими разными случаями, но будет представлять их как абстрактную концепцию, которой является ресурс.

Если используется [`Worker`](worker_threads.md#class-worker)s, каждый поток имеет независимый интерфейс `async_hooks`, и каждый поток будет использовать новый набор идентификаторов async.

## Обзор

Ниже приведен простой обзор публичного API.

```mjs
import async_hooks from 'node:async_hooks';

// Возвращаем идентификатор текущего контекста выполнения.
const eid = async_hooks.executionAsyncId();

// Возвращаем идентификатор дескриптора, ответственного за инициирование обратного вызова из
// текущего контекста выполнения для вызова.
const tid = async_hooks.triggerAsyncId();

// Создаем новый экземпляр AsyncHook. Все эти обратные вызовы необязательны.
const asyncHook = async_hooks.createHook({
  init,
  before,
  after,
  destroy,
  promiseResolve,
});

// Разрешить обратные вызовы этого экземпляра AsyncHook. Это не является неявным
// действие после выполнения конструктора, а должно быть явно запущено, чтобы начать
// выполнение обратных вызовов.
asyncHook.enable();

// Отключить прослушивание новых асинхронных событий.
asyncHook.disable();

//
// Ниже перечислены обратные вызовы, которые могут быть переданы в createHook().
//

// init() вызывается во время создания объекта. Ресурс может не
// завершено строительство, когда выполняется этот обратный вызов. Поэтому все поля
// ресурса, на которые ссылается "asyncId", могут быть не заполнены.
function init(asyncId, type, triggerAsyncId, resource) {}

// before() вызывается непосредственно перед вызовом обратного вызова ресурса. Она может быть
// вызываться 0-N раз для обработчиков (таких как TCPWrap), и будет вызвана ровно 1
// раз для запросов (например, FSReqCallback).
function before(asyncId) {}

// after() вызывается сразу после завершения обратного вызова ресурса.
function after(asyncId) {}

// destroy() вызывается, когда ресурс уничтожается.
function destroy(asyncId) {}

// promiseResolve() вызывается только для ресурсов обещания, когда функция promise(), переданная ресурсу, будет уничтожена.
// функция resolve(), переданная конструктору Promise, вызывается
// (либо напрямую, либо с помощью других средств разрешения обещания).
function promiseResolve(asyncId) {}
```

```cjs
const async_hooks = require('node:async_hooks');

// Возвращаем идентификатор текущего контекста выполнения.
const eid = async_hooks.executionAsyncId();

// Возвращаем идентификатор дескриптора, ответственного за инициирование обратного вызова
// текущего контекста выполнения для вызова.
const tid = async_hooks.triggerAsyncId();

// Создаем новый экземпляр AsyncHook. Все эти обратные вызовы необязательны.
const asyncHook = async_hooks.createHook({
  init,
  before,
  after,
  destroy,
  promiseResolve,
});

// Разрешить обратные вызовы этого экземпляра AsyncHook. Это не является неявным
// действие после выполнения конструктора, а должно быть явно запущено, чтобы начать
// выполнение обратных вызовов.
asyncHook.enable();

// Отключить прослушивание новых асинхронных событий.
asyncHook.disable();

//
// Ниже перечислены обратные вызовы, которые могут быть переданы в createHook().
//

// init() вызывается во время создания объекта. Ресурс может не
// завершено строительство, когда выполняется этот обратный вызов. Поэтому все поля
// ресурса, на которые ссылается "asyncId", могут быть не заполнены.
function init(asyncId, type, triggerAsyncId, resource) {}

// before() вызывается непосредственно перед вызовом обратного вызова ресурса. Она может быть
// вызываться 0-N раз для обработчиков (таких как TCPWrap), и будет вызвана ровно 1
// раз для запросов (например, FSReqCallback).
function before(asyncId) {}

// after() вызывается сразу после завершения обратного вызова ресурса.
function after(asyncId) {}

// destroy() вызывается, когда ресурс уничтожается.
function destroy(asyncId) {}

// promiseResolve() вызывается только для ресурсов обещания, когда функция promise(), переданная ресурсу, будет уничтожена.
// функция resolve(), переданная конструктору Promise, вызывается
// (либо напрямую, либо с помощью других средств разрешения обещания).
function promiseResolve(asyncId) {}
```

## `async_hooks.createHook(callbacks)`

- `callbacks` {Object} [Обратные вызовы крюка] (#hook-callbacks) для регистрации
  - `init` {Function} Обратный вызов [`init`](#initasyncid-type-triggerasyncid-resource).
  - `before` {Функция} Обратный вызов [`before`](#beforeasyncid).
  - `after` {Function} Обратный вызов [`after`](#afterasyncid).
  - `destroy` {Function} Обратный вызов [`destroy`](#destroyasyncid).
  - `promiseResolve` {Функция} Обратный вызов [`promiseResolve`](#promiseresolveasyncid).
- Возвращает: {AsyncHook} Экземпляр, используемый для отключения и включения хуков.

Регистрирует функции, которые будут вызываться для различных событий времени жизни каждой асинхронной операции.

Обратные вызовы `init()`/ `before()`/ `after()`/ `destroy()` вызываются для соответствующего асинхронного события в течение времени жизни ресурса.

Все обратные вызовы необязательны. Например, если необходимо отслеживать только очистку ресурса, то нужно передать только обратный вызов `destroy`. Специфика всех функций, которые могут быть переданы в `callbacks`, находится в разделе [Hook Callbacks](#hook-callbacks).

```mjs
import { createHook } from 'node:async_hooks';

const asyncHook = createHook({
  init(asyncId, type, triggerAsyncId, resource) {},
  destroy(asyncId) {},
});
```

```cjs
const async_hooks = require('node:async_hooks');

const asyncHook = async_hooks.createHook({
  init(asyncId, type, triggerAsyncId, resource) {},
  destroy(asyncId) {},
});
```

Обратные вызовы будут наследоваться через цепочку прототипов:

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

Поскольку обещания являются асинхронными ресурсами, жизненный цикл которых отслеживается через механизм асинхронных крючков, обратные вызовы `init()`, `before()`, `after()` и `destroy()` \_не должны быть асинхронными функциями, возвращающими обещания.

### Обработка ошибок

Если какой-либо обратный вызов `AsyncHook` отбрасывает ошибку, приложение выводит трассировку стека и завершает работу. Путь завершения следует за не пойманным исключением, но все слушатели `'uncaughtException'` удаляются, тем самым заставляя процесс завершиться. Обратные вызовы `'exit'` по-прежнему будут вызываться, если только приложение не запущено с `--abort-on-uncaught-exception`, в этом случае будет напечатана трассировка стека и приложение выйдет, оставив файл ядра.

Причина такого поведения при обработке ошибок заключается в том, что эти обратные вызовы выполняются в потенциально изменчивые моменты жизни объекта, например, во время создания и уничтожения класса. В связи с этим считается необходимым быстро завершить процесс, чтобы предотвратить непреднамеренное прерывание в будущем. Это может быть изменено в будущем, если будет проведен всесторонний анализ, чтобы убедиться, что исключение может следовать нормальному потоку управления без непреднамеренных побочных эффектов.

### Печать в обратных вызовах `AsyncHook`

Поскольку печать на консоль является асинхронной операцией, `console.log()` вызовет обратные вызовы `AsyncHook`. Использование `console.log()` или подобных асинхронных операций внутри функции обратного вызова `AsyncHook` приведет к бесконечной рекурсии. Простым решением этой проблемы при отладке является использование синхронной операции протоколирования, такой как `fs.writeFileSync(file, msg, flag)`. Это приведет к печати в файл и не будет рекурсивно вызывать `AsyncHook`, поскольку она синхронна.

```mjs
import { writeFileSync } from 'node:fs';
import { format } from 'node:util';

function debug(...args) {
  // Use a function like this one when debugging inside an AsyncHook callback
  writeFileSync('log.out', `${format(...args)}\n`, {
    flag: 'a',
  });
}
```

```cjs
const fs = require('node:fs');
const util = require('node:util');

function debug(...args) {
  // Используйте функцию, подобную этой, при отладке внутри обратного вызова AsyncHook
  fs.writeFileSync('log.out', `${util.format(...args)}\n`, {
    flag: 'a',
  });
}
```

Если асинхронная операция необходима для логирования, можно отслеживать, что вызвало асинхронную операцию, используя информацию, предоставляемую самим `AsyncHook`. Тогда логирование должно быть пропущено, если именно логирование вызвало обратный вызов `AsyncHook`. Таким образом, прерывается бесконечная рекурсия.

## Класс: `AsyncHook`

Класс `AsyncHook` предоставляет интерфейс для отслеживания событий времени жизни асинхронных операций.

### `asyncHook.enable()`

- Возвращает: {AsyncHook} Ссылка на `asyncHook`.

Включает обратные вызовы для данного экземпляра `AsyncHook`. Если обратные вызовы не предоставлены, включение не имеет смысла.

По умолчанию экземпляр `AsyncHook` отключен. Если экземпляр `AsyncHook` должен быть включен сразу после создания, можно использовать следующий шаблон.

```mjs
import { createHook } from 'node:async_hooks';

const hook = createHook(callbacks).enable();
```

```cjs
const async_hooks = require('node:async_hooks');

const hook = async_hooks.createHook(callbacks).enable();
```

### `asyncHook.disable()`

- Возвращает: {AsyncHook} Ссылка на `asyncHook`.

Отключает обратные вызовы для данного экземпляра `AsyncHook` из глобального пула обратных вызовов `AsyncHook` для выполнения. После отключения хука он не будет вызываться снова, пока не будет включен.

Для согласованности API `disable()` также возвращает экземпляр `AsyncHook`.

### Обратные вызовы крючков

Ключевые события во время жизни асинхронных событий были разделены на четыре области: инстанцирование, до/после вызова обратного вызова, и когда экземпляр уничтожается.

#### `init(asyncId, type, triggerAsyncId, resource)`

- `asyncId` {number} Уникальный идентификатор для ресурса async.
- `type` {string} Тип асинхронного ресурса.
- `triggerAsyncId` {number} Уникальный ID ресурса async, в контексте выполнения которого был создан данный ресурс async.
- `resource` {Object} Ссылка на ресурс, представляющий асинхронную операцию, должен быть освобожден во время _destroy_.

Вызывается при создании класса, который имеет _возможность_ испускать асинхронное событие. Это _не_ означает, что экземпляр должен вызвать `before`/`after` перед вызовом `destroy`, только то, что такая возможность существует.

Такое поведение можно наблюдать, если сделать что-то вроде открытия ресурса, а затем закрыть его до того, как ресурс может быть использован. Следующий фрагмент демонстрирует это.

```mjs
import { createServer } from 'node:net';

createServer().listen(function () {
  this.close();
});
// ИЛИ
clearTimeout(setTimeout(() => {}, 10));
```

```cjs
require('node:net')
  .createServer()
  .listen(function () {
    this.close();
  });
// ИЛИ
clearTimeout(setTimeout(() => {}, 10));
```

Каждому новому ресурсу присваивается идентификатор, уникальный в пределах текущего экземпляра Node.js.

##### `type`

`type` - это строка, идентифицирующая тип ресурса, который вызвал вызов `init`. Как правило, она соответствует имени конструктора ресурса.

Тип `type` ресурсов, создаваемых самим Node.js, может измениться в любом выпуске Node.js. Допустимые значения включают `TLSWRAP`, `TCPWRAP`, `TCPSERVERWRAP`, `GETADDRINFOREQWRAP`, `FSREQCALLBACK`, `Microtask` и `Timeout`. Для получения полного списка обратитесь к исходному коду используемой версии Node.js.

Кроме того, пользователи [`AsyncResource`](async_context.md#class-asyncresource) создают асинхронные ресурсы независимо от самого Node.js.

Существует также тип ресурса `PROMISE`, который используется для отслеживания экземпляров `Promise` и запланированных ими асинхронных работ.

Пользователи могут определить свой собственный `тип` при использовании публичного API embedder.

Возможны столкновения имен типов. Встраивателям рекомендуется использовать уникальные префиксы, такие как имя пакета npm, чтобы избежать коллизий при прослушивании хуков.

##### `triggerAsyncId`

`triggerAsyncId` - это `asyncId` ресурса, который вызвал (или "запустил") инициализацию нового ресурса и вызвал вызов `init`. Это отличается от `async_hooks.executionAsyncId()`, который показывает только _когда_ был создан ресурс, в то время как `triggerAsyncId` показывает _почему_ был создан ресурс.

Ниже приведена простая демонстрация `triggerAsyncId`:

```mjs
import { createHook, executionAsyncId } from "node:async_hooks";
import { stdout } из "node:process";
import net from "node:net";
import fs from "node:fs";


createHook({
  init(asyncId, type, triggerAsyncId) {
    const eid = executionAsyncId();
    fs.writeSync(stdout.fd, `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`);
  },
}).enable();


net.createServer((conn) => {}).listen(8080);
```

```cjs
const {
  createHook,
  executionAsyncId,
} = require('node:async_hooks');
const { stdout } = require('node:process');
const net = require('node:net');
const fs = require('node:fs');

createHook({
  init(asyncId, type, triggerAsyncId) {
    const eid = executionAsyncId();
    fs.writeSync(
      stdout.fd,
      `${type}(${asyncId}): trigger: ${triggerAsyncId} execution: ${eid}\n`
    );
  },
}).enable();

net.createServer((conn) => {}).listen(8080);
```

Вывод при обращении к серверу с `nc localhost 8080`:

```console
TCPSERVERWRAP(5): trigger: 1 execution: 1
TCPWRAP(7): триггер: 5 выполнение: 0
```

`TCPSERVERWRAP` - это сервер, который принимает соединения.

`TCPWRAP` - это новое соединение от клиента. Когда создается новое соединение, немедленно создается экземпляр `TCPWrap`. Это происходит вне любого стека JavaScript. (Значение `executionAsyncId()` равное `0` означает, что это выполняется из C++ без стека JavaScript над ним). Имея только эту информацию, было бы невозможно связать ресурсы вместе с точки зрения того, что вызвало их создание, поэтому `triggerAsyncId` получает задачу распространить информацию о том, какой ресурс ответственен за существование нового ресурса.

##### `resource`

`resource` - это объект, представляющий реальный асинхронный ресурс, который был инициализирован. API для доступа к объекту может быть указан создателем ресурса. Ресурсы, созданные самим Node.js, являются внутренними и могут изменяться в любое время. Поэтому для них не указывается API.

В некоторых случаях объект ресурса используется повторно по причинам производительности, поэтому небезопасно использовать его в качестве ключа в `WeakMap` или добавлять к нему свойства.

##### Пример асинхронного контекста

Случай использования отслеживания контекста покрывается стабильным API [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage). Этот пример только иллюстрирует работу асинхронных крючков, но [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage) лучше подходит для этого случая использования.

Ниже приведен пример с дополнительной информацией о вызовах `init` между вызовами `before` и `after`, в частности о том, как будет выглядеть обратный вызов `listen()`. Форматирование вывода немного более сложное, чтобы было легче увидеть контекст вызова.

```js
const async_hooks = require('node:async_hooks');
const fs = require('node:fs');
const net = require('node:net');
const { fd } = process.stdout;

let indent = 0;
async_hooks
  .createHook({
    init(asyncId, type, triggerAsyncId) {
      const eid = async_hooks.executionAsyncId();
      const indentStr = ' '.repeat(indent);
      fs.writeSync(
        fd,
        `${indentStr}${type}(${asyncId}):` +
          `триггер: ${triggerAsyncId} выполнение: ${eid}\n`
      );
    },
    before(asyncId) {
      const indentStr = ' '.repeat(indent);
      fs.writeSync(fd, `${indentStr}before: ${asyncId}\n`);
      indent += 2;
    },
    after(asyncId) {
      indent -= 2;
      const indentStr = ' '.repeat(indent);
      fs.writeSync(fd, `${indentStr}after: ${asyncId}\n`);
    },
    destroy(asyncId) {
      const indentStr = ' '.repeat(indent);
      fs.writeSync(fd, `${indentStr}destroy: ${asyncId}\n`);
    },
  })
  .enable();

net
  .createServer(() => {})
  .listen(8080, () => {
    // Давайте подождем 10 мс, прежде чем зарегистрировать запуск сервера.
    setTimeout(() => {
      console.log('>>>', async_hooks.executionAsyncId());
    }, 10);
  });
```

Вывод только при запуске сервера:

```console
TCPSERVERWRAP(5): триггер: 1 выполнение: 1
TickObject(6): триггер: 5 выполнение: 1
до: 6
  Timeout(7): триггер: 6 выполнение: 6
после:   6
уничтожить: 6
до: 7
>>> 7
  TickObject(8): триггер: 7 выполнение: 7
после:   7
до: 8
после:   8
```

Как показано в примере, `executionAsyncId()` и `execution` указывают значение текущего контекста выполнения, который определяется вызовами `before` и `after`.

Только использование `execution` для построения графика распределения ресурсов приводит к следующему:

```console
  root(1)
     ^
     |
TickObject(6)
     ^
     |
 Timeout(7)
```

Привязка `TCPSERVERWRAP` не является частью этого графика, хотя она была причиной вызова `console.log()`. Это происходит потому, что привязка к порту без имени хоста является _синхронной_ операцией, но для поддержания полностью асинхронного API обратный вызов пользователя помещается в `process.nextTick()`. Именно поэтому `TickObject` присутствует в выводе и является "родителем" для обратного вызова `.listen()`.

График показывает только _когда_ был создан ресурс, но не _почему_, поэтому для отслеживания _почему_ используйте `triggerAsyncId`. Что может быть представлено следующим графиком:

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

#### `before(asyncId)`

- `asyncId` {number}

Когда асинхронная операция инициируется (например, TCP-сервер получает новое соединение) или завершается (например, запись данных на диск), вызывается обратный вызов для уведомления пользователя. Обратный вызов `before` вызывается непосредственно перед выполнением указанного обратного вызова. `asyncId` - это уникальный идентификатор, присвоенный ресурсу, который собирается выполнить обратный вызов.

Обратный вызов `before` будет вызван от 0 до N раз. Обратный вызов `before` обычно вызывается 0 раз, если асинхронная операция была отменена или, например, если TCP-сервер не получает соединений. Постоянные асинхронные ресурсы, такие как TCP-сервер, обычно вызывают обратный вызов `before` несколько раз, в то время как другие операции, такие как `fs.open()`, вызывают его только один раз.

#### `after(asyncId)`

- `asyncId` {number}

Вызывается сразу после завершения обратного вызова, указанного в `before`.

Если во время выполнения обратного вызова произойдет не пойманное исключение, то `after` будет запущен _после_ того, как будет выдано событие `'uncaughtException'` или запущен обработчик `домена`.

#### `destroy(asyncId)`

- `asyncId` {number}

Вызывается после уничтожения ресурса, соответствующего `asyncId`. Также вызывается асинхронно из API embedder `emitDestroy()`.

Некоторые ресурсы зависят от сборки мусора для очистки, поэтому если ссылка на объект `resource`, переданный в `init`, сделана, то возможно, что `destroy` никогда не будет вызван, что приведет к утечке памяти в приложении. Если ресурс не зависит от сборки мусора, то это не будет проблемой.

Использование хука destroy приводит к дополнительным накладным расходам, поскольку он позволяет отслеживать экземпляры `Promise` с помощью сборщика мусора.

#### `promiseResolve(asyncId)`

- `asyncId` {number}

Вызывается, когда вызывается функция `resolve`, переданная в конструктор `Promise` (напрямую или с помощью других средств разрешения обещания).

`resolve()` не выполняет никакой наблюдаемой синхронной работы.

Обещание не обязательно будет выполнено или отвергнуто в этот момент, если `обещание` было разрешено путем принятия состояния другого `обещания`.

```js
new Promise((resolve) => resolve(true)).then((a) => {});
```

вызывает следующие обратные вызовы:

```text
init for PROMISE with id 5, trigger id: 1
  promise resolve 5      # corresponds to resolve(true)
init for PROMISE with id 6, trigger id: 5  # the Promise returned by then()
  before 6               # the then() callback is entered
  promise resolve 6      # the then() callback resolves the promise by returning
  after 6
```

### `async_hooks.executionAsyncResource()`

- Возвращает: {Object} Ресурс, представляющий текущее выполнение. Полезно для хранения данных внутри ресурса.

Объекты ресурсов, возвращаемые `executionAsyncResource()`, чаще всего являются внутренними объектами-ручками Node.js с недокументированными API. Использование любых функций или свойств этого объекта, скорее всего, приведет к краху вашего приложения, и его следует избегать.

Использование `executionAsyncResource()` в контексте выполнения верхнего уровня вернет пустой объект, поскольку нет объекта handle или request для использования, но наличие объекта, представляющего верхний уровень, может быть полезным.

```mjs
import { open } from 'node:fs';
import {
  executionAsyncId,
  executionAsyncResource,
} from 'node:async_hooks';

console.log(executionAsyncId(), executionAsyncResource()); // 1 {}
open(new URL(import.meta.url), 'r', (err, fd) => {
  console.log(executionAsyncId(), executionAsyncResource()); // 7 FSReqWrap
});
```

```cjs
const { open } = require('node:fs');
const {
  executionAsyncId,
  executionAsyncResource,
} = require('node:async_hooks');

console.log(executionAsyncId(), executionAsyncResource()); // 1 {}
open(__filename, 'r', (err, fd) => {
  console.log(executionAsyncId(), executionAsyncResource()); // 7 FSReqWrap
});
```

Это можно использовать для реализации локального хранилища продолжения без использования отслеживающего `Map` для хранения метаданных:

```mjs
import { createServer } from 'node:http';
import {
  executionAsyncId,
  executionAsyncResource,
  createHook,
} from 'async_hooks';
const sym = Symbol('state'); // Частный символ, чтобы избежать загрязнения

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
  setTimeout(function () {
    res.end(JSON.stringify(executionAsyncResource()[sym]));
  }, 100);
}).listen(3000);
```

```cjs
const { createServer } = require('node:http');
const {
  executionAsyncId,
  executionAsyncResource,
  createHook,
} = require('node:async_hooks');
const sym = Symbol('state'); // Частный символ, чтобы избежать загрязнения

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
  setTimeout(function () {
    res.end(JSON.stringify(executionAsyncResource()[sym]));
  }, 100);
}).listen(3000);
```

### `async_hooks.executionAsyncId()`

- Возвращает: {число} `asyncId` текущего контекста выполнения. Полезно для отслеживания того, когда что-то вызывается.

```mjs
import { executionAsyncId } from 'node:async_hooks';
import fs from 'node:fs';

console.log(executionAsyncId()); // 1 - bootstrap
fs.open(path, 'r', (err, fd) => {
  console.log(executionAsyncId()); // 6 - open()
});
```

```cjs
const async_hooks = require('node:async_hooks');
const fs = require('node:fs');

console.log(async_hooks.executionAsyncId()); // 1 - bootstrap
fs.open(path, 'r', (err, fd) => {
  console.log(async_hooks.executionAsyncId()); // 6 - open()
});
```

ID, возвращаемый из `executionAsyncId()`, связан с временем выполнения, а не с причинно-следственной связью (которая покрывается `triggerAsyncId()`):

```js
const server = net
  .createServer((conn) => {
    // Возвращает идентификатор сервера, а не нового соединения, потому что
    // обратный вызов выполняется в области выполнения MakeCallback() сервера.
    async_hooks.executionAsyncId();
  })
  .listen(port, () => {
    // Возвращает идентификатор объекта TickObject (process.nextTick()), поскольку все
    // обратные вызовы, переданные в .listen(), обернуты в nextTick().
    async_hooks.executionAsyncId();
  });
```

Контексты обещаний могут не получать точные `executionAsyncIds` по умолчанию. См. раздел [отслеживание выполнения обещаний] (#promise-execution-tracking).

### `async_hooks.triggerAsyncId()`

- Возвращает: {number} Идентификатор ресурса, ответственного за вызов обратного вызова, который выполняется в данный момент.

<!-- конец списка -->

```js
const server = net
  .createServer((conn) => {
    // Ресурс, который вызвал (или спровоцировал) этот обратный вызов.
    // был ресурс нового соединения. Таким образом, возвращаемое значение triggerAsyncId()
    // является asyncId "conn".
    async_hooks.triggerAsyncId();
  })
  .listen(port, () => {
    // Несмотря на то, что все обратные вызовы, переданные в .listen(), обернуты в nextTick()
    // сам обратный вызов существует, потому что вызов серверного .listen()
    // был сделан. Поэтому возвращаемым значением будет ID сервера.
    async_hooks.triggerAsyncId();
  });
```

Контексты обещаний могут не получать действительные `triggerAsyncId` по умолчанию. См. раздел об отслеживании выполнения обещаний (#promise-execution-tracking).

### `async_hooks.asyncWrapProviders`.

- Возвращает: Карта типов провайдеров с соответствующим числовым идентификатором. Эта карта содержит все типы событий, которые могут быть испущены событием `async_hooks.init()`.

Эта функция подавляет устаревшее использование `process.binding('async_wrap').Providers`.

## Отслеживание выполнения обещания

По умолчанию выполнениям обещаний не присваиваются `asyncId` из-за относительно дорогого характера [promise introspection API](https://docs.google.com/document/d/1rda3yKGHimKIhg5YeoAmCOtyURgsbTH_qaYR79FELlk/edit), предоставляемого V8. Это означает, что программы, использующие обещания или `async`/`await`, по умолчанию не будут получать корректные идентификаторы выполнения и триггера для контекстов обратного вызова обещаний.

```mjs
import {
  executionAsyncId,
  triggerAsyncId,
} from 'node:async_hooks';

Promise.resolve(1729).then(() => {
  console.log(
    `eid ${executionAsyncId()} tid ${triggerAsyncId()}`
  );
});
// производит:
// eid 1 tid 0
```

```cjs
const {
  executionAsyncId,
  triggerAsyncId,
} = require('node:async_hooks');

Promise.resolve(1729).then(() => {
  console.log(
    `eid ${executionAsyncId()} tid ${triggerAsyncId()}`
  );
});
// производит:
// eid 1 tid 0
```

Обратите внимание, что обратный вызов `then()` утверждает, что он был выполнен в контексте внешней области видимости, даже несмотря на асинхронный переход. Также, значение `triggerAsyncId` равно `0`, что означает, что нам не хватает контекста о ресурсе, который вызвал (спровоцировал) выполнение обратного вызова `then()`.

Установка асинхронных хуков с помощью `async_hooks.createHook` позволяет отслеживать выполнение обещания:

```mjs
import {
  createHook,
  executionAsyncId,
  triggerAsyncId,
} from 'node:async_hooks';
createHook({ init() {} }).enable(); // заставляет PromiseHooks быть включенными.
Promise.resolve(1729).then(() => {
  console.log(
    `eid ${executionAsyncId()} tid ${triggerAsyncId()}`
  );
});
// производит:
// eid 7 tid 6
```

```cjs
const {
  createHook,
  executionAsyncId,
  triggerAsyncId,
} = require('node:async_hooks');

createHook({ init() {} }).enable(); // заставляет PromiseHooks быть включенными.
Promise.resolve(1729).then(() => {
  console.log(
    `eid ${executionAsyncId()} tid ${triggerAsyncId()}`
  );
});
// производит:
// eid 7 tid 6
```

В этом примере добавление любой фактической хук-функции позволило отслеживать обещания. В приведенном примере есть два обещания: обещание, созданное `Promise.resolve()`, и обещание, возвращенное вызовом `then()`. В приведенном примере первое обещание получило `asyncId` `6`, а второе - `asyncId` `7`. Во время выполнения обратного вызова `then()` мы выполняем в контексте обещания с `asyncId` `7`. Это обещание было вызвано ресурсом async `6`.

Еще одна тонкость работы с обещаниями заключается в том, что обратные вызовы `before` и `after` выполняются только для цепочек обещаний. Это означает, что обещания, не созданные с помощью `then()`/`catch()`, не будут иметь обратных вызовов `before` и `after`. Более подробную информацию можно найти в деталях API V8 [PromiseHooks](https://docs.google.com/document/d/1rda3yKGHimKIhg5YeoAmCOtyURgsbTH_qaYR79FELlk/edit).

## JavaScript embedder API

Разработчики библиотек, которые работают с собственными асинхронными ресурсами, выполняющими такие задачи, как ввод-вывод, пул соединений или управление очередями обратных вызовов, могут использовать JavaScript API `AsyncResource`, чтобы вызывались все соответствующие обратные вызовы.

### Класс: `AsyncResource`

Документация по этому классу переехала [`AsyncResource`](async_context.md#class-asyncresource).

## Класс: `AsyncLocalStorage`

Документация по этому классу переехала [`AsyncLocalStorage`](async_context.md#class-asynclocalstorage).
