---
title: Process
description: Объект process предоставляет информацию о текущем процессе Node.js и контроль над ним
---

# Процесс

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/process.html)

Объект `process` предоставляет информацию о текущем процессе Node.js и контроль над ним.

```mjs
import process from 'node:process';
```

```cjs
const process = require('node:process');
```

<!-- 0000.part.md -->

## Обработка событий

Объект `process` является экземпляром [`EventEmitter`](events.md#class-eventemitter).

<!-- 0001.part.md -->

### Событие: `'beforeExit'`

Событие `'beforeExit'` генерируется, когда Node.js опустошает свой цикл событий и не имеет дополнительной работы для планирования. Обычно процесс Node.js завершается, когда нет запланированной работы, но слушатель, зарегистрированный на событии `'beforeExit'`, может выполнять асинхронные вызовы и тем самым заставлять процесс Node.js продолжать работу.

Функция обратного вызова слушателя вызывается со значением [`process.exitCode`](#processexitcode_1), переданным в качестве единственного аргумента.

Событие `'beforeExit'` не _выдается_ для условий, вызывающих явное завершение, таких как вызов [`process.exit()`](#processexitcode) или не пойманные исключения.

Событие `'beforeExit'` не должно _не_ использоваться в качестве альтернативы событию `'exit'`, если только не предполагается запланировать дополнительную работу.

```mjs
import process from 'node:process';

process.on('beforeExit', (code) => {
    console.log(
        'Обработка события beforeExit с кодом: ',
        code
    );
});

process.on('exit', (code) => {
    console.log('Обработать событие exit с кодом: ', code);
});

console.log('Это сообщение выводится первым.');

// Выводит:
// Это сообщение выводится первым.
// Обработка события beforeExit с кодом: 0
// Обработать событие exit с кодом: 0
```

```cjs
const process = require('node:process');

process.on('beforeExit', (code) => {
    console.log(
        'Обработка события beforeExit с кодом: ',
        code
    );
});

process.on('exit', (code) => {
    console.log('Обработать событие exit с кодом: ', code);
});

console.log('Это сообщение выводится первым.');

// Выводит:
// Это сообщение выводится первым.
// Обработка события beforeExit с кодом: 0
// Обработать событие exit с кодом: 0
```

<!-- 0002.part.md -->

### Событие: `disconnect`

Если процесс Node.js порожден с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), событие `'disconnect'` будет испущено, когда IPC-канал будет закрыт.

<!-- 0003.part.md -->

### Событие: `exit`

-   `code` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'exit'` генерируется, когда процесс Node.js собирается завершиться в результате либо:

-   Явного вызова метода `process.exit()`;
-   Цикл событий Node.js больше не должен выполнять никакой дополнительной работы.

На данный момент нет способа предотвратить выход из цикла событий, и как только все слушатели `'exit'` завершат работу, процесс Node.js завершится.

Функция обратного вызова слушателя вызывается с кодом выхода, указанным либо свойством [`process.exitCode`](#processexitcode_1), либо аргументом `exitCode`, переданным методу [`process.exit()`](#processexitcode).

```mjs
import process from 'node:process';

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
});
```

```cjs
const process = require('node:process');

process.on('exit', (code) => {
    console.log(`About to exit with code: ${code}`);
});
```

Функции слушателя **должны** выполнять только **синхронные** операции. Процесс Node.js завершится сразу после вызова слушателя события `'exit'`, в результате чего любая дополнительная работа, все еще находящаяся в очереди в цикле событий, будет прекращена. В следующем примере, например, таймаут никогда не произойдет:

```mjs
import process from 'node:process';

process.on('exit', (code) => {
    setTimeout(() => {
        console.log('This will not run');
    }, 0);
});
```

```cjs
const process = require('node:process');

process.on('exit', (code) => {
    setTimeout(() => {
        console.log('This will not run');
    }, 0);
});
```

<!-- 0004.part.md -->

### Событие: `message`

-   `message` { Object | boolean | number | string | null } разобранный объект JSON или сериализуемое примитивное значение.
-   `sendHandle` {net.Server|net.Socket} объект [`net.Server`](net.md#class-netserver) или [`net.Socket`](net.md#class-netsocket), или undefined.

Если процесс Node.js порожден с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), событие `'message'` испускается всякий раз, когда сообщение, отправленное родительским процессом с помощью [`childprocess.send()`](child_process.md#subprocesssendmessage-sendhandle-options-callback), получено дочерним процессом.

Сообщение проходит через сериализацию и разбор. Полученное сообщение может отличаться от первоначально отправленного.

Если при порождении процесса опция `сериализации` была установлена на `продвинутую`, аргумент `сообщение` может содержать данные, которые JSON не может представить. Более подробную информацию смотрите в [Advanced serialization for `child_process`](child_process.md#advanced-serialization).

<!-- 0005.part.md -->

### Событие: `multipleResolves`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип разрешения. Один из `'resolve'` или `'reject'`.
-   `promise` [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Обещание, которое было разрешено или отвергнуто более одного раза.
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение, с которым обещание было разрешено или отвергнуто после первоначального разрешения.

Событие `'multipleResolves'` испускается всякий раз, когда `обещание` было либо:

-   Разрешено более одного раза.
-   Отклонено более одного раза.
-   Отклонено после разрешения.
-   Решено после отклонения.

Это полезно для отслеживания потенциальных ошибок в приложении при использовании конструктора `Promise`, так как множественные разрешения молча проглатываются. Однако возникновение этого события не обязательно указывает на ошибку. Например, [`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race) может вызвать событие `'multipleResolves'`.

Из-за ненадежности этого события в случаях, подобных приведенному выше примеру [`Promise.race()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/race), оно было устаревшим.

```mjs
import process from 'node:process';

process.on('multipleResolves', (type, promise, reason) => {
    console.error(type, promise, reason);
    setImmediate(() => process.exit(1));
});

async function main() {
    try {
        return await new Promise((resolve, reject) => {
            resolve('Первый вызов');
            resolve('Проглоченное разрешение');
            reject(new Error('Swallowed reject'));
        });
    } catch {
        throw new Error('Не удалось');
    }
}

main().then(console.log);
// resolve: Promise { 'Первый вызов'} 'Проглоченное разрешение'
// reject: Promise { 'Первый вызов' } Ошибка: Swallowed reject
// at Promise (*)
// at new Promise (<анонимно>)
// at main (*)
// Первый вызов
```

```cjs
const process = require('node:process');

process.on('multipleResolves', (type, promise, reason) => {
    console.error(type, promise, reason);
    setImmediate(() => process.exit(1));
});

async function main() {
    try {
        return await new Promise((resolve, reject) => {
            resolve('Первый вызов');
            resolve('Проглоченное разрешение');
            reject(new Error('Swallowed reject'));
        });
    } catch {
        throw new Error('Не удалось');
    }
}

main().then(console.log);
// resolve: Promise { 'Первый вызов'} 'Проглоченное разрешение'
// reject: Promise { 'Первый вызов' } Ошибка: Swallowed reject
// at Promise (*)
// at new Promise (<анонимно>)
// at main (*)
// Первый вызов
```

<!-- 0006.part.md -->

### Событие: `rejectionHandled`

-   `promise` [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Обещание, обработанное с опозданием.

Событие `'rejectionHandled'` испускается всякий раз, когда `Promise` было отклонено и к нему был присоединен обработчик ошибок (например, с помощью [`promise.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch)) позже, чем один оборот цикла событий Node.js.

Объект `Promise` ранее был бы выпущен в событии `'unhandledRejection'`, но в процессе обработки получил обработчик отказа.

Для цепочки `Promise` не существует понятия верхнего уровня, на котором всегда можно обработать отказ. Будучи по своей природе асинхронным, отказ `Promise` может быть обработан в будущий момент времени, возможно, гораздо позже, чем время цикла событий, необходимое для появления события `'unhandledRejection'`.

По-другому это можно выразить так: в отличие от синхронного кода, где существует постоянно растущий список необработанных исключений, в Promises список необработанных отказов может расти и уменьшаться.

В синхронном коде событие `uncaughtException` испускается, когда список необработанных исключений растет.

В асинхронном коде событие `'unhandledRejection'` генерируется, когда список необработанных отказов растет, а событие `'rejectionHandled'` генерируется, когда список необработанных отказов уменьшается.

```mjs
import process from 'node:process';

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
    unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
    unhandledRejections.delete(promise);
});
```

```cjs
const process = require('node:process');

const unhandledRejections = new Map();
process.on('unhandledRejection', (reason, promise) => {
    unhandledRejections.set(promise, reason);
});
process.on('rejectionHandled', (promise) => {
    unhandledRejections.delete(promise);
});
```

В этом примере карта `unhandledRejections` `Map` будет расти и уменьшаться с течением времени, отражая отказы, которые начались без обработки, а затем стали обработанными. Можно записывать такие ошибки в журнал ошибок, либо периодически (что, вероятно, лучше для долго работающего приложения), либо по завершении процесса (что, вероятно, наиболее удобно для скриптов).

<!-- 0007.part.md -->

### Событие: `'uncaughtException'`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Непойманное исключение.
-   `origin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Указывает, происходит ли исключение из необработанного отказа или из синхронной ошибки. Может быть либо `'uncaughtException'`, либо `'unhandledRejection'`. Последнее используется, когда исключение происходит в асинхронном контексте на основе `Promise` (или если `Promise` отклоняется) и флаг [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode) установлен на `strict` или `throw` (что является значением по умолчанию) и отклонение не обрабатывается, или когда отклонение происходит во время фазы статической загрузки модуля ES в командной строке.

Событие `'uncaughtException'` генерируется, когда не пойманное исключение JavaScript прорывается обратно в цикл событий. По умолчанию Node.js обрабатывает такие исключения, печатая трассировку стека в `stderr` и завершая работу с кодом 1, переопределяя любой ранее установленный [`process.exitCode`](#processexitcode_1). Добавление обработчика для события `'uncaughtException'` отменяет это поведение по умолчанию. В качестве альтернативы измените [`process.exitCode`](#processexitcode_1) в обработчике события `'uncaughtException'`, что приведет к завершению процесса с указанным кодом выхода. В противном случае, при наличии такого обработчика процесс завершится с кодом 0.

```mjs
import process from 'node:process';

process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
        process.stderr.fd,
        `Пойманное исключение: ${err}\n` +
            `Происхождение исключения: ${origin}`
    );
});

setTimeout(() => {
    console.log('Это все еще будет выполняться.');
}, 500);

// Намеренно вызываем исключение, но не ловим его.
nonexistentFunc();
console.log('This will not run.');
```

```cjs
const process = require('node:process');

process.on('uncaughtException', (err, origin) => {
    fs.writeSync(
        process.stderr.fd,
        `Пойманное исключение: ${err}\n` +
            `Происхождение исключения: ${origin}`
    );
});

setTimeout(() => {
    console.log('Это все еще будет выполняться.');
}, 500);

// Намеренно вызываем исключение, но не ловим его.
nonexistentFunc();
console.log('This will not run.');
```

Можно отслеживать события `'uncaughtException'` без переопределения поведения по умолчанию для завершения процесса, установив слушателя `'uncaughtExceptionMonitor'`.

<!-- 0008.part.md -->

#### Предупреждение: Правильное использование `'uncaughtException'`

`'uncaughtException'` - это грубый механизм обработки исключений, предназначенный для использования только в крайнем случае. Это событие _не должно_ использоваться как эквивалент `On Error Resume Next`. Не обработанные исключения по своей сути означают, что приложение находится в неопределенном состоянии. Попытка возобновить работу приложения без надлежащего восстановления после исключения может вызвать дополнительные непредвиденные и непредсказуемые проблемы.

Исключения, брошенные из обработчика событий, не будут перехвачены. Вместо этого процесс завершится с ненулевым кодом завершения и будет напечатан след стека. Это делается для того, чтобы избежать бесконечной рекурсии.

Попытка возобновить нормальную работу после не пойманного исключения может быть похожа на выдергивание шнура питания при обновлении компьютера. В девяти случаях из десяти ничего не происходит. Но на десятый раз система становится поврежденной.

Правильное использование `uncaughtException` заключается в синхронной очистке выделенных ресурсов (например, дескрипторов файлов, дескрипторов и т. д.) перед завершением процесса. **Возобновлять нормальную работу после `uncaughtException`** небезопасно.

Для более надежного перезапуска сбойного приложения, независимо от того, выдается ли `'uncaughtException'` или нет, следует использовать внешний монитор в отдельном процессе для обнаружения сбоев приложения и восстановления или перезапуска по мере необходимости.

<!-- 0009.part.md -->

### Событие: `'uncaughtExceptionMonitor'`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Непойманное исключение.
-   `origin` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Указывает, происходит ли исключение из необработанного отказа или из синхронных ошибок. Может быть либо `'uncaughtException'`, либо `'unhandledRejection'`. Последнее используется, когда исключение происходит в асинхронном контексте на основе `Promise` (или если `Promise` отклоняется) и флаг [`--unhandled-rejections`](cli.md#--unhandled-rejectionsmode) установлен на `strict` или `throw` (что является значением по умолчанию) и отклонение не обрабатывается, или когда отклонение происходит во время фазы статической загрузки модуля ES в точке входа командной строки.

Событие `uncaughtExceptionMonitor` испускается до того, как испускается событие `uncaughtException` или вызывается хук, установленный через `process.setUncaughtExceptionCaptureCallback()`.

Установка слушателя `'uncaughtExceptionMonitor'` не меняет поведения после возникновения события `'uncaughtException'`. Процесс все равно завершится, если не установлен слушатель `'uncaughtException'`.

```mjs
import process from 'node:process';

