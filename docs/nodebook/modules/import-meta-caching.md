---
description: import.meta в Node.js — URL, кэширование ESM и состояние модулей
---

# import.meta в Node.js: URL, кэширование и состояние модулей

Источник: [theNodeBook — import.meta: URLs, Caching & Module State](https://www.thenodebook.com/modules/import-meta-caching)

`import.meta` — объект метаданных **на модуль** для ES Modules в Node.js. Через него доступны расположение модуля и состояние, которое предоставляет загрузчик, без обёрточных переменных CommonJS. В Node v24 типичные поля: `import.meta.url`, `import.meta.filename`, `import.meta.dirname`, `import.meta.main` и `import.meta.resolve()`.

## import.meta и кэширование ESM в Node.js

Кэширование ESM отделено от `require.cache`. Загрузчик ESM индексирует записи модулей по URL и отслеживает фазы parsing, linking, evaluating и evaluated. При циклических зависимостях проявляются **живые привязки**, созданные на этапе linking — поэтому важно, в какой момент evaluation доходит до присваивания экспорту.

## import.meta

В CJS `__filename` и `__dirname` «приходят сами» — их подставляет функция-обёртка модуля (см. главу 1). В ESM обёртки нет. Нет встроенных «магических» переменных на этапе загрузки. Информация о расположении модуля живёт на другом объекте — `import.meta`.

`import.meta` — объект, который предоставляет **хост** (среда выполнения). Спецификация ECMAScript задаёт только синтаксис — выражение `import.meta` — и почти ничего не говорит о том, какие у него должны быть свойства. Это оставлено хосту. В браузерах обычно есть лишь `import.meta.url`. Node добавляет больше полей, и набор расширялся в последних major-релизах.

Сам объект создаётся **лениво**. V8 выделяет его при первом обращении к `import.meta` в данном модуле. Если вы его не трогаете, V8 не вызывает callback инициализации Node. У каждого модуля свой экземпляр `import.meta` — общего объекта на весь граф модулей нет.

### import.meta.url

У каждого ES-модуля `import.meta.url` — строка `file://` URL, указывающая на исходный файл на диске.

```js
console.log(import.meta.url);
// file:///home/app/src/index.mjs
```

Схема URL важна. Это `file://` с ведущим слэшем в authority — на Unix три слэша подряд (`file:///home/...`). В Windows что-то вроде `file:///C:/Users/app/src/index.mjs`. В path-компоненте всегда прямые слэши. Спецсимволы в именах каталогов кодируются: пробел → `%20`, `#` → `%23`.

Практическое применение — построение относительных путей. `import.meta.url` — полноценная URL-строка, её можно передать в конструктор `URL` как base:

```js
const dataUrl = new URL('./data.json', import.meta.url);
console.log(dataUrl.pathname);
// /home/app/src/data.json
```

Конструктор `URL` разрешает относительный путь по правилам URL. На выходе объект `URL`, а `.pathname` — path-компонент. Но `.pathname` всё ещё **URL-encoded**. Файл `/home/my app/data.json` даст pathname `/home/my%20app/data.json`. Для нативного пути ОС (декодированного, с обратными слэшами в Windows) нужен `url.fileURLToPath()` из `node:url`.

До появления `import.meta.filename` и `import.meta.dirname` паттерн `new URL` + `fileURLToPath` был единственным способом получить аналог `__filename` и `__dirname` в ESM. Его везде писали в ранних ESM-кодовых базах:

```js
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

Шесть строк вместо «бесплатного» CJS. Легко ошибиться — забывали `fileURLToPath`, передавали `file://` URL напрямую в `fs.readFileSync` и удивлялись, почему на Linux работало, а на Windows (с буквой диска) — нет.

### import.meta.filename и import.meta.dirname

В Node v21.2.0 появились `import.meta.filename` и `import.meta.dirname`. В Node v24 они стабильны и делают ровно то, что ожидается.

```js
console.log(import.meta.filename);
// /home/app/src/index.mjs

console.log(import.meta.dirname);
// /home/app/src
```

Это обычные пути файловой системы: без URL-encoding, без префикса `file://`, абсолютная строка, понятная ОС. `import.meta.filename` совпадает с `fileURLToPath(import.meta.url)`. `import.meta.dirname` — с `dirname(import.meta.filename)`. Старый шестистрочный паттерн устарел.

Нюанс: свойства есть только если модуль загружен с `file://` URL. При загрузке по `https://` (экспериментальные сетевые импорты Node) или с `data:` URL и `filename`, и `dirname` будут `undefined`. `import.meta.url` в таких случаях работает, но схема не `file://`. Для кода с диска (почти весь продакшен Node) этот крайний случай не важен.

Ещё нюанс: `import.meta.filename` **следует symlink**. Если `/home/app/lib/index.mjs` — симлинк на `/home/shared/lib/index.mjs`, `import.meta.filename` вернёт путь симлинка, по которому модуль реально загрузили, а не обязательно realpath. Поведение зависит от флага `-preserve-symlinks`.

### import.meta.resolve()

`import.meta.resolve()` принимает спецификатор модуля и возвращает полностью разрешённую URL-строку в контексте текущего модуля.

```js
const resolved = import.meta.resolve('lodash');
console.log(resolved);
// file:///home/app/node_modules/lodash/lodash.js
```

Значение всегда URL-строка; для локальных пакетов — со схемой `file://`. Для bare specifier вроде `'lodash'` проходит алгоритм разрешения: `node_modules`, `exports` в `package.json`, conditions, subpath patterns и т.д. Для относительных путей вроде `'./utils.js'` — относительно URL текущего модуля. Для встроенных модулей — `node:` URL: `import.meta.resolve('fs')` → `'node:fs'`.

В Node v24 `import.meta.resolve()` **синхронен**. В спецификации изначально допускался Promise (в ранних версиях Node это было за флагом), но стабильным стало синхронное поведение. Метод **разрешает путь**, не загружает модуль и не выполняет код — только URL-строка.

Это ESM-аналог `require.resolve()` из CJS. Те же сценарии: где лежит пакет на диске, есть ли модуль (при неудаче — `ERR_MODULE_NOT_FOUND`), пути относительно зависимости, передача пути в другой API.

```js
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const schemaUrl = import.meta.resolve('my-lib/schema.json');
const schema = readFileSync(
    fileURLToPath(schemaUrl),
    'utf8'
);
```

Спецификатор разрешён в URL, URL превращён в путь, файл прочитан. Сам `my-lib` не импортировали — использовали только контекст разрешения, чтобы найти файл в пакете.

Частая ловушка: `import.meta.resolve()` учитывает поле `exports` в `package.json` целевого пакета. Если `schema.json` не экспортирован в `exports`, разрешение падает, хотя файл на диске есть. Резолвер уважает инкапсуляцию. `require.resolve()` в CJS в большинстве случаев обходит `exports`, поэтому при миграции CJS → ESM возможны неожиданные ошибки разрешения.

### Как заполняется import.meta

V8 не знает про пути файлов и модульную систему Node. При evaluation, когда в исходнике встречается `import.meta`, вызывается хостовый hook. Node регистрирует его при bootstrap — `importMetaInitializeCallback`.

Callback получает два аргумента: объект `import.meta` (пустой, только что созданный V8) и внутреннюю запись `Module`. C++-слой Node берёт URL модуля из binding `ModuleWrap` (C++-класс над `v8::Module`) и заполняет свойства:

-   `url` — URL модуля из `ModuleWrap`;
-   `filename` — `fileURLToPath()` от URL; если схема не `file://`, остаётся `undefined`;
-   `dirname` — `dirname()` от filename; тот же caveat;
-   `resolve` — функция, привязанная к URL текущего модуля; внутри вызывается `ESMLoader.resolve()` с parent = URL модуля, чтобы спецификаторы разрешались от правильного места.

Заполнение **ленивое** — callback срабатывает при первом обращении к `import.meta` в модуле. Модуль только с экспортами функций и без `import.meta` callback не вызовет. На больших деревьях зависимостей, где большинству модулей не нужен свой путь, это небольшая оптимизация.

Реализация: `lib/internal/modules/esm/initialize_import_meta.js` (в v24), C++ — `ModuleWrap::InitializeImportMeta` в `src/module_wrap.cc`. JavaScript-файл небольшой — порядка 30 строк; сложность в мосте C++ между hooks V8 и слоем JS Node.

## Кэширование модулей

И CJS, и ESM кэшируют загруженные модули. После load + evaluate повторный запрос того же модуля возвращает кэш без повторного чтения и выполнения исходника. В проекте из 500 файлов утилиту могут `require` или `import` из 200 мест — файл читается и выполняется один раз, все потребители получают один результат.

Механика кэша — структуры данных, ключи, что делать со «устаревшими» записями — у систем сильно расходится.

### Module.\_cache

При `require('./foo')` Node разрешает путь в абсолютный filename (например `/home/app/foo.js`) и смотрит `Module._cache['/home/app/foo.js']`. При попадании сразу возвращается кэшированный `module.exports` — без чтения файла, компиляции и evaluation.

`Module._cache` — обычный JavaScript-объект. Ключи — абсолютные пути после разрешения. Значения — экземпляры `Module` с `.exports`, `.id`, `.filename`, `.loaded`, `.children`, `.paths`.

`require.cache` — **тот же объект**:

```js
console.log(require.cache === Module._cache);
// true (когда Module — require('module'))
```

По `require.cache` видно все загруженные CJS-модули процесса. В среднем Express-приложении — тысячи записей.

Раз это обычный объект, из него можно удалять записи:

```js
delete require.cache[require.resolve('./myModule')];
```

Следующий `require('./myModule')` снова прочитает файл с диска, скомпилирует, выполнит и положит новую запись. Hot reload в dev так и устроен: `nodemon` и серверы на `chokidar` при изменении файла удаляют записи и перезагружают модули.

Но есть подвох. Удаление из кэша **не обновляет** уже существующие ссылки. Если другой модуль уже сохранил старый `module.exports`, он по-прежнему указывает на старую версию. Запись выгнали из кэша, а каждый уже выполненный `const foo = require('./foo')` держит локальный `foo` на устаревших exports. Старые замыкания живут.

Инвалидация кэша в CJS **частичная**. Новый `require()` получит свежие exports, старые ссылки — «осиротевшие» копии. Для нормального hot reload нужно перезагружать цепочку зависимостей от изменённого модуля до entry point. Некоторые библиотеки так и делают (граф зависимостей + транзитивная инвалидация), но это хрупко.

Ещё нюанс — `module.children`. Когда A делает `require` B, B попадает в `children` у A. Удаление B из `require.cache` не убирает B из `children` A. Для изоляции модулей между тестами иногда обходят и `children`.

### Ключи кэша CJS и symlink

Ключ кэша — разрешённый filename: абсолютный путь после symlink через `fs.realpathSync()`. Если `/home/app/node_modules/foo` — симлинк на `/home/shared/foo`, ключ — `/home/shared/foo/index.js`. Два `require()` по разным symlink-путям к одному файлу попадут в одну запись кэша.

Есть и `Module._realpathCache` — без кэша realpath на каждый `require()` было бы слишком дорого.

Флаг `-preserve-symlinks` меняет поведение: ключом становится путь симлинка, а не цель. Один физический файл через два symlink даст **две** записи кэша и два экземпляра модуля. В monorepo с workspace symlink иногда это нужно, но может породить дубликаты модулей.

### Module map (карта модулей ESM)

Кэш ESM устроен иначе. Он внутри загрузчика ESM — нет пользовательского `import.cache`. Публичного API нет. Карта живёт в `lib/internal/modules/esm/module_map.js` — экземпляр `SafeMap` (усиленный `Map` против prototype pollution).

Ключ — **строка URL**. `import './foo.js'` разрешается в `file:///home/app/foo.js` и ищется в карте. Запись есть — тот же экземпляр модуля.

Query и fragment — **разные** ключи:

```js
import './foo.js'; // file:///home/app/foo.js
import './foo.js?v=1'; // file:///home/app/foo.js?v=1
import './foo.js?v=2'; // file:///home/app/foo.js?v=2
```

Один файл на диске — три экземпляра и три evaluation. `?v=1` и `?v=2` — часть URL. В dev этим иногда обходят кэш; каждая новая запись живёт до конца процесса. В цикле — утечка модулей.

**Очистить** карту ESM нельзя. Модуль загружен — загружен до exit. Это намеренно: у записей V8 `Module` необратимая state machine. Состояние «evaluated» нельзя откатить в «uninstantiated». Удаление из карты оставило бы live binding на освобождённые слоты.

### Синглтоны через кэш

Раз CJS и ESM кэшируют модули, любое состояние на уровне модуля — **синглтон на процесс**: одна evaluation, один набор переменных, общий для всех импортёров.

```js
// counter.mjs
let count = 0;
export function increment() {
    count++;
}
export function getCount() {
    return count;
}
```

Все, кто импортирует `counter.mjs`, получают одни и те же живые привязки. `increment()` из любого места меняет один `count`.

В CJS то же через общий `module.exports`:

```js
// counter.js
let count = 0;
module.exports = {
    increment() {
        count++;
    },
    getCount() {
        return count;
    },
};
```

Первый `require('./counter')` выполняет модуль и кэширует exports. Каждый следующий `require` — тот же объект. Замыкание над `count` общее.

Отдельный singleton-класс не нужен — кэш модулей всё делает сам, пока все потребители попадают в **одну** запись кэша.

Ловушка: разные записи кэша — разные экземпляры и разное состояние. Пакет в двух `node_modules` (корень и вложенная зависимость) — два evaluation, два пула БД, два config. Дубликаты в monorepo почти всегда от этого. `npm ls` помогает найти дубли.

## Состояния модулей V8 и внутренности кэша

Карта ESM в Node — `SafeMap` по URL. Значения — `ModuleJob`: жизненный цикл от fetch исходника до evaluation.

Каждый `ModuleJob` оборачивает `ModuleWrap` (C++ между JS Node и `v8::Module`). У внутреннего `Module` в V8 поле status проходит строгую последовательность. Отсюда неизменяемость ESM-кэша и поведение циклов.

**Uninstantiated.** Исходник распарсен, запись модуля создана. V8 знает imports/exports по статическому анализу `import`/`export`, но слоты привязок ещё не выделены — пока метаданные, не «живые» значения.

**Instantiating.** Выделяются слоты, граф связывается. V8 обходит граф depth-first, для каждого import вызывает resolve hook Node, находит export и **проводит** import-слот к export-слоту на уровне памяти — не копия, а ссылка на привязку экспортёра.

При цикле, если модуль уже в состоянии instantiating, V8 не падает: фиксирует привязку как существующую, но возможно неинициализированную к моменту evaluation (TDZ).

**Instantiated.** Все привязки связаны. Код модулей ещё не выполнялся — слоты в TDZ.

**Evaluating.** Выполняется top-level код. Присваивания `let`/`const`/`var` заполняют export-слоты; импортёры видят значения через live binding. Если зависимый модуль читает export раньше присваивания (цикл) — `ReferenceError`, слот ещё в TDZ.

**Evaluated.** Evaluation успешна. Export-значения зафиксированы на момент завершения top-level (для `let` и мутабельных объектов изменения после evaluation импортёры всё равно видят). Статус **необратим** — отката нет.

**Errored.** Evaluation бросил исключение. Ошибка кэшируется на записи модуля; повторный доступ снова бросает ту же ошибку. Retry нет. Исправили файл — перезапуск процесса или в dev cache busting через query string и динамический `import()` с другим URL.

### CJS: порядок и циклы

В `Module._load()` для нового модуля:

1.  Создаётся `Module`, `module.exports = {}`.
2.  Запись кладётся в `Module._cache[filename]` **до** evaluation.
3.  Компиляция (обёртка).
4.  Выполнение — заполнение `module.exports`.

Шаг 2 раньше шага 4. Циклический `require` находит частично заполненный кэш и возвращает текущий `module.exports` — не ждёт конца evaluation.

ESM иначе: `ModuleJob` появляется рано, но слоты реально неинициализированы до присваивания. Нет «пустого объекта-заглушки» — есть TDZ и явный `ReferenceError`.

Инвалидация ESM намеренно невозможна: после evaluated V8 не сбрасывает модуль; слоты — адреса памяти, на которые ссылаются другие модули после linking. Удаление из карты Node оставило бы zombie live bindings.

CJS-кэш — обычный объект: `delete require.cache[key]` работает для dev hot reload, но грубо и недостаточно для сложной изоляции.

## Циклические зависимости

Два модуля, импортирующие друг друга, — цикл. Обе системы не валят процесс, но поведение разное: одна и та же структура может работать в CJS и падать в ESM.

### Частичные exports в CJS

Классический пример — `a.js` и `b.js` с взаимным `require`.

```js
// a.js
module.exports.x = 1;
const b = require('./b');
module.exports.y = 2;
console.log('a sees b:', b);
```

```js
// b.js
const a = require('./a');
module.exports.value = 42;
console.log('b sees a:', a);
```

`node a.js`:

Node грузит `a.js`: `module.exports = {}`, в кэш, evaluation. `module.exports.x = 1` → кэш `{ x: 1 }`. `require('./b')` — грузится `b.js`. В `b.js` первой строкой `require('./a')` — в кэше уже `a` с `{ x: 1 }` без `y`. `a.js` приостановлен на `require('./b')`.

`b.js` ставит `value: 42`, логирует `b sees a: { x: 1 }`, возвращается. `a.js` продолжается: `y: 2`, лог `a sees b: { value: 42 }`.

```
b sees a: { x: 1 }
a sees b: { value: 42 }
```

`b.js` видел **снимок** exports `a.js` — только то, что успели присвоить до циклического `require`. Свойство `y` в тот момент недоступно.

Нюанс: локальная переменная `a` в `b.js` — ссылка на **тот же** объект `module.exports`. Отложенный доступ видит полную картину:

```js
// b.js (отложенный доступ)
const a = require('./a');
module.exports.value = 42;
module.exports.getA = () => a;
```

После завершения `a.js` вызов `getA()` вернёт `{ x: 1, y: 2 }`.

Опасный случай — **полная замена** `module.exports` в конце `a.js`. Новый объект в кэше, а `b.js` держит старый `{}` с только `x`. Поэтому в циклах чаще **добавляют** свойства к `module.exports`, а не переназначают объект целиком.

### Живые привязки и TDZ в ESM

В ESM циклы проходят через live binding: не снимок объекта, а слот в scope экспортёра. Слот может быть неинициализирован.

```js
// a.mjs
import { value } from './b.mjs';
export const x = 1;
console.log('a sees value:', value);
```

```js
// b.mjs
import { x } from './a.mjs';
export const value = 42;
console.log('b sees x:', x);
```

Parse → граф и цикл. Instantiate → слоты связаны. Evaluation: если начать с `a.mjs`, на `console.log(..., value)` слот `value` из `b.mjs` ещё в TDZ:

```
ReferenceError: Cannot access 'value' before initialization
```

В CJS вы получаете объект (возможно наполовину). В ESM — либо значение присвоено, либо TDZ. Бинарно.

После присваивания все видят актуальное значение сразу — без устаревших копий. Если порядок evaluation удачный:

```js
// c.mjs
export let count = 0;
import { logCount } from './d.mjs';
count = 10;
logCount();
```

```js
// d.mjs
import { count } from './c.mjs';
export function logCount() {
    console.log('count is:', count);
}
```

К моменту вызова `logCount()` `count` уже `10` — чтение в **момент вызова**, не в момент статического import.

Экспорт **функций** — частый обход циклов: тело функции выполняется позже, к тому времени привязки обычно инициализированы. `export const snapshot = count` на top-level в цикле — TDZ или «раннее» значение.

### Обнаружение и разрыв циклов

Циклы часто симптом переплетённой ответственности. Практика:

**Обнаружение.** В ESM — `ReferenceError` при старте. В CJS цикл **тихий**: частичные exports, `undefined` позже. Инструменты: `madge -circular src/`, `dpdm` для TypeScript.

**Вынести общее** в `shared.js` без обратных импортов в `a`/`b`.

**Инверсия зависимостей** — callback/интерфейс в runtime вместо статического import.

**Ленивый require (CJS)** — `require()` внутри функции:

```js
// a.js
module.exports.x = 1;
module.exports.getB = () => require('./b');
```

**Динамический import (ESM)**:

```js
// a.mjs
export const x = 1;
export async function getB() {
    const b = await import('./b.mjs');
    return b.value;
}
```

Статический граф без цикла; `import()` в момент вызова, когда `b.mjs` уже evaluated или грузится отдельно.

Циклы формально допустимы в обеих системах, но код, зависящий от порядка evaluation, хрупок. Рефакторинг entry point или импортов ломает такое незаметно. Разорвать граф почти всегда выгоднее.

## Связанное чтение

-   Предыдущая: [CommonJS и ES Modules в Node.js: require(), import и dual packages](./cjs-esm-interop.md)
-   Далее: [Error-first callbacks в Node.js: паттерн колбэка и нативный dispatch](https://www.thenodebook.com/async-patterns/callback-patterns)
