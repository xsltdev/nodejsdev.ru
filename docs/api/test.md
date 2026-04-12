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
    description: The test runner is now stable.
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
[`--test-rerun-failures`][]; если файла нет, он будет создан.

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

Наборы и тесты можно оформлять через `describe()` и `it()`: [`describe()`][]
это псевдоним [`suite()`][], [`it()`][] — псевдоним [`test()`][].

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
выбросе совпадающего значения. См. [`assert.throws`][] про обработку типов.

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

Если Node.js запущен с [`--test-only`][] или отключена изоляция тестов, можно выполнить
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

Опция командной строки [`--test-name-pattern`][] позволяет запускать только те тесты,
имя которых соответствует заданному шаблону; опция [`--test-skip-pattern`][] —
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
[`--test`][]:

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

Если не указан [`--no-strip-types`][], дополнительно учитываются:

* `**/*.test.{cts,mts,ts}`
* `**/*-test.{cts,mts,ts}`
* `**/*_test.{cts,mts,ts}`
* `**/test-*.{cts,mts,ts}`
* `**/test.{cts,mts,ts}`
* `**/test/**/*.{cts,mts,ts}`

Вместо этого в конце команды Node.js можно передать один или несколько шаблонов glob,
как показано ниже. Поведение glob соответствует [`glob(7)`][].
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
процессов задаёт [`--test-concurrency`][]. Если дочерний процесс завершился с кодом 0,
тест считается пройденным; иначе — провалом. Файлы должны быть исполняемы Node.js,
но не обязаны использовать внутри модуль `node:test`.

Каждый файл выполняется как обычный скрипт: если в нём через `node:test` объявлены тесты,
они выполняются в одном потоке приложения, независимо от опции `concurrency` у [`test()`][].

При отключённой изоляции каждый файл импортируется в процесс раннера. После загрузки всех
файлов тесты верхнего уровня выполняются с параллелизмом 1. Общий контекст позволяет тестам
взаимодействовать так, как при изоляции нельзя: например глобальное состояние может меняться
тестом из другого файла.

#### Наследование опций дочерним процессом

В режиме изоляции процессов (по умолчанию) дочерние процессы наследуют опции Node.js
от родителя, в том числе из [файлов конфигурации][]. Часть флаков отфильтрована для корректной
работы раннера:

* `--test` — запрещён, чтобы избежать рекурсивного запуска тестов
* `--experimental-test-coverage` — управляет раннер
* `--watch` — режим watch на уровне родителя
* `--experimental-default-config-file` — загрузка конфига на уровне родителя
* `--test-reporter` — отчётность на уровне родителя
* `--test-reporter-destination` — назначения вывода задаёт родитель
* `--experimental-config-file` — пути к конфигу на уровне родителя
* `--test-randomize` — рандомизацию задаёт родитель и передаёт дочерним процессам
* `--test-random-seed` — seed рандомизации задаёт родитель и передаёт дочерним процессам

Остальные опции Node.js из аргументов командной строки, переменных окружения и конфигурационных
файлов дочерние процессы наследуют.

## Сбор покрытия кода

> Стабильность: 1 — экспериментально

При запуске Node.js с флагом [`--experimental-test-coverage`][]
собирается покрытие кода; после завершения всех тестов выводится статистика.
Если переменная окружения [`NODE_V8_COVERAGE`][] задаёт каталог покрытия,
файлы V8 записываются туда. Модули ядра Node.js и файлы в `node_modules/` по умолчанию
не входят в отчёт; их можно явно включить флагом [`--test-coverage-include`][].
По умолчанию все подходящие тестовые файлы исключаются из отчёта о покрытии;
исключения можно переопределить [`--test-coverage-exclude`][].
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

Та же функциональность доступна на объекте [`TestContext`][] каждого теста.
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

Полный список методов и возможностей — в классе [`MockTimers`][].

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

Та же функциональность доступна в свойстве `mock` у [`TestContext`][].
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

Реализация даты тоже входит в [`MockTimers`][] — см. там полный список методов.

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
    description: Snapshot testing is no longer experimental.
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
[`--test-update-snapshots`][]. На каждый тестовый файл — отдельный файл снимка.
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
    description: The default reporter on non-TTY stdout is changed from `tap` to
                 `spec`, aligning with TTY stdout.
  - version:
    - v19.9.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47238
    description: Reporters are now exposed at `node:test/reporters`.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.0.0 | Средство создания отчетов по умолчанию для стандартного вывода без TTY изменено с `tap` на `spec`, что соответствует стандартному выводу TTY. |
    | v19.9.0, v18.17.0 | Репортеры теперь доступны по адресу `node:test/reporters`. |

В модуле `node:test` можно передать флаги [`--test-reporter`][], чтобы
раннер использовал нужный репортёр.

Встроенные репортёры:

* `spec`
  Выводит результаты в удобочитаемом виде. Репортёр по умолчанию.

* `tap`
  Формат [TAP][].

* `dot`
  Компактный вывод: успешный тест — `.`, провал — `X`.

* `junit`
  jUnit XML.

* `lcov`
  Покрытие кода; используется с [`--experimental-test-coverage`][].

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

[`--test-reporter`][] может указывать путь к своему репортёру.
Это модуль, экспортирующий значение, допустимое для [stream.compose][].
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
или значение, как у [`--import`][].

### Несколько репортёров

Флаг [`--test-reporter`][] можно указать несколько раз, чтобы получить вывод в нескольких форматах.
Тогда для каждого репортёра нужно задать назначение через [`--test-reporter-destination`][]:
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
    description: Add the `env` option.
  - version: v24.7.0
    pr-url: https://github.com/nodejs/node/pull/59443
    description: Added a rerunFailuresFilePath option.
  - version: v23.0.0
    pr-url: https://github.com/nodejs/node/pull/54705
    description: Added the `cwd` option.
  - version:
    - v23.0.0
    - v22.10.0
    pr-url: https://github.com/nodejs/node/pull/53937
    description: Added coverage options.
  - version: v22.8.0
    pr-url: https://github.com/nodejs/node/pull/53927
    description: Added the `isolation` option.
  - version: v22.6.0
    pr-url: https://github.com/nodejs/node/pull/53866
    description: Added the `globPatterns` option.
  - version:
    - v22.0.0
    - v20.14.0
    pr-url: https://github.com/nodejs/node/pull/52038
    description: Added the `forceExit` option.
  - version:
    - v20.1.0
    - v18.17.0
    pr-url: https://github.com/nodejs/node/pull/47628
    description: Add a testNamePatterns option.
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

* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for running tests. The following
  properties are supported:
  * `concurrency` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If a number is provided,
    then that many test processes would run in parallel, where each process
    corresponds to one test file.
    If `true`, it would run `os.availableParallelism() - 1` test files in
    parallel.
    If `false`, it would only run one test file at a time.
    **Default:** `false`.
  * `cwd` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Specifies the current working directory to be used by the test runner.
    Serves as the base path for resolving files as if [running tests from the command line][] from that directory.
    **Default:** `process.cwd()`.
  * `files` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array containing the list of files to run.
    **Default:** Same as [running tests from the command line][].
  * `forceExit` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Configures the test runner to exit the process once
    all known tests have finished executing even if the event loop would
    otherwise remain active. **Default:** `false`.
  * `globPatterns` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array containing the list of glob patterns to
    match test files. This option cannot be used together with `files`.
    **Default:** Same as [running tests from the command line][].
  * `inspectPort` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Sets inspector port of test child process.
    This can be a number, or a function that takes no arguments and returns a
    number. If a nullish value is provided, each process gets its own port,
    incremented from the primary's `process.debugPort`. This option is ignored
    if the `isolation` option is set to `'none'` as no child processes are
    spawned. **Default:** `undefined`.
  * `isolation` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Configures the type of test isolation. If set to
    `'process'`, each test file is run in a separate child process. If set to
    `'none'`, all test files run in the current process. **Default:**
    `'process'`.
  * `only` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If truthy, the test context will only run tests that
    have the `only` option set
  * `setup` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A function that accepts the `TestsStream` instance
    and can be used to setup listeners before any tests are run.
    **Default:** `undefined`.
  * `execArgv` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of CLI flags to pass to the `node` executable when
    spawning the subprocesses. This option has no effect when `isolation` is `'none`'.
    **Default:** `[]`
  * `argv` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of CLI flags to pass to each test file when spawning the
    subprocesses. This option has no effect when `isolation` is `'none'`.
    **Default:** `[]`.
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress test execution.
  * `testNamePatterns` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<RegExp>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) A String, RegExp or a RegExp Array,
    that can be used to only run tests whose name matches the provided pattern.
    Test name patterns are interpreted as JavaScript regular expressions.
    For each test that is executed, any corresponding test hooks, such as
    `beforeEach()`, are also run.
    **Default:** `undefined`.
  * `testSkipPatterns` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<RegExp>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) A String, RegExp or a RegExp Array,
    that can be used to exclude running tests whose name matches the provided pattern.
    Test name patterns are interpreted as JavaScript regular expressions.
    For each test that is executed, any corresponding test hooks, such as
    `beforeEach()`, are also run.
    **Default:** `undefined`.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the test execution will
    fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.
  * `watch` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether to run in watch mode or not. **Default:** `false`.
  * `shard` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Running tests in a specific shard. **Default:** `undefined`.
    * `index` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) is a positive integer between 1 and `<total>`
      that specifies the index of the shard to run. This option is _required_.
    * `total` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) is a positive integer that specifies the total number
      of shards to split the test files to. This option is _required_.
  * `randomize` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Randomize execution order for test files and queued tests.
    This option is not supported with `watch: true`.
    **Default:** `false`.
  * `randomSeed` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Seed used when randomizing execution order. If this
    option is set, runs can replay the same randomized order deterministically,
    and setting this option also enables randomization. The value must be an
    integer between `0` and `4294967295`.
    **Default:** `undefined`.
  * `rerunFailuresFilePath` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) A file path where the test runner will
    store the state of the tests to allow rerunning only the failed tests on a next run.
    see \[Rerunning failed tests]\[] for more information.
    **Default:** `undefined`.
  * `coverage` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) enable [code coverage][] collection.
    **Default:** `false`.
  * `coverageExcludeGlobs` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Excludes specific files from code coverage
    using a glob pattern, which can match both absolute and relative file paths.
    This property is only applicable when `coverage` was set to `true`.
    If both `coverageExcludeGlobs` and `coverageIncludeGlobs` are provided,
    files must meet **both** criteria to be included in the coverage report.
    **Default:** `undefined`.
  * `coverageIncludeGlobs` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) Includes specific files in code coverage
    using a glob pattern, which can match both absolute and relative file paths.
    This property is only applicable when `coverage` was set to `true`.
    If both `coverageExcludeGlobs` and `coverageIncludeGlobs` are provided,
    files must meet **both** criteria to be included in the coverage report.
    **Default:** `undefined`.
  * `lineCoverage` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Require a minimum percent of covered lines. If code
    coverage does not reach the threshold specified, the process will exit with code `1`.
    **Default:** `0`.
  * `branchCoverage` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Require a minimum percent of covered branches. If code
    coverage does not reach the threshold specified, the process will exit with code `1`.
    **Default:** `0`.
  * `functionCoverage` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) Require a minimum percent of covered functions. If code
    coverage does not reach the threshold specified, the process will exit with code `1`.
    **Default:** `0`.
  * `env` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Specify environment variables to be passed along to the test process.
    This options is not compatible with `isolation='none'`. These variables will override
    those from the main process, and are not merged with `process.env`.
    **Default:** `process.env`.
* Returns: [<TestsStream>](test.md)

**Note:** `shard` is used to horizontally parallelize test running across
machines or processes, ideal for large-scale executions across varied
environments. It's incompatible with `watch` mode, tailored for rapid
code iteration by automatically rerunning tests on file changes.

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

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The name of the suite, which is displayed when reporting test
  results. **Default:** The `name` property of `fn`, or `'<anonymous>'` if `fn`
  does not have a name.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options for the suite.
  This supports the same options as `test([name][, options][, fn])`.
* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The suite function declaring nested tests and
  suites. The first argument to this function is a [`SuiteContext`][] object.
  **Default:** A no-op function.