process.on('uncaughtExceptionMonitor', (err, origin) => {
    MyMonitoringTool.logSync(err, origin);
});

// Намеренно вызываем исключение, но не ловим его.
nonexistentFunc();
// По-прежнему вызывает крах Node.js
```

```cjs
const process = require('node:process');

process.on('uncaughtExceptionMonitor', (err, origin) => {
    MyMonitoringTool.logSync(err, origin);
});

// Намеренно вызываем исключение, но не ловим его.
nonexistentFunc();
// По-прежнему вызывает крах Node.js
```

<!-- 0010.part.md -->

### Событие: `'unhandledRejection'`

-   `reason` {Error|any} Объект, с которым обещание было отклонено (обычно это объект [`Error`](errors.md#class-error)).
-   `promise` [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Отклоненное обещание.

Событие `'unhandledRejection'` возникает всякий раз, когда отвергается `Promise` и в течение одного оборота цикла событий к обещанию не присоединяется обработчик ошибки. При программировании с Promises исключения инкапсулируются как "отклоненные обещания". Отклонения могут быть пойманы и обработаны с помощью [`promise.catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) и распространяются через цепочку `Promise`. Событие `'unhandledRejection'` полезно для обнаружения и отслеживания отклоненных обещаний, чьи отклонения еще не были обработаны.

```mjs
import process from 'node:process';

process.on('unhandledRejection', (reason, promise) => {
    console.log(
        'Unhandled Rejection at:',
        promise,
        'reason:',
        reason
    );
    // Здесь можно настроить логирование, выброс ошибки или другую логику, специфичную для приложения.
});

somePromise.then((res) => {
    return reportToUser(JSON.pasre(res)); // Обратите внимание на опечатку (`pasre`)
}); // Нет `.catch()` или `.then()`
```

```cjs
const process = require('node:process');

process.on('unhandledRejection', (reason, promise) => {
    console.log(
        'Unhandled Rejection at:',
        promise,
        'reason:',
        reason
    );
    // Здесь можно настроить логирование, выброс ошибки или другую логику, специфичную для приложения.
});

somePromise.then((res) => {
    return reportToUser(JSON.pasre(res)); // Обратите внимание на опечатку (`pasre`)
}); // Нет `.catch()` или `.then()`
```

Следующие действия также вызовут событие `unhandledRejection`:

```mjs
import process from 'node:process';

function SomeResource() {
    // Изначально устанавливаем статус loaded в обещание rejected
    this.loaded = Promise.reject(
        new Error('Ресурс еще не загружен!')
    );
}

const resource = new SomeResource();
// Никаких .catch или .then на resource.loaded, по крайней мере, в течение очереди
```

```cjs
const process = require('node:process');

function SomeResource() {
    // Изначально устанавливаем статус loaded на отвергнутое обещание
    this.loaded = Promise.reject(
        new Error('Ресурс еще не загружен!')
    );
}

const resource = new SomeResource();
// Никаких .catch или .then на resource.loaded, по крайней мере, в течение очереди
```

В этом примере можно отследить отказ как ошибку разработчика, как это обычно происходит с другими событиями `необработанного отказа`. Для решения подобных проблем к `resource.loaded` может быть присоединен нерабочий обработчик [`.catch(() => { })`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch), который предотвратит возникновение события `unhandledRejection`.

<!-- 0011.part.md -->

### Событие: `warning`

-   `warning` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ключевыми свойствами предупреждения являются:
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя предупреждения. **По умолчанию:** `'Warning'`.
    -   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Описание предупреждения, предоставляемое системой.
    -   `stack` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Трассировка стека до того места в коде, где было выдано предупреждение.

Событие `'warning'` выдается всякий раз, когда Node.js выдает предупреждение процесса.

Предупреждение процесса похоже на ошибку в том смысле, что оно описывает исключительные условия, на которые обращается внимание пользователя. Однако предупреждения не являются частью обычного потока обработки ошибок Node.js и JavaScript. Node.js может выдавать предупреждения всякий раз, когда обнаруживает плохую практику кодирования, которая может привести к неоптимальной производительности приложения, ошибкам или уязвимостям безопасности.

```mjs
import process from 'node:process';

process.on('warning', (warning) => {
    console.warn(warning.name); // Вывод имени предупреждения
    console.warn(warning.message); // Выводим сообщение о предупреждении
    console.warn(warning.stack); // Вывести трассировку стека
});
```

```cjs
const process = require('node:process');

process.on('warning', (warning) => {
    console.warn(warning.name); // Выводим имя предупреждения
    console.warn(warning.message); // Вывод сообщения о предупреждении
    console.warn(warning.stack); // Вывести трассировку стека
});
```

По умолчанию Node.js будет печатать предупреждения процесса в `stderr`. Опция командной строки `--no-warnings` может быть использована для подавления вывода на консоль по умолчанию, но событие `'warning'` все равно будет выдаваться объектом `process`.

Следующий пример иллюстрирует предупреждение, которое выводится в `stderr`, когда к событию было добавлено слишком много слушателей:

```console
$ node
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> (node:38638) MaxListenersExceededWarning: Возможная утечка памяти EventEmitter
обнаружена. Добавлено 2 слушателя foo. Используйте emitter.setMaxListeners() для увеличения лимита
```

В противоположность этому, следующий пример отключает вывод предупреждения по умолчанию и добавляет пользовательский обработчик к событию `предупреждение`:

```console
$ node --no-warnings
> const p = process.on('warning', (warning) => console.warn('Do not do that!'));
> events.defaultMaxListeners = 1;
> process.on('foo', () => {});
> process.on('foo', () => {});
> Не делайте этого!
```

Опция командной строки `--trace-warnings` может быть использована для того, чтобы вывод предупреждений в консоли по умолчанию включал полную трассировку стека предупреждения.

Запуск Node.js с использованием флага командной строки `--throw-deprecation` приведет к тому, что пользовательские предупреждения о депривации будут отбрасываться как исключения.

Использование флага командной строки `--trace-deprecation` приведет к тому, что пользовательское предупреждение будет выведено в `stderr` вместе с трассировкой стека.

Использование флага командной строки `--no-deprecation` подавит все сообщения о пользовательском обесценивании.

Флаги командной строки `*-deprecation` влияют только на предупреждения, использующие имя `'DeprecationWarning'`.

<!-- 0012.part.md -->

### Событие: `worker`

-   `worker` {Worker} Созданный {Worker}.

Событие `'worker'` испускается после создания нового потока {Worker}.

<!-- 0013.part.md -->

#### Выдача пользовательских предупреждений

