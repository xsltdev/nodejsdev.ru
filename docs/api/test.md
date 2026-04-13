---
title: Запуск тестов
description: Модуль node:test — встроенный раннер тестов для JavaScript в Node.js
---

# Запуск тестов

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/test.html)

<!--introduced_in=v18.0.0-->

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
changes:
  - version: v20.0.0
    pr-url: https://github.com/nodejs/node/pull/46983
    description: Тестовый раннер теперь стабилен.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0 | Тестовый запуск теперь стабилен. |

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/test.js -->

Модуль `node:test` предназначен для написания и запуска JavaScript-тестов.
Подключение:

=== "MJS"

    ```js
    import test from 'node:test';
    ```

=== "CJS"

    ```js
    const test = require('node:test');
    ```

Модуль доступен только в схеме `node:`.

Тест из модуля `test` — это одна функция, которая обрабатывается одним из трёх
способов:

1. Синхронная функция: провал при выброшенном исключении, успех иначе.
2. Функция, возвращающая `Promise`: провал при отклонении промиса, успех при
   выполнении.
3. Функция с колбэком: провал, если первый аргумент колбэка истинный; успех, если
   первый аргумент ложный. Если функция и принимает колбэк, и возвращает
   `Promise`, тест считается проваленным.

Ниже пример использования модуля `test`.

```js
test('synchronous passing test', (t) => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

test('synchronous failing test', (t) => {
  // This test fails because it throws an exception.
  assert.strictEqual(1, 2);
});

test('asynchronous passing test', async (t) => {
  // This test passes because the Promise returned by the async
  // function is settled and not rejected.
  assert.strictEqual(1, 1);
});

test('asynchronous failing test', async (t) => {
  // This test fails because the Promise returned by the async
  // function is rejected.
  assert.strictEqual(1, 2);
});

test('failing test using Promises', (t) => {
  // Promises can be used directly as well.
  return new Promise((resolve, reject) => {
    setImmediate(() => {
      reject(new Error('this will cause the test to fail'));
    });
  });
});

test('callback passing test', (t, done) => {
  // done() is the callback function. When the setImmediate() runs, it invokes
  // done() with no arguments.
  setImmediate(done);
});

test('callback failing test', (t, done) => {
  // When the setImmediate() runs, done() is invoked with an Error object and
  // the test fails.
  setImmediate(() => {
    done(new Error('callback failure'));
  });
});
```

Если какой-либо тест провален, код выхода процесса устанавливается в `1`.

## Подтесты

Метод `test()` контекста теста позволяет создавать подтесты и выстраивать
иерархию вложенных тестов внутри более крупного. Поведение совпадает с
функцией `test()` верхнего уровня. Ниже — пример верхнего теста с двумя
подтестами.

```js
test('top level test', async (t) => {
  await t.test('subtest 1', (t) => {
    assert.strictEqual(1, 1);
  });

  await t.test('subtest 2', (t) => {
    assert.strictEqual(2, 2);
  });
});
```

> **Примечание:** хуки `beforeEach` и `afterEach` вызываются между запусками
> подтестов.

Здесь `await` гарантирует завершение обоих подтестов: родительский тест сам по
себе не ждёт подтесты (в отличие от тестов внутри suite). Незавершённые подтесты
при завершении родителя отменяются и считаются провалом; провал подтеста ведёт к
провалу родителя.

## Повторный запуск проваленных тестов

Раннер может сохранять состояние прогона в файл и затем перезапускать только
проваленные тесты без полного прогона. Укажите путь к файлу состояния ключом
[`--test-rerun-failures`][`--test-rerun-failures`]; если файла нет, он будет создан.

Файл состояния — JSON с массивом попыток запуска. Каждая попытка — объект,
сопоставляющий успешно прошедшие тесты с номером попытки, на которой они впервые
прошли. Ключ — путь к файлу теста с номером строки и столбца определения теста.
Если один и тот же тест в одной позиции запускается несколько раз (например в
цикле), к ключу добавляется счётчик. Изменение порядка выполнения или места
теста может сбить соответствие; `--test-rerun-failures` имеет смысл при
детерминированном порядке тестов.

Пример файла состояния:

```json
[
  {
    "test.js:10:5": { "passed_on_attempt": 0, "name": "test 1" }
  },
  {
    "test.js:10:5": { "passed_on_attempt": 0, "name": "test 1" },
    "test.js:20:5": { "passed_on_attempt": 1, "name": "test 2" }
  }
]
```

В примере две попытки и два теста в `test.js`: первый прошёл с первой попытки,
второй — со второй.

С опцией `--test-rerun-failures` выполняются только тесты, которые ещё ни разу
не прошли успешно.

```bash
node --test-rerun-failures /path/to/state/file
```

## Псевдонимы `describe()` и `it()`

Наборы и тесты можно оформлять через `describe()` и `it()`: [`describe()`][`describe()`]
это псевдоним [`suite()`][`suite()`], [`it()`][`it()`] — псевдоним [`test()`][`test()`].

```js
describe('A thing', () => {
  it('should work', () => {
    assert.strictEqual(1, 1);
  });

  it('should be ok', () => {
    assert.strictEqual(2, 2);
  });

  describe('a nested thing', () => {
    it('should work', () => {
      assert.strictEqual(3, 3);
    });
  });
});
```

`describe` и `it` импортируются из модуля `node:test`.

=== "MJS"

    ```js
    import { describe, it } from 'node:test';
    ```

=== "CJS"

    ```js
    const { describe, it } = require('node:test');
    ```

## Пропуск тестов

Отдельные тесты можно пропустить, передав опцию `skip` в вызов `test`, либо вызвав
метод контекста `skip()`, как в примере ниже.

```js
// Используется опция skip без сообщения.
test('skip option', { skip: true }, (t) => {
  // Этот код не выполняется.
});

// Используется опция skip с сообщением.
test('skip option with message', { skip: 'this is skipped' }, (t) => {
  // Этот код не выполняется.
});

test('skip() method', (t) => {
  // При необходимости верните управление здесь, если в тесте есть ещё логика.
  t.skip();
});

test('skip() method with message', (t) => {
  // При необходимости верните управление здесь, если в тесте есть ещё логика.
  t.skip('this is skipped');
});
```

## Тесты TODO

Отдельные тесты можно пометить как нестабильные или незавершённые, передав опцию `todo`
в вызов `test` или вызвав метод контекста `todo()`, как в примере ниже. Такие тесты
означают отложенную реализацию или известную ошибку, которую нужно исправить. Тесты TODO
выполняются, но не считаются провалом и не влияют на код выхода процесса. Если тест помечен
и как TODO, и как пропущенный, опция TODO игнорируется.

```js
// Используется опция todo без сообщения.
test('todo option', { todo: true }, (t) => {
  // Код выполняется, но не считается провалом.
  throw new Error('this does not fail the test');
});

// Используется опция todo с сообщением.
test('todo option with message', { todo: 'this is a todo test' }, (t) => {
  // Код выполняется.
});

test('todo() method', (t) => {
  t.todo();
});

test('todo() method with message', (t) => {
  t.todo('this is a todo test and is not treated as a failure');
  throw new Error('this does not fail the test');
});
```

## Ожидание падения тестов

<!-- YAML
added:
 - v25.5.0
 - v24.14.0
-->

Инвертирует отчёт об успехе/провале для отдельного теста или набора: помеченный тест
считается пройденным только если выбрасывает исключение; если исключения нет — провал.

В примерах ниже `doTheThing()` не возвращает `true`, но тесты помечены `expectFailure`, поэтому проходят.

```js
it.expectFailure('should do the thing', () => {
  assert.strictEqual(doTheThing(), true);
});

it('should do the thing', { expectFailure: true }, () => {
  assert.strictEqual(doTheThing(), true);
});

it('should do the thing', { expectFailure: 'feature not implemented' }, () => {
  assert.strictEqual(doTheThing(), true);
});
```

Если `expectFailure` имеет тип [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), тест проходит только при
выбросе совпадающего значения. См. [`assert.throws`][`assert.throws`] про обработку типов.

Следующие тесты падают _несмотря_ на `expectFailure`, потому что ошибка не совпадает с ожидаемой.

```js
it('fails because regex does not match', {
  expectFailure: /expected message/,
}, () => {
  throw new Error('different message');
});

it('fails because object matcher does not match', {
  expectFailure: { code: 'ERR_EXPECTED' },
}, () => {
  const err = new Error('boom');
  err.code = 'ERR_ACTUAL';
  throw err;
});
```

Чтобы задать и причину, и шаблон ошибки для `expectFailure`, используйте `{ label, match }`.

```js
it('should fail with specific error and reason', {
  expectFailure: {
    label: 'reason for failure',
    match: /error message/,
  },
}, () => {
  assert.strictEqual(doTheThing(), true);
});
```

`skip` и/или `todo` несовместимы с `expectFailure`; при совместном указании приоритет у `skip` и `todo`
(`skip` сильнее остальных, `todo` сильнее `expectFailure`).

Эти тесты будут пропущены (не выполнятся):

```js
it.expectFailure('should do the thing', { skip: true }, () => {
  assert.strictEqual(doTheThing(), true);
});

it.skip('should do the thing', { expectFailure: true }, () => {
  assert.strictEqual(doTheThing(), true);
});
```

Эти тесты будут помечены как «todo» (ошибки подавляются):

```js
it.expectFailure('should do the thing', { todo: true }, () => {
  assert.strictEqual(doTheThing(), true);
});

it.todo('should do the thing', { expectFailure: true }, () => {
  assert.strictEqual(doTheThing(), true);
});
```

## Тесты `only`

Если Node.js запущен с [`--test-only`][`--test-only`] или отключена изоляция тестов, можно выполнить
только выбранные тесты, передав им опцию `only`. У теста с `only` выполняются и все подтесты.
Если `only` задан у набора, выполняются все тесты набора, кроме случая, когда у потомков тоже
есть `only` — тогда только они.

При [подтестах][subtests] внутри `test()`/`it()` нужно пометить `only` всех предков,
чтобы запустить только часть подтестов.

Метод контекста `runOnly()` даёт то же на уровне подтестов. Невыполненные тесты не попадают в вывод раннера.

```js
// Предположим, что Node.js запущен с опцией командной строки --test-only.
// Задана опция 'only' набора, поэтому эти тесты выполняются.
test('this test is run', { only: true }, async (t) => {
  // В этом тесте по умолчанию выполняются все подтесты.
  await t.test('running subtest');

  // Контекст можно обновить, чтобы подтесты запускались с опцией 'only'.
  t.runOnly(true);
  await t.test('this subtest is now skipped');
  await t.test('this subtest is run', { only: true });

  // Снова переключаем контекст, чтобы выполнялись все тесты.
  t.runOnly(false);
  await t.test('this subtest is now run');

  // Явно не запускаем эти тесты.
  await t.test('skipped subtest 3', { only: false });
  await t.test('skipped subtest 4', { skip: true });
});

// Опция 'only' не задана — этот тест пропускается.
test('this test is not run', () => {
  // Этот код не выполняется.
  throw new Error('fail');
});

describe('a suite', () => {
  // Задана опция 'only' — этот тест выполняется.
  it('this test is run', { only: true }, () => {
    // Этот код выполняется.
  });

  it('this test is not run', () => {
    // Этот код не выполняется.
    throw new Error('fail');
  });
});

describe.only('a suite', () => {
  // Задана опция 'only' — этот тест выполняется.
  it('this test is run', () => {
    // Этот код выполняется.
  });

  it('this test is run', () => {
    // Этот код выполняется.
  });
});
```

## Фильтрация тестов по имени

Опция командной строки [`--test-name-pattern`][`--test-name-pattern`] позволяет запускать только те тесты,
имя которых соответствует заданному шаблону; опция [`--test-skip-pattern`][`--test-skip-pattern`] —
пропускать тесты, имя которых соответствует шаблону. Шаблоны имён интерпретируются как
регулярные выражения JavaScript. Опции `--test-name-pattern` и
`--test-skip-pattern` можно указывать несколько раз, в том числе для вложенных тестов.
Для каждого выполняемого теста также выполняются соответствующие хуки, например
`beforeEach()`. Тесты, которые не выполняются, не попадают в вывод раннера.

Для приведённого ниже файла тестов запуск Node.js с
`--test-name-pattern="test [1-3]"` приведёт к выполнению
`test 1`, `test 2` и `test 3`. Если `test 1` не совпал с шаблоном имени,
его подтесты не выполнятся, даже если сами подходят под шаблон. Тот же набор тестов
можно выполнить, передав `--test-name-pattern` несколько раз (например
`--test-name-pattern="test 1"`,
`--test-name-pattern="test 2"` и т. д.).

```js
test('test 1', async (t) => {
  await t.test('test 2');
  await t.test('test 3');
});

test('Test 4', async (t) => {
  await t.test('Test 5');
  await t.test('test 6');
});
```

Шаблоны имён можно задавать в виде литералов регулярных выражений — тогда доступны
флаги RegExp. В предыдущем примере запуск Node.js с `--test-name-pattern="/test [4-5]/i"`
(или `--test-skip-pattern="/test [4-5]/i"`)
даст совпадение с `Test 4` и `Test 5`, так как шаблон без учёта регистра.

Чтобы однозначно сопоставить один тест с шаблоном, префиксуйте имя всеми именами
предков через пробел.
Например, для файла:

```js
describe('test 1', (t) => {
  it('some test');
});

describe('test 2', (t) => {
  it('some test');
});
```

Запуск Node.js с `--test-name-pattern="test 1 some test"` сопоставит
только `some test` внутри `test 1`.

Шаблоны имён не меняют набор файлов, которые выполняет раннер.

Если заданы и `--test-name-pattern`, и `--test-skip-pattern`,
тест должен удовлетворять **обоим** условиям, чтобы быть выполненным.

## Посторонняя асинхронная активность

Как только функция теста завершает работу, результаты сообщаются как можно скорее,
сохраняя порядок тестов. При этом тест может породить асинхронную активность,
которая переживает сам тест. Раннер обрабатывает такую активность, но не откладывает
отчёт о результатах ради неё.

В примере ниже тест завершается, когда два вызова `setImmediate()` ещё не выполнены.
Первый `setImmediate()` пытается создать новый подтест. Поскольку родительский тест уже
завершился и вывел результаты, новый подтест сразу помечается как проваленный и позже
попадает в [TestsStream](test.md).

Второй `setImmediate()` создаёт событие `uncaughtException`.
События `uncaughtException` и `unhandledRejection`, исходящие от уже завершённого теста,
модуль `test` помечает как провал и передаёт в [TestsStream](test.md) как диагностические
предупреждения верхнего уровня.

```js
test('a test that creates asynchronous activity', (t) => {
  setImmediate(() => {
    t.test('subtest that is created too late', (t) => {
      throw new Error('error1');
    });
  });

  setImmediate(() => {
    throw new Error('error2');
  });

  // Тест завершается после этой строки.
});
```

