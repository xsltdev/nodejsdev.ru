---
description: Async-итераторы в Node.js — Symbol.asyncIterator, for await...of, async-генераторы, потоки и backpressure
---

# Async-итераторы в Node.js: потоки и backpressure

Источник: [theNodeBook — Node.js Async Iterators: Streams & Backpressure](https://www.thenodebook.com/async-patterns/async-iterators)

Async-итераторы — pull-based асинхронные источники данных. Механика строится вокруг `Symbol.asyncIterator`, `next()` и `for await...of`. Каждый вызов `next()` возвращает промис со следующим результатом `{ value, done }`, поэтому потребитель сам решает, когда запрашивать следующий элемент. Async-генераторы создают async-iterable через `async function*`.

## Async-итераторы в Node.js

Readable-потоки в Node экспонируют async-итерацию: потребление потока идёт через promise-based control flow, но при этом сохраняются буферизация потока и backpressure. Выход из `for await...of` вызывает `return()` у итератора, если метод есть — у потоков появляется путь отмены.

---

## Синхронный протокол, который вы уже знаете

`for...of` работает, потому что объекты реализуют протокол. Вы вызываете у объекта `Symbol.iterator`, и он отдаёт итератор — объект с методом `next()`. Каждый вызов `next()` возвращает `{ value, done }`. Когда `done` равен `true`, цикл останавливается. Массивы, Map, Set, строки, typed arrays — все следуют этому контракту.

```js
const arr = [10, 20, 30];
const iter = arr[Symbol.iterator]();
console.log(iter.next()); // { value: 10, done: false }
console.log(iter.next()); // { value: 20, done: false }
console.log(iter.next()); // { value: 30, done: false }
console.log(iter.next()); // { value: undefined, done: true }
```

Цикл `for...of` — синтаксический сахар над той же последовательностью: получить итератор, вызвать `next()`, проверить `done`, при `false` выполнить тело с `value`, повторить; при `true` — остановиться.

Синхронные итераторы идеальны, когда данные доступны сразу: элементы массива в памяти, записи Map в памяти. Но что с данными, которые приходят со временем? Курсор БД отдаёт строки по сети. HTTP-ответ стримит чанки. Файл читается с диска. Значение недоступно в момент `next()` — оно появится позже, после I/O. Синхронный протокол итерации этого не покрывает: `next()` возвращает `{ value, done }` синхронно, задержке негде жить.

---

## Протокол async-итерации

Async-версия почти зеркалит синхронную, с одним фундаментальным отличием: вместо `Symbol.iterator` — `Symbol.asyncIterator`, а `next()` возвращает не `{ value, done }` напрямую, а **промис**, который резолвится в `{ value, done }`.

```js
const asyncIterable = {
    [Symbol.asyncIterator]() {
        let i = 0;
        return {
            next() {
                if (i < 3)
                    return Promise.resolve({
                        value: i++,
                        done: false,
                    });
                return Promise.resolve({
                    value: undefined,
                    done: true,
                });
            },
        };
    },
};
```

Полный async-iterable: метод `Symbol.asyncIterator` возвращает итератор, у которого `next()` отдаёт промисы с привычной формой `{ value, done }`. Потребитель ждёт каждый промис перед продолжением. Всё остальное — `value`, `done`, механика цикла — то же самое.

Вы пользовались async-iterable с главы о потоках: readable-потоки реализуют `Symbol.asyncIterator`. Каждый `for await...of` по потоку использует этот протокол. Там ввели синтаксис; здесь — сам протокол: как цикл десугарится, как устроена очистка, как строить свои async-iterable и как это устроено внутри Node.js.

---

## for await...of: как десугарится цикл

`for await (const item of source)` выглядит чисто. Под капотом детали важны для обработки ошибок и освобождения ресурсов.

Грубая десугаризация:

```js
const iterator = source[Symbol.asyncIterator]();
let result = await iterator.next();
while (!result.done) {
    const item = result.value;
    // ... тело цикла ...
    result = await iterator.next();
}
```

Получить async-итератор, вызвать `next()`, дождаться промиса. Если `done` — `false`, привязать `value` к переменной цикла, выполнить тело, снова `next()` и `await`. При `done: true` — стоп.

`await` здесь делает то же, что везде в async/await (см. предыдущую подглаву): приостанавливает окружающую async-функцию, планирует продолжение микрозадачей после settlement промиса и возобновляет с того же места. Итерации идут последовательно: один элемент за раз — `next()`, await, тело, снова `next()`. Параллелизма внутри `for await...of` нет. Если тело на элемент тратит 500 ms async-работы и элементов 100, минимум — 50 секунд.

### Когда тело цикла бросает ошибку

Если код внутри цикла бросает исключение, runtime не просто выходит: сначала вызывается `iterator.return()`, если метод есть.

```js
for await (const chunk of readable) {
    if (chunk.length > 1024) {
        throw new Error('chunk too large');
    }
}
```

Throw запускает очистку. `iterator.return()` даёт итератору шанс освободить ресурсы. У readable-потока `return()` вызывает `stream.destroy()`. У async-генератора — срабатывает `finally` в теле генератора. Ошибка уходит наружу — обычно в окружающий `try/catch`.

### break и return

То же поведение. При `break` или `return` из окружающей функции runtime вызывает `iterator.return()`. Итератор очищается. Без этого выход из `for await...of` по потоку оставил бы поток открытым.

```js
async function findFirst(stream) {
    for await (const chunk of stream) {
        if (chunk.includes('target')) return chunk;
    }
    return null;
}
```

При `return chunk` цикл вызывает `return()` у итератора, полученного при старте цикла. Поток уничтожается, дескрипторы закрываются. Утечки нет: `for await...of` оборачивает итерацию в `try/finally` с `return()` в `finally`. Обёртку вы не видите, но она всегда есть.

### Ошибки из next()

Если промис из `next()` отклоняется, отклонение превращается в throw внутри цикла. Обработка — через `try/catch`:

```js
try {
    for await (const event of asyncSource) {
        process(event);
    }
} catch (err) {
    console.error('Source failed:', err.message);
}
```

У readable при событии `error` реализация async-итератора превращает его в rejected promise из `next()`. `for await...of` ловит отклонение и бросает — ваш `catch` подхватывает. Один `try/catch` на ошибки итератора и ошибки в теле цикла — проще, чем вручную вешать `'error'`.

### Временные последствия

Частая ловушка: `for await...of` делает `await` даже для уже resolved промиса. Если итератор возвращает `Promise.resolve(value)`, выполнение всё равно уходит в очередь микрозадач. Каждая итерация — минимум один hop микрозадачи. Для синхронно доступных данных в async-iterable это дороже обычного `for...of`. Для I/O обычно незаметно; для CPU-bound обхода уже готовых данных накопление микрозадач ощутимо.

```js
async function* syncData() {
    yield 1;
    yield 2;
    yield 3;
}
console.log('before');
for await (const n of syncData()) {
    console.log(n);
}
console.log('after');
```

Вывод: `before`, `1`, `2`, `3`, `after` — в таком порядке. Между числами — hop микрозадачи: каждый `await` на уже resolved промисе откладывает продолжение. Самоперепланирующая `queueMicrotask` вставляется между итерациями — hops реальны. Для плотных циклов по синхронным данным — `for...of` с обычным итератором; `for await...of` — для по-настоящему асинхронных источников.

!!!note ""

    Каждый `await` в `for await...of`, даже над `Promise.resolve(...)`, планирует продолжение как микрозадачу. Для синхронных async-iterable это накладные расходы; для потоков и сети — нормальная цена единообразной модели ошибок и очистки.

---

## Async-генераторы

Объект с ручным `Symbol.asyncIterator` и `next()` работает, но многословен. `async function*` — сокращение: функция возвращает `AsyncGenerator`, который сам реализует протокол async-итерации. Вы `yield`-ите значения, потребитель получает их через `next()`, возвращающий промисы.

```js
async function* fetchPages(url) {
    for (let page = 1; ; page++) {
        const res = await fetch(`${url}?page=${page}`);
        const data = await res.json();
        if (data.items.length === 0) return;
        yield data.items;
    }
}
```

Генератор тянет постраничный API: `await` ответа, JSON, проверка пустой страницы, `yield` массива items, `return` при конце. Темп задаёт потребитель:

```js
for await (const items of fetchPages(
    'https://api.example.com/things'
)) {
    for (const item of items) {
        console.log(item.name);
    }
}
```

Каждая итерация внешнего `for await...of` — один `next()` генератора. Генератор бежит до `yield`, отдаёт значение и замирает. Потребитель обрабатывает. Следующий `next()` продолжает с паузы: снова fetch, parse, yield.

### yield и await вместе

Внутри async-генератора `await` и `yield` свободны, но делают разное. `await` ждёт settlement промиса. `yield` ждёт следующего `next()` от потребителя. В `yield await somePromise` сначала резолвится `await`, затем значение уходит потребителю.

На `yield` генератор ждёт потребителя. На `await` — I/O или другую async-операцию. Генератор на `yield` — «жду, когда попросят ещё». На `await` — «жду, когда завершится работа».

Чтение файла построчно с преобразованием:

```js
async function* transformLines(filePath, transform) {
    const handle = await fs.promises.open(filePath, 'r');
    for await (const line of handle.readLines()) {
        const result = await transform(line);
        yield result;
    }
    await handle.close();
}
```

Три точки приостановки: `await fs.promises.open()` при открытии; внутренний `for await...of` ждёт каждую строку; `await transform(line)` — пока transform (HTTP, БД); `yield result` — пока потребитель не вызовет `next()`. Выполнение ходит между I/O и потребителем.

### Делегирование yield\*

Async-генераторы поддерживают `yield*` — делегирование другому async-iterable:

```js
async function* allPages(urls) {
    for (const url of urls) {
        yield* fetchPages(url);
    }
}
```

`yield*` проходит делегированный iterable и отдаёт значения внешнему потребителю. Потребитель видит плоскую последовательность, не зная про несколько источников. `yield*` работает с любым async-iterable, включая readable-потоки.

### Управление генератором снаружи

У `AsyncGenerator` три метода: `next(value)`, `return(value)`, `throw(error)`.

`next(value)` возобновляет генератор с последнего `yield`; переданное значение становится результатом выражения `yield` внутри генератора. `for await...of` всегда зовёт `next()` без аргумента; при ручном шаге значение можно отправить обратно.

`return(value)` принудительно завершает генератор: код уходит в `finally`, генератор done. Промис резолвится в `{ value, done: true }`. Это вызывает `for await...of` при `break` или throw в теле.

`throw(error)` возобновляет генератор, бросая ошибку в точке `yield`. Пойманная внутри — выполнение продолжается; нет — генератор завершается, промис отклоняется.

На практике чаще только `for await...of`. Но при отладке и абстракциях важно: генератор «замолк» — часто неожиданный `return()` от `break` или ошибки с неявной очисткой цикла.

### Очистка через try/finally

При `return()` от потребителя (`break`, ранний `return`, throw в цикле) выполнение прыгает в ближайший `finally`:

```js
async function* readLines(filePath) {
    const handle = await fs.promises.open(filePath, 'r');
    try {
        for await (const line of handle.readLines()) {
            yield line;
        }
    } finally {
        await handle.close();
    }
}
```

`break` из `for await...of` над этим генератором → `return()` → `finally` → дескриптор закрыт. Детерминированно в точке прерывания, а не «когда-нибудь» при GC.

Паттерн «открыть ресурс, try/yield, finally/закрыть» — канон для lifecycle в async-генераторах. Логика очистки рядом с открытием; протокол гарантирует `finally` на любом выходе — причина предпочитать генераторы ручному `Symbol.asyncIterator`.

---

## Как readable-потоки реализуют Symbol.asyncIterator

`Symbol.asyncIterator` у readable появился в Node 10. Реализация в `lib/internal/streams/async_iterator.js` (~200 строк). Задача — согласовать push потока и pull протокола: потребитель зовёт `next()`, когда готов; поток получает данные, когда источник их отдаёт. Async-итератор — мост.

`stream[Symbol.asyncIterator]()` создаёт объект на `ReadableStreamAsyncIteratorPrototype`: ссылка на поток, внутренняя очередь ожидающих чтений. Слушается `'readable'`; для завершения и ошибок — внутренний `finished()` (`'end'`, `'finish'`, `'error'`, `'close'`).

`next()` сначала смотрит буфер потока. Если данные есть — `stream.read()`, `Promise.resolve({ value: chunk, done: false })`. Ждать не нужно; потребитель всё равно пройдёт через microtask hop из-за `await`.

Если буфер пуст — создаётся промис, сохраняются resolve/reject. Итератор ждёт `'readable'`, читает чанк, резолвит `{ value: chunk, done: false }`. `await` в цикле завершается, тело выполняется.

На `'end'` pending `next()` резолвится в `{ value: undefined, done: true }`; дальнейшие `next()` сразу `{ done: true }` — итератор помнит конец.

На `'error'` — reject pending `next()`. Если pending нет, ошибка в очереди: следующий `next()` сразу reject. Ошибки не глотаются.

Внутренние слоты: `kLastResolve` / `kLastReject` — функции pending promise или `null`; `kError` — отложенная ошибка; `kEnded` — поток закончился; `kStream` — readable. Повторный `next()` на errored итераторе — немедленный reject. На ended — `{ done: true }`. `for await...of` держит не больше одного outstanding `next()` — управление resolve/reject простое.

### Backpressure и highWaterMark

Async-итератор тянет по одному чанку через `stream.read()`. После обработки потребитель снова `next()` — ещё один чанк. Последовательный pull уважает backpressure: поток буферизует до `highWaterMark`, итератор сливает по чанку за итерацию. Медленный потребитель (запись в другой поток, HTTP на чанк) не зовёт `read()`, пока не готов — буфер заполняется, источнику говорят остановиться.

Сравните с `readable.on('data', handler)` в flowing mode: поток пушит как может, handler синхронен на каждый чанк; при async-работе в handler поток не ждёт — нужны `pause()` / `resume()`. В `for await...of` backpressure автоматический: чанк только когда потребитель спросил.

Есть тонкая оптимизация: при `for await...of` итератор переводит поток из flowing в paused и читает через `stream.read()`, а не через `'data'`. Буфер может заполняться до `highWaterMark`, но слив — в темпе итератора.

### Освобождение ресурсов

`return()` итератора вызывает `stream.destroy()`. `break` из `for await...of` → `return()` → destroy: дескрипторы, сокеты. Поэтому `for await...of` — предпочтительный способ потребления потоков с очисткой при раннем выходе.

!!!warning ""

    Если вы вручную вызвали `stream[Symbol.asyncIterator]()` и не дошли до конца потока, сами вызовите `return()` на итераторе. Синтаксис `for await...of` делает это за вас; при ручном протоколе забытый `return()` оставляет поток открытым.

Отдельно — `readable.iterator(options)` (Node 16.3+). По умолчанию `return()` уничтожает поток. `readable.iterator({ destroyOnReturn: false })` — итератор без destroy при раннем выходе. У `Symbol.asyncIterator()` аргументов нет — опции только через `readable.iterator()`. Удобно для общего потока или возобновления чтения; очистка на вас.

---

## events.on() и events.once()

В подглаве о внутренностях EventEmitter уже упоминались `events.on()` и `events.once()` как мост между событиями и async-миром. Ниже — как они устроены.

### events.on()

`events.on(emitter, eventName, options)` возвращает async-итератор, который `yield`-ит массивы аргументов события. Каждый `emit` с именем события — новая порция аргументов в цикле:

```js
const { on } = require('events');
const ee = new EventEmitter();

async function consume() {
    for await (const [msg] of on(ee, 'message')) {
        console.log('Got:', msg);
    }
}
```

`ee.emit("message", "hello")` → в цикле `["hello"]`; деструктуризация `[msg]` берёт первый аргумент.

Внутри регистрируется listener. При событии аргументы кладутся в FIFO-очередь. Если ждёт pending `next()` — сразу resolve. Если потребитель ещё обрабатывает прошлое событие — значение ждёт в очереди до следующего `next()`.

!!!warning ""

    У `events.on()` нет встроенного backpressure. Emitter шлёт события синхронно (см. подглаву о EventEmitter), listener наполняет очередь, потребитель сливает асинхронно. Медленный потребитель (запись в БД на событие) при 1000 событий/с от emitter — рост очереди ~1000 записей/с, память линейно. Нет `highWaterMark`, pause, flow control. Для высокого throughput нужна явная буферизация или поток с backpressure.

### Обработка ошибок в events.on()

По умолчанию `'error'` на emitter превращает async-итератор в throw — reject из `next()`, ловится `try/catch`:

```js
try {
    for await (const [data] of on(stream, 'data')) {
        process(data);
    }
} catch (err) {
    console.error('Stream error:', err);
}
```

В `close` опциях можно указать события завершения. Без них итератор бесконечен (пока error или `break`). `close: ['end', 'finish']` — итератор завершается с `{ done: true }` при `'end'` или `'finish'`.

```js
const iter = on(emitter, 'data', {
    close: ['end', 'finish'],
});
```

### Поддержка AbortSignal

`events.on()` принимает `AbortSignal` для внешней отмены:

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 5000);

