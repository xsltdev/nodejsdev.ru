---
description: Кластеры процессов Node.js можно использовать для запуска нескольких экземпляров Node.js, которые могут распределять рабочую нагрузку между своими потоками приложений
---

# Кластер

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/cluster.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Кластеры процессов Node.js можно использовать для запуска нескольких экземпляров Node.js, которые могут распределять рабочую нагрузку между своими потоками приложений. Если изоляция процессов не требуется, используйте вместо этого модуль [`worker_threads`](worker_threads.md), который позволяет запускать несколько потоков приложений в рамках одного экземпляра Node.js.

Модуль кластера позволяет легко создавать дочерние процессы, которые совместно используют серверные порты.

```mjs
import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Форк рабочих.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`рабочий ${worker.process.pid} умер`);
  });
} else {
  // Рабочие могут совместно использовать любое TCP-соединение.
  // В данном случае это HTTP-сервер
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    })
    .listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

```cjs
const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Форк рабочих.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`рабочий ${worker.process.pid} умер`);
  });
} else {
  // Рабочие могут совместно использовать любое TCP-соединение.
  // В данном случае это HTTP-сервер
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    })
    .listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

Запущенный Node.js теперь будет делить порт 8000 между рабочими:

```console
$ node server.js
Primary 3596 is running
Worker 4324 started
Worker 4520 started
Worker 6056 started
Worker 5644 started
```

В Windows пока невозможно настроить сервер именованных труб в рабочем.

<!-- 0000.part.md -->

## Как это работает

Рабочие процессы порождаются с помощью метода [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options), чтобы они могли общаться с родителем по IPC и передавать хэндлы сервера туда и обратно.

Кластерный модуль поддерживает два метода распределения входящих соединений.

Первый (и тот, который используется по умолчанию на всех платформах, кроме Windows) - это метод round-robin, когда основной процесс прослушивает порт, принимает новые соединения и распределяет их между рабочими процессами по кругу, с некоторыми встроенными умными функциями, чтобы избежать перегрузки рабочего процесса.

Второй подход заключается в том, что основной процесс создает сокет для прослушивания и отправляет его заинтересованным рабочим. Затем рабочие принимают входящие соединения напрямую.

Теоретически, второй подход должен обеспечивать наилучшую производительность. На практике, однако, распределение имеет тенденцию быть очень несбалансированным из-за капризов планировщика операционной системы. Наблюдались нагрузки, когда более 70% всех соединений оказывались только в двух процессах из восьми.

Поскольку `server.listen()` передает большую часть работы основному процессу, есть три случая, когда поведение обычного процесса Node.js и рабочего кластера различается:

1.  `server.listen({fd: 7})` Поскольку сообщение передается первичному процессу, дескриптор файла 7 **в родительском** будет прослушан, а хэндл передан рабочему, вместо того, чтобы прослушать представление рабочего о том, на что ссылается дескриптор файла с номером 7.
2.  Если `server.listen(handle)` явно прослушивать хэндлы, то рабочий будет использовать предоставленный хэндл, а не обращаться к первичному процессу.
3.  `server.listen(0)` Обычно это заставляет серверы прослушивать случайный порт. Однако в кластере каждый рабочий будет получать один и тот же "случайный" порт каждый раз, когда он выполняет команду `listen(0)`. По сути, порт является случайным в первый раз, но предсказуемым в последующие. Чтобы прослушивать уникальный порт, сгенерируйте номер порта на основе ID рабочего кластера.

Node.js не предоставляет логику маршрутизации. Поэтому важно разработать приложение таким образом, чтобы оно не слишком полагалось на объекты данных в памяти для таких вещей, как сессии и вход в систему.

Поскольку рабочие являются отдельными процессами, они могут быть убиты или перерождены в зависимости от потребностей программы, не затрагивая других рабочих. Пока живы рабочие, сервер будет продолжать принимать соединения. Если ни один рабочий не жив, существующие соединения будут сброшены, а новые соединения будут отклонены. Однако Node.js не управляет количеством рабочих автоматически. Приложение обязано управлять пулом рабочих в соответствии со своими потребностями.

Хотя основным вариантом использования модуля `node:cluster` является работа в сети, его можно использовать и для других случаев, требующих рабочих процессов.

<!-- 0001.part.md -->

## Класс: `Worker`

- Расширяет: {EventEmitter}

Объект `Worker` содержит всю публичную информацию и метод о работнике. В первичной системе он может быть получен с помощью `cluster.workers`. В рабочем он может быть получен с помощью `cluster.worker`.

