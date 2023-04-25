---
description: В assert модуль предоставляет набор функций утверждения для проверки инвариантов
title: Assert
---

# Тестирование

[:octicons-tag-24: v18.x.x](https://nodejs.org/docs/latest-v18.x/api/assert.html)

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

Модуль **`node:assert`** предоставляет набор функций утверждения для проверки инвариантов.

## Режим строгого утверждения

В режиме строгого утверждения нестрогие методы ведут себя как соответствующие им строгие методы. Например, [`assert.deepEqual()`](#assertdeepequalactual-expected-message) будет вести себя как [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

В режиме strict assertion сообщения об ошибках для объектов отображают diff. В режиме legacy assertion сообщения об ошибках для объектов отображают сами объекты, часто в усеченном виде.

Чтобы использовать режим строгого утверждения:

```mjs
import { strict as assert } from 'node:assert';
```

```cjs
const assert = require('node:assert').strict;
```

```mjs
import assert from 'node:assert/strict';
```

```cjs
const assert = require('node:assert/strict');
```

Пример разницы ошибок:

```mjs
import { strict as assert } from 'node:assert';


assert.deepEqual([[[1, 2, 3]], 4, 5], [[[1, 2, '3']], 4, 5]]);
// AssertionError: Ожидается, что входные данные будут строго равны по глубине:
// + фактические - ожидаемые ... Строки пропущены
//
// [
// [
// ...
// 2,
// + 3
// - '3'
// ],
// ...
// 5
// ]
```

```cjs
const assert = require('node:assert/strict');

assert.deepEqual(
  [[[1, 2, 3]], 4, 5],
  [[[1, 2, '3']], 4, 5]
);
// AssertionError: Ожидается, что входные данные будут строго равны по глубине:
// + фактические - ожидаемые ... Строки пропущены
//
// [
// [
// ...
// 2,
// + 3
// - '3'
// ],
// ...
// 5
// ]
```

Чтобы отключить цвета, используйте переменные окружения `NO_COLOR` или `NODE_DISABLE_COLORS`. Это также отключит цвета в REPL. Подробнее о поддержке цветов в терминальных средах читайте в документации по tty [`getColorDepth()`](tty.md#writestreamgetcolordepthenv).

## Устаревший режим утверждения

Наследный режим утверждения использует оператор [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality) в:

- [`assert.deepEqual()`](#assertdeepequalactual-expected-message)
- [`assert.equal()`](#asserttequalactual-expected-message)
- [`assert.notDeepEqual()`](#assertnotdeepepequalactual-expected-message)
- [`assert.notEqual()`](#assertnotequalactual-expected-message)

Чтобы использовать унаследованный режим утверждения:

```mjs
import assert from 'node:assert';
```

```cjs
const assert = require('node:assert');
```

Наследие режима assertion может привести к неожиданным результатам, особенно при использовании [`assert.deepEqual()`](#assertdeepequalactual-expected-message):

```js
// ВНИМАНИЕ: Это не приводит к ошибке AssertionError
// в унаследованном режиме утверждения!
assert.deepEqual(/a/gi, new Date());
```

## Класс: assert.AssertionError

- Расширяется: {errors.Error}

Указывает на неудачу утверждения. Все ошибки, выбрасываемые модулем `node:assert`, будут экземплярами класса `AssertionError`.

### `new assert.AssertionError(options)`

- `options` {Object}
  - `message` {string} Если предоставлено, сообщение об ошибке устанавливается в это значение.
  - `actual` {any} Свойство `actual` экземпляра ошибки.
  - `expected` {any} Свойство `expected` экземпляра ошибки.
  - `operator` {string} Свойство `operator` для экземпляра ошибки.
  - `stackStartFn` {функция} Если задано, то в сгенерированной трассировке стека будут опущены кадры до этой функции.

Подкласс `Error`, который указывает на неудачу утверждения.

Все экземпляры содержат встроенные свойства `Error` (`message` и `name`) и:

- `actual` {any} Устанавливается в аргумент `actual` для таких методов, как [`assert.strictEqual()`](#assertstrictequalactual-expected-message).
- `expected` {any} Устанавливается на `ожидаемое` значение для таких методов, как [`assert.strictEqual()`](#assertstrictequalactual-expected-message).
- `generatedMessage` {boolean} Указывает, было ли сообщение сгенерировано автоматически (`true`) или нет.
- `code` {string} Значение всегда `ERR_ASSERTION`, чтобы показать, что ошибка является ошибкой утверждения.
- `operator` {string} Устанавливается в переданное значение оператора.

```mjs
import assert from 'node:assert';

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
const assert = require('node:assert');

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

<!-- 0004.part.md -->

## Класс: `assert.CallTracker`

!!!warning "Стабильность: 1 – Экспериментальная"

    Фича изменяется и не допускается флагом командной строки. Может быть изменена или удалена в последующих версиях.

Эта функция в настоящее время является экспериментальной, и ее поведение может измениться.

### `new assert.CallTracker()`

Создает новый объект [`CallTracker`](#class-assertcalltracker), который можно использовать для отслеживания того, вызывались ли функции определенное количество раз. Для проверки необходимо вызвать `tracker.verify()`. Обычная схема - вызвать его в обработчике [`process.on('exit')`](process.md#event-exit).

```mjs
import assert from 'node:assert';
import process from 'node:process';

const tracker = new assert.CallTracker();

function func() {}

// callsfunc() должна быть вызвана ровно 1 раз перед tracker.verify().
const callsfunc = tracker.calls(func, 1);

callsfunc();

// Вызывает tracker.verify() и проверяет, все ли функции tracker.calls()
// были вызваны точное количество раз.
process.on('exit', () => {
  tracker.verify();
});
```

```cjs
const assert = require('node:assert');

const tracker = new assert.CallTracker();

function func() {}

// callsfunc() должен быть вызван ровно 1 раз перед tracker.verify().
const callsfunc = tracker.calls(func, 1);

callsfunc();

// Вызывает tracker.verify() и проверяет, все ли функции tracker.calls()
// были вызваны точное количество раз.
process.on('exit', () => {
  tracker.verify();
});
```

### `tracker.calls([fn][, exact])`

- `fn` {Функция} **По умолчанию:** Безотказная функция.
- `exact` {число} **По умолчанию:** `1`.
- Возвращает: {Функция}, которая обертывает `fn`.

Ожидается, что функция-обертка будет вызвана ровно `exact` раз. Если на момент вызова [`tracker.verify()`](#trackerverify) функция не была вызвана ровно `точное` количество раз, то [`tracker.verify()`](#trackerverify) выдаст ошибку.

```mjs
import assert from 'node:assert';

// Создает трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}

// Возвращает функцию, обертывающую func(), которая должна быть вызвана точное время
// перед tracker.verify().
const callsfunc = tracker.calls(func);
```

```cjs
const assert = require('node:assert');

// Создает трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}

// Возвращает функцию, обертывающую func(), которая должна быть вызвана точное время
// перед tracker.verify().
const callsfunc = tracker.calls(func);
```

### `tracker.getCalls(fn)`

- `fn` {Функция}.

- Возвращает: {Массив} со всеми вызовами отслеживаемой функции.

- Объект {Object}

  - `thisArg` {Object}
  - `arguments` {Array} аргументы, переданные отслеживаемой функции.

```mjs
import assert from 'node:assert';

const tracker = new assert.CallTracker();

function func() {}
const callsfunc = tracker.calls(func);
callsfunc(1, 2, 3);

assert.deepStrictEqual(tracker.getCalls(callsfunc), [
  { thisArg: this, arguments: [1, 2, 3] },
]);
```

```cjs
const assert = require('node:assert');

// Создает трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}
const callsfunc = tracker.calls(func);
callsfunc(1, 2, 3);

assert.deepStrictEqual(tracker.getCalls(callsfunc), [
  { thisArg: this, arguments: [1, 2, 3] },
]);
```

### `tracker.report()`

- Возвращает: {Массив} объектов, содержащих информацию о функциях-обертках, возвращаемых [`tracker.calls()`](#trackercallsfn-exact).
- Объект {Object}
  - `сообщение` {строка}
  - `actual` {number} Фактическое количество раз, когда функция была вызвана.
  - `expected` {number} Ожидаемое количество вызовов функции.
  - `operator` {string} Имя функции, которая обернута.
  - `stack` {Object} Трассировка стека функции.

Массивы содержат информацию об ожидаемом и фактическом количестве вызовов функций, которые не были вызваны ожидаемое количество раз.

```mjs
import assert from 'node:assert';

// Создается трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}

// Возвращает функцию, обертывающую func(), которая должна быть вызвана точное время
// перед tracker.verify().
const callsfunc = tracker.calls(func, 2);

// Возвращает массив, содержащий информацию о callfunc()
tracker.report();
// [
// {
// сообщение: 'Ожидалось, что функция func будет выполнена 2 раза(а), но было выполнено...
// выполнена 0 раз(ов).',
// фактическое: 0,
// ожидаемое: 2,
// оператор: 'func',
// стек: трассировка стека
// }
// ]
```

```cjs
const assert = require('node:assert');

// Создает трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}

// Возвращает функцию, обертывающую func(), которая должна быть вызвана точное время
// перед tracker.verify().
const callsfunc = tracker.calls(func, 2);

// Возвращает массив, содержащий информацию о callfunc()
tracker.report();
// [
// {
// сообщение: 'Ожидалось, что функция func будет выполнена 2 раза(а), но было выполнено...
// выполнена 0 раз(ов).',
// фактическое: 0,
// ожидаемое: 2,
// оператор: 'func',
// стек: трассировка стека
// }
// ]
```

### `tracker.reset([fn])`

- `fn` {функция} отслеживаемая функция для сброса.

сбрасывает вызовы трекера вызовов. если отслеживаемая функция передана в качестве аргумента, вызовы будут сброшены для нее. если аргументы не переданы, все отслеживаемые функции будут сброшены.

```mjs
import assert from 'node:assert';

const tracker = new assert.CallTracker();

function func() {}
const callsfunc = tracker.calls(func);

callsfunc();
// Tracker was called once
tracker.getCalls(callsfunc).length === 1;

tracker.reset(callsfunc);
tracker.getCalls(callsfunc).length === 0;
```

```cjs
const assert = require('node:assert');

function func() {}
const callsfunc = tracker.calls(func);

callsfunc();
// Tracker was called once
tracker.getCalls(callsfunc).length === 1;

tracker.reset(callsfunc);
tracker.getCalls(callsfunc).length === 0;
```

### `tracker.verify()`

Просматривает список функций, переданных в [`tracker.calls()`](#trackercallsfn-exact), и выдает ошибку для функций, которые не были вызваны ожидаемое количество раз.

```mjs
import assert from 'node:assert';

// Создает трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}

// Возвращает функцию, обертывающую func(), которая должна быть вызвана точное время
// перед tracker.verify().
const callsfunc = tracker.calls(func, 2);

callsfunc();

// Выбросит ошибку, так как callsfunc() была вызвана только один раз.
tracker.verify();
```

```cjs
const assert = require('node:assert');

// Создает трекер вызовов.
const tracker = new assert.CallTracker();

function func() {}

// Возвращает функцию, обертывающую func(), которая должна быть вызвана точное время
// перед tracker.verify().
const callsfunc = tracker.calls(func, 2);

callsfunc();

// Выбросит ошибку, так как callsfunc() была вызвана только один раз.
tracker.verify();
```

## `assert(value[, message])`

- `value` {any} Входные данные, которые проверяются на истинность.
- `message` {string|Error}

Псевдоним [`assert.ok()`](#assertokvalue-message).

## `assert.deepEqual(actual, expected[, message])`

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}

**Строгий режим утверждения**.

Псевдоним [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

**Режим утверждения Legacy**.

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

Проверяет глубокое равенство между параметрами `actual` и `expected`. Вместо этого используйте [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message). [`assert.deepEqual()`](#assertdeepepequalactual-expected-message) может привести к неожиданным результатам.

_Глубокое равенство_ означает, что перечислимые "собственные" свойства дочерних объектов также рекурсивно оцениваются по следующим правилам.

### Детали сравнения

- Примитивные значения сравниваются с помощью оператора [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality), за исключением `NaN`. Оно считается идентичным, если обе стороны `NaN`.
- [Теги типов](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны быть одинаковыми.
- Учитываются только [перечислимые "собственные" свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties).
- [`Error`](errors.md#class-error) имена и сообщения всегда сравниваются, даже если это не перечислимые свойства.
- [Object wrappers](https://developer.mozilla.org/en-US/docs/Glossary/Primitive#Primitive_wrapper_objects_in_JavaScript) сравниваются как объекты, так и развернутые значения.
- Свойства `Object` сравниваются неупорядоченно.
- Ключи [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) и элементы [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) сравниваются неупорядоченно.
- Рекурсия останавливается, когда обе стороны различаются или обе стороны встречают круговую ссылку.
- Реализация не проверяет [`[[Прототип]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов.
- Свойства [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) не сравниваются.
- Сравнение [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) не опирается на их значения.
- [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) lastIndex, флаги и источник всегда сравниваются, даже если это не перечислимые свойства.

Следующий пример не вызывает [`AssertionError`](#class-assertassertionerror), потому что примитивы сравниваются с помощью оператора [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality).

```mjs
import assert from 'node:assert';
// ВНИМАНИЕ: Это не приводит к ошибке утверждения!

assert.deepEqual('+000000', false);
```

```cjs
const assert = require('node:assert');
// ВНИМАНИЕ: Это не приводит к ошибке утверждения!

assert.deepEqual('+000000', false);
```

"Глубокое" равенство означает, что перечислимые "собственные" свойства дочерних объектов также оцениваются:

```mjs
import assert from 'node:assert';

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
const obj4 = { __proto__: obj1 };

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
const assert = require('node:assert');

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
const obj4 = { __proto__: obj1 };

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

Если значения не равны, возникает [`AssertionError`](#class-assertassertionerror) со свойством `message`, установленным равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.deepStrictEqual(actual, expected[, message])`

- `фактический` {любой}
- `ожидаемое` {любой}
- `сообщение` {string|Error}

Проверяет глубокое равенство между параметрами `actual` и `expected`. "Глубокое" равенство означает, что перечислимые "собственные" свойства дочерних объектов рекурсивно оцениваются также по следующим правилам.

### Детали сравнения

- Примитивные значения сравниваются с помощью [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
- [Теги типов](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны быть одинаковыми.
- [`[[Прототип]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов сравниваются с помощью оператора [`===`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality).
- Учитываются только [перечислимые "собственные" свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties).
- Имена и сообщения [`Error`](errors.md#class-error) всегда сравниваются, даже если они не являются перечислимыми свойствами.
- Перечислимые собственные свойства [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) также сравниваются.
- [Object wrappers](https://developer.mozilla.org/en-US/docs/Glossary/Primitive#Primitive_wrapper_objects_in_JavaScript) сравниваются как объекты, так и развернутые значения.
- Свойства `Object` сравниваются неупорядоченно.
- Ключи [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) и элементы [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) сравниваются неупорядоченно.
- Рекурсия прекращается, когда обе стороны различаются или обе стороны встречают круговую ссылку.
- Сравнение [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) и [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) не зависит от их значений. Более подробную информацию см. ниже.
- [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) lastIndex, флаги и источник всегда сравниваются, даже если это не перечислимые свойства.

```mjs
import assert from 'node:assert/strict';

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
// OK because Object.is(NaN, NaN) is true.

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

// Different zeros:
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
const assert = require('node:assert/strict');

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
// OK because Object.is(NaN, NaN) is true.

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

// Different zeros:
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

Если значения не равны, возникает [`AssertionError`](#class-assertassertionerror) со свойством `message`, установленным равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо `AssertionError`.

## `assert.doesNotMatch(string, regexp[, message])`

- `string` {string}
- `regexp` {RegExp}
- `message` {string|Error}

Ожидает, что входная `строка` не будет соответствовать регулярному выражению.

```mjs
import assert from 'node:assert/strict';

assert.doesNotMatch('I will fail', /fail/);
// AssertionError [ERR_ASSERTION]: Ожидалось, что входные данные не будут соответствовать ...

assert.doesNotMatch(123, /pass/);
// AssertionError [ERR_ASSERTION]: Аргумент "string" должен быть типа string.

assert.doesNotMatch('Я сдам', /different/);
// OK
```

```cjs
const assert = require('node:assert/strict');

assert.doesNotMatch('I will fail', /fail/);
// AssertionError [ERR_ASSERTION]: Ожидалось, что входные данные не будут соответствовать ...

assert.doesNotMatch(123, /pass/);
// AssertionError [ERR_ASSERTION]: Аргумент "string" должен быть типа string.

assert.doesNotMatch('Я сдам', /different/);
// OK
```

Если значения совпадают, или аргумент `string` имеет тип, отличный от `string`, то возникает ошибка [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.doesNotReject(asyncFn[, error][, message])`

- `asyncFn` {Function|Promise}
- `error` {RegExp|Function}
- `message` {строка}

Ожидает обещание `asyncFn` или, если `asyncFn` является функцией, немедленно вызывает функцию и ожидает выполнения возвращенного обещания. Затем проверяется, что обещание не было отклонено.

Если `asyncFn` является функцией и синхронно выбрасывает ошибку, `assert.doesNotReject()` вернет отвергнутое `обещание` с этой ошибкой. Если функция не возвращает обещание, `assert.doesNotReject()` вернет отклоненный `Promise` с ошибкой [`ERR_INVALID_RETURN_VALUE`](errors.md#err_invalid_return_value). В обоих случаях обработчик ошибки пропускается.

Использование `assert.doesNotReject()` на самом деле бесполезно, потому что мало пользы от перехвата отказа и последующего повторного отказа. Вместо этого следует добавить комментарий к определенному пути кода, который не должен отклоняться, и сделать сообщения об ошибках как можно более выразительными.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) или функцией проверки. Подробнее см. в [`assert.throws()`](#assertthrowsfn-error-message).

Помимо асинхронной природы await завершение ведет себя идентично [`assert.doesNotThrow()`](#assertdoesnotthrowfn-error-message).

```mjs
import assert from 'node:assert/strict';

await assert.doesNotReject(async () => {
  throw new TypeError('Неверное значение');
}, SyntaxError);
```

```cjs
const assert = require('node:assert/strict');

(async () => {
  await assert.doesNotReject(async () => {
    throw new TypeError('Неверное значение');
  }, SyntaxError);
})();
```

```mjs
import assert from 'node:assert/strict';


assert.doesNotReject(Promise.reject(new TypeError('Wrong value'))))
  .then(() => {
    // ...
  });
```

```cjs
const assert = require('node:assert/strict');


assert.doesNotReject(Promise.reject(new TypeError('Wrong value'))))
  .then(() => {
    // ...
  });
```

## `assert.doesNotThrow(fn[, error][, message])`

- `fn` {Function}
- `error` {RegExp|Function}
- `message` {string}

Утверждает, что функция `fn` не выбрасывает ошибку.

Использование `assert.doesNotThrow()` на самом деле бесполезно, потому что нет никакой пользы от перехвата ошибки и ее повторного выброса. Вместо этого следует добавить комментарий к определенному пути кода, который не должен выбрасывать ошибку, и сделать сообщения об ошибках как можно более выразительными.

Когда вызывается `assert.doesNotThrow()`, немедленно вызывается функция `fn`.

Если возникла ошибка, тип которой совпадает с типом, заданным параметром `error`, то возникает [`AssertionError`](#class-assertassertionerror). Если ошибка другого типа, или если параметр `error` не определен, то ошибка передается обратно вызывающей стороне.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) или функцией проверки. Подробнее см. в [`assert.throws()`](#assertthrowsfn-error-message).

Например, следующее утверждение выбросит [`TypeError`](errors.md#class-typeerror), потому что в утверждении нет соответствующего типа ошибки:

```mjs
import assert from 'node:assert/strict';

assert.doesNotThrow(() => {
  throw new TypeError('Неверное значение');
}, SyntaxError);
```

```cjs
const assert = require('node:assert/strict');

assert.doesNotThrow(() => {
  throw new TypeError('Неверное значение');
}, SyntaxError);
```

Однако, следующее приведет к [`AssertionError`](#class-assertassertionerror) с сообщением 'Got unwanted exception...':

```mjs
import assert from 'node:assert/strict';

assert.doesNotThrow(() => {
  throw new TypeError('Неверное значение');
}, TypeError);
```

```cjs
const assert = require('node:assert/strict');

assert.doesNotThrow(() => {
  throw new TypeError('Неверное значение');
}, TypeError);
```

Если выброшен [`AssertionError`](#class-assertassertionerror) и для параметра `message` указано значение, то значение `message` будет добавлено к сообщению [`AssertionError`](#class-assertassertionerror):

```mjs
import assert from 'node:assert/strict';

assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  /Wrong value/,
  'Whoops'
);
// Throws: AssertionError: Получено нежелательное исключение: Whoops
```

```cjs
const assert = require('node:assert/strict');

assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  /Wrong value/,
  'Whoops'
);
// Throws: AssertionError: Получено нежелательное исключение: Whoops
```

## `assert.equal(actual, expected[, message])`

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}

**Строгий режим утверждения**.

Псевдоним [`assert.strictEqual()`](#assertstrictequalactual-expected-message).

**Строгий режим утверждения**

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`assert.strictEqual()`](#assertstrictequalactual-expected-message).

Проверяет неглубокое, принудительное равенство между `фактическим` и `ожидаемым` параметрами, используя [`==` оператор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality). Оператор `NaN` специально обрабатывается и рассматривается как идентичный, если обе стороны являются `NaN`.

```mjs
import assert from 'node:assert';

assert.equal(1, 1);
// OK, 1 == 1
assert.equal(1, '1');
// ОК, 1 == '1'
assert.equal(NaN, NaN);
// OK

assert.equal(1, 2);
// AssertionError: 1 == 2
assert.equal({ a: { b: 1 } }, { a: { b: 1 } });
// AssertionError: { a: { b: 1 } } == { a: { b: 1 } }
```

```cjs
const assert = require('node:assert');

assert.equal(1, 1);
// OK, 1 == 1
assert.equal(1, '1');
// ОК, 1 == '1'
assert.equal(NaN, NaN);
// OK

assert.equal(1, 2);
// AssertionError: 1 == 2
assert.equal({ a: { b: 1 } }, { a: { b: 1 } });
// AssertionError: { a: { b: 1 } } == { a: { b: 1 } }
```

Если значения не равны, возникает ошибка [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо `AssertionError`.

## `assert.fail([message])`

- `message` {string|Error} **По умолчанию:** `Не удалось`.

Выбрасывает [`AssertionError`](#class-assertassertionerror) с предоставленным сообщением об ошибке или сообщением об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо [`AssertionError`](#class-assertassertionerror).

```mjs
import assert from 'node:assert/strict';

assert.fail();
// AssertionError [ERR_ASSERTION]: Failed

assert.fail('boom');
// AssertionError [ERR_ASSERTION]: boom

assert.fail(new TypeError('need array'));
// TypeError: need array
```

```cjs
const assert = require('node:assert/strict');

assert.fail();
// AssertionError [ERR_ASSERTION]: Failed

assert.fail('boom');
// AssertionError [ERR_ASSERTION]: boom

assert.fail(new TypeError('need array'));
// TypeError: need array
```

Использование `assert.fail()` с более чем двумя аргументами возможно, но устарело. Более подробную информацию смотрите ниже.

## `assert.fail(actual, expected[, message[, operator[, stackStartFn]]])`

> Стабильность: 0 - Исправлено: Вместо этого используйте `assert.fail([message])` или другие функции assert.

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}
- `operator` {строка} **По умолчанию:** `!='`
- `stackStartFn` {функция} **По умолчанию:** `assert.fail`.

Если `message` является falsy, сообщение об ошибке устанавливается как значения `actual` и `expected`, разделенные предоставленным `оператором`. Если указаны только два аргумента `actual` и `expected`, то `operator` по умолчанию будет равен `'!='`. Если в качестве третьего аргумента указано `message`, то оно будет использоваться в качестве сообщения об ошибке, а остальные аргументы будут сохранены как свойства брошенного объекта. Если указан `stackStartFn`, то все кадры стека выше этой функции будут удалены из трассировки стека (см. [`Error.captureStackTrace`](errors.md#errorcapturestacktracetargetobject-constructoropt)). Если аргументы не указаны, будет использовано сообщение по умолчанию `Failed`.

```mjs
import assert from 'node:assert/strict';

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
const assert = require('node:assert/strict');

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

В последних трех случаях `actual`, `expected` и `operator` не влияют на сообщение об ошибке.

Пример использования `stackStartFn` для усечения стек-трейса исключения:

```mjs
import assert from 'node:assert/strict';

function suppressFrame() {
  assert.fail('a', 'b', undefined, '!==', suppressFrame);
}
suppressFrame();
// AssertionError [ERR_ASSERTION]: 'a' !== 'b'
// at repl:1:1
// at ContextifyScript.Script.runInThisContext (vm.js:44:33)
// ...
```

```cjs
const assert = require('node:assert/strict');

function suppressFrame() {
  assert.fail('a', 'b', undefined, '!==', suppressFrame);
}
suppressFrame();
// AssertionError [ERR_ASSERTION]: 'a' !== 'b'
// at repl:1:1
// at ContextifyScript.Script.runInThisContext (vm.js:44:33)
// ...
```

## `assert.ifError(value)`

- `значение` {любой}

Выбрасывает `value`, если `value` не является `undefined` или `null`. Это полезно при проверке аргумента `error` в обратных вызовах. Трассировка стека содержит все кадры из ошибки, переданной в `ifError()`, включая потенциальные новые кадры для самой `ifError()`.

```mjs
import assert from 'node:assert/strict';

assert.ifError(null);
// OK
assert.ifError(0);
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: 0
assert.ifError('error');
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: 'error'
assert.ifError(new Error());
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: Error

// Создайте несколько случайных фреймов ошибок.
let err;
(function errorFrame() {
  err = new Error('ошибка теста');
})();

(function ifErrorFrame() {
  assert.ifError(err);
})();
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: ошибка теста
// в ifErrorFrame
// в errorFrame
```

```cjs
const assert = require('node:assert/strict');

assert.ifError(null);
// OK
assert.ifError(0);
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: 0
assert.ifError('error');
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: 'error'
assert.ifError(new Error());
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: Error

// Создайте несколько случайных фреймов ошибок.
let err;
(function errorFrame() {
  err = new Error('ошибка теста');
})();

(function ifErrorFrame() {
  assert.ifError(err);
})();
// AssertionError [ERR_ASSERTION]: ifError получил нежелательное исключение: ошибка теста
// в ifErrorFrame
// в errorFrame
```

## `assert.match(string, regexp[, message])`

- `string` {string}
- `regexp` {RegExp}
- `message` {string|Error}

Ожидает, что входная `строка` будет соответствовать регулярному выражению.

```mjs
import assert from 'node:assert/strict';

assert.match('I will fail', /pass/);
// AssertionError [ERR_ASSERTION]: Входные данные не соответствуют регулярному ...

assert.match(123, /pass/);
// AssertionError [ERR_ASSERTION]: Аргумент "string" должен быть типа string.

assert.match('I will pass', /pass/);
// OK
```

```cjs
const assert = require('node:assert/strict');

assert.match('I will fail', /pass/);
// AssertionError [ERR_ASSERTION]: Входные данные не соответствуют регулярному ...

assert.match(123, /pass/);
// AssertionError [ERR_ASSERTION]: Аргумент "string" должен быть типа string.

assert.match('I will pass', /pass/);
// OK
```

Если значения не совпадают или аргумент `string` имеет тип, отличный от `string`, возникает ошибка [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.notDeepEqual(actual, expected[, message])`

- `фактический` {любой}
- `ожидаемое` {любой}
- `сообщение` {string|Error}

**Строгий режим утверждения**.

Псевдоним [`assert.notDeepStrictEqual()`](#assertnotdeepstrictequalactual-expected-message).

**Режим утверждения Legacy**.

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`assert.notDeepStrictEqual()`](#assertnotdeepstrictequalactual-expected-message).

Проверяет любое глубокое неравенство. Противоположность [`assert.deepEqual()`](#assertdeepepequalactual-expected-message).

```mjs
import assert from 'node:assert';

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
const obj4 = { __proto__: obj1 };

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
const assert = require('node:assert');

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
const obj4 = { __proto__: obj1 };

assert.notDeepEqual(obj1, obj1);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj2);
// OK

assert.notDeepEqual(obj1, obj3);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
// OK
```

Если значения глубоко равны, возникает ошибка [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо `AssertionError`.

## `assert.notDeepStrictEqual(actual, expected[, message])`

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}

Проверяет глубокое строгое неравенство. Противоположность [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

```mjs
import assert from 'node:assert/strict';

assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
// OK
```

```cjs
const assert = require('node:assert/strict');

assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
// OK
```

Если значения глубоко и строго равны, то выбрасывается [`AssertionError`](#class-assertassertionerror) со свойством `message`, установленным равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.notEqual(actual, expected[, message])`

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}

**Строгий режим утверждения**.

Псевдоним [`assert.notStrictEqual()`](#assertnotstrictequalactual-expected-message).

**Режим утверждения Legacy**.

!!!note "Стабильность: 3 – Закрыто"

    Принимаются только фиксы, связанные с безопасностью, производительностью или баг-фиксы. Пожалуйста, не предлагайте изменений АПИ в разделе с таким индикатором, они будут отклонены.

    Вместо этого используйте [`assert.notStrictEqual()`](#assertnotstrictequalactual-expected-message).

Проверяет неглубокое принудительное неравенство с помощью оператора [`!=`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Inequality). `NaN` специально обрабатывается и рассматривается как идентичное, если обе стороны `NaN`.

```mjs
import assert from 'node:assert';

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```

```cjs
const assert = require('node:assert');

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```

Если значения равны, возникает [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо `AssertionError`.

## `assert.notStrictEqual(actual, expected[, message])`

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}

Проверяет строгое неравенство между параметрами `actual` и `expected`, определяемое [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).

```mjs
import assert from 'node:assert/strict';

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError [ERR_ASSERTION]: Ожидалось, что "actual" будет строго неравнозначно:
//
// 1

assert.notStrictEqual(1, '1');
// OK
```

```cjs
const assert = require('node:assert/strict');

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError [ERR_ASSERTION]: Ожидалось, что "actual" будет строго неравнозначно:
//
// 1

assert.notStrictEqual(1, '1');
// OK
```

Если значения строго равны, возникает ошибка [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо `AssertionError`.

## `assert.ok(value[, message])`

- `value` {любое}
- `message` {string|Error}

Проверяет, является ли `значение` истинным. Это эквивалентно `assert.equal(!!value, true, message)`.

Если `значение` не является истинным, то возникает [`AssertionError`](#class-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` равен `undefined`, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо `AssertionError`. Если аргументы не переданы вообще, то `message` будет установлен в строку: ``Нет аргумента значения, переданного в `assert.ok()```.

Имейте в виду, что в `repl` сообщение об ошибке будет отличаться от того, которое выводится в файле\! Более подробную информацию смотрите ниже.

```mjs
import assert from 'node:assert/strict';

assert.ok(true);
// OK
assert.ok(1);
// OK

assert.ok();
// AssertionError: В `assert.ok()` не передан аргумент value

assert.ok(false, "it's false");
// AssertionError: it's false

// В реплике:
assert.ok(typeof 123 === 'string');
// AssertionError: false == true

// В файле (например, test.js):
assert.ok(typeof 123 === 'string');
// AssertionError: Выражение оценивается в ложное значение:
//
// assert.ok(typeof 123 === 'string')

assert.ok(false);
// AssertionError: Выражение оценивается в ложное значение:
//
// assert.ok(false)

assert.ok(0);
// AssertionError: Выражение оценивается в ложное значение:
//
// assert.ok(0)
```

```cjs
const assert = require('node:assert/strict');

assert.ok(true);
// OK
assert.ok(1);
// OK

assert.ok();
// AssertionError: В `assert.ok()` не передан аргумент value

assert.ok(false, "it's false");
// AssertionError: it's false

// В реплике:
assert.ok(typeof 123 === 'string');
// AssertionError: false == true

// В файле (например, test.js):
assert.ok(typeof 123 === 'string');
// AssertionError: Выражение оценивается в ложное значение:
//
// assert.ok(typeof 123 === 'string')

assert.ok(false);
// AssertionError: Выражение оценивается в ложное значение:
//
// assert.ok(false)

assert.ok(0);
// AssertionError: Выражение оценивается в ложное значение:
//
// assert.ok(0)
```

```mjs
import assert from 'node:assert/strict';

// Использование `assert()` работает так же:
assert(0);
// AssertionError: Выражение оценивается в ложное значение:
//
// assert(0)
```

```cjs
const assert = require('node:assert');

// Использование `assert()` работает так же:
assert(0);
// AssertionError: Выражение оценивается в ложное значение:
//
// assert(0)
```

## `assert.rejects(asyncFn[, error][, message])`

- `asyncFn` {Function|Promise}
- `error` {RegExp|Function|Object|Error}
- `message` {string}

Ожидает обещания `asyncFn` или, если `asyncFn` является функцией, немедленно вызывает функцию и ожидает выполнения возвращенного обещания. Затем проверяется, что обещание отклонено.

Если `asyncFn` является функцией и синхронно выбрасывает ошибку, `assert.rejects()` вернет отклоненное `обещание` с этой ошибкой. Если функция не возвращает обещание, `assert.rejects()` вернет отклоненный `Promise` с ошибкой [`ERR_INVALID_RETURN_VALUE`](errors.md#err_invalid_return_value). В обоих случаях обработчик ошибки пропускается.

Помимо асинхронного характера ожидания, завершение ведет себя идентично [`assert.throws()`](#assertthrowsfn-error-message).

Если указано, то `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), функцией проверки, объектом, где каждое свойство будет проверяться, или экземпляром ошибки, где каждое свойство будет проверяться, включая неперечислимые свойства `message` и `name`.

Если указано, `message` будет сообщением, предоставляемым [`AssertionError`](#class-assertassertionerror), если `asyncFn` не удастся отклонить.

```mjs
import assert from 'node:assert/strict';

await assert.rejects(
  async () => {
    throw new TypeError('Неверное значение');
  },
  {
    name: 'TypeError',
    message: 'Неверное значение',
  }
);
```

```cjs
const assert = require('node:assert/strict');

(async () => {
  await assert.rejects(
    async () => {
      throw new TypeError('Неверное значение');
    },
    {
      name: 'TypeError',
      message: 'Неверное значение',
    }
  );
})();
```

```mjs
import assert from 'node:assert/strict';

await assert.rejects(
  async () => {
    throw new TypeError('Неверное значение');
  },
  (err) => {
    assert.strictEqual(err.name, 'TypeError');
    assert.strictEqual(err.message, 'Неверное значение');
    return true;
  }
);
```

```cjs
const assert = require('node:assert/strict');

(async () => {
  await assert.rejects(
    async () => {
      throw new TypeError('Неверное значение');
    },
    (err) => {
      assert.strictEqual(err.name, 'TypeError');
      assert.strictEqual(err.message, 'Неверное значение');
      return true;
    }
  );
})();
```

```mjs
import assert from 'node:assert/strict';

assert
  .rejects(
    Promise.reject(new Error('Неверное значение')),
    Error
  )
  .then(() => {
    // ...
  });
```

```cjs
const assert = require('node:assert/strict');

assert
  .rejects(
    Promise.reject(new Error('Неверное значение')),
    Error
  )
  .then(() => {
    // ...
  });
```

`error` не может быть строкой. Если в качестве второго аргумента указана строка, то считается, что `error` опущен, и строка будет использована для `message`. Это может привести к легко пропущенным ошибкам. Пожалуйста, внимательно прочитайте пример в [`assert.throws()`](#assertthrowsfn-error-message), если использование строки в качестве второго аргумента будет рассмотрено.

## `assert.strictEqual(actual, expected[, message])`

- `actual` {любой}
- `expected` {любой}
- `message` {string|Error}

Проверяет строгое равенство между параметрами `actual` и `expected`, определяемое [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).

```mjs
import assert from 'node:assert/strict';

assert.strictEqual(1, 2);
// AssertionError [ERR_ASSERTION]: Ожидается, что входные данные будут строго равны:
//
// 1 !== 2

assert.strictEqual(1, 1);
// OK

assert.strictEqual('Hello foobar', 'Hello World!');
// AssertionError [ERR_ASSERTION]: Ожидается, что входные данные будут строго равны:
// + фактический - ожидаемый
//
// + 'Hello foobar'
// - 'Hello World!'
// ^

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
  new TypeError('Входы не идентичны')
);
// TypeError: Входные данные не идентичны
```

```cjs
const assert = require('node:assert/strict');

assert.strictEqual(1, 2);
// AssertionError [ERR_ASSERTION]: Ожидалось, что входные данные будут строго равны:
//
// 1 !== 2

assert.strictEqual(1, 1);
// OK

assert.strictEqual('Hello foobar', 'Hello World!');
// AssertionError [ERR_ASSERTION]: Ожидается, что входные данные будут строго равны:
// + фактический - ожидаемый
//
// + 'Hello foobar'
// - 'Hello World!'
// ^

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
  new TypeError('Входы не идентичны')
);
// TypeError: Входные данные не идентичны
```

Если значения не являются строго равными, возникает [`AssertionError`](#class-assertassertionerror) со свойством `message`, установленным равным значению параметра `message`. Если параметр `message` не определен, назначается сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [`Error`](errors.md#class-error), то он будет выброшен вместо [`AssertionError`](#class-assertassertionerror).

## `assert.throws(fn[, error][, message])`

- `fn` {Function}
- `error` {RegExp|Function|Object|Error}
- `message` {string}

Ожидает, что функция `fn` выдаст ошибку.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), функцией проверки, объектом проверки, где каждое свойство будет проверяться на строгое равенство, или экземпляром ошибки, где каждое свойство будет проверяться на строгое равенство, включая неперечислимые свойства `message` и `name`. При использовании объекта можно также использовать регулярное выражение при проверке строкового свойства. Примеры смотрите ниже.

Если указано, `message` будет добавлено к сообщению, предоставленному `AssertionError`, если вызов `fn` не сможет бросить или если валидация ошибки не удалась.

Пользовательский объект валидации/экземпляр ошибки:

```mjs
import assert from 'node:assert/strict';

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
assert.throws(
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
assert.throws(
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
const assert = require('node:assert/strict');

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
assert.throws(
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
assert.throws(
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

Проверьте instanceof с помощью конструктора:

```mjs
import assert from 'node:assert/strict';

assert.throws(() => {
  throw new Error('Wrong value');
}, Error);
```

```cjs
const assert = require('node:assert/strict');

assert.throws(() => {
  throw new Error('Wrong value');
}, Error);
```

Проверьте сообщение об ошибке с помощью [`RegExp`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions):

Использование регулярного выражения запускает `.toString` для объекта ошибки и, следовательно, включает в себя также имя ошибки.

```mjs
import assert from 'node:assert/strict';

assert.throws(() => {
  throw new Error('Wrong value');
}, /^Error: Wrong value$/);
```

```cjs
const assert = require('node:assert/strict');

assert.throws(() => {
  throw new Error('Wrong value');
}, /^Error: Wrong value$/);
```

Пользовательская валидация ошибок:

Функция должна возвращать `true`, чтобы показать, что все внутренние проверки пройдены. В противном случае она завершится с ошибкой [`AssertionError`](#class-assertassertionerror).

```mjs
import assert from 'node:assert/strict';

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
const assert = require('node:assert/strict');

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

`error` не может быть строкой. Если в качестве второго аргумента указана строка, то считается, что `error` опущен, и строка будет использована для `message`. Это может привести к легко пропущенным ошибкам. Использование того же сообщения, что и брошенное сообщение об ошибке, приведет к ошибке `ERR_AMBIGUOUS_ARGUMENT`. Пожалуйста, внимательно прочитайте приведенный ниже пример, если в качестве второго аргумента будет использоваться строка:

```mjs
import assert from 'node:assert/strict';

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

```cjs
const assert = require('node:assert/strict');

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

Из-за запутанной нотации, приводящей к ошибкам, избегайте строки в качестве второго аргумента.
