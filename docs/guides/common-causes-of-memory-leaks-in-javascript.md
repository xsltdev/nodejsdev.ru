---
description: Выявление и устранение распространенных утечек памяти JavaScript (Node.js и Deno.js)
---

# Распространенные причины утечек памяти в JavaScript

<big>Выявление и устранение распространенных утечек памяти JavaScript (Node.js и Deno.js)</big>

**Утечки памяти** - это тихая угроза, которая постепенно снижает производительность, приводит к сбоям и увеличивает эксплуатационные расходы. В отличие от очевидных ошибок, утечки памяти часто незаметны, и их трудно заметить, пока они не начнут вызывать серьезные проблемы.

Повышенное потребление памяти приводит к увеличению затрат на сервер и негативно сказывается на удобстве работы пользователей. Понимание того, как возникают утечки памяти, - первый шаг к их устранению.

## Понимание утечек памяти

Утечка памяти происходит, когда ваше приложение выделяет память, а затем не освобождает ее после того, как она больше не нужна. Со временем эти неосвобожденные блоки памяти накапливаются, что приводит к постепенному увеличению потребления памяти.

Это особенно проблематично для длительно работающих процессов, таких как веб-серверы, где утечка может привести к тому, что приложение будет потреблять все больше и больше памяти, пока в конце концов не произойдет сбой или оно не замедлится до ползучего состояния.

## Понимание использования памяти в Node.js (V8)

Node.js (V8) работает с несколькими различными типами памяти. Каждый из них играет важную роль в работе и использовании ресурсов вашего приложения.

| Тип памяти | Описание |
| --- | --- |
| RSS (Resident Set Size) | Общее количество памяти, выделенное для процесса Node.js, включая все части памяти: код, стек и кучу. |
| Heap Total | Память, выделенная для объектов JavaScript. Это общий размер выделенной кучи. |
| Heap Used | Память, фактически используемая объектами JavaScript. Это показывает, какая часть кучи используется в данный момент. |
| External | Память, используемая объектами C++, которые связаны с объектами JavaScript. Эта память управляется вне кучи V8. |
| Array Buffers | Память, выделенная для объектов [`ArrayBuffer`](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), которые используются для хранения необработанных двоичных данных. |

### RSS (Resident Set Size): Общее количество памяти, выделенное для процесса

**RSS** относится к общему объему памяти процесса Node.js. Он включает всю память, выделенную для процесса, в том числе кучу, стек и сегменты кода.

```js title="rss.js"
console.log('Initial Memory Usage:', process.memoryUsage());

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`RSS: ${memoryUsage.rss}`);
}, 1000);
```

Этот скрипт регистрирует использование памяти RSS каждую секунду. Мы можем наблюдать, как общий объем памяти меняется с течением времени.

```sh
$> node rss.js
Initial Memory Usage: {
  rss: 38502400,
  heapTotal: 4702208,
  heapUsed: 2559000,
  external: 1089863,
  arrayBuffers: 10515
}
RSS: 41025536
RSS: 41041920
RSS: 41041920
RSS: 41041920
```

### Heap Total: объем памяти, выделенный для объектов JavaScript.

**Heap Total** представляет собой общий объем памяти, выделенный для объектов JavaScript движком V8 (движок JavaScript, используемый в Node.js).

```js title="heap.js"
console.log('Initial Memory Usage:', process.memoryUsage());

const largeArray = new Array(1e6).fill('A');

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Heap Total: ${memoryUsage.heapTotal}`);
}, 1000);
```

Выделение большого массива увеличивает общую кучу. Зарегистрированная общая куча показывает память, выделенную для объектов JavaScript.

```sh
$> node heap.js
Initial Memory Usage: {
  rss: 38535168,
  heapTotal: 4702208,
  heapUsed: 2559224,
  external: 1089863,
  arrayBuffers: 10515
}
Heap Total: 12976128
Heap Total: 12976128
Heap Total: 12976128
Heap Total: 12976128
Heap Total: 12976128
Heap Total: 12976128
Heap Total: 12976128
```

### Heap Used: Объем памяти, фактически используемый объектами.

**Heap Used** - это объем памяти, который в данный момент используется объектами JavaScript в куче.

Когда мы помещаем объекты в массив, мы увеличиваем объем памяти, используемой кучей.

```js title="heap-used.js"
console.log('Initial Memory Usage:', process.memoryUsage());

