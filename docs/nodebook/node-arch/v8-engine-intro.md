---
description: V8 в Node.js — JIT, скрытые классы, inline cache и деоптимизация
---

# V8 в Node.js: JIT, скрытые классы и деоптимизация

Источник: [theNodeBook — V8 in Node.js](https://www.thenodebook.com/node-arch/v8-engine-intro)

V8 — JavaScript‑движок внутри Node.js. Он парсит исходники, генерирует байткод Ignition, собирает type feedback и продвигает «горячий» код через Sparkplug, Maglev и TurboFan, пока наблюдаемые формы объектов и типы остаются стабильными. Движок отвечает за выполнение JavaScript, сборку мусора, layout объектов и JIT‑генерацию кода. Node оборачивает V8 системными API, но код внутри ваших функций по‑прежнему живет по правилам V8.

Запросы вроде `v8 javascript engine node.js` обычно означают, что разработчик хочет связать производительность runtime с прикладным кодом. Короткий ответ конкретен: стабильные формы объектов помогают inline cache и оптимизированному коду; смешанные формы, смена element kinds, `delete`, `arguments` и повторяющиеся смены типов возвращают выполнение на более низкие уровни компиляции. Деоптимизация защищает корректность, но горячие пути платят за потерянный оптимизированный код.

Эта глава остается в этих границах: как V8 компилирует код, как hidden classes и inline cache питают JIT, как layout памяти влияет на скорость и какие паттерны удерживают Node‑сервисы от deopt‑циклов.

## Как V8 выполняет JavaScript в Node.js

V8 начинает с исходного текста. Сканер разбивает код на токены, парсер строит внутренние представления, Ignition получает байткод. Пока Ignition выполняет код, V8 записывает type feedback для загрузки свойств, вызовов, арифметики, доступа к массивам и форм объектов.

«Горячий» код поднимается вверх по pipeline. Sparkplug генерирует baseline‑машинный код. Maglev использует feedback для mid‑tier оптимизаций. TurboFan тратит больше времени на компиляцию самых горячих путей и выпускает специализированный машинный код. Когда следующий вызов нарушает зафиксированные предположения, V8 деоптимизирует функцию и продолжает выполнение на более низком уровне.

## Кейс деоптимизации V8 в Node.js

Все началось с вполне разумного кода. У нас был API‑эндпоинт, который собирал объекты конфигурации: базовый config, поверх — пользовательские overrides, иногда — параметры конкретного запроса. Простая схема. Месяцами эндпоинт работал стабильно — примерно 2–5 ms на запрос.

Потом сработали алерты по latency. P99 вырос до 200+ ms. Не 20 ms — **двести**. Замедление примерно в 100 раз. Мы искали сеть, базу, что угодно — только не «простой» прикладной код.

Добавили логирование — без результата. Открыли CPU‑профайлер: flame graph был «плоским», без одного виновника; весь handler запроса просто тормозил. Как будто CPU работал в 100 раз медленнее, но только на этом эндпоинте.

Причина оказалась безобидной: для новой фичи в config иногда добавляли опциональное свойство — одна строка `if (condition) { config.optionalFeature = true; }`.

Код в «горячем» пути логически не менялся, а скорость упала на порядки. Тогда я впервые по‑настоящему понял: **написанный вами JavaScript — это не тот код, который реально выполняется**. Вы не пишете инструкции для простого интерпретатора; вы даете подсказки агрессивному оптимизирующему компилятору. И мы случайно нарушили его ожидания в самом болезненном месте.

Мы относились к объектам как к удобным hash map и добавляли свойства когда угодно. Под капотом V8 сделал ставки на структуру `config`, сгенерировал специализированный машинный код — и одно новое свойство аннулировало все эти ставки. Функция, которая шла 2 ms, стала идти 200 ms. Урок простой: JavaScript пишут не только для людей, но и для V8.

---

## Как V8 на самом деле выполняет JavaScript

Частая модель: «JavaScript — интерпретируемый язык, движок читает строки и выполняет». Для performance‑инженерии эта модель не просто неточна — она опасна. V8 не «интерпретирует» код в классическом смысле; он прогоняет его через многоуровневый JIT‑pipeline.

Путь от `.js` до машинного кода заточен под скорость: быстрый старт (не компилировать все заранее) и высокий peak performance для часто выполняемого кода. Это суть **Just-In-Time (JIT)** компиляции.

Высокоуровневый поток:

1.  **Парсинг.** V8 разбирает исходник в структурированное представление:
    -   **Scanner** — токены (`const`, `myVar`, `=`, `10`, `;`).
    -   **Parser** — **AST**. Например, `const a = 10;` становится деревом с узлом `VariableDeclaration` и дочерними узлами для идентификатора и значения.
2.  **Ignition.** Интерпретатор обходит AST и генерирует **bytecode** — низкоуровневые платформенно‑независимые инструкции. Сложение `a + b` может превратиться в `Ldar a`, `Add b`. Для одноразового кода часто хватает Ignition.
3.  **Профилирование.** Пока Ignition выполняет байткод, он собирает данные: сколько раз вызвана функция, какие типы приходят на вход, какие формы объектов используются.
4.  **Sparkplug (baseline).** «Теплый» код попадает в Sparkplug (с 2021 года). Он компилирует байткод в машинный код без глубоких оптимизаций — быстрее интерпретации, дешевле, чем полный анализ.
5.  **Maglev (mid-tier).** «Горячий» код с устойчивым feedback идет в Maglev (Chrome M117, декабрь 2023). Философия: «достаточно хороший код достаточно быстро» — SSA, CFG, спекулятивные оптимизации мягче, чем у TurboFan. Компиляция ~в 10 раз медленнее Sparkplug, но ~в 10 раз быстрее TurboFan.
6.  **TurboFan.** Самые горячие пути с тысячами вызовов и стабильным feedback получают агрессивные **спекулятивные** оптимизации: «аргумент `x` всегда был number — буду считать, что так и останется».
7.  **Деоптимизация.** Если на 10 001‑м вызове пришла строка вместо number, V8 отбрасывает оптимизированный код и откатывается на Maglev, Sparkplug или Ignition. Повторяющиеся deopt‑циклы убивают производительность.

### Миф: V8 — «просто интерпретатор»

У V8 есть интерпретатор (Ignition), но цель — дойти до оптимизированного машинного кода через многоуровневый pipeline. Байткод Ignition — ступень к оптимизирующим компиляторам.

Задача performance‑инженера — писать код, который поднимается к TurboFan и **остается** там. Каждая деоптимизация — откат на более медленный уровень с ощутимой ценой.

---

## От Ignition до TurboFan

Именно здесь появляются и «магия» скорости, и обрывы производительности.

### Базовая роль Ignition

Ignition запускает код **быстро**. Полная оптимизация дорога по CPU и памяти; для кода, который выполнится один раз при старте, тяжелый компилятор избыточен.

Ignition генерирует байткод почти один к одному с AST. Байткод — register‑based машина (не stack‑based), что сокращает число инструкций и лучше ложится на реальные CPU.

Во время выполнения Ignition собирает **Type Feedback**. Для операций вроде `obj.x` или `a + b` V8 заводит слот в **Feedback Vector** и записывает наблюдаемые типы.

Пример `function add(a, b) { return a + b; }`:

-   `add(1, 2)` — в векторе: `a` и `b` — Small Integer, результат — Small Integer.
-   Сотни согласованных вызовов — высокая уверенность в типах.

Без этого feedback оптимизирующие компиляторы «слепы».

### Sparkplug как быстрый baseline

Sparkplug (2021) — первый уровень оптимизации: байткод → машинный код без специализации типов. Даже неоптимизированный машинный код часто быстрее интерпретации байткода и сглаживает обрыв между Ignition и Maglev/TurboFan.

### Maglev как mid-tier оптимизатор

Maglev закрывает разрыв между быстрым, но «плоским» Sparkplug и медленно компилируемым, но очень быстрым TurboFan.

Особенности:

1.  Строит SSA и control flow graph — в отличие от прямого перевода Sparkplug.
2.  Использует type feedback, но делает более безопасные ставки, чем TurboFan.
3.  Компромисс по времени компиляции для кода, которому рано для TurboFan.
4.  Может снижать энергопотребление: CPU меньше «крутится» в слабо оптимизированном коде, ожидая TurboFan.
5.  Служит «пробным полигоном» перед TurboFan.

### Счетчик «горячести» TurboFan

V8 использует счетчики и эвристики: итерации цикла весят больше, чем отдельные вызовы; стабильный feedback ускоряет продвижение; учитываются ресурсы CPU.

Задача компиляции TurboFan уходит в **фоновый поток** — главный поток приложения не блокируется на компиляции.

### Спекулятивная оптимизация TurboFan

TurboFan получает байткод Ignition, богатый feedback и иногда код Maglev. Он строит граф **sea of nodes** и применяет [constant folding](https://en.wikipedia.org/wiki/Constant_folding), [loop unrolling](https://en.wikipedia.org/wiki/Loop_unrolling), удаление мертвого кода.

По feedback для `obj.x` TurboFan может сгенерировать прямой доступ к памяти вместо hash lookup — например, `mov rax, [rbx + 0x18]`.

!!!note ""

    Если вы не читали ассемблер: эта инструкция читает данные по фиксированному смещению от адреса объекта, минуя медленный поиск свойства.

Горячая `foo()` может **инлайнить** `bar()` — скопировать машинный код `bar` в тело `foo` и убрать накладные расходы вызова.

Для длинных циклов, которые уже крутятся в Ignition, есть **On-Stack Replacement (OSR)**: V8 может заменить кадр выполнения посреди цикла на оптимизированный.

Итог TurboFan — очень быстрый код, полностью зависящий от того, что ранние наблюдения останутся верными.

## Скрытые классы и формы объектов

Если из внутренностей V8 запомнить одну идею — пусть это будут **Hidden Classes** (в исходниках V8 — Shapes/Maps). Именно они делают быстрый доступ к свойствам; на них строятся оптимизации компиляторов.

### Миф: объекты JavaScript — это hash map

Логически объект похож на словарь, но для V8 hash lookup медленный. Чтобы ускорить доступ к свойствам, V8 ведет себя так, будто у объектов есть «классы».

При создании объекта V8 создает **скрытый класс** — метаданные о layout свойств в памяти.

```js
// Запуск: node --allow-natives-syntax hidden-classes-demo.js
const obj1 = {};
console.log(%HaveSameMap(obj1, {})); // true — общий начальный hidden class

obj1.x = 1;

const obj2 = {};
console.log(%HaveSameMap(obj1, obj2)); // false — у obj1 класс уже другой

obj2.x = 5;
console.log(%HaveSameMap(obj1, obj2)); // true — тот же путь переходов
```

!!!warning ""

    Intrinsics V8 (`%HaveSameMap` и др.) — внутренние неподдерживаемые API, меняются между версиями. Только для экспериментов с `--allow-natives-syntax`. Не использовать в продакшене.

### Деревья переходов (transition trees)

V8 не создает отдельный hidden class на каждую возможную форму «с нуля» — он строит **цепочки переходов**.

`const p1 = {}` → базовый класс `C0`.  
`p1.x = 5` → переход `C0 + 'x' => C1`, свойство `x` получает фиксированное смещение.  
`p1.y = 10` → `C1 + 'y' => C2`.

Второй объект `p2` с тем же порядком добавления свойств дойдет до `C2` — у `p1` и `p2` **один** hidden class.

Если у `p3` порядок другой — `p3.y = 1; p3.x = 2;` — путь `C0 → C3 → C4`. Свойства те же, **формы разные**.

### Катастрофа с config object

Именно это сломало наш кейс с P99 = 200 ms:

```js
function createConfig(base, userOverrides, requestParams) {
    let config = { ...base };

    for (const key in userOverrides) {
        config[key] = userOverrides[key]; // порядок ключей непредсказуем
    }

    if (requestParams.useNewFeature) {
        config.optionalFeature = true; // иногда добавляем свойство — ветвление дерева
    }

    return config;
}
```

Десятки и сотни hidden classes для логически одинаковых объектов. TurboFan не мог сделать надежную ставку — оптимизировал под одну форму и сразу deopt при другой.

Исправление для hot path — **заранее инициализировать** часто используемые свойства, даже как `null`/`undefined`:

```js
function createConfigV2(
    base,
    userOverrides,
    requestParams
) {
    let config = {
        ...base,
        settingA: null,
        settingB: null,
        optionalFeature: false,
    };

    for (const key in userOverrides) {
        if (key in config) {
            config[key] = userOverrides[key]; // обновление, а не добавление
        }
    }

    if (requestParams.useNewFeature) {
        config.optionalFeature = true;
    }

    return config;
}
```

Стабильная начальная форма вернула latency с ~200 ms к ~2 ms. **Порядок и момент добавления свойств** напрямую влияют на то, останется ли путь быстрым.

!!!warning ""

    Полная инициализация всех полей стабилизирует форму, но на больших объектах тратит память. Делайте так только на hot path; в остальном коде важнее читаемость.

## Inline cache и мономорфизм

Hidden classes — «что». **Inline Cache (IC)** — «как» V8 превращает это в скорость на call site.

**Call site** — конкретное место в коде динамической операции:

```js
function getX(point) {
    return point.x; // call site доступа к .x
}
```

Первый доступ `obj.x` на call site медленный:

1.  Взять hidden class объекта.
2.  Найти смещение свойства `x`.
3.  Прочитать значение по смещению.

V8 запоминает результат и переписывает stub на call site. Следующий раз IC проверяет: «тот же hidden class?» — если да, доступ по кэшированному смещению, почти как в C++.

Состояния IC:

1.  **Uninitialized** — еще не выполнялось.
2.  **Monomorphic** — видели один hidden class. Самое быстрое состояние.
3.  **Polymorphic** — несколько форм (обычно 2–4). Цепочка проверок «форма A → смещение X, форма B → Y».
4.  **Megamorphic** — слишком много форм. IC «загрязнен», V8 уходит в медленный generic lookup.

### Небольшой бенчмарк

```js
// node --allow-natives-syntax monomorphic-patterns.js
const ITERATIONS = 10_000_000;

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

function getX_Monomorphic(point) {
    return point.x;
}

function getX_Polymorphic(point) {
    return point.x;
}

for (let i = 0; i < 1000; i++) {
    getX_Monomorphic(new Point2D(i, i));
    getX_Polymorphic(new Point2D(i, i));
    getX_Polymorphic(new Point3D(i, i, i));
}

console.time('Monomorphic');
let mono_sum = 0;
for (let i = 0; i < ITERATIONS; i++) {
    mono_sum += getX_Monomorphic(new Point2D(i, i));
}
console.timeEnd('Monomorphic');

console.time('Polymorphic');
let poly_sum = 0;
for (let i = 0; i < ITERATIONS; i++) {
    const point =
        i % 2 === 0
            ? new Point2D(i, i)
            : new Point3D(i, i, i);
    poly_sum += getX_Polymorphic(point);
}
console.timeEnd('Polymorphic');

console.log(mono_sum, poly_sum);
```

На Node.js v23 у автора оригинала: Monomorphic ~16 ms, Polymorphic ~47 ms — почти **в 3 раза** медленнее при двух формах. При пяти источниках объектов call site легко становится megamorphic (штраф 10–50×).

Лучше две мономорфные функции `processUser` и `processCompany`, чем одна «универсальная». Скучный повторяемый код часто самый быстрый.

## Деоптимизация V8 в Node.js

Деоптимизация — «аварийный выход»: выбросить быстрый машинный код и вернуться на нижний tier. Это одна из главных причин загадочных просадок в Node.

Код Maglev/TurboFan **спекулятивен**: построен на предположениях Ignition. Любое нарушение на runtime → deopt.

### Частые триггеры

1.  **Несовпадение hidden class.** TurboFan ждал `C2`, пришел объект с `C4` — bailout.
2.  **Смена element kind массива.** `[1, 2, 3]` (packed SMI) + `arr.push('a')` — переход хранилища; в горячих циклах по большим массивам это больно.
3.  **`try...catch` (исторически).** В старых V8 мешал оптимизациям. В Node 16+ (и v22–24) влияние обычно минимально — не отказывайтесь от обработки ошибок из‑за мифа о скорости.

!!!note ""

    Современный V8 нормально оптимизирует `try...catch`. Убирайте их из hot path только после профилирования, не «на всякий случай».

4.  **`arguments`.** Классический deoptimizer; rest‑параметры (`...args`) почти всегда дружелюбнее JIT.
5.  **`delete`.** На горячих объектах может перевести свойства в dictionary mode (медленный hash‑подобный layout). Для сброса значения на hot path часто достаточно `obj.x = undefined`. Если свойство должно исчезнуть для `in` / `Object.keys` — `delete` уместен, но не на hot path.

!!!note ""

    `undefined` **не эквивалентно** `delete`: ключ остается для `Object.keys()`, оператора `in` и итерации.

### BigInt и цикл деоптимизации

В сервисе симуляции транзакций горячая `validateTransaction` оптимизировалась TurboFan и сразу deopt — в логах тысячи строк:

`[deoptimizing: ... reason=unexpected BigInt]`

Большинство транзакций укладывались в `Number`, но «китовые» переводы токенов с большим числом десятичных знаков требовали `BigInt`. TurboFan ставил на `Number`, при `BigInt` — bailout, через тысячи вызовов снова оптимизация под `Number` — **deoptimization loop**.

```js
// Так нельзя:
const value = BigInt(rawTx.value);
const slippage = value * 0.005; // TypeError: нельзя смешивать BigInt и Number
```

**Вариант 1 — только BigInt и scaled integer math:**

```js
const MAX_SLIPPAGE_BPS = 50n;

function handleRawTx(rawTx) {
    return validateTransaction({
        ...rawTx,
        value: BigInt(rawTx.value),
    });
}

function validateTransaction(tx) {
    const slippage = (tx.value * MAX_SLIPPAGE_BPS) / 10000n;
    // ...
}
```

Стабильно, но `BigInt` медленнее `Number` для значений, которые влезают в обычный number.

**Вариант 2 — dispatcher (часто лучший peak performance):**

```js
function handleRawTx(rawTx) {
    const val = BigInt(rawTx.value);

    if (val <= BigInt(Number.MAX_SAFE_INTEGER)) {
        return validateTransactionNumber({
            ...rawTx,
            value: Number(val),
        });
    }
    return validateTransactionBigInt({
        ...rawTx,
        value: val,
    });
}

function validateTransactionNumber(tx) {
    const slippage = tx.value * 0.005;
    // ...
}

function validateTransactionBigInt(tx) {
    const slippage = (tx.value * 50n) / 10000n;
    // ...
}
```

**Вариант 3 — guarded branch в одной функции:**

```js
function validateTransaction(tx) {
    if (typeof tx.value === 'bigint') {
        const slippage = (tx.value * 50n) / 10000n;
    } else {
        const slippage = tx.value * 0.005;
    }
}
```

!!!warning ""

    Одна функция с ветками `number` и `bigint` — полиморфна. Для экстремального hot path dispatcher с двумя мономорфными функциями обычно стабильнее; guarded branch — компромисс, когда ветка редкая или путь не самый горячий.

## Layout памяти и представление объектов

Чтобы понимать performance V8, полезно представлять, как значения лежат в памяти.

V8 использует **pointer tagging**: по младшему биту слова отличает «немедленное» значение (малые целые) от указателя на heap. С **pointer compression** tagged‑значения часто занимают 32 бита в heap‑слоте на 64‑битных системах.

### Малые целые (SMI)

Если младший бит `0`, остальные биты — **Small Integer (Smi)**. На 64‑битных сборках с pointer compression это 31‑битное знаковое целое (~±1 млрд). Heap не выделяется — число «вшито» в указатель.

Арифметика SMI быстрая: ALU CPU работает напрямую. Циклы `for` с целочисленным счетчиком обычно быстрее циклов с double или объектами.

### Heap objects

Если младший бит `1`, слово — указатель на heap (строки, массивы, объекты, `HeapNumber` для дробей).

`const a = 3.14` классически → `HeapNumber` на heap. Современный V8 часто избегает лишних аллокаций через **unboxing** и **escape analysis**, если значение не «убегает» из функции.

### Layout объекта в памяти

Блок объекта на heap содержит:

1.  Указатель на hidden class.
2.  Поля свойств с фиксированными смещениями (в fast mode).

Для `const p = { x: 1, y: 2 }` TurboFan при оптимизации `p.y` читает `[адрес p + смещение]` без hash lookup.

### Интернирование строк

Одинаковые строковые литералы (`'success'`) хранятся один раз. Сравнение часто сводится к сравнению указателей.

Отсюда практические выводы:

1.  Целая арифметика быстра — Smi без heap.
2.  Hidden classes дают доступ по смещению.
3.  `delete` на hot object переводит свойства в dictionary mode — медленно.

## Типичные обрывы производительности

### Нестабильные формы объектов

-   **Симптом:** обработка объектов «в целом» медленная, flame graph широкий и плоский.
-   **Причина:** megamorphic IC из‑за взрыва hidden classes.

```js
// Плохо
const user = { name: 'Alice' };
if (isAdmin) {
    user.permissions = ['...'];
}

// Лучше на hot path
const user = {
    name: 'Alice',
    permissions: null,
};
if (isAdmin) {
    user.permissions = ['...'];
}
```

### Полиморфные и megamorphic функции

```js
// Плохо
function getIdentifier(entity) {
    return entity.id || entity.uuid || entity.productId;
}

// Лучше
function getUserId(user) {
    return user.id;
}
function getProductIdentifier(product) {
    return product.productId;
}
```

### `delete` на объектах

In‑memory кэш: `delete cache[key]` при истечении TTL убил throughput (~35–40% ожидаемого). Профиль показал dictionary lookup и megamorphic IC.

`delete` меняет внутреннее представление сильнее, чем «просто убрать ключ» — объект уходит в **Dictionary Mode**, и **все** обращения к свойствам становятся медленными.

```js
const cache = {};

function evictWithDelete(key) {
    delete cache[key]; // отравляет объект кэша
}

function evictWithUndefined(key) {
    cache[key] = undefined; // hidden class стабилен
}
```

Замена `delete` на `undefined` дала рост throughput в 3–4 раза (в кейсе автора).

### Смешение element kinds в массивах

V8 различает виды элементов:

-   `PACKED_SMI_ELEMENTS` — быстрее всего.
-   `PACKED_DOUBLE_ELEMENTS`
-   `PACKED_ELEMENTS` — указатели на объекты.
-   `HOLEY_ELEMENTS` — «дырявые» массивы (`[1, , 3]`).
-   `DICTIONARY_ELEMENTS` — медленнее всего.

`[1, 2, 3]` + `push('hello')` → переход хранилища. В обычном коде V8 часто справляется; в tight numeric loops и на больших данных стабильный kind важен.

!!!note ""

    Смешение kinds бьет по hot loops. В повседневном коде эффект часто незаметен.

## Паттерны, дружелюбные к V8

Предсказуемый, мономорфный код обычно на порядки быстрее «умного» динамического.

```js
class DataPacket {
    constructor(id, timestamp, payloadType, payload) {
        this.id = id;
        this.timestamp = timestamp;
        this.payloadType = payloadType;
        this.payload = payload;
    }
}

function processPacket(packet) {
    const id = packet.id;
    const type = packet.payloadType;

    if ((id & 1) === 0) {
        // четные id — намек на Smi
    }

    if (type === 'USER_EVENT' && packet.payload) {
        // ...
    }
}

const packets = [];
for (let i = 0; i < 1000; i++) {
    packets.push(
        new DataPacket(i, Date.now(), 'USER_EVENT', {
            data: '...',
        })
    );
}

function processAll() {
    for (let i = 0; i < packets.length; i++) {
        processPacket(packets[i]);
    }
}

console.time('Processing');
processAll();
console.timeEnd('Processing');
```

### Чеклист стратегии оптимизации

Перед правками кода:

-   Инициализируйте все свойства (`null`/`undefined` допустимы).
-   Один путь создания объектов (constructor/factory).
-   Разделяйте функции с разными формами на мономорфные.
-   На hot path: `undefined` вместо `delete`.
-   Не смешивайте element kinds в горячих массивах.

## Флаги V8 и опции runtime

Список флагов: `node --v8-options`.

### Информационные флаги

-   `--trace-opt` — что оптимизировали Sparkplug/Maglev/TurboFan.
-   `--trace-deopt` — каждая деоптимизация с причиной (ключевой флаг отладки).
-   `--trace-ic` — переходы IC (monomorphic → polymorphic → megamorphic).
-   `--trace-gc` — события GC.

### Поведенческие флаги

-   `--allow-natives-syntax` — `%`‑intrinsics; не для продакшена.
-   `--optimize-for-size` — меньше агрессии JIT, меньше памяти под код.
-   `--max-old-space-size=<MB>` — лимит old generation.
-   `--jitless` — только Ignition; для security baseline, не для speed.

Запуск:

```bash
node --trace-deopt --max-old-space-size=4096 my_app.js
```

Через окружение:

```bash
export NODE_OPTIONS="--trace-deopt --max-old-space-size=4096"
node my_app.js
```

## От Full-Codegen к TurboFan

Долго pipeline V8 был проще:

-   **Full-Codegen** — быстрая, но медленная машинная генерация.
-   **Crankshaft** — тяжелый оптимизатор (SSA), большой разрыв по скорости, дорогой bailout, дублирование работы при новых фичах языка.

Современная схема:

-   **Ignition** — байткод, низкий footprint, быстрый старт.
-   **TurboFan** — sea of nodes, лучший tiering и deopt, WASM и сложные конструкции.
-   **Sparkplug (2021)** — сглаживание между interpreter и optimizer.
-   **Maglev (2023)** — mid-tier «достаточно хорошо, достаточно быстро».

### Миф: современный V8 оптимизирует всё

Нет. Оптимизация дорога. Pipeline заточен под tiered compilation: минимум для старта, максимум усилий — на малую долю hot path. Ваша задача — сделать эту долю предсказуемой.

## Правила производительности V8 для Node.js

**Делайте:**

-   Классы/конструкторы/factory для единой формы объектов; инициализируйте все поля.
-   Мономорфные функции на hot path; при нескольких формах — разбивайте.
-   Используйте Smi там, где уместно.
-   Профилируйте (`node --prof`, Chrome Inspector), ищите deopt (`--trace-deopt`).
-   Простой прямой код JIT понимает лучше «умной» динамики.

**Не делайте:**

-   `delete` на hot objects (замена — `undefined`, если семантика позволяет).
-   Функции с «любой» формой аргументов на hot path.
-   Добавление свойств после создания на hot path.
-   `arguments` — предпочитайте rest parameters.
-   `eval` и `with` — черный ящик для компилятора.
-   Игнорирование deopt в горячих функциях.

### Краткий чеклист

-   Стабильны ли формы hot path объектов?
-   Мономорфны ли горячие функции?
-   Запускали ли `--trace-deopt` на hot path?
-   Есть ли профиль под нагрузкой?
-   Эффективен ли layout массивов (без лишних holes и смен kind)?
-   Измерили ли «до/после»?

## Приложение: команды профилирования V8

Базовый CPU‑профиль:

```bash
node --prof my_app.js
node --prof-process isolate-XXXX-v8.log > profile.txt
```

Chrome DevTools:

```bash
node --inspect my_app.js
# или
node --inspect-brk my_app.js
```

Затем `chrome://inspect`.

Трассировка JIT:

```bash
node --trace-opt my_script.js
node --trace-deopt my_script.js
node --trace-ic my_script.js
node --trace-opt --trace-deopt my_script.js | grep "myHotFunction"
```

Intrinsics для бенчмарков:

```bash
node --allow-natives-syntax my_benchmark.js
```

Примеры: `%HaveSameMap(obj1, obj2)`, `%GetOptimizationStatus(func)`, `%OptimizeFunctionOnNextCall(func)`.

---

V8 награждает «скучные» runtime‑формы: стабильные объекты, массивы и call sites дают feedback vector достаточно однородный для оптимизированного кода. Код, который постоянно меняет форму, чаще откатывается, перекомпилируется и платит за восстановление.

## Связанное чтение

-   Предыдущая: [Что такое Node.js](./what-is-nodejs.md)
-   Далее: [Event loop Node.js: фазы, микрозадачи и libuv](./event-loop-intro.md)
