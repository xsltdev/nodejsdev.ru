---
title: Test runner
description: Модуль test облегчает создание тестов JavaScript
---

# Test runner

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/test.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль `node:test` облегчает создание тестов JavaScript. Чтобы получить к нему доступ:

```mjs
import test from 'node:test';
```

```cjs
const test = require('node:test');
```

Этот модуль доступен только в схеме `node:`. Следующие варианты не будут работать:

```mjs
import test from 'test';
```

```cjs
const test = require('test');
```

Тесты, созданные с помощью модуля `test`, состоят из одной функции, которая обрабатывается одним из трех способов:

1.  Синхронная функция, которая считается неудачной, если выбрасывает исключение, и считается пройденной в противном случае.
2.  Функция, возвращающая `Promise`, которая считается неудачной, если `Promise` отклоняется, и считается пройденной, если `Promise` разрешается.
3.  Функция, которая получает функцию обратного вызова. Если обратный вызов принимает в качестве первого аргумента любое истинностное значение, тест считается проваленным. Если в качестве первого аргумента обратному вызову передается ложное значение, тест считается пройденным. Если тестовая функция получает функцию обратного вызова, а также возвращает `Promise`, тест будет провален.

Следующий пример иллюстрирует написание тестов с использованием модуля `test`.

```js
test('synchronous passing test', (t) => {
    // Этот тест проходит, потому что он не выбрасывает исключение.
    assert.strictEqual(1, 1);
});

test('synchronous failing test', (t) => {
    // Этот тест не проходит, потому что выбрасывает исключение.
    assert.strictEqual(1, 2);
});

test('асинхронный тест на прохождение', async (t) => {
    // Этот тест проходит, потому что Promise, возвращаемый асинхронной функцией.
    // функция не отвергается.
    assert.strictEqual(1, 1);
});

test('asynchronous failing test', async (t) => {
    // Этот тест не проходит, потому что Promise, возвращаемый асинхронной функцией.
    // функция отклоняется.
    assert.strictEqual(1, 2);
});

test('неудачный тест с использованием обещаний', (t) => {
    // Обещания можно использовать и напрямую.
    return new Promise((resolve, reject) => {
        setImmediate(() => {
            reject(
                new Error('это приведет к неудаче теста')
            );
        });
    });
});

test('callback passing test', (t, done) => {
    // done() - это функция обратного вызова. Когда выполняется setImmediate(), она вызывает функцию
    // done() без аргументов.
    setImmediate(done);
});

test('callback failing test', (t, done) => {
    // Когда выполняется setImmediate(), done() вызывается с объектом Error и
    // тест проваливается.
    setImmediate(() => {
        done(new Error('callback failure'));
    });
});
```

Если ни один тест не прошел, код завершения процесса устанавливается на `1`.

## Подтесты

Метод `test()` контекста тестирования позволяет создавать подтесты. Этот метод ведет себя идентично функции верхнего уровня `test()`. Следующий пример демонстрирует создание теста верхнего уровня с двумя подтестами.

```js
test('тест верхнего уровня', async (t) => {
    await t.test('подтест 1', (t) => {
        assert.strictEqual(1, 1);
    });

    await t.test('субтест 2', (t) => {
        assert.strictEqual(2, 2);
    });
});
```

В этом примере `await` используется для того, чтобы убедиться, что оба подтеста завершены. Это необходимо, потому что родительские тесты не ждут завершения своих подтестов. Любые подтесты, которые все еще не завершены, когда родительский тест завершает свою работу, отменяются и рассматриваются как неудачи. Любые сбои в подтестах приводят к сбою родительского теста.

## Пропуск тестов

Отдельные тесты можно пропустить, передав тесту опцию `skip` или вызвав метод `skip()` контекста теста, как показано в следующем примере.

```js
// Опция пропуска используется, но сообщение не выдается.
test('skip option', { skip: true }, (t) => {
    // Этот код никогда не выполняется.
});

// Опция пропуска используется, и выдается сообщение.
test(
    'skip option with message',
    { skip: 'это пропущено' },
    (t) => {
        // Этот код никогда не выполняется.
    }
);

test('метод skip()', (t) => {
    // Обязательно вернитесь сюда, если тест содержит дополнительную логику.
    t.skip();
});

test('пропустить() метод с сообщением', (t) => {
    // Обязательно вернитесь сюда, если тест содержит дополнительную логику.
    t.skip('это пропущено');
});
```

## синтаксис `describe`/`it`

