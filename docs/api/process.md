---
title: Процесс
description: Объект process предоставляет информацию о текущем процессе Node.js и управление им
---

# Процесс

Объект `process` предоставляет сведения о текущем процессе Node.js и средства управления им.

=== "MJS"

    ```js
    import process from 'node:process';
    ```

=== "CJS"

    ```js
    const process = require('node:process');
    ```

## События `process`

Объект `process` является экземпляром [`EventEmitter`](events.md#class-eventemitter).

### Событие: `'beforeExit'`

Событие `'beforeExit'` испускается, когда Node.js опустошает цикл событий и ему нечего больше планировать. Обычно процесс Node.js завершается, когда нет запланированной работы, но слушатель, зарегистрированный на `'beforeExit'`, может выполнять асинхронные вызовы и тем самым заставлять процесс Node.js продолжать работу.

Функция обратного вызова слушателя вызывается со значением [`process.exitCode`](#processexitcode_1), переданным единственным аргументом.

Событие `'beforeExit'` _не_ испускается при условиях, ведущих к явному завершению, например при вызове [`process.exit()`](#processexitcode) или при необработанных исключениях.

Событие `'beforeExit'` _не_ следует использовать вместо `'exit'`, если только целью не является запланировать дополнительную работу.

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('beforeExit', (code) => {
      console.log('Process beforeExit event with code: ', code);
    });

    process.on('exit', (code) => {
      console.log('Process exit event with code: ', code);
    });

    console.log('This message is displayed first.');

    // Prints:
    // This message is displayed first.
    // Process beforeExit event with code: 0
    // Process exit event with code: 0
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('beforeExit', (code) => {
      console.log('Process beforeExit event with code: ', code);
    });

    process.on('exit', (code) => {
      console.log('Process exit event with code: ', code);
    });

    console.log('This message is displayed first.');

    // Prints:
    // This message is displayed first.
    // Process beforeExit event with code: 0
    // Process exit event with code: 0
    ```

### Событие: `'disconnect'`

Если процесс Node.js запущен с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), событие `'disconnect'` испускается при закрытии IPC-канала.

### Событие: `'exit'` {#event-exit}

-   `code` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'exit'` испускается, когда процесс Node.js собирается завершиться по одной из причин:

-   явно вызван метод `process.exit()`;
-   у цикла событий Node.js больше нет дополнительной работы.

На этом этапе нельзя предотвратить выход из цикла событий: после того как все слушатели `'exit'` отработают, процесс Node.js завершится.

Функция обратного вызова слушателя вызывается с кодом выхода, заданным либо свойством [`process.exitCode`](#processexitcode_1), либо аргументом `exitCode`, переданным в [`process.exit()`](#processexitcode).

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('exit', (code) => {
      console.log(`About to exit with code: ${code}`);
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('exit', (code) => {
      console.log(`About to exit with code: ${code}`);
    });
    ```

Функции-слушатели **должны** выполнять только **синхронные** операции. Процесс Node.js завершится сразу после вызова слушателей `'exit'`, и вся оставшаяся в очереди цикла событий работа будет отброшена. В следующем примере таймер никогда не сработает:

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('exit', (code) => {
      setTimeout(() => {
        console.log('This will not run');
      }, 0);
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('exit', (code) => {
      setTimeout(() => {
        console.log('This will not run');
      }, 0);
    });
    ```

### Событие: `'message'`

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null разобранный объект JSON или сериализуемое примитивное значение.
-   `sendHandle` [`<net.Server>`](net.md#class-netserver) | [`<net.Socket>`](net.md#class-netsocket) объект [`net.Server`](net.md#class-netserver) или [`net.Socket`](net.md#class-netsocket) либо `undefined`.

Если процесс Node.js запущен с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), событие `'message'` испускается всякий раз, когда дочерним процессом получено сообщение, отправленное родителем через [`childprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback).

Сообщение проходит сериализацию и разбор. Итоговое сообщение может не совпадать с исходно отправленным.

Если при порождении процесса для опции `serialization` было задано значение `advanced`, аргумент `message` может содержать данные, которые JSON представить не может. Подробнее см. [расширенную сериализацию для `child_process`](child_process.md#advanced-serialization).

### Событие: `'rejectionHandled'`

-   `promise` [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Promise, отказ которого обработан с задержкой.

Событие `'rejectionHandled'` испускается всякий раз, когда `Promise` был отклонён и к нему позже, чем через один оборот цикла событий Node.js, подключён обработчик ошибок (например через [`promise.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)).

Объект `Promise` ранее мог попасть в событие `'unhandledRejection'`, но в ходе обработки получил обработчик отказа.

У цепочки `Promise` нет «верхнего уровня», на котором отказы можно было бы всегда обработать синхронно. Отказ `Promise` может быть обработан позже — иногда значительно позже оборота цикла событий, на котором испускается `'unhandledRejection'`.

Иначе говоря: в синхронном коде список необработанных исключений только растёт, а для Promise список необработанных отказов может и расти, и сокращаться.

В синхронном коде событие `'uncaughtException'` испускается, когда список необработанных исключений увеличивается.

В асинхронном коде `'unhandledRejection'` испускается при росте списка необработанных отказов, а `'rejectionHandled'` — при его уменьшении.

=== "MJS"

    ```js
    import process from 'node:process';

    const unhandledRejections = new Map();
    process.on('unhandledRejection', (reason, promise) => {
      unhandledRejections.set(promise, reason);
    });
    process.on('rejectionHandled', (promise) => {
      unhandledRejections.delete(promise);
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    const unhandledRejections = new Map();
    process.on('unhandledRejection', (reason, promise) => {
      unhandledRejections.set(promise, reason);
    });
    process.on('rejectionHandled', (promise) => {
      unhandledRejections.delete(promise);
    });
    ```

В этом примере `Map` `unhandledRejections` со временем растёт и сужается, отражая отказы, которые сначала были без обработчика, а затем получили его. Такие ошибки можно записывать в журнал периодически (удобно для долгоживущих приложений) или при выходе процесса (удобнее для сценариев).

### Событие: `'workerMessage'`

-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) значение, переданное через [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout).
-   `source` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) идентификатор потока worker, отправившего сообщение, или `0` для основного потока.

Событие `'workerMessage'` испускается для любого входящего сообщения, отправленного другой стороной через [`postMessageToThread()`](worker_threads.md#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout).

### Событие: `'uncaughtException'` {#event-uncaughtexception}

Добавлено в: v0.1.18

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) необработанное исключение.
-   `origin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) указывает, происходит ли исключение из необработанного отказа Promise или из синхронной ошибки. Может быть `'uncaughtException'` или `'unhandledRejection'`. Последнее используется, когда исключение возникает в асинхронном контексте на основе `Promise` (или отклонён `Promise`) и флаг [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode) установлен в `strict` или `throw` (это значение по умолчанию), а отказ не обработан, либо когда отказ происходит на этапе статической загрузки ES-модуля точки входа командной строки.

Событие `'uncaughtException'` испускается, когда необработанное исключение JavaScript доходит до цикла событий. По умолчанию Node.js выводит трассировку стека в `stderr` и завершает процесс с кодом 1, переопределяя ранее заданный [`process.exitCode`](#processexitcode_1). Обработчик `'uncaughtException'` отменяет это поведение по умолчанию. Также можно изменить [`process.exitCode`](#processexitcode_1) в обработчике `'uncaughtException'`, чтобы процесс завершился с указанным кодом. Иначе при наличии такого обработчика процесс завершится с кодом 0.

=== "MJS"

    ```js
    import process from 'node:process';
    import fs from 'node:fs';

    process.on('uncaughtException', (err, origin) => {
      fs.writeSync(
        process.stderr.fd,
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}\n`,
      );
    });

    setTimeout(() => {
      console.log('This will still run.');
    }, 500);

    // Intentionally cause an exception, but don't catch it.
    nonexistentFunc();
    console.log('This will not run.');
    ```

=== "CJS"

    ```js
    const process = require('node:process');
    const fs = require('node:fs');

    process.on('uncaughtException', (err, origin) => {
      fs.writeSync(
        process.stderr.fd,
        `Caught exception: ${err}\n` +
        `Exception origin: ${origin}\n`,
      );
    });

    setTimeout(() => {
      console.log('This will still run.');
    }, 500);

    // Intentionally cause an exception, but don't catch it.
    nonexistentFunc();
    console.log('This will not run.');
    ```

Наблюдать за событиями `'uncaughtException'`, не переопределяя завершение процесса по умолчанию, можно, установив слушатель `'uncaughtExceptionMonitor'`.

#### Предупреждение: корректное использование `'uncaughtException'`

`'uncaughtException'` — грубый механизм обработки исключений, который следует применять только в крайнем случае. Событие _не_ должно использоваться как аналог `On Error Resume Next`. Необработанное исключение по сути означает, что приложение в неопределённом состоянии. Попытка продолжить выполнение кода без корректного восстановления после исключения может привести к новым непредсказуемым сбоям.

Исключения, выброшенные из обработчика события, не перехватываются: процесс завершится с ненулевым кодом и будет выведена трассировка. Так сделано, чтобы избежать бесконечной рекурсии.

Попытка «нормально» продолжить работу после необработанного исключения сродни выдёргиванию шнура питания при обновлении компьютера: девять раз из десяти ничего не случится, но в десятый возможна порча состояния.

Правильное применение `'uncaughtException'` — выполнить синхронную очистку выделенных ресурсов (например дескрипторов файлов, handle и т.п.) перед остановкой процесса. **Возобновлять обычную работу после `'uncaughtException'` небезопасно.**

Чтобы надёжнее перезапускать упавшее приложение — с `'uncaughtException'` или без — используйте внешний монитор в отдельном процессе, который отслеживает сбои и восстанавливает или перезапускает приложение.

### Событие: `'uncaughtExceptionMonitor'`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) необработанное исключение.
-   `origin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) см. описание у события `'uncaughtException'`.

Событие `'uncaughtExceptionMonitor'` испускается перед событием `'uncaughtException'` либо перед вызовом хука, установленного через [`process.setUncaughtExceptionCaptureCallback()`](#processsetuncaughtexceptioncapturecallbackfn).

Установка слушателя `'uncaughtExceptionMonitor'` не меняет поведение после испускания `'uncaughtException'`: процесс по-прежнему аварийно завершится, если нет слушателя `'uncaughtException'`.

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('uncaughtExceptionMonitor', (err, origin) => {
      MyMonitoringTool.logSync(err, origin);
    });

    // Intentionally cause an exception, but don't catch it.
    nonexistentFunc();
    // Still crashes Node.js
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('uncaughtExceptionMonitor', (err, origin) => {
      MyMonitoringTool.logSync(err, origin);
    });

    // Intentionally cause an exception, but don't catch it.
    nonexistentFunc();
    // Still crashes Node.js
    ```

### Событие: `'unhandledRejection'`

Добавлено в: v1.4.1

-   `reason` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | any значение, с которым Promise был отклонён (обычно объект [`Error`](errors.md#class-error)).
-   `promise` [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) отклонённый Promise.

Событие `'unhandledRejection'` испускается всякий раз, когда `Promise` отклонён и к нему не подключён обработчик ошибок в течение одного оборота цикла событий. При программировании с Promise исключения представляются как «отклонённые Promise». Отказы можно перехватывать через [`promise.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) и передавать по цепочке `Promise`. Событие `'unhandledRejection'` полезно для обнаружения и учёта Promise, для которых отказ ещё не обработан.

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('unhandledRejection', (reason, promise) => {
      console.log('Unhandled Rejection at:', promise, 'reason:', reason);
      // Application specific logging, throwing an error, or other logic here
    });

    somePromise.then((res) => {
      return reportToUser(JSON.pasre(res)); // Note the typo (`pasre`)
    }); // No `.catch()` or `.then()`
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('unhandledRejection', (reason, promise) => {
      console.log('Unhandled Rejection at:', promise, 'reason:', reason);
      // Application specific logging, throwing an error, or other logic here
    });

    somePromise.then((res) => {
      return reportToUser(JSON.pasre(res)); // Note the typo (`pasre`)
    }); // No `.catch()` or `.then()`
    ```

Следующий код также приведёт к испусканию `'unhandledRejection'`:

=== "MJS"

    ```js
    import process from 'node:process';

    function SomeResource() {
      // Initially set the loaded status to a rejected promise
      this.loaded = Promise.reject(new Error('Resource not yet loaded!'));
    }

    const resource = new SomeResource();
    // no .catch or .then on resource.loaded for at least a turn
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    function SomeResource() {
      // Initially set the loaded status to a rejected promise
      this.loaded = Promise.reject(new Error('Resource not yet loaded!'));
    }

    const resource = new SomeResource();
    // no .catch or .then on resource.loaded for at least a turn
    ```

В этом примере отказ можно трактовать как ошибку разработчика, как и в других случаях `'unhandledRejection'`. Чтобы обработать сбой, к `resource.loaded` можно добавить «пустой» обработчик [`.catch(() => { })`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch), который предотвратит испускание `'unhandledRejection'`.

Если событие `'unhandledRejection'` испущено, но не обработано, оно будет поднято как необработанное исключение. Прочие особенности `'unhandledRejection'` настраиваются флагом [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode).

### Событие: `'warning'` {#event-warning}

-   `warning` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) основные поля предупреждения:
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя предупреждения. **По умолчанию:** `'Warning'`.
    -   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) описание предупреждения, сформированное системой.
    -   `stack` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) трассировка стека до места выдачи предупреждения.

Событие `'warning'` испускается всякий раз, когда Node.js выдаёт предупреждение процесса.

Предупреждение процесса похоже на ошибку: оно описывает исключительную ситуацию, на которую нужно обратить внимание. Однако предупреждения не входят в обычный поток обработки ошибок Node.js и JavaScript. Node.js может выдавать предупреждения при обнаружении сомнительных практик программирования, которые могут снижать производительность, приводить к ошибкам или проблемам безопасности.

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('warning', (warning) => {
      console.warn(warning.name);    // Print the warning name
      console.warn(warning.message); // Print the warning message
      console.warn(warning.stack);   // Print the stack trace
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('warning', (warning) => {
      console.warn(warning.name);    // Print the warning name
      console.warn(warning.message); // Print the warning message
      console.warn(warning.stack);   // Print the stack trace
    });
    ```

По умолчанию Node.js выводит предупреждения процесса в `stderr`. Опция командной строки `--no-warnings` подавляет стандартный вывод в консоль, но объект `process` по-прежнему испускает `'warning'`. Сейчас нельзя отключить отдельные типы предупреждений, кроме предупреждений об устаревании. Для подавления deprecation см. флаг [`--no-deprecation`](cli.md#--no-deprecation).

Следующий пример показывает предупреждение в `stderr`, когда к событию добавлено слишком много слушателей:

```console
$ node
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> (node:38638) MaxListenersExceededWarning: Possible EventEmitter memory leak
detected. 2 foo listeners added. Use emitter.setMaxListeners() to increase limit
```

Ниже по умолчанию вывод предупреждений отключён, а обработчик `'warning'` задан вручную:

```console
$ node --no-warnings
> const p = process.on('warning', (warning) => console.warn('Do not do that!'));
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> Do not do that!
```

Опция `--trace-warnings` добавляет к стандартному выводу предупреждений полную трассировку стека.

Запуск Node.js с флагом `--throw-deprecation` превращает пользовательские предупреждения об устаревании в исключения.

Флаг `--trace-deprecation` выводит пользовательское предупреждение об устаревании в `stderr` вместе со стеком.

Флаг `--no-deprecation` подавляет все сообщения о пользовательском устаревании.

Флаги `*-deprecation` действуют только на предупреждения с именем `'DeprecationWarning'`.

#### Выдача собственных предупреждений

См. метод [`process.emitWarning()`](#processemitwarningwarning-type-code-ctor) для выдачи пользовательских или прикладных предупреждений.

#### Имена предупреждений Node.js

Строгих правил для типов предупреждений (поле `name`) в Node.js нет; новые типы могут появляться в любой момент. Часто встречаются, в частности:

-   `'DeprecationWarning'` — используется устаревший API или возможность Node.js. Такие предупреждения должны содержать свойство `'code'` с [кодом устаревания](deprecations.md).
-   `'ExperimentalWarning'` — используется экспериментальный API или возможность. С ними нужно быть осторожным: они могут меняться и не подчиняются тем же правилам semver и LTS, что стабильные возможности.
-   `'MaxListenersExceededWarning'` — слишком много слушателей для одного события на `EventEmitter` или `EventTarget`. Часто признак утечки памяти.
-   `'TimeoutOverflowWarning'` — числовое значение не помещается в 32-битное знаковое целое, переданное в `setTimeout()` или `setInterval()`.
-   `'TimeoutNegativeWarning'` — в `setTimeout()` или `setInterval()` передано отрицательное число.
-   `'TimeoutNaNWarning'` — в `setTimeout()` или `setInterval()` передано не число.
-   `'UnsupportedWarning'` — используется неподдерживаемая опция или возможность, она игнорируется, а не считается ошибкой. Пример — строка статуса ответа HTTP при совместимом API HTTP/2.

### Событие: `'worker'`

-   `worker` [`<Worker>`](worker_threads.md#class-worker) созданный [Worker](worker_threads.md#class-worker).

Событие `'worker'` испускается после создания нового потока [Worker](worker_threads.md#class-worker).

### События сигналов {#signal-events}

События сигналов испускаются, когда процесс Node.js получает сигнал. Список стандартных имён POSIX см. в signal(7), например `'SIGINT'`, `'SIGHUP'` и т.д.

Сигналы недоступны в потоках [`Worker`](worker_threads.md#class-worker).

Обработчик получает имя сигнала (`'SIGINT'`, `'SIGTERM'` и т.д.) первым аргументом.

Имя каждого события совпадает с обычным именем сигнала в верхнем регистре (например `'SIGINT'` для сигнала `SIGINT`).

=== "MJS"

    ```js
    import process from 'node:process';

    // Begin reading from stdin so the process does not exit.
    process.stdin.resume();

    process.on('SIGINT', () => {
      console.log('Received SIGINT. Press Control-D to exit.');
    });

    // Using a single function to handle multiple signals
    function handle(signal) {
      console.log(`Received ${signal}`);
    }

    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    // Begin reading from stdin so the process does not exit.
    process.stdin.resume();

    process.on('SIGINT', () => {
      console.log('Received SIGINT. Press Control-D to exit.');
    });

    // Using a single function to handle multiple signals
    function handle(signal) {
      console.log(`Received ${signal}`);
    }

    process.on('SIGINT', handle);
    process.on('SIGTERM', handle);
    ```

-   `'SIGUSR1'` зарезервирован в Node.js для запуска [отладчика](debugger.md). Слушатель установить можно, но это может мешать отладчику.
-   `'SIGTERM'` и `'SIGINT'` на платформах, кроме Windows, имеют обработчики по умолчанию: сбрасывают режим терминала перед выходом с кодом `128 + номер сигнала`. Если для одного из этих сигналов установлен слушатель, поведение по умолчанию снимается (Node.js больше не завершится сам).
-   `'SIGPIPE'` по умолчанию игнорируется. Для него можно установить слушателя.
-   `'SIGHUP'` на Windows генерируется при закрытии окна консоли, на других платформах — в похожих ситуациях; см. signal(7). Слушатель можно установить, однако примерно через 10 секунд Windows всё равно принудительно завершит Node.js. На не-Windows по умолчанию `SIGHUP` завершает Node.js, но после установки слушателя поведение по умолчанию снимается.
-   `'SIGTERM'` на Windows не поддерживается, на него можно подписаться.
-   `'SIGINT'` с терминала поддерживается на всех платформах, обычно <kbd>Ctrl</kbd>+<kbd>C</kbd> (может быть перенастроено). Не генерируется при включённом [сыром режиме терминала](tty.md#readstreamsetrawmodemode), если используется <kbd>Ctrl</kbd>+<kbd>C</kbd>.
-   `'SIGBREAK'` на Windows приходит при <kbd>Ctrl</kbd>+<kbd>Break</kbd>. На не-Windows на него можно подписаться, но сгенерировать или отправить его нельзя.
-   `'SIGWINCH'` приходит при изменении размера консоли. На Windows — только при записи в консоль при движении курсора или при читаемом TTY в raw mode.
-   Для `'SIGKILL'` нельзя установить слушателя: процесс Node.js всегда будет завершён безусловно.
-   Для `'SIGSTOP'` нельзя установить слушателя.
-   `'SIGBUS'`, `'SIGFPE'`, `'SIGSEGV'` и `'SIGILL'`, если не подняты искусственно через kill(2), оставляют процесс в состоянии, когда вызывать JS-слушателей небезопасно; возможен отказ процесса отвечать.
-   Сигнал `0` можно отправить для проверки существования процесса: если процесс есть, эффекта нет; если нет — будет ошибка.

В Windows нет сигналов POSIX, но Node.js частично эмулирует поведение через [`process.kill()`](#processkillpid-signal) и [`subprocess.kill()`](child_process.md#subprocesskillsignal):

-   Отправка `SIGINT`, `SIGTERM` и `SIGKILL` приводит к безусловному завершению целевого процесса; дочерний процесс затем сообщит о завершении по сигналу.
-   Отправка сигнала `0` — переносимый способ проверить, существует ли процесс.

## `process.abort()`

Метод `process.abort()` немедленно завершает процесс Node.js и может сформировать core dump.

В потоках [`Worker`](worker_threads.md#class-worker) недоступен.

## `process.addUncaughtExceptionCaptureCallback(fn)`

> Стабильность: 1 — экспериментально

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Функция `process.addUncaughtExceptionCaptureCallback()` добавляет callback, который вызывается при необработанном исключении; первым аргументом передаётся само исключение.

В отличие от [`process.setUncaughtExceptionCaptureCallback()`](#processsetuncaughtexceptioncapturecallbackfn), можно зарегистрировать несколько callback’ов, и они не конфликтуют с модулем [`domain`](domain.md). Вызов идёт в обратном порядке регистрации (сначала последний). Если callback возвращает `true`, последующие callback’и и стандартная обработка необработанного исключения пропускаются.

=== "MJS"

    ```js
    import process from 'node:process';

    process.addUncaughtExceptionCaptureCallback((err) => {
      console.error('Caught exception:', err.message);
      return true; // Indicates exception was handled
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.addUncaughtExceptionCaptureCallback((err) => {
      console.error('Caught exception:', err.message);
      return true; // Indicates exception was handled
    });
    ```

## `process.allowedNodeEnvironmentFlags`

-   Тип: [`<Set>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)

Свойство `process.allowedNodeEnvironmentFlags` — это специальный доступный только для чтения `Set` флагов, допустимых в переменной окружения [`NODE_OPTIONS`](cli.md#node_optionsoptions).

`process.allowedNodeEnvironmentFlags` расширяет `Set`, но переопределяет `Set.prototype.has`, чтобы распознавать несколько различных возможных представлений флагов. `process.allowedNodeEnvironmentFlags.has()` вернёт `true` в следующих случаях:

-   Флаги могут опускать ведущие одинарные (`-`) или двойные (`--`) тире; например, `inspect-brk` вместо `--inspect-brk`, или `r` вместо `-r`.
-   Флаги, передаваемые в V8 (как в `--v8-options`), могут заменять одно или несколько _не ведущих_ тире на подчёркивание или наоборот; например, `--perf_basic_prof`, `--perf-basic-prof`, `--perf_basic-prof` и т. д.
-   Флаги могут содержать один или несколько символов равенства (`=`); все символы начиная с первого `=` игнорируются; например, `--stack-trace-limit=100`.
-   Флаги _должны_ быть допустимы в [`NODE_OPTIONS`](cli.md#node_optionsoptions).

При переборе `process.allowedNodeEnvironmentFlags` каждый флаг встречается только _один раз_; каждый начинается с одного или нескольких тире. Флаги, передаваемые в V8, содержат подчёркивания вместо не ведущих тире:

=== "MJS"

    ```js
    import { allowedNodeEnvironmentFlags } from 'node:process';

    allowedNodeEnvironmentFlags.forEach((flag) => {
      // -r
      // --inspect-brk
      // --abort_on_uncaught_exception
      // ...
    });
    ```

=== "CJS"

    ```js
    const { allowedNodeEnvironmentFlags } = require('node:process');

    allowedNodeEnvironmentFlags.forEach((flag) => {
      // -r
      // --inspect-brk
      // --abort_on_uncaught_exception
      // ...
    });
    ```

Методы `add()`, `clear()` и `delete()` у `process.allowedNodeEnvironmentFlags` ничего не делают и завершаются без эффекта (молча).

Если Node.js собран _без_ поддержки [`NODE_OPTIONS`](cli.md#node_optionsoptions) (см. [`process.config`](#processconfig)), `process.allowedNodeEnvironmentFlags` будет содержать то, что _могло бы_ быть допустимо.

## `process.arch`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Архитектура ЦП ОС, под которую скомпилирован двоичный файл Node.js. Возможные значения: `'arm'`, `'arm64'`, `'ia32'`, `'loong64'`, `'mips'`, `'mipsel'`, `'ppc64'`, `'riscv64'`, `'s390'`, `'s390x'` и `'x64'`.

=== "MJS"

    ```js
    import { arch } from 'node:process';

    console.log(`This processor architecture is ${arch}`);
    ```

=== "CJS"

    ```js
    const { arch } = require('node:process');

    console.log(`This processor architecture is ${arch}`);
    ```

## `process.argv`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.argv` возвращает массив аргументов командной строки, переданных при запуске процесса Node.js. Первым элементом будет [`process.execPath`](#processexecpath). См. `process.argv0`, если нужен доступ к исходному значению `argv[0]`. Если задана [точка входа программы](https://nodejs.org/api/cli.html#program-entry-point), вторым элементом будет абсолютный путь к ней. Остальные элементы — дополнительные аргументы командной строки.

Например, для следующего сценария `process-args.js`:

=== "MJS"

    ```js
    import { argv } from 'node:process';

    // print process.argv
    argv.forEach((val, index) => {
      console.log(`${index}: ${val}`);
    });
    ```

=== "CJS"

    ```js
    const { argv } = require('node:process');

    // print process.argv
    argv.forEach((val, index) => {
      console.log(`${index}: ${val}`);
    });
    ```

Запуск процесса Node.js:

```bash
node process-args.js one two=three four
```

даст вывод:

```text
0: /usr/local/bin/node
1: /Users/mjr/work/node/process-args.js
2: one
3: two=three
4: four
```

## `process.argv0`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.argv0` хранит доступную только для чтения копию исходного значения `argv[0]`, переданного при запуске Node.js.

```console
$ bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```

## `process.availableMemory()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает объём свободной памяти, ещё доступной процессу (в байтах).

Подробнее см. [`uv_get_available_memory`](https://docs.libuv.org/en/v1.x/misc.html#c.uv_get_available_memory).

## `process.channel`

Добавлено в: v7.1.0

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Если процесс Node.js запущен с IPC-каналом (см. документацию [Child Process](child_process.md)), свойство `process.channel` — ссылка на этот IPC-канал. Если IPC-канала нет, свойство равно `undefined`.

### `process.channel.ref()`

Этот метод заставляет IPC-канал удерживать цикл событий процесса, если ранее был вызван `.unref()`.

Обычно это регулируется числом слушателей `'disconnect'` и `'message'` на объекте `process`. Этот метод можно использовать для явного задания поведения.

### `process.channel.unref()`

Этот метод заставляет IPC-канал не удерживать цикл событий процесса и позволяет ему завершиться, даже если канал ещё открыт.

Обычно это регулируется числом слушателей `'disconnect'` и `'message'` на объекте `process`. Этот метод можно использовать для явного задания поведения.

## `process.chdir(directory)`

-   `directory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.chdir()` меняет текущий рабочий каталог процесса Node.js или выбрасывает исключение, если это не удаётся (например, если указанный `directory` не существует).

=== "MJS"

    ```js
    import { chdir, cwd } from 'node:process';

    console.log(`Starting directory: ${cwd()}`);
    try {
      chdir('/tmp');
      console.log(`New directory: ${cwd()}`);
    } catch (err) {
      console.error(`chdir: ${err}`);
    }
    ```

=== "CJS"

    ```js
    const { chdir, cwd } = require('node:process');

    console.log(`Starting directory: ${cwd()}`);
    try {
      chdir('/tmp');
      console.log(`New directory: ${cwd()}`);
    } catch (err) {
      console.error(`chdir: ${err}`);
    }
    ```

В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.config`

Добавлено в: v0.7.7

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.config` возвращает замороженный `Object` с JavaScript-представлением опций `configure`, использованных при сборке текущего исполняемого файла Node.js. Это соответствует файлу `config.gypi`, который получился при запуске `./configure`.

Пример возможного вывода:

```js
{
  target_defaults:
   { cflags: [],
     default_configuration: 'Release',
     defines: [],
     include_dirs: [],
     libraries: [] },
  variables:
   {
     host_arch: 'x64',
     napi_build_version: 5,
     node_install_npm: 'true',
     node_prefix: '',
     node_shared_cares: 'false',
     node_shared_http_parser: 'false',
     node_shared_libuv: 'false',
     node_shared_zlib: 'false',
     node_use_openssl: 'true',
     node_shared_openssl: 'false',
     target_arch: 'x64',
     v8_use_snapshot: 1
   }
}
```

## `process.connected`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если процесс Node.js запущен с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), свойство `process.connected` возвращает `true`, пока IPC-канал подключён, и `false` после вызова `process.disconnect()`.

Когда `process.connected` становится `false`, отправка сообщений по IPC через `process.send()` невозможна.

## `process.constrainedMemory()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает объём памяти, доступный процессу (в байтах), с учётом ограничений ОС. Если такого ограничения нет или оно неизвестно, возвращается `0`.

Подробнее см. [`uv_get_constrained_memory`](https://docs.libuv.org/en/v1.x/misc.html#c.uv_get_constrained_memory).

## `process.cpuUsage([previousValue])`

-   `previousValue` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) предыдущее значение, возвращённое вызовом `process.cpuUsage()`
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `user` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `system` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.cpuUsage()` возвращает пользовательское и системное время CPU текущего процесса в объекте со свойствами `user` и `system`; значения — микросекунды (миллионные доли секунды). Они отражают время в пользовательском и системном коде и могут превысить реальное прошедшее время, если несколько ядер обрабатывают работу этого процесса.

Результат предыдущего вызова `process.cpuUsage()` можно передать аргументом, чтобы получить разницу показаний.

=== "MJS"

    ```js
    import { cpuUsage } from 'node:process';

    const startUsage = cpuUsage();
    // { user: 38579, system: 6986 }

    // spin the CPU for 500 milliseconds
    const now = Date.now();
    while (Date.now() - now < 500);

    console.log(cpuUsage(startUsage));
    // { user: 514883, system: 11226 }
    ```

=== "CJS"

    ```js
    const { cpuUsage } = require('node:process');

    const startUsage = cpuUsage();
    // { user: 38579, system: 6986 }

    // spin the CPU for 500 milliseconds
    const now = Date.now();
    while (Date.now() - now < 500);

    console.log(cpuUsage(startUsage));
    // { user: 514883, system: 11226 }
    ```

## `process.cwd()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.cwd()` возвращает текущий рабочий каталог процесса Node.js.

=== "MJS"

    ```js
    import { cwd } from 'node:process';

    console.log(`Current directory: ${cwd()}`);
    ```

=== "CJS"

    ```js
    const { cwd } = require('node:process');

    console.log(`Current directory: ${cwd()}`);
    ```

## `process.debugPort`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Порт, который использует отладчик Node.js, когда он включён.

=== "MJS"

    ```js
    import process from 'node:process';

    process.debugPort = 5858;
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.debugPort = 5858;
    ```

## `process.disconnect()`

Если процесс Node.js запущен с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), метод `process.disconnect()` закрывает IPC-канал к родительскому процессу, позволяя дочернему завершиться корректно, когда больше нет соединений, удерживающих его.

Эффект такой же, как у вызова [`ChildProcess.disconnect()`](child_process.md#subprocessdisconnect) из родительского процесса.

Если процесс Node.js не был запущен с IPC-каналом, `process.disconnect()` будет `undefined`.

## `process.dlopen(module, filename[, flags])`

Добавлено в: v0.1.16

-   `module` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `flags` [`<os.constants.dlopen>`](os.md#dlopen-constants) **По умолчанию:** `os.constants.dlopen.RTLD_LAZY`

Метод `process.dlopen()` динамически загружает разделяемые объекты. В основном он используется `require()` для загрузки C++-аддонов; напрямую вызывать его не следует, кроме особых случаев. Иначе говоря, предпочтительнее [`require()`](globals.md#require), если нет причин вроде особых флагов dlopen или загрузки из ES-модулей.

Аргумент `flags` — целое число, задающее поведение dlopen. Подробности см. в [`os.constants.dlopen`](os.md#dlopen-constants).

При вызове `process.dlopen()` нужно передать экземпляр `module`. Экспортируемые C++-аддоном функции затем доступны через `module.exports`.

Ниже показана загрузка C++-аддона `local.node`, экспортирующего функцию `foo`. Все символы загружаются до возврата из вызова за счёт константы `RTLD_NOW`. В примере предполагается, что константа доступна.

=== "MJS"

    ```js
    import { dlopen } from 'node:process';
    import { constants } from 'node:os';
    import { fileURLToPath } from 'node:url';

    const module = { exports: {} };
    dlopen(module, fileURLToPath(new URL('local.node', import.meta.url)),
           constants.dlopen.RTLD_NOW);
    module.exports.foo();
    ```

=== "CJS"

    ```js
    const { dlopen } = require('node:process');
    const { constants } = require('node:os');
    const { join } = require('node:path');

    const module = { exports: {} };
    dlopen(module, join(__dirname, 'local.node'), constants.dlopen.RTLD_NOW);
    module.exports.foo();
    ```

## `process.emitWarning(warning[, options])`

-   `warning` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) предупреждение для выдачи
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если `warning` — строка, `type` задаёт имя _типа_ предупреждения. **По умолчанию:** `'Warning'`.
    -   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) уникальный идентификатор экземпляра предупреждения
    -   `ctor` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) если `warning` — строка, `ctor` — необязательная функция, ограничивающая глубину стека. **По умолчанию:** `process.emitWarning`.
    -   `detail` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) дополнительный текст к ошибке

Метод `process.emitWarning()` выдаёт пользовательские или прикладные предупреждения процесса. На них можно подписаться обработчиком события [`'warning'`](#event-warning).

=== "MJS"

    ```js
    import { emitWarning } from 'node:process';

    // Emit a warning with a code and additional detail.
    emitWarning('Something happened!', {
      code: 'MY_WARNING',
      detail: 'This is some additional information',
    });
    // Emits:
    // (node:56338) [MY_WARNING] Warning: Something happened!
    // This is some additional information
    ```

=== "CJS"

    ```js
    const { emitWarning } = require('node:process');

    // Emit a warning with a code and additional detail.
    emitWarning('Something happened!', {
      code: 'MY_WARNING',
      detail: 'This is some additional information',
    });
    // Emits:
    // (node:56338) [MY_WARNING] Warning: Something happened!
    // This is some additional information
    ```

В этом примере объект `Error` создаётся внутри `process.emitWarning()` и передаётся обработчику [`'warning'`](#event-warning).

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('warning', (warning) => {
      console.warn(warning.name);    // 'Warning'
      console.warn(warning.message); // 'Something happened!'
      console.warn(warning.code);    // 'MY_WARNING'
      console.warn(warning.stack);   // Stack trace
      console.warn(warning.detail);  // 'This is some additional information'
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('warning', (warning) => {
      console.warn(warning.name);    // 'Warning'
      console.warn(warning.message); // 'Something happened!'
      console.warn(warning.code);    // 'MY_WARNING'
      console.warn(warning.stack);   // Stack trace
      console.warn(warning.detail);  // 'This is some additional information'
    });
    ```

Если `warning` передан как объект `Error`, аргумент `options` игнорируется.

## `process.emitWarning(warning[, type[, code]][, ctor])`

-   `warning` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) предупреждение для выдачи
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) если `warning` — строка, `type` задаёт имя _типа_ предупреждения. **По умолчанию:** `'Warning'`.
-   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) уникальный идентификатор экземпляра предупреждения
-   `ctor` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) если `warning` — строка, `ctor` — необязательная функция, ограничивающая глубину стека. **По умолчанию:** `process.emitWarning`.

Метод `process.emitWarning()` выдаёт пользовательские или прикладные предупреждения процесса. На них можно подписаться обработчиком события [`'warning'`](#event-warning).

=== "MJS"

    ```js
    import { emitWarning } from 'node:process';

    // Emit a warning using a string.
    emitWarning('Something happened!');
    // Emits: (node: 56338) Warning: Something happened!
    ```

=== "CJS"

    ```js
    const { emitWarning } = require('node:process');

    // Emit a warning using a string.
    emitWarning('Something happened!');
    // Emits: (node: 56338) Warning: Something happened!
    ```

---

=== "MJS"

    ```js
    import { emitWarning } from 'node:process';

    // Emit a warning using a string and a type.
    emitWarning('Something Happened!', 'CustomWarning');
    // Emits: (node:56338) CustomWarning: Something Happened!
    ```

=== "CJS"

    ```js
    const { emitWarning } = require('node:process');

    // Emit a warning using a string and a type.
    emitWarning('Something Happened!', 'CustomWarning');
    // Emits: (node:56338) CustomWarning: Something Happened!
    ```

---

=== "MJS"

    ```js
    import { emitWarning } from 'node:process';

    emitWarning('Something happened!', 'CustomWarning', 'WARN001');
    // Emits: (node:56338) [WARN001] CustomWarning: Something happened!
    ```

=== "CJS"

    ```js
    const { emitWarning } = require('node:process');

    process.emitWarning('Something happened!', 'CustomWarning', 'WARN001');
    // Emits: (node:56338) [WARN001] CustomWarning: Something happened!
    ```

Во всех предыдущих примерах объект `Error` создаётся внутри `process.emitWarning()` и передаётся обработчику [`'warning'`](#event-warning).

=== "MJS"

    ```js
    import process from 'node:process';

    process.on('warning', (warning) => {
      console.warn(warning.name);
      console.warn(warning.message);
      console.warn(warning.code);
      console.warn(warning.stack);
    });
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('warning', (warning) => {
      console.warn(warning.name);
      console.warn(warning.message);
      console.warn(warning.code);
      console.warn(warning.stack);
    });
    ```

Если `warning` передан как `Error`, он попадает в обработчик `'warning'` без изменений (а необязательные аргументы `type`, `code` и `ctor` игнорируются):

=== "MJS"

    ```js
    import { emitWarning } from 'node:process';

    // Emit a warning using an Error object.
    const myWarning = new Error('Something happened!');
    // Use the Error name property to specify the type name
    myWarning.name = 'CustomWarning';
    myWarning.code = 'WARN001';

    emitWarning(myWarning);
    // Emits: (node:56338) [WARN001] CustomWarning: Something happened!
    ```

=== "CJS"

    ```js
    const { emitWarning } = require('node:process');

    // Emit a warning using an Error object.
    const myWarning = new Error('Something happened!');
    // Use the Error name property to specify the type name
    myWarning.name = 'CustomWarning';
    myWarning.code = 'WARN001';

    emitWarning(myWarning);
    // Emits: (node:56338) [WARN001] CustomWarning: Something happened!
    ```

Выбрасывается `TypeError`, если `warning` не строка и не объект `Error`.

Хотя предупреждения процесса используют объекты `Error`, механизм предупреждений **не** заменяет обычную обработку ошибок.

Если тип предупреждения `type` равен `'DeprecationWarning'`, действует дополнительная логика:

-   при флаге `--throw-deprecation` предупреждение об устаревании выбрасывается как исключение, а не как событие;
-   при флаге `--no-deprecation` оно подавляется;
-   при флаге `--trace-deprecation` оно выводится в `stderr` вместе с полным стеком.

### Избежание дублирования предупреждений

Рекомендуется выдавать предупреждение не более одного раза за процесс: оберните `emitWarning()` проверкой булева флага.

=== "MJS"

    ```js
    import { emitWarning } from 'node:process';

    function emitMyWarning() {
      if (!emitMyWarning.warned) {
        emitMyWarning.warned = true;
        emitWarning('Only warn once!');
      }
    }
    emitMyWarning();
    // Emits: (node: 56339) Warning: Only warn once!
    emitMyWarning();
    // Emits nothing
    ```

=== "CJS"

    ```js
    const { emitWarning } = require('node:process');

    function emitMyWarning() {
      if (!emitMyWarning.warned) {
        emitMyWarning.warned = true;
        emitWarning('Only warn once!');
      }
    }
    emitMyWarning();
    // Emits: (node: 56339) Warning: Only warn once!
    emitMyWarning();
    // Emits nothing
    ```

## `process.env`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.env` возвращает объект с пользовательским окружением. См. environ(7).

Пример такого объекта:

```js
{
  TERM: 'xterm-256color',
  SHELL: '/usr/local/bin/bash',
  USER: 'maciej',
  PATH: '~/.bin/:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
  PWD: '/Users/maciej',
  EDITOR: 'vim',
  SHLVL: '1',
  HOME: '/Users/maciej',
  LOGNAME: 'maciej',
  _: '/usr/local/bin/node'
}
```

Объект можно менять, но изменения не видны за пределами процесса Node.js и (если явно не запрошено иное) другим потокам [`Worker`](worker_threads.md#class-worker). Другими словами, так не сработает:

```bash
node -e 'process.env.foo = "bar"' && echo $foo
```

а так сработает:

=== "MJS"

    ```js
    import { env } from 'node:process';

    env.foo = 'bar';
    console.log(env.foo);
    ```

=== "CJS"

    ```js
    const { env } = require('node:process');

    env.foo = 'bar';
    console.log(env.foo);
    ```

Присвоение свойства в `process.env` неявно приводит значение к строке. **Такое поведение устарело.** В будущих версиях Node.js может выбрасываться ошибка, если значение не строка, число или логическое.

=== "MJS"

    ```js
    import { env } from 'node:process';

    env.test = null;
    console.log(env.test);
    // => 'null'
    env.test = undefined;
    console.log(env.test);
    // => 'undefined'
    ```

=== "CJS"

    ```js
    const { env } = require('node:process');

    env.test = null;
    console.log(env.test);
    // => 'null'
    env.test = undefined;
    console.log(env.test);
    // => 'undefined'
    ```

Чтобы удалить свойство из `process.env`, используйте `delete`.

=== "MJS"

    ```js
    import { env } from 'node:process';

    env.TEST = 1;
    delete env.TEST;
    console.log(env.TEST);
    // => undefined
    ```

=== "CJS"

    ```js
    const { env } = require('node:process');

    env.TEST = 1;
    delete env.TEST;
    console.log(env.TEST);
    // => undefined
    ```

В Windows переменные окружения нечувствительны к регистру.

=== "MJS"

    ```js
    import { env } from 'node:process';

    env.TEST = 1;
    console.log(env.test);
    // => 1
    ```

=== "CJS"

    ```js
    const { env } = require('node:process');

    env.TEST = 1;
    console.log(env.test);
    // => 1
    ```

Если при создании [`Worker`](worker_threads.md#class-worker) не указано иное, у каждого потока [`Worker`](worker_threads.md#class-worker) своя копия `process.env` на основе родительского `process.env` или значения опции `env` конструктора [`Worker`](worker_threads.md#class-worker). Изменения `process.env` не видны между потоками [`Worker`](worker_threads.md#class-worker); только главный поток может менять окружение так, чтобы это было видно ОС или нативным аддонам. В Windows копия `process.env` в [`Worker`](worker_threads.md#class-worker) ведёт себя с учётом регистра иначе, чем в главном потоке.

## `process.execArgv`

-   Тип: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.execArgv` возвращает набор специфичных для Node.js опций командной строки, переданных при запуске процесса. Они не попадают в массив [`process.argv`](#processargv) и не включают исполняемый файл Node.js, имя сценария и опции после имени сценария. Эти опции удобны, чтобы порождать дочерние процессы с тем же окружением выполнения, что у родителя.

```bash
node --icu-data-dir=./foo --require ./bar.js script.js --version
```

В результате `process.execArgv`:

```json
["--icu-data-dir=./foo", "--require", "./bar.js"]
```

And `process.argv`:

```js
['/usr/local/bin/node', 'script.js', '--version'];
```

Подробное поведение потоков worker с этим свойством см. в [`Worker` constructor](worker_threads.md#new-workerfilename-options).

## `process.execPath`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.execPath` возвращает абсолютный путь к исполняемому файлу, запустившему процесс Node.js. Символические ссылки, если есть, разрешаются.

```js
'/usr/local/bin/node';

```

## `process.execve(file[, args[, env]])`

> Стабильность: 1 — экспериментально

-   `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя или путь исполняемого файла
-   `args` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) список строковых аргументов. Ни один не может содержать нулевой байт (`\u0000`).
-   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) пары ключ–значение окружения. Ни ключ, ни значение не могут содержать нулевой байт (`\u0000`). **По умолчанию:** `process.env`.

Заменяет текущий процесс новым.

Это делается через POSIX-функцию `execve`, поэтому память и прочие ресурсы текущего процесса не сохраняются, кроме стандартного ввода, стандартного вывода и стандартного потока ошибок.

Остальные ресурсы система освобождает при смене процесса без событий `exit`/`close` и без обработчиков очистки.

Функция не возвращает управление, если не произошла ошибка.

Недоступна в Windows и на IBM i.

## `process.exit([code])` {#processexitcode}

-   `code` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined код выхода. Для строки допускаются только целочисленные строки (например `'1'`). **По умолчанию:** `0`.

Метод `process.exit()` завершает процесс синхронно со статусом `code`. Если `code` не указан, используется код успеха `0` или значение `process.exitCode`, если оно задано. Node.js не завершится, пока не отработают все слушатели [`'exit'`](#event-exit).

Выход с кодом «ошибки»:

=== "MJS"

    ```js
    import { exit } from 'node:process';

    exit(1);
    ```

=== "CJS"

    ```js
    const { exit } = require('node:process');

    exit(1);
    ```

Оболочка, запустившая Node.js, должна получить код выхода `1`.

Вызов `process.exit()` заставляет процесс завершиться как можно скорее, даже если ещё есть незавершённые асинхронные операции, в том числе ввод-вывод в `process.stdout` и `process.stderr`.

Чаще всего `process.exit()` вызывать не нужно: процесс Node.js завершится сам, если в цикле событий _нет дополнительной работы_. Свойство `process.exitCode` задаёт код при корректном завершении.

Ниже пример _неправильного_ использования `process.exit()`, из-за которого вывод в stdout может обрезаться и потеряться:

=== "MJS"

    ```js
    import { exit } from 'node:process';

    // This is an example of what *not* to do:
    if (someConditionNotMet()) {
      printUsageToStdout();
      exit(1);
    }
    ```

=== "CJS"

    ```js
    const { exit } = require('node:process');

    // This is an example of what *not* to do:
    if (someConditionNotMet()) {
      printUsageToStdout();
      exit(1);
    }
    ```

Проблема в том, что запись в `process.stdout` в Node.js иногда _асинхронна_ и может растягиваться на несколько тиков цикла событий. `process.exit()` же завершает процесс _до_ того, как эти записи успеют выполниться.

Вместо прямого `process.exit()` код _должен_ задать `process.exitCode` и дать процессу завершиться естественно, не планируя новой работы в цикле событий:

=== "MJS"

    ```js
    import process from 'node:process';

    // How to properly set the exit code while letting
    // the process exit gracefully.
    if (someConditionNotMet()) {
      printUsageToStdout();
      process.exitCode = 1;
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    // How to properly set the exit code while letting
    // the process exit gracefully.
    if (someConditionNotMet()) {
      printUsageToStdout();
      process.exitCode = 1;
    }
    ```

Если нужно завершить процесс из-за ошибки, безопаснее выбросить _необработанную_ ошибку и дать процессу завершиться, чем вызывать `process.exit()`.

В потоках [`Worker`](worker_threads.md#class-worker) эта функция останавливает текущий поток, а не процесс.

## `process.exitCode` {#processexitcode_1}

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | null | undefined код выхода. Для строки допускаются только целочисленные строки (например `'1'`). **По умолчанию:** `undefined`.

Число, которое станет кодом выхода при корректном завершении или при вызове [`process.exit()`](#processexitcode) без явного кода.

Значение `process.exitCode` можно задать присваиванием или аргументом [`process.exit()`](#processexitcode):

```console
$ node -e 'process.exitCode = 9'; echo $?
9
$ node -e 'process.exit(42)'; echo $?
42
$ node -e 'process.exitCode = 9; process.exit(42)'; echo $?
42
```

Node.js может задать значение неявно при неустранимых ошибках (например при незавершённом top-level `await`). Явно заданный код выхода всегда имеет приоритет над неявным:

```console
$ node --input-type=module -e 'await new Promise(() => {})'; echo $?
13
$ node --input-type=module -e 'process.exitCode = 9; await new Promise(() => {})'; echo $?
9
```

## `process.features.cached_builtins`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если текущая сборка Node.js кэширует встроенные модули.

## `process.features.debug`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если текущая сборка Node.js — отладочная.

## `process.features.inspector`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если текущая сборка Node.js включает инспектор.

## `process.features.ipv6`

> Стабильность: 0 — устарело. Свойство всегда `true`, проверки по нему избыточны.

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js поддерживает IPv6.

Во всех сборках Node.js есть поддержка IPv6, поэтому значение всегда `true`.

## `process.features.require_module`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js поддерживает [загрузку ECMAScript-модулей через `require()`](modules.md#loading-ecmascript-modules-using-require).

## `process.features.tls`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js включает поддержку TLS.

## `process.features.tls_alpn`

> Стабильность: 0 — устарело. Используйте `process.features.tls`.

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js поддерживает ALPN в TLS.

Начиная с Node.js 11.0.0 зависимости OpenSSL дают безусловную поддержку ALPN, поэтому значение совпадает с `process.features.tls`.

## `process.features.tls_ocsp`

> Стабильность: 0 — устарело. Используйте `process.features.tls`.

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js поддерживает OCSP в TLS.

Начиная с Node.js 11.0.0 зависимости OpenSSL дают безусловную поддержку OCSP, поэтому значение совпадает с `process.features.tls`.

## `process.features.tls_sni`

> Стабильность: 0 — устарело. Используйте `process.features.tls`.

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js поддерживает SNI в TLS.

Начиная с Node.js 11.0.0 зависимости OpenSSL дают безусловную поддержку SNI, поэтому значение совпадает с `process.features.tls`.

## `process.features.typescript`

> Стабильность: 1.2 — кандидат в релиз

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

По умолчанию значение `"strip"`, и `false`, если Node.js запущен с `--no-strip-types`.

## `process.features.uv`

> Стабильность: 0 — устарело. Свойство всегда `true`, проверки по нему избыточны.

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Логическое значение: `true`, если сборка Node.js включает поддержку libuv.

Node.js без libuv не собирается, поэтому значение всегда `true`.

## `process.finalization.register(ref, callback)`

> Стабильность: 1.1 — активная разработка

-   `ref` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ссылка на отслеживаемый ресурс
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция обратного вызова при финализации ресурса
    -   `ref` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ссылка на отслеживаемый ресурс
    -   `event` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) событие, вызвавшее финализацию. По умолчанию `'exit'`.

Функция регистрирует обратный вызов при событии `exit` процесса, если объект `ref` не был собран сборщиком мусора. Если `ref` собран до события `exit`, запись удаляется из реестра финализации, и при выходе процесса callback не вызывается.

В callback можно освободить ресурсы, выделенные под `ref`. Учтите: к функции `callback` применяются те же ограничения, что и к событию `beforeExit`, — в особых случаях callback может не вызваться.

Идея функции — помочь освободить ресурсы при начале завершения процесса и при этом дать объекту быть собранным, если он больше не используется.

Например, можно зарегистрировать объект с буфером: нужно гарантировать освобождение буфера при выходе процесса; если объект собран раньше, буфер отдельно освобождать не нужно — запись просто убирается из реестра финализации.

=== "CJS"

    ```js
    const { finalization } = require('node:process');

    // Please make sure that the function passed to finalization.register()
    // does not create a closure around unnecessary objects.
    function onFinalize(obj, event) {
      // You can do whatever you want with the object
      obj.dispose();
    }

    function setup() {
      // This object can be safely garbage collected,
      // and the resulting shutdown function will not be called.
      // There are no leaks.
      const myDisposableObject = {
        dispose() {
          // Free your resources synchronously
        },
      };

      finalization.register(myDisposableObject, onFinalize);
    }

    setup();
    ```

=== "MJS"

    ```js
    import { finalization } from 'node:process';

    // Please make sure that the function passed to finalization.register()
    // does not create a closure around unnecessary objects.
    function onFinalize(obj, event) {
      // You can do whatever you want with the object
      obj.dispose();
    }

    function setup() {
      // This object can be safely garbage collected,
      // and the resulting shutdown function will not be called.
      // There are no leaks.
      const myDisposableObject = {
        dispose() {
          // Free your resources synchronously
        },
      };

      finalization.register(myDisposableObject, onFinalize);
    }

    setup();
    ```

Приведённый код опирается на такие условия:

-   не используются стрелочные функции;
-   обычные функции лучше держать в глобальном контексте (корне).

Обычная функция _может_ захватывать контекст, где живёт `obj`, и мешать сборке `obj`.

Стрелочная функция сохраняет внешний контекст. Например:

```js
class Test {
    constructor() {
        finalization.register(this, (ref) => ref.dispose());

        // Even something like this is highly discouraged
        // finalization.register(this, () => this.dispose());
    }
    dispose() {}
}
```

Маловероятно (но не невозможно), что этот объект соберут; если нет — `dispose` вызовут при `process.exit`.

Не полагайтесь на этот механизм для критичных ресурсов: callback не гарантирован во всех ситуациях.

## `process.finalization.registerBeforeExit(ref, callback)`

> Стабильность: 1.1 — активная разработка

-   `ref` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ссылка на отслеживаемый ресурс
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) функция обратного вызова при финализации ресурса
    -   `ref` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ссылка на отслеживаемый ресурс
    -   `event` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) событие, вызвавшее финализацию. По умолчанию `'beforeExit'`.

Ведёт себя как `register`, но callback вызывается при событии `beforeExit`, если объект `ref` не был собран сборщиком мусора.

К `callback` применяются те же ограничения, что и к `beforeExit`; в особых случаях он может не вызваться.

## `process.finalization.unregister(ref)`

> Стабильность: 1.1 — активная разработка

-   `ref` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) ссылка на ранее зарегистрированный ресурс

Удаляет регистрацию объекта из реестра финализации, чтобы callback больше не вызывался.

=== "CJS"

    ```js
    const { finalization } = require('node:process');

    // Please make sure that the function passed to finalization.register()
    // does not create a closure around unnecessary objects.
    function onFinalize(obj, event) {
      // You can do whatever you want with the object
      obj.dispose();
    }

    function setup() {
      // This object can be safely garbage collected,
      // and the resulting shutdown function will not be called.
      // There are no leaks.
      const myDisposableObject = {
        dispose() {
          // Free your resources synchronously
        },
      };

      finalization.register(myDisposableObject, onFinalize);

      // Do something

      myDisposableObject.dispose();
      finalization.unregister(myDisposableObject);
    }

    setup();
    ```

=== "MJS"

    ```js
    import { finalization } from 'node:process';

    // Please make sure that the function passed to finalization.register()
    // does not create a closure around unnecessary objects.
    function onFinalize(obj, event) {
      // You can do whatever you want with the object
      obj.dispose();
    }

    function setup() {
      // This object can be safely garbage collected,
      // and the resulting shutdown function will not be called.
      // There are no leaks.
      const myDisposableObject = {
        dispose() {
          // Free your resources synchronously
        },
      };

      // Please make sure that the function passed to finalization.register()
      // does not create a closure around unnecessary objects.
      function onFinalize(obj, event) {
        // You can do whatever you want with the object
        obj.dispose();
      }

      finalization.register(myDisposableObject, onFinalize);

      // Do something

      myDisposableObject.dispose();
      finalization.unregister(myDisposableObject);
    }

    setup();
    ```

## `process.getActiveResourcesInfo()`

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.getActiveResourcesInfo()` возвращает массив строк с типами активных ресурсов, которые сейчас удерживают цикл событий.

=== "MJS"

    ```js
    import { getActiveResourcesInfo } from 'node:process';
    import { setTimeout } from 'node:timers';

    console.log('Before:', getActiveResourcesInfo());
    setTimeout(() => {}, 1000);
    console.log('After:', getActiveResourcesInfo());
    // Вывод:
    //   Before: [ 'CloseReq', 'TTYWrap', 'TTYWrap', 'TTYWrap' ]
    //   After: [ 'CloseReq', 'TTYWrap', 'TTYWrap', 'TTYWrap', 'Timeout' ]
    ```

=== "CJS"

    ```js
    const { getActiveResourcesInfo } = require('node:process');
    const { setTimeout } = require('node:timers');

    console.log('Before:', getActiveResourcesInfo());
    setTimeout(() => {}, 1000);
    console.log('After:', getActiveResourcesInfo());
    // Вывод:
    //   Before: [ 'TTYWrap', 'TTYWrap', 'TTYWrap' ]
    //   After: [ 'TTYWrap', 'TTYWrap', 'TTYWrap', 'Timeout' ]
    ```

## `process.getBuiltinModule(id)`

-   `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) идентификатор запрашиваемого встроенного модуля
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | undefined

`process.getBuiltinModule(id)` позволяет загружать встроенные модули через глобально доступную функцию. ES-модули, которые должны работать и вне Node.js, могут условно подключать встроенный модуль Node.js при запуске в Node.js, не ловя ошибку разрешения `import` вне Node.js и не переходя на динамический `import()`, который делает модуль асинхронным или API — асинхронным.

=== "MJS"

    ```js
    if (globalThis.process?.getBuiltinModule) {
      // Run in Node.js, use the Node.js fs module.
      const fs = globalThis.process.getBuiltinModule('fs');
      // If `require()` is needed to load user-modules, use createRequire()
      const module = globalThis.process.getBuiltinModule('module');
      const require = module.createRequire(import.meta.url);
      const foo = require('foo');
    }
    ```

Если `id` задаёт встроенный модуль, доступный в текущем процессе Node.js, `process.getBuiltinModule(id)` возвращает соответствующий встроенный модуль. Если такого встроенного модуля нет, возвращается `undefined`.

`process.getBuiltinModule(id)` принимает идентификаторы, которые распознаёт [`module.isBuiltin(id)`](module.md#moduleisbuiltinmodulename). Некоторые модули нужно загружать с префиксом `node:`, см. [встроенные модули с обязательным префиксом `node:`](modules.md#built-in-modules-with-mandatory-node-prefix). Ссылки, возвращаемые `process.getBuiltinModule(id)`, всегда указывают на встроенный модуль для `id`, даже если пользователь меняет [`require.cache`](modules.md#requirecache) так, что `require(id)` возвращает другое.

## `process.getegid()`

Метод `process.getegid()` возвращает числовой эффективный идентификатор группы процесса Node.js. См. getegid(2).

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getegid) {
      console.log(`Current gid: ${process.getegid()}`);
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getegid) {
      console.log(`Current gid: ${process.getegid()}`);
    }
    ```

Доступно только на POSIX (не в Windows и не в Android).

## `process.geteuid()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `process.geteuid()` возвращает числовой эффективный идентификатор пользователя процесса. См. geteuid(2).

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.geteuid) {
      console.log(`Current uid: ${process.geteuid()}`);
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.geteuid) {
      console.log(`Current uid: ${process.geteuid()}`);
    }
    ```

Доступно только на POSIX (не в Windows и не в Android).

## `process.getgid()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `process.getgid()` возвращает числовой идентификатор группы процесса. См. getgid(2).

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getgid) {
      console.log(`Current gid: ${process.getgid()}`);
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getgid) {
      console.log(`Current gid: ${process.getgid()}`);
    }
    ```

Доступно только на POSIX (не в Windows и не в Android).

## `process.getgroups()`

-   Возвращает: [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.getgroups()` возвращает массив дополнительных идентификаторов групп. В POSIX не уточняется, входит ли эффективный GID, но Node.js всегда включает его.

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getgroups) {
      console.log(process.getgroups()); // [ 16, 21, 297 ]
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getgroups) {
      console.log(process.getgroups()); // [ 16, 21, 297 ]
    }
    ```

Доступно только на POSIX (не в Windows и не в Android).

## `process.getuid()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.getuid()` возвращает числовой идентификатор пользователя процесса. См. getuid(2).

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getuid) {
      console.log(`Current uid: ${process.getuid()}`);
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getuid) {
      console.log(`Current uid: ${process.getuid()}`);
    }
    ```

Недоступно в Windows.

## `process.hasUncaughtExceptionCaptureCallback()`

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Показывает, задан ли callback через [`process.setUncaughtExceptionCaptureCallback()`](#processsetuncaughtexceptioncapturecallbackfn).

## `process.hrtime([time])`

> Стабильность: 3 — устаревшее. Используйте [`process.hrtime.bigint()`](#processhrtimebigint).

-   `time` [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) результат предыдущего вызова `process.hrtime()`
-   Возвращает: [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Устаревший вариант [`process.hrtime.bigint()`](#processhrtimebigint) до появления `bigint` в JavaScript.

Метод `process.hrtime()` возвращает текущее высокоточное монотонное время как кортеж `[seconds, nanoseconds]` в массиве, где `nanoseconds` — остаток, не выражаемый целыми секундами.

`time` — необязательный параметр: результат предыдущего `process.hrtime()` для разницы с текущим моментом. Если передан не кортеж-массив, выбрасывается `TypeError`. Произвольный массив вместо результата предыдущего вызова ведёт к неопределённому поведению.

Время отсчитывается от произвольной точки в прошлом, не связано с календарём и не зависит от сдвига часов. Обычно используется для замеров интервалов:

=== "MJS"

    ```js
    import { hrtime } from 'node:process';

    const NS_PER_SEC = 1e9;
    const time = hrtime();
    // [ 1800216, 25 ]

    setTimeout(() => {
      const diff = hrtime(time);
      // [ 1, 552 ]

      console.log(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
      // Benchmark took 1000000552 nanoseconds
    }, 1000);
    ```

=== "CJS"

    ```js
    const { hrtime } = require('node:process');

    const NS_PER_SEC = 1e9;
    const time = hrtime();
    // [ 1800216, 25 ]

    setTimeout(() => {
      const diff = hrtime(time);
      // [ 1, 552 ]

      console.log(`Benchmark took ${diff[0] * NS_PER_SEC + diff[1]} nanoseconds`);
      // Benchmark took 1000000552 nanoseconds
    }, 1000);
    ```

## `process.hrtime.bigint()`

-   Возвращает: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

Вариант [`process.hrtime()`](#processhrtimetime) на `bigint`: текущее высокоточное время в наносекундах.

В отличие от [`process.hrtime()`](#processhrtimetime), дополнительного аргумента `time` нет — разницу считают вычитанием двух `bigint`.

=== "MJS"

    ```js
    import { hrtime } from 'node:process';

    const start = hrtime.bigint();
    // 191051479007711n

    setTimeout(() => {
      const end = hrtime.bigint();
      // 191052633396993n

      console.log(`Benchmark took ${end - start} nanoseconds`);
      // Benchmark took 1154389282 nanoseconds
    }, 1000);
    ```

=== "CJS"

    ```js
    const { hrtime } = require('node:process');

    const start = hrtime.bigint();
    // 191051479007711n

    setTimeout(() => {
      const end = hrtime.bigint();
      // 191052633396993n

      console.log(`Benchmark took ${end - start} nanoseconds`);
      // Benchmark took 1154389282 nanoseconds
    }, 1000);
    ```

## `process.initgroups(user, extraGroup)`

-   `user` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) имя пользователя или числовой идентификатор
-   `extraGroup` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) имя группы или числовой идентификатор

Метод `process.initgroups()` читает `/etc/group` и инициализирует список групп доступа, включая все группы, в которых состоит пользователь. Это привилегированная операция: процесс Node.js должен работать от `root` или с возможностью `CAP_SETGID`.

Будьте осторожны при снижении привилегий:

=== "MJS"

    ```js
    import { getgroups, initgroups, setgid } from 'node:process';

    console.log(getgroups());         // [ 0 ]
    initgroups('nodeuser', 1000);     // switch user
    console.log(getgroups());         // [ 27, 30, 46, 1000, 0 ]
    setgid(1000);                     // drop root gid
    console.log(getgroups());         // [ 27, 30, 46, 1000 ]
    ```

=== "CJS"

    ```js
    const { getgroups, initgroups, setgid } = require('node:process');

    console.log(getgroups());         // [ 0 ]
    initgroups('nodeuser', 1000);     // switch user
    console.log(getgroups());         // [ 27, 30, 46, 1000, 0 ]
    setgid(1000);                     // drop root gid
    console.log(getgroups());         // [ 27, 30, 46, 1000 ]
    ```

Доступно только на POSIX (не в Windows и не в Android). В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.kill(pid[, signal])`

-   `pid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) идентификатор процесса
-   `signal` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) сигнал строкой или числом. **По умолчанию:** `'SIGTERM'`.

Метод `process.kill()` отправляет сигнал `signal` процессу `pid`.

Имена сигналов — строки вроде `'SIGINT'` или `'SIGHUP'`. См. [события сигналов](#signal-events) и kill(2).

Метод выбрасывает ошибку, если целевой `pid` не существует. Особый случай: сигнал `0` можно использовать для проверки существования процесса. В Windows будет ошибка, если `pid` используется для завершения группы процессов.

Несмотря на имя `process.kill()`, это по сути отправка сигнала, как в системном вызове `kill`; эффект может быть не только в завершении процесса.

=== "MJS"

    ```js
    import process, { kill } from 'node:process';

    process.on('SIGHUP', () => {
      console.log('Got SIGHUP signal.');
    });

    setTimeout(() => {
      console.log('Exiting.');
      process.exit(0);
    }, 100);

    kill(process.pid, 'SIGHUP');
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    process.on('SIGHUP', () => {
      console.log('Got SIGHUP signal.');
    });

    setTimeout(() => {
      console.log('Exiting.');
      process.exit(0);
    }, 100);

    process.kill(process.pid, 'SIGHUP');
    ```

При получении `SIGUSR1` процессом Node.js запускается отладчик. См. [события сигналов](#signal-events).

## `process.loadEnvFile(path)`

-   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) | [`<Buffer>`](buffer.md#buffer) | undefined. **По умолчанию:** `'./.env'`

Загружает файл `.env` в `process.env`. Использование `NODE_OPTIONS` в `.env` на Node.js не действует.

=== "CJS"

    ```js
    const { loadEnvFile } = require('node:process');
    loadEnvFile();
    ```

=== "MJS"

    ```js
    import { loadEnvFile } from 'node:process';
    loadEnvFile();
    ```

## `process.mainModule`

> Стабильность: 0 — устарело. Используйте [`require.main`](modules.md#accessing-the-main-module).

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.mainModule` — другой способ получить [`require.main`](modules.md#accessing-the-main-module). Если главный модуль меняется во время выполнения, [`require.main`](modules.md#accessing-the-main-module) в модулях, подключённых до смены, может по-прежнему указывать на старый главный модуль. Обычно можно считать, что оба указывают на один и тот же модуль.

Как и [`require.main`](modules.md#accessing-the-main-module), `process.mainModule` будет `undefined`, если нет точки входа.

## `process.memoryUsage()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `rss` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `heapTotal` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `heapUsed` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `external` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `arrayBuffers` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает объект с описанием использования памяти процессом Node.js в байтах.

=== "MJS"

    ```js
    import { memoryUsage } from 'node:process';

    console.log(memoryUsage());
    // Prints:
    // {
    //  rss: 4935680,
    //  heapTotal: 1826816,
    //  heapUsed: 650472,
    //  external: 49879,
    //  arrayBuffers: 9386
    // }
    ```

=== "CJS"

    ```js
    const { memoryUsage } = require('node:process');

    console.log(memoryUsage());
    // Prints:
    // {
    //  rss: 4935680,
    //  heapTotal: 1826816,
    //  heapUsed: 650472,
    //  external: 49879,
    //  arrayBuffers: 9386
    // }
    ```

-   `heapTotal` и `heapUsed` — память V8.
-   `external` — память C++-объектов, привязанных к JS-объектам под управлением V8.
-   `rss` (resident set size) — объём в основной памяти (подмножество всей выделенной) для процесса, включая C++ и JavaScript объекты и код.
-   `arrayBuffers` — память под `ArrayBuffer` и `SharedArrayBuffer`, включая все [`Buffer`](buffer.md) Node.js. Учитывается также в `external`. Во встраиваемой библиотеке значение может быть `0`, если выделения под `ArrayBuffer` не отслеживаются.

В потоках [`Worker`](worker_threads.md#class-worker) `rss` относится ко всему процессу, остальные поля — к текущему потоку.

Метод `process.memoryUsage()` обходит страницы памяти; на больших объёмах это может быть медленно.

### Замечание о process.memoryUsage

На Linux и системах с glibc приложение может наблюдать рост `rss` при стабильном `heapTotal` из-за фрагментации в `malloc` glibc. См. [nodejs/node#21973](https://github.com/nodejs/node/issues/21973) про альтернативную реализацию `malloc` и влияние на производительность.

## `process.memoryUsage.rss()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.memoryUsage.rss()` возвращает целое число — RSS в байтах.

RSS — объём в основной памяти (подмножество всей выделенной) для процесса, включая C++ и JavaScript объекты и код.

То же значение, что поле `rss` у `process.memoryUsage()`, но быстрее.

=== "MJS"

    ```js
    import { memoryUsage } from 'node:process';

    console.log(memoryUsage.rss());
    // 35655680
    ```

=== "CJS"

    ```js
    const { memoryUsage } = require('node:process');

    console.log(memoryUsage.rss());
    // 35655680
    ```

## `process.nextTick(callback[, ...args])`

> Стабильность: 3 — устаревшее. Используйте [`queueMicrotask()`](globals.md#queuemicrotaskcallback).

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `...args` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) дополнительные аргументы для вызова `callback`

`process.nextTick()` помещает `callback` в очередь «next tick». Она полностью выполняется после завершения текущей операции на стеке JavaScript и до продолжения цикла событий. Рекурсивный `process.nextTick()` может зациклить процесс. См. руководство [Event Loop](https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick#understanding-processnexttick).

=== "MJS"

    ```js
    import { nextTick } from 'node:process';

    console.log('start');
    nextTick(() => {
      console.log('nextTick callback');
    });
    console.log('scheduled');
    // Output:
    // start
    // scheduled
    // nextTick callback
    ```

=== "CJS"

    ```js
    const { nextTick } = require('node:process');

    console.log('start');
    nextTick(() => {
      console.log('nextTick callback');
    });
    console.log('scheduled');
    // Output:
    // start
    // scheduled
    // nextTick callback
    ```

Это важно при проектировании API: пользователь может назначить обработчики _после_ создания объекта, но _до_ любого ввода-вывода:

=== "MJS"

    ```js
    import { nextTick } from 'node:process';

    function MyThing(options) {
      this.setupOptions(options);

      nextTick(() => {
        this.startDoingStuff();
      });
    }

    const thing = new MyThing();
    thing.getReadyForStuff();

    // thing.startDoingStuff() gets called now, not before.
    ```

=== "CJS"

    ```js
    const { nextTick } = require('node:process');

    function MyThing(options) {
      this.setupOptions(options);

      nextTick(() => {
        this.startDoingStuff();
      });
    }

    const thing = new MyThing();
    thing.getReadyForStuff();

    // thing.startDoingStuff() gets called now, not before.
    ```

API лучше делать либо полностью синхронными, либо полностью асинхронными. Пример:

```js
// WARNING!  DO NOT USE!  BAD UNSAFE HAZARD!
function maybeSync(arg, cb) {
    if (arg) {
        cb();
        return;
    }

    fs.stat('file', cb);
}
```

Такой API опасен, потому что здесь:

```js
const maybeTrue = Math.random() > 0.5;

maybeSync(maybeTrue, () => {
    foo();
});

bar();
```

неочевидно, что выполнится раньше — `foo()` или `bar()`.

Надёжнее так:

=== "MJS"

    ```js
    import { nextTick } from 'node:process';

    function definitelyAsync(arg, cb) {
      if (arg) {
        nextTick(cb);
        return;
      }

      fs.stat('file', cb);
    }
    ```

=== "CJS"

    ```js
    const { nextTick } = require('node:process');

    function definitelyAsync(arg, cb) {
      if (arg) {
        nextTick(cb);
        return;
      }

      fs.stat('file', cb);
    }
    ```

### Когда использовать `queueMicrotask()` и когда `process.nextTick()`

[`queueMicrotask()`](globals.md#queuemicrotaskcallback) — альтернатива `process.nextTick()`: вместо очереди «next tick» откладывает выполнение через ту же микрозадачную очередь, что и обработчики `then`/`catch`/`finally` у промисов.

В Node.js после каждого опустошения очереди «next tick» сразу опустошается и очередь микрозадач.

В CJS-модулях колбэки `process.nextTick()` всегда выполняются раньше колбэков `queueMicrotask()`. В ESM загрузка модулей уже идёт в микрозадачной очереди, поэтому там колбэки `queueMicrotask()` выполняются раньше `process.nextTick()`, пока Node.js обрабатывает микрозадачи.

=== "MJS"

    ```js
    import { nextTick } from 'node:process';

    Promise.resolve().then(() => console.log('resolve'));
    queueMicrotask(() => console.log('microtask'));
    nextTick(() => console.log('nextTick'));
    // Output:
    // resolve
    // microtask
    // nextTick
    ```

=== "CJS"

    ```js
    const { nextTick } = require('node:process');

    Promise.resolve().then(() => console.log('resolve'));
    queueMicrotask(() => console.log('microtask'));
    nextTick(() => console.log('nextTick'));
    // Output:
    // nextTick
    // resolve
    // microtask
    ```

В _большинстве_ прикладных сценариев `queueMicrotask()` — переносимый и предсказуемый способ отложить выполнение в разных средах JavaScript; его стоит предпочитать `process.nextTick()`. В простых случаях `queueMicrotask()` можно подставить вместо `process.nextTick()`.

```js
console.log('start');
queueMicrotask(() => {
    console.log('microtask callback');
});
console.log('scheduled');
// Output:
// start
// scheduled
// microtask callback
```

Важное отличие: `process.nextTick()` принимает дополнительные аргументы для отложенной функции. С `queueMicrotask()` для этого нужны замыкание или привязка (`bind`):

```js
function deferred(a, b) {
    console.log('microtask', a + b);
}

console.log('start');
queueMicrotask(deferred.bind(undefined, 1, 2));
console.log('scheduled');
// Output:
// start
// scheduled
// microtask 3
```

Ошибки из очередей next tick и микрозадач обрабатываются немного по-разному. Исключения в колбэке микрозадачи лучше ловить внутри него; иначе можно использовать `process.on('uncaughtException')`.

Если нет нужды в особенностях `process.nextTick()`, используйте `queueMicrotask()`.

## `process.noDeprecation`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `process.noDeprecation` показывает, задан ли флаг `--no-deprecation` у текущего процесса Node.js. Поведение см. в описании события [`'warning'`](#event-warning) и метода [`emitWarning()`](#processemitwarningwarning-type-code-ctor).

## `process.permission`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

API доступен с флагом [`--permission`](cli.md#--permission).

`process.permission` — объект с методами управления правами текущего процесса. Подробнее — [модель разрешений](permissions.md#permission-model).

### `process.permission.has(scope[, reference])`

-   `scope` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `reference` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, может ли процесс обращаться к указанной области (`scope`) и ссылке (`reference`). Если ссылка не задана, подразумевается глобальная область: например, `process.permission.has('fs.read')` проверяет, есть ли у процесса _все_ права на чтение ФС.

Смысл `reference` зависит от `scope`: для файловой системы это файлы и каталоги.

Доступные области:

-   `fs` — вся файловая система
-   `fs.read` — чтение ФС
-   `fs.write` — запись ФС
-   `child` — порождение дочерних процессов
-   `worker` — порождение потоков Worker

```js
// Check if the process has permission to read the README file
process.permission.has('fs.read', './README.md');
// Check if the process has read permission operations
process.permission.has('fs.read');
```

## `process.pid`

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `process.pid` возвращает PID процесса.

=== "MJS"

    ```js
    import { pid } from 'node:process';

    console.log(`This process is pid ${pid}`);
    ```

=== "CJS"

    ```js
    const { pid } = require('node:process');

    console.log(`This process is pid ${pid}`);
    ```

## `process.platform`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.platform` возвращает строку с идентификатором платформы ОС, под которую собран двоичный файл Node.js.

Сейчас возможны значения:

-   `'aix'`
-   `'darwin'`
-   `'freebsd'`
-   `'linux'`
-   `'openbsd'`
-   `'sunos'`
-   `'win32'`

=== "MJS"

    ```js
    import { platform } from 'node:process';

    console.log(`This platform is ${platform}`);
    ```

=== "CJS"

    ```js
    const { platform } = require('node:process');

    console.log(`This platform is ${platform}`);
    ```

Может возвращаться и `'android'`, если Node.js собран под Android. Поддержка Android в Node.js [экспериментальна](https://github.com/nodejs/node/blob/HEAD/BUILDING.md#android).

## `process.ppid`

-   Тип: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `process.ppid` возвращает PID родительского процесса.

=== "MJS"

    ```js
    import { ppid } from 'node:process';

    console.log(`The parent process is pid ${ppid}`);
    ```

=== "CJS"

    ```js
    const { ppid } = require('node:process');

    console.log(`The parent process is pid ${ppid}`);
    ```

## `process.ref(maybeRefable)`

> Стабильность: 1 — экспериментально

-   `maybeRefable` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) объект, который может поддерживать «ref»

Объект «refable», если реализует протокол Node.js «Refable»: методы `Symbol.for('nodejs.ref')` и `Symbol.for('nodejs.unref')`. Объекты с ref удерживают цикл событий Node.js, с unref — нет. Раньше это делали методами `ref()`/`unref()` на объектах; этот подход уступает протоколу «Refable», чтобы поддерживать типы Web Platform API, где нельзя добавить `ref()`/`unref()`, но нужно такое поведение.

## `process.release`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.release` возвращает `Object` с метаданными текущего релиза, включая URL архива исходников и архива только заголовков.

У `process.release` такие поля:

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) всегда `'node'`.
-   `sourceUrl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) абсолютный URL к файлу _`.tar.gz`_ с исходным кодом релиза.
-   `headersUrl`[`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) абсолютный URL к _`.tar.gz`_ только с заголовками; файл намного меньше полного исходника и подходит для сборки нативных аддонов Node.js.
-   `libUrl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined абсолютный URL к файлу _`node.lib`_, соответствующему архитектуре и версии релиза; нужен для сборки нативных аддонов. _Только в сборках Node.js для Windows; на других платформах отсутствует._
-   `lts` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined метка [LTS](https://github.com/nodejs/Release) для релиза. Есть только у LTS-выпусков, для остальных (включая _Current_) — `undefined`. Допустимы кодовые имена LTS (в том числе уже не поддерживаемые).
    -   `'Fermium'` — линия 14.x LTS с 14.15.0.
    -   `'Gallium'` — линия 16.x LTS с 16.13.0.
    -   `'Hydrogen'` — линия 18.x LTS с 18.12.0. Остальные имена см. в [Node.js Changelog Archive](https://github.com/nodejs/node/blob/HEAD/doc/changelogs/CHANGELOG_ARCHIVE.md)

```js
{
  name: 'node',
  lts: 'Hydrogen',
  sourceUrl: 'https://nodejs.org/download/release/v18.12.0/node-v18.12.0.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v18.12.0/node-v18.12.0-headers.tar.gz',
  libUrl: 'https://nodejs.org/download/release/v18.12.0/win-x64/node.lib'
}
```

В неофициальных сборках из дерева исходников может быть только свойство `name`; наличие остальных полей не гарантируется.

## `process.report`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

`process.report` — объект с методами генерации диагностических отчётов для текущего процесса. Подробнее — [документация по отчётам](report.md).

### `process.report.compact`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Писать отчёты в компактном однострочном JSON — удобнее для систем обработки логов, чем многострочный формат по умолчанию.

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Reports are compact? ${report.compact}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Reports are compact? ${report.compact}`);
    ```

### `process.report.directory`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Каталог, куда пишется отчёт. По умолчанию пустая строка — тогда файлы попадают в текущий рабочий каталог процесса Node.js.

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Report directory is ${report.directory}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Report directory is ${report.directory}`);
    ```

### `process.report.filename`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя файла отчёта. Пустая строка (значение по умолчанию) — имя собирается из метки времени, PID и порядкового номера.

Если `process.report.filename` равен `'stdout'` или `'stderr'`, отчёт пишется в stdout или stderr процесса.

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Report filename is ${report.filename}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Report filename is ${report.filename}`);
    ```

### `process.report.getReport([err])`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) пользовательская ошибка для стека JavaScript в отчёте
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает объект JavaScript с диагностическим отчётом о работающем процессе. Стек JavaScript берётся из `err`, если передан.

=== "MJS"

    ```js
    import { report } from 'node:process';
    import util from 'node:util';

    const data = report.getReport();
    console.log(data.header.nodejsVersion);

    // Similar to process.report.writeReport()
    import fs from 'node:fs';
    fs.writeFileSync('my-report.log', util.inspect(data), 'utf8');
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');
    const util = require('node:util');

    const data = report.getReport();
    console.log(data.header.nodejsVersion);

    // Similar to process.report.writeReport()
    const fs = require('node:fs');
    fs.writeFileSync('my-report.log', util.inspect(data), 'utf8');
    ```

Дополнительно см. [документацию по отчётам](report.md).

### `process.report.reportOnFatalError`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, диагностический отчёт создаётся при фатальных ошибках (например нехватка памяти или сбой C++-утверждения).

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Report on fatal error: ${report.reportOnFatalError}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Report on fatal error: ${report.reportOnFatalError}`);
    ```

### `process.report.reportOnSignal`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, отчёт создаётся при получении процессом сигнала из `process.report.signal`.

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Report on signal: ${report.reportOnSignal}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Report on signal: ${report.reportOnSignal}`);
    ```

### `process.report.reportOnUncaughtException`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, отчёт создаётся при необработанном исключении.

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Report on exception: ${report.reportOnUncaughtException}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Report on exception: ${report.reportOnUncaughtException}`);
    ```

### `process.report.excludeEnv`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, отчёт формируется без переменных окружения.

### `process.report.signal`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Сигнал для создания диагностического отчёта. По умолчанию `'SIGUSR2'`.

=== "MJS"

    ```js
    import { report } from 'node:process';

    console.log(`Report signal: ${report.signal}`);
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    console.log(`Report signal: ${report.signal}`);
    ```

### `process.report.writeReport([filename][, err])`

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя файла отчёта. Относительный путь дополняется к каталогу из `process.report.directory` или к текущему рабочему каталогу Node.js, если каталог не задан.

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) пользовательская ошибка для стека JavaScript в отчёте.

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) имя сгенерированного файла отчёта.

Записывает диагностический отчёт в файл. Если `filename` не указан, имя по умолчанию включает дату, время, PID и порядковый номер. Стек JavaScript берётся из `err`, если передан.

Если `filename` равен `'stdout'` или `'stderr'`, отчёт пишется в stdout или stderr.

=== "MJS"

    ```js
    import { report } from 'node:process';

    report.writeReport();
    ```

=== "CJS"

    ```js
    const { report } = require('node:process');

    report.writeReport();
    ```

Дополнительно см. [документацию по отчётам](report.md).

## `process.resourceUsage()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) использование ресурсов текущим процессом. Значения из вызова `uv_getrusage`, возвращающего структуру [`uv_rusage_t`](https://docs.libuv.org/en/v1.x/misc.html#c.uv_rusage_t).
    -   `userCPUTime` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_utime` в микросекундах; совпадает с [`process.cpuUsage().user`](#processcpuusagepreviousvalue).
    -   `systemCPUTime` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_stime` в микросекундах; совпадает с [`process.cpuUsage().system`](#processcpuusagepreviousvalue).
    -   `maxRSS` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_maxrss` — максимальный RSS в кибибайтах (1024 байта).
    -   `sharedMemorySize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_ixrss`; ни на одной платформе не поддерживается.
    -   `unsharedDataSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_idrss`; ни на одной платформе не поддерживается.
    -   `unsharedStackSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_isrss`; ни на одной платформе не поддерживается.
    -   `minorPageFault` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_minflt` — число лёгких page fault; см. [статью](https://en.wikipedia.org/wiki/Page_fault#Minor).
    -   `majorPageFault` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_majflt` — число тяжёлых page fault; см. [статью](https://en.wikipedia.org/wiki/Page_fault#Major). В Windows не поддерживается.
    -   `swappedOut` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_nswap`; ни на одной платформе не поддерживается.
    -   `fsRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_inblock` — сколько раз ФС выполняла ввод.
    -   `fsWrite` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_oublock` — сколько раз ФС выполняла вывод.
    -   `ipcSent` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_msgsnd`; ни на одной платформе не поддерживается.
    -   `ipcReceived` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_msgrcv`; ни на одной платформе не поддерживается.
    -   `signalsCount` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_nsignals`; ни на одной платформе не поддерживается.
    -   `voluntaryContextSwitches` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_nvcsw` — сколько раз процесс добровольно отдал процессор до истечения кванта (часто в ожидании ресурса). В Windows не поддерживается.
    -   `involuntaryContextSwitches` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_nivcsw` — переключения из-за более приоритетного процесса или превышения кванта. В Windows не поддерживается.

=== "MJS"

    ```js
    import { resourceUsage } from 'node:process';

    console.log(resourceUsage());
    /*
      Пример вывода:
      {
        userCPUTime: 82872,
        systemCPUTime: 4143,
        maxRSS: 33164,
        sharedMemorySize: 0,
        unsharedDataSize: 0,
        unsharedStackSize: 0,
        minorPageFault: 2469,
        majorPageFault: 0,
        swappedOut: 0,
        fsRead: 0,
        fsWrite: 8,
        ipcSent: 0,
        ipcReceived: 0,
        signalsCount: 0,
        voluntaryContextSwitches: 79,
        involuntaryContextSwitches: 1
      }
    */
    ```

=== "CJS"

    ```js
    const { resourceUsage } = require('node:process');

    console.log(resourceUsage());
    /*
      Пример вывода:
      {
        userCPUTime: 82872,
        systemCPUTime: 4143,
        maxRSS: 33164,
        sharedMemorySize: 0,
        unsharedDataSize: 0,
        unsharedStackSize: 0,
        minorPageFault: 2469,
        majorPageFault: 0,
        swappedOut: 0,
        fsRead: 0,
        fsWrite: 8,
        ipcSent: 0,
        ipcReceived: 0,
        signalsCount: 0,
        voluntaryContextSwitches: 79,
        involuntaryContextSwitches: 1
      }
    */
    ```

## `process.send(message[, sendHandle[, options]][, callback])`

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `sendHandle` [`<net.Server>`](net.md#class-netserver) | [`<net.Socket>`](net.md#class-netsocket)
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) параметры отправки отдельных типов дескрипторов. У `options` поля:
    -   `keepOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) при передаче экземпляров `net.Socket`: если `true`, сокет в отправляющем процессе остаётся открытым. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если Node.js запущен с IPC-каналом, `process.send()` отправляет сообщения родителю; родитель получает их как событие [`'message'`](child_process.md#event-message) на [`ChildProcess`](child_process.md#class-childprocess).

Без IPC-канала `process.send` будет `undefined`.

Сообщение сериализуется и разбирается; итог может отличаться от исходного.

## `process.setegid(id)`

-   `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) имя или ID группы

Метод `process.setegid()` задаёт эффективный GID процесса. См. setegid(2). `id` может быть числом или строкой с именем группы; при строке метод блокируется на разрешении числового ID.

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getegid && process.setegid) {
      console.log(`Current gid: ${process.getegid()}`);
      try {
        process.setegid(501);
        console.log(`New gid: ${process.getegid()}`);
      } catch (err) {
        console.error(`Failed to set gid: ${err}`);
      }
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getegid && process.setegid) {
      console.log(`Current gid: ${process.getegid()}`);
      try {
        process.setegid(501);
        console.log(`New gid: ${process.getegid()}`);
      } catch (err) {
        console.error(`Failed to set gid: ${err}`);
      }
    }
    ```

Доступно только на POSIX (не в Windows и не в Android). В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.seteuid(id)`

-   `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) имя или ID пользователя

Метод `process.seteuid()` задаёт эффективный UID процесса. См. seteuid(2). `id` может быть числом или именем пользователя; при имени метод блокируется на разрешении числового ID.

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.geteuid && process.seteuid) {
      console.log(`Current uid: ${process.geteuid()}`);
      try {
        process.seteuid(501);
        console.log(`New uid: ${process.geteuid()}`);
      } catch (err) {
        console.error(`Failed to set uid: ${err}`);
      }
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.geteuid && process.seteuid) {
      console.log(`Current uid: ${process.geteuid()}`);
      try {
        process.seteuid(501);
        console.log(`New uid: ${process.geteuid()}`);
      } catch (err) {
        console.error(`Failed to set uid: ${err}`);
      }
    }
    ```

Доступно только на POSIX (не в Windows и не в Android). В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.setgid(id)`

-   `id` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) имя или ID группы

Метод `process.setgid()` задаёт GID процесса. См. setgid(2). `id` — число или имя группы; при имени метод блокируется на разрешении числового ID.

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getgid && process.setgid) {
      console.log(`Current gid: ${process.getgid()}`);
      try {
        process.setgid(501);
        console.log(`New gid: ${process.getgid()}`);
      } catch (err) {
        console.error(`Failed to set gid: ${err}`);
      }
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getgid && process.setgid) {
      console.log(`Current gid: ${process.getgid()}`);
      try {
        process.setgid(501);
        console.log(`New gid: ${process.getgid()}`);
      } catch (err) {
        console.error(`Failed to set gid: ${err}`);
      }
    }
    ```

Доступно только на POSIX (не в Windows и не в Android). В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.setgroups(groups)`

-   `groups` [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.setgroups()` задаёт дополнительные GID процесса Node.js. Это привилегированная операция: нужны `root` или возможность `CAP_SETGID`.

Массив `groups` может содержать числовые ID групп, имена или их смесь.

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getgroups && process.setgroups) {
      try {
        process.setgroups([501]);
        console.log(process.getgroups()); // new groups
      } catch (err) {
        console.error(`Failed to set groups: ${err}`);
      }
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getgroups && process.setgroups) {
      try {
        process.setgroups([501]);
        console.log(process.getgroups()); // new groups
      } catch (err) {
        console.error(`Failed to set groups: ${err}`);
      }
    }
    ```

Доступно только на POSIX (не в Windows и не в Android). В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.setuid(id)`

-   `id` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.setuid(id)` задаёт UID процесса. См. setuid(2). `id` — число или имя пользователя; при имени метод блокируется на разрешении числового ID.

=== "MJS"

    ```js
    import process from 'node:process';

    if (process.getuid && process.setuid) {
      console.log(`Current uid: ${process.getuid()}`);
      try {
        process.setuid(501);
        console.log(`New uid: ${process.getuid()}`);
      } catch (err) {
        console.error(`Failed to set uid: ${err}`);
      }
    }
    ```

=== "CJS"

    ```js
    const process = require('node:process');

    if (process.getuid && process.setuid) {
      console.log(`Current uid: ${process.getuid()}`);
      try {
        process.setuid(501);
        console.log(`New uid: ${process.getuid()}`);
      } catch (err) {
        console.error(`Failed to set uid: ${err}`);
      }
    }
    ```

Доступно только на POSIX (не в Windows и не в Android). В потоках [`Worker`](worker_threads.md#class-worker) недоступно.

## `process.setSourceMapsEnabled(val)`

> Стабильность: 1 — экспериментально. Используйте [`module.setSourceMapsSupport()`](module.md#modulesetsourcemapssupportenabled-options).

-   `val` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Включает или выключает поддержку [Source Map](https://tc39.es/ecma426/) для трассировок стека.

Эквивалентно запуску Node.js с опцией `--enable-source-maps`.

Разбираются и загружаются только source map в JS-файлах, подключённых после включения.

По сути вызывает `module.setSourceMapsSupport()` с опцией `{ nodeModules: true, generatedCode: true }`.

## `process.setUncaughtExceptionCaptureCallback(fn)`

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | null

Функция `process.setUncaughtExceptionCaptureCallback()` задаёт функцию, вызываемую при необработанном исключении; первым аргументом передаётся само исключение.

Если такая функция задана, событие [`'uncaughtException'`](#event-uncaughtexception) не испускается. Если передан `--abort-on-uncaught-exception` или он задан через [`v8.setFlagsFromString()`](v8.md#v8setflagsfromstringflags), процесс не аварийно завершается. Затронуты и действия при исключениях (например генерация отчётов).

Чтобы сбросить перехват, вызовите `process.setUncaughtExceptionCaptureCallback(null)`. Вызов с ненулевым аргументом при уже установленной функции перехвата выбрасывает ошибку.

Несколько совместимых callback’ов регистрируйте через [`process.addUncaughtExceptionCaptureCallback()`](#processadduncaughtexceptioncapturecallbackfn).

## `process.sourceMapsEnabled`

> Стабильность: 1 — экспериментально. Используйте [`module.getSourceMapsSupport()`](module.md#modulegetsourcemapssupport).

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `process.sourceMapsEnabled` показывает, включена ли поддержка [Source Map](https://tc39.es/ecma426/) для трассировок стека.

## `process.stderr`

-   Тип: [`<Stream>`](stream.md#stream)

Свойство `process.stderr` возвращает поток, связанный с `stderr` (fd `2`). Это [`net.Socket`](net.md#class-netsocket) ([Duplex](stream.md#duplex-and-transform-streams)), если fd `2` не файл; иначе — [Writable](stream.md#writable-streams).

`process.stderr` ведёт себя иначе, чем обычные потоки Node.js. См. [замечание о вводе-выводе процесса](#a-note-on-process-io).

### `process.stderr.fd`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Нижележащий дескриптор файла `process.stderr`; всегда `2`. В потоках [`Worker`](worker_threads.md#class-worker) поля нет.

## `process.stdin`

-   Тип: [`<Stream>`](stream.md#stream)

Свойство `process.stdin` возвращает поток, связанный с `stdin` (fd `0`). Это [`net.Socket`](net.md#class-netsocket) ([Duplex](stream.md#duplex-and-transform-streams)), если fd `0` не файл; иначе — [Readable](stream.md#readable-streams).

Чтение из `stdin` см. в [`readable.read()`](stream.md#readablereadsize).

Как [Duplex](stream.md#duplex-and-transform-streams), `process.stdin` можно использовать в «старом» режиме, совместимом со скриптами до Node.js v0.10. Подробнее — [совместимость потоков](stream.md#compatibility-with-older-nodejs-versions).

В «старом» режиме `stdin` по умолчанию на паузе — для чтения вызовите `process.stdin.resume()`. Сам вызов `resume()` переключает поток в «старый» режим.

### `process.stdin.fd`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Нижележащий дескриптор файла `process.stdin`; всегда `0`. В потоках [`Worker`](worker_threads.md#class-worker) поля нет.

## `process.stdout`

-   Тип: [`<Stream>`](stream.md#stream)

Свойство `process.stdout` возвращает поток, связанный с `stdout` (fd `1`). Это [`net.Socket`](net.md#class-netsocket) ([Duplex](stream.md#duplex-and-transform-streams)), если fd `1` не файл; иначе — [Writable](stream.md#writable-streams).

Например, копирование `process.stdin` в `process.stdout`:

=== "MJS"

    ```js
    import { stdin, stdout } from 'node:process';

    stdin.pipe(stdout);
    ```

=== "CJS"

    ```js
    const { stdin, stdout } = require('node:process');

    stdin.pipe(stdout);
    ```

`process.stdout` ведёт себя иначе, чем обычные потоки Node.js. См. [замечание о вводе-выводе процесса](#a-note-on-process-io).

### `process.stdout.fd`

-   Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Нижележащий дескриптор файла `process.stdout`; всегда `1`. В потоках [`Worker`](worker_threads.md#class-worker) поля нет.

### Замечание о вводе-выводе процесса {#a-note-on-process-io}

`process.stdout` и `process.stderr` отличаются от других потоков Node.js:

1.  Ими пользуются [`console.log()`](console.md#consolelogdata-args) и [`console.error()`](console.md#consoleerrordata-args).
2.  Запись может быть синхронной в зависимости от назначения потока и ОС (Windows/POSIX):
    -   файлы: _синхронно_ в Windows и POSIX;
    -   TTY: _асинхронно_ в Windows, _синхронно_ в POSIX;
    -   каналы и сокеты: _синхронно_ в Windows, _асинхронно_ в POSIX.

Так исторически сложилось: смена поведения сломала бы совместимость, плюс на это рассчитывают пользователи.

Синхронная запись снижает риск перемешивания вывода `console.log()`/`console.error()` или его потери при `process.exit()` до завершения асинхронной записи. См. [`process.exit()`](#processexitcode).

_**Предупреждение**_: синхронная запись блокирует цикл событий до конца записи. В файл это часто мгновенно, но при высокой нагрузке, нечитаемом конце канала или медленном терминале/ФС цикл может блокироваться надолго. Для интерактивного терминала это реже проблема; для продакшен-логов в stdout/stderr учитывайте это.

Подключение к [TTY](tty.md#tty) проверяют по свойству `isTTY`.

Например:

```console
$ node -p "Boolean(process.stdin.isTTY)"
true
$ echo "foo" | node -p "Boolean(process.stdin.isTTY)"
false
$ node -p "Boolean(process.stdout.isTTY)"
true
$ node -p "Boolean(process.stdout.isTTY)" | cat
false
```

Подробнее см. документацию [TTY](tty.md#tty).

## `process.throwDeprecation`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Начальное значение `process.throwDeprecation` показывает, задан ли флаг `--throw-deprecation`. Свойство можно менять: в рантайме можно переключать, превращаются ли предупреждения об устаревании в ошибки. См. [`'warning'`](#event-warning) и [`emitWarning()`](#processemitwarningwarning-type-code-ctor).

```console
$ node --throw-deprecation -p "process.throwDeprecation"
true
$ node -p "process.throwDeprecation"
undefined
$ node
> process.emitWarning('test', 'DeprecationWarning');
undefined
> (node:26598) DeprecationWarning: test
> process.throwDeprecation = true;
true
> process.emitWarning('test', 'DeprecationWarning');
Thrown:
[DeprecationWarning: test] { name: 'DeprecationWarning' }
```

## `process.threadCpuUsage([previousValue])`

-   `previousValue` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) результат предыдущего вызова `process.threadCpuUsage()`
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `user` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `system` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.threadCpuUsage()` возвращает пользовательское и системное время CPU текущего worker-потока в объекте `user`/`system` (микросекунды).

Результат предыдущего вызова можно передать аргументом для разницы показаний.

## `process.title`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.title` задаёт/возвращает заголовок процесса (как в `ps`). Присвоение меняет заголовок для `ps`.

Ограничения длины различаются по платформам и обычно жёсткие. На Linux и macOS длина связана с именем бинарника и аргументами командной строки, потому что `process.title` перезаписывает память `argv`. В Node.js 0.8 можно было длиннее за счёт перезаписи `environ`, но это было небезопасно и запутывало в редких случаях.

В диспетчерах вроде Activity Monitor или Windows Services Manager подпись может не совпадать.

## `process.traceDeprecation`

-   Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `process.traceDeprecation` показывает, задан ли флаг `--trace-deprecation`. См. [`'warning'`](#event-warning) и [`emitWarning()`](#processemitwarningwarning-type-code-ctor).

## `process.traceProcessWarnings`

-   [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `process.traceProcessWarnings` отражает флаг `--trace-warnings` и позволяет включать или выключать трассировки стека для предупреждений в рантайме.

```js
// Enable trace warnings
process.traceProcessWarnings = true;

// Emit a warning with a stack trace
process.emitWarning('Warning with stack trace');

// Disable trace warnings
process.traceProcessWarnings = false;
```

## `process.umask()`

> Стабильность: 0 — устарело. Вызов `process.umask()` без аргумента дважды записывает umask процесса, что даёт гонку между потоками и риск для безопасности. Безопасной кроссплатформенной замены нет.

`process.umask()` возвращает маску создания файлов процесса Node.js. Дочерние процессы наследуют маску от родителя.

## `process.umask(mask)`

-   `mask` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

`process.umask(mask)` задаёт маску создания файлов. Дочерние процессы наследуют маску. Возвращает предыдущую маску.

=== "MJS"

    ```js
    import { umask } from 'node:process';

    const newmask = 0o022;
    const oldmask = umask(newmask);
    console.log(
      `Changed umask from ${oldmask.toString(8)} to ${newmask.toString(8)}`,
    );
    ```

=== "CJS"

    ```js
    const { umask } = require('node:process');

    const newmask = 0o022;
    const oldmask = umask(newmask);
    console.log(
      `Changed umask from ${oldmask.toString(8)} to ${newmask.toString(8)}`,
    );
    ```

В потоках [`Worker`](worker_threads.md#class-worker) `process.umask(mask)` выбрасывает исключение.

## `process.unref(maybeRefable)`

> Стабильность: 1 — экспериментально

-   `maybeRefable` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) объект, для которого возможен «unref»

Объект «unrefable», если реализует протокол Node.js «Refable»: методы `Symbol.for('nodejs.ref')` и `Symbol.for('nodejs.unref')`. Объекты с ref удерживают цикл событий Node.js, с unref — нет. Раньше это делали методами `ref()`/`unref()` на объектах; этот подход уступает протоколу «Refable», чтобы поддерживать типы Web Platform API, где нельзя добавить `ref()`/`unref()`, но нужно такое поведение.

## `process.uptime()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.uptime()` возвращает число секунд работы текущего процесса Node.js.

В значении есть дробная часть; для целых секунд используйте `Math.floor()`.

## `process.version`

-   Тип: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.version` содержит строку версии Node.js.

=== "MJS"

    ```js
    import { version } from 'node:process';

    console.log(`Version: ${version}`);
    // Version: v14.8.0
    ```

=== "CJS"

    ```js
    const { version } = require('node:process');

    console.log(`Version: ${version}`);
    // Version: v14.8.0
    ```

Строку без префикса _v_ берите из `process.versions.node`.

## `process.versions`

-   Тип: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.versions` возвращает объект с версиями Node.js и зависимостей. `process.versions.modules` — текущая версия ABI модулей; она повышается при изменении C++ API. Node.js не загрузит модуль, собранный под другую ABI.

=== "MJS"

    ```js
    import { versions } from 'node:process';

    console.log(versions);
    ```

=== "CJS"

    ```js
    const { versions } = require('node:process');

    console.log(versions);
    ```

Типичный вид объекта:

```console
{ node: '26.0.0-pre',
  acorn: '8.15.0',
  ada: '3.4.1',
  amaro: '1.1.5',
  ares: '1.34.6',
  brotli: '1.2.0',
  merve: '1.0.0',
  cldr: '48.0',
  icu: '78.2',
  llhttp: '9.3.0',
  modules: '144',
  napi: '10',
  nbytes: '0.1.1',
  ncrypto: '0.0.1',
  nghttp2: '1.68.0',
  nghttp3: '',
  ngtcp2: '',
  openssl: '3.5.4',
  simdjson: '4.2.4',
  simdutf: '7.3.3',
  sqlite: '3.51.2',
  tz: '2025c',
  undici: '7.18.2',
  unicode: '17.0',
  uv: '1.51.0',
  uvwasi: '0.0.23',
  v8: '14.3.127.18-node.10',
  zlib: '1.3.1-e00f703',
  zstd: '1.5.7' }
```

## Коды выхода

Обычно Node.js завершается с кодом `0`, когда не осталось асинхронных операций. В остальных случаях используются такие коды:

-   `1` **Необработанное фатальное исключение**: было исключение, не обработанное domain или обработчиком [`'uncaughtException'`](#event-uncaughtexception).
-   `2`: не используется (зарезервировано в Bash для ошибок встроенных команд)
-   `3` **Внутренняя ошибка разбора JavaScript**: при загрузке Node.js внутренний JS-код дал ошибку парсинга. Крайне редко, обычно только при разработке самого Node.js.
-   `4` **Внутренняя ошибка вычисления JavaScript**: внутренний JS при загрузке не вернул функцию при вычислении. Крайне редко, обычно только при разработке Node.js.
-   `5` **Фатальная ошибка**: неустранимая ошибка в V8. Обычно в stderr сообщение с префиксом `FATAL ERROR`.
-   `6` **Внутренний обработчик исключений не функция**: необработанное исключение, но внутренний обработчик фатальных исключений не является функцией и не может быть вызван.
-   `7` **Сбой внутреннего обработчика исключений**: необработанное исключение, и сам внутренний обработчик при попытке обработки выбросил ошибку (например обработчик [`'uncaughtException'`](#event-uncaughtexception) или `domain.on('error')`).
-   `8`: не используется. В старых версиях Node.js код 8 иногда означал необработанное исключение.
-   `9` **Неверный аргумент**: неизвестная опция или опция, требующая значения, без значения.
-   `10` **Внутренняя ошибка выполнения JavaScript**: внутренний JS при загрузке выбросил ошибку при вызове функции загрузки. Крайне редко, обычно только при разработке Node.js.
-   `12` **Неверный аргумент отладки**: заданы `--inspect` и/или `--inspect-brk`, но порт неверен или недоступен.
-   `13` **Незавершённый top-level await**: `await` на верхнем уровне, но переданный `Promise` так и не завершился.
-   `14` **Сбой снимка**: Node.js запускали для сборки V8 startup snapshot, но условия состояния приложения не выполнены.
-   `>128` **Выход по сигналу**: при фатальном сигнале (`SIGKILL`, `SIGHUP` и т. п.) код выхода равен `128` плюс номер сигнала. Так принято в POSIX: коды выхода — 7 бит, при завершении по сигналу задаётся старший бит и номер сигнала. Например, у `SIGABRT` код `6`, ожидаемый код выхода `128` + `6` = `134`.