* Returns: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Immediately fulfilled with `undefined`.

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
    description: Added the `skip`, `todo`, and `only` shorthands.
  - version:
    - v18.8.0
    - v16.18.0
    pr-url: https://github.com/nodejs/node/pull/43554
    description: Add a `signal` option.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43505
    description: Add a `timeout` option.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v20.2.0, v18.17.0 | Добавлены сокращения «skip», «todo» и «only». |
    | v18.8.0, v16.18.0 | Добавьте опцию «сигнал». |
    | v18.7.0, v16.17.0 | Добавьте опцию «тайм-аут». |

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The name of the test, which is displayed when reporting test
  results. **Default:** The `name` property of `fn`, or `'<anonymous>'` if `fn`
  does not have a name.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the test. The following
  properties are supported:
  * `concurrency` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If a number is provided,
    then that many tests would run asynchronously (they are still managed by the single-threaded event loop).
    If `true`, all scheduled asynchronous tests run concurrently within the
    thread. If `false`, only one test runs at a time.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `false`.
  * `expectFailure` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<RegExp>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) If truthy, the
    test is expected to fail. If a non-empty string is provided, that string is displayed
    in the test results as the reason why the test is expected to fail. If a [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [Function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
    is provided directly (without wrapping in `{ match: … }`), the test passes
    only if the thrown error matches, following the behavior of
    [`assert.throws`][]. To provide both a reason and validation, pass an object
    with `label` (string) and `match` (RegExp, Function, Object, or Error).
    **Default:** `false`.
  * `only` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If truthy, and the test context is configured to run
    `only` tests, then this test will be run. Otherwise, the test is skipped.
    **Default:** `false`.
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress test.
  * `skip` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If truthy, the test is skipped. If a string is
    provided, that string is displayed in the test results as the reason for
    skipping the test. **Default:** `false`.
  * `todo` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If truthy, the test marked as `TODO`. If a string
    is provided, that string is displayed in the test results as the reason why
    the test is `TODO`. **Default:** `false`.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the test will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.
  * `plan` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of assertions and subtests expected to be run in the test.
    If the number of assertions run in the test does not match the number
    specified in the plan, the test will fail.
    **Default:** `undefined`.
* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The function under test. The first argument
  to this function is a [`TestContext`][] object. If the test uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* Returns: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfilled with `undefined` once
  the test completes, or immediately if the test runs within a suite.

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

Псевдоним [`suite()`][].

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
    description: Calling `it()` is now equivalent to calling `test()`.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v19.8.0, v18.16.0 | Вызов `it()` теперь эквивалентен вызову `test()`. |

Псевдоним [`test()`][].

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

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function.
  If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

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

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function.
  If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

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

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function.
  If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

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

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function.
  If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

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

* `serializers` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of synchronous functions used as the default
  serializers for snapshot tests.

This function is used to customize the default serialization mechanism used by
the test runner. By default, the test runner performs serialization by calling
`JSON.stringify(value, null, 2)` on the provided value. `JSON.stringify()` does
have limitations regarding circular structures and supported data types. If a
more robust serialization mechanism is required, this function should be used.

### `snapshot.setResolveSnapshotPath(fn)`

<!-- YAML
added: v22.3.0
-->

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) A function used to compute the location of the snapshot file.
  The function receives the path of the test file as its only argument. If the
  test is not associated with a file (for example in the REPL), the input is
  undefined. `fn()` must return a string specifying the location of the snapshot
  snapshot file.

This function is used to customize the location of the snapshot file used for
snapshot testing. By default, the snapshot filename is the same as the entry
point filename with a `.snapshot` file extension.

## Class: `MockFunctionContext`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

The `MockFunctionContext` class is used to inspect or manipulate the behavior of
mocks created via the [`MockTracker`][] APIs.

### `ctx.calls`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* Type: [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

A getter that returns a copy of the internal array used to track calls to the
mock. Each entry in the array is an object with the following properties.

* `arguments` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of the arguments passed to the mock function.
* `error` {any} If the mocked function threw then this property contains the
  thrown value. **Default:** `undefined`.
* `result` {any} The value returned by the mocked function.
* `stack` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) An `Error` object whose stack can be used to determine the
  callsite of the mocked function invocation.
* `target` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | undefined If the mocked function is a constructor, this
  field contains the class being constructed. Otherwise this will be
  `undefined`.
* `this` {any} The mocked function's `this` value.

### `ctx.callCount()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* Returns: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times that this mock has been invoked.

This function returns the number of times that this mock has been invoked. This
function is more efficient than checking `ctx.calls.length` because `ctx.calls`
is a getter that creates a copy of the internal call tracking array.

### `ctx.mockImplementation(implementation)`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `implementation` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The function to be used as the
  mock's new implementation.

This function is used to change the behavior of an existing mock.

The following example creates a mock function using `t.mock.fn()`, calls the
mock function, and then changes the mock implementation to a different function.

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

* `implementation` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The function to be used as the
  mock's implementation for the invocation number specified by `onCall`.
* `onCall` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The invocation number that will use `implementation`. If
  the specified invocation has already occurred then an exception is thrown.
  **Default:** The number of the next invocation.

This function is used to change the behavior of an existing mock for a single
invocation. Once invocation `onCall` has occurred, the mock will revert to
whatever behavior it would have used had `mockImplementationOnce()` not been
called.

The following example creates a mock function using `t.mock.fn()`, calls the
mock function, changes the mock implementation to a different function for the
next invocation, and then resumes its previous behavior.

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

Resets the call history of the mock function.

### `ctx.restore()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

Resets the implementation of the mock function to its original behavior. The
mock can still be used after calling this function.

## Class: `MockModuleContext`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

> Stability: 1.0 - Early development

The `MockModuleContext` class is used to manipulate the behavior of module mocks
created via the [`MockTracker`][] APIs.

### `ctx.restore()`

<!-- YAML
added:
  - v22.3.0
  - v20.18.0
-->

Resets the implementation of the mock module.

## Class: `MockPropertyContext`

<!-- YAML
added:
  - v24.3.0
  - v22.20.0
-->

The `MockPropertyContext` class is used to inspect or manipulate the behavior
of property mocks created via the [`MockTracker`][] APIs.

### `ctx.accesses`

* Type: [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)

A getter that returns a copy of the internal array used to track accesses (get/set) to
the mocked property. Each entry in the array is an object with the following properties:

