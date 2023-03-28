# Процесс

<!-- introduced_in=v0.10.0 -->

<!-- type=global -->

<!-- source_link=lib/process.js -->

В `process` Объект предоставляет информацию о текущем процессе Node.js. и контролирует его. Хотя он доступен как глобальный, рекомендуется явно получить к нему доступ через require или import:

```mjs
import process from 'process';
```

```cjs
const process = require('process');
```

## События процесса

В `process` объект является экземпляром [`EventEmitter`](events.md#class-eventemitter).

### Событие: `'beforeExit'`

<!-- YAML
added: v0.11.12
-->

В `'beforeExit'` Событие генерируется, когда Node.js очищает свой цикл событий и не имеет дополнительной работы для планирования. Обычно процесс Node.js завершается, когда нет запланированной работы, но слушатель зарегистрирован на `'beforeExit'` может выполнять асинхронные вызовы и тем самым вызывать продолжение процесса Node.js.

Функция обратного вызова слушателя вызывается со значением [`process.exitCode`](#processexitcode) передается как единственный аргумент.

В `'beforeExit'` событие _нет_ испускается для условий, вызывающих явное завершение, таких как вызов [`process.exit()`](#processexitcode) или неперехваченные исключения.

В `'beforeExit'` должен _нет_ использоваться как альтернатива `'exit'` событие, если не планируется запланировать дополнительную работу.

```mjs
import process from 'process';

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

```cjs
const process = require('process');

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

<!-- YAML
added: v0.7.7
-->

Если процесс Node.js порождается с каналом IPC (см. [Дочерний процесс](child_process.md) а также [Кластер](cluster.md) документация), `'disconnect'` событие будет сгенерировано, когда канал IPC будет закрыт.

### Событие: `'exit'`

<!-- YAML
added: v0.1.7
-->

- `code` {целое число}

В `'exit'` Событие генерируется, когда процесс Node.js собирается завершить работу в результате:

- В `process.exit()` явно вызываемый метод;
- Цикл событий Node.js больше не требует дополнительной работы.

Невозможно предотвратить выход из цикла событий на этом этапе, и однажды все `'exit'` слушатели завершили работу, процесс Node.js завершится.

Функция обратного вызова слушателя вызывается с кодом выхода, указанным либо в [`process.exitCode`](#processexitcode) собственность, или `exitCode` аргумент передан в [`process.exit()`](#processexitcode) метод.

```mjs
import process from 'process';

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});
```

```cjs
const process = require('process');

process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});
```

Функции слушателя **должен** только выполнять **синхронный** операции. Процесс Node.js завершится сразу после вызова `'exit'` прослушиватели событий, вызывающие любую дополнительную работу, все еще стоящую в очереди в цикле событий, должны быть отменены. В следующем примере, например, тайм-аут никогда не наступит:

```mjs
import process from 'process';

process.on('exit', (code) => {
  setTimeout(() => {
    console.log('This will not run');
  }, 0);
});
```

```cjs
const process = require('process');

process.on('exit', (code) => {
  setTimeout(() => {
    console.log('This will not run');
  }, 0);
});
```

### Событие: `'message'`

<!-- YAML
added: v0.5.10
-->

- `message` {Объект | логическое | номер | строка | null} проанализированный объект JSON или сериализуемое примитивное значение.
- `sendHandle` {net.Server | net.Socket} а [`net.Server`](net.md#class-netserver) или [`net.Socket`](net.md#class-netsocket) объект или неопределенный.

Если процесс Node.js порождается с каналом IPC (см. [Дочерний процесс](child_process.md) а также [Кластер](cluster.md) документация), `'message'` событие генерируется всякий раз, когда сообщение отправляется родительским процессом с использованием [`childprocess.send()`]() получает дочерний процесс.

Сообщение проходит сериализацию и синтаксический анализ. Полученное сообщение может отличаться от исходного.

Если `serialization` опция была установлена на `advanced` используется при порождении процесса, `message` Аргумент может содержать данные, которые JSON не может представить. Видеть [Расширенная сериализация для `child_process`](child_process.md#advanced-serialization) Больше подробностей.

### Событие: `'multipleResolves'`

<!-- YAML
added: v10.12.0
-->

- `type` {строка} Тип разрешения. Один из `'resolve'` или `'reject'`.
- `promise` {Обещание} Обещание, которое выполнялось или отклонялось более одного раза.
- `value` {any} Значение, с которым обещание было разрешено или отклонено после исходного разрешения.

В `'multipleResolves'` событие генерируется всякий раз, когда `Promise` был либо:

- Решалось не раз.
- Отклонено более одного раза.
- Отклонено после разрешения.
- Решено после отклонения.

Это полезно для отслеживания потенциальных ошибок в приложении при использовании `Promise` конструктор, так как несколько разрешений незаметно проглатываются. Однако возникновение этого события не обязательно указывает на ошибку. Например, [`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) может вызвать `'multipleResolves'` событие.

```mjs
import process from 'process';

process.on('multipleResolves', (type, promise, reason) => {
  console.error(type, promise, reason);
  setImmediate(() => process.exit(1));
});

async function main() {
  try {
    return await new Promise((resolve, reject) => {
      resolve('First call');
      resolve('Swallowed resolve');
      reject(new Error('Swallowed reject'));
    });
  } catch {
    throw new Error('Failed');
  }
}

main().then(console.log);
// resolve: Promise { 'First call' } 'Swallowed resolve'
// reject: Promise { 'First call' } Error: Swallowed reject
//     at Promise (*)
//     at new Promise (<anonymous>)
//     at main (*)
// First call
```

```cjs
const process = require('process');

process.on('multipleResolves', (type, promise, reason) => {
  console.error(type, promise, reason);
  setImmediate(() => process.exit(1));
});

async function main() {
  try {
    return await new Promise((resolve, reject) => {
      resolve('First call');
      resolve('Swallowed resolve');
      reject(new Error('Swallowed reject'));
    });
  } catch {
    throw new Error('Failed');
  }
}

main().then(console.log);
// resolve: Promise { 'First call' } 'Swallowed resolve'
// reject: Promise { 'First call' } Error: Swallowed reject
//     at Promise (*)
//     at new Promise (<anonymous>)
//     at main (*)
// First call
```

### Событие: `'rejectionHandled'`

<!-- YAML
added: v1.4.1
-->

- `promise` {Обещание} Обещание, выполненное с опозданием.

В `'rejectionHandled'` событие генерируется всякий раз, когда `Promise` был отклонен, и к нему был прикреплен обработчик ошибок (с использованием [`promise.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch), например) позже, чем за один ход цикла обработки событий Node.js.

В `Promise` объект ранее был бы испущен в `'unhandledRejection'` событие, но в процессе обработки получил обработчик отклонения.

Нет понятия верхнего уровня для `Promise` цепочка, в которой всегда можно обработать отказ. По своей природе асинхронный `Promise` отклонение может быть обработано в будущем, возможно, намного позже, чем цикл обработки событий, необходимый для `'unhandledRejection'` событие, которое будет выпущено.

Другой способ заявить об этом состоит в том, что, в отличие от синхронного кода, где есть постоянно растущий список необработанных исключений, с Promises может быть увеличивающийся и сокращающийся список необработанных отклонений.

В синхронном коде `'uncaughtException'` Событие генерируется при увеличении списка необработанных исключений.

В асинхронном коде `'unhandledRejection'` событие генерируется, когда список необработанных отклонений растет, а `'rejectionHandled'` Событие генерируется, когда список необработанных отказов сокращается.

```mjs
import process from 'process';

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
  unhandledRejections.delete(promise);
});
```

```cjs
const process = require('process');

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
  unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
  unhandledRejections.delete(promise);
});
```

В этом примере `unhandledRejections` `Map` будет расти и уменьшаться со временем, отражая отказы, которые сначала не обрабатываются, а затем обрабатываются. Такие ошибки можно записывать в журнал ошибок либо периодически (что, вероятно, лучше всего для долго работающего приложения), либо при выходе из процесса (что, вероятно, наиболее удобно для сценариев).

### Событие: `'uncaughtException'`

<!-- YAML
added: v0.1.18
changes:
  - version:
     - v12.0.0
     - v10.17.0
    pr-url: https://github.com/nodejs/node/pull/26599
    description: Added the `origin` argument.
-->

- `err` {Error} Неперехваченное исключение.
- `origin` {строка} Указывает, возникло ли исключение из-за необработанного отклонения или из-за синхронной ошибки. Либо может быть `'uncaughtException'` или `'unhandledRejection'`. Последний используется только вместе с [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode) установлен флаг `strict` или `throw` и необработанный отказ.

В `'uncaughtException'` Событие генерируется, когда неперехваченное исключение JavaScript возвращается обратно в цикл обработки событий. По умолчанию Node.js обрабатывает такие исключения, выводя трассировку стека в `stderr` и выход с кодом 1, отменяя любой ранее установленный [`process.exitCode`](#processexitcode). Добавление обработчика для `'uncaughtException'` событие отменяет это поведение по умолчанию. Или измените [`process.exitCode`](#processexitcode) в `'uncaughtException'` обработчик, который приведет к завершению процесса с предоставленным кодом выхода. В противном случае при наличии такого обработчика процесс завершится с 0.

```mjs
import process from 'process';

process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`
  );
});

setTimeout(() => {
  console.log('This will still run.');
}, 500);

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
console.log('This will not run.');
```

```cjs
const process = require('process');

process.on('uncaughtException', (err, origin) => {
  fs.writeSync(
    process.stderr.fd,
    `Caught exception: ${err}\n` +
      `Exception origin: ${origin}`
  );
});

setTimeout(() => {
  console.log('This will still run.');
}, 500);

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
console.log('This will not run.');
```

Есть возможность контролировать `'uncaughtException'` события без отмены поведения по умолчанию, чтобы выйти из процесса, установив `'uncaughtExceptionMonitor'` слушатель.

#### Предупреждение: использование `'uncaughtException'` правильно

`'uncaughtException'` это грубый механизм обработки исключений, предназначенный для использования только в крайнем случае. Событие _не должна_ использоваться как эквивалент `On Error Resume Next`. Необработанные исключения по сути означают, что приложение находится в неопределенном состоянии. Попытка возобновить код приложения без надлежащего восстановления после исключения может вызвать дополнительные непредвиденные и непредсказуемые проблемы.

Исключения, созданные из обработчика событий, не будут перехвачены. Вместо этого процесс завершится с ненулевым кодом выхода, и будет напечатана трассировка стека. Это сделано для того, чтобы избежать бесконечной рекурсии.

Попытка возобновить работу в обычном режиме после неперехваченного исключения может быть аналогична выдергиванию шнура питания при обновлении компьютера. В девяти случаях из десяти ничего не происходит. Но в десятый раз система оказывается поврежденной.

Правильное использование `'uncaughtException'` заключается в выполнении синхронной очистки выделенных ресурсов (например, дескрипторов файлов, дескрипторов и т. д.) перед завершением процесса. **Возобновление нормальной работы после `'uncaughtException'`.**

Чтобы перезапустить аварийное приложение более надежным способом, независимо от того, `'uncaughtException'` испускается или нет, внешний монитор должен использоваться в отдельном процессе для обнаружения сбоев приложения и восстановления или перезапуска по мере необходимости.

### Событие: `'uncaughtExceptionMonitor'`

<!-- YAML
added:
 - v13.7.0
 - v12.17.0
-->

- `err` {Error} Неперехваченное исключение.
- `origin` {строка} Указывает, возникло ли исключение из-за необработанного отклонения или из синхронных ошибок. Либо может быть `'uncaughtException'` или `'unhandledRejection'`. Последний используется только вместе с [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode) установлен флаг `strict` или `throw` и необработанный отказ.

В `'uncaughtExceptionMonitor'` событие генерируется перед `'uncaughtException'` генерируется событие или устанавливается ловушка через [`process.setUncaughtExceptionCaptureCallback()`](#processsetuncaughtexceptioncapturecallbackfn) называется.

Установка `'uncaughtExceptionMonitor'` слушатель не меняет поведение после того, как `'uncaughtException'` событие испускается. Если нет, процесс все равно выйдет из строя. `'uncaughtException'` слушатель установлен.

```mjs
import process from 'process';

process.on('uncaughtExceptionMonitor', (err, origin) => {
  MyMonitoringTool.logSync(err, origin);
});

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
// Still crashes Node.js
```

```cjs
const process = require('process');

process.on('uncaughtExceptionMonitor', (err, origin) => {
  MyMonitoringTool.logSync(err, origin);
});

// Intentionally cause an exception, but don't catch it.
nonexistentFunc();
// Still crashes Node.js
```

### Событие: `'unhandledRejection'`

<!-- YAML
added: v1.4.1
changes:
  - version: v7.0.0
    pr-url: https://github.com/nodejs/node/pull/8217
    description: Not handling `Promise` rejections is deprecated.
  - version: v6.6.0
    pr-url: https://github.com/nodejs/node/pull/8223
    description: Unhandled `Promise` rejections will now emit
                 a process warning.
-->

- `reason` {Error | any} Объект, с которым было отклонено обещание (обычно [`Error`](errors.md#class-error) объект).
- `promise` {Обещание} Отклоненное обещание.

В `'unhandledRejection'` событие генерируется всякий раз, когда `Promise` отклоняется, и к обещанию не прикрепляется обработчик ошибок в ходе цикла обработки событий. При программировании с помощью обещаний исключения инкапсулируются как «отклоненные обещания». Отказ может быть обнаружен и обработан с помощью [`promise.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) и распространяются через `Promise` цепь. В `'unhandledRejection'` Событие полезно для обнаружения и отслеживания отклоненных обещаний, которые еще не были обработаны.

```mjs
import process from 'process';

process.on('unhandledRejection', (reason, promise) => {
  console.log(
    'Unhandled Rejection at:',
    promise,
    'reason:',
    reason
  );
  // Application specific logging, throwing an error, or other logic here
});

somePromise.then((res) => {
  return reportToUser(JSON.pasre(res)); // Note the typo (`pasre`)
}); // No `.catch()` or `.then()`
```

```cjs
const process = require('process');

process.on('unhandledRejection', (reason, promise) => {
  console.log(
    'Unhandled Rejection at:',
    promise,
    'reason:',
    reason
  );
  // Application specific logging, throwing an error, or other logic here
});

somePromise.then((res) => {
  return reportToUser(JSON.pasre(res)); // Note the typo (`pasre`)
}); // No `.catch()` or `.then()`
```

Следующее также вызовет `'unhandledRejection'` событие, которое будет создано:

```mjs
import process from 'process';

function SomeResource() {
  // Initially set the loaded status to a rejected promise
  this.loaded = Promise.reject(
    new Error('Resource not yet loaded!')
  );
}

const resource = new SomeResource();
// no .catch or .then on resource.loaded for at least a turn
```

```cjs
const process = require('process');

function SomeResource() {
  // Initially set the loaded status to a rejected promise
  this.loaded = Promise.reject(
    new Error('Resource not yet loaded!')
  );
}

const resource = new SomeResource();
// no .catch or .then on resource.loaded for at least a turn
```

В этом примере можно отследить отклонение как ошибку разработчика, как это обычно бывает для других `'unhandledRejection'` События. Для устранения таких сбоев в нерабочем [`.catch(() => { })`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) обработчик может быть прикреплен к `resource.loaded`, что предотвратило бы `'unhandledRejection'` событие от испускания.

### Событие: `'warning'`

<!-- YAML
added: v6.0.0
-->

- `warning` {Error} Ключевые свойства предупреждения:
  - `name` {строка} Название предупреждения. **Дефолт:** `'Warning'`.
  - `message` {строка} Системное описание предупреждения.
  - `stack` {строка} Трассировка стека до места в коде, где было выдано предупреждение.

В `'warning'` Событие генерируется всякий раз, когда Node.js выдает предупреждение процесса.

Предупреждение процесса похоже на ошибку в том, что оно описывает исключительные условия, которые доводятся до сведения пользователя. Однако предупреждения не являются частью обычного потока обработки ошибок Node.js и JavaScript. Node.js может выдавать предупреждения всякий раз, когда обнаруживает неправильные методы кодирования, которые могут привести к неоптимальной производительности приложения, ошибкам или уязвимостям безопасности.

```mjs
import process from 'process';

process.on('warning', (warning) => {
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});
```

```cjs
const process = require('process');

process.on('warning', (warning) => {
  console.warn(warning.name); // Print the warning name
  console.warn(warning.message); // Print the warning message
  console.warn(warning.stack); // Print the stack trace
});
```

По умолчанию Node.js выводит предупреждения о процессе на `stderr`. В `--no-warnings` параметр командной строки может использоваться для подавления вывода консоли по умолчанию, но `'warning'` событие по-прежнему будет генерироваться `process` объект.

В следующем примере показано предупреждение, которое выводится на `stderr` когда к событию добавлено слишком много слушателей:

```console
$ node
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> (node:38638) MaxListenersExceededWarning: Possible EventEmitter memory leak
detected. 2 foo listeners added. Use emitter.setMaxListeners() to increase limit
```

В отличие от этого, в следующем примере отключается вывод предупреждений по умолчанию и добавляется пользовательский обработчик в `'warning'` событие:

```console
$ node --no-warnings
> const p = process.on('warning', (warning) => console.warn('Do not do that!'));
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> Do not do that!
```

В `--trace-warnings` Параметр командной строки может использоваться, чтобы вывод в консоль по умолчанию для предупреждений включал полную трассировку стека предупреждения.

Запуск Node.js с помощью `--throw-deprecation` Флаг командной строки приведет к тому, что пользовательские предупреждения об устаревании будут выдаваться как исключения.

С помощью `--trace-deprecation` флаг командной строки приведет к тому, что пользовательское устаревание будет напечатано на `stderr` вместе с трассировкой стека.

С помощью `--no-deprecation` Флаг командной строки подавит все сообщения о пользовательском устаревании.

В `*-deprecation` флаги командной строки влияют только на предупреждения, использующие имя `'DeprecationWarning'`.

### Событие: `'worker'`

<!-- YAML
added:
  - v16.2.0
  - v14.18.0
-->

- `worker` {Worker} Созданный {Worker}.

В `'worker'` событие генерируется после создания нового потока {Worker}.

#### Выдача настраиваемых предупреждений

Увидеть [`process.emitWarning()`](#processemitwarningwarning-type-code-ctor) метод выдачи настраиваемых предупреждений или предупреждений для конкретных приложений.

#### Имена предупреждений Node.js

Нет никаких строгих правил для типов предупреждений (как указано в `name` property), создаваемый Node.js. Новые типы предупреждений могут быть добавлены в любое время. Вот некоторые из наиболее распространенных типов предупреждений:

- `'DeprecationWarning'` - Указывает на использование устаревшего API или функции Node.js. Такие предупреждения должны включать `'code'` свойство, определяющее [код устаревания](deprecations.md).
- `'ExperimentalWarning'` - Указывает на использование экспериментального API или функции Node.js. Такие функции следует использовать с осторожностью, поскольку они могут измениться в любое время и не подпадают под те же строгие политики семантического управления версиями и долгосрочной поддержки, что и поддерживаемые функции.
- `'MaxListenersExceededWarning'` - Указывает, что слишком много слушателей для данного события было зарегистрировано на каком-либо `EventEmitter` или `EventTarget`. Часто это указывает на утечку памяти.
- `'TimeoutOverflowWarning'` - Указывает, что числовое значение, которое не может поместиться в 32-разрядное целое число со знаком, было предоставлено либо `setTimeout()` или `setInterval()` функции.
- `'UnsupportedWarning'` - Указывает на использование неподдерживаемой опции или функции, которая будет проигнорирована, а не обработана как ошибка. Одним из примеров является использование сообщения о статусе ответа HTTP при использовании API совместимости HTTP / 2.

### Сигнальные события

<!--type=event-->

<!--name=SIGINT, SIGHUP, etc.-->

События сигнала будут отправлены, когда процесс Node.js получит сигнал. Пожалуйста, обратитесь к signal (7) для получения списка стандартных имен сигналов POSIX, таких как `'SIGINT'`, `'SIGHUP'`, так далее.

Сигналы недоступны на [`Worker`](worker_threads.md#class-worker) потоки.

Обработчик сигнала получит имя сигнала (`'SIGINT'`, `'SIGTERM'`и т. д.) в качестве первого аргумента.

Имя каждого события будет общим именем сигнала в верхнем регистре (например, `'SIGINT'` для `SIGINT` сигналы).

```mjs
import process from 'process';

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

```cjs
const process = require('process');

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

- `'SIGUSR1'` зарезервирован Node.js для запуска [отладчик](debugger.md). Можно установить прослушиватель, но это может помешать работе отладчика.
- `'SIGTERM'` а также `'SIGINT'` иметь обработчики по умолчанию на платформах, отличных от Windows, которые сбрасывают режим терминала перед выходом с кодом `128 + signal number`. Если для одного из этих сигналов установлен прослушиватель, его поведение по умолчанию будет удалено (Node.js больше не будет выходить).
- `'SIGPIPE'` по умолчанию игнорируется. Он может иметь установленный слушатель.
- `'SIGHUP'` генерируется в Windows, когда окно консоли закрыто, и на других платформах при различных аналогичных условиях. См. Сигнал (7). У него может быть установлен прослушиватель, однако Node.js будет безоговорочно завершен Windows примерно через 10 секунд. На платформах, отличных от Windows, поведение по умолчанию `SIGHUP` - завершить работу Node.js, но после установки слушателя его поведение по умолчанию будет удалено.
- `'SIGTERM'` не поддерживается в Windows, его можно прослушивать.
- `'SIGINT'` из терминала поддерживается на всех платформах и обычно может быть сгенерирован с помощью <kbd>Ctrl</kbd>+<kbd>C</kbd> (хотя это можно настроить). Он не генерируется, когда [необработанный режим терминала](tty.md#readstreamsetrawmodemode) включен и <kbd>Ctrl</kbd>+<kbd>C</kbd> используется.
- `'SIGBREAK'` поставляется в Windows, когда <kbd>Ctrl</kbd>+<kbd>Перерыв</kbd> нажата. На платформах, отличных от Windows, его можно прослушивать, но нет возможности отправить или сгенерировать его.
- `'SIGWINCH'` доставляется после изменения размера консоли. В Windows это произойдет только при записи в консоль, когда курсор перемещается, или когда читаемый tty используется в необработанном режиме.
- `'SIGKILL'` не может быть установлен слушатель, он безоговорочно завершит работу Node.js на всех платформах.
- `'SIGSTOP'` не может быть установлен слушатель.
- `'SIGBUS'`, `'SIGFPE'`, `'SIGSEGV'` а также `'SIGILL'`, когда не вызывается искусственно с помощью kill (2), по сути, оставляет процесс в состоянии, из которого небезопасно вызывать слушателей JS. Это может привести к тому, что процесс перестанет отвечать.
- `0` могут быть отправлены для проверки существования процесса, это не имеет никакого эффекта, если процесс существует, но выдаст ошибку, если процесс не существует.

Windows не поддерживает сигналы, поэтому не имеет эквивалента прерыванию по сигналу, но Node.js предлагает некоторую эмуляцию с [`process.kill()`](#processkillpid-signal), а также [`subprocess.kill()`](child_process.md#subprocesskillsignal):

- Отправка `SIGINT`, `SIGTERM`, а также `SIGKILL` вызовет безусловное завершение целевого процесса, после чего подпроцесс сообщит, что процесс был завершен сигналом.
- Отправка сигнала `0` может использоваться как независимый от платформы способ проверки существования процесса.

## `process.abort()`

<!-- YAML
added: v0.7.0
-->

В `process.abort()` приводит к немедленному завершению процесса Node.js и генерации основного файла.

Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.allowedNodeEnvironmentFlags`

<!-- YAML
added: v10.10.0
-->

- {Установленный}

В `process.allowedNodeEnvironmentFlags` свойство является специальным, доступным только для чтения `Set` флагов, допустимых в пределах [`NODE_OPTIONS`](cli.md#node_optionsoptions) переменная окружения.

`process.allowedNodeEnvironmentFlags` расширяет `Set`, но отменяет `Set.prototype.has` распознавать несколько различных возможных представлений флагов. `process.allowedNodeEnvironmentFlags.has()` вернусь `true` в следующих случаях:

- Флаги могут опускать ведущий одинарный (`-`) или двойной (`--`) тире; например., `inspect-brk` для `--inspect-brk`, или `r` для `-r`.
- Флаги переданы в V8 (как указано в `--v8-options`) может заменить один или несколько _не ведущий_ дефисы для подчеркивания или наоборот; например., `--perf_basic_prof`, `--perf-basic-prof`, `--perf_basic-prof`, так далее.
- Флаги могут содержать одно или несколько равных (`=`) символы; все символы после первого равенства включительно будут проигнорированы; например., `--stack-trace-limit=100`.
- Флаги _должен_ быть допустимым в [`NODE_OPTIONS`](cli.md#node_optionsoptions).

При повторении `process.allowedNodeEnvironmentFlags`, флаги появятся только _однажды_; каждый будет начинаться с одного или нескольких тире. Флаги, передаваемые в V8, будут содержать символы подчеркивания вместо дефисов в начале:

```mjs
import { allowedNodeEnvironmentFlags } from 'process';

allowedNodeEnvironmentFlags.forEach((flag) => {
  // -r
  // --inspect-brk
  // --abort_on_uncaught_exception
  // ...
});
```

```cjs
const { allowedNodeEnvironmentFlags } = require('process');

allowedNodeEnvironmentFlags.forEach((flag) => {
  // -r
  // --inspect-brk
  // --abort_on_uncaught_exception
  // ...
});
```

Методы `add()`, `clear()`, а также `delete()` из `process.allowedNodeEnvironmentFlags` ничего не делать и тихо потерпит неудачу.

Если Node.js был скомпилирован _без_ [`NODE_OPTIONS`](cli.md#node_optionsoptions) поддержка (показано в [`process.config`](#processconfig)), `process.allowedNodeEnvironmentFlags` будет содержать то, что _имел бы_ было допустимо.

## `process.arch`

<!-- YAML
added: v0.5.0
-->

- {нить}

Архитектура ЦП операционной системы, для которой был скомпилирован двоичный файл Node.js. Возможные значения: `'arm'`, `'arm64'`, `'ia32'`, `'mips'`,`'mipsel'`, `'ppc'`, `'ppc64'`, `'s390'`, `'s390x'`, `'x32'`, а также `'x64'`.

```mjs
import { arch } from 'process';

console.log(`This processor architecture is ${arch}`);
```

```cjs
const { arch } = require('process');

console.log(
  `This processor architecture is ${process.arch}`
);
```

## `process.argv`

<!-- YAML
added: v0.1.27
-->

- {нить\[]}

В `process.argv` Свойство возвращает массив, содержащий аргументы командной строки, переданные при запуске процесса Node.js. Первый элемент будет [`process.execPath`](#processexecpath). Видеть `process.argv0` если доступ к исходному значению `argv[0]` необходим. Второй элемент - это путь к исполняемому файлу JavaScript. Остальные элементы будут любыми дополнительными аргументами командной строки.

Например, если следующий сценарий для `process-args.js`:

```mjs
import { argv } from 'process';

// print process.argv
argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
```

```cjs
const { argv } = require('process');

// print process.argv
argv.forEach((val, index) => {
  console.log(`${index}: ${val}`);
});
```

Запуск процесса Node.js как:

```console
$ node process-args.js one two=three four
```

Сгенерирует вывод:

```text
0: /usr/local/bin/node
1: /Users/mjr/work/node/process-args.js
2: one
3: two=three
4: four
```

## `process.argv0`

<!-- YAML
added: v6.4.0
-->

- {нить}

В `process.argv0` свойство хранит доступную только для чтения копию исходного значения `argv[0]` передается при запуске Node.js.

```console
$ bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```

## `process.channel`

<!-- YAML
added: v7.1.0
changes:
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30165
    description: The object no longer accidentally exposes native C++ bindings.
-->

- {Объект}

Если процесс Node.js был порожден с каналом IPC (см. [Дочерний процесс](child_process.md) документация), `process.channel` свойство - это ссылка на канал IPC. Если канал IPC не существует, это свойство `undefined`.

### `process.channel.ref()`

<!-- YAML
added: v7.1.0
-->

Этот метод заставляет канал IPC поддерживать цикл обработки событий запущенного процесса, если `.unref()` был вызван раньше.

Обычно это достигается за счет количества `'disconnect'` а также `'message'` слушатели на `process` объект. Однако этот метод можно использовать для явного запроса определенного поведения.

### `process.channel.unref()`

<!-- YAML
added: v7.1.0
-->

Этот метод заставляет канал IPC не поддерживать цикл обработки событий процесса и позволяет ему завершиться, даже когда канал открыт.

Обычно это достигается за счет количества `'disconnect'` а также `'message'` слушатели на `process` объект. Однако этот метод можно использовать для явного запроса определенного поведения.

## `process.chdir(directory)`

<!-- YAML
added: v0.1.17
-->

- `directory` {нить}

В `process.chdir()` изменяет текущий рабочий каталог процесса Node.js или выдает исключение, если это не удается (например, если указанный `directory` не существует).

```mjs
import { chdir, cwd } from 'process';

console.log(`Starting directory: ${cwd()}`);
try {
  chdir('/tmp');
  console.log(`New directory: ${cwd()}`);
} catch (err) {
  console.error(`chdir: ${err}`);
}
```

```cjs
const { chdir, cwd } = require('process');

console.log(`Starting directory: ${cwd()}`);
try {
  chdir('/tmp');
  console.log(`New directory: ${cwd()}`);
} catch (err) {
  console.error(`chdir: ${err}`);
}
```

Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.config`

<!-- YAML
added: v0.7.7
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/36902
    description: Modifying process.config has been deprecated.
-->

- {Объект}

В `process.config` свойство возвращает `Object` содержащий представление JavaScript параметров конфигурации, используемых для компиляции текущего исполняемого файла Node.js. Это то же самое, что и `config.gypi` файл, созданный при запуске `./configure` сценарий.

Пример возможного вывода выглядит так:

<!-- eslint-skip -->

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
     node_use_dtrace: 'false',
     node_use_openssl: 'true',
     node_shared_openssl: 'false',
     strict_aliasing: 'true',
     target_arch: 'x64',
     v8_use_snapshot: 1
   }
}
```

В `process.config` собственность **нет** только для чтения, и в экосистеме есть существующие модули, которые, как известно, расширяют, изменяют или полностью заменяют значение `process.config`.

Изменение `process.config` свойство или любое дочернее свойство `process.config` объект устарел. В `process.config` в будущем выпуске будет доступен только для чтения.

## `process.connected`

<!-- YAML
added: v0.7.2
-->

- {логический}

Если процесс Node.js порождается с каналом IPC (см. [Дочерний процесс](child_process.md) а также [Кластер](cluster.md) документация), `process.connected` собственность вернется `true` пока канал IPC подключен и вернется `false` после `process.disconnect()` называется.

Один раз `process.connected` является `false`, больше невозможно отправлять сообщения по каналу IPC, используя `process.send()`.

## `process.cpuUsage([previousValue])`

<!-- YAML
added: v6.1.0
-->

- `previousValue` {Object} Предыдущее значение, возвращаемое при вызове `process.cpuUsage()`
- Возвращает: {Object}
  - `user` {целое число}
  - `system` {целое число}

В `process.cpuUsage()` метод возвращает пользовательское и системное использование процессорного времени текущего процесса в объекте со свойствами `user` а также `system`, значения которых представляют собой микросекундные значения (миллионные доли секунды). Эти значения измеряют время, затраченное на пользовательский и системный код соответственно, и могут оказаться больше фактического затраченного времени, если несколько ядер ЦП выполняют работу для этого процесса.

Результат предыдущего вызова `process.cpuUsage()` может быть передан в качестве аргумента функции, чтобы получить показание разницы.

```mjs
import { cpuUsage } from 'process';

const startUsage = cpuUsage();
// { user: 38579, system: 6986 }

// spin the CPU for 500 milliseconds
const now = Date.now();
while (Date.now() - now < 500);

console.log(cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

```cjs
const { cpuUsage } = require('process');

const startUsage = cpuUsage();
// { user: 38579, system: 6986 }

// spin the CPU for 500 milliseconds
const now = Date.now();
while (Date.now() - now < 500);

console.log(cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

## `process.cwd()`

<!-- YAML
added: v0.1.8
-->

- Возвращает: {строка}

В `process.cwd()` метод возвращает текущий рабочий каталог процесса Node.js.

```mjs
import { cwd } from 'process';

console.log(`Current directory: ${cwd()}`);
```

```cjs
const { cwd } = require('process');

console.log(`Current directory: ${cwd()}`);
```

## `process.debugPort`

<!-- YAML
added: v0.7.2
-->

- {количество}

Порт, используемый отладчиком Node.js, когда он включен.

```mjs
import process from 'process';

process.debugPort = 5858;
```

```cjs
const process = require('process');

process.debugPort = 5858;
```

## `process.disconnect()`

<!-- YAML
added: v0.7.2
-->

Если процесс Node.js порождается с каналом IPC (см. [Дочерний процесс](child_process.md) а также [Кластер](cluster.md) документация), `process.disconnect()` Метод закроет канал IPC для родительского процесса, позволяя дочернему процессу корректно завершиться, если нет других соединений, поддерживающих его работу.

Эффект звонка `process.disconnect()` это то же самое, что и звонок [`ChildProcess.disconnect()`](child_process.md#subprocessdisconnect) из родительского процесса.

Если процесс Node.js не был создан с каналом IPC, `process.disconnect()` будет `undefined`.

## `process.dlopen(module, filename[, flags])`

<!-- YAML
added: v0.1.16
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/12794
    description: Added support for the `flags` argument.
-->

- `module` {Объект}
- `filename` {нить}
- `flags` {os.constants.dlopen} **Дефолт:** `os.constants.dlopen.RTLD_LAZY`

В `process.dlopen()` Метод позволяет динамически загружать общие объекты. Он в основном используется `require()` для загрузки надстроек C ++ и не должны использоваться напрямую, за исключением особых случаев. Другими словами, [`require()`](globals.md#require) следует предпочесть `process.dlopen()` если нет особых причин, таких как настраиваемые флаги dlopen или загрузка из модулей ES.

В `flags` Аргумент - это целое число, которое позволяет указать поведение dlopen. Увидеть [`os.constants.dlopen`](os.md#dlopen-constants) документация для деталей.

Важное требование при звонке `process.dlopen()` это то `module` экземпляр должен быть передан. Функции, экспортируемые C ++ Addon, затем доступны через `module.exports`.

В приведенном ниже примере показано, как загрузить аддон C ++ с именем `local.node`, который экспортирует `foo` функция. Все символы загружаются перед возвратом вызова путем передачи `RTLD_NOW` постоянный. В этом примере предполагается, что постоянная доступна.

```mjs
import { dlopen } from 'process';
import { constants } from 'os';
import { fileURLToPath } from 'url';

const module = { exports: {} };
dlopen(
  module,
  fileURLToPath(new URL('local.node', import.meta.url)),
  constants.dlopen.RTLD_NOW
);
module.exports.foo();
```

```cjs
const { dlopen } = require('process');
const { constants } = require('os');
const { join } = require('path');

const module = { exports: {} };
dlopen(
  module,
  join(__dirname, 'local.node'),
  constants.dlopen.RTLD_NOW
);
module.exports.foo();
```

## `process.emitWarning(warning[, options])`

<!-- YAML
added: v8.0.0
-->

- `warning` {строка | Ошибка} Предупреждение, которое нужно выдать.
- `options` {Объект}
  - `type` {строка} Когда `warning` это `String`, `type` это имя, которое нужно использовать для _тип_ предупреждения. **Дефолт:** `'Warning'`.
  - `code` {строка} Уникальный идентификатор отправляемого экземпляра предупреждения.
  - `ctor` {Функция} Когда `warning` это `String`, `ctor` - необязательная функция, используемая для ограничения сгенерированной трассировки стека. **Дефолт:** `process.emitWarning`.
  - `detail` {строка} Дополнительный текст, включаемый в сообщение об ошибке.

В `process.emitWarning()` может использоваться для выдачи настраиваемых предупреждений процесса или предупреждений для конкретного приложения. Их можно прослушать, добавив обработчик к [`'warning'`](#event-warning) событие.

```mjs
import { emitWarning } from 'process';

// Emit a warning with a code and additional detail.
emitWarning('Something happened!', {
  code: 'MY_WARNING',
  detail: 'This is some additional information',
});
// Emits:
// (node:56338) [MY_WARNING] Warning: Something happened!
// This is some additional information
```

```cjs
const { emitWarning } = require('process');

// Emit a warning with a code and additional detail.
emitWarning('Something happened!', {
  code: 'MY_WARNING',
  detail: 'This is some additional information',
});
// Emits:
// (node:56338) [MY_WARNING] Warning: Something happened!
// This is some additional information
```

В этом примере `Error` объект создается внутри `process.emitWarning()` и прошел в [`'warning'`](#event-warning) обработчик.

```mjs
import process from 'process';

process.on('warning', (warning) => {
  console.warn(warning.name); // 'Warning'
  console.warn(warning.message); // 'Something happened!'
  console.warn(warning.code); // 'MY_WARNING'
  console.warn(warning.stack); // Stack trace
  console.warn(warning.detail); // 'This is some additional information'
});
```

```cjs
const process = require('process');

process.on('warning', (warning) => {
  console.warn(warning.name); // 'Warning'
  console.warn(warning.message); // 'Something happened!'
  console.warn(warning.code); // 'MY_WARNING'
  console.warn(warning.stack); // Stack trace
  console.warn(warning.detail); // 'This is some additional information'
});
```

Если `warning` передается как `Error` объект, `options` аргумент игнорируется.

## `process.emitWarning(warning[, type[, code]][, ctor])`

<!-- YAML
added: v6.0.0
-->

- `warning` {строка | Ошибка} Предупреждение, которое нужно выдать.
- `type` {строка} Когда `warning` это `String`, `type` это имя, которое нужно использовать для _тип_ предупреждения. **Дефолт:** `'Warning'`.
- `code` {строка} Уникальный идентификатор отправляемого экземпляра предупреждения.
- `ctor` {Функция} Когда `warning` это `String`, `ctor` - необязательная функция, используемая для ограничения сгенерированной трассировки стека. **Дефолт:** `process.emitWarning`.

В `process.emitWarning()` может использоваться для выдачи настраиваемых предупреждений процесса или предупреждений для конкретного приложения. Их можно прослушать, добавив обработчик к [`'warning'`](#event-warning) событие.

```mjs
import { emitWarning } from 'process';

// Emit a warning using a string.
emitWarning('Something happened!');
// Emits: (node: 56338) Warning: Something happened!
```

```cjs
const { emitWarning } = require('process');

// Emit a warning using a string.
emitWarning('Something happened!');
// Emits: (node: 56338) Warning: Something happened!
```

```mjs
import { emitWarning } from 'process';

// Emit a warning using a string and a type.
emitWarning('Something Happened!', 'CustomWarning');
// Emits: (node:56338) CustomWarning: Something Happened!
```

```cjs
const { emitWarning } = require('process');

// Emit a warning using a string and a type.
emitWarning('Something Happened!', 'CustomWarning');
// Emits: (node:56338) CustomWarning: Something Happened!
```

```mjs
import { emitWarning } from 'process';

emitWarning(
  'Something happened!',
  'CustomWarning',
  'WARN001'
);
// Emits: (node:56338) [WARN001] CustomWarning: Something happened!
```

```cjs
const { emitWarning } = require('process');

process.emitWarning(
  'Something happened!',
  'CustomWarning',
  'WARN001'
);
// Emits: (node:56338) [WARN001] CustomWarning: Something happened!
```

В каждом из предыдущих примеров `Error` объект создается внутри `process.emitWarning()` и прошел в [`'warning'`](#event-warning) обработчик.

```mjs
import process from 'process';

process.on('warning', (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.code);
  console.warn(warning.stack);
});
```

```cjs
const process = require('process');

process.on('warning', (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.code);
  console.warn(warning.stack);
});
```

Если `warning` передается как `Error` объект, он будет передан в `'warning'` обработчик событий без изменений (и необязательный `type`, `code` а также `ctor` аргументы будут проигнорированы):

```mjs
import { emitWarning } from 'process';

// Emit a warning using an Error object.
const myWarning = new Error('Something happened!');
// Use the Error name property to specify the type name
myWarning.name = 'CustomWarning';
myWarning.code = 'WARN001';

emitWarning(myWarning);
// Emits: (node:56338) [WARN001] CustomWarning: Something happened!
```

```cjs
const { emitWarning } = require('process');

// Emit a warning using an Error object.
const myWarning = new Error('Something happened!');
// Use the Error name property to specify the type name
myWarning.name = 'CustomWarning';
myWarning.code = 'WARN001';

emitWarning(myWarning);
// Emits: (node:56338) [WARN001] CustomWarning: Something happened!
```

А `TypeError` бросается, если `warning` это что-нибудь кроме строки или `Error` объект.

В то время как предупреждения процесса используют `Error` объектов, механизм предупреждения процесса **нет** замена обычных механизмов обработки ошибок.

Следующая дополнительная обработка реализуется, если предупреждение `type` является `'DeprecationWarning'`:

- Если `--throw-deprecation` Если используется флаг командной строки, предупреждение об устаревании выдается как исключение, а не как событие.
- Если `--no-deprecation` используется флаг командной строки, предупреждение об устаревании подавляется.
- Если `--trace-deprecation` используется флаг командной строки, предупреждение об устаревании выводится на `stderr` вместе с полной трассировкой стека.

### Избегайте повторяющихся предупреждений

Рекомендуется выдавать предупреждения только один раз для каждого процесса. Для этого рекомендуется разместить `emitWarning()` за простым логическим флагом, как показано в примере ниже:

```mjs
import { emitWarning } from 'process';

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

```cjs
const { emitWarning } = require('process');

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

<!-- YAML
added: v0.1.27
changes:
  - version: v11.14.0
    pr-url: https://github.com/nodejs/node/pull/26544
    description: Worker threads will now use a copy of the parent thread’s
                 `process.env` by default, configurable through the `env`
                 option of the `Worker` constructor.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18990
    description: Implicit conversion of variable value to string is deprecated.
-->

- {Объект}

В `process.env` свойство возвращает объект, содержащий пользовательскую среду. Смотрите среду (7).

Пример этого объекта выглядит так:

<!-- eslint-skip -->

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

Этот объект можно изменить, но такие изменения не будут отражены вне процесса Node.js или (если явно не запрошено) на другие [`Worker`](worker_threads.md#class-worker) потоки. Другими словами, следующий пример не будет работать:

```console
$ node -e 'process.env.foo = "bar"' && echo $foo
```

Пока будет следующее:

```mjs
import { env } from 'process';

env.foo = 'bar';
console.log(env.foo);
```

```cjs
const { env } = require('process');

env.foo = 'bar';
console.log(env.foo);
```

Назначение собственности на `process.env` неявно преобразует значение в строку. **Такое поведение устарело.** В будущих версиях Node.js может возникнуть ошибка, если значение не является строкой, числом или логическим значением.

```mjs
import { env } from 'process';

env.test = null;
console.log(env.test);
// => 'null'
env.test = undefined;
console.log(env.test);
// => 'undefined'
```

```cjs
const { env } = require('process');

env.test = null;
console.log(env.test);
// => 'null'
env.test = undefined;
console.log(env.test);
// => 'undefined'
```

Использовать `delete` удалить собственность из `process.env`.

```mjs
import { env } from 'process';

env.TEST = 1;
delete env.TEST;
console.log(env.TEST);
// => undefined
```

```cjs
const { env } = require('process');

env.TEST = 1;
delete env.TEST;
console.log(env.TEST);
// => undefined
```

В операционных системах Windows переменные среды нечувствительны к регистру.

```mjs
import { env } from 'process';

env.TEST = 1;
console.log(env.test);
// => 1
```

```cjs
const { env } = require('process');

env.TEST = 1;
console.log(env.test);
// => 1
```

Если явно не указано при создании [`Worker`](worker_threads.md#class-worker) например, каждый [`Worker`](worker_threads.md#class-worker) поток имеет свою собственную копию `process.env`на основе родительского потока `process.env`, или что-то еще, что было указано как `env` вариант для [`Worker`](worker_threads.md#class-worker) конструктор. Изменения к `process.env` не будет видно через [`Worker`](worker_threads.md#class-worker) потоков, и только основной поток может вносить изменения, которые видны операционной системе или собственным надстройкам.

## `process.execArgv`

<!-- YAML
added: v0.7.7
-->

- {нить\[]}

В `process.execArgv` Свойство возвращает набор специфичных для Node.js параметров командной строки, переданных при запуске процесса Node.js. Эти параметры не отображаются в массиве, возвращаемом [`process.argv`](#processargv) и не включайте исполняемый файл Node.js, имя сценария или любые параметры, следующие за именем сценария. Эти параметры полезны для создания дочерних процессов с той же средой выполнения, что и родительский.

```console
$ node --harmony script.js --version
```

Результаты в `process.execArgv`:

<!-- eslint-disable semi -->

```js
['--harmony'];
```

А также `process.argv`:

<!-- eslint-disable semi -->

```js
['/usr/local/bin/node', 'script.js', '--version'];
```

Ссылаться на [`Worker` конструктор](worker_threads.md#new-workerfilename-options) для подробного описания поведения рабочих потоков с этим свойством.

## `process.execPath`

<!-- YAML
added: v0.1.100
-->

- {нить}

В `process.execPath` Свойство возвращает абсолютный путь к исполняемому файлу, запустившему процесс Node.js. Символические ссылки, если они есть, разрешаются.

<!-- eslint-disable semi -->

```js
'/usr/local/bin/node';

```

## `process.exit([code])`

<!-- YAML
added: v0.1.13
-->

- `code` {integer} Код выхода. **Дефолт:** `0`.

В `process.exit()` инструктирует Node.js завершить процесс синхронно со статусом выхода `code`. Если `code` опущен, для выхода используется либо код успеха `0` или ценность `process.exitCode` если он был установлен. Node.js не прекратит работу, пока все [`'exit'`](#event-exit) вызываются слушатели событий.

Чтобы выйти с кодом ошибки:

```mjs
import { exit } from 'process';

exit(1);
```

```cjs
const { exit } = require('process');

exit(1);
```

Оболочка, выполнившая Node.js, должна видеть код выхода как `1`.

Вызов `process.exit()` заставит процесс завершиться как можно быстрее, даже если есть еще ожидающие асинхронные операции, которые еще не завершены полностью, включая операции ввода-вывода для `process.stdout` а также `process.stderr`.

В большинстве случаев звонить `process.exit()` явно. Процесс Node.js завершится сам по себе _если нет ожидающих дополнительных работ_ в цикле событий. В `process.exitCode` Свойство может быть установлено, чтобы сообщить процессу, какой код выхода использовать, когда процесс завершается корректно.

Например, следующий пример иллюстрирует _злоупотребление_ принадлежащий `process.exit()` метод, который может привести к усечению и потере данных, выводимых на стандартный вывод:

```mjs
import { exit } from 'process';

// This is an example of what *not* to do:
if (someConditionNotMet()) {
  printUsageToStdout();
  exit(1);
}
```

```cjs
const { exit } = require('process');

// This is an example of what *not* to do:
if (someConditionNotMet()) {
  printUsageToStdout();
  exit(1);
}
```

Причина, по которой это проблематично, заключается в том, что запись в `process.stdout` в Node.js иногда _асинхронный_ и может произойти за несколько тиков цикла событий Node.js. Вызов `process.exit()`, однако, принудительно завершает процесс _до_ эти дополнительные записи в `stdout` может быть выполнено.

Вместо того, чтобы звонить `process.exit()` напрямую, код _должен_ установить `process.exitCode` и позволить процессу завершиться естественным образом, избегая планирования какой-либо дополнительной работы для цикла событий:

```mjs
import process from 'process';

// How to properly set the exit code while letting
// the process exit gracefully.
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exitCode = 1;
}
```

```cjs
const process = require('process');

// How to properly set the exit code while letting
// the process exit gracefully.
if (someConditionNotMet()) {
  printUsageToStdout();
  process.exitCode = 1;
}
```

Если необходимо завершить процесс Node.js из-за состояния ошибки, бросается _непойманный_ ошибка и разрешение процесса завершиться соответствующим образом безопаснее, чем вызов `process.exit()`.

В [`Worker`](worker_threads.md#class-worker) потоков, эта функция останавливает текущий поток, а не текущий процесс.

## `process.exitCode`

<!-- YAML
added: v0.11.8
-->

- {целое число}

Число, которое будет кодом выхода процесса, когда процесс завершается корректно или завершается через [`process.exit()`](#processexitcode) без указания кода.

Указание кода для [`process.exit(code)`](#processexitcode) отменяет любую предыдущую настройку `process.exitCode`.

## `process.getegid()`

<!-- YAML
added: v2.0.0
-->

В `process.getegid()` метод возвращает числовую эффективную групповую идентификацию процесса Node.js. (См. Getegid (2).)

```mjs
import process from 'process';

if (process.getegid) {
  console.log(`Current gid: ${process.getegid()}`);
}
```

```cjs
const process = require('process');

if (process.getegid) {
  console.log(`Current gid: ${process.getegid()}`);
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android).

## `process.geteuid()`

<!-- YAML
added: v2.0.0
-->

- Возвращает: {Object}

В `process.geteuid()` Метод возвращает числовой идентификатор эффективного пользователя процесса. (См. Geteuid (2).)

```mjs
import process from 'process';

if (process.geteuid) {
  console.log(`Current uid: ${process.geteuid()}`);
}
```

```cjs
const process = require('process');

if (process.geteuid) {
  console.log(`Current uid: ${process.geteuid()}`);
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android).

## `process.getgid()`

<!-- YAML
added: v0.1.31
-->

- Возвращает: {Object}

В `process.getgid()` Метод возвращает числовую групповую идентификацию процесса. (См. Getgid (2).)

```mjs
import process from 'process';

if (process.getgid) {
  console.log(`Current gid: ${process.getgid()}`);
}
```

```cjs
const process = require('process');

if (process.getgid) {
  console.log(`Current gid: ${process.getgid()}`);
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android).

## `process.getgroups()`

<!-- YAML
added: v0.9.4
-->

- Возвращает: {integer \[]}

В `process.getgroups()` Метод возвращает массив с дополнительными идентификаторами групп. POSIX оставляет его неопределенным, если включен эффективный идентификатор группы, но Node.js гарантирует, что это всегда будет.

```mjs
import process from 'process';

if (process.getgroups) {
  console.log(process.getgroups()); // [ 16, 21, 297 ]
}
```

```cjs
const process = require('process');

if (process.getgroups) {
  console.log(process.getgroups()); // [ 16, 21, 297 ]
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android).

## `process.getuid()`

<!-- YAML
added: v0.1.28
-->

- Возвращает: {целое число}

В `process.getuid()` Метод возвращает числовой идентификатор пользователя процесса. (См. Getuid (2).)

```mjs
import process from 'process';

if (process.getuid) {
  console.log(`Current uid: ${process.getuid()}`);
}
```

```cjs
const process = require('process');

if (process.getuid) {
  console.log(`Current uid: ${process.getuid()}`);
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android).

## `process.hasUncaughtExceptionCaptureCallback()`

<!-- YAML
added: v9.3.0
-->

- Возвращает: {логическое}

Указывает, был ли установлен обратный вызов с помощью [`process.setUncaughtExceptionCaptureCallback()`](#processsetuncaughtexceptioncapturecallbackfn).

## `process.hrtime([time])`

<!-- YAML
added: v0.7.6
-->

> Стабильность: 3 - Наследие. Использовать [`process.hrtime.bigint()`](#processhrtimebigint) вместо.

- `time` {integer \[]} Результат предыдущего вызова `process.hrtime()`
- Возвращает: {integer \[]}

Это устаревшая версия [`process.hrtime.bigint()`](#processhrtimebigint) до `bigint` был введен в JavaScript.

В `process.hrtime()` метод возвращает текущее реальное время с высоким разрешением в `[seconds, nanoseconds]` кортеж `Array`, куда `nanoseconds` - это оставшаяся часть реального времени, которая не может быть представлена со второй точностью.

`time` - необязательный параметр, который должен быть результатом предыдущего `process.hrtime()` вызовите разницу с текущим временем. Если переданный параметр не кортеж `Array`, а `TypeError` будет брошен. Передача определенного пользователем массива вместо результата предыдущего вызова `process.hrtime()` приведет к неопределенному поведению.

Эти времена относятся к произвольному времени в прошлом и не связаны со временем дня и, следовательно, не подвержены дрейфу часов. Основное использование - измерение производительности между интервалами:

```mjs
import { hrtime } from 'process';

const NS_PER_SEC = 1e9;
const time = hrtime();
// [ 1800216, 25 ]

setTimeout(() => {
  const diff = hrtime(time);
  // [ 1, 552 ]

  console.log(
    `Benchmark took ${
      diff[0] * NS_PER_SEC + diff[1]
    } nanoseconds`
  );
  // Benchmark took 1000000552 nanoseconds
}, 1000);
```

```cjs
const { hrtime } = require('process');

const NS_PER_SEC = 1e9;
const time = hrtime();
// [ 1800216, 25 ]

setTimeout(() => {
  const diff = hrtime(time);
  // [ 1, 552 ]

  console.log(
    `Benchmark took ${
      diff[0] * NS_PER_SEC + diff[1]
    } nanoseconds`
  );
  // Benchmark took 1000000552 nanoseconds
}, 1000);
```

## `process.hrtime.bigint()`

<!-- YAML
added: v10.7.0
-->

- Возврат: {bigint}

В `bigint` версия [`process.hrtime()`](#processhrtimetime) метод, возвращающий текущее реальное время с высоким разрешением в наносекундах как `bigint`.

В отличие от [`process.hrtime()`](#processhrtimetime), он не поддерживает дополнительные `time` аргумент, так как разницу можно просто вычислить непосредственно вычитанием двух `bigint`с.

```mjs
import { hrtime } from 'process';

const start = hrtime.bigint();
// 191051479007711n

setTimeout(() => {
  const end = hrtime.bigint();
  // 191052633396993n

  console.log(`Benchmark took ${end - start} nanoseconds`);
  // Benchmark took 1154389282 nanoseconds
}, 1000);
```

```cjs
const { hrtime } = require('process');

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

<!-- YAML
added: v0.9.4
-->

- `user` {строка | число} Имя пользователя или числовой идентификатор.
- `extraGroup` {строка | число} Имя группы или числовой идентификатор.

В `process.initgroups()` метод читает `/etc/group` файл и инициализирует список доступа группы, используя все группы, членом которых является пользователь. Это привилегированная операция, требующая, чтобы процесс Node.js имел `root` доступ или `CAP_SETGID` возможность.

Будьте осторожны при отказе от привилегий:

```mjs
import { getgroups, initgroups, setgid } from 'process';

console.log(getgroups()); // [ 0 ]
initgroups('nodeuser', 1000); // switch user
console.log(getgroups()); // [ 27, 30, 46, 1000, 0 ]
setgid(1000); // drop root gid
console.log(getgroups()); // [ 27, 30, 46, 1000 ]
```

```cjs
const {
  getgroups,
  initgroups,
  setgid,
} = require('process');

console.log(getgroups()); // [ 0 ]
initgroups('nodeuser', 1000); // switch user
console.log(getgroups()); // [ 27, 30, 46, 1000, 0 ]
setgid(1000); // drop root gid
console.log(getgroups()); // [ 27, 30, 46, 1000 ]
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android). Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.kill(pid[, signal])`

<!-- YAML
added: v0.0.6
-->

- `pid` {number} идентификатор процесса
- `signal` {строка | число} Сигнал для отправки в виде строки или числа. **Дефолт:** `'SIGTERM'`.

В `process.kill()` метод отправляет `signal` к процессу, определенному `pid`.

Имена сигналов представляют собой строки, такие как `'SIGINT'` или `'SIGHUP'`. Видеть [Сигнальные события](#signal-events) и kill (2) для получения дополнительной информации.

Этот метод выдаст ошибку, если цель `pid` не существует. В частном случае сигнал `0` может использоваться для проверки существования процесса. Платформы Windows выдадут ошибку, если `pid` используется для уничтожения группы процессов.

Хотя имя этой функции `process.kill()`, на самом деле это просто отправитель сигнала, как и `kill` системный вызов. Отправленный сигнал может делать что-то другое, кроме уничтожения целевого процесса.

```mjs
import process, { kill } from 'process';

process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
});

setTimeout(() => {
  console.log('Exiting.');
  process.exit(0);
}, 100);

kill(process.pid, 'SIGHUP');
```

```cjs
const process = require('process');

process.on('SIGHUP', () => {
  console.log('Got SIGHUP signal.');
});

setTimeout(() => {
  console.log('Exiting.');
  process.exit(0);
}, 100);

process.kill(process.pid, 'SIGHUP');
```

Когда `SIGUSR1` получен процессом Node.js, Node.js запустит отладчик. Видеть [Сигнальные события](#signal-events).

## `process.mainModule`

<!-- YAML
added: v0.1.17
deprecated: v14.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`require.main`](modules.md#accessing-the-main-module) вместо.

- {Объект}

В `process.mainModule` свойство предоставляет альтернативный способ получения [`require.main`](modules.md#accessing-the-main-module). Разница в том, что если основной модуль изменяется во время выполнения, [`require.main`](modules.md#accessing-the-main-module) может по-прежнему относиться к исходному основному модулю в модулях, которые требовались до того, как произошло изменение. Как правило, можно с уверенностью предположить, что они относятся к одному и тому же модулю.

Как и в случае с [`require.main`](modules.md#accessing-the-main-module), `process.mainModule` будет `undefined` если нет скрипта входа.

## `process.memoryUsage()`

<!-- YAML
added: v0.1.16
changes:
  - version:
     - v13.9.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/31550
    description: Added `arrayBuffers` to the returned object.
  - version: v7.2.0
    pr-url: https://github.com/nodejs/node/pull/9587
    description: Added `external` to the returned object.
-->

- Возвращает: {Object}
  - `rss` {целое число}
  - `heapTotal` {целое число}
  - `heapUsed` {целое число}
  - `external` {целое число}
  - `arrayBuffers` {целое число}

Возвращает объект, описывающий использование памяти процессом Node.js, измеренное в байтах.

```mjs
import { memoryUsage } from 'process';

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

```cjs
const { memoryUsage } = require('process');

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

- `heapTotal` а также `heapUsed` обратитесь к использованию памяти V8.
- `external` относится к использованию памяти объектами C ++, привязанными к объектам JavaScript, управляемым V8.
- `rss`Размер резидентного набора - это объем пространства, занимаемого в устройстве основной памяти (то есть подмножеством общей выделенной памяти) для процесса, включая все объекты и код C ++ и JavaScript.
- `arrayBuffers` относится к памяти, выделенной для `ArrayBuffer`песок `SharedArrayBuffer`s, включая все Node.js [`Buffer`](buffer.md)с. Это также включено в `external` ценить. Когда Node.js используется как встроенная библиотека, это значение может быть `0` потому что ассигнования на `ArrayBuffer`s может не отслеживаться в этом случае.

Когда используешь [`Worker`](worker_threads.md#class-worker) потоки, `rss` будет значением, действительным для всего процесса, в то время как другие поля будут относиться только к текущему потоку.

В `process.memoryUsage()` метод выполняет итерацию по каждой странице для сбора информации об использовании памяти, которая может быть медленной в зависимости от распределения памяти программы.

## `process.memoryUsage.rss()`

<!-- YAML
added:
  - v15.6.0
  - v14.18.0
-->

- Возвращает: {целое число}

В `process.memoryUsage.rss()` возвращает целое число, представляющее размер резидентного набора (RSS) в байтах.

Размер резидентного набора - это объем пространства, занимаемого в устройстве основной памяти (то есть подмножеством общей выделенной памяти) для процесса, включая все объекты и код C ++ и JavaScript.

Это то же значение, что и `rss` собственность предоставлена `process.memoryUsage()` но `process.memoryUsage.rss()` быстрее.

```mjs
import { memoryUsage } from 'process';

console.log(memoryUsage.rss());
// 35655680
```

```cjs
const { rss } = require('process');

console.log(memoryUsage.rss());
// 35655680
```

## `process.nextTick(callback[, ...args])`

<!-- YAML
added: v0.1.26
changes:
  - version: v1.8.1
    pr-url: https://github.com/nodejs/node/pull/1077
    description: Additional arguments after `callback` are now supported.
-->

- `callback` {Функция}
- `...args` {any} Дополнительные аргументы, передаваемые при вызове `callback`

`process.nextTick()` добавляет `callback` в «очередь следующего тика». Эта очередь полностью опустошается после того, как текущая операция в стеке JavaScript завершится до завершения и до того, как цикл обработки событий будет разрешен для продолжения. Можно создать бесконечный цикл, если рекурсивно вызвать `process.nextTick()`. Увидеть [Цикл событий](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#process-nexttick) руководство для получения дополнительной информации.

```mjs
import { nextTick } from 'process';

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

```cjs
const { nextTick } = require('process');

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

Это важно при разработке API, чтобы дать пользователям возможность назначать обработчики событий. _после_ объект был построен, но до того, как произошел какой-либо ввод-вывод:

```mjs
import { nextTick } from 'process';

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

```cjs
const { nextTick } = require('process');

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

Очень важно, чтобы API были на 100% синхронными или на 100% асинхронными. Рассмотрим этот пример:

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

Этот API опасен, потому что в следующем случае:

```js
const maybeTrue = Math.random() > 0.5;

maybeSync(maybeTrue, () => {
  foo();
});

bar();
```

Неясно, действительно ли `foo()` или `bar()` будет называться первым.

Намного лучше следующий подход:

```mjs
import { nextTick } from 'process';

function definitelyAsync(arg, cb) {
  if (arg) {
    nextTick(cb);
    return;
  }

  fs.stat('file', cb);
}
```

```cjs
const { nextTick } = require('process');

function definitelyAsync(arg, cb) {
  if (arg) {
    nextTick(cb);
    return;
  }

  fs.stat('file', cb);
}
```

### Когда использовать `queueMicrotask()` против. `process.nextTick()`

В [`queueMicrotask()`](globals.md#queuemicrotaskcallback) API - альтернатива `process.nextTick()` который также откладывает выполнение функции с использованием той же очереди микрозадач, которая использовалась для выполнения обработчиков then, catch и finally разрешенных обещаний. В Node.js каждый раз, когда опорожняется «очередь следующих тиков», сразу же после этого опорожняется очередь микрозадач.

```mjs
import { nextTick } from 'process';

Promise.resolve().then(() => console.log(2));
queueMicrotask(() => console.log(3));
nextTick(() => console.log(1));
// Output:
// 1
// 2
// 3
```

```cjs
const { nextTick } = require('process');

Promise.resolve().then(() => console.log(2));
queueMicrotask(() => console.log(3));
nextTick(() => console.log(1));
// Output:
// 1
// 2
// 3
```

Для _самый_ сценарии использования пользовательской среды, `queueMicrotask()` API предоставляет переносимый и надежный механизм для отсрочки выполнения, который работает в нескольких средах платформы JavaScript и заслуживает предпочтения перед `process.nextTick()`. В простых сценариях `queueMicrotask()` может быть прямой заменой для `process.nextTick()`.

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

Одно заслуживающее внимания различие между двумя API заключается в том, что `process.nextTick()` позволяет указать дополнительные значения, которые будут переданы в качестве аргументов отложенной функции при ее вызове. Достижение того же результата с `queueMicrotask()` требует использования либо замыкания, либо связанной функции:

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

Существуют незначительные различия в способах обработки ошибок, возникающих в очереди следующих тиков и очереди микрозадач. Ошибки, возникающие при обратном вызове микрозадач в очереди, должны обрабатываться в обратном вызове в очереди, когда это возможно. Если это не так, `process.on('uncaughtException')` обработчик событий может использоваться для захвата и обработки ошибок.

Если есть сомнения, если только конкретные возможности `process.nextTick()` необходимы, используйте `queueMicrotask()`.

## `process.noDeprecation`

<!-- YAML
added: v0.8.0
-->

- {логический}

В `process.noDeprecation` свойство указывает, `--no-deprecation` установлен флаг для текущего процесса Node.js. См. Документацию по [`'warning'` событие](#event-warning) и [`emitWarning()` метод](#processemitwarningwarning-type-code-ctor) для получения дополнительной информации о поведении этого флага.

## `process.pid`

<!-- YAML
added: v0.1.15
-->

- {целое число}

В `process.pid` свойство возвращает PID процесса.

```mjs
import { pid } from 'process';

console.log(`This process is pid ${pid}`);
```

```cjs
const { pid } = require('process');

console.log(`This process is pid ${pid}`);
```

## `process.platform`

<!-- YAML
added: v0.1.16
-->

- {нить}

В `process.platform` Свойство возвращает строку, определяющую платформу операционной системы, на которой выполняется процесс Node.js.

В настоящее время возможные значения:

- `'aix'`
- `'darwin'`
- `'freebsd'`
- `'linux'`
- `'openbsd'`
- `'sunos'`
- `'win32'`

```mjs
import { platform } from 'process';

console.log(`This platform is ${platform}`);
```

```cjs
const { platform } = require('process');

console.log(`This platform is ${platform}`);
```

Значение `'android'` также может быть возвращено, если Node.js создан в операционной системе Android. Однако поддержка Android в Node.js [экспериментальный](https://github.com/nodejs/node/blob/HEAD/BUILDING.md#androidandroid-based-devices-eg-firefox-os).

## `process.ppid`

<!-- YAML
added:
  - v9.2.0
  - v8.10.0
  - v6.13.0
-->

- {целое число}

В `process.ppid` свойство возвращает PID родителя текущего процесса.

```mjs
import { ppid } from 'process';

console.log(`The parent process is pid ${ppid}`);
```

```cjs
const { ppid } = require('process');

console.log(`The parent process is pid ${ppid}`);
```

## `process.release`

<!-- YAML
added: v3.0.0
changes:
  - version: v4.2.0
    pr-url: https://github.com/nodejs/node/pull/3212
    description: The `lts` property is now supported.
-->

- {Объект}

В `process.release` свойство возвращает `Object` содержащие метаданные, относящиеся к текущему выпуску, включая URL-адреса исходного архива и архива только для заголовков.

`process.release` содержит следующие свойства:

- `name` {строка} Значение, которое всегда будет `'node'`.
- `sourceUrl` {string} абсолютный URL, указывающий на _`.tar.gz`_ файл, содержащий исходный код текущего выпуска.
- `headersUrl`{string} абсолютный URL, указывающий на _`.tar.gz`_ файл, содержащий только исходные файлы заголовков для текущего выпуска. Этот файл значительно меньше, чем полный исходный файл, и его можно использовать для компиляции собственных надстроек Node.js.
- `libUrl` {string} абсолютный URL, указывающий на _`node.lib`_ файл, соответствующий архитектуре и версии текущего выпуска. Этот файл используется для компиляции собственных надстроек Node.js. _Это свойство присутствует только в сборках Windows для Node.js и будет отсутствовать на всех других платформах._
- `lts` {строка} строковая метка, определяющая [LTS](https://github.com/nodejs/Release) лейбл для этого выпуска. Это свойство существует только для выпусков LTS и `undefined` для всех остальных типов выпусков, включая _Текущий_ выпускает. Допустимые значения включают кодовые имена LTS Release (включая те, которые больше не поддерживаются).
  - `'Dubnium'` для строки 10.x LTS, начинающейся с 10.13.0.
  - `'Erbium'` для строки 12.x LTS, начинающейся с 12.13.0. Для других кодовых названий LTS Release см. [Архив изменений Node.js](https://github.com/nodejs/node/blob/HEAD/doc/changelogs/CHANGELOG_ARCHIVE.md)

<!-- eslint-skip -->

```js
{
  name: 'node',
  lts: 'Erbium',
  sourceUrl: 'https://nodejs.org/download/release/v12.18.1/node-v12.18.1.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v12.18.1/node-v12.18.1-headers.tar.gz',
  libUrl: 'https://nodejs.org/download/release/v12.18.1/win-x64/node.lib'
}
```

В пользовательских сборках из невыполненных версий дерева исходных текстов только `name` собственность может присутствовать. Не следует полагаться на существование дополнительных свойств.

## `process.report`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- {Объект}

`process.report` - объект, методы которого используются для создания диагностических отчетов для текущего процесса. Дополнительная документация доступна в [отчетная документация](report.md).

### `process.report.compact`

<!-- YAML
added:
 - v13.12.0
 - v12.17.0
-->

- {логический}

Пишите отчеты в компактном формате, однострочном JSON, который легче использовать для систем обработки журналов, чем многострочный формат по умолчанию, предназначенный для использования людьми.

```mjs
import { report } from 'process';

console.log(`Reports are compact? ${report.compact}`);
```

```cjs
const { report } = require('process');

console.log(`Reports are compact? ${report.compact}`);
```

### `process.report.directory`

<!-- YAML
added: v11.12.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- {нить}

Справочник, в котором написан отчет. Значение по умолчанию - пустая строка, указывающая, что отчеты записываются в текущий рабочий каталог процесса Node.js.

```mjs
import { report } from 'process';

console.log(`Report directory is ${report.directory}`);
```

```cjs
const { report } = require('process');

console.log(`Report directory is ${report.directory}`);
```

### `process.report.filename`

<!-- YAML
added: v11.12.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- {нить}

Имя файла, в котором написан отчет. Если установлена пустая строка, имя выходного файла будет состоять из отметки времени, PID и порядкового номера. Значение по умолчанию - пустая строка.

```mjs
import { report } from 'process';

console.log(`Report filename is ${report.filename}`);
```

```cjs
const { report } = require('process');

console.log(`Report filename is ${report.filename}`);
```

### `process.report.getReport([err])`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- `err` {Error} Пользовательская ошибка, используемая для сообщения о стеке JavaScript.
- Возвращает: {Object}

Возвращает представление объекта JavaScript диагностического отчета для запущенного процесса. Трассировка стека JavaScript отчета взята из `err`, если представить.

```mjs
import { report } from 'process';

const data = report.getReport();
console.log(data.header.nodejsVersion);

// Similar to process.report.writeReport()
import fs from 'fs';
fs.writeFileSync(
  'my-report.log',
  util.inspect(data),
  'utf8'
);
```

```cjs
const { report } = require('process');

const data = report.getReport();
console.log(data.header.nodejsVersion);

// Similar to process.report.writeReport()
const fs = require('fs');
fs.writeFileSync(
  'my-report.log',
  util.inspect(data),
  'utf8'
);
```

Дополнительная документация доступна в [отчетная документация](report.md).

### `process.report.reportOnFatalError`

<!-- YAML
added: v11.12.0
changes:
  - version:
     - v15.0.0
     - v14.17.0
    pr-url: https://github.com/nodejs/node/pull/35654
    description: This API is no longer experimental.
-->

- {логический}

Если `true`, диагностический отчет создается о фатальных ошибках, таких как ошибки нехватки памяти или неудачные утверждения C ++.

```mjs
import { report } from 'process';

console.log(
  `Report on fatal error: ${report.reportOnFatalError}`
);
```

```cjs
const { report } = require('process');

console.log(
  `Report on fatal error: ${report.reportOnFatalError}`
);
```

### `process.report.reportOnSignal`

<!-- YAML
added: v11.12.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- {логический}

Если `true`, диагностический отчет создается, когда процесс получает сигнал, указанный `process.report.signal`.

```mjs
import { report } from 'process';

console.log(`Report on signal: ${report.reportOnSignal}`);
```

```cjs
const { report } = require('process');

console.log(`Report on signal: ${report.reportOnSignal}`);
```

### `process.report.reportOnUncaughtException`

<!-- YAML
added: v11.12.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- {логический}

Если `true`, при неперехваченном исключении создается диагностический отчет.

```mjs
import { report } from 'process';

console.log(
  `Report on exception: ${report.reportOnUncaughtException}`
);
```

```cjs
const { report } = require('process');

console.log(
  `Report on exception: ${report.reportOnUncaughtException}`
);
```

### `process.report.signal`

<!-- YAML
added: v11.12.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- {нить}

Сигнал, используемый для запуска создания диагностического отчета. По умолчанию `'SIGUSR2'`.

```mjs
import { report } from 'process';

console.log(`Report signal: ${report.signal}`);
```

```cjs
const { report } = require('process');

console.log(`Report signal: ${report.signal}`);
```

### `process.report.writeReport([filename][, err])`

<!-- YAML
added: v11.8.0
changes:
  - version:
     - v13.12.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32242
    description: This API is no longer experimental.
-->

- `filename` {строка} Имя файла, в котором написан отчет. Это должен быть относительный путь, который будет добавлен к каталогу, указанному в `process.report.directory`или текущий рабочий каталог процесса Node.js, если он не указан.

- `err` {Error} Пользовательская ошибка, используемая для сообщения о стеке JavaScript.

- Returns: {string} Возвращает имя файла созданного отчета.

Записывает диагностический отчет в файл. Если `filename` не предоставляется, имя файла по умолчанию включает дату, время, PID и порядковый номер. Трассировка стека JavaScript отчета взята из `err`, если представить.

```mjs
import { report } from 'process';

report.writeReport();
```

```cjs
const { report } = require('process');

report.writeReport();
```

Дополнительная документация доступна в [отчетная документация](report.md).

## `process.resourceUsage()`

<!-- YAML
added: v12.6.0
-->

- Возвращает: {Object} использование ресурсов для текущего процесса. Все эти ценности исходят из `uv_getrusage` вызов, который возвращает [`uv_rusage_t` структура](https://docs.libuv.org/en/v1.x/misc.html#c.uv_rusage_t).
  - `userCPUTime` {integer} сопоставляется с `ru_utime` вычисляется в микросекундах. Это то же значение, что и [`process.cpuUsage().user`](#processcpuusagepreviousvalue).
  - `systemCPUTime` {integer} сопоставляется с `ru_stime` вычисляется в микросекундах. Это то же значение, что и [`process.cpuUsage().system`](#processcpuusagepreviousvalue).
  - `maxRSS` {integer} сопоставляется с `ru_maxrss` который является максимальным размером резидентного набора в килобайтах.
  - `sharedMemorySize` {integer} сопоставляется с `ru_ixrss` но не поддерживается ни одной платформой.
  - `unsharedDataSize` {integer} сопоставляется с `ru_idrss` но не поддерживается ни одной платформой.
  - `unsharedStackSize` {integer} сопоставляется с `ru_isrss` но не поддерживается ни одной платформой.
  - `minorPageFault` {integer} сопоставляется с `ru_minflt` что является количеством незначительных ошибок страницы для процесса, см. [эта статья для более подробной информации](https://en.wikipedia.org/wiki/Page_fault#Minor).
  - `majorPageFault` {integer} сопоставляется с `ru_majflt` количество основных ошибок страниц для процесса, см. [эта статья для более подробной информации](https://en.wikipedia.org/wiki/Page_fault#Major). Это поле не поддерживается в Windows.
  - `swappedOut` {integer} сопоставляется с `ru_nswap` но не поддерживается ни одной платформой.
  - `fsRead` {integer} сопоставляется с `ru_inblock` это количество раз, когда файловая система должна была выполнить ввод.
  - `fsWrite` {integer} сопоставляется с `ru_oublock` это количество раз, когда файловая система должна была выполнить вывод.
  - `ipcSent` {integer} сопоставляется с `ru_msgsnd` но не поддерживается ни одной платформой.
  - `ipcReceived` {integer} сопоставляется с `ru_msgrcv` но не поддерживается ни одной платформой.
  - `signalsCount` {integer} сопоставляется с `ru_nsignals` но не поддерживается ни одной платформой.
  - `voluntaryContextSwitches` {integer} сопоставляется с `ru_nvcsw` это количество раз, когда переключение контекста ЦП происходило из-за того, что процесс добровольно отказался от процессора до того, как его временной отрезок был завершен (обычно для ожидания доступности ресурса). Это поле не поддерживается в Windows.
  - `involuntaryContextSwitches` {integer} сопоставляется с `ru_nivcsw` это количество раз, когда переключение контекста ЦП приводило к тому, что процесс с более высоким приоритетом становился работоспособным или потому, что текущий процесс превысил свой временной интервал. Это поле не поддерживается в Windows.

```mjs
import { resourceUsage } from 'process';

console.log(resourceUsage());
/*
  Will output:
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

```cjs
const { resourceUsage } = require('process');

console.log(resourceUsage());
/*
  Will output:
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

<!-- YAML
added: v0.5.9
-->

- `message` {Объект}
- `sendHandle` {net.Server | net.Socket}
- `options` {Object} используется для параметризации отправки определенных типов дескрипторов.`options` поддерживает следующие свойства:
  - `keepOpen` {boolean} Значение, которое можно использовать при передаче экземпляров `net.Socket`. Когда `true`, сокет остается открытым в процессе отправки. **Дефолт:** `false`.
- `callback` {Функция}
- Возвращает: {логическое}

Если Node.js создается с каналом IPC, `process.send()` может использоваться для отправки сообщений родительскому процессу. Сообщения будут приходить в виде [`'message'`](child_process.md#event-message) событие на родительском [`ChildProcess`](child_process.md#class-childprocess) объект.

Если Node.js не был создан с каналом IPC, `process.send` будет `undefined`.

Сообщение проходит сериализацию и синтаксический анализ. Полученное сообщение может отличаться от исходного.

## `process.setegid(id)`

<!-- YAML
added: v2.0.0
-->

- `id` {string | number} Имя или идентификатор группы

В `process.setegid()` Метод устанавливает эффективную групповую идентичность процесса. (См. Setegid (2).) `id` может быть передан как числовой идентификатор или как строка имени группы. Если указано имя группы, этот метод блокируется при разрешении связанного числового идентификатора.

```mjs
import process from 'process';

if (process.getegid && process.setegid) {
  console.log(`Current gid: ${process.getegid()}`);
  try {
    process.setegid(501);
    console.log(`New gid: ${process.getegid()}`);
  } catch (err) {
    console.log(`Failed to set gid: ${err}`);
  }
}
```

```cjs
const process = require('process');

if (process.getegid && process.setegid) {
  console.log(`Current gid: ${process.getegid()}`);
  try {
    process.setegid(501);
    console.log(`New gid: ${process.getegid()}`);
  } catch (err) {
    console.log(`Failed to set gid: ${err}`);
  }
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android). Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.seteuid(id)`

<!-- YAML
added: v2.0.0
-->

- `id` {string | number} Имя или идентификатор пользователя.

В `process.seteuid()` Метод устанавливает эффективную идентификацию пользователя процесса. (См. Seteuid (2).) `id` может быть передан как числовой идентификатор или как строка имени пользователя. Если указано имя пользователя, метод блокируется при разрешении связанного числового идентификатора.

```mjs
import process from 'process';

if (process.geteuid && process.seteuid) {
  console.log(`Current uid: ${process.geteuid()}`);
  try {
    process.seteuid(501);
    console.log(`New uid: ${process.geteuid()}`);
  } catch (err) {
    console.log(`Failed to set uid: ${err}`);
  }
}
```

```cjs
const process = require('process');

if (process.geteuid && process.seteuid) {
  console.log(`Current uid: ${process.geteuid()}`);
  try {
    process.seteuid(501);
    console.log(`New uid: ${process.geteuid()}`);
  } catch (err) {
    console.log(`Failed to set uid: ${err}`);
  }
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android). Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.setgid(id)`

<!-- YAML
added: v0.1.31
-->

- `id` {строка | номер} Имя или идентификатор группы

В `process.setgid()` устанавливает групповой идентификатор процесса. (См. Setgid (2).) `id` может быть передан как числовой идентификатор или как строка имени группы. Если указано имя группы, этот метод блокируется при разрешении связанного числового идентификатора.

```mjs
import process from 'process';

if (process.getgid && process.setgid) {
  console.log(`Current gid: ${process.getgid()}`);
  try {
    process.setgid(501);
    console.log(`New gid: ${process.getgid()}`);
  } catch (err) {
    console.log(`Failed to set gid: ${err}`);
  }
}
```

```cjs
const process = require('process');

if (process.getgid && process.setgid) {
  console.log(`Current gid: ${process.getgid()}`);
  try {
    process.setgid(501);
    console.log(`New gid: ${process.getgid()}`);
  } catch (err) {
    console.log(`Failed to set gid: ${err}`);
  }
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android). Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.setgroups(groups)`

<!-- YAML
added: v0.9.4
-->

- `groups` {целое \[]}

В `process.setgroups()` устанавливает дополнительные идентификаторы групп для процесса Node.js. Это привилегированная операция, требующая, чтобы процесс Node.js `root` или `CAP_SETGID` возможность.

В `groups` массив может содержать числовые идентификаторы групп, имена групп или и то, и другое.

```mjs
import process from 'process';

if (process.getgroups && process.setgroups) {
  try {
    process.setgroups([501]);
    console.log(process.getgroups()); // new groups
  } catch (err) {
    console.log(`Failed to set groups: ${err}`);
  }
}
```

```cjs
const process = require('process');

if (process.getgroups && process.setgroups) {
  try {
    process.setgroups([501]);
    console.log(process.getgroups()); // new groups
  } catch (err) {
    console.log(`Failed to set groups: ${err}`);
  }
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android). Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.setuid(id)`

<!-- YAML
added: v0.1.28
-->

- `id` {целое | нить}

В `process.setuid(id)` устанавливает идентификатор пользователя процесса. (См. Setuid (2).) `id` может быть передан как числовой идентификатор или как строка имени пользователя. Если указано имя пользователя, метод блокируется при разрешении связанного числового идентификатора.

```mjs
import process from 'process';

if (process.getuid && process.setuid) {
  console.log(`Current uid: ${process.getuid()}`);
  try {
    process.setuid(501);
    console.log(`New uid: ${process.getuid()}`);
  } catch (err) {
    console.log(`Failed to set uid: ${err}`);
  }
}
```

```cjs
const process = require('process');

if (process.getuid && process.setuid) {
  console.log(`Current uid: ${process.getuid()}`);
  try {
    process.setuid(501);
    console.log(`New uid: ${process.getuid()}`);
  } catch (err) {
    console.log(`Failed to set uid: ${err}`);
  }
}
```

Эта функция доступна только на платформах POSIX (то есть не в Windows или Android). Эта функция недоступна в [`Worker`](worker_threads.md#class-worker) потоки.

## `process.setSourceMapsEnabled(val)`

<!-- YAML
added:
  - v16.6.0
  - v14.18.0
-->

> Стабильность: 1 - экспериментальная

- `val` {логический}

Эта функция включает или отключает [Исходная карта v3](https://sourcemaps.info/spec.html) поддержка трассировки стека.

Он предоставляет те же функции, что и запуск процесса Node.js с параметрами командной строки. `--enable-source-maps`.

Только исходные карты в файлах JavaScript, которые загружаются после включения исходных карт, будут проанализированы и загружены.

## `process.setUncaughtExceptionCaptureCallback(fn)`

<!-- YAML
added: v9.3.0
-->

- `fn` {Функция | ноль}

В `process.setUncaughtExceptionCaptureCallback()` function устанавливает функцию, которая будет вызываться при возникновении неперехваченного исключения, которая получит само значение исключения в качестве своего первого аргумента.

Если такая функция установлена, [`'uncaughtException'`](#event-uncaughtexception) событие не будет отправлено. Если `--abort-on-uncaught-exception` был передан из командной строки или установлен через [`v8.setFlagsFromString()`](v8.md#v8setflagsfromstringflags), процесс не будет прерван. Также будут затронуты действия, настроенные на выполнение исключений, например создание отчетов.

Чтобы отключить функцию захвата, `process.setUncaughtExceptionCaptureCallback(null)` может быть использовано. Вызов этого метода с не-`null` аргумент, когда установлена другая функция захвата, вызовет ошибку.

Использование этой функции является взаимоисключающим с использованием устаревшего [`domain`](domain.md) встроенный модуль.

## `process.stderr`

- {Транслировать}

В `process.stderr` свойство возвращает поток, подключенный к `stderr` (fd `2`). Это [`net.Socket`](net.md#class-netsocket) (что является [Дуплекс](stream.md#duplex-and-transform-streams) stream), если только fd `2` относится к файлу, и в этом случае это [Возможность записи](stream.md#writable-streams) транслировать.

`process.stderr` отличается от других потоков Node.js. Видеть [примечание по вводу / выводу процесса](#a-note-on-process-io) для дополнительной информации.

### `process.stderr.fd`

- {количество}

Это свойство относится к значению базового файлового дескриптора `process.stderr`. Значение фиксировано на `2`. В [`Worker`](worker_threads.md#class-worker) потоков, это поле не существует.

## `process.stdin`

- {Транслировать}

В `process.stdin` свойство возвращает поток, подключенный к `stdin` (fd `0`). Это [`net.Socket`](net.md#class-netsocket) (что является [Дуплекс](stream.md#duplex-and-transform-streams) stream), если только fd `0` относится к файлу, и в этом случае это [Удобочитаемый](stream.md#readable-streams) транслировать.

Для получения подробной информации о том, как читать из `stdin` видеть [`readable.read()`](stream.md#readablereadsize).

Как [Дуплекс](stream.md#duplex-and-transform-streams) транслировать, `process.stdin` также может использоваться в «старом» режиме, который совместим со сценариями, написанными для Node.js до v0.10. Для получения дополнительной информации см. [Совместимость потоков](stream.md#compatibility-with-older-nodejs-versions).

В режиме "старых" потоков `stdin` поток по умолчанию приостановлен, поэтому необходимо вызвать `process.stdin.resume()` читать с него. Также обратите внимание, что вызов `process.stdin.resume()` Сам бы переключил поток в "старый" режим.

### `process.stdin.fd`

- {количество}

Это свойство относится к значению базового файлового дескриптора `process.stdin`. Значение фиксировано на `0`. В [`Worker`](worker_threads.md#class-worker) потоков, это поле не существует.

## `process.stdout`

- {Транслировать}

В `process.stdout` свойство возвращает поток, подключенный к `stdout` (fd `1`). Это [`net.Socket`](net.md#class-netsocket) (что является [Дуплекс](stream.md#duplex-and-transform-streams) stream), если только fd `1` относится к файлу, и в этом случае это [Возможность записи](stream.md#writable-streams) транслировать.

Например, чтобы скопировать `process.stdin` к `process.stdout`:

```mjs
import { stdin, stdout } from 'process';

stdin.pipe(stdout);
```

```cjs
const { stdin, stdout } = require('process');

stdin.pipe(stdout);
```

`process.stdout` отличается от других потоков Node.js. Видеть [примечание по вводу / выводу процесса](#a-note-on-process-io) для дополнительной информации.

### `process.stdout.fd`

- {количество}

Это свойство относится к значению базового файлового дескриптора `process.stdout`. Значение фиксировано на `1`. В [`Worker`](worker_threads.md#class-worker) потоков, это поле не существует.

### Замечание по вводу / выводу процесса

`process.stdout` а также `process.stderr` отличаются от других потоков Node.js важными способами:

1.  Они используются внутри компании [`console.log()`](console.md#consolelogdata-args) а также [`console.error()`](console.md#consoleerrordata-args), соответственно.
2.  Записи могут быть синхронными в зависимости от того, к чему подключен поток и от того, является ли система Windows или POSIX:
    - Файлы: _синхронный_ в Windows и POSIX
    - TTY (терминалы): _асинхронный_ в Windows, _синхронный_ в POSIX
    - Трубы (и розетки): _синхронный_ в Windows, _асинхронный_ в POSIX

Такое поведение частично обусловлено историческими причинами, поскольку их изменение может создать обратную несовместимость, но некоторые пользователи также ожидают этого.

Синхронная запись позволяет избежать таких проблем, как вывод, записанный с помощью `console.log()` или `console.error()` неожиданно перемежается или вообще не записывается, если `process.exit()` вызывается до завершения асинхронной записи. Видеть [`process.exit()`](#processexitcode) для дополнительной информации.

**_Предупреждение_**: Синхронная запись блокирует цикл событий до тех пор, пока запись не будет завершена. Это может происходить почти мгновенно в случае вывода в файл, но при высокой загрузке системы, каналах, которые не читаются на принимающей стороне, или с медленными терминалами или файловыми системами, цикл событий может блокироваться достаточно часто. и достаточно долго, чтобы иметь серьезные негативные последствия для производительности. Это может не быть проблемой при записи в интерактивный сеанс терминала, но будьте особенно осторожны при ведении производственного журнала в потоки вывода процесса.

Чтобы проверить, подключен ли поток к [Телетайп](tty.md#tty) контекст, проверьте `isTTY` имущество.

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

Увидеть [Телетайп](tty.md#tty) документация для получения дополнительной информации.

## `process.throwDeprecation`

<!-- YAML
added: v0.9.12
-->

- {логический}

Начальное значение `process.throwDeprecation` указывает, есть ли `--throw-deprecation` установлен флаг для текущего процесса Node.js. `process.throwDeprecation` является изменяемым, поэтому вопрос о том, приводят ли предупреждения об устаревании к ошибкам, можно изменить во время выполнения. См. Документацию по [`'warning'` событие](#event-warning) и [`emitWarning()` метод](#processemitwarningwarning-type-code-ctor) для дополнительной информации.

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

## `process.title`

<!-- YAML
added: v0.1.104
-->

- {нить}

В `process.title` свойство возвращает текущий заголовок процесса (т.е. возвращает текущее значение `ps`). Присвоение нового значения `process.title` изменяет текущее значение `ps`.

Когда назначается новое значение, разные платформы налагают разные ограничения максимальной длины на заголовок. Обычно такие ограничения довольно ограничены. Например, в Linux и macOS `process.title` ограничен размером двоичного имени плюс длиной аргументов командной строки, потому что установка `process.title` перезаписывает `argv` память о процессе. Node.js v0.8 позволяет использовать более длинные строки заголовка процесса, также перезаписывая `environ` память, но это было потенциально небезопасно и сбивало с толку в некоторых (довольно неясных) случаях.

Присвоение значения `process.title` может не дать точной метки в приложениях диспетчера процессов, таких как MacOS Activity Monitor или Windows Services Manager.

## `process.traceDeprecation`

<!-- YAML
added: v0.8.0
-->

- {логический}

В `process.traceDeprecation` свойство указывает, `--trace-deprecation` установлен флаг для текущего процесса Node.js. См. Документацию по [`'warning'` событие](#event-warning) и [`emitWarning()` метод](#processemitwarningwarning-type-code-ctor) для получения дополнительной информации о поведении этого флага.

## `process.umask()`

<!-- YAML
added: v0.1.19
changes:
  - version:
    - v14.0.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/32499
    description: Calling `process.umask()` with no arguments is deprecated.

-->

> Стабильность: 0 - Не рекомендуется. Вызов `process.umask()` без аргумента вызывает запись umask всего процесса дважды. Это создает состояние гонки между потоками и является потенциальной уязвимостью безопасности. Безопасного кроссплатформенного альтернативного API не существует.

`process.umask()` возвращает маску создания файлового режима процесса Node.js. Дочерние процессы наследуют маску от родительского процесса.

## `process.umask(mask)`

<!-- YAML
added: v0.1.19
-->

- `mask` {строка | целое число}

`process.umask(mask)` устанавливает маску создания файлового режима процесса Node.js. Дочерние процессы наследуют маску от родительского процесса. Возвращает предыдущую маску.

```mjs
import { umask } from 'process';

const newmask = 0o022;
const oldmask = umask(newmask);
console.log(
  `Changed umask from ${oldmask.toString(
    8
  )} to ${newmask.toString(8)}`
);
```

```cjs
const { umask } = require('process');

const newmask = 0o022;
const oldmask = umask(newmask);
console.log(
  `Changed umask from ${oldmask.toString(
    8
  )} to ${newmask.toString(8)}`
);
```

В [`Worker`](worker_threads.md#class-worker) потоки, `process.umask(mask)` вызовет исключение.

## `process.uptime()`

<!-- YAML
added: v0.5.0
-->

- Возврат: {number}

В `process.uptime()` возвращает количество секунд, в течение которых выполнялся текущий процесс Node.js.

Возвращаемое значение включает доли секунды. Использовать `Math.floor()` чтобы получить целые секунды.

## `process.version`

<!-- YAML
added: v0.1.3
-->

- {нить}

В `process.version` свойство содержит строку версии Node.js.

```mjs
import { version } from 'process';

console.log(`Version: ${version}`);
// Version: v14.8.0
```

```cjs
const { version } = require('process');

console.log(`Version: ${version}`);
// Version: v14.8.0
```

Чтобы получить строку версии без добавленного _v_, использовать `process.versions.node`.

## `process.versions`

<!-- YAML
added: v0.2.0
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15785
    description: The `v8` property now includes a Node.js specific suffix.
  - version: v4.2.0
    pr-url: https://github.com/nodejs/node/pull/3102
    description: The `icu` property is now supported.
-->

- {Объект}

В `process.versions` Свойство возвращает объект, в котором перечислены строки версии Node.js и его зависимостей. `process.versions.modules` указывает текущую версию ABI, которая увеличивается при изменении C ++ API. Node.js откажется загружать модули, которые были скомпилированы для другой версии ABI модуля.

```mjs
import { versions } from 'process';

console.log(versions);
```

```cjs
const { versions } = require('process');

console.log(versions);
```

Сгенерирует объект, похожий на:

```console
{ node: '11.13.0',
  v8: '7.0.276.38-node.18',
  uv: '1.27.0',
  zlib: '1.2.11',
  brotli: '1.0.7',
  ares: '1.15.0',
  modules: '67',
  nghttp2: '1.34.0',
  napi: '4',
  llhttp: '1.1.1',
  openssl: '1.1.1b',
  cldr: '34.0',
  icu: '63.1',
  tz: '2018e',
  unicode: '11.0' }
```

## Коды выхода

Node.js обычно завершается с `0` код состояния, когда больше нет ожидающих асинхронных операций. В других случаях используются следующие коды состояния:

- `1` **Неперехваченное фатальное исключение**: Произошло неперехваченное исключение, которое не было обработано доменом или [`'uncaughtException'`](#event-uncaughtexception) обработчик события.
- `2`: Не используется (зарезервировано Bash для встроенного неправильного использования)
- `3` **Внутренняя ошибка синтаксического анализа JavaScript**: Внутренний исходный код JavaScript в процессе начальной загрузки Node.js вызвал ошибку синтаксического анализа. Это происходит крайне редко и обычно может произойти только во время разработки самого Node.js.
- `4` **Внутренняя ошибка оценки JavaScript**: Исходный код JavaScript, внутренний в процессе начальной загрузки Node.js, не смог вернуть значение функции при оценке. Это происходит крайне редко и обычно может произойти только во время разработки самого Node.js.
- `5` **Фатальная ошибка**: В V8 произошла фатальная неисправимая ошибка. Обычно сообщение печатается на stderr с префиксом `FATAL ERROR`.
- `6` **Нефункциональный внутренний обработчик исключений**: Произошло неперехваченное исключение, но внутренняя функция обработчика фатальных исключений каким-то образом была установлена как нефункциональная и не могла быть вызвана.
- `7` **Ошибка выполнения внутреннего обработчика исключений**: Произошло неперехваченное исключение, и сама функция внутреннего фатального обработчика исключений вызвала ошибку при попытке ее обработать. Это может произойти, например, если [`'uncaughtException'`](#event-uncaughtexception) или `domain.on('error')` обработчик выдает ошибку.
- `8`: Не используется. В предыдущих версиях Node.js код выхода 8 иногда указывал на неперехваченное исключение.
- `9` **Недействительным аргумент**: Либо была указана неизвестная опция, либо опция, требующая значения, была предоставлена без значения.
- `10` **Внутренний сбой времени выполнения JavaScript**: Исходный код JavaScript, внутренний в процессе начальной загрузки Node.js, вызывал ошибку при вызове функции начальной загрузки. Это происходит крайне редко и обычно может произойти только во время разработки самого Node.js.
- `12` **Недействительный аргумент отладки**: The `--inspect` и / или `--inspect-brk` были заданы параметры, но выбранный номер порта недействителен или недоступен.
- `13` **Незаконченное ожидание верхнего уровня**: `await` использовался вне функции в коде верхнего уровня, но переданный `Promise` никогда не решается.
- `>128` **Сигнальные выходы**: Если Node.js получает фатальный сигнал, например `SIGKILL` или `SIGHUP`, то его код выхода будет `128` плюс значение сигнального кода. Это стандартная практика POSIX, поскольку коды выхода определены как 7-битные целые числа, а выходы сигналов устанавливают бит старшего разряда, а затем содержат значение сигнального кода. Например, сигнал `SIGABRT` имеет ценность `6`, поэтому ожидаемый код выхода будет `128` + `6`, или `134`.