let data = [];
for (let i = 0; i < 1e6; i++) {
    data.push({ index: i });
}

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Heap Used: ${memoryUsage.heapUsed}`);
}, 1000);
```

Значение используемой кучи будет расти по мере добавления новых объектов.

```sh
$> node heap-used.js
Initial Memory Usage: {
  rss: 38748160,
  heapTotal: 4702208,
  heapUsed: 2559424,
  external: 1089863,
  arrayBuffers: 10515
}
Heap Used: 2833808
Heap Used: 2847776
Heap Used: 2850800
Heap Used: 2854352
Heap Used: 2875800
Heap Used: 2879488
```

### External: Память, используемая объектами C++, связанными с JavaScript.

**Внешняя память** - это память, используемая объектами C++, связанными с JavaScript. Эти объекты создаются с помощью привязок, которые позволяют JavaScript взаимодействовать с нативным кодом, выделяя память за пределами типичной кучи JavaScript.

Эта память не видна непосредственно в JavaScript, но все равно увеличивает общее количество памяти, используемой приложением.

Метод `Buffer.alloc` выделяет буфер размером 50 МБ, который отслеживается как внешняя память.

```js title="external.js"
const buffer = Buffer.alloc(50 * 1024 * 1024); // Allocate 50MB of buffer

console.log('Initial Memory Usage:', process.memoryUsage());

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`External Memory: ${memoryUsage.external}`);
}, 1000);
```

В этом примере регистрируется использование внешней памяти, которая будет отражать распределение буфера.

```sh
$> node external.js
Initial Memory Usage: {
  rss: 39223296,
  heapTotal: 4702208,
  heapUsed: 2560832,
  external: 53518663,
  arrayBuffers: 52439315
}
External Memory: 53814435
External Memory: 53814435
External Memory: 53814435
External Memory: 53814435
External Memory: 53814435
External Memory: 53814435
External Memory: 53814435
```

### Array Buffers: Память, выделенная для объектов `ArrayBuffer`

Буферы массивов - это память, используемая для объектов `ArrayBuffer`. Эти объекты хранят двоичные данные фиксированной длины в JavaScript.

`ArrayBuffer` является частью системы типизированных массивов JavaScript, позволяя вам работать с двоичными данными напрямую.

Память для этих буферов отслеживается отдельно от обычных объектов JavaScript. Они часто используются для работы с необработанными данными, такими как файлы или сетевые протоколы.

Вот пример, в котором я выделяю `ArrayBuffer` размером 50 МБ, а затем проверяю начальное использование памяти моим процессом Node.js.

```js title="array-buffer.js"
const buffer = new ArrayBuffer(50 * 1024 * 1024); // 50MB ArrayBuffer

console.log('Initial Memory Usage:', process.memoryUsage());

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(
        `Array Buffers: ${memoryUsage.arrayBuffers}`
    );
}, 1000);
```

---

```sh
$> node array-buffer.js
Initial Memory Usage: {
  rss: 39075840,
  heapTotal: 4702208,
  heapUsed: 2559496,
  external: 53518663,
  arrayBuffers: 52439315
}
Array Buffers: 52439315
Array Buffers: 52439315
Array Buffers: 52439315
Array Buffers: 52439315
Array Buffers: 52439315
Array Buffers: 52439315
```

## Распространенные причины утечек памяти

### Неправильно управляемые переменные

Неправильное управление переменными может привести к утечке памяти.

Например, если вы объявите переменные, которые должны быть временными, но забудете их очистить, они будут продолжать потреблять память.

```js
let cache = {};

function storeData(key, value) {
    cache[key] = value;
}

// Simulating the function being called multiple times
storeData('item1', new Array(1000000).fill('A'));
storeData('item2', new Array(1000000).fill('B'));

// Memory leak: data stored in 'cache' is never released
```

В приведенном выше примере данные добавляются в глобальный объект под названием `cache`. Если эти данные не удалять, когда они больше не нужны, они будут продолжать неоправданно использовать память.