* `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Either `'get'` or `'set'`, indicating the type of access.
* `value` {any} The value that was read (for `'get'`) or written (for `'set'`).
* `stack` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) An `Error` object whose stack can be used to determine the
  callsite of the mocked function invocation.

### `ctx.accessCount()`

* Returns: [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times that the property was accessed (read or written).

This function returns the number of times that the property was accessed.
This function is more efficient than checking `ctx.accesses.length` because
`ctx.accesses` is a getter that creates a copy of the internal access tracking array.

### `ctx.mockImplementation(value)`

* `value` {any} The new value to be set as the mocked property value.

This function is used to change the value returned by the mocked property getter.

### `ctx.mockImplementationOnce(value[, onAccess])`

* `value` {any} The value to be used as the mock's
  implementation for the invocation number specified by `onAccess`.
* `onAccess` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The invocation number that will use `value`. If
  the specified invocation has already occurred then an exception is thrown.
  **Default:** The number of the next invocation.

This function is used to change the behavior of an existing mock for a single
invocation. Once invocation `onAccess` has occurred, the mock will revert to
whatever behavior it would have used had `mockImplementationOnce()` not been
called.

The following example creates a mock function using `t.mock.property()`, calls the
mock property, changes the mock implementation to a different value for the
next invocation, and then resumes its previous behavior.

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

#### Caveat

For consistency with the rest of the mocking API, this function treats both property gets and sets
as accesses. If a property set occurs at the same access index, the "once" value will be consumed
by the set operation, and the mocked property value will be changed to the "once" value. This may
lead to unexpected behavior if you intend the "once" value to only be used for a get operation.

### `ctx.resetAccesses()`

Resets the access history of the mocked property.

### `ctx.restore()`

Resets the implementation of the mock property to its original behavior. The
mock can still be used after calling this function.

## Class: `MockTracker`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

The `MockTracker` class is used to manage mocking functionality. The test runner
module provides a top level `mock` export which is a `MockTracker` instance.
Each test also provides its own `MockTracker` instance via the test context's
`mock` property.

### `mock.fn([original[, implementation]][, options])`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `original` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) An optional function to create a mock on.
  **Default:** A no-op function.
* `implementation` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) An optional function used as the
  mock implementation for `original`. This is useful for creating mocks that
  exhibit one behavior for a specified number of calls and then restore the
  behavior of `original`. **Default:** The function specified by `original`.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options for the mock function. The
  following properties are supported:
  * `times` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times that the mock will use the behavior of
    `implementation`. Once the mock function has been called `times` times, it
    will automatically restore the behavior of `original`. This value must be an
    integer greater than zero. **Default:** `Infinity`.
* Returns: [<Proxy>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) The mocked function. The mocked function contains a special
  `mock` property, which is an instance of [`MockFunctionContext`][], and can
  be used for inspecting and changing the behavior of the mocked function.

This function is used to create a mock function.

The following example creates a mock function that increments a counter by one
on each invocation. The `times` option is used to modify the mock behavior such
that the first two invocations add two to the counter instead of one.

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

This function is syntax sugar for [`MockTracker.method`][] with `options.getter`
set to `true`.

### `mock.method(object, methodName[, implementation][, options])`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

* `object` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The object whose method is being mocked.
* `methodName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<symbol>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) The identifier of the method on `object` to mock.
  If `object[methodName]` is not a function, an error is thrown.
* `implementation` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) An optional function used as the
  mock implementation for `object[methodName]`. **Default:** The original method
  specified by `object[methodName]`.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options for the mock method. The
  following properties are supported:
  * `getter` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, `object[methodName]` is treated as a getter.
    This option cannot be used with the `setter` option. **Default:** false.
  * `setter` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `true`, `object[methodName]` is treated as a setter.
    This option cannot be used with the `getter` option. **Default:** false.
  * `times` [<integer>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times that the mock will use the behavior of
    `implementation`. Once the mocked method has been called `times` times, it
    will automatically restore the original behavior. This value must be an
    integer greater than zero. **Default:** `Infinity`.
* Returns: [<Proxy>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) The mocked method. The mocked method contains a special
  `mock` property, which is an instance of [`MockFunctionContext`][], and can
  be used for inspecting and changing the behavior of the mocked method.

This function is used to create a mock on an existing object method. The
following example demonstrates how a mock is created on an existing object
method.

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
    description: Support JSON modules.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v24.0.0, v22.17.0 | Поддержка модулей JSON. |

> Stability: 1.0 - Early development

* `specifier` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<URL>](url.md#the-whatwg-url-api) A string identifying the module to mock.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options for the mock module. The
  following properties are supported:
  * `cache` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If `false`, each call to `require()` or `import()`
    generates a new mock module. If `true`, subsequent calls will return the same
    module mock, and the mock module is inserted into the CommonJS cache.
    **Default:** false.
  * `exports` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional mocked exports. The `default` property, if
    provided, is used as the mocked module's default export. All other own
    enumerable properties are used as named exports.
    **This option cannot be used with `defaultExport` or `namedExports`.**
    * If the mock is a CommonJS or builtin module, `exports.default` is used as
      the value of `module.exports`.
    * If `exports.default` is not provided for a CommonJS or builtin mock,
      `module.exports` defaults to an empty object.
    * If named exports are provided with a non-object default export, the mock
      throws an exception when used as a CommonJS or builtin module.
  * `defaultExport` {any} An optional value used as the mocked module's default
    export. If this value is not provided, ESM mocks do not include a default
    export. If the mock is a CommonJS or builtin module, this setting is used as
    the value of `module.exports`. If this value is not provided, CJS and builtin
    mocks use an empty object as the value of `module.exports`.
    **This option cannot be used with `options.exports`.**
    This option is deprecated and will be removed in a later version.
    Prefer `options.exports.default`.
  * `namedExports` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An optional object whose keys and values are used to
    create the named exports of the mock module. If the mock is a CommonJS or
    builtin module, these values are copied onto `module.exports`. Therefore, if a
    mock is created with both named exports and a non-object default export, the
    mock will throw an exception when used as a CJS or builtin module.
    **This option cannot be used with `options.exports`.**
    This option is deprecated and will be removed in a later version.
    Prefer `options.exports`.
* Returns: [<MockModuleContext>](test.md) An object that can be used to manipulate the mock.

This function is used to mock the exports of ECMAScript modules, CommonJS modules, JSON modules, and
Node.js builtin modules. Any references to the original module prior to mocking are not impacted. In
order to enable module mocking, Node.js must be started with the
[`--experimental-test-module-mocks`][] command-line flag.

**Note**: [module customization hooks][] registered via the **synchronous** API effect resolution of
the `specifier` provided to `mock.module`. Customization hooks registered via the **asynchronous**
API are currently ignored (because the test runner's loader is synchronous, and node does not
support multi-chain / cross-chain loading).

The following example demonstrates how a mock is created for a module.

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

* `object` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) The object whose value is being mocked.
* `propertyName` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<symbol>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Symbol_type) The identifier of the property on `object` to mock.
* `value` {any} An optional value used as the mock value
  for `object[propertyName]`. **Default:** The original property value.
* Returns: [<Proxy>](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) A proxy to the mocked object. The mocked object contains a
  special `mock` property, which is an instance of [`MockPropertyContext`][], and
  can be used for inspecting and changing the behavior of the mocked property.

Creates a mock for a property value on an object. This allows you to track and control access to a specific property,
including how many times it is read (getter) or written (setter), and to restore the original value after mocking.

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

This function restores the default behavior of all mocks that were previously
created by this `MockTracker` and disassociates the mocks from the
`MockTracker` instance. Once disassociated, the mocks can still be used, but the
`MockTracker` instance can no longer be used to reset their behavior or
otherwise interact with them.

After each test completes, this function is called on the test context's
`MockTracker`. If the global `MockTracker` is used extensively, calling this
function manually is recommended.

### `mock.restoreAll()`