<!-- 0002.part.md -->

### Событие: `'disconnect'`

Аналогично событию `cluster.on('disconnect')`, но специфично для этого рабочего.

```js
cluster.fork().on('disconnect', () => {
  // Рабочий отключился
});
```

<!-- 0003.part.md -->

### Событие: `error`.

Это событие аналогично событию, предоставляемому [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options).

Внутри рабочего процесса также может использоваться `process.on('error')`.

<!-- 0004.part.md -->

### Событие: `exit`

- `code` {number} Код выхода, если выход произошел нормально.
- `signal` {string} Имя сигнала (например, `'SIGHUP'`), который вызвал завершение процесса.

Аналогично событию `cluster.on('exit')`, но специфично для данного рабочего.

```mjs
import cluster from 'node:cluster';

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('exit', (code, signal) => {
    if (signal) {
      console.log(`worker was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(
        `рабочий завершился с кодом ошибки: ${code}`
      );
    } else {
      console.log('worker success!');
    }
  });
}
```

```cjs
const cluster = require('node:cluster');

if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.on('exit', (code, signal) => {
    if (signal) {
      console.log(`worker was killed by signal: ${signal}`);
    } else if (code !== 0) {
      console.log(
        `рабочий завершился с кодом ошибки: ${code}`
      );
    } else {
      console.log('worker success!');
    }
  });
}
```

<!-- 0005.part.md -->

### Событие: `listening`

- `адрес` {Объект}

Аналогично событию `cluster.on('listening')`, но специфично для этого рабочего.

```mjs
cluster.fork().on('listening', (address) => {
  // Worker is listening
});
```

```cjs
cluster.fork().on('listening', (address) => {
  // Worker is listening
});
```

Это не эмитируется в воркере.

<!-- 0006.part.md -->

### Событие: `message`

- `message` {Object}
- `handle` {undefined|Object}

Аналогично событию `'message'` из `cluster`, но специфично для этого рабочего.

Внутри рабочего может также использоваться `process.on('message')`.

См. [событие `process`: `'message'`](process.md#event-message).

Вот пример использования системы сообщений. Он ведет подсчет в основном процессе количества HTTP-запросов, полученных рабочими:

```mjs
import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';

if (cluster.isPrimary) {
  // Отслеживаем http-запросы
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Подсчет запросов
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Запускаем рабочих и слушаем сообщения, содержащие notifyRequest
  const numCPUs = availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }
} else {
  // У рабочих процессов есть http-сервер.
  http
    .Server((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');

      // Уведомляем первичный процесс о запросе
      process.send({ cmd: 'notifyRequest' });
    })
    .listen(8000);
}
```

```cjs
const cluster = require('node:cluster');
const http = require('node:http');
const process = require('node:process');