См. метод [`process.emitWarning()`](#processemitwarningwarning-type-code-ctor) для выдачи пользовательских или специфических для приложения предупреждений.

<!-- 0014.part.md -->

#### Имена предупреждений Node.js

Не существует строгих правил для типов предупреждений (определяемых свойством `name`), выдаваемых Node.js. Новые типы предупреждений могут быть добавлены в любое время. Несколько наиболее распространенных типов предупреждений включают:

-   `'DeprecationWarning'` - Указывает на использование устаревшего API Node.js или функции. Такие предупреждения должны включать свойство `'code'`, идентифицирующее [deprecation code] (deprecations.md).
-   `'ExperimentalWarning'` - Указывает на использование экспериментального API или функции Node.js. Такие возможности следует использовать с осторожностью, так как они могут измениться в любое время и не подчиняются тем же строгим правилам семантической версификации и долгосрочной поддержки, что и поддерживаемые возможности.
-   `MaxListenersExceededWarning` - Указывает, что слишком много слушателей для данного события было зарегистрировано либо на `EventEmitter`, либо на `EventTarget`. Это часто является признаком утечки памяти.
-   `'TimeoutOverflowWarning'` - Указывает на то, что функции `setTimeout()` или `setInterval()` было предоставлено числовое значение, которое не укладывается в 32-битное знаковое целое число.
-   `'UnsupportedWarning'` - Указывает на использование неподдерживаемой опции или функции, которая будет проигнорирована, а не расценена как ошибка. Примером может служить использование сообщения о статусе ответа HTTP при использовании API совместимости HTTP/2.

<!-- 0015.part.md -->

### Сигнальные события

Сигнальные события будут возникать, когда процесс Node.js получает сигнал. Пожалуйста, обратитесь к signal(7) для получения списка стандартных имен сигналов POSIX, таких как `'SIGINT'`, `'SIGHUP'` и т.д.

Сигналы недоступны для потоков [`Worker`](worker_threads.md#class-worker).

Обработчик сигнала будет получать имя сигнала (`'SIGINT'`, `'SIGTERM'` и т.д.) в качестве первого аргумента.

Имя каждого события будет общим именем сигнала в верхнем регистре (например, `'SIGINT'` для сигналов `SIGINT`).

```mjs
import process from 'node:process';

// Начинаем чтение из stdin, чтобы процесс не завершился.
process.stdin.resume();

process.on('SIGINT', () => {
    console.log(
        'Received SIGINT. Press Control-D to exit.'
    );
});

// Использование одной функции для обработки нескольких сигналов
function handle(signal) {
    console.log(`Received ${signal}`);
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
```

```cjs
const process = require('node:process');

// Начинаем чтение из stdin, чтобы процесс не завершился.
process.stdin.resume();

process.on('SIGINT', () => {
    console.log(
        'Received SIGINT. Press Control-D to exit.'
    );
});

// Использование одной функции для обработки нескольких сигналов
function handle(signal) {
    console.log(`Received ${signal}`);
}

process.on('SIGINT', handle);
process.on('SIGTERM', handle);
```

-   `'SIGUSR1'` зарезервирован Node.js для запуска [отладчика] (debugger.md). Можно установить слушателя, но это может помешать работе отладчика.
-   `'SIGTERM'` и `'SIGINT'` имеют обработчики по умолчанию на платформах, отличных от Windows, которые сбрасывают режим терминала перед выходом с кодом `128 + номер сигнала`. Если у одного из этих сигналов установлен слушатель, его поведение по умолчанию будет удалено (Node.js больше не будет выходить).
-   Сигнал `'SIGPIPE'` игнорируется по умолчанию. У него может быть установлен слушатель.
-   `'SIGHUP'` генерируется в Windows при закрытии окна консоли, а также на других платформах при различных аналогичных условиях. См. signal(7). Может быть установлен слушатель, однако Node.js будет безусловно завершен Windows примерно через 10 секунд. On non-Windows platforms, the default behavior of `SIGHUP` is to terminate Node.js, but once a listener has been installed its default behavior will be removed.
-   `'SIGTERM'` is not supported on Windows, it can be listened on.
-   `'SIGINT'` from the terminal is supported on all platforms, and can usually be generated with <kbd>Ctrl</kbd>+<kbd>C</kbd> (though this may be configurable). It is not generated when [terminal raw mode](tty.md#readstreamsetrawmodemode) is enabled and <kbd>Ctrl</kbd>+<kbd>C</kbd> is used.
-   `'SIGBREAK'` is delivered on Windows when <kbd>Ctrl</kbd>+<kbd>Break</kbd> is pressed. On non-Windows platforms, it can be listened on, but there is no way to send or generate it.
-   `'SIGWINCH'` is delivered when the console has been resized. On Windows, this will only happen on write to the console when the cursor is being moved, or when a readable tty is used in raw mode

<!-- 0016.part.md -->

## `process.abort()`

Метод `process.abort()` заставляет процесс Node.js немедленно завершить работу и сгенерировать файл ядра.

Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0017.part.md -->

## `process.allowedNodeEnvironmentFlags`

-   {Set}

Свойство `process.allowedNodeEnvironmentFlags` - это специальный, доступный только для чтения `Set` флагов, допустимых в переменной окружения [`NODE_OPTIONS`](cli.md#node_optionsoptions).

`process.allowedNodeEnvironmentFlags` расширяет `Set`, но переопределяет `Set.prototype.has`, чтобы распознать несколько различных возможных представлений флагов. `process.allowedNodeEnvironmentFlags.has()` будет возвращать `true` в следующих случаях:

-   Флаги могут опускать ведущие одинарные (`-`) или двойные (`--`) тире; например, `inspect-brk` для `--inspect-brk`, или `r` для `-r`.
-   Флаги, передаваемые в V8 (как указано в `--v8-options`), могут заменять одно или несколько _не ведущих_ тире на подчеркивание, или наоборот; например, `--perf_basic_prof`, `--perf-basic-prof`, `--perf_basic-prof` и т.д.
-   Флаги могут содержать один или несколько символов равенства (`=`); все символы после и включая первый символ равенства будут игнорироваться; например, `--stack-trace-limit=100`.
-   Флаги _должны_ быть допустимыми в пределах [`NODE_OPTIONS`](cli.md#node_optionsoptions).

При итерации по `process.allowedNodeEnvironmentFlags`, флаги будут появляться только _один раз_; каждый из них будет начинаться с одного или нескольких тире. Флаги, передаваемые в V8, будут содержать символы подчеркивания вместо не ведущих тире:

```mjs
import { allowedNodeEnvironmentFlags } from 'node:process';

allowedNodeEnvironmentFlags.forEach((flag) => {
    // -r
    // --inspect-brk
    // --abort_on_uncaught_exception
    // ...
});
```

```cjs
const {
    allowedNodeEnvironmentFlags,
} = require('node:process');

allowedNodeEnvironmentFlags.forEach((flag) => {
    // -r
    // --inspect-brk
    // --abort_on_uncaught_exception
    // ...
});
```

Методы `add()`, `clear()`, и `delete()` из `process.allowedNodeEnvironmentFlags` ничего не делают, и будут молча провалены.

Если Node.js был скомпилирован _без_ поддержки [`NODE_OPTIONS`](cli.md#node_optionsoptions) (показано в [`process.config`](#processconfig)), `process.allowedNodeEnvironmentFlags` будет содержать то, что _было_ разрешено.

<!-- 0018.part.md -->

## `process.arch`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Архитектура процессора операционной системы, для которой был скомпилирован двоичный файл Node.js. Возможные значения: `'arm'`, `'arm64'`, `'ia32'`, `'mips'`, `'mipsel'`, `'ppc'`, `'ppc64'`, `'s390'`, `'s390x'`, и `'x64'`.

```mjs
import { arch } from 'node:process';

console.log(`Эта архитектура процессора - ${arch}`);
```

```cjs
const { arch } = require('node:process');

console.log(`Эта архитектура процессора ${arch}`);
```

<!-- 0019.part.md -->

## `process.argv`

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.argv` возвращает массив, содержащий аргументы командной строки, переданные при запуске процесса Node.js. Первым элементом будет [`process.execPath`](#processexecpath). Смотрите `process.argv0`, если необходим доступ к исходному значению `argv[0]`. Вторым элементом будет путь к выполняемому файлу JavaScript. Остальные элементы будут любыми дополнительными аргументами командной строки.

Например, если взять следующий сценарий для `process-args.js`:

```mjs
import { argv } from 'node:process';

// вывести process.argv
argv.forEach((val, index) => {
    console.log(`${index}: ${val}`);
});
```

```cjs
const { argv } = require('node:process');

// выводим process.argv
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
2: один
3: два=три
4: четыре
```

<!-- 0020.part.md -->

## `process.argv0`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.argv0` хранит только для чтения копию исходного значения `argv[0]`, переданного при запуске Node.js.

```console
$ bash -c 'exec -a customArgv0 ./node'
> process.argv[0]
'/Volumes/code/external/node/out/Release/node'
> process.argv0
'customArgv0'
```

<!-- 0021.part.md -->

## `process.channel`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Если процесс Node.js был порожден с IPC-каналом (см. документацию [Child Process](child_process.md)), свойство `process.channel` является ссылкой на IPC-канал. Если IPC-канала не существует, это свойство `не определено`.

<!-- 0022.part.md -->

### `process.channel.ref()`

Этот метод заставляет IPC-канал сохранить цикл событий запущенного процесса, если `.unref()` был вызван ранее.

Обычно это управляется через количество слушателей `'disconnect'` и `'message'` на объекте `process`. Однако этот метод можно использовать для явного запроса определенного поведения.

<!-- 0023.part.md -->

### `process.channel.unref()`

Этот метод заставляет IPC-канал не поддерживать цикл событий процесса и позволяет ему завершиться, даже если канал открыт.

Обычно это управляется через количество слушателей `'disconnect'` и `'message'` на объекте `process`. Однако этот метод может быть использован для явного запроса определенного поведения.

<!-- 0024.part.md -->

## `process.chdir(directory)`

-   `directory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.chdir()` изменяет текущий рабочий каталог процесса Node.js или выбрасывает исключение, если это не удается (например, если указанный `каталог` не существует).

```mjs
import { chdir, cwd } from 'node:process';

console.log(`Запуск каталога: ${cwd()}`);
try {
    chdir('/tmp');
    console.log(`Новый каталог: ${cwd()}`);
} catch (err) {
    console.error(`chdir: ${err}`);
}
```

```cjs
const { chdir, cwd } = require('node:process');

console.log(`Запуск каталога: ${cwd()}`);
try {
    chdir('/tmp');
    console.log(`Новая директория: ${cwd()}`);
} catch (err) {
    console.error(`chdir: ${err}`);
}
```

Эта возможность недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0025.part.md -->

## `process.config`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.config` возвращает замороженный `Object`, содержащий JavaScript-представление опций configure, используемых для компиляции текущего исполняемого файла Node.js. Это то же самое, что и файл `config.gypi`, который был создан при выполнении скрипта `./configure`.

Пример возможного вывода выглядит следующим образом:

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
     strict_aliasing: 'true',
     target_arch: 'x64',
     v8_use_snapshot: 1
   }
}
```

<!-- 0026.part.md -->

## `process.connected`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если процесс Node.js порожден с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), свойство `process.connected` будет возвращать `true` до тех пор, пока IPC-канал подключен, и вернет `false` после вызова `process.disconnect()`.

Как только `process.connected` становится `false`, отправка сообщений по IPC-каналу с помощью `process.send()` становится невозможной.

<!-- 0027.part.md -->

## `process.constrainedMemory()`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   {number|undefined}

Получает объем памяти, доступный процессу (в байтах), основанный на ограничениях, наложенных ОС. Если такого ограничения нет, или оно неизвестно, возвращается `undefined`.

Дополнительную информацию см. в [`uv_get_constrained_memory`](https://docs.libuv.org/en/v1.x/misc.html#c.uv_get_constrained_memory).

<!-- 0028.part.md -->

## `process.cpuUsage([previousValue])`

-   `previousValue` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Предыдущее возвращаемое значение после вызова `process.cpuUsage()`.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `user` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `система` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.cpuUsage()` возвращает пользовательское и системное использование процессорного времени текущего процесса в объекте со свойствами `user` и `ystem`, значения которых являются микросекундами (миллионными долями секунды). Эти значения измеряют время, проведенное в пользовательском и системном коде соответственно, и могут оказаться больше, чем реально прошедшее время, если несколько ядер процессора выполняют работу для данного процесса.

Результат предыдущего вызова `process.cpuUsage()` может быть передан в качестве аргумента функции, чтобы получить разницу в показаниях.

```mjs
import { cpuUsage } from 'node:process';

const startUsage = cpuUsage();
// { user: 38579, system: 6986 }

// раскручиваем процессор на 500 миллисекунд
const now = Date.now();
while (Date.now() - now < 500);

console.log(cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

```cjs
const { cpuUsage } = require('node:process');

const startUsage = cpuUsage();
// { user: 38579, system: 6986 }

// раскручиваем процессор на 500 миллисекунд
const now = Date.now();
while (Date.now() - now < 500);

console.log(cpuUsage(startUsage));
// { user: 514883, system: 11226 }
```

<!-- 0029.part.md -->

## `process.cwd()`

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.cwd()` возвращает текущий рабочий каталог процесса Node.js.

```mjs
import { cwd } from 'node:process';

console.log(`Current directory: ${cwd()}`);
```

```cjs
const { cwd } = require('node:process');

console.log(`Current directory: ${cwd()}`);
```

<!-- 0030.part.md -->

## `process.debugPort`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Порт, используемый отладчиком Node.js, когда он включен.

```mjs
import process from 'node:process';

process.debugPort = 5858;
```

```cjs
const process = require('node:process');

process.debugPort = 5858;
```

<!-- 0031.part.md -->

## `process.disconnect()`

Если процесс Node.js порожден с IPC-каналом (см. документацию [Child Process](child_process.md) и [Cluster](cluster.md)), метод `process.disconnect()` закроет IPC-канал для родительского процесса, позволяя дочернему процессу изящно завершить работу, когда не останется других соединений, поддерживающих его жизнь.

Эффект от вызова `process.disconnect()` такой же, как от вызова [`ChildProcess.disconnect()`](child_process.md#subprocessdisconnect) из родительского процесса.

Если процесс Node.js не был порожден с IPC-каналом, `process.disconnect()` будет `не определен`.

<!-- 0032.part.md -->

## `process.dlopen(module, filename[, flags])`

-   `модуль` {объект}
-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `флаги` {os.constants.dlopen} **По умолчанию:** `os.constants.dlopen.RTLD_LAZY`.

Метод `process.dlopen()` позволяет динамически загружать общие объекты. Он в основном используется `require()` для загрузки C++ аддонов, и не должен использоваться напрямую, за исключением особых случаев. Другими словами, [`require()`](globals.md#require) следует предпочесть `process.dlopen()`, если нет особых причин, таких как пользовательские флаги dlopen или загрузка из модулей ES.

Аргумент `flags` - это целое число, позволяющее указать поведение dlopen. Подробности см. в документации [`os.constants.dlopen`](os.md#dlopen-constants).

Важным требованием при вызове `process.dlopen()` является передача экземпляра `модуля`. Функции, экспортируемые C++ Addon, доступны через `module.exports`.

В примере ниже показано, как загрузить C++ аддон с именем `local.node`, который экспортирует функцию `foo`. Все символы загружаются до возврата вызова, передавая константу `RTLD_NOW`. В этом примере предполагается, что константа доступна.

```mjs
import { dlopen } from 'node:process';
import { constants } из 'node:os';
import { fileURLToPath } from 'node:url';


const module = { exports: {} };
dlopen(module, fileURLToPath(new URL('local.node', import.meta.url)),
       constants.dlopen.RTLD_NOW);
module.exports.foo();
```

```cjs
const { dlopen } = require('node:process');
const { constants } = require('node:os');
const { join } = require('node:path');

const module = { exports: {} };
dlopen(
    module,
    join(__dirname, 'local.node'),
    constants.dlopen.RTLD_NOW
);
module.exports.foo();
```

<!-- 0033.part.md -->

## `process.emitWarning(warning[, options])`

-   `warning` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Предупреждение, которое нужно выдать.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Когда `warning` является `String`, `type` является именем, которое следует использовать для _типа_ выдаваемого предупреждения. **По умолчанию:** `'Warning'`.
    -   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Уникальный идентификатор для выдаваемого экземпляра предупреждения.
    -   `ctor` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Когда `warning` является `String`, `ctor` является необязательной функцией, используемой для ограничения генерируемой трассировки стека. **По умолчанию:** `process.emitWarning`.
    -   `detail` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Дополнительный текст для включения в ошибку.

Метод `process.emitWarning()` может быть использован для выдачи пользовательских или специфических для приложения предупреждений процесса. Их можно прослушать, добавив обработчик к событию [`'warning'`](#event-warning).

```mjs
import { emitWarning } from 'node:process';

// Выдаем предупреждение с кодом и дополнительной информацией.
emitWarning('Что-то случилось!', {
    код: 'MY_WARNING',
    detail: 'Это некоторая дополнительная информация',
});
// Выдает:
// (node:56338) [MY_WARNING] Warning: Что-то случилось!
// Это некоторая дополнительная информация
```

```cjs
const { emitWarning } = require('node:process');

// Выдаем предупреждение с кодом и дополнительной информацией.
emitWarning('Что-то случилось!', {
    код: 'MY_WARNING',
    detail: 'Это некоторая дополнительная информация',
});
// Выдает:
// (node:56338) [MY_WARNING] Warning: Что-то случилось!
// Это некоторая дополнительная информация
```

В этом примере объект `Error` генерируется внутри `process.emitWarning()` и передается обработчику [`'warning'`](#event-warning).

```mjs
import process from 'node:process';

process.on('warning', (warning) => {
    console.warn(warning.name); // 'Предупреждение'
    console.warn(warning.message); // 'Что-то случилось!'
    console.warn(warning.code); // 'MY_WARNING'
    console.warn(warning.stack); // Трассировка стека
    console.warn(warning.detail); // 'Это некоторая дополнительная информация'
});
```

```cjs
const process = require('node:process');

process.on('warning', (warning) => {
    console.warn(warning.name); // 'Предупреждение'
    console.warn(warning.message); // 'Что-то случилось!'
    console.warn(warning.code); // 'MY_WARNING'
    console.warn(warning.stack); // Трассировка стека
    console.warn(warning.detail); // 'Это некоторая дополнительная информация'
});
```

Если `warning` передается как объект `Error`, аргумент `options` игнорируется.

<!-- 0034.part.md -->

## `process.emitWarning(warning[, type[, code]][, ctor])`.

-   `warning` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Предупреждение, которое нужно выдать.
-   `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Когда `warning` является `String`, `type` является именем, которое следует использовать для _типа_ выдаваемого предупреждения. **По умолчанию:** `'Warning'`.
-   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Уникальный идентификатор для выдаваемого экземпляра предупреждения.
-   `ctor` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Когда `warning` является `String`, `ctor` является необязательной функцией, используемой для ограничения генерируемой трассировки стека. **По умолчанию:** `process.emitWarning`.

Метод `process.emitWarning()` может быть использован для выдачи пользовательских или специфических для приложения предупреждений процесса. Их можно прослушать, добавив обработчик к событию [`'warning'`](#event-warning).

```mjs
import { emitWarning } from 'node:process';

// Выдаем предупреждение, используя строку.
emitWarning('Что-то случилось!');
// Выдает: (node: 56338) Предупреждение: Что-то случилось!
```

```cjs
const { emitWarning } = require('node:process');

// Выдаем предупреждение, используя строку.
emitWarning('Что-то случилось!');
// Выдает: (node: 56338) Предупреждение: Что-то случилось!
```

```mjs
import { emitWarning } from 'node:process';

// Выдаем предупреждение, используя строку и тип.
emitWarning('Something Happened!', 'CustomWarning');
// Выдает: (node:56338) CustomWarning: Something Happened!
```

```cjs
const { emitWarning } = require('node:process');

// Выдаем предупреждение, используя строку и тип.
emitWarning('Something Happened!', 'CustomWarning');
// Выдается: (node:56338) CustomWarning: Something Happened!
```

```mjs
import { emitWarning } from 'node:process';

emitWarning(
    'Что-то случилось!',
    'CustomWarning',
    'WARN001'
);
// Выдает: (node:56338) [WARN001] CustomWarning: Что-то случилось!
```

```cjs
const { emitWarning } = require('node:process');

process.emitWarning(
    'Что-то случилось!',
    'CustomWarning',
    'WARN001'
);
// Выдает: (node:56338) [WARN001] CustomWarning: Что-то случилось!
```

В каждом из предыдущих примеров объект `Error` генерируется внутри `process.emitWarning()` и передается обработчику [`'warning'`](#event-warning).

```mjs
import process from 'node:process';

process.on('warning', (warning) => {
    console.warn(warning.name);
    console.warn(warning.message);
    console.warn(warning.code);
    console.warn(warning.stack);
});
```

```cjs
const process = require('node:process');

process.on('warning', (warning) => {
    console.warn(warning.name);
    console.warn(warning.message);
    console.warn(warning.code);
    console.warn(warning.stack);
});
```

Если `warning` передан как объект `Error`, он будет передан обработчику события `'warning'` без изменений (а необязательные аргументы `type`, `code` и `ctor` будут проигнорированы):

```mjs
import { emitWarning } from 'node:process';

// Emit a warning using an Error object.
const myWarning = new Error('Something happened!');
// Use the Error name property to specify the type name
myWarning.name = 'CustomWarning';
myWarning.code = 'WARN001';

emitWarning(myWarning);
// Emits: (node:56338) [WARN001] CustomWarning: Something happened!
```

```cjs
const { emitWarning } = require('node:process');

// Emit a warning using an Error object.
const myWarning = new Error('Something happened!');
// Use the Error name property to specify the type name
myWarning.name = 'CustomWarning';
myWarning.code = 'WARN001';

emitWarning(myWarning);
// Emits: (node:56338) [WARN001] CustomWarning: Something happened!
```

Если `warning` не является строкой или объектом `Error`, возникает `TypeError`.

Хотя предупреждения процесса используют объекты `Error`, механизм предупреждений процесса **не является \*\*** заменой обычных механизмов обработки ошибок.

Следующая дополнительная обработка выполняется, если `тип` предупреждения - `'DeprecationWarning'`:

-   Если используется флаг командной строки `--throw-deprecation`, предупреждение об износе выбрасывается как исключение, а не как событие.
-   Если используется флаг командной строки `--no-deprecation`, предупреждение о депривации подавляется.
-   Если используется флаг командной строки `--trace-deprecation`, предупреждение об ошибке выводится в `stderr` вместе с полной трассировкой стека.

### Избегание дублирования предупреждений

В качестве лучшей практики, предупреждения должны выдаваться только один раз для каждого процесса. Для этого поместите `emitWarning()` за булевым значением.

```mjs
import { emitWarning } from 'node:process';

function emitMyWarning() {
    if (!emitMyWarning.warned) {
        emitMyWarning.warned = true;
        emitWarning('Предупреждать только один раз!');
    }
}
emitMyWarning();
// Выдает: (узел: 56339) Предупреждение: Предупреждение только один раз!
emitMyWarning();
// Ничего не выдает
```

```cjs
const { emitWarning } = require('node:process');

function emitMyWarning() {
    if (!emitMyWarning.warned) {
        emitMyWarning.warned = true;
        emitWarning('Предупреждение только один раз!');
    }
}
emitMyWarning();
// Выдает: (узел: 56339) Предупреждение: Предупреждение только один раз!
emitMyWarning();
// Ничего не выдает
```

<!-- 0036.part.md -->

## `process.env`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.env` возвращает объект, содержащий пользовательское окружение. См. environ(7).

Пример этого объекта выглядит следующим образом:

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

Можно изменять этот объект, но такие изменения не будут отражены за пределами процесса Node.js или (если только они не запрошены явно) в других потоках [`Worker`](worker_threads.md#class-worker). Другими словами, следующий пример не будет работать:

```console
$ node -e 'process.env.foo = "bar"' && echo $foo
```

В то время как следующий пример будет работать:

```mjs
import { env } from 'node:process';

env.foo = 'bar';
console.log(env.foo);
```

```cjs
const { env } = require('node:process');

env.foo = 'bar';
console.log(env.foo);
```

Присвоение свойства `process.env` неявно преобразует значение в строку. **Это поведение устарело.** Будущие версии Node.js могут выдать ошибку, если значение не является строкой, числом или булевой функцией.

```mjs
import { env } from 'node:process';

env.test = null;
console.log(env.test);
// => 'null'
env.test = undefined;
console.log(env.test);
// => 'undefined'
```

```cjs
const { env } = require('node:process');

env.test = null;
console.log(env.test);
// => 'null'
env.test = undefined;
console.log(env.test);
// => 'undefined'
```

Используйте `delete` для удаления свойства из `process.env`.

```mjs
import { env } from 'node:process';

env.TEST = 1;
delete env.TEST;
console.log(env.TEST);
// => undefined
```

```cjs
const { env } = require('node:process');

env.TEST = 1;
delete env.TEST;
console.log(env.TEST);
// => undefined
```

В операционных системах Windows переменные окружения не чувствительны к регистру.

```mjs
import { env } from 'node:process';

env.TEST = 1;
console.log(env.test);
// => 1
```

```cjs
const { env } = require('node:process');

env.TEST = 1;
console.log(env.test);
// => 1
```

Если это явно не указано при создании экземпляра [`Worker`](worker_threads.md#class-worker), каждый поток [`Worker`](worker_threads.md#class-worker) имеет свою собственную копию `process.env`, основанную на `process.env` его родительского потока, или на том, что было указано в качестве опции `env` в конструкторе [`Worker`](worker_threads.md#class-worker). Изменения в `process.env` не будут видны в потоках [`Worker`](worker_threads.md#class-worker), и только главный поток может вносить изменения, видимые операционной системе или встроенным дополнениям.

<!-- 0037.part.md -->

## `process.execArgv`

-   [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.execArgv` возвращает набор специфических для Node.js опций командной строки, переданных при запуске процесса Node.js. Эти опции не появляются в массиве, возвращаемом свойством [`process.argv`](#processargv), и не включают исполняемый файл Node.js, имя скрипта или любые опции, следующие за именем скрипта. Эти опции полезны для порождения дочерних процессов с той же средой выполнения, что и родительский.

```
$ node --harmony script.js --version
```

Результат в `process.execArgv`:

```js
['--harmony'];
```

И `process.argv`:

```js
['/usr/local/bin/node', 'script.js', '--version'];
```

Обратитесь к конструктору [`Worker`](worker_threads.md#new-workerfilename-options) для детального поведения рабочих потоков с этим свойством.

<!-- 0038.part.md -->

## `process.execPath`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.execPath` возвращает абсолютное имя пути исполняемого файла, который запустил процесс Node.js. Символьные ссылки, если таковые имеются, разрешаются.

```js
'/usr/local/bin/node';

```

<!-- 0039.part.md -->

## `process.exit([code])`

-   `code` {integer|string|null|undefined} Код завершения. Для типа string допускаются только целые строки (например, '1'). **По умолчанию:** `0`.

Метод `process.exit()` указывает Node.js завершить процесс синхронно со статусом завершения `code`. Если `code` опущен, exit использует либо код "успеха" `0`, либо значение `process.exitCode`, если оно было установлено. Node.js не завершится, пока не будут вызваны все слушатели события [`'exit'`](#event-exit).

Для выхода с кодом "неудача":

```mjs
import { exit } from 'node:process';

exit(1);
```

```cjs
const { exit } = require('node:process');

exit(1);
```

Оболочка, которая выполнила Node.js, должна увидеть код выхода как `1`.

Вызов `process.exit()` заставит процесс завершиться как можно быстрее, даже если в процессе еще остались асинхронные операции, которые еще не завершились полностью, включая операции ввода-вывода в `process.stdout` и `process.stderr`.

В большинстве ситуаций нет необходимости явно вызывать `process.exit()`. Процесс Node.js завершится сам по себе, _если в цикле событий не будет дополнительной работы_. Свойство `process.exitCode` может быть установлено, чтобы указать процессу, какой код выхода использовать при изящном завершении процесса.

Например, следующий пример иллюстрирует _неправильное_ использование метода `process.exit()`, которое может привести к усечению и потере данных, выводимых на stdout:

```mjs
import { exit } from 'node:process';

// Это пример того, что *не* нужно делать:
if (someConditionNotMet()) {
    printUsageToStdout();
    exit(1);
}
```

```cjs
const { exit } = require('node:process');

// Это пример того, что *не* нужно делать:
if (someConditionNotMet()) {
    printUsageToStdout();
    exit(1);
}
```

Проблема заключается в том, что запись в `process.stdout` в Node.js иногда _асинхронна_ и может происходить в течение нескольких тактов цикла событий Node.js. Вызов `process.exit()`, однако, заставляет процесс завершить работу _до_ того, как эти дополнительные записи в `stdout` могут быть выполнены.

Вместо прямого вызова `process.exit()`, код _должен_ установить `process.exitCode` и позволить процессу завершиться естественным образом, избегая планирования дополнительной работы для цикла событий:

```mjs
import process from 'node:process';

// Как правильно установить код выхода и при этом позволить
// процессу выйти изящно.
if (someConditionNotMet()) {
    printUsageToStdout();
    process.exitCode = 1;
}
```

```cjs
const process = require('node:process');

// Как правильно установить код выхода и при этом позволить
// процессу выйти изящно.
if (someConditionNotMet()) {
    printUsageToStdout();
    process.exitCode = 1;
}
```

Если необходимо завершить процесс Node.js из-за ошибки, то выброс _не пойманной_ ошибки и разрешение процессу завершиться соответствующим образом безопаснее, чем вызов `process.exit()`.

В потоках [`Worker`](worker_threads.md#class-worker) эта функция останавливает текущий поток, а не текущий процесс.

<!-- 0040.part.md -->

## `process.exitCode`

-   {integer|string|null|undefined} Код выхода. Для строкового типа допускаются только целые строки (например, '1'). **По умолчанию:** `undefined`.

Число, которое будет кодом завершения процесса, когда процесс либо завершается изящно, либо завершается через [`process.exit()`](#processexitcode) без указания кода.

Указание кода в [`process.exit(code)`](#processexitcode) отменяет любую предыдущую установку `process.exitCode`.

<!-- 0041.part.md -->

## `process.getActiveResourcesInfo()`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   Возвращает: [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Метод `process.getActiveResourcesInfo()` возвращает массив строк, содержащих типы активных ресурсов, которые в настоящее время поддерживают цикл событий.

```mjs
import { getActiveResourcesInfo } from 'node:process';
import { setTimeout } from 'node:timers';

console.log('Before:', getActiveResourcesInfo());
setTimeout(() => {}, 1000);
console.log('After:', getActiveResourcesInfo());
// Печатает:
// Before: [ 'CloseReq', 'TTYWrap', 'TTYWrap', 'TTYWrap' ]
// После: [ 'CloseReq', 'TTYWrap', 'TTYWrap', 'TTYWrap', 'TTYWrap', 'Timeout' ]
```

```cjs
const { getActiveResourcesInfo } = require('node:process');
const { setTimeout } = require('node:timers');

console.log('Before:', getActiveResourcesInfo());
setTimeout(() => {}, 1000);
console.log('After:', getActiveResourcesInfo());
// Печатает:
// Before: [ 'TTYWrap', 'TTYWrap', 'TTYWrap' ]
// После: [ 'TTYWrap', 'TTYWrap', 'TTYWrap', 'Timeout' ].
```

<!-- 0042.part.md -->

## `process.getegid()`

Метод `process.getegid()` возвращает числовую эффективную групповую идентификацию процесса Node.js. (См. getegid(2).)

```mjs
import process from 'node:process';

if (process.getegid) {
    console.log(`Current gid: ${process.getegid()}`);
}
```

```cjs
const process = require('node:process');

if (process.getegid) {
    console.log(`Current gid: ${process.getegid()}`);
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android).

<!-- 0043.part.md -->

## `process.geteuid()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `process.geteuid()` возвращает числовой эффективный идентификатор пользователя процесса. (См. geteuid(2).)

```mjs
import process from 'node:process';

if (process.geteuid) {
    console.log(`Current uid: ${process.geteuid()}`);
}
```

```cjs
const process = require('node:process');

if (process.geteuid) {
    console.log(`Current uid: ${process.geteuid()}`);
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android).

<!-- 0044.part.md -->

## `process.getgid()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Метод `process.getgid()` возвращает числовой групповой идентификатор процесса. (См. getgid(2).)

```mjs
import process from 'node:process';

if (process.getgid) {
    console.log(`Current gid: ${process.getgid()}`);
}
```

```cjs
const process = require('node:process');

if (process.getgid) {
    console.log(`Current gid: ${process.getgid()}`);
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android).

<!-- 0045.part.md -->

## `process.getgroups()`

-   Возвращает: [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.getgroups()` возвращает массив с идентификаторами дополнительных групп. POSIX не уточняет, включен ли идентификатор эффективной группы, но Node.js гарантирует, что он всегда включен.

```mjs
import process from 'node:process';

if (process.getgroups) {
    console.log(process.getgroups()); // [ 16, 21, 297 ]
}
```

```cjs
const process = require('node:process');

if (process.getgroups) {
    console.log(process.getgroups()); // [ 16, 21, 297 ]
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android).

<!-- 0046.part.md -->

## `process.getuid()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.getuid()` возвращает числовой идентификатор пользователя процесса. (См. getuid(2).)

```mjs
import process from 'node:process';

if (process.getuid) {
    console.log(`Current uid: ${process.getuid()}`);
}
```

```cjs
const process = require('node:process');

if (process.getuid) {
    console.log(`Current uid: ${process.getuid()}`);
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android).

<!-- 0047.part.md -->

## `process.hasUncaughtExceptionCaptureCallback()`

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Указывает, был ли установлен обратный вызов с помощью [`process.setUncaughtExceptionCaptureCallback()`](#processsetuncaughaughtexceptioncapturecallbackfn).

<!-- 0048.part.md -->

## `process.hrtime([time])`

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`process.hrtime.bigint()`](#processhrtimebigint).

-   `time` {integer\[\]} Результат предыдущего вызова `process.hrtime()`.
-   Возвращает: {integer\[\]}

Это унаследованная версия [`process.hrtime.bigint()`](#processhrtimebigint) до появления `bigint` в JavaScript.

Метод `process.hrtime()` возвращает текущее реальное время высокого разрешения в виде кортежа `[секунды, наносекунды]`, где `наносекунды` - это оставшаяся часть реального времени, которая не может быть представлена с точностью до секунды.

`time` - необязательный параметр, который должен быть результатом предыдущего вызова `process.hrtime()` для дифференциации с текущим временем. Если переданный параметр не является кортежем `Array`, будет выдана ошибка `TypeError`. Передача пользовательского массива вместо результата предыдущего вызова `process.hrtime()` приведет к неопределенному поведению.

Эти времена относятся к произвольному времени в прошлом, не связаны со временем суток и поэтому не подвержены дрейфу часов. Основное применение - измерение производительности между интервалами:

```mjs
import { hrtime } from 'node:process';

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
    // Бенчмарк занял 1000000552 наносекунды
}, 1000);
```

```cjs
const { hrtime } = require('node:process');

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
    // Бенчмарк занял 1000000552 наносекунды
}, 1000);
```

<!-- 0049.part.md -->

## `process.hrtime.bigint()`

-   Возвращает: [`<bigint>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/BigInt)

`bigint` версия метода [`process.hrtime()`](#processhrtimetime), возвращающая текущее реальное время высокого разрешения в наносекундах в виде `bigint`.

В отличие от метода [`process.hrtime()`](#processhrtimetime), он не поддерживает дополнительный аргумент `time`, поскольку разница может быть вычислена непосредственно вычитанием двух `bigint`.

```mjs
import { hrtime } from 'node:process';

const start = hrtime.bigint();
// 191051479007711n

setTimeout(() => {
    const end = hrtime.bigint();
    // 191052633396993n

    console.log(
        `Benchmark took ${end - start} nanoseconds`
    );
    // Бенчмарк занял 1154389282 наносекунды
}, 1000);
```

```cjs
const { hrtime } = require('node:process');

const start = hrtime.bigint();
// 191051479007711n

setTimeout(() => {
    const end = hrtime.bigint();
    // 191052633396993n

    console.log(
        `Benchmark took ${end - start} nanoseconds`
    );
    // Бенчмарк занял 1154389282 наносекунды
}, 1000);
```

<!-- 0050.part.md -->

## `process.initgroups(user, extraGroup)`

-   `user` {string|number} Имя пользователя или числовой идентификатор.
-   `extraGroup` {string|number} Имя группы или числовой идентификатор.

Метод `process.initgroups()` читает файл `/etc/group` и инициализирует список доступа групп, используя все группы, членом которых является пользователь. Это привилегированная операция, которая требует, чтобы процесс Node.js имел либо доступ `root`, либо возможность `CAP_SETGID`.

Будьте осторожны при сбросе привилегий:

```mjs
import {
    getgroups,
    initgroups,
    setgid,
} from 'node:process';

console.log(getgroups()); // [ 0 ]
initgroups('nodeuser', 1000); // переключаем пользователя
console.log(getgroups()); // [ 27, 30, 46, 1000, 0 ]
setgid(1000); // сбрасываем gid корня
console.log(getgroups()); // [ 27, 30, 46, 1000 ]
```

```cjs
const {
    getgroups,
    initgroups,
    setgid,
} = require('node:process');

console.log(getgroups()); // [ 0 ]
initgroups('nodeuser', 1000); // переключаем пользователя
console.log(getgroups()); // [ 27, 30, 46, 1000, 0 ]
setgid(1000); // сбрасываем gid корня
console.log(getgroups()); // [ 27, 30, 46, 1000 ]
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android). Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0051.part.md -->

## `process.kill(pid[, signal])`

-   `pid` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Идентификатор процесса
-   `signal` {строка|число} Сигнал для отправки, либо в виде строки, либо в виде числа. **По умолчанию:** `'SIGTERM'`.

Метод `process.kill()` посылает `signal` процессу, идентифицированному `pid`.

Имена сигналов - это строки, такие как `'SIGINT'` или `'SIGHUP'`. Более подробную информацию смотрите в [Signal Events](#signal-events) и kill(2).

Этот метод выдаст ошибку, если целевой `pid` не существует. В качестве особого случая, сигнал `0` может быть использован для проверки существования процесса. Платформы Windows выдадут ошибку, если `pid` используется для уничтожения группы процессов.

Хотя эта функция называется `process.kill()`, на самом деле это просто отправитель сигнала, как и системный вызов `kill`. Посылаемый сигнал может делать что-то еще, кроме уничтожения целевого процесса.

```mjs
import process, { kill } from 'node:process';

process.on('SIGHUP', () => {
    console.log('Получен сигнал SIGHUP.');
});

setTimeout(() => {
    console.log('Exiting.');
    process.exit(0);
}, 100);

kill(process.pid, 'SIGHUP');
```

```cjs
const process = require('node:process');

process.on('SIGHUP', () => {
    console.log('Получен сигнал SIGHUP.');
});

setTimeout(() => {
    console.log('Exiting.');
    process.exit(0);
}, 100);

process.kill(process.pid, 'SIGHUP');
```

Когда `SIGUSR1` получен процессом Node.js, Node.js запустит отладчик. Смотрите [Сигнальные события](#signal-events).

<!-- 0052.part.md -->

## `process.mainModule`

> Стабильность: 0 - Утратил актуальность: Используйте [`require.main`](modules.md#accessing-the-main-module) вместо этого.

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.mainModule` предоставляет альтернативный способ получения [`require.main`](modules.md#accessing-the-main-module). Разница заключается в том, что если главный модуль меняется во время выполнения, [`require.main`](modules.md#accessing-the-main-module) может по-прежнему ссылаться на исходный главный модуль в модулях, которые были необходимы до изменения. В целом, можно считать, что эти две ссылки относятся к одному и тому же модулю.

Как и в случае с [`require.main`](modules.md#accessing-the-main-module), `process.mainModule` будет `undefined`, если нет скрипта входа.

<!-- 0053.part.md -->

## `process.memoryUsage()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `rss` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `heapTotal` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `heapUsed` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `external` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `arrayBuffers` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Возвращает объект, описывающий использование памяти процессом Node.js, измеренное в байтах.

```mjs
import { memoryUsage } from 'node:process';

console.log(memoryUsage());
// Печатает:
// {
// rss: 4935680,
// heapTotal: 1826816,
// heapUsed: 650472,
// external: 49879,
// arrayBuffers: 9386
// }
```

```cjs
const { memoryUsage } = require('node:process');

console.log(memoryUsage());
// Печатает:
// {
// rss: 4935680,
// heapTotal: 1826816,
// heapUsed: 650472,
// external: 49879,
// arrayBuffers: 9386
// }
```

-   `heapTotal` и `heapUsed` относятся к использованию памяти V8.
-   `external` относится к использованию памяти объектов C++, связанных с объектами JavaScript, управляемыми V8.
-   `rss`, Resident Set Size, - это объем пространства, занимаемый в основном устройстве памяти (которое является подмножеством всей выделенной памяти) для процесса, включая все объекты и код C++ и JavaScript.
-   `arrayBuffers` относится к памяти, выделенной для `ArrayBuffer` и `SharedArrayBuffer`, включая все Node.js [`Buffer`](buffer.md)s. Это также включено в значение `external`. Когда Node.js используется как встроенная библиотека, это значение может быть `0`, потому что выделения для `ArrayBuffer` в этом случае могут не отслеживаться.

При использовании потоков [`Worker`](worker_threads.md#class-worker), `rss` будет значением, действительным для всего процесса, в то время как остальные поля будут относиться только к текущему потоку.

Метод `process.memoryUsage()` выполняет итерации по каждой странице для сбора информации об использовании памяти, что может быть медленным в зависимости от распределения памяти программы.

<!-- 0054.part.md -->

## `process.memoryUsage.rss()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.memoryUsage.rss()` возвращает целое число, представляющее размер резидентного набора (RSS) в байтах.

Resident Set Size - это объем пространства, занимаемый в основной памяти (которая является подмножеством всей выделенной памяти) для процесса, включая все объекты и код C++ и JavaScript.

Это то же значение, что и свойство `rss`, предоставляемое `process.memoryUsage()`, но `process.memoryUsage.rss()` быстрее.

```mjs
import { memoryUsage } from 'node:process';

console.log(memoryUsage.rss());
// 35655680
```

```cjs
const { rss } = require('node:process');

console.log(memoryUsage.rss());
// 35655680
```

<!-- 0055.part.md -->

## `process.nextTick(callback[, ...args])`

-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `...args` {любые} Дополнительные аргументы для передачи при вызове `callback`.

Функция `process.nextTick()` добавляет `callback` в "очередь следующего тика". Эта очередь полностью опустошается после завершения текущей операции на стеке JavaScript и перед тем, как цикл событий будет продолжен. Можно создать бесконечный цикл, если рекурсивно вызывать `process.nextTick()`. Дополнительную информацию см. в руководстве [Event Loop](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#process-nexttick).

```mjs
import { nextTick } from 'node:process';

console.log('start');
nextTick(() => {
    console.log('nextTick callback');
});
console.log('scheduled');
// Выходные данные:
// старт
// запланированный
// обратный вызов nextTick
```

```cjs
const { nextTick } = require('node:process');

console.log('start');
nextTick(() => {
    console.log('nextTick callback');
});
console.log('scheduled');
// Выходные данные:
// старт
// запланированный
// обратный вызов nextTick
```

Это важно при разработке API, чтобы дать пользователям возможность назначать обработчики событий _после_ создания объекта, но до того, как произойдет ввод/вывод:

```mjs
import { nextTick } from 'node:process';

function MyThing(options) {
    this.setupOptions(options);

    nextTick(() => {
        this.startDoingStuff();
    });
}

const thing = new MyThing();
thing.getReadyForStuff();

// thing.startDoingStuff() вызывается сейчас, а не раньше.
```

```cjs
const { nextTick } = require('node:process');

function MyThing(options) {
    this.setupOptions(options);

    nextTick(() => {
        this.startDoingStuff();
    });
}

const thing = new MyThing();
thing.getReadyForStuff();

// thing.startDoingStuff() вызывается сейчас, а не раньше.
```

Очень важно, чтобы API были либо на 100% синхронными, либо на 100% асинхронными. Рассмотрим этот пример:

```js
// ВНИМАНИЕ!  НЕ ИСПОЛЬЗОВАТЬ!  ОПАСНО!
function maybeSync(arg, cb) {
    if (arg) {
        cb();
        return;
    }

    fs.stat('file', cb);
}
```

Этот API опасен, поскольку в следующем случае:

```js
const maybeTrue = Math.random() > 0.5;

maybeSync(maybeTrue, () => {
    foo();
});

bar();
```

Неясно, что будет вызвано первым - `foo()` или `bar()`.

Следующий подход намного лучше:

```mjs
import { nextTick } from 'node:process';

function definitelyAsync(arg, cb) {
    if (arg) {
        nextTick(cb);
        return;
    }

    fs.stat('file', cb);
}
```

```cjs
const { nextTick } = require('node:process');

function definitelyAsync(arg, cb) {
    if (arg) {
        nextTick(cb);
        return;
    }

    fs.stat('file', cb);
}
```

<!-- 0056.part.md -->

### Когда использовать `queueMicrotask()` против `process.nextTick()`

API [`queueMicrotask()`](globals.md#queuemicrotaskcallback) - это альтернатива `process.nextTick()`, которая также откладывает выполнение функции, используя ту же очередь микрозадач, которая используется для выполнения обработчиков then, catch и finally разрешенных обещаний. В Node.js каждый раз, когда "очередь следующего тика" опустошается, очередь микрозадач опустошается сразу после этого.

```mjs
import { nextTick } from 'node:process';

Promise.resolve().then(() => console.log(2));
queueMicrotask(() => console.log(3));
nextTick(() => console.log(1));
// Выход:
// 1
// 2
// 3
```

```cjs
const { nextTick } = require('node:process');

Promise.resolve().then(() => console.log(2));
queueMicrotask(() => console.log(3));
nextTick(() => console.log(1));
// Выход:
// 1
// 2
// 3
```

Для _большинства_ пользовательских сценариев API `queueMicrotask()` предоставляет переносимый и надежный механизм отсрочки выполнения, который работает в различных средах платформы JavaScript, и ему следует отдать предпочтение перед `process.nextTick()`. В простых сценариях `queueMicrotask()` может стать полноценной заменой `process.nextTick()`.

```js
console.log('start');
queueMicrotask(() => {
    console.log('обратный вызов микрозадачи');
});
console.log('scheduled');
// Вывод:
// запуск
// запланированный
// обратный вызов микрозадачи
```

Одно заслуживающее внимания различие между двумя API заключается в том, что `process.nextTick()` позволяет указать дополнительные значения, которые будут переданы в качестве аргументов отложенной функции при ее вызове. Для достижения того же результата с помощью `queueMicrotask()` необходимо использовать либо закрытие, либо связанную функцию:

```js
function deferred(a, b) {
    console.log('microtask', a + b);
}

console.log('start');
queueMicrotask(deferred.bind(undefined, 1, 2));
console.log('scheduled');
// Выходные данные:
// start
// запланированный
// микрозадача 3
```

Существуют незначительные различия в том, как обрабатываются ошибки, возникающие внутри очереди следующего тика и очереди микрозадач. Ошибки, возникающие внутри очереди обратного вызова микрозадачи, должны обрабатываться внутри очереди обратного вызова, когда это возможно. Если это невозможно, то для перехвата и обработки ошибок можно использовать обработчик событий `process.on('uncaughtException')`.

В случае сомнений, если не требуются специфические возможности `process.nextTick()`, используйте `queueMicrotask()`.

<!-- 0057.part.md -->

## `process.noDeprecation`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `process.noDeprecation` указывает, установлен ли флаг `--no-deprecation` для текущего процесса Node.js. Более подробную информацию о поведении этого флага смотрите в документации к событию [`'warning'`'](#event-warning) и методу [`emitWarning()`](#processemitwarningwarning-type-code-ctor).

<!-- 0058.part.md -->

## `process.permission`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Этот API доступен через флаг [`--experimental-permission`](cli.md#--experimental-permission).

`process.permission` - это объект, методы которого используются для управления разрешениями для текущего процесса. Дополнительная документация доступна в [Permission Model](permissions.md#permission-model).

<!-- 0059.part.md -->

### `process.permission.deny(scope[, reference])`.

-   `scopes` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `reference` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Запрет разрешений во время выполнения.

Доступными областями являются:

-   `fs` - Вся файловая система
-   `fs.read` - Операции чтения файловой системы
-   `fs.write` - операции записи в файловой системе

Ссылка имеет значение, основанное на предоставленной области видимости. Например, ссылка, когда область видимости - Файловая система, означает файлы и папки.

```js
// Запретить операции READ к файлу ./README.md
process.permission.deny('fs.read', ['./README.md']);
// Запретить ВСЕ операции записи
process.permission.deny('fs.write');
```

<!-- 0060.part.md -->

### `process.permission.has(scope[, reference])`.

-   `scopes` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `reference` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Проверяет, может ли процесс получить доступ к заданной области видимости и ссылке. Если ссылка не указана, предполагается глобальная область видимости, например, `process.permission.has('fs.read')` проверит, имеет ли процесс ВСЕ разрешения на чтение файловой системы.

Ссылка имеет значение, основанное на предоставленной области видимости. Например, ссылка в области видимости File System означает файлы и папки.

Доступными областями являются:

-   `fs` - Вся файловая система
-   `fs.read` - операции чтения файловой системы
-   `fs.write` - операции записи в файловой системе

<!-- конец списка -->

```js
// Проверьте, есть ли у процесса разрешение на чтение файла README
process.permission.has('fs.read', './README.md');
// Проверьте, есть ли у процесса разрешение на чтение операций
process.permission.has('fs.read');
```

<!-- 0061.part.md -->

## `process.pid`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `process.pid` возвращает PID процесса.

```mjs
import { pid } from 'node:process';

console.log(`Этот процесс имеет pid ${pid}`);
```

```cjs
const { pid } = require('node:process');

console.log(`Этот процесс - pid ${pid}`);
```

<!-- 0062.part.md -->

## `process.platform`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.platform` возвращает строку, идентифицирующую платформу операционной системы, для которой был скомпилирован бинарный файл Node.js.

В настоящее время возможными значениями являются:

-   `aix`
-   `darwin`
-   `freebsd`
-   `linux`
-   `openbsd`
-   `Sunos`
-   `win32`

<!-- конец списка -->

```mjs
import { platform } from 'node:process';

console.log(`Эта платформа ${платформа}`);
```

```cjs
const { platform } = require('node:process');

console.log(`Эта платформа - ${платформа}`);
```

Значение `'android'` также может быть возвращено, если Node.js построен на операционной системе Android. Однако поддержка Android в Node.js [является экспериментальной] (https://github.com/nodejs/node/blob/HEAD/BUILDING.md#androidandroid-based-devices-eg-firefox-os).

<!-- 0063.part.md -->

## `process.ppid`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Свойство `process.ppid` возвращает PID родителя текущего процесса.

```mjs
import { ppid } from 'node:process';

console.log(`Родительский процесс имеет pid ${ppid}`);
```

```cjs
const { ppid } = require('node:process');

console.log(`Родительский процесс - pid ${ppid}`);
```

<!-- 0064.part.md -->

## `process.release`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.release` возвращает `Object`, содержащий метаданные, относящиеся к текущему релизу, включая URL-адреса исходного tarball и tarball только с заголовками.

`process.release` содержит следующие свойства:

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение, которое всегда будет `'node''.
-   `sourceUrl` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) абсолютный URL, указывающий на файл _`.tar.gz`_, содержащий исходный код текущего релиза.
-   `headersUrl`[`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) абсолютный URL, указывающий на файл _`.tar.gz`_, содержащий только заголовочные файлы исходного кода текущего выпуска. Этот файл значительно меньше полного исходного файла и может быть использован для компиляции нативных дополнений Node.js.
-   `libUrl` {string|undefined} абсолютный URL, указывающий на файл _`node.lib`_, соответствующий архитектуре и версии текущего выпуска. Этот файл используется для компиляции встроенных дополнений Node.js. _Это свойство присутствует только в Windows-сборках Node.js и будет отсутствовать на всех остальных платформах._
-   `lts` {string|undefined} строковая метка, идентифицирующая метку [LTS](https://github.com/nodejs/Release) для этого выпуска. Это свойство существует только для релизов LTS и является `неопределенным` для всех других типов релизов, включая релизы _Current_. Допустимые значения включают кодовые имена релизов LTS (включая те, которые больше не поддерживаются).
    -   `'Fermium'` для линейки 14.x LTS, начиная с 14.15.0.
    -   `Галлий` для линейки 16.x LTS, начиная с 16.13.0.
    -   `Водород` для линейки 18.x LTS, начиная с 18.12.0. Другие кодовые названия релизов LTS смотрите в [Node.js Changelog Archive](https://github.com/nodejs/node/blob/HEAD/doc/changelogs/CHANGELOG_ARCHIVE.md).

<!-- конец списка -->

```js
{
  name: 'node',
  lts: 'Hydrogen',
  sourceUrl: 'https://nodejs.org/download/release/v18.12.0/node-v18.12.0.tar.gz',
  headersUrl: 'https://nodejs.org/download/release/v18.12.0/node-v18.12.0-headers.tar.gz',
  libUrl: 'https://nodejs.org/download/release/v18.12.0/win-x64/node.lib'
}
```

В пользовательских сборках из нерелизных версий дерева исходников может присутствовать только свойство `name`. Не следует полагаться на существование дополнительных свойств.

<!-- 0065.part.md -->

## `process.report`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

`process.report` - это объект, методы которого используются для создания диагностических отчетов для текущего процесса. Дополнительная документация доступна в документации [report documentation](report.md).

<!-- 0066.part.md -->

### `process.report.compact`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Записывать отчеты в компактном формате, однострочном JSON, более удобном для систем обработки журналов, чем многострочный формат по умолчанию, предназначенный для человеческого потребления.

```mjs
import { report } from 'node:process';


console.log(``Отчеты компактны? ${report.compact}`);
```

```cjs
const { report } = require('node:process');

console.log(`Отчеты компактны? ${report.compact}`);
```

<!-- 0067.part.md -->

### `process.report.directory`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Каталог, в который записывается отчет. Значение по умолчанию - пустая строка, указывающая, что отчеты записываются в текущий рабочий каталог процесса Node.js.

```mjs
import { report } from 'node:process';

console.log(`Каталог отчета - ${report.directory}`);
```

```cjs
const { report } = require('node:process');

console.log(`Report directory is ${report.directory}`);
```

<!-- 0068.part.md -->

### `process.report.filename`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Имя файла, в который записывается отчет. Если установлено значение пустой строки, имя выходного файла будет состоять из метки времени, PID и номера последовательности. Значение по умолчанию - пустая строка.

Если значение `process.report.filename` установлено в `'stdout'` или `'stderr'`, отчет будет записан в stdout или stderr процесса соответственно.

```mjs
import { report } from 'node:process';

console.log(`Имя файла отчета - ${report.filename}`);
```

```cjs
const { report } = require('node:process');

console.log(`Report filename is ${report.filename}`);
```

<!-- 0069.part.md -->

### `process.report.getReport([err])`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Пользовательская ошибка, используемая для отчета о стеке JavaScript.
-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Возвращает представление JavaScript-объекта диагностического отчета для запущенного процесса. Трассировка стека JavaScript в отчете берется из `err`, если присутствует.

```mjs
import { report } from 'node:process';

const data = report.getReport();
console.log(data.header.nodejsVersion);

// Аналогично process.report.writeReport()
import fs from 'node:fs';
fs.writeFileSync(
    'my-report.log',
    util.inspect(data),
    'utf8'
);
```

```cjs
const { report } = require('node:process');

const data = report.getReport();
console.log(data.header.nodejsVersion);

// Аналогично process.report.writeReport()
const fs = require('node:fs');
fs.writeFileSync(
    'my-report.log',
    util.inspect(data),
    'utf8'
);
```

Дополнительная документация доступна в [документации по отчету](report.md).

<!-- 0070.part.md -->

### `process.report.reportOnFatalError`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, генерируется диагностический отчет о фатальных ошибках, таких как ошибки выхода из памяти или неудачные утверждения C++.

```mjs
import { report } from 'node:process';

console.log(
    `Отчет о фатальной ошибке: ${report.reportOnFatalError}`
);
```

```cjs
const { report } = require('node:process');


console.log(``Отчет о фатальной ошибке: ${report.reportOnFatalError}`);
```

<!-- 0071.part.md -->

### `process.report.reportOnSignal`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, диагностический отчет генерируется, когда процесс получает сигнал, указанный `process.report.signal`.

```mjs
import { report } from 'node:process';

console.log(`Отчет по сигналу: ${report.reportOnSignal}`);
```

```cjs
const { report } = require('node:process');

console.log(`Report on signal: ${report.reportOnSignal}`);
```

<!-- 0072.part.md -->

### `process.report.reportOnUncaughtException`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если `true`, диагностический отчет генерируется при не пойманном исключении.

```mjs
import { report } from 'node:process';

console.log(
    `Report on exception: ${report.reportOnUncaughtException}`
);
```

```cjs
const { report } = require('node:process');

console.log(
    `Report on exception: ${report.reportOnUncaughtException}`
);
```

<!-- 0073.part.md -->

### `process.report.signal`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Сигнал, используемый для запуска создания диагностического отчета. По умолчанию `'SIGUSR2'`.

```mjs
import { report } from 'node:process';

console.log(`Сигнал отчета: ${report.signal}`);
```

```cjs
const { report } = require('node:process');

console.log(`Сигнал отчета: ${report.signal}`);
```

<!-- 0074.part.md -->

### `process.report.writeReport([filename][, err])`.

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя файла, в который записывается отчет. Это должен быть относительный путь, который будет добавлен к директории, указанной в `process.report.directory`, или к текущей рабочей директории процесса Node.js, если она не указана.

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Пользовательская ошибка, используемая для отчета о стеке JavaScript.

-   Возвращает: [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Возвращает имя файла сгенерированного отчета.

Записывает диагностический отчет в файл. Если `filename` не указано, имя файла по умолчанию включает дату, время, PID и порядковый номер. Трассировка стека JavaScript в отчете берется из `err`, если присутствует.

Если значение `filename` имеет значение `'stdout'` или `'stderr'`, отчет записывается в stdout или stderr процесса соответственно.

```mjs
import { report } from 'node:process';

report.writeReport();
```

```cjs
const { report } = require('node:process');

report.writeReport();
```

Дополнительная документация доступна в документации [report documentation](report.md).

<!-- 0075.part.md -->

## `process.resourceUsage()`

-   Возвращает: [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) использование ресурсов для текущего процесса. Все эти значения берутся из вызова `uv_getrusage`, который возвращает [`uv_rusage_t` struct](https://docs.libuv.org/en/v1.x/misc.html#c.uv_rusage_t).
    -   `userCPUTime` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_utime`, вычисляемое в микросекундах. Это то же значение, что и [`process.cpuUsage().user`](#processcpuusagepreviousvalue).
    -   `systemCPUTime` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображает `ru_stime`, вычисляемое в микросекундах. Это то же значение, что и [`process.cpuUsage().system`](#processcpuusagepreviousvalue).
    -   `maxRSS` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_maxrss`, который является максимальным размером используемого резидентного набора в килобайтах.
    -   `sharedMemorySize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_ixrss`, но не поддерживается ни одной платформой.
    -   `unsharedDataSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_idrss`, но не поддерживается ни одной платформой.
    -   `unsharedStackSize` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_isrss`, но не поддерживается ни одной платформой.
    -   `minorPageFault` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_minflt`, что является количеством мелких ошибок страниц для процесса, см. подробнее [эта статья](https://en.wikipedia.org/wiki/Page_fault#Minor).
    -   `majorPageFault` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_majflt`, которое является числом основных ошибок страниц для процесса, смотрите [эту статью подробнее](https://en.wikipedia.org/wiki/Page_fault#Major). Это поле не поддерживается в Windows.
    -   `swappedOut` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_nswap`, но не поддерживается ни одной платформой.
    -   `fsRead` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_inblock`, что является количеством раз, когда файловая система должна была выполнить ввод.
    -   `fsWrite` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) обозначает `ru_oublock`, т.е. количество раз, когда файловая система должна была выполнить вывод.
    -   `ipcSent` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_msgsnd`, но не поддерживается ни одной платформой.
    -   `ipcReceived` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) соответствует `ru_msgrcv`, но не поддерживается ни одной платформой.
    -   `signalsCount` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_nsignals`, но не поддерживается ни одной платформой.
    -   `voluntaryContextSwitches` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображается на `ru_nvcsw` и представляет собой количество случаев, когда переключение контекста процессора произошло из-за того, что процесс добровольно отдал процессор до завершения своего временного среза (обычно для ожидания доступности ресурса). Это поле не поддерживается в Windows.
    -   `involuntaryContextSwitches` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) отображает `ru_nivcsw`, которое представляет собой количество раз, когда переключение контекста процессора произошло из-за того, что процесс с более высоким приоритетом стал выполнимым или из-за того, что текущий процесс превысил свой временной срез. Это поле не поддерживается в Windows.

<!-- конец списка -->

```mjs
import { resourceUsage } from 'node:process';

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
const { resourceUsage } = require('node:process');

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

<!-- 0076.part.md -->

## `process.send(message[, sendHandle[, options]][, callback])`

-   `message` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
-   `sendHandle` {net.Server|net.Socket}
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) используется для параметризации отправки определенных типов дескрипторов.`options` поддерживает следующие свойства:
    -   `keepOpen` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Значение, которое может использоваться при передаче экземпляров `net.Socket`. Если `true`, сокет остается открытым в процессе отправки. **По умолчанию:** `false`.
-   `callback` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type).

Если Node.js порожден с IPC-каналом, метод `process.send()` может быть использован для отправки сообщений родительскому процессу. Сообщения будут получены как событие [`'message'`](child_process.md#event-message) на объекте [`ChildProcess`](child_process.md#class-childprocess) родительского процесса.

Если Node.js не был порожден с IPC каналом, `process.send` будет `undefined`.

Сообщение проходит сериализацию и синтаксический анализ. Полученное сообщение может отличаться от первоначально отправленного.

<!-- 0077.part.md -->

## `process.setegid(id)`

-   `id` {string|number} Имя группы или идентификатор.

Метод `process.setegid()` устанавливает эффективный групповой идентификатор процесса. (См. setegid(2).) Значение `id` может быть передано как числовой идентификатор или строка имени группы. Если указано имя группы, этот метод блокируется на время разрешения связанного с ним числового идентификатора.

```mjs
import process from 'node:process';

if (process.getegid && process.setegid) {
    console.log(`Current gid: ${process.getegid()}`);
    try {
        process.setegid(501);
        console.log(`Новый gid: ${process.getegid()}`);
    } catch (err) {
        console.error(`Failed to set gid: ${err}`);
    }
}
```

```cjs
const process = require('node:process');

if (process.getegid && process.setegid) {
    console.log(`Current gid: ${process.getegid()}`);
    try {
        process.setegid(501);
        console.log(`Новый gid: ${process.getegid()}`);
    } catch (err) {
        console.error(`Failed to set gid: ${err}`);
    }
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android). Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0078.part.md -->

## `process.seteuid(id)`

-   `id` {string|number} Имя пользователя или идентификатор.

Метод `process.seteuid()` устанавливает эффективную идентификацию пользователя процесса. (См. seteuid(2).) Значение `id` может быть передано как числовой идентификатор или строка имени пользователя. Если указано имя пользователя, метод блокируется на время разрешения связанного с ним числового идентификатора.

```mjs
import process from 'node:process';

if (process.geteuid && process.seteuid) {
    console.log(`Current uid: ${process.geteuid()}`);
    try {
        process.seteuid(501);
        console.log(`Новый uid: ${process.geteuid()}`);
    } catch (err) {
        console.error(`Failed to set uid: ${err}`);
    }
}
```

```cjs
const process = require('node:process');

if (process.geteuid && process.seteuid) {
    console.log(`Current uid: ${process.geteuid()}`);
    try {
        process.seteuid(501);
        console.log(`Новый uid: ${process.geteuid()}`);
    } catch (err) {
        console.error(`Failed to set uid: ${err}`);
    }
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android). Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0079.part.md -->

## `process.setgid(id)`

-   `id` {string|number} Имя или идентификатор группы

Метод `process.setgid()` устанавливает групповой идентификатор процесса. (См. setgid(2).) Значение `id` может быть передано как числовой идентификатор или строка имени группы. Если указано имя группы, этот метод блокируется на время разрешения связанного с ним числового идентификатора.

```mjs
import process from 'node:process';

if (process.getgid && process.setgid) {
    console.log(`Current gid: ${process.getgid()}`);
    try {
        process.setgid(501);
        console.log(`Новый gid: ${process.getgid()}`);
    } catch (err) {
        console.error(`Failed to set gid: ${err}`);
    }
}
```

```cjs
const process = require('node:process');

if (process.getgid && process.setgid) {
    console.log(`Current gid: ${process.getgid()}`);
    try {
        process.setgid(501);
        console.log(`Новый gid: ${process.getgid()}`);
    } catch (err) {
        console.error(`Failed to set gid: ${err}`);
    }
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android). Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0080.part.md -->

## `process.setgroups(groups)`

-   `groups` [`<integer[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.setgroups()` устанавливает идентификаторы дополнительных групп для процесса Node.js. Это привилегированная операция, которая требует, чтобы процесс Node.js имел права `root` или `CAP_SETGID`.

Массив `groups` может содержать числовые идентификаторы групп, имена групп или и то, и другое.

```mjs
import process from 'node:process';

if (process.getgroups && process.setgroups) {
    try {
        process.setgroups([501]);
        console.log(process.getgroups()); // новые группы
    } catch (err) {
        console.error(`Failed to set groups: ${err}`);
    }
}
```

```cjs
const process = require('node:process');

if (process.getgroups && process.setgroups) {
    try {
        process.setgroups([501]);
        console.log(process.getgroups()); // новые группы
    } catch (err) {
        console.error(`Failed to set groups: ${err}`);
    }
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android). Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0081.part.md -->

## `process.setuid(id)`

-   `id` {целое число | строка}

Метод `process.setuid(id)` устанавливает идентификатор пользователя процесса. (См. setuid(2).) Значение `id` может быть передано как числовой идентификатор или как строка имени пользователя. Если указано имя пользователя, метод блокируется на время разрешения связанного с ним числового идентификатора.

```mjs
import process from 'node:process';

if (process.getuid && process.setuid) {
    console.log(`Current uid: ${process.getuid()}`);
    try {
        process.setuid(501);
        console.log(`Новый uid: ${process.getuid()}`);
    } catch (err) {
        console.error(`Failed to set uid: ${err}`);
    }
}
```

```cjs
const process = require('node:process');

if (process.getuid && process.setuid) {
    console.log(`Current uid: ${process.getuid()}`);
    try {
        process.setuid(501);
        console.log(`Новый uid: ${process.getuid()}`);
    } catch (err) {
        console.error(`Failed to set uid: ${err}`);
    }
}
```

Эта функция доступна только на POSIX платформах (т.е. не Windows или Android). Эта функция недоступна в потоках [`Worker`](worker_threads.md#class-worker).

<!-- 0082.part.md -->

## `process.setSourceMapsEnabled(val)`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   `val` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Эта функция включает или выключает поддержку [Source Map v3](https://sourcemaps.info/spec.html) для трассировки стека.

Она предоставляет те же возможности, что и запуск процесса Node.js с опциями командной строки `--enable-source-maps`.

Будут разобраны и загружены только карты источников в JavaScript файлах, которые загружаются после включения source maps.

<!-- 0083.part.md -->

## `process.setUncaughtExceptionCaptureCallback(fn)`

-   `fn` {Function|null}

Функция `process.setUncaughtExceptionCaptureCallback()` устанавливает функцию, которая будет вызываться при возникновении не пойманного исключения и будет принимать в качестве первого аргумента само значение исключения.

Если такая функция установлена, то событие [`'uncaughtException'`](#event-uncaughtexception) не будет испущено. Если функция `--abort-on-uncaught-exception` была передана из командной строки или задана через [`v8.setFlagsFromString()`](v8.md#v8setflagsfromstringflags), процесс не прервется. Действия, настроенные на выполнение при исключениях, таких как генерация отчетов, также будут затронуты.

Для отмены функции перехвата можно использовать `process.setUncaughtExceptionCaptureCallback(null)`. Вызов этого метода с аргументом не `null`, когда установлена другая функция захвата, приведет к ошибке.

Использование этой функции исключает использование устаревшего встроенного модуля [`domain`](domain.md).

<!-- 0084.part.md -->

## `process.stderr`

-   [`<Stream>`](stream.md#stream)

Свойство `process.stderr` возвращает поток, подключенный к `stderr` (fd `2`). Это [`net.Socket`](net.md#class-netsocket) (который является [Duplex](stream.md#duplex-and-transform-streams) потоком), если только fd `2` не ссылается на файл, в этом случае это [Writable](stream.md#writable-streams) поток.

`process.stderr` отличается от других потоков Node.js важным образом. Дополнительную информацию смотрите в [заметке о процессах ввода/вывода](#a-note-on-process-io).

<!-- 0085.part.md -->

### `process.stderr.fd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Это свойство относится к значению базового дескриптора файла `process.stderr`. Значение фиксировано на `2`. В потоках [`Worker`](worker_threads.md#class-worker) это поле не существует.

<!-- 0086.part.md -->

## `process.stdin`

-   [`<Stream>`](stream.md#stream)

Свойство `process.stdin` возвращает поток, подключенный к `stdin` (fd `0`). Это [`net.Socket`](net.md#class-netsocket) (который является [Duplex](stream.md#duplex-and-transform-streams) потоком), если только fd `0` не ссылается на файл, в этом случае это [Readable](stream.md#readable-streams) поток.

О том, как читать из `stdin`, смотрите [`readable.read()`](stream.md#readablereadsize).

Как поток [Duplex](stream.md#duplex-and-transform-streams), `process.stdin` может также использоваться в "старом" режиме, который совместим со скриптами, написанными для Node.js до версии 0.10. Для получения дополнительной информации смотрите [Совместимость потоков](stream.md#compatibility-with-older-nodejs-versions).

В режиме "старых" потоков поток `stdin` по умолчанию приостановлен, поэтому для чтения из него необходимо вызвать `process.stdin.resume()`. Заметим также, что вызов `process.stdin.resume()` сам по себе переключит поток в "старый" режим.

<!-- 0087.part.md -->

### `process.stdin.fd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Это свойство относится к значению базового дескриптора файла `process.stdin`. Значение фиксировано на `0`. В потоках [`Worker`](worker_threads.md#class-worker) это поле не существует.

<!-- 0088.part.md -->

## `process.stdout`

-   [`<Stream>`](stream.md#stream)

Свойство `process.stdout` возвращает поток, подключенный к `stdout` (fd `1`). Это [`net.Socket`](net.md#class-netsocket) (который является [Duplex](stream.md#duplex-and-transform-streams) потоком), если только fd `1` не ссылается на файл, в этом случае это [Writable](stream.md#writable-streams) поток.

Например, чтобы скопировать `process.stdin` в `process.stdout`:

```mjs
import { stdin, stdout } from 'node:process';

stdin.pipe(stdout);
```

```cjs
const { stdin, stdout } = require('node:process');

stdin.pipe(stdout);
```

`process.stdout` отличается от других потоков Node.js важным образом. Более подробную информацию смотрите в [заметке о процессах ввода/вывода](#a-note-on-process-io).

<!-- 0089.part.md -->

### `process.stdout.fd`

-   [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Это свойство относится к значению базового дескриптора файла `process.stdout`. Значение фиксировано и равно `1`. В потоках [`Worker`](worker_threads.md#class-worker) это поле не существует.

<!-- 0090.part.md -->

### Замечание о вводе-выводе процессов

`process.stdout` и `process.stderr` отличаются от других потоков Node.js важным образом:

1.  Они используются внутри [`console.log()`](console.md#consolelogdata-args) и [`console.error()`](console.md#consoleerrordata-args), соответственно.
2.  Запись может быть синхронной в зависимости от того, к чему подключен поток и является ли система Windows или POSIX:
    -   Файлы: _синхронные_ в Windows и POSIX.
    -   TTY (терминалы): _асинхронный_ в Windows, _синхронный_ в POSIX.
    -   Трубы (и сокеты): _синхронный_ в Windows, _асинхронный_ в POSIX

Такое поведение отчасти объясняется историческими причинами, поскольку его изменение привело бы к обратной несовместимости, но некоторые пользователи ожидают именно такого поведения.

Синхронная запись позволяет избежать таких проблем, как неожиданное чередование вывода, записываемого с помощью `console.log()` или `console.error()`, или его полное отсутствие, если `process.exit()` вызывается до завершения асинхронной записи. Дополнительную информацию смотрите в [`process.exit()`](#processexitcode).

**_Предупреждение_**: Синхронная запись блокирует цикл событий до тех пор, пока запись не завершится. Это может быть почти мгновенным в случае вывода в файл, но при высокой нагрузке на систему, при использовании труб, которые не читаются на принимающей стороне, или при медленных терминалах или файловых системах, цикл событий может блокироваться достаточно часто и достаточно долго, чтобы оказать серьезное негативное влияние на производительность. Это может не представлять проблемы при записи в интерактивный терминальный сеанс, но будьте особенно внимательны при ведении производственного журнала в выходные потоки процесса.

Чтобы проверить, подключен ли поток к контексту [TTY](tty.md#tty), проверьте свойство `isTTY`.

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

Дополнительную информацию см. в документации [TTY](tty.md#tty).

<!-- 0091.part.md -->

## `process.throwDeprecation`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Начальное значение `process.throwDeprecation` указывает, установлен ли флаг `--throw-deprecation` для текущего процесса Node.js. Значение `process.throwDeprecation` является изменяемым, поэтому то, приводят ли предупреждения о депривации к ошибкам, может быть изменено во время выполнения. Дополнительную информацию см. в документации к событию [`'warning'``](#event-warning) и методу [`emitWarning()``](#processemitwarningwarning-type-code-ctor).

```
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
Выброшено:
[DeprecationWarning: test] { name: 'DeprecationWarning' }
```

<!-- 0092.part.md -->

## `process.title`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.title` возвращает текущий заголовок процесса (т.е. возвращает текущее значение `ps`). Присвоение нового значения `process.title` изменяет текущее значение `ps`.

Когда присваивается новое значение, различные платформы накладывают различные ограничения на максимальную длину заголовка. Обычно такие ограничения довольно ограничены. Например, в Linux и macOS `process.title` ограничен размером двоичного имени плюс длина аргументов командной строки, поскольку установка `process.title` перезаписывает память `argv` процесса. Node.js v0.8 позволял создавать более длинные строки заголовков процессов, также перезаписывая память `environ`, но это было потенциально небезопасно и запутанно в некоторых (довольно неясных) случаях.

Присвоение значения `process.title` могло не привести к точной метке в приложениях менеджера процессов, таких как macOS Activity Monitor или Windows Services Manager.

<!-- 0093.part.md -->

## `process.traceDeprecation`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Свойство `process.traceDeprecation` указывает, установлен ли флаг `--trace-deprecation` для текущего процесса Node.js. Более подробную информацию о поведении этого флага смотрите в документации к событию [`'warning'`'](#event-warning) и методу [`emitWarning()`](#processemitwarningwarning-type-code-ctor).

<!-- 0094.part.md -->

## `process.umask()`

!!!danger "Стабильность: 0 – устарело или набрало много негативных отзывов"

    Эта фича является проблемной и ее планируют изменить. Не стоит полагаться на нее. Использование фичи может вызвать ошибки. Не стоит ожидать от нее обратной совместимости.

    Вызов `process.umask()` без аргумента приводит к тому, что umask всего процесса записывается дважды. Это создает условия гонки между потоками и является потенциальной уязвимостью безопасности. Не существует безопасного, кроссплатформенного альтернативного API.

`process.umask()` возвращает маску создания файлового режима процесса Node.js. Дочерние процессы наследуют маску от родительского процесса.

<!-- 0095.part.md -->

## `process.umask(mask)`

-   `mask` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

`process.umask(mask)` устанавливает маску создания файлового режима процесса Node.js. Дочерние процессы наследуют маску от родительского процесса. Возвращает предыдущую маску.

```mjs
import { umask } from 'node:process';

const newmask = 0o022;
const oldmask = umask(newmask);
console.log(
    `Changed umask from ${oldmask.toString(
        8
    )} to ${newmask.toString(8)}`
);
```

```cjs
const { umask } = require('node:process');

const newmask = 0o022;
const oldmask = umask(newmask);
console.log(
    `Changed umask from ${oldmask.toString(
        8
    )} to ${newmask.toString(8)}`
);
```

В потоках [`Worker`](worker_threads.md#class-worker), `process.umask(mask)` вызовет исключение.

<!-- 0096.part.md -->

## `process.uptime()`

-   Возвращает: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Метод `process.uptime()` возвращает количество секунд, в течение которых работает текущий процесс Node.js.

Возвращаемое значение включает доли секунды. Используйте `Math.floor()` для получения целых секунд.

<!-- 0097.part.md -->

## `process.version`

-   [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Свойство `process.version` содержит строку версии Node.js.

```mjs
import { version } from 'node:process';

console.log(`Version: ${version}`);
// Версия: v14.8.0
```

```cjs
const { version } = require('node:process');

console.log(`Version: ${version}`);
// Версия: v14.8.0
```

Чтобы получить строку версии без префикса _v_, используйте `process.versions.node`.

<!-- 0098.part.md -->

## `process.versions`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

Свойство `process.versions` возвращает объект, содержащий строки версий Node.js и его зависимостей. `process.versions.modules` указывает текущую версию ABI, которая увеличивается всякий раз, когда изменяется C++ API. Node.js откажется загружать модули, которые были скомпилированы с другой версией ABI модуля.

```mjs
import { versions } from 'node:process';

console.log(versions);
```

```cjs
const { versions } = require('node:process');

console.log(versions);
```

Будет сгенерирован объект, похожий на:

```console
{ node: '11.13.0',
  v8: '7.0.276.38-node.18',
  uv: '1.27.0',
  zlib: '1.2.11',
  brotli: '1.0.7',
  ares: '1.15.0',
  модули: '67',
  nghttp2: '1.34.0',
  napi: '4',
  llhttp: '1.1.1',
  openssl: '1.1.1b',
  cldr: '34.0',
  icu: '63.1',
  tz: '2018e',
  юникод: '11.0' }
```

<!-- 0099.part.md -->

## Коды выхода

Node.js обычно завершает работу с кодом состояния `0`, когда больше не ожидается никаких асинхронных операций. В других случаях используются следующие коды состояния:

-   `1` **Uncaught Fatal Exception**: Произошло не пойманное исключение, и оно не было обработано доменом или обработчиком события [`'uncaughtException'`](#event-uncaughtexception).
-   `2`: Не используется (зарезервировано Bash для встроенного неправильного использования)
-   `3` **Внутренняя ошибка разбора JavaScript**: Внутренний исходный код JavaScript в процессе загрузки Node.js вызвал ошибку разбора. Это случается крайне редко, и обычно может произойти только во время разработки самого Node.js.
-   `4` **Внутренняя ошибка оценки JavaScript**: Внутренний исходный код JavaScript в процессе загрузки Node.js не смог вернуть значение функции при оценке. Это случается крайне редко и, как правило, только во время разработки самого Node.js.
-   `5` **Фатальная ошибка**: В V8 произошла фатальная неустранимая ошибка. Обычно сообщение выводится на stderr с префиксом `FATAL ERROR`.
-   `6` **Неработающий внутренний обработчик исключений**: Имело место непойманное исключение, но внутренняя функция обработчика фатального исключения каким-то образом была установлена на не-функцию и не могла быть вызвана.
-   `7` **Сбой при запуске обработчика внутренних исключений**: Произошло не пойманное исключение, а внутренняя функция обработчика фатальных исключений сама выдала ошибку при попытке его обработать. Это может произойти, например, если обработчик [`'uncaughtException'`](#event-uncaughtexception) или `domain.on('error')` выбрасывает ошибку.
-   `8`: Не используется. В предыдущих версиях Node.js код выхода 8 иногда указывал на не пойманное исключение.
-   `9` **Неправильный аргумент**: Либо была указана неизвестная опция, либо опция, требующая значения, была предоставлена без значения.
-   `10` **Внутренний сбой выполнения JavaScript**: Внутренний исходный код JavaScript в процессе начальной загрузки Node.js выдал ошибку при вызове функции начальной загрузки. Это случается крайне редко и, как правило, только во время разработки самого Node.js.
-   `12` **Неправильный отладочный аргумент**: Были установлены опции `--inspect` и/или `--inspect-brk`, но выбранный номер порта был неверным или недоступным.
-   `13` **Незавершенное ожидание верхнего уровня**: `await` использовался вне функции в коде верхнего уровня, но переданное `Promise` так и не разрешилось.
-   `14` **Сбой моментального снимка**: Node.js был запущен для создания стартового снапшота V8, но не смог его создать, поскольку не были выполнены определенные требования к состоянию приложения.
-   `>128` **Сигнальные выходы**: Если Node.js получает фатальный сигнал, такой как `SIGKILL` или `SIGHUP`, то его код выхода будет равен `128` плюс значение кода сигнала. Это стандартная практика POSIX, поскольку коды выхода определены как 7-битные целые числа, а сигнальные выходы устанавливают старший бит, а затем содержат значение кода сигнала. Например, сигнал `SIGABRT` имеет значение `6`, поэтому ожидаемый код выхода будет `128` + `6`, или `134`.

<!-- 0100.part.md -->