## Режим наблюдения (watch)

<!-- YAML
added:
  - v19.2.0
  - v18.13.0
-->

> Стабильность: 1 — экспериментально

Раннер тестов Node.js поддерживает режим наблюдения при передаче флага `--watch`:

```bash
node --test --watch
```

В режиме watch раннер отслеживает изменения в тестовых файлах и зависимостях.
При обнаружении изменений перезапускаются затронутые тесты.
Работа продолжается, пока процесс не будет завершён.

## Глобальная подготовка и завершение

<!-- YAML
added: v24.0.0
-->

> Стабильность: 1.0 — ранняя разработка

Можно указать модуль, который выполняется до всех тестов и задаёт глобальное состояние
или фикстуры. Удобно для подготовки ресурсов или общего состояния, нужного нескольким тестам.

Модуль может экспортировать:

* функцию `globalSetup` — выполняется один раз перед стартом всех тестов;
* функцию `globalTeardown` — выполняется один раз после завершения всех тестов.

Путь к модулю задаётся флагом `--test-global-setup` при запуске тестов из командной строки.

=== "CJS"

    ```js
    // setup-module.js
    async function globalSetup() {
      // Setup shared resources, state, or environment
      console.log('Global setup executed');
      // Run servers, create files, prepare databases, etc.
    }
    
    async function globalTeardown() {
      // Clean up resources, state, or environment
      console.log('Global teardown executed');
      // Close servers, remove files, disconnect from databases, etc.
    }
    
    module.exports = { globalSetup, globalTeardown };
    ```

=== "MJS"

    ```js
    // setup-module.mjs
    export async function globalSetup() {
      // Setup shared resources, state, or environment
      console.log('Global setup executed');
      // Run servers, create files, prepare databases, etc.
    }
    
    export async function globalTeardown() {
      // Clean up resources, state, or environment
      console.log('Global teardown executed');
      // Close servers, remove files, disconnect from databases, etc.
    }
    ```

Если функция глобальной подготовки выбрасывает ошибку, тесты не запускаются, процесс
завершается с ненулевым кодом выхода. В этом случае `globalTeardown` не вызывается.

## Запуск тестов из командной строки

Раннер тестов Node.js вызывается из командной строки с флагом
[`--test`][`--test`]:

```bash
node --test
```

По умолчанию Node.js выполняет все файлы, подходящие под шаблоны:

* `**/*.test.{cjs,mjs,js}`
* `**/*-test.{cjs,mjs,js}`
* `**/*_test.{cjs,mjs,js}`
* `**/test-*.{cjs,mjs,js}`
* `**/test.{cjs,mjs,js}`
* `**/test/**/*.{cjs,mjs,js}`

Если не указан [`--no-strip-types`][`--no-strip-types`], дополнительно учитываются:

* `**/*.test.{cts,mts,ts}`
* `**/*-test.{cts,mts,ts}`
* `**/*_test.{cts,mts,ts}`
* `**/test-*.{cts,mts,ts}`
* `**/test.{cts,mts,ts}`
* `**/test/**/*.{cts,mts,ts}`

Вместо этого в конце команды Node.js можно передать один или несколько шаблонов glob,
как показано ниже. Поведение glob соответствует [`glob(7)`][`glob(7)`].
Шаблоны glob в командной строке лучше заключать в двойные кавычки,
чтобы оболочка не раскрывала их — так выше переносимость между системами.

```bash
node --test "**/*.test.js" "**/*.spec.js"
```

### Случайный порядок выполнения тестов

<!-- YAML
added: REPLACEME
-->

> Стабильность: 1.0 — ранняя разработка

Раннер может перемешивать порядок выполнения, чтобы выявлять тесты, зависящие от порядка.
В этом режиме перемешиваются и найденные файлы тестов, и очередь тестов внутри файла.
Включение: `--test-randomize`.

```bash
node --test --test-randomize
```

При включённой рандомизации раннер выводит диагностическое сообщение с seed прогона:

```text
Randomized test order seed: 12345
```

`--test-random-seed=<число>` воспроизводит тот же порядок. Указание `--test-random-seed`
также включает рандомизацию, поэтому при заданном seed флаг `--test-randomize` необязателен:

```bash
node --test --test-random-seed=12345
```

В большинстве файлов рандомизация работает автоматически. Важное исключение —
последовательное `await` подтестов: каждый следующий стартует после завершения предыдущего,
и раннер сохраняет порядок объявления вместо перемешивания.

Пример: выполняется строго по очереди и **не** рандомизируется.

=== "MJS"

    ```js
    import test from 'node:test';
    
    test('math', async (t) => {
      for (const name of ['adds', 'subtracts', 'multiplies']) {
        // Последовательный await подтестов сохраняет порядок объявления.
        await t.test(name, async () => {});
      }
    });
    ```

=== "CJS"

    ```js
    const test = require('node:test');
    
    test('math', async (t) => {
      for (const name of ['adds', 'subtracts', 'multiplies']) {
        // Последовательный await подтестов сохраняет порядок объявления.
        await t.test(name, async () => {});
      }
    });
    ```

API в стиле suite (`describe()`/`it()` или `suite()`/`test()`)
по-прежнему допускают рандомизацию: соседние тесты ставятся в очередь вместе.

Пример: этот вариант остаётся подходящим для рандомизации.

=== "MJS"

    ```js
    import { describe, it } from 'node:test';
    
    describe('math', () => {
      it('adds', () => {});
      it('subtracts', () => {});
      it('multiplies', () => {});
    });
    ```

=== "CJS"

    ```js
    const { describe, it } = require('node:test');
    
    describe('math', () => {
      it('adds', () => {});
      it('subtracts', () => {});
      it('multiplies', () => {});
    });
    ```

`--test-randomize` и `--test-random-seed` несовместимы с режимом `--watch`.

Подходящие файлы выполняются как тестовые. Подробнее — в разделе
[модель выполнения раннера тестов][test runner execution model].

### Модель выполнения раннера тестов

При включённой изоляции тестов на уровне процесса каждый подходящий файл теста
выполняется в отдельном дочернем процессе. Максимальное число одновременных дочерних
процессов задаёт [`--test-concurrency`][`--test-concurrency`]. Если дочерний процесс завершился с кодом 0,
тест считается пройденным; иначе — провалом. Файлы должны быть исполняемы Node.js,
но не обязаны использовать внутри модуль `node:test`.

Каждый файл выполняется как обычный скрипт: если в нём через `node:test` объявлены тесты,
они выполняются в одном потоке приложения, независимо от опции `concurrency` у [`test()`][`test()`].

При отключённой изоляции каждый файл импортируется в процесс раннера. После загрузки всех
файлов тесты верхнего уровня выполняются с параллелизмом 1. Общий контекст позволяет тестам
взаимодействовать так, как при изоляции нельзя: например глобальное состояние может меняться
тестом из другого файла.

#### Наследование опций дочерним процессом

В режиме изоляции процессов (по умолчанию) дочерние процессы наследуют опции Node.js
от родителя, в том числе из [файлов конфигурации][configuration files]. Часть флагов отфильтрована для корректной
работы раннера:

* `--test` — запрещён, чтобы избежать рекурсивного запуска тестов
* `--experimental-test-coverage` — управляет раннер
* `--watch` — режим watch на уровне родителя
* `--experimental-default-config-file` — загрузка конфигурации на уровне родителя
* `--test-reporter` — отчётность на уровне родителя
* `--test-reporter-destination` — назначения вывода задаёт родитель
* `--experimental-config-file` — пути к конфигу на уровне родителя
* `--test-randomize` — рандомизацию задаёт родитель и передаёт дочерним процессам
* `--test-random-seed` — seed рандомизации задаёт родитель и передаёт дочерним процессам

Остальные опции Node.js из аргументов командной строки, переменных окружения и конфигурационных
файлов дочерние процессы наследуют.

## Сбор покрытия кода

> Стабильность: 1 — экспериментально

При запуске Node.js с флагом [`--experimental-test-coverage`][`--experimental-test-coverage`]
собирается покрытие кода; после завершения всех тестов выводится статистика.
Если переменная окружения [`NODE_V8_COVERAGE`][`NODE_V8_COVERAGE`] задаёт каталог покрытия,
файлы V8 записываются туда. Модули ядра Node.js и файлы в `node_modules/` по умолчанию
не входят в отчёт; их можно явно включить флагом [`--test-coverage-include`][`--test-coverage-include`].
По умолчанию все подходящие тестовые файлы исключаются из отчёта о покрытии;
исключения можно переопределить [`--test-coverage-exclude`][`--test-coverage-exclude`].
При включённом покрытии отчёт передаётся [репортёрам тестов][test reporters] через
событие `'test:coverage'`.

Покрытие для набора строк можно отключить такими комментариями:

```js
/* node:coverage disable */
if (anAlwaysFalseCondition) {
  // Код в этой ветке не выполнится, но строки не учитываются в покрытии.
  // Все строки после 'disable' игнорируются до парного комментария 'enable'.
  console.log('this is never executed');
}
/* node:coverage enable */
```

Покрытие можно отключить на заданное число строк; затем оно снова включается автоматически.
Если число строк не указано, игнорируется одна строка.

```js
/* node:coverage ignore next */
if (anAlwaysFalseCondition) { console.log('this is never executed'); }

/* node:coverage ignore next 3 */
if (anAlwaysFalseCondition) {
  console.log('this is never executed');
}
```

### Репортёры покрытия

Репортёры `tap` и `spec` выводят сводку по покрытию.
Также есть репортёр `lcov`, создающий файл lcov для детального отчёта.

```bash
node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=lcov.info
```

* Этот репортёр не выводит результаты самих тестов.
* Его лучше использовать вместе с другим репортёром.

## Подмены (mocking)

Модуль `node:test` поддерживает подмены через объект верхнего уровня `mock`.
В примере создаётся шпион для функции сложения двух чисел; затем проверяется,
что функция вызывалась ожидаемо.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { mock, test } from 'node:test';
    
    test('spies on a function', () => {
      const sum = mock.fn((a, b) => {
        return a + b;
      });
    
      assert.strictEqual(sum.mock.callCount(), 0);
      assert.strictEqual(sum(3, 4), 7);
      assert.strictEqual(sum.mock.callCount(), 1);
    
      const call = sum.mock.calls[0];
      assert.deepStrictEqual(call.arguments, [3, 4]);
      assert.strictEqual(call.result, 7);
      assert.strictEqual(call.error, undefined);
    
      // Сброс глобально отслеживаемых подмен.
      mock.reset();
    });
    ```

=== "CJS"

    ```js
    'use strict';
    const assert = require('node:assert');
    const { mock, test } = require('node:test');
    
    test('spies on a function', () => {
      const sum = mock.fn((a, b) => {
        return a + b;
      });
    
      assert.strictEqual(sum.mock.callCount(), 0);
      assert.strictEqual(sum(3, 4), 7);
      assert.strictEqual(sum.mock.callCount(), 1);
    
      const call = sum.mock.calls[0];
      assert.deepStrictEqual(call.arguments, [3, 4]);
      assert.strictEqual(call.result, 7);
      assert.strictEqual(call.error, undefined);
    
      // Сброс глобально отслеживаемых подмен.
      mock.reset();
    });
    ```

Та же функциональность доступна на объекте [`TestContext`][`TestContext`] каждого теста.
В примере ниже шпион создаётся для метода объекта через API контекста.
Плюс подмен через контекст: раннер сам восстанавливает подменённое поведение
после завершения теста.

```js
test('spies on an object method', (t) => {
  const number = {
    value: 5,
    add(a) {
      return this.value + a;
    },
  };

  t.mock.method(number, 'add');
  assert.strictEqual(number.add.mock.callCount(), 0);
  assert.strictEqual(number.add(3), 8);
  assert.strictEqual(number.add.mock.callCount(), 1);

  const call = number.add.mock.calls[0];

  assert.deepStrictEqual(call.arguments, [3]);
  assert.strictEqual(call.result, 8);
  assert.strictEqual(call.target, undefined);
  assert.strictEqual(call.this, number);
});
```

### Таймеры

Подмена таймеров — распространённый приём: имитация и управление `setInterval` и
`setTimeout` без реального ожидания интервалов.

Полный список методов и возможностей — в классе [`MockTimers`][`MockTimers`].

Так проще писать устойчивые и предсказуемые тесты для логики, зависящей от времени.

Ниже показана подмена `setTimeout`.
Вызов `.enable({ apis: ['setTimeout'] });`
подменяет `setTimeout` в модулях [node:timers](./timers.md) и
[node:timers/promises](./timers.md#timers-promises-api),
а также глобальный `setTimeout` в Node.js.

**Примечание:** деструктуризация вроде
`import [setTimeout](timers.md#settimeoutcallback-delay-args) from 'node:timers'`
в этой API пока не поддерживается.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { mock, test } from 'node:test';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', () => {
      const fn = mock.fn();
    
      // При необходимости выберите, что подменять
      mock.timers.enable({ apis: ['setTimeout'] });
      setTimeout(fn, 9999);
      assert.strictEqual(fn.mock.callCount(), 0);
    
      // Сдвиг времени
      mock.timers.tick(9999);
      assert.strictEqual(fn.mock.callCount(), 1);
    
      // Сброс глобально отслеживаемых подмен
      mock.timers.reset();
    
      // Вызов сброса экземпляра mock также сбрасывает таймеры
      mock.reset();
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { mock, test } = require('node:test');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', () => {
      const fn = mock.fn();
    
      // При необходимости выберите, что подменять
      mock.timers.enable({ apis: ['setTimeout'] });
      setTimeout(fn, 9999);
      assert.strictEqual(fn.mock.callCount(), 0);
    
      // Сдвиг времени
      mock.timers.tick(9999);
      assert.strictEqual(fn.mock.callCount(), 1);
    
      // Сброс глобально отслеживаемых подмен
      mock.timers.reset();
    
      // Вызов сброса экземпляра mock также сбрасывает таймеры
      mock.reset();
    });
    ```

Та же функциональность доступна в свойстве `mock` у [`TestContext`][`TestContext`].
При подмене через контекст раннер после теста автоматически восстанавливает
подменённые таймеры.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
    
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout'] });
      setTimeout(fn, 9999);
      assert.strictEqual(fn.mock.callCount(), 0);
    
      // Сдвиг времени
      context.mock.timers.tick(9999);
      assert.strictEqual(fn.mock.callCount(), 1);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
    
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout'] });
      setTimeout(fn, 9999);
      assert.strictEqual(fn.mock.callCount(), 0);
    
      // Сдвиг времени
      context.mock.timers.tick(9999);
      assert.strictEqual(fn.mock.callCount(), 1);
    });
    ```

### Дата

