---
description: Комбинаторы промисов в Node.js — Promise.all, allSettled, race, any, ограничение параллелизма, retry, таймауты и AbortController
---

# Комбинаторы промисов в Node.js: all, allSettled, race, any и ограничение параллелизма

Источник: [theNodeBook — Promise Combinators](https://www.thenodebook.com/async-patterns/promise-combinators)

Комбинаторы промисов координируют несколько промисов в один результирующий. Разбираются `Promise.all()`, `Promise.allSettled()`, `Promise.race()` и `Promise.any()`. В Node.js их используют для параллельного I/O, гонок с таймаутом, fan-out запросов, отчётов о частичных сбоях и очередей работы с ограниченным параллелизмом.

## Комбинаторы промисов в Node.js

Встроенные API координируют результаты. `Promise.all()` отклоняется при первом rejection. `allSettled()` ждёт завершения каждого входа. `race()` следует за первым settled входом. `any()` — за первым fulfillment или отклоняется с `AggregateError`, если отклонились все входы. Отмена и лимиты параллелизма требуют явного abort или планирования вне комбинатора.

Один промис управляем. Вы await-ите его, получаете значение, идёте дальше. В продакшене почти никогда не так. Три микросервиса параллельно, пять файлов сразу, HTTP-вызов против таймаута. Комбинаторы — `Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any` — задают, как несколько одновременных промисов сливаются в один. У каждого своя семантика распространения ошибок, short-circuit и агрегации результатов. Неверный выбор — либо проглоченные ошибки, которые надо было поймать, либо преждевременный выход из операций, которые стоило дождаться.

---

## Promise.all()

`Promise.all()` принимает итерируемое промисов и возвращает один промис, который выполняется массивом их результатов. Все входы должны fulfill, чтобы общий промис fulfill. Если любой вход reject, общий промис сразу reject с этой причиной.

```js
const [user, posts, settings] = await Promise.all([
    fetchUser(id),
    fetchPosts(id),
    fetchSettings(id),
]);
```

Три запроса стартуют параллельно. Общий промис resolve, когда все трое завершены. Массив результатов сохраняет порядок входа — `user` соответствует `fetchUser(id)`, `posts` — `fetchPosts(id)` и т.д., независимо от того, какой HTTP-вызов закончился первым.

Short-circuit быстрый. Если `fetchPosts(id)` reject через 50 ms, пока два других ещё в полёте, общий промис сразу reject с ошибкой posts. Остальные два запроса продолжают работать. Промисы eager — после старта они идут до конца операции или явной отмены. Их результаты отбрасываются, потому что общий промис уже settled. Если `fetchUser` завершится через 200 ms, потребителя результата нет.

Практическое следствие — расход ресурсов. Если запустить 100 запросов через `Promise.all()` и первый reject через 10 ms, 99 HTTP-соединений всё ещё открыты, работают, едят память. Общий промис settled, а базовые операции не остановились. Для операций с отменой (например `fetch()` с `AbortSignal`) отмену нужно провести самим.

Пустое итерируемое возвращает уже fulfilled промис. `Promise.all([])` даёт промис, fulfilled с `[]`. Обработчики через `.then()` всё равно проходят очередь promise jobs. Уже fulfilled состояние полезно как базовый случай в рекурсивных и накопительных паттернах.

Не-промисы во входе оборачиваются в `Promise.resolve()`. `Promise.all([1, fetch('/api'), 'hello'])` работает — `1` и `'hello'` resolve сразу, общий промис ждёт только fetch.

```js
const files = ['a.txt', 'b.txt', 'c.txt'];
const contents = await Promise.all(
    files.map((f) => fs.promises.readFile(f, 'utf8'))
);
```

Три файла читаются параллельно. Если любого нет, всё reject. Для этого сценария обычно так и нужно — отсутствующий файл значит, что операция не может продолжаться.

Когда использовать `Promise.all()`: нужен каждый результат и любой сбой делает всю операцию недействительной. Параллельные запросы к БД, где частичный результат бессмысленен. Загрузка нескольких конфигов, где все обязаны быть. Ресурсы для рендера страницы, без одного страница не рендерится.

Тонкость порядка: `Promise.all()` итерирует вход **синхронно**, вешая обработчики `.then()` на каждый промис в этом цикле. Не-промисы оборачиваются в `Promise.resolve()` во время итерации. Синхронная итерация фиксирует порядок входа до асинхронной работы. Массив результатов предварительно нужной длины; каждый resolve-обработчик знает свой индекс. Даже если промис с индексом 4 fulfill раньше, чем с индексом 0, значение попадает в позицию 4.

Практический паттерн в проде: массив промисов создают отдельно от вызова `Promise.all()`.

```js
const promises = [
    fetchUser(id),
    fetchPosts(id),
    fetchSettings(id),
];
// Все три запроса уже в полёте
const [user, posts, settings] = await Promise.all(promises);
```

Три fetch стартуют в момент вызова — они уже «гонятся», когда `Promise.all()` их видит. `Promise.all()` только собирает результаты; работу он не инициирует. Это важно при отладке тайминга. Если `fetchUser` — 500 ms, `fetchPosts` — 100 ms, `fetchSettings` — 200 ms, время `Promise.all()` ~500 ms (самый медленный), потому что все три стартовали одновременно при создании массива.

Режим сбоя: `Promise.all()` reject с **первой** причиной rejection. Если три из пяти reject, видна только первая. Остальные две причины отбрасываются. Нужны все сбои — берите `Promise.allSettled()`.

---

## Promise.allSettled()

`Promise.allSettled()` ждёт, пока каждый входной промис settle — fulfilled или rejected — и возвращает промис, который **всегда** fulfill. Он никогда не reject. Результат — массив дескрипторов settlement, по одному на вход.

```js
const results = await Promise.allSettled([
    fetchUser(id),
    fetchPosts(id),
    fetchSettings(id),
]);
```

Каждый элемент `results` — либо `{ status: 'fulfilled', value: ... }`, либо `{ status: 'rejected', reason: ... }`. Каждый разбирают отдельно:

```js
for (const r of results) {
    if (r.status === 'fulfilled') handleData(r.value);
    else logError(r.reason);
}
```

Внешний промис не short-circuit. Если `fetchPosts` reject через 50 ms, `Promise.allSettled()` всё равно ждёт `fetchUser` и `fetchSettings`. У каждого входа полный шанс завершиться.

Комбинатор для сценариев частичного успеха. Health check: пять сервисов — какие ответили, какие нет. Batch: 100 вставок — какие прошли, какие нет. Прогрев кэша: 20 страниц, часть может 404 — это нормально. Паттерн один: fan-out, собрать всё, обработать каждый результат.

Формат результата привыкают. Нельзя деструктурировать сразу в значения, как с `Promise.all()`. Сначала смотрят `status`. Частая утилита:

```js
const fulfilled = results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
```

Так извлекают только успешные значения. Аналогичный фильтр для rejected — если нужны ошибки.

Именование: «settled» — fulfilled или rejected. Промис «pending», пока не settle. `allSettled` ждёт выхода из pending у каждого, независимо от исхода.

`allSettled` добавили в ES2020. Раньше обходили обёрткой `.then()` и `.catch()`, оба возвращающими объекты статуса:

```js
function reflect(p) {
    return p.then(
        (v) => ({ status: 'fulfilled', value: v }),
        (e) => ({ status: 'rejected', reason: e })
    );
}
```

Тогда `Promise.all(promises.map(reflect))` давал ту же форму. В старом коде паттерн ещё встречается. Встроенный `allSettled` заменил его и даёт движку оптимизировать API.

Нюанс: внешний промис от `allSettled` всегда fulfill. Нет условия, при котором он reject. Даже если каждый вход reject, `allSettled` resolve с массивом дескрипторов rejection. Значит `await Promise.allSettled(...)` без try/catch всегда «успешен». Но результаты всё равно нужно смотреть — тихие сбои хуже громких. Типичное продолжение:

```js
const failed = results.filter(
    (r) => r.status === 'rejected'
);
if (failed.length > 0) {
    logger.warn(
        `${failed.length} operations failed`,
        failed.map((r) => r.reason)
    );
}
```

Сбои логируют без throw. Вызывающий решает, какая доля отказов допустима. Для прогрева кэша 1 из 10 может быть ок. Для платёжного batch любой сбой может требовать эскалации.

---

## Promise.race()

`Promise.race()` settle вместе с **первым** входным промисом, который settle. Если первый завершившийся fulfill — race fulfill. Если reject — race reject. Результирующий промис принимает исход первого settled.

```js
const result = await Promise.race([
    fetch('/api/data'),
    timeout(5000),
]);
```

Главный сценарий — таймаут. Реальная операция и таймер. Кто первый — тот задаёт исход. `timeout` обычно reject после задержки:

```js
function timeout(ms) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), ms)
    );
}
```

Если `fetch()` вернулся за 200 ms, race fulfill с ответом. Если первыми прошли 5000 ms, race reject с ошибкой таймаута. Но fetch всё ещё идёт. `Promise.race()` settle результат и не трогает остальные операции. HTTP-запрос в фоне, тратит bandwidth, eventually resolve, потребителя нет. Промис fetch settle, reaction job выполняется, уже settled race игнорирует исход.

`Promise.race([])` с пустым итерируемым возвращает промис, который **никогда** не settle. Висит pending вечно. Ловит код, собирающий вход в runtime. Отфильтровали всё — ноль промисов — race зависает.

У race есть тонкость с rejection. Быстрый reject против медленного fulfill — получите rejection. Важно для fallback: если одна «опция» сразу падает, race отдаёт сбой, хотя другая опция успела бы через 100 ms. Для fallback чаще нужен `Promise.any()`.

Ещё паттерн race — примитив для polling. Проверить статус ресурса, но через 5 с перепроверить, если текущая проверка медленная:

```js
async function pollWithRefresh(checkFn, intervalMs) {
    while (true) {
        const result = await Promise.race([
            checkFn(),
            new Promise((r) =>
                setTimeout(() => r('timeout'), intervalMs)
            ),
        ]);
        if (result !== 'timeout') return result;
    }
}
```

Каждая итерация гоняет проверку с таймером. Проверка первой — возврат результата. Таймер первым — новая проверка. Старая всё ещё идёт, но ссылка на тот промис потеряна; итог игнорируется. Паттерн даёт периодические попытки, даже если прошлые проверки ещё в полёте — только вокруг операций с ограниченным runtime или явной отменой.

!!!warning ""

    Опасность `Promise.race()` — накопление памяти. Каждый «проигравший» промис живёт, пока не settle. В плотном цикле с долгими промисами копятся pending: замыкания, reaction callbacks, буферы. Для коротких гонок с таймаутом в несколько секунд это неважно. Для долгих циклов — отслеживайте outstanding-промисы и думайте об отмене.

---

## Promise.any()

`Promise.any()` resolve с **первым** промисом, который **fulfill**. Rejection игнорируются, пока не reject **все** входы. Тогда бросается `AggregateError` — подкласс `Error` с массивом `.errors` всех причин rejection.

```js
async function fetchOk(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
}
```

Сырой `fetch()` fulfill, когда пришли заголовки, включая HTTP 404 и 503. Для CDN fallback HTTP-ошибки обычно считают неудачной попыткой — обёртка проверяет `response.ok`.

```js
const response = await Promise.any([
    fetchOk('https://cdn-a.example.com/data'),
    fetchOk('https://cdn-b.example.com/data'),
    fetchOk('https://cdn-c.example.com/data'),
]);
```

Три зеркала CDN. Побеждает первый приемлемый ответ. CDN-A отдал 503, CDN-B таймаут, CDN-C — 200: общий промис resolve с ответом C. Rejection от A и B поглощает `Promise.any()`.

Если все трое reject:

```js
try {
    await Promise.any(mirrors.map((m) => fetchOk(m)));
} catch (err) {
    console.log(err instanceof AggregateError); // true
    console.log(err.errors.length); // 3
    console.log(err.errors[0].message); // первая причина rejection
}
```

`AggregateError` — подкласс `Error`. Свойство `.errors` — обычный массив объектов ошибок. Его можно итерировать, map, filter — что нужно. `message` у самого `AggregateError` общее («All promises were rejected»), диагностика — в элементах `.errors`.

Различие `Promise.race()` и `Promise.any()`: что считается «победой». Race: первый settle (fulfill или reject). Any: первый fulfill (rejection не считаются). Race — про скорость. Any — про успех.

`Promise.any()` добавили в ES2021 — самый новый из четырёх. Раньше обходили инверсией через `Promise.all()`: map каждого промиса reject при успехе и resolve при ошибке, `Promise.all()` (теперь reject при первом исходном успехе), потом инверсия обратно. Обход скрывает условие успеха и легко реализуется неверно. Встроенный API формулирует намерение прямо.

Класс `AggregateError` стоит разобрать. Расширяет `Error`, добавляет `.errors` — массив. По умолчанию `message` — «All promises were rejected», но можно задать своё:

```js
throw new AggregateError(
    [new Error('CDN-A down'), new Error('CDN-B timeout')],
    'All CDNs failed'
);
```

`AggregateError` полезен и в своём коде, когда падает несколько независимых операций и нужно отчитаться обо всех сразу. Это общий контейнер ошибок, не только для `Promise.any()`. Библиотеки могут бросать его из retry, валидации, batch.

| Комбинатор | Resolve когда | Reject когда | Short-circuit | Пустой вход |
| --- | --- | --- | --- | --- |
| all | Все fulfill | Любой reject | При первом rejection | Resolve `[]` |
| allSettled | Все settle | Никогда | Нет | Resolve `[]` |
| race | Первый settle | Первый settle (если rejection) | При первом settlement | Pending навсегда |
| any | Первый fulfill | Все reject | При первом fulfillment | Reject (`AggregateError`) |

---

## Как V8 реализует Promise.all

С API комбинаторы выглядят просто. Под капотом V8 реализует их как built-in с аккуратным учётом состояния.

Спецификация ECMAScript описывает `Promise.all()` абстрактной операцией `PerformPromiseAll`. V8 реализует алгоритм нативным runtime-кодом. Движок итерирует вход, разрешает каждый элемент через promise-resolve функцию конструктора и вешает resolve/reject реакции с той же наблюдаемой семантикой, что у `.then()`. Нативные промисы идут по оптимизированным путям, но timing и ошибки для кода остаются по спецификации.

Центральный механизм — **счётчик оставшихся элементов**. В спецификации счётчик стартует с 1 как sentinel, увеличивается на каждый вход и после итерации уменьшается ещё раз — для пустого входа. V8 хранит общее состояние в контексте promise-all resolve-element: счётчик, result capability, массив значений, индекс каждой resolve-element функции.

Когда входной промис fulfill, срабатывает resolve-реакция. Колбэк: кладёт значение в нужный индекс массива результатов, уменьшает счётчик, при нуле resolve общий промис массивом. Индекс — почему порядок совпадает с входом: каждый колбэк знает позицию.

Путь short-circuit при rejection проще. У каждого входа reject-реакция ведёт в reject capability общего промиса. Первый rejection отклоняет общий промис с этой причиной. После settlement повторные resolve/reject — no-op по спецификации. Когда остальные входы eventually settle, их колбэки всё равно бегут, decrement происходит, но вызовы resolve/reject уже settled общего промиса молча игнорируются.

Реакции вешаются при синхронной итерации и держат ссылки на общий контекст (массив, счётчик, capabilities). Аллокации живут после short-circuit rejection. `Promise.all()` на 10 000 промисов и reject первого сразу — у остальных реакции всё ещё attached. Они eventually срабатывают; вызовы в уже rejected результат — no-op; GC забирает общее состояние, когда реакции отпустят ссылки.

`Promise.allSettled()` структурно то же с двумя отличиями. Resolve-реакция оборачивает значение в `{ status: 'fulfilled', value }` перед записью. Reject-реакция **тоже** decrement и пишет `{ status: 'rejected', reason }` вместо short-circuit. И fulfillment, и rejection считаются в завершение. Общий промис resolve (никогда reject) при нуле счётчика.

`Promise.race()` хранит меньше агрегата. V8 итерирует вход и вешает реакции, пробрасывающие fulfillment или rejection в settlement функции результата. Побеждает первый settled вход. Нет массива результатов, счётчика и индексной книги для финального вывода.

`Promise.any()` сложнее race: нужно учитывать rejection. V8 аллоцирует массив ошибок и счётчик (как у `Promise.all()`). Reject-реакция каждого входа кладёт причину в нужный индекс и decrement. Ноль — `AggregateError` из массива и reject общего промиса. Resolve-реакция ведёт в resolve capability — первый fulfillment побеждает, как в race.

Память на комбинатор зависит от числа входов. `Promise.all()` и `Promise.allSettled()` — O(n) хранение результата и состояние реакций на вход. `Promise.race()` — реакции без массива результатов. `Promise.any()` — хранение rejection для `AggregateError`, если все reject. Для типичных 5–50 промисов overhead мал. На 10 000+ входов учёт существует до settlement агрегата.

В исходниках V8 это `src/builtins/promise-all.tq`, `promise-all-element-closure.tq`, `promise-race.tq`, `promise-any.tq` (Torque, внутренний язык V8, компилируется в CSA — CodeStubAssembler). Torque читабельнее сырого CSA, но далёк от JavaScript. Суть: комбинаторы — built-in реализации алгоритмов спецификации с нативными fast path, где V8 доказывает стандартные входы и конструктор.

---

## Ограничение параллелизма

Задача: 500 URL для fetch:

```js
const results = await Promise.all(
    urls.map((url) => fetch(url))
);
```

Все 500 запросов одновременно. Сервер открывает 500 TCP-соединений, упирается в file descriptors, перегружает API, получает 429. `Promise.all()` хорош для параллелизма, но не знает лимита concurrency.

Решение — limiter. Не больше N операций одновременно. Одна завершилась — стартует следующая из очереди.

```js
async function pMap(items, fn, concurrency) {
    if (concurrency < 1)
        throw new RangeError('concurrency must be >= 1');
    const results = new Array(items.length);
    let i = 0;
    async function worker() {
        while (i < items.length) {
            const idx = i++;
            results[idx] = await fn(items[idx], idx);
        }
    }
    await Promise.all(
        Array.from({ length: concurrency }, worker)
    );
    return results;
}
```

Стартуют `concurrency` воркеров. Каждый берёт следующий элемент из общего счётчика индекса, вызывает `fn`, пишет результат в `idx`, крутится в цикле. Когда элементы кончились, воркеры выходят. `Promise.all()` ждёт всех воркеров. Порядок в массиве сохраняется. Если воркер бросает, простая версия быстро reject; в проде решайте, как отменять или дожимать оставшуюся работу.

`i++` здесь «атомарен», хотя JavaScript однопоточен: два воркера не гонятся за инкрементом, потому что `await fn(...)` отдаёт event loop, и после resume в момент времени один воркер. Совместная мутация счётчика работает из-за кооперативной модели — yield явный, между yield эксклюзивный доступ.

Использование:

```js
const responses = await pMap(urls, (url) => fetch(url), 10);
```

Не больше 10 одновременных fetch. Один завершился — стартует следующий URL. Время примерно `(urls.length / concurrency) * averageLatency`, а не `averageLatency` при безлимитном параллелизме и не `urls.length * averageLatency` при полной сериализации.

Это паттерн **worker pool**. Фиксированное число воркеров (consumers) тянут задачи из общего источника (счётчик индекса), пока работа не кончится. Граница concurrency — число воркеров, не OS-level lock. В Node не нужны пулы потоков ОС: concurrency кооперативно через промисы.

Библиотеки `p-limit` и `p-map` (sindresorhus) упаковывают паттерн с опциями ошибок, прогрессом, `AbortSignal`. В проде чаще берут их, если нет особых требований к ошибкам или порядку.

Альтернатива в стиле `p-limit` — функция, возвращающая обёртку с лимитом:

```js
function pLimit(concurrency) {
    let active = 0;
    const queue = [];
    const next = () => {
        if (active >= concurrency || queue.length === 0)
            return;
        active++;
        queue.shift()();
    };
    return (fn) =>
        new Promise((resolve, reject) => {
            queue.push(() =>
                Promise.resolve()
                    .then(fn)
                    .then(resolve, reject)
                    .finally(() => {
                        active--;
                        next();
                    })
            );
            next();
        });
}
```

Limiter считает активные выполнения. `limit(fn)` ставит функцию в очередь. Есть слот (`active < concurrency`) — запуск сразу. По завершении `active--` и стартует следующая из очереди. `Promise.resolve().then(fn)` превращает sync throw и не-promise возврат в исход промиса. Это **counting semaphore**: `active` — permits, `queue` — waitlist, `next()` — acquire, `finally` — release. Имя от статьи Dijkstra 1965. Гибче worker pool: один limiter на разные типы операций, каждый вызов — промис конкретной операции.

Разница worker pool (`pMap`) и limiter (`pLimit`) — область. Pool над фиксированной коллекцией: 500 URL, concurrency 10. Limiter — долгоживущий объект на весь процесс: `const dbLimit = pLimit(20)` для всех запросов к БД. Ограничение одно; pool batch-oriented, limiter request-oriented.

Когда нужен лимит параллелизма:

-   **Rate limit API.** Сторонние API режут запросы в секунду. Превышение — 429.
-   **Пулы соединений БД.** Типично 10–50 соединений. 500 запросов исчерпывают пул — всё ждёт.
-   **Лимит file descriptors.** `ulimit -n` часто 1024 (см. главу 4). Каждый сокет — descriptor.
-   **Память.** Каждый in-flight HTTP держит буферы тела запроса и ответа. 500 крупных загрузок могут съесть RAM.

---

## Retry с экспоненциальным backoff

Сетевые запросы падают транзиентно: 503, reset соединения, DNS timeout. Сервер секунду был занят — сейчас ок. Ответ: подождать и повторить.

Наивный retry сразу после сбоя создаёт проблему. Сервер перегружен, 1000 клиентов retry одновременно — нагрузка удваивается. От «тяжело» к «лежит».

Экспоненциальный backoff размазывает retry во времени. Задержка растёт:

```
retry 0: wait 1000ms
retry 1: wait 2000ms
retry 2: wait 4000ms
retry 3: wait 8000ms
```

Формула: `delay = baseDelay * 2^retryIndex`. База часто 100–1000 ms. Первый retry: `baseDelay * 2^0`, второй — вдвое дольше и т.д. Каждый retry ждёт в два раза дольше предыдущего — меньше давления на падающий сервис.

У чистого экспоненциального backoff своя проблема — **thundering herd**. 1000 клиентов с одной базой retry синхронно: t=0 все, t=1s все снова, t≈3s снова пик, если запрос сразу падает. Retry синхронизированы.

**Jitter** добавляет случайность:

```js
async function retry(
    fn,
    {
        maxRetries = 3,
        baseMs = 1000,
        shouldRetry = () => true,
    } = {}
) {
    for (
        let attempt = 0;
        attempt <= maxRetries;
        attempt++
    ) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === maxRetries || !shouldRetry(err))
                throw err;
            const jitter =
                baseMs *
                2 ** attempt *
                (0.5 + Math.random() * 0.5);
            await new Promise((r) => setTimeout(r, jitter));
        }
    }
}
```

Jitter размазывает задержку между 50% и 100% от backoff. В блоге AWS это «equal jitter» — половина детерминирована (пол 0.5), половина случайна. Вместо 1000 клиентов ровно в t=1s — окно 500–1000 ms. Нагрузка — плавный ramp, не синхронные пики. «Full jitter» AWS — случайность от 0 до max (`random_between(0, base * 2^attempt)`): шире окно, иногда очень короткие задержки.

Для fetch явно обрабатывайте HTTP-статусы:

```js
async function fetchJson(url, options) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const err = new Error(`HTTP ${res.status}`);
        err.status = res.status;
        throw err;
    }
    return res.json();
}
```

Использование:

```js
const data = await retry(() => fetchJson('/api/data'));
```

Когда retry:

Повторяйте транзиентные сбои: ECONNRESET, 503, 429 (уважайте `Retry-After`), DNS, socket timeout. У `fetch()` статус HTTP нужно проверять через `response.ok`; сырой промис fulfill и для 429, и для 503.

Не повторяйте постоянные: 400 (данные неверны), 401/403 (учётные данные не изменятся), 404, 422. Retry тратит время и bandwidth.

Граница: лимит попыток. Обычно 3–5. Дальше сбой, скорее всего, постоянный. В проде ещё считают failure rate и circuit breaker (глава 29) — при стабильных сбоях dependency перестают долбить и fail fast.

Уточнённый retry с предикатом:

```js
const data = await retry(() => fetchJson('/api/data'), {
    shouldRetry: (err) =>
        err.status === 503 || err.code === 'ECONNRESET',
});
```

Предикат решает, транзиентен ли сбой. Не «retry всего», а выборочно.

Retry и идемпотентность. Retry POST, создающего ресурс, может дать дубликаты: первый запрос успел на сервере, ответ потерялся по сети, retry создаёт снова. Для мутаций — идемпотентность (client idempotency key) или retry только GET/read. Общая тема распределённых систем; с retry в HTTP-клиенте всплывает сразу.

---

## Таймаут и отмена

Паттерн таймаута с `Promise.race()` оставляет дыру в ресурсах: операция идёт после таймаута. Вызывающему сказали «таймаут», а HTTP, запрос к БД, чтение файла продолжаются.

```js
const result = await Promise.race([
    fetch('/api/slow-endpoint'),
    timeout(3000),
]);
```

Таймаут на 3 с — fetch всё ещё идёт. TCP, bandwidth, ответ без читателя. Для одного запроса расточительно. Для тысяч concurrent timeout — утечка ресурсов.

`AbortController` — стандартная отмена. Сигнал передают в операции с поддержкой отмены. `controller.abort()` — cooperating операции останавливаются.

```js
async function fetchWithTimeout(url, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, {
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }
}
```

`fetch()` нативно поддерживает `AbortSignal`. При `abort()` Node прерывает fetch и reject с `AbortError`. Запрос перестаёт приносить полезную работу.

`finally` снимает таймер, если fetch успел раньше. Иначе таймер сработает после завершения и вызовет `abort()` на уже settled операции — безвредно, но таймеры копятся.

`AbortController` шире `fetch()`. Сигнал — generic event target с событием `abort`. Свою async-операцию можно сделать отменяемой:

```js
function delay(ms, { signal } = {}) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason);
        const timer = setTimeout(resolve, ms);
        signal?.addEventListener(
            'abort',
            () => {
                clearTimeout(timer);
                reject(signal.reason);
            },
            { once: true }
        );
    });
}
```

Задержку можно отменить. До конца delay сигнал abort — clear таймера и reject. Композиция:

```js
const controller = new AbortController();
await Promise.all([
    fetchData(controller.signal),
    processRecords(controller.signal),
    delay(1000, { signal: controller.signal }),
]);
```

`controller.abort()` отменяет все три. Один abort-сигнал распространяется по всем подключённым операциям.

`setTimeout` из `node:timers/promises` (с Node 15) принимает `AbortSignal`:

```js
const {
    setTimeout: sleep,
} = require('node:timers/promises');
await sleep(5000, null, { signal: controller.signal });
```

Параметр signal отменяет таймер без ручного `clearTimeout`. При abort промис reject с `AbortError`.

Код таймаута нуждается и в своевременном settlement, и в отмене. Таймер, который только reject в race, settle промис вызывающего. Abort-сигнал ещё говорит базовой операции остановиться.

`AbortSignal.timeout()` — статическая фабрика (Node v17.3.0, v16.14.0). Сигнал сам abort через заданные миллисекунды вместо ручного `setTimeout` + `AbortController.abort()`:

```js
const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
});
```

Без ручного таймера и `finally` для очистки. Сигнал abort через 5 с, таймером управляет runtime. Для простого «таймаут и отмена» — прямой вариант. Для отмены по внешним условиям (действие пользователя, завершение родителя) — полный `AbortController`.

`AbortSignal.any()` (Node v20.3.0, v18.17.0) композирует сигналы. Комбинированный abort, когда **любой** из входов abort:

```js
const controller = new AbortController();
const combined = AbortSignal.any([
    controller.signal,
    AbortSignal.timeout(10000),
]);
```

Abort при ручном `controller.abort()` или через 10 с — что раньше. Параллель с `Promise.race()`, но для сигналов отмены, а не значений промисов.

Паттерн `AbortController` / `AbortSignal` разошёлся по API Node: `fs.readFile()`, `fs.writeFile()`, `stream.pipeline()`, `events.once()`, `events.on()`, `child_process.exec()`, `timers/promises` принимают `{ signal }`. В своих async-утилитах опциональный `{ signal }` с пробросом вниз даёт вызывающим контроль отмены — идиоматичный способ остановить async-работу.

---

## Композиция паттернов

Паттерны складываются. Пример: fetch с таймаутом, retry при транзиентных сбоях, лимит concurrency.

```js
const results = await pMap(
    urls,
    async (url) => {
        return retry(
            () =>
                fetchJson(url, {
                    signal: AbortSignal.timeout(5000),
                }),
            { maxRetries: 3, baseMs: 500 }
        );
    },
    10
);
```

До 10 одновременных запросов по `urls`. У каждого таймаут 5 с с abort. При транзиентном сбое до 3 retry с экспоненциальным backoff (база 500 ms, 1 s, 2 s с jitter). Внешний `pMap` — concurrency. Внутренний `retry` — устойчивость. `fetchJson` — HTTP-статусы и разбор ответа.

Fan-out с терпимостью к частичным сбоям:

```js
const health = await Promise.allSettled(
    services.map((service) =>
        checkService(service, {
            signal: AbortSignal.timeout(2000),
        })
    )
);
```

Health check каждого сервиса: 2 с abort на сервис, сбор результатов даже при сбоях. `AbortSignal.timeout()` — отмена на сервис. `Promise.allSettled()` — агрегат. Каждый сервис успел, таймаут или ошибка — полная картина.

CDN fallback с общим дедлайном:

```js
const controller = new AbortController();
const signal = AbortSignal.any([
    controller.signal,
    AbortSignal.timeout(10000),
]);
try {
    return await Promise.any(
        cdns.map((c) => fetchJson(c, { signal }))
    );
} finally {
    controller.abort();
}
```

`Promise.any()` — первый CDN с приемлемым ответом. Комбинированный сигнал — дедлайн 10 с на всё. `finally` abort общего controller после успеха или провала — медленные зеркала получают отмену, когда агрегат уже известен. Все CDN упали — `AggregateError` со всеми причинами. Дедлайн прошёл — timeout-сигнал отменяет все in-flight запросы.

---

## Подводные камни и крайние случаи

То, что кусает в проде.

**Потерянные rejection в Promise.all().** При short-circuit на первом rejection остальные промисы продолжают работать. Если ещё reject, причины отбрасываются — `Promise.all()` показывает только первую. Отдельные rejection не дают `unhandledRejection` (V8 вешает внутренние reject-обработчики на каждый вход при итерации), но диагностика теряется. Три из пяти запросов к БД упали по разным причинам — видна только первая.

Нужна видимость всех сбоев — `Promise.allSettled()` или обёртка каждого промиса:

```js
const promises = urls.map((url) =>
    fetch(url).catch((e) => ({ error: e }))
);
const results = await Promise.all(promises);
```

Каждый промис всегда fulfill (данные или объект с `.error`). Потом смотрят записи с `.error`. Ручной `allSettled`.

**Сериально вместо параллельно по ошибке.**

```js
// Сериально — каждый await блокирует следующий
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();
```

Серия. `fetchB` не стартует, пока не завершится `fetchA`. По 200 ms каждый — 600 ms. Параллель:

```js
// Параллельно — все стартуют сразу, await вместе
const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC(),
]);
```

~200 ms при равной latency. Разница — когда создаются промисы. В серийном варианте каждый `await` приостанавливает до следующего `fetch()`. В параллельном три `fetch()` сразу, `Promise.all()` ждёт все.

!!!tip ""

    Параллелизм начинается в момент **создания** промисов, а не в момент `await Promise.all()`. Если нужна параллельная работа, не ставьте `await` между независимыми вызовами.

**Promise.race() со смешанными типами промисов.** Гонка fetch с таймаутом: таймаут reject — fulfillment fetch игнорируется. Если fetch потом reject, внутренний обработчик race это видит — `unhandledRejection` нет. Операция всё равно доходит до конца. С `AbortController` путь таймаута **отменяет** fetch, а не только игнорирует итог.

**AggregateError и массив errors.** `.errors` сохраняет порядок входа. Но ошибки разные — reset, DNS, HTTP. Часто каждую разбирают отдельно для recovery. Общий `catch` с `err.message` теряет детали. Логируйте `err.errors`.

**Порядок микрозадач между комбинаторами.** `Promise.all()` с уже fulfilled входами всё равно settle непустой агрегат асинхронно. Реакции идут в promise job queue, decrement, при нуле fulfill агрегата — observers в следующей job. У V8 fast path; считать jobs из user code хрупко. Правило: непустые результаты комбинаторов наблюдают асинхронно — важно рядом с `process.nextTick()` и другим кодом, планирующим микрозадачи.

**Проглатывание ошибок с `Promise.allSettled()` в циклах.**

```js
for (const batch of batches) {
    await Promise.allSettled(batch.map(process));
}
```

Каждый batch обработан, все ошибки проигнорированы. 90% операций упали — можно не заметить. `allSettled` — «не бросать при сбое»; обработку ошибок полностью перекладывает на вызывающего. Без разбора результатов ошибки тихо теряются. Всегда логируйте или агрегируйте rejected.

**Promise.all() с разреженными массивами.** Дыры во входе (`[fetch('/a'), , fetch('/c')]`) дают `Promise.resolve(undefined)` на слот и `undefined` в результате. Операция «успешна», дыра — тонкий баг при runtime-сборке массива.

---

## Итог

Каждый комбинатор решает свою задачу координации. `Promise.all()` — параллельное выполнение с fail-fast. `Promise.allSettled()` — параллель с fault tolerance. `Promise.race()` — time-boxing. `Promise.any()` — избыточность и fallback.

Продвинутые паттерны — лимит concurrency, retry с backoff, таймаут с отменой — слой сверху. Они управляют **как** бегут промисы; комбинаторы — **как агрегируются** результаты. Retry оборачивает одну promise-returning функцию. Limiter ограничивает, сколько промисов выполняется одновременно. `AbortController` останавливает ненужную работу. Свободная композиция: retry с таймаутом на запрос, лимит на batch, `allSettled` для частичных результатов.

Глава async-patterns шла от колбэков — низкоуровневый примитив. Потом промисы — композиция и цепочки. Async/await — императивный вид над композициями. EventEmitter — push-модель событий. Async iterators — pull-потребление. Комбинаторы добавляют оркестрацию нескольких параллельных операций.

Вместе они покрывают типичные async-формы в продакшене Node.js. WebSocket-сервер: EventEmitter на входящие события, async iteration для pull, комбинаторы на параллельные downstream-вызовы, retry, `AbortController` на cleanup соединения. Batch import: map с лимитом concurrency, retry на транзиентные ошибки БД, `allSettled` для сбора, таймауты на элемент.

Примитивы маленькие. Поведение в проде — из композиции.

---

## Связанное чтение

-   Предыдущая: [Async iterators в Node.js: for await...of, streams и backpressure](async-iterators.md)
-   Далее: [File descriptors в Node.js: fs.open, FileHandle, flags и EMFILE](../file-system/file-descriptors-and-handles.md)