<!-- YAML
added:
  - v19.1.0
  - v18.13.0
-->

This function restores the default behavior of all mocks that were previously
created by this `MockTracker`. Unlike `mock.reset()`, `mock.restoreAll()` does
not disassociate the mocks from the `MockTracker` instance.

### `mock.setter(object, methodName[, implementation][, options])`

<!-- YAML
added:
  - v19.3.0
  - v18.13.0
-->

This function is syntax sugar for [`MockTracker.method`][] with `options.setter`
set to `true`.

## Class: `MockTimers`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
changes:
  - version: v23.1.0
    pr-url: https://github.com/nodejs/node/pull/55398
    description: The Mock Timers is now stable.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.1.0 | Мок-таймеры теперь стабильны. |

Mocking timers is a technique commonly used in software testing to simulate and
control the behavior of timers, such as `setInterval` and `setTimeout`,
without actually waiting for the specified time intervals.

MockTimers is also able to mock the `Date` object.

The [`MockTracker`][] provides a top-level `timers` export
which is a `MockTimers` instance.

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
    description: Updated parameters to be an option object with available APIs
                 and the default initial epoch.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v21.2.0, v20.11.0 | Обновлены параметры, теперь они представляют собой объект опции с доступными API и начальной эпохой по умолчанию. |

Enables timer mocking for the specified timers.

* `enableOptions` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options for enabling timer
  mocking. The following properties are supported:
  * `apis` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An optional array containing the timers to mock.
    The currently supported timer values are `'setInterval'`, `'setTimeout'`, `'setImmediate'`,
    and `'Date'`. **Default:** `['setInterval', 'setTimeout', 'setImmediate', 'Date']`.
    If no array is provided, all time related APIs (`'setInterval'`, `'clearInterval'`,
    `'setTimeout'`, `'clearTimeout'`, `'setImmediate'`, `'clearImmediate'`, and
    `'Date'`) will be mocked by default.
  * `now` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [<Date>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date) An optional number or Date object representing the
    initial time (in milliseconds) to use as the value
    for `Date.now()`. **Default:** `0`.

**Note:** When you enable mocking for a specific timer, its associated
clear function will also be implicitly mocked.

**Note:** Mocking `Date` will affect the behavior of the mocked timers
as they use the same internal clock.

Example usage without setting initial time:

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