Запуск тестов также может быть выполнен с помощью `describe` для объявления набора и `it` для объявления теста. Набор используется для организации и группировки связанных между собой тестов. `it` - это сокращение для [`test()`](#testname-options-fn).

```js
describe('вещь', () => {
    it('должно работать', () => {
        assert.strictEqual(1, 1);
    });

    description('Все должно быть хорошо', () => {
        assert.strictEqual(2, 2);
    });

    describe('вложенная вещь', () => {
        it('должно работать', () => {
            assert.strictEqual(3, 3);
        });
    });
});
```

`describe` и `it` импортированы из модуля `node:test`.

```mjs
import { describe, it } from 'node:test';
```

```cjs
const { describe, it } = require('node:test');
```

## `only` тесты

Если Node.js запущен с опцией командной строки [`--test-only`](cli.md#--test-only), можно пропустить все тесты верхнего уровня, кроме выбранного подмножества, передав опцию `only` тестам, которые должны быть запущены. При запуске теста с опцией `only` запускаются и все подтесты. Метод `runOnly()` контекста теста может быть использован для реализации такого же поведения на уровне подтестов.

```js
// Предположим, что Node.js запускается с опцией командной строки --test-only.
// Опция 'only' установлена, поэтому этот тест будет запущен.
test('этот тест запущен', { only: true }, async (t) => {
    // Внутри этого теста по умолчанию запускаются все подтесты.
    await t.test('запуск подтеста');

    // Контекст теста может быть обновлен для запуска подтестов с опцией 'only'.
    t.runOnly(true);
    await t.test('этот подтест теперь пропущен');
    await t.test('этот подтест запущен', { only: true });

    // Переключите контекст обратно, чтобы выполнить все тесты.
    t.runOnly(false);
    await t.test('этот подтест запущен');

    // Явно не запускать эти тесты.
    await t.test('пропущен подтест 3', { only: false });
    await t.test('пропущен подтест 4', { skip: true });
});

// Опция 'only' не установлена, поэтому этот тест пропускается.
test('этот тест не выполняется', () => {
    // Этот код не выполняется.
    throw new Error('fail');
});
```

## Фильтрация тестов по имени

Опция командной строки [`--test-name-pattern`](cli.md#--test-name-pattern) может быть использована для запуска только тех тестов, название которых соответствует заданному шаблону. Шаблоны имен тестов интерпретируются как регулярные выражения JavaScript. Опция `--test-name-pattern` может быть указана несколько раз для запуска вложенных тестов. Для каждого выполняемого теста также выполняются соответствующие крючки теста, такие как `beforeEach()`.

Учитывая следующий файл тестов, запуск Node.js с опцией `--test-name-pattern="test [1-3]"` заставит программу запуска тестов выполнить `тест 1`, `тест 2` и `тест 3`. Если `тест 1` не соответствует шаблону имени теста, то его подтесты не будут выполняться, несмотря на соответствие шаблону. Один и тот же набор тестов можно выполнить, передав `--test-name-pattern` несколько раз (например, `--test-name-pattern="test 1"`, `--test-name-pattern="test 2"` и т.д.).

```js
test('test 1', async (t) => {
    await t.test('test 2');
    await t.test('test 3');
});

test('Тест 4', async (t) => {
    await t.test('Тест 5');
    await t.test('Тест 6');
});
```

Шаблоны имен тестов также могут быть заданы с помощью литералов регулярных выражений. Это позволяет использовать флаги регулярных выражений. В предыдущем примере запуск Node.js с `--test-name-pattern="/test [4-5]/i"` будет соответствовать `Test 4` и `Test 5`, поскольку шаблон не чувствителен к регистру.

Шаблоны имен тестов не изменяют набор файлов, выполняемых программой запуска тестов.

## Посторонняя асинхронная активность

Как только функция тестирования завершает выполнение, результаты сообщаются как можно быстрее, сохраняя порядок выполнения тестов. Однако возможно, что тестовая функция генерирует асинхронную активность, превышающую время выполнения самого теста. Программа запуска тестов обрабатывает этот тип активности, но не задерживает отчет о результатах тестирования, чтобы учесть его.

В следующем примере тест завершается с двумя операциями `setImmediate()`, которые еще не выполнены. Первая операция `setImmediate()` пытается создать новый подтест. Поскольку родительский тест уже завершен и вывел свои результаты, новый подтест немедленно помечается как неудачный и позже сообщается в {TestsStream}.

Вторая `setImmediate()` создает событие `uncaughtException`. События `uncaughtException` и `unhandledRejection`, исходящие от завершенного теста, помечаются модулем `test` как неудачные и сообщаются {TestsStream} как диагностические предупреждения на верхнем уровне.

```js
test('тест, создающий асинхронную активность', (t) => {
    setImmediate(() => {
        t.test(
            'подтест, который создается слишком поздно',
            (t) => {
                throw new Error('error1');
            }
        );
    });

    setImmediate(() => {
        throw new Error('error2');
    });

    // Тест завершается после этой строки.
});
```

## Режим наблюдения.

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

Программа для запуска тестов Node.js поддерживает работу в сторожевом режиме, передавая флаг `--watch`:

```bash
node --test --watch
```

В режиме `watch` бегунок будет следить за изменениями в тестовых файлах и их зависимостях. При обнаружении изменений программа запуска тестов повторно запустит тесты, затронутые изменениями. Выполнение теста будет продолжаться до тех пор, пока процесс не будет завершен.

## Запуск тестов из командной строки

Программа запуска тестов Node.js может быть вызвана из командной строки с помощью флага [`--test`](cli.md#--test):

```bash
node --test
```

По умолчанию Node.js будет рекурсивно искать в текущем каталоге исходные файлы JavaScript, соответствующие определенному соглашению об именовании. Найденные файлы выполняются как тестовые. Более подробную информацию об ожидаемом соглашении об именовании и поведении тестовых файлов можно найти в разделе [модель выполнения тестового бегуна](#test-runner-execution-model).

В качестве альтернативы можно указать один или несколько путей в качестве последнего аргумента команды Node.js, как показано ниже.

```bash
node --test test1.js test2.mjs custom_test_dir/
```

В этом примере программа запуска тестов выполнит файлы `test1.js` и `test2.mjs`. Бегущий тест также будет рекурсивно искать в каталоге `custom_test_dir/` файлы тестов для выполнения.

### Модель выполнения программы запуска тестов

При поиске тестовых файлов для выполнения бегунок тестирования ведет себя следующим образом:

-   Выполняются любые файлы, явно указанные пользователем.
-   Если пользователь явно не указал пути, то в текущем рабочем каталоге производится рекурсивный поиск файлов, как указано в следующих шагах.
-   Каталоги `node_modules` пропускаются, если только пользователь не указал их явно.
-   Если встречается каталог с именем `test`, программа запуска тестов будет рекурсивно искать в нем все файлы `.js`, `.cjs` и `.mjs`. Все эти файлы рассматриваются как тестовые, и им не обязательно соответствовать определенному соглашению об именовании, описанному ниже. Это сделано для удобства проектов, которые размещают все свои тесты в одном каталоге `test`.
-   Во всех остальных каталогах файлы `.js`, `.cjs` и `.mjs`, соответствующие следующим шаблонам, рассматриваются как тестовые файлы:
    -   `^test$` - Файлы, чьим основным именем является строка `'test'`. Примеры: `test.js`, `test.cjs`, `test.mjs`.
    -   `^test-.+` - Файлы, основное имя которых начинается со строки `'test-'`, за которой следует один или несколько символов. Примеры: `test-example.js`, `test-another-example.mjs`.
    -   `.+[\.\-\_]test$` - Файлы, основное имя которых заканчивается на `.test`, `-test` или `_test`, перед которым следует один или несколько символов. Примеры: `example.test.js`, `example-test.cjs`, `example_test.mjs`.
    -   Другие типы файлов, понимаемые Node.js, такие как `.node` и `.json`, не выполняются автоматически программой запуска тестов, но поддерживаются, если явно указаны в командной строке.

Каждый соответствующий файл теста выполняется в отдельном дочернем процессе. Если дочерний процесс завершается с кодом выхода 0, тест считается пройденным. В противном случае тест считается проваленным. Файлы тестов должны быть исполняемыми Node.js, но не обязаны использовать внутренний модуль `node:test`.

## Сбор покрытия кода

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

Когда Node.js запускается с флагом командной строки [`--experimental-test-coverage`](cli.md#--experimental-test-coverage), после завершения всех тестов происходит сбор покрытия кода и выдается статистика. Если переменная окружения [`NODE_V8_COVERAGE`](cli.md#node_v8_coveragedir) используется для указания каталога покрытия кода, сгенерированные файлы покрытия V8 записываются в этот каталог. Модули ядра Node.js и файлы в каталогах `node_modules/` не включаются в отчет о покрытии. Если покрытие включено, отчет о покрытии отправляется всем [test reporters](#test-reporters) через событие `'test:coverage'`.

Покрытие можно отключить в серии строк, используя следующий синтаксис комментария:

```js
/* node:coverage disable */
if (anAlwaysFalseCondition) {
    // Код в этой ветке никогда не будет выполнен, но строки игнорируются для
    // целей покрытия. Все строки, следующие за комментарием 'disable', игнорируются.
    // пока не встретится соответствующий комментарий 'enable'.
    console.log('this is never executed');
}
/* node:coverage enable */
```

Покрытие также может быть отключено на определенное количество строк. По истечении указанного количества строк покрытие будет автоматически включено снова. Если количество строк не указано явно, одна строка игнорируется.

```js
/* node:coverage ignore next */
if (anAlwaysFalseCondition) {
    console.log('this is never executed');
}

/* node:coverage ignore next 3 */
if (anAlwaysFalseCondition) {
    console.log('this is never executed');
}
```

Функциональность покрытия кода в бегуне тестирования имеет следующие ограничения, которые будут устранены в будущем выпуске Node.js:

-   Хотя данные о покрытии собираются для дочерних процессов, эта информация не включается в отчет о покрытии. Поскольку бегунок тестирования командной строки использует дочерние процессы для выполнения тестовых файлов, его нельзя использовать с `--experimental-test-coverage`.
-   Карты исходных текстов не поддерживаются.
-   Исключение определенных файлов или каталогов из отчета о покрытии не поддерживается.

## Mocking

Модуль `node:test` поддерживает подражание во время тестирования с помощью объекта верхнего уровня `mock`. В следующем примере создается шпион для функции, которая складывает два числа. Затем шпион используется для подтверждения того, что функция была вызвана так, как ожидалось.

```mjs
import assert from 'node:assert';
import { mock, test } from 'node:test';

test('шпионит за функцией', () => {
    const sum = mock.fn((a, b) => {
        return a + b;
    });

    assert.strictEqual(sum.mock.calls.length, 0);
    assert.strictEqual(sum(3, 4), 7);
    assert.strictEqual(sum.mock.calls.length, 1);

    const call = sum.mock.calls[0];
    assert.deepStrictEqual(call.arguments, [3, 4]);
    assert.strictEqual(call.result, 7);
    assert.strictEqual(call.error, undefined);

    // Сбросьте глобально отслеживаемые макеты.
    mock.reset();
});
```

```cjs
'use strict';
const assert = require('node:assert');
const { mock, test } = require('node:test');

test('шпионит за функцией', () => {
    const sum = mock.fn((a, b) => {
        return a + b;
    });

    assert.strictEqual(sum.mock.calls.length, 0);
    assert.strictEqual(sum(3, 4), 7);
    assert.strictEqual(sum.mock.calls.length, 1);

    const call = sum.mock.calls[0];
    assert.deepStrictEqual(call.arguments, [3, 4]);
    assert.strictEqual(call.result, 7);
    assert.strictEqual(call.error, undefined);

    // Сбросьте глобально отслеживаемые макеты.
    mock.reset();
});
```

Та же самая функциональность мокинга также раскрывается на объекте [`TestContext`](#class-testcontext) каждого теста. Следующий пример создает шпиона для метода объекта, используя API, открытое для `TestContext`. Преимущество мокинга через контекст теста заключается в том, что программа запуска тестов автоматически восстановит всю мокированную функциональность после завершения теста.

```js
test('шпионит за методом объекта', (t) => {
    const number = {
        значение: 5,
        add(a) {
            return this.value + a;
        },
    };

    t.mock.method(number, 'add');
    assert.strictEqual(number.add.mock.calls.length, 0);
    assert.strictEqual(number.add(3), 8);
    assert.strictEqual(number.add.mock.calls.length, 1);

    const call = number.add.mock.calls[0];

    assert.deepStrictEqual(call.arguments, [3]);
    assert.strictEqual(call.result, 8);
    assert.strictEqual(call.target, undefined);
    assert.strictEqual(call.this, number);
});
```

## Репортеры тестов

Модуль `node:test` поддерживает передачу флагов [`--test-reporter`](cli.md#--test-reporter) для того, чтобы программа запуска тестов использовала определенный репортер.

Поддерживаются следующие встроенные репортеры:

-   `tap` Репортер `tap` выводит результаты тестирования в формате [TAP](https://testanything.org/).

-   `spec` Репортер `spec` выводит результаты тестирования в человекочитаемом формате.

-   `dot` Отчетчик `dot` выводит результаты тестирования в компактном формате, где каждый пройденный тест представлен символом `.`, а каждый проваленный тест представлен символом `X`.

Если `stdout` является [TTY](tty.md), по умолчанию используется репортер `spec`. В противном случае по умолчанию используется репортер `tap`.

Точный вывод этих репортеров может меняться между версиями Node.js, и на него не следует полагаться программно. Если требуется программный доступ к выводам программы запуска тестов, используйте события, испускаемые {TestsStream}.

### Пользовательские репортеры

[`--test-reporter`](cli.md#--test-reporter) можно использовать для указания пути к пользовательскому репортеру. Пользовательский репортер - это модуль, который экспортирует значение, принимаемое [stream.compose](stream.md#streamcomposestreams). Репортеры должны преобразовывать события, испускаемые {TestsStream}.

Пример пользовательского репортера, использующего {stream.Transform}:

```mjs
import { Transform } from 'node:stream';

const customReporter = new Transform({
    writableObjectMode: true,
    transform(event, encoding, callback) {
        switch (event.type) {
            case 'test:start':
                callback(
                    null,
                    `test ${event.data.name} started`
                );
                break;
            case 'test:pass':
                callback(
                    null,
                    `тест ${event.data.name} прошел`
                );
                break;
            case 'test:fail':
                callback(
                    null,
                    `test ${event.data.name} failed`
                );
                break;
            case 'test:plan':
                callback(null, 'test plan');
                break;
            case 'test:diagnostic':
                callback(null, event.data.message);
                break;
            case 'test:coverage': {
                const {
                    totalLineCount,
                } = event.data.summary.totals;
                callback(
                    null,
                    `total line count: ${totalLineCount}\n`
                );
                break;
            }
        }
    },
});

export default customReporter;
```

```cjs
const { Transform } = require('node:stream');

const customReporter = new Transform({
    writableObjectMode: true,
    transform(event, encoding, callback) {
        switch (event.type) {
            case 'test:start':
                callback(
                    null,
                    `test ${event.data.name} started`
                );
                break;
            case 'test:pass':
                callback(
                    null,
                    `тест ${event.data.name} прошел`
                );
                break;
            case 'test:fail':
                callback(
                    null,
                    `test ${event.data.name} failed`
                );
                break;
            case 'test:plan':
                callback(null, 'test plan');
                break;
            case 'test:diagnostic':
                callback(null, event.data.message);
                break;
            case 'test:coverage': {
                const {
                    totalLineCount,
                } = event.data.summary.totals;
                callback(
                    null,
                    `total line count: ${totalLineCount}\n`
                );
                break;
            }
        }
    },
});

module.exports = customReporter;
```

Пример пользовательского репортера с использованием функции-генератора:

```mjs
export default async function* customReporter(source) {
    for await (const event of source) {
        switch (event.type) {
            case 'test:start':
                yield `test ${event.data.name} started\n`;
                break;
            case 'test:pass':
                yield `test ${event.data.name} passed\n`;
                break;
            case 'test:fail':
                yield `test ${event.data.name} failed\n`;
                break;
            case 'test:plan':
                yield 'test plan';
                break;
            case 'test:diagnostic':
                yield `${event.data.message}\n`;
                break;
            case 'test:coverage': {
                const {
                    totalLineCount,
                } = event.data.summary.totals;
                yield `total line count: ${totalLineCount}\n`;
                break;
            }
        }
    }
}
```

```cjs
module.exports = async function* customReporter(source) {
    for await (const event of source) {
        switch (event.type) {
            case 'test:start':
                yield `test ${event.data.name} started\n`;
                break;
            case 'test:pass':
                yield `test ${event.data.name} passed\n`;
                break;
            case 'test:fail':
                yield `test ${event.data.name} failed\n`;
                break;
            case 'test:plan':
                yield 'test plan\n';
                break;
            case 'test:diagnostic':
                yield `${event.data.message}\n`;
                break;
            case 'test:coverage': {
                const {
                    totalLineCount,
                } = event.data.summary.totals;
                yield `total line count: ${totalLineCount}\n`;
                break;
            }
        }
    }
};
```

Значение, передаваемое `--test-reporter`, должно быть строкой, подобной той, что используется в `import()` в коде JavaScript, или значением, предоставленным для [`--import`](cli.md#--importmodule).

### Множественные репортеры

Флаг [`--test-reporter`](cli.md#--test-reporter) может быть указан несколько раз, чтобы сообщать результаты тестирования в нескольких форматах. В этой ситуации необходимо указать место назначения для каждого репортера с помощью [`--test-reporter-destination`](cli.md#--test-reporter-destination). Место назначения может быть `stdout`, `stderr` или путь к файлу. Репортеры и пункты назначения объединяются в пары в соответствии с порядком, в котором они были указаны.

В следующем примере репортер `spec` выводит данные в `stdout`, а репортер `dot` - в `file.txt`:

```bash
node --test-reporter=spec --test-reporter=dot --test-reporter-destination=stdout --test-reporter-destination=file.txt
```

Если указан только один репортер, то по умолчанию местом назначения будет `stdout`, если место назначения не указано явно.

## `run([options])`

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для запуска тестов. Поддерживаются следующие свойства:
    -   `concurrency` {number|boolean} Если указано число, то такое количество файлов будет запускаться параллельно. Если `true`, то параллельно будет запускаться `os.availableParallelism() - 1` тестовых файлов. Если `false`, то будет выполняться только один тестовый файл за раз. **По умолчанию:** `false`.
    -   `files`: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив, содержащий список файлов для запуска. **По умолчанию** соответствующие файлы из [модели выполнения тестового бегуна](#test-runner-execution-model).
    -   `setup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, которая принимает экземпляр `TestsStream` и может быть использована для настройки слушателей перед запуском любых тестов. **По умолчанию:** `undefined`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать текущее выполнение теста.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, через которое выполнение теста завершится неудачей. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.
    -   `inspectPort` {number|Function} Устанавливает порт инспектора дочернего процесса теста. Это может быть число или функция, которая не принимает аргументов и возвращает число. Если указано значение nullish, каждый процесс получает свой собственный порт, увеличивающийся от `process.debugPort` первичного процесса. **По умолчанию:** `undefined`.
-   Возвращает: {TestsStream}

```js
run({ files: [path.resolve('./tests/test.js')] }).pipe(
    process.stdout
);
```

## `test([name][, options][, fn])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста, которое отображается при выводе результатов тестирования. **По умолчанию:** Свойство `name` из `fn`, или `'<anonymous>'`, если `fn` не имеет имени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации теста. Поддерживаются следующие свойства:
    -   `concurrency` {number|boolean} Если указано число, то такое количество тестов будет выполняться параллельно. Если `true`, то параллельно будет выполняться `os.availableParallelism() - 1` тестов. Для подтестов это будет `бесконечность` тестов параллельно. Если `false`, то будет выполняться только один тест за раз. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `false`.
    -   `only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если значение истинно, и тестовый контекст настроен на выполнение `только` тестов, то этот тест будет выполнен. В противном случае тест будет пропущен. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать проходящий тест.
    -   `skip` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если значение истинно, тест будет пропущен. Если указана строка, эта строка отображается в результатах теста как причина пропуска теста. **По умолчанию:** `false`.
    -   `todo` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если истина, тест помечается как `TODO`. Если указана строка, то эта строка отображается в результатах теста как причина, по которой тест помечен как `TODO`. **По умолчанию:** `false`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, через которое тест завершится неудачей. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.
-   `fn` {Function|AsyncFunction} Тестируемая функция. Первым аргументом этой функции является объект [`TestContext`](#class-testcontext). Если тест использует обратные вызовы, то функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Функция, не вызывающая обратного вызова.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). Возвращается с `undefined` после завершения теста или сразу, если тест выполняется в рамках [`describe()`](#describename-options-fn).

Функция `test()` - это значение, импортируемое из модуля `test`. Каждый вызов этой функции приводит к сообщению о тесте в {TestsStream}.

Объект `TestContext`, переданный в аргументе `fn`, может быть использован для выполнения действий, связанных с текущим тестом. Примеры включают пропуск теста, добавление дополнительной диагностической информации или создание подтестов.

`test()` возвращает `Promise`, который разрешается после завершения теста. если `test()` вызывается внутри блока `describe()`, он разрешается немедленно. Возвращаемое значение обычно можно отбросить для тестов верхнего уровня. Однако возвращаемое значение из подтестов следует использовать, чтобы предотвратить завершение родительского теста первым и отмену подтеста, как показано в следующем примере.

```js
test('top level test', async (t) => {
    // SetTimeout() в следующем подтесте приведет к тому, что он опередит родительский тест.
    // родительский тест, если убрать 'await' в следующей строке. Как только родительский тест
    // завершится, он отменит все оставшиеся подтесты.
    await t.test(
        'дольше выполняющийся подтест',
        async (t) => {
            return new Promise((resolve, reject) => {
                setTimeout(resolve, 1000);
            });
        }
    );
});
```

Опция `timeout` может быть использована для отмены теста, если для его завершения требуется больше, чем `timeout` миллисекунд. Однако это ненадежный механизм отмены тестов, поскольку запущенный тест может заблокировать поток приложения и тем самым предотвратить запланированную отмену.

## `describe([name][, options][, fn])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя набора, которое отображается при выдаче результатов тестирования. **По умолчанию:** Свойство `name` из `fn`, или `'<anonymous>'`, если `fn` не имеет имени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для набора. Поддерживает те же параметры, что и `test([name][, options][, fn])`.
-   `fn` {Function|AsyncFunction} Функция под набором, объявляющая все подтесты и поднаборы. Первым аргументом этой функции является объект [`SuiteContext`](#class-suitecontext). **По умолчанию:** Безоперационная функция.
-   Возвращает: `undefined`.

Функция `describe()`, импортированная из модуля `node:test`. Каждый вызов этой функции приводит к созданию субтеста. После вызова функций верхнего уровня `describe` будут выполнены все тесты и наборы верхнего уровня.

## `describe.skip([name][, options][, fn])`

Сокращение для пропуска набора, аналогично [`describe([name], { skip: true }[, fn])`](#describename-options-fn).

## `describe.todo([name][, options][, fn])`

Сокращение для пометки набора как `TODO`, аналогично [`describe([name], { todo: true }[, fn])`](#describename-options-fn).

## `describe.only([name][, options][, fn])`

Сокращение для обозначения набора как `only`, аналогично [`describe([name], { only: true }[, fn])`](#describename-options-fn).

## `it([name][, options][, fn])`

Сокращение для [`test()`](#testname-options-fn).

Функция `it()` импортируется из модуля `node:test`.

## `it.skip([name][, options][, fn])`

Сокращение для пропуска теста, такое же, как [`it([name], { skip: true }[, fn])`](#testname-options-fn).

## `it.todo([name][, options][, fn])`

Сокращение для пометки теста как `TODO`, аналогично [`it([name], { todo: true }[, fn])`](#testname-options-fn).

## `it.only([name][, options][, fn])`

Сокращение для пометки теста как `only`, аналогично [`it([name], { only: true }[, fn])`](#testname-options-fn).

## `before([fn][, options])`

-   `fn` {Function|AsyncFunction} Функция хука. Если хук использует обратные вызовы, функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для крючка. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, запускаемого перед запуском набора.

```js
describe('tests', async () => {
    before(() =>
        console.log('собирается запустить какой-то тест')
    );
    it('is a subtest', () => {
        assert.ok(
            'некоторое релевантное утверждение здесь'
        );
    });
});
```

## `after([fn][, options])`

-   `fn` {Function|AsyncFunction} Функция хука. Если хук использует обратные вызовы, функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для крючка. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, запускаемого после выполнения набора.

```js
describe('tests', async () => {
    after(() => console.log('закончен запуск тестов'));
    it('is a subtest', () => {
        assert.ok(
            'некоторое релевантное утверждение здесь'
        );
    });
});
```

## `beforeEach([fn][, options])`

-   `fn` {Function|AsyncFunction} Функция хука. Если хук использует обратные вызовы, функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для крючка. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, запускаемого перед каждым подтестом текущего набора.

```js
describe('tests', async () => {
    beforeEach(() =>
        console.log('собирается запустить тест')
    );
    it('is a subtest', () => {
        assert.ok(
            'некоторое релевантное утверждение здесь'
        );
    });
});
```

## `afterEach([fn][, options])`

-   `fn` {Function|AsyncFunction} Функция хука. Если хук использует обратные вызовы, функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для крючка. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, запускаемого после каждого подтеста текущего теста.

```js
describe('tests', async () => {
    afterEach(() =>
        console.log('закончено выполнение теста')
    );
    it('is a subtest', () => {
        assert.ok(
            'некоторое релевантное утверждение здесь'
        );
    });
});
```

## Класс: `MockFunctionContext`.

Класс `MockFunctionContext` используется для проверки или манипулирования поведением макетов, созданных с помощью API [`MockTracker`](#class-mocktracker).

### `ctx.calls`

-   [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Геттер, возвращающий копию внутреннего массива, используемого для отслеживания вызовов имитатора. Каждая запись в массиве представляет собой объект со следующими свойствами.

-   `arguments` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив аргументов, переданных в функцию mock.
-   `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Если имитируемая функция бросила, то это свойство содержит значение брошенной функции. **По умолчанию:** `undefined`.
-   `result` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение, возвращаемое имитируемой функцией.
-   `stack` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект `Error`, стек которого может быть использован для определения места вызова осмеиваемой функции.
-   `target` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<undefined>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Undefined_type) Если высмеиваемая функция является конструктором, то это поле содержит конструируемый класс. В противном случае это будет `undefined`.
-   `this` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение `this` высмеиваемой функции.

### `ctx.callCount()`

-   Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество раз, когда этот имитатор был вызван.

Эта функция возвращает количество раз, когда этот имитатор был вызван. Эта функция более эффективна, чем проверка `ctx.calls.length`, поскольку `ctx.calls` - это геттер, который создает копию внутреннего массива отслеживания вызовов.

### `ctx.mockImplementation(implementation)`

-   `implementation` {Function|AsyncFunction} Функция, которая будет использоваться в качестве новой реализации имитатора.

Эта функция используется для изменения поведения существующего макета.

Следующий пример создает функцию-макет с помощью `t.mock.fn()`, вызывает функцию-макет, а затем изменяет реализацию макета на другую функцию.

```js
test('изменяет поведение mock', (t) => {
    let cnt = 0;

    function addOne() {
        cnt++;
        return cnt;
    }

    function addTwo() {
        cnt += 2;
        return cnt;
    }

    const fn = t.mock.fn(addOne);

    assert.strictEqual(fn(), 1);
    fn.mock.mockImplementation(addTwo);
    assert.strictEqual(fn(), 3);
    assert.strictEqual(fn(), 5);
});
```

### `ctx.mockImplementationOnce(implementation[, onCall])`

-   `implementation` {Function|AsyncFunction} Функция, которая будет использоваться в качестве реализации макета для номера вызова, указанного в `onCall`.
-   `onCall` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер вызова, для которого будет использоваться `implementation`. Если указанный вызов уже произошел, то будет выброшено исключение. **По умолчанию:** Номер следующего вызова.

Эта функция используется для изменения поведения существующего mock для одного вызова. После вызова `onCall` имитатор вернется к тому поведению, которое он использовал бы, если бы не была вызвана `mockImplementationOnce()`.

Следующий пример создает имитатор функции с помощью `t.mock.fn()`, вызывает его, изменяет реализацию имитатора на другую функцию для следующего вызова, а затем возобновляет прежнее поведение.

```js
test('изменяет поведение mock один раз', (t) => {
    let cnt = 0;

    function addOne() {
        cnt++;
        return cnt;
    }

    function addTwo() {
        cnt += 2;
        return cnt;
    }

    const fn = t.mock.fn(addOne);

    assert.strictEqual(fn(), 1);
    fn.mock.mockImplementationOnce(addTwo);
    assert.strictEqual(fn(), 3);
    assert.strictEqual(fn(), 4);
});
```

### `ctx.resetCalls()`

Сбрасывает историю вызовов имитационной функции.

### `ctx.restore()`

Возвращает реализацию функции-макета к ее первоначальному поведению. Макет можно использовать после вызова этой функции.

## Класс: `MockTracker`

Класс `MockTracker` используется для управления функциональностью мокинга. Модуль запуска тестов предоставляет экспорт верхнего уровня `mock`, который является экземпляром `MockTracker`. Каждый тест также предоставляет свой собственный экземпляр `MockTracker` через свойство `mock` контекста теста.

### `mock.fn([original[, implementation]][, options])`

-   `original` {Function|AsyncFunction} Необязательная функция для создания имитатора. **По умолчанию:** Безоперационная функция.
-   `implementation` {Function|AsyncFunction} Необязательная функция, используемая в качестве реализации макета для `оригинала`. Это полезно для создания имитаторов, которые демонстрируют одно поведение в течение определенного количества вызовов, а затем восстанавливают поведение `оригинала`. **По умолчанию:** Функция, указанная `original`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры конфигурации для имитатора функции. Поддерживаются следующие свойства:
    -   `times` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество раз, когда имитатор будет использовать поведение `implementation`. После того, как имитатор будет вызван `times` раз, он автоматически восстановит поведение `original`. Это значение должно быть целым числом больше нуля. **По умолчанию:** `бесконечность`.
-   Возвращает: {Proxy} Имитируемая функция. Подражаемая функция содержит специальное свойство `mock`, которое является экземпляром [`MockFunctionContext`](#class-mockfunctioncontext) и может быть использовано для проверки и изменения поведения подражаемой функции.

Эта функция используется для создания имитируемой функции.

В следующем примере создается имитатор функции, который увеличивает счетчик на единицу при каждом вызове. Опция `times` используется для изменения поведения имитатора таким образом, что первые два вызова добавляют к счетчику два, а не один.

```js
test('mocks a counting function', (t) => {
  пусть cnt = 0;


  function addOne() {
    cnt++;
    return cnt;
  }


  function addTwo() {
    cnt += 2;
    return cnt;
  }


  const fn = t.mock.fn(addOne, addTwo, { times: 2 });


  assert.strictEqual(fn(), 2);
  assert.strictEqual(fn(), 4);
  assert.strictEqual(fn(), 5);
  assert.strictEqual(fn(), 6);
});
```

### `mock.getter(object, methodName[, implementation][, options])`

Эта функция является синтаксическим сахаром для [`MockTracker.method`](#mockmethodobject-methodname-implementation-options) с `options.getter`, установленным в `true`.

### `mock.method(object, methodName[, implementation][, options])`

-   `object` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, метод которого высмеивается.
-   `methodName` {string|symbol} Идентификатор метода на `объекте`, который нужно высмеять. Если `object[methodName]` не является функцией, будет выдана ошибка.
-   `implementation` {Function|AsyncFunction} Необязательная функция, используемая в качестве реализации mock для `object[methodName]`. **По умолчанию:** Оригинальный метод, указанный `object[methodName]`.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры конфигурации для имитатора метода. Поддерживаются следующие свойства:
    -   `getter` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, то `object[methodName]` рассматривается как getter. Этот параметр нельзя использовать с параметром `setter`. **По умолчанию:** false.
    -   `setter` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, то `object[methodName]` рассматривается как setter. Эта опция не может быть использована с опцией `getter`. **По умолчанию:** false.
    -   `times` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество раз, когда имитатор будет использовать поведение `implementation`. После того, как имитируемый метод будет вызван `times` раз, он автоматически восстановит исходное поведение. Это значение должно быть целым числом больше нуля. **По умолчанию:** `бесконечность`.
-   Возвращает: {Proxy} Имитированный метод. Осмеиваемый метод содержит специальное свойство `mock`, которое является экземпляром [`MockFunctionContext`](#class-mockfunctioncontext) и может быть использовано для проверки и изменения поведения осмеиваемого метода.

Эта функция используется для создания имитатора на существующем методе объекта. Следующий пример демонстрирует, как создается имитатор для существующего метода объекта.

```js
test('шпионит за объектным методом', (t) => {
    const number = {
        значение: 5,
        subtract(a) {
            return this.value - a;
        },
    };

    t.mock.method(number, 'subtract');
    assert.strictEqual(
        number.subtract.mock.calls.length,
        0
    );
    assert.strictEqual(number.subtract(3), 2);
    assert.strictEqual(
        number.subtract.mock.calls.length,
        1
    );

    const call = number.subtract.mock.calls[0];

    assert.deepStrictEqual(call.arguments, [3]);
    assert.strictEqual(call.result, 2);
    assert.strictEqual(call.error, undefined);
    assert.strictEqual(call.target, undefined);
    assert.strictEqual(call.this, number);
});
```

### `mock.reset()`

Эта функция восстанавливает поведение по умолчанию всех макетов, которые были ранее созданы этим `MockTracker`, и отсоединяет макеты от экземпляра `MockTracker`. После отсоединения макеты могут быть использованы, но экземпляр `MockTracker` больше не может быть использован для изменения их поведения или иного взаимодействия с ними.

После завершения каждого теста эта функция вызывается на `MockTracker` тестового контекста. Если глобальный `MockTracker` используется очень часто, рекомендуется вызывать эту функцию вручную.

### `mock.restoreAll()`

Эта функция восстанавливает поведение по умолчанию всех макетов, которые были ранее созданы этим `MockTracker`. В отличие от `mock.reset()`, `mock.restoreAll()` не отсоединяет макеты от экземпляра `MockTracker`.

### `mock.setter(object, methodName[, implementation][, options])`

Эта функция является синтаксическим сахаром для [`MockTracker.method`](#mockmethodobject-methodname-implementation-options) с `options.setter`, установленным в `true`.

## Класс: `TestsStream`

-   Расширяет [`<ReadableStream>`](webstreams.md#readablestream)

Успешный вызов метода [`run()`](#runoptions) вернет новый объект {TestsStream}, передающий серию событий, представляющих выполнение тестов. `TestsStream` будет испускать события в порядке определения тестов

### Событие: `'test:coverage'`

-   `данные` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `summary` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, содержащий отчет о покрытии.
        -   `files` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив отчетов о покрытии для отдельных файлов. Каждый отчет представляет собой объект со следующей схемой:
            -   `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный путь к файлу.
            -   `totalLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество строк.
            -   `totalBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество ветвей.
            -   `totalFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество функций.
            -   `coveredLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество покрытых линий.
            -   `coveredBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество покрытых ветвей.
            -   `coveredFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество охваченных функций.
            -   `coveredLinePercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент охваченных линий.
            -   `coveredBranchPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент охваченных ветвей.
            -   `coveredFunctionPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент охваченных функций.
            -   `uncoveredLineNumbers` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив целых чисел, представляющих номера строк, которые не охвачены.
        -   `totals` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, содержащий сводку покрытия для всех файлов.
            -   `totalLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество строк.
            -   `totalBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество ветвей.
            -   `totalFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общее количество функций.
            -   `coveredLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество покрытых линий.
            -   `coveredBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество покрытых ветвей.
            -   `coveredFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество охваченных функций.
            -   `coveredLinePercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент охваченных линий.
            -   `coveredBranchPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент охваченных ветвей.
            -   `coveredFunctionPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент охваченных функций.
        -   `workingDirectory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Рабочий каталог, когда началось покрытие кода. Это полезно для отображения имен относительных путей в случае, если тесты изменили рабочий каталог процесса Node.js.
    -   `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.

Выводится, когда включено покрытие кода и все тесты завершены.

### Событие: `test:diagnostic`

-   `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `file` {string|undefined} Путь к файлу теста, не определен, если тест не запускается через файл.
    -   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Диагностическое сообщение.
    -   `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.

Выдается при вызове [`context.diagnostic`](#contextdiagnosticmessage).

### Событие: `'test:fail'`

-   `данные` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `details` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные метаданные о выполнении.
        -   `duration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Продолжительность теста в миллисекундах.
        -   `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Ошибка, вызванная тестом.
    -   `file` {string|undefined} Путь к файлу теста, не определен, если тест не запускается через файл.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
    -   `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
    -   `testNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порядковый номер теста.
    -   `todo` {string|boolean|undefined} Присутствует, если вызывается [`context.todo`](#contexttodomessage)
    -   `skip` {string|boolean|undefined} Присутствует, если вызывается [`context.skip`](#contextskipmessage).

Выдается при неудачном прохождении теста.

### Событие: `'test:pass'`

-   `данные` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `details` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные метаданные о выполнении.
        -   `duration` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Продолжительность теста в миллисекундах.
    -   `file` {string|undefined} Путь к файлу теста, не определен, если тест не запускается через файл.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
    -   `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
    -   `testNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порядковый номер теста.
    -   `todo` {string|boolean|undefined} Присутствует, если вызывается [`context.todo`](#contexttodomessage)
    -   `skip` {string|boolean|undefined} Присутствует, если вызывается [`context.skip`](#contextskipmessage)

Выдается, когда тест пройден.

### Событие: `'test:plan'`

-   `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `file` {string|undefined} Путь к файлу теста, не определен, если тест не запускается через файл.
    -   `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
    -   `count` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Количество подтестов, которые были выполнены.

Выдается, когда все подтесты завершены для данного теста.

### Событие: `'test:start'`

-   `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `file` {string|undefined} Путь к файлу теста, не определен, если тест не запускается через файл.
    -   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
    -   `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.

Выдается при запуске теста.

## Класс: `TestContext`

Экземпляр `TestContext` передается каждой тестовой функции для взаимодействия с программой запуска тестов. Однако конструктор `TestContext` не является частью API.

### `context.beforeEach([fn][, options])`

-   `fn` {Function|AsyncFunction} Хук-функция. Первым аргументом этой функции является объект [`TestContext`](#class-testcontext). Если хук использует обратные вызовы, то функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для хука. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, запускаемого перед каждым подтестом текущего теста.

```js
test('top level test', async (t) => {
    t.beforeEach((t) =>
        t.diagnostic(`собирается выполнить ${t.name}`)
    );
    await t.test('Это подтест', (t) => {
        assert.ok(
            'некоторое релевантное утверждение здесь'
        );
    });
});
```

### `context.after([fn][, options])`

-   `fn` {Function|AsyncFunction} Хук-функция. Первым аргументом этой функции является объект [`TestContext`](#class-testcontext). Если хук использует обратные вызовы, то функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для хука. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, который запускается после завершения текущего теста.

```js
test('тест верхнего уровня', async (t) => {
    t.after((t) =>
        t.diagnostic(`закончено выполнение ${t.name}`)
    );
    assert.ok('некоторое релевантное утверждение здесь');
});
```

### `context.afterEach([fn][, options])`

-   `fn` {Function|AsyncFunction} Хук-функция. Первым аргументом этой функции является объект [`TestContext`](#class-testcontext). Если хук использует обратные вызовы, то функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Безотзывная функция.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для хука. Поддерживаются следующие свойства:
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, по истечении которых хук будет прерван. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.

Эта функция используется для создания хука, запускаемого после каждого подтеста текущего теста.

```js
test('top level test', async (t) => {
    t.afterEach((t) =>
        t.diagnostic(`закончено выполнение ${t.name}`)
    );
    await t.test('Это подтест', (t) => {
        assert.ok(
            'некоторое релевантное утверждение здесь'
        );
    });
});
```

### `context.diagnostic(message)`

-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сообщение, которое должно быть сообщено.

Эта функция используется для записи диагностики в вывод. Любая диагностическая информация включается в конец результатов теста. Эта функция не возвращает значения.

```js
test('тест верхнего уровня', (t) => {
    t.diagnostic('Диагностическое сообщение');
});
```

### `context.name`

Имя теста.

### `context.runOnly(shouldRunOnlyTests)`

-   `shouldRunOnlyTests` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Следует ли запускать `только` тесты.

Если `shouldRunOnlyTests` истинно, контекст тестирования будет запускать только те тесты, для которых установлена опция `only`. В противном случае запускаются все тесты. Если Node.js не был запущен с опцией командной строки [`--test-only`](cli.md#--test-only), эта функция не работает.

```js
test('top level test', (t) => {
    // Контекст теста может быть настроен на запуск подтестов с помощью опции 'only'.
    t.runOnly(true);
    return Promise.all([
        t.test('этот подтест теперь пропущен'),
        t.test('этот подтест запущен', { only: true }),
    ]);
});
```

### `context.signal`

-   [`<AbortSignal>`](globals.md#abortsignal) Может использоваться для прерывания подзадач теста, когда тест был прерван.

```js
test('тест верхнего уровня', async (t) => {
    await fetch('some/uri', { signal: t.signal });
});
```

### `context.skip([message])`

-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное сообщение о пропуске.

Эта функция заставляет вывод теста указывать на то, что тест пропущен. Если указано `message`, оно включается в вывод. Вызов `skip()` не завершает выполнение тестовой функции. Эта функция не возвращает значения.

```js
test('top level test', (t) => {
    // Не забудьте вернуть значение и здесь, если тест содержит дополнительную логику.
    t.skip('это пропущено');
});
```

### `context.todo([message])`

-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное сообщение `TODO`.

Эта функция добавляет директиву `TODO` в вывод теста. Если указано `message`, оно будет включено в вывод. Вызов `todo()` не завершает выполнение тестовой функции. Эта функция не возвращает значения.

```js
test('top level test', (t) => {
    // Этот тест помечен как `TODO`
    t.todo('this is a todo');
});
```

### `context.test([name][, options][, fn])`

-   `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя подтеста, которое отображается при выдаче результатов тестирования. **По умолчанию:** Свойство `name` из `fn`, или `'<anonymous>'`, если `fn` не имеет имени.
-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации для подтеста. Поддерживаются следующие свойства:
    -   `concurrency` {number|boolean|null} Если указано число, то такое количество тестов будет выполняться параллельно. Если `true`, то все подтесты будут выполняться параллельно. Если `false`, то будет выполняться только один тест за раз. Если не указано, то подтесты наследуют это значение от своего родителя. **По умолчанию:** `null`.
    -   `only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если значение истинно, и тестовый контекст настроен на выполнение `только` тестов, то этот тест будет выполнен. В противном случае тест будет пропущен. **По умолчанию:** `false`.
    -   `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать проходящий тест.
    -   `skip` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если значение истинно, тест будет пропущен. Если указана строка, эта строка отображается в результатах теста как причина пропуска теста. **По умолчанию:** `false`.
    -   `todo` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если истина, тест помечается как `TODO`. Если указана строка, эта строка отображается в результатах теста как причина, по которой тест помечен как `TODO`. **По умолчанию:** `false`.
    -   `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число миллисекунд, через которое тест завершится неудачей. Если не указано, подтесты наследуют это значение от своего родителя. **По умолчанию:** `бесконечность`.
-   `fn` {Function|AsyncFunction} Тестируемая функция. Первым аргументом этой функции является объект [`TestContext`](#class-testcontext). Если тест использует обратные вызовы, то функция обратного вызова передается в качестве второго аргумента. **По умолчанию:** Функция, не вызывающая обратного вызова.
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise). Возвращается с `undefined` после завершения теста.

Эта функция используется для создания подтестов под текущим тестом. Эта функция ведет себя так же, как и функция верхнего уровня [`test()`](#testname-options-fn).

```js
test('тест верхнего уровня', async (t) => {
    await t.test(
        'This is a subtest',
        {
            only: false,
            skip: false,
            concurrency: 1,
            todo: false,
        },
        (t) => {
            assert.ok(
                'некоторое релевантное утверждение здесь'
            );
        }
    );
});
```

## Класс: `SuiteContext`

Экземпляр `SuiteContext` передается каждой функции набора для взаимодействия с программой запуска тестов. Однако конструктор `SuiteContext` не является частью API.

### `context.name`

Имя набора.

### `context.signal`

-   [`<AbortSignal>`](globals.md#abortsignal) Может использоваться для прерывания подзадач теста, когда тест был прерван.