API подмены таймеров позволяет подменять и объект `Date` — удобно для тестов,
зависящих от времени, и для симуляции `Date.now()` и т. п.

Реализация даты тоже входит в [`MockTimers`][`MockTimers`] — см. там полный список методов.

**Примечание:** при совместной подмене `Date` и таймеров они связаны: сдвиг времени
двигает и подменённую дату — имитируется один общий внутренний таймер.

Ниже — подмена `Date` и текущее значение `Date.now()`.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks the Date object', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['Date'] });
      // Если не задано, начальная дата — 0 в эпохе UNIX
      assert.strictEqual(Date.now(), 0);
    
      // Сдвиг времени также двигает дату
      context.mock.timers.tick(9999);
      assert.strictEqual(Date.now(), 9999);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks the Date object', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['Date'] });
      // Если не задано, начальная дата — 0 в эпохе UNIX
      assert.strictEqual(Date.now(), 0);
    
      // Сдвиг времени также двигает дату
      context.mock.timers.tick(9999);
      assert.strictEqual(Date.now(), 9999);
    });
    ```

Если начальная эпоха не задана, дата берётся от 0 в Unix-эпохе
(1 января 1970, 00:00:00 UTC). Начальное время можно задать свойством `now`
в вызове `.enable()` — оно станет стартовым для подменённого `Date` (положительное
целое или другой объект `Date`).

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks the Date object with initial time', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['Date'], now: 100 });
      assert.strictEqual(Date.now(), 100);
    
      // Сдвиг времени также двигает дату
      context.mock.timers.tick(200);
      assert.strictEqual(Date.now(), 300);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks the Date object with initial time', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['Date'], now: 100 });
      assert.strictEqual(Date.now(), 100);
    
      // Сдвиг времени также двигает дату
      context.mock.timers.tick(200);
      assert.strictEqual(Date.now(), 300);
    });
    ```

Метод `.setTime()` вручную переносит подменённую дату; принимается только неотрицательное целое.

**Примечание:** метод **не** выполняет подменённые таймеры, которые оказались «в прошлом»
относительно нового времени.

В примере ниже задаётся новое время для подменённой даты.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('sets the time of a date object', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['Date'], now: 100 });
      assert.strictEqual(Date.now(), 100);
    
      // Сдвиг времени также двигает дату
      context.mock.timers.setTime(1000);
      context.mock.timers.tick(200);
      assert.strictEqual(Date.now(), 1200);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('sets the time of a date object', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['Date'], now: 100 });
      assert.strictEqual(Date.now(), 100);
    
      // Сдвиг времени также двигает дату
      context.mock.timers.setTime(1000);
      context.mock.timers.tick(200);
      assert.strictEqual(Date.now(), 1200);
    });
    ```

Таймеры, запланированные «в прошлом», при вызове `setTime()` **не** срабатывают.
Чтобы выполнить их, дальше двигайте время через `.tick()`.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('setTime does not execute timers', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const fn = context.mock.fn();
      setTimeout(fn, 1000);
    
      context.mock.timers.setTime(800);
      // Таймер не сработал — время ещё не достигнуто
      assert.strictEqual(fn.mock.callCount(), 0);
      assert.strictEqual(Date.now(), 800);
    
      context.mock.timers.setTime(1200);
      // Таймер всё ещё не сработал
      assert.strictEqual(fn.mock.callCount(), 0);
      // Сдвиг времени для срабатывания таймера
      context.mock.timers.tick(0);
      assert.strictEqual(fn.mock.callCount(), 1);
      assert.strictEqual(Date.now(), 1200);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('runs timers as setTime passes ticks', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const fn = context.mock.fn();
      setTimeout(fn, 1000);
    
      context.mock.timers.setTime(800);
      // Таймер не сработал — время ещё не достигнуто
      assert.strictEqual(fn.mock.callCount(), 0);
      assert.strictEqual(Date.now(), 800);
    
      context.mock.timers.setTime(1200);
      // Таймер сработал — время достигнуто
      assert.strictEqual(fn.mock.callCount(), 1);
      assert.strictEqual(Date.now(), 1200);
    });
    ```

