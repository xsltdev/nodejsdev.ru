---
description: В assert модуль предоставляет набор функций утверждения для проверки инвариантов
---

# Модуль assert

<!--introduced_in=v0.1.21-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/assert.js -->

В `assert` модуль предоставляет набор функций утверждения для проверки инвариантов.

## Строгий режим утверждения

<!-- YAML
added: v9.9.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34001
    description: Exposed as `require('assert/strict')`.
  - version:
      - v13.9.0
      - v12.16.2
    pr-url: https://github.com/nodejs/node/pull/31635
    description: Changed "strict mode" to "strict assertion mode" and "legacy
                 mode" to "legacy assertion mode" to avoid confusion with the
                 more usual meaning of "strict mode".
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/17615
    description: Added error diffs to the strict assertion mode.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/17002
    description: Added strict assertion mode to the assert module.
-->

В режиме строгого утверждения нестрогие методы ведут себя так же, как соответствующие им строгие методы. Например, [`assert.deepEqual()`](#assertdeepequalactual-expected-message) будет вести себя как [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

В строгом режиме утверждения сообщения об ошибках для объектов отображают различие. В устаревшем режиме утверждения сообщения об ошибках для объектов отображают объекты, часто усеченные.

Чтобы использовать строгий режим утверждения:

```mjs
import { strict as assert } from 'assert';
```

```cjs
const assert = require('assert').strict;
```

```mjs
import assert from 'assert/strict';
```

```cjs
const assert = require('assert/strict');
```

Пример разницы ошибок:

```mjs
import { strict as assert } from 'assert';

assert.deepEqual(
  [[[1, 2, 3]], 4, 5],
  [[[1, 2, '3']], 4, 5]
);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected ... Lines skipped
//
//   [
//     [
// ...
//       2,
// +     3
// -     '3'
//     ],
// ...
//     5
//   ]
```

```cjs
const assert = require('assert/strict');

assert.deepEqual(
  [[[1, 2, 3]], 4, 5],
  [[[1, 2, '3']], 4, 5]
);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected ... Lines skipped
//
//   [
//     [
// ...
//       2,
// +     3
// -     '3'
//     ],
// ...
//     5
//   ]
```

Чтобы отключить цвета, используйте `NO_COLOR` или `NODE_DISABLE_COLORS` переменные среды. Это также отключит цвета в REPL. Для получения дополнительной информации о поддержке цвета в терминальных средах прочтите tty [`getColorDepth()`](tty.md#writestreamgetcolordepthenv) документация.

## Устаревший режим утверждения

В устаревшем режиме утверждения используется [Абстрактное сравнение равенства](https://tc39.github.io/ecma262/#sec-abstract-equality-comparison) в:

- [`assert.deepEqual()`](#assertdeepequalactual-expected-message)
- [`assert.equal()`](#assertequalactual-expected-message)
- [`assert.notDeepEqual()`](#assertnotdeepequalactual-expected-message)
- [`assert.notEqual()`](#assertnotequalactual-expected-message)

Чтобы использовать устаревший режим утверждения:

```mjs
import assert from 'assert';
```

```cjs
const assert = require('assert');
```

По возможности используйте [строгий режим утверждения](#strict-assertion-mode) вместо. В противном случае [Абстрактное сравнение равенства](https://tc39.github.io/ecma262/#sec-abstract-equality-comparison) может вызвать удивительные результаты. Это особенно актуально для [`assert.deepEqual()`](#assertdeepequalactual-expected-message), где правила сравнения слабые:

```cjs
// WARNING: This does not throw an AssertionError!
assert.deepEqual(/a/gi, new Date());
```

## Класс: assert.AssertionError

- Расширяется: {errors.Error}

Указывает на неудачу утверждения. Все ошибки, выдаваемые `assert` модуль будет экземплярами `AssertionError` класс.

### `new assert.AssertionError(options)`

<!-- YAML
added: v0.1.21
-->

- `options` {Объект}
  - `message` {строка} Если указано, сообщение об ошибке устанавливается на это значение.
  - `actual` {any} `actual` свойство экземпляра ошибки.
  - `expected` {any} `expected` свойство экземпляра ошибки.
  - `operator` {строка} `operator` свойство экземпляра ошибки.
  - `stackStartFn` {Функция} Если предоставлено, сгенерированная трассировка стека пропускает кадры перед этой функцией.

Подкласс `Error` что указывает на несостоятельность утверждения.

Все экземпляры содержат встроенный `Error` характеристики (`message` а также `name`) а также:

- `actual` {any} Установите на `actual` аргумент для таких методов, как [`assert.strictEqual()`](#assertstrictequalactual-expected-message).
- `expected` {any} Установите на `expected` значение для таких методов, как [`assert.strictEqual()`](#assertstrictequalactual-expected-message).
- `generatedMessage` {boolean} Указывает, было ли сообщение создано автоматически (`true`) или не.
- `code` {строка} Значение всегда `ERR_ASSERTION` чтобы показать, что ошибка является ошибкой утверждения.
- `operator` {строка} Устанавливается в переданное значение оператора.

```mjs
import assert from 'assert';

// Generate an AssertionError to compare the error message later:
const { message } = new assert.AssertionError({
  actual: 1,
  expected: 2,
  operator: 'strictEqual',
});

// Verify error output:
try {
  assert.strictEqual(1, 2);
} catch (err) {
  assert(err instanceof assert.AssertionError);
  assert.strictEqual(err.message, message);
  assert.strictEqual(err.name, 'AssertionError');
  assert.strictEqual(err.actual, 1);
  assert.strictEqual(err.expected, 2);
  assert.strictEqual(err.code, 'ERR_ASSERTION');
  assert.strictEqual(err.operator, 'strictEqual');
  assert.strictEqual(err.generatedMessage, true);
}
```

```cjs
const assert = require('assert');

// Generate an AssertionError to compare the error message later:
const { message } = new assert.AssertionError({
  actual: 1,
  expected: 2,
  operator: 'strictEqual',
});

// Verify error output:
try {
  assert.strictEqual(1, 2);
} catch (err) {
  assert(err instanceof assert.AssertionError);
  assert.strictEqual(err.message, message);
  assert.strictEqual(err.name, 'AssertionError');
  assert.strictEqual(err.actual, 1);
  assert.strictEqual(err.expected, 2);
  assert.strictEqual(err.code, 'ERR_ASSERTION');
  assert.strictEqual(err.operator, 'strictEqual');
  assert.strictEqual(err.generatedMessage, true);
}
```

## Класс: `assert.CallTracker`

<!-- YAML
added:
  - v14.2.0
  - v12.19.0
-->

> Стабильность: 1 - экспериментальная

Эта функция в настоящее время является экспериментальной, и ее поведение все еще может измениться.

### `new assert.CallTracker()`

<!-- YAML
added:
  - v14.2.0
  - v12.19.0
-->

Создает новый [`CallTracker`](#class-assertcalltracker) объект, который можно использовать для отслеживания того, вызывались ли функции определенное количество раз. В `tracker.verify()` должен быть вызван для проведения проверки. Обычным шаблоном было бы назвать это в [`process.on('exit')`](process.md#event-exit) обработчик.

```mjs
import assert from 'assert';
import process from 'process';

const tracker = new assert.CallTracker();

function func() {}

// callsfunc() must be called exactly 1 time before tracker.verify().
const callsfunc = tracker.calls(func, 1);

callsfunc();

// Calls tracker.verify() and verifies if all tracker.calls() functions have
// been called exact times.
process.on('exit', () => {
  tracker.verify();
});
```

```cjs
const assert = require('assert');

const tracker = new assert.CallTracker();

function func() {}

// callsfunc() must be called exactly 1 time before tracker.verify().
const callsfunc = tracker.calls(func, 1);

callsfunc();

// Calls tracker.verify() and verifies if all tracker.calls() functions have
// been called exact times.
process.on('exit', () => {
  tracker.verify();
});
```

### `tracker.calls([fn][, exact])`

<!-- YAML
added:
  - v14.2.0
  - v12.19.0
-->

- `fn` {Функция} **Дефолт:** Безоперационная функция.
- `exact` {количество} **Дефолт:** `1`.
- Возвращает: {Функция}, которая завершает `fn`.

Ожидается, что функция-оболочка будет вызываться точно `exact` раз. Если функция не была вызвана точно `exact` времена, когда [`tracker.verify()`](#trackerverify) называется, то [`tracker.verify()`](#trackerverify) выдаст ошибку.

```mjs
import assert from 'assert';

// Creates call tracker.
const tracker = new assert.CallTracker();

function func() {}

// Returns a function that wraps func() that must be called exact times
// before tracker.verify().
const callsfunc = tracker.calls(func);
```

```cjs
const assert = require('assert');

// Creates call tracker.
const tracker = new assert.CallTracker();

function func() {}

// Returns a function that wraps func() that must be called exact times
// before tracker.verify().
const callsfunc = tracker.calls(func);
```

### `tracker.report()`

<!-- YAML
added:
  - v14.2.0
  - v12.19.0
-->

- Возвращает: {Массив} объектов, содержащих информацию о функциях-оболочках, возвращаемых [`tracker.calls()`](#trackercallsfn-exact).
- Объект Object}
  - `message` {нить}
  - `actual` {число} Фактическое количество вызовов функции.
  - `expected` {число} Ожидаемое количество вызовов функции.
  - `operator` {строка} Имя функции, которая помещена в оболочку.
  - `stack` {Object} Трассировка стека функции.

Массивы содержат информацию об ожидаемом и фактическом количестве вызовов функций, которые не были вызваны ожидаемое количество раз.

```mjs
import assert from 'assert';

// Creates call tracker.
const tracker = new assert.CallTracker();

function func() {}

function foo() {}

// Returns a function that wraps func() that must be called exact times
// before tracker.verify().
const callsfunc = tracker.calls(func, 2);

// Returns an array containing information on callsfunc()
tracker.report();
// [
//  {
//    message: 'Expected the func function to be executed 2 time(s) but was
//    executed 0 time(s).',
//    actual: 0,
//    expected: 2,
//    operator: 'func',
//    stack: stack trace
//  }
// ]
```

```cjs
const assert = require('assert');

// Creates call tracker.
const tracker = new assert.CallTracker();

function func() {}

function foo() {}

// Returns a function that wraps func() that must be called exact times
// before tracker.verify().
const callsfunc = tracker.calls(func, 2);

// Returns an array containing information on callsfunc()
tracker.report();
// [
//  {
//    message: 'Expected the func function to be executed 2 time(s) but was
//    executed 0 time(s).',
//    actual: 0,
//    expected: 2,
//    operator: 'func',
//    stack: stack trace
//  }
// ]
```

### `tracker.verify()`

<!-- YAML
added:
  - v14.2.0
  - v12.19.0
-->

Перебирает список функций, переданных в [`tracker.calls()`](#trackercallsfn-exact) и выдаст ошибку для функций, которые не вызывались ожидаемое количество раз.

```mjs
import assert from 'assert';

// Creates call tracker.
const tracker = new assert.CallTracker();

function func() {}

// Returns a function that wraps func() that must be called exact times
// before tracker.verify().
const callsfunc = tracker.calls(func, 2);

callsfunc();

// Will throw an error since callsfunc() was only called once.
tracker.verify();
```

```cjs
const assert = require('assert');

// Creates call tracker.
const tracker = new assert.CallTracker();

function func() {}

// Returns a function that wraps func() that must be called exact times
// before tracker.verify().
const callsfunc = tracker.calls(func, 2);

callsfunc();

// Will throw an error since callsfunc() was only called once.
tracker.verify();
```

## `assert(value[, message])`

<!-- YAML
added: v0.5.9
-->

- `value` {any} Ввод, который проверяется на достоверность.
- `message` {строка | Ошибка}

Псевдоним [`assert.ok()`](#assertokvalue-message).

## `assert.deepEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical in case both sides are
                 NaN.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/25008
    description: The type tags are now properly compared and there are a couple
                 minor comparison adjustments to make the check less surprising.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15001
    description: The `Error` names and messages are now properly compared.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12142
    description: The `Set` and `Map` content is also compared.
  - version:
      - v6.4.0
      - v4.7.1
    pr-url: https://github.com/nodejs/node/pull/8002
    description: Typed array slices are handled correctly now.
  - version:
      - v6.1.0
      - v4.5.0
    pr-url: https://github.com/nodejs/node/pull/6432
    description: Objects with circular references can be used as inputs now.
  - version:
      - v5.10.1
      - v4.4.3
    pr-url: https://github.com/nodejs/node/pull/5910
    description: Handle non-`Uint8Array` typed arrays correctly.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

**Строгий режим утверждения**

Псевдоним [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

**Устаревший режим утверждения**

> Стабильность: 3 - Наследие: Использовать [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message) вместо.

Тесты на глубокое равенство между `actual` а также `expected` параметры. Рассмотрите возможность использования [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message) вместо. [`assert.deepEqual()`](#assertdeepequalactual-expected-message) может иметь удивительные результаты.

_Глубокое равенство_ означает, что перечисляемые «собственные» свойства дочерних объектов также рекурсивно оцениваются по следующим правилам.

### Детали сравнения

- Примитивные значения сравниваются с [Абстрактное сравнение равенства](https://tc39.github.io/ecma262/#sec-abstract-equality-comparison) ( `==` ) за исключением `NaN`. Он считается идентичным, если обе стороны `NaN`.
- [Теги типа](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны быть одинаковыми.
- Только [перечислимые "собственные" свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties) считаются.
- [`Error`](errors.md#class-error) имена и сообщения всегда сравниваются, даже если это не перечислимые свойства.
- [Обертки объектов](https://developer.mozilla.org/en-US/docs/Glossary/Primitive#Primitive_wrapper_objects_in_JavaScript) сравниваются и как объекты, и как развернутые значения.
- `Object` свойства сравниваются неупорядоченно.
- [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) ключи и [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) товары сравниваются неупорядоченно.
- Рекурсия останавливается, когда обе стороны различаются или обе стороны встречаются с круговой ссылкой.
- Реализация не проверяет [`[[Prototype]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов.
- [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) свойства не сравниваются.
- [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) а также [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) сравнение не полагается на их значения.

В следующем примере не создается [`AssertionError`](#class-assertassertionerror) потому что примитивы считаются равными [Абстрактное сравнение равенства](https://tc39.github.io/ecma262/#sec-abstract-equality-comparison) ( `==` ).

```mjs
import assert from 'assert';
// WARNING: This does not throw an AssertionError!

assert.deepEqual('+00000000', false);
```

```cjs
const assert = require('assert');
// WARNING: This does not throw an AssertionError!

assert.deepEqual('+00000000', false);
```

«Глубокое» равенство означает, что также оцениваются перечисляемые «собственные» свойства дочерних объектов:

```mjs
import assert from 'assert';

const obj1 = {
  a: {
    b: 1,
  },
};
const obj2 = {
  a: {
    b: 2,
  },
};
const obj3 = {
  a: {
    b: 1,
  },
};
const obj4 = Object.create(obj1);

assert.deepEqual(obj1, obj1);
// OK

// Values of b are different:
assert.deepEqual(obj1, obj2);
// AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }

assert.deepEqual(obj1, obj3);
// OK

// Prototypes are ignored:
assert.deepEqual(obj1, obj4);
// AssertionError: { a: { b: 1 } } deepEqual {}
```

```cjs
const assert = require('assert');

const obj1 = {
  a: {
    b: 1,
  },
};
const obj2 = {
  a: {
    b: 2,
  },
};
const obj3 = {
  a: {
    b: 1,
  },
};
const obj4 = Object.create(obj1);

assert.deepEqual(obj1, obj1);
// OK

// Values of b are different:
assert.deepEqual(obj1, obj2);
// AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }

assert.deepEqual(obj1, obj3);
// OK

// Prototypes are ignored:
assert.deepEqual(obj1, obj4);
// AssertionError: { a: { b: 1 } } deepEqual {}
```

Если значения не равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.deepStrictEqual(actual, expected[, message])`

<!-- YAML
added: v1.2.0
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15169
    description: Enumerable symbol properties are now compared.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15036
    description: The `NaN` is now compared using the
              [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero)
              comparison.
  - version: v8.5.0
    pr-url: https://github.com/nodejs/node/pull/15001
    description: The `Error` names and messages are now properly compared.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12142
    description: The `Set` and `Map` content is also compared.
  - version:
    - v6.4.0
    - v4.7.1
    pr-url: https://github.com/nodejs/node/pull/8002
    description: Typed array slices are handled correctly now.
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/6432
    description: Objects with circular references can be used as inputs now.
  - version:
    - v5.10.1
    - v4.4.3
    pr-url: https://github.com/nodejs/node/pull/5910
    description: Handle non-`Uint8Array` typed arrays correctly.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

Тесты на глубокое равенство между `actual` а также `expected` параметры. «Глубокое» равенство означает, что перечисляемые «собственные» свойства дочерних объектов рекурсивно оцениваются также по следующим правилам.

### Детали сравнения

- Примитивные значения сравниваются с помощью [SameValue Сравнение](https://tc39.github.io/ecma262/#sec-samevalue), использован [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
- [Теги типа](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны быть одинаковыми.
- [`[[Prototype]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов сравниваются с помощью [Строгое сравнение равенства](https://tc39.github.io/ecma262/#sec-strict-equality-comparison).
- Только [перечислимые "собственные" свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties) считаются.
- [`Error`](errors.md#class-error) имена и сообщения всегда сравниваются, даже если это не перечислимые свойства.
- Бесчисленное количество собственных [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) свойства также сравниваются.
- [Обертки объектов](https://developer.mozilla.org/en-US/docs/Glossary/Primitive#Primitive_wrapper_objects_in_JavaScript) сравниваются и как объекты, и как развернутые значения.
- `Object` свойства сравниваются неупорядоченно.
- [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) ключи и [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) товары сравниваются неупорядоченно.
- Рекурсия останавливается, когда обе стороны различаются или обе стороны встречаются с круговой ссылкой.
- [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) а также [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) сравнение не полагается на их значения. Подробнее см. Ниже.

```mjs
import assert from 'assert/strict';

// This fails because 1 !== '1'.
deepStrictEqual({ a: 1 }, { a: '1' });
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
//   {
// +   a: 1
// -   a: '1'
//   }

// The following objects don't have own properties
const date = new Date();
const object = {};
const fakeDate = {};
Object.setPrototypeOf(fakeDate, Date.prototype);

// Different [[Prototype]]:
assert.deepStrictEqual(object, fakeDate);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + {}
// - Date {}

// Different type tags:
assert.deepStrictEqual(date, fakeDate);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + 2018-04-26T00:49:08.604Z
// - Date {}

assert.deepStrictEqual(NaN, NaN);
// OK, because of the SameValue comparison

// Different unwrapped numbers:
assert.deepStrictEqual(new Number(1), new Number(2));
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + [Number: 1]
// - [Number: 2]

assert.deepStrictEqual(new String('foo'), Object('foo'));
// OK because the object and the string are identical when unwrapped.

assert.deepStrictEqual(-0, -0);
// OK

// Different zeros using the SameValue Comparison:
assert.deepStrictEqual(0, -0);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + 0
// - -0

const symbol1 = Symbol();
const symbol2 = Symbol();
assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol1]: 1 });
// OK, because it is the same symbol on both objects.

assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol2]: 1 });
// AssertionError [ERR_ASSERTION]: Inputs identical but not reference equal:
//
// {
//   [Symbol()]: 1
// }

const weakMap1 = new WeakMap();
const weakMap2 = new WeakMap([[{}, {}]]);
const weakMap3 = new WeakMap();
weakMap3.unequal = true;

assert.deepStrictEqual(weakMap1, weakMap2);
// OK, because it is impossible to compare the entries

// Fails because weakMap3 has a property that weakMap1 does not contain:
assert.deepStrictEqual(weakMap1, weakMap3);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
//   WeakMap {
// +   [items unknown]
// -   [items unknown],
// -   unequal: true
//   }
```

```cjs
const assert = require('assert/strict');

// This fails because 1 !== '1'.
assert.deepStrictEqual({ a: 1 }, { a: '1' });
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
//   {
// +   a: 1
// -   a: '1'
//   }

// The following objects don't have own properties
const date = new Date();
const object = {};
const fakeDate = {};
Object.setPrototypeOf(fakeDate, Date.prototype);

// Different [[Prototype]]:
assert.deepStrictEqual(object, fakeDate);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + {}
// - Date {}

// Different type tags:
assert.deepStrictEqual(date, fakeDate);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + 2018-04-26T00:49:08.604Z
// - Date {}

assert.deepStrictEqual(NaN, NaN);
// OK, because of the SameValue comparison

// Different unwrapped numbers:
assert.deepStrictEqual(new Number(1), new Number(2));
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + [Number: 1]
// - [Number: 2]

assert.deepStrictEqual(new String('foo'), Object('foo'));
// OK because the object and the string are identical when unwrapped.

assert.deepStrictEqual(-0, -0);
// OK

// Different zeros using the SameValue Comparison:
assert.deepStrictEqual(0, -0);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
// + 0
// - -0

const symbol1 = Symbol();
const symbol2 = Symbol();
assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol1]: 1 });
// OK, because it is the same symbol on both objects.

assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol2]: 1 });
// AssertionError [ERR_ASSERTION]: Inputs identical but not reference equal:
//
// {
//   [Symbol()]: 1
// }

const weakMap1 = new WeakMap();
const weakMap2 = new WeakMap([[{}, {}]]);
const weakMap3 = new WeakMap();
weakMap3.unequal = true;

assert.deepStrictEqual(weakMap1, weakMap2);
// OK, because it is impossible to compare the entries

// Fails because weakMap3 has a property that weakMap1 does not contain:
assert.deepStrictEqual(weakMap1, weakMap3);
// AssertionError: Expected inputs to be strictly deep-equal:
// + actual - expected
//
//   WeakMap {
// +   [items unknown]
// -   [items unknown],
// -   unequal: true
//   }
```

Если значения не равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо `AssertionError`.

## `assert.doesNotMatch(string, regexp[, message])`

<!-- YAML
added:
  - v13.6.0
  - v12.16.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/38111
    description: This API is no longer experimental.
-->

- `string` {нить}
- `regexp` {RegExp}
- `message` {строка | Ошибка}

Ожидает `string` ввод не соответствует регулярному выражению.

```mjs
import assert from 'assert/strict';

assert.doesNotMatch('I will fail', /fail/);
// AssertionError [ERR_ASSERTION]: The input was expected to not match the ...

assert.doesNotMatch(123, /pass/);
// AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

assert.doesNotMatch('I will pass', /different/);
// OK
```

```cjs
const assert = require('assert/strict');

assert.doesNotMatch('I will fail', /fail/);
// AssertionError [ERR_ASSERTION]: The input was expected to not match the ...

assert.doesNotMatch(123, /pass/);
// AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

assert.doesNotMatch('I will pass', /different/);
// OK
```

Если значения совпадают, или если `string` аргумент другого типа, чем `string`, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.doesNotReject(asyncFn[, error][, message])`

<!-- YAML
added: v10.0.0
-->

- `asyncFn` {Функция | Обещание}
- `error` {RegExp | Функция}
- `message` {нить}

Ждет `asyncFn` обещание или, если `asyncFn` является функцией, немедленно вызывает функцию и ожидает завершения возвращенного обещания. Затем он проверит, не отклонено ли обещание.

Если `asyncFn` это функция, которая синхронно выдает ошибку, `assert.doesNotReject()` вернет отклоненный `Promise` с этой ошибкой. Если функция не возвращает обещание, `assert.doesNotReject()` вернет отклоненный `Promise` с [`ERR_INVALID_RETURN_VALUE`](errors.md#err_invalid_return_value) ошибка. В обоих случаях обработчик ошибок пропускается.

С использованием `assert.doesNotReject()` на самом деле бесполезен, потому что нет никакой пользы в том, чтобы поймать отказ и затем отвергнуть его снова. Вместо этого рассмотрите возможность добавления комментария рядом с конкретным путем кода, который не должен отклонять и сохранять сообщения об ошибках как можно более выразительными.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) или функция проверки. Видеть [`assert.throws()`](#assertthrowsfn-error-message) Больше подробностей.

Помимо асинхронной природы ожидания завершения ведет себя идентично [`assert.doesNotThrow()`](#assertdoesnotthrowfn-error-message).

<!-- eslint-disable no-restricted-syntax -->

```mjs
import assert from 'assert/strict';

await assert.doesNotReject(async () => {
  throw new TypeError('Wrong value');
}, SyntaxError);
```

```cjs
const assert = require('assert/strict');

(async () => {
  await assert.doesNotReject(async () => {
    throw new TypeError('Wrong value');
  }, SyntaxError);
})();
```

<!-- eslint-disable no-restricted-syntax -->

```mjs
import assert from 'assert/strict';

assert
  .doesNotReject(
    Promise.reject(new TypeError('Wrong value'))
  )
  .then(() => {
    // ...
  });
```

<!-- eslint-disable no-restricted-syntax -->

```cjs
const assert = require('assert/strict');

assert
  .doesNotReject(
    Promise.reject(new TypeError('Wrong value'))
  )
  .then(() => {
    // ...
  });
```

## `assert.doesNotThrow(fn[, error][, message])`

<!-- YAML
added: v0.1.21
changes:
  - version:
    - v5.11.0
    - v4.4.5
    pr-url: https://github.com/nodejs/node/pull/2407
    description: The `message` parameter is respected now.
  - version: v4.2.0
    pr-url: https://github.com/nodejs/node/pull/3276
    description: The `error` parameter can now be an arrow function.
-->

- `fn` {Функция}
- `error` {RegExp | Функция}
- `message` {нить}

Утверждает, что функция `fn` не выдает ошибку.

С использованием `assert.doesNotThrow()` на самом деле бесполезен, потому что нет никакой пользы в обнаружении ошибки и ее повторном выбросе. Вместо этого рассмотрите возможность добавления комментария рядом с конкретным путем кода, который не должен выдавать и сохранять сообщения об ошибках как можно более выразительными.

Когда `assert.doesNotThrow()` вызывается, он немедленно вызовет `fn` функция.

Если возникает ошибка того же типа, что и указанная в `error` параметр, затем [`AssertionError`](#class-assertassertionerror) брошен. Если ошибка другого типа, или если `error` параметр не определен, ошибка передается обратно вызывающей стороне.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) или функция проверки. Видеть [`assert.throws()`](#assertthrowsfn-error-message) Больше подробностей.

Следующее, например, вызовет [`TypeError`](errors.md#class-typeerror) потому что в утверждении нет подходящего типа ошибки:

<!-- eslint-disable no-restricted-syntax -->

```mjs
import assert from 'assert/strict';

assert.doesNotThrow(() => {
  throw new TypeError('Wrong value');
}, SyntaxError);
```

<!-- eslint-disable no-restricted-syntax -->

```cjs
const assert = require('assert/strict');

assert.doesNotThrow(() => {
  throw new TypeError('Wrong value');
}, SyntaxError);
```

Однако следующее приведет к [`AssertionError`](#class-assertassertionerror) с сообщением "Получено нежелательное исключение ...":

<!-- eslint-disable no-restricted-syntax -->

```mjs
import assert from 'assert/strict';

assert.doesNotThrow(() => {
  throw new TypeError('Wrong value');
}, TypeError);
```

<!-- eslint-disable no-restricted-syntax -->

```cjs
const assert = require('assert/strict');

assert.doesNotThrow(() => {
  throw new TypeError('Wrong value');
}, TypeError);
```

Если [`AssertionError`](#class-assertassertionerror) выбрасывается, и значение предоставляется для `message` параметр, значение `message` будет добавлено к [`AssertionError`](#class-assertassertionerror) сообщение:

<!-- eslint-disable no-restricted-syntax -->

```mjs
import assert from 'assert/strict';

assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  /Wrong value/,
  'Whoops'
);
// Throws: AssertionError: Got unwanted exception: Whoops
```

<!-- eslint-disable no-restricted-syntax -->

```cjs
const assert = require('assert/strict');

assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  /Wrong value/,
  'Whoops'
);
// Throws: AssertionError: Got unwanted exception: Whoops
```

## `assert.equal(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical in case both sides are
                 NaN.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

**Строгий режим утверждения**

Псевдоним [`assert.strictEqual()`](#assertstrictequalactual-expected-message).

**Устаревший режим утверждения**

> Стабильность: 3 - Наследие: Использовать [`assert.strictEqual()`](#assertstrictequalactual-expected-message) вместо.

Проверяет неглубокое принудительное равенство между `actual` а также `expected` параметры с помощью [Абстрактное сравнение равенства](https://tc39.github.io/ecma262/#sec-abstract-equality-comparison) ( `==` ). `NaN` особым образом обрабатывается и рассматривается как идентичный, если обе стороны `NaN`.

```mjs
import assert from 'assert';

assert.equal(1, 1);
// OK, 1 == 1
assert.equal(1, '1');
// OK, 1 == '1'
assert.equal(NaN, NaN);
// OK

assert.equal(1, 2);
// AssertionError: 1 == 2
assert.equal({ a: { b: 1 } }, { a: { b: 1 } });
// AssertionError: { a: { b: 1 } } == { a: { b: 1 } }
```

```cjs
const assert = require('assert');

assert.equal(1, 1);
// OK, 1 == 1
assert.equal(1, '1');
// OK, 1 == '1'
assert.equal(NaN, NaN);
// OK

assert.equal(1, 2);
// AssertionError: 1 == 2
assert.equal({ a: { b: 1 } }, { a: { b: 1 } });
// AssertionError: { a: { b: 1 } } == { a: { b: 1 } }
```

Если значения не равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо `AssertionError`.

## `assert.fail([message])`

<!-- YAML
added: v0.1.21
-->

- `message` {строка | Ошибка} **Дефолт:** `'Failed'`

Бросает [`AssertionError`](#class-assertassertionerror) с предоставленным сообщением об ошибке или сообщением об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо [`AssertionError`](#class-assertassertionerror).

```mjs
import assert from 'assert/strict';

assert.fail();
// AssertionError [ERR_ASSERTION]: Failed

assert.fail('boom');
// AssertionError [ERR_ASSERTION]: boom

assert.fail(new TypeError('need array'));
// TypeError: need array
```

```cjs
const assert = require('assert/strict');

assert.fail();
// AssertionError [ERR_ASSERTION]: Failed

assert.fail('boom');
// AssertionError [ERR_ASSERTION]: boom

assert.fail(new TypeError('need array'));
// TypeError: need array
```

С использованием `assert.fail()` с более чем двумя аргументами возможно, но не рекомендуется. Подробнее см. Ниже.

## `assert.fail(actual, expected[, message[, operator[, stackStartFn]]])`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18418
    description: Calling `assert.fail()` with more than one argument is
                 deprecated and emits a warning.
-->

> Стабильность: 0 - Не рекомендуется: использовать `assert.fail([message])` или другие функции assert.

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}
- `operator` {нить} **Дефолт:** `'!='`
- `stackStartFn` {Функция} **Дефолт:** `assert.fail`

Если `message` ложно, сообщение об ошибке устанавливается как значения `actual` а также `expected` разделены предоставленными `operator`. Если бы только двое `actual` а также `expected` приводятся аргументы, `operator` по умолчанию будет `'!='`. Если `message` предоставляется в качестве третьего аргумента, он будет использоваться как сообщение об ошибке, а другие аргументы будут сохранены как свойства брошенного объекта. Если `stackStartFn` предоставляется, все кадры стека выше этой функции будут удалены из трассировки стека (см. [`Error.captureStackTrace`](errors.md#errorcapturestacktracetargetobject-constructoropt)). Если аргументы не указаны, сообщение по умолчанию `Failed` будет использоваться.

```mjs
import assert from 'assert/strict';

assert.fail('a', 'b');
// AssertionError [ERR_ASSERTION]: 'a' != 'b'

assert.fail(1, 2, undefined, '>');
// AssertionError [ERR_ASSERTION]: 1 > 2

assert.fail(1, 2, 'fail');
// AssertionError [ERR_ASSERTION]: fail

assert.fail(1, 2, 'whoops', '>');
// AssertionError [ERR_ASSERTION]: whoops

assert.fail(1, 2, new TypeError('need array'));
// TypeError: need array
```

```cjs
const assert = require('assert/strict');

assert.fail('a', 'b');
// AssertionError [ERR_ASSERTION]: 'a' != 'b'

assert.fail(1, 2, undefined, '>');
// AssertionError [ERR_ASSERTION]: 1 > 2

assert.fail(1, 2, 'fail');
// AssertionError [ERR_ASSERTION]: fail

assert.fail(1, 2, 'whoops', '>');
// AssertionError [ERR_ASSERTION]: whoops

assert.fail(1, 2, new TypeError('need array'));
// TypeError: need array
```

В последних трех случаях `actual`, `expected`, а также `operator` не влияют на сообщение об ошибке.

Пример использования `stackStartFn` для усечения трассировки стека исключения:

```mjs
import assert from 'assert/strict';

function suppressFrame() {
  assert.fail('a', 'b', undefined, '!==', suppressFrame);
}
suppressFrame();
// AssertionError [ERR_ASSERTION]: 'a' !== 'b'
//     at repl:1:1
//     at ContextifyScript.Script.runInThisContext (vm.js:44:33)
//     ...
```

```cjs
const assert = require('assert/strict');

function suppressFrame() {
  assert.fail('a', 'b', undefined, '!==', suppressFrame);
}
suppressFrame();
// AssertionError [ERR_ASSERTION]: 'a' !== 'b'
//     at repl:1:1
//     at ContextifyScript.Script.runInThisContext (vm.js:44:33)
//     ...
```

## `assert.ifError(value)`

<!-- YAML
added: v0.1.97
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18247
    description: Instead of throwing the original error it is now wrapped into
                 an [`AssertionError`][] that contains the full stack trace.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18247
    description: Value may now only be `undefined` or `null`. Before all falsy
                 values were handled the same as `null` and did not throw.
-->

- `value` {любой}

Броски `value` если `value` не является `undefined` или `null`. Это полезно при тестировании `error` аргумент в обратных вызовах. Трассировка стека содержит все кадры из ошибки, переданной в `ifError()` включая потенциальные новые кадры для `ifError()` сам.

```mjs
import assert from 'assert/strict';

assert.ifError(null);
// OK
assert.ifError(0);
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 0
assert.ifError('error');
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 'error'
assert.ifError(new Error());
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: Error

// Create some random error frames.
let err;
(function errorFrame() {
  err = new Error('test error');
})();

(function ifErrorFrame() {
  assert.ifError(err);
})();
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: test error
//     at ifErrorFrame
//     at errorFrame
```

```cjs
const assert = require('assert/strict');

assert.ifError(null);
// OK
assert.ifError(0);
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 0
assert.ifError('error');
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 'error'
assert.ifError(new Error());
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: Error

// Create some random error frames.
let err;
(function errorFrame() {
  err = new Error('test error');
})();

(function ifErrorFrame() {
  assert.ifError(err);
})();
// AssertionError [ERR_ASSERTION]: ifError got unwanted exception: test error
//     at ifErrorFrame
//     at errorFrame
```

## `assert.match(string, regexp[, message])`

<!-- YAML
added:
  - v13.6.0
  - v12.16.0
changes:
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/38111
    description: This API is no longer experimental.
-->

- `string` {нить}
- `regexp` {RegExp}
- `message` {строка | Ошибка}

Ожидает `string` ввод для соответствия регулярному выражению.

```mjs
import assert from 'assert/strict';

assert.match('I will fail', /pass/);
// AssertionError [ERR_ASSERTION]: The input did not match the regular ...

assert.match(123, /pass/);
// AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

assert.match('I will pass', /pass/);
// OK
```

```cjs
const assert = require('assert/strict');

assert.match('I will fail', /pass/);
// AssertionError [ERR_ASSERTION]: The input did not match the regular ...

assert.match(123, /pass/);
// AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

assert.match('I will pass', /pass/);
// OK
```

Если значения не совпадают, или если `string` аргумент другого типа, чем `string`, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.notDeepEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical in case both sides are
                 NaN.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15001
    description: The `Error` names and messages are now properly compared.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12142
    description: The `Set` and `Map` content is also compared.
  - version:
      - v6.4.0
      - v4.7.1
    pr-url: https://github.com/nodejs/node/pull/8002
    description: Typed array slices are handled correctly now.
  - version:
      - v6.1.0
      - v4.5.0
    pr-url: https://github.com/nodejs/node/pull/6432
    description: Objects with circular references can be used as inputs now.
  - version:
      - v5.10.1
      - v4.4.3
    pr-url: https://github.com/nodejs/node/pull/5910
    description: Handle non-`Uint8Array` typed arrays correctly.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

**Строгий режим утверждения**

Псевдоним [`assert.notDeepStrictEqual()`](#assertnotdeepstrictequalactual-expected-message).

**Устаревший режим утверждения**

> Стабильность: 3 - Наследие: Использовать [`assert.notDeepStrictEqual()`](#assertnotdeepstrictequalactual-expected-message) вместо.

Тесты на любое глубокое неравенство. Противоположность [`assert.deepEqual()`](#assertdeepequalactual-expected-message).

```mjs
import assert from 'assert';

const obj1 = {
  a: {
    b: 1,
  },
};
const obj2 = {
  a: {
    b: 2,
  },
};
const obj3 = {
  a: {
    b: 1,
  },
};
const obj4 = Object.create(obj1);

assert.notDeepEqual(obj1, obj1);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj2);
// OK

assert.notDeepEqual(obj1, obj3);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
// OK
```

```cjs
const assert = require('assert');

const obj1 = {
  a: {
    b: 1,
  },
};
const obj2 = {
  a: {
    b: 2,
  },
};
const obj3 = {
  a: {
    b: 1,
  },
};
const obj4 = Object.create(obj1);

assert.notDeepEqual(obj1, obj1);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj2);
// OK

assert.notDeepEqual(obj1, obj3);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
// OK
```

Если значения полностью равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо `AssertionError`.

## `assert.notDeepStrictEqual(actual, expected[, message])`

<!-- YAML
added: v1.2.0
changes:
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15398
    description: The `-0` and `+0` are not considered equal anymore.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15036
    description: The `NaN` is now compared using the
              [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero)
              comparison.
  - version: v9.0.0
    pr-url: https://github.com/nodejs/node/pull/15001
    description: The `Error` names and messages are now properly compared.
  - version: v8.0.0
    pr-url: https://github.com/nodejs/node/pull/12142
    description: The `Set` and `Map` content is also compared.
  - version:
    - v6.4.0
    - v4.7.1
    pr-url: https://github.com/nodejs/node/pull/8002
    description: Typed array slices are handled correctly now.
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/6432
    description: Objects with circular references can be used as inputs now.
  - version:
    - v5.10.1
    - v4.4.3
    pr-url: https://github.com/nodejs/node/pull/5910
    description: Handle non-`Uint8Array` typed arrays correctly.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

Тесты на глубокое строгое неравенство. Противоположность [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

```mjs
import assert from 'assert/strict';

assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
// OK
```

```cjs
const assert = require('assert/strict');

assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
// OK
```

Если значения полностью и строго равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.notEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical in case both sides are
                 NaN.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

**Строгий режим утверждения**

Псевдоним [`assert.notStrictEqual()`](#assertnotstrictequalactual-expected-message).

**Устаревший режим утверждения**

> Стабильность: 3 - Наследие: Использовать [`assert.notStrictEqual()`](#assertnotstrictequalactual-expected-message) вместо.

Проверяет неглубокое принудительное неравенство [Абстрактное сравнение равенства](https://tc39.github.io/ecma262/#sec-abstract-equality-comparison) (`!=` ). `NaN` особым образом обрабатывается и рассматривается как идентичный, если обе стороны `NaN`.

```mjs
import assert from 'assert';

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```

```cjs
const assert = require('assert');

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```

Если значения равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо `AssertionError`.

## `assert.notStrictEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17003
    description: Used comparison changed from Strict Equality to `Object.is()`.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

Проверяет строгое неравенство между `actual` а также `expected` параметры, определенные [SameValue Сравнение](https://tc39.github.io/ecma262/#sec-samevalue).

```mjs
import assert from 'assert/strict';

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError [ERR_ASSERTION]: Expected "actual" to be strictly unequal to:
//
// 1

assert.notStrictEqual(1, '1');
// OK
```

```cjs
const assert = require('assert/strict');

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError [ERR_ASSERTION]: Expected "actual" to be strictly unequal to:
//
// 1

assert.notStrictEqual(1, '1');
// OK
```

Если значения строго равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо `AssertionError`.

## `assert.ok(value[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18319
    description: The `assert.ok()` (no arguments) will now use a predefined
                 error message.
-->

- `value` {любой}
- `message` {строка | Ошибка}

Проверяет, если `value` правда. Это эквивалентно `assert.equal(!!value, true, message)`.

Если `value` не правда, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр `undefined`, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо `AssertionError`. Если аргументы не переданы вообще `message` будет установлена строка: `` 'No value argument passed to `assert.ok()`' ``.

Имейте в виду, что в `repl` сообщение об ошибке будет отличаться от сообщения в файле! Подробнее см. Ниже.

```mjs
import assert from 'assert/strict';

assert.ok(true);
// OK
assert.ok(1);
// OK

assert.ok();
// AssertionError: No value argument passed to `assert.ok()`

assert.ok(false, "it's false");
// AssertionError: it's false

// In the repl:
assert.ok(typeof 123 === 'string');
// AssertionError: false == true

// In a file (e.g. test.js):
assert.ok(typeof 123 === 'string');
// AssertionError: The expression evaluated to a falsy value:
//
//   assert.ok(typeof 123 === 'string')

assert.ok(false);
// AssertionError: The expression evaluated to a falsy value:
//
//   assert.ok(false)

assert.ok(0);
// AssertionError: The expression evaluated to a falsy value:
//
//   assert.ok(0)
```

```cjs
const assert = require('assert/strict');

assert.ok(true);
// OK
assert.ok(1);
// OK

assert.ok();
// AssertionError: No value argument passed to `assert.ok()`

assert.ok(false, "it's false");
// AssertionError: it's false

// In the repl:
assert.ok(typeof 123 === 'string');
// AssertionError: false == true

// In a file (e.g. test.js):
assert.ok(typeof 123 === 'string');
// AssertionError: The expression evaluated to a falsy value:
//
//   assert.ok(typeof 123 === 'string')

assert.ok(false);
// AssertionError: The expression evaluated to a falsy value:
//
//   assert.ok(false)

assert.ok(0);
// AssertionError: The expression evaluated to a falsy value:
//
//   assert.ok(0)
```

```mjs
import assert from 'assert/strict';

// Using `assert()` works the same:
assert(0);
// AssertionError: The expression evaluated to a falsy value:
//
//   assert(0)
```

```cjs
const assert = require('assert');

// Using `assert()` works the same:
assert(0);
// AssertionError: The expression evaluated to a falsy value:
//
//   assert(0)
```

## `assert.rejects(asyncFn[, error][, message])`

<!-- YAML
added: v10.0.0
-->

- `asyncFn` {Функция | Обещание}
- `error` {RegExp | Функция | Объект | Ошибка}
- `message` {нить}

Ждет `asyncFn` обещание или, если `asyncFn` является функцией, немедленно вызывает функцию и ожидает завершения возвращенного обещания. Затем он проверит, что обещание отклонено.

Если `asyncFn` это функция, которая синхронно выдает ошибку, `assert.rejects()` вернет отклоненный `Promise` с этой ошибкой. Если функция не возвращает обещание, `assert.rejects()` вернет отклоненный `Promise` с [`ERR_INVALID_RETURN_VALUE`](errors.md#err_invalid_return_value) ошибка. В обоих случаях обработчик ошибок пропускается.

Помимо асинхронной природы ожидания завершения ведет себя идентично [`assert.throws()`](#assertthrowsfn-error-message).

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), функция проверки, объект, на который будет проверяться каждое свойство, или экземпляр ошибки, где каждое свойство будет проверяться на предмет включения неперечислимых `message` а также `name` характеристики.

Если указано, `message` будет сообщение, предоставленное [`AssertionError`](#class-assertassertionerror) если `asyncFn` не может отвергнуть.

```mjs
import assert from 'assert/strict';

await assert.rejects(
  async () => {
    throw new TypeError('Wrong value');
  },
  {
    name: 'TypeError',
    message: 'Wrong value',
  }
);
```

```cjs
const assert = require('assert/strict');

(async () => {
  await assert.rejects(
    async () => {
      throw new TypeError('Wrong value');
    },
    {
      name: 'TypeError',
      message: 'Wrong value',
    }
  );
})();
```

```mjs
import assert from 'assert/strict';

await assert.rejects(
  async () => {
    throw new TypeError('Wrong value');
  },
  (err) => {
    assert.strictEqual(err.name, 'TypeError');
    assert.strictEqual(err.message, 'Wrong value');
    return true;
  }
);
```

```cjs
const assert = require('assert/strict');

(async () => {
  await assert.rejects(
    async () => {
      throw new TypeError('Wrong value');
    },
    (err) => {
      assert.strictEqual(err.name, 'TypeError');
      assert.strictEqual(err.message, 'Wrong value');
      return true;
    }
  );
})();
```

```mjs
import assert from 'assert/strict';

assert
  .rejects(Promise.reject(new Error('Wrong value')), Error)
  .then(() => {
    // ...
  });
```

```cjs
const assert = require('assert/strict');

assert
  .rejects(Promise.reject(new Error('Wrong value')), Error)
  .then(() => {
    // ...
  });
```

`error` не может быть строкой. Если в качестве второго аргумента указана строка, тогда `error` считается опущенным, и строка будет использоваться для `message` вместо. Это может привести к ошибкам, которые легко упустить. Пожалуйста, прочтите пример в [`assert.throws()`](#assertthrowsfn-error-message) осторожно, если рассматривается использование строки в качестве второго аргумента.

## `assert.strictEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17003
    description: Used comparison changed from Strict Equality to `Object.is()`.
-->

- `actual` {любой}
- `expected` {любой}
- `message` {строка | Ошибка}

Проверяет строгое равенство между `actual` а также `expected` параметры, определенные [SameValue Сравнение](https://tc39.github.io/ecma262/#sec-samevalue).

```mjs
import assert from 'assert/strict';

assert.strictEqual(1, 2);
// AssertionError [ERR_ASSERTION]: Expected inputs to be strictly equal:
//
// 1 !== 2

assert.strictEqual(1, 1);
// OK

assert.strictEqual('Hello foobar', 'Hello World!');
// AssertionError [ERR_ASSERTION]: Expected inputs to be strictly equal:
// + actual - expected
//
// + 'Hello foobar'
// - 'Hello World!'
//          ^

const apples = 1;
const oranges = 2;
assert.strictEqual(
  apples,
  oranges,
  `apples ${apples} !== oranges ${oranges}`
);
// AssertionError [ERR_ASSERTION]: apples 1 !== oranges 2

assert.strictEqual(
  1,
  '1',
  new TypeError('Inputs are not identical')
);
// TypeError: Inputs are not identical
```

```cjs
const assert = require('assert/strict');

assert.strictEqual(1, 2);
// AssertionError [ERR_ASSERTION]: Expected inputs to be strictly equal:
//
// 1 !== 2

assert.strictEqual(1, 1);
// OK

assert.strictEqual('Hello foobar', 'Hello World!');
// AssertionError [ERR_ASSERTION]: Expected inputs to be strictly equal:
// + actual - expected
//
// + 'Hello foobar'
// - 'Hello World!'
//          ^

const apples = 1;
const oranges = 2;
assert.strictEqual(
  apples,
  oranges,
  `apples ${apples} !== oranges ${oranges}`
);
// AssertionError [ERR_ASSERTION]: apples 1 !== oranges 2

assert.strictEqual(
  1,
  '1',
  new TypeError('Inputs are not identical')
);
// TypeError: Inputs are not identical
```

Если значения не строго равны, [`AssertionError`](#class-assertassertionerror) брошен с `message` набор свойств, равный значению `message` параметр. Если `message` параметр не определен, назначается сообщение об ошибке по умолчанию. Если `message` параметр является экземпляром [`Error`](errors.md#class-error) тогда он будет брошен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.throws(fn[, error][, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: v10.2.0
    pr-url: https://github.com/nodejs/node/pull/20485
    description: The `error` parameter can be an object containing regular
                 expressions now.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/17584
    description: The `error` parameter can now be an object as well.
  - version: v4.2.0
    pr-url: https://github.com/nodejs/node/pull/3276
    description: The `error` parameter can now be an arrow function.
-->

- `fn` {Функция}
- `error` {RegExp | Функция | Объект | Ошибка}
- `message` {нить}

Ожидает функции `fn` выкинуть ошибку.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), функция проверки, объект проверки, где каждое свойство будет проверяться на строгое глубокое равенство, или экземпляр ошибки, где каждое свойство будет проверено на строгое глубокое равенство, включая неперечислимые `message` а также `name` характеристики. При использовании объекта также можно использовать регулярное выражение при проверке на соответствие строковому свойству. См. Примеры ниже.

Если указано, `message` будет добавлено к сообщению, предоставленному `AssertionError` если `fn` вызов не может быть сгенерирован или в случае сбоя проверки ошибки.

Пользовательский объект проверки / экземпляр ошибки:

```mjs
import assert from 'assert/strict';

const err = new TypeError('Wrong value');
err.code = 404;
err.foo = 'bar';
err.info = {
  nested: true,
  baz: 'text',
};
err.reg = /abc/i;

assert.throws(
  () => {
    throw err;
  },
  {
    name: 'TypeError',
    message: 'Wrong value',
    info: {
      nested: true,
      baz: 'text',
    },
    // Only properties on the validation object will be tested for.
    // Using nested objects requires all properties to be present. Otherwise
    // the validation is going to fail.
  }
);

// Using regular expressions to validate error properties:
throws(
  () => {
    throw err;
  },
  {
    // The `name` and `message` properties are strings and using regular
    // expressions on those will match against the string. If they fail, an
    // error is thrown.
    name: /^TypeError$/,
    message: /Wrong/,
    foo: 'bar',
    info: {
      nested: true,
      // It is not possible to use regular expressions for nested properties!
      baz: 'text',
    },
    // The `reg` property contains a regular expression and only if the
    // validation object contains an identical regular expression, it is going
    // to pass.
    reg: /abc/i,
  }
);

// Fails due to the different `message` and `name` properties:
throws(
  () => {
    const otherErr = new Error('Not found');
    // Copy all enumerable properties from `err` to `otherErr`.
    for (const [key, value] of Object.entries(err)) {
      otherErr[key] = value;
    }
    throw otherErr;
  },
  // The error's `message` and `name` properties will also be checked when using
  // an error as validation object.
  err
);
```

```cjs
const assert = require('assert/strict');

const err = new TypeError('Wrong value');
err.code = 404;
err.foo = 'bar';
err.info = {
  nested: true,
  baz: 'text',
};
err.reg = /abc/i;

assert.throws(
  () => {
    throw err;
  },
  {
    name: 'TypeError',
    message: 'Wrong value',
    info: {
      nested: true,
      baz: 'text',
    },
    // Only properties on the validation object will be tested for.
    // Using nested objects requires all properties to be present. Otherwise
    // the validation is going to fail.
  }
);

// Using regular expressions to validate error properties:
throws(
  () => {
    throw err;
  },
  {
    // The `name` and `message` properties are strings and using regular
    // expressions on those will match against the string. If they fail, an
    // error is thrown.
    name: /^TypeError$/,
    message: /Wrong/,
    foo: 'bar',
    info: {
      nested: true,
      // It is not possible to use regular expressions for nested properties!
      baz: 'text',
    },
    // The `reg` property contains a regular expression and only if the
    // validation object contains an identical regular expression, it is going
    // to pass.
    reg: /abc/i,
  }
);

// Fails due to the different `message` and `name` properties:
throws(
  () => {
    const otherErr = new Error('Not found');
    // Copy all enumerable properties from `err` to `otherErr`.
    for (const [key, value] of Object.entries(err)) {
      otherErr[key] = value;
    }
    throw otherErr;
  },
  // The error's `message` and `name` properties will also be checked when using
  // an error as validation object.
  err
);
```

Проверить instanceof с помощью конструктора:

```mjs
import assert from 'assert/strict';

assert.throws(() => {
  throw new Error('Wrong value');
}, Error);
```

```cjs
const assert = require('assert/strict');

assert.throws(() => {
  throw new Error('Wrong value');
}, Error);
```

Подтвердите сообщение об ошибке, используя [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions):

Использование регулярного выражения запускает `.toString` на объекте ошибки и, следовательно, также будет включать имя ошибки.

```mjs
import assert from 'assert/strict';

assert.throws(() => {
  throw new Error('Wrong value');
}, /^Error: Wrong value$/);
```

```cjs
const assert = require('assert/strict');

assert.throws(() => {
  throw new Error('Wrong value');
}, /^Error: Wrong value$/);
```

Пользовательская проверка ошибок:

Функция должна возвращать `true` чтобы указать, что все внутренние проверки пройдены. В противном случае он потерпит неудачу с [`AssertionError`](#class-assertassertionerror).

```mjs
import assert from 'assert/strict';

assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  (err) => {
    assert(err instanceof Error);
    assert(/value/.test(err));
    // Avoid returning anything from validation functions besides `true`.
    // Otherwise, it's not clear what part of the validation failed. Instead,
    // throw an error about the specific validation that failed (as done in this
    // example) and add as much helpful debugging information to that error as
    // possible.
    return true;
  },
  'unexpected error'
);
```

```cjs
const assert = require('assert/strict');

assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  (err) => {
    assert(err instanceof Error);
    assert(/value/.test(err));
    // Avoid returning anything from validation functions besides `true`.
    // Otherwise, it's not clear what part of the validation failed. Instead,
    // throw an error about the specific validation that failed (as done in this
    // example) and add as much helpful debugging information to that error as
    // possible.
    return true;
  },
  'unexpected error'
);
```

`error` не может быть строкой. Если в качестве второго аргумента указана строка, тогда `error` считается опущенным, и строка будет использоваться для `message` вместо. Это может привести к ошибкам, которые легко упустить. Использование того же сообщения, что и выданное сообщение об ошибке, приведет к `ERR_AMBIGUOUS_ARGUMENT` ошибка. Пожалуйста, внимательно прочтите приведенный ниже пример, если в качестве второго аргумента используется строка:

<!-- eslint-disable no-restricted-syntax -->

```mjs
import assert from 'assert/strict';

function throwingFirst() {
  throw new Error('First');
}

function throwingSecond() {
  throw new Error('Second');
}

function notThrowing() {}

// The second argument is a string and the input function threw an Error.
// The first case will not throw as it does not match for the error message
// thrown by the input function!
assert.throws(throwingFirst, 'Second');
// In the next example the message has no benefit over the message from the
// error and since it is not clear if the user intended to actually match
// against the error message, Node.js throws an `ERR_AMBIGUOUS_ARGUMENT` error.
assert.throws(throwingSecond, 'Second');
// TypeError [ERR_AMBIGUOUS_ARGUMENT]

// The string is only used (as message) in case the function does not throw:
assert.throws(notThrowing, 'Second');
// AssertionError [ERR_ASSERTION]: Missing expected exception: Second

// If it was intended to match for the error message do this instead:
// It does not throw because the error messages match.
assert.throws(throwingSecond, /Second$/);

// If the error message does not match, an AssertionError is thrown.
assert.throws(throwingFirst, /Second$/);
// AssertionError [ERR_ASSERTION]
```

<!-- eslint-disable no-restricted-syntax -->

```cjs
const assert = require('assert/strict');

function throwingFirst() {
  throw new Error('First');
}

function throwingSecond() {
  throw new Error('Second');
}

function notThrowing() {}

// The second argument is a string and the input function threw an Error.
// The first case will not throw as it does not match for the error message
// thrown by the input function!
assert.throws(throwingFirst, 'Second');
// In the next example the message has no benefit over the message from the
// error and since it is not clear if the user intended to actually match
// against the error message, Node.js throws an `ERR_AMBIGUOUS_ARGUMENT` error.
assert.throws(throwingSecond, 'Second');
// TypeError [ERR_AMBIGUOUS_ARGUMENT]

// The string is only used (as message) in case the function does not throw:
assert.throws(notThrowing, 'Second');
// AssertionError [ERR_ASSERTION]: Missing expected exception: Second

// If it was intended to match for the error message do this instead:
// It does not throw because the error messages match.
assert.throws(throwingSecond, /Second$/);

// If the error message does not match, an AssertionError is thrown.
assert.throws(throwingFirst, /Second$/);
// AssertionError [ERR_ASSERTION]
```

Из-за запутанной записи, подверженной ошибкам, избегайте использования строки в качестве второго аргумента.