for await (const [msg] of on(ee, 'message', {
    signal: ac.signal,
})) {
    console.log(msg);
}
```

При abort — `AbortError`, выход из цикла, очистка. Listener снимается с emitter — нет утечки слушателей.

### events.once()

`events.once(emitter, eventName, options)` — промис с массивом аргументов при первом срабатывании события:

```js
const { once } = require('events');
const server = require('http').createServer();

server.listen(3000);
await once(server, 'listening');
console.log('Server is up');
```

`'error'` до целевого события — reject промиса. Abort до события — `AbortError`.

Это promise-аналог `emitter.once(eventName, listener)` без ручной обёртки в `new Promise()` и с учётом `'error'`.

`once()` — одноразовые lifecycle-события (listening, connect, exit). `on()` — непрерывный поток (запросы, сообщения, чанки). Дополняют друг друга.

---

## Собственные async-iterable

Иногда нужен async-iterable не из потока и не из EventEmitter: обёртка callback API, очередь producer/consumer, свой pipeline.

### Ручная реализация

Коротко: объект с `Symbol.asyncIterator`, итератор с `next()`, опционально `return()` и `throw()`:

```js
function createCounter(limit, delay) {
    let count = 0;
    return {
        [Symbol.asyncIterator]() {
            return {
                async next() {
                    await new Promise((r) =>
                        setTimeout(r, delay)
                    );
                    if (count < limit)
                        return {
                            value: count++,
                            done: false,
                        };
                    return { value: undefined, done: true };
                },
            };
        },
    };
}
```

`async next()` сам возвращает промис. Потребление: `for await (const n of createCounter(5, 100))`.

### Обёртка callback-based API

Async-генераторы хорошо оборачивают callback API в pull-модель. Курсор БД по одной записи:

```js
async function* iterateCursor(cursor) {
    try {
        while (true) {
            const rec = await new Promise((res, rej) =>
                cursor.next((e, r) => (e ? rej(e) : res(r)))
            );
            if (!rec) return;
            yield rec;
        }
    } finally {
        cursor.close();
    }
}
```

Каждый callback — промис, `await`, `yield`. `try/finally` закрывает курсор при полном обходе и при раннем `break`. Типичный адаптер legacy API к async-итерации.

### Очередь как async-iterable

Гибкий паттерн — очередь с отдельным producer и consumer: producer пушит, consumer тянет через `for await...of`. Вопросы: push без ждущего consumer? `next()` без данных?

Producer-сторона:

```js
function createQueue() {
    const values = [];
    const waiters = [];
    let done = false;
    return {
        push(v) {
            if (waiters.length) waiters.shift()(v);
            else values.push(v);
        },
        end() {
            done = true;
            while (waiters.length) waiters.shift()(null);
        },
        [Symbol.asyncIterator]() {
            return { next: () => pull() };
        },
    };

    function pull() {
        if (values.length)
            return Promise.resolve({
                value: values.shift(),
                done: false,
            });
        if (done)
            return Promise.resolve({
                value: undefined,
                done: true,
            });
        return new Promise((resolve) =>
            waiters.push((v) =>
                resolve(
                    v === null
                        ? { done: true, value: undefined }
                        : { value: v, done: false }
                )
            )
        );
    }
}
```

`values` — буфер от producer. `waiters` — resolve функции consumer, когда данных нет. `push`: если ждёт consumer — сразу resolve; иначе в очередь. `pull`: есть value — сразу; иначе промис в `waiters`.

Классический rendezvous: стороны совпали по времени — данные идут напрямую; иначе быстрая сторона буферизует.

!!!note ""

    В простой версии нет backpressure: 10 000 `push()` до старта consumer — 10 000 элементов в памяти. Для конечных источников часто терпимо; для бесконечного потока нужен лимит буфера и сигнал producer замедлиться — как `writable.write()` возвращает `false` при переполнении `highWaterMark` у потоков.

Практика: `push()` возвращает boolean «буфер ниже порога»; producer отступает при `false`.

### Когда генератор, когда ручная реализация

Async-генераторы — выбор в ~90% случаев: `try/finally`, читаемость, протокол из коробки.

Ручной `Symbol.asyncIterator` — тонкий контроль над промисами (сразу resolved `next()` без лишних microtask hops), нестандартный `return()`/`throw()`, максимально лёгкий примитив библиотеки.

Очередь — частый случай ручной реализации: producer и consumer разнесены по модулям и времени. Генератор предполагает одну функцию и producer, и consumer; очередь явно разделяет `push()` и `for await...of`.

---

## Паттерны и практические соображения

### Pipeline из async-генераторов

Генераторы складываются в цепочки преобразований: вход — async-iterable, выход — преобразованные значения.

```js
async function* map(source, fn) {
    for await (const item of source) {
        yield fn(item);
    }
}
async function* filter(source, predicate) {
    for await (const item of source) {
        if (predicate(item)) yield item;
    }
}
```

Цепочка: `filter(map(source, transform), predicate)`. Pull на каждой ступени — через pipeline одновременно течёт один элемент (плюс внутренние буферы реализаций). Ленивость: работа только когда финальный потребитель запросил значение.

### stream.pipeline() с async-генераторами

С Node 13 `stream.pipeline()` (глава о потоках) принимает async-генераторы как transform-стадии:

```js
const { pipeline } = require('stream/promises');
await pipeline(
    fs.createReadStream('input.txt'),
    async function* (source) {
        for await (const chunk of source) {
            yield chunk.toString().toUpperCase();
        }
    },
    fs.createWriteStream('output.txt')
);
```

Read → генератор → write. Backpressure через все стадии: полный буфер write → пауза на `yield` → пауза `next()` у read. Без subclass Transform и `_transform()` — для простых map-ов меньше церемоний.

Ошибка на любой стадии рвёт pipeline: destroy read/write, `return()` у генератора → `finally`.

### Последовательность for-await-of

`for await...of` обрабатывает по одному элементу. Параллелизма в протоколе нет: один промис из `next()`, await, обработка, снова `next()`.

Параллель нужно строить вручную. Паттерн батчей + `Promise.all()`:

```js
async function processBatched(source, batchSize, fn) {
    let batch = [];
    for await (const item of source) {
        batch.push(fn(item));
        if (batch.length >= batchSize) {
            await Promise.all(batch);
            batch = [];
        }
    }
    if (batch.length > 0) await Promise.all(batch);
}
```

До `batchSize` промисов параллельно, батчи последовательны — компромисс между serial и неограниченной concurrency.

### Память с events.on()

Как выше: внутренняя буферизация без лимита. Медленный async-потребитель + быстрый emitter — рост памяти без warning и без `highWaterMark`.

Для умеренных rate (HTTP, сокет с естественным I/O) обычно ок. Для синтетики (таймеры, tight loop `emit`) — риск раздувания очереди.

Альтернатива: readable + `for await...of` (backpressure) или bounded-очередь с flow control из раздела выше.

### Async-итерация как общая абстракция

Потоки, EventEmitter, курсоры БД, пагинация API, построчное чтение файла, WebSocket — всё можно есть через `for await...of`, если есть `Symbol.asyncIterator`. Единая модель ошибок (reject → throw), очистки (`return()` при раннем выходе), темпа (один элемент за раз).

### for await...of с несинхронными iterable

По спецификации `for await...of` работает и с обычными sync-iterable: есть `Symbol.iterator`, нет `Symbol.asyncIterator` — цикл оборачивает каждый `{ value, done }` в `Promise.resolve()`. `for await (const item of [1, 2, 3])` работает; каждый шаг — await, промисы в `value` резолвятся до тела.

Редко оправдано: лишний microtask hop на итерацию. Иногда удобно для **последовательной** обработки массива уже созданных промисов:

```js
const urls = ['https://a.com', 'https://b.com'];
const promises = urls.map((url) => fetch(url));
for await (const response of promises) {
    console.log(response.status);
}
```

Второй `await` не начнётся, пока не завершится первый — как `await promises[0]; await promises[1]`. Параллель — `Promise.all()` (следующая подглава).

Композиция: async-генераторы и потребляют, и производят async-iterable — кирпичи pipeline. Генератор читает поток, transform, yield; следующий фильтрует; `stream.pipeline()` связывает с backpressure и ошибками. Кастомный async-iterable на специальный случай — порядка 20 строк; очередь выше — шаблон producer/consumer.

Async-итерация — pull-ответ на push EventEmitter. Emitter: «вот данные, разбирайся». Итерация: «дай, когда готов». Высокий throughput с flow control — pull. Fire-and-forget, где каждый listener реагирует сразу — push. `events.on()` — мост push → pull с оговоркой: при отстающем consumer буфер растёт без границы.

---

## Связанное чтение

-   Предыдущая: [Внутренности EventEmitter в Node.js](eventemitter-internals.md)
-   Далее: [Комбинаторы промисов: all, allSettled, race, any](promise-combinators.md)
