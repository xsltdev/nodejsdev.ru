# Модуль cluster

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/cluster.js -->

Один экземпляр Node.js работает в одном потоке. Чтобы воспользоваться преимуществами многоядерных систем, пользователь иногда может захотеть запустить кластер процессов Node.js для обработки нагрузки.

Модуль кластера позволяет легко создавать дочерние процессы, которые все используют порты сервера.

```mjs
import cluster from 'cluster';
import http from 'http';
import { cpus } from 'os';
import process from 'process';

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
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
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const process = require('process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');
    })
    .listen(8000);

  console.log(`Worker ${process.pid} started`);
}
```

Запущенный Node.js теперь будет разделять порт 8000 между рабочими:

```console
$ node server.js
Primary 3596 is running
Worker 4324 started
Worker 4520 started
Worker 6056 started
Worker 5644 started
```

В Windows пока невозможно настроить сервер именованного канала в рабочем файле.

## Как это работает

<!--type=misc-->

Рабочие процессы создаются с помощью [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options) , чтобы они могли общаться с родителем через IPC и передавать серверные дескрипторы туда и обратно.

Модуль кластера поддерживает два метода распределения входящих подключений.

Первый (и используемый по умолчанию на всех платформах, кроме Windows) - это циклический подход, при котором основной процесс прослушивает порт, принимает новые соединения и распределяет их между рабочими процессами в циклическом режиме, с некоторыми встроенными -in smarts, чтобы не перегружать рабочий процесс.

Второй подход заключается в том, что основной процесс создает прослушивающий сокет и отправляет его заинтересованным исполнителям. Затем рабочие принимают входящие соединения напрямую.

Второй подход теоретически должен давать наилучшие результаты. Однако на практике распределение имеет тенденцию быть очень несбалансированным из-за капризов планировщика операционной системы. Наблюдались нагрузки, при которых более 70% всех подключений завершались всего двумя процессами из восьми.

Потому что `server.listen()` передает большую часть работы основному процессу, есть три случая, когда поведение обычного процесса Node.js и рабочего кластера различается:

1.  `server.listen({fd: 7})` Поскольку сообщение передается основному файловому дескриптору 7 **в родительском** будет прослушиваться, и дескриптор передается рабочему, вместо того, чтобы прислушиваться к идее рабочего о том, на что ссылается файловый дескриптор номер 7.
2.  `server.listen(handle)` Явное прослушивание дескрипторов приведет к тому, что рабочий будет использовать предоставленный дескриптор, а не разговаривать с основным процессом.
3.  `server.listen(0)` Обычно это заставляет серверы прослушивать случайный порт. Однако в кластере каждый рабочий будет получать один и тот же "случайный" порт каждый раз, когда `listen(0)`. По сути, в первый раз порт является случайным, но впоследствии предсказуемым. Чтобы прослушивать уникальный порт, сгенерируйте номер порта на основе идентификатора работника кластера.

Node.js не предоставляет логики маршрутизации. Поэтому важно спроектировать приложение так, чтобы оно не слишком сильно полагалось на объекты данных в памяти для таких вещей, как сеансы и вход в систему.

Поскольку рабочие процессы - это отдельные процессы, они могут быть убиты или повторно созданы в зависимости от потребностей программы, не затрагивая других рабочих процессов. Пока есть рабочие, сервер будет продолжать принимать соединения. Если рабочих нет, существующие соединения будут отброшены, а новые соединения будут отклонены. Однако Node.js не управляет автоматически количеством рабочих. Приложение отвечает за управление рабочим пулом в соответствии со своими потребностями.

Хотя основной вариант использования `cluster` Модуль является сетевым, он также может использоваться для других случаев использования, требующих рабочих процессов.

## Класс: `Worker`

<!-- YAML
added: v0.7.0
-->

- Расширяется: {EventEmitter}

А `Worker` Объект содержит всю общедоступную информацию и метод о работнике. В первичной его можно получить, используя `cluster.workers`. В воркере его можно получить, используя `cluster.worker`.

### Событие: `'disconnect'`

<!-- YAML
added: v0.7.7
-->

Подобно `cluster.on('disconnect')` событие, но специфичное для этого рабочего.

```js
cluster.fork().on('disconnect', () => {
  // Worker has disconnected
});
```

### Событие: `'error'`

