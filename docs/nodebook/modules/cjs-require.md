---
description: Внутренности require() в Node.js — Module._load, кэш CJS и цепочка загрузки модулей
---

# Внутренности require() в Node.js: Module.\_load и кэш CJS

Источник: [theNodeBook — Node.js require() Internals: Module.\_load & CJS Cache](https://www.thenodebook.com/modules/cjs-require)

`require()` — точка входа загрузчика CommonJS в Node.js. За одной строкой кода стоит цепочка вызовов: разрешение имени файла, поиск в кэше, чтение исходника, обёртка, компиляция, выполнение и возврат значения `module.exports`. Большую часть этой работы координирует `Module._load()`, который перед загрузкой нового файла проверяет `Module._cache`.

## Как работает require() в Node.js

Кэш — часть контракта runtime. Повторный `require()` с тем же разрешённым именем файла возвращает тот же объект exports. Циклические зависимости раскрывают частично инициализированные exports, потому что запись в кэш появляется до того, как тело модуля завершит выполнение. Именно этот порядок объясняет многие краевые случаи CommonJS.

Каждый разработчик на Node.js тысячи раз набирал `require('something')`. Функция возвращает объект. Вы его используете. Всё. Но за этой одной строкой — полная цепочка: разрешение имени, чтение файла, обёртка исходника, компиляция и кэширование. Всё это происходит **синхронно** и блокирует главный поток, пока модуль не будет полностью вычислен и его exports не окажутся в памяти.

Эта глава проходит всю цепочку — от момента, когда JavaScript вызывает `require()`, до момента, когда вы получаете заполненный `module.exports`. Разбор уходит вглубь: внутренний класс `Module` Node, конвейер компиляции, слой кэширования и краевые случаи циклических зависимостей, которые хотя бы раз сбивали с толку почти всех.

## Функция require()

Когда вы пишете `require('fs')` или `require('./myFile')`, вы вызываете функцию, которую в область видимости модуля внедрила обёртка модуля (это разбиралось в главе 1). Но `require` — не глобал. Это локальная переменная, созданная специально для вашего модуля; она указывает на функцию, которая в итоге вызывает `Module._load`.

Кратко, что происходит:

```
require(id)
  -> Module._load(id, parentModule, isMain)
    -> Module._resolveFilename(id, parentModule)
    -> check Module._cache[resolvedFilename]
    -> if cached: return cached.exports
    -> new Module(resolvedFilename)
    -> Module._cache[resolvedFilename] = module
    -> module.load(resolvedFilename)
    -> return module.exports
```

Этот псевдокод близок к реальной реализации. Функция `require`, которую получает модуль, — это по сути `Module.prototype.require`: тонкая обёртка. Она проверяет, что аргумент — строка, затем вызывает `Module._load`, передавая собственный `this` модуля как родителя.

```
Module.prototype.require = function(id) {
  validateString(id, 'id');
  requireDepth++;
  try {
    return Module._load(id, this, false);
  } finally {
    requireDepth-;
  }
};
```

Счётчик `requireDepth` отслеживает глубину текущей цепочки `require`. Он в основном нужен для внутренней отладки и логирования при обнаружении циклических зависимостей. Третий аргумент — `false` — сообщает `_load`, что модуль загружается как зависимость, а не как главная точка входа.

Обратите внимание на блок `try/finally`. Счётчик `requireDepth` уменьшается независимо от того, успешна загрузка или выброшена ошибка. Это важно: при неудачном `require()` (например, синтаксическая ошибка в целевом файле) глубина всё равно должна корректно сброситься. Без `finally` ошибка при загрузке навсегда завысила бы `requireDepth`, и любая внутренняя логика, которая на него опирается, вела бы себя неверно до конца жизни процесса.

---

## Module.\_resolveFilename

Прежде чем что-то загрузить, Node должен понять, о каком файле идёт речь. `require('./utils')` может означать `./utils.js`, `./utils.json`, `./utils.node` или `./utils/index.js`. Голый спецификатор вроде `require('express')` запускает алгоритм поиска в `node_modules`. Полный алгоритм разрешения — отдельная большая тема (следующая подглава разбирает его подробно); здесь — поведение `Module._resolveFilename` на высоком уровне.

Метод получает строку запроса и родительский модуль. Сначала проверяется, не совпадает ли спецификатор со встроенным модулем. Node хранит внутренний список имён встроенных модулей — `fs`, `path`, `http`, `net` и т.д. При совпадении `_resolveFilename` возвращает имя с префиксом (например, `node:fs`), и путь загрузки обходит файловую систему: встроенные модули скомпилированы в бинарник Node и при разрешении не читают диск.

```
if (NativeModule.canBeRequiredByUsers(request)) {
  return request;
}
```

Ранний возврат пропускает всю работу с ФС. Для десятков вызовов `require('fs')` и `require('path')` в типичном приложении эта оптимизация заметна. Node держит `Set` имён встроенных модулей и проверяет принадлежность за O(1). В v24 можно явно использовать префикс `node:` — `require('node:fs')` — он принудительно ведёт по пути встроенного модуля. Без префикса Node сначала проверяет встроенные, но при отсутствии совпадения всё ещё может обратиться к ФС. С префиксом отката нет.

Для невстроенных спецификаторов `_resolveFilename` вызывает `Module._resolveLookupPaths` и строит список каталогов для поиска. Для относительных путей (`./` или `../`) в списке только каталог родительского модуля. Для голых спецификаторов строится цепочка каталогов `node_modules`, поднимаясь от расположения родителя к корню ФС.

Затем `Module._findPath` перебирает этот список, пробуя расширения (`.js`, `.json`, `.node`) и проверяя файлы `index.*` внутри каталогов. Побеждает первое совпадение. У `_findPath` есть собственный кэш — `Module._pathCache` — он сопоставляет пары `(request, paths)` с разрешёнными именами файлов и не даёт повторно вызывать `stat` при том же разрешении из разных родителей.

```
const cacheKey = request + '\x00' + paths.join('\x00');
const entry = Module._pathCache[cacheKey];
if (entry) return entry;
```

Разделитель `\x00` предотвращает коллизии между разными комбинациями `(request, paths)`. Дёшево: конкатенация строк и lookup в объекте.

Если после перебора путей, расширений и `index.*` ничего не найдено — знакомая ошибка `MODULE_NOT_FOUND`. В сообщении перечислены все проверенные пути; по этому списку часто удаётся отладить «модуль не найден».

---

## Module.\_load — сердце require()

`Module._load` — координатор. Пошагово:

**Шаг 1: разрешить имя файла.** Вызывается `Module._resolveFilename`; `./utils` превращается, например, в `/home/user/project/utils.js`.

**Шаг 2: проверить кэш.** `Module._cache` — обычный объект JavaScript с ключами — абсолютными путями. Если путь уже есть в `_cache`, метод сразу возвращает `Module._cache[filename].exports`. Ни чтения с диска, ни компиляции — только обращение к свойству объекта.

```
const cachedModule = Module._cache[filename];
if (cachedModule !== undefined) {
  updateChildren(parent, cachedModule, true);
  if (cachedModule.loaded) return cachedModule.exports;
}
```

Проверка `cachedModule.loaded` обрабатывает краевой случай циклических зависимостей (ниже).

**Шаг 3: встроенные модули.** Если разрешённое имя — встроенный модуль, загрузка идёт через `loadBuiltinModule`, а не с диска. У встроенных свой кэш, отдельный от `Module._cache`.

**Шаг 4: новый экземпляр Module.** При промахе кэша и не встроенном модуле `_load` создаёт `new Module(filename, parent)`. Конструктор задаёт свежий объект: `id` (имя файла), `exports` (пока `{}`), `parent`, `filename`, `loaded` (`false`), `children` (пустой массив), `paths` (список поиска `node_modules`).

**Шаг 5: немедленное кэширование.** До загрузки файла — до чтения байта — модуль попадает в `Module._cache`. Так циклические зависимости не уходят в бесконечный цикл: если A требует B, а B требует A, второй `require('A')` находит A в кэше и возвращает текущий `module.exports`. Exports A могут быть неполными (A ещё не до конца выполнился), но вы получаете ссылку на объект, а не зависание.

**Шаг 6: загрузка.** Вызывается `module.load(filename)`: чтение, обёртка, компиляция, выполнение. При ошибке — синтаксис, исключение при вычислении, сбой вложенного `require()` — Node удаляет модуль из `Module._cache` до проброса ошибки. Сломанный модуль не остаётся в кэше навсегда; следующий `require()` попробует снова.

```
let threw = true;
try {
  module.load(filename);
  threw = false;
} finally {
  if (threw) delete Module._cache[filename];
}
```

Паттерн `try/finally` с флагом `threw` — типичный приём во внутренностях Node. `catch` здесь не подходит: ошибка должна дойти до вызывающего, но побочный эффект (очистка кэша) нужен до этого.

**Шаг 7: вернуть exports.** После `module.load` выставляется `module.loaded = true`, `_load` возвращает `module.exports`.

---

## Module.prototype.load

Метод `load` у экземпляра Module выбирает обработчик по расширению файла. Реестр — `Module._extensions`; `load` находит нужный обработчик.

```
Module.prototype.load = function(filename) {
  this.filename = filename;
  this.paths = Module._nodeModulePaths(
    path.dirname(filename)
  );
  const extension = findLongestRegisteredExtension(filename);
  Module._extensions[extension](this, filename);
  this.loaded = true;
};
```

`findLongestRegisteredExtension` по умолчанию берёт `.js`, если расширение не найдено. Поэтому `require('./config')` может разрешиться в `config.js`.

После обработчика `this.loaded` становится `true`. Модуль завершён; exports — то, во что было установлено `module.exports` при выполнении.

---

## Module.\_extensions — реестр обработчиков

`Module._extensions` по умолчанию содержит три ключа: `.js`, `.json`, `.node`.

Обработчик `.js` читает файл **синхронно** (`fs.readFileSync`), затем вызывает `module._compile` с исходником — там обёртка и компиляция V8.

Обработчик `.json` тоже читает синхронно и прогоняет `JSON.parse`. Результат напрямую становится `module.exports`. Без обёртки, компиляции и выполнения функции — только чтение и разбор.

```
Module._extensions['.json'] = function(module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  module.exports = JSONParse(stripBOM(content));
};
```

`stripBOM` убирает UTF-8 BOM, если редактор его добавил (часто на Windows).

Обработчик `.node` вызывает `process.dlopen()` и подгружает скомпилированный C++‑аддон через динамический линкер ОС (`dlopen` в Unix, `LoadLibrary` в Windows). Функция `napi_register_module_v1` (или устаревший макрос `NODE_MODULE`) задаёт `module.exports` из нативного кода.

Свои обработчики тоже можно добавить: `require.extensions['.txt'] = function(mod, filename) { ... }` всё ещё работает, хотя и помечено deprecated. Механизм тот же: прочитать файл, обработать содержимое, выставить `module.exports`.

!!!warning ""

    При `require('./config.json')` Node синхронно читает файл и парсит его через `JSON.parse`. Получается обычный объект JavaScript — снимок данных на момент загрузки. Повторные `require('./config.json')` возвращают закэшированный объект, даже если файл на диске изменился. Кэшированное значение **изменяемо** — правка объекта в одном модуле видна всем остальным потребителям того же `require`:

    ```
    const cfg = require('./config.json');
    cfg.port = 9999;

    const cfg2 = require('./config.json');
    console.log(cfg2.port); // 9999 - same cached object
    ```

    И `cfg`, и `cfg2` ссылаются на один и тот же объект в `Module._cache`. Мутация в одном месте меняет «оба». На проде это уже ломало системы, когда один модуль невинно менял поле конфига, а остальные видели новое значение.

---

## Module.\_compile — из исходника в код

Самый интересный шаг. `_compile` превращает строку JavaScript в выполняемую функцию.

1.  **Убрать shebang.** Если файл начинается с `#!`, Node удаляет эту строку — поэтому в CLI‑скриптах работает `#!/usr/bin/env node`, движок её не видит.

2.  **Обёртка.** Исходник оборачивается в функцию. Шаблон зашит:

    ```
    [
    '(function(exports, require, module, __filename, __dirname) { ',
    '\n});'
    ]
    ```

    Ваш код «вкладывается» между этими строками. Если в файле `const x = 5; module.exports = x;`, после обёртки:

    ```
    (function(exports, require, module, __filename, __dirname) {
    const x = 5; module.exports = x;
    });
    ```

    Именно поэтому `exports`, `require`, `module`, `__filename` и `__dirname` доступны в каждом CJS‑модуле: это параметры функции при вызове обёртки, а не глобалы и не магия.

3.  **Компиляция V8.** Node вызывает `vm.compileFunction` (в старых версиях — `vm.Script` со строкой). Парсинг, байткод через Ignition (глава 1), возврат вызываемой функции **без** немедленного выполнения.

    У скомпилированной функции может быть `cacheKey` для code cache V8. При повторных загрузках (не из `Module._cache`, а из bytecode cache V8) можно пропустить парсинг. Это важно на старте больших приложений.

4.  **Выполнение.** Скомпилированная функция вызывается с пятью аргументами:

    ```
    compiledWrapper.call(
    thisValue,
    module.exports,
    require,
    module,
    filename,
    dirname
    );
    ```

    `this` внутри модуля — `module.exports`. На верхнем уровне CJS `this === module.exports` — `true`. На это обычно не полагаются, но факт есть.

После выполнения `require()` возвращает то, на что указывает `module.exports`. Если код сделал `module.exports = someFunction`, вернётся `someFunction`. Если только `exports.foo = bar`, вернётся исходный объект с добавленными свойствами.

---

## module.exports и exports — ловушка алиаса

Это сбивает с толку годами. При вызове обёртки `exports` и `module.exports` изначально — **один объект**:

```
console.log(exports === module.exports); // true
```

Свойства можно вешать на любой из них — это один объект:

```
exports.greet = () => 'hello';
console.log(module.exports.greet()); // 'hello'
```

Но как только вы **переназначаете** `exports`, связь рвётся:

```
exports = { greet: () => 'hello' };
console.log(module.exports); // {} - still the original
```

`require()` всегда возвращает `module.exports`, никогда не смотрит на `exports`. `exports` — удобный алиас локальной переменной; переназначение меняет только локальную привязку, а не то, что реально экспортирует модуль.

Поэтому в коде с одним экспортом пишут `module.exports = class MyThing {}`, а не `exports = class MyThing {}` — второй вариант оставит вызывающему пустой `{}`.

Правило: `exports.something` для именованных экспортов; `module.exports = something` — чтобы заменить весь экспорт целиком.

Даже у `module.exports` есть нюанс: кэш хранит модуль, а `require()` отдаёт `module.exports` в момент доступа. Переназначить `module.exports` после завершения загрузки «между» двумя `require()` нельзя: загрузка синхронна, значение фиксируется при выполнении.

Типичный паттерн — экспорт класса:

```
module.exports = class Database {
  constructor(url) { this.url = url; }
  query(sql) { /* ... */ }
};
```

Вызывающий код: `const Database = require('./database')` — получает класс. С `exports = class Database { ... }` пришёл бы пустой объект. Если экспортируете одну сущность (класс, функцию, значение) — всегда `module.exports`. Несколько именованных — `exports.name = value`.

Реже — функция со свойствами:

```
function greet(name) { return `hello ${name}`; }
greet.version = '1.0.0';
module.exports = greet;
```

Можно `require('./greet')('world')` и `require('./greet').version`. Так устроены, например, части `express`: это вызываемая функция с `.Router`, `.static` и т.д.

---

## Module.\_cache и require.cache

`Module._cache` — объект без прототипа (`Object.create(null)`), ключи — абсолютные пути. `require('./utils')` → `/home/user/project/utils.js` — такой путь и есть ключ кэша.

`require.cache` — **тот же** объект. Его можно смотреть и менять:

```
console.log(Object.keys(require.cache));
// ['/home/user/project/index.js', '/home/user/project/utils.js', ...]
```

Значения — экземпляры Module: `id`, `filename`, `loaded`, `exports`, `parent`, `children`.

Удаление из кэша заставляет перезагрузить модуль:

```
delete require.cache[require.resolve('./config')];
const freshConfig = require('./config');
```

!!!note ""

    Удаление записи кэша означает повторное чтение и выполнение файла при следующем `require()`. Модули, которые уже импортировали этот модуль, **держат ссылку на старые exports** — они не обновятся. В процессе окажутся две версии exports одного модуля: старая у прежних потребителей и новая у свежих `require()`. Так иногда делают hot-reload в разработке; на проде нужен другой подход.

`Object.create(null)` убирает цепочку прототипа: у `{}` ключи вроде `toString` теоретически могли бы столкнуться с именами файлов. На практике это редкость, но защита встроена во внутренности Node.

Кэш связан с `require.main`. `require.main` — экземпляр Module для файла, с которым запустили `node something.js`. Проверка `require.main === module` показывает, что файл — точка входа, а не библиотека:

```
if (require.main === module) {
  startServer();
}
module.exports = { startServer };
```

При `node server.js` условие истинно и `startServer()` вызывается. При `require('./server')` из другого файла `require.main` указывает на **тот** entry point, не на `server.js`.

---

## Синхронная загрузка

Каждый шаг `require()` синхронен: `fs.readFileSync`, синхронная компиляция, синхронное выполнение кода модуля (если внутри модуля вы запускаете async — `require()` на это не ждёт).

Последствия реальны. `require()` на верхнем уровне entry point выполняется до старта event loop. `require()` внутри обработчика запроса **блокирует** loop на время загрузки. Для маленьких модулей это незаметно; для модуля, читающего JSON на 5 МБ — почувствуете.

```
app.get('/report', (req, res) => {
  const report = require('./heavy-report-generator');
  res.json(report.generate());
});
```

Первый запрос заблокирует loop на чтение и компиляцию `heavy-report-generator.js`. Дальше — кэш и мгновенный возврат. Первый удар платит полную синхронную цену.

Принято выносить все `require()` в начало файла, до async‑работы. На bootstrap синхронность нормальна; внутри async‑обработчиков — проблема.

!!!note ""

    `require()` синхронен отчасти потому, что CJS‑модули могут иметь побочные эффекты при загрузке, и другой код может полагаться на их завершение до возврата из `require()`. Асинхронный `require()` потребовал бы `await` везде — по сути то, что сделали ES Modules в 2009‑м для CJS выбрали прагматичную синхронную модель.

Синхронность даёт условную загрузку:

```
let parser;
if (process.env.USE_FAST_PARSER) {
  parser = require('fast-parser');
} else {
  parser = require('slow-but-safe-parser');
}
```

Загружается только ветка условия; второй файл не читается и не выполняется. У ESM `import` статичен и поднимается — обе ветки могли бы загрузиться (нужен динамический `import()`). Условный `require()` — практическое преимущество CJS для опциональных зависимостей.

Ещё контекст — порядок на старте. Библиотеки, регистрирующие обработчики `uncaughtException` или APM, рассчитывают на ранний `require()` в entry: следующая строка выполнится только после установки обработчика. При async‑загрузке модулей эта гарантия размывается.

---

## Циклические зависимости

Модуль A требует B, B требует A. Во многих системах это фатально. В CJS «работает» — с оговорками.

`Module._load` кладёт модуль в кэш **до** выполнения. A начинает загрузку, доходит до `require('./B')`, B грузится; B вызывает `require('./A')` — A уже в кэше, но ещё не до конца выполнен. `module.exports` A — то, что успело записаться до паузы на B.

```
// a.js
exports.fromA = 'hello from A';
const b = require('./b');
exports.afterB = 'set after B loaded';

// b.js
const a = require('./a');
console.log(a.fromA);  // 'hello from A'
console.log(a.afterB); // undefined
```

Когда `b.js` делает `require('./a')`, он получает текущий `module.exports` A. `exports.fromA` уже есть; `exports.afterB` ещё нет — выполнение A остановилось на `require('./b')`.

После B управление возвращается в A, `exports.afterB` выставляется. У B ссылка на **тот же** объект exports A — позже `a.afterB` может появиться, потому что свойство добавили в живой объект.

!!!warning ""

    Опасность — **переназначение** `module.exports`. Если A после того, как B взял старый объект, делает `module.exports = new SomeClass()`, B остаётся со ссылкой на прежний пустой `{}`. Большинство багов циклов — из‑за переназначения. Лечение: не переназначать (`exports.thing = ...`) или разорвать цикл в графе зависимостей.

Обходной приём — «ленивый» `require()` внутри функции, а не вверху файла:

```
// a.js
exports.getB = function() {
  const b = require('./b');
  return b.value;
};
```

К моменту вызова `getB` оба модуля уже загружены; `require('./b')` бьёт в кэш с полными exports. Так делают во внутренностях Node. Накладные расходы — lookup в хэш‑таблице — на практике пренебрежимы.

`module.children` отслеживает загруженные зависимости; по рекурсии можно найти цикл, но на практике чаще видят `undefined` в exports и идут назад по цепочке `require()`.

---

## require.resolve()

`require.resolve()` прогоняет тот же алгоритм, что `Module._resolveFilename`, но возвращает абсолютный путь **без** загрузки модуля.

```
console.log(require.resolve('express'));
// '/home/user/project/node_modules/express/index.js'

console.log(require.resolve('./utils'));
// '/home/user/project/utils.js'
```

При отсутствии модуля — `MODULE_NOT_FOUND`. «Есть ли модуль?» без try/catch из `require.resolve` не получить.

`require.resolve.paths(request)` возвращает массив каталогов для поиска. Для относительных путей — `null` (важен только каталог родителя). Для голых спецификаторов — цепочка `node_modules`:

```
console.log(require.resolve.paths('express'));
// ['/home/user/project/node_modules',
//  '/home/user/node_modules',
//  '/home/node_modules',
//  '/node_modules']
```

Инструмент отладки: «пакет установлен, но Node не находит» — `resolve.paths` показывает, где ищут.

Второй аргумент `require.resolve` менее известен:

```
require.resolve('express', {
  paths: ['/custom/lookup/path']
});
```

Опция `paths` подменяет стандартный список `node_modules`. Полезно в сборщиках, плагинах, нестандартных корнях. Webpack с `resolve.modules` по сути генерирует такие вызовы.

`require.resolve` кэширует результат в `Module._pathCache`. Если файл удалили между вызовами, кэш всё ещё указывает на старый путь. Для dev‑серверов иногда чистят `Module._pathCache = Object.create(null)` — публичного API нет.

---

## Внутри lib/internal/modules/cjs/loader.js

Всё описанное живёт в `lib/internal/modules/cjs/loader.js` репозитория Node.js — порядка 1500 строк: `Module._load`, `Module._resolveFilename`, `Module._compile`, `Module._extensions`, кэш.

Конструктор `Module`:

```
function Module(id = '', parent) {
  this.id = id;
  this.path = path.dirname(id);
  this.exports = {};
  this.filename = null;
  this.loaded = false;
  this.children = [];
  this.paths = [];
}
```

При каждом `require()` незакэшированного модуля создаётся такой экземпляр. `id` — обычно абсолютный путь; `path` — каталог файла; `exports` — `{}`; `filename` выставляется в `load()`; `loaded` — `true` только после обработчика расширения; `children` накапливает зависимости.

`Module._nodeModulePaths` строит список `node_modules`, поднимаясь от каталога к корню:

```
Module._nodeModulePaths = function(from) {
  from = path.resolve(from);
  const paths = [];
  for (/* each parent directory */) {
    paths.push(path.join(dir, 'node_modules'));
  }
  return paths;
};
```

Для `/home/user/project/src/utils.js` на Unix: `['/home/user/project/src/node_modules', '/home/user/project/node_modules', '/home/user/node_modules', '/home/node_modules', '/node_modules']`. На Windows — те же уровни с `\` и буквой диска.

Пути считаются один раз и лежат в `module.paths`; алгоритм разрешения перебирает их для голых спецификаторов.

В современном Node (v24) `_compile` использует `vm.compileFunction` вместо ручной обёртки через `vm.Script`. Публично `Module.wrapper[0]` и `Module.wrapper[1]` остаются для совместимости; внутри ближе к:

```
const compiledWrapper = compileFunction(
  content, filename,
  0, 0,                                   // line/column offset
  undefined,                              // cachedData
  false,                                  // produceCachedData
  undefined, undefined,                   // context, extensions
  ['exports', 'require', 'module', '__filename', '__dirname']
);
```

V8 парсит AST (глава 1), Ignition генерирует байткод, возвращается вызываемая функция.

После компиляции у модуля свой `require` с правильным `Module.prototype.require.call(this, ...)` и свойствами `resolve` и `cache`. `require.main` — модуль, загруженный как entry (`node main.js`).

Вызов идёт через `Reflect.apply` с `this = module.exports` и пятью параметрами обёртки. Код модуля выполняется сверху вниз, синхронно; каждый вложенный `require()` повторяет цепочку.

Node может генерировать и потреблять bytecode cache V8 (`cachedData` у `compileFunction`) — ускорение старта между перезапусками процесса, не между повторными `require()` в одном процессе. Связано с `-experimental-vm-modules` и пакетами вроде `v8-compile-cache`.

При загрузке главного модуля `Module._load` получает `isMain: true`, выставляет `process.mainModule` (deprecated в пользу `require.main`) и `module.id = '.'` вместо имени файла — так работает `require.main === module`.

`require('./myLib')` на каталог: при `package.json` с полем `main` — оно задаёт entry; иначе `index.js`, `index.json`, `index.node` в `Module._findPath`.

`require.extensions['.coffee']` и транспайлеры TypeScript когда‑то вешались на реестр `_extensions`. В Node v24 это deprecated: синхронно, трудно сочетается с ESM. Сейчас — loaders или предкомпиляция.

При ошибке в скомпилированной функции номера строк в стеке должны соответствовать исходнику, хотя код обёрнут. Смещения line/column в `compileFunction` компенсируют лишнюю строку обёртки — без них каждый стек CJS был бы сдвинут на одну строку.

Поддержка source maps: директива `//# sourceMappingURL=` и флаг `-enable-source-maps` переводят номера строк transpiled кода обратно к `.ts`/`.jsx`.

Перед компиляцией из `content` (UTF-8 из `fs.readFileSync`) убирают BOM и shebang. Shebang не просто удаляют: `#!...` до первого перевода строки заменяют пробелами той же длины, чтобы не сбить смещения для source maps и стеков.

---

## Полный жизненный цикл от начала до конца

Один вызов `require('./math')` по шагам:

1.  Вызывается `Module.prototype.require` со строкой `'./math'`.
2.  Стартует `Module._load('./math', parentModule, false)`.
3.  `Module._resolveFilename` превращает `'./math'` в `/home/user/project/math.js` (относительный путь, расширения `.js`/`.json`/`.node`).
4.  Проверка `Module._cache['/home/user/project/math.js']` — при первой загрузке промах.
5.  Не встроенный модуль (путь к файлу, не имя core).
6.  `new Module('/home/user/project/math.js', parentModule)`.
7.  Модуль сразу в `Module._cache` — до выполнения кода.
8.  `module.load('/home/user/project/math.js')`.
9.  Расширение `.js` → `Module._extensions['.js']`.
10. `fs.readFileSync` читает файл в строку.
11. `module._compile(sourceString, filename)`.
12. Удаление shebang (если есть).
13. `vm.compileFunction` с параметрами обёртки.
14. Вызов функции с `(module.exports, require, module, filename, dirname)`.
15. Выполняется код модуля; мутации `module.exports` / `exports.x`.
16. Функция возвращается; `module.loaded = true`.
17. `Module._load` возвращает `module.exports`.
18. Вызывающий код продолжает работу с exports.

Все 18 шагов — **синхронно**. Шаг 10 на 50 мс (большой файл, холодный кэш диска) — блокировка 50 мс. Шаг 14 с десятью вложенными `require()` — каждый проходит те же шаги (минус попадания в кэш).

CJS предсказуем: когда `require()` вернулся, модуль загружен, побочные эффекты отработали, exports завершены (кроме оговорок с циклами). Цена — синхронный диск и компиляция. ESM выбрал асинхронную трёхфазную загрузку (глава 1). В Node v24 обе модели сосуществуют; их взаимодействие — отдельная тема этой книги.

---

## Связанное чтение

-   Предыдущая: [Конвейеры stream в Node.js: ошибки, очистка и AbortSignal](../streams/modern-pipelines-error-handling.md)
-   Далее: [Алгоритм разрешения модулей Node.js: node_modules, package.json и exports](./resolution-algorithm.md)
-   Оригинал (theNodeBook): [require() Internals: Module.\_load & CJS Cache](https://www.thenodebook.com/modules/cjs-require) · [Module Resolution Algorithm](https://www.thenodebook.com/modules/resolution-algorithm)