if (cluster.isPrimary) {
  // Отслеживаем http-запросы
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Подсчет запросов
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Запускаем рабочих и слушаем сообщения, содержащие notifyRequest
  const numCPUs = require('node:os').availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }
} else {
  // У рабочих процессов есть http-сервер.
  http
    .Server((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');

      // Уведомляем первичный процесс о запросе
      process.send({ cmd: 'notifyRequest' });
    })
    .listen(8000);
}
```

<!-- 0007.part.md -->

### Событие: `'online'`

Аналогично событию `cluster.on('online')`, но специфично для этого рабочего.

```js
cluster.fork().on('online', () => {
  // Рабочий находится в сети
});
```

Это не выдается в воркере.

<!-- 0008.part.md -->

### `worker.disconnect()`

- Возвращает: {cluster.Worker} Ссылка на `worker`.

В рабочем эта функция закроет все серверы, дождется события `'close'` на этих серверах, а затем отключит IPC-канал.

В первичном, внутреннее сообщение посылается рабочему, заставляя его вызвать `.disconnect()` на себя.

Это вызывает установку `.exitedAfterDisconnect`.

После закрытия сервера он больше не будет принимать новые соединения, но соединения могут быть приняты любым другим прослушивающим рабочим. Существующие соединения будут закрываться обычным образом. Когда соединений больше не будет, см. [`server.close()`](net.md#event-close), IPC-канал к рабочему будет закрыт, что позволит ему умереть изящно.

Вышесказанное относится _только_ к серверным соединениям, клиентские соединения не закрываются автоматически рабочими, и disconnect не ждет их закрытия перед выходом.

В рабочем, `process.disconnect` существует, но это не эта функция; это [`disconnect()`](child_process.md#subprocessdisconnect).

Поскольку долгоживущие соединения с сервером могут блокировать отключение рабочих, может быть полезно посылать сообщение, чтобы можно было предпринять конкретные действия для их закрытия. Также может быть полезно реализовать таймаут, убивающий рабочего, если событие `'disconnect'` не было выдано через некоторое время.

```js
if (cluster.isPrimary) {
  const worker = cluster.fork();
  let timeout;

  worker.on('listening', (address) => {
    worker.send('shutdown');
    worker.disconnect();
    timeout = setTimeout(() => {
      worker.kill();
    }, 2000);
  });

  worker.on('disconnect', () => {
    clearTimeout(timeout);
  });
} else if (cluster.isWorker) {
  const net = require('node:net');
  const server = net.createServer((socket) => {
    // Connections never end
  });

  server.listen(8000);

  process.on('message', (msg) => {
    if (msg === 'shutdown') {
      // Initiate graceful close of any connections to server
    }
  });
}
```

<!-- 0009.part.md -->

### `worker.exitedAfterDisconnect`

- {boolean}

Это свойство равно `true`, если рабочий вышел из системы в результате `.disconnect()`. Если рабочий вышел другим способом, оно равно `false`. Если рабочий не вышел, то `не определено`.

Булево значение [`worker.exitedAfterDisconnect`](#workerexitedafterdisconnect) позволяет отличить добровольный выход от случайного, на основании этого значения первичная система может решить не перезапускать рабочего.

```js
cluster.on('exit', (worker, code, signal) => {
  if (worker.exitedAfterDisconnect === true) {
    console.log(
      'О, это было просто добровольно - не стоит беспокоиться'
    );
  }
});

// убить работника
worker.kill();
```

<!-- 0010.part.md -->

### `worker.id`

- {целое число}

Каждому новому работнику присваивается свой уникальный id, этот id хранится в `id`.

Пока рабочий жив, это ключ, по которому он индексируется в `cluster.workers`.

<!-- 0011.part.md -->

### `worker.isConnected()`

Эта функция возвращает `true`, если рабочий подключен к своему первичному серверу через его IPC-канал, `false` в противном случае. Рабочий подключается к своему первичному серверу после его создания. Он отключается после возникновения события `'disconnect'`.

<!-- 0012.part.md -->

### `worker.isDead()`

Эта функция возвращает `true`, если процесс рабочего завершился (либо из-за выхода, либо из-за получения сигнала). В противном случае она возвращает `false`.

```mjs
import cluster from 'node:cluster';
import http from 'node:http';
import { availableParallelism } from 'node:os';
import process from 'node:process';

const numCPUs = availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Форк рабочих.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('fork', (worker) => {
    console.log('worker is dead:', worker.isDead());
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log('worker is dead:', worker.isDead());
  });
} else {
  // Рабочие могут использовать любое TCP-соединение. В данном случае это HTTP-сервер.
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`Текущий процесс\n ${process.pid}`);
      process.kill(process.pid);
    })
    .listen(8000);
}
```

```cjs
const cluster = require('node:cluster');
const http = require('node:http');
const numCPUs = require('node:os').availableParallelism();
const process = require('node:process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Форк рабочих.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('fork', (worker) => {
    console.log('worker is dead:', worker.isDead());
  });

  cluster.on('exit', (worker, code, signal) => {
    console.log('worker is dead:', worker.isDead());
  });
} else {
  // Рабочие могут использовать любое TCP-соединение. В данном случае это HTTP-сервер.
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`Текущий процесс\n ${process.pid}`);
      process.kill(process.pid);
    })
    .listen(8000);
}
```

<!-- 0013.part.md -->

### `worker.kill([signal])`

- `signal` {string} Имя сигнала kill, который нужно послать рабочему процессу. **По умолчанию:** `SIGTERM`.

Эта функция убивает рабочий процесс. В основном рабочем она делает это путем отключения `worker.process`, а после отключения убивает с помощью `signal`. В рабочем это происходит путем уничтожения процесса с помощью `signal`.

Функция `kill()` убивает рабочий процесс, не дожидаясь изящного разъединения, она имеет такое же поведение, как и `worker.process.kill()`.

Для обратной совместимости этот метод называется `worker.destroy()`.

В рабочем процессе существует `process.kill()`, но это не эта функция, а [`kill()`](process.md#processkillpid-signal).

<!-- 0014.part.md -->

### `worker.process`

- {ChildProcess}

Все рабочие создаются с помощью [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options), возвращаемый объект из этой функции хранится как `.process`. В рабочем хранится глобальный `process`.

См: [Модуль Child Process](child_process.md#child_processforkmodulepath-args-options).

Рабочие процессы будут вызывать `process.exit(0)`, если событие `'disconnect'` произойдет на `process` и `.exitedAfterDisconnect` не будет `true`. Это защищает от случайного отключения.

<!-- 0015.part.md -->

### `worker.send(message[, sendHandle[, options]][, callback])`

- `message` {Object}
- `sendHandle` {Handle}
- `options` {Object} Аргумент `options`, если он присутствует, представляет собой объект, используемый для параметризации отправки определенных типов дескрипторов. `options` поддерживает следующие свойства:
  - `keepOpen` {boolean} Значение, которое может использоваться при передаче экземпляров `net.Socket`. Когда `true`, сокет остается открытым в процессе отправки. **По умолчанию:** `false`.
- `callback` {Функция}
- Возвращает: {boolean}

Отправка сообщения на рабочий или первичный сервер, опционально с хэндлом.

В первичном случае это отправляет сообщение конкретному рабочему. Она идентична [`ChildProcess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback).