<!-- YAML
added: v0.7.3
-->

Это событие совпадает с тем, которое предоставляет [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options).

Внутри рабочего `process.on('error')` также могут быть использованы.

### Событие: `'exit'`

<!-- YAML
added: v0.11.2
-->

- `code` {number} Код выхода, если он завершился нормально.
- `signal` {строка} Название сигнала (например, `'SIGHUP'`), что привело к остановке процесса.

Подобно `cluster.on('exit')` событие, но специфичное для этого рабочего.

```mjs
import cluster from 'cluster';

const worker = cluster.fork();
worker.on('exit', (code, signal) => {
  if (signal) {
    console.log(`worker was killed by signal: ${signal}`);
  } else if (code !== 0) {
    console.log(`worker exited with error code: ${code}`);
  } else {
    console.log('worker success!');
  }
});
```

```cjs
const cluster = require('cluster');

const worker = cluster.fork();
worker.on('exit', (code, signal) => {
  if (signal) {
    console.log(`worker was killed by signal: ${signal}`);
  } else if (code !== 0) {
    console.log(`worker exited with error code: ${code}`);
  } else {
    console.log('worker success!');
  }
});
```

### Событие: `'listening'`

<!-- YAML
added: v0.7.0
-->

- `address` {Объект}

Подобно `cluster.on('listening')` событие, но специфичное для этого рабочего.

```mjs
import cluster from 'cluster';

cluster.fork().on('listening', (address) => {
  // Worker is listening
});
```

```cjs
const cluster = require('cluster');

cluster.fork().on('listening', (address) => {
  // Worker is listening
});
```

В воркере не выделяется.

### Событие: `'message'`

<!-- YAML
added: v0.7.0
-->

- `message` {Объект}
- `handle` {undefined | Объект}

Подобно `'message'` событие `cluster`, но специфично для этого рабочего.

Внутри рабочего `process.on('message')` также могут быть использованы.