Это особенно проблематично, если эти переменные хранятся в глобальной области видимости, что позволяет сохранять их в течение всего жизненного цикла приложения.

```js
let globalUserSessions = {}; // Global scope

function addUserSession(sessionId, userData) {
    // Store user data in global scope
    globalUserSessions[sessionId] = userData;
}

function removeUserSession(sessionId) {
    // Manually remove user session
    delete globalUserSessions[sessionId];
}

// Simulate adding user sessions
addUserSession('session1', {
    name: 'Alice',
    data: new Array(1000000).fill('A'),
});
addUserSession('session2', {
    name: 'Bob',
    data: new Array(1000000).fill('B'),
});

// The globalUserSessions object will persist
// for the entire app lifecycle unless manually cleaned up
```

`globalUserSessions` - это глобальный объект, используемый для хранения данных пользовательских сессий. Поскольку он находится в глобальной области видимости, он сохраняется в течение всего времени выполнения приложения.

Если сессии не удалены должным образом с помощью `removeUserSession`, данные останутся в памяти на неопределенный срок, что приведет к утечке памяти.

### Постоянные глобальные объекты

Глобальные объекты могут занимать память дольше, чем это необходимо. Данные в них могут оставаться в памяти после того, как они больше не нужны. Это постепенно увеличивает использование памяти.

```js
global.config = {
    settings: new Array(1000000).fill('Configuration'),
};
// Memory leak: 'config' is global and remains
// in memory for the entire application lifecycle
```

Поскольку `config` имеет глобальный доступ и никогда не очищается, используемая им память сохраняется в течение всего времени работы приложения. Вот один из способов избежать утечки памяти:

```js
function createConfig() {
    return {
        settings: new Array(1000000).fill('Configuration'),
    };
}

// Use config only when needed, and let it be garbage collected afterwards
function processConfig() {
    const config = createConfig();
    // Perform operations with config
    console.log(config.settings[0]);

    // Config will be cleared from memory once it's no longer referenced
}

processConfig();
```

Вместо того чтобы хранить `config` в глобальном объекте, мы храним `config` локально внутри функции. Это гарантирует, что `config` будет очищена после выполнения функции, освобождая память для сборки мусора.

### Слушатели событий не удалены

Добавление слушателей событий без их надлежащего удаления, когда они больше не нужны, может привести к утечке памяти.

Каждый слушатель событий сохраняет ссылку на функцию и все переменные, которые она использует, не позволяя сборщику мусора освободить эту память.

Со временем, если вы будете добавлять слушателей, не удаляя их, это приведет к увеличению использования памяти.

Вот пример, демонстрирующий, как слушатели событий могут вызывать утечки памяти, если их не удалять должным образом:

```js
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

function listener() {
    console.log('Event triggered!');
}

// Adding event listeners repeatedly
setInterval(() => {
    myEmitter.on('event', listener);
}, 1000);
```

Каждую секунду добавляется новый слушатель событий. Однако эти слушатели никогда не удаляются, что приводит к их накоплению в памяти.

Каждый слушатель хранит ссылку на функцию `listener` и все связанные с ней переменные, что препятствует сборке мусора и со временем приводит к увеличению использования памяти.

Чтобы предотвратить эту утечку памяти, следует удалять слушатели событий, когда они больше не нужны.

```js
const EventEmitter = require('events');
const myEmitter = new EventEmitter();

function listener() {
    console.log('Event triggered!');
}

// Add an event listener
myEmitter.on('event', listener);

// Trigger the event and then remove the listener
myEmitter.emit('event');
myEmitter.removeListener('event', listener);

// Alternatively, you can use `once` method to add a listener
// that automatically removes itself after being triggered
myEmitter.once('event', listener);
```

### Замыкания, захватывающие переменные

Замыкания в JavaScript могут непреднамеренно удерживать переменные дольше, чем это необходимо. Когда закрытие захватывает переменную, оно сохраняет ссылку на нее в памяти.

Если закрытие используется в долго выполняющемся процессе или не завершено должным образом, захваченные переменные остаются в памяти, что приводит к утечке.

