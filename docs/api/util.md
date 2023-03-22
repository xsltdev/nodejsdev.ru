# Модуль util

<!--introduced_in=v0.10.0-->

> Стабильность: 2 - стабильная

<!-- source_link=lib/util.js -->

В `util` модуль поддерживает потребности внутренних API Node.js. Многие из утилит также полезны для разработчиков приложений и модулей. Чтобы получить к нему доступ:

```js
const util = require('util');
```

## `util.callbackify(original)`

<!-- YAML
added: v8.2.0
-->

- `original` {Function} An `async` функция
- Возвращает: {Function} функцию стиля обратного вызова

Принимает `async` функция (или функция, которая возвращает `Promise`) и возвращает функцию, следуя стилю обратного вызова сначала с ошибкой, т. е. принимая `(err, value) => ...` обратный вызов в качестве последнего аргумента. В обратном вызове первым аргументом будет причина отказа (или `null` если `Promise` разрешено), а вторым аргументом будет разрешенное значение.

```js
const util = require('util');

async function fn() {
  return 'hello world';
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  if (err) throw err;
  console.log(ret);
});
```

Напечатаем:

```text
hello world
```

Обратный вызов выполняется асинхронно и будет иметь ограниченную трассировку стека. Если обратный вызов выдает ошибку, процесс выдаст сообщение [`'uncaughtException'`](process.md#event-uncaughtexception) событие, и, если не обработано, выйдет.

С `null` имеет особое значение в качестве первого аргумента обратного вызова, если обернутая функция отклоняет `Promise` с ложным значением в качестве причины, значение помещается в `Error` с исходным значением, хранящимся в поле с именем `reason`.

```js
function fn() {
  return Promise.reject(null);
}
const callbackFunction = util.callbackify(fn);

callbackFunction((err, ret) => {
  // When the Promise was rejected with `null` it is wrapped with an Error and
  // the original value is stored in `reason`.
  err &&
    err.hasOwnProperty('reason') &&
    err.reason === null; // true
});
```

## `util.debuglog(section[, callback])`

<!-- YAML
added: v0.11.3
-->

- `section` {строка} Строка, определяющая часть приложения, для которой `debuglog` функция создается.
- `callback` {Функция} Обратный вызов вызывается при первом вызове функции регистрации с аргументом функции, который является более оптимизированной функцией регистрации.
- Возвращает: {Функция} Функция регистрации.

В `util.debuglog()` используется для создания функции, которая условно записывает сообщения отладки в `stderr` основанный на существовании `NODE_DEBUG` переменная окружения. Если `section` имя появляется в значении этой переменной среды, тогда возвращаемая функция работает аналогично [`console.error()`](console.md#consoleerrordata-args). Если нет, то возвращенная функция не работает.

```js
const util = require('util');
const debuglog = util.debuglog('foo');

debuglog('hello from foo [%d]', 123);
```

Если эта программа запускается с `NODE_DEBUG=foo` в среде, то он выдаст что-то вроде:

```console
FOO 3245: hello from foo [123]
```

куда `3245` это идентификатор процесса. Если он не запускается с установленной переменной среды, он ничего не печатает.

В `section` также поддерживает подстановочные знаки:

```js
const util = require('util');
const debuglog = util.debuglog('foo-bar');

debuglog("hi there, it's foo-bar [%d]", 2333);
```

если он запускается с `NODE_DEBUG=foo*` в среде, то он выдаст что-то вроде:

```console
FOO-BAR 3257: hi there, it's foo-bar [2333]
```

Несколько через запятую `section` имена могут быть указаны в `NODE_DEBUG` переменная окружения: `NODE_DEBUG=fs,net,tls`.

Необязательный `callback` Аргумент может использоваться для замены функции ведения журнала другой функцией, не имеющей никакой инициализации или ненужной упаковки.

```js
const util = require('util');
let debuglog = util.debuglog('internals', (debug) => {
  // Replace with a logging function that optimizes out
  // testing if the section is enabled
  debuglog = debug;
});
```

### `debuglog().enabled`

<!-- YAML
added: v14.9.0
-->

- {логический}

В `util.debuglog().enabled` getter используется для создания теста, который может использоваться в условных выражениях на основе существования `NODE_DEBUG` переменная окружения. Если `section` имя отображается в значении этой переменной среды, тогда возвращаемое значение будет `true`. Если нет, то возвращаемое значение будет `false`.

```js
const util = require('util');
const enabled = util.debuglog('foo').enabled;
if (enabled) {
  console.log('hello from foo [%d]', 123);
}
```

Если эта программа запускается с `NODE_DEBUG=foo` в среде, то он выдаст что-то вроде:

```console
hello from foo [123]
```

## `util.debug(section)`

<!-- YAML
added: v14.9.0
-->

Псевдоним для `util.debuglog`. Использование обеспечивает удобочитаемость, что не подразумевает ведение журнала только при использовании `util.debuglog().enabled`.

## `util.deprecate(fn, msg[, code])`

<!-- YAML
added: v0.8.0
changes:
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/16393
    description: Deprecation warnings are only emitted once for each code.
-->

- `fn` {Функция} Функция, которая считается устаревшей.
- `msg` {строка} Предупреждающее сообщение, отображаемое при вызове устаревшей функции.
- `code` {строка} Код устаревания. Увидеть [список устаревших API]() для списка кодов.
- Возвращает: {Функция} Устаревшая функция, обернутая для выдачи предупреждения.

В `util.deprecate()` обертки методов `fn` (который может быть функцией или классом) таким образом, чтобы он был помечен как устаревший.

```js
const util = require('util');

exports.obsoleteFunction = util.deprecate(() => {
  // Do something here.
}, 'obsoleteFunction() is deprecated. Use newShinyFunction() instead.');
```

Когда позвонили, `util.deprecate()` вернет функцию, которая выдаст `DeprecationWarning` с помощью [`'warning'`](process.md#event-warning) событие. Предупреждение будет выпущено и распечатано на `stderr` при первом вызове возвращаемой функции. После выдачи предупреждения обернутая функция вызывается без выдачи предупреждения.

Если такой же необязательный `code` поставляется в нескольких вызовах `util.deprecate()`, предупреждение будет выдано только один раз для этого `code`.

```js
const util = require('util');

const fn1 = util.deprecate(
  someFunction,
  someMessage,
  'DEP0001'
);
const fn2 = util.deprecate(
  someOtherFunction,
  someOtherMessage,
  'DEP0001'
);
fn1(); // Emits a deprecation warning with code DEP0001
fn2(); // Does not emit a deprecation warning because it has the same code
```

Если либо `--no-deprecation` или `--no-warnings` используются флаги командной строки, или если `process.noDeprecation` свойство установлено на `true` _прежний_ к первому предупреждению об устаревании `util.deprecate()` метод ничего не делает.

Если `--trace-deprecation` или `--trace-warnings` установлены флаги командной строки или `process.traceDeprecation` свойство установлено на `true`, предупреждение и трассировка стека печатаются в `stderr` при первом вызове устаревшей функции.

Если `--throw-deprecation` установлен флаг командной строки или `process.throwDeprecation` свойство установлено на `true`, то при вызове устаревшей функции будет сгенерировано исключение.

В `--throw-deprecation` флаг командной строки и `process.throwDeprecation` собственность имеет приоритет над `--trace-deprecation` а также `process.traceDeprecation`.

## `util.format(format[, ...args])`

<!-- YAML
added: v0.5.3
changes:
  - version: v12.11.0
    pr-url: https://github.com/nodejs/node/pull/29606
    description: The `%c` specifier is ignored now.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/23162
    description: The `format` argument is now only taken as such if it actually
                 contains format specifiers.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/23162
    description: If the `format` argument is not a format string, the output
                 string's formatting is no longer dependent on the type of the
                 first argument. This change removes previously present quotes
                 from strings that were being output when the first argument
                 was not a string.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/23708
    description: The `%d`, `%f` and `%i` specifiers now support Symbols
                 properly.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/24806
    description: The `%o` specifier's `depth` has default depth of 4 again.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/17907
    description: The `%o` specifier's `depth` option will now fall back to the
                 default depth.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/22097
    description: The `%d` and `%i` specifiers now support BigInt.
  - version: v8.4.0
    pr-url: https://github.com/nodejs/node/pull/14558
    description: The `%o` and `%O` specifiers are supported now.
-->

- `format` {строка} A `printf`-подобная строка формата.

В `util.format()` метод возвращает отформатированную строку, используя первый аргумент как `printf`-подобная строка формата, которая может содержать ноль или более спецификаторов формата. Каждый спецификатор заменяется преобразованным значением из соответствующего аргумента. Поддерживаемые спецификаторы:

- `%s`: `String` будет использоваться для преобразования всех значений, кроме `BigInt`, `Object` а также `-0`. `BigInt` значения будут представлены с `n` и объекты, которые не определены пользователем `toString` функция проверяется с помощью `util.inspect()` с опциями `{ depth: 0, colors: false, compact: 3 }`.
- `%d`: `Number` будет использоваться для преобразования всех значений, кроме `BigInt` а также `Symbol`.
- `%i`: `parseInt(value, 10)` используется для всех значений, кроме `BigInt` а также `Symbol`.
- `%f`: `parseFloat(value)` используется для всех значений, кроме `Symbol`.
- `%j`: JSON. Заменено строкой `'[Circular]'` если аргумент содержит циклические ссылки.
- `%o`: `Object`. Строковое представление объекта с общим форматированием объекта JavaScript. Похожий на `util.inspect()` с опциями `{ showHidden: true, showProxy: true }`. Это покажет весь объект, включая неперечислимые свойства и прокси.
- `%O`: `Object`. Строковое представление объекта с общим форматированием объекта JavaScript. Похожий на `util.inspect()` без вариантов. Это покажет весь объект, не включая неперечислимые свойства и прокси.
- `%c`: `CSS`. Этот спецификатор игнорируется и пропускает любой переданный CSS.
- `%%`: одинарный знак процента (`'%'`). Это не требует аргументов.
- Возвращает: {строка} отформатированная строка.

Если спецификатор не имеет соответствующего аргумента, он не заменяется:

```js
util.format('%s:%s', 'foo');
// Returns: 'foo:%s'
```

Значения, не являющиеся частью строки формата, форматируются с использованием `util.inspect()` если их тип не `string`.

Если в `util.format()` метода, чем количество спецификаторов, дополнительные аргументы объединяются в возвращаемую строку, разделенную пробелами:

```js
util.format('%s:%s', 'foo', 'bar', 'baz');
// Returns: 'foo:bar baz'
```

Если первый аргумент не содержит допустимого спецификатора формата, `util.format()` возвращает строку, которая представляет собой объединение всех аргументов, разделенных пробелами:

```js
util.format(1, 2, 3);
// Returns: '1 2 3'
```

Если передан только один аргумент `util.format()`, он возвращается без форматирования:

```js
util.format('%% %s');
// Returns: '%% %s'
```

`util.format()` - это синхронный метод, предназначенный для отладки. Некоторые входные значения могут иметь значительные накладные расходы на производительность, которые могут блокировать цикл событий. Используйте эту функцию осторожно и никогда в горячем коде.

## `util.formatWithOptions(inspectOptions, format[, ...args])`

<!-- YAML
added: v10.0.0
-->

- `inspectOptions` {Объект}
- `format` {нить}

Эта функция идентична [`util.format()`](#utilformatformat-args), за исключением того, что требуется `inspectOptions` аргумент, который указывает параметры, которые передаются в [`util.inspect()`](#utilinspectobject-options).

```js
util.formatWithOptions({ colors: true }, 'See object %O', {
  foo: 42,
});
// Returns 'See object { foo: 42 }', where `42` is colored as a number
// when printed to a terminal.
```

## `util.getSystemErrorName(err)`

<!-- YAML
added: v9.7.0
-->

- `err` {количество}
- Возвращает: {строка}

Возвращает имя строки для числового кода ошибки, полученного от API Node.js. Сопоставление кодов ошибок и имен ошибок зависит от платформы. Видеть [Общие системные ошибки](errors.md#common-system-errors) за названиями распространенных ошибок.

```js
fs.access('file/that/does/not/exist', (err) => {
  const name = util.getSystemErrorName(err.errno);
  console.error(name); // ENOENT
});
```

## `util.getSystemErrorMap()`

<!-- YAML
added:
  - v16.0.0
  - v14.17.0
-->

- Возврат: {Map}

Возвращает карту всех кодов системных ошибок, доступных в API Node.js. Сопоставление кодов ошибок и имен ошибок зависит от платформы. Видеть [Общие системные ошибки](errors.md#common-system-errors) за названиями распространенных ошибок.

```js
fs.access('file/that/does/not/exist', (err) => {
  const errorMap = util.getSystemErrorMap();
  const name = errorMap.get(err.errno);
  console.error(name); // ENOENT
});
```

## `util.inherits(constructor, superConstructor)`

<!-- YAML
added: v0.3.0
changes:
  - version: v5.0.0
    pr-url: https://github.com/nodejs/node/pull/3455
    description: The `constructor` parameter can refer to an ES6 class now.
-->

> Стабильность: 3 - Наследие: используйте синтаксис класса ES2015 и `extends` ключевое слово вместо этого.

- `constructor` {Функция}
- `superConstructor` {Функция}

Использование `util.inherits()` обескуражен. Пожалуйста, используйте ES6 `class` а также `extends` ключевые слова для получения поддержки наследования на уровне языка. Также обратите внимание, что эти два стиля [семантически несовместимый](https://github.com/nodejs/node/issues/4179).

Наследовать методы прототипа от одного [конструктор](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor) в другой. Прототип `constructor` будет установлен на новый объект, созданный из `superConstructor`.

Это в основном добавляет некоторую проверку ввода поверх `Object.setPrototypeOf(constructor.prototype, superConstructor.prototype)`. В качестве дополнительного удобства `superConstructor` будет доступен через `constructor.super_` имущество.

```js
const util = require('util');
const EventEmitter = require('events');

function MyStream() {
  EventEmitter.call(this);
}

util.inherits(MyStream, EventEmitter);

MyStream.prototype.write = function (data) {
  this.emit('data', data);
};

const stream = new MyStream();

console.log(stream instanceof EventEmitter); // true
console.log(MyStream.super_ === EventEmitter); // true

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('It works!'); // Received data: "It works!"
```

Пример ES6 с использованием `class` а также `extends`:

```js
const EventEmitter = require('events');

class MyStream extends EventEmitter {
  write(data) {
    this.emit('data', data);
  }
}

const stream = new MyStream();

stream.on('data', (data) => {
  console.log(`Received data: "${data}"`);
});
stream.write('With ES6');
```

## `util.inspect(object[, options])`

## `util.inspect(object[, showHidden[, depth[, colors]]])`

<!-- YAML
added: v0.3.0
changes:
  - version:
    - v14.6.0
    - v12.19.0
    pr-url: https://github.com/nodejs/node/pull/33690
    description: If `object` is from a different `vm.Context` now, a custom
                 inspection function on it will not receive context-specific
                 arguments anymore.
  - version:
     - v13.13.0
     - v12.17.0
    pr-url: https://github.com/nodejs/node/pull/32392
    description: The `maxStringLength` option is supported now.
  - version:
     - v13.5.0
     - v12.16.0
    pr-url: https://github.com/nodejs/node/pull/30768
    description: User defined prototype properties are inspected in case
                 `showHidden` is `true`.
  - version: v13.0.0
    pr-url: https://github.com/nodejs/node/pull/27685
    description: Circular references now include a marker to the reference.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/27109
    description: The `compact` options default is changed to `3` and the
                 `breakLength` options default is changed to `80`.
  - version: v12.0.0
    pr-url: https://github.com/nodejs/node/pull/24971
    description: Internal properties no longer appear in the context argument
                 of a custom inspection function.
  - version: v11.11.0
    pr-url: https://github.com/nodejs/node/pull/26269
    description: The `compact` option accepts numbers for a new output mode.
  - version: v11.7.0
    pr-url: https://github.com/nodejs/node/pull/25006
    description: ArrayBuffers now also show their binary contents.
  - version: v11.5.0
    pr-url: https://github.com/nodejs/node/pull/24852
    description: The `getters` option is supported now.
  - version: v11.4.0
    pr-url: https://github.com/nodejs/node/pull/24326
    description: The `depth` default changed back to `2`.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22846
    description: The `depth` default changed to `20`.
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22756
    description: The inspection output is now limited to about 128 MB. Data
                 above that size will not be fully inspected.
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/22788
    description: The `sorted` option is supported now.
  - version: v10.6.0
    pr-url: https://github.com/nodejs/node/pull/20725
    description: Inspecting linked lists and similar objects is now possible
                 up to the maximum call stack size.
  - version: v10.0.0
    pr-url: https://github.com/nodejs/node/pull/19259
    description: The `WeakMap` and `WeakSet` entries can now be inspected
                 as well.
  - version: v9.9.0
    pr-url: https://github.com/nodejs/node/pull/17576
    description: The `compact` option is supported now.
  - version: v6.6.0
    pr-url: https://github.com/nodejs/node/pull/8174
    description: Custom inspection functions can now return `this`.
  - version: v6.3.0
    pr-url: https://github.com/nodejs/node/pull/7499
    description: The `breakLength` option is supported now.
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/6334
    description: The `maxArrayLength` option is supported now; in particular,
                 long arrays are truncated by default.
  - version: v6.1.0
    pr-url: https://github.com/nodejs/node/pull/6465
    description: The `showProxy` option is supported now.
-->

- `object` {any} Любой примитив JavaScript или `Object`.
- `options` {Объект}
  - `showHidden` {boolean} Если `true`, `object`неперечислимые символы и свойства включаются в форматированный результат. [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) а также [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) записи также включены, а также определенные пользователем свойства прототипа (за исключением свойств метода). **Дефолт:** `false`.
  - `depth` {number} Задает количество повторений при форматировании. `object`. Это полезно для осмотра больших объектов. Для рекурсии до максимального размера стека вызовов пройдите `Infinity` или `null`. **Дефолт:** `2`.
  - `colors` {boolean} Если `true`, вывод оформлен с использованием цветовых кодов ANSI. Цвета настраиваются. Видеть [Настройка `util.inspect` цвета](#customizing-utilinspect-colors). **Дефолт:** `false`.
  - `customInspect` {boolean} Если `false`, `[util.inspect.custom](depth, opts)` функции не вызываются. **Дефолт:** `true`.
  - `showProxy` {boolean} Если `true`, `Proxy` инспекция включает [`target` а также `handler`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#Terminology) объекты. **Дефолт:** `false`.
  - `maxArrayLength` {integer} Задает максимальное количество `Array`, [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) а также [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) элементы для включения при форматировании. Установлен в `null` или `Infinity` показать все элементы. Установлен в `0` или отрицательный, чтобы не отображать элементы. **Дефолт:** `100`.
  - `maxStringLength` {целое число} Задает максимальное количество символов, включаемых при форматировании. Установлен в `null` или `Infinity` показать все элементы. Установлен в `0` или отрицательный, чтобы не отображать символы. **Дефолт:** `10000`.
  - `breakLength` {integer} Длина, по которой входные значения разделяются на несколько строк. Установлен в `Infinity` для форматирования ввода как одной строки (в сочетании с `compact` установлен в `true` или любое число> = `1`). **Дефолт:** `80`.
  - `compact` {boolean | integer} Установка этого значения на `false` заставляет каждый ключ объекта отображаться в новой строке. Он будет разбиваться на новые строки в тексте, длина которого превышает `breakLength`. Если установлено число, наиболее `n` внутренние элементы объединяются в одну строку, пока все свойства умещаются в `breakLength`. Короткие элементы массива также группируются вместе. Для получения дополнительной информации см. Пример ниже. **Дефолт:** `3`.
  - `sorted` {boolean | Function} Если установлено значение `true` или функция, все свойства объекта и `Set` а также `Map` записи сортируются в результирующей строке. Если установлено на `true` в [сортировка по умолчанию](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) используется. Если задано как функция, оно используется как [функция сравнения](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Parameters).
  - `getters` {boolean | string} Если установлено значение `true`, проверяются геттеры. Если установлено на `'get'`, проверяются только геттеры без соответствующего сеттера. Если установлено на `'set'`, проверяются только геттеры с соответствующим сеттером. Это может вызвать побочные эффекты в зависимости от функции получения. **Дефолт:** `false`.
- Возвращает: {строка} представление `object`.

В `util.inspect()` метод возвращает строковое представление `object` который предназначен для отладки. Выход `util.inspect` могут измениться в любое время и не должны зависеть от программных средств. Дополнительный `options` могут быть переданы, что изменит результат. `util.inspect()` будет использовать имя конструктора и / или `@@toStringTag` для создания идентифицируемого тега для проверяемого значения.

```js
class Foo {
  get [Symbol.toStringTag]() {
    return 'bar';
  }
}

class Bar {}

const baz = Object.create(null, {
  [Symbol.toStringTag]: { value: 'foo' },
});

util.inspect(new Foo()); // 'Foo [bar] {}'
util.inspect(new Bar()); // 'Bar {}'
util.inspect(baz); // '[foo] {}'
```

Круговые ссылки указывают на их якорь с помощью ссылочного индекса:

```js
const { inspect } = require('util');

const obj = {};
obj.a = [obj];
obj.b = {};
obj.b.inner = obj.b;
obj.b.obj = obj;

console.log(inspect(obj));
// <ref *1> {
//   a: [ [Circular *1] ],
//   b: <ref *2> { inner: [Circular *2], obj: [Circular *1] }
// }
```

В следующем примере проверяются все свойства `util` объект:

```js
const util = require('util');

console.log(
  util.inspect(util, { showHidden: true, depth: null })
);
```

В следующем примере подчеркивается эффект `compact` вариант:

```js
const util = require('util');

const o = {
  a: [
    1,
    2,
    [
      [
        'Lorem ipsum dolor sit amet,\nconsectetur adipiscing elit, sed do ' +
          'eiusmod \ntempor incididunt ut labore et dolore magna aliqua.',
        'test',
        'foo',
      ],
    ],
    4,
  ],
  b: new Map([
    ['za', 1],
    ['zb', 'test'],
  ]),
};
console.log(
  util.inspect(o, {
    compact: true,
    depth: 5,
    breakLength: 80,
  })
);

// { a:
//   [ 1,
//     2,
//     [ [ 'Lorem ipsum dolor sit amet,\nconsectetur [...]', // A long line
//           'test',
//           'foo' ] ],
//     4 ],
//   b: Map(2) { 'za' => 1, 'zb' => 'test' } }

// Setting `compact` to false or an integer creates more reader friendly output.
console.log(
  util.inspect(o, {
    compact: false,
    depth: 5,
    breakLength: 80,
  })
);

// {
//   a: [
//     1,
//     2,
//     [
//       [
//         'Lorem ipsum dolor sit amet,\n' +
//           'consectetur adipiscing elit, sed do eiusmod \n' +
//           'tempor incididunt ut labore et dolore magna aliqua.',
//         'test',
//         'foo'
//       ]
//     ],
//     4
//   ],
//   b: Map(2) {
//     'za' => 1,
//     'zb' => 'test'
//   }
// }

// Setting `breakLength` to e.g. 150 will print the "Lorem ipsum" text in a
// single line.
```

В `showHidden` опция позволяет [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) а также [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) записи, подлежащие проверке. Если записей больше, чем `maxArrayLength`, нет гарантии, какие записи будут отображаться. Это означает получение того же [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) записи дважды могут привести к разному результату. Более того, записи, в которых не осталось сильных ссылок, могут быть в любой момент удалены сборщиком мусора.

```js
const { inspect } = require('util');

const obj = { a: 1 };
const obj2 = { b: 2 };
const weakSet = new WeakSet([obj, obj2]);

console.log(inspect(weakSet, { showHidden: true }));
// WeakSet { { a: 1 }, { b: 2 } }
```

В `sorted` опция гарантирует, что порядок вставки свойства объекта не влияет на результат `util.inspect()`.

```js
const { inspect } = require('util');
const assert = require('assert');

const o1 = {
  b: [2, 3, 1],
  a: '`a` comes before `b`',
  c: new Set([2, 3, 1]),
};
console.log(inspect(o1, { sorted: true }));
// { a: '`a` comes before `b`', b: [ 2, 3, 1 ], c: Set(3) { 1, 2, 3 } }
console.log(
  inspect(o1, { sorted: (a, b) => b.localeCompare(a) })
);
// { c: Set(3) { 3, 2, 1 }, b: [ 2, 3, 1 ], a: '`a` comes before `b`' }

const o2 = {
  c: new Set([2, 1, 3]),
  a: '`a` comes before `b`',
  b: [2, 3, 1],
};
assert.strict.equal(
  inspect(o1, { sorted: true }),
  inspect(o2, { sorted: true })
);
```

`util.inspect()` это синхронный метод, предназначенный для отладки. Его максимальная выходная длина составляет примерно 128 МБ. Входные данные, которые приводят к более длительному выходу, будут усечены.

### Настройка `util.inspect` цвета

<!-- type=misc -->

Цветной вывод (если включен) `util.inspect` настраивается глобально через `util.inspect.styles` а также `util.inspect.colors` характеристики.

`util.inspect.styles` это карта, связывающая имя стиля с цветом из `util.inspect.colors`.

Стили по умолчанию и связанные цвета:

- `bigint`: `yellow`
- `boolean`: `yellow`
- `date`: `magenta`
- `module`: `underline`
- `name`: (без стилей)
- `null`: `bold`
- `number`: `yellow`
- `regexp`: `red`
- `special`: `cyan` (например., `Proxies`)
- `string`: `green`
- `symbol`: `green`
- `undefined`: `grey`

Для стилей цвета используются управляющие коды ANSI, которые могут поддерживаться не на всех терминалах. Для проверки поддержки цвета используйте [`tty.hasColors()`](tty.md#writestreamhascolorscount-env).

Предварительно определенные коды управления перечислены ниже (сгруппированы как «Модификаторы», «Цвета переднего плана» и «Цвета фона»).

#### Модификаторы

Поддержка модификаторов различается для разных терминалов. В большинстве случаев они будут игнорироваться, если не поддерживаться.

- `reset` - Сбрасывает все (цвет) модификаторы до значений по умолчанию
- **жирный** - Сделайте текст жирным
- _курсив_ - Сделать текст курсивом
- <span style="border-bottom: 1px;">подчеркивать</span> - Сделать текст подчеркнутым
- \~~ strikethrough ~~ - переносит горизонтальную линию через центр текста (псевдоним: `strikeThrough`, `crossedout`, `crossedOut`)
- `hidden` - Печатает текст, но делает его невидимым (Псевдоним: скрыть)
- <span style="opacity: 0.5;">тусклый</span> - Снижение интенсивности цвета (Псевдоним: `faint`)
- <span style="border-top: 1px">подчеркнутый</span> - Сделать текст наложенным
- мигает - скрывает и показывает текст через интервал
- <span style="filter: invert(100%)">обратный</span> - Поменять местами цвета переднего плана и фона (Псевдоним: `swapcolors`, `swapColors`)
- <span style="border-bottom: 1px double;">двойное подчеркивание</span> - Сделайте текст двойным подчеркиванием (Псевдоним: `doubleUnderline`)
- <span style="border: 1px">обрамленный</span> - Нарисуйте рамку вокруг текста

#### Цвета переднего плана

- `black`
- `red`
- `green`
- `yellow`
- `blue`
- `magenta`
- `cyan`
- `white`
- `gray` (псевдоним: `grey`, `blackBright`)
- `redBright`
- `greenBright`
- `yellowBright`
- `blueBright`
- `magentaBright`
- `cyanBright`
- `whiteBright`

#### Цвет фона

- `bgBlack`
- `bgRed`
- `bgGreen`
- `bgYellow`
- `bgBlue`
- `bgMagenta`
- `bgCyan`
- `bgWhite`
- `bgGray` (псевдоним: `bgGrey`, `bgBlackBright`)
- `bgRedBright`
- `bgGreenBright`
- `bgYellowBright`
- `bgBlueBright`
- `bgMagentaBright`
- `bgCyanBright`
- `bgWhiteBright`

### Пользовательские функции проверки объектов

<!-- type=misc -->

Объекты также могут определять свои собственные [`[util.inspect.custom](depth, opts)`](#utilinspectcustom) функция, которая `util.inspect()` будет вызывать и использовать результат при проверке объекта:

```js
const util = require('util');

class Box {
  constructor(value) {
    this.value = value;
  }

  [util.inspect.custom](depth, options) {
    if (depth < 0) {
      return options.stylize('[Box]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth:
        options.depth === null ? null : options.depth - 1,
    });

    // Five space padding because that's the size of "Box< ".
    const padding = ' '.repeat(5);
    const inner = util
      .inspect(this.value, newOptions)
      .replace(/\n/g, `\n${padding}`);
    return `${options.stylize(
      'Box',
      'special'
    )}< ${inner} >`;
  }
}

const box = new Box(true);

util.inspect(box);
// Returns: "Box< true >"
```

Обычай `[util.inspect.custom](depth, opts)` функции обычно возвращают строку, но могут возвращать значение любого типа, которое будет отформатировано соответствующим образом `util.inspect()`.

```js
const util = require('util');

const obj = {
  foo: 'this will not show up in the inspect() output',
};
obj[util.inspect.custom] = (depth) => {
  return { bar: 'baz' };
};

util.inspect(obj);
// Returns: "{ bar: 'baz' }"
```

### `util.inspect.custom`

<!-- YAML
added: v6.6.0
changes:
  - version: v10.12.0
    pr-url: https://github.com/nodejs/node/pull/20857
    description: This is now defined as a shared symbol.
-->

- {символ}, который можно использовать для объявления пользовательских функций проверки.

Помимо того, что они доступны через `util.inspect.custom`, этот символ [зарегистрирован во всем мире](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for) и может быть доступен в любой среде как `Symbol.for('nodejs.util.inspect.custom')`.

```js
const inspect = Symbol.for('nodejs.util.inspect.custom');

class Password {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return 'xxxxxxxx';
  }

  [inspect]() {
    return `Password <${this.toString()}>`;
  }
}

const password = new Password('r0sebud');
console.log(password);
// Prints Password <xxxxxxxx>
```

Видеть [Пользовательские функции проверки объектов]() Больше подробностей.

### `util.inspect.defaultOptions`

<!-- YAML
added: v6.4.0
-->

В `defaultOptions` значение позволяет настроить параметры по умолчанию, используемые `util.inspect`. Это полезно для таких функций, как `console.log` или `util.format` которые неявно вызывают `util.inspect`. Он должен быть установлен в объект, содержащий один или несколько действительных [`util.inspect()`](#utilinspectobject-options) параметры. Также поддерживается прямая установка свойств параметра.

```js
const util = require('util');
const arr = Array(101).fill(0);

console.log(arr); // Logs the truncated array
util.inspect.defaultOptions.maxArrayLength = null;
console.log(arr); // logs the full array
```

## `util.isDeepStrictEqual(val1, val2)`

<!-- YAML
added: v9.0.0
-->

- `val1` {любой}
- `val2` {любой}
- Возвращает: {логическое}

Возврат `true` если существует глубокое строгое равенство между `val1` а также `val2`. В противном случае возвращается `false`.

Видеть [`assert.deepStrictEqual()`](assert.md#assertdeepstrictequalactual-expected-message) для получения дополнительной информации о глубоком строгом равенстве.

## `util.promisify(original)`

<!-- YAML
added: v8.0.0
-->

- `original` {Функция}
- Возвращает: {Функция}

Принимает функцию, соответствующую общему стилю обратного вызова при первой ошибке, т. Е. Принимает `(err, value) => ...` обратный вызов в качестве последнего аргумента и возвращает версию, которая возвращает обещания.

```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);
stat('.')
  .then((stats) => {
    // Do something with `stats`
  })
  .catch((error) => {
    // Handle the error.
  });
```

Или, что то же самое, используя `async function`s:

```js
const util = require('util');
const fs = require('fs');

const stat = util.promisify(fs.stat);

async function callStat() {
  const stats = await stat('.');
  console.log(`This directory is owned by ${stats.uid}`);
}
```

Если есть `original[util.promisify.custom]` недвижимость присутствует, `promisify` вернет свое значение, см. [Пользовательские обещанные функции](#custom-promisified-functions).

`promisify()` предполагает, что `original` - это функция, которая во всех случаях принимает обратный вызов в качестве последнего аргумента. Если `original` не функция, `promisify()` выдаст ошибку. Если `original` является функцией, но ее последний аргумент не является обратным вызовом с первым ошибкой, ему все равно будет передан обратный вызов с ошибкой в качестве последнего аргумента.

С использованием `promisify()` на методах класса или других методах, которые используют `this` может работать не так, как ожидалось, если не обрабатывать специально:

```js
const util = require('util');

class Foo {
  constructor() {
    this.a = 42;
  }

  bar(callback) {
    callback(null, this.a);
  }
}

const foo = new Foo();

const naiveBar = util.promisify(foo.bar);
// TypeError: Cannot read property 'a' of undefined
// naiveBar().then(a => console.log(a));

naiveBar.call(foo).then((a) => console.log(a)); // '42'

const bindBar = naiveBar.bind(foo);
bindBar().then((a) => console.log(a)); // '42'
```

### Пользовательские обещанные функции

С помощью `util.promisify.custom` символ можно переопределить возвращаемое значение [`util.promisify()`](#utilpromisifyoriginal):

```js
const util = require('util');

function doSomething(foo, callback) {
  // ...
}

doSomething[util.promisify.custom] = (foo) => {
  return getPromiseSomehow();
};

const promisified = util.promisify(doSomething);
console.log(
  promisified === doSomething[util.promisify.custom]
);
// prints 'true'
```

Это может быть полезно в случаях, когда исходная функция не следует стандартному формату, в котором обратный вызов с ошибкой используется в качестве последнего аргумента.

Например, с функцией, которая принимает `(foo, onSuccessCallback, onErrorCallback)`:

```js
doSomething[util.promisify.custom] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```

Если `promisify.custom` определено, но не является функцией, `promisify()` выдаст ошибку.

### `util.promisify.custom`

<!-- YAML
added: v8.0.0
changes:
  - version:
      - v13.12.0
      - v12.16.2
    pr-url: https://github.com/nodejs/node/pull/31672
    description: This is now defined as a shared symbol.
-->

- {символ}, который можно использовать для объявления пользовательских обещанных вариантов функций, см. [Пользовательские обещанные функции](#custom-promisified-functions).

Помимо того, что они доступны через `util.promisify.custom`, этот символ [зарегистрирован во всем мире](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for) и может быть доступен в любой среде как `Symbol.for('nodejs.util.promisify.custom')`.

Например, с функцией, которая принимает `(foo, onSuccessCallback, onErrorCallback)`:

```js
const kCustomPromisifiedSymbol = Symbol.for(
  'nodejs.util.promisify.custom'
);

doSomething[kCustomPromisifiedSymbol] = (foo) => {
  return new Promise((resolve, reject) => {
    doSomething(foo, resolve, reject);
  });
};
```

## `util.stripVTControlCharacters(str)`

<!-- YAML
added: REPLACEME
-->

- `str` {нить}
- Возвращает: {строка}

Возврат `str` с удаленными escape-кодами ANSI.

```js
console.log(
  util.stripVTControlCharacters('\u001B[4mvalue\u001B[0m')
);
// Prints "value"
```

## Класс: `util.TextDecoder`

<!-- YAML
added: v8.3.0
-->

Реализация [Стандарт кодирования WHATWG](https://encoding.spec.whatwg.org/) `TextDecoder` API.

```js
const decoder = new TextDecoder('shift_jis');
let string = '';
let buffer;
while ((buffer = getNextChunkSomehow())) {
  string += decoder.decode(buffer, { stream: true });
}
string += decoder.decode(); // end-of-stream
```

### WHATWG поддерживает кодировки

По [Стандарт кодирования WHATWG](https://encoding.spec.whatwg.org/), кодировки, поддерживаемые `TextDecoder` API описаны в таблицах ниже. Для каждого кодирования можно использовать один или несколько псевдонимов.

Различные конфигурации сборки Node.js поддерживают разные наборы кодировок. (видеть [Интернационализация](intl.md))

#### Кодировки, поддерживаемые по умолчанию (с полными данными ICU)

| Кодирование | Псевдонимы | | ----------------- | -------------------------------- | | `'ibm866'` | `'866'`, `'cp866'`, `'csibm866'` | | `'iso-8859-2'` | `'csisolatin2'`, `'iso-ir-101'`, `'iso8859-2'`, `'iso88592'`, `'iso_8859-2'`, `'iso_8859-2:1987'`, `'l2'`, `'latin2'` | | `'iso-8859-3'` | `'csisolatin3'`, `'iso-ir-109'`, `'iso8859-3'`, `'iso88593'`, `'iso_8859-3'`, `'iso_8859-3:1988'`, `'l3'`, `'latin3'` | | `'iso-8859-4'` | `'csisolatin4'`, `'iso-ir-110'`, `'iso8859-4'`, `'iso88594'`, `'iso_8859-4'`, `'iso_8859-4:1988'`, `'l4'`, `'latin4'` | | `'iso-8859-5'` | `'csisolatincyrillic'`, `'cyrillic'`, `'iso-ir-144'`, `'iso8859-5'`, `'iso88595'`, `'iso_8859-5'`, `'iso_8859-5:1988'` | | `'iso-8859-6'` | `'arabic'`, `'asmo-708'`, `'csiso88596e'`, `'csiso88596i'`, `'csisolatinarabic'`, `'ecma-114'`, `'iso-8859-6-e'`, `'iso-8859-6-i'`, `'iso-ir-127'`, `'iso8859-6'`, `'iso88596'`, `'iso_8859-6'`, `'iso_8859-6:1987'` | | `'iso-8859-7'` | `'csisolatingreek'`, `'ecma-118'`, `'elot_928'`, `'greek'`, `'greek8'`, `'iso-ir-126'`, `'iso8859-7'`, `'iso88597'`, `'iso_8859-7'`, `'iso_8859-7:1987'`, `'sun_eu_greek'` | | `'iso-8859-8'` | `'csiso88598e'`, `'csisolatinhebrew'`, `'hebrew'`, `'iso-8859-8-e'`, `'iso-ir-138'`, `'iso8859-8'`, `'iso88598'`, `'iso_8859-8'`, `'iso_8859-8:1988'`, `'visual'` | | `'iso-8859-8-i'` | `'csiso88598i'`, `'logical'` | | `'iso-8859-10'` | `'csisolatin6'`, `'iso-ir-157'`, `'iso8859-10'`, `'iso885910'`, `'l6'`, `'latin6'` | | `'iso-8859-13'` | `'iso8859-13'`, `'iso885913'` | | `'iso-8859-14'` | `'iso8859-14'`, `'iso885914'` | | `'iso-8859-15'` | `'csisolatin9'`, `'iso8859-15'`, `'iso885915'`, `'iso_8859-15'`, `'l9'` | | `'koi8-r'` | `'cskoi8r'`, `'koi'`, `'koi8'`, `'koi8_r'` | | `'koi8-u'` | `'koi8-ru'` | | `'macintosh'` | `'csmacintosh'`, `'mac'`, `'x-mac-roman'` | | `'windows-874'` | `'dos-874'`, `'iso-8859-11'`, `'iso8859-11'`, `'iso885911'`, `'tis-620'` | | `'windows-1250'` | `'cp1250'`, `'x-cp1250'` | | `'windows-1251'` | `'cp1251'`, `'x-cp1251'` | | `'windows-1252'` | `'ansi_x3.4-1968'`, `'ascii'`, `'cp1252'`, `'cp819'`, `'csisolatin1'`, `'ibm819'`, `'iso-8859-1'`, `'iso-ir-100'`, `'iso8859-1'`, `'iso88591'`, `'iso_8859-1'`, `'iso_8859-1:1987'`, `'l1'`, `'latin1'`, `'us-ascii'`, `'x-cp1252'` | | `'windows-1253'` | `'cp1253'`, `'x-cp1253'` | | `'windows-1254'` | `'cp1254'`, `'csisolatin5'`, `'iso-8859-9'`, `'iso-ir-148'`, `'iso8859-9'`, `'iso88599'`, `'iso_8859-9'`, `'iso_8859-9:1989'`, `'l5'`, `'latin5'`, `'x-cp1254'` | | `'windows-1255'` | `'cp1255'`, `'x-cp1255'` | | `'windows-1256'` | `'cp1256'`, `'x-cp1256'` | | `'windows-1257'` | `'cp1257'`, `'x-cp1257'` | | `'windows-1258'` | `'cp1258'`, `'x-cp1258'` | | `'x-mac-cyrillic'` | `'x-mac-ukrainian'` | | `'gbk'` | `'chinese'`, `'csgb2312'`, `'csiso58gb231280'`, `'gb2312'`, `'gb_2312'`, `'gb_2312-80'`, `'iso-ir-58'`, `'x-gbk'` | | `'gb18030'` | | | `'big5'` | `'big5-hkscs'`, `'cn-big5'`, `'csbig5'`, `'x-x-big5'` | | `'euc-jp'` | `'cseucpkdfmtjapanese'`, `'x-euc-jp'` | | `'iso-2022-jp'` | `'csiso2022jp'` | | `'shift_jis'` | `'csshiftjis'`, `'ms932'`, `'ms_kanji'`, `'shift-jis'`, `'sjis'`, `'windows-31j'`, `'x-sjis'` | | `'euc-kr'` | `'cseuckr'`, `'csksc56011987'`, `'iso-ir-149'`, `'korean'`, `'ks_c_5601-1987'`, `'ks_c_5601-1989'`, `'ksc5601'`, `'ksc_5601'`, `'windows-949'` |

#### Кодировки, поддерживаемые, когда Node.js построен с `small-icu` вариант

| Кодирование | Псевдонимы | | ----------- | ------------------------------- | | `'utf-8'` | `'unicode-1-1-utf-8'`, `'utf8'` | | `'utf-16le'` | `'utf-16'` | | `'utf-16be'` | |

#### Кодировки, поддерживаемые при отключенном ICU

| Кодирование | Псевдонимы | | ----------- | ------------------------------- | | `'utf-8'` | `'unicode-1-1-utf-8'`, `'utf8'` | | `'utf-16le'` | `'utf-16'` |

В `'iso-8859-16'` кодировка, указанная в [Стандарт кодирования WHATWG](https://encoding.spec.whatwg.org/) не поддерживается.

### `new TextDecoder([encoding[, options]])`

<!-- YAML
added: v8.3.0
changes:
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22281
    description: The class is now available on the global object.
-->

- `encoding` {строка} Обозначает `encoding` что это `TextDecoder` экземпляр поддерживает. **Дефолт:** `'utf-8'`.
- `options` {Объект}
  - `fatal` {логический} `true` если ошибки декодирования фатальны. Эта опция не поддерживается, когда ICU отключена (см. [Интернационализация](intl.md)). **Дефолт:** `false`.
  - `ignoreBOM` {boolean} Когда `true`, то `TextDecoder` будет включать метку порядка байтов в декодированный результат. Когда `false`, метка порядка байтов будет удалена из вывода. Эта опция используется только тогда, когда `encoding` является `'utf-8'`, `'utf-16be'` или `'utf-16le'`. **Дефолт:** `false`.

Создает новый `TextDecoder` пример. В `encoding` может указывать одну из поддерживаемых кодировок или псевдоним.

В `TextDecoder` class также доступен для глобального объекта.

### `textDecoder.decode([input[, options]])`

- `input` {ArrayBuffer | DataView | TypedArray} An `ArrayBuffer`, `DataView` или `TypedArray` экземпляр, содержащий закодированные данные.
- `options` {Объект}
  - `stream` {логический} `true` если ожидаются дополнительные порции данных. **Дефолт:** `false`.
- Возвращает: {строка}

Декодирует `input` и возвращает строку. Если `options.stream` является `true`, любые неполные последовательности байтов, встречающиеся в конце `input` буферизируются внутри и излучаются после следующего вызова `textDecoder.decode()`.

Если `textDecoder.fatal` является `true`, возникающие ошибки декодирования приведут к `TypeError` быть брошенным.

### `textDecoder.encoding`

- {нить}

Кодировка, поддерживаемая `TextDecoder` пример.

### `textDecoder.fatal`

- {логический}

Стоимость будет `true` если ошибки декодирования приводят к `TypeError` быть брошенным.

### `textDecoder.ignoreBOM`

- {логический}

Стоимость будет `true` если результат декодирования будет включать отметку порядка байтов.

## Класс: `util.TextEncoder`

<!-- YAML
added: v8.3.0
changes:
  - version: v11.0.0
    pr-url: https://github.com/nodejs/node/pull/22281
    description: The class is now available on the global object.
-->

Реализация [Стандарт кодирования WHATWG](https://encoding.spec.whatwg.org/) `TextEncoder` API. Все экземпляры `TextEncoder` поддерживает только кодировку UTF-8.

```js
const encoder = new TextEncoder();
const uint8array = encoder.encode('this is some data');
```

В `TextEncoder` class также доступен для глобального объекта.

### `textEncoder.encode([input])`

- `input` {строка} Текст для кодирования. **Дефолт:** пустая строка.
- Возвращает: {Uint8Array}

UTF-8 кодирует `input` строка и возвращает `Uint8Array` содержащий закодированные байты.

### `textEncoder.encodeInto(src, dest)`

- `src` {строка} Текст для кодирования.
- `dest` {Uint8Array} Массив для хранения результата кодирования.
- Возвращает: {Object}
  - `read` {number} Считанные единицы кода Unicode src.
  - `written` {number} Записанные байты UTF-8 в dest.

UTF-8 кодирует `src` строка к `dest` Uint8Array и возвращает объект, содержащий считанные единицы кода Unicode и записанные байты UTF-8.

```js
const encoder = new TextEncoder();
const src = 'this is some data';
const dest = new Uint8Array(10);
const { read, written } = encoder.encodeInto(src, dest);
```

### `textEncoder.encoding`

- {нить}

Кодировка, поддерживаемая `TextEncoder` пример. Всегда установлен на `'utf-8'`.

## `util.toUSVString(string)`

<!-- YAML
added:
  - v16.8.0
  - v14.18.0
-->

- `string` {нить}

Возвращает `string` после замены любых суррогатных кодовых точек (или, что эквивалентно, любых непарных суррогатных кодовых единиц) на «заменяющий символ» Unicode U + FFFD.

## `util.types`

<!-- YAML
added: v10.0.0
changes:
  - version: v15.3.0
    pr-url: https://github.com/nodejs/node/pull/34055
    description: Exposed as `require('util/types')`.
-->

`util.types` обеспечивает проверку типов для различных типов встроенных объектов. В отличие от `instanceof` или `Object.prototype.toString.call(value)`эти проверки не проверяют свойства объекта, доступные из JavaScript (например, их прототип), и обычно связаны с вызовом в C ++.

Результат обычно не дает никаких гарантий относительно того, какие свойства или поведение значение предоставляет в JavaScript. Они в первую очередь полезны для разработчиков аддонов, которые предпочитают выполнять проверку типов в JavaScript.

API доступен через `require('util').types` или `require('util/types')`.

### `util.types.isAnyArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) или [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) пример.

Смотрите также [`util.types.isArrayBuffer()`](#utiltypesisarraybuffervalue) а также [`util.types.isSharedArrayBuffer()`](#utiltypesissharedarraybuffervalue).

```js
util.types.isAnyArrayBuffer(new ArrayBuffer()); // Returns true
util.types.isAnyArrayBuffer(new SharedArrayBuffer()); // Returns true
```

### `util.types.isArrayBufferView(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является экземпляром одного из [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) представления, такие как объекты типизированного массива или [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView). Эквивалентно [`ArrayBuffer.isView()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView).

```js
util.types.isArrayBufferView(new Int8Array()); // true
util.types.isArrayBufferView(Buffer.from('hello world')); // true
util.types.isArrayBufferView(
  new DataView(new ArrayBuffer(16))
); // true
util.types.isArrayBufferView(new ArrayBuffer()); // false
```

### `util.types.isArgumentsObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является `arguments` объект.

<!-- eslint-disable prefer-rest-params -->

```js
function foo() {
  util.types.isArgumentsObject(arguments); // Returns true
}
```

### `util.types.isArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) пример. Это делает _нет_ включают [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) экземпляры. Обычно желательно протестировать и то, и другое; Видеть [`util.types.isAnyArrayBuffer()`](#utiltypesisanyarraybuffervalue) для этого.

```js
util.types.isArrayBuffer(new ArrayBuffer()); // Returns true
util.types.isArrayBuffer(new SharedArrayBuffer()); // Returns false
```

### `util.types.isAsyncFunction(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является [асинхронная функция](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function). Это только сообщает о том, что видит движок JavaScript; в частности, возвращаемое значение может не соответствовать исходному исходному коду, если использовался инструмент транспиляции.

```js
util.types.isAsyncFunction(function foo() {}); // Returns false
util.types.isAsyncFunction(async function foo() {}); // Returns true
```

### `util.types.isBigInt64Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение равно `BigInt64Array` пример.

```js
util.types.isBigInt64Array(new BigInt64Array()); // Returns true
util.types.isBigInt64Array(new BigUint64Array()); // Returns false
```

### `util.types.isBigUint64Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение равно `BigUint64Array` пример.

```js
util.types.isBigUint64Array(new BigInt64Array()); // Returns false
util.types.isBigUint64Array(new BigUint64Array()); // Returns true
```

### `util.types.isBooleanObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является логическим объектом, например создан `new Boolean()`.

```js
util.types.isBooleanObject(false); // Returns false
util.types.isBooleanObject(true); // Returns false
util.types.isBooleanObject(new Boolean(false)); // Returns true
util.types.isBooleanObject(new Boolean(true)); // Returns true
util.types.isBooleanObject(Boolean(false)); // Returns false
util.types.isBooleanObject(Boolean(true)); // Returns false
```

### `util.types.isBoxedPrimitive(value)`

<!-- YAML
added: v10.11.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение представляет собой какой-либо примитивный объект в штучной упаковке, например создан `new Boolean()`, `new String()` или `Object(Symbol())`.

Например:

```js
util.types.isBoxedPrimitive(false); // Returns false
util.types.isBoxedPrimitive(new Boolean(false)); // Returns true
util.types.isBoxedPrimitive(Symbol('foo')); // Returns false
util.types.isBoxedPrimitive(Object(Symbol('foo'))); // Returns true
util.types.isBoxedPrimitive(Object(BigInt(5))); // Returns true
```

### `util.types.isCryptoKey(value)`

<!-- YAML
added: v16.2.0
-->

- `value` {Объект}
- Возвращает: {логическое}

Возврат `true` если `value` это {CryptoKey}, `false` иначе.

### `util.types.isDataView(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) пример.

```js
const ab = new ArrayBuffer(20);
util.types.isDataView(new DataView(ab)); // Returns true
util.types.isDataView(new Float64Array()); // Returns false
```

Смотрите также [`ArrayBuffer.isView()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView).

### `util.types.isDate(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) пример.

```js
util.types.isDate(new Date()); // Returns true
```

### `util.types.isExternal(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является родным `External` ценить.

Уроженец `External` value - это особый тип объекта, который содержит необработанный указатель C ++ (`void*`) для доступа из собственного кода и не имеет других свойств. Такие объекты создаются либо внутренними компонентами Node.js, либо собственными надстройками. В JavaScript они [замороженный](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) объекты с `null` прототип.

```c
#include <js_native_api.h>
#include <stdlib.h>
napi_value result;
static napi_value MyNapi(napi_env env, napi_callback_info info) {
  int* raw = (int*) malloc(1024);
  napi_status status = napi_create_external(env, (void*) raw, NULL, NULL, &result);
  if (status != napi_ok) {
    napi_throw_error(env, NULL, "napi_create_external failed");
    return NULL;
  }
  return result;
}
...
DECLARE_NAPI_PROPERTY("myNapi", MyNapi)
...
```

```js
const native = require('napi_addon.node');
const data = native.myNapi();
util.types.isExternal(data); // returns true
util.types.isExternal(0); // returns false
util.types.isExternal(new String('foo')); // returns false
```

Для получения дополнительной информации о `napi_create_external`, Ссылаться на [`napi_create_external()`](n-api.md#napi_create_external).

### `util.types.isFloat32Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Float32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array) пример.

```js
util.types.isFloat32Array(new ArrayBuffer()); // Returns false
util.types.isFloat32Array(new Float32Array()); // Returns true
util.types.isFloat32Array(new Float64Array()); // Returns false
```

### `util.types.isFloat64Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Float64Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array) пример.

```js
util.types.isFloat64Array(new ArrayBuffer()); // Returns false
util.types.isFloat64Array(new Uint8Array()); // Returns false
util.types.isFloat64Array(new Float64Array()); // Returns true
```

### `util.types.isGeneratorFunction(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является функцией генератора. Это только сообщает о том, что видит движок JavaScript; в частности, возвращаемое значение может не соответствовать исходному исходному коду, если использовался инструмент транспиляции.

```js
util.types.isGeneratorFunction(function foo() {}); // Returns false
util.types.isGeneratorFunction(function* foo() {}); // Returns true
```

### `util.types.isGeneratorObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является объектом-генератором, возвращенным встроенной функцией-генератором. Это только сообщает о том, что видит движок JavaScript; в частности, возвращаемое значение может не соответствовать исходному исходному коду, если использовался инструмент транспиляции.

```js
function* foo() {}
const generator = foo();
util.types.isGeneratorObject(generator); // Returns true
```

### `util.types.isInt8Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Int8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int8Array) пример.

```js
util.types.isInt8Array(new ArrayBuffer()); // Returns false
util.types.isInt8Array(new Int8Array()); // Returns true
util.types.isInt8Array(new Float64Array()); // Returns false
```

### `util.types.isInt16Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Int16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int16Array) пример.

```js
util.types.isInt16Array(new ArrayBuffer()); // Returns false
util.types.isInt16Array(new Int16Array()); // Returns true
util.types.isInt16Array(new Float64Array()); // Returns false
```

### `util.types.isInt32Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Int32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array) пример.

```js
util.types.isInt32Array(new ArrayBuffer()); // Returns false
util.types.isInt32Array(new Int32Array()); // Returns true
util.types.isInt32Array(new Float64Array()); // Returns false
```

### `util.types.isKeyObject(value)`

<!-- YAML
added: v16.2.0
-->

- `value` {Объект}
- Возвращает: {логическое}

Возврат `true` если `value` это {KeyObject}, `false` иначе.

### `util.types.isMap(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) пример.

```js
util.types.isMap(new Map()); // Returns true
```

### `util.types.isMapIterator(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является итератором, возвращаемым для встроенного [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) пример.

```js
const map = new Map();
util.types.isMapIterator(map.keys()); // Returns true
util.types.isMapIterator(map.values()); // Returns true
util.types.isMapIterator(map.entries()); // Returns true
util.types.isMapIterator(map[Symbol.iterator]()); // Returns true
```

### `util.types.isModuleNamespaceObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является экземпляром [Объект пространства имен модуля](https://tc39.github.io/ecma262/#sec-module-namespace-exotic-objects).

<!-- eslint-skip -->

```js
import * as ns from './a.js';

util.types.isModuleNamespaceObject(ns); // Returns true
```

### `util.types.isNativeError(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является экземпляром встроенного [`Error`](errors.md#class-error) тип.

```js
util.types.isNativeError(new Error()); // Returns true
util.types.isNativeError(new TypeError()); // Returns true
util.types.isNativeError(new RangeError()); // Returns true
```

### `util.types.isNumberObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является числовым объектом, например создан `new Number()`.

```js
util.types.isNumberObject(0); // Returns false
util.types.isNumberObject(new Number(0)); // Returns true
```

### `util.types.isPromise(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```js
util.types.isPromise(Promise.resolve(42)); // Returns true
```

### `util.types.isProxy(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение равно [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) пример.

```js
const target = {};
const proxy = new Proxy(target, {});
util.types.isProxy(target); // Returns false
util.types.isProxy(proxy); // Returns true
```

### `util.types.isRegExp(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является объектом регулярного выражения.

```js
util.types.isRegExp(/abc/); // Returns true
util.types.isRegExp(new RegExp('abc')); // Returns true
```

### `util.types.isSet(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) пример.

```js
util.types.isSet(new Set()); // Returns true
```

### `util.types.isSetIterator(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является итератором, возвращаемым для встроенного [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) пример.

```js
const set = new Set();
util.types.isSetIterator(set.keys()); // Returns true
util.types.isSetIterator(set.values()); // Returns true
util.types.isSetIterator(set.entries()); // Returns true
util.types.isSetIterator(set[Symbol.iterator]()); // Returns true
```

### `util.types.isSharedArrayBuffer(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`SharedArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) пример. Это делает _нет_ включают [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) экземпляры. Обычно желательно протестировать и то, и другое; Видеть [`util.types.isAnyArrayBuffer()`](#utiltypesisanyarraybuffervalue) для этого.

```js
util.types.isSharedArrayBuffer(new ArrayBuffer()); // Returns false
util.types.isSharedArrayBuffer(new SharedArrayBuffer()); // Returns true
```

### `util.types.isStringObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является строковым объектом, например создан `new String()`.

```js
util.types.isStringObject('foo'); // Returns false
util.types.isStringObject(new String('foo')); // Returns true
```

### `util.types.isSymbolObject(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является объектом символа, созданным путем вызова `Object()` на `Symbol` примитивный.

```js
const symbol = Symbol('foo');
util.types.isSymbolObject(symbol); // Returns false
util.types.isSymbolObject(Object(symbol)); // Returns true
```

### `util.types.isTypedArray(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) пример.

```js
util.types.isTypedArray(new ArrayBuffer()); // Returns false
util.types.isTypedArray(new Uint8Array()); // Returns true
util.types.isTypedArray(new Float64Array()); // Returns true
```

Смотрите также [`ArrayBuffer.isView()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer/isView).

### `util.types.isUint8Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Uint8Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) пример.

```js
util.types.isUint8Array(new ArrayBuffer()); // Returns false
util.types.isUint8Array(new Uint8Array()); // Returns true
util.types.isUint8Array(new Float64Array()); // Returns false
```

### `util.types.isUint8ClampedArray(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Uint8ClampedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray) пример.

```js
util.types.isUint8ClampedArray(new ArrayBuffer()); // Returns false
util.types.isUint8ClampedArray(new Uint8ClampedArray()); // Returns true
util.types.isUint8ClampedArray(new Float64Array()); // Returns false
```

### `util.types.isUint16Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Uint16Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint16Array) пример.

```js
util.types.isUint16Array(new ArrayBuffer()); // Returns false
util.types.isUint16Array(new Uint16Array()); // Returns true
util.types.isUint16Array(new Float64Array()); // Returns false
```

### `util.types.isUint32Array(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`Uint32Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint32Array) пример.

```js
util.types.isUint32Array(new ArrayBuffer()); // Returns false
util.types.isUint32Array(new Uint32Array()); // Returns true
util.types.isUint32Array(new Float64Array()); // Returns false
```

### `util.types.isWeakMap(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`WeakMap`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) пример.

```js
util.types.isWeakMap(new WeakMap()); // Returns true
```

### `util.types.isWeakSet(value)`

<!-- YAML
added: v10.0.0
-->

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`WeakSet`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet) пример.

```js
util.types.isWeakSet(new WeakSet()); // Returns true
```

### `util.types.isWebAssemblyCompiledModule(value)`

<!-- YAML
added: v10.0.0
deprecated: v14.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `value instanceof WebAssembly.Module` вместо.

- `value` {любой}
- Возвращает: {логическое}

Возврат `true` если значение является встроенным [`WebAssembly.Module`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/Module) пример.

```js
const module = new WebAssembly.Module(wasmBuffer);
util.types.isWebAssemblyCompiledModule(module); // Returns true
```

## Устаревшие API

Следующие API устарели и больше не должны использоваться. Существующие приложения и модули следует обновить, чтобы найти альтернативные подходы.

### `util._extend(target, source)`

<!-- YAML
added: v0.7.5
deprecated: v6.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Object.assign()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) вместо.

- `target` {Объект}
- `source` {Объект}

В `util._extend()` никогда не предназначался для использования вне внутренних модулей Node.js. Сообщество все равно нашло и использовало его.

Он устарел и не должен использоваться в новом коде. JavaScript имеет очень похожие встроенные функции благодаря [`Object.assign()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

### `util.isArray(object)`

<!-- YAML
added: v0.6.0
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Array.isArray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray) вместо.

- `object` {любой}
- Возвращает: {логическое}

Псевдоним для [`Array.isArray()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray).

Возврат `true` если данный `object` является `Array`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isArray([]);
// Returns: true
util.isArray(new Array());
// Returns: true
util.isArray({});
// Returns: false
```

### `util.isBoolean(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `typeof value === 'boolean'` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `Boolean`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isBoolean(1);
// Returns: false
util.isBoolean(0);
// Returns: false
util.isBoolean(false);
// Returns: true
```

### `util.isBuffer(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`Buffer.isBuffer()`](buffer.md#static-method-bufferisbufferobj) вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `Buffer`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isBuffer({ length: 0 });
// Returns: false
util.isBuffer([]);
// Returns: false
util.isBuffer(Buffer.from('hello world'));
// Returns: true
```

### `util.isDate(object)`

<!-- YAML
added: v0.6.0
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`util.types.isDate()`](#utiltypesisdatevalue) вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `Date`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isDate(new Date());
// Returns: true
util.isDate(Date());
// false (without 'new' returns a String)
util.isDate({});
// Returns: false
```

### `util.isError(object)`

<!-- YAML
added: v0.6.0
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать [`util.types.isNativeError()`](#utiltypesisnativeerrorvalue) вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` является [`Error`](errors.md#class-error). В противном случае возвращается `false`.

```js
const util = require('util');

util.isError(new Error());
// Returns: true
util.isError(new TypeError());
// Returns: true
util.isError({
  name: 'Error',
  message: 'an error occurred',
});
// Returns: false
```

Этот метод основан на `Object.prototype.toString()` поведение. Возможно получение неверного результата, если `object` аргумент манипулирует `@@toStringTag`.

```js
const util = require('util');
const obj = { name: 'Error', message: 'an error occurred' };

util.isError(obj);
// Returns: false
obj[Symbol.toStringTag] = 'Error';
util.isError(obj);
// Returns: true
```

### `util.isFunction(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `typeof value === 'function'` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `Function`. В противном случае возвращается `false`.

```js
const util = require('util');

function Foo() {}
const Bar = () => {};

util.isFunction({});
// Returns: false
util.isFunction(Foo);
// Returns: true
util.isFunction(Bar);
// Returns: true
```

### `util.isNull(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `value === null` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` строго `null`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isNull(0);
// Returns: false
util.isNull(undefined);
// Returns: false
util.isNull(null);
// Returns: true
```

### `util.isNullOrUndefined(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `value === undefined || value === null` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` является `null` или `undefined`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isNullOrUndefined(0);
// Returns: false
util.isNullOrUndefined(undefined);
// Returns: true
util.isNullOrUndefined(null);
// Returns: true
```

### `util.isNumber(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `typeof value === 'number'` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `Number`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isNumber(false);
// Returns: false
util.isNumber(Infinity);
// Returns: true
util.isNumber(0);
// Returns: true
util.isNumber(NaN);
// Returns: true
```

### `util.isObject(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `value !== null && typeof value === 'object'` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` строго `Object` **а также** не `Function` (даже если функции являются объектами в JavaScript). В противном случае возвращается `false`.

```js
const util = require('util');

util.isObject(5);
// Returns: false
util.isObject(null);
// Returns: false
util.isObject({});
// Returns: true
util.isObject(() => {});
// Returns: false
```

### `util.isPrimitive(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `(typeof value !== 'object' && typeof value !== 'function') || value === null` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` примитивный тип. В противном случае возвращается `false`.

```js
const util = require('util');

util.isPrimitive(5);
// Returns: true
util.isPrimitive('foo');
// Returns: true
util.isPrimitive(false);
// Returns: true
util.isPrimitive(null);
// Returns: true
util.isPrimitive(undefined);
// Returns: true
util.isPrimitive({});
// Returns: false
util.isPrimitive(() => {});
// Returns: false
util.isPrimitive(/^$/);
// Returns: false
util.isPrimitive(new Date());
// Returns: false
```

### `util.isRegExp(object)`

<!-- YAML
added: v0.6.0
deprecated: v4.0.0
-->

> Стабильность: 0 - устарело

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `RegExp`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isRegExp(/some regexp/);
// Returns: true
util.isRegExp(new RegExp('another regexp'));
// Returns: true
util.isRegExp({});
// Returns: false
```

### `util.isString(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `typeof value === 'string'` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `string`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isString('');
// Returns: true
util.isString('foo');
// Returns: true
util.isString(String('foo'));
// Returns: true
util.isString(5);
// Returns: false
```

### `util.isSymbol(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `typeof value === 'symbol'` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` это `Symbol`. В противном случае возвращается `false`.

```js
const util = require('util');

util.isSymbol(5);
// Returns: false
util.isSymbol('foo');
// Returns: false
util.isSymbol(Symbol('foo'));
// Returns: true
```

### `util.isUndefined(object)`

<!-- YAML
added: v0.11.5
deprecated: v4.0.0
-->

> Стабильность: 0 - Не рекомендуется: использовать `value === undefined` вместо.

- `object` {любой}
- Возвращает: {логическое}

Возврат `true` если данный `object` является `undefined`. В противном случае возвращается `false`.

```js
const util = require('util');

const foo = undefined;
util.isUndefined(5);
// Returns: false
util.isUndefined(foo);
// Returns: true
util.isUndefined(null);
// Returns: false
```

### `util.log(string)`

<!-- YAML
added: v0.3.0
deprecated: v6.0.0
-->

> Стабильность: 0 - Не рекомендуется: вместо этого используйте сторонний модуль.

- `string` {нить}

В `util.log()` метод печатает данный `string` к `stdout` с включенной меткой времени.

```js
const util = require('util');

util.log('Timestamped message.');
```
