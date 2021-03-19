# Assertion

Модуль `assert` предоставляет простой набор так называемых assertion тестов или «тестов утверждения», которые могут быть использованы в тестировании инвариантов (неизменяемых функций, значений, свойств).

Модуль предназначен для внутреннего использования Node.js, но также может быть вызван в коде как `require("assert")`. Однако, `assert` – это не тестовый фреймворк, и он не предназначен для использования в качестве главной тестовой библиотеки.

!!!note "Стабильность: 3 - Закрыто"

    АПИ `Assert` модуля является закрытым. Это значит, что никаких изменений или добавлений в уже готовые методы вноситься не будет.

## assert()

```
assert(value[, message])
```

Иная реализация `assert.ok()`

```js
const assert = require('assert');

assert(true); // OK
assert(1); // OK

assert(false);
// throws "AssertionError: false == true"

assert(0);
// throws "AssertionError: 0 == true"

assert(false, "it's false");
// throws "AssertionError: it's false"
```

## assert.deepEqual()

```
assert.deepEqual(actual, expected[, message])
```

Тестирует равенство между `actual` и `expected` параметрами. Примитивные значения сравниваются с помощью оператора сравнения на равенство (`==`).

Имеется в виду, что рассматриваются только исчисляемые «собственные» свойства. Выполнение `deepEqual()` не тестирует прототипы объектов, закрепленные символы или неисчисляемые свойства. Это может привести к неожиданным результатам.

Например, ниже приведенный пример не выдает `AssertionError` потому что свойства объекта `Error` являются неисчисляемыми:

```js
// WARNING: This does not throw an AssertionError!
assert.deepEqual(Error('a'), Error('b'));
```

«Сильное» равенство означает, что исчисляемые «собственные» свойства дочерних объектов также оцениваются:

```js
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
// OK, object is equal to itself

assert.deepEqual(obj1, obj2);
// AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }
// values of b are different

assert.deepEqual(obj1, obj3);
// OK, objects are equal

assert.deepEqual(obj1, obj4);
// AssertionError: { a: { b: 1 } } deepEqual {}
// Prototypes are ignored
```

Если значения не равны, `AssertionError` выдает ошибку, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

## assert.deepStrictEqual()

```
assert.deepStrictEqual(actual, expected[, message])
```

В целом индентично `assert.deepEqual()`, кроме двух исключений. Первое: примитивные значения сравниваются с помощью оператора строгого равенства (`===`). Второе: сравнение объектов включает в себя строгую проверку равенства их прототипов.

```js
const assert = require('assert');

assert.deepEqual({ a: 1 }, { a: '1' });
// OK, because 1 == '1'

assert.deepStrictEqual({ a: 1 }, { a: '1' });
// AssertionError: { a: 1 } deepStrictEqual { a: '1' }
// because 1 !== '1' using strict equality
```

Если значения не равны, `AssertionError` выдает ошибку, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

## assert.doesNotThrow()

```
assert.doesNotThrow(block[, error][, message])
```

Проверяет, не выдает ли функция `block` ошибку. См. `assert.throws()`, там это описано подробнее.

Когда вызывается `assert.doesNotThrow()`, то непосредственно вызывается и функция `block`.

Если выпадает ошибка и она относится к тому же типу, что и ошибка, заданная параметрами, то значит, это ошибка `AssertionError`. Если ошибка другая, или параметр error не определен, то ошибка передается обратно к вызывающему `assert`.

Например, пример ниже показывает, как выпадает ошибка `TypeError`, потому что в `Assertion` нет типов, совпадающих с ее типом:

```js
assert.doesNotThrow(() => {
  throw new TypeError('Wrong value');
}, SyntaxError);
```

Однако, вот еще один пример. Здесь в результате получаем `AssertionError` с сообщением ‘Got unwanted exception (TypeError)’(‘Нежелаемая ошибка TypeError’):

```js
assert.doesNotThrow(() => {
  throw new TypeError('Wrong value');
}, TypeError);
```

Если выдается `AssertionError` и параметру message задано значение, то значение `message` будет прилагаться к тексту `AssertionError`:

```js
assert.doesNotThrow(
  () => {
    throw new TypeError('Wrong value');
  },
  TypeError,
  'Whoops'
);
// Throws: AssertionError: Got unwanted exception (TypeError). Whoops
```

## assert.equal()

```
assert.equal(actual, expected[, message])
```

Проверка нестрогого равенства между `actual` и `expected` параметрами с с помощью оператора сравнения (`==`).

```js
assert.equal(1, 1);
// OK, 1 == 1
assert.equal(1, '1');
// OK, 1 == '1'

assert.equal(1, 2);
// AssertionError: 1 == 2
assert.equal({ a: { b: 1 } }, { a: { b: 1 } });
//AssertionError: { a: { b: 1 } } == { a: { b: 1 } }
```

