---
description: Исторически сложилось так, что в Node.js отсутствовал интегрированный прогонщик тестов, что вынуждало разработчиков полагаться на сторонние фреймворки, такие как Jest или Mocha
---

# Node.js Test Runner: Руководство для начинающих

Исторически сложилось так, что в Node.js отсутствовал интегрированный прогонщик тестов, что вынуждало разработчиков полагаться на сторонние фреймворки, такие как Jest или Mocha.

Ситуация изменилась, когда Джеймс М. Снелл [предложил на GitHub](https://github.com/nodejs/node/issues/40954) включить в состав Node.js программу для запуска тестов. Предложение со временем развивалось и в итоге было [включено в ядро](https://github.com/nodejs/node/pull/42325) Node.js.

В результате Node версии 18 и выше включает в себя встроенную программу запуска тестов, которая устраняет необходимость во внешних зависимостях для тестирования.

В этой статье вы познакомитесь с возможностями нового раннера тестирования и рассмотрите несколько примеров.

## Предварительные условия

Прежде чем приступить к этому руководству, убедитесь, что у вас установлена [последняя версия Node.js](https://nodejs.org/en/download), предпочтительно последняя LTS.

## Шаг 1 - Настройка директории

В этом разделе вы создадите директорию проекта для кода Node.js, который вы будете тестировать на протяжении всего этого урока.

Для начала создайте каталог и перейдите в него с помощью следующей команды:

```sh
mkdir testrunner-demo && cd testrunner-demo
```

Затем инициализируйте каталог как проект npm:

```sh
npm init -y
```

Эта команда создает файл `package.json`, который содержит важные метаданные для вашего проекта.

После этого выполните приведенную ниже команду, чтобы включить ES-модули в вашем проекте:

```sh
npm pkg set type="module"
```

Это добавит ключ `type` в ваш файл `package.json` и установит его значение на `module`:

```json title="package.json"
{
    // ...
    "type": "module"
}
```

Теперь вы готовы создать программу на Node.js, которую будете тестировать. Вот программа в полном объеме:

```js title="formatter.js"
function formatFileSize(sizeBytes) {
    if (sizeBytes === 0) {
        return '0B';
    }
    const sizeName = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(
        Math.log(sizeBytes) / Math.log(1024)
    );
    const p = Math.pow(1024, i);
    const s = (sizeBytes / p).toFixed(2);
    return `${s} ${sizeName[i]}`;
}

export { formatFileSize };
```

---

```js title="index.js"
import { formatFileSize } from './formatter.js';

if (process.argv.length > 2) {
    const sizeBytes = parseInt(process.argv[2]);
    const formattedSize = formatFileSize(sizeBytes);
    console.log(formattedSize);
} else {
    console.log(
        'Please provide the file size in bytes as a command-line argument.'
    );
}
```

Приведенный выше код преобразует размеры файлов из байтов в более понятный для человека формат, например, КБ, МБ и т. д. Сохраните код в соответствующих файлах в корне проекта и протестируйте его, предоставляя различные входные данные:

```sh
node index.js 1024
```

---

```sh
node index.js 1073741824
```

---

```sh
node index.js 0
```

Вот ожидаемые результаты:

```sh title="Output"
1.00 KB
1.00 GB
0B
```

Теперь, когда вы поняли, что нужно тестировать, перейдем к следующему разделу, где вы создадите свой первый тест с помощью тестового раннера Node.js.

## Шаг 2 - Написание первого теста

Юнит-тестирование необходимо для проверки правильности работы функций в различных сценариях. Это подтверждает функциональность, а также служит документацией для будущих разработчиков.

В предыдущем разделе мы обсудили, что делает демонстрационная программа и каковы ее ожидаемые результаты. Вместо того чтобы вручную проверять эти результаты, вы создадите модульные тесты, чтобы автоматизировать этот процесс.

Начните с создания каталога `tests` в корневой папке вашего проекта:

```sh
mkdir tests
```

Затем создайте файл с именем `formatter.test.js` внутри вашего `tests` со следующим содержимым:

```sh
code tests/formatter.test.js
```

---

```js title="tests/formatter.test.js"
import { formatFileSize } from '../formatter.js';
import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('formatFileSize function', () => {
    it('should return "1.00 GB" for sizeBytes = 1073741824', () => {
        assert.strictEqual(
            formatFileSize(1073741824),
            '1.00 GB'
        );
    });
});
```

Здесь импортируется функция `formatFileSize()`, а также функции тестирования `describe` и `it` из `node:test`, и `assert` из `node:assert`.

Функция `describe` оборачивает ваши тесты в группу, называемую тестовым набором, в котором вы можете определить несколько тестов. Тест, инкапсулированный в `it`, проверяет, соответствует ли фактический вывод функции `formatFileSize()` ожидаемому результату «1.00 GB». Такой автоматизированный подход гарантирует, что функция работает так, как задумано, без ручной проверки каждого вывода.

## Шаг 3 - Запуск тестов

После того как вы сохранили файл с тестами, можно приступать к их выполнению. Чтобы запустить тест с помощью программы запуска тестов Node, используйте флаг `--test`:

```sh
node --test
```

Эта команда побуждает Node.js искать файлы, соответствующие определенным шаблонам, начиная с текущего каталога и ниже:

-   Файлы с расширениями `.js`, `.cjs` или `.mjs`, расположенные в каталогах `test` или `tests`.
-   Любой файл с именем `test`, независимо от расширения, например, `test.js`.
-   Файлы, начинающиеся с `test-`, например, `test-feature.cjs`.
-   Файлы, заканчивающиеся на `.test`, `-test` или `_test`, например, `example.test.js`, `example-test.cjs`, `example_test.mjs`.

По умолчанию каждый совпадающий файл выполняется в отдельном дочернем процессе. Если дочерний процесс завершается с кодом выхода `0`, тест считается пройденным, в противном случае - неудачным.

После выполнения тестов вывод будет выглядеть следующим образом:

```sh title="Output"
▶ formatFileSize function
  ✔ should return "1.00 GB" for sizeBytes = 1073741824 (0.770195ms)
▶ formatFileSize function (4.013289ms)

ℹ tests 1
ℹ suites 1
ℹ pass 1
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 112.371317
```

Вывод показывает, что тестовый набор с одним случаем для функции `formatFileSize()` выполнился успешно, проверив, что она возвращает «1.00 GB» для 1073741824 байт без сбоев, отказов или пропусков. На выполнение теста ушло около 112,37 миллисекунды.

В программе тестирования используется формат [TAP output format](https://node-tap.org/tap-format/), который уже широко распространен в экосистеме.

### Watch Mode

Node.js предлагает удобный режим [watch mode](https://nodejs.org/api/test.html#watch-mode), который автоматически отслеживает изменения в ваших тестовых файлах и зависимостях. Эта функция автоматически перезапускает тесты при обнаружении изменений, гарантируя, что ваш код продолжает соответствовать ожидаемым результатам.

Чтобы включить и использовать режим watch, вы можете воспользоваться следующей командой:

```sh
node --test --watch
```

---

```sh title="Output"
▶ formatFileSize function
  ✔ should return "1.00 GB" for sizeBytes = 1073741824 (0.408844ms)
▶ formatFileSize function (2.391008ms)
```

## Шаг 4 - Тестирование с помощью синтаксиса `test`

Вы уже изучили синтаксис `describe` и `it` для структурирования тестов, которые широко используются. Однако Node.js также поддерживает синтаксис `test`, если вы предпочитаете другой стиль.

Вот как можно адаптировать предыдущий пример для использования синтаксиса `test`:

```js title="tests/formatter.test.js"
import { formatFileSize } from '../formatter.js';
import { test } from 'node:test';
import assert from 'node:assert';

test('formatFileSize function', (t) => {
    t.test(
        'should return "1.00 GB" for sizeBytes = 1073741824',
        () => {
            assert.strictEqual(
                formatFileSize(1073741824),
                '1.00 GB'
            );
        }
    );
});
```

При запуске этот тест выдает результат, аналогичный тому, который вы получили в предыдущем разделе:

```sh title="Output"
▶ formatFileSize function
  ✔ should return "1.00 GB" for sizeBytes = 1073741824 (0.927199ms)
▶ formatFileSize function (3.391822ms)

ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 92.568164
```

Очень важно использовать этот синтаксис аккуратно, следя за тем, чтобы подтесты были построены с помощью метода `t.test()`. Использование функции верхнего уровня `test()` для подтестов приведет к ошибке:

```js title="tests/formatter.test.js"
// ...
test('formatFileSize function', (t) => {
    test('should return "1.00 GB" for sizeBytes = 1073741824', () => {
        assert.strictEqual(
            formatFileSize(1073741824),
            '1.00 GB'
        );
    });
});
```

---

```sh title="Output"
▶ formatFileSize function
  ✖ should return "1.00 GB" for sizeBytes = 1073741824 (1.286924ms)
    'test did not finish before its parent and was cancelled'

▶ formatFileSize function (2.843585ms)

ℹ tests 2
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 1
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 71.138765

✖ failing tests:

test at file:/home/ayo/dev/betterstack/demo/testrunner-demo/tests/formatter.test.js:6:3
✖ should return "1.00 GB" for sizeBytes = 1073741824 (1.286924ms)
  'test did not finish before its parent and was cancelled'
```

Синтаксис `describe/it` менее подвержен подобным ошибкам, поэтому мы будем продолжать отдавать предпочтение этому синтаксису в этой статье для последовательности и ясности.

## Шаг 5 - Фильтрация и ограничение тестов

При управлении набором тестов часто возникают ситуации, когда необходимо отфильтровать или ограничить выполнение определенных тестов. Это позволяет сфокусировать тестирование на определенных файлах, сценариях или условиях, не запуская каждый раз весь набор.

### Фильтрация тестов по имени

Программа запуска тестов Node поддерживает выбор тестов с помощью аргумента `--test-name-pattern`. Вот пример:

```js title="tests/formatter.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatFileSize } from '../formatter.js';

describe('formatFileSize function', () => {
    it("should return '0B' for sizeBytes = 0", () => {
        assert.strictEqual(formatFileSize(0), '0B');
    });

    it("should return '1.00 MB' for sizeBytes = 1048576", () => {
        assert.strictEqual(
            formatFileSize(1048576),
            '1.00 MB'
        );
    });

    it("should return '1.00 GB' for sizeBytes = 1073741824 @large", () => {
        assert.strictEqual(
            formatFileSize(1073741824),
            '1.00 GB'
        );
    });

    it("should return '5.00 GB' for sizeBytes = 5368709120 @large", () => {
        assert.strictEqual(
            formatFileSize(5368709120),
            '5.00 GB'
        );
    });
});
```

Обратите внимание, что в некоторые тесты был добавлен тег `@large`. Этот тег можно назвать как угодно. Чтобы запустить только тесты, помеченные `@large`, используйте:

```sh
node --test --test-name-pattern @large
```

Результат выполнения этой команды будет выглядеть следующим образом:

```sh title="Output"
▶ formatFileSize function
  ﹣ should return '0B' for sizeBytes = 0 (0.882616ms) # test name does not match pattern
  ﹣ should return '1.00 MB' for sizeBytes = 1048576 (0.190468ms) # test name does not match pattern
  ✔ should return '1.00 GB' for sizeBytes = 1073741824 @large (0.365786ms)
  ✔ should return '5.00 GB' for sizeBytes = 5368709120 @large (0.187443ms)
▶ formatFileSize function (6.018844ms)

ℹ tests 4
ℹ suites 1
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 2
ℹ todo 0
ℹ duration_ms 137.936039
```

Вы также можете запустить конкретный тест, используя уникальную часть имени теста, например, так:

```sh
node --test --test-name-pattern 'sizeBytes = 0'
```

---

```sh title="Output"
▶ formatFileSize function
  ✔ should return '0B' for sizeBytes = 0 (0.61673ms)
  ﹣ should return '1.00 MB' for sizeBytes = 1048576 (0.112328ms) # test name does not match pattern
  ﹣ should return '1.00 GB' for sizeBytes = 1073741824 @large (0.099617ms) # test name does not match pattern
  ﹣ should return '5.00 GB' for sizeBytes = 5368709120 @large (0.114415ms) # test name does not match pattern
▶ formatFileSize function (3.244393ms)

. . .
```

### Пропуск тестов с помощью `skip`

Программа запуска тестов Node.js также предлагает метод `skip()` для пропуска определенных тестов. Его можно использовать как `describe.skip()` для пропуска всего набора, или как `it.skip()` для пропуска подтеста. Вы можете написать его как:

```js title="tests/formatter.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatFileSize } from '../formatter.js';

describe('formatFileSize function', () => {
    it.skip("should return '0B' for sizeBytes = 0", () => {
        assert.strictEqual(formatFileSize(0), '0B');
    });

    // ...
});
```

Или:

```js title="tests/formatter.test.js"
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatFileSize } from '../formatter.js';

describe('formatFileSize function', () => {
    it(
        "should return '0B' for sizeBytes = 0",
        { skip: true },
        () => {
            assert.strictEqual(formatFileSize(0), '0B');
        }
    );

    // ...
});
```

При выполнении вывод покажет, что один тест был пропущен, а остальные выполнены:

```sh title="Output"
▶ formatFileSize function
  ﹣ should return '0B' for sizeBytes = 0 (0.474751ms) # SKIP
  ✔ should return '1.00 MB' for sizeBytes = 1048576 (0.276706ms)
  ✔ should return '1.00 GB' for sizeBytes = 1073741824 @large (0.172765ms)
  ✔ should return '5.00 GB' for sizeBytes = 5368709120 @large (0.147009ms)
▶ formatFileSize function (3.439809ms)

...
```

## Шаг 6 - Реализация mocks

В раннере тестирования Node.js есть встроенные возможности mocking, которые идеально подходят для тестирования внешних API, стороннего кода или методов. Это гарантирует, что ваши модульные тесты будут стабильными и не будут зависеть от внешних факторов, таких как сетевое подключение или изменения в файловой системе.

Например, метод `readFile()`, который считывает данные с локального диска, может быть сымитирован, чтобы избежать фактического считывания данных с диска во время тестирования:

```js title="tests/index.test.js"
import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

// Mocking fs.readFile() method
mock.method(
    fs.promises,
    'readFile',
    async () => 'Hello World'
);

describe('Mocking fs.readFile in Node.js', () => {
    it('should successfully read the content of a text file', async () => {
        assert.strictEqual(
            fs.promises.readFile.mock.calls.length,
            0
        );
        assert.strictEqual(
            await fs.promises.readFile('text-content.txt'),
            'Hello World'
        );
        assert.strictEqual(
            fs.promises.readFile.mock.calls.length,
            1
        );

        // Reset the globally tracked mocks.
        mock.reset();
    });
});
```

В этом примере используется `mock.method()` для замены реальной функции `fs.promises.readFile()` на макетную функцию, которая возвращает `Hello World`.

Тест проверяет, что макетная функция ведет себя так, как ожидается, гарантируя, что она вызывается правильно и выдает правильный результат. После выполнения теста используется `mock.reset()` для очистки всех глобально отслеживаемых данных макета, что позволяет сохранить изоляцию теста.

После выполнения эта тестовая установка выдаст следующий результат:

```sh title="Output"
▶ Mocking fs.readFile in Node.js
  ✔ should successfully read the content of a text file (0.566754ms)
▶ Mocking fs.readFile in Node.js (3.307336ms)

. . .
```

### Имитация таймеров

В Node.js v20.4.0 был представлен API `MockTimers`, позволяющий моделировать функции, связанные со временем, такие как `setTimeout()` и `setInterval()`.

Вот как использовать эту возможность с помощью `mock.timers.enable()`:

```js title="tests/index.test.js"
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

describe('Mocking setTimeout in Node.js', () => {
    it('should successfully mock setTimeout', () => {
        const fn = mock.fn();
        mock.timers.enable({ apis: ['setTimeout'] });
        setTimeout(fn, 20);

        mock.timers.tick(10);
        mock.timers.tick(10);

        assert.strictEqual(fn.mock.callCount(), 1);
    });
});
```

В этом примере функция `setTimeout` переопределена, чтобы протестировать ее поведение, не дожидаясь истечения реального времени. Тест инициирует таймаут для выполнения функции через 20 миллисекунд, а затем переводит часы на два шага по 10 миллисекунд.

Несмотря на то, что общее время симуляции совпадает с длительностью таймаута, функция считается вызванной только один раз благодаря настройке имитации. Этот метод обеспечивает точный способ тестирования кода, зависящего от времени, без реальной задержки.

При запуске вывод выглядит следующим образом:

```sh title="Output"
node:2641257) ExperimentalWarning: The MockTimers API is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
▶ Mocking setTimeout in Node.js
  ✔ should successfully mock setTimeout (1.156348ms)
▶ Mocking setTimeout in Node.js (2.780952ms)

. . .
```

Вы также можете использовать API `MockTimers` для имитации и контроля поведения объекта `Date`, что невероятно полезно для тестирования функций, зависящих от времени, таких как `Date.now()`.

В следующем примере показано, как имитировать объект `Date` с помощью этого API:

```js title="tests/index.test.js"
import assert from 'node:assert';
import { describe, it, test } from 'node:test';

describe('Mocking the Date object in Node.js', () => {
    it('should effectively mock the Date object starting from 200 milliseconds', (context) => {
        context.mock.timers.enable({
            apis: ['Date'],
            now: 200,
        });
        assert.strictEqual(Date.now(), 200);

        // Simulate advancing time by 200 milliseconds
        context.mock.timers.tick(200);
        assert.strictEqual(Date.now(), 400);
    });
});
```

В этом примере начальное время объекта `Date` составляет 200 миллисекунд. Тест проверяет, что `Date.now()` изначально совпадает с этой макетной установкой. Затем он увеличивает время на 200 миллисекунд с помощью `context.mock.timers.tick(200)` и подтверждает, что `Date.now()` обновляется соответственно до 400 миллисекунд.

При запуске вывод выглядит примерно так:

```sh title="Output"
(node:2644346) ExperimentalWarning: The MockTimers API is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
▶ Mocking the Date object in Node.js
  ✔ should effectively mock the Date object starting from 200 milliseconds (1.496926ms)
▶ Mocking the Date object in Node.js (4.26249ms)

. . .
```

## Шаг 7 - Использование тестовых крючков для задач установки и завершения работы

Еще одна полезная функция, предлагаемая программой запуска тестов, - это хуки, которые обычно используются для задач установки и завершения. Установка включает в себя настройку окружения для теста, в то время как удаление связано с очисткой или сбросом всего, что было установлено на этапе установки.

Предоставляются следующие хуки:

-   `before`: Этот хук запускается один раз перед выполнением любого теста. Он часто используется для настройки окружения, например, для установки соединения с базой данных или загрузки фикстур.
-   `beforeEach()`: Этот хук запускается перед каждым тестом в наборе. Он помогает настроить необходимые вещи для каждого теста, например, инициализировать объекты или тестовые данные.
-   `after()`: Этот хук запускается после завершения всего набора тестов. Он может использоваться для очистки ресурсов, например, для закрытия соединений с базой данных.
-   `afterEach()`: Этот хук выполняет код после каждого тестового случая.

В предыдущем разделе, посвященном имитации, вы видели пример имитации метода с помощью `mock.method` и сброса имитации. Аналогичные приемы можно использовать и с хуками, как показано ниже:

```js title="tests/index.test.js"
import {
    describe,
    it,
    mock,
    beforeEach,
    afterEach,
} from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Mocking fs.readFile in Node.js', () => {
    beforeEach(() => {
        // Set up mocks or any necessary setup before each test
        mock.method(
            fs.promises,
            'readFile',
            async () => 'Hello World'
        );
    });

    afterEach(() => {
        // Clean up mocks or any other resources after each test
        mock.reset();
    });

    it('should successfully read the content of a text file', async () => {
        assert.strictEqual(
            fs.promises.readFile.mock.calls.length,
            0
        );
        assert.strictEqual(
            await fs.promises.readFile('text-content.txt'),
            'Hello World'
        );
        assert.strictEqual(
            fs.promises.readFile.mock.calls.length,
            1
        );
    });
});
```

Здесь метод `fs.readFile()` подражается перед каждым тестом в хуке `beforeEach()` и сбрасывается в `afterEach()`, чтобы последующие тесты начинались с чистого состояния. Такой подход позволяет избежать проблем, вызванных общим состоянием между тестами.

После выполнения тестов вы увидите примерно такие результаты:

```sh title="Output"
▶ Mocking fs.readFile in Node.js
  ✔ should successfully read the content of a text file (1.186674ms)
▶ Mocking fs.readFile in Node.js (2.618802ms)

. . .
```

## Шаг 9 - Измерение покрытия кода

Программа для запуска тестов Node.js включает экспериментальную функцию для отслеживания покрытия кода, которая включается с помощью флага `--experimental-test-coverage`. Это позволяет получить подробную информацию о том, какая часть вашей программы выполняется вашими тестами, что является ценной метрикой для понимания эффективности тестов.

Чтобы собрать информацию о покрытии кода, используйте следующую команду:

```sh
node --test --experimental-test-coverage
```

Соответствующая часть отчета приведена ниже:

```sh title="Output"
. . .
ℹ start of coverage report
ℹ ------------------------------------------------------------------------
ℹ file                    | line % | branch % | funcs % | uncovered lines
ℹ ------------------------------------------------------------------------
ℹ formatter.js            |  83.33 |    66.67 |  100.00 | 3-4
ℹ tests/formatter.test.js |  95.24 |   100.00 |   80.00 | 7
ℹ tests/index.test.js     | 100.00 |   100.00 |  100.00 |
ℹ ------------------------------------------------------------------------
ℹ all files               |  94.74 |    92.86 |   90.91 |
ℹ ------------------------------------------------------------------------
ℹ end of coverage report
```

Отчет о покрытии показывает процент покрытия кода проекта: файл `formatter.js` имеет 83,33 % покрытия строк, 66,67 % покрытия ветвей и 100 % покрытия функций, при этом строки 3-4 не покрыты.

Кроме того, Node.js позволяет выборочно отключать анализ покрытия кода для определенных участков кода. Это полезно для тех частей кода, которые специфичны для конкретной платформы или сложны для тестирования. Вы можете отключить, а затем снова включить анализ покрытия следующим образом:

```js
/* node:coverage disable */
if (anAlwaysFalseCondition) {
    console.log('this is never executed');
}
/* node:coverage enable */
```

При использовании этих комментариев инструмент покрытия кода будет игнорировать прилагаемый блок кода во время анализа. Эта функция помогает поддерживать точность показателей покрытия за счет исключения участков, которые не способствуют функциональности приложения или нецелесообразно тестировать.

## Шаг 10 - Генерация тестовых отчетов

Прогонщик тестов Node.js поддерживает генерацию подробных отчетов о тестировании, которые неоценимы для анализа, выявления тенденций и ведения документации по результатам тестирования. Вы можете указать формат этих отчетов с помощью флага `--test-reporter`.

Поддерживаемые форматы отчетов включают:

-   **TAP (Test Anything Protocol)**: Этот формат универсален и может использоваться с другими инструментами, которые анализируют вывод TAP.
-   **Spec**: Предоставляет описательный вывод, который легко читать непосредственно в терминале.
-   **Dot**: Отображает минималистичную матрицу, где каждая точка представляет тест.
-   **JUnit**: Генерирует XML-отчеты, которые можно интегрировать с инструментами непрерывной интеграции и другими системами, использующими JUnit-совместимые форматы.

Чтобы сгенерировать отчет в формате TAP, выполните следующие действия:

```sh
node --test --test-reporter tap
```

```sh title="Output"
TAP version 13
# Subtest: formatFileSize function
    # Subtest: should return "1.00 GB" for sizeBytes = 1073741824
    ok 1 - should return "1.00 GB" for sizeBytes = 1073741824
      ---
      duration_ms: 0.66647
      ...
    1..1
ok 1 - formatFileSize function
  ---
  duration_ms: 4.305755
  type: 'suite'
  ...
1..1
# tests 1
# suites 1
# pass 1
# fail 0
# cancelled 0
# skipped 0
# todo 0
```

Для отчета в формате `Spec` используйте:

```sh
node --test --test-reporter spec
```

Вы также можете направить вывод этих отчетов в файл, что особенно полезно для архивации или интеграции с другими инструментами. Например, чтобы сохранить отчет TAP в файл:

```sh
node --test --test-reporter tap --test-reporter-destination report.txt
```

Эта команда генерирует файл `report.txt`, содержащий отчет в формате TAP.

## Шаг 11 - Написание базового теста для сервера

В этом разделе мы покажем, как написать базовый тест для сервера Node.js. Здесь мы будем использовать [Fastify](https://fastify.dev/docs/latest/Guides/Getting-Started/), но этот подход может быть адаптирован и для других подобных веб-фреймворков.

Сначала добавьте Fastify в свой проект с помощью npm:

```sh
npm install fastify
```

Далее настройте базовый сервер Fastify в корне проекта:

```js title="app.js"
import Fastify from 'fastify';

function buildFastify() {
    const fastify = Fastify();

    fastify.get('/', function (request, reply) {
        reply.send({ hello: 'world' });
    });

    return fastify;
}

export default buildFastify;
```

Приведенный выше код определяет один маршрут, который возвращает объект JSON при посещении. Теперь давайте напишем тесты, чтобы убедиться, что наше приложение Fastify ведет себя так, как ожидается:

```js title="tests/app.test.js"
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import buildApp from '../app.js';

describe('GET /', () => {
    let app;

    before(async () => {
        app = await buildApp();
    });

    after(async () => {
        await app.close();
    });

    it('returns status 200', async () => {
        const response = await app.inject({
            url: '/',
        });
        assert.deepStrictEqual(response.statusCode, 200);
        assert.strictEqual(
            response.headers['content-type'],
            'application/json; charset=utf-8'
        );
        assert.deepEqual(JSON.parse(response.payload), {
            hello: 'world',
        });
    });
});
```

В нашей тестовой схеме хук `before` инициализирует приложение Fastify, чтобы убедиться, что оно готово к тестированию, а хук `after` закрывает сервер, чтобы освободить ресурсы.

Блок `it` оценивает ответ приложения, проверяя наличие кода состояния 200, правильного типа содержимого и ожидаемого вывода JSON, тем самым гарантируя, что каждый тест проводится в оптимальных условиях для получения точных результатов.

Выполните тест сервера с помощью программы запуска тестов Node:

```sh
node --test tests/app.test.js
```

---

```sh title="Output"
▶ GET /
  ✔ returns status 200 (10.716153ms)
▶ GET / (25.512059ms)

. . .
```

Эта настройка тестирования обеспечивает надежный способ убедиться, что ваши приложения Fastify работают правильно в контролируемой среде с помощью тестового раннера Node.

## Заключительные мысли

В этой статье представлено подробное руководство по использованию раннера тестирования Node.js для создания и выполнения тестов. В ней освещены такие функции, как мокинг, анализ покрытия кода и генерация отчетов, которые необходимы для оценки эффективности тестов.

Для получения дополнительной информации посетите [страницу документации](https://nodejs.org/api/test.html). Если вам интересно узнать, как Node.js test runner сравнивается с другими фреймворками для тестирования, ознакомьтесь с нашим [руководством по сравнению](https://betterstack.com/community/guides/testing/best-node-testing-libraries/).

<small>Источник &mdash; <https://betterstack.com/community/guides/testing/nodejs-test-runner/></small>
