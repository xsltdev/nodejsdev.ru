---
title: Worker threads
description: Модуль worker_threads позволяет использовать потоки, параллельно выполняющие JavaScript
---

# Рабочие потоки

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/worker_threads.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:worker_threads` позволяет использовать потоки, параллельно выполняющие JavaScript. Чтобы получить к нему доступ:

```js
const worker = require('node:worker_threads');
```

Рабочие (потоки) полезны для выполнения операций JavaScript, требующих больших затрат процессора. Они не очень помогают при выполнении интенсивных операций ввода-вывода. Встроенные в Node.js асинхронные операции ввода-вывода более эффективны, чем могут быть Workers.

В отличие от `child_process` или `cluster`, `worker_threads` могут совместно использовать память. Они делают это путем передачи экземпляров `ArrayBuffer` или совместного использования экземпляров `SharedArrayBuffer`.

```js
const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
} = require('node:worker_threads');

if (isMainThread) {
    module.exports = function parseJSAsync(script) {
        return new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: script,
            });
            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0)
                    reject(
                        new Error(
                            `Worker stopped with exit code ${code}`
                        )
                    );
            });
        });
    };
} else {
    const { parse } = require('some-js-parsing-library');
    const script = workerData;
    parentPort.postMessage(parse(script));
}
```

Приведенный выше пример порождает поток Worker для каждого вызова `parseJSAsync()`. На практике для таких задач следует использовать пул Worker'ов. В противном случае накладные расходы на создание рабочих потоков, скорее всего, превысят их пользу.

При реализации пула Worker'ов используйте API [`AsyncResource`](async_hooks.md#class-asyncresource) для информирования диагностических инструментов (например, для предоставления асинхронных трассировок стека) о взаимосвязи между задачами и их результатами. Пример реализации см. в ["Использование `AsyncResource` для пула потоков `Worker`"](async_context.md#using-asyncresource-for-a-worker-thread-pool) в документации `async_hooks`.

Рабочие потоки по умолчанию наследуют неспецифические для процесса опции. Обратитесь к [`Опции конструктора рабочего потока`](#new-workerfilename-options), чтобы узнать, как настроить опции рабочего потока, в частности опции `argv` и `execArgv`.

<!-- 0000.part.md -->

## `worker.getEnvironmentData(key)`

-   `key` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое произвольное, клонируемое значение JavaScript, которое может быть использовано в качестве ключа {Map}.
-   Возвращает: [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Внутри рабочего потока `worker.getEnvironmentData()` возвращает клон данных, переданных в порождающий поток `worker.setEnvironmentData()`. Каждый новый `Worker` получает свою собственную копию данных окружения автоматически.

```js
const {
    Worker,
    isMainThread,
    setEnvironmentData,
    getEnvironmentData,
} = require('node:worker_threads');

if (isMainThread) {
    setEnvironmentData('Hello', 'World!');
    const worker = new Worker(__filename);
} else {
    console.log(getEnvironmentData('Hello')); // Печатает 'World!'.
}
```

<!-- 0001.part.md -->

## `worker.isMainThread`

-   [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Является `true`, если этот код не выполняется внутри потока [`Worker`](#class-worker).

```js
const {
    Worker,
    isMainThread,
} = require('node:worker_threads');

if (isMainThread) {
    // Это перезагружает текущий файл внутри экземпляра Worker.
    new Worker(__filename);
} else {
    console.log('Внутри Worker!');
    console.log(isMainThread); // Выводит 'false'.
}
```

<!-- 0002.part.md -->

## `worker.markAsUntransferable(object)`

Пометить объект как непередаваемый. Если `object` встречается в списке передачи вызова [`port.postMessage()`](#portpostmessagevalue-transferlist), он игнорируется.

В частности, это имеет смысл для объектов, которые можно клонировать, а не передавать, и которые используются другими объектами на передающей стороне. Например, Node.js помечает этим `ArrayBuffer`, который он использует для своего пула [`Buffer`](buffer.md#static-method-bufferallocunsafesize).

Эта операция не может быть отменена.

```js
const {
    MessageChannel,
    markAsUntransferable,
} = require('node:worker_threads');

const pooledBuffer = new ArrayBuffer(8);
const typedArray1 = new Uint8Array(pooledBuffer);
const typedArray2 = new Float64Array(pooledBuffer);

markAsUntransferable(pooledBuffer);

const { port1 } = new MessageChannel();
port1.postMessage(typedArray1, [typedArray1.buffer]);