```js
function createClosure() {
    let capturedVar = new Array(1000000).fill('Data');

    return function () {
        console.log(capturedVar[0]);
    };
}

const closure = createClosure();
// The closure holds onto 'capturedVar', even if it's not used anymore.
```

Чтобы избежать утечек, убедитесь, что закрытия не захватывают без необходимости большие переменные и не завершают их, когда они больше не нужны.

```js
function createClosure() {
    let capturedVar = new Array(1000000).fill('Data');

    return function () {
        console.log(capturedVar[0]);
        // Release memory when no longer needed
        capturedVar = null;
    };
}

const closure = createClosure();
// 'capturedVar' is released after use.
closure();
```

### Неуправляемые обратные вызовы

В некоторых сценариях неуправляемые обратные вызовы могут вызывать проблемы с памятью, если они удерживают переменные или объекты дольше, чем это необходимо.

Однако сборщик мусора JavaScript обычно эффективно очищает память, когда ссылки больше не нужны.

```js
function fetchData(callback) {
    let data = new Array(1000000).fill('Data');

    setTimeout(() => {
        callback(data);
    }, 1000);
}

function handleData(data) {
    console.log(data[0]);
}

// The 'data' array remains in memory.
fetchData(handleData);
```

В приведенном выше примере:

1.  **Распределение данных**: Функция `fetchData` выделяет большой массив (`data`), который содержит 1 миллион элементов.
2.  **Ссылка на обратный вызов**: Функция обратного вызова `handleData` ссылается на этот большой массив, когда она вызывается функцией `setTimeout` через 1 секунду. Несмотря на большое распределение, сборщик мусора JavaScript гарантирует, что память будет освобождена, когда она больше не нужна.

Нет необходимости вручную очищать ссылки, если только вы не имеете дело с очень сложными сценариями, в которых ссылки непреднамеренно сохраняются.

### Чрезмерная сложность (не рекомендуется)

```js
function fetchData(callback) {
    let data = new Array(1000000).fill('Data');

    setTimeout(() => {
        callback(data);
        data = null; // Release the reference
        global.gc(); // Explicitly trigger garbage collection
    }, 1000);
}

function handleData(data) {
    console.log(data[0]);
    data = null; // Clear reference after handling
}

console.log('Initial Memory Usage:', process.memoryUsage());

fetchData(handleData);

setTimeout(() => {
    console.log(
        'Final Memory Usage:',
        process.memoryUsage()
    );
}, 2000); // Give some time for garbage collection
```

Хотя этот код вручную очищает ссылки и явно запускает сборку мусора, он вносит ненужные сложности.

Сборщик мусора JavaScript обычно справляется с очисткой памяти без этих дополнительных действий.

В большинстве сценариев такое ручное вмешательство не только излишне, но и может усложнить сопровождение кода.

### Неправильное использование `bind()`

Использование `bind()` создает новую функцию с ключевым словом `this`, установленным на определенное значение. Если вы не будете осторожны, это может привести к утечке памяти.

```js
function MyClass() {
    this.largeData = new Array(1000000).fill('leak');

    window.addEventListener(
        'click',
        this.handleClick.bind(this)
    );
}

MyClass.prototype.handleClick = function () {
    console.log('Clicked');
};

// If MyClass instance is destroyed, but the event listener is not removed,
// the bound function will keep the instance alive in memory.
```

### Почему происходят утечки памяти при использовании `bind()`

1.  **Ссылки сохраняются**: Когда вы используете `bind()`, новая функция запоминает исходную функцию и это значение. Если вы не удалите функцию, когда она больше не нужна, она останется и будет использовать память.
2.  **Большие объекты остаются в памяти**: Связанные функции могут случайно оставить в памяти большие объекты, даже если они вам больше не нужны.

### Циркулярные ссылки

Циклические ссылки возникают, когда два объекта ссылаются друг на друга. Это создает цикл, который может запутать сборщик мусора, не позволяя ему освободить память.

```js
function CircularReference() {
    this.reference = this; // Circular reference
}

let obj = new CircularReference();
obj = null; // Setting obj to null may not free the memory.
```

Даже если вы установите `obj` в `null`, память может быть не освобождена из-за самоцикла. Вот как можно избежать круговой ссылки.