`.runAll()` выполняет все таймеры в очереди и сдвигает подменённую дату
до времени последнего выполненного таймера, как если бы время прошло.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('runs timers as setTime passes ticks', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const fn = context.mock.fn();
      setTimeout(fn, 1000);
      setTimeout(fn, 2000);
      setTimeout(fn, 3000);
    
      context.mock.timers.runAll();
      // Все таймеры сработали — время достигнуто
      assert.strictEqual(fn.mock.callCount(), 3);
      assert.strictEqual(Date.now(), 3000);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('runs timers as setTime passes ticks', (context) => {
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const fn = context.mock.fn();
      setTimeout(fn, 1000);
      setTimeout(fn, 2000);
      setTimeout(fn, 3000);
    
      context.mock.timers.runAll();
      // Все таймеры сработали — время достигнуто
      assert.strictEqual(fn.mock.callCount(), 3);
      assert.strictEqual(Date.now(), 3000);
    });
    ```

## Снимки (snapshot testing)

<!-- YAML
added: v22.3.0
changes:
  - version: v23.4.0
    pr-url: https://github.com/nodejs/node/pull/55897
    description: Тестирование снимков больше не экспериментальное.
-->

Добавлено в: v22.3.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.4.0 | Тестирование моментальных снимков больше не является экспериментальным. |

Тесты-снимки сериализуют произвольные значения в строки и сравнивают их с эталоном.
Эталонные значения называются снимками и хранятся в файле снимков; раннер им управляет,
но формат остаётся читаемым для отладки. Файлы снимков обычно коммитят вместе с тестами.

Файлы снимков создаются при запуске Node.js с флагом
[`--test-update-snapshots`][`--test-update-snapshots`]. На каждый тестовый файл — отдельный файл снимка.
По умолчанию имя совпадает с тестом и расширением `.snapshot`; поведение настраивается
через `snapshot.setResolveSnapshotPath()`. Каждое утверждение снимка соответствует
экспорту в файле.

Пример ниже при первом запуске провалится: файла снимка ещё нет.

```js
// test.js
suite('suite of snapshot tests', () => {
  test('snapshot test', (t) => {
    t.assert.snapshot({ value1: 1, value2: 2 });
    t.assert.snapshot(5);
  });
});
```

Сгенерируйте файл снимка, запустив тест с `--test-update-snapshots`. Тест должен пройти,
рядом появится `test.js.snapshot`. Ниже — пример содержимого: каждый снимок помечен
полным именем теста и счётчиком, если в одном тесте несколько снимков.

```js
exports[`suite of snapshot tests > snapshot test 1`] = `
{
  "value1": 1,
  "value2": 2
}
`;

exports[`suite of snapshot tests > snapshot test 2`] = `
5
`;
```

После создания файла снимка запустите тесты без `--test-update-snapshots` — они должны проходить.

## Репортёры тестов

<!-- YAML
added:
  - v19.6.0
  - v18.15.0
changes:
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/54548
    description: Репортёр по умолчанию для stdout без TTY изменён с `tap` на
                 `spec`, как для TTY.
  - version:
    - v19.9.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47238
    description: Репортёры экспортируются из `node:test/reporters`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Средство создания отчетов по умолчанию для стандартного вывода без TTY изменено с `tap` на `spec`, что соответствует стандартному выводу TTY. |
    | v19.9.0, v18.17.0 | Репортеры теперь доступны по адресу `node:test/reporters`. |

В модуле `node:test` можно передать флаги [`--test-reporter`][`--test-reporter`], чтобы
раннер использовал нужный репортёр.

Встроенные репортёры:

* `spec`
  Выводит результаты в удобочитаемом виде. Репортёр по умолчанию.

* `tap`
  Формат [TAP][TAP].

* `dot`
  Компактный вывод: успешный тест — `.`, провал — `X`.

* `junit`
  jUnit XML.

* `lcov`
  Покрытие кода; используется с [`--experimental-test-coverage`][`--experimental-test-coverage`].

Точный формат вывода может меняться между версиями Node.js и не гарантирован для программного разбора.
Для программного доступа к результатам подписывайтесь на события [TestsStream](test.md).

Репортёры импортируются из `node:test/reporters`:

=== "MJS"

    ```js
    import { tap, spec, dot, junit, lcov } from 'node:test/reporters';
    ```

=== "CJS"

    ```js
    const { tap, spec, dot, junit, lcov } = require('node:test/reporters');
    ```

### Пользовательские репортёры

[`--test-reporter`][`--test-reporter`] может указывать путь к своему репортёру.
Это модуль, экспортирующий значение, допустимое для [stream.compose][stream.compose].
Репортёр преобразует события [TestsStream](test.md).

Пример репортёра на базе [stream.Transform](stream.md#class-streamtransform):

=== "MJS"

    ```js
    import { Transform } from 'node:stream';
    
    const customReporter = new Transform({
      writableObjectMode: true,
      transform(event, encoding, callback) {
        switch (event.type) {
          case 'test:dequeue':
            callback(null, `test ${event.data.name} dequeued`);
            break;
          case 'test:enqueue':
            callback(null, `test ${event.data.name} enqueued`);
            break;
          case 'test:watch:drained':
            callback(null, 'test watch queue drained');
            break;
          case 'test:watch:restarted':
            callback(null, 'test watch restarted due to file change');
            break;
          case 'test:start':
            callback(null, `test ${event.data.name} started`);
            break;
          case 'test:pass':
            callback(null, `test ${event.data.name} passed`);
            break;
          case 'test:fail':
            callback(null, `test ${event.data.name} failed`);
            break;
          case 'test:plan':
            callback(null, 'test plan');
            break;
          case 'test:diagnostic':
          case 'test:stderr':
          case 'test:stdout':
            callback(null, event.data.message);
            break;
          case 'test:coverage': {
            const { totalLineCount } = event.data.summary.totals;
            callback(null, `total line count: ${totalLineCount}\n`);
            break;
          }
        }
      },
    });
    
    export default customReporter;
    ```

=== "CJS"

    ```js
    const { Transform } = require('node:stream');
    
    const customReporter = new Transform({
      writableObjectMode: true,
      transform(event, encoding, callback) {
        switch (event.type) {
          case 'test:dequeue':
            callback(null, `test ${event.data.name} dequeued`);
            break;
          case 'test:enqueue':
            callback(null, `test ${event.data.name} enqueued`);
            break;
          case 'test:watch:drained':
            callback(null, 'test watch queue drained');
            break;
          case 'test:watch:restarted':
            callback(null, 'test watch restarted due to file change');
            break;
          case 'test:start':
            callback(null, `test ${event.data.name} started`);
            break;
          case 'test:pass':
            callback(null, `test ${event.data.name} passed`);
            break;
          case 'test:fail':
            callback(null, `test ${event.data.name} failed`);
            break;
          case 'test:plan':
            callback(null, 'test plan');
            break;
          case 'test:diagnostic':
          case 'test:stderr':
          case 'test:stdout':
            callback(null, event.data.message);
            break;
          case 'test:coverage': {
            const { totalLineCount } = event.data.summary.totals;
            callback(null, `total line count: ${totalLineCount}\n`);
            break;
          }
        }
      },
    });
    
    module.exports = customReporter;
    ```

Пример репортёра на генераторе:

=== "MJS"

    ```js
    export default async function * customReporter(source) {
      for await (const event of source) {
        switch (event.type) {
          case 'test:dequeue':
            yield `test ${event.data.name} dequeued\n`;
            break;
          case 'test:enqueue':
            yield `test ${event.data.name} enqueued\n`;
            break;
          case 'test:watch:drained':
            yield 'test watch queue drained\n';
            break;
          case 'test:watch:restarted':
            yield 'test watch restarted due to file change\n';
            break;
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
          case 'test:stderr':
          case 'test:stdout':
            yield `${event.data.message}\n`;
            break;
          case 'test:coverage': {
            const { totalLineCount } = event.data.summary.totals;
            yield `total line count: ${totalLineCount}\n`;
            break;
          }
        }
      }
    }
    ```

=== "CJS"

    ```js
    module.exports = async function * customReporter(source) {
      for await (const event of source) {
        switch (event.type) {
          case 'test:dequeue':
            yield `test ${event.data.name} dequeued\n`;
            break;
          case 'test:enqueue':
            yield `test ${event.data.name} enqueued\n`;
            break;
          case 'test:watch:drained':
            yield 'test watch queue drained\n';
            break;
          case 'test:watch:restarted':
            yield 'test watch restarted due to file change\n';
            break;
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
          case 'test:stderr':
          case 'test:stdout':
            yield `${event.data.message}\n`;
            break;
          case 'test:coverage': {
            const { totalLineCount } = event.data.summary.totals;
            yield `total line count: ${totalLineCount}\n`;
            break;
          }
        }
      }
    };
    ```

Значение для `--test-reporter` — строка в том же виде, что аргумент динамического `import()`,
или значение, как у [`--import`][`--import`].

### Несколько репортёров

Флаг [`--test-reporter`][`--test-reporter`] можно указать несколько раз, чтобы получить вывод в нескольких форматах.
Тогда для каждого репортёра нужно задать назначение через [`--test-reporter-destination`][`--test-reporter-destination`]:
`stdout`, `stderr` или путь к файлу. Пары «репортёр — назначение» сопоставляются по порядку следования.

В примере `spec` пишет в `stdout`, а `dot` — в `file.txt`:

```bash
node --test-reporter=spec --test-reporter=dot --test-reporter-destination=stdout --test-reporter-destination=file.txt
```

Если указан один репортёр, назначение по умолчанию — `stdout`, пока не задано явно.

## `run([options])`

<!-- YAML
added:
  - v18.9.0
  - v16.19.0
changes:
  - version:
     - v25.6.0
     - v24.14.0
    pr-url: https://github.com/nodejs/node/pull/61367
    description: Добавлена опция `env`.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59443
    description: Добавлен параметр rerunFailuresFilePath.
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/54705
    description: Добавлена опция `cwd`.
  - version:
    - v23.0.0
    - v22.10.0
    pr-url: https://github.com/nodejs/node/pull/53937
    description: Добавлены опции покрытия.
  - version: v22.8.0
    pr-url: https://github.com/nodejs/node/pull/53927
    description: Добавлена опция `isolation`.
  - version: v22.6.0
    pr-url: https://github.com/nodejs/node/pull/53866
    description: Добавлена опция `globPatterns`.
  - version:
    - v22.0.0
    - v20.14.0
    pr-url: https://github.com/nodejs/node/pull/52038
    description: Добавлена опция `forceExit`.
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47628
    description: Добавлена опция testNamePatterns.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.6.0, v24.14.0 | Добавьте опцию env. |
    | v24.7.0 | Добавлен параметр rerunFailuresFilePath. |
    | v23.0.0 | Добавлена ​​опция `cwd`. |
    | v23.0.0, v22.10.0 | Добавлены варианты покрытия. |
    | v22.8.0 | Добавлена ​​опция «изоляция». |
    | v22.6.0 | Добавлена ​​опция `globPatterns`. |
    | v22.0.0, v20.14.0 | Добавлена ​​опция ForceExit. |
    | v20.1.0, v18.17.0 | Добавьте параметр testNamePatterns. |

* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры конфигурации запуска тестов. Поддерживаются следующие
  свойства:
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если указано число,
    параллельно выполняется столько процессов с тестами; каждый процесс
    соответствует одному тестовому файлу.
    Если `true`, параллельно запускается `os.availableParallelism() - 1` тестовых файлов.
    Если `false`, за раз выполняется только один тестовый файл.
    **По умолчанию:** `false`.
  * `cwd` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текущий рабочий каталог для раннера тестов.
    Используется как база для разрешения путей к файлам, как при [запуске тестов из командной строки][running tests from the command line] из этого каталога.
    **По умолчанию:** `process.cwd()`.
  * `files` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив путей к запускаемым файлам.
    **По умолчанию:** как при [запуске тестов из командной строки][running tests from the command line].
  * `forceExit` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Завершать процесс после того, как все известные тесты
    выполнены, даже если цикл событий иначе оставался бы активным. **По умолчанию:** `false`.
  * `globPatterns` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив glob-шаблонов для
    подбора тестовых файлов. Нельзя использовать вместе с `files`.
    **По умолчанию:** как при [запуске тестов из командной строки][running tests from the command line].
  * `inspectPort` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Порт инспектора для дочернего процесса с тестами.
    Может быть числом или функцией без аргументов, возвращающей число.
    Если передано пустое значение, у каждого процесса свой порт,
    увеличивающийся от `process.debugPort` родителя. Опция игнорируется,
    если `isolation` равно `'none'` — дочерние процессы не создаются.
    **По умолчанию:** `undefined`.
  * `isolation` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип изоляции тестов. При значении
    `'process'` каждый тестовый файл выполняется в отдельном дочернем процессе. При `'none'`
    все тестовые файлы выполняются в текущем процессе. **По умолчанию:**
    `'process'`.
  * `only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если истинно, контекст выполняет только тесты с
    установленной опцией `only`.
  * `setup` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция, принимающая экземпляр `TestsStream` и позволяющая
    зарегистрировать обработчики до запуска тестов.
    **По умолчанию:** `undefined`.
  * `execArgv` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив флагов CLI для передачи исполняемому файлу `node` при
    порождении дочерних процессов. Не действует при `isolation` равном `'none'`.
    **По умолчанию:** `[]`
  * `argv` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив флагов CLI для передачи каждому тестовому файлу при порождении
    дочерних процессов. Не действует при `isolation` равном `'none'`.
    **По умолчанию:** `[]`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся прогон тестов.
  * `testNamePatterns` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Строка, RegExp или массив RegExp —
    выполнять только тесты, имя которых совпадает с шаблоном.
    Шаблоны имён интерпретируются как регулярные выражения JavaScript.
    Для каждого выполняемого теста вызываются и соответствующие хуки, например
    `beforeEach()`.
    **По умолчанию:** `undefined`.
  * `testSkipPatterns` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Строка, RegExp или массив RegExp —
    исключать тесты, имя которых совпадает с шаблоном.
    Шаблоны имён интерпретируются как регулярные выражения JavaScript.
    Для каждого выполняемого теста вызываются и соответствующие хуки, например
    `beforeEach()`.
    **По умолчанию:** `undefined`.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд выполнение тестов считается
    проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.
  * `watch` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить режим watch или нет. **По умолчанию:** `false`.
  * `shard` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Запуск части тестов (шард). **По умолчанию:** `undefined`.
    * `index` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) — положительное целое от 1 до `<total>`;
      индекс выполняемого шарда. Параметр _обязателен_.
    * `total` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) — положительное целое: на сколько шардов делятся
      тестовые файлы. Параметр _обязателен_.
  * `randomize` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Перемешивать порядок тестовых файлов и очередь тестов.
    Несовместимо с `watch: true`.
    **По умолчанию:** `false`.
  * `randomSeed` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Зерно для перемешивания порядка. Если задано,
    прогоны можно повторять с тем же порядком, а указание опции также включает рандомизацию.
    Значение — целое от `0` до `4294967295`.
    **По умолчанию:** `undefined`.
  * `rerunFailuresFilePath` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь к файлу, в котором раннер сохраняет
    состояние тестов, чтобы при следующем запуске выполнить только проваленные тесты;
    подробнее см. [Повторный запуск проваленных тестов](#повторный-запуск-проваленных-тестов).
    **По умолчанию:** `undefined`.
  * `coverage` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Включить сбор [покрытия кода][code coverage].
    **По умолчанию:** `false`.
  * `coverageExcludeGlobs` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Исключить файлы из покрытия
    по glob-шаблону (абсолютные и относительные пути).
    Учитывается только при `coverage: true`.
    Если заданы и `coverageExcludeGlobs`, и `coverageIncludeGlobs`,
    в отчёт попадают файлы, удовлетворяющие **обоим** условиям.
    **По умолчанию:** `undefined`.
  * `coverageIncludeGlobs` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Явно включить файлы в покрытие
    по glob-шаблону (абсолютные и относительные пути).
    Учитывается только при `coverage: true`.
    Если заданы и `coverageExcludeGlobs`, и `coverageIncludeGlobs`,
    в отчёт попадают файлы, удовлетворяющие **обоим** условиям.
    **По умолчанию:** `undefined`.
  * `lineCoverage` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальный процент покрытых строк. Если покрытие
    ниже порога, процесс завершится с кодом `1`.
    **По умолчанию:** `0`.
  * `branchCoverage` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальный процент покрытых ветвлений. Если покрытие
    ниже порога, процесс завершится с кодом `1`.
    **По умолчанию:** `0`.
  * `functionCoverage` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Минимальный процент покрытых функций. Если покрытие
    ниже порога, процесс завершится с кодом `1`.
    **По умолчанию:** `0`.
  * `env` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Переменные окружения для процесса с тестами.
    Несовместимо с `isolation='none'`. Переменные заменяют значения основного процесса и не сливаются с `process.env`.
    **По умолчанию:** `process.env`.
* Возвращает: [`<TestsStream>`](test.md)

**Примечание:** `shard` используется для горизонтального распараллеливания прогона между
    машинами или процессами, в том числе на больших наборах в разных средах.
    Несовместим с режимом `watch`, который рассчитан на быстрые итерации с автоматическим
    перезапуском тестов при изменении файлов.

=== "MJS"

    ```js
    import { tap } from 'node:test/reporters';
    import { run } from 'node:test';
    import process from 'node:process';
    import path from 'node:path';
    
    run({ files: [path.resolve('./tests/test.js')] })
     .on('test:fail', () => {
       process.exitCode = 1;
     })
     .compose(tap)
     .pipe(process.stdout);
    ```

=== "CJS"

    ```js
    const { tap } = require('node:test/reporters');
    const { run } = require('node:test');
    const path = require('node:path');
    
    run({ files: [path.resolve('./tests/test.js')] })
     .on('test:fail', () => {
       process.exitCode = 1;
     })
     .compose(tap)
     .pipe(process.stdout);
    ```

## `suite([name][, options][, fn])`

<!-- YAML
added:
  - v22.0.0
  - v20.13.0
-->

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя набора, отображаемое в отчёте о тестах.
  **По умолчанию:** свойство `name` у `fn` или `'<anonymous>'`, если у `fn`
  нет имени.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры набора.
  Поддерживаются те же опции, что у `test([name][, options][, fn])`.
* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция набора с вложенными тестами и
  наборами. Первый аргумент — объект [`SuiteContext`][`SuiteContext`].
  **По умолчанию:** пустая функция.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Немедленно выполняется с `undefined`.

Функция `suite()` импортируется из модуля `node:test`.

## `suite.skip([name][, options][, fn])`

<!-- YAML
added:
  - v22.0.0
  - v20.13.0
-->

Сокращение для пропуска набора. То же, что
[`suite([name], { skip: true }[, fn])`][suite options].

## `suite.todo([name][, options][, fn])`

<!-- YAML
added:
  - v22.0.0
  - v20.13.0
-->

Сокращение для пометки набора как `TODO`. То же, что
[`suite([name], { todo: true }[, fn])`][suite options].

## `suite.only([name][, options][, fn])`

<!-- YAML
added:
  - v22.0.0
  - v20.13.0
-->

Сокращение для пометки набора как `only`. То же, что
[`suite([name], { only: true }[, fn])`][suite options].

## `test([name][, options][, fn])`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
changes:
  - version:
    - v20.2.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47909
    description: Добавлены сокращения skip, todo и only.
  - version:
    - v18.8.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/43554
    description: Добавлена опция `signal`.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43505
    description: Добавлена опция `timeout`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.2.0, v18.17.0 | Добавлены сокращения «skip», «todo» и «only». |
    | v18.8.0, v16.18.0 | Добавьте опцию «сигнал». |
    | v18.7.0, v16.17.0 | Добавьте опцию «тайм-аут». |

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста, отображаемое в отчёте.
  **По умолчанию:** свойство `name` у `fn` или `'<anonymous>'`, если у `fn`
  нет имени.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры теста. Поддерживаются следующие
  свойства:
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если указано число,
    столько тестов выполняется асинхронно (по-прежнему в одном потоке цикла событий).
    Если `true`, все запланированные асинхронные тесты идут параллельно в рамках
    потока. Если `false` — по одному тесту за раз.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `false`.
  * `expectFailure` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Если истинно, от теста
    ожидается провал. Непустая строка показывается в отчёте как причина ожидаемого провала.
    Если переданы напрямую [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    (без обёртки `{ match: … }`), тест считается пройденным только при совпадении выброшенной ошибки
    по правилам [`assert.throws`][`assert.throws`]. Чтобы задать и причину, и проверку, передайте объект
    с полями `label` (строка) и `match` (RegExp, Function, Object или Error).
    **По умолчанию:** `false`.
  * `only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если истинно и контекст настроен на выполнение только
    тестов с `only`, этот тест выполняется; иначе пропускается.
    **По умолчанию:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся тест.
  * `skip` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если истинно, тест пропускается. Строка
    показывается в отчёте как причина пропуска.
    **По умолчанию:** `false`.
  * `todo` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если истинно, тест помечается как `TODO`. Строка
    показывается в отчёте как причина статуса `TODO`.
    **По умолчанию:** `false`.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд тест считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.
  * `plan` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидаемое число утверждений и подтестов в тесте.
    Если фактическое число не совпадает с планом, тест проваливается.
    **По умолчанию:** `undefined`.
* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Тестируемая функция. Первый аргумент —
  объект [`TestContext`][`TestContext`]. При колбэк-стиле второй аргумент — колбэк.
  **По умолчанию:** пустая функция.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется с `undefined` после
  завершения теста или сразу, если тест выполняется внутри набора.

`test()` — это значение, импортируемое из модуля `test`. Каждый вызов регистрирует тест в [TestsStream](test.md).

Объект `TestContext`, передаваемый в `fn`, используется для действий в контексте текущего теста:
пропуск, диагностика, подтесты и т. д.

`test()` возвращает `Promise`, который выполняется по завершении теста;
внутри набора он может выполниться сразу.
Для тестов верхнего уровня возвращаемое значение часто можно игнорировать.
Для подтестов `await` нужен, чтобы родитель не завершился раньше и не отменил подтест
(см. пример).

```js
test('top level test', async (t) => {
  // setTimeout() в подтесте может пережить родителя, если убрать await на следующей строке:
  // после завершения родителя незавершённые подтесты отменяются.
  await t.test('longer running subtest', async (t) => {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, 1000);
    });
  });
});
```

Опция `timeout` завершает тест с провалом по истечении `timeout` мс, но не является
надёжным способом отмены: выполняющийся тест может блокировать поток и помешать срабатыванию отмены.

## `test.skip([name][, options][, fn])`

Сокращение для пропуска теста — то же, что
[`test([name], { skip: true }[, fn])`][it options].

## `test.todo([name][, options][, fn])`

Сокращение для пометки теста как `TODO` — то же, что
[`test([name], { todo: true }[, fn])`][it options].

## `test.only([name][, options][, fn])`

Сокращение для пометки теста как `only` — то же, что
[`test([name], { only: true }[, fn])`][it options].

## `describe([name][, options][, fn])`

Псевдоним [`suite()`][`suite()`].

Функция `describe()` импортируется из модуля `node:test`.

## `describe.skip([name][, options][, fn])`

Сокращение для пропуска набора — то же, что
[`describe([name], { skip: true }[, fn])`][describe options].

## `describe.todo([name][, options][, fn])`

Сокращение для пометки набора как `TODO` — то же, что
[`describe([name], { todo: true }[, fn])`][describe options].

## `describe.only([name][, options][, fn])`

<!-- YAML
added:
  - v19.8.0
  - v18.15.0
-->

Сокращение для пометки набора как `only` — то же, что
[`describe([name], { only: true }[, fn])`][describe options].

## `it([name][, options][, fn])`

<!-- YAML
added:
  - v18.6.0
  - v16.17.0
changes:
  - version:
    - v19.8.0
    - v18.16.0
    pr-url: https://github.com/nodejs/node/pull/46889
    description: Вызов `it()` теперь эквивалентен вызову `test()`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v19.8.0, v18.16.0 | Вызов `it()` теперь эквивалентен вызову `test()`. |

Псевдоним [`test()`][`test()`].

Функция `it()` импортируется из модуля `node:test`.

## `it.skip([name][, options][, fn])`

Сокращение для пропуска теста — то же, что
[`it([name], { skip: true }[, fn])`][it options].

## `it.todo([name][, options][, fn])`

Сокращение для пометки теста как `TODO` — то же, что
[`it([name], { todo: true }[, fn])`][it options].

## `it.only([name][, options][, fn])`

<!-- YAML
added:
  - v19.8.0
  - v18.15.0
-->

Сокращение для пометки теста как `only` — то же, что
[`it([name], { only: true }[, fn])`][it options].

## `before([fn][, options])`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука.
  При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука. Поддерживаются следующие
  свойства:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук, выполняемый перед набором тестов.

```js
describe('tests', async () => {
  before(() => console.log('about to run some test'));
  it('is a subtest', () => {
    // здесь проверки
  });
});
```

## `after([fn][, options])`

<!-- YAML
added:
 - v18.8.0
 - v16.18.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука.
  При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука. Поддерживаются следующие
  свойства:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук, выполняемый после набора тестов.

```js
describe('tests', async () => {
  after(() => console.log('finished running tests'));
  it('is a subtest', () => {
    // здесь проверки
  });
});
```

**Примечание:** хук `after` выполняется гарантированно,
даже если тесты в наборе провалились.

## `beforeEach([fn][, options])`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука.
  При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука. Поддерживаются следующие
  свойства:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук, выполняемый перед каждым тестом в текущем наборе.

```js
describe('tests', async () => {
  beforeEach(() => console.log('about to run a test'));
  it('is a subtest', () => {
    // здесь проверки
  });
});
```

## `afterEach([fn][, options])`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука.
  При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука. Поддерживаются следующие
  свойства:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук, выполняемый после каждого теста в текущем наборе.
Хук `afterEach()` выполняется даже при провале теста.

```js
describe('tests', async () => {
  afterEach(() => console.log('finished running a test'));
  it('is a subtest', () => {
    // здесь проверки
  });
});
```

## `assert`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

Объект, методы которого настраивают доступные утверждения для объектов `TestContext`
в текущем процессе. По умолчанию доступны методы из `node:assert` и функции снимков.

Ту же конфигурацию можно задать всем файлам через общий модуль,
подключаемый `--require` или `--import`.

### `assert.register(name, fn)`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

Определяет новую функцию утверждения с заданным именем. Если утверждение с таким именем уже есть, оно перезаписывается.

## `snapshot`

<!-- YAML
added: v22.3.0
-->

Объект для настройки параметров снимков по умолчанию в текущем процессе.
Общая конфигурация для всех файлов — через модуль с `--require` или `--import`.

### `snapshot.setDefaultSnapshotSerializers(serializers)`

<!-- YAML
added: v22.3.0
-->

* `serializers` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив синхронных функций — сериализаторы по умолчанию
  для тестов со снимками.

Задаёт механизм сериализации по умолчанию для раннера. По умолчанию раннер вызывает
`JSON.stringify(value, null, 2)` для переданного значения. У `JSON.stringify()` есть
ограничения на циклические структуры и типы данных. Для более надёжной сериализации
используйте эту функцию.

### `snapshot.setResolveSnapshotPath(fn)`

<!-- YAML
added: v22.3.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Функция вычисления пути к файлу снимка.
  Единственный аргумент — путь к тестовому файлу. Если тест не привязан к файлу (например в REPL),
  аргумент `undefined`. `fn()` должна вернуть строку с путём к файлу снимка.

Задаёт расположение файла снимка. По умолчанию имя файла снимка совпадает с точкой входа
с расширением `.snapshot`.

## Class: `MockFunctionContext`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

Класс `MockFunctionContext` позволяет просматривать и менять поведение подмен,
созданных через API [`MockTracker`][`MockTracker`].

### `ctx.calls`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* Тип: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Геттер возвращает копию внутреннего массива вызовов подмены.
Каждый элемент — объект со свойствами:

* `arguments` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Аргументы вызова подменённой функции.
* `error` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Если подменённая функция выбросила исключение, здесь значение
  исключения. **По умолчанию:** `undefined`.
* `result` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Возвращённое подменённой функцией значение.
* `stack` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект `Error`, по стеку можно определить место
  вызова подмены.
* `target` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | undefined Если подмена — конструктор, здесь класс
  создаваемого экземпляра; иначе `undefined`.
* `this` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение `this` при вызове подмены.

### `ctx.callCount()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число вызовов этой подмены.