Если значения не равны, `AssertionError` выдает ошибку, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

## assert.fail()

```
assert.fail(actual, expected, message, operator)
```

Выдает `AssertionError`. Если `message` ложно, то текст ошибки состоит из значений `actual` и `expected`, разделенных оператором условия. В ином случае, текст ошибки содержит только значение `message`.

```js
const assert = require('assert');

assert.fail(1, 2, undefined, '>');
// AssertionError: 1 > 2

assert.fail(1, 2, 'whoops', '>');
// AssertionError: whoops
```

## assert.ifError()

```
assert.ifError(value)
```

Выдает значение, если оно истинно. Полезная функция при тестировании ошибки в качестве аргумента через обратные вызовы.

```js
const assert = require('assert');

assert.ifError(0); // OK
assert.ifError(1); // Throws 1
assert.ifError('error'); // Throws 'error'
assert.ifError(new Error()); // Throws Error
```

## assert.notDeepEqual()

```
assert.notDeepEqual(actual, expected[, message])
```

Тестирует на наличие глубокого неравенства. Является противоположным `assert.deepEqual()`.

```js
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
// OK, obj1 and obj2 are not deeply equal

assert.notDeepEqual(obj1, obj3);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
// OK, obj1 and obj2 are not deeply equal
```

Если значения не равны, `AssertionError` выдает ошибку, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

## assert.notDeepStrictEqual()

```
assert.notDeepStrictEqual(actual, expected[, message])
```

Тестирует глубокое строгое неравенство. То же самое, что и `assert.deepStrictEqual()`, только с точностью наоборот.

```js
const assert = require('assert');

assert.notDeepEqual({ a: 1 }, { a: '1' });
// AssertionError: { a: 1 } notDeepEqual { a: '1' }

assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
// OK
```

## assert.notEqual()

```
assert.notEqual(actual, expected[, message])
```

Проверка нестрогого неравенства с помощью оператора неравенства (`!=`).

```js
const assert = require('assert');

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```

## assert.notStrictEqual()

```
assert.notStrictEqual(actual, expected[, message])
```

Проверка строгого неравенства с помощью оператора строгого неравенства (`!==`).

```js
const assert = require('assert');

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError: 1 != 1

assert.notStrictEqual(1, '1');
// OK
```

Если значения строго равны, выпадает `AssertionError`, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

## assert.ok()

```
assert.ok(value[, message])
```

Проверка значения `value` на истинность. Является эквивалентом `assert.equal(!!value, true, message)`.

Если значение не истинно, выпадает `AssertionError`, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

```js
const assert = require('assert');

assert.ok(true); // OK
assert.ok(1); // OK

assert.ok(false);
// throws "AssertionError: false == true"

assert.ok(0);
// throws "AssertionError: 0 == true"

assert.ok(false, "it's false");
// throws "AssertionError: it's false"
```

## assert.strictEqual()

```
assert.strictEqual(actual, expected[, message])
```

Проверка строгого равенства с помощью оператора строгого равенства (`===`).

```js
const assert = require('assert');

assert.strictEqual(1, 2);
// AssertionError: 1 === 2

assert.strictEqual(2, 1);
// OK

assert.strictEqual(1, '1');
// AssertionError: 1 === '1'
```

Если значения не строго равны, выпадает `AssertionError`, приравнивая свойство `message` к значению параметра `message`. Если параметр `message` не определен, то выпадает ошибка по умолчанию.

## assert.throws()

```js
assert.throws(block[, error][, message])
```

Ожидает сообщения об ошибке функции `block`.

При условии, что тип задан, ошибка может быть конструктором, `RegExp` или функцией валидации.

Также при условии задания типа, `message` может быть сообщением `AssertionError`, если функция `block` не выдает ошибку.

Пример проверки с помощью конструктора:

```js
assert.throws(() => {
  throw new Error('Wrong value');
}, Error);
```

Проверка сообщения об ошибки с помощью `RegExp`:

```js
assert.throws(() => {
  throw new Error('Wrong value');
}, /value/);
```

Кастомная проверка на ошибку:

```js
assert.throws(
  () => {
    throw new Error('Wrong value');
  },
  function (err) {
    if (err instanceof Error && /value/.test(err)) {
      return true;
    }
  },
  'unexpected error'
);
```

Следует заметить, что `error` не может быть строкой. Если строка задана в качестве второго аргумента, то предполагается, что `error` будет опущен и вместо этого строка будет использоваться для `message`. Это может привести к таким ошибкам, которые легко пропустить.

```js
//  ЭТО НЕПРАВИЛЬНО, ТАК ДЕЛАТЬ НЕЛЬЗЯ!
assert.throws(
  myFunction,
  'missing foo',
  'did not throw with expected message'
);

// Вместо этого лучше сделать так!
assert.throws(
  myFunction,
  /missing foo/,
  'did not throw with expected message'
);
```
