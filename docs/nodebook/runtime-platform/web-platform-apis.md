---
description: Web Platform API в Node.js — fetch, Web Streams, Blob, FormData, URL и structuredClone
---

# Web Platform API в Node.js: fetch, Web Streams, Blob и FormData

Источник: [theNodeBook — Web Platform APIs](https://www.thenodebook.com/runtime-platform/web-platform-apis)

Node.js выставляет на `globalThis` выбранные web-совместимые API, чтобы backend-код мог использовать стандартные примитивы запросов, ответов, потоков, бинарных payload, URL и клонирования. В этой главе — механика `fetch`, `Request`, `Response`, `Headers`, `Blob`, `File`, `FormData`, Web Streams, `TextEncoder`, `TextDecoder`, `URL`, `URLSearchParams`, `URLPattern` и `structuredClone`.

## Web Platform API в Node.js

Совместимость означает, что объектная модель следует веб-стандартам там, где Node их реализует. Поведение runtime по-прежнему зависит от HTTP-клиента Node, адаптеров потоков, обработки abort и статуса стабильности каждого global. Feature detection остаётся полезным для API, чья доступность меняется между версиями Node.

В Node v24 backend получает выбранную web-совместимую поверхность на `globalThis`. Сюда входят `fetch`, `Request`, `Response`, `Headers`, `Blob`, `File`, `FormData`, Web Streams, `TextEncoder`, `TextDecoder`, `URL`, `URLSearchParams`, `URLPattern`, `structuredClone`, `DOMException` и ещё несколько globals, чья стабильность зависит от API. Многие старые импорты полифиллов исчезают из прикладного кода, но под капотом по-прежнему Node.

Web-совместимая поверхность API означает, что Node реализует те же JavaScript-контракты, что и спецификации веб-платформы — там, где эти контракты уместны в серверном процессе. Имена объектов, методы, правила потребления body, формы stream и классы ошибок совпадают с браузерными API. Поддерживающий runtime — Node: V8, libuv, нативные биндинги, Undici, файлы ОС, состояние процесса и загрузчики модулей Node.

Граница важна.

```js
console.log(typeof fetch);
console.log(typeof Request);
console.log(typeof document);
```

В Node v24 первые две строки печатают `function`. Третья — `undefined`. `fetch` и `Request` — globals процесса. `document` принадлежит runtime страницы в браузере. Node даёт backend web-совместимый транспортный и data-слой. Page-globals вроде `window`, `document`, DOM-узлов, layout, navigation и lifecycle service worker остаются в браузерах.

`globalThis` — стандартное имя текущего global object. В модулях Node это место, где живут эти runtime-globals. `global` по-прежнему существует как более старый namespace Node, но в документации Node для нового кода указывают на `globalThis`.

```js
console.log(globalThis.fetch === fetch);
console.log(globalThis.URL === URL);
console.log(globalThis.process === process);
```

Результат всех трёх проверок — `true`. В `globalThis` есть и web-совместимые globals, и специфичные для Node. Общий namespace удобен и может скрывать баги переносимости. Код с `fetch` и `URL` может работать и в Node, и в браузере. Код с `process.env` в той же функции — это уже Node-код.

Браузерный global — объект, который браузерный execution context выставляет наружу. У страницы это обычно `window`. У workers — другая форма. Global Node ориентирован на процесс. Пересечение реально, но побеждает модель процесса. У backend-сервиса есть состояние процесса: один процесс, один граф модулей на кэш загрузчика, ресурсы ОС и серверная обработка запросов. Деревья страниц, модели origin storage, стеки навигации пользователя и рендереры — у браузеров.

Рабочая модель этой главы: web-образные JavaScript-объекты и Node-инфраструктура под ними.

Globals удобно сгруппировать по ролям в runtime.

Fetch отвечает за исходящие HTTP(S)-вызовы через `fetch`, `Request`, `Response` и `Headers`. Контейнеры payload — байты и формы через `Blob`, `File` и `FormData`. Stream-globals — web stream objects через `ReadableStream`, `WritableStream`, `TransformStream` и их controller/reader классы. Утилиты — кодирование, разбор URL, клонирование и web-образные ошибки. На периферии — optional или чувствительные к стабильности globals: `navigator`, web storage, `CompressionStream`, `BroadcastChannel`, `WebSocket` и `EventSource`.

Такая группировка делает поверхность обозримой. Node остаётся серверным runtime, но теперь включает достаточно web-стандартных JavaScript-контрактов, чтобы backend мог использовать те же request/response/stream/URL/payload объекты, которые уже ожидают многие библиотеки.

Практическая причина: современные пакеты часто публикуют код для нескольких runtime. Библиотека валидации может принимать `Request`. Клиент хранилища может возвращать `Response`. Multipart-хелпер может собирать `FormData`. Compression-хелпер может говорить на web streams. Пока этих globals не было, Node-приложения платили адаптерами или полифиллами только ради нужных форм объектов. В v24 многие формы есть в runtime.

Это снижает давление зависимостей, но переносит совместимость в версию Node. Пакет, который предполагает наличие `URLPattern`, предполагает Node v24 или полифилл. Пакет с web storage предполагает флаги и состояние runtime. Пакет с `fetch` в порядке на актуальном Node, но поведение всё равно следует версии Undici, вшитой в сборку Node.

Самая безопасная backend-привычка скучная: используйте стабильные globals напрямую, детектируйте нестабильные, и на границах, где лучше остаются старые Node stream API или buffers, конвертируйте осознанно.

Доступность globals меняет дизайн небольших модулей. Старый Node-код часто импортировал `node-fetch`, `form-data`, `whatwg-url` или stream-ponyfills в начале файла. Текущий Node-код часто может использовать встроенные объекты. Звучит мелочью, но меняет владение: runtime владеет поведением API, исправлениями и совместимостью. Меньше полифиллов в lockfile.

Обычно это хорошо. Но модуль должен объявлять минимальную версию runtime. Библиотека, вызывающая global `fetch`, говорит: «Node 18+ как минимум, актуальное поведение зависит от линии Node». Библиотека с `URLPattern` — «Node v24+ или fallback от вызывающего». Сервис с `localStorage` — «есть startup-флаги и политика файла хранилища». Это runtime-контракты; если спрятать их глубоко в хелпере, сбои выглядят случайными.

Чтения globals с риском стабильности держите на краю.

```js
export function makeClient({ fetchImpl = fetch } = {}) {
    return (url) => fetchImpl(url);
}
```

Функция по умолчанию берёт global, но принимает внедрённую реализацию. В тестах можно подставить fake. В адаптерах старого runtime — полифилл. В продакшене — встроенный путь. Тело функции честно показывает зависимость.

Стабильным data-объектам нужно меньше церемоний. `URL`, `URLSearchParams`, `TextEncoder`, `TextDecoder`, `Blob` и классы fetch можно использовать напрямую в приложении — это часть современной платформы Node. Осторожность — у globals, которые в доках ещё experimental, active development, release candidate или управляются флагами.

## fetch как HTTP-клиент Node.js

`fetch()` — global-функция, которая запускает HTTP(S)-запрос и возвращает `Promise` на `Response`.

```js
const response = await fetch('https://example.com/status');

console.log(response.status);
console.log(await response.text());
```

Вызов создаёт запрос, передаёт его встроенной реализации fetch Node, ждёт заголовки ответа и отдаёт JavaScript-объект `Response`. Тело ответа может ещё стримиться, когда `Promise` резолвится. Статус и заголовки доступны раньше. Байты body приходят через тело ответа.

`fetch()` в Node работает на Undici. Undici — HTTP-клиент Node для этой поверхности API. Под fetch лежит низкоуровневая клиентская машинерия: dispatch запросов, переиспользование соединений, разбор ответа, стриминг body и перевод низкоуровневых сбоев в web-совместимые объекты и ошибки. Пул соединений Undici и поведение HTTP-клиента подробно — в сетевой части nodebook (глава 10). Здесь важно размещение: `fetch()` — публичный global, Undici — под ним.

Версию вшитого Undici видно так:

```js
console.log(process.versions.undici);
```

Это число важно в багрепортах. Версия Node включает конкретную версию Undici; поведение может меняться при обновлении bundled dependency. Если в продакшене речь о редиректах fetch, стриминге body, proxy, reuse сокетов — зафиксируйте версию Node и Undici до разбора прикладного кода.

`Request` — объектная форма запроса. Хранит URL, method, headers, body, поля credentials mode из web-контракта и прочие метаданные.

```js
const request = new Request(
    'https://api.example.test/users',
    {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Ada' }),
    }
);
```

Конструктор `Request` только создаёт JavaScript-объект с привязанным источником body. Передача в `fetch()` уже запускает запрос. Это удобно, когда нужно нормализовать headers, один раз прикрепить body и пропустить request через тонкий client wrapper.

`Headers` хранит имена и значения заголовков с web-поведением: имена case-insensitive, итерация даёт нормализованные пары, несколько операций могут объединять значения по правилам Fetch spec для header list. В backend-коде это канонический контейнер, когда API ожидает fetch-объекты.

```js
const headers = new Headers();
headers.set('content-type', 'application/json');
headers.append('x-trace-id', 'req-123');

console.log(headers.get('Content-Type'));
```

Последняя строка возвращает значение content-type. Поиск не чувствителен к регистру — внутренний контейнер сопоставляет сам.

`Response` возвращает fetch и является конструктором для тестов или внутренних границ.

```js
const response = new Response('created', {
    status: 201,
    headers: { location: '/users/123' },
});

console.log(await response.text());
```

У ответа есть body, status и headers. Это data-контейнер с методами потребления body. Синтетический `Response` может оставаться в тестах, моках или адаптерах, пока какой-то API не решит отправить его наружу.

Body mixin — общий контракт body для `Request` и `Response`. Даёт `.text()`, `.json()`, `.arrayBuffer()`, `.blob()`, `.formData()`, а также `.body` (stream) и `.bodyUsed`. Body одноразовый: после чтения объект фиксирует потребление, повторные чтения отклоняются.

```js
const res = new Response(JSON.stringify({ ok: true }));

console.log(await res.json());
console.log(res.bodyUsed);
console.log(await res.text());
```

Первое чтение потребляет body и ставит `bodyUsed` в `true`. Второе отклоняется — байты уже прошли через reader. Одна из самых частых fetch-ошибок в logging middleware: `response.text()` для диагностики, затем вызывающий пытается распарсить JSON из пустого consumed body.

Клонируйте перед двойным чтением.

```js
const copy = response.clone();

console.log(await copy.text());
return response;
```

`clone()` разветвляет body, чтобы два потребителя могли читать. У больших или медленных тел есть последствия по памяти и буферизации. Для маленьких diagnostic body это нормально. Для крупных payload лучше один владелец потребления и стрим байт туда, где они нужны.

Ошибки `fetch()` ближе к web-форме, чем к старым callback-формам Node. Сбой на сетевом уровне отклоняет `Promise`. HTTP-статус вроде `404` резолвится с `response.ok === false`: запрос на уровне протокола завершился, fetch отдаёт объект ответа. Семантика HTTP — в сетевой главе; операционное правило простое: `try/catch` вокруг fetch ловит транспорт и ошибки конструирования, политика статусов — после прихода ответа.

```js
const res = await fetch(url);

if (!res.ok) {
    throw new Error(`bad status: ${res.status}`);
}
```

Эта ветка — политика приложения. Fetch доставил статус. Ваш код решает, приемлем ли он.

Жизненный цикл объекта имеет несколько слоёв.

```
Request object
  -> Undici dispatch
  -> response headers
  -> Response object
  -> web stream body
  -> body reader
```

`Request` — состояние JavaScript: URL, method, headers, опциональный body. Body может быть строкой, `Buffer`, typed array, `Blob`, `FormData`, `URLSearchParams` или stream-like объектом, который принимает fetch. Когда `fetch()` получает request, Node валидирует достаточно состояния для dispatch. Плохой URL, method, имена заголовков или нелегальная форма body могут отклонить promise до сетевой работы.

После dispatch Undici владеет in-flight клиентской работой. Запрос ушёл ниже web-слоя. В JavaScript остаётся `Promise`, у стека fetch — нативное и JS-состояние, связанное с сокетами, таймерами, парсером и очередями body. Когда приходят заголовки, promise резолвится `Response`. Тело может быть ещё не прочитано: handler, проверяющий только status, может выполниться до полного payload.

Состояние body отделено от заголовков. `response.status`, `response.ok`, `response.headers` читаются сразу после resolve. Body остаётся stream. `.text()` или `.json()` сливают stream в память и конвертируют. Ручной стриминг оставляет payload по chunks. Выбор за вызывающим: маленькие метаданные или многогигабайтный export.

Правило one-shot body следует из владения. У body один путь потребления. `.json()` и `.arrayBuffer()` — потребители. Reader из `.body.getReader()` — потребитель. Pipe через transform — потребитель. После старта потребления объект фиксирует это через `bodyUsed` или disturbed stream. Второй потребитель получает rejection.

`.clone()` делит body на две ветки. Полезно и с реальной буферизацией: если одна ветка читает быстро, а другая тормозит, реализация может буферизовать chunks для медленной ветки. Логировать каждое body через clone может превратить client wrapper в источник memory pressure. Для маленьких JSON API компромисс часто приемлем; для крупных загрузок логируйте метаданные или ограниченный префикс через одного владельца stream.

У headers своё guard-поведение. Часть `Headers` mutable, часть ограничена происхождением. У ответа от fetch headers отражают полученный ответ. У собираемого request обычно можно выставлять прикладные headers через конструктор или mutable `Headers`. Запрещённые или генерируемые runtime заголовки может контролировать внутренности fetch. Wrapper-код сосредоточьте на прикладных headers, не пытайтесь микроменеджить транспортные, которыми владеет Undici.

Различайте rejected fetch и fulfilled fetch с плохим статусом. DNS failure, refused connection, невалидный body stream или abort отклоняют promise. Ответ `500` fulfill-ит promise — ответ пришёл. Это контракт web fetch, Node его соблюдает. Backend-wrapper обычно нужны оба слоя:

```js
const res = await fetch(url);

if (res.status >= 500) {
    throw new Error(`upstream failed: ${res.status}`);
}
```

Транспортные сбои — в `try/catch` вокруг вызова; политика статуса — когда `Response` уже есть. Смешивание слоёв шумит в retry и логах: сетевой сбой и решение по статусу upstream несут разные факты.

Редиректы, cookies, cache modes, proxy, keep-alive и connection pooling — ниже или рядом с этой объектной моделью; их владеет сетевая глава и Undici. На этом уровне достаточно графа fetch: создать request, dispatch, получить headers, потребить один body stream.

Abort signals заслуживают узкое упоминание — fetch их принимает.

```js
const signal = AbortSignal.timeout(2_000);
const response = await fetch(url, { signal });
```

Запрос получает signal отмены на две секунды. Если signal abort-ит до завершения, fetch отклоняется. Полный дизайн дедлайнов, propagation отмены, cleanup и retry — позже. Локальный вывод: fetch принимает тот же web-совместимый signal, что и ряд API Node; abort затрагивает и in-flight body, и ожидание заголовков.

Таймауты держите вне низкоуровневых хелперов, если хелпер не владеет политикой. Generic client wrapper может принять signal; service method выбирает deadline. Так транспортная объектная модель остаётся чистой:

```js
export function getJson(url, { signal } = {}) {
    return fetch(url, { signal }).then((res) => res.json());
}
```

Хелпер пробрасывает signal, deadline оставляет вызывающему. Но есть решение по body: `.json()` сливает body в память. Для крупных ответов возвращайте `Response` или `ReadableStream`, парсинг — вызывающему. Владение body и владение отмены должны быть видны на одной границе.

## Объекты payload: байты и метаданные

`Blob`, `File` и `FormData` появляются, как только fetch-код обрабатывает upload или сгенерированные payload.

`Blob` — неизменяемый контейнер байт с `size` и MIME type. Собирается из строк, `ArrayBuffer`, typed arrays, других blob и buffers. В Node `Buffer` остаётся и полезен на низком уровне. `Blob` удобен на границах web API — fetch, `Response`, `Request` и form payload его понимают.

```js
const payload = new Blob(['hello\n'], {
    type: 'text/plain',
});

console.log(payload.size);
```

Blob хранит байты; `type` — метаданные. Чтение асинхронно — web-контракт отдаёт promise-методы:

```js
const bytes = await payload.arrayBuffer();
const text = await payload.text();
```

Чтения создают копии в запрошенной форме. Если байты уже в `Buffer`, оставайтесь на `Buffer` для файловой и сокетной работы Node. В `Blob` конвертируйте, когда принимающий API ждёт web payload.

`File` расширяет blob именем и `lastModified`. Это контейнер байт плюс file-like метаданные. Состояние file descriptor остаётся у файловых API Node.

```js
const file = new File(['id,name\n1,Ada\n'], 'users.csv', {
    type: 'text/csv',
    lastModified: Date.now(),
});
```

Конструктор поставляет байты. File descriptor — у `node:fs`. Имя едет как метаданные для API, которым важны имена загружаемых файлов.

`FormData` — контейнер key/value. Значения — строки или blob-like file parts. В Node fetch это объект для body с именованными полями и файлами.

```js
const form = new FormData();
form.set('name', 'Ada');
form.set('avatar', file);

await fetch(url, { method: 'POST', body: form });
```

Детали multipart encoding — в HTTP/API главах. Локально важно владение: `FormData` владеет списком полей; fetch умеет сериализовать body и выставить подходящий content-type. Не задавайте вручную multipart `content-type` с угаданным boundary — пусть сериализатор body создаст boundary, совпадающий с байтами.

В backend легко переиспользовать эти объекты. Сервис, который читает файлы с диска, крутит buffers и пишет в БД, может не выиграть от обёртки каждого массива в `Blob`. На API-границах web-контейнеры снимают клей — fetch stack Node уже на них говорит.

Есть скрытая граница копирования.

`Buffer` может указывать на внешнюю память machinery Node. Typed array может смотреть на `ArrayBuffer`. `Blob` берёт части и даёт неизменяемую последовательность байт по контракту blob. Конструктор принимает входы, но последующие записи в исходный buffer считайте отдельными от логического значения blob. Нужна мутация — оставайтесь на `Buffer`/typed arrays до последней границы. Нужен неизменяемый payload для request — соберите `Blob` и передайте.

`FormData` меняет владение. После `append` `File` или `Blob` форма владеет ссылкой на part и метаданными (имя поля, опциональное filename). Сериализация позже — при производстве body в fetch. Отложенная сериализация — почему fetch может выставить matching boundary; и почему inspect `FormData` показывает список полей, а финальные байты появляются при сериализации body.

```js
for (const [name, value] of form) {
    console.log(name, typeof value);
}
```

Цикл показывает поля до wire bytes. Строка — `string`, file part — объект. `FormData` — структурированный источник body с отложенной сериализацией до потребления fetch.

Типичная ошибка на сервере: хелпер принимает и JSON, и form, но не выбирает форму body один раз:

```js
const body = asForm
    ? buildForm(data)
    : JSON.stringify(data);
const headers = asForm
    ? undefined
    : { 'content-type': 'application/json' };

await fetch(url, { method: 'POST', headers, body });
```

Для `FormData` не трогайте `content-type`. Для JSON-текста задайте его. Два типа payload — два пути заголовков.

`URLSearchParams` тоже может быть body. Для form-style key/value posts fetch потребляет его и выставляет подходящую encoded форму.

```js
const body = new URLSearchParams();
body.set('grant_type', 'client_credentials');

await fetch(tokenUrl, { method: 'POST', body });
```

Это не `FormData`: `URLSearchParams` даёт URL-encoded текст; `FormData` — части полей и файлы; JSON — строка/байты с `application/json`. Выбор объекта payload выбирает путь сериализатора.

Практическое правило backend: держите входной объект у протокольной границы. Domain-код передаёт структурированные значения; client adapter решает, как из них сделать `FormData`, blob, строку или байты. Тесты меньше, сериализация запроса — в одном месте.

## Web Streams на границе

Тела ответов fetch используют Web Streams API.

```js
const response = await fetch(url);
const body = response.body;

console.log(body instanceof ReadableStream);
```

В Node v24 `response.body` — `ReadableStream`. Это web stream type, не класс Node `Readable` из [раздела про streams](../streams/readable-streams.md). Концепции пересекаются: chunks, backpressure, cancellation, ошибки. Объектная модель другая.

Web Streams API — стандартный stream-контракт fetch и других web-совместимых API. У `ReadableStream` — внутренняя очередь, source algorithm и readers. У `WritableStream` — sink и writer. У `TransformStream` — readable и writable стороны с transform между ними.

Самое заметное правило — locking. `.getReader()` блокирует readable web stream на этого reader. Активный reader владеет потреблением эксклюзивно. Конкурирующий `getReader()` или body helper падают, пока первый reader не release lock, не cancel и не завершит stream.

```js
const reader = response.body.getReader();
const first = await reader.read();

console.log(first.done);
reader.releaseLock();
```

Reader владеет потреблением, пока не release, cancel или stream не закончится. `response.text()` тоже потребляет через body-контракт — смешивайте ручных readers и body helpers осторожно.

Lock — не мелочь API. Так stream сохраняет согласованное потребление: reads влияют на очередь, pull timing, cancellation и доставку ошибок. Два независимых reader на одном body гонялись бы за chunks. API выбирает одного reader; конкуренты падают при удерживаемом lock.

Путь через fetch response:

```
socket bytes
  -> Undici parser
  -> Response headers
  -> web ReadableStream body
  -> reader or Body mixin method
  -> JavaScript value
```

Заголовки приходят раньше полного body. Chunks идут через web stream. `.json()` сливает stream, декодирует текст, парсит JSON и резолвится. Ручной reader отдаёт chunks по мере прихода. В любом случае body потребляется один раз.

Backpressure проходит этот путь. У web stream есть queueing strategy и desired size. Когда потребитель замедляется, pull algorithm перестаёт запрашивать chunks, пока не вернётся спрос. Под fetch это связано с Undici и сокетом; точное поведение сокета — в сетевой главе, но на уровне приложения сигнал виден: если `response.body` не читать, байты могут буферизоваться, пока body не cancel, не drain или соединение не закроется по правилам клиента.

Внутренности web stream достаточно назвать здесь — подробности streams в [главе про readable streams](../streams/readable-streams.md). У `ReadableStream` — internal state, queue, слот ошибки и algorithms source (`start`, `pull`, `cancel`). Stream зовёт `pull`, когда очереди нужны данные; `cancel`, когда потребитель сдался. Queueing strategy считает desired size — сигнал backpressure.

```js
const stream = new ReadableStream({
    pull(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
    },
});
```

Сниппет создаёт web readable из underlying source. Controller принимает chunks; `close` завершает stream. В fetch вы чаще получаете stream, а не создаёте; те же control points есть в реализации.

Readers сидят поверх состояния. Default reader отдаёт `{ value, done }`. BYOB reader — для byte streams с буфером от потребителя; для fetch body редко нужен сразу. Главный backend-навык — default read loop:

```js
const reader = response.body.getReader();

for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log(value.byteLength);
}
```

Цикл владеет body до выхода. При throw в реальном коде release или cancel осознанно. `.arrayBuffer()` делает то же внутри, но собирает все chunks до resolve.

Когда Node API ждёт Node streams, используйте адаптеры.

```js
import { Readable } from 'node:stream';

const response = await fetch(url);
const nodeStream = Readable.fromWeb(response.body);
```

Адаптер переводит между Web Streams API и классами stream Node. `Readable.fromWeb()` оборачивает web readable в Node `Readable`. `Readable.toWeb()` — наоборот. Есть адаптеры и для writable, и для duplex.

Адаптер — обёртка: read requests, доставка chunks, backpressure, cancellation, destroy и ошибки между двумя контрактами. Данные всё равно идут через очереди; chunks имеют тип; backpressure зависит от темпа чтения приёмника.

Тип chunk важен. Fetch body обычно отдаёт `Uint8Array`. Node streams часто отдают `Buffer` (subclass `Uint8Array`). Большинству кода достаточно считать chunks байтами; строгие type checks могут ломаться.

```js
for await (const chunk of nodeStream) {
    console.log(chunk.byteLength);
}
```

Цикл использует async iterator; адаптер даёт Node-readable форму.

Обратное направление — когда Node stream должен питать web API:

```js
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';

const file = createReadStream('data.ndjson');
const body = Readable.toWeb(file);
```

`body` — web `ReadableStream`. Часть web-совместимых API принимает его напрямую. Для streaming request body в fetch Node нужна опция `duplex: "half"` — её легко пропустить.

```js
await fetch(url, {
    method: 'POST',
    body,
    duplex: 'half',
});
```

Опция говорит Node, что body стримится. HTTP-причина — в сетевой главе; практическое правило: при streaming body в fetch Node указывайте `duplex: "half"`.

Типичные сбои адаптера выглядят обыденно: web stream locked одним helper и передан другому; body прочитан для лога, затем снова парсится; Node stream эмитит `error`, web consumer видит rejected read; cancel web stream уничтожает Node stream снизу. Если баг на границе web/Node streams — сначала путь владения, потом `highWaterMark` и буферы.

`Readable.isDisturbed()` помогает при отладке: сообщает, читали ли Node readable или web readable или отменяли.

```js
import { Readable } from 'node:stream';

console.log(Readable.isDisturbed(response.body));
```

`true` — какой-то потребитель уже трогал body; дальше ищите первого потребителя.

Адаптеры сохраняют достаточно формы ошибки, но переводят между event models. Node readable эмитит `'error'`; web readable может reject `reader.read()` и перевести stream в errored state. `Readable.fromWeb()` мапит ошибки web в Node; `Readable.toWeb()` — Node в rejected reads. Исходный объект ошибки обычно сохраняется, меняется точка наблюдения.

Destroy и cancellation требуют той же осторожности. Destroy Node stream из web stream cancel-ит web source. Cancel web stream из Node stream destroy-ит Node stream. Это желаемо, когда одна сторона сдаётся; сюрприз, если код ожидал живой source после ранней остановки адаптера.

```js
const nodeStream = Readable.fromWeb(response.body);
nodeStream.destroy(new Error('stop early'));
```

Вызов сообщает обёрнутому body, что потребление завершилось с ошибкой. Для fetch response ранняя cancel может влиять на reuse соединения и cleanup body у клиента — транспортный исход в сетевой главе; локально — владение: адаптер становится потребителем, destroy имеет upstream-эффекты.

Одна форма на границу. Pipeline в основном на Node streams — конвертируйте один раз на краю и оставайтесь в Node streams. Pipeline в основном на fetch и web transforms — держите web streams и `pipeThrough()` / `pipeTo()`. Повторная конвертация усложняет inspect: каждый адаптер — ещё место перевода ошибок, cancel и backpressure.

Ещё ловушка: helper methods скрывают стриминг. `.json()` выглядит как parser, но сначала сливает всё body. `.arrayBuffer()` и `.blob()` — то же. Для ограниченных API responses нормально; для export, media, backup и unknown-size upstream — плохой default.

Стриминговый код должен это говорить возвращаемым типом.

```js
import { Readable } from 'node:stream';

export async function download(url) {
    const res = await fetch(url);
    return Readable.fromWeb(res.body);
}
```

Функция возвращает Node stream — callers pipe, backpressure и ошибки в стиле Node streams. Web-streaming helper вернул бы `res.body`. Parsing helper — данные. У каждого helper — одна модель владения.

Смешение моделей владения и есть баг: helper возвращает `Response` после peek body; caller ждёт свежее body; transform читает web stream и передаёт тот же в `Readable.fromWeb()`; logging клонирует крупные ответы и отстаёт.

## Текстовые и URL-утилиты без лишних зависимостей

`TextEncoder` превращает JavaScript-строки в UTF-8 байты.

```js
const encoder = new TextEncoder();
const bytes = encoder.encode('ready\n');

console.log(bytes.byteLength);
```

Результат — `Uint8Array`, кодировка UTF-8. Хорошо стыкуется с web API, ожидающими typed arrays или byte streams.

`TextDecoder` превращает байты в строки.

```js
const decoder = new TextDecoder('utf-8');
const text = decoder.decode(bytes);

console.log(text);
```

У декодирования есть краевые случаи с неполными multibyte sequences. Для целых буферов хватает `.decode(bytes)`. Для chunked input — `{ stream: true }` до финального chunk, чтобы decoder держал состояние между вызовами.

```js
const decoder = new TextDecoder();

let out = decoder.decode(chunkA, { stream: true });
out += decoder.decode(chunkB);
```

Поэтому существует `TextDecoderStream`, хотя большинству backend хватает `TextDecoder` или Node stream transforms до web stream boundary.

`URL` — стандартный parser и formatter URL.

```js
const url = new URL(
    '/users?id=123',
    'https://api.example.test'
);

console.log(url.pathname);
console.log(url.searchParams.get('id'));
```

Base URL задаёт origin для относительного path. `URLSearchParams` владеет состоянием query string.

```js
const params = new URLSearchParams();
params.set('limit', '50');
params.set('cursor', 'abc');

console.log(params.toString());
```

На границе query всё — строки. Держите границу явной: числа и boolean парсите после чтения; перед записью сериализуйте осознанно.

`URL` нормализует: percent-encoding, разрешение `.` и `..` по правилам URL, доступ к компонентам через свойства. Полезно для callback URL, proxy targets, redirect locations и внутренних endpoints. Ещё одна причина не склеивать URL конкатенацией строк.

```js
const base = new URL('https://api.example.test/v1/');
const users = new URL('users?active=true', base);

console.log(users.href);
```

Получается нормализованный absolute URL. Завершающий `/` у base path важен: при base `https://api.example.test/v1` сегмент `users` заменяет `v1`; при `https://api.example.test/v1/` — `users` под `v1/`.

Query parameters — та же дисциплина. `URLSearchParams` хранит повторяющиеся ключи, строковые значения и encoded output; при итерации повторы сохраняются.

```js
const params = new URLSearchParams('tag=node&tag=runtime');

console.log(params.getAll('tag'));
```

Вернёт оба значения; `get()` — только первое. Backend-фильтры часто допускают повторяющиеся ключи — используйте `getAll()`. Любое значение — недоверенный текст до валидации и приведения к типу приложения.

Парсинг URL — чистое место отклонить неподдерживаемые схемы.

```js
const target = new URL(input);

if (target.protocol !== 'https:') {
    throw new Error('https required');
}
```

Проверка до fetch, редиректов и открытия сокета — базовая обработка ввода, отдельно от security review; держит string parsing вне низкоуровневого клиента.

`URLPattern` сопоставляет компоненты URL с шаблонами. В Node v24 он experimental — это должно формировать продакшен-использование. API полезен для узкого backend routing/validation, где хватает web-standard pattern object.

```js
const pattern = new URLPattern({
    pathname: '/users/:id',
});

console.log(
    pattern.exec('https://x.test/users/42')?.pathname.groups
        .id
);
```

Шаблон разбирает pathname и возвращает named groups. Можно матчить protocol, hostname, port, search, hash, username/password, если они заданы. Sweet spot на backend узкий: валидация или маршрутизация небольшого набора URL на краю своего кода.

Держите `URLPattern` ниже уровня framework. Routing frameworks решают method selection, порядок middleware, policy декодирования path, валидацию параметров, форму ошибок и observability. `URLPattern` только матчит части URL — достаточно для маленьких internal tools и низкоуровневых границ. Проектирование API routing — в отдельной главе (глава 12).

`URLPattern` разделяет match input и groups: успешный match отдаёт group objects по компонентам.

```js
const match = pattern.exec('https://x.test/users/42');

console.log(match.pathname.input);
console.log(match.pathname.groups.id);
```

Удобно для внутренних dispatch tables:

```js
const routes = [
    ['GET', new URLPattern({ pathname: '/users/:id' })],
    ['GET', new URLPattern({ pathname: '/health' })],
];
```

Массиву всё равно нужна прикладная политика: methods, порядок, валидация, ошибки. Pattern отвечает только на вопрос match. Поскольку `URLPattern` experimental в v24, feature detection или тонкий compatibility wrapper — вокруг library code на нескольких линиях Node.

Encoding и URL parsing часто встречаются на границах подписи запросов — важны точные байты. `URLSearchParams` сериализует по своим правилам. `TextEncoder` — UTF-8 для строк. `Buffer.from(string)` тоже UTF-8 по умолчанию, но `Uint8Array` от `TextEncoder` яснее показывает intent для web API.

```js
const canonical = `${url.pathname}?${url.searchParams}`;
const bytes = new TextEncoder().encode(canonical);
```

Массив байт можно отдать hashing/signing. Криптодетали — в security-главе; здесь — детерминированная string-to-byte конверсия: URL через URL objects, каноническая строка, один encode, байты следующему слою.

Для входящих URL парсите один раз на краю и передавайте типизированную форму внутрь.

```js
const url = new URL(requestUrl, 'https://service.local');
const limit = Number(url.searchParams.get('limit') ?? 50);
```

Валидация всё равно проверяет `Number.isInteger(limit)` и диапазон. URL-слой только извлекает текст по правилам парсинга URL. Явная линия не даёт нижним слоям каждому парсить raw URL string по-своему.

## structuredClone копирует значения по правилам runtime

`structuredClone()` копирует значения алгоритмом structured clone.

```js
const copy = structuredClone({
    createdAt: new Date(),
    ids: new Set([1, 2, 3]),
});

console.log(copy.ids.has(2));
```

Клон сохраняет многие встроенные формы, которые JSON сплющил бы или выбросил: `Date`, `Map`, `Set`, typed arrays, `ArrayBuffer`, вложенные массивы, plain objects. Обрабатывает циклы.

```js
const value = { name: 'root' };
value.self = value;

const copy = structuredClone(value);
console.log(copy.self === copy);
```

Structured clone отслеживает identity объектов во время копии. JSON serialization на цикле бросила бы.

Часть значений отклоняется: functions, module namespace objects, promises и многие host objects вне structured-clone set. При сбое — `DOMException`, часто с именем `DataCloneError`.

```js
try {
    structuredClone({ run() {} });
} catch (err) {
    console.log(err.name);
}
```

`DOMException` — web-совместимый класс ошибок для ряда этих API. `name` часто несёт категорию: `DataCloneError`, `AbortError`, `QuotaExceededError` и другие web-defined имена в зависимости от API. Считайте `name` частью контракта границы при interop с web-совместимыми API.

Transfers — часть structured clone. `ArrayBuffer` можно передать в клон через transfer list.

```js
const buffer = new ArrayBuffer(16);
const copy = structuredClone(buffer, {
    transfer: [buffer],
});

console.log(buffer.byteLength);
console.log(copy.byteLength);
```

После transfer исходный buffer detached, `byteLength` нуля. Острый край: полезно, когда владение должно переехать; баг, если caller ожидал пользоваться оригиналом. Worker communication — в своей главе; здесь: clone копирует поддерживаемые значения; transfer переносит backing storage.

Результат clone имеет свежую object identity. Cloned `Map` — другой `Map`; cloned typed array — другой wrapper; скопированный `ArrayBuffer` — отдельное backing, если не transfer. Shared backing остаётся только там, где так говорит контракт (`SharedArrayBuffer`).

`structuredClone()` удобен для boundary snapshots: конфиг или test fixture с maps, sets, dates, typed arrays или циклами сохраняет больше runtime shape, чем JSON, и раньше отклоняет неподдерживаемые значения, чем ручной shallow copy, тащащий functions или live handles.

Используйте для данных. Ресурсы держите снаружи. File handles, sockets, streams и module objects привязаны к lifecycle процесса. Граница clone несёт values; live capabilities — вне. Если в графе stream body или request object — API-specific clone (`Request.clone()`, `Response.clone()`), только когда split body задуман.

## Globals с чувствительной стабильностью: feature detection

Часть web-совместимых globals в Node v24 стабильна. Часть experimental или active development. Часть отключается флагами. В package code трактуйте их как runtime features с явными проверками.

Feature detection дёшев:

```js
if (typeof URLPattern === 'function') {
    console.log('URLPattern available');
}
```

Лучше, чем смотреть только major version Node, когда API за флагом, отключается флагом или зависит от exact build.

Небольшой startup probe делает контракт процесса явным:

```js
const required = [
    'fetch',
    'Request',
    'Response',
    'ReadableStream',
];

for (const name of required) {
    if (typeof globalThis[name] === 'undefined')
        throw new Error(name);
}
```

Это уместно в приложениях со strict runtime contract. Библиотеки предпочитают injected capabilities или graceful fallback — они живут в чужом процессе. Приложение может fail fast — оно владеет deployment image и версией Node.

`navigator` в Node — частичный process-level объект, вдохновлённый браузерным `navigator`. В v24 — active development. Поля вроде `hardwareConcurrency`, `language`, `languages`, `platform`, `userAgent` описывают экземпляр Node и runtime environment, не состояние вкладки браузера.

```js
console.log(navigator.userAgent);
console.log(navigator.hardwareConcurrency);
```

`navigator.hardwareConcurrency` — логические процессоры, доступные экземпляру Node; может отражать ограничения процесса. Полезный сигнал, но не замена политике thread pool, worker count и concurrency jobs.

Web Storage опаснее в backend. Node v24 включает `localStorage` и `sessionStorage` как release-candidate web storage APIs. `localStorage` хранит незашифрованные данные в файле из `--localstorage-file`, квота 10 MB. `sessionStorage` — в памяти текущего процесса. Серверный код разделяет process globals между запросами — request-specific или user-specific данные принадлежат application-owned store.

```js
if (typeof localStorage === 'object') {
    localStorage.setItem('last-start', String(Date.now()));
}
```

Код пишет process-level state. На сервере каждый request handler видит тот же global storage object. Используйте для tooling experiments или process-local metadata только при явном startup contract. User session data — в своём хранилище.

`CompressionStream` и `DecompressionStream` — web-совместимые compression transforms, в Node v24 stable globals, на web streams; стыкуются с fetch bodies и другими web stream paths.

```js
const compressed = response.body.pipeThrough(
    new CompressionStream('gzip')
);
```

Старая `node:zlib` всё ещё важна для Node stream pipelines и низкоуровневого контроля compression. Выбор следует границе: web streams с одной стороны, Node streams — с другой.

`BroadcastChannel` — именованный message channel. В Node полезен вокруг workers и runtime contexts в той же process-level channel model. Дизайн workers — в главе 15; здесь достаточно объекта: named channel, события `message`, явный `close`.

```js
const channel = new BroadcastChannel('events');
channel.postMessage({ type: 'ready' });
channel.close();
```

`WebSocket` — global в Node v24, stable, browser-compatible client shape. Протокол — в сетевой главе (глава 13); не смешивайте с generic fetch wrappers. WebSocket — долгоживущий двунаправленный protocol endpoint со своей state machine.

`EventSource` — global для Server-Sent Events. SSE тоже в главе 13. Перед опорой на API — feature detection: флаги и стабильность менялись между недавними релизами Node.

Web Crypto доступен через globals `crypto` и `SubtleCrypto`, когда бинарник Node собран с crypto module. Security-глава владеет API; здесь достаточно упоминания — у crypto code свои policy, key management и выбор алгоритмов.

`AbortController` и `AbortSignal` проходят через fetch и stream APIs. Они уже web-совместимые globals; дизайн cancellation — позже. В этой главе: передавайте signal, когда API принимает; timeout и cancellation policy — у вызывающего слоя.

Глубже паттерн стабилен: feature-detect web-совместимые globals, когда важны стабильность или флаги; используйте fetch objects и web streams там, где их выставляет Node; конвертируйте на границе, когда Node API ждёт Node streams или buffers; протокольную семантику оставляйте владеющим главам — web-объект только JavaScript-поверхность над более низким стеком.

Именно на этой границе часто начинаются продакшен-баги. Пакет считает Node «как браузер», потому что есть `fetch`. Потом тянут `localStorage`, `EventSource`, `URLPattern` или новые поля `navigator` и попадают в stability/flag-sensitive зону. Service wrapper отключает global флагом CLI. Test runner — другой major Node. Bundled library тащит полифилл с поведением, расходящимся со встроенным объектом.

Исправление скучное и явное. Владейте runtime contract у startup:

```js
export const platform = {
    fetch,
    URLPattern: globalThis.URLPattern ?? null,
    storage: globalThis.localStorage ?? null,
};
```

Модуль даёт приложению одно место inspect. Тесты честнее: `URLPattern = null` и проверка fallback. Production boot check может отклонить отсутствующую stable dependency до приёма трафика.

Для библиотек контракт ещё меньше: принимайте объекты от callers, deep package code без global reads. Функция с injected `fetch`, `Request` или `ReadableStream` проще в Node, браузерах, workers и тестах. Runtime globals удобны на краю приложения; передача объекта вглубь держит зависимость видимой.

Web-совместимую поверхность Node лучше трактовать как набор нативных boundary types. Это реальные globals, backed Node runtime code; меньше adapter code. Но те же правила body, stream, clone и stability, что у реализуемых API. Следуйте им напрямую — поверхность остаётся достаточно малой, чтобы рассуждать о ней.

## Связанное чтение

-   Предыдущая: [.env-файлы в Node.js](./env-files-configuration.md)
-   Далее: [TypeScript и compile cache в Node.js](./typescript-compile-cache.md)