В рабочем процессе это отправляет сообщение на основной. Это идентично `process.send()`.

В этом примере все сообщения от первичного сервера будут возвращены эхом:

```js
if (cluster.isPrimary) {
  const worker = cluster.fork();
  worker.send('hi there');
} else if (cluster.isWorker) {
  process.on('message', (msg) => {
    process.send(msg);
  });
}
```

<!-- 0016.part.md -->

## Событие: `разъединение`

- `worker` {cluster.Worker}

Выдается после отключения IPC-канала рабочего. Это может произойти, когда рабочий изящно завершает работу, его убивают или отключают вручную (например, с помощью `worker.disconnect()`).

Между событиями `'disconnect'` и `'exit'` может быть задержка. Эти события могут быть использованы для обнаружения того, что процесс застрял в очистке или что есть долгоживущие соединения.

```js
cluster.on('disconnect', (worker) => {
  console.log(`Рабочий #${worker.id} отключился`);
});
```

<!-- 0017.part.md -->

## Событие: `выход`

- `worker` {cluster.Worker}
- `code` {number} Код выхода, если он вышел нормально.
- `signal` {string} Имя сигнала (например, `'SIGHUP'`), который вызвал завершение процесса.

Когда любой из рабочих умирает, кластерный модуль выдает событие `'exit'`.

Это событие можно использовать для перезапуска рабочего путем повторного вызова [`.fork()`](#clusterforkenv).

```js
cluster.on('exit', (worker, code, signal) => {
  console.log(
    'worker %d died (%s). restarting...',
    worker.process.pid,
    signal || code
  );
  cluster.fork();
});
```

См. [событие `child_process`: `'exit'`](child_process.md#event-exit).

<!-- 0018.part.md -->

## Событие: `fork`

- `worker` {cluster.Worker}

При форке нового рабочего модуль кластера будет выдавать событие `'fork'`. Это событие можно использовать для регистрации активности рабочего и создания пользовательского таймаута.

```js
const timeouts = [];
function errorMsg() {
  console.error('Что-то не так с соединением...');
}

cluster.on('fork', (worker) => {
  timeouts[worker.id] = setTimeout(errorMsg, 2000);
});
cluster.on('listening', (worker, address) => {
  clearTimeout(timeouts[worker.id]);
});
cluster.on('exit', (worker, code, signal) => {
  clearTimeout(timeouts[worker.id]);
  errorMsg();
});
```

<!-- 0019.part.md -->

## Событие: `listening`

- `worker` {cluster.Worker}
- `адрес` {Объект}

После вызова функции `listen()` от рабочего, когда событие `'listening'` испускается на сервере, событие `'listening'` также будет испущено на `cluster` в первичном.

Обработчик события выполняется с двумя аргументами, `worker` содержит объект worker, а объект `address` содержит следующие свойства соединения: `address`, `port` и `addressType`. Это очень полезно, если рабочий прослушивает более одного адреса.

```js
cluster.on('listening', (worker, address) => {
  console.log(
    `Рабочий теперь подключен к ${адрес.адрес}:${адрес.порт}`
  );
});
```

Тип `addressType` является одним из:

- `4` (TCPv4)
- `6` (TCPv6)
- `-1` (Unix domain socket)
- ` 'udp4`` или  `'udp6`` (UDPv4 или UDPv6)

