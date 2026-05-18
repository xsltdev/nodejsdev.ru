---
description: Операции с Buffer в Node.js — кодирование, slice/subarray, копирование и утечки памяти
---

# Операции с Buffer в Node.js: кодирование, slice и копирование

Источник: [theNodeBook — Working With Buffers](https://www.thenodebook.com/buffers/working-with-buffers)

Операции с `Buffer` в Node.js — это операции над байтами. Повседневная работа: декодировать байты в строки, кодировать строки в байты, вырезать представления (views) поверх уже выделенной памяти, копировать байты в независимое хранилище, сравнивать полезную нагрузку и склеивать чанки, пришедшие по частям. Хороший код с буферами отслеживает **владение памятью**: `slice()` и `subarray()` создают представления; `copy()` и многие варианты `Buffer.from()` — отдельное хранилище.

Кодирование — граница, где байты становятся текстом. `buf.toString()` декодирует байты. `Buffer.from(text)` кодирует текст. Операции-представления сохраняют общий backing store: запись через одно представление может изменить другое. Копирование выделяет отдельную память. Эта разница критична в парсерах, сетевых прокси, передаче данных в worker и при долгоживущих срезах.

!!!note ""

    Глава углубляется в `Buffer`. Если что-то кажется перегруженным — перечитайте раздел или вернитесь после соседних глав.

Скорее всего, вы здесь, чтобы применить знания из предыдущих глав — или потому что сервис жрёт память, а бинарный парсер на высокой нагрузке тормозит. Виновник почти всегда один: неверное понимание того, как `Buffer` управляет памятью. Мы разберём самое опасное заблуждение в Node.js: **`Buffer.slice()` ведёт себя не как `Array.prototype.slice()`**. Массив даёт независимую копию; буфер — **представление** в ту же underlying-память. Это основа zero-copy.

!!!warning ""

    `Buffer.slice` помечен устаревшим в пользу `Buffer.subarray()`. Поведение `slice` всё равно нужно знать для legacy-кода и понимания механики представлений.

Представления, использованные правильно, позволяют обрабатывать огромные объёмы данных почти без лишней памяти. Использованные наобум — дают утечки: срез на 10 байт удерживает буфер на 1 GB, и GC не может его освободить. Вы узнаете разницу между view (`slice`, `subarray`) и настоящей копией (`Buffer.copy()`), связь `Buffer` с `TypedArray` и общим `ArrayBuffer`, а также почему сервис может показывать 10 GB RSS при 1 GB «полезных» данных — и как это исправить.

## Работа с данными Buffer в Node.js

## Утечка памяти на гигабайты

Сервис, которому хватало 500 MB RAM, внезапно требует 10 GB? Часто это не «магия V8», а непонимание памяти. Разберём, как из аккуратного кода получить именно такую катастрофу — и как её не повторить.

!!!warning ""

    Паттерны удержания памяти через `Buffer`, описанные в этой главе — **главная** причина production-утечек в Node.js. Один `Buffer.slice()` может удерживать гигабайты бесконечно.

Типичный сценарий: сервис принимает большие батчи (логи, multipart-загрузки). На каждый чанк в несколько мегабайт нужно прочитать фиксированный заголовок — например, session ID из первых 16 байт.

```js
// Вызывается тысячи раз для многомегабайтных чанков.
function getSessionId(logBuffer) {
  // Session ID всегда в первых 16 байтах.
  const headerSlice = logBuffer.slice(0, 16);
```

Остановитесь здесь. Строка `logBuffer.slice(0, 16)` — **начало утечки**. При `slice()` Node не выделяет новую память: создаётся маленький JS-объект (~72 байта в V8) с указателем на `ArrayBuffer` родителя, смещением (0) и длиной (16). Объект на куче V8, но держит сильную ссылку на **внешнюю** память, где лежат данные `logBuffer`.

GC видит эту ссылку и помечает **весь** родительский буфер как достижимый. Вам нужны 16 байт — удерживаются мегабайты. После двух scavenges буфер часто попадает в old generation и собирается ещё тяжелее. В проде так удерживали 100 MB ради десятков 16-байтных ID.

```js
  // Сохраняем срез в map/cache для батчинга.
  return headerSlice;
}
```

Код выглядит безобидно, но при 100 MB логов в минуту RSS растёт гигабайтами: вы храните 10 GB ради мегабайтов session ID. Heap snapshot показывает тысячи крошечных `Buffer` по 16 байт, которые «удерживают» гигабайты. Профайлер не сломан: **срез — не копия**, а view. Пока `headerSlice` в кеше, GC не освободит многомегабайтный `logBuffer`.

Вы утекали не байтами — вы утекали **родительским буфером** на каждый запрос. Умножьте на тысячи запросов — получите разобранную здесь утечку на 10 GB.

Как в предыдущей главе: сырые бинарные данные через строки JavaScript — плохая идея. Запомните: **память `Buffer` в Node.js не живёт на куче V8.**

### Архитектура памяти Buffer

V8 заточен под мелкие связанные объекты. GC хорошо чистит строки и объекты, но «захлёбывается» на огромных монолитных бинарных блоках — чтение гигантского файла могло бы вызвать stop-the-world и убить latency.

Node выделяет большие блоки **вне** кучи V8, в C++ (off-heap / external memory). JS-объект `Buffer` — лёгкий **handle** на куче V8 со ссылкой на сырой блок снаружи.

Две стороны одной медали:

-   Node передаёт гигантские блоки в FS/сеть без копирования в мир JS — очень эффективно.
-   GC видит только handle. Держите handle в замыкании или долгоживущей структуре — внешняя плита не освободится. Утечка не «несколько байт объекта», а **весь slab**, на который он указывает.

### Пул буферов 8 KB

Для буферов меньше 4 KB Node режет куски из предвыделенного slab `Buffer.poolSize` (8 KB), не дёргая ОС на каждый allocate. Это ускоряет приложения с множеством мелких буферов — и объясняет опасность `Buffer.allocUnsafe()`: вы получаете **переиспользованный** кусок пула, где секунды назад могли лежать чужие токены.

## Представления: `slice`, `subarray` и `Buffer.from`

Три функции, где чаще всего ошибаются: `Buffer.slice()`, `Buffer.subarray()`, `Buffer.from()` (от другого буфера или `ArrayBuffer`).

Привычка с массивов: `Array.prototype.slice()` — shallow copy, новый массив, изменения независимы. **Для буферов это ложь.**

`Buffer.prototype.slice()` **не копирует**. Он создаёт **view** — новый объект `Buffer` на **те же байты** того же `ArrayBuffer`.

!!!warning ""

    `Buffer.slice()` — **не** как `Array.slice()`. Массивы копируют, буферы — делят память. Изменение среза меняет оригинал. Это источник большинства утечек и тихой порчи данных с `Buffer` в проде.

```js
// 50 MB из сетевого потока.
const massiveBuffer = Buffer.alloc(50 * 1024 * 1024);
massiveBuffer.write('USER_ID:12345|REST_OF_DATA...');
```

`Buffer.alloc(50 * 1024 * 1024)` обходит пул (размер больше `Buffer.poolSize >>> 1`, т.е. 4096): выделение в C++, на Linux часто через `mmap()` с demand paging; `alloc` обнуляет память, заставляя ОС выделить физические страницы.

```js
// VIEW в ту же память. Без копии!
const userIdSlice = massiveBuffer.slice(9, 14); // "12345"
console.log(userIdSlice.toString()); // 12345
```

```js
userIdSlice.write('99999');
```

Запись идёт по абсолютному смещению в родительском `ArrayBuffer` (offset среза + позиция записи). Copy-on-write нет — порча 50 MB буфера, заголовков протокола, метаданных запросов.

```js
console.log(massiveBuffer.toString('utf-8', 0, 20));
// USER_ID:99999|REST_O
```

`subarray()` в современных версиях Node функционально то же, что `slice()` — view, не копия. Документация рекомендует `subarray()` для согласованности с `TypedArray`.

!!!note ""

    `Buffer.slice()` и `Buffer.subarray()` идентичны по смыслу: оба — views. Предпочитайте `subarray()` в новом коде.

```js
const mainBuffer = Buffer.from([1, 2, 3, 4, 5]);
const sub = mainBuffer.subarray(1, 3); // байты [2, 3]
sub[0] = 99;
console.log(mainBuffer); // <Buffer 01 63 03 04 05>
```

### Поведение `Buffer.from()` по типу аргумента

-   `Buffer.from(string)` — **новая память**, копия строки.
-   `Buffer.from(array)` — **новая память**, копия байтов.
-   `Buffer.from(arrayBuffer[, byteOffset, length])` — **view**, zero-copy.
-   `Buffer.from(buffer)` — **полная копия** данных.

!!!warning ""

    `Buffer.from(arrayBuffer)` — view; `Buffer.from(buffer)` — copy. Разное поведение при одном имени функции — частый источник багов. Всегда смотрите тип входа.

## Zero-copy

«Zero-copy» звучит как бесплатная скорость — но вы платите **сложностью управления памятью**. Zero-copy = не копируете payload, но создаёте новый JS-объект (view) на куче V8 — это на порядки быстрее, чем alloc + побайтовое копирование.

```js
const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
const chunkSize = 1024;

console.time('view creation');
const view = largeBuffer.subarray(5000, 5000 + chunkSize);
console.timeEnd('view creation');

console.time('copy creation');
const copy = Buffer.alloc(chunkSize);
largeBuffer.copy(copy, 0, 5000, 5000 + chunkSize);
console.timeEnd('copy creation');
```

Типично: view ~0.007 ms, copy ~0.024 ms (большая часть — overhead `console.time`).

!!!tip ""

    Для точных замеров в проде используйте `performance.timerify()` или модуль `perf_hooks`. `console.time()` удобен, но груб для субмиллисекунд.

Создание view — **O(1)** по размеру данных. Копирование — **O(n)**. В hot path замена лишних копий на views иногда снимает ~30% CPU — но view **прикрепляет** родительский буфер к жизненному циклу view.

Оптимизация «везде views» меняет CPU на риск OOM. Правильная оптимизация — понимать, когда микрокопия дешевле удержания гигантского родителя.

### Buffer, TypedArray и общая память

С Node.js v3 `Buffer` — подкласс `Uint8Array`. Сырой блок — `ArrayBuffer`; `Buffer`, `Int32Array` и т.д. — разные **views** на один slab.

```js
const messageArrayBuffer = new ArrayBuffer(12);

const stringView = Buffer.from(messageArrayBuffer, 4, 8);
stringView.write('CONFIRMD');

const intView = new Int32Array(messageArrayBuffer, 0, 1);
console.log('Initial integer value:', intView[0]); // 0

// Ошибка: view с offset 0 перекрывает intView.
const buggyStringView = Buffer.from(
    messageArrayBuffer,
    0,
    8
);
buggyStringView.write('CANCELED');

console.log('Corrupted integer value:', intView[0]); // 1128353859
```

!!!warning ""

    Несколько views на один `ArrayBuffer` могут **молча** портить данные друг друга. Runtime не проверяет перекрытия. Одна ошибка в offset — недели отладки.

## Когда память общая, а когда нет

Правило: если в API не сказано «copy» / «alloc» — **по умолчанию shared memory**.

**Views (zero-copy):**

-   `Buffer.prototype.slice(start, end)`
-   `Buffer.prototype.subarray(start, end)`
-   `new Uint8Array(arrayBuffer, byteOffset, length)` (и другие `TypedArray` от `ArrayBuffer`)
-   `Buffer.from(arrayBuffer, byteOffset, length)`

Ключевое слово — **временно**: view живёт недолго внутри функции — выигрыш без риска удержания.

**Копии (новая память):**

-   `Buffer.alloc(size)`
-   `Buffer.from(string)` / `Buffer.from(array)` / `Buffer.from(buffer)`
-   `Buffer.prototype.copy()` — пишет **в** уже существующий target
-   `Uint8Array.prototype.slice()` — **копирует** (в отличие от `Buffer.slice()`!)

!!!warning ""

    `TypedArray.prototype.slice()` — COPY; `Buffer.prototype.slice()` — VIEW. Вызов `Uint8Array.prototype.slice.call(buf, ...)` даст противоположное поведение.

Пример: метаданные 1 KB из видео 1 GB.

```js
import { readFileSync } from 'fs';
const videoBuffer = readFileSync('large_video.mp4'); // 1GB, блокирует event loop

// НЕПРАВИЛЬНО для долгого хранения
const metadataView = videoBuffer.slice(0, 1024);
// shallow ~72 B, retained ~1 GB

// ПРАВИЛЬНО
const metadataCopy = Buffer.alloc(1024);
videoBuffer.copy(metadataCopy, 0, 0, 1024);
// videoBuffer можно собрать, как только он вышел из scope
```

!!!tip ""

    Views — для временной обработки в функции. Копии — для кеша, async и любого долгоживущего хранения. Небольшой CPU за копию спасает гигабайты RSS.

## Семантика копирования и `Buffer.copy()`

`buf.copy(targetBuffer, targetStart, sourceStart, sourceEnd)` — аналог `memcpy`: пишет в **уже выделенный** target.

```js
const source = Buffer.from('abcdefghijklmnopqrstuvwxyz');
const target = Buffer.alloc(10);
source.copy(target, 0, 0, 10);
console.log(target.toString()); // abcdefghij

source.copy(target, 3, 10, 15);
console.log(target.toString()); // abcklmnohij
```

Удобная копия целиком: `Buffer.from(buffer)` — внутри alloc + `memcpy`, независимый backing store.

```js
const original = Buffer.from('This is the original buffer');
const clone = Buffer.from(original);
clone.write('That');
console.log(original.toString()); // без изменений
```

!!!important ""

    `Buffer.copy()` требует заранее выделенный target: `const copy = Buffer.alloc(size); source.copy(copy, 0, start, end);`. Для одной строки: `Buffer.from(source.subarray(start, end))`.

Исправление парсера логов:

```js
function getSessionId(logBuffer) {
    const sessionId = Buffer.alloc(16);
    logBuffer.copy(sessionId, 0, 0, 16);
    return sessionId.toString('utf-8');
}
```

16 байт + наносекунды `memcpy` — и многомегабайтный `logBuffer` собирается сразу после выхода из scope.

!!!warning ""

    Не используйте `Buffer.allocUnsafe()` для копий с чувствительными данными — в памяти могут остаться секреты с прошлых allocation. Для security-sensitive кода — `Buffer.alloc()`.

## SharedArrayBuffer и views между потоками

`worker_threads` дают параллелизм; передача обычного `ArrayBuffer` в worker **клонирует** данные. `SharedArrayBuffer` (SAB) — память, доступная нескольким потокам одновременно.

!!!warning ""

    SAB в браузерах временно отключали из‑за Spectre. В Node для многопоточности используйте **`Atomics`**, иначе гонки и порча данных.

```js
// main.js
import { Worker } from 'worker_threads';

const sab = new SharedArrayBuffer(4);
const mainThreadView = new Int32Array(sab);
mainThreadView[0] = 123;

const worker = new Worker('./worker.js');
worker.postMessage({ sab });

worker.on('message', () => {
    console.log('Main thread sees:', mainThreadView[0]); // 456
});
```

```js
// worker.js
import { parentPort } from 'worker_threads';

parentPort.on('message', ({ sab }) => {
    const workerView = new Int32Array(sab);
    console.log(
        'Worker sees initial value:',
        workerView[0]
    ); // 123
    workerView[0] = 456;
    parentPort.postMessage('done');
});
```

!!!important ""

    Без `Atomics` доступ к SAB **не потокобезопасен**. `array[0] = value` может гонять. Используйте `Atomics.store()`, `Atomics.load()` и т.д.

Тот же принцип views, что у `slice`/`subarray`, только через границу потока.

## Удержание памяти и сборка мусора

View через `slice()`/`subarray()` связывает:

1.  **View** — маленький `Buffer` на куче V8.
2.  **Parent** — исходный `Buffer` с большим external `ArrayBuffer`.

Пока view достижим — parent тоже. GC не знает, что вам нужны только 16 байт из 50 MB.

-   **Shallow size** — размер самого объекта (десятки байт обёртки).
-   **Retained size** — всё, что удерживается **только из‑за** этого объекта (часто весь parent).

```js
// View удерживает parent
function createView(parent) {
    return parent.slice(0, 10);
}

// Копия отрезает связь
function createCopy(parent) {
    return Buffer.from(parent.slice(0, 10));
}
```

Паттерн `Buffer.from(buf.slice(...))` — обрезанная копия маленького фрагмента большого буфера.

## Парсинг бинарного протокола через views

Пример layout сообщения:

-   байты 0–1: тип (Uint16)
-   2–3: длина (Uint16)
-   4: flags (Uint8)
-   5–20: session ID (16 байт)
-   21–end: payload

Наивный вариант — лишние views на каждое поле:

```js
function parseMessageWithCopies(buffer) {
    const messageType = buffer.slice(0, 2).readUInt16BE();
    const messageLength = buffer.slice(2, 4).readUInt16BE();
    const flags = buffer.slice(4, 5).readUInt8();
    const sessionId = buffer.slice(5, 21).toString('utf-8');
    const payload = buffer.slice(21);
    return {
        messageType,
        messageLength,
        flags,
        sessionId,
        payload,
    };
}
```

!!!warning ""

    Пять views на сообщение × 1000 msg/s × 1 MB payload — гигабайты удержанной памери даже если нужны только 16 байт ID.

Эффективный разбор:

```js
function parseMessageWithViews(buffer) {
    const messageType = buffer.readUInt16BE(0);
    const messageLength = buffer.readUInt16BE(2);
    const flags = buffer.readUInt8(4);
    const sessionIdView = buffer.subarray(5, 21);
    const payloadView = buffer.subarray(21);
    return {
        messageType,
        messageLength,
        flags,
        sessionIdView,
        payloadView,
    };
}
```

!!!important ""

    Zero-copy версия быстрее (~10×), но возвращает views, удерживающие весь parent. В JSDoc: вызывающий **обязан** скопировать, если хранит данные дольше текущего scope.

Парсер отдаёт views; потребитель решает: сразу обработать (view) или сохранить (copy).

## Endianness и TypedArray

-   **Big-endian (BE)** — старший байт первым (сетевой порядок). `0x12345678` → `12 34 56 78`.
-   **Little-endian (LE)** — младший первым (x86/ARM). Тот же number → `78 56 34 12`.

`readUInt16BE`, `writeInt32LE` и т.п. — явный порядок байт.

`TypedArray` читает в **native endian** хоста:

```js
const networkBuffer = Buffer.from([0x01, 0x02]);
console.log(networkBuffer.readUInt16BE(0)); // 258

const int16View = new Int16Array(
    networkBuffer.buffer,
    networkBuffer.byteOffset,
    1
);
console.log(int16View[0]); // 513 — неверно (прочитано как LE 0x0201)
```

!!!warning ""

    Для сетевых данных не используйте сырой `TypedArray` без учёта endianness. `Buffer` BE/LE или `DataView` с явным флагом.

```js
const arrayBuffer = new ArrayBuffer(4);
const dataView = new DataView(arrayBuffer);
dataView.setInt32(0, 123456789, false); // false = big-endian
console.log(dataView.getInt32(0, false)); // 123456789
```

## Production-паттерны zero-copy

**Паттерн 1: временный view в синхронной функции**

```js
function processChunk(largeBuffer, offset, length) {
    const view = largeBuffer.subarray(
        offset,
        offset + length
    );
    const result = performComplexCalculation(view);
    return result; // view уходит из scope — безопасно
}
```

**Паттерн 2: защитная копия для async и хранения**

```js
const longLivedCache = new Map();

function processAndCache(dataBuffer) {
    const key = dataBuffer.subarray(0, 16);
    const value = dataBuffer.subarray(16);
    const storedValue = Buffer.from(value);
    longLivedCache.set(key.toString('hex'), storedValue);
}
```

**Паттерн 3: парсер отдаёт views, копирует потребитель**

```js
/**
 * @param {Buffer} buffer
 * @returns {{id: Buffer, body: Buffer}} Views; не хранить без копии.
 */
function parseHeader(buffer) {
    return {
        id: buffer.subarray(0, 8),
        body: buffer.subarray(8),
    };
}

const { id, body } = parseHeader(getMessageFromNetwork());
const savedId = Buffer.from(id);
logBodyPreview(body); // временный view — ок
```

## Отладка утечек через views

1.  Snapshot в стабильном состоянии.
2.  Нагрузка, подозрительная на утечку.
3.  Второй snapshot, третий — для тренда.
4.  Comparison в DevTools: рост числа `Buffer`.

!!!tip ""

    `node --inspect-brk` + Chrome DevTools. Колонка **Retained Size**: мелкий `Buffer` с огромным retained — сигнатура view-утечки. Смотрите retainers / `[[backing_store]]`.

!!!tip ""

    С Node.js 13.9+ отслеживайте `process.memoryUsage().arrayBuffers` — точнее для `Buffer`, чем общий `external`.

При утечке лог-парсера `heapUsed` рос медленно, а `external` и `rss` — взрывом: классика external memory / `Buffer` retention.

## Практики работы с Buffer

-   Профилируйте удержание памяти перед деплоем кода с интенсивными буферами.
-   Views — синхронная временная обработка; копии — долгоживущие, async, коллекции.
-   Документируйте API: возвращаете view — пишите это в JSDoc.
-   Запах: `slice`/`subarray` в поле объекта, module-level переменной, кеше — «а не copy ли нужен?»
-   Zero-copy — не бесплатный буст, а контракт с runtime о жизненном цикле parent.

## Данные профилирования памяти

100 000 объектов из одного буфера 50 MB.

**Сценарий 1: `slice()` (views)**

```js
const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
const views = [];
for (let i = 0; i < 100000; i++) {
    views.push(largeBuffer.slice(0, 10));
}
```

-   `rss`: ~78 MB
-   `heapUsed`: ~8 MB
-   `external`: ~50.5 MB
-   Retained: ~50 MB (весь `largeBuffer`)

**Сценарий 2: стратегическая копия**

```js
const largeBuffer = Buffer.alloc(50 * 1024 * 1024);
const copies = [];
for (let i = 0; i < 100000; i++) {
    copies.push(Buffer.from(largeBuffer.slice(0, 10)));
}
// largeBuffer можно собрать
```

-   `rss`: ~32 MB (после GC)
-   `heapUsed`: ~9 MB
-   `external`: ~1.5 MB
-   100 000 независимых 10-байтных буферов ≈ 1 MB

Views сэкономили CPU в цикле, но удержали 50 MB. Копии чуть дороже по CPU, footprint — на порядки меньше.

!!!note ""

    В Node.js 22+ можно запускать TypeScript с `node --experimental-strip-types` — типы помогают ловить misuse буферов на этапе компиляции.

## Заключение

«Почему не копировать везде?» — инженерный компромисс. Только копии — проще рассуждать, но дороже CPU и RAM на масштабе. Цель — не бояться zero-copy, а **уважать** shared memory: view — обещание runtime, что вы понимаете жизненный цикл view и parent.

Строка `const view = buf.slice(0, 10)` — не синтаксис, а ссылка на гигантский parent. Когда ответ «да, я готов это удерживать» приходит мгновенно — вы освоили семантику памяти `Buffer`.

## Связанное чтение

-   Предыдущая: [Node.js Buffer Allocation (theNodeBook)](https://www.thenodebook.com/buffers/allocation-patterns)
-   Далее: [Node.js Buffer Fragmentation (theNodeBook)](https://www.thenodebook.com/buffers/fragmentation-and-challenges)
-   См. также: [Жизненный цикл процесса Node.js](../node-arch/node-process-lifecycle.md) (external memory и `Buffer`)