Эффективнее, чем `ctx.calls.length`: `ctx.calls` — геттер, создающий копию внутреннего массива.

### `ctx.mockImplementation(implementation)`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `implementation` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Новая реализация подмены.

Меняет поведение существующей подмены.

Пример: создаётся подмена через `t.mock.fn()`, вызывается функция, затем подменяется реализация.

```js
test('changes a mock behavior', (t) => {
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

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `implementation` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Реализация для вызова с номером `onCall`.
* `onCall` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер вызова, на котором применить `implementation`. Если
  такой вызов уже произошёл, выбрасывается исключение.
  **По умолчанию:** номер следующего вызова.

Меняет поведение подмены только для одного вызова. После вызова с номером `onCall` подмена возвращается к
поведению, которое было бы без `mockImplementationOnce()`.

Пример: подмена через `t.mock.fn()`, смена реализации на один следующий вызов, затем прежнее поведение.

```js
test('changes a mock behavior once', (t) => {
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

<!-- YAML
added:
  - v19.3.0
  - v18.13.0
-->

Сбрасывает историю вызовов подменённой функции.

### `ctx.restore()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

Восстанавливает исходную реализацию подменённой функции. Подмену по-прежнему можно вызывать.

## Class: `MockModuleContext`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

> Стабильность: 1.0 — ранняя разработка

Класс `MockModuleContext` управляет поведением подмен модулей, созданных через API [`MockTracker`][`MockTracker`].

### `ctx.restore()`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

Восстанавливает исходную реализацию подменённого модуля.

## Class: `MockPropertyContext`

<!-- YAML
added:
  - v24.3.0
  - v22.20.0
-->

Класс `MockPropertyContext` позволяет просматривать и менять поведение подмен свойств, созданных через API [`MockTracker`][`MockTracker`].

### `ctx.accesses`

* Тип: [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

Геттер возвращает копию внутреннего массива обращений (чтение/запись) к подменённому свойству.
Каждый элемент — объект со свойствами:

* `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) `'get'` или `'set'` — тип обращения.
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Прочитанное (`'get'`) или записанное (`'set'`) значение.
* `stack` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Объект `Error` для определения места обращения к подмене.

### `ctx.accessCount()`

* Возвращает: [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число обращений к свойству (чтение и запись).

Эффективнее, чем `ctx.accesses.length`: `ctx.accesses` — геттер с копией внутреннего массива.

### `ctx.mockImplementation(value)`

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Новое значение подменённого свойства.

Меняет значение, возвращаемое геттером подменённого свойства.

### `ctx.mockImplementationOnce(value[, onAccess])`

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение для обращения с номером `onAccess`.
* `onAccess` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер обращения, на котором применить `value`. Если
  такое обращение уже было, выбрасывается исключение.
  **По умолчанию:** номер следующего обращения.

Меняет поведение подмены только для одного обращения. После обращения с номером `onAccess` подмена возвращается к
поведению без `mockImplementationOnce()`.

Пример: подмена через `t.mock.property()`, смена значения на одно следующее обращение, затем прежнее поведение.

```js
test('changes a mock behavior once', (t) => {
  const obj = { foo: 1 };

  const prop = t.mock.property(obj, 'foo', 5);

  assert.strictEqual(obj.foo, 5);
  prop.mock.mockImplementationOnce(25);
  assert.strictEqual(obj.foo, 25);
  assert.strictEqual(obj.foo, 5);
});
```

#### Ограничение

Для согласованности с остальным API подмен эта функция считает и чтение, и запись свойства обращениями.
Если запись происходит на том же индексе обращения, значение «на один раз» расходуется на операцию `set`,
и подменённое свойство принимает это значение. Это может давать неожиданный результат, если «на один раз»
предполагалось только для чтения.

### `ctx.resetAccesses()`

Сбрасывает историю обращений к подменённому свойству.

### `ctx.restore()`

Восстанавливает исходное поведение подменённого свойства. Подмену по-прежнему можно использовать.

## Class: `MockTracker`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

Класс `MockTracker` управляет подменами. Модуль раннера экспортирует `mock` верхнего уровня — экземпляр `MockTracker`.
У каждого теста свой экземпляр в свойстве контекста `mock`.

### `mock.fn([original[, implementation]][, options])`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `original` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Необязательная исходная функция для подмены.
  **По умолчанию:** пустая функция.
* `implementation` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Необязательная реализация для `original`. Удобно для подмен с
  заданным числом вызовов с одним поведением и последующим восстановлением
  `original`. **По умолчанию:** функция из `original`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры подмены функции. Поддерживаются
  свойства:
  * `times` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз подмена использует поведение
    `implementation`. После `times` вызовов автоматически восстанавливается поведение `original`.
    Должно быть целым больше нуля. **По умолчанию:** `Infinity`.
* Возвращает: [`<Proxy>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) Подменённая функция с особым свойством
  `mock` — экземпляром [`MockFunctionContext`][`MockFunctionContext`] для
  проверки и смены поведения.

Создаёт подмену функции.

Пример: счётчик увеличивается на 1 за вызов; опция `times` задаёт два первых вызова с прибавлением 2.

```js
test('mocks a counting function', (t) => {
  let cnt = 0;

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

<!-- YAML
added:
  - v19.3.0
  - v18.13.0
-->

Синтаксический сахар для [`MockTracker.method`][`MockTracker.method`] с `options.getter`
равным `true`.

### `mock.method(object, methodName[, implementation][, options])`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `object` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, метод которого подменяется.
* `methodName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя метода на `object`.
  Если `object[methodName]` не функция, выбрасывается ошибка.
* `implementation` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Необязательная реализация для `object[methodName]`. **По умолчанию:** исходный метод
  `object[methodName]`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры подмены метода. Поддерживаются
  свойства:
  * `getter` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `object[methodName]` трактуется как геттер.
    Несовместимо с опцией `setter`. **По умолчанию:** false.
  * `setter` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `true`, `object[methodName]` трактуется как сеттер.
    Несовместимо с опцией `getter`. **По умолчанию:** false.
  * `times` [`<integer>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз подмена использует поведение
    `implementation`. После `times` вызовов восстанавливается исходное поведение.
    Должно быть целым больше нуля. **По умолчанию:** `Infinity`.
* Возвращает: [`<Proxy>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) Подменённый метод с особым свойством
  `mock` — экземпляром [`MockFunctionContext`][`MockFunctionContext`].

Создаёт подмену существующего метода объекта. Ниже — пример подмены метода.

```js
test('spies on an object method', (t) => {
  const number = {
    value: 5,
    subtract(a) {
      return this.value - a;
    },
  };

  t.mock.method(number, 'subtract');
  assert.strictEqual(number.subtract.mock.callCount(), 0);
  assert.strictEqual(number.subtract(3), 2);
  assert.strictEqual(number.subtract.mock.callCount(), 1);

  const call = number.subtract.mock.calls[0];

  assert.deepStrictEqual(call.arguments, [3]);
  assert.strictEqual(call.result, 2);
  assert.strictEqual(call.error, undefined);
  assert.strictEqual(call.target, undefined);
  assert.strictEqual(call.this, number);
});
```

### `mock.module(specifier[, options])`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
changes:
  - version:
    - v24.0.0
    - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/58007
    description: Поддержка JSON-модулей.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Поддержка модулей JSON. |

> Стабильность: 1.0 — ранняя разработка

* `specifier` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<URL>`](url.md#the-whatwg-url-api) Идентификатор подменяемого модуля.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры подмены модуля. Поддерживаются
  свойства:
  * `cache` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если `false`, каждый вызов `require()` или `import()`
    создаёт новую подмену. Если `true`, последующие вызовы возвращают ту же подмену,
    модуль попадает в кэш CommonJS.
    **По умолчанию:** false.
  * `exports` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные экспорты подмены. Свойство `default`, если
    задано, — экспорт по умолчанию; остальные собственные перечислимые свойства — именованные экспорты.
    **Нельзя использовать вместе с `defaultExport` или `namedExports`.**
    * Для CommonJS или встроенного модуля `exports.default` задаёт значение `module.exports`.
    * Если для CommonJS или встроенной подмены нет `exports.default`,
      `module.exports` — пустой объект.
    * Если есть именованные экспорты и экспорт по умолчанию не объект, при использовании как CommonJS или встроенного модуля подмена выбросит исключение.
  * `defaultExport` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательный экспорт по умолчанию.
    Если не задан, у ESM-подмены нет default-экспорта. Для CommonJS или встроенного модуля значение идёт в
    `module.exports`. Если не задано, для CJS и встроенных подмен `module.exports` — пустой объект.
    **Нельзя использовать вместе с `options.exports`.**
    Устарело, будет удалено; предпочтительно `options.exports.default`.
  * `namedExports` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательный объект ключей и значений для именованных экспортов. Для CommonJS или
    встроенного модуля значения копируются в `module.exports`. Если есть именованные экспорты и экспорт по умолчанию не объект,
    при использовании как CJS или встроенного модуля подмена выбросит исключение.
    **Нельзя использовать вместе с `options.exports`.**
    Устарело; предпочтительно `options.exports`.
* Возвращает: [`<MockModuleContext>`](test.md) Объект для управления подменой.

Подменяет экспорты модулей ECMAScript, CommonJS, JSON и встроенных модулей Node.js. Ссылки на оригинальный модуль, созданные до подмены, не меняются. Для подмены модулей Node.js нужно запускать с флагом
[`--experimental-test-module-mocks`][`--experimental-test-module-mocks`].

**Примечание:** [хуки настройки модулей][module customization hooks], зарегистрированные через **синхронный** API, влияют на разрешение `specifier` в `mock.module`. Хуки **асинхронного**
API сейчас игнорируются (загрузчик раннера синхронный, многократные цепочки загрузки в Node не поддерживаются).

Ниже — пример подмены модуля.

```js
test('mocks a builtin module in both module systems', async (t) => {
  // Create a mock of 'node:readline' with a named export named 'foo', which
  // does not exist in the original 'node:readline' module.
  const mock = t.mock.module('node:readline', {
    exports: { foo: () => 42 },
  });

  let esmImpl = await import('node:readline');
  let cjsImpl = require('node:readline');

  // cursorTo() is an export of the original 'node:readline' module.
  assert.strictEqual(esmImpl.cursorTo, undefined);
  assert.strictEqual(cjsImpl.cursorTo, undefined);
  assert.strictEqual(esmImpl.fn(), 42);
  assert.strictEqual(cjsImpl.fn(), 42);

  mock.restore();

  // The mock is restored, so the original builtin module is returned.
  esmImpl = await import('node:readline');
  cjsImpl = require('node:readline');

  assert.strictEqual(typeof esmImpl.cursorTo, 'function');
  assert.strictEqual(typeof cjsImpl.cursorTo, 'function');
  assert.strictEqual(esmImpl.fn, undefined);
  assert.strictEqual(cjsImpl.fn, undefined);
});
```

### `mock.property(object, propertyName[, value])`

<!-- YAML
added:
  - v24.3.0
  - v22.20.0
-->

* `object` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект, свойство которого подменяется.
* `propertyName` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<symbol>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) Имя свойства на `object`.
* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Необязательное значение подмены для
  `object[propertyName]`. **По умолчанию:** исходное значение свойства.
* Возвращает: [`<Proxy>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) Прокси к объекту с подменённым свойством; у него есть
  свойство `mock` — экземпляр [`MockPropertyContext`][`MockPropertyContext`] для
  проверки и смены поведения.

Создаёт подмену значения свойства: можно отслеживать и управлять чтением и записью и восстановить исходное значение.

```js
test('mocks a property value', (t) => {
  const obj = { foo: 42 };
  const prop = t.mock.property(obj, 'foo', 100);

  assert.strictEqual(obj.foo, 100);
  assert.strictEqual(prop.mock.accessCount(), 1);
  assert.strictEqual(prop.mock.accesses[0].type, 'get');
  assert.strictEqual(prop.mock.accesses[0].value, 100);

  obj.foo = 200;
  assert.strictEqual(prop.mock.accessCount(), 2);
  assert.strictEqual(prop.mock.accesses[1].type, 'set');
  assert.strictEqual(prop.mock.accesses[1].value, 200);

  prop.mock.restore();
  assert.strictEqual(obj.foo, 42);
});
```

### `mock.reset()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

Восстанавливает исходное поведение всех подмен, созданных этим `MockTracker`, и отвязывает их от
экземпляра `MockTracker`. Отвязанные подмены по-прежнему вызываемы, но этот
`MockTracker` больше не может их сбрасывать или иначе управлять ими.

После каждого теста эта функция вызывается для `MockTracker` контекста. При активном использовании глобального `MockTracker` рекомендуется вызывать её вручную.

### `mock.restoreAll()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

Восстанавливает исходное поведение всех подмен этого `MockTracker`. В отличие от `mock.reset()`, `mock.restoreAll()` не
отвязывает подмены от `MockTracker`.

### `mock.setter(object, methodName[, implementation][, options])`

<!-- YAML
added:
  - v19.3.0
  - v18.13.0
-->

Синтаксический сахар для [`MockTracker.method`][`MockTracker.method`] с `options.setter`
равным `true`.

## Class: `MockTimers`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
changes:
  - version: v23.1.0
    pr-url: https://github.com/nodejs/node/pull/55398
    description: MockTimers теперь стабильны.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.1.0 | Мок-таймеры теперь стабильны. |

Подмена таймеров — распространённый приём тестирования: имитировать и управлять
`setInterval` и `setTimeout` без реального ожидания.

`MockTimers` также может подменять объект `Date`.

У [`MockTracker`][`MockTracker`] есть экспорт верхнего уровня `timers` —
экземпляр `MockTimers`.

### `timers.enable([enableOptions])`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
changes:
  - version:
    - v21.2.0
    - v20.11.0
    pr-url: https://github.com/nodejs/node/pull/48638
    description: Параметры обновлены до объекта опций с доступными API и начальной эпохой по умолчанию.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v21.2.0, v20.11.0 | Обновлены параметры, теперь они представляют собой объект опции с доступными API и начальной эпохой по умолчанию. |

Включает подмену указанных таймеров.

* `enableOptions` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры включения подмены таймеров. Поддерживаются
  свойства:
  * `apis` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Необязательный массив подменяемых API.
    Допустимые значения: `'setInterval'`, `'setTimeout'`, `'setImmediate'`
    и `'Date'`. **По умолчанию:** `['setInterval', 'setTimeout', 'setImmediate', 'Date']`.
    Если массив не передан, по умолчанию подменяются все связанные с временем API (`'setInterval'`, `'clearInterval'`,
    `'setTimeout'`, `'clearTimeout'`, `'setImmediate'`, `'clearImmediate'` и
    `'Date'`).
  * `now` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<Date>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) Необязательное начальное время в миллисекундах или объект `Date` для
    `Date.now()`. **По умолчанию:** `0`.