The above example enables mocking for the `setInterval` timer and
implicitly mocks the `clearInterval` function. Only the `setInterval`
and `clearInterval` functions from [node:timers](./timers.md),
[node:timers/promises](./timers.md#timers-promises-api), and
`globalThis` will be mocked.

Example usage with initial time set

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

Example usage with initial Date object as time set

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

Alternatively, if you call `mock.timers.enable()` without any parameters:

All timers (`'setInterval'`, `'clearInterval'`, `'setTimeout'`, `'clearTimeout'`,
`'setImmediate'`, and `'clearImmediate'`) will be mocked. The `setInterval`,
`clearInterval`, `setTimeout`, `clearTimeout`, `setImmediate`, and
`clearImmediate` functions from `node:timers`, `node:timers/promises`, and
`globalThis` will be mocked. As well as the global `Date` object.

### `timers.reset()`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
-->

This function restores the default behavior of all mocks that were previously
created by this  `MockTimers` instance and disassociates the mocks
from the  `MockTracker` instance.

**Note:** After each test completes, this function is called on
the test context's  `MockTracker`.

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

Calls `timers.reset()`.

### `timers.tick([milliseconds])`

<!-- YAML
added:
  - v20.4.0
  - v18.19.0
-->

Advances time for all mocked timers.

* `milliseconds` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The amount of time, in milliseconds,
  to advance the timers. **Default:** `1`.

**Note:** This diverges from how `setTimeout` in Node.js behaves and accepts
only positive numbers. In Node.js, `setTimeout` with negative numbers is
only supported for web compatibility reasons.

The following example mocks a `setTimeout` function and
by using `.tick` advances in
time triggering all pending timers.

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

Alternatively, the `.tick` function can be called many times

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

Advancing time using `.tick` will also advance the time for any `Date` object
created after the mock was enabled (if `Date` was also set to be mocked).

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

#### Using clear functions

As mentioned, all clear functions from timers (`clearTimeout`, `clearInterval`,and
`clearImmediate`) are implicitly mocked. Take a look at this example using `setTimeout`:

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

#### Working with Node.js timers modules

Once you enable mocking timers, [node:timers](./timers.md),
[node:timers/promises](./timers.md#timers-promises-api) modules,
and timers from the Node.js global context are enabled:

**Note:** Destructuring functions such as
`import [setTimeout](timers.md#settimeoutcallback-delay-args) from 'node:timers'` is currently
not supported by this API.

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

In Node.js, `setInterval` from [node:timers/promises](./timers.md#timers-promises-api)
is an `AsyncGenerator` and is also supported by this API:

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

Triggers all pending mocked timers immediately. If the `Date` object is also
mocked, it will also advance the `Date` object to the furthest timer's time.

The example below triggers all pending timers immediately,
causing them to execute without any delay.

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

**Note:** The `runAll()` function is specifically designed for
triggering timers in the context of timer mocking.
It does not have any effect on real-time system
clocks or actual timers outside of the mocking environment.

### `timers.setTime(milliseconds)`

<!-- YAML
added:
  - v21.2.0
  - v20.11.0
-->

Sets the current Unix timestamp that will be used as reference for any mocked
`Date` objects.

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

#### Dates and Timers working together

Dates and timer objects are dependent on each other. If you use `setTime()` to
pass the current time to the mocked `Date` object, the set timers with
`setTimeout` and `setInterval` will **not** be affected.

However, the `tick` method **will** advance the mocked `Date` object.

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
    description: added type to test:pass and test:fail events for when the test is a suite.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v20.0.0, v19.9.0, v18.17.0 | добавлен тип событий test:pass и test:fail, когда тест представляет собой набор. |

* Extends [<Readable>](stream.md#readable-streams)

A successful call to [`run()`][] method will return a new [TestsStream](test.md)
object, streaming a series of events representing the execution of the tests.
`TestsStream` will emit events, in the order of the tests definition

Some of the events are guaranteed to be emitted in the same order as the tests
are defined, while others are emitted in the order that the tests execute.

### Event: `'test:coverage'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `summary` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An object containing the coverage report.
    * `files` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of coverage reports for individual files. Each
      report is an object with the following schema:
      * `path` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The absolute path of the file.
      * `totalLineCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of lines.
      * `totalBranchCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of branches.
      * `totalFunctionCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of functions.
      * `coveredLineCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of covered lines.
      * `coveredBranchCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of covered branches.
      * `coveredFunctionCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of covered functions.
      * `coveredLinePercent` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The percentage of lines covered.
      * `coveredBranchPercent` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The percentage of branches covered.
      * `coveredFunctionPercent` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The percentage of functions covered.
      * `functions` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of functions representing function
        coverage.
        * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The name of the function.
        * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The line number where the function is defined.
        * `count` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times the function was called.
      * `branches` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of branches representing branch coverage.
        * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The line number where the branch is defined.
        * `count` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times the branch was taken.
      * `lines` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of lines representing line
        numbers and the number of times they were covered.
        * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The line number.
        * `count` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of times the line was covered.
    * `thresholds` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An object containing whether or not the coverage for
      each coverage type.
      * `function` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The function coverage threshold.
      * `branch` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The branch coverage threshold.
      * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The line coverage threshold.
    * `totals` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An object containing a summary of coverage for all
      files.
      * `totalLineCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of lines.
      * `totalBranchCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of branches.
      * `totalFunctionCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of functions.
      * `coveredLineCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of covered lines.
      * `coveredBranchCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of covered branches.
      * `coveredFunctionCount` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of covered functions.
      * `coveredLinePercent` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The percentage of lines covered.
      * `coveredBranchPercent` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The percentage of branches covered.
      * `coveredFunctionPercent` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The percentage of functions covered.
    * `workingDirectory` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The working directory when code coverage
      began. This is useful for displaying relative path names in case the tests
      changed the working directory of the Node.js process.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.

Emitted when code coverage is enabled and all tests have completed.

### Event: `'test:complete'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `details` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Additional execution metadata.
    * `passed` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether the test passed or not.
    * `duration_ms` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The duration of the test in milliseconds.
    * `error` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | undefined An error wrapping the error thrown by the test
      if it did not pass.
      * `cause` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) The actual error thrown by the test.
    * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The type of the test, used to denote whether
      this is a suite.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `testNumber` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The ordinal number of the test.
  * `todo` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Present if [`context.todo`][] is called
  * `skip` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Present if [`context.skip`][] is called

Emitted when a test completes its execution.
This event is not emitted in the same order as the tests are
defined.
The corresponding declaration ordered events are `'test:pass'` and `'test:fail'`.

### Event: `'test:dequeue'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test type. Either `'suite'` or `'test'`.

Emitted when a test is dequeued, right before it is executed.
This event is not guaranteed to be emitted in the same order as the tests are
defined. The corresponding declaration ordered event is `'test:start'`.

### Event: `'test:diagnostic'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The diagnostic message.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `level` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The severity level of the diagnostic message.
    Possible values are:
    * `'info'`: Informational messages.
    * `'warn'`: Warnings.
    * `'error'`: Errors.

Emitted when [`context.diagnostic`][] is called.
This event is guaranteed to be emitted in the same order as the tests are
defined.

### Event: `'test:enqueue'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test type. Either `'suite'` or `'test'`.

Emitted when a test is enqueued for execution.

### Event: `'test:fail'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `details` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Additional execution metadata.
    * `duration_ms` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The duration of the test in milliseconds.
    * `error` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) An error wrapping the error thrown by the test.
      * `cause` [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) The actual error thrown by the test.
    * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The type of the test, used to denote whether
      this is a suite.
    * `attempt` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The attempt number of the test run,
      present only when using the [`--test-rerun-failures`][] flag.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `testNumber` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The ordinal number of the test.
  * `todo` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Present if [`context.todo`][] is called
  * `skip` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Present if [`context.skip`][] is called

Emitted when a test fails.
This event is guaranteed to be emitted in the same order as the tests are
defined.
The corresponding execution ordered event is `'test:complete'`.

### Event: `'test:interrupted'`

<!-- YAML
added: v25.7.0
-->

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `tests` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of objects containing information about the
    interrupted tests.
    * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined,
      or `undefined` if the test was run through the REPL.
    * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
      `undefined` if test was run through the REPL.
    * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
      `undefined` if the test was run through the REPL.
    * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
    * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.

Emitted when the test runner is interrupted by a `SIGINT` signal (e.g., when
pressing <kbd>Ctrl</kbd>+<kbd>C</kbd>). The event contains information about
the tests that were running at the time of interruption.

When using process isolation (the default), the test name will be the file path
since the parent runner only knows about file-level tests. When using
`--test-isolation=none`, the actual test name is shown.

### Event: `'test:pass'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `details` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Additional execution metadata.
    * `duration_ms` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The duration of the test in milliseconds.
    * `type` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The type of the test, used to denote whether
      this is a suite.
    * `attempt` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The attempt number of the test run,
      present only when using the [`--test-rerun-failures`][] flag.
    * `passed_on_attempt` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The attempt number the test passed on,
      present only when using the [`--test-rerun-failures`][] flag.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `testNumber` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The ordinal number of the test.
  * `todo` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Present if [`context.todo`][] is called
  * `skip` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | undefined Present if [`context.skip`][] is called

Emitted when a test passes.
This event is guaranteed to be emitted in the same order as the tests are
defined.
The corresponding execution ordered event is `'test:complete'`.

### Event: `'test:plan'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.
  * `count` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of subtests that have ran.

Emitted when all subtests have completed for a given test.
This event is guaranteed to be emitted in the same order as the tests are
defined.

### Event: `'test:start'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `column` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The column number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file,
    `undefined` if test was run through the REPL.
  * `line` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined The line number where the test is defined, or
    `undefined` if the test was run through the REPL.
  * `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The test name.
  * `nesting` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The nesting level of the test.

Emitted when a test starts reporting its own and its subtests status.
This event is guaranteed to be emitted in the same order as the tests are
defined.
The corresponding execution ordered event is `'test:dequeue'`.

### Event: `'test:stderr'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The path of the test file.
  * `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The message written to `stderr`.

Emitted when a running test writes to `stderr`.
This event is only emitted if `--test` flag is passed.
This event is not guaranteed to be emitted in the same order as the tests are
defined.

### Event: `'test:stdout'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The path of the test file.
  * `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The message written to `stdout`.

Emitted when a running test writes to `stdout`.
This event is only emitted if `--test` flag is passed.
This event is not guaranteed to be emitted in the same order as the tests are
defined.

### Event: `'test:summary'`

* `data` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
  * `counts` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An object containing the counts of various test results.
    * `cancelled` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of cancelled tests.
    * `failed` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of failed tests.
    * `passed` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of passed tests.
    * `skipped` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of skipped tests.
    * `suites` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of suites run.
    * `tests` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of tests run, excluding suites.
    * `todo` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of TODO tests.
    * `topLevel` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The total number of top level tests and suites.
  * `duration_ms` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The duration of the test run in milliseconds.
  * `file` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | undefined The path of the test file that generated the
    summary. If the summary corresponds to multiple files, this value is
    `undefined`.
  * `success` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Indicates whether or not the test run is considered
    successful or not. If any error condition occurs, such as a failing test or
    unmet coverage threshold, this value will be set to `false`.

Emitted when a test run completes. This event contains metrics pertaining to
the completed test run, and is useful for determining if a test run passed or
failed. If process-level test isolation is used, a `'test:summary'` event is
generated for each test file in addition to a final cumulative summary.

### Event: `'test:watch:drained'`

Emitted when no more tests are queued for execution in watch mode.

### Event: `'test:watch:restarted'`

Emitted when one or more tests are restarted due to a file change in watch mode.

## `getTestContext()`

<!-- YAML
added: REPLACEME
-->

* Returns: [<TestContext>](#class-testcontext) | [<SuiteContext>](#class-suitecontext) | undefined

Returns the [`TestContext`][] or [`SuiteContext`][] object associated with the
currently executing test or suite, or `undefined` if called outside of a test or
suite. This function can be used to access context information from within the
test or suite function or any async operations within them.

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

When called from a test, returns a [`TestContext`][].
When called from a suite, returns a [`SuiteContext`][].

If called from outside a test or suite (e.g., at the top level of a module or in
a setTimeout callback after execution has completed), this function returns
`undefined`.

When called from within a hook (before, beforeEach, after, afterEach), this
function returns the context of the test or suite that the hook is associated
with.

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
    description: The `before` function was added to TestContext.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v20.1.0, v18.17.0 | В TestContext была добавлена ​​функция «before». |

An instance of `TestContext` is passed to each test function in order to
interact with the test runner. However, the `TestContext` constructor is not
exposed as part of the API.

### `context.before([fn][, options])`

<!-- YAML
added:
  - v20.1.0
  - v18.17.0
-->

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function. The first argument
  to this function is a [`TestContext`][] object. If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

This function is used to create a hook running before
subtest of the current test.

### `context.beforeEach([fn][, options])`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function. The first argument
  to this function is a [`TestContext`][] object. If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

This function is used to create a hook running
before each subtest of the current test.

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

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function. The first argument
  to this function is a [`TestContext`][] object. If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

This function is used to create a hook that runs after the current test
finishes.

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

* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The hook function. The first argument
  to this function is a [`TestContext`][] object. If the hook uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the hook. The following
  properties are supported:
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress hook.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the hook will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.

This function is used to create a hook running
after each subtest of the current test.

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

An object containing assertion methods bound to `context`. The top-level
functions from the `node:assert` module are exposed here for the purpose of
creating test plans.

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

* `value` {any} A value to serialize to a string. If Node.js was started with
  the [`--test-update-snapshots`][] flag, the serialized value is written to
  `path`. Otherwise, the serialized value is compared to the contents of the
  existing snapshot file.
* `path` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The file where the serialized `value` is written.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options. The following properties
  are supported:
  * `serializers` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of synchronous functions used to serialize
    `value` into a string. `value` is passed as the only argument to the first
    serializer function. The return value of each serializer is passed as input
    to the next serializer. Once all serializers have run, the resulting value
    is coerced to a string. **Default:** If no serializers are provided, the
    test runner's default serializers are used.

This function serializes `value` and writes it to the file specified by `path`.

```js
test('snapshot test with default serialization', (t) => {
  t.assert.fileSnapshot({ value1: 1, value2: 2 }, './snapshots/snapshot.json');
});
```

This function differs from `context.assert.snapshot()` in the following ways:

* The snapshot file path is explicitly provided by the user.
* Each snapshot file is limited to a single snapshot value.
* No additional escaping is performed by the test runner.

These differences allow snapshot files to better support features such as syntax
highlighting.

#### `context.assert.snapshot(value[, options])`

<!-- YAML
added: v22.3.0
-->

* `value` {any} A value to serialize to a string. If Node.js was started with
  the [`--test-update-snapshots`][] flag, the serialized value is written to
  the snapshot file. Otherwise, the serialized value is compared to the
  corresponding value in the existing snapshot file.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Optional configuration options. The following properties
  are supported:
  * `serializers` [<Array>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array) An array of synchronous functions used to serialize
    `value` into a string. `value` is passed as the only argument to the first
    serializer function. The return value of each serializer is passed as input
    to the next serializer. Once all serializers have run, the resulting value
    is coerced to a string. **Default:** If no serializers are provided, the
    test runner's default serializers are used.

This function implements assertions for snapshot testing.

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

* `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Message to be reported.

This function is used to write diagnostics to the output. Any diagnostic
information is included at the end of the test's results. This function does
not return a value.

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

The absolute path of the test file that created the current test. If a test file
imports additional modules that generate tests, the imported tests will return
the path of the root test file.

### `context.fullName`

<!-- YAML
added:
  - v22.3.0
  - v20.16.0
-->

The name of the test and each of its ancestors, separated by `>`.

### `context.name`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

The name of the test.

### `context.passed`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* Type: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) `false` before the test is executed, e.g. in a `beforeEach` hook.

Indicated whether the test succeeded.

### `context.error`

<!-- YAML
added:
  - v21.7.0
  - v20.12.0
-->

* Type: [<Error>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | null

The failure reason for the test/case; wrapped and available via `context.error.cause`.

### `context.attempt`

<!-- YAML
added: v25.0.0
-->

* Type: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The attempt number of the test. This value is zero-based, so the first attempt is `0`,
the second attempt is `1`, and so on. This property is useful in conjunction with the
`--test-rerun-failures` option to determine which attempt the test is currently running.

### `context.workerId`

<!-- YAML
added: v25.8.0
-->

* Type: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | undefined

The unique identifier of the worker running the current test file. This value is
derived from the `NODE_TEST_WORKER_ID` environment variable. When running tests
with `--test-isolation=process` (the default), each test file runs in a separate
child process and is assigned a worker ID from 1 to N, where N is the number of
concurrent workers. When running with `--test-isolation=none`, all tests run in
the same process and the worker ID is always 1. This value is `undefined` when
not running in a test context.

This property is useful for splitting resources (like database connections or
server ports) across concurrent test files:

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
    description: Add the `options` parameter.
  - version:
    - v23.4.0
    - v22.13.0
    pr-url: https://github.com/nodejs/node/pull/55895
    description: This function is no longer experimental.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v23.9.0, v22.15.0 | Добавьте параметр `options`. |
    | v23.4.0, v22.13.0 | Эта функция больше не является экспериментальной. |

* `count` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of assertions and subtests that are expected to run.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Additional options for the plan.
  * `wait` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The wait time for the plan:
    * If `true`, the plan waits indefinitely for all assertions and subtests to run.
    * If `false`, the plan performs an immediate check after the test function completes,
      without waiting for any pending assertions or subtests.
      Any assertions or subtests that complete after this check will not be counted towards the plan.
    * If a number, it specifies the maximum wait time in milliseconds
      before timing out while waiting for expected assertions and subtests to be matched.
      If the timeout is reached, the test will fail.
      **Default:** `false`.

This function is used to set the number of assertions and subtests that are expected to run
within the test. If the number of assertions and subtests that run does not match the
expected count, the test will fail.

> Note: To make sure assertions are tracked, `t.assert` must be used instead of `assert` directly.

```js
test('top level test', (t) => {
  t.plan(2);
  t.assert.ok('some relevant assertion here');
  t.test('subtest', () => {});
});
```

When working with asynchronous code, the `plan` function can be used to ensure that the
correct number of assertions are run:

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

When using the `wait` option, you can control how long the test will wait for the expected assertions.
For example, setting a maximum wait time ensures that the test will wait for asynchronous assertions
to complete within the specified timeframe:

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

Note: If a `wait` timeout is specified, it begins counting down only after the test function finishes executing.

### `context.runOnly(shouldRunOnlyTests)`

<!-- YAML
added:
  - v18.0.0
  - v16.17.0
-->

* `shouldRunOnlyTests` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Whether or not to run `only` tests.

If `shouldRunOnlyTests` is truthy, the test context will only run tests that
have the `only` option set. Otherwise, all tests are run. If Node.js was not
started with the [`--test-only`][] command-line option, this function is a
no-op.

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

* Type: [<AbortSignal>](globals.md#abortsignal)

Can be used to abort test subtasks when the test has been aborted.

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

* `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Optional skip message.

This function causes the test's output to indicate the test as skipped. If
`message` is provided, it is included in the output. Calling `skip()` does
not terminate execution of the test function. This function does not return a
value.

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

* `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Optional `TODO` message.

This function adds a `TODO` directive to the test's output. If `message` is
provided, it is included in the output. Calling `todo()` does not terminate
execution of the test function. This function does not return a value.

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
    description: Add a `signal` option.
  - version:
    - v18.7.0
    - v16.17.0
    pr-url: https://github.com/nodejs/node/pull/43505
    description: Add a `timeout` option.
-->

??? note "История"
    | Версия | Изменения |
    | --- | --- |
    | v18.8.0, v16.18.0 | Добавьте опцию «сигнал». |
    | v18.7.0, v16.17.0 | Добавьте опцию «тайм-аут». |

* `name` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) The name of the subtest, which is displayed when reporting
  test results. **Default:** The `name` property of `fn`, or `'<anonymous>'` if
  `fn` does not have a name.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) Configuration options for the subtest. The following
  properties are supported:
  * `concurrency` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) | [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | null If a number is provided,
    then that many tests would run asynchronously (they are still managed by the single-threaded event loop).
    If `true`, it would run all subtests in parallel.
    If `false`, it would only run one test at a time.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `null`.
  * `only` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) If truthy, and the test context is configured to run
    `only` tests, then this test will be run. Otherwise, the test is skipped.
    **Default:** `false`.
  * `signal` [<AbortSignal>](globals.md#abortsignal) Allows aborting an in-progress test.
  * `skip` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If truthy, the test is skipped. If a string is
    provided, that string is displayed in the test results as the reason for
    skipping the test. **Default:** `false`.
  * `todo` [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) | [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) If truthy, the test marked as `TODO`. If a string
    is provided, that string is displayed in the test results as the reason why
    the test is `TODO`. **Default:** `false`.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) A number of milliseconds the test will fail after.
    If unspecified, subtests inherit this value from their parent.
    **Default:** `Infinity`.
  * `plan` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of assertions and subtests expected to be run in the test.
    If the number of assertions run in the test does not match the number
    specified in the plan, the test will fail.
    **Default:** `undefined`.
* `fn` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) The function under test. The first argument
  to this function is a [`TestContext`][] object. If the test uses callbacks,
  the callback function is passed as the second argument. **Default:** A no-op
  function.
