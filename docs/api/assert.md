---
title: Утверждения (assert)
description: Модуль node:assert — набор функций утверждения для проверки инвариантов
---

# Тестирование

[:octicons-tag-24: latest](https://nodejs.org/docs/latest/api/assert.html)

<!--introduced_in=v0.1.21-->

!!!success "Стабильность: 2 – Стабильная"

    АПИ является удовлетворительным. Совместимость с NPM имеет высший приоритет и не будет нарушена кроме случаев явной необходимости.

<!-- source_link=lib/assert.js -->
<!-- markdownlint-disable MD024 -->

Модуль `node:assert` предоставляет набор функций утверждения для проверки инвариантов.

## Режим строгого утверждения

<!-- YAML
added: v9.9.0
changes:
  - version: v15.0.0
    pr-url: https://github.com/nodejs/node/pull/34001
    description: Exposed as `require('node:assert/strict')`.
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

Добавлено в: v9.9.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v15.0.0 | Представлен как `require('node:assert/strict')`. |
    | v13.9.0, v12.16.2 | Изменен «строгий режим» на «режим строгого утверждения», а «устаревший режим» на «устаревший режим утверждения», чтобы избежать путаницы с более обычным значением «строгого режима». |
    | v9.9.0 | Добавлены различия ошибок в режиме строгого утверждения. |
    | v9.9.0 | В модуль утверждения добавлен строгий режим утверждения. |

В режиме строгого утверждения нестрогие методы ведут себя как соответствующие им строгие методы. Например, [`assert.deepEqual()`](#assertdeepequalactual-expected-message) будет вести себя как [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

В режиме строгого утверждения сообщения об ошибках для объектов показывают diff. В устаревшем режиме утверждения сообщения об ошибках для объектов показывают сами объекты, часто в усечённом виде.

### Семантика параметра `message`

Для методов утверждения, принимающих необязательный параметр `message`, сообщение можно передать в одной из следующих форм:

-   **string**: Используется как есть. Если после строки `message` указаны дополнительные аргументы, они обрабатываются как подстановки в стиле printf (см. [`util.format()`](util.md#utilformatformat-args)).
-   **Error**: Если в качестве `message` передан экземпляр `Error`, выбрасывается именно эта ошибка, а не `AssertionError`.
-   **function**: Функция вида `(actual, expected) => string`. Вызывается только при провале утверждения и должна вернуть строку, которая будет использована как сообщение об ошибке. Нестроковые возвращаемые значения игнорируются, вместо них используется сообщение по умолчанию.

Если вместе с `message` в виде `Error` или функции переданы дополнительные аргументы, вызов отклоняется с `ERR_AMBIGUOUS_ARGUMENT`.

Если первый аргумент не является строкой, `Error` или функцией, выбрасывается `ERR_INVALID_ARG_TYPE`.

Чтобы использовать режим строгого утверждения:

=== "MJS"

    ```js
    import { strict as assert } from 'node:assert';
    ```

=== "CJS"

    ```js
    const assert = require('node:assert').strict;
    ```

---

=== "MJS"

    ```js
    import assert from 'node:assert/strict';
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');
    ```

Пример diff в сообщении об ошибке:

=== "MJS"

    ```js
    import { strict as assert } from 'node:assert';

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

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

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

Чтобы отключить цвета, используйте переменные окружения `NO_COLOR` или `NODE_DISABLE_COLORS`. Это также отключит цвета в REPL. Подробнее о поддержке цветов в терминальных средах см. документацию по tty [`getColorDepth()`](tty.md#writestreamgetcolordepthenv).

## Устаревший режим утверждения

Устаревший режим утверждения использует оператор [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality) в:

-   [`assert.deepEqual()`](#assertdeepequalactual-expected-message)
-   [`assert.equal()`](#assertequalactual-expected-message)
-   [`assert.notDeepEqual()`](#assertnotdeepequalactual-expected-message)
-   [`assert.notEqual()`](#assertnotequalactual-expected-message)

Чтобы использовать устаревший режим утверждения:

=== "MJS"

    ```js
    import assert from 'node:assert';
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    ```

Устаревший режим утверждения может давать неожиданные результаты, особенно при использовании [`assert.deepEqual()`](#assertdeepequalactual-expected-message):

```js
// ВНИМАНИЕ: в устаревшем режиме утверждения
// это не вызывает AssertionError!
assert.deepEqual(/a/gi, new Date());
```

## Класс: `assert.AssertionError` {#class-assertassertionerror}

-   Наследует: [`<errors.Error>`](errors.md#error)

Указывает на неудачу утверждения. Все ошибки, выбрасываемые модулем `node:assert`, являются экземплярами класса `AssertionError`.

### `new assert.AssertionError(options)`

<!-- YAML
added: v0.1.21
-->

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Если указано, сообщение об ошибке устанавливается в это значение.
    -   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Свойство `actual` у экземпляра ошибки.
    -   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Свойство `expected` у экземпляра ошибки.
    -   `operator` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Свойство `operator` у экземпляра ошибки.
    -   `stackStartFn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Если задано, сгенерированная трассировка стека не включает кадры выше этой функции.
    -   `diff` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При значении `'full'` в ошибках утверждения показывается полный diff. По умолчанию `'simple'`. Допустимые значения: `'simple'`, `'full'`.

Подкласс [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), указывающий на неудачу утверждения.

Все экземпляры содержат встроенные свойства `Error` (`message` и `name`) и:

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Устанавливается в аргумент `actual` для таких методов, как [`assert.strictEqual()`](#assertstrictequalactual-expected-message).
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Устанавливается в ожидаемое значение для таких методов, как [`assert.strictEqual()`](#assertstrictequalactual-expected-message).
-   `generatedMessage` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) Показывает, было ли сообщение сгенерировано автоматически (`true`) или нет.
-   `code` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Значение всегда `ERR_ASSERTION`, чтобы указать, что это ошибка утверждения.
-   `operator` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) Устанавливается в переданное значение оператора.

=== "MJS"

    ```js
    import assert from 'node:assert';

    // Создаём AssertionError для последующего сравнения сообщения об ошибке:
    const { message } = new assert.AssertionError({
        actual: 1,
        expected: 2,
        operator: 'strictEqual',
    });

    // Проверяем вывод ошибки:
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

=== "CJS"

    ```js
    const assert = require('node:assert');

    // Создаём AssertionError для последующего сравнения сообщения об ошибке:
    const { message } = new assert.AssertionError({
        actual: 1,
        expected: 2,
        operator: 'strictEqual',
    });

    // Проверяем вывод ошибки:
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

## Класс: `assert.Assert`

<!-- YAML
added:
 - v24.6.0
 - v22.19.0
-->

Класс `Assert` позволяет создавать независимые экземпляры утверждений с пользовательскими параметрами.

### `new assert.Assert([options])`

<!-- YAML
changes:
  - version: v24.9.0
    pr-url: https://github.com/nodejs/node/pull/59762
    description: Added `skipPrototype` option.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v24.9.0 | Добавлена ​​опция «skipPrototype». |

-   `options` [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)
    -   `diff` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) При значении `'full'` в ошибках утверждения показывается полный diff. По умолчанию `'simple'`. Допустимые значения: `'simple'`, `'full'`.
    -   `strict` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` нестрогие методы ведут себя как соответствующие строгие. По умолчанию `true`.
    -   `skipPrototype` [`<boolean>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Boolean_type) При `true` при глубоком сравнении на равенство не сравниваются прототип и конструктор. По умолчанию `false`.

Создаёт новый экземпляр утверждений. Параметр `diff` задаёт подробность diff в сообщениях об ошибках утверждения.

```js
const { Assert } = require('node:assert');
const assertInstance = new Assert({ diff: 'full' });
assertInstance.deepStrictEqual({ a: 1 }, { a: 2 });
// В сообщении об ошибке показывается полный diff.
```

**Важно:** при деструктуризации методов утверждений из экземпляра `Assert` они теряют связь с параметрами конфигурации экземпляра (такими как `diff`, `strict` и `skipPrototype`). У деструктурированных методов используется поведение по умолчанию.

```js
const myAssert = new Assert({ diff: 'full' });

// Работает как ожидается - используется полный diff
myAssert.strictEqual({ a: 1 }, { b: { c: 1 } });

// Здесь теряется настройка полного diff - используется значение по умолчанию `simple`
const { strictEqual } = myAssert;
strictEqual({ a: 1 }, { b: { c: 1 } });
```

Параметр `skipPrototype` влияет на все методы глубокого сравнения:

```js
class Foo {
    constructor(a) {
        this.a = a;
    }
}

class Bar {
    constructor(a) {
        this.a = a;
    }
}

const foo = new Foo(1);
const bar = new Bar(1);

// Поведение по умолчанию - ошибка из-за разных конструкторов
const assert1 = new Assert();
assert1.deepStrictEqual(foo, bar); // AssertionError

// Без сравнения прототипа - проходит, если свойства равны
const assert2 = new Assert({ skipPrototype: true });
assert2.deepStrictEqual(foo, bar); // OK
```

При деструктуризации методы теряют доступ к контексту `this` экземпляра и возвращаются к поведению утверждений по умолчанию (diff: `'simple'`, нестрогий режим). Чтобы сохранить пользовательские параметры при использовании деструктурированных методов, не применяйте деструктуризацию и вызывайте методы напрямую у экземпляра.

## `assert(value[, message])`

<!-- YAML
added: v0.5.9
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
-->

Добавлено в: v0.5.9

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |

-   `value` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types) Входное значение, проверяемое на истинность.
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Псевдоним [`assert.ok()`](#assertokvalue-message).

## `assert.deepEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/59448
    description: Promises are not considered equal anymore if they are not of
                 the same instance.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57627
    description: Invalid dates are now considered equal.
  - version: v24.0.0
    pr-url: https://github.com/nodejs/node/pull/57622
    description: Recursion now stops when either side encounters a circular
                 reference.
  - version:
      - v22.2.0
      - v20.15.0
    pr-url: https://github.com/nodejs/node/pull/51805
    description: Error cause and errors properties are now compared as well.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41020
    description: Regular expressions lastIndex property is now compared as well.
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical if both sides are
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

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v25.0.0 | Промисы больше не считаются равными, если они не относятся к одному и тому же экземпляру. |
    | v25.0.0 | Недопустимые даты теперь считаются равными. |
    | v24.0.0 | Рекурсия теперь останавливается, когда какая-либо из сторон встречает циклическую ссылку. |
    | v22.2.0, v20.15.0 | Теперь также сравниваются причины и свойства ошибок. |
    | v18.0.0 | Свойство LastIndex регулярных выражений теперь также сравнивается. |
    | v16.0.0, v14.18.0 | В режиме утверждения устаревших версий статус изменен с «Устарело» на «Устаревшее». |
    | v14.0.0 | NaN теперь считается идентичным, если обе стороны равны NaN. |
    | v12.0.0 | Теги типов теперь сравниваются правильно, и есть пара небольших изменений в сравнении, чтобы сделать проверку менее неожиданной. |
    | v9.0.0 | Имена и сообщения `Error` теперь корректно сравниваются. |
    | v8.0.0 | Содержимое Set и Map также сравнивается. |
    | v6.4.0, v4.7.1 | Срезы типизированного массива теперь обрабатываются правильно. |
    | v6.1.0, v4.5.0 | Объекты с циклическими ссылками теперь можно использовать в качестве входных данных. |
    | v5.10.1, v4.4.3 | Правильно обрабатывайте массивы, не относящиеся к Uint8Array. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

**Режим строгих утверждений (strict assertion mode)**

Псевдоним [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

**Режим унаследованных утверждений (legacy assertion mode)**

> Стабильность: 3 - Legacy: вместо этого используйте [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

Проверяет глубокое равенство между параметрами `actual` и `expected`. Предпочтительно использовать [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message) - у [`assert.deepEqual()`](#assertdeepequalactual-expected-message) результат может быть неожиданным.

_Глубокое равенство_ означает, что перечислимые собственные свойства вложенных объектов также рекурсивно оцениваются по следующим правилам.

### Детали сравнения

-   Примитивы сравниваются оператором [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality), за исключением {NaN}: если с обеих сторон {NaN}, они считаются совпадающими.
-   [Теги типов](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны совпадать.
-   Учитываются только [перечислимые собственные свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties).
-   [Обёртки над примитивами](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values) сравниваются и как объекты, и как развёрнутые значения.
-   Реализация не проверяет [`[[Prototype]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов.
-   Свойства [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) не сравниваются.
-   Экземпляры [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) и [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) **не** сравниваются структурно: они равны только если ссылаются на один и тот же объект. Любое сравнение разных экземпляров `WeakMap`, `WeakSet` или `Promise` даёт неравенство, даже при одинаковом содержимом.
-   У [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) всегда сравниваются `lastIndex`, флаги и `source`, даже если это не перечислимые свойства.

Следующий пример не выбрасывает [`AssertionError`](#класс-assertassertionerror), потому что примитивы сравниваются оператором [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality).

=== "MJS"

    ```js
    import assert from 'node:assert';
    // ВНИМАНИЕ: AssertionError при этом не возникает!

    assert.deepEqual('+00000000', false);
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');
    // ВНИМАНИЕ: AssertionError при этом не возникает!

    assert.deepEqual('+00000000', false);
    ```

«Глубокое» равенство означает, что перечислимые собственные свойства вложенных объектов также учитываются:

=== "MJS"

    ```js
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

    // Значения b различаются:
    assert.deepEqual(obj1, obj2);
    // AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }

    assert.deepEqual(obj1, obj3);
    // OK

    // Прототипы игнорируются:
    assert.deepEqual(obj1, obj4);
    // AssertionError: { a: { b: 1 } } deepEqual {}
    ```

=== "CJS"

    ```js
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

    // Значения b различаются:
    assert.deepEqual(obj1, obj2);
    // AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }

    assert.deepEqual(obj1, obj3);
    // OK

    // Прототипы игнорируются:
    assert.deepEqual(obj1, obj4);
    // AssertionError: { a: { b: 1 } } deepEqual {}
    ```

Если значения не равны, выбрасывается [`AssertionError`](#класс-assertassertionerror): свойство `message` равно значению параметра `message`. Если `message` не передан, подставляется сообщение по умолчанию. Если `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не [`AssertionError`](#класс-assertassertionerror).

## `assert.deepStrictEqual(actual, expected[, message])`

<!-- YAML
added: v1.2.0
changes:
  - version: v25.1.0
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/59448
    description: Promises are not considered equal anymore if they are not of
                 the same instance.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57627
    description: Invalid dates are now considered equal.
  - version: v24.0.0
    pr-url: https://github.com/nodejs/node/pull/57622
    description: Recursion now stops when either side encounters a circular
                 reference.
  - version:
    - v22.2.0
    - v20.15.0
    pr-url: https://github.com/nodejs/node/pull/51805
    description: Error cause and errors properties are now compared as well.
  - version: v18.0.0
    pr-url: https://github.com/nodejs/node/pull/41020
    description: Regular expressions lastIndex property is now compared as well.
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

Добавлено в: v1.2.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.1.0 | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v25.0.0 | Промисы больше не считаются равными, если они не относятся к одному и тому же экземпляру. |
    | v25.0.0 | Недопустимые даты теперь считаются равными. |
    | v24.0.0 | Рекурсия теперь останавливается, когда какая-либо из сторон встречает циклическую ссылку. |
    | v22.2.0, v20.15.0 | Теперь также сравниваются причины и свойства ошибок. |
    | v18.0.0 | Свойство LastIndex регулярных выражений теперь также сравнивается. |
    | v9.0.0 | Свойства перечислимых символов теперь сравниваются. |
    | v9.0.0 | `NaN` теперь сравнивается с использованием сравнения [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero). |
    | v8.5.0 | Имена и сообщения `Error` теперь корректно сравниваются. |
    | v8.0.0 | Содержимое Set и Map также сравнивается. |
    | v6.4.0, v4.7.1 | Срезы типизированного массива теперь обрабатываются правильно. |
    | v6.1.0 | Объекты с циклическими ссылками теперь можно использовать в качестве входных данных. |
    | v5.10.1, v4.4.3 | Правильно обрабатывайте массивы, не относящиеся к Uint8Array. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Проверяет глубокое равенство между параметрами `actual` и `expected`. «Глубокое» равенство означает, что перечислимые собственные свойства вложенных объектов также рекурсивно оцениваются по следующим правилам.

### Детали сравнения

-   Примитивы сравниваются через [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
-   [Теги типов](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны совпадать.
-   [`[[Prototype]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов сравнивается оператором [`===`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality).
-   Учитываются только [перечислимые собственные свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties).
-   [Обёртки над примитивами](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values) сравниваются и как объекты, и как развёрнутые значения.
-   Свойства объектов `Object` сравниваются без учёта порядка.
-   Ключи [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) и элементы [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) сравниваются без учёта порядка.
-   Рекурсия останавливается, когда значения различаются или когда одна из сторон натыкается на циклическую ссылку.
-   Экземпляры [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) и [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) **не** сравниваются структурно: они равны только если ссылаются на один и тот же объект. Любое сравнение разных экземпляров `WeakMap`, `WeakSet` или `Promise` даёт неравенство, даже при одинаковом содержимом.
-   У [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) всегда сравниваются `lastIndex`, флаги и `source`, даже если это не перечислимые свойства.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    // Не проходит, так как 1 !== '1'.
    assert.deepStrictEqual({ a: 1 }, { a: '1' });
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    //   {
    // +   a: 1
    // -   a: '1'
    //   }

    // У следующих объектов нет собственных свойств
    const date = new Date();
    const object = {};
    const fakeDate = {};
    Object.setPrototypeOf(fakeDate, Date.prototype);

    // Разный [[Prototype]]:
    assert.deepStrictEqual(object, fakeDate);
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + {}
    // - Date {}

    // Разные теги типов:
    assert.deepStrictEqual(date, fakeDate);
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + 2018-04-26T00:49:08.604Z
    // - Date {}

    assert.deepStrictEqual(NaN, NaN);
    // OK: Object.is(NaN, NaN) === true.

    // Разные развёрнутые числа:
    assert.deepStrictEqual(new Number(1), new Number(2));
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + [Number: 1]
    // - [Number: 2]

    assert.deepStrictEqual(new String('foo'), Object('foo'));
    // OK: объект и строка совпадают после развёртывания.

    assert.deepStrictEqual(-0, -0);
    // OK

    // Разные нули:
    assert.deepStrictEqual(0, -0);
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + 0
    // - -0

    const symbol1 = Symbol();
    const symbol2 = Symbol();
    assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol1]: 1 });
    // OK: в обоих объектах используется один и тот же символ.

    assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol2]: 1 });
    // AssertionError [ERR_ASSERTION]: Inputs identical but not reference equal:
    //
    // {
    //   Symbol(): 1
    // }

    const weakMap1 = new WeakMap();
    const weakMap2 = new WeakMap();
    const obj = {};

    weakMap1.set(obj, 'value');
    weakMap2.set(obj, 'value');

    // Сравнение разных экземпляров не проходит, даже при одинаковом содержимом
    assert.deepStrictEqual(weakMap1, weakMap2);
    // AssertionError: Values have same structure but are not reference-equal:
    //
    // WeakMap {
    //   <items unknown>
    // }

    // Сравнение экземпляра с самим собой проходит
    assert.deepStrictEqual(weakMap1, weakMap1);
    // OK

    const weakSet1 = new WeakSet();
    const weakSet2 = new WeakSet();
    weakSet1.add(obj);
    weakSet2.add(obj);

    // Сравнение разных экземпляров не проходит, даже при одинаковом содержимом
    assert.deepStrictEqual(weakSet1, weakSet2);
    // AssertionError: Values have same structure but are not reference-equal:
    // + actual - expected
    //
    // WeakSet {
    //   <items unknown>
    // }

    // Сравнение экземпляра с самим собой проходит
    assert.deepStrictEqual(weakSet1, weakSet1);
    // OK
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    // Не проходит, так как 1 !== '1'.
    assert.deepStrictEqual({ a: 1 }, { a: '1' });
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    //   {
    // +   a: 1
    // -   a: '1'
    //   }

    // У следующих объектов нет собственных свойств
    const date = new Date();
    const object = {};
    const fakeDate = {};
    Object.setPrototypeOf(fakeDate, Date.prototype);

    // Разный [[Prototype]]:
    assert.deepStrictEqual(object, fakeDate);
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + {}
    // - Date {}

    // Разные теги типов:
    assert.deepStrictEqual(date, fakeDate);
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + 2018-04-26T00:49:08.604Z
    // - Date {}

    assert.deepStrictEqual(NaN, NaN);
    // OK: Object.is(NaN, NaN) === true.

    // Разные развёрнутые числа:
    assert.deepStrictEqual(new Number(1), new Number(2));
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + [Number: 1]
    // - [Number: 2]

    assert.deepStrictEqual(new String('foo'), Object('foo'));
    // OK: объект и строка совпадают после развёртывания.

    assert.deepStrictEqual(-0, -0);
    // OK

    // Разные нули:
    assert.deepStrictEqual(0, -0);
    // AssertionError: Expected inputs to be strictly deep-equal:
    // + actual - expected
    //
    // + 0
    // - -0

    const symbol1 = Symbol();
    const symbol2 = Symbol();
    assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol1]: 1 });
    // OK: в обоих объектах используется один и тот же символ.

    assert.deepStrictEqual({ [symbol1]: 1 }, { [symbol2]: 1 });
    // AssertionError [ERR_ASSERTION]: Inputs identical but not reference equal:
    //
    // {
    //   Symbol(): 1
    // }

    const weakMap1 = new WeakMap();
    const weakMap2 = new WeakMap();
    const obj = {};

    weakMap1.set(obj, 'value');
    weakMap2.set(obj, 'value');

    // Сравнение разных экземпляров не проходит, даже при одинаковом содержимом
    assert.deepStrictEqual(weakMap1, weakMap2);
    // AssertionError: Values have same structure but are not reference-equal:
    //
    // WeakMap {
    //   <items unknown>
    // }

    // Сравнение экземпляра с самим собой проходит
    assert.deepStrictEqual(weakMap1, weakMap1);
    // OK

    const weakSet1 = new WeakSet();
    const weakSet2 = new WeakSet();
    weakSet1.add(obj);
    weakSet2.add(obj);

    // Сравнение разных экземпляров не проходит, даже при одинаковом содержимом
    assert.deepStrictEqual(weakSet1, weakSet2);
    // AssertionError: Values have same structure but are not reference-equal:
    // + actual - expected
    //
    // WeakSet {
    //   <items unknown>
    // }

    // Сравнение экземпляра с самим собой проходит
    assert.deepStrictEqual(weakSet1, weakSet1);
    // OK
    ```

Если значения не равны, выбрасывается [`AssertionError`](#класс-assertassertionerror): свойство `message` равно значению параметра `message`. Если `message` не передан, подставляется сообщение по умолчанию. Если `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не `AssertionError`.

## `assert.doesNotMatch(string, regexp[, message])`

<!-- YAML
added:
  - v13.6.0
  - v12.16.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/38111
    description: This API is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v16.0.0 | Этот API больше не является экспериментальным. |

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `regexp` [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ожидается, что строка `string` **не** будет соответствовать регулярному выражению.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.doesNotMatch('I will fail', /fail/);
    // AssertionError [ERR_ASSERTION]: The input was expected to not match the ...

    assert.doesNotMatch(123, /pass/);
    // AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

    assert.doesNotMatch('I will pass', /different/);
    // OK
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.doesNotMatch('I will fail', /fail/);
    // AssertionError [ERR_ASSERTION]: The input was expected to not match the ...

    assert.doesNotMatch(123, /pass/);
    // AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

    assert.doesNotMatch('I will pass', /different/);
    // OK
    ```

Если строка совпадает с шаблоном или аргумент `string` имеет тип, отличный от `string`, выбрасывается [`AssertionError`](#класс-assertassertionerror): свойство `message` равно значению параметра `message`. Если `message` не передан, подставляется сообщение по умолчанию. Если `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не [`AssertionError`](#класс-assertassertionerror).

## `assert.doesNotReject(asyncFn[, error][, message])`

<!-- YAML
added: v10.0.0
-->

-   `asyncFn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
-   `error` [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Ожидает завершения промиса `asyncFn` или, если `asyncFn` - функция, сразу вызывает её и ожидает промис из возвращаемого значения. Затем проверяется, что промис **не** был отклонён.

Если `asyncFn` - функция и она синхронно выбрасывает ошибку, `assert.doesNotReject()` вернёт отклонённый `Promise` с этой ошибкой. Если функция не возвращает промис, `assert.doesNotReject()` вернёт отклонённый `Promise` с ошибкой [`ERR_INVALID_RETURN_VALUE`](errors.md#err_invalid_return_value). В обоих случаях обработчик ошибки из проверки типа не используется.

На практике `assert.doesNotReject()` почти не полезен: мало смысла перехватывать отклонение и снова отклонять промис. Лучше оставить комментарий у участка кода, который не должен завершаться отклонением, и формулировать сообщения об ошибках максимально ясно.

При необходимости параметр `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) или функцией проверки. Подробнее - в [`assert.throws()`](#assertthrowsfn-error-message).

Поведение после ожидания завершения совпадает с [`assert.doesNotThrow()`](#assertdoesnotthrowfn-error-message), кроме асинхронности.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    await assert.doesNotReject(async () => {
        throw new TypeError('Wrong value');
    }, SyntaxError);
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    (async () => {
        await assert.doesNotReject(async () => {
            throw new TypeError('Wrong value');
        }, SyntaxError);
    })();
    ```

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert
        .doesNotReject(
            Promise.reject(new TypeError('Wrong value'))
        )
        .then(() => {
            // ...
        });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

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

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v5.11.0, v4.4.5 | Параметр `message` теперь учитывается. |
    | v4.2.0 | Параметр error теперь может быть стрелочной функцией. |

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `error` [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Утверждает, что функция `fn` не выбрасывает ошибку.

На практике `assert.doesNotThrow()` почти не полезен: мало смысла перехватывать ошибку и тут же пробрасывать её снова. Лучше оставить комментарий у участка кода, который не должен выбрасывать ошибку, и формулировать сообщения максимально ясно.

При вызове `assert.doesNotThrow()` функция `fn` выполняется сразу.

Если ошибка выброшена и её тип совпадает с типом, заданным параметром `error`, выбрасывается [`AssertionError`](#класс-assertassertionerror). Если тип другой или параметр `error` не задан, ошибка пробрасывается вызывающему коду.

При необходимости `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) или функцией проверки. Подробнее - в [`assert.throws()`](#assertthrowsfn-error-message).

В следующем примере будет выброшен [TypeError](errors.md#class-typeerror), потому что в утверждении нет подходящего типа ошибки:

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.doesNotThrow(() => {
        throw new TypeError('Wrong value');
    }, SyntaxError);
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.doesNotThrow(() => {
        throw new TypeError('Wrong value');
    }, SyntaxError);
    ```

Следующий пример приводит к [`AssertionError`](#класс-assertassertionerror) с сообщением «Got unwanted exception...»:

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.doesNotThrow(() => {
        throw new TypeError('Wrong value');
    }, TypeError);
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.doesNotThrow(() => {
        throw new TypeError('Wrong value');
    }, TypeError);
    ```

Если выброшена [`AssertionError`](#класс-assertassertionerror) и для параметра `message` задано значение, оно дописывается к сообщению [`AssertionError`](#класс-assertassertionerror):

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.doesNotThrow(
        () => {
            throw new TypeError('Wrong value');
        },
        /Wrong value/,
        'Whoops'
    );
    // Throws: AssertionError: Got unwanted exception: Whoops
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

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
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical if both sides are
                 NaN.
-->

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v16.0.0, v14.18.0 | В режиме утверждения устаревших версий статус изменен с «Устарело» на «Устаревшее». |
    | v14.0.0 | NaN теперь считается идентичным, если обе стороны равны NaN. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

**Режим строгих утверждений (strict assertion mode)**

Псевдоним [`assert.strictEqual()`](#assertstrictequalactual-expected-message).

**Режим унаследованных утверждений (legacy assertion mode)**

> Стабильность: 3 - Legacy: вместо этого используйте [`assert.strictEqual()`](#assertstrictequalactual-expected-message).

Проверяет неглубокое равенство с приведением типов между `actual` и `expected` с помощью оператора [`==`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality). `NaN` обрабатывается особым образом: считается совпадающим, если `NaN` с обеих сторон.

=== "MJS"

    ```js
    import assert from 'node:assert';

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

=== "CJS"

    ```js
    const assert = require('node:assert');

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

Если значения не равны, выбрасывается [`AssertionError`](#класс-assertassertionerror): свойство `message` равно значению параметра `message`. Если `message` не передан, подставляется сообщение по умолчанию. Если `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не `AssertionError`.

## `assert.fail([message])`

<!-- YAML
added: v0.1.21
-->

-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) **По умолчанию:** `'Failed'`

Выбрасывает [`AssertionError`](#класс-assertassertionerror) с указанным сообщением или сообщением по умолчанию. Если `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не [`AssertionError`](#класс-assertassertionerror).

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.fail();
    // AssertionError [ERR_ASSERTION]: Failed

    assert.fail('boom');
    // AssertionError [ERR_ASSERTION]: boom

    assert.fail(new TypeError('need array'));
    // TypeError: need array
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.fail();
    // AssertionError [ERR_ASSERTION]: Failed

    assert.fail('boom');
    // AssertionError [ERR_ASSERTION]: boom

    assert.fail(new TypeError('need array'));
    // TypeError: need array
    ```

## `assert.ifError(value)`

<!-- YAML
added: v0.1.97
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18247
    description: Instead of throwing the original error it is now wrapped into
                 an [`AssertionError`](#класс-assertassertionerror) that contains the full stack trace.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18247
    description: Value may now only be `undefined` or `null`. Before all falsy
                 values were handled the same as `null` and did not throw.
-->

Добавлено в: v0.1.97

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.0.0 | Вместо того, чтобы выдавать исходную ошибку, она теперь заключена в [`AssertionError`](#класс-assertassertionerror), который содержит полную трассировку стека. |
    | v10.0.0 | Значение теперь может быть только «неопределенным» или «нулевым». Раньше все ложные значения обрабатывались так же, как и null, и не выбрасывались. |

-   `value` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)

Выбрасывает `value`, если оно не `undefined` и не `null`. Удобно при проверке аргумента `error` в колбэках. В трассировку стека входят все кадры из переданной в `ifError()` ошибки, включая возможные новые кадры для самой `ifError()`.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.ifError(null);
    // OK
    assert.ifError(0);
    // AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 0
    assert.ifError('error');
    // AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 'error'
    assert.ifError(new Error());
    // AssertionError [ERR_ASSERTION]: ifError got unwanted exception: Error

    // Несколько произвольных кадров стека ошибки.
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

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.ifError(null);
    // OK
    assert.ifError(0);
    // AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 0
    assert.ifError('error');
    // AssertionError [ERR_ASSERTION]: ifError got unwanted exception: 'error'
    assert.ifError(new Error());
    // AssertionError [ERR_ASSERTION]: ifError got unwanted exception: Error

    // Несколько произвольных кадров стека ошибки.
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
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v16.0.0
    pr-url: https://github.com/nodejs/node/pull/38111
    description: This API is no longer experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v16.0.0 | Этот API больше не является экспериментальным. |

-   `string` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   `regexp` [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Ожидается, что строка `string` соответствует регулярному выражению.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.match('I will fail', /pass/);
    // AssertionError [ERR_ASSERTION]: The input did not match the regular ...

    assert.match(123, /pass/);
    // AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

    assert.match('I will pass', /pass/);
    // OK
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.match('I will fail', /pass/);
    // AssertionError [ERR_ASSERTION]: The input did not match the regular ...

    assert.match(123, /pass/);
    // AssertionError [ERR_ASSERTION]: The "string" argument must be of type string.

    assert.match('I will pass', /pass/);
    // OK
    ```

Если строка не совпадает с шаблоном или аргумент `string` имеет тип, отличный от `string`, выбрасывается [`AssertionError`](#класс-assertassertionerror): свойство `message` равно значению параметра `message`. Если `message` не передан, подставляется сообщение по умолчанию. Если `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не [`AssertionError`](#класс-assertassertionerror).

## `assert.notDeepEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical if both sides are
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

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v16.0.0, v14.18.0 | В режиме утверждения устаревших версий статус изменен с «Устарело» на «Устаревшее». |
    | v14.0.0 | NaN теперь считается идентичным, если обе стороны равны NaN. |
    | v9.0.0 | Имена и сообщения `Error` теперь корректно сравниваются. |
    | v8.0.0 | Содержимое Set и Map также сравнивается. |
    | v6.4.0, v4.7.1 | Срезы типизированного массива теперь обрабатываются правильно. |
    | v6.1.0, v4.5.0 | Объекты с циклическими ссылками теперь можно использовать в качестве входных данных. |
    | v5.10.1, v4.4.3 | Правильно обрабатывайте массивы, не относящиеся к Uint8Array. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

**Строгий режим утверждения**

Псевдоним [`assert.notDeepStrictEqual()`](#assertnotdeepstrictequalactual-expected-message).

**Режим утверждения Legacy**

> Стабильность: 3 - Legacy: вместо этого используйте [`assert.notDeepStrictEqual()`](#assertnotdeepstrictequalactual-expected-message).

Проверяет произвольное глубокое неравенство. Противоположность [`assert.deepEqual()`](#assertdeepequalactual-expected-message).

=== "MJS"

    ```js
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

=== "CJS"

    ```js
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

Если значения глубоко равны, выбрасывается [`AssertionError`](#класс-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` имеет значение `undefined`, подставляется сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), он будет выброшен вместо `AssertionError`.

## `assert.notDeepStrictEqual(actual, expected[, message])`

<!-- YAML
added: v1.2.0
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
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

Добавлено в: v1.2.0

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v9.0.0 | `-0` и `+0` больше не считаются равными. |
    | v9.0.0 | `NaN` теперь сравнивается с использованием сравнения [SameValueZero](https://tc39.github.io/ecma262/#sec-samevaluezero). |
    | v9.0.0 | Имена и сообщения `Error` теперь корректно сравниваются. |
    | v8.0.0 | Содержимое Set и Map также сравнивается. |
    | v6.4.0, v4.7.1 | Срезы типизированного массива теперь обрабатываются правильно. |
    | v6.1.0 | Объекты с циклическими ссылками теперь можно использовать в качестве входных данных. |
    | v5.10.1, v4.4.3 | Правильно обрабатывайте массивы, не относящиеся к Uint8Array. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Проверяет глубокое строгое неравенство. Противоположность [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message).

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
    // OK
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.notDeepStrictEqual({ a: 1 }, { a: '1' });
    // OK
    ```

Если значения глубоко и строго равны, выбрасывается [`AssertionError`](#класс-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` имеет значение `undefined`, подставляется сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), он будет выброшен вместо [`AssertionError`](#класс-assertassertionerror).

## `assert.notEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version:
      - v16.0.0
      - v14.18.0
    pr-url: https://github.com/nodejs/node/pull/38113
    description: In Legacy assertion mode, changed status from Deprecated to
                 Legacy.
  - version: v14.0.0
    pr-url: https://github.com/nodejs/node/pull/30766
    description: NaN is now treated as being identical if both sides are
                 NaN.
-->

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v16.0.0, v14.18.0 | В режиме утверждения устаревших версий статус изменен с «Устарело» на «Устаревшее». |
    | v14.0.0 | NaN теперь считается идентичным, если обе стороны равны NaN. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

**Строгий режим утверждения**

Псевдоним [`assert.notStrictEqual()`](#assertnotstrictequalactual-expected-message).

**Режим утверждения Legacy**

> Стабильность: 3 - Legacy: вместо этого используйте [`assert.notStrictEqual()`](#assertnotstrictequalactual-expected-message).

Проверяет неглубокое принудительное неравенство с помощью [`!=`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Inequality). `NaN` обрабатывается особым образом и считается совпадающим, если обе стороны - `NaN`.

=== "MJS"

    ```js
    import assert from 'node:assert';

    assert.notEqual(1, 2);
    // OK

    assert.notEqual(1, 1);
    // AssertionError: 1 != 1

    assert.notEqual(1, '1');
    // AssertionError: 1 != '1'
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');

    assert.notEqual(1, 2);
    // OK

    assert.notEqual(1, 1);
    // AssertionError: 1 != 1

    assert.notEqual(1, '1');
    // AssertionError: 1 != '1'
    ```

Если значения равны, выбрасывается [`AssertionError`](#класс-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` имеет значение `undefined`, подставляется сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), он будет выброшен вместо `AssertionError`.

## `assert.notStrictEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17003
    description: Used comparison changed from Strict Equality to `Object.is()`.
-->

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v10.0.0 | Используемое сравнение изменено со «Строгого равенства» на «Object.is()». |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Проверяет строгое неравенство между параметрами `actual` и `expected`, определяемое [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.notStrictEqual(1, 2);
    // OK

    assert.notStrictEqual(1, 1);
    // AssertionError [ERR_ASSERTION]: Expected "actual" to be strictly unequal to:
    //
    // 1

    assert.notStrictEqual(1, '1');
    // OK
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.notStrictEqual(1, 2);
    // OK

    assert.notStrictEqual(1, 1);
    // AssertionError [ERR_ASSERTION]: Expected "actual" to be strictly unequal to:
    //
    // 1

    assert.notStrictEqual(1, '1');
    // OK
    ```

Если значения строго равны, выбрасывается [`AssertionError`](#класс-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` имеет значение `undefined`, подставляется сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), он будет выброшен вместо `AssertionError`.

## `assert.ok(value[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/18319
    description: The `assert.ok()` (no arguments) will now use a predefined
                 error message.
-->

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v10.0.0 | `assert.ok()` (без аргументов) теперь будет использовать предопределенное сообщение об ошибке. |

-   `value` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Проверяет, является ли `value` истинным (truthy). Эквивалентно `assert.equal(!!value, true, message)`.

Если `value` ложно (falsy), выбрасывается [`AssertionError`](#класс-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` имеет значение `undefined`, подставляется сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), он будет выброшен вместо `AssertionError`. Если аргументы не переданы вообще, `message` будет установлена в строку `` 'No value argument passed to `assert.ok()`' ``.

Имейте в виду: в REPL текст ошибки отличается от того, что выводится при выполнении файла. Подробности ниже.

<!-- eslint-skip -->

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.ok(true);
    // OK
    assert.ok(1);
    // OK

    assert.ok();
    // AssertionError: No value argument passed to `assert.ok()`

    assert.ok(false, "it's false");
    // AssertionError: it's false

    // В REPL:
    assert.ok(typeof 123 === 'string');
    // AssertionError: false == true

    // В файле (например, test.js):
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

<!-- eslint-skip -->

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.ok(true);
    // OK
    assert.ok(1);
    // OK

    assert.ok();
    // AssertionError: No value argument passed to `assert.ok()`

    assert.ok(false, "it's false");
    // AssertionError: it's false

    // В REPL:
    assert.ok(typeof 123 === 'string');
    // AssertionError: false == true

    // В файле (например, test.js):
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

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    // Вызов `assert()` ведёт себя так же:
    assert(2 + 2 > 5);
    // AssertionError: The expression evaluated to a falsy value:
    //
    //   assert(2 + 2 > 5)
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');

    // Вызов `assert()` ведёт себя так же:
    assert(2 + 2 > 5);
    // AssertionError: The expression evaluated to a falsy value:
    //
    //   assert(2 + 2 > 5)
    ```

## `assert.rejects(asyncFn[, error][, message])`

<!-- YAML
added: v10.0.0
-->

-   `asyncFn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)
-   `error` [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)
-   Возвращает: [`<Promise>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)

Ожидает промис `asyncFn` или, если `asyncFn` - функция, сразу вызывает её и ожидает завершения возвращённого промиса. Затем проверяется, что промис отклонён.

Если `asyncFn` - функция и она синхронно выбрасывает ошибку, `assert.rejects()` вернёт отклонённый `Promise` с этой ошибкой. Если функция не возвращает промис, `assert.rejects()` вернёт отклонённый `Promise` с ошибкой [`ERR_INVALID_RETURN_VALUE`](errors.md#err_invalid_return_value). В обоих случаях обработчик ошибки пропускается.

Помимо асинхронного ожидания завершения поведение совпадает с [`assert.throws()`](#assertthrowsfn-error-message).

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), функцией проверки, объектом, для которого проверяется каждое свойство, или экземпляром ошибки, для которого проверяется каждое свойство, включая неперечислимые свойства `message` и `name`.

Если указано, `message` будет сообщением, которое передаёт [`AssertionError`](#класс-assertassertionerror), если `asyncFn` не отклонится.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

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

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

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

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

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

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

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

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert
        .rejects(
            Promise.reject(new Error('Wrong value')),
            Error
        )
        .then(() => {
            // ...
        });
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert
        .rejects(
            Promise.reject(new Error('Wrong value')),
            Error
        )
        .then(() => {
            // ...
        });
    ```

`error` не может быть строкой. Если вторым аргументом передана строка, считается, что `error` опущен, и строка используется как `message`. Это легко даёт незаметные ошибки. Внимательно прочитайте пример в [`assert.throws()`](#assertthrowsfn-error-message), если рассматриваете передачу строки вторым аргументом.

## `assert.strictEqual(actual, expected[, message])`

<!-- YAML
added: v0.1.21
changes:
  - version: REPLACEME
    pr-url: https://github.com/nodejs/node/pull/58849
    description: Message may now be a `printf`-like format string or function.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/17003
    description: Used comparison changed from Strict Equality to `Object.is()`.
-->

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | REPLACEME | Сообщение теперь может быть строкой формата или функцией типа printf. |
    | v10.0.0 | Используемое сравнение изменено со «Строгого равенства» на «Object.is()». |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) Постфиксные аргументы в стиле `printf`, если `message` используется как строка формата. Если `message` - функция, она вызывается при несовпадении сравнения. Функция получает аргументы `actual` и `expected` и должна вернуть строку, которая будет использована как сообщение об ошибке. Строки формата в стиле `printf` и функции удобны для производительности, когда аргументы пробрасываются дальше. Кроме того, так проще получить аккуратное форматирование.

Проверяет строгое равенство между параметрами `actual` и `expected` так, как определяет [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.strictEqual(1, 2);
    // AssertionError [ERR_ASSERTION]: Ожидается, что входные значения строго равны:
    //
    // 1 !== 2

    assert.strictEqual(1, 1);
    // OK

    assert.strictEqual('Hello foobar', 'Hello World!');
    // AssertionError [ERR_ASSERTION]: Ожидается, что входные значения строго равны:
    // + фактическое - ожидаемое
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
        apples,
        oranges,
        'apples %s !== oranges %s',
        apples,
        oranges
    );
    // AssertionError [ERR_ASSERTION]: apples 1 !== oranges 2

    assert.strictEqual(
        1,
        '1',
        new TypeError('Inputs are not identical')
    );
    // TypeError: Inputs are not identical

    assert.strictEqual(apples, oranges, (actual, expected) => {
        // «Тяжёлые» вычисления
        return `I expected ${expected} but I got ${actual}`;
    });
    // AssertionError [ERR_ASSERTION]: I expected oranges but I got apples
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.strictEqual(1, 2);
    // AssertionError [ERR_ASSERTION]: Ожидается, что входные значения строго равны:
    //
    // 1 !== 2

    assert.strictEqual(1, 1);
    // OK

    assert.strictEqual('Hello foobar', 'Hello World!');
    // AssertionError [ERR_ASSERTION]: Ожидается, что входные значения строго равны:
    // + фактическое - ожидаемое
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
        apples,
        oranges,
        'apples %s !== oranges %s',
        apples,
        oranges
    );
    // AssertionError [ERR_ASSERTION]: apples 1 !== oranges 2

    assert.strictEqual(
        1,
        '1',
        new TypeError('Inputs are not identical')
    );
    // TypeError: Inputs are not identical

    assert.strictEqual(apples, oranges, (actual, expected) => {
        // «Тяжёлые» вычисления
        return `I expected ${expected} but I got ${actual}`;
    });
    // AssertionError [ERR_ASSERTION]: I expected oranges but I got apples
    ```

Если значения не строго равны, выбрасывается [`AssertionError`](#класс-assertassertionerror) со свойством `message`, равным значению параметра `message`. Если параметр `message` равен `undefined`, подставляется сообщение об ошибке по умолчанию. Если параметр `message` является экземпляром [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error), выбрасывается он, а не [`AssertionError`](#класс-assertassertionerror).

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

Добавлено в: v0.1.21

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v10.2.0 | Параметр error теперь может быть объектом, содержащим регулярные выражения. |
    | v9.9.0 | Параметр error теперь также может быть объектом. |
    | v4.2.0 | Параметр error теперь может быть стрелочной функцией. |

-   `fn` [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)
-   `error` [`<RegExp>`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function) | [`<Object>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type)

Ожидает, что функция `fn` выбросит ошибку.

Если указано, `error` может быть [`Class`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes), [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions), функцией проверки, объектом проверки, для каждого свойства которого проверяется строгое глубокое равенство, или экземпляром ошибки, для каждого свойства которого проверяется строгое глубокое равенство, включая неперечислимые свойства `message` и `name`. При использовании объекта для проверки строкового свойства можно использовать регулярное выражение. Примеры см. ниже.

Если указано, `message` дополняет сообщение, которое даёт `AssertionError`, если вызов `fn` не привёл к выбросу или если проверка ошибки не прошла.

Пользовательский объект проверки / экземпляр ошибки:

=== "MJS"

    ```js
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
            // Проверяются только свойства объекта проверки.
            // Для вложенных объектов должны присутствовать все свойства, иначе
            // проверка не пройдёт.
        }
    );

    // Регулярные выражения для проверки свойств ошибки:
    assert.throws(
        () => {
            throw err;
        },
        {
            // Свойства `name` и `message` - строки; для них регулярные выражения
            // сопоставляются со строкой. При неудаче выбрасывается ошибка.
            name: /^TypeError$/,
            message: /Wrong/,
            foo: 'bar',
            info: {
                nested: true,
                // Для вложенных свойств нельзя использовать регулярные выражения!
                baz: 'text',
            },
            // Свойство `reg` содержит регулярное выражение; проверка пройдёт только
            // если в объекте проверки то же самое регулярное выражение.
            reg: /abc/i,
        }
    );

    // Не проходит из-за разных свойств `message` и `name`:
    assert.throws(
        () => {
            const otherErr = new Error('Not found');
            // Копируем все перечислимые свойства из `err` в `otherErr`.
            for (const [key, value] of Object.entries(err)) {
                otherErr[key] = value;
            }
            throw otherErr;
        },
        // Свойства `message` и `name` ошибки также проверяются, если ошибка
        // используется как объект проверки.
        err
    );
    ```

=== "CJS"

    ```js
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
            // Проверяются только свойства объекта проверки.
            // Для вложенных объектов должны присутствовать все свойства, иначе
            // проверка не пройдёт.
        }
    );

    // Регулярные выражения для проверки свойств ошибки:
    assert.throws(
        () => {
            throw err;
        },
        {
            // Свойства `name` и `message` - строки; для них регулярные выражения
            // сопоставляются со строкой. При неудаче выбрасывается ошибка.
            name: /^TypeError$/,
            message: /Wrong/,
            foo: 'bar',
            info: {
                nested: true,
                // Для вложенных свойств нельзя использовать регулярные выражения!
                baz: 'text',
            },
            // Свойство `reg` содержит регулярное выражение; проверка пройдёт только
            // если в объекте проверки то же самое регулярное выражение.
            reg: /abc/i,
        }
    );

    // Не проходит из-за разных свойств `message` и `name`:
    assert.throws(
        () => {
            const otherErr = new Error('Not found');
            // Копируем все перечислимые свойства из `err` в `otherErr`.
            for (const [key, value] of Object.entries(err)) {
                otherErr[key] = value;
            }
            throw otherErr;
        },
        // Свойства `message` и `name` ошибки также проверяются, если ошибка
        // используется как объект проверки.
        err
    );
    ```

Проверка `instanceof` через конструктор:

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.throws(() => {
        throw new Error('Wrong value');
    }, Error);
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.throws(() => {
        throw new Error('Wrong value');
    }, Error);
    ```

Проверка сообщения об ошибке с помощью [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions):

При использовании регулярного выражения для объекта ошибки вызывается `.toString`, поэтому в сопоставление попадает и имя ошибки.

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.throws(() => {
        throw new Error('Wrong value');
    }, /^Error: Wrong value$/);
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.throws(() => {
        throw new Error('Wrong value');
    }, /^Error: Wrong value$/);
    ```

Пользовательская проверка ошибки:

Функция должна вернуть `true`, чтобы показать, что все внутренние проверки прошли. Иначе проверка завершится с [`AssertionError`](#класс-assertassertionerror).

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    assert.throws(
        () => {
            throw new Error('Wrong value');
        },
        (err) => {
            assert(err instanceof Error);
            assert(/value/.test(err));
            // Не возвращайте из функций проверки ничего, кроме `true`.
            // Иначе непонятно, какая часть проверки не прошла. Вместо этого
            // выбросьте ошибку о конкретной неудавшейся проверке (как в этом
            // примере) и добавьте в неё как можно больше полезной отладочной информации.
            return true;
        },
        'unexpected error'
    );
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    assert.throws(
        () => {
            throw new Error('Wrong value');
        },
        (err) => {
            assert(err instanceof Error);
            assert(/value/.test(err));
            // Не возвращайте из функций проверки ничего, кроме `true`.
            // Иначе непонятно, какая часть проверки не прошла. Вместо этого
            // выбросьте ошибку о конкретной неудавшейся проверке (как в этом
            // примере) и добавьте в неё как можно больше полезной отладочной информации.
            return true;
        },
        'unexpected error'
    );
    ```

`error` не может быть строкой. Если вторым аргументом передана строка, считается, что `error` опущен, и строка используется как `message`. Это легко даёт незаметные ошибки. Если сообщение совпадает с текстом выброшенной ошибки, возникнет ошибка `ERR_AMBIGUOUS_ARGUMENT`. Внимательно прочитайте пример ниже, если рассматриваете передачу строки вторым аргументом:

=== "MJS"

    ```js
    import assert from 'node:assert/strict';

    function throwingFirst() {
        throw new Error('First');
    }

    function throwingSecond() {
        throw new Error('Second');
    }

    function notThrowing() {}

    // Второй аргумент - строка, а входная функция выбросила Error.
    // Первый случай не выбросит ошибку, так как не совпадает с сообщением
    // ошибки из входной функции!
    assert.throws(throwingFirst, 'Second');
    // В следующем примере сообщение не добавляет ничего к сообщению из
    // ошибки, и неясно, хотел ли пользователь сопоставлять именно текст ошибки,
    // поэтому Node.js выбрасывает ошибку `ERR_AMBIGUOUS_ARGUMENT`.
    assert.throws(throwingSecond, 'Second');
    // TypeError [ERR_AMBIGUOUS_ARGUMENT]

    // Строка используется (как message) только если функция не выбросила ошибку:
    assert.throws(notThrowing, 'Second');
    // AssertionError [ERR_ASSERTION]: Missing expected exception: Second

    // Если нужно сопоставлять сообщение об ошибке, сделайте так:
    // Ошибка не выбрасывается, так как сообщения совпадают.
    assert.throws(throwingSecond, /Second$/);

    // Если сообщение не совпадает, выбрасывается AssertionError.
    assert.throws(throwingFirst, /Second$/);
    // AssertionError [ERR_ASSERTION]
    ```

=== "CJS"

    ```js
    const assert = require('node:assert/strict');

    function throwingFirst() {
        throw new Error('First');
    }

    function throwingSecond() {
        throw new Error('Second');
    }

    function notThrowing() {}

    // Второй аргумент - строка, а входная функция выбросила Error.
    // Первый случай не выбросит ошибку, так как не совпадает с сообщением
    // ошибки из входной функции!
    assert.throws(throwingFirst, 'Second');
    // В следующем примере сообщение не добавляет ничего к сообщению из
    // ошибки, и неясно, хотел ли пользователь сопоставлять именно текст ошибки,
    // поэтому Node.js выбрасывает ошибку `ERR_AMBIGUOUS_ARGUMENT`.
    assert.throws(throwingSecond, 'Second');
    // TypeError [ERR_AMBIGUOUS_ARGUMENT]

    // Строка используется (как message) только если функция не выбросила ошибку:
    assert.throws(notThrowing, 'Second');
    // AssertionError [ERR_ASSERTION]: Missing expected exception: Second

    // Если нужно сопоставлять сообщение об ошибке, сделайте так:
    // Ошибка не выбрасывается, так как сообщения совпадают.
    assert.throws(throwingSecond, /Second$/);

    // Если сообщение не совпадает, выбрасывается AssertionError.
    assert.throws(throwingFirst, /Second$/);
    // AssertionError [ERR_ASSERTION]
    ```

Из-за запутанной и подверженной ошибкам записи не используйте строку вторым аргументом.

## `assert.partialDeepStrictEqual(actual, expected[, message])`

<!-- YAML
added:
  - v23.4.0
  - v22.13.0
changes:
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/59448
    description: Promises are not considered equal anymore if they are not of
                 the same instance.
  - version: v25.0.0
    pr-url: https://github.com/nodejs/node/pull/57627
    description: Invalid dates are now considered equal.
  - version:
      - v24.0.0
      - v22.17.0
    pr-url: https://github.com/nodejs/node/pull/57370
    description: partialDeepStrictEqual is now Stable. Previously, it had been Experimental.
-->

??? note "История"

    | Версия | Изменения |
    | --- | --- |
    | v25.0.0 | Промисы больше не считаются равными, если они не относятся к одному и тому же экземпляру. |
    | v25.0.0 | Недопустимые даты теперь считаются равными. |
    | v24.0.0, v22.17.0 | PartialDeepStrictEqual теперь является стабильным. Раньше это был экспериментальный вариант. |

-   `actual` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `expected` [<any>](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#Data_types)
-   `message` [`<string>`](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures#String_type) | [`<Error>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) | [`<Function>`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function)

Проверяет частичное глубокое равенство между параметрами `actual` и `expected`. «Глубокое» равенство означает, что перечислимые собственные свойства дочерних объектов рекурсивно оцениваются по правилам ниже. «Частичное» равенство означает, что сравниваются только свойства, присутствующие в параметре `expected`.

Этот метод всегда проходит те же проверки, что и [`assert.deepStrictEqual()`](#assertdeepstrictequalactual-expected-message), и ведёт себя как надмножество этой функции.

### Детали сравнения

-   Примитивы сравниваются через [`Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
-   [Теги типов](https://tc39.github.io/ecma262/#sec-object.prototype.tostring) объектов должны совпадать.
-   [`[[Prototype]]`](https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) объектов не сравниваются.
-   Учитываются только [перечислимые собственные свойства](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties).
-   [Обёртки объектов](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values) сравниваются и как объекты, и как развёрнутые значения.
-   Свойства `Object` сравниваются без учёта порядка.
-   Ключи [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) и элементы [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) сравниваются без учёта порядка.
-   Рекурсия останавливается, когда обе стороны различаются или обе доходят до циклической ссылки.
-   Экземпляры [WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap), [WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) и [Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise) **не** сравниваются структурно. Они равны только если ссылаются на один и тот же объект. Любое сравнение разных экземпляров `WeakMap`, `WeakSet` или `Promise` даст неравенство, даже при одинаковом содержимом.
-   У [RegExp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) всегда сравниваются `lastIndex`, флаги и `source`, даже если это неперечислимые свойства.
-   Дыры в разреженных массивах игнорируются.

=== "MJS"

    ```js
    import assert from 'node:assert';

    assert.partialDeepStrictEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 1 } } }
    );
    // OK

    assert.partialDeepStrictEqual(
        { a: 1, b: 2, c: 3 },
        { b: 2 }
    );
    // OK

    assert.partialDeepStrictEqual(
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 8]
    );
    // OK

    assert.partialDeepStrictEqual(
        new Set([{ a: 1 }, { b: 1 }]),
        new Set([{ a: 1 }])
    );
    // OK

    assert.partialDeepStrictEqual(
        new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]),
        new Map([['key2', 'value2']])
    );
    // OK

    assert.partialDeepStrictEqual(123n, 123n);
    // OK

    assert.partialDeepStrictEqual(
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [5, 4, 8]
    );
    // AssertionError

    assert.partialDeepStrictEqual({ a: 1 }, { a: 1, b: 2 });
    // AssertionError

    assert.partialDeepStrictEqual(
        { a: { b: 2 } },
        { a: { b: '2' } }
    );
    // AssertionError
    ```

=== "CJS"

    ```js
    const assert = require('node:assert');

    assert.partialDeepStrictEqual(
        { a: { b: { c: 1 } } },
        { a: { b: { c: 1 } } }
    );
    // OK

    assert.partialDeepStrictEqual(
        { a: 1, b: 2, c: 3 },
        { b: 2 }
    );
    // OK

    assert.partialDeepStrictEqual(
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 8]
    );
    // OK

    assert.partialDeepStrictEqual(
        new Set([{ a: 1 }, { b: 1 }]),
        new Set([{ a: 1 }])
    );
    // OK

    assert.partialDeepStrictEqual(
        new Map([
            ['key1', 'value1'],
            ['key2', 'value2'],
        ]),
        new Map([['key2', 'value2']])
    );
    // OK

    assert.partialDeepStrictEqual(123n, 123n);
    // OK

    assert.partialDeepStrictEqual(
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
        [5, 4, 8]
    );
    // AssertionError

    assert.partialDeepStrictEqual({ a: 1 }, { a: 1, b: 2 });
    // AssertionError

    assert.partialDeepStrictEqual(
        { a: { b: 2 } },
        { a: { b: '2' } }
    );
    // AssertionError
    ```

<!-- markdownlint-enable MD024 -->
