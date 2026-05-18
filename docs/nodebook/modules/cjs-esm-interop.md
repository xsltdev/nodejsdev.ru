---
description: Взаимодействие CommonJS и ES Modules в Node.js — require(esm), cjs-module-lexer, dual packages и conditional exports
---

# Взаимодействие CommonJS и ES Modules в Node.js: dual packages

Источник: [theNodeBook — CommonJS/ESM Interop](https://www.thenodebook.com/modules/cjs-esm-interop)

Взаимодействие CommonJS и ES Modules (interop) — набор правил, по которым Node связывает одну систему модулей с другой. Проблема обычно всплывает в смешанных пакетах, dual-сборках и графах зависимостей, где одновременно есть `require()` и `import`. ESM может импортировать CommonJS и получает namespace, сформированный из `module.exports`. CommonJS достигает ESM через современные пути interop в Node с ограничениями по времени вокруг асинхронных возможностей ESM.

## Взаимодействие CommonJS и ES Modules в Node.js

Проблемы interop чаще всего связаны с **идентичностью** и **временем**. Один и тот же пакет может экспонировать отдельные CJS- и ESM-точки входа — и тогда появляются два экземпляра модуля. Именованный импорт из CJS зависит от статического анализа и синтетического namespace. Conditional exports делают границу пакета явной.

Системы CJS и ESM сосуществуют в одном runtime, но проектировались не вместе. CJS появился раньше — синхронный, динамический, вокруг `module.exports` и кэша по путям файлов. ESM пришёл позже — по замыслу асинхронный, со статическим анализом, live bindings и многофазным pipeline загрузки. Свести их в одну среду потребовало инженерных компромиссов — и именно в них живёт большая часть путаницы с interop.

Вы уже знаете, как каждая система устроена внутри. Подглавы 01 и 02 разбирали цепочку `require()` в CJS и алгоритм разрешения. Подглава 03 — pipeline ESM (parse-link-evaluate) и статический анализ. Сейчас вопрос другой: **что происходит на границе?** Когда ESM импортирует CJS-модуль или CJS делает `require()` ESM-модуля — чьи правила побеждают?

Ответ зависит от **направления**. И он существенно менялся между версиями Node.

## Поле `"type"` и расширения файлов

В подглаве 03 описано, как Node определяет формат модуля до парсинга. Кратко — потому что это постоянно всплывает при interop:

-   файлы `.mjs` **всегда** ESM;
-   файлы `.cjs` **всегда** CJS;
-   файлы `.js` следуют ближайшему `package.json` и полю `"type"`: `"type": "module"` — ESM; `"type": "commonjs"` или отсутствие поля — CJS.

Эти правила абсолютны. Никакой runtime-флаг не переопределяет их для файлов на диске. Поле `"type"` — самая влиятельная строка в `package.json` при работе с interop: она определяет, что означает `.js` во всём пакете.

## Импорт CJS из ESM

Более простое направление. ESM может импортировать CJS-модули — и это работает в целом так, как ожидается.

### Статический import

```javascript
import config from './config.cjs';
```

Когда ESM импортирует CJS-модуль, Node выполняет CJS **синхронно** (внутри через обычный путь `require()`), затем оборачивает результат. Значение `module.exports` из CJS становится **default export** в контексте ESM.

Если CJS-модуль делает:

```javascript
module.exports = { port: 3000, host: 'localhost' };
```

то ESM-импорт получает `{ port: 3000, host: 'localhost' }` как default export. Свойства доступны как `config.port` и `config.host`.

Это интуитивно. Сложнее — **именованные экспорты**.

### Извлечение именованных экспортов из CJS

При импорте CJS из ESM Node пытается извлечь named exports. Поэтому иногда работает:

```javascript
import { readFileSync } from 'node:fs';
```

хотя `node:fs` внутри технически CJS-модуль. Node использует библиотеку `cjs-module-lexer` для **статического** анализа исходника CJS и поиска имён экспортов. Если анализ успешен, эти имена становятся named exports **в дополнение** к default export: default — весь объект `module.exports`, named — отдельные свойства, которые lexer обнаружил.

Вот что часто сбивает с толку: named exports и default **сосуществуют**. Если CJS делает `module.exports = { foo: 1, bar: 2 }` и lexer нашёл `foo` и `bar`, из ESM работают все три варианта:

```javascript
import whole from './lib.cjs'; // { foo: 1, bar: 2 }
import { foo, bar } from './lib.cjs'; // 1, 2
import whole2, { foo as f } from './lib.cjs'; // оба
```

Default даёт весь объект. Named — отдельные свойства. Можно смешивать в одном import.

**Ограничение:** статический анализ CJS принципиально ограничен. `cjs-module-lexer` видит типичные паттерны:

```javascript
exports.foo = 42;
module.exports.bar = 'hello';
```

Также `Object.defineProperty(exports, ...)` и некоторые варианты `exports = { ... }`. Но код **не выполняется** — только сканируется синтаксис.

Что не сработает? **Динамические** экспорты:

```javascript
const methods = ['get', 'post', 'put', 'delete'];
methods.forEach((m) => {
    exports[m] = createHandler(m);
});
```

Lexer не увидит эти имена: они вычисляются в runtime из массива. Статический анализ видит `forEach`, а не присваивания экспортам. Для таких модулей остаётся только default export.

Практика: при импорте из CJS сначала пробуйте named import. Если Node извлёк имена — удобный синтаксис. Если нет — на этапе загрузки будет ошибка, что named export не существует. Тогда default import и деструктуризация:

```javascript
import pkg from './dynamic-exports.cjs';
const { get, post, put } = pkg;
```

Это обычная деструктуризация: копирует значения, не создаёт live bindings. Для CJS interop это обычно нормально — экспорты CJS и так снимок состояния.

### Динамический import CJS

`import()` работает и с CJS:

```javascript
const mod = await import('./config.cjs');
console.log(mod.default); // значение module.exports
```

Возвращается module namespace с `default`, указывающим на `module.exports`. Если lexer извлёк named exports, они появятся как дополнительные свойства namespace рядом с `default`.

Тонкость: у namespace **всегда** есть свойство `default`, даже если `module.exports === undefined`. Это контракт. Содержимое `default` зависит от того, что CJS присвоил в `module.exports`.

## Импорт ESM из CJS

Более сложное направление. Исторически — самая болезненная сторона interop.

### ERR_REQUIRE_ESM

Годами вызов `require()` на ESM-модуле бросал `ERR_REQUIRE_ESM`. Без вариантов. CJS мог достучаться до ESM только через динамический `import()`, который возвращает promise:

```javascript
async function loadESM() {
    const mod = await import('./lib.mjs');
    return mod.default;
}
```

Это работает, но вталкивает async-паттерны в код, который мог быть полностью синхронным. Если при старте CJS-приложения вызывается `require('./config')`, а конфиг стал ESM, нельзя просто подменить файл — нужно перестроить startup под promise. Для авторов библиотек это было жёстко: ESM-only пакет ломал всех CJS-потребителей.

Ответ экосистемы был хаотичным: dual-сборки, уход в чистый CJS, ESM-only с советом «используйте dynamic import», бесконечные споры в issues.

### Решение require(esm)

-   Node v22: флаг `-experimental-require-module`;
-   Node v23: по умолчанию, но ещё experimental;
-   Node v24: без флага, стабильно.

С этой возможностью `require()` может загружать ESM-модули. Ограничение одно: ESM-модуль и **весь** его граф зависимостей должны быть **полностью синхронными** — нигде нет top-level await.

```javascript
// работает в Node v24
const { readFile } = require('./esm-utils.mjs');
```

Если в ESM есть top-level await, `require()` бросает `ERR_REQUIRE_ASYNC_MODULE`. Механически это логично: `require()` синхронен и сразу возвращает значение, как `module.exports`. Некуда «подождать» evaluate. Если evaluate не может завершиться синхронно, `require()` не может вернуть результат.

Ограничение **транзитивно**: если `a.mjs` импортирует `b.mjs`, а в `b.mjs` есть top-level await, то `require('./a.mjs')` тоже бросит `ERR_REQUIRE_ASYNC_MODULE`. Весь достижимый граф должен быть синхронным.

При успешном require(esm) вы получаете **module namespace object**. Named exports и default — свойства этого объекта:

```javascript
const utils = require('./utils.mjs');
console.log(utils.default); // default export
console.log(utils.helperFn); // named export
```

Заметьте разницу с `require()` CJS: для CJS возвращается сам `module.exports`. Для ESM — namespace, где default — одно из свойств вместе с named exports.

### Динамический import() из CJS

`import()` из CJS работает на любой версии Node. Возвращает promise с namespace:

```javascript
const mod = await import('./lib.mjs');
console.log(mod.someFunction);
console.log(mod.default);
```

Можно вызывать на top-level в CJS, обернув тело в async IIFE, или только внутри async-функций. Namespace устроен так же, как при статическом import в ESM.

`import()` — универсальный «запасной выход»: не та версия Node, top-level await в цели, странности с `require()` — переходите на `import()`. Он всегда работает. Просто async.

### Сравнение двух направлений

Краткая шпаргалка — асимметрия «CJS из ESM» и «ESM из CJS» постоянно путает:

**CJS из ESM (потребитель — ESM):**

-   `import x from './lib.cjs'` — default = `module.exports`;
-   `import { named } from './lib.cjs'` — работает, если lexer нашёл export;
-   `await import('./lib.cjs')` — `{ default: module.exports, ...namedExports }`;
-   всегда работает, без версий и флагов.

**ESM из CJS (потребитель — CJS):**

-   `require('./lib.mjs')` — namespace object (Node v24+, только синхронный ESM);
-   `await import('./lib.mjs')` — namespace (любая версия Node);
-   у namespace есть `default` и все named exports как свойства;
-   `require()` бросает `ERR_REQUIRE_ASYNC_MODULE`, если в графе есть top-level await.

Главная практическая разница: CJS в ESM даёт `module.exports` как default. ESM из CJS через `require()` даёт **весь** namespace, а default — лишь одно свойство. При переключении паттернов меняется форма того, что вы получаете.

## Опасность dual package (dual package hazard)

Проблема типична для пакетов с **двумя** точками входа — CJS и ESM. Один пакет может загрузиться **дважды**: через CJS-loader и через ESM-loader. Два экземпляра модуля. Две копии любого module-level state.

Сценарий: пакет `my-lib` публикует:

-   `dist/cjs/index.cjs` (CJS);
-   `dist/esm/index.js` (ESM).

Приложение делает `import 'my-lib'` (ESM entry). Где-то в `node_modules` зависимость делает `require('my-lib')` (CJS entry). В памяти две копии `my-lib`. Если библиотека держит внутреннее состояние — пул соединений, кэш конфига, singleton — состояние **дублируется**. Два пула. Два кэша. Два singleton.

Последствия шире памяти: ломается `instanceof` через границу. Объект от ESM-экземпляра не будет `instanceof` класса из CJS-экземпляра, хотя это «тот же» класс «того же» пакета. Любая проверка по идентичности типа молча даёт false.

### Почему так происходит

У CJS и ESM **разные кэши модулей**. CJS — `Module._cache`, ключ — абсолютный путь. ESM — кэш loader'а, ключ — URL. Когда entry — разные файлы (`dist/cjs/index.cjs` vs `dist/esm/index.js`), ключи кэша разные. Два файла — два cache entry — два evaluate.

Даже при функционально идентичном коде runtime считает их **разными** модулями. Дедупликации между loader'ами нет.

### Стратегии смягчения

**Стратегия 1: stateless-пакет.** Только чистые функции, константы, stateless-классы — dual package hazard не страшен. Две копии одних и тех же чистых функций не конфликтуют. Рекомендуемый путь для библиотек, где это возможно.

**Стратегия 2: wrapper.** ESM — каноническая реализация. CJS entry — тонкая обёртка:

```javascript
// dist/cjs/index.cjs
module.exports = require('../esm/index.js');
```

В Node v24 это работает (если нет top-level await): оба entry в итоге выполняют один ESM-модуль. Один экземпляр, один cache entry.

До require(esm) использовали dynamic import:

```javascript
// dist/cjs/index.cjs (legacy)
module.exports = import('../esm/index.js');
```

Но `require()` тогда возвращает promise — ломает синхронных CJS-потребителей. Современный require(esm) чище.

**Стратегия 3: общее состояние в отдельном модуле.** Вынести state в один внутренний модуль (CJS или ESM), который оба entry импортируют. Модуль состояния загружается один раз и кэшируется.

Сложнее wrapper, но нужна, когда один entry не может просто re-export другой.

**Стратегия 4: только ESM.** Перестать публиковать CJS. При Node v18+ ESM-потребители импортируют как обычно; CJS — `import()` или Node с require(esm). Многие пакеты (`chalk`, `execa`, `got` и др.) давно ESM-only. Компромисс: проще сборка, CJS-потребители адаптируются.

Как распознать на практике: module-level `Map`/`Set`/singleton должен быть глобальным, а у потребителей пустой или «дублированный» — вероятно dual loading. Ещё признак: `instanceof` должен проходить, а возвращает false. Отладка: залогировать путь файла, где живёт класс/state, с CJS- и ESM-стороны. Пути разные — два экземпляра.

## Conditional exports в package.json

Поле `"exports"` — механизм dual packages: сопоставляет точки входа с файлами в зависимости от способа загрузки.

```json
{
    "name": "my-lib",
    "exports": {
        ".": {
            "import": "./dist/esm/index.js",
            "require": "./dist/cjs/index.cjs"
        }
    }
}
```

`import 'my-lib'` → условие `"import"` → `./dist/esm/index.js`. `require('my-lib')` → `"require"` → `./dist/cjs/index.cjs`.

Порядок важен: Node проверяет условия сверху вниз и берёт первое совпадение. Для CJS/ESM interop главные — `"import"` и `"require"`, но есть и другие:

-   `"node"` — при запуске в Node.js (vs браузерные бандлеры);
-   `"default"` — fallback;
-   `"types"` — для TypeScript;
-   пользовательские условия — флаг `-conditions`.

Более полная карта:

```json
"exports": {
  ".": {
    "types": "./dist/types/index.d.ts",
    "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.cjs",
    "default": "./dist/esm/index.js"
  }
}
```

`"types"` лучше ставить первым: TypeScript резолвит на этапе сборки. `"default"` — последним как fallback.

### Subpath exports

Несколько точек входа:

```json
"exports": {
  ".": {
    "import": "./dist/esm/index.js",
    "require": "./dist/cjs/index.cjs"
  },
  "./utils": {
    "import": "./dist/esm/utils.js",
    "require": "./dist/cjs/utils.cjs"
  }
}
```

`import { helper } from 'my-lib/utils'` и `const { helper } = require('my-lib/utils')` — каждый в своём формате.

`"exports"` также **закрывает** публичный API: путь не из списка — импорт запрещён. `import 'my-lib/dist/internal/secret.js'` → `ERR_PACKAGE_PATH_NOT_EXPORTED`. Раньше любой файл в пакете был доступен по пути; `"exports"` ввёл инкапсуляцию.

### Fallback `"main"` и `"module"`

Без `"exports"` Node использует `"main"` для CJS:

```json
{
    "main": "./dist/cjs/index.js"
}
```

Поле `"module"` (например `"module": "./dist/esm/index.js"`) понимают webpack и Rollup, но **Node игнорирует**. Node смотрит на `"exports"` или `"main"`, не на `"module"`. Для dual package — `"exports"` с условиями. `"module"` можно оставить для бандлеров рядом, но это не часть резолва Node.

## Настройка dual-сборки

Типичная схема: исходники собираются в оба формата.

```
src/
  index.js       (исходник, ESM)
dist/
  esm/index.js   (выход ESM)
  cjs/index.cjs  (выход CJS)
package.json
```

`tsup`, `unbuild`, `esbuild` делают ESM-копию и CJS, где `import` → `require()`, `export` → `module.exports`.

Минимальный `tsup`:

```javascript
export default {
    entry: ['src/index.js'],
    format: ['esm', 'cjs'],
    outDir: 'dist',
};
```

`package.json`:

```json
{
    "type": "module",
    "exports": {
        ".": {
            "import": "./dist/index.js",
            "require": "./dist/index.cjs"
        }
    }
}
```

С `"type": "module"` все `.js` в пакете — ESM. CJS-сборке нужно расширение `.cjs` — build tools обычно переименовывают сами.

Проще: писать CJS-исходник, одна CJS-сборка, ESM entry — wrapper:

```javascript
// esm-wrapper.js
export { default } from './dist/index.cjs';
export * from './dist/index.cjs';
```

Wrapper re-export'ит CJS; `export *` для типичных паттернов опирается на `cjs-module-lexer`. Меньше движущихся частей. Минус: ESM-потребители идут через CJS — snapshot semantics вместо live bindings.

### Тестирование обоих entry

Частая ошибка: тестируют один entry, второй уезжает в прод без проверки. CJS-сборка может отличаться — пропавший export, другой default, иное поведение async/await после трансформации.

Простая защита:

```javascript
// test/dual-entry.test.js
import esmExports from '../dist/esm/index.js';
import cjsExports from '../dist/cjs/index.cjs';
assert.deepStrictEqual(
    Object.keys(esmExports).sort(),
    Object.keys(cjsExports).sort()
);
```

Проверяет набор имён экспортов, не поведение — но ловит самое частое: CJS «потерял» export. Для паритета поведения гоняйте тесты против обоих entry.

### package.json dual-пакета «в сборе»

```json
{
    "type": "module",
    "main": "./dist/cjs/index.cjs",
    "exports": {
        ".": {
            "types": "./dist/types/index.d.ts",
            "import": "./dist/esm/index.js",
            "require": "./dist/cjs/index.cjs"
        }
    },
    "files": ["dist"]
}
```

`"main"` — для старых инструментов без `"exports"`. `"type": "module"` — `.js` = ESM. `"files"` — что попадёт в npm tarball. `"exports"` — conditional resolution для Node и бандлеров.

## Типичные ошибки и отладка

У interop есть конкретные коды ошибок. Зная код, быстро понимаете причину.

### ERR_REQUIRE_ESM

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /path/to/module.mjs
```

`require()` на ESM в Node без require(esm) или с отключённой функцией. В v22 — `-experimental-require-module`. В v24 по умолчанию — если ошибка остаётся, смотрите loader hooks и сборку Node.

Сначала: `node --version`. v22/v23 — флаг. v24+ — ищите другую причину.

`ERR_REQUIRE_ESM` годами мучил npm: зависимость внезапно стала ESM-only — и CJS-проект ломался. Пример — `chalk` v5 после v4 (CJS). Фиксы: pin v4, `import()`, миграция проекта на ESM.

### ERR_REQUIRE_ASYNC_MODULE

```
Error [ERR_REQUIRE_ASYNC_MODULE]: require() cannot be used on an ESM
graph with top-level await
```

В ESM-модуле или зависимости есть top-level await. Варианты: `import()` или убрать top-level await.

Стек обычно указывает файл. Если await в транзитивной зависимости — пройдите цепочку import.

### ERR_PACKAGE_PATH_NOT_EXPORTED

```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './internal'
is not defined by "exports"
```

Импорт subpath, не описанного в `"exports"`. Автор намеренно закрыл путь. Используйте публичный subpath. Обход по полному пути в `node_modules` хрупок и ломается при рефакторинге пакета.

### Named export not found

```
SyntaxError: Named export 'someFunction' not found
```

Named import из CJS, но lexer не нашёл имя — вероятно динамические экспорты. Fallback:

```javascript
import pkg from 'the-package';
const { someFunction } = pkg;
```

### SyntaxError при смешении синтаксисов

```
SyntaxError: Cannot use import statement in a CommonJS module
```

Файл считается CJS (расширение или `"type"`), но внутри `import`. Переименуйте в `.mjs` или задайте `"type": "module"`.

Реже обратное:

```
ReferenceError: module is not defined in ES module scope
```

Файл ESM, но есть `module.exports`. Переименуйте в `.cjs` или перейдите на `export`.

### Путаница с default export

Ошибки нет — результат неожиданный. CJS:

```javascript
module.exports = function greet() {
    return 'hello';
};
```

Из ESM:

```javascript
import greet from './greet.cjs';
greet(); // работает — greet это функция
```

Но:

```javascript
import { greet } from './greet.cjs';
```

упадёт: named `greet` нет, вся функция — default. Named есть, если свойства вешали на `exports` или `module.exports` по отдельности.

Модель: `module.exports = X` → `export default X`. `exports.foo = Y` → `export { Y as foo }` (если lexer видит).

### Систематическая отладка interop

1.  **Формат файла** — расширение и `"type"` в ближайшем `package.json`. Можно: `node --input-type=module -e "import('./problematic-file.js').then(m => console.log(m))"`.
2.  **Какие exports видны** — для CJS: `await import('./module.cjs')` из `.mjs` и `Object.keys()` результата. Только `['default']` — named extraction не сработал.
3.  **`"exports"` пакета** — `node -e "console.log(require.resolve('package-name'))"` и сравнение с `package.json` зависимости.
4.  **Dual loading** — лог при инициализации модуля: выполняется ли дважды.

Чаще всего корень — несовпадение ожидаемого и реального `"type"`, особенно в monorepo с разными настройками по пакетам.

## Как внутри устроен мост CJS/ESM

На границе сходятся два pipeline загрузки. Это объясняет ограничения interop и почему одни паттерны работают, а другие нет.

### Путь translatedSource

При `import` ESM-файла, который на самом деле CJS, нельзя отдать исходник ESM-парсеру — синтаксис другой. Node строит **синтетическую ESM-обёртку** вокруг CJS.

Внутри — `lib/internal/modules/esm/translators.js`, CJS translator: сначала обычный `require()`, заполняется `module.exports`, затем поверх результата — ESM-facade.

Цепочка: Node определяет CJS (расширение / `"type"`). `Module._load()` выполняет CJS синхронно. `module.exports` передаётся в `cjs-module-lexer`. Собирается ESM module record: default = `module.exports`, опционально named из lexer. ESM loader **не парсит** CJS-исходник как ESM — только оборачивает уже вычисленный результат. Поэтому default всегда равен `module.exports`.

### cjs-module-lexer

Named exports из CJS — задача `cjs-module-lexer` (WASM, изначально C): сканирует исходник без выполнения.

Распознаёт:

1.  `exports.name = value`, `module.exports.name = value`;
2.  `Object.defineProperty(exports, 'name', { ... })`;
3.  `module.exports = { name: value, other: value2 }`;
4.  re-export: `module.exports = require('./other')` — рекурсивный анализ другого модуля.

Обработка как сырые байты, без AST и control flow — поиск байтовых паттернов вокруг `exports`. WASM делает это дёшево на каждом CJS, загружаемом через ESM import.

Слепые зоны:

-   `Object.assign(module.exports, someObject)`;
-   `exports[dynamicKey] = value`;
-   условные экспорты в `if` — lexer не вычисляет ветки;
-   алиасы: `const e = exports; e.foo = 42`.

При провале — только `default`, без named, без ошибки.

Проверка для файла:

```javascript
const ns = await import('./some-cjs-lib.cjs');
console.log(Object.keys(ns));
```

Покажет найденные named exports плюс `default`.

### Синхронный путь выполнения ESM

`require(esm)` в v24 идёт иначе, чем `import`. `Module._load()` видит ESM и вызывает ESM machinery **синхронно**:

1.  `Module._resolveFilename()`;
2.  детект ESM → `esmLoader.import()` в синхронной обёртке;
3.  parse → link → evaluate как обычно;
4.  если в графе top-level await, evaluate даёт promise → `ERR_REQUIRE_ASYNC_MODULE`;
5.  при синхронном завершении namespace возвращается как результат `require()`.

`require()` всегда был синхронным — поддержка ESM значит синхронный evaluate, когда в графе нет top-level await. Parse и link и так синхронны; асинхронность появляется только на evaluate с await.

Модуль попадает в ESM cache. Повторный `import` или `require()` того же файла — один экземпляр. require(esm) унифицировал кэши: раньше один файл через `import` и `require()` мог дать два экземпляра.

### Проверка синхронности evaluate

V8 `Module::Evaluate()` возвращает значение или `Promise`. Синхронная обёртка Node: promise → `ERR_REQUIRE_ASYNC_MODULE`. Проверка рекурсивна по графу: B с top-level await делает evaluate A асинхронным.

Parse/link синхронны; расхождение `require(esm)` и `import` — только на evaluate.

### Соглашение \_\_esModule

До нативного interop Babel/webpack помечали transpiled ESM:

```javascript
Object.defineProperty(exports, '__esModule', {
    value: true,
});
```

Бандлеры смотрели на `__esModule`, чтобы понять: `exports.default` — это default transpiled ESM, а не «весь объект — default».

Node **не** использует `__esModule` — свой translator и lexer. Но в legacy и выводе сборщиков встретите. Лишний слой `{ default: ... }` при interop — часто история `__esModule`.

## Практические паттерны для авторов библиотек

**Stateless-пакет:** dual через `tsup`/`unbuild`, conditional exports, dual hazard не критичен.

**Пакет со state:** wrapper, ESM канон, CJS `require()` re-export. v24 — чисто. Старый Node: синхронный ESM или смириться с двумя экземплярами.

**Приложение:** один формат, `"type": "module"`, без dual-сборки. Зависимости сами решают interop; вы `import` — Node переводит CJS при необходимости. Граница заметна, когда named extraction не сработал.

**TypeScript:** `"module": "commonjs"` компилирует import/export в require/exports. `"module": "nodenext"` / `"node16"` согласуются с расширениями и `"type"`. Согласовать TS и Node — отдельное приключение, принципы те же.

## Состояние interop в Node v24

Пять лет назад ESM из CJS — только async `import()`. Named exports из CJS — ненадёжно. Dual hazard — без чистого решения.

В v24: `require(esm)` без флагов для синхронного ESM; зрелый lexer; `"exports"` для dual; wrapper убирает hazard для stateful libs.

Остались края: top-level await блокирует `require()`; динамические CJS-экспорты ломают named import; изоляция кэшей loader'ов в сложных графах. Это документированные ограничения с понятными кодами ошибок.

Траектория — ESM по умолчанию. CJS никуда не денется (миллиарды строк на npm), но ESM-потребителю редко нужно думать о формате зависимости: `import` CJS → default, иногда named; `import` ESM → live bindings. Runtime переводит.

## Связанное чтение

-   Предыдущая: [ES Modules в Node.js: import/export, linking и определение формата](esm-import-export.md)
-   Далее: [import.meta и кэширование ESM: URL, циклические зависимости и состояние модуля](import-meta-caching.md)
