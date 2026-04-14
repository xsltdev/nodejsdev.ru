---
title: Кластер
description: Кластеры процессов Node.js можно использовать для запуска нескольких экземпляров Node.js, которые могут распределять рабочую нагрузку между своими потоками приложений
---

# Кластер

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/cluster.html)

<!--introduced_in=v0.10.0-->

<!-- source_link=lib/cluster.js -->

!!!success "Стабильность: 2 – Стабильная"

    API является удовлетворительным. Совместимость с npm имеет высший приоритет и не будет нарушена, кроме случаев явной необходимости.

Кластеры процессов Node.js можно использовать для запуска нескольких экземпляров Node.js, которые могут распределять рабочую нагрузку между своими потоками приложений. Если изоляция процессов не требуется, используйте вместо этого модуль [`worker_threads`](worker_threads.md), который позволяет запускать несколько потоков приложений в рамках одного экземпляра Node.js.

Модуль кластера позволяет легко создавать дочерние процессы, которые совместно используют серверные порты.

=== "MJS"

    ```js
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
        http.createServer((req, res) => {
            res.writeHead(200);
            res.end('hello world\n');
        }).listen(8000);

        console.log(`Worker ${process.pid} started`);
    }
    ```

=== "CJS"

    ```js
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
        http.createServer((req, res) => {
            res.writeHead(200);
            res.end('hello world\n');
        }).listen(8000);

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

Рабочие процессы создаются через [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options), чтобы они могли обмениваться с родителем по IPC и передавать друг другу дескрипторы сервера.

Модуль кластера поддерживает два способа распределения входящих соединений.

Первый (по умолчанию на всех платформах, кроме Windows) — циклическое распределение: основной процесс слушает порт, принимает новые соединения и по очереди отдаёт их рабочим, с дополнительной логикой, чтобы не перегружать отдельный рабочий процесс.

Второй вариант: основной процесс создаёт сокет для прослушивания и передаёт его нужным рабочим; рабочие принимают входящие соединения сами.

Теоретически второй способ может дать лучшую производительность. На практике распределение часто оказывается сильно неравномерным из‑за особенностей планировщика ОС: встречались сценарии, когда более 70 % соединений приходилось лишь на два процесса из восьми.

Так как `server.listen()` перенаправляет основную работу в основной процесс, есть три случая, когда поведение обычного процесса Node.js и рабочего в кластере различаются:

1. `server.listen({fd: 7})` — сообщение уходит в основной процесс, поэтому дескриптор файла 7 **в родителе** будет прослушан, а дескриптор передастся рабочему, вместо того чтобы рабочий слушал свой дескриптор с номером 7.
2. Если `server.listen(handle)` вызывают с явным дескриптором, рабочий использует переданный дескриптор и не обращается к основному процессу.
3. `server.listen(0)` — обычно сервер получает случайный порт. В кластере каждый рабочий при каждом `listen(0)` получает один и тот же «случайный» порт: в первый раз он случаен, дальше — предсказуем. Чтобы слушать уникальный порт, задайте номер порта, например с учётом идентификатора рабочего в кластере.

Node.js не реализует прикладную маршрутизацию. Поэтому важно проектировать приложение так, чтобы оно не опиралось на данные только в памяти процесса для сессий, входа и т. п.

Рабочие — отдельные процессы: их можно завершать и перезапускать по необходимости, не затрагивая остальных. Пока есть живые рабочие, сервер принимает соединения. Если рабочих не осталось, существующие соединения сбрасываются, новые отклоняются. Node.js сам число рабочих не подбирает — это ответственность приложения.

Основное применение модуля `node:cluster` — сеть, но его можно использовать и в других сценариях, где нужны отдельные рабочие процессы.

<!-- 0001.part.md -->

## Класс: `Worker`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Объект `Worker` содержит всю публичную информацию и методы о рабочем процессе. В основном процессе его можно получить через `cluster.workers`. В рабочем — через `cluster.worker`.

<!-- 0002.part.md -->

### Событие: `'disconnect'`

Аналогично событию `cluster.on('disconnect')`, но специфично для этого рабочего.

```js
cluster.fork().on('disconnect', () => {
    // Рабочий отключился
});
```

<!-- 0003.part.md -->

### Событие: `error`

Это событие аналогично событию, предоставляемому [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options).

Внутри рабочего процесса также может использоваться `process.on('error')`.

<!-- 0004.part.md -->

### Событие: `exit`

-   `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, если выход произошел нормально.
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сигнала (например, `'SIGHUP'`), который вызвал завершение процесса.