// Следующая строка печатает содержимое typedArray1 - он все еще владеет
// своей памятью и был клонирован, а не передан. Без
// `markAsUntransferable()`, это вывело бы пустой Uint8Array.
// typedArray2 также не поврежден.
console.log(typedArray1);
console.log(typedArray2);
```

В браузерах эквивалента этому API нет.

<!-- 0003.part.md -->

## `worker.moveMessagePortToContext(port, contextifiedSandbox)`

-   `port` {MessagePort} Порт сообщения для передачи.

-   `contextifiedSandbox` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект [contextified](vm.md#what-does-it-mean-to-contextify-an-object), возвращенный методом `vm.createContext()`.

-   Возвращает: {MessagePort}

Переносит `порт сообщения` в другой [`vm`](vm.md) Context. Исходный объект `port` становится непригодным для использования, а его место занимает возвращаемый экземпляр `MessagePort`.

Возвращаемый `MessagePort` является объектом в целевом контексте и наследует от его глобального класса `Object`. Объекты, передаваемые слушателю [`port.onmessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/onmessage), также создаются в целевом контексте и наследуются от его глобального класса `Object`.

Однако созданный `MessagePort` больше не наследуется от [`EventTarget`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget), и только [`port.onmessage()`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort/onmessage) может быть использован для получения событий с его помощью.

<!-- 0004.part.md -->

## `worker.parentPort`

-   {null|MessagePort}