**Примечание:** при подмене конкретного таймера неявно подменяется и соответствующая функция очистки.

**Примечание:** подмена `Date` влияет на подменённые таймеры — общие внутренние часы.

Пример без задания начального времени:

=== "MJS"

    ```js
    import { mock } from 'node:test';
    mock.timers.enable({ apis: ['setInterval'] });
    ```

=== "CJS"

    ```js
    const { mock } = require('node:test');
    mock.timers.enable({ apis: ['setInterval'] });
    ```

В примере подменяется `setInterval` и неявно `clearInterval`. Подменяются только `setInterval`
и `clearInterval` из [node:timers](./timers.md),
[node:timers/promises](./timers.md#timers-promises-api) и
`globalThis`.

Пример с заданным начальным временем

=== "MJS"

    ```js
    import { mock } from 'node:test';
    mock.timers.enable({ apis: ['Date'], now: 1000 });
    ```

=== "CJS"

    ```js
    const { mock } = require('node:test');
    mock.timers.enable({ apis: ['Date'], now: 1000 });
    ```

Пример с объектом `Date` как начальным временем

=== "MJS"

    ```js
    import { mock } from 'node:test';
    mock.timers.enable({ apis: ['Date'], now: new Date() });
    ```

=== "CJS"

    ```js
    const { mock } = require('node:test');
    mock.timers.enable({ apis: ['Date'], now: new Date() });
    ```

Если вызвать `mock.timers.enable()` без параметров:

Подменяются все таймеры (`'setInterval'`, `'clearInterval'`, `'setTimeout'`, `'clearTimeout'`,
`'setImmediate'` и `'clearImmediate'`). Функции `setInterval`,
`clearInterval`, `setTimeout`, `clearTimeout`, `setImmediate` и
`clearImmediate` из `node:timers`, `node:timers/promises` и
`globalThis`, а также глобальный объект `Date`.

### `timers.reset()`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
-->

Восстанавливает исходное поведение всех подмен, созданных этим экземпляром `MockTimers`, и отвязывает их
от `MockTracker`.

**Примечание:** после каждого теста эта функция вызывается для `MockTracker` контекста.

=== "MJS"

    ```js
    import { mock } from 'node:test';
    mock.timers.reset();
    ```

=== "CJS"

    ```js
    const { mock } = require('node:test');
    mock.timers.reset();
    ```

### `timers[Symbol.dispose]()`

Вызывает `timers.reset()`.

### `timers.tick([milliseconds])`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
-->

Сдвигает время для всех подменённых таймеров.

* `milliseconds` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) На сколько миллисекунд
  сдвинуть таймеры. **По умолчанию:** `1`.

**Примечание:** в отличие от `setTimeout` в Node.js здесь допустимы только положительные числа. Отрицательные задержки в Node поддерживаются лишь для совместимости с вебом.

Ниже подменяется `setTimeout`, затем `.tick` сдвигает время и срабатывают ожидающие таймеры.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
    
      context.mock.timers.enable({ apis: ['setTimeout'] });
    
      setTimeout(fn, 9999);
    
      assert.strictEqual(fn.mock.callCount(), 0);
    
      // Advance in time
      context.mock.timers.tick(9999);
    
      assert.strictEqual(fn.mock.callCount(), 1);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
      context.mock.timers.enable({ apis: ['setTimeout'] });
    
      setTimeout(fn, 9999);
      assert.strictEqual(fn.mock.callCount(), 0);
    
      // Advance in time
      context.mock.timers.tick(9999);
    
      assert.strictEqual(fn.mock.callCount(), 1);
    });
    ```

Функцию `.tick` можно вызывать несколько раз подряд.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
      context.mock.timers.enable({ apis: ['setTimeout'] });
      const nineSecs = 9000;
      setTimeout(fn, nineSecs);
    
      const threeSeconds = 3000;
      context.mock.timers.tick(threeSeconds);
      context.mock.timers.tick(threeSeconds);
      context.mock.timers.tick(threeSeconds);
    
      assert.strictEqual(fn.mock.callCount(), 1);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
      context.mock.timers.enable({ apis: ['setTimeout'] });
      const nineSecs = 9000;
      setTimeout(fn, nineSecs);
    
      const threeSeconds = 3000;
      context.mock.timers.tick(threeSeconds);
      context.mock.timers.tick(threeSeconds);
      context.mock.timers.tick(threeSeconds);
    
      assert.strictEqual(fn.mock.callCount(), 1);
    });
    ```

Сдвиг времени через `.tick` также двигает любой объект `Date`,
созданный после включения подмены (если подменялся и `Date`).

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
    
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      setTimeout(fn, 9999);
    
      assert.strictEqual(fn.mock.callCount(), 0);
      assert.strictEqual(Date.now(), 0);
    
      // Advance in time
      context.mock.timers.tick(9999);
      assert.strictEqual(fn.mock.callCount(), 1);
      assert.strictEqual(Date.now(), 9999);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    
      setTimeout(fn, 9999);
      assert.strictEqual(fn.mock.callCount(), 0);
      assert.strictEqual(Date.now(), 0);
    
      // Advance in time
      context.mock.timers.tick(9999);
      assert.strictEqual(fn.mock.callCount(), 1);
      assert.strictEqual(Date.now(), 9999);
    });
    ```

#### Функции очистки

Как уже сказано, все функции очистки таймеров (`clearTimeout`, `clearInterval` и
`clearImmediate`) подменяются неявно. Пример с `setTimeout`:

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
    
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout'] });
      const id = setTimeout(fn, 9999);
    
      // Implicitly mocked as well
      clearTimeout(id);
      context.mock.timers.tick(9999);
    
      // As that setTimeout was cleared the mock function will never be called
      assert.strictEqual(fn.mock.callCount(), 0);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', (context) => {
      const fn = context.mock.fn();
    
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout'] });
      const id = setTimeout(fn, 9999);
    
      // Implicitly mocked as well
      clearTimeout(id);
      context.mock.timers.tick(9999);
    
      // As that setTimeout was cleared the mock function will never be called
      assert.strictEqual(fn.mock.callCount(), 0);
    });
    ```

#### Модули таймеров Node.js