Аналогично событию `cluster.on('exit')`, но специфично для данного рабочего.

=== "MJS"

    ```js
    import cluster from 'node:cluster';

    if (cluster.isPrimary) {
        const worker = cluster.fork();
        worker.on('exit', (code, signal) => {
            if (signal) {
                console.log(
                    `worker was killed by signal: ${signal}`
                );
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

=== "CJS"

    ```js
    const cluster = require('node:cluster');

    if (cluster.isPrimary) {
        const worker = cluster.fork();
        worker.on('exit', (code, signal) => {
            if (signal) {
                console.log(
                    `worker was killed by signal: ${signal}`
                );
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

-   `адрес` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Аналогично событию `cluster.on('listening')`, но специфично для этого рабочего.

=== "MJS"

    ```js
    cluster.fork().on('listening', (address) => {
        // Рабочий слушает
    });
    ```

=== "CJS"

    ```js
    cluster.fork().on('listening', (address) => {
        // Рабочий слушает
    });
    ```

Это не испускается в рабочем процессе.

<!-- 0006.part.md -->

### Событие: `message`

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `handle` undefined | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Аналогично событию `'message'` из `cluster`, но специфично для этого рабочего.

Внутри рабочего может также использоваться `process.on('message')`.

См. [событие `process`: `'message'`](process.md#event-message).

Вот пример использования системы сообщений. Он ведет подсчет в основном процессе количества HTTP-запросов, полученных рабочими:

=== "MJS"

    ```js
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
        http.Server((req, res) => {
            res.writeHead(200);
            res.end('hello world\n');

            // Уведомляем первичный процесс о запросе
            process.send({ cmd: 'notifyRequest' });
        }).listen(8000);
    }
    ```

=== "CJS"

    ```js
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
        http.Server((req, res) => {
            res.writeHead(200);
            res.end('hello world\n');

            // Уведомляем первичный процесс о запросе
            process.send({ cmd: 'notifyRequest' });
        }).listen(8000);
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

Это не испускается в рабочем процессе.

<!-- 0008.part.md -->

### `worker.disconnect()`

-   Возвращает: [`<cluster.Worker>`](cluster.md) Ссылка на `worker`.

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
        // Соединения не заканчиваются
    });

    server.listen(8000);

    process.on('message', (msg) => {
        if (msg === 'shutdown') {
            // Инициировать корректное закрытие соединений с сервером
        }
    });
}
```

<!-- 0009.part.md -->

### `worker.exitedAfterDisconnect`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

// завершить рабочий процесс
worker.kill();
```

<!-- 0010.part.md -->

### `worker.id`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Каждому новому работнику присваивается свой уникальный id, этот id хранится в `id`.

Пока рабочий жив, это ключ, по которому он индексируется в `cluster.workers`.

<!-- 0011.part.md -->

### `worker.isConnected()`

Эта функция возвращает `true`, если рабочий подключен к своему первичному серверу через его IPC-канал, `false` в противном случае. Рабочий подключается к своему первичному серверу после его создания. Он отключается после возникновения события `'disconnect'`.

<!-- 0012.part.md -->

### `worker.isDead()`

Эта функция возвращает `true`, если процесс рабочего завершился (либо из-за выхода, либо из-за получения сигнала). В противном случае она возвращает `false`.

=== "MJS"

    ```js
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
        http.createServer((req, res) => {
            res.writeHead(200);
            res.end(`Текущий процесс\n ${process.pid}`);
            process.kill(process.pid);
        }).listen(8000);
    }
    ```

=== "CJS"

    ```js
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
        http.createServer((req, res) => {
            res.writeHead(200);
            res.end(`Текущий процесс\n ${process.pid}`);
            process.kill(process.pid);
        }).listen(8000);
    }
    ```

<!-- 0013.part.md -->

### `worker.kill([signal])`

-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сигнала kill, который нужно послать рабочему процессу. **По умолчанию:** `SIGTERM`.

Эта функция убивает рабочий процесс. В основном рабочем она делает это путем отключения `worker.process`, а после отключения убивает с помощью `signal`. В рабочем это происходит путем уничтожения процесса с помощью `signal`.

Функция `kill()` убивает рабочий процесс, не дожидаясь изящного разъединения, она имеет такое же поведение, как и `worker.process.kill()`.

Для обратной совместимости этот метод называется `worker.destroy()`.

В рабочем процессе существует `process.kill()`, но это не эта функция, а [`kill()`](process.md#processkillpid-signal).

<!-- 0014.part.md -->

### `worker.process`

-   `ChildProcess`

Все рабочие создаются с помощью [`child_process.fork()`](child_process.md#child_processforkmodulepath-args-options), возвращаемый объект из этой функции хранится как `.process`. В рабочем хранится глобальный `process`.

См.: [модуль дочерних процессов](child_process.md#child_processforkmodulepath-args-options).

Рабочие процессы будут вызывать `process.exit(0)`, если событие `'disconnect'` произойдет на `process` и `.exitedAfterDisconnect` не будет `true`. Это защищает от случайного отключения.

<!-- 0015.part.md -->

### `worker.send(message[, sendHandle[, options]][, callback])`

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `sendHandle` `Handle`
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Аргумент `options`, если он присутствует, представляет собой объект, используемый для параметризации отправки определенных типов дескрипторов. `options` поддерживает следующие свойства:
    -   `keepOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Значение, которое может использоваться при передаче экземпляров `net.Socket`. Когда `true`, сокет остается открытым в процессе отправки. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

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

## Событие: `'disconnect'`

-   `worker` [`<cluster.Worker>`](cluster.md)

Выдается после отключения IPC-канала рабочего. Это может произойти, когда рабочий изящно завершает работу, его убивают или отключают вручную (например, с помощью `worker.disconnect()`).

Между событиями `'disconnect'` и `'exit'` может быть задержка. Эти события могут быть использованы для обнаружения того, что процесс застрял в очистке или что есть долгоживущие соединения.

```js
cluster.on('disconnect', (worker) => {
    console.log(`Рабочий #${worker.id} отключился`);
});
```

<!-- 0017.part.md -->

## Событие: `'exit'`

-   `worker` [`<cluster.Worker>`](cluster.md)
-   `code` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Код выхода, если он вышел нормально.
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя сигнала (например, `'SIGHUP'`), который вызвал завершение процесса.

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

-   `worker` [`<cluster.Worker>`](cluster.md)

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

-   `worker` [`<cluster.Worker>`](cluster.md)
-   `адрес` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

После вызова функции `listen()` от рабочего, когда событие `'listening'` испускается на сервере, событие `'listening'` также будет испущено на `cluster` в первичном.

Обработчик события вызывается с двумя аргументами: `worker` содержит объект рабочего, а объект `address` — следующие свойства соединения: `address`, `port` и `addressType`. Это особенно полезно, если рабочий слушает более одного адреса.

```js
cluster.on('listening', (worker, address) => {
    console.log(
        `Рабочий теперь слушает ${address.address}:${address.port}`
    );
});
```

Тип `addressType` — один из:

-   `4` (TCPv4)
-   `6` (TCPv6)
-   `-1` (Unix-сокет домена)
-   `'udp4'` или `'udp6'` (UDPv4 или UDPv6)

<!-- 0020.part.md -->

## Событие: `message`

-   `worker` [`<cluster.Worker>`](cluster.md)
-   `сообщение` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `handle` undefined | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Выдается, когда основной кластер получает сообщение от любого рабочего.

См. [событие `child_process`: `'message'`](child_process.md#event-message).

<!-- 0021.part.md -->

## Событие: `online`

-   `worker` [`<cluster.Worker>`](cluster.md)

После `fork()` нового рабочего тот должен прислать сигнал готовности. Когда основной процесс получает это сообщение, испускается событие `'online'`. Событие `'fork'` возникает, когда основной вызывает `fork()`, а `'online'` — когда рабочий процесс действительно запущен и готов.

```js
cluster.on('online', (worker) => {
    console.log(
        'Ура, рабочий ответил после того, как его форкнули'
    );
});
```

<!-- 0022.part.md -->

## Событие: `setup`

-   `settings` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Выдается каждый раз при вызове [`.setupPrimary()`](#clustersetupprimarysettings).

Объект `settings` представляет собой объект `cluster.settings` на момент вызова [`.setupPrimary()`](#clustersetupprimarysettings) и является только рекомендательным, так как за один такт может быть сделано несколько вызовов [`.setupPrimary()`](#clustersetupprimarysettings).

Если важна точность, используйте `cluster.settings`.

<!-- 0023.part.md -->

## `cluster.disconnect([callback])`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается, когда все рабочие отсоединены и ручки закрыты.

Вызывает `.disconnect()` для каждого рабочего в `cluster.workers`.

Когда они будут отключены, все внутренние ручки будут закрыты, что позволит основному процессу изящно завершиться, если не ожидается никакого другого события.

Метод принимает необязательный аргумент обратного вызова, который будет вызван после завершения.

Этот метод может быть вызван только из основного процесса.

<!-- 0024.part.md -->

## `cluster.fork([env])`

-   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пары ключ/значение для добавления в окружение рабочего процесса.
-   Возвращает: [`<cluster.Worker>`](cluster.md)

Порождает новый рабочий процесс.

Это может быть вызвано только из основного процесса.

<!-- 0025.part.md -->

## `cluster.isMaster`

Утративший силу псевдоним для [`cluster.isPrimary`](#clusterisprimary).

<!-- 0026.part.md -->

## `cluster.isPrimary`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Истина, если процесс является первичным. Это определяется `process.env.NODE_UNIQUE_ID`. Если `process.env.NODE_UNIQUE_ID` не определен, то `isPrimary` будет `true`.

<!-- 0027.part.md -->

## `cluster.isWorker`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Истина, если процесс не является основным (это отрицание `cluster.isPrimary`).

<!-- 0028.part.md -->

## `cluster.schedulingPolicy`

Политика планирования: либо `cluster.SCHED_RR` для циклического распределения, либо `cluster.SCHED_NONE`, чтобы оставить это на усмотрение операционной системы. Это глобальная настройка и фактически замораживается после порождения первого рабочего или вызова [`.setupPrimary()`](#clustersetupprimarysettings), в зависимости от того, что произойдет раньше.

По умолчанию используется `SCHED_RR` во всех операционных системах, кроме Windows. Windows перейдет на `SCHED_RR`, когда libuv сможет эффективно распределять ручки IOCP без большого падения производительности.

`cluster.schedulingPolicy` также может быть задана через переменную окружения `NODE_CLUSTER_SCHED_POLICY`. Допустимыми значениями являются `'rr'` и `'none'`.

<!-- 0029.part.md -->

## `cluster.settings`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `execArgv` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список строковых аргументов, передаваемых исполняемому файлу Node.js. **По умолчанию:** `process.execArgv`.
    -   `exec` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь к рабочему файлу. **По умолчанию:** `process.argv[1]`.
    -   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Строковые аргументы, передаваемые рабочему. **По умолчанию:** `process.argv.slice(2)`.
    -   `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текущий рабочий каталог рабочего процесса. **По умолчанию:** `undefined` (наследуется от родительского процесса).
    -   `serialization` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Вид сериализации сообщений между процессами. Допустимые значения: `'json'` и `'advanced'`. Подробнее — [расширенная сериализация для `child_process`](child_process.md#advanced-serialization). **По умолчанию:** `false`.
    -   `silent` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Посылать ли вывод на родительский stdio. **По умолчанию:** `false`.
    -   `stdio` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Настраивает stdio вилочных процессов. Поскольку для работы кластерного модуля используется IPC, эта конфигурация должна содержать запись `'ipc'`. Когда эта опция указана, она отменяет `silent`.
    -   `uid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает идентификатор пользователя процесса. (См. setuid(2).)
    -   `gid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Устанавливает групповую идентификацию процесса. (См. setgid(2).)
    -   `inspectPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Задает инспекторский порт рабочего. Это может быть число или функция, которая не принимает аргументов и возвращает число. По умолчанию каждый рабочий получает свой собственный порт, увеличивающийся от `process.debugPort` первичного.
    -   `windowsHide` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Скрыть консольное окно вилочных процессов, которое обычно создается в системах Windows. **По умолчанию:** `false`.

После вызова [`.setupPrimary()`](#clustersetupprimarysettings) (или [`.fork()`](#clusterforkenv)) этот объект настроек будет содержать настройки, включая значения по умолчанию.

Этот объект не предназначен для изменения или настройки вручную.

<!-- 0030.part.md -->

## `cluster.setupMaster([settings])`

Утративший силу псевдоним для [`.setupPrimary()`](#clustersetupprimarysettings).

<!-- 0031.part.md -->

## `cluster.setupPrimary([settings])`

-   `settings` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) См. [`cluster.settings`](#clustersettings).

`setupPrimary` используется для изменения поведения "вилки" по умолчанию. После вызова настройки будут присутствовать в `cluster.settings`.

Любые изменения настроек влияют только на будущие вызовы [`.fork()`](#clusterforkenv) и не влияют на уже запущенные рабочие.

Единственный атрибут рабочего, который не может быть установлен через `.setupPrimary()` - это `env`, переданный в [`.fork()`](#clusterforkenv).

Приведенные выше значения по умолчанию относятся только к первому вызову; значения по умолчанию для последующих вызовов - это текущие значения на момент вызова `cluster.setupPrimary()`.

=== "MJS"

    ```js
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

=== "CJS"

    ```js
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

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Ссылка на текущий объект рабочего процесса. Недоступно в основном процессе.

=== "MJS"

    ```js
    import cluster from 'node:cluster';

    if (cluster.isPrimary) {
        console.log('I am primary');
        cluster.fork();
        cluster.fork();
    } else if (cluster.isWorker) {
        console.log(`I am worker #${cluster.worker.id}`);
    }
    ```

=== "CJS"

    ```js
    const cluster = require('node:cluster');

    if (cluster.isPrimary) {
        console.log('I am primary');
        cluster.fork();
        cluster.fork();
    } else if (cluster.isWorker) {
        console.log(`I am worker #${cluster.worker.id}`);
    }
    ```

<!-- 0033.part.md -->

## `cluster.workers`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Хэш, хранящий активные объекты рабочих, с ключом по полю `id`. Это позволяет легко перебирать всех рабочих. Он доступен только в основном процессе.

Рабочий удаляется из `cluster.workers` после того, как он отключился _и_ вышел. Порядок между этими двумя событиями не может быть определен заранее. Однако гарантируется, что удаление из списка `cluster.workers` произойдет до того, как произойдет последнее событие `'disconnect'` или `'exit'`.

=== "MJS"

    ```js
    import cluster from 'node:cluster';

    for (const worker of Object.values(cluster.workers)) {
        worker.send('big announcement to all workers');
    }
    ```

=== "CJS"

    ```js
    const cluster = require('node:cluster');

    for (const worker of Object.values(cluster.workers)) {
        worker.send('big announcement to all workers');
    }
    ```

<!-- 0034.part.md -->