Видеть [`process` событие: `'message'`](process.md#event-message).

Вот пример использования системы сообщений. Он ведет подсчет в основном процессе количества HTTP-запросов, полученных рабочими:

```mjs
import cluster from 'cluster';
import http from 'http';
import { cpus } from 'os';
import process from 'process';

if (cluster.isPrimary) {
  // Keep track of http requests
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }
} else {
  // Worker processes have a http server.
  http
    .Server((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');

      // Notify primary about the request
      process.send({ cmd: 'notifyRequest' });
    })
    .listen(8000);
}
```

```cjs
const cluster = require('cluster');
const http = require('http');
const process = require('process');

if (cluster.isPrimary) {
  // Keep track of http requests
  let numReqs = 0;
  setInterval(() => {
    console.log(`numReqs = ${numReqs}`);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd === 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = require('os').cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  for (const id in cluster.workers) {
    cluster.workers[id].on('message', messageHandler);
  }
} else {
  // Worker processes have a http server.
  http
    .Server((req, res) => {
      res.writeHead(200);
      res.end('hello world\n');

      // Notify primary about the request
      process.send({ cmd: 'notifyRequest' });
    })
    .listen(8000);
}
```

### Событие: `'online'`

<!-- YAML
added: v0.7.0
-->

Подобно `cluster.on('online')` событие, но специфичное для этого рабочего.

```js
cluster.fork().on('online', () => {
  // Worker is online
});
```

В воркере не выделяется.

### `worker.disconnect()`

<!-- YAML
added: v0.7.7
changes:
  - version: v7.3.0
    pr-url: https://github.com/nodejs/node/pull/10019
    description: This method now returns a reference to `worker`.
-->

- Возвращает: {cluster.Worker} Ссылка на `worker`.

В воркере эта функция закроет все серверы, дождитесь `'close'` на этих серверах, а затем отключите канал IPC.

В основном, внутреннее сообщение отправляется рабочему, заставляя его вызвать `.disconnect()` на себя.

Причины `.exitedAfterDisconnect` быть установленным.

После закрытия сервера он больше не будет принимать новые соединения, но соединения могут быть приняты любым другим слушающим рабочим. Существующие подключения будут закрыты в обычном режиме. Когда больше нет подключений, см. [`server.close()`](net.md#event-close), канал IPC для рабочего закроется, позволяя ему благополучно умереть.

Вышеуказанное применимо _Только_ к серверным соединениям, клиентские соединения не закрываются автоматически рабочими, и при отключении не дожидается их закрытия перед завершением.

В рабочем, `process.disconnect` существует, но это не эта функция; это [`disconnect()`](child_process.md#subprocessdisconnect).

Поскольку долгоживущие серверные соединения могут блокировать отключение рабочих, может быть полезно отправить сообщение, поэтому для их закрытия могут быть предприняты определенные действия приложения. Также может быть полезно реализовать тайм-аут, убивая рабочего, если `'disconnect'` событие не было отправлено через некоторое время.

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
  const net = require('net');
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

### `worker.exitedAfterDisconnect`

<!-- YAML
added: v6.0.0
-->

- {логический}

Это свойство `true` если рабочий ушел из-за `.kill()` или `.disconnect()`. Если рабочий вышел другим способом, он `false`. Если рабочий не вышел, он `undefined`.

Логическое [`worker.exitedAfterDisconnect`](#workerexitedafterdisconnect) позволяет различать добровольный и случайный выход, основной может решить не возрождать рабочего на основе этого значения.

```js
cluster.on('exit', (worker, code, signal) => {
  if (worker.exitedAfterDisconnect === true) {
    console.log(
      'Oh, it was just voluntary – no need to worry'
    );
  }
});

// kill worker
worker.kill();
```

### `worker.id`

<!-- YAML
added: v0.8.0
-->

- {количество}

Каждому новому воркеру дается свой уникальный идентификатор, который хранится в `id`.

Пока рабочий жив, это ключ, который индексирует его в `cluster.workers`.

### `worker.isConnected()`

<!-- YAML
added: v0.11.14
-->

Эта функция возвращает `true` если воркер подключен к своему основному через свой канал IPC, `false` иначе. Рабочий подключается к своему основному объекту после того, как он был создан. Отключается после `'disconnect'` событие испускается.

### `worker.isDead()`

<!-- YAML
added: v0.11.14
-->

Эта функция возвращает `true` если рабочий процесс завершился (либо из-за выхода, либо из-за сигнала). В противном случае возвращается `false`.

```mjs
import cluster from 'cluster';
import http from 'http';
import { cpus } from 'os';
import process from 'process';

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
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
  // Workers can share any TCP connection. In this case, it is an HTTP server.
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`Current process\n ${process.pid}`);
      process.kill(process.pid);
    })
    .listen(8000);
}
```

```cjs
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
const process = require('process');

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
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
  // Workers can share any TCP connection. In this case, it is an HTTP server.
  http
    .createServer((req, res) => {
      res.writeHead(200);
      res.end(`Current process\n ${process.pid}`);
      process.kill(process.pid);
    })
    .listen(8000);
}
```

### `worker.kill([signal])`

<!-- YAML
added: v0.9.12
-->

- `signal` {строка} Имя сигнала уничтожения, отправляемого рабочему процессу. **Дефолт:** `'SIGTERM'`

Эта функция убьет рабочего. В первичной обмотке это делается путем отключения `worker.process`, и после отключения убивает с `signal`. В воркере это делается отключением канала, а затем выходом с помощью кода `0`.

Потому что `kill()` пытается корректно отключить рабочий процесс, он может бесконечно ждать завершения отключения. Например, если рабочий входит в бесконечный цикл, постепенное отключение никогда не произойдет. Если постепенное отключение не требуется, используйте `worker.process.kill()`.

Причины `.exitedAfterDisconnect` быть установленным.

Этот метод имеет псевдоним `worker.destroy()` для обратной совместимости.

В рабочем, `process.kill()` существует, но это не эта функция; это [`kill()`](process.md#processkillpid-signal).

### `worker.process`

<!-- YAML
added: v0.7.0
-->

- {ChildProcess}

Все воркеры созданы с использованием [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options), объект, возвращаемый этой функцией, сохраняется как `.process`. В рабочем глобальном `process` хранится.

Видеть: [Модуль дочернего процесса](child_process.md#child_processforkmodulepath-args-options).

Рабочие позвонят `process.exit(0)` если `'disconnect'` событие происходит на `process` а также `.exitedAfterDisconnect` не является `true`. Это защищает от случайного отключения.

### `worker.send(message[, sendHandle[, options]][, callback])`

<!-- YAML
added: v0.7.0
changes:
  - version: v4.0.0
    pr-url: https://github.com/nodejs/node/pull/2620
    description: The `callback` parameter is supported now.
-->

- `message` {Объект}
- `sendHandle` {Ручка}
- `options` {Object} `options` Аргумент, если он присутствует, представляет собой объект, используемый для параметризации отправки определенных типов дескрипторов. `options` поддерживает следующие свойства:
  - `keepOpen` {boolean} Значение, которое можно использовать при передаче экземпляров `net.Socket`. Когда `true`, сокет остается открытым в процессе отправки. **Дефолт:** `false`.
- `callback` {Функция}
- Возвращает: {логическое}

Отправить сообщение работнику или первичному лицу, необязательно с дескриптором.

В основном это отправляет сообщение определенному работнику. Он идентичен [`ChildProcess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback).

В воркере это отправляет сообщение первичному. Он идентичен `process.send()`.

В этом примере будут отображаться все сообщения от основного:

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

## Событие: `'disconnect'`

<!-- YAML
added: v0.7.9
-->

- `worker` {cluster.Worker}

Излучается после отключения рабочего канала IPC. Это может произойти, когда воркер корректно завершает работу, убит или отключен вручную (например, с помощью `worker.disconnect()`).

Может быть задержка между `'disconnect'` а также `'exit'` События. Эти события можно использовать, чтобы определить, застрял ли процесс при очистке или существуют долговечные соединения.

```js
cluster.on('disconnect', (worker) => {
  console.log(`The worker #${worker.id} has disconnected`);
});
```

## Событие: `'exit'`

<!-- YAML
added: v0.7.9
-->

- `worker` {cluster.Worker}
- `code` {number} Код выхода, если он завершился нормально.
- `signal` {строка} Название сигнала (например, `'SIGHUP'`), что привело к остановке процесса.

Когда любой из рабочих умирает, кластерный модуль излучает `'exit'` событие.

Это можно использовать для перезапуска рабочего, вызвав [`.fork()`](#clusterforkenv) опять таки.

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

Видеть [`child_process` событие: `'exit'`](child_process.md#event-exit).

## Событие: `'fork'`

<!-- YAML
added: v0.7.0
-->

- `worker` {cluster.Worker}

Когда новый воркер будет разветвлен, модуль кластера выдаст сообщение `'fork'` событие. Это можно использовать для регистрации активности работника и создания настраиваемого тайм-аута.

```js
const timeouts = [];
function errorMsg() {
  console.error(
    'Something must be wrong with the connection ...'
  );
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

## Событие: `'listening'`

<!-- YAML
added: v0.7.0
-->

- `worker` {cluster.Worker}
- `address` {Объект}

После звонка `listen()` от рабочего, когда `'listening'` событие испускается на сервере `'listening'` событие также будет отправлено `cluster` в первичной.

Обработчик событий выполняется с двумя аргументами: `worker` содержит рабочий объект и `address` объект содержит следующие свойства подключения: `address`, `port` а также `addressType`. Это очень полезно, если воркер прослушивает более одного адреса.

```js
cluster.on('listening', (worker, address) => {
  console.log(
    `A worker is now connected to ${address.address}:${address.port}`
  );
});
```

В `addressType` один из:

- `4` (TCPv4)
- `6` (TCPv6)
- `-1` (Доменный сокет Unix)
- `'udp4'` или `'udp6'` (UDP v4 или v6)

## Событие: `'message'`

<!-- YAML
added: v2.5.0
changes:
  - version: v6.0.0
    pr-url: https://github.com/nodejs/node/pull/5361
    description: The `worker` parameter is passed now; see below for details.
-->

- `worker` {cluster.Worker}
- `message` {Объект}
- `handle` {undefined | Объект}

Излучается, когда основной кластер получает сообщение от любого рабочего.

Видеть [`child_process` событие: `'message'`](child_process.md#event-message).

## Событие: `'online'`

<!-- YAML
added: v0.7.0
-->

- `worker` {cluster.Worker}

После разветвления нового воркера он должен ответить онлайн-сообщением. Когда первичный сервер получает онлайн-сообщение, он генерирует это событие. Разница между `'fork'` а также `'online'` это вилка генерируется, когда основной разветвляет воркер, и `'online'` испускается, когда рабочий работает.

```js
cluster.on('online', (worker) => {
  console.log(
    'Yay, the worker responded after it was forked'
  );
});
```

## Событие: `'setup'`

<!-- YAML
added: v0.7.1
-->

- `settings` {Объект}

Испускается каждый раз [`.setupPrimary()`](#clustersetupprimarysettings) называется.

В `settings` объект `cluster.settings` объект в то время [`.setupPrimary()`](#clustersetupprimarysettings) был вызван и носит рекомендательный характер, так как несколько вызовов [`.setupPrimary()`](#clustersetupprimarysettings) можно сделать в один тик.

Если важна точность, используйте `cluster.settings`.

## `cluster.disconnect([callback])`

<!-- YAML
added: v0.7.7
-->

- `callback` {Функция} Вызывается, когда все рабочие отключены и дескрипторы закрыты.

Звонки `.disconnect()` на каждого работника в `cluster.workers`.

Когда они отключены, все внутренние дескрипторы будут закрыты, позволяя основному процессу изящно умереть, если не ожидает никаких других событий.

Метод принимает необязательный аргумент обратного вызова, который будет вызываться по завершении.

Это можно вызвать только из основного процесса.

## `cluster.fork([env])`

<!-- YAML
added: v0.6.0
-->

- `env` {Object} Пары ключ / значение для добавления в среду рабочего процесса.
- Возвращает: {cluster.Worker}

Создать новый рабочий процесс.

Это можно вызвать только из основного процесса.

## `cluster.isMaster`

<!-- YAML
added: v0.8.1
deprecated: v16.0.0
-->

Устаревший псевдоним для [`cluster.isPrimary`](#clusterisprimary). Детали.

## `cluster.isPrimary`

<!-- YAML
added: v16.0.0
-->

- {логический}

Верно, если процесс первичный. Это определяется `process.env.NODE_UNIQUE_ID`. Если `process.env.NODE_UNIQUE_ID` не определено, то `isPrimary` является `true`.

## `cluster.isWorker`

<!-- YAML
added: v0.6.0
-->

- {логический}

Верно, если процесс не является первичным (это отрицание `cluster.isPrimary`).

## `cluster.schedulingPolicy`

<!-- YAML
added: v0.11.2
-->

Политика планирования, либо `cluster.SCHED_RR` для кругового или `cluster.SCHED_NONE` оставить это операционной системе. Это глобальная настройка, которая эффективно замораживается после создания первого воркера или [`.setupPrimary()`](#clustersetupprimarysettings) вызывается, в зависимости от того, что наступит раньше.

`SCHED_RR` является значением по умолчанию для всех операционных систем, кроме Windows. Windows изменится на `SCHED_RR` как только libuv сможет эффективно распределять дескрипторы IOCP без значительного снижения производительности.

`cluster.schedulingPolicy` также можно установить через `NODE_CLUSTER_SCHED_POLICY` переменная окружения. Допустимые значения: `'rr'` а также `'none'`.

## `cluster.settings`

<!-- YAML
added: v0.7.1
changes:
  - version:
     - v13.2.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30162
    description: The `serialization` option is supported now.
  - version: v9.5.0
    pr-url: https://github.com/nodejs/node/pull/18399
    description: The `cwd` option is supported now.
  - version: v9.4.0
    pr-url: https://github.com/nodejs/node/pull/17412
    description: The `windowsHide` option is supported now.
  - version: v8.2.0
    pr-url: https://github.com/nodejs/node/pull/14140
    description: The `inspectPort` option is supported now.
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7838
    description: The `stdio` option is supported now.
-->

- {Объект}
  - `execArgv` {string \[]} Список строковых аргументов, переданных исполняемому файлу Node.js. **Дефолт:** `process.execArgv`.
  - `exec` {строка} Путь к рабочему файлу. **Дефолт:** `process.argv[1]`.
  - `args` {string \[]} Строковые аргументы, переданные работнику. **Дефолт:** `process.argv.slice(2)`.
  - `cwd` {строка} Текущий рабочий каталог рабочего процесса. **Дефолт:** `undefined` (наследуется от родительского процесса).
  - `serialization` {строка} Укажите тип сериализации, используемый для отправки сообщений между процессами. Возможные значения: `'json'` а также `'advanced'`. Видеть [Расширенная сериализация для `child_process`](child_process.md#advanced-serialization) Больше подробностей. **Дефолт:** `false`.
  - `silent` {boolean} Отправлять или нет вывод на stdio родителя. **Дефолт:** `false`.
  - `stdio` {Array} Настраивает stdio для разветвленных процессов. Поскольку модуль кластера полагается на работу IPC, эта конфигурация должна содержать `'ipc'` Вход. Когда предоставляется этот параметр, он имеет приоритет над `silent`.
  - `uid` {number} Устанавливает идентификатор пользователя процесса. (См. Setuid (2).)
  - `gid` {number} Устанавливает групповой идентификатор процесса. (См. Setgid (2).)
  - `inspectPort` {number | Function} Устанавливает порт инспектора рабочего. Это может быть число или функция, которая не принимает аргументов и возвращает число. По умолчанию каждый воркер получает свой собственный порт, увеличенный от основного порта. `process.debugPort`.
  - `windowsHide` {boolean} Скрыть окно консоли разветвленных процессов, которое обычно создается в системах Windows. **Дефолт:** `false`.

После звонка [`.setupPrimary()`](#clustersetupprimarysettings) (или [`.fork()`](#clusterforkenv)) этот объект настроек будет содержать настройки, включая значения по умолчанию.

Этот объект не предназначен для изменения или настройки вручную.

## `cluster.setupMaster([settings])`

<!-- YAML
added: v0.7.1
deprecated: v16.0.0
changes:
  - version: v6.4.0
    pr-url: https://github.com/nodejs/node/pull/7838
    description: The `stdio` option is supported now.
-->

Устаревший псевдоним для [`.setupPrimary()`](#clustersetupprimarysettings).

## `cluster.setupPrimary([settings])`

<!-- YAML
added: v16.0.0
-->

- `settings` {Object} См. [`cluster.settings`](#clustersettings).

`setupPrimary` используется для изменения поведения «вилки» по умолчанию. После вызова настройки будут представлены в `cluster.settings`.

Любые изменения настроек влияют только на будущие звонки на [`.fork()`](#clusterforkenv) и не влияют на уже работающих исполнителей.

Единственный атрибут воркера, который нельзя установить через `.setupPrimary()` это `env` перешел к [`.fork()`](#clusterforkenv).

Вышеуказанные значения по умолчанию применяются только к первому вызову; значения по умолчанию для последующих вызовов - текущие значения на момент `cluster.setupPrimary()` называется.

```mjs
import cluster from 'cluster';

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
const cluster = require('cluster');

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

Это можно вызвать только из основного процесса.

## `cluster.worker`

<!-- YAML
added: v0.7.0
-->

- {Объект}

Ссылка на текущий рабочий объект. Недоступно в основном процессе.

```mjs
import cluster from 'cluster';

if (cluster.isPrimary) {
  console.log('I am primary');
  cluster.fork();
  cluster.fork();
} else if (cluster.isWorker) {
  console.log(`I am worker #${cluster.worker.id}`);
}
```

```cjs
const cluster = require('cluster');

if (cluster.isPrimary) {
  console.log('I am primary');
  cluster.fork();
  cluster.fork();
} else if (cluster.isWorker) {
  console.log(`I am worker #${cluster.worker.id}`);
}
```

## `cluster.workers`

<!-- YAML
added: v0.7.0
-->

- {Объект}

Хэш, в котором хранятся активные рабочие объекты, с ключом `id` поле. Позволяет легко перебрать всех рабочих. Он доступен только в основном процессе.

Рабочий удален из `cluster.workers` после того, как рабочий отключился _а также_ вышел. Порядок между этими двумя событиями нельзя определить заранее. Однако гарантируется, что удаление из `cluster.workers` список происходит предпоследний `'disconnect'` или `'exit'` событие испускается.

```mjs
import cluster from 'cluster';

// Go through all workers
function eachWorker(callback) {
  for (const id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}
eachWorker((worker) => {
  worker.send('big announcement to all workers');
});
```

```cjs
const cluster = require('cluster');

// Go through all workers
function eachWorker(callback) {
  for (const id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}
eachWorker((worker) => {
  worker.send('big announcement to all workers');
});
```

Использование уникального идентификатора работника - это самый простой способ найти работника.

```js
socket.on('data', (id) => {
  const worker = cluster.workers[id];
});
```