После включения подмены таймеров затрагиваются [node:timers](./timers.md),
[node:timers/promises](./timers.md#timers-promises-api)
и глобальные таймеры Node.js:

**Примечание:** деструктуризация вроде
`import [setTimeout](timers.md#settimeoutcallback-delay-args) from 'node:timers'` пока
не поддерживается этой API.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    import nodeTimers from 'node:timers';
    import nodeTimersPromises from 'node:timers/promises';
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', async (context) => {
      const globalTimeoutObjectSpy = context.mock.fn();
      const nodeTimerSpy = context.mock.fn();
      const nodeTimerPromiseSpy = context.mock.fn();
    
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout'] });
      setTimeout(globalTimeoutObjectSpy, 9999);
      nodeTimers.setTimeout(nodeTimerSpy, 9999);
    
      const promise = nodeTimersPromises.setTimeout(9999).then(nodeTimerPromiseSpy);
    
      // Advance in time
      context.mock.timers.tick(9999);
      assert.strictEqual(globalTimeoutObjectSpy.mock.callCount(), 1);
      assert.strictEqual(nodeTimerSpy.mock.callCount(), 1);
      await promise;
      assert.strictEqual(nodeTimerPromiseSpy.mock.callCount(), 1);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    const nodeTimers = require('node:timers');
    const nodeTimersPromises = require('node:timers/promises');
    
    test('mocks setTimeout to be executed synchronously without having to actually wait for it', async (context) => {
      const globalTimeoutObjectSpy = context.mock.fn();
      const nodeTimerSpy = context.mock.fn();
      const nodeTimerPromiseSpy = context.mock.fn();
    
      // При необходимости выберите, что подменять
      context.mock.timers.enable({ apis: ['setTimeout'] });
      setTimeout(globalTimeoutObjectSpy, 9999);
      nodeTimers.setTimeout(nodeTimerSpy, 9999);
    
      const promise = nodeTimersPromises.setTimeout(9999).then(nodeTimerPromiseSpy);
    
      // Advance in time
      context.mock.timers.tick(9999);
      assert.strictEqual(globalTimeoutObjectSpy.mock.callCount(), 1);
      assert.strictEqual(nodeTimerSpy.mock.callCount(), 1);
      await promise;
      assert.strictEqual(nodeTimerPromiseSpy.mock.callCount(), 1);
    });
    ```

В Node.js `setInterval` из [node:timers/promises](./timers.md#timers-promises-api)
— это `AsyncGenerator`; он тоже поддерживается этой API:

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    import nodeTimersPromises from 'node:timers/promises';
    test('should tick five times testing a real use case', async (context) => {
      context.mock.timers.enable({ apis: ['setInterval'] });
    
      const expectedIterations = 3;
      const interval = 1000;
      const startedAt = Date.now();
      async function run() {
        const times = [];
        for await (const time of nodeTimersPromises.setInterval(interval, startedAt)) {
          times.push(time);
          if (times.length === expectedIterations) break;
        }
        return times;
      }
    
      const r = run();
      context.mock.timers.tick(interval);
      context.mock.timers.tick(interval);
      context.mock.timers.tick(interval);
    
      const timeResults = await r;
      assert.strictEqual(timeResults.length, expectedIterations);
      for (let it = 1; it < expectedIterations; it++) {
        assert.strictEqual(timeResults[it - 1], startedAt + (interval * it));
      }
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    const nodeTimersPromises = require('node:timers/promises');
    test('should tick five times testing a real use case', async (context) => {
      context.mock.timers.enable({ apis: ['setInterval'] });
    
      const expectedIterations = 3;
      const interval = 1000;
      const startedAt = Date.now();
      async function run() {
        const times = [];
        for await (const time of nodeTimersPromises.setInterval(interval, startedAt)) {
          times.push(time);
          if (times.length === expectedIterations) break;
        }
        return times;
      }
    
      const r = run();
      context.mock.timers.tick(interval);
      context.mock.timers.tick(interval);
      context.mock.timers.tick(interval);
    
      const timeResults = await r;
      assert.strictEqual(timeResults.length, expectedIterations);
      for (let it = 1; it < expectedIterations; it++) {
        assert.strictEqual(timeResults[it - 1], startedAt + (interval * it));
      }
    });
    ```

### `timers.runAll()`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
-->

Немедленно выполняет все ожидающие подменённые таймеры. Если подменён и объект `Date`,
время `Date` сдвигается до момента самого позднего таймера.

Ниже все ожидающие таймеры срабатывают сразу, без задержки.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('runAll functions following the given order', (context) => {
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const results = [];
      setTimeout(() => results.push(1), 9999);
    
      // Notice that if both timers have the same timeout,
      // the order of execution is guaranteed
      setTimeout(() => results.push(3), 8888);
      setTimeout(() => results.push(2), 8888);
    
      assert.deepStrictEqual(results, []);
    
      context.mock.timers.runAll();
      assert.deepStrictEqual(results, [3, 2, 1]);
      // The Date object is also advanced to the furthest timer's time
      assert.strictEqual(Date.now(), 9999);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('runAll functions following the given order', (context) => {
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const results = [];
      setTimeout(() => results.push(1), 9999);
    
      // Notice that if both timers have the same timeout,
      // the order of execution is guaranteed
      setTimeout(() => results.push(3), 8888);
      setTimeout(() => results.push(2), 8888);
    
      assert.deepStrictEqual(results, []);
    
      context.mock.timers.runAll();
      assert.deepStrictEqual(results, [3, 2, 1]);
      // The Date object is also advanced to the furthest timer's time
      assert.strictEqual(Date.now(), 9999);
    });
    ```

**Примечание:** `runAll()` предназначена для срабатывания таймеров в режиме подмены.
На реальные системные часы и таймеры вне подмены не влияет.

### `timers.setTime(milliseconds)`

<!-- YAML
added:
  - v21.2.0
  - v20.11.0
-->

Задаёт текущую метку Unix как опорную для всех подменённых объектов `Date`.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('runAll functions following the given order', (context) => {
      const now = Date.now();
      const setTime = 1000;
      // Date.now is not mocked
      assert.deepStrictEqual(Date.now(), now);
    
      context.mock.timers.enable({ apis: ['Date'] });
      context.mock.timers.setTime(setTime);
      // Date.now is now 1000
      assert.strictEqual(Date.now(), setTime);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('setTime replaces current time', (context) => {
      const now = Date.now();
      const setTime = 1000;
      // Date.now is not mocked
      assert.deepStrictEqual(Date.now(), now);
    
      context.mock.timers.enable({ apis: ['Date'] });
      context.mock.timers.setTime(setTime);
      // Date.now is now 1000
      assert.strictEqual(Date.now(), setTime);
    });
    ```

#### Дата и таймеры вместе

Объекты даты и таймеров связаны. Если вызвать `setTime()` для подменённого `Date`,
уже запланированные `setTimeout` и `setInterval` **не** срабатывают от этого.

Метод `tick` при этом **сдвигает** подменённый объект `Date`.

=== "MJS"

    ```js
    import assert from 'node:assert';
    import { test } from 'node:test';
    
    test('runAll functions following the given order', (context) => {
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const results = [];
      setTimeout(() => results.push(1), 9999);
    
      assert.deepStrictEqual(results, []);
      context.mock.timers.setTime(12000);
      assert.deepStrictEqual(results, []);
      // The date is advanced but the timers don't tick
      assert.strictEqual(Date.now(), 12000);
    });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    const { test } = require('node:test');
    
    test('runAll functions following the given order', (context) => {
      context.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
      const results = [];
      setTimeout(() => results.push(1), 9999);
    
      assert.deepStrictEqual(results, []);
      context.mock.timers.setTime(12000);
      assert.deepStrictEqual(results, []);
      // The date is advanced but the timers don't tick
      assert.strictEqual(Date.now(), 12000);
    });
    ```

## Class: `TestsStream`

<!-- YAML
added:
  - v18.9.0
  - v16.19.0
changes:
  - version:
    - v20.0.0
    - v19.9.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47094
    description: В событиях test:pass и test:fail добавлен тип, когда тест — набор.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v19.9.0, v18.17.0 | добавлен тип событий test:pass и test:fail, когда тест представляет собой набор. |

* Наследует [`<Readable>`](stream.md#readable-streams)

Успешный вызов [`run()`][`run()`] возвращает новый [TestsStream](test.md)
— поток событий о ходе выполнения тестов.
`TestsStream` генерирует события в порядке, связанном с объявлением тестов.

Часть событий гарантированно следует порядку объявления тестов,
другие — порядку фактического выполнения.

### Event: `'test:coverage'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `summary` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Объект с отчётом о покрытии.
    * `files` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив отчётов по файлам. Каждый
      отчёт — объект со схемой:
      * `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Абсолютный путь к файлу.
      * `totalLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего строк.
      * `totalBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего ветвлений.
      * `totalFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего функций.
      * `coveredLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Покрыто строк.
      * `coveredBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Покрыто ветвлений.
      * `coveredFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Покрыто функций.
      * `coveredLinePercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент покрытых строк.
      * `coveredBranchPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент покрытых ветвлений.
      * `coveredFunctionPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент покрытых функций.
      * `functions` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив записей о покрытии функций.
        * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя функции.
        * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Строка объявления функции.
        * `count` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз функция вызывалась.
      * `branches` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив записей о ветвлениях.
        * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Строка объявления ветвления.
        * `count` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз выполнялась ветвь.
      * `lines` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив строк: номер строки и число покрытий.
        * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Номер строки.
        * `count` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Сколько раз строка была исполнена.
    * `thresholds` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Пороги по типам покрытия.
      * `function` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порог по функциям.
      * `branch` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порог по ветвлениям.
      * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порог по строкам.
    * `totals` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Сводка по всем файлам.
      * `totalLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего строк.
      * `totalBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего ветвлений.
      * `totalFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Всего функций.
      * `coveredLineCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Покрыто строк.
      * `coveredBranchCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Покрыто ветвлений.
      * `coveredFunctionCount` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Покрыто функций.
      * `coveredLinePercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент покрытых строк.
      * `coveredBranchPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент покрытых ветвлений.
      * `coveredFunctionPercent` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Процент покрытых функций.
    * `workingDirectory` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Рабочий каталог на начало сбора покрытия.
      Удобно для относительных путей, если тесты меняли `cwd` процесса Node.js.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.

Генерируется при включённом покрытии после завершения всех тестов.

### Event: `'test:complete'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `details` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные метаданные выполнения.
    * `passed` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Прошёл ли тест.
    * `duration_ms` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длительность теста в миллисекундах.
    * `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | undefined Обёртка над ошибкой теста, если тест не прошёл.
      * `cause` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Исходная ошибка теста.
    * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Тип теста: признак того, что это
      набор.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `testNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порядковый номер теста.
  * `todo` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Присутствует, если вызван [`context.todo`][`context.todo`]
  * `skip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Присутствует, если вызван [`context.skip`][`context.skip`]

Генерируется по завершении выполнения теста.
Порядок событий не совпадает с порядком объявления тестов.
Соответствующие события в порядке объявления — `'test:pass'` и `'test:fail'`.

### Event: `'test:dequeue'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип теста: `'suite'` или `'test'`.

Генерируется при снятии теста с очереди, непосредственно перед выполнением.
Порядок в общем случае не совпадает с порядком объявления тестов.
Соответствующее событие в порядке объявления — `'test:start'`.

### Event: `'test:diagnostic'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст диагностики.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `level` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Уровень важности сообщения.
    Допустимые значения:
    * `'info'`: информационные сообщения.
    * `'warn'`: предупреждения.
    * `'error'`: ошибки.

Генерируется при вызове [`context.diagnostic`][`context.diagnostic`].
Порядок событий совпадает с порядком объявления тестов.

### Event: `'test:enqueue'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Тип теста: `'suite'` или `'test'`.

Генерируется при постановке теста в очередь на выполнение.

### Event: `'test:fail'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `details` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные метаданные выполнения.
    * `duration_ms` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длительность теста в миллисекундах.
    * `error` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Обёртка над ошибкой, выброшенной тестом.
      * `cause` [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) Исходная ошибка теста.
    * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Тип теста: признак набора.
    * `attempt` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер попытки прогона,
      только при [`--test-rerun-failures`][`--test-rerun-failures`].
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `testNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порядковый номер теста.
  * `todo` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined При вызове [`context.todo`][`context.todo`]
  * `skip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined При вызове [`context.skip`][`context.skip`]

Генерируется при провале теста.
Порядок совпадает с порядком объявления тестов.
Соответствующее событие в порядке выполнения — `'test:complete'`.

### Event: `'test:interrupted'`

<!-- YAML
added: v25.7.0
-->

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `tests` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив объектов с данными о прерванных тестах.
    * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста
      или `undefined`, если тест из REPL.
    * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
      `undefined`, если тест из REPL.
    * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста
      или `undefined`, если тест из REPL.
    * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
    * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.

Генерируется при прерывании раннера сигналом `SIGINT` (например
<kbd>Ctrl</kbd>+<kbd>C</kbd>). В событии — сведения о тестах, которые выполнялись в момент прерывания.

При изоляции процессов (по умолчанию) имя теста — путь к файлу: родительский раннер знает только тесты уровня файла. При
`--test-isolation=none` показывается фактическое имя теста.

### Event: `'test:pass'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `details` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные метаданные выполнения.
    * `duration_ms` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длительность теста в миллисекундах.
    * `type` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Тип теста: признак набора.
    * `attempt` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер попытки прогона,
      только при [`--test-rerun-failures`][`--test-rerun-failures`].
    * `passed_on_attempt` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер попытки, на которой тест прошёл,
      только при [`--test-rerun-failures`][`--test-rerun-failures`].
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `testNumber` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Порядковый номер теста.
  * `todo` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined При вызове [`context.todo`][`context.todo`]
  * `skip` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined При вызове [`context.skip`][`context.skip`]

Генерируется при успешном прохождении теста.
Порядок совпадает с порядком объявления тестов.
Соответствующее событие в порядке выполнения — `'test:complete'`.

### Event: `'test:plan'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.
  * `count` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число выполненных подтестов.

Генерируется после завершения всех подтестов данного теста.
Порядок совпадает с порядком объявления тестов.

### Event: `'test:start'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер столбца объявления теста или
    `undefined`, если тест запущен из REPL.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу;
    `undefined`, если тест запущен из REPL.
  * `line` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined Номер строки объявления теста или
    `undefined`, если тест запущен из REPL.
  * `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя теста.
  * `nesting` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Уровень вложенности теста.

Генерируется, когда тест начинает отчитываться о себе и подтестах.
Порядок совпадает с порядком объявления тестов.
Соответствующее событие в порядке выполнения — `'test:dequeue'`.

### Event: `'test:stderr'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь к тестовому файлу.
  * `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сообщение, записанное в `stderr`.

Генерируется при записи выполняющегося теста в `stderr`.
Только если передан флаг `--test`.
Порядок в общем случае не совпадает с порядком объявления тестов.

### Event: `'test:stdout'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Путь к тестовому файлу.
  * `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Сообщение, записанное в `stdout`.

Генерируется при записи выполняющегося теста в `stdout`.
Только если передан флаг `--test`.
Порядок в общем случае не совпадает с порядком объявления тестов.

### Event: `'test:summary'`

* `data` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `counts` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Счётчики результатов прогона.
    * `cancelled` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число отменённых тестов.
    * `failed` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число проваленных тестов.
    * `passed` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число успешных тестов.
    * `skipped` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число пропущенных тестов.
    * `suites` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число выполненных наборов.
    * `tests` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число выполненных тестов без наборов.
    * `todo` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число тестов в статусе TODO.
    * `topLevel` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Число тестов и наборов верхнего уровня.
  * `duration_ms` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Длительность прогона в миллисекундах.
  * `file` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined Путь к тестовому файлу, с которого получена
    сводка. Если сводка объединяет несколько файлов — `undefined`.
  * `success` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Считается ли прогон успешным.
    При любой ошибке (провал теста, не выполнен порог покрытия и т. п.) — `false`.

Генерируется по завершении прогона. Содержит метрики для оценки успеха или провала.
При изоляции тестов на уровне процесса событие `'test:summary'` приходит для каждого файла и отдельно итоговая сводка.

### Event: `'test:watch:drained'`

Генерируется, когда в режиме watch в очереди больше нет тестов.

### Event: `'test:watch:restarted'`

Генерируется при перезапуске одного или нескольких тестов из‑за изменения файла в режиме watch.

## `getTestContext()`

<!-- YAML
added: REPLACEME
-->

* Возвращает: [`<TestContext>`](#class-testcontext) | [`<SuiteContext>`](#class-suitecontext) | undefined

Возвращает [`TestContext`][`TestContext`] или [`SuiteContext`][`SuiteContext`] для
текущего теста или набора, либо `undefined` вне теста/набора. Позволяет получить контекст из
тела теста/набора или из асинхронных операций внутри них.

=== "MJS"

    ```js
    import { getTestContext } from 'node:test';
    
    test('example test', async () => {
      const ctx = getTestContext();
      console.log(`Running test: ${ctx.name}`);
    });
    
    describe('example suite', () => {
      const ctx = getTestContext();
      console.log(`Running suite: ${ctx.name}`);
    });
    ```

Из теста возвращает [`TestContext`][`TestContext`].
Из набора — [`SuiteContext`][`SuiteContext`].

Вне теста или набора (например на верхнем уровне модуля или в колбэке `setTimeout` после завершения) — `undefined`.

Внутри хука (before, beforeEach, after, afterEach) возвращается контекст теста или набора, к которому привязан хук.

## Class: `TestContext`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
changes:
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47586
    description: В TestContext добавлена функция `before`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | В TestContext была добавлена ​​функция «before». |

В каждую функцию теста передаётся экземпляр `TestContext` для работы с раннером.
Конструктор `TestContext` в API не экспортируется.

### `context.before([fn][, options])`

<!-- YAML
added:
  - v20.1.0
  - v18.17.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука. Первый аргумент —
  [`TestContext`][`TestContext`]. При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук, выполняемый перед подтестом текущего теста.

### `context.beforeEach([fn][, options])`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука. Первый аргумент —
  [`TestContext`][`TestContext`]. При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук перед каждым подтестом текущего теста.

```js
test('top level test', async (t) => {
  t.beforeEach((t) => t.diagnostic(`about to run ${t.name}`));
  await t.test(
    'This is a subtest',
    (t) => {
      // Some relevant assertion here
    },
  );
});
```

### `context.after([fn][, options])`

<!-- YAML
added:
  - v19.3.0
  - v18.13.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука. Первый аргумент —
  [`TestContext`][`TestContext`]. При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук после завершения текущего теста.

```js
test('top level test', async (t) => {
  t.after((t) => t.diagnostic(`finished running ${t.name}`));
  // Some relevant assertion here
});
```

### `context.afterEach([fn][, options])`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция хука. Первый аргумент —
  [`TestContext`][`TestContext`]. При колбэк-стиле второй аргумент — колбэк. **По умолчанию:** пустая функция.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры хука:
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Позволяет прервать выполняющийся хук.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Через столько миллисекунд хук считается проваленным.
    Если не задано, подтесты наследуют значение от родителя.
    **По умолчанию:** `Infinity`.

Создаёт хук после каждого подтеста текущего теста.

```js
test('top level test', async (t) => {
  t.afterEach((t) => t.diagnostic(`finished running ${t.name}`));
  await t.test(
    'This is a subtest',
    (t) => {
      // Some relevant assertion here
    },
  );
});
```

### `context.assert`

<!-- YAML
added:
  - v22.2.0
  - v20.15.0
-->

Объект с методами утверждения, привязанными к `context`. Здесь доступны функции верхнего уровня
модуля `node:assert` для построения планов тестов.

```js
test('test', (t) => {
  t.plan(1);
  t.assert.strictEqual(true, true);
});
```

#### `context.assert.fileSnapshot(value, path[, options])`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение для сериализации в строку. Если Node.js запущен с
  [`--test-update-snapshots`][`--test-update-snapshots`], сериализованное значение записывается в
  `path`. Иначе оно сравнивается с содержимым
  существующего файла снимка.
* `path` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Файл, куда записывается сериализованное `value`.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры. Поддерживаются следующие свойства:
  * `serializers` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив синхронных функций сериализации
    `value` в строку. В первую функцию передаётся только `value`;
    результат каждой передаётся следующей. После всех сериализаторов значение
    приводится к строке. **По умолчанию:** если сериализаторы не заданы, используются
    сериализаторы раннера по умолчанию.

Сериализует `value` и записывает в файл `path`.

```js
test('snapshot test with default serialization', (t) => {
  t.assert.fileSnapshot({ value1: 1, value2: 2 }, './snapshots/snapshot.json');
});
```

Отличия от `context.assert.snapshot()`:

* Путь к файлу снимка задаётся явно.
* В одном файле снимка — одно значение.
* Раннер не выполняет дополнительного экранирования.

Это упрощает подсветку синтаксиса и подобные сценарии.

#### `context.assert.snapshot(value[, options])`

<!-- YAML
added: v22.3.0
-->

* `value` [`<any>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Значение для сериализации. При [`--test-update-snapshots`][`--test-update-snapshots`]
  сериализованное значение записывается в файл снимка.
  Иначе сравнивается с соответствующим значением в существующем файле.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры. Поддерживаются следующие свойства:
  * `serializers` [`<Array>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Массив синхронных сериализаторов (как в `fileSnapshot`).
    **По умолчанию:** сериализаторы раннера по умолчанию.

Утверждения для тестов со снимками.

```js
test('snapshot test with default serialization', (t) => {
  t.assert.snapshot({ value1: 1, value2: 2 });
});

test('snapshot test with custom serialization', (t) => {
  t.assert.snapshot({ value3: 3, value4: 4 }, {
    serializers: [(value) => JSON.stringify(value)],
  });
});
```

### `context.diagnostic(message)`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
-->

* `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст диагностики.

Пишет диагностику в вывод; данные появляются в конце результатов теста. Возвращаемого значения нет.

```js
test('top level test', (t) => {
  t.diagnostic('A diagnostic message');
});
```

### `context.filePath`

<!-- YAML
added:
  - v22.6.0
  - v20.16.0
-->

Абсолютный путь к тестовому файлу, создавшему текущий тест. Если тесты
подключаются из других модулей, возвращается путь корневого тестового файла.

### `context.fullName`

<!-- YAML
added:
  - v22.3.0
  - v20.16.0
-->

Имя теста и всех предков через `>`.

### `context.name`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

Имя теста.

### `context.passed`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) До выполнения теста — `false`, например в хуке `beforeEach`.

Указывает, успешен ли тест.

### `context.error`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* Тип: [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null

Причина провала теста/кейса; исходная ошибка в `context.error.cause`.

### `context.attempt`

<!-- YAML
added: v25.0.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Номер попытки теста (с нуля: первая — `0`, вторая — `1` и т. д.). Удобно с опцией
`--test-rerun-failures`, чтобы знать текущую попытку.

### `context.workerId`

<!-- YAML
added: v25.8.0
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

Уникальный идентификатор воркера, выполняющего текущий тестовый файл. Берётся из
`NODE_TEST_WORKER_ID`. При `--test-isolation=process` (по умолчанию) каждый файл в отдельном
дочернем процессе с ID от 1 до N (N — число параллельных воркеров). При `--test-isolation=none` все тесты в одном
процессе, идентификатор всегда 1. Вне контекста теста — `undefined`.

Свойство удобно для распределения ресурсов (соединения с БД, порты и т. д.) между параллельными файлами:

=== "MJS"

    ```js
    import { test } from 'node:test';
    import { process } from 'node:process';
    
    test('database operations', async (t) => {
      // Worker ID is available via context
      console.log(`Running in worker ${t.workerId}`);
    
      // Or via environment variable (available at import time)
      const workerId = process.env.NODE_TEST_WORKER_ID;
      // Use workerId to allocate separate resources per worker
    });
    ```

### `context.plan(count[,options])`

<!-- YAML
added:
  - v22.2.0
  - v20.15.0
changes:
  - version:
    - v23.9.0
    - v22.15.0
    pr-url: https://github.com/nodejs/node/pull/56765
    description: Добавлен параметр `options`.
  - version:
    - v23.4.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/55895
    description: Функция больше не экспериментальная.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v23.9.0, v22.15.0 | Добавьте параметр `options`. |
    | v23.4.0, v22.13.0 | Эта функция больше не является экспериментальной. |

* `count` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидаемое число утверждений и подтестов.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Дополнительные параметры плана.
  * `wait` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Поведение ожидания плана:
    * `true` — ждать неограниченно, пока не выполнятся все утверждения и подтесты.
    * `false` — проверка сразу после завершения функции теста,
      без ожидания отложенных утверждений и подтестов.
      Утверждения и подтесты, завершившиеся позже, в план не входят.
    * число — максимальное время ожидания в миллисекундах
      до тайм-аута при ожидании ожидаемых утверждений и подтестов.
      При тайм-ауте тест проваливается.
      **По умолчанию:** `false`.

Задаёт ожидаемое число утверждений и подтестов в тесте. При несовпадении с фактом тест проваливается.

> Примечание: чтобы утверждения учитывались планом, используйте `t.assert`, а не прямой импорт `assert`.

```js
test('top level test', (t) => {
  t.plan(2);
  t.assert.ok('some relevant assertion here');
  t.test('subtest', () => {});
});
```

В асинхронном коде `plan` помогает убедиться, что выполнено нужное число утверждений:

```js
test('planning with streams', (t, done) => {
  function* generate() {
    yield 'a';
    yield 'b';
    yield 'c';
  }
  const expected = ['a', 'b', 'c'];
  t.plan(expected.length);
  const stream = Readable.from(generate());
  stream.on('data', (chunk) => {
    t.assert.strictEqual(chunk, expected.shift());
  });

  stream.on('end', () => {
    done();
  });
});
```

С опцией `wait` можно задать, как долго тест ждёт ожидаемые утверждения.
Например, ограничение по времени позволяет дождаться асинхронных утверждений
в заданном окне:

```js
test('plan with wait: 2000 waits for async assertions', (t) => {
  t.plan(1, { wait: 2000 }); // Waits for up to 2 seconds for the assertion to complete.

  const asyncActivity = () => {
    setTimeout(() => {
      t.assert.ok(true, 'Async assertion completed within the wait time');
    }, 1000); // Completes after 1 second, within the 2-second wait time.
  };

  asyncActivity(); // The test will pass because the assertion is completed in time.
});
```

Примечание: отсчёт тайм-аута `wait` начинается только после завершения функции теста.

### `context.runOnly(shouldRunOnlyTests)`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
-->

* `shouldRunOnlyTests` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Выполнять ли только тесты с `only`.

Если `shouldRunOnlyTests` истинно, контекст выполняет только тесты с опцией `only`; иначе — все. Без флага [`--test-only`][`--test-only`] в командной строке вызов не действует.

```js
test('top level test', (t) => {
  // The test context can be set to run subtests with the 'only' option.
  t.runOnly(true);
  return Promise.all([
    t.test('this subtest is now skipped'),
    t.test('this subtest is run', { only: true }),
  ]);
});
```

### `context.signal`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
-->

* Тип: [`<AbortSignal>`](globals.md#abortsignal)

Позволяет прервать подзадачи теста при его отмене.

```js
test('top level test', async (t) => {
  await fetch('some/uri', { signal: t.signal });
});
```

### `context.skip([message])`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
-->

* `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное сообщение о пропуске.

Помечает тест в выводе как пропущенный. Если передана `message`, она попадает в отчёт. `skip()` не
прерывает выполнение функции теста. Возвращаемого значения нет.

```js
test('top level test', (t) => {
  // Make sure to return here as well if the test contains additional logic.
  t.skip('this is skipped');
});
```

### `context.todo([message])`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
-->

* `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Необязательное сообщение `TODO`.

Добавляет в вывод директиву `TODO`. При переданной `message` она включается в отчёт. `todo()` не
прерывает выполнение функции теста. Возвращаемого значения нет.

```js
test('top level test', (t) => {
  // This test is marked as `TODO`
  t.todo('this is a todo');
});
```

### `context.test([name][, options][, fn])`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
changes:
  - version:
    - v18.8.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/43554
    description: Добавлена опция `signal`.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43505
    description: Добавлена опция `timeout`.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v18.8.0, v16.18.0 | Добавьте опцию «сигнал». |
    | v18.7.0, v16.17.0 | Добавьте опцию «тайм-аут». |

* `name` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Имя подтеста в отчёте.
  **По умолчанию:** свойство `name` у `fn` или `'<anonymous>'`, если у `fn` нет имени.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Параметры подтеста. Поддерживаются свойства:
  * `concurrency` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | null Если число —
    столько подтестов выполняется асинхронно (в одном потоке цикла событий).
    Если `true` — все подтесты параллельно.
    Если `false` — по одному за раз.
    Если не задано, подтесты наследуют от родителя.
    **По умолчанию:** `null`.
  * `only` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Если истинно и контекст настроен на `only`, подтест выполняется; иначе пропускается.
    **По умолчанию:** `false`.
  * `signal` [`<AbortSignal>`](globals.md#abortsignal) Прерывание выполняющегося подтеста.
  * `skip` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Пропуск подтеста; строка — причина в отчёте.
    **По умолчанию:** `false`.
  * `todo` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Статус `TODO`; строка — пояснение в отчёте.
    **По умолчанию:** `false`.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Тайм-аут подтеста в миллисекундах.
    Если не задано, подтесты наследуют от родителя.
    **По умолчанию:** `Infinity`.
  * `plan` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Ожидаемое число утверждений и подтестов.
    При несовпадении с планом подтест проваливается.
    **По умолчанию:** `undefined`.
* `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция подтеста; первый аргумент — [`TestContext`][`TestContext`]; при колбэках второй — колбэк.
  **По умолчанию:** пустая функция.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется с `undefined` по завершении подтеста.

Создаёт подтесты внутри текущего теста; поведение как у [`test()`][`test()`] верхнего уровня.

```js
test('top level test', async (t) => {
  await t.test(
    'This is a subtest',
    { only: false, skip: false, concurrency: 1, todo: false, plan: 1 },
    (t) => {
      t.assert.ok('some relevant assertion here');
    },
  );
});
```

### `context.waitFor(condition[, options])`

<!-- YAML
added:
  - v23.7.0
  - v22.14.0
-->

* `condition` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<AsyncFunction>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) Функция-проверка, вызываемая
  периодически до успешного завершения или истечения тайм-аута опроса.
  Успех — отсутствие исключения и отклонения промиса. Аргументов не принимает, может вернуть любое значение.
* `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Необязательные параметры опроса:
  * `interval` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Пауза в миллисекундах после неуспешного
    вызова `condition` перед следующей попыткой. **По умолчанию:** `50`.
  * `timeout` [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Общий тайм-аут опроса в миллисекундах. Если за это время `condition` не
    завершилась успешно — ошибка. **По умолчанию:** `1000`.
* Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Выполняется значением, возвращённым `condition`.

Опрашивает `condition`, пока она не завершится успешно или не истечёт тайм-аут.

## Class: `SuiteContext`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
-->

В каждую функцию набора передаётся экземпляр `SuiteContext` для работы с раннером.
Конструктор `SuiteContext` в API не экспортируется.

### `context.filePath`

<!-- YAML
added: v22.6.0
-->

Абсолютный путь к файлу, создавшему текущий набор. Если наборы подключаются из модулей,
возвращается путь корневого тестового файла.

### `context.fullName`

<!-- YAML
added:
  - v22.3.0
  - v20.16.0
-->

Имя набора и предков через `>`.

### `context.name`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

Имя набора.

### `context.signal`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
-->

* Тип: [`<AbortSignal>`](globals.md#abortsignal)

Позволяет прервать подзадачи теста при его отмене.

### `context.passed`

<!-- YAML
added: REPLACEME
-->

* Тип: [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Указывает, прошли ли набор и все его подтесты.

### `context.attempt`

<!-- YAML
added: REPLACEME
-->

* Тип: [`<number>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

Номер попытки набора (с нуля). Удобно с `--test-rerun-failures`, чтобы знать номер текущей попытки.

### `context.diagnostic(message)`

<!-- YAML
added: REPLACEME
-->

* `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Текст диагностики.

Выводит диагностическое сообщение, обычно для журналирования о наборе или его тестах.

```js
test.describe('my suite', (suite) => {
  suite.diagnostic('Suite diagnostic message');
});
```

[TAP]: https://testanything.org/
[`--experimental-test-coverage`]: cli.md#--experimental-test-coverage
[`--experimental-test-module-mocks`]: cli.md#--experimental-test-module-mocks
[`--import`]: cli.md#--importmodule
[`--no-strip-types`]: cli.md#--no-strip-types
[`--test-concurrency`]: cli.md#--test-concurrency
[`--test-coverage-exclude`]: cli.md#--test-coverage-exclude
[`--test-coverage-include`]: cli.md#--test-coverage-include
[`--test-name-pattern`]: cli.md#--test-name-pattern
[`--test-only`]: cli.md#--test-only
[`--test-reporter-destination`]: cli.md#--test-reporter-destination
[`--test-reporter`]: cli.md#--test-reporter
[`--test-rerun-failures`]: cli.md#--test-rerun-failures
[`--test-skip-pattern`]: cli.md#--test-skip-pattern
[`--test-update-snapshots`]: cli.md#--test-update-snapshots
[`--test`]: cli.md#--test
[`MockFunctionContext`]: #class-mockfunctioncontext
[`MockPropertyContext`]: #class-mockpropertycontext
[`MockTimers`]: #class-mocktimers
[`MockTracker.method`]: #mockmethodobject-methodname-implementation-options
[`MockTracker`]: #class-mocktracker
[`NODE_V8_COVERAGE`]: cli.md#node_v8_coveragedir
[`SuiteContext`]: #class-suitecontext
[`TestContext`]: #class-testcontext
[`assert.throws`]: assert.md#assertthrowsfn-error-message
[`context.diagnostic`]: #contextdiagnosticmessage
[`context.skip`]: #contextskipmessage
[`context.todo`]: #contexttodomessage
[`describe()`]: #describename-options-fn
[`glob(7)`]: https://man7.org/linux/man-pages/man7/glob.7.html
[`it()`]: #itname-options-fn
[`run()`]: #runoptions
[`suite()`]: #suitename-options-fn
[`test()`]: #testname-options-fn
[code coverage]: #collecting-code-coverage
[configuration files]: cli.md#--experimental-config-fileconfig
[describe options]: #describename-options-fn
[it options]: #testname-options-fn
[module customization hooks]: module.md#customization-hooks
[running tests from the command line]: #running-tests-from-the-command-line
[stream.compose]: stream.md#streamcomposestreams
[subtests]: #subtests
[suite options]: #suitename-options-fn
[test reporters]: #test-reporters
[test runner execution model]: #test-runner-execution-model