Если данный поток является [`Worker`](#class-worker), то это [`MessagePort`](#class-messageport), обеспечивающий связь с родительским потоком. Сообщения, отправленные с помощью `parentPort.postMessage()`, доступны в родительском потоке с помощью `worker.on('message')`, а сообщения, отправленные из родительского потока с помощью `worker.postMessage()`, доступны в этом потоке с помощью `parentPort.on('message')`.

```js
const {
    Worker,
    isMainThread,
    parentPort,
} = require('node:worker_threads');

if (isMainThread) {
    const worker = new Worker(__filename);
    worker.once('message', (message) => {
        console.log(message); // Печатает 'Hello, world!'.
    });
    worker.postMessage('Hello, world!');
} else {
    // Когда получено сообщение от родительского потока, отправьте его обратно:
    parentPort.once('message', (message) => {
        parentPort.postMessage(message);
    });
}
```

<!-- 0005.part.md -->

## `worker.receiveMessageOnPort(port)`

-   `port` {MessagePort|BroadcastChannel}

-   Возвращает: {Object|undefined}

Получение одного сообщения от заданного `MessagePort`. Если сообщение недоступно, возвращается `undefined`, иначе - объект с единственным свойством `message`, содержащим полезную нагрузку сообщения, соответствующую самому старому сообщению в очереди `MessagePort`.

```js
const {
    MessageChannel,
    receiveMessageOnPort,
} = require('node:worker_threads');
const { port1, port2 } = new MessageChannel();
port1.postMessage({ hello: 'world' });

console.log(receiveMessageOnPort(port2));
// Prints: { message: { hello: 'world' } }
console.log(receiveMessageOnPort(port2));
// Prints: undefined
```

Когда используется эта функция, событие `'message'` не испускается и слушатель `onmessage` не вызывается.

<!-- 0006.part.md -->

## `worker.resourceLimits`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Предоставляет набор ограничений на ресурсы JS-движка внутри этого потока Worker. Если параметр `resourceLimits` был передан конструктору [`Worker`](#class-worker), этот параметр соответствует его значениям.

Если этот параметр используется в главном потоке, его значением будет пустой объект.

<!-- 0007.part.md -->

## `worker.SHARE_ENV`

-   {символ}

Специальное значение, которое может быть передано в качестве опции `env` конструктора [`Worker`](#class-worker), чтобы указать, что текущий поток и поток Worker должны иметь общий доступ на чтение и запись к одному и тому же набору переменных окружения.

```js
const {
    Worker,
    SHARE_ENV,
} = require('node:worker_threads');
new Worker('process.env.SET_IN_WORKER = "foo"', {
    eval: true,
    env: SHARE_ENV,
}).on('exit', () => {
    console.log(process.env.SET_IN_WORKER); // Печатает 'foo'.
});
```

<!-- 0008.part.md -->

## `worker.setEnvironmentData(key[, value])`

-   `key` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое произвольное, клонируемое значение JavaScript, которое может быть использовано в качестве ключа {Map}.
-   `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое произвольное, клонируемое значение JavaScript, которое будет клонироваться и автоматически передаваться всем новым экземплярам `Worker`. Если `value` передано как `undefined`, любое ранее установленное значение для `key` будет удалено.

API `worker.setEnvironmentData()` устанавливает содержимое `worker.getEnvironmentData()` в текущем потоке и во всех новых экземплярах `Worker`, порожденных из текущего контекста.

<!-- 0009.part.md -->

## `worker.threadId`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор текущего потока. На соответствующем объекте worker (если он есть) он доступен как [`worker.threadId`](#workerthreadid_1). Это значение уникально для каждого экземпляра [`Worker`](#class-worker) внутри одного процесса.

<!-- 0010.part.md -->

## `worker.workerData`

Произвольное значение JavaScript, содержащее клон данных, переданных в конструктор `Worker` этого потока.

Данные клонируются как при использовании [`postMessage()`](#portpostmessagevalue-transferlist), в соответствии с алгоритмом [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

```js
const {
    Worker,
    isMainThread,
    workerData,
} = require('node:worker_threads');

if (isMainThread) {
    const worker = new Worker(__filename, {
        workerData: 'Hello, world!',
    });
} else {
    console.log(workerData); // Печатает 'Hello, world!'.
}
```

<!-- 0011.part.md -->

## Класс: `BroadcastChannel расширяет EventTarget`

Экземпляры `BroadcastChannel` позволяют асинхронную связь "один ко многим" со всеми другими экземплярами `BroadcastChannel`, привязанными к тому же имени канала.

```js
'use strict';

const {
    isMainThread,
    BroadcastChannel,
    Worker,
} = require('node:worker_threads');

const bc = new BroadcastChannel('hello');

if (isMainThread) {
    let c = 0;
    bc.onmessage = (event) => {
        console.log(event.data);
        if (++c === 10) bc.close();
    };
    for (let n = 0; n < 10; n++) new Worker(__filename);
} else {
    bc.postMessage('hello from every worker');
    bc.close();
}
```

<!-- 0012.part.md -->

### `new BroadcastChannel(name)`

-   `name` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Имя канала, к которому нужно подключиться. Допускается любое значение JavaScript, которое может быть преобразовано в строку с помощью `${name}`.

<!-- 0013.part.md -->

### `broadcastChannel.close()`

Закрывает соединение `BroadcastChannel`.

<!-- 0014.part.md -->

### `broadcastChannel.onmessage`

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается с одним аргументом `MessageEvent` при получении сообщения.

<!-- 0015.part.md -->

### `broadcastChannel.onmessageerror`

-   Тип: [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Вызывается при получении сообщения, которое не может быть десериализовано.

<!-- 0016.part.md -->

### `broadcastChannel.postMessage(message)`

-   `message` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое клонируемое значение JavaScript.

<!-- 0017.part.md -->

### `broadcastChannel.ref()`

Противоположность `unref()`. Вызов `ref()` на ранее `unref()` BroadcastChannel _не_ позволяет программе выйти, если это единственный оставшийся активный хэндл (поведение по умолчанию). Если порт был `ref()`, повторный вызов `ref()` не имеет никакого эффекта.

<!-- 0018.part.md -->

### `broadcastChannel.unref()`

Вызов `unref()` на BroadcastChannel позволяет потоку выйти, если это единственный активный хэндл в системе событий. Если BroadcastChannel уже был `unref()`, повторный вызов `unref()` не имеет никакого эффекта.

<!-- 0019.part.md -->

## Класс: `MessageChannel`

Экземпляры класса `worker.MessageChannel` представляют асинхронный, двусторонний канал связи. У `MessageChannel` нет собственных методов. `new MessageChannel()` выдает объект со свойствами `port1` и `port2`, которые ссылаются на связанные экземпляры [`MessagePort`](#class-messageport).

```js
const { MessageChannel } = require('node:worker_threads');

const { port1, port2 } = new MessageChannel();
port1.on('message', (message) =>
    console.log('received', message)
);
port2.postMessage({ foo: 'bar' });
// Выводит: получено { foo: 'bar' } от слушателя `port1.on('message')`.
```

<!-- 0020.part.md -->

## Класс: `MessagePort`

-   Расширяет: {EventTarget}

Экземпляры класса `worker.MessagePort` представляют собой один конец асинхронного двустороннего канала связи. Он может использоваться для передачи структурированных данных, областей памяти и других `MessagePort` между различными [`Worker`](#class-worker)s.

Эта реализация соответствует [browser `MessagePort`](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort)s.

<!-- 0021.part.md -->

### Событие: `close`

Событие `close` происходит, когда одна из сторон канала отключена.

```js
const { MessageChannel } = require('node:worker_threads');
const { port1, port2 } = new MessageChannel();

// Печатает:
// foobar
// закрыто!
port2.on('message', (message) => console.log(message));
port2.on('close', () => console.log('закрыто!'));

port1.postMessage('foobar');
port1.close();
```

<!-- 0022.part.md -->

### Событие: `message`

-   `значение` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Передаваемое значение

Событие `'message'` испускается для любого входящего сообщения, содержащего клонированный вход [`port.postMessage()`](#portpostmessagevalue-transferlist).

Слушатели этого события получают клон параметра `value`, переданного в `postMessage()`, и никаких дополнительных аргументов.

<!-- 0023.part.md -->

### Событие: `messageerror`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект ошибки

Событие `'messageerror'` возникает при неудачной десериализации сообщения.

В настоящее время это событие возникает, когда происходит ошибка при инстанцировании размещенного JS-объекта на принимающей стороне. Такие ситуации редки, но могут произойти, например, когда определенные объекты API Node.js получены в `vm.Context` (где API Node.js в настоящее время недоступны).

<!-- 0024.part.md -->

### `port.close()`

Отключает дальнейшую отправку сообщений с обеих сторон соединения. Этот метод может быть вызван, когда дальнейшее взаимодействие через этот `MessagePort` не будет происходить.

Событие [`close`](#event-close) испускается на обоих экземплярах `MessagePort`, которые являются частью канала.

<!-- 0025.part.md -->

### `port.postMessage(value[, transferList])`

-   `значение` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `transferList` {Object\[\]}

Отправляет значение JavaScript на принимающую сторону этого канала. Передача `value` осуществляется способом, совместимым с [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm).

В частности, существенными отличиями от `JSON` являются:

-   `значение` может содержать круговые ссылки.
-   `значение` может содержать экземпляры встроенных типов JS, таких как `RegExp`, `BigInt`, `Map`, `Set` и т.д.
-   `значение` может содержать типизированные массивы, как с использованием `ArrayBuffer`, так и `SharedArrayBuffer`.
-   `значение` может содержать экземпляры [`WebAssembly.Module`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module).
-   `value` не может содержать нативные (поддерживаемые C++) объекты, кроме:
    -   {CryptoKey}s,
    -   [`<FileHandle>`](fs.md#filehandle)s,
    -   {Histogram}s,
    -   {KeyObject}s,
    -   {MessagePort}s,
    -   {net.BlockList}s,
    -   {net.SocketAddress}es,
    -   {X509Certificate}s.

<!-- конец списка -->

```js
const { MessageChannel } = require('node:worker_threads');
const { port1, port2 } = new MessageChannel();

port1.on('message', (message) => console.log(message));

const circularData = {};
circularData.foo = circularData;
// Печатает: { foo: [Circular] }
port2.postMessage(circularData);
```

`transferList` может быть списком объектов [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), [`MessagePort`](#class-messageport) и [`FileHandle`](fs.md#class-filehandle). После передачи они больше не могут использоваться на передающей стороне канала (даже если они не содержатся в `value`). В отличие от [дочерних процессов](child_process.md), передача хэндлов, таких как сетевые сокеты, в настоящее время не поддерживается.

Если `value` содержит экземпляры [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer), то они доступны из любого потока. Они не могут быть перечислены в `transferList`.

`value` может по-прежнему содержать экземпляры `ArrayBuffer`, не включенные в `transferList`; в этом случае базовая память копируется, а не перемещается.

```js
const { MessageChannel } = require('node:worker_threads');
const { port1, port2 } = new MessageChannel();

port1.on('message', (message) => console.log(message));

const uint8Array = new Uint8Array([1, 2, 3, 4]);
// This posts a copy of `uint8Array`:
port2.postMessage(uint8Array);
// This does not copy data, but renders `uint8Array` unusable:
port2.postMessage(uint8Array, [uint8Array.buffer]);

// The memory for the `sharedUint8Array` is accessible from both the
// original and the copy received by `.on('message')`:
const sharedUint8Array = new Uint8Array(
    new SharedArrayBuffer(4)
);
port2.postMessage(sharedUint8Array);

// This transfers a freshly created message port to the receiver.
// This can be used, for example, to create communication channels between
// multiple `Worker` threads that are children of the same parent thread.
const otherChannel = new MessageChannel();
port2.postMessage({ port: otherChannel.port1 }, [
    otherChannel.port1,
]);
```

Объект сообщения клонируется немедленно, и может быть изменен после размещения без побочных эффектов.

Для получения дополнительной информации о механизмах сериализации и десериализации, лежащих в основе этого API, смотрите [serialization API модуля `node:v8`](v8.md#serialization-api).

#### Соображения при передаче типизированных массивов и буферов

Все экземпляры `TypedArray` и `Buffer` являются представлениями над базовым `ArrayBuffer`. То есть, именно `ArrayBuffer` фактически хранит исходные данные, а объекты `TypedArray` и `Buffer` предоставляют способ просмотра и манипулирования данными. Для одного и того же экземпляра `ArrayBuffer` может быть создано несколько представлений. При использовании списка передачи для передачи `ArrayBuffer` следует быть очень осторожным, так как это приводит к тому, что все экземпляры `TypedArray` и `Buffer`, которые совместно используют тот же `ArrayBuffer`, становятся непригодными для использования.

```js
const ab = new ArrayBuffer(10);

const u1 = new Uint8Array(ab);
const u2 = new Uint16Array(ab);

console.log(u2.length); // печатает 5

port.postMessage(u1, [u1.buffer]);

console.log(u2.length); // печатает 0
```

Для экземпляров `Buffer`, в частности, можно ли передавать или клонировать лежащий в основе `ArrayBuffer`, полностью зависит от того, как были созданы экземпляры, что часто не может быть надежно определено.

Буфер `ArrayBuffer` может быть помечен [`markAsUntransferable()`](#workermarkasuntransferableobject), чтобы указать, что его всегда следует клонировать и никогда не передавать.

В зависимости от того, как был создан экземпляр `Buffer`, он может владеть или не владеть своим базовым `ArrayBuffer`. Буфер `ArrayBuffer` не должен передаваться, если не известно, что экземпляр `Buffer` владеет им. В частности, для `Buffer`, созданных из внутреннего пула `Buffer` (используя, например, `Buffer.from()` или `Buffer.allocUnsafe()`), передача их невозможна, и они всегда клонируются, что отправляет копию всего пула `Buffer`. Такое поведение может привести к непреднамеренному увеличению использования памяти и возможным проблемам безопасности.

Более подробную информацию о пуле `Buffer` смотрите в [`Buffer.allocUnsafe()`](buffer.md#static-method-bufferallocunsafesize).

Массив `ArrayBuffer` для экземпляров `Buffer`, созданных с помощью `Buffer.alloc()` или `Buffer.allocUnsafeSlow()`, всегда можно передать, но это делает непригодными все другие существующие представления этих `ArrayBuffer`.

<!-- 0027.part.md -->

#### Соображения при клонировании объектов с прототипами, классами и аксессорами

Поскольку при клонировании объектов используется алгоритм [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), неперечислимые свойства, аксессоры свойств и прототипы объектов не сохраняются. В частности, объекты [`Buffer`](buffer.md) будут прочитаны как обычные [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)s на принимающей стороне, а экземпляры классов JavaScript будут клонированы как обычные объекты JavaScript.

```js
const b = Symbol('b');

class Foo {
    #a = 1;
    constructor() {
        this[b] = 2;
        this.c = 3;
    }

    get d() {
        return 4;
    }
}

const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => console.log(data);

port2.postMessage(new Foo());

// Prints: { c: 3 }
```

Это ограничение распространяется на многие встроенные объекты, такие как глобальный объект `URL`:

```js
const { port1, port2 } = new MessageChannel();

port1.onmessage = ({ data }) => console.log(data);

port2.postMessage(new URL('https://example.org'));

// Prints: { }
```

<!-- 0028.part.md -->

### `port.hasRef()`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

-   Возвращает: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Если true, то объект `MessagePort` будет поддерживать активным цикл событий Node.js.

<!-- 0029.part.md -->

### `port.ref()`

Противоположность `unref()`. Вызов `ref()` на порту, который ранее был `unref()`, _не_ позволяет программе завершить работу, если это единственный оставшийся активный хэндл (поведение по умолчанию). Если порт был `ref()`ed, повторный вызов `ref()` не имеет никакого эффекта.

Если слушатели подключаются или удаляются с помощью `.on('message')`, порт автоматически `ref()`отключается и `unref()`отключается в зависимости от того, существуют ли слушатели для данного события.

<!-- 0030.part.md -->

### `port.start()`

Начинает принимать сообщения на этом `MessagePort`. При использовании этого порта в качестве эмиттера событий, этот метод вызывается автоматически, как только подключаются слушатели `сообщений`.

Этот метод существует для паритета с API Web `MessagePort`. В Node.js он полезен только для игнорирования сообщений при отсутствии слушателей событий. Node.js также расходится в своей обработке `.onmessage`. Установка этого параметра автоматически вызывает `.start()`, но снятие этого параметра позволяет сообщениям стоять в очереди до тех пор, пока не будет установлен новый обработчик или порт не будет отброшен.

<!-- 0031.part.md -->

### `port.unref()`

Вызов `unref()` на порту позволяет потоку выйти, если это единственный активный хэндл в системе событий. Если порт уже был `unref()`идентифицирован, повторный вызов `unref()` не имеет эффекта.

Если слушатели подключаются или удаляются с помощью `.on('message')`, порт автоматически `ref()`отключается и `unref()`отключается в зависимости от того, существуют ли слушатели для данного события.

<!-- 0032.part.md -->

## Класс: `Worker`

-   Расширяет: [`<EventEmitter>`](events.md#eventemitter)

Класс `Worker` представляет собой независимый поток выполнения JavaScript. Большинство API Node.js доступны внутри него.

Заметными отличиями внутри среды Worker являются:

-   Потоки [`process.stdin`](process.md#processstdin), [`process.stdout`](process.md#processstdout) и [`process.stderr`](process.md#processstderr) могут быть перенаправлены родительским потоком.
-   Свойство [`require('node:worker_threads').isMainThread`](#workerismainthread) установлено в `false`.
-   Порт сообщения [`require('node:worker_threads').parentPort`](#workerparentport) доступен.
-   [`process.exit()`](process.md#processexitcode) не останавливает всю программу, только отдельный поток, а [`process.abort()`](process.md#processabort) недоступен.
-   [`process.chdir()`](process.md#processchdirdirectory) и методы `process`, задающие идентификаторы групп или пользователей, недоступны.
-   [`process.env`](process.md#processenv) - это копия переменных окружения родительского потока, если не указано иное. Изменения в одной копии не видны в других потоках и не видны встроенным дополнениям (если только [`worker.SHARE_ENV`](#workershare_env) не передан в качестве опции `env` конструктору [`Worker`](#class-worker)).
-   [`process.title`](process.md#processtitle) не может быть изменен.
-   Сигналы не передаются через [`process.on('...')`](process.md#signal-events).
-   Выполнение может остановиться в любой момент в результате вызова [`worker.terminate()`](#workerterminate).
-   IPC-каналы от родительских процессов недоступны.
-   Модуль [`trace_events`](tracing.md) не поддерживается.
-   Нативные дополнения могут быть загружены из нескольких потоков только при выполнении [определенных условий](addons.md#worker-support).

Создание экземпляров `Worker` внутри других `Worker` возможно.

Подобно [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) и модулю [`node:cluster`](cluster.md), двусторонняя связь может быть достигнута посредством межпоточной передачи сообщений. Внутри `Worker` имеет встроенную пару [`MessagePort`](#class-messageport), которые уже связаны друг с другом при создании `Worker`. Хотя объект `MessagePort` на родительской стороне напрямую не раскрывается, его функциональность раскрывается через [`worker.postMessage()`](#workerpostmessagevalue-transferlist) и событие [`worker.on('message')`](#event-message_1) на объекте `Worker` для родительского потока.

Для создания пользовательских каналов обмена сообщениями (что рекомендуется вместо использования глобального канала по умолчанию, поскольку это облегчает разделение проблем) пользователи могут создать объект `MessageChannel` в любом потоке и передать один из `MessagePort` этого `MessageChannel` в другой поток через заранее существующий канал, например, глобальный.

Смотрите [`port.postMessage()`](#portpostmessagevalue-transferlist) для получения дополнительной информации о том, как передаются сообщения и какие значения JavaScript могут быть успешно переданы через барьер потоков.

```js
const assert = require('node:assert');
const {
    Worker,
    MessageChannel,
    MessagePort,
    isMainThread,
    parentPort,
} = require('node:worker_threads');
if (isMainThread) {
    const worker = new Worker(__filename);
    const subChannel = new MessageChannel();
    worker.postMessage(
        { hereIsYourPort: subChannel.port1 },
        [subChannel.port1]
    );
    subChannel.port2.on('message', (value) => {
        console.log('received:', value);
    });
} else {
    parentPort.once('message', (value) => {
        assert(value.hereIsYourPort instanceof MessagePort);
        value.hereIsYourPort.postMessage(
            'рабочий отправляет это'
        );
        value.hereIsYourPort.close();
    });
}
```

<!-- 0033.part.md -->

### `new Worker(filename[, options])`

-   `filename` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Путь к основному скрипту или модулю Рабочего. Должен быть либо абсолютным путем, либо относительным путем (т.е. относительно текущего рабочего каталога), начинающимся с `./` или `../`, либо объектом WHATWG `URL`, использующим протокол `file:` или `data:`. При использовании [`data:` URL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) данные интерпретируются на основе MIME-типа с помощью [ECMAScript module loader](esm.md#data-imports). Если `options.eval` имеет значение `true`, то это строка, содержащая код JavaScript, а не путь.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `argv` {любой\[\]} Список аргументов, которые будут строфицированы и добавлены в `process.argv` в рабочем. Это в основном похоже на `workerData`, но значения доступны в глобальном `process.argv`, как если бы они были переданы как опции CLI скрипту.
    -   `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Если установлено, определяет начальное значение `process.env` внутри потока Worker. В качестве специального значения можно использовать [`worker.SHARE_ENV`](#workershare_env), чтобы указать, что родительский и дочерний потоки должны совместно использовать свои переменные окружения; в этом случае изменения объекта `process.env` одного потока влияют и на другой поток. **По умолчанию:** `process.env`.
    -   `eval` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true` и первый аргумент является `строкой`, интерпретируйте первый аргумент конструктора как сценарий, который будет выполнен, как только рабочий будет запущен.
    -   `execArgv` [`<string[]>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Список опций CLI узла, передаваемых рабочему. Опции V8 (такие как `--max-old-space-size`) и опции, влияющие на процесс (такие как `--title`), не поддерживаются. Если опция задана, она передается как [`process.execArgv`](process.md#processexecargv) внутри рабочего. По умолчанию опции наследуются от родительского потока.
    -   `stdin` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если параметр имеет значение `true`, то `worker.stdin` предоставляет записываемый поток, содержимое которого отображается как `process.stdin` внутри рабочего. По умолчанию данные не предоставляются.
    -   `stdout` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `true`, то `worker.stdout` не будет автоматически передаваться в `process.stdout` родителя.
    -   `stderr` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `true`, то `worker.stderr` не будет автоматически передаваться в `process.stderr` родителя.
    -   `workerData` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Любое значение JavaScript, которое клонируется и становится доступным как [`require('node:worker_threads').workerData`](#workerworkerdata). Клонирование происходит, как описано в [HTML structured clone algorithm](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm), и если объект не может быть клонирован (например, потому что он содержит `функции`), возникает ошибка.
    -   `trackUnmanagedFds` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если установлено значение `true`, то Worker отслеживает необработанные файловые дескрипторы, управляемые через [`fs.open()`](fs.md#fsopenpath-flags-mode-callback) и [`fs.close()`](fs.md#fsclosefd-callback), и закрывает их при выходе Worker, аналогично другим ресурсам, таким как

<!-- 0034.part.md -->

### Событие: `error`

-   `err` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Событие `'error'` происходит, если рабочий поток бросает не пойманное исключение. В этом случае рабочий поток завершается.

<!-- 0035.part.md -->

### Событие: `exit`

-   `exitCode` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Событие `'exit'` испускается, когда рабочий остановился. Если рабочий завершился вызовом [`process.exit()`](process.md#processexitcode), то параметром `exitCode` будет переданный код завершения. Если рабочий был завершен, параметр `exitCode` равен `1`.

Это последнее событие, выдаваемое любым экземпляром `Worker`.

<!-- 0036.part.md -->

### Событие: `message`

-   `значение` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Переданное значение

Событие `'message'` происходит, когда рабочий поток вызвал [`require('node:worker_threads').parentPort.postMessage()`](#workerpostmessagevalue-transferlist). Подробнее см. событие [`port.on('message')`](#event-message).

Все сообщения, отправленные из рабочего потока, выдаются до того, как на объекте `Worker` произойдет событие [`'exit'`](#event-exit).

<!-- 0037.part.md -->

### Событие: `messageerror`

-   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект ошибки

Событие `'messageerror'` возникает, когда десериализация сообщения не удалась.

<!-- 0038.part.md -->

### Событие: `'online'`

Событие `'online'` генерируется, когда рабочий поток начинает выполнять код JavaScript.

<!-- 0039.part.md -->

### `worker.getHeapSnapshot([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `exposeInternals` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если true, раскрывать внутренние компоненты в снимке кучи. **По умолчанию:** `false`.
    -   `exposeNumericValues` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если true, раскрывать числовые значения в искусственных полях. **По умолчанию:** `false`.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Обещание для читаемого потока, содержащего снимок кучи V8.

Возвращает читаемый поток для V8-снимка текущего состояния Worker. Подробнее см. в [`v8.getHeapSnapshot()`](v8.md#v8getheapsnapshotoptions).

Если поток Worker больше не запущен, что может произойти до наступления события [`'exit'``](#event-exit), возвращенный `Promise` немедленно отклоняется с ошибкой [`ERR_WORKER_NOT_RUNNING`](errors.md#err_worker_not_running).

<!-- 0040.part.md -->

### `worker.performance`

Объект, который можно использовать для запроса информации о производительности рабочего экземпляра. Аналогичен [`perf_hooks.performance`](perf_hooks.md#perf_hooksperformance).

<!-- 0041.part.md -->

#### `performance.eventLoopUtilization([utilization1[, utilization2]])`.

-   `utilization1` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова `eventLoopUtilization()`.
-   `utilization2` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Результат предыдущего вызова `eventLoopUtilization()` перед `utilization1`.
-   Возвращает [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `idle` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `active` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `использование` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Тот же вызов, что и [`perf_hooks` `eventLoopUtilization()`](perf_hooks.md#performanceeventlooputilizationutilization1-utilization2), за исключением того, что возвращаются значения рабочего экземпляра.

Одно из отличий заключается в том, что, в отличие от основного потока, загрузка рабочего выполняется в цикле событий. Поэтому использование цикла событий становится доступным сразу после того, как сценарий рабочего начинает выполняться.

Время `idle`, которое не увеличивается, не указывает на то, что рабочий застрял в bootstrap. В следующих примерах показано, как за все время работы рабочего никогда не накапливается время `idle`, но он все еще способен обрабатывать сообщения.

```js
const {
    Worker,
    isMainThread,
    parentPort,
} = require('node:worker_threads');

if (isMainThread) {
    const worker = new Worker(__filename);
    setInterval(() => {
        worker.postMessage('hi');
        console.log(
            worker.performance.eventLoopUtilization()
        );
    }, 100).unref();
    return;
}

parentPort.on('message', () => console.log('msg')).unref();
(function r(n) {
    if (--n < 0) return;
    const t = Date.now();
    while (Date.now() - t < 300);
    setImmediate(r, n);
})(10);
```

Использование цикла событий для рабочего доступно только после испускания [`'online'` события](#event-online), а если оно вызвано до этого или после [`'exit'` события](#event-exit), то все свойства имеют значение `0`.

<!-- 0042.part.md -->

### `worker.postMessage(value[, transferList])`

-   `значение` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `transferList` {Object\[\]}

Отправка сообщения на рабочий, полученного через [`require('node:worker_threads').parentPort.on('message')`](#event-message). Подробнее см. в [`port.postMessage()`](#portpostmessagevalue-transferlist).

<!-- 0043.part.md -->

### `worker.ref()`

В противоположность `unref()`, вызов `ref()` на ранее `unref()`ed worker _не_ позволяет программе выйти, если это единственный оставшийся активный хэндл (поведение по умолчанию). Если рабочий был `ref()`ed, повторный вызов `ref()` не имеет никакого эффекта.

<!-- 0044.part.md -->

### `worker.resourceLimits`

-   [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `maxYoungGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `maxOldGenerationSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `codeRangeSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)
    -   `stackSizeMb` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Предоставляет набор ограничений ресурсов JS-движка для этого потока Worker. Если параметр `resourceLimits` был передан конструктору [`Worker`](#class-worker), то он соответствует его значениям.

Если рабочий остановлен, возвращаемое значение - пустой объект.

<!-- 0045.part.md -->

### `worker.stderr`

-   [`<stream.Readable>`](stream.md#streamreadable)

Это читаемый поток, который содержит данные, записанные в [`process.stderr`](process.md#processstderr) внутри рабочего потока. Если `stderr: true` не было передано в конструктор [`Worker`](#class-worker), то данные передаются в поток [`process.stderr`](process.md#processstderr) родительского потока.

<!-- 0046.part.md -->

### `worker.stdin`

-   {null|stream.Writable}

Если конструктору [`Worker`](#class-worker) было передано значение `stdin: true`, то это поток с возможностью записи. Данные, записанные в этот поток, будут доступны в рабочем потоке как [`process.stdin`](process.md#processstdin).

<!-- 0047.part.md -->

### `worker.stdout`

-   [`<stream.Readable>`](stream.md#streamreadable)

Это читаемый поток, который содержит данные, записанные в [`process.stdout`](process.md#processstdout) внутри рабочего потока. Если в конструктор [`Worker`](#class-worker) не было передано `stdout: true`, то данные передаются в поток [`process.stdout`](process.md#processstdout) родительского потока.

<!-- 0048.part.md -->

### `worker.terminate()`

-   Возвращает: { Обещание}

Остановить выполнение JavaScript в рабочем потоке как можно скорее. Возвращает обещание для кода выхода, который выполняется, когда происходит событие [`'exit'`'](#event-exit).

<!-- 0049.part.md -->

### `worker.threadId`

-   [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Целочисленный идентификатор для ссылающегося потока. Внутри рабочего потока он доступен как [`require('node:worker_threads').threadId`](#workerthreadid). Это значение уникально для каждого экземпляра `Worker` внутри одного процесса.

<!-- 0050.part.md -->

### `worker.unref()`

Вызов `unref()` на рабочем позволяет потоку выйти, если это единственный активный хэндл в системе событий. Если рабочий уже был `unref()`ed, повторный вызов `unref()` не имеет никакого эффекта.

<!-- 0051.part.md -->

## Примечания

<!-- 0052.part.md -->

### Синхронная блокировка stdio

`Worker` использует передачу сообщений через {MessagePort} для реализации взаимодействия с `stdio`. Это означает, что вывод `stdio`, исходящий от `Worker`, может быть заблокирован синхронным кодом на принимающей стороне, который блокирует цикл событий Node.js.

```mjs
import { Worker, isMainThread } from 'worker_threads';

if (isMainThread) {
    new Worker(new URL(import.meta.url));
    for (let n = 0; n < 1e10; n++) {
        // Looping to simulate work.
    }
} else {
    // This output will be blocked by the for loop in the main thread.
    console.log('foo');
}
```

```cjs
'use strict';

const {
    Worker,
    isMainThread,
} = require('node:worker_threads');

if (isMainThread) {
    new Worker(__filename);
    for (let n = 0; n < 1e10; n++) {
        // Looping to simulate work.
    }
} else {
    // This output will be blocked by the for loop in the main thread.
    console.log('foo');
}
```

<!-- 0053.part.md -->

### Запуск рабочих потоков из скриптов предварительной загрузки

Будьте осторожны при запуске рабочих потоков из скриптов предварительной загрузки (скрипты, загруженные и запущенные с помощью флага командной строки `-r`). Если опция `execArgv` не установлена явно, новые рабочие потоки автоматически наследуют флаги командной строки от запущенного процесса и будут загружать те же сценарии предварительной загрузки, что и основной поток. Если сценарий предварительной загрузки безоговорочно запускает рабочий поток, каждый порожденный поток будет порождать другой, пока приложение не завершится.

<!-- 0054.part.md -->