<!-- 0020.part.md -->

## Событие: `message`

- `worker` {cluster.Worker}
- `сообщение` {Object}
- `handle` {undefined|Object}

Выдается, когда основной кластер получает сообщение от любого рабочего.

См. [`child_process` event: `'message'`](child_process.md#event-message).

<!-- 0021.part.md -->

## Событие: `online`

- `worker` {cluster.Worker}

После форкинга нового рабочего, рабочий должен ответить сообщением online. Когда основной получает сообщение online, он испускает это событие. Разница между `'fork'` и `'online'` заключается в том, что fork испускается, когда первичный вилкует рабочего, а `'online'` испускается, когда рабочий запущен.

```js
cluster.on('online', (worker) => {
  console.log(
    'Ура, рабочий ответил после того, как его форкнули'
  );
});
```

<!-- 0022.part.md -->

## Событие: `setup`

- `settings` {Object}

Выдается каждый раз при вызове [`.setupPrimary()`](#clustersetupprimarysettings).

Объект `settings` представляет собой объект `cluster.settings` на момент вызова [`.setupPrimary()`](#clustersetupprimarysettings) и является только рекомендательным, так как за один такт может быть сделано несколько вызовов [`.setupPrimary()`](#clustersetupprimarysettings).

Если важна точность, используйте `cluster.settings`.

<!-- 0023.part.md -->

## `cluster.disconnect([callback])`

- `callback` {Функция} Вызывается, когда все рабочие отсоединены и ручки закрыты.

Вызывает `.disconnect()` для каждого рабочего в `cluster.workers`.

Когда они будут отключены, все внутренние ручки будут закрыты, что позволит основному процессу изящно завершиться, если не ожидается никакого другого события.

Метод принимает необязательный аргумент обратного вызова, который будет вызван после завершения.

Этот метод может быть вызван только из основного процесса.

<!-- 0024.part.md -->

## `cluster.fork([env])`

- `env` {Объект} Пары ключ/значение для добавления в окружение рабочего процесса.
- Возвращает: {cluster.Worker}

Порождает новый рабочий процесс.

Это может быть вызвано только из основного процесса.

<!-- 0025.part.md -->

## `cluster.isMaster`

Утративший силу псевдоним для [`cluster.isPrimary`](#clusterisprimary).

<!-- 0026.part.md -->

## `cluster.isPrimary`

- {булево}

Истина, если процесс является первичным. Это определяется `process.env.NODE_UNIQUE_ID`. Если `process.env.NODE_UNIQUE_ID` не определен, то `isPrimary` будет `true`.

<!-- 0027.part.md -->

## `cluster.isWorker`

- {boolean}

Истина, если процесс не является основным (это отрицание `cluster.isPrimary`).

<!-- 0028.part.md -->

## `cluster.schedulingPolicy`

Политика планирования, либо `cluster.SCHED_RR` для round-robin, либо `cluster.SCHED_NONE`, чтобы оставить это на усмотрение операционной системы. Это глобальная настройка и фактически замораживается после порождения первого рабочего или вызова [`.setupPrimary()`](#clustersetupprimarysettings), в зависимости от того, что произойдет раньше.

По умолчанию используется `SCHED_RR` во всех операционных системах, кроме Windows. Windows перейдет на `SCHED_RR`, когда libuv сможет эффективно распределять ручки IOCP без большого падения производительности.

`cluster.schedulingPolicy` также может быть задана через переменную окружения `NODE_CLUSTER_SCHED_POLICY`. Допустимыми значениями являются `'rr'` и `'none'`.

<!-- 0029.part.md -->

## `cluster.settings`

- {Object}
  - `execArgv` {string\[\]} Список строковых аргументов, передаваемых исполняемому файлу Node.js. **По умолчанию:** `process.execArgv`.
  - `exec` {string} Путь к рабочему файлу. **По умолчанию:** `process.argv[1]`.
  - `args` {string\[\]} Строковые аргументы, передаваемые рабочему. **По умолчанию:** `process.argv.slice(2)`.
  - `cwd` {string} Текущий рабочий каталог рабочего процесса. **По умолчанию:** `undefined` (наследуется от родительского процесса).
  - `serialization` {string} Укажите вид сериализации, используемой для отправки сообщений между процессами. Возможные значения: `'json'' и `'advanced''. Подробнее см. в [Advanced serialization for `child_process`](child_process.md#advanced-serialization). **По умолчанию:** `false`.
  - `silent` {boolean} Посылать ли вывод на родительский stdio. **По умолчанию:** `false`.
  - `stdio` {Array} Настраивает stdio вилочных процессов. Поскольку для работы кластерного модуля используется IPC, эта конфигурация должна содержать запись `'ipc'`. Когда эта опция указана, она отменяет `silent`.
  - `uid` {число} Устанавливает идентификатор пользователя процесса. (См. setuid(2).)
  - `gid` {число} Устанавливает групповую идентификацию процесса. (См. setgid(2).)
  - `inspectPort` {number|Function} Задает инспекторский порт рабочего. Это может быть число или функция, которая не принимает аргументов и возвращает число. По умолчанию каждый рабочий получает свой собственный порт, увеличивающийся от `process.debugPort` первичного.
  - `windowsHide` {boolean} Скрыть консольное окно вилочных процессов, которое обычно создается в системах Windows. **По умолчанию:** `false`.

После вызова [`.setupPrimary()`](#clustersetupprimarysettings) (или [`.fork()`](#clusterforkenv)) этот объект настроек будет содержать настройки, включая значения по умолчанию.

Этот объект не предназначен для изменения или настройки вручную.

<!-- 0030.part.md -->

## `cluster.setupMaster([settings])`

Утративший силу псевдоним для [`.setupPrimary()`](#clustersetupprimarysettings).

<!-- 0031.part.md -->

## `cluster.setupPrimary([settings])`

- `settings` {Object} См. [`cluster.settings`](#clustersettings).

`setupPrimary` используется для изменения поведения "вилки" по умолчанию. После вызова настройки будут присутствовать в `cluster.settings`.

Любые изменения настроек влияют только на будущие вызовы [`.fork()`](#clusterforkenv) и не влияют на уже запущенные рабочие.

Единственный атрибут рабочего, который не может быть установлен через `.setupPrimary()` - это `env`, переданный в [`.fork()`](#clusterforkenv).

Приведенные выше значения по умолчанию относятся только к первому вызову; значения по умолчанию для последующих вызовов - это текущие значения на момент вызова `cluster.setupPrimary()`.

```mjs
import cluster from 'node:cluster';

cluster.setupPrimary({
  exec: 'worker.js',
  args: ['--use', 'https'],
  silent: true,
});
cluster.fork(); // https worker
cluster.setupPrimary({
  exec: 'worker.js',
  args: ['--use', 'http'],
});
cluster.fork(); // http worker
```

```cjs
const cluster = require('node:cluster');

cluster.setupPrimary({
  exec: 'worker.js',
  args: ['--use', 'https'],
  silent: true,
});
cluster.fork(); // https worker
cluster.setupPrimary({
  exec: 'worker.js',
  args: ['--use', 'http'],
});
cluster.fork(); // http worker
```

Это может быть вызвано только из основного процесса.

<!-- 0032.part.md -->

## `cluster.worker`

- {Object}

Ссылка на текущий объект worker. Недоступно в основном процессе.

```mjs
import cluster from 'node:cluster';

if (cluster.isPrimary) {
  console.log('Я первичный');
  cluster.fork();
  cluster.fork();
} else if (cluster.isWorker) {
  console.log(`Я рабочий #${cluster.worker.id}`);
}
```

```cjs
const cluster = require('node:cluster');

if (cluster.isPrimary) {
  console.log('Я первичный');
  cluster.fork();
  cluster.fork();
} else if (cluster.isWorker) {
  console.log(`Я рабочий #${cluster.worker.id}`);
}
```

<!-- 0033.part.md -->

## `cluster.workers`

- {Object}

Хэш, хранящий активные объекты рабочих, с ключом по полю `id`. Это позволяет легко перебирать всех рабочих. Он доступен только в основном процессе.

Рабочий удаляется из `cluster.workers` после того, как он отключился _и_ вышел. Порядок между этими двумя событиями не может быть определен заранее. Однако гарантируется, что удаление из списка `cluster.workers` произойдет до того, как произойдет последнее событие `'disconnect'` или `'exit'`.

```mjs
import cluster from 'node:cluster';

for (const worker of Object.values(cluster.workers)) {
  worker.send('большое объявление всем работникам');
}
```

```cjs
const cluster = require('node:cluster');

for (const worker of Object.values(cluster.workers)) {
  worker.send('большое объявление всем работникам');
}
```

<!-- 0034.part.md -->
