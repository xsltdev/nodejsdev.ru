---
description: EventEmitter в Node.js — объект _events, синхронный emit, событие error, maxListeners и утечки памяти
---

# EventEmitter в Node.js: слушатели, ошибки и предупреждения об утечках

Источник: [theNodeBook — Node.js EventEmitter: Listeners, Errors & Leak Warnings](https://www.thenodebook.com/async-patterns/eventemitter-internals)

EventEmitter — синхронный примитив диспетчеризации событий в Node. Внутри — хранение и вызов слушателей. Потоки, серверы, сокеты, дочерние процессы и пользовательские API хранят обработчики по имени события. Один слушатель — одна функция. Несколько — массив. `emit(name, ...args)` читает текущий набор слушателей и вызывает их **синхронно**, в порядке регистрации.

---

## Внутренности EventEmitter в Node.js

У события `error` особое поведение: необработанный `error` приводит к выбросу исключения. Предупреждения об утечках связаны с числом слушателей. EventEmitter предупреждает, когда на одно имя события навешано слишком много обработчиков — частый признак того, что код добавляет слушателей снова и снова, не удаляя их.

Почти каждый HTTP‑сервер, поток и дочерний процесс в Node.js наследует один и тот же класс. `EventEmitter` стоит внизу большинства иерархий объектов рантайма, а реализация настолько компактна, что умещается в один файл — `lib/events.js` в исходниках Node.js. Поверхностный API (`on`, `emit`, `off`) скрывает детали, которые стоит понимать; главное, что многие упускают: **`emit()` синхронен**. Слушатель выполняется в том же стеке вызовов, что и код, вызвавший событие.

Вы уже знаете, что такое EventEmitter, из глав про потоки. Эта подглава — про то, **как** это устроено: структуры данных, механика диспетчеризации, контракт события `error`, который может уронить процесс, и место EventEmitter рядом с колбэками, промисами и async/await как паттерном координации.

---

## Объект `_events`

При создании нового `EventEmitter` инициализируются три внутренних свойства:

```js
const EventEmitter = require('events');
const ee = new EventEmitter();
console.log(ee._events); // [Object: null prototype] {}
console.log(ee._eventsCount); // 0
console.log(ee._maxListeners); // undefined
```

`_events` создаётся через `Object.create(null)` — осознанный выбор. Объект с нулевым прототипом не наследует `toString`, `hasOwnProperty`, `constructor`. Это защищает от атак через загрязнение прототипа: кто‑то мог бы вызвать `emit` с именем `__proto__` или `constructor` и случайно вызвать унаследованный метод вместо слушателя. Обычный `{}` наследует `Object.prototype` со свойствами вроде `__proto__`, `toString`, `valueOf`, `hasOwnProperty`. Если бы `_events` был обычным объектом и вызвали `ee.emit("toString")`, поиск `this._events["toString"]` нашёл бы `Object.prototype.toString` — функцию — и логика emit попыталась бы вызвать её как слушателя. С `Object.create(null)` цепочки прототипов нет: отсутствующий ключ даёт `undefined`.

Ключи `_events` — имена событий. Значения — одна функция или массив функций. Оптимизация, которая удивляет: при одном слушателе Node кладёт функцию прямо в ключ, без обёртки в массив. Второй слушатель переводит значение в массив. Удаление может снова оставить одну функцию. Так избегают аллокаций массива в частом случае одного слушателя (`error`, `close`, `finish` на потоках). На практике у большинства событий на большинстве эмиттеров ровно один слушатель. У Readable обычно по одному на `data`, `end`, `error`. Оборачивать каждый в массив из одного элемента — лишние накладные расходы.

`_eventsCount` — простой счётчик имён событий с хотя бы одним слушателем. Node использует его для быстрой проверки «есть ли вообще слушатели» без обхода `_events`. При `_eventsCount === 0` диспетчировать нечего: emit сразу возвращает `false`, даже не заглядывая в `_events`.

`_maxListeners` изначально `undefined` — «взять значение по умолчанию». По умолчанию 10, из `EventEmitter.defaultMaxListeners`. Переопределить на экземпляре: `setMaxListeners()`. `0` или `Infinity` отключают предупреждение. Подробнее о предупреждении — в отдельном разделе ниже.

### `EventEmitter.init()`

Конструкция минимальна. `EventEmitter.init()` (вызывается конструктором и доступна подклассам) проверяет, есть ли уже `_events`. Если свойство унаследовано с прототипа или осталось от прошлой инициализации, создаётся новый объект; иначе назначается объект с нулевым прототипом. `_eventsCount = 0`, `_maxListeners = undefined`.

Проверка «уже существует» нужна из‑за наследования прототипов в JavaScript. Если на прототипе подкласса уже лежит `_events` (потому что `EventEmitter.init()` вызывали на самом прототипе), все экземпляры разделяли бы один `_events` по цепочке прототипов. Защита сравнивает `this._events === ObjectGetPrototypeOf(this)._events`: при совпадении экземпляр видит унаследованный объект, и `init()` создаёт свой. Без этого два экземпляра одного подкласса могли бы делить регистрации событий. Обёртка TCP в `net.Socket` — пример: `net.Socket` extends `stream.Duplex` extends EventEmitter, и на этапе конструирования эта проверка важна.

`_events`, `_eventsCount` и `_maxListeners` — обычные перечисляемые свойства. Они попадают в `JSON.stringify()`, `Object.keys()`, spread. При сериализации подкласса EventEmitter увидите эти поля, если не отфильтровать. Типичное решение — `toJSON()` без них. Имейте в виду: `Object.assign({}, myEmitter)` тоже их копирует.

---

## Регистрация слушателей

### `on()` и `addListener()`

`on(eventName, listener)` и `addListener(eventName, listener)` — одна и та же функция: `addListener` — алиас на ту же ссылку. Оба добавляют слушателя для имени события. Если слушателей ещё нет, сохраняется функция напрямую. Если уже один (как голая функция), значение повышается до двухэлементного массива.

```js
const ee = new EventEmitter();
ee.on('data', fn1);
console.log(ee._events.data === fn1); // true — голая функция
ee.on('data', fn2);
console.log(Array.isArray(ee._events.data)); // true — повышение
console.log(ee._events.data.length); // 2
```

Порядок регистрации важен: слушатели вызываются в порядке добавления. `on()` дописывает в конец. `prependListener()` вставляет в начало (`unshift`), поэтому такой слушатель сработает первым. Есть `prependOnceListener()` с семантикой «один раз». Prepend нужен, когда событие надо перехватить раньше остальных — логирование, проверки.

Аргумент `listener` должен быть функцией. Строка, число, `undefined` — `TypeError` из внутренней `_addListener`, до которой доходят все методы регистрации. Проверка синхронна, до события `newListener`.

### Событие `newListener`

Перед добавлением слушателя EventEmitter эмитит `newListener` с именем события и функцией слушателя — **до** записи в массив. Если обработчик `newListener` сам вызывает `on()` для того же события, новый слушатель встанет перед тем, что спровоцировал эмиссию.

```js
ee.on('newListener', (event, listener) => {
    console.log(`Adding listener for ${event}`);
});
ee.on('connection', () => {});
// logs: "Adding listener for connection"
```

`newListener` срабатывает при каждом `on()`, `once()`, `addListener()`, `prependListener()`. Симметричное `removeListener` — **после** удаления. Асимметрия задокументирована.

До добавления можно перехватить регистрацию, изменить поведение, даже отменить через `off()` (редко). После удаления слушателя уже нет — состояние эмиттера отражает удаление.

Эти события в основном для отладки и инструментирования. APM цепляются к `newListener`, чтобы автоматически оборачивать обработчики. В продакшене редко нужны напрямую, но через них возможна интеграция вроде `diagnostics_channel`: наблюдатель видит паттерны регистрации без правки кода, который вешает слушателей.

!!!note ""

    Регистрация слушателя на `newListener` сама эмитит `newListener`. Без осторожности — бесконечный цикл. В исходниках Node защиты нет — ответственность на вас.

### `once()`

`once(eventName, listener)` оборачивает вашу функцию. Обёртка сначала снимает себя через `off()`, затем вызывает оригинал. Слушатель срабатывает ровно один раз.

```js
ee.once('ready', () => {
    console.log('fired once');
});
ee.emit('ready'); // logs "fired once"
ee.emit('ready'); // nothing
```

На обёртке есть свойство `.listener` на оригинал — так `removeListener()` находит регистрацию `once()` до срабатывания: в `_events` лежит обёртка, не ваша функция.

Последовательность при `emit()` на `once()`‑слушателя:

1.  `emit()` находит обёртку (в массиве или как единственную функцию).
2.  Обёртка вызывает `this.removeListener(type, wrapper)` — убирает себя из `_events`.
3.  Обёртка вызывает `listener.apply(this, args)` — ваш код.
4.  Если ваш код бросает исключение, слушатель уже снят; ошибка идёт вверх, повторного вызова не будет.

Порядок «сначала снять, потом вызвать» важен. При throw слушатель уже удалён. Если внутри слушателя снова `emit` того же события на том же эмиттере, `once` уже не вызовется повторно.

### `off()` и `removeListener()`

`off()` — алиас `removeListener()`. Поиск по `===` или по `.listener` у обёрток `once()`, удаление первого совпадения. Остался один слушатель — снова голая функция. Слушателей не осталось — ключ удаляется из `_events`, `_eventsCount` уменьшается.

«Первое совпадение»: одна и та же функция дважды на одно событие — один `off()` снимает только первую регистрацию. Как `removeEventListener` в DOM, хотя DOM по умолчанию дедуплицирует.

Удаление слушателей во время `emit()` ведёт себя предсказуемо благодаря копии массива в `emit()` (ниже).

### `rawListeners()`

`rawListeners()` возвращает копию массива слушателей **включая** обёртки `once()`. `listeners()` разворачивает обёртки, отдавая `.listener`. Чтобы отличить `once` от постоянных слушателей — `rawListeners()`. У обёрток `once()` есть `.listener` — значит регистрация была через `once()`.

---

## Синхронная диспетчеризация: `emit()`

Об этом часто забывают: **`emit()` синхронен**. Полностью. При `emit("data", chunk)` каждый слушатель `data` выполняется в **текущем** стеке, по порядку регистрации, до возврата из `emit()`. Ни очередей, ни отложенного планирования, ни микрозадач.

```js
ee.on('tick', () => console.log('A'));
ee.on('tick', () => console.log('B'));
console.log('before');
ee.emit('tick');
console.log('after');
// before -> A -> B -> after
```

Порядок детерминирован: `A` и `B` между `before` и `after`. `emit()` не вернётся, пока оба слушателя не завершатся. Если A крутит CPU 500 мс синхронно, B ждёт. Всё после `emit()` ждёт. Весь стек над `emit()` заблокирован.

«События» звучат асинхронно, «event-driven» намекает на очередь и следующий тик — нет. `emit()` — цикл синхронных вызовов функций, не больше.

!!!note ""

    `emit()` не отдаёт управление event loop, пока все слушатели не отработают. Тяжёлый обработчик `data` на потоке задерживает следующий chunk; медленный `connection` на сервере — приём следующих подключений.

Пример блокировки:

```js
ee.on('work', () => {
    const start = Date.now();
    while (Date.now() - start < 200) {} // 200ms spin
    console.log('listener done');
});
console.log('before emit');
ee.emit('work');
console.log('after emit'); // 200ms later
```

`after emit` печатается через ~200 мс после `before emit`, потому что `emit()` ждёт busy-wait в слушателе. Как обычный вызов функции — потому что это и есть цикл вызовов функций.

---

### Как на самом деле работает `emit()`

В `lib/events.js` логика примерно такая:

1.  Если имя `error` — особый контракт (ниже).
2.  `this._events[type]`. Пусто — `false`.
3.  Одна функция — вызов с переданными аргументами.
4.  Массив — **копия** массива, затем обход и вызов каждой функции.

Копия в шаге 4 — тонкий момент. Слушатель может вызвать `off()` или `on()` во время эмиссии. Без копии удаление сдвинуло бы индексы — кого‑то пропустили бы или вызвали дважды. Копия изолирует итерацию от мутаций.

```js
ee.on('test', function handler() {
    ee.off('test', handler); // remove self during emit
});
ee.on('test', () => console.log('second'));
ee.emit('test'); // "second" still fires
```

Второй слушатель сработает, хотя первый снял себя. Итерация идёт по снимку на момент вызова `emit()`. Слушатели, добавленные **во время** текущего `emit`, на этой эмиссии не вызовутся.

Без копии: `[A, B, C]`, индекс 0, вызов A, A делает `off` и выкидывает себя → `[B, C]`, индекс 1 теперь C — B пропущен. Классическая ошибка «мутировать массив при обходе»; копия её устраняет.

### Аргументы и возвращаемое значение

Все аргументы после имени события передаются слушателям как есть. Без клонирования и обёрток. Один объект в аргументах — одна ссылка у всех слушателей; мутация в одном видна следующим:

```js
ee.on('req', (ctx) => {
    ctx.modified = true;
});
ee.on('req', (ctx) => {
    console.log(ctx.modified);
}); // true
ee.emit('req', { modified: false });
```

Намеренно, как аргументы функций в JavaScript. Слушатели могут мешать друг другу. В Express middleware `req`/`res` — общие ссылки при emit‑подобной диспетчеризации; в общем EventEmitter мутации общих аргументов — источник тонких багов порядка.

`emit()` возвращает boolean: `true`, если был хотя бы один слушатель, иначе `false`. Используется для паттерна `error` и внутри Node: Readable проверяет слушателей `data` перед flowing mode; `emit("data", chunk) === false` — некому отдавать данные.

### Когда слушатель бросает исключение

Любой throw останавливает обход: оставшиеся слушатели этого события не вызываются. Исключение идёт вверх к вызывающему `emit()`. Внутри `emit()` нет try/catch.

Слушатель №2 из пяти с throw — №3–5 не выполнятся. Вызывающий должен обработать ошибку или дойти до `uncaughtException` (см. главу про event loop). «Продолжить» эмиссию после throw нельзя.

Решение осознанное: try/catch вокруг каждого слушателя маскировал бы ошибки. Частичная мутация общих данных до throw могла бы оставить неконсистентное состояние. Остановка и выброс безопаснее.

Изоляция между слушателями — ваша задача:

```js
for (const listener of ee.listeners('data')) {
    try {
        listener(chunk);
    } catch (err) {
        console.error('Listener failed:', err);
    }
}
```

На практике почти всегда полагаются на остановку при throw.

---

## Разбор `lib/events.js`

Исходник EventEmitter — `lib/events.js`, около 1200 строк; значительная часть — валидация, deprecation и краевые случаи. Ядро компактно. Ключевые внутренние функции показывают, откуда взялся API.

### Внутренняя `_addListener`

Вся регистрация идёт через `_addListener(emitter, eventName, listener, prepend)`:

1.  `listener` должен быть функцией, иначе `TypeError`.
2.  Получить или создать `_events`.
3.  Если есть слушатели `newListener` — эмитить **до** добавления нового.
4.  `existing = events[type]`.
5.  `existing === undefined` → `events[type] = listener`, `_eventsCount++`.
6.  `existing` — функция → массив: `prepend ? [listener, existing] : [existing, listener]`.
7.  `existing` — массив → `push` или `unshift`.
8.  Проверка числа слушателей против `_maxListeners`; при превышении и если для этого события ещё не предупреждали — `process.emitWarning()`.

Флаг `warned` на массиве — предупреждение один раз на имя события. После 11‑го на `data` 12‑й и 13‑й не спамят. Сброс, если все слушатели сняты и снова превысили порог.

Шаг 3: при `newListener` нового слушателя ещё нет в `_events`. `listenerCount()` в обработчике вернёт старое число. Запись появляется после шагов 5–7.

Если обработчик `newListener` бросает — слушатель не добавляется; throw выходит из `on()` / `once()` / `addListener()`, состояние не менялось.

### Реализация `emit()`

`EventEmitter.prototype.emit` — `function emit(type, ...args)`. Оптимизация в диспетчеризации, не в аргументах.

Один слушатель (голая функция) — `ReflectApply(handler, this, args)` без копии массива. Несколько — `arrayClone()`, затем обход копии. `arrayClone` для длин 2–4 возвращает литералы, иначе `ArrayPrototypeSlice` — быстрее spread/`Array.from()` в V8.

Большинство событий — один слушатель; на горячем пути сервера `emit()` вызывается миллионы раз в секунду (I/O, таймеры, chunks, соединения).

`this` у слушателя — экземпляр эмиттера:

```js
ee.on('event', function () {
    console.log(this === ee); // true
});
```

Стрелочные функции `this` не привязывают; в старом коде до ES2015 `this` был способом достать эмиттер. Библиотеки того времени на этом держатся.

### Особая обработка `error`

До диспетчеризации: `if (type === "error")`. Нет слушателей `error`:

1.  Проверка `this.domain` (legacy domains).
2.  Первый аргумент `er` — `Error` → throw напрямую.
3.  Иначе обёртка `new Error("Unhandled error." + ...)` с `.context = er`, затем throw.

Строка в шаге 3 даёт сообщения вроде `"Unhandled error. (connection refused)"` при `emit("error", "connection refused")` вместо `Error`.

### `getEventListeners()` и `eventNames()`

`eventNames()` — имена с хотя бы одним слушателем через `Reflect.ownKeys()` (включая Symbol). Symbol как имя события редок, но удобен для «приватных» имён без коллизий с пользователем.

`getEventListeners(emitter, event)` — статический метод модуля `events`, копия массива; правка копии не трогает эмиттер. Работает и с `EventTarget`.

`listenerCount(eventName)` на экземпляре; статический `EventEmitter.listenerCount(emitter, eventName)` устарел. Экземплярный метод смотрит `_events[eventName]`: 0, 1 или `array.length`.

### `captureRejections`

С Node 13 — опция. Включена на экземпляре или глобально `EventEmitter.captureRejections = true`: обёртка вокруг вызова слушателя ловит rejected promise и шлёт на `error`.

```js
const ee = new EventEmitter({ captureRejections: true });
ee.on('event', async () => {
    throw new Error('async failure');
});
ee.on('error', (err) => {
    console.log(err.message); // "async failure"
});
ee.emit('event');
```

Без опции async‑слушатель возвращает rejected promise без await → `unhandledRejection`, в зависимости от версии Node процесс может завершиться. С `captureRejections` — `.then()` на возврате и маршрут в `error` (или `Symbol.for("nodejs.rejection")` на эмиттере).

Внутри после каждого вызова: если включено и возврат thenable — `.then(undefined, rejectionHandler)`.

Мост между синхронным `emit` и async/await: слушатель **стартует** синхронно; `async` возвращает promise сразу после первого `await` в теле; rejection обрабатывается позже в микрозадаче. Маршрут в `error` относительно исходного `emit()` асинхронен.

По умолчанию `captureRejections` выключен — `emit()` не смотрит на возвраты. Включение проверяет каждый return на thenable; на тысячах событий в секунду — накладные расходы, поэтому opt-in.

---

## Контракт события `error`

Поведение `error` уникально. `emit("error", err)` без слушателей `error` — не `false` и тишина, а **throw**. Аргумент — `Error` → бросается он; иначе обёртка вроде «Unhandled error. (value)».

```js
const ee = new EventEmitter();
ee.emit('error', new Error('boom'));
// Throws: Error: boom
// The process crashes if nothing catches this.
```

Решение с ранних дней Node: тихие ошибки хуже падения. TCP‑сервер, поток, сбой ресурса — вы должны знать. Контракт `error` заставляет обработать или принять краш.

Ошибка идёт вверх от `emit()`. `try/catch` вокруг `emit()` поймает; иначе `uncaughtException`. В продакшене часто лог и exit.

Практика: всегда вешать `error` на любой EventEmitter, с которым работаете.

```js
const server = net.createServer();
server.on('error', (err) => {
    console.error('Server error:', err.message);
});
server.listen(3000);
```

Без обработчика `EADDRINUSE` из `listen()` выбросится из внутреннего `emit("error", ...)` и уронит процесс. С обработчиком — лог и решение: другой порт, retry, graceful exit.

!!!warning ""

    `emit("error", err)` **без** слушателя `error` бросает исключение (или обёрнутую ошибку). Это не «вернуть false», как у других событий.

---

### Зачем так сделано

Раньше создавали потоки и сокеты без `error`. Сбои терялись: зависшие соединения, потеря данных, утечки незакрытых ресурсов. Краш при необработанной ошибке — принуждение к явной обработке. `ECONNRESET` в dev раздражает, но вы **знаете** о разрыве. В проде — handler, лог, cleanup.

`net.Server`, `net.Socket`, `http.Server`, `http.IncomingMessage`, `fs.ReadStream`, `child_process.ChildProcess`, `tls.TLSSocket` — везде `error` при сбое. Конвенция едина в стандартной библиотеке.

### `captureRejections` и событие `error`

Rejected async‑слушатель при включённом `captureRejections` идёт в `emit("error", reason)`. Нет слушателя `error` — снова краш. Включить `captureRejections` без `error` — смена вида краша: с unhandled rejection на throw из `emit("error")`.

Разница по времени: без опции rejection — микрозадача позже, `emit()` давно вернулся. С опцией rejection тоже в микрозадаче (`.then`), но проявляется как throw из `emit("error")` в том коде, который выполняется при drain микрозадач. Стек и момент другие; краш тот же по сути.

### Domains (legacy)

Модуль `domain` перехватывал ошибки эмиттера без слушателей. Domains давно deprecated, но в `emit()` остаётся проверка `this.domain` до throw. Упоминаем, чтобы не гадать в исходниках.

---

## Утечки памяти и `maxListeners`

По умолчанию лимит 10. 11‑й слушатель на одно имя события → предупреждение через `process.emitWarning()`:

```
MaxListenersExceededWarning: Possible EventEmitter memory leak
detected. 11 data listeners added to [EventEmitter]. MaxListeners
is 10. Use emitter.setMaxListeners() to increase limit.
```

Это предупреждение, не ошибка. Слушатель добавляется, эмиттер работает. Но неограниченное добавление — одна из самых частых утечек в Node.

Классическая утечка:

```js
function handleRequest(req, res) {
    db.on('change', () => {
        /* respond to change */
    });
    // oops - never removes the listener
}
```

Каждый запрос — новый слушатель на `db`. После 100 000 запросов — 100 000 слушателей; замыкания держат `req`/`res`, GC не собирает. При каждом `change` все вызываются синхронно на одном тике — тормоза, затем OOM.

Предупреждение даёт stack trace 11‑го добавления, имя конструктора эмиттера и имя события.

Слушать программно:

```js
process.on('warning', (warning) => {
    if (warning.name === 'MaxListenersExceededWarning') {
        console.log(
            warning.emitter,
            warning.type,
            warning.count
        );
    }
});
```

У объекта warning есть `emitter`, `type`, `count` — достаточно для автоматического детекта утечек.

!!!warning ""

    Добавлять `on()` на долгоживущий эмиттер в обработчике каждого запроса без `off()` — линейный рост памяти и синхронных вызовов на каждое событие.

---

### Управление лимитом

```js
ee.setMaxListeners(20); // raise for this emitter
ee.setMaxListeners(0); // disable warning entirely
ee.setMaxListeners(Infinity); // same effect
```

`EventEmitter.defaultMaxListeners` — глобальный дефолт для экземпляров без своего `setMaxListeners`. Проверка читает дефолт **в момент регистрации**, не при создании.

```js
EventEmitter.defaultMaxListeners = 20;
```

Node 15.4: `events.setMaxListeners(n, ...targets)` для нескольких эмиттеров сразу:

```js
const { setMaxListeners } = require('events');
setMaxListeners(50, server, db, cache, queue);
```

`events.getMaxListeners(emitter)` — эффективный лимит; работает с EventEmitter и EventTarget.

### Когда много слушателей — норма

У `process` часто больше 10 слушателей: `SIGINT`, `SIGTERM`, `uncaughtException`, `unhandledRejection`, `warning`, `exit`, сигналы из разных модулей. У пула БД — 20+ подписчиков на `error`/`connection`. Тогда поднимите лимит осознанно.

`Infinity` как пластырь скрывает утечку. Лучше конкретное число чуть выше ожидаемого: 25 модулей на `change` → лимит 30.

### Детект утечек на практике

Предупреждение — первая линия, но один раз на имя события. Непрерывный мониторинг — `listenerCount()` в health check:

```js
setInterval(() => {
    const count = ee.listenerCount('data');
    if (count > 100)
        console.warn(`data listeners: ${count}`);
}, 60_000);
```

Метрики (Prometheus gauge) по числу слушателей: монотонный рост — утечка; стабильный уровень со всплесками при деплое — норма.

Другой источник — проброс событий без снятия:

```js
source.on('data', (chunk) => dest.emit('data', chunk));
```

Промежуточный объект на запрос, `source` живёт долго — та же утечка на `source`. Лечение то же: `off()` при завершении.

---

## `removeAllListeners` и очистка

`removeAllListeners()` без аргументов снимает всех со всех событий. С именем события — только для него. В обоих случаях эмитится `removeListener` за каждого снятого.

Паттерн короткой подписки:

```js
function subscribe(emitter) {
    const handler = (data) => process(data);
    emitter.on('update', handler);
    return () => emitter.off('update', handler);
}
const unsub = subscribe(db);
// ... later
unsub();
```

Возврат функции отписки — привычный стиль в Node (как cleanup в `useEffect` в React).

`once()` снимает себя после вызова; если событие **никогда** не пришло — слушатель остаётся. `once("drain")` на Writable, который не заполнял буфер, висит вечно.

С Node 15 `events.once()` и `events.on()` принимают `AbortSignal`. Abort снимает ожидание и предотвращает утечку:

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 5000); // timeout after 5s
await once(server, 'listening', { signal: ac.signal });
```

Если `listening` не случился за 5 с — `AbortError`, внутренний слушатель очищен.

---

## EventEmitter среди async‑паттернов

Колбэк, промис и async/await описывают **одно** завершение. Колбэк — один вызов (см. главу про error-first колбэки). Промис — один settle (см. главу про микрозадачи промисов). Async‑функция — один результат (см. главу про async/await). EventEmitter ломает это ограничение: одно имя события можно эмитить сколько угодно раз; много слушателей реагируют независимо.

Подходит для **повторяющихся** изменений состояния: новые соединения, chunks потока, изменения файлов, строки лога дочернего процесса. События в исходном смысле — происходят снова, время непредсказуемо, несколько потребителей могут интересоваться каждым.

Колбэк: одна функция, один вызов, один результат. Промис: одно разрешение. EventEmitter: много слушателей, много вызовов, во времени.

Цена — управление жизненным циклом: когда слушать, когда отписаться, что с забытыми слушателями. Раздел про утечки — прямое следствие.

---

### Что когда выбирать

Зависит от кардинальности и момента:

**Один результат, время известно** — промис или колбэк: запрос к БД, чтение файла, HTTP.

**Один результат, время неизвестно** — `events.once()` как промис: старт сервера, первое соединение, exit процесса.

**Много результатов во времени, push** — EventEmitter с `on()`: данные потока, сообщения сокета, watcher файлов.

**Много результатов, pull** — async iterator через `events.on()`: тот же сценарий, потребитель задаёт темп (следующая подглава).

EventEmitter — фундамент большинства встроенных модулей. Потоки extend EventEmitter. `net.Server` extend EventEmitter. `http.Server` extend `net.Server`. `child_process.ChildProcess`, `fs.FSWatcher` — то же. Сам `process` — экземпляр EventEmitter. Понимание внутренностей — базовое поведение почти каждого I/O‑объекта Node.

### Мост к промисам и async iteration

Модуль `events` даёт два статических метода:

`events.once(emitter, eventName)` — промис, резолвится при событии; значение — массив аргументов `emit()`. Внутри `once()` плюс слушатель `error`, реджектящий промис, если ошибка раньше целевого события. При срабатывании любого из них оба снимаются.

```js
const { once } = require('events');
const server = net.createServer();
server.listen(3000);
await once(server, 'listening');
console.log('Server is ready on', server.address().port);
```

Чистый способ дождаться одноразового события. У `listening` аргументов нет — адрес берут из `server.address()` после await. Без `events.once()` писали обёртку вручную и забывали `error` или не снимали success‑слушатель при ошибке.

С аргументами промис резолвится массивом: `await once(server, "connection")` → `[socket]`; `await once(process, "exit")` → `[code]`.

`events.on(emitter, eventName)` — `AsyncIterator`; каждая эмиссия — yield массива аргументов (подробнее в главе про async iterators).

```js
const { on } = require('events');
for await (const [chunk] of on(stream, 'data')) {
    process.stdout.write(chunk);
}
```

Итератор буферизует события между итерациями, порядок сохраняется. По умолчанию бесконечен — завершение через опцию `close` или `AbortSignal`. `error` на эмиттере — throw в итераторе. Pull вместо push: цикл забирает, когда готов; буфер не теряет события при async‑работе между итерациями.

Оба метода принимают `AbortSignal` для таймаута и отмены:

```js
const ac = new AbortController();
setTimeout(() => ac.abort(), 10_000);
try {
    await once(server, 'listening', { signal: ac.signal });
} catch (err) {
    if (err.code === 'ABORT_ERR') console.log('Timed out');
}
```

### `EventTarget`: веб‑стандарт

С Node 15 — `EventTarget` по спецификации DOM: `addEventListener`, `removeEventListener`, `dispatchEvent`. События — объекты `Event` с `type`, не произвольные аргументы.

В основном для совместимости с Web API: `AbortController`, `MessagePort`, будущий `WebSocket`. EventTarget создаёт объекты Event на каждый dispatch; EventEmitter передаёт сырые аргументы. Для нативного Node‑кода по-прежнему EventEmitter; EventTarget — где нужна совместимость с браузером.

Отличия: `dispatchEvent` ждёт `Event`; `emit` — любые аргументы. Снятие в EventTarget требует ту же функцию **и** тот же `capture`; в EventEmitter — только ссылку на функцию. У EventTarget нет контракта `error` с throw. `{ once: true }` в `addEventListener` аналог `once()`, но опцией.

`capture` и `passive` из DOM в серверном Node почти бессмысленны (нет фаз bubble/capture) — для соответствия спецификации.

Для большинства задач — EventEmitter. EventTarget — для web‑совместимых API. `events.getEventListeners()` и `events.setMaxListeners()` работают с обоими типами.

---

## Связанное чтение

-   Предыдущая: [Async/await в Node.js: приостановка и микрозадачи](async-await.md)
-   Следующая: [Async iterators в Node.js: for await...of, streams и backpressure](async-iterators.md)