1.  **Разорвите цикл**: Убедитесь, что объекты не ссылаются друг на друга, когда они больше не нужны. Это поможет сборщику мусора очистить их.

    ```js
    function CircularReference() {
        this.reference = this;
    }

    let obj = new CircularReference();

    // Breaking the circular reference
    obj.reference = null;
    obj = null; // Now the memory can be freed
    ```

    Установив для `obj.reference` значение `null`, мы разрываем круговую ссылку. Это позволит сборщику мусора освободить память, когда `obj` больше не нужен.

2.  **Использование слабых ссылок**: Использование `WeakMap`, `WeakSet` или `WeakRef` позволяет сборщику мусора очищать память даже при наличии ссылок, если они слабые.

    ```js
    let weakMap = new WeakMap();

    function CircularReference() {
        let obj = {};
        weakMap.set(obj, 'This is a weak reference');
        return obj;
    }

    let obj = CircularReference();
    // The object can be garbage collected when no longer needed
    ```

    В `weakMap` хранится слабая ссылка на `obj`. Это означает, что когда `obj` больше не используется в других местах, он все равно может быть собран в мусор, даже если на него ссылается `weakMap`.

    ```js
    let weakRef;

    function createObject() {
        let obj = { data: 'important' };
        weakRef = new WeakRef(obj);
        return obj;
    }

    let obj = createObject();

    console.log(weakRef.deref()); // { data: 'important' }

    obj = null; // Now the object can be garbage collected
    ```

    `weakRef` позволяет хранить слабую ссылку на `obj`. Если `obj` установлен в null и на него нет других ссылок, он может быть собран в мусор, даже если `weakRef` все еще существует.

## Быстрое примечание

`WeakMap`, `WeakSet` и `WeakRef` отлично подходят для предотвращения утечек памяти, но они могут не понадобиться вам постоянно. Они больше подходят для продвинутых случаев использования, таких как управление кэшем или большими данными.

Если вы работаете над типичными веб-приложениями, то, возможно, не часто будете с ними сталкиваться, но полезно знать, что они существуют, когда вам это нужно.

## Профилирование использования памяти в Node.js

Чтобы найти утечки памяти, вам нужно профилировать ваше приложение, чтобы понять, как используется память.

Вот приложение Node.js, созданное для имитации задач, требующих больших затрат процессора, операций ввода-вывода и намеренного создания утечки памяти в целях тестирования.

```js
const http = require('http');
const url = require('url');

// Simulate a CPU-intensive task
const handleCpuIntensiveTask = (req, res) => {
    let result = 0;
    for (let i = 0; i < 1e7; i++) {
        result += i * Math.random();
    }
    console.log(
        'Memory Usage (CPU Task):',
        process.memoryUsage()
    ); // Log memory usage
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(`Result of the CPU-intensive task: ${result}`);
};

// Create a large in-memory buffer
// 50MB buffer filled with 'a'
const largeBuffer = Buffer.alloc(1024 * 1024 * 50, 'a');

// Simulate an I/O operation
const handleSimulateIo = (req, res) => {
    // Simulate reading the buffer as if it were a file
    setTimeout(() => {
        console.log(
            'Memory Usage (Simulate I/O):',
            process.memoryUsage()
        ); // Log memory usage
        res.writeHead(200, {
            'Content-Type': 'text/plain',
        });
        res.end(
            `Simulated I/O operation completed with data of length: ${largeBuffer.length}`
        );
    }, 500); // Simulate a 500ms I/O operation
};

// Simulate a memory leak (For Testing)
let memoryLeakArray = [];

const causeMemoryLeak = () => {
    memoryLeakArray.push(
        new Array(1000).fill('memory leak')
    );
    console.log(
        'Memory leak array length:',
        memoryLeakArray.length
    );
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/cpu-intensive') {
        handleCpuIntensiveTask(req, res);
    } else if (parsedUrl.pathname === '/simulate-io') {
        handleSimulateIo(req, res);
    } else if (
        parsedUrl.pathname === '/cause-memory-leak'
    ) {
        causeMemoryLeak();
        res.writeHead(200, {
            'Content-Type': 'text/plain',
        });
        res.end('Memory leak caused. Check memory usage.');
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/plain',
        });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

Далее нам нужно провести стресс-тестирование нашего сервера. Этот скрипт проводит стресс-тестирование сервера, отправляя по 100 запросов для имитации утечек процессора, ввода-вывода и памяти.

```sh
#!/bin/bash