* Returns: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfilled with `undefined` once the test completes.

This function is used to create subtests under the current test. This function
behaves in the same fashion as the top level [`test()`][] function.

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

* `condition` [<Function>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [<AsyncFunction>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/async_function) An assertion function that is invoked
  periodically until it completes successfully or the defined polling timeout
  elapses. Successful completion is defined as not throwing or rejecting. This
  function does not accept any arguments, and is allowed to return any value.
* `options` [<Object>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) An optional configuration object for the polling operation.
  The following properties are supported:
  * `interval` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The number of milliseconds to wait after an unsuccessful
    invocation of `condition` before trying again. **Default:** `50`.
  * `timeout` [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type) The poll timeout in milliseconds. If `condition` has not
    succeeded by the time this elapses, an error occurs. **Default:** `1000`.
* Returns: [<Promise>](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) Fulfilled with the value returned by `condition`.

This method polls a `condition` function until that function either returns
successfully or the operation times out.

## Class: `SuiteContext`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
-->

An instance of `SuiteContext` is passed to each suite function in order to
interact with the test runner. However, the `SuiteContext` constructor is not
exposed as part of the API.

### `context.filePath`

<!-- YAML
added: v22.6.0
-->

The absolute path of the test file that created the current suite. If a test
file imports additional modules that generate suites, the imported suites will
return the path of the root test file.

### `context.fullName`

<!-- YAML
added:
  - v22.3.0
  - v20.16.0
-->

The name of the suite and each of its ancestors, separated by `>`.

### `context.name`

<!-- YAML
added:
  - v18.8.0
  - v16.18.0
-->

The name of the suite.

### `context.signal`

<!-- YAML
added:
  - v18.7.0
  - v16.17.0
-->

* Type: [<AbortSignal>](globals.md#abortsignal)

Can be used to abort test subtasks when the test has been aborted.

### `context.passed`

<!-- YAML
added: REPLACEME
-->

* Type: [<boolean>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type)

Indicates whether the suite and all of its subtests have passed.

### `context.attempt`

<!-- YAML
added: REPLACEME
-->

* Type: [<number>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Number_type)

The attempt number of the suite. This value is zero-based, so the first attempt is `0`,
the second attempt is `1`, and so on. This property is useful in conjunction with the
`--test-rerun-failures` option to determine the attempt number of the current run.

### `context.diagnostic(message)`

<!-- YAML
added: REPLACEME
-->

* `message` [<string>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) A diagnostic message to output.

Output a diagnostic message. This is typically used for logging information
about the current suite or its tests.

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