# Number of requests to send
REQUESTS=100

# Endpoint URLs
CPU_INTENSIVE_URL="http://localhost:3000/cpu-intensive"
SIMULATE_IO_URL="http://localhost:3000/simulate-io"
MEMORY_LEAK_URL="http://localhost:3000/cause-memory-leak"

echo "Sending $REQUESTS requests to $CPU_INTENSIVE_URL and $SIMULATE_IO_URL..."

# Loop for CPU-intensive endpoint
for ((i=1;i<=REQUESTS;i++)); do
  curl -s $CPU_INTENSIVE_URL > /dev/null &
done

# Loop for Simulated I/O endpoint
for ((i=1;i<=REQUESTS;i++)); do
  curl -s $SIMULATE_IO_URL > /dev/null &
done

# Loop for Memory Leak endpoint
for ((i=1;i<=REQUESTS;i++)); do
  curl -s $MEMORY_LEAK_URL > /dev/null &
done

wait
echo "Done."
```

Он перебирает URL-адреса и отправляет тихие запросы с помощью curl, выполняя их в фоновом режиме, чтобы имитировать высокую нагрузку.

```sh
$> ./load_test.sh
Sending 100 requests to http://localhost:3000/cpu-intensive and http://localhost:3000/simulate-io and http://localhost:3000/cause-memory-leak
Done.
```

Вот как наш сервер реагирует на стресс-тест. Перед началом теста убедитесь, что сервер запущен.

```sh
$> node --prof server.js
Server is running on port 3000
Memory Usage (Simulate I/O): {
  rss: 122863616,
  heapTotal: 17547264,
  heapUsed: 8668016,
  external: 54075004,
  arrayBuffers: 52439275
}
Memory leak array length: 25
Memory leak array length: 26
Memory leak array length: 27
Memory leak array length: 28
Memory leak array length: 29
Memory leak array length: 30
Memory leak array length: 31
Memory leak array length: 32
Memory leak array length: 33
Memory leak array length: 34
Memory leak array length: 35
Memory leak array length: 36
Memory leak array length: 37
Memory leak array length: 38
Memory leak array length: 39
Memory leak array length: 40
Memory leak array length: 41
Memory leak array length: 42
Memory leak array length: 43
Memory leak array length: 44
Memory leak array length: 45
Memory leak array length: 46
Memory leak array length: 47
Memory leak array length: 48
Memory leak array length: 49
Memory leak array length: 50
Memory leak array length: 51
Memory leak array length: 52
Memory leak array length: 53
Memory leak array length: 54
Memory leak array length: 55
Memory leak array length: 56
Memory Usage (CPU Task): {
  rss: 122716160,
  heapTotal: 17547264,
  heapUsed: 11393456,
  external: 54075004,
  arrayBuffers: 52439275
}
Memory leak array length: 173
```

## Анализ результатов

Данные профилирования будут сохранены в файле с именем `isolate-0xXXXXXXXXXX-v8.log`.

Чтобы обработать журнал и получить человекочитаемую сводку, выполните команду:

```sh
$> node --prof-process isolate-0x140008000-42065-v8.log > processed-profile.txt
```

В результате будет создан файл `processed-profile.txt` с данными профилирования процессора, которые содержат подробную информацию о том, где ваше приложение проводило время и как оно управляло памятью.

Откройте файл `processed-profile.txt` и найдите области, где используется значительное количество времени или памяти.

```
Statistical profiling result from isolate-0x140008000-42065-v8.log, (4099 ticks, 308 unaccounted, 0 excluded).

 [Shared libraries]:
   ticks  total  nonlib   name

 [JavaScript]:
   ticks  total  nonlib   name
   1007   24.6%   24.6%  JS: *handleCpuIntensiveTask /Users/trevorindreklasn/Projects/labs/node-memory/server.js:5:32
      5    0.1%    0.1%  JS: +handleCpuIntensiveTask /Users/trevorindreklasn/Projects/labs/node-memory/server.js:5:32
      1    0.0%    0.0%  JS: ^onParserExecute node:_http_server:839:25
      1    0.0%    0.0%  JS: ^getKeys node:internal/util/inspect:709:17
      1    0.0%    0.0%  JS: ^clearBuffer node:internal/streams/writable:742:21
      1    0.0%    0.0%  JS: ^checkListener node:events:276:23
      1    0.0%    0.0%  JS: ^Socket node:net:353:16
      1    0.0%    0.0%  JS: +pushAsyncContext node:internal/async_hooks:539:26
      1    0.0%    0.0%  JS: +processTicksAndRejections node:internal/process/task_queues:67:35

 [C++]:
   ticks  total  nonlib   name
   2772   67.6%   67.6%  t std::__1::__hash_table<std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::__unordered_map_hasher<int, std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::hash<int>, std::__1::equal_to<int>, true>, std::__1::__unordered_map_equal<int, std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::equal_to<int>, std::__1::hash<int>, true>, std::__1::allocator<std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>>>::rehash(unsigned long)

 [Summary]:
   ticks  total  nonlib   name
   1019   24.9%   24.9%  JavaScript
   2772   67.6%   67.6%  C++
    358    8.7%    8.7%  GC
      0    0.0%          Shared libraries
    308    7.5%          Unaccounted

 [C++ entry points]:
   ticks    cpp   total   name
   2636  100.0%   64.3%  TOTAL

 [Bottom up (heavy) profile]:
  Note: percentage shows a share of a particular caller in the total
  amount of its parent calls.
  Callers occupying less than 1.0% are not shown.

   ticks parent  name
   2772   67.6%  t std::__1::__hash_table<std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::__unordered_map_hasher<int, std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::hash<int>, std::__1::equal_to<int>, true>, std::__1::__unordered_map_equal<int, std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::equal_to<int>, std::__1::hash<int>, true>, std::__1::allocator<std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>>>::rehash(unsigned long)
   1880   67.8%    JS: *handleCpuIntensiveTask /Users/trevorindreklasn/Projects/labs/node-memory/server.js:5:32
   1727   91.9%      JS: ^<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
   1129   65.4%        JS: +emit node:events:467:44
   1129  100.0%          JS: ^parserOnIncoming node:_http_server:1033:26
   1129  100.0%            JS: ^parserOnHeadersComplete node:_http_common:71:33
    598   34.6%        JS: ^emit node:events:467:44
    598  100.0%          JS: ^parserOnIncoming node:_http_server:1033:26
    598  100.0%            JS: ^parserOnHeadersComplete node:_http_common:71:33
    153    8.1%      JS: ~<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
    140   91.5%        JS: ^emit node:events:467:44
    140  100.0%          JS: ~parserOnIncoming node:_http_server:1033:26
    140  100.0%            JS: ~parserOnHeadersComplete node:_http_common:71:33
     13    8.5%        JS: ~parserOnIncoming node:_http_server:1033:26
     13  100.0%          JS: ~parserOnHeadersComplete node:_http_common:71:33
    655   23.6%    t std::__1::__hash_table<std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::__unordered_map_hasher<int, std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::hash<int>, std::__1::equal_to<int>, true>, std::__1::__unordered_map_equal<int, std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>, std::__1::equal_to<int>, std::__1::hash<int>, true>, std::__1::allocator<std::__1::__hash_value_type<int, std::__1::unique_ptr<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>, std::__1::default_delete<std::__1::unordered_map<int, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>, std::__1::hash<int>, std::__1::equal_to<int>, std::__1::allocator<std::__1::pair<int const, std::__1::unique_ptr<v8_inspector::InspectedContext, std::__1::default_delete<v8_inspector::InspectedContext>>>>>>>>>>::rehash(unsigned long)
    654   99.8%      JS: *handleCpuIntensiveTask /Users/trevorindreklasn/Projects/labs/node-memory/server.js:5:32
    612   93.6%        JS: ^<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
    410   67.0%          JS: +emit node:events:467:44
    410  100.0%            JS: ^parserOnIncoming node:_http_server:1033:26
    202   33.0%          JS: ^emit node:events:467:44
    202  100.0%            JS: ^parserOnIncoming node:_http_server:1033:26
     42    6.4%        JS: ~<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
     40   95.2%          JS: ^emit node:events:467:44
     40  100.0%            JS: ~parserOnIncoming node:_http_server:1033:26
      2    4.8%          JS: ~parserOnIncoming node:_http_server:1033:26
      2  100.0%            JS: ~parserOnHeadersComplete node:_http_common:71:33
     49    1.8%    JS: ^<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
     38   77.6%      JS: +emit node:events:467:44
     38  100.0%        JS: ^parserOnIncoming node:_http_server:1033:26
     38  100.0%          JS: ^parserOnHeadersComplete node:_http_common:71:33
     11   22.4%      JS: ^emit node:events:467:44
     11  100.0%        JS: ^parserOnIncoming node:_http_server:1033:26
     11  100.0%          JS: ^parserOnHeadersComplete node:_http_common:71:33

   1007   24.6%  JS: *handleCpuIntensiveTask /Users/trevorindreklasn/Projects/labs/node-memory/server.js:5:32
    940   93.3%    JS: ^<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
    663   70.5%      JS: +emit node:events:467:44
    663  100.0%        JS: ^parserOnIncoming node:_http_server:1033:26
    663  100.0%          JS: ^parserOnHeadersComplete node:_http_common:71:33
    277   29.5%      JS: ^emit node:events:467:44
    277  100.0%        JS: ^parserOnIncoming node:_http_server:1033:26
    277  100.0%          JS: ^parserOnHeadersComplete node:_http_common:71:33
     67    6.7%    JS: ~<anonymous> /Users/trevorindreklasn/Projects/labs/node-memory/server.js:36:34
     61   91.0%      JS: ^emit node:events:467:44
     61  100.0%        JS: ~parserOnIncoming node:_http_server:1033:26
     61  100.0%          JS: ~parserOnHeadersComplete node:_http_common:71:33
      6    9.0%      JS: ~parserOnIncoming node:_http_server:1033:26
      6  100.0%        JS: ~parserOnHeadersComplete node:_http_common:71:33

    308    7.5%  UNKNOWN
     11    3.6%    JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
     11  100.0%      JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      2   18.2%        JS: ~<anonymous> node:internal/streams/duplex:1:1
      2  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      2  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      2   18.2%        JS: ~<anonymous> node:http:1:1
      2  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      2  100.0%            JS: ~compileForPublicLoader node:internal/bootstrap/realm:332:25
      1    9.1%        JS: ~<anonymous> node:net:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      1    9.1%        JS: ~<anonymous> node:internal/streams/readable:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      1    9.1%        JS: ~<anonymous> node:internal/streams/operators:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      1    9.1%        JS: ~<anonymous> node:internal/perf/observe:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      1    9.1%        JS: ~<anonymous> node:internal/child_process:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      1    9.1%        JS: ~<anonymous> node:child_process:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
      1    9.1%        JS: ~<anonymous> node:_http_agent:1:1
      1  100.0%          JS: ^compileForInternalLoader node:internal/bootstrap/realm:384:27
      1  100.0%            JS: ^requireBuiltin node:internal/bootstrap/realm:421:24
```

Обратите особое внимание на:

-   **Функции с высоким использованием процессора**: Это самые узкие места в вашем коде.
-   **Функции, потребляющие много памяти**: Функции, потребляющие большое количество памяти, могут указывать на потенциальные утечки памяти, особенно если они соответствуют частям вашего кода, которые должны освобождать память, но не делают этого.
-   **Петля событий и сборка мусора (GC)**: Ищите высокий процент времени, проведенного в GC, так как это может свидетельствовать о том, что приложение испытывает трудности с управлением памятью. Утечки памяти могут быть незаметными, но их устранение является ключевым фактором для обеспечения эффективности и надежности ваших JavaScript-приложений.

<small>:material-information-outline: Источник &mdash; <https://www.trevorlasn.com/blog/common-causes-of-memory-leaks-in-javascript></small>
